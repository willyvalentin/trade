# Action 461: Confidence Calibration Recommendation Advisory Projection Runtime Preview Consumer Implementation

## Purpose

Action 461 implements the first narrow consumer boundary for the verified Recommendation Advisory Projection chain. The preview is read-only, disabled by default, non-authoritative, non-persistent, and isolated from Recommendation behavior.

## Scope

This action adds exactly three bounded layers:

- Preview flag reader: `lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts`
- Preview presentation adapter: `lib/confidence-calibration-recommendation-advisory-projection-preview.ts`
- One read-only UI surface: `components/recommendations/ConfidenceCalibrationProjectionPreview.tsx`, integrated only through `components/recommendations/RecommendationDetailsModal.tsx`

No scanner, ranking, publication, Add Trade, execution, risk, position sizing, persistence, replay, provider, Supabase, feedback, telemetry infrastructure, route, proxy, background job, deployment, or environment activation is added.

## Action 460 Contract

Action 460 approved the runtime-preview integration contract with conditions:

- approval_decision: `approved_with_conditions`
- release classification: `confidence_calibration_recommendation_advisory_projection_pure_static_verified`
- integration objective: `observation_only`
- Recommendation confidence remains authoritative
- proposed confidence is preview-only
- persistence, replay, feedback, and confidence application are prohibited
- ranking, scanner, publication, execution, Add Trade, risk, and position sizing effects are prohibited
- new runtime/API route is not approved
- deployment is not authorized
- runtime-preview state remains `runtime_preview_waiting_for_operator_inputs`

## Files Changed

- `lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts`
- `lib/confidence-calibration-recommendation-advisory-projection-preview.ts`
- `components/recommendations/ConfidenceCalibrationProjectionPreview.tsx`
- `components/recommendations/RecommendationDetailsModal.tsx`
- `components/recommendations/RecommendationCardContainer.tsx`
- `docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md`
- `scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs`
- `tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts`

Compatibility updates are limited to Action 318-320 package guards and Action 459-460 verification/readback.

## Flag Semantics

Exact flag:

`CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`

Reader:

`isConfidenceCalibrationProjectionPreviewEnabled(environment?, runtime?)`

Semantics:

- missing: disabled
- empty: disabled
- malformed: disabled
- `false`: disabled
- `0`: disabled
- `1`: disabled
- `TRUE`: disabled
- whitespace variants such as ` true `: disabled
- exact `true`: enabled only outside production
- production runtime: disabled even when the value is `true`
- browser query string activation: forbidden
- localStorage activation: forbidden
- sessionStorage activation: forbidden
- cookie bypass: forbidden
- user-controlled activation: forbidden

The reader does not mutate environment state.

## Preview Adapter API

Adapter:

`buildConfidenceCalibrationProjectionPreview(input)`

Input boundary:

- `preview_enabled`
- immutable Recommendation projection envelope
- verified bounded advisory result
- frozen projection configuration

The adapter is the only runtime-facing caller of `buildConfidenceCalibrationRecommendationProjection`.

It does not fetch or derive new market, provider, Supabase, replay, storage, or recommendation data.

Returned statuses:

- `preview_disabled`
- `preview_ready`
- `preview_ready_with_warnings`
- `preview_no_adjustment`
- `preview_unavailable`

The adapter returns bounded preview metadata only. It does not return the raw projection result to UI.

## Status Mapping

- `projection_ready` -> `preview_ready`
- `projection_ready_with_warnings` -> `preview_ready_with_warnings`
- `projection_no_adjustment` -> `preview_no_adjustment`
- `projection_insufficient_evidence` -> `preview_unavailable`
- `blocked_invalid_input` -> `preview_unavailable`
- `blocked_confidence_mismatch` -> `preview_unavailable`
- `blocked_invalid_lineage` -> `preview_unavailable`
- `blocked_future_leakage` -> `preview_unavailable`
- `blocked_advisory_result` -> `preview_unavailable`
- `blocked_unsupported_status` -> `preview_unavailable`
- unexpected projection result -> `preview_unavailable`
- projection exception -> `preview_unavailable`

## Original-Confidence Authority

The preview result distinguishes:

- `original_recommendation_confidence_basis_points`
- `proposed_preview_delta_basis_points`
- `proposed_preview_confidence_basis_points`

The preview never exposes ambiguous fields named:

- `confidence`
- `currentConfidence`
- `finalConfidence`
- `effectiveConfidence`
- `appliedConfidence`

Required effect flags:

- `recommendation_confidence_unchanged: true`
- `application_eligible: false`
- `applied: false`
- `non_authoritative: true`
- `ranking_affected: false`
- `scanner_affected: false`
- `publication_affected: false`
- `execution_affected: false`

Existing Recommendation confidence remains authoritative and unchanged.

## UI Location

The only UI surface is `ConfidenceCalibrationProjectionPreview`, reachable only inside the existing Recommendation Details modal.

It is not added to:

- compact Recommendation cards
- dashboards
- scanner tables
- trade selection
- Add Trade flow
- execution modal
- Live Day Trade cards
- statistics

## UI Copy

Successful and warning states display:

- `Calibration Preview`
- `Preview only — not applied`
- `Original Recommendation confidence remains active`
- `Original confidence`
- `Suggested preview adjustment`
- `Suggested preview confidence`

No-adjustment displays:

- `No adjustment suggested`
- `Original Recommendation confidence remains active`

Unavailable displays:

- `Calibration preview unavailable`

Disabled state renders no UI.

## Warning Mapping

Warnings are bounded labels only:

- `duplicate_mapper_row_identity` -> `Duplicate evidence was deduped`
- `metric_value_unavailable` -> `Some metrics were unavailable`
- unknown warning code -> `Calibration warning`

No raw values, internal hashes, lineage dumps, machine paths, full issue payloads, rejected values, or full JSON are displayed.

## Fail-Closed Behavior

The preview returns `preview_disabled` or `preview_unavailable` if:

- flag disabled
- required bounded inputs are missing
- Recommendation fingerprint mismatch
- snapshot hash mismatch
- original confidence mismatch
- advisory hash mismatch
- lineage mismatch
- blocked projection status
- safety flags are not exact
- output is not non-authoritative
- `application_eligible` is not false
- `applied` is not false
- any ranking, scanner, publication, or execution flag is true
- projection throws
- projection output is unexpected

The Recommendation view itself continues to render normally.

## No-Persistence Boundary

Action 461 adds no:

- Supabase write
- Supabase read for preview
- localStorage
- sessionStorage
- IndexedDB
- cookies
- filesystem write
- server cache
- execution audit log
- Recommendation mutation
- Learning Dataset write
- analytics event with projection payload
- replay record

Preview result exists only for the current render/request.

## No-Route Boundary

Action 461 adds no:

- API route
- server action
- route handler
- background endpoint
- scheduled job
- webhook
- proxy
- external service

## Provider And Supabase Boundary

Action 461 performs no provider calls, no market-data calls, no news calls, and no Supabase reads or writes for the preview.

## Feedback And Confidence Application Boundary

Action 461 creates no feedback and applies no proposed confidence. Proposed preview confidence must never become Recommendation confidence in this action.

## Ranking, Scanner, Publication, Execution Isolation

The preview cannot affect:

- Recommendation selection
- ranking
- scanner behavior
- publication
- Add Trade
- execution
- entry or exit behavior
- risk controls
- position sizing

## Performance Boundary

The adapter is synchronous and pure. It does not use network, database, retries, polling, background work, or blocking publication. Input size is bounded to the immutable envelope, bounded advisory result, and frozen configuration.

Preview failure is isolated from Recommendation rendering.

## Kill Switch And Rollback

Disabling `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED` immediately:

- stops preview computation
- hides the UI surface
- requires no migration
- requires no cleanup
- leaves Recommendation behavior unchanged
- leaves no stale persisted state

## Tests

Action 461 adds focused tests for:

- flag semantics
- adapter status mapping
- fail-closed behavior
- warning mapping
- original-confidence authority
- disabled hidden UI
- bounded display copy
- no Apply/Accept/Use controls
- no route, persistence, replay, provider, Supabase, feedback, or deployment artifacts
- Action 459 and Action 460 health

## Operator Inputs Still Outstanding

Runtime preview remains paused until later operator inputs are approved:

- target preview environment
- authorized preview users/access boundary
- preview flag value
- preview duration
- rollback owner
- kill-switch owner
- evidence retention policy
- confirmation that no confidence application, persistence, replay, or feedback is authorized

## Runtime Preview State

`runtime_preview_waiting_for_operator_inputs`

## Deployment Prohibition

No preview, branch, or production deployment is authorized or required by Action 461.

## Mandatory Action 462 Independent Verification

Action 462 must independently verify this implementation before any preview deployment readiness work.
