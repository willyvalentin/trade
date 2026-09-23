import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createActiveScanTrace } from "@/lib/active-scan-trace";
import { measureScanFetchStep } from "@/lib/scan-fetch-timing";

function trace() {
  return createActiveScanTrace({
    routeReceivedAt: "2026-09-23T18:30:00.000Z",
    scanWindow: "unknown",
  });
}

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
  expect(scanner).toContain("total_elapsed_ms: Math.max(");
  expect(scanner).toContain("Math.round(performance.now() - marketDataStartedAt)");
});
