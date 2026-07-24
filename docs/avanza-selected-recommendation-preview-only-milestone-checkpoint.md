# Avanza Selected-Recommendation Preview-Only Milestone Checkpoint

Date: 2026-07-03

Milestone status:
`avanza_selected_recommendation_preview_only_preparation_complete_default_disabled`

## 1. Phase Status

The selected-recommendation preview-only preparation phase is complete as a
locked, default-disabled Trade UI capability.

The current default remains:

- active source: `static_fixture`
- selectedRecommendation preview: disabled by default
- config: `explicitPreviewOnlyFlag: false`
- controls: disabled
- pre-activation gate: locked
- total-read: unresolved/advisory

This checkpoint does not enable handoff, bridge access, or execution.

## 2. What Is Implemented

The preparation phase includes:

- selectedRecommendation adapter
- derived preview-state helper
- selectedRecommendation preview integration guard
- pre-wiring checklist
- pre-wiring checklist panel for isolated test/dev visibility
- no-wiring safety assertion for the Trade UI Avanza preview path
- guarded Trade UI derivation path
- Trade UI integration status label
- selectedRecommendation preview state scenario fixtures
- adapter-based selectedRecommendation fixtures
- fixture-only scenario gallery
- fixture-only scenario gallery harness

The guarded derivation path can model selectedRecommendation preview-only state
without side effects, but the default guard keeps it inactive.

## 3. What Remains Default-Disabled

The following remain disabled by default:

- selectedRecommendation preview derivation
- `selected_recommendation_preview_only` source mode
- any non-static preview source in the Trade UI
- any handoff control
- any bridge or localhost interaction from the Trade UI
- any execution path

Default Trade UI rendering continues to use the static GameStop fixture path.

## 4. Current Trade UI Behavior

The Trade UI shows the Avanza handoff preview as display-only context.

The default integration status label shows:

- `Avanza preview source: static fixture`
- `selectedRecommendation preview: disabled`
- `No bridge calls`
- `No execution`

The preview card remains fixture-backed. The selectedRecommendation modal state
may still exist for existing Trade UI behavior, but it does not drive the
default Avanza preview card.

## 5. Guarded selectedRecommendation Preview Behavior

The guarded path is non-default. It can only run when an explicit preview-only
guard/config allows it.

When allowed in controlled tests or a future explicit step, the path may:

- derive a selectedRecommendation preview state
- use `selected_recommendation_preview_only` as a preview source
- render preview-only state
- show controls disabled
- show the pre-activation gate locked

It still must not imply execution readiness, production readiness, or order
placement capability.

## 6. Safety Guarantees

The current phase preserves these boundaries:

- no bridge calls
- no localhost fetch from Trade UI
- no polling
- no runner/fill invocation
- no trigger phrase
- no click on `Granska köp`
- no review modal
- no final confirmation
- no submit
- no order placement
- no credential, session, BankID, cookie, localStorage, or sessionStorage
  handling
- no Supabase execution write
- total-read remains advisory
- controls remain disabled
- pre-activation gate remains locked

The no-wiring safety assertion now allows guarded preview-only derivation while
still blocking unguarded selectedRecommendation wiring into the Avanza preview
path.

## 7. What Is Still Not Implemented

The following are still not implemented:

- selectedRecommendation preview enabled by default
- active/default source switch away from `static_fixture`
- active handoff button
- dev-only enablement flag wiring for actual preview activation
- Trade UI bridge calls
- Trade UI localhost fetches
- live runner/fill endpoint invocation
- click/review/final/submit/order behavior
- credential/session/storage handling
- Supabase execution records
- production-ready or autonomous trading flow

## 8. Next Phase Recommendation

Recommended next phase:

1. Dev-only preview enablement candidate planning.
2. Explicit preview-only flag wiring, if wanted, while keeping controls disabled
   and the gate locked.
3. Only later, separate fill-only invocation planning.

Any later step must keep total-read advisory visible, preserve manual review in
Avanza, and avoid production-readiness claims.

## References

- [Avanza handoff architecture checkpoint](avanza-handoff-architecture-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
- [Avanza selected-recommendation preview-only wiring plan](avanza-selected-recommendation-preview-only-wiring-plan.md)
- [Avanza selected-recommendation wiring boundary plan](avanza-selected-recommendation-wiring-boundary-plan.md)
- [Avanza handoff dev-only enablement plan](avanza-handoff-dev-only-enablement-plan.md)
