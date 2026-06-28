# recommendation_snapshots 500 Production Triage

## Purpose

Action 972 triages the Production browser-console `recommendation_snapshots`
HTTP 500 reported by operator evidence after the Action 969
`scheduled_scan_attempts` Production migration.

This is static/documentation-only triage. No runtime code, Supabase query,
remote SQL, migration, provider call, scan route, route invocation, type
generation, generated type edit, service-role adapter call, broker/Avanza
behavior, automatic mode, trade/stats/PnL mutation, or `.env.local` change was
performed.

Result status:
`recommendation_snapshots_500_production_triage_created`

Follow-up status: Action 973 created
`docs/recent-recommendation-readback-stabilization-patch.md` with result
status `recent_recommendation_readback_stabilization_patch_implemented`.

Follow-up status: Action 974 created
`docs/recent-recommendation-readback-production-verification.md` with result
status
`recent_recommendation_readback_production_verified_with_expected_warning`.

Recommended next action: Action 975 - Prepare Market-Window Dry Run.

## Operator Evidence

Latest operator-provided Production observation after the
`scheduled_scan_attempts` migration:

- Production UI loads.
- Recommendations tab renders.
- Header shows US stock market / closed today.
- Console no longer shows `scheduled_scan_attempts` 404.
- Console no longer shows `recommendation_batches` timeout.
- Console now shows `recommendation_snapshots` HTTP 500.
- Dashboard log identifies:
  - source: `Supabase.recommendation_snapshots`;
  - operation: `select_recent_recommendation_snapshots`;
  - error: object.
- No broker/Avanza behavior appears.
- No automatic order behavior appears.

No secrets were included in the provided observation summary.

## Reference Inventory

Static references found:

| Area | Reference | Notes |
| --- | --- | --- |
| Initial Production read path | `app/trade-app.tsx:8466` | Reads `recommendation_snapshots` with `select("*")`, orders by `created_at desc`, and limits to `1000`. |
| Error logging | `app/trade-app.tsx:8690` | Logs `dashboard_data_load_error` with operation `select_recent_recommendation_snapshots`. |
| Error impact | `app/trade-app.tsx:8696` | Marks `market_diagnostics` and `recommendations` islands as errored, then falls back to local snapshots during initial load. |
| Outcome snapshot backfill | `app/trade-app.tsx:8800` | Separate follow-up read by `snapshot_fingerprint` for missing outcome snapshots. This is not the observed operation. |
| Schema migration | `supabase/migrations/20260528000000_create_recommendation_snapshots.sql:1` | Creates `public.recommendation_snapshots`. |
| Generated DB types | `lib/supabase-database.types.ts:713` | Includes typed `recommendation_snapshots` row/insert/update shape. |
| Snapshot persistence helper | `lib/recommendation-snapshot.ts:935` | Writes snapshots through Supabase upsert when a client is supplied. |
| Learning schema list | `lib/recommendation-learning-schema.ts:7` | Includes `recommendation_snapshots` in learning schema references. |
| Prior docs | `docs/recommendation-batch-backfill-production-stabilization-verification.md` | Mentions `select_recent_recommendation_snapshots` as a prior Production console warning. |

Detailed static classification:

| Reference | Function / area | Runtime side | Access type | Production load/refresh? |
| --- | --- | --- | --- | --- |
| `app/trade-app.tsx` | Dashboard initial data load / `select_recent_recommendation_snapshots` | Client app | Read-only Supabase select | Yes, normal page load/refresh. This is the observed 500 path. |
| `app/trade-app.tsx` | `select_outcome_snapshot_backfill` | Client app | Read-only Supabase select by `snapshot_fingerprint` | Conditional after outcomes load; not the observed operation. |
| `app/trade-app.tsx` | `buildVisibleRecommendationSnapshotInput`, `buildRecommendationSnapshot`, diagnostics/readiness UI | Client app | In-memory/local readback plus snapshot construction | Yes, visible recommendations/readiness UI can use this data. |
| `app/trade-app.tsx` | `persistRecommendationSnapshot`, `markRecommendationSnapshotTaken` call sites | Client app | Mutation-capable if Supabase client is supplied; otherwise local fallback | Can run from app behavior, but not the observed read-only 500. |
| `app/api/recommendations/evaluate-outcomes/route.ts` | `loadRecentSupabaseSnapshots` | Server route | Read-only select, `created_at desc`, `limit(10)` | Only when the route is invoked; not normal page load by itself. |
| `app/api/recommendations/evaluate-outcomes/route.ts` | `loadOfficialLiveSnapshots` | Server route | Read-only selects by fingerprint, scan run, or payload batch fingerprint | Only when the route is invoked; not the observed operation. |
| `app/api/diagnostics/run-scan/route.ts` | Diagnostic scan snapshot build/persist path | Server route | Mutation-capable through snapshot persistence when route is invoked | Not normal page load; no route invocation performed in Action 972. |
| `app/api/recommendations/validate-add-trade/route.ts` | Validation fallback copy | Server route | No `recommendation_snapshots` table access found in this action; uses recommendation snapshot text/copy | Only when route is invoked. |
| `lib/recommendation-snapshot.ts` | `buildRecommendationSnapshot`, fingerprint, JSON, mapper, localStorage helpers | Shared helper | In-memory/localStorage read/write helpers | Used by client/server callers; table access only through supplied client. |
| `lib/recommendation-snapshot.ts` | `persistRecommendationSnapshot` | Shared helper | Mutation-capable Supabase upsert when caller supplies client; local fallback otherwise | Can run through approved callers; not the observed read path. |
| `lib/recommendation-snapshot.ts` | `markRecommendationSnapshotTaken` | Shared helper | Mutation-capable Supabase update when caller supplies client; local fallback otherwise | Can run through approved callers; not the observed read path. |
| `lib/recommendation-output-enrichment.ts` | Scanner QA/readback narrative | Shared/server-adjacent enrichment | Docs/string reference only | No direct table access. |
| `lib/scanner-output-qa.ts` | Scanner QA/readback narrative | Shared/server-adjacent QA | Docs/string reference only | No direct table access. |
| `lib/recommendation-learning-schema.ts` | Learning schema table list | Shared schema metadata | Static schema reference | No direct table access. |
| `lib/supabase-database.types.ts` | Generated DB type entry | Type metadata | Type-only | No runtime access. |
| `supabase/migrations/20260528000000_create_recommendation_snapshots.sql` | Table/index creation | Schema migration | Schema definition | Not runtime app load; not run in Action 972. |
| `tests/e2e/entry-type-diagnostics.spec.ts` | Snapshot fixture construction | Test-only | In-memory test fixtures | Test-only. |
| `tests/e2e/recommendation-build-diagnostics.spec.ts` | Diagnostics copy expectations | Test-only | Test assertions/copy | Test-only. |
| `docs/*recommendation*`, `docs/execution-agent-*` | Prior action trail and readiness notes | Docs-only | Documentation | No runtime access. |
| `app/trade-app (# Edit conflict ...).tsx` files | Stale conflict artifacts found by static search | Non-production artifact | Historical duplicate code references | Not imported as `app/trade-app.tsx`; left untouched. |

No static evidence from this action indicates that the observed Production
500 is caused by audit writer paths, broker/Avanza paths, automatic order
paths, market-loop/scanner invocation, or service-role exposure.

## Production Read Path

The static Production read path is:

```ts
supabase
  .from("recommendation_snapshots")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(1000)
```

Observed operation name:
`select_recent_recommendation_snapshots`.

Trigger: initial dashboard data load in the client app, alongside other
read-only dashboard Supabase calls.

Fail-soft behavior:

- the code logs the error;
- records island errors for `market_diagnostics` and `recommendations`;
- on initial load, falls back to local recommendation snapshots;
- does not call broker/Avanza;
- does not enable automatic order behavior;
- does not mutate trades, stats, PnL, or audit writer paths.

Blocking effect:

- the app still loads and the Recommendations tab renders per operator
  evidence;
- the console is not clean;
- live-trial readiness remains no-go until the Production 500 is fixed or
  explicitly accepted with a documented risk decision.

## Schema Expectation Inventory

Local schema expectation from
`supabase/migrations/20260528000000_create_recommendation_snapshots.sql`:

- table: `public.recommendation_snapshots`;
- primary key: `id text primary key`;
- unique field: `snapshot_fingerprint text not null unique`;
- nullable relation fields: `recommendation_id`, `scan_run_id`;
- nullable display/market fields: `ticker`, `recommended_at`,
  `market_session_phase`, `entry`, `stop`, `target`, `confidence`, `score`,
  `risk_reward`, `rationale`, `linked_position_id`;
- non-null defaults: `window`, `status`, `source_mode`, `data_mode`,
  `payload_json`, `was_taken`, `created_at`, `updated_at`;
- JSON fields: `payload_json`, `intake_quality_json`,
  `scan_observability_json`.

Local index expectation:

- `(ticker, created_at desc)`;
- `recommendation_id`;
- `scan_run_id`;
- `(status, created_at desc)`.

Static gap:

- no standalone `created_at desc` index was found for the exact global recent
  read path;
- no reduced-column read was found for the initial `select_recent` path;
- the read uses `select("*")` and `limit(1000)`, so large JSON payload columns
  can be included in the response.
- the local `recommendation_snapshots` migration does not include explicit RLS
  enablement, policies, or grant statements for this table. Production RLS,
  policy, and grant state was not verified in this action.

This action did not verify Production schema, Production indexes, row counts,
payload sizes, query plans, RLS, grants, or PostgREST logs. Those require a
separate approved read-only verification action if needed.

## Likely Causes

Likely causes from static evidence, ordered by fit:

1. Broad recent-read query pressure: `select("*")` plus `limit(1000)` can pull
   large `payload_json`, `intake_quality_json`, and
   `scan_observability_json` values.
2. Index mismatch: the query orders globally by `created_at desc`, while local
   migration indexes are composite `(ticker, created_at desc)` and
   `(status, created_at desc)`.
3. Production schema or index drift: Production may not match the local
   migration state, but this was not verified in Action 972.
4. Payload or row-shape drift: malformed/large rows could stress PostgREST or
   the client mapping after retrieval; static evidence cannot confirm this.
5. RLS/grant or schema-cache issue: possible but less directly supported by
   the HTTP 500 description and current static files.

## Risk Assessment

Safety risk is low for execution behavior because the observed path is a
read-only dashboard load and the action performed no remote operations.

Product/readiness risk is medium because the Recommendations tab can render
but the console is not clean and diagnostics/recommendations islands receive
an error state.

Operational risk is medium because `recommendation_snapshots` is part of
readback, outcome linking, and learning/readiness evidence. A persistent 500
can hide useful Production recommendation history and weakens live-trial
confidence.

Trading safety remains protected:

- no broker/Avanza behavior was observed;
- no automatic order behavior was observed;
- no market-loop/scanner invocation was performed;
- no route call was performed;
- no trade/stats/PnL mutation was performed.

## Fix Options

Option A - Reduce and fail-soft the recent snapshots read.

- Reduce the initial limit from `1000` to a smaller cap.
- Consider selecting only columns needed for the visible recommendations
  readback path.
- Keep local fallback and island diagnostics.
- Add a guard so snapshot read failure does not block the rest of the
  Production dashboard.
- Best fit for the current static finding.

Option B - Add a schema/index verification plan.

- Separately approve read-only Production verification for table existence,
  column shape, index list, RLS/grants, and a minimal explain or query plan if
  available.
- Best if the reduced query still fails or if Production drift is suspected.

Option C - Add a standalone `created_at desc` index.

- Requires a separately approved Production migration.
- Should follow read-only verification or code-side reduction unless evidence
  shows the index is the clear bottleneck.

Option D - Split readback by use case.

- Keep recent visible cards small.
- Fetch detailed payload/backfill data only by fingerprint or specific
  recommendation identifiers.
- More architectural; not the smallest immediate repair.

## Production Decision

Decision: keep Production online with warnings.

Rationale:

- Production UI loads.
- Recommendations tab renders.
- The previous `scheduled_scan_attempts` 404 is gone in operator evidence.
- The previous `recommendation_batches` timeout is gone in operator evidence.
- The remaining error is a read-only `recommendation_snapshots` HTTP 500.
- No broker/Avanza behavior or automatic order behavior appears.

Live market trial remains no-go until the `recommendation_snapshots` 500 is
resolved or explicitly accepted with a documented risk decision.

## Result Status

`recommendation_snapshots_500_production_triage_created`

## Recommended Next Action

Action 975 - Prepare Market-Window Dry Run.

Action 974 verified the Production console after deploy. The previous
`select_recent_recommendation_snapshots` HTTP 500 is no longer visible.

## Validation Results

Validation was run after documentation updates:

- Runtime denial harness syntax/import checks passed.
- Static audit writer runtime path import search found only existing approved
  server route/test guardrails, with no UI/app-shell client import.
- `NEXT_PUBLIC_*SERVICE*` and service-role exposure scans found no client
  exposure and printed no secret values.
- Recommendation-snapshots triage scan confirmed references to
  `recommendation_snapshots` and `select_recent_recommendation_snapshots`.
- Dead-doc/path scan passed.
- Touched-file trailing whitespace scan passed.
- `git diff --check` passed.
- `find docs -type f -size 0` passed with no output.
- `.env.local` diff check remained clean.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Not Performed

- No runtime code change.
- No Supabase query.
- No remote SQL.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No provider call.
- No scan route invocation.
- No route invocation.
- No service-role adapter call.
- No audit writer path change.
- No UI/browser/client behavior change.
- No market-loop/scanner behavior.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No trade/stats/PnL mutation.
