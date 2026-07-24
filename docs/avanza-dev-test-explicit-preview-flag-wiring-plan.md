# Avanza Dev/Test Explicit Preview Flag Wiring Plan

Date: 2026-07-03

Plan status:
`avanza_dev_test_explicit_preview_flag_test_only_override_added_default_false`

## Purpose

This document defines the next possible step for wiring
`explicitPreviewOnlyFlag` in a dev/test-only way so selectedRecommendation
preview can render only when explicitly allowed.

This plan now records the first app-code preparation steps: a named
default-disabled dev/test preview config in Trade UI and a test-only override
path that can exercise the selectedRecommendation preview branch without
changing default behavior. It does not enable the flag by default and does not
enable handoff execution.

## Future Wiring Target

Future target:

- `app/trade-app.tsx`

The target may eventually derive selectedRecommendation preview state for
display only. The target must not call the bridge, fetch localhost, invoke a
runner, fill fields, click, review, confirm, submit, place orders, handle
credentials/session data, or write Supabase execution records.

## Current State

Current default state remains:

- `explicitPreviewOnlyFlag`: false
- named Trade UI config:
  `avanzaSelectedRecommendationPreviewDevConfig`
- optional test-only override prop:
  `testOnlyAvanzaSelectedRecommendationPreviewDevConfig`
- source mode: `static_fixture`
- selectedRecommendation preview: disabled by default
- controls: disabled
- pre-activation gate: locked
- total-read: unresolved/advisory

The existing Trade UI static fixture path remains the default.

The named config is built through `buildAvanzaDevPreviewFlagConfig(...)` with:

- `environmentScope: default`
- `explicitPreviewOnlyFlag: false`
- `source: default_disabled`
- no bridge calls
- no localhost fetch
- no execution

The optional test-only override defaults to the named disabled config. It is not
backed by `.env.local`, does not read `process.env`, and does not change the
runtime default.

## Future Dev/Test-Only Behavior

A future dev/test-only implementation may allow:

- an explicit preview config to allow selectedRecommendation preview derivation
- source mode to become `selected_recommendation_preview_only` only under the
  explicit dev/test config
- selectedRecommendation to be read only for preview-state derivation
- `AvanzaSelectedRecommendationPreviewStatePanel` to render passive preview
  state

Even in that future state:

- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory
- no result may imply execution readiness or production readiness

## Forbidden Behavior

The future wiring must still forbid:

- bridge calls
- localhost fetch from Trade UI
- polling
- trigger/fill runner
- click on `Granska köp`
- review modal
- final confirmation
- submit
- order placement
- credential/session/BankID/cookie/storage handling
- Supabase execution write
- production readiness claim

## Implementation Sequence

Current completed preparation:

1. Named default-disabled Trade UI config exists.
2. Optional test-only override prop exists and defaults to the disabled config.
3. Isolated test-only harness can render passive selectedRecommendation preview
   only with explicit dev/test fixture config.

The current activation checkpoint is captured in
[Avanza test-only selectedRecommendation preview activation checkpoint](avanza-test-only-selected-recommendation-preview-activation-checkpoint.md).

Recommended future sequence:

1. Keep the local dev/test explicit preview config source default disabled.
2. Feed the config into the dev-only enablement state builder in a future
   explicit action.
3. Keep the default `static_fixture` path unchanged.
4. Keep tests proving the default remains `static_fixture`.
5. Add tests proving explicit dev/test config can render selectedRecommendation
   preview.
6. Keep all controls disabled and the pre-activation gate locked.

Steps after the named default-disabled config must be implemented only in a
separate explicit action.

## Validation Expectations

Future validation should prove:

- no `.env.local` changes
- no live endpoint strings in Trade UI code
- no exact trigger phrase in UI/client code
- no enabled handoff controls
- no bridge calls
- no localhost fetch calls
- default behavior remains `static_fixture`
- selectedRecommendation preview is rendered only behind explicit dev/test
  config
- controls remain disabled
- pre-activation gate remains locked

## References

- [Avanza dev-only preview enablement final checkpoint](avanza-dev-only-preview-enablement-final-checkpoint.md)
- [Avanza dev-only preview enablement checkpoint](avanza-dev-only-preview-enablement-checkpoint.md)
- [Avanza selected-recommendation preview-only milestone checkpoint](avanza-selected-recommendation-preview-only-milestone-checkpoint.md)
- [Avanza test-only selectedRecommendation preview activation checkpoint](avanza-test-only-selected-recommendation-preview-activation-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
