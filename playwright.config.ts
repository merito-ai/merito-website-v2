import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './app',
  testMatch: '**/*.e2e.test.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  expect: { timeout: 15_000 }, // dev server compiles routes on first hit
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // e2e safety: no real email, no live interview vendor, a known local webhook secret (test/e2e/hub.ts).
    env: {
      RESEND_API_KEY: "re_e2e_disabled",
      INTERVUEBOX_BASE_URL: "http://127.0.0.1:9",
      INTERVUEBOX_API_KEY: "e2e-disabled",
      RAZORPAY_WEBHOOK_SECRET: "e2e-local-webhook-secret",
    },
  },
});
