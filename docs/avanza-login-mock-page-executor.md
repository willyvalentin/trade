# Avanza Login Mock Page Executor

Status: `avanza_login_mock_page_executor_model_added`

## Purpose

Mock executor is now modeled.

The Avanza login mock page executor consumes the login action contract and
login dry-run report, then simulates private/company login action sequences
against a mock page model.

It can simulate private/company login action sequences.

It is the first execution-shaped layer for the Sharp Semi Auto Execution Agent,
but it remains mock-only and non-browser. It still does not access credentials.

It remains mock-only and non-browser.

This is the last step before real local-dev Playwright executor planning.

## Implemented Files

- `lib/avanza-login-mock-page-executor.ts`
- `lib/avanza-login-mock-page-executor-fixtures.ts`
- `components/execution/AvanzaLoginMockPageExecutorHarness.tsx`

The isolated dev QA route renders the harness with static fixture/model-only
data.

## What It Consumes

The mock page executor accepts explicit input only:

- login action contract
- login dry-run report
- initial mock page state
- execution settings profile
- credential provider readiness metadata
- mock-local-dev mode

It does not read app state, browser state, environment variables, credential
providers, cookies, sessions, storage, or live Avanza pages.

## Mock Page Behavior

The mock page model can represent:

- initial login choice
- private username/password form
- company username/password form
- BankID/MFA boundary
- logged-in home
- unknown state

Valid private/company action contracts can be simulated from initial login
choice or an already-visible username/password form into a mock logged-in home.

The executor can simulate:

- choosing `Användarnamn och lösenord`
- choosing `Företag`
- username reference use without values
- password reference use without values
- `Logga in` mock transition

These are in-memory mock page transitions only.

## Safety Boundary

The mock executor does not:

- use Playwright
- navigate to Avanza
- perform actual login
- read credentials
- return credentials
- log credentials
- fill real forms
- click real buttons
- submit login
- read cookies or sessions
- automate BankID
- bypass BankID
- submit orders
- write Supabase execution records

Every action report keeps:

- `containsCredentialMaterial: false`
- `realBrowserAction: false`

Every report keeps:

- `mockOnly: true`
- `canExecuteRealBrowserActions: false`
- `canReadCredentialMaterial: false`
- `canReturnCredentialMaterial: false`
- `canLogCredentialMaterial: false`
- `canFillUsernameReal: false`
- `canFillPasswordReal: false`
- `canClickReal: false`
- `canClickLoginSubmitReal: false`
- `canAutomateBankId: false`
- `canBypassBankId: false`
- `canReadCookies: false`
- `canExportSession: false`
- `canNavigateRealBrowser: false`
- `canSubmitOrder: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

`canExecuteMockActions` may be true only for valid enabled mock-local-dev
fixture states. It does not grant real browser capability.

## BankID And MFA Boundary

BankID/MFA mock states produce `mock_bankid_or_mfa_stop`. The executor stops at
the manual-action boundary and does not plan automation or bypass.

## Fixture Coverage

Fixtures cover:

- disabled
- already logged in no-op
- private initial login to mock logged in
- private username/password form to mock logged in
- company initial login to mock logged in
- company username/password form to mock logged in
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
- credential material return
- cookie/session handling
- real form fill
- real click behavior
- BUY/SELL order fill
- final KÖP/SÄLJ click
- confirmation capture
- API route calls
- fetch
- Supabase execution writes
- production readiness

## Local-Dev Executor Follow-Up

Local-dev executor contract is now modeled in
`docs/avanza-login-local-dev-executor.md` and
`lib/avanza-login-local-dev-executor.ts`.

It can execute through explicitly injected mock/page dependencies only. It
does not resolve credentials yet, does not run by default, and is not wired
into Trade UI. It uses credential references only and keeps BankID/MFA,
cookies/session handling, order behavior, and final KÖP/SÄLJ clicks forbidden.
