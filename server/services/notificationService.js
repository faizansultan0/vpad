const { Notification, User } = require("../models");
const { sendEmail, emailTemplates } = require("../config/email");

const createNotification = async (data) => {
  const notification = await Notification.create(data);
  return notification.populate(["sender", "data.noteId"]);
};

const createAndEmit = async (io, data) => {
  const notification = await createNotification(data);

  if (io) {
    io.to(`user:${data.recipient}`).emit("notification", notification);
  }

  return notification;
};

const notifyNoteShared = async (io, { sender, recipient, note }) => {
  const senderUser = await User.findById(sender);
  const recipientUser = await User.findById(recipient);

  const notification = await createAndEmit(io, {
    recipient,
    sender,
    type: "note_shared",
    title: "Note Shared",
    message: `${senderUser.name} shared a note "${note.title}" with you`,
    data: {
      noteId: note._id,
      link: `/notes/${note._id}`,
    },
  });

  if (
    recipientUser.preferences?.notifications?.shares &&
    recipientUser.preferences?.notifications?.email
  ) {
    const noteUrl = `${process.env.CLIENT_URL}/notes/${note._id}`;
    const template = emailTemplates.noteShared(
      recipientUser.name,
      senderUser.name,
      note.title,
      noteUrl
    );
    await sendEmail({
      to: recipientUser.email,
      ...template,
    }).catch(console.error);
  }

  return notification;
};

const notifyNoteEdited = async (io, { editor, note, collaborators }) => {
  const editorUser = await User.findById(editor);

  const notifications = await Promise.all(
    collaborators
      .filter((c) => c.toString() !== editor.toString())
      .map((userId) =>
        createAndEmit(io, {
          recipient: userId,
          sender: editor,
          type: "note_edited",
          title: "Note Updated",
          message: `${editorUser.name} edited "${note.title}"`,
          data: {
            noteId: note._id,
            link: `/notes/${note._id}`,
          },
        })
      )
  );

  return notifications;
};

const notifyCommentAdded = async (
  io,
  { commenter, note, comment, participants }
) => {
  const commenterUser = await User.findById(commenter);

  const notifications = await Promise.all(
    participants
      .filter((p) => p.toString() !== commenter.toString())
      .map((userId) =>
        createAndEmit(io, {
          recipient: userId,
          sender: commenter,
          type: "comment_added",
          title: "New Comment",
          message: `${commenterUser.name} commented on "${note.title}"`,
          data: {
            noteId: note._id,
            commentId: comment._id,
            link: `/notes/${note._id}#comment-${comment._id}`,
          },
        })
      )
  );

  return notifications;
};

const notifyCommentReply = async (
  io,
  { replier, note, comment, parentComment, threadParticipants }
) => {
  const replierUser = await User.findById(replier);

  const notifications = await Promise.all(
    threadParticipants
      .filter((p) => p.toString() !== replier.toString())
      .map((userId) =>
        createAndEmit(io, {
          recipient: userId,
          sender: replier,
          type: "comment_reply",
          title: "New Reply",
          message: `${replierUser.name} replied to a comment on "${note.title}"`,
          data: {
            noteId: note._id,
            commentId: comment._id,
            link: `/notes/${note._id}#comment-${comment._id}`,
          },
        })
      )
  );

  return notifications;
};

const notifyMention = async (
  io,
  { mentioner, note, comment, mentionedUsers }
) => {
  const mentionerUser = await User.findById(mentioner);

  const notifications = await Promise.all(
    mentionedUsers
      .filter((u) => u.toString() !== mentioner.toString())
      .map((userId) =>
        createAndEmit(io, {
          recipient: userId,
          sender: mentioner,
          type: "mention",
          title: "You were mentioned",
          message: `${mentionerUser.name} mentioned you in a comment on "${note.title}"`,
          data: {
            noteId: note._id,
            commentId: comment._id,
            link: `/notes/${note._id}#comment-${comment._id}`,
          },
        })
      )
  );

  return notifications;
};

const sendAnnouncement = async (io, { admin, announcement, users }) => {
  const notifications = await Promise.all(
    users.map((user) =>
      createAndEmit(io, {
        recipient: user._id,
        sender: admin,
        type: "announcement",
        title: announcement.title,
        message: announcement.message,
        priority: announcement.priority,
        data: {
          extra: { announcementId: announcement._id },
        },
      })
    )
  );

  if (announcement.sendEmail) {
    for (const user of users) {
      if (
        user.preferences?.notifications?.announcements &&
        user.preferences?.notifications?.email
      ) {
        const template = emailTemplates.announcement(
          user.name,
          announcement.title,
          announcement.message
        );
        await sendEmail({
          to: user.email,
          ...template,
        }).catch(console.error);
      }
    }
  }

  return notifications;
};

const getUserNotifications = async (userId, options = {}) => {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const query = { recipient: userId };
  if (unreadOnly) query.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(query),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

const deleteNotification = async (notificationId, userId) => {
  await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });
};

module.exports = {
  createNotification,
  createAndEmit,
  notifyNoteShared,
  notifyNoteEdited,
  notifyCommentAdded,
  notifyCommentReply,
  notifyMention,
  sendAnnouncement,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
