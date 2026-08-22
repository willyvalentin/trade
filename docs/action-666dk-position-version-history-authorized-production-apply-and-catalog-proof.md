# Action 666DK — Position-Version History Authorized Production Apply and Catalog Proof

## Decision

Action 666DK closes only the bounded
`position_version_history_authorized_production_apply_and_catalog_proof`
objective. Under the operator's explicit production-step authorization, it
applied the exact reviewed Action 666DI migration bytes once to the production
database and recorded aggregate-only preflight and post-apply catalog proof.

The source migration
`supabase/migrations/20260821194333_create_position_version_history.sql` was
re-read from protected `main` before application and pinned at SHA-256
`aaf0d677da73316355e30bb3d613d0274244ed896fb4c3bf266bb8b045fd177f`.
The production migration ledger records the provider-assigned application
version `20260822123246` under the approved source-migration name. This is a
receipt for those exact SQL bytes, not a claim that the repository filename is
the provider's migration-ledger version.

The exact source predecessor is protected `main` merge
`1b1d903142be6413049d12b8078a110fc29dbd12`, tree
`634a75e7446192af6978fe472d1a76c141068010`, with parents
`16bf7504a7651bcbd0e1991e46580298cc6f03d0` and
`2500d35ee29a3892e4bd83fb088c1f0c3bd6067c`. Its push-triggered exact-main CI
run `32571560062` completed successfully before this database action.

## Aggregate production proof

Before application, aggregate catalog guards proved that the history relation,
append-only trigger and trigger function were absent, while both owner-bound
parent targets were immediate, valid and eligible foreign-key targets. The
migration then applied successfully.

Post-apply catalog proof confirms that `public.position_version_history` exists
and is empty; RLS is enabled; no client policy exists; `anon` and
`authenticated` have neither read nor write privilege; the composite primary
key, both restrictive owner-bound foreign keys, all six safety checks and the
recommendation-owner index are valid; and the `SECURITY INVOKER` append-only
trigger function has its fixed `pg_catalog` search path. No row, owner,
connection or credential identifier is recorded in the evidence.

Supabase's post-apply advisors report only the expected informational results
for the new empty, intentionally client-inaccessible relation: RLS enabled
without a policy and an unused recommendation-owner index. They do not grant
or imply any client access.

## Closed authority

This action authorizes and records one production schema application only. It
does not backfill legacy data, refresh generated types, alter a reader or
writer, wire runtime code, change provider configuration, publish a deployment,
or authorize broker, training, promotion or execution activity. Any generated
types/MA-09 provenance refresh remains a separate source-only objective.
