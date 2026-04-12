const express = require("express");
const router = express.Router();
const { contactController } = require("../controllers");
const { contactValidation } = require("../middlewares");

router.post(
  "/",
  contactValidation.create,
  contactController.createContactSubmission,
);

module.exports = router;
