# Avanza Sharp Semi Auto Execution Agent Scope

Status: `avanza_sharp_semi_auto_execution_agent_scope_added`

## New Target

The new target is the Sharp Semi Auto Execution Agent.

This phase is local-only first, personal-use first, and a high-quality direct
path rather than a throwaway MVP.

The target flow is browser-controlled Avanza preparation with strict human
final confirmation. The Execution Agent may prepare and fill an order form after
validation, but the user must manually perform the final KÖP/SÄLJ confirmation
inside Avanza.

Automatic login with username/password is allowed only if the Avanza account is
already logged out. If the account is already logged in, login must be skipped.

The scope allows:

- browser-controlled Avanza flow
- automatic username/password login only if logged out
- BUY limit order support
- SELL limit order support
- form-fill after validation
- post-fill verification
- confirmation capture after user-confirmed order
- audit trail
- Ture lifecycle update only after confirmed/manual result

The scope forbids:

- No BankID automation
- No BankID bypass
- credential/session/cookie scraping
- final KÖP click by agent
- final SÄLJ click by agent
- automatic order submission
- production readiness claim

Final human confirmation remains mandatory.

## Runtime Architecture

The sharp semi-auto runtime is composed of:

- local browser agent
- Ture handoff package
- Avanza browser session
- broker adapter
- verifier
- audit logger
- confirmation capture

The Recommendation Engine chooses the trade. The Execution Agent
executes/prepares the broker workflow for that recommendation. Ture registers
the execution result, links it back to the recommendation, owns lifecycle state,
and updates audit/statistics/learning after a confirmed/manual result.

## Login Architecture

The login layer must detect logged-in state first.

If already logged in, the Execution Agent must skip login.

If logged out, the Execution Agent may fill username/password from a secure local source.
Credentials must not be hardcoded. The preferred source is macOS Keychain or
an equivalent local secret provider.

This login layer must use a secure local credential provider interface.

If BankID or MFA appears, the agent must stop and request manual user action.

Login boundaries:

- no BankID automation
- no BankID bypass
- no cookie/session extraction
- no credential persistence in the Ture database
- no Supabase storage of broker credentials
- no credential logging

## Order Architecture

Initial order support is BUY limit and SELL limit.

Before form fill, the agent must validate:

- ticker
- side
- quantity
- limit price
- account/context
- staleAfter/time validity
- risk package where required

The agent may fill only expected fields. It must never click final
confirmation. It must stop at the review/final confirmation state and require
the user manual final click.

## Verification Architecture

Post-fill verification is required before the user is asked to confirm.

The verifier must check:

- page/instrument
- side
- quantity
- limit price
- account
- estimated order summary if available

The agent must block on mismatch, unknown UI state, stale recommendation, and
missing risk data.

The verifier must block on mismatch.

## Supported Initial Sharp Scope

- Avanza web only
- local dev first
- manually logged-in session or username/password login only
- BUY limit
- SELL limit
- no market orders initially
- no stop-loss orders initially unless explicitly planned later
- no options, certificates, or leverage products initially unless explicitly planned later
- no final submit

## Forbidden Behavior

- no final KÖP click
- no final SÄLJ click
- no BankID bypass
- no credential logging
- no cookie/session export
- no Supabase broker credential storage
- no automatic order submission
- no silent action
- no action without preview
- no action without post-fill verification
- no production readiness claim

## Fast Implementation Path

A. Browser agent runtime adapter

B. Avanza login state detector

C. Secure local credential provider interface

D. Avanza page/state detector

E. BUY limit form mapping

F. SELL limit form mapping

G. Form fill dry-run

H. Real local form fill, no submit

I. Post-fill verification

J. Manual confirmation checkpoint

K. Confirmation capture

L. Ture execution record/lifecycle update

## Safety Invariants

- `userMustConfirm` true
- `finalHumanClickRequired` true
- `canClickFinalBuy` false
- `canClickFinalSell` false
- `canBypassBankId` false
- `canStoreBrokerCredentialsInDb` false
- `canSubmitOrder` false in semi-auto

## Passive Trade Card Readiness Badge

Trade UI now has a default-off, feature-flagged read-only badge path for
passive recommendation/live-position execution readiness:
`ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false`.

With the default flag value, no badge renders in Trade UI. If explicitly enabled
in code/dev, the badge can show recommendation BUY and live-position SELL/exit
readiness metadata only. It does not start handoff, prepare orders, add a
buy/sell CTA, call APIs, fetch, poll, run UI smoke tests, control a browser,
access credentials, handle cookies/session, automate BankID, submit orders,
click final KÖP/SÄLJ, write Supabase, or claim production readiness.

The dev-only Avanza visual QA route also includes a fixture/model-only visual
preview for this badge enabled state. It is for UI review before any separate
feature-flag decision and keeps the default Trade UI unchanged. It adds no
active handoff, no prepare action, no buy/sell CTA, no API route call, no
fetch/polling, no browser automation, no smoke test from UI, no credential
access, no cookies/session handling, no BankID automation, no order submission,
no final KÖP/SÄLJ click, and no Supabase write.

## Headless Execution Data Contract

The next Sharp Semi Auto direction keeps Ture UI visually simple while
describing Execution Agent needs under the surface. The headless execution data
contract is documented in `docs/avanza-headless-execution-data-contract.md`.

It is agent-readable and UI-hidden. It can describe source identity, entry BUY
or exit SELL intent, ticker/instrument identity, quantity, limit price,
stop/target context, risk context, human confirmation requirements, forbidden
actions, audit metadata, and settlement expectations for later avräkningsnota
reconciliation.

The contract is not visible on cards, not a handoff, not a prepare action, not
a buy/sell CTA, cannot call APIs, cannot fetch or poll, cannot control a
browser, cannot access credentials, cannot handle cookies/session, cannot
automate BankID, cannot submit orders, cannot click final KÖP/SÄLJ, and cannot
write Supabase.

`docs/avanza-headless-execution-contract-selector.md` adds the selector for
these hidden contracts. It keeps selection agent-readable and UI-hidden, with
exits outranking entries, stop-loss exits outranking target exits, and target
exits outranking entries. It does not start handoff, prepare orders, call APIs,
control a browser, submit orders, or click final KÖP/SÄLJ.

In selector terms, exits outrank entries, stop-loss exits outrank target exits,
and target exits outrank entries.

## Isolated Login Smoke Test Wrapper

Isolated login smoke test planning now exists at
`lib/avanza-isolated-login-smoke-test.ts`.

It is the first safe wrapper for future real local-dev login testing. It
remains disconnected from Trade UI, disconnected from API routes, and
disconnected from order flow. It never runs in CI, requires explicit env opt-in
and manual terminal confirmation, and keeps raw credentials out of fixtures,
docs, reports, logs, and UI.
- `canFillOrderForm` true only after validation
- `canProceedOnMismatch` false
- `canProceedOnUnknownState` false

## Relationship To Previous Disabled Chain

The previous disabled local-only chain remains locked as the safety foundation.
It stays internally modeled, fixture-visible, hard-disabled/default-off in
Trade UI, inactive at runtime, and not production-ready.

This new explicit user-approved Sharp Semi Auto phase allows planning for local
browser control, username/password login if logged out, BUY/SELL limit form
fill, result capture, and Ture registration. It does not implement those
behaviors yet.

Final KÖP/SÄLJ confirmation clicks, BankID automation/bypass, credential
logging, cookie/session extraction, Supabase broker credential storage, and
production readiness claims remain forbidden.

## Local Browser Agent Runtime Adapter Foundation

The first active-direction runtime layer now exists as a pure, fixture-visible
foundation:

- `lib/avanza-local-browser-agent-runtime.ts`
- `lib/avanza-local-browser-agent-runtime-fixtures.ts`
- `components/execution/AvanzaLocalBrowserAgentRuntimeHarness.tsx`

This layer models local browser runtime readiness for the Sharp Semi Auto
Execution Agent. It is still non-executing in this task. It does not import or
launch Playwright, does not connect to a browser, does not navigate to Avanza,
does not log in, does not handle credentials, does not fill forms, does not call
API routes, does not fetch, does not submit orders, and does not click final
KÖP/SÄLJ.

The dev-only Avanza visual QA route renders this runtime layer as
fixture/model-only visibility. Default Trade UI remains default-safe and
unwired.

## Login State And Credential Provider Foundation

The next Sharp Semi Auto layer now exists as pure models and fixture-only
visibility:

- `lib/avanza-login-state-detector.ts`
- `lib/avanza-login-state-detector-fixtures.ts`
- `lib/avanza-secure-credential-provider.ts`
- `lib/avanza-secure-credential-provider-fixtures.ts`
- `components/execution/AvanzaLoginAndCredentialReadinessHarness.tsx`

Login state detection is now modeled from explicit read-only observed signals.
The secure credential provider interface is now modeled for local providers
such as macOS Keychain, 1Password CLI, and manual prompt, but no actual
credential access exists yet.

This layer does not log in, does not access Keychain, does not call 1Password
CLI, does not read environment variables, does not return credential material,
does not read cookies or export sessions, does not navigate to Avanza, does not
fill forms, and does not submit orders.

Username/password login remains allowed only after a secure provider
implementation and explicit local-dev guard. BankID/MFA remains
manual-user-action only, and BankID automation/bypass remains forbidden.

## Local Playwright Browser Adapter Foundation

The local Playwright browser adapter foundation now exists as a pure model and
callable contract:

- `lib/avanza-local-playwright-browser-adapter.ts`
- `lib/avanza-local-playwright-browser-adapter-fixtures.ts`
- `components/execution/AvanzaLocalPlaywrightBrowserAdapterHarness.tsx`

The dev-only Avanza visual QA route renders the adapter fixtures as
fixture/model-only visibility. The adapter does not import Playwright at module
load, does not launch a browser during render, does not navigate to Avanza, does
not log in, does not handle credentials, does not read cookies or export
sessions, does not fill forms, does not click, does not submit orders, does not
automate or bypass BankID, and does not write Supabase execution records.

Explicit local-dev launch, connect, and page-snapshot callbacks are modeled as
callable-contract methods only. Final human confirmation remains required, the
gate remains locked, controls remain disabled, and the layer is not production
ready.

## Avanza Page State Detector Foundation

The Avanza page/state detector now exists as a pure snapshot/signal classifier:

- `lib/avanza-page-state-detector.ts`
- `lib/avanza-page-state-detector-fixtures.ts`
- `components/execution/AvanzaPageStateDetectorHarness.tsx`

The detector classifies explicit page snapshot inputs and observed signals into
known Avanza states such as public page, login page, logged-in home, account
overview, instrument page, order ticket, order review, order confirmation,
BankID/MFA, error, blocked, or unknown.

This layer does not navigate, log in, handle credentials, read cookies, export
sessions, fill forms, click, submit orders, automate or bypass BankID, or write
Supabase execution records. BankID/MFA remains manual-action only.

## Sanitized Real-World Snapshot Intake

Real-world Avanza signal intake is now supported in sanitized form:

- `lib/avanza-sanitized-page-snapshot.ts`
- `lib/avanza-sanitized-page-snapshot-fixtures.ts`
- `components/execution/AvanzaSanitizedPageSnapshotHarness.tsx`
- `docs/avanza-real-world-snapshot-capture-guide.md`

This intake layer accepts manual screenshot notes, manual DOM notes, local-dev
snapshot notes, or fixtures after sensitive material has been masked or
redacted. It prepares accurate detector and future form-mapping work without
adding live navigation, login, credential handling, form fill, click, order
submission, BankID automation/bypass, or Supabase execution writes.

Sensitive material is forbidden in fixtures and docs, including passwords,
personnummer, account numbers, cookies, session/localStorage data, BankID QR,
and broker secrets.

## Real-World Login Signal Pack

The Sharp Semi Auto scope now includes a sanitized Avanza login-flow signal pack
based on user-provided visual material:

- `lib/avanza-real-world-login-signals.ts`
- `lib/avanza-real-world-login-signals-fixtures.ts`
- `components/execution/AvanzaRealWorldLoginSignalsHarness.tsx`
- `docs/avanza-real-world-login-flow-signals.md`

The signal pack recognizes the initial login page, `Privat`/`Företag` toggle,
`Användarnamn och lösenord`, private `Privatkund` form labels, company login
signals, `Logga in`, `Avbryt`, and `Logga in på företagswebben`.

BankID options such as `Visa QR-kod` and `Öppna BankID på samma enhet` are
detected as forbidden/manual-action signals only. This layer does not perform
login, access credentials, fill forms, click, navigate Avanza, automate BankID,
bypass BankID, submit orders, or write Supabase execution records.

## Ture Avanza Execution Settings Profile

The Sharp Semi Auto scope now includes a pure Ture Avanza execution settings
profile:

- `lib/avanza-execution-settings-profile.ts`
- `lib/avanza-execution-settings-profile-fixtures.ts`
- `components/execution/AvanzaExecutionSettingsProfileHarness.tsx`
- `docs/avanza-execution-settings-profile.md`

The profile models the user's selected Avanza customer type, either `Privat` or
`Företag`, username/password login intent, and secure credential provider
selection. macOS Keychain is the preferred provider. BankID remains forbidden
for automation.

This layer does not implement settings UI, settings persistence, credential
provider access, Keychain access, 1Password CLI calls, environment reads,
credential material return, cookie/session handling, actual login, form fill,
clicks, order submission, or Supabase writes.

## Avanza Login Route Planner

The Sharp Semi Auto scope now includes a pure Avanza login route planner:

- `lib/avanza-login-route-planner.ts`
- `lib/avanza-login-route-planner-fixtures.ts`
- `components/execution/AvanzaLoginRoutePlannerHarness.tsx`
- `docs/avanza-login-route-planner.md`

The planner combines the Ture execution settings profile, login state model,
page state model, and sanitized real-world login signals to choose a route-model
status. `Privat` and `Företag` routes are distinct, username/password is the only
supported automated login method, and BankID/MFA states stop for manual action.

Action steps are planned but not executable yet. The layer does not navigate,
log in, access credentials, fill forms, click, call API routes, fetch, submit
orders, click final KÖP/SÄLJ, or write Supabase execution records.

## Avanza Login Action Contract

The Sharp Semi Auto scope now includes a pure Avanza login action contract:

- `lib/avanza-login-action-contract.ts`
- `lib/avanza-login-action-contract-fixtures.ts`
- `components/execution/AvanzaLoginActionContractHarness.tsx`
- `docs/avanza-login-action-contract.md`

Login action contract is now modeled. It is the bridge between route planning
and future browser actions.

Actions are currently contract-only and non-executable. No credential material
appears in action output. BankID/MFA remains forbidden for automation and
manual-action only.

## Avanza Login Dry-Run Executor

The Sharp Semi Auto scope now includes a pure Avanza login dry-run executor:

- `lib/avanza-login-dry-run-executor.ts`
- `lib/avanza-login-dry-run-executor-fixtures.ts`
- `components/execution/AvanzaLoginDryRunExecutorHarness.tsx`
- `docs/avanza-login-dry-run-executor.md`

Login dry-run executor is now modeled. It verifies that login action plans are
internally coherent before any real action execution. It consumes the login
action contract and produces non-executable dry-run action reports.

This layer remains non-executing and dry-run/model-only. It does not navigate,
log in, read credentials, return credential material, fill username/password
fields, click, read cookies/session, call API routes, fetch, submit orders,
automate or bypass BankID, or write Supabase execution records.

## Avanza Login Mock Page Executor

The Sharp Semi Auto scope now includes a pure Avanza login mock page executor:

- `lib/avanza-login-mock-page-executor.ts`
- `lib/avanza-login-mock-page-executor-fixtures.ts`
- `components/execution/AvanzaLoginMockPageExecutorHarness.tsx`
- `docs/avanza-login-mock-page-executor.md`

Mock executor is now modeled. It can simulate private/company login action
sequences against an in-memory mock page model. It remains mock-only and
non-browser. It still does not access credentials.

This layer does not use Playwright, navigate to Avanza, perform actual login,
read or return credential material, fill real forms, click real buttons, submit
login, handle cookies/session, submit orders, automate or bypass BankID, or
write Supabase execution records.

## Avanza Login Local-Dev Executor

The Sharp Semi Auto scope now includes an Avanza login local-dev executor
contract:

- `lib/avanza-login-local-dev-executor.ts`
- `lib/avanza-login-local-dev-executor-fixtures.ts`
- `components/execution/AvanzaLoginLocalDevExecutorHarness.tsx`
- `docs/avanza-login-local-dev-executor.md`

Local-dev executor contract is now modeled. It can execute through explicitly
injected mock/page dependencies only. It does not resolve credentials yet, does
not run by default, and is not wired into Trade UI.

This layer uses credential references only. It does not handle cookies/session,
automate or bypass BankID, submit orders, click final KÖP/SÄLJ, or write
Supabase execution records.

## Avanza macOS Keychain Provider Adapter Contract

The macOS Keychain provider contract now exists at
`lib/avanza-macos-keychain-credential-provider.ts`.

It provides credential references for local-dev login work using injected
Keychain dependencies only. It does not expose raw credential material. It does
not run Keychain commands during import/render/tests, and is not wired into
Trade UI yet. The fixtures and isolated harness model disabled, unavailable, ready,
reference-configured, credential-check, read-blocked, and local-dev
read-allowed-with-value-hidden states while keeping final human confirmation
required and preventing BankID automation or order submission.

It is not wired into Trade UI yet.

## Avanza Login Credential Resolution Bridge

Credential resolution bridge now exists at
`lib/avanza-login-credential-resolution-bridge.ts`.

It prepares safe local-dev login execution by connecting secure provider
references to injected credential-read dependencies. It does not expose
credential material. It is not wired into Trade UI yet.

Raw values may exist only inside private local-dev runtime scope. Safe reports
contain resolved flags only. BankID automation/bypass, cookie/session handling,
order submission, and final KÖP/SÄLJ click remain forbidden.

## Avanza Local-Dev Credential Executor

Local-dev credential executor now exists at
`lib/avanza-login-local-dev-credential-executor.ts`.

It can use a private runtime credential bundle with injected dependencies. It is
still not wired into Trade UI. It does not include order behavior.

## Avanza Local Playwright Page Action Binding

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
order flow. It blocks CI, requires explicit env opt-in and manual terminal
confirmation, uses injected dependencies only, and does not add order
submission, final KÖP/SÄLJ clicks, BankID automation, cookie/session handling,
credential logging, or Supabase writes.

## Avanza Terminal Login Smoke Script Scaffold

The terminal-only script scaffold now exists at
`scripts/avanza-login-smoke-test.local.ts`.

It remains disconnected from Trade UI, disconnected from API routes, and
disconnected from order flow. It is default-safe and hard-gated: CI is blocked,
explicit env opt-in and manual local confirmation are required, and a separate
real-run flag is required before explicit real-run mode can be modeled.

## Passive Ture Settings UI Scaffold

The Sharp Semi Auto scope now includes a passive Ture Settings UI scaffold for
the Avanza execution profile.

It models account type and credential readiness only: `Privat`, `Företag`, or
`Not selected`; username/password only; BankID forbidden/manual-action only;
macOS Keychain preferred. It uses local component state only and does not store
or show raw credentials.

It does not execute login, smoke tests, browser actions, API calls, orders, or
final KÖP/SÄLJ.

## Avanza Order Flow Signals and Ticket Field Contract

Real-world Avanza order flow signals now exist in
`lib/avanza-real-world-order-flow-signals.ts`, based on sanitized
user-provided BUY-flow material. SELL is modeled from the same structure with
sell labels.

The Avanza BUY/SELL order ticket field contract now exists in
`lib/avanza-order-ticket-field-contract.ts`. It maps explicit package input to
safe field plans for limit orders only.

This is the first order-side model after login readiness. It does not activate
order behavior, does not fill Avanza forms, does not click, does not submit
orders, and does not click final KÖP/SÄLJ. Final human confirmation remains
mandatory.

This phase does not activate order behavior.

## Avanza Order Ticket Action Contract

The Avanza order ticket action contract now exists in
`lib/avanza-order-ticket-action-contract.ts`.

It is the bridge between order field mapping and future order-fill execution.
It converts safe field plans into fixture/model-only BUY/SELL limit-order
preparation actions.

The contract does not activate order behavior, does not fill Avanza forms,
does not click, does not submit orders, and does not click final KÖP/SÄLJ.
Final human confirmation remains mandatory.

## Avanza Instrument Search Route And Action Contracts

Instrument discovery/search now exists as a model before order ticket preparation.

The Sharp Semi Auto scope now includes sanitized instrument search signals, an
instrument search route contract, and an instrument search action contract.

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

This does not activate order behavior. No real search execution, Avanza
navigation, click behavior, BUY/SELL entry click, order submission, Trade UI
wiring, API route wiring, or Supabase execution write is added. Final human
confirmation remains mandatory.

## Instrument To Order Handoff Chain

The Sharp Semi Auto scope now includes the pure Avanza instrument search to order ticket handoff chain in `lib/avanza-instrument-to-order-handoff-chain.ts`.

The pre-submit order chain is now modeled end-to-end: execution package -> instrument search -> verification -> order ticket field/action path -> stop before final KÖP/SÄLJ. This still does not activate execution. Final human confirmation remains mandatory.

## Instrument To Order Dry-Run Executor

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

The dry-run executor adds fixture/model-only validation for BUY and SELL
pre-submit flow readiness. It still does not activate execution. Final human
confirmation remains mandatory.

## Instrument To Order Mock Executor

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

The mock layer simulates the order-side flow against simulated Avanza page
state. This still does not activate real Avanza execution. Final human
confirmation remains mandatory.

## Settlement Note / Order Information Signals

Settlement note signals now exist as the post-trade reconciliation foundation in
`lib/avanza-real-world-settlement-note-signals.ts`.

Exact courtage, FX/exchange rate, settlement amount, and realized execution
cost are future extraction targets from Avanza avräkningsnota after the user
has manually confirmed the trade. This does not activate post-trade navigation,
PDF/download/read, OCR, value extraction, reconciliation writes, Trade UI
wiring, API route wiring, cookie/session handling, or BankID automation.

Settlement route/action contracts now exist. They prepare future note
retrieval/extraction by modeling the route from trade reference to matching
transaction and Avräkningsnota. They do not activate reconciliation or writes.

## Settlement Extraction Schema And Reconciliation Mapping

Settlement extraction schema and reconciliation mapping now exist. Exact
cost/FX reconciliation is modeled but not applied.

The schema models avräkningsnota targets for courtage, FX/växelkurs,
settlement amount, trade dates, quantity, price, and currency. The mapping
previews how those values could later reconcile execution records, trade
results, statistics/PnL, and audit metadata.

This still does not activate document reading, OCR, value extraction,
reconciliation writes, Supabase writes, Trade UI wiring, or API route wiring.

## Settlement Reconciliation Dry-Run Executor

Settlement reconciliation now has a dry-run validation layer. It simulates the
full post-trade route/action/schema/mapping path as fixture/model-only, requires
manual review, and stops before any write.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor

Settlement reconciliation now has a mock execution layer after dry-run in
`lib/avanza-settlement-reconciliation-mock-executor.ts`.

The mock layer simulates the post-trade reconciliation path against simulated
settlement state only. BUY and SELL fixtures can reach manual review after
transaction matching, Avräkningsnota availability, masked/synthetic courtage,
masked/synthetic FX/växelkurs, masked/synthetic settlement amount, and
reconciliation preview.

This still does not activate real navigation, document reading,
PDF/download/read, OCR, real value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring. Exact cost/FX reconciliation
remains modeled/mock-only.
## Sharp Semi Auto Execution Architecture Checkpoint

The architecture checkpoint now lives in `docs/avanza-sharp-semi-auto-execution-architecture-checkpoint.md`, with the fixture/model-only readiness map in `docs/avanza-execution-readiness-map.md`.

Current architecture is mature at model/mock level, but it is not production ready, and real local-dev binding and Trade UI/API integration remain separate future gates. No real execution, real navigation, form fill, final KOP/SALJ click, order submission, settlement document reading, OCR, value extraction, reconciliation write, Trade UI execution wiring, API route execution wiring, Supabase write, or production readiness is added by the checkpoint.

The local-dev order/search page action binding now exists in `lib/avanza-local-playwright-order-page-action-binding.ts`. It can supply injected dependencies to a future local-dev order chain executor, but it is still not wired to Trade UI/API and does not include order submission or final KOP/SALJ click.

The local-dev order chain executor now exists in `lib/avanza-instrument-to-order-local-dev-executor.ts`. It uses injected order/search page action dependencies to model search execution, instrument verification, order field preparation, and review-ready state. It is not wired to Trade UI/API and still cannot submit orders or click final KOP/SALJ. Final human action remains required.

The Avanza order chain smoke test runner now exists in
`lib/avanza-order-chain-smoke-test-runner.ts`. It is the order-side counterpart
to the login smoke runner and remains local-dev, terminal-gated, and injected
dependency only. It is disconnected from Trade UI/API and order submission,
cannot click final KOP/SALJ, and keeps final human action required.
## Local-Dev Execution Runbook

The Avanza local-dev execution runbook now exists and is the operator guide
before any real local-dev order smoke script or Trade UI/API integration. It
keeps the Sharp Semi Auto agent scoped to guided, gated local-dev review and
does not add real execution, app-runtime navigation, cookies/session export,
BankID automation, final KOP/SALJ, order submission, Supabase writes, or
production readiness.

The terminal-only Avanza order smoke script scaffold now exists. It is
hard-gated, CI-blocked, default-safe, and disconnected from Trade UI/API/order
submission. It preserves the semi-auto boundary: Ture may prepare to
review-ready, while the user must manually press final KOP/SALJ.

## Local Smoke Result Capture

The local smoke checklist/result capture model is documented in `docs/avanza-local-smoke-test-result-capture.md`. It lets operators record safe login/order-prep/settlement outcomes without storing sensitive data. It does not run smoke tests, persist results, wire Trade UI/API, navigate from app runtime, handle cookies/session, automate BankID, submit orders, click final KOP/SALJ, write Supabase, or expand the Sharp Semi Auto agent into production readiness.

## Passive Execution Readiness Preview

The passive execution readiness preview is documented in `docs/avanza-passive-execution-readiness-preview.md`. It gives operator visibility before active integration while preserving no active handoff, no prepare action, no buy/sell CTA, no API calls, no fetch/polling, no browser automation, no smoke test from UI, no credential access, no cookies/session, no BankID automation, no order submission, no final KOP/SALJ click, no Supabase write, and no production readiness.

## Settings Passive Execution Readiness Panel

`docs/avanza-settings-passive-execution-readiness-panel.md` now records that passive execution readiness is visible in app Settings. This does not expand the Sharp Semi Auto agent scope: no active handoff, prepare action, buy/sell CTA, API calls, fetch/polling, browser automation, smoke test from UI, credential access, cookies/session handling, BankID automation, order submission, final KOP/SALJ click, Supabase write, or production readiness is added.
## Passive Recommendation/Live-Position Readiness Scope

Recommendation/live-position execution readiness metadata is in scope only as passive model/dev-QA visibility. It prepares future read-only card display and does not permit active handoff, prepare actions, API calls, browser automation, smoke tests from UI, order submission, or final KÖP/SÄLJ clicks.

The Trade card execution readiness adapter is also in scope only as a read-only adapter for future passive card visibility. It does not activate execution.

## Headless Contract Selection And Planning

The headless agent plan builder is now part of the planning-only scope. The
headless execution contract selector now feeds
`docs/avanza-headless-agent-plan-builder.md`. This is still within the Sharp
Semi Auto scope as an under-the-surface, agent-readable planning layer only.
It models future Avanza preparation steps from a selected contract while
keeping the UI visually simple and without adding active handoff, prepare
actions, API calls, fetch/polling, browser automation now, credential access,
cookies/session handling, BankID automation, order submission, final KOP/SALJ
clicks, Supabase writes, or production readiness.

## Headless Session Lifecycle Scope

The headless execution session state machine is now part of the planning-only
scope through `docs/avanza-headless-execution-session-state-machine.md`.
Contract selector feeds plan builder, and plan builder now feeds session
lifecycle without visual UI or execution. It models future session progress and
terminal states only; agent final click is forbidden. It does not add active
handoff, prepare actions, browser automation now, API calls, credential access,
cookies/session handling, BankID automation, order submission, final KOP/SALJ
clicks by agent, Supabase writes, or production readiness.

## Headless Orchestration Scope

The headless execution orchestration pipeline is now part of the planning-only
scope through `docs/avanza-headless-execution-orchestration-pipeline.md`. It
connects contract to selector to plan to session, and future agent session
behavior is modeled without visual UI or active broker behavior. It remains
under the surface and does not add visible Trade UI changes, active handoff,
prepare actions, browser automation now, API calls, fetch/polling, credential
access, cookies/session handling, BankID automation, order submission, final
KOP/SALJ clicks by agent, Supabase writes, or production readiness.

## Headless Architecture Checkpoint Scope

The headless execution architecture checkpoint is now part of the planning-only
scope through `docs/avanza-headless-execution-architecture-checkpoint.md`. It
records the full under-surface agent brain loop: contract -> selector -> plan ->
session -> orchestration. The checkpoint does not execute anything and does not
open any activation gate. Local-dev bridge gate remains not open, Trade UI
execution gate is locked, API route execution gate is locked, browser
automation gate is locked, credential access gate is locked, cookies/session
export is forbidden, BankID automation is forbidden, order submission is
forbidden, final KOP/SALJ remains human-only, Supabase writes are locked,
settlement writes are locked, and production readiness is blocked.

## Local-Dev Bridge Contract Scope

The local-dev bridge contract is now modeled in
`docs/avanza-local-dev-bridge-contract.md`. It maps a ready headless
orchestration report to a future terminal-only smoke request candidate, but the
bridge gate remains closed. This is the next step before any actual bridge
invocation and does not invoke smoke runners, import terminal scripts, run
browser automation, call APIs, access credentials, handle cookies/session,
automate BankID, submit orders, click final KOP/SALJ, write Supabase, or change
the minimal Trade UI.

## Local-Dev Bridge Readiness Checkpoint Scope

`docs/avanza-local-dev-bridge-readiness-checkpoint.md` now defines a checkpoint
at the invocation boundary for the local-dev bridge stack. It confirms the
under-surface layers are built and model-only simulation can reach the boundary,
but future work must explicitly decide the next allowed design step. Runtime
remains locked. The scope still forbids smoke runner invocation, terminal script
invocation, browser automation, credential access, cookies/session export,
BankID automation, order submission, final KOP/SALJ agent clicks, Supabase
writes, Trade UI active handoff, API route activation, and production readiness.

## Local-Dev Bridge Activation Checklist Scope

`docs/avanza-local-dev-bridge-activation-checklist.md` now defines the manual
review and approval gate model before disabled bridge runner design. Approval is
limited to disabled design review; it does not approve model-only dry-run,
real-run, browser automation, credential access, order submission, final
KOP/SALJ clicks, or Supabase writes. Runtime remains locked and real-run
remains forbidden.

## Disabled Local-Dev Bridge Runner Scope

`docs/avanza-disabled-local-dev-bridge-runner.md` now defines the disabled
local-dev bridge runner skeleton. It is model/helper/docs/dev-QA only and
hidden under the surface. It can consume the bridge contract and activation
checklist as model inputs, but it cannot open the bridge gate, invoke smoke
runners, import terminal scripts, start browser automation, access credentials,
handle cookies/session, automate BankID, submit orders, click final KOP/SALJ,
write Supabase, or change the minimal Trade UI.

## Model-Only Local-Dev Bridge Dry Runner Scope

`docs/avanza-model-only-local-dev-bridge-dry-runner.md` now defines the
model-only dry-run layer. It simulates the bridge run to the invocation
boundary but does not open runtime or open the bridge gate, invoke smoke
runners, run terminal scripts, start browser automation, access credentials, handle cookies/session,
automate BankID, submit orders, click final KOP/SALJ, write Supabase, or change
the minimal Trade UI.

## Manual Local-Dev Invocation Approval Runbook

`docs/avanza-manual-local-dev-invocation-approval-runbook.md` now gates any
future invocation adapter design. It is a manual-review evidence model only,
not runtime approval. Runtime remains locked.

## Disabled Local-Dev Invocation Adapter Contract

`docs/avanza-disabled-local-dev-invocation-adapter-contract.md` now defines the
future adapter shape only. The Sharp Semi Auto scope remains under-surface and
design-only here; runtime remains locked.

## Disabled Invocation Adapter Payload Validator

`docs/avanza-disabled-invocation-adapter-payload-validator.md` now validates
disabled invocation adapter design-review payloads only. It rejects sensitive
payload and runtime capabilities, and runtime remains locked.

## Invocation Adapter Design Checkpoint

`docs/avanza-invocation-adapter-design-checkpoint.md` now records the Sharp Semi
Auto invocation adapter design checkpoint. It validates design review only,
stays fixture/model-only, and runtime remains locked.

## Sharp Semi Auto Execution Phase Checkpoint

`docs/avanza-sharp-semi-auto-execution-phase-checkpoint.md` now closes the
current design phase as complete. Future work must pick a separate workstream,
and runtime remains locked.
