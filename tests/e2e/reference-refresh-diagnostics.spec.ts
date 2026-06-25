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
  stale?: boolean;
}): ReferenceRefreshProviderResult {
  return {
    ticker: input.ticker,
    indicators:
      typeof input.price === "number" ? indicators(input.price) : null,
    source: input.source ?? "fresh",
    cached_at: input.cachedAt ?? "2026-06-25T17:02:00.000Z",
    stale: input.stale ?? false,
    warnings: [],
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

test("stale, future, missing, or wrong-symbol provider refresh still blocks", async () => {
  const stale = await refreshSelectedCandidateReferences({
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
  const missing = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("JPM")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async (ticker) =>
      providerResult({ ticker, price: null }),
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
      }),
  });
  const wrongSymbol = await refreshSelectedCandidateReferences({
    candidates: [staleCandidate("NVDA")],
    maxAttempts: 10,
    now: "2026-06-25T17:03:00.000Z",
    fetchIntradayIndicators: async () =>
      providerResult({ ticker: "AMD", price: 112 }),
  });

  expect(stale.diagnostics.reference_refresh_success_count).toBe(0);
  expect(
    stale.diagnostics.reference_refresh_failure_reasons.stale_reference_price,
  ).toBe(1);
  expect(missing.diagnostics.reference_refresh_failure_reasons.provider_data_unavailable).toBe(
    1,
  );
  expect(
    future.diagnostics.reference_refresh_failure_reasons.future_reference_timestamp,
  ).toBe(1);
  expect(wrongSymbol.diagnostics.reference_refresh_failure_reasons.wrong_symbol_returned).toBe(
    1,
  );
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
});
