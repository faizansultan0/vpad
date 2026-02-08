const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomToken,
  generateVerificationToken,
  generatePasswordResetToken,
  hashToken,
} = require("../../utils/token");

describe("Token Utils", () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test-access-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
    process.env.JWT_ACCESS_EXPIRES_IN = "15m";
    process.env.JWT_REFRESH_EXPIRES_IN = "7d";
  });

  describe("generateAccessToken", () => {
    it("should generate a valid JWT access token", () => {
      const userId = "user123";
      const token = generateAccessToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      expect(decoded.userId).toBe(userId);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid JWT refresh token", () => {
      const userId = "user123";
      const token = generateRefreshToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      expect(decoded.userId).toBe(userId);
    });
  });

  describe("generateTokens", () => {
    it("should generate both access and refresh tokens", () => {
      const userId = "user123";
      const tokens = generateTokens(userId);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      const accessDecoded = jwt.verify(
        tokens.accessToken,
        process.env.JWT_ACCESS_SECRET
      );
      const refreshDecoded = jwt.verify(
        tokens.refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      expect(accessDecoded.userId).toBe(userId);
      expect(refreshDecoded.userId).toBe(userId);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token", () => {
      const userId = "user123";
      const token = generateAccessToken(userId);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(userId);
    });

    it("should throw error for invalid token", () => {
      expect(() => verifyAccessToken("invalid-token")).toThrow();
    });

    it("should throw error for token with wrong secret", () => {
      const token = jwt.sign({ userId: "123" }, "wrong-secret");
      expect(() => verifyAccessToken(token)).toThrow();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token", () => {
      const userId = "user123";
      const token = generateRefreshToken(userId);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(userId);
    });

    it("should throw error for invalid token", () => {
      expect(() => verifyRefreshToken("invalid-token")).toThrow();
    });
  });

  describe("generateRandomToken", () => {
    it("should generate a random hex string of default length", () => {
      const token = generateRandomToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it("should generate a token of specified length", () => {
      const token = generateRandomToken(16);

      expect(token.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it("should generate unique tokens", () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("generateVerificationToken", () => {
    it("should generate token, hashed token, and expiry", () => {
      const result = generateVerificationToken();

      expect(result.token).toBeDefined();
      expect(result.hashedToken).toBeDefined();
      expect(result.expires).toBeInstanceOf(Date);
      expect(result.token).not.toBe(result.hashedToken);
    });

    it("should set expiry 24 hours in the future", () => {
      const result = generateVerificationToken();
      const now = Date.now();
      const expectedExpiry = now + 24 * 60 * 60 * 1000;

      expect(result.expires.getTime()).toBeGreaterThan(now);
      expect(result.expires.getTime()).toBeLessThanOrEqual(expectedExpiry + 1000);
    });
  });

  describe("generatePasswordResetToken", () => {
    it("should generate token, hashed token, and expiry", () => {
      const result = generatePasswordResetToken();

      expect(result.token).toBeDefined();
      expect(result.hashedToken).toBeDefined();
      expect(result.expires).toBeInstanceOf(Date);
    });

    it("should set expiry 1 hour in the future", () => {
      const result = generatePasswordResetToken();
      const now = Date.now();
      const expectedExpiry = now + 60 * 60 * 1000;

      expect(result.expires.getTime()).toBeGreaterThan(now);
      expect(result.expires.getTime()).toBeLessThanOrEqual(expectedExpiry + 1000);
    });
  });

  describe("hashToken", () => {
    it("should hash a token using SHA256", () => {
      const token = "test-token";
      const hashed = hashToken(token);

      expect(hashed).toBeDefined();
      expect(hashed.length).toBe(64); // SHA256 = 64 hex chars
    });

    it("should produce consistent hashes", () => {
      const token = "test-token";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different tokens", () => {
      const hash1 = hashToken("token1");
      const hash2 = hashToken("token2");

      expect(hash1).not.toBe(hash2);
    });
  });
});
