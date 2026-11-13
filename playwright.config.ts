import { defineConfig, devices } from '@playwright/test';

// E2E_PORT lets the suite run beside a normal dev server on :3000.
const PORT = process.env.E2E_PORT ?? '3000';

export default defineConfig({
  testDir: './app',
  testMatch: '**/*.e2e.test.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // the local dev server compiles on demand; a retry shows up as "flaky", not hidden
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  expect: { timeout: 15_000 }, // dev server compiles routes on first hit
  timeout: 120_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // e2e safety: no real email, no live interview vendor, a known local webhook secret (test/e2e/hub.ts).
    env: {
      RESEND_API_KEY: "re_e2e_disabled",
      INTERVUEBOX_BASE_URL: "http://127.0.0.1:9",
      INTERVUEBOX_API_KEY: "e2e-disabled",
      RAZORPAY_WEBHOOK_SECRET: "e2e-local-webhook-secret",
      ADMIN_EMAIL: "e2e-admin-desktop@example.test,e2e-admin-mobile-375@example.test", // one per viewport (samples-admin.e2e.test.ts)
    },
  },
});
