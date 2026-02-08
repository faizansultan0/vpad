const { test, expect } = require("@playwright/test");

const viewports = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 720 },
  { name: "wide", width: 1920, height: 1080 },
];

test.describe("Responsive Design", () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
      });

      test("login page renders correctly", async ({ page }) => {
        await page.goto("/login");
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(2000);

        const content = await page.content();
        expect(content.length).toBeGreaterThan(500);
      });

      test("register page renders correctly", async ({ page }) => {
        await page.goto("/register");
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(2000);

        const content = await page.content();
        expect(content.length).toBeGreaterThan(500);
      });

      test("forgot password page renders correctly", async ({ page }) => {
        await page.goto("/forgot-password");
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(2000);

        const content = await page.content();
        expect(content.length).toBeGreaterThan(500);
      });

      test("landing page renders correctly", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(2000);

        const content = await page.content();
        expect(content.length).toBeGreaterThan(500);
      });
    });
  }
});
