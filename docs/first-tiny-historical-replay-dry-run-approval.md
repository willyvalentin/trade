# First Tiny Historical Replay Dry-Run Approval Gate

This artifact defines the approval gate for one future first tiny replay dry run
using the verified persisted AAPL candles. It does not execute replay and does
not persist synthetic outcomes.

## Purpose

The first tiny replay dry-run plan is based on the verified persisted source:

- Source verification: `first_tiny_historical_candle_persistence_verified`
- Source table: `historical_candles`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- Candle rows verified: `73`
- Lookahead safety required: `true`

This approval gate can make a future replay dry-run proposal-ready. It does not
authorize replay execution in this action.

## Exact Env Contract

A valid future approval signal must use all of these server-side env vars:

- `TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=true`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_OPERATOR_LABEL=<non-empty operator label>`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_REFERENCE=<non-empty approval reference>`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_TICKER=AAPL`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_TRADING_DAY=2026-07-08`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_INTERVAL=5min`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_FETCH_RUN_ID=fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_TICKERS=1`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_DAYS=1`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_SYNTHETIC_OUTCOME_PERSIST_ALLOWED=false`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_SCANNER_EFFECT_ALLOWED=false`
- `TURE_FIRST_TINY_REPLAY_DRY_RUN_RANKING_EFFECT_ALLOWED=false`

## States

### Not Configured

- Approval status: `not_configured`
- Signal active: `false`
- Ready to accept future signal: `true` when the replay plan is ready
- Ready to propose replay dry-run action: `false`
- Replay allowed now: `false`

### Invalid

Approval status is `invalid` when any required value is missing or mismatched.
Examples include:

- `approved_not_true`
- `missing_operator_label`
- `missing_reference`
- `ticker_mismatch`
- `trading_day_mismatch`
- `interval_mismatch`
- `fetch_run_id_mismatch`
- `max_tickers_not_1`
- `max_days_not_1`
- `synthetic_outcome_persist_not_false`
- `scanner_effect_not_false`
- `ranking_effect_not_false`
- `source_verification_mismatch`
- `candle_rows_verified_not_73`
- `lookahead_safety_missing`

### Valid But No Execute

Approval status is `valid_for_future_replay_dry_run` when the signal matches the
fixed contract. Even then:

- Replay allowed now: `false`
- Synthetic outcome persistence allowed now: `false`
- Scanner use allowed now: `false`
- Ranking change allowed now: `false`

A separate future execute action is required:

`First Tiny Replay Dry-Run Execute Attempt`

## Lookahead Safety Requirements

Any future execute action must preserve:

- Analysis cutoff per candidate.
- No future candles visible before cutoff.
- Entry/exit simulation uses only candles after generated signal time.
- No synthetic outcome persistence without separate approval.
- No scanner or ranking changes without separate approval.

## Safety Guarantees

This approval gate does not:

- Call Twelve Data.
- Fetch candles.
- Persist candles.
- Persist raw responses.
- Persist fetch-run rows.
- Persist synthetic outcomes.
- Execute replay/backfill.
- Change scanner universe, ranking, thresholds, visible recommendations,
  outcome evaluation, Learning Acceleration, Add Trade, broker/execution, or
  risk behavior.
