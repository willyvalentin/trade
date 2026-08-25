# Action 666EY — Repeated V2 Writer Production-Apply Decision and Preflight

## Decision

Action 666EY closes only the bounded
`position_version_lineage_v2_writer_storage_and_routine_production_apply_decision_and_preflight_repeat_after_marker_proof`
objective. It repeats Action 666EV's aggregate-only production dependency
preflight after Action 666EX independently applied and proved the
projection-contract markers.

The protected-main predecessor is
`5a102323c519f5ac086725acd3a26e7d8cea0bf8`; its exact-main CI run
`32812334646` completed successfully before this preflight began. The two
reviewed writer source migrations were re-read from protected `main` and their
SHA-256 values remain pinned in the evidence.

## Aggregate-only preflight

The read-only transaction in
`docs/sql/action-666ey-position-version-lineage-v2-writer-production-apply-decision-preflight.sql`
returned only aggregate booleans. It confirms the base lineage and history
prerequisites, exact nullable marker shapes without defaults, the digest
dependency, intact RLS/client-select denial and the continuing absence of the
private receipt relation, writer routine and both remedial indexes. The
production migration registry contains the marker migration but not either
writer-package source migration.

All required conditions are now true. This is an eligibility decision only:
it does not apply either writer-package migration, invoke a writer, access any
application row, backfill data, validate constraints, refresh types, wire
runtime code or publish a deployment.

## Next bounded objective

`position_version_lineage_v2_writer_storage_and_foreign_key_index_authorized_production_apply_and_catalog_proof`:
apply the two pinned writer-package migrations in their reviewed order to
production, then prove only their catalog, RLS/grant and routine shape. It
must not invoke the writer, backfill data, bind runtime code or refresh types.
