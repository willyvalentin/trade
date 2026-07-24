# Avanza login local-dev credential executor

## Current status

Local-dev credential executor now exists at
`lib/avanza-login-local-dev-credential-executor.ts`.

It can use a private runtime credential bundle with injected dependencies. It is
still not wired into Trade UI. It does not include order behavior.

## Purpose

The bridge connects an `AvanzaLoginActionContract` to an
`AvanzaLoginResolvedCredentialRuntimeBundle` and injected page action
dependencies. It defines the local-dev function shape for username/password
login execution while preserving safe reports for UI and docs.

## Credential boundary

Raw username/password may exist only inside local-dev function scope. The
executor may pass those values to injected `fillByLabel` dependencies during
explicit local-dev execution. Safe reports never include raw values.

No credentials are logged. No credentials are stored in Supabase or
localStorage. No credential material is returned to UI.

## Implemented artifacts

- `lib/avanza-login-local-dev-credential-executor.ts`
- `lib/avanza-login-local-dev-credential-executor-fixtures.ts`
- `components/execution/AvanzaLoginLocalDevCredentialExecutorHarness.tsx`
- fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`

## Safety guarantees

- Fixture/mock only in tests and harness.
- Injected dependencies only.
- No real Keychain command runs during import, render, or test.
- No real browser action runs during import or render.
- No cookies/session handling.
- BankID remains forbidden/manual-action only.
- Final KÖP/SÄLJ click remains forbidden for the agent.
- No BUY/SELL order behavior is implemented.
- No Supabase execution write is implemented.
- Not production ready.

## Not implemented

This phase does not add real settings UI, settings persistence, Trade UI
integration, actual Avanza navigation orchestration, direct Keychain command
execution, 1Password CLI calls, environment variable credential fallback,
credential material logging, cookie/session handling, order fill, final
KÖP/SÄLJ click, confirmation capture, or Supabase execution writes.

## Playwright page action binding relationship

Playwright page action binding now exists at
`lib/avanza-local-playwright-page-action-binding.ts`.

It can supply injected dependencies to the local-dev credential executor. It is
still not wired to Trade UI or any active API route. It does not include order
behavior.

## Isolated login smoke test relationship

Isolated login smoke test planning now exists at
`lib/avanza-isolated-login-smoke-test.ts`.

It is the first safe wrapper for future real local-dev login testing. It
remains disconnected from Trade UI, disconnected from API routes, and
disconnected from order flow. The smoke-test model can
record explicit local-dev readiness and safe reports only; it does not expose
raw credentials, read cookies/session, automate BankID, or submit orders.

## Hard-gated runner relationship

Hard-gated smoke test runner now exists at
`lib/avanza-isolated-login-smoke-test-runner.ts`.

It is the first explicit local terminal entrypoint model. It remains
disconnected from Trade UI, disconnected from API routes, and disconnected from
order flow. It can call the local-dev credential executor only through injected
dependencies after local-dev, non-CI, env opt-in, and manual terminal gates
pass.

## Terminal script scaffold relationship

The terminal-only script scaffold now exists at
`scripts/avanza-login-smoke-test.local.ts`. It remains disconnected from Trade
UI, disconnected from API routes, and disconnected from order flow. It is
default-safe and hard-gated, and this credential executor remains a future
injected dependency boundary with no raw credential output.
