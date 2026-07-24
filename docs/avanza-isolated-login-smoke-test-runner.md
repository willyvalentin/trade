# Avanza isolated login smoke test runner

## Current status

Hard-gated smoke test runner now exists at
`lib/avanza-isolated-login-smoke-test-runner.ts`.

It is the first explicit local terminal entrypoint model for future Avanza
local-dev login smoke testing. It remains disconnected from Trade UI,
disconnected from API routes, disconnected from order flow, and not
production-ready.

## Purpose

The runner defines the hard gates and safe-report shape for a future local-dev
Avanza login smoke test. It is terminal-only by design and uses injected
dependencies only:

- smoke-test plan builder
- credential runtime bundle builder
- Playwright-like page action binding builder
- login executor
- resource close hook

No dependency is called during import, render, or normal tests. Model-only and
dry-run modes return safe reports without using a real page or credential
runtime bundle.

## Required gates

A real local-dev run can only become ready when all of these are true:

- local-dev only
- not CI
- runner enabled
- explicit env opt-in present
- manual terminal confirmation present
- real Playwright page explicitly allowed
- credential runtime bundle explicitly allowed
- username/password login explicitly allowed
- navigation to Avanza login explicitly allowed
- BankID automation forbidden
- order submission forbidden
- final KÖP/SÄLJ click forbidden
- Trade UI wiring forbidden
- API route wiring forbidden

## Credential boundary

The runner must never expose raw credentials. Safe reports show only booleans
such as `credentialRuntimeBundleUsed`, `usernameUsed`, and `passwordUsed`.

The runner does not log credentials, store credentials, return credential
material to UI, write broker credentials to Supabase, or use browser storage for
credential material.

## Safety guarantees

- Runner is isolated local-dev only.
- Runner is terminal-only.
- Runner is never run in CI.
- Runner requires explicit env opt-in.
- Runner requires manual terminal confirmation.
- Runner uses injected dependencies.
- Runner does not expose raw credentials.
- Runner does not log/store credentials.
- Runner does not read cookies/session.
- Runner does not automate BankID.
- Runner does not submit orders.
- Runner does not click final KÖP/SÄLJ.
- Runner is not wired into Trade UI/API.
- Runner is not production-ready.

## Safe local checklist

Before any future manual local run, verify:

1. The environment is local-dev and not CI.
2. The explicit smoke-test opt-in gate is present.
3. The manual terminal confirmation gate is present.
4. The runner mode is intentionally selected.
5. Dependencies are injected by local-dev code only.
6. Credential values remain inside runtime scope.
7. Reports contain no credential values.
8. BankID or MFA stops automation.
9. Cookies and sessions are not read or exported.
10. No order can be submitted and no final KÖP/SÄLJ click can occur.

No actual credentials belong in docs, fixtures, commands, logs, reports, or UI.

## Terminal script scaffold

The terminal-only script scaffold now exists at
`scripts/avanza-login-smoke-test.local.ts`.

It remains disconnected from Trade UI, disconnected from API routes, and
disconnected from order flow. It is default-safe and hard-gated: CI is blocked,
`TURE_AVANZA_LOGIN_SMOKE_TEST=1` is required, manual local confirmation is
required, and `TURE_AVANZA_LOGIN_REAL_RUN=1` is required before explicit
real-run mode can be modeled.

No `package.json` script was added because the project does not currently
include `tsx` or another TypeScript script runner dependency for this flow. The
scaffold is not referenced by build, test, lint, Trade UI, or API routes.

## Implemented artifacts

- `lib/avanza-isolated-login-smoke-test-runner.ts`
- `lib/avanza-isolated-login-smoke-test-runner-fixtures.ts`
- `scripts/avanza-login-smoke-test.local.ts`
- `lib/avanza-terminal-login-smoke-script-fixtures.ts`
- `components/execution/AvanzaIsolatedLoginSmokeTestRunnerHarness.tsx`
- `components/execution/AvanzaTerminalLoginSmokeScriptHarness.tsx`
- fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`

## Not implemented

This phase does not add real settings UI, settings persistence, Trade UI
integration, API route integration, automatic Avanza navigation from app
runtime, direct Keychain command execution outside injected dependencies,
1Password CLI calls, environment variable credential fallback, credential
material return to UI, credential material logging, cookie/session handling,
BUY/SELL order fill, final KÖP/SÄLJ click, confirmation capture, or Supabase
execution writes.

## Passive Settings UI Relationship

A passive Ture Settings UI scaffold now exists at
`components/execution/AvanzaExecutionSettingsProfilePanel.tsx`.

It models account type and credential readiness only. It does not execute login,
does not run this isolated smoke test runner, does not call browser actions,
does not call API routes, does not access Keychain from UI, does not expose raw
username/password values, and does not submit orders or final KÖP/SÄLJ.
