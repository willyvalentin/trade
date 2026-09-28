import { expect, test } from "@playwright/test";

import {
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  summarizeScanProviderCandidateObservations,
  type ScanProviderCandidateObservation,
} from "@/lib/active-scan-trace";
import {
  buildScannerProviderCoverageCohortDiagnostic,
  buildScannerProviderCoverageDiagnostic,
  scannerProviderCoverageCohortDiagnosticFromUnknown,
} from "@/lib/scanner-provider-coverage-diagnostic";

function observation({
  ticker,
  index,
  status = "rankable",
  credits = 1,
  reasons = [],
}: {
  ticker: string;
  index: number;
  status?: ScanProviderCandidateObservation["status"];
  credits?: number;
  reasons?: ScanProviderCandidateObservation["reason_codes"];
}): ScanProviderCandidateObservation {
  return {
    observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
    ticker,
    ticker_index: index,
    status,
    daily_data_source:
      status === "rankable" ? "provider" : "unavailable",
    intraday_data_source:
      status === "rankable" && credits > 1 ? "provider" : "not_observed",
    provider_credits_reserved: credits,
    reason_codes: reasons,
  };
}

function diagnostic(observations: ScanProviderCandidateObservation[]) {
  const total = observations.reduce(
    (sum, item) => sum + item.provider_credits_reserved,
    0,
  );
  return buildScannerProviderCoverageDiagnostic({
    candidateObservations: observations,
    candidateObservationSummary:
      summarizeScanProviderCandidateObservations(observations),
    attemptedTickers: observations.length,
    totalReservedCredits: total,
    dailyReservedCredits: total,
    intradayReservedCredits: 0,
    terminal: true,
  });
}

test("accepts an exact terminal candidate denominator and rejects summary drift", () => {
  const observations = [
    observation({ ticker: "NVO", index: 0 }),
    observation({
      ticker: "RDDT",
      index: 1,
      status: "not_rankable",
      credits: 0,
      reasons: ["daily_refresh_credit_cap_reached"],
    }),
  ];
  const exact = diagnostic(observations);
  expect(exact).toMatchObject({
    status: "observed",
    daily_provider_credits_reserved: 1,
    intraday_provider_credits_reserved: 0,
    summary: {
      expected_candidate_count: 2,
      rankable_candidate_count: 1,
      provider_credit_cap_gap_count: 1,
    },
  });
  expect(Object.values(exact.authority).every((value) => value === false)).toBe(
    true,
  );

  const driftedSummary = {
    ...summarizeScanProviderCandidateObservations(observations),
    rankable_candidate_count: 2,
  };
  expect(
    buildScannerProviderCoverageDiagnostic({
      candidateObservations: observations,
      candidateObservationSummary: driftedSummary,
      attemptedTickers: 2,
      totalReservedCredits: 1,
      dailyReservedCredits: 1,
      intradayReservedCredits: 0,
      terminal: true,
    }).status,
  ).toBe("invalid");
});

test("fails closed when a terminal scan retains pending or non-contiguous candidates", () => {
  const pending = [
    observation({ ticker: "NVO", index: 0, status: "pending", credits: 0 }),
  ];
  expect(diagnostic(pending)).toMatchObject({
    status: "invalid",
    reason_codes: ["terminal_candidate_provider_observation_pending"],
  });

  const nonContiguous = [
    observation({ ticker: "NVO", index: 1 }),
  ];
  expect(diagnostic(nonContiguous)).toMatchObject({
    status: "invalid",
    reason_codes: ["candidate_provider_coverage_inconsistent"],
  });
});

test("detects repeated late-index credit starvation without granting policy authority", () => {
  const first = diagnostic([
    observation({ ticker: "AAA", index: 0 }),
    observation({ ticker: "BBB", index: 1 }),
    observation({
      ticker: "CCC",
      index: 2,
      status: "not_rankable",
      credits: 0,
      reasons: ["daily_refresh_credit_cap_reached"],
    }),
    observation({
      ticker: "DDD",
      index: 3,
      status: "not_rankable",
      credits: 0,
      reasons: ["daily_refresh_credit_cap_reached"],
    }),
  ]);
  const second = diagnostic([
    observation({ ticker: "EEE", index: 0 }),
    observation({ ticker: "FFF", index: 1 }),
    observation({
      ticker: "GGG",
      index: 2,
      status: "not_rankable",
      credits: 0,
      reasons: ["daily_refresh_credit_cap_reached"],
    }),
    observation({
      ticker: "HHH",
      index: 3,
      status: "not_rankable",
      credits: 0,
      reasons: ["daily_refresh_credit_cap_reached"],
    }),
  ]);

  const cohort = buildScannerProviderCoverageCohortDiagnostic([first, second]);
  expect(cohort).toMatchObject({
    status: "available",
    candidate_counts: { expected: 8, rankable: 4, not_rankable: 4 },
    gap_counts: { credit_cap: 4 },
    position_analysis: {
      early_credit_cap_gaps: 0,
      late_credit_cap_gaps: 4,
      late_gap_share: 1,
      order_bias_signal: "late_index_concentration",
    },
    investigation_priority: "provider_credit_allocation",
  });
  expect(Object.values(cohort.authority).every((value) => value === false)).toBe(
    true,
  );
  expect(scannerProviderCoverageCohortDiagnosticFromUnknown(cohort)).not.toBeNull();
  expect(
    scannerProviderCoverageCohortDiagnosticFromUnknown({
      ...cohort,
      position_analysis: {
        ...cohort.position_analysis,
        late_gap_share: 0,
      },
    }),
  ).toBeNull();
});

test("keeps a single scan insufficient and separates provider-response gaps", () => {
  const one = diagnostic([
    observation({ ticker: "AAA", index: 0 }),
    observation({
      ticker: "BBB",
      index: 1,
      status: "not_rankable",
      reasons: ["daily_provider_empty"],
    }),
  ]);
  expect(buildScannerProviderCoverageCohortDiagnostic([one])).toMatchObject({
    status: "insufficient_evidence",
    investigation_priority: "insufficient_evidence",
    gap_counts: { provider_response: 1 },
  });

  const two = buildScannerProviderCoverageCohortDiagnostic([one, one]);
  expect(two).toMatchObject({
    status: "available",
    investigation_priority: "provider_response_quality",
    position_analysis: { order_bias_signal: "insufficient_evidence" },
  });
});
