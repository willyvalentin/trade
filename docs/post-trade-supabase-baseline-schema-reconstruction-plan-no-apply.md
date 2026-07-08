# Post-Trade Supabase Baseline Schema Reconstruction Plan, No Apply

## Summary

Purpose: reconstruct the missing Supabase baseline schema requirements for `ture-staging` from source-controlled and local evidence before any future retry of staging initialization.

Result: local evidence is sufficient to identify the missing baseline surface and the first required table, but insufficient to safely draft an authoritative baseline migration without a separate schema-only baseline gate.

Decision: `post_trade_supabase_baseline_schema_reconstruction_plan_requires_schema_only_dump_gate_no_apply`.

## Context

- Action 410 decision: `post_trade_supabase_staging_baseline_schema_gap_analysis_ready_no_apply`
- Target remains `ture-staging` / `pdvzyuhykomwfqyyztru`
- Production remains blocked.
- Full-chain staging initialization failed because the first local migration assumes `public.positions` exists.
- First local migration: `supabase/migrations/20260520000000_add_execution_metadata_to_positions.sql`
- First migration SQL:

```sql
alter table public.positions
add column if not exists execution_metadata jsonb;
```

No local migration creates `public.positions` before this file.

## Local Evidence Inspected

This plan inspected source-controlled and local evidence only:

- local Supabase migration files in `supabase/migrations/`
- generated database type surface in `lib/supabase-database.types.ts`
- application Supabase query references in `app/trade-app.tsx`
- position update route references in `app/api/positions/update/route.ts`
- local tests and prior checkpoint docs relevant to `positions`

No Supabase apply command, reset command, migration repair command, production connection, staging schema/data command, or data write was run.

## Migration Chain Completeness

The local migration chain is not complete from an empty database.

Evidence:

- The first local migration alters `public.positions`.
- No earlier local migration creates `public.positions`.
- Later local migrations create newer tables such as `recommendation_snapshots`, `recommendation_outcomes`, `recommendation_scan_runs`, `execution_records`, `execution_record_audit_events`, `scheduled_scan_attempts`, `symbol_metadata`, and the post-trade persistence draft tables.
- The generated type surface includes legacy app tables that are not created by the local migration folder.

Conclusion: the current migration directory assumes a pre-existing application baseline.

## Baseline Table Findings

| Table | Evidence source | Likely columns from local evidence | Uncertainty | Required before existing migrations |
| --- | --- | --- | --- | --- |
| `public.positions` | First migration alters it; generated types include it; app reads/writes it | `id`, `recommendation_id`, `ticker`, `company_name`, `entry_price`, `position_size`, `current_stop`, `target_1`, `target_2`, `status`, `exit_price`, `closed_at`, `pnl`, `pnl_percent`, `r_multiple`, `exit_notes`, `created_at`; later migration adds `execution_metadata` | Medium-high: columns are visible, but original DDL, defaults, constraints, indexes, and RLS are not proven | Yes |
| `public.recommendations` | `positions.recommendation_id` relationship in generated types; app reads/writes recommendations; app joins `positions` to `recommendations` | Recommendation-facing fields are locally referenced in app types and generated types, but complete baseline DDL is not locally migrated | High: required relationship is visible, but full table definition and policies are not source-controlled in migrations | Likely, because `positions.recommendation_id` references it in generated types |
| `public.position_updates` | Generated types include FK to `positions`; `app/api/positions/update/route.ts` inserts updates; app reads updates | `id`, `position_id`, `action`, `recommendation`, `explanation`, `new_stop`, `created_at` | Medium-high: type shape and FK are visible, but original DDL/defaults/indexes/RLS are not proven | Not for first migration, but needed for app baseline consistency |
| `public.user_settings` | Generated types include it; app and settings page read/write it | `id`, `portfolio_size`, `risk_per_trade_percent`, `max_open_positions`, `max_recommendations_per_session`, `preferred_timeframe`, `long_only`, `created_at`, `updated_at` | Medium-high: shape is visible, but original DDL/defaults/RLS are not proven | Not for first migration, but needed for app baseline consistency |
| `public.scheduled_scan_runs` | Generated types include it; app and scan logging code read/write it | `id`, `scan_date`, `session_type`, `status`, `recommendations_created`, `message`, `created_at` | Medium-high: shape is visible, but original DDL/defaults/RLS are not proven | Not for first migration, but needed for app baseline consistency |
| `public.market_calendar_cache` | Generated types include it | `id`, `cache_date`, `day_type`, `is_open_day`, `market_open_time`, `market_close_time`, `provider`, `reason`, `raw`, `created_at`, `updated_at` | High: type shape exists, but migration provenance is not visible | Not for first migration |
| `public.market_regime_snapshots` | Generated types include it | Market-regime snapshot fields for QQQ/SPY moving averages and summaries | High: type shape exists, but migration provenance is not visible | Not for first migration |
| `public.scanner_cache` | Generated types include it | Scanner cache fields are present in generated types | High: type shape exists, but migration provenance is not visible | Not for first migration |

## Constraints, Indexes, RLS, and Policies

Locally evidenced:

- `position_updates.position_id` references `positions.id` in generated types.
- `positions.recommendation_id` references `recommendations.id` in generated types.
- `positions.execution_metadata jsonb` is added by the first local migration.

Not locally proven for the legacy baseline:

- primary key definitions beyond generated type expectations
- default expressions such as UUID generation or timestamps
- check constraints
- unique indexes
- query-supporting indexes
- RLS enablement state
- RLS policies
- grants
- trigger definitions

The newer local migrations do define constraints, indexes, comments, and RLS for tables they create. That does not reconstruct the missing legacy baseline.

## Baseline Draft Decision

Pass:

- local evidence proves the migration-chain gap
- local evidence identifies `public.positions` as the first required baseline table
- local evidence identifies several adjacent legacy baseline tables that the app and generated types expect

Fail:

- local evidence does not prove authoritative DDL for the legacy baseline
- local evidence does not prove legacy constraints, indexes, defaults, RLS, policies, grants, or triggers
- generated types are useful shape evidence, but they are not a reviewed schema migration source

Decision: a safe baseline migration draft should not be created from local evidence alone.

## Strategy Recommendation

Recommended next strategy: escalate to a separate explicit schema-only baseline gate.

That gate should authorize one of the following before any new staging apply:

1. Use an existing trusted schema-only artifact if one exists.
2. Produce a sanitized schema-only dump from a trusted environment under a separate approval gate.
3. Convert the reviewed baseline into a source-controlled baseline migration draft.
4. Recreate or reinitialize `ture-staging` only after the baseline migration chain is complete and separately approved.

Do not retry `supabase db push`, `supabase migration up`, `supabase db reset`, or migration repair until the baseline is source-controlled and reviewed.

## Strategy Options

| Strategy | Status | Notes |
| --- | --- | --- |
| Create a source-evidenced baseline migration draft | Not ready | Local evidence can seed a draft outline, but cannot safely define authoritative DDL |
| Escalate to explicit production/trusted schema-only dump approval | Recommended | Must be schema-only, no data, no secrets, no production writes |
| Recreate staging after baseline reconstruction | Future-only | Appropriate only after complete reviewed baseline migrations exist |
| Stop because local evidence is insufficient | Current safe state | Apply remains blocked until schema-only baseline evidence is approved |

## Required Preconditions Before Any Future Apply

- Target remains exactly `pdvzyuhykomwfqyyztru`.
- Target remains `ture-staging`.
- Production remains excluded.
- Backup/rollback expectations remain understood.
- Migration scope is explicit: full chain after baseline reconstruction.
- A reviewed baseline migration or trusted schema-only baseline exists.
- No runtime/API/UI write path is activated.

## Forbidden In This Action

Forbidden and not run:

```bash
supabase db push
supabase migration up
supabase db reset
```

Also forbidden and not done:

- migration repair
- marking migrations as applied
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

Confirmed for Action 411:

- no migration apply
- no migration repair
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

`post_trade_supabase_baseline_schema_reconstruction_plan_requires_schema_only_dump_gate_no_apply`
