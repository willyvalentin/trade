#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const staticSuites = [
  "tests/e2e/action-650-production-data-access-containment.spec.ts",
  "tests/e2e/action-652b-authenticated-browser-data-migration.spec.ts",
  "tests/e2e/action-652c-transactional-open-position-boundary.spec.ts",
  "tests/e2e/action-652f-server-client-containment.spec.ts",
];

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["playwright", "test", ...staticSuites],
  {
    env: { ...process.env, PLAYWRIGHT_SKIP_WEB_SERVER: "true" },
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
