import { Page } from 'puppeteer';

declare const page: Page;

describe('Homepage E2E Tests', () => {
  beforeEach(async () => {
    await page.goto('https://localhost:3100', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
  });

  test('should load homepage successfully', async () => {
    await expect(page.title()).resolves.toMatch(/SP Tech/i);
  });

  test('should display header navigation', async () => {
    const header = await page.$('header');
    expect(header).toBeTruthy();
    const nav = await page.$('nav');
    expect(nav).toBeTruthy();
  });

  test('should display main content', async () => {
    const main = await page.$('main');
    expect(main).toBeTruthy();
  });

  test('should display footer', async () => {
    const footer = await page.$('footer');
    expect(footer).toBeTruthy();
  });

  test('should be responsive', async () => {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle2' });
    const header1 = await page.$('header');
    expect(header1).toBeTruthy();

    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'networkidle2' });
    const header2 = await page.$('header');
    expect(header2).toBeTruthy();

    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await page.reload({ waitUntil: 'networkidle2' });
    const header3 = await page.$('header');
    expect(header3).toBeTruthy();
  });
});