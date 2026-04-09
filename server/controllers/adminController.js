const crypto = require("crypto");
const {
  User,
  Note,
  Announcement,
  Institution,
  Semester,
  Subject,
  Comment,
  Notification,
} = require("../models");
const { asyncHandler, AppError } = require("../middlewares");
const { notificationService } = require("../services");
const { getPaginationInfo } = require("../utils");
const { sendEmail, emailTemplates } = require("../config/email");

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalNotes,
    sharedNotes,
    totalInstitutions,
    totalSubjects,
    recentUsers,
    recentNotes,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({
      role: "user",
      isActive: true,
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    Note.countDocuments(),
    Note.countDocuments({ "collaborators.0": { $exists: true } }),
    Institution.countDocuments(),
    Subject.countDocuments(),
    User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt isActive"),
    Note.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title user createdAt")
      .populate("user", "name"),
  ]);

  const userGrowth = await User.aggregate([
    { $match: { role: "user" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 30 },
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        activeUsers,
        totalNotes,
        sharedNotes,
        totalInstitutions,
        totalSubjects,
      },
      recentUsers,
      recentNotes,
      userGrowth: userGrowth.reverse(),
    },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const {
    search,
    role,
    isActive,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-refreshTokens -emailVerificationToken -passwordResetToken")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: getPaginationInfo(total, parseInt(page), parseInt(limit)),
    },
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-refreshTokens -emailVerificationToken -passwordResetToken",
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const [noteCount, institutionCount] = await Promise.all([
    Note.countDocuments({ user: user._id }),
    Institution.countDocuments({ user: user._id }),
  ]);

  res.json({
    success: true,
    data: {
      user,
      stats: { noteCount, institutionCount },
    },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role, permissions } = req.body;
  const updates = {};

  if (isActive !== undefined) updates.isActive = isActive;
  if (role && req.user.role === "superadmin") updates.role = role;
  if (permissions && req.user.role === "superadmin")
    updates.permissions = permissions;

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-refreshTokens -emailVerificationToken -passwordResetToken");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    message: "User updated",
    data: { user },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "superadmin") {
    throw new AppError("Cannot delete superadmin", 403);
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError("You cannot delete your own account", 403);
  }

  const userId = user._id;

  await Promise.all([
    User.findByIdAndDelete(userId),
    Institution.deleteMany({ user: userId }),
    Semester.deleteMany({ user: userId }),
    Subject.deleteMany({ user: userId }),
    Note.deleteMany({ user: userId }),
    Comment.deleteMany({ user: userId }),
    Announcement.deleteMany({ admin: userId }),
    Notification.deleteMany({
      $or: [{ recipient: userId }, { sender: userId }],
    }),
    Note.updateMany(
      { "collaborators.user": userId },
      { $pull: { collaborators: { user: userId } } },
    ),
    Note.updateMany(
      { "editHistory.user": userId },
      { $pull: { editHistory: { user: userId } } },
    ),
    Note.updateMany(
      { "quiz.attempts.user": userId },
      { $pull: { "quiz.attempts": { user: userId } } },
    ),
    Note.updateMany({ lastEditedBy: userId }, { $unset: { lastEditedBy: "" } }),
    Comment.updateMany(
      { mentions: userId },
      { $pull: { mentions: userId } },
    ),
    Comment.updateMany(
      { "reactions.user": userId },
      { $pull: { reactions: { user: userId } } },
    ),
    Announcement.updateMany(
      { "readBy.user": userId },
      { $pull: { readBy: { user: userId } } },
    ),
  ]);

  res.json({
    success: true,
    message: "User deleted permanently",
  });
});

const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    role: { $in: ["admin", "superadmin"] },
  }).select(
    "name email role permissions createdAt lastLogin isActive profilePicture",
  );

  res.json({
    success: true,
    data: { admins },
  });
});

const createAdmin = asyncHandler(async (req, res) => {
  const { email, permissions } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "superadmin") {
    throw new AppError("User is already a superadmin", 400);
  }

  user.role = "admin";
  user.permissions = permissions || [];
  await user.save();

  res.json({
    success: true,
    message: "Admin created",
    data: { user: user.toSafeObject() },
  });
});

const inviteAdmin = asyncHandler(async (req, res) => {
  const { email, permissions } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.role === "admin" || existingUser.role === "superadmin") {
      throw new AppError("User is already an admin", 400);
    }
    existingUser.role = "admin";
    existingUser.permissions = permissions || [];
    await existingUser.save();
    return res.json({
      success: true,
      message: "Existing user promoted to admin",
      data: { user: existingUser.toSafeObject() },
    });
  }

  const inviteToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(inviteToken)
    .digest("hex");

  const pendingAdmin = new User({
    email,
    name: "Pending Admin",
    password: crypto.randomBytes(16).toString("hex"),
    role: "admin",
    permissions: permissions || [],
    isEmailVerified: false,
    isActive: false,
    adminInviteToken: hashedToken,
    adminInviteExpires: Date.now() + 48 * 60 * 60 * 1000,
    adminInvitePermissions: permissions || [],
  });

  await pendingAdmin.save();

  const adminClientUrl = process.env.ADMIN_URL || "http://localhost:3001";
  const inviteUrl = `${adminClientUrl}/accept-invite?token=${inviteToken}`;

  const emailContent = emailTemplates.adminInvite(
    email,
    inviteUrl,
    permissions || [],
  );
  await sendEmail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  res.status(201).json({
    success: true,
    message: "Admin invitation sent",
    data: { email },
  });
});

const acceptAdminInvite = asyncHandler(async (req, res) => {
  const { token, name, password } = req.body;

  if (!token || !name || !password) {
    throw new AppError("Token, name, and password are required", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    adminInviteToken: hashedToken,
    adminInviteExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired invitation token", 400);
  }

  user.name = name;
  user.password = password;
  user.isEmailVerified = true;
  user.isActive = true;
  user.adminInviteToken = undefined;
  user.adminInviteExpires = undefined;
  user.adminInvitePermissions = undefined;

  await user.save();

  res.json({
    success: true,
    message: "Admin account setup complete. You can now login.",
    data: { email: user.email },
  });
});

const updateAdminPermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body;

  const admin = await User.findOne({
    _id: req.params.id,
    role: "admin",
  });

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  admin.permissions = permissions;
  await admin.save();

  res.json({
    success: true,
    message: "Permissions updated",
    data: { admin: admin.toSafeObject() },
  });
});

const removeAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({
    _id: req.params.id,
    role: "admin",
  });

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  admin.role = "user";
  admin.permissions = [];
  await admin.save();

  res.json({
    success: true,
    message: "Admin role removed",
  });
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [announcements, total] = await Promise.all([
    Announcement.find()
      .populate("admin", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Announcement.countDocuments(),
  ]);

  res.json({
    success: true,
    data: {
      announcements,
      pagination: getPaginationInfo(total, parseInt(page), parseInt(limit)),
    },
  });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    type,
    priority,
    targetAudience,
    sendEmail,
    scheduledFor,
    expiresAt,
  } = req.body;

  const announcement = await Announcement.create({
    admin: req.user._id,
    title,
    message,
    type,
    priority,
    targetAudience,
    sendEmail,
    scheduledFor,
    expiresAt,
  });

  if (!scheduledFor || new Date(scheduledFor) <= new Date()) {
    const userQuery = {};
    if (targetAudience === "users") userQuery.role = "user";
    if (targetAudience === "admins")
      userQuery.role = { $in: ["admin", "superadmin"] };

    const users = await User.find({ ...userQuery, isActive: true });

    const io = req.app.get("io");
    await notificationService.sendAnnouncement(io, {
      admin: req.user._id,
      announcement,
      users,
    });

    if (sendEmail) {
      announcement.emailSentAt = new Date();
      await announcement.save();
    }
  }

  res.status(201).json({
    success: true,
    message: "Announcement created",
    data: { announcement },
  });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, type, priority, isActive, expiresAt } = req.body;

  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { title, message, type, priority, isActive, expiresAt },
    { new: true, runValidators: true },
  );

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  res.json({
    success: true,
    message: "Announcement updated",
    data: { announcement },
  });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  res.json({
    success: true,
    message: "Announcement deleted",
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAdmins,
  createAdmin,
  inviteAdmin,
  acceptAdminInvite,
  updateAdminPermissions,
  removeAdmin,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
