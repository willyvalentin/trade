# Action 664D — Additive Evaluation Storage and Default-Off Writer

Status: implemented locally and inactive. The migration has only been applied
to a disposable local PostgreSQL container. No production bundle, linked
database operation, route integration, dual-write, or backfill exists.

## Preflight and version reservation

- Canonical local `origin/main`:
  `f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`.
- Action 664D migration version `20260726001000` was unused in canonical
  `origin/main`, Track 1, and Track 2 before creation.
- Track 1's local `20260726000000` is a separate immediately preceding
  reservation. Action 664D does not read, apply, copy, or modify that
  migration.
- Action 664D migration:
  `supabase/migrations/20260726001000_create_canonical_evaluation_decisions.sql`.
- SHA-256:
  `212296f6cd3c22bf775fc969ee569c359bf80b32bb9aac78ec1592ba6d7bbcd1`.

## Hybrid table contract

`public.canonical_evaluation_decisions` stores exactly one row per canonical
recommendation decision:

- normalized query fields for identity, sample type, lineage, confidence,
  versions, decision context, provider freshness, coverage, and primary
  outcome;
- the complete lossless `canonical_evaluation_persistence_v1` envelope;
- all diagnostic horizon rows inside `diagnostic_horizons_json`, equal to the
  envelope evaluation horizons;
- a deterministic SHA-256 semantic payload digest;
- no normalized child horizon relation that could inflate the canonical
  decision count.

The canonical identity is unique. A partial unique index protects
`evaluator_input_identity` where it is non-null and quality-eligible.

## Ownership and ACL

- owner: `postgres`;
- RLS: enabled;
- RLS policies: zero;
- explicit column ACL entries: zero;
- `PUBLIC`, `anon`, and `authenticated`: no table privileges;
- `service_role`: table `SELECT` and `INSERT` only;
- no `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, or `TRIGGER` table
  privilege for `service_role`;
- a trigger rejects `UPDATE` and `DELETE`, including owner attempts.

The table has no browser contract and is append-only.

## Constraints

The schema fails closed on:

- a malformed or duplicate canonical identity;
- a noncanonical storage, envelope, or lineage contract version;
- sample types outside the canonical six-value set;
- mismatched sample type and decision kind;
- numeric confidence outside `[0,1]`;
- noncanonical confidence labels;
- a non-full lowercase 40-character Git SHA when present;
- negative expected or observed coverage;
- missing first-class versions on quality-eligible rows;
- broken sample-specific lineage;
- snapshot/recommendation identity mismatches;
- malformed JSON structures;
- normalized fields that conflict with the immutable envelope;
- diagnostic horizons or replay metadata that conflict with evaluation JSON.

## Idempotency

The writer hashes deterministic canonical envelope JSON in the application
layer:

```text
same canonical identity + same semantic SHA-256
  → idempotent_no_effect

same canonical identity + different semantic SHA-256
  → semantic_conflict
  → never UPDATE or overwrite
```

The unique canonical identity constraint closes concurrent races. After a
unique collision, the writer re-reads the digest and resolves it as either
no-effect or explicit semantic conflict.

PostgreSQL deliberately owns only digest-format validation and exact parity
between normalized query columns and the stored envelope. It does not contain
a partial JSON canonicalizer and cannot assert the TypeScript canonical JSON
digest. The application therefore recomputes the canonical envelope digest
immediately before insert and after every identity readback. A stored envelope,
identity, and digest that do not reproduce exactly are a semantic conflict.

## Writer and kill switch

`lib/server/canonical-evaluation-storage-writer.ts` begins with
`import "server-only"` and accepts only payloads that can be rebuilt exactly
from a ready Action 664C envelope.

Two independent gates are required:

```text
TURE_CANONICAL_EVALUATION_WRITER_ENABLED=true
TURE_CANONICAL_EVALUATION_WRITER_KILL_SWITCH=false
```

The feature flag defaults to disabled. The kill switch defaults to engaged.
No database client is created unless both conditions are explicit.

The adapter exposes only:

- lookup by canonical identity;
- insert of a validated canonical row.

It exposes no update or delete operation.

No existing route, generator, scanner, recommendation snapshot/outcome writer,
statistics consumer, or learning consumer imports the writer.

## Dry-run and readback diagnostics

Pure diagnostics classify fixture inputs as:

- `would_insert`;
- `idempotent_no_effect`;
- `semantic_conflict`;
- `rejected_unmappable`.

Runtime writer results additionally include:

- `feature_flag_disabled`;
- `kill_switch_engaged`;
- `service_unavailable`;
- `inserted`;
- `database_error`.

Every result reports whether a database read or insert was attempted and fixes
`overwritten`, `update_attempted`, `delete_attempted`, `provider_called`, and
`route_called` to `false`.

## Local PostgreSQL evidence

The frozen report is
`docs/action-664d-local-postgres-matrix.json`.

The harness:

1. created a disposable local PostgreSQL 16 container;
2. replayed all 34 SQL migrations directly from canonical `origin/main`;
3. applied only the local 664D migration afterward;
4. executed 13 catalog and behavior scenarios;
5. removed the container.

Result: 13 passed, 0 failed.

The matrix verified exact columns, owner, RLS, zero policies, zero column ACLs,
all table privileges, six sample types, actual browser-role denial,
service-role insert/read, no-effect retry, semantic collision, invalid
confidence/sample/version/lineage/envelope rejection, append-only enforcement,
transaction rollback without a partial row, and unchanged legacy table catalog
metadata.

Production rows read: `0`. Production rows written: `0`.

## Inactive boundary

- migration not applied outside the disposable local test database;
- no SQL Editor production bundle;
- no live consumer import;
- no dual-write or backfill;
- no route, scanner, provider, collector, replay, or learning execution;
- no scoring, ranking, threshold, AI, or publication change.

## Remaining blockers

- authoritative producer decision IDs before candidate/ranking persistence;
- approved call-site ownership for a future default-off projection orchestrator;
- generated database types after an approved schema application;
- local/staging transaction and readback through the real Supabase client;
- retention and operational ownership for rejected raw-audit evidence;
- deployment kill-switch ownership and monitoring;
- independent migration review and separate production approval;
- a measured shadow capture period before quality metrics consume rows.

## Proposed Action 664E

Implement a default-off canonical capture orchestrator for one bounded source,
preferably completed recommendation snapshot/outcome bundles:

1. project the existing source through 664B;
2. require a ready 664C envelope;
3. build the 664D storage payload;
4. invoke the 664D writer only behind the existing feature flag and kill
   switch;
5. keep production disabled and run only against a disposable local or
   separately approved ephemeral staging database;
6. add end-to-end no-effect, semantic-conflict, and readback parity evidence;
7. require a separate action before enabling any live dual-write.

Action 664E must not change scoring, ranking, publication, provider activity,
or recommendation selection.
