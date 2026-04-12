const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const institutionRoutes = require("./institutionRoutes");
const semesterRoutes = require("./semesterRoutes");
const subjectRoutes = require("./subjectRoutes");
const noteRoutes = require("./noteRoutes");
const commentRoutes = require("./commentRoutes");
const notificationRoutes = require("./notificationRoutes");
const adminRoutes = require("./adminRoutes");
const contactRoutes = require("./contactRoutes");

router.use("/auth", authRoutes);
router.use("/institutions", institutionRoutes);
router.use("/semesters", semesterRoutes);
router.use("/subjects", subjectRoutes);
router.use("/notes", noteRoutes);
router.use("/comments", commentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/contacts", contactRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "VPad API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
