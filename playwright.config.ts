import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'output/playwright-results.json' }],
    ['list'],
  ],

  projects: [
    {
      name: 'api',
      testDir: './ejercicio2-api/tests',
      use: {
        baseURL: process.env.GOAL_TRACKER_API_URL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
    {
      name: 'chatbot',
      testDir: './ejercicio3-chatbot/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CHATBOT_SITE_URL,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },
  ],
});