import { expect, test } from "@playwright/test";

import {
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  type ScanProviderCandidateObservation,
} from "@/lib/scan-provider-candidate-observation";
import {
  buildScannerProviderCreditAllocationCohort,
  scannerProviderCreditAllocationCohortFromUnknown,
} from "@/lib/scanner-provider-credit-allocation-cohort";
import { buildScannerProviderCreditAllocationShadow } from "@/lib/scanner-provider-credit-allocation-shadow";

function observation(
  ticker: string,
  index: number,
  credits: number,
): ScanProviderCandidateObservation {
  return {
    observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
    ticker,
    ticker_index: index,
    status: "rankable",
    daily_data_source: credits > 0 ? "provider" : "stale_cache",
    intraday_data_source: credits > 1 ? "provider" : "stale_cache",
    provider_credits_reserved: credits,
    reason_codes:
      credits > 0
        ? []
        : ["daily_refresh_credit_cap_reached", "intraday_refresh_credit_cap_reached"],
  };
}

function shadow(cap = 4) {
  return buildScannerProviderCreditAllocationShadow({
    candidateObservations: [
      observation("AAA", 0, 2),
      observation("BBB", 1, 2),
      observation("CCC", 2, 0),
      observation("DDD", 3, 0),
      observation("EEE", 4, 0),
      observation("FFF", 5, 0),
    ],
    providerCreditCap: cap,
    terminal: true,
  });
}

test("requires two exact cycles and projects only a separate reversible experiment", () => {
  const one = buildScannerProviderCreditAllocationCohort([shadow()]);
  expect(one).toMatchObject({
    status: "insufficient_evidence",
    cycle_counts: { observed: 1 },
    assessment: {
      signal: "insufficient_evidence",
      next_step: "collect_more_shadow_evidence",
      recommendation_quality: "unproven",
    },
  });

  const cohort = buildScannerProviderCreditAllocationCohort([shadow(), shadow()]);
  expect(cohort).toMatchObject({
    status: "available",
    provider_credit_cap: 4,
    cycle_counts: {
      total: 2,
      observed: 2,
      breadth_improvement_projected: 2,
    },
    aggregate: {
      expected_candidates: 12,
      baseline_reserved_credits: 8,
      challenger_planned_credits: 8,
      baseline_candidates_receiving_credit: 4,
      challenger_candidates_receiving_credit: 8,
      candidate_breadth_delta: 4,
      baseline_late_candidates_without_credit: 6,
      challenger_late_candidates_without_credit: 4,
      late_unfunded_candidate_delta: -2,
    },
    assessment: {
      signal: "consistent_breadth_improvement_projected",
      next_step: "prepare_separate_reversible_live_experiment_contract",
      recommendation_quality: "unproven",
    },
  });
  expect(Object.values(cohort.authority).every((value) => value === false)).toBe(
    true,
  );
  expect(scannerProviderCreditAllocationCohortFromUnknown(cohort)).toEqual(cohort);
});

test("fails closed on mixed caps and tampered aggregate evidence", () => {
  const first = shadow();
  const second = buildScannerProviderCreditAllocationShadow({
    candidateObservations: [
      observation("AAA", 0, 2),
      observation("BBB", 1, 2),
      observation("CCC", 2, 2),
      observation("DDD", 3, 0),
      observation("EEE", 4, 0),
      observation("FFF", 5, 0),
    ],
    providerCreditCap: 6,
    terminal: true,
  });
  expect(buildScannerProviderCreditAllocationCohort([first, second])).toMatchObject(
    {
      status: "invalid",
      provider_credit_cap: null,
      assessment: { signal: "invalid", next_step: "repair_evidence" },
    },
  );

  const exact = buildScannerProviderCreditAllocationCohort([first, first]);
  expect(
    scannerProviderCreditAllocationCohortFromUnknown({
      ...exact,
      aggregate: { ...exact.aggregate, candidate_breadth_delta: 999 },
    }),
  ).toBeNull();
});

test("rejects a challenger when two observed cycles project no gain", () => {
  const exact = buildScannerProviderCreditAllocationShadow({
    candidateObservations: [
      {
        ...observation("AAA", 0, 0),
        daily_data_source: "fresh_cache",
        intraday_data_source: "provider",
        provider_credits_reserved: 1,
      },
      {
        ...observation("BBB", 1, 0),
        daily_data_source: "provider",
        intraday_data_source: "fresh_cache",
        provider_credits_reserved: 1,
      },
    ],
    providerCreditCap: 2,
    terminal: true,
  });
  expect(buildScannerProviderCreditAllocationCohort([exact, exact])).toMatchObject({
    status: "available",
    assessment: {
      signal: "no_projected_improvement",
      next_step: "reject_challenger",
      recommendation_quality: "unproven",
    },
  });
});
