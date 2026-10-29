import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

/**
 * End-to-end tests run against the production build (`npm run build` first), served by `vite preview` under the `/mindhaven/` base path.
 * They exist for what jsdom can't judge: real layout, colour contrast, focus behaviour, the service worker,
 * downloads, and what the browser actually requests over the network.
 *
 * In environments where Playwright's own browser download isn't available, point E2E_CHROMIUM_PATH at a
 * Chromium binary.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    // Trailing slash matters: relative paths such as './#/journal' resolve against it.
    baseURL: `http://localhost:${PORT}/mindhaven/`,
    trace: 'retain-on-failure',
    // The service worker caches aggressively; block it unless a test is specifically about it.
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: process.env.E2E_CHROMIUM_PATH || undefined },
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/mindhaven/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
