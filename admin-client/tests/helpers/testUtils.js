const generateTestAdmin = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    email: `testadmin_${timestamp}_${random}@test.com`,
    password: "AdminPassword123!",
  };
};

const clearLocalStorage = async (page) => {
  try {
    const url = page.url();
    if (url && !url.startsWith("about:")) {
      await page.evaluate(() => localStorage.clear());
    }
  } catch {
    // Ignore errors
  }
};

const login = async (page, email, password) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
};

const logout = async (page) => {
  try {
    const userMenu = await page.$("[data-testid='user-menu'], .user-menu");
    if (userMenu) {
      await userMenu.click();
    }
    await page.click("button:has-text('Logout'), [data-testid='logout']");
    await page.waitForLoadState("networkidle");
  } catch {
    // Already logged out
  }
};

module.exports = {
  generateTestAdmin,
  clearLocalStorage,
  login,
  logout,
};
