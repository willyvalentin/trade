# Avanza Execution Settings Profile

Status: `avanza_execution_settings_profile_model_added`

## Purpose

The Ture Avanza execution settings profile models the user's broker execution
settings for the Sharp Semi Auto Execution Agent. It is a pure model/helper
layer only.

## Modeled Settings

The model supports:

- User chooses Privat/Företag in Ture Settings.
- user chooses `Privat` or `Företag` in Ture Settings
- user configures that Avanza username/password login is intended
- user selects a secure credential provider kind
- readiness is modeled without storing or returning secret material

The exported helper is `buildAvanzaExecutionSettingsProfile(...)` in
`lib/avanza-execution-settings-profile.ts`.

## Login Boundary

Username/password login is the only supported automated login path in this
model. BankID is forbidden for automation because it requires human
interaction.

The model may report that username and password references are configured, but
it never contains the actual username value, never contains password material,
and never returns credential material.

## Credential Storage Boundary

Credential storage must be a secure local provider first. The preferred provider is macOS Keychain.

Forbidden storage and access:

- password must not be stored in Supabase
- password must not be stored in localStorage
- credential material must not be logged
- credential material must not be returned by this model
- environment variables are modeled as dev-only and blocked

## Not Implemented

This task does not implement:

- real settings UI
- No settings UI implemented
- settings persistence
- actual credential provider access
- Keychain access
- 1Password CLI call
- environment variable read
- credential material return
- cookie/session handling
- actual login
- Avanza login form fill
- BUY/SELL order fill
- final KÖP/SÄLJ click
- confirmation capture
- Supabase execution writes

## Safety Guarantees

- `credentialMaterialPresent` remains `false`
- `credentialMaterialReturned` remains `false`
- `canReadCredentialMaterial` remains `false`
- `canReturnCredentialMaterial` remains `false`
- `canLogCredentialMaterial` remains `false`
- `canStoreCredentialMaterialInSupabase` remains `false`
- `canStoreCredentialMaterialInLocalStorage` remains `false`
- `canAutomateBankId` remains `false`
- `canBypassBankId` remains `false`
- `canSubmitLogin` remains `false`
- `canFillLoginForm` remains `false`
- `canSubmitOrder` remains `false`
- `userMustConfirm` remains `true`
- `finalHumanClickRequired` remains `true`
- `controlsEnabled` remains `false`
- `gateLocked` remains `true`

## Dev QA Visibility

The fixture/model-only harness is
`components/execution/AvanzaExecutionSettingsProfileHarness.tsx`. The isolated
dev-only visual QA route renders it with static fixtures so ready, incomplete,
blocked, and error states can be inspected without adding Trade UI wiring.

## Login Route Planner Relationship

Login route planning is now modeled in `docs/avanza-login-route-planner.md` and
`lib/avanza-login-route-planner.ts`. The execution settings profile supplies the
user-selected `Privat`/`Företag` customer type and username/password readiness
metadata for that planner.

Private and company routes are distinct. BankID options are manual-action only.
Action steps are planned but not executable yet.

## Login Action Contract Relationship

Login action contract is now modeled in
`docs/avanza-login-action-contract.md` and
`lib/avanza-login-action-contract.ts`. It is the bridge between route planning
and future browser actions.

Actions are currently contract-only and non-executable. No credential material
appears in action output.

## Login Dry-Run Executor Relationship

Login dry-run executor is now modeled in
`docs/avanza-login-dry-run-executor.md` and
`lib/avanza-login-dry-run-executor.ts`.

It verifies that login action plans are internally coherent before any real
action execution. It consumes settings/profile metadata only as explicit input
and remains non-executing. It does not navigate, log in, read credentials, fill
username/password fields, click, read cookies/session, call API routes, fetch,
submit orders, automate or bypass BankID, or write Supabase execution records.

## macOS Keychain provider contract

The macOS Keychain provider contract now exists in
`lib/avanza-macos-keychain-credential-provider.ts`.

It provides credential references for local-dev login work through explicit
input and injected dependencies only. It does not expose raw credential material.
It does not run Keychain commands during render or tests, and it is not wired
into Trade UI yet. The related fixtures and isolated harness are
fixture/mock only and preserve the same Settings boundary: no Supabase
credential storage, no localStorage credential storage, no environment
fallback by default, no BankID automation, and no order submission.

## Credential resolution bridge relationship

Credential resolution bridge now exists at
`lib/avanza-login-credential-resolution-bridge.ts`.

It prepares safe local-dev login execution from configured secure credential
references. It does not expose credential material. It is not wired into Trade
UI yet. Settings UI, settings persistence, Supabase credential storage,
localStorage credential storage, and environment fallback remain unimplemented.

## Passive Ture Settings UI Scaffold

A passive Ture Settings UI scaffold now exists in
`components/execution/AvanzaExecutionSettingsProfilePanel.tsx` and is rendered
from Settings.

The scaffold models account type and credential readiness only. It supports
`Privat`, `Företag`, and `Not selected`, uses username/password as the only
supported login method, keeps BankID forbidden/manual-action only, and models
macOS Keychain as the preferred provider.

The Settings panel uses local component state only. It does not display raw
username values, raw password values, credential material, cookies, session
metadata, account IDs, or broker secrets. It does not persist credentials in
Supabase or localStorage.

It does not execute login, smoke tests, browser actions, API calls, orders, or
final KÖP/SÄLJ. The fixture/model-only visibility layer is documented in
`docs/avanza-execution-settings-ui.md`.
