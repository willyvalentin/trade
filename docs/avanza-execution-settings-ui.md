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

## Instrument To Order Handoff Chain

The pre-submit order chain is now modeled end-to-end in `lib/avanza-instrument-to-order-handoff-chain.ts`.

This still does not activate execution.

Settings does not activate the chain. It does not execute search, navigate Avanza, fill forms, click BUY/SELL entry, click final KÖP/SÄLJ, submit orders, call API routes, or write execution records. Final human confirmation remains mandatory.

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

## Instrument To Order Dry-Run Executor Boundary

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

Settings does not activate the dry-run executor. The dry-run layer remains
fixture/model-only and still does not activate execution. Final human
confirmation remains mandatory.

## Instrument To Order Mock Executor Boundary

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

Settings does not activate the mock executor. The mock layer remains
fixture/model-only and simulated-page-state only. This still does not activate
real Avanza execution. Final human confirmation remains mandatory.

## Settlement Note / Order Information Boundary

Settlement note signals now exist as the post-trade reconciliation foundation.
Exact courtage, FX/exchange rate, settlement amount, and realized execution
cost are future extraction targets from Avanza avräkningsnota after manual
execution. Settings does not activate post-trade navigation, PDF/download/read,
OCR, value extraction, trade reconciliation writes, Trade UI execution wiring,
API route wiring, cookie/session handling, BankID automation, or Supabase
writes.

Settlement route/action contracts now exist. They prepare future note
retrieval/extraction by modeling the route from trade reference to matching
transaction and Avräkningsnota. Settings does not activate reconciliation or
writes.

## Settlement Extraction Schema And Reconciliation Mapping

Settlement extraction schema and reconciliation mapping now exist. Exact
cost/FX reconciliation is modeled but not applied.

The schema models future avräkningsnota targets for courtage, FX/växelkurs,
settlement amount, trade date, settlement date, quantity, price, and currency.
The mapping previews future execution, trade result, statistics/PnL, and audit
metadata targets.

This still does not activate document reading, OCR, value extraction,
reconciliation writes, Supabase writes, Trade UI wiring, or API route wiring.

## Settlement Reconciliation Dry-Run Follow-Up

Settlement reconciliation now has a dry-run validation layer. It is
fixture/model-only and independent of Ture Settings controls. Manual review is
required, controls remain disabled, and the gate remains locked.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor Boundary

Settlement reconciliation now has a mock execution layer after dry-run. It is
fixture/model-only and independent of Ture Settings controls.

The mock layer simulates transaction matching, Avräkningsnota availability,
masked/synthetic courtage, masked/synthetic FX/växelkurs, masked/synthetic
settlement amount, reconciliation preview, and manual review. Settings still
does not activate real navigation, document reading, PDF/download/read, OCR,
real value extraction, reconciliation writes, Supabase writes, Trade UI
wiring, or API route wiring. Exact cost/FX reconciliation remains
modeled/mock-only.
## Sharp Semi Auto Execution Architecture Checkpoint

The execution settings UI is now included in the fixture/model-only architecture readiness map documented in `docs/avanza-execution-readiness-map.md` and `docs/avanza-sharp-semi-auto-execution-architecture-checkpoint.md`.

Settings remain passive and model-only, and the architecture is not production ready while real local-dev binding remains a separate future gate. The checkpoint adds no execution settings activation, no credential exposure, no real Avanza navigation, no form fill, no final KOP/SALJ click, no order submission, no Trade UI execution wiring, no API route execution wiring, and no production readiness claim.
## Local-Dev Execution Runbook

The Avanza local-dev execution runbook now exists and references Avanza Settings
profile/readiness as a prerequisite. The Settings UI remains a safe scaffold and
does not execute login smoke, order-prep smoke, Trade UI wiring, API route
wiring, app-runtime navigation, cookies/session export, BankID automation, final
KOP/SALJ, order submission, Supabase writes, or production readiness.

## Passive Execution Readiness Preview

`docs/avanza-passive-execution-readiness-preview.md` now documents a passive
readiness preview that can display Ture Settings profile readiness alongside
login, order-prep, and settlement readiness. It provides visibility before
active integration and does not activate Settings controls, handoff, prepare
actions, browser automation, API calls, fetch/polling, smoke tests from UI,
credential access, cookies/session handling, BankID automation, order
submission, final KOP/SALJ, Supabase writes, or production readiness.

## Settings Passive Execution Readiness Panel

`docs/avanza-settings-passive-execution-readiness-panel.md` now documents the passive readiness panel rendered in app Settings next to the Avanza execution profile. It remains non-executing and separate from Trade UI order flow: no active handoff, prepare action, buy/sell CTA, API call, fetch/polling, browser automation, smoke test from UI, credential access, cookies/session handling, BankID automation, order submission, final KOP/SALJ click, Supabase write, or production readiness claim is added.
