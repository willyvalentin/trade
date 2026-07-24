# Action 435 - Confidence Calibration Advisory Adapter Semantic Hash Remediation

## Purpose

Action 435 remediates the Action 433 Confidence Calibration advisory adapter finding approved by Action 434. The adapter now independently reconstructs the bounded Confidence Calibration semantic hash payload, recomputes its SHA-256, compares it to the supplied calibration hash, and fails closed before advisory consumption when the semantic payload and hash do not match.

## Scope

Changed implementation file:

- `lib/confidence-calibration-advisory-adapter.ts`

Added static verification artifacts:

- `docs/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.md`
- `scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs`
- `tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts`

Narrow compatibility updates are limited to Actions 318-320 and Actions 433-434 guard/verifier expectations.

## Action 433 Finding

Action 433 found:

- failed condition: `calibration_identity_and_hash`
- root gap family: the adapter validated calibration hash shape and lineage but did not independently prove the supplied hash still matched the semantic calibration result payload.

Closed Action 433 gaps:

- `swapped_result_hash_blocks`
- `changed_status_retained_hash_blocks`
- `changed_proposed_confidence_retained_hash_blocks`
- `changed_warning_inventory_retained_hash_blocks`

## Action 434 Approval

Action 434 approved this narrow remediation under root-cause classification:

`calibration_semantic_result_hash_not_recomputed`

No fixture, runner, manifest, shadow execution, runtime, persistence, replay, provider, Supabase, Recommendation Engine consumer, UI consumer, confidence application, ranking, scanner, publication, or feedback work is included.

## Semantic Result Payload

The adapter reconstructs the exact pure Confidence Calibration hash payload available from the `ConfidenceCalibrationResult` object:

- `schema_marker`
- `status`
- `configuration_version`
- `base_confidence_basis_points`
- `included_insight_ids`
- `included_insight_hashes`
- `excluded_insight_ids`
- `overlap_resolution_summary`
- `proposed_delta_basis_points`
- `proposed_calibrated_confidence_basis_points`

The adapter also validates bounded semantic consistency for result fields that are not part of the stored pure calibration hash but are part of the advisory safety surface:

- `original_confidence`
- `proposed_delta`
- `proposed_calibrated_confidence`
- `evidence_summary`
- `overlap_summary`
- `adjustments`
- `warnings`
- `issues`
- `lineage_hashes`
- `non_authoritative`
- `applied`

## Canonicalization

The adapter uses private internal helpers only. Canonicalization preserves the upstream policy:

- recursive object-key sorting
- deterministic semantic array sorting for hash payload inventory
- UTF-8 JSON serialization
- no insignificant whitespace
- stable `null` handling
- signed-zero normalization
- no timestamps
- no runtime values
- no machine paths
- no randomness
- no UI state
- no Recommendation object payload
- no output-position dependence

## Result-Hash Recomputation

The adapter computes:

`SHA-256(canonical calibration semantic hash payload)`

The recomputed lowercase SHA-256 hex digest must exactly equal the supplied `calibration.calibration_hash`.

The adapter does not repair, replace, warn through, or substitute calibration ID validation for result-hash validation.

## Supplied/Recomputed Comparison

Comparison is exact string equality after the existing format checks prove the supplied hash is lowercase 64-character SHA-256 hex.

## Validation Placement

The semantic hash check runs in phase 10:

1. top-level input shape
2. advisory configuration
3. recommendation envelope shape
4. recommendation identity/fingerprint
5. recommendation snapshot lineage
6. original confidence validity
7. calibration result shape
8. calibration status eligibility
9. calibration base-confidence agreement
10. calibration identity and result hashes
11. Pattern Discovery and Pattern Insight lineage
12. anti-leakage
13. anti-feedback
14. warning and issue compatibility
15. output construction

Hash mismatch outranks later Pattern Discovery lineage, Pattern Insight lineage, anti-leakage, anti-feedback, and warning/issue faults. Phases 1-9 still outrank hash mismatch.

## Mismatch Behavior

Hash mismatch returns:

- status: `blocked_calibration_result`
- issue code: `blocked_calibration_result`
- issue path: `/calibration/calibration_hash`
- severity: `error`
- messageKey: `confidence_calibration_advisory.blocked_calibration_result`
- advisory_id: `null`
- advisory_hash: `null`
- proposed_delta: `null`
- proposed_calibrated_confidence: `null`
- advisory_eligible: `false`
- advisory_visible: `false`
- application_eligible: `false`
- non_authoritative: `true`
- applied: `false`

No expected hash, actual hash, raw payload, timestamp, credential, environment value, or machine path is exposed.

## Tampering Matrix

The focused verifier and tests cover:

- malformed result hash
- swapped valid result hash
- changed status with retained hash
- changed proposed delta with retained hash
- changed proposed confidence with retained hash
- changed original confidence with retained hash where earlier confidence mismatch does not already block
- changed warning inventory with retained hash
- changed issue inventory with retained hash
- changed included insight IDs with retained hash
- changed excluded insight IDs or reasons with retained hash
- changed evidence summary with retained hash
- changed overlap summary with retained hash
- changed lineage hashes with retained hash
- changed configuration-version-sensitive hash payload with retained hash
- changed non_authoritative or applied flags with retained hash

## Semantic-Order Equivalence

The adapter canonicalizes independently and accepts semantically equivalent reordering where upstream semantics are order-independent:

- warnings are sorted in advisory output
- issues are sorted in advisory output
- included insight IDs are sorted in the recomputed hash payload
- excluded insight records are sorted in the recomputed hash payload
- lineage insight hashes are sorted in the recomputed hash payload
- adjustments are order-independent for semantic consistency checks

Material content changes disguised as reordering still block.

## Hash Distinction

The hashes remain distinct:

- calibration identity/result hash: binds the pure Confidence Calibration semantic hash payload
- recommendation/advisory lineage hashes: bind immutable recommendation and pattern lineage
- advisory hash: binds the advisory-consumption payload

The remediation does not conflate calibration ID, calibration hash, and advisory hash.

## API Preservation

The public API remains unchanged:

- runtime export: `buildConfidenceCalibrationAdvisory`
- type exports:
  - `ImmutableRecommendationConfidenceEnvelope`
  - `FrozenAdvisoryConsumptionConfiguration`
  - `ConfidenceCalibrationAdvisoryResult`

No public hashing or canonicalization helper is exported.

## Unaffected Behavior Preservation

The remediation preserves valid Action 432 outputs and advisory IDs for:

- `calibrated`
- `calibrated_with_warnings`
- `no_adjustment`
- confidence mismatch
- blocked calibration statuses
- lineage blocks
- leakage blocks
- feedback blocks
- warning and issue mapping
- non-authoritative advisory output
- `applied: false`
- `application_eligible: false`

## No-Adjustment

No-adjustment remains valid only when:

- proposed delta is `0`
- proposed confidence equals original confidence
- status maps to `advisory_no_adjustment`
- `non_authoritative` is `true`
- `applied` is `false`
- `application_eligible` is `false`

## Immutability And Determinism

The adapter does not mutate:

- input wrapper
- recommendation envelope
- calibration result
- warning arrays
- issue arrays
- evidence summaries
- overlap summaries
- lineage
- configuration

Repeated calls, interleaved calls, hash-mismatch calls, advisory IDs, advisory hashes, warning order, issue order, and canonical serialization remain deterministic.

## Isolation Guarantees

Action 435 adds no:

- advisory fixture package
- runner
- manifest
- shadow execution
- Recommendation Engine consumer
- UI consumer
- runtime route
- persistence
- replay
- provider access
- Supabase access
- feedback
- confidence application
- ranking/scanner/publication mutation

Runtime preview remains:

`runtime_preview_waiting_for_operator_inputs`

## Mandatory Action 436 Audit

Action 436 is mandatory before any fixture, hash-freeze, shadow, runtime preview, or consumer work:

`action_436_independent_post_remediation_advisory_adapter_verification`
