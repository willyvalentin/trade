# Action 569: Production Bounded Execution Preflight

## Purpose

Action 569 adds an authenticated, non-executing readiness check for one bounded
Action 568 shadow-collector proof request. The route is POST-only:

`/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/preflight`

It requires `AUTOMATION_SECRET` through `x-automation-secret`, is dynamic, and
returns `Cache-Control: no-store`.

## Contract

The preflight reuses the Action 568 request parser and canonical gate evaluator.
It accepts one normalized ticker, a `5min` or `15min` interval, and a nonfuture
explicit range no longer than 30 minutes. It rejects provider, endpoint, URL,
credential, database, workload, session, total-credit, and reserve overrides.

The validated ticker enters Action 565 planning only as `scanner_context_symbols`.
The preflight requires an allocated, non-protected normal-capacity workload with
the ticker in its allocated symbols and at least one normal credit. Execution-ready
monitoring and the 57-credit reserve cannot authorize the proof.

## Checks and Response

The sanitized response reports independent feature-flag, provider configuration,
provider-budget metadata, Action 565 plan, `377 / 57 / 320` policy, reserve,
planner authorization, one-request/one-credit/five-second limits, and runtime
capacity checks. It reports only the sanitized planner authorization, not raw
planner data, environment values, secrets, URLs, provider payloads, or candles.

The Action 567 planning flag is never execution authorization. A successful
preflight is not durable authorization: the Action 568 execution runtime reruns
all gates immediately before any provider operation.

## Process-Local Capacity

The preflight only observes the one-in-flight Action 568 runtime. It does not add
an in-flight entry, reserve a slot, create a promise, or guarantee capacity across
processes or serverless instances. The response explicitly states that execution
must recheck every gate.

## No-Effect Boundary

Preflight executes zero provider calls, consumes zero provider credits, does not
mutate shared cache state, write Supabase, change recommendations/ranking/
confidence/scanner behavior, take execution or broker actions, or create schedules.

Market Diagnostics exposes passive Action 569 JSON only. `TradeApp` never invokes
the route.

## Rollout and Rollback

The route is implemented but uncommitted and undeployed. Keep the separate Action
568 execution flag disabled unless a later operator-approved proof is required.
Rollback is removal of this route and its passive diagnostics; no persisted state
or migration is involved.

## Recommended Action 570

Use an authenticated preflight observation in a separately authorized production
operation before considering any single bounded provider execution proof.
