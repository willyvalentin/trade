# Action 432 - Confidence Calibration Advisory Adapter Implementation

## Purpose

Action 432 implements the pure advisory adapter approved by Action 431. The adapter consumes one immutable recommendation confidence envelope, one verified `ConfidenceCalibrationResult`, and one frozen advisory configuration, then returns bounded advisory metadata.

## Scope

This action is pure/static only. It adds no Recommendation Engine consumer, no runtime route, no UI, no persistence, no replay, no provider call, no Supabase path, no feedback event, no confidence application, no ranking change, no scanner change, and no publication change.

Runtime preview remains paused at `runtime_preview_waiting_for_operator_inputs`.

## Action 431 Approval

Action 431 approved `buildConfidenceCalibrationAdvisory` as a pure advisory transform and explicitly required:

- non_authoritative: true
- applied: false
- no Recommendation mutation
- no confidence application
- no runtime or persistence
- no ranking, scanner, or publication effect
- mandatory Action 433 independent audit before fixtures, shadow execution, or integration

## Files Changed

Added:

- `lib/confidence-calibration-advisory-adapter.ts`
- `docs/action-432-confidence-calibration-advisory-adapter-implementation.md`
- `scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs`
- `tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts`

Updated narrowly:

- Action 431 verifier/tests for compatibility with the now-present pure adapter
- Actions 318-320 package guards for the Action 432 static artifacts

## Module API

The implementation module exports exactly one runtime value:

```ts
buildConfidenceCalibrationAdvisory
```

The function signature is:

```ts
buildConfidenceCalibrationAdvisory(input: Readonly<{
  recommendation: ImmutableRecommendationConfidenceEnvelope;
  calibration: ConfidenceCalibrationResult;
  configuration: FrozenAdvisoryConsumptionConfiguration;
}>): ConfidenceCalibrationAdvisoryResult
```

## Public Type Exports

The adapter exports only the bounded public Action 431 type surface:

- `ImmutableRecommendationConfidenceEnvelope`
- `FrozenAdvisoryConsumptionConfiguration`
- `ConfidenceCalibrationAdvisoryResult`

No helper functions are publicly exported.

## Validation Order

The adapter validates in a deterministic fail-closed order:

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
12. anti-leakage state
13. anti-feedback constraints
14. warning and issue compatibility
15. advisory output construction

Multi-fault inputs return the first deterministic blocker in this order.

## Recommendation Envelope

The immutable recommendation envelope requires:

- recommendation ID or fingerprint
- recommendation snapshot hash
- original confidence
- decision-boundary metadata
- immutable recommendation source metadata
- Pattern Discovery result hashes
- Pattern Insight IDs and hashes
- source scenario and snapshot lineage
- static/non-authoritative declarations
- no mutation callback
- no persistence, ranking, scanner, publication, execution, or feedback command
- explicit anti-feedback and anti-leakage flags

## Eligible And Blocked Status Mappings

Eligible statuses map exactly:

- `calibrated` -> `advisory_ready`
- `calibrated_with_warnings` -> `advisory_ready_with_warnings`
- `no_adjustment` -> `advisory_no_adjustment`

Blocked and insufficient statuses fail closed:

- `insufficient_eligible_evidence` -> `advisory_insufficient_evidence`
- `blocked_invalid_input` -> `blocked_invalid_input`
- `blocked_invalid_configuration` -> `blocked_invalid_input`
- `blocked_invalid_lineage` -> `blocked_invalid_lineage`
- `blocked_future_leakage` -> `blocked_future_leakage`
- `blocked_overlapping_evidence` -> `blocked_calibration_result`
- `blocked_unsupported_insight` -> `blocked_unsupported_status`

Confidence mismatch maps to `blocked_confidence_mismatch`.

## Confidence Agreement

The adapter requires original recommendation confidence to be finite, within 0-100, two-decimal precise, immutable, and exactly equal to `calibration.original_confidence`.

The adapter does not repair, rebase, round into agreement, or substitute confidence values.

## Original Proposed Applied Semantics

Every successful advisory result preserves:

- `original_confidence`
- `proposed_delta`
- `proposed_calibrated_confidence`
- `calibration_status`
- `advisory_eligible`
- `advisory_visible`
- `application_eligible: false`
- `non_authoritative: true`
- `applied: false`

No result emits an applied confidence field.

## Lineage

Successful advisory output binds:

- recommendation fingerprint
- recommendation snapshot hash
- recommendation source hash
- decision-boundary hash
- Pattern Discovery result hashes
- Pattern Insight hashes
- calibration ID
- calibration identity hash
- calibration result hash
- evidence lineage hash

Missing or inconsistent lineage blocks advisory construction.

## Anti-Feedback

The adapter rejects calibration output reused as:

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

Circular calibration lineage and self-referential recommendation lineage are blocked.

## Anti-Leakage

The adapter rejects:

- future outcome evidence
- post-entry evidence
- post-exit evidence
- same-recommendation realized result
- evidence after the decision boundary
- prohibited self-calibration

## Warning Handling

For `calibrated_with_warnings`, the adapter preserves canonical warning records as advisory metadata, sorts and deduplicates them deterministically, rewrites message keys to the `confidence_calibration_advisory.*` namespace, and does not convert them into Recommendation warnings.

## Issue Handling

Issue records use exactly:

```json
{
  "code": "bounded_code",
  "path": "/rfc6901/path",
  "severity": "error",
  "messageKey": "confidence_calibration_advisory.<code>"
}
```

The adapter does not expose raw rejected values, timestamps, secrets, provider payloads, or environment values.

## No-Adjustment Behavior

For `no_adjustment`, the adapter requires:

- original confidence equals proposed calibrated confidence
- proposed delta equals zero
- final delta basis points equals zero
- advisory output remains non-authoritative
- `applied: false`

The adapter does not fabricate improvement or degradation.

## Output Contract

Successful output may include only bounded advisory fields:

- status
- advisory ID/hash
- recommendation fingerprint
- recommendation snapshot hash
- original confidence
- proposed delta
- proposed calibrated confidence
- calibration status
- calibration ID
- bounded lineage hashes
- warning records
- issue records
- advisory/application eligibility flags
- reasons
- `non_authoritative: true`
- `applied: false`

It never includes a mutable Recommendation object, persistence command, Supabase payload, ranking update, scanner command, publish command, execution command, feedback event, mutation callback, runtime side effect, provider payload, credential, timestamp, or random ID.

## Advisory Identity And Hash

The advisory identity uses deterministic canonical JSON and SHA-256 with prefix:

`confidence_calibration_advisory_v1:`

Identity binds:

- adapter schema version
- advisory configuration version
- recommendation fingerprint
- recommendation snapshot hash
- original confidence basis points
- calibration status
- calibration ID
- calibration identity hash
- calibration result hash
- proposed delta basis points
- proposed confidence basis points
- bounded warning and issue inventories
- bounded lineage hashes

Identity excludes time, runtime state, machine paths, randomness, UI state, and array output position.

## Immutability

The adapter does not mutate the input wrapper, recommendation envelope, calibration result, warning arrays, issue arrays, lineage arrays/objects, or configuration. Returned advisory results are deeply frozen.

## Determinism

The adapter is synchronous, pure, immutable, deterministic, clock-independent, randomness-free, environment-independent, filesystem-free, network-free, persistence-free, logging-side-effect-free, and recommendation-mutation-free.

Repeated successful calls, repeated blocked calls, interleaved calls, reordered semantically equivalent warnings, and equivalent issue inventories produce stable output and stable advisory IDs.

## No-Consumer Guarantee

No Recommendation Engine consumer is added. No production module imports the adapter except its focused static tests and verifier.

## No-Runtime Guarantee

No API route, page route, background job, middleware, proxy, scheduled job, or UI consumer is added.

## No-Persistence Guarantee

The adapter does not read or write Supabase, local storage, files, recommendation rows, outcomes, feedback stores, fetch-run rows, or audit tables.

## No Ranking Scanner Publication Guarantee

The adapter does not change ranking inputs, ranking outputs, ordering, filtering, thresholds, score decomposition, confidence buckets, scanner universe, scanner thresholds, visible recommendation publication, card visibility, tiering, Add Trade eligibility, execution handoff, broker automation, or live trade creation.

## No Feedback Guarantee

The adapter does not emit feedback events and cannot feed calibration output back into Learning Dataset, Pattern Discovery, outcomes, context, scanner, ranking, publication, execution, or calibration evidence.

## No Recommendation Mutation Guarantee

The adapter never receives or returns a mutable Recommendation object and never applies confidence.

## Runtime Preview Paused

Runtime preview remains paused at:

`runtime_preview_waiting_for_operator_inputs`

## Mandatory Action 433 Independent Audit

Action 433 - Independent Advisory Adapter Verification remains mandatory before static advisory fixtures, hash freeze, shadow execution, runtime preview changes, or any integration/application path.
