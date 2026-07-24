# Avanza Login Local-Dev Executor

Status: `avanza_login_local_dev_executor_contract_added`

## Purpose

The Avanza login local-dev executor contract consumes the login action contract
and defines how explicit local-dev page-action dependencies may execute the
modeled private/company username-password login sequence.

It is local-dev/mock-injected only in this task. It does not run on import,
render, or test setup. It is not wired into Trade UI.

Local-dev executor contract is now modeled. It can execute through explicitly
injected mock/page dependencies only. It does not resolve credentials yet, does
not run by default, and is not wired into Trade UI.

## Implemented Files

- `lib/avanza-login-local-dev-executor.ts`
- `lib/avanza-login-local-dev-executor-fixtures.ts`
- `components/execution/AvanzaLoginLocalDevExecutorHarness.tsx`

The isolated dev QA route renders the harness with static fixture/model-only
data.

## Dependency Contract

The executor can call only explicitly injected dependencies:

- `clickByText(text)`
- `fillByLabel(label, valueReference)`
- optional `waitForState(stateHint)`
- optional `readPageSnapshot()`

`fillByLabel` receives credential references only:

- `username_from_secure_provider`
- `password_from_secure_provider`

This task does not resolve credential material, read credential material, return
credential material, or log credential material.

## Allowed Local-Dev Actions

When explicitly enabled by config, a valid private/company action plan may call:

- `clickByText("Användarnamn och lösenord")`
- `clickByText("Företag")`
- `fillByLabel("Användarnamn", "username_from_secure_provider")`
- `fillByLabel("Lösenord", "password_from_secure_provider")`
- `clickByText("Logga in")`

All actions require explicit `allow*` config flags. `dryRun: true` blocks
execution.

## Safety Boundary

The local-dev executor does not:

- wire into Trade UI
- read real credentials
- return raw credentials
- log raw credentials
- read environment variables
- call Keychain or 1Password
- handle cookies or sessions
- automate BankID
- bypass BankID
- submit orders
- perform BUY/SELL order fill
- click final KÖP/SÄLJ
- write Supabase execution records

Every report keeps:

- `canResolveCredentialMaterial: false`
- `canReadCredentialMaterial: false`
- `canReturnCredentialMaterial: false`
- `canLogCredentialMaterial: false`
- `canAutomateBankId: false`
- `canBypassBankId: false`
- `canReadCookies: false`
- `canExportSession: false`
- `canSubmitOrder: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

## BankID And MFA Boundary

BankID/MFA action plans return `bankid_or_mfa_stop`. No injected page-action
dependency is called for BankID/MFA automation or bypass.

## Fixture Coverage

Fixtures cover:

- disabled executor
- ready private local-dev executor
- ready company local-dev executor
- successful private injected execution report
- successful company injected execution report
- `dryRun: true` blocks execution
- missing credentials
- BankID/MFA stop
- click username/password method failed
- fill username failed
- fill password failed
- click login submit failed
- blocked
- error
- unknown

## Not Implemented

This task does not implement:

- Trade UI integration
- actual Avanza navigation orchestration
- real credential provider access
- Keychain access
- 1Password CLI calls
- environment variable reads
- credential material return
- cookie/session handling
- BUY/SELL order fill
- final KÖP/SÄLJ click
- confirmation capture
- API route calls from Trade UI
- fetch from Trade UI
- Supabase execution writes
- production readiness

## macOS Keychain provider contract

The macOS Keychain provider contract now exists in
`lib/avanza-macos-keychain-credential-provider.ts`.

It provides credential references for local-dev login work. It does not expose
raw credential material. The provider is dependency-injected, local/dev-only,
and fixture/mock visible on the isolated dev QA route. It is not wired into the
local-dev executor yet and does not perform Keychain reads at import, render, or
test time.

It is not wired into Trade UI yet.

## Credential resolution bridge relationship

Credential resolution bridge now exists at
`lib/avanza-login-credential-resolution-bridge.ts`.

It prepares safe local-dev login execution by resolving the executor's
`username_from_secure_provider` and `password_from_secure_provider` references
through injected dependencies only. It does not expose credential material. It
is not wired into Trade UI yet.

The local-dev executor remains unwired to the bridge in this task. No actual
Avanza login with credentials, cookie/session handling, or order behavior is
implemented.

## Local-dev credential executor with runtime bundle

Local-dev credential executor now exists at
`lib/avanza-login-local-dev-credential-executor.ts`.

It can use a private runtime credential bundle with injected dependencies. It is
still not wired into Trade UI. It does not include order behavior.

## Playwright page action binding relationship

Playwright page action binding now exists at
`lib/avanza-local-playwright-page-action-binding.ts`.

It can supply injected dependencies to the local-dev credential executor. It is
still not wired to Trade UI or any active API route. It does not include order
behavior.
