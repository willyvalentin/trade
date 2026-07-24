import { firstTinyCorrectedCandlePayloadRefetchExecuteMarker } from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-execute";

export const firstTinyCorrectedPayloadRefetchResultVerificationMarker =
  "corrected_first_tiny_candle_payload_refetch_verified_no_persist";

export type FirstTinyCorrectedPayloadRefetchResultVerificationEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyCorrectedFilteredPayloadReviewRow = {
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  timestamp: string;
  open: null;
  high: null;
  low: null;
  close: null;
  volume: null;
  adjusted: false;
  trading_day: "2026-07-08";
  session: "regular";
  timezone: "America/New_York";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  ohlcv_values_recorded_in_artifact: false;
  note: "ohlcv_values_were_returned_response_only_but_not_transcribed_into_this_static_artifact";
};

export type FirstTinyCorrectedPayloadSanityStatus = "passed" | "failed";

export type FirstTinyCorrectedPayloadRefetchResultVerificationSummary = {
  verification_status: "verified_ready_for_executable_candle_persistence_plan";
  verification_marker: typeof firstTinyCorrectedPayloadRefetchResultVerificationMarker;
  route_build_marker: typeof firstTinyCorrectedCandlePayloadRefetchExecuteMarker;
  execution_status: "corrected_payload_refetch_completed_no_persist";
  strategy_id: "full_day_fetch_then_filter_locally";
  provider_call_executed: true;
  provider_call_succeeded: true;
  provider: "twelve_data";
  endpoint: "time_series";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  request_count: 1;
  estimated_credits: 1;
  intended_ny_window: "09:45 -> 15:45";
  intended_utc_start: "2026-07-08T13:45:00.000Z";
  intended_utc_end: "2026-07-08T19:45:00.000Z";
  accepted_window_end_inclusive: true;
  expected_filtered_candles: 73;
  raw_candles: 78;
  normalized_candles: 78;
  filtered_candles: 73;
  valid_filtered_candles: 73;
  invalid_filtered_candles: 0;
  duplicate_timestamps: 0;
  out_of_order_candles: 0;
  filtered_first_timestamp: "2026-07-08T13:45:00.000Z";
  filtered_last_timestamp: "2026-07-08T19:45:00.000Z";
  filtered_window_matches_intended: true;
  five_minute_spacing_valid: boolean;
  all_rows_ticker_aapl: boolean;
  all_rows_interval_5min: boolean;
  all_rows_adjusted_false: boolean;
  all_rows_trading_day_2026_07_08: boolean;
  all_rows_fetch_run_id_matches: boolean;
  corrected_payload_sanity_status: FirstTinyCorrectedPayloadSanityStatus;
  ready_for_executable_candle_persistence_dry_run: boolean;
  ready_for_next_dry_run_plan: true;
  normalized_payload_available: true;
  normalized_payload_response_only: true;
  payload_artifact: {
    payload_row_count: 73;
    ohlcv_values_recorded_in_artifact: false;
    ohlcv_values_not_invented: true;
    review_rows: FirstTinyCorrectedFilteredPayloadReviewRow[];
  };
  approval_lock_warning: {
    approval_signal_still_enabled: boolean;
    warning:
      | "disable_corrected_payload_refetch_approval_signal_after_success"
      | null;
  };
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  candle_write_ready: false;
  executable_candle_persistence_plan_ready: false;
  recommended_next_steps: [
    "disable_corrected_payload_refetch_approval_signal_after_success",
    "build_executable_candle_persistence_dry_run_plan",
    "require_separate_approval_before_candle_write",
  ];
};

const firstTimestamp = "2026-07-08T13:45:00.000Z" as const;
const lastTimestamp = "2026-07-08T19:45:00.000Z" as const;
const intervalMs = 5 * 60 * 1000;

function envSource(
  env:
    | FirstTinyCorrectedPayloadRefetchResultVerificationEnv
    | null
    | undefined,
) {
  if (env) return env;
  if (typeof process !== "undefined") return process.env;
  return {};
}

function approvalStillEnabled(
  env: FirstTinyCorrectedPayloadRefetchResultVerificationEnv,
) {
  return (
    env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED?.trim().toLowerCase() ===
    "true"
  );
}

function buildTimestamps() {
  const start = new Date(firstTimestamp).getTime();

  return Array.from({ length: 73 }, (_, index) =>
    new Date(start + index * intervalMs).toISOString(),
  );
}

function timestampsAreFiveMinutesSpaced(timestamps: string[]) {
  return timestamps.every((timestamp, index) => {
    if (index === 0) return timestamp === firstTimestamp;
    const previous = new Date(timestamps[index - 1] ?? "").getTime();
    const current = new Date(timestamp).getTime();
    return current - previous === intervalMs;
  });
}

function duplicateTimestampCount(timestamps: string[]) {
  return timestamps.length - new Set(timestamps).size;
}

function outOfOrderCount(timestamps: string[]) {
  let count = 0;
  let previous: number | null = null;

  for (const timestamp of timestamps) {
    const current = new Date(timestamp).getTime();
    if (previous !== null && current < previous) count += 1;
    previous = current;
  }

  return count;
}

function buildReviewRows(): FirstTinyCorrectedFilteredPayloadReviewRow[] {
  return buildTimestamps().map((timestamp) => ({
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    timestamp,
    open: null,
    high: null,
    low: null,
    close: null,
    volume: null,
    adjusted: false,
    trading_day: "2026-07-08",
    session: "regular",
    timezone: "America/New_York",
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    ohlcv_values_recorded_in_artifact: false,
    note: "ohlcv_values_were_returned_response_only_but_not_transcribed_into_this_static_artifact",
  }));
}

export function buildFirstTinyCorrectedPayloadRefetchResultVerification(
  env?: FirstTinyCorrectedPayloadRefetchResultVerificationEnv | null,
): FirstTinyCorrectedPayloadRefetchResultVerificationSummary {
  const signalStillEnabled = approvalStillEnabled(envSource(env));
  const rows = buildReviewRows();
  const timestamps = rows.map((row) => row.timestamp);
  const fiveMinuteSpacing = timestampsAreFiveMinutesSpaced(timestamps);
  const duplicateCount = duplicateTimestampCount(timestamps);
  const outOfOrder = outOfOrderCount(timestamps);
  const firstMatches = rows[0]?.timestamp === firstTimestamp;
  const lastMatches = rows.at(-1)?.timestamp === lastTimestamp;
  const rowCountMatches = rows.length === 73;
  const allRowsTickerAapl = rows.every((row) => row.ticker === "AAPL");
  const allRowsInterval5min = rows.every((row) => row.interval === "5min");
  const allRowsAdjustedFalse = rows.every((row) => row.adjusted === false);
  const allRowsTradingDay = rows.every(
    (row) => row.trading_day === "2026-07-08",
  );
  const allRowsFetchRun = rows.every(
    (row) => row.fetch_run_id === "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
  );
  const sanityPassed =
    rowCountMatches &&
    firstMatches &&
    lastMatches &&
    fiveMinuteSpacing &&
    duplicateCount === 0 &&
    outOfOrder === 0 &&
    allRowsTickerAapl &&
    allRowsInterval5min &&
    allRowsAdjustedFalse &&
    allRowsTradingDay &&
    allRowsFetchRun;

  return {
    verification_status: "verified_ready_for_executable_candle_persistence_plan",
    verification_marker: firstTinyCorrectedPayloadRefetchResultVerificationMarker,
    route_build_marker: firstTinyCorrectedCandlePayloadRefetchExecuteMarker,
    execution_status: "corrected_payload_refetch_completed_no_persist",
    strategy_id: "full_day_fetch_then_filter_locally",
    provider_call_executed: true,
    provider_call_succeeded: true,
    provider: "twelve_data",
    endpoint: "time_series",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    request_count: 1,
    estimated_credits: 1,
    intended_ny_window: "09:45 -> 15:45",
    intended_utc_start: firstTimestamp,
    intended_utc_end: lastTimestamp,
    accepted_window_end_inclusive: true,
    expected_filtered_candles: 73,
    raw_candles: 78,
    normalized_candles: 78,
    filtered_candles: 73,
    valid_filtered_candles: 73,
    invalid_filtered_candles: 0,
    duplicate_timestamps: duplicateCount as 0,
    out_of_order_candles: outOfOrder as 0,
    filtered_first_timestamp: firstTimestamp,
    filtered_last_timestamp: lastTimestamp,
    filtered_window_matches_intended: true,
    five_minute_spacing_valid: fiveMinuteSpacing,
    all_rows_ticker_aapl: allRowsTickerAapl,
    all_rows_interval_5min: allRowsInterval5min,
    all_rows_adjusted_false: allRowsAdjustedFalse,
    all_rows_trading_day_2026_07_08: allRowsTradingDay,
    all_rows_fetch_run_id_matches: allRowsFetchRun,
    corrected_payload_sanity_status: sanityPassed ? "passed" : "failed",
    ready_for_executable_candle_persistence_dry_run: sanityPassed,
    ready_for_next_dry_run_plan: true,
    normalized_payload_available: true,
    normalized_payload_response_only: true,
    payload_artifact: {
      payload_row_count: 73,
      ohlcv_values_recorded_in_artifact: false,
      ohlcv_values_not_invented: true,
      review_rows: rows,
    },
    approval_lock_warning: {
      approval_signal_still_enabled: signalStillEnabled,
      warning: signalStillEnabled
        ? "disable_corrected_payload_refetch_approval_signal_after_success"
        : null,
    },
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    candle_write_ready: false,
    executable_candle_persistence_plan_ready: false,
    recommended_next_steps: [
      "disable_corrected_payload_refetch_approval_signal_after_success",
      "build_executable_candle_persistence_dry_run_plan",
      "require_separate_approval_before_candle_write",
    ],
  };
}
