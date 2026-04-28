import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 5000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;
const reuseServer = !process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: process.env.CI
          ? `npm run start -- -p ${PORT}`
          : `npm run dev -- -p ${PORT}`,
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: reuseServer,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});
