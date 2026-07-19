#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate.md",
  verifier: "scripts/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate-verify.mjs",
  test: "tests/e2e/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate.spec.ts",
  action413Doc: "docs/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate.md",
  action413Verifier: "scripts/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate-verify.mjs",
  action414Doc: "docs/action-414-expanded-static-pattern-discovery-hash-freeze.md",
  action414Inventory: "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json",
  action414FreezeScript: "scripts/action-414-expanded-static-pattern-discovery-hash-freeze.mjs",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action411Runner: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  action411Manifest: "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
};

const expectedAction414FullInventoryHash = "8b7e5c55f1ae8e27a278ca7d844d204aee4a84d4546cb8b612c3db122d83fe4b";
const expectedAction414FreezePayloadHash = "4e1f3e0cd8e67e7d0230c1af8618d8e803867c75c32d18857c48b1234e835c12";

const protectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action411Runner]: "074a5ff02d288b03412996b09061dd509712dc891c3f4405ee540c9e1757010c",
  [paths.action411Manifest]: "79ecb36b0f69b9742ef377deabdaaeb9048be4c59305c3d7f94dd3c0c78c67f3",
  [paths.action414Inventory]: "2b2bed561b2dcbc08ff996d416e463fcb16b2b5a4eec1dbb52126768c9288e3d",
  [paths.action414FreezeScript]: "eda36bcbf9f05e3945578946a7322546ea3b83dc5fe7e770d65728f9aa77aea3",
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

const expectedStatusDistribution = {
  blocked_future_leakage: 1,
  blocked_invalid_configuration: 1,
  blocked_invalid_input: 6,
  blocked_invalid_lineage: 2,
  blocked_non_consumable_row: 2,
  blocked_nondeterministic_grouping: 1,
  discovered: 9,
  discovered_with_warnings: 4,
  insufficient_evidence: 4,
};

const expectedWarningDistribution = {
  duplicate_mapper_row_identity: 5,
  metric_value_unavailable: 1,
  minimum_completed_outcomes_not_met: 4,
  minimum_total_support_not_met: 3,
};

const expectedInsightDistribution = { 0: 17, 1: 13 };

const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 413 Approval Result",
  "Action 414 Hash-Freeze Result",
  "Exact Inventory Hash",
  "Exact Freeze Payload Hash",
  "Explicit Non-Goals",
  "Protected-Source Inventory",
  "Historical Action 411 Preservation",
  "Exact 30-Scenario Inventory",
  "Exact Scenario-Order Policy",
  "Input-Source Policy",
  "Scenario-Construction Policy",
  "Configuration Inventory",
  "Grouping Inventory",
  "Horizon Inventory",
  "Status Distribution",
  "Warning Distribution",
  "Insight Distribution",
  "Row-Hash Contract",
  "Evidence-Set Hash Contract",
  "Group-Hash Contract",
  "Insight-ID/Hash Contract",
  "Result-Hash Contract",
  "Scenario-Summary Hash Contract",
  "Future Execution-Manifest Contract",
  "Future Runner Contract",
  "Expected-Result Verification",
  "Metadata-Only Evidence Contract",
  "Full-Row/Full-Result/Full-Insight Prohibition",
  "Temporary Filesystem Policy",
  "Path-Safety Policy",
  "Cleanup Policy",
  "Repeat-Run Determinism",
  "No-Persistence Requirement",
  "No-Replay Requirement",
  "No-Runtime Requirement",
  "No-External-Access Requirement",
  "No-Feedback Requirement",
  "Non-Authoritative Classification",
  "Stop Conditions",
  "Shadow Decision Vocabulary",
  "Approval Vocabulary",
  "Deterministic Gate Conditions",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Runtime-Preview Paused State",
];

const forbiddenFutureArtifacts = [
  "docs/action-416-expanded-static-pattern-discovery-shadow-execution-evidence.json",
];
const action416PackageArtifacts = [
  "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  "docs/action-416-expanded-static-pattern-discovery-shadow-use.md",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-use-verify.mjs",
  "tests/e2e/action-416-expanded-static-pattern-discovery-shadow-use.spec.ts",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
}

function stable(value) {
  return JSON.stringify(sortKeys(value));
}

function sortedStable(value) {
  return JSON.stringify([...value].sort());
}

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function runtimePreviewFiles() {
  return [...collectFiles("app"), ...collectFiles("public")]
    .filter((path) => /action-415|action_415|expanded-static-pattern-discovery-shadow-execution/.test(read(path)));
}

function sourceAvoids(source, tokens) {
  return tokens.every((token) => !source.includes(token));
}

function sourceAvoidsRuntimeImports(source) {
  const forbiddenImportPatterns = [
    /from\s+["']child_process["']/,
    /from\s+["']@supabase\//,
    /import\s*\(\s*["']child_process["']\s*\)/,
    /import\s*\(\s*["']@supabase\//,
    /from\s+["'][^"']*provider/i,
    /from\s+["'][^"']*replay/i,
    /from\s+["'][^"']*runtime/i,
  ];
  return forbiddenImportPatterns.every((pattern) => !pattern.test(source));
}

function metadataOnlyContract(inventoryText, docText) {
  const forbiddenInventoryMarkers = [
    "\"row\":",
    "\"rows\":",
    "\"outcome_fields\":",
    "\"setup_and_confidence\":",
    "recommendationSnapshot",
    "contextSnapshot",
    "AUTOMATION_SECRET",
    "SUPABASE" + "_SERVICE_ROLE_KEY",
    "TWELVE" + "_DATA_API_KEY",
    "/Users/",
  ];
  const docRequired = [
    "Do not retain full rows",
    "full result objects",
    "full insight objects",
    "credentials",
    "environment values",
    "dynamic timestamps",
    "permanent machine paths",
  ];
  return forbiddenInventoryMarkers.every((marker) => !inventoryText.includes(marker)) &&
    docRequired.every((marker) => docText.includes(marker));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const action413Doc = exists(paths.action413Doc) ? read(paths.action413Doc) : "";
const action413Verifier = exists(paths.action413Verifier) ? read(paths.action413Verifier) : "";
const action414Doc = exists(paths.action414Doc) ? read(paths.action414Doc) : "";
const action414InventoryText = exists(paths.action414Inventory) ? read(paths.action414Inventory) : "";
const inventory = action414InventoryText ? readJson(paths.action414Inventory) : null;

const protectedHashReadback = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));

const scenarioIds = inventory?.scenario_ids ?? [];
const scenarios = inventory?.scenarios ?? [];
const forbiddenArtifactsFound = forbiddenFutureArtifacts.filter(exists);
const action416PackageArtifactsFound = action416PackageArtifacts.filter(exists);
const action416Manifest = exists("docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json")
  ? readJson("docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json")
  : null;
const action416Doc = exists("docs/action-416-expanded-static-pattern-discovery-shadow-use.md")
  ? read("docs/action-416-expanded-static-pattern-discovery-shadow-use.md")
  : "";
const action416ExecutionCompatible = action416PackageArtifactsFound.length === 0 ||
  (action416PackageArtifactsFound.length === action416PackageArtifacts.length &&
    action416Manifest?.manifest_schema_version === "action_416_expanded_static_pattern_discovery_shadow_input_manifest_v1" &&
    action416Manifest?.action_414_inventory_sha256 === expectedAction414FullInventoryHash &&
    action416Manifest?.action_414_freeze_payload_sha256 === expectedAction414FreezePayloadHash &&
    action416Manifest?.scenario_count === 30 &&
    action416Doc.includes("Final shadow decision: `shadow_passed_with_conditions`"));

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

const hasSha = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const scenarioSemanticHashesPresent = scenarios.every((scenario) =>
  Array.isArray(scenario.row_ids) &&
  Array.isArray(scenario.canonical_row_hashes) &&
  scenario.row_ids.length === scenario.row_count &&
  scenario.canonical_row_hashes.length === scenario.row_count &&
  scenario.canonical_row_hashes.every(hasSha) &&
  hasSha(scenario.semantic_hashes?.canonical_scenario_input_sha256) &&
  hasSha(scenario.semantic_hashes?.ordered_row_set_sha256) &&
  (scenario.semantic_hashes?.evidence_set_sha256 === null || hasSha(scenario.semantic_hashes?.evidence_set_sha256)) &&
  Array.isArray(scenario.semantic_hashes?.group_hashes) &&
  scenario.semantic_hashes.group_hashes.every(hasSha) &&
  Array.isArray(scenario.semantic_hashes?.insight_ids) &&
  Array.isArray(scenario.semantic_hashes?.insight_hashes) &&
  scenario.semantic_hashes.insight_hashes.every(hasSha) &&
  hasSha(scenario.semantic_hashes?.canonical_result_sha256) &&
  hasSha(scenario.semantic_hashes?.scenario_summary_sha256) &&
  hasSha(scenario.scenario_inventory_sha256));

const blockedStatusTotal = Object.entries(inventory?.status_distribution ?? {})
  .filter(([status]) => status.startsWith("blocked_"))
  .reduce((sum, [, count]) => sum + count, 0);

const checks = {
  documentation_exists: exists(paths.doc),
  documentation_contract_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  action414_hash_freeze_result: inventory?.hash_freeze_result === "hash_freeze_passed",
  exact_inventory_hash: inventory?.full_inventory_sha256 === expectedAction414FullInventoryHash &&
    doc.includes(expectedAction414FullInventoryHash),
  exact_freeze_payload_hash: inventory?.freeze_runs?.run_1_inventory_payload_sha256 === expectedAction414FreezePayloadHash &&
    inventory?.freeze_runs?.run_2_inventory_payload_sha256 === expectedAction414FreezePayloadHash &&
    inventory?.freeze_runs?.identical === true &&
    doc.includes(expectedAction414FreezePayloadHash),
  protected_hashes: Object.values(protectedHashReadback).every((entry) => entry.unchanged),
  exact_30_scenarios: inventory?.scenario_count === 30 && scenarios.length === 30,
  exact_order: stable(scenarioIds) === stable(expectedScenarioIds),
  source_policy: sortedStable(inventory?.source_policy?.allowed ?? []) === sortedStable([
    "action_411_reconstructed_mapped_rows",
    "deterministic_test_local_synthetic_rows",
    "existing_authoritative_taxonomy_values",
    "fixed_configuration_values",
    "fixed_static_malformed_variants",
  ]) && sortedStable(inventory?.source_policy?.blocked ?? []) === sortedStable([
    "arbitrary_json",
    "browser_storage",
    "directory_discovery",
    "downloaded_historical_data",
    "environment_derived_rows",
    "production_rows",
    "providers_news_broker",
    "replay_captures",
    "runtime_snapshots",
    "stdin",
    "supabase",
  ]),
  exact_status_distribution: stable(inventory?.status_distribution) === stable(expectedStatusDistribution),
  exact_blocked_status_distribution: blockedStatusTotal === 13 &&
    Object.entries(expectedStatusDistribution)
      .filter(([status]) => status.startsWith("blocked_"))
      .every(([status, count]) => inventory?.status_distribution?.[status] === count),
  warning_distribution: stable(inventory?.warning_distribution) === stable(expectedWarningDistribution),
  insight_distribution: stable(inventory?.insight_count_distribution) === stable(expectedInsightDistribution),
  execution_manifest_contract: doc.includes("docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json") &&
    doc.includes("static_only: true") &&
    doc.includes("non_authoritative: true") &&
    doc.includes("no_external_access: true") &&
    doc.includes("It must not include full rows"),
  runner_contract: doc.includes("scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs") &&
    doc.includes("run the complete package exactly twice") &&
    doc.includes("No third repair run is allowed") &&
    doc.includes("must not support automatic discovery"),
  semantic_hash_verification: scenarioSemanticHashesPresent,
  metadata_only_evidence: metadataOnlyContract(action414InventoryText, doc),
  full_data_prohibition: doc.includes("Full-Row/Full-Result/Full-Insight Prohibition"),
  exactly_two_runs: inventory?.freeze_runs?.run_count === 2 &&
    inventory?.freeze_runs?.third_run_executed === false &&
    doc.includes("exactly twice"),
  temp_path_policy: doc.includes("<system-temp>/ture/action-416-expanded-static-pattern-discovery-shadow/") &&
    doc.includes("target symlinks") &&
    doc.includes("path traversal") &&
    doc.includes("shadow_aborted"),
  cleanup: doc.includes("Temporary evidence must be deleted") &&
    doc.includes("Cleanup failure returns `shadow_failed`"),
  stop_conditions: doc.includes("Stop before execution and return `shadow_aborted`") &&
    doc.includes("Fail after execution and return `shadow_failed`"),
  decision_vocabularies: ["approved", "approved_with_conditions", "blocked", "shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"]
    .every((value) => doc.includes(`\`${value}\``)),
  no_runner_exists: !exists("scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs") || action416ExecutionCompatible,
  no_execution_manifest_exists: !exists("docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json") || action416ExecutionCompatible,
  action416_execution_compatible_after_approval: action416ExecutionCompatible,
  no_shadow_occurred: forbiddenArtifactsFound.length === 0,
  no_source_modification: Object.values(protectedHashReadback).every((entry) => entry.unchanged),
  no_runtime_persistence_replay_provider_supabase_feedback: sourceAvoidsRuntimeImports(verifierSource) &&
    sourceAvoids(verifierSource, [
      "process" + ".env",
      "globalThis" + ".fetch",
      "create" + "Client(",
      "discover" + "Patterns(",
      "mapSnapshot" + "ToLearningDataset(",
  ]) && sourceAvoids(testSource, [
    "fetch(",
    "create" + "Client(",
    "@supabase/",
  ]),
  runtime_preview_chain_untouched: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    runtimePreviewFiles().length === 0,
  approval_decision_exists: doc.includes("Decision: `approved`"),
  action416_separately_identified: doc.includes("`action_416_expanded_static_pattern_discovery_shadow_execution`"),
  action413_action414_remain_healthy: action413Doc.includes("`approved_with_conditions`") &&
    action413Verifier.includes("action414_hash_freeze_artifacts_are_narrow") &&
    action414Doc.includes("## Next Action 415 Approval Gate"),
};

const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const approvalDecision = failedChecks.length === 0 ? "approved" : "blocked";

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  approval_decision: approvalDecision,
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  shadow_decision_vocabulary: ["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [],
  action414_full_inventory_sha256: inventory?.full_inventory_sha256 ?? null,
  action414_freeze_payload_sha256: inventory?.freeze_runs?.run_1_inventory_payload_sha256 ?? null,
  protected_hashes: protectedHashReadback,
  scenario_count: inventory?.scenario_count ?? 0,
  scenario_ids: scenarioIds,
  coverage_families: inventory?.coverage_families ?? [],
  status_distribution: inventory?.status_distribution ?? {},
  blocked_status_total: blockedStatusTotal,
  warning_distribution: inventory?.warning_distribution ?? {},
  insight_count_distribution: inventory?.insight_count_distribution ?? {},
  future_execution_manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  future_runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  forbidden_artifacts_found: forbiddenArtifactsFound,
  action416_package_artifacts_found: action416PackageArtifactsFound,
  action416_execution_compatible_after_approval: action416ExecutionCompatible,
  metadata_evidence_limits: "bounded_metadata_only_no_full_rows_results_insights_contexts_outcomes_secrets",
  temp_path_policy: "<system-temp>/ture/action-416-expanded-static-pattern-discovery-shadow/",
  repeat_run_requirement: {
    run_count: 2,
    third_run_allowed: false,
    cleanup_required: true,
  },
  no_effect_flags: noEffectFlags,
  runtime_preview_status: inventory?.runtime_preview_status ?? "unknown",
  unrelated_work_classification: "action_415_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: "action_416_expanded_static_pattern_discovery_shadow_execution",
};

console.log(JSON.stringify(report, null, 2));
process.exit(failedChecks.length === 0 ? 0 : 1);
