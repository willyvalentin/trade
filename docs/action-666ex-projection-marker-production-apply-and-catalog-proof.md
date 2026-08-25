# Action 666EX — Projection-Contract Marker Authorized Production Apply and Catalog Proof

## Decision

Action 666EX closes only the bounded
`position_version_lineage_projection_contract_marker_authorized_production_apply_and_catalog_proof`
objective. Following Action 666EW's separately merged and exact-main-verified
decision, it applied the pinned Action 666EM marker migration once to the
production database and recorded only aggregate preflight and catalog proof.

The source migration
`supabase/migrations/20260824133138_add_position_version_lineage_projection_contract_marker.sql`
was re-read from protected `main` immediately before application and pinned at
SHA-256 `f35a0a367354103fda9e3f68c6f085f998c4520f0eacde4e0d8c7bcbc18a2d13`.
The source predecessor was protected-main commit
`cee2889c4d3a3e0576d79f13b2d0fcc0a37f2cb6`; its exact-main CI run
`32807378805` completed successfully before this database action.

## Aggregate production proof

The fresh read-only preflight confirmed the target relations, exact nullable
base-lineage shapes without defaults, retained transitional base checks, intact
RLS and client-select denial, and absence of both marker columns. The
production migration registry had no matching source application record. The
exact schema-only migration then applied successfully.

The post-apply read-only query in
`docs/sql/action-666ex-projection-marker-production-apply-and-catalog-proof.sql`
returned only aggregate booleans. It confirms the exact nullable text marker
shapes without defaults, the new marker checks in their intentionally `NOT
VALID` state, unchanged base checks, catalog admissibility of the legacy
all-null tuple, and retained RLS/client-select denial. The migration registry
now records the approved source-migration name. No application row, identifier,
owner, connection detail or credential appears in this evidence.

The required post-DDL advisor review was performed. Its project-wide
informational and existing security observations do not modify the marker
scope, grant client access or authorize further changes.

## Closed authority

This action consumes authority for this one production DDL application only.
It does not backfill legacy data, validate constraints, make a column `NOT
NULL`, refresh generated types, invoke the v2 writer, wire runtime code, alter
RLS/grants, publish a deployment, or contact a provider or broker.

## Next bounded objective

`position_version_lineage_v2_writer_storage_and_routine_production_apply_decision_and_preflight_repeat_after_marker_proof`:
repeat the Action 666EV aggregate-only writer-package production preflight now
that the independent marker dependency is proven. It must still not apply the
writer package, invoke a writer, backfill data, validate constraints, refresh
types or bind runtime code.
