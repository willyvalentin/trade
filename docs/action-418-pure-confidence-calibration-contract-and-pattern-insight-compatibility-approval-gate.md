# Action 418 - Pure Confidence Calibration Contract And Pattern Insight Compatibility Approval Gate

## Purpose

Action 418 freezes the first pure Confidence Calibration contract for future Pattern Insight consumption. It decides whether a later action may propose one isolated deterministic implementation.

## Scope

This is a static approval gate only. It is documentation/verifier/test work, local-only, source-immutable, implementation-free, execution-free, runtime-free, persistence-free, replay-free, provider-free, Supabase-free, recommendation-mutation-free, and feedback-free.

## Authoritative Dependencies

- Action 309 post-recovery safety protocol
- Action 326 setup taxonomy and confidence calibration map
- Action 330 confidence calibration static metric spec
- Action 335 learning dataset design
- Action 357 Pattern Insight static fixtures
- Action 385 Learning Dataset to Pattern Insight compatibility
- Actions 387-401 pure mapper and mapper shadow chain
- Actions 402-417 pure Pattern Discovery chain
- Action 417 independent expanded static Pattern Discovery shadow verification

## Action 417 Readiness Result

- readiness: `ready`
- actual readiness blockers: `0`
- scenarios: `30`
- package executions: exactly `2`
- package hash: `ccbff3b786c62b0e56cd6300bae9a6950cba2ad15a3376f37dc7130d698477a8`
- Action 414 inventory hash: `8b7e5c55f1ae8e27a278ca7d844d204aee4a84d4546cb8b612c3db122d83fe4b`
- Action 414 freeze payload hash: `4e1f3e0cd8e67e7d0230c1af8618d8e803867c75c32d18857c48b1234e835c12`
- runtime preview: `runtime_preview_waiting_for_operator_inputs`

## Explicit Non-Goals

Do not implement calibration, create a calibration module, create a calibration runner, create a calibration manifest, invoke calibration, generate calibrated confidence, modify recommendation confidence, modify recommendation rows, change ranking, change scanner behavior, modify Pattern Discovery, modify mapper, modify fixtures, persist Pattern Insights, persist calibration outputs, use runtime or production inputs, use replay, use Supabase, access providers/news, modify schemas/migrations, deploy, or advance runtime preview.

## Confidence Calibration Definition

Confidence Calibration is a future advisory pure function that compares a base confidence value with verified non-authoritative Pattern Insight evidence and proposes a bounded confidence delta. It never claims accuracy improvement and never applies the result to a recommendation.

## Pure-Function Boundary

The future conceptual entry point is:

```ts
calibrateConfidence(input: Readonly<{
  baseConfidence: number;
  insights: readonly ConfidenceCalibrationInsightEnvelope[];
  configuration: FrozenConfidenceCalibrationConfiguration;
}>): ConfidenceCalibrationResult
```

The function must be synchronous, pure, immutable, deterministic, clock-independent, randomness-free, environment-independent, filesystem-free, network-free, persistence-free, runtime-free, and recommendation-mutation-free.

## Eligible Pattern Insight Policy

An insight is eligible only when every condition is true:

- Pattern Discovery status is `discovered` or `discovered_with_warnings`
- at least one insight exists
- insight is non-authoritative
- lineage is complete
- evidence-set hash exists
- group hash exists
- insight hash exists
- no leakage failure exists
- support threshold is reached
- completed-outcome threshold is reached
- source evidence is static and verified
- setup family is authoritative
- horizon is authoritative
- evidence quality is not blocked

## Excluded Pattern Insight Policy

Exclude `insufficient_evidence`, every `blocked_*` result, missing insights, incomplete lineage, unverified hashes, runtime insights, persisted insights, externally supplied insights, production-derived insights, failed/unknown/missing leakage status, unsupported setup family, unsupported horizon, and blocked evidence quality.

## Pattern Discovery Status Policy

Eligible statuses are exactly:

- `discovered`
- `discovered_with_warnings`

Excluded statuses are exactly:

- `insufficient_evidence`
- `blocked_future_leakage`
- `blocked_invalid_configuration`
- `blocked_invalid_input`
- `blocked_invalid_lineage`
- `blocked_non_consumable_row`
- `blocked_nondeterministic_grouping`

Any unknown status returns `blocked_unsupported_insight`.

## Warning Policy

Warning classification is frozen:

| Warning code | Classification | Behavior |
| --- | --- | --- |
| `duplicate_mapper_row_identity` | `calibration_reducing` | keep eligible only when lineage is complete; apply `0.50` attenuation and overlap dedupe |
| `metric_value_unavailable` | `calibration_reducing` | keep eligible only when direction and support are still explicit; apply `0.50` attenuation |
| `minimum_total_support_not_met` | `calibration_blocking` | impossible for eligible discovered insight; block as `blocked_invalid_input` |
| `minimum_completed_outcomes_not_met` | `calibration_blocking` | impossible for eligible discovered insight; block as `blocked_invalid_input` |

No warning is silently ignored. Unknown warnings are `calibration_blocking`.

## Support-Threshold Policy

Minimum total support is `20` source rows for a setup/window/horizon group. Minimum unique snapshot support is `20`. Minimum independent evidence-set support is `2`. Below threshold returns `insufficient_eligible_evidence`.

## Completed-Outcome Policy

Minimum completed outcomes is `20`. Pending, incomplete, no-outcome, missing-outcome, and unsupported outcome rows do not count. Below threshold returns `insufficient_eligible_evidence`.

## Evidence-Quality Policy

Evidence quality values and multipliers are:

- `verified_high`: multiplier `1.00`
- `verified_usable`: multiplier `0.50`
- `verified_limited`: multiplier `0.25`
- `blocked`: block as `blocked_unsupported_insight`
- unknown or missing: block as `blocked_invalid_input`

## Mixed-Evidence Policy

Mixed evidence produces a base delta of `0.00`. If warnings are present, the result is `no_adjustment` with warnings retained.

## Adverse-Evidence Policy

Adverse evidence may only reduce confidence. It must never produce a positive delta.

## Neutral-Evidence Policy

Neutral evidence produces a base delta of `0.00`. Neutral evidence may still appear in applied insight IDs if it is the only eligible insight and lineage is complete.

## Insufficient-Evidence Policy

`insufficient_evidence` Pattern Discovery results are excluded and return `insufficient_eligible_evidence` when no other eligible insight remains.

## Blocked-Result Policy

Every `blocked_*` Pattern Discovery result is excluded. If every supplied insight is blocked, the result is the most severe block code in deterministic order.

## Input-Lineage Contract

Each `ConfidenceCalibrationInsightEnvelope` must bind:

- Pattern Discovery implementation hash
- Pattern Discovery configuration version
- Pattern Discovery result hash
- evidence-set hash
- group hash
- insight ID
- insight hash
- source scenario or case IDs
- static-only declaration
- non-authoritative declaration
- no-persistence declaration
- no-replay declaration
- no-runtime declaration
- no-feedback declaration

Missing or conflicting lineage returns `blocked_invalid_lineage`.

## Evidence-Overlap Policy

Evidence overlaps when two envelopes share an evidence-set hash, group hash, insight hash, source case ID, source snapshot ID, or Pattern Discovery result hash. Overlapping insights are not counted independently.

## Duplicate-Insight Policy

Duplicate insight hash, duplicate insight ID with different hash, or duplicate lineage identity is deterministically deduped before aggregation. Conflicting duplicate identity returns `blocked_invalid_lineage`.

## Calibration Target Contract

The only target is an advisory confidence value for the same recommendation/setup/horizon family represented by the input insight lineage. No tier, score component, scanner threshold, ranking feature, recommendation row, broker field, or UI live card field may be targeted.

## Base-Confidence Contract

`baseConfidence` is a percent from `0.00` through `100.00`, inclusive, with at most two decimal places. Out-of-range, non-finite, missing, or higher-precision input returns `blocked_invalid_input`; it is not repaired.

## Adjustment-Delta Contract

Calibration is delta-based only. It proposes `confidenceDelta` in percentage points and derives `proposedConfidence = baseConfidence + confidenceDelta` after clamping to absolute bounds.

## Positive-Adjustment Limit

Per-insight positive delta is capped at `+2.00`. Combined positive delta is capped at `+4.00`.

## Negative-Adjustment Limit

Per-insight negative delta is capped at `-3.00`. Combined negative delta is capped at `-6.00`.

## Absolute-Confidence Bounds

Output confidence must be within `0.00` and `100.00`, inclusive. Clamping is permitted only after a valid delta is computed and must emit warning `confidence_clamped_to_bounds`.

## Zero-Adjustment Policy

Zero adjustment is returned for neutral evidence, mixed evidence, contradictory balanced evidence, zero eligible insight, or any situation where warnings reduce the aggregate delta to `0.00`.

## Rounding Policy

All canonical confidence and delta values use round half away from zero to two decimal places after each insight delta is attenuated and again after aggregation.

## Scaled-Integer Policy

Canonical internal representation is basis points: `0` to `10000` for confidence and signed basis points for delta. `1` basis point equals `0.01` percentage point.

## Conservative Adjustment Model

Base deltas before attenuation are frozen:

| Evidence direction | Required quality | Base delta |
| --- | --- | --- |
| `supportive_strong` | `verified_high` | `+2.00` |
| `supportive_moderate` | `verified_high` or `verified_usable` | `+1.00` |
| `supportive_weak` | any eligible quality | `+0.50` |
| `neutral` | any eligible quality | `0.00` |
| `mixed` | any eligible quality | `0.00` |
| `adverse_weak` | any eligible quality | `-1.00` |
| `adverse_moderate` | `verified_high` or `verified_usable` | `-2.00` |
| `adverse_strong` | `verified_high` | `-3.00` |

Quality multiplier and warning attenuation multiply the base delta. Unsupported evidence direction returns `blocked_unsupported_insight`.

## Multiple-Insight Aggregation

Sort eligible envelopes by `(setupFamily, horizon, evidenceSetHash, groupHash, insightId, insightHash)`. Deduplicate first. Resolve overlap groups second. Sum selected deltas third. Clamp to combined delta bounds fourth. Round after each step.

## Conflict Resolution

Contradictory non-overlapping positive and negative insights are summed within combined caps. If absolute positive support equals absolute negative support, return `no_adjustment` with warning `contradictory_evidence_balanced`.

## Deterministic Ordering

All arrays are sorted lexicographically by stable IDs or RFC 6901 paths before hashing/output. No output order may depend on input array position after canonicalization.

## Deterministic Deduplication

Deduplication key is `configurationVersion|patternDiscoveryResultHash|evidenceSetHash|groupHash|insightId|insightHash`. Exact duplicates collapse to one. Conflicting duplicates block.

## Calibration Identity

`calibrationId` is `confidence_calibration_v1:` plus the first 24 hex characters of the calibration hash.

## Calibration Hash

`calibrationHash` is SHA-256 over canonical JSON containing:

- schema marker `confidence_calibration_result_v1`
- configuration version
- canonical base confidence basis points
- sorted selected insight IDs
- sorted selected insight hashes
- selected evidence-set hashes
- overlap resolution records
- signed delta basis points
- result status

Exclude current time, machine paths, runtime state, output position, randomness, secrets, and non-contract warning counts.

## Issue/Warning Contract

Every issue and warning uses:

```ts
{
  code: string;
  path: string;
  severity: "info" | "warning" | "error";
  messageKey: string;
}
```

Paths must be RFC 6901 JSON Pointers. Codes and message keys are bounded. Sorting is by `(severity, code, path, messageKey)`. Deduplication uses the same tuple. No raw rejected values, timestamps, sensitive values, file paths, or environment values are emitted.

## Result Vocabulary

The exact result union is:

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

## Output Contract

`ConfidenceCalibrationResult` may contain only:

- result status
- original confidence
- proposed confidence delta
- proposed calibrated confidence
- evidence direction
- evidence quality
- applied insight IDs
- excluded insight IDs
- warnings
- issues
- lineage hashes
- calibration ID/hash
- `advisoryOnly: true`
- `nonAuthoritative: true`

## Recommendation-Mutation Prohibition

The result must not mutate a Recommendation, recommendation row, snapshot, ranking score, scanner candidate, threshold, tier, Add Trade eligibility, broker handoff, or UI live recommendation card.

## Calibration-Application Prohibition

No automatic application is allowed. A future implementation can only return advisory values. Application to the Recommendation Engine requires a later separate governance action.

## Anti-Leakage Policy

Calibration may use only verified Pattern Insight summaries. It must not relabel future facts as snapshot-time context, feed calibrated values back into evidence, perform circular calibration, reuse post-calibration outcomes, or accept failed/unknown/missing leakage evidence.

## Prohibited Inference

Never infer missing setup family, missing horizon, missing evidence quality, missing direction, missing outcome support, missing lineage, confidence from rank, rank from confidence, or production readiness from static support.

## Prohibited Repair

Never clamp invalid input confidence before validation, generate missing hashes, normalize unsupported statuses into eligible statuses, repair conflicting lineage, fill missing warnings, or create synthetic support.

## Prohibited Causal Claims

Output must not claim that an insight caused returns, guarantees future performance, improves accuracy, proves a setup is superior, or proves a confidence bucket is correct.

## Static Compatibility Boundary

Action 418 defines compatibility from Pattern Insight metadata to future calibration input envelopes only. It does not transform existing Pattern Discovery output and does not generate envelopes.

## Future Implementation Boundary

The next action may only approve a future pure implementation package. The implementation must not import runtime, filesystem, provider, Supabase, replay, scanner, ranking, recommendation, broker, execution, or UI modules.

## Future Independent-Audit Requirement

Any implementation must be followed by an independent verification action before hash freeze, shadow execution, runtime preview, persistence, or recommendation feedback is considered.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions

The gate requires exact eligible/excluded insight policy, warning behavior, confidence bounds, delta bounds, adjustment model, multi-insight aggregation, overlap policy, lineage, anti-leakage, result vocabulary, issue contract, identity/hash contract, mutation prohibition, and sequencing.

## Approval Decision

Decision: `approved_with_conditions`

The contract is complete enough to permit Action 419, but implementation remains blocked until Action 419 approves executable fixtures, implementation file names, and independent implementation checks.

## Passed Conditions

- Action 417 readiness is `ready`
- eligible and excluded Pattern Insight policies are exact
- warning behavior is exact
- support and completed-outcome thresholds are exact
- confidence bounds and delta bounds are exact
- adjustment model is exact
- multi-insight aggregation and overlap behavior are exact
- lineage and anti-leakage are exact
- result vocabulary is exact
- identity and hash contract are deterministic
- recommendation mutation and calibration application are prohibited

## Failed Conditions

None.

## Unresolved Conditions

- implementation file path remains unapproved
- executable fixture package remains unapproved
- implementation-specific independent audit remains future work

These unresolved conditions block implementation in Action 418 but do not block Action 419.

## Next Permitted Action

`action_419_pure_confidence_calibration_implementation_approval_gate`

## Runtime-Preview Paused State

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`. No runtime-preview route, immutable candidate, deployment artifact, or production branch state is changed.
