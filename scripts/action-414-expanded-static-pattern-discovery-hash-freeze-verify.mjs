#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  doc: "docs/action-414-expanded-static-pattern-discovery-hash-freeze.md",
  inventory: "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json",
  freezeScript: "scripts/action-414-expanded-static-pattern-discovery-hash-freeze.mjs",
  verifier: "scripts/action-414-expanded-static-pattern-discovery-hash-freeze-verify.mjs",
  test: "tests/e2e/action-414-expanded-static-pattern-discovery-hash-freeze.spec.ts",
  action413Doc: "docs/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate.md",
  action413Verifier: "scripts/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate-verify.mjs",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action411Runner: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  action411Manifest: "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
};

const protectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action411Runner]: "074a5ff02d288b03412996b09061dd509712dc891c3f4405ee540c9e1757010c",
  [paths.action411Manifest]: "79ecb36b0f69b9742ef377deabdaaeb9048be4c59305c3d7f94dd3c0c78c67f3",
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

const expectedFamilies = [
  "baseline",
  "configuration_safety",
  "determinism",
  "duplicate_structure",
  "grouping_block",
  "horizon_block",
  "lineage_safety",
  "mixed_evidence",
  "neutral_evidence",
  "numeric_behavior",
  "row_safety",
  "sufficient_support",
  "threshold_boundary",
  "warning_combo",
];

const expectedStatuses = [
  "blocked_future_leakage",
  "blocked_invalid_configuration",
  "blocked_invalid_input",
  "blocked_invalid_lineage",
  "blocked_non_consumable_row",
  "blocked_nondeterministic_grouping",
  "discovered",
  "discovered_with_warnings",
  "insufficient_evidence",
];

const expectedWarnings = [
  "duplicate_mapper_row_identity",
  "metric_value_unavailable",
  "minimum_completed_outcomes_not_met",
  "minimum_total_support_not_met",
];

const requiredDocSections = [
  "Purpose",
  "Scope",
  "Action 413 Approval",
  "Unresolved Condition",
  "Source Integrity",
  "Exact 30 Scenarios",
  "Construction Policy",
  "Row-Hash Inventory",
  "Expected Statuses",
  "Warning Inventory",
  "Support/Outcome Inventory",
  "Group Inventory",
  "Insight Inventory",
  "Semantic Hash Inventory",
  "Independent Canonicalization",
  "Repeat-Freeze Determinism",
  "Blocked Scenario Behavior",
  "Non-Authoritative Classification",
  "No-Runner Guarantee",
  "No-Execution-Manifest Guarantee",
  "No-Shadow Guarantee",
  "No-Persistence Guarantee",
  "No-Runtime Guarantee",
  "No-Feedback Guarantee",
  "Runtime-Preview Paused State",
  "Next Action 415 Approval Gate",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort(compareText).map((key) => [key, canonicalize(value[key])]));
  }
  throw new TypeError("unsupported_value");
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function runtimePreviewFiles() {
  return [...collectFiles("app"), ...collectFiles("public")]
    .filter((path) => /action-414|action_414|expanded-static-pattern-discovery-hash/.test(read(path)));
}

function sourceAvoids(source, tokens) {
  return tokens.every((token) => !source.includes(token));
}

function boundedMetadataOnly(inventoryText) {
  const forbidden = [
    "\"row\":",
    "\"rows\":",
    "\"outcome_fields\":",
    "\"setup_and_confidence\":",
    "recommendationSnapshot",
    "contextSnapshot",
    "AUTOMATION_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "TWELVE" + "_DATA_API_KEY",
    "/Users/",
  ];
  return forbidden.every((marker) => !inventoryText.includes(marker));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const inventoryText = exists(paths.inventory) ? read(paths.inventory) : "";
const inventory = inventoryText ? readJson(paths.inventory) : null;
const freezeSource = exists(paths.freezeScript) ? read(paths.freezeScript) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const action413Doc = exists(paths.action413Doc) ? read(paths.action413Doc) : "";
const action413Verifier = exists(paths.action413Verifier) ? read(paths.action413Verifier) : "";

let checkReport = null;
let checkError = null;
try {
  checkReport = JSON.parse(execFileSync("node", [paths.freezeScript, "--check"], {
    cwd: root,
    encoding: "utf8",
    timeout: 120_000,
  }));
} catch (error) {
  checkError = error instanceof Error ? error.message : "unknown_check_error";
}

const protectedHashReadback = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));

const forbiddenArtifactsFound = [
  "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  "tests/e2e/action-416-expanded-static-pattern-discovery-shadow-execution.spec.ts",
].filter(exists);

const scenarioIds = inventory?.scenario_ids ?? [];
const families = inventory?.coverage_families ?? [];
const statusInventory = Object.keys(inventory?.status_distribution ?? {}).sort(compareText);
const warningInventory = Object.keys(inventory?.warning_distribution ?? {}).sort(compareText);
const insightCounts = Object.keys(inventory?.insight_count_distribution ?? {}).sort((left, right) => Number(left) - Number(right));
const scenarios = inventory?.scenarios ?? [];

const checks = {
  documentation_exists: exists(paths.doc),
  documentation_contract_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  inventory_exists: exists(paths.inventory),
  freeze_script_exists: exists(paths.freezeScript),
  verifier_exists: exists(paths.verifier),
  focused_tests_exist: exists(paths.test) && testSource.includes("Action 414 expanded static Pattern Discovery hash freeze"),
  action413_approval_preserved: action413Doc.includes("`approved_with_conditions`") &&
    action413Verifier.includes("allowedAction414HashFreezeArtifacts"),
  exact_30_scenarios: inventory?.scenario_count === 30 && scenarios.length === 30,
  exact_scenario_ids: canonicalJson(scenarioIds) === canonicalJson(expectedScenarioIds),
  exact_coverage_families: canonicalJson(families) === canonicalJson(expectedFamilies),
  expected_status_inventory: canonicalJson(statusInventory) === canonicalJson(expectedStatuses),
  expected_warning_inventory: canonicalJson(warningInventory) === canonicalJson(expectedWarnings),
  insight_count_inventory: canonicalJson(insightCounts) === canonicalJson(["0", "1"]),
  bounded_metadata_only: Boolean(inventory) && boundedMetadataOnly(inventoryText),
  historical_baseline_preserved: inventory?.scenarios?.[0]?.semantic_hashes?.evidence_set_sha256 === inventory?.action_411_historical_hashes?.evidence_set_sha256 &&
    inventory?.scenarios?.[0]?.semantic_hashes?.group_hashes?.[0] === inventory?.action_411_historical_hashes?.group_sha256 &&
    inventory?.scenarios?.[0]?.semantic_hashes?.canonical_result_sha256 === inventory?.action_411_historical_hashes?.result_sha256 &&
    inventory?.scenarios?.[0]?.semantic_hashes?.scenario_summary_sha256 === inventory?.action_411_historical_hashes?.repeat_batch_sha256,
  row_hash_inventory: scenarios.every((scenario) =>
    Array.isArray(scenario.row_ids) &&
    Array.isArray(scenario.canonical_row_hashes) &&
    scenario.row_ids.length === scenario.row_count &&
    scenario.canonical_row_hashes.length === scenario.row_count &&
    scenario.canonical_row_hashes.every((hash) => /^[a-f0-9]{64}$/.test(hash))),
  semantic_hash_inventory: scenarios.every((scenario) =>
    scenario.semantic_hashes &&
    /^[a-f0-9]{64}$/.test(scenario.semantic_hashes.canonical_scenario_input_sha256) &&
    /^[a-f0-9]{64}$/.test(scenario.semantic_hashes.ordered_row_set_sha256) &&
    /^[a-f0-9]{64}$/.test(scenario.semantic_hashes.canonical_result_sha256) &&
    /^[a-f0-9]{64}$/.test(scenario.semantic_hashes.scenario_summary_sha256) &&
    /^[a-f0-9]{64}$/.test(scenario.scenario_inventory_sha256)),
  blocked_issue_metadata: scenarios
    .filter((scenario) => String(scenario.expected_status).startsWith("blocked_"))
    .every((scenario) => Array.isArray(scenario.blocked_issue_metadata) && scenario.blocked_issue_metadata.length > 0),
  independent_canonicalization: inventory?.independent_canonicalization?.metadata_only_cross_check === "scenario_summary_hash_rebuilt_from_bounded_metadata",
  exactly_two_freeze_runs: inventory?.freeze_runs?.run_count === 2 && inventory?.freeze_runs?.third_run_executed === false,
  identical_inventory_hashes: inventory?.freeze_runs?.identical === true &&
    inventory?.freeze_runs?.run_1_inventory_payload_sha256 === inventory?.freeze_runs?.run_2_inventory_payload_sha256,
  check_mode_matches_inventory: checkReport?.hash_freeze_result === "hash_freeze_passed" &&
    checkReport?.mode === "check" &&
    checkReport?.full_inventory_sha256 === inventory?.full_inventory_sha256 &&
    !checkError,
  protected_hashes_unchanged: Object.values(protectedHashReadback).every((entry) => entry.unchanged) &&
    canonicalJson(inventory?.protected_source_hashes_before) === canonicalJson(inventory?.protected_source_hashes_after),
  no_expanded_runner: !exists("scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs"),
  no_execution_manifest: !exists("docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json"),
  no_shadow_evidence: forbiddenArtifactsFound.length === 0,
  no_source_mutation: Object.values(protectedHashReadback).every((entry) => entry.unchanged),
  no_runtime_persistence_replay_provider_supabase_feedback: sourceAvoids(freezeSource, [
    "fetch" + "(",
    "@supa" + "base",
    "supabase" + "-js",
    "TWELVE" + "_DATA",
    "next" + "/server",
  ]) && runtimePreviewFiles().length === 0,
  runtime_preview_untouched: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    runtimePreviewFiles().length === 0,
  action415_identified: inventory?.next_action === "action_415_expanded_static_shadow_approval_gate" &&
    doc.includes("action_415_expanded_static_shadow_approval_gate"),
};

const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  hash_freeze_result: inventory?.hash_freeze_result ?? "missing",
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: failedChecks.length === 0 ? [] : failedChecks,
  scenario_count: inventory?.scenario_count ?? 0,
  scenario_ids: scenarioIds,
  coverage_families: families,
  status_distribution: inventory?.status_distribution ?? {},
  warning_distribution: inventory?.warning_distribution ?? {},
  insight_count_distribution: inventory?.insight_count_distribution ?? {},
  full_inventory_sha256: inventory?.full_inventory_sha256 ?? null,
  repeat_freeze: inventory?.freeze_runs ?? null,
  historical_baseline_integrity: checks.historical_baseline_preserved ? "passed" : "failed",
  bounded_metadata_result: checks.bounded_metadata_only ? "passed" : "failed",
  protected_hashes: protectedHashReadback,
  forbidden_artifacts_found: forbiddenArtifactsFound,
  check_mode_error: checkError,
  no_effect_flags: inventory?.no_effect_flags ?? {},
  runtime_preview_status: inventory?.runtime_preview_status ?? "missing",
  unrelated_work_classification: "action_414_docs_inventory_scripts_tests_and_minimal_guard_updates_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_415_expanded_static_shadow_approval_gate"
    : "resolve_action_414_hash_freeze_verification_failures",
};

console.log(JSON.stringify(report, null, 2));
if (failedChecks.length > 0) process.exit(1);
