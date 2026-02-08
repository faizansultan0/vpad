# VPad Server Tests

Self-contained unit tests for the VPad server.

## Setup

```bash
cd server/tests
npm install
```

## Run Tests

```bash
npm test
```

## Run with Coverage

```bash
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.js              # Jest setup and mocks
├── jest.config.js        # Jest configuration
├── package.json          # Test dependencies
├── utils/
│   ├── helpers.test.js   # Helper utility tests
│   └── token.test.js     # Token utility tests
├── middlewares/
│   ├── auth.test.js      # Auth middleware tests
│   └── errorHandler.test.js # Error handler tests
├── models/
│   └── User.test.js      # User model tests
└── services/
    ├── aiService.test.js # AI service tests
    └── notificationService.test.js # Notification tests
```

## Notes

- Tests mock mongoose to avoid requiring a database connection
- Environment variables are set in setup.js
- Tests import from parent server modules using relative paths
