# First Tiny Historical Replay Dry-Run Plan

This plan follows the verified first tiny historical candle persistence result.
It describes a future replay/backfill dry run using the persisted AAPL candles.
It does not execute replay, persist synthetic outcomes, or affect scanner or
ranking behavior.

## Why This Comes After Candle Persistence Verification

The first tiny candle persistence result is already verified:

- Verification status: `candle_persistence_verified`
- Source verification: `first_tiny_historical_candle_persistence_verified`
- Source table: `historical_candles`
- Provider: `twelve_data`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- Candle rows available: `73`
- Candle rows verified: `73`
- Verified NY window: `09:45-15:45 America/New_York`
- Verified UTC window: `2026-07-08T13:45:00.000Z-2026-07-08T19:45:00.000Z`

Because the source candles are verified, Ture can now plan a replay dry run
against this fixed scope. The plan remains advisory until a separate replay
approval gate exists.

## Future Replay Candidate Scope

- Tickers: `AAPL`
- Trading days: `2026-07-08`
- Intervals: `5min`
- Source candles: persisted `historical_candles`
- Sample origin: `historical_persisted_first_tiny`
- Allowed future use: dry-run/counterfactual only
- Disallowed current use: scanner, ranking, live recommendations

## Lookahead Safety Requirements

Any future replay dry run must enforce:

- Analysis cutoff per candidate.
- No future candles visible before the cutoff.
- Entry/exit simulation may only use candles after the generated signal time.
- No synthetic outcomes persisted without separate approval.
- No scanner or ranking changes without separate approval.

## Current Safety State

- Dry-run only: `true`
- Replay allowed now: `false`
- Synthetic outcome persistence allowed now: `false`
- Scanner use allowed now: `false`
- Ranking change allowed now: `false`
- Separate operator approval required: `true`
- Provider call executed: `false`
- Historical fetch added: `false`
- Candles persisted by this plan: `false`
- Raw response persisted: `false`
- Fetch run persisted: `false`
- Synthetic outcomes persisted: `false`
- Replay executed: `false`
- Scanner behavior changed: `false`
- Live ranking changed: `false`

## Future Replay Approval Contract

The future approval signal is inactive by default. A later action may define and
validate this contract:

- `TURE_FIRST_TINY_REPLAY_APPROVED`
- `TURE_FIRST_TINY_REPLAY_OPERATOR_LABEL`
- `TURE_FIRST_TINY_REPLAY_REFERENCE`
- `TURE_FIRST_TINY_REPLAY_TICKER`
- `TURE_FIRST_TINY_REPLAY_TRADING_DAY`
- `TURE_FIRST_TINY_REPLAY_MAX_TICKERS`
- `TURE_FIRST_TINY_REPLAY_MAX_DAYS`
- `TURE_FIRST_TINY_REPLAY_SYNTHETIC_OUTCOME_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_REPLAY_SCANNER_EFFECT_ALLOWED`
- `TURE_FIRST_TINY_REPLAY_RANKING_EFFECT_ALLOWED`

This action does not validate, activate, or execute the signal.

## Next Steps

- `review_replay_dry_run_plan`
- `add_replay_approval_gate`
- `keep_synthetic_outcomes_scanner_and_ranking_disabled`
