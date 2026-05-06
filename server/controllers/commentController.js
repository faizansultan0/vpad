const { Comment, Note, User } = require("../models");
const { asyncHandler, AppError } = require("../middlewares");
const { notificationService } = require("../services");
const { detectLanguage, isRtlText } = require("../utils");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

const createComment = asyncHandler(async (req, res) => {
  const { noteId, content, parentCommentId, recordingDuration } = req.body;

  const note = await Note.findById(noteId);
  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserComment(req.user._id)) {
    throw new AppError(
      "You do not have permission to comment on this note",
      403,
    );
  }

  let parentComment = null;
  if (parentCommentId) {
    parentComment = await Comment.findById(parentCommentId);
    if (!parentComment || parentComment.note.toString() !== noteId) {
      throw new AppError("Parent comment not found", 404);
    }
  }

  let audio = null;
  if (req.file) {
    const uploadedAudio = await uploadToCloudinary(
      req.file.buffer,
      "vpad/comments",
    );
    audio = {
      ...uploadedAudio,
      duration: Number(recordingDuration) || undefined,
      mimeType: req.file.mimetype,
    };
  }

  const commentContent = typeof content === "string" ? content.trim() : "";

  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(commentContent)) !== null) {
    mentions.push(match[2]);
  }

  const comment = await Comment.create({
    note: noteId,
    user: req.user._id,
    content: commentContent,
    language: detectLanguage(commentContent),
    isRtl: isRtlText(commentContent),
    parentComment: parentCommentId || null,
    mentions,
    audio,
  });

  await comment.populate("user", "name profilePicture");

  const io = req.app.get("io");

  if (io) {
    io.to(`note:${noteId}`).emit("newComment", {
      noteId,
      comment,
    });
  }

  const participants = new Set();
  participants.add(note.user.toString());
  note.collaborators.forEach((c) => participants.add(c.user.toString()));

  if (parentComment) {
    const threadParticipants = await parentComment.getThreadParticipants();
    await notificationService.notifyCommentReply(io, {
      replier: req.user._id,
      note,
      comment,
      parentComment,
      threadParticipants,
    });
  } else {
    await notificationService.notifyCommentAdded(io, {
      commenter: req.user._id,
      note,
      comment,
      participants: Array.from(participants),
    });
  }

  if (mentions.length > 0) {
    await notificationService.notifyMention(io, {
      mentioner: req.user._id,
      note,
      comment,
      mentionedUsers: mentions,
    });
  }

  res.status(201).json({
    success: true,
    message: "Comment added",
    data: { comment },
  });
});

const getComments = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const note = await Note.findById(noteId);
  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserAccess(req.user._id)) {
    throw new AppError("Access denied", 403);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [comments, total] = await Promise.all([
    Comment.find({ note: noteId, parentComment: null, isDeleted: false })
      .populate("user", "name profilePicture")
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: { path: "user", select: "name profilePicture" },
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Comment.countDocuments({
      note: noteId,
      parentComment: null,
      isDeleted: false,
    }),
  ]);

  res.json({
    success: true,
    data: {
      comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const comment = await Comment.findOne({
    _id: req.params.id,
    user: req.user._id,
    isDeleted: false,
  });

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  comment.content = content;
  comment.language = detectLanguage(content);
  comment.isRtl = isRtlText(content);
  comment.isEdited = true;
  comment.editedAt = new Date();

  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]);
  }
  comment.mentions = mentions;

  await comment.save();
  await comment.populate("user", "name profilePicture");

  const io = req.app.get("io");
  if (io) {
    io.to(`note:${comment.note}`).emit("commentUpdated", {
      noteId: comment.note,
      comment,
    });
  }

  res.json({
    success: true,
    message: "Comment updated",
    data: { comment },
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (comment.audio?.publicId) {
    await deleteFromCloudinary(comment.audio.publicId).catch(console.error);
  }

  comment.isDeleted = true;
  comment.deletedAt = new Date();
  comment.content = "[This comment has been deleted]";
  comment.audio = undefined;
  await comment.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`note:${comment.note}`).emit("commentDeleted", {
      noteId: comment.note,
      commentId: comment._id,
    });
  }

  res.json({
    success: true,
    message: "Comment deleted",
  });
});

const addReaction = asyncHandler(async (req, res) => {
  const { type } = req.body;

  const comment = await Comment.findById(req.params.id);
  if (!comment || comment.isDeleted) {
    throw new AppError("Comment not found", 404);
  }

  const existingReaction = comment.reactions.find(
    (r) => r.user.toString() === req.user._id.toString(),
  );

  if (existingReaction) {
    if (existingReaction.type === type) {
      comment.reactions = comment.reactions.filter(
        (r) => r.user.toString() !== req.user._id.toString(),
      );
    } else {
      existingReaction.type = type;
    }
  } else {
    comment.reactions.push({ user: req.user._id, type });
  }

  await comment.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`note:${comment.note}`).emit("commentReaction", {
      noteId: comment.note,
      commentId: comment._id,
      reactions: comment.reactions,
    });
  }

  res.json({
    success: true,
    data: { reactions: comment.reactions },
  });
});

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  addReaction,
};
