# Action 666DC — Position-Version Schema Migration Design and Read-Only Backfill Preflight

## Decision

Action 666DC closes only the bounded
`position_version_schema_migration_design_and_read_only_backfill_preflight`
design objective. It adds a source-controlled, aggregate-only SQL preflight
and freezes the later migration sequence for `position_version_schema_v1`.
The SQL has not been run against Supabase or any other database. Running it,
adding a migration, applying schema or data changes, refreshing generated
types, wiring runtime code, or publishing production requires later and
separate authority.

The exact current-main authority for this design is the ordinary PR #126 merge
`a80f3a8856121edb4260909ac1cedcf638d421b8`, tree
`331625c5486aa4f50828762e6b0e758d251b346a`, with parents
`dbeed25f2074bff4dba8cee7f6d511cb17992efc` and
`92e5ae9b444e3b773d9c7ff40aad3d60037909f6`. Exact-main push run
`32401750100` completed successfully. Production remains the separately
verified Netlify release at `dbeed25f2074bff4dba8cee7f6d511cb17992efc`;
this later governance-only main commit is not a production publication.

## Frozen predecessor and current gap

Action 666DB is the frozen predecessor. Its provider-bound catalog and
generated types prove that `public.positions` has 20 columns,
`recommendation_id` remains nullable and the four target position-lineage
columns are absent. `public.recommendations` has 21 columns and the three
target recommendation-lineage columns are absent. The existing owner-bound
foreign key and source migration preserve `(recommendation_id, owner_user_id)`
lineage, but `application_open_owned_position_v1` does not verify a durable
recommendation version, canonical identity or normative digest.

The target remains exactly `position_version_schema_v1`:

- `recommendations.recommendation_version bigint` in `1..9007199254740991`;
- canonical Action 664A `recommendation_identity`;
- a 64-character lowercase-hex `recommendation_normative_digest`;
- `positions.position_version bigint`, initially `1`, with the same safe range;
- copied `durable_recommendation_version`, `recommendation_identity` and
  `recommendation_normative_digest` on each position;
- `positions.recommendation_id not null` only after the legacy inventory and
  an independently approved deterministic backfill reach zero blockers;
- `(id, owner_user_id, position_version)` remains a mutable compare-and-swap
  predicate, never a durable historical reference target.

Action 655G still accepts only the incompatible hash-suffix identity form and
must be reconciled to Action 664A before runtime wiring. Append-only position
version history remains a separate design when a durable version-bound
reference is actually required.

## Read-only preflight contract

The only executable artifact added here is
`scripts/action-666dc-position-version-read-only-backfill-preflight.sql`.
Its contract is fail-closed:

1. start one `REPEATABLE READ`, `READ ONLY` transaction;
2. set local statement, lock and idle-in-transaction timeouts;
3. use a `pg_catalog` search path and schema-qualified application relations;
4. take one stable snapshot and emit exactly one JSONB value;
5. return aggregate counts and booleans only;
6. never return row contents, position/recommendation UUIDs or owner UUIDs;
7. perform no DDL, DML, function call, role change, copy or persistence;
8. finish with `ROLLBACK`, including when the caller forgets to close the
   transaction normally.

The output is closed to these groups:

- `row_counts`: position/recommendation totals and nullable `created_at`
  blockers;
- `link_integrity`: null links, orphan links, owner mismatches, owner-bound
  links, duplicate owner-bound link groups/rows and recommendations without a
  position;
- `backfill_classes`: recommendation identity-seed eligibility and position
  lineage-copy eligible/blocked totals;
- `catalog_guards`: validated owner-bound FK, both required relationship
  indexes and RLS enabled on both tables;
- `privacy`: explicit proof that only aggregate counts and booleans leave the
  transaction.

The query intentionally does not invent the canonical identity or digest for
legacy rows. `created_at` is only an inventory prerequisite for the future
decision instant; the source namespace, producer decision ID and complete
normative digest projection must be frozen by a later deterministic backfill
contract. Any non-zero null/orphan/owner-mismatch/duplicate or blocked-lineage
class remains a stop condition until separately classified and reviewed.

Executing this query against production requires a new explicit operator
approval naming the exact SQL hash, target project, aggregate-only output,
credential boundary and evidence destination. The execution must not print a
connection string, token, row identifier, owner identifier or row contents.

## Migration sequence after an authorized clean inventory

No migration file is added by this Action. A later migration package must use
the following separately reviewable phases:

1. **Fresh inventory.** Run the exact approved read-only SQL and bind its
   result, project identity, catalog identity, timestamps and SQL SHA-256.
2. **Deterministic lineage contract.** Freeze the canonical Action 664A
   identity inputs and normative digest projection for every eligible legacy
   recommendation; every unclassifiable row fails closed.
3. **Nullable additive columns.** Add the seven target columns without a
   volatile default or client grant. Do not mark them `NOT NULL` yet.
4. **Bounded backfill.** Update deterministic, owner-scoped batches in short
   transactions with exact row-count reconciliation and resumable checkpoints.
   Copy position lineage only from the locked owner-matching recommendation.
5. **Relationship indexes.** Create any missing referencing/lookup indexes as
   a separate deploy unit. If `CREATE INDEX CONCURRENTLY` is required, keep it
   outside a transaction block and prove the resulting index valid and ready.
6. **Fail-closed constraints.** Add safe-range, canonical-identity,
   lowercase-digest and lineage constraints as named `NOT VALID` constraints,
   then validate them in separate bounded operations. A foreign key never
   substitutes for an index on its referencing columns.
7. **Not-null activation.** Only after zero-null readback and validated
   non-null checks may the columns, including `positions.recommendation_id`, be
   promoted to physical `NOT NULL`.
8. **Server-only v2 command.** Replace the v1 open-position command with an
   owner-scoped, fixed-purpose `security definer` function whose `search_path`
   is fixed and whose execution is revoked from `public`, `anon` and
   `authenticated`; grant only the exact server role. Lock and verify the
   recommendation version/identity/digest and write the position plus lineage
   atomically or roll everything back.
9. **Isolated staging.** Prove exact retry, stale version, maximum version,
   cross-owner, changed identity/digest, duplicate-link and rollback behavior.
10. **Separate production authority.** Apply only the reviewed bytes during an
    approved window with bounded locks, verify constraints/indexes/functions,
    then refresh generated TypeScript and the MA-09 provider provenance from
    the exact post-migration `[public]` schema.

Supabase's current Data API defaults are moving toward explicit grants. This
design adds no table or function and grants nothing. A later migration must
explicitly prove that no new client-visible Data API surface is introduced.

## Official technical basis

- PostgreSQL `REPEATABLE READ` provides one stable snapshot for the inventory:
  <https://www.postgresql.org/docs/current/transaction-iso.html>.
- PostgreSQL documents `NOT VALID` plus later `VALIDATE CONSTRAINT` as the
  lower-impact constraint-validation sequence and identifies its lock levels:
  <https://www.postgresql.org/docs/current/sql-altertable.html>.
- PostgreSQL does not automatically add an index on referencing foreign-key
  columns: <https://www.postgresql.org/docs/current/ddl-constraints.html>.
- PostgreSQL requires `CREATE INDEX CONCURRENTLY` outside a transaction block:
  <https://www.postgresql.org/docs/current/sql-createindex.html>.
- Supabase requires explicit function privilege control and a fixed
  `search_path` for `security definer` functions:
  <https://supabase.com/docs/guides/database/functions>.
- Supabase's Data API security guidance makes new relation/function access
  explicit rather than implicit:
  <https://supabase.com/docs/guides/api/securing-your-api>.

## Remaining gates

This design does not close the durable schema dependency. The next bounded
objective is
`authorized_position_version_read_only_backfill_inventory_execution`.
After that, the deterministic legacy recommendation-lineage backfill contract,
Action 655G identity reconciliation, append-only history decision, source
migration, isolated staging apply, separately authorized production apply and
refreshed generated-types provenance remain mandatory.

Market-observation provenance, the durable exit queue, transactional runtime
handoff, client projection and all broker/automatic-execution authority remain
separate blockers. Production deployment is not authorized.
