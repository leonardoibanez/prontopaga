import { defineConfig, devices } from '@playwright/test';

const backendPort = 3101;
const frontendPort = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: `cd .. && npm run build -w backend && PORT=${backendPort} HOST=127.0.0.1 FRONTEND_URL=http://127.0.0.1:${frontendPort} DEMO_MODE=true JWT_SECRET=playwright-synthetic-secret-with-at-least-32-bytes npm run start -w backend`,
      url: `http://127.0.0.1:${backendPort}/api/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    },
    {
      command: `cd .. && npm run build -w frontend && APP_ORIGIN=http://127.0.0.1:${frontendPort} BACKEND_URL=http://127.0.0.1:${backendPort} npm run start -w frontend -- --hostname 127.0.0.1 --port ${frontendPort}`,
      url: `http://127.0.0.1:${frontendPort}/api/health`,
      reuseExistingServer: false,
      timeout: 90_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    },
  ],
});
