# Post-Trade Supabase Staging Baseline Migration Draft, No Apply

## Summary

Purpose: create a source-controlled staging baseline migration draft from the reviewed production schema-only/no-data artifact and Action 420 baseline DDL extraction.

Result: baseline migration draft created and guarded by static tests. No migration was applied.

Decision: `post_trade_supabase_staging_baseline_migration_draft_ready_no_apply`.

## Source Evidence

Reviewed local artifact:

```text
tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql
```

Artifact status:

- local review-only
- not committed
- not moved from `tmp/`
- verified schema-only/no-data in Action 419 and Action 420
- used only as DDL evidence for the source-controlled baseline draft

## Created Draft Migration

New source-controlled draft:

```text
supabase/migrations/20260519000000_create_legacy_baseline_schema_draft.sql
```

Ordering:

- `20260519000000_create_legacy_baseline_schema_draft.sql`
- `20260520000000_add_execution_metadata_to_positions.sql`

The baseline draft is intentionally ordered before `20260520000000_add_execution_metadata_to_positions.sql`, because that first existing migration runs `alter table public.positions` and therefore requires `public.positions` to already exist.

## Included Baseline Objects

The draft includes only the legacy baseline objects identified from the reviewed schema-only artifact:

- `public.recommendations`
- `public.positions`
- `public.position_updates`
- `public.user_settings`
- `public.scanner_cache`
- `public.scheduled_scan_runs`
- `public.market_calendar_cache`
- `public.market_regime_snapshots`

Included evidenced baseline details:

- table definitions
- primary key constraints
- evidenced unique constraints/indexes
- `positions` to `recommendations` foreign key
- `position_updates` to `positions` foreign key
- evidenced RLS enablement
- evidenced broad legacy policies
- evidenced table grants for standard Supabase roles

No functions or triggers were included because none were identified in the reviewed artifact.

## Excluded Later Migration-Owned Objects

The draft explicitly excludes objects that are already owned by later source-controlled migrations:

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

These remain in their existing migration files and must not be duplicated in the baseline draft.

## Static Test Coverage

New static test:

```text
tests/e2e/post-trade-supabase-baseline-migration-draft-static.spec.ts
```

Coverage:

- baseline migration exists before `20260520000000`
- baseline includes required legacy baseline tables
- baseline excludes later migration-owned tables
- baseline includes required constraints, indexes, relationships, RLS, policies, and grants
- baseline contains no `INSERT INTO`
- baseline contains no `COPY public`
- baseline contains no `COPY ... FROM stdin`
- baseline contains no obvious connection strings or secret markers
- baseline contains no functions or triggers
- test source remains isolated from Supabase clients, app runtime, bridge/browser, credentials, sessions, env access, scripts, and Trade UI runtime

## No-Data Confirmation

The draft contains:

- no production data
- no rows
- no `INSERT INTO`
- no `COPY` table data
- no raw schema artifact content beyond the selected baseline DDL
- no DB URLs
- no passwords
- no service role key values
- no anon key values
- no tokens
- no cookies
- no sessions
- no JWT secrets
- no connection strings

## Remaining Gates

Still required before any staging initialization retry:

- separate baseline migration draft review
- explicit staging apply approval
- target confirmation that local Supabase CLI remains `ture-staging` / `pdvzyuhykomwfqyyztru`
- confirmation that production is excluded
- confirmation that staging is empty/disposable or otherwise approved for initialization
- safe migration-history strategy approval

Production writes remain blocked. Runtime/API/UI execution remains blocked. Avanza/browser automation remains blocked. Supabase real write paths remain blocked until a separate explicit gate.

## Safety Confirmation

Confirmed for Action 421:

- no production connection
- no staging schema/data command
- no migration apply
- no migration repair
- no migration marking
- no DB write
- no Supabase write
- no staging apply
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

`post_trade_supabase_staging_baseline_migration_draft_ready_no_apply`
