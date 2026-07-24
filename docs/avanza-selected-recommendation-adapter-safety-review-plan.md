# Avanza SelectedRecommendation Adapter Safety Review Plan

Date: 2026-07-03

Plan status:
`avanza_selected_recommendation_adapter_safety_review_plan_added`

## Purpose

This plan defines the safety review required before any actual invocation of
the selectedRecommendation adapter or derived-preview builder in the read-only
selectedRecommendation dev preview path.

This is planning only. It does not call the adapter, does not call the
derived-preview builder, does not read real selectedRecommendation state, does
not derive real preview state, and does not render real preview state.

## Review Targets

The safety review should cover:

- `lib/avanza-selected-recommendation-adapter.ts`
- `lib/avanza-selected-recommendation-derived-preview-state.ts`
- `lib/avanza-selected-recommendation-preview-state.ts`
- `lib/avanza-selected-recommendation-preview-integration-guard.ts`
- `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts`

## Review Goals

The review should confirm or document:

- helpers are pure, or any side effects are identified
- no fetch, bridge, localhost, polling, execution, or Supabase writes exist
- no trigger/fill/click/review/final/submit/order behavior exists
- no credential/session/BankID/cookies/storage handling exists
- invalid and missing input handling is explicit and safe
- output remains read-only
- output is safe for disabled-controls and gate-locked presentation
- total-read remains advisory
- no production readiness claim is introduced

## Review Checklist

1. Imports and side effects
2. Runtime/env access
3. Network/fetch/bridge/localhost references
4. Adapter input validation
5. Derived-preview failure handling
6. Preview state output shape
7. Control/gate semantics
8. Source-mode labeling
9. Test coverage requirements
10. Safety guard coverage

## Allowed Future Outcome

If the adapter is confirmed pure and safe, a later task may add a pure
integration wrapper.

That future wrapper must:

- use explicit input only
- remain dev-only/read-only
- keep controls disabled
- keep the pre-activation gate locked
- keep total-read advisory
- avoid bridge calls
- avoid localhost fetches
- avoid polling
- avoid execution
- avoid Supabase execution writes

That wrapper planning step is now captured in
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md`.
It keeps the future first implementation limited to a pure wrapper module and
static fixtures, with no route wiring, no Trade UI wiring, no real
selectedRecommendation read, and no real preview derivation.

## Forbidden Behavior In This Task

This planning task must not add:

- adapter invocation
- derived-preview builder invocation
- route changes
- Trade UI changes
- real selectedRecommendation read
- real selectedRecommendation rendering
- real preview state derivation
- real preview state rendering
- bridge calls
- localhost fetch
- polling
- execution
- trigger/fill/click/review/final/submit/order behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness claim

## Future Safety Review Tests

Future safety review implementation should add tests for:

- static safety scans over all review target files
- import dependency checks
- invalid input handling
- missing input handling
- adapter rejection behavior
- derived-preview failure behavior
- disabled controls and locked gate semantics
- no live endpoint strings
- no exact trigger phrase
- no bridge/local fetch/polling/execution references
- no active handoff button
- no credential/session/BankID/cookies/storage handling
- no Supabase execution writes

## Current Boundary

Current boundary remains:

- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- `app/trade-app.tsx` was not changed
- no real selectedRecommendation state is read or rendered from app/route
- no real preview state is derived or rendered
- adapter is not called
- derived-preview builder is not called
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Static Audit Checkpoint

`docs/avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md`
adds static audit coverage for the candidate adapter and derived-preview helper
files. The audit scans the target files for fetch, localhost, polling,
runner/fill endpoints, trigger phrase, active order behavior, credential or
storage handling, Supabase execution writes, and production/execution readiness
claims. It also confirms the dev route remains fixture/model-only, Trade UI
does not import the integration decision harness or dev route, and no adapter
or derived-preview builder call is added by this phase.

`docs/avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md`
records the static audit result and the decision boundary before any actual
adapter or derived-preview invocation. It confirms the audit is static-only,
does not validate runtime adapter output correctness, and does not enable route
or Trade UI integration.

## References

- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Avanza selectedRecommendation adapter safety review result checkpoint](avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md)
- [Avanza selectedRecommendation adapter safety static audit checkpoint](avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration plan](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-plan.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
