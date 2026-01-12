const { Institution, Semester, Subject, Note } = require("../models");
const { asyncHandler, AppError } = require("../middlewares");

const createInstitution = asyncHandler(async (req, res) => {
  const { name, type, description, color, icon } = req.body;

  const institution = await Institution.create({
    user: req.user._id,
    name,
    type,
    description,
    color,
    icon,
  });

  res.status(201).json({
    success: true,
    message: "Institution created successfully",
    data: { institution },
  });
});

const getInstitutions = asyncHandler(async (req, res) => {
  const institutions = await Institution.find({
    user: req.user._id,
    isActive: true,
  })
    .populate("semesterCount")
    .sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    data: { institutions },
  });
});

const getInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate({
    path: "semesters",
    match: { isActive: true },
    options: { sort: { order: 1 } },
    populate: {
      path: "subjectCount",
    },
  });

  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  res.json({
    success: true,
    data: { institution },
  });
});

const updateInstitution = asyncHandler(async (req, res) => {
  const { name, type, description, color, icon, order } = req.body;

  const institution = await Institution.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { name, type, description, color, icon, order },
    { new: true, runValidators: true }
  );

  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  res.json({
    success: true,
    message: "Institution updated successfully",
    data: { institution },
  });
});

const deleteInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  await Institution.findByIdAndUpdate(req.params.id, { isActive: false });
  await Semester.updateMany(
    { institution: req.params.id },
    { isActive: false }
  );
  await Subject.updateMany({ institution: req.params.id }, { isActive: false });
  await Note.updateMany({ institution: req.params.id }, { isArchived: true });

  res.json({
    success: true,
    message: "Institution deleted successfully",
  });
});

const reorderInstitutions = asyncHandler(async (req, res) => {
  const { orderMap } = req.body;

  const updates = Object.entries(orderMap).map(([id, order]) =>
    Institution.findOneAndUpdate({ _id: id, user: req.user._id }, { order })
  );

  await Promise.all(updates);

  res.json({
    success: true,
    message: "Institutions reordered successfully",
  });
});

module.exports = {
  createInstitution,
  getInstitutions,
  getInstitution,
  updateInstitution,
  deleteInstitution,
  reorderInstitutions,
};
