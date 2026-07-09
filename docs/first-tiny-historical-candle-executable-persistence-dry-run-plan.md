# Executable First Tiny Candle Persistence Dry-Run Plan

Conclusion: `first_tiny_historical_candle_executable_persistence_dry_run_planned`

Status: `planned / dry-run only`

## Why This Exists

This is the first dry-run plan that uses the corrected first tiny AAPL candle payload verification as the source for a future `historical_candles` upsert. It is intentionally still no-write: the plan validates rows, computes insert/update/skip/rejection counts, and keeps all replay/scanner paths closed.

## Verified Source

- source verification: `corrected_first_tiny_candle_payload_refetch_verified_no_persist`
- verification status: `verified_ready_for_executable_candle_persistence_plan`
- execution status: `corrected_payload_refetch_completed_no_persist`
- source strategy: `full_day_fetch_then_filter_locally`
- provider: `twelve_data`
- endpoint: `time_series`
- ticker: `AAPL`
- interval: `5min`
- trading day: `2026-07-08`
- fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`

## Target Upsert Plan

- target table: `historical_candles`
- conflict target: `provider, ticker, interval, timestamp, adjusted`
- dry run only: `true`
- candle write allowed now: `false`
- requires separate operator approval: `true`
- expected candle rows: `73`
- source payload rows: `73`
- first intended timestamp: `2026-07-08T13:45:00.000Z`
- last intended timestamp: `2026-07-08T19:45:00.000Z`
- accepted end inclusive: `true`

## Validation Checks

Each candidate row is checked for:

- provider equals `twelve_data`
- ticker equals `AAPL`
- interval equals `5min`
- timestamp exists and is ISO UTC
- timestamps are five minutes apart
- first timestamp equals `2026-07-08T13:45:00.000Z`
- last timestamp equals `2026-07-08T19:45:00.000Z`
- open/high/low/close are finite numbers
- volume is finite and non-negative
- OHLC geometry is valid
- adjusted equals `false`
- trading day equals `2026-07-08`
- session equals `regular`
- timezone equals `America/New_York`
- fetch run id equals `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`

## Current Static Artifact Caveat

Action 290 recorded the corrected 73-row timestamp/metadata artifact and confirmed that the production payload was response-only. It did not transcribe OHLCV values, and this dry-run planner does not invent them.

Current default diagnostics therefore show:

- candidate candle rows: `73`
- timestamp metadata valid rows: `73`
- valid candle rows: `0`
- invalid candle rows: `73`
- OHLCV valid rows: `0`
- OHLCV missing rows: `73`
- planned inserts: `0`
- planned updates: `0`
- planned skips: `0`
- planned invalid rejections: `73`
- primary rejection: `ohlcv_values_not_recorded_in_source_artifact`

When the same helper is supplied with real verified OHLCV rows from a future approved payload capture, it computes the exact insert/update/skip/rejection split without changing the write gate.

## No-Write Guarantees

- provider fetch added: `false`
- historical fetch added: `false`
- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`

## Future Approval Gate Requirements

Before any candle insert can occur, a separate future action must add:

- a dedicated candle persistence approval signal
- exact reviewed OHLCV payload rows
- a write route or function that remains scoped to the fixed AAPL / 5min / 2026-07-08 / fetch-run-id contract
- replay and scanner-effect gates that stay disabled

## Future Execute Path Outline

1. Review this dry-run plan.
2. Provide or recover the verified OHLCV rows without calling the provider unnecessarily.
3. Re-run the dry-run with executable rows and cache readback.
4. Require a separate operator approval signal for candle writes.
5. Execute a tiny scoped candle upsert only after approval.
6. Keep replay, synthetic outcomes, scanner usage, ranking, and live recommendations disabled.
