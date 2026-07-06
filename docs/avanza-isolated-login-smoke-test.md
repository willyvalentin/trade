# Avanza isolated login smoke test

## Current status

Isolated login smoke test planning now exists.

The isolated local-dev Avanza login smoke test model now exists at
`lib/avanza-isolated-login-smoke-test.ts`.

It is the first safe wrapper for future real local-dev login testing. It remains
disconnected from Trade UI, disconnected from API routes, disconnected from
order flow, and not production-ready.

## Purpose

The model documents how a developer may later run an explicit local-dev login
smoke test through the existing Sharp Semi Auto Execution Agent login stack:

- execution settings profile
- credential resolution
- login route planning
- login action contract
- Playwright page action binding
- local-dev login executor
- post-login state detection

This phase is fixture/model-only. It does not perform a login and does not
launch or control a browser.

## Required gates

A future real local-dev smoke test must satisfy every gate below before it can
be considered ready:

- isolated local-dev only
- never run in CI
- explicit environment opt-in
- manual terminal invocation and confirmation
- real Playwright page allowed only in explicit local-dev mode
- runtime credential bundle allowed only inside function scope
- username/password login only
- BankID and MFA remain manual-action stop states
- no Trade UI wiring
- no API route wiring
- no order behavior

## Credential boundary

Runtime credential values may exist only inside an explicit local-dev function
scope in a future implementation. Safe reports must expose booleans such as
`credentialRuntimeBundleUsed`, `usernameUsed`, and `passwordUsed` only.

The smoke-test model must never show, log, store, or return raw credentials. It
must not write credential material to Supabase, localStorage, sessionStorage, or
any UI report.

## Safety guarantees

- Smoke test is isolated local-dev only.
- It is never run in CI.
- It requires explicit env opt-in.
- It requires manual terminal invocation/confirmation.
- It is not wired into Trade UI.
- It is not exposed through an API route.
- It may use a real Playwright page only in explicit local-dev mode.
- It may use runtime credential bundle only inside function scope.
- It must never show/log/store raw credentials.
- It must never read cookies/session.
- It must never automate BankID.
- It must never submit orders.
- It must never click final KÖP/SÄLJ.
- It is not production-ready.

## Safe future run checklist

Before any future manual smoke test is allowed, the developer must confirm:

1. The run is local-dev only and not CI.
2. The explicit opt-in flag for the smoke-test phase is present.
3. The command is run manually in a terminal by the developer.
4. Credential values are resolved only through the approved runtime bundle.
5. Reports and UI show only safe booleans, labels, reasons, warnings, and
   blocked reasons.
6. BankID or MFA immediately stops automation and requires manual user action.
7. No cookies/session data are read or exported.
8. No order form submission or final KÖP/SÄLJ click is possible.

No credential values belong in commands, docs, fixtures, reports, logs, or UI.

## Implemented artifacts

- `lib/avanza-isolated-login-smoke-test.ts`
- `lib/avanza-isolated-login-smoke-test-fixtures.ts`
- `components/execution/AvanzaIsolatedLoginSmokeTestHarness.tsx`
- fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`

## Not implemented

This phase does not add real settings UI, settings persistence, Trade UI
integration, API route integration, automatic Avanza navigation from app
runtime, direct Keychain command execution outside injected dependencies,
1Password CLI calls, environment credential fallback, credential material
return to UI, credential material logging, cookie/session handling, BUY/SELL
order fill, final KÖP/SÄLJ click, confirmation capture, or Supabase execution
writes.

## Hard-gated runner relationship

Hard-gated smoke test runner now exists at
`lib/avanza-isolated-login-smoke-test-runner.ts`.

It is the first explicit local terminal entrypoint model. It remains
disconnected from Trade UI, disconnected from API routes, and disconnected from
order flow. It uses injected dependencies only after explicit local-dev/manual
terminal/env opt-in gates are satisfied, blocks CI, and keeps credential values
out of reports, UI, logs, fixtures, and docs.

## Terminal script scaffold relationship

The terminal-only script scaffold now exists at
`scripts/avanza-login-smoke-test.local.ts`. It remains disconnected from Trade
UI, disconnected from API routes, and disconnected from order flow. It is
default-safe and hard-gated: CI is blocked, explicit env opt-in and manual local
confirmation are required, and the separate real-run flag is required before
explicit real-run mode can be modeled.
