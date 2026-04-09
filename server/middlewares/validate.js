const { validationResult, body, param, query } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const authValidation = {
  register: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail({ gmail_remove_subaddress: false }),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase, one lowercase, and one number",
      ),
    validate,
  ],
  login: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail({ gmail_remove_subaddress: false }),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  forgotPassword: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail({ gmail_remove_subaddress: false }),
    validate,
  ],
  verifySignupOtp: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail({ gmail_remove_subaddress: false }),
    body("otp")
      .trim()
      .notEmpty()
      .withMessage("Verification code is required")
      .matches(/^\d{6}$/)
      .withMessage("Verification code must be 6 digits"),
    validate,
  ],
  resendSignupOtp: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail({ gmail_remove_subaddress: false }),
    validate,
  ],
  resetPassword: [
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase, one lowercase, and one number",
      ),
    validate,
  ],
};

const institutionValidation = {
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Institution name is required")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),
    body("type")
      .notEmpty()
      .withMessage("Institution type is required")
      .isIn(["school", "college", "university", "other"])
      .withMessage("Invalid institution type"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    validate,
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid institution ID"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),
    body("type")
      .optional()
      .isIn(["school", "college", "university", "other"])
      .withMessage("Invalid institution type"),
    validate,
  ],
};

const semesterValidation = {
  create: [
    body("institutionId").isMongoId().withMessage("Invalid institution ID"),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Semester name is required")
      .isLength({ max: 50 })
      .withMessage("Name cannot exceed 50 characters"),
    body("type")
      .optional()
      .isIn(["semester", "year", "term", "quarter"])
      .withMessage("Invalid semester type"),
    validate,
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid semester ID"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ max: 50 })
      .withMessage("Name cannot exceed 50 characters"),
    validate,
  ],
};

const subjectValidation = {
  create: [
    body("semesterId").isMongoId().withMessage("Invalid semester ID"),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Subject name is required")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),
    body("code")
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage("Code cannot exceed 20 characters"),
    validate,
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid subject ID"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),
    validate,
  ],
};

const noteValidation = {
  create: [
    body("subjectId").isMongoId().withMessage("Invalid subject ID"),
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Note title is required")
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
    body("content").optional(),
    body("language")
      .optional()
      .isIn(["en", "ur", "mixed"])
      .withMessage("Invalid language"),
    validate,
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid note ID"),
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty")
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
    validate,
  ],
  share: [
    param("id").isMongoId().withMessage("Invalid note ID"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("permission")
      .optional()
      .isIn(["view", "edit", "admin"])
      .withMessage("Invalid permission"),
    validate,
  ],
};

const commentValidation = {
  create: [
    body("noteId").isMongoId().withMessage("Invalid note ID"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content is required")
      .isLength({ max: 5000 })
      .withMessage("Comment cannot exceed 5000 characters"),
    body("parentCommentId")
      .optional()
      .isMongoId()
      .withMessage("Invalid parent comment ID"),
    validate,
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid comment ID"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content is required")
      .isLength({ max: 5000 })
      .withMessage("Comment cannot exceed 5000 characters"),
    validate,
  ],
};

const mongoIdParam = [
  param("id").isMongoId().withMessage("Invalid ID"),
  validate,
];

module.exports = {
  validate,
  authValidation,
  institutionValidation,
  semesterValidation,
  subjectValidation,
  noteValidation,
  commentValidation,
  mongoIdParam,
};
