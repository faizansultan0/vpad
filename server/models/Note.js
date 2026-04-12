const mongoose = require("mongoose");

const editHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  editedAt: {
    type: Date,
    default: Date.now,
  },
  changeDescription: String,
});

const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  permission: {
    type: String,
    enum: ["view", "edit", "admin"],
    default: "view",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  targetInstitution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
  },
  targetSemester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
  },
  targetSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  mergeOption: {
    type: String,
    enum: ["replicate", "merge", "pending"],
    default: "pending",
  },
});

const attachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: String,
  type: {
    type: String,
    enum: ["image", "document", "handwritten"],
    default: "image",
  },
  extractedText: String,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: String,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { _id: false },
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      type: [Number],
      default: [],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    contentType: {
      type: String,
      enum: ["rich-text", "markdown"],
      default: "rich-text",
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
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    color: {
      type: String,
      default: "#ffffff",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    collaborators: [collaboratorSchema],
    attachments: [attachmentSchema],
    editHistory: [editHistorySchema],
    summary: {
      text: String,
      generatedAt: Date,
      model: String,
      sourceHash: String,
    },
    quiz: {
      questions: [quizQuestionSchema],
      generatedAt: Date,
      model: String,
      sourceHash: String,
      optionsHash: String,
      attempts: [quizAttemptSchema],
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastEditedAt: Date,
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

noteSchema.index({ user: 1, subject: 1 });
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ title: "text", content: "text", tags: "text" });
noteSchema.index({ "collaborators.user": 1 });
noteSchema.index({ isPrivate: 1 });
noteSchema.index({ isPinned: -1, updatedAt: -1 });

noteSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "note",
});

noteSchema.virtual("commentCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "note",
  count: true,
});

noteSchema.methods.canUserAccess = function (userId) {
  const noteUserId = this.user._id
    ? this.user._id.toString()
    : this.user.toString();
  if (noteUserId === userId.toString()) return true;
  if (!this.isPrivate) return true;
  return this.collaborators.some((collab) => {
    const collabUserId = collab.user._id
      ? collab.user._id.toString()
      : collab.user.toString();
    return collabUserId === userId.toString();
  });
};

noteSchema.methods.canUserEdit = function (userId) {
  const noteUserId = this.user._id
    ? this.user._id.toString()
    : this.user.toString();
  if (noteUserId === userId.toString()) return true;
  const collaborator = this.collaborators.find((collab) => {
    const collabUserId = collab.user._id
      ? collab.user._id.toString()
      : collab.user.toString();
    return collabUserId === userId.toString();
  });
  return collaborator && ["edit", "admin"].includes(collaborator.permission);
};

noteSchema.methods.canUserComment = function (userId) {
  const noteUserId = this.user._id
    ? this.user._id.toString()
    : this.user.toString();
  if (noteUserId === userId.toString()) return true;

  const collaborator = this.collaborators.find((collab) => {
    const collabUserId = collab.user._id
      ? collab.user._id.toString()
      : collab.user.toString();
    return collabUserId === userId.toString();
  });

  return collaborator && ["edit", "admin"].includes(collaborator.permission);
};

noteSchema.methods.addToHistory = function (userId, content, description) {
  this.editHistory.push({
    user: userId,
    content,
    changeDescription: description,
  });
  if (this.editHistory.length > 50) {
    this.editHistory = this.editHistory.slice(-50);
  }
};

module.exports = mongoose.model("Note", noteSchema);
