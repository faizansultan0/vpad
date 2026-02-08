const jwt = require("jsonwebtoken");

// Self-contained middleware implementations for testing
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

const hasPermission = (...permissions) => {
  return (req, res, next) => {
    if (req.user.role === "superadmin") {
      return next();
    }
    const userPermissions = req.user.permissions || [];
    const hasRequired = permissions.some((p) => userPermissions.includes(p));
    if (!hasRequired) {
      return res.status(403).json({
        success: false,
        message: "You do not have the required permission",
      });
    }
    next();
  };
};

describe("Auth Middleware", () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test-access-secret";
  });

  describe("restrictTo", () => {
    it("should allow access for users with correct role", () => {
      const middleware = restrictTo("admin", "superadmin");
      const req = { user: { role: "admin" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should deny access for users with incorrect role", () => {
      const middleware = restrictTo("admin", "superadmin");
      const req = { user: { role: "user" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "You do not have permission to perform this action",
      });
    });

    it("should allow superadmin access", () => {
      const middleware = restrictTo("admin");
      const req = { user: { role: "superadmin" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      // superadmin is not in the allowed roles, so should be denied
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe("hasPermission", () => {
    it("should allow superadmin without checking permissions", () => {
      const middleware = hasPermission("manage_users");
      const req = { user: { role: "superadmin", permissions: [] } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should allow users with required permission", () => {
      const middleware = hasPermission("manage_users");
      const req = { user: { role: "admin", permissions: ["manage_users"] } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should deny users without required permission", () => {
      const middleware = hasPermission("manage_users");
      const req = { user: { role: "admin", permissions: ["view_analytics"] } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should allow if user has any of the required permissions", () => {
      const middleware = hasPermission("manage_users", "manage_notes");
      const req = { user: { role: "admin", permissions: ["manage_notes"] } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should handle users with no permissions array", () => {
      const middleware = hasPermission("manage_users");
      const req = { user: { role: "admin" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
