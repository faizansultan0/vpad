const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const {
  protect,
  authValidation,
  uploadProfilePicture,
  handleUploadError,
} = require("../middlewares");

router.post("/register", authValidation.register, authController.register);
router.post("/login", authValidation.login, authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/resend-verification",
  authValidation.forgotPassword,
  authController.resendVerification
);
router.post(
  "/forgot-password",
  authValidation.forgotPassword,
  authController.forgotPassword
);
router.post(
  "/reset-password/:token",
  authValidation.resetPassword,
  authController.resetPassword
);
router.post("/refresh-token", authController.refreshToken);

router.use(protect);

router.get("/me", authController.getMe);
router.post("/logout", authController.logout);
router.post("/logout-all", authController.logoutAll);
router.patch("/profile", authController.updateProfile);
router.patch("/email", authController.updateEmail);
router.patch("/password", authController.updatePassword);
router.patch(
  "/profile-picture",
  uploadProfilePicture.single("image"),
  handleUploadError,
  authController.updateProfilePicture
);
router.delete("/account", authController.deleteAccount);

module.exports = router;
