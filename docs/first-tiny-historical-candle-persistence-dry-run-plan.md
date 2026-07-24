# First Tiny Historical Candle Persistence Dry-Run Plan

This document plans the next historical backfill step after the verified fetch-run audit write. It does not persist candle rows.

This action must not call Twelve Data, fetch more candles, persist candles, persist raw provider responses, persist synthetic outcomes, run replay, generate recommendations, change scanner behavior, change ranking, affect visible recommendations, affect Add Trade, affect broker/execution, or affect risk.

## Why This Is Separate From Fetch-Run Audit

The fetch-run audit write records that a provider call happened and was verified. It does not contain the 27 normalized OHLCV candle rows.

Candle persistence is a separate operation because it writes market data rows into `historical_candles`. That requires actual normalized candle payloads and a separate approval path. The first provider call was intentionally no-persist, so this plan is count-level only.

## Verified Source

- source verification: `first_tiny_fetch_run_audit_write_verified`
- source provider: `twelve_data`
- source endpoint: `time_series`
- ticker: `AAPL`
- interval: `5min`
- trading day: `2026-07-08`
- session: `regular`
- timezone: `America/New_York`
- adjusted: `false`
- fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- cache key: `twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false`
- verified valid candles: `27`

## Target Table

- target table: `historical_candles`
- conflict target: `provider, ticker, interval, timestamp, adjusted`
- fetch run id attached: `true`
- lookahead safety required: `true`

## Count-Level Plan

- dry run only: `true`
- candle write allowed now: `false`
- count-level plan ready: `true`
- expected candle rows: `27`
- planned inserts: `27`
- planned updates: `0`
- planned skips: `0`
- planned invalid rejections: `0`

These counts come from the verified no-persist provider call and audit write result. They are not executable candle rows.

## Payload Availability Decision

- candle payload available: `false`
- executable candle rows available: `false`
- executable candle write ready: `false`
- ready for future candle write: `false`
- reason: `raw_or_normalized_candle_payload_intentionally_not_persisted_during_no_persist_test`

No OHLCV candle rows are invented in this plan. The dry-run helper exposes an empty normalized candle rows list to make that explicit.

## Future Write Requirement

A future candle write requires one of these before any persistence is allowed:

1. A separate approved provider refetch for the fixed AAPL / 5min / 2026-07-08 scope.
2. A safe captured normalized payload of the exact 27 verified candles.

Either path needs a separate approval action. This plan does not grant write permission.

## Safety Guarantees

- provider fetch added: `false`
- historical fetch added: `false`
- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted by this plan: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`
- scanner use disabled: `true`
- replay use disabled: `true`
- synthetic outcomes disabled: `true`

## Recommended Next Steps

1. `review_candle_payload_availability`
2. `require_separate_provider_refetch_or_payload_capture_before_candle_write_if_payload_missing`
3. `keep_replay_and_scanner_effects_disabled`

## Conclusion

`first_tiny_historical_candle_persistence_dry_run_planned`

Ture has a safe first tiny candle persistence dry-run plan for the verified 27 AAPL 5min candles. It does not write candles and does not invent OHLCV payloads. Because the first provider call was intentionally no-persist, a future candle write requires a separate approved provider refetch or a safe captured payload before persistence can proceed.
