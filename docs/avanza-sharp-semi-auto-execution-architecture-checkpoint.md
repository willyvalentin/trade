# Sharp Semi Auto Execution Architecture Checkpoint

## Current architecture status

The Sharp Semi Auto Execution architecture is complete as a model, fixture, mock, and dry-run visibility stack. It is not production ready, does not execute Avanza actions, and does not wire Trade UI or API route execution.

The checkpoint is represented by the pure readiness map in `lib/avanza-execution-architecture-readiness-map.ts`, static fixtures in `lib/avanza-execution-architecture-readiness-map-fixtures.ts`, and the fixture/model-only harness rendered on `app/dev/avanza-visual-qa/page.tsx`.

## Completed layers

- Login stack: real-world login signal pack, login route planner, login action contract, dry-run executor, mock page executor, local-dev executor contract, credential runtime bundle, isolated smoke harness, hard-gated smoke runner, and terminal-only smoke script scaffold.
- Credential security: macOS Keychain provider contract, credential resolution bridge, credential-safe reporting, and no raw credential exposure.
- Settings UI: passive Ture Avanza execution profile scaffold with no execution behavior.
- Instrument search and order ticket stack: signal packs, route/action contracts, field contract, action contract, handoff chain, dry-run executor, and mock executor.
- Local-dev order/search page action binding: injected Playwright-like dependency adapter for search, instrument verification, BUY/SELL entry location, order field preparation, and order review snapshots.
- Settlement reconciliation stack: settlement note signals, route/action contracts, extraction schema, reconciliation mapping, dry-run executor, and mock executor.
- Disabled local-only chain: disabled bridge contract, disabled localhost stub, disabled local-only API route, hard-disabled Trade UI metadata, disabled manual test path, and approval gate.

## Readiness assessment

The architecture is mature at model/mock level. The login stack is ready for local-dev binding. Instrument search, order ticket, pre-submit handoff, and settlement reconciliation are not ready for production because they still need real local-dev binding evidence and safety review.

The current production readiness state is `not_ready`.

## Safety boundaries

- No Avanza execution.
- No real Avanza navigation.
- No form fill.
- No final KOP/SALJ click.
- No order submission.
- No cookies or session export.
- No BankID automation or bypass.
- No credential exposure.
- No Trade UI execution wiring.
- No API route execution wiring.
- No Supabase execution write.

Final KOP/SALJ must remain a human-only action because the last broker confirmation is the irreversible order boundary. The architecture may prepare read-only or local-dev evidence, but it must not cross the final broker action.

## What remains not implemented

- Local-dev order chain smoke test harness.
- Settlement local-dev signal/document binding plan.
- Real settlement document read.
- OCR.
- Real settlement value extraction.
- Reconciliation write.
- Passive Trade UI handoff preview integration beyond the existing hard-disabled metadata.
- Guarded active bridge/API route review.
- Production readiness.

## Recommended next path

1. Local-dev order chain smoke test harness.
2. Settlement local-dev signal/document binding plan, not OCR yet.
3. Ture Trade UI passive handoff preview integration.
4. Later: guarded active local bridge/API route review.

The first local-dev order/search page action binding now exists, but local-dev smoke evidence should happen before Trade UI integration because real page/action behavior is the next safety proof. It is still not wired to Trade UI/API and does not include order submission or final KOP/SALJ click. Trade UI should remain passive until local-dev behavior is proven without enabling execution.

The local-dev order chain executor now exists in `lib/avanza-instrument-to-order-local-dev-executor.ts`. It uses injected order/search page action dependencies to model search execution, instrument verification, order field preparation, and review-ready state. It is not wired to Trade UI/API and still cannot submit orders or click final KOP/SALJ. Final human action remains required.

The Avanza order chain smoke test runner now exists in
`lib/avanza-order-chain-smoke-test-runner.ts`. It is the order-side counterpart
to the login smoke runner and remains local-dev, terminal-gated, and injected
dependency only. It is disconnected from Trade UI/API and order submission,
cannot click final KOP/SALJ, and keeps final human action required.

## Settlement reconciliation note

Settlement reconciliation remains a required future phase for exact PnL because brokerage, FX, settlement amount, trade date, and settlement date must be reconciled from verified settlement information before any real execution workflow can be trusted. This checkpoint adds no document reading, OCR, extraction, reconciliation write, or Supabase write.
## Local-Dev Execution Runbook

`docs/avanza-local-dev-execution-runbook.md` now records the local-dev operator
sequence for login plus order-prep smoke tests. It is docs/model/dev-QA only and
does not activate execution. It confirms the current architecture still has no
Trade UI/API wiring, no app-runtime Avanza navigation, no cookies/session
handling, no BankID automation, no order submission, no final KOP/SALJ click,
no Supabase write, and no production readiness claim.

`scripts/avanza-order-chain-smoke-test.local.ts` now exists as a terminal-only
hard-gated order smoke scaffold. It remains default-safe, CI-blocked,
disconnected from Trade UI/API/order submission, and review-ready/final human
action is the maximum endpoint.

## Local Smoke Result Capture

`docs/avanza-local-smoke-test-result-capture.md` now documents the model-only checklist/result capture layer for local smoke evidence. It can record safe operator observations and safe runner statuses without storing sensitive data, but it does not activate smoke tests, persist results, wire Trade UI/API, navigate from app runtime, handle cookies/session, automate BankID, submit orders, click final KOP/SALJ, write Supabase, or make a production readiness claim.

## Passive Execution Readiness Preview

`docs/avanza-passive-execution-readiness-preview.md` now documents the passive execution readiness preview. It provides visibility before active integration and does not add active handoff, prepare action, buy/sell CTA, API calls, fetch/polling, browser automation, smoke tests from UI, credential access, order submission, final KOP/SALJ click, Supabase writes, or production readiness.

## Settings Passive Execution Readiness Panel

`docs/avanza-settings-passive-execution-readiness-panel.md` now documents the app Settings passive readiness panel. It exposes readiness beside the Avanza execution profile while keeping the architecture non-executing and separate from Trade UI order flow: no active handoff, prepare action, buy/sell CTA, API calls, fetch/polling, browser automation, smoke tests from UI, credential access, cookies/session handling, BankID automation, order submission, final KOP/SALJ click, Supabase writes, or production readiness.
## Passive Recommendation/Live-Position Metadata

The architecture now has a passive recommendation/live-position execution readiness metadata layer. It prepares future read-only card visibility for entry BUY, exit SELL, and settlement readiness while keeping handoff, prepare actions, API calls, browser automation, order submission, and final KÖP/SÄLJ clicks disabled.

The card-level read-only adapter converts that metadata into display-safe labels and badges for future passive card visibility. It does not activate execution.
