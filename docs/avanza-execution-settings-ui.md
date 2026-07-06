# Avanza execution settings UI

## Current Status

A passive Ture Settings UI scaffold now exists for the Avanza execution
profile.

The panel lets the user model the Avanza account type as `Privat`, `Företag`,
or `Not selected`, and shows credential readiness/reference status only. It
does not store or display raw credentials.

It models credential references only; no credential value is accepted, stored,
displayed, read from Keychain, or passed to login/runtime code.

## Supported Login Method

Username/password is the only supported login method.

BankID remains forbidden for automation and manual-action only. The UI does not
offer a BankID login path, BankID bypass, or BankID automation.

## Credential Boundary

The UI may show:

- customer type
- macOS Keychain as preferred secure provider
- username reference configured yes/no
- password reference configured yes/no
- profile readiness status from `buildAvanzaExecutionSettingsProfile(...)`

The UI must not show raw username values, raw password values, credential
material, credential secrets, cookies, sessions, BankID material, account IDs,
or broker secrets.

## Persistence Boundary

This phase uses local component state only. It does not add localStorage,
Supabase, or API persistence for Avanza execution settings.

It does not add Supabase credential persistence and does not add localStorage
credential persistence.

Future persistence may store only non-secret settings such as customer type,
credential storage kind, and configured booleans. It must never store raw
username or password values.

## Safety Guarantees

- Passive settings UI only.
- No raw username field.
- No raw password field.
- No credential material shown.
- No password storage.
- No Supabase credential storage.
- No localStorage credential storage.
- No Keychain access from UI.
- No smoke test from UI.
- No login from UI.
- No browser automation.
- No API route call.
- No order submission.
- Final KÖP/SÄLJ remains human-only.
- Not production-ready.

## Related Runtime Boundary

The terminal login smoke test remains terminal-only. Settings does not import
or run `scripts/avanza-login-smoke-test.local.ts`.

Settings does not import or run terminal login smoke test code.

The Settings UI does not trigger login, smoke tests, browser actions, bridge
calls, polling, order behavior, final KÖP/SÄLJ clicks, confirmation capture, or
Supabase execution writes.

## Order-Side Model Relationship

Real-world Avanza order flow signals and the BUY/SELL order ticket field
contract now exist as fixture/model-only layers after login readiness.

The order ticket field contract is not activated from Settings.

The order flow signals are based on sanitized user-provided BUY-flow material.
SELL is modeled from the same structure with sell labels. The order ticket
field contract supports limit orders only and models BUY/SELL preparation.

Settings does not activate these models. It does not fill Avanza forms, click,
submit orders, call API routes, or click final KÖP/SÄLJ. Final human
confirmation remains mandatory.

Final human confirmation remains mandatory for order-side work.

This phase does not activate order behavior.

## Instrument Search Model Relationship

Instrument discovery/search now exists as a model before order ticket preparation.

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

Settings does not activate instrument search. It does not execute search,
navigate Avanza, click, submit orders, call API routes, or click final
KÖP/SÄLJ. Final human confirmation remains mandatory.

This phase does not activate order behavior.

## Order Ticket Action Contract Relationship

The Avanza order ticket action contract now exists as a fixture/model-only
layer between order field mapping and future order-fill execution.

It is the bridge between order field mapping and future order-fill execution.

Settings does not activate the action contract. It does not fill Avanza forms,
click, submit orders, call API routes, or click final KÖP/SÄLJ. Final human
confirmation remains mandatory.

This phase does not activate order behavior.
