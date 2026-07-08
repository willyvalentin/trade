# Post-Trade Supabase Staging Migration History Alignment Plan, No Apply

## Summary

Purpose: define a no-apply plan for resolving the `ture-staging` migration history blocker before any future post-trade persistence migration apply retry.

Result: migration history alignment plan ready; no migration apply, schema/data command, migration repair, or Supabase data write occurred.

Decision: `post_trade_supabase_staging_migration_history_alignment_plan_ready_no_apply`.

## Current Target

Safe local metadata inspection shows:

| Item | Value |
| --- | --- |
| Environment | `ture-staging` |
| Project ref / safe identifier | `pdvzyuhykomwfqyyztru` |
| Scope | Isolated non-production only |

Production remains excluded.

## Current Blocker

Action 406 stopped before apply because `supabase migration list --linked` showed all local migrations as pending remotely. Action 406 only allowed applying the post-trade persistence migration:

- `20260708000000_post_trade_persistence_schema_draft.sql`

Applying only `20260708000000` is unsafe or impossible until a migration history strategy is chosen because the CLI does not expose a single-file apply flag and the linked migration history did not show the earlier local migrations as already applied.

## Local Migration Order

Safe local filename inspection only:

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

No SQL content was executed. No remote schema/data command was run.

## Strategy A - Initialize/Rebuild Staging With Full Chain

Description: treat `ture-staging` as an empty or disposable isolated non-production project and apply the full local migration chain in order.

Use only if:

- `ture-staging` is confirmed empty or disposable
- applying all 13 local migrations is explicitly approved
- production is not selected
- backup/rollback expectations are understood
- runtime/API/UI execution remains blocked

Benefits:

- avoids migration history repair against unknown schema state
- creates a coherent schema/history baseline from repository migrations
- makes future targeted migrations safer because history and schema start aligned

Risks:

- applies more than the post-trade migration
- requires explicit approval for full-chain non-production apply
- must not be used if staging contains valuable or production-like data

## Strategy B - Baseline/Repair History If Schema Already Matches

Description: align Supabase migration history without applying schema changes, but only if `ture-staging` already has schema matching the local migration chain.

Use only if:

- safe schema inspection proves every earlier migration object already exists
- no production data is present
- a separate migration-history repair plan is approved
- repair commands are reviewed as Supabase metadata writes
- rollback expectations are explicit

Benefits:

- avoids reapplying existing schema
- could preserve an already-correct staging schema

Risks:

- unsafe if schema and migration history diverge
- history repair is still a write to Supabase migration metadata
- requires careful verification gates before and after repair
- not appropriate while schema state is ambiguous

## Strategy C - Recreate Clean Staging Project

Description: abandon the current staging target if history/schema state is ambiguous and create a fresh isolated non-production Supabase project for a clean full-chain apply.

Use only if:

- current `ture-staging` state cannot be safely classified as empty, disposable, or schema-matching
- a new non-production project ref is declared and proven
- production is not selected
- full-chain apply to the new project is explicitly approved

Benefits:

- avoids repairing unknown state
- produces a clean migration history from scratch
- strongest isolation if there is any concern about current staging contents

Risks:

- requires new target declaration and relink proof
- may require reconfiguring non-secret local project metadata
- still requires separate full-chain apply approval

## Recommended Strategy

Recommended safest strategy for this project: Strategy A only if `ture-staging` is confirmed empty/disposable; otherwise Strategy C.

Reasoning:

- The linked migration history indicates no local migrations are recorded remotely.
- Action 406 did not prove the existing remote schema matches the local chain.
- A targeted apply of only `20260708000000` is blocked by pending earlier migrations.
- Baseline/repair should not be attempted unless schema parity is proven first.
- For an isolated non-production environment, a clean full-chain apply is safer than metadata repair against ambiguous state.

## Required Preconditions Before Any Future Apply

Before any future apply action:

- local target must remain `pdvzyuhykomwfqyyztru`
- local metadata must show `ture-staging`
- production must remain excluded
- backup/rollback expectations must be acknowledged
- staging data classification must be explicit: empty, disposable, schema-matching, or ambiguous
- migration scope must be explicit: full chain vs targeted migration
- if full chain, all 13 migrations must be explicitly in scope
- if targeted, earlier migration history/schema parity must be proven first
- runtime/API/UI execution must remain blocked
- Supabase real write paths must remain blocked unless separately approved

## Forbidden Commands / Actions

Forbidden in this planning action:

```bash
supabase db push
supabase migration up
supabase db reset
```

Also forbidden:

- any migration apply
- any DB schema/data command
- any Supabase data write
- production DB connection
- printing or storing secrets
- API activation
- Trade UI execution
- browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order action
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for this action:

- no migration apply
- no DB schema/data command
- no Supabase data write
- no production state touch
- no secrets printed or stored
- no API activation
- no Trade UI execution
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_staging_migration_history_alignment_plan_ready_no_apply`
