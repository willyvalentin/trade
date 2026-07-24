# Action 451 - Projection Advisory Status Hash-Binding Remediation

## Purpose

Action 451 remediates the Action 449 finding approved by Action 450:
`projection_advisory_semantic_result_hash_does_not_bind_status`.

The Recommendation-facing projection adapter now reconstructs the bounded
advisory semantic result payload, canonicalizes it, computes
`SHA-256(canonical advisory semantic result payload)`, and compares that digest
with the supplied advisory result hash during validation phase 10.

## Scope

Updated file:

- `lib/confidence-calibration-recommendation-advisory-projection.ts`

Added files:

- `docs/action-451-projection-advisory-status-hash-binding-remediation.md`
- `scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs`
- `tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts`

No fixtures, runners, manifests, shadow execution, Recommendation Engine
consumer, UI consumer, runtime route, persistence, replay, provider access,
Supabase access, confidence application, ranking/scanner/publication/execution
integration, feedback loop, deployment artifact, or environment variable change
is introduced.

## Root Cause

Action 449 proved that changing `advisory.status` while retaining the original
advisory result hash was not detected by the projection adapter. The projection
adapter was rebuilding only a projection-specific approximation of the advisory
semantic hash payload.

## Advisory Result-Field Inventory

Fields bound by phase 10:

- `status`: included_in_advisory_result_hash
- `recommendation_fingerprint`: included_in_advisory_result_hash
- `recommendation_snapshot_hash`: included_in_advisory_result_hash
- `original_confidence`: included_in_advisory_result_hash as basis points
- `proposed_delta`: included_in_advisory_result_hash as basis points
- `proposed_calibrated_confidence`: included_in_advisory_result_hash as basis points
- `calibration_status`: included_in_advisory_result_hash
- `calibration_id`: included_in_advisory_result_hash
- `calibration_identity_hash`: included_in_advisory_result_hash
- `calibration_result_hash`: included_in_advisory_result_hash
- `warnings`: included_in_advisory_result_hash
- `issues`: included_in_advisory_result_hash
- `bounded_lineage`: included_in_advisory_result_hash
- `advisory_eligible`: included_in_advisory_result_hash
- `advisory_visible`: included_in_advisory_result_hash
- `application_eligible`: included_in_advisory_result_hash
- `non_authoritative`: included_in_advisory_result_hash
- `applied`: included_in_advisory_result_hash
- `bounded_reasons`: included_in_advisory_result_hash
- `schema_version`: included_in_advisory_result_hash
- `configuration_version`: included_in_advisory_result_hash

Identity wrapper:

- `advisory_id`: phase-10 identity-bound as
  `confidence_calibration_advisory_v1:${advisory_hash.slice(0, 24)}`.
  It is explicitly_non_semantic_and_excluded from the hash payload itself to
  avoid a circular self-reference, but advisory ID tampering still blocks in the
  same phase.
- `advisory_hash`: explicitly_non_semantic_and_excluded from the hash payload
  because it is the supplied digest being verified.

Status-specific shapes:

- `advisory_ready`: success shape; warnings may be absent_for_status_specific_shape; issues absent.
- `advisory_ready_with_warnings`: success-with-warning shape; warnings included.
- `advisory_no_adjustment`: no-adjustment shape; delta is zero and proposed confidence equals original.
- `advisory_insufficient_evidence`: blocked/readback shape; advisory hash absent_for_status_specific_shape.
- `blocked_invalid_input`: blocked/readback shape; advisory hash absent_for_status_specific_shape.
- `blocked_confidence_mismatch`: blocked/readback shape; advisory hash absent_for_status_specific_shape.
- `blocked_invalid_lineage`: blocked/readback shape; advisory hash absent_for_status_specific_shape.
- `blocked_future_leakage`: blocked/readback shape; advisory hash absent_for_status_specific_shape.
- `blocked_calibration_result`: blocked/readback shape; advisory hash absent_for_status_specific_shape.
- `blocked_unsupported_status`: blocked/readback shape; advisory hash absent_for_status_specific_shape.

No semantic field is left unclassified.

## Canonicalization

Canonicalization remains private and deterministic:

- recursive object-key sorting
- UTF-8
- no insignificant whitespace
- stable null/omission behavior
- signed-zero normalization
- canonical warning ordering
- canonical issue ordering
- canonical lineage ordering
- canonical reasons ordering
- no timestamps
- no runtime state
- no machine paths
- no UI state
- no randomness
- no output array position

Semantic reordering of warnings, issues, lineage records, reasons, object keys,
and nested object keys remains accepted. Changed multiplicity or material
content must block.

## Hash Recalculation And Mismatch Behavior

The projection adapter computes a lowercase hexadecimal SHA-256 digest from the
canonical advisory semantic result payload. It must not trust hash format alone,
must not use the advisory identity hash as a substitute, and must not silently
repair or replace the supplied hash.

On mismatch:

- status: `blocked_advisory_result`
- issue code: `blocked_advisory_result`
- issue path: `/advisory/advisory_hash`
- issue severity: `error`
- message key: `confidence_calibration_recommendation_projection.blocked_advisory_result`
- no raw expected hash
- no raw actual hash
- `recommendation_confidence_unchanged`: `true`
- `application_eligible`: `false`
- `ranking_affected`: `false`
- `scanner_affected`: `false`
- `publication_affected`: `false`
- `execution_affected`: `false`
- `non_authoritative`: `true`
- `applied`: `false`

## Validation Phase Placement

The 15 phases remain:

1. Top-level input shape
2. Projection configuration
3. Recommendation envelope shape
4. Recommendation fingerprint
5. Recommendation snapshot lineage
6. Recommendation original confidence
7. Advisory result shape
8. Advisory status eligibility
9. Recommendation/advisory confidence agreement
10. Advisory identity and result hashes
11. Recommendation/advisory lineage agreement
12. Anti-leakage
13. Anti-feedback
14. Warning/issue compatibility
15. Projection output construction

The hash mismatch belongs in phase 10. Phase 10 outranks phase 11 lineage,
phase 12 leakage, phase 13 feedback, and phase 14 warning/issue compatibility.
Phases 1-9 must still outrank phase 10.

## Attack Matrix

Retained-hash mutations that block:

- advisory status
- advisory ID
- recommendation fingerprint
- recommendation snapshot hash
- original confidence
- proposed delta
- proposed calibrated confidence
- calibration status
- calibration ID
- calibration identity hash
- calibration result hash
- warning code
- warning path
- warning severity
- warning messageKey
- issue code
- issue path
- issue severity
- issue messageKey
- lineage fields
- advisory visibility
- advisory eligibility
- application eligibility
- non_authoritative
- applied
- bounded reasons
- schema/configuration version
- combined mutations

Swapped-hash substitutions that block:

- advisory result hash from another valid advisory
- advisory identity hash used as advisory result hash
- calibration result hash used as advisory result hash
- projection identity hash used as advisory result hash
- unrelated valid-format hash
- all-zero hash
- all-f hash
- malformed hash

## Phase-11 Defense In Depth

Case A: mutate advisory lineage and retain the old advisory hash. Expect phase-10
`blocked_advisory_result`.

Case B: mutate advisory lineage and recompute a matching advisory hash. Expect
phase-11 lineage block.

## Hash-Role Separation

The following remain distinct:

- calibration identity hash
- calibration result hash
- advisory identity hash
- advisory result hash
- projection identity hash
- projection result hash

Substituting one role for another blocks.

## Public API Preservation

Runtime export remains:

- `buildConfidenceCalibrationRecommendationProjection`

Public types remain:

- `ImmutableRecommendationProjectionEnvelope`
- `FrozenRecommendationProjectionConfiguration`
- `ConfidenceCalibrationRecommendationProjectionResult`

No public hashing or canonicalization helper is exported.

## Behavior Preservation

Valid complete-hash inputs preserve:

- `projection_ready`
- `projection_ready_with_warnings`
- `projection_no_adjustment`
- blocked status mappings
- confidence mismatch behavior
- lineage blocks
- leakage blocks
- feedback blocks
- warning/issue compatibility
- no-adjustment semantics
- Recommendation confidence non-mutation
- deep-frozen deterministic output

The projection remains non-authoritative and never applies confidence:

- `recommendation_confidence_unchanged`: `true`
- `application_eligible`: `false`
- `ranking_affected`: `false`
- `scanner_affected`: `false`
- `publication_affected`: `false`
- `execution_affected`: `false`
- `non_authoritative`: `true`
- `applied`: `false`

## Safety And Deployment

Runtime preview remains paused at:

- `runtime_preview_waiting_for_operator_inputs`

Deployment required: no.

Do not deploy preview, deploy production, modify Netlify, create deployment
artifacts, change environment variables, request credentials, or push runtime
changes.

Mandatory next action:

- Action 452 independent post-remediation projection verification.
- `action_452_independent_post_remediation_projection_verification`
