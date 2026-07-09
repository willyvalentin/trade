# First Tiny Fetch-Run Audit Write Approval Gate

This document defines the approval gate for a future write of exactly one `historical_candle_fetch_runs` audit row based on the verified first tiny no-persist provider call.

This action is approval readiness only. It does not insert a fetch run, persist candles, persist a raw response, create synthetic outcomes, run replay, affect scanner behavior, or affect ranking.

## Purpose

The gate verifies that an operator explicitly approves only the smallest possible database write:

- one fetch-run audit row
- source result: `first_tiny_historical_fetch_no_persist_verified`
- ticker: `AAPL`
- max rows: `1`
- no candle persistence
- no raw response persistence
- no replay/scanner/ranking effects

## Env Contract

Expected future server env vars:

- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED`

Expected values:

- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED=true`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL=<safe_operator_label>`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE=<safe_approval_reference>`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER=AAPL`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS=1`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED=false`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED=false`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED=false`

## Validation Rules

The approval is valid for a future audit write only when:

- approved is true
- operator label is present
- approval reference is present
- ticker equals `AAPL`
- max rows equals `1`
- candle persistence allowed is false
- replay allowed is false
- scanner effect allowed is false
- source verification is `first_tiny_historical_fetch_no_persist_verified`
- audit write plan is dry-run ready
- planned audit rows equals `1`
- raw response persistence remains false
- candle persistence remains false
- replay, scanner, and ranking effects remain false

## Invalid States

Any of these blocks approval:

- approval missing or not true
- missing operator label
- missing approval reference
- ticker mismatch
- max rows not `1`
- candle persistence allowed true
- replay allowed true
- scanner effect allowed true
- source verification missing
- audit write plan not ready
- planned audit rows not `1`
- raw response persistence not blocked
- candle persistence not blocked
- replay/scanner/ranking effects not blocked

## Valid But No Write State

When the signal is valid, diagnostics may show:

- approval status: `valid_for_future_audit_write`
- signal active: yes
- ready to propose audit write action: yes
- write allowed now: no
- fetch run persisted: no
- candles persisted: no
- replay executed: no
- scanner behavior changed: no

This state still does not perform the insert. It only permits proposing a separate future execution action.

## Safety Guarantees

- Provider call executed by this approval gate: no
- Historical fetch added: no
- Fetch run persisted: no
- Raw response persisted: no
- Candles persisted: no
- Synthetic outcomes persisted: no
- Replay executed: no
- Scanner behavior changed: no
- Live ranking changed: no
- Add Trade, broker, execution, and risk behavior unchanged

## Next Future Action

After a valid approval signal is reviewed, the next future action may be:

- first tiny fetch-run audit write execute attempt

That future action must still be separate, explicitly approved, and limited to one fetch-run audit row. Candle persistence must remain disabled unless another later approval explicitly permits it.
