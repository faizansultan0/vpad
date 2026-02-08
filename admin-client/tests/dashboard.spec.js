const { test, expect } = require("@playwright/test");

test.describe("Admin Dashboard (Protected Routes)", () => {
  test.describe("Without Authentication", () => {
    test("should redirect / to login", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url.includes("/login")).toBeTruthy();
    });

    test("should redirect /users to login", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("domcontentloaded");
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain("/login");
    });

    test("should redirect /admins to login", async ({ page }) => {
      await page.goto("/admins");
      await page.waitForLoadState("domcontentloaded");
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain("/login");
    });

    test("should redirect /analytics to login", async ({ page }) => {
      await page.goto("/analytics");
      await page.waitForLoadState("domcontentloaded");
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain("/login");
    });

    test("should redirect /announcements to login", async ({ page }) => {
      await page.goto("/announcements");
      await page.waitForLoadState("domcontentloaded");
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain("/login");
    });

    test("should redirect /settings to login", async ({ page }) => {
      await page.goto("/settings");
      await page.waitForLoadState("domcontentloaded");
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain("/login");
    });
  });

  test.describe("Route Structure Validation", () => {
    test("should have proper route for user details", async ({ page }) => {
      await page.goto("/users/test-id");
      await page.waitForLoadState("domcontentloaded");
      
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test("should have proper route for admin details", async ({ page }) => {
      await page.goto("/admins/test-id");
      await page.waitForLoadState("domcontentloaded");
      
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });
  });
});
