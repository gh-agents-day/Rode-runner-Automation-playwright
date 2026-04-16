const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
  // ── Test discovery ─────────────────────────────────────────
  testDir: './tests',
  testMatch: '**/*.spec.js',

  // ── Parallelism ─────────────────────────────────────────────
  fullyParallel: false,   // game state is shared; keep sequential
  workers: 1,

  // ── Retry on failure ────────────────────────────────────────
  retries: process.env.CI ? 2 : 1,

  // ── Timeouts ────────────────────────────────────────────────
  timeout:       30_000,
  expect:        { timeout: 8_000 },

  // ── Output & Reporters ──────────────────────────────────────
  outputDir: 'test-results/',
  reporter: [
    ['list'],
    ['html',  { outputFolder: 'playwright-report', open: 'never' }],
    ['json',  { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // ── Shared settings ─────────────────────────────────────────
  use: {
    baseURL:           BASE_URL,
    headless:          true,
    viewport:          { width: 1280, height: 800 },
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    trace:             'on-first-retry',
    actionTimeout:     8_000,
    navigationTimeout: 15_000,
  },

  // ── Browser projects ────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  // ── Auto-start the game server ────────────────────────────
  webServer: {
    command:   'npx serve src -p 3000',
    url:       'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout:   10_000,
  },
});