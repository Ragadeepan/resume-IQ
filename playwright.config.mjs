import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ],
  webServer: {
    command: "npm run dev:test",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 240000
  }
});
