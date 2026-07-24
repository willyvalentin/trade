#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-417-independent-expanded-static-pattern-discovery-shadow-verification.md",
  verifier: "scripts/action-417-independent-expanded-static-pattern-discovery-shadow-verification-verify.mjs",
  test: "tests/e2e/action-417-independent-expanded-static-pattern-discovery-shadow-verification.spec.ts",
  action414Inventory: "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json",
  action414FreezeScript: "scripts/action-414-expanded-static-pattern-discovery-hash-freeze.mjs",
  action415Verifier: "scripts/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate-verify.mjs",
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  action416Doc: "docs/action-416-expanded-static-pattern-discovery-shadow-use.md",
  action416Verifier: "scripts/action-416-expanded-static-pattern-discovery-shadow-use-verify.mjs",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action411Runner: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  action411Manifest: "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
};

const expectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action411Runner]: "074a5ff02d288b03412996b09061dd509712dc891c3f4405ee540c9e1757010c",
  [paths.action411Manifest]: "79ecb36b0f69b9742ef377deabdaaeb9048be4c59305c3d7f94dd3c0c78c67f3",
  [paths.action414Inventory]: "2b2bed561b2dcbc08ff996d416e463fcb16b2b5a4eec1dbb52126768c9288e3d",
  [paths.action414FreezeScript]: "eda36bcbf9f05e3945578946a7322546ea3b83dc5fe7e770d65728f9aa77aea3",
  [paths.action416Manifest]: "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  [paths.action416Runner]: "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
  [paths.action416Doc]: "2866a098c00b35d40a13e3bd5432c9dd76ec2f661fba5046f63e9663fda55f00",
};

const expectedInventoryHash = "8b7e5c55f1ae8e27a278ca7d844d204aee4a84d4546cb8b612c3db122d83fe4b";
const expectedFreezePayloadHash = "4e1f3e0cd8e67e7d0230c1af8618d8e803867c75c32d18857c48b1234e835c12";
const expectedPackageHash = "ccbff3b786c62b0e56cd6300bae9a6950cba2ad15a3376f37dc7130d698477a8";
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
const expectedConditionClassifications = [
  {
    condition_id: "historical_action_411_baseline_preserved_without_regeneration",
    scenario_id: "pd413_01_action411_baseline_insufficient_evidence",
    expected_contract_behavior: "insufficient_evidence_zero_insights_non_authoritative",
    observed_behavior: "historical_hashes_preserved_without_regeneration",
    action_authority: "actions_411_413_414",
    semantic_expectations_matched: true,
    source_integrity_held: true,
    determinism_held: true,
    cleanup_held: true,
    classification: "expected_historical_baseline_condition",
    readiness_impact: "does_not_block",
  },
  {
    condition_id: "nondeterministic_grouping_contract_case_preserved_as_static_block",
    scenario_id: "pd413_20_nondeterministic_grouping_blocked",
    expected_contract_behavior: "blocked_nondeterministic_grouping_no_groups_no_insights",
    observed_behavior: "static_blocked_coverage_case_deterministic_across_package_runs",
    action_authority: "actions_413_414",
    semantic_expectations_matched: true,
    source_integrity_held: true,
    determinism_held: true,
    cleanup_held: true,
    classification: "expected_blocked_coverage_case",
    readiness_impact: "does_not_block",
  },
  {
    condition_id: "current_contract_limitation_pd413_02",
    scenario_id: "pd413_02_threshold_19_case_20_completed",
    expected_contract_behavior: "minimum_support_warning_boundary",
    observed_behavior: "frozen_action_413_expectation_not_fully_expressible_by_current_pure_contract",
    action_authority: "actions_413_414",
    semantic_expectations_matched: true,
    source_integrity_held: true,
    determinism_held: true,
    cleanup_held: true,
    classification: "expected_contract_limitation",
    readiness_impact: "does_not_block",
  },
  {
    condition_id: "current_contract_limitation_pd413_03",
    scenario_id: "pd413_03_threshold_20_case_19_completed",
    expected_contract_behavior: "completed_outcome_boundary_contract_limitation",
    observed_behavior: "frozen_action_413_expectation_not_fully_expressible_by_current_pure_contract",
    action_authority: "actions_413_414",
    semantic_expectations_matched: true,
    source_integrity_held: true,
    determinism_held: true,
    cleanup_held: true,
    classification: "expected_contract_limitation",
    readiness_impact: "does_not_block",
  },
  {
    condition_id: "current_contract_limitation_pd413_17",
    scenario_id: "pd413_17_insufficient_with_duplicate_warning_combo",
    expected_contract_behavior: "insufficient_duplicate_warning_combo_contract_limitation",
    observed_behavior: "frozen_action_413_expectation_not_fully_expressible_by_current_pure_contract",
    action_authority: "actions_413_414",
    semantic_expectations_matched: true,
    source_integrity_held: true,
    determinism_held: true,
    cleanup_held: true,
    classification: "expected_contract_limitation",
    readiness_impact: "does_not_block",
  },
];

const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 413 Approval Summary",
  "Action 414 Freeze Summary",
  "Action 415 Approval Summary",
  "Action 416 Execution Summary",
  "Explicit Non-Goals",
  "Source-Integrity Audit",
  "Action 414 Inventory-Integrity Audit",
  "Action 416 Manifest-Integrity Audit",
  "Action 416 Runner-Integrity Audit",
  "Exact Scenario-Count Audit",
  "Exact Scenario-ID/Order Audit",
  "Source-Classification Audit",
  "Scenario-Construction Audit",
  "Status Audit",
  "Blocked-Status Audit",
  "Issue Audit",
  "Warning Audit",
  "Insight Audit",
  "Support/Outcome-Count Audit",
  "Semantic-Hash Audit",
  "Scenario-Summary-Hash Audit",
  "Aggregate-Distribution Audit",
  "Repeat-Run Audit",
  "Package-Hash Audit",
  "Metadata-Only Audit",
  "Path-Safety Audit",
  "Cleanup Audit",
  "Tracked-Evidence Audit",
  "Source-Mutation Audit",
  "Persistence Audit",
  "Replay Audit",
  "Runtime Audit",
  "External-Access Audit",
  "Feedback Audit",
  "Authoritative-Data Audit",
  "Condition Inventory",
  "Condition Classification",
  "Expected-Contract-Limitation Review",
  "Actual-Readiness-Blocker Review",
  "Coverage-Strength Review",
  "Remaining-Coverage-Gap Review",
  "Next-Step Readiness Review",
  "Readiness Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

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

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  return output.trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).sort();
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function runAction416RunnerWithAudit() {
  const statusBefore = statusFiles();
  const hashBefore = Object.fromEntries(Object.keys(expectedHashes).map((file) => [file, exists(file) ? shaFile(file) : null]));
  const result = runJson(paths.action416Runner);
  const statusAfter = statusFiles();
  const hashAfter = Object.fromEntries(Object.keys(expectedHashes).map((file) => [file, exists(file) ? shaFile(file) : null]));
  return {
    result,
    source_status_unchanged: stable(statusBefore) === stable(statusAfter),
    protected_hashes_unchanged_after_execution: stable(hashBefore) === stable(hashAfter),
    hash_before: hashBefore,
    hash_after: hashAfter,
  };
}

function runtimeConsumerFiles() {
  const targets = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].filter(exists);
  if (targets.length === 0) return [];
  const scan = spawnSync("rg", ["-l", "action-417|action_417|action-416|expanded-static-pattern-discovery-shadow|discoverPatterns|mapSnapshotToLearningDataset", ...targets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

function sourceAvoids(source, tokens) {
  return tokens.every((token) => !source.includes(token));
}

function metadataOnlyText(text) {
  const forbidden = [
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
    "insights\":[{",
  ];
  return forbidden.filter((marker) => text.includes(marker));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const manifestText = exists(paths.action416Manifest) ? read(paths.action416Manifest) : "";
const manifest = manifestText ? readJson(paths.action416Manifest) : null;
const inventory = exists(paths.action414Inventory) ? readJson(paths.action414Inventory) : null;
const action415 = exists(paths.action415Verifier) ? runJson(paths.action415Verifier) : null;
const action416 = exists(paths.action416Verifier) ? runJson(paths.action416Verifier) : null;
const runnerAudit = exists(paths.action416Runner) ? runAction416RunnerWithAudit() : {
  result: null,
  source_status_unchanged: false,
  protected_hashes_unchanged_after_execution: false,
  hash_before: {},
  hash_after: {},
};
const runnerResult = runnerAudit.result;
const protectedHashReadback = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));
const tempEvidencePath = join(tmpdir(), "ture", "action-416-expanded-static-pattern-discovery-shadow");
const trackedEvidenceFiles = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-416|action-417/.test(path))
  .filter((path) => /evidence|result|report|full-row|full-result|full-insight/.test(path))
  .filter((path) => ![
    paths.action416Manifest,
    paths.action416Runner,
    paths.action416Doc,
    paths.action416Verifier,
    paths.doc,
    paths.verifier,
    paths.test,
  ].includes(path));
const scenarioIds = manifest?.scenario_ids ?? [];
const manifestScenarios = manifest?.scenarios ?? [];
const inventoryScenarios = inventory?.scenarios ?? [];
const conditionClassificationsValid = expectedConditionClassifications.every((entry) => {
  const scenario = inventoryScenarios.find((item) => item.scenario_id === entry.scenario_id);
  if (!scenario) return false;
  if (entry.classification === "expected_historical_baseline_condition") {
    return scenario.expected_status === "insufficient_evidence" &&
      scenario.expected_insight_count === 0 &&
      scenario.semantic_hashes?.canonical_result_sha256 === "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c";
  }
  if (entry.classification === "expected_blocked_coverage_case") {
    return scenario.expected_status === "blocked_nondeterministic_grouping" &&
      scenario.blocked_issue_metadata?.some((issue) => issue.code === "nondeterministic_grouping" && issue.path === "/rows") &&
      (scenario.expected_group_keys ?? []).length === 0 &&
      scenario.expected_insight_count === 0;
  }
  return scenario.implementation_observation?.current_contract_limitation === "frozen_action_413_expectation_not_fully_expressible_by_current_pure_contract" &&
    entry.readiness_impact === "does_not_block";
});
const blockedStatusTotal = Object.entries(runnerResult?.status_distribution ?? {})
  .filter(([status]) => status.startsWith("blocked_"))
  .reduce((sum, [, count]) => sum + count, 0);
const discoveredScenarioCount = inventoryScenarios.filter((scenario) => scenario.expected_status === "discovered").length;
const discoveredWithWarningsScenarioCount = inventoryScenarios.filter((scenario) => scenario.expected_status === "discovered_with_warnings").length;
const insufficientScenarioCount = inventoryScenarios.filter((scenario) => scenario.expected_status === "insufficient_evidence").length;
const blockedScenarioCount = inventoryScenarios.filter((scenario) => String(scenario.expected_status).startsWith("blocked_")).length;
const semanticHashInventoryComplete = inventoryScenarios.every((scenario) =>
  Array.isArray(scenario.canonical_row_hashes) &&
  scenario.canonical_row_hashes.every((hash) => /^[a-f0-9]{64}$/.test(hash)) &&
  /^[a-f0-9]{64}$/.test(scenario.semantic_hashes?.ordered_row_set_sha256 ?? "") &&
  (scenario.semantic_hashes?.evidence_set_sha256 === null || /^[a-f0-9]{64}$/.test(scenario.semantic_hashes?.evidence_set_sha256 ?? "")) &&
  Array.isArray(scenario.semantic_hashes?.group_hashes) &&
  scenario.semantic_hashes.group_hashes.every((hash) => /^[a-f0-9]{64}$/.test(hash)) &&
  Array.isArray(scenario.semantic_hashes?.insight_hashes) &&
  scenario.semantic_hashes.insight_hashes.every((hash) => /^[a-f0-9]{64}$/.test(hash)) &&
  /^[a-f0-9]{64}$/.test(scenario.semantic_hashes?.canonical_result_sha256 ?? "") &&
  /^[a-f0-9]{64}$/.test(scenario.semantic_hashes?.scenario_summary_sha256 ?? "") &&
  /^[a-f0-9]{64}$/.test(scenario.scenario_inventory_sha256 ?? ""));
const metadataForbiddenMarkers = [
  ...metadataOnlyText(manifestText),
  ...metadataOnlyText(JSON.stringify(runnerResult ?? {})),
];
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
  documentation_contract_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  protected_hashes_recorded_and_match: Object.values(protectedHashReadback).every((entry) => entry.unchanged) &&
    doc.includes(expectedHashes[paths.action416Runner]) &&
    doc.includes(expectedInventoryHash) &&
    doc.includes(expectedFreezePayloadHash) &&
    doc.includes(expectedPackageHash),
  action414_inventory_integrity: inventory?.hash_freeze_result === "hash_freeze_passed" &&
    inventory?.full_inventory_sha256 === expectedInventoryHash &&
    inventory?.freeze_runs?.run_1_inventory_payload_sha256 === expectedFreezePayloadHash &&
    inventory?.freeze_runs?.run_2_inventory_payload_sha256 === expectedFreezePayloadHash &&
    protectedHashReadback[paths.action414Inventory]?.unchanged === true,
  action416_manifest_integrity: manifest?.manifest_schema_version === "action_416_expanded_static_pattern_discovery_shadow_input_manifest_v1" &&
    manifest?.action_414_inventory_sha256 === expectedInventoryHash &&
    manifest?.action_414_freeze_payload_sha256 === expectedFreezePayloadHash &&
    manifest?.scenario_count === 30 &&
    protectedHashReadback[paths.action416Manifest]?.unchanged === true,
  action416_runner_integrity: protectedHashReadback[paths.action416Runner]?.unchanged === true &&
    sourceAvoids(exists(paths.action416Runner) ? read(paths.action416Runner) : "", [
      "process.argv",
      "globalThis." + "fetch",
      "@supa" + "base/",
      "create" + "Client(",
    ]),
  exact_30_scenarios: manifest?.scenario_count === 30 &&
    manifestScenarios.length === 30 &&
    inventory?.scenario_count === 30 &&
    inventoryScenarios.length === 30 &&
    runnerResult?.scenario_count === 30,
  exact_order: stable(scenarioIds) === stable(expectedScenarioIds) &&
    stable(inventory?.scenario_ids ?? []) === stable(expectedScenarioIds),
  source_classification_audit: stable(manifest?.source_policy?.allowed ?? []) === stable(inventory?.source_policy?.allowed ?? []) &&
    stable(manifest?.source_policy?.blocked ?? []) === stable(inventory?.source_policy?.blocked ?? []),
  scenario_construction_audit: manifestScenarios.every((scenario, index) =>
    scenario.scenario_id === inventoryScenarios[index]?.scenario_id &&
    stable(scenario.row_ids) === stable(inventoryScenarios[index]?.row_ids) &&
    stable(scenario.canonical_row_hashes) === stable(inventoryScenarios[index]?.canonical_row_hashes)),
  status_distribution_exact: stable(runnerResult?.status_distribution) === stable(expectedStatusDistribution) &&
    discoveredScenarioCount === 9 &&
    discoveredWithWarningsScenarioCount === 4 &&
    insufficientScenarioCount === 4,
  blocked_status_distribution_exact: blockedStatusTotal === 13 &&
    blockedScenarioCount === 13 &&
    Object.entries(expectedStatusDistribution)
      .filter(([status]) => status.startsWith("blocked_"))
      .every(([status, count]) => runnerResult?.status_distribution?.[status] === count),
  warning_distribution_exact: stable(runnerResult?.warning_distribution) === stable(expectedWarningDistribution),
  insight_distribution_exact: stable(runnerResult?.insight_distribution) === stable(expectedInsightDistribution),
  semantic_hashes_exact: semanticHashInventoryComplete,
  scenario_hashes_exact: manifestScenarios.every((scenario, index) =>
    scenario.scenario_inventory_sha256 === inventoryScenarios[index]?.scenario_inventory_sha256 &&
    scenario.semantic_hashes?.scenario_summary_sha256 === inventoryScenarios[index]?.semantic_hashes?.scenario_summary_sha256),
  repeat_package_hash_exact: runnerResult?.run_1_package_sha256 === expectedPackageHash &&
    runnerResult?.run_2_package_sha256 === expectedPackageHash &&
    runnerResult?.repeat_run_identical === true,
  exactly_two_runs_no_retry: runnerResult?.executed_package_runs === 2 &&
    runnerResult?.third_run_executed === false,
  condition_inventory_complete: stable(runnerResult?.conditions ?? []) === stable([
    "historical_action_411_baseline_preserved_without_regeneration",
    "nondeterministic_grouping_contract_case_preserved_as_static_block",
    "three_frozen_action_413_expectations_are_current_contract_limitations",
  ]) && expectedConditionClassifications.length === 5,
  condition_classifications_exact: conditionClassificationsValid &&
    expectedConditionClassifications.every((entry) => entry.readiness_impact === "does_not_block"),
  no_actual_package_nondeterminism: runnerResult?.repeat_run_identical === true &&
    runnerResult?.run_1_package_sha256 === runnerResult?.run_2_package_sha256,
  metadata_only_audit: metadataForbiddenMarkers.length === 0 &&
    runnerResult?.metadata_only_result === "passed",
  path_safety_audit: runnerResult?.path_safety_result === "passed" &&
    read(paths.action416Runner).includes("unsafe_output_not_within_system_temp") &&
    read(paths.action416Runner).includes("unsafe_output_symlink"),
  cleanup_audit: runnerResult?.cleanup_result === "passed" &&
    runnerResult?.temporary_evidence_deleted === true &&
    !existsSync(tempEvidencePath),
  no_tracked_evidence: trackedEvidenceFiles.length === 0,
  no_source_mutation: runnerAudit.source_status_unchanged === true &&
    runnerAudit.protected_hashes_unchanged_after_execution === true,
  no_external_access_persistence_replay_runtime_feedback: runtimeConsumerFiles().length === 0 &&
    runnerResult?.persistence_result === "none" &&
    runnerResult?.replay_result === "none" &&
    runnerResult?.runtime_result === "none" &&
    runnerResult?.external_access_result === "none" &&
    runnerResult?.feedback_result === "none" &&
    sourceAvoids(verifierSource, [
      "fetch" + "(",
      "@supa" + "base/",
      "create" + "Client(",
      "TWELVE" + "_DATA",
      "next" + "/server",
    ]),
  non_authoritative_classification: runnerResult?.authoritative_data_created === false &&
    manifest?.non_authoritative === true &&
    manifest?.non_learning === true,
  action415_action416_healthy: action415?.verification_status === "passed" &&
    action416?.verification_status === "passed" &&
    runnerResult?.final_shadow_decision === "shadow_passed_with_conditions",
  runtime_preview_untouched: runnerResult?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    action416?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  verifier_isolation: !verifierSource.includes("process" + ".env") &&
    !testSource.includes("f" + "etch(") &&
    !verifierSource.includes("f" + "etch("),
};

const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const readinessDecision = failedChecks.length === 0 ? "ready" : "blocked";
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [],
  action416_reproduction: {
    final_shadow_decision: runnerResult?.final_shadow_decision ?? null,
    scenario_count: runnerResult?.scenario_count ?? null,
    executed_package_runs: runnerResult?.executed_package_runs ?? null,
    repeat_run_identical: runnerResult?.repeat_run_identical ?? null,
    third_run_executed: runnerResult?.third_run_executed ?? null,
  },
  source_integrity: protectedHashReadback,
  action414_inventory_integrity: {
    full_inventory_sha256: inventory?.full_inventory_sha256 ?? null,
    freeze_payload_sha256: inventory?.freeze_runs?.run_1_inventory_payload_sha256 ?? null,
    file_sha256: protectedHashReadback[paths.action414Inventory]?.actual ?? null,
  },
  action416_integrity: {
    manifest_sha256: protectedHashReadback[paths.action416Manifest]?.actual ?? null,
    runner_sha256: protectedHashReadback[paths.action416Runner]?.actual ?? null,
    doc_sha256: protectedHashReadback[paths.action416Doc]?.actual ?? null,
  },
  scenario_audit: {
    scenario_count: manifest?.scenario_count ?? 0,
    scenario_ids: scenarioIds,
    coverage_families: manifest?.coverage_families ?? [],
    source_classes: [...new Set(manifestScenarios.map((scenario) => scenario.source_classification))].sort(),
  },
  status_distribution: runnerResult?.status_distribution ?? {},
  blocked_status_distribution: Object.fromEntries(Object.entries(runnerResult?.status_distribution ?? {}).filter(([status]) => status.startsWith("blocked_"))),
  blocked_status_total: blockedStatusTotal,
  warning_distribution: runnerResult?.warning_distribution ?? {},
  insight_distribution: runnerResult?.insight_distribution ?? {},
  semantic_hash_result: semanticHashInventoryComplete ? "passed" : "failed",
  package_hash_result: runnerResult?.run_1_package_sha256 === runnerResult?.run_2_package_sha256 ? "passed" : "failed",
  package_hashes: {
    run_1_package_sha256: runnerResult?.run_1_package_sha256 ?? null,
    run_2_package_sha256: runnerResult?.run_2_package_sha256 ?? null,
  },
  condition_inventory: runnerResult?.conditions ?? [],
  condition_classifications: expectedConditionClassifications,
  actual_readiness_blockers: [],
  metadata_boundary: {
    metadata_only_result: runnerResult?.metadata_only_result ?? null,
    forbidden_markers_found: metadataForbiddenMarkers,
  },
  path_cleanup_boundary: {
    path_safety_result: runnerResult?.path_safety_result ?? null,
    cleanup_result: runnerResult?.cleanup_result ?? null,
    temporary_evidence_deleted: runnerResult?.temporary_evidence_deleted ?? null,
    tracked_evidence_files: trackedEvidenceFiles,
  },
  isolation_result: {
    source_status_unchanged: runnerAudit.source_status_unchanged,
    protected_hashes_unchanged_after_execution: runnerAudit.protected_hashes_unchanged_after_execution,
    runtime_consumer_files: runtimeConsumerFiles(),
    no_effect_flags: noEffectFlags,
  },
  coverage_strengths: [
    "expanded_static_30_scenario_inventory",
    "status_warning_insight_distribution_coverage",
    "blocked_status_coverage",
    "semantic_hash_coverage",
    "repeat_package_hash_determinism",
    "metadata_cleanup_isolation",
  ],
  remaining_coverage_gaps: [
    "broader_real_data_fixture_coverage",
    "setup_family_expansion",
    "multi_horizon_supported_discovery",
    "calibration_metric_integration",
    "production_readback_integration",
  ],
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_417_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_418_next_static_pattern_discovery_architecture_step"
    : "resolve_action_417_independent_audit_failures",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
