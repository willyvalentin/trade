# Action 420 - Pure Confidence Calibration Implementation

## Purpose

Action 420 implements the pure advisory Confidence Calibration function approved by Actions 418 and 419.

## Scope

This action adds one isolated pure module plus documentation, verifier, and focused tests. It adds no runner, manifest, shadow execution, runtime route, persistence, replay, provider access, Supabase access, feedback path, recommendation mutation, scanner change, ranking change, or runtime-preview advancement.

## Action 418 Contract

Action 418 froze the conceptual pure function contract, eligible Pattern Discovery statuses, result vocabulary, confidence/delta bounds, advisory-only output, lineage and anti-leakage rules, and no-mutation/no-application boundary.

## Action 419 Approval

Action 419 approved exactly one implementation module:

- `lib/pure-confidence-calibration.ts`

It approved one public runtime export:

- `calibrateConfidence`

It approved exactly seven public type exports:

- `ConfidenceCalibrationInsightEnvelope`
- `FrozenConfidenceCalibrationConfiguration`
- `ConfidenceCalibrationResult`
- `ConfidenceCalibrationIssue`
- `ConfidenceCalibrationWarning`
- `ConfidenceCalibrationEvidenceSummary`
- `ConfidenceCalibrationAdjustment`

## Exact Files Changed

- `lib/pure-confidence-calibration.ts`
- `docs/action-420-pure-confidence-calibration-implementation.md`
- `scripts/action-420-pure-confidence-calibration-implementation-verify.mjs`
- `tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts`
- narrow Action 418/419 compatibility verifier and test updates
- minimal Actions 318-320 guard updates

## API And Type Exports

The module exports only `calibrateConfidence` at runtime. Type exports are limited to the seven approved names. There are no classes, default exports, services, repositories, caches, adapters, runtime wrappers, or production consumers.

## Validation Order

The implementation validates in the frozen 17 phases:

1. top-level input shape
2. configuration shape
3. base-confidence validity
4. insight-array shape
5. insight-envelope shape
6. Pattern Discovery status eligibility
7. insight presence and structural validity
8. lineage integrity
9. anti-leakage
10. warning compatibility
11. evidence quality
12. overlap and duplicate detection
13. individual delta calculation
14. multiple-insight aggregation
15. combined cap application
16. calibrated-confidence bounds
17. result construction

## Eligibility

Only `discovered` and `discovered_with_warnings` Pattern Discovery statuses may proceed to calibration. `insufficient_evidence` is excluded and can lead to `insufficient_eligible_evidence`. Blocked statuses, unsupported statuses, missing insight structure, invalid lineage, failed leakage, unsupported setup/horizon, and unsupported evidence states fail closed.

## Warning Classifications

- `duplicate_mapper_row_identity`: `calibration_reducing`
- `metric_value_unavailable`: `calibration_reducing`
- `minimum_total_support_not_met`: `calibration_blocking`
- `minimum_completed_outcomes_not_met`: `calibration_blocking`

Unknown warnings block. Minimum-support warnings on discovered inputs are contradictory and return `blocked_invalid_input`.

## Delta Table

All deltas are basis points:

- `supportive_strong`: `+200`
- `supportive_moderate`: `+100`
- `supportive_weak`: `+50`
- `neutral`: `0`
- `mixed`: `0`
- `adverse_weak`: `-100`
- `adverse_moderate`: `-200`
- `adverse_strong`: `-300`

## Attenuation

Evidence-quality attenuation is applied first using integer ratios. Warning attenuation is applied second in sorted warning-code order. Reducing warnings use multiplier `1/2`. Rounding is `round_half_away_from_zero`; signed zero canonicalizes to `0`.

## Dedupe And Overlap

Exact duplicate insights are deduplicated deterministically. Same evidence set or shared source identity cannot be double-counted. Materially conflicting overlapping evidence returns `blocked_overlapping_evidence`.

## Aggregation And Caps

Validated insights are sorted, deduped, overlap-resolved, individually adjusted, summed as integer basis points, then capped at `+400` or `-600` combined basis points.

## Confidence Conversion

Base confidence must be finite, within `0.00` through `100.00`, and have at most two decimal places. It converts to basis points by multiplying by `100`. Invalid precision or range returns `blocked_invalid_input`.

## Bounds And Clamping

Invalid base confidence blocks. Valid capped delta crossing `0` or `10000` basis points clamps to the absolute bound and adds warning `confidence_clamped_to_bounds`.

## Zero-Adjustment Behavior

Neutral, mixed, exactly balanced, fully attenuated, or capped-zero evidence returns `no_adjustment`. No eligible evidence returns `insufficient_eligible_evidence` unless a hard blocker was encountered.

## Result Vocabulary

The exact status union remains:

- `calibrated`
- `calibrated_with_warnings`
- `no_adjustment`
- `insufficient_eligible_evidence`
- `blocked_invalid_input`
- `blocked_invalid_configuration`
- `blocked_invalid_lineage`
- `blocked_future_leakage`
- `blocked_overlapping_evidence`
- `blocked_unsupported_insight`

## Output Contract

Output is advisory only. It includes status, calibration identity/hash where available, original confidence, proposed delta, proposed calibrated confidence, included/excluded insight IDs, evidence summary, overlap summary, warnings, issues, lineage hashes, `non_authoritative: true`, and `applied: false`.

## Identity And Hashing

Successful advisory outputs derive `calibration_hash` from SHA-256 canonical JSON with sorted object keys and stable semantic arrays. `calibration_id` is `confidence_calibration_v1:` plus the first 24 hex characters. The canonical payload excludes time, runtime state, machine paths, randomness, secrets, output position, and mutable recommendation identifiers.

## Immutability

The implementation does not mutate the input wrapper, insight array, envelopes, nested insight objects, warning arrays, source arrays, configuration, or any recommendation object.

## Determinism

Repeated, interleaved, and reordered equivalent calls produce stable output, issue ordering, warning ordering, included/excluded ordering, calibration IDs, and hashes.

## No-Runner Guarantee

No calibration runner was added.

## No-Manifest Guarantee

No calibration fixture package or manifest was added.

## No-Shadow Guarantee

No calibration shadow execution was performed.

## No-Recommendation-Mutation Guarantee

The module returns advisory output only and never mutates recommendations, ranking, scanner selection, live cards, tiers, Add Trade eligibility, broker handoff, or execution state.

## No-Persistence Guarantee

No calibration output is persisted.

## No-Runtime Guarantee

No API route, page route, background job, runtime adapter, app import, or production consumer was added.

## No-Feedback Guarantee

No calibration result is fed back into Pattern Discovery, Learning Dataset rows, recommendations, or outcomes.

## Runtime-Preview Paused State

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

## Mandatory Action 421 Audit

Action 421 must independently verify the implementation before any fixture/hash-freeze, shadow execution, runtime integration, or application action.
