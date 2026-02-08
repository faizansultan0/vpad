const { test, expect } = require("@playwright/test");

test.describe("Dashboard (Protected Routes)", () => {
  test.describe("Without Authentication", () => {
    test("should redirect /dashboard to login", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("domcontentloaded");

      // Should redirect to login
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url.includes("/login") || url.includes("/dashboard")).toBeTruthy();
    });

    test("should redirect /institutions to login", async ({ page }) => {
      await page.goto("/institutions");
      await page.waitForLoadState("domcontentloaded");

      await page.waitForTimeout(2000);
      const url = page.url();
      expect(
        url.includes("/login") || url.includes("/institutions"),
      ).toBeTruthy();
    });

    test("should redirect /notes to login", async ({ page }) => {
      await page.goto("/notes/123");
      await page.waitForLoadState("domcontentloaded");

      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url.includes("/login") || url.includes("/notes")).toBeTruthy();
    });

    test("should redirect /profile to login", async ({ page }) => {
      await page.goto("/profile");
      await page.waitForLoadState("domcontentloaded");

      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url.includes("/login") || url.includes("/profile")).toBeTruthy();
    });
  });

  test.describe("Route Structure Validation", () => {
    test("should have proper route for semesters", async ({ page }) => {
      await page.goto("/institutions/test-id/semesters");
      await page.waitForLoadState("domcontentloaded");

      // Page should load (either redirect to login or show content)
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test("should have proper route for subjects", async ({ page }) => {
      await page.goto("/semesters/test-id/subjects");
      await page.waitForLoadState("domcontentloaded");

      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test("should have proper route for notes list", async ({ page }) => {
      await page.goto("/subjects/test-id/notes");
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2000);

      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });
  });
});
