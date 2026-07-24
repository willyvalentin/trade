import {
  buildFirstTinyCandlePayloadRefetchResultVerification,
  type FirstTinyCandlePayloadRefetchResultVerificationSummary,
} from "@/lib/first-tiny-historical-candle-payload-refetch-result-verification";

export const firstTinyCandlePayloadWindowSanityReviewMarker =
  "first_tiny_candle_payload_window_sanity_review_write_blocked";

export type FirstTinyCandlePayloadWindowSanityReviewStatus =
  | "review_required"
  | "accepted_for_candle_persistence_plan"
  | "corrected_refetch_required";

export type FirstTinyCandlePayloadWindowSanityReview = {
  review_status: FirstTinyCandlePayloadWindowSanityReviewStatus;
  review_marker: typeof firstTinyCandlePayloadWindowSanityReviewMarker;
  source_verification_status: FirstTinyCandlePayloadRefetchResultVerificationSummary["verification_status"];
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  planned_start_date_utc: "2026-07-08T13:45:00.000Z";
  planned_end_date_utc: "2026-07-08T19:45:00.000Z";
  payload_first_timestamp_utc: "2026-07-08T17:45:00.000Z";
  payload_last_timestamp_utc: "2026-07-08T19:55:00.000Z";
  planned_start_date_ny: string;
  planned_end_date_ny: string;
  payload_first_timestamp_ny: string;
  payload_last_timestamp_ny: string;
  payload_row_count: 27;
  expected_row_count: 27;
  row_count_matches: boolean;
  timestamps_are_5min_spaced: boolean;
  duplicate_timestamps: 0;
  out_of_order_candles: 0;
  payload_sequence_valid: boolean;
  window_bounds_match_planned_utc: false;
  operator_window_acceptance: false;
  candle_write_ready: false;
  executable_candle_persistence_plan_ready: false;
  corrected_refetch_required: boolean;
  possible_causes: {
    timezone_conversion_mismatch: "possible";
    provider_ignores_or_adjusts_start_end: "possible";
    outputsize_or_order_window_behavior: "possible";
    market_window_definition_mismatch: "possible";
    payload_represents_later_window_than_planned: true;
  };
  acceptance_criteria: {
    expected_row_count_matches: boolean;
    five_minute_spacing_valid: boolean;
    no_duplicate_timestamps: boolean;
    no_out_of_order_candles: boolean;
    first_timestamp_within_accepted_intended_analysis_window: boolean;
    last_timestamp_within_accepted_intended_analysis_window: boolean;
    timezone_interpretation_documented: boolean;
    operator_explicitly_accepts_window: boolean;
  };
  blocking_reasons: [
    "window_bounds_do_not_match_planned_utc",
    "operator_window_acceptance_missing",
    "timezone_semantics_not_yet_reviewed",
  ];
  recommended_next_steps: [
    "review_twelve_data_time_window_semantics",
    "define_corrected_refetch_window",
    "keep_candle_persistence_disabled",
  ];
  provider_call_executed: false;
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
};

function formatNyTimestamp(timestamp: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(timestamp));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${value("year")}-${value("month")}-${value("day")} ${value(
    "hour",
  )}:${value("minute")} America/New_York`;
}

export function buildFirstTinyCandlePayloadWindowSanityReview(
  verification: FirstTinyCandlePayloadRefetchResultVerificationSummary =
    buildFirstTinyCandlePayloadRefetchResultVerification(),
): FirstTinyCandlePayloadWindowSanityReview {
  const windowBoundsMatch =
    String(verification.window_sanity.planned_start_date_utc) ===
      String(verification.window_sanity.first_payload_timestamp) &&
    String(verification.window_sanity.planned_end_date_utc) ===
      String(verification.window_sanity.last_payload_timestamp);
  const sequenceValid =
    verification.window_sanity.row_count_matches &&
    verification.window_sanity.timestamps_are_5min_spaced &&
    verification.window_sanity.duplicate_timestamps === 0 &&
    verification.window_sanity.out_of_order_candles === 0;

  return {
    review_status: windowBoundsMatch
      ? "review_required"
      : "corrected_refetch_required",
    review_marker: firstTinyCandlePayloadWindowSanityReviewMarker,
    source_verification_status: verification.verification_status,
    ticker: verification.ticker,
    interval: verification.interval,
    trading_day: verification.trading_day,
    planned_start_date_utc: verification.window_sanity.planned_start_date_utc,
    planned_end_date_utc: verification.window_sanity.planned_end_date_utc,
    payload_first_timestamp_utc:
      verification.window_sanity.first_payload_timestamp,
    payload_last_timestamp_utc: verification.window_sanity.last_payload_timestamp,
    planned_start_date_ny: formatNyTimestamp(
      verification.window_sanity.planned_start_date_utc,
    ),
    planned_end_date_ny: formatNyTimestamp(
      verification.window_sanity.planned_end_date_utc,
    ),
    payload_first_timestamp_ny: formatNyTimestamp(
      verification.window_sanity.first_payload_timestamp,
    ),
    payload_last_timestamp_ny: formatNyTimestamp(
      verification.window_sanity.last_payload_timestamp,
    ),
    payload_row_count: verification.window_sanity.payload_row_count,
    expected_row_count: verification.window_sanity.expected_row_count,
    row_count_matches: verification.window_sanity.row_count_matches,
    timestamps_are_5min_spaced:
      verification.window_sanity.timestamps_are_5min_spaced,
    duplicate_timestamps: verification.window_sanity.duplicate_timestamps,
    out_of_order_candles: verification.window_sanity.out_of_order_candles,
    payload_sequence_valid: sequenceValid,
    window_bounds_match_planned_utc: false,
    operator_window_acceptance: false,
    candle_write_ready: false,
    executable_candle_persistence_plan_ready: false,
    corrected_refetch_required: !windowBoundsMatch,
    possible_causes: {
      timezone_conversion_mismatch: "possible",
      provider_ignores_or_adjusts_start_end: "possible",
      outputsize_or_order_window_behavior: "possible",
      market_window_definition_mismatch: "possible",
      payload_represents_later_window_than_planned: true,
    },
    acceptance_criteria: {
      expected_row_count_matches: verification.window_sanity.row_count_matches,
      five_minute_spacing_valid:
        verification.window_sanity.timestamps_are_5min_spaced,
      no_duplicate_timestamps:
        verification.window_sanity.duplicate_timestamps === 0,
      no_out_of_order_candles:
        verification.window_sanity.out_of_order_candles === 0,
      first_timestamp_within_accepted_intended_analysis_window: false,
      last_timestamp_within_accepted_intended_analysis_window: false,
      timezone_interpretation_documented: false,
      operator_explicitly_accepts_window: false,
    },
    blocking_reasons: [
      "window_bounds_do_not_match_planned_utc",
      "operator_window_acceptance_missing",
      "timezone_semantics_not_yet_reviewed",
    ],
    recommended_next_steps: [
      "review_twelve_data_time_window_semantics",
      "define_corrected_refetch_window",
      "keep_candle_persistence_disabled",
    ],
    provider_call_executed: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
  };
}
