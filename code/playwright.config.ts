// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, devices } from "@playwright/test";

try {
  process.loadEnvFile(".env");
} catch {
  // no .env file: the variables must come from the environment
}

// The auth client uses an absolute VITE_APP_HOST, so the app must run on 3000.
const PORT = 3000;
const BASE_URL = `https://127.0.0.1:${PORT}`;

// The pens and the stroke eraser come from an SDK that is not released yet, so
// the suite runs against a local weavejs checkout (see docs/brush-lab-testers-guide.md).
if (!process.env.DEV_WEAVEJS_REPO_PATH) {
  throw new Error(
    "Set DEV_WEAVEJS_REPO_PATH to the weavejs `code/packages` directory to run the e2e tests.",
  );
}

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  // A cold dev server compiles on first use, so give it room.
  workers: 3,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // the standalone toolbar only shows from the 2xl breakpoint (1536px)
        viewport: { width: 1600, height: 900 },
      },
    },
  ],
  webServer: {
    command: `npx vite dev --port ${PORT} --host 127.0.0.1`,
    url: BASE_URL,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DEV_WEAVEJS_REPO_PATH: process.env.DEV_WEAVEJS_REPO_PATH,
      VITE_PENS_AND_ERASER: "true",
    },
  },
});
