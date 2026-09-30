import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { ScanProviderCandidateObservation } from "@/lib/scan-provider-candidate-observation";
import {
  buildScannerProviderCreditAllocationCrossSeriesEvidence,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT,
  type ScannerProviderCreditAllocationCrossSeriesSource,
} from "@/lib/scanner-provider-credit-allocation-cross-series-evidence";
import {
  buildScannerProviderCreditAllocationCohort,
  unavailableScannerProviderCreditAllocationShadow,
} from "@/lib/scanner-provider-credit-allocation-cohort";
import { buildScannerProviderCreditAllocationShadow } from "@/lib/scanner-provider-credit-allocation-shadow";

function observation(
  ticker: string,
  tickerIndex: number,
  reservedCredits: number,
): ScanProviderCandidateObservation {
  return {
    observation_version: "scan_provider_candidate_observation_v1",
    ticker,
    ticker_index: tickerIndex,
    status: "rankable",
    daily_data_source: reservedCredits > 0 ? "provider" : "stale_cache",
    intraday_data_source: reservedCredits > 1 ? "provider" : "stale_cache",
    provider_credits_reserved: reservedCredits,
    reason_codes:
      reservedCredits > 0
        ? []
        : ["daily_refresh_credit_cap_reached", "intraday_refresh_credit_cap_reached"],
  };
}

function observedShadow(cap = 6) {
  const thirdReservedCredits = cap >= 6 ? 2 : 0;
  return buildScannerProviderCreditAllocationShadow({
    candidateObservations: [
      observation("AAA", 0, 2),
      observation("BBB", 1, 2),
      observation("CCC", 2, thirdReservedCredits),
      observation("DDD", 3, 0),
      observation("EEE", 4, 0),
      observation("FFF", 5, 0),
      observation("GGG", 6, 0),
      observation("HHH", 7, 0),
    ],
    providerCreditCap: cap,
    terminal: true,
  });
}

function source(
  index: number,
  overrides: Partial<ScannerProviderCreditAllocationCrossSeriesSource> = {},
): ScannerProviderCreditAllocationCrossSeriesSource {
  const contract = SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT;
  const series = contract.eligible_series[index];
  return {
    series_id: series.series_id,
    trading_date: contract.trading_date,
    starts_at_utc: series.starts_at_utc,
    expires_at_utc: series.expires_at_utc,
    commit_ref: contract.commit_ref,
    operational_classification: "pass",
    lineage_status: "attributed",
    published_recommendations: 0,
    provider_credit_allocation: buildScannerProviderCreditAllocationCohort([
      unavailableScannerProviderCreditAllocationShadow(),
      observedShadow(),
    ]),
    authority_is_inert: true,
    ...overrides,
  };
}

test("admits exact retrospective cross-series support without changing live authority", () => {
  const evidence = buildScannerProviderCreditAllocationCrossSeriesEvidence([
    source(0),
    source(1),
  ]);

  expect(evidence).toMatchObject({
    status: "available",
    contract: {
      evidence_mode: "retrospective_design_support_only",
      provider_credit_cap: 6,
      required_observed_cycles: 2,
      non_observed_cycle_treatment: "retain_in_denominator",
    },
    series_counts: { required: 2, received: 2, valid: 2 },
    cycle_counts: {
      total: 4,
      observed: 2,
      not_observed: 2,
      invalid: 0,
      breadth_improvement_projected: 2,
    },
    aggregate: {
      baseline_candidates_receiving_credit: 6,
      challenger_candidates_receiving_credit: 12,
      candidate_breadth_delta: 6,
      baseline_late_candidates_without_credit: 8,
      challenger_late_candidates_without_credit: 4,
      late_unfunded_candidate_delta: -4,
    },
    assessment: {
      signal: "consistent_retrospective_breadth_improvement_projected",
      next_step: "prepare_predeclared_reversible_live_allocation_experiment",
      recommendation_quality: "unproven",
      live_allocation_status: "unchanged",
    },
  });
  expect(Object.values(evidence.authority).every((value) => value === false)).toBe(
    true,
  );
});

test("retains a missing series as insufficient evidence", () => {
  expect(
    buildScannerProviderCreditAllocationCrossSeriesEvidence([source(0)]),
  ).toMatchObject({
    status: "insufficient_evidence",
    series_counts: { required: 2, received: 1, valid: 1 },
    cycle_counts: { total: 2, observed: 1, not_observed: 1 },
    assessment: {
      signal: "insufficient_evidence",
      next_step: "retain_baseline_and_collect_missing_evidence",
    },
  });
});

test("fails closed on revision drift, duplicate series and cap drift", () => {
  expect(
    buildScannerProviderCreditAllocationCrossSeriesEvidence([
      source(0),
      source(1, { commit_ref: "a".repeat(40) }),
    ]),
  ).toMatchObject({ status: "invalid", assessment: { signal: "invalid" } });

  expect(
    buildScannerProviderCreditAllocationCrossSeriesEvidence([source(0), source(0)]),
  ).toMatchObject({ status: "invalid", assessment: { signal: "invalid" } });

  expect(
    buildScannerProviderCreditAllocationCrossSeriesEvidence([
      source(0),
      source(1, {
        provider_credit_allocation: buildScannerProviderCreditAllocationCohort([
          unavailableScannerProviderCreditAllocationShadow(),
          observedShadow(4),
        ]),
      }),
    ]),
  ).toMatchObject({ status: "invalid", assessment: { signal: "invalid" } });
});

test("exposes only an authenticated uncached GET readback", () => {
  const route = readFileSync(
    resolve(
      process.cwd(),
      "app/api/app/provider-credit-allocation-cross-series-evidence/route.ts",
    ),
    "utf8",
  );
  expect(route).toContain("requireApplicationSession()");
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).toContain("export async function GET()");
  expect(route).not.toContain("export async function POST");
  expect(route).not.toContain("export async function PUT");
  expect(route).not.toContain("export async function DELETE");
});
