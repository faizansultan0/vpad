module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js"],
  collectCoverageFrom: [
    "utils/**/*.js",
    "middlewares/**/*.js",
    "controllers/**/*.js",
    "services/**/*.js",
    "!**/node_modules/**",
    "!**/index.js",
  ],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 10000,
  verbose: true,
};
