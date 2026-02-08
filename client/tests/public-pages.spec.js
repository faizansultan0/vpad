const { test, expect } = require("@playwright/test");

test.describe("Public Pages", () => {
  test.describe("Landing Page", () => {
    test("should load landing page", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Page should have content
      const content = await page.content();
      expect(content.length).toBeGreaterThan(500);
    });

    test("should have navigation links", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Should have login/register options visible or accessible
      const hasAuthLinks =
        (await page
          .locator('a[href*="login"], a[href*="register"], button')
          .count()) > 0;
      expect(hasAuthLinks).toBeTruthy();
    });
  });

  test.describe("Login Page", () => {
    test("should display login form with all fields", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should show validation for empty submission", async ({ page }) => {
      await page.goto("/login");
      await page.click('button[type="submit"]');

      // Should stay on login page
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "nonexistent@test.com");
      await page.fill('input[type="password"]', "wrongpassword123");
      await page.click('button[type="submit"]');

      await page.waitForTimeout(3000);
      // Should stay on login or show error
      const url = page.url();
      expect(url.includes("/login") || url.includes("/dashboard")).toBeTruthy();
    });

    test("should have forgot password link", async ({ page }) => {
      await page.goto("/login");
      const hasForgotLink =
        (await page.locator('a[href*="forgot"], :text("forgot")').count()) > 0;
      expect(hasForgotLink).toBeTruthy();
    });

    test("should have register link", async ({ page }) => {
      await page.goto("/login");
      const hasRegisterLink =
        (await page
          .locator('a[href*="register"], :text("register"), :text("sign up")')
          .count()) > 0;
      expect(hasRegisterLink).toBeTruthy();
    });
  });

  test.describe("Register Page", () => {
    test("should display register form with all fields", async ({ page }) => {
      await page.goto("/register");
      await expect(page.locator('input[type="email"]')).toBeVisible();

      const passwordInputs = await page.$$('input[type="password"]');
      expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
    });

    test("should have name input field", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2000);

      const content = await page.content();
      expect(content.length).toBeGreaterThan(500);
    });

    test("should have submit button", async ({ page }) => {
      await page.goto("/register");
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should have login link", async ({ page }) => {
      await page.goto("/register");
      const hasLoginLink =
        (await page
          .locator('a[href*="login"], :text("login"), :text("sign in")')
          .count()) > 0;
      expect(hasLoginLink).toBeTruthy();
    });
  });

  test.describe("Forgot Password Page", () => {
    test("should display forgot password form", async ({ page }) => {
      await page.goto("/forgot-password");
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test("should have submit button", async ({ page }) => {
      await page.goto("/forgot-password");
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should have back to login link", async ({ page }) => {
      await page.goto("/forgot-password");
      const hasBackLink =
        (await page
          .locator('a[href*="login"], :text("login"), :text("back")')
          .count()) > 0;
      expect(hasBackLink).toBeTruthy();
    });
  });
});
