# Action 463 - Confidence Calibration Recommendation Advisory Projection Preview Deployment Readiness Gate

## Purpose

Freeze the readiness gate for a future, separately approved preview deployment of the disabled Confidence Calibration Recommendation Advisory Projection runtime preview consumer.

This action does not deploy, activate, configure, persist, replay, call providers, call Supabase, add telemetry, or apply confidence.

## Scope

This is a static approval gate only. It documents the preview deployment boundary, operator inputs, candidate isolation requirements, validation requirements, preview access policy, rollback policy, kill-switch policy, stop conditions, and the next required approval action.

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

## Authoritative Dependencies

- Action 459 static release gate
- Action 460 runtime-preview integration contract
- Action 461 disabled runtime preview consumer implementation
- Action 462 independent consumer verification
- Action 309 post-recovery safety guard
- Actions 318-320 static replay branch/package guards

## Action 459 Release Classification

The release classification remains:

`confidence_calibration_recommendation_advisory_projection_pure_static_verified`

Action 463 does not change that classification.

## Action 460 Integration Contract

Action 460 approved a runtime preview integration contract with conditions:

- preview-only
- disabled by default
- production disabled
- no confidence application
- no persistence
- no replay
- no provider access
- no Supabase access
- no feedback path
- no ranking, scanner, publication, execution, Add Trade, risk, or position-sizing effect

## Action 461 Implementation

Action 461 implemented one disabled-by-default, observation-only runtime preview consumer:

- flag: `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`
- exact enabled value: `true`
- production behavior: disabled
- runtime projection call sites: exactly one
- UI surface: one read-only Recommendation detail preview
- original Recommendation confidence: authoritative
- proposed confidence: preview-only
- deployment: none

## Action 462 Readiness Decision

Action 462 independently verified Action 461 and returned:

- readiness decision: `ready_with_conditions`
- runtime preview state: `runtime_preview_waiting_for_operator_inputs`
- deployment status: `not_authorized_not_required_not_performed`

## Current Runtime-Preview State

`runtime_preview_waiting_for_operator_inputs`

No preview activation has occurred.

## Explicit Non-Goals

Action 463 must not:

- enable the preview flag
- modify environment variables
- deploy preview
- deploy production
- create a branch deploy
- modify Netlify configuration
- link a Netlify site
- request credentials
- push or merge changes
- create runtime routes
- create persistence
- create replay
- add telemetry infrastructure
- add consumer behavior
- apply confidence
- mutate recommendations
- alter ranking, scanner, publication, execution, Add Trade, risk, or position sizing
- advance runtime preview

## Preview Deployment Objective

The future objective is a bounded non-production preview where authorized operators can inspect the read-only Recommendation detail preview while original Recommendation confidence remains authoritative.

## Exact Deployment Candidate Boundary

The future preview deployment candidate may include only:

- `lib/confidence-calibration-recommendation-advisory-projection.ts`
- `lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts`
- `lib/confidence-calibration-recommendation-advisory-projection-preview.ts`
- `components/recommendations/ConfidenceCalibrationProjectionPreview.tsx`
- `components/recommendations/RecommendationDetailsModal.tsx`
- `components/recommendations/RecommendationCardContainer.tsx`
- approved static Action 447-463 artifacts required by the repository
- existing build/runtime dependencies already present before Action 461

Unrelated runtime or post-trade work is not part of this deployment candidate unless it receives complete independent classification and approval.

## Exact File Inventory

Deployment candidate implementation files:

- `lib/confidence-calibration-recommendation-advisory-projection.ts`
- `lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts`
- `lib/confidence-calibration-recommendation-advisory-projection-preview.ts`
- `components/recommendations/ConfidenceCalibrationProjectionPreview.tsx`
- `components/recommendations/RecommendationDetailsModal.tsx`
- `components/recommendations/RecommendationCardContainer.tsx`

Action 463 gate files:

- `docs/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.md`
- `scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs`
- `tests/e2e/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.spec.ts`

## Source-Integrity Policy

Action 463 does not modify Action 461 implementation files. Before a future deployment is approved, the implementation files must be hash-checked against the approved candidate manifest or independently reviewed as part of the same deployment candidate.

## Feature-Flag Policy

Flag:

`CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`

Future preview activation may set the value to exact `true` only in the explicitly approved non-production preview environment.

Required properties:

- default remains disabled
- missing value disables
- malformed value disables
- production remains disabled
- one-step kill switch is remove/set disabled
- no URL, localStorage, sessionStorage, cookie, user profile, or database bypass
- no gradual automatic rollout
- no user self-enrollment
- no fallback to enabled

Action 463 does not set this value.

## Target Environment Policy

The first activation may occur only in a clearly identifiable preview or non-production environment.

Requirements:

- production domain excluded
- production environment variables excluded
- no production database or provider integration introduced
- preview flag disabled by default
- preview flag enabled only for approved preview environment
- missing or malformed configuration disables preview

If the project setup cannot guarantee this without deployment configuration changes, a separate deployment-configuration approval action is required.

## Authorized-User Policy

The future preview must choose one exact access model:

- deployment protected by platform authentication
- preview URL shared only with named internal operators
- existing authenticated internal application access
- another bounded existing access control

An unprotected public preview is not approved if projection metadata is visible.

## Preview-Access Policy

Preview access must be bounded to the approved users or approved access mechanism. Action 463 does not invent new authentication and does not authorize public access.

## Production Prohibition

Production activation is prohibited.

The production domain must remain excluded. The preview flag must remain disabled in production even if the environment value is exact `true`.

## Operator-Input Inventory

Action 464 must capture exact values for:

- target preview environment
- authorized preview users or access mechanism
- preview activation start condition
- maximum preview duration
- preview flag value
- development diagnostics enabled or disabled
- evidence-retention policy
- rollback owner
- kill-switch owner
- deployment operator
- observation owner
- acceptable failure threshold
- explicit confirmation that original Recommendation confidence remains authoritative
- explicit confirmation that proposed confidence must not be applied
- explicit confirmation that production activation is prohibited
- explicit deployment-readiness approval

## Operator-Input Validation Policy

Missing, vague, public, production-targeted, or contradictory operator inputs remain unresolved and prevent preview activation.

## Safe Defaults

Safe defaults are:

- preview flag disabled
- preview hidden
- no confidence application
- no persistence
- no replay
- no provider calls
- no Supabase calls
- no feedback path
- no telemetry expansion
- no production activation

## Working-Tree Cleanliness Policy

A preview deployment may not be authorized from an unclassified dirty working tree.

Before deployment, require one of:

- a clean isolated branch/candidate containing only the approved preview scope and intentionally approved dependencies
- complete independent classification and approval of every additional changed file included in the deployment candidate

## Unrelated-File Isolation Policy

The current worktree contains unrelated post-trade runtime/preflight artifacts. They remain outside the Action 463 deployment candidate and must not be broadly allowlisted, ignored, or assumed not to deploy.

## Action 318-320 Guard Policy

Actions 318-320 must either pass on the isolated deployment candidate or have a separately approved explanation covering every included file.

Action 463 may only classify Action 463 documentation, verifier, tests, optional static readiness matrices, and minimal guard updates. It must not authorize unrelated post-trade files.

## Build, Type, Lint, Test Requirements

Before any preview deployment may be approved, require:

- `git diff --check`
- `npx next typegen`
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- Action 309 guard
- Actions 459-463 verifiers
- Action 461 focused suite
- Action 462 focused suite
- Action 463 focused suite
- Recommendation details regressions
- exact one runtime projection call site
- preview flag disabled in default/current environment
- no production enablement
- no new route
- no persistence, replay, provider, Supabase, feedback
- no confidence application
- no ranking, scanner, publication, execution, Add Trade, risk, or sizing change
- deployment-candidate file inventory matches approval
- working tree or isolated candidate has no unclassified files

## Preview URL And Access Requirements

Before activation:

- preview URL must be non-production
- preview access must be bounded
- production custom domain must not be targeted
- authorized users must be confirmed
- preview flag must initially be disabled

## Preview Duration Policy

The initial preview must have a bounded duration. Recommended maximum:

- one trading session
- or one business day

The exact duration remains an operator input. No indefinite preview activation is approved.

## Observation Policy

Allowed observation facts:

- preview render succeeded
- preview unavailable state occurred
- aggregate count by bounded preview status
- UI remained isolated
- Recommendation view continued functioning
- no confidence was applied
- no ranking, scanner, publication, execution effect occurred
- flag disable hid the preview
- rollback succeeded

## Evidence-Retention Policy

Evidence retention must be explicit before activation. Retained evidence must be bounded and must not include raw recommendation, advisory, projection, lineage, provider, Supabase, personal, or secret data.

## Privacy Policy

Do not retain:

- full Recommendations
- full advisory results
- proposed confidence tied to named users
- Recommendation fingerprints
- advisory/projection hashes
- raw warnings/issues
- lineage
- provider/Supabase payloads
- personal data
- secrets

## Telemetry Policy

No telemetry expansion is approved. If existing telemetry cannot meet the bounded evidence policy without new infrastructure, use manual bounded observation and no new telemetry.

## No-Confidence-Application Policy

The preview must not apply confidence. Original Recommendation confidence remains authoritative.

## No-Persistence Policy

The preview must not add:

- Supabase tables or writes
- localStorage/sessionStorage
- IndexedDB
- cookies
- filesystem storage
- replay artifacts
- analytics payloads containing projection details
- new external telemetry sink
- audit-log persistence of preview result

## No-Replay Policy

No replay execution or replay artifact generation is approved.

## No-Provider/Supabase Policy

No provider calls and no Supabase reads or writes are approved.

## Rollback Plan

Ordinary preview shutdown must be possible by:

1. disabling or removing the preview flag,
2. confirming preview UI disappears,
3. confirming Recommendation details remain operational,
4. requiring no migration or data cleanup,
5. confirming no persisted preview state exists.

Code rollback is secondary fallback only.

## Kill-Switch Plan

Before activation, test the disabled flag state. During future preview, if any stop condition occurs:

- disable flag immediately
- verify UI hidden
- stop observation
- record only bounded incident classification
- do not attempt same-session repair while preview remains enabled

## Activation Plan

Activation remains future work. Before activation, confirm:

- deployment completed in approved preview environment
- preview URL/access works
- preview flag is initially disabled
- Recommendation UI works with preview disabled
- kill switch has been tested disabled
- authorized users are confirmed
- observation owner is present
- rollback owner is available
- no production environment is targeted
- no pending unrelated deployment files remain
- activation approval has been explicitly issued

## Stop Conditions

Stop preview immediately if:

- original Recommendation confidence changes
- proposed confidence affects sorting/filtering
- ranking, scanner, publication, or execution changes
- Add Trade, risk, or sizing consumes preview data
- preview appears in production
- unauthorized users gain access
- raw internal data appears
- a route, provider, or Supabase call appears
- persistence, replay, or feedback occurs
- Recommendation rendering fails
- projection errors escape the preview boundary
- kill switch fails
- unclassified deployment files are discovered
- working-tree/candidate integrity differs from approval
- confidence application occurs

## Failure Handling

On failure, disable the flag, verify the preview is hidden, stop observation, keep evidence bounded, and do not repair while preview remains enabled.

## Deployment Candidate Decision Vocabulary

Use exactly:

- `candidate_isolated`
- `candidate_ready_with_conditions`
- `candidate_blocked`

## Readiness Decision Vocabulary

Use exactly:

- `ready`
- `ready_with_conditions`
- `blocked`

## Readiness Decision

`ready_with_conditions`

The implementation is technically ready for a future gate, but operator inputs and deployment-candidate isolation remain outstanding.

## Passed Conditions

- Action 462 readiness is `ready_with_conditions`
- release classification remains `confidence_calibration_recommendation_advisory_projection_pure_static_verified`
- candidate boundary is frozen
- flag activation contract is frozen
- production activation is prohibited
- no confidence application is authorized
- no persistence, replay, provider, Supabase, or feedback path is authorized
- rollback and kill-switch policies are defined
- stop conditions are defined
- runtime preview remains waiting

## Failed Conditions

None for this static gate.

## Unresolved Conditions

- operator inputs remain outstanding
- target preview environment remains outstanding
- authorized users/access boundary remains outstanding
- preview duration remains outstanding
- evidence-retention policy remains outstanding
- rollback and kill-switch owners remain outstanding
- deployment operator and observation owner remain outstanding
- working-tree deployment candidate isolation remains outstanding
- unrelated dirty files require isolation or independent approval
- explicit deployment-readiness approval remains outstanding

## Next Permitted Action

`action_464_confidence_calibration_recommendation_advisory_projection_operator_input_capture_and_preview_activation_approval_gate`

Action 464 must capture and validate operator inputs and candidate isolation. It must not deploy or activate unless all conditions are explicitly resolved and the approved sequence allows a later Action 465.

## Production Status

Production activation remains prohibited.

## Deployment Status

`not_authorized_not_required_not_performed`
