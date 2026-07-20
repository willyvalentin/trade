# First Tiny Historical Replay Signal Package Selection Approval Gate

This document defines the approval gate for selecting the exact Action 305
recommended signal package candidate for a future replay-with-signal-package
dry-run proposal.

This gate does not execute replay, persist synthetic outcomes, mutate
recommendations, or affect scanner/ranking behavior.

## Purpose

Action 305 recommended the earliest original AAPL recommendation row as the
first tiny replay signal package candidate. This approval gate validates a
future server-side env signal for that exact candidate only.

Valid approval can make the candidate proposal-ready for a later replay with
signal package dry-run action. It does not authorize execution in this action.

## Selected Candidate Details

- Candidate id:
  `recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Source type: `recommendation_row`
- Source row id: `7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Analysis cutoff: `2026-07-08T13:49:19.521608+00:00`
- Direction: `long`
- Entry: `304.86`
- Stop: `295.62`
- Target: `334.12`
- Confidence/tier: `Low`
- Setup label: `UNKNOWN`

## Env Contract

All values are read server-side only:

- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_OPERATOR_LABEL`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_REFERENCE`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_CANDIDATE_ID`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_TYPE`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_ROW_ID`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TICKER`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_INTERVAL`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TRADING_DAY`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ANALYSIS_CUTOFF`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_DIRECTION`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ENTRY`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_STOP`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TARGET`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SYNTHETIC_OUTCOME_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SCANNER_EFFECT_ALLOWED`
- `TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_RANKING_EFFECT_ALLOWED`

## Expected Values

- Approved: `true`
- Operator label: present
- Reference: present
- Candidate id:
  `recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Source type: `recommendation_row`
- Source row id: `7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Analysis cutoff: `2026-07-08T13:49:19.521608+00:00`
- Direction: `long`
- Entry: `304.86`
- Stop: `295.62`
- Target: `334.12`
- Synthetic outcome persistence allowed: `false`
- Scanner effect allowed: `false`
- Ranking effect allowed: `false`

## Expected States

### No Signal

- Approval status: `not_configured`
- Signal active: `false`
- Ready to accept future signal: `true`
- Ready to propose replay with signal package: `false`
- Selected candidate authorized now: `false`
- Replay allowed now: `false`

### Invalid Signal

- Approval status: `invalid`
- Exact blockers describe mismatched or missing fields
- Selected candidate authorized now: `false`
- Replay allowed now: `false`

### Valid Signal

- Approval status: `valid_for_future_replay_with_signal_package`
- Signal active: `true`
- Ready to propose replay with signal package: `true`
- Selected candidate authorized now: `true`
- Replay allowed now: `false`
- Synthetic outcome persistence allowed now: `false`
- Scanner use allowed now: `false`
- Ranking change allowed now: `false`

## Valid But No Execute

A valid approval signal does not execute replay. The next action must be a
separate:

First Tiny Replay With Signal Package Dry-Run Execute Attempt

That future action must still keep synthetic outcome persistence, scanner use,
and ranking changes disabled unless separately approved.

## Safety Guarantees

These remain false in all states:

- `provider_call_executed`
- `provider_call_attempted`
- `candles_persisted`
- `raw_response_persisted`
- `fetch_run_persisted`
- `synthetic_outcomes_persisted`
- `replay_executed`
- `scanner_behavior_changed`
- `live_ranking_changed`
- `recommendation_rows_mutated`
- `supabase_read_executed`
- `supabase_write_executed`
- `scanner_universe_changed`
- `thresholds_changed`
- `outcome_evaluation_persistence_changed`
- `learning_acceleration_changed`
- `add_trade_affected`
- `broker_execution_affected`
- `risk_changed`
