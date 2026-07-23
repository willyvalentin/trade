# Action 630 - Add Atomic Historical Usage Reconciliation Persistence Schema

## Status

`historical_usage_reconciliation_persistence_schema_added_database_verification_required`

## Background

Action 628 established a real historical accounting disagreement: Action 609 reached a completed manual claim, completed provider work, and persisted its original audit, but its ordinary ledger write collided with Action 604's old market-contract receipt identity. Action 617 is a separate, fully represented usage-bearing claim. The proven historical state is therefore claim capacity `2`, ordinary execution ledger units `1`, and missing accounted usage `1`.

Action 629 defined the only eligible repair: a claim-scoped, append-only historical accounting reconciliation for the completed Action 609-shaped claim. This action implements only the local schema, RPC, and adapter foundation. It does not repair production data.

## Scope and non-goals

The implementation adds a dedicated historical reconciliation authorization table, reconciliation record table, reconciliation audit table, and two service-role RPCs. The record is an accounting reconciliation only. It is not provider execution, claim execution, normal receipt persistence, an ordinary ledger insert, a readiness override, or a generic backfill mechanism.

There is no public route, scheduler, provider client, claim mutation, original-audit mutation, ordinary-ledger update, or production integration in this action. The original Action 604 ledger and Action 609 state remain immutable.

## Action 629 contract

The contract version is `continuous_intelligence_shadow_canary_historical_usage_reconciliation_v1`. It accepts only a canonical manual Action 609-shaped claim with all of the following proven again inside the transaction:

- terminal `completed` claim with one attempted provider request and a source receipt;
- a matching `bounded_manual_proof` audit linked to the same claim and execution identity;
- accepted provider-result category and exact source-audit linkage;
- absence of a normal claim-scoped ledger for the target;
- the verified old receipt-identity collision evidence;
- exact before-state: claim capacity `2`, ordinary manual ledger units `1`, reconciliation units `0`, missing usage unit `1`.

Unknown, malformed, scheduled, non-terminal, duplicate, non-canonical, or mismatched evidence fails closed.

## Schema design

Migration `20260723002000_create_historical_usage_reconciliation_persistence.sql` creates:

- `ci_hur_authorizations` for one claim-specific, operation-specific authorization;
- `ci_hur_reconciliations` for one compensating accounting unit;
- `ci_hur_audits` for the matching durable reconciliation audit.

The reconciliation record is distinct from `continuous_intelligence_credit_ledger`. It records provider `twelve_data`, exactly one usage unit, and exactly zero reconciliation provider requests. It contains the target claim, source execution/audit, authorization, evidence digest, historical event timestamp, reconciliation timestamp, and deployment binding, but no raw credential.

The audit records the before-state `2 / 1 / 0 / 1`, the resulting total `2`, exact eligibility and collision classifications, sanitized operator/reason data, and deployment binding. A deferred foreign key from the record to the audit, plus the audit's foreign key back to the record, requires both records to exist at transaction commit.

## Authorization persistence

`ci_hur_issue` creates a bounded authorization only when the target, source audit, reconciliation identity, deployment binding, SHA-256-shaped evidence digest, and exact `2 / 1 / 0 / 1` expected state are valid. The schema enforces a maximum 300-second TTL, exact contract/operation/reason values, and a single consumed reconciliation identity. It stores no raw token or external credential.

## Atomic RPC

`ci_hur_reconcile` is the local future service-role reconciliation operation. It takes only the authorization ID, canonical reconciliation and claim identities, expected source audit, exact counts, deployment binding, contract version, and evidence digest.

Within one database transaction it locks the target reconciliation namespace and authorization; revalidates the authorization, expiry, deployment, claim, source audit, old collision evidence, and exact aggregate state; consumes the authorization; inserts one reconciliation record and its audit; then verifies the `2 / 1 / 1 -> 2` post-state. Exceptions occur inside the PL/pgSQL block, so a failed insert or postcondition rolls back the authorization consumption and both inserts together.

The RPC returns only typed outcomes, including `reconciliation_applied`, `reconciliation_already_applied`, authorization/target/audit/ledger precondition failures, and fail-closed malformed or unavailable states. The adapter rejects unknown response shapes and maps database failures to `historical_state_unavailable` without exposing database error text.

## Idempotency and concurrency

The reconciliation identity is deterministic for a claim and contract version. The target claim, reconciliation identity, and authorization are each unique in the durable schema. An advisory transaction lock serializes the target claim path. A repeat of the same completed reconciliation returns `reconciliation_already_applied`; a different identity for the same claim returns a typed conflict. No second usage unit can be inserted.

## Append-only permissions

RLS is enabled on all three new tables. `public`, `anon`, `authenticated`, and `service_role` are revoked from direct table mutation; execute is granted only to `service_role` for the two `SECURITY DEFINER` RPCs, each with `search_path = public` explicitly set. The reconciliation and reconciliation-audit tables have update/delete rejection triggers, preserving append-only state.

This does not make the historical reconciliation callable by a browser: Action 630 adds no route and no client import path. The local TypeScript service contract calls only the future named reconciliation RPC and has no fetch, provider execution, claim, audit, or ordinary-ledger writer capability.

## Usage aggregation

Ordinary manual execution ledger usage remains separate from reconciliation usage. Before a repair, the verified aggregate is ordinary `1`, reconciliation `0`, total `1`, claim capacity `2`. One successful reconciliation adds exactly one accounting unit with zero provider calls, yielding ordinary `1`, reconciliation `1`, total `2`, and no discrepancy. Scheduled usage, current-day provider budget, historical event time, claim admission, and execution attempt counts remain unchanged.

The Action 629 verifier remains the local aggregation contract. Runtime readiness is intentionally not changed in this action.

## TypeScript adapter

`lib/continuous-intelligence-historical-usage-reconciliation-store.ts` builds only Action 629-eligible RPC input and strictly parses typed RPC results. `lib/server/continuous-intelligence-historical-usage-reconciliation-persistence.ts` is the server-only wrapper: it obtains the repository service-role Supabase client and calls only `ci_hur_reconcile`. Both reject malformed input/results, require a SHA-256-shaped evidence digest, and cannot call a provider or a public route.

## Tests and validation

Created focused coverage in `tests/e2e/action-630-atomic-historical-usage-reconciliation-persistence.spec.ts` for:

- isolated append-only schema and linkage constraints;
- service-role RPC grants/revokes and locked search paths;
- Action 609-shaped exact input and eligibility failures;
- strict typed RPC result parsing and unknown-result rejection;
- RPC-only adapter behavior, unavailable fail-closed behavior, and no execution route/provider path;
- exact post-state accounting semantics.

Completed locally:

- `npx next typegen`
- `npx tsc --noEmit`
- scoped ESLint for the new adapter and Action 630 test
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/action-630-atomic-historical-usage-reconciliation-persistence.spec.ts` (`6 passed`)

The local Supabase database acceptance environment is not available in this workspace: the CLI cannot create its external telemetry file under the sandbox, no local PostgreSQL client is installed, and no running local database container is available. Consequently this action has static migration/contract validation only; it has not run a local reset, actual RPC permission check, concurrent transaction test, or injected SQL rollback test. No production access was attempted.

## Migration and production requirements

The migration is local and unapplied. Production migration, production authorization issuance, any reconciliation execution, and production readback all require later explicit authorization. Before any production consideration, Action 631 must start an isolated local Supabase/PostgreSQL environment, apply the migration in order, run `ci_hur_issue` and `ci_hur_reconcile` against a sanitized Action 609-shaped fixture, verify service-role-only permissions, and inject ledger/audit/authorization/postcondition failures to prove rollback.

## Failure handling and rollback

Precondition failures return typed results with no reconciliation write. A failed insert, audit-link constraint, or postcondition exception rolls back the entire RPC block, including authorization consumption. No delete/update rollback procedure exists for a successful reconciliation: any future correction must be another explicitly authorized append-only operation. The migration itself remains unapplied, so there is no deployed database state to roll back.

## Local-only status

Action 609 is not reconciled in production. Production claim capacity remains `2`, ordinary ledger usage remains `1`, and the disagreement remains blocking. No production request, migration, authorization, reconciliation, provider call, claim mutation, audit write, ledger write, usage delta, flag change, schedule activation, deployment, commit, or push occurred in Action 630. Canary and scheduled live-shadow safety defaults remain outside this local-only implementation.

## Recommended Action 631

**Action 631 - Complete Local Database Verification for Historical Usage Reconciliation.** It should provision or start the isolated local database, apply this migration only locally, verify permissions and migration ordering, exercise typed results and concurrent idempotency, and inject every atomic rollback failure. It must still not apply a production migration or reconcile historical production data.

## Git/release/deploy assessment

The schema and RPC implementation form a coherent local checkpoint, but production deployment must wait for database-backed acceptance. No migration is ready to apply to production from this action alone.

## Final decision

`historical_usage_reconciliation_persistence_schema_added_database_verification_required`
