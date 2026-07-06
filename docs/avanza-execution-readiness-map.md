# Avanza Execution Readiness Map

## Purpose

This readiness map summarizes the Sharp Semi Auto Execution architecture as a pure fixture/model-only architecture checkpoint. It helps inspect which layers are complete, which are waiting for local-dev binding, which are forbidden, and which next actions are recommended before any future Trade UI or API route execution work.

The current UI strategy is intentionally minimal. Recommendation cards stay
visually simple while future Execution Agent data is modeled under the surface
through hidden/headless contracts. Visual readiness badges remain
optional/default-off/dev-QA only.

## Map artifacts

- Pure model: `lib/avanza-execution-architecture-readiness-map.ts`
- Static fixtures: `lib/avanza-execution-architecture-readiness-map-fixtures.ts`
- Isolated harness: `components/execution/AvanzaExecutionArchitectureReadinessMapHarness.tsx`
- Dev QA route section: `app/dev/avanza-visual-qa/page.tsx`
- Local-dev order/search page action binding: `lib/avanza-local-playwright-order-page-action-binding.ts`
- Headless execution data contract: `lib/avanza-headless-execution-data-contract.ts`
- Headless execution contract selector: `lib/avanza-headless-execution-contract-selector.ts`

## Readiness areas

- `login`: ready for local-dev binding.
- `credential_security`: complete as model-only and credential-safe.
- `settings_ui`: complete as model-only and passive.
- `instrument_search`: waiting for local-dev binding.
- `order_ticket`: ready for mock, not real fill.
- `pre_submit_handoff`: ready for mock, still stops before final broker action.
- `settlement_reconciliation`: ready for mock, no document read or reconciliation write.
- `local_dev_execution`: waiting for real local-dev binding evidence.
- `trade_ui_integration`: waiting for UI integration and not wired for execution.
- `api_route_integration`: forbidden in this checkpoint.
- `safety_governance`: complete as model-only.

## Production readiness

Production readiness is `not_ready`; the architecture is not production ready. The map does not claim execution readiness, production readiness, or broker readiness.

## Safety flags

The map is fixture/model-only. It cannot execute Avanza actions, navigate Avanza, fill order fields, click final KOP/SALJ, submit orders, read cookies, export sessions, automate BankID, expose credentials, write Supabase records, wire Trade UI execution, wire API route execution, or claim production readiness.

The map requires user confirmation, keeps the final human click boundary, keeps controls disabled, and keeps the gate locked.

## Next recommended actions

1. Local-dev order chain smoke test harness.
2. Settlement local-dev signal/document binding plan, not OCR yet.
3. Ture Trade UI passive handoff preview integration.
4. Later: guarded active local bridge/API route review.

The local-dev order/search page action binding now exists as an injected Playwright-like dependency layer. It can supply future local-dev order executors, but it is not wired to Trade UI/API and does not include order submission or final KOP/SALJ click.

The local-dev order chain executor now exists in `lib/avanza-instrument-to-order-local-dev-executor.ts`. It uses injected order/search page action dependencies to model search execution, instrument verification, order field preparation, and review-ready state. It is not wired to Trade UI/API and still cannot submit orders or click final KOP/SALJ.

The Avanza order chain smoke test runner now exists in
`lib/avanza-order-chain-smoke-test-runner.ts`. It is the order-side counterpart
to the login smoke runner and models the local-dev order preparation smoke path
through injected dependencies only. It remains disconnected from Trade UI/API
and order submission, cannot click final KOP/SALJ, and keeps final human action
required.

## Non-goals

This map does not add real execution, real navigation, form fill, final KOP/SALJ click, order submission, credential/session handling, BankID automation, document reading, OCR, value extraction, reconciliation writes, Trade UI execution wiring, API route wiring, or Supabase writes.
## Local-Dev Execution Runbook

The local-dev execution runbook now exists as the operator guide before any real
local-dev order smoke script or Trade UI/API integration. It summarizes login
smoke review, order-prep smoke review, review-ready stop, and safety boundaries
while preserving no real execution, no app-runtime navigation, no
cookies/session export, no BankID automation, no order submission, no final
KOP/SALJ click, no Supabase write, and not production ready.

The terminal-only Avanza order smoke script scaffold now exists at
`scripts/avanza-order-chain-smoke-test.local.ts`. It is hard-gated, blocked in
CI, default-safe, disconnected from Trade UI/API/order submission, and stops at
review-ready/final human action.

## Local Smoke Result Capture

`docs/avanza-local-smoke-test-result-capture.md` now records the checklist/result capture model for safe login, order-prep, settlement, and full operator run evidence. It records outcomes without storing sensitive data and does not activate smoke tests, persist results, wire Trade UI, wire API routes, navigate from app runtime, handle cookies/session, automate BankID, submit orders, click final KOP/SALJ, write Supabase, or claim production readiness.

## Passive Execution Readiness Preview

`docs/avanza-passive-execution-readiness-preview.md` now records the passive Trade UI/readiness preview layer. It provides visibility before active integration and keeps no active handoff, no prepare action, no buy/sell CTA, no API call, no fetch/polling, no browser automation, no smoke test from UI, no credential access, no order submission, no final KOP/SALJ click, no Supabase write, and no production readiness claim.

## Settings Passive Execution Readiness Panel

`docs/avanza-settings-passive-execution-readiness-panel.md` now records that the readiness map is visible in app Settings as passive UI only. The Settings panel remains non-executing and separate from Trade UI order flow: no active handoff, prepare action, buy/sell CTA, API call, fetch/polling, browser automation, smoke test from UI, credential access, cookies/session handling, BankID automation, order submission, final KOP/SALJ click, Supabase write, or production readiness claim is added.
## Recommendation/Live-Position Readiness Metadata

The readiness map now includes a passive recommendation/live-position metadata layer through `lib/avanza-passive-trade-execution-readiness.ts`. It models entry BUY readiness, exit SELL readiness, and settlement readiness for future read-only visibility only; it does not activate execution.

The card-level read-only adapter in `lib/avanza-trade-card-execution-readiness-adapter.ts` prepares future passive card visibility by converting readiness metadata into labels, badges, severity, tooltips, warnings, and blocked reasons without activating execution.

## Headless Execution Data Contract

`docs/avanza-headless-execution-data-contract.md` records the agent-readable,
UI-hidden contract layer for future BUY/SELL preparation. It can describe
source identity, intent, ticker/instrument identity, quantity, limit price,
stop/target/risk context, human final confirmation requirements, forbidden
actions, audit metadata, and settlement expectations while keeping
`visibleInUi: false` and `canRenderVisualBadge: false`.

The contract is not a handoff, not a prepare action, not visible card UI, and
cannot call APIs, fetch, poll, control a browser, access credentials, handle
cookies/session, automate BankID, submit orders, click final KOP/SALJ, or write
Supabase.

## Headless Execution Contract Selector

`docs/avanza-headless-execution-contract-selector.md` records the headless
selection layer for future Execution Agent planning. It chooses the next
agent-readable contract under the surface, with exits outranking entries,
stop-loss exits outranking target exits, target exits outranking entries, and
entry candidates sorted by confidence, reward:risk, then newness.

The selector is not visible Trade UI, not a handoff, not a prepare action, and
cannot call APIs, fetch, poll, control a browser, access credentials, handle
cookies/session, automate BankID, submit orders, click final KOP/SALJ, or write
Supabase.

In selector terms, exits outrank entries, stop-loss exits outrank target exits,
and target exits outrank entries.

## Headless Agent Plan Builder

`docs/avanza-headless-agent-plan-builder.md` records the next under-the-surface
layer after selection. The contract selector now feeds a headless agent plan
builder that models future Avanza preparation steps without visual UI or
execution. It is agent-readable but UI-hidden, keeps Ture UI minimal and simple,
plans recommendation BUY and live-position SELL flows, stops before final
confirmation, requires human final KOP/SALJ, and forbids active handoff,
prepare actions, API calls, fetch/polling, browser automation now, credential
access, cookies/session handling, BankID automation, order submission, final
clicks, Supabase writes, and production-readiness claims.
