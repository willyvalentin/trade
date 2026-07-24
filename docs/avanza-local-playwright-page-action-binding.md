# Avanza local Playwright page action binding

## Current status

Playwright page action binding now exists at
`lib/avanza-local-playwright-page-action-binding.ts`.

It can supply injected dependencies to the local-dev credential executor. It is
still not wired to Trade UI or any active API route. It does not include order
behavior.

## Purpose

This binding adapts injected Playwright-like page methods to Ture login executor
dependencies:

- `clickByText`
- `fillByLabel`
- `waitForState`
- `readPageSnapshot`

It does not import or run Playwright at module load. Tests and harnesses use
mocked page objects only.

## Boundaries

The binding does not navigate by itself. It does not read credentials. It may
receive runtime values inside function scope for `fillByLabel`, but reports hide
values and expose only safe booleans such as `valueUsed` and `valueVisible:
false`.

Snapshot text is redacted by default. The binding does not read cookies/session,
does not automate BankID, does not submit orders, and does not click final
KÖP/SÄLJ.

## Implemented artifacts

- `lib/avanza-local-playwright-page-action-binding.ts`
- `lib/avanza-local-playwright-page-action-binding-fixtures.ts`
- `components/execution/AvanzaLocalPlaywrightPageActionBindingHarness.tsx`
- fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`

## Safety guarantees

- Fixture/mock only in the dev QA route and tests.
- Injected Playwright-like page only.
- No automatic Avanza navigation.
- No raw credentials shown.
- Fill values hidden in reports.
- No cookies/session handling.
- BankID automation/bypass remains forbidden.
- No order submission.
- No final KÖP/SÄLJ click.
- Not production ready.

## Not implemented

This phase does not add real settings UI, settings persistence, Trade UI
integration, API route integration, actual Avanza navigation orchestration,
direct Keychain command execution, environment credential fallback, cookie or
session handling, order fill, final KÖP/SÄLJ click, confirmation capture, or
Supabase execution writes.

## Isolated login smoke test relationship

Isolated login smoke test planning now exists at
`lib/avanza-isolated-login-smoke-test.ts`.

It is the first safe wrapper for future real local-dev login testing. It
remains disconnected from Trade UI, disconnected from API routes, disconnected
from order flow, and requires explicit local-dev/manual terminal/env opt-in
gates before any future real smoke test can be considered.

## Hard-gated runner relationship

Hard-gated smoke test runner now exists at
`lib/avanza-isolated-login-smoke-test-runner.ts`.

It is the first explicit local terminal entrypoint model. It remains
disconnected from Trade UI, disconnected from API routes, and disconnected from
order flow. It can use the page action binding only through injected
dependencies after all local-dev gates pass.

## Terminal script scaffold relationship

The terminal-only script scaffold now exists at
`scripts/avanza-login-smoke-test.local.ts`. It remains disconnected from Trade
UI, disconnected from API routes, and disconnected from order flow. It is
default-safe and hard-gated, and this page action binding is still only a
future injected dependency boundary rather than app/runtime wiring.
