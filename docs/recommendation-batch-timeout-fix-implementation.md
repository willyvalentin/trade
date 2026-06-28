# Recommendation Batch Timeout Fix Implementation

## Purpose

Action 958 implements the app-side fix for the Production
`recommendation_batches` statement timeout that was mapped to a large
`.in("scan_run_fingerprint", missingScanRunFingerprints)` readback query.

Result status: `recommendation_batch_timeout_chunking_implemented`

Recommended next action: Action 959 - Verify Recommendation Batch Timeout Fix
in Production.

The implementation is read-only and app-side. It does not change Supabase
schema, environment configuration, provider calls, routes, audit writer paths,
broker/Avanza behavior, or automatic order behavior.

## Code Changes

Files changed:

- `lib/recommendation-batch-backfill.ts`
- `app/trade-app.tsx`
- `tests/e2e/recommendation-batch-backfill.spec.ts`

Helper added:

- `buildRecommendationBatchBackfillChunks(...)`
- `fetchChunkedRecommendationBatchBackfillRows(...)`

Runtime limits:

- Chunk size: `50` scan-run fingerprints per request.
- Defensive cap: `250` scan-run fingerprints total.

Runtime behavior:

- `loadTradeData(...)` still reads `public.recommendation_batches` through the
  existing browser Supabase client.
- The selected columns remain `select("*")`.
- The filter remains `scan_run_fingerprint`.
- Missing scan-run fingerprints are sanitized, de-duplicated, capped, and split
  into bounded chunks before querying.
- If the cap is exceeded, the app emits a non-fatal warning with counts and
  limits only.
- If any chunk returns an error, the path preserves fail-soft behavior:
  `outcomeBackfillError` is recorded, the market diagnostics island is marked,
  no partial chunk rows are merged, and the existing fallback state remains.
- If all chunks succeed, rows are concatenated in chunk order and then passed
  through the existing downstream mapping/filter/merge behavior.

## Behavior Preservation

- The backfill query remains read-only.
- Empty missing-fingerprint lists do not query.
- Recommendation batch row mapping remains compatible with the existing
  `recommendationBatchFromPersistenceRow(...)` path.
- Existing filtering remains:
  `isLiveRecommendationBatch(batch) && batch.batch_type === "official"`.
- Existing merge-by-`batch_fingerprint` behavior remains in `app/trade-app.tsx`.
- Existing fallback/error behavior is preserved for failed backfill reads.
- The `scheduled_scan_attempts` 404 path was not changed.
- No broker/Avanza behavior was added.
- No automatic mode or automatic order behavior was enabled.

## Tests

Added `tests/e2e/recommendation-batch-backfill.spec.ts` covering:

- Empty list does not call the injected fetcher.
- Lists smaller than chunk size query once.
- Lists larger than chunk size query multiple bounded chunks.
- Lists larger than the cap are capped before querying.
- Results are merged in deterministic chunk order.
- Fingerprints are normalized and de-duplicated in first-seen order.
- Chunk failure returns no partial rows.
- The helper remains dependency-free and client-safe: no `server-only`,
  Supabase package import, `process.env`, service-role term, or `fetch(`.

Validation also included non-live static safety scans, TypeScript, lint, and
dead-doc/path checks.

## Production Rollout Note

Production is currently online with warnings from the earlier accidental
Production deploy. This fix should be deployed only after non-live validation
passes. After deploy, verify the Production browser console no longer reports
the `recommendation_batches` statement timeout for the scan-run backfill path.

Live market trial remains no-go until Production verification passes and the
remaining readiness gates are complete.

## Not Performed

- No live DB query.
- No manual Supabase call.
- No database write.
- No provider call.
- No route invocation.
- No scheduled scan or live market scan.
- No migrations.
- No type generation.
- No generated type edits.
- No `.env.local` changes.
- No service-role value printing.
- No audit writer path changes.
- No broker/Avanza behavior.
- No automatic order behavior.

## Validation Results

Validation was run after implementation:

- New chunking helper tests passed.
- Focused execution state/effects and live-position UI baselines passed.
- Runtime denial harness syntax/import checks passed.
- Static audit writer runtime path import search passed.
- Static route invocation search did not call routes.
- UI import/search for audit writer route invocation, lifecycle hook,
  lifecycle caller, transition boundary, proof harnesses, monitoring, cleanup,
  and rollout terms found no unsafe client wiring.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved server/test guardrails
  and documentation references only; no service-role values were printed.
- Broad env/client/write scan returned existing app Supabase/localStorage paths
  and the approved read-only backfill change only.
- Timeout-fix-specific scan returned the helper, test, and intended readback
  references only.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy.
- Dead-doc/path, status, and next-action consistency scans passed.
- `git diff --check`, touched-file trailing whitespace scan, zero-byte docs
  check, `.env.local` diff check, `./node_modules/.bin/tsc --noEmit`, and
  `npm run lint` passed. Lint emitted the existing Babel deopt note for large
  `app/trade-app.tsx`.
