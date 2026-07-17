# Action 413 - Expanded Static Pattern Discovery Coverage Package Approval Gate

## Purpose

Create a deterministic approval gate for one future expanded static Pattern Discovery coverage package.

This gate approves planning only. It does not create the expanded runner, does not create an execution manifest, and does not execute Pattern Discovery.

## Scope

Action 413 is static, local-only, non-authoritative, source-immutable, execution-free, provider-free, Supabase-free, persistence-free, replay-free, runtime-free, feedback-free, and deployment-free.

## Authoritative Dependencies

- Action 309 post-recovery safe development protocol.
- Action 335 learning outcome dataset design.
- Action 357 Pattern Insight static fixture foundation.
- Action 385 learning-to-pattern compatibility.
- Actions 387-401 pure mapper and static shadow chain.
- Actions 402-412 pure Pattern Discovery contract, implementation, hash freeze, first static shadow, and independent verification.

## Action 412 Readiness Result

- Readiness: `ready`
- Checks: `31/31`
- Failed: `0`
- Unresolved: `0`
- Action 411 reproduction: `shadow_passed`
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`
- Next permitted Action from Action 412: `action_413_expanded_static_pattern_discovery_coverage_package_approval_gate`

## Source-Integrity Inventory

Protected source files must remain unchanged:

- `lib/snapshot-to-learning-dataset-mapper.ts`
- `lib/pure-pattern-discovery.ts`
- `lib/learning-dataset-static-fixtures.ts`
- `lib/intelligence-context-static-fixtures.ts`
- `lib/pattern-insight-static-fixtures.ts`
- `scripts/action-400-expanded-static-mapper-shadow-run.mjs`
- `docs/action-400-expanded-static-mapper-shadow-input-manifest.json`
- `scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs`
- `docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json`
- `docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md`
- `scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs`
- `tests/e2e/action-411-mapped-only-pattern-discovery-static-shadow-use.spec.ts`

## Explicit Non-Goals

Do not modify mapper, Pattern Discovery, fixtures, Action 411 runner, Action 411 manifest, runtime routes, deployment artifacts, schemas, migrations, scanner, ranking, confidence, recommendations, Learning Acceleration, Add Trade, broker, execution, or risk.

Do not add an expanded runner, an expanded execution manifest, tracked rows, tracked insights, replay, persistence, provider access, Supabase access, news access, calibration, feedback, production inputs, downloaded data, browser storage, stdin, arbitrary CLI input, or directory discovery.

## Current Coverage Summary

Action 411 and Action 412 verified one historical mapped-only baseline scenario:

- Case observations: `10`
- Unique mapper rows: `3`
- Shared duplicate rows: `8`
- Completed outcomes: `10`
- Positive: `10`
- Negative: `0`
- Neutral: `0`
- Status: `insufficient_evidence`
- Insights: `0`
- Warnings: `minimum_total_support_not_met`, `minimum_completed_outcomes_not_met`, `duplicate_mapper_row_identity`

## Current Coverage Strengths

- Mapper reconstruction.
- Row lineage.
- Duplicate handling.
- Insufficient-evidence behavior.
- Deterministic grouping.
- Support warnings.
- Semantic hashes.
- Repeat-run determinism.
- Cleanup and isolation.

## Remaining Coverage Gaps

- Sufficient-support discovered path.
- Discovered-with-warnings path.
- Mixed positive/negative evidence.
- Positive/negative/neutral evidence.
- Multiple group handling is not currently supported by the pure contract.
- Multiple horizon handling is not currently supported by the pure contract.
- Threshold boundaries.
- Duplicate structures beyond the Action 411 cluster.
- Numeric aggregation and rounding boundaries.
- Blocked lineage, leakage, consumability, mapper-status, grouping, outcome, and numeric paths.

## Expansion Rationale

The next package should broaden static behavioral evidence for Pattern Discovery without moving the engine toward runtime or production. It should prove that the pure function behaves deterministically across success, warning, insufficient, and blocked cases before any runtime integration exists.

## Exact Future Total Case Count

The future expanded package is exactly `30` scenarios.

This does not mean 30 mapper source cases. A scenario may use a finite, explicitly frozen synthetic static row set.

## Retained-Case Policy

The Action 411 ten-case mapped-only insufficient-evidence result is retained as scenario `pd413_01_action411_baseline_insufficient_evidence`.

Action 411 historical runner, manifest, hashes, evidence expectations, and semantic results must not be rewritten.

## New-Case Policy

Scenarios `pd413_02` through `pd413_30` must be exact deterministic static scenarios. Each scenario must have a documented coverage purpose and a direct relationship to an Action 412 coverage gap.

No automatic enumeration, fixture discovery, configurable count, arbitrary generation, random property testing, environment-selected scenario, or unbounded row count is approved.

## Exact Case Inventory

| Scenario ID | Family | Rows | Unique Rows | Completed | Pos | Neg | Neutral | Expected Status | Warnings | Insights | Gap |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| pd413_01_action411_baseline_insufficient_evidence | baseline | 10 | 3 | 10 | 10 | 0 | 0 | insufficient_evidence | minimum_total_support_not_met,minimum_completed_outcomes_not_met,duplicate_mapper_row_identity | 0 | current baseline |
| pd413_02_threshold_19_case_20_completed | threshold_boundary | 19 | 19 | 19 | 19 | 0 | 0 | insufficient_evidence | minimum_total_support_not_met,minimum_completed_outcomes_not_met | 0 | 19/20 |
| pd413_03_threshold_20_case_19_completed | threshold_boundary | 20 | 20 | 19 | 19 | 0 | 1 | insufficient_evidence | minimum_completed_outcomes_not_met | 0 | 20/19 |
| pd413_04_discovered_20_20_all_unique | sufficient_support | 20 | 20 | 20 | 20 | 0 | 0 | discovered | none | 1 | 20/20 |
| pd413_05_discovered_24_24_above_threshold | sufficient_support | 24 | 24 | 24 | 21 | 3 | 0 | discovered | none | 1 | above threshold |
| pd413_06_discovered_with_one_duplicate_pair | duplicate_structure | 21 | 20 | 21 | 18 | 3 | 0 | discovered_with_warnings | duplicate_mapper_row_identity | 1 | duplicate pair |
| pd413_07_discovered_with_large_duplicate_cluster | duplicate_structure | 28 | 20 | 28 | 24 | 4 | 0 | discovered_with_warnings | duplicate_mapper_row_identity | 1 | large duplicate cluster |
| pd413_08_discovered_with_multiple_duplicate_clusters | duplicate_structure | 26 | 20 | 26 | 20 | 4 | 2 | discovered_with_warnings | duplicate_mapper_row_identity | 1 | multiple duplicate clusters |
| pd413_09_mixed_positive_negative_discovered | mixed_evidence | 22 | 22 | 22 | 12 | 10 | 0 | discovered | none | 1 | mixed evidence |
| pd413_10_positive_negative_neutral_discovered | neutral_evidence | 22 | 22 | 22 | 10 | 8 | 4 | discovered | none | 1 | neutral evidence |
| pd413_11_negative_majority_discovered | mixed_evidence | 21 | 21 | 21 | 6 | 15 | 0 | discovered | none | 1 | minority preservation |
| pd413_12_reordered_input_stability | determinism | 20 | 20 | 20 | 16 | 4 | 0 | discovered | none | 1 | stable reordered input |
| pd413_13_numeric_positive_negative_aggregation | numeric_behavior | 20 | 20 | 20 | 11 | 9 | 0 | discovered | none | 1 | signed aggregation |
| pd413_14_numeric_rounding_boundary | numeric_behavior | 20 | 20 | 20 | 13 | 7 | 0 | discovered | none | 1 | four-decimal rounding |
| pd413_15_numeric_signed_zero_and_null_metrics | numeric_behavior | 20 | 20 | 20 | 10 | 5 | 5 | discovered | none | 1 | signed zero and null |
| pd413_16_metric_unavailable_warning | numeric_behavior | 20 | 20 | 20 | 10 | 5 | 5 | discovered_with_warnings | metric_value_unavailable | 1 | null metric warning |
| pd413_17_insufficient_with_duplicate_warning_combo | warning_combo | 19 | 18 | 19 | 17 | 2 | 0 | insufficient_evidence | minimum_total_support_not_met,minimum_completed_outcomes_not_met,duplicate_mapper_row_identity | 0 | warning combination |
| pd413_18_unsupported_second_setup_family_blocked | grouping_block | 2 | 2 | 2 | 1 | 1 | 0 | blocked_invalid_input | none | 0 | multi-group contract gap |
| pd413_19_missing_grouping_field_blocked | grouping_block | 1 | 1 | 1 | 1 | 0 | 0 | blocked_invalid_input | none | 0 | missing grouping |
| pd413_20_nondeterministic_grouping_blocked | grouping_block | 2 | 2 | 2 | 1 | 1 | 0 | blocked_nondeterministic_grouping | none | 0 | group ordering safety |
| pd413_21_horizon_15m_unsupported_blocked | horizon_block | 1 | 1 | 1 | 1 | 0 | 0 | blocked_invalid_input | none | 0 | multi-horizon contract gap |
| pd413_22_horizon_30m_unsupported_blocked | horizon_block | 1 | 1 | 1 | 0 | 1 | 0 | blocked_invalid_input | none | 0 | multi-horizon contract gap |
| pd413_23_invalid_lineage_blocked | lineage_safety | 1 | 1 | 1 | 1 | 0 | 0 | blocked_invalid_lineage | none | 0 | invalid lineage |
| pd413_24_future_leakage_blocked | lineage_safety | 1 | 1 | 1 | 1 | 0 | 0 | blocked_future_leakage | none | 0 | failed leakage |
| pd413_25_non_consumable_row_blocked | row_safety | 1 | 1 | 1 | 1 | 0 | 0 | blocked_non_consumable_row | none | 0 | non-consumable |
| pd413_26_unsupported_mapper_status_blocked | row_safety | 1 | 1 | 1 | 1 | 0 | 0 | blocked_non_consumable_row | none | 0 | unsupported mapper status |
| pd413_27_missing_outcome_blocked | row_safety | 1 | 1 | 0 | 0 | 0 | 0 | blocked_invalid_input | none | 0 | invalid outcome |
| pd413_28_nonfinite_numeric_blocked | numeric_behavior | 1 | 1 | 1 | 1 | 0 | 0 | blocked_invalid_input | none | 0 | non-finite numeric |
| pd413_29_invalid_configuration_blocked | configuration_safety | 1 | 1 | 1 | 1 | 0 | 0 | blocked_invalid_configuration | none | 0 | invalid grouping config |
| pd413_30_duplicate_source_case_id_blocked | lineage_safety | 2 | 2 | 2 | 2 | 0 | 0 | blocked_invalid_lineage | none | 0 | duplicate source case |

## Input-Source Policy

Allowed sources:

- Action 411 reconstructed mapped rows.
- Exact deterministic test-local synthetic `PatternDiscoveryRowEnvelope` values.
- Fixed static malformed variants for blocked-result testing.
- Existing authoritative taxonomy values.
- Fixed configuration values.

Blocked sources:

- Production rows.
- Supabase.
- Providers, broker data, or news.
- Replay captures.
- Downloaded historical data.
- Browser storage.
- Environment-derived rows.
- Arbitrary JSON files.
- Stdin.
- Arbitrary CLI input.
- Runtime snapshots.
- Directory discovery.

## Grouping-Configuration Inventory

The approved grouping dimension remains exactly `setup_family`.

The current pure contract supports only:

- `configuration_version`: `pattern_discovery_setup_family_v1`
- `grouping_dimension`: `setup_family`
- `allowed_setup_families`: `momentum_continuation`
- `horizon`: `60m`
- `minimum_total_support`: `20`
- `minimum_completed_outcomes`: `20`
- `numeric_scale`: `1000000`

Any multi-family or multi-horizon coverage must be blocked coverage unless a separate contract-change gate is approved before execution.

## Group-Key Inventory

Approved discovered group key under the current contract:

- `pattern_group:v1|setup_family=momentum_continuation`

Blocked grouping scenarios may include static malformed literals for error testing only. They must not become discovered groups.

## Horizon Inventory

Approved successful horizon:

- `60m`

Unsupported horizon coverage:

- `15m` blocked as `blocked_invalid_input`
- `30m` blocked as `blocked_invalid_input`

No new horizon support is approved in Action 413.

## Support-Threshold Inventory

Threshold scenarios must include:

- `19/20`
- `20/19`
- `20/20`
- above-threshold support

## Outcome-Distribution Inventory

The package freezes positive, negative, and neutral counts per scenario in the Exact Case Inventory table.

## Expected-Result Inventory

Expected statuses:

- `discovered`
- `discovered_with_warnings`
- `insufficient_evidence`
- `blocked_invalid_input`
- `blocked_invalid_configuration`
- `blocked_invalid_lineage`
- `blocked_future_leakage`
- `blocked_non_consumable_row`
- `blocked_nondeterministic_grouping`

## Warning Inventory

Allowed expected warnings:

- `minimum_total_support_not_met`
- `minimum_completed_outcomes_not_met`
- `duplicate_mapper_row_identity`
- `metric_value_unavailable`

No warning outside this list is approved.

## Insight Inventory

Approved expected insight counts:

- `0` for insufficient and blocked scenarios.
- `1` for single discovered or discovered-with-warnings group scenarios.

No full insight object retention is approved.

## Duplicate-Policy Inventory

The future package must include:

- all unique rows
- one duplicate pair
- one large duplicate cluster
- multiple duplicate clusters

Duplicate warning behavior is explicitly frozen as `duplicate_mapper_row_identity`.

## Mixed-Evidence Policy

Mixed evidence scenarios must preserve positive, negative, and neutral counts without suppressing minority evidence. They must not make causality claims or automatic bullish/bearish classifications outside the frozen policy.

## Discovered Policy

Discovered scenarios require thresholds to pass, eligible evidence, no blocking issue, deterministic insight metadata, exact insight count, and `non_authoritative: true`.

## Discovered-With-Warnings Policy

Discovered-with-warnings scenarios require thresholds to pass, no blocking issue, one or more frozen non-blocking warnings, deterministic insight metadata, and `non_authoritative: true`.

## Insufficient-Evidence Policy

Insufficient-evidence scenarios must keep exact support and completed-outcome counts below at least one threshold and must freeze warning arrays exactly.

## Lineage and Anti-Leakage Policy

Successful scenarios require complete lineage, leakage-safe rows, `mapper_status: mapped`, `consumable: true`, complete outcomes, valid grouping fields, and finite numeric values.

Malformed scenarios must block with exactly one expected blocked status.

## Evidence-Set Hash Policy

Future execution must compare frozen expected evidence-set hashes. Action 413 does not calculate or discover new hashes.

## Group-Hash Policy

Future execution must compare frozen expected group hashes. Action 413 does not calculate or discover new group hashes.

## Insight-ID Policy

Future execution may retain bounded insight metadata only:

- insight ID
- group key
- evidence-set hash
- support counts
- directional state
- warning codes
- canonical insight hash

## Result-Hash Policy

Future execution must compare frozen expected result hashes. Expected values must not be rewritten from actual execution.

## Batch-Hash Policy

Future execution must compare frozen scenario batch hashes and full package hash across exactly two runs.

## Manifest Contract

No execution manifest is approved in Action 413.

If execution is later approved, use a separate manifest path:

- `docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json`

The manifest must include exact scenario count, scenario IDs, row inventories, grouping configuration, expected statuses, expected warnings, expected insight counts, frozen semantic hashes, and static/non-production/non-authoritative/no-persistence/no-replay/no-runtime/no-feedback declarations.

## Runner Contract

No expanded runner is approved in Action 413.

An eventual runner may only verify protected hashes, load a frozen manifest, construct exact static scenarios, call `discoverPatterns`, compare results to frozen expectations, run exactly twice, calculate deterministic hashes, write temporary metadata-only evidence, verify evidence, delete evidence, verify cleanup, and exit.

It must not allow input discovery, arbitrary input paths, stdin, manifest rewriting, result-dependent expectation updates, retries, third execution, persistence, runtime callbacks, or feedback.

## Metadata-Only Evidence

Temporary evidence may contain only bounded metadata. It must not contain full rows, full inputs, complete context, complete outcomes, production-like payloads, secrets, dynamic timestamps, or permanent machine paths.

## Full-Row/Full-Result Prohibition

The future package must not retain full rows, full Pattern Discovery results, full insights, or production-like payloads in tracked files.

## Temporary Filesystem Policy

Use one Action-specific system-temp directory outside repository, immutable candidate, application data, and HOME/config paths.

Require target symlink rejection, dangling symlink rejection, resolved symlink rejection, parent-chain symlink rejection, unsafe file rejection, non-empty directory rejection, traversal rejection, cleanup verification, and no tracked execution evidence.

## Cleanup Policy

Every future execution must delete temporary evidence and verify cleanup. Any cleanup failure blocks the package.

## Repeat-Run Determinism

Every scenario must produce identical results across exactly two runs:

- canonical row ordering
- group inventory
- group order
- evidence membership
- support counts
- outcome counts
- warning arrays
- result statuses
- insight IDs
- insight hashes
- result hashes
- full package hash

No third repair attempt is approved.

## No-Persistence Requirement

No database read, database write, candle persistence, raw response persistence, fetch-run persistence, recommendation mutation, or insight persistence is approved.

## No-Replay Requirement

No replay execution or replay dry-run is approved.

## No-Runtime Requirement

No runtime route, page route, proxy, middleware, UI, deployment artifact, runtime consumer, or production integration is approved.

## No-External-Access Requirement

No network, provider, news, broker, Supabase, browser, or production data access is approved.

## No-Feedback Requirement

No scanner, ranking, calibration, confidence, recommendation, Learning Acceleration, Add Trade, broker, execution, or risk feedback is approved.

## Non-Authoritative Classification

All outputs are static, non-authoritative, non-production, and advisory only.

## Stop Conditions

Future work must stop if any protected source hash differs, historical Action 411 hash differs, scenario count differs, unapproved scenario appears, expected row inventory differs, grouping configuration differs, required frozen hash is missing, result status differs, warning inventory differs, insight count differs, nondeterminism occurs, cleanup fails, full data is retained, runtime/provider/Supabase/replay import appears, persistence appears, or feedback appears.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions

The gate is deterministic if scenario count, scenario inventory, source policy, expected statuses, expected warnings, expected insight counts, sequencing, hash-freeze requirement, runner boundary, manifest boundary, output limits, stop conditions, and no-effect requirements are all frozen.

## Approval Decision

`approved_with_conditions`

The scenario inventory is finite and complete, but the expanded package includes new synthetic rows, discovered insight metadata, mixed evidence, duplicate structures, and blocked malformed inputs whose semantic hashes must be frozen in a separate Action 414 before execution.

## Passed Conditions

- Action 412 is ready.
- Exact scenario count is `30`.
- Every scenario is individually listed.
- Every scenario maps to a documented coverage gap.
- Sources are static and allowlisted.
- Statuses, warnings, groups, and insight counts are frozen.
- Package sequencing is explicit.
- Output remains bounded and non-authoritative.
- No persistence, replay, runtime, external access, or feedback is required.

## Failed Conditions

None.

## Unresolved Conditions

Frozen semantic hashes for the 29 new static scenarios are unresolved by design and must be produced by a separate hash-freeze action before execution.

## Next Permitted Action

`action_414_expanded_static_pattern_discovery_hash_freeze`

Action 414 may create only a hash-freeze planning artifact or hash inventory. It must not execute the expanded package as a shadow run.
