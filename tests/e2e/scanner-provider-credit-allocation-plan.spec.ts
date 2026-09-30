import { expect, test } from "@playwright/test";

import {
  buildScannerProviderCreditAllocationPlan,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_PLAN_VERSION,
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
  scannerProviderCreditAllocationPlanFromUnknown,
  type ScannerProviderCreditDemand,
} from "@/lib/scanner-provider-credit-allocation-plan";
import {
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  type ScanProviderCandidateObservation,
} from "@/lib/scan-provider-candidate-observation";
import { buildScannerProviderCreditAllocationShadow } from "@/lib/scanner-provider-credit-allocation-shadow";

function demand(
  ticker: string,
  index: number,
  daily = true,
  intraday = true,
): ScannerProviderCreditDemand {
  return {
    ticker,
    ticker_index: index,
    daily_refresh_required: daily,
    intraday_refresh_required: intraday,
  };
}

function observation(
  candidate: ScannerProviderCreditDemand,
  credits: number,
): ScanProviderCandidateObservation {
  return {
    observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
    ticker: candidate.ticker,
    ticker_index: candidate.ticker_index,
    status: "rankable",
    daily_data_source: candidate.daily_refresh_required
      ? "provider"
      : "fresh_cache",
    intraday_data_source: candidate.intraday_refresh_required
      ? "provider"
      : "fresh_cache",
    provider_credits_reserved: credits,
    reason_codes: [],
  };
}

test("builds distinct serial and breadth-first plans under the same cap", () => {
  const candidates = [demand("AAA", 0), demand("BBB", 1), demand("CCC", 2)];
  const baseline = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    providerCreditCap: 3,
    candidateDemands: candidates,
  });
  const challenger = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 3,
    candidateDemands: candidates,
  });

  expect(baseline.allocations).toEqual([
    { ticker: "AAA", ticker_index: 0, data_class: "daily" },
    { ticker: "AAA", ticker_index: 0, data_class: "intraday" },
    { ticker: "BBB", ticker_index: 1, data_class: "daily" },
  ]);
  expect(challenger.allocations).toEqual([
    { ticker: "AAA", ticker_index: 0, data_class: "daily" },
    { ticker: "BBB", ticker_index: 1, data_class: "daily" },
    { ticker: "CCC", ticker_index: 2, data_class: "daily" },
  ]);
  expect(baseline.candidates_receiving_credit).toBe(2);
  expect(challenger.candidates_receiving_credit).toBe(3);
  expect(baseline.unfunded_deficits).toBe(3);
  expect(challenger.unfunded_deficits).toBe(3);
  expect(baseline.plan_fingerprint).not.toBe(challenger.plan_fingerprint);
});

test("uses fresh cache without credits and produces a stable detached fingerprint", () => {
  const input = [
    demand("BBB", 1, false, true),
    demand("AAA", 0, false, false),
    demand("CCC", 2, true, false),
  ];
  const first = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 4,
    candidateDemands: input,
  });
  const second = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 4,
    candidateDemands: [...input].reverse(),
  });

  expect(first).toMatchObject({
    plan_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_PLAN_VERSION,
    status: "planned",
    candidate_count: 3,
    total_deficits: 2,
    planned_credits: 2,
    candidates_receiving_credit: 2,
    unfunded_deficits: 0,
    reason_codes: ["provider_allocation_plan_all_refresh_deficits_funded"],
  });
  expect(first.allocations).toEqual([
    { ticker: "BBB", ticker_index: 1, data_class: "intraday" },
    { ticker: "CCC", ticker_index: 2, data_class: "daily" },
  ]);
  expect(first.plan_fingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(second.plan_fingerprint).toBe(first.plan_fingerprint);
  expect(Object.values(first.authority).every((value) => value === false)).toBe(
    true,
  );

  input[0] = demand("ZZZ", 1);
  expect(first.candidate_demands[1].ticker).toBe("BBB");
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.candidate_demands)).toBe(true);
  expect(Object.isFrozen(first.allocations)).toBe(true);
});

test("returns a truthful zero-credit plan when every cache entry is fresh", () => {
  const plan = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 6,
    candidateDemands: [demand("AAA", 0, false, false)],
  });

  expect(plan).toMatchObject({
    status: "planned",
    total_deficits: 0,
    planned_credits: 0,
    candidates_receiving_credit: 0,
    unfunded_deficits: 0,
    allocations: [],
    reason_codes: ["provider_allocation_plan_no_refresh_deficits"],
  });
  expect(plan.plan_fingerprint).toMatch(/^[a-f0-9]{64}$/);
});

test("fails closed on invalid policy, cap, duplicate ticker, and index gaps", () => {
  const invalidPolicy = buildScannerProviderCreditAllocationPlan({
    policyVersion: "invented_policy" as never,
    providerCreditCap: 2,
    candidateDemands: [demand("AAA", 0)],
  });
  const invalidCap = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    providerCreditCap: 0,
    candidateDemands: [demand("AAA", 0)],
  });
  const duplicateTicker = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    providerCreditCap: 2,
    candidateDemands: [demand("AAA", 0), demand("AAA", 1)],
  });
  const indexGap = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    providerCreditCap: 2,
    candidateDemands: [demand("AAA", 1)],
  });
  const missingCandidates = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    providerCreditCap: 2,
    candidateDemands: null as never,
  });

  expect(invalidPolicy.reason_codes).toEqual([
    "provider_allocation_plan_policy_invalid",
  ]);
  expect(invalidCap.reason_codes).toEqual([
    "provider_allocation_plan_credit_cap_invalid",
  ]);
  expect(duplicateTicker.reason_codes).toEqual([
    "provider_allocation_plan_candidate_demands_invalid",
  ]);
  expect(indexGap.reason_codes).toEqual([
    "provider_allocation_plan_candidate_demands_invalid",
  ]);
  expect(missingCandidates.reason_codes).toEqual([
    "provider_allocation_plan_candidate_demands_invalid",
  ]);
  for (const plan of [
    invalidPolicy,
    invalidCap,
    duplicateTicker,
    indexGap,
    missingCandidates,
  ]) {
    expect(plan.status).toBe("invalid");
    expect(plan.plan_fingerprint).toBeNull();
    expect(Object.values(plan.authority).every((value) => value === false)).toBe(
      true,
    );
  }
});

test("strict readback rejects tampering and shadow reuses the exact planner", () => {
  const candidates = [demand("AAA", 0), demand("BBB", 1), demand("CCC", 2)];
  const plan = buildScannerProviderCreditAllocationPlan({
    policyVersion: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    providerCreditCap: 3,
    candidateDemands: candidates,
  });
  expect(scannerProviderCreditAllocationPlanFromUnknown(plan)).toEqual(plan);
  expect(
    scannerProviderCreditAllocationPlanFromUnknown({
      ...plan,
      planned_credits: 99,
    }),
  ).toMatchObject({
    status: "invalid",
    reason_codes: ["provider_allocation_plan_readback_inconsistent"],
  });
  expect(
    scannerProviderCreditAllocationPlanFromUnknown({ ...plan, extra: true }),
  ).toMatchObject({
    status: "invalid",
    reason_codes: ["provider_allocation_plan_readback_inconsistent"],
  });
  expect(
    scannerProviderCreditAllocationPlanFromUnknown({
      ...plan,
      candidate_demands: [null],
    }),
  ).toMatchObject({
    status: "invalid",
    reason_codes: ["provider_allocation_plan_readback_inconsistent"],
  });

  const shadow = buildScannerProviderCreditAllocationShadow({
    candidateObservations: candidates.map((candidate, index) =>
      observation(candidate, index === 0 ? 2 : index === 1 ? 1 : 0),
    ),
    providerCreditCap: 3,
    terminal: true,
  });
  expect(shadow.status).toBe("observed");
  expect(shadow.challenger.allocations).toEqual(plan.allocations);
});
