# Action 666EG — Position-version lineage production-apply decision and preflight

## Decision

Action 666EG closes only the bounded
`position_version_lineage_production_apply_decision_and_preflight` objective.
It binds a fresh, aggregate-only production readback to the already-reviewed,
staging-proven Action 666EE additive migration and decides that the exact
schema-only operation is eligible for its own later execution gate.

The protected-main predecessor is `dfd377f63b0b47a0ff4e80de0c02ccb4929f1380`
from PR #157. Its exact push CI run `32682369515` completed successfully before
this preflight began.

## Aggregate-only production preflight

The read-only transaction in
`docs/sql/action-666eg-position-version-lineage-production-preflight.sql` was
run once against the designated production project through the project-scoped
Supabase boundary. It returned one aggregate object: both target relations and
the existing empty history relation are present; all seven target lineage
columns and all nine target constraints remain absent; and the only exposed
counts were 1,068 recommendations, 8 positions, 0 positions without a
recommendation and 0 history rows.

The preflight also confirms that the legacy v1 function is still
`SECURITY DEFINER`, fixes its `pg_catalog, public` search path, denies
`anon`/`authenticated` execution, and grants execution to `service_role`.
Both target relations retain RLS and client `SELECT` denial. No application-row
contents, row identifiers, owner identifiers, connection identifiers or
credentials were returned or recorded.

The production migration ledger has no entry for the Action 666EE source
migration. Combined with the zero existing target columns and constraints,
this rules out a previously applied or partially applied copy of the reviewed
package at this decision point.

## Exact permitted scope for the next gate

The later execution gate may apply only
`supabase/migrations/20260824000000_add_position_version_lineage_columns.sql`
with its pinned SHA-256. Those bytes add seven nullable columns and nine named
`NOT VALID` checks. They contain no DML, default, index, function, policy,
grant, generated-type refresh, runtime wiring or deployment action. The
preflight does not itself apply the migration or change production.

Backfill, validation, physical `NOT NULL`, generated-types refresh and a v2
writer remain independent follow-on gates. The v1 command remains non-admissible
as a durable v2 command port, even though its existing server-only boundary is
preserved.

## Next bounded objective

`position_version_lineage_authorized_production_apply_and_catalog_proof`:
apply the pinned additive migration once to production, then perform only
aggregate catalog, RLS/grant and legacy-v1 all-null compatibility proof. It
must not backfill data, validate the checks, activate `NOT NULL`, refresh types
or wire runtime code.
