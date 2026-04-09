const express = require("express");
const router = express.Router();
const { authController, adminController } = require("../controllers");
const {
  protect,
  authValidation,
  authLimiter,
  uploadProfilePicture,
  handleUploadError,
} = require("../middlewares");

router.post(
  "/register",
  authLimiter,
  authValidation.register,
  authController.register,
);
router.post(
  "/verify-signup-otp",
  authLimiter,
  authValidation.verifySignupOtp,
  authController.verifySignupOtp,
);
router.post(
  "/resend-signup-otp",
  authLimiter,
  authValidation.resendSignupOtp,
  authController.resendSignupOtp,
);
router.post("/login", authLimiter, authValidation.login, authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/resend-verification",
  authLimiter,
  authValidation.forgotPassword,
  authController.resendVerification,
);
router.post(
  "/forgot-password",
  authLimiter,
  authValidation.forgotPassword,
  authController.forgotPassword,
);
router.post(
  "/reset-password/:token",
  authLimiter,
  authValidation.resetPassword,
  authController.resetPassword,
);
router.post("/refresh-token", authController.refreshToken);
router.post("/accept-admin-invite", adminController.acceptAdminInvite);

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
  authController.updateProfilePicture,
);
router.delete("/account", authController.deleteAccount);

module.exports = router;
