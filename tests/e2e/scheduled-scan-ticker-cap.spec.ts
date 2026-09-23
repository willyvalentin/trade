import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  resolveScheduledScanProviderCreditBudget,
  resolveScheduledScanTickerCap,
} from "@/lib/scheduled-scan-ticker-cap";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

test("Basic Free cannot exceed its eight-credit scan cap through an override", () => {
  expect(
    resolveScheduledScanTickerCap({
      requestedCap: 50,
      profileCap: 8,
      planMode: "free",
    }),
  ).toEqual({
    effective_cap: 8,
    plan_cap_applied: true,
  });
});

test("Basic Free may request a smaller scan without masking the request", () => {
  expect(
    resolveScheduledScanTickerCap({
      requestedCap: 3,
      profileCap: 8,
      planMode: "free",
    }),
  ).toEqual({
    effective_cap: 3,
    plan_cap_applied: false,
  });
});

test("paid plan profiles retain their explicitly requested bounded cap", () => {
  expect(
    resolveScheduledScanTickerCap({
      requestedCap: 50,
      profileCap: 25,
      planMode: "grow",
    }),
  ).toEqual({
    effective_cap: 50,
    plan_cap_applied: false,
  });
});

test("Basic Free reserves known scan calls before allowing reference refreshes", () => {
  expect(
    resolveScheduledScanProviderCreditBudget({ planMode: "free" }),
  ).toEqual({
    policy_version: "scheduled_scan_provider_credit_budget_v1",
    plan_mode: "free",
    enforced: true,
    per_minute_credit_cap: 8,
    market_regime_credits_reserved: 2,
    scanner_credits_reserved: 1,
    reference_refresh_max_attempts: 5,
    max_known_credits_per_scan: 8,
  });
});

test("paid profiles preserve the existing reference-refresh limit", () => {
  expect(
    resolveScheduledScanProviderCreditBudget({ planMode: "grow" }),
  ).toEqual({
    policy_version: "scheduled_scan_provider_credit_budget_v1",
    plan_mode: "grow",
    enforced: false,
    per_minute_credit_cap: null,
    market_regime_credits_reserved: 0,
    scanner_credits_reserved: 0,
    reference_refresh_max_attempts: 10,
    max_known_credits_per_scan: null,
  });
});

test("the scheduled route carries its Free budget into reference refresh", () => {
  const route = source("app/api/automation/run-scan/route.ts");
  const generator = source("lib/recommendation-generator.ts");

  expect(route).toContain("scheduled_provider_credit_budget");
  expect(route).toContain("scheduledReferenceRefreshMaxAttempts:");
  expect(generator).toContain("scheduledReferenceRefreshMaxAttempts");
  expect(generator).toContain("maxAttempts: referenceRefreshMaxAttempts");
});

test("scanner reserves its provider slot before a fallible intraday refresh", () => {
  const scanner = source("lib/scanner.ts");
  const attachment = scanner.slice(
    scanner.indexOf("async function attachIntradayIndicators("),
    scanner.indexOf("for (const baseCandidate of baseCandidates)"),
  );

  expect(attachment).toMatch(
    /if \(allowFreshFetch\) freshProviderCallsUsed \+= 1;\s+const result = await getOrRefreshIntradayIndicators/,
  );
  expect(attachment).not.toMatch(
    /if \(result\.source === "fresh"\) \{\s+freshProviderCallsUsed \+= 1/,
  );
});

test("scanner reuses its batched raw cache for indicator reads without changing provider admission", () => {
  const scanner = source("lib/scanner.ts");
  const indicatorCache = source("lib/intraday-indicator-cache.ts");

  expect(scanner).toContain('"raw",');
  expect(scanner).toContain("preloadedScannerCacheRaw: preloadedScannerCacheRow.raw");
  expect(scanner.match(/buildCandidate\(baseCandidate, cachedValues\),\s*cachedRow,/g))
    .toHaveLength(3);
  expect(scanner).toMatch(
    /buildCandidate\(baseCandidate, scannerValues\),\s*\);/,
  );
  expect(indicatorCache).toContain(
    'Object.prototype.hasOwnProperty.call(\n    options,\n    "preloadedScannerCacheRaw",',
  );
  expect(indicatorCache).toContain(': await getScannerCacheRaw(ticker);');
  expect(indicatorCache).toContain("if (cached.indicators && !cached.stale)");
});
