# Historical Candle Storage Migration Verification

This runbook covers the manual verification path for the historical candle
storage migration:

- `supabase/migrations/20260709000000_create_historical_candle_storage.sql`

The migration creates storage schema only. It must not be interpreted as
approval to fetch historical candles, persist candles from runtime, generate
synthetic outcomes, run backfill replay, change scanner behavior, change live
ranking, or enable broker/execution behavior.

## What The Migration Creates

Primary table:

- `public.historical_candles`

Fetch audit table:

- `public.historical_candle_fetch_runs`

The migration also defines:

- Unique key on `provider, ticker, interval, timestamp, adjusted`.
- OHLC shape checks.
- Non-negative `volume`, count, cache hit, cache miss, and provider credit
  checks.
- Indexes for ticker/interval/timestamp, provider/ticker/trading day,
  interval/timestamp, fetch runs, validation status, cache key, and
  trading-day/interval lookup.
- RLS enabled on both tables with no client read or write policies.

## Safe Apply Checklist

Before applying:

- Confirm the target Supabase project and environment.
- Confirm the migration diff only creates `historical_candles` and
  `historical_candle_fetch_runs`.
- Confirm there are no `insert`, `update`, `delete`, `copy`, provider calls,
  functions, triggers, grants, or permissive policies.
- Confirm a rollback plan exists for dropping the two tables if the migration
  was applied to the wrong environment before data is written.

Example status/apply commands, to run manually from an approved shell:

```bash
supabase migration list
supabase db push
supabase migration list
```

Do not paste secrets into terminals or docs. Use the project’s established
Supabase authentication flow.

## Manual Verification SQL

Table existence:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'historical_candles',
    'historical_candle_fetch_runs'
  )
order by table_name;
```

Unique key / constraints:

```sql
select conname, contype
from pg_constraint
where conrelid in (
  'public.historical_candles'::regclass,
  'public.historical_candle_fetch_runs'::regclass
)
order by conrelid::text, conname;
```

Indexes:

```sql
select tablename, indexname
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'historical_candles',
    'historical_candle_fetch_runs'
  )
order by tablename, indexname;
```

RLS:

```sql
select relname, relrowsecurity
from pg_class
where oid in (
  'public.historical_candles'::regclass,
  'public.historical_candle_fetch_runs'::regclass
)
order by relname;
```

Client policies:

```sql
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'historical_candles',
    'historical_candle_fetch_runs'
  )
order by tablename, policyname;
```

Expected policy result for this phase: no anon/authenticated/client read or
write policies.

## Diagnostics Expectations

Before runtime DB schema inspection is wired, Market Diagnostics may show:

- `Migration applied: unknown`
- `historical_candles table detected: unknown`
- `historical_candle_fetch_runs table detected: unknown`
- `Unique key detected: unknown`
- `Indexes detected: unknown`
- `RLS enabled: unknown`
- `Client writes allowed: unknown`
- `Client reads allowed: unknown`

After safe server-side schema readback confirms the migration:

- `Migration applied: yes`
- `historical_candles table detected: yes`
- `historical_candle_fetch_runs table detected: yes`
- `Unique key detected: yes`
- `Indexes detected: yes`
- `RLS enabled: yes`
- `Client writes allowed: no`
- `Client reads allowed: no`

These must remain false after applying the migration:

- `provider_fetch_added=false`
- `historical_fetch_added=false`
- `candles_persisted=false`
- `synthetic_outcomes_persisted=false`
- `scanner_behavior_changed=false`
- `live_ranking_changed=false`
- `ready_to_fetch_historical_data=false`
- `ready_to_persist_candles=false`
- `ready_to_use_for_backfill=false`
- `ready_to_use_for_scanner=false`

## Rollback Notes

If the migration is applied to the wrong environment before any candle data is
written, the rollback is to drop the two new tables in dependency order:

```sql
drop table if exists public.historical_candles;
drop table if exists public.historical_candle_fetch_runs;
```

If any historical candle rows exist, pause and review references first. Old
candles should not be deleted if future synthetic outcomes or audit records
reference them.
