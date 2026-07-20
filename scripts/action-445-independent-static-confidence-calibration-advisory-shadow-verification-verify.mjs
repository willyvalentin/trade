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
  doc: "docs/action-445-independent-static-confidence-calibration-advisory-shadow-verification.md",
  verifier: "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
  test: "tests/e2e/action-445-independent-static-confidence-calibration-advisory-shadow-verification.spec.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action441Freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  action443Verifier: "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
  action444Manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  action444Runner: "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
  action444Doc: "docs/action-444-static-confidence-calibration-advisory-shadow-use.md",
  action444Verifier: "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  action444Test: "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts",
  adapter: "lib/confidence-calibration-advisory-adapter.ts",
  projectionAdapter: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learningFixtures: "lib/learning-dataset-static-fixtures.ts",
  contextFixtures: "lib/intelligence-context-static-fixtures.ts",
  insightFixtures: "lib/pattern-insight-static-fixtures.ts",
  action426Inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  action426Freezer: "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
  action429Manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  action429Runner: "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
};

const expected = {
  action441PackageHash: "e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8",
  action441ScenarioHash: "78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15",
  action444ManifestHash: "cb75253f5ac6c1040ffcfd34bfd0dde1d1f8ba46113c3d58cdb50a4ac7bf68c6",
  action444PackageHash: "e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c",
  adapterHash: "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
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

const immutableFiles = [
  paths.adapter,
  paths.calibration,
  paths.patternDiscovery,
  paths.mapper,
  paths.learningFixtures,
  paths.contextFixtures,
  paths.insightFixtures,
  paths.action426Inventory,
  paths.action426Freezer,
  paths.action429Manifest,
  paths.action429Runner,
  paths.action441Inventory,
  paths.action441Freezer,
  paths.action444Manifest,
  paths.action444Runner,
  paths.action444Doc,
  paths.action444Verifier,
  paths.action444Test,
];

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

function canonicalHash(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function fileHash(path) {
  return createHash("sha256").update(read(path), "utf8").digest("hex");
}

function hashFiles(pathsToHash) {
  return Object.fromEntries(pathsToHash.map((path) => [
    path,
    exists(path) ? fileHash(path) : null,
  ]));
}

function numberMapEqual(left, right) {
  const keys = [...new Set([...Object.keys(left ?? {}), ...Object.keys(right ?? {})])].sort(compareText);
  return keys.every((key) => left?.[key] === right?.[key]);
}

function runJson(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 80 * 1024 * 1024 });
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

function readJson(path) {
  return JSON.parse(read(path));
}

const beforeHashes = hashFiles(immutableFiles);
const manifest = exists(paths.action444Manifest) ? readJson(paths.action444Manifest) : {};
const action441 = exists(paths.action441Inventory) ? readJson(paths.action441Inventory) : {};
const doc = exists(paths.doc) ? read(paths.doc) : "";
const runner = exists(paths.action444Runner) ? read(paths.action444Runner) : "";
const runnerReport = exists(paths.action444Runner) ? runJson("node", [paths.action444Runner]) : {};
const action444VerifierReport = exists(paths.action444Verifier) ? runJson("node", [paths.action444Verifier]) : {};
const action443VerifierReport = exists(paths.action443Verifier) ? runJson("node", [paths.action443Verifier]) : {};
const afterHashes = hashFiles(immutableFiles);

const tempTarget = join(
  realpathSync(resolve(sep, tmpdir())),
  "ture",
  "action-444-static-confidence-calibration-advisory-shadow",
);
const tempClean = !existsSync(tempTarget) || readdirSync(tempTarget).length === 0;

const trackedEvidence = rgFiles("metadata-only-evidence|action_444_static_confidence_calibration_advisory_shadow_evidence_v1", ["docs", "scripts", "tests"])
  .filter((path) => ![
    paths.action444Runner,
    paths.action444Verifier,
    paths.action444Test,
    paths.projectionAdapter,
    paths.verifier,
    paths.test,
    "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
    "tests/e2e/action-446-static-confidence-calibration-advisory-shadow-release-gate.spec.ts",
    "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
    "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
    "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
    "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
    "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
    "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
    "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
    "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
    "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
    "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
    "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
    "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
    "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
    "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
  ].includes(path));

const adapterAuditConsumers = rgFiles("buildConfidenceCalibrationAdvisory|confidence-calibration-advisory-adapter", ["app", "lib", "scripts", "tests"])
  .filter((path) => ![
    paths.adapter,
    paths.projectionAdapter,
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
    "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
    "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
    paths.action444Runner,
    paths.action444Verifier,
    paths.action444Test,
    paths.verifier,
    paths.test,
    "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
    "tests/e2e/action-446-static-confidence-calibration-advisory-shadow-release-gate.spec.ts",
    "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
    "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
    "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
    "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
    "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
    "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
    "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
    "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
    "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
    "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
    "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
    "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
    "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
    "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
    "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
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
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
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
  ].includes(path));

const forbiddenRuntimePaths = [
  "app/api/action-445",
  "app/api/confidence-calibration-advisory",
  "app/api/confidence-calibration-advisory-shadow",
  "app/confidence-calibration-advisory",
  "lib/confidence-calibration-advisory-runtime-consumer.ts",
  "lib/confidence-calibration-advisory-shadow-runner.ts",
].filter(exists);

const action444ScenarioById = new Map((manifest.scenarios ?? []).map((scenario) => [scenario.id, scenario]));
const noAdjustment = action444ScenarioById.get("ca440_03");
const readyStatuses = new Set(["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"]);
const statusDistribution = manifest.status_distribution ?? {};
const hashDistribution = manifest.hash_classification_distribution ?? {};

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action443_healthy: action443VerifierReport.verification_status === "passed" &&
    action443VerifierReport.approval_decision === "approved",
  action444_verifier_healthy: action444VerifierReport.verification_status === "passed" &&
    action444VerifierReport.final_shadow_decision === "shadow_passed",
  protected_source_hashes_exact: beforeHashes[paths.adapter] === expected.adapterHash &&
    afterHashes[paths.adapter] === expected.adapterHash &&
    Object.values(manifest.protected_source_hashes ?? {}).every((item) => item.matches_expected === true),
  source_and_package_immutable: JSON.stringify(beforeHashes) === JSON.stringify(afterHashes),
  action441_binding_exact: action441.package_inventory_sha256 === expected.action441PackageHash &&
    action441.scenario_summary_sha256 === expected.action441ScenarioHash &&
    manifest.action_441_package_inventory_sha256 === expected.action441PackageHash &&
    manifest.action_441_scenario_summary_sha256 === expected.action441ScenarioHash &&
    runnerReport.action_441_package_inventory_sha256 === expected.action441PackageHash &&
    runnerReport.action_441_scenario_summary_sha256 === expected.action441ScenarioHash,
  manifest_integrity_exact: canonicalHash(manifest) === expected.action444ManifestHash &&
    action444VerifierReport.package_hashes?.manifest_hash === expected.action444ManifestHash &&
    runnerReport.manifest_hash === expected.action444ManifestHash,
  scenario_count_exact: manifest.scenario_count === 48 &&
    manifest.scenarios?.length === 48 &&
    runnerReport.scenario_count === 48,
  scenario_order_exact: JSON.stringify(manifest.exact_ordered_scenario_ids) === JSON.stringify(expected.ids) &&
    JSON.stringify(runnerReport.exact_scenario_order) === JSON.stringify(expected.ids),
  recommendation_envelope_metadata_exact: manifest.scenarios?.every((scenario) =>
    typeof scenario.recommendation_envelope_metadata?.recommendation_id === "string" &&
    typeof scenario.recommendation_envelope_metadata?.recommendation_fingerprint === "string" &&
    typeof scenario.recommendation_envelope_metadata?.recommendation_snapshot_hash === "string" &&
    scenario.recommendation_envelope_metadata?.static_only === true &&
    scenario.recommendation_envelope_metadata?.non_authoritative === true &&
    scenario.recommendation_envelope_metadata?.no_persistence === true &&
    scenario.recommendation_envelope_metadata?.no_replay === true &&
    scenario.recommendation_envelope_metadata?.no_runtime === true &&
    scenario.recommendation_envelope_metadata?.no_feedback === true) === true,
  calibration_result_metadata_exact: manifest.scenarios?.every((scenario) =>
    scenario.calibration_result_metadata &&
    typeof scenario.calibration_result_metadata.calibration_status === "string" &&
    scenario.calibration_result_metadata.non_authoritative === true &&
    scenario.calibration_result_metadata.applied === false) === true,
  advisory_configuration_exact: manifest.advisory_configuration?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    manifest.advisory_configuration?.application_policy === "never_apply_in_action_432",
  status_distribution_exact: numberMapEqual(statusDistribution, expected.statusDistribution) &&
    numberMapEqual(runnerReport.status_distribution, expected.statusDistribution),
  hash_classification_distribution_exact: numberMapEqual(hashDistribution, expected.hashClassificationDistribution) &&
    numberMapEqual(runnerReport.hash_classification_distribution, expected.hashClassificationDistribution),
  exact_hash_classification_membership: manifest.scenarios?.filter((scenario) => scenario.hash_family === "legacy").map((scenario) => scenario.id).join(",") === "ca440_28" &&
    manifest.scenarios?.filter((scenario) => scenario.hash_family === "invalid_or_retained").length === 8 &&
    manifest.scenarios?.filter((scenario) => scenario.hash_family === "complete").length === 39,
  complete_legacy_fallback_passed: Object.values(runnerReport.complete_legacy_fallback_result ?? {}).every(Boolean),
  confidence_binding_passed: Object.values(runnerReport.confidence_binding_result ?? {}).every(Boolean),
  lineage_leakage_feedback_passed: Object.values(runnerReport.lineage_leakage_feedback_result ?? {}).every(Boolean),
  warning_issue_records_exact: numberMapEqual(runnerReport.warning_distribution, expected.warningDistribution) &&
    numberMapEqual(runnerReport.issue_distribution, expected.issueDistribution) &&
    manifest.scenarios?.every((scenario) =>
      Array.isArray(scenario.warnings) &&
      Array.isArray(scenario.issues) &&
      scenario.warnings.every((warning) => warning.code && warning.path && warning.severity && warning.messageKey) &&
      scenario.issues.every((issue) => issue.code && issue.path && issue.severity && issue.messageKey)) === true,
  no_adjustment_exact: noAdjustment?.actual_status === "advisory_no_adjustment" &&
    noAdjustment?.proposed_delta_basis_points === 0 &&
    noAdjustment?.proposed_calibrated_confidence_basis_points === noAdjustment?.original_confidence_basis_points &&
    noAdjustment?.application_eligible === false &&
    noAdjustment?.non_authoritative === true &&
    noAdjustment?.applied === false,
  advisory_ids_and_hashes_exact: manifest.scenarios?.every((scenario) => {
    const hasHash = /^[a-f0-9]{64}$/.test(scenario.advisory_identity_sha256) &&
      /^[a-f0-9]{64}$/.test(scenario.canonical_advisory_result_sha256);
    if (readyStatuses.has(scenario.actual_status)) {
      return hasHash &&
        typeof scenario.advisory_id === "string" &&
        /^confidence_calibration_advisory_v1:[a-f0-9]{24}$/.test(scenario.advisory_id) &&
        /^[a-f0-9]{64}$/.test(scenario.advisory_hash);
    }
    return hasHash && scenario.advisory_id === null && scenario.advisory_hash === null;
  }) === true,
  scenario_summary_hash_exact: action441.scenario_summary_sha256 === expected.action441ScenarioHash,
  package_hashes_exact: runnerReport.run_1_package_hash === expected.action444PackageHash &&
    runnerReport.run_2_package_hash === expected.action444PackageHash &&
    action444VerifierReport.package_hashes?.run_1_package_hash === expected.action444PackageHash &&
    action444VerifierReport.package_hashes?.run_2_package_hash === expected.action444PackageHash,
  exactly_two_runs: runner.includes("const first = buildShadowPackage();") &&
    runner.includes("const second = buildShadowPackage();") &&
    !runner.includes("const third =") &&
    runnerReport.repeat_run_identical === true,
  no_retry_or_repair: runner.includes("assertNoForbiddenArguments") &&
    !runner.includes("retry") &&
    !runner.includes("repair inputs"),
  metadata_only_boundary: runnerReport.metadata_only_result?.evidence_metadata_only === true &&
    Object.entries(runnerReport.metadata_only_result ?? {})
      .filter(([key]) => key !== "evidence_metadata_only")
      .every(([, value]) => value === false),
  temp_path_safety_bound: runner.includes("temp_target_symlink") &&
    runner.includes("temp_parent_symlink") &&
    runner.includes("temp_target_not_empty") &&
    runner.includes("temp_path_traversal") &&
    runner.includes("temp_path_inside_repository") &&
    runner.includes("temp_path_inside_home_config"),
  cleanup_passed: runnerReport.temp_path_and_cleanup_result?.temporary_evidence_deleted === true &&
    runnerReport.temp_path_and_cleanup_result?.temp_directory_absent_or_empty === true &&
    tempClean,
  no_tracked_evidence: trackedEvidence.length === 0,
  no_unapproved_consumers: adapterAuditConsumers.length === 0,
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
  readiness_vocabulary_exact: doc.includes("`ready`") &&
    doc.includes("`ready_with_conditions`") &&
    doc.includes("`blocked`"),
  runtime_preview_untouched: runnerReport.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  next_action_identified: doc.includes("action_446_static_confidence_calibration_advisory_shadow_release_gate"),
  documentation_contract_complete: [
    "protected-source audit",
    "manifest-integrity audit",
    "runner-integrity audit",
    "Action 441 inventory-binding audit",
    "scenario-count audit",
    "recommendation-envelope audit",
    "calibration-result audit",
    "fallback-bypass audit",
    "exactly-two-runs audit",
    "repeat-run-determinism audit",
    "metadata-boundary audit",
    "temp-path-safety audit",
    "tracked-evidence audit",
    "authoritative-data audit",
    "Readiness decision: `ready`",
  ].every((term) => doc.toLowerCase().includes(term.toLowerCase())),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  readiness_decision: failedConditions.length === 0 ? "ready" : "blocked",
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  checks,
  action444_reproduction: {
    final_shadow_decision: runnerReport.final_shadow_decision,
    scenario_count: runnerReport.scenario_count,
    repeat_run_identical: runnerReport.repeat_run_identical,
  },
  manifest_and_inventory_integrity: {
    action_441_package_inventory_sha256: runnerReport.action_441_package_inventory_sha256,
    action_441_scenario_summary_sha256: runnerReport.action_441_scenario_summary_sha256,
    action_444_manifest_sha256: runnerReport.manifest_hash,
  },
  scenario_inventory: {
    scenario_count: runnerReport.scenario_count,
    exact_scenario_order: runnerReport.exact_scenario_order,
  },
  status_distribution: runnerReport.status_distribution,
  hash_classification_distribution: runnerReport.hash_classification_distribution,
  warning_distribution: runnerReport.warning_distribution,
  issue_distribution: runnerReport.issue_distribution,
  complete_legacy_fallback_result: runnerReport.complete_legacy_fallback_result,
  confidence_binding_result: runnerReport.confidence_binding_result,
  lineage_leakage_feedback_result: runnerReport.lineage_leakage_feedback_result,
  no_adjustment_result: {
    id: noAdjustment?.id,
    proposed_delta_basis_points: noAdjustment?.proposed_delta_basis_points,
    proposed_calibrated_confidence_basis_points: noAdjustment?.proposed_calibrated_confidence_basis_points,
    application_eligible: noAdjustment?.application_eligible,
    applied: noAdjustment?.applied,
  },
  advisory_id_and_semantic_hash_result: runnerReport.advisory_id_and_semantic_hash_result,
  package_hashes: {
    manifest_hash: runnerReport.manifest_hash,
    run_1_package_hash: runnerReport.run_1_package_hash,
    run_2_package_hash: runnerReport.run_2_package_hash,
    repeat_run_identical: runnerReport.repeat_run_identical,
  },
  metadata_only_and_cleanup_result: {
    metadata_only_result: runnerReport.metadata_only_result,
    temp_path_and_cleanup_result: runnerReport.temp_path_and_cleanup_result,
    temp_directory_absent_or_empty_now: tempClean,
    tracked_evidence: trackedEvidence,
  },
  source_and_package_integrity: {
    before_hashes: beforeHashes,
    after_hashes: afterHashes,
    source_and_package_immutable: checks.source_and_package_immutable,
  },
  isolation_result: {
    advisory_consumers_outside_static_audits: adapterAuditConsumers,
    forbidden_runtime_paths: forbiddenRuntimePaths,
    safety: runnerReport.safety,
  },
  runtime_preview_status: runnerReport.runtime_preview_status,
  unrelated_work_classification: "action_445_independent_static_confidence_calibration_advisory_shadow_verification_only",
  recommended_next_action: "action_446_static_confidence_calibration_advisory_shadow_release_gate",
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exitCode = 1;
