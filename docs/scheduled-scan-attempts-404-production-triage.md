# scheduled_scan_attempts 404 Production Triage

## Purpose

Action 965 statically triages the remaining Production
`scheduled_scan_attempts` HTTP 404 after Action 964 verified the Action 963
recommendation batch fail-soft patch.

This action is documentation/static triage only. It does not query Supabase,
does not run migrations, does not generate types, does not invoke scan routes,
and does not approve live market trial.

Result status: `scheduled_scan_attempts_404_production_triage_created`

Follow-up status: Action 966 created
`docs/scheduled-scan-attempts-production-schema-verification-plan.md` with
result status
`scheduled_scan_attempts_production_schema_verification_plan_created`.

Follow-up status: Action 967 created
`docs/scheduled-scan-attempts-production-schema-verification-results.md` with
result status `scheduled_scan_attempts_schema_verification_blocked`.

Recommended next action: Action 968 - Complete scheduled_scan_attempts
Production Schema Verification With Operator Dashboard Findings.

## Latest Production Observation

The latest operator-provided Production observation shows:

- Production UI loads.
- Recommendations page renders.
- `recommendation_batches` timeout is no longer visible.
- `recommendation_snapshots` HTTP 500 is no longer visible.
- `scheduled_scan_attempts` HTTP 404 remains visible.
- No broker/Avanza behavior appears.
- No automatic order behavior appears.

Interpretation: the recommendation batch timeout path appears stabilized. The
remaining visible Production issue is the `scheduled_scan_attempts` REST 404.

## Reference Inventory

| Path | Static reference | Runtime side | Access type | Production load/refresh |
| --- | --- | --- | --- | --- |
| `app/trade-app.tsx` | Imports `scheduledScanAttemptFromRow` and `buildScheduledScanTimelineToday`; stores `scheduledScanAttempts`; reads `scheduled_scan_attempts`; builds daily timeline and diagnostics payload. | Client/browser app shell | Read-only Supabase REST query | Yes, inside normal `loadTradeData(...)` refresh. |
| `app/api/automation/run-scan/route.ts` | Builds a scheduled scan attempt record and calls `.from("scheduled_scan_attempts").upsert(...)`. | Server route | Mutation-capable upsert | No, only when automation route is invoked. This action did not invoke it. |
| `lib/scheduled-scan-attempts.ts` | Defines `ScheduledScanAttempt`, row parser, record builder, timeline builder, fingerprint helpers, and rejection/readiness summaries. | Shared pure helper module | No direct DB access | Indirectly used by app readback and route record building. |
| `lib/market-diagnostics-console.ts` | Renders `scheduled_scan_timeline_today` section and metrics from timeline entries. | App diagnostics/rendering helper | No direct DB access | Yes, when diagnostics are built from readback state. |
| `tests/e2e/scan-window-orchestration.spec.ts` | Tests timeline construction, row parsing, duplicate windows, skipped/successful attempts, and empty build rejection diagnostics. | Test-only | No live DB access | No. |
| `tests/e2e/recommendation-build-diagnostics.spec.ts` | Tests `scheduled_scan_timeline_today` diagnostics metrics and readback payload behavior. | Test-only | No live DB access | No. |
| `supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql` | Creates `public.scheduled_scan_attempts`, indexes, comments, and expected columns including `utc_timestamp`. | Migration/schema | Schema creation if applied | Not a runtime path. |
| `lib/supabase-database.types.ts` | Contains `scheduled_scan_runs`; static search did not find `scheduled_scan_attempts`. | Generated type artifact | Type metadata only | No. |
| `docs/production-supabase-console-error-triage.md` | Prior static triage of the 404 endpoint and likely missing/unavailable relation. | Docs-only | None | No. |
| `docs/recommendation-batch-fail-soft-production-verification.md` | Records that `scheduled_scan_attempts` HTTP 404 remains the active issue after Action 963 verification. | Docs-only | None | No. |

Static search also found older edit-conflict files with
`scheduled_scan_runs` references. Those are unrelated to the current
`scheduled_scan_attempts` Production 404 and were not modified.

## Production Read Path

The Production client read path is in `app/trade-app.tsx` inside
`loadTradeData(...)`, which is used by the normal app load/refresh flow.

The query shape is:

```ts
supabase
  .from("scheduled_scan_attempts")
  .select("*")
  .gte("utc_timestamp", new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString())
  .order("utc_timestamp", { ascending: false })
  .limit(100)
```

If the query errors, the app logs:

```ts
console.info("[trade-app] scheduled_scan_attempts unavailable", {
  source: "supabase.scheduled_scan_attempts",
  operation: "select_recent_scheduled_scan_attempts",
  error: normalizeUnknownError(scheduledScanAttemptsResult.error),
});
```

On initial load, the app falls back to `setScheduledScanAttempts([])`. This
means the error degrades scheduled scan timeline/readiness diagnostics rather
than directly blocking core recommendation readback.

## UI And Diagnostics Use

`scheduledScanAttempts` feeds:

- same-day scheduled scan attempt filtering by `utc_timestamp` or
  `trading_date`;
- `buildScheduledScanTimelineToday(...)`;
- `scheduled_scan_timeline_today` in market diagnostics readback;
- latest attempted/successful scan interpretation;
- readiness diagnostics for whether scheduled scans fired, skipped, or failed.

When the table is unavailable, the scheduled scan timeline can be empty or
incomplete even if legacy `scheduled_scan_runs` and recommendation scan runs
exist.

## Schema Expectation Inventory

Static evidence shows the repo expects a table, not a view:

- `supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql`
  creates `public.scheduled_scan_attempts`.
- The migration defines `utc_timestamp timestamptz not null default now()`.
- The migration adds indexes on `trading_date`, `utc_timestamp`, and
  `(official_window, outcome)`.
- The migration comment describes it as a log for Netlify scheduled scan
  firings and automation route outcomes, separate from legacy
  `scheduled_scan_runs`.
- The client and server code both reference exactly
  `scheduled_scan_attempts`.
- Static search did not find an alternate table/view name for this exact
  diagnostics object.
- `lib/supabase-database.types.ts` does not currently include
  `scheduled_scan_attempts`, which suggests generated types may predate the
  migration or were not regenerated after it.

Static evidence not found:

- no separate view named `scheduled_scan_attempts`;
- no alternate table name for the same data;
- no RLS/policy migration for this table in the reviewed migration file;
- no static proof that the migration has been applied to the Production
  Supabase project;
- no static proof that PostgREST schema cache has refreshed in Production.

No Supabase query was run and no migration status command was run in this
action.

## Likely Causes

Most likely causes, from static evidence and the Production REST 404:

1. The `public.scheduled_scan_attempts` migration has not been applied to the
   Production project.
2. The table exists locally or in staging but is missing in Production.
3. The table exists but is not exposed through the REST schema/cache currently
   used by the Production anon client.
4. PostgREST schema cache is stale after a migration or schema change.
5. Production is pointed at a different Supabase project/environment than the
   schema where the migration was applied.
6. Generated types are stale, which is a local metadata issue, but stale types
   alone would not explain a Production REST 404.
7. RLS/policy/grant issues may still need review, but a missing/unavailable
   relation or REST exposure mismatch is more consistent with 404 than a
   permission denial.

## Risk Assessment

| Area | Risk | Notes |
| --- | --- | --- |
| Frontend app shell | Low | The app loads and falls back to an empty attempts array on initial load. |
| Recommendation generation/readback | Low/medium | Core recommendation batch/readback appears stabilized; scheduled attempt data mainly supports diagnostics/readiness interpretation. |
| Scheduled scan diagnostics | Medium/high | The current day scheduled scan timeline can be missing, making same-window skip/empty-build diagnostics less observable. |
| Readiness panel | Medium/high | Live-trial readiness depends on knowing whether scheduled scans fired, skipped, failed, or published. |
| Live-trial readiness | Blocked | Trial remains no-go until the 404 is fixed, reduced, or explicitly accepted as non-critical. |
| Execution/broker safety | Low | This path does not place trades and does not imply broker/Avanza behavior. |
| Audit writer safety | Low | This path is separate from audit writer runtime persistence. |
| Production rollback | Low | Keep online with warnings if app shell remains usable and no unsafe execution behavior appears. |

## Fix And Decision Options

| Option | Description | Pros | Cons | Action 965 recommendation |
| --- | --- | --- | --- | --- |
| A - Create/apply missing schema object | Verify/apply `public.scheduled_scan_attempts` in Production. | Matches static migration and both client/server code expectations. Preserves scheduled scan timeline observability. | Requires schema verification, migration/status discipline, and approval. | Recommended next path. |
| B - Treat attempts as optional diagnostics | Make the client read fail-soft on 404 with unavailable diagnostics state. | Removes console noise without DB migration. | Loses important scheduled scan observability; server route upsert would still fail if table missing. | Secondary option if operator accepts diagnostics as optional. |
| C - Gate read behind diagnostics/admin/dev mode | Avoid Production app-shell read unless diagnostics are visible/needed. | Reduces default console noise while preserving feature when available. | Still does not solve route upsert/table absence; hides readiness data. | Possible later runtime hardening. |
| D - Rename to existing schema object | Point code to an existing table/view if static schema proves a mismatch. | Could fix if naming is wrong. | Static evidence does not show a better target; risky without remote schema verification. | Not recommended from current evidence. |

Because static evidence shows a migration creating the expected table and both
client/server paths depend on that object, the safest next action is:

Completed follow-up: Action 966 - Create scheduled_scan_attempts Production
Schema Verification Plan.

Completed follow-up: Action 967 - Verify scheduled_scan_attempts Production
Schema in Supabase Dashboard.

Action 967 was blocked because no manual Supabase Dashboard findings or
read-only Production schema evidence were provided to Codex.

Recommended next action: Action 968 - Complete scheduled_scan_attempts
Production Schema Verification With Operator Dashboard Findings.

## Production Decision

Production decision: keep Production online with warnings.

Rollback is not required while:

- the app shell remains usable;
- Recommendations page renders;
- no service-role/env exposure appears;
- no unsafe broker/Avanza behavior appears;
- no automatic order behavior appears.

Live market trial remains no-go until `scheduled_scan_attempts` is fixed,
reduced, or explicitly accepted as non-critical.

The recommendation batch timeout is no longer the active visible blocker in the
latest Production observation.

## Not Performed

- No runtime code change.
- No live DB read/write.
- No manual Supabase call.
- No migration status/apply.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No provider call.
- No route invocation.
- No scan route invocation.
- No live market scan.
- No service-role adapter call.
- No audit writer runtime persistence change.
- No audit writer UI/browser/client invocation.
- No market-loop/scanner invocation.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No trade/stats/PnL mutation.

## Validation Results

Validation was run after documentation updates:

- Static code search completed for `scheduled_scan_attempts`,
  `utc_timestamp`, scheduled scan attempt helpers, diagnostics/readiness UI,
  route references, and migration/schema references.
- Runtime denial harness syntax/import checks passed.
- Static audit writer runtime path import search passed with existing
  server-only module references only.
- Static route invocation search did not call routes.
- UI/app-shell audit writer import scan passed.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved guardrails and
  documentation references only; no service-role values were printed.
- Scheduled-scan-404-specific scan returned the expected client read path,
  server route upsert path, helper/test/docs references, and migration only.
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
