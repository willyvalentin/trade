# Post-Trade Supabase Staging Full-Chain Initialization Execution Result, Failed

## Summary

Purpose: record the Action 409 full-chain staging initialization execution result.

Result: initialization failed on the first migration and stopped immediately.

Decision: `post_trade_supabase_staging_full_chain_initialization_blocked_or_failed_runtime_blocked`.

The target was correctly linked to `ture-staging` / `pdvzyuhykomwfqyyztru`, and the dry-run matched the approved full-chain scope. The actual apply failed because the first migration depends on `public.positions`, which does not exist in the staging project.

No repair, reset, migration-history manipulation, runtime activation, or production action was attempted.

## Approved Target

| Item | Value |
| --- | --- |
| Environment | `ture-staging` |
| Project ref / safe identifier | `pdvzyuhykomwfqyyztru` |
| Scope | Isolated non-production only |

Safe local metadata before and after the attempt showed:

| Local metadata source | Value |
| --- | --- |
| `supabase/.temp/project-ref` | `pdvzyuhykomwfqyyztru` |
| `supabase/.temp/linked-project.json` `ref` | `pdvzyuhykomwfqyyztru` |
| `supabase/.temp/linked-project.json` `name` | `ture-staging` |

Production was not selected.

## Dry-Run Plan

Command run:

```bash
supabase db push --linked --dry-run
```

Result summary:

- The CLI connected to the linked staging target.
- The dry-run did not apply migrations.
- The dry-run listed the approved full local migration chain in order:

```text
20260520000000_add_execution_metadata_to_positions.sql
20260528000000_create_recommendation_snapshots.sql
20260528001000_create_recommendation_outcomes.sql
20260528002000_create_recommendation_scan_runs.sql
20260528003000_create_recommendation_batches.sql
20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql
20260610000000_execution_audit_foundation.sql
20260614000000_create_execution_records.sql
20260615000000_create_execution_record_audit_events.sql
20260615001000_enable_rls_execution_record_audit_events.sql
20260625000000_create_scheduled_scan_attempts.sql
20260702000000_create_symbol_metadata.sql
20260708000000_post_trade_persistence_schema_draft.sql
```

No secrets were printed or stored.

## Apply Command

Command run:

```bash
supabase db push --linked
```

Result: failed on the first migration.

Failure excerpt:

```text
Applying migration 20260520000000_add_execution_metadata_to_positions.sql...
ERROR: relation "public.positions" does not exist (SQLSTATE 42P01)
At statement: 0
alter table public.positions
add column if not exists execution_metadata jsonb
```

The failed migration file contains:

```sql
alter table public.positions
add column if not exists execution_metadata jsonb;
```

## Post-Failure Migration History Check

Command run:

```bash
supabase migration list --linked
```

Result summary:

- The CLI connected to the linked staging target for migration-history inspection.
- Remote migration history still showed no local migrations recorded.
- No migration was marked applied after the failed first migration.

## Schema / RLS Verification

Full schema/RLS verification could not run because initialization failed before the first migration completed.

Post-trade persistence schema was not applied.

Expected base schema objects were not proven because the failure showed `public.positions` is missing.

## No Runtime Activation

Confirmed for this action:

- no production apply
- no production DB connection
- no successful migration apply
- no migration-history repair
- no reset
- no Supabase data write for real trade or broker data
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

Production remains blocked and was not touched.

The linked target remained `ture-staging` / `pdvzyuhykomwfqyyztru` throughout the attempt.

## Rollback / Cleanup Recommendation

No rollback command was run.

Recommended next step is not another apply retry. First create a separate no-apply prerequisite/base-schema recovery plan that decides one of:

- add or locate the missing base schema migration that creates `public.positions`
- recreate `ture-staging` from a complete schema source that includes `public.positions`
- repair the staging baseline only after schema parity and migration-history expectations are explicitly proven

Do not run `supabase db reset`, migration repair, schema patching, or another apply attempt without a separate explicit approval gate.

## Final Decision

`post_trade_supabase_staging_full_chain_initialization_blocked_or_failed_runtime_blocked`
