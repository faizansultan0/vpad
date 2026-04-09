const bcrypt = require("bcryptjs");
const { User, PendingSignup } = require("../models");
const { asyncHandler, AppError } = require("../middlewares");
const {
  generateTokens,
  generateOTP,
  generateVerificationToken,
  generatePasswordResetToken,
  hashToken,
  verifyRefreshToken,
} = require("../utils");
const { sendEmail, emailTemplates } = require("../config/email");

const SIGNUP_OTP_LENGTH = parseInt(process.env.SIGNUP_OTP_LENGTH || "6", 10);
const SIGNUP_OTP_EXPIRY_MS = parseInt(
  process.env.SIGNUP_OTP_EXPIRY_MS || "600000",
  10,
);
const SIGNUP_OTP_RESEND_COOLDOWN_MS = parseInt(
  process.env.SIGNUP_OTP_RESEND_COOLDOWN_MS || "30000",
  10,
);
const SIGNUP_OTP_MAX_ATTEMPTS = parseInt(
  process.env.SIGNUP_OTP_MAX_ATTEMPTS || "5",
  10,
);
const SIGNUP_OTP_LOCK_MS = parseInt(
  process.env.SIGNUP_OTP_LOCK_MS || "600000",
  10,
);
const PENDING_SIGNUP_TTL_MS = parseInt(
  process.env.PENDING_SIGNUP_TTL_MS || "86400000",
  10,
);

const generateFreshSignupOtp = (previousOtpHash) => {
  let otp = generateOTP(SIGNUP_OTP_LENGTH);
  let otpHash = hashToken(otp);
  let attempts = 0;

  while (previousOtpHash && otpHash === previousOtpHash && attempts < 5) {
    otp = generateOTP(SIGNUP_OTP_LENGTH);
    otpHash = hashToken(otp);
    attempts += 1;
  }

  return { otp, otpHash };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  const now = Date.now();
  const pendingSignup = await PendingSignup.findOne({ email: normalizedEmail });

  if (
    pendingSignup?.resendAvailableAt &&
    pendingSignup.resendAvailableAt.getTime() > now
  ) {
    const waitSeconds = Math.ceil(
      (pendingSignup.resendAvailableAt.getTime() - now) / 1000,
    );
    throw new AppError(
      `Please wait ${waitSeconds}s before requesting another code`,
      429,
    );
  }

  const { otp, otpHash } = generateFreshSignupOtp(pendingSignup?.otpHash);
  const otpExpiresAt = new Date(now + SIGNUP_OTP_EXPIRY_MS);
  const resendAvailableAt = new Date(now + SIGNUP_OTP_RESEND_COOLDOWN_MS);
  const expiresAt = new Date(now + PENDING_SIGNUP_TTL_MS);
  const passwordHash = await bcrypt.hash(password, 12);

  const template = emailTemplates.verifyEmailOtp(
    name,
    otp,
    Math.ceil(SIGNUP_OTP_EXPIRY_MS / 60000),
  );

  await sendEmail({
    to: normalizedEmail,
    ...template,
  });

  await PendingSignup.findOneAndUpdate(
    { email: normalizedEmail },
    {
      name,
      email: normalizedEmail,
      passwordHash,
      otpHash,
      otpExpiresAt,
      resendAvailableAt,
      failedAttempts: 0,
      lockedUntil: undefined,
      expiresAt,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  res.status(201).json({
    success: true,
    message:
      "Signup started. Enter the verification code sent to your email.",
    data: {
      email: normalizedEmail,
      otpLength: SIGNUP_OTP_LENGTH,
      expiresAt: otpExpiresAt,
      resendAvailableAt,
    },
  });
});

const verifySignupOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const pendingSignup = await PendingSignup.findOne({ email: normalizedEmail });
  if (!pendingSignup) {
    throw new AppError("No pending signup found for this email", 404);
  }

  const now = Date.now();

  if (pendingSignup.lockedUntil && pendingSignup.lockedUntil.getTime() > now) {
    const waitSeconds = Math.ceil((pendingSignup.lockedUntil.getTime() - now) / 1000);
    throw new AppError(
      `Too many incorrect attempts. Try again in ${waitSeconds}s`,
      429,
    );
  }

  if (pendingSignup.otpExpiresAt.getTime() <= now) {
    throw new AppError("Verification code expired. Please resend a new code", 400);
  }

  const submittedOtpHash = hashToken(String(otp));
  if (submittedOtpHash !== pendingSignup.otpHash) {
    pendingSignup.failedAttempts += 1;

    if (pendingSignup.failedAttempts >= SIGNUP_OTP_MAX_ATTEMPTS) {
      pendingSignup.lockedUntil = new Date(now + SIGNUP_OTP_LOCK_MS);
    }

    await pendingSignup.save();

    if (
      pendingSignup.lockedUntil &&
      pendingSignup.lockedUntil.getTime() > now
    ) {
      throw new AppError(
        "Too many incorrect attempts. Please request a new verification code",
        429,
      );
    }

    throw new AppError("Invalid verification code", 400);
  }

  const alreadyRegistered = await User.findOne({ email: normalizedEmail });
  if (alreadyRegistered) {
    await PendingSignup.deleteOne({ _id: pendingSignup._id });
    throw new AppError("Email already registered. Please login instead", 400);
  }

  const user = new User({
    name: pendingSignup.name,
    email: pendingSignup.email,
    password: pendingSignup.passwordHash,
    isEmailVerified: true,
  });

  user.$locals = { ...user.$locals, skipPasswordHash: true };
  await user.save();

  const tokens = generateTokens(user._id);
  user.refreshTokens.push({ token: tokens.refreshToken });
  user.lastLogin = new Date();
  await user.save();

  await PendingSignup.deleteOne({ _id: pendingSignup._id });

  res.json({
    success: true,
    message: "Email verified successfully",
    data: {
      user: user.toSafeObject(),
      ...tokens,
    },
  });
});

const resendSignupOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  const pendingSignup = await PendingSignup.findOne({ email: normalizedEmail });
  if (!pendingSignup) {
    throw new AppError("No pending signup found. Please sign up again", 404);
  }

  if (
    pendingSignup.resendAvailableAt &&
    pendingSignup.resendAvailableAt.getTime() > now
  ) {
    const waitSeconds = Math.ceil(
      (pendingSignup.resendAvailableAt.getTime() - now) / 1000,
    );
    throw new AppError(
      `Please wait ${waitSeconds}s before requesting another code`,
      429,
    );
  }

  const { otp, otpHash } = generateFreshSignupOtp(pendingSignup.otpHash);
  const otpExpiresAt = new Date(now + SIGNUP_OTP_EXPIRY_MS);
  const resendAvailableAt = new Date(now + SIGNUP_OTP_RESEND_COOLDOWN_MS);
  const expiresAt = new Date(now + PENDING_SIGNUP_TTL_MS);

  const template = emailTemplates.verifyEmailOtp(
    pendingSignup.name,
    otp,
    Math.ceil(SIGNUP_OTP_EXPIRY_MS / 60000),
  );

  await sendEmail({
    to: normalizedEmail,
    ...template,
  });

  pendingSignup.otpHash = otpHash;
  pendingSignup.otpExpiresAt = otpExpiresAt;
  pendingSignup.resendAvailableAt = resendAvailableAt;
  pendingSignup.failedAttempts = 0;
  pendingSignup.lockedUntil = undefined;
  pendingSignup.expiresAt = expiresAt;
  await pendingSignup.save();

  res.json({
    success: true,
    message: "Verification code sent",
    data: {
      email: normalizedEmail,
      otpLength: SIGNUP_OTP_LENGTH,
      expiresAt: otpExpiresAt,
      resendAvailableAt,
    },
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  const tokens = generateTokens(user._id);

  user.refreshTokens.push({ token: tokens.refreshToken });
  await user.save();

  res.json({
    success: true,
    message: "Email verified successfully",
    data: {
      user: user.toSafeObject(),
      ...tokens,
    },
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email already verified", 400);
  }

  const { token, hashedToken, expires } = generateVerificationToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = expires;
  await user.save();

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const template = emailTemplates.verifyEmail(user.name, verificationUrl);

  await sendEmail({
    to: email,
    ...template,
  });

  res.json({
    success: true,
    message: "Verification email sent",
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );
  if (!user) {
    const pendingSignup = await PendingSignup.findOne({ email: normalizedEmail });
    if (pendingSignup) {
      throw new AppError(
        "Please verify your email with the code sent to your inbox",
        401,
      );
    }
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account has been deactivated", 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 401);
  }

  const tokens = generateTokens(user._id);

  user.refreshTokens.push({ token: tokens.refreshToken });
  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toSafeObject(),
      ...tokens,
    },
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError("Refresh token required", 400);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const tokenExists = user.refreshTokens.some((rt) => rt.token === token);
  if (!tokenExists) {
    throw new AppError("Invalid refresh token", 401);
  }

  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);

  const tokens = generateTokens(user._id);
  user.refreshTokens.push({ token: tokens.refreshToken });
  await user.save();

  res.json({
    success: true,
    data: tokens,
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (token && req.user) {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (rt) => rt.token !== token
    );
    await req.user.save();
  }

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

const logoutAll = asyncHandler(async (req, res) => {
  req.user.refreshTokens = [];
  await req.user.save();

  res.json({
    success: true,
    message: "Logged out from all devices",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
      success: true,
      message: "If the email exists, a password reset link will be sent",
    });
  }

  const { token, hashedToken, expires } = generatePasswordResetToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expires;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const template = emailTemplates.resetPassword(user.name, resetUrl);

  await sendEmail({
    to: email,
    ...template,
  });

  res.json({
    success: true,
    message: "If the email exists, a password reset link will be sent",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful. Please login with your new password.",
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toSafeObject(),
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (preferences)
    updates.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: user.toSafeObject(),
    },
  });
});

const updateEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  const existingUser = await User.findOne({
    email,
    _id: { $ne: req.user._id },
  });
  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  const { token, hashedToken, expires } = generateVerificationToken();

  user.email = email;
  user.isEmailVerified = false;
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = expires;
  await user.save();

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const template = emailTemplates.verifyEmail(user.name, verificationUrl);

  await sendEmail({
    to: email,
    ...template,
  });

  res.json({
    success: true,
    message: "Email updated. Please verify your new email address.",
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();

  const tokens = generateTokens(user._id);
  user.refreshTokens.push({ token: tokens.refreshToken });
  await user.save();

  res.json({
    success: true,
    message: "Password updated successfully",
    data: tokens,
  });
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  const {
    uploadToCloudinary,
    deleteFromCloudinary,
  } = require("../config/cloudinary");

  if (!req.file) {
    throw new AppError("Please upload an image", 400);
  }

  if (req.user.profilePicture?.publicId) {
    await deleteFromCloudinary(req.user.profilePicture.publicId).catch(
      console.error
    );
  }

  const result = await uploadToCloudinary(req.file.buffer, "vpad/profiles");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: result },
    { new: true }
  );

  res.json({
    success: true,
    message: "Profile picture updated",
    data: {
      user: user.toSafeObject(),
    },
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  user.isActive = false;
  user.refreshTokens = [];
  await user.save();

  res.json({
    success: true,
    message: "Account deactivated successfully",
  });
});

module.exports = {
  register,
  verifySignupOtp,
  resendSignupOtp,
  verifyEmail,
  resendVerification,
  login,
  refreshToken,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  updateEmail,
  updatePassword,
  updateProfilePicture,
  deleteAccount,
};
