const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: ["school", "college", "university", "other"],
      required: [true, "Institution type is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    color: {
      type: String,
      default: "#667eea",
    },
    icon: {
      type: String,
      default: "school",
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

institutionSchema.index({ user: 1, name: 1 }, { unique: true });
institutionSchema.index({ user: 1, order: 1 });

institutionSchema.virtual("semesters", {
  ref: "Semester",
  localField: "_id",
  foreignField: "institution",
});

institutionSchema.virtual("semesterCount", {
  ref: "Semester",
  localField: "_id",
  foreignField: "institution",
  count: true,
});

module.exports = mongoose.model("Institution", institutionSchema);
