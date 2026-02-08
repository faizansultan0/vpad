const { AppError, asyncHandler } = require("../../middlewares/errorHandler");

describe("Error Handler Middleware", () => {
  describe("AppError", () => {
    it("should create an error with message and status code", () => {
      const error = new AppError("Test error", 400);

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe("fail");
      expect(error.isOperational).toBe(true);
    });

    it("should set status to fail for 4xx errors", () => {
      const error = new AppError("Not found", 404);
      expect(error.status).toBe("fail");
    });

    it("should set status to error for 5xx errors", () => {
      const error = new AppError("Server error", 500);
      expect(error.status).toBe("error");
    });

    it("should be an instance of Error", () => {
      const error = new AppError("Test", 400);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("asyncHandler", () => {
    it("should pass through successful async function", async () => {
      const mockFn = jest.fn().mockResolvedValue("success");
      const handler = asyncHandler(mockFn);
      const req = {};
      const res = {};
      const next = jest.fn();

      await handler(req, res, next);

      expect(mockFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it("should catch errors and pass to next", async () => {
      const error = new Error("Async error");
      const mockFn = jest.fn().mockRejectedValue(error);
      const handler = asyncHandler(mockFn);
      const req = {};
      const res = {};
      const next = jest.fn();

      await handler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("should wrap function in promise", () => {
      const mockFn = jest.fn().mockResolvedValue("result");
      const handler = asyncHandler(mockFn);

      expect(typeof handler).toBe("function");
      expect(handler.length).toBe(3); // req, res, next
    });
  });
});
