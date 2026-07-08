# Post-Trade Supabase Production Schema-Only Dump Retry With Docker Result, No Data

## Summary

Purpose: retry the approved production schema-only/no-data baseline dump with Docker running, then restore the local Supabase CLI target to staging.

Result: production schema-only dump succeeded, no table data or rows were exported, and local Supabase CLI metadata was relinked back to staging.

Decision: `post_trade_supabase_production_schema_only_dump_retry_with_docker_succeeded_no_data`.

## Approved Scope

- Production target: `Trade` / `ekdyopdrrkphlrsilyoo`
- Staging target to restore afterward: `ture-staging` / `pdvzyuhykomwfqyyztru`
- Authorized operation: production schema-only baseline dump/inspection only
- Not authorized: data dump, row export, production mutation, staging mutation, migration apply, migration repair, DB write, Supabase write, staging apply, runtime/API/UI activation, Trade UI execution, Avanza/browser automation, credential/session/BankID handling, order behavior, live trade mutation, or live position mutation

## Execution Result

Docker readiness was verified before production relink:

```bash
docker info --format '{{.ServerVersion}}'
```

Result:

```text
29.6.1
```

The local Supabase CLI target started on staging:

```text
pdvzyuhykomwfqyyztru
```

The CLI target was temporarily relinked to production for the schema-only dump:

```bash
supabase link --project-ref ekdyopdrrkphlrsilyoo
```

The target was verified as production before dump:

```text
ekdyopdrrkphlrsilyoo
```

Schema-only/no-data dump command:

```bash
supabase db dump --linked --schema public --file tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql
```

Result:

```text
Dumped schema to /Users/willysimonsson/Dev/trade/tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql.
```

The local Supabase CLI target was then relinked back to staging:

```bash
supabase link --project-ref pdvzyuhykomwfqyyztru
```

Final local target verification:

```text
pdvzyuhykomwfqyyztru
```

## Artifact Handling

Local review artifact:

```text
tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql
```

Artifact size:

```text
51506 bytes
```

The artifact is local review-only and under `tmp/`, so it is not intended to be committed. It may be used as the authoritative schema-only source for a future staging baseline migration draft under a separate gate.

## No-Data And Sensitivity Review

Strict row/export marker scan was run against the artifact:

```bash
rg -n "postgres://|postgresql://|INSERT INTO|COPY public|COPY .* FROM stdin" tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql
```

Result: no matches.

The artifact was also reviewed for broader sensitive markers. Matches were limited to schema text such as comments, column names, and role grants; no database URL, password, token, cookie, connection string, inserted rows, or `COPY` row export was identified.

## Baseline DDL Extracted

The schema-only artifact contains authoritative DDL for the baseline objects needed before the existing local migration chain can run, including:

- `public.positions`
- `public.position_updates`
- `public.recommendations`
- `public.user_settings`
- `public.scanner_cache`
- `public.scheduled_scan_runs`
- `public.market_calendar_cache`
- `public.market_regime_snapshots`

The artifact also contains primary keys, indexes, foreign keys, RLS enablement, policies, and grants for these objects where present in the schema dump.

This is sufficient evidence for a future source-controlled staging baseline migration draft, but no baseline migration was created in this action and no staging apply was performed.

## Safety Confirmation

Confirmed for Action 419:

- production connection was limited to schema-only/no-data dump
- no table data was dumped
- no rows were exported
- no production mutation occurred
- no staging mutation occurred
- no migration apply occurred
- no migration repair occurred
- no DB write occurred
- no Supabase write occurred
- no staging apply occurred
- no secrets were printed or stored
- no API activation occurred
- no Trade UI execution occurred
- no Avanza/browser automation occurred
- no credential/session/BankID handling occurred
- no order behavior occurred
- no live trade mutation occurred
- no live position mutation occurred

## Remaining Gates

- Staging initialization remains blocked until a reviewed baseline migration draft is created and separately approved.
- Production writes remain blocked.
- Runtime/API/UI execution remains blocked.
- Avanza/browser automation remains blocked.
- Supabase real write paths remain blocked until a separate explicit gate.

## Final Decision

`post_trade_supabase_production_schema_only_dump_retry_with_docker_succeeded_no_data`
