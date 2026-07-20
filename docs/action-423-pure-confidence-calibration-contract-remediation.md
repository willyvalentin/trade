# Action 423 - Pure Confidence Calibration Contract Remediation

## Purpose

Action 423 remediates the three Action 421 pure Confidence Calibration findings under the Action 422 approved boundary.

This action changes only the pure static calibration implementation and narrow compatibility artifacts. It does not add fixtures, runners, manifests, shadow execution, runtime integration, persistence, replay, provider access, Supabase access, feedback, scanner behavior, ranking behavior, confidence application, or recommendation mutation.

Runtime preview remains paused at `runtime_preview_waiting_for_operator_inputs`.

## Scope

Files changed for remediation:

- `lib/pure-confidence-calibration.ts`

Files added for Action 423:

- `docs/action-423-pure-confidence-calibration-contract-remediation.md`
- `scripts/action-423-pure-confidence-calibration-contract-remediation-verify.mjs`
- `tests/e2e/action-423-pure-confidence-calibration-contract-remediation.spec.ts`

Narrow compatibility updates:

- Action 420 verifier/test expectations for remediated unsupported Pattern Discovery status behavior
- Action 421 verifier/test expectations for post-remediation audit readiness
- Action 422 verifier hash compatibility
- Actions 318-320 guard allowlists

## Action 421 Findings

Finding 1: unsupported Pattern Discovery statuses did not surface as `blocked_unsupported_insight`.

Finding 2: known blocked Pattern Discovery statuses such as `blocked_non_consumable_row` and `blocked_nondeterministic_grouping` failed closed with the wrong Confidence Calibration status.

Finding 3: duplicate warning codes were deduplicated in output, but attenuation was applied repeatedly before semantic deduplication.

## Action 422 Approval

Action 422 approved this narrow remediation with decision `approved`.

The approved remediation rules were:

- every ineligible or unsupported Pattern Discovery status returns `blocked_unsupported_insight`
- Pattern Discovery eligibility remains validation phase 6
- warning codes are sorted and semantically deduplicated before attenuation
- each unique reducing warning attenuates once
- contradictory warnings still block
- all unaffected public API, result vocabulary, delta, cap, overlap, bounds, identity, immutability, and determinism behavior remains unchanged
- Action 424 remains mandatory before fixture, hash-freeze, or shadow work

## Unsupported-Status Remediation

Eligible Pattern Discovery statuses remain exactly:

- `discovered`
- `discovered_with_warnings`

Every other Pattern Discovery status now returns:

- `status`: `blocked_unsupported_insight`
- `proposed_delta`: `null`
- `proposed_calibrated_confidence`: `null`
- `included_insight_ids`: `[]`
- `non_authoritative`: `true`
- `applied`: `false`

This includes:

- `insufficient_evidence`
- `blocked_invalid_input`
- `blocked_invalid_configuration`
- `blocked_invalid_lineage`
- `blocked_future_leakage`
- `blocked_non_consumable_row`
- `blocked_nondeterministic_grouping`
- arbitrary unsupported status strings

The raw rejected status string is not included in issue output.

## Validation-Order Preservation

The 17 Action 419 validation phases remain:

1. top-level input shape
2. configuration shape
3. base-confidence validity
4. insight-array shape
5. insight-envelope shape
6. Pattern Discovery status eligibility
7. insight structural validity
8. lineage integrity
9. anti-leakage
10. warning compatibility
11. evidence-quality validation
12. overlap and duplicate detection
13. individual-delta calculation
14. multiple-insight aggregation
15. combined-cap application
16. calibrated-confidence bounds
17. result construction

Unsupported Pattern Discovery status still outranks invalid insight structure, invalid lineage, failed leakage, warning contradiction, evidence-quality error, and overlap conflict when phases 1-5 pass.

## Warning Semantic Deduplication

Warning code processing is now:

1. validate the warning array
2. sort warning codes canonically
3. deduplicate warning codes by exact code
4. classify each unique code
5. evaluate warning/status contradictions
6. apply attenuation once per unique reducing code
7. construct output warnings from the same canonical unique inventory

The following warning inventories are semantically equivalent:

- `["duplicate_mapper_row_identity"]`
- `["duplicate_mapper_row_identity", "duplicate_mapper_row_identity"]`
- `["duplicate_mapper_row_identity", "duplicate_mapper_row_identity", "duplicate_mapper_row_identity"]`

They produce identical deltas, warnings, adjustment warning codes, calibration IDs, and calibration hashes.

## Attenuation Ordering

Attenuation remains:

1. establish base direction and quality delta
2. collect warning codes
3. validate warning compatibility
4. sort warning codes
5. deduplicate warning codes
6. apply each unique calibration-reducing warning once
7. normalize signed zero
8. apply per-insight cap

Distinct reducing warnings still attenuate independently according to the frozen Action 419 table.

## Contradictory Warnings

The warnings below remain contradictory for eligible discovered statuses:

- `minimum_total_support_not_met`
- `minimum_completed_outcomes_not_met`

Duplicate contradictory warnings produce one deterministic blocking issue and do not reach delta calculation.

## API And Vocabulary Preservation

Runtime export remains exactly:

- `calibrateConfidence`

Type exports remain exactly:

- `ConfidenceCalibrationInsightEnvelope`
- `FrozenConfidenceCalibrationConfiguration`
- `ConfidenceCalibrationResult`
- `ConfidenceCalibrationIssue`
- `ConfidenceCalibrationWarning`
- `ConfidenceCalibrationEvidenceSummary`
- `ConfidenceCalibrationAdjustment`

Result vocabulary remains exactly:

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

No public helper, type, status, route, runner, fixture, manifest, or shadow surface was added.

## Behavior Preservation

Unchanged:

- delta table
- warning attenuation ratios
- per-insight caps
- combined caps
- overlap conflict behavior
- exact duplicate insight behavior
- confidence bounds and clamping
- zero-adjustment behavior
- advisory-only output
- `non_authoritative: true`
- `applied: false`
- identity prefix `confidence_calibration_v1:`

## Identity Equivalence

For unaffected inputs, representative calibration IDs and canonical result serialization remain stable.

For duplicate-warning inputs, warning codes are treated as semantic sets. A unique-warning input and its duplicate-warning equivalent produce the same calibration ID and calibration hash.

## Immutability And Determinism

The remediation does not mutate:

- input wrapper
- insights array
- envelopes
- warning arrays
- source arrays
- insight objects
- lineage fields
- configuration object

Repeated valid calls, repeated blocked calls, interleaved calls, reordered insight inputs, and reordered warning inputs remain deterministic.

## No-Fixture/Runner/Manifest/Shadow Guarantee

Action 423 does not create:

- calibration fixture package
- calibration runner
- calibration manifest
- calibration shadow execution
- runtime consumer
- persistence path
- provider path
- Supabase path
- recommendation mutation path
- feedback path

## Mandatory Action 424 Audit

Action 424 - Independent Post-Remediation Confidence Calibration Verification remains mandatory before any fixture package, hash freeze, static shadow, runtime preview advancement, or downstream confidence use.

Do not proceed directly from Action 423 to fixtures, hash freeze, or shadow execution.

## Result

Remediation status: `implemented`

Source hash after remediation:

- `lib/pure-confidence-calibration.ts`: `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`

Safety status:

- provider calls: no
- Supabase reads/writes: no
- persistence: no
- replay: no
- runtime integration: no
- calibration shadow: no
- feedback: no
- recommendation mutation: no
- scanner behavior change: no
- live ranking change: no
- runtime preview advanced: no

Recommended next action: Action 424 - Independent Post-Remediation Confidence Calibration Verification.
