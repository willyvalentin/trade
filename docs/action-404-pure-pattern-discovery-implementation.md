# Action 404 - Pure Pattern Discovery Implementation

## Purpose

Implement the pure Pattern Discovery function frozen by Actions 402 and 403. It consumes only explicit static envelopes and configuration, validates them fail-closed, groups valid evidence by `setup_family`, and returns deterministic non-authoritative summaries.

## Scope

This implementation is synchronous, pure, deterministic, immutable, local-only, runtime-free, persistence-free, replay-free, provider/news/Supabase-free, calibration-free, feedback-free, and shadow-execution-free.

## Action 402 Contract

Action 402 remains authoritative: only `mapped` rows are eligible; `mapped_with_missing_optional_data`, all `blocked_*` statuses, incomplete/pending outcomes, invalid lineage, failed leakage, and unsupported grouping literals block the batch.

## Action 403 Approval

Action 403 returned `approval_decision: approved_with_conditions`: 28 passed, 0 failed, 0 unresolved, and 1 future condition. Action 405 must independently verify canonical reconstructed-row, evidence-set, and group hashes before any shadow approval.

## Exact Files Changed

- `lib/pure-pattern-discovery.ts`
- `docs/action-404-pure-pattern-discovery-implementation.md`
- `scripts/action-404-pure-pattern-discovery-implementation-verify.mjs`
- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts`

Only narrow Action 402/403 historical compatibility and Actions 318-320 guard updates are permitted. No runner, manifest, service, adapter, route, consumer, schema, or migration is approved.

## Exported API

```ts
export function discoverPatterns(input: Readonly<{
  rows: readonly PatternDiscoveryRowEnvelope[];
  configuration: FrozenPatternDiscoveryConfiguration;
}>): PatternDiscoveryResult
```

The only runtime export is `discoverPatterns`. Its seven public type exports are `PatternDiscoveryRowEnvelope`, `FrozenPatternDiscoveryConfiguration`, `PatternDiscoveryIssue`, `PatternDiscoveryWarning`, `PatternDiscoveryEvidenceSummary`, `PatternDiscoveryGroupResult`, and `PatternDiscoveryResult`.

## Type Inventory

No other public type, function, default export, class, service, repository, singleton, cache, adapter, or runtime wrapper is exported.

## Validation Order

The exact fail-closed order is: input shape; configuration shape; batch declarations; row envelope shape; mapper status and consumability; lineage integrity; anti-leakage; required grouping fields; outcome validity; numeric validity; deterministic grouping; aggregation; support evaluation; result construction. Only first-phase issues are returned, sorted and deduplicated by `{code,path,severity,messageKey}`.

## Result Vocabulary

The exact statuses are `discovered`, `discovered_with_warnings`, `insufficient_evidence`, `blocked_invalid_input`, `blocked_invalid_configuration`, `blocked_invalid_lineage`, `blocked_future_leakage`, `blocked_non_consumable_row`, and `blocked_nondeterministic_grouping`.

## Issue And Warning Vocabulary

Issues and warnings have exactly `{code,path,severity,messageKey}`. Paths are RFC 6901 and message keys are `pattern_discovery.<code>`. Error codes are bounded to the Action 403 inventory; warnings are `minimum_total_support_not_met`, `minimum_completed_outcomes_not_met`, `duplicate_mapper_row_identity`, and `metric_value_unavailable`. No rejected values, secrets, timestamps, or dynamic messages are returned.

## Row Eligibility And Lineage

Exact envelope keys, `mapper_status === "mapped"`, a row, `consumable === true`, all six no-effect declarations, completed 60-minute outcome, and finite exactly-scalable metrics are required. Four upstream hashes must equal the frozen values, all six hashes are lowercase SHA-256, `mapper_row_id` equals `row.identity.dataset_row_id`, source case IDs are unique, and canonical row SHA-256 must match `canonical_row_sha256`.

## Anti-Leakage, Grouping, And Duplicates

`anti_leakage_status === "passed"` is required before grouping. Only exact raw `momentum_continuation` is allowed. No trim, case fold, alias, repair, or inference occurs. The canonical key is `pattern_group:v1|setup_family=momentum_continuation`, created after NFC normalization and percent encoding. Evidence sorts by source case ID then mapper row ID.

Duplicate source cases block lineage. Repeated mapper row IDs stay as case-level evidence, emit `duplicate_mapper_row_identity`, and do not inflate unique-row support. `case_support_count`, `unique_mapper_row_count`, and `completed_outcome_count` remain separate.

## Outcomes And Support

`target_hit` is positive, `stop_hit` negative, and `open_at_window_end` plus `no_entry_triggered` neutral. Opposing positive/negative evidence is `mixed`; missing, pending, incomplete, or unsupported outcomes never become neutral. Both case support and completed outcomes must be at least 20. Otherwise the status is `insufficient_evidence` and `insights` is empty.

## Aggregation And Rounding

Gross R, best R, and worst R use scale `1000000`, safe exact scaled integers, stable BigInt summation, and four-decimal output. Rates use half-up rounding; averages and medians use half-away-from-zero. Signed zero becomes `0.0000`. A zero metric denominator returns null and `metric_value_unavailable`; NaN, Infinity, out-of-range, unscalable, and string values block.

## Identity, Serialization, Immutability, And Determinism

Canonical JSON recursively sorts object keys by code unit, preserves array order/null, rejects unsupported values, and uses SHA-256. Evidence-set hashes bind schema, configuration version, group key, 60-minute horizon, and ordered case/mapper/hash evidence. Group hashes bind schema, configuration hash, group key, and evidence-set hash. Insight IDs bind the frozen contract/configuration, group, horizon, and evidence hash. Mutable metrics, warning count, machine paths, output position, time, and runtime state are excluded.

Inputs and nested values are never mutated. Repeated, interleaved, and reordered valid calls produce identical output and hashes. There is no module state.

## No-Runner, No-Manifest, No-Shadow

No Pattern Discovery runner or manifest exists. Action 400 rows are not reconstructed or executed, and no downstream shadow executed.

## No-Persistence, No-Runtime, No-Feedback

The module imports no filesystem/database/Supabase/network/runtime API and writes nothing. It has no route, worker, proxy, middleware, or production consumer. It cannot mutate calibration, confidence, ranking, scanner, recommendations, Learning Acceleration, Add Trade, broker, execution, or risk behavior.

## Runtime Preview

The runtime-preview chain remains `runtime_preview_waiting_for_operator_inputs`.

## Action 405 Mandatory Audit

Action 405 must independently verify this implementation without modifying it, including validation-order, grouping, duplicate-count, scaled-integer, rounding, leakage, hash, mutation, hidden-state, and import bypasses. No downstream shadow is approved before Action 405.

## Implementation Result

- `implementation_status: implemented_static_pure_not_shadowed`
- `pattern_discovery_executed_on_action_400_rows: false`
- `downstream_shadow_executed: false`
- `insights_persisted: false`
- `runtime_integration_executed: false`
- `recommended_next_action: action_405_independent_pure_pattern_discovery_verification`
