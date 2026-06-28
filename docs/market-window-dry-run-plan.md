# Market-Window Dry-Run Plan

## Purpose

Action 975 prepares the next market-window dry run after Action 974 verified
Production recommendation readback stabilization.

This is documentation/readiness only. It is not live trade approval, production
rollout approval, provider invocation approval, route invocation approval, scan
approval, database access approval, or broker approval.

No runtime code, migration, type generation, generated type, `.env.local`,
provider, route, scan, Supabase, database, service-role adapter, audit writer
runtime path, broker/Avanza, automatic mode, automatic order, or
trade/stats/PnL behavior is changed by this action.

Result status: `market_window_dry_run_plan_created`

Follow-up status: Action 976 created
`docs/market-window-dry-run-observation.md` with result status
`market_window_dry_run_blocked`.

Follow-up status: Action 977 updated
`docs/market-window-dry-run-observation.md`; result status remains
`market_window_dry_run_blocked`.

Follow-up status: Action 978 updated
`docs/market-window-dry-run-observation.md`; result status remains
`market_window_dry_run_blocked`.

Recommended next action: Action 979 - Provide Production URL And Operator
Open-Session Evidence.

Separate planning follow-up: Action 980 created
`docs/semi-automatic-avanza-agent-integration-inventory.md` with result status
`semi_automatic_avanza_agent_integration_inventory_created`. This inventory is
documentation-only and does not change the market-window dry-run blocker,
Production observation requirement, broker boundary, or automatic-order
boundary.

## Current Production Readiness State

Production readiness entering the market-window dry-run preparation:

| Area | State | Result |
| --- | --- | --- |
| Production UI | App shell loads. | Pass |
| Recommendations tab | Tab renders. | Pass |
| Previous red Supabase 404/500 blockers | No longer visible in latest operator evidence. | Pass |
| `scheduled_scan_attempts` 404 | No longer visible. | Pass |
| `recommendation_batches` timeout | No longer visible. | Pass |
| `recommendation_snapshots` 500 | No longer visible. | Pass |
| `recommendation_outcomes` 500 | No longer visible. | Pass |
| Remaining warning | `[trade-app] recommendation_batch_backfill_capped`, operation `select_outcome_scan_run_batch_backfill`, `requestedFingerprintCount: 21`. | Warn |
| Warning interpretation | Expected fail-soft, count-only, non-fatal recommendation batch backfill guard. | Accept |
| Production keep/rollback | Keep Production online with expected warning. | Pass |
| Broker/Avanza behavior | Absent in latest evidence. | Pass |
| Automatic order behavior | Absent in latest evidence. | Pass |
| Execution model | Semi-auto, human-confirmed model remains required. | Pass |

The remaining warning should be observed during the dry run, but it is not a
current blocker if it stays warning-only and non-fatal.

## Dry-Run Scope

Scope:

- US market only.
- Observe pre-market, market-open, and active-market UI behavior.
- Observe recommendations, market status, and execution handoff copy only.
- Use Production UI observation and browser console observation only.
- Record pass/warn/block outcomes without invoking unapproved paths.

Out of scope:

- No real trades.
- No broker/Avanza behavior.
- No automatic order submission.
- No automatic mode enablement.
- No manual provider calls.
- No manual route calls.
- No manual scan invocations.
- No manual Supabase or database reads/writes.
- No service-role adapter calls.
- No audit writer UI/browser/client invocation.
- No market-loop/scanner audit writer invocation.
- No trade/stats/PnL mutation.

## Timing Checklist

Use New York market time as the source of truth. Record local time separately.

| Window | NY Time Guidance | Local Time Note | Expected Observation |
| --- | --- | --- | --- |
| Pre-market | Before 09:30 ET | Convert to local time before observing. | Market status should not imply regular-session trading if the app distinguishes pre-market. |
| Market open | Around 09:30 ET | Observe carefully without triggering manual scans/routes. | Header/window state should transition cleanly and UI should not blank. |
| First active trading window | First 15-60 minutes after open | Record exact local and NY time. | Recommendations should render, stay selective, or show a clear no-trade state. |
| Midday | Optional, if relevant | Record exact local and NY time. | Staleness/freshness and selective behavior should remain clear. |
| Near-close/EOD | Optional, if observable | Record exact local and NY time. | EOD/stale/overnight-risk warnings should be clear where relevant. |

Before using a specific calendar date, confirm the US market session is open
and not a holiday or special-close session.

## Production UI Observation Checklist

| Check | Pass | Warn | Block |
| --- | --- | --- | --- |
| Header market status | Correct and visible. | Slight copy ambiguity. | Missing, contradictory, or blank. |
| Day trade window status | Correct and visible. | Status lags but recovers. | Wrong session state or unsafe implication. |
| Recommendations updated timestamp | Visible and plausible. | Stale but clearly marked. | Missing freshness or misleading recency. |
| Refresh/loading state | Resolves without manual route/provider calls. | Slow but resolves. | Spinner hangs or blank screen. |
| Recommendations render | Cards render when data exists. | Selective empty state renders. | Recommendations area fails or crashes. |
| Selective empty state | "Ture is staying selective" or equivalent is clear. | Reason is too terse. | Empty state looks broken. |
| App shell | No blank screen. | Cosmetic issue only. | Blank screen or fatal app error. |
| Console errors | No red Supabase 4xx/5xx errors. | Expected yellow warning only. | Red Supabase 4xx/5xx recurs. |
| Expected capped warning | Non-fatal if present. | Count changes and should be recorded. | Warning becomes red/error or blocks UI. |
| Navigation | Market, Statistics, History, Settings work. | One secondary tab slow but recovers. | Core navigation fails. |

## Recommendation Quality Checklist

| Check | Pass | Warn | Block |
| --- | --- | --- | --- |
| Recommendation count | Limited and selective. | Very sparse but explained. | Noisy/unbounded list. |
| Ticker | Visible. | Minor formatting issue. | Missing ticker. |
| Side/action | Clear buy/sell/watch-style intent. | Copy ambiguity. | Could be mistaken for broker execution. |
| Entry | Visible where applicable. | Delayed or marked unavailable. | Missing without explanation. |
| Stop | Visible where applicable. | Delayed or marked unavailable. | Missing risk boundary. |
| Target | Visible where applicable. | Delayed or marked unavailable. | Missing reward boundary. |
| Confidence | Visible. | Formatting/copy issue. | Missing confidence context. |
| Risk/reward | Visible. | Borderline or stale but labelled. | Missing or misleading. |
| Reasoning/explanation | Clear enough for quick review. | Needs follow-up copy. | Opaque recommendation. |
| Freshness/stale/expiry | Visible and understandable. | Minor ambiguity. | Stale data appears current. |
| Confirmation states | Visible if applicable. | Secondary indicator unclear. | Required confirmation state missing. |
| Selective no-trade state | Acceptable when no trade qualifies. | Reason needs more detail. | Looks like data failure. |
| Minimal-analysis UX | User can decide whether to inspect further. | Needs minor copy polish. | Requires guesswork to understand. |

## Execution/Handoff Safety Checklist

| Check | Pass | Warn | Block |
| --- | --- | --- | --- |
| Execution mode default | Semi-auto. | Advanced mode visible but gated. | Automatic mode enabled by default. |
| Automatic mode | Gated/advanced only. | Copy needs reinforcement. | Appears enabled or easy to trigger. |
| Automatic submit behavior | None. | Copy could be clearer. | Any automatic submit behavior appears. |
| Handoff preview | Opens only as preview/prepare. | Some labels need clarification. | Implies real broker execution. |
| Manual confirmation copy | Clear and prominent. | Present but understated. | Missing or misleading. |
| Avanza/browser automation | None. | Documentation-only mention. | Any real automation path appears. |
| Broker execution path | None. | Mock/dev wording needs clarity. | Real broker path appears. |
| Local/mock/dev labels | Clear where present. | Needs clearer scope label. | Mock looks production-real. |

## Risk/EOD Safety Checklist

| Check | Pass | Warn | Block |
| --- | --- | --- | --- |
| Daily loss/risk controls | Visible where relevant. | Present only in secondary area. | Missing when needed. |
| Max open positions warnings | Visible where relevant. | Copy needs detail. | Missing or permissive. |
| Stop-loss/target priority copy | Clear where relevant. | Minor ambiguity. | Missing risk priority. |
| EOD safety warnings | Visible near close if observable. | Not observable in current window. | Missing near close when expected. |
| Stale/expired recommendation warning | Clear where relevant. | Minor ambiguity. | Stale recommendation appears valid. |
| Overnight-risk ambiguity | None. | Copy could be stronger. | UI permits ambiguous overnight risk. |

## Console/Network Safety Checklist

| Check | Pass | Warn | Block |
| --- | --- | --- | --- |
| Red Supabase 4xx/5xx errors | None. | Transient non-blocking warning only. | Any recurring red 4xx/5xx. |
| Manual route/provider calls | None performed. | N/A. | Any unapproved manual invocation. |
| Service-role/env exposure | None. | Documentation-only safety text. | Any secret/env value visible. |
| Audit writer client invocation | None. | Documentation-only mention. | Client/UI audit writer invocation appears. |
| Broker/Avanza references/actions | None as runtime behavior. | Documentation or manual-only copy. | Runtime action appears. |
| Automatic order submit behavior | None. | Copy could be clearer. | Any automatic submit behavior appears. |
| Expected yellow warnings | Documented if present. | Count changes require notes. | Warning becomes fatal or masks data failure. |

## Observation Log Template

| Field | Notes |
| --- | --- |
| Date |  |
| Local time |  |
| NY time |  |
| Market session state | Pre-market / open / active / midday / near-close / closed |
| Market tab state |  |
| Console status |  |
| Recommendation count |  |
| Best candidate shown |  |
| Selective/no-trade reason |  |
| Handoff preview tested | Yes / no |
| Warnings observed |  |
| Pass/warn/block result |  |
| Notes |  |
| Follow-up action |  |

## Go/No-Go Criteria After Dry Run

Go to controlled live-trial candidate review only if:

- Production UI loads.
- Market status/window states are correct.
- Recommendation flow behaves as expected.
- Recommendations render or selective empty state is clearly explained.
- Console has no red Supabase 4xx/5xx errors.
- Any `recommendation_batch_backfill_capped` warning remains yellow,
  count-only, and non-fatal.
- Execution remains semi-auto and human-confirmed.
- No broker/Avanza behavior appears.
- No automatic order behavior appears.
- Risk/EOD warnings are acceptable.

No-go if:

- red Supabase 4xx/5xx errors recur;
- recommendations fail to load during the market window;
- UI implies real broker action;
- automatic mode appears enabled;
- automatic order submission appears possible;
- risk controls are unclear;
- stale/expired recommendation state is misleading;
- provider/env readiness is uncertain;
- service-role/env exposure appears;
- any route/provider/scan invocation was manually triggered outside approval.

## Result Status

`market_window_dry_run_plan_created`

## Recommended Next Action

Action 976 - Run Market-Window Dry Run Observation.

Completed follow-up: Action 976 - Run Market-Window Dry Run Observation.

Action 976 result status: `market_window_dry_run_blocked`.

Action 976 could not complete the market-window observation because the action
ran on Sunday, June 28, 2026, when no regular US market window was available,
and the Production URL was not available in local repo context. No browser,
provider, route, scan, Supabase, database, service-role, broker/Avanza,
automatic order, or real trade path was invoked.

Recommended next action: Action 977 - Run Market-Window Dry Run Observation
During Open US Market Session.

Completed follow-up: Action 977 - Run Market-Window Dry Run Observation During
Open US Market Session.

Action 977 result status: `market_window_dry_run_blocked`.

Action 977 remained blocked because it still ran on Sunday, June 28, 2026,
with no regular US market window available, and the Production URL was still
not available in local repo context. No browser, provider, route, scan,
Supabase, database, service-role, broker/Avanza, automatic order, or real
trade path was invoked.

Recommended next action: Action 978 - Provide Production URL And Run
Open-Session Market-Window Dry Run Observation.

Completed follow-up: Action 978 - Provide Production URL And Run Open-Session
Market-Window Dry Run Observation.

Action 978 result status: `market_window_dry_run_blocked`.

Action 978 remained blocked because the request still did not provide a
Production URL/operator observation and still ran on Sunday, June 28, 2026,
with no regular US market session available. No browser, provider, route,
scan, Supabase, database, service-role, broker/Avanza, automatic order, or
real trade path was invoked.

Recommended next action: Action 979 - Provide Production URL And Operator
Open-Session Evidence.

## Validation Results

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deoptimization note for the
  large `app/trade-app.tsx` file.
- Runtime denial harness syntax/import checks passed:
  `scripts/verify-audit-table-authenticated-denial.mjs` and
  `scripts/verify-audit-table-runtime-denial.mjs`.
- Audit writer runtime path import search found only the existing approved
  route imports in `app/api/execution/audit/writer/route.ts`.
- Route invocation search was static only and did not call routes.
- UI/app-shell audit writer import scan found no unsafe client wiring beyond
  existing approved route guardrails.
- Market-loop/scanner/provider search was static only and did not invoke
  scans; it returned existing app/provider/scanner source files.
- `NEXT_PUBLIC_*SERVICE*` and service-role exposure search returned existing
  approved server/test guardrails and documentation references only. No secret
  values were printed.
- Market-window-plan-specific unsafe import scan found no `server-only`,
  `process.env`, Supabase client, `fetch`, mutation/select, or `localStorage`
  behavior in this plan.
- Automatic-mode safety scan returned documentation-only boundary statements
  and the existing readback metadata flag.
- Status string and next-action consistency scan passed.
- Dead-doc/path scan for touched docs passed.
- `git diff --check` passed.
- Touched-file trailing whitespace scan passed.
- `find docs -type f -size 0` produced no output.
- `.env.local` diff check produced no output.

## Not Performed

- No runtime code change.
- No provider call.
- No route invocation.
- No scan invocation.
- No live market scan.
- No manual Supabase call.
- No manual database read/write.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No service-role value printed.
- No audit writer UI/browser/client invocation.
- No audit writer runtime persistence path change.
- No market-loop/scanner audit writer invocation.
- No broker/Avanza behavior.
- No automatic order submission enablement.
- No automatic mode enablement.
- No trade/stats/PnL mutation.

## Action 1002 Monday Handoff Link

- Result status: `monday_production_market_window_dry_run_handoff_created`.
- Created `docs/monday-production-market-window-dry-run-handoff.md`.
- The Production market-window dry run remains parked until Monday/open US
  market session and operator evidence exists.
- Recommended next action: Action 1003 - Run Production Market-Window Dry Run
  With Operator Evidence.
