const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "update", "maintenance"],
      default: "info",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    targetAudience: {
      type: String,
      enum: ["all", "users", "admins"],
      default: "all",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scheduledFor: Date,
    expiresAt: Date,
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sendEmail: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
