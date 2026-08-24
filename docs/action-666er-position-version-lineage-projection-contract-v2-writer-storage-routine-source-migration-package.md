# Action 666ER — Position-version lineage projection-contract v2 writer storage and routine source-migration package

## Decision

Action 666ER closes the source-only
`position_version_lineage_projection_contract_v2_writer_command_port_storage_and_routine_source_migration_package`
objective after Action 666EQ's green protected-main delivery. It introduces the
reviewed Supabase migration source file
`supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql`.
The file was created with `supabase migration new`; it has not been applied to
staging or production, and no database connection was opened by this action.

The package creates a non-Data-API `private` schema, the exact reserved receipt
relation `owner_bound_position_command_idempotency_v2`, and the exact reserved
routine `write_owner_bound_recommendation_position_v2`. The active generated
type boundary remains the existing public-schema boundary; this action neither
refreshes it nor binds a runtime client to the private routine.

## Package invariants

The private routine accepts exactly three inputs: authenticated server owner,
opaque recommendation reference and canonical command digest. It has
`SECURITY DEFINER`, an empty fixed search path, and fully qualified relation
references. Public, anonymous and authenticated execution is revoked; only the
service-role boundary is granted execution. The private receipt table has RLS
enabled and no direct table privilege for public, anonymous, authenticated or
service-role callers.

The receipt key is exactly `(authenticated_server_owner,
canonical_command_digest)`. It holds the complete owner, recommendation,
version, identity, normative digest, projection marker, generated position,
initial version, outcome and history-identity binding. Its additional unique
owner-and-recommendation key prevents a different digest from creating a
second effect for the same owned recommendation. A deferred owner-bound
position foreign key permits in-transaction reservation before the position is
inserted while requiring the paired position by commit.

The routine first locks the owner-scoped recommendation, refuses a missing,
partial or non-v2 lineage tuple, then reserves or reads the receipt. An exact
committed binding can only replay after the matching position and version-one
history row are present. A new receipt derives every lineage member from the
lock, creates the server-generated version-one position, transitions the same
recommendation to `taken`, and appends the initial owner-scoped history row
with a SHA-256 state-frame digest. Any exception rolls back the reservation,
position, recommendation state and history together; a failed collision cannot
create a second position.

## Authority boundary

These SQL bytes are not an activation. This action performs no migration
application, DDL or DML against any database, generated-type refresh, route or
adapter binding, runtime call, backfill, provider or broker call, deployment or
production targeting. The existing v1 adapter remains non-v2 and cannot reach
the new routine.

## Next bounded objective

The next gate, outside this completed 15-step sequence, is
`position_version_lineage_projection_contract_v2_writer_command_port_source_migration_isolated_staging_apply_and_catalog_proof`.
It requires a separately reviewed isolated-staging-only apply and catalog
proof before any runtime binding, backfill or production action can be
considered.
