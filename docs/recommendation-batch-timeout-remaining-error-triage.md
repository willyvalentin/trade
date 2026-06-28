# Recommendation Batch Timeout Remaining Error Triage

## Purpose

Action 960 triages the remaining Production `recommendation_batches`
statement timeout reported after the Action 958 chunked backfill fix.

Result status: `recommendation_batch_remaining_error_triage_created`

Follow-up status: Action 961 implemented
`docs/recommendation-batch-backfill-stabilization-patch.md` with result status
`recommendation_batch_backfill_stabilization_patch_implemented`.

Recommended next action: Action 962 - Verify Stabilized Recommendation Batch
Backfill in Production.

This action is static/code triage and documentation only. It does not change
runtime behavior, query Production, call Supabase, call providers, invoke scan
routes, run migrations, generate types, modify generated types, modify
`.env.local`, or touch audit writer, broker/Avanza, automatic order, trade,
stats, or PnL paths.

## Production Observation

Operator-reported Production observation after deploy:

- Production UI still loads.
- Recommendations tab shows fallback/selective state.
- Browser console still shows a `recommendation_batches` request with
  `scan_run_fingerprint=in.(...)`.
- The request returns HTTP 500 with
  `canceling statement due to statement timeout`.
- Browser console still shows `scheduled_scan_attempts` HTTP 404.

Static conclusion: Action 958 has not been verified as resolving the Production
timeout. The remaining issue is still a data-health/readback readiness blocker,
not a broker or automatic execution signal.

## Query Path Inventory

| Path | Static finding | Production relevance |
| --- | --- | --- |
| `app/trade-app.tsx` `loadTradeData(...)` recent batch read | Client-side Production page load/refresh path. `supabase.from("recommendation_batches").select("*").order("published_at", ...).limit(100)`. | Read-only and bounded; not the observed `in.(...)` timeout path. |
| `app/trade-app.tsx` `loadTradeData(...)` `select_outcome_batch_backfill` | Client-side Production page load/refresh path. Uses `.in("batch_fingerprint", missingBatchFingerprints)` without chunking. | Read-only. Separate unchunked risk if Production console shows `batch_fingerprint=in.(...)`; this does not match the reported `scan_run_fingerprint=in.(...)` request. |
| `app/trade-app.tsx` `loadTradeData(...)` `select_outcome_scan_run_batch_backfill` | Client-side Production page load/refresh path. Uses `fetchChunkedRecommendationBatchBackfillRows(...)` and then `.in("scan_run_fingerprint", [...fingerprintChunk])`. | Read-only. This is the reported query shape. Current source is chunked, but each chunk still uses `scan_run_fingerprint=in.(...)`. |
| `lib/recommendation-batch-backfill.ts` | Current chunk size is `50`; current total cap is `250`. | A chunk of 50 fingerprints may still be too expensive in Production if the table/index/data shape is unfavorable. |
| `app/api/recommendations/evaluate-outcomes/route.ts` `POST(...)` | Server route reads `.in("batch_fingerprint", batchFingerprints)` when invoked. | Read-only for this query. Not a normal page-load console path and not invoked by this action. |
| `lib/recommendation-batch-memory.ts` `persistRecommendationBatch(...)` | Mutation-capable helper may upsert `recommendation_batches` when supplied a Supabase client. | Not read-only, but not the observed console read timeout path and not invoked by this action. |

## Action 958 Wiring Verification

Static code review confirms the current source imports and uses
`fetchChunkedRecommendationBatchBackfillRows(...)` for the scan-run backfill
path:

- import is present in `app/trade-app.tsx`;
- helper lives in `lib/recommendation-batch-backfill.ts`;
- helper sanitizes, de-duplicates, caps, and chunks fingerprints;
- `missingScanRunFingerprints` is passed into the helper;
- the Supabase `.in("scan_run_fingerprint", ...)` call receives
  `fingerprintChunk`, not the full `missingScanRunFingerprints` array;
- no direct old
  `.in("scan_run_fingerprint", missingScanRunFingerprints)` call remains in
  `app/trade-app.tsx`.
- `tests/e2e/recommendation-batch-backfill.spec.ts` covers the helper behavior
  used by the Production scan-run backfill path: empty lists, bounded chunks,
  cap behavior, deterministic row order, de-duplication, failure behavior, and
  client-safe helper boundaries.

This means the current repository source is not the exact pre-Action-958
unbounded scan-run query. The Production observation can still happen because
the URL pattern remains `scan_run_fingerprint=in.(...)` for each chunk.

## Local Deploy-Mismatch Indicators

Local non-secret source-control context:

| Item | Finding |
| --- | --- |
| Branch | `main` |
| Commit | `9f380ee` |
| Chunking helper present | Yes, `lib/recommendation-batch-backfill.ts` exists in the current working tree. |
| Chunking wiring present | Yes, `app/trade-app.tsx` imports and calls `fetchChunkedRecommendationBatchBackfillRows(...)`. |
| Production bundle/cache verified | No. This action did not call hosting APIs, inspect CDN cache, or open Production bundles. |

The operator-reported Production console still shows
`scan_run_fingerprint=in.(...)`. That can be either a normal chunked request
shape or stale pre-chunking code. Browser cache, CDN cache, or a hosting deploy
mismatch remains possible but unproven from static evidence.

## Remaining Cause Assessment

| Possibility | Assessment | Notes |
| --- | --- | --- |
| Old bundle/cache/deploy mismatch | Plausible | If Production is still serving old JavaScript, the browser may still run the pre-chunking query. This action did not inspect Production bundles or hosting deploy state. |
| Chunk size still too large | Plausible and likely actionable | Current chunks can contain 50 scan-run fingerprints. Production can still time out one chunk if `recommendation_batches` is large, indexed poorly, or under load. |
| Defensive cap still too high | Plausible | Current cap is 250 fingerprints, which can produce up to five sequential REST reads on refresh. |
| Separate unchunked `batch_fingerprint` path | Secondary risk | The source still contains an unchunked batch-fingerprint backfill, but the operator-reported failing URL was `scan_run_fingerprint=in.(...)`. |
| Deeper DB/index issue | Plausible | Static schema artifacts mention a scan-run fingerprint index, but this action did not query Production to verify index existence or query plan behavior. |
| `scheduled_scan_attempts` 404 | Separate issue | The 404 remains unrelated to the `recommendation_batches` timeout and needs separate schema/REST exposure triage. |

## Production Decision

Decision: keep Production online with warnings if the UI remains usable and the
errors remain limited to readback/diagnostic data paths.

Rollback is not recommended from this static triage alone because:

- Production UI reportedly still loads;
- no unsafe broker/Avanza behavior was observed;
- no automatic order behavior was observed;
- the failing paths are read-only data backfill/diagnostics paths;
- this action did not perform a deploy or runtime change.

Live market trial remains no-go while the `recommendation_batches` timeout and
`scheduled_scan_attempts` 404 are unresolved or unaccepted.

## Action 961 Follow-Up

Rationale:

- current source already chunks `scan_run_fingerprint` backfill;
- Production still reports `scan_run_fingerprint=in.(...)`;
- the safest next code change is to reduce pressure per request and per page
  refresh without adding routes, server-side rewrites, schema changes, or live
  DB work;
- the separate unchunked `batch_fingerprint` path should remain documented as
  a follow-up if Production shows `batch_fingerprint=in.(...)` timeouts.

Completed Action 961 scope:

- lower `RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE` from `50` to `10`;
- lower `RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP` from `250` to `100`;
- preserve read-only, fail-soft, count-only warning behavior;
- preserve no provider calls, no route calls, no DB writes, no schema changes,
  and no broker/Avanza behavior.

Action 961 follow-up: the stabilization patch reduced chunk size from `50` to
`10` and total cap from `250` to `100` while preserving the read-only,
fail-soft scan-run backfill behavior.

## Next Implementation Options

| Option | Assessment | Recommendation |
| --- | --- | --- |
| Option A - reduce chunk size from `50` to `10` or `20` | Lower per-request URL length and query work while preserving the current client-side read-only design. | Recommended first. |
| Option B - reduce total cap from `250` to `100` | Limits refresh-time pressure and number of sequential chunk reads. | Recommended with Option A during Production stabilization. |
| Option C - also chunk/cap `batch_fingerprint` backfill | Addresses the separate unchunked read-only path if Production shows `batch_fingerprint=in.(...)`. | Defer unless Action 961 scope is expanded or Production shows this exact path failing. |
| Option D - skip backfill above cap and log warning | Strongest app-side guard against repeated heavy readback work. | Consider if reduced chunking still times out. |
| Option E - server/RPC/index migration | Could address deeper database/index/query-plan issues. | Keep separate; requires explicit Production schema/DB approval. |

`select("*")` remains another performance risk because it reads full rows.
Narrowing selected fields may help, but that should be a separate deliberate
change unless Action 961 explicitly includes selected-column review.

Failed chunks currently produce a fail-soft error path and do not merge partial
rows. Continuing past failed chunks could improve partial UI data, but it would
change failure semantics and should not be bundled into this triage.

## Risk Assessment

| Area | Risk | Notes |
| --- | --- | --- |
| Frontend app shell | Low | Production UI reportedly still loads. |
| Recommendations/history/statistics data | Medium/high | Recommendation batch context can remain incomplete, causing fallback/selective state and degraded readback/diagnostics. |
| Production data health | Medium/high | Repeated REST statement timeouts indicate query-shape, index, or data-volume pressure. |
| Live-trial readiness | Blocked | Live market trial remains no-go until the timeout and `scheduled_scan_attempts` 404 are fixed or explicitly accepted. |
| Execution/broker safety | Low | The failing path is read-only recommendation diagnostics/readback and does not imply broker/Avanza or automatic order behavior. |
| Audit writer safety | Low | The failing path is unrelated to the server-only audit writer path, and no audit writer path was changed. |

## Not Performed

- No runtime behavior was changed.
- No Production bundle/cache/deploy inspection was performed.
- No live database read or write was performed.
- No Supabase manual call was performed.
- No provider call was performed.
- No scan route was invoked.
- No service-role adapter was called.
- No migration was run.
- No type generation was run.
- No generated type was edited.
- No `.env.local` change was made.
- No audit writer path was changed.
- No broker/Avanza behavior was added.
- No automatic order behavior was added.
- No trade, stats, or PnL behavior was changed.

## Validation Results

Validation was run after documentation updates:

- Static query-path search identified the current `recommendation_batches`
  code paths.
- Static review confirmed the scan-run fingerprint backfill path is chunked in
  current source.
- Static review confirmed the `batch_fingerprint` backfill path remains a
  separate unchunked read-only risk.
- Runtime denial harness syntax/import checks passed.
- Audit writer runtime path import search passed.
- Static route invocation search did not call routes.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved server/test guardrails
  and documentation references only; no service-role values were printed.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy only.
- Status and next-action consistency scans passed.
- `git diff --check`, touched-file trailing whitespace scan, zero-byte docs
  check, `.env.local` diff check, `./node_modules/.bin/tsc --noEmit`, focused
  recommendation batch backfill tests, and `npm run lint` passed. Lint emitted
  the existing Babel deopt note for large `app/trade-app.tsx`.
