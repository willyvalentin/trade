# Action 567: Authenticated Shadow Collector Dry-Run Boundary

## Objective

Action 567 adds an authenticated, server-side planning boundary for the continuous intelligence shadow collector. It builds the current Action 565 `continuous_intelligence_budget_plan_v1`, adapts it with Action 566 `rolling_rest_collector_v1`, and returns a bounded dry-run response. It never executes a collector job.

## Route and authentication

`POST /api/automation/continuous-intelligence/shadow-collector/dry-run`

The route marker is `action_567_authenticated_shadow_collector_dry_run_v1`. It uses the existing `x-automation-secret` / `AUTOMATION_SECRET` automation boundary. Failed authentication returns `401` with only a safe failure category. Responses never include credentials, credential hashes, authorization headers, or raw environment values.

The route is explicitly request-time (`dynamic = "force-dynamic"`), has `maxDuration = 10`, and returns `Cache-Control: no-store` JSON.

## Feature and dry-run invariants

`TURE_CONTINUOUS_INTELLIGENCE_SHADOW_COLLECTOR_ENABLED` is server-only. Missing or invalid values are disabled. An enabled value is reported, but it cannot enable execution: the response always reports `dry_run_only: true` and `provider_execution_allowed: false`.

The route does not instantiate `createRollingRestCollectorShadowRuntime`, execute a collector job, populate the shared cache, call a provider, open WebSockets, write to Supabase, or change application state.

## Input limits

Optional authenticated request input is bounded and validated:

- Up to 20 ticker symbols matching the route ticker format.
- Intervals limited to `1min`, `5min`, or `15min`.
- A time range no longer than six hours.
- Up to 20 returned jobs and 320 estimated credits.
- Only known collector workload classes.
- Session override only in development or test.

Endpoints, provider targets, API keys, authorization fields, and database target fields are rejected. Request input cannot override Action 565 policy totals, reserve, degradation, provider state, or priority ordering. Tickers are bounded scanner-context planning metadata only; they never become execution-ready demand.

## Action 565 and 566 integration

The route uses the Action 565 input adapter and planner, with a local server-time market-session evaluation and conservative unknown provider capacity. It then uses the Action 566 summary/job adapter. It preserves plan contract/version, session, degradation, provider state, policy totals, allocation, workload priority/class, REST layer shards, credits, symbol allocation, defer reasons, demand source, and demand-metadata status.

The response contains `request_application` so validated input cannot be mistaken for applied collector metadata. Tickers are applied only as bounded scanner-context planning metadata. Workload classes and `max_jobs` are recorded under `applied_to_response_job_selection` because they only filter the returned dry-run job view; session override is development/test-only. Request interval, time range, and estimated credits are validated but never applied to Action 565 allocations or Action 566 jobs. Their stable reasons are `action_565_plan_interval_metadata_unresolved`, `action_565_plan_time_range_metadata_unresolved`, and `client_input_cannot_override_action_565_budget_allocation`.

The collector adapter continues to expose unresolved interval/range metadata and therefore returns zero executable credits here. The execution-ready workload remains empty and deferred as `missing_execution_ready_metadata`; visible recommendation symbols are never promoted into it. Job counters distinguish `jobs_available_from_plan`, `jobs_matching_workload_filter`, `jobs_accepted`, `jobs_excluded_by_workload_filter`, `jobs_truncated_by_max_jobs`, `jobs_rejected_by_validation` (always zero on a successful response), and `jobs_deferred`. Filtering or truncation is never reported as rejection.

## Failure behavior and diagnostics

Unauthenticated requests return `401`; invalid bounded input returns `400`; planning failures return a safe `500` category. No failure mutates the cache, UI, scanner, recommendations, or scheduled work.

Market Diagnostics includes an `Authenticated Shadow Collector Dry Run` section plus `trade-authenticated-shadow-collector-dry-run-json`. The browser never calls the route. Until an authenticated server response is externally observed, diagnostics report `not_observed` rather than fabricating a result.

## Tests and no-effect guarantees

The focused Action 567 test covers authentication, secret redaction, feature-flag behavior, dry-run invariants, bounds, Action 565/566 metadata preservation, execution-ready fallback behavior, diagnostics, and source-level non-execution checks. Action 565 and Action 566 focused tests remain required regressions.

Action 567 does not call market-data, OpenAI, or provider adapters; mutate the shared cache; add schedules; publish or rank recommendations; change confidence or AI Projection; alter scanner or official scan gates; write to Supabase; add migrations; persist outcomes; or invoke execution, broker, or trade behavior.

## Next action

Review authenticated dry-run responses in a controlled server environment before considering any separately approved, bounded shadow-runtime execution experiment.
