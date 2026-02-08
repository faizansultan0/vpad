# VPad Admin Client E2E Tests

Self-contained E2E tests for the VPad admin client using Playwright with Page Object Model.

## Setup

```bash
cd admin-client/tests
npm install
npx playwright install chromium
```

## Run Tests

```bash
# Run all tests
npm test

# Run tests with browser visible
npm run test:headed

# Run with Playwright UI
npm run test:ui

# Debug tests
npm run test:debug
```

## Test Structure

```
tests/
├── playwright.config.js  # Playwright configuration
├── package.json          # Test dependencies
├── pages/                # Page Object Models
│   ├── BasePage.js
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   └── AdminsPage.js
├── helpers/
│   └── testUtils.js      # Test utilities
├── auth.spec.js          # Authentication tests
├── navigation.spec.js    # Navigation tests
└── ui.spec.js            # UI component tests
```

## Notes

- Tests require the admin dev server to be running on port 3001
- Playwright config auto-starts the dev server if not running
- Screenshots are saved on failure
