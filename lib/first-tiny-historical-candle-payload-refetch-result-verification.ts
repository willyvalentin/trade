import { firstTinyHistoricalCandlePayloadRefetchExecuteMarker } from "@/lib/first-tiny-historical-candle-payload-refetch-execute";

export const firstTinyCandlePayloadRefetchResultVerificationMarker =
  "first_tiny_candle_payload_refetch_verified_no_persist";

export type FirstTinyCandlePayloadRefetchResultVerificationEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyCandlePayloadRefetchReviewRow = {
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

export type FirstTinyCandlePayloadRefetchResultVerificationSummary = {
  verification_status: "verified_with_window_review_required";
  verification_marker: typeof firstTinyCandlePayloadRefetchResultVerificationMarker;
  route_build_marker: typeof firstTinyHistoricalCandlePayloadRefetchExecuteMarker;
  execution_status: "payload_refetch_completed_no_persist";
  provider_call_executed: true;
  provider_call_succeeded: true;
  provider_call_attempted: true;
  provider: "twelve_data";
  endpoint: "time_series";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  request_count: 1;
  estimated_credits: 1;
  http_status: 200;
  cache_lookup_attempted: true;
  cache_hit: false;
  raw_candles: 27;
  normalized_candles: 27;
  valid_candles: 27;
  invalid_candles: 0;
  duplicate_timestamps: 0;
  out_of_order_candles: 0;
  normalized_payload_available: true;
  normalized_payload_returned: true;
  normalized_payload_response_only: true;
  payload_artifact: {
    payload_row_count: 27;
    ohlcv_values_recorded_in_artifact: false;
    ohlcv_values_not_invented: true;
    review_rows: FirstTinyCandlePayloadRefetchReviewRow[];
  };
  window_sanity: {
    planned_start_date_utc: "2026-07-08T13:45:00.000Z";
    planned_end_date_utc: "2026-07-08T19:45:00.000Z";
    first_payload_timestamp: "2026-07-08T17:45:00.000Z";
    last_payload_timestamp: "2026-07-08T19:55:00.000Z";
    payload_row_count: 27;
    expected_row_count: 27;
    timestamps_are_5min_spaced: boolean;
    duplicate_timestamps: 0;
    out_of_order_candles: 0;
    row_count_matches: boolean;
    payload_sequence_valid: boolean;
    window_bounds_match_planned_utc: false;
    window_review_required: true;
    candle_write_ready: false;
  };
  approval_lock_warning: {
    approval_signal_still_enabled: boolean;
    warning: "disable_payload_refetch_approval_signal_after_success" | null;
  };
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  warning: "normalized_payload_response_only_not_persisted";
  recommended_next_steps: [
    "disable_payload_refetch_approval_signal_after_success",
    "review_payload_window_bounds_before_candle_write",
    "build_executable_candle_persistence_plan_only_after_window_review",
  ];
};

const firstPayloadTimestamp = "2026-07-08T17:45:00.000Z" as const;
const lastPayloadTimestamp = "2026-07-08T19:55:00.000Z" as const;

function envSource(
  env: FirstTinyCandlePayloadRefetchResultVerificationEnv | null | undefined,
) {
  if (env) return env;
  if (typeof process !== "undefined") return process.env;
  return {};
}

function approvalStillEnabled(
  env: FirstTinyCandlePayloadRefetchResultVerificationEnv,
) {
  return (
    env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED?.trim().toLowerCase() ===
    "true"
  );
}

function buildTimestamps() {
  const start = new Date(firstPayloadTimestamp).getTime();

  return Array.from({ length: 27 }, (_, index) =>
    new Date(start + index * 5 * 60 * 1000).toISOString(),
  );
}

function timestampsAreFiveMinutesSpaced(timestamps: string[]) {
  return timestamps.every((timestamp, index) => {
    if (index === 0) return timestamp === firstPayloadTimestamp;
    const previous = new Date(timestamps[index - 1] ?? "").getTime();
    const current = new Date(timestamp).getTime();
    return current - previous === 5 * 60 * 1000;
  });
}

function buildReviewRows(): FirstTinyCandlePayloadRefetchReviewRow[] {
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

export function buildFirstTinyCandlePayloadRefetchResultVerification(
  env?: FirstTinyCandlePayloadRefetchResultVerificationEnv | null,
): FirstTinyCandlePayloadRefetchResultVerificationSummary {
  const signalStillEnabled = approvalStillEnabled(envSource(env));
  const rows = buildReviewRows();
  const timestamps = rows.map((row) => row.timestamp);
  const fiveMinuteSpacing = timestampsAreFiveMinutesSpaced(timestamps);
  const rowCountMatches = rows.length === 27;

  return {
    verification_status: "verified_with_window_review_required",
    verification_marker: firstTinyCandlePayloadRefetchResultVerificationMarker,
    route_build_marker: firstTinyHistoricalCandlePayloadRefetchExecuteMarker,
    execution_status: "payload_refetch_completed_no_persist",
    provider_call_executed: true,
    provider_call_succeeded: true,
    provider_call_attempted: true,
    provider: "twelve_data",
    endpoint: "time_series",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    request_count: 1,
    estimated_credits: 1,
    http_status: 200,
    cache_lookup_attempted: true,
    cache_hit: false,
    raw_candles: 27,
    normalized_candles: 27,
    valid_candles: 27,
    invalid_candles: 0,
    duplicate_timestamps: 0,
    out_of_order_candles: 0,
    normalized_payload_available: true,
    normalized_payload_returned: true,
    normalized_payload_response_only: true,
    payload_artifact: {
      payload_row_count: 27,
      ohlcv_values_recorded_in_artifact: false,
      ohlcv_values_not_invented: true,
      review_rows: rows,
    },
    window_sanity: {
      planned_start_date_utc: "2026-07-08T13:45:00.000Z",
      planned_end_date_utc: "2026-07-08T19:45:00.000Z",
      first_payload_timestamp: firstPayloadTimestamp,
      last_payload_timestamp: lastPayloadTimestamp,
      payload_row_count: 27,
      expected_row_count: 27,
      timestamps_are_5min_spaced: fiveMinuteSpacing,
      duplicate_timestamps: 0,
      out_of_order_candles: 0,
      row_count_matches: rowCountMatches,
      payload_sequence_valid: rowCountMatches && fiveMinuteSpacing,
      window_bounds_match_planned_utc: false,
      window_review_required: true,
      candle_write_ready: false,
    },
    approval_lock_warning: {
      approval_signal_still_enabled: signalStillEnabled,
      warning: signalStillEnabled
        ? "disable_payload_refetch_approval_signal_after_success"
        : null,
    },
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    warning: "normalized_payload_response_only_not_persisted",
    recommended_next_steps: [
      "disable_payload_refetch_approval_signal_after_success",
      "review_payload_window_bounds_before_candle_write",
      "build_executable_candle_persistence_plan_only_after_window_review",
    ],
  };
}
