const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, "Semester/Year name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      enum: ["semester", "year", "term", "quarter"],
      default: "semester",
    },
    startDate: Date,
    endDate: Date,
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    color: {
      type: String,
      default: "#764ba2",
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

semesterSchema.index({ user: 1, institution: 1, name: 1 }, { unique: true });
semesterSchema.index({ institution: 1, order: 1 });

semesterSchema.virtual("subjects", {
  ref: "Subject",
  localField: "_id",
  foreignField: "semester",
});

semesterSchema.virtual("subjectCount", {
  ref: "Subject",
  localField: "_id",
  foreignField: "semester",
  count: true,
});

module.exports = mongoose.model("Semester", semesterSchema);
