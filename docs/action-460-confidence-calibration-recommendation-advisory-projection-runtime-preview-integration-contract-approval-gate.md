# Action 460 - Confidence Calibration Recommendation Advisory Projection Runtime Preview Integration Contract Approval Gate

## Purpose

Define the exact contract for one future preview-only integration of the verified Confidence Calibration Recommendation Advisory Projection into Ture.

This is an approval gate only. It does not implement a consumer, UI, route, feature flag, telemetry, persistence, replay, provider access, Supabase access, confidence application, recommendation mutation, ranking change, scanner change, publication change, execution change, feedback path, deployment artifact, preview deployment, or production exposure.

## Scope

Action 460 is static, local-only, implementation-free, source-immutable, package-immutable, runtime-execution-free, route-free, UI-free, persistence-free, replay-free, provider-free, Supabase-free, recommendation-mutation-free, confidence-application-free, ranking-mutation-free, scanner-mutation-free, publication-mutation-free, execution-mutation-free, feedback-free, and deployment-free.

## Authoritative Dependencies

- Action 309 - Post-Recovery Safe Development Protocol
- Action 446 - Static Confidence Calibration Advisory Shadow Release Gate
- Action 447 - Confidence Calibration Advisory Recommendation Engine Consumption Contract Approval Gate
- Action 459 - Static Confidence Calibration Recommendation Advisory Projection Shadow Release Gate

## Action 459 Release Result

- release_decision: `released`
- release_classification: `confidence_calibration_recommendation_advisory_projection_pure_static_verified`
- failed_conditions: `none`
- unresolved_conditions: `none`
- scenario_count: `52`
- exact_ids: `cp453_01` through `cp453_52`
- shadow_result: `shadow_passed`
- independent_shadow_verification: `ready`
- Recommendation Engine consumers: `zero`
- UI consumers: `zero`
- runtime integration: `none`
- confidence application: `none`
- persistence: `none`
- replay: `none`
- feedback: `none`
- deployment: `none`

## Release Classification

The pure/static classification remains unchanged:

`confidence_calibration_recommendation_advisory_projection_pure_static_verified`

## Frozen Hashes

Action 454 package inventory SHA-256:

`ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072`

Action 454 repeat payload SHA-256:

`2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74`

Action 457 manifest semantic SHA-256:

`2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a`

Action 457 run package SHA-256:

`dcd769f27ab08b56b8e027118ebb476246382a6ba96d9dee23da36b59debb6cd`

Action 457 evidence SHA-256:

`c1e394c78a4508af23e0141a9833a98ae4d1d4aa985ef1f1fd09771bd796beac`

## Current Runtime-Preview State

`runtime_preview_waiting_for_operator_inputs`

Action 460 does not advance or change that state.

## Explicit Non-Goals

Action 460 does not modify the projection adapter, advisory adapter, pure Confidence Calibration, Recommendation Engine logic, UI, runtime routes, API routes, background jobs, hooks, providers, contexts, stores, services, scanner logic, ranking logic, publication behavior, execution behavior, risk controls, position sizing, replay logic, learning logic, feedback logic, deployment configuration, environment variables, or production exposure.

## Integration Objective

The future integration may only surface the already verified Recommendation Advisory Projection as non-authoritative preview metadata attached to an existing immutable Recommendation view.

The objective is preview observation only. It may not replace Recommendation confidence, alter Recommendation eligibility, alter Recommendation ranking, affect scanner results, affect publication, affect execution, affect risk controls, affect position sizing, affect entry or exit decisions, create a new Recommendation, mutate an existing Recommendation, write learned data, or generate feedback.

## Intended Preview User

The intended preview user is an authorized Ture operator reviewing calibration behavior in a gated preview context. It is not intended for general live trading users, broker automation, or automated decision systems.

## Recommendation Engine Consumer Decision

Decision: `approved_with_conditions`.

No Recommendation Engine decision consumer is permitted. One presentation-layer projection builder call may be permitted in a future implementation, but only through a dedicated preview-only adapter outside Recommendation decision logic.

The future adapter may call `buildConfidenceCalibrationRecommendationProjection` only after the immutable Recommendation has already been selected and published. The projection result must not flow back into ranking, scanner, publication, execution, learning, feedback, risk, position sizing, or trade-selection logic.

Direct calls throughout the application are prohibited.

## UI Consumer Decision

Decision: `approved_with_conditions`.

One read-only preview-only UI surface may be permitted in a later implementation. The approved first surface is an existing Recommendation detail panel or a development-only `Calibration Preview` section attached to that detail context.

Broad card-level integration, dashboard-wide integration, ranking indicators, scanner indicators, execution controls, edit controls, Add Trade controls, automatic refresh that changes Recommendation behavior, and confidence-application CTAs are prohibited.

The preview UI must be hidden by default unless an explicit preview flag and required operator inputs are present.

## Permitted Input Boundary

The future preview may use only immutable data already present in the existing Recommendation presentation boundary:

- immutable Recommendation identity
- immutable Recommendation fingerprint
- immutable snapshot hash when already present
- original Recommendation confidence
- bounded recommendation metadata needed by the projection contract
- bounded advisory result already available to the preview boundary

It may not fetch, hydrate, repair, enrich, or infer missing upstream data.

## Permitted Projection Fields

The future preview may consume bounded presentation metadata only:

- `projection_status`
- `original_recommendation_confidence`
- `proposed_advisory_delta`
- `proposed_advisory_confidence`
- `warnings`
- bounded reason keys, represented as `bounded_reason_keys`
- `non_authoritative`
- `recommendation_confidence_unchanged`
- `application_eligible`
- effect flags, represented as `effect_flags`
- `projection_id`
- `advisory_id`
- bounded lineage status where needed for development diagnostics, represented as `bounded_lineage_status`

## Permitted Display Fields

Normal preview UI may display:

- projection status label, represented as `projection_status_label`
- original Recommendation confidence
- proposed advisory delta
- proposed advisory confidence for successful statuses only, represented as `proposed_advisory_confidence_success_only`
- warnings as stable bounded keys or short safe labels, represented as `bounded_warnings`
- `Preview only`
- `Not applied`
- `Original Recommendation confidence remains active`
- `Calibration preview unavailable` for unavailable or blocked states

Development diagnostics may display bounded status and stable issue keys only.

## Forbidden Fields

The future preview must not expose:

- full Recommendation envelope
- full advisory input
- full calibration result
- Pattern Discovery output
- Pattern Insight
- evidence records
- outcome records
- internal hashes in normal UI
- raw rejected values
- secrets
- environment values
- mutation commands
- user identifiers
- full Recommendation records
- Recommendation fingerprints in telemetry
- advisory hashes in telemetry
- lineage internals in normal UI

## Successful-Result Handling

For `projection_ready`, `projection_ready_with_warnings`, and `projection_no_adjustment`, the preview UI may display preview metadata only.

Visible copy must be equivalent to:

- `Preview only`
- `Not applied`
- `Original Recommendation confidence remains active`

The UI must not label proposed confidence as current confidence, final confidence, applied confidence, or Recommendation confidence.

## Warning-Result Handling

For `projection_ready_with_warnings`, warnings may be displayed only as bounded stable warning keys or short safe labels. Raw values, rejected values, full inputs, hashes, and lineage internals remain hidden.

Warnings must not make the projection eligible for application.

## No-Adjustment Handling

For `projection_no_adjustment`, the preview may show that the advisory proposes no change, while still showing `Preview only`, `Not applied`, and `Original Recommendation confidence remains active`.

## Insufficient-Evidence Handling

For `projection_insufficient_evidence`, normal preview UI must not show proposed confidence. It may show `Calibration preview unavailable`.

Development diagnostics may show bounded status and stable issue keys only.

## Blocked-Result Handling

For blocked statuses, normal preview UI must show no proposed confidence and may only show `Calibration preview unavailable`.

Development diagnostics may show bounded status and stable issue keys only. Internal validation details, hashes, rejected values, raw values, and security-sensitive lineage information are prohibited in normal UI.

## Proposed-Confidence Display Policy

Proposed confidence may be displayed only for successful preview statuses and only as non-authoritative preview metadata. It must always be visually and semantically subordinate to original Recommendation confidence.

## Original-Confidence Authority Policy

Existing Recommendation confidence remains authoritative.

The future preview must not overwrite confidence, create a downstream confidence field, sort by proposed confidence, filter by proposed confidence, store proposed confidence as current or final confidence, or use proposed confidence in risk, execution, publication, scanner, ranking, learning, feedback, or trade-selection logic.

## Ranking Policy

Ranking remains unchanged. `ranking_affected` must remain `false`.

## Scanner Policy

Scanner candidate selection and scanner output remain unchanged. `scanner_affected` must remain `false`.

## Publication Policy

Recommendation publication remains unchanged. `publication_affected` must remain `false`.

## Execution Policy

Execution remains unchanged. `execution_affected` must remain `false`.

## Trade-Selection Policy

Trade selection remains unchanged. Proposed confidence must not influence Add Trade, handoff, broker automation, trade selection, or execution eligibility.

## Risk And Position-Sizing Policy

Risk controls and position sizing remain unchanged. Proposed confidence must not affect sizing, stop/target logic, risk caps, or entry/exit decisions.

## Effect Boundaries

Every future preview output must retain:

- `recommendation_confidence_unchanged: true`
- `ranking_affected: false`
- `scanner_affected: false`
- `publication_affected: false`
- `execution_affected: false`
- `application_eligible: false`
- `non_authoritative: true`
- `applied: false`

Any violation must hide the projection and fail closed.

## Persistence Policy

No Supabase write, localStorage persistence, IndexedDB persistence, server cache, filesystem persistence, execution audit-log entry, Learning Dataset entry, feedback event, or other projection persistence is permitted.

Projection data may exist only in memory for the current preview render or request.

## Replay Policy

Replay ingestion and replay execution are prohibited.

## Provider And Supabase Policy

No provider request, market-data request, news request, Supabase read, or Supabase write is permitted.

The projection must operate only on data already present in the existing Recommendation presentation boundary.

## Confidence-Application Policy

Confidence application is prohibited. Proposed confidence must never become Recommendation confidence.

## Feedback Policy

Feedback creation is prohibited. The preview must not generate learning feedback, calibration feedback, outcome feedback, or recommendation feedback.

## Telemetry Policy

Allowed only if existing telemetry infrastructure can do this without new persistence or external sinks:

- bounded aggregate counter that preview rendered
- bounded aggregate counter by projection status
- bounded failure counter

Prohibited telemetry:

- full inputs
- proposed confidence per user or trade
- Recommendation fingerprints
- advisory hashes
- lineage
- warnings or issues with raw values
- user identifiers
- full Recommendation records

If new telemetry infrastructure is required, telemetry is prohibited for the first preview.

## Privacy And Sensitive-Data Policy

No secrets, environment values, user identifiers, raw rejected values, full records, full envelopes, or internal security-sensitive lineage details may be exposed.

## Runtime-Route Decision

No new runtime route is approved for the first preview integration.

If a route becomes unavoidable, this approval becomes `approved_with_conditions` requiring a separate route contract gate before implementation.

## API-Route Decision

No new API route is approved for the first preview integration.

## Feature-Flag Policy

One explicit preview-only gate is required in a future implementation.

Future flag name reserved by contract:

`CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`

Do not implement the flag in Action 460.

Flag behavior:

- default: disabled
- production: disabled
- missing flag: disabled
- malformed flag: disabled
- no user-controlled query-string activation
- no localStorage bypass
- no automatic enablement

## Preview-Only Boundary

The preview must be read-only, hidden by default, non-authoritative, disabled in production, and available only to authorized preview operators in the explicitly approved target environment.

## Operator-Input Inventory

Runtime preview remains `runtime_preview_waiting_for_operator_inputs` until these are explicitly supplied and separately approved:

- approval to expose the preview section
- target preview environment
- authorized preview users or access boundary
- feature-flag value
- whether development diagnostics are visible
- maximum preview duration
- rollback owner
- kill-switch owner
- evidence-retention policy
- confirmation that original Recommendation confidence remains authoritative
- confirmation that no confidence application is authorized
- confirmation that no persistence is authorized
- confirmation that no replay is authorized
- confirmation that no feedback is authorized

## Safe Defaults

The preview defaults to hidden, disabled, non-authoritative, in-memory only, no telemetry unless existing bounded aggregate telemetry is available, no route, no persistence, no replay, no provider access, no Supabase access, no confidence application, no feedback, and no deployment.

## Fail-Closed Behavior

The preview must hide metadata and return a bounded unavailable state if any safety check fails.

## Kill-Switch Policy

The future implementation must support one-step disable through the preview flag. Disablement must immediately remove preview output and restore pre-integration behavior without data migration or cleanup migration.

## Rollback Policy

Rollback requires no data migration, no cleanup migration, no persisted projection data, no replay cleanup, and no scanner or Recommendation rollback. Disabling the flag must be sufficient.

## Stale-Result Policy

Hide preview metadata and return a bounded unavailable state if the projection result is stale or if required preview input is missing.

## Mismatch Policy

Hide preview metadata and fail closed if any Recommendation fingerprint, snapshot hash, original confidence, advisory result hash, lineage, source/package hash, or safety flag differs from the expected immutable input.

## Missing-Result Policy

Missing projection input, missing projection output, or missing preview authorization must display no proposed confidence and may show only `Calibration preview unavailable`.

## Performance Budget

The future implementation may perform only a synchronous pure in-process projection. It must make no network call, database call, retry, polling request, background execution, or publication-blocking call. Preview failure must not fail the Recommendation view.

Equivalently, it must make no network call and no database call.

The target budget is a bounded single-call in-process render budget suitable for pure deterministic projection.

## Source And Package Integrity Policy

Action 454 package hash, Action 457 manifest hash, Action 457 run package hash, Action 457 evidence hash, and Action 459 release classification remain immutable inputs to the contract.

Any source/package hash mismatch must hide the preview and fail closed.

## Consumer Isolation Policy

Only one dedicated preview-only adapter may call the projection builder in a future implementation. No direct calls throughout the application are permitted.

## Preview Evidence Policy

Preview evidence may be bounded, aggregate, and non-authoritative only. No full inputs, no raw records, no fingerprints, no hashes, no user identifiers, no persisted projection records, and no replay evidence may be stored.

## Deployment Prerequisites

Deployment is not authorized by Action 460.

Preview deployment may first be considered only after:

- Action 461 implements the bounded preview consumer
- Action 462 independently verifies the implementation
- Action 463 approves preview deployment readiness
- Action 464 captures operator inputs and approves preview activation

## Mandatory Future Implementation Sequence

1. Action 461 - Runtime Preview Consumer Implementation Approval/Implementation
2. Action 462 - Independent Runtime Preview Consumer Verification
3. Action 463 - Preview Deployment Readiness Gate
4. Action 464 - Operator Input Capture and Preview Activation Approval
5. Action 465 - Preview Deployment and Observation
6. Action 466 - Independent Preview Observation Verification
7. Action 467 - Preview Release/Stop Decision

Production integration remains prohibited unless a later separate production gate is approved.

## Implementation Boundary

If a future implementation is separately approved, it may modify only narrowly identified files:

- one dedicated preview projection adapter
- one read-only preview UI component
- one existing Recommendation detail integration point
- one feature-flag definition/read
- focused documentation
- verifier
- tests
- narrow guards

It may not modify Recommendation ranking logic, scanner, publication, execution, risk controls, position sizing, persistence, replay, Supabase, providers, learning, feedback, production enablement, deployment configuration, or route/API infrastructure.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Approval Decision

`approved_with_conditions`

The integration contract is sound for a future preview-only observation surface, but operator inputs remain outstanding and runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

## Passed Conditions

- observation-only objective is exact
- consumer surface is singular and bounded
- original confidence remains authoritative
- effect boundaries remain false
- persistence remains prohibited
- replay remains prohibited
- feedback remains prohibited
- provider and Supabase access remain prohibited
- no new route is required
- preview flag defaults disabled
- rollback is immediate
- implementation boundary is narrow
- deployment remains separately gated

## Failed Conditions

None.

## Unresolved Conditions

- operator inputs remain outstanding
- final target preview environment remains outstanding
- authorized preview users or access boundary remains outstanding
- preview duration remains outstanding
- rollback and kill-switch owners remain outstanding
- evidence-retention policy remains outstanding

## Next Permitted Action

`action_461_confidence_calibration_recommendation_advisory_projection_runtime_preview_consumer_implementation_approval_implementation`

## Deployment Status

`not_authorized_not_required`

No preview deployment, production deployment, branch deployment, Netlify configuration change, deployment artifact, credential request, site linking, runtime push, production enablement, or main push is authorized.

## Runtime Preview State

`runtime_preview_waiting_for_operator_inputs`

## Unrelated-Work Classification

`action_460_runtime_preview_integration_contract_approval_gate_only`
