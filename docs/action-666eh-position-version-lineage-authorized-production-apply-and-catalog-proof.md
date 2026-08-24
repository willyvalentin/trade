# Action 666EH — Position-version lineage authorized production apply and catalog proof

## Decision

Action 666EH closes only the bounded
`position_version_lineage_authorized_production_apply_and_catalog_proof`
objective. Under the operator's explicit production-step authorization, it
applied the exact reviewed Action 666EE additive migration once to production,
then recorded aggregate-only preflight and post-apply proof plus a
rollback-only legacy-v1 compatibility fixture.

The protected-main predecessor is
`cfc8ba6d1ad859005774ac46ddf2eb1ce6d99a56` from PR #158. Its exact
post-merge `main` run `32686495539` completed successfully before the
production operation began.

## Production result

The migration source
`supabase/migrations/20260824000000_add_position_version_lineage_columns.sql`
was reread from protected `main` and pinned at SHA-256
`66fa75933f341fb672b223e2699e558c33e8b9c934e9765ba1ef70e15fbc77a0`.
Fresh aggregate-only preflight confirmed the target ledger entry, all seven
lineage columns and all nine named checks were absent; the two target
relations, the server-only v1 command and their RLS/client-deny boundaries
were present. It returned only aggregate relation counts.

The provider accepted those exact migration bytes once and assigned migration
ledger version `20260824040107`. Post-apply catalog proof confirms all seven
new columns have the exact nullable physical types, all nine checks exist and
remain `NOT VALID`, and no existing recommendation or position row acquired a
lineage value. Existing RLS, client `SELECT` denial and the v1 fixed
`SECURITY DEFINER` server-only boundary remain intact.

A disposable owner and recommendation were created only inside a caught
PL/pgSQL subtransaction, passed through the v1 command, and verified to create
an all-null position-lineage tuple. The subtransaction was deliberately rolled
back, and aggregate checks confirmed neither fixture row persisted. No row,
owner, connection or credential identifier was returned or recorded.

The post-apply Supabase security advisor has no target finding. Its two
performance observations concern pre-existing, unused `positions` indexes
from the owner-foundation migration; the Action 666EE package neither added
nor altered indexes, so they are outside this production-apply scope.

## Closed authority

This action applies exactly one additive production schema package. It does
not backfill data, validate the checks, activate physical `NOT NULL`, refresh
generated types, add a v2 writer, change grants or policies, publish a
deployment, or contact a market-data provider or broker.

The next bounded objective is
`position_version_lineage_owner_bound_backfill_admission_preflight`: reconcile
the now-null production lineage population against the already frozen
owner-bound contract before any backfill is considered. Backfill execution,
constraint validation and v2 writer activation remain separate gates.
