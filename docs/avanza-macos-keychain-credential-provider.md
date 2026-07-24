# Avanza macOS Keychain credential provider

## Current status

The macOS Keychain provider contract now exists as a pure local/dev-only adapter
model at `lib/avanza-macos-keychain-credential-provider.ts`.

It provides credential references for local-dev login work through explicit
input and injected dependencies only. It does not expose raw credential material.
It does not run Keychain commands at import/render/test time, and is not wired
into Trade UI yet.

## Implemented artifacts

- `lib/avanza-macos-keychain-credential-provider.ts`
- `lib/avanza-macos-keychain-credential-provider-fixtures.ts`
- `components/execution/AvanzaMacosKeychainCredentialProviderHarness.tsx`
- Dev QA route fixture/model-only section in `app/dev/avanza-visual-qa/page.tsx`

## Contract boundary

The provider accepts a dependency object with injected `isAvailable`,
`hasCredential`, `readCredential`, and `writeCredential` functions. The model
does not shell out to `security`, does not read environment variables, does not
use Supabase, does not use localStorage/sessionStorage, and does not import
Trade UI or API route code.

The only UI/report-safe reference fields are safe labels and masked hints.
Raw username and password values are not shown, logged, persisted, or returned
to UI state.

## Safety guarantees

- Fixture/mock only in the dev QA route
- Injected Keychain dependency only
- Local/dev-only
- Credential references only
- No raw password shown
- No raw username shown
- No credential logging
- No Supabase credential storage
- No localStorage credential storage
- No environment fallback by default
- No BankID automation
- No order submission
- Final human confirmation required
- Not production ready

## Non-goals

This phase does not wire the provider into `app/trade-app.tsx`, the disabled
fill-only API route, Settings, Supabase, browser automation, BankID, or order
submission. It also does not store actual credential material in fixtures,
docs, or harness output.

## Credential resolution bridge relationship

Credential resolution bridge now exists at
`lib/avanza-login-credential-resolution-bridge.ts`.

It prepares safe local-dev login execution by connecting secure provider
references to injected credential-read dependencies. It does not expose
credential material. It is not wired into Trade UI yet.

The bridge may resolve raw username/password values only inside private
local-dev runtime scope. Safe reports expose only resolved/not-resolved flags
and never expose raw credential material.

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
disconnected from order flow. Any future run must be explicit local-dev/manual
terminal/env opt-in only, and credential material must remain inside injected
runtime scope.

## Hard-gated runner relationship

Hard-gated smoke test runner now exists at
`lib/avanza-isolated-login-smoke-test-runner.ts`.

It is the first explicit local terminal entrypoint model. It remains
disconnected from Trade UI, disconnected from API routes, and disconnected from
order flow. Any future credential runtime bundle must be supplied through
injected local-dev dependencies only, and safe reports expose usage booleans
only.
