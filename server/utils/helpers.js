const sanitizeUser = (user) => {
  const sanitized = user.toObject ? user.toObject() : { ...user };
  delete sanitized.password;
  delete sanitized.refreshTokens;
  delete sanitized.emailVerificationToken;
  delete sanitized.emailVerificationExpires;
  delete sanitized.passwordResetToken;
  delete sanitized.passwordResetExpires;
  return sanitized;
};

const paginateResults = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

const getPaginationInfo = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};

  const regex = new RegExp(searchTerm, "i");
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

const buildSortQuery = (sortBy, sortOrder = "desc") => {
  const order = sortOrder === "asc" ? 1 : -1;
  return { [sortBy]: order };
};

const detectLanguage = (text) => {
  const urduPattern = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const englishPattern = /[a-zA-Z]/;

  const hasUrdu = urduPattern.test(text);
  const hasEnglish = englishPattern.test(text);

  if (hasUrdu && hasEnglish) return "mixed";
  if (hasUrdu) return "ur";
  return "en";
};

const isRtlText = (text) => {
  const rtlPattern = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const rtlChars = (text.match(rtlPattern) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  return rtlChars > totalChars / 2;
};

const stripHtmlTags = (html) => {
  return html.replace(/<[^>]*>/g, "");
};

const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
};

const formatDate = (date, locale = "en-US") => {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (date, locale = "en-US") => {
  return new Date(date).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  sanitizeUser,
  paginateResults,
  getPaginationInfo,
  buildSearchQuery,
  buildSortQuery,
  detectLanguage,
  isRtlText,
  stripHtmlTags,
  truncateText,
  generateSlug,
  formatDate,
  formatDateTime,
  delay,
};
