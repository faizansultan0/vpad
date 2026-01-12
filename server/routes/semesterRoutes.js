const express = require("express");
const router = express.Router();
const { semesterController } = require("../controllers");
const { protect, semesterValidation, mongoIdParam } = require("../middlewares");

router.use(protect);

router
  .route("/")
  .get(semesterController.getSemesters)
  .post(semesterValidation.create, semesterController.createSemester);

router.post("/reorder", semesterController.reorderSemesters);

router
  .route("/:id")
  .get(mongoIdParam, semesterController.getSemester)
  .patch(semesterValidation.update, semesterController.updateSemester)
  .delete(mongoIdParam, semesterController.deleteSemester);

module.exports = router;
