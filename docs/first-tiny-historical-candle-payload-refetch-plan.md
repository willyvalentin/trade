# First Tiny Historical Candle Payload Refetch Plan

This document plans a future refetch for the missing first tiny AAPL candle payload. It does not call Twelve Data and does not write data.

This action must not fetch candles, persist candles, persist raw provider responses, persist additional fetch-run rows, persist synthetic outcomes, run replay/backfill, change scanner behavior, change ranking, affect visible recommendations, affect Learning Acceleration, affect Add Trade, affect broker/execution, or affect risk.

## Why Payload Is Missing

The first production provider call was intentionally no-persist:

- provider call status: `provider_call_completed_no_persist`
- raw response persisted: `false`
- candles persisted: `false`
- valid candles observed: `27`

The later fetch-run audit write only recorded the audit row:

- source verification: `first_tiny_fetch_run_audit_write_verified`
- target table: `historical_candle_fetch_runs`
- fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- readback verified: `true`

That audit row proves the run, but it does not contain the normalized OHLCV payload needed for candle inserts.

The current candle persistence planning layer is marked:

- candle persistence dry-run marker: `first_tiny_historical_candle_persistence_dry_run_planned`

## No Invented Candle Values

Ture must not invent OHLCV values. The current candle persistence plan is count-level only:

- expected candle rows: `27`
- candle payload available: `false`
- executable candle rows available: `false`
- ready for future candle write: `false`

## Exact Future Refetch Scope

- provider: `twelve_data`
- endpoint: `time_series`
- ticker: `AAPL`
- interval: `5min`
- trading day: `2026-07-08`
- start date: `2026-07-08T13:45:00.000Z`
- end date: `2026-07-08T19:45:00.000Z`
- timezone: `America/New_York`
- session: `regular`
- adjusted: `false`
- expected candle rows: `27`
- request count: `1`
- estimated credits: `1`
- cache key: `twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false`
- existing fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`

## Plan Status

- refetch plan status: `planned`
- dry run only: `true`
- provider call allowed now: `false`
- candle persistence allowed now: `false`
- raw response persistence allowed now: `false`
- replay allowed now: `false`
- scanner effect allowed now: `false`
- requires separate operator approval: `true`

## Future Approval Env Contract

The future approval signal is inactive by default. Expected env vars:

- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_OPERATOR_LABEL`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REFERENCE`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_TICKER`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_MAX_REQUESTS`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_ESTIMATED_CREDITS`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REPLAY_ALLOWED`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED`

Validation rules:

- approved must be `true`
- operator label required
- reference required
- ticker must equal `AAPL`
- max requests must equal `1`
- estimated credits must equal `1`
- candle persist allowed must be `false`
- raw response persist allowed must be `false`
- replay allowed must be `false`
- scanner effect allowed must be `false`
- source verification must be `first_tiny_fetch_run_audit_write_verified`
- fetch run id must match `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`

Even a valid signal is only valid for a future payload refetch execute action. It does not execute now.

## Readiness States

- no signal: `not_configured`, ready to accept future signal
- invalid signal: `invalid`, blockers shown
- valid signal: `valid_for_future_payload_refetch`, ready to propose a future execute action
- execute now: `false`

## No-Write Guarantees

- provider call executed: `false`
- provider fetch added: `false`
- historical fetch added: `false`
- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`

## Future Path

1. Approved payload refetch execute action.
2. Executable candle persistence dry-run with actual normalized payload.
3. Separate candle persistence approval gate.
4. Final candle write execute attempt.

## Recommended Next Steps

1. `configure_valid_payload_refetch_approval_signal`
2. `require_separate_action_before_provider_refetch`
3. `keep_candle_persistence_disabled_until_payload_is_available`

## Conclusion

`first_tiny_historical_candle_payload_refetch_planned`

Ture now has a safe dry-run plan and inactive approval contract for refetching the missing AAPL candle payload. It does not call Twelve Data, does not persist raw response or candles, and does not affect replay, scanner, ranking, or live recommendation behavior.
