# Recommendation Batch Timeout Fix Plan

## Purpose

Action 957 creates a documentation-only fix plan for the Production
`recommendation_batches` timeout observed after the accidental Production
deploy.

Result status: `recommendation_batch_timeout_fix_plan_created`

Follow-up status: Action 958 implemented
`docs/recommendation-batch-timeout-fix-implementation.md` with result status
`recommendation_batch_timeout_chunking_implemented`.

Follow-up status: Action 959 created
`docs/recommendation-batch-timeout-production-verification.md` with result
status `recommendation_batch_timeout_production_verification_blocked`.

Follow-up status: Action 960 created
`docs/recommendation-batch-timeout-remaining-error-triage.md` with result
status `recommendation_batch_remaining_error_triage_created`.

Follow-up status: Action 961 implemented
`docs/recommendation-batch-backfill-stabilization-patch.md` with result status
`recommendation_batch_backfill_stabilization_patch_implemented`.

Recommended next action: Action 962 - Verify Stabilized Recommendation Batch
Backfill in Production.

This action is a fix plan only. No runtime code, Supabase call, live DB
read/write, provider call, route call, scan, service-role adapter call,
broker/Avanza behavior, automatic order behavior, migration, type generation,
generated type edit, or `.env.local` change was performed.

## Problem Summary

Production browser console shows a `recommendation_batches` Supabase REST
HTTP 500 with the error `canceling statement due to statement timeout`.

Action 956 statically mapped the failing endpoint pattern to
`app/trade-app.tsx` `loadTradeData(...)`, specifically the unchunked
backfill query:

```ts
supabase
  .from("recommendation_batches")
  .select("*")
  .in("scan_run_fingerprint", missingScanRunFingerprints);
```

The risk is that `missingScanRunFingerprints` can become too broad when many
historical outcomes/snapshots need batch context. A single large `.in(...)`
REST request can time out in Production even if the app shell remains usable.

## Current Code Path

| Item | Static finding |
| --- | --- |
| File | `app/trade-app.tsx` |
| Function | `loadTradeData(...)` |
| UI/load trigger | Initial app load and background/manual refresh via `refreshIslands(...)` / `refreshCurrentSurface(...)` |
| Runtime side | Client/browser |
| Operation type | Read-only Supabase REST request through the public client |
| Input source | `outcomeRelatedSnapshots`, built from loaded recommendation outcomes and live recommendation snapshots |
| Existing fingerprints | `loadedRecommendationBatchesForReadback.map((batch) => batch.scan_run_fingerprint)` |
| Requested fingerprints | `missingScanRunFingerprints`, derived from snapshot `scan_run_id` and `payload_json.scan_run_fingerprint` values not already present in loaded batches |
| Query builder chain | `.from("recommendation_batches").select("*").in("scan_run_fingerprint", missingScanRunFingerprints)` |
| Downstream use | Rows are mapped with `recommendationBatchFromPersistenceRow`, filtered to live official batches, merged by `batch_fingerprint`, assigned to `loadedRecommendationBatchesForReadback`, written into React state with `setStoredRecommendationBatches(...)`, and used for outcome/readback diagnostics. |
| Error behavior | On error, the code records `outcomeBackfillError`, logs `[trade-app] dashboard_data_load_error`, notes a `market_diagnostics` island error, and preserves fallback behavior. |

## Likely Causes

- Large `.in(...)` list for `scan_run_fingerprint`.
- Missing or insufficient Production DB index on `scan_run_fingerprint`.
- Too much data fetched at once through `select("*")`.
- Client-side backfill scope too broad for a browser-triggered readback path.
- Missing query chunking or maximum-fingerprint cap.
- Supabase REST statement timeout constraints.

Static schema artifacts indicate `supabase/production_repair_recommendation_learning_loop.sql`
contains `recommendation_batches_scan_run_fingerprint_idx`, but this action did
not verify whether that index exists in Production.

## Fix Options

| Option | Summary | Pros | Cons | Recommendation |
| --- | --- | --- | --- | --- |
| A - Chunk `.in(...)` list in client readback | Split `missingScanRunFingerprints` into bounded chunks, query each chunk, merge results locally. | Safest immediate app-side stabilization; preserves read-only behavior; no DB migration required; local tests can prove bounds. | More requests than one query; still depends on Production index/data shape; needs careful error handling. | Recommended first fix, paired with a defensive cap. |
| B - Add query guard/cap only | Skip or truncate very large backfill lists. | Fastest and lowest code complexity; avoids timeout by refusing broad reads. | Can leave historical batch context unresolved; may reduce diagnostics completeness. | Useful as a fallback/emergency guard, but not sufficient alone. |
| C - Server-side endpoint/RPC | Move the lookup into a route or RPC with server-side bounds and possibly optimized SQL. | Better long-term control, observability, and error handling. | Higher boundary/security review; route/RPC approval needed; more moving parts. | Defer unless client chunking is insufficient. |
| D - DB index/migration | Verify/add `recommendation_batches(scan_run_fingerprint)` index or schema repair. | May address root query performance if index is absent. | Requires Production schema verification and migration approval; not proven by static triage alone. | Separate verification track, not part of the immediate app-side fix. |

Recommended approach: Option A plus a defensive cap.

## Proposed Implementation For Action 958

Action 958 should implement the smallest runtime fix:

1. Add a small helper for chunking non-empty scan run fingerprints.
2. Bound each `.in("scan_run_fingerprint", chunk)` request to a conservative
   chunk size, for example 25 to 50 fingerprints.
3. Add a maximum total fingerprint cap for the backfill path.
4. If the cap is exceeded, record a warning/diagnostic state and skip or
   truncate the excess rather than throwing.
5. Preserve the existing `.select("*")` behavior unless a separate action
   approves narrowing selected fields.
6. Merge all chunk results deterministically by `batch_fingerprint`.
7. Preserve current filtering:
   `isLiveRecommendationBatch(batch) && batch.batch_type === "official"`.
8. Preserve fallback behavior when rows are missing or a chunk fails.
9. Preserve `outcomeBackfillError`, diagnostics counts, and
   `noteIslandError("market_diagnostics", ...)` semantics where possible.
10. Do not alter Supabase env/config.
11. Do not touch audit writer/server-only paths.
12. Do not add broker/Avanza behavior, automatic mode enablement, or
   trade/stats/PnL mutation.

## Tests Required

- Unit/helper test for chunking behavior.
- Test preserving empty and missing fingerprint behavior.
- Test proving no query is attempted for an empty fingerprint list.
- Test proving chunk count and chunk size are bounded.
- Test proving cap-exceeded behavior records a warning and does not throw.
- Test proving chunk results merge deterministically by `batch_fingerprint`.
- Test proving existing fallback/error behavior is preserved for failed chunks.
- Source/static test proving no service-role/env/server-only import is added to
  client code.
- Regression coverage for `loadTradeData(...)` backfill behavior if the current
  test harness can isolate it.
- `./node_modules/.bin/tsc --noEmit`.
- `npm run lint`.
- Focused non-live baseline pack for recommendation/outcome diagnostics if
  available.
- Safety scans for audit writer route invocation, service-role exposure,
  broker/Avanza behavior, automatic order behavior, and `.env.local` changes.

## Risk Assessment

| Area | Risk | Notes |
| --- | --- | --- |
| Frontend app shell | Low | The proposed fix remains read-only and should reduce timeout pressure. |
| Recommendations/history data completeness | Medium | Chunking preserves more completeness than skipping, but cap-exceeded cases may leave some historical context unresolved. |
| Production timeout risk | Medium/high until fixed | The current unchunked query can continue to time out on refresh. |
| Execution/broker safety | Low | The path is readback/diagnostics only and does not touch broker/Avanza or order submission. |
| Audit writer safety | Low | The fix must remain unrelated to the server-only audit writer path. |
| Live-trial readiness | Blocked | Live trial remains no-go until the timeout is fixed or explicitly accepted with a documented risk decision. |

## Rollout Plan

1. Implement the chunked/capped client readback fix in Action 958.
2. Run the focused tests and static safety scans.
3. Run `tsc` and lint.
4. Deploy to Preview/Staging if available.
5. Verify the Production-equivalent console no longer shows
   `recommendation_batches` statement timeout for scan-run backfill.
6. If Production hotfix is needed, deploy only after tests pass.
7. After deploy, verify Production console behavior and document the result.
8. Keep live market trial no-go until Production console verification,
   `scheduled_scan_attempts` schema triage, provider/env readiness, and
   market-window checklist are complete.

## Action 960 Follow-Up

Action 960 documented that Production still shows a
`recommendation_batches` timeout for `scan_run_fingerprint=in.(...)`.
Current source is already chunked for the scan-run path, with chunk size `50`
and cap `250`, so the next lowest-risk adjustment is reducing those bounds.
The separate `batch_fingerprint` backfill remains an unchunked read-only risk,
but it does not match the operator-reported failing endpoint pattern.

Action 961 reduced the scan-run chunk size to `10` and total cap to `100`.

## Deferred Work

- `scheduled_scan_attempts` 404 Production schema verification remains a
  separate action.
- Production DB index/schema verification remains separate.
- Any migration or repair SQL remains separate and requires explicit approval.
- Route/RPC/server-side redesign remains separate.
- Provider/live scan verification remains separate.
- Broker/Avanza integration remains out of scope.
- Automatic order submission remains out of scope.

## Validation Results

Validation was run after documentation updates:

- Static code search identified the current timeout path.
- Runtime denial harness syntax/import checks passed.
- Audit writer runtime path import search passed.
- Static route invocation search did not call routes.
- UI import/search for audit writer route invocation, lifecycle hook,
  lifecycle caller, transition boundary, proof harnesses, monitoring, cleanup,
  and rollout terms found no unsafe client wiring.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved server/test guardrails
  and documentation references only; no service-role values were printed.
- Broad env/client/write scan returned existing app Supabase/localStorage paths
  and guardrails only.
- Timeout-fix-plan-specific scan returned expected static Supabase/readback and
  documentation references only.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy.
- Status and next-action consistency scans passed.
- `git diff --check`, touched-file trailing whitespace scan, zero-byte docs
  check, `.env.local` diff check, `./node_modules/.bin/tsc --noEmit`, and
  `npm run lint` passed. Lint emitted the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Not Performed

- No runtime code was modified.
- No Supabase call, DB read/write, provider API call, route call, scheduled
  scan, Generate More route call, live market scan, service-role adapter call,
  live proof/insert/query, broker/Avanza automation, automatic order behavior,
  migration, typegen, generated type edit, deploy, or rollback was performed.
- No audit writer runtime persistence path, UI/browser/client invocation,
  market-loop/scanner invocation, handlers/effects/state mutation, JSX, hooks,
  components, reducers, or `.env.local` values were changed.
