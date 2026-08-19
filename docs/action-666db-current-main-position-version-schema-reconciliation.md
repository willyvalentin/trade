# Action 666DB — current-main position-version schema reconciliation

## Authority boundary

This provider-free planning Action starts from protected GitHub `main` commit
`c67ec9280bf5b4ff9f57930f79b7e62bd4ec750a`, tree
`96012987bf59322f2a4b27202a6946ee668f4556`. That commit is the ordinary
merge of PR #120 with parents
`e9c3355125a54f4f9ba55ada2ac55fc91b184647` and
`93ca8bd41a15a5b6e482779b252406b5639d81b7`. Push-triggered exact-main CI run
`32301932410` completed successfully with all six provider-free shards and the
protected aggregate green.

The Action 660D V2 provider catalog and generated TypeScript remain the latest
authenticated schema authority for selected schema `[public]`. This Action
reads only their repository-reachable, checksum-bound bytes. It performs no
Supabase query, database mutation, migration, type generation, application
write, provider configuration change or production deployment.

## Current schema reconciliation

The provider catalog proves that `public.positions` currently has 20 columns
and `public.recommendations` has 21 columns. Both tables have physical
`owner_user_id uuid not null` columns and owner foreign keys. Positions also
has the composite owner-bound recommendation foreign key
`positions_recommendation_owner_fkey (recommendation_id, owner_user_id) ->
recommendations(id, owner_user_id)`.

The durable version contract required by Action 655A/655G is absent:

- `positions` has no positive `position_version`;
- `positions` has no `durable_recommendation_version`,
  `recommendation_identity` or `recommendation_normative_digest`;
- `recommendations` has no positive `recommendation_version`,
  `recommendation_identity` or `recommendation_normative_digest`;
- `positions.recommendation_id` remains nullable;
- `app_open_owned_position_transaction` locks the owner-bound recommendation
  row, but its v1 signature cannot compare a caller-independent durable
  recommendation version, identity or normative digest and inserts no
  position version.

The pure Action 655G evaluator therefore remains runtime-unwired. Synthetic
`position_version` and recommendation-lineage fields accepted by the evaluator
are contract evidence only, not proof that the current database can supply
them durably.

## Frozen target contract

The frozen `position_version_schema_v1` target requires the next migration
design to preserve the existing owner boundary and add the following exact
server-owned fields.

`public.recommendations`:

- `recommendation_version bigint not null`, constrained to the inclusive
  range `1..9007199254740991`;
- `recommendation_identity text not null`, constrained to
  `rec_decision:v1:` followed by exactly 64 lowercase hexadecimal characters;
- `recommendation_normative_digest text not null`, constrained to exactly 64
  lowercase hexadecimal characters.

`public.positions`:

- `position_version bigint not null`, initialized to `1` and constrained to
  `1..9007199254740991`;
- `durable_recommendation_version bigint not null`, constrained to the same
  positive safe-integer range;
- `recommendation_identity text not null` and
  `recommendation_normative_digest text not null`, with the same formats as the
  locked recommendation row;
- `recommendation_id uuid not null` after an explicit legacy-row preflight and
  approved backfill;
- an exact-version key/index on
  `(id, owner_user_id, position_version)` for future version-bound references.

The successor to `app_open_owned_position_transaction` must remain
`security definer`, service-role-only, owner-scoped and fixed-purpose. In one
short transaction it must lock exactly `(recommendation_id, owner_user_id)`,
verify the locked positive version, identity and digest against the command,
create position version `1`, copy the verified recommendation lineage, mark
the same recommendation row taken, link only matching owner snapshots and
commit; otherwise every effect rolls back. Exact retries return the original
position only when all locked lineage and command bytes match. A stale version
or changed identity/digest fails without writes.

Every later position mutation must use compare-and-swap semantics equivalent
to:

```sql
update public.positions
set position_version = position_version + 1
where id = p_position_id
  and owner_user_id = p_owner_user_id
  and position_version = p_expected_position_version
  and position_version < 9007199254740991
returning position_version;
```

Zero returned rows is a stale/conflict result, never an implicit retry or
client-authorized version advance. No browser payload may choose an owner,
initial version, next version, recommendation identity or normative digest.

## Remaining migration gates

This reconciliation freezes the target and closes only the bounded
`current_main_position_version_schema_reconciliation` planning objective. The
durable `position_version_schema` dependency remains unresolved until all of
these later gates are independently satisfied:

1. an authorized read-only production inventory proves recommendation/position
   row counts, null recommendation links, orphan links, duplicate links and
   legacy backfill classes without exposing row contents or owner UUIDs;
2. a deterministic, separately reviewed recommendation identity/digest
   backfill contract maps every eligible legacy row or fails closed;
3. a source migration and v2 owner-bound open-position command are reviewed
   with safe constraints, indexed foreign keys, bounded locks and no client
   grants;
4. an isolated staging apply proves rollback, exact retry, stale-version,
   cross-owner, identity/digest-conflict and compare-and-swap behavior;
5. a separately authorized production migration is applied and read back;
6. generated TypeScript and the Action 660D/MA-09 provider provenance package
   are refreshed from the exact post-migration `[public]` schema.

The next bounded objective is
`position_version_schema_migration_design_and_read_only_backfill_preflight`.

Market-observation provenance, durable exit-queue schema, transactional
recommendation-to-position runtime wiring and client projection remain
separate blockers. No monitor, queue, worker, route, broker or production write
is authorized by this Action.

## Delivery boundary

Delivery requires exact scope, exact-head CI, independent read-only review,
explicit operator approval naming the PR and exact head, an ordinary protected
PR merge and successful exact-main CI. An automatic Netlify deploy preview is
non-production evidence only. Production deployment is not authorized.
