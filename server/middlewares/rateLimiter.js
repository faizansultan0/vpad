const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  "Too many requests from this IP, please try again after 15 minutes"
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many authentication attempts, please try again after 15 minutes"
);

const apiLimiter = createRateLimiter(
  60 * 1000,
  60,
  "Too many API requests, please slow down"
);

const uploadLimiter = createRateLimiter(
  60 * 60 * 1000,
  30,
  "Too many uploads, please try again after an hour"
);

const aiLimiter = createRateLimiter(
  60 * 60 * 1000,
  20,
  "AI feature rate limit reached, please try again after an hour"
);

module.exports = {
  createRateLimiter,
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  aiLimiter,
};
