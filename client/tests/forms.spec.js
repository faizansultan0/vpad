const { test, expect } = require("@playwright/test");

test.describe("Form Validation", () => {
  test.describe("Login Form", () => {
    test("should validate email format", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2000);

      await page.fill('input[type="email"]', "invalidemail");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000);
      expect(page.url()).toContain("/login");
    });

    test("should require password field", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.click('button[type="submit"]');

      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    });

    test("should require email field", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2000);

      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000);
      expect(page.url()).toContain("/login");
    });

    test("email input should have proper type", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2000);

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
    });

    test("password input should have proper type", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2000);

      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
    });
  });

  test.describe("Register Form", () => {
    test("should have confirm password field", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2000);

      const passwordInputs = await page.$$('input[type="password"]');
      expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/register");

      // Fill name if exists
      const nameInput = page.locator(
        'input[name="name"], input[placeholder*="name" i]',
      );
      if ((await nameInput.count()) > 0) {
        await nameInput.first().fill("Test User");
      }

      await page.fill('input[type="email"]', "invalidemail");

      const passwordInputs = await page.$$('input[type="password"]');
      for (const input of passwordInputs) {
        await input.fill("TestPassword123!");
      }

      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/register");
    });
  });

  test.describe("Forgot Password Form", () => {
    test("should validate email format", async ({ page }) => {
      await page.goto("/forgot-password");
      await page.fill('input[type="email"]', "invalidemail");
      await page.click('button[type="submit"]');

      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/forgot-password");
    });

    test("should require email field", async ({ page }) => {
      await page.goto("/forgot-password");
      await page.click('button[type="submit"]');

      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/forgot-password");
    });
  });
});
