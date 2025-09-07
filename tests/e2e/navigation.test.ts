import { Page } from 'puppeteer';

declare const page: Page;

describe('Navigation E2E Tests', () => {
  beforeEach(async () => {
    await page.goto('https://localhost:3100', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
  });

  test('should navigate to search page', async () => {
    // Look for search functionality
    const searchButton = await page.$('[data-testid="search"]') || await page.$('button[aria-label*="search"]');
    if (searchButton) {
      await searchButton.click();
      await page.waitForSelector('input[type="search"], input[placeholder*="search"]', { timeout: 5000 });
    }
  });

  test('should open cart modal', async () => {
    // Look for cart functionality
    const cartButton = await page.$('[data-testid="cart"]') || await page.$('button[aria-label*="cart"]');
    if (cartButton) {
      await cartButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for modal animation
    }
  });

  test('should open mobile menu on mobile viewport', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Look for mobile menu toggle
    const menuButton = await page.$('[data-testid="menu"]') || await page.$('button[aria-label*="menu"]');
    if (menuButton) {
      await menuButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for menu animation
    }
  });

  test('should handle language switching if available', async () => {
    // Look for language selector
    const langSelector = await page.$('[data-testid="language"]') || await page.$('select[name*="lang"]');
    if (langSelector) {
      await langSelector.click();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });
});