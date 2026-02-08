const { test, expect } = require("@playwright/test");

const viewports = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 720 },
  { name: "wide", width: 1920, height: 1080 },
];

test.describe("Admin Responsive Design", () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      test("login page renders correctly", async ({ page }) => {
        await page.goto("/login");
        await page.waitForLoadState("domcontentloaded");
        
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
      });

      test("accept invite page renders correctly", async ({ page }) => {
        await page.goto("/accept-invite?token=test");
        await page.waitForLoadState("domcontentloaded");
        
        const content = await page.content();
        expect(content.length).toBeGreaterThan(100);
      });
    });
  }
});
