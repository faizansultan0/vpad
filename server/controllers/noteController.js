const crypto = require("crypto");
const { Note, Subject, User, Comment } = require("../models");
const { asyncHandler, AppError } = require("../middlewares");
const { notificationService, aiService } = require("../services");
const {
  detectLanguage,
  isRtlText,
  getPaginationInfo,
  stripHtmlTags,
} = require("../utils");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

const buildHash = (value) => {
  return crypto
    .createHash("sha256")
    .update(value || "")
    .digest("hex");
};

const buildQuizOptionsHash = (options = {}) => {
  const normalized = {
    questionCount:
      options.questionCount !== undefined ? Number(options.questionCount) : 5,
    shortQuestionCount:
      options.shortQuestionCount !== undefined
        ? Number(options.shortQuestionCount)
        : 0,
    difficulty: options.difficulty || "medium",
    includeTopics: Array.isArray(options.includeTopics)
      ? [...options.includeTopics].map((topic) => topic.trim()).sort()
      : [],
  };

  return buildHash(JSON.stringify(normalized));
};

const normalizeQuizQuestions = (quiz) => {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];

  return questions
    .map((question) => {
      const type = question?.type === "short" ? "short" : "mcq";

      if (type === "short") {
        return {
          type: "short",
          question: question?.question,
          options: [],
          correctAnswer:
            typeof question?.correctAnswer === "string"
              ? question.correctAnswer
              : String(question?.correctAnswer || ""),
          explanation: question?.explanation || "",
          difficulty: question?.difficulty || "medium",
        };
      }

      return {
        type: "mcq",
        question: question?.question,
        options: Array.isArray(question?.options) ? question.options : [],
        correctAnswer:
          typeof question?.correctAnswer === "number"
            ? question.correctAnswer
            : typeof question?.correctAnswer === "string" &&
              question.correctAnswer.trim() !== ""
            ? Number(question.correctAnswer)
            : NaN,
        explanation: question?.explanation || "",
        difficulty: question?.difficulty || "medium",
      };
    })
    .filter((question) => {
      if (
        typeof question.question !== "string" ||
        question.question.trim().length === 0
      ) {
        return false;
      }

      if (question.type === "short") {
        return (
          typeof question.correctAnswer === "string" &&
          question.correctAnswer.trim().length > 0
        );
      }

      return (
        question.options.length >= 2 &&
        Number.isInteger(question.correctAnswer) &&
        question.correctAnswer >= 0 &&
        question.correctAnswer < question.options.length
      );
    });
};

const createNote = asyncHandler(async (req, res) => {
  const { subjectId, title, content, contentType, language, tags, color } =
    req.body;

  const subject = await Subject.findOne({
    _id: subjectId,
    user: req.user._id,
    isActive: true,
  }).populate("semester institution");

  if (!subject) {
    throw new AppError("Subject not found", 404);
  }

  const detectedLang = language || detectLanguage(content || title);
  const rtl = isRtlText(content || title);

  const note = await Note.create({
    user: req.user._id,
    institution: subject.institution._id,
    semester: subject.semester._id,
    subject: subjectId,
    title,
    content: content || "",
    contentType: contentType || "rich-text",
    language: detectedLang,
    isRtl: rtl,
    tags: tags || [],
    color,
  });

  res.status(201).json({
    success: true,
    message: "Note created successfully",
    data: { note },
  });
});

const getNotes = asyncHandler(async (req, res) => {
  const {
    subjectId,
    semesterId,
    institutionId,
    search,
    tags,
    sortBy = "updatedAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
    archived = "false",
    shared = "false",
  } = req.query;

  const query = { isArchived: archived === "true" };

  if (shared === "true") {
    query["collaborators.user"] = req.user._id;
  } else {
    query.user = req.user._id;
  }

  if (subjectId) query.subject = subjectId;
  if (semesterId) query.semester = semesterId;
  if (institutionId) query.institution = institutionId;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (tags) {
    const tagArray = tags.split(",").map((t) => t.trim());
    query.tags = { $in: tagArray };
  }

  const sortOptions = {};
  sortOptions.isPinned = -1;
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notes, total] = await Promise.all([
    Note.find(query)
      .populate("subject", "name color")
      .populate("semester", "name")
      .populate("institution", "name")
      .populate("user", "name profilePicture")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-content -editHistory -quiz"),
    Note.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      notes,
      pagination: getPaginationInfo(total, parseInt(page), parseInt(limit)),
    },
  });
});

const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate("user", "name profilePicture email")
    .populate("subject", "name color code")
    .populate("semester", "name type")
    .populate("institution", "name type")
    .populate("collaborators.user", "name profilePicture email")
    .populate("lastEditedBy", "name profilePicture");

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserAccess(req.user._id)) {
    throw new AppError("You do not have access to this note", 403);
  }

  note.viewCount += 1;
  await note.save();

  res.json({
    success: true,
    data: { note },
  });
});

const updateNote = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    contentType,
    language,
    tags,
    color,
    isPinned,
    isFavorite,
    isPrivate,
  } = req.body;

  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserEdit(req.user._id)) {
    throw new AppError("You do not have permission to edit this note", 403);
  }

  if (content !== undefined && content !== note.content && note.content) {
    note.addToHistory(req.user._id, note.content, "Content updated");
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) {
    updates.content = content;
    updates.language = language || detectLanguage(content);
    updates.isRtl = isRtlText(content);
  }
  if (contentType !== undefined) updates.contentType = contentType;
  if (tags !== undefined) updates.tags = tags;
  if (color !== undefined) updates.color = color;
  if (isPinned !== undefined) updates.isPinned = isPinned;
  if (isFavorite !== undefined) updates.isFavorite = isFavorite;
  if (isPrivate !== undefined) updates.isPrivate = isPrivate;

  updates.lastEditedBy = req.user._id;
  updates.lastEditedAt = new Date();

  Object.assign(note, updates);
  await note.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`note:${note._id}`).emit("noteUpdated", {
      noteId: note._id,
      updates,
      editedBy: {
        _id: req.user._id,
        name: req.user.name,
        profilePicture: req.user.profilePicture,
      },
    });
  }

  res.json({
    success: true,
    message: "Note updated successfully",
    data: { note },
  });
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!note) {
    throw new AppError("Note not found or you do not have permission", 404);
  }

  await Note.findByIdAndUpdate(req.params.id, { isArchived: true });

  res.json({
    success: true,
    message: "Note deleted successfully",
  });
});

const permanentDeleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  for (const attachment of note.attachments) {
    if (attachment.publicId) {
      await deleteFromCloudinary(attachment.publicId).catch(console.error);
    }
  }

  await Comment.deleteMany({ note: note._id });
  await Note.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Note permanently deleted",
  });
});

const restoreNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, isArchived: true },
    { isArchived: false },
    { new: true },
  );

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  res.json({
    success: true,
    message: "Note restored successfully",
    data: { note },
  });
});

const shareNote = asyncHandler(async (req, res) => {
  const { email, permission = "view" } = req.body;

  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  const targetUser = await User.findOne({ email, isActive: true });
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (targetUser._id.toString() === req.user._id.toString()) {
    throw new AppError("Cannot share note with yourself", 400);
  }

  const existingCollaborator = note.collaborators.find(
    (c) => c.user.toString() === targetUser._id.toString(),
  );

  if (existingCollaborator) {
    existingCollaborator.permission = permission;
  } else {
    note.collaborators.push({
      user: targetUser._id,
      permission,
      addedBy: req.user._id,
      mergeOption: "pending",
    });
  }

  await note.save();

  const io = req.app.get("io");
  await notificationService.notifyNoteShared(io, {
    sender: req.user._id,
    recipient: targetUser._id,
    note,
  });

  res.json({
    success: true,
    message: `Note shared with ${targetUser.name}`,
    data: { note },
  });
});

const updateCollaborator = asyncHandler(async (req, res) => {
  const { collaboratorId, permission } = req.body;

  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  const collaborator = note.collaborators.id(collaboratorId);
  if (!collaborator) {
    throw new AppError("Collaborator not found", 404);
  }

  collaborator.permission = permission;
  await note.save();

  res.json({
    success: true,
    message: "Collaborator updated",
    data: { note },
  });
});

const removeCollaborator = asyncHandler(async (req, res) => {
  const { collaboratorId } = req.params;

  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  note.collaborators = note.collaborators.filter(
    (c) => c._id.toString() !== collaboratorId,
  );
  await note.save();

  res.json({
    success: true,
    message: "Collaborator removed",
    data: { note },
  });
});

const handleShareOption = asyncHandler(async (req, res) => {
  const {
    mergeOption,
    targetInstitutionId,
    targetSemesterId,
    targetSubjectId,
  } = req.body;

  const note = await Note.findById(req.params.id);
  if (!note) {
    throw new AppError("Note not found", 404);
  }

  const collaborator = note.collaborators.find(
    (c) => c.user.toString() === req.user._id.toString(),
  );

  if (!collaborator) {
    throw new AppError("You are not a collaborator on this note", 403);
  }

  collaborator.mergeOption = mergeOption;
  if (mergeOption === "merge" || mergeOption === "replicate") {
    collaborator.targetInstitution = targetInstitutionId;
    collaborator.targetSemester = targetSemesterId;
    collaborator.targetSubject = targetSubjectId;
  }

  await note.save();

  res.json({
    success: true,
    message: "Share option updated",
    data: { note },
  });
});

const uploadAttachment = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserEdit(req.user._id)) {
    throw new AppError("You do not have permission to edit this note", 403);
  }

  if (!req.file) {
    throw new AppError("Please upload a file", 400);
  }

  const result = await uploadToCloudinary(req.file.buffer, "vpad/attachments");

  const attachment = {
    name: req.file.originalname,
    url: result.url,
    publicId: result.publicId,
    type: req.body.type || "image",
    size: req.file.size,
  };

  note.attachments.push(attachment);
  await note.save();

  res.json({
    success: true,
    message: "Attachment uploaded",
    data: { attachment: note.attachments[note.attachments.length - 1] },
  });
});

const deleteAttachment = asyncHandler(async (req, res) => {
  const { attachmentId } = req.params;

  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserEdit(req.user._id)) {
    throw new AppError("You do not have permission", 403);
  }

  const attachment = note.attachments.id(attachmentId);
  if (!attachment) {
    throw new AppError("Attachment not found", 404);
  }

  if (attachment.publicId) {
    await deleteFromCloudinary(attachment.publicId).catch(console.error);
  }

  note.attachments = note.attachments.filter(
    (a) => a._id.toString() !== attachmentId,
  );
  await note.save();

  res.json({
    success: true,
    message: "Attachment deleted",
  });
});

const getEditHistory = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id)
    .select("editHistory user")
    .populate("editHistory.user", "name profilePicture");

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserAccess(req.user._id)) {
    throw new AppError("Access denied", 403);
  }

  res.json({
    success: true,
    data: { editHistory: note.editHistory },
  });
});

const summarizeNote = asyncHandler(async (req, res) => {
  const { regenerate = false } = req.body || {};
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserAccess(req.user._id)) {
    throw new AppError("Access denied", 403);
  }

  const plainText = stripHtmlTags(note.content);
  if (plainText.length < 100) {
    throw new AppError("Note content is too short to summarize", 400);
  }

  const sourceHash = buildHash(plainText);
  const hasExistingSummary = Boolean(note.summary?.text);
  const isSummaryUpToDate = note.summary?.sourceHash === sourceHash;

  if (hasExistingSummary && isSummaryUpToDate) {
    return res.json({
      success: true,
      message: "Using cached summary",
      data: {
        summary: note.summary,
        cached: true,
        needsRegeneration: false,
      },
    });
  }

  if (hasExistingSummary && !isSummaryUpToDate && !regenerate) {
    return res.json({
      success: true,
      message: "Note content has changed. Regenerate to refresh summary.",
      data: {
        summary: note.summary,
        cached: true,
        needsRegeneration: true,
      },
    });
  }

  const result = await aiService.summarizeNote(plainText, note.language);

  note.summary = {
    text: result.text,
    generatedAt: new Date(),
    model: result.model,
    sourceHash,
  };
  await note.save();

  res.json({
    success: true,
    data: {
      summary: note.summary,
      cached: false,
      needsRegeneration: false,
    },
  });
});

const extractTextFromImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    throw new AppError("Image URL is required", 400);
  }

  const result = await aiService.extractTextFromImage(imageUrl);

  res.json({
    success: true,
    data: {
      extractedText: result.text,
      model: result.model,
    },
  });
});

const generateQuiz = asyncHandler(async (req, res) => {
  const {
    questionCount,
    shortQuestionCount,
    difficulty,
    includeTopics,
    regenerate = false,
  } = req.body;

  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserAccess(req.user._id)) {
    throw new AppError("Access denied", 403);
  }

  const plainText = stripHtmlTags(note.content);
  if (plainText.length < 200) {
    throw new AppError("Note content is too short to generate quiz", 400);
  }

  const parsedMcqCount =
    questionCount !== undefined ? Number(questionCount) : 5;
  const parsedShortCount =
    shortQuestionCount !== undefined ? Number(shortQuestionCount) : 0;

  if (parsedMcqCount === 0 && parsedShortCount === 0) {
    throw new AppError("Quiz must have at least one question", 400);
  }

  const sourceHash = buildHash(plainText);
  const optionsHash = buildQuizOptionsHash({
    questionCount,
    shortQuestionCount,
    difficulty,
    includeTopics,
  });

  const existingQuiz = note.quiz;
  const hasCachedQuiz =
    Array.isArray(existingQuiz?.questions) &&
    existingQuiz.questions.length > 0 &&
    existingQuiz.sourceHash === sourceHash &&
    existingQuiz.optionsHash === optionsHash;

  if (hasCachedQuiz && !regenerate) {
    return res.json({
      success: true,
      message: "Using cached quiz",
      data: {
        quiz: existingQuiz,
        model: existingQuiz.model,
        cached: true,
      },
    });
  }

  const result = await aiService.generateQuiz(plainText, {
    questionCount,
    shortQuestionCount,
    difficulty,
    includeTopics,
  });

  const normalizedQuestions = normalizeQuizQuestions(result.quiz);

  if (normalizedQuestions.length === 0) {
    throw new AppError("Failed to generate a valid quiz", 500);
  }

  note.quiz = {
    questions: normalizedQuestions,
    generatedAt: new Date(),
    model: result.model,
    sourceHash,
    optionsHash,
    attempts: [],
  };

  await note.save();

  res.json({
    success: true,
    data: {
      quiz: note.quiz,
      model: result.model,
      cached: false,
    },
  });
});

const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.canUserAccess(req.user._id)) {
    throw new AppError("Access denied", 403);
  }

  if (
    !Array.isArray(note.quiz?.questions) ||
    note.quiz.questions.length === 0
  ) {
    throw new AppError("No generated quiz found for this note", 400);
  }

  if (!Array.isArray(answers)) {
    throw new AppError("Answers must be an array", 400);
  }

  if (answers.length !== note.quiz.questions.length) {
    throw new AppError(
      "Please answer all quiz questions before submitting",
      400,
    );
  }

  const totalQuestions = note.quiz.questions.length;
  const mcqQuestions = note.quiz.questions.filter(
    (q) => (q.type || "mcq") === "mcq",
  );
  const mcqCount = mcqQuestions.length;
  let score = 0;

  const sanitizedAnswers = answers.map((answer, index) => {
    const question = note.quiz.questions[index];
    const questionType = question.type || "mcq";

    if (questionType === "short") {
      // Short answers: store user's text, mark self-graded correct if flagged
      const userText =
        typeof answer === "object" && answer !== null
          ? String(answer.text || "")
          : String(answer || "");
      const selfGraded =
        typeof answer === "object" && answer !== null
          ? Boolean(answer.correct)
          : false;

      if (selfGraded) {
        score += 1;
      }

      return { text: userText, correct: selfGraded };
    }

    // MCQ answers
    const parsedAnswer =
      typeof answer === "number"
        ? answer
        : typeof answer === "string" && answer.trim() !== ""
        ? Number(answer)
        : NaN;
    const isValidAnswer =
      Number.isInteger(parsedAnswer) &&
      parsedAnswer >= 0 &&
      parsedAnswer < question.options.length;

    if (isValidAnswer && parsedAnswer === question.correctAnswer) {
      score += 1;
    }

    return isValidAnswer ? parsedAnswer : -1;
  });

  const percentage = totalQuestions
    ? Math.round((score / totalQuestions) * 100)
    : 0;

  const attempt = {
    user: req.user._id,
    answers: sanitizedAnswers,
    score,
    totalQuestions,
    percentage,
    submittedAt: new Date(),
  };

  if (!Array.isArray(note.quiz.attempts)) {
    note.quiz.attempts = [];
  }

  note.quiz.attempts.push(attempt);

  if (note.quiz.attempts.length > 100) {
    note.quiz.attempts = note.quiz.attempts.slice(-100);
  }

  await note.save();

  res.json({
    success: true,
    message: "Quiz submitted successfully",
    data: {
      attempt,
      quiz: note.quiz,
    },
  });
});

module.exports = {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  permanentDeleteNote,
  restoreNote,
  shareNote,
  updateCollaborator,
  removeCollaborator,
  handleShareOption,
  uploadAttachment,
  deleteAttachment,
  getEditHistory,
  summarizeNote,
  extractTextFromImage,
  generateQuiz,
  submitQuizAttempt,
};
