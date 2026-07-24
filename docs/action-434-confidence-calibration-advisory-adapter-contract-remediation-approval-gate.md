# Action 434 - Confidence Calibration Advisory Adapter Contract Remediation Approval Gate

## Purpose

Action 434 freezes the approved remediation contract for the Action 432 Confidence Calibration advisory adapter after the independent Action 433 audit found one blocking condition.

This is an approval gate only. It does not implement the remediation, create fixtures, create runners, execute shadow workflows, add consumers, advance runtime preview, apply confidence, persist anything, call providers, query Supabase, run replay, or change scanner, ranking, recommendation, publication, broker, execution, risk, or Learning Acceleration behavior.

## Scope

Approved scope:

- document the exact remediation contract for Action 435
- verify that Action 433 remains blocked for the exact expected reason
- verify that the current implementation and upstream pure/static sources remain unchanged
- verify that no advisory fixture, runner, manifest, shadow execution, runtime route, persistence path, provider path, Supabase path, feedback path, Recommendation Engine consumer, ranking mutation, scanner mutation, or publication mutation exists
- update Actions 318-320 guards only for this Action 434 document, verifier, and test

Forbidden scope:

- modifying `lib/confidence-calibration-advisory-adapter.ts`
- modifying `lib/pure-confidence-calibration.ts`
- modifying Pattern Discovery, mapper, Action 426, or Action 429 sources
- adding public hashing helpers
- adding UI, app, API, runtime, replay, provider, Supabase, persistence, feedback, ranking, scanner, publication, broker, execution, or risk integration
- creating advisory fixtures, runners, manifests, or shadow execution artifacts

## Authoritative Dependencies

Action 434 builds on:

- Action 309 Post-Recovery Safe Development Protocol
- Actions 418-430 Pure Confidence Calibration verification chain
- Action 431 Confidence Calibration Advisory Consumption Contract Approval Gate
- Action 432 Pure Confidence Calibration Advisory Adapter Implementation
- Action 433 Independent Confidence Calibration Advisory Adapter Verification

The protected source baseline is:

- `lib/confidence-calibration-advisory-adapter.ts`: `7c7c2b8f1056734ccda6cc12bacc478f6c76daa2f47da827b0f29f28fcf46976`
- `lib/pure-confidence-calibration.ts`: `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`
- `lib/pure-pattern-discovery.ts`: `48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c`
- `lib/snapshot-to-learning-dataset-mapper.ts`: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- `docs/action-426-static-confidence-calibration-hash-inventory.json`: `e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe`
- `scripts/action-426-static-confidence-calibration-hash-freeze.mjs`: `f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa`
- `docs/action-429-static-confidence-calibration-shadow-input-manifest.json`: `f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59`
- `scripts/action-429-static-confidence-calibration-shadow-run.mjs`: `dd073134a96583caddae345c9c84be6bc4a327198c65aa29d8d191e4ea21b882`

## Action 433 Blocked Decision

Action 433 result:

- `verification_status`: `passed`
- `readiness_decision`: `blocked`
- `passed_conditions_count`: `24`
- `failed_conditions_count`: `1`
- `unresolved_conditions_count`: `0`
- failed condition: `calibration_identity_and_hash`

Exact remaining gaps:

- `swapped_result_hash_blocks`
- `changed_status_retained_hash_blocks`
- `changed_proposed_confidence_retained_hash_blocks`
- `changed_warning_inventory_retained_hash_blocks`

## Root-Cause Classification

Root-cause classification:

`calibration_semantic_result_hash_not_recomputed`

The current adapter treats the supplied calibration result hash as lineage metadata and validates its shape, but it does not fully prove that the bounded semantic Confidence Calibration result payload still matches the supplied hash. A valid-looking hash can therefore travel with a tampered semantic payload until later checks happen or an advisory is constructed.

## Approved Remediation Surface

Action 435 is approved to edit only:

- `lib/confidence-calibration-advisory-adapter.ts`
- `docs/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.md`
- `scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs`
- `tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts`
- narrow Actions 431-434 compatibility updates
- minimal Actions 318-320 guard updates

The remediation may add private internal canonicalization and hashing helpers inside `lib/confidence-calibration-advisory-adapter.ts`.

The remediation must not add public hashing helpers or change the public API.

## Forbidden Remediation Surface

Action 435 is not approved to add or modify:

- fixture packages
- runners
- manifests
- shadow execution
- Recommendation Engine consumers
- UI integration
- confidence application
- persistence
- replay
- runtime routes
- provider calls
- Supabase reads or writes
- ranking, scanner, publication, broker, execution, risk, or Learning Acceleration integration
- feedback loops
- Action 426 or Action 429 static artifacts
- pure Confidence Calibration, Pattern Discovery, or mapper implementation

## Calibration Semantic-Payload Definition

The future adapter remediation must use the exact Action 420 and Action 426 canonical Confidence Calibration result contract. It must not invent an adapter-specific semantic payload.

The bounded semantic payload that must participate in independent result-hash recomputation includes, where present:

- `schema_marker`
- `status`
- `configuration_version`
- `calibration_id`
- `calibration_hash`
- `original_confidence`
- `base_confidence_basis_points`
- `proposed_delta`
- `proposed_delta_basis_points`
- `proposed_calibrated_confidence`
- `proposed_calibrated_confidence_basis_points`
- `included_insight_ids`
- `included_insight_hashes`
- `excluded_insight_ids`
- stable exclusion reasons
- `evidence_summary`
- `overlap_summary`
- `overlap_resolution_summary`
- `adjustments`
- `warnings`
- `issues`
- `lineage_hashes`
- `non_authoritative`
- `applied`

The bounded semantic payload excludes:

- timestamps
- runtime state
- machine paths
- UI state
- mutable Recommendation objects
- array output position
- randomness
- credentials
- arbitrary environment values

## Canonicalization Policy

Action 435 must independently canonicalize the calibration result using the exact frozen Confidence Calibration canonical result policy:

- recursively sorted object keys
- stable semantic array ordering where the contract defines sorted semantic inventory
- UTF-8 encoding
- no insignificant whitespace
- stable `null` representation
- omitted `undefined` fields
- normalized signed zero where relevant
- no dynamic fields
- no runtime-dependent values
- no object insertion-order trust
- no incoming warning-order trust
- no incoming issue-order trust
- no incoming included/excluded-order trust where the contract defines semantic sorting

The canonical byte string is:

`JSON.stringify(canonicalize(confidence_calibration_result_semantic_payload))`

where `canonicalize` follows the Action 420/426 policy.

## Calibration-Result-Hash Recalculation Policy

Action 435 must compute:

`SHA-256(canonical calibration result payload)`

The representation must be exact lowercase hexadecimal.

The independently recomputed hash must be compared with the supplied calibration result hash.

The adapter must not:

- repair the supplied hash
- replace the supplied hash silently
- continue with warning-only readiness
- use only calibration ID as a substitute
- trust the result because the calibration ID format is valid

## Supplied-Versus-Recomputed Comparison Policy

The comparison is exact string equality after validating that both hashes are lowercase 64-character SHA-256 hex strings.

If the supplied hash and recomputed hash differ, Action 435 must fail closed in phase 10 before later lineage, leakage, feedback, and warning checks.

The failure must not expose raw expected or actual hash values.

## Calibration Identity-Hash Preservation

The calibration identity hash and calibration result hash serve different purposes:

- the calibration identity hash binds the calibration identity payload
- the calibration result hash binds the full bounded result payload

Action 435 must preserve the existing checks for:

- calibration identity hash format
- identity lineage
- malformed result hash format
- calibration ID format
- calibration ID prefix

It must not weaken or conflate identity-hash and result-hash checks.

## Calibration-ID Preservation

Action 435 must preserve:

- `confidence_calibration_v1:` ID prefix validation
- exact calibration ID format validation
- existing issue behavior for missing, malformed, or wrongly prefixed calibration IDs
- existing advisory identity behavior for unaffected valid inputs

## Status Binding

The semantic result hash must bind `status`.

If `status` is changed while the old result hash is retained, the adapter must fail closed as a calibration result hash mismatch.

Earlier status eligibility checks still run before the semantic hash comparison. Unsupported status remains blocked by the existing unsupported-status path before phase 10.

## Proposed-Confidence Binding

The semantic result hash must bind:

- `original_confidence`
- `base_confidence_basis_points`
- `proposed_delta`
- `proposed_delta_basis_points`
- `proposed_calibrated_confidence`
- `proposed_calibrated_confidence_basis_points`

If proposed delta or proposed calibrated confidence changes while the old result hash is retained, the adapter must fail closed.

## Warning Binding

The semantic result hash must bind the warning inventory.

Warning entries must be canonicalized according to the Action 420/426 result policy. Semantically equivalent warning ordering remains accepted only where canonical sorting makes it equivalent.

Warning inventory tampering with a retained result hash must fail closed.

## Issue Binding

The semantic result hash must bind the issue inventory.

Issue entries must be canonicalized according to the Action 420/426 result policy. Semantically equivalent issue ordering remains accepted only where canonical sorting makes it equivalent.

Issue inventory tampering with a retained result hash must fail closed.

## Included And Excluded Insight Binding

The semantic result hash must bind:

- `included_insight_ids`
- `included_insight_hashes`
- `excluded_insight_ids`
- stable exclusion reasons

Included or excluded insight inventory tampering with a retained result hash must fail closed.

## Overlap-Summary Binding

The semantic result hash must bind:

- `overlap_summary`
- `overlap_resolution_summary`
- overlap deduplication counts
- overlap exclusion counts
- overlap conflict counts

Overlap-summary tampering with a retained result hash must fail closed.

## Lineage Binding

The semantic result hash must bind `lineage_hashes`.

Lineage-hash tampering with a retained result hash must fail closed in phase 10 before later Pattern Discovery and Pattern Insight lineage checks.

## Validation-Order Placement

Action 435 must preserve the Action 431 validation order:

1. top-level input shape
2. advisory configuration
3. recommendation envelope shape
4. recommendation fingerprint
5. recommendation snapshot lineage
6. original confidence validity
7. calibration result shape
8. calibration status eligibility
9. base-confidence agreement
10. calibration identity and result hashes
11. Pattern Discovery and Pattern Insight lineage
12. anti-leakage
13. anti-feedback
14. warning/issue compatibility
15. output construction

Semantic result-hash recomputation belongs inside phase 10.

A result-hash mismatch must outrank later lineage, leakage, feedback, and warning faults. Earlier phases must still outrank it.

## Mismatch Status Policy

The approved mismatch behavior uses existing advisory vocabulary:

- status: `blocked_calibration_result`
- issue code: `blocked_calibration_result`
- RFC 6901 path: `/calibration/calibration_hash`
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

No raw expected hash, actual hash, canonical payload, timestamp, credential, environment value, or runtime path may appear in the issue.

## Issue Policy

The mismatch issue must be deterministic and bounded:

- exact issue code: `blocked_calibration_result`
- exact path: `/calibration/calibration_hash`
- exact severity: `error`
- exact messageKey: `confidence_calibration_advisory.blocked_calibration_result`
- no raw values
- deterministic issue ordering
- no warning-only continuation

## Public API Preservation

The public API must remain exactly:

Module:

- `lib/confidence-calibration-advisory-adapter.ts`

Runtime export:

- `buildConfidenceCalibrationAdvisory`

Public type exports:

- `ImmutableRecommendationConfidenceEnvelope`
- `FrozenAdvisoryConsumptionConfiguration`
- `ConfidenceCalibrationAdvisoryResult`

The function signature must remain unchanged. Internal helpers may remain private. No public hashing helpers may be exported.

## Advisory Output Preservation

For unaffected inputs, Action 435 must preserve identical:

- advisory status
- advisory ID
- advisory hash
- confidence values
- warning inventory
- issue inventory
- lineage metadata
- canonical output serialization
- `non_authoritative: true`
- `applied: false`
- `application_eligible: false`

Unaffected cases include:

- `calibrated`
- `calibrated_with_warnings`
- `no_adjustment`
- confidence mismatch
- blocked calibration statuses
- recommendation fingerprint validation
- snapshot lineage
- anti-leakage
- anti-feedback
- warnings and issues
- no-adjustment semantics
- advisory identity
- immutability
- determinism

## Anti-Feedback Preservation

Action 435 must preserve all anti-feedback blockers and must not reuse advisory output as:

- Learning Dataset input
- Pattern Discovery evidence
- outcome
- context
- recommendation base confidence
- scanner signal
- ranking signal
- publication signal
- execution signal
- calibration input evidence

Circular calibration lineage must remain blocked.

## Anti-Leakage Preservation

Action 435 must preserve all anti-leakage blockers for:

- future outcome evidence
- post-entry evidence
- post-exit evidence
- same recommendation realized result
- evidence after decision boundary
- prohibited self-calibration

## Immutability Preservation

Action 435 must preserve deep-frozen outputs and must not mutate input recommendation or calibration objects.

## Determinism Preservation

Action 435 must preserve:

- repeated-call determinism
- interleaved-call determinism
- canonical warning and issue ordering
- advisory ID determinism
- advisory hash determinism
- no runtime-dependent values

## Hash-Regression Requirements

The adapter source hash may change in Action 435.

Protected sources must not change:

- pure Confidence Calibration
- Pattern Discovery
- mapper
- Action 426 hash inventory
- Action 426 hash-freeze script
- Action 429 manifest
- Action 429 runner

For every unaffected valid Action 432 case, Action 435 must produce identical advisory output and advisory identity.

For the Action 433 gap families and the expanded attack matrix, Action 435 must produce deterministic blocked output.

## Attack Matrix

Action 435 must block:

- supplied result hash replaced with another valid hash
- swapped result hash from another calibration
- status changed while retaining old result hash
- proposed delta changed while retaining old result hash
- proposed calibrated confidence changed while retaining old result hash
- warning inventory changed while retaining old result hash
- issue inventory changed while retaining old result hash
- included insight inventory changed while retaining old result hash
- excluded insight inventory changed while retaining old result hash
- overlap summary changed while retaining old result hash
- lineage hash changed while retaining old result hash
- advisory flags changed while retaining old result hash
- canonical array order changed semantically

Action 435 must continue accepting semantically equivalent reordered arrays where canonical ordering makes them equivalent.

## Future Remediation Boundary

Action 435 may only implement the semantic hash remediation and compatibility checks described here.

It must not proceed to fixtures, shadow execution, runtime preview, consumer integration, confidence application, persistence, replay, providers, Supabase, feedback, scanner, ranking, or publication.

## Action 435 Regression Requirements

Action 435 must preserve the complete Action 432 regression suite and add focused cases for:

- correct result hash accepted
- malformed result hash blocked
- swapped valid result hash blocked
- status changed with retained hash blocked
- proposed delta changed with retained hash blocked
- proposed confidence changed with retained hash blocked
- warning inventory changed with retained hash blocked
- issue inventory changed with retained hash blocked
- included insight inventory changed with retained hash blocked
- excluded insight inventory changed with retained hash blocked
- overlap summary changed with retained hash blocked
- lineage changed with retained hash blocked
- semantically equivalent warning ordering accepted
- semantically equivalent issue ordering accepted where contract permits
- hash mismatch outranks later lineage fault
- hash mismatch outranks leakage fault
- hash mismatch outranks feedback fault
- valid calibrated output unchanged
- valid calibrated_with_warnings output unchanged
- valid no_adjustment output unchanged
- advisory identity unchanged for unaffected inputs
- immutability unchanged
- determinism unchanged

## Mandatory Independent Post-Remediation Audit

After Action 435, the next required action is:

`Action 436 - Independent Post-Remediation Advisory Adapter Verification`

Action 436 must:

- not modify implementation
- independently recompute calibration result hashes
- test all four Action 433 gap families
- test additional payload-tampering variants
- verify validation precedence
- verify unaffected advisory outputs and IDs
- verify no consumer or side effect exists
- decide readiness for advisory fixture/hash-freeze work

The project must not proceed directly to fixtures after Action 435.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

Return `approved` only if:

- the semantic calibration result payload is exact
- canonicalization is exact
- result hash is independently recomputed
- mismatch behavior is fail-closed
- phase-10 placement is exact
- all four Action 433 gaps are covered
- API and unaffected behavior remain preserved
- remediation boundary is narrow
- Action 436 is mandatory

Return `approved_with_conditions` only if one exact existing blocked status or issue code must be finalized during Action 435.

Return `blocked` if:

- full result hashing cannot be reconstructed
- Action 426/429 contract is ambiguous
- public API changes are required
- Recommendation Engine integration is required
- persistence or runtime is required
- valid advisory behavior must broadly change

## Deterministic Gate Conditions

Passed conditions:

- Action 433 blocked decision is exact
- failed condition is exactly `calibration_identity_and_hash`
- remaining gap inventory is exact
- root-cause classification is exact
- semantic payload is defined from the Action 420/426 canonical result contract
- canonicalization policy is exact
- SHA-256 recomputation policy is exact
- supplied-versus-recomputed comparison policy is exact
- mismatch behavior uses existing `blocked_calibration_result` vocabulary
- phase-10 validation placement is exact
- attack matrix is complete
- identity hash and result hash are distinct
- public API is preserved
- unaffected behavior is preserved
- Action 435 boundary is narrow
- Action 435 regression inventory is complete
- Action 436 independent audit is mandatory
- implementation remains unchanged in Action 434
- no fixtures, runners, manifests, or shadow execution are created
- no consumer, runtime, persistence, replay, provider, Supabase, feedback, recommendation, ranking, scanner, or publication change exists
- runtime preview remains `runtime_preview_waiting_for_operator_inputs`

Failed conditions:

- none

Unresolved conditions:

- none

## Approval Decision

Approval decision:

`approved`

Action 435 may proceed only within the narrow remediation boundary above.

## Next Permitted Action

`action_435_confidence_calibration_advisory_adapter_semantic_hash_remediation`

Action 436 is mandatory immediately after Action 435.
