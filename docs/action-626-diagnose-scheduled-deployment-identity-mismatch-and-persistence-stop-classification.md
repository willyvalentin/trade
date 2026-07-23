# Action 626 - Scheduled Deployment Identity Mismatch And Persistence-Stop Classification

## Decision

`scheduled_deployment_identity_and_persistence_stop_root_causes_diagnosed`

Action 626 is local and read-only. It made no production request and changed no
production configuration, durable state, schedule, provider state, or release.

## Scope And Evidence

Action 625 made the sole authenticated scheduled dry-run request. It returned
HTTP `409`, `scheduled_dry_run_deployment_mismatch`, and the typed first
blocker `deployment_identity_mismatch`. Scheduler authentication succeeded;
the `dry_run_only` barrier reported zero provider calls, claims, audit writes,
ledger writes, and usage mutations.

The Action 625 baseline for UTC 2026-07-23 was:

| Scope | Attempts | Estimated credits |
| --- | ---: | ---: |
| Scheduled ledger | 0 | 0 |
| Bounded manual ledger | 1 | 1 |
| Total ledger | 1 | 1 |
| Claim capacity | 2 | 2 |

Direct scheduled claim, audit, and ledger counts were zero. The scheduled
admission read-model nevertheless returned `persistence_stop: audit_failed`.

The original Action references map to the repository documents as follows:

- Action 624: `action-624-scheduled-shadow-pre-deployment-acceptance.md`.
- Action 622: `action-622-scheduled-dry-run-reachability-integration.md`.
- Action 621: `action-621-scheduled-execution-safety-envelope.md`.

## Deployment Identity Flow

1. The dry-run request carries `deployment_commit` as a canonical lower-case
   40-character Git SHA. Action 625 used deployed commit `1182f172...`.
2. `buildContinuousIntelligenceShadowCanaryScheduledAdmissionContext` resolves
   runtime identity with
   `resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit`.
3. The resolver accepts only a canonical full SHA and applies this precedence:
   `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT`, then `COMMIT_REF`, then
   `NETLIFY_COMMIT_REF`.
4. Scheduled admission classifies the binding as exact only when the resolved
   runtime SHA exactly equals the request's `deployment_commit`.
5. The dry-run safety envelope retains `deployment_identity_mismatch` as the
   first typed blocker and remains structurally `dry_run_only`.

Both observed values were canonical full SHAs. The mismatch was not a short-SHA
or timestamp/normalization defect: the explicit production runtime setting
remained the earlier Action 591 value `7eb1f424...`, while the deployed source
and Action 625 request were `1182f172...`. The explicit setting therefore won
over the newer Netlify runtime commit metadata by design.

### Deployment Root Cause

Classification: **stale production environment/release binding**, not a source
identity parser defect, manifest defect, or request-construction defect.

Local reproduction proves that a valid explicit stale SHA takes precedence over
a valid current `COMMIT_REF`/`NETLIFY_COMMIT_REF`; an invalid explicit value
would safely fall through to the current Netlify value. The deployment manifest
does not independently supply the value used by this runtime resolver.

Minimal remediation is an operator-controlled production configuration update
to bind `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` to the exact commit of
the deployment being verified, followed by a deployment-propagation check. It
must not be made permissive, and it must not be applied in this diagnosis.

## Persistence-State Flow

`readContinuousIntelligenceShadowCanaryScheduledDurableState` reads same-day
claims, scheduled-entry-kind audit rows, and scheduled-entry-kind ledger rows.
It then filters claims by execution identifier before calculating:

`durable readback -> scheduled persistence stop -> safety context -> dry-run dependencies -> typed route evidence`

The scheduled contract defines scheduled claims as
`scheduled_canary_execution_<occurrence_id>`. Current manual admission uses
`manual_canary_execution_<utc-day>_<authorization-id>`.

The read-model filter instead accepts both:

- `scheduled_canary_execution_...`
- legacy generic `canary_execution_...`

The audit mapper independently recognizes that generic form as a legacy
manual-compatible claim identity. A historical manual terminal claim in that
generic namespace is therefore included in the scheduled terminal set. Because
the audit query intentionally contains only
`scheduled_shadow_collector_canary` rows, the historical manual claim cannot
have a matching scheduled audit and produces `audit_failed`.

### Persistence-Stop Root Cause

Classification: **false-positive manual/scheduled scope contamination**.

This is not empty-history mapping: true scheduled history is empty and should
remain `clear` when no scheduled records exist. It is not a legitimate
scheduled audit failure, stale fixture, or operator-clear state. The stop is
sticky on every scheduled read because the broad legacy prefix continues to
select the historical manual claim.

The minimal safe source repair is to make scheduled durable-state classification
select only the explicit scheduled identity namespace, while retaining
fail-closed handling for unavailable or malformed readback. It must not delete,
backfill, clear, or reclassify historical production data.

## Separate Legitimate Budget Blocker

`usage_disagreement` is independent of the false audit stop and remains a
legitimate conservative block. The historical manual state has two claim
capacity credits but only one manual ledger credit: the Action 604 ledger
persisted, whereas Action 609's ledger collision was intentionally preserved as
historical evidence. The scheduled budget evaluator correctly refuses to treat
`total_ledger = 1` and `claim_capacity = 2` as reconciled capacity.

Changing the scheduled-claim classifier will not clear this budget block. It
requires a separate operator-approved reconciliation policy or historical data
repair decision. No such repair is authorized here.

## Typed Propagation And Safety

- Deployment mismatch is preserved as `deployment_identity_mismatch` through
  scheduled admission and dry-run response selection.
- Persistence `audit_failed` maps to the explicit unresolved persistence guard,
  then to `persistence_stop_active`; it is not collapsed to generic
  `unavailable`.
- A genuine unavailable durable read remains fail-closed as unavailable.
- The dry-run route and handler retain no claim, provider, audit, ledger, or
  usage writer import. Its evidence pins all mutation counters to zero.
- Scheduled execution remains default-disabled. Absent/unknown activation stays
  disabled, the canary remains disabled, and the kill switch remains active.

## Files

Created:

- `tests/e2e/action-626-scheduled-deployment-identity-and-persistence-stop-diagnosis.spec.ts`
- `docs/action-626-diagnose-scheduled-deployment-identity-mismatch-and-persistence-stop-classification.md`

No production source behavior, migration, runtime configuration, or durable
record was changed in this action.

## Validation

The focused Action 626 test reproduces:

- explicit runtime deployment-SHA precedence;
- independent typed deployment, budget, and persistence blockers;
- the manual ledger/claim-capacity disagreement;
- the legacy generic identifier overlap; and
- dry-run structural zero-mutation containment.

Validation completed locally:

- `npx next typegen` passed.
- `npx tsc --noEmit` passed.
- Scoped ESLint for the Action 626 test and the inspected identity/durable-state
  modules passed.
- Focused Actions 618 through 626 tests: 37 passed.
- Relevant Continuous Intelligence regression suite (Actions 565 through 626):
  202 passed.
- `npm run build` compiled and completed TypeScript successfully.
- `git diff --check` passed.

No broad historical Actions 516 through 538 suite was run because this action
does not touch that unrelated surface; Action 626 introduced no observed
regression in the relevant Continuous Intelligence suite.

## Production State

Action 626 made no production request. The Action 625 state remains unchanged:
scheduled live shadow disabled, canary disabled, kill switch active, no active
schedule, and zero scheduled provider/claim/audit/ledger/usage delta.

## Recommended Remediation

The blockers should be split rather than batched into a deploy that might imply
scheduled readiness:

1. **Action 627 - Correct Scheduled Deployment Binding and Isolate Legacy
   Manual Durable State.** Make the scheduled durable reader use only the
   explicit scheduled namespace; separately update and verify the production
   deployment-identity setting for the exact deployed revision. Preserve every
   fail-closed state.
2. **Action 628 - Resolve Historical Manual Claim/Ledger Reconciliation
   Policy.** Obtain an explicit operator decision for the Action 604/609
   capacity-versus-ledger discrepancy before scheduled-live readiness can be
   reconsidered. This is not an automatic clear or unreviewed data repair.

Actions 627 and 628 should not be blindly batched: Action 627 is a narrow
source/configuration correction, while Action 628 is a historical accounting
and operator-policy decision.

## Git And Release Assessment

No commit, push, or deploy is appropriate for this diagnosis. Production must
remain blocked for scheduled-live rollout until both the stale identity binding
and the independent usage reconciliation are resolved and verified.

## Final Decision

`scheduled_deployment_identity_and_persistence_stop_root_causes_diagnosed`
