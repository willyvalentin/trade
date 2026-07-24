# Avanza Hard-Disabled Source-To-Preview Integration Plan

Date: 2026-07-04

Plan status:
`avanza_hard_disabled_source_to_preview_integration_model_added_unwired`

## Purpose

This plan defines a future source extraction to preview model connection for
Avanza selectedRecommendation preview, while keeping the path hard-disabled by
the existing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false` guard.

The planned integration is:

- read-only only
- no default visibility
- no active controls
- no handoff
- no bridge calls
- no execution

The goal is to describe how source extraction could later feed the Trade UI
read-only selectedRecommendation preview model without enabling the preview or
activating any trading behavior.

## Strict Phase Boundary

This task is planning only.

This phase does not:

- change app code
- change `app/trade-app.tsx`
- wire source extraction into Trade UI
- connect source extraction to the preview model
- connect real selectedRecommendation input
- enable preview
- change `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- derive previewState from app or route state
- add runtime environment configuration
- add localStorage or sessionStorage enablement
- add visible toggles
- add active controls
- add execution behavior

## Allowed Future Integration Shape

A future implementation may be considered only inside the already hard-disabled
branch guarded by `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`.

Allowed future shape:

1. The source extraction helper receives an explicitly passed
   selectedRecommendation-like candidate.
2. The source extraction result is passed to a pure adapter or mapper.
3. The adapter or mapper calls, or builds input for, the Trade UI read-only
   selectedRecommendation preview model.
4. The passive preview component receives only a `modelResult`.
5. Every branch keeps `canProceedToHandoff` false.
6. Every branch keeps controls disabled.
7. Every branch keeps the pre-activation gate locked.

The future implementation must remain read-only and passive even when test-only
fixtures exercise the hard-disabled branch.

## Disallowed Integration Shape

The future integration must not use:

- env-based enablement
- runtime env config
- localStorage enablement
- sessionStorage enablement
- visible toggle
- automatic runtime activation
- implicit app state reads
- route state reads
- React context or global discovery
- fetch, search, or discovery behavior
- polling
- refresh outside existing app behavior
- bridge calls
- localhost calls
- Supabase writes
- handoff button
- prepare button
- buy/sell CTA
- runner/fill/click/review/final/submit/order behavior
- credential/session/BankID/cookies/storage handling

## Required Future Statuses

A future source-to-preview integration model should expose these statuses:

- `integration_disabled`
- `source_not_ready`
- `source_ready_preview_blocked`
- `preview_model_ready_read_only`
- `integration_blocked`

## Required Future Output Model

A future output model should include:

- `status`
- `label`
- `reason`
- `sourceStatus`
- `previewModelStatus`
- `modelResult`, only when `preview_model_ready_read_only`
- `canRenderPreview`, false unless inside the hard-disabled/test-only branch
- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

No output may imply order readiness, handoff readiness, execution readiness, or
production readiness.

## Source-To-Preview Safety Rules

`source_ready_read_only` may allow preview-model input only. It must not allow
handoff.

The preview model output must remain read-only.

`selectedRecommendationLikeInput` must stay sanitized and minimal.

`normalizedSourceSummary` must exclude:

- credentials
- account identifiers beyond safe display requirements
- session values
- cookies
- browser storage values
- broker secrets
- BankID state
- execution records

No broker-specific session data may flow into the preview model, and no
order-ready state may be produced.

## Future Test Requirements

Future implementation tests must prove:

- integration disabled returns `integration_disabled`
- no source returns `source_not_ready`
- blocked or invalid source returns `source_not_ready` or `integration_blocked`
- ready source can produce `preview_model_ready_read_only` only inside the
  hard-disabled/test-only branch
- `modelResult` exists only for `preview_model_ready_read_only`
- `canProceedToHandoff` is false for all statuses
- all outputs forbid bridge/local fetch/polling/execution
- controls are disabled for all outputs
- gate is locked for all outputs
- Trade UI default remains visually unchanged
- selectedRecommendation preview remains disabled by default
- no active handoff button exists
- no prepare button exists
- no buy/sell CTA exists

## Recommended Implementation Sequence

1. Add this integration plan.
2. Add a hard-disabled source-to-preview pre-implementation checkpoint.
3. Add a pure source-to-preview integration model/helper.
4. Add fixtures and an isolated harness for the integration model.
5. Render the integration harness on the dev QA route as fixture/model-only.
6. Add an integration phase checkpoint.
7. Only later consider hard-disabled Trade UI branch wiring.

Every step must keep preview disabled by default, avoid real runtime activation,
avoid handoff, avoid bridge/local calls, avoid Supabase writes, and avoid
execution.

## Pre-Implementation Checkpoint Follow-Up

Checkpoint status:
`avanza_hard_disabled_source_to_preview_integration_pre_implementation_checkpoint_added`

`docs/avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md`
now records the go/no-go boundary before implementing the pure
source-to-preview integration model/helper. It permits only a future pure helper
with explicit inputs and still forbids Trade UI wiring, source extraction to
preview model connection in this task, real selectedRecommendation input,
preview enablement, app or route previewState derivation, bridge/fetch/polling,
handoff, and execution.

## Pure Model/Helper Implementation Follow-Up

Implementation status:
`avanza_hard_disabled_source_to_preview_integration_model_added_unwired`

`lib/avanza-hard-disabled-source-to-preview-integration.ts` now provides the
pure hard-disabled source-to-preview integration model/helper. It accepts
explicit inputs only, models the path from a source extraction result to the
Trade UI read-only selectedRecommendation preview model, and keeps every output
non-executing.

The helper remains:

- not wired into `app/trade-app.tsx`
- not wired into `app/dev/avanza-visual-qa/page.tsx`
- disconnected from real selectedRecommendation state
- disabled unless an explicit model/test input passes `integrationEnabled: true`
- unable to proceed to handoff
- unable to call bridge, fetch localhost, poll, execute, or enable controls

The ready status is limited to `preview_model_ready_read_only`, and
`modelResult` is emitted only for that status.

## Fixture/Harness Follow-Up

Fixture status:
`avanza_hard_disabled_source_to_preview_integration_fixtures_added_unwired`

`lib/avanza-hard-disabled-source-to-preview-integration-fixtures.ts` now covers
all five integration statuses:

- `integration_disabled`
- `source_not_ready`
- `source_ready_preview_blocked`
- `preview_model_ready_read_only`
- `integration_blocked`

`components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness.tsx`
renders those fixtures as isolated, explicit-input, model-only content. The
harness is not rendered in `app/trade-app.tsx`, is not rendered in
`app/dev/avanza-visual-qa/page.tsx`, and does not connect source extraction to
real app state or real selectedRecommendation input.

## Route Section Plan Follow-Up

Route section plan status:
`avanza_hard_disabled_source_to_preview_integration_route_section_planned_only`

`docs/avanza-hard-disabled-source-to-preview-integration-route-section-plan.md`
defines how the isolated integration harness is rendered on the dev-only visual
QA route as fixture/model-only content. The plan does not wire the harness into
Trade UI, does not connect real selectedRecommendation input, and does not
derive previewState from app or route state.

`docs/avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md`
recorded the go/no-go boundary before that route section was implemented. It
permitted only fixture/model-only dev-route rendering and still forbids Trade UI
wiring, real selectedRecommendation reads, preview enablement, app/route
previewState derivation, bridge/fetch/polling, handoff, and execution.

## Route Section Rendered Follow-Up

Route section status:
`avanza_hard_disabled_source_to_preview_integration_route_section_rendered_fixture_only`

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaHardDisabledSourceToPreviewIntegrationHarness` with static
`avanzaHardDisabledSourceToPreviewIntegrationFixtures` only. The section is
fixture/model-only, unlinked from main navigation, disconnected from Trade UI,
and disconnected from real selectedRecommendation input.

The route section makes all five integration statuses visible:

- `integration_disabled`
- `source_not_ready`
- `source_ready_preview_blocked`
- `preview_model_ready_read_only`
- `integration_blocked`

`preview_model_ready_read_only` remains read-only/model-only, `modelResult` is
visible only for that status, and all statuses keep handoff, bridge/local
fetch, polling, execution, active controls, and unlocked gates disabled.

## Route Section Checkpoint Follow-Up

`docs/avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md`
now records the completed dev-route section. It confirms
`app/dev/avanza-visual-qa/page.tsx` renders
`AvanzaHardDisabledSourceToPreviewIntegrationHarness` with only static
`avanzaHardDisabledSourceToPreviewIntegrationFixtures`, keeps the route
fixture/model-only and unlinked from main navigation, keeps `app/trade-app.tsx`
outside the integration, keeps real selectedRecommendation input disconnected,
keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, and adds no
active controls, handoff, prepare, buy/sell CTA, bridge/fetch/polling, order
behavior, credential/session handling, or Supabase write.

## Phase Completion Checkpoint Follow-Up

`docs/avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md`
now closes the hard-disabled source-to-preview integration planning/model phase.
It confirms the helper is pure and explicit-input only, fixtures cover all five
statuses, the harness is isolated and fixture-only, and the dev route section is
rendered as fixture/model-only while Trade UI remains unwired.

## Current Non-Implementation Confirmation

Current state remains:

- source-to-preview integration is implemented only as a pure unwired model
- source extraction remains not wired into Trade UI
- source extraction remains not connected to the preview model
- real selectedRecommendation input is not connected, read, or rendered
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- selectedRecommendation preview remains disabled by default in Trade UI
- no previewState is derived from app or route state
- no active controls, handoff button, prepare button, or buy/sell CTA exists
- no bridge/fetch/polling/order behavior exists
- no credential/session handling exists
- no Supabase execution write exists

## References

- [Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
- [Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Hard-Disabled Trade UI Branch Wiring Plan Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-plan.md` now plans the future
Trade UI branch-only shape. The plan allows a later integration helper call
only inside the existing false-guarded
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` branch, with explicit inputs
only and default/static safe input only for the first branch phase.

The plan still forbids preview enablement, runtime activation, real
selectedRecommendation reads, app or route previewState derivation,
bridge/local fetch/polling, handoff, prepare, buy/sell CTA, order behavior,
credentials, sessions, and Supabase writes.

The pre-implementation checkpoint at
`docs/avanza-hard-disabled-trade-ui-branch-wiring-pre-implementation-checkpoint.md`
permits the next implementation task to touch `app/trade-app.tsx` minimally,
but only for a hard-disabled branch-only call with default/static safe inputs
and unchanged default Trade UI behavior.

That minimal branch-only call is now implemented. The integration helper is
called only inside the existing false-guarded branch with `integrationEnabled:
false` and static safe inputs, so the default output remains
`integration_disabled`, no `modelResult` renders by default, source extraction
remains unwired, and no real selectedRecommendation input is read.

## Hard-Disabled Trade UI Branch Wiring Safety Audit Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md` now verifies
the branch-only integration remains hard-disabled, unreachable by default,
read-only, static-input only, visually unchanged, and non-executable. It also
confirms no bridge calls, localhost fetch, polling, runner/fill invocation,
order behavior, credential/session handling, or Supabase execution write was
added.

## Hard-Disabled Trade UI Branch Wiring Checkpoint Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md` now records the
minimal branch-only helper call in `app/trade-app.tsx`. The checkpoint keeps the
integration hard-disabled, static-input only, visually unchanged by default, and
non-executable.

## Hard-Disabled Trade UI Branch Wiring Phase Completion Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md`
now marks the minimal branch wiring phase complete. The next recommended phase
is test-only enabled branch planning with static fixture input only and still
no real selectedRecommendation input, runtime activation, handoff, bridge,
localhost fetch, polling, or execution.
