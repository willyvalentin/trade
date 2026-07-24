# Avanza Handoff Package Builder Plan

Date: 2026-07-04

Plan status:
`avanza_handoff_package_builder_implemented`

## Purpose

Plan a future pure handoff package builder for Avanza.

The builder should create a structured handoff package from a validated
recommendation or read-only connection result. The package may prepare data for
a future Avanza fill-only agent, but this plan does not add browser control,
bridge calls, localhost calls, polling, order submission, or execution.

This is planning only.

## Phase Boundary

The future builder must be pure and side-effect free.

It must not:

- control a browser
- call bridge endpoints
- call localhost endpoints
- fetch or poll
- click, review, finalize, submit, or place an order
- handle credentials, sessions, cookies, BankID, browser storage, or broker secrets
- write Supabase execution records
- claim production readiness

## Future Helper Shape

Future helper name may be similar to:

`buildAvanzaHandoffPackage`

Expected future input options:

- selectedRecommendation/read-only connection output
- explicit recommendation candidate
- risk and readiness summary
- optional non-sensitive account label

Expected future output:

- handoff package status
- optional package when safe
- warnings
- blocked reasons
- safety booleans

## Future Statuses

The future builder should support these statuses:

- `handoff_disabled`
- `source_unavailable`
- `source_invalid`
- `risk_blocked`
- `handoff_ready_read_only`
- `handoff_ready_fill_only`

`handoff_ready_fill_only` must still not execute anything by itself. It should
only describe that a package is structurally ready for a later fill-only
contract.

## Future Package Fields

A future handoff package may include:

- `packageId`
- `createdAt`
- `ticker` or `symbol`
- `side`: `BUY` or `SELL`
- `quantity`
- `orderType`
- `limitPrice` if applicable
- `stopLoss` if applicable
- `target` if applicable
- `timeInForce` if applicable
- `accountLabel` if available and non-sensitive
- `sourceRecommendationId`
- `confidence`
- `riskSummary`
- `warnings`
- `blockedReasons`

The package must not include account ids, credentials, cookies, BankID/session
metadata, broker secrets, or Supabase execution records.

## Required Safety Defaults

The future builder must keep these defaults:

- `canProceedToHandoff` false by default
- `canCallBridge` false
- `canFetchLocalhost` false
- `canPoll` false
- `canExecute` false
- `controlsEnabled` false
- `gateLocked` true

## Data Safety Requirements

The future builder may use only explicit recommendation-like input or
read-only connection output.

It must exclude:

- account ids
- credentials
- cookies
- BankID/session metadata
- broker secrets
- Supabase execution write data
- browser storage data
- order submission metadata

If an account reference is needed for display, it must be a non-sensitive
`accountLabel` only.

## Test Requirements

Future tests should prove:

- disabled input returns `handoff_disabled`
- missing source returns `source_unavailable`
- invalid source returns `source_invalid`
- risk-blocked input returns `risk_blocked`
- read-only ready input returns `handoff_ready_read_only`
- fill-only ready fixture returns `handoff_ready_fill_only`
- safety booleans remain false except `gateLocked: true`
- package excludes sensitive account/session/credential data
- no bridge/local fetch/polling/execution strings exist
- no active handoff, prepare, buy/sell, review, final, submit, or order behavior exists

## Implementation Sequence

Recommended later sequence:

1. Add pure handoff package builder helper.
2. Add fixtures and tests.
3. Add dev QA route harness if useful.
4. Add Trade UI handoff preview, still disabled.
5. Define fill-only adapter contract.
6. Add dry-run fill-only agent.

Every step must keep active execution forbidden until a separate explicit phase
changes that boundary.

## Current Relationship To Trade UI

The current Trade UI remains default-disabled.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

The hard-disabled real-source branch remains unreachable by default.

## Implementation Checkpoint

`lib/avanza-handoff-package-builder.ts` now implements the pure
`buildAvanzaHandoffPackage` helper.

The helper accepts explicit arguments only:

- `handoffEnabled`
- `mode`
- `recommendationCandidate`
- `connectionResult`
- `side`
- `accountLabel`
- `now`

It can return:

- `handoff_disabled`
- `source_unavailable`
- `source_invalid`
- `risk_blocked`
- `handoff_ready_read_only`
- `handoff_ready_fill_only`

Ready results include a whitelisted package only. The package may include
`packageId`, `createdAt`, `ticker`, `symbol`, `side`, `quantity`, `orderType`,
`limitPrice`, `stopLoss`, `target`, `timeInForce`, `accountLabel`,
`sourceRecommendationId`, `confidence`, `riskSummary`, `warnings`, and
`blockedReasons`.

The helper excludes credential, session, cookie, storage, account id, broker
secret, browser, and Supabase execution fields.

`handoff_ready_fill_only` means the data package is structurally ready for a
future fill-only contract. It does not call bridge, browser, localhost, Avanza,
Supabase, or order paths.

The helper keeps:

- `canProceedToHandoff` false
- `canCallBridge` false
- `canFetchLocalhost` false
- `canPoll` false
- `canExecute` false
- `controlsEnabled` false
- `gateLocked` true

`canPrepareFill` is true only for `handoff_ready_fill_only`, and it is only a
model flag for future fill-only contract planning.

The helper is not wired into Trade UI.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

The hard-disabled real-source branch remains unreachable by default.

## Fixture And Harness Checkpoint

`lib/avanza-handoff-package-builder-fixtures.ts` now provides static fixture
states for the pure builder.

The fixtures cover:

- `handoff_disabled`
- `source_unavailable`
- `source_invalid`
- `risk_blocked`
- `handoff_ready_read_only`
- `handoff_ready_fill_only`
- valid BUY package
- valid SELL package
- invalid quantity
- missing ticker
- missing or unsafe price when required
- expired recommendation
- stale recommendation warning
- missing target warning

`components/execution/AvanzaHandoffPackageBuilderHarness.tsx` now renders those
fixtures as an isolated passive harness.

The harness is fixture-only and explicit-input-only. It shows package fields for
ready states, including `packageId`, `ticker`, `symbol`, `side`, `quantity`,
`orderType`, `limitPrice`, `stopLoss`, `target`, `timeInForce`, `accountLabel`,
`sourceRecommendationId`, `confidence`, `riskSummary`, `warnings`, and
`blockedReasons`.

The fixture and harness layer is now rendered on
`app/dev/avanza-visual-qa/page.tsx` as a fixture/model-only dev QA section.
It uses only `avanzaHandoffPackageBuilderFixtures`.

It is not rendered in `app/trade-app.tsx` and does not add any Trade UI wiring.

It keeps:

- no bridge calls
- no localhost fetch
- no polling
- no Avanza/browser control
- no execution
- no order submission
- controls disabled
- gate locked
- no credential/session/cookie/storage/account id/broker secret output
- no Supabase execution write

## Dev Route Section Checkpoint

The dev-only Avanza visual QA route now includes an Avanza handoff package
builder section.

The section shows:

- `handoff_disabled`
- `source_unavailable`
- `source_invalid`
- `risk_blocked`
- `handoff_ready_read_only`
- `handoff_ready_fill_only`
- valid BUY package fixture
- valid SELL package fixture
- invalid quantity fixture
- missing ticker fixture
- missing price fixture
- expired recommendation fixture
- stale and missing target warning fixture

Ready package rows expose package fields for inspection only. The fill-only
fixture can show `canPrepareFill: true`, but `canExecute` remains false,
controls remain disabled, and the gate remains locked.

The route remains unlinked from main navigation and remains fixture/model-only.

## Phase Completion And Next Plan

[Avanza handoff package builder phase completion checkpoint](avanza-handoff-package-builder-phase-completion-checkpoint.md)
closes this phase. It confirms the pure helper, fixtures, isolated harness, and
dev QA route fixture/model-only section are complete while Trade UI remains
unwired and non-executable.

[Avanza Trade UI handoff preview plan](avanza-trade-ui-handoff-preview-plan.md)
starts the next planning phase. That plan is limited to a future passive
read-only Trade UI handoff package preview. It does not add handoff,
preparation, bridge calls, Avanza/browser control, order submission,
credential/session handling, or Supabase writes.
