# Action 631 - Complete Local Database Verification for Historical Usage Reconciliation

## Status

`historical_usage_reconciliation_database_acceptance_completed`

## Local runtime and provisioning

Action 631 used a disposable local PostgreSQL 16 container (`postgres:16-alpine`) through Docker. It contained a fresh `action631` database, local roles `anon`, `authenticated`, and `service_role`, no production URL, and no production credentials. The relevant local migration chain was applied in order: Action 572 audit schema, Action 573 ledger schema, Action 574 claim schema, Action 606 audit linkage, then Action 630.

The attempted full Supabase bootstrap was stopped during first-run image download; it was not used for acceptance. Direct PostgreSQL is the authoritative runtime for the Action 630 SQL functions, constraints, locks, RLS, grants, and transaction behavior. The TypeScript adapter was separately checked with its strict injected-RPC contract tests; no production-like PostgREST process was required to prove the database transaction boundary.

## Migration findings and corrections

The first local apply succeeded but exposed PostgreSQL identifier truncation for the three Action 630 table names. Because the migration is unapplied anywhere outside the disposable local database, it was corrected to explicit catalog-safe names: `ci_hur_authorizations`, `ci_hur_reconciliations`, and `ci_hur_audits`.

The first real `ci_hur_issue` invocation then exposed unqualified PL/pgSQL output-column ambiguity. All affected table references are now aliased and qualified. The same acceptance also established that `SECURITY INVOKER` cannot satisfy the intended service-role-only table boundary in a normal PostgreSQL role setup. Both RPCs now use locked-search-path `SECURITY DEFINER`; direct table access is revoked from `service_role`, while RPC execute remains granted only to that role.

Finally, an idempotent reconciliation retry emitted both `reconciliation_already_applied` and a conflict row because the nested success branch did not return. The branch now exits immediately, and the TypeScript result parser rejects multi-row RPC results rather than silently accepting the first.

A final local authorization check found that an eligible-looking request could otherwise reach a foreign-key failure before returning a typed issue result. `ci_hur_issue` now verifies the target claim, matching terminal manual audit, verified provider result, legacy collision evidence, and exact `2 / 1 / 0` pre-state before inserting an authorization. Invalid state produces a bounded typed outcome and no new authorization row.

## Verified locally

- clean disposable migration application after the short-name correction, followed by a second full fixture reset and deterministic reuse;
- actual catalog contains the three explicit `ci_hur_*` tables;
- actual catalog metadata confirms RLS on all three tables, direct service-role table access revoked, `SECURITY DEFINER` RPCs, locked `search_path=public`, exact signatures, service-role execute granted, and anon/authenticated execute denied;
- production-shaped local Action 609/617 fixture was seeded without credentials or provider activity;
- `ci_hur_issue` returned `issued` for the eligible target;
- `ci_hur_reconcile` returned `reconciliation_applied` with ordinary `1`, reconciliation `1`, total `2`;
- a same-request retry returned exactly one `reconciliation_already_applied` row;
- authorization consumed once; exactly one reconciliation and one audit record persisted; claims remained `2` and ordinary ledger units remained `1`;
- expired authorization returned `authorization_expired`, persisted no record or audit, and transitioned locally to `expired`;
- missing source audit returned `source_audit_missing` and did not create an additional authorization;
- injected audit-insert failure returned `historical_state_unavailable`; PostgreSQL exception-block semantics rolled back authorization consumption, reconciliation insert, and audit insert together;
- two concurrent reconciliation calls for the same authorization returned one `reconciliation_applied` and one `reconciliation_already_applied`, with exactly one record and one audit;
- `anon` could not execute the issue RPC; `authenticated` could not insert; `service_role` could not directly update; owner-level update/delete attempts on reconciliation/audit were blocked by the append-only trigger;
- no local provider call, additional claim, scheduled entry, or ordinary-ledger mutation occurred during reconciliation.

## Acceptance limits

The direct PostgreSQL matrix exercised clean apply, reset, actual function execution, transaction rollback, contention, grants, RLS, and append-only enforcement. The server-only TypeScript adapter is validated by its strict contract tests rather than a separate local PostgREST service. Its boundary is deliberately only the two service-role RPC names; unknown, malformed, and multi-row responses fail closed. No public route, generic repair endpoint, or provider capability was added.

The broader negative eligibility taxonomy is enforced both by `ci_hur_issue` and `ci_hur_reconcile`; the local runtime directly exercised expired authorization and missing-audit paths. Remaining variants share the same typed pre-insert/pre-consumption branches and are covered structurally in the focused tests.

## Usage aggregation and readiness

Before local reconciliation, the fixture held two completed manual claims, one ordinary manual ledger unit, zero reconciliation units, and one missing accounted unit. After reconciliation it held two claim-capacity units, one ordinary unit, one reconciliation unit, and exactly two accounted units. The compensating record has `provider_request_count_for_reconciliation = 0`; scheduled usage remains separate and unchanged. The original provider event timestamp is retained separately from reconciliation persistence time.

## Production boundary

No production request, migration, authorization, reconciliation, provider call, claim/audit/ledger write, flag change, schedule activation, deployment, commit, or push occurred. The local reconciliation was disposable fixture data only. Action 609 remains unreconciled in production.

## Recommended Action 632

**Action 632 - Prepare Historical Usage Reconciliation Production Migration and Repair Readiness.** Create the release, production migration-order, rollback, observation, one-time authorization, and pre-repair checklist. It must not perform the production reconciliation without a separate explicit authorization.

## Validation record

- Docker `29.6.1`; PostgreSQL image `postgres:16-alpine`; disposable database `action631`.
- Supabase CLI `2.107.0` was available. A full local stack download was intentionally stopped and not used.
- Clean dependency-chain migration apply completed twice after local reset.
- Local SQL acceptance covered schema metadata, service-role RPC execution, role denials, happy path, TTL, idempotency, audit-insert rollback, concurrency, append-only behavior, and before/after aggregates.
- Focused Playwright tests and the Actions 618-631/continuous-intelligence/type/lint/build suite are recorded with the command results in the work log for this action.

## Final decision

`historical_usage_reconciliation_database_acceptance_completed`

## Git, release, and deployment

`COMMIT REKOMMENDERAS NU`

`PRODUCTION DEPLOY SKA VÄNTA`
