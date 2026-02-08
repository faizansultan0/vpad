const { expect } = require("@playwright/test");

const generateTestUser = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    name: `Test User ${timestamp}`,
    email: `testuser_${timestamp}_${random}@test.com`,
    password: "TestPassword123!",
  };
};

const waitForToast = async (page, text = null, timeout = 5000) => {
  const toastSelector =
    "[role='status'], .toast, .Toastify, [data-testid='toast']";
  try {
    await page.waitForSelector(toastSelector, { timeout });
    if (text) {
      await expect(page.locator(toastSelector)).toContainText(text);
    }
    return true;
  } catch {
    return false;
  }
};

const login = async (page, email, password) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
};

const register = async (page, user) => {
  await page.goto("/register");
  await page.fill(
    'input[name="name"], input[placeholder*="name" i]',
    user.name,
  );
  await page.fill('input[type="email"]', user.email);

  const passwordInputs = await page.$$('input[type="password"]');
  if (passwordInputs.length >= 2) {
    await passwordInputs[0].fill(user.password);
    await passwordInputs[1].fill(user.password);
  }

  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
};

const logout = async (page) => {
  try {
    const userMenu = await page.$(
      "[data-testid='user-menu'], .user-menu, .avatar",
    );
    if (userMenu) {
      await userMenu.click();
    }
    await page.click(
      "button:has-text('Logout'), button:has-text('Sign out'), [data-testid='logout']",
    );
    await page.waitForLoadState("networkidle");
  } catch {
    // Already logged out or menu not found
  }
};

const clearLocalStorage = async (page) => {
  try {
    // Only clear if we're on a valid page (not about:blank)
    const url = page.url();
    if (url && !url.startsWith("about:")) {
      await page.evaluate(() => localStorage.clear());
    }
  } catch {
    // Ignore errors - localStorage might not be accessible yet
  }
};

const mockApiResponse = async (page, url, response) => {
  await page.route(url, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    }),
  );
};

module.exports = {
  generateTestUser,
  waitForToast,
  login,
  register,
  logout,
  clearLocalStorage,
  mockApiResponse,
};
