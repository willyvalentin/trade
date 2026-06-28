# Recent Recommendation Readback Production Verification

## Purpose

Action 974 verifies Production after the recent recommendation readback
stabilization patch from Action 973.

This is documentation/verification only. It is not final live market trial
approval. No runtime code, migration, type generation, generated type,
provider, route, scan, service-role adapter, broker/Avanza, automatic mode,
automatic order, trade/stats/PnL, or `.env.local` change was performed.

No broker/Avanza behavior or automatic order behavior is introduced or
approved by this verification.

Result status:
`recent_recommendation_readback_production_verified_with_expected_warning`

Recommended next action: Action 975 - Prepare Market-Window Dry Run.

## Deployment Context

Action 973 was deployed to Production before this verification.

Action 973 Production-relevant patch:

- `recommendation_snapshots` recent-read limit is now `100`;
- `recommendation_outcomes` recent-read limit is now `100`;
- fail-soft readback helper exists at `lib/recent-recommendation-readback.ts`;
- recent snapshot/outcome read failures preserve fallback data and log
  warning-level diagnostics.

Deployment and verification boundaries:

- no `.env.local` changes;
- no migrations;
- no type generation;
- no generated type edits;
- no service-role values printed;
- no manual Supabase/DB queries;
- no provider calls;
- no scan route invocations;
- no live market scans.

## Production Observation

Latest user-provided Production screenshot after the Action 973 deploy:

- Production UI loads.
- Recommendations tab renders.
- App shell remains usable.
- Console no longer shows red Supabase 404/500 errors.
- `scheduled_scan_attempts` 404 is no longer visible.
- `recommendation_batches` timeout is no longer visible.
- `recommendation_snapshots` HTTP 500 is no longer visible.
- `recommendation_outcomes` HTTP 500 is no longer visible.
- Console shows a yellow warning:
  - `[trade-app] recommendation_batch_backfill_capped`;
  - operation: `select_outcome_scan_run_batch_backfill`;
  - `requestedFingerprintCount: 21`.
- No broker/Avanza behavior appears.
- No automatic order behavior appears.

## Recent Readback Verification

`recommendation_snapshots` status:

- latest screenshot does not show the previous
  `select_recent_recommendation_snapshots` HTTP 500;
- Action 973 limit reduction and fail-soft behavior appear to have resolved
  the visible blocking console error.

`recommendation_outcomes` status:

- latest screenshot does not show the previous
  `select_recent_recommendation_outcomes` HTTP 500;
- Action 973 limit reduction and fail-soft behavior appear to have resolved
  the visible blocking console error.

Other prior Production data-health issues:

- `scheduled_scan_attempts` 404 remains resolved in latest screenshot;
- `recommendation_batches` timeout remains resolved in latest screenshot.

No new Supabase 4xx/5xx errors are observed in the provided Production
evidence. UI fallback behavior remains acceptable because the app shell and
Recommendations tab render.

## Remaining Warning

The remaining warning is:

```text
[trade-app] recommendation_batch_backfill_capped
operation: select_outcome_scan_run_batch_backfill
requestedFingerprintCount: 21
```

This is expected fail-soft stabilization behavior from the recommendation
batch backfill guard. It is count-only and non-fatal. It intentionally skips an
expensive historical backfill path when the requested scan-run fingerprint set
exceeds the configured cap, preserving dashboard stability.

The warning should be monitored, but it does not currently block the UI.

## Production Keep/Rollback Decision

Decision: keep Production online, console clean with expected warning.

Rollback is not recommended because:

- Production UI loads;
- Recommendations tab renders;
- previous red Supabase 404/500 blockers are no longer visible;
- remaining warning is expected, count-only, and non-fatal;
- no unsafe execution behavior appears.

Rollback should be reconsidered only if:

- app shell fails;
- core UI breaks;
- new Supabase 4xx/5xx errors appear;
- unsafe broker/automatic behavior appears;
- service-role/env exposure appears in client paths.

## Live-Trial Decision

Live market trial remains pending and is not fully approved by Action 974.

Production data health is now acceptable for the next controlled dry-run step:

Action 975 - Prepare Market-Window Dry Run.

A market-window dry run remains required before live-trial go.

## Result Status

`recent_recommendation_readback_production_verified_with_expected_warning`

## Recommended Next Action

Action 975 - Prepare Market-Window Dry Run.

## Validation Results

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deoptimization note for the
  large `app/trade-app.tsx` file.
- Runtime denial harness syntax checks passed:
  `scripts/verify-audit-table-authenticated-denial.mjs` and
  `scripts/verify-audit-table-runtime-denial.mjs`.
- Static audit writer import scan found only the existing approved route
  imports in `app/api/execution/audit/writer/route.ts`.
- Static route invocation scan for the updated recommendation docs found no
  route invocation strings.
- Static service-role exposure scan found no service-role or
  `NEXT_PUBLIC_*SERVICE*` exposure in the Action 974 proof target.
- Static recent-readback DB/API operation scan found no `fetch`, Supabase
  client, mutation, select, or `localStorage` behavior in the proof document.
- Static broker/automatic scan returned only docs-only boundary statements and
  the existing readback metadata flag.
- `.env.local` diff check produced no output.

## Not Performed

- No runtime code change.
- No additional migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No provider call.
- No route invocation.
- No scan invocation.
- No live market scan.
- No manual Supabase/DB query.
- No service-role adapter call.
- No audit writer UI/browser/client invocation.
- No market-loop/scanner audit writer invocation.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No trade/stats/PnL mutation.
