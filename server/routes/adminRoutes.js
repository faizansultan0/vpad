const express = require("express");
const router = express.Router();
const { adminController, contactController } = require("../controllers");
const {
  protect,
  restrictTo,
  hasPermission,
  mongoIdParam,
  contactValidation,
} = require("../middlewares");

router.use(protect);
router.use(restrictTo("admin", "superadmin"));

router.get(
  "/dashboard",
  hasPermission("view_analytics"),
  adminController.getDashboardStats,
);

router.get("/users", hasPermission("manage_users"), adminController.getUsers);
router.get(
  "/users/:id",
  hasPermission("manage_users"),
  mongoIdParam,
  adminController.getUser,
);
router.patch(
  "/users/:id",
  hasPermission("manage_users"),
  mongoIdParam,
  adminController.updateUser,
);
router.delete(
  "/users/:id",
  hasPermission("manage_users"),
  mongoIdParam,
  adminController.deleteUser,
);

router.get(
  "/contacts",
  hasPermission("manage_contacts"),
  contactController.getContacts,
);
router.get(
  "/contacts/:id",
  hasPermission("manage_contacts"),
  mongoIdParam,
  contactController.getContact,
);
router.patch(
  "/contacts/:id/status",
  hasPermission("manage_contacts"),
  contactValidation.updateStatus,
  contactController.updateContactStatus,
);
router.patch(
  "/contacts/:id/assign",
  hasPermission("manage_contacts"),
  contactValidation.assign,
  contactController.assignContact,
);
router.post(
  "/contacts/:id/reply",
  hasPermission("manage_contacts"),
  contactValidation.reply,
  contactController.replyToContact,
);

router.use(restrictTo("superadmin"));

router.get("/admins", adminController.getAdmins);
router.post("/admins", adminController.createAdmin);
router.post("/admins/invite", adminController.inviteAdmin);
router.patch(
  "/admins/:id/permissions",
  mongoIdParam,
  adminController.updateAdminPermissions,
);
router.delete("/admins/:id", mongoIdParam, adminController.removeAdmin);

router
  .route("/announcements")
  .get(adminController.getAnnouncements)
  .post(adminController.createAnnouncement);

router
  .route("/announcements/:id")
  .patch(mongoIdParam, adminController.updateAnnouncement)
  .delete(mongoIdParam, adminController.deleteAnnouncement);

module.exports = router;
