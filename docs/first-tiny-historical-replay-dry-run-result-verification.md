# First Tiny Historical Replay Dry-Run Result Verification

This artifact records the first successful replay dry-run input verification
result for the verified persisted AAPL candle scope.

## Production Replay Dry-Run Result

- Conclusion: `first_tiny_replay_dry_run_input_verified_no_signal_package`
- Verification status: `replay_dry_run_input_verified_no_signal_package`
- Execution status: `replay_dry_run_completed_no_signal_package`
- Route build marker: `action_300_first_tiny_replay_dry_run_execute_attempt`
- Source verification: `first_tiny_historical_candle_persistence_verified`
- Source table: `historical_candles`
- Provider: `twelve_data`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`

## Candle Input Verification

- Expected candle rows: `73`
- Candles read: `73`
- Candles verified: `73`
- Lookahead safety passed: `true`
- Signal package available: `false`
- Counterfactual result available: `false`

The replay dry-run proved that Ture can read and verify the persisted candle
input for the first tiny scope. It also passed the lookahead-safety gate at the
input layer.

## No-Signal-Package Explanation

No historical/static recommendation signal package was available for this exact
AAPL day/window. Because the system must not invent entry, stop, target, side,
or signal time data, no counterfactual outcome was created.

## Safety Flags

- Replay executed: `true`
- Synthetic outcomes persisted: `false`
- Scanner behavior changed: `false`
- Live ranking changed: `false`
- Provider call executed: `false`
- Provider call attempted: `false`
- Candles persisted by this action: `false`
- Raw response persisted: `false`
- Fetch run persisted: `false`
- Recommendation rows mutated: `false`
- Scanner universe changed: `false`
- Thresholds changed: `false`
- Outcome evaluation persistence changed: `false`
- Learning Acceleration changed: `false`
- Add Trade affected: `false`
- Broker/execution affected: `false`
- Risk changed: `false`

## Current State

- Ready for signal package replay planning: `true`
- Synthetic outcome persistence allowed now: `false`
- Scanner use allowed now: `false`
- Ranking change allowed now: `false`

## Next Step

- Disable `TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=true` after the verified
  replay dry-run success if it is still configured.
- Plan a historical/static signal package for replay, or build a
  signal-package discovery/readback layer.
- Require separate approval before synthetic outcome persistence or scanner use.
