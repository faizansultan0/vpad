const express = require("express");
const router = express.Router();
const { notificationController } = require("../controllers");
const { protect, mongoIdParam } = require("../middlewares");

router.use(protect);

router.get("/", notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", mongoIdParam, notificationController.markAsRead);
router.delete("/:id", mongoIdParam, notificationController.deleteNotification);

module.exports = router;
