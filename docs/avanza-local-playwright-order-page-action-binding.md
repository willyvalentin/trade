# Avanza Local Playwright Order/Search Page Action Binding

## Current status

The local-dev order/search page action binding now exists in `lib/avanza-local-playwright-order-page-action-binding.ts`. It is still not wired to Trade UI/API and does not include order submission or final KOP/SALJ click.

It adapts injected Playwright-like page methods to the future Ture order/search executor dependency contract. It is local-dev only, fixture/mock visible, and not production ready.

## Supported modeled actions

- Search actions: click by text, fill search input, wait for search results, and select search result by text.
- Instrument verification: read a redacted instrument verification snapshot.
- BUY/SELL entry location: locate the visible entry path without clicking final KOP/SALJ.
- Order ticket preparation: fill modeled order fields while hiding runtime values in reports.
- Order review: wait for order review state and read a redacted review snapshot.

## Dependency boundary

The binding accepts explicit injected Playwright-like page dependencies only. It does not import Playwright at module load and does not run any page action during render or import.

Runtime fill values may be passed into the dependency functions, but reports only expose `valueUsed` and `valueVisible: false`. Snapshot output is redacted by default.

## Safety guarantees

- No automatic Avanza navigation.
- No cookies/session read.
- No session export.
- No BankID automation or bypass.
- No credential values in reports.
- No credential logging.
- No order submission.
- No final KOP/SALJ click.
- No Trade UI wiring.
- No API route wiring.
- No Supabase execution write.
- Controls disabled.
- Gate locked.
- Final human confirmation required.

## What is not implemented

- Real local-dev order chain executor.
- Real Avanza search/navigation from app runtime.
- Real order fill from Trade UI.
- Trade UI execution integration.
- API route integration.
- Cookie/session handling.
- Confirmation capture.
- Production readiness.

## Dev QA visibility

Static fixtures and the isolated harness are rendered on the dev-only Avanza visual QA route as fixture/model-only visibility. This does not create a main navigation link, does not wire the binding into Trade UI, and does not activate real browser behavior.

## Local-Dev Instrument-To-Order Executor

The local-dev order chain executor now exists in `lib/avanza-instrument-to-order-local-dev-executor.ts`. It uses injected order/search page action dependencies to model search execution, instrument verification, order field preparation, and review-ready state.

It is not wired to Trade UI/API and still cannot submit orders or click final KOP/SALJ. Final human action remains required.

## Order Chain Smoke Test Runner

The Avanza order chain smoke test runner now exists in
`lib/avanza-order-chain-smoke-test-runner.ts`. It is the order-side counterpart
to the login smoke runner and remains local-dev, terminal-gated, and injected
dependency only.

It remains disconnected from Trade UI/API and order submission. It cannot click
final KOP/SALJ; final human action remains required.
