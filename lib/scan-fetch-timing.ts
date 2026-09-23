import type { ActiveScanTraceRecorder } from "@/lib/active-scan-trace";

export const SCAN_FETCH_TIMING_VERSION = "scan_fetch_timing_v1" as const;

export type ScanFetchTimingStep =
  | "cache_read"
  | "pacing_delay"
  | "daily_candles"
  | "cache_write"
  | "intraday_indicators";

const elapsedMetric: Record<
  ScanFetchTimingStep,
  | "cache_read_elapsed_ms"
  | "pacing_delay_elapsed_ms"
  | "daily_candles_elapsed_ms"
  | "cache_write_elapsed_ms"
  | "intraday_indicators_elapsed_ms"
> = {
  cache_read: "cache_read_elapsed_ms",
  pacing_delay: "pacing_delay_elapsed_ms",
  daily_candles: "daily_candles_elapsed_ms",
  cache_write: "cache_write_elapsed_ms",
  intraday_indicators: "intraday_indicators_elapsed_ms",
};

/** Records bounded, symbol-free timings; index is zero-based in the admitted scan. */
export async function measureScanFetchStep<T>(input: {
  trace?: ActiveScanTraceRecorder | null;
  step: ScanFetchTimingStep;
  tickerIndex: number | null;
  run: () => Promise<T>;
}): Promise<T> {
  const { trace, step, tickerIndex, run } = input;
  if (!trace) return run();

  const startedAt = performance.now();
  trace.updateMarketDataFetch({
    timing_current_step: step,
    timing_current_ticker_index: tickerIndex,
    timing_last_step: step,
    timing_last_ticker_index: tickerIndex,
    timing_last_step_settlement: "pending",
  });

  let completed = false;
  try {
    const result = await run();
    completed = true;
    return result;
  } finally {
    const elapsed = Math.max(0, Math.round(performance.now() - startedAt));
    trace.incrementMarketDataFetch({ [elapsedMetric[step]]: elapsed });
    trace.updateMarketDataFetch({
      timing_current_step: null,
      timing_current_ticker_index: null,
      timing_last_step_settlement: completed ? "resolved" : "rejected",
      timing_last_step_elapsed_ms: elapsed,
    });
  }
}
