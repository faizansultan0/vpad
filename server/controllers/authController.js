const { User } = require("../models");
const { asyncHandler, AppError } = require("../middlewares");
const {
  generateTokens,
  generateVerificationToken,
  generatePasswordResetToken,
  hashToken,
  verifyRefreshToken,
} = require("../utils");
const { sendEmail, emailTemplates } = require("../config/email");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  const { token, hashedToken, expires } = generateVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: expires,
  });

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const template = emailTemplates.verifyEmail(name, verificationUrl);

  await sendEmail({
    to: email,
    ...template,
  });

  res.status(201).json({
    success: true,
    message:
      "Registration successful. Please check your email to verify your account.",
    data: {
      user: user.toSafeObject(),
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

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
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
