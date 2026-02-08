# VPad Client E2E Tests

Self-contained E2E tests for the VPad client using Playwright with Page Object Model.

## Setup

```bash
cd client/tests
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
│   ├── RegisterPage.js
│   ├── DashboardPage.js
│   └── SubjectPage.js
├── helpers/
│   └── testUtils.js      # Test utilities
├── auth.spec.js          # Authentication tests
├── navigation.spec.js    # Navigation tests
└── ui.spec.js            # UI component tests
```

## Page Object Model

Each page has its own class with:
- Selectors for page elements
- Methods to interact with the page
- Assertions for page state

## Notes

- Tests require the client dev server to be running on port 3000
- Playwright config auto-starts the dev server if not running
- Screenshots are saved on failure
