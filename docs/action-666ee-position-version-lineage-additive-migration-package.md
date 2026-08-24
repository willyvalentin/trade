# Action 666EE — Position-version lineage additive migration package

## Decision

Action 666EE closes the bounded
`position_version_lineage_additive_migration_package` objective after Action
666ED. It introduces reviewed source bytes for the first safe schema phase:
seven nullable, owner-bound lineage columns and their fail-closed new-write
constraints. The package is source-controlled only. It has not been applied
to Supabase, staging or production, and it does not backfill a row, add a
runtime function, change a grant, refresh generated types or publish a
deployment.

The exact predecessor is protected-main commit
`cfb8fd503577cbe9aa5834f75b901a03ba5510e8` from PR #155. Its exact main CI
run `32674389880` completed successfully before this package began.

## Reviewed migration boundary

`supabase/migrations/20260824000000_add_position_version_lineage_columns.sql`
adds only these nullable columns:

- `recommendations.recommendation_version`, `recommendation_identity` and
  `recommendation_normative_digest`;
- `positions.position_version`, `durable_recommendation_version`,
  `recommendation_identity` and `recommendation_normative_digest`.

It checks each existing/new column's exact catalog type and nullable shape. It
then adds nine named `NOT VALID` checks. A complete new tuple must have both
safe-range versions, a nonblank identity and lowercase-hex SHA-256 digest;
the all-null tuple is deliberately still valid while v1 remains the live
server-only routine. Partial tuples and malformed non-null values are rejected
for new writes. There is no default, foreign-key replacement, index,
transaction-control statement, function, privilege change or DML.

This preserves the already-proven v1 security boundary without pretending it
is now an admissible v2 command port. The migration also neither changes
`positions.recommendation_id` nullability nor inserts initial
`position_version_history` rows.

## Why the backfill is not embedded here

The previous aggregate-only inventory and deterministic mapping contract bound
the backfill to exact owner-scoped batches, canonical Action 664A identities
and byte-exact normative digests. Combining that irreversible data operation
with additive DDL would widen locks and obscure reconciliation. This package
therefore creates the minimum schema surface first. A later separately
reviewed bounded executor must re-run the fresh inventory, lock at most one
owner's canonical batch, derive all values from the locked rows, reconcile the
write counts, copy lineage to the matching positions and stop on every
deviation.

No client-visible Data API surface is introduced: both relations already have
RLS and deny client grants, and this migration changes neither policies nor
privileges.

## Next bounded objective

`position_version_lineage_isolated_staging_apply_and_catalog_proof`: apply
these exact additive bytes in an isolated staging project only, prove the
column/catalog/constraint shape and verify that the legacy v1 routine can
continue to write all-null tuples. Production application, deterministic
backfill, validation/physical `NOT NULL`, generated-type refresh and any v2
writer remain separate gates.
