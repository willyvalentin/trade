# Action 622: Scheduled Dry-Run Reachability Integration

## Decision

`scheduled_dry_run_reachability_integration_ready`

Action 622 adds a separate authenticated `scheduled-dry-run` route. It remains
dry-run-only and has no import path to claim admission, provider execution,
finalization, audit persistence, ledger persistence, or usage mutation.

## Route and Authentication

The route accepts only a canonical scheduled request plus `execution_mode:
dry_run` and the scheduled policy version. It authenticates before parsing the
request or loading operational dependencies. Auth categories are missing,
invalid, configuration-unavailable, and ready; evidence never contains a
secret, header, service key, provider payload, or raw database response.

## Safety Order and Evidence

The evaluator applies deterministic precedence: authentication, request,
deployment, execution feature, canary, kill switch, schedule, calendar/window,
provider/planner, audit/ledger, historical usage, budget/reserve, persistence,
active claim, retry, correlation, then the dry-run barrier. The response always
includes a complete sanitized blocker set and the stable first blocker.

When synthetic dependencies are fully ready, the only terminal result is
`scheduled_dry_run_ready_before_execution`, with `execution_barrier:
dry_run_only` and zero provider calls, claims, audit writes, ledger writes, and
usage mutations.

## Batching and Next Step

No deployment occurred. Actions 618–622 remain local for a later batched
production deployment. **Action 623** should add only read-only route-contract
and deployment-manifest readiness review; it must not enable scheduling or add
an execution workflow.
