# Avanza Test-Only SelectedRecommendation Preview Activation Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_test_only_selected_recommendation_preview_activation_documented_no_runtime_enablement`

## 1. Current Status

The selectedRecommendation preview path can now be exercised in tests only,
without changing default Trade UI behavior.

Current default state:

- `explicitPreviewOnlyFlag`: false
- selectedRecommendation preview: disabled by default
- source mode: `static_fixture`
- controls: disabled
- pre-activation gate: locked
- total-read: unresolved/advisory

No `.env.local` path and no runtime environment path exists for enabling this.

## 2. What Changed

Implemented changes:

- `TradeApp` accepts
  `testOnlyAvanzaSelectedRecommendationPreviewDevConfig`
- the test-only config prop defaults to
  `avanzaSelectedRecommendationPreviewDevConfig`
- the default config remains `explicitPreviewOnlyFlag: false`
- the existing guarded selectedRecommendation preview derivation still runs only
  when the guard returns `preview_only_allowed`
- an isolated test-only harness can render the passive
  selectedRecommendation preview panel when explicitly given dev/test fixture
  config
- focused tests cover the full test-only chain from explicit dev/test config to
  passive selectedRecommendation preview state

This is a test activation path only. It is not a visible dev route, not a
runtime flag, and not a user-facing toggle.

## 3. Default Behavior

Default behavior remains unchanged:

- Trade UI renders the static fixture Avanza preview card
- selectedRecommendation preview does not render by default
- `explicitPreviewOnlyFlag` remains false
- no source-mode switch occurs by default
- controls remain disabled
- pre-activation gate remains locked

The default path does not read `.env.local`, does not read runtime environment
variables, and does not depend on operator-local configuration.

## 4. Test-Only Behavior

Tests may pass an explicit dev/test fixture config through
`testOnlyAvanzaSelectedRecommendationPreviewDevConfig`.

When the explicit fixture config allows preview rendering:

- the integration guard may return `preview_only_allowed`
- the preview source may become `selected_recommendation_preview_only`
- selectedRecommendation may be read only for preview-state derivation
- the passive selectedRecommendation preview panel may render
- selectedRecommendation-like fixture fields can flow into the preview state

Even in this test-only path:

- controls remain disabled
- pre-activation gate remains locked
- no bridge calls are allowed
- no localhost fetch is allowed
- no execution is allowed
- total-read remains advisory

## 5. Safety Guarantees

This checkpoint preserves:

- no `.env.local` path
- no runtime environment path
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
- disabled controls
- locked pre-activation gate
- total-read advisory

No state in this checkpoint claims execution readiness, production readiness, or
autonomous trading.

## 6. What Is Not Implemented

Not implemented:

- selectedRecommendation preview enabled by default
- runtime env config
- `.env.local` config
- visible dev route
- visible preview toggle
- active handoff button
- polling
- refresh outside Settings
- Trade UI bridge call
- Trade UI localhost fetch
- runner/fill invocation
- click/review/final/submit/order behavior
- credential/session handling
- Supabase execution write

## 7. Next Recommended Step

Recommended next decision:

1. Stop here with the test-only preview path complete, or
2. Plan an optional dev-only visible preview toggle or dev-only route.

If the second path is chosen, it must still be preview-only, keep controls
disabled, keep the gate locked, avoid runtime execution, and continue to forbid
bridge calls, localhost fetches, runner/fill invocation, clicks, review, final
confirmation, submit, order placement, credential/session handling, and
Supabase writes.

The final checkpoint for this phase is captured in
[Avanza test-only selectedRecommendation preview final checkpoint](avanza-test-only-selected-recommendation-preview-final-checkpoint.md).

## References

- [Avanza dev/test explicit preview flag wiring plan](avanza-dev-test-explicit-preview-flag-wiring-plan.md)
- [Avanza test-only selectedRecommendation preview final checkpoint](avanza-test-only-selected-recommendation-preview-final-checkpoint.md)
- [Avanza dev-only preview enablement final checkpoint](avanza-dev-only-preview-enablement-final-checkpoint.md)
- [Avanza selected-recommendation preview-only milestone checkpoint](avanza-selected-recommendation-preview-only-milestone-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
