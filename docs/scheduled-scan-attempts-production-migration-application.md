# scheduled_scan_attempts Production Migration Application

## Purpose

Action 969 applied the missing `scheduled_scan_attempts` Production migration.

This was a targeted schema fix for the missing Production diagnostics table.
No runtime code, broker/Avanza behavior, automatic order behavior, provider
calls, scan routes, audit writer paths, or unrelated schema objects were
changed.

Result status:
`scheduled_scan_attempts_production_migration_applied`

Follow-up status: Action 970 created
`docs/production-console-cleanliness-after-scheduled-scan-migration.md` with
result status `production_console_new_blocker_after_scheduled_scan_migration`.

Follow-up status: Action 971 created
`docs/production-console-manual-observation-after-scheduled-scan-migration.md`
with result status `production_console_manual_observation_blocked`.

Follow-up status: Action 972 created
`docs/recommendation-snapshots-500-production-triage.md` with result status
`recommendation_snapshots_500_production_triage_created`.

Follow-up status: Action 973 created
`docs/recent-recommendation-readback-stabilization-patch.md` with result
status `recent_recommendation_readback_stabilization_patch_implemented`.

Follow-up status: Action 974 created
`docs/recent-recommendation-readback-production-verification.md` with result
status
`recent_recommendation_readback_production_verified_with_expected_warning`.

Recommended next action: Action 975 - Prepare Market-Window Dry Run.

## Pre-Migration Review

Migration file inspected:

```text
supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql
```

Target Production project:

- Supabase project name: Trade;
- project ref: `ekdyopdrrkphlrsilyoo`;
- URL: `https://ekdyopdrrkphlrsilyoo.supabase.co`;
- dashboard context: Valentin Labs / Trade / main / Production.

Migration scope:

- creates `public.scheduled_scan_attempts` if missing;
- creates indexes for `trading_date desc`, `utc_timestamp desc`, and
  `(official_window, outcome)`;
- adds table and column comments;
- relies on primary key `id` and unique `attempt_fingerprint`;
- does not include RLS enablement, policies, grants, triggers, data inserts,
  updates, deletes, drops, truncates, or unrelated schema changes.

Destructive statements: no.

Migration contents were unchanged.

Backup/rollback note: risk is low because the migration creates a missing
diagnostics table and indexes. Rollback/backout would require separately
approved removal/repair; no rollback was performed in this action.

## Migration Execution

CLI version:

```text
Supabase CLI 2.107.0
```

First, a scoped `db push` dry-run was attempted:

```sh
supabase db push --linked --dry-run
```

Result: not used for apply. The dry-run reported older local migrations would
need `--include-all`, which would have applied unrelated migrations outside
the Action 969 approval. This path was stopped.

Approved narrow execution method:

```sh
supabase db query --linked --file supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql
```

Execution timestamp: `2026-06-28 04:12:34 CEST`.

Result: success.

Warnings:

- Supabase CLI printed its standard untrusted database-output boundary warning.
- Supabase CLI reported a newer CLI version is available.
- During later parallel read-only verification, two concurrent metadata
  queries hit temporary pooler authentication throttling and were cancelled.
  Serial verification then succeeded.

No credentials, service-role values, anon key values, or database passwords
were printed.

## Post-Migration Schema Verification

Pre-apply table check:

```text
to_regclass('public.scheduled_scan_attempts') = null
```

Post-apply table check:

```text
to_regclass('public.scheduled_scan_attempts') = scheduled_scan_attempts
```

Required columns verified present:

- `id`;
- `attempt_fingerprint`;
- `trading_date`;
- `source`;
- `mode`;
- `outcome`;
- `allowed`;
- `route_received_at`;
- `scheduled_function_fired_at`;
- `utc_timestamp`;
- `ny_timestamp`;
- `official_window`;
- `intraday_scan_window`;
- `orchestration_decision`;
- `skip_reason`;
- `message`;
- `http_status`;
- `raw_count`;
- `ranked_count`;
- `selected_count`;
- `built_count`;
- `published_count`;
- `recommendations_created`;
- `batch_fingerprint`;
- `scan_run_fingerprint`;
- `scheduled_scan_run_id`;
- `payload_json`;
- `created_at`;
- `updated_at`.

`utc_timestamp` verified present as `timestamp with time zone`, not nullable,
default `now()`.

Constraints verified:

- primary key: `scheduled_scan_attempts_pkey`;
- unique constraint: `scheduled_scan_attempts_attempt_fingerprint_key`.

Indexes verified:

- `scheduled_scan_attempts_attempt_fingerprint_key`;
- `scheduled_scan_attempts_pkey`;
- `scheduled_scan_attempts_trading_date_idx`;
- `scheduled_scan_attempts_utc_timestamp_idx`;
- `scheduled_scan_attempts_window_outcome_idx`.

RLS verification:

- `relrowsecurity`: `false`;
- `relforcerowsecurity`: `false`.

Migration history status: not updated through `supabase db push`, because that
path would have required unrelated older migrations. The approved application
used the exact SQL file against the linked Production project. If migration
history reconciliation is required later, it needs a separate approval.

## Production Console Verification

Production REST check:

```text
GET /rest/v1/scheduled_scan_attempts?select=id,utc_timestamp&limit=1
```

Result:

```text
HTTP 200
[]
```

This verifies the original table REST 404 is no longer present at the
Supabase REST endpoint. The empty array is expected because no
`scheduled_scan_attempts` rows have been inserted yet.

Full Production browser console cleanliness was not manually rechecked in this
action.

Action 970 follow-up: Codex could not complete the deployed app browser-console
observation because the Production app URL was not recorded in repo docs/local
deploy metadata and browser automation could not attach to an existing tab.
The Action 969 REST-level evidence still shows the table endpoint returns HTTP
200, but deployed app console cleanliness remains blocked pending manual
operator evidence or a Production app URL.

Recommendation UI was not invoked by Codex. No scan route, provider route, or
live market route was called.

Broker/Avanza and automatic order behavior remain absent.

## Production Keep/Rollback Decision

Decision: keep Production online, migration verified.

Rollback is not required because:

- the migration succeeded;
- `public.scheduled_scan_attempts` now exists;
- required columns, constraints, and indexes are present;
- REST now returns HTTP 200 for the table;
- no unsafe execution behavior was introduced.

## Live-Trial Decision

Production data health is much cleaner because the
`scheduled_scan_attempts` REST 404 is resolved at the Supabase REST endpoint.

Live market trial still requires final market-window dry-run/readiness
checklist and Production console cleanliness verification before go.

Broker/Avanza behavior and automatic order behavior remain absent.

## Not Performed

- No runtime code change.
- No unrelated migration.
- No type generation.
- No generated type edit.
- No provider call.
- No scan route invocation.
- No live market scan.
- No service-role adapter call from app code.
- No audit writer client/UI/market/scanner invocation.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No trade/stats/PnL mutation.
- No `.env.local` changes.

## Action 970 Follow-Up

Action 970 result status:
`production_console_new_blocker_after_scheduled_scan_migration`.

The blocker is verification access only: the deployed app console was not
observed because the Production app URL was not available to Codex and browser
automation could not inspect an already-open tab. No new runtime console error
was confirmed in Action 970.

Completed follow-up: Action 971 - Provide Production App URL And Manual
Console Observation After scheduled_scan_attempts Migration.

## Action 971 Follow-Up

Action 971 result status:
`production_console_manual_observation_blocked`.

Action 971 did not provide the Production app URL or manual browser-console
evidence. The Action 969 REST-level `scheduled_scan_attempts` fix remains
verified, but deployed app console cleanliness still requires operator
evidence.

Recommended next action: Action 972 - Provide Production Console Manual
Observation Evidence.

## Action 972 Follow-Up

Action 972 result status:
`recommendation_snapshots_500_production_triage_created`.

Operator evidence after the migration confirms the deployed Production console
no longer shows the `scheduled_scan_attempts` 404. The remaining visible
Production Supabase console blocker is `recommendation_snapshots` HTTP 500 for
operation `select_recent_recommendation_snapshots`.

Recommended next action: Action 973 - Reduce recommendation_snapshots Recent
Read Limit and Add Fail-Soft Guard.

## Action 973 Follow-Up

Action 973 result status:
`recent_recommendation_readback_stabilization_patch_implemented`.

The scheduled scan attempts migration remains unchanged. Action 973 only
stabilized recent recommendation readback limits and fail-soft fallback
behavior for `recommendation_snapshots` and `recommendation_outcomes`.

## Action 974 Follow-Up

Action 974 result status:
`recent_recommendation_readback_production_verified_with_expected_warning`.

Latest operator evidence confirms the deployed Production console no longer
shows the `scheduled_scan_attempts` 404. Production can remain online with the
expected non-fatal `recommendation_batch_backfill_capped` warning.

## Validation Results

Validation was run after documentation updates:

- Migration file was inspected before apply.
- Only `20260625000000_create_scheduled_scan_attempts.sql` was applied.
- Runtime denial harness syntax/import checks passed.
- Static audit writer runtime path import search passed.
- Static route invocation search did not call routes.
- UI/app-shell audit writer import scan passed.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved guardrails and
  documentation references only; no service-role values were printed.
- Scheduled-migration-specific scan returned expected docs, local migration,
  client read path, and server upsert path references only.
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
