# First Tiny Historical Fetch Run Audit Write Plan

This document prepares a future, separate write of exactly one `historical_candle_fetch_runs` audit record for the first tiny historical fetch.

This is a dry-run plan only. It does not write the fetch run, candles, raw provider response, synthetic outcomes, replay output, scanner state, ranking state, or live recommendation state.

## Why Audit Write Comes First

The first safe database write should be the smallest possible audit record, not candle persistence.

Writing one fetch-run audit row first lets Ture verify:

- service-role write path behavior
- RLS and client-write boundaries
- request metadata shape
- provider credit accounting shape
- no candle-row side effects

Candle persistence remains disabled until a separate future approval.

## Source Verified Result

Source verification: `first_tiny_historical_fetch_no_persist_verified`

Verified result:

- Execution status: `provider_call_completed_no_persist`
- Provider: `twelve_data`
- Endpoint: `time_series`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Session: `regular`
- Timezone: `America/New_York`
- Adjusted: false
- Cache key: `twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false`
- Request count: `1`
- Estimated credits: `1`
- Cache lookup attempted: yes
- Cache hit: no
- Call attempted: yes
- Call succeeded: yes
- HTTP status: `200`
- Parse status: `ok`
- Raw/normalized/valid/invalid candles: `27 / 27 / 27 / 0`
- Planned inserts/updates/skips/rejections: `27 / 0 / 0 / 0`

## Target Table

Target table: `historical_candle_fetch_runs`

Readiness checks before any future write:

- `historical_candle_fetch_runs` table detected
- RLS enabled
- service-role-only write path expected
- client writes not allowed

No insert is performed by this plan.

## Planned Audit Fields

The future audit row would represent:

- `provider`: `twelve_data`
- `request_type`: `time_series`
- `ticker_count`: `1`
- `candle_count`: `27`
- `interval`: `5min`
- `trading_day_start`: `2026-07-08`
- `trading_day_end`: `2026-07-08`
- `status`: `completed_no_persist`
- `provider_credits_estimated`: `1`
- `provider_credits_used`: `1`
- `cache_hits`: `0`
- `cache_misses`: `1`
- metadata including ticker, session, timezone, adjusted flag, cache key, HTTP status, parse status, and no-persist safety flags

Planned audit rows: `1`

## No-Candle-Persistence Guarantee

- Candle rows to persist: `0`
- Raw response to persist: no
- Candles persisted: no
- Fetch run persisted now: no
- Candle persistence must remain false in any future approval for this audit write

## No Replay Or Scanner Guarantee

- Replay to run: no
- Synthetic outcomes persisted: no
- Scanner behavior changed: no
- Live ranking changed: no
- Visible recommendations changed: no

## Future Approval Env Contract

The future audit write approval signal is inactive by default and is not required for this planning action.

Expected future env names:

- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED`

Future validation rules:

- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED` must be `true`
- operator label must be present
- approval reference must be present
- ticker must match `AAPL`
- max rows must equal `1`
- candle persistence must remain false
- raw response persistence must remain false
- replay and scanner effects must remain false

## Rollback / No-Op Plan

Current state is no-op:

- `dry_run_only`: true
- `fetch_run_write_allowed_now`: false
- `fetch_run_persisted`: false
- `candles_persisted`: false
- `requires_separate_operator_approval`: true

If any readiness check is unclear, keep the plan as no-op and do not add write code. Any future database write requires a separate operator approval and a separate implementation action.

## Recommended Next Steps

- `review_fetch_run_audit_write_plan`
- `require_separate_approval_before_fetch_run_audit_write`
- `keep_candle_persistence_disabled`
