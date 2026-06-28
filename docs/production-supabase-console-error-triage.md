# Production Supabase Console Error Triage

## Purpose

Action 956 documents a static triage of Production browser-console Supabase
REST errors observed after the accidental Production deploy.

Result status: `production_supabase_console_error_triage_created`

Follow-up status: Action 957 created
`docs/recommendation-batch-timeout-fix-plan.md` with result status
`recommendation_batch_timeout_fix_plan_created`.

Follow-up status: Action 958 implemented
`docs/recommendation-batch-timeout-fix-implementation.md` with result status
`recommendation_batch_timeout_chunking_implemented`.

Recommended next action: Action 959 - Verify Recommendation Batch Timeout Fix
in Production.

Review timestamp: `2026-06-28 01:42:33 CEST`

This action is documentation/static triage only. No live database query,
Supabase action, provider call, route call, scan, service-role adapter call,
broker/Avanza behavior, automatic order behavior, migration, type generation,
generated type edit, runtime code change, or `.env.local` change was
performed.

## Observed Production Console Errors

| Error | Observed endpoint pattern | Static interpretation |
| --- | --- | --- |
| `scheduled_scan_attempts` HTTP 404 | `/rest/v1/scheduled_scan_attempts?select=*&utc_timestamp=gte...&order=utc_timestamp.desc&limit=100` | Likely missing/unavailable Production table/view or REST exposure mismatch for the expected `public.scheduled_scan_attempts` relation. |
| `recommendation_batches` HTTP 500 timeout | `/rest/v1/recommendation_batches?select=*&scan_run_fingerprint=in.(...)` | Likely an expensive client readback/backfill over many scan run fingerprints, possibly amplified by missing Production index or unbounded `.in(...)` size. |

Production UI reportedly loads. This is not currently treated as a frontend
blank-screen failure, but it is a Production data-health/readiness warning.

## Static Code Path Inventory

| Path | Function/surface | Runtime side | Operation | Notes |
| --- | --- | --- | --- | --- |
| `app/trade-app.tsx` | `loadTradeData(...)` initial/background refresh | Client/browser | Read-only Supabase REST calls through anon client | The app-shell refresh reads recommendations, settings, positions, scan logs, scheduled scan attempts, scan runs, batches, snapshots, outcomes, market regime, and market status. |
| `app/trade-app.tsx` | `select_recent_scheduled_scan_attempts` branch inside `loadTradeData(...)` | Client/browser | Read-only | Calls `supabase.from("scheduled_scan_attempts").select("*").gte("utc_timestamp", ...).order("utc_timestamp", { ascending: false }).limit(100)`. Error is logged as `[trade-app] scheduled_scan_attempts unavailable` and initial state falls back to an empty attempt list. |
| `app/trade-app.tsx` | `select_recent_recommendation_batches` branch inside `loadTradeData(...)` | Client/browser | Read-only | Calls `supabase.from("recommendation_batches").select("*").order("published_at", ...).limit(100)`. On error, market diagnostics and recommendations receive an island error and initial state falls back to local storage. |
| `app/trade-app.tsx` | `select_outcome_batch_backfill` branch inside `loadTradeData(...)` | Client/browser | Read-only | Backfills missing batches by `batch_fingerprint` with `.in("batch_fingerprint", missingBatchFingerprints)`. |
| `app/trade-app.tsx` | `select_outcome_scan_run_batch_backfill` branch inside `loadTradeData(...)` | Client/browser | Read-only | Backfills missing batches by `scan_run_fingerprint` with `.in("scan_run_fingerprint", missingScanRunFingerprints)`. This maps directly to the observed timeout endpoint pattern. |
| `lib/recommendation-batch-memory.ts` | `persistRecommendationBatch(...)` | Mixed helper, server/route caller when a Supabase client is injected | Mutation-capable helper | Uses `.from("recommendation_batches").upsert(...)` when a Supabase client is supplied. This is not the observed console read path and was not invoked by this action. |
| `app/api/automation/run-scan/route.ts` | scheduled scan attempt recording | Route/server | Mutation-capable | Uses `.from("scheduled_scan_attempts").upsert(...)` for automation route attempt records. This route was not called by this action. |
| `supabase/production_repair_recommendation_learning_loop.sql` | recommendation learning-loop repair script | SQL artifact only | Schema/index repair artifact | Defines `recommendation_batches` and includes `recommendation_batches_scan_run_fingerprint_idx`. This suggests the timeout may be worse if the Production schema/index repair is absent or incomplete. No SQL was run. |

## Error 1: scheduled_scan_attempts 404

Likely causes, without querying Production:

- `public.scheduled_scan_attempts` does not exist in the Production Supabase
  project.
- The migration or repair SQL that creates the table/view was not applied to
  Production.
- The table exists but is not exposed through the REST schema cache.
- The deployed app points at a different Supabase project than expected.
- The app and schema disagree on the relation name.
- RLS or schema-cache state may be masking the relation, though a REST 404
  more directly suggests missing/unexposed relation than row-level denial.

Evidence:

- `app/trade-app.tsx` expects the table from the browser read path.
- `app/api/automation/run-scan/route.ts` also expects the same table for
  server-side scheduled scan attempt upserts.
- The observed endpoint uses `utc_timestamp`, matching the static client query.

No Supabase query or migration was run to confirm the Production schema.

## Error 2: recommendation_batches 500 Timeout

Likely causes, without querying Production:

- The `.in("scan_run_fingerprint", missingScanRunFingerprints)` backfill list
  can become too large for the Production REST query.
- The query is unchunked and unpaginated in the client readback path.
- `select("*")` may fetch more columns/payload data than the UI needs for this
  backfill.
- Production may be missing `recommendation_batches_scan_run_fingerprint_idx`
  or related repair SQL.
- The backfill runs after outcome/snapshot matching, so stale or broad outcome
  history can amplify the missing fingerprint set.
- Supabase REST statement timeout is a production availability signal even when
  the frontend shell keeps rendering.

Evidence:

- `app/trade-app.tsx` builds `missingScanRunFingerprints` from
  `outcomeRelatedSnapshots` and calls `.in("scan_run_fingerprint", ...)`
  without chunking.
- The console endpoint pattern matches the
  `select_outcome_scan_run_batch_backfill` operation label in
  `app/trade-app.tsx`.
- `supabase/production_repair_recommendation_learning_loop.sql` includes a
  `recommendation_batches_scan_run_fingerprint_idx`, which is relevant to this
  query shape.

No runtime query code was changed in this action.

## Risk Assessment

| Area | Risk | Reason |
| --- | --- | --- |
| Frontend app shell | Low/medium | The UI reportedly loads, and the failed reads have fallback/error handling. Risk becomes high if the errors block initial render or navigation. |
| Recommendations UI | Medium/high | `recommendation_batches` errors can affect recommendation readback, market diagnostics, and official batch context. The timeout suggests Production data-health or query-shape risk. |
| History/statistics | Medium | The same `loadTradeData(...)` refresh reads positions, outcomes, batches, and snapshots. The observed errors are not direct trade/stat writes, but they can degrade readback and diagnostics. |
| Diagnostics/readiness | High | Both errors directly affect Production readiness confidence and scheduled-scan/batch observability. |
| Execution/broker safety | Low | Static triage found no new broker/Avanza behavior or automatic order behavior tied to these errors. |
| Audit writer safety | Low | The observed endpoints are unrelated to the server-only audit writer route/path. No audit writer client invocation was added. |
| Live-trial readiness | Blocked | Live market trial remains no-go until the Production schema/readback errors are fixed or explicitly accepted with a documented risk decision. |

## Immediate Production Decision

Decision: keep Production online with warnings if the UI remains usable and
the observed errors remain limited to read/data diagnostics.

Rollback is not automatically required from this static triage because:

- the Production UI reportedly loads;
- no unsafe execution behavior was observed or added;
- the failing endpoints are readback/diagnostic data paths;
- no broker/Avanza or automatic order behavior is implicated.

Rollback or a hotfix should be reconsidered if:

- the errors block core recommendation flow;
- Settings, execution mode, or safety copy becomes unusable;
- repeated timeouts degrade the browser or Supabase quota/capacity;
- the Supabase project URL/env target is wrong;
- any service-role/env value appears in client paths;
- any broker/Avanza/automatic order behavior appears enabled.

Production should be monitored for repeated `scheduled_scan_attempts` 404s and
`recommendation_batches` statement timeouts.

Live market trial remains no-go.

## Recommended Fix Strategy

Recommended next action: Action 957 - Create Recommendation Batch Timeout Fix
Plan.

Reason: the `recommendation_batches` timeout is the higher immediate
Production stability risk because it can become repeated/heavy on every
refresh. A docs/design-only Action 957 should propose the smallest safe runtime
fix, likely chunking, bounding, or server-side narrowing for
`select_outcome_scan_run_batch_backfill`, plus a static guardrail for maximum
fingerprint count.

Separate later follow-up: create a `scheduled_scan_attempts` Production schema
verification plan.

Reason: the 404 needs a separate schema/env verification plan before any
Production migration or repair is proposed. The plan should verify expected
table/view existence, REST exposure, project target, migration/repair history,
and schema cache without printing secrets.

Do not jump directly to migrations or runtime changes from this triage alone.

Action 957 follow-up: `docs/recommendation-batch-timeout-fix-plan.md`
recommends Option A, chunking the client readback `.in("scan_run_fingerprint",
...)` request with a defensive cap, as the next implementation step.

## Validation Results

Validation was run after documentation updates:

- Static code search identified `scheduled_scan_attempts` paths.
- Static code search identified `recommendation_batches`,
  `scan_run_fingerprint`, and `select_outcome_scan_run_batch_backfill` paths.
- Runtime denial harness syntax/import checks passed.
- Audit writer runtime path import search passed.
- Static route invocation search did not call routes.
- UI import/search for audit writer route invocation, lifecycle hook,
  lifecycle caller, transition boundary, proof harnesses, monitoring, cleanup,
  and rollout terms found no unsafe client wiring.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved server/test
  guardrails and documentation references only; no service-role values were
  printed.
- Broad env/client/write scan returned existing app Supabase/localStorage paths
  and guardrails only.
- Production-console-error-specific scan returned expected static
  Supabase/readback and documentation references only.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy.
- Status and next-action consistency scans passed.
- `git diff --check`, touched-file trailing whitespace scan, zero-byte docs
  check, `.env.local` diff check, `./node_modules/.bin/tsc --noEmit`, and
  `npm run lint` passed. Lint emitted the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Not Performed

- No runtime code was modified.
- No provider API call, route call, scheduled scan, Generate More route call,
  live market scan, Supabase query, DB read/write, service-role adapter call,
  live proof/insert/query, broker/Avanza automation, automatic order behavior,
  additional deploy, rollback, migration, typegen, or generated type edit was
  performed.
- No audit writer runtime persistence path, UI/browser/client invocation,
  market-loop/scanner invocation, handlers/effects/state mutation, JSX, hooks,
  components, reducers, or `.env.local` values were changed.
