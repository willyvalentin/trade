# Action 666EZ — V2 Writer Authorized Production Apply and Catalog Proof

## Decision

Action 666EZ closes only the bounded
`position_version_lineage_v2_writer_storage_and_foreign_key_index_authorized_production_apply_and_catalog_proof`
objective. Following Action 666EY's separately merged and exact-main-verified
preflight, it applied the two pinned Action 666ER/666ET source migrations once
to production in dependency order and recorded only aggregate preflight and
catalog proof.

The storage-and-routine source migration
`supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql`
was pinned at SHA-256
`c9564854dcb81989afd2ff3de2279cc0309a8366592835b56d842fc736ab9196`.
The foreign-key-index source migration
`supabase/migrations/20260824230454_position_version_lineage_v2_writer_receipt_foreign_key_indexes.sql`
was pinned at SHA-256
`715a30b645e92347349125164c28a5c3288a28789b34865067ae778239ee87ad`.
The protected-main predecessor was commit
`bcda2dc10fd16dc75d1a96870213349306da5b83`; its exact-main CI run
`32816847379` completed successfully before this database action.

## Aggregate production proof

The fresh read-only preflight confirmed the public base relations, digest
dependency, marker prerequisite and client-deny/RLS boundaries. It also
confirmed that the private receipt relation, writer routine and both receipt
indexes were absent, and that neither reviewed source migration was registered
in production. The exact schema-only migrations then applied successfully in
the reviewed storage/routine-then-index order.

The post-apply read-only query in
`docs/sql/action-666ez-v2-writer-production-apply-and-catalog-proof.sql`
returns only aggregate booleans. It confirms the private schema boundary,
receipt relation, RLS, denied client access, expected constraint shape,
owner-bound foreign keys, valid receipt indexes and hardened service-role-only
writer routine. Both source migrations are now registered. The writer was not
invoked, and no application row, identifier, owner, connection detail or
credential appears in this evidence.

The required post-DDL advisor review was performed. Its project-wide
observations do not modify the writer scope, grant client access or authorize
additional changes.

## Closed authority

This action consumes authority for these two ordered production DDL
applications only. It does not invoke the writer, backfill legacy data, refresh
generated types, wire runtime code, extend the reviewed private RLS/grant
boundary beyond the exact source migrations, publish a deployment, or contact
a provider or broker.

## Next bounded objective

`position_version_lineage_v2_writer_generated_types_provenance_refresh_and_runtime_binding_decision`:
independently decide whether a safe generated-type provenance refresh is
required for the production-visible surface before any runtime binding. It
must not invoke the writer, expose the private receipt relation, backfill data,
bind a route or deploy.
