const {
  sanitizeUser,
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
} = require("../../utils/helpers");

describe("Helper Utils", () => {
  describe("sanitizeUser", () => {
    it("should remove sensitive fields from user object", () => {
      const mockUser = {
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        refreshTokens: ["token1", "token2"],
        emailVerificationToken: "verifytoken",
        emailVerificationExpires: new Date(),
        passwordResetToken: "resettoken",
        passwordResetExpires: new Date(),
        toObject: function () {
          return { ...this };
        },
      };

      const sanitized = sanitizeUser(mockUser);

      expect(sanitized.name).toBe("Test User");
      expect(sanitized.email).toBe("test@example.com");
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.refreshTokens).toBeUndefined();
      expect(sanitized.emailVerificationToken).toBeUndefined();
      expect(sanitized.passwordResetToken).toBeUndefined();
    });

    it("should handle plain objects without toObject method", () => {
      const plainUser = {
        name: "Plain User",
        password: "secret",
      };

      const sanitized = sanitizeUser(plainUser);
      expect(sanitized.name).toBe("Plain User");
      expect(sanitized.password).toBeUndefined();
    });
  });

  describe("getPaginationInfo", () => {
    it("should calculate pagination correctly", () => {
      const result = getPaginationInfo(100, 2, 10);

      expect(result.total).toBe(100);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(10);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
    });

    it("should handle first page", () => {
      const result = getPaginationInfo(50, 1, 10);

      expect(result.hasPrevPage).toBe(false);
      expect(result.hasNextPage).toBe(true);
    });

    it("should handle last page", () => {
      const result = getPaginationInfo(50, 5, 10);

      expect(result.hasPrevPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
    });

    it("should handle single page", () => {
      const result = getPaginationInfo(5, 1, 10);

      expect(result.totalPages).toBe(1);
      expect(result.hasPrevPage).toBe(false);
      expect(result.hasNextPage).toBe(false);
    });
  });

  describe("buildSearchQuery", () => {
    it("should build regex search query for multiple fields", () => {
      const query = buildSearchQuery("test", ["name", "email"]);

      expect(query.$or).toHaveLength(2);
      expect(query.$or[0].name).toBeInstanceOf(RegExp);
      expect(query.$or[1].email).toBeInstanceOf(RegExp);
    });

    it("should return empty object for empty search term", () => {
      const query = buildSearchQuery("", ["name"]);
      expect(query).toEqual({});
    });

    it("should return empty object for null search term", () => {
      const query = buildSearchQuery(null, ["name"]);
      expect(query).toEqual({});
    });
  });

  describe("buildSortQuery", () => {
    it("should build descending sort query by default", () => {
      const query = buildSortQuery("createdAt");
      expect(query.createdAt).toBe(-1);
    });

    it("should build ascending sort query", () => {
      const query = buildSortQuery("name", "asc");
      expect(query.name).toBe(1);
    });

    it("should build descending sort query explicitly", () => {
      const query = buildSortQuery("updatedAt", "desc");
      expect(query.updatedAt).toBe(-1);
    });
  });

  describe("detectLanguage", () => {
    it("should detect English text", () => {
      expect(detectLanguage("Hello World")).toBe("en");
    });

    it("should detect Urdu text", () => {
      expect(detectLanguage("سلام دنیا")).toBe("ur");
    });

    it("should detect mixed language text", () => {
      expect(detectLanguage("Hello سلام World")).toBe("mixed");
    });

    it("should default to English for empty or special characters", () => {
      expect(detectLanguage("123 !@#")).toBe("en");
    });
  });

  describe("isRtlText", () => {
    it("should return true for RTL text", () => {
      // Using Arabic text that's more reliably detected
      const rtlText = "\u0633\u0644\u0627\u0645"; // "سلام" in unicode
      expect(isRtlText(rtlText)).toBe(true);
    });

    it("should return false for LTR text", () => {
      expect(isRtlText("Hello World")).toBe(false);
    });

    it("should return false for mostly English mixed text", () => {
      expect(isRtlText("Hello World Test")).toBe(false);
    });
  });

  describe("stripHtmlTags", () => {
    it("should remove HTML tags", () => {
      expect(stripHtmlTags("<p>Hello</p>")).toBe("Hello");
    });

    it("should handle nested tags", () => {
      expect(stripHtmlTags("<div><p>Hello <b>World</b></p></div>")).toBe(
        "Hello World",
      );
    });

    it("should handle text without tags", () => {
      expect(stripHtmlTags("Plain text")).toBe("Plain text");
    });
  });

  describe("truncateText", () => {
    it("should truncate long text", () => {
      const longText = "This is a very long text that needs to be truncated";
      const result = truncateText(longText, 20);

      expect(result.length).toBeLessThanOrEqual(23); // 20 + "..."
      expect(result.endsWith("...")).toBe(true);
    });

    it("should not truncate short text", () => {
      const shortText = "Short";
      expect(truncateText(shortText, 100)).toBe("Short");
    });

    it("should use default max length", () => {
      const text = "a".repeat(150);
      const result = truncateText(text);

      expect(result.length).toBeLessThanOrEqual(103);
    });
  });

  describe("generateSlug", () => {
    it("should generate slug from text", () => {
      expect(generateSlug("Hello World")).toBe("hello-world");
    });

    it("should remove special characters", () => {
      expect(generateSlug("Hello! World?")).toBe("hello-world");
    });

    it("should handle multiple spaces", () => {
      expect(generateSlug("Hello   World")).toBe("hello-world");
    });

    it("should handle multiple dashes", () => {
      expect(generateSlug("Hello--World")).toBe("hello-world");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date, "en-US");

      expect(formatted).toContain("January");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time correctly", () => {
      const date = new Date("2024-01-15T14:30:00");
      const formatted = formatDateTime(date, "en-US");

      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });
  });

  describe("delay", () => {
    it("should delay execution", async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(95);
    });
  });
});
