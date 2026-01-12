const { Subject, Semester, Note } = require("../models");
const { asyncHandler, AppError } = require("../middlewares");

const createSubject = asyncHandler(async (req, res) => {
  const { semesterId, name, code, description, instructor, color, icon } =
    req.body;

  const semester = await Semester.findOne({
    _id: semesterId,
    user: req.user._id,
    isActive: true,
  }).populate("institution");

  if (!semester) {
    throw new AppError("Semester not found", 404);
  }

  const subject = await Subject.create({
    user: req.user._id,
    institution: semester.institution._id,
    semester: semesterId,
    name,
    code,
    description,
    instructor,
    color,
    icon,
  });

  res.status(201).json({
    success: true,
    message: "Subject created successfully",
    data: { subject },
  });
});

const getSubjects = asyncHandler(async (req, res) => {
  const { semesterId, institutionId } = req.query;

  const query = { user: req.user._id, isActive: true };
  if (semesterId) query.semester = semesterId;
  if (institutionId) query.institution = institutionId;

  const subjects = await Subject.find(query)
    .populate("semester", "name type")
    .populate("institution", "name type")
    .populate("noteCount")
    .sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    data: { subjects },
  });
});

const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("semester", "name type color")
    .populate("institution", "name type color")
    .populate({
      path: "notes",
      match: { isArchived: false },
      options: { sort: { isPinned: -1, updatedAt: -1 } },
      select:
        "title content tags isPinned isFavorite language createdAt updatedAt",
    });

  if (!subject) {
    throw new AppError("Subject not found", 404);
  }

  res.json({
    success: true,
    data: { subject },
  });
});

const updateSubject = asyncHandler(async (req, res) => {
  const { name, code, description, instructor, color, icon, order } = req.body;

  const subject = await Subject.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { name, code, description, instructor, color, icon, order },
    { new: true, runValidators: true }
  )
    .populate("semester", "name type")
    .populate("institution", "name type");

  if (!subject) {
    throw new AppError("Subject not found", 404);
  }

  res.json({
    success: true,
    message: "Subject updated successfully",
    data: { subject },
  });
});

const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!subject) {
    throw new AppError("Subject not found", 404);
  }

  await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
  await Note.updateMany({ subject: req.params.id }, { isArchived: true });

  res.json({
    success: true,
    message: "Subject deleted successfully",
  });
});

const reorderSubjects = asyncHandler(async (req, res) => {
  const { orderMap } = req.body;

  const updates = Object.entries(orderMap).map(([id, order]) =>
    Subject.findOneAndUpdate({ _id: id, user: req.user._id }, { order })
  );

  await Promise.all(updates);

  res.json({
    success: true,
    message: "Subjects reordered successfully",
  });
});

module.exports = {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
  reorderSubjects,
};
