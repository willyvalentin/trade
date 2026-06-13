# Avanza Dry-Run Capability Spec

Date: 2026-06-11

Status: Documentation-only capability specification for a possible future Avanza dry-run runner. Action 254 added pure capability-gate classification support for this shape, but no Avanza automation was implemented, no Avanza URL or selector was added, no credential was added, no browser automation was added, and no order submission is in scope.

Related:

- `lib/browser-runner-capability-gate.ts`
- `lib/avanza-dry-run-request-contract.ts`
- `lib/execution-intent-to-avanza-dry-run.ts`
- `lib/avanza-dry-run-runner-self-check.ts`
- `lib/avanza-session-detection-contract.ts`
- `docs/safe-browser-action-contract.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Define a future Avanza dry-run capability separately from mock-only browser execution.

Dry-run means browser navigation, order-form preparation, review-button interaction, confirmation-modal readback, and safe stop behavior only. It does not mean broker execution, final confirmation, broker-result capture, trade mutation, Supabase persistence, or History/Statistics integration.

This document is not implementation approval. It describes the gates a future implementation must satisfy before any Avanza browser runner can be proposed.

Action 254 implemented only the pure capability-gate classification for this spec:

- `createAvanzaDryRunBrowserRunnerCapability(...)`
- default validation still blocks `avanza_broker`
- `allowAvanzaDryRun=true` can classify a non-submitting, non-final-confirm, non-automatic Avanza capability as `dry_run_only`
- broker submission, final-confirm click, automatic-capable, and unknown capabilities remain blocked by default

Action 255 added `lib/avanza-dry-run-request-contract.ts`, a pure request contract for future Avanza dry-run inputs. It applies Advanced-mode/manual-review/stop-at-confirmation defaults, validates unsafe metadata, and provides summary/safety-label helpers. It does not add Avanza automation, URLs, selectors, browser execution, broker results, or order submission.

Action 256 added `lib/execution-intent-to-avanza-dry-run.ts`, a pure adapter from Ture execution intent/handoff data into `AvanzaDryRunOrderInput`. It extracts buy/sell, ticker, quantity, price references, recommendation/intent ids, and safe dry-run metadata, then validates the request contract. It does not add Avanza automation, URLs, selectors, browser execution, broker results, or order submission.

Action 257 added a dev-gated, read-only `Avanza dry-run request preview` to the Execution Handoff Preview Modal. The panel displays the Action 256 adapter output and safety labels only. It has no run button, no Avanza link, no localStorage side effect, no browser runner, and no broker execution behavior.

Action 258 added a dev-gated, read-only `Avanza dry-run readiness` checklist panel to the Execution Handoff Preview Modal. It shows request validity, capability-gate status, disabled broker submission/final confirm/automatic mode, missing runner implementation, intentionally missing selectors/URLs, and manual final confirmation requirements. Overall status remains `Not ready to run` because no Avanza runner exists.

Action 259 added `docs/avanza-dry-run-runner-implementation-plan.md`, a documentation-only implementation plan for the first future dry-run runner. It defines architecture, gates, execution flow, stop states, diagnostics, UI behavior, privacy boundaries, and staged tests before any runner code is written.

Action 260 added `lib/avanza-dry-run-runner-self-check.ts`, a pure self-check contract for future runner readiness. The current no-runner state can be represented as `unavailable`; mock-only capability is distinct from dry-run capability; `available_dry_run_only` requires explicit `allowAvanzaDryRun=true`; broker-submission and final-confirm-capable runners remain blocked.

Action 261 added a localhost bridge `GET /self-check` contract and stub so a local bridge can report self-check metadata without browser control. The default response reports `unavailable`; an optional mock-only response may report local mock diagnostics but must not claim Avanza dry-run capability.

Action 262 integrated localhost self-check results into the modal readiness checklist. `unavailable` remains not ready, `available_mock_only` is shown as mock-only and not Avanza dry-run ready, and `available_dry_run_only` can be displayed as runner self-check passed while still keeping broker submission disabled, final confirm disabled, and no run/start button.

Action 263 added a localhost bridge `POST /dry-run` endpoint contract and
non-executing server stub. It accepts a validated Avanza dry-run request shape,
runs request/capability safety validation, includes no executed diagnostics, and
returns `not_implemented` or `blocked` until a future runner is separately
approved.

Action 265 added a read-only handoff-modal preview for the `POST /dry-run`
stub response. The preview can display `not_implemented` and `blocked` response
metadata, but it does not change readiness, start a runner, navigate to Avanza,
submit orders, or create broker results.

Action 266 added a local dry-run runner skeleton module and the bridge mode
`AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton`. In that mode,
`/self-check` can report `available_dry_run_only` with `skeletonOnly` and
`noBrowserControl` metadata, and `/dry-run` can return `accepted_stub` for a
valid request. This is still a non-executing skeleton: no browser action,
Avanza URL, selector, final confirmation, broker result, Supabase write, or
trade mutation is added.

Action 269 added `docs/avanza-session-detection-only-design.md`, a
documentation-only design for a future session-readiness phase before
search-only or dry-run behavior. It permits only sanitized readiness detection
and explicitly forbids click, type, search, navigation, order-page access,
account-data reads, broker results, Supabase writes, and trade mutation.

Action 270 added `lib/avanza-session-detection-contract.ts`, a pure result
contract for that session-readiness phase. It models unavailable,
browser-not-connected, Avanza-not-visible, login-required,
ready-for-search-only, blocked, and failed states without adding browser
control, selectors, URLs, broker results, Supabase writes, or trade mutation.

Action 273 added `docs/avanza-search-only-phase-design.md`, a documentation-only
design for a future search-only phase after session detection. It scopes that
phase to sanitized instrument candidate lookup and keeps order pages,
buy/sell clicks, order-form fills, submissions, broker results, Supabase
writes, and trade mutation out of scope.

## Request Contract

File:

- `lib/avanza-dry-run-request-contract.ts`

Contract version:

- `AVANZA_DRY_RUN_REQUEST_CONTRACT_VERSION`

The request contract defines:

- `AvanzaDryRunAction`
- `AvanzaDryRunOrderMode`
- `AvanzaDryRunAccountPolicy`
- `AvanzaDryRunStopPolicy`
- `AvanzaDryRunInstrumentIdentity`
- `AvanzaDryRunOrderInput`
- `AvanzaDryRunRequestValidationResult`

Default values:

- `DEFAULT_AVANZA_DRY_RUN_ORDER_MODE = "advanced"`
- `DEFAULT_AVANZA_DRY_RUN_STOP_POLICY = "stop_at_confirmation_modal"`
- `DEFAULT_AVANZA_DRY_RUN_ACCOUNT_POLICY = "require_manual_review"`

Helpers:

- `createAvanzaDryRunOrderInput(...)`
- `validateAvanzaDryRunOrderInput(...)`
- `summarizeAvanzaDryRunOrderInput(...)`
- `isAvanzaDryRunSubmitBlocked(...)`
- `getAvanzaDryRunSafetyLabels(...)`

## Execution Intent Adapter

File:

- `lib/execution-intent-to-avanza-dry-run.ts`

The adapter defines:

- `ExecutionIntentToAvanzaDryRunInput`
- `ExecutionIntentToAvanzaDryRunResult`
- `buildAvanzaDryRunOrderInputFromExecutionIntent(...)`
- `summarizeExecutionIntentToAvanzaDryRunResult(...)`

Adapter behavior:

- extracts `buy` / `sell` from `ExecutionIntent.action`
- extracts ticker and market from `ExecutionIntent.trading_package`
- extracts quantity from `trading_package.quantity`
- extracts price from `limit_price`, with sell fallback to `target_price` then `stop_loss`
- carries `sourceRecommendationId` and `executionIntentId`
- forces Advanced order mode
- forces `stop_at_confirmation_modal`
- defaults account policy to `require_manual_review`
- adds safe metadata: `allowFinalSubmit=false`, `supportsBrokerSubmission=false`, `supportsFinalConfirmClick=false`, `automaticModeCapable=false`
- validates with `validateAvanzaDryRunOrderInput(...)`

Adapter failure cases:

- missing execution intent
- unsupported action
- missing ticker
- missing quantity
- missing price
- automatic execution mode
- authority that allows final submit
- authority that allows broker submission
- handoff that allows final order submit
- caller metadata attempting final submit, broker submission, final-confirm click, or automatic mode

## Modal Preview

The Execution Handoff Preview Modal can display a dev-only read-only dry-run request preview.

The preview shows:

- validation status
- action
- ticker
- instrument name when available
- quantity
- price
- order mode
- account policy
- stop policy
- source recommendation id
- execution intent id
- safety labels

Safety labels include:

- `Avanza dry-run only`
- `Advanced order mode`
- `Stop at confirmation modal`
- `No broker submission`
- `No final confirmation`
- `No broker result`
- `Final confirm disabled`
- `Manual account review`

The preview does not expose a run button, copy-to-run button, Avanza link, browser action, local storage write, broker result, Supabase write, or trade mutation.

## Readiness Checklist Panel

The Execution Handoff Preview Modal also shows a dev-only read-only readiness checklist.

The checklist includes:

- Dev tools enabled
- Execution mode is `semi_automatic`
- Avanza dry-run request is valid
- Default capability gate is blocked
- Dry-run capability can classify as `dry_run_only` only when explicitly allowed
- Broker submission disabled
- Final confirm disabled
- Automatic mode disabled
- Avanza runner implementation missing
- Avanza selectors/URLs missing intentionally
- User manual final confirmation required

Overall status is `Not ready to run` by default because no Avanza runner exists. Invalid requests, automatic mode, broker submission, or final-confirm authority are shown as blocking states. The panel has no run button and performs no browser or broker action.

Validation blocks:

- non-buy/sell actions
- unsupported order modes
- missing ticker
- non-positive or non-integer quantity
- non-positive price
- `require_exact_match` without `expectedAccountLabel`
- metadata with `allowFinalSubmit=true`
- metadata with `supportsBrokerSubmission=true`
- metadata with `supportsFinalConfirmClick=true`
- metadata with `automaticModeCapable=true`

Validation warns when instrument currency or market is missing because those values must be manually verified before any future dry-run.

## Capability Classification

A future Avanza dry-run runner would be classified as:

| Field | Required dry-run value |
| --- | --- |
| `targetEnvironment` | `avanza_broker` |
| `mockOnly` | `false` |
| `devOnly` | `true` initially |
| `supportsBrowserExecution` | `true` |
| `supportsBrokerSubmission` | `false` |
| `supportsFinalConfirmClick` | `false` |
| `automaticModeCapable` | `false` for the first dry-run |

This is intentionally not the same as `mock_order_page` capability. Mock-only execution can run against local mock pages. Avanza dry-run capability would touch a real broker UI but must still remain non-submitting and semi-automatic.

## Required Flags And Gates

A future Avanza dry-run may only be allowed when all of the following are true:

- execution dev tools are enabled
- `allowAvanzaDryRun=true` is explicitly passed to the capability gate
- execution mode is `semi_automatic`
- `allowBrokerSubmission=false`
- `allowFinalSubmit=false`
- `supportsBrokerSubmission=false`
- `supportsFinalConfirmClick=false`
- `automaticModeCapable=false`
- the user manually starts the dry-run
- the user is watching the browser throughout the run

The dry-run capability must not be inferred from UI state, environment defaults, or mock-agent success. It must be an explicit future gate.

## Allowed Dry-Run Actions

A future dry-run runner may:

- detect current session or login state only
- search for an instrument
- select a verified instrument
- open the buy or sell order page
- select or verify Advanced order mode
- fill quantity
- fill price
- click only `Granska köp` or `Granska sälj`
- read the confirmation modal
- verify confirmation values against the request
- report `waiting_for_manual_confirmation`
- stop without taking final action

Allowed actions must still pass the safe browser action contract before execution.

## Forbidden Dry-Run Actions

A future dry-run runner must not:

- click `Bekräfta köp`
- click `Bekräfta sälj`
- submit a form
- trigger keyboard `Enter` or `Space` submit behavior
- use automatic mode
- create `brokerResult`
- persist execution records
- mutate trades, live positions, History, or Statistics
- scrape balances or holdings
- store account credentials, cookies, session tokens, or browser storage
- change account unless the user explicitly reviews and approves the change
- continue after the final confirmation boundary

## Required Hard Stops

A future dry-run runner must stop when:

- final confirm is visible
- confirmation modal is verified
- a validation error appears
- instrument identity is ambiguous
- account is wrong or cannot be verified
- requested action is wrong
- price is wrong or stale
- quantity is wrong
- layout is unexpected
- login challenge or session timeout appears
- unsupported order tab is active
- market status or order state is uncertain
- safe action validation blocks an action
- capability validation returns anything other than an explicitly allowed dry-run result

Hard stop means no further click, fill, select, keyboard, or submit action is allowed.

## Diagnostics Requirements

Future Avanza dry-run diagnostics must include:

- `targetEnvironment: "avanza_broker"`
- `mockOnly: false`
- `dryRunOnly: true`
- `devOnly: true` initially
- `supportsBrokerSubmission: false`
- `supportsFinalConfirmClick: false`
- `automaticModeCapable: false`
- `finalConfirmBlocked: false` unless an attempted final-confirm action is blocked
- capability-gate validation result
- safe-action execution diagnostics
- stop reason

Diagnostics must not include:

- sensitive account identifiers
- balances or holdings
- credentials
- cookies, local storage, or session tokens
- raw DOM dumps
- screenshots unless sanitized
- broker confirmations represented as real `brokerResult`

## Capability Gate Expectations

`validateBrowserRunnerCapability(...)` should continue to block `avanza_broker` by default.

When a future caller explicitly passes `allowAvanzaDryRun=true`, an Avanza capability may validate as `dry_run_only` only if it has:

- `targetEnvironment: "avanza_broker"`
- `supportsBrokerSubmission: false`
- `supportsFinalConfirmClick: false`
- `automaticModeCapable: false`

Any broker submission support remains `real_broker_blocked`.

Any final-confirm click support remains `real_broker_blocked`.

Any unknown capability remains `unknown_blocked`.

Automatic mode remains out of scope for the first dry-run.

## Manual Test Protocol

Before the first future Avanza dry-run:

- complete a manual mapping session
- verify current Avanza UI against the mapping docs
- use a tiny, non-submitting scenario
- avoid high-risk market moments
- keep automatic execution off
- keep the user watching every step
- stop at the confirmation modal
- have the user cancel manually
- document results in `docs/avanza-manual-mapping-session-notes.md`

No dry-run should start unless the stop procedure is understood and the user has explicitly approved that specific session.

## Acceptance Criteria For Future Implementation

Before any Avanza dry-run runner can be enabled:

- capability gate supports `dry_run_only` classification
- dry-run request contract validates the intended order input
- Avanza dry-run remains blocked by default
- final-confirm block has tests
- safe action wrapper blocks final-confirm-like click/select actions
- diagnostics viewer labels dry-run clearly as Avanza dry-run, not broker execution
- no `brokerResult` is emitted
- no execution record is persisted
- no Supabase write occurs
- no trade state mutation occurs
- no History/Statistics update occurs
- run is user-triggered only
- user can observe the browser

## Recommended Next Action

Recommended:

- Action 263 - Avanza Dry-Run Safe Action Plan Contract

That action should remain pure planning/contract work for safe action planning. Do not implement Avanza automation, runtime URLs/selectors, browser runners, broker results, or order submission.
