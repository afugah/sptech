import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
  // Create screenshots directory if it doesn't exist
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('🚀 Starting E2E test setup...');

  // Wait for the development server to be ready
  console.log('⏳ Waiting for development server...');
}
