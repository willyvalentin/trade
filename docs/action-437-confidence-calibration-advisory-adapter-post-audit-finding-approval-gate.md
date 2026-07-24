# Action 437 - Confidence Calibration Advisory Adapter Post-Audit Finding Approval Gate

## Purpose

Action 437 freezes the approved remediation contract for the five Action 436 post-remediation findings. It is static, approval-gate-only, implementation-free, local-only, and source-immutable.

## Scope

Added artifacts:

- `docs/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.md`
- `scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs`
- `tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts`

Minimal Actions 318-320 guard updates are allowed only to classify these Action 437 audit artifacts.

## Authoritative Dependencies

- Action 309 post-recovery safe development protocol
- Actions 418-430 pure Confidence Calibration verification chain
- Action 431 advisory consumption contract approval gate
- Action 432 advisory adapter implementation
- Action 433 initial independent audit
- Action 434 semantic hash remediation approval gate
- Action 435 semantic hash remediation
- Action 436 independent post-remediation audit

## Action 436 Blocked Result

Action 436 returned:

- `verification_status: passed`
- `readiness_decision: blocked`

Exact failed conditions:

- `retained_hash_tampering_matrix`
- `isolation`
- `no_remaining_gaps`

The operator brief summarized the blocked audit with `retained_hash_tampering_matrix` and `no_remaining_gaps`; the current source-controlled Action 436 verifier also reports `isolation`, so Action 437 freezes the live verifier's full post-audit condition set.

Exact five findings:

1. `calibration_id_retained_hash_tampering_not_blocked`
2. `warning_code_retained_hash_tampering_not_blocked`
3. `warning_path_retained_hash_tampering_not_blocked`
4. `pattern_discovery_sha256_retained_hash_tampering_not_blocked`
5. `pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch`

## Root-Cause Classification

`calibration_semantic_result_payload_incomplete_for_identity_warning_and_pattern_lineage_fields`

Action 435 correctly recomputed a result hash, but the reconstructed semantic result payload was incomplete for calibration identity, complete warning records, and Pattern Discovery lineage fields.

## Approved Remediation Surface

Action 438 may only make targeted edits to:

- `lib/confidence-calibration-advisory-adapter.ts`
- `docs/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.md`
- `scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs`
- `tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts`
- narrow Actions 431-437 compatibility updates
- minimal Actions 318-320 guard updates

## Forbidden Remediation Surface

Action 438 must not add or modify:

- fixtures
- runner
- manifest
- shadow execution
- Recommendation Engine consumer
- UI integration
- confidence application
- persistence
- replay
- runtime or API route
- ranking, scanner, or publication behavior
- providers
- Supabase access
- feedback
- `lib/pure-confidence-calibration.ts`
- Action 426 inventory or freezer
- Action 429 manifest or runner
- runtime-preview artifacts

## Complete Calibration Semantic-Payload Policy

Action 438 must reconstruct a complete canonical Confidence Calibration result payload and must not leave undocumented omissions.

Field inventory:

- `status`: included in result hash
- `calibration_id`: included in result hash
- `calibration_hash`: excluded as the supplied digest being verified
- `original_confidence`: included in result hash as basis points
- `proposed_delta`: included in result hash as basis points
- `proposed_calibrated_confidence`: included in result hash as basis points
- `included_insight_ids`: included in result hash
- `excluded_insight_ids`: included in result hash with stable `insight_id` and `reason`
- `evidence_summary`: included in result hash
- `overlap_summary`: included in result hash
- `adjustments`: included in result hash
- `warnings`: included in result hash as complete warning records
- `issues`: included in result hash as complete issue records
- `lineage_hashes`: included in result hash as complete lineage records
- `non_authoritative`: included in result hash
- `applied`: included in result hash
- `configuration_version`: included in result hash when present or derivable from the upstream canonical payload

Status-specific nulls or empty inventories are allowed only when the upstream result shape defines them.

## Calibration-ID Binding Policy

The semantic result payload must bind:

- `calibration_id`

A material calibration-ID change with a retained result hash must return `blocked_calibration_result` at phase 10.

Continue separately validating:

- calibration-ID prefix
- calibration-ID suffix format
- identity-hash agreement

The semantic result-hash check supplements these checks and does not replace them.

## Complete Warning-Record Binding Policy

Every warning record must be represented by the complete frozen shape:

```json
{
  "code": "string",
  "path": "string",
  "severity": "string",
  "messageKey": "string"
}
```

All four warning fields must participate in semantic result hashing:

- `code`
- `path`
- `severity`
- `messageKey`

Canonicalization must validate warning shape first, normalize semantic ordering, deterministically deduplicate exact duplicates where upstream defines this, preserve materially different warning records, and sort by the exact upstream canonical warning order. Do not hash only warning codes.

## Pattern Discovery Hash Binding

Every calibration-result Pattern Discovery lineage hash that is present in the Action 420/426/429 result contract must be bound:

- `pattern_discovery_sha256`
- `pattern_discovery_result_sha256`
- `configuration_version` where present or derivable from `pattern_discovery_configuration_version`

A material change with a retained calibration result hash must return `blocked_calibration_result` at phase 10.

## Pattern Insight Lineage Binding Review

Action 438 must inventory every Pattern Insight lineage field and classify it as bound, explicitly non-semantic, or absent for the status-specific shape.

Required review:

- insight IDs: `included_insight_ids` and `excluded_insight_ids`
- insight SHA-256 values: `lineage_hashes[].insight_sha256`
- exclusion reasons: `excluded_insight_ids[].reason`
- evidence-set hashes: `lineage_hashes[].evidence_set_sha256`
- group hashes: `lineage_hashes[].group_sha256`
- source-scenario inventories: absent from `ConfidenceCalibrationResult`; if introduced later, they must be classified before use

Action 437 does not leave another known canonical upstream field unclassified.

## Phase-10 Precedence Policy

Preserve the 15-phase advisory validation order.

Semantic mismatch for calibration ID, warning fields, Pattern Discovery hashes, or other result-payload fields must return `blocked_calibration_result` during phase 10, calibration identity and result hashes.

Phase 10 must outrank:

- phase 11 Pattern Discovery and Pattern Insight lineage
- phase 12 anti-leakage
- phase 13 anti-feedback
- phase 14 warning/issue compatibility

Phases 1-9 still outrank phase 10.

## Phase-11 Defense-In-Depth Policy

Pattern Discovery and Pattern Insight lineage validation must remain in phase 11.

The same manipulated field may be protected by phase 10 semantic hash binding and phase 11 direct lineage validation. This is intentional defense in depth. Do not remove or weaken phase-11 checks merely because phase 10 catches the same attack earlier.

## Canonicalization Policy

Preserve:

- recursive object-key sorting
- stable semantic array ordering
- stable issue ordering
- stable warning ordering
- stable included and excluded insight ordering
- stable lineage ordering
- UTF-8
- no insignificant whitespace
- stable null and omission semantics
- signed-zero normalization

Semantically equivalent ordering must remain accepted. Materially different content must invalidate the hash.

## Mismatch Behavior

Continue using:

- status: `blocked_calibration_result`
- issue code: `blocked_calibration_result`
- issue path: `/calibration/calibration_hash`
- messageKey: `confidence_calibration_advisory.blocked_calibration_result`
- `advisory_eligible: false`
- `application_eligible: false`
- `non_authoritative: true`
- `applied: false`

Do not reveal expected or recomputed hash values.

## Validation-Order Preservation

Action 438 must preserve phases 1-15:

1. top-level input
2. configuration
3. recommendation envelope
4. recommendation fingerprint
5. snapshot lineage
6. original confidence
7. calibration result shape
8. calibration status eligibility
9. base-confidence agreement
10. calibration identity and result hashes
11. Pattern Discovery and Pattern Insight lineage
12. anti-leakage
13. anti-feedback
14. warnings/issues
15. output construction

## Identity, Result, And Advisory Hash Distinction

Keep these roles separate:

- calibration identity hash binds the identity payload
- calibration result hash binds the complete bounded calibration result payload
- advisory identity/hash binds the advisory consumption result

Substitutions between these values must fail closed.

## API Preservation

Public runtime export remains:

- `buildConfidenceCalibrationAdvisory`

Public type exports remain:

- `ImmutableRecommendationConfidenceEnvelope`
- `FrozenAdvisoryConsumptionConfiguration`
- `ConfidenceCalibrationAdvisoryResult`

Do not add public canonicalization helpers, public hashing helpers, classes, services, repositories, caches, singletons, async dependencies, runtime dependencies, or consumers.

## Unaffected Behavior Preservation

Action 438 must preserve identical outputs and advisory IDs for unaffected Action 432/435 cases:

- calibrated
- calibrated_with_warnings
- no_adjustment
- confidence mismatch
- blocked calibration statuses
- invalid recommendation lineage
- invalid calibration lineage
- leakage
- feedback

Preserve advisory statuses, flags, warnings, issues, lineage, canonical serialization, and advisory IDs.

## No-Adjustment Preservation

Valid no-adjustment must keep zero delta, proposed confidence equal to original confidence, `advisory_no_adjustment`, `non_authoritative: true`, `applied: false`, and `application_eligible: false`.

## Anti-Feedback Preservation

Anti-feedback validation remains phase 13. Phase-10 hash mismatch outranks anti-feedback when both are present, but anti-feedback must still block independently when the supplied result hash is recomputed consistently for the tampered payload.

## Anti-Leakage Preservation

Anti-leakage validation remains phase 12. Phase-10 hash mismatch outranks anti-leakage when both are present, but anti-leakage must still block independently when the supplied result hash is recomputed consistently for the tampered payload.

## Immutability Preservation

Action 438 must preserve input immutability and deeply frozen advisory outputs for valid, malformed-hash, semantic mismatch, and later-lineage-blocked paths.

## Determinism Preservation

Action 438 must preserve repeated-call determinism, interleaved-call determinism, reordered-input determinism, warning ordering, issue ordering, advisory ID stability, and canonical output stability.

## Regression Requirements

Action 438 must test at least:

- valid complete calibration result hash accepted
- calibration-ID retained-hash tampering blocked
- warning-code retained-hash tampering blocked
- warning-path retained-hash tampering blocked
- warning-severity retained-hash tampering blocked
- warning-messageKey retained-hash tampering blocked
- `pattern_discovery_sha256` tampering blocked
- `pattern_discovery_result_sha256` tampering blocked
- Pattern Discovery configuration hash tampering blocked where present
- every Pattern Insight lineage hash tampering blocked
- mismatch occurs at phase 10
- phase-10 mismatch outranks phase-11 lineage
- phase-11 lineage still blocks independently when supplied hash is recomputed consistently for the tampered payload
- semantically reordered warnings accepted
- semantically reordered lineage accepted
- valid calibrated output unchanged
- valid calibrated_with_warnings output unchanged
- valid no_adjustment output unchanged
- advisory IDs unchanged
- immutability unchanged
- determinism unchanged

## Future Remediation Boundary

Action 438 is remediation-only within the approved surface. It must not create fixture/hash-freeze artifacts, shadow execution, runtime preview work, consumers, or applied confidence behavior.

## Mandatory Independent Audit

After Action 438, require:

`Action 439 - Independent Complete Semantic Binding Verification`

Action 439 must not modify implementation. It must independently reconstruct the entire upstream canonical result payload, inventory every result field, test every retained-hash mutation, test phase-10 versus phase-11 defense in depth, verify unaffected outputs and advisory IDs, confirm no consumer or side effect exists, and decide readiness for fixture/hash-freeze work.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions

Return `approved` only if all five Action 436 findings have exact remediation rules, the full upstream payload is inventoried, calibration ID is bound, complete warning records are bound, Pattern Discovery hashes are bound, phase-10 precedence is exact, phase-11 validation remains, API and unaffected behavior remain preserved, the remediation boundary is narrow, and Action 439 is mandatory.

Return `approved_with_conditions` if one exact upstream field name or status-specific omission requires confirmation during Action 438.

Return `blocked` if the upstream payload cannot be reconstructed, public API changes are required, Confidence Calibration must be changed, runtime or persistence is required, or recommendation integration is required.

## Approval Decision

`approved`

## Passed, Failed, And Unresolved Conditions

The verifier reports passed, failed, and unresolved counts in JSON. Unresolved conditions must remain zero for a deterministic approval gate.

## Runtime Preview

Runtime preview remains:

`runtime_preview_waiting_for_operator_inputs`

## Next Permitted Action

`action_438_confidence_calibration_advisory_adapter_complete_semantic_binding_remediation`
