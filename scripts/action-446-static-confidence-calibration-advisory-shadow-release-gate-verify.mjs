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
  doc: "docs/action-446-static-confidence-calibration-advisory-shadow-release-gate.md",
  verifier: "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
  test: "tests/e2e/action-446-static-confidence-calibration-advisory-shadow-release-gate.spec.ts",
  action445Doc: "docs/action-445-independent-static-confidence-calibration-advisory-shadow-verification.md",
  action445Verifier: "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
  action445Test: "tests/e2e/action-445-independent-static-confidence-calibration-advisory-shadow-verification.spec.ts",
  action444Manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  action444Runner: "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
  action444Verifier: "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
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
  releaseClassification: "confidence_calibration_advisory_pure_static_verified",
  releaseDecision: "released",
  releaseDecisionVocabulary: ["released", "released_with_conditions", "blocked"],
  nextAction: "action_447_confidence_calibration_advisory_recommendation_engine_consumption_contract_approval_gate",
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
};

const releasedCapabilities = [
  "pure advisory transformation",
  "deterministic advisory status mapping",
  "bounded recommendation/calibration lineage validation",
  "confidence agreement validation",
  "complete/legacy result-hash validation",
  "fallback-bypass rejection",
  "anti-leakage validation",
  "anti-feedback validation",
  "bounded warning/issue propagation",
  "deterministic advisory identities",
  "static-only fixture/hash verification",
  "bounded local shadow verification",
];

const unreleasedCapabilities = [
  "Recommendation Engine consumption",
  "UI consumption",
  "confidence application",
  "confidence persistence",
  "ranking impact",
  "scanner impact",
  "publication impact",
  "execution impact",
  "runtime invocation",
  "API routes",
  "background jobs",
  "Supabase storage",
  "replay integration",
  "provider integration",
  "learning feedback",
  "production data use",
];

const futureSequence = [
  "Action 447 - Recommendation-Engine Advisory Consumption Contract Gate",
  "Action 448 - Pure Recommendation Advisory Projection Adapter",
  "Action 449 - Independent Projection Adapter Verification",
  "Action 450 - Projection Fixture/Hash Approval",
  "Action 451 - Projection Hash Freeze",
  "Action 452 - Independent Projection Hash Audit",
  "Action 453 - Projection Shadow Approval",
  "Action 454 - Projection Shadow Execution",
  "Action 455 - Independent Projection Shadow Verification",
];

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
  paths.action444Manifest,
  paths.action444Runner,
  paths.action444Verifier,
  paths.action445Doc,
  paths.action445Verifier,
  paths.action445Test,
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
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 120 * 1024 * 1024 });
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
const doc = exists(paths.doc) ? read(paths.doc) : "";
const manifest = exists(paths.action444Manifest) ? readJson(paths.action444Manifest) : {};
const action441 = exists(paths.action441Inventory) ? readJson(paths.action441Inventory) : {};
const action445Report = exists(paths.action445Verifier) ? runJson("node", [paths.action445Verifier]) : {};
const action444Report = exists(paths.action444Verifier) ? runJson("node", [paths.action444Verifier]) : {};
const runnerReport = exists(paths.action444Runner) ? runJson("node", [paths.action444Runner]) : {};
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
    "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts",
    paths.action445Verifier,
    paths.action445Test,
    paths.verifier,
    paths.test,
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

const advisoryConsumers = rgFiles("buildConfidenceCalibrationAdvisory|confidence-calibration-advisory-adapter", ["app", "lib", "scripts", "tests"])
  .filter((path) => ![
    paths.adapter,
    paths.projectionAdapter,
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
    "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
    "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
    "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs",
    "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs",
    "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
    "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs",
    "scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs",
    "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
    "scripts/action-439-independent-complete-semantic-binding-verification-verify.mjs",
    "scripts/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate-verify.mjs",
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
    "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
    "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
    paths.action444Runner,
    paths.action444Verifier,
    paths.action445Verifier,
    paths.verifier,
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
    "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts",
    paths.action445Test,
    paths.test,
    "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
    "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
    "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
    "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
    "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
    "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
    "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
  ].includes(path));

const forbiddenRuntimePaths = [
  "app/api/action-446",
  "app/api/confidence-calibration-advisory",
  "app/api/confidence-calibration-advisory-shadow",
  "app/confidence-calibration-advisory",
  "lib/confidence-calibration-advisory-runtime-consumer.ts",
  "lib/confidence-calibration-advisory-shadow-runner.ts",
  "lib/recommendation-advisory-projection-adapter.ts",
].filter(exists);

const completeLegacyFallbackResult = runnerReport.complete_legacy_fallback_result ?? {};
const confidenceBindingResult = runnerReport.confidence_binding_result ?? {};
const lineageLeakageFeedbackResult = runnerReport.lineage_leakage_feedback_result ?? {};
const safety = runnerReport.safety ?? {};
const noAdjustment = (manifest.scenarios ?? []).find((scenario) => scenario.id === "ca440_03");

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  release_classification_exact: doc.includes(expected.releaseClassification),
  release_decision_vocabulary_exact: JSON.stringify(expected.releaseDecisionVocabulary) === JSON.stringify(["released", "released_with_conditions", "blocked"]) &&
    expected.releaseDecisionVocabulary.every((item) => doc.includes(`\`${item}\``)),
  release_decision_exact: doc.includes("Release decision: `released`"),
  action445_ready: action445Report.verification_status === "passed" &&
    action445Report.readiness_decision === "ready" &&
    action445Report.passed_conditions_count === 40 &&
    action445Report.failed_conditions_count === 0 &&
    action445Report.unresolved_conditions_count === 0,
  action444_shadow_passed: action444Report.verification_status === "passed" &&
    action444Report.final_shadow_decision === "shadow_passed" &&
    runnerReport.final_shadow_decision === "shadow_passed",
  protected_hashes_exact: fileHash(paths.adapter) === expected.adapterHash &&
    beforeHashes[paths.adapter] === expected.adapterHash &&
    afterHashes[paths.adapter] === expected.adapterHash &&
    Object.values(manifest.protected_source_hashes ?? {}).every((item) => item.matches_expected === true),
  action441_binding_exact: action441.package_inventory_sha256 === expected.action441PackageHash &&
    action441.scenario_summary_sha256 === expected.action441ScenarioHash &&
    runnerReport.action_441_package_inventory_sha256 === expected.action441PackageHash &&
    runnerReport.action_441_scenario_summary_sha256 === expected.action441ScenarioHash,
  action444_hashes_exact: canonicalHash(manifest) === expected.action444ManifestHash &&
    runnerReport.manifest_hash === expected.action444ManifestHash &&
    runnerReport.run_1_package_hash === expected.action444PackageHash &&
    runnerReport.run_2_package_hash === expected.action444PackageHash,
  source_package_immutable: JSON.stringify(beforeHashes) === JSON.stringify(afterHashes),
  scenario_inventory_exact: manifest.scenario_count === 48 &&
    runnerReport.scenario_count === 48 &&
    JSON.stringify(manifest.exact_ordered_scenario_ids) === JSON.stringify(expected.ids) &&
    JSON.stringify(runnerReport.exact_scenario_order) === JSON.stringify(expected.ids),
  status_distribution_exact: numberMapEqual(manifest.status_distribution, expected.statusDistribution) &&
    numberMapEqual(runnerReport.status_distribution, expected.statusDistribution),
  hash_classification_distribution_exact: numberMapEqual(manifest.hash_classification_distribution, expected.hashClassificationDistribution) &&
    numberMapEqual(runnerReport.hash_classification_distribution, expected.hashClassificationDistribution),
  complete_legacy_fallback_passed: Object.values(completeLegacyFallbackResult).every(Boolean),
  confidence_binding_passed: Object.values(confidenceBindingResult).every(Boolean),
  lineage_leakage_feedback_passed: Object.values(lineageLeakageFeedbackResult).every(Boolean),
  no_adjustment_bound: noAdjustment?.actual_status === "advisory_no_adjustment" &&
    noAdjustment?.proposed_delta_basis_points === 0 &&
    noAdjustment?.application_eligible === false &&
    noAdjustment?.applied === false,
  semantic_identity_passed: runnerReport.advisory_id_and_semantic_hash_result?.all_ready_scenarios_have_ids === true &&
    runnerReport.advisory_id_and_semantic_hash_result?.all_scenarios_have_identity_and_result_hashes === true,
  repeat_run_passed: runnerReport.repeat_run_identical === true &&
    runnerReport.run_1_package_hash === runnerReport.run_2_package_hash,
  cleanup_passed: runnerReport.temp_path_and_cleanup_result?.temporary_evidence_deleted === true &&
    runnerReport.temp_path_and_cleanup_result?.temp_directory_absent_or_empty === true &&
    tempClean,
  no_tracked_execution_evidence: trackedEvidence.length === 0,
  released_capabilities_frozen: releasedCapabilities.every((item) => doc.toLowerCase().includes(item.toLowerCase())),
  unreleased_capabilities_frozen: unreleasedCapabilities.every((item) => doc.toLowerCase().includes(item.toLowerCase())),
  consumer_inventory_zero: advisoryConsumers.length === 0 &&
    doc.includes("Recommendation Engine consumers: 0") &&
    doc.includes("UI consumers: 0") &&
    doc.includes("Runtime consumers: 0"),
  confidence_semantics_frozen: doc.includes("`non_authoritative`: true") &&
    doc.includes("`applied`: false") &&
    doc.includes("`application_eligible`: false") &&
    (manifest.scenarios ?? []).every((scenario) => scenario.non_authoritative === true && scenario.applied === false && scenario.application_eligible === false),
  no_runtime_persistence_replay_provider_supabase_feedback: forbiddenRuntimePaths.length === 0 &&
    safety.provider_call_executed === false &&
    safety.provider_call_attempted === false &&
    safety.supabase_read_executed === false &&
    safety.supabase_write_executed === false &&
    safety.persistence_executed === false &&
    safety.replay_executed === false &&
    safety.runtime_route_created === false &&
    safety.external_access_executed === false &&
    safety.feedback_executed === false,
  no_recommendation_or_confidence_mutation: safety.recommendation_mutated === false &&
    safety.confidence_applied === false &&
    safety.scanner_behavior_changed === false &&
    safety.live_ranking_changed === false &&
    safety.publication_changed === false,
  no_authoritative_data: safety.authoritative_data_created === false,
  next_action_boundary_exact: doc.includes(expected.nextAction) &&
    doc.includes("must not create the consumer") &&
    doc.includes("contract-only") &&
    doc.includes("confidence-application-free"),
  future_sequence_exact: futureSequence.every((item) => doc.includes(item)),
  stop_conditions_frozen: [
    "protected hash differs",
    "Action 445 is not ready",
    "temporary evidence remains",
    "tracked execution evidence exists",
    "production consumer exists",
    "confidence application exists",
    "runtime route exists",
    "persistence/replay/provider/Supabase access exists",
    "recommendation mutation exists",
    "feedback path exists",
    "runtime preview changed",
  ].every((item) => doc.includes(item)),
  runtime_preview_untouched: runnerReport.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const releaseDecision = failedConditions.length === 0 ? expected.releaseDecision : "blocked";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  release_decision: releaseDecision,
  release_decision_vocabulary: expected.releaseDecisionVocabulary,
  release_classification: expected.releaseClassification,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  checks,
  action445_readiness: {
    verification_status: action445Report.verification_status,
    readiness_decision: action445Report.readiness_decision,
    passed_conditions_count: action445Report.passed_conditions_count,
    failed_conditions_count: action445Report.failed_conditions_count,
    unresolved_conditions_count: action445Report.unresolved_conditions_count,
  },
  action444_shadow_result: {
    final_shadow_decision: runnerReport.final_shadow_decision,
    scenario_count: runnerReport.scenario_count,
    repeat_run_identical: runnerReport.repeat_run_identical,
  },
  protected_hashes: {
    advisory_adapter_sha256: expected.adapterHash,
    action_441_scenario_summary_sha256: expected.action441ScenarioHash,
    action_441_package_inventory_sha256: expected.action441PackageHash,
    action_444_manifest_sha256: expected.action444ManifestHash,
    action_444_package_sha256: expected.action444PackageHash,
    upstream_protected_source_hashes: manifest.protected_source_hashes ?? {},
  },
  manifest_and_inventory_integrity: {
    action_441_package_inventory_sha256: runnerReport.action_441_package_inventory_sha256,
    action_441_scenario_summary_sha256: runnerReport.action_441_scenario_summary_sha256,
    action_444_manifest_sha256: runnerReport.manifest_hash,
    action_444_package_sha256: runnerReport.run_1_package_hash,
  },
  scenario_inventory: {
    scenario_count: runnerReport.scenario_count,
    exact_scenario_order: runnerReport.exact_scenario_order,
  },
  status_distribution: runnerReport.status_distribution,
  hash_classification_distribution: runnerReport.hash_classification_distribution,
  complete_legacy_fallback_result: completeLegacyFallbackResult,
  confidence_binding_result: confidenceBindingResult,
  lineage_leakage_feedback_result: lineageLeakageFeedbackResult,
  warning_distribution: runnerReport.warning_distribution,
  issue_distribution: runnerReport.issue_distribution,
  no_adjustment_result: {
    id: noAdjustment?.id,
    proposed_delta_basis_points: noAdjustment?.proposed_delta_basis_points,
    proposed_calibrated_confidence_basis_points: noAdjustment?.proposed_calibrated_confidence_basis_points,
    application_eligible: noAdjustment?.application_eligible,
    applied: noAdjustment?.applied,
  },
  semantic_identity_result: runnerReport.advisory_id_and_semantic_hash_result,
  repeat_run_result: {
    repeat_run_identical: runnerReport.repeat_run_identical,
    run_1_package_hash: runnerReport.run_1_package_hash,
    run_2_package_hash: runnerReport.run_2_package_hash,
  },
  released_capabilities: releasedCapabilities,
  unreleased_capabilities: unreleasedCapabilities,
  consumer_inventory: {
    production_consumers: 0,
    recommendation_engine_consumers: 0,
    ui_consumers: 0,
    runtime_consumers: 0,
    advisory_consumers_outside_static_audits: advisoryConsumers,
  },
  confidence_semantics: {
    non_authoritative: true,
    applied: false,
    application_eligible: false,
    confidence_active: false,
  },
  cleanup_and_source_integrity: {
    temporary_evidence_deleted: runnerReport.temp_path_and_cleanup_result?.temporary_evidence_deleted,
    temp_directory_absent_or_empty: tempClean,
    tracked_evidence: trackedEvidence,
    source_and_package_immutable: checks.source_package_immutable,
    before_hashes: beforeHashes,
    after_hashes: afterHashes,
  },
  isolation_result: {
    forbidden_runtime_paths: forbiddenRuntimePaths,
    safety,
  },
  future_action_447_boundary: {
    next_permitted_action: expected.nextAction,
    contract_only: true,
    implementation_free: true,
    consumer_free: true,
    runtime_free: true,
    confidence_application_free: true,
    creates_consumer: false,
  },
  future_integration_sequence: futureSequence,
  runtime_preview_status: runnerReport.runtime_preview_status,
  unrelated_work_classification: "action_446_static_confidence_calibration_advisory_shadow_release_gate_only",
  recommended_next_action: expected.nextAction,
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exitCode = 1;
