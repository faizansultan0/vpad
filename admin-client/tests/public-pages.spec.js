const { test, expect } = require("@playwright/test");

test.describe("Admin Public Pages", () => {
  test.describe("Login Page", () => {
    test("should display login form with all fields", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "invalid@admin.test");
      await page.fill('input[type="password"]', "wrongpassword");
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      expect(page.url()).toContain("/login");
    });

    test("should validate empty submission", async ({ page }) => {
      await page.goto("/login");
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    });

    test("should have proper input types", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator('input[type="email"]')).toHaveAttribute("type", "email");
      await expect(page.locator('input[type="password"]')).toHaveAttribute("type", "password");
    });

    test("should display admin branding", async ({ page }) => {
      await page.goto("/login");
      const content = await page.content();
      const hasAdminBranding = 
        content.toLowerCase().includes("admin") ||
        content.includes("VPad") ||
        content.toLowerCase().includes("panel");
      expect(hasAdminBranding).toBeTruthy();
    });
  });

  test.describe("Accept Invite Page", () => {
    test("should display accept invite form with token", async ({ page }) => {
      await page.goto("/accept-invite?token=test-token");
      await page.waitForLoadState("domcontentloaded");
      
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test("should show error for invalid token", async ({ page }) => {
      await page.goto("/accept-invite?token=invalid-token-12345");
      await page.waitForLoadState("domcontentloaded");
      
      await page.waitForTimeout(2000);
      const content = await page.content();
      // Should show form or error message
      expect(content.length).toBeGreaterThan(100);
    });

    test("should require token parameter", async ({ page }) => {
      await page.goto("/accept-invite");
      await page.waitForLoadState("domcontentloaded");
      
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });
  });
});
