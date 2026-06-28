# scheduled_scan_attempts Production Schema Verification Results

## Purpose

Action 967 records the Production schema verification result for
`scheduled_scan_attempts`.

This action was documentation/verification tracking only. No Supabase
Dashboard evidence, SQL editor output, or operator dashboard findings were
provided to Codex in the action request, so Codex did not verify the remote
Production schema state.

Result status:
`scheduled_scan_attempts_schema_verification_blocked`

Recommended next action: Action 968 - Complete scheduled_scan_attempts
Production Schema Verification With Operator Dashboard Findings.

## Verification Scope

The requested verification target remains:

- object: `public.scheduled_scan_attempts`;
- environment: Production Supabase project used by the deployed app;
- expected migration:
  `supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql`;
- expected client read path: `app/trade-app.tsx`;
- expected server upsert path: `app/api/automation/run-scan/route.ts`.

## Dashboard Evidence Status

| Checklist item | Result | Notes |
| --- | --- | --- |
| Production project identity | Blocked | No Supabase Dashboard project identity, Production URL confirmation, or browser console Supabase URL was provided to Codex. |
| `.env.local` changes | Pass | No `.env.local` changes were made. |
| Table/view existence | Unknown | No dashboard table browser or SQL read-only schema output was provided. |
| Object type | Unknown | Codex could not confirm whether `public.scheduled_scan_attempts` exists as a table, view, or not at all in Production. |
| Migration history | Unknown | No Production migration history evidence was provided. |
| Column/schema match | Unknown | No Production column listing was provided. |
| Primary key / unique constraints | Unknown | No Production constraints evidence was provided. |
| Indexes | Unknown | No Production index evidence was provided. |
| Upsert conflict target | Unknown | Production uniqueness of `attempt_fingerprint` was not verified remotely. |
| REST/API exposure | Unknown | No dashboard API/REST exposure or PostgREST schema-cache evidence was provided. |
| RLS enabled/disabled | Unknown | No Production RLS state was provided. |
| Policies | Unknown | No anon/client SELECT or server upsert policy evidence was provided. |

## Local Static Evidence Reconfirmed

Local static evidence still shows the repo expects the table to exist:

- migration
  `supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql`
  creates `public.scheduled_scan_attempts`;
- `app/trade-app.tsx` reads `scheduled_scan_attempts` on app load/refresh;
- `app/api/automation/run-scan/route.ts` upserts into
  `scheduled_scan_attempts` with `onConflict: "attempt_fingerprint"`;
- static migration review found no explicit RLS enablement, RLS policies,
  grants, or REST exposure statements in that migration file.

This static evidence cannot determine whether the object exists in the
Production project, whether it is exposed through REST, whether PostgREST
schema cache is stale, or whether Production points to the expected Supabase
project.

## Decision Tree Result

Decision tree result: blocked before selecting a schema finding.

Reason: no manual Supabase Dashboard findings were available to Codex, and
this action did not have approval to run Supabase queries, mutate schema, run
migrations, invoke routes, or inspect secrets. Choosing a missing-table,
REST-exposure, RLS, wrong-project, or client-read-path conclusion from local
files alone would be speculative.

## Production Decision

Production decision: keep Production online with warnings.

Rollback is not required while:

- the app shell remains usable;
- Recommendations page renders;
- the remaining visible issue is a scheduled scan diagnostics/readback 404;
- no service-role/env exposure appears;
- no unsafe broker/Avanza behavior appears;
- no automatic order behavior appears.

Live market trial remains no-go until `scheduled_scan_attempts` is verified in
Production and fixed, reduced, or explicitly accepted as non-critical.

## Required Operator Evidence For Next Action

Action 968 should provide or record one of these evidence sets:

1. Supabase Dashboard screenshots/notes showing Production project identity,
   table existence, columns, constraints, indexes, RLS, policies, and API
   exposure.
2. Separately approved read-only SQL/schema-inspection output showing the same
   facts without secrets and without writes.
3. A clear operator statement that the table is missing, REST exposure is
   broken, policies are wrong, the app points to the wrong project/env, or the
   table/REST works manually while the app still 404s.

No migration, policy, env, runtime, route, provider, typegen, or generated type
change should be performed until that finding is recorded and separately
approved.

## Not Performed

- No runtime code change.
- No Supabase Dashboard access by Codex.
- No Supabase query.
- No DB read/write.
- No schema mutation.
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
- Scheduled-schema-verification-specific scan returned expected docs, local
  migration, client read path, and server upsert path references only.
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
