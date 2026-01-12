const express = require("express");
const router = express.Router();
const { subjectController } = require("../controllers");
const { protect, subjectValidation, mongoIdParam } = require("../middlewares");

router.use(protect);

router
  .route("/")
  .get(subjectController.getSubjects)
  .post(subjectValidation.create, subjectController.createSubject);

router.post("/reorder", subjectController.reorderSubjects);

router
  .route("/:id")
  .get(mongoIdParam, subjectController.getSubject)
  .patch(subjectValidation.update, subjectController.updateSubject)
  .delete(mongoIdParam, subjectController.deleteSubject);

module.exports = router;
