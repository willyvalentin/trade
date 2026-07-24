# Action 345: First Tiny Provider Capacity Experiment Plan

## Experiment Plan Status

- first_tiny_provider_capacity_experiment_status: experiment_plan_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is provider capacity experiment planning only, not provider implementation, runtime implementation, Supabase persistence, replay execution, scanner mutation, ranking mutation, deploy readiness, or main-push authorization.

## Purpose

Ture needs provider capacity knowledge before broad data collection. The first experiment must be tiny and capacity-focused.

The purpose is to measure request behavior, response shape, row count, latency, payload size, and failure modes. It must not start broad backfill. It must not write to Supabase. It must not affect recommendations.

## Future Experiment Scope

Smallest future experiment:

- provider: Twelve Data or current configured market data provider
- symbol: one highly liquid ticker, preferably AAPL or SPY
- interval: 5min
- trading day: one known trading day
- adjusted: explicitly declared
- output: inspect response only
- writes: none
- replay: none
- scanner/ranking: none
- route: none unless separately approved by runtime ping checklist
- execution context: local/dev only first

## Metrics To Measure

- request_started
- request_completed
- request_duration_ms
- provider_status_code
- provider_error_code
- rate_limit_headers_available
- response_size_bytes
- candle_rows_returned
- first_candle_timestamp
- last_candle_timestamp
- missing_candle_count
- malformed_rows_count
- adjusted_or_unadjusted
- provider_time_zone_behavior
- retry_required
- failure_mode
- estimated_requests_per_symbol_per_day
- estimated_requests_for_backfill_window

## Capacity Calculations

Future calculations should include:

- candles_per_day_by_interval
- requests_per_symbol
- requests_per_universe_tier
- requests_per_backfill_window
- estimated_payload_size
- estimated_storage_size_normalized
- estimated_raw_response_size
- estimated_daily_collection_cost
- estimated_backfill_cost

## Future No-Write Result Shape

Future local result object:

- experiment_status
- provider_call_executed
- provider_call_attempted
- supabase_write_executed: false
- candles_persisted: false
- raw_response_persisted: false
- fetch_run_persisted: false
- replay_executed: false
- scanner_behavior_changed: false
- live_ranking_changed: false
- recommendation_rows_mutated: false
- provider
- symbol
- interval
- trading_day
- row_count
- payload_size_bytes
- duration_ms
- warnings
- blockers
- capacity_estimates

## Approval Gates Before Future Execution

Default false:

- TURE_FIRST_TINY_PROVIDER_CAPACITY_EXPERIMENT_APPROVED=false
- TURE_PROVIDER_CALLS_APPROVED=false
- TURE_SUPABASE_WRITE_APPROVED=false
- TURE_RAW_RESPONSE_PERSISTENCE_APPROVED=false
- TURE_CANDLE_PERSISTENCE_APPROVED=false
- TURE_REPLAY_EXECUTION_APPROVED=false
- TURE_SCANNER_RANKING_MUTATION_APPROVED=false

## Safety Constraints

- no production route required
- no Supabase writes
- no raw response persistence
- no candle persistence
- no replay
- no scanner/ranking mutation
- no recommendation mutation
- no broad universe
- no multi-day backfill
- no news API call
- no deploy
- no main push

## Success Criteria

- one request scope clearly bounded
- response shape understood
- row count understood
- latency understood
- payload size understood
- failure/rate-limit behavior captured if present
- no writes happened
- no replay happened
- no recommendation behavior changed
- capacity estimate produced

## Failure Criteria

- provider request unavailable
- ambiguous response shape
- missing required candle fields
- unexpected timezone behavior
- rate limit encountered
- payload too large
- response inconsistent
- any write attempted
- any replay attempted
- any scanner/ranking mutation attempted

## Relation To Existing Work

This future experiment should map to:

- historical candle persistence/readback foundation
- fetch-run audit work
- Action 339 cost/capacity plan
- Action 333 existing coverage audit
- Action 338/344 runtime safety plans

Future experiment should extend existing provider/audit patterns where valid. Do not duplicate existing historical candle storage or fetch-run audit concepts.

## Blocked Implementation Work

- no provider experiment implementation yet
- no provider calls yet
- no Supabase writes yet
- no runtime route yet
- no persistence yet
- no broad backfill yet
- no replay execution yet
- no scanner/ranking mutation yet
- no deploy
- no main push

This experiment plan does not authorize provider experiment implementation, provider calls, news API calls, candle fetches, Supabase remote reads, Supabase reads, Supabase writes, raw response persistence, candle persistence, fetch-run persistence, learning dataset persistence, context snapshot persistence, pattern insight persistence, runtime route changes, app/api changes, app page changes, replay execution, scanner mutations, ranking mutations, confidence threshold changes, deploys, main pushes, recommendation mutation, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 346: Existing Schema Compatibility Matrix
- Action 347: Learning Dataset Static Fixture Implementation Plan
- Action 348: Intelligence Context Static Fixture Implementation Plan
- Action 349: Pattern Insight Static Fixture Spec
- Action 350: Runtime Ping-Only Route Approval Gate
- Action 351: First Tiny Provider Capacity Experiment Approval Gate
