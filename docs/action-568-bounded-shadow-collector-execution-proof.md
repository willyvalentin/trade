# Action 568: Bounded Shadow Collector Execution Proof

## Purpose

Action 568 adds one authenticated, server-only proof path for a single Twelve Data intraday request. It is not a collector rollout, scheduler, cache writer, scanner input, recommendation feature, or execution feature.

## Route And Authentication

- Route: `POST /api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof`
- Authentication: existing `AUTOMATION_SECRET` matched against `x-automation-secret`
- Route contract: `bounded_shadow_collector_execution_proof_v1`
- Route marker: `action_568_bounded_shadow_collector_execution_proof_v1`
- Rendering: dynamic, `Cache-Control: no-store`, `maxDuration = 10`
- There is no `GET` handler.

## Explicit Enablement

Execution is disabled unless `TURE_CONTINUOUS_INTELLIGENCE_BOUNDED_SHADOW_EXECUTION_ENABLED` is explicitly `true`, `1`, or `enabled`.

The Action 567 planning flag cannot enable this route. The route also requires explicit server-side provider budget metadata through `TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS`, accepted only as `within_budget` or `approaching_limit`; missing or unrecognized metadata fails closed.

## Request Bounds

The route accepts only `tickers`, `interval`, `start`, and `end`:

- exactly one valid ticker
- one supported interval: `5min` or `15min`
- an explicit, non-future time range no longer than 30 minutes
- one Twelve Data request maximum
- estimated provider credit ceiling: 1
- provider, endpoint, API key, database target, workload, session, and policy overrides are rejected

The provider call uses the existing Twelve Data intraday adapter with an `AbortSignal`; the proof timeout is 5 seconds and there are no retries.

## Planner And Reserve Boundary

Action 565 remains the sole policy authority. The route supplies the validated proof ticker only as server-side `scanner_context_symbols`, then reconstructs its existing `continuous_intelligence_budget_plan_v1` and verifies the current policy totals:

- total credits: 377
- hard reserve: 57
- normal planned maximum: 320

The request cannot override those totals, cannot use execution-ready demand, and cannot promote unresolved Action 565 jobs into executable jobs. The provider call needs a matching allocated, non-protected normal workload containing the same ticker. The sanitized response identifies that workload, its REST layer, demand source, allocated credits, and a single proof credit sourced from normal planned capacity. The 57-credit hard reserve is never consumed.

The route rejects unavailable planner output, unresolved provider metadata, unavailable budget, an absent ticker allocation, a protected or execution-ready allocation, or a reserve-boundary violation before calling the provider.

## Response And Idempotency

Successful responses contain sanitized aggregate data only: request fingerprint, ticker, interval, range, request count, bounded credits, candle count, first/last timestamps, freshness, and provider status category. Full upstream payloads, candles, stack traces, keys, and credentials are never returned.

Duplicate protection permits exactly one in-flight proof operation per process. An identical concurrent request returns a duplicate conflict and a different request returns a runtime-capacity conflict. Completed, failed, and timed-out entries are removed; this is not durable or cross-instance locking.

The Twelve Data adapter reports explicit structural-validity, fallback, rate-limit, and retry metadata. Action 568 accepts only a successful, structurally valid, no-fallback, zero-retry response. A valid empty response is reported as empty only after the adapter confirms successful upstream completion.

## No-Effect Boundary

The proof does not mutate shared cache, Supabase, recommendations, ranking, confidence, AI projection, scanner state, positions, execution, brokers, schedules, queues, retries, or browser storage. The Trade App only renders passive hidden diagnostics with `not_observed`; it does not invoke the route or infer provider activity.

## Rollout And Rollback

Status is disabled by default. Roll back by leaving or setting `TURE_CONTINUOUS_INTELLIGENCE_BOUNDED_SHADOW_EXECUTION_ENABLED` to a non-accepted value. No data cleanup is necessary because the route performs no persistence.

## Next Action

Observe one explicitly authorized bounded proof response, then decide separately whether the evidence supports any broader shadow collection work.
