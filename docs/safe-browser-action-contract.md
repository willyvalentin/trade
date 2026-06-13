# Safe Browser Action Contract

Date: 2026-06-11

Status: Pure contract/helper documentation for future safe browser actions. No Avanza automation was implemented, no Avanza URL or selector was added to runtime code, no Playwright or browser automation import was added to app runtime, no credential was added, and no order submission is in scope.

Related:

- `lib/safe-browser-action-contract.ts`
- `lib/safe-browser-action-runner.ts`
- `lib/safe-browser-action-diagnostics.ts`
- `lib/safe-browser-action-diagnostics-store.ts`
- `lib/browser-runner-capability-gate.ts`
- `lib/avanza-dry-run-request-contract.ts`
- `lib/execution-intent-to-avanza-dry-run.ts`
- `lib/mock-order-safe-action-plan.ts`
- `app/settings/page.tsx`
- `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Define a pure TypeScript contract for future safe browser actions before any Avanza automation exists.

The contract is designed to support future `safeClick`, `safeFill`, and `safeRead` wrappers without executing browser actions. It validates intent, target risk, mode, and final-confirm denylist matches, but it does not import Playwright, touch the DOM, open Avanza, or click anything.

Action 246 added `lib/safe-browser-action-runner.ts`, a pure no-op runner interface that validates batches of safe actions, reports blocked/skipped/validated results, and still executes no browser actions.

Action 247 added `lib/mock-order-safe-action-plan.ts`, a pure adapter from `MockOrderPageFillPlan` to `SafeBrowserAction` plans for the local mock order page. It does not import Playwright, open a browser, or execute the plan.

Action 248 added `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts`, a Playwright-only e2e adapter that can execute validated safe action plans against the dev-only mock order page. It lives under `tests/e2e`, validates every action before execution, and is not app runtime code.

Action 249 added `lib/safe-browser-action-diagnostics.ts`, a pure shared diagnostics contract for safe action execution results. The Playwright mock adapter now emits that standardized shape for both successful mock-page runs and blocked final-confirm-like actions.

Action 250 added `lib/safe-browser-action-diagnostics-store.ts` and a dev-gated Settings viewer for local safe-action diagnostics. The store uses only browser localStorage and remains separate from broker results, execution records, Supabase, and trade state.

Action 251 integrated safe-action diagnostics into the dev-only localhost mock-agent path. The manual mock-agent runner emits compatible diagnostics, the localhost bridge returns them as response-level metadata, and the Execution Handoff Preview Modal can save them locally when the user explicitly runs the mock agent.

Action 252 added `lib/browser-runner-capability-gate.ts`, a pure capability gate that classifies mock browser runners separately from future Avanza/broker runners. It blocks Avanza, broker submission, final-confirm click, unknown, and automatic-capable browser runners by default unless future explicit gates allow them.

Action 253 added `docs/avanza-dry-run-capability-spec.md`, a documentation-only spec for a future Avanza dry-run capability. Dry-run remains navigation/fill/review/readback only and must not be treated as broker execution.

Action 255 added `lib/avanza-dry-run-request-contract.ts`, a pure dry-run request/input contract. It validates future order-preparation inputs but does not create safe browser actions, automate a browser, add URLs/selectors, or submit orders.

Action 256 added `lib/execution-intent-to-avanza-dry-run.ts`, a pure adapter from execution intents to validated dry-run request inputs. It still does not create safe browser actions or execute browser behavior.

Action 259 added `docs/avanza-dry-run-runner-implementation-plan.md`, a documentation-only plan for a future dry-run runner. It requires a future runner to convert requests into safe action plans, validate every action before execution, return safe-action diagnostics, and stop at the confirmation modal without final confirmation.

## Contract Surface

File:

- `lib/safe-browser-action-contract.ts`

Version:

- `SAFE_BROWSER_ACTION_CONTRACT_VERSION`

Action kinds:

- `click`
- `fill`
- `read`
- `wait_for`
- `select`
- `stop`

Modes:

- `semi_automatic`
- `automatic`

Target fields:

- `label`
- `role`
- `testId`
- `text`
- `description`
- `riskLevel`

Action fields:

- `actionId`
- `kind`
- `mode`
- `target`
- `value`
- `reason`
- `createdAt`
- `metadata`

## Final-confirm Denylist

The contract exports `FINAL_CONFIRM_DENYLIST_TERMS`.

Initial denylist terms:

- `Bekräfta köp`
- `Bekräfta sälj`
- `Confirm buy`
- `Confirm sell`
- `Confirm purchase`
- `Confirm order`
- `Submit order`
- `Place order`

The helper `isFinalConfirmLikeTarget(target)` checks `label`, `text`, and `description` case-insensitively. These terms are not Avanza selectors. They are safety labels for future action validation.

## Semi-auto Rules

In `semi_automatic` mode:

- final-confirm-like `click` is blocked
- final-confirm-like `select` is blocked
- final-confirm-like `read`, `wait_for`, and `stop` are allowed
- critical-risk `click` and `select` are blocked unless represented as read/wait/stop behavior
- `Granska köp` / `Granska sälj` style review clicks can validate as allowed when not final-confirm-like and not critical risk

This matches the safety boundary from `docs/avanza-final-confirm-block-design.md`: confirmation modal detection is a terminal success state for semi-auto, and final confirmation belongs to the human.

## Automatic Separation

The contract has an `automatic` mode type so future design can keep mode handling explicit.

Current behavior:

- automatic final-confirm-like clicks are not blocked by this pure validator
- they emit a warning that automatic final confirmation is out of scope for the first Avanza prototype

Automatic order submission still requires separate approval, feature gating, implementation design, and tests. This contract does not enable automatic execution.

## Validation Helpers

`createSafeBrowserAction(input)`:

- fills `actionId` and `createdAt` if missing
- returns a normalized action object
- has no browser side effects

`validateSafeBrowserAction(action)`:

- returns `SafeBrowserActionValidationResult`
- blocks semi-auto final-confirm click/select
- blocks semi-auto critical-risk non-read actions
- warns on automatic final-confirm-like click/select
- reports matched denylist terms
- reports effective risk level
- executes nothing

`createBlockedSafeBrowserActionResult(...)`:

- builds a blocked validation response for helper reuse

`getSafeBrowserActionDisplayLabel(...)`:

- returns a human-readable target label for diagnostics

`getSafeBrowserActionRiskLevel(...)`:

- derives risk from explicit target risk or final-confirm-like target text

## Runner Interface

File:

- `lib/safe-browser-action-runner.ts`

The runner layer defines:

- `SafeBrowserActionExecutionStatus`
- `SafeBrowserActionExecutionResult`
- `SafeBrowserActionRunnerResult`
- `SafeBrowserActionRunnerOptions`
- `SafeBrowserActionRunner`

Execution statuses:

- `pending`
- `validated`
- `blocked`
- `skipped`
- `executed`
- `failed`

The current implementation is no-op only:

- `createNoopSafeBrowserActionRunner(...)`
- `runSafeBrowserActions(...)`
- `summarizeSafeBrowserActionRunnerResult(...)`

The no-op runner:

- has `supportsRealBrowserExecution=false`
- validates each action with `validateSafeBrowserAction(...)`
- returns `validated` for allowed actions
- returns `blocked` for blocked actions
- returns `skipped` for later actions when `stopOnBlocked=true`
- keeps `executedCount=0`
- executes no browser calls
- has no Avanza selectors, URLs, credentials, or side effects

Any future real browser runner must implement the same `SafeBrowserActionRunner` interface and must pass validation before executing an action.

## Mock Order Safe Action Plans

File:

- `lib/mock-order-safe-action-plan.ts`

The mock adapter defines:

- `MockOrderSafeActionPlan`
- `MockOrderSafeActionPlanBuildOptions`
- `buildMockOrderSafeActionPlan(...)`
- `validateMockOrderSafeActionPlan(...)`
- `summarizeMockOrderSafeActionPlan(...)`

The adapter:

- validates `MockOrderPageFillPlan` first
- emits safe actions using mock page selector test IDs and descriptions
- creates fill/select actions for mock order fields
- creates a review click for the local `Review mock order` button when enabled
- creates read-only actions for mock confirmation link availability and disabled submit state
- treats the mock final confirm label as form/readback data, not as a clickable final-confirm target
- never creates a final confirm click
- can be validated through `validateSafeBrowserAction(...)`
- can be run through `createNoopSafeBrowserActionRunner(...)` with `executedCount=0`

This is a mock/dev adapter only. It is not Avanza automation and it does not define Avanza selectors or URLs.

## Execution Diagnostics

File:

- `lib/safe-browser-action-diagnostics.ts`

The diagnostics layer defines:

- `SafeBrowserActionExecutionStep`
- `SafeBrowserActionExecutionDiagnostics`
- `createSafeBrowserActionExecutionDiagnostics(...)`
- `summarizeSafeBrowserActionExecutionDiagnostics(...)`
- `hasFinalConfirmBlocked(...)`

Each execution step records:

- action id and action kind
- target description and optional mock `testId`
- step status: `validated`, `executed`, `blocked`, `skipped`, or `failed`
- validation result summary
- blocked flag
- message
- timestamps
- errors and warnings
- optional metadata

The aggregate diagnostics record captures:

- diagnostics id
- mode
- runner name
- whether the runner supports real browser execution
- `ok`
- `blocked`
- `finalConfirmBlocked`
- per-step records
- validated/executed/blocked/skipped/failed counts
- aggregate errors and warnings

This diagnostics object is not a broker result, not an order confirmation, and not evidence of a submitted order. It is runner telemetry for safe-action execution only. Future mock or Avanza runners should emit the same shape so blocked actions, validation stops, and final-confirm prevention are visible consistently.

## Local Diagnostics Store

File:

- `lib/safe-browser-action-diagnostics-store.ts`

Storage key:

- `ture_safe_browser_action_diagnostics_v1`

The local store exports:

- `readSafeBrowserActionDiagnostics()`
- `appendSafeBrowserActionDiagnostics(...)`
- `appendSafeBrowserActionDiagnosticsBatch(...)`
- `clearSafeBrowserActionDiagnostics()`
- `getSafeBrowserActionDiagnosticsById(...)`
- `getSafeBrowserActionDiagnosticsByMode(...)`
- `getSafeBrowserActionDiagnosticsWithFinalConfirmBlocked()`

Store behavior:

- localStorage only
- safe on server-side render or unavailable localStorage
- malformed JSON is handled without throwing
- invalid diagnostic shapes are ignored
- latest 500 diagnostics are retained
- no Supabase writes
- no broker result creation
- no execution record creation
- no trade mutation

Settings now has a dev-gated `Safe Browser Action Diagnostics` panel. It shows total count, latest timestamp, final-confirm-blocked count, latest diagnostics, per-step details, metadata, full JSON, refresh, and scoped clear. The panel is local diagnostics only and does not generate browser actions.

## Mock Agent Diagnostics Integration

Files:

- `scripts/mock-order-page-agent-runner.mjs`
- `scripts/avanza-localhost-bridge-server.mjs`
- `lib/avanza-localhost-bridge-contract.ts`
- `app/trade-app.tsx`

The local mock-agent runner now emits `safeActionDiagnostics` for its mock-only fill/review flow. The diagnostics describe mock field fills, mock select actions, review click, validation checks, confirmation-link readback, and disabled-submit readback.

The localhost bridge may return:

- `safeActionDiagnostics`
- `safeActionDiagnosticsAvailable`
- `safeActionDiagnosticsMessage`

These are response-level metadata only. They are not `brokerResult`, not broker confirmations, and not execution records.

When the dev-only modal receives diagnostics from an explicit `Run localhost mock agent` click, it shows a compact summary and appends the diagnostics to the local store. This is local browser diagnostics only and does not submit orders or mutate trade state.

## Browser Runner Capability Gate

File:

- `lib/browser-runner-capability-gate.ts`

The capability gate defines:

- `BrowserRunnerTargetEnvironment`
- `BrowserRunnerExecutionCapability`
- `BrowserRunnerCapabilityValidationResult`
- `createMockOnlyBrowserRunnerCapability(...)`
- `createAvanzaDryRunBrowserRunnerCapability(...)`
- `validateBrowserRunnerCapability(...)`
- `summarizeBrowserRunnerCapabilityValidation(...)`
- `classifyDiagnosticsCapability(...)`

Default behavior:

- `mock_order_page` + `mockOnly=true` + no submission + no final confirm is allowed as `safe_mock_only`
- `avanza_broker` is blocked unless `allowAvanzaDryRun=true` explicitly allows dry-run validation
- `avanza_broker` + dry-run metadata + no submission + no final confirm + no automatic capability can validate as `dry_run_only`
- broker submission is blocked unless a future broker-submission gate explicitly allows it
- final-confirm click capability is blocked unless future broker-submission and automatic-mode gates explicitly allow it
- unknown target environment is blocked
- automatic-capable browser runners are blocked by default

Safe-action diagnostics should include capability metadata where possible:

- `mockOnly: true`
- `devOnly: true`
- `targetEnvironment: "mock_order_page"`
- `supportsBrokerSubmission: false`
- `supportsFinalConfirmClick: false`
- `automaticModeCapable: false`

The modal and Settings diagnostics viewer display capability labels such as `Mock-only browser diagnostics`, `No broker submission`, and `Final confirm disabled`. Unknown diagnostics are labeled as blocked by default and must not be treated as broker execution.

`docs/avanza-dry-run-capability-spec.md` defines the future dry-run boundary for `targetEnvironment: "avanza_broker"`. Action 254 implemented only the pure capability classification for that boundary. It still requires no broker submission, no final-confirm click, no automatic mode, no broker result, and no trade mutation. Avanza dry-run remains blocked by default unless `allowAvanzaDryRun=true` is explicitly passed.

## Playwright Mock Adapter

File:

- `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts`

The Playwright adapter exports:

- `executeSafeBrowserActionsOnMockPage(...)`
- `executeMockOrderSafeActionPlan(...)`

Both functions return the existing adapter summary fields plus a standardized `diagnostics` object from `lib/safe-browser-action-diagnostics.ts`.

The adapter:

- lives only under `tests/e2e`
- validates each `SafeBrowserAction` before execution
- supports known mock page `data-testid` / `data-agent-field` targets only
- fills/selects mock form fields
- clicks only the local `Review mock order` button
- reads mock confirmation-link visibility and disabled-submit state
- blocks final-confirm-like click/select actions
- blocks unknown click targets
- blocks disabled-submit mutation/click attempts
- blocks external or Avanza URL-like target metadata
- emits one diagnostics step per action attempted
- sets `finalConfirmBlocked=true` when an unsafe final-confirm-like action is blocked

It does not:

- import Playwright into app/runtime code
- open Avanza
- use Avanza selectors or URLs
- submit mock orders
- create broker results
- write Supabase
- mutate trade state

## Future Implementation Guidance

A future Avanza runner should:

- create planned browser actions as `SafeBrowserAction`
- validate every action before execution
- reject blocked actions before touching a browser
- execute only through a `SafeBrowserActionRunner`
- build local mock page plans with `buildMockOrderSafeActionPlan(...)` before any future browser execution design
- route all future clicks through a wrapper such as `safeClick(...)`
- route form input through a wrapper such as `safeFill(...)`
- route readback through a wrapper such as `safeRead(...)`
- forbid direct raw click calls in runner code
- treat validation failure as a safe stop

A future Avanza runner must not:

- import test-only helpers into runtime
- use generic "click primary button" behavior
- fuzzy-click final confirmation labels
- press keyboard `Enter` or `Space` after confirmation modal detection
- submit forms from semi-auto mode

## Test Coverage

Current Playwright contract coverage verifies:

- semi-auto click `Bekräfta köp` is blocked
- semi-auto click `Bekräfta sälj` is blocked
- semi-auto read `Bekräfta köp` is allowed
- semi-auto click `Granska köp` is allowed
- automatic final-confirm-like click emits a warning
- critical-risk semi-auto click is blocked
- no-op runner validates allowed review actions without execution
- no-op runner blocks final-confirm actions
- no-op runner skips later actions when `stopOnBlocked=true`
- no-op runner continues validation when `stopOnBlocked=false`
- mock fill plan converts into a safe action plan
- mock safe action plan validates with no blocked actions
- mock safe action plan runs through the no-op runner with `executedCount=0`
- injected unsafe final-confirm click makes mock plan validation fail
- Playwright mock adapter executes a valid mock safe action plan against `/mock-broker/order`
- positive Playwright adapter diagnostics show `ok=true`, no blocked action, no final confirm block, executed steps, and no failures
- Playwright mock adapter blocks an injected final-confirm click before any browser action executes
- blocked Playwright adapter diagnostics show `ok=false`, `blocked=true`, `finalConfirmBlocked=true`, and at least one blocked step
- Settings safe-action diagnostics viewer can display seeded local diagnostics
- Settings viewer shows final-confirm-blocked count and per-step details
- Settings scoped clear removes only `ture_safe_browser_action_diagnostics_v1`
- dev-tools-disabled Settings path hides the safe-action diagnostics viewer
- localhost mock-agent response metadata can include safe-action diagnostics
- Execution Handoff Preview Modal displays/saves mock-agent safe-action diagnostics
- Settings viewer shows the saved mock-agent diagnostics with `finalConfirmBlocked=0` for the valid path
- mock-only browser runner capability validates as `safe_mock_only`
- Avanza dry-run browser capability is blocked by default
- Avanza dry-run browser capability validates as `dry_run_only` only when `allowAvanzaDryRun=true`
- Avanza broker-submission, final-confirm, automatic-capable, and unknown browser capabilities are blocked by default
- Settings viewer labels mock-only diagnostics and warns on unknown capability diagnostics
- Settings viewer labels seeded Avanza dry-run diagnostics as `Avanza dry-run diagnostics`
- Settings viewer labels seeded Avanza broker-submission diagnostics as blocked

These tests are pure helper tests inside the existing e2e suite. They do not open Avanza or execute browser actions against Avanza.

## Safety Boundaries

- No Avanza automation.
- No Avanza URLs.
- No Avanza selectors.
- No credentials.
- No browser runtime import in the contract.
- No Playwright import in app/runtime code.
- No click execution.
- No order submission.
- No brokerResult.
- No Supabase write.
- No trade mutation.

## Recommended Next Action

Recommended:

- Action 260 - Avanza Dry-Run Runner Self-Check Contract

This should stay pure planning/contract work unless separately approved. No Avanza automation, runtime URLs/selectors, browser runner, broker result, or order submission should be added.
