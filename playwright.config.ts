import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
export default defineConfig({
  testDir: "./tests/e2e", workers: 1, timeout: 120000,
  use: { actionTimeout: 15000, channel: process.env.PLAYWRIGHT_CHANNEL || undefined, baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120000 }
});



