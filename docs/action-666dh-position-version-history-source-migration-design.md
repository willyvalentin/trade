# Action 666DH — Position-Version History Source-Migration Design

## Decision

Action 666DH closes only the bounded
`position_version_history_source_migration_design` objective from Action
666DG. It freezes the source-migration shape that a later, separately reviewed
SQL migration must implement for `public.position_version_history`. It does
not add a migration file, execute SQL, contact Supabase, modify a database,
refresh generated types, wire a runtime writer or publish a deployment.

The exact predecessor is protected `main` merge
`adff18009490e8ac3d079a8ef0fd47209fef0424`, tree
`cb2b72b098db6d3cfac6c7116cc5a3343324fcfe`, with parents
`a8b94861e53d2aff6fb7ceb5afa3f415a6363b7b` and
`8d43939285d9ab7a3f6b629db97bf439e197d0db`. Its push-triggered exact-main
CI run `32504982516` completed successfully.

## Frozen migration shape

The later migration has one new relation, `public.position_version_history`.
It must contain, at minimum, `position_id uuid`, `owner_user_id uuid`,
`position_version bigint`, the locked recommendation tuple from Action 666DG,
`position_state_frame jsonb`, `position_state_digest text` and a server-set
`recorded_at timestamptz`. It must reject null identity fields, `position_version`
outside `1..9007199254740991`, a non-lowercase-hex 64-byte SHA-256 digest and
an absent state frame. `recorded_at` is audit metadata only; it is never part
of the durable history key.

The migration must create all of the following in this order:

1. a unique parent target on `public.positions(id, owner_user_id)` if it is not
   already present, before adding the owner-bound foreign key;
2. the history table and its primary key on
   `(position_id, owner_user_id, position_version)`;
3. an owner-bound foreign key from `(position_id, owner_user_id)` to
   `public.positions(id, owner_user_id)` with `ON DELETE RESTRICT`;
4. a restrictive recommendation foreign key or an equivalent separately
   validated owner-bound relationship for the copied tuple; it must never
   cascade deletion through history;
5. the named safe-range, digest and state-frame checks, initially `NOT VALID`
   where existing/backfilled data could make validation expensive, followed by
   a separately bounded `VALIDATE CONSTRAINT` phase; and
6. a lookup index with `owner_user_id` as its leading column for any future
   owner-scoped reader that is actually introduced. The composite primary key
   is not assumed to index a query filtering only by owner.

No `CREATE INDEX CONCURRENTLY` statement may be placed inside a transaction
block. If it is needed for a future lookup index, it is a separately reviewed
deploy unit and its validity must be proven from `pg_index` afterwards.

## Append-only and access boundary

The same source migration must enable RLS, revoke all table privileges from
`anon` and `authenticated`, add no client policy and expose no client grant.
It must create one fixed-purpose append-only trigger which rejects every
`UPDATE` and `DELETE`. The trigger has no exception for an owner, service key
or migration role after the initial migration transaction commits.

Any future server-owned write function is not part of this Action. That future
function must use a fixed `search_path`, lock the owner-scoped current position,
compare the expected current version, refuse the safe-integer maximum, update
the current row and insert the matching history row atomically. It must have
`EXECUTE` revoked from `PUBLIC`, `anon` and `authenticated`; no runtime caller
or grant is authorized here.

## Required source and staging proofs

Before a migration can be applied anywhere, its reviewed SQL bytes must prove:

- exact table, composite key, owner-bound foreign key and restrictive delete
  behavior;
- named checks for range, digest and state-frame presence;
- RLS enabled, no client grant or policy, and append-only trigger coverage;
- correct `pg_index.indrelid`/column ordering for every asserted index;
- no reference to mutable `positions.position_version` as a durable foreign
  key target; and
- no DDL/DML/runtime side effect from this design package itself.

An isolated staging apply then remains a separate authority gate. It must
exercise duplicate-key, cross-owner, stale-version, maximum-version, atomic
rollback, retry, update/delete refusal, cascade refusal, RLS/grant denial and
post-apply catalog proofs. A production apply, generated-types refresh,
runtime wiring and production deploy each require their own explicit approval.

## Remaining gates

The next bounded objective is `position_version_history_source_migration_bytes`:
reviewed SQL source may be added, but not applied, only after its exact
filename, SHA-256, transaction boundaries and catalog assertions are frozen.
Production deployment is not authorized.
