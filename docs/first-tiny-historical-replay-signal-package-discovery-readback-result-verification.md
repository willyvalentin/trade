# First Tiny Signal Package Discovery Readback Result Verification

This artifact records the operator-observed Action 303 production readback
result. It is static and read-only. It does not query Supabase, execute replay,
select a final replay package, or persist synthetic outcomes.

## Production Discovery Result

- Readback marker:
  `action_303_first_tiny_replay_signal_package_discovery_readback`
- Verification status: `signal_package_discovery_readback_verified`
- Discovery status: `compatible_signal_package_found`
- Source verification:
  `first_tiny_replay_dry_run_input_verified_no_signal_package`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Recommendation rows checked: `2`
- Recommendation snapshots checked: `7`
- Candidates found: `9`
- Compatible candidates: `9`
- Best candidate available: `true`
- Signal package available now: `true`
- Signal package created now: `false`

## Compatible Candidates

1. `recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
   - Generated at / analysis cutoff:
     `2026-07-08T13:49:19.521608+00:00`
   - Direction: `long`
   - Entry: `304.86`
   - Stop: `295.62`
   - Target: `334.12`
   - Confidence/tier: `Low`
   - Setup label: `UNKNOWN`

2. `recommendation_row:f87978f3-9ffa-4105-9823-040c8497d55b`
   - Generated at / analysis cutoff:
     `2026-07-08T16:47:52.441246+00:00`
   - Direction: `long`
   - Entry: `309.31`
   - Stop: `299.93`
   - Target: `338.98`
   - Confidence/tier: `Low`
   - Setup label: `UNKNOWN`

3. `recommendation_snapshot:rec_snap_g6m5eg`
   - Generated at / analysis cutoff:
     `2026-07-08T13:49:19.521+00:00`
   - Direction: `long`
   - Entry: `307.94`
   - Stop: `295.62`
   - Target: `334.12`
   - Confidence/tier: `null`

4. `recommendation_snapshot:rec_snap_74idsa`
   - Generated at / analysis cutoff:
     `2026-07-08T13:49:19.521+00:00`
   - Direction: `long`
   - Entry: `307.94`
   - Stop: `295.62`
   - Target: `334.12`
   - Confidence/tier: `64`

5. `recommendation_snapshot:rec_snap_1vtsd7u`
   - Generated at / analysis cutoff:
     `2026-07-08T13:49:19.521+00:00`
   - Direction: `long`
   - Entry: `307.94`
   - Stop: `295.62`
   - Target: `334.12`
   - Confidence/tier: `64`

6. `recommendation_snapshot:rec_snap_1viofd0`
   - Generated at / analysis cutoff:
     `2026-07-08T16:47:52.441+00:00`
   - Direction: `long`
   - Entry: `312.43`
   - Stop: `299.93`
   - Target: `338.98`
   - Confidence/tier: `null`

7. `recommendation_snapshot:rec_snap_g2fltu`
   - Generated at / analysis cutoff:
     `2026-07-08T16:47:52.441+00:00`
   - Direction: `long`
   - Entry: `312.43`
   - Stop: `299.93`
   - Target: `338.98`
   - Confidence/tier: `60`

8. `recommendation_snapshot:rec_snap_1xkdli2`
   - Generated at / analysis cutoff:
     `2026-07-08T16:47:52.441+00:00`
   - Direction: `long`
   - Entry: `312.43`
   - Stop: `299.93`
   - Target: `338.98`
   - Confidence/tier: `60`

9. `recommendation_snapshot:rec_snap_hz0rjq`
   - Generated at / analysis cutoff:
     `2026-07-08T16:47:52.441+00:00`
   - Direction: `long`
   - Entry: `312.43`
   - Stop: `299.93`
   - Target: `338.98`
   - Confidence/tier: `60`

## Grouped Summary

### Early Generation Group

- Cutoff: `2026-07-08T13:49:19Z`
- Source types: `recommendation_row`, `recommendation_snapshot`
- Candidate count: `4`
- Candidate ids:
  - `recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
  - `recommendation_snapshot:rec_snap_g6m5eg`
  - `recommendation_snapshot:rec_snap_74idsa`
  - `recommendation_snapshot:rec_snap_1vtsd7u`
- Direction: `long`
- Entry range: `304.86 -> 307.94`
- Stop: `295.62`
- Target: `334.12`
- Confidence/tier availability: `Low`, `64`, and `null`
- Completeness: `complete`
- Replay suitability notes:
  - complete entry, stop, target, and direction
  - duplicated snapshot variants require a separate selection plan
  - do not execute replay from this verification step

### Later Generation Group

- Cutoff: `2026-07-08T16:47:52Z`
- Source types: `recommendation_row`, `recommendation_snapshot`
- Candidate count: `5`
- Candidate ids:
  - `recommendation_row:f87978f3-9ffa-4105-9823-040c8497d55b`
  - `recommendation_snapshot:rec_snap_1viofd0`
  - `recommendation_snapshot:rec_snap_g2fltu`
  - `recommendation_snapshot:rec_snap_1xkdli2`
  - `recommendation_snapshot:rec_snap_hz0rjq`
- Direction: `long`
- Entry range: `309.31 -> 312.43`
- Stop: `299.93`
- Target: `338.98`
- Confidence/tier availability: `Low`, `60`, and `null`
- Completeness: `complete`
- Replay suitability notes:
  - complete entry, stop, target, and direction
  - duplicated snapshot variants require a separate selection plan
  - do not execute replay from this verification step

## Safety Flags

These remain false:

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

## Conclusion

`first_tiny_signal_package_discovery_readback_verified`

The readback found 9 compatible AAPL candidates across 2 generation groups.
No final replay package is selected in this action.

## Next Step

`first_tiny_signal_package_selection_plan`

Recommended next steps:

- `review_signal_package_candidates`
- `create_signal_package_selection_plan`
- `keep_synthetic_outcomes_scanner_and_ranking_disabled`
