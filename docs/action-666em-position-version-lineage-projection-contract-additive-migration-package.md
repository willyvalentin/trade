# Action 666EM — Position-version lineage projection-contract additive migration package

## Decision

Action 666EM closes the bounded
`position_version_lineage_projection_contract_additive_migration_package`
objective after Action 666EL. It adds reviewed source bytes for the future
schema phase only. The migration is not applied to a local database, staging
or production; it performs no backfill, constraint validation, generated-type
refresh, runtime wiring, provider/broker call or deployment.

The package contains the one Supabase CLI-created migration
`20260824133138_add_position_version_lineage_projection_contract_marker.sql`.
It adds a nullable `recommendation_projection_contract text` column to both
`public.recommendations` and `public.positions`, and verifies its exact
catalog shape without weakening the existing Action 666EE lineage columns or
checks.

## Reviewed fail-closed schema shape

The source bytes add exactly four named `NOT VALID` checks:

- `recommendations_recommendation_projection_contract_value_check`;
- `recommendations_lineage_projection_contract_complete_check`;
- `positions_recommendation_projection_contract_value_check`; and
- `positions_lineage_projection_contract_complete_check`.

The marker permits only NULL or
`legacy_recommendation_normative_projection_v2`. The widened recommendation
tuple contains version, identity, digest and marker; the widened position tuple
contains position version, durable recommendation version, identity, digest
and marker. Each tuple is either entirely NULL or complete with the v2 marker.
The existing Action 666EE checks remain installed and the new checks are added
alongside them. A missing, mixed or unexpected marker therefore fails closed
for any future durable write.

The marker columns deliberately have no default. NULL is not a v1 alias, and
the migration contains no in-place v1-to-v2 rewrite. A CHECK cannot prove
cross-relation ownership; a later server-side operation must lock an
owner-matching recommendation and derive/copy the same v2 marker, identity,
digest and versions atomically.

## Closed authority and next bounded objective

This package does not apply DDL, change a row, validate a constraint, alter a
grant or RLS policy, expose a Data API surface, build an index, modify a
foreign key or activate a writer. The next bounded objective is
`position_version_lineage_projection_contract_isolated_staging_apply_and_catalog_proof`.
It may apply only these exact migration bytes in isolated staging and prove
their catalog shape; production application, durable backfill and v2 writer
activation remain separate gates.
