import { setDefaultOptions } from 'expect-puppeteer';

// Set default options for expect-puppeteer
setDefaultOptions({ timeout: 10000 });

// Global timeout for all tests
jest.setTimeout(60000);

// Global setup for each test
beforeEach(async () => {
  // Clear cookies and local storage before each test
  if (typeof page !== 'undefined') {
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
});

// Global teardown for each test
afterEach(async () => {
  // Take screenshot on test failure
  if (typeof page !== 'undefined' && (global as any).testResult && (global as any).testResult.numFailingTests > 0) {
    const testName = expect.getState().currentTestName;
    try {
      await page.screenshot({
        path: `tests/e2e/screenshots/${testName}-failure.png`,
        fullPage: true
      });
    } catch (error) {
      console.log('Failed to take screenshot:', error);
    }
  }
});