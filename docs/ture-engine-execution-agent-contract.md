# Ture Engine Execution Agent Contract

Status: `ture_engine_execution_agent_contract_added`

## Roles

The Recommendation Engine decides what should be traded.

The Execution Agent prepares/executes the broker workflow for a valid
Execution Intent.

The Ture App owns state, audit trail, lifecycle, statistics, and learning.

The Execution Agent must not choose trades independently.

## Full Closed-Loop Flow

1. Engine scans and ranks setups.
2. Engine selects candidate for execution.
3. Ture creates Execution Intent.
4. Execution Agent receives intent.
5. Execution Agent opens/focuses Avanza.
6. Execution Agent logs in if needed.
7. Execution Agent fills BUY/SELL limit order.
8. Execution Agent verifies filled form.
9. Execution Agent stops before final KÖP/SÄLJ.
10. User manually confirms in Avanza.
11. Execution Agent/Ture captures result.
12. Ture registers result.
13. BUY opens/updates Live Day Trade.
14. SELL closes/partially closes Live Day Trade.
15. History/statistics/learning update from registered result.

## Execution Intent Schema

The Execution Intent is created by Ture from a Recommendation Engine decision.

Required fields:

- `executionIntentId`
- `recommendationId`
- `createdAt`
- `source: recommendation_engine`
- `action: BUY | SELL`
- `ticker` / `symbol`
- `instrumentName` if available
- `market`
- `quantity`
- `orderType: LIMIT`
- `limitPrice`
- `currency`
- `accountLabel` / `accountContext` if safe
- recommendation confidence
- setup summary
- entry/stop/target/risk package
- `intendedPositionId` if SELL/exit
- time validity / `staleAfter`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`

## Execution Agent Result Schema

The Execution Agent Result reports broker-workflow progress and final captured
outcome back into Ture.

Required fields:

- `executionResultId`
- `executionIntentId`
- `recommendationId`
- `status`
- `broker: Avanza`
- `action: BUY | SELL`
- `ticker` / `symbol`
- `requestedQuantity`
- `filledQuantity`
- `requestedLimitPrice`
- `confirmedPrice` if available
- `orderType`
- `accountLabel` / `accountContext` if safe
- `brokerOrderId` if available
- `brokerConfirmationId` if available
- `brokerTimestamp` if available
- `verifiedFields`
- `mismatches`
- `warnings`
- `errorReason`
- `humanConfirmed: boolean`
- `finalClickByAgent: false`
- `auditTrailId`
- `capturedAt`

Allowed statuses:

- `received`
- `login_required`
- `login_completed`
- `mfa_or_bankid_required`
- `broker_page_opened`
- `instrument_found`
- `form_filled`
- `form_verified`
- `waiting_for_manual_confirmation`
- `user_confirmed`
- `filled`
- `partially_filled`
- `rejected`
- `cancelled`
- `failed`
- `unknown`

`humanConfirmed` records whether the user manually confirmed in Avanza or a
reliable broker/user result was captured. `finalClickByAgent` must always be
false in semi-auto.

## Ture Registration Flow

### BUY

Ture may create/open a Live Day Trade position only after user-confirmed result
or reliable confirmation capture.

Registration must link to `recommendationId` and `executionIntentId`.

Registration stores:

- entry price
- quantity
- timestamp
- broker id if available
- planned stop/target/risk package snapshot

### SELL

Ture must find the existing Live Day Trade position.

Ture registers exit or partial exit.

Registration stores:

- exit price
- quantity
- timestamp
- broker id if available
- realized PnL
- close reason / exit reason

History/statistics/learning update from the registered SELL result.

## Result Quality Levels

- `confirmed_broker_result`
- `user_reported_result`
- `inferred_result`
- `failed_or_unknown_result`

Ture must not register filled trade without human confirmation or reliable
broker/user result.

## Required Audit Trail

- intent created
- handoff started
- login state
- form fill started
- form fill completed
- verification passed/failed
- waiting for manual confirmation
- user confirmed / could not confirm
- result captured / result missing
- Ture registration success/failure

## Safety Rules

- Execution Agent must not choose trades independently.
- Execution Agent must only act on valid Execution Intent.
- Execution Agent must not continue if intent is stale.
- Execution Agent must not continue if ticker/side/quantity/price mismatch.
- Execution Agent must not submit order.
- Execution Agent must not click final KÖP/SÄLJ.

## Isolated Login Smoke Test Wrapper

Isolated login smoke test planning now exists at
`lib/avanza-isolated-login-smoke-test.ts`.

It is the first safe wrapper for future real local-dev login testing. It
remains disconnected from Trade UI, disconnected from API routes, and
disconnected from order flow. It can only model an explicit local-dev,
manual-terminal, env-opt-in smoke-test path. It does not add order submission,
final KÖP/SÄLJ clicks, BankID automation, cookie/session handling, credential
logging, or Supabase writes.
- Execution Agent must not bypass BankID.
- Execution Agent must not store broker credentials in Supabase.
- Ture must not register filled trade without human confirmation or reliable broker/user result.

## Relationship To Previous Disabled Chain

The previous disabled local-only Avanza chain remains locked as the safety
foundation. This contract opens a new explicit user-approved Sharp Semi Auto
phase for planning local browser control, username/password login if logged
out, BUY/SELL limit form fill, result capture, and Ture registration.

This contract does not implement browser control, login, fetch, API route calls,
form fill, confirmation capture, credential/session handling, Supabase writes,
or production readiness.

## Local Browser Runtime Foundation

The first Sharp Semi Auto runtime foundation is now represented by
`lib/avanza-local-browser-agent-runtime.ts`. It models disabled and local-dev
browser-agent readiness states for the Execution Agent contract, including
`runtime_disabled`, `runtime_unavailable`, `runtime_ready_local_dev`,
`runtime_blocked`, `runtime_error`, and `unknown`.

This layer is contract/model only. It may show local-dev readiness flags in
fixtures, but it does not launch or connect to a browser, navigate to Avanza,
perform login, handle credentials, fill BUY/SELL forms, capture confirmation,
call an API route, fetch, submit an order, click final KÖP/SÄLJ, or write
Supabase execution records. Human confirmation remains mandatory and BankID
automation/bypass remains forbidden.

## Login And Credential Readiness Foundation

The Execution Agent contract now has a pure login-state detector model and a
secure credential provider interface:

- `lib/avanza-login-state-detector.ts`
- `lib/avanza-secure-credential-provider.ts`

The login detector can classify explicit read-only signals as logged in, logged
out, login page detected, username/password possible, MFA or BankID required,
manual user action required, blocked, error, or unknown. The secure provider
interface can model local provider readiness without returning credential
material.

No actual login exists yet. No credential material access or return exists yet.
No Keychain access, 1Password CLI call, environment-variable read,
cookie/session handling, Avanza navigation, form fill, order submission, or
Supabase write exists in this layer. Username/password login remains gated to a
future secure provider implementation plus explicit local-dev guard. BankID/MFA
remains manual-user-action only.

## Local Playwright Browser Adapter Contract

The Execution Agent contract now includes a pure local Playwright browser
adapter foundation at `lib/avanza-local-playwright-browser-adapter.ts`, with
fixtures and an isolated harness for dev-only visual QA.

This adapter is model/callable-contract only. Disabled remains the default. The
local-dev mode can model explicit browser launch availability, existing browser
connection availability, modeled browser connection, and sanitized page
snapshot reads, but render-time behavior remains inert.

The adapter does not navigate to Avanza, log in, handle credentials, read
cookies, export sessions, fill forms, click, submit orders, click final
KÖP/SÄLJ, automate or bypass BankID, call API routes, fetch, or write Supabase
execution records. Human confirmation remains mandatory, controls remain
disabled, and the pre-activation gate remains locked.

## Avanza Page State Detection Contract

The Execution Agent contract now includes a pure Avanza page/state detector at
`lib/avanza-page-state-detector.ts`, with fixtures and an isolated harness for
dev-only visual QA.

The detector accepts explicit page snapshots and observed signals only. It can
model whether a snapshot appears to be a non-Avanza page, Avanza public page,
login page, logged-in home, account overview, instrument page, order ticket,
order review, order confirmation, BankID/MFA state, error page, blocked state,
or unknown state.

This detector is read-only. It does not navigate, log in, handle credentials,
read cookies, export sessions, fill forms, click, submit orders, click final
KÖP/SÄLJ, bypass BankID, call API routes, fetch, or write Supabase execution
records. BankID/MFA states require manual action.

## Sanitized Snapshot Intake Contract

The Execution Agent contract now includes sanitized real-world Avanza snapshot
intake at `lib/avanza-sanitized-page-snapshot.ts`.

This layer accepts explicit manual screenshot notes, manual DOM notes, local-dev
snapshot notes, and fixtures only after sensitive material has been masked or
redacted. The capture guide is
`docs/avanza-real-world-snapshot-capture-guide.md`.

The intake layer is for selector and page-state planning only. It does not
navigate, log in, handle credentials, read cookies, export sessions, fill forms,
click, submit orders, click final KÖP/SÄLJ, bypass BankID, call API routes,
fetch, or write Supabase execution records. Sensitive material is forbidden in
fixtures and docs.

## Avanza Real-World Login Flow Signals

The contract now includes sanitized login-flow signal modeling in
`lib/avanza-real-world-login-signals.ts`. Fixtures and the isolated dev QA
harness show the signal pack without connecting it to Trade UI or browser
runtime behavior.

The modeled signals cover:

- initial login choice page
- `Privat` and `Företag`
- `Användarnamn och lösenord`
- private `Privatkund` username/password form
- company username/password form
- `Logga in`
- `Avbryt`
- `Logga in på företagswebben`
- BankID options `Visa QR-kod` and `Öppna BankID på samma enhet`

The model is sanitized and read-only. It contains no credential values,
personnummer, account numbers, cookies/session data, or BankID QR material. It
does not log in, access a credential provider, fill forms, click, navigate,
submit orders, capture confirmations, or write Supabase execution records.

## Ture Avanza Execution Settings Profile

The contract now includes a pure execution settings profile for Avanza at
`lib/avanza-execution-settings-profile.ts`. The profile models user-selected
customer type (`private`/`company`), username/password login method, secure
credential provider selection, and readiness for local-dev planning.

The profile stores readiness/configuration only, not raw secret material. It
does not contain an actual username value, password value, credential payload,
cookie, session, or BankID material. BankID remains forbidden for automation.

This profile does not implement settings UI, persistence, actual credential
access, Keychain access, 1Password CLI invocation, environment-variable reads,
login, form fill, navigation, order behavior, or Supabase writes.

## Avanza Login Route Planner Contract

The Execution Agent contract now includes the pure Avanza login route planner at
`lib/avanza-login-route-planner.ts`.

The planner consumes explicit model inputs only: Ture execution settings
profile, login state, page state, real-world login signals, and credential
provider readiness metadata. It can model disabled, already-logged-in, private
username/password, company username/password, username/password choice,
company-toggle, credentials-required, BankID/MFA manual-action, blocked, error,
and unknown states.

Private and company routes are distinct. BankID options are manual-action only.
Action steps are planned but not executable yet. The planner does not navigate,
log in, access credentials, fill forms, click, handle cookies/session, submit
orders, click final KÖP/SÄLJ, call API routes, fetch, or write Supabase
execution records.

## Avanza Login Action Contract

The Execution Agent contract now includes the pure Avanza login action contract
at `lib/avanza-login-action-contract.ts`.

Login action contract is now modeled. It is the bridge between route planning
and future browser actions.

Actions are currently contract-only and non-executable. No credential material
appears in action output. The contract may describe future local-dev actions for
`Användarnamn och lösenord`, `Företag`, username fill, password fill, and login
submit, but it does not perform navigation, login, credential access, form fill,
clicks, cookies/session handling, order behavior, final KÖP/SÄLJ click, API
route calls, fetch, or Supabase writes.

## Avanza Login Dry-Run Executor

The Execution Agent contract now includes the pure Avanza login dry-run
executor at `lib/avanza-login-dry-run-executor.ts`.

Login dry-run executor is now modeled. It verifies that login action plans are
internally coherent before any real action execution. It consumes the login
action contract and produces dry-run action reports with
`executableNow: false` and `containsCredentialMaterial: false`.

The dry-run executor remains non-executing. It does not navigate, log in, read
credentials, return credential material, fill username/password fields, click,
read cookies/session, call API routes, fetch, submit orders, automate or bypass
BankID, or write Supabase execution records.

## Avanza Login Mock Page Executor

The Execution Agent contract now includes the pure Avanza login mock page
executor at `lib/avanza-login-mock-page-executor.ts`.

Mock executor is now modeled. It can simulate private/company login action
sequences against an in-memory mock page model. It remains mock-only and
non-browser. It still does not access credentials.

The mock executor does not use Playwright, navigate to Avanza, perform actual
login, read or return credential material, fill real forms, click real buttons,
submit login, handle cookies/session, submit orders, automate or bypass BankID,
or write Supabase execution records.

## Avanza Login Local-Dev Executor

The Execution Agent contract now includes the Avanza login local-dev executor
contract at `lib/avanza-login-local-dev-executor.ts`.

Local-dev executor contract is now modeled. It can execute through explicitly
injected mock/page dependencies only. It does not resolve credentials yet, does
not run by default, and is not wired into Trade UI.

This layer uses credential references only. It does not handle cookies/session,
automate or bypass BankID, submit orders, click final KÖP/SÄLJ, or write
Supabase execution records.

## macOS Keychain credential provider contract

The macOS Keychain provider contract now exists at
`lib/avanza-macos-keychain-credential-provider.ts`.

It provides credential references for local-dev login work through explicit
input and injected dependencies only. It does not expose raw credential material.
It does not use Supabase or localStorage for credentials, does not fall back to
environment variables by default, and is not wired into Trade UI yet. The
contract remains local/dev-only, non-production-ready, and requires final human
confirmation for any future Avanza flow.

It is not wired into Trade UI yet.

## Avanza login credential resolution bridge

Credential resolution bridge now exists at
`lib/avanza-login-credential-resolution-bridge.ts`.

It prepares safe local-dev login execution by resolving credential references
through injected dependencies only. It does not expose credential material. It
is not wired into Trade UI yet. No settings persistence, Supabase credential
storage, localStorage credential storage, environment fallback, BankID
automation, or order behavior is added.

## Avanza local-dev credential executor

Local-dev credential executor now exists at
`lib/avanza-login-local-dev-credential-executor.ts`.

It can use a private runtime credential bundle with injected dependencies. It is
still not wired into Trade UI. It does not include order behavior.

## Avanza local Playwright page action binding

Playwright page action binding now exists at
`lib/avanza-local-playwright-page-action-binding.ts`.

It can supply injected dependencies to the local-dev credential executor. It is
still not wired to Trade UI or any active API route. It does not include order
behavior.

## Avanza Isolated Login Smoke Test Runner

Hard-gated smoke test runner now exists at
`lib/avanza-isolated-login-smoke-test-runner.ts`.

It is the first explicit local terminal entrypoint model. It remains
disconnected from Trade UI, disconnected from API routes, and disconnected from
order flow. It may call injected local-dev login dependencies only after
non-CI, explicit env opt-in, and manual terminal gates pass.

## Avanza Terminal Login Smoke Script Scaffold

The terminal-only script scaffold now exists at
`scripts/avanza-login-smoke-test.local.ts`.

It remains disconnected from Trade UI, disconnected from API routes, and
disconnected from order flow. It is default-safe and hard-gated, blocks CI,
requires explicit env opt-in, requires manual local confirmation, and requires
a separate real-run flag before explicit real-run mode can be modeled.

## Passive Ture Settings UI Scaffold

The contract now has a passive Ture Settings UI scaffold for the Avanza
execution profile.

The scaffold models account type and credential readiness only. It supports
`Privat`, `Företag`, and `Not selected`, keeps username/password as the only
supported login method, keeps BankID forbidden/manual-action only, and shows
macOS Keychain as the preferred provider.

It uses local component state only and does not store or display raw
credentials. It does not execute login, smoke tests, browser actions, API
calls, orders, or final KÖP/SÄLJ.

## Avanza Order Flow Signals and Ticket Field Contract

The contract now includes sanitized Avanza BUY/SELL order flow signals and a
pure order ticket field contract.

The signal pack is based on sanitized user-provided BUY-flow material. SELL is
modeled from the same structure with sell labels. The field contract supports
limit orders only and models BUY/SELL preparation without filling fields in
this task.

This does not activate order behavior. No Trade UI wiring, API route wiring,
real form fill, click behavior, order submission, confirmation capture, or
final KÖP/SÄLJ click is added. Final human confirmation remains mandatory.

## Settlement Note / Order Information Signals

Settlement note signals now exist as the post-trade reconciliation foundation.
Exact courtage, FX/exchange rate, settlement amount, and realized execution
cost are future extraction targets from Avanza avräkningsnota after user
execution. This does not activate post-trade navigation, PDF/download/read,
OCR, value extraction, reconciliation writes, Trade UI wiring, API route
wiring, cookie/session handling, or BankID automation.

Settlement route/action contracts now exist. They prepare future note
retrieval/extraction by modeling the route from trade reference to matching
transaction and Avräkningsnota. They do not activate reconciliation or writes.

## Avanza Instrument To Order Dry-Run Executor

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

The executor validates modeled instrument verification and order ticket
readiness as fixture/model-only reports. It still does not activate execution.
Final human confirmation remains mandatory.

## Avanza Instrument To Order Mock Executor

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

The mock executor simulates search, instrument verification, order ticket
preparation, and review-ready state with simulated page state only. This still
does not activate real Avanza execution. Final human confirmation remains
mandatory.

## Avanza Instrument To Order Handoff Chain

The Execution Agent contract now includes a pure Avanza instrument search to order ticket handoff chain.

The pre-submit order chain is now modeled end-to-end: execution package -> instrument search -> verification -> order ticket field/action path -> stop before final KÖP/SÄLJ. This still does not activate execution. Final human confirmation remains mandatory.

## Avanza Instrument Search Route And Action Contracts

The execution-agent contract now includes sanitized instrument search signals,
an instrument search route contract, and an instrument search action contract.

Instrument discovery/search now exists as a model before order ticket preparation.

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

This does not activate order behavior. No real search execution, Avanza
navigation, click behavior, BUY/SELL entry click, order submission,
confirmation capture, Trade UI wiring, API route wiring, or Supabase execution
write is added. Final human confirmation remains mandatory.

This phase does not activate order behavior.

## Settlement Extraction Schema And Reconciliation Mapping

Settlement extraction schema and reconciliation mapping now exist. Exact
cost/FX reconciliation is modeled but not applied.

The schema models avräkningsnota targets for courtage, FX/växelkurs,
settlement amount, trade date, settlement date, quantity, price, and currency.
The mapping previews future execution, trade result, statistics/PnL, and audit
metadata targets.

This still does not activate document reading, OCR, value extraction,
reconciliation writes, Supabase writes, Trade UI wiring, or API route wiring.

## Settlement Reconciliation Dry-Run Executor

Settlement reconciliation now has a dry-run validation layer. It validates the
post-trade route/action/schema/mapping path as fixture/model-only, requires
manual review, and stops before any write.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor

Settlement reconciliation now has a mock execution layer after dry-run. It
simulates the post-trade settlement path with simulated page state only and
keeps all real navigation, document reading, OCR, value extraction, and write
capabilities disabled.

BUY and SELL fixture paths can reach manual review after simulated transaction
matching, Avräkningsnota availability, masked/synthetic courtage,
masked/synthetic FX/växelkurs, masked/synthetic settlement amount, and a
simulated reconciliation preview.

Exact cost/FX reconciliation remains modeled/mock-only. No reconciliation
writes, Supabase writes, Trade UI wiring, or API route wiring is active.

## Avanza Order Ticket Action Contract

The execution-agent contract now includes a pure Avanza order ticket action
contract.

The order ticket action contract is fixture/model-only.

It is the bridge between order field mapping and future order-fill execution.
It models BUY and SELL limit-order preparation actions, but those actions are
not executable yet.

This does not activate order behavior. No Trade UI wiring, API route wiring,
real form fill, click behavior, order submission, confirmation capture, or
final KÖP/SÄLJ click is added. Final human confirmation remains mandatory.
## Sharp Semi Auto Execution Architecture Checkpoint

The Sharp Semi Auto Execution readiness checkpoint is recorded in `docs/avanza-sharp-semi-auto-execution-architecture-checkpoint.md` and summarized by `docs/avanza-execution-readiness-map.md`.

The map confirms the current state as fixture/model-only and not production ready. Login, instrument/order, and settlement stacks are summarized for readiness, but real local-dev binding, passive Trade UI integration, and any future active API route review remain separate gated phases with no execution, no form fill, no final KOP/SALJ click, no document read/OCR/extraction, and no Supabase write.

The local-dev order/search page action binding now exists in `lib/avanza-local-playwright-order-page-action-binding.ts`. It can supply injected Playwright-like dependencies to a future local-dev order chain executor, but it is still not wired to Trade UI/API and does not include order submission or final KOP/SALJ click.

The local-dev order chain executor now exists in `lib/avanza-instrument-to-order-local-dev-executor.ts`. It uses injected order/search page action dependencies to model search execution, instrument verification, order field preparation, and review-ready state. It is not wired to Trade UI/API and still cannot submit orders or click final KOP/SALJ. Final human action remains required.

The Avanza order chain smoke test runner now exists in
`lib/avanza-order-chain-smoke-test-runner.ts`. It is the order-side counterpart
to the login smoke runner and remains local-dev, terminal-gated, and injected
dependency only. It is disconnected from Trade UI/API and order submission,
cannot click final KOP/SALJ, and keeps final human action required.
## Local-Dev Execution Runbook

The Avanza local-dev execution runbook now exists as a model-only operator
sequence for login plus order-prep smoke tests. It does not change the
Engine/Agent contract into a production execution contract. Trade UI wiring,
API route wiring, app-runtime navigation, cookies/session handling, BankID
automation, final KOP/SALJ, order submission, Supabase writes, and production
readiness remain out of scope.

The terminal-only Avanza order smoke script scaffold now exists for local-dev
inspection of the order chain smoke runner. It is hard-gated and does not grant
the Engine/Agent contract permission to submit orders, click final KOP/SALJ,
wire Trade UI/API, handle cookies/session, automate BankID, or claim production
readiness.

## Local Smoke Result Capture

The local smoke checklist/result capture model is documented in `docs/avanza-local-smoke-test-result-capture.md`. It records safe outcomes without storing sensitive data and does not change the Engine/Agent contract: no smoke tests are activated, no results are persisted, no Trade UI/API wiring is added, no app-runtime navigation is added, no cookies/session handling is added, BankID remains manual-action only, no order submission or final KOP/SALJ click is allowed, no Supabase write is added, and production readiness is still not claimed.

## Passive Execution Readiness Preview

The passive execution readiness preview is documented in `docs/avanza-passive-execution-readiness-preview.md`. It does not change the Engine/Agent contract into an execution contract: no active handoff, prepare action, buy/sell CTA, API call, fetch/polling, browser automation, smoke test from UI, credential access, cookies/session handling, BankID automation, order submission, final KOP/SALJ click, Supabase write, or production readiness is added.

## Settings Passive Execution Readiness Panel

`docs/avanza-settings-passive-execution-readiness-panel.md` now documents the passive readiness panel in app Settings. It does not change the Engine/Agent contract: no active handoff, prepare action, buy/sell CTA, API call, fetch/polling, browser automation, smoke test from UI, credential access, cookies/session handling, BankID automation, order submission, final KOP/SALJ click, Supabase write, or production readiness is added.
## Passive Trade Readiness Metadata Boundary

The Engine/Agent contract may expose passive recommendation/live-position readiness metadata for future read-only card visibility. The metadata is not an execution contract, does not activate execution, does not activate handoff or prepare actions, and keeps final KÖP/SÄLJ human-only.

The Trade card execution readiness adapter may convert this metadata into read-only labels and badges for future passive card visibility. It does not activate execution.
