# Action 450 - Projection Advisory Status Hash-Binding Remediation Approval Gate

## Purpose

Action 450 is a static approval gate for remediating the Action 449 projection audit finding. It does not implement the remediation. It defines the exact permitted future Action 451 change so the Recommendation-facing projection adapter independently binds the complete advisory semantic result payload, including `advisory.status`, to the supplied advisory result hash before any projection output is consumed.

## Scope

This action is documentation, verifier, and focused tests only. It is static, local-only, implementation-free, source-immutable, execution-free, fixture-free, runtime-free, persistence-free, replay-free, provider-free, Supabase-free, Recommendation Engine-consumer-free, UI-consumer-free, confidence-application-free, recommendation-mutation-free, ranking-mutation-free, scanner-mutation-free, publication-mutation-free, execution-mutation-free, feedback-free, and deployment-free.

## Authoritative Dependencies

- Action 309 - Post-Recovery Safe Development Protocol
- Actions 431-446 - Verified Confidence Calibration Advisory chain
- Action 447 - Recommendation-facing projection contract
- Action 448 - Pure projection adapter implementation
- Action 449 - Independent projection audit
- `lib/confidence-calibration-recommendation-advisory-projection.ts`
- `lib/confidence-calibration-advisory-adapter.ts`
- `lib/pure-confidence-calibration.ts`
- `docs/action-441-static-confidence-calibration-advisory-hash-inventory.json`
- `docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json`

## Action 449 Blocked Decision

Action 449 completed successfully as an audit but returned readiness decision `blocked`.

- `verification_status`: `passed`
- `readiness_decision`: `blocked`
- passed conditions: `34`
- failed conditions: `1`
- unresolved conditions: `1`
- exact failed condition: `advisory_result_hash_audit`
- concrete finding: changing `advisory.status` while retaining the original advisory semantic result hash is not detected as an advisory result-hash binding failure.

## Root-Cause Classification

Exact classification:

`projection_advisory_semantic_result_hash_does_not_bind_status`

The projection adapter currently validates advisory identity/hash material, but it does not independently prove that the complete semantic advisory payload, including `advisory.status`, matches the supplied advisory result hash. The future remediation must close that phase-10 validation gap without changing public API, runtime integration, or valid projection behavior.

## Approved Remediation Surface

Action 451 may edit only:

- `lib/confidence-calibration-recommendation-advisory-projection.ts`
- `docs/action-451-projection-advisory-status-hash-binding-remediation.md`
- `scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs`
- `tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts`
- narrow Actions 447-450 compatibility updates
- minimal Actions 318-320 guard updates

## Forbidden Remediation Surface

Action 451 must not add or modify:

- projection fixtures
- hash inventories
- runners
- manifests
- shadow execution packages
- Recommendation Engine consumers
- UI consumers
- confidence application
- runtime routes or runtime preview
- persistence
- replay
- providers
- Supabase
- ranking, scanner, publication, or execution behavior
- feedback
- deployment artifacts
- Netlify configuration
- environment variables

## Advisory Semantic-Result Payload Definition

The future projection adapter must reconstruct the exact upstream ConfidenceCalibrationAdvisoryResult semantic result payload. It must not create a projection-specific approximation and must not omit a semantic field because the current projection output does not expose it.

Fields included in the advisory result hash:

- `status`
- `advisory_id`
- `recommendation_fingerprint`
- `recommendation_snapshot_hash`
- `original_confidence`
- `proposed_delta`
- `proposed_calibrated_confidence`
- `calibration_status`
- `calibration_id`
- `calibration_identity_hash`
- `calibration_result_hash`
- `warnings`
- `issues`
- `bounded_lineage`
- `advisory_eligible`
- `advisory_visible`
- `application_eligible`
- `non_authoritative`
- `applied`
- `bounded_reasons`
- `schema_version`
- `configuration_version`

Advisory status binding is mandatory: `status` is semantic and must be included in the independently recomputed advisory result hash.

## Complete Result-Field Inventory

Each semantic field in the upstream advisory result contract must be classified as one of:

- `included_in_advisory_result_hash`
- `explicitly_non_semantic_and_excluded`
- `absent_for_status_specific_shape`

No semantic field may remain unclassified.

The following fields are explicitly non-semantic and excluded from the advisory result hash:

- timestamps
- runtime state
- machine paths
- UI state
- output array position
- local process details
- raw rejected values
- secrets or credentials

## Status-Specific Payload Shapes

Every advisory status must use the same classification vocabulary:

- `advisory_ready`: all success semantics included in advisory result hash
- `advisory_ready_with_warnings`: success semantics, warnings, and warning lineage included in advisory result hash
- `advisory_no_adjustment`: no-adjustment status, zero delta, original confidence, and no-effect flags included in advisory result hash
- `advisory_insufficient_evidence`: blocked/insufficient-evidence semantics, issues, reasons, and lineage included in advisory result hash
- `blocked_invalid_input`: blocked semantics, issues, reasons, and lineage included in advisory result hash where present
- `blocked_confidence_mismatch`: blocked semantics, confidence mismatch issue, reasons, and lineage included in advisory result hash where present
- `blocked_invalid_lineage`: blocked semantics, lineage issue, reasons, and lineage included in advisory result hash where present
- `blocked_future_leakage`: blocked semantics, leakage issue, reasons, and leakage lineage included in advisory result hash where present
- `blocked_calibration_result`: blocked semantics, calibration-result issue, reasons, and calibration lineage included in advisory result hash where present
- `blocked_unsupported_status`: blocked semantics, unsupported-status issue, reasons, and bounded lineage included in advisory result hash where present

Status-specific absent fields must be represented through the upstream canonical null/omission behavior. Missing status, unsupported status, case variants, whitespace variants, and invented aliases must remain fail-closed.

## Canonicalization Policy

Action 451 must use deterministic canonicalization:

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

Semantically equivalent ordering must preserve the advisory result hash. Material content, multiplicity, or semantic field changes must invalidate it.

## Advisory Result-Hash Recompution Policy

The future projection adapter must independently compute:

`SHA-256(canonical advisory semantic result payload)`

It must compare the lowercase hexadecimal digest against the supplied advisory result hash with exact length and exact value. It must not trust hash format alone, advisory ID alone, advisory identity hash as a substitute, calibration hashes as substitutes, projection hashes as substitutes, or any legacy alternate path unless that path is explicitly frozen upstream.

The adapter must not silently repair, replace, round, normalize into agreement, continue with a warning, or reuse an unverified supplied hash.

## Supplied-Versus-Recomputed Comparison

The supplied advisory result hash and independently recomputed advisory result hash must be compared before Recommendation/advisory lineage checks. A mismatch must be deterministic and fail closed.

## Mismatch Behavior

On advisory semantic result-hash mismatch, return:

- status: `blocked_advisory_result`
- issue code: `blocked_advisory_result`
- issue path: `/advisory/advisory_hash`
- issue severity: `error`
- issue messageKey: `confidence_calibration_recommendation_projection.blocked_advisory_result`
- no raw expected hash
- no raw actual hash
- deterministic issue ordering
- deterministic issue deduplication
- no successful projection confidence metadata
- `recommendation_confidence_unchanged`: `true`
- `advisory_eligible`: `false` where present
- `application_eligible`: `false`
- `ranking_affected`: `false`
- `scanner_affected`: `false`
- `publication_affected`: `false`
- `execution_affected`: `false`
- `non_authoritative`: `true`
- `applied`: `false`

Do not add a new projection status. Prefer the existing `blocked_advisory_result` vocabulary.

## Validation Phase Placement

Action 451 must preserve the Action 447 15-phase order:

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

The semantic advisory result-hash verification belongs in phase 10. It must outrank phase 11 lineage, phase 12 anti-leakage, phase 13 anti-feedback, and phase 14 warning/issue compatibility. Phases 1-9 must still outrank phase 10.

## Phase-11 Defense In Depth

Action 451 must preserve Recommendation/advisory lineage checks after phase 10.

Required cases:

- Case A: mutate advisory lineage, retain old advisory result hash, expect phase-10 `blocked_advisory_result`
- Case B: mutate advisory lineage, recompute matching advisory result hash, expect phase-11 lineage block

## Retained-Hash Attack Matrix

Action 451 must block retained-hash mutation of:

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
- configuration version
- combined mutations

## Swapped-Hash Attack Matrix

Action 451 must block:

- advisory result hash from another valid advisory
- advisory identity hash used as advisory result hash
- calibration result hash used as advisory result hash
- projection identity hash used as advisory result hash
- unrelated valid-format hash
- all-zero hash
- all-f hash

## Semantic-Order-Equivalence Policy

Semantically equivalent reorderings of warnings, issues, lineage records, reasons, object keys, and nested object keys must preserve the recomputed advisory result hash and projection output. Changed multiplicity or material content must block.

## Hash-Role Separation

These must remain distinct and non-substitutable:

- calibration identity hash
- calibration result hash
- advisory identity hash
- advisory result hash
- projection identity/hash

Substitution between roles must block.

## API Preservation

Module remains:

`lib/confidence-calibration-recommendation-advisory-projection.ts`

Runtime export remains:

`buildConfidenceCalibrationRecommendationProjection`

Public type exports remain exactly:

- `ImmutableRecommendationProjectionEnvelope`
- `FrozenRecommendationProjectionConfiguration`
- `ConfidenceCalibrationRecommendationProjectionResult`

No public hashing helper, canonicalization helper, class, service, repository, cache, singleton, runtime route, or stateful adapter may be added.

## Unaffected-Output Preservation

Unaffected valid Action 448 inputs must preserve identical:

- projection status
- projection ID
- Recommendation fingerprint and snapshot hash
- confidence values
- warnings and issues
- bounded lineage
- visibility and effect flags
- canonical output
- `recommendation_confidence_unchanged`: `true`
- `non_authoritative`: `true`
- `applied`: `false`
- `application_eligible`: `false`

Coverage must include `projection_ready`, `projection_ready_with_warnings`, `projection_no_adjustment`, blocked statuses, confidence mismatch, lineage blocks, leakage blocks, and feedback blocks.

## No-Adjustment Preservation

No-adjustment remains exact:

- advisory status: `advisory_no_adjustment`
- proposed delta: `0`
- proposed confidence: exact Recommendation original confidence
- projection status: `projection_no_adjustment`
- `recommendation_confidence_unchanged`: `true`
- `application_eligible`: `false`
- `ranking_affected`: `false`
- `scanner_affected`: `false`
- `publication_affected`: `false`
- `execution_affected`: `false`
- `non_authoritative`: `true`
- `applied`: `false`

## Confidence-Binding Preservation

Recommendation original confidence and advisory original confidence remain compared by exact basis-point equality. One-basis-point mismatch, tiny decimal mismatch, excessive precision, signed-zero edge cases, NaN, Infinity, below-range, above-range, and missing values must remain fail-closed. The remediation must not round, repair, or rebase confidence.

## Anti-Leakage Preservation

Future outcomes, post-entry evidence, post-exit evidence, same-Recommendation realized outcome, evidence after decision boundary, missing leakage state, unknown leakage state, and prohibited self-calibration must remain blocked before feedback and warning/issue compatibility.

## Anti-Feedback Preservation

Projection metadata must not be reused as Recommendation confidence, scanner signal, ranking signal, publication signal, execution signal, Learning Dataset input, Pattern Discovery evidence, Intelligence Context, outcome, calibration evidence, advisory base input, or feedback event. Direct and indirect cycles must remain blocked.

## Recommendation Non-Mutation Preservation

Action 451 must preserve deep input immutability. The Recommendation envelope, Recommendation confidence, snapshot lineage, advisory result, warnings, issues, lineage, and configuration must not mutate on successful or blocked paths.

## Immutability And Determinism Preservation

Outputs remain deeply frozen and deterministic across repeated calls, blocked calls, interleaved calls, and semantically reordered input calls. No global-state contamination, runtime state, randomness, timestamps, or path-dependent behavior may affect output.

## Future Remediation Boundary

Action 451 is limited to the targeted phase-10 hash-binding remediation and its local verifier/test/doc. It must not create projection fixtures, hash-freeze packages, runners, manifests, shadow execution, consumers, runtime wiring, persistence, replay, provider calls, Supabase access, ranking/scanner/publication/execution changes, feedback, or deployment artifacts.

## Action 451 Regression Requirements

Action 451 must include at least these regression cases:

- valid advisory result hash accepted
- malformed advisory result hash blocked
- advisory status retained-hash tampering blocked
- advisory ID retained-hash tampering blocked
- proposed confidence retained-hash tampering blocked
- warning retained-hash tampering blocked
- issue retained-hash tampering blocked
- lineage retained-hash tampering blocked
- flags retained-hash tampering blocked
- swapped valid advisory result hash blocked
- hash-role substitution blocked
- phase-10 mismatch outranks phase-11 lineage
- recomputed matching hash allows phase-11 lineage defense
- semantic warning reorder accepted
- semantic issue reorder accepted
- semantic lineage reorder accepted
- valid projection outputs unchanged
- projection IDs unchanged for unaffected inputs
- no-adjustment unchanged
- confidence mismatch unchanged
- Recommendation non-mutation unchanged
- immutability and determinism unchanged

## Mandatory Post-Remediation Audit

After Action 451, the next required action is:

`action_452_independent_post_remediation_projection_verification`

Action 452 must not modify implementation. It must independently reconstruct the complete advisory result payload, independently recompute advisory result hashes, test advisory status retained-hash tampering, test the complete retained/swapped-hash matrix, verify phase-10 versus phase-11 behavior, verify unaffected outputs and projection IDs, confirm no consumer or side effect, and decide readiness for fixture/hash-freeze work.

Do not proceed directly to fixtures after Action 451.

## Deployment Prohibition

Deployment required: no.

- preview deployment authorized: `false`
- production deployment authorized: `false`
- runtime preview advancement authorized: `false`
- environment changes authorized: `false`
- credentials required: `false`
- Netlify changes authorized: `false`

Runtime preview remains:

`runtime_preview_waiting_for_operator_inputs`

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Approval Decision

Approval decision: `approved`

The root cause is precisely classified, the advisory semantic-result payload is frozen, advisory status is hash-bound, canonicalization and comparison are exact, mismatch behavior is fail-closed, phase-10 placement is exact, phase-11 remains active, retained/swapped-hash matrices are complete, API and unaffected behavior are preserved, remediation boundary is narrow, Action 452 is mandatory, and deployment remains prohibited.

## Passed Conditions

Passed conditions: `24`

- documentation contract frozen
- Action 449 blocked finding bound
- root-cause classification frozen
- complete semantic payload field inventory frozen
- advisory status binding frozen
- status-specific shapes frozen
- canonicalization policy frozen
- result-hash recomputation policy frozen
- supplied-versus-recomputed comparison frozen
- mismatch behavior frozen
- phase-10 placement frozen
- phase-11 defense in depth frozen
- retained-hash attack matrix frozen
- swapped-hash attack matrix frozen
- semantic-order equivalence frozen
- hash-role separation frozen
- API preservation frozen
- unaffected-output preservation frozen
- no-adjustment preservation frozen
- confidence/leakage/feedback preservation frozen
- Recommendation non-mutation frozen
- immutability and determinism frozen
- Action 451 boundary frozen
- mandatory Action 452 frozen

## Failed Conditions

Failed conditions: `0`

## Unresolved Conditions

Unresolved conditions: `0`

## Next Permitted Action

`action_451_projection_advisory_status_hash_binding_remediation`

## Safety Confirmation

No implementation remediation was performed in Action 450. No fixtures, runners, manifests, shadow packages, consumers, runtime routes, persistence, replay, providers, Supabase calls, confidence application, feedback, ranking/scanner/publication/execution changes, deployment artifacts, environment changes, or runtime preview changes are authorized or created by this gate.
