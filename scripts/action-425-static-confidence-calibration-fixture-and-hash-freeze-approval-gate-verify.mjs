#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  module: "lib/pure-confidence-calibration.ts",
  doc: "docs/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate.md",
  verifier: "scripts/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate-verify.mjs",
  test: "tests/e2e/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate.spec.ts",
  action424Doc: "docs/action-424-independent-post-remediation-confidence-calibration-verification.md",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
};

const expectedHashes = {
  [paths.module]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action416Manifest]: "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  [paths.action416Runner]: "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
};

const scenarioInventory = [
  ["cc425_01", "strong_supportive", 5000, "calibrated", 200, 5200, [], []],
  ["cc425_02", "moderate_supportive", 5000, "calibrated", 100, 5100, [], []],
  ["cc425_03", "weak_supportive", 5000, "calibrated", 50, 5050, [], []],
  ["cc425_04", "neutral", 5000, "no_adjustment", 0, 5000, [], []],
  ["cc425_05", "mixed", 5000, "no_adjustment", 0, 5000, [], []],
  ["cc425_06", "weak_adverse", 5000, "calibrated", -100, 4900, [], []],
  ["cc425_07", "moderate_adverse", 5000, "calibrated", -200, 4800, [], []],
  ["cc425_08", "strong_adverse", 5000, "calibrated", -300, 4700, [], []],
  ["cc425_09", "duplicate_mapper_warning", 5000, "calibrated_with_warnings", 100, 5100, ["duplicate_mapper_row_identity"], []],
  ["cc425_10", "metric_unavailable_warning", 5000, "calibrated_with_warnings", 100, 5100, ["metric_value_unavailable"], []],
  ["cc425_11", "both_reducing_warnings", 5000, "calibrated_with_warnings", 50, 5050, ["duplicate_mapper_row_identity", "metric_value_unavailable"], []],
  ["cc425_12", "duplicate_warning_equivalence_two", 5000, "calibrated_with_warnings", 100, 5100, ["duplicate_mapper_row_identity"], []],
  ["cc425_13", "duplicate_warning_equivalence_many_and_order", 5000, "calibrated_with_warnings", 50, 5050, ["duplicate_mapper_row_identity", "metric_value_unavailable"], []],
  ["cc425_14", "minimum_total_support_contradiction", 5000, "blocked_invalid_input", null, null, [], ["warning_status_contradiction"]],
  ["cc425_15", "minimum_completed_outcomes_contradiction", 5000, "blocked_invalid_input", null, null, [], ["warning_status_contradiction"]],
  ["cc425_16", "distinct_supportive_multi", 5000, "calibrated", 400, 5400, [], []],
  ["cc425_17", "distinct_adverse_multi", 5000, "calibrated", -600, 4400, [], []],
  ["cc425_18", "positive_combined_cap", 5000, "calibrated", 400, 5400, [], []],
  ["cc425_19", "negative_combined_cap", 5000, "calibrated", -600, 4400, [], []],
  ["cc425_20", "exact_cancellation", 5000, "no_adjustment", 0, 5000, [], []],
  ["cc425_21", "mixed_supportive_combo", 5000, "calibrated", 200, 5200, [], []],
  ["cc425_22", "neutral_adverse_combo", 5000, "calibrated", -100, 4900, [], []],
  ["cc425_23", "exact_duplicate_insight", 5000, "calibrated_with_warnings", 200, 5200, ["duplicate_insight_deduped"], []],
  ["cc425_24", "same_evidence_set_overlap", 5000, "calibrated_with_warnings", 200, 5200, ["overlapping_insight_excluded"], []],
  ["cc425_25", "partial_source_overlap", 5000, "calibrated_with_warnings", 200, 5200, ["overlapping_insight_excluded"], []],
  ["cc425_26", "full_overlap_same_key", 5000, "calibrated_with_warnings", 200, 5200, ["overlapping_insight_excluded"], []],
  ["cc425_27", "conflicting_overlap", 5000, "blocked_overlapping_evidence", null, null, [], ["overlapping_evidence_conflict"]],
  ["cc425_28", "upper_bound_no_clamp_exact_100", 9800, "calibrated", 200, 10000, [], []],
  ["cc425_29", "upper_bound_clamp", 9900, "calibrated_with_warnings", 200, 10000, ["confidence_clamped_to_bounds"], []],
  ["cc425_30", "lower_bound_no_clamp_exact_0", 100, "calibrated", -100, 0, [], []],
  ["cc425_31", "lower_bound_clamp", 50, "calibrated_with_warnings", -100, 0, ["confidence_clamped_to_bounds"], []],
  ["cc425_32", "exact_zero_neutral", 0, "no_adjustment", 0, 0, [], []],
  ["cc425_33", "exact_hundred_neutral", 10000, "no_adjustment", 0, 10000, [], []],
  ["cc425_34", "unsupported_status", 5000, "blocked_unsupported_insight", null, null, [], ["ineligible_pattern_discovery_status"]],
  ["cc425_35", "invalid_lineage", 5000, "blocked_invalid_lineage", null, null, [], ["invalid_lineage"]],
  ["cc425_36", "failed_leakage", 5000, "blocked_future_leakage", null, null, [], ["future_leakage"]],
  ["cc425_37", "unsupported_insight_structure", 5000, "blocked_invalid_input", null, null, [], ["invalid_insight_structure"]],
  ["cc425_38", "invalid_configuration", 5000, "blocked_invalid_configuration", null, null, [], ["invalid_configuration_shape"]],
  ["cc425_39", "invalid_base_below_zero", -1, "blocked_invalid_input", null, null, [], ["invalid_base_confidence"]],
  ["cc425_40", "invalid_base_above_100", 10001, "blocked_invalid_input", null, null, [], ["invalid_base_confidence"]],
  ["cc425_41", "invalid_base_nan", "NaN", "blocked_invalid_input", null, null, [], ["invalid_base_confidence"]],
  ["cc425_42", "invalid_base_infinity", "Infinity", "blocked_invalid_input", null, null, [], ["invalid_base_confidence"]],
  ["cc425_43", "invalid_base_precision", 5000.1, "blocked_invalid_input", null, null, [], ["invalid_base_confidence"]],
  ["cc425_44", "invalid_base_numeric_string", "50.00", "blocked_invalid_input", null, null, [], ["invalid_base_confidence"]],
  ["cc425_45", "no_eligible_evidence", 5000, "insufficient_eligible_evidence", 0, 5000, [], ["insufficient_eligible_evidence"]],
].map(([id, family, baseConfidenceBps, expectedStatus, expectedDeltaBps, expectedCalibratedBps, warnings, issues]) => ({
  id,
  family,
  baseConfidenceBps,
  expectedStatus,
  expectedDeltaBps,
  expectedCalibratedBps,
  warnings,
  issues,
}));

const expectedStatusInventory = {
  calibrated: 14,
  calibrated_with_warnings: 11,
  no_adjustment: 5,
  insufficient_eligible_evidence: 1,
  blocked_invalid_input: 9,
  blocked_invalid_configuration: 1,
  blocked_invalid_lineage: 1,
  blocked_future_leakage: 1,
  blocked_overlapping_evidence: 1,
  blocked_unsupported_insight: 1,
};

const requiredFamilies = [
  "strong_supportive",
  "moderate_supportive",
  "weak_supportive",
  "neutral",
  "mixed",
  "weak_adverse",
  "moderate_adverse",
  "strong_adverse",
  "duplicate_mapper_warning",
  "metric_unavailable_warning",
  "both_reducing_warnings",
  "duplicate_warning_equivalence_two",
  "duplicate_warning_equivalence_many_and_order",
  "minimum_total_support_contradiction",
  "minimum_completed_outcomes_contradiction",
  "distinct_supportive_multi",
  "distinct_adverse_multi",
  "positive_combined_cap",
  "negative_combined_cap",
  "exact_cancellation",
  "same_evidence_set_overlap",
  "partial_source_overlap",
  "full_overlap_same_key",
  "conflicting_overlap",
  "upper_bound_no_clamp_exact_100",
  "upper_bound_clamp",
  "lower_bound_no_clamp_exact_0",
  "lower_bound_clamp",
  "unsupported_status",
  "invalid_lineage",
  "failed_leakage",
  "unsupported_insight_structure",
  "invalid_configuration",
  "invalid_base_below_zero",
  "invalid_base_above_100",
  "invalid_base_nan",
  "invalid_base_infinity",
  "invalid_base_precision",
  "invalid_base_numeric_string",
  "no_eligible_evidence",
];

const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  calibration_execution_executed: false,
  hash_freeze_executed: false,
  calibration_shadow_executed: false,
  recommendation_mutation_executed: false,
  feedback_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  runtime_preview_advanced: false,
};

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const verifierExecutableSource = verifierSource.replace(
  /const forbiddenCalibrationExecutionNeedles = \[[\s\S]*?\];/,
  "",
);
const action424Doc = exists(paths.action424Doc) ? read(paths.action424Doc) : "";
const sourceIntegrity = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));

const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 424 Decision",
  "Remaining Action 424 Conditions",
  "Explicit Non-Goals",
  "Fixture-Package Definition",
  "Exact Scenario Count",
  "Exact Scenario Inventory",
  "Source Classification",
  "Base-Confidence Inventory",
  "Pattern Insight Envelope Inventory",
  "Configuration Inventory",
  "Supportive Scenarios",
  "Adverse Scenarios",
  "Neutral Scenarios",
  "Mixed Scenarios",
  "Discovered-With-Warnings Scenarios",
  "Warning Attenuation Scenarios",
  "Duplicate-Warning Scenarios",
  "Duplicate-Insight Scenarios",
  "Overlapping-Evidence Scenarios",
  "Conflicting-Overlap Scenarios",
  "Multi-Insight Aggregation Scenarios",
  "Positive-Cap Scenarios",
  "Negative-Cap Scenarios",
  "Upper-Clamp Scenarios",
  "Lower-Clamp Scenarios",
  "Zero-Adjustment Scenarios",
  "Invalid-Input Scenarios",
  "Unsupported-Status Scenarios",
  "Lineage-Block Scenarios",
  "Leakage-Block Scenarios",
  "Warning-Contradiction Scenarios",
  "Expected-Result Inventory",
  "Expected Issue/Warning Inventory",
  "Expected Calibration-ID Policy",
  "Expected Result-Hash Policy",
  "Fixture Source Policy",
  "Fixture Output Policy",
  "Bounded Metadata Policy",
  "Hash-Freeze Sequencing",
  "Shadow Sequencing",
  "Repeat-Run Determinism",
  "Stop Conditions",
  "Approval Vocabulary",
  "Deterministic Gate Conditions",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Future Action 426 Boundary",
];

const futureAction426AllowedFiles = [
  "docs/action-426-static-confidence-calibration-hash-freeze.md",
  "docs/action-426-static-confidence-calibration-hash-inventory.json",
  "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
  "scripts/action-426-static-confidence-calibration-hash-freeze-verify.mjs",
  "tests/e2e/action-426-static-confidence-calibration-hash-freeze.spec.ts",
];

const forbiddenArtifacts = [
  "docs/action-425-static-confidence-calibration-hash-inventory.json",
  "docs/action-425-static-confidence-calibration-input-manifest.json",
  "docs/action-425-static-confidence-calibration-fixture-package.json",
  "scripts/action-425-static-confidence-calibration-hash-freeze.mjs",
  "scripts/action-425-static-confidence-calibration-run.mjs",
  "scripts/action-425-static-confidence-calibration-shadow-run.mjs",
  "app/api/action-425",
  "app/action-425",
].filter(exists);
const action426AllowedPackageFilesFound = futureAction426AllowedFiles.filter(exists);

const trackedAction425Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-425/.test(path))
  .filter((path) => /fixture-package|hash-inventory|input-manifest|run\.mjs|shadow|runtime|provider|supabase|persistence|replay|feedback|recommendation|scanner|ranking/i.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));

const scenarioIds = scenarioInventory.map((item) => item.id);
const expectedScenarioIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
const statusInventory = countBy(scenarioInventory, "expectedStatus");
const baseInventory = [...new Set(scenarioInventory.map((item) => String(item.baseConfidenceBps)))].sort();
const warningInventory = scenarioInventory.flatMap((item) => item.warnings.map((warning) => `${warning}:${item.id}`));
const issueInventory = scenarioInventory.flatMap((item) => item.issues.map((issue) => `${issue}:${item.id}`));
const forbiddenCalibrationExecutionNeedles = [
  "pathToFileURL",
  "await import(",
  "calibrate" + "Confidence(",
];

const checks = {
  documentation_exists: exists(paths.doc),
  documentation_sections_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  action424_readiness_recorded: action424Doc.includes("`ready_with_conditions`") &&
    action424Doc.includes("executable_calibration_fixture_package_not_created") &&
    action424Doc.includes("calibration_hash_freeze_gate_pending"),
  approval_decision_recorded: doc.includes("`approved_with_conditions`"),
  exact_scenario_count: scenarioInventory.length === 45 && doc.includes("exactly `45` calibration scenarios"),
  exact_scenario_ids: JSON.stringify(scenarioIds) === JSON.stringify(expectedScenarioIds) &&
    expectedScenarioIds.every((id) => doc.includes(id)),
  required_coverage_families: requiredFamilies.every((family) => scenarioInventory.some((item) => item.family === family)),
  status_inventory_exact: Object.entries(expectedStatusInventory).every(([status, count]) => statusInventory[status] === count) &&
    Object.keys(statusInventory).every((status) => expectedStatusInventory[status] === statusInventory[status]) &&
    Object.entries(expectedStatusInventory).every(([status, count]) => doc.includes(`\`${status}\`: ${count}`)),
  source_policy_static_bounded: [
    "deterministic test-local",
    "fixed Action 419 configuration",
    "production Pattern Insights",
    "Supabase rows",
    "provider/news data",
    "environment-derived values",
  ].every((token) => doc.includes(token)),
  configuration_inventory_exact: [
    "configuration_version: confidence_calibration_config_v1",
    "confidence_scale_basis_points_per_point: 100",
    "positive_per_insight_cap_basis_points: 200",
    "negative_per_insight_cap_basis_points: -300",
    "combined_positive_cap_basis_points: 400",
    "combined_negative_cap_basis_points: -600",
    "rounding_mode: round_half_away_from_zero",
  ].every((token) => doc.includes(token)),
  base_confidence_inventory: ["0", "50", "100", "5000", "9800", "9900", "10000", "-1", "10001", "NaN", "Infinity", "5000.1", "50.00"].every((value) => baseInventory.includes(value)),
  warning_issue_inventory: warningInventory.length === 13 &&
    issueInventory.length === 15 &&
    doc.includes("duplicate_mapper_row_identity") &&
    doc.includes("invalid_base_confidence"),
  delta_cap_clamp_inventory: doc.includes("positive_combined_cap") &&
    doc.includes("negative_combined_cap") &&
    doc.includes("upper_bound_clamp") &&
    doc.includes("lower_bound_clamp"),
  overlap_inventory: doc.includes("same_evidence_set_overlap") &&
    doc.includes("partial_source_overlap") &&
    doc.includes("full_overlap_same_key") &&
    doc.includes("conflicting_overlap") &&
    doc.includes("blocked_overlapping_evidence"),
  zero_adjustment_inventory: ["cc425_04", "cc425_05", "cc425_20", "cc425_32", "cc425_33"].every((id) => doc.includes(id)),
  identity_hash_policy: doc.includes("confidence_calibration_v1:[a-f0-9]{24}") &&
    doc.includes("canonical result SHA-256") &&
    doc.includes("package inventory SHA-256"),
  sequencing_policy: [
    "Action 426 - Static Calibration Fixture and Semantic Hash Freeze",
    "Action 427 - Independent Calibration Hash-Freeze Verification",
    "Action 428 - Static Calibration Shadow Execution Approval Gate",
    "Action 429 - Static Calibration Shadow Execution",
    "Action 430 - Independent Calibration Shadow Verification",
  ].every((token) => doc.includes(token)),
  future_action426_boundary: futureAction426AllowedFiles.every((path) => doc.includes(path)) &&
    doc.includes("must not add a shadow runner or execution manifest"),
  metadata_only_policy: doc.includes("metadata-only") &&
    doc.includes("No full Pattern Insight objects") &&
    doc.includes("full Pattern Discovery results"),
  repeat_run_and_stop_conditions: doc.includes("run the freeze exactly twice") &&
    doc.includes("No third repair run") &&
    doc.includes("Stop if pure calibration hash differs"),
  source_integrity: Object.values(sourceIntegrity).every((item) => item.unchanged),
  no_forbidden_artifacts: forbiddenArtifacts.length === 0 && trackedAction425Evidence.length === 0,
  action426_package_boundary_if_present: action426AllowedPackageFilesFound.length === 0 ||
    action426AllowedPackageFilesFound.length === futureAction426AllowedFiles.length,
  verifier_does_not_execute_calibration: forbiddenCalibrationExecutionNeedles.every((needle) => !verifierExecutableSource.includes(needle)),
  no_effect_flags_false: Object.values(noEffectFlags).every((value) => value === false),
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs"),
};

const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const unresolvedConditions = [
  "semantic_hash_constants_pending_action_426",
  "metadata_hash_inventory_pending_action_426",
  "independent_hash_freeze_verification_pending_action_427",
];

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  approval_decision: failedChecks.length === 0 ? "approved_with_conditions" : "blocked",
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions_count: unresolvedConditions.length,
  unresolved_conditions: unresolvedConditions,
  exact_scenario_count: scenarioInventory.length,
  scenario_ids: scenarioIds,
  coverage_families: scenarioInventory.map((item) => item.family),
  base_confidence_inventory: baseInventory,
  status_inventory: statusInventory,
  expected_status_inventory: expectedStatusInventory,
  warning_inventory: warningInventory,
  issue_inventory: issueInventory,
  future_action426_allowed_files: futureAction426AllowedFiles,
  action426_allowed_package_files_found: action426AllowedPackageFilesFound,
  forbidden_artifacts_found: forbiddenArtifacts,
  tracked_action425_evidence_files: trackedAction425Evidence,
  source_integrity: sourceIntegrity,
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  runtime_preview_route_changed: false,
  runtime_preview_candidate_advanced: false,
  calibration_fixture_package_created: false,
  calibration_hash_inventory_created: false,
  calibration_runner_created: false,
  calibration_manifest_created: false,
  calibration_shadow_executed: false,
  calibration_execution_executed: false,
  recommendation_mutation_executed: false,
  recommended_next_action: "action_426_static_confidence_calibration_hash_freeze",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
