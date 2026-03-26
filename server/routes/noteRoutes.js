const express = require("express");
const router = express.Router();
const { noteController } = require("../controllers");
const {
  protect,
  noteValidation,
  mongoIdParam,
  uploadImage,
  handleUploadError,
} = require("../middlewares");

router.use(protect);

router
  .route("/")
  .get(noteController.getNotes)
  .post(noteValidation.create, noteController.createNote);

router.post("/extract-text", noteController.extractTextFromImage);

router
  .route("/:id")
  .get(mongoIdParam, noteController.getNote)
  .patch(noteValidation.update, noteController.updateNote)
  .delete(mongoIdParam, noteController.deleteNote);

router.delete(
  "/:id/permanent",
  mongoIdParam,
  noteController.permanentDeleteNote
);
router.post("/:id/restore", mongoIdParam, noteController.restoreNote);

router.post("/:id/share", noteValidation.share, noteController.shareNote);
router.patch(
  "/:id/collaborator",
  mongoIdParam,
  noteController.updateCollaborator
);
router.delete(
  "/:id/collaborator/:collaboratorId",
  mongoIdParam,
  noteController.removeCollaborator
);
router.post(
  "/:id/share-option",
  mongoIdParam,
  noteController.handleShareOption
);

router.post(
  "/:id/attachment",
  mongoIdParam,
  uploadImage.single("file"),
  handleUploadError,
  noteController.uploadAttachment
);
router.delete(
  "/:id/attachment/:attachmentId",
  mongoIdParam,
  noteController.deleteAttachment
);

router.get("/:id/history", mongoIdParam, noteController.getEditHistory);

router.post("/:id/summarize", mongoIdParam, noteController.summarizeNote);
router.post("/:id/quiz", mongoIdParam, noteController.generateQuiz);
router.post("/:id/quiz/submit", mongoIdParam, noteController.submitQuizAttempt);

module.exports = router;
