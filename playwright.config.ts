import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3010";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const shouldStartWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== "true";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: "list",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: shouldStartWebServer
    ? {
        command: `npm run dev -- --port ${port}`,
        env: {
          NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION:
            process.env.NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION ?? "false",
          NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS:
            process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS ?? "true",
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: baseURL,
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
