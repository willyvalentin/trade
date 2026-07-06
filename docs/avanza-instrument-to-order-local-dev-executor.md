# Avanza Instrument-To-Order Local-Dev Executor

## Current status

The local-dev order chain executor now exists in `lib/avanza-instrument-to-order-local-dev-executor.ts`.

It consumes the pre-submit instrument-to-order handoff chain and uses injected order/search page action dependencies. It is local-dev only, fixture/mock visible, and not production ready.

It is not wired to Trade UI/API and still cannot submit orders or click final KOP/SALJ.

## What it can model

- Search execution through injected dependencies only.
- Search input fill with values hidden in reports.
- Search result selection through injected dependencies only.
- Instrument verification through a redacted snapshot result.
- BUY/SELL entry location without clicking final KOP/SALJ.
- Order field preparation through injected dependencies only.
- Review-ready state and redacted order review snapshot reading.
- Stop before final human action.

## Dependency boundary

The executor accepts explicit injected dependencies that match the order/search page action binding. It does not import Playwright, does not create a browser, and does not run actions at module load or during render.

Fixture reports can show modeled ready, executed-to-review, blocked, and failed states. Runtime fill values may be used only inside an injected function call; safe reports only expose `valueUsed` and `valueVisible: false`.

## Safety guarantees

- No Trade UI wiring.
- No API route wiring.
- No automatic app-runtime Avanza navigation.
- No cookies/session read.
- No session export.
- No BankID automation or bypass.
- No order submission.
- No final KOP/SALJ click.
- Final human action required.
- Controls disabled.
- Gate locked.
- No Supabase execution write.

## What is not implemented

- Trade UI execution integration.
- API route integration.
- Automatic Avanza navigation from app runtime.
- Cookie/session handling.
- Confirmation capture.
- BUY/SELL order submission.
- Final KOP/SALJ click.
- Production readiness.

## Dev QA visibility

Static fixtures and the isolated harness are rendered on the dev-only Avanza visual QA route as fixture/model-only visibility. This does not create a main navigation link, does not wire the executor into Trade UI or API routes, and does not activate real browser behavior by default.

## Order Chain Smoke Test Runner

The Avanza order chain smoke test runner now exists in
`lib/avanza-order-chain-smoke-test-runner.ts`. It is the order-side counterpart
to the login smoke runner and uses injected dependencies to model a local-dev
search, instrument verification, order field preparation, and review-ready stop
path.

It remains disconnected from Trade UI/API and order submission. It cannot click
final KOP/SALJ; final human action remains required.
