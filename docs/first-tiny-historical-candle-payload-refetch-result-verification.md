# First Tiny Historical Candle Payload Refetch Result Verification

This document records the successful first tiny AAPL candle payload refetch result. It is a documentation and review artifact only. It is not database persistence.

This action must not call Twelve Data, fetch candles, persist candles, persist raw provider responses, persist additional fetch-run rows, persist synthetic outcomes, run replay/backfill, change scanner behavior, change ranking, change thresholds, change visible recommendations, change outcome evaluation, change Learning Acceleration, affect Add Trade, or affect broker/execution/risk.

## Production Result Summary

- route build marker: `action_284_first_tiny_candle_payload_refetch_execute_attempt`
- verification status: `verified_with_window_review_required`
- execution status: `payload_refetch_completed_no_persist`
- provider: `twelve_data`
- endpoint: `time_series`
- ticker: `AAPL`
- interval: `5min`
- trading day: `2026-07-08`
- request count: `1`
- estimated credits: `1`
- existing fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- provider call executed: `true`
- provider call succeeded: `true`
- provider call attempted: `true`
- http status: `200`
- cache lookup attempted: `true`
- cache hit: `false`
- raw candles: `27`
- normalized candles: `27`
- valid candles: `27`
- invalid candles: `0`
- duplicate timestamps: `0`
- out of order candles: `0`
- normalized payload available: `true`
- normalized payload returned: `true`
- normalized payload response only: `true`
- warning: `normalized_payload_response_only_not_persisted`

## Safety Flags

- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`

## Timestamp / Window Sanity Check

- planned start date UTC: `2026-07-08T13:45:00.000Z`
- planned end date UTC: `2026-07-08T19:45:00.000Z`
- first payload timestamp: `2026-07-08T17:45:00.000Z`
- last payload timestamp: `2026-07-08T19:55:00.000Z`
- payload row count: `27`
- expected row count: `27`
- row count matches: `true`
- timestamps are 5min spaced: `true`
- payload sequence valid: `true`
- window bounds match planned UTC: `false`
- window review required: `true`
- candle write ready: `false`

The row count and timestamp sequence are valid, but the returned window does not match the originally planned UTC bounds. Candle persistence is not ready until this window interpretation is reviewed.

## Normalized Payload Review Rows

The production response returned normalized OHLCV rows, but those OHLCV values were response-only and are not transcribed into this static artifact. The table below records the 27 normalized timestamps and stable row metadata only. No OHLCV values are invented.

```json
[
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T17:45:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T17:50:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T17:55:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:00:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:05:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:10:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:15:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:20:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:25:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:30:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:35:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:40:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:45:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:50:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T18:55:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:00:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:05:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:10:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:15:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:20:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:25:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:30:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:35:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:40:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:45:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:50:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false },
  { "provider": "twelve_data", "ticker": "AAPL", "interval": "5min", "timestamp": "2026-07-08T19:55:00.000Z", "open": null, "high": null, "low": null, "close": null, "volume": null, "adjusted": false, "trading_day": "2026-07-08", "session": "regular", "timezone": "America/New_York", "fetch_run_id": "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f", "ohlcv_values_recorded_in_artifact": false }
]
```

## Approval Lock Warning

If diagnostics can see `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED=true`, it should warn: `disable_payload_refetch_approval_signal_after_success`.

## Recommended Next Steps

1. `disable_payload_refetch_approval_signal_after_success`
2. `review_payload_window_bounds_before_candle_write`
3. `build_executable_candle_persistence_plan_only_after_window_review`

## Conclusion

`first_tiny_candle_payload_refetch_verified_no_persist`

`candle_persistence_not_ready_until_window_sanity_review_passes`

The payload refetch is verified as successful and no-persist. Candle write readiness remains blocked because the returned timestamp window does not match the planned UTC bounds.
