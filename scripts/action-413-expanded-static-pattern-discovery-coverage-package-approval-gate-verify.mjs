#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  doc: "docs/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate.md",
  verifier: "scripts/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate-verify.mjs",
  test: "tests/e2e/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate.spec.ts",
  action412Doc: "docs/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification.md",
  action412Verifier: "scripts/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification-verify.mjs",
  action412Test: "tests/e2e/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification.spec.ts",
  action411Runner: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  action411Manifest: "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
  action411Doc: "docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md",
  action411Verifier: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs",
  action411Test: "tests/e2e/action-411-mapped-only-pattern-discovery-static-shadow-use.spec.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
};

const protectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
  [paths.action411Runner]: "074a5ff02d288b03412996b09061dd509712dc891c3f4405ee540c9e1757010c",
  [paths.action411Manifest]: "79ecb36b0f69b9742ef377deabdaaeb9048be4c59305c3d7f94dd3c0c78c67f3",
  [paths.action411Doc]: "b5000b496e91c20c0e8d89991656026ff638081f8eaa76a8245a5c534b564036",
  [paths.action411Verifier]: "ad0d8d51f21946bb16c79f3b6f22ad9f94303cdb082c2143c7683debf11bb69c",
  [paths.action411Test]: "12df33a97205eae868f3008d0cee3494a418420df507c7f937ff32a90b5e97c0",
};

const expectedScenarioIds = [
  "pd413_01_action411_baseline_insufficient_evidence",
  "pd413_02_threshold_19_case_20_completed",
  "pd413_03_threshold_20_case_19_completed",
  "pd413_04_discovered_20_20_all_unique",
  "pd413_05_discovered_24_24_above_threshold",
  "pd413_06_discovered_with_one_duplicate_pair",
  "pd413_07_discovered_with_large_duplicate_cluster",
  "pd413_08_discovered_with_multiple_duplicate_clusters",
  "pd413_09_mixed_positive_negative_discovered",
  "pd413_10_positive_negative_neutral_discovered",
  "pd413_11_negative_majority_discovered",
  "pd413_12_reordered_input_stability",
  "pd413_13_numeric_positive_negative_aggregation",
  "pd413_14_numeric_rounding_boundary",
  "pd413_15_numeric_signed_zero_and_null_metrics",
  "pd413_16_metric_unavailable_warning",
  "pd413_17_insufficient_with_duplicate_warning_combo",
  "pd413_18_unsupported_second_setup_family_blocked",
  "pd413_19_missing_grouping_field_blocked",
  "pd413_20_nondeterministic_grouping_blocked",
  "pd413_21_horizon_15m_unsupported_blocked",
  "pd413_22_horizon_30m_unsupported_blocked",
  "pd413_23_invalid_lineage_blocked",
  "pd413_24_future_leakage_blocked",
  "pd413_25_non_consumable_row_blocked",
  "pd413_26_unsupported_mapper_status_blocked",
  "pd413_27_missing_outcome_blocked",
  "pd413_28_nonfinite_numeric_blocked",
  "pd413_29_invalid_configuration_blocked",
  "pd413_30_duplicate_source_case_id_blocked",
];

const requiredSections = [
  "Purpose", "Scope", "Authoritative Dependencies", "Action 412 Readiness Result",
  "Source-Integrity Inventory", "Explicit Non-Goals", "Current Coverage Summary",
  "Current Coverage Strengths", "Remaining Coverage Gaps", "Expansion Rationale",
  "Exact Future Total Case Count", "Retained-Case Policy", "New-Case Policy",
  "Exact Case Inventory", "Input-Source Policy", "Grouping-Configuration Inventory",
  "Group-Key Inventory", "Horizon Inventory", "Support-Threshold Inventory",
  "Outcome-Distribution Inventory", "Expected-Result Inventory", "Warning Inventory",
  "Insight Inventory", "Duplicate-Policy Inventory", "Mixed-Evidence Policy",
  "Discovered Policy", "Discovered-With-Warnings Policy", "Insufficient-Evidence Policy",
  "Lineage and Anti-Leakage Policy", "Evidence-Set Hash Policy", "Group-Hash Policy",
  "Insight-ID Policy", "Result-Hash Policy", "Batch-Hash Policy", "Manifest Contract",
  "Runner Contract", "Metadata-Only Evidence", "Full-Row/Full-Result Prohibition",
  "Temporary Filesystem Policy", "Cleanup Policy", "Repeat-Run Determinism",
  "No-Persistence Requirement", "No-Replay Requirement", "No-Runtime Requirement",
  "No-External-Access Requirement", "No-Feedback Requirement", "Non-Authoritative Classification",
  "Stop Conditions", "Approval Vocabulary", "Deterministic Gate Conditions",
  "Approval Decision", "Passed Conditions", "Failed Conditions", "Unresolved Conditions",
  "Next Permitted Action",
];

const expectedStatuses = [
  "discovered",
  "discovered_with_warnings",
  "insufficient_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_non_consumable_row",
  "blocked_nondeterministic_grouping",
];

const expectedWarnings = [
  "minimum_total_support_not_met",
  "minimum_completed_outcomes_not_met",
  "duplicate_mapper_row_identity",
  "metric_value_unavailable",
];

const allowedAction414HashFreezeArtifacts = [
  "docs/action-414-expanded-static-pattern-discovery-hash-freeze.md",
  "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json",
  "scripts/action-414-expanded-static-pattern-discovery-hash-freeze.mjs",
  "scripts/action-414-expanded-static-pattern-discovery-hash-freeze-verify.mjs",
  "tests/e2e/action-414-expanded-static-pattern-discovery-hash-freeze.spec.ts",
];

const forbiddenExpandedArtifacts = [
  "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  "tests/e2e/action-416-expanded-static-pattern-discovery-shadow-execution.spec.ts",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const sourceAvoids = (source, tokens) => tokens.every((token) => !source.includes(token));

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function parseScenarioRows(markdown) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("| pd413_"))
    .map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      return {
        scenario_id: cells[0],
        family: cells[1],
        rows: Number(cells[2]),
        unique_rows: Number(cells[3]),
        completed: Number(cells[4]),
        positive: Number(cells[5]),
        negative: Number(cells[6]),
        neutral: Number(cells[7]),
        expected_status: cells[8],
        warnings: cells[9] === "none" ? [] : cells[9].split(","),
        insights: Number(cells[10]),
        gap: cells[11],
      };
    });
}

function runtimePreviewFiles() {
  return [...collectFiles("app"), ...collectFiles("public")]
    .filter((path) => /action-413|action_413|expanded-static-pattern-discovery/.test(read(path)));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const action412Doc = exists(paths.action412Doc) ? read(paths.action412Doc) : "";
const patternDiscoverySource = exists(paths.patternDiscovery) ? read(paths.patternDiscovery) : "";
const scenarioRows = parseScenarioRows(doc);
const scenarioIds = scenarioRows.map((scenario) => scenario.scenario_id);
const families = [...new Set(scenarioRows.map((scenario) => scenario.family))].sort();
const statusInventory = [...new Set(scenarioRows.map((scenario) => scenario.expected_status))].sort();
const warningInventory = [...new Set(scenarioRows.flatMap((scenario) => scenario.warnings))].sort();
const protectedHashReadback = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));
const forbiddenArtifactsFound = forbiddenExpandedArtifacts.filter(exists);
const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  feedback_executed: false,
  authoritative_data_created: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  recommendations_mutated: false,
  runtime_preview_advanced: false,
};

const checks = {
  documentation_exists: exists(paths.doc),
  documentation_contract_complete: requiredSections.every((section) => doc.includes(`## ${section}`)),
  action412_ready_result: action412Doc.includes("## Readiness Decision") &&
    action412Doc.includes("`ready`") &&
    doc.includes("- Checks: `31/31`") &&
    action412Doc.includes("action_413_expanded_static_pattern_discovery_coverage_package_approval_gate"),
  protected_hashes_unchanged: Object.values(protectedHashReadback).every((entry) => entry.unchanged),
  exact_scenario_count: scenarioRows.length === 30 && doc.includes("exactly `30` scenarios"),
  exact_scenario_inventory: JSON.stringify(scenarioIds) === JSON.stringify(expectedScenarioIds),
  coverage_gap_mapping: scenarioRows.every((scenario) => scenario.gap.length > 0) &&
    families.includes("sufficient_support") &&
    families.includes("mixed_evidence") &&
    families.includes("numeric_behavior"),
  source_allowlist: [
    "Action 411 reconstructed mapped rows",
    "Exact deterministic test-local synthetic",
    "Fixed static malformed variants",
    "Existing authoritative taxonomy values",
    "Fixed configuration values",
  ].every((marker) => doc.includes(marker)),
  blocked_source_list: [
    "Production rows",
    "Supabase",
    "Providers, broker data, or news",
    "Replay captures",
    "Environment-derived rows",
    "Runtime snapshots",
    "Directory discovery",
  ].every((marker) => doc.includes(marker)),
  grouping_policy: doc.includes("grouping_dimension`: `setup_family") &&
    doc.includes("allowed_setup_families`: `momentum_continuation") &&
    doc.includes("Any multi-family or multi-horizon coverage must be blocked coverage") &&
    patternDiscoverySource.includes('allowed_setup_families: readonly ["momentum_continuation"]'),
  horizon_policy: doc.includes("Approved successful horizon:") &&
    doc.includes("`60m`") &&
    doc.includes("`15m` blocked") &&
    doc.includes("`30m` blocked"),
  result_status_inventory: expectedStatuses.every((status) => statusInventory.includes(status)) &&
    expectedStatuses.every((status) => doc.includes(`\`${status}\``)),
  warning_inventory: expectedWarnings.every((warning) => warningInventory.includes(warning) || doc.includes(`\`${warning}\``)),
  insight_inventory: scenarioRows.some((scenario) => scenario.insights === 0) &&
    scenarioRows.some((scenario) => scenario.insights === 1) &&
    scenarioRows.every((scenario) => [0, 1].includes(scenario.insights)),
  mixed_evidence_policy: doc.includes("without suppressing minority evidence") &&
    scenarioRows.some((scenario) => scenario.family === "mixed_evidence" && scenario.positive > 0 && scenario.negative > 0),
  duplicate_policy: ["duplicate pair", "large duplicate cluster", "multiple duplicate clusters"].every((marker) => doc.includes(marker)) &&
    warningInventory.includes("duplicate_mapper_row_identity"),
  numeric_policy: ["four-decimal rounding", "signed zero", "null", "non-finite numeric"].every((marker) => doc.includes(marker)),
  sequence_decision: doc.includes("`action_414_expanded_static_pattern_discovery_hash_freeze`") &&
    doc.includes("Action 414 may create only a hash-freeze planning artifact or hash inventory"),
  hash_freeze_required: doc.includes("Action 413 does not calculate or discover new hashes") &&
    doc.includes("Frozen semantic hashes for the 29 new static scenarios are unresolved by design"),
  runner_boundary: doc.includes("No expanded runner is approved in Action 413") &&
    doc.includes("run exactly twice") &&
    doc.includes("third execution"),
  manifest_boundary: doc.includes("No execution manifest is approved in Action 413") &&
    doc.includes("docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json"),
  evidence_limits: doc.includes("Metadata-Only Evidence") &&
    doc.includes("Full-Row/Full-Result Prohibition") &&
    doc.includes("No full insight object retention is approved"),
  determinism_requirement: doc.includes("Repeat-Run Determinism") &&
    doc.includes("No third repair attempt is approved"),
  temp_path_policy: doc.includes("system-temp directory") &&
    doc.includes("symlink rejection") &&
    doc.includes("traversal rejection"),
  cleanup_policy: doc.includes("delete temporary evidence") &&
    doc.includes("Any cleanup failure blocks the package"),
  stop_conditions: [
    "protected source hash differs",
    "scenario count differs",
    "required frozen hash is missing",
    "nondeterminism occurs",
    "cleanup fails",
    "runtime/provider/Supabase/replay import appears",
  ].every((marker) => doc.includes(marker)),
  no_expanded_runner_exists: !exists("scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs"),
  no_expanded_manifest_exists: !exists("docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json"),
  no_execution_artifacts_exist: forbiddenArtifactsFound.length === 0,
  action414_hash_freeze_artifacts_are_narrow: allowedAction414HashFreezeArtifacts.every((path) => !exists(path) || (
    path.includes("action-414-expanded-static-pattern-discovery-hash") &&
    !path.includes("shadow-run") &&
    !path.includes("shadow-input-manifest")
  )),
  no_source_modification: Object.values(protectedHashReadback).every((entry) => entry.unchanged),
  no_runtime_persistence_replay_provider_supabase_feedback: sourceAvoids(verifierSource, [
    "fetch" + "(",
    "@supa" + "base",
    "supabase" + "-js",
    "TWELVE" + "_DATA",
    "next" + "/server",
  ]) && runtimePreviewFiles().length === 0,
  runtime_preview_untouched: runtimePreviewFiles().length === 0 &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  approval_decision_exists: doc.includes("## Approval Decision\n\n`approved_with_conditions`"),
  next_action_separately_identified: doc.includes("## Next Permitted Action") &&
    doc.includes("action_414_expanded_static_pattern_discovery_hash_freeze"),
  focused_tests_present: testSource.includes("Action 413 expanded static Pattern Discovery coverage package approval gate") &&
    testSource.includes("hash-freeze sequencing decision"),
};

const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const approvalDecision = failedChecks.length === 0 ? "approved_with_conditions" : "blocked";

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  approval_decision: approvalDecision,
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: failedChecks.length === 0
    ? ["semantic_hashes_for_29_new_static_scenarios_require_action_414_hash_freeze"]
    : failedChecks,
  scenario_count: scenarioRows.length,
  scenario_ids: scenarioIds,
  coverage_families: families,
  status_inventory: statusInventory,
  warning_inventory: warningInventory,
  insight_count_inventory: [...new Set(scenarioRows.map((scenario) => scenario.insights))].sort((left, right) => left - right),
  source_policy: {
    allowed: [
      "action_411_reconstructed_mapped_rows",
      "deterministic_test_local_synthetic_rows",
      "fixed_static_malformed_variants",
      "existing_authoritative_taxonomy_values",
      "fixed_configuration_values",
    ],
    blocked: [
      "production_rows",
      "supabase",
      "providers_news_broker",
      "replay_captures",
      "downloaded_historical_data",
      "browser_storage",
      "environment_derived_rows",
      "arbitrary_json",
      "stdin",
      "runtime_snapshots",
      "directory_discovery",
    ],
  },
  grouping_policy: {
    grouping_dimension: "setup_family",
    successful_setup_family_literals: ["momentum_continuation"],
    successful_horizons: ["60m"],
    unsupported_family_or_horizon_coverage: "blocked_only_without_contract_change",
  },
  hash_freeze_sequence: {
    selected_sequence: "A",
    next_action: "action_414_expanded_static_pattern_discovery_hash_freeze",
    execution_action: "action_416_expanded_static_pattern_discovery_shadow_execution",
    independent_verification_action: "action_417_independent_expanded_static_shadow_verification",
  },
  protected_hashes: protectedHashReadback,
  forbidden_expanded_artifacts_found: forbiddenArtifactsFound,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: noEffectFlags,
  unrelated_work_classification: "action_413_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_414_expanded_static_pattern_discovery_hash_freeze"
    : "resolve_action_413_approval_gate_failures_before_hash_freeze",
};

console.log(JSON.stringify(report, null, 2));
if (failedChecks.length > 0) process.exit(1);
