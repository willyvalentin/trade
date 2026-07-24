# Action 419 - Pure Confidence Calibration Implementation Approval Gate

## Purpose

Action 419 freezes the implementation approval gate for the future pure Confidence Calibration function. It authorizes a later Action 420 to implement exactly one isolated deterministic module, but it does not implement or execute calibration.

## Scope

This is static, approval-gate-only, implementation-free, execution-free, source-immutable, local-only, runtime-free, persistence-free, replay-free, provider-free, Supabase-free, recommendation-mutation-free, and feedback-free.

## Authoritative Dependencies

- Action 309 post-recovery safety protocol
- Action 326 pattern taxonomy
- Action 335 learning dataset design
- Action 357 Pattern Insight static fixtures
- Action 385 Learning Dataset to Pattern Insight compatibility
- Actions 387-401 pure mapper and static shadow chain
- Actions 402-417 pure Pattern Discovery chain
- Action 418 pure Confidence Calibration contract gate

## Action 418 Decision

- approval: `approved_with_conditions`
- passed conditions: `24`
- failed conditions: `0`
- runtime preview: `runtime_preview_waiting_for_operator_inputs`

## Action 418 Future Conditions

- `implementation_file_path_unapproved`
- `executable_fixture_package_unapproved`
- `implementation_independent_audit_future_work`

Action 419 resolves only the implementation file path condition. It does not resolve executable fixture package approval and does not satisfy the independent audit requirement.

## Explicit Non-Goals

Do not implement `calibrateConfidence`, add a calibration module, add a calibration runner, add a calibration manifest, generate calibration output, modify recommendation confidence, mutate recommendations, modify ranking/scanner behavior, modify Pattern Discovery, modify mapper, modify fixtures, persist insights or calibration results, use runtime/production inputs, use replay, use Supabase, access providers/news, modify schemas/migrations, deploy, or advance runtime preview.

## Exact Implementation Module

The only approved future implementation module is:

- `lib/pure-confidence-calibration.ts`

No other calibration module path is approved.

## Exact Exported API

The only approved public runtime export is:

- `calibrateConfidence`

The exact public type export inventory is seven names:

- `ConfidenceCalibrationInsightEnvelope`
- `FrozenConfidenceCalibrationConfiguration`
- `ConfidenceCalibrationResult`
- `ConfidenceCalibrationIssue`
- `ConfidenceCalibrationWarning`
- `ConfidenceCalibrationEvidenceSummary`
- `ConfidenceCalibrationAdjustment`

No classes, services, repositories, caches, adapters, runtime wrappers, production modules, default exports, or additional public exports are approved.

## Function Signature

Action 420 may implement exactly:

```ts
export function calibrateConfidence(input: Readonly<{
  baseConfidence: number;
  insights: readonly ConfidenceCalibrationInsightEnvelope[];
  configuration: FrozenConfidenceCalibrationConfiguration;
}>): ConfidenceCalibrationResult
```

The function must be synchronous, pure, immutable, deterministic, clock-free, randomness-free, environment-free, filesystem-free, network-free, persistence-free, logging-side-effect-free, and mutation-free. No hidden parameters, callbacks, service handles, mutable recommendation objects, runtime context, or implicit defaults are approved.

## Input-Envelope Contract

Each `ConfidenceCalibrationInsightEnvelope` must include exactly the following externally supplied top-level contract fields:

- `pattern_discovery_sha256`
- `pattern_discovery_configuration_version`
- `pattern_discovery_result_sha256`
- `evidence_set_sha256`
- `group_sha256`
- `insight_id`
- `insight_sha256`
- `source_scenario_ids`
- `source_snapshot_ids`
- `pattern_discovery_status`
- `warning_codes`
- `static_only`
- `non_authoritative`
- `no_persistence`
- `no_replay`
- `no_runtime`
- `no_feedback`
- `anti_leakage_status`
- `insight`

The envelope must not include runtime execution metadata, environment values, current timestamps, machine paths, mutable recommendation objects, callbacks, persistence instructions, replay handles, or provider data.

## Configuration Contract

Every `FrozenConfidenceCalibrationConfiguration` value must be explicit. No hidden defaults are allowed. The required configuration fields are:

- `configuration_version`
- `confidence_scale_basis_points_per_point`: `100`
- `accepted_min_confidence_basis_points`: `0`
- `accepted_max_confidence_basis_points`: `10000`
- `output_decimal_precision`: `2`
- `positive_per_insight_cap_basis_points`: `200`
- `negative_per_insight_cap_basis_points`: `-300`
- `combined_positive_cap_basis_points`: `400`
- `combined_negative_cap_basis_points`: `-600`
- `minimum_total_support`: `20`
- `minimum_unique_snapshot_support`: `20`
- `minimum_completed_outcomes`: `20`
- `accepted_setup_families`
- `accepted_horizons`
- `warning_classification_table`
- `warning_attenuation_table`
- `evidence_quality_table`
- `direction_delta_table`
- `overlap_resolution_policy`
- `deterministic_sorting_policy`
- `rounding_mode`: `round_half_away_from_zero`

Unknown configuration fields are `blocked_invalid_configuration`. The support thresholds, setup family allowlist, and horizon allowlist must be explicit configuration fields, not hidden implementation defaults.

## Validation-Order Contract

Validation is fail-closed in this exact order:

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

Multi-fault input returns the earliest primary blocking status and deterministic issue ordering.

## Eligible-Insight Contract

Eligible Pattern Discovery statuses are exactly:

- `discovered`
- `discovered_with_warnings`

The insight must exist, be non-authoritative, have complete lineage and verified semantic hashes, have `static_only: true`, `no_persistence: true`, `no_replay: true`, `no_runtime: true`, `no_feedback: true`, have `anti_leakage_status: "passed"`, and use an accepted setup family and horizon.

## Excluded-Insight Contract

Excluded statuses are exactly:

- `insufficient_evidence`
- `blocked_future_leakage`
- `blocked_invalid_configuration`
- `blocked_invalid_input`
- `blocked_invalid_lineage`
- `blocked_non_consumable_row`
- `blocked_nondeterministic_grouping`

Missing insights, incomplete/conflicting lineage, unverified hashes, failed/unknown/missing anti-leakage evidence, runtime-derived insights, persisted insights, externally supplied production insights, unsupported setup family, and unsupported horizon are excluded or blocked according to validation order.

## Warning-Classification Contract

Warning classification is frozen:

| Warning code | Classification | Action 420 behavior |
| --- | --- | --- |
| `duplicate_mapper_row_identity` | `calibration_reducing` | retain only after lineage validation; apply `1/2` integer attenuation and overlap dedupe |
| `metric_value_unavailable` | `calibration_reducing` | retain only when direction/support are explicit; apply `1/2` integer attenuation |
| `minimum_total_support_not_met` | `calibration_blocking` | contradictory with eligible discovered status; return `blocked_invalid_input` |
| `minimum_completed_outcomes_not_met` | `calibration_blocking` | contradictory with eligible discovered status; return `blocked_invalid_input` |

Unknown warnings are `calibration_blocking`.

## Evidence-Quality Contract

Accepted evidence quality values are:

- `verified_high`: multiplier `1/1`
- `verified_usable`: multiplier `1/2`
- `verified_limited`: multiplier `1/4`
- `blocked`: block as `blocked_unsupported_insight`

Unknown or missing quality returns `blocked_invalid_input`.

## Direction Contract

Accepted evidence direction values are:

- `supportive_strong`
- `supportive_moderate`
- `supportive_weak`
- `neutral`
- `mixed`
- `adverse_weak`
- `adverse_moderate`
- `adverse_strong`

Unknown direction returns `blocked_unsupported_insight`.

## Delta Table

Base deltas are signed integer basis points:

| Direction | Base delta |
| --- | ---: |
| `supportive_strong` | `+200` |
| `supportive_moderate` | `+100` |
| `supportive_weak` | `+50` |
| `neutral` | `0` |
| `mixed` | `0` |
| `adverse_weak` | `-100` |
| `adverse_moderate` | `-200` |
| `adverse_strong` | `-300` |

Implementation-selected weights are prohibited.

## Attenuation Contract

All attenuation uses signed integer basis points. Apply evidence-quality multiplier first, then warning attenuation in sorted warning-code order. `calibration_reducing` warnings use multiplier `1/2`. Multiple reducing warnings compound with integer ratio multiplication. Signed midpoint rounding uses `round_half_away_from_zero`. Positive deltas attenuated below `1` basis point become `0`; negative deltas attenuated above `-1` basis point become `0`. Zero remains zero.

## Base-Confidence Validation

`baseConfidence` must be finite, between `0.00` and `100.00` inclusive, and have at most two decimal places. Invalid, missing, non-finite, out-of-range, or higher-precision values return `blocked_invalid_input`; they are not repaired.

## Basis-Point Conversion

Valid base confidence converts to integer basis points by multiplying by `100` after the two-decimal precision check. Signed deltas remain integer basis points through the entire function.

## Individual-Delta Contract

For each eligible non-overlapping insight, calculate base delta from direction, apply quality multiplier, apply warning attenuation, then cap to `+200` or `-300` basis points. The individual delta must never exceed the frozen per-insight caps.

## Combined-Delta Contract

Selected individual deltas are summed in deterministic order. Combined positive delta caps at `+400` basis points. Combined negative delta caps at `-600` basis points.

## Positive/Negative Cap Contract

Cap order is:

1. per-insight cap after attenuation
2. combined cap after aggregation
3. absolute confidence clamp after valid delta computation

Hidden caps are prohibited.

## Overlap-Resolution Contract

The overlap key components are:

- `pattern_discovery_result_sha256`
- `evidence_set_sha256`
- `group_sha256`
- `insight_sha256`
- sorted `source_scenario_ids`
- sorted `source_snapshot_ids`

Exact duplicate insights are deduplicated deterministically. Same evidence set with different insight IDs is overlap, not independent support. Materially conflicting overlapping evidence returns `blocked_overlapping_evidence`. Same group with distinct non-overlapping source identities may count independently.

## Duplicate-Insight Contract

Duplicate key is:

`configuration_version|pattern_discovery_result_sha256|evidence_set_sha256|group_sha256|insight_id|insight_sha256`

Exact duplicates keep the first sorted canonical envelope. Duplicate insight ID with different hash returns `blocked_invalid_lineage`.

## Multiple-Insight Aggregation Contract

Aggregation order is:

1. sort by `(pattern_discovery_configuration_version, pattern_discovery_result_sha256, evidence_set_sha256, group_sha256, insight_id, insight_sha256)`
2. filter eligible insights
3. dedupe exact duplicates
4. resolve overlap groups
5. calculate individual deltas
6. sum integer basis-point deltas
7. apply combined caps

No iteration-order dependence is allowed.

## Contradictory-Insight Contract

Non-overlapping supportive and adverse insights may offset. If the signed sum is exactly zero, return `no_adjustment` with both included insight IDs. Overlapping supportive/adverse conflicts return `blocked_overlapping_evidence`.

## Zero-Adjustment Contract

Return `no_adjustment` when eligible evidence is neutral, mixed, exactly balanced, attenuated to zero, or produces zero after caps. Return `insufficient_eligible_evidence` when no eligible insight remains because all inputs were insufficient or excluded without a hard block.

## Rounding Contract

Rounding mode is exactly `round_half_away_from_zero`. It applies after quality multiplier, after each warning attenuation, and after final confidence conversion. Negative midpoint values round away from zero. Signed zero canonicalizes to `0`.

## Clamping-Versus-Rejection Contract

Invalid base confidence is rejected as `blocked_invalid_input`. A valid base plus valid capped delta that crosses `0` or `10000` basis points is clamped to the absolute confidence range and emits warning code `confidence_clamped_to_bounds`. Delta caps still apply before clamping.

## Lineage Contract

Each result must bind Pattern Discovery implementation hash, Pattern Discovery configuration version, Pattern Discovery result hash, evidence-set hash, group hash, insight ID, insight hash, source scenario IDs, source snapshot IDs, static-only declaration, non-authoritative declaration, no-persistence declaration, no-replay declaration, no-runtime declaration, and no-feedback declaration. Missing or conflicting lineage returns `blocked_invalid_lineage`.

## Anti-Leakage Contract

Calibration may use only verified Pattern Insight summaries. No future fact may be relabeled as snapshot-time context. No calibration value may feed back into its own evidence. No circular calibration, post-calibration outcome reuse, runtime enrichment, or production readback is allowed. Failed, unknown, or missing anti-leakage status blocks.

## Result Vocabulary

The exact status union is:

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

No new statuses may be added in Action 420.

## Issue/Warning Contract

Issues and warnings use exactly:

```ts
{
  code,
  path,
  severity,
  messageKey
}
```

Paths are RFC 6901 JSON Pointers. Severity is `"error"` or `"warning"`. Codes are bounded inventories. Message keys are stable. Ordering is deterministic by `(severity, code, path, messageKey)`. Deduplication uses the same tuple. Raw rejected values, timestamps, environment values, secrets, and machine paths are prohibited.

## Calibration Output Contract

Successful advisory results may include:

- `status`
- `calibration_id`
- `calibration_hash`
- `original_confidence`
- `proposed_delta`
- `proposed_calibrated_confidence`
- `included_insight_ids`
- `excluded_insight_ids`
- `evidence_summary`
- `overlap_summary`
- `warnings`
- `issues`
- `lineage_hashes`
- `non_authoritative: true`
- `applied: false`

Output must not include a Recommendation object, mutation callback, persistence instruction, ranking output, scanner output, recommendation-update command, runtime handle, or provider data.

## Identity Contract

`calibration_id` is `confidence_calibration_v1:` plus the first `24` hex characters of `calibration_hash`. The full `calibration_hash` is retained in the result.

## Canonical Serialization

`calibration_hash` is SHA-256 of canonical JSON with sorted object keys and stable arrays after deterministic sorting. The canonical payload includes schema marker `confidence_calibration_result_v1`, configuration version, canonical base confidence basis points, ordered included insight IDs, ordered included insight hashes, ordered excluded insight IDs and identity-relevant exclusion reasons, overlap-resolution summary, proposed delta basis points, and proposed calibrated confidence basis points.

## Calibration Hash

The hash excludes current time, machine paths, runtime state, output array position, randomness, mutable recommendation IDs, secrets, and unsorted warning order.

## Deterministic Ordering

All input-derived arrays are sorted before validation where sorting cannot hide a primary shape error. Included IDs, excluded IDs, warnings, issues, lineage hashes, and overlap summaries are serialized in deterministic order.

## Deterministic Deduplication

Deduplication uses canonical keys only. No object identity, insertion order, Map iteration accident, output position, locale-sensitive sort, or runtime state may influence dedupe.

## Immutability

Implementation must not mutate input, nested insight objects, arrays, configuration, or any Recommendation object. Repeated, interleaved, and reordered calls must be deterministic.

## Prohibited Inference

Calibration must never infer missing direction, missing quality, missing support, missing lineage, missing anti-leakage evidence, missing hashes, setup family, horizon, or recommendation identity.

## Prohibited Repair

Calibration must not repair invalid precision, invalid confidence, malformed hashes, unsupported statuses, missing warning fields, conflicting lineage, runtime-derived evidence, or production-derived evidence.

## Prohibited Recommendation Mutation

Calibration must not mutate recommendation confidence, ranking, scanner selection, live cards, tiers, Add Trade eligibility, broker handoff, or execution state.

## Prohibited Calibration Application

Calibration is advisory only. Applying calibration to any recommendation field requires a later separate governance action.

## Implementation Boundary

Action 420 may add only:

- `lib/pure-confidence-calibration.ts`
- `docs/action-420-pure-confidence-calibration-implementation.md`
- `scripts/action-420-pure-confidence-calibration-implementation-verify.mjs`
- `tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts`
- narrowly required Action 418/419 compatibility updates
- minimal Actions 318-320 guard updates

Action 420 may not add a runner, executable fixture package, manifest, shadow execution, runtime adapter, recommendation consumer, persistence, replay, Supabase integration, or calibration application.

## Required Test Inventory

Action 420 tests must cover exact exports, exact signature, valid single supportive insight, valid single adverse insight, neutral insight, mixed insight, discovered status, discovered-with-warnings status, insufficient-evidence rejection, blocked-status rejection, missing insight, invalid lineage, failed leakage, contradictory warning/status, invalid base confidence, out-of-range confidence, invalid precision, per-insight positive cap, per-insight negative cap, combined positive cap, combined negative cap, exact duplicate insight, overlapping evidence, conflicting overlapping evidence, distinct non-overlapping insights, deterministic sorting, warning attenuation, multiple warnings, no eligible evidence, balanced zero delta, output bound behavior, deterministic ID/hash, issue/warning ordering, input immutability, repeated calls, interleaved calls, reordered insight determinism, no runtime/network/filesystem/environment, no persistence, and no recommendation mutation.

## Executable-Fixture Sequencing

Action 419 does not approve a fixture execution package. Fixture execution remains blocked until after Action 420 implementation and Action 421 independent audit. Action 422 may separately approve static fixture/hash-freeze and shadow execution.

## Mandatory Action 421 Independent Audit

Action 421 must not modify implementation. It must independently test validation precedence, overlap/dedupe bypasses, cap and rounding boundaries, lineage/leakage bypasses, input mutation and nondeterminism, representative calibration IDs/hashes, and readiness for a later static fixture/hash-freeze gate. No shadow execution may occur before Action 421.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions

The gate is approved only if implementation module and exports are exact, validation order is exact, result vocabulary is exact, delta and attenuation tables are exact, overlap handling is exact, aggregation and bounds are exact, identity/hash contract is exact, implementation boundary is narrow, Action 421 is mandatory, and no runtime, persistence, or recommendation mutation is required.

## Approval Decision

Decision: `approved`

Action 419 fully resolves Action 418's implementation file path condition. It intentionally keeps fixture execution and independent audit as later mandatory work.

## Passed Conditions

- exact module path frozen
- exact public export inventory frozen
- exact function signature frozen
- exact input-envelope and configuration contracts frozen
- exact validation order frozen
- exact result vocabulary frozen
- exact issue/warning contract frozen
- exact warning classification frozen
- exact delta and attenuation tables frozen
- exact overlap/dedupe and aggregation policy frozen
- exact rounding and bounds behavior frozen
- exact identity/hash construction frozen
- exact output contract frozen
- implementation boundary narrowed to Action 420 files
- Action 421 independent audit required
- no runtime, persistence, replay, provider, Supabase, feedback, or recommendation mutation required

## Failed Conditions

None.

## Unresolved Conditions

- `executable_fixture_package_unapproved`
- `implementation_independent_audit_future_work`

## Next Permitted Action

`action_420_pure_confidence_calibration_implementation`

## Runtime-Preview Paused State

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.
