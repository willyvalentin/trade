# Action 422 - Pure Confidence Calibration Contract Remediation Approval Gate

## Purpose

Action 422 freezes the exact remediation contract for the three Action 421 Confidence Calibration findings.

This is an approval gate only. It does not implement remediation and does not create fixtures, runners, manifests, shadow execution, runtime integration, persistence, replay, provider calls, Supabase access, feedback, recommendation mutation, scanner mutation, or ranking mutation.

## Scope

Approved scope:

- static documentation
- static local verifier
- focused local tests
- minimal Actions 318-320 guard allowlist updates

Forbidden in Action 422:

- edits to `lib/pure-confidence-calibration.ts`
- edits to `tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts`
- mapper changes
- Pattern Discovery changes
- fixture changes
- runtime route changes
- configuration changes
- calibration execution
- shadow execution
- persistence
- replay
- provider access
- Supabase access
- feedback or recommendation mutation

Runtime preview remains paused at `runtime_preview_waiting_for_operator_inputs`.

## Authoritative Dependencies

This gate builds on:

- Action 309 - Post-Recovery Safe Development Protocol
- Actions 402-417 - Pure Pattern Discovery chain
- Action 418 - Pure Confidence Calibration contract
- Action 419 - Pure Confidence Calibration implementation approval gate
- Action 420 - Pure Confidence Calibration implementation
- Action 421 - Independent Pure Confidence Calibration verification and hash audit

## Action 421 Blocked Decision

Action 421 result:

- `verification_status`: `passed`
- `readiness_decision`: `blocked`
- passed sections: `19`
- failed sections: `3`

Failed sections:

- validation order
- eligibility
- warning compatibility

## Exact Three Findings

Finding 1:

- name: Unsupported Pattern Discovery status mapped to wrong calibration status
- classification: `incorrect_status_mapping`
- required remediation: unsupported Pattern Discovery statuses must produce `blocked_unsupported_insight`

Finding 2:

- name: Known blocked Pattern Discovery statuses mapped to wrong calibration status
- classification: `eligibility_status_contract_violation`
- required remediation: every non-eligible Pattern Discovery status must produce `blocked_unsupported_insight`

Finding 3:

- name: Duplicate warnings attenuate more than once
- classification: `duplicate_warning_attenuation`
- required remediation: warning codes must be semantically deduplicated before attenuation and each unique reducing warning may attenuate once per insight

## Root-Cause Classification

The root cause is contract drift inside the pure implementation:

- Pattern Discovery status eligibility is fail-closed but maps some unsupported or blocked Pattern Discovery statuses to the wrong Confidence Calibration result status.
- Warning output is deduplicated, but attenuation applies before or independently of semantic warning-code deduplication.

No unsafe input was accepted. No runtime or persistence path exists.

## Approved Remediation Surface

Action 423 may edit only:

- `lib/pure-confidence-calibration.ts`
- `docs/action-423-pure-confidence-calibration-contract-remediation.md`
- `scripts/action-423-pure-confidence-calibration-contract-remediation-verify.mjs`
- `tests/e2e/action-423-pure-confidence-calibration-contract-remediation.spec.ts`
- narrowly required Action 420-422 verifier/test compatibility updates
- minimal Actions 318-320 guard updates

## Forbidden Remediation Surface

Action 423 must not add or modify:

- fixture package
- calibration runner
- manifest
- shadow execution
- additional production modules
- runtime integration
- persistence
- replay
- provider access
- Supabase access
- feedback
- recommendation mutation
- scanner mutation
- ranking mutation
- public API shape
- result statuses
- delta table
- attenuation ratios
- confidence caps
- clamping policy
- overlap semantics
- identity inputs

## Pattern Discovery Status Eligibility Policy

Eligible Pattern Discovery statuses remain exactly:

- `discovered`
- `discovered_with_warnings`

Every other Pattern Discovery status string is ineligible and unsupported for Confidence Calibration consumption.

## Unsupported-Status Mapping Policy

Every ineligible or unsupported Pattern Discovery status must produce:

- `status`: `blocked_unsupported_insight`
- `proposed_delta`: `null`
- `proposed_calibrated_confidence`: `null`
- `non_authoritative`: `true`
- `applied`: `false`
- no calibration adjustment
- no calibrated confidence

This includes at least:

- `insufficient_evidence`
- `blocked_invalid_input`
- `blocked_invalid_configuration`
- `blocked_invalid_lineage`
- `blocked_future_leakage`
- `blocked_non_consumable_row`
- `blocked_nondeterministic_grouping`
- unsupported arbitrary strings

Do not preserve, forward, or mirror Pattern Discovery blocked statuses as Confidence Calibration result statuses.

Do not silently exclude unsupported-status insights and continue calibration.

## Validation-Stage Placement

Preserve the 17 Action 419 validation phases exactly:

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

Unsupported Pattern Discovery status eligibility remains phase 6.

If phases 1-5 pass, unsupported Pattern Discovery status must outrank:

- malformed insight content
- lineage failure
- leakage failure
- warning contradiction
- evidence-quality error
- overlap conflict

## Unsupported-Status Issue Behavior

Use the existing Action 419 issue vocabulary.

Freeze this issue behavior for unsupported Pattern Discovery status:

- issue code: `ineligible_pattern_discovery_status`
- path: `/insights/0/pattern_discovery_status`
- severity: `error`
- messageKey: `confidence_calibration.ineligible_pattern_discovery_status`
- deterministic issue order: yes
- deterministic issue deduplication: yes
- raw rejected status string in issue content: no

Do not add a new result status or free-form issue message.

## Warning Semantic-Deduplication Policy

For each insight, warning codes must be processed as a semantic set after validation.

The order is:

1. validate warning code shape and compatibility
2. canonically sort warning codes
3. semantically deduplicate by exact warning code
4. classify warnings
5. apply attenuation once per unique warning code

Output warning arrays must use the same canonical unique warning inventory.

Repeated warning codes must not:

- attenuate more than once
- appear more than once in output
- change calibration identity more than once
- change warning counts more than once
- affect result ordering

## Attenuation-Order Policy

Freeze this attenuation order:

1. establish base direction and quality delta
2. collect warning codes
3. validate warning compatibility
4. sort warning codes
5. deduplicate warning codes
6. apply each unique calibration-reducing warning once
7. normalize signed zero
8. apply per-insight cap

Do not change frozen attenuation ratios.

Distinct warning codes may each attenuate according to the frozen Action 419 model.

Multiple instances of the same warning code must not combine multiplicatively or repeatedly.

## Output-Warning Policy

Output warnings must be:

- deterministic
- sorted
- unique by exact warning code
- shaped exactly like the frozen Action 419 warning contract

Duplicate input warnings produce one output warning.

## Warning Contradiction Behavior

Minimum-support warnings remain contradictory for eligible `discovered` or `discovered_with_warnings` statuses:

- `minimum_total_support_not_met`
- `minimum_completed_outcomes_not_met`

Duplicate contradictory warnings must produce one deterministic blocking issue, not repeated issues.

Deduplication must not turn a contradictory warning into a permitted warning.

## Result-Vocabulary Preservation

Keep exactly:

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

Do not add:

- `blocked_pattern_discovery_status`
- `blocked_non_consumable_row`
- `blocked_nondeterministic_grouping`
- any other new calibration status

## Issue/Warning-Contract Preservation

Preserve:

- issue object shape
- warning object shape
- RFC 6901 paths
- `error` severity for issues
- `warning` severity for warnings
- stable `confidence_calibration.*` message keys
- deterministic order
- deterministic deduplication
- no raw rejected values in issue or warning content

## Delta-Table Preservation

Do not change the direction delta table:

- `supportive_strong`: `200`
- `supportive_moderate`: `100`
- `supportive_weak`: `50`
- `neutral`: `0`
- `mixed`: `0`
- `adverse_weak`: `-100`
- `adverse_moderate`: `-200`
- `adverse_strong`: `-300`

## Cap Preservation

Do not change:

- positive per-insight cap
- negative per-insight cap
- combined positive cap
- combined negative cap
- cap ordering
- exact cancellation behavior

## Overlap Preservation

Do not change:

- duplicate insight deduplication
- same-evidence overlap exclusion
- partial-source overlap exclusion
- conflicting-overlap blocking
- distinct non-overlap inclusion
- deterministic overlap sorting

## Confidence-Bound Preservation

Do not change:

- base confidence range
- basis-point conversion
- decimal precision
- clamping to 0-100
- `confidence_clamped_to_bounds` warning behavior
- signed-zero normalization

## Identity/Hash Preservation

The implementation source hash may change in Action 423.

For unaffected valid inputs, Action 423 must preserve identical:

- calibration statuses
- proposed deltas
- proposed calibrated confidence
- included insight inventory
- excluded insight inventory
- warning inventory
- calibration IDs
- calibration hashes
- canonical result serialization

For affected inputs:

- unsupported statuses must change to `blocked_unsupported_insight`
- duplicate-warning inputs must become semantically equivalent to unique-warning inputs

Equivalence requirement:

- `["duplicate_mapper_row_identity"]`
- `["duplicate_mapper_row_identity", "duplicate_mapper_row_identity"]`

These inputs must produce identical outputs and identical calibration IDs when all other input fields are the same.

## Immutability Preservation

Action 423 must preserve:

- no mutation of input objects
- compatibility with frozen input objects
- deterministic repeated calls
- deterministic interleaved calls

## Determinism Preservation

Action 423 must preserve:

- canonical warning order
- canonical issue order
- canonical insight order
- canonical identity hash construction
- no time, random, environment, network, or filesystem influence

## Regression Requirements

Action 423 must preserve the full Action 420 suite and add focused cases for:

- insufficient_evidence returns blocked_unsupported_insight
- every known blocked Pattern Discovery status returns blocked_unsupported_insight
- unsupported arbitrary status returns blocked_unsupported_insight
- unsupported status outranks lineage failure
- unsupported status outranks leakage failure
- unsupported status outranks warning contradiction
- duplicated reducing warning attenuates once
- triplicated reducing warning attenuates once
- duplicate contradictory warning produces one blocking issue
- two distinct reducing warnings each attenuate once
- warning input order does not affect result
- unique-warning and duplicate-warning inputs produce identical IDs and outputs
- existing valid supportive/adverse/neutral/mixed cases remain unchanged
- caps remain unchanged
- clamping remains unchanged
- overlap remains unchanged
- immutability remains unchanged
- determinism remains unchanged

## Multi-Fault Precedence Requirements

If phases 1-5 pass, unsupported Pattern Discovery status wins over:

- missing or malformed insight content
- malformed lineage fields
- failed anti-leakage status
- warning contradiction
- blocked evidence quality
- duplicate or conflicting overlap

If phases 1-5 fail, earlier validation phases continue to win.

## Acceptance Criteria

Action 423 can be accepted only if:

- all unsupported Pattern Discovery statuses map to `blocked_unsupported_insight`
- validation phase 6 placement is preserved
- warning deduplication occurs before attenuation
- each unique reducing warning attenuates once
- contradictory warning behavior remains blocking
- result vocabulary remains unchanged
- issue and warning contracts remain unchanged
- public API remains unchanged
- delta, cap, clamping, and overlap semantics remain unchanged
- unaffected valid outputs retain their hashes and identities
- Action 424 independent audit is mandatory

## Rejection Criteria

Reject remediation if it requires:

- new Confidence Calibration result statuses
- new public API inputs or outputs
- broad behavior changes for valid calibration cases
- fixture work
- runner work
- manifest work
- shadow execution
- runtime integration
- persistence
- replay
- provider access
- Supabase access
- recommendation mutation

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions

The gate passes only if:

- all three findings have exact remediation rules
- unsupported-status mapping is exact
- validation placement is exact
- warning deduplication precedes attenuation
- each unique warning attenuates once
- result vocabulary remains unchanged
- no public API change is required
- no delta, cap, or overlap change is required
- remediation surface is narrow
- Action 424 is mandatory

## Approval Decision

Approval decision: `approved`

Reason: Action 422 freezes exact remediation rules, uses existing issue vocabulary, requires no new result statuses, requires no public API changes, keeps the remediation surface narrow, and mandates Action 424 before fixture or hash-freeze work.

## Passed Conditions

Passed conditions: `28`

## Failed Conditions

Failed conditions: `0`

## Unresolved Conditions

Unresolved conditions: `[]`

## Next Permitted Action

Next permitted Action:

`Action 423 - Pure Confidence Calibration Contract Remediation`

After Action 423, the mandatory next audit is:

`Action 424 - Independent Post-Remediation Confidence Calibration Verification`

Do not proceed directly from Action 423 to fixtures, hash freeze, shadow execution, runtime integration, persistence, replay, provider work, Supabase work, or recommendation mutation.
