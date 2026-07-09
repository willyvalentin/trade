import {
  buildFirstTinyCandlePayloadRefetchResultVerification,
  type FirstTinyCandlePayloadRefetchResultVerificationSummary,
} from "@/lib/first-tiny-historical-candle-payload-refetch-result-verification";
import {
  buildFirstTinyCandlePayloadWindowSanityReview,
  type FirstTinyCandlePayloadWindowSanityReview,
} from "@/lib/first-tiny-historical-candle-payload-window-sanity-review";

export const firstTinyCorrectedCandlePayloadRefetchPlanMarker =
  "first_tiny_corrected_candle_payload_refetch_plan_dry_run_only";

export type FirstTinyCorrectedPayloadRefetchStrategyId =
  | "timezone_explicit_ny_start_end"
  | "utc_start_end_with_timezone_validation"
  | "outputsize_from_intended_end"
  | "full_day_fetch_then_filter_locally";

export type FirstTinyCorrectedPayloadRefetchStrategy = {
  strategy_id: FirstTinyCorrectedPayloadRefetchStrategyId;
  request_count: 1;
  estimated_credits: 1;
  expected_returned_window: string;
  validation_rules: string[];
  risks: string[];
  recommendation: "recommended" | "not_recommended";
  rationale: string;
};

export type FirstTinyCorrectedPayloadRefetchPlan = {
  corrected_refetch_plan_status: "planned";
  plan_marker: typeof firstTinyCorrectedCandlePayloadRefetchPlanMarker;
  dry_run_only: true;
  reason: "prior_payload_window_mismatch";
  provider: "twelve_data";
  endpoint: "time_series";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  intended_session: "official_windows";
  intended_ny_start: "2026-07-08 09:45 America/New_York";
  intended_ny_end: "2026-07-08 15:45 America/New_York";
  intended_utc_start: "2026-07-08T13:45:00.000Z";
  intended_utc_end: "2026-07-08T19:45:00.000Z";
  expected_interval_minutes: 5;
  expected_accepted_row_count: 73;
  prior_payload: {
    planned_utc_window: string;
    planned_ny_window: string;
    returned_utc_window: string;
    returned_ny_window: string;
    accepted_for_write: false;
    review_status: FirstTinyCandlePayloadWindowSanityReview["review_status"];
  };
  candidate_strategies: FirstTinyCorrectedPayloadRefetchStrategy[];
  recommended_strategy_id: "full_day_fetch_then_filter_locally";
  provider_call_allowed_now: false;
  candle_persistence_allowed_now: false;
  raw_response_persistence_allowed_now: false;
  replay_allowed_now: false;
  scanner_effect_allowed_now: false;
  requires_separate_operator_approval: true;
  future_validation_rules: [
    "ticker_is_aapl",
    "interval_is_5min",
    "trading_day_is_2026_07_08",
    "returned_or_filtered_candles_are_5min_spaced",
    "no_duplicate_timestamps",
    "no_out_of_order_candles",
    "accepted_payload_covers_intended_ny_0945_to_1545",
    "first_accepted_candle_equals_intended_first_candle",
    "last_accepted_candle_equals_intended_last_candle",
    "accepted_row_count_matches_expected",
    "candle_write_remains_disabled_until_later_action",
  ];
  recommended_next_steps: [
    "review_corrected_refetch_strategy",
    "configure_corrected_payload_refetch_approval_signal",
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

function buildStrategies(): FirstTinyCorrectedPayloadRefetchStrategy[] {
  return [
    {
      strategy_id: "timezone_explicit_ny_start_end",
      request_count: 1,
      estimated_credits: 1,
      expected_returned_window:
        "provider should return candles aligned to 2026-07-08 09:45 -> 15:45 America/New_York",
      validation_rules: [
        "send_timezone_america_new_york",
        "send_start_date_as_2026_07_08_09_45",
        "send_end_date_as_2026_07_08_15_45",
        "reject_if_first_or_last_timestamp_differs_from_intended_window",
      ],
      risks: [
        "provider_start_end_timezone_semantics_may_not_match_expectation",
        "could_repeat_prior_window_shift_if_parameters_are_interpreted_unexpectedly",
      ],
      recommendation: "not_recommended",
      rationale:
        "Good validation probe, but the prior mismatch means this should not be the first write-bound retry.",
    },
    {
      strategy_id: "utc_start_end_with_timezone_validation",
      request_count: 1,
      estimated_credits: 1,
      expected_returned_window:
        "provider should return 2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z",
      validation_rules: [
        "send_intended_utc_start_and_end",
        "include_timezone_america_new_york",
        "reject_if_provider_repeats_prior_1345_to_1555_ny_window",
      ],
      risks: [
        "same_request_shape_may_repeat_prior_mismatch",
        "does_not_reduce_provider_window_ambiguity",
      ],
      recommendation: "not_recommended",
      rationale:
        "Useful as a control, but not the safest corrected strategy after the observed mismatch.",
    },
    {
      strategy_id: "outputsize_from_intended_end",
      request_count: 1,
      estimated_credits: 1,
      expected_returned_window:
        "last accepted candle should end at 2026-07-08 15:45 America/New_York with the expected bar count",
      validation_rules: [
        "send_end_date_around_intended_end",
        "send_outputsize_equal_expected_accepted_row_count",
        "reject_if_first_accepted_timestamp_does_not_equal_09_45_ny",
      ],
      risks: [
        "provider_output_order_or_inclusive_end_behavior_may_shift_one_bar",
        "requires_precise_expected_bar_count_semantics",
      ],
      recommendation: "not_recommended",
      rationale:
        "Potentially efficient, but inclusive/exclusive candle semantics need a separate proof before use.",
    },
    {
      strategy_id: "full_day_fetch_then_filter_locally",
      request_count: 1,
      estimated_credits: 1,
      expected_returned_window:
        "larger 2026-07-08 regular-session payload, locally filtered to 09:45 -> 15:45 America/New_York",
      validation_rules: [
        "fetch_larger_regular_session_range_with_one_request_if_possible",
        "filter_locally_to_intended_ny_09_45_to_15_45",
        "accept_only_if_filtered_first_and_last_match_intended_window",
        "accept_only_if_filtered_row_count_matches_expected",
      ],
      risks: [
        "larger_payload_than_minimum",
        "still_requires_operator_approved_execute_action",
      ],
      recommendation: "recommended",
      rationale:
        "Safest dry-run plan because local filtering reduces provider start/end ambiguity while keeping a one-request target.",
    },
  ];
}

export function buildFirstTinyCorrectedCandlePayloadRefetchPlan(
  verification: FirstTinyCandlePayloadRefetchResultVerificationSummary =
    buildFirstTinyCandlePayloadRefetchResultVerification(),
  windowReview: FirstTinyCandlePayloadWindowSanityReview =
    buildFirstTinyCandlePayloadWindowSanityReview(verification),
): FirstTinyCorrectedPayloadRefetchPlan {
  return {
    corrected_refetch_plan_status: "planned",
    plan_marker: firstTinyCorrectedCandlePayloadRefetchPlanMarker,
    dry_run_only: true,
    reason: "prior_payload_window_mismatch",
    provider: "twelve_data",
    endpoint: "time_series",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    intended_session: "official_windows",
    intended_ny_start: "2026-07-08 09:45 America/New_York",
    intended_ny_end: "2026-07-08 15:45 America/New_York",
    intended_utc_start: "2026-07-08T13:45:00.000Z",
    intended_utc_end: "2026-07-08T19:45:00.000Z",
    expected_interval_minutes: 5,
    expected_accepted_row_count: 73,
    prior_payload: {
      planned_utc_window: `${windowReview.planned_start_date_utc} -> ${windowReview.planned_end_date_utc}`,
      planned_ny_window: `${windowReview.planned_start_date_ny} -> ${windowReview.planned_end_date_ny}`,
      returned_utc_window: `${windowReview.payload_first_timestamp_utc} -> ${windowReview.payload_last_timestamp_utc}`,
      returned_ny_window: `${windowReview.payload_first_timestamp_ny} -> ${windowReview.payload_last_timestamp_ny}`,
      accepted_for_write: false,
      review_status: windowReview.review_status,
    },
    candidate_strategies: buildStrategies(),
    recommended_strategy_id: "full_day_fetch_then_filter_locally",
    provider_call_allowed_now: false,
    candle_persistence_allowed_now: false,
    raw_response_persistence_allowed_now: false,
    replay_allowed_now: false,
    scanner_effect_allowed_now: false,
    requires_separate_operator_approval: true,
    future_validation_rules: [
      "ticker_is_aapl",
      "interval_is_5min",
      "trading_day_is_2026_07_08",
      "returned_or_filtered_candles_are_5min_spaced",
      "no_duplicate_timestamps",
      "no_out_of_order_candles",
      "accepted_payload_covers_intended_ny_0945_to_1545",
      "first_accepted_candle_equals_intended_first_candle",
      "last_accepted_candle_equals_intended_last_candle",
      "accepted_row_count_matches_expected",
      "candle_write_remains_disabled_until_later_action",
    ],
    recommended_next_steps: [
      "review_corrected_refetch_strategy",
      "configure_corrected_payload_refetch_approval_signal",
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
