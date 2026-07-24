# Avanza Login Action Contract

Status: `avanza_login_action_contract_model_added`

## Purpose

Login action contract is now modeled.

The Avanza login route planner produces a safe route model. The Avanza login
action contract converts that route into future local-dev browser action
descriptions for the Sharp Semi Auto Execution Agent.

It is the bridge between route planning and future browser actions. Actions are
currently contract-only and non-executable. No credential material appears in
action output.

This phase is contract/model-only. No action is executable yet.

## Implemented Files

- `lib/avanza-login-action-contract.ts`
- `lib/avanza-login-action-contract-fixtures.ts`
- `components/execution/AvanzaLoginActionContractHarness.tsx`

The dev-only visual QA route renders the harness with static fixtures only.

## Route To Action Boundary

Login route planner produces route. Login action contract converts route into
future local-dev actions.

Private route may click "Användarnamn och lösenord" before username/password
fill. Company route may click "Företag" before username/password fill.

Username/password fill requires secure credential provider readiness. No
credentials are included in action output. No password values are returned.
Raw username values are not returned.

## Modeled Actions

The contract can describe:

- `no_op`
- `click_username_password_method`
- `click_private_toggle`
- `click_company_toggle`
- `fill_username`
- `fill_password`
- `click_login_submit`
- `stop_for_bankid_or_mfa`
- `stop_for_manual_user_action`

All actions have `executableInThisTask: false`, `dryRunOnly: true`, and
`containsCredentialMaterial: false`.

## BankID And MFA Boundary

BankID/MFA produces stop/manual-action. BankID remains forbidden for automation,
and BankID bypass remains forbidden.

## Not Implemented

This task does not implement:

- actual navigation
- actual login
- actual credential provider access
- Keychain access
- 1Password CLI calls
- environment variable reads
- credential material return
- cookie/session handling
- Avanza login form fill
- actual click behavior
- BUY/SELL order fill
- final KÖP/SÄLJ click
- confirmation capture
- API route call
- fetch
- Supabase execution writes

## Safety Guarantees

- `canExecuteActions` remains `false`
- `canClickUsernamePasswordMethod` remains `false`
- `canClickPrivateToggle` remains `false`
- `canClickCompanyToggle` remains `false`
- `canFillUsername` remains `false`
- `canFillPassword` remains `false`
- `canClickLoginSubmit` remains `false`
- `canHandleCredentialMaterial` remains `false`
- `canReadCredentialMaterial` remains `false`
- `canReturnCredentialMaterial` remains `false`
- `canLogCredentialMaterial` remains `false`
- `canAutomateBankId` remains `false`
- `canBypassBankId` remains `false`
- `canReadCookies` remains `false`
- `canExportSession` remains `false`
- `canNavigate` remains `false`
- `canClick` remains `false`
- `canFillForm` remains `false`
- `canSubmitLogin` remains `false`
- `canSubmitOrder` remains `false`
- `userMustConfirm` remains `true`
- `finalHumanClickRequired` remains `true`
- `controlsEnabled` remains `false`
- `gateLocked` remains `true`

## Dev QA Visibility

The isolated dev QA route shows fixture/model-only action contract scenarios.
It is not Trade UI integration and does not make the action contract callable
from default app UI.

## Login Dry-Run Executor Follow-Up

Login dry-run executor is now modeled in
`lib/avanza-login-dry-run-executor.ts`.

It verifies that login action plans are internally coherent before any real
action execution. It consumes the login action contract, produces fixture-only
dry-run action reports, and remains non-executing.

The dry-run executor does not navigate, log in, read credentials, fill username
or password fields, click login, read cookies/session, automate BankID, bypass
BankID, submit orders, call API routes, fetch, or write Supabase execution
records.

## Login Mock Page Executor Follow-Up

Mock executor is now modeled in
`docs/avanza-login-mock-page-executor.md` and
`lib/avanza-login-mock-page-executor.ts`.

It can simulate private/company login action sequences from this contract
against mock page state only. It remains mock-only and non-browser. It still
does not access credentials, use Playwright, navigate to Avanza, fill real
forms, click real buttons, submit login, automate or bypass BankID, handle
cookies/session, submit orders, or write Supabase execution records.

## Login Local-Dev Executor Follow-Up

Local-dev executor contract is now modeled in
`docs/avanza-login-local-dev-executor.md` and
`lib/avanza-login-local-dev-executor.ts`.

It consumes this action contract. It can execute through explicitly injected
mock/page dependencies only. It does not resolve credentials yet, does not run
by default, and is not wired into Trade UI. It uses credential references only
and keeps BankID/MFA, cookies/session handling, order behavior, and final
KÖP/SÄLJ clicks forbidden.
