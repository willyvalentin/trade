# Action 666DI — Position-Version History Source-Migration Bytes

## Decision

Action 666DI closes only the bounded
`position_version_history_source_migration_bytes` objective. It adds one
reviewed, source-controlled SQL migration:
`supabase/migrations/20260821194333_create_position_version_history.sql`.
The migration creates the empty `public.position_version_history` relation and
its schema boundary only. This Action does not execute that SQL, contact
Supabase, refresh generated types, backfill a row, add a server writer, wire a
runtime caller, publish a deployment or change a provider configuration.

The exact predecessor is protected `main` merge
`b80584dca0c2b2f1c7f2dd8793d59ac63dbafe6b`, tree
`f108d74ea13206ab7e37dbab14f48ad8bbd18211`, with parents
`adff18009490e8ac3d079a8ef0fd47209fef0424` and
`5572286f2545c7cc81e83534f4060a5a2ae280ac`. Its push-triggered exact-main CI
run `32515918303` completed successfully. Action 666DH remains the immutable
source-migration design predecessor.

The historical Action 666DG oracle continues to prove that no
`position_version_history` source existed at Action 666DG's delivered revision.
It evaluates that closed historical claim against that revision rather than
against later, explicitly reviewed source-migration additions.

## Frozen SQL boundary

The migration has no explicit `BEGIN`/`COMMIT`, no `CREATE INDEX
CONCURRENTLY`, and no DML. It first proves or creates the exact valid unique
parent target `public.positions(id, owner_user_id)`, then proves the matching
owner-bound recommendation target. It creates the history table with:

- composite primary key `(position_id, owner_user_id, position_version)`;
- restrictive, owner-bound foreign keys to both `positions(id, owner_user_id)`
  and `recommendations(id, owner_user_id)`;
- copied locked recommendation fields, a JSON object state frame, two
  lowercase-hex SHA-256 digests and server-set `recorded_at` metadata;
- named safe-integer, identity-presence, digest-format and state-frame checks;
- one non-concurrent recommendation-owner lookup index, whose catalog query
  binds `pg_index.indrelid` and ordered columns to the history relation;
- enabled RLS, revoked `PUBLIC`/`anon`/`authenticated` table privileges and no
  client policy; and
- one `SECURITY INVOKER` append-only trigger function that rejects every
  `UPDATE` and `DELETE`.

The migration deliberately creates no owner-only lookup index because no
owner-scoped history reader is introduced. The primary key already supports
the history identity and the new recommendation-owner index supports the
restrictive recommendation foreign key. A future reader, writer, data
backfill, constraint-validation rollout or concurrent index is a separately
reviewed deploy unit.

## Closed authority

The SQL bytes are reviewable, but their application remains closed. No
database query, DDL, DML, migration application, staging deployment,
production deployment, generated-types refresh, runtime wiring, client grant
or server-owned writer is authorized by this Action. In particular, the
current mutable `positions.position_version` is never a foreign-key target.

## Remaining gates

The next bounded objective is
`position_version_history_isolated_staging_apply_and_catalog_proof`: apply
these exact bytes only in an explicitly authorized isolated staging project,
then prove duplicate/cross-owner/stale/max/rollback/retry, update/delete and
cascade refusal, RLS/grant denial, and catalog validity. A production apply,
backfill, writer, generated-types refresh, runtime wiring and production
publication remain separately unauthorized.
