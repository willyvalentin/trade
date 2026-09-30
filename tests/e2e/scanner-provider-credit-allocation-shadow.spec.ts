import { expect, test } from "@playwright/test";

import {
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  type ScanProviderCandidateObservation,
} from "@/lib/scan-provider-candidate-observation";
import {
  buildScannerProviderCreditAllocationShadow,
  scannerProviderCreditAllocationShadowFromUnknown,
} from "@/lib/scanner-provider-credit-allocation-shadow";

function observation({
  ticker,
  index,
  credits,
  daily = "provider",
  intraday = "provider",
}: {
  ticker: string;
  index: number;
  credits: number;
  daily?: ScanProviderCandidateObservation["daily_data_source"];
  intraday?: ScanProviderCandidateObservation["intraday_data_source"];
}): ScanProviderCandidateObservation {
  return {
    observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
    ticker,
    ticker_index: index,
    status: "rankable",
    daily_data_source: daily,
    intraday_data_source: intraday,
    provider_credits_reserved: credits,
    reason_codes:
      credits === 0
        ? ["daily_refresh_credit_cap_reached", "intraday_refresh_credit_cap_reached"]
        : [],
  };
}

test("projects candidate breadth before depth under the same fixed provider budget", () => {
  const observations = [
    observation({ ticker: "AAA", index: 0, credits: 2 }),
    observation({ ticker: "BBB", index: 1, credits: 2 }),
    observation({ ticker: "CCC", index: 2, credits: 2 }),
    observation({ ticker: "DDD", index: 3, credits: 0, daily: "stale_cache", intraday: "stale_cache" }),
    observation({ ticker: "EEE", index: 4, credits: 0, daily: "stale_cache", intraday: "stale_cache" }),
    observation({ ticker: "FFF", index: 5, credits: 0, daily: "stale_cache", intraday: "stale_cache" }),
    observation({ ticker: "GGG", index: 6, credits: 0, daily: "stale_cache", intraday: "stale_cache" }),
    observation({ ticker: "HHH", index: 7, credits: 0, daily: "stale_cache", intraday: "stale_cache" }),
  ];

  const shadow = buildScannerProviderCreditAllocationShadow({
    candidateObservations: observations,
    providerCreditCap: 6,
    terminal: true,
  });

  expect(shadow).toMatchObject({
    status: "observed",
    provider_credit_cap: 6,
    expected_candidate_count: 8,
    baseline: {
      reserved_credits: 6,
      candidates_receiving_credit: 3,
      late_candidates_without_credit: 4,
    },
    challenger: {
      planned_credits: 6,
      candidates_receiving_credit: 6,
      late_candidates_without_credit: 2,
      unfunded_deficits: 10,
    },
    comparison: {
      candidate_breadth_delta: 3,
      late_unfunded_candidate_delta: -2,
      signal: "breadth_improvement_projected",
      recommendation_quality: "unproven",
    },
  });
  expect(shadow.challenger.allocations.map((item) => item.ticker)).toEqual([
    "AAA",
    "BBB",
    "CCC",
    "DDD",
    "EEE",
    "FFF",
  ]);
  expect(
    shadow.challenger.allocations.every((item) => item.data_class === "daily"),
  ).toBe(true);
  expect(Object.values(shadow.authority).every((value) => value === false)).toBe(
    true,
  );
  expect(scannerProviderCreditAllocationShadowFromUnknown(shadow)).toEqual(
    shadow,
  );
});

test("uses fresh cache without spending a challenger credit", () => {
  const shadow = buildScannerProviderCreditAllocationShadow({
    candidateObservations: [
      observation({
        ticker: "AAA",
        index: 0,
        credits: 0,
        daily: "fresh_cache",
        intraday: "fresh_cache",
      }),
      observation({
        ticker: "BBB",
        index: 1,
        credits: 1,
        daily: "fresh_cache",
        intraday: "provider",
      }),
      observation({
        ticker: "CCC",
        index: 2,
        credits: 1,
        daily: "provider",
        intraday: "fresh_cache",
      }),
    ],
    providerCreditCap: 2,
    terminal: true,
  });

  expect(shadow.status).toBe("observed");
  expect(shadow.challenger.allocations).toEqual([
    { ticker: "BBB", ticker_index: 1, data_class: "intraday" },
    { ticker: "CCC", ticker_index: 2, data_class: "daily" },
  ]);
  expect(shadow.comparison.signal).toBe("no_projected_improvement");
});

test("fails closed on incomplete denominators and refuses partial-budget projections", () => {
  const partial = buildScannerProviderCreditAllocationShadow({
    candidateObservations: [observation({ ticker: "AAA", index: 0, credits: 1 })],
    providerCreditCap: 2,
    terminal: true,
  });
  expect(partial).toMatchObject({
    status: "not_observed",
    reason_codes: ["provider_allocation_budget_not_fully_exercised"],
  });

  const pending = buildScannerProviderCreditAllocationShadow({
    candidateObservations: [
      {
        ...observation({ ticker: "AAA", index: 0, credits: 1 }),
        status: "pending",
      },
    ],
    providerCreditCap: 1,
    terminal: true,
  });
  expect(pending).toMatchObject({
    status: "invalid",
    reason_codes: ["provider_allocation_candidate_evidence_invalid"],
  });

  const downstreamNotObserved = buildScannerProviderCreditAllocationShadow({
    candidateObservations: [
      {
        ...observation({
          ticker: "AAA",
          index: 0,
          credits: 1,
          daily: "unavailable",
          intraday: "not_observed",
        }),
        status: "not_rankable",
      },
    ],
    providerCreditCap: 1,
    terminal: true,
  });
  expect(downstreamNotObserved).toMatchObject({
    status: "observed",
    challenger: {
      allocations: [{ ticker: "AAA", ticker_index: 0, data_class: "daily" }],
    },
  });

  expect(
    scannerProviderCreditAllocationShadowFromUnknown({
      ...downstreamNotObserved,
      comparison: {
        ...downstreamNotObserved.comparison,
        candidate_breadth_delta: 99,
      },
    }).status,
  ).toBe("invalid");

  expect(
    scannerProviderCreditAllocationShadowFromUnknown({
      ...downstreamNotObserved,
      reason_codes: ["invented_quality_claim"],
    }).status,
  ).toBe("invalid");

  expect(
    scannerProviderCreditAllocationShadowFromUnknown({
      ...downstreamNotObserved,
      challenger: {
        ...downstreamNotObserved.challenger,
        unfunded_deficits: 99,
      },
    }).status,
  ).toBe("invalid");
});
