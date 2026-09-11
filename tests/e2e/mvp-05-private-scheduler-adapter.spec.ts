import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

async function source(path: string) {
  return readFile(resolve(root, path), "utf8");
}

test.describe("MVP-05 private scheduled-scan adapter", () => {
  test("uses the bundled internal route instead of a request through visitor access", async () => {
    const scheduledFunction = await source("netlify/functions/scheduled-scan.ts");

    expect(scheduledFunction).toContain(
      '"../.generated/scheduled-scan-runtime.cjs"',
    );
    expect(scheduledFunction).toContain("createRequire(__filename)");
    expect(scheduledFunction).toContain(
      'new Request("http://internal/api/automation/run-scan"',
    );
    expect(scheduledFunction).toContain('"x-automation-secret": automationSecret');
    expect(scheduledFunction).toContain('execution_boundary: "bundled_next_route"');
    expect(scheduledFunction).not.toContain("fetch(endpoint");
    expect(scheduledFunction).not.toContain("DEPLOY_PRIME_URL");
  });

  test("builds the isolated runtime with Next's server-only condition", async () => {
    const builder = await source("scripts/build-scheduled-scan-runtime.mjs");
    const netlifyConfig = await source("netlify.toml");
    const ignoredFiles = await source(".gitignore");

    expect(builder).toContain(
      'entryPoints: ["app/api/automation/run-scan/route.ts"]',
    );
    expect(builder).toContain('conditions: ["react-server"]');
    expect(builder).toContain('platform: "node"');
    expect(netlifyConfig).toContain("npm run build:scheduled-scan-runtime &&");
    expect(netlifyConfig).toContain(
      'included_files = ["netlify/.generated/scheduled-scan-runtime.cjs"]',
    );
    expect(ignoredFiles).toContain("netlify/.generated/");
  });
});
