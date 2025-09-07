import { Page } from 'puppeteer';

declare const page: Page;

describe('Performance E2E Tests', () => {
  test('should load homepage within acceptable time', async () => {
    const startTime = Date.now();
    
    await page.goto('https://localhost:3100', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // Expect page to load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have good Core Web Vitals', async () => {
    await page.goto('https://localhost:3100', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Measure First Contentful Paint
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });

    // FCP should be less than 1.8 seconds (good threshold)
    expect(fcp).toBeLessThan(1800);
  });

  test('should not have console errors', async () => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('https://localhost:3100', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('Failed to load resource') &&
      !error.includes('net::ERR_')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});