# Executable First Tiny Candle Persistence Dry-Run Plan v2

Conclusion: `first_tiny_historical_candle_executable_persistence_dry_run_planned`

Plan version: `v2_static_ohlcv_payload`

Status: `planned / dry-run only`

## Why v2 Exists

Action 291 created the executable candle persistence dry-run planner, but the available Action 290 artifact only recorded timestamp and metadata rows. The helper correctly rejected all 73 rows because OHLCV values were not present, and it did not invent them.

Action 292 added the operator-observed Action 289 normalized OHLCV payload as a static review artifact:

- source artifact: `docs/first-tiny-historical-candle-corrected-filtered-ohlcv-payload.json`
- source verification: `corrected_first_tiny_ohlcv_payload_static_captured`
- provider: `twelve_data`
- ticker: `AAPL`
- interval: `5min`
- trading day: `2026-07-08`
- fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- expected candle rows: `73`
- first timestamp: `2026-07-08T13:45:00.000Z`
- last timestamp: `2026-07-08T19:45:00.000Z`

## Target Upsert Plan

- target table: `historical_candles`
- conflict target: `provider, ticker, interval, timestamp, adjusted`
- dry run only: `true`
- candle write allowed now: `false`
- requires separate operator approval: `true`
- executable payload available: `true`
- candidate candle rows: `73`
- timestamp-valid rows: `73`
- candle-write-valid rows: `73`
- invalid candle rows: `0`
- planned inserts: `73`
- planned updates: `0`
- planned skips: `0`
- planned rejections: `0`

If historical candle readback is unavailable, the exact insert/update/skip split is conservative and reports `exact_insert_update_skip_split_requires_readback`. In that state the first-time dry-run plan assumes `73` planned inserts and no updates/skips/rejections.

## Validation Checks

Each static OHLCV row is checked for:

- provider equals `twelve_data`
- ticker equals `AAPL`
- interval equals `5min`
- timestamp exists and is ISO UTC
- timestamps are exactly five minutes apart
- first timestamp equals `2026-07-08T13:45:00.000Z`
- last timestamp equals `2026-07-08T19:45:00.000Z`
- open/high/low/close are finite numbers
- volume is finite and non-negative
- high is greater than or equal to low, open, and close
- low is less than or equal to open and close
- adjusted equals `false`
- trading day equals `2026-07-08`
- session equals `regular`
- timezone equals `America/New_York`
- fetch run id equals `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`

The planner does not invent, round, normalize, or mutate OHLCV values. It reads the static Action 292 payload exactly as captured.

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
- explicit operator review of this v2 dry-run plan
- a write path scoped to the fixed AAPL / 5min / 2026-07-08 / fetch-run-id contract
- replay and scanner-effect gates that stay disabled

## Future Execute Path Outline

1. Review the v2 dry-run plan and static OHLCV artifact.
2. Confirm schema readiness and cache readback state.
3. Require a separate candle persistence approval signal.
4. Execute only the tiny scoped candle upsert after approval.
5. Keep replay, synthetic outcomes, scanner usage, ranking, and live recommendations disabled.
