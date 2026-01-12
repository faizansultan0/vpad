const { Semester, Institution, Subject, Note } = require("../models");
const { asyncHandler, AppError } = require("../middlewares");

const createSemester = asyncHandler(async (req, res) => {
  const { institutionId, name, type, startDate, endDate, description, color } =
    req.body;

  const institution = await Institution.findOne({
    _id: institutionId,
    user: req.user._id,
    isActive: true,
  });

  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  const semester = await Semester.create({
    user: req.user._id,
    institution: institutionId,
    name,
    type,
    startDate,
    endDate,
    description,
    color,
  });

  res.status(201).json({
    success: true,
    message: "Semester created successfully",
    data: { semester },
  });
});

const getSemesters = asyncHandler(async (req, res) => {
  const { institutionId } = req.query;

  const query = { user: req.user._id, isActive: true };
  if (institutionId) query.institution = institutionId;

  const semesters = await Semester.find(query)
    .populate("institution", "name type")
    .populate("subjectCount")
    .sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    data: { semesters },
  });
});

const getSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("institution", "name type color")
    .populate({
      path: "subjects",
      match: { isActive: true },
      options: { sort: { order: 1 } },
      populate: { path: "noteCount" },
    });

  if (!semester) {
    throw new AppError("Semester not found", 404);
  }

  res.json({
    success: true,
    data: { semester },
  });
});

const updateSemester = asyncHandler(async (req, res) => {
  const { name, type, startDate, endDate, description, color, order } =
    req.body;

  const semester = await Semester.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { name, type, startDate, endDate, description, color, order },
    { new: true, runValidators: true }
  ).populate("institution", "name type");

  if (!semester) {
    throw new AppError("Semester not found", 404);
  }

  res.json({
    success: true,
    message: "Semester updated successfully",
    data: { semester },
  });
});

const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!semester) {
    throw new AppError("Semester not found", 404);
  }

  await Semester.findByIdAndUpdate(req.params.id, { isActive: false });
  await Subject.updateMany({ semester: req.params.id }, { isActive: false });
  await Note.updateMany({ semester: req.params.id }, { isArchived: true });

  res.json({
    success: true,
    message: "Semester deleted successfully",
  });
});

const reorderSemesters = asyncHandler(async (req, res) => {
  const { orderMap } = req.body;

  const updates = Object.entries(orderMap).map(([id, order]) =>
    Semester.findOneAndUpdate({ _id: id, user: req.user._id }, { order })
  );

  await Promise.all(updates);

  res.json({
    success: true,
    message: "Semesters reordered successfully",
  });
});

module.exports = {
  createSemester,
  getSemesters,
  getSemester,
  updateSemester,
  deleteSemester,
  reorderSemesters,
};
