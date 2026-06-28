# Recommendation Batch Backfill Stabilization Patch

## Purpose

Action 961 implements a conservative app-side stabilization patch for the
remaining Production `recommendation_batches` timeout after Action 958
chunking and Action 960 triage.

Result status: `recommendation_batch_backfill_stabilization_patch_implemented`

Follow-up status: Action 962 created
`docs/recommendation-batch-backfill-production-stabilization-verification.md`
with result status
`recommendation_batch_backfill_production_stabilization_verified_with_warnings`.

Follow-up status: Action 963 implemented
`docs/recommendation-batch-backfill-fail-soft-patch.md` with result status
`recommendation_batch_backfill_fail_soft_patch_implemented`.

Follow-up status: Action 964 created
`docs/recommendation-batch-fail-soft-production-verification.md` with result
status
`recommendation_batch_fail_soft_production_verified_with_warnings`.

Recommended next action: Action 965 - Triage scheduled_scan_attempts 404
Production Schema Issue.

Latest Production follow-up: after the Action 963 fail-soft deploy, the latest
operator-provided screenshot no longer shows the recommendation batch timeout
or the `recommendation_snapshots` HTTP 500. `scheduled_scan_attempts` HTTP 404
remains visible and is the next targeted issue.

The patch is read-only and app-side. It reduces request/query pressure for the
scan-run recommendation batch backfill path without changing Supabase schema,
environment configuration, provider calls, routes, `scheduled_scan_attempts`,
audit writer paths, broker/Avanza behavior, automatic mode, automatic order
behavior, or trade/stats/PnL mutation behavior.

## Code Changes

Files changed:

- `lib/recommendation-batch-backfill.ts`
- `tests/e2e/recommendation-batch-backfill.spec.ts`

Runtime bounds changed:

| Bound | Previous | New |
| --- | --- | --- |
| `RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE` | `50` | `10` |
| `RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP` | `250` | `100` |

Behavior preserved:

- `fetchChunkedRecommendationBatchBackfillRows(...)` exported API remains
  unchanged.
- Empty missing-fingerprint lists still produce no query attempts.
- Smaller-than-chunk lists still produce one chunk.
- Larger-than-chunk lists still produce multiple bounded chunks.
- Larger-than-cap lists still cap to the first/current ordered set and expose
  count-only cap metadata for the existing warning path.
- Failed chunks still return no partial rows.
- Rows still merge deterministically in chunk order.
- `app/trade-app.tsx` downstream recommendation batch mapping/filtering/merge
  behavior remains unchanged.

## Behavior Preservation

- The `recommendation_batches` scan-run backfill remains a read-only
  `select("*")` query through the existing app-side path.
- The oversized-list warning remains count-only and non-fatal.
- The market diagnostics fail-soft behavior remains unchanged.
- Recommendation UI fallback/selective behavior remains unchanged.
- `scheduled_scan_attempts` 404 handling was not changed.
- No Production DB/index/schema work was performed.
- No `batch_fingerprint` backfill behavior was changed; it remains documented
  as a secondary risk for a separate action if that exact endpoint appears in
  Production.
- No broker/Avanza behavior was added.
- No automatic mode or automatic order behavior was enabled.

## Tests

Updated `tests/e2e/recommendation-batch-backfill.spec.ts` to cover the new
conservative bounds:

- empty list does not query;
- smaller-than-chunk list queries once;
- larger-than-chunk list queries multiple bounded chunks;
- 50 missing fingerprints split into five chunks of 10;
- oversized lists cap at 100 fingerprints;
- deterministic merge behavior remains;
- fail-soft failed chunk behavior remains;
- helper remains dependency-free and client-safe with no `server-only`,
  Supabase package import, `process.env`, service-role term, or `fetch(`.

## Production Rollout Note

Production is currently online with warnings. Because Ture is not publicly
released and Production is being used as the verification environment for this
readback fix, this stabilization patch can be deployed directly to Production
after validation passes and operator approval is satisfied.

After deploy, verify the Production browser console:

- `recommendation_batches?select=*&scan_run_fingerprint=in.(...)` no longer
  times out on normal load/refresh, or times out less frequently with smaller
  bounded chunks;
- Recommendations tab remains usable with fallback/selective state if data is
  incomplete;
- `scheduled_scan_attempts` 404 is observed separately and not treated as fixed
  by this patch.

Live market trial remains no-go until the recommendation batch timeout is gone
or explicitly accepted, and `scheduled_scan_attempts` is separately resolved or
accepted.

Action 962 follow-up: the latest Production screenshot no longer showed the
previous `recommendation_batches?select=*&scan_run_fingerprint=in.(...)`
timeout, but Production still has data-health warnings:
`recommendation_snapshots` HTTP 500 and `scheduled_scan_attempts` HTTP 404.

Action 963 correction: later Production evidence showed the
`recommendation_batches` scan-run timeout still active. Action 963 adds a
fail-soft guard that skips scan-run backfill entirely when normalized missing
fingerprints exceed `20`.

## Not Performed

- No live DB query.
- No manual Supabase call.
- No database write.
- No provider call.
- No route invocation.
- No scheduled scan or live market scan.
- No service-role adapter call.
- No migrations.
- No type generation.
- No generated type edits.
- No `.env.local` changes.
- No service-role values were printed.
- No audit writer path changes.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No `scheduled_scan_attempts` fix.

## Validation Results

Validation was run after implementation:

- Focused recommendation batch backfill tests passed.
- Focused non-live baseline pack passed.
- Runtime denial harness syntax/import checks passed.
- Static audit writer runtime path import search passed.
- Static route invocation search did not call routes.
- UI/app-shell audit writer import scan passed.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved server/test guardrails
  and documentation references only; no service-role values were printed.
- Backfill-stabilization-specific scan returned the intended helper, app
  readback, tests, and documentation references only.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy only.
- Dead-doc/path, status string, and next-action consistency scans passed.
- `git diff --check`, touched-file trailing whitespace scan, zero-byte docs
  check, `.env.local` diff check, `./node_modules/.bin/tsc --noEmit`, and
  `npm run lint` passed. Lint emitted the existing Babel deopt note for large
  `app/trade-app.tsx`.
