import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  timeout: 30000,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/e2e.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['blob', { outputDir: 'blob-report' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
