const { protect, optionalAuth, restrictTo, hasPermission } = require("./auth");
const {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
} = require("./errorHandler");
const {
  upload,
  uploadImage,
  uploadProfilePicture,
  handleUploadError,
} = require("./upload");
const {
  validate,
  authValidation,
  institutionValidation,
  semesterValidation,
  subjectValidation,
  noteValidation,
  commentValidation,
  mongoIdParam,
} = require("./validate");
const {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  aiLimiter,
} = require("./rateLimiter");

module.exports = {
  protect,
  optionalAuth,
  restrictTo,
  hasPermission,
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
  upload,
  uploadImage,
  uploadProfilePicture,
  handleUploadError,
  validate,
  authValidation,
  institutionValidation,
  semesterValidation,
  subjectValidation,
  noteValidation,
  commentValidation,
  mongoIdParam,
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  aiLimiter,
};
