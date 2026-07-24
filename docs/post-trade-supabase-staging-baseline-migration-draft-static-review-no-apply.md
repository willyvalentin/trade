# Post-Trade Supabase Staging Baseline Migration Draft Static Review, No Apply

## Summary

Purpose: statically review the staging baseline migration draft before any staging initialization retry.

Result: static review passed; the draft is ready for a future initialization retry approval gate. No migration was applied.

Decision: `post_trade_supabase_staging_baseline_migration_draft_static_review_ready_for_initialization_retry_no_apply`.

## Reviewed Files

Baseline migration draft:

```text
supabase/migrations/20260519000000_create_legacy_baseline_schema_draft.sql
```

Next existing migration:

```text
supabase/migrations/20260520000000_add_execution_metadata_to_positions.sql
```

Static test:

```text
tests/e2e/post-trade-supabase-baseline-migration-draft-static.spec.ts
```

Raw schema artifact remains local-only under:

```text
tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql
```

The raw artifact was not moved, committed, or embedded in docs.

## Ordering Review

Pass.

The baseline draft is ordered before the first existing migration:

- `20260519000000_create_legacy_baseline_schema_draft.sql`
- `20260520000000_add_execution_metadata_to_positions.sql`

This resolves the previous blocker because `20260520000000_add_execution_metadata_to_positions.sql` runs:

```sql
alter table public.positions
add column if not exists execution_metadata jsonb;
```

The baseline draft creates `public.positions` before that migration can run.

## Baseline Table Coverage Review

Pass.

The draft includes the required extracted legacy baseline tables:

- `public.recommendations`
- `public.positions`
- `public.position_updates`
- `public.user_settings`
- `public.scanner_cache`
- `public.scheduled_scan_runs`
- `public.market_calendar_cache`
- `public.market_regime_snapshots`

The draft includes `public.recommendations` before `public.positions`, allowing the `positions_recommendation_id_fkey` relationship to be created from `public.positions(recommendation_id)` to `public.recommendations(id)`.

The draft includes `public.positions` before `public.position_updates`, allowing the `position_updates_position_id_fkey` relationship to be created from `public.position_updates(position_id)` to `public.positions(id)`.

## Later Migration-Owned Table Exclusion Review

Pass.

The draft excludes later migration-owned tables, including:

- recommendation snapshot/outcome/scan/batch tables
- execution lifecycle/agent/record/audit tables
- scheduled scan attempts
- symbol metadata
- post-trade persistence tables

Those objects remain owned by their existing source-controlled migrations and are not duplicated in the baseline draft.

## No-Data And Secret Review

Pass.

The baseline migration draft contains:

- no production data
- no rows
- no `INSERT INTO`
- no `COPY` table data
- no `COPY ... FROM stdin`
- no DB URLs
- no connection strings
- no passwords
- no service role key values
- no anon key values
- no tokens
- no cookies
- no sessions
- no JWT secrets

The reviewed artifact redaction/no-data scan also found no `postgres://`, `postgresql://`, `INSERT INTO`, `COPY public`, or `COPY ... FROM stdin` matches.

## Constraints, Indexes, RLS, Policies, Grants, And Triggers Review

Pass.

Included source-evidenced baseline constraints and indexes:

- primary keys for all included baseline tables
- `scanner_cache_ticker_key`
- `scheduled_scan_runs_unique_day_session`
- `market_calendar_cache_unique_date_provider`
- `positions_recommendation_id_fkey`
- `position_updates_position_id_fkey`

Included source-evidenced RLS/policies/grants:

- RLS enabled for baseline tables where the reviewed artifact showed it
- broad legacy public read/insert/update policies where present in the reviewed artifact
- table grants for standard Supabase roles where present in the reviewed artifact

Triggers:

- no triggers were included
- no triggers were identified in the reviewed artifact

Functions:

- no functions were included
- no functions were identified in the reviewed artifact

## Static Test Review

Pass.

The static test covers:

- migration ordering before `20260520000000`
- required legacy baseline table coverage
- later migration-owned table exclusion
- required constraints, indexes, and relationships
- RLS, policies, and grants for baseline tables
- no row data, raw dumps, functions, triggers, or obvious secrets
- isolated test imports with no Supabase client, app runtime, browser, bridge, credential, session, env, or Trade UI imports

No additional static test gap was found during this review.

## Remaining Gates

This review does not approve apply.

Before any staging initialization retry:

- explicit staging initialization retry approval is required
- target must remain `ture-staging` / `pdvzyuhykomwfqyyztru`
- production must remain excluded
- staging must be confirmed empty/disposable or otherwise explicitly approved for initialization
- migration-history strategy must be explicit

Production writes remain blocked. Runtime/API/UI execution remains blocked. Avanza/browser automation remains blocked. Supabase real write paths remain blocked until a separate gate.

## Safety Confirmation

Confirmed for Action 422:

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

`post_trade_supabase_staging_baseline_migration_draft_static_review_ready_for_initialization_retry_no_apply`
