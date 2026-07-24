# Avanza Trade UI Handoff Preview Plan

Date: 2026-07-04

Plan status:
`avanza_trade_ui_handoff_preview_planned`

## Purpose

Plan a future Trade UI handoff preview surface.

The preview should show a read-only Avanza handoff package in Trade UI using
output from the pure `buildAvanzaHandoffPackage` helper. The goal is to let the
user see what would be prepared for Avanza without adding Avanza/browser
control, bridge calls, order submission, or active handoff behavior.

This is planning only.

## Future Allowed Shape

A future `app/trade-app.tsx` change may build a handoff package only inside an
explicit disabled or dev-only path.

Allowed future behavior:

- derive a package through the pure handoff package builder
- render a passive read-only preview component
- display package fields for inspection
- show `canPrepareFill` only as metadata
- keep CTA controls disabled initially
- keep the gate locked

The future preview must not make `canPrepareFill` an active action.

## Required Future Preview Fields

The preview should show:

- ticker/symbol
- side
- quantity
- orderType
- limitPrice if present
- stopLoss if present
- target if present
- timeInForce if present
- accountLabel if safe/present
- confidence
- riskSummary
- warnings
- blockedReasons
- package status
- safety flags

## Required Future Statuses

The preview model should support:

- `preview_disabled`
- `package_unavailable`
- `package_blocked`
- `package_ready_read_only`
- `package_ready_fill_only_preview`

## Safety Boundary

Default Trade UI must remain visually unchanged until an explicit future wiring
step changes that boundary.

Forbidden in this planned phase:

- active handoff button
- active prepare button
- active buy/sell CTA
- bridge calls
- localhost fetch
- polling
- Avanza/browser control
- execution
- order submission
- click/review/final/submit behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution write
- production readiness claim

Required safety state:

- controls disabled
- gate locked
- no execution
- no bridge/fetch/polling
- no Avanza/browser control
- no order submission

## Implementation Sequence

Recommended future sequence:

1. Add a pure Trade UI handoff preview model.
2. Add static fixtures and an isolated harness.
3. Render the harness on the dev QA route as fixture/model-only content.
4. Add a pre-implementation checkpoint before touching `app/trade-app.tsx`.
5. Add default-off Trade UI preview wiring only inside an explicit disabled or
   dev-only path.

Every step must keep active handoff, prepare, bridge, browser, and order
behavior unavailable until separately planned and approved.

## Isolated Component Step

Status:
`avanza_trade_ui_handoff_preview_component_fixture_harness_added`

The first implementation step added an isolated read-only preview component,
static fixtures, and a fixture-only harness:

- `components/execution/AvanzaTradeUiHandoffPreview.tsx`
- `lib/avanza-trade-ui-handoff-preview-fixtures.ts`
- `components/execution/AvanzaTradeUiHandoffPreviewHarness.tsx`

The component accepts explicit preview model/result props only. It renders
disabled, unavailable, blocked, read-only ready, and fill-only preview metadata
states without calling the handoff package builder internally.

This step does not wire the preview into `app/trade-app.tsx`. It adds no
handoff button, prepare button, buy/sell CTA, bridge calls, localhost fetch,
polling, Avanza/browser control, order behavior, credential/session handling,
or Supabase execution writes.

## Dev QA Route Fixture Section

Status:
`avanza_trade_ui_handoff_preview_route_section_added_fixture_only`

The isolated harness is now rendered on the dev-only Avanza visual QA route:

- route: `app/dev/avanza-visual-qa/page.tsx`
- harness: `components/execution/AvanzaTradeUiHandoffPreviewHarness.tsx`
- fixtures: `lib/avanza-trade-ui-handoff-preview-fixtures.ts`

The route section renders static fixtures only and clearly labels the boundary
as fixture only, explicit input only, no Trade UI wiring, no bridge calls, no
localhost fetch, no polling, no Avanza/browser control, no execution, no order
submission, controls disabled, and gate locked.

This route section does not change `app/trade-app.tsx`, does not link from main
navigation, and does not add any active handoff, prepare, buy/sell CTA, order,
credential/session, or Supabase behavior.

## Minimal Hard-Disabled Trade UI Wiring

Status:
`avanza_trade_ui_handoff_preview_hard_disabled_trade_ui_wiring_added`

`app/trade-app.tsx` now imports and references
`AvanzaTradeUiHandoffPreview` only inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` branch. The flag remains
`false`, so the branch is unreachable by default and the default Trade UI
remains visually unchanged.

The hard-disabled branch builds a disabled handoff preview model with:

- `status: preview_disabled`
- `canProceedToHandoff: false`
- `canPrepareFill: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

The branch does not call the bridge, localhost, Avanza/browser paths, or
Supabase, and it adds no handoff button, prepare button, buy/sell CTA, order
behavior, credential/session handling, or production readiness claim.

## Phase Completion

Status:
`avanza_trade_ui_handoff_preview_phase_complete`

[Avanza Trade UI handoff preview phase completion checkpoint](avanza-trade-ui-handoff-preview-phase-completion-checkpoint.md)
closes this phase. It confirms the component, fixtures, harness, dev QA route
section, and minimal hard-disabled Trade UI wiring are complete while
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false and the normal
Trade UI remains visually unchanged.

Next phase:
[Avanza fill-only adapter contract plan](avanza-fill-only-adapter-contract-plan.md)
starts planning for a future fill-only adapter contract. It is planning-only
and adds no adapter implementation, bridge/local/browser call, active handoff,
order behavior, credential/session handling, or Supabase write.
