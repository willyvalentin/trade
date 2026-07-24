#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "fs";
import { homedir, tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-429-static-confidence-calibration-shadow-use.md",
  manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  runner: "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
  verifier: "scripts/action-429-static-confidence-calibration-shadow-use-verify.mjs",
  test: "tests/e2e/action-429-static-confidence-calibration-shadow-use.spec.ts",
  action427Verifier: "scripts/action-427-independent-static-confidence-calibration-hash-freeze-verification-verify.mjs",
  action428Verifier: "scripts/action-428-static-confidence-calibration-shadow-execution-approval-gate-verify.mjs",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
};

const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";
const expectedManifestHash = "99d492a606d1bdf651dff6f6c0eb4be8de6886d3cbd16f60dcc6d9bb5bce4f19";
const expectedPackageHash = "3bec2908f1c07da1fbdf2052f4e5cce4987f4d4a6589141dc94a29f34fa6c7ef";
const expectedScenarioIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
const expectedStatusDistribution = {
  calibrated: 14,
  calibrated_with_warnings: 11,
  no_adjustment: 5,
  blocked_invalid_input: 9,
  blocked_overlapping_evidence: 1,
  blocked_unsupported_insight: 1,
  blocked_invalid_lineage: 1,
  blocked_future_leakage: 1,
  blocked_invalid_configuration: 1,
  insufficient_eligible_evidence: 1,
};
const expectedWarningDistribution = {
  duplicate_mapper_row_identity: 4,
  metric_value_unavailable: 3,
  duplicate_insight_deduped: 1,
  overlapping_insight_excluded: 3,
  confidence_clamped_to_bounds: 2,
};
const expectedIssueDistribution = {
  warning_status_contradiction: 2,
  overlapping_evidence_conflict: 2,
  ineligible_pattern_discovery_status: 1,
  invalid_lineage: 1,
  future_leakage: 1,
  invalid_insight_structure: 1,
  invalid_configuration_shape: 1,
  invalid_base_confidence: 6,
  insufficient_eligible_evidence: 1,
};
const approvedAction429Files = [
  paths.manifest,
  paths.runner,
  paths.doc,
  paths.verifier,
  paths.test,
];
const forbiddenProductionRoots = ["app", "proxy.ts", "middleware.ts", "middleware.js"];
const forbiddenEvidencePatterns = [
  /action-429.*evidence/i,
  /action-429.*output/i,
  /action-429.*result/i,
  /confidence-calibration-shadow-evidence/i,
];
const forbiddenEvidenceText = [
  "AUTOMATION_SECRET",
  "SUPABASE_SERVICE_ROLE",
  "TWELVE_DATA_API_KEY",
  "TRADE_APP_PASSWORD",
  "recommendation_payload",
  "full_insights",
  "process.env",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaText = (value) => createHash("sha256").update(value, "utf8").digest("hex");

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_canonical_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_canonical_value");
}

function stableHash(value) {
  return shaText(JSON.stringify(canonicalize(value)));
}

function exactObject(actual, expected) {
  return JSON.stringify(Object.fromEntries(Object.entries(actual ?? {}).sort())) ===
    JSON.stringify(Object.fromEntries(Object.entries(expected).sort()));
}

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => {
    if (entry === ".git" || entry === ".next" || entry === "node_modules") return [];
    return collectFiles(join(path, entry));
  }).sort();
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function scanText(path, needles) {
  if (!exists(path)) return [];
  return collectFiles(path).filter((file) => {
    const text = read(file);
    return needles.some((needle) => text.includes(needle));
  });
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const manifest = exists(paths.manifest) ? JSON.parse(read(paths.manifest)) : null;
const runnerText = exists(paths.runner) ? read(paths.runner) : "";
const runnerOutput = exists(paths.runner) ? runJson(paths.runner) : null;
const action427 = exists(paths.action427Verifier) ? runJson(paths.action427Verifier) : null;
const action428 = exists(paths.action428Verifier) ? runJson(paths.action428Verifier) : null;
const action309 = exists(paths.action309Guard) ? runJson(paths.action309Guard) : null;
const golden = exists(paths.goldenVerifier) ? runJson(paths.goldenVerifier) : null;
const action429Files = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-429/i.test(path));
const unapprovedAction429Files = action429Files.filter((path) => !approvedAction429Files.includes(path));
const trackedEvidenceFiles = action429Files.filter((path) => forbiddenEvidencePatterns.some((pattern) => pattern.test(path)));
const forbiddenEvidenceTextFiles = action429Files.filter((path) => {
  if (approvedAction429Files.includes(path) && !trackedEvidenceFiles.includes(path)) return false;
  const text = read(path);
  return forbiddenEvidenceText.some((needle) => text.includes(needle));
});
const productionConsumerFiles = forbiddenProductionRoots.flatMap((path) =>
  scanText(path, ["pure-confidence-calibration", "calibrateConfidence", "action-429-static-confidence-calibration"]));
const tempDirectory = resolve(realpathSync(tmpdir()), "ture/action-429-static-confidence-calibration-shadow");
const tempEvidenceRemaining = existsSync(tempDirectory);
const homeTempRejected = await import(pathToFileURL(abs(paths.runner)).href)
  .then((module) => {
    try {
      module.assertSafeTempDirectory(resolve(homedir(), "action-429-static-confidence-calibration-shadow"));
      return false;
    } catch {
      return true;
    }
  });
const repoTempRejected = await import(pathToFileURL(abs(paths.runner)).href)
  .then((module) => {
    try {
      module.assertSafeTempDirectory(resolve(root, ".tmp-action-429"));
      return false;
    } catch {
      return true;
    }
  });

const manifestScenarios = manifest?.scenarios ?? [];
const completeIssueRecords = manifestScenarios.flatMap((scenario) =>
  (scenario.complete_issue_inventory ?? []).map((issue) => ({ scenario_id: scenario.scenario_id, ...issue })));
const completeWarningRecords = manifestScenarios.flatMap((scenario) =>
  (scenario.complete_warning_inventory ?? []).map((warning) => ({ scenario_id: scenario.scenario_id, ...warning })));
const expectedIssueCount = Object.values(expectedIssueDistribution).reduce((sum, count) => sum + count, 0);
const expectedWarningCount = Object.values(expectedWarningDistribution).reduce((sum, count) => sum + count, 0);
const scenarioHashPattern = /^[a-f0-9]{64}$/;
const calibrationIdPattern = /^confidence_calibration_v1:[a-f0-9]{24}$/;

const checks = {
  documentation_exists: exists(paths.doc) && doc.includes("Action 429 - Static Confidence Calibration Shadow Execution"),
  runner_exists: exists(paths.runner),
  manifest_exists: exists(paths.manifest),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  approved_package_boundary: approvedAction429Files.every(exists) && unapprovedAction429Files.length === 0,
  action_426_inventory_bound: manifest?.action_426_inventory_sha256 === expectedInventoryHash &&
    doc.includes(expectedInventoryHash),
  manifest_schema_valid: manifest?.manifest_schema_version === "action_429_static_confidence_calibration_shadow_input_manifest_v1",
  manifest_hash_bound: manifest ? stableHash(manifest) === expectedManifestHash && doc.includes(expectedManifestHash) : false,
  exact_45_scenarios: manifest?.scenario_count === 45 && manifestScenarios.length === 45 && runnerOutput?.scenario_count === 45,
  exact_scenario_ids_and_order: JSON.stringify(manifest?.scenario_ids ?? []) === JSON.stringify(expectedScenarioIds) &&
    JSON.stringify(manifestScenarios.map((scenario) => scenario.scenario_id)) === JSON.stringify(expectedScenarioIds) &&
    JSON.stringify(runnerOutput?.scenario_ids ?? []) === JSON.stringify(expectedScenarioIds),
  protected_hashes_match: runnerOutput &&
    Object.values(runnerOutput.source_integrity ?? {}).every((entry) => entry.matches === true && entry.actual === entry.expected),
  status_distribution_exact: exactObject(manifest?.expected_status_distribution, expectedStatusDistribution) &&
    exactObject(runnerOutput?.status_distribution, expectedStatusDistribution),
  warning_distribution_exact: exactObject(manifest?.expected_warning_distribution, expectedWarningDistribution) &&
    exactObject(runnerOutput?.warning_distribution, expectedWarningDistribution),
  issue_distribution_exact: exactObject(manifest?.expected_issue_distribution, expectedIssueDistribution) &&
    exactObject(runnerOutput?.issue_distribution, expectedIssueDistribution),
  complete_issue_metadata_exact: completeIssueRecords.length === expectedIssueCount &&
    completeIssueRecords.every((issue) =>
      typeof issue.code === "string" &&
      issue.path?.startsWith("/") &&
      issue.severity === "error" &&
      issue.messageKey === `confidence_calibration.${issue.code}`) &&
    runnerOutput?.complete_issue_metadata_matched === true,
  complete_warning_metadata_exact: completeWarningRecords.length === expectedWarningCount &&
    completeWarningRecords.every((warning) =>
      typeof warning.code === "string" &&
      warning.path?.startsWith("/") &&
      warning.severity === "warning" &&
      warning.messageKey === `confidence_calibration.${warning.code}`) &&
    runnerOutput?.complete_warning_metadata_matched === true,
  supportive_and_adverse_results_present: ["cc425_01", "cc425_02", "cc425_03", "cc425_06", "cc425_07", "cc425_08"]
    .every((id) => manifestScenarios.some((scenario) => scenario.scenario_id === id)),
  attenuation_duplicate_overlap_cap_clamp_zero_cases_present:
    ["cc425_09", "cc425_11", "cc425_12", "cc425_13", "cc425_16", "cc425_17", "cc425_23", "cc425_27", "cc425_29", "cc425_31", "cc425_32", "cc425_33"]
      .every((id) => manifestScenarios.some((scenario) => scenario.scenario_id === id)),
  included_excluded_ids_verified: manifestScenarios.every((scenario) =>
    Array.isArray(scenario.included_insight_ids) && Array.isArray(scenario.excluded_insight_ids)),
  calibration_ids_and_semantic_hashes: manifestScenarios.every((scenario) =>
    scenario.calibration_id === null || calibrationIdPattern.test(scenario.calibration_id)) &&
    manifestScenarios.every((scenario) =>
      [scenario.identity_sha256, scenario.independent_identity_sha256, scenario.canonical_result_sha256, scenario.scenario_summary_sha256]
        .every((hash) => hash === null || scenarioHashPattern.test(hash))) &&
    runnerOutput?.calibration_id_and_semantic_hash_result === "matched",
  expected_results_match: runnerOutput?.expected_results_match === true &&
    runnerOutput?.delta_cap_clamp_overlap_result === "matched",
  canonical_serialization_exposed: runnerText.includes("function stableHash") &&
    runnerText.includes("canonicalize") &&
    runnerText.includes("package_sha256"),
  exactly_two_runs: runnerText.includes('executePackage(manifest, "run_1")') &&
    runnerText.includes('executePackage(manifest, "run_2")') &&
    !runnerText.includes('"run_3"') &&
    !runnerText.includes("retry"),
  repeat_run_identical: runnerOutput?.repeat_run_identical === true &&
    runnerOutput?.run_1_package_sha256 === expectedPackageHash &&
    runnerOutput?.run_2_package_sha256 === expectedPackageHash,
  metadata_only_evidence_verified: runnerOutput?.metadata_only_evidence_verified === true &&
    doc.includes("Temporary evidence contained only bounded metadata"),
  temp_path_safe: runnerOutput?.temp_path === "<system-temp>/ture/action-429-static-confidence-calibration-shadow/" &&
    homeTempRejected &&
    repoTempRejected,
  cleanup_verified: runnerOutput?.temporary_evidence_written === true &&
    runnerOutput?.temporary_evidence_deleted === true &&
    runnerOutput?.temporary_output_exists_after_cleanup === false &&
    tempEvidenceRemaining === false,
  no_tracked_evidence: trackedEvidenceFiles.length === 0 && forbiddenEvidenceTextFiles.length === 0,
  no_source_mutation: runnerOutput &&
    Object.values(runnerOutput.source_integrity ?? {}).every((entry) => entry.matches === true),
  no_runtime_provider_supabase_replay_persistence_feedback: runnerOutput?.persistence_result === "none" &&
    runnerOutput?.replay_result === "none" &&
    runnerOutput?.runtime_result === "none" &&
    runnerOutput?.external_access_result === "none" &&
    runnerOutput?.feedback_result === "none" &&
    runnerOutput?.provider_call_executed === false &&
    runnerOutput?.supabase_read_executed === false &&
    runnerOutput?.supabase_write_executed === false,
  no_recommendation_mutation_or_authoritative_data: runnerOutput?.recommendation_mutated === false &&
    runnerOutput?.authoritative_data_created === false,
  production_consumers_absent: productionConsumerFiles.length === 0,
  final_shadow_decision_valid: runnerOutput?.final_shadow_decision === "shadow_passed" &&
    JSON.stringify(runnerOutput?.decision_vocabulary ?? []) === JSON.stringify([
      "shadow_passed",
      "shadow_passed_with_conditions",
      "shadow_failed",
      "shadow_aborted",
    ]),
  action427_healthy: action427?.verification_status === "passed" &&
    action427?.readiness_decision === "ready_with_conditions",
  action428_healthy: action428?.verification_status === "passed" &&
    ["absent", "complete_approved_package_present"].includes(action428?.action429_package_state),
  action309_guard_healthy: action309?.guard_status === "passed",
  golden_static_safety_healthy: golden?.verification_status === "passed",
  runtime_preview_paused: runnerOutput?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  next_independent_action_identified: runnerOutput?.recommended_next_action ===
    "action_430_independent_static_confidence_calibration_shadow_verification" &&
    doc.includes("action_430_independent_static_confidence_calibration_shadow_verification"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  checks,
  failed_conditions: failedConditions,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  final_shadow_decision: runnerOutput?.final_shadow_decision ?? "shadow_aborted",
  scenario_count: runnerOutput?.scenario_count ?? 0,
  scenario_ids: runnerOutput?.scenario_ids ?? [],
  status_distribution: runnerOutput?.status_distribution ?? {},
  warning_distribution: runnerOutput?.warning_distribution ?? {},
  issue_distribution: runnerOutput?.issue_distribution ?? {},
  complete_issue_metadata_matched: runnerOutput?.complete_issue_metadata_matched === true,
  complete_warning_metadata_matched: runnerOutput?.complete_warning_metadata_matched === true,
  expected_results_match: runnerOutput?.expected_results_match === true,
  delta_cap_clamp_overlap_result: runnerOutput?.delta_cap_clamp_overlap_result ?? "unknown",
  calibration_id_and_semantic_hash_result: runnerOutput?.calibration_id_and_semantic_hash_result ?? "unknown",
  repeat_run_identical: runnerOutput?.repeat_run_identical === true,
  run_1_package_sha256: runnerOutput?.run_1_package_sha256 ?? null,
  run_2_package_sha256: runnerOutput?.run_2_package_sha256 ?? null,
  expected_package_sha256: expectedPackageHash,
  manifest_sha256: runnerOutput?.manifest_sha256 ?? null,
  expected_manifest_sha256: expectedManifestHash,
  metadata_only_evidence_verified: runnerOutput?.metadata_only_evidence_verified === true,
  temporary_evidence_deleted: runnerOutput?.temporary_evidence_deleted === true,
  temporary_output_exists_after_cleanup: runnerOutput?.temporary_output_exists_after_cleanup ?? null,
  temp_evidence_remaining: tempEvidenceRemaining,
  approved_action429_files: approvedAction429Files,
  unapproved_action429_files: unapprovedAction429Files,
  tracked_evidence_files: trackedEvidenceFiles,
  forbidden_evidence_text_files: forbiddenEvidenceTextFiles,
  production_consumer_files: productionConsumerFiles,
  source_integrity: runnerOutput?.source_integrity ?? {},
  persistence_result: runnerOutput?.persistence_result ?? "unknown",
  replay_result: runnerOutput?.replay_result ?? "unknown",
  runtime_result: runnerOutput?.runtime_result ?? "unknown",
  external_access_result: runnerOutput?.external_access_result ?? "unknown",
  feedback_result: runnerOutput?.feedback_result ?? "unknown",
  recommendation_mutated: runnerOutput?.recommendation_mutated ?? true,
  authoritative_data_created: runnerOutput?.authoritative_data_created ?? true,
  runtime_preview_status: runnerOutput?.runtime_preview_status ?? "unknown",
  unrelated_work_classification: "action_429_static_confidence_calibration_shadow_package_only",
  recommended_next_action: runnerOutput?.recommended_next_action ?? "action_430_independent_static_confidence_calibration_shadow_verification",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (failedConditions.length > 0) process.exitCode = 1;
