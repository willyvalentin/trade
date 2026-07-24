# First Tiny Historical Candle Payload Window Sanity Review

Status marker: `first_tiny_candle_payload_window_sanity_review_write_blocked`

## Review Result

- review status: `corrected_refetch_required`
- source verification status: `verified_with_window_review_required`
- ticker: `AAPL`
- interval: `5min`
- trading day: `2026-07-08`
- candle write ready: `false`
- executable candle persistence plan ready: `false`

The first approved AAPL payload refetch produced a valid 27-row normalized sequence, but the returned timestamp window does not match the planned UTC request window. Candle persistence remains blocked until the window semantics are reviewed and an operator explicitly accepts the intended window or a corrected refetch plan is created.

## Planned Window

- planned UTC start: `2026-07-08T13:45:00.000Z`
- planned UTC end: `2026-07-08T19:45:00.000Z`
- planned NY start: `2026-07-08 09:45 America/New_York`
- planned NY end: `2026-07-08 15:45 America/New_York`

## Returned Payload Window

- payload UTC first timestamp: `2026-07-08T17:45:00.000Z`
- payload UTC last timestamp: `2026-07-08T19:55:00.000Z`
- payload NY first timestamp: `2026-07-08 13:45 America/New_York`
- payload NY last timestamp: `2026-07-08 15:55 America/New_York`
- payload row count: `27`
- expected row count: `27`
- row count matches: `true`
- timestamps are 5min spaced: `true`
- duplicate timestamps: `0`
- out-of-order candles: `0`
- payload sequence valid: `true`
- window bounds match planned UTC: `false`

## Possible Causes

These are possible explanations only. This artifact does not guess which one is true.

- `timezone_conversion_mismatch`
- `provider_ignores_or_adjusts_start_end`
- `outputsize_or_order_window_behavior`
- `market_window_definition_mismatch`
- `payload_represents_later_window_than_planned`

## Acceptance Criteria Before Any Candle Write

- expected row count matches
- 5min spacing is valid
- no duplicate timestamps
- no out-of-order candles
- first timestamp is within the accepted intended analysis window
- last timestamp is within the accepted intended analysis window
- timezone interpretation is documented
- operator explicitly accepts the window

Current result: the sequence checks pass, but the timestamp window checks and operator acceptance do not. Therefore:

- candle write ready: `false`
- executable candle persistence plan ready: `false`
- corrected refetch required: `true`

## Recommended Next Steps

- `review_twelve_data_time_window_semantics`
- `define_corrected_refetch_window`
- `keep_candle_persistence_disabled`

Do not persist candles from this payload until the intended window is accepted or a corrected payload refetch is produced.

## Safety Confirmation

- provider call executed by this review: `false`
- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`
- visible recommendations changed: `false`
