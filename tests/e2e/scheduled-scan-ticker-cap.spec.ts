import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  resolveScheduledScanProviderExecutionPlan,
  resolveScheduledScanProviderCreditBudget,
  resolveScheduledScannerProviderCallCap,
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

test("Basic Free spends its bounded candidate budget before ranking", () => {
  expect(
    resolveScheduledScanProviderCreditBudget({ planMode: "free" }),
  ).toEqual({
    policy_version: "scheduled_scan_provider_credit_budget_v2",
    plan_mode: "free",
    enforced: true,
    per_minute_credit_cap: 8,
    market_regime_credits_reserved: 2,
    scanner_credits_reserved: 6,
    reference_refresh_max_attempts: 0,
    max_known_credits_per_scan: 8,
  });
});

test("paid profiles preserve the existing reference-refresh limit", () => {
  expect(
    resolveScheduledScanProviderCreditBudget({ planMode: "grow" }),
  ).toEqual({
    policy_version: "scheduled_scan_provider_credit_budget_v2",
    plan_mode: "grow",
    enforced: false,
    per_minute_credit_cap: null,
    market_regime_credits_reserved: 0,
    scanner_credits_reserved: 0,
    reference_refresh_max_attempts: 10,
    max_known_credits_per_scan: null,
  });
});

test("the scheduled route carries one coherent Free budget through both data stages", () => {
  const route = source("app/api/automation/run-scan/route.ts");
  const generator = source("lib/recommendation-generator.ts");

  expect(route).toContain("scheduled_provider_credit_budget");
  expect(route).toContain("scheduled_provider_execution_plan");
  expect(route).toContain("scheduledProviderCreditBudget:");
  expect(route).toContain("scheduledProviderCallPacingMs:");
  expect(generator).toContain(
    "resolveScheduledScannerProviderCallCap",
  );
  expect(generator).toContain(
    "scheduledProviderCreditBudget.reference_refresh_max_attempts",
  );
  expect(generator).toContain(
    "provider_credit_policy_version:",
  );
  expect(generator).toContain("scheduledProviderCreditBudget?.policy_version");
  expect(generator).toContain("freshProviderCallPacingMs:");
  expect(generator).toContain("maxAttempts: referenceRefreshMaxAttempts");
});

test("the enforced Basic Free allocation cannot strand credits behind ranking", () => {
  const budget = resolveScheduledScanProviderCreditBudget({ planMode: "free" });

  expect(
    budget.market_regime_credits_reserved +
      budget.scanner_credits_reserved +
      budget.reference_refresh_max_attempts,
  ).toBe(8);
  expect(budget.scanner_credits_reserved).toBeGreaterThan(1);
  expect(budget.reference_refresh_max_attempts).toBe(0);
});

test("an atomically reserved Basic Free scan removes impossible pacing overhead", () => {
  const budget = resolveScheduledScanProviderCreditBudget({ planMode: "free" });

  expect(
    resolveScheduledScanProviderExecutionPlan({
      budget,
      routeTimeoutMs: 23_000,
      cleanupReserveMs: 3_000,
      defaultInterCallDelayMs: 8_000,
    }),
  ).toEqual({
    policy_version: "scheduled_scan_provider_execution_v1",
    scanner_provider_call_cap: 6,
    inter_call_delay_ms: 0,
    known_pacing_overhead_ms: 0,
    route_timeout_ms: 23_000,
    cleanup_reserve_ms: 3_000,
    usable_route_budget_ms: 20_000,
    atomic_credit_reservation_required: true,
    status: "ready",
  });
});

test("an unreserved provider path keeps pacing and fails closed without route budget", () => {
  const budget = resolveScheduledScanProviderCreditBudget({ planMode: "grow" });

  expect(
    resolveScheduledScanProviderExecutionPlan({
      budget,
      routeTimeoutMs: 10_000,
      cleanupReserveMs: 3_000,
      defaultInterCallDelayMs: 8_000,
    }),
  ).toMatchObject({
    scanner_provider_call_cap: 1,
    inter_call_delay_ms: 8_000,
    known_pacing_overhead_ms: 0,
    atomic_credit_reservation_required: false,
    status: "ready",
  });

  expect(
    resolveScheduledScanProviderExecutionPlan({
      budget,
      routeTimeoutMs: 3_000,
      cleanupReserveMs: 3_000,
      defaultInterCallDelayMs: 8_000,
    }).status,
  ).toBe("invalid");
});

test("only the guarded Basic Free profile expands pre-ranking provider calls", () => {
  const freeBudget = resolveScheduledScanProviderCreditBudget({
    planMode: "free",
  });
  const growBudget = resolveScheduledScanProviderCreditBudget({
    planMode: "grow",
  });

  expect(
    resolveScheduledScannerProviderCallCap({
      budget: freeBudget,
      candidateCount: 8,
    }),
  ).toBe(6);
  expect(
    resolveScheduledScannerProviderCallCap({
      budget: growBudget,
      candidateCount: 8,
    }),
  ).toBe(1);
  expect(
    resolveScheduledScannerProviderCallCap({
      budget: null,
      candidateCount: 0,
    }),
  ).toBe(0);
});

test("scanner checks the batched indicator cache before reserving a provider slot", () => {
  const scanner = source("lib/scanner.ts");
  const snapshot = scanner.slice(
    scanner.indexOf("const intradayCacheSnapshotByTicker"),
    scanner.indexOf("async function attachIntradayIndicators("),
  );
  const attachmentStart = scanner.indexOf(
    "async function attachIntradayIndicators(",
  );
  const attachment = scanner.slice(
    attachmentStart,
    scanner.indexOf(
      "for (const [tickerIndex, baseCandidate] of baseCandidates.entries())",
      attachmentStart,
    ),
  );

  expect(snapshot).toContain("getCachedIntradayIndicators(baseCandidate.ticker");
  expect(scanner.indexOf("intradayCacheSnapshotByTicker.set")).toBeLessThan(
    scanner.indexOf("const providerCreditAllocationPlan ="),
  );
  expect(attachment).toContain("resolveIntradayIndicatorRefreshAdmission");
  expect(scanner.indexOf("intradayCacheSnapshotByTicker.set")).toBeLessThan(
    scanner.indexOf("freshProviderCallsUsed += 1"),
  );
  expect(attachment).toMatch(
    /if \(refreshPlanned\) \{\s+\/\/ A refresh-capable call may reach Twelve Data\.[\s\S]*?freshProviderCallsUsed \+= 1;[\s\S]*?getOrRefreshIntradayIndicators/,
  );
  expect(attachment).toContain("allowFreshFetch: true");
});

test("scanner reuses its batched raw cache for indicator reads without changing provider admission", () => {
  const scanner = source("lib/scanner.ts");
  const indicatorCache = source("lib/intraday-indicator-cache.ts");

  expect(scanner).toContain('"raw",');
  expect(scanner).toContain("preloadedScannerCacheRaw: preloadedScannerCacheRow.raw");
  expect(scanner.match(/buildCandidate\(baseCandidate, cachedValues\),\s*tickerIndex,\s*cachedRow,/g))
    .toHaveLength(3);
  expect(scanner).toMatch(
    /buildCandidate\(baseCandidate, scannerValues\),\s*tickerIndex,\s*\);/,
  );
  expect(indicatorCache).toContain(
    'Object.prototype.hasOwnProperty.call(\n    options,\n    "preloadedScannerCacheRaw",',
  );
  expect(indicatorCache).toContain(': await getScannerCacheRaw(ticker);');
  expect(indicatorCache).toContain("if (cached.indicators && !cached.stale)");
});
