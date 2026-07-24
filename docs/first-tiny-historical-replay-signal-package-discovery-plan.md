# First Tiny Historical Replay Signal Package Discovery Plan

This plan follows the first replay dry-run result verification. The replay could
read and verify 73 persisted AAPL candles and pass lookahead safety, but it
stopped at `replay_dry_run_completed_no_signal_package` because no compatible
signal package was available.

This action does not create a signal package, execute replay, persist synthetic
outcomes, or affect scanner/ranking behavior.

## Verified Candle Source

- Source verification: `first_tiny_replay_dry_run_input_verified_no_signal_package`
- Candle source table: `historical_candles`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Candle rows verified: `73`
- Candle window UTC: `2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z`
- Candle window NY: `09:45 -> 15:45`

## Why Replay Stopped

Replay stopped because no historical/static signal package exists for the fixed
AAPL scope. Without signal context, Ture must not invent entry, stop, target,
side, analysis cutoff, or generated signal time data.

Blocking reasons:

- `replay_signal_package_missing`
- `cannot_compute_counterfactual_without_entry_stop_target`
- `synthetic_outcome_persistence_not_allowed`
- `scanner_and_ranking_effects_disabled`

## Compatible Signal Package Requirements

A future compatible replay signal package must include:

- `signal_package_id`
- Source type: `existing_recommendation_snapshot`,
  `static_replay_fixture`, or `manually_reviewed_signal_package`
- Ticker: `AAPL`
- Trading day: `2026-07-08`
- Interval: `5min`
- `generated_at` or `analysis_cutoff` timestamp
- Direction: long/short if applicable
- Entry type
- Entry price or rule
- Stop price or rule
- Target price or rule
- Risk/reward metadata if available
- Confidence/tier if available
- Setup label if available
- Source recommendation id or snapshot id if derived from existing data
- Lookahead safety metadata
- No broker/execution fields required

No package is created in this action.

## Candidate Discovery Sources

Future read-only discovery may inspect:

- Existing recommendation rows for AAPL on `2026-07-08`
- Recommendation snapshots for AAPL on `2026-07-08`
- Static verified replay fixture, if later created
- Manual operator-reviewed package, if later created

This action does not query Supabase.

## Current Safety State

- Signal package available now: `false`
- Signal package created now: `false`
- Replay executed: `false`
- Synthetic outcomes persisted: `false`
- Scanner behavior changed: `false`
- Live ranking changed: `false`
- Provider call executed: `false`
- Supabase read executed: `false`
- Supabase write executed: `false`
- Recommendation rows mutated: `false`
- Ranking change allowed now: `false`
- Scanner use allowed now: `false`
- Synthetic outcome persistence allowed now: `false`
- Separate operator approval required: `true`

## Next Path

1. Add signal package discovery readback.
2. If no existing package exists, create a static/manual signal package plan.
3. Run replay dry-run with a signal package.
4. Only later, with separate approval, consider synthetic outcome persistence.

Recommended next steps:

- `review_signal_package_requirements`
- `add_signal_package_discovery_readback`
- `or_create_static_signal_package_plan`
- `keep_synthetic_outcomes_scanner_and_ranking_disabled`
