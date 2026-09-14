import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("MVP-02 exposes a bounded, authenticated candidate scan separately from dashboard refresh", async () => {
  const tradeApp = await source("app/trade-app.tsx");
  const route = await source("app/api/recommendations/generate/route.ts");
  const scanner = await source("lib/scanner.ts");
  const generator = await source("lib/recommendation-generator.ts");

  expect(tradeApp).toContain('fetch("/api/recommendations/generate"');
  expect(tradeApp).toContain('target_count: 1');
  expect(tradeApp).toContain('credentials: "same-origin"');
  expect(tradeApp).toContain('"SCAN NEW"');
  expect(tradeApp).toContain("No broker order will be sent.");
  expect(tradeApp).toContain("candidateScanResult");
  expect(tradeApp).toContain('role="status"');
  expect(tradeApp).toContain("currentIntradayScanPolicy.allowGeneration");
  expect(tradeApp).toContain('"recommendations", "market_diagnostics"');

  expect(route).toContain("requireApplicationSession()");
  expect(route).toContain("applicationMutationForbiddenResponse(request)");
  expect(scanner).toContain("const MANUAL_MAX_FRESH_PROVIDER_CALLS = 1;");
  expect(scanner).toContain("const SCHEDULED_MAX_FRESH_PROVIDER_CALLS = 2;");
  expect(generator).toContain(
    "its own timeout-compatible scheduled fresh-provider budget",
  );
  expect(generator).not.toContain(
    'typeof scheduledMaxTickers === "number"\n            ? Math.min(1, scannerBaseCandidates.length)',
  );
});
