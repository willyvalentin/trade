# Live-Trial Non-Live Test Pack Results

## Purpose

Action 953 runs and documents the non-live test pack for live-trial
readiness.

Result status: `live_trial_non_live_test_pack_passed_with_warnings`

Follow-up status: Action 954 created
`docs/live-trial-manual-dry-run-results.md` with result status
`live_trial_manual_dry_run_passed_with_warnings`.

Recommended next action: Action 955 - Deploy Preview/Staging for Live-Trial
Verification.

This action is validation/documentation only. No provider call, route call,
live market scan, database read/write, Supabase call, service-role adapter
call, broker/Avanza behavior, automatic order behavior, migration, type
generation, generated type edit, runtime code change, or `.env.local` change
was performed.

## Test Environment

| Field | Value |
| --- | --- |
| Working tree | `/Users/willysimonsson/Dev/trade` |
| Timestamp | `2026-06-28 00:45:24 CEST` |
| Package | `trade@0.1.0` |
| TypeScript command | `./node_modules/.bin/tsc --noEmit` |
| Lint command | `npm run lint` |
| Playwright command | `./node_modules/.bin/playwright test ...focused baseline specs...` |
| `.env.local` | Diff check passed with no output |
| Secret handling | No service-role values or secret values were printed |

## Commands Run

| Command/check | Result | Notes/warnings |
| --- | --- | --- |
| `date '+%Y-%m-%d %H:%M:%S %Z'` | Passed | Returned `2026-06-28 00:45:24 CEST`. |
| `sed -n '1,260p' .../pasted-text.txt` | Passed | Read Action 953 request. |
| `rg --files tests package.json docs` | Passed | Confirmed requested spec files and docs are present. |
| `git status --short` | Passed | Dirty worktree existed before this action; unrelated files left untouched. |
| `sed -n '1,220p' package.json` | Passed | Confirmed available scripts: `lint` and `test:e2e`. |
| `rg ... playwright.config.* tests` | Passed | Confirmed Playwright uses local `npm run dev -- --port 3010` web server. |
| `node --check scripts/verify-audit-table-anon-denial.mjs && node --check scripts/verify-audit-table-authenticated-denial.mjs` | Passed | Runtime denial harness syntax/import check only; harnesses were not executed against Supabase. |
| UI/app-shell audit writer import search | Passed | No audit writer route/lifecycle/runtime-proof import found in `app/trade-app.tsx`, `components`, or `hooks`. |
| Static route invocation search | Passed with expected existing hits | Found existing non-audit app fetches only: market calendar status, positions update, recommendation add-trade validation, and outcome evaluation. No audit writer route invocation was found. |
| `NEXT_PUBLIC_*SERVICE*` exposure search | Passed with docs-only hit | Hit only checklist validation text; no code exposure found. |
| Service-role leakage search | Passed with expected warnings | Returned existing approved server/test guardrail references and docs references only. No service-role values were printed. |
| Market-loop/scanner audit writer search | Passed with expected server/test hits | Returned existing audit writer tests and server modules only; no UI/scanner runtime invocation was found. |
| Broad env/client/write scan | Passed with expected warnings | Returned existing app Supabase/localStorage/write references and docs/test guardrails. This was a static scan only; no calls or writes were performed. |
| Automatic-mode safety scan | Passed with expected warnings | Returned existing human-confirmation, dev/mock, Avanza-readiness, and automatic-mode safety copy. No automatic order submission path was enabled. |
| `./node_modules/.bin/tsc --noEmit` | Passed | No TypeScript errors. |
| `npm run lint` | Passed with warning | Existing Babel deopt note for large `app/trade-app.tsx`. |
| Focused Playwright baseline pack | Passed | 106 tests passed. Initial sandbox run failed to bind local port `3010` with `EPERM`; rerun with escalation only for local server binding passed. |
| `git diff --check` | Passed | No whitespace errors. |
| Touched-file trailing whitespace scan | Passed | No matches. |
| `find docs -type f -size 0` | Passed | No zero-byte docs. |
| `git diff -- .env.local` | Passed | No output; `.env.local` unchanged. |
| Status/next-action consistency scan | Passed | Result status and Action 954 next action are present in the results, checklist, readiness review, checkpoint, and QA notes. |

## Focused Playwright Pack

Command:

```bash
./node_modules/.bin/playwright test \
  tests/e2e/execution-state-effects-baseline.spec.ts \
  tests/e2e/live-position-execution-ui-baseline.spec.ts \
  tests/e2e/dev-mock-broker-controls-baseline.spec.ts \
  tests/e2e/execution-ui-component-extraction-baseline.spec.ts \
  tests/e2e/execution-settings-persistence-baseline.spec.ts \
  tests/e2e/execution-settings-persistence-helpers.spec.ts \
  tests/e2e/execution-event-log-local-storage-baseline.spec.ts \
  tests/e2e/execution-local-storage-helpers.spec.ts \
  tests/e2e/execution-modal-state-baseline.spec.ts \
  tests/e2e/execution-modal-state-helpers.spec.ts \
  tests/e2e/execution-modal-open-path-baseline.spec.ts \
  tests/e2e/execution-lifecycle-ui-state-baseline.spec.ts \
  tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts
```

Result: 106 passed.

Coverage included:

- execution state/effects baseline;
- live-position execution UI baseline;
- dev mock broker controls baseline;
- execution UI component extraction baseline;
- settings persistence baseline and helper coverage;
- local storage helper, event log, execution record, and dev mock store
  coverage;
- modal helper, close/reset, prepare/capture, and open-path baseline coverage;
- lifecycle UI adapter and lifecycle UI baseline coverage.

All requested known relevant packs were found and run. Scan-window and
recommendation-build diagnostics were not run because this action forbids scan
route/provider-style activity; no live scan or provider-adjacent command was
invoked.

## Test Pack Results

| Area | Result | Notes |
| --- | --- | --- |
| TypeScript | Passed | `./node_modules/.bin/tsc --noEmit` returned exit code 0. |
| Lint | Passed with warning | `npm run lint` returned exit code 0 and emitted the existing Babel deopt note for large `app/trade-app.tsx`. |
| Playwright/spec pack | Passed with warnings | 106 focused non-live baseline tests passed. Node emitted `DEP0205` deprecation warnings and `NO_COLOR` ignored due to `FORCE_COLOR`; local server sandbox bind needed escalation. |
| Runtime denial harness import check | Passed | Syntax/import checks only. No Supabase harness execution. |
| Static safety scans | Passed with expected existing hits | Existing server/test guardrails, localStorage, Supabase app data paths, and human-confirmation copy were observed. No new unsafe runtime path was found. |
| Docs/dead-path checks | Passed | `git diff --check`, touched-file whitespace scan, zero-byte docs check, and status/next-action consistency scan passed. |
| Env/diff checks | Passed | `.env.local` diff check had no output and this action did not modify `.env.local`. |

## Safety Boundary Confirmation

- No provider call was made.
- No route invocation was made.
- No live market scan was run.
- No database read/write was run.
- No Supabase call was run.
- No service-role adapter call was run.
- No service-role value was printed.
- No audit writer client/UI/market/scanner invocation was added.
- No broker/Avanza behavior was added or invoked.
- No automatic order submission was enabled.
- No trade/stats/PnL mutation behavior was changed.
- `.env.local` remained unchanged.

## Known Warnings

- `npm run lint` still emits the existing Babel deopt note:
  `app/trade-app.tsx` exceeds 500KB.
- Playwright/Node emitted `DEP0205` warnings for `module.register()`.
- Playwright web server emitted `NO_COLOR` ignored because `FORCE_COLOR` is
  set.
- The first sandboxed Playwright run failed with `listen EPERM` on local port
  `3010`; the same focused command passed after escalation for local server
  binding.
- Service-role scans return existing approved server/test guardrail references.
- Automatic-mode scans return existing human-confirmation and safety copy.
- Broad env/client/write scans return existing app Supabase/localStorage paths.
  These were static scans only and did not invoke providers, routes, Supabase,
  or DB writes.

## Readiness Conclusion

Conclusion: pass with warnings.

It is safe to proceed to the manual dry-run checklist, provided the operator
keeps the next step non-live and review-only.

Action 954 completed that manual dry-run checklist from local docs/tests/static
review. The checklist passed with warnings and recommends Preview/Staging
deployment next. Production remains no-go until Preview/Staging verification,
provider/env readiness, and deployed UI review are complete.

Before any market-open trial, manually review:

- provider capacity and current plan/headroom;
- Netlify/deployment/env readiness without printing secret values;
- recommendation freshness and no-trade/rejection clarity;
- risk settings, daily loss settings, max open positions, and EOD warnings;
- semi-auto/human-confirmed execution copy;
- absence of broker/Avanza automation and automatic order submission;
- local-vs-server audit/persistence distinction;
- `.env.local` unchanged status.

## Not Performed

- No runtime code was modified.
- No provider API call, route call, scheduled scan, Generate More route call,
  live market scan, Supabase query, DB read/write, service-role adapter call,
  live proof/insert/query, broker/Avanza automation, or automatic order
  behavior was performed.
- No audit writer runtime persistence path, UI/browser/client invocation,
  market-loop/scanner invocation, handlers/effects/state mutation, JSX, hooks,
  components, reducers, migrations, generated types, typegen output, or
  `.env.local` values were changed.
