# Production Console Manual Observation After scheduled_scan_attempts Migration

## Purpose

Action 971 records the manual Production console observation request after the
Action 969 `scheduled_scan_attempts` Production migration and the Action 970
verification-access blocker.

This action is documentation/manual verification tracking only. No runtime
code, schema, provider, route, scan, service-role adapter, broker/Avanza,
automatic order, type generation, generated type, or `.env.local` change was
performed.

Result status:
`production_console_manual_observation_blocked`

Follow-up status: Action 972 created
`docs/recommendation-snapshots-500-production-triage.md` with result status
`recommendation_snapshots_500_production_triage_created`.

Follow-up status: Action 973 created
`docs/recent-recommendation-readback-stabilization-patch.md` with result
status `recent_recommendation_readback_stabilization_patch_implemented`.

Follow-up status: Action 974 created
`docs/recent-recommendation-readback-production-verification.md` with result
status
`recent_recommendation_readback_production_verified_with_expected_warning`.

Recommended next action: Action 975 - Prepare Market-Window Dry Run.

## Production App URL / Environment

| Item | Result | Notes |
| --- | --- | --- |
| Production app URL | Block | Not provided in the Action 971 request. |
| Observation timestamp | Block | No manual browser observation timestamp was provided. Documentation update timestamp: `2026-06-28 04:31:21 CEST`. |
| Browser/manual observation source | Block | No screenshot, pasted console output, or operator observation summary was provided. |
| Production Supabase project | Pass | Action 969 target remains Trade / `ekdyopdrrkphlrsilyoo` / `https://ekdyopdrrkphlrsilyoo.supabase.co`. |
| `.env.local` changes | Pass | No `.env.local` changes were made. |
| Additional migrations/typegen/generated type edits | Pass | None performed. |

Action 969 remains the latest successful remote verification evidence:

- `public.scheduled_scan_attempts` exists;
- `utc_timestamp` is present and non-null with default `now()`;
- primary key, unique `attempt_fingerprint`, expected indexes, and RLS-disabled
  flags are present;
- REST returns HTTP 200 with `[]` for
  `/rest/v1/scheduled_scan_attempts?select=id,utc_timestamp&limit=1`.

## Manual UI Observation

| Item | Result | Notes |
| --- | --- | --- |
| App shell loads | Block | No manual Production browser observation was provided. |
| Recommendations tab renders | Block | No manual Production browser observation was provided. |
| Live Day Trades tab available | Block | No manual Production browser observation was provided. |
| Stats Today tab available | Block | No manual Production browser observation was provided. |
| Settings navigation available | Block | No manual Production browser observation was provided. |
| Status header renders | Block | No manual Production browser observation was provided. |
| No blank screen/runtime crash | Block | No manual Production browser observation was provided. No new crash evidence was reported. |

## Manual Console Observation

| Item | Result | Notes |
| --- | --- | --- |
| `scheduled_scan_attempts` 404 gone | Block | Not manually observed in the deployed app console. Action 969 REST evidence shows the endpoint returns HTTP 200. |
| `recommendation_batches` timeout gone | Block | Not manually observed in the deployed app console in Action 971. |
| `recommendation_snapshots` 500 gone | Block | Not manually observed in the deployed app console in Action 971. |
| No new Supabase 4xx/5xx | Block | No manual console evidence was provided. |
| No audit writer client errors | Pass by static evidence | No new audit writer UI/browser/client invocation was added. |
| No service-role/env exposure | Pass by static evidence | No secrets were printed and no client-side service-role exposure was added. |
| No broker/Avanza/automatic order behavior | Pass by static evidence | No broker/Avanza behavior or automatic order enablement was added. |

## Remaining Warnings

- Manual Production browser-console observation remains blocked pending
  Production app URL and/or operator evidence.
- Market-window behavior remains pending until a separately approved
  market-window dry run.
- Provider/live-market validation remains pending until market-window review.
- Existing local lint output may include the known Babel deopt note for large
  `app/trade-app.tsx`; that is not a Production browser console issue.
- If a browser/devtools filtered-message banner is present in future evidence,
  it should be documented separately from app/runtime errors.

## Production Keep/Rollback Decision

Decision: keep Production online with warnings.

Rollback/repair is not recommended from Action 971 because no new deployed app
runtime error was provided and Action 969 verified the original table-level
REST 404 is fixed at the Supabase endpoint.

This is still not a clean-console pass. The blocker is missing manual evidence.

## Live-Trial Decision

Live market trial remains no-go.

The readiness state does not advance to `market_window_dry_run_candidate`
until manual Production console observation confirms the app shell,
Recommendations tab, status header, and absence of the previous Supabase
console errors, or until remaining warnings are explicitly accepted.

## Result Status

`production_console_manual_observation_blocked`

Reason: the Action 971 request did not provide the Production app URL,
screenshot/manual console evidence, or observation results needed to complete
the manual verification.

## Action 972 Follow-Up

Action 972 operator evidence resolved the Action 971 observation blocker and
identified a narrower remaining Production console issue:

- Production UI loads.
- Recommendations tab renders.
- Header shows US stock market / closed today.
- `scheduled_scan_attempts` 404 is no longer visible.
- `recommendation_batches` timeout is no longer visible.
- `recommendation_snapshots` HTTP 500 remains visible for operation
  `select_recent_recommendation_snapshots`.
- No broker/Avanza behavior appears.
- No automatic order behavior appears.

Action 972 created
`docs/recommendation-snapshots-500-production-triage.md`.

## Action 973 Follow-Up

Action 973 result status:
`recent_recommendation_readback_stabilization_patch_implemented`.

Action 973 reduced recent `recommendation_snapshots` and
`recommendation_outcomes` readback limits to `100` and added warning-level
fail-soft fallback behavior. Production console verification after deploy is
still required.

## Action 974 Follow-Up

Action 974 result status:
`recent_recommendation_readback_production_verified_with_expected_warning`.

Latest operator evidence confirms Production UI loads, Recommendations tab
renders, and the previous red `scheduled_scan_attempts`,
`recommendation_batches`, `recommendation_snapshots`, and
`recommendation_outcomes` console blockers are no longer visible. The remaining
`recommendation_batch_backfill_capped` warning is expected and non-fatal.

## Recommended Next Action

Action 975 - Prepare Market-Window Dry Run.

## Validation Results

Validation was run after documentation updates:

- Runtime denial harness syntax/import checks passed.
- Audit writer runtime path import search passed.
- Static route invocation search did not call routes.
- UI/app-shell audit writer import scan passed.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search did not find code exposure.
- Service-role leakage search returned existing approved server/test guardrails
  and documentation references only; no service-role values were printed.
- Production-console-manual-observation-specific scan returned
  documentation-only boundary terms and approved guardrails.
- Automatic-mode safety scan returned existing human-confirmation and safety
  copy.
- Dead-doc/path scan passed.
- Status string consistency scan passed.
- Next-action consistency scan passed.
- `git diff --check` passed.
- Touched-file trailing whitespace scan passed.
- Zero-byte docs check passed.
- `.env.local` diff check remained clean.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Not Performed

- No runtime code change.
- No additional migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No provider call.
- No scan route invocation.
- No live market scan.
- No route call.
- No Supabase mutation.
- No service-role adapter app call.
- No audit writer UI/browser/client invocation.
- No market-loop/scanner audit writer invocation.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No automatic order behavior.
- No trade/stats/PnL mutation.
