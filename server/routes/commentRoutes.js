const express = require("express");
const router = express.Router();
const { commentController } = require("../controllers");
const { protect, commentValidation, mongoIdParam } = require("../middlewares");

router.use(protect);

router.post("/", commentValidation.create, commentController.createComment);
router.get("/note/:noteId", commentController.getComments);

router
  .route("/:id")
  .patch(commentValidation.update, commentController.updateComment)
  .delete(mongoIdParam, commentController.deleteComment);

router.post("/:id/reaction", mongoIdParam, commentController.addReaction);

module.exports = router;
