#!/usr/bin/env node

import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, realpathSync } from "fs";
import { dirname, join, resolve, sep } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const paths = {
  manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  runner: "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
  doc: "docs/action-444-static-confidence-calibration-advisory-shadow-use.md",
  verifier: "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  test: "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action442Verifier: "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
  action443Verifier: "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
  adapter: "lib/confidence-calibration-advisory-adapter.ts",
  projectionAdapter: "lib/confidence-calibration-recommendation-advisory-projection.ts",
};

const expected = {
  action441PackageHash: "e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8",
  action441ScenarioHash: "78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15",
  adapterHash: "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
  manifestHash: "cb75253f5ac6c1040ffcfd34bfd0dde1d1f8ba46113c3d58cdb50a4ac7bf68c6",
  packageHash: "e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c",
  ids: Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`),
  statusDistribution: {
    advisory_ready: 6,
    advisory_ready_with_warnings: 2,
    advisory_no_adjustment: 1,
    advisory_insufficient_evidence: 1,
    blocked_invalid_input: 6,
    blocked_invalid_lineage: 12,
    blocked_future_leakage: 6,
    blocked_calibration_result: 10,
    blocked_unsupported_status: 1,
    blocked_confidence_mismatch: 3,
  },
  hashClassificationDistribution: {
    complete: 39,
    legacy: 1,
    invalid_or_retained: 8,
  },
  warningDistribution: {
    none: 45,
    metric_value_unavailable: 3,
  },
  issueDistribution: {
    none: 9,
    blocked_calibration_result: 14,
    blocked_confidence_mismatch: 3,
    invalid_calibration_result: 2,
    invalid_original_confidence: 4,
    invalid_recommendation_identity: 3,
    invalid_snapshot_lineage: 3,
    blocked_invalid_lineage: 1,
    blocked_future_leakage: 5,
    blocked_feedback_reuse: 4,
  },
};

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
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareText(left, right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_value");
}

function sha256(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function fileHash(path) {
  return createHash("sha256").update(read(path), "utf8").digest("hex");
}

function numberMapEqual(left, right) {
  const keys = [...new Set([...Object.keys(left ?? {}), ...Object.keys(right ?? {})])].sort(compareText);
  return keys.every((key) => left?.[key] === right?.[key]);
}

function runJson(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(result.stdout || result.stderr || `${command} failed`);
  }
  const start = result.stdout.indexOf("{");
  const end = result.stdout.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error(`json_output_missing:${command}`);
  return JSON.parse(result.stdout.slice(start, end + 1));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

const manifest = exists(paths.manifest) ? JSON.parse(read(paths.manifest)) : {};
const doc = exists(paths.doc) ? read(paths.doc) : "";
const runner = exists(paths.runner) ? read(paths.runner) : "";
const action441 = exists(paths.action441Inventory) ? JSON.parse(read(paths.action441Inventory)) : {};
const runnerReport = exists(paths.runner) && exists(paths.manifest)
  ? runJson("node", [paths.runner])
  : {};
const action442 = exists(paths.action442Verifier)
  ? runJson("node", [paths.action442Verifier])
  : {};
const action443 = exists(paths.action443Verifier)
  ? runJson("node", [paths.action443Verifier])
  : {};

const tempTarget = join(
  realpathSync(resolve(sep, tmpdir())),
  "ture",
  "action-444-static-confidence-calibration-advisory-shadow",
);
const tempClean = !existsSync(tempTarget) || readdirSync(tempTarget).length === 0;

const trackedEvidence = rgFiles("metadata-only-evidence|action_444_static_confidence_calibration_advisory_shadow_evidence_v1", ["docs", "scripts", "tests"])
  .filter((path) => ![
    paths.runner,
    paths.verifier,
    paths.test,
    paths.doc,
    "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
    "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
    "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
    "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
    "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
    "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
    "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
    "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
    "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
    "tests/e2e/action-445-independent-static-confidence-calibration-advisory-shadow-verification.spec.ts",
    "tests/e2e/action-446-static-confidence-calibration-advisory-shadow-release-gate.spec.ts",
    "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
    "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
    "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
    "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
    "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
    "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
    "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
    "docs/action-445-independent-static-confidence-calibration-advisory-shadow-verification.md",
    "docs/action-446-static-confidence-calibration-advisory-shadow-release-gate.md",
    "docs/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.md",
    "docs/action-448-confidence-calibration-recommendation-advisory-projection-implementation.md",
  ].includes(path));

const advisoryConsumers = rgFiles("buildConfidenceCalibrationAdvisory|confidence-calibration-advisory-adapter", ["app", "lib", "scripts", "tests"])
  .filter((path) => ![
    "lib/confidence-calibration-advisory-adapter.ts",
    "lib/confidence-calibration-recommendation-advisory-projection.ts",
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
    "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
    "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
    paths.runner,
    paths.verifier,
    "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
    "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
    "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
    "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
    "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
    "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
    "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
    "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
    "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
    "tests/e2e/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
    "tests/e2e/action-433-independent-confidence-calibration-advisory-adapter-verification.spec.ts",
    "tests/e2e/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.spec.ts",
    "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
    "tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts",
    "tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts",
    "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts",
    "tests/e2e/action-439-independent-complete-semantic-binding-verification.spec.ts",
    "tests/e2e/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification.spec.ts",
    "tests/e2e/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate.spec.ts",
    paths.test,
    "tests/e2e/action-445-independent-static-confidence-calibration-advisory-shadow-verification.spec.ts",
    "tests/e2e/action-446-static-confidence-calibration-advisory-shadow-release-gate.spec.ts",
    "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
    "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
    "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
    "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
    "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
    "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
    "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
    "scripts/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate-verify.mjs",
    "scripts/action-439-independent-complete-semantic-binding-verification-verify.mjs",
    "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
    "scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs",
    "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs",
    "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
    "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs",
    "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs",
    "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
    "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
  ].includes(path));

const forbiddenRuntimePaths = [
  "app/api/action-444",
  "app/api/confidence-calibration-advisory",
  "app/api/confidence-calibration-advisory-shadow",
  "lib/confidence-calibration-advisory-runtime-consumer.ts",
  "lib/confidence-calibration-advisory-shadow-runner.ts",
].filter(exists);

const checks = {
  documentation_exists: exists(paths.doc),
  manifest_exists: exists(paths.manifest),
  runner_exists: exists(paths.runner),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  manifest_schema_bound: manifest.manifest_schema_version === "action_444_static_confidence_calibration_advisory_shadow_input_manifest_v1",
  action443_approval_bound: manifest.action_443_approval_decision === "approved" &&
    action443.verification_status === "passed" &&
    action443.approval_decision === "approved",
  action442_ready: action442.verification_status === "passed" &&
    action442.readiness_decision === "ready",
  action441_hashes_exact: manifest.action_441_package_inventory_sha256 === expected.action441PackageHash &&
    manifest.action_441_scenario_summary_sha256 === expected.action441ScenarioHash &&
    action441.package_inventory_sha256 === expected.action441PackageHash &&
    action441.scenario_summary_sha256 === expected.action441ScenarioHash,
  protected_hashes_exact: manifest.advisory_adapter_sha256 === expected.adapterHash &&
    fileHash(paths.adapter) === expected.adapterHash &&
    Object.values(manifest.protected_source_hashes ?? {}).every((item) => item.matches_expected === true),
  manifest_hash_exact: sha256(manifest) === expected.manifestHash,
  scenario_count_exact: manifest.scenario_count === 48 &&
    manifest.scenarios?.length === 48 &&
    runnerReport.scenario_count === 48,
  scenario_order_exact: JSON.stringify(manifest.exact_ordered_scenario_ids) === JSON.stringify(expected.ids) &&
    JSON.stringify(runnerReport.exact_scenario_order) === JSON.stringify(expected.ids),
  status_distribution_exact: numberMapEqual(manifest.status_distribution, expected.statusDistribution) &&
    numberMapEqual(runnerReport.status_distribution, expected.statusDistribution),
  hash_classification_distribution_exact: numberMapEqual(manifest.hash_classification_distribution, expected.hashClassificationDistribution) &&
    numberMapEqual(runnerReport.hash_classification_distribution, expected.hashClassificationDistribution),
  warning_issue_distribution_exact: numberMapEqual(manifest.warning_distribution, expected.warningDistribution) &&
    numberMapEqual(manifest.issue_distribution, expected.issueDistribution) &&
    numberMapEqual(runnerReport.warning_distribution, expected.warningDistribution) &&
    numberMapEqual(runnerReport.issue_distribution, expected.issueDistribution),
  per_scenario_values_bound: manifest.scenarios?.every((scenario) =>
    scenario.id &&
    scenario.expected_status === scenario.actual_status &&
    typeof scenario.advisory_id !== "undefined" &&
    typeof scenario.advisory_hash !== "undefined" &&
    /^[a-f0-9]{64}$/.test(scenario.advisory_identity_sha256) &&
    /^[a-f0-9]{64}$/.test(scenario.canonical_advisory_result_sha256) &&
    Array.isArray(scenario.warnings) &&
    Array.isArray(scenario.issues) &&
    "bounded_lineage_hashes" in scenario &&
    scenario.application_eligible === false &&
    scenario.non_authoritative === true &&
    scenario.applied === false) === true,
  complete_legacy_fallback_passed: Object.values(runnerReport.complete_legacy_fallback_result ?? {}).every(Boolean),
  confidence_binding_passed: Object.values(runnerReport.confidence_binding_result ?? {}).every(Boolean),
  lineage_leakage_feedback_passed: Object.values(runnerReport.lineage_leakage_feedback_result ?? {}).every(Boolean),
  no_adjustment_passed: runnerReport.no_adjustment_result?.id === "ca440_03" &&
    runnerReport.no_adjustment_result?.proposed_delta_basis_points === 0 &&
    runnerReport.no_adjustment_result?.proposed_calibrated_confidence_basis_points ===
      runnerReport.no_adjustment_result?.original_confidence_basis_points &&
    runnerReport.no_adjustment_result?.application_eligible === false,
  advisory_ids_and_hashes_passed: runnerReport.advisory_id_and_semantic_hash_result?.all_ready_scenarios_have_ids === true &&
    runnerReport.advisory_id_and_semantic_hash_result?.all_scenarios_have_identity_and_result_hashes === true,
  canonical_serialization_bound: runner.includes("function canonicalize") &&
    runner.includes("Object.is(value, -0) ? 0 : value") &&
    runner.includes("JSON.stringify(canonicalize(value))"),
  exactly_two_runs: runner.includes("const first = buildShadowPackage();") &&
    runner.includes("const second = buildShadowPackage();") &&
    !runner.includes("const third ="),
  repeat_run_identical: runnerReport.repeat_run_identical === true &&
    runnerReport.run_1_package_hash === expected.packageHash &&
    runnerReport.run_2_package_hash === expected.packageHash,
  metadata_only: runnerReport.metadata_only_result?.evidence_metadata_only === true &&
    Object.entries(runnerReport.metadata_only_result ?? {})
      .filter(([key]) => key !== "evidence_metadata_only")
      .every(([, value]) => value === false),
  cleanup_passed: runnerReport.temp_path_and_cleanup_result?.temporary_evidence_deleted === true &&
    runnerReport.temp_path_and_cleanup_result?.temp_directory_absent_or_empty === true &&
    tempClean &&
    trackedEvidence.length === 0,
  source_integrity_unchanged: runnerReport.source_integrity?.protected_sources_unchanged === true,
  no_consumers: advisoryConsumers.length === 0,
  no_runtime_provider_supabase_replay_persistence_feedback: forbiddenRuntimePaths.length === 0 &&
    runnerReport.safety?.provider_call_executed === false &&
    runnerReport.safety?.provider_call_attempted === false &&
    runnerReport.safety?.supabase_read_executed === false &&
    runnerReport.safety?.supabase_write_executed === false &&
    runnerReport.safety?.persistence_executed === false &&
    runnerReport.safety?.replay_executed === false &&
    runnerReport.safety?.runtime_route_created === false &&
    runnerReport.safety?.external_access_executed === false &&
    runnerReport.safety?.feedback_executed === false,
  no_confidence_or_recommendation_mutation: runnerReport.safety?.confidence_applied === false &&
    runnerReport.safety?.recommendation_mutated === false &&
    runnerReport.safety?.scanner_behavior_changed === false &&
    runnerReport.safety?.live_ranking_changed === false &&
    runnerReport.safety?.publication_changed === false,
  no_authoritative_data: runnerReport.safety?.authoritative_data_created === false,
  final_decision_shadow_passed: runnerReport.final_shadow_decision === "shadow_passed",
  runtime_preview_untouched: runnerReport.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action445_identified: runnerReport.recommended_next_action === "action_445_independent_static_confidence_calibration_advisory_shadow_verification" &&
    doc.includes("Action 445"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  final_shadow_decision: runnerReport.final_shadow_decision ?? "shadow_aborted",
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  checks,
  scenario_count: runnerReport.scenario_count,
  status_distribution: runnerReport.status_distribution,
  hash_classification_distribution: runnerReport.hash_classification_distribution,
  complete_legacy_fallback_result: runnerReport.complete_legacy_fallback_result,
  confidence_binding_result: runnerReport.confidence_binding_result,
  lineage_leakage_feedback_result: runnerReport.lineage_leakage_feedback_result,
  warning_distribution: runnerReport.warning_distribution,
  issue_distribution: runnerReport.issue_distribution,
  no_adjustment_result: {
    id: runnerReport.no_adjustment_result?.id,
    proposed_delta_basis_points: runnerReport.no_adjustment_result?.proposed_delta_basis_points,
    proposed_calibrated_confidence_basis_points: runnerReport.no_adjustment_result?.proposed_calibrated_confidence_basis_points,
  },
  advisory_id_and_semantic_hash_result: runnerReport.advisory_id_and_semantic_hash_result,
  action_441_hashes: {
    package_inventory_sha256: runnerReport.action_441_package_inventory_sha256,
    scenario_summary_sha256: runnerReport.action_441_scenario_summary_sha256,
  },
  package_hashes: {
    manifest_hash: runnerReport.manifest_hash,
    run_1_package_hash: runnerReport.run_1_package_hash,
    run_2_package_hash: runnerReport.run_2_package_hash,
    repeat_run_identical: runnerReport.repeat_run_identical,
  },
  metadata_only_result: runnerReport.metadata_only_result,
  temp_path_and_cleanup_result: runnerReport.temp_path_and_cleanup_result,
  source_integrity: runnerReport.source_integrity,
  consumer_inventory: {
    advisory_consumers_outside_static_audits: advisoryConsumers,
    forbidden_runtime_paths: forbiddenRuntimePaths,
    tracked_evidence: trackedEvidence,
  },
  safety: runnerReport.safety,
  runtime_preview_status: runnerReport.runtime_preview_status,
  unrelated_work_classification: runnerReport.unrelated_work_classification,
  recommended_next_action: runnerReport.recommended_next_action,
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exitCode = 1;
