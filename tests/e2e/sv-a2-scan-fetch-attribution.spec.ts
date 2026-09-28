import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createActiveScanTrace,
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  summarizeScanProviderCandidateObservations,
  type ScanProviderCandidateObservation,
} from "@/lib/active-scan-trace";
import { measureScanFetchStep } from "@/lib/scan-fetch-timing";

function trace() {
  return createActiveScanTrace({
    routeReceivedAt: "2026-09-23T18:30:00.000Z",
    scanWindow: "unknown",
  });
}

test("provider-credit attribution starts empty and increments by fetch stage", () => {
  const recorder = trace();

  expect(recorder.trace.market_data_fetch).toMatchObject({
    provider_credit_policy_version: null,
    provider_call_cap: null,
    provider_calls_reserved_count: 0,
    daily_candle_provider_calls_reserved_count: 0,
    intraday_indicator_provider_calls_reserved_count: 0,
    intraday_indicator_fresh_cache_reuse_count: 0,
    candidate_observations: [],
    candidate_observation_summary: {
      expected_candidate_count: 0,
      dominant_gap_reason: null,
    },
  });

  recorder.updateMarketDataFetch({
    provider_credit_policy_version: "scheduled_scan_provider_credit_budget_v2",
    provider_call_cap: 6,
  });
  recorder.incrementMarketDataFetch({
    provider_calls_reserved_count: 2,
    daily_candle_provider_calls_reserved_count: 1,
    intraday_indicator_provider_calls_reserved_count: 1,
    intraday_indicator_fresh_cache_reuse_count: 1,
  });

  expect(recorder.trace.market_data_fetch).toMatchObject({
    provider_credit_policy_version: "scheduled_scan_provider_credit_budget_v2",
    provider_call_cap: 6,
    provider_calls_reserved_count: 2,
    daily_candle_provider_calls_reserved_count: 1,
    intraday_indicator_provider_calls_reserved_count: 1,
    intraday_indicator_fresh_cache_reuse_count: 1,
  });
});

test("candidate-level provider attribution exposes credit starvation separately from provider errors", () => {
  const observations: ScanProviderCandidateObservation[] = [
    {
      observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
      ticker: "NVO",
      ticker_index: 0,
      status: "rankable",
      daily_data_source: "provider",
      intraday_data_source: "provider",
      provider_credits_reserved: 2,
      reason_codes: [],
    },
    {
      observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
      ticker: "RDDT",
      ticker_index: 1,
      status: "not_rankable",
      daily_data_source: "unavailable",
      intraday_data_source: "not_observed",
      provider_credits_reserved: 0,
      reason_codes: ["daily_refresh_credit_cap_reached"],
    },
    {
      observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
      ticker: "IONQ",
      ticker_index: 2,
      status: "not_rankable",
      daily_data_source: "unavailable",
      intraday_data_source: "not_observed",
      provider_credits_reserved: 1,
      reason_codes: ["daily_provider_empty"],
    },
  ];

  expect(summarizeScanProviderCandidateObservations(observations)).toEqual({
    summary_version: "scan_provider_candidate_observation_summary_v1",
    expected_candidate_count: 3,
    rankable_candidate_count: 1,
    not_rankable_candidate_count: 2,
    pending_candidate_count: 0,
    fully_observed_candidate_count: 1,
    provider_credit_cap_gap_count: 1,
    provider_empty_gap_count: 1,
    provider_error_gap_count: 0,
    insufficient_history_gap_count: 0,
    stale_fallback_count: 0,
    total_reserved_credits: 3,
    dominant_gap_reason: "daily_provider_empty",
  });
});

test("successful timed steps retain only bounded stage and index diagnostics", async () => {
  const recorder = trace();
  const result = await measureScanFetchStep({
    trace: recorder,
    step: "cache_read",
    tickerIndex: null,
    run: async () => ({ rows: 8 }),
  });

  expect(result).toEqual({ rows: 8 });
  expect(recorder.trace.market_data_fetch).toMatchObject({
    timing_version: "scan_fetch_timing_v1",
    timing_current_step: null,
    timing_current_ticker_index: null,
    timing_last_step: "cache_read",
    timing_last_ticker_index: null,
    timing_last_step_settlement: "resolved",
  });
  expect(recorder.trace.market_data_fetch.cache_read_elapsed_ms).toBeGreaterThanOrEqual(0);
  expect(recorder.trace.market_data_fetch.timing_last_step_elapsed_ms).toBeGreaterThanOrEqual(0);
});

test("a rejected provider wait retains its failed step without fabricating a success", async () => {
  const recorder = trace();
  const failure = new Error("provider unavailable");

  await expect(
    measureScanFetchStep({
      trace: recorder,
      step: "daily_candles",
      tickerIndex: 3,
      run: async () => { throw failure; },
    }),
  ).rejects.toBe(failure);

  expect(recorder.trace.market_data_fetch).toMatchObject({
    timing_current_step: null,
    timing_current_ticker_index: null,
    timing_last_step: "daily_candles",
    timing_last_ticker_index: 3,
    timing_last_step_settlement: "rejected",
  });
  expect(recorder.trace.market_data_fetch.daily_candles_elapsed_ms).toBeGreaterThanOrEqual(0);
  expect(JSON.stringify(recorder.trace.market_data_fetch)).not.toContain("provider unavailable");
});

test("scanner attributes each awaited data step and persists elapsed time on failure", () => {
  const scanner = readFileSync(resolve(process.cwd(), "lib/scanner.ts"), "utf8");
  for (const step of [
    "cache_read",
    "pacing_delay",
    "daily_candles",
    "cache_write",
    "intraday_indicators",
  ]) {
    expect(scanner).toContain(`step: "${step}"`);
  }
  expect(scanner).toContain('markStage("market_data_fetch", "failed")');
  expect(scanner).toContain("provider_call_cap: maxFreshProviderCalls");
  expect(scanner).toContain("total_elapsed_ms: Math.max(");
  expect(scanner).toContain("Math.round(performance.now() - marketDataStartedAt)");
  expect(scanner).toMatch(
    /provider_calls_reserved_count: 1,[\s\S]*?intraday_indicator_provider_calls_reserved_count: 1,[\s\S]*?getOrRefreshIntradayIndicators/,
  );
  expect(scanner).toMatch(
    /provider_calls_reserved_count: 1,[\s\S]*?daily_candle_provider_calls_reserved_count: 1,[\s\S]*?getDailyCandles/,
  );
  expect(scanner).toContain("intraday_indicator_fresh_cache_reuse_count: 1");
  expect(scanner).toContain("daily_refresh_credit_cap_reached");
  expect(scanner).toContain("intraday_refresh_credit_cap_reached");
  expect(scanner).toContain("candidate_observation_summary");
});
