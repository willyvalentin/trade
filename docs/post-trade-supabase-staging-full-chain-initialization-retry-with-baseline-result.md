# Post-Trade Supabase Staging Full-Chain Initialization Retry With Baseline Result

## Summary

Purpose: initialize the approved isolated non-production Supabase environment `ture-staging` by applying the full local migration chain, now including the reviewed baseline migration draft.

Result: full-chain staging initialization succeeded. Runtime/API/UI execution remains blocked.

Decision: `post_trade_supabase_staging_full_chain_initialization_retry_with_baseline_succeeded_runtime_blocked`.

## Approved Scope

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`
- Scope: full local migration chain initialization only
- Verification: migration history, schema/table presence, and static/model checks
- Not authorized: production apply, production DB connection, production Supabase write, API activation, Trade UI execution, runtime write paths, Avanza/browser automation, credential/session/BankID handling, order behavior, real trade/broker data insertion, live trade mutation, or live position mutation

## Pre-Apply Target And Chain Confirmation

Local Supabase CLI target before apply:

```text
pdvzyuhykomwfqyyztru
```

The local chain includes the reviewed baseline migration before the previous blocker:

```text
20260519000000_create_legacy_baseline_schema_draft.sql
20260520000000_add_execution_metadata_to_positions.sql
```

The linked migration list before apply showed the full chain pending remotely:

```text
20260519000000
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

## Apply Command And Result

Command:

```bash
supabase db push --linked
```

Result summary:

```text
Applying migration 20260519000000_create_legacy_baseline_schema_draft.sql...
Applying migration 20260520000000_add_execution_metadata_to_positions.sql...
Applying migration 20260528000000_create_recommendation_snapshots.sql...
Applying migration 20260528001000_create_recommendation_outcomes.sql...
Applying migration 20260528002000_create_recommendation_scan_runs.sql...
Applying migration 20260528003000_create_recommendation_batches.sql...
Applying migration 20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql...
Applying migration 20260610000000_execution_audit_foundation.sql...
Applying migration 20260614000000_create_execution_records.sql...
Applying migration 20260615000000_create_execution_record_audit_events.sql...
Applying migration 20260615001000_enable_rls_execution_record_audit_events.sql...
Applying migration 20260625000000_create_scheduled_scan_attempts.sql...
Applying migration 20260702000000_create_symbol_metadata.sql...
Applying migration 20260708000000_post_trade_persistence_schema_draft.sql...
Finished supabase db push.
```

Non-blocking notices:

- `execution_metadata` already existed on `positions`, so the `if not exists` alter skipped it.
- PostgreSQL truncated two long constraint identifiers.

No unsafe fix, repair, reset, or follow-up mutation was attempted.

## Migration History Verification

Command:

```bash
supabase migration list --linked
```

Result: every local migration version matched the remote migration history:

```text
20260519000000 | 20260519000000
20260520000000 | 20260520000000
20260528000000 | 20260528000000
20260528001000 | 20260528001000
20260528002000 | 20260528002000
20260528003000 | 20260528003000
20260605000000 | 20260605000000
20260610000000 | 20260610000000
20260614000000 | 20260614000000
20260615000000 | 20260615000000
20260615001000 | 20260615001000
20260625000000 | 20260625000000
20260702000000 | 20260702000000
20260708000000 | 20260708000000
```

## Schema Object Verification

The Docker-based schema-only dump verification was attempted twice:

```bash
supabase db dump --linked --schema public --file tmp/supabase-schema-review/ture-staging-public-schema-after-baseline-init-20260708.sql
```

Both attempts hung during Docker image pull/extraction and were interrupted. The artifact remained zero bytes and was not used as evidence.

Read-only type generation was then used as the safe schema/table presence verification:

```bash
supabase gen types typescript --linked --schema public
```

Filtered output confirmed the expected baseline and post-trade tables exist in the linked staging schema:

```text
execution_confirmation_evidence
execution_cost_breakdowns
execution_deviation_reviews
execution_learning_candidates
execution_redacted_artifacts
execution_settlement_reviews
market_calendar_cache
market_regime_snapshots
position_updates
positions
recommendations
scanner_cache
scheduled_scan_runs
user_settings
```

RLS, policies, and grants were verified where possible through:

- successful migration application
- aligned remote migration history
- source-controlled static tests for baseline and post-trade migrations

Direct schema-dump inspection of RLS/policy/grant DDL remains limited by the Docker-based dump hang.

## No Real Data Inserted

No real trade or broker data was inserted by this action.

Evidence:

- the applied migration chain is schema-only
- local static scans found no `INSERT INTO`, `COPY public`, `COPY ... FROM stdin`, `postgres://`, or `postgresql://` markers in the reviewed migration files
- no application/API/UI write path was activated
- no runtime writer was called
- no data import, seed, row export, or broker retrieval command was run

## Production And Runtime Safety

Confirmed:

- production was not selected
- no production DB connection occurred
- no production Supabase write occurred
- local Supabase target remained `pdvzyuhykomwfqyyztru`
- no API route activation occurred
- no Trade UI execution occurred
- no runtime write path was created or activated
- no Avanza/browser automation occurred
- no credential/session/BankID handling occurred
- no order behavior occurred
- no live trade mutation occurred
- no live position mutation occurred

## Remaining Gates

The staging schema is initialized, but all runtime behavior remains blocked.

Still required under separate gates:

- post-initialization schema/RLS review if a direct schema dump becomes available
- API/runtime write path approval
- Trade UI execution approval
- Supabase real write path approval
- Avanza/browser automation approval
- production migration/apply approval

Production remains blocked.

## Final Decision

`post_trade_supabase_staging_full_chain_initialization_retry_with_baseline_succeeded_runtime_blocked`
