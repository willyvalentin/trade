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
