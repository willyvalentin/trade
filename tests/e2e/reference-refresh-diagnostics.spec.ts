import { expect, test } from "@playwright/test";

import {
  refreshSelectedCandidateReferences,
  type ReferenceRefreshProviderResult,
} from "../../lib/reference-refresh-diagnostics";
import { resolvePlanReferencePriceMetadata } from "../../lib/recommendation-plan-reference";
import type { IntradayIndicators } from "../../lib/intraday-indicators";

function indicators(price: number): IntradayIndicators {
  return {
    vwap: price - 0.5,
    latestPrice: price,
    priceVsVwapPercent: 0.25,
    isAboveVwap: true,
    recentHigh: price + 1,
    recentLow: price - 1,
    recentRangePercent: 0.8,
    momentumPercent: 0.4,
    momentumDirection: "up",
    volumeTrend: "expanding",
    latestVolume: 1000000,
    averageVolume: 800000,
    warnings: [],
  };
}

function staleCandidate(ticker: string) {
  return {
    ticker,
    latest_close: 100,
    reference_price_timestamp: "2026-06-03T16:31:19.914Z",
    reference_price_provider: "scanner_cache",
  };
}

function providerResult(input: {
  ticker: string;
  price?: number | null;
  cachedAt?: string | null;
  source?: ReferenceRefreshProviderResult["source"];
  timestampKind?: ReferenceRefreshProviderResult["timestamp_kind"];
  stale?: boolean;
  warnings?: string[];
  indicatorsOverride?: IntradayIndicators | null;
}): ReferenceRefreshProviderResult {
  return {
    ticker: input.ticker,
    indicators:
      input.indicatorsOverride !== undefined
        ? input.indicatorsOverride
        : typeof input.price === "number"
          ? indicators(input.price)
          : null,
    source: input.source ?? "fresh",
    cached_at:
      input.cachedAt !== undefined
        ? input.cachedAt
        : "2026-06-25T17:02:00.000Z",
    timestamp_kind: input.timestampKind,
    stale: input.stale ?? false,
    warnings: input.warnings ?? [],
  };
}

test("fresh provider intraday reference rescues stale scanner-cache candidate", async () => {
  const result = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("AMD")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({ ticker, price: 112.35 }),
  });

  expect(result.diagnostics.reference_refresh_attempted_count).toBe(1);
  expect(result.diagnostics.reference_refresh_success_count).toBe(1);
  expect(
    result.diagnostics
      .reference_refresh_rescued_from_scanner_cache_reference_too_old_count,
  ).toBe(1);
  expect(result.diagnostics.reference_refresh_examples_by_ticker.rescued).toEqual([
    "AMD",
  ]);
  expect(result.diagnostics.reference_refresh_source_counts).toMatchObject({
    twelve_data_intraday: 1,
  });
  expect(result.diagnostics.reference_refresh_accepted_source_counts).toMatchObject({
    twelve_data_intraday: 1,
  });
  expect(result.diagnostics.reference_refresh_attempts).toMatchObject([
    {
      ticker: "AMD",
      provider_symbol: "AMD",
      source_attempted: "twelve_data_intraday",
      timestamp: "2026-06-25T17:02:00.000Z",
      price: 112.35,
      provider: "twelve_data",
      read_path: "reference_refresh.intraday_indicators.current_intraday_price",
      ny_trading_date: "2026-06-25",
      accepted: true,
      rejection_reason: null,
    },
  ]);

  const refreshedReference = resolvePlanReferencePriceMetadata(
    result.candidates[0],
    {
      enforceFreshness: true,
      now: "2026-06-25T17:03:00.000Z",
    },
  );

  expect(refreshedReference.reference_price_used_for_plan).toBe(112.35);
  expect(refreshedReference.reference_price_source).toBe(
    "provider_intraday_reference_refresh",
  );
  expect(refreshedReference.plan_reference_metadata_status).toBe("complete");
});

test("provider/cache refresh rejection reasons are precise and machine readable", async () => {
  const staleCache = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("CAT")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        price: 200,
        cachedAt: "2026-06-24T17:02:00.000Z",
        source: "cache",
        stale: true,
      }),
  });
  const missingData = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("JPM")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({ ticker, price: null }),
  });
  const missingPrice = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("AVGO")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        indicatorsOverride: { ...indicators(500), latestPrice: null },
      }),
  });
  const missingTimestamp = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("META")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({ ticker, price: 320, cachedAt: null }),
  });
  const invalidPrice = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("ADBE")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({ ticker, price: -1 }),
  });
  const future = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("MSFT")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        price: 320,
        cachedAt: "2026-06-25T18:03:00.000Z",
        timestampKind: "market_data_time",
      }),
  });
  const wrongSymbol = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("NVDA")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async () =>
      providerResult({ ticker: "AMD", price: 112 }),
  });
  const unrecognized = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("TSLA")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        source: "unavailable",
        warnings: ["Provider response shape unrecognized."],
      }),
  });

  expect(staleCache.diagnostics.reference_refresh_success_count).toBe(0);
  expect(
    staleCache.diagnostics.reference_refresh_failure_reasons
      .cache_hit_but_wrong_day,
  ).toBe(1);
  expect(
    staleCache.diagnostics.reference_refresh_failure_examples
      .cache_hit_but_wrong_day,
  ).toEqual(["CAT@2026-06-24T17:02:00.000Z"]);
  expect(
    staleCache.diagnostics.reference_refresh_rejected_source_counts
      .intraday_indicator_cache,
  ).toBe(1);
  expect(missingData.diagnostics.reference_refresh_failure_reasons.provider_no_data).toBe(
    1,
  );
  expect(
    missingPrice.diagnostics.reference_refresh_failure_reasons
      .provider_missing_price,
  ).toBe(1);
  expect(
    missingTimestamp.diagnostics.reference_refresh_failure_reasons
      .provider_missing_timestamp,
  ).toBe(1);
  expect(
    invalidPrice.diagnostics.reference_refresh_failure_reasons
      .provider_invalid_price,
  ).toBe(1);
  expect(
    future.diagnostics.reference_refresh_failure_reasons
      .provider_returned_future_timestamp,
  ).toBe(1);
  expect(
    wrongSymbol.diagnostics.reference_refresh_failure_reasons
      .provider_wrong_symbol,
  ).toBe(1);
  expect(
    unrecognized.diagnostics.reference_refresh_failure_reasons
      .provider_response_shape_unrecognized,
  ).toBe(1);
  expect(wrongSymbol.diagnostics.reference_refresh_attempts[0]).toMatchObject({
    ticker: "NVDA",
    provider_symbol: "AMD",
    source_attempted: "twelve_data_intraday",
    accepted: false,
    rejection_reason: "provider_wrong_symbol",
  });
});

test("scan-time provider fetch timestamp within skew tolerance rescues stale candidate", async () => {
  const result = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("JPM")],
    maxAttempts: 10,
    now: "2026-06-26T14:33:37.807Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        price: 145.12,
        cachedAt: "2026-06-26T14:33:46.910Z",
        timestampKind: "fetch_time",
      }),
  });

  expect(result.diagnostics.reference_refresh_success_count).toBe(1);
  expect(
    result.diagnostics.reference_refresh_failure_reasons
      .provider_returned_future_timestamp,
  ).toBeUndefined();
  expect(
    result.diagnostics.reference_refresh_failure_reasons
      .provider_future_beyond_scan_skew_tolerance,
  ).toBeUndefined();
  expect(result.diagnostics.reference_refresh_attempts[0]).toMatchObject({
    ticker: "JPM",
    accepted: true,
    rejection_reason: null,
    timestamp: "2026-06-26T14:33:46.910Z",
    reference_price_timestamp_kind: "fetch_time",
    reference_price_scan_time: "2026-06-26T14:33:37.807Z",
    reference_price_timestamp_skew_ms: 9103,
    reference_price_timestamp_validation_status:
      "provider_timestamp_within_scan_skew_tolerance",
  });
  expect(result.diagnostics.reference_refresh_final_references.JPM).toMatchObject({
    timestamp: "2026-06-26T14:33:46.910Z",
    timestamp_kind: "fetch_time",
    timestamp_skew_ms: 9103,
    scan_time: "2026-06-26T14:33:37.807Z",
    price: 145.12,
  });
  expect(result.candidates[0]).toMatchObject({
    reference_price_timestamp: "2026-06-26T14:33:46.910Z",
    reference_price_timestamp_kind: "fetch_time",
    reference_price_timestamp_skew_ms: 9103,
    reference_price_scan_time: "2026-06-26T14:33:37.807Z",
    reference_price_timestamp_validation_status:
      "provider_timestamp_within_scan_skew_tolerance",
  });
});

test("scan-time provider fetch timestamp follows 120 second skew tolerance", async () => {
  const withinTolerance = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("CAT")],
    maxAttempts: 10,
    now: "2026-06-26T14:33:37.807Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        price: 200,
        cachedAt: "2026-06-26T14:35:37.807Z",
        timestampKind: "fetch_time",
      }),
  });
  const beyondTolerance = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("BAC")],
    maxAttempts: 10,
    now: "2026-06-26T14:33:37.807Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        price: 42,
        cachedAt: "2026-06-26T14:35:38.807Z",
        timestampKind: "fetch_time",
      }),
  });

  expect(withinTolerance.diagnostics.reference_refresh_success_count).toBe(1);
  expect(withinTolerance.diagnostics.reference_refresh_attempts[0]).toMatchObject({
    accepted: true,
    reference_price_timestamp_skew_ms: 120000,
    reference_price_timestamp_validation_status:
      "provider_timestamp_within_scan_skew_tolerance",
  });
  expect(beyondTolerance.diagnostics.reference_refresh_success_count).toBe(0);
  expect(
    beyondTolerance.diagnostics.reference_refresh_failure_reasons
      .provider_future_beyond_scan_skew_tolerance,
  ).toBe(1);
  expect(beyondTolerance.diagnostics.reference_refresh_attempts[0]).toMatchObject({
    accepted: false,
    rejection_reason: "provider_future_beyond_scan_skew_tolerance",
    reference_price_timestamp_skew_ms: 121000,
    reference_price_timestamp_validation_status:
      "provider_future_beyond_scan_skew_tolerance",
  });
});

test("next-day and previous-day provider refresh timestamps remain rejected", async () => {
  const nextDay = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("XOM")],
    maxAttempts: 10,
    now: "2026-06-26T14:33:37.807Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        price: 115,
        cachedAt: "2026-06-27T14:33:38.000Z",
        timestampKind: "fetch_time",
      }),
  });
  const previousDay = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("CVX")],
    maxAttempts: 10,
    now: "2026-06-26T14:33:37.807Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({
        ticker,
        price: 155,
        cachedAt: "2026-06-24T14:33:37.000Z",
        timestampKind: "fetch_time",
      }),
  });

  expect(nextDay.diagnostics.reference_refresh_success_count).toBe(0);
  expect(
    nextDay.diagnostics.reference_refresh_failure_reasons
      .provider_returned_future_timestamp,
  ).toBe(1);
  expect(nextDay.diagnostics.reference_refresh_attempts[0]).toMatchObject({
    accepted: false,
    reference_price_timestamp_validation_status:
      "provider_timestamp_wrong_trading_day",
  });
  expect(previousDay.diagnostics.reference_refresh_success_count).toBe(0);
  expect(
    previousDay.diagnostics.reference_refresh_failure_reasons
      .provider_returned_stale_timestamp,
  ).toBe(1);
  expect(previousDay.diagnostics.reference_refresh_attempts[0]).toMatchObject({
    accepted: false,
    rejection_reason: "provider_returned_stale_timestamp",
  });
});

test("reference refresh respects budget cap", async () => {
  const result = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("AMD"), staleCandidate("MSFT")],
    maxAttempts: 1,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({ ticker, price: 110 }),
  });

  expect(result.diagnostics.reference_refresh_attempted_count).toBe(1);
  expect(result.diagnostics.reference_refresh_success_count).toBe(1);
  expect(result.diagnostics.reference_refresh_skipped_budget_count).toBe(1);
  expect(
    result.diagnostics.reference_refresh_examples_by_ticker.skipped_budget,
  ).toEqual(["MSFT"]);
  expect(result.diagnostics.reference_refresh_failure_reasons.budget_skipped).toBe(
    1,
  );
  expect(result.diagnostics.reference_refresh_attempts[1]).toMatchObject({
    ticker: "MSFT",
    source_attempted: "unknown",
    accepted: false,
    rejection_reason: "budget_skipped",
  });
});
