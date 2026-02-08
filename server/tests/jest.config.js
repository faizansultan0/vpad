module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/*.test.js"],
  setupFilesAfterEnv: ["./setup.js"],
  collectCoverageFrom: ["**/*.test.js"],
  coverageDirectory: "./coverage",
  verbose: true,
  modulePathIgnorePatterns: ["node_modules"],
};
