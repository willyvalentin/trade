# Action 624 - Scheduled Shadow Pre-Deployment Acceptance

## Decision

`scheduled_shadow_pre_deployment_acceptance_ready`

Actions 618 through 623 form one locally validated, default-disabled scheduled-shadow package. This action adds the acceptance gate only. It does not deploy code, add a schedule, enable a feature, or reach a provider or durable production writer.

## Batch Scope

| Classification | Files |
| --- | --- |
| Runtime routes | `app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-admission/route.ts`; `app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-dry-run/route.ts`; `app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-execution/route.ts` |
| Server-only policy and read-only context | `lib/server/continuous-intelligence-shadow-canary-scheduled-admission-context.ts`; `lib/server/continuous-intelligence-shadow-canary-scheduled-admission-persistence.ts`; `lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-context.ts`; `lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler.ts`; `lib/server/continuous-intelligence-shadow-canary-scheduled-execution-safety-context.ts` |
| Identity and contract | `lib/continuous-intelligence-shadow-canary-scheduled-admission.ts`; `lib/continuous-intelligence-shadow-canary-scheduled-execution-safety.ts`; `lib/continuous-intelligence-shadow-canary-scheduled-dry-run.ts`; `lib/continuous-intelligence-shadow-canary-scheduled-live-shadow.ts` |
| Deployment configuration | `lib/server/continuous-intelligence-deployment-manifest.ts`; `netlify/functions/scheduled-shadow-collector-canary.ts` |
| Tests | `tests/e2e/action-618-controlled-scheduled-shadow-rollout-plan.spec.ts`; `tests/e2e/action-619-scheduled-admission-foundation.spec.ts`; `tests/e2e/action-620-scheduled-admission-persistence-and-shared-core-integration.spec.ts`; `tests/e2e/action-621-scheduled-execution-safety-envelope.spec.ts`; `tests/e2e/action-622-scheduled-dry-run-reachability-integration.spec.ts`; `tests/e2e/action-623-scheduled-atomic-admission-shared-core-handoff.spec.ts`; `tests/e2e/action-624-scheduled-shadow-pre-deployment-acceptance.spec.ts` |
| Documentation | `docs/action-618-controlled-scheduled-shadow-rollout-plan.md`; `docs/action-619-scheduled-admission-foundation.md`; `docs/action-620-scheduled-admission-persistence-and-shared-core-integration.md`; `docs/action-621-scheduled-execution-safety-envelope.md`; `docs/action-622-scheduled-dry-run-reachability-integration.md`; `docs/action-623-scheduled-atomic-admission-and-shared-core-handoff.md`; this document |
| Migration | None |

No product/UI file, manual execution route, broker integration, provider adapter, ranking/scanner behavior, or existing migration is part of this batch. `deno.lock` is explicitly excluded.

## Architecture And Safety Proof

The Netlify function is an intentionally unscheduled admission foundation. It has no `schedule` or `cron` declaration. The admission and dry-run routes read safety evidence only. The dry-run handler has a structural `dry_run_only` barrier and returns zero provider calls, claims, audit writes, ledger writes, and usage mutations.

The live-shadow route is intentionally permanent-default disabled: it resolves its gate from `undefined`, returns HTTP 403 with `scheduled_execution_disabled`, and imports no admission, provider, finalization, audit, ledger, or shared-core writer. Missing, empty, false, and unknown gate values fail closed. No production path can inject the test-only shared-core harness.

Global defaults remain unchanged: `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED` stays disabled and `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH` stays active. No schedule is declared or activated.

## Acceptance Matrix

| Area | Acceptance evidence |
| --- | --- |
| Route authentication | Missing and invalid scheduler authentication stop before dry-run dependency reads. |
| Disabled baseline | Disabled scheduled execution, canary, kill switch, and schedule produce deterministic read-only blockers. |
| Fully ready dry run | Synthetic read-only dependencies return `scheduled_dry_run_ready_before_execution` with zero mutation counters. |
| Live-shadow boundary | The actual route returns `scheduled_execution_disabled`; invalid request, invalid auth, safety failure, and disabled gate do not invoke admission. |
| Synthetic handoff | Only explicit test wiring with authenticated, canonical, enabled, safe, admitted input reaches exactly one shared-core call. |
| Identity and overlap | Same occurrence is deterministic; different slots, deployments, and windows are distinct; active/conflicting/unreadable state blocks. Scheduled IDs use a separate namespace from manual IDs. |
| Budget | Scheduled and bounded-manual usage remain separate; a scheduled run is one provider call and one credit; reserve use is false; disagreement, window, concurrency, and unavailable usage fail closed. |
| Persistence containment | Audit, ledger, usage, finalization, and unknown persistence stop states block subsequent handoff and expose typed stop state. No retry policy is enabled. |
| Typed results | Known scheduler auth, deployment, default-gate, readiness, budget, conflict, persistence, admission, dry-run, and terminal handoff states remain explicit. Unknown states map to unavailable/blocked. |
| Secret handling | Route evidence contains only canonical market and deployment identifiers plus approved hashes. Tests use a sentinel scheduler secret and assert it never appears in response evidence. |

## Typed Result Matrix

| Layer | Preserved categories |
| --- | --- |
| Scheduler authentication | `scheduler_auth_missing`, `scheduler_auth_invalid`, `scheduler_auth_configuration_unavailable` |
| Admission | `deployment_identity_mismatch`, `canary_disabled`, `kill_switch_active`, `schedule_inactive`, `outside_market_window`, `calendar_unavailable`, `provider_unavailable`, `planner_unavailable`, `audit_contract_unavailable`, `ledger_unavailable`, `historical_usage_unavailable`, `scheduled_budget_exhausted`, `active_claim_conflict`, `unresolved_persistence_failure` |
| Dry run | `scheduled_dry_run_ready_before_execution`, deterministic blocker evidence, and unavailable fallback |
| Live shadow | `scheduled_execution_disabled`, explicit auth/safety/admission blockers, `scheduled_execution_completed`, `scheduled_execution_terminal_provider_failure`, `scheduled_execution_terminal_internal_failure`, `scheduled_execution_already_completed`, and unavailable fallback |
| Unknown state | `unavailable` or an execution-unavailable result, never an enabled or admitted state |

`daily_usage_unavailable` remains an explicit pre-provider admission/persistence category in the durable claim adapter and synthetic live handoff. The acceptance gate retains that distinction from generic unavailable at every modeled layer.

## Migration And Configuration Assessment

No migration is required. The first combined deployment can ship with every execution gate disabled and with no Netlify schedule declaration.

Required existing runtime configuration for authenticated read-only verification is `AUTOMATION_SECRET`; absence makes the wrapper/route fail closed. `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` must be a canonical deployed revision for an exact scheduled occurrence. `URL` or `DEPLOY_PRIME_URL` are only wrapper transport inputs and have a non-secret production fallback.

The existing global canary variables remain intentionally safe by default:

- `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED`: disabled or absent blocks.
- `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH`: active or absent blocks.

There is no environment variable that turns the Action 623 production live-shadow route on. It remains disabled until a separately reviewed future action. A production dry-run reachability request can therefore be made after deployment without activating recurrence or live shadow.

## Exact Commit Scope

Commit every file listed in **Batch Scope** except `deno.lock`. Do not include unrelated worktree changes, product/UI files, migrations, or deployment configuration outside the listed manifest and intentionally unscheduled function source.

## One-Deploy Rollout Checklist

1. Verify the combined reviewed commit is on `main`.
2. Verify Netlify production deploy identity and route bundle include the three scheduled route paths.
3. Read route/source diagnostics only; confirm the live-shadow route remains disabled.
4. Confirm canary is disabled, kill switch remains active, and repository/platform schedule state is inactive.
5. Make exactly one authenticated request to the scheduled dry-run route.
6. Confirm read-only evidence: zero provider calls, claims, audit writes, ledger writes, and usage mutations.
7. Stop for review. Do not authorize or invoke live-shadow execution in this rollout.

## Recommended Action 625

Scope-review this complete batch, create one combined commit and PR, make one Netlify production deployment with no schedule activation, then perform read-only production verification plus exactly one authenticated dry-run reachability request. Confirm zero mutation before considering any separately authorized live-shadow work.
