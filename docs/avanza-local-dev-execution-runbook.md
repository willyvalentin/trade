# Avanza Local-Dev Execution Runbook

## Current Status

The local-dev execution runbook exists as a docs/model/dev-QA layer for login plus order-prep smoke tests. It is represented by `lib/avanza-local-dev-execution-runbook.ts`, static fixtures in `lib/avanza-local-dev-execution-runbook-fixtures.ts`, and the isolated harness in `components/execution/AvanzaLocalDevExecutionRunbookHarness.tsx`.

The dev-only visual QA route renders the runbook fixtures as fixture/model-only content. This does not activate Trade UI execution, API route execution, browser navigation, Avanza form fill, order submission, or settlement reconciliation writes.

## Purpose

The runbook is the operator guide before any real local-dev order smoke script or Trade UI integration. It summarizes the safe sequence for:

- login smoke model or dry-run review
- optional separately approved terminal-only login smoke
- order chain model or dry-run review
- future separately approved prepare-only order chain smoke
- review-ready stop verification
- final KOP/SALJ boundary confirmation
- findings documentation

## Operator Sequence

1. Review safety boundaries.
2. Verify local environment.
3. Verify Avanza Settings profile and credential readiness.
4. Run login model or dry-run.
5. Optionally consider local login real smoke only with explicit gates.
6. Review login result.
7. Run order chain model or dry-run.
8. Do not add a real order terminal script until separately approved.
9. Verify review-ready stop.
10. Confirm no final KOP/SALJ click.
11. Document findings.
12. Stop.

## Required Gates

- Local dev only.
- CI blocked.
- Explicit env opt-in reviewed before any separately approved terminal smoke.
- Manual operator confirmation required.
- Secure credential provider path required.
- BankID automation remains forbidden.
- Trade UI wiring remains forbidden.
- API route wiring remains forbidden.

## Hard Stops

- No final KOP/SALJ click.
- No order submission.
- No cookies/session export.
- No BankID automation.
- No credential logging or exposure.
- No Supabase writes.
- No production readiness claim.

## Login Smoke Fit

The login smoke runner remains a separate hard-gated local-dev tool. This runbook does not execute it. The runbook only documents where the operator would review model, dry-run, or separately approved local terminal smoke results.

## Order-Prep Smoke Fit

The order chain runner remains hard-gated and review-ready only. This runbook does not add a terminal order smoke script. Review-ready is the maximum order-prep endpoint, and any final order action remains human-only outside this system.

The real order terminal script is intentionally not added yet because that path
requires a separate approval gate and must preserve the review-ready stop.

`scripts/avanza-order-chain-smoke-test.local.ts` now exists as a terminal-only
hard-gated scaffold. It is default-safe, blocked in CI, requires
`TURE_AVANZA_ORDER_SMOKE_TEST=1`, requires
`TURE_LOCAL_DEV_CONFIRM=I_UNDERSTAND_THIS_IS_LOCAL_ONLY`, and requires
`TURE_AVANZA_ORDER_REAL_RUN=1` before explicit real-run mode. It remains
disconnected from Trade UI/API/order submission and still stops at
review-ready/final human action.

## Settlement Boundary

Settlement reconciliation is separate post-trade work. This runbook does not read settlement notes, reconcile execution records, or write Supabase execution rows.

## Non-Goals

- No real execution in this task.
- No Trade UI wiring.
- No API route wiring.
- No app-runtime Avanza navigation.
- No cookies/session handling.
- No BankID automation.
- No order submission.
- No final KOP/SALJ click.
- No production readiness claim.

## Current Safety Flags

- `canExecuteLoginSmoke`: `false`
- `canExecuteOrderSmoke`: `false`
- `canWireTradeUi`: `false`
- `canWireApiRoute`: `false`
- `canNavigateFromAppRuntime`: `false`
- `canReadCookies`: `false`
- `canExportSession`: `false`
- `canAutomateBankId`: `false`
- `canSubmitOrder`: `false`
- `canClickFinalBuy`: `false`
- `canClickFinalSell`: `false`
- `canWriteSupabase`: `false`
- `canClaimProductionReady`: `false`
- `userMustConfirm`: `true`
- `finalHumanClickRequired`: `true`
- `controlsEnabled`: `false`
- `gateLocked`: `true`

## Next Step

Stop here unless a new approval gate explicitly authorizes a separate terminal-only order-prep smoke script. Even that future path must stop at review-ready and must still forbid final KOP/SALJ, order submission, cookies/session export, BankID automation, Trade UI wiring, API route wiring, and Supabase writes.

## Local Smoke Result Capture

`docs/avanza-local-smoke-test-result-capture.md` now documents the safe checklist/result capture model for login, order-prep, settlement, and full operator run evidence. The model records outcomes without storing sensitive data and does not activate smoke tests, persist results, wire Trade UI, wire API routes, navigate from app runtime, submit orders, click final KOP/SALJ, handle cookies/session, automate BankID, write Supabase, or claim production readiness.

## Passive Execution Readiness Preview

`docs/avanza-passive-execution-readiness-preview.md` now documents a passive Trade UI/readiness preview. It provides visibility before active integration and does not start handoff, prepare orders, run smoke tests from UI, call APIs, fetch, poll, start browser automation, access credentials, submit orders, click final KOP/SALJ, write Supabase, or claim production readiness.

## Settings Passive Execution Readiness Panel

`docs/avanza-settings-passive-execution-readiness-panel.md` now records that passive readiness is visible in app Settings beside the Avanza execution profile. This is Settings UI visibility only and remains separate from the terminal-only local-dev runbook and Trade UI order flow: no smoke test from UI, API call, fetch/polling, browser automation, credential access, cookies/session handling, BankID automation, order submission, final KOP/SALJ click, Supabase write, or production readiness is added.
