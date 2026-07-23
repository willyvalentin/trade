# Action 627 - Isolate Scheduled Durable State And Correct Deployment Identity Binding

## Decision

`scheduled_durable_state_isolated_deployment_configuration_remediation_required`

## Background And Scope

Action 626 found two independent Action 625 blockers:

- a stale explicit deployment commit was selected ahead of runtime platform
  metadata; and
- historical legacy manual claims entered scheduled persistence health through
  the generic `canary_execution_` namespace.

This action makes the local source corrections only. It does not issue a
production request, modify production configuration, deploy, activate a
schedule, call a provider, or write claims, audit, ledger, or usage data.
Manual authorization, admission, receipt, audit, ledger, and usage semantics
remain unchanged.

## Scheduled Namespace Contract

Scheduled durable state now accepts only the canonical occurrence-backed form:

`scheduled_canary_execution_scheduled_canary_occurrence_<YYYYMMDD>_<HHMM>_<hash>`

The central predicate
`isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity` rejects:

- legacy generic `canary_execution_...` manual identities;
- manual authorization-scoped identities;
- prefix/substring/suffix variants; and
- malformed scheduled-prefix values.

The server reader still fetches the bounded same-day claim set, but passes it
to a pure evaluator. The evaluator selects only canonical scheduled claims,
correlates them only to scheduled-entry-kind audit and ledger records, and
remains fail-closed for malformed scheduled identifiers or unavailable
readback.

### Durable-State Behavior

| Input | Result |
| --- | --- |
| Empty scheduled history | `clear` |
| Legacy/manual-only history | `clear` for scheduled scope |
| Completed scheduled claim with matching audit and ledger | `clear` |
| Completed scheduled claim without audit | `audit_failed` |
| Completed scheduled claim without ledger | `ledger_failed` |
| Malformed scheduled-prefix claim | `unavailable` |

This removes the false-positive scheduled `audit_failed` from historical manual
claims. It does not backfill, delete, clear, or reclassify production records.

## Deployment Identity Source Model

The existing general runtime resolver remains unchanged for the verified manual
path. Scheduled admission now uses a dedicated resolver with these rules:

1. Valid `COMMIT_REF` or `NETLIFY_COMMIT_REF` is canonical platform identity.
2. When both platform variables are valid, they must match.
3. `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` is an assertion when a
   platform identity exists, and only a fallback when no platform identity is
   available.
4. A malformed explicit value, malformed platform value, conflicting platform
   values, or a stale explicit value blocks binding fail-closed.
5. The request must exactly equal the resolved canonical deployment commit.

### Typed Binding Results

- `exact`
- `request_mismatch`
- `explicit_configuration_conflict`
- `explicit_configuration_malformed`
- `platform_identity_conflict`
- `platform_identity_malformed`
- `unavailable`

These propagate through scheduled admission and dry-run evidence. In
particular, an explicit stale setting now reaches the route as
`deployment_configuration_conflict`, rather than being indistinguishable from
a request construction error. The compatibility `mismatch` alias remains for
older synthetic fixtures and maps to `deployment_identity_mismatch`; production
context emits the new precise states.

## Remaining Legitimate Blocker

The historic manual accounting discrepancy is unchanged and fail-closed:

- claim capacity: `2` estimated credits;
- total ledger: `1` estimated credit.

The scheduled budget evaluator continues to return `usage_disagreement`. The
scope fix does not treat it as empty history, approximate it, or reconcile it.
Action 628 must determine the authoritative historical reconciliation policy.

## Safety Invariants

- Scheduled live execution remains disabled.
- Canary remains disabled and the kill switch remains blocking.
- Absent or unknown configuration remains disabled/fail-closed.
- Dry-run remains structurally unable to call a provider or write claims,
  audit, ledger, or usage.
- Provider entry remains after atomic admission only in the separate live
  contract.
- No raw credentials enter durable identifiers or test fixtures.

## Files

Created:

- `lib/continuous-intelligence-shadow-canary-scheduled-durable-state.ts`
- `tests/e2e/action-627-scheduled-durable-state-isolation-and-deployment-binding.spec.ts`
- `docs/action-627-isolate-scheduled-durable-state-and-correct-deployment-identity-binding.md`

Changed:

- `lib/continuous-intelligence-shadow-canary-runtime-deployment-identity.ts`
- `lib/continuous-intelligence-shadow-canary-scheduled-admission.ts`
- `lib/server/continuous-intelligence-shadow-canary-scheduled-admission-context.ts`
- `lib/continuous-intelligence-shadow-canary-scheduled-dry-run.ts`
- `lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-context.ts`
- `lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler.ts`
- `lib/continuous-intelligence-shadow-canary-scheduled-live-shadow.ts`
- `tests/e2e/action-626-scheduled-deployment-identity-and-persistence-stop-diagnosis.spec.ts`

## Validation

Focused Action 626 and 627 coverage verifies canonical scheduled scope,
manual-only isolation, real scheduled audit/ledger failures, malformed
scheduled identity containment, platform-first deployment binding, typed route
failure propagation, and continued `usage_disagreement` blocking.

Validation completed locally:

- `npx next typegen` passed.
- `npx tsc --noEmit` passed.
- Scoped ESLint passed.
- Focused Actions 618 through 627 tests: 43 passed.
- Relevant Continuous Intelligence regression suite (Actions 565 through 627):
  208 passed.
- `npm run build` compiled successfully and completed its TypeScript phase.
- `git diff --check` passed.

## Production Configuration Remediation

No production change is authorized in this action.

Before a future scheduled dry-run verification, set
`TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` to the exact canonical full
SHA for the deployment being released, and ensure it matches the deployed
Netlify `COMMIT_REF`/`NETLIFY_COMMIT_REF` metadata. Do this as part of the
release configuration step, then verify a fresh deployment reports an exact
scheduled binding. If it is stale, the expected typed blocker is
`deployment_configuration_conflict`; do not bypass it by accepting the stale
value or by weakening deployment binding.

Rollback is to restore the prior explicit value only alongside the matching
deployment revision. A rollback to a value that conflicts with platform
metadata must remain blocked.

## Production State

Production has not been contacted or changed. Scheduled execution/live shadow
remain disabled, canary disabled, kill switch active, and no schedule is active.
There is no Action 627 provider, claim, audit, ledger, or usage delta.

## Recommended Action 628

**Action 628 - Define and Validate Historical Manual Usage Reconciliation
Policy** should decide how the one historical ledger credit and two historical
claim-capacity credits are represented without double counting or silently
clearing a durable discrepancy.

## Git And Release Assessment

The source correction is ready for its normal scoped review, but production
verification requires the separate deployment configuration step. Do not infer
scheduled readiness or activate a schedule from this local result.

## Final Decision

`scheduled_durable_state_isolated_deployment_configuration_remediation_required`
