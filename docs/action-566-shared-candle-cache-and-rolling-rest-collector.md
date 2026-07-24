# Action 566: Shared Candle Cache and Rolling REST Collector

## Objective

Action 566 adds the first continuous-intelligence data collection foundation in strict shadow mode. It introduces a reusable intraday candle cache, request coalescing, and a rolling REST collector planner without changing recommendation generation, ranking, scanner behavior, execution, scheduling, persistence, or provider usage by default.

## Architecture

- `shared_candle_cache_v1` defines normalized candle records and process-local cache behavior.
- `continuous_intelligence_budget_plan_v1` is the Action 565 source of truth for all capacity and workload allocation.
- `rolling_rest_collector_v1` adapts the Action 565 budget plan directly and does not recalculate hard reserve, normal capacity, degradation, workload allocation, shard metadata, defer reasons, or demand provenance.
- Market Diagnostics exposes a read-only section named `Shared Candle Cache and Rolling REST Collector`.
- Hidden diagnostics JSON is available at `trade-shared-candle-cache-rolling-rest-collector-json`.

## Cache Contract

Normalized candles include provider, ticker, interval, timestamp, OHLC, volume, timezone, adjusted flag, market session, fetched timestamp, source request id, and validation status.

The stable cache key is:

`provider + ticker + interval + timestamp + timezone + adjusted`

The cache supports exact lookup, bounded range lookup, freshness classification, hit/miss/partial detection, invalid candle rejection, lookahead rejection, chronological merge, duplicate timestamp replacement, stale reporting, source provenance, TTL cleanup, and deterministic max-entry eviction.

## Request Coalescing

Equivalent in-flight provider requests share one operation. The coordinator tracks request key, first requester, joined count, start and completion timestamps, provider execution, cache satisfaction, timeout state, and failed request cleanup.

Completed and failed request diagnostics are bounded. No secrets, API keys, authorization headers, environment values, or raw secret hashes are exposed.

## Freshness Policy

Freshness distinguishes:

- `fresh`
- `slightly_stale_reusable`
- `stale_refreshable`
- `expired_or_invalid`

Outcome and replay-style consumers must supply an analysis cutoff. Candles newer than that cutoff are rejected as lookahead.

## Budget Integration

The rolling collector consumes the Action 565 budget plan and does not invent capacity. The plan preserves the current policy values:

- total provider credits: `377`
- hard reserve credits: `57`
- normal planned maximum credits: `320`

Workloads are adapted as:

- outcome evaluation
- execution-ready opportunity monitoring
- hot candidate monitoring
- recommendation validation
- broad universe refresh
- background learning or historical sampling

Visible recommendation symbols may feed recommendation validation when Action 565 has already represented that demand. They are never promoted into execution-ready opportunity monitoring. Execution-ready monitoring remains empty with `missing_execution_ready_metadata` until a real versioned execution-ready metadata contract exists.

Policy/default demand is marked with `product_policy_default` provenance.

## Shadow Boundary

The feature flag boundary is:

`TURE_CONTINUOUS_INTELLIGENCE_SHADOW_COLLECTOR_ENABLED`

Default behavior is disabled. In this action the production UI only renders planning diagnostics. No route, cron, WebSocket, provider call, database write, or live consumer is added.

Even when future code enables shadow execution, it may only perform cache lookup, bounded provider candle requests through an injected provider boundary, normalization, validation, shadow-cache population, and diagnostics.

The reusable execution boundary is an explicit runtime instance created with `createRollingRestCollectorShadowRuntime({ cache, coalescer })`. The runtime owns a bounded shared candle cache, a bounded in-flight coalescer, and bounded audit counters. Equivalent concurrent requests through one runtime share a single injected provider operation. There is no unbounded module-global singleton.

## Failure Behavior

- Provider unavailable: cache-only/deferred.
- Unknown provider state: conservative cache-only/deferred.
- Approaching or constrained budget: protects critical/high work.
- Critical-only budget: normal/background work deferred.
- Partial cache coverage: only missing bounded ranges are request candidates.
- Invalid provider candles: rejected without poisoning valid cache entries.
- Timeout or failure: existing cache remains usable and in-flight entries are cleaned up.

## Serverless Memory Limitations

The shadow cache is process-local memory. It is not durable, not globally shared, and not guaranteed to survive Netlify instance rotation. It is intentionally a foundation for safe behavior and diagnostics, not a persistence contract.

## Diagnostics

Market Diagnostics reports status, shadow enabled state, collector/cache versions, Action 565 plan version, session, degradation, job counts, cache-checked jobs, provider-executed jobs, cache-satisfied jobs, partially satisfied jobs, deferred jobs, cache counts, in-flight joins, provider call counts, candle counts, planner requested/allocated/deferred credits, executable credits, actual credits, defer reasons, cache size, stale entries, timeout count, and next action.

The no-effect line states that Action 566 does not affect recommendations, ranking, confidence, AI Projection, execution, scanner universe, official schedules, or database writes.

## Tests

Focused tests cover cache hits, partial ranges, stale refresh, in-flight coalescing, failed cleanup, invalid rejection, dedupe/sorting, provider unavailability, unknown provider state, hard reserve protection, constrained degradation, execution-ready empty behavior, visible recommendation boundaries, disabled shadow behavior, enabled shadow cache population, no-effect boundaries, lookahead rejection, memory/TTL eviction, diagnostics, and hidden JSON marker.

## Next Recommended Action

Observe diagnostics in production with the collector disabled. The next implementation should add an authenticated, dry-run-only server orchestration boundary if and only if an operator approves bounded shadow provider execution.
