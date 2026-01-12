const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "note_shared",
        "note_edited",
        "comment_added",
        "comment_reply",
        "mention",
        "collaboration_invite",
        "collaboration_update",
        "announcement",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
      commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
      institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
      },
      semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
      },
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      link: String,
      extra: mongoose.Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    isArchived: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

notificationSchema.statics.createNotification = async function (data) {
  const notification = await this.create(data);
  return notification.populate(["sender", "data.noteId"]);
};

notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = mongoose.model("Notification", notificationSchema);
