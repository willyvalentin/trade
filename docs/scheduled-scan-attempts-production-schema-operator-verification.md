# scheduled_scan_attempts Production Schema Operator Verification

## Purpose

Action 968 completes operator-backed Supabase Dashboard verification for
`scheduled_scan_attempts`.

This action is documentation/verification only. No DB/schema mutation was
performed, no migration was applied, and no runtime code was changed.

Result status:
`scheduled_scan_attempts_schema_missing_in_production`

Follow-up status: Action 969 created
`docs/scheduled-scan-attempts-production-migration-application.md` with result
status `scheduled_scan_attempts_production_migration_applied`.

Follow-up status: Action 970 created
`docs/production-console-cleanliness-after-scheduled-scan-migration.md` with
result status `production_console_new_blocker_after_scheduled_scan_migration`.

Follow-up status: Action 971 created
`docs/production-console-manual-observation-after-scheduled-scan-migration.md`
with result status `production_console_manual_observation_blocked`.

Recommended next action: Action 972 - Provide Production Console Manual
Observation Evidence.

## Operator Evidence Received

The operator provided Supabase Dashboard evidence with these findings:

- Supabase Dashboard screenshot was provided.
- Table Editor was open.
- Schema selected: `public`.
- Search query: `public.scheduled_scan_attempts`.
- Result: `No results found`.
- Recent public tables were visible, including:
  - `public.recommendation_scan_runs`;
  - `public.user_settings`;
  - `public.scheduled_scan_runs`.

This evidence is sufficient to conclude that
`public.scheduled_scan_attempts` is missing from the checked Production
Supabase project.

## Production Project Identity

Operator context indicates the checked project appears to be the Production
Supabase project for Valentin Labs / Trade.

Previously observed Production browser console Supabase URL:

```text
https://ekdyopdrrkphlrsilyoo.supabase.co
```

Project identity is strongly supported by the operator-provided dashboard
context and the current Production console URL. Before applying the migration,
the operator should recheck that the Dashboard project ref matches
`ekdyopdrrkphlrsilyoo`.

No `.env.local` changes were made.

## Table/View Existence

| Item | Result |
| --- | --- |
| Schema searched | `public` |
| Object searched | `public.scheduled_scan_attempts` |
| Dashboard result | No results found |
| Existence result | Missing |
| Table/view type | Not applicable because the object is missing |

## Migration History

Repo migration exists:

```text
supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql
```

Production migration application status: likely not applied, or Production has
schema drift relative to the repo.

Dashboard migration history was not directly verified in the provided evidence.
Do not apply or mark any migration without a separate approved Action 969
execution path.

## Column/Schema Match

Production column/schema match is not verifiable because
`public.scheduled_scan_attempts` is missing.

Expected schema should be taken from:

```text
supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql
```

That migration defines the expected table, primary key, unique
`attempt_fingerprint` conflict target, indexes, comments, and columns used by
the app read path and server automation upsert path.

## REST/API Exposure

The Production REST 404 is explained by the missing table:

```text
/rest/v1/scheduled_scan_attempts
```

REST/API exposure cannot be verified until the table exists. If the table is
created and 404 persists later, the next verification should inspect
PostgREST/API exposure, exposed schemas, and schema cache.

## RLS/Policies

RLS and policy state cannot be verified because the table is missing.

RLS is unlikely to explain the current 404 while the table is absent. Policies
should be verified after migration application if the migration or follow-up
schema design includes RLS.

## Decision Tree Result

Decision tree result: table missing / migration not applied.

Status:
`scheduled_scan_attempts_schema_missing_in_production`

Previous recommended next action: Action 969 - Apply scheduled_scan_attempts Production
Migration.

Completed follow-up: Action 969 - Apply scheduled_scan_attempts Production
Migration.

Action 969 applied the exact migration SQL file to Production and verified
that `public.scheduled_scan_attempts` now exists with required columns,
constraints, indexes, and REST HTTP 200.

Completed follow-up: Action 970 - Verify Production Console Cleanliness After
scheduled_scan_attempts Migration.

Action 970 blocked on deployed app console observation access. The REST-level
404 fix remains verified from Action 969, but the deployed browser console
still needs operator evidence or a Production app URL.

Completed follow-up: Action 971 - Provide Production App URL And Manual
Console Observation After scheduled_scan_attempts Migration.

Completed follow-up: Action 971 - Provide Production App URL And Manual
Console Observation After scheduled_scan_attempts Migration.

Action 971 did not provide the Production app URL or manual console evidence.
Recommended next action: Action 972 - Provide Production Console Manual
Observation Evidence.

## Production Decision

Production decision: keep Production online with warnings.

Rollback is not required while:

- the app shell remains usable;
- Recommendations page renders;
- the previous recommendation batch timeout remains gone;
- the previous `recommendation_snapshots` HTTP 500 remains gone;
- the remaining visible issue is the `scheduled_scan_attempts` diagnostics
  table 404;
- no service-role/env exposure appears;
- no unsafe broker/Avanza behavior appears;
- no automatic order behavior appears.

Live market trial remains no-go until the Production migration is applied and
verified, or the remaining warning is explicitly accepted as non-critical.

## Not Performed

- No runtime code change.
- No DB/schema mutation.
- No migration.
- No migration status/apply command.
- No type generation.
- No generated type edit.
- No provider call.
- No route invocation.
- No scan invocation.
- No live market scan.
- No service-role adapter call.
- No audit writer client/UI/market/scanner invocation.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No trade/stats/PnL mutation.
- No `.env.local` changes.

## Validation Results

Validation was run after documentation updates:

- Runtime denial harness syntax/import checks passed.
- Static audit writer runtime path import search passed.
- Static route invocation search did not call routes.
- UI/app-shell audit writer import scan passed.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved guardrails and
  documentation references only; no service-role values were printed.
- Scheduled-schema-operator-verification-specific scan returned expected docs,
  local migration, client read path, and server upsert path references only.
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
