# Avanza Login Dry-Run Executor

Status: `avanza_login_dry_run_executor_model_added`

## Purpose

Login dry-run executor is now modeled.

It consumes the Avanza login action contract and simulates whether the planned
login actions are internally coherent for a future local-dev executor. It does
not execute browser actions.

It verifies that login action plans are internally coherent before any real
action execution and remains non-executing.

This is a prerequisite before any real local-dev login execution. It gives the
Sharp Semi Auto Execution Agent a non-executing report layer between action
planning and any future browser-controlled login work.

## Implemented Files

- `lib/avanza-login-dry-run-executor.ts`
- `lib/avanza-login-dry-run-executor-fixtures.ts`
- `components/execution/AvanzaLoginDryRunExecutorHarness.tsx`

The isolated dev QA route renders the harness with fixture/model-only data.

## What It Consumes

The dry-run executor accepts explicit input only:

- login action contract
- execution settings profile
- credential provider state
- page state
- local-dev dry-run mode

It does not read app state, environment variables, credential providers,
browser state, cookies, sessions, or storage.

## What It Reports

The report includes:

- dry-run status
- customer type
- login method
- action reports
- next expected page state
- warnings
- blocked reasons
- safety flags

Action reports show what signal text would be targeted and whether a secure
credential reference would be needed. They never include credential material.

## Safety Boundary

The dry-run executor does not:

- navigate
- log in
- read credentials
- return credentials
- log credentials
- fill username
- fill password
- click login
- click anything
- read cookies or sessions
- automate BankID
- bypass BankID
- submit orders
- write Supabase execution records

Every action report keeps:

- `containsCredentialMaterial: false`
- `executableNow: false`

Every report keeps:

- `canExecuteActions: false`
- `canReadCredentialMaterial: false`
- `canReturnCredentialMaterial: false`
- `canLogCredentialMaterial: false`
- `canFillUsername: false`
- `canFillPassword: false`
- `canClick: false`
- `canClickLoginSubmit: false`
- `canNavigate: false`
- `canSubmitOrder: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

## BankID And MFA Boundary

BankID/MFA contract states produce `dry_run_bankid_or_mfa_stop`. The executor
stops at the manual-action boundary and does not plan automation or bypass.

## Fixture Coverage

Fixtures cover:

- disabled
- already logged in/no action needed
- private username/password dry-run passed
- private username/password method selection dry-run passed
- company username/password dry-run passed
- company toggle dry-run passed
- missing credentials
- BankID/MFA stop
- blocked contract
- error
- unknown

## Not Implemented

This task does not implement:

- Trade UI integration
- actual Avanza navigation
- actual login
- credential provider access
- Keychain access
- 1Password CLI calls
- environment variable reads
- credential return
- cookie/session handling
- login form fill
- click behavior
- order behavior
- API route calls
- fetch
- Supabase execution writes
- production readiness

## Login Mock Page Executor Follow-Up

Mock executor is now modeled in
`docs/avanza-login-mock-page-executor.md` and
`lib/avanza-login-mock-page-executor.ts`.

It can simulate private/company login action sequences against an in-memory
mock page model. It remains mock-only and non-browser. It still does not access
credentials, use Playwright, navigate to Avanza, fill real forms, click real
buttons, submit login, handle cookies/session, submit orders, or write Supabase
execution records.

## Login Local-Dev Executor Follow-Up

Local-dev executor contract is now modeled in
`docs/avanza-login-local-dev-executor.md` and
`lib/avanza-login-local-dev-executor.ts`.

It can execute through explicitly injected mock/page dependencies only. It
does not resolve credentials yet, does not run by default, and is not wired
into Trade UI. It uses credential references only and keeps BankID/MFA,
cookies/session handling, order behavior, and final KÖP/SÄLJ clicks forbidden.
