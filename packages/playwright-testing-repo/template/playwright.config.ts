import 'dotenv/config'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.PLATFORM_URL ?? 'https://example.test',
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
})
