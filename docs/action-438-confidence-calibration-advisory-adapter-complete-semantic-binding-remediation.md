# Action 438 - Confidence Calibration Advisory Adapter Complete Semantic Binding Remediation

## Purpose

Action 438 completes the Confidence Calibration Advisory Adapter semantic result binding approved by Action 437. It keeps the adapter pure and advisory-only while adding an internal complete semantic calibration-result hash path.

## Scope

Changed:

- `lib/confidence-calibration-advisory-adapter.ts`
- `docs/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.md`
- `scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs`
- `tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts`

No runtime route, fixture package, runner, manifest, shadow execution, Recommendation Engine consumer, UI consumer, persistence, replay, provider, Supabase access, confidence application, ranking/scanner/publication integration, feedback path, deployment artifact, or runtime-preview advancement is introduced.

## Upstream Result

Action 436 passed as an independent audit but remained blocked with these findings:

- `calibration_id_retained_hash_tampering_not_blocked`
- `warning_code_retained_hash_tampering_not_blocked`
- `warning_path_retained_hash_tampering_not_blocked`
- `pattern_discovery_sha256_retained_hash_tampering_not_blocked`
- `pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch`

Action 437 approved remediation under root cause:

`calibration_semantic_result_payload_incomplete_for_identity_warning_and_pattern_lineage_fields`

## Field Inventory

Included in the complete semantic result hash:

- `status`
- `calibration_id`
- inferred `configuration_version`
- `original_confidence` as basis points
- `proposed_delta` as basis points
- `proposed_calibrated_confidence` as basis points
- `included_insight_ids`
- `excluded_insight_ids` with stable reasons
- `evidence_summary`
- `overlap_summary`
- `adjustments`
- complete `warnings`
- complete `issues`
- complete `lineage_hashes`
- `non_authoritative`
- `applied`

Explicitly non-semantic and excluded:

- raw expected/recomputed hash values
- runtime timestamps
- process/env data
- Recommendation Engine state
- UI state
- persistence state

Absent for this upstream result shape:

- raw full Pattern Discovery payloads
- raw full Pattern Insight payloads
- source-scenario IDs inside `ConfidenceCalibrationResult`
- source-snapshot IDs inside `ConfidenceCalibrationResult`
- a separately materialized Pattern Discovery configuration hash

Those absent fields remain represented where the current upstream contract exposes them: Pattern Discovery and Pattern Insight hashes are included through `lineage_hashes`, while source-scenario/source-snapshot IDs remain recommendation-envelope lineage and are still checked outside the calibration result hash.

## Binding Policy

`calibration_id` is included in the complete semantic result hash. Legacy Action 420/426 identity hashes remain accepted for historical compatibility only when calibration ID and warning inventory consistency guards pass.

Warnings and issues are bound as complete records:

```json
{ "code": "...", "path": "...", "severity": "...", "messageKey": "..." }
```

Pattern Discovery and Pattern Insight lineage are bound through:

- `pattern_discovery_sha256`
- `pattern_discovery_result_sha256`
- `evidence_set_sha256`
- `group_sha256`
- `insight_sha256`

## Canonicalization

The adapter preserves recursive object-key sorting, UTF-8 JSON serialization, no insignificant whitespace, stable null/omission behavior, signed-zero normalization, stable warning ordering, stable issue ordering, stable included/excluded insight ordering, stable adjustment ordering, and stable lineage ordering.

Semantically equivalent reordering is accepted. Material content changes, changed multiplicity, changed warning or issue records, changed lineage hashes, changed evidence/overlap summaries, changed flags, and combined mutations invalidate the complete semantic result hash.

## Validation Order

The hash mismatch continues to block in phase 10:

- status: `blocked_calibration_result`
- issue path: `/calibration/calibration_hash`
- advisory eligible: `false`
- application eligible: `false`
- non-authoritative: `true`
- applied: `false`

Phase 10 still outranks Pattern Discovery/Pattern Insight lineage checks, anti-leakage, anti-feedback, and warning/issue compatibility checks. Direct phase-11 lineage checks remain as defense in depth when a tampered payload supplies a recomputed matching calibration hash.

## API Preservation

The public export surface remains exactly:

- `buildConfidenceCalibrationAdvisory`
- `ImmutableRecommendationConfidenceEnvelope`
- `FrozenAdvisoryConsumptionConfiguration`
- `ConfidenceCalibrationAdvisoryResult`

No canonicalization or hash helper is exported.

## Behavior Preservation

Unchanged valid Action 432/435 inputs remain accepted, including:

- `calibrated`
- `calibrated_with_warnings`
- `no_adjustment`
- confidence mismatch
- blocked calibration statuses
- invalid recommendation lineage
- invalid calibration lineage
- leakage blocks
- feedback blocks

No-adjustment continues to require zero proposed delta, proposed confidence equal to original confidence, `advisory_no_adjustment`, `applied: false`, and `application_eligible: false`.

Inputs remain immutable. Outputs remain deeply frozen and deterministic across repeated, interleaved, valid, invalid, and semantically reordered calls.

## Attack Matrix

Action 438 blocks complete-hash retained mutations for:

- calibration ID
- status
- original confidence
- proposed delta
- proposed calibrated confidence
- warning code/path/severity/messageKey
- issue code/path/severity/messageKey
- included insight IDs
- excluded insight IDs and reasons
- evidence summary
- overlap summary
- adjustments
- `pattern_discovery_sha256`
- `pattern_discovery_result_sha256`
- evidence-set hashes
- group hashes
- Pattern Insight hashes
- non-authoritative flag
- applied flag
- combined mutations

## Safety

Runtime preview remains paused at:

`runtime_preview_waiting_for_operator_inputs`

Mandatory next audit:

Action 439 - Independent Complete Semantic Binding Verification

