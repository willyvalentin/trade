# Action 448 - Confidence Calibration Recommendation Advisory Projection Implementation

## Purpose

Action 448 implements the pure Recommendation-facing projection adapter approved by Action 447. It converts one immutable Recommendation projection envelope and one verified `ConfidenceCalibrationAdvisoryResult` into bounded advisory metadata for future Recommendation Engine inspection.

The projection remains advisory metadata only. It does not apply confidence, mutate a Recommendation, create a consumer, persist data, call providers, call Supabase, execute replay, change ranking, change scanner behavior, change publication, or affect execution.

## Scope

This action is pure-static implementation only:

- No Recommendation Engine consumer
- No UI consumer
- No runtime route
- No API route
- No persistence
- No replay
- No provider call
- No Supabase access
- No feedback event
- No confidence application
- No ranking/scanner/publication/execution effect
- No deployment

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

## Action 447 Approval

Action 447 approved this implementation boundary:

- Approval decision: `approved`
- Passed conditions: `30`
- Failed conditions: `0`
- Unresolved conditions: `0`
- Projection adapter path: `lib/confidence-calibration-recommendation-advisory-projection.ts`
- Function name: `buildConfidenceCalibrationRecommendationProjection`
- Consumer allowed: false
- Runtime allowed: false
- Confidence application allowed: false

## Files Changed

Added:

- `lib/confidence-calibration-recommendation-advisory-projection.ts`
- `docs/action-448-confidence-calibration-recommendation-advisory-projection-implementation.md`
- `scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs`
- `tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts`

Updated narrowly:

- Action 447 compatibility verifier and focused test
- Actions 318-320 static guard allowlists
- Static advisory audit allowlists where necessary

## Module API

Runtime export:

- `buildConfidenceCalibrationRecommendationProjection`

Public type exports:

- `ImmutableRecommendationProjectionEnvelope`
- `FrozenRecommendationProjectionConfiguration`
- `ConfidenceCalibrationRecommendationProjectionResult`

No public helper exports are added.

## Input Contracts

The adapter accepts:

1. One immutable Recommendation projection envelope.
2. One verified `ConfidenceCalibrationAdvisoryResult`.
3. One explicit frozen Recommendation projection configuration.

The Recommendation envelope is not a mutable Recommendation object. It contains bounded identity, fingerprint, snapshot hash, original confidence in basis points, decision boundary, lineage, source classification, immutable/static declarations, no mutation callback, no persistence command, no ranking command, no scanner command, no publication command, and no execution command.

The advisory input remains the released Action 431-446 advisory result shape. It must include advisory status, advisory ID, advisory semantic result hash, Recommendation fingerprint, Recommendation snapshot hash, original confidence, proposed delta, proposed calibrated confidence, calibration status, calibration ID, lineage hashes, warnings, issues, visibility flags, `non_authoritative: true`, and `applied: false`.

## Validation Order

The implementation follows the exact Action 447 fail-closed order:

1. Top-level input shape
2. Projection configuration
3. Recommendation envelope shape
4. Recommendation fingerprint
5. Recommendation snapshot lineage
6. Recommendation original confidence
7. Advisory result shape
8. Advisory status eligibility
9. Recommendation/advisory confidence agreement
10. Advisory identity/result hashes
11. Recommendation/advisory lineage agreement
12. Anti-leakage
13. Anti-feedback
14. Warning/issue compatibility
15. Projection output construction

Multi-fault inputs receive the deterministic primary status from this order.

## Status Mappings

Eligible advisory statuses map exactly:

- `advisory_ready` -> `projection_ready`
- `advisory_ready_with_warnings` -> `projection_ready_with_warnings`
- `advisory_no_adjustment` -> `projection_no_adjustment`

Blocked and insufficient advisory statuses map exactly:

- `advisory_insufficient_evidence` -> `projection_insufficient_evidence`
- `blocked_invalid_input` -> `blocked_invalid_input`
- `blocked_confidence_mismatch` -> `blocked_confidence_mismatch`
- `blocked_invalid_lineage` -> `blocked_invalid_lineage`
- `blocked_future_leakage` -> `blocked_future_leakage`
- `blocked_calibration_result` -> `blocked_advisory_result`
- `blocked_unsupported_status` -> `blocked_unsupported_status`

The projection status vocabulary is fixed:

- `projection_ready`
- `projection_ready_with_warnings`
- `projection_no_adjustment`
- `projection_insufficient_evidence`
- `blocked_invalid_input`
- `blocked_confidence_mismatch`
- `blocked_invalid_lineage`
- `blocked_future_leakage`
- `blocked_advisory_result`
- `blocked_unsupported_status`

## Confidence Agreement

The adapter requires exact basis-point equality between:

- Recommendation original confidence basis points
- Advisory original confidence converted to basis points

It does not round into agreement, repair, rebase, or compare proposed confidence. A mismatch returns `blocked_confidence_mismatch`.

## Advisory Identity And Hash Verification

The adapter independently reconstructs the bounded Action 432 advisory semantic payload using canonical JSON and SHA-256. It validates:

- Advisory ID prefix
- Advisory result hash format
- Advisory ID suffix derived from the semantic hash
- Recommendation fingerprint in the advisory payload
- Recommendation snapshot hash in the advisory payload
- Original confidence basis points
- Calibration status and calibration ID
- Calibration identity and result hashes
- Proposed delta and proposed confidence basis points
- Canonical warnings
- Canonical issues
- Canonical advisory lineage hashes

A retained hash with changed advisory payload returns `blocked_advisory_result`.

## Lineage

The projection requires exact agreement for:

- Recommendation fingerprint
- Recommendation snapshot hash
- Recommendation source hash
- Decision boundary hash
- Evidence lineage hash
- Pattern Discovery result hashes
- Pattern Insight hashes
- Calibration identity hash
- Calibration result hash

Lineage mismatches return `blocked_invalid_lineage`.

## Anti-Leakage

The Recommendation envelope must declare passed anti-leakage and all leakage flags false:

- No future outcome evidence
- No post-entry evidence
- No post-exit evidence
- No same-Recommendation realized result
- No evidence after the decision boundary
- No prohibited self-calibration

Violations return `blocked_future_leakage`.

## Anti-Feedback

The Recommendation envelope must declare all projection feedback reuse flags false:

- Not reused as Recommendation confidence input
- Not reused as scanner signal
- Not reused as ranking signal
- Not reused as publication signal
- Not reused as execution signal
- Not reused as Learning Dataset input
- Not reused as Pattern Discovery evidence
- Not reused as Intelligence Context
- Not reused as outcome
- Not reused as calibration evidence
- Not reused as future advisory base input
- Not reused as feedback event
- No direct or indirect cycle

Violations return `blocked_invalid_lineage`.

## Warning And Issue Behavior

Warnings and issues are projection metadata only. They use bounded records:

```ts
{ code, path, severity, messageKey }
```

The adapter requires RFC 6901 paths, bounded code inventories, deterministic exact-record deduplication, deterministic sorting, stable message keys, no raw rejected values, no free-form dynamic messages, no timestamps, and no sensitive values.

Warnings and issues are not appended to Recommendation collections.

## No-Adjustment Behavior

For `advisory_no_adjustment`, the adapter requires:

- Proposed delta basis points: `0`
- Proposed confidence basis points equals Recommendation original confidence basis points
- Projection status: `projection_no_adjustment`
- Recommendation confidence unchanged: true
- `non_authoritative: true`
- `applied: false`
- `application_eligible: false`
- All ranking/scanner/publication/execution flags false

Invalid no-adjustment semantics return `blocked_advisory_result`.

## Projection Identity And Hash

Successful projections compute deterministic projection identity using canonical JSON plus SHA-256. The hash binds:

- Projection schema/configuration version
- Recommendation fingerprint
- Recommendation snapshot hash
- Recommendation original confidence basis points
- Advisory status
- Advisory ID
- Advisory identity hash
- Advisory result hash
- Proposed delta basis points
- Proposed confidence basis points
- Canonical warnings
- Canonical issues
- Bounded lineage hashes

The projection ID uses the frozen prefix `confidence_calibration_recommendation_projection_v1:` plus the first 24 hex characters of the projection hash.

The identity excludes timestamps, runtime state, machine paths, UI state, randomness, and output array position.

## Canonicalization

Canonicalization uses recursive object-key sorting, stable semantic array ordering, deterministic warning and issue ordering, deterministic lineage ordering, UTF-8 JSON, no insignificant whitespace, stable null/omission semantics, signed-zero normalization, and no dynamic fields.

## Immutability And Determinism

The adapter does not mutate:

- Input wrapper
- Recommendation envelope
- Advisory result
- Warnings
- Issues
- Bounded lineage
- Configuration

Outputs are deeply frozen. Repeated calls, blocked calls, interleaved calls, reordered warnings, reordered issues, and reordered lineage produce deterministic results.

## Output Contract

Successful output contains bounded metadata only:

- Projection status and ID
- Recommendation fingerprint and snapshot hash
- Recommendation original confidence basis points
- Advisory status and ID
- Advisory identity/result hashes
- Advisory proposed delta basis points
- Advisory proposed confidence basis points
- Bounded lineage hashes
- Canonical warnings and issues
- Visibility flags
- `recommendation_confidence_unchanged: true`
- `ranking_affected: false`
- `scanner_affected: false`
- `publication_affected: false`
- `execution_affected: false`
- `non_authoritative: true`
- `applied: false`
- `application_eligible: false`

The output does not contain a mutable Recommendation object, Recommendation update command, persistence command, Supabase payload, ranking update, scanner command, publication command, execution command, feedback event, callback, runtime side effect, `applied_confidence`, or `effective_confidence`.

## No-Consumer Guarantee

Action 448 does not add a Recommendation Engine consumer, UI consumer, API route, runtime route, background job, persistence layer, replay integration, provider integration, Supabase access, feedback event, confidence application, ranking integration, scanner integration, publication integration, or execution integration.

## Deployment Prohibition

No deployment is required or authorized. No preview deploy, production deploy, Netlify artifact, environment variable, credential request, authentication change, site-linking, production change, or runtime-preview advancement is part of this action.

## Mandatory Action 449 Audit

Action 449 remains mandatory and must independently verify the pure projection adapter before any fixture hash-freeze, shadow execution, consumer, runtime, or Recommendation Engine integration can be considered.

Recommended next action: `action_449_independent_projection_adapter_verification`.
