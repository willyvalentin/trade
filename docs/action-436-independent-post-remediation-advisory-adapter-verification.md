# Action 436 - Independent Post-Remediation Advisory Adapter Verification

## Purpose

Action 436 independently audits the Action 435 Confidence Calibration advisory adapter semantic-hash remediation. It is static, local-only, audit-only, and source-immutable.

## Scope

Added artifacts:

- `docs/action-436-independent-post-remediation-advisory-adapter-verification.md`
- `scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs`
- `tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts`

Minimal guard updates are allowed only for Actions 318-320.

## Authoritative Dependencies

- Action 309 post-recovery safe development protocol
- Actions 418-430 pure Confidence Calibration chain
- Action 431 advisory consumption contract
- Action 432 advisory adapter implementation
- Action 433 independent adapter audit
- Action 434 semantic hash remediation approval gate
- Action 435 semantic hash remediation

## Action 433 Finding

Action 433 found `calibration_identity_and_hash` blocked readiness because retained or swapped result hashes were not independently recomputed.

Original gap inventory:

- `swapped_result_hash_blocks`
- `changed_status_retained_hash_blocks`
- `changed_proposed_confidence_retained_hash_blocks`
- `changed_warning_inventory_retained_hash_blocks`

## Action 434 Approval

Action 434 approved only the semantic result-hash remediation rooted in:

`calibration_semantic_result_hash_not_recomputed`

## Action 435 Remediation Summary

Action 435 added private adapter-side semantic hash validation. The adapter reconstructs the bounded Confidence Calibration result hash payload, canonicalizes it deterministically, recomputes SHA-256, and compares it to `calibration.calibration_hash` before Pattern Discovery lineage, leakage, feedback, warning/issue compatibility, or advisory output construction.

## Explicit Non-Goals

Action 436 does not remediate defects, create fixtures, create a runner, create a manifest, execute advisory shadow, add a Recommendation Engine or UI consumer, apply confidence, modify ranking/scanner/publication, persist advisory outputs, use replay, access providers, access Supabase, create feedback, or advance runtime preview.

## Source-Integrity Audit

The verifier records before/after SHA-256 hashes for:

- `lib/confidence-calibration-advisory-adapter.ts`
- `lib/pure-confidence-calibration.ts`
- `lib/pure-pattern-discovery.ts`
- `lib/snapshot-to-learning-dataset-mapper.ts`
- Action 426 inventory and freezer
- Action 429 manifest and runner
- static learning/context/pattern fixtures

## API And Export Audit

Expected runtime export:

- `buildConfidenceCalibrationAdvisory`

Expected public type exports:

- `ImmutableRecommendationConfidenceEnvelope`
- `FrozenAdvisoryConsumptionConfiguration`
- `ConfidenceCalibrationAdvisoryResult`

Forbidden API expansion:

- public canonicalization helper
- public hashing helper
- class
- service
- repository
- cache
- singleton
- async/runtime dependency

## Upstream Calibration-Result Contract Audit

The independent audit reconstructs the exact upstream pure Confidence Calibration hash payload from the frozen result contract:

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

## Status-Specific Payload Audit

Covered statuses:

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

Eligible statuses must carry valid independently recomputed result hashes. Blocked statuses must remain fail-closed through frozen status mapping.

## Canonicalization Audit

The verifier independently audits:

- recursive object-key sorting
- UTF-8 JSON serialization
- no insignificant whitespace
- stable null and omission semantics
- signed-zero normalization
- canonical warning ordering
- canonical issue ordering
- canonical included and excluded insight ordering
- canonical lineage ordering
- stable evidence and overlap summary ordering

Excluded from canonical payload:

- timestamps
- runtime state
- machine paths
- UI state
- output array position
- randomness
- Recommendation objects

## Independent SHA-256 Audit

For representative eligible results the verifier reconstructs the canonical payload independently, serializes it independently, computes SHA-256 independently, compares it to `calibration.calibration_hash`, and confirms successful advisory mapping through the public adapter API.

## Supplied-Versus-Recomputed Comparison Audit

The supplied result hash must exactly equal the independent recomputed lowercase SHA-256 hex digest. Malformed hash variants must fail before or at the frozen identity/hash phase. Well-formed swapped and retained-hash mismatches must fail as `blocked_calibration_result`.

## Malformed-Hash Audit

Covered variants:

- missing result hash
- malformed hexadecimal hash
- uppercase hash
- short hash
- long hash
- hash from another calibration scenario
- calibration identity hash as result hash
- advisory hash as result hash
- all-zero valid-format hash
- all-f valid-format hash

## Retained-Hash Tampering Audit

Covered material mutations:

- status
- calibration ID
- original confidence
- proposed delta
- proposed calibrated confidence
- included insight IDs
- excluded insight IDs
- exclusion reason
- evidence summary
- overlap summary
- warning code
- warning path
- warning severity
- warning message key
- issue code
- issue path
- issue severity
- issue message key
- Pattern Discovery lineage hashes
- Pattern Insight ID
- Pattern Insight hash
- calibration configuration version
- anti-leakage lineage
- `non_authoritative`
- `applied`

## Semantic-Order-Equivalence Audit

The verifier confirms semantically equivalent ordering changes preserve recomputed result hash, advisory output, advisory ID, and canonical serialization where the contract is order-independent.

## Validation-Precedence Audit

Frozen phases:

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

## Hash-Role-Separation Audit

The audit distinguishes:

- calibration identity hash, binding identity payload
- calibration result hash, binding bounded result payload
- advisory identity/hash, binding advisory consumption payload

Substitutions between these roles must fail closed.

## Unaffected-Output Regression

The verifier compares stable representative Action 432 outputs for calibrated, calibrated-with-warnings, no-adjustment, confidence mismatch, blocked statuses, lineage blocks, leakage blocks, and feedback blocks.

## No-Adjustment Audit

Valid no-adjustment must keep zero delta, equal proposed/original confidence, correct result hash, `advisory_no_adjustment`, `non_authoritative: true`, `applied: false`, and `application_eligible: false`.

## Warning And Issue Audit

Hash mismatch must produce deterministic `blocked_calibration_result` with path `/calibration/calibration_hash`, severity `error`, and stable message key without exposing raw expected hashes, actual hashes, timestamps, secrets, environment values, or machine paths.

## Immutability Audit

Inputs and outputs are serialized and compared before and after valid, malformed-hash, semantic mismatch, and later-lineage-blocked calls.

## Determinism Audit

The verifier covers repeated valid calls, repeated mismatch calls, interleaved valid/invalid calls, reordered inputs, issue order, warning order, advisory ID, and canonical output stability.

## Isolation Audit And Consumer Inventory

No Recommendation Engine consumer, UI consumer, runtime/API route, background job, persistence, replay, provider/news access, Supabase access, ranking mutation, scanner mutation, publication mutation, recommendation mutation, confidence application, feedback, or production consumer is allowed.

Only bounded Actions 431-436 tests and verifiers may consume the adapter.

## Remaining-Gap Inventory

Action 436 is independent and may return `blocked`. Any gap is recorded without remediation.

## Fixture And Hash-Freeze Readiness

Fixture/hash-freeze work is not permitted by Action 436. Future readiness requires a non-blocked independent audit.

## Readiness Vocabulary

Use exactly:

- `ready`
- `ready_with_conditions`
- `blocked`

## Readiness Decision

The verifier returns:

- `ready` only if every independent condition passes.
- `ready_with_conditions` only if remediation is sound and the only remaining work is future exact static advisory fixtures and hashes.
- `blocked` if any semantic field is not hash-bound, retained/swapped-hash attack passes, valid reordering fails, precedence differs, valid output drifts, identity is unstable, mutation appears, consumer appears, or side effect appears.

## Passed, Failed, And Unresolved Conditions

The verifier reports passed, failed, and unresolved counts in JSON. Unresolved conditions must remain zero for a deterministic audit.

## Runtime Preview

Runtime preview remains:

`runtime_preview_waiting_for_operator_inputs`

## Next Permitted Action

If blocked, the next permitted Action is a narrow approval gate for the Action 436 finding. No fixture, hash-freeze, shadow, runtime preview, or consumer work may proceed directly from a blocked audit.
