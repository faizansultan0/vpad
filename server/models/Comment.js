const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
      maxlength: [5000, "Comment cannot exceed 5000 characters"],
    },
    audio: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
      duration: {
        type: Number,
      },
      mimeType: {
        type: String,
      },
    },
    language: {
      type: String,
      enum: ["en", "ur", "mixed"],
      default: "en",
    },
    isRtl: {
      type: Boolean,
      default: false,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        type: {
          type: String,
          enum: ["like", "love", "helpful", "insightful"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

commentSchema.index({ note: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ user: 1 });

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

commentSchema.virtual("replyCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  count: true,
});

commentSchema.methods.getThreadParticipants = async function () {
  const Comment = mongoose.model("Comment");
  const participants = new Set();

  participants.add(this.user.toString());

  if (this.parentComment) {
    const parent = await Comment.findById(this.parentComment);
    if (parent) {
      participants.add(parent.user.toString());
    }
  }

  const replies = await Comment.find({ parentComment: this._id });
  replies.forEach((reply) => {
    participants.add(reply.user.toString());
  });

  return Array.from(participants);
};

module.exports = mongoose.model("Comment", commentSchema);
