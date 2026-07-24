# Action 575 - Shadow Canary Schedule Activation Readiness

## Purpose

Action 575 adds a read-only readiness layer for the disabled Action 574 shadow
canary. It does not execute the canary, reserve capacity, call Twelve Data,
mutate claims, write audit or ledger rows, alter flags, or activate a schedule.

## Readiness stages

The canonical `continuous_intelligence_shadow_canary_activation_readiness_v1`
contract reports one ordered decision rather than a single optimistic boolean:

1. `not_ready`
2. `ready_for_migration_application`
3. `ready_for_flag_configuration`
4. `ready_for_preflight_observation`
5. `ready_for_one_manual_canary_attempt`
6. `ready_for_schedule_activation_review`

Every result includes sanitized deployment, schema, permission, feature-flag,
provider-budget, market-calendar, audit, ledger, claim-lifecycle, route,
function, schedule, and no-effect facts. The evaluator accepts an injected
clock, deduplicates blockers and warnings, and selects one deterministic next
action.

## Required migrations and schema probe

Actions 572-574 require:

- `bounded_shadow_collector_proof_audits`
- `continuous_intelligence_credit_ledger`
- `continuous_intelligence_shadow_canary_daily_claims`
- `claim_continuous_intelligence_shadow_canary`
- `begin_continuous_intelligence_shadow_canary_attempt`
- `finalize_continuous_intelligence_shadow_canary_attempt`

Action 575 adds the fixed read-only RPC
`read_continuous_intelligence_shadow_canary_readiness`. It returns bounded
booleans only for the exact objects above, selected constraints, and approved
permission categories. It performs no writes and is executable only by
`service_role`. The route suppresses raw database errors and distinguishes a
missing probe/schema from authentication failure and unknown failure. This
migration is created but not applied by Action 575.

## Flags and provider budget

Before a canary execution is separately approved:

- durable audit and credit ledger must be enabled,
- canary execution must remain disabled during readiness review,
- the kill switch must remain active,
- malformed or missing flag states fail closed,
- provider configuration and recognized budget metadata must be available,
- Action 565 policy must remain exactly 377 total, 57 hard reserve, and 320
  normal planned maximum credits,
- one AAPL scanner-context credit must be allocated from normal capacity,
- hard reserve and execution-ready reserve must remain unused.

Readiness planning never calls the provider or reserves a credit.

## Market-calendar blocker

No verified server-side US market calendar is currently connected. The route
therefore reports that calendar source configuration, holiday awareness,
regular-session determination, and completed-range derivation are unavailable.
It cannot approve a manual canary attempt. Weekend-only inference is forbidden.

The recommended Action 576 is **Verified US Market Calendar Integration**.

## Read-only route and passive diagnostics

`GET /api/automation/continuous-intelligence/shadow-collector/canary/activation-readiness`
requires `x-automation-secret`, is dynamic and `no-store`, accepts no body or
query controls, and returns sanitized readiness only. It cannot invoke claim,
begin-attempt, finalization, provider, audit-write, or ledger-write paths.

TradeApp does not call this route. Market Diagnostics exposes only static facts:
route present, status `not_observed`, null latest decision, unknown migration
and calendar readiness, schedule inactive, and no inferred browser invocation,
provider activity, durable write, or claim mutation.

## Deployment manifest and runtime schedule signals

The server-only `continuous_intelligence_deployment_manifest_v1` manifest binds
readiness to exact route paths, expected contract versions, and the canary
function build marker included in this artifact. Its
`repository_schedule_declaration` is a repository fact only. It does not prove
what Netlify deployed or whether a remote platform schedule is currently active.

Runtime schedule state comes only from sanitized tri-state signals:

- `TURE_SHADOW_CANARY_SCHEDULE_DECLARED`
- `TURE_SHADOW_CANARY_REMOTE_SCHEDULE_ACTIVE`
- `TURE_SHADOW_CANARY_DUPLICATE_SCHEDULE_PRESENT`
- `TURE_SHADOW_CANARY_FUTURE_FREQUENCY_SELECTED`

Exact `true`/`1` means present, exact `false`/`0` means absent, and missing or
malformed values mean unknown. Unknown remote or duplicate state cannot be
treated as safe absence and cannot approve a manual canary or schedule review.
Action 575 does not set these signals or query Netlify APIs.

## Why no schedule is added

The repository contains an unscheduled Netlify function foundation and no canary
entry in `netlify.toml`. Deployed configuration absence and remote platform
inactivity are separate runtime facts and remain unknown unless trusted signals
explicitly report them. No cron expression or frequency is selected in Action
575. Scheduling before verified deployment state, a verified calendar, and one
reviewed manual canary receipt would bypass the staged safety model.

## Rollout order

1. Deploy readiness code.
2. Apply approved migrations.
3. Verify schema and lifecycle RPC permissions.
4. Enable durable audit and credit ledger only.
5. Integrate a verified server-side US market calendar.
6. Observe canary preflight.
7. Separately authorize one manual canary invocation.
8. Review its durable audit and credit evidence.
9. Consider schedule activation in a later action.

## Rollback and no-effect guarantees

Rollback removes the readiness route and probe migration before they are used,
or leaves them deployed and uninvoked. The canary stays disabled and the kill
switch stays active. Action 575 changes no recommendations, scanner selection,
ranking, confidence, positions, execution, broker behavior, provider calls,
claims, audit rows, ledger rows, flags, or schedules.
