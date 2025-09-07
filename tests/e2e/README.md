# E2E Testing with Puppeteer

This directory contains end-to-end tests using Puppeteer and Jest.

## Setup

The E2E testing setup includes:
- **Puppeteer**: Headless Chrome automation
- **Jest**: Testing framework with Puppeteer integration
- **TypeScript**: Full type support for tests

## Running Tests

```bash
# Run all E2E tests (headless)
yarn test:e2e

# Run E2E tests in watch mode
yarn test:e2e:watch

# Run E2E tests with visible browser (headed mode)
yarn test:e2e:headed
```

## Test Structure

- `homepage.test.ts` - Tests homepage functionality and responsiveness
- `navigation.test.ts` - Tests navigation and user interactions
- `performance.test.ts` - Tests performance metrics and console errors

## Configuration

- `jest.config.js` - Jest configuration for E2E tests
- `jest-puppeteer.config.js` - Puppeteer browser and server configuration
- `setup.ts` - Global test setup and utilities
- `global-setup.ts` - One-time setup before all tests
- `global-teardown.ts` - Cleanup after all tests

## Features

- **Automatic server startup**: Development server starts automatically
- **Screenshot on failure**: Failed tests generate screenshots
- **Multi-viewport testing**: Tests run on mobile, tablet, and desktop viewports
- **Performance monitoring**: Core Web Vitals and console error tracking
- **Type safety**: Full TypeScript support for test files

## Writing Tests

Tests have access to global `page` and `browser` objects:

```typescript
describe('My Feature', () => {
  test('should work correctly', async () => {
    await page.goto('https://localhost:3100');
    await expect(page).toMatchElement('h1');
  });
});
```

## Environment

Tests run against the development server on `https://localhost:3100` with HTTPS enabled.