# First Tiny Historical Replay Signal Package Selection Plan

This is a read-only selection plan for the first tiny replay signal package.
It recommends one candidate for a future replay-with-signal dry-run, but it does
not select an executable package, execute replay, persist synthetic outcomes, or
mutate recommendation data.

## Purpose

Action 304 verified that the Action 303 readback found 9 compatible AAPL signal
package candidates across 2 generation groups. This plan defines deterministic
selection rules and recommends the candidate that should proceed to a separate
selection approval gate.

## Fixed Scope

- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Compatible candidates: `9`
- Candidate groups: `2`
- Source verification: `signal_package_discovery_readback_verified`

## Selection Rules

The first tiny replay selection rules are:

1. Prefer `recommendation_row` over `recommendation_snapshot` when both
   represent the same generation event, because the row is closer to the
   original recommendation entity.
2. Prefer the earliest valid `analysis_cutoff` for the first replay, because it
   gives the longest forward candle window and tests lookahead boundaries most
   clearly.
3. Prefer complete direction, entry, stop, and target geometry.
4. Prefer explicit confidence/tier/setup metadata as a tiebreaker only. This
   does not override source type plus earliest cutoff for the first replay.
5. Reject candidates with missing entry, stop, or target.
6. Reject candidates whose analysis cutoff is outside the verified candle window
   or cannot be validated.
7. Require a separate approval gate before any executable selection or replay.

## Grouped Candidate Review

### Early Group

- Analysis cutoff: `2026-07-08T13:49:19Z`
- Candidate count: `4`
- Preferred source candidate:
  `recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Entry/stop/target summary: `entry 304.86-307.94 / stop 295.62 / target 334.12`
- Selection notes:
  - earliest generation group
  - recommendation row preferred over snapshot duplicates
  - longest forward candle window for first replay

Candidates:

- `recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- `recommendation_snapshot:rec_snap_g6m5eg`
- `recommendation_snapshot:rec_snap_74idsa`
- `recommendation_snapshot:rec_snap_1vtsd7u`

### Later Group

- Analysis cutoff: `2026-07-08T16:47:52Z`
- Candidate count: `5`
- Preferred source candidate:
  `recommendation_row:f87978f3-9ffa-4105-9823-040c8497d55b`
- Entry/stop/target summary: `entry 309.31-312.43 / stop 299.93 / target 338.98`
- Selection notes:
  - compatible but later generation group
  - not preferred for first replay
  - retained for future comparison plan

Candidates:

- `recommendation_row:f87978f3-9ffa-4105-9823-040c8497d55b`
- `recommendation_snapshot:rec_snap_1viofd0`
- `recommendation_snapshot:rec_snap_g2fltu`
- `recommendation_snapshot:rec_snap_1xkdli2`
- `recommendation_snapshot:rec_snap_hz0rjq`

## Recommended Candidate

- Candidate id:
  `recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Source type: `recommendation_row`
- Source row id: `7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Analysis cutoff: `2026-07-08T13:49:19.521608+00:00`
- Direction: `long`
- Entry: `304.86`
- Stop: `295.62`
- Target: `334.12`
- Confidence/tier: `Low`
- Setup label: `UNKNOWN`

This candidate is recommended because it is the original recommendation row in
the earliest generation group, has complete direction/entry/stop/target fields,
includes explicit confidence/tier and setup metadata, gives the longest
subsequent candle window, and avoids snapshot duplication.

## Why Snapshots Are Not Preferred

The snapshot candidates are compatible, but several represent duplicated
variants of the same generation event. For the first replay-with-signal dry-run,
the original recommendation row is preferred so the package stays closest to
the initial signal source.

## Why Later Group Is Not Preferred

The later group is compatible, but it has a later cutoff. For first replay, the
earliest valid cutoff is preferred because it maximizes the forward candle
window and makes lookahead safety easiest to review.

## Safety Flags

These remain false:

- `selected_candidate_now`
- `replay_executed`
- `synthetic_outcomes_persisted`
- `scanner_behavior_changed`
- `live_ranking_changed`
- `recommendation_rows_mutated`
- `provider_call_executed`
- `provider_call_attempted`
- `candles_persisted`
- `raw_response_persisted`
- `fetch_run_persisted`
- `supabase_write_executed`
- `scanner_universe_changed`
- `thresholds_changed`
- `outcome_evaluation_persistence_changed`
- `learning_acceleration_changed`
- `add_trade_affected`
- `broker_execution_affected`
- `risk_changed`
- `replay_allowed_now`
- `synthetic_outcome_persistence_allowed_now`
- `scanner_use_allowed_now`
- `ranking_change_allowed_now`

## Next Step

First Tiny Signal Package Selection Approval Gate

Recommended next steps:

- `review_recommended_signal_package`
- `add_selection_approval_gate`
- `keep_synthetic_outcomes_scanner_and_ranking_disabled`
