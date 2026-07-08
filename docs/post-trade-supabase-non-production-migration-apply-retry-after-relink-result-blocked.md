# Post-Trade Supabase Non-Production Migration Apply Retry After Relink Result, Blocked

## Summary

Purpose: record the Action 406 retry result after local Supabase CLI target relink.

Result: blocked before any migration apply command.

Decision: `post_trade_supabase_non_production_migration_apply_retry_after_relink_blocked_or_failed_runtime_blocked`.

The local Supabase CLI target was re-confirmed as the approved isolated non-production target, but linked migration history inspection showed that all local migrations appear pending remotely. Because the scope requires applying only `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql`, the apply was stopped before any apply command.

No migration was applied.

## Approved Target

| Item | Value |
| --- | --- |
| Environment | `ture-staging` |
| Project ref / safe identifier | `pdvzyuhykomwfqyyztru` |
| Scope | Isolated non-production only |

## Target Confirmation Before Apply

Safe local metadata inspection showed:

| Local metadata source | Value |
| --- | --- |
| `supabase/.temp/project-ref` | `pdvzyuhykomwfqyyztru` |
| `supabase/.temp/linked-project.json` `ref` | `pdvzyuhykomwfqyyztru` |
| `supabase/.temp/linked-project.json` `name` | `ture-staging` |

Production was not selected according to local CLI link metadata.

## Requested Migration

- `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql`

## Read-Only Migration History Check

Command run:

```bash
supabase migration list --linked
```

Result summary:

- The CLI connected to the linked non-production target for migration history inspection.
- The remote migration history column was empty for all local migrations.
- The intended migration `20260708000000` was not the only pending local migration.

Local migrations that appeared pending remotely:

```text
20260520000000
20260528000000
20260528001000
20260528002000
20260528003000
20260605000000
20260610000000
20260614000000
20260615000000
20260615001000
20260625000000
20260702000000
20260708000000
```

No database URL, service role key, anon key, access token, password, cookie, or session value was printed or stored.

## Why Apply Was Blocked

The apply was stopped before any migration command because:

- Action 406 scope allows only the intended post-trade persistence migration.
- Supabase CLI help did not expose a single-file apply flag.
- Linked migration history showed more than the intended migration pending remotely.
- Running a broad apply command would risk applying older migrations outside Action 406 scope.
- Performing migration-history repair or baseline manipulation would be a separate write-path decision and was not approved by this action.

This is a scope and safety block, not a migration SQL failure.

## Commands Not Run

The following remained forbidden and were not run:

```bash
supabase db push
supabase migration up
supabase db reset
```

No migration apply command was run.

No DB schema/data command was run.

## Schema / RLS Verification

Remote schema/RLS verification after apply could not run because no migration was applied.

Static/local verification remains available through:

- `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts`
- `tests/e2e/post-trade-schema-allowlist-alignment.spec.ts`
- `tests/e2e/post-trade-persistence-payload-allowlist.spec.ts`

## No Runtime Activation

Confirmed for this blocked retry:

- no migration apply
- no schema change
- no Supabase data write
- no real trade data insert
- no real broker data insert
- no API activation
- no Trade UI execution
- no runtime write path creation
- no Avanza/browser automation
- no credential/cookie/session/BankID handling
- no settlement note retrieval
- no order submission
- no final KOP/SALJ click
- no live trade mutation
- no live position mutation

## Production State

Production remains blocked.

No production state was touched because:

- local CLI metadata pointed to `ture-staging` / `pdvzyuhykomwfqyyztru`
- no production DB connection was attempted
- no migration apply command was run
- no schema/data write was performed
- no runtime/API/UI execution path was activated

## Rollback / Cleanup Recommendation

No rollback is required because no apply command was run and no database state changed.

Before a future apply can proceed, create a separate explicit plan for one of these safe paths:

- prove the approved non-production target already has the prerequisite schema and migration history can be aligned without schema writes
- create a new isolated non-production target where applying the full migration chain is explicitly approved
- draft and review a migration-history repair/baseline plan, if appropriate, with clear non-production scope and rollback expectations

Do not run migration-history repair, `db push`, `migration up`, or reset commands without a separate explicit gate.

## Final Decision

`post_trade_supabase_non_production_migration_apply_retry_after_relink_blocked_or_failed_runtime_blocked`
