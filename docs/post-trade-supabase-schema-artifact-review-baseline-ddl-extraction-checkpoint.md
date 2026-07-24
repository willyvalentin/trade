# Post-Trade Supabase Schema Artifact Review And Baseline DDL Extraction Checkpoint

## Summary

Purpose: review the production schema-only/no-data artifact from Action 419 and extract the authoritative baseline DDL scope needed for a future staging baseline migration draft.

Result: artifact review is complete; baseline DDL evidence is sufficient for a future source-controlled staging baseline migration draft.

Decision: `post_trade_supabase_schema_artifact_review_baseline_ddl_extraction_ready_for_baseline_draft`.

## Source Artifact

Local review artifact:

```text
tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql
```

Artifact status:

- schema-only review artifact
- 51506 bytes
- local-only under `tmp/`
- not committed
- not approved for commit
- no production data included in docs

## Artifact Safety Review

Strict no-data scan:

```bash
rg -n "postgres://|postgresql://|INSERT INTO|COPY public|COPY .* FROM stdin" tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql
```

Result: no matches.

Broader sensitivity scan included connection string, password, token, JWT, secret, and key markers. The only relevant hit was a schema comment warning not to store secrets or raw broker/browser artifacts. No DB URL, password, service role key value, anon key value, token, cookie, session value, connection string, inserted row, or `COPY` row export was identified.

The artifact remains acceptable for local DDL review only.

## Baseline Objects Required Before Existing Migrations

The first local migration is:

```text
supabase/migrations/20260520000000_add_execution_metadata_to_positions.sql
```

It runs:

```sql
alter table public.positions
add column if not exists execution_metadata jsonb;
```

Therefore `public.positions` must exist before the local migration chain can run.

The schema artifact shows these legacy baseline tables are required or adjacent to the first migration and should be considered for the future baseline draft:

- `public.positions`
- `public.position_updates`
- `public.recommendations`
- `public.user_settings`
- `public.scanner_cache`
- `public.scheduled_scan_runs`
- `public.market_calendar_cache`
- `public.market_regime_snapshots`

## Extracted Baseline Table Scope

### `public.positions`

Evidence: production schema-only artifact contains `CREATE TABLE IF NOT EXISTS "public"."positions"`.

Required before existing migrations: yes.

Key extracted shape:

- `id uuid default gen_random_uuid() not null`
- `recommendation_id uuid`
- `created_at timestamptz default now()`
- `ticker text not null`
- `company_name text`
- `entry_price numeric not null`
- `position_size numeric`
- `current_stop numeric`
- `target_1 numeric`
- `target_2 numeric`
- `status text default 'open' not null`
- `latest_recommendation text`
- `exit_price numeric`
- `closed_at timestamptz`
- `pnl numeric`
- `pnl_percent numeric`
- `r_multiple numeric`
- `exit_notes text`
- `execution_metadata jsonb`

Constraints and relationships:

- primary key: `positions_pkey`
- foreign key: `positions_recommendation_id_fkey` to `public.recommendations(id)` with `ON DELETE SET NULL`

RLS/policies/grants:

- RLS enabled on `public.positions`
- public insert/read/update policies present in the artifact
- table grants present for `anon`, `authenticated`, and `service_role` roles

### `public.position_updates`

Evidence: production schema-only artifact contains `CREATE TABLE IF NOT EXISTS "public"."position_updates"`.

Required before existing migrations: yes, because it is a legacy position-adjacent table with a foreign key to `public.positions`.

Key extracted shape:

- `id uuid default gen_random_uuid() not null`
- `position_id uuid`
- `created_at timestamptz default now()`
- `action text not null`
- `recommendation text`
- `explanation text`
- `new_stop numeric`

Constraints and relationships:

- primary key: `position_updates_pkey`
- foreign key: `position_updates_position_id_fkey` to `public.positions(id)` with `ON DELETE CASCADE`

RLS/policies/grants:

- RLS enabled on `public.position_updates`
- public insert/read policies present in the artifact
- table grants present for `anon`, `authenticated`, and `service_role` roles

### `public.recommendations`

Evidence: production schema-only artifact contains `CREATE TABLE IF NOT EXISTS "public"."recommendations"`.

Required before existing migrations: yes, because `public.positions.recommendation_id` references it.

Key extracted shape:

- `id uuid default gen_random_uuid() not null`
- `created_at timestamptz default now()`
- `session_type text default 'morning' not null`
- `ticker text not null`
- `company_name text`
- `direction text default 'long' not null`
- `setup_type text`
- `entry_low numeric`
- `entry_high numeric`
- `stop_loss numeric`
- `target_1 numeric`
- `target_2 numeric`
- `risk_reward numeric`
- `confidence text`
- `timeframe text`
- `thesis text`
- `invalidation text`
- `reason_to_avoid text`
- `status text default 'new' not null`
- `archived boolean default false not null`

Constraints and relationships:

- primary key: `recommendations_pkey`

RLS/policies/grants:

- RLS enabled on `public.recommendations`
- public insert/read/update policies present in the artifact
- table grants present for `anon`, `authenticated`, and `service_role` roles

### Other Legacy Baseline Tables

The artifact also provides authoritative DDL for these legacy baseline tables:

- `public.user_settings`
- `public.scanner_cache`
- `public.scheduled_scan_runs`
- `public.market_calendar_cache`
- `public.market_regime_snapshots`

Evidence includes their `CREATE TABLE`, primary key constraints, unique indexes where present, RLS enablement where present, policies where present, and grants.

These objects are not directly required by the first `positions` migration, but they appear to be part of the pre-existing baseline schema and should be included in a future baseline draft if the goal is to reconstruct staging from the production baseline rather than only satisfy the first migration.

## Functions And Triggers

No `CREATE FUNCTION`, `CREATE OR REPLACE FUNCTION`, or `CREATE TRIGGER` statements were identified in the artifact.

No functions or triggers should be added to the baseline draft unless a later separate review finds explicit local/source evidence.

## Later Post-Baseline Migration Objects

These objects are already represented by source-controlled migrations and should not be included in the future baseline draft:

- `public.recommendation_snapshots`
- `public.recommendation_outcomes`
- `public.recommendation_scan_runs`
- `public.recommendation_batches`
- `public.execution_lifecycle_events`
- `public.execution_agent_runs`
- `public.execution_agent_progress_events`
- `public.execution_records`
- `public.execution_record_audit_events`
- `public.scheduled_scan_attempts`
- `public.symbol_metadata`
- `public.execution_confirmation_evidence`
- `public.execution_settlement_reviews`
- `public.execution_cost_breakdowns`
- `public.execution_deviation_reviews`
- `public.execution_learning_candidates`
- `public.execution_redacted_artifacts`

Those tables belong to the existing migration chain or the post-trade persistence draft and must remain outside the baseline reconstruction draft to avoid duplicating later migration ownership.

## Objects Not Approved For Baseline Draft

Do not include in the baseline draft:

- production data
- row exports
- seed data
- raw broker artifacts
- raw browser artifacts
- credentials
- cookies
- sessions
- BankID values
- service role keys
- anon key values
- connection strings
- any table already created by a later source-controlled migration
- any grants/policies/functions/triggers not present in the reviewed artifact or source-controlled evidence

## Pass/Fail Decision

Pass: the artifact provides sufficient authoritative DDL evidence to create a future source-controlled staging baseline migration draft for legacy baseline tables.

Fail condition not met: no further production schema review is required before drafting the baseline, provided the draft uses only the reviewed schema-only artifact and stays limited to baseline objects.

## Remaining Gates

- Create a baseline migration draft under a separate action.
- Review that draft before any staging apply.
- Keep staging apply blocked until a separate explicit approval gate.
- Keep production writes blocked.
- Keep runtime/API/UI execution blocked.
- Keep Avanza/browser automation blocked.
- Keep Supabase real write paths blocked until a separate explicit gate.

## Safety Confirmation

Confirmed for Action 420:

- no production connection
- no staging schema/data command
- no data dump
- no row export
- no migration apply
- no migration repair
- no migration marking
- no DB write
- no Supabase write
- no production state touch
- no staging state touch
- no raw schema artifact commit
- no secrets printed or stored
- no API activation
- no Trade UI execution
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_schema_artifact_review_baseline_ddl_extraction_ready_for_baseline_draft`
