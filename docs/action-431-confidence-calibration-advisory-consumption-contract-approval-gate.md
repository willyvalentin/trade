# Action 431 - Confidence Calibration Advisory Consumption Contract Approval Gate

## Purpose

Action 431 approves a future pure advisory-consumption contract for verified Confidence Calibration results. It defines how a future Recommendation Engine adapter may transform immutable recommendation confidence metadata and one verified `ConfidenceCalibrationResult` into bounded advisory metadata without applying it to a recommendation.

## Scope

This is static, approval-gate-only, implementation-free, consumption-free, mutation-free, source-immutable, runtime-free, persistence-free, replay-free, provider-free, Supabase-free, recommendation-mutation-free, ranking-mutation-free, scanner-mutation-free, and feedback-free.

Action 431 does not create an adapter, consume calibration results, create runtime routes, persist data, change confidence, change ranking, change scanner behavior, change publication behavior, or advance runtime preview.

## Authoritative Dependencies

- Action 309 - Post-Recovery Safe Development Protocol.
- Actions 335-385 - Learning Dataset and compatibility contracts.
- Actions 387-401 - Pure mapper verification chain.
- Actions 402-417 - Pure Pattern Discovery verification chain.
- Actions 418-430 - Pure Confidence Calibration verification chain.

## Actions 418-430 Completion Summary

Actions 418-430 completed the conceptual contract, implementation approval, pure implementation, independent audit, remediation approval, remediation, independent post-remediation audit, fixture/hash-freeze approval, semantic hash freeze, independent hash verification, shadow execution approval, bounded static shadow execution, and independent shadow verification.

## Action 430 Readiness

Action 430 readiness: ready.

Action 430 verified:

- Action 429 reproduction: shadow_passed
- scenario count: 45
- exact IDs: cc425_01 through cc425_45
- runs: exactly 2
- package hash: 3bec2908f1c07da1fbdf2052f4e5cce4987f4d4a6589141dc94a29f34fa6c7ef
- manifest semantic hash: 99d492a606d1bdf651dff6f6c0eb4be8de6886d3cbd16f60dcc6d9bb5bce4f19
- Action 426 inventory hash: 875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5
- production consumers: zero
- recommendation mutation: none
- runtime: none
- persistence: none
- feedback: none

Runtime preview remains paused at `runtime_preview_waiting_for_operator_inputs`.

## Explicit Non-Goals

Do not modify `lib/pure-confidence-calibration.ts`, Recommendation Engine behavior, recommendation confidence, ranking, scanner candidate selection, publishing, persistence, Supabase writes, replay, runtime routes, background jobs, production Pattern Insight consumption, feedback loops, calibration application logic, or runtime preview.

## Advisory-Consumption Definition

Advisory consumption is a future pure transform from:

- a current immutable recommendation confidence value
- one verified `ConfidenceCalibrationResult`
- bounded recommendation lineage metadata

into a bounded advisory result.

The future adapter must not mutate the `Recommendation` object. It must not persist the result. It must not make the proposed confidence authoritative.

## Future Adapter Definition

The future adapter is a pure local module only. It may be proposed in Action 432 as:

`lib/confidence-calibration-advisory-adapter.ts`

No Recommendation Engine consumer is approved by Action 431.

## Input Contract

The future pure function is:

```ts
buildConfidenceCalibrationAdvisory(input: Readonly<{
  recommendation: ImmutableRecommendationConfidenceEnvelope;
  calibration: ConfidenceCalibrationResult;
  configuration: FrozenAdvisoryConsumptionConfiguration;
}>): ConfidenceCalibrationAdvisoryResult
```

The input must bind:

- immutable recommendation ID or immutable recommendation fingerprint
- immutable recommendation snapshot hash
- original confidence
- calibration input base confidence
- one verified `ConfidenceCalibrationResult`
- frozen advisory configuration
- bounded recommendation lineage metadata

## Output Contract

The future result may include only:

- status
- recommendation fingerprint
- original confidence
- proposed delta
- proposed confidence
- calibration status
- calibration ID
- bounded lineage hashes
- warning records
- issue records
- eligibility flags
- `non_authoritative: true`
- `applied: false`

It must not include a mutable Recommendation object, persistence command, Supabase payload, ranking update, scanner command, publish command, execution command, feedback event, callback, runtime side effect, provider payload, credential, environment value, timestamp in semantic identity, or random identifier.

## Eligibility Policy

Only these calibration statuses may produce visible advisory metadata:

- calibrated
- calibrated_with_warnings
- no_adjustment

The exact advisory output status vocabulary is:

- advisory_ready
- advisory_ready_with_warnings
- advisory_no_adjustment
- advisory_insufficient_evidence
- blocked_invalid_input
- blocked_confidence_mismatch
- blocked_invalid_lineage
- blocked_future_leakage
- blocked_calibration_result
- blocked_unsupported_status

Action 432 must not invent additional statuses.

## Blocked-Result Policy

Blocked or insufficient calibration results must not alter recommendation confidence and must not silently become no adjustment.

Do not silently treat blocked calibration as no adjustment.

Exact status mapping:

- calibrated -> advisory_ready
- calibrated_with_warnings -> advisory_ready_with_warnings
- no_adjustment -> advisory_no_adjustment
- insufficient_eligible_evidence -> advisory_insufficient_evidence
- blocked_invalid_input -> blocked_invalid_input
- blocked_invalid_configuration -> blocked_invalid_input
- blocked_invalid_lineage -> blocked_invalid_lineage
- blocked_future_leakage -> blocked_future_leakage
- blocked_overlapping_evidence -> blocked_calibration_result
- blocked_unsupported_insight -> blocked_unsupported_status

Confidence mismatch must produce `blocked_confidence_mismatch`.

## Original-Confidence Semantics

The adapter must bind the recommendation original confidence before calibration. It must require a finite value, exact approved confidence range, exact precision, immutable source, stable recommendation/snapshot lineage, and exact equality to the calibration input base confidence.

Mismatch must block advisory consumption. The adapter must not repair, rebase, round into validity, or substitute a different confidence.

## Proposed-Confidence Semantics

The proposed calibrated confidence is advisory, non-authoritative, not applied, not persisted, not used by ranking, not used by scanner, not used by publication, and not used by execution.

It may be exposed only inside the future bounded adapter result and static verification artifacts.

## Applied-Confidence Semantics

Every future adapter output must contain:

```json
{
  "applied": false,
  "non_authoritative": true
}
```

No future Action immediately following Action 431 may set `applied: true`. A separate future application approval gate is mandatory before recommendation confidence can change.

## Warning Policy

For `calibrated_with_warnings`, preserve canonical warning inventory, surface bounded warning metadata, keep advisory-only classification, do not convert warnings into recommendation warnings automatically, do not suppress warnings, and do not use free-form messages.

For `no_adjustment`, preserve the exact reason, do not fabricate a calibration improvement, and keep original and proposed confidence equal.

## Issue Policy

Blocked and invalid calibration states must surface bounded issue metadata and remain non-actionable. The adapter must not expose raw rejected values, dynamic text, timestamps, secrets, provider payloads, or environment values.

Issue and warning shape must use exactly:

```json
{
  "code": "bounded_code",
  "path": "/rfc6901/path",
  "severity": "warning_or_error",
  "messageKey": "confidence_calibration_advisory.<code>"
}
```

## Lineage Requirements

A future advisory result must bind exactly:

- recommendation ID or immutable recommendation fingerprint
- recommendation snapshot hash
- original confidence
- Pattern Discovery result hash
- Pattern Insight ID and hash inventory
- calibration ID
- calibration identity hash
- calibration result hash
- configuration version
- source scenario or evidence lineage
- anti-leakage state

Missing or inconsistent lineage must block advisory consumption.

## Calibration Identity Requirements

The calibration ID must use the verified Confidence Calibration identity policy. Calibration identity hash and calibration result hash must be deterministic, canonical, and bound to the same verified result used by the adapter.

## Pattern Discovery Lineage Requirements

Pattern Discovery result hashes and Pattern Insight hashes must match the bounded lineage inventories that produced the calibration result. The adapter must not consume unverified Pattern Discovery output or full Pattern Insight payloads.

## Recommendation Identity Requirements

Recommendation identity must be immutable and stable. Either recommendation ID or immutable recommendation fingerprint is required, plus recommendation snapshot hash. Missing recommendation lineage blocks advisory consumption.

## Anti-Leakage

Calibration evidence must predate the future recommendation decision boundary according to the frozen intelligence contract.

No future outcomes, post-entry evidence, post-exit evidence, same-recommendation realized result, or calibration generated from the recommendation being calibrated may influence the advisory result.

## Anti-Feedback

Calibration output must not become Pattern Discovery evidence, Learning Dataset input, recommendation outcome, context input, future base confidence source, calibration input evidence, scanner signal, or ranking signal.

No circular calibration lineage is allowed.

## Temporal-Boundary Policy

All evidence lineage must be bounded to pre-decision information. Semantic identity must not include timestamps. Audit records may eventually include operational timestamps outside semantic identity only if a later persistence/application gate approves them.

## Ranking Non-Effect

The future advisory adapter must not change ranking inputs, ranking outputs, ordering, filtering, thresholds, score decomposition, confidence buckets, or live recommendation priority.

## Scanner Non-Effect

The future advisory adapter must not change scanner universe, scanner candidate selection, scanner thresholds, scan windows, generation cadence, provider requests, or research-only sample selection.

## Publication Non-Effect

The future advisory adapter must not affect visible recommendation publication, card visibility, tiering, Add Trade eligibility, execution handoff, broker automation, or live trade creation.

## Persistence Prohibition

Action 431 does not approve persistence. A future advisory result must not write to Supabase, local storage, files, fetch-run rows, recommendation rows, outcomes, feedback stores, or audit tables.

## Runtime Prohibition

Action 431 does not approve runtime integration, API routes, background jobs, UI pages, middleware, proxy changes, scheduled jobs, provider calls, Supabase access, replay, or execution.

## Audit-Trail Policy

A future advisory result must be independently reproducible from immutable recommendation lineage, calibration result, frozen configuration, and canonical adapter inputs.

The future implementation gate must define deterministic advisory ID/hash policy. No timestamp may be part of semantic identity.

## UI Visibility Policy

A future UI may eventually display original confidence, proposed calibrated confidence, delta, calibration status, and bounded explanation/warnings.

Action 431 does not approve UI implementation. The future adapter must not assume a UI consumer exists.

## Future Implementation Boundary

Action 432 may at most add:

- `lib/confidence-calibration-advisory-adapter.ts`
- `docs/action-432-confidence-calibration-advisory-adapter-implementation.md`
- `scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs`
- `tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts`
- narrow Action 431 compatibility updates
- minimal Actions 318-320 guard updates

No Recommendation Engine consumer, runtime integration, persistence, ranking change, scanner change, publication change, UI implementation, replay, provider access, Supabase access, feedback, or application logic is approved.

## Future Independent Audit

Action 433 - Independent Advisory Adapter Verification must independently verify the pure advisory adapter implementation before fixtures, hash freeze, shadow execution, or integration are considered.

## Future Static Fixture Sequence

Action 434 - Static Advisory Fixture & Hash-Freeze Approval must approve static advisory fixtures and hash-freeze coverage.

Action 435 - Static Advisory Fixture & Hash Freeze must freeze those fixtures and semantic hashes.

Action 436 - Independent Advisory Hash Verification must independently verify the advisory hash freeze.

## Future Shadow Sequence

Action 437 - Advisory Shadow Execution Approval must approve advisory shadow execution.

Action 438 - Advisory Shadow Execution may execute bounded static advisory shadow.

Action 439 - Independent Advisory Shadow Verification must independently verify the advisory shadow package.

## Future Application Approval Sequence

Only after Action 439 may a separate application/integration approval gate be considered. That future gate must separately approve any possible UI, Recommendation Engine, ranking, scanner, publication, persistence, or runtime use.

## Approval Vocabulary

Use exactly:

- approved
- approved_with_conditions
- blocked

## Deterministic Gate Conditions

Return `approved` only if advisory semantics are exact, original/proposed/applied confidence are unambiguous, eligible and blocked statuses are exact, lineage is fail-closed, anti-feedback and anti-leakage are exact, ranking/scanner/publication remain unaffected, output remains non-authoritative and `applied: false`, adapter boundary is narrow, and future audit sequence is mandatory.

Return `approved_with_conditions` only if one exact adapter status or issue code remains to be frozen.

Return `blocked` if recommendation mutation is required, ranking or scanner must consume calibration, persistence is required, circular learning lineage cannot be excluded, or original confidence cannot be bound immutably.

## Approval Decision

Approval decision: approved.

## Passed Conditions

- Action 430 readiness is ready.
- Advisory-only semantics are exact.
- Eligible calibration statuses are exact.
- Blocked calibration behavior is exact.
- Original, proposed, and applied confidence semantics are unambiguous.
- Lineage requirements are fail-closed.
- Anti-feedback and anti-leakage policies are explicit.
- Warning and issue metadata shapes are bounded.
- Ranking, scanner, and publication have no effect.
- Persistence and runtime remain prohibited.
- Action 432 boundary is narrow.
- Actions 433-439 sequence is mandatory.
- No adapter exists in Action 431.
- No runtime consumer exists in Action 431.

## Failed Conditions

None.

## Unresolved Conditions

None.

## Next Permitted Action

Action 432 - Pure Confidence Calibration Advisory Adapter Implementation.

Recommended next action identifier: action_432_pure_confidence_calibration_advisory_adapter_implementation.
