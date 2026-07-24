# Avanza Order Chain Smoke Test Runner

## Current status

The Avanza order chain smoke test runner now exists in
`lib/avanza-order-chain-smoke-test-runner.ts`.

It is the order-side counterpart to the hard-gated login smoke runner. It is
local-dev only, dependency-injected, and designed for a future terminal-only
pre-submit smoke path.

## Purpose

The runner models the local-dev smoke sequence:

1. validate the execution package;
2. search for the instrument;
3. select and verify the instrument;
4. locate the BUY/SELL entry path;
5. prepare order ticket fields;
6. reach review-ready state;
7. stop before final KOP/SALJ.

The final click remains a human-only action.

## Gate model

The runner requires explicit local-dev gates before any injected real-run path
can become ready:

- explicit env opt-in;
- manual terminal confirmation;
- local-dev environment;
- CI blocked;
- injected dependencies only;
- order-chain executor explicitly allowed;
- instrument search explicitly allowed;
- order field preparation explicitly allowed;
- order review state explicitly allowed.

The optional terminal script scaffold was not added in this phase. If it is
added later, it must be terminal-only and require `TURE_AVANZA_ORDER_SMOKE_TEST`,
`TURE_LOCAL_DEV_CONFIRM`, and a separate real-run flag before any explicit
real-run mode.

## Safety guarantees

- No Trade UI wiring.
- No API route wiring.
- No automatic app-runtime Avanza navigation.
- No real smoke test during import, render, tests, or CI.
- No final KOP/SALJ click.
- No order submission.
- No cookies/session reads.
- No BankID automation or bypass.
- No credential handling.
- No Supabase execution write.
- Fill values remain hidden in safe reports.
- `canRunInCi` remains false.
- `canClickFinalBuy` remains false.
- `canClickFinalSell` remains false.
- `canSubmitOrder` remains false.
- `controlsEnabled` remains false.
- `gateLocked` remains true.

## Fixture visibility

Static fixtures live in
`lib/avanza-order-chain-smoke-test-runner-fixtures.ts`.

The passive harness lives in
`components/execution/AvanzaOrderChainSmokeTestRunnerHarness.tsx`.

The dev-only visual QA route renders the harness as fixture/model-only content
at `app/dev/avanza-visual-qa/page.tsx`. The route remains unlinked from main
navigation and is not a Trade UI execution path.

## Not implemented

- No terminal script was added in this phase.
- No Playwright import is present in the runner.
- No app-runtime Avanza navigation is implemented.
- No Trade UI trigger, handoff button, prepare button, or buy/sell CTA is
  wired.
- No disabled API route behavior was changed.
- No final KOP/SALJ click or order submission is implemented.

## Next step

Keep the runner fixture/model-only until a separately approved local terminal
script phase. Any future real local-dev runner must preserve the review-ready
stop and final human action boundary.

## Local-Dev Execution Runbook

The Avanza local-dev execution runbook now exists in
`docs/avanza-local-dev-execution-runbook.md`, with model fixtures and a dev QA
route harness. It is the operator guide before any real local-dev order smoke
script or Trade UI/API integration. It does not activate execution and keeps no
final KOP/SALJ click, no order submission, no cookies/session export, no BankID
automation, no Supabase writes, and not production ready.

## Terminal Order Smoke Script Scaffold

`scripts/avanza-order-chain-smoke-test.local.ts` now exists as a terminal-only
hard-gated scaffold for the order chain smoke runner. It is default-safe,
blocked in CI, requires explicit env opt-in and manual local confirmation, and
requires an additional real-run flag before explicit local real-run mode. It
remains disconnected from Trade UI/API/order submission and stops at
review-ready/final human action.

## Local Smoke Result Capture

`docs/avanza-local-smoke-test-result-capture.md` now documents the safe checklist/result capture model for login plus order-prep smoke evidence. It records outcomes without storing sensitive data and does not activate smoke tests, persist results, wire Trade UI, wire API routes, submit orders, click final KOP/SALJ, handle cookies/session, automate BankID, write Supabase, or claim production readiness.
