# Action 440 - Static Confidence Calibration Advisory Fixture and Hash-Freeze Approval Gate

## Purpose

Create a deterministic approval gate for one future static Confidence Calibration Advisory fixture and semantic hash-freeze package. This action is approval-gate only: it does not create fixtures, execute hashes, invoke `buildConfidenceCalibrationAdvisory`, run a shadow, persist data, or integrate with the Recommendation Engine.

## Scope

Added artifacts:

- `docs/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate.md`
- `scripts/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate-verify.mjs`
- `tests/e2e/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate.spec.ts`

Minimal Actions 318-320 guard updates may recognize only these Action 440 approval-gate artifacts.

## Authoritative Dependencies

- Action 309 post-recovery safety protocol.
- Actions 387-401 mapper chain.
- Actions 402-417 Pattern Discovery chain.
- Actions 418-430 pure Confidence Calibration chain.
- Actions 431-439 advisory adapter chain.
- Adapter SHA-256: `3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b`.
- Pure Confidence Calibration SHA-256 remains frozen by the Action 440 verifier.
- Action 426 and Action 429 packages remain frozen by the Action 440 verifier.

## Action 439 Decision

Action 439 reports:

- `verification_status: passed`
- `readiness_decision: ready_with_conditions`
- `runtime_preview_status: runtime_preview_waiting_for_operator_inputs`
- Recommendation Engine consumers: zero
- UI consumers: zero
- runtime integration: none
- persistence: none
- replay: none
- feedback: none
- confidence application: none
- recommendation mutation: none

The remaining fixture/hash condition is that executable advisory fixture hashes require a separate Action 441.

## Historical Compatibility Condition

Older Action 435, 436, and 437 suites can fail through historical nested Action 434 `no_unexpected_action434_consumers` because Action 439 and later artifacts are future audit-only artifacts outside those historical allowlists.

This condition is bounded. Future compatibility updates may recognize later audit-only artifacts, but must not change Action 433 or Action 436 blocked decisions, change Action 439 readiness, remove consumer scans, allow Recommendation Engine consumers, allow runtime routes, authorize integration, or broaden file boundaries.

## Explicit Non-Goals

Do not modify `lib/confidence-calibration-advisory-adapter.ts` or `lib/pure-confidence-calibration.ts`.

Do not create advisory fixture modules, a hash-freeze script, a runner, a manifest, a shadow runner, a Recommendation Engine consumer, a UI consumer, confidence application, ranking/scanner/publication changes, persistence, replay, Supabase access, provider access, feedback, schema changes, migrations, or runtime preview advancement.

## Fixture Package Definition

The future package is exactly 48 advisory scenarios, explicitly ordered as `ca440_01` through `ca440_48`. It may use only deterministic test-local `ImmutableRecommendationConfidenceEnvelope` values, deterministic bounded `ConfidenceCalibrationResult` values, fixed advisory configuration, fixed malformed variants, and fixed complete-hash or explicitly approved legacy-hash vectors.

It may not use production recommendations, Supabase rows, runtime recommendation outputs, browser storage, replay captures, provider data, arbitrary files, stdin, CLI scenario definitions, environment-selected inputs, directory discovery, randomized cases, automatic scenario enumeration, configurable scenario count, user-supplied scenarios, or runtime-derived calibration results.

## Scenario Inventory

Every scenario freezes: scenario ID, coverage family, recommendation fingerprint, recommendation snapshot hash, original confidence, decision boundary metadata, calibration status, calibration ID, calibration identity hash, calibration result hash, calibration configuration version, proposed delta, proposed confidence, warnings, issues, Pattern Discovery lineage, Pattern Insight lineage, anti-leakage state, anti-feedback declarations, expected advisory status, expected visibility, expected advisory eligibility, expected application eligibility, expected original confidence, expected proposed delta, expected proposed confidence, expected warning records, expected issue records, expected lineage output, expected advisory ID policy, `non_authoritative: true`, `applied: false`, and rationale.

The advisory ID policy is `confidence_calibration_advisory_v1:<first_24_chars_of_identity_sha256>`.

| ID | Primary family | Primary purpose | Hash mode | Expected status |
| --- | --- | --- | --- | --- |
| ca440_01 | eligible_success | calibrated complete-hash success | complete | advisory_ready |
| ca440_02 | eligible_success | calibrated_with_warnings success | complete | advisory_ready_with_warnings |
| ca440_03 | no_adjustment | no_adjustment exact equality | complete | advisory_no_adjustment |
| ca440_04 | blocked_calibration_input | insufficient evidence maps closed | complete | advisory_insufficient_evidence |
| ca440_05 | blocked_calibration_input | blocked invalid input maps closed | complete | blocked_invalid_input |
| ca440_06 | blocked_calibration_input | blocked invalid configuration maps closed | complete | blocked_invalid_input |
| ca440_07 | blocked_calibration_input | blocked invalid lineage maps closed | complete | blocked_invalid_lineage |
| ca440_08 | blocked_calibration_input | blocked future leakage maps closed | complete | blocked_future_leakage |
| ca440_09 | blocked_calibration_input | blocked overlapping evidence maps closed | complete | blocked_calibration_result |
| ca440_10 | blocked_calibration_input | blocked unsupported insight maps closed | complete | blocked_unsupported_status |
| ca440_11 | confidence_binding | exact confidence match | complete | advisory_ready |
| ca440_12 | confidence_binding | one basis point mismatch | complete | blocked_confidence_mismatch |
| ca440_13 | confidence_binding | decimal mismatch | complete | blocked_confidence_mismatch |
| ca440_14 | confidence_binding | invalid confidence precision | complete | blocked_calibration_result |
| ca440_15 | confidence_binding | below accepted confidence range | complete | blocked_invalid_input |
| ca440_16 | confidence_binding | above accepted confidence range | complete | blocked_invalid_input |
| ca440_17 | confidence_binding | NaN confidence rejected | complete | blocked_invalid_input |
| ca440_18 | confidence_binding | Infinity confidence rejected | complete | blocked_invalid_input |
| ca440_19 | confidence_binding | signed zero confidence remains exact | complete | advisory_ready |
| ca440_20 | recommendation_lineage | missing recommendation fingerprint | complete | blocked_invalid_lineage |
| ca440_21 | recommendation_lineage | malformed recommendation fingerprint | complete | blocked_invalid_lineage |
| ca440_22 | recommendation_lineage | changed recommendation fingerprint | complete | blocked_invalid_lineage |
| ca440_23 | recommendation_lineage | missing snapshot hash | complete | blocked_invalid_lineage |
| ca440_24 | recommendation_lineage | malformed snapshot hash | complete | blocked_invalid_lineage |
| ca440_25 | recommendation_lineage | changed snapshot retained identity | complete | blocked_invalid_lineage |
| ca440_26 | recommendation_lineage | changed original confidence retained snapshot | complete | blocked_confidence_mismatch |
| ca440_27 | complete_hash | valid complete semantic result hash | complete | advisory_ready |
| ca440_28 | legacy_hash | explicitly supported legacy result hash | legacy | advisory_ready |
| ca440_29 | calibration_integrity | malformed result hash | malformed | blocked_calibration_result |
| ca440_30 | calibration_integrity | swapped result hash | swapped | blocked_calibration_result |
| ca440_31 | complete_hash | complete hash mismatch cannot fall back | complete_mismatch | blocked_calibration_result |
| ca440_32 | fallback_bypass | legacy fallback bypass attempt | legacy_bypass | blocked_calibration_result |
| ca440_33 | calibration_integrity | calibration ID tampering | retained_hash | blocked_calibration_result |
| ca440_34 | warning_inventory | warning record tampering | retained_hash | blocked_calibration_result |
| ca440_35 | issue_inventory | issue record tampering | retained_hash | blocked_calibration_result |
| ca440_36 | pattern_discovery_lineage | Pattern Discovery hash tampering | retained_hash | blocked_calibration_result |
| ca440_37 | pattern_insight_lineage | Pattern Insight lineage tampering with recomputed hash | recomputed_complete | blocked_invalid_lineage |
| ca440_38 | anti_leakage | future outcome evidence | complete | blocked_future_leakage |
| ca440_39 | anti_leakage | post-entry evidence | complete | blocked_future_leakage |
| ca440_40 | anti_leakage | post-exit evidence | complete | blocked_future_leakage |
| ca440_41 | anti_leakage | same-recommendation realized result | complete | blocked_future_leakage |
| ca440_42 | anti_leakage | unknown leakage state | complete | blocked_future_leakage |
| ca440_43 | anti_feedback | calibration reused as Learning Dataset input | complete | blocked_invalid_lineage |
| ca440_44 | anti_feedback | Pattern Discovery evidence reuse | complete | blocked_invalid_lineage |
| ca440_45 | anti_feedback | recommendation base-confidence reuse | complete | blocked_invalid_lineage |
| ca440_46 | anti_feedback | scanner ranking publication execution reuse | complete | blocked_invalid_lineage |
| ca440_47 | warning_inventory | warning ordering and deduplication | complete | advisory_ready_with_warnings |
| ca440_48 | output_boundary | metadata-only advisory output boundary | complete | advisory_ready |

## Coverage Family Inventory

The 48 scenarios cover: eligible success, blocked calibration inputs, confidence binding, recommendation fingerprint scenarios, recommendation snapshot-lineage scenarios, calibration ID/hash scenarios, Pattern Discovery lineage scenarios, Pattern Insight lineage scenarios, anti-leakage scenarios, anti-feedback scenarios, warning scenarios, issue scenarios, no-adjustment scenarios, semantic-order-equivalence scenarios, legacy-hash compatibility scenarios, complete-hash scenarios, fallback-bypass scenarios, and output-boundary scenarios.

## Status Distribution

- `advisory_ready`: 6
- `advisory_ready_with_warnings`: 2
- `advisory_no_adjustment`: 1
- `advisory_insufficient_evidence`: 1
- `blocked_invalid_input`: 6
- `blocked_confidence_mismatch`: 3
- `blocked_invalid_lineage`: 12
- `blocked_future_leakage`: 6
- `blocked_calibration_result`: 10
- `blocked_unsupported_status`: 1

These counts are fixed and must not be derived from execution.

## Recommendation Envelope Inventory

Each scenario binds an immutable recommendation fingerprint, immutable snapshot hash, original confidence, decision boundary, source classification, and anti-mutation declarations. A mutable Recommendation object is not retained or constructed.

## Calibration Result Inventory

Each scenario binds bounded `ConfidenceCalibrationResult` metadata: status, calibration ID, identity hash, result hash, original confidence, proposed delta, proposed confidence, adjustments, warnings, issues, included/excluded insights, evidence and overlap summaries, Pattern Discovery lineage, Pattern Insight lineage, configuration version, anti-leakage state, `non_authoritative: true`, and `applied: false`.

Full production Pattern Insights and Recommendations are not retained.

## Advisory Configuration Inventory

Action 441 must use one fixed advisory configuration with the Action 432 schema, eligible status inventory, blocked status map, deterministic sorting policy, identity policy, non-authoritative policy, and application policy `never_apply_in_action_432`.

## Complete and Legacy Hash Policy

The package freezes complete-hash, legacy-hash, and fallback-bypass scenarios.

Required behavior:

- valid complete hash accepted
- valid approved legacy hash accepted
- changed complete semantic payload with old hash blocked
- changed legacy payload with old hash blocked
- complete-hash mismatch cannot fall back
- malformed hash cannot fall back
- swapped hash cannot fall back
- unrelated valid-format hash cannot fall back

## Confidence Binding Policy

Every scenario records recommendation original confidence, calibration original/base confidence, basis-point representation, exact expected agreement or mismatch, and expected advisory status. No rounding, repair, or environment-dependent normalization is allowed.

## Lineage and Temporal Boundary Policy

Each scenario records exact expected handling for recommendation fingerprint, snapshot hash, calibration identity/result hash, Pattern Discovery hashes, Pattern Insight hashes, evidence lineage, recommendation decision boundary, anti-leakage state, and anti-feedback state. Missing or inconsistent lineage must fail closed.

## Warning, Issue, and No-Adjustment Inventory

Every warning and issue record is bounded to:

```json
{
  "code": "string",
  "path": "/rfc6901/path",
  "severity": "warning_or_error",
  "messageKey": "confidence_calibration.*"
}
```

The package freezes exact ordering, exact deduplication, exact scenario membership, exact total distributions, stable messageKey namespace, and RFC 6901 paths. It retains no free-form messages or raw rejected values.

No-adjustment scenarios require delta zero, proposed confidence equal to original confidence, advisory status `advisory_no_adjustment`, `application_eligible: false`, `non_authoritative: true`, and `applied: false`. Tampered no-adjustment scenarios must block.

## Advisory Identity and Hash Policy

For every successful advisory result, Action 441 must freeze canonical identity inputs:

- advisory schema/configuration version
- recommendation fingerprint
- recommendation snapshot hash
- original confidence in basis points
- calibration status
- calibration ID
- calibration identity hash
- calibration result hash
- proposed delta in basis points
- proposed confidence in basis points
- canonical warnings
- canonical issues
- bounded lineage hashes

Action 441 must record advisory ID, full advisory identity SHA-256, canonical advisory result SHA-256, scenario-summary SHA-256, and package inventory SHA-256. It must not include timestamps, runtime state, machine paths, UI state, randomness, or scenario array position.

## Output Boundary

Future fixture output may retain only bounded metadata. It must not retain Recommendation objects, full Pattern Insight objects, full Pattern Discovery outputs, contexts, outcomes, provider payloads, Supabase payloads, mutation commands, ranking/scanner/publication commands, execution commands, feedback events, secrets, or environment values.

## Future Sequencing

Required sequence:

1. Action 441 - Static Advisory Fixture & Semantic Hash Freeze
2. Action 442 - Independent Advisory Hash-Freeze Verification
3. Action 443 - Static Advisory Shadow Execution Approval Gate
4. Action 444 - Static Advisory Shadow Execution
5. Action 445 - Independent Advisory Shadow Verification

Only after Action 445 may a separate Recommendation Engine consumption/integration approval gate be considered.

## Action 441 Boundary

Action 441 may add at most:

- `docs/action-441-static-confidence-calibration-advisory-hash-freeze.md`
- `docs/action-441-static-confidence-calibration-advisory-hash-inventory.json`
- `scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs`
- `scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs`
- `tests/e2e/action-441-static-confidence-calibration-advisory-hash-freeze.spec.ts`
- `narrow Action 440 and historical compatibility updates`
- `minimal Actions 318-320 guard updates`

It must not add an advisory shadow runner, shadow manifest, Recommendation Engine consumer, UI integration, confidence application, runtime, persistence, replay, provider access, Supabase access, feedback, ranking/scanner/publication changes, or execution path.

## Repeat-Run Policy

Action 441 must run the full freeze exactly twice and require identical scenario ordering, statuses, confidence values, warnings, issues, lineage outputs, advisory IDs, advisory identity hashes, result hashes, scenario hashes, aggregate distributions, full inventory payload, and full package hash. No third repair run is allowed.

## Stop Conditions

Stop if any condition occurs:

- adapter_hash_differs
- pure_confidence_calibration_hash_differs
- action_426_or_action_429_binding_differs
- scenario_count_not_48
- scenario_ids_or_order_differ
- unapproved_source_appears
- configuration_differs
- expected_status_differs
- independent_canonicalization_disagrees
- repeat_freeze_differs
- full_data_retention_required
- runtime_provider_supabase_replay_import_appears
- persistence_feedback_or_recommendation_mutation_appears

Do not remediate discrepancies in Action 441.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

Expected decision for Action 440: `approved_with_conditions`, because scenario inventory is complete and exact executable semantic hashes require Action 441.

Return `approved` only after executable fixture/hash-freeze work is complete in a future bounded action. Return `blocked` if the scenario scope cannot be bounded, expected advisory behavior remains ambiguous, production inputs are required, complete/legacy compatibility cannot be represented deterministically, full recommendation retention is required, or runtime/persistence is required.

## Deterministic Gate Conditions

The verifier checks documentation, Action 439 decision, historical compatibility condition, exact scenario count and IDs, coverage-family mapping, recommendation-envelope inventory, calibration-result inventory, exact configuration policy, status distribution, complete/legacy hash policy, confidence-binding cases, lineage/leakage/feedback cases, warning/issue/no-adjustment inventories, output boundaries, advisory identity/hash policy, future sequencing, Action 441 boundary, repeat-run policy, stop conditions, absence of fixture/hash inventory/runner/manifest/shadow artifacts, source integrity, and runtime-preview paused state.

## Approval Decision

- Decision: `approved_with_conditions`
- Passed conditions: all static Action 440 gate conditions
- Failed conditions: none expected
- Unresolved conditions: executable semantic hashes require Action 441
- Next permitted Action: `action_441_static_confidence_calibration_advisory_hash_freeze`
