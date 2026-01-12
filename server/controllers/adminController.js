const {
  User,
  Note,
  Announcement,
  Institution,
  Semester,
  Subject,
} = require("../models");
const { asyncHandler, AppError } = require("../middlewares");
const { notificationService } = require("../services");
const { getPaginationInfo } = require("../utils");

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
    "-refreshTokens -emailVerificationToken -passwordResetToken"
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

  user.isActive = false;
  user.refreshTokens = [];
  await user.save();

  res.json({
    success: true,
    message: "User deactivated",
  });
});

const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    role: { $in: ["admin", "superadmin"] },
  }).select(
    "name email role permissions createdAt lastLogin isActive profilePicture"
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
    { new: true, runValidators: true }
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
  updateAdminPermissions,
  removeAdmin,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
