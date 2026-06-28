# Recommendation Batch Fail-Soft Production Verification

## Purpose

Action 964 verifies Production after the Action 963 recommendation batch
fail-soft patch.

This action is documentation/verification only. It is not live market trial
approval, does not introduce broker/Avanza behavior, and does not introduce
automatic order behavior.

Result status:
`recommendation_batch_fail_soft_production_verified_with_warnings`

Follow-up status: Action 965 created
`docs/scheduled-scan-attempts-404-production-triage.md` with result status
`scheduled_scan_attempts_404_production_triage_created`.

Follow-up status: Action 966 created
`docs/scheduled-scan-attempts-production-schema-verification-plan.md` with
result status
`scheduled_scan_attempts_production_schema_verification_plan_created`.

Follow-up status: Action 967 created
`docs/scheduled-scan-attempts-production-schema-verification-results.md` with
result status `scheduled_scan_attempts_schema_verification_blocked`.

Follow-up status: Action 968 created
`docs/scheduled-scan-attempts-production-schema-operator-verification.md` with
result status `scheduled_scan_attempts_schema_missing_in_production`.

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

## Deployment Context

Action 963 is reported deployed to Production.

Action 963 runtime behavior:

- `RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE` is `5`.
- `RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP` is `20`.
- Oversized normalized scan-run backfill lists skip Supabase querying entirely.
- Oversized skips return `ok: true`, empty `rows` and `chunks`,
  `fingerprintsCapped: true`, and `backfillSkipped: true`.
- `app/trade-app.tsx` adds only count-only `backfillSkipped` diagnostic
  metadata to the existing warning path.

Deployment/verification boundaries:

- No `.env.local` changes were made.
- No migrations, type generation, or generated type edits were performed.
- No service-role values were printed.
- No manual Supabase or database queries were performed.
- No provider calls, route invocations, or live market scans were performed.

## Production Observation

The latest operator-provided Production screenshot after the Action 963 deploy
shows:

- Production UI loads.
- Recommendations page renders.
- The previous
  `recommendation_batches?select=*&scan_run_fingerprint=in.(...)` timeout is
  no longer visible.
- The previous `recommendation_snapshots` HTTP 500 is no longer visible.
- `scheduled_scan_attempts` HTTP 404 remains visible.
- No broker/Avanza behavior appears.
- No automatic order behavior appears.

## Recommendation Batch Fail-Soft Verification

The latest screenshot does not show the previous recommendation batch scan-run
backfill timeout. Action 963 appears to have stabilized the timeout-prone
readback path in this Production observation.

This should continue to be monitored for recurrence during normal page load,
refresh, and Recommendations page use.

Large historical scan-run backfill may now be intentionally skipped for
stability. That means historical recommendation batch context can be incomplete,
but the UI should fail soft instead of issuing a timeout-prone broad readback
query.

## Remaining Active Issue: scheduled_scan_attempts 404

`scheduled_scan_attempts` HTTP 404 is still visible in Production.

This is now the active visible Production console issue from the latest
operator-provided screenshot. It is separate from the recommendation batch
timeout path and likely indicates a Production schema/table/view exposure
mismatch or schema-cache/relation availability issue.

The next targeted triage should focus on `scheduled_scan_attempts` without
mixing it with broker behavior, audit writer behavior, live market scans,
provider calls, migrations, or type generation unless separately approved.

Action 965 follow-up: static triage found a repo migration that creates
`public.scheduled_scan_attempts`, a client read path on normal app
load/refresh, and a server automation route upsert path. Because the static
repo expects the table to exist, the recommended next step is a Production
schema verification plan rather than an immediate optional-diagnostics
fail-soft patch.

Action 966 follow-up: the schema verification plan defines the expected table,
columns, unique conflict target, indexes, app read/upsert expectations, manual
dashboard checklist, and decision tree. No Supabase query, migration, or
runtime code change was performed.

Action 967 follow-up: Production schema verification is blocked because no
manual Supabase Dashboard findings or read-only schema-inspection output were
provided to Codex. No Production schema conclusion was inferred from local
static evidence alone.

Action 968 follow-up: operator Supabase Dashboard evidence found
`public.scheduled_scan_attempts` missing from the checked Production project.
The remaining REST 404 is now explained by the missing table. No migration was
applied in Action 968.

Action 969 follow-up: the exact scheduled scan attempts migration SQL file was
applied to Production. `public.scheduled_scan_attempts` now exists and the
Supabase REST endpoint returns HTTP 200 with an empty array.

Action 970 follow-up: deployed app console cleanliness remains blocked pending
operator evidence or a Production app URL. The Action 969 REST-level 404 fix
remains verified.

Action 971 follow-up: the request did not include a Production app URL,
screenshot/manual console evidence, or observation summary. Manual deployed
console verification remains blocked pending operator evidence.

## Production Keep/Rollback Decision

Decision: keep Production online with warnings.

Rollback is not required while:

- the app shell remains usable;
- Recommendations page renders;
- the remaining console issue is readback/diagnostic in nature;
- no service-role/env exposure appears;
- no unsafe broker/Avanza behavior appears;
- no automatic order behavior appears.

Rollback should be reconsidered if:

- the app crashes or blank-screens;
- the core Recommendations UI becomes unusable;
- service-role/env exposure appears;
- unsafe broker/Avanza behavior appears;
- automatic order behavior appears unexpectedly.

## Live-Trial Decision

Live market trial remains no-go.

Production data health is improved because the recommendation batch timeout and
the `recommendation_snapshots` HTTP 500 were no longer observed in the latest
operator screenshot, and Action 969 verified the `scheduled_scan_attempts`
REST endpoint returns HTTP 200. Production is still not fully clean until a
fresh deployed app console observation is recorded.

The deployed app console must be verified clean or accepted with warnings
before a market-window trial.

## Not Performed

- No runtime code change.
- No live DB read/write.
- No manual Supabase call.
- No service-role adapter call.
- No provider call.
- No route invocation.
- No scan route invocation.
- No live market scan.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No audit writer runtime persistence change.
- No audit writer UI/browser/client invocation.
- No market-loop/scanner invocation.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No trade/stats/PnL mutation.

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
- Backfill-fail-soft-production-verification-specific scan returned this
  verification doc, existing fail-soft docs, and approved guardrail references
  only.
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
