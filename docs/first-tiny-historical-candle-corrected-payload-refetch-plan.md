# Corrected First Tiny Historical Candle Payload Refetch Plan

Status marker: `first_tiny_corrected_candle_payload_refetch_plan_dry_run_only`

## Why This Plan Exists

The first approved AAPL candle payload refetch returned a valid 27-row sequence, but the payload window did not match the intended first tiny persistence window.

- plan status: `planned`
- dry run only: `true`
- reason: `prior_payload_window_mismatch`
- provider call allowed now: `false`
- candle persistence allowed now: `false`
- raw response persistence allowed now: `false`
- replay allowed now: `false`
- scanner effect allowed now: `false`
- requires separate operator approval: `true`

## Intended Corrected Target

- provider: `twelve_data`
- endpoint: `time_series`
- ticker: `AAPL`
- interval: `5min`
- trading day: `2026-07-08`
- intended session: `official_windows`
- intended NY start: `2026-07-08 09:45 America/New_York`
- intended NY end: `2026-07-08 15:45 America/New_York`
- intended UTC start: `2026-07-08T13:45:00.000Z`
- intended UTC end: `2026-07-08T19:45:00.000Z`
- expected interval minutes: `5`
- expected accepted row count: `73`

## Prior Planned vs Returned Window

- prior planned UTC window: `2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z`
- prior planned NY window: `2026-07-08 09:45 America/New_York -> 2026-07-08 15:45 America/New_York`
- prior returned UTC window: `2026-07-08T17:45:00.000Z -> 2026-07-08T19:55:00.000Z`
- prior returned NY window: `2026-07-08 13:45 America/New_York -> 2026-07-08 15:55 America/New_York`
- prior payload accepted for write: `false`
- prior review status: `corrected_refetch_required`

## Candidate Strategies

### A. `timezone_explicit_ny_start_end`

- request count: `1`
- estimated credits: `1`
- expected returned window: provider should return candles aligned to `2026-07-08 09:45 -> 15:45 America/New_York`
- validation rules:
  - `send_timezone_america_new_york`
  - `send_start_date_as_2026_07_08_09_45`
  - `send_end_date_as_2026_07_08_15_45`
  - `reject_if_first_or_last_timestamp_differs_from_intended_window`
- risks:
  - `provider_start_end_timezone_semantics_may_not_match_expectation`
  - `could_repeat_prior_window_shift_if_parameters_are_interpreted_unexpectedly`
- recommendation: `not_recommended`

### B. `utc_start_end_with_timezone_validation`

- request count: `1`
- estimated credits: `1`
- expected returned window: provider should return `2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z`
- validation rules:
  - `send_intended_utc_start_and_end`
  - `include_timezone_america_new_york`
  - `reject_if_provider_repeats_prior_1345_to_1555_ny_window`
- risks:
  - `same_request_shape_may_repeat_prior_mismatch`
  - `does_not_reduce_provider_window_ambiguity`
- recommendation: `not_recommended`

### C. `outputsize_from_intended_end`

- request count: `1`
- estimated credits: `1`
- expected returned window: last accepted candle should end at `2026-07-08 15:45 America/New_York`
- validation rules:
  - `send_end_date_around_intended_end`
  - `send_outputsize_equal_expected_accepted_row_count`
  - `reject_if_first_accepted_timestamp_does_not_equal_09_45_ny`
- risks:
  - `provider_output_order_or_inclusive_end_behavior_may_shift_one_bar`
  - `requires_precise_expected_bar_count_semantics`
- recommendation: `not_recommended`

### D. `full_day_fetch_then_filter_locally`

- request count: `1`
- estimated credits: `1`
- expected returned window: larger `2026-07-08` regular-session payload, locally filtered to `09:45 -> 15:45 America/New_York`
- validation rules:
  - `fetch_larger_regular_session_range_with_one_request_if_possible`
  - `filter_locally_to_intended_ny_09_45_to_15_45`
  - `accept_only_if_filtered_first_and_last_match_intended_window`
  - `accept_only_if_filtered_row_count_matches_expected`
- risks:
  - `larger_payload_than_minimum`
  - `still_requires_operator_approved_execute_action`
- recommendation: `recommended`

## Recommended Strategy

Recommended strategy: `full_day_fetch_then_filter_locally`

This is the safest dry-run plan because local filtering reduces provider start/end ambiguity while keeping a one-request target. It is not executable yet and does not permit candle persistence.

## Future Validation Rules

Any corrected payload execute must pass:

- `ticker_is_aapl`
- `interval_is_5min`
- `trading_day_is_2026_07_08`
- `returned_or_filtered_candles_are_5min_spaced`
- `no_duplicate_timestamps`
- `no_out_of_order_candles`
- `accepted_payload_covers_intended_ny_0945_to_1545`
- `first_accepted_candle_equals_intended_first_candle`
- `last_accepted_candle_equals_intended_last_candle`
- `accepted_row_count_matches_expected`
- `candle_write_remains_disabled_until_later_action`

## Future Path

1. Corrected payload refetch approval gate.
2. Corrected payload refetch execute.
3. Corrected result verification.
4. Executable candle persistence dry-run.
5. Separate candle persistence approval/write.

## Safety Guarantees

- provider call executed by this plan: `false`
- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`
- visible recommendations changed: `false`

Recommended next steps:

- `review_corrected_refetch_strategy`
- `configure_corrected_payload_refetch_approval_signal`
- `keep_candle_persistence_disabled`
