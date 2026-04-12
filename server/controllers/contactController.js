const { Contact, User } = require("../models");
const { asyncHandler, AppError } = require("../middlewares");
const { getPaginationInfo } = require("../utils");
const { sendEmail } = require("../config/email");

const createContactSubmission = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const contact = await Contact.create({
    name,
    email,
    subject,
    message,
  });

  res.status(201).json({
    success: true,
    message: "Message submitted successfully",
    data: { contactId: contact._id },
  });
});

const getContacts = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    assignedTo,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [contacts, total] = await Promise.all([
    Contact.find(query)
      .populate("assignedTo", "name email")
      .populate("replies.admin", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Contact.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      contacts,
      pagination: getPaginationInfo(
        total,
        parseInt(page, 10),
        parseInt(limit, 10),
      ),
    },
  });
});

const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
    .populate("assignedTo", "name email")
    .populate("replies.admin", "name email");

  if (!contact) {
    throw new AppError("Contact message not found", 404);
  }

  res.json({
    success: true,
    data: { contact },
  });
});

const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  )
    .populate("assignedTo", "name email")
    .populate("replies.admin", "name email");

  if (!contact) {
    throw new AppError("Contact message not found", 404);
  }

  res.json({
    success: true,
    message: "Contact status updated",
    data: { contact },
  });
});

const assignContact = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  const admin = await User.findOne({
    _id: adminId,
    role: { $in: ["admin", "superadmin"] },
    isActive: true,
  });

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: admin._id,
      status: "in_progress",
    },
    { new: true },
  )
    .populate("assignedTo", "name email")
    .populate("replies.admin", "name email");

  if (!contact) {
    throw new AppError("Contact message not found", 404);
  }

  res.json({
    success: true,
    message: "Contact assigned successfully",
    data: { contact },
  });
});

const replyToContact = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const contact = await Contact.findById(req.params.id)
    .populate("assignedTo", "name email")
    .populate("replies.admin", "name email");

  if (!contact) {
    throw new AppError("Contact message not found", 404);
  }

  contact.replies.push({
    admin: req.user._id,
    message,
  });
  contact.status = "replied";

  if (!contact.assignedTo) {
    contact.assignedTo = req.user._id;
  }

  await contact.save();
  await contact.populate("replies.admin", "name email");

  try {
    await sendEmail({
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `<p>Hi ${contact.name},</p><p>${message}</p><p>Regards,<br/>VPad Support Team</p>`,
    });
  } catch (error) {
    console.error("Failed to send contact reply email:", error.message);
  }

  res.json({
    success: true,
    message: "Reply sent successfully",
    data: { contact },
  });
});

module.exports = {
  createContactSubmission,
  getContacts,
  getContact,
  updateContactStatus,
  assignContact,
  replyToContact,
};
