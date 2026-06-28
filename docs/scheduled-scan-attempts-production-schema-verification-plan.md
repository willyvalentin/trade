# scheduled_scan_attempts Production Schema Verification Plan

## Purpose

Action 966 creates a Production schema verification plan for
`scheduled_scan_attempts`.

This action is documentation/planning only. It does not run Supabase queries,
database reads/writes, migrations, provider calls, route calls, service-role
adapter calls, broker/Avanza behavior, or automatic order behavior.

Result status:
`scheduled_scan_attempts_production_schema_verification_plan_created`

Follow-up status: Action 967 created
`docs/scheduled-scan-attempts-production-schema-verification-results.md` with
result status `scheduled_scan_attempts_schema_verification_blocked`.

Recommended next action: Action 968 - Complete scheduled_scan_attempts
Production Schema Verification With Operator Dashboard Findings.

## Problem Summary

Production console still shows `scheduled_scan_attempts` HTTP 404 after Action
964 verified that the Action 963 recommendation batch fail-soft patch removed
the latest visible `recommendation_batches` timeout and
`recommendation_snapshots` HTTP 500.

The failing Production request is a Supabase REST read from:

```text
/rest/v1/scheduled_scan_attempts
```

The app expects to read recent rows ordered by `utc_timestamp` descending with
`limit(100)`. Static triage found:

- a migration that creates `public.scheduled_scan_attempts`;
- a normal app-load client read path in `app/trade-app.tsx`;
- a server automation route upsert path in
  `app/api/automation/run-scan/route.ts`.

Current likely causes are Production schema drift, missing migration, REST
schema exposure/cache mismatch, or a Production project/environment mismatch.

## Expected Schema From Migration

Migration file:
`supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql`.

Expected object:

- object type: table;
- schema: `public`;
- name: `scheduled_scan_attempts`.

Columns:

| Column | Type | Null/default |
| --- | --- | --- |
| `id` | `uuid` | primary key, default `gen_random_uuid()` |
| `attempt_fingerprint` | `text` | not null, unique |
| `trading_date` | `date` | null |
| `source` | `text` | not null, default `unknown` |
| `mode` | `text` | not null, default `scheduled` |
| `outcome` | `text` | not null, default `route_received` |
| `allowed` | `boolean` | null |
| `route_received_at` | `timestamptz` | null |
| `scheduled_function_fired_at` | `timestamptz` | null |
| `utc_timestamp` | `timestamptz` | not null, default `now()` |
| `ny_timestamp` | `text` | null |
| `official_window` | `text` | not null, default `unknown` |
| `intraday_scan_window` | `text` | null |
| `orchestration_decision` | `text` | null |
| `skip_reason` | `text` | null |
| `message` | `text` | null |
| `http_status` | `integer` | null |
| `raw_count` | `integer` | null |
| `ranked_count` | `integer` | null |
| `selected_count` | `integer` | null |
| `built_count` | `integer` | null |
| `published_count` | `integer` | null |
| `recommendations_created` | `integer` | null |
| `batch_fingerprint` | `text` | null |
| `scan_run_fingerprint` | `text` | null |
| `scheduled_scan_run_id` | `text` | null |
| `payload_json` | `jsonb` | not null, default `{}` |
| `created_at` | `timestamptz` | not null, default `now()` |
| `updated_at` | `timestamptz` | not null, default `now()` |

Constraints and conflict target:

- primary key: `id`;
- unique constraint: `attempt_fingerprint`;
- server route upsert conflict target: `attempt_fingerprint`.

Indexes:

- `scheduled_scan_attempts_trading_date_idx` on `trading_date desc`;
- `scheduled_scan_attempts_utc_timestamp_idx` on `utc_timestamp desc`;
- `scheduled_scan_attempts_window_outcome_idx` on
  `(official_window, outcome)`.

Migration comments:

- table comment describes the object as an append/update log for Netlify
  scheduled scan firings and automation route outcomes, separate from
  `scheduled_scan_runs`;
- `attempt_fingerprint` comment identifies it as the correlation key sent
  through `/api/automation/run-scan`.

Static migration review found no explicit RLS enablement, RLS policies, grants,
or REST exposure statements in this migration file. That absence should be
verified against the remote Production schema before any fix is chosen.

## App Read And Write Expectations

### Client Read Path

File: `app/trade-app.tsx`.

Normal app load/refresh calls:

```ts
supabase
  .from("scheduled_scan_attempts")
  .select("*")
  .gte("utc_timestamp", new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString())
  .order("utc_timestamp", { ascending: false })
  .limit(100)
```

Required read columns include at minimum:

- `attempt_fingerprint`;
- `utc_timestamp`;
- any additional columns consumed by `scheduledScanAttemptFromRow(...)`,
  including `trading_date`, `source`, `mode`, `outcome`, `allowed`,
  timestamps, counts, fingerprints, and `payload_json`.

Classification:

- side: client/browser;
- operation: read-only;
- trigger: normal app load/refresh;
- purpose: scheduled scan diagnostics/readiness, not direct trade execution;
- fallback: initial load can set attempts to an empty array when the read
  errors.

### Server Upsert Path

File: `app/api/automation/run-scan/route.ts`.

The server route builds a record with `buildScheduledScanAttemptRecord(...)`
and then calls:

```ts
supabase
  .from("scheduled_scan_attempts")
  .upsert(record, { onConflict: "attempt_fingerprint" })
```

Required write/upsert columns include:

- `attempt_fingerprint`;
- `trading_date`;
- `source`;
- `mode`;
- `outcome`;
- `allowed`;
- `route_received_at`;
- `scheduled_function_fired_at`;
- `utc_timestamp`;
- `official_window`;
- `intraday_scan_window`;
- `orchestration_decision`;
- `skip_reason`;
- `message`;
- `http_status`;
- scan counts;
- `recommendations_created`;
- `batch_fingerprint`;
- `scan_run_fingerprint`;
- `scheduled_scan_run_id`;
- `payload_json`.

Classification:

- side: server route;
- operation: mutation-capable upsert;
- trigger: only when `/api/automation/run-scan` is invoked;
- this plan does not invoke the route.

## Manual Verification Checklist

These steps are for an operator using the Supabase dashboard or another
separately approved database tool. Do not execute them as part of this action.

1. Confirm the Production Supabase project is the intended project for the
   deployed Production app.
2. Confirm the deployed Production app uses the expected Supabase URL/project.
3. Confirm migration history includes
   `20260625000000_create_scheduled_scan_attempts`.
4. Confirm `public.scheduled_scan_attempts` exists.
5. Confirm it is a table, not a view with a different name.
6. Confirm columns match the migration, especially `utc_timestamp` and
   `attempt_fingerprint`.
7. Confirm `attempt_fingerprint` is unique and can be used as the upsert
   conflict target.
8. Confirm indexes exist for `trading_date`, `utc_timestamp`, and
   `(official_window, outcome)`.
9. Confirm whether RLS is enabled on the table.
10. If RLS is enabled, confirm anon/client SELECT policy permits the intended
    read or decide to move/gate the read later.
11. Confirm server/service role can upsert with the expected conflict target.
12. Confirm the table is in a schema exposed through Supabase REST/PostgREST.
13. Refresh/reload PostgREST schema cache if the dashboard indicates stale
    schema state.
14. Verify whether `/rest/v1/scheduled_scan_attempts` still returns 404 after
    schema/cache checks.
15. Record findings before any migration, policy, env, or runtime change.

## Decision Tree

| Finding | Decision |
| --- | --- |
| Table is missing in Production | Prepare/apply the migration through the approved migration process. Do not run it without explicit approval. |
| Migration history lacks `20260625000000_create_scheduled_scan_attempts` | Prepare a migration application approval/action for Production or the correct target environment. |
| Table exists but REST still returns 404 | Check REST schema exposure, schema cache refresh, table name/schema, and deployed Supabase project URL. |
| Table exists and RLS blocks SELECT | Expect 401/403 more than 404, but create a focused RLS/policy plan if confirmed. |
| Table exists and app points to wrong Supabase project/env | Correct deploy/env configuration through the approved env process. |
| Table is intentionally optional diagnostics | Consider a separate runtime fail-soft/gating action for the client read on 404. |
| Server upsert cannot use `attempt_fingerprint` | Verify unique constraint and prepare schema correction under migration approval. |

## Risk Assessment

| Area | Risk | Notes |
| --- | --- | --- |
| App shell | Low | Production UI loads and can fall back to empty scheduled attempts. |
| Scheduled diagnostics/observability | Medium/high | Missing attempt rows hides scheduled scan firings, skips, failures, and empty-build diagnostics. |
| Recommendation generation | Low/medium | Core recommendations can render, but scheduled scan health is less observable. |
| Automation route observability | Medium/high | If the table is missing, route attempt upserts fail and same-window/duplicate diagnostics are degraded. |
| Audit writer safety | Low | This schema is unrelated to the audit writer runtime persistence path. |
| Execution/broker safety | Low | The scheduled scan attempts path does not place trades or invoke broker/Avanza behavior. |
| Live-trial readiness | Blocked | Trial remains no-go until this is fixed, reduced, or explicitly accepted as non-critical. |

## Recommended Next Action

Completed follow-up: Action 967 - Verify scheduled_scan_attempts Production
Schema in Supabase Dashboard.

Action 967 was blocked because no manual Supabase Dashboard findings or
read-only schema-inspection output were provided to Codex.

Recommended next action: Action 968 - Complete scheduled_scan_attempts
Production Schema Verification With Operator Dashboard Findings.

That next action may involve manual dashboard verification, but should still
avoid writing, migrating, route invocation, provider calls, or type generation
until findings are recorded and any needed fix has separate approval.

## Not Performed

- No runtime code changes.
- No Supabase query.
- No DB read/write.
- No migration.
- No migration status/apply command.
- No type generation.
- No generated type edits.
- No provider call.
- No route invocation.
- No scan invocation.
- No service-role adapter call.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No `.env.local` changes.

## Validation Results

Validation was run after documentation updates:

- Static code/migration/doc search completed.
- Runtime denial harness syntax/import checks passed.
- Static audit writer runtime path import search passed with existing
  server-only module references only.
- Static route invocation search did not call routes.
- UI/app-shell audit writer import scan passed.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved guardrails and
  documentation references only; no service-role values were printed.
- Scheduled-schema-plan-specific scan returned this plan, the expected
  migration, the client read path, the server upsert path, and approved
  docs/tests only.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy only.
- Dead-doc/path scan passed.
- Status string consistency scan passed.
- Next-action consistency scan passed.
- `git diff --check` passed.
- Touched-file trailing whitespace scan passed.
- Zero-byte docs check passed.
- `.env.local` diff check was clean.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.
