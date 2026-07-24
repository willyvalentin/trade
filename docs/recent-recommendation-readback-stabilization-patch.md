# Recent Recommendation Readback Stabilization Patch

## Purpose

Action 973 implements a conservative app-side stabilization patch for recent
recommendation readback paths that were producing Production HTTP 500 console
errors:

- `recommendation_snapshots` / `select_recent_recommendation_snapshots`;
- `recommendation_outcomes` / `select_recent_recommendation_outcomes`.

This patch is read-only and app-side. It does not change recommendation
generation, provider calls, scan routes, Supabase schema, audit writer runtime
persistence, broker/Avanza behavior, automatic mode, automatic order behavior,
scheduled scan attempts, generated types, or `.env.local`.

Result status:
`recent_recommendation_readback_stabilization_patch_implemented`

Follow-up status: Action 974 created
`docs/recent-recommendation-readback-production-verification.md` with result
status
`recent_recommendation_readback_production_verified_with_expected_warning`.

Recommended next action: Action 975 - Prepare Market-Window Dry Run.

## Code Changes

Files changed:

- `app/trade-app.tsx`;
- `lib/recent-recommendation-readback.ts`;
- `tests/e2e/recent-recommendation-readback-stabilization.spec.ts`.

Snapshot recent read:

- old limit: `1000`;
- new limit: `100`;
- sort order preserved: `created_at` descending.

Outcome recent read:

- old limit: `750`;
- new limit: `100`;
- sort order preserved: `evaluated_at` descending.

Fail-soft behavior:

- snapshot/outcome recent readback failures now log
  `recent_recommendation_readback_unavailable` with safe source, operation,
  fallback source, fallback count, read limit, and normalized error;
- initial-load failure falls back to local storage;
- post-initial failure preserves previous in-memory state;
- outcome fallback still runs through existing readback dedupe diagnostics;
- the error path no longer marks recommendations, diagnostics, or history
  islands as errored for these two non-critical recent readback failures.

## Behavior Preservation

- Read-only behavior remains.
- Sort order remains unchanged.
- Existing local fallback behavior is preserved and extended to post-initial
  refreshes by preserving previous state.
- Downstream snapshot/outcome mapping remains unchanged for successful reads.
- Recommendation generation behavior is unchanged.
- Provider and scan route behavior are unchanged.
- `scheduled_scan_attempts` is unchanged.
- Audit writer code and runtime persistence paths are unchanged.
- Broker/Avanza behavior is unchanged.
- Automatic mode and automatic order behavior are unchanged.
- No trade/stats/PnL mutation path was added.

## Tests

Added focused regression coverage in
`tests/e2e/recent-recommendation-readback-stabilization.spec.ts`:

- snapshot recent-read limit is `100`;
- outcome recent-read limit is `100`;
- snapshot/outcome source reads use the new constants;
- old `.limit(1000)` and `.limit(750)` are absent from `app/trade-app.tsx`;
- initial-load failures choose local-storage fallback;
- post-initial failures preserve previous state;
- snapshot/outcome error blocks are warning-level fail-soft paths;
- the helper remains client-safe, read-only, and free of service-role,
  Supabase, fetch, route, insert/update/delete/upsert/select, broker/Avanza,
  and automatic-order behavior.

Focused test result:

```text
npx playwright test tests/e2e/recent-recommendation-readback-stabilization.spec.ts
5 passed
```

The first sandboxed attempt could not bind the local Playwright web server on
`0.0.0.0:3010` and was rerun with approval for local server binding only.

## Production Rollout Note

Production is currently online with warnings. Because Ture is not publicly
released and Production is being used as the verification environment, this
stabilization patch can be deployed directly to Production after tests pass.

Expected improvement after deploy:

- no `recommendation_snapshots` HTTP 500 caused by the broad recent read;
- no `recommendation_outcomes` HTTP 500 caused by the broad recent read;
- if either read still fails, the app should preserve fallback data and avoid
  turning these readback failures into recommendation/history island blockers.

Production console verification is still required after deploy.

Live market trial remains no-go until Production console/readiness is clean or
remaining readback issues are explicitly accepted with documented risk.

## Not Performed

- No live DB query.
- No manual Supabase call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No audit writer change.
- No service-role adapter call.
- No provider call.
- No route invocation.
- No scan invocation.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No `scheduled_scan_attempts` change.
- No trade/stats/PnL mutation behavior change beyond preserving readback
  fallback behavior.

## Validation Results

Validation was run after implementation and documentation updates:

- Focused stabilization test passed:
  `npx playwright test tests/e2e/recent-recommendation-readback-stabilization.spec.ts`
  returned `5 passed`.
- Focused non-live recommendation diagnostics baseline passed:
  `npx playwright test tests/e2e/recommendation-build-diagnostics.spec.ts`
  returned `11 passed`.
- Runtime denial harness syntax/import checks passed.
- Audit writer runtime path import search found only existing approved server
  route/test guardrails, with no new UI/app-shell client import.
- Route invocation search was static only; no routes were called.
- UI/app-shell audit writer import scan passed.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` and service-role exposure scans found no new client
  exposure and printed no secret values.
- Recent-readback-specific unsafe import scan passed for the new helper.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy only.
- Dead-doc/path scan passed.
- Touched-file trailing whitespace scan passed.
- `git diff --check` passed.
- `find docs -type f -size 0` passed with no output.
- `.env.local` diff check remained clean.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Recommended Next Action

Action 975 - Prepare Market-Window Dry Run.

Action 974 verified Production after deploy: the previous red
`recommendation_snapshots` and `recommendation_outcomes` HTTP 500 errors are
no longer visible, and the remaining
`recommendation_batch_backfill_capped` warning is expected and non-fatal.
