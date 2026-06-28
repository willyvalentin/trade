# Live-Trial Dry-Run Checklist

## Purpose

Action 952 creates a manual dry-run checklist before any live-trial market
window.

Result status: `live_trial_dry_run_checklist_created`

Follow-up status: Action 953 created
`docs/live-trial-non-live-test-pack-results.md` with result status
`live_trial_non_live_test_pack_passed_with_warnings`.

Follow-up status: Action 954 created
`docs/live-trial-manual-dry-run-results.md` with result status
`live_trial_manual_dry_run_passed_with_warnings`.

Follow-up status: Action 955 created
`docs/production-post-deploy-verification.md` with result status
`production_post_deploy_verification_passed_with_warnings`.

Recommended next action: Action 956 - Create Production UI Observation Log.

This is documentation/checklist only. No provider call, route call, live scan,
database read/write, Supabase call, service-role adapter call, broker/Avanza
behavior, automatic order behavior, migration, type generation, generated type
edit, runtime code change, or `.env.local` change was performed.

## Trial Scope

- Market scope: US day trading only.
- Execution model: semi-automatic and human-confirmed.
- Product model: Ture recommends; the user reviews.
- Handoff model: the handoff preview can prepare the order conceptually and
  show the structured package.
- Broker boundary: final broker confirmation remains manual/human-only.
- Automation boundary: no automatic order submission.
- Avanza boundary: no autonomous Avanza behavior.
- Persistence boundary: local diagnostics remain local-only; server audit
  persistence remains server-only and separate from UI/browser paths.

## Pre-Session Checklist

Complete before any market-window trial:

- [ ] Confirm market date and expected US trading session.
- [ ] Confirm New York time handling for the intended trial window.
- [ ] Confirm intended trading window target: opening, morning momentum,
      midday, afternoon, or observation-only.
- [ ] Review provider capacity/profile expectations from existing docs/code.
- [ ] Review Twelve Data free/Grow assumptions from existing provider profile
      and budget docs.
- [ ] Confirm scheduled scan route presence from static docs/code only; do not
      invoke the route during this dry run.
- [ ] Review Netlify/env readiness from existing docs or platform UI without
      printing secret values.
- [ ] Review Supabase schema/readiness from existing proof docs only; do not
      run queries.
- [ ] Review risk settings.
- [ ] Review daily loss limit settings.
- [ ] Review max open positions settings.
- [ ] Review EOD safety and overnight-risk awareness.
- [ ] Confirm `.env.local` has not changed unexpectedly.

## Recommendation Dry-Run Checklist

Use existing UI/docs/tests or a non-live local review. Do not call providers or
generate live recommendations as part of this checklist.

- [ ] Recommendation cards are visible when data exists.
- [ ] Recommendation count is limited and not noisy.
- [ ] Ticker is visible.
- [ ] Side/action is clear.
- [ ] Entry, stop, target, and risk/reward are visible.
- [ ] Confidence is visible.
- [ ] Reasoning/explanation is visible.
- [ ] Freshness, stale, or expiry state is visible.
- [ ] VWAP, momentum, and volume confirmation copy is visible when applicable.
- [ ] No-trade/rejection reason is understandable when no recommendation is
      produced.
- [ ] The user can understand the setup with minimal additional analysis.
- [ ] Cards do not imply broker execution or automatic order submission.

## Execution Dry-Run Checklist

- [ ] Execution mode default is semi-automatic.
- [ ] Automatic mode remains gated/advanced.
- [ ] No automatic submit behavior is visible or enabled.
- [ ] Handoff preview modal opens from approved preview surfaces.
- [ ] Handoff preview shows ticker, action, quantity, entry, stop, and target
      where applicable.
- [ ] Safety checks are visible.
- [ ] Manual final confirmation copy is clear.
- [ ] Live-position handoff controls behave as preview/prepare controls, not
      broker execution.
- [ ] Prepare/capture behavior remains mock, dev, local, or explicitly
      server-approved as documented.
- [ ] No Avanza/browser automation exists in the dry-run path.
- [ ] No UI copy suggests Ture can click final KOP/SALJ automatically.

## Paper/Mock Dry-Run Checklist

- [ ] Dev mock broker panel is clearly local/dev-only.
- [ ] Local execution records viewer reads from local persistence.
- [ ] Audit log viewer represents local events.
- [ ] Local-vs-server audit distinction is clear.
- [ ] Dev mock results do not imply real broker execution.
- [ ] Capture stubs are clearly non-production broker behavior.
- [ ] Mock confirmation/capture copy states no Supabase, trade, History, or
      Statistics mutation unless separately approved.
- [ ] Duplicate guard language is local-only and not real broker dedupe.

## Risk/Safety Dry-Run Checklist

- [ ] Daily loss warning behavior is visible or documented.
- [ ] Per-trade risk display is visible or documented.
- [ ] Stop-loss discipline copy is visible.
- [ ] Target/stop priority expectations are clear.
- [ ] EOD safety warning expectations are clear.
- [ ] Stale recommendation warning expectations are clear.
- [ ] Overnight-risk prevention copy is present where applicable.
- [ ] No trade/stats/PnL mutation occurs without the intended user flow.
- [ ] Risk settings do not permit live-trial drift beyond the intended mode.
- [ ] Manual review remains required for real-like mode.

## Monitoring/Live-Position Dry-Run Checklist

- [ ] Live day trade cards show active positions when data exists.
- [ ] Execution status surface is read-only.
- [ ] Handoff controls remain callback/preview-driven.
- [ ] Stop/target handling expectations are documented.
- [ ] Prepare/capture adjacency is clear.
- [ ] Position/trade/PnL mutation remains parent-owned.
- [ ] Existing live-position execution UI baseline coverage is identified.
- [ ] EOD status and stale-position warnings are not hidden by local
      acknowledgement.

## Test Pack Before Live-Trial

Run non-live checks before any market-window trial:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
```

Relevant known test files to include in a focused non-live pack:

- `tests/e2e/execution-state-effects-baseline.spec.ts`
- `tests/e2e/live-position-execution-ui-baseline.spec.ts`
- `tests/e2e/dev-mock-broker-controls-baseline.spec.ts`
- `tests/e2e/execution-settings-persistence-baseline.spec.ts`
- `tests/e2e/execution-settings-persistence-helpers.spec.ts`
- `tests/e2e/execution-local-storage-helpers.spec.ts`
- `tests/e2e/execution-event-log-local-storage-baseline.spec.ts`
- `tests/e2e/execution-modal-state-baseline.spec.ts`
- `tests/e2e/execution-modal-state-helpers.spec.ts`
- `tests/e2e/execution-modal-open-path-baseline.spec.ts`
- `tests/e2e/execution-lifecycle-ui-state-baseline.spec.ts`
- `tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts`
- `tests/e2e/scan-window-orchestration.spec.ts`
- `tests/e2e/recommendation-build-diagnostics.spec.ts`

Do not run live scans, provider calls, Supabase queries, live proof inserts, or
broker/Avanza automation as part of this test pack.

Action 953 completed the focused non-live pack. See
`docs/live-trial-non-live-test-pack-results.md`.

Result: pass with warnings. `./node_modules/.bin/tsc --noEmit`,
`npm run lint`, runtime denial harness syntax checks, static safety scans, and
the focused Playwright baseline pack passed. Playwright reported 106 passed
tests. Known warnings remain limited to the existing Babel deopt note for large
`app/trade-app.tsx`, Node/Playwright local-server warnings, and expected static
scan hits for existing guardrails/local storage/Supabase app paths.

Action 954 completed the manual checklist from local docs/tests/static review.
See `docs/live-trial-manual-dry-run-results.md`.

Result: pass with warnings. Preview/Staging deploy is recommended next.
Production deploy remains no-go until Preview/Staging is verified, provider
capacity/headroom is confirmed, env/deployment readiness is reviewed without
printing secrets, and no go/no-go blockers remain.

Action 955 update: Production was manually deployed before Preview/Staging.
The post-deploy verification keeps Production online with warnings, does not
perform another deploy or rollback, and keeps live market trial no-go. Direct
Production UI observation remains the next required step.

## Manual Observation Log Template

Use this template during dry-run review or a later approved market-window
observation:

| Field | Notes |
| --- | --- |
| Date |  |
| Market window |  |
| Provider profile |  |
| Number of recommendations |  |
| Recommendation freshness |  |
| Top candidates |  |
| Rejected/no-trade reason |  |
| Handoff preview behavior |  |
| Safety warnings observed |  |
| User decision |  |
| Notes |  |
| Follow-up action |  |

## Blockers And Warnings

- Existing `npm run lint` emits a Babel deopt note for large
  `app/trade-app.tsx`; this is known and unrelated to Action 952.
- Provider capacity assumptions must be confirmed before a live trial,
  especially Twelve Data plan mode and scan budget headroom.
- Market-open behavior still requires a separately approved market-window
  validation later.
- There is no real broker integration approved by this checklist.
- Automatic mode must remain gated.
- Any stale readiness docs or unclear deployment/env status should block
  live-trial progression until reviewed.
- If recommendation freshness cannot be trusted, do not proceed to a
  market-window trial.
- If execution copy implies real broker action or automatic submission, do not
  proceed.

## Go/No-Go Criteria

Go for dry-run if:

- docs/tests/env readiness are clean;
- no safety boundary drift is found;
- recommendation cards are understandable and bounded;
- execution copy preserves human confirmation;
- risk controls and EOD warnings are clear;
- `.env.local` remains unchanged.

No-go if:

- provider/env readiness is unclear;
- recommendation freshness cannot be trusted;
- risk controls are unclear;
- execution copy implies real broker action;
- automatic order behavior appears enabled;
- service-role/env exposure appears in client paths;
- `.env.local` changed unexpectedly;
- any required non-live test pack fails without documented unrelated cause.

## Validation Results

- Runtime denial harness syntax/import checks passed.
- Audit writer runtime path import search passed: UI/app-shell client surfaces
  did not import the server-only audit writer path.
- Route invocation search was static only; no routes were called.
- UI import/search for audit writer route invocation, lifecycle hook, lifecycle
  caller, transition boundary, proof harnesses, monitoring, cleanup, and
  rollout terms returned no client wiring beyond existing approved server/test
  guardrails.
- Market-loop/scanner import search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` exposure search returned no matches.
- Service-role leakage search returned existing approved server/test guardrails
  only, with no service-role values printed.
- Broad env/client/write and live-trial-checklist-specific scans returned
  existing route, helper, localStorage, and documentation references; no unsafe
  Action 952 runtime change was made.
- Automatic-mode safety scan returned existing human-confirmation copy and
  documentation-only safety notes.
- Dead-doc/path scan returned no missing recent docs/code references.
- Status and next-action consistency scans passed.
- `git diff --check`, touched-file trailing whitespace scan, zero-byte docs
  check, `.env.local` diff check, `./node_modules/.bin/tsc --noEmit`, and
  `npm run lint` passed. Lint emitted the existing Babel deopt note for large
  `app/trade-app.tsx`.
- Action 953 non-live test pack passed with warnings. The focused Playwright
  pack passed with 106 tests. No provider call, route invocation, live scan,
  Supabase/DB action, service-role adapter call, broker/Avanza behavior,
  automatic order behavior, migration, type generation, generated type edit,
  runtime code change, or `.env.local` change was performed.
- Action 954 manual dry-run checklist passed with warnings. The review was
  local docs/tests/static evidence only; no deployed environment was opened.
  Preview/Staging deploy is recommended next, while Production remains no-go
  until deployed verification and provider/env readiness are complete.
- Action 955 production post-deploy verification passed with warnings. The
  accidental Production deploy is being kept online with warnings. Direct
  Production UI observation is still pending, and live market trial remains
  no-go.

## Not Performed

- No runtime code was modified.
- No provider call, route call, scan, Supabase call, DB read/write,
  service-role adapter call, migration, type generation, generated type edit,
  or `.env.local` change was performed.
- No audit writer UI/browser/client invocation, market-loop/scanner invocation,
  broker/Avanza behavior, automatic mode enablement, automatic order
  submission enablement, or trade/stats/PnL mutation behavior was added.
