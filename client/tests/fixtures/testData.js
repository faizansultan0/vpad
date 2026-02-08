// Test credentials - these should match actual test users in the database
// For E2E tests, create test users via the app or API before running

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "testuser@vpad.test",
  password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  name: "Test User",
};

const generateUniqueEmail = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test_${timestamp}_${random}@vpad.test`;
};

const generateTestUser = () => ({
  name: `Test User ${Date.now()}`,
  email: generateUniqueEmail(),
  password: "TestPassword123!",
});

module.exports = {
  TEST_USER,
  generateUniqueEmail,
  generateTestUser,
};
