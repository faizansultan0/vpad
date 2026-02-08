const mongoose = require("mongoose");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-12345";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key-12345";
process.env.JWT_EXPIRES_IN = "1h";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.MONGODB_URI = "mongodb://localhost:27017/vpad_test";

jest.mock("mongoose", () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    on: jest.fn(),
    once: jest.fn(),
    readyState: 0,
  },
  Schema: class Schema {
    constructor() {}
    pre() {
      return this;
    }
    methods = {};
    statics = {};
    index() {
      return this;
    }
  },
  model: jest.fn().mockReturnValue({}),
}));

beforeAll(async () => {
  // Use in-memory MongoDB for tests if available, otherwise mock
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

afterEach(() => {
  jest.clearAllMocks();
});
