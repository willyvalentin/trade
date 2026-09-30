import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildScannerProviderCreditAllocationExecutionPlan,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXECUTION_PLAN_VERSION,
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
  scannerProviderCreditAllocationExecutionPlanFromUnknown,
  type ScannerProviderCreditDemand,
} from "@/lib/scanner-provider-credit-allocation-plan";
import {
  buildScannerProviderCreditAllocationReconciliation,
  scannerProviderCreditAllocationReconciliationFromUnknown,
} from "@/lib/scanner-provider-credit-allocation-reconciliation";

const demands: ScannerProviderCreditDemand[] = Array.from(
  { length: 8 },
  (_, tickerIndex) => ({
    ticker: `T${tickerIndex}`,
    ticker_index: tickerIndex,
    daily_refresh_required: false,
    intraday_refresh_required: true,
  }),
);

test("execution plan preserves the independent intraday safety cap", () => {
  const baseline = buildScannerProviderCreditAllocationExecutionPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    providerCreditCap: 6,
    intradayProviderCreditCap: 3,
    candidateDemands: demands,
  });
  const challenger = buildScannerProviderCreditAllocationExecutionPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 6,
    intradayProviderCreditCap: 3,
    candidateDemands: demands,
  });

  for (const plan of [baseline, challenger]) {
    expect(plan).toMatchObject({
      plan_version:
        SCANNER_PROVIDER_CREDIT_ALLOCATION_EXECUTION_PLAN_VERSION,
      status: "planned",
      provider_credit_cap: 6,
      intraday_provider_credit_cap: 3,
      planned_credits: 3,
      planned_intraday_credits: 3,
      unfunded_deficits: 5,
      reason_codes: [
        "provider_allocation_execution_intraday_cap_exhausted",
      ],
    });
    expect(plan.allocations).toEqual([
      { ticker: "T0", ticker_index: 0, data_class: "intraday" },
      { ticker: "T1", ticker_index: 1, data_class: "intraday" },
      { ticker: "T2", ticker_index: 2, data_class: "intraday" },
    ]);
    expect(plan.plan_fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(
      scannerProviderCreditAllocationExecutionPlanFromUnknown(plan),
    ).toEqual(plan);
  }
});

test("challenger backfills daily deficits after the intraday cap is reached", () => {
  const plan = buildScannerProviderCreditAllocationExecutionPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 6,
    intradayProviderCreditCap: 3,
    candidateDemands: demands.map((candidate, index) => ({
      ...candidate,
      daily_refresh_required: index >= 3,
    })),
  });

  expect(plan.allocations).toEqual([
    { ticker: "T0", ticker_index: 0, data_class: "intraday" },
    { ticker: "T1", ticker_index: 1, data_class: "intraday" },
    { ticker: "T2", ticker_index: 2, data_class: "intraday" },
    { ticker: "T3", ticker_index: 3, data_class: "daily" },
    { ticker: "T4", ticker_index: 4, data_class: "daily" },
    { ticker: "T5", ticker_index: 5, data_class: "daily" },
  ]);
  expect(plan.planned_credits).toBe(6);
  expect(plan.candidates_receiving_credit).toBe(6);
});

test("strict execution-plan readback rejects cap and allocation tampering", () => {
  const plan = buildScannerProviderCreditAllocationExecutionPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 6,
    intradayProviderCreditCap: 3,
    candidateDemands: demands,
  });

  expect(
    scannerProviderCreditAllocationExecutionPlanFromUnknown({
      ...plan,
      intraday_provider_credit_cap: 4,
    }),
  ).toMatchObject({ status: "invalid" });
  expect(
    scannerProviderCreditAllocationExecutionPlanFromUnknown({
      ...plan,
      allocations: [],
    }),
  ).toMatchObject({ status: "invalid" });
});

test("reconciliation binds exact planned and reserved allocations", () => {
  const plan = buildScannerProviderCreditAllocationExecutionPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 6,
    intradayProviderCreditCap: 3,
    candidateDemands: demands,
  });
  const admissionFingerprint = "a".repeat(64);
  const matched = buildScannerProviderCreditAllocationReconciliation({
    plan,
    actualAllocations: plan.allocations,
    admissionFingerprint,
  });

  expect(matched).toMatchObject({
    status: "matched",
    actual_reserved_credits: 3,
    missing_allocations: [],
    unexpected_allocations: [],
    admission_fingerprint: admissionFingerprint,
  });
  expect(matched.reconciliation_fingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(scannerProviderCreditAllocationReconciliationFromUnknown(matched)).toEqual(
    matched,
  );

  const diverged = buildScannerProviderCreditAllocationReconciliation({
    plan,
    actualAllocations: plan.allocations.slice(0, 2),
    admissionFingerprint,
  });
  expect(diverged).toMatchObject({
    status: "diverged",
    actual_reserved_credits: 2,
  });
  expect(diverged.missing_allocations).toEqual([plan.allocations[2]]);
  expect(
    scannerProviderCreditAllocationReconciliationFromUnknown({
      ...matched,
      actual_reserved_credits: 99,
    }),
  ).toBeNull();
});

test("scanner freezes cache demand before mutation and routes admitted policy to execution", () => {
  const scanner = readFileSync(resolve(process.cwd(), "lib/scanner.ts"), "utf8");
  const generator = readFileSync(
    resolve(process.cwd(), "lib/recommendation-generator.ts"),
    "utf8",
  );
  const route = readFileSync(
    resolve(process.cwd(), "app/api/automation/run-scan/route.ts"),
    "utf8",
  );

  expect(scanner).toContain("intradayCacheSnapshotByTicker");
  expect(scanner.indexOf("intradayCacheSnapshotByTicker.set")).toBeLessThan(
    scanner.indexOf("const providerCreditAllocationPlan ="),
  );
  expect(scanner).toContain("providerCreditAllocationRuntimeAdmission");
  expect(scanner).toContain("isPlannedAllocation(");
  expect(scanner).toContain("actualAllocations.push");
  expect(scanner).toContain("...preservedRaw");
  expect(scanner).toContain("provider_credit_allocation_reconciliation");
  expect(generator).toContain("providerCreditAllocationRuntimeAdmission,");
  expect(route).toContain("providerCreditAllocationRuntimeAdmission,");
});
