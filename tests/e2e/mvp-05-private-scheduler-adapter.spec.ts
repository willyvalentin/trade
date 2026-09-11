import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  OperationAbortedError,
  waitForAbortableDelay,
} from "@/lib/operation-abort";

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

  test("cancels generation before recording a scheduled timeout", async () => {
    const route = await source("app/api/automation/run-scan/route.ts");
    const generator = await source("lib/recommendation-generator.ts");
    const scanner = await source("lib/scanner.ts");
    const marketData = await source("lib/market-data.ts");

    expect(route).toContain("const scheduledAbortController = new AbortController()");
    expect(route).toContain("scheduledAbortController.abort()");
    expect(route).toContain("SCHEDULED_TIMEOUT_CLEANUP_RESERVE_MS");
    expect(route).not.toContain("const generationResult = await Promise.race([");
    expect(route).toContain("signal: scheduledAbortController.signal");
    expect(generator).toContain("throwIfAborted(signal)");
    expect(scanner).toContain("waitForAbortableDelay(FRESH_CALL_DELAY_MS, options.signal)");
    expect(scanner).toContain("{ signal: options.signal }");
    expect(marketData).toContain("signal: options?.signal");
  });

  test("releases a pending scan delay when its time budget is cancelled", async () => {
    const controller = new AbortController();
    const delay = waitForAbortableDelay(10_000, controller.signal);

    controller.abort();

    await expect(delay).rejects.toBeInstanceOf(OperationAbortedError);
  });

  test("keeps an observed clean no-trade scan available as a recovery point", async () => {
    const route = await source("app/api/automation/run-scan/route.ts");

    expect(route).toContain('const hasObservedCleanNoTrade =');
    expect(route).toContain('scanLog.result === "no_high_quality_setup"');
    expect(route).toContain('candidatesScanned > 0');
    expect(route).toContain('providerStatus === "available"');
    expect(route).toContain('scanLog.indicator_stale !== true');
    expect(route).toContain('scannerGeneration?.status === "ready"');
    expect(route).toContain('scannerGeneration.universe.stale_candidates === 0');
    expect(route).toContain(
      'scannerGeneration.universe.missing_required_price_candidates === 0',
    );
    expect(route).toContain('scannerGeneration.warnings.length === 0');
    expect(route).toContain('scannerGeneration.gaps.length === 0');
    expect(route).toContain('(scanLog.top_candidate_warnings?.length ?? 0) === 0');
    expect(route).toContain('recommendations.length > 0 || hasObservedCleanNoTrade');
  });
});
