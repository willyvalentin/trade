# First Controlled Live-Trial Scope Decision

## Purpose

Action 1004 decides the first controlled live-trial scope for Ture.

This is a decision/scope document only. It is not a real trade execution
action, does not enable automatic execution, and does not perform Avanza or
broker action.

## Readiness Basis

- Production pre-market dry-run passed with warnings in Action 1003.
- Previous Supabase blockers are resolved:
  - `scheduled_scan_attempts` 404 resolved.
  - `recommendation_batches` timeout resolved.
  - `recommendation_snapshots` 500 resolved.
  - `recommendation_outcomes` 500 resolved.
- Semi-auto sandbox phase is complete with warnings.
- Browser automation remains sandbox-only.
- Real Avanza automation is absent.
- Full-auto execution remains deferred.

## Known Warnings

- Action 1003 evidence was pre-market only, not regular open.
- Expected `recommendation_batch_backfill_capped` warning remains non-fatal.
- No actual recommendation candidate was shown in the pre-market evidence.
- Handoff preview was not tested in the Production evidence.
- EOD behavior was not observed.
- `npm run lint` emits the known Babel deopt note for `app/trade-app.tsx`.
- Optional runtime denial script was absent during the Action 1003 validation
  check.

## Live-Trial Decision

Decision status:
`first_controlled_live_trial_scope_approved_with_constraints`

Ture may proceed to a very limited first controlled live-trial observation
phase under the constraints below.

## Scope Constraints

- US stocks only.
- Day-trade recommendations only.
- Observation-first trial.
- Maximum 1 candidate/trade consideration in the first live-trial window.
- No automatic execution.
- No Avanza/browser automation in Production.
- No real broker order from Ture.
- User may manually observe and optionally manually decide.
- Any real broker action, if performed at all, is outside Ture automation and
  requires an explicit human decision.
- Prefer no real money order until one regular-open observation with actual
  candidate evidence is documented.
- If a trade is considered, use minimal test size or paper/manual tracking
  first.

## Required Operator Checks Before Any Real Trade Consideration

- Market is open or in an active intraday window.
- Production UI loads.
- Console has no red Supabase 4xx/5xx errors.
- Recommendation is fresh.
- Entry, stop, and target are visible.
- Risk/reward is visible.
- Confidence is visible.
- Stale/expiry warning is absent.
- Risk controls are clear.
- Handoff preview/manual confirmation copy is clear.
- No automatic, broker, or Avanza execution behavior appears.
- User explicitly chooses to proceed.

## Hard No-Go Conditions

- Red Supabase 4xx/5xx errors appear.
- `scheduled_scan_attempts` 404 returns.
- `recommendation_batches` timeout returns.
- Recommendation readback 500 returns.
- Market status/window is clearly wrong.
- Recommendation is stale or expired.
- Entry, stop, or target is missing.
- Risk controls are unclear.
- Automatic mode appears enabled.
- Any Avanza/broker automation appears.
- Handoff copy implies Ture placed or can place an order.
- EOD/overnight risk is ambiguous.
- User is uncertain.

## Trial Observation Log Template

```text
date:
local_time:
ny_time:
session_window:
recommendation_count:
candidate_ticker:
side:
entry:
stop:
target:
confidence:
risk_reward:
freshness:
console_status:
warnings_errors:
handoff_preview_observed_yes_no:
user_decision:
result: observe_only | skipped | paper_tracked | manually_acted_outside_ture_automation
notes:
```

## Result Statuses For Next Action

- `first_controlled_live_trial_observation_passed`
- `first_controlled_live_trial_observation_passed_with_warnings`
- `first_controlled_live_trial_observation_skipped_no_candidate`
- `first_controlled_live_trial_observation_blocked`

## Recommended Next Action

Action 1005 - Run First Controlled Live-Trial Observation.

Optional extra confidence before any real trade:

Action 1005 - Run Regular Open Production Observation With Candidate Evidence.

## Progress Update

- Ture production/data-health: 94-96%.
- Market-window live dry-run: 85-90%.
- Semi-auto agent foundation: 98-99%.
- Semi-auto Avanza/browser-agent readiness: 95-97%.
- Real browser automation readiness: 86-91%.
- Full-auto readiness: 10-15%.
- Total Ture toward semi-auto MVP: 97-98%.

## Validation Results

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known Babel deopt note for
  `app/trade-app.tsx`.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`; no runtime denial harness was run.
- UI/app-shell audit writer import scan returned no matches.
- Broad provider/route/scan search was static only and did not call routes or
  providers; it returned existing source and legacy edit-conflict references.
- Service-role exposure scan returned only existing server-support aliases in
  `lib/supabase-server.ts` and `lib/active-scan-trace.ts`; no secret values
  were printed.
- Live-trial-scope-specific safety scan returned documentation-only boundary
  terms.
- Automatic-mode safety scan returned existing checklist/safety language only.
- Dead-doc/path scan returned no missing files.
- Result-status consistency scan passed.
- Whitespace-aware next-action consistency scan passed.
- `git diff --check` passed.
- Touched-file trailing whitespace scan returned no matches.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.

## Not Performed

- No runtime code change.
- No real trade.
- No Production runtime browser automation.
- No Avanza integration.
- No broker behavior.
- No automatic order submission.
- No automatic mode enablement.
- No final `KOP`/`SALJ` or `KÖP`/`SÄLJ` click.
- No provider API call.
- No scan route invocation.
- No live market scan.
- No database write.
- No manual Supabase call.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No service-role value printed.
- No audit writer UI/browser/client invocation.
- No trade/stats/PnL mutation.

## Action 1005 First Controlled Live-Trial Observation

- Result status: `first_controlled_live_trial_observation_blocked`.
- Observation artifact:
  `docs/first-controlled-live-trial-observation.md`.
- The observation did not receive fresh Production URL/operator evidence,
  screenshot, cleared-console output, recommendation count, candidate/no-
  candidate evidence, or handoff preview evidence.
- This is an evidence/process block, not a confirmed Product UI failure.
- No real trade, Ture-placed order, Production Avanza/browser automation,
  broker behavior, automatic execution, provider/scan invocation, Supabase
  call/write, or trade/stats/PnL mutation was performed.
- Recommended next action: Action 1006 - Provide Operator Evidence And Repeat
  Controlled Live-Trial Observation During Active Window.
