# Avanza Dev-Only Preview Enablement Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_dev_only_preview_enablement_readiness_documented_no_enablement`

## 1. Current Status

The dev-only selectedRecommendation preview enablement readiness layer is
documented and modeled, but nothing is enabled.

Current state:

- default checklist output: `not_allowed`
- active/default source: `static_fixture`
- `explicitPreviewOnlyFlag`: false by default
- selectedRecommendation preview: disabled by default
- `selected_recommendation_preview_only`: not the default source
- controls: disabled
- pre-activation gate: locked
- total-read: unresolved/advisory

The `candidate_for_dev_preview` state exists only as a model/test state.

## 2. What Is Implemented

Implemented pieces:

- dev-only selectedRecommendation preview enablement plan
- pure dev/test-only preview flag config model
- pure dev-only preview enablement checklist integrated with the preview flag
  config model
- isolated dev-only preview enablement checklist panel
- isolated dev/test preview flag status panel
- pure dev-only preview enablement state builder
- default preview flag config with `explicitPreviewOnlyFlag: false`
- dev/test preview flag fixture state for tests only
- production-forbidden preview flag state
- default `not_allowed` checklist state
- candidate `candidate_for_dev_preview` model/test state
- default disabled enablement state
- production-forbidden blocked enablement state
- tests proving the candidate still forbids bridge/local fetch/execution
- docs linking the checklist and panel into the Avanza handoff planning thread

The checklist now accepts the preview flag config as explicit input and reflects
the flag source, flag value, environment scope, production-forbidden state,
`canEnableSelectedRecommendationPreview`, and bridge/local fetch/execution
prohibitions. The config model, checklist, checklist panel, and flag status
panel are not wired into `app/trade-app.tsx`.

`lib/avanza-dev-only-preview-enablement-state.ts` composes the preview flag
config, selectedRecommendation preview integration guard, pre-wiring checklist,
and dev-only preview enablement checklist into one UI-safe state. The default
state is `disabled`, the dev/test fixture can produce
`candidate_for_dev_preview`, and production-forbidden input returns `blocked`.
All states keep bridge calls, localhost fetch, and execution false.

`components/execution/AvanzaDevPreviewFlagStatusPanel.tsx` now accepts this
composed state as its primary prop and renders overall status, flag config,
integration guard status, pre-wiring checklist status, enablement checklist
status, render permission, bridge/local fetch/execution prohibitions, disabled
controls, and locked gate. The older explicit config plus checklist prop shape
remains available for isolated fixtures.

## 3. What Remains Disabled

The following remain disabled:

- selectedRecommendation preview by default
- `explicitPreviewOnlyFlag` in app code
- default source switch away from `static_fixture`
- active handoff controls
- Trade UI bridge calls
- Trade UI localhost fetches
- polling
- runner/fill invocation
- click/review/final/submit/order behavior
- credential/session handling
- Supabase execution writes

## 4. Default Behavior

Default behavior remains the existing preview-only Trade UI state:

- static fixture preview remains active
- selectedRecommendation preview remains disabled
- `explicitPreviewOnlyFlag` remains false
- source mode remains `static_fixture`
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory

No app code was changed to enable this checkpoint.

## 5. Candidate Behavior

The `candidate_for_dev_preview` state is available only as a pure model/test
fixture. It represents what a future dev/test preview-only state would need to
prove before any explicit flag work.

Candidate behavior still requires:

- integration guard allows preview-only
- pre-wiring checklist is `candidate_for_preview_only_wiring`
- proposed source is `selected_recommendation_preview_only`
- controls remain disabled
- pre-activation gate remains locked
- no bridge calls
- no localhost fetch
- no execution
- total-read remains advisory

It does not enable handoff execution.

## 6. Safety Guarantees

The current checkpoint preserves:

- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no click on `Granska köp`
- no review modal
- no final confirmation
- no submit
- no order placement
- no credential/session/BankID/cookie/storage handling
- no Supabase execution write
- total-read advisory
- disabled controls
- locked pre-activation gate

No state in this checkpoint is production readiness.

## 7. What Is Not Implemented

Not implemented:

- real dev/test preview flag wiring
- selectedRecommendation preview enabled by default
- active/default source switch to `selected_recommendation_preview_only`
- using the dev/test preview flag config in app code
- passing the dev/test preview flag config from app code into the checklist
- using the composed enablement state builder in app code
- rendering the dev-only checklist panel in the Trade UI
- rendering the dev/test preview flag status panel in the Trade UI
- a route for the checklist panel
- a route for the flag status panel
- active handoff button
- live bridge access from Trade UI
- fill-only runner invocation
- order review, confirmation, submit, or placement
- credential/session handling
- Supabase execution record writes

## 8. Next Recommended Step

Recommended next step:

1. Decide whether to consume the dev/test-only preview flag config in a
   separate controlled test path.
2. Keep the default false.
3. Keep selectedRecommendation preview disabled by default.
4. Keep controls disabled and the gate locked.
5. Keep no bridge calls, localhost fetches, execution, or order behavior.

Only after that should a separate action consider rendering the
selectedRecommendation preview path in a controlled dev/test mode.

## References

- [Avanza dev-only selectedRecommendation preview enablement plan](avanza-dev-only-selected-recommendation-preview-enablement-plan.md)
- [Avanza selected-recommendation preview-only milestone checkpoint](avanza-selected-recommendation-preview-only-milestone-checkpoint.md)
- [Avanza handoff architecture checkpoint](avanza-handoff-architecture-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
