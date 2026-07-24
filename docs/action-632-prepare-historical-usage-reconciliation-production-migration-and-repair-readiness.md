# Action 632 - Prepare Historical Usage Reconciliation Production Migration And Repair Readiness

## Status

`historical_usage_reconciliation_production_readiness_prepared`

## Scope And Non-Goals

This is a local release and operator-readiness artifact. It prepares a future deploy and a separately approved, one-time Action 609 historical usage reconciliation. It does not apply a migration, contact production, issue an authorization, call either RPC, call a provider, change environment configuration, activate any schedule, or modify historical records.

The repair remains claim-scoped, append-only, provider-free, and unavailable to public or scheduler paths.

## Actions 626-631 Summary

- Actions 626-627 isolated scheduled durable state and made platform deployment identity canonical.
- Actions 628-629 defined the Action 609-only historical reconciliation policy and claim-scoped identity.
- Action 630 added the isolated schema, `ci_hur_issue`, `ci_hur_reconcile`, server-only adapter, and strict parser.
- Action 631 completed disposable PostgreSQL 16 acceptance: RLS/grants, TTL, idempotency, rollback, concurrency, append-only behavior, and exact `2 / 1 / 0 / 1` accounting.

## Release Inventory

The future candidate must be reviewed as a single code-and-schema batch. Required runtime files are:

| File | Action | Purpose | Impact |
|---|---:|---|---|
| `lib/continuous-intelligence-shadow-canary-runtime-deployment-identity.ts` | 626-627 | Canonical Netlify deployment binding | Runtime configuration assertion only |
| `lib/continuous-intelligence-shadow-canary-scheduled-durable-state.ts` and scheduled admission/context files | 626-627 | Scheduled/manual durable-state isolation | Scheduled paths remain disabled |
| `lib/continuous-intelligence-shadow-canary-historical-manual-usage-reconciliation.ts` | 628 | Read-only historical policy | No mutation |
| `lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract.ts` | 629 | Exact target and accounting contract | Pure validation |
| `lib/continuous-intelligence-historical-usage-reconciliation-store.ts` | 630-631 | Strict RPC input/result boundary | Server-call contract only |
| `lib/server/continuous-intelligence-historical-usage-reconciliation-persistence.ts` | 630 | Server-only service-role adapter | No public route |
| `supabase/migrations/20260723002000_create_historical_usage_reconciliation_persistence.sql` | 630-631 | Isolated append-only tables and RPCs | One new production migration |
| `tests/e2e/action-626-*.spec.ts` through `action-632-*.spec.ts` | 626-632 | Regression/readiness evidence | Test-only |
| `docs/action-626-*.md` through this document | 626-632 | Operator evidence | Documentation-only |

`deno.lock`, Docker fixtures, credentials, local container files, raw IDs, and production evidence exports are excluded. The migration appears once and follows `20260723001000`; its timestamp is `20260723002000`.

## Dependency Matrix

| Dependency | Expected shape | Local verification source | Pre-repair risk if mismatched |
|---|---|---|---|
| Claims | `continuous_intelligence_shadow_canary_daily_claims`; canonical manual ID, terminal `completed`, provider attempted, receipt | Action 574 migration and Action 631 PostgreSQL fixture | Stop: target cannot be proved |
| Original audit | `bounded_shadow_collector_proof_audits`; manual proof, matching claim/execution, one request, completed status | Actions 572/606 migrations and Action 631 | Stop: provider evidence is invalid |
| Ordinary ledger | `continuous_intelligence_credit_ledger`; legacy collision evidence, one ordinary unit | Action 573 schema and Action 631 fixture | Stop: missing amount is not exact |
| Roles/RPCs | `service_role` executes only `ci_hur_issue` / `ci_hur_reconcile`; direct tables revoked | Action 631 catalog/grant checks | Stop: privilege boundary unknown |
| Deployment binding | canonical full SHA from `COMMIT_REF` or `NETLIFY_COMMIT_REF` | Action 627 runtime resolver | Stop: stale assertion mismatch |
| Migration state | version `20260723002000` and short `ci_hur_*` catalog names | Action 631 clean local apply | Stop: schema/RPC unavailable |

Production must verify each row read-only after deployment. An unknown critical dependency is a stop condition.

## Migration And Deployment Ordering

Deploy schema and application adapter as one reviewed release batch. Schema-first creates callable RPCs before the server bundle uses them; application-first risks an unavailable RPC. A partial or failed migration, stale server bundle, or signature mismatch stops the procedure. Do not repair in the deploy workflow.

1. Commit the reviewed release batch and open/review a PR.
2. Set the release-bound deployment assertion described below, then deploy code and migration through the established Supabase/Netlify process.
3. Verify deployed commit, migration version, `ci_hur_*` objects, RPC signatures, grants, and safe scheduled defaults read-only.
4. Confirm the historical `usage_disagreement` remains fail-closed before repair.
5. Obtain separate claim-specific operator approval before issuance.
6. Run at most one authorized reconciliation, then stop for readback.

## Deployment Identity Remediation

Use **Option C**. `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` is an explicit assertion whenever platform metadata exists; it must equal the canonical lowercase 40-character SHA provided by `COMMIT_REF` or `NETLIFY_COMMIT_REF`.

For a future release, set the variable to the exact final release commit before the rebuild/deploy that carries that commit. After deploy, read the sanitized runtime binding: platform source and explicit assertion must agree. Never use a short SHA, branch name, prior commit, or guessed value. On mismatch, restore the prior safe configuration or set the assertion to the deployed full SHA and redeploy; do not bypass `deployment_configuration_conflict`.

## Read-Only Preflight

Every critical item below must be `pass`; `unknown` blocks the next step.

| Check | Required value |
|---|---|
| Release scope, local acceptance, generated types | Final reviewed commit; Action 631 accepted |
| Migration | Hash recorded, order `20260723002000`, PostgreSQL 16 acceptance recorded |
| Schema/RPCs | All dependency-matrix objects and exact signatures exist; service-role only |
| Deployment identity | Canonical platform SHA equals explicit assertion |
| Safe state | Canary disabled, kill switch active, no active schedule or scheduled live-shadow |
| Target | Action 609 only; terminal manual claim and linked audit prove provider usage |
| Accounting before-state | claim capacity `2`, ordinary `1`, reconciliation `0`, total `1`, missing `1` |
| Isolation | no target authorization/reconciliation/audit exists; scheduled usage unchanged |
| Recovery | Supabase backup/recovery procedure identified before deploy |

## Target Binding And Before Snapshot

The only eligible target is the canonical Action 609 manual claim, with its matching original manual-proof audit and claim-scoped reconciliation identity. Operators should obtain exact identifiers from the read-only production result set, retain only approved sanitized fingerprints in evidence, and prove that the target is not Action 604, Action 617, a scheduled claim, or any other manual claim.

The before snapshot records: target/audit fingerprints and terminal status, provider-success evidence, deployment SHA/configuration state, authorization/reconciliation counts, `2 / 1 / 0 / 1`, scheduled usage, and canary/kill-switch/schedule state. It contains no raw credentials.

## One-Time Authorization Runbook

This is a future service-role control-plane operation, never a scheduler or public route.

1. Capture the before snapshot and verify every preflight item.
2. Obtain written approval naming the Action 609 target and one reconciliation only.
3. Call `ci_hur_issue` once with the exact target claim, source audit, claim-scoped identity, `2 / 1 / 0 / 1`, evidence digest, deployed SHA, and `issued_at`/`expires_at` no more than 300 seconds apart.
4. Require exactly one typed `issued` row and read back `status=issued`; otherwise stop.
5. Do not perform unrelated work between issuance and reconciliation.

The authorization cannot move to another claim, audit, identity, deployment commit, or accounting state. Expiry requires a new full preflight and new approval.

## One-Time Reconciliation Runbook

Call `ci_hur_reconcile` once with the freshly issued authorization and the exact same identity, target, audit, preconditions, deployed commit, contract version, and evidence digest. Require exactly one response row.

- `reconciliation_applied`: stop and perform durable after-state verification.
- `reconciliation_already_applied`: only acceptable after a transport-unknown result and durable readback proving the same target/authorization identity already completed.
- Any other typed result: stop. No automatic retry exists.

One manual retry is possible only after transport uncertainty, exact readback, a still-valid same authorization or proved completed state, and fresh explicit approval.

## After-State Contract

Success requires an unchanged target claim and original audit; ordinary ledger `1`; reconciliation `1`; total accounted usage `2`; missing units `0`; one reconciliation record and one reconciliation audit; consumed authorization exactly once; zero provider calls by reconciliation; and unchanged scheduled usage. Historical reconciliation is separately visible from ordinary provider usage and does not charge current runtime provider capacity.

## Abort And Incident Matrix

| Stage | Failure | Mutation expectation | Required action |
|---|---|---:|---|
| Preflight | Unknown dependency/configuration | 0 | Stop |
| Deploy | Failed/partial migration | Platform-dependent rollback | Stop; inspect objects, no repair |
| Issue | Typed rejection | 0 | Stop |
| Issue | Transport unknown | Authorization may exist | Read back before any decision |
| Reconcile | Precondition/identity mismatch | 0 | Stop; new full preflight |
| Reconcile | Expired authorization | 0 | Stop; new approval required |
| Reconcile | Audit/postcondition failure | 0 by atomic rollback | Stop; incident review |
| After-state | Overcount or record without audit | Critical | Keep safe defaults; no more writes |
| After-state | Usage remains unbalanced | 0 further writes | Stop; separate corrective action |

## Rollback And Evidence

Application rollback may restore the bundle while leaving append-only schema intact. A failed migration follows the platform transaction/recovery procedure; do not hand-delete objects. A successful reconciliation is never deleted or updated: any future correction requires a separately designed compensating record and explicit incident process.

Evidence for the future action: release SHA, migration status, RPC/grant readback, deployment binding, before snapshot, approval reference, issuance result, reconciliation result, identities as sanitized fingerprints, after snapshot, zero-provider confirmation, and zero scheduled-usage delta.

## Git Checkpoint And Release Decision

Observed local branch: `codex/actions-572-574-durable-audit-credit-ledger-shadow-canary`, ahead of its origin by two commits at review time. `7aa0425` is the Action 630/631 acceptance checkpoint; this Action 632 readiness code remains uncommitted. `deno.lock` is not in the working inventory and must remain untouched.

Recommended next action: **Action 633 - Deploy and Verify Historical Usage Reconciliation Release Batch**. It may commit/push/review/deploy only after explicit approval; it must not reconcile. **Action 634** is the separate one-time repair action.

## Production Boundary

Action 609 remains unreconciled in production. No production request, migration, authorization, reconciliation, provider call, claim/audit/ledger write, environment change, schedule activation, deploy, commit, or push occurred in Action 632.

## Final Decision

`historical_usage_reconciliation_production_readiness_prepared`

**COMMIT OCH PUSH REKOMMENDERAS NU**

**PRODUCTION DEPLOY SKA VÄNTA**
