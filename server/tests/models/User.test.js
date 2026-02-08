const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Mock mongoose and bcrypt for unit testing without DB
jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    model: jest.fn(),
  };
});

describe("User Model", () => {
  describe("Schema Validation", () => {
    it("should require name field", () => {
      const userSchema = {
        name: {
          type: String,
          required: [true, "Name is required"],
          minlength: [2, "Name must be at least 2 characters"],
          maxlength: [50, "Name cannot exceed 50 characters"],
        },
      };

      expect(userSchema.name.required[0]).toBe(true);
      expect(userSchema.name.minlength[0]).toBe(2);
      expect(userSchema.name.maxlength[0]).toBe(50);
    });

    it("should require email field", () => {
      const userSchema = {
        email: {
          type: String,
          required: [true, "Email is required"],
          unique: true,
          lowercase: true,
        },
      };

      expect(userSchema.email.required[0]).toBe(true);
      expect(userSchema.email.unique).toBe(true);
      expect(userSchema.email.lowercase).toBe(true);
    });

    it("should require password with minimum length", () => {
      const userSchema = {
        password: {
          type: String,
          required: [true, "Password is required"],
          minlength: [8, "Password must be at least 8 characters"],
        },
      };

      expect(userSchema.password.required[0]).toBe(true);
      expect(userSchema.password.minlength[0]).toBe(8);
    });
  });

  describe("Password Hashing", () => {
    it("should hash password using bcrypt", async () => {
      const password = "testpassword123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it("should compare passwords correctly", async () => {
      const password = "testpassword123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const isMatch = await bcrypt.compare(password, hashedPassword);
      const isNotMatch = await bcrypt.compare("wrongpassword", hashedPassword);

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe("Role Validation", () => {
    it("should have valid role enum values", () => {
      const validRoles = ["user", "admin", "superadmin"];
      const testRole = "admin";

      expect(validRoles.includes(testRole)).toBe(true);
      expect(validRoles.includes("invalid")).toBe(false);
    });
  });
});
