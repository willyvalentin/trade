# Action 402 - Pure Pattern Discovery Contract And Mapped-Only Downstream Static Shadow Approval Gate

## Purpose

Freeze a complete pure Pattern Discovery contract and decide whether a separate future Action may implement the pure function. This gate defines a mapped-only static shadow boundary but does not implement Pattern Discovery, reconstruct rows, create a downstream manifest/runner, generate an insight, or execute a downstream shadow.

## Scope

This Action is static, approval-gate-only, local-only, read-only, source-immutable, runtime-free, persistence-free, replay-free, provider/news/Supabase-free, Pattern Discovery execution-free, calibration-free, and feedback-free.

## Authoritative Dependencies

The contract reconciles Actions 309, 326, 335-337, 343, 357, 380-401. The authoritative existing vocabularies are the Action 335 Learning Dataset row, Action 343/357 Pattern Insight schema and fixtures, Action 385 evidence compatibility boundary, Action 400 immutable static package, and Action 401 downstream readiness policy.

## Upstream Action Inventory

- Action 335 defines Learning Dataset rows and outcome fields.
- Action 343 defines Pattern Insight dimensions, effect direction, evidence strength, output summaries, mutation lock, and review vocabulary.
- Action 357 implements static Pattern Insight fixtures only.
- Action 385 proves conceptual evidence compatibility only; aggregation and discovery remain absent.
- Action 400 proves a deterministic 40-case mapper boundary.
- Action 401 independently reproduces Action 400 and permits only a separately gated mapped-only next step.

## Action 401 Readiness Result

Action 401 returned `readiness_decision: ready_with_conditions`, with 24 passed, 0 failed, 0 unresolved, and 2 downstream conditions. Action 400 reproduced as `shadow_passed`; both batch hashes were `95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4`, and its canonical manifest hash was `6e6447311f096b99380914990ea14b353d3674ab6e72eede1b6b9937dae4a0fc`.

## Two Downstream Conditions

1. Initial downstream eligibility is limited to mapper status `mapped`; `mapped_with_missing_optional_data` remains excluded.
2. A pure Pattern Discovery contract must be frozen before any implementation or downstream execution.

This Action satisfies the contract-freeze condition but does not satisfy or bypass the separate implementation and execution gates.

## Explicit Non-Goals

No Pattern Discovery module, consumer, invocation, mapper reconstruction, downstream manifest, runner, insight, full row, fixture change, mapper change, Action 400 change, runtime input, production recommendation, replay, Supabase access, provider/news access, persistence, calibration, scanner/ranking/confidence/recommendation mutation, schema/migration, deployment, or runtime-preview advancement is allowed.

## Protected Upstream Hashes

- mapper: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- learning fixtures: `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- context fixtures: `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- pattern fixtures: `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`
- Action 400 runner: `a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05`
- Action 400 raw manifest: `e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319`

## Pattern Discovery Definition

Pure Pattern Discovery is deterministic descriptive aggregation over explicitly eligible, lineage-bound Learning Dataset rows. It groups observed static evidence, preserves contradictory outcomes, reports support and quality, and emits either bounded Pattern Insight-compatible output or insufficient evidence. It does not predict, recommend, calibrate, optimize, rank, establish causality, or learn into the live engine.

## Pure-Function Boundary

The proposed entry point is `discoverPatterns(input)` with no implementation in this Action.

```ts
type PurePatternDiscoveryInput = Readonly<{
  rows: readonly PatternDiscoveryRowEnvelope[];
  configuration: FrozenPatternDiscoveryConfiguration;
}>;
```

It returns `PurePatternDiscoveryResult`. Input and output are immutable. The function has no clock, randomness, environment, filesystem, network, provider, persistence, global cache, browser storage, runtime callback, or hidden default.

## Input Contract

`PatternDiscoveryRowEnvelope` contains one reconstructed `Action335LearningDatasetRow` plus immutable audit lineage. `FrozenPatternDiscoveryConfiguration` contains every threshold, dimension, vocabulary version, numeric scale, rounding mode, ordering rule, deduplication rule, missing-data rule, leakage rule, and evidence policy. Omitted configuration is `blocked_invalid_configuration`; implementation-selected defaults are forbidden.

## Eligible-Row Policy

A row is eligible only when all are true:

- Action 400 case ID is one of the exact 10 listed below;
- mapper status is exactly `mapped`;
- row is present and `consumable: true`;
- row was deterministically reconstructed from the frozen static definition;
- lineage and all hashes verify;
- `anti_leakage_status` is exactly `passed`;
- outcome availability is `complete`;
- grouping field `setup_family` is present and valid;
- no blocked issue or required Pattern Discovery field gap exists.

## Excluded-Row Policy

Exclude `mapped_with_missing_optional_data`, every `blocked_*` result, incomplete/pending/null/non-consumable rows, failed/unknown/missing leakage evidence, absent/unknown/unavailable grouping values, unprovable lineage, persisted/external/runtime/replay rows, and cases outside the exact allowlist. Exclusion occurs before grouping and cannot be repaired.

## Row-Lineage Requirements

Every envelope must bind mapper SHA-256, learning/context/pattern fixture hashes, Action 400 case ID, canonical mapper input hash, mapper status, mapper row ID, canonical row hash, and declarations `static_only: true`, `non_authoritative: true`, `no_persistence: true`, `no_replay: true`, `no_runtime: true`, and `no_feedback: true`. Stored Action 400 output may not be reused.

## Input Batch Contract

The first shadow batch version is `pattern_discovery_mapped_only_shadow_input_v1`. It contains exactly 10 immutable envelopes in the case order below. No additions, omissions, reordering, discovery, arbitrary JSON, stdin, CLI path, environment selection, or runtime filtering are allowed. Batch validation occurs before Pattern Discovery invocation.

## Grouping Dimensions

Initial grouping uses exactly one dimension: `setup_family`.

- source field: `/row/setup_and_confidence/setup_family`
- Pattern Insight dimension: `setup_family`
- approved value in this batch: `momentum_continuation`
- missing, unknown, unavailable, stale, partial, or conflicting value: row excluded
- combinatorial dimensions and cross-products: forbidden

Side, window, horizon, regime, index alignment, volume, catalyst, sector, industry, relative strength, confidence, and risk/reward remain observable metadata but are not grouping dimensions in the first contract.

## Grouping-Key Contract

The sole expected canonical key is `pattern_group:v1|setup_family=momentum_continuation`. Serialization uses UTF-8, NFC normalization of the value, `encodeURIComponent` percent encoding, fixed field order, no whitespace, and no hidden fields. A grouping key mismatch is `blocked_nondeterministic_grouping`.

## Taxonomy Contract

The dimension `setup_family` comes from Action 343. The value `momentum_continuation` comes from the Action 400 mapped rows and existing setup taxonomy. Pattern Discovery may not invent aliases, parent categories, synonyms, or new taxonomy values. Unsupported values are excluded with an issue.

## Evidence-Unit Contract

The initial synthetic shadow evidence unit is one unique Action 400 case lineage, keyed by `action_400_case_id`. This is case-level static evidence, not a claim of 10 unique market recommendations. Mapper row ID is retained separately. Repeated row IDs are not hidden: the group records `source_case_count: 10`, `unique_mapper_row_id_count: 3`, and warning `duplicate_mapper_row_identity`.

Duplicate case IDs block the batch. Repeated row IDs with different case lineage remain visible for contract testing but may never be represented as independent production observations.

## Outcome-Evidence Contract

Only `outcome_fields.availability: complete` contributes to completed evidence. Status mapping is exact:

- `target_hit` -> positive and target-hit count;
- `stop_hit` -> negative and stop-hit count;
- `open_at_window_end` -> neutral and timeout count;
- `no_entry_triggered` -> neutral and no-entry count.

Pending/incomplete outcomes are excluded in v1 and never invented. Context fields affect grouping only if snapshot-time safe; outcome fields affect aggregation only.

## Support-Count Contract

- support count: number of eligible unique case-lineage evidence units in the group;
- completed-outcome count: eligible units with complete outcomes;
- pending count: always zero in v1 because pending rows are excluded;
- duplicate mapper row IDs do not reduce case-level support but must be reported separately;
- support is calculated per group, never globally.

## Minimum-Support Policy

Freeze `minimum_total_support: 20` and `minimum_completed_outcomes: 20`, matching Action 343 guidance that samples under 20 are insufficient. Pending and incomplete rows do not count. Rows with conflicting, stale, partial, unknown, or unavailable required fields do not count. A one-row or any 1-19 row group returns `insufficient_evidence`; zero eligible rows returns `excluded`. Threshold selection at implementation time is forbidden.

## Contradiction Policy

Contradictory evidence is preserved. Positive, negative, and neutral counts are always reported for an eligible group. No minority outcome is suppressed and no mixed group is coerced. Effect direction uses the Action 343 vocabulary exactly:

- positive only: `positive`;
- negative only: `negative`;
- neutral only: `neutral`;
- both positive and negative: `mixed`;
- no completed evidence: `unknown`.

Contradiction never establishes causality or strength.

## Insufficient-Evidence Policy

Groups below either minimum return group status `insufficient_evidence`, evidence strength `insufficient_sample`, no full Pattern Insight, no recommended adjustment, and warnings identifying support shortfall. The expected first group has support 10 and completed outcomes 10, so it is deterministically insufficient.

## Pattern-Strength Policy

Use Action 343 evidence strength: under 20 `insufficient_sample`, 20-49 `weak_signal`, 50-99 `moderate_signal`, 100+ at most `strong_signal`. `validated_signal` is never automatic and requires a future independently approved repeatability method. Strength is descriptive and cannot mutate confidence or ranking.

## Directional-Effect Policy

Direction derives only from exact completed outcome category counts after eligibility. It is not a forecast. The first group is expected to have positive count 10, negative 0, neutral 0, and descriptive effect `positive`, while remaining `insufficient_evidence` because support is below 20.

## Risk/Reward Evidence Policy

Permitted metrics are completed-outcome `gross_r_multiple`, `max_favorable_excursion_r`, and `max_adverse_excursion_r` where finite. Null/non-finite values exclude the metric from metric-specific denominators and add a warning; they do not get repaired. No threshold optimization, risk recommendation, target adjustment, or stop adjustment is produced.

## Horizon Policy

The first batch requires outcome horizon `60m` for every row. Horizon is not a grouping dimension but is bound into configuration, group metadata, and insight identity. Mixed or unsupported horizons block configuration/input rather than being merged.

## Confidence-Treatment Policy

Confidence is observational metadata only. It is not grouped, calibrated, reweighted, compared with realized returns, or emitted as a recommendation. Existing confidence summary fields in Pattern Insight compatibility output use neutral unavailable placeholders for this first contract, with `confidence_sample_size: 0` and no calibration interpretation.

## Context-Treatment Policy

Only snapshot-time context already present in an eligible row may be copied to bounded context distributions. Context does not affect the first grouping key. No context-to-outcome causality is inferred. Because mapped-only rows have complete context, no context repair is needed.

## Provenance Policy

Every eligible row must have complete verified provenance and validated static lineage. Provenance is summarized as evidence quality; it is never used to promote a pattern. Missing or invalid required provenance blocks the row.

## Anti-Leakage Policy

Only snapshot-time fields may affect grouping. Post-recommendation outcomes may affect aggregation only. Outcome values may never be copied into context. Explicitly excluded future facts remain excluded. Failed, unknown, or missing anti-leakage status blocks the row; a detected violation returns `blocked_future_leakage` for the affected batch before output generation.

## Missing-Data Policy

No imputation, fallback, default, alias repair, or inferred value is allowed. A missing required grouping, outcome, lineage, or leakage field excludes or blocks according to the result contract. Optional missing-data support is documented for future gates but not approved in v1.

## Stale-Data Policy

Stale context is ineligible in v1. It cannot be promoted based on outcome completeness or replaced with a fresher value.

## Partial-Data Policy

Partial context/provenance and `mapped_with_missing_optional_data` are ineligible in v1. No partial row contributes to support or metrics.

## Conflicting-Data Policy

Conflicting context/provenance is ineligible in v1. Contradictory outcomes across otherwise eligible rows remain valid and are represented through positive/negative/neutral counts and `mixed` effect direction.

## Unknown/Unavailable Policy

Unknown or unavailable required grouping, lineage, provenance, leakage, or outcome state is ineligible. Unknown optional non-grouping context may be reported only in a future explicitly approved compatibility version; it is not normalized to neutral.

## Deterministic-Aggregation Policy

Rows are first sorted by Action 400 order index, then case ID. Counts use exact integers. Rates use exact integer numerator/denominator and round half-up to 4 decimal places; zero denominator yields `null`. Numeric R values must be finite decimal values with at most 6 fractional digits, converted to scaled integers before summation. Average and median use scaled-integer arithmetic and round half-away-from-zero to 4 decimals. Even medians average the two center scaled integers. No floating result depends on iteration order.

## Deterministic-Ordering Policy

Groups sort lexically by canonical group key. Evidence units sort by Action 400 order index then case ID. Source case IDs, row IDs, warnings, and issues preserve their explicitly defined canonical order. Object keys use canonical lexical serialization for hashing. Ties never use insertion time or runtime order.

## Deterministic-Deduplication Policy

Duplicate Action 400 case lineage is `blocked_invalid_lineage`. Repeated mapper row IDs across distinct approved case lineages remain one visible warning-bearing set and are counted in `unique_mapper_row_id_count`; they are not silently removed or claimed as unique recommendations. Exact duplicate envelopes are rejected, not collapsed. Deduplication cannot select a preferred outcome or context.

## Insight-Identity Policy

When an insight is permitted, identity is SHA-256 over canonical JSON of: schema marker `pure_pattern_discovery_contract_v1`, configuration version, pattern taxonomy, canonical group key, fixed horizon, and a SHA-256 evidence-set hash over sorted `{case_id,row_id,row_canonical_hash}` tuples. The display ID is `pattern_insight:v1:<hex-sha256>`.

Current/execution time, randomness, machine path, effect metrics, strength, win rate, output order, and warning count are excluded. Strings are NFC-normalized and percent encoding is used only in the canonical group key as specified above.

## Issue/Warning Contract

Every issue is `{code,path,severity}` with severity `warning` or `error`, sorted by severity (`error` first), then path, then code. Frozen warning codes are `minimum_total_support_not_met`, `minimum_completed_outcomes_not_met`, `duplicate_mapper_row_identity`, and `metric_value_unavailable`. Blocked result codes match the exact result vocabulary. Unknown codes are invalid configuration/output.

## Success/Result Vocabulary

The pure result vocabulary is exactly:

- `discovered`
- `discovered_with_warnings`
- `insufficient_evidence`
- `blocked_invalid_input`
- `blocked_invalid_configuration`
- `blocked_invalid_lineage`
- `blocked_future_leakage`
- `blocked_non_consumable_row`
- `blocked_nondeterministic_grouping`

Group evaluation vocabulary is exactly `insight_ready`, `insufficient_evidence`, and `excluded`.

## Output Contract

`PurePatternDiscoveryResult` contains status, configuration version/hash, input lineage hash, ordered group summaries, ordered insight summaries, ordered issues/warnings, canonical result hash, and declarations `non_authoritative: true`, `mutation_allowed: false`, `persistence_result: none`, `runtime_result: none`, and `feedback_result: none`.

Each group summary contains canonical key, taxonomy/dimension/value, support/completed/pending/positive/negative/neutral counts, unique row-ID count, target/stop/no-entry/timeout counts, bounded deterministic metrics, effect direction, evidence strength, evidence quality, source case IDs, source row IDs, lineage/evidence-set hash, warnings, and group status. `insights` is empty for insufficient groups.

## Pattern Insight Compatibility

An `insight_ready` group may project to Action 343/357 fields: deterministic `insight_id`, version, dimension, segment key, sample size/minimum, setup family, fixed horizon metadata, outcome summary, effect direction, evidence strength, overfitting risk, quality notes, anti-leakage status, `recommended_action_type: observe`, `mutation_allowed: false`, and `review_status: unreviewed`.

No wall-clock `generated_at`; a fixed configuration label replaces it in static evidence. Fields without approved evidence use explicit neutral/unavailable contract values, never invented production-like facts.

## Prohibited Inference

Never infer future returns, causality, significance, confidence calibration, setup superiority, regime superiority, missing outcomes/context, unseen groups, taxonomy relations, production readiness, or user actions. Do not extrapolate beyond source rows or label synthetic support as market evidence.

## Prohibited Repair

Do not trim, lowercase, normalize unsupported literals, impute, merge conflicting values, repair lineage, choose one duplicate, rewrite outcomes, change group membership, or alter configuration to make a group pass.

## Prohibited Calibration

No confidence bucket adjustment, calibration score, threshold optimization, or calibration candidate is generated. Existing Pattern Insight confidence fields remain observational placeholders only.

## Prohibited Recommendation Mutation

No ranking, scanner, recommendation, score, tier, threshold, visible card, Learning Acceleration, Add Trade, broker, execution, or risk state may be changed. `mutation_allowed` is always false.

## Mapped-Only Shadow Boundary

The first future shadow may reconstruct exactly the 10 listed mapped cases and no others. It may call a separately approved pure implementation only after implementation audit and shadow approval. It remains local, static, finite, in-memory, non-authoritative, and disposable.

## Exact Eligible Action 400 Case Inventory

| Order | Case ID | Stable row ID |
| ---: | --- | --- |
| 1 | `valid_complete_mapping` | `learning_row:v1:learning_dataset_static_fixture_v1\|snapshot_fingerprint%3Ashadow397%3A001\|60m\|outcome%3Ashadow397%3A001` |
| 2 | `valid_rich_context` | same as order 1 |
| 9 | `valid_equivalent_aliases` | same as order 1 |
| 10 | `valid_normalized_confidence` | same as order 1 |
| 21 | `expanded_valid_bearish_risk_context` | same as order 1 |
| 22 | `expanded_valid_fda_event_context` | same as order 1 |
| 23 | `expanded_valid_sec_event_context` | same as order 1 |
| 24 | `expanded_valid_future_event_excluded` | same as order 1 |
| 27 | `expanded_valid_identity_nfc_equivalent` | `learning_row:v1:learning_dataset_static_fixture_v1\|caf%C3%A9\|60m\|outcome%3Ashadow397%3A001` |
| 28 | `expanded_valid_identity_percent_encoding` | `learning_row:v1:learning_dataset_static_fixture_v1\|shadow%7Cpercent%25%20%2F397\|60m\|outcome%3Ashadow397%3A001` |

Canonical row hashes must be calculated and frozen by the separately gated pure implementation package after deterministic reconstruction. They may not be learned from Pattern Discovery output. This is one condition on execution approval, not permission to reconstruct rows here.

## Expected Downstream Group Inventory

Exactly one group is frozen:

- group count: 1
- key: `pattern_group:v1|setup_family=momentum_continuation`
- member case IDs: the exact 10 listed above, in listed order
- source case count/support: 10
- unique mapper row IDs: 3
- completed outcomes: 10
- pending outcomes: 0
- positive/negative/neutral: 10 / 0 / 0
- target/stop/no-entry/timeout: 10 / 0 / 0 / 0
- effect direction: `positive`
- evidence strength: `insufficient_sample`
- group status: `insufficient_evidence`
- full Pattern Insights produced: 0
- warnings: `minimum_total_support_not_met`, `minimum_completed_outcomes_not_met`, `duplicate_mapper_row_identity`

The future implementation must freeze row canonical hashes and the resulting evidence-set/group hash before any execution approval. It may not derive a different group inventory dynamically.

## Downstream Manifest Requirements

A future manifest must bind all protected hashes, Action 400 canonical manifest and batch hashes, pure contract/configuration version/hash, exact 10 cases/order, canonical mapper input hashes, expected row IDs and row hashes, exact group inventory/membership/counts/status/warnings, safety declarations, and no-effect policy. It must contain no full input or row. No downstream manifest is created by Action 402.

## Downstream Runner Boundary

The contract is non-trivial, so implementation and shadow execution are separated:

1. pure implementation plus static unit tests;
2. independent implementation audit and row-hash freeze;
3. mapped-only shadow approval gate and frozen manifest;
4. shadow execution.

No future Action may combine implementation with first shadow execution. No production consumer, API route, job, runtime adapter, persistence, or feedback path is approved.

## Output Evidence Boundary

Future temporary evidence may include case IDs, row IDs/hashes, group keys, support counts, result/group statuses, insight IDs if produced, warning/issue codes, canonical result hashes, batch hashes, lineage hashes, and repeat-run/integrity/no-effect results.

## Metadata-Only Policy

Evidence must be bounded, local, disposable, non-authoritative, non-learning, non-production, non-persisted, replay-free, runtime-free, and feedback-free. Full mapper inputs, snapshots, contexts, outcomes, complete rows, secrets, environment values, and machine paths are forbidden.

## Full-Insight Retention Policy

Full synthetic Pattern Insights may not be retained, even temporarily, in the first shadow. Only bounded insight metadata is allowed. The expected insufficient group produces no full insight.

## Repeat-Run Determinism

Future pure implementation tests and the eventual shadow each run the exact batch twice. Reconstructed rows/hashes, groups/order/membership, support counts, statuses, IDs, fields, warnings, result hashes, and batch hashes must match. No third repair run is allowed; any mismatch fails.

## Temporary Filesystem Policy

Any future shadow output must use one Action-specific system-temp directory outside repository, HOME/config/application data, and immutable candidate paths. Unsafe files, non-empty directories, traversal, dangling/resolved/parent-chain symlinks, and machine-specific permanent paths fail closed.

## Cleanup Policy

Temporary metadata is read back, deleted, and the dedicated directory verified absent. No repository/candidate/application-data evidence, tracked result, full row, or full insight may remain. Cleanup failure prevents success.

## No-Persistence Requirement

No database/Supabase write, file-backed dataset, row/insight store, queue, event, analytics record, cache, or retained evidence is allowed.

## No-Replay Requirement

No replay input, historical download, replay execution, or replay-derived row is allowed.

## No-Runtime Requirement

No API/page route, background job, runtime service, proxy, middleware, production consumer, or runtime callback is allowed.

## No-External-Access Requirement

No network, fetch, socket, provider/news API, Supabase, browser storage, environment-derived input, or arbitrary file input is allowed.

## No-Feedback Requirement

No output may reach Pattern Discovery production services, calibration, ranking, scanner, confidence, recommendations, Learning Acceleration, or execution. This static contract cannot authorize feedback.

## Stop Conditions

Future implementation/shadow stops if any protected or manifest hash differs; configuration, case count/order, row ID/hash, lineage, group inventory, support, or expected status differs; any ineligible/blocked/incomplete row appears; leakage is not passed; an implementation-selected default, arbitrary input, runtime/provider/Supabase/replay import, persistence, feedback path, unsafe output, retained full data, or nondeterminism appears. No same-Action repair follows a shadow failure.

## Approval Vocabulary

Vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`.

## Deterministic Gate Conditions

Twenty-six conditions passed: pure input/output/result contracts, one grouping dimension/key, taxonomy, evidence units, outcomes, support threshold, contradiction/missing/leakage policy, deterministic aggregation/order/dedup, identity, compatibility, exact 10-case inventory, exact one-group inventory, lineage, evidence/cleanup, no-effect locks, and a narrow separated implementation boundary are frozen.

Two conditions remain for later gates:

1. pure implementation must be completed and independently audited before shadow approval;
2. canonical row hashes and the evidence-set/group hash must be frozen after pure reconstruction and before shadow execution.

## Approval Decision

- `approval_decision: approved_with_conditions`
- `passed_conditions_count: 26`
- `failed_conditions_count: 0`
- `unresolved_conditions_count: 0`
- `future_conditions_count: 2`

The contract and bounded group inventory are complete. The conditions enforce separation; they are not permission to implement and execute in one Action.

## Next Permitted Action

The next permitted Action is Action 403: pure Pattern Discovery implementation approval gate. It may approve only a pure local implementation and static unit tests against this contract. It must not reconstruct the 10-row shadow batch, create a downstream manifest/runner, execute Pattern Discovery, persist output, integrate runtime, or advance `runtime_preview_waiting_for_operator_inputs`.
