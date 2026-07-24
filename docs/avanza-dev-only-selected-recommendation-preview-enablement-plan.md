# Avanza Dev-Only Selected-Recommendation Preview Enablement Plan

Date: 2026-07-03

Plan status:
`avanza_dev_only_selected_recommendation_preview_enablement_candidate_plan_added`

Follow-up status:
`avanza_dev_only_selected_recommendation_preview_enablement_checklist_added`

Follow-up status:
`avanza_dev_only_selected_recommendation_preview_enablement_checklist_panel_added`

## Purpose

This plan defines a possible future dev/test-only step for enabling
selectedRecommendation preview derivation in the Trade UI.

This is preview enablement only. It is not handoff execution, not broker
automation, not an order action, and not production readiness.

## Current Default

The current default remains unchanged:

- source mode: `static_fixture`
- config: `explicitPreviewOnlyFlag: false`
- selectedRecommendation preview: disabled by default
- controls: disabled
- pre-activation gate: locked
- total-read: unresolved/advisory

This plan does not change app code or enable the flag.

## Future Preview-Only Behavior That May Be Enabled

A later explicit implementation may allow the following in dev/test only:

- set an explicit local/dev preview config so `explicitPreviewOnlyFlag` is true
- switch the preview source to `selected_recommendation_preview_only`
- read selectedRecommendation only for preview-state derivation
- derive preview state through the existing pure helper chain
- render `AvanzaSelectedRecommendationPreviewStatePanel`
- keep all controls disabled
- keep the pre-activation gate locked
- keep total-read unresolved/advisory

The output must remain preview-only and not execution-ready.

## What Must Remain Forbidden

Even if dev/test preview derivation is enabled, these remain forbidden:

- bridge calls
- localhost fetch from Trade UI
- polling
- trigger/fill runner invocation
- trigger phrase usage
- click on `Granska köp`
- review modal opening
- final confirmation
- submit
- order placement
- credential, session, BankID, cookie, localStorage, or sessionStorage handling
- Supabase execution write
- production readiness claim
- autonomous trading claim

## Prerequisites

Before any future dev/test preview enablement:

- integration guard must return `preview_only_allowed`
- pre-wiring checklist must return `candidate_for_preview_only_wiring`
- dev-only preview enablement checklist must return
  `candidate_for_dev_preview`
- source indicator must show selectedRecommendation preview-only
- UI must show preview-only / not execution-ready copy
- disabled controls must be covered by tests
- pre-activation gate must remain locked
- total-read must remain advisory
- static fixture default must remain tested

## Dev-Only Preview Enablement Checklist

`lib/avanza-dev-only-preview-enablement-checklist.ts` defines the pure checklist
for this future step. It consumes the selectedRecommendation preview integration
guard, pre-wiring checklist, proposed source mode, pre-activation gate, and
safety boundary summary.

The default checklist returns `not_allowed` because the current state is still:

- default source: `static_fixture`
- `explicitPreviewOnlyFlag`: false
- selectedRecommendation preview integration guard: disabled

A test/dev candidate can return `candidate_for_dev_preview` only when the
explicit preview-only guard is allowed, the pre-wiring checklist is already a
candidate, the proposed source is `selected_recommendation_preview_only`, the
gate remains locked, controls remain disabled, and the safety boundaries still
forbid bridge calls, localhost fetches, execution, runner/fill invocation, and
order actions.

The helper is pure, side-effect free, and not wired into `app/trade-app.tsx`.

## Isolated Checklist Panel

`components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx` renders
the dev-only preview enablement checklist for isolated test/dev visibility. The
panel accepts the checklist model as props and shows the summary status, label,
reason, blockers, advisories, rows, and the safety copy for static fixture
default, selectedRecommendation preview disabled by default, no bridge calls, no
localhost fetch, no execution, disabled controls, and locked gate.

The panel is not rendered in `app/trade-app.tsx`, has no route, has no active
controls, does not fetch, does not call the bridge, does not read app state, and
does not enable selectedRecommendation preview.

## Validation Expectations

A future implementation must prove:

- default Trade UI still renders `static_fixture`
- default config still keeps `explicitPreviewOnlyFlag: false`
- selectedRecommendation preview is not the default path
- dev/test preview-only path can be tested explicitly
- no live endpoint strings appear in Trade UI code
- no exact trigger phrase appears in Trade UI code
- no enabled handoff control exists
- no bridge, localhost, polling, trigger, fill, click, review, final, submit, or
  order path is introduced

## Recommended Implementation Sequence

1. Add an explicit local dev/test preview flag fixture with default false.
2. Add tests proving default remains `static_fixture`.
3. Add tests proving the dev preview path renders selectedRecommendation
   preview when explicitly allowed.
4. Keep controls disabled and the pre-activation gate locked.
5. Update the architecture checkpoint and milestone docs.

## Non-Goals

This plan does not enable:

- selectedRecommendation preview by default
- handoff execution
- live fill-only runner invocation
- Trade UI bridge access
- production readiness
- order placement

## References

- [Avanza selected-recommendation preview-only milestone checkpoint](avanza-selected-recommendation-preview-only-milestone-checkpoint.md)
- [Avanza handoff architecture checkpoint](avanza-handoff-architecture-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
- [Avanza selected-recommendation wiring boundary plan](avanza-selected-recommendation-wiring-boundary-plan.md)
- [Avanza handoff dev-only enablement plan](avanza-handoff-dev-only-enablement-plan.md)
