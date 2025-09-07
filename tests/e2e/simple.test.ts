describe('Simple E2E Test', () => {
  test('should be able to access page object', async () => {
    expect(page).toBeDefined();
    expect(browser).toBeDefined();
  });

  test('should be able to navigate to google', async () => {
    await page.goto('https://www.google.com');
    const title = await page.title();
    expect(title).toContain('Google');
  });
});