module.exports = {
  preset: 'jest-puppeteer',
  rootDir: '../../',
  testMatch: ['**/tests/e2e/**/*.test.{js,ts}'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json'
    }]
  },
  testTimeout: 60000,
  globalSetup: '<rootDir>/tests/e2e/global-setup.ts',
  globalTeardown: '<rootDir>/tests/e2e/global-teardown.ts'
};