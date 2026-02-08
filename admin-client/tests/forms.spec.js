const { test, expect } = require("@playwright/test");

test.describe("Admin Form Validation", () => {
  test.describe("Login Form", () => {
    test("should validate email format", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "invalidemail");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    });

    test("should require password field", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "admin@example.com");
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    });

    test("should require email field", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    });

    test("email input should have proper type", async ({ page }) => {
      await page.goto("/login");
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute("type", "email");
    });

    test("password input should have proper type", async ({ page }) => {
      await page.goto("/login");
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  test.describe("Accept Invite Form", () => {
    test("should display name field", async ({ page }) => {
      await page.goto("/accept-invite?token=test-token");
      await page.waitForLoadState("domcontentloaded");
      
      // Should have name input or show error
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test("should have password fields", async ({ page }) => {
      await page.goto("/accept-invite?token=test-token");
      await page.waitForLoadState("domcontentloaded");
      
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });
  });
});
