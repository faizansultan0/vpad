const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      trim: true,
      maxlength: [20, "Code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    instructor: {
      type: String,
      trim: true,
      maxlength: [100, "Instructor name cannot exceed 100 characters"],
    },
    color: {
      type: String,
      default: "#f093fb",
    },
    icon: {
      type: String,
      default: "book",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subjectSchema.index({ user: 1, semester: 1, name: 1 }, { unique: true });
subjectSchema.index({ semester: 1, order: 1 });

subjectSchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "subject",
});

subjectSchema.virtual("noteCount", {
  ref: "Note",
  localField: "_id",
  foreignField: "subject",
  count: true,
});

module.exports = mongoose.model("Subject", subjectSchema);
