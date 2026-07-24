# Action 565 - Continuous Market Intelligence Budget Orchestrator

## Purpose

Action 565 adds a planning-only Continuous Market Intelligence Budget Orchestrator for Ture.

The goal is to move product thinking away from fixed Morning, Midday, and Power Hour gates and toward a continuous market-intelligence model. This action does not implement the shared candle cache or rolling collector. It creates the deterministic budget plan that Action 566 can use as its input contract.

## Scope

Added:

- `lib/continuous-intelligence-budget-orchestrator.ts`
- `lib/continuous-intelligence-budget-plan-input.ts`
- Market Diagnostics section: `Continuous Intelligence Budget Plan`
- Hidden/copyable JSON payload: `trade-continuous-intelligence-budget-plan-json`
- Focused test coverage for the pure planner and diagnostics integration

Not changed:

- Provider calls
- WebSocket connections
- Supabase reads or writes
- Recommendation ranking
- Recommendation publication
- Scanner universe
- Execution, broker, Add Trade, risk, or sizing
- Scheduled scan cadence
- Scheduled outcome cadence
- Migrations

## Policy Contract

The planner exposes:

- Total daily policy capacity: `377`
- Hard reserve: `57`
- Normal planned maximum: `320`
- WebSocket hot-set slots: `8`
- Provenance: `product_policy_pending_provider_usage_semantics_verification`

The planner keeps reserve visible and enforces:

- no normal executable plan above `320`
- no negative allocation
- provider-blocked plans allocate zero executable work
- unknown capacity metadata is not treated optimistically
- WebSocket hot set never exceeds `8` assigned symbols

## Sessions

The deterministic session targets are:

- `regular`: `260-300`
- `premarket`: `220-280`
- `after_hours`: `140-220`
- `overnight`: `250-320`
- `weekend_or_holiday`: `0-160`
- `unknown`: `0-0`

Unknown sessions are explicitly non-optimistic.

## Priority Model

Priorities:

- `critical`
- `high`
- `normal`
- `background`

Critical and protected high-priority outcome work is allocated before normal and background work. Broad universe refresh and background work degrade first when capacity is constrained.

Protected live-market workloads include:

- open position monitoring
- stop and exit monitoring
- execution-ready opportunity monitoring
- recommendation outcome evaluation

Execution-ready opportunity monitoring is represented as a missing-metadata workload until a real versioned execution-ready intelligence field exists. Visible or published recommendation cards are not promoted into execution-ready demand. Their symbols can still feed hot-candidate monitoring, recommendation validation, and continuous shadow sampling.

The execution-ready fallback is:

- `requested_symbols: []`
- `websocket_symbols: []`
- `requested_credits: 0`
- `demand_metadata_available: false`
- `demand_source: missing_runtime_metadata`
- defer reason: `missing_execution_ready_metadata`

Background policy default requests are marked with:

- `demand_source: product_policy_default`

## REST Layers

The planner emits four REST layers:

- `hot`
- `warm`
- `broad`
- `background`

Each layer includes:

- requested symbols
- allocated symbols
- refresh objective
- estimated credits
- allocated credits
- shard count
- shard size
- deferred count
- defer or pause reason

## WebSocket Hot Set

The WebSocket plan is not executable. It is a ranked hot-set recommendation only.

Priority order:

1. open positions and exits
2. execution-ready opportunities
3. near-entry or hot candidates
4. rapidly changing validation candidates
5. discovery

The planner dedupes symbols and preserves the higher-priority assignment. Lower-priority duplicates and symbols beyond the 8-slot limit are deferred with explicit reasons.

## Degradation

Supported degradation levels:

- `normal`
- `constrained`
- `critical_only`
- `provider_blocked`
- `unknown`

Deterministic defer reasons include:

- `hard_reserve_protected`
- `higher_priority_work_preempted`
- `session_policy_limit`
- `no_eligible_capacity`
- `live_market_priority`
- `provider_unavailable`
- `legacy_runtime_boundary`
- `missing_demand_metadata`

Additional internal planner reasons:

- `websocket_slot_limit_reached`
- `duplicate_lower_priority_symbol`
- `unknown_capacity_metadata`

## Horizon Views

The planner exposes deterministic views for:

- next minute
- next 5 minutes
- next 15 minutes

These are projections over the same static allocation. No timers, intervals, schedules, or background jobs are created.

## Legacy Constraint Audit

The plan surfaces current constraints that must remain visible until future actions replace them:

- Grow plan scan cap: `25`
- Grow plan background scan cadence: `10 minutes`
- Scanner default/max scan budgets: `50/100`
- Three official scan windows
- Current scheduled scan gate
- Outcome evaluation limits: `max_batches=5`, `max_snapshots=10`
- Direct `cache:no-store` market-data fetches
- Incomplete shared-cache gap
- Dynamic movers availability when supplied

## Diagnostics Integration

Market Diagnostics now includes `Continuous Intelligence Budget Plan` in addition to the existing Provider Budget Guard.

The app integration builds the planner input through `lib/continuous-intelligence-budget-plan-input.ts`, a pure adapter over already-loaded runtime arrays and summaries. The adapter performs no provider calls, environment reads, WebSocket connections, Supabase access, timers, writes, or schedule changes.

The diagnostics JSON includes the complete versioned plan under:

- `continuous_intelligence_budget_plan`

The UI also exposes the same plan as hidden JSON:

- `trade-continuous-intelligence-budget-plan-json`

## Safety

Action 565 is planning-only.

Confirmed no-effect boundaries:

- no provider calls
- no WebSocket connections
- no schedule changes
- no ranking changes
- no recommendation publication changes
- no execution changes
- no database writes
- no migrations

## Next Action

Action 566 should implement the Shared Candle Cache and Rolling REST Collector in shadow mode, using this planner as a contract and keeping runtime behavior guarded until the cache and provider-usage semantics are verified.
