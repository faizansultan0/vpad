const express = require("express");
const router = express.Router();
const { institutionController } = require("../controllers");
const {
  protect,
  institutionValidation,
  mongoIdParam,
} = require("../middlewares");

router.use(protect);

router
  .route("/")
  .get(institutionController.getInstitutions)
  .post(institutionValidation.create, institutionController.createInstitution);

router.post("/reorder", institutionController.reorderInstitutions);

router
  .route("/:id")
  .get(mongoIdParam, institutionController.getInstitution)
  .patch(institutionValidation.update, institutionController.updateInstitution)
  .delete(mongoIdParam, institutionController.deleteInstitution);

module.exports = router;
