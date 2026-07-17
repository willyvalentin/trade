# Action 403 - Pure Pattern Discovery Implementation Approval Gate

## Purpose

Freeze exactly how one future pure Pattern Discovery module may be implemented. This gate approves a narrow implementation surface and test contract only. It does not implement or invoke `discoverPatterns`, reconstruct mapper rows, create a manifest/runner, generate insights, or execute a shadow.

## Scope

This Action is static, approval-gate-only, implementation-free, execution-free, source-immutable, local-only, runtime-free, persistence-free, replay-free, provider/news/Supabase-free, calibration-free, and feedback-free.

## Authoritative Dependencies

The implementation contract binds Actions 309, 326, 335-337, 343, 357, 380-402. Action 343/357 supplies authoritative Pattern Insight vocabulary; Action 400 supplies the frozen mapper package; Action 401 limits downstream eligibility to mapped rows; Action 402 freezes the pure Pattern Discovery behavior and one-group static boundary.

## Action 402 Decision

Action 402 returned `approval_decision: approved_with_conditions`, with 26 passed, 0 failed, 0 unresolved, and 2 future conditions. Its exact pure result vocabulary, mapped-only allowlist, setup-family grouping, support threshold, duplicate-row policy, aggregation rules, and no-effect boundary remain authoritative.

## Action 402 Future Conditions

1. The pure implementation must be completed and independently audited before shadow approval.
2. Canonical reconstructed row hashes and the evidence-set/group hash must be frozen after pure reconstruction and before shadow execution.

Action 403 permits only the first future implementation step. It does not satisfy the independent audit or hash-freeze condition.

## Explicit Non-Goals

No Pattern Discovery implementation, invocation, runner, downstream manifest, row reconstruction, insight generation, mapper/fixture/Action 400 mutation, persistence, replay, runtime input, provider/news/Supabase access, calibration, ranking/scanner/confidence/recommendation mutation, schema/migration, deployment, or runtime-preview advancement occurs.

## Protected Upstream Hashes

- mapper: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- learning fixtures: `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- context fixtures: `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- pattern fixtures: `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`
- Action 400 runner: `a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05`
- Action 400 raw manifest: `e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319`

## Exact Approved Implementation Module

The only approved implementation module is `lib/pure-pattern-discovery.ts`. No sibling helper module, class, service, repository, singleton, cache, adapter, worker, runtime wrapper, API route, or production consumer is approved.

## Exact Exported Type Inventory

The module exports exactly these seven types:

1. `PatternDiscoveryRowEnvelope`
2. `FrozenPatternDiscoveryConfiguration`
3. `PatternDiscoveryResult`
4. `PatternDiscoveryIssue`
5. `PatternDiscoveryWarning`
6. `PatternDiscoveryGroupResult`
7. `PatternDiscoveryEvidenceSummary`

It exports exactly one runtime symbol: `discoverPatterns`. No other type, function, constant, object, default export, or re-export is public.

## Exact Function Signature

```ts
export function discoverPatterns(input: Readonly<{
  rows: readonly PatternDiscoveryRowEnvelope[];
  configuration: FrozenPatternDiscoveryConfiguration;
}>): PatternDiscoveryResult;
```

The function is synchronous and has no overload, hidden argument, callback, logger, clock, randomness, environment, filesystem, network, persistence, cache, or mutation side effect.

## Input-Envelope Contract

`PatternDiscoveryRowEnvelope` has exactly these readonly fields:

- `source_case_id: string`
- `mapper_sha256: string`
- `learning_fixture_sha256: string`
- `context_fixture_sha256: string`
- `pattern_fixture_sha256: string`
- `canonical_mapper_input_sha256: string`
- `mapper_status: "mapped"`
- `mapper_row_id: string`
- `canonical_row_sha256: string`
- `consumable: true`
- `static_only: true`
- `non_authoritative: true`
- `no_persistence: true`
- `no_replay: true`
- `no_runtime: true`
- `no_feedback: true`
- `row: Action335LearningDatasetRow`

Unknown fields are invalid. Runtime metadata, production IDs, environment values, current timestamps, mutable execution fields, callbacks, and persisted references are forbidden.

## Configuration Contract

`FrozenPatternDiscoveryConfiguration` has exactly these readonly fields and literals:

- `contract_version: "pure_pattern_discovery_contract_v1"`
- `configuration_version: "pattern_discovery_setup_family_v1"`
- `grouping_dimension: "setup_family"`
- `allowed_setup_families: readonly ["momentum_continuation"]`
- `horizon: "60m"`
- `minimum_total_support: 20`
- `minimum_completed_outcomes: 20`
- `numeric_scale: 1000000`
- `output_decimal_places: 4`
- `rounding_mode: "half_away_from_zero"`
- `evidence_unit: "action_400_case_lineage"`
- `group_key_schema: "pattern_group:v1"`
- `static_only: true`
- `non_authoritative: true`
- `no_persistence: true`
- `no_replay: true`
- `no_runtime: true`
- `no_feedback: true`

Unknown/missing fields or alternate values return `blocked_invalid_configuration`. Hidden defaults and implementation-selected thresholds are forbidden.

## Result Union

`PatternDiscoveryResult` is one discriminated readonly union keyed by `status`. Its exact statuses are:

- `discovered`
- `discovered_with_warnings`
- `insufficient_evidence`
- `blocked_invalid_input`
- `blocked_invalid_configuration`
- `blocked_invalid_lineage`
- `blocked_future_leakage`
- `blocked_non_consumable_row`
- `blocked_nondeterministic_grouping`

Success/insufficient variants include configuration/input hashes, ordered groups, ordered insight metadata, issues/warnings, canonical result hash, and no-effect declarations. Blocked variants contain no groups or insights and expose only bounded issues plus no-effect declarations.

## Issue And Warning Contract

`PatternDiscoveryIssue` and `PatternDiscoveryWarning` each have exactly `{code,path,severity,messageKey}`. Paths are RFC 6901. Severity is `error` for issues and `warning` for warnings. `messageKey` is exactly `pattern_discovery.<code>`. Raw rejected values, secrets, timestamps, and dynamic text are forbidden.

Permitted error codes are:

- `invalid_input_shape`
- `invalid_configuration_shape`
- `invalid_batch_declaration`
- `invalid_row_envelope`
- `ineligible_mapper_status`
- `missing_row`
- `non_consumable_row`
- `invalid_lineage`
- `future_leakage`
- `missing_grouping_field`
- `invalid_grouping_literal`
- `invalid_outcome`
- `non_finite_numeric`
- `nondeterministic_grouping`
- `duplicate_source_case_id`

Permitted warning codes are `minimum_total_support_not_met`, `minimum_completed_outcomes_not_met`, `duplicate_mapper_row_identity`, and `metric_value_unavailable`.

## Validation-Order Contract

Validation phases are exact and whole-batch fail-closed:

1. input shape -> `blocked_invalid_input`
2. configuration shape/literals -> `blocked_invalid_configuration`
3. batch declarations/count/order -> `blocked_invalid_input`
4. row-envelope shape and unknown fields -> `blocked_invalid_input`
5. mapper status, row presence, consumability -> `blocked_non_consumable_row`
6. lineage identity and all hashes -> `blocked_invalid_lineage`
7. anti-leakage -> `blocked_future_leakage`
8. required grouping field/literal -> `blocked_invalid_input`
9. outcome availability/status/horizon -> `blocked_invalid_input`
10. finite numeric/range/scale validation -> `blocked_invalid_input`
11. deterministic grouping/key construction -> `blocked_nondeterministic_grouping`
12. aggregation
13. support evaluation
14. result construction

All errors in the first failing phase are collected, deduplicated, and sorted; later phases do not run. Multi-fault primary status is therefore deterministic.

## Grouping Algorithm

After validation, sort envelopes by frozen Action 400 order index supplied by the approved case-ID lookup, then case ID. Read the exact raw `/row/setup_and_confidence/setup_family` literal. It must equal `momentum_continuation`. Group into one map entry keyed only by the canonical setup-family key. Combinatorial dimensions and object-iteration grouping are forbidden.

## Grouping-Key Serialization

Validate the raw literal before serialization; do not trim, case-fold, alias, or repair. Normalize the validated literal to NFC, percent-encode with `encodeURIComponent`, and concatenate exactly `pattern_group:v1|setup_family=<encoded-value>`. The expected key is `pattern_group:v1|setup_family=momentum_continuation`.

## Stable Sorting

Evidence units sort by Action 400 order index, then source case ID. Groups sort lexically by canonical key. Mapper row IDs and row hashes remain aligned with their evidence tuple. Issues sort by severity (`error` first), path, code, messageKey. Warnings sort by path, code, messageKey. No sort may depend on locale, insertion timing, object iteration, output index, or runtime state.

## Row Eligibility Validation

Require `mapper_status === "mapped"`, row present, `consumable === true`, all six safety declarations true, exact eligible case ID, complete outcome, exact 60m horizon, valid setup family, finite required metrics, and no blocked/missing/stale/partial/conflicting/unknown/unavailable required field. One invalid row blocks the whole batch; silent skipping is forbidden.

## Lineage Validation

Require all six protected hashes to be lowercase 64-character SHA-256 values and equal frozen expected values where upstream hashes are known. Recompute canonical row SHA-256 and compare with `canonical_row_sha256`. Verify case ID, canonical mapper input hash, mapper row ID, and row identity are internally consistent. Missing, malformed, mismatched, duplicate case lineage, or altered row content returns `blocked_invalid_lineage`.

## Leakage Validation

Require row `anti_leakage_status === "passed"`, snapshot context availability already validated upstream, and outcome fields used only in outcome aggregation. Failed, unknown, missing, or future-derived snapshot context returns `blocked_future_leakage` for the whole batch.

## Duplicate-Row Identity Handling

Duplicate source case IDs are an error `duplicate_source_case_id` and return `blocked_invalid_lineage`. Repeated mapper row IDs across distinct approved case lineages remain present, emit one warning per duplicated mapper row ID, and never become unique recommendations. They are neither silently dropped nor multiplied into `unique_mapper_row_count`.

## Case-Level Versus Unique-Row Support

Freeze three distinct integers:

- `case_support_count`: eligible unique source case lineages; expected 10
- `unique_mapper_row_count`: distinct mapper row IDs; expected 3
- `completed_outcome_count`: eligible complete outcomes; expected 10

Minimum total support uses `case_support_count`, exactly as Action 402 froze. Output must also expose unique-row count and the duplicate warning so synthetic case support cannot masquerade as unique recommendations.

## Completed-Outcome Calculation

An outcome is completed only when availability is `complete`, horizon is `60m`, and outcome status is one approved literal. Pending/incomplete/missing outcomes block the v1 input before aggregation. Completed count increments once per eligible case lineage.

## Positive/Negative/Neutral Classification

- `target_hit` -> positive
- `stop_hit` -> negative
- `open_at_window_end` -> neutral
- `no_entry_triggered` -> neutral

Missing outcome is never neutral. Unsupported status is `invalid_outcome`. Expected initial counts are completed 10, positive 10, negative 0, neutral 0.

## Minimum-Support Evaluation

Compare `case_support_count` with 20 and `completed_outcome_count` with 20, per group. Pending rows never count. If either is below threshold, group status is `insufficient_evidence`, evidence strength is `insufficient_sample`, and both applicable support warnings are emitted. The initial 10/10 group cannot return `discovered` even though all outcomes are positive.

## Insufficient-Evidence Construction

The top-level status is `insufficient_evidence`. Return exactly one bounded group summary, no full insight, `insights: []`, the three expected warnings, deterministic hashes, and no-effect declarations. Recommended actions and confidence/ranking changes are absent.

## Discovered-Result Construction

Only test-local synthetic groups meeting both 20 thresholds may exercise `discovered` or `discovered_with_warnings` in Action 404 unit tests. An eligible group without warnings returns `discovered`; one with permitted non-support warnings returns `discovered_with_warnings`. Production readiness, validated signal, calibration, and mutation are never inferred.

## Contradiction Handling

Always retain positive, negative, and neutral counts. Never suppress minority evidence or select a preferred outcome. Opposing positive and negative evidence produces Action 343 effect direction `mixed`; positive-only, negative-only, neutral-only, and no completed evidence map to `positive`, `negative`, `neutral`, and `unknown` respectively.

## Mixed-State Semantics

`mixed` is descriptive contradiction, not uncertainty repair, causal inference, or automatic weakness/strength. It cannot upgrade evidence quality, alter support, change grouping, or trigger recommendation/calibration action.

## Deterministic Integer Aggregation

Use `numeric_scale: 1000000`. Required numeric values must be finite, have absolute value at most 1,000,000, and satisfy `Number.isSafeInteger(value * 1000000)`; otherwise return `non_finite_numeric`. Normalize signed zero to integer zero. Convert to `BigInt` scaled integers and sum evidence in stable order. BigInt prevents summation overflow after per-value validation.

## Fixed Rounding

Rates use exact integer numerator/denominator and round half-up to 4 decimal places. Average and median use scaled BigInt arithmetic and round half-away-from-zero to 4 decimal places. Even medians average the two center scaled integers before rounding. Trailing zeros are represented by fixed four-decimal numeric-string fields in canonical output; numeric compatibility projections may parse them only after hashing.

## Zero-Denominator Behavior

Any metric with denominator zero is `null` and adds `metric_value_unavailable`. Division by zero, NaN, Infinity, zero substitution, and omitted fields are forbidden.

## Finite-Number Behavior

Approved numeric sources are completed outcome `gross_r_multiple`, `max_favorable_excursion_r`, and `max_adverse_excursion_r`. Null values are metric-unavailable warnings; non-null non-finite, out-of-range, or unscalable values block as invalid input. No coercion from strings is allowed.

## Null And Missing Behavior

Missing required envelope, lineage, grouping, leakage, outcome, or configuration data blocks in its validation phase. Null optional metric values remain null with warnings. No imputation, fallback, default, trimming, inferred neutral state, or silent omission is permitted.

## Identity Construction

Canonical row hash is SHA-256 of canonical JSON of the reconstructed full row. Configuration hash is SHA-256 of canonical JSON of the exact configuration. Evidence-set hash, group hash, and insight ID use the exact structures below. Hash hex is lowercase.

## Evidence-Set Hashing

Sort evidence by Action 400 order index/case ID and hash canonical JSON of:

```json
{
  "schema": "pattern_evidence_set:v1",
  "configuration_version": "pattern_discovery_setup_family_v1",
  "group_key": "<canonical-group-key>",
  "horizon": "60m",
  "evidence": [
    {"source_case_id":"<id>","mapper_row_id":"<id>","canonical_row_sha256":"<hash>"}
  ]
}
```

No aggregate metric, warning, time, path, or output position is included.

## Group Hashing

Hash canonical JSON of exactly `{schema:"pattern_group_hash:v1",configuration_sha256,group_key,evidence_set_sha256}`. Group hash excludes current/execution time, mutable aggregate metrics, warning count, strength, output position, and machine state.

## Insight Identity

For insight-ready groups, hash canonical JSON of exactly `{schema:"pure_pattern_discovery_contract_v1",configuration_version,pattern_dimension:"setup_family",group_key,horizon:"60m",evidence_set_sha256}` and format `pattern_insight:v1:<lowercase-hex-sha256>`. Insufficient groups have `insight_id: null`.

## Canonical Serialization

Canonical JSON recursively sorts object keys lexically, preserves array order, uses UTF-8 JSON without insignificant whitespace, preserves null, and rejects undefined/non-finite values. Semantic literals are validated before NFC/percent identity serialization. No locale, clock, randomness, environment, or filesystem value enters canonical data.

## Output Ordering

Top-level groups are canonical-key order; insights follow group order; source case IDs/row IDs/hashes follow evidence order; issues and warnings follow their frozen ordering. Repeated calls and interleaved calls must serialize identically.

## Issue Ordering

Collect only the first failing validation phase. Deduplicate by `{code,path,severity,messageKey}`, then sort errors before warnings, followed by path, code, and messageKey using code-unit lexical comparison.

## Warning Deduplication

Deduplicate warnings by `{code,path,messageKey}`. `duplicate_mapper_row_identity` is emitted once per duplicated mapper row ID at path `/groups/<escaped-group-key>/mapper_row_ids/<escaped-row-id>`. Support warnings are emitted once per group in minimum-total then minimum-completed order after canonical warning sort is applied.

## Input Immutability

The implementation must not mutate input, nested rows, configuration, arrays, or lineage. It may construct fresh internal/output structures only. Action 404 tests deep-freeze inputs and compare canonical before/after serialization.

## Output Determinism

Equivalent frozen input and configuration always produce byte-identical canonical output, hashes, issue/warning order, and result status across repeated and interleaved calls. No module-level mutable state is allowed.

## Prohibited Inference

Do not infer future returns, causality, significance, setup superiority, production readiness, missing outcomes/context, taxonomy relations, confidence changes, or unseen groups. Static case support is not unique market support.

## Prohibited Repair

Do not trim/case-fold, alias, impute, merge conflicts, choose duplicate winners, rewrite outcomes, modify lineage, alter thresholds, change membership, or retry with repaired input.

## Prohibited Calibration

No confidence summary calculation, calibration score, threshold optimization, calibration candidate, or confidence mutation is implemented. Compatibility fields use explicit unavailable values only where the Action 402 projection contract requires them.

## No-Persistence Guarantee

The module imports no database/Supabase, filesystem, cache, queue, event, analytics, repository, or persistence API and writes nothing.

## No-Runtime Guarantee

The module imports no Next/runtime route, server API, proxy, middleware, background worker, browser API, or application service and has no production consumer.

## No-Feedback Guarantee

Output cannot call or mutate calibration, ranking, scanner, confidence, recommendation, Learning Acceleration, Add Trade, broker, execution, or risk systems. `mutation_allowed` remains false.

## Implementation File Boundary

Action 404 may add only:

- `lib/pure-pattern-discovery.ts`
- `docs/action-404-pure-pattern-discovery-implementation.md`
- `scripts/action-404-pure-pattern-discovery-implementation-verify.mjs`
- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts`
- narrowly required Action 402/403 compatibility updates
- minimal Actions 318-320 guard updates

No runner, manifest, service, adapter, route, worker, repository, schema, migration, persisted output, or integration file is approved.

## Test Boundary

Action 404 tests use only test-local static rows and existing type contracts. They must cover exact input/configuration, invalid configuration/status/row/consumability/lineage/leakage/group/outcome/numeric values, exact grouping/key, duplicate warning, case versus unique support, outcome counts, insufficient and sufficient support, mixed evidence, sorting/hashes, mutation, repeated/interleaved calls, serialization, and absence of filesystem/network/environment/persistence/feedback. Production/runtime inputs are forbidden.

## Verifier Boundary

The Action 404 verifier is deterministic, local-only, read-only, network/provider/news/Supabase/runtime-free, and execution-limited to pure test-local calls. It verifies exports, imports, source boundary, validation order, vocabularies, algorithms, no side effects, tests, and protected hashes. It does not reconstruct or run the Action 400 10-case shadow.

## Acceptance Criteria

Accept implementation only if one file exports exactly seven approved types and one function; signature and validation phases are exact; all result/issue/warning vocabularies match; grouping/support/duplicates/outcomes/aggregation/hashes/order are deterministic; input is immutable; tests cover bypasses; no hidden default/state/import/consumer exists; and all no-effect guarantees hold.

## Rejection Criteria

Reject extra exports/modules, async/service/class/repository patterns, changed vocabulary/order/thresholds, silent row skipping/dedup/repair, unique-support inflation, floating iteration-dependent math, mutable state, clock/random/environment/filesystem/network/persistence/runtime/feedback access, production input, runner/manifest, or any upstream source mutation.

## Independent-Audit Requirement

After Action 404, Action 405 must independently verify the implementation without modifying it. Action 405 searches validation-order, grouping, duplicate-count, scaled-integer, rounding, leakage, identity/hash, mutation, hidden-state, and import bypasses and decides readiness to freeze row/evidence/group hashes. No shadow approval may occur before Action 405.

## Approval Vocabulary

Vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`.

## Deterministic Gate Conditions

Twenty-eight conditions passed: exact module/exports/signature, envelope/configuration/result contracts, phase validation, grouping/key/sorting, row/lineage/leakage rules, duplicate/case support, outcome/support/contradiction behavior, scaled integer/rounding/null semantics, canonical identity/hashes/order, issue/warning behavior, immutability/determinism, implementation/test/verifier boundaries, acceptance/rejection criteria, independent audit, protected hashes, and no-effect guarantees are frozen.

One future condition remains: Action 404 must calculate deterministic canonical row/evidence/group hashes through the approved pure implementation, and Action 405 must independently verify them before any shadow approval.

## Approval Decision

- `approval_decision: approved_with_conditions`
- `passed_conditions_count: 28`
- `failed_conditions_count: 0`
- `unresolved_conditions_count: 0`
- `future_conditions_count: 1`

The implementation contract is complete. This gate does not approve combining implementation with shadow execution.

## Next Permitted Action

The next permitted Action is Action 404: implement only `lib/pure-pattern-discovery.ts` plus its documentation, verifier, and test-local unit suite. It must not reconstruct the Action 400 mapped-only batch, create a runner/manifest, execute a downstream shadow, persist output, integrate runtime, or advance `runtime_preview_waiting_for_operator_inputs`.
