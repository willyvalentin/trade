# Recommendation Batch Backfill Fail-Soft Patch

## Purpose

Action 963 implements a conservative fail-soft patch for the remaining
Production `recommendation_batches` timeout after Actions 958, 961, and 962.

Result status: `recommendation_batch_backfill_fail_soft_patch_implemented`

Recommended next action: Action 964 - Verify Recommendation Batch Fail-Soft
Patch in Production.

The patch is read-only and app-side. It prioritizes Production UI stability
over historical recommendation batch completeness by skipping risky scan-run
backfill requests before they can hit Supabase timeout limits.

## Code Changes

Files changed:

- `lib/recommendation-batch-backfill.ts`
- `app/trade-app.tsx`
- `tests/e2e/recommendation-batch-backfill.spec.ts`

Runtime bounds changed:

| Bound | Previous Action 961 value | New Action 963 value |
| --- | --- | --- |
| `RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE` | `10` | `5` |
| `RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP` | `100` | `20` |
| `MAX_RECOMMENDATION_BATCH_BACKFILL_FINGERPRINTS` | Not present | `20` |

Skip behavior:

- Missing scan-run fingerprints are still trimmed and de-duplicated first.
- If the normalized count is greater than `20`, the helper returns
  `ok: true`, `rows: []`, `chunks: []`, `fingerprintsCapped: true`, and
  `backfillSkipped: true`.
- In the skipped case, the injected chunk fetcher is not called, so no
  `recommendation_batches` Supabase request is attempted for that backfill.
- Warning metadata remains count-only: requested count, capped/queryable count,
  cap, chunk size, and skip flag.
- No fingerprint list is printed.

Behavior preserved:

- Empty missing-fingerprint lists still perform zero queries.
- Lists at or below 20 fingerprints still query in bounded chunks of 5.
- Failed chunks still fail-soft and return no partial rows.
- Deterministic row merge behavior is preserved for queried chunks.
- `app/trade-app.tsx` recommendation batch mapping/filtering/downstream merge
  behavior remains unchanged.

## Behavior Preservation

- The `recommendation_batches` backfill query remains read-only when it runs.
- Large-list skip behavior is intentional and preserves the existing
  recommendation UI fallback/selective behavior.
- Existing count-only warning behavior is preserved and now includes
  `backfillSkipped`.
- `scheduled_scan_attempts` 404 handling was not changed.
- No Supabase env/config/schema/RLS work was performed.
- No migrations or type generation were run.
- No audit writer/server-only paths were changed.
- No broker/Avanza behavior was added.
- No automatic mode or automatic order behavior was enabled.

## Tests

Updated `tests/e2e/recommendation-batch-backfill.spec.ts` to cover:

- empty list performs zero queries;
- small lists under the threshold query in bounded chunks;
- 20 missing fingerprints split into four chunks of 5;
- lists over 20 skip before querying and return empty rows;
- skip metadata is count-only;
- normalized/de-duplicated order is preserved;
- failed chunk fail-soft behavior remains;
- helper remains dependency-free and client-safe with no `server-only`,
  Supabase package import, `process.env`, service-role term, or `fetch(`.

## Production Rollout Note

Production is currently online with warnings. Because Ture is not publicly
released and Production is being used as the verification environment for this
readback fix, this patch can be deployed directly to Production after
validation passes and operator approval is satisfied.

Expected improvement after deploy:

- large historical `select_outcome_scan_run_batch_backfill` lists are skipped;
- the browser should no longer emit repeated
  `recommendation_batches?select=*&scan_run_fingerprint=in.(...)` timeouts for
  oversized scan-run backfills;
- historical batch context may be incomplete, so fallback/selective
  recommendation UI states remain acceptable.

Live market trial remains no-go until Production data health is cleaner and
remaining Supabase read errors are fixed, reduced, or explicitly accepted.

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
- Backfill-fail-soft-specific scan returned the intended helper, app readback,
  tests, and documentation references only.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy only.
- Dead-doc/path, status string, and next-action consistency scans passed.
- `git diff --check`, touched-file trailing whitespace scan, zero-byte docs
  check, `.env.local` diff check, `./node_modules/.bin/tsc --noEmit`, and
  `npm run lint` passed. Lint emitted the existing Babel deopt note for large
  `app/trade-app.tsx`.
