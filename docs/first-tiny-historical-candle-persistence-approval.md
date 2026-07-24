# First Tiny Candle Persistence Approval Gate

Conclusion: candle persistence approval is modeled, but no candle write is executable in this action.

## Purpose

This gate prepares a future operator approval signal for exactly one tiny `historical_candles` write proposal. It is scoped only to the Action 292 static OHLCV payload and the Action 293 v2 dry-run plan:

- provider: `twelve_data`
- ticker: `AAPL`
- interval: `5min`
- trading day: `2026-07-08`
- session: `regular`
- timezone: `America/New_York`
- adjusted: `false`
- fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- expected rows: `73`
- expected inserts: `73` unless a future readback-backed dry-run explicitly reports a different insert/update/skip split
- source verification: `corrected_first_tiny_ohlcv_payload_static_captured`
- plan version: `v2_static_ohlcv_payload`

## Env Contract

All values are server-env only. Do not expose secrets or arbitrary env values.

```text
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=true
TURE_FIRST_TINY_CANDLE_PERSISTENCE_OPERATOR_LABEL=<operator label>
TURE_FIRST_TINY_CANDLE_PERSISTENCE_REFERENCE=<review/change reference>
TURE_FIRST_TINY_CANDLE_PERSISTENCE_TICKER=AAPL
TURE_FIRST_TINY_CANDLE_PERSISTENCE_INTERVAL=5min
TURE_FIRST_TINY_CANDLE_PERSISTENCE_TRADING_DAY=2026-07-08
TURE_FIRST_TINY_CANDLE_PERSISTENCE_FETCH_RUN_ID=fc58a15a-1748-4e8d-b7d9-03e4826c1d5f
TURE_FIRST_TINY_CANDLE_PERSISTENCE_MAX_ROWS=73
TURE_FIRST_TINY_CANDLE_PERSISTENCE_EXPECTED_INSERTS=73
TURE_FIRST_TINY_CANDLE_PERSISTENCE_RAW_RESPONSE_PERSIST_ALLOWED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_REPLAY_ALLOWED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_SCANNER_EFFECT_ALLOWED=false
```

## Invalid States

The gate returns `invalid` if any supplied signal is present but does not match the fixed contract. Examples:

- approval is not `true`
- operator label is missing
- reference is missing
- ticker is not `AAPL`
- interval is not `5min`
- trading day is not `2026-07-08`
- fetch run id does not match `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- max rows is not `73`
- expected inserts does not match the dry-run plan
- raw response persistence is allowed
- replay is allowed
- scanner effect is allowed
- source verification is not `corrected_first_tiny_ohlcv_payload_static_captured`
- plan version is not `v2_static_ohlcv_payload`
- candle-write-valid rows is not `73`
- planned invalid rejections is not `0`

## Valid But No Write

A valid signal returns:

- approval status: `valid_for_future_candle_persistence`
- ready to propose candle persistence write: `true`
- candle write allowed now: `false`
- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`

The valid state is only proposal readiness. It does not insert candles.

## Safety Guarantees

This gate does not:

- call Twelve Data
- fetch candles
- persist candles
- persist raw response
- persist fetch-run rows
- persist synthetic outcomes
- run replay
- affect scanner universe
- affect ranking
- affect thresholds
- affect visible recommendations
- affect outcome evaluation
- affect Learning Acceleration
- affect Add Trade
- affect broker, execution, or risk

## Future Execute Action

The future action name is:

`First Tiny Candle Persistence Execute Attempt`

That separate action must keep the same fixed scope, require the valid approval signal, and keep replay/scanner/ranking effects disabled.
