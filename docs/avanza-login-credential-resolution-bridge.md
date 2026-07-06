# Avanza login credential resolution bridge

## Current status

Credential resolution bridge now exists at
`lib/avanza-login-credential-resolution-bridge.ts`.

It prepares safe local-dev login execution by connecting secure provider
references to injected credential-read dependencies. It does not expose
credential material. It is not wired into Trade UI yet.

## Boundary

The bridge may resolve raw username/password values only inside private
local-dev runtime scope. Safe reports expose only resolved/not-resolved flags,
status, labels, reasons, warnings, blocked reasons, and safety flags.

Raw username/password must not be shown in UI. Raw username/password must not be
logged. Raw username/password must not be stored in Supabase. Raw
username/password must not be stored in localStorage. No environment fallback is
allowed.

## Implemented files

- `lib/avanza-login-credential-resolution-bridge.ts`
- `lib/avanza-login-credential-resolution-bridge-fixtures.ts`
- `components/execution/AvanzaLoginCredentialResolutionBridgeHarness.tsx`

The isolated dev QA route renders the harness with fixture/mock-only safe
reports.

## Not implemented

This task does not implement actual Avanza login, settings UI, settings
persistence, Trade UI integration, direct Keychain command execution, 1Password
CLI calls, cookie/session handling, BUY/SELL order fill, final KÖP/SÄLJ click,
confirmation capture, or Supabase execution writes.

BankID remains forbidden/manual-action only. Order submission remains forbidden.

## Local-dev credential executor relationship

Local-dev credential executor now exists at
`lib/avanza-login-local-dev-credential-executor.ts`.

It can use a private runtime credential bundle with injected dependencies. It is
still not wired into Trade UI. It does not include order behavior.

## Isolated login smoke test relationship

Isolated login smoke test planning now exists at
`lib/avanza-isolated-login-smoke-test.ts`.

It is the first safe wrapper for future real local-dev login testing. It
remains disconnected from Trade UI, disconnected from API routes, and
disconnected from order flow. It can only model whether an explicit local-dev
smoke test has satisfied environment, manual terminal, and credential-runtime
gates. Credential values remain hidden from reports and UI.

## Hard-gated runner relationship

Hard-gated smoke test runner now exists at
`lib/avanza-isolated-login-smoke-test-runner.ts`.

It is the first explicit local terminal entrypoint model. It remains
disconnected from Trade UI, disconnected from API routes, and disconnected from
order flow. It can use credential resolution only through injected
dependencies. Safe reports expose credential usage booleans only.
