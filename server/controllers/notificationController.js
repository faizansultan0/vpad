const { notificationService } = require("../services");
const { asyncHandler } = require("../middlewares");

const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = "false" } = req.query;

  const result = await notificationService.getUserNotifications(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
    unreadOnly: unreadOnly === "true",
  });

  res.json({
    success: true,
    data: result,
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);

  res.json({
    success: true,
    data: { count },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );

  res.json({
    success: true,
    data: { notification },
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);

  res.json({
    success: true,
    message: "Notification deleted",
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
