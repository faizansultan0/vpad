const express = require("express");
const router = express.Router();
const { adminController } = require("../controllers");
const {
  protect,
  restrictTo,
  hasPermission,
  mongoIdParam,
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
