# Action 666EW — Projection-contract marker production-apply decision and preflight

## Decision

Action 666EW closes only the bounded
`position_version_lineage_projection_contract_marker_production_apply_decision_and_preflight`
objective. It binds a fresh aggregate-only production readback to the reviewed
Action 666EM nullable marker source migration and decides that those exact
schema-only bytes are eligible for one separate later production-apply gate.

The protected-main predecessor is `727be4e2ca7ff7d570363aa1033bddd9e53fe92e`.
Its exact push CI run `32800439603` completed successfully before the preflight
began.

## Aggregate-only production preflight

The read-only transaction in
`docs/sql/action-666ew-projection-marker-production-apply-decision-and-preflight.sql`
was run once against the designated production target through the
project-scoped boundary. It confirms both target relations, the exact nullable
base-lineage field shapes without defaults, and all existing base checks in
their intended `NOT VALID` state. Both required projection-contract markers
remain absent, and the production migration ledger has no Action 666EM entry.

Existing RLS and client `SELECT` denial remain intact. The query returned only
aggregate booleans: it returned no application-row contents, identifiers,
owners, counts, connection detail or secret.

## Exact permitted scope for the next gate

The later execution gate may apply only
`supabase/migrations/20260824133138_add_position_version_lineage_projection_contract_marker.sql`
with its pinned SHA-256. Those bytes add two nullable text markers and four
named `NOT VALID` checks. They contain no DML, default, index, function,
policy, grant, generated-type refresh, runtime wiring or deployment action.
This preflight does not itself apply the migration or change production.

Backfill, constraint validation, physical `NOT NULL`, generated-types refresh,
runtime binding and the v2 writer storage/routine package remain independent
gates. In particular, Action 666EV's writer-package preflight must be repeated
after a separately proven marker application.

## Next bounded objective

`position_version_lineage_projection_contract_marker_authorized_production_apply_and_catalog_proof`:
apply the pinned nullable marker migration once to production, then perform
only catalog, RLS/grant and legacy all-null compatibility proof. It must not
backfill data, validate checks, activate `NOT NULL`, refresh types, invoke a
writer or wire runtime code.
