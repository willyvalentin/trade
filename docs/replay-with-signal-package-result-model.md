# Replay With Signal Package Result Model

## Purpose

This document describes the static result model for future replay-with-signal-package counterfactual results. The model defines the shape of an interpreted replay result, allowed execution/outcome statuses, required no-effect safety flags, and pure validation helpers.

This model does not execute replay, write Supabase, persist synthetic outcomes, or affect scanner/ranking.

## Execution Statuses

- `replay_with_signal_package_completed`
- `not_approved`
- `blocked_missing_candles`
- `blocked_candle_verification_failed`
- `blocked_signal_package_validation_failed`
- `blocked_missing_analysis_cutoff`
- `failed`

## Outcome Statuses

- `no_entry_triggered`
- `target_hit`
- `stop_hit`
- `open_at_window_end`
- `ambiguous_intrabar_conservative_stop`
- `blocked`
- `failed`

## Result Fields

- `execution_status`
- `outcome_status`
- `counterfactual_result_available`
- `source_verification`
- `candidate_id`
- `source_type`
- `source_row_id`
- `ticker`
- `interval`
- `trading_day`
- `analysis_cutoff`
- `direction`
- `planned_entry`
- `planned_stop`
- `planned_target`
- `candles_read`
- `candles_verified`
- `lookahead_safety_passed`
- `entry_touched`
- `stop_touched`
- `target_touched`
- `entry_timestamp`
- `exit_timestamp`
- `exit_reason`
- `gross_price_move`
- `gross_r_multiple`
- `replay_executed`
- `synthetic_outcomes_persisted`
- `scanner_behavior_changed`
- `live_ranking_changed`
- `recommendation_rows_mutated`
- `supabase_write_executed`
- `provider_call_executed`
- `blockers`
- `warnings`

## Safety Flags

These must stay false for Action 310 and for any dry-run-only result that is not explicitly approved for persistence or production effects:

- `synthetic_outcomes_persisted`
- `scanner_behavior_changed`
- `live_ranking_changed`
- `recommendation_rows_mutated`
- `supabase_write_executed`
- `provider_call_executed`

`replay_executed` may be true only for completed, interpreted counterfactual dry-run shapes. Blocked or failed results must include blockers.

## Example AAPL Candidate Result

```json
{
  "execution_status": "replay_with_signal_package_completed",
  "outcome_status": "open_at_window_end",
  "counterfactual_result_available": true,
  "source_verification": "static_model_fixture",
  "candidate_id": "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  "source_type": "recommendation_row",
  "source_row_id": "7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  "ticker": "AAPL",
  "interval": "5min",
  "trading_day": "2026-07-08",
  "analysis_cutoff": "2026-07-08T13:49:19.521608+00:00",
  "direction": "long",
  "planned_entry": 304.86,
  "planned_stop": 295.62,
  "planned_target": 334.12,
  "candles_read": 73,
  "candles_verified": 73,
  "lookahead_safety_passed": true,
  "entry_touched": true,
  "stop_touched": false,
  "target_touched": false,
  "entry_timestamp": "2026-07-08T13:50:00.000Z",
  "exit_timestamp": "2026-07-08T19:45:00.000Z",
  "exit_reason": "open_at_window_end",
  "gross_price_move": null,
  "gross_r_multiple": null,
  "replay_executed": true,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false,
  "recommendation_rows_mutated": false,
  "supabase_write_executed": false,
  "provider_call_executed": false,
  "blockers": [],
  "warnings": []
}
```

## Non-Runtime Boundary

The implementation is pure TypeScript model code. It has no provider imports, no Supabase imports, no environment reads, no route handlers, no page routes, no proxy changes, no Netlify config changes, and no runtime side effects.
