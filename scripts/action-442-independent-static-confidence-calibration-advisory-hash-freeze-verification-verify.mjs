#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const paths = {
  doc: "docs/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification.md",
  verifier: "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
  test: "tests/e2e/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification.spec.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action441Freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  action441Verifier: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
  action440Verifier: "scripts/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate-verify.mjs",
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
  action426Verifier: "scripts/action-426-static-confidence-calibration-hash-freeze-verify.mjs",
  action429Manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  action429Runner: "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
};

const expected = {
  adapterHash: "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
  scenarioSummaryHash: "78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15",
  packageInventoryHash: "e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8",
  statusDistribution: {
    advisory_ready: 6,
    advisory_ready_with_warnings: 2,
    advisory_no_adjustment: 1,
    advisory_insufficient_evidence: 1,
    blocked_invalid_input: 6,
    blocked_confidence_mismatch: 3,
    blocked_invalid_lineage: 12,
    blocked_future_leakage: 6,
    blocked_calibration_result: 10,
    blocked_unsupported_status: 1,
  },
  hashDistribution: {
    complete: 39,
    legacy: 1,
    invalid_or_retained: 8,
  },
  warningDistribution: {
    none: 45,
    metric_value_unavailable: 3,
  },
};

const protectedPaths = [
  paths.adapter,
  paths.calibration,
  paths.patternDiscovery,
  paths.mapper,
  paths.learningFixtures,
  paths.contextFixtures,
  paths.insightFixtures,
  paths.action426Inventory,
  paths.action426Freezer,
  paths.action426Verifier,
  paths.action429Manifest,
  paths.action429Runner,
  paths.action441Inventory,
  paths.action441Freezer,
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

function sha256(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function fileHash(path) {
  return createHash("sha256").update(read(path), "utf8").digest("hex");
}

function fileHashes() {
  return Object.fromEntries(protectedPaths.map((path) => [path, exists(path) ? fileHash(path) : null]));
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

function runMaybeJson(path) {
  const output = execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 300000 });
  return JSON.parse(output);
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function countBy(values, keyFn) {
  return values.reduce((acc, value) => {
    const key = keyFn(value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function numberMapEqual(left, right) {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort(compareText);
  return keys.every((key) => left[key] === right[key]);
}

function scenarioById(inventory, id) {
  return inventory.scenarios.find((scenario) => scenario.id === id);
}

function inventoryPackageHash(inventory) {
  const clone = { ...inventory };
  delete clone.package_inventory_sha256;
  return sha256(clone);
}

function scenarioSummaryHash(inventory) {
  return sha256(inventory.scenarios.map((scenario) => ({
    id: scenario.id,
    order: scenario.order,
    actual_status: scenario.actual_status,
    advisory_hash: scenario.advisory_hash,
    canonical_advisory_result_sha256: scenario.canonical_advisory_result_sha256,
    warning_codes: scenario.warning_codes,
    issue_codes: scenario.issue_codes,
  })));
}

const beforeHashes = fileHashes();
const beforeInventoryText = exists(paths.action441Inventory) ? read(paths.action441Inventory) : "";
const freezerRun = runMaybeJson(paths.action441Freezer);
const afterInventoryText = read(paths.action441Inventory);
const afterInventory = JSON.parse(afterInventoryText);
const afterHashes = fileHashes();
const action441VerifierReport = runJson(paths.action441Verifier);
const action440VerifierReport = runJson(paths.action440Verifier);
const doc = exists(paths.doc) ? read(paths.doc) : "";

const expectedIds = Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`);
const advisoryConsumers = rgFiles("confidence-calibration-advisory-adapter|buildConfidenceCalibrationAdvisory", ["app", "lib", "scripts", "tests"])
  .filter((path) => ![
    paths.adapter,
    paths.action441Freezer,
    paths.action441Verifier,
    paths.action440Verifier,
    paths.projectionAdapter,
    paths.verifier,
    "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
    "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
    "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
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
    "tests/e2e/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate.spec.ts",
    "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts",
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
  ].includes(path));

const forbiddenArtifacts = [
  "docs/action-442-static-confidence-calibration-advisory-shadow-input-manifest.json",
  "scripts/action-442-static-confidence-calibration-advisory-shadow-run.mjs",
  "scripts/action-442-static-confidence-calibration-advisory-runner.mjs",
  "app/api/action-442",
  "app/api/confidence-calibration-advisory",
  "lib/confidence-calibration-advisory-runtime-consumer.ts",
  "lib/confidence-calibration-advisory-shadow-runner.ts",
].filter(exists);

const statusDistribution = countBy(afterInventory.scenarios, (scenario) => scenario.actual_status);
const warningDistribution = countBy(afterInventory.scenarios.flatMap((scenario) => scenario.warning_codes.length ? scenario.warning_codes : ["none"]), (code) => code);
const issueDistribution = countBy(afterInventory.scenarios.flatMap((scenario) => scenario.issue_codes.length ? scenario.issue_codes : ["none"]), (code) => code);
const hashDistribution = countBy(afterInventory.scenarios, (scenario) => scenario.hash_family);
const readyStatuses = new Set(["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"]);
const readyScenarios = afterInventory.scenarios.filter((scenario) => readyStatuses.has(scenario.actual_status));
const blockedScenarios = afterInventory.scenarios.filter((scenario) => !readyStatuses.has(scenario.actual_status));

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action441_inventory_exists: exists(paths.action441Inventory),
  action441_freezer_exists: exists(paths.action441Freezer),
  source_hashes_recorded_before_after: protectedPaths.every((path) => beforeHashes[path] && afterHashes[path]),
  protected_sources_unchanged_after_freezer_execution: protectedPaths.every((path) => beforeHashes[path] === afterHashes[path]),
  adapter_hash_exact: afterInventory.advisory_adapter_sha256 === expected.adapterHash && afterHashes[paths.adapter] === expected.adapterHash,
  inventory_schema_exact: afterInventory.inventory_schema_version === "action_441_static_confidence_calibration_advisory_hash_inventory_v1",
  inventory_reproduced_exactly: beforeInventoryText === afterInventoryText,
  freezer_reproduction_output_exact: freezerRun.freeze_status === "frozen" &&
    freezerRun.scenario_count === 48 &&
    freezerRun.scenario_summary_sha256 === expected.scenarioSummaryHash &&
    freezerRun.package_inventory_sha256 === expected.packageInventoryHash,
  action441_verifier_healthy: action441VerifierReport.verification_status === "passed",
  action440_verifier_healthy: action440VerifierReport.verification_status === "passed",
  scenario_count_exact: afterInventory.scenario_count === 48 && afterInventory.scenarios.length === 48,
  scenario_ids_exact: JSON.stringify(afterInventory.exact_scenario_ids) === JSON.stringify(expectedIds),
  scenario_order_exact: JSON.stringify(afterInventory.exact_scenario_order) === JSON.stringify(expectedIds) &&
    JSON.stringify(afterInventory.scenarios.map((scenario) => scenario.id)) === JSON.stringify(expectedIds),
  scenario_ids_unique: new Set(afterInventory.exact_scenario_ids).size === 48,
  source_classification_static: afterInventory.static_only === true &&
    afterInventory.non_production === true &&
    afterInventory.non_authoritative === true &&
    afterInventory.non_learning === true,
  safety_flags_locked: afterInventory.no_persistence === true &&
    afterInventory.no_replay === true &&
    afterInventory.no_runtime === true &&
    afterInventory.no_external_access === true &&
    afterInventory.no_feedback === true &&
    afterInventory.recommendation_mutated === false &&
    afterInventory.confidence_applied === false,
  advisory_configuration_frozen: afterInventory.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  recommendation_envelope_metadata_only: afterInventory.scenarios.every((scenario) => scenario.full_recommendation_retained === false && scenario.recommendation_mutated === false),
  calibration_result_metadata_only: afterInventory.scenarios.every((scenario) => scenario.full_calibration_retained === false),
  status_distribution_exact: numberMapEqual(afterInventory.advisory_status_distribution, expected.statusDistribution) &&
    numberMapEqual(statusDistribution, expected.statusDistribution),
  status_total_48: Object.values(statusDistribution).reduce((sum, count) => sum + count, 0) === 48,
  complete_legacy_hash_distribution_exact: numberMapEqual(afterInventory.complete_legacy_hash_distribution, expected.hashDistribution) &&
    numberMapEqual(hashDistribution, expected.hashDistribution),
  complete_legacy_hash_policy_exact: afterInventory.complete_legacy_hash_policy.valid_complete_hash_accepted === true &&
    afterInventory.complete_legacy_hash_policy.valid_legacy_hash_accepted === true &&
    afterInventory.complete_legacy_hash_policy.malformed_hash_blocked === true &&
    afterInventory.complete_legacy_hash_policy.swapped_hash_blocked === true &&
    afterInventory.complete_legacy_hash_policy.complete_hash_mismatch_blocked === true &&
    afterInventory.complete_legacy_hash_policy.legacy_bypass_blocked === true &&
    afterInventory.complete_legacy_hash_policy.retained_hash_tamper_blocked === true,
  fallback_bypass_rejected: scenarioById(afterInventory, "ca440_32")?.actual_status === "blocked_calibration_result",
  retained_hash_tampering_rejected: ["ca440_33", "ca440_34", "ca440_35", "ca440_36"].every((id) => scenarioById(afterInventory, id)?.actual_status === "blocked_calibration_result"),
  confidence_binding_exact: afterInventory.confidence_binding_policy.exact_match_ready === true &&
    afterInventory.confidence_binding_policy.mismatch_blocks === true &&
    afterInventory.confidence_binding_policy.invalid_confidence_blocks === true &&
    scenarioById(afterInventory, "ca440_19")?.original_confidence_basis_points === 0,
  no_rounding_or_repair: ["ca440_12", "ca440_13", "ca440_26"].every((id) => scenarioById(afterInventory, id)?.actual_status === "blocked_confidence_mismatch"),
  recommendation_lineage_fails_closed: ["ca440_20", "ca440_21", "ca440_22", "ca440_23", "ca440_24", "ca440_25"].every((id) => scenarioById(afterInventory, id)?.actual_status === "blocked_invalid_lineage"),
  calibration_lineage_fails_closed: scenarioById(afterInventory, "ca440_37")?.actual_status === "blocked_invalid_lineage",
  anti_leakage_fails_closed: ["ca440_38", "ca440_39", "ca440_40", "ca440_41", "ca440_42"].every((id) => scenarioById(afterInventory, id)?.actual_status === "blocked_future_leakage"),
  anti_feedback_fails_closed: ["ca440_43", "ca440_44", "ca440_45", "ca440_46"].every((id) => scenarioById(afterInventory, id)?.actual_status === "blocked_invalid_lineage"),
  warning_distribution_exact: numberMapEqual(afterInventory.warning_distribution, expected.warningDistribution) &&
    numberMapEqual(warningDistribution, expected.warningDistribution),
  issue_distribution_complete: afterInventory.issue_distribution &&
    numberMapEqual(afterInventory.issue_distribution, issueDistribution) &&
    issueDistribution.none === 9 &&
    issueDistribution.blocked_confidence_mismatch === 3 &&
    issueDistribution.blocked_future_leakage === 5 &&
    issueDistribution.blocked_feedback_reuse === 4,
  warning_issue_records_bounded: afterInventory.scenarios.every((scenario) =>
    Array.isArray(scenario.warning_codes) &&
    Array.isArray(scenario.issue_codes) &&
    scenario.issue_paths.every((path) => typeof path === "string" && (path === "" || path.startsWith("/")))),
  no_adjustment_exact: scenarioById(afterInventory, "ca440_03")?.actual_status === "advisory_no_adjustment" &&
    scenarioById(afterInventory, "ca440_03")?.proposed_delta_basis_points === 0 &&
    scenarioById(afterInventory, "ca440_03")?.proposed_calibrated_confidence_basis_points === scenarioById(afterInventory, "ca440_03")?.original_confidence_basis_points &&
    scenarioById(afterInventory, "ca440_03")?.application_eligible === false,
  semantic_order_equivalence_frozen: scenarioById(afterInventory, "ca440_47")?.actual_status === "advisory_ready_with_warnings" &&
    scenarioById(afterInventory, "ca440_48")?.actual_status === "advisory_ready",
  advisory_ids_and_hashes_exact: readyScenarios.every((scenario) => scenario.advisory_id_present === true && scenario.advisory_hash_present === true && /^[a-f0-9]{64}$/.test(scenario.advisory_hash)) &&
    blockedScenarios.every((scenario) => scenario.advisory_id_present === false && scenario.advisory_hash_present === false),
  identity_hashes_exact: afterInventory.scenarios.every((scenario) => /^[a-f0-9]{64}$/.test(scenario.advisory_identity_sha256)),
  result_hashes_exact: afterInventory.scenarios.every((scenario) => /^[a-f0-9]{64}$/.test(scenario.canonical_advisory_result_sha256)),
  scenario_summary_hash_exact: afterInventory.scenario_summary_sha256 === expected.scenarioSummaryHash &&
    scenarioSummaryHash(afterInventory) === expected.scenarioSummaryHash,
  package_inventory_hash_exact: afterInventory.package_inventory_sha256 === expected.packageInventoryHash &&
    inventoryPackageHash(afterInventory) === expected.packageInventoryHash,
  independent_canonicalization_exact: sha256(canonicalize(afterInventory.scenarios.map((scenario) => scenario.id))) === sha256(expectedIds),
  repeat_freeze_exact_two_runs: afterInventory.repeat_freeze_policy.exact_run_count === 2 &&
    afterInventory.repeat_freeze_policy.third_repair_run_allowed === false &&
    afterInventory.repeat_freeze_policy.identical_inventory_payload_required === true,
  bounded_metadata_only: afterInventory.output_boundary.metadata_only === true &&
    afterInventory.output_boundary.recommendation_objects_retained === false &&
    afterInventory.output_boundary.full_calibration_results_retained === false &&
    afterInventory.output_boundary.full_pattern_insights_retained === false &&
    afterInventory.output_boundary.pattern_discovery_objects_retained === false &&
    afterInventory.output_boundary.contexts_or_outcomes_retained === false &&
    afterInventory.output_boundary.provider_payloads_retained === false &&
    afterInventory.output_boundary.supabase_payloads_retained === false &&
    afterInventory.output_boundary.secrets_or_env_values_retained === false &&
    afterInventory.output_boundary.timestamps_retained === false &&
    afterInventory.output_boundary.machine_paths_retained === false,
  no_full_upstream_data_terms: !afterInventoryText.includes("process.env") &&
    !afterInventoryText.includes("SUPABASE") &&
    !afterInventoryText.includes("TWELVE") &&
    !afterInventoryText.includes("/Users/"),
  no_shadow_runner_or_manifest: forbiddenArtifacts.length === 0,
  no_unapproved_consumers: advisoryConsumers.length === 0,
  no_side_effects: afterInventory.provider_call_executed === false &&
    afterInventory.provider_call_attempted === false &&
    afterInventory.supabase_read_executed === false &&
    afterInventory.supabase_write_executed === false &&
    afterInventory.replay_executed === false &&
    afterInventory.synthetic_outcomes_persisted === false &&
    afterInventory.scanner_behavior_changed === false &&
    afterInventory.live_ranking_changed === false &&
    afterInventory.publication_changed === false,
  doc_contract_complete: [
    "protected-source audit",
    "inventory-integrity audit",
    "freezer-integrity audit",
    "scenario-count audit",
    "source-classification audit",
    "advisory-configuration audit",
    "recommendation-envelope audit",
    "calibration-result audit",
    "complete/legacy hash distribution audit",
    "confidence-binding audit",
    "anti-leakage audit",
    "anti-feedback audit",
    "bounded-metadata audit",
    "consumer inventory",
    "readiness decision",
    "Action 443",
  ].every((term) => doc.toLowerCase().includes(term.toLowerCase())),
};

const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const readinessDecision = failedConditions.length === 0 ? "ready" : "blocked";
const unresolvedConditions = readinessDecision === "ready" ? [] : ["action_441_hash_freeze_requires_operator_review"];

const report = {
  verification_status: readinessDecision === "ready" ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  passed_conditions_count: Object.keys(checks).length - failedConditions.length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: unresolvedConditions.length,
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  checks,
  before_hashes: beforeHashes,
  after_hashes: afterHashes,
  action441_reproduction: {
    freeze_status: freezerRun.freeze_status,
    scenario_count: freezerRun.scenario_count,
    scenario_summary_sha256: freezerRun.scenario_summary_sha256,
    package_inventory_sha256: freezerRun.package_inventory_sha256,
    inventory_text_unchanged: beforeInventoryText === afterInventoryText,
  },
  scenario_and_inventory_integrity: {
    scenario_count: afterInventory.scenario_count,
    exact_scenario_ids: afterInventory.exact_scenario_ids,
    scenario_summary_sha256: afterInventory.scenario_summary_sha256,
    package_inventory_sha256: afterInventory.package_inventory_sha256,
  },
  advisory_status_distribution: afterInventory.advisory_status_distribution,
  complete_legacy_hash_distribution: afterInventory.complete_legacy_hash_distribution,
  warning_distribution: afterInventory.warning_distribution,
  issue_distribution: afterInventory.issue_distribution,
  confidence_binding_result: afterInventory.confidence_binding_policy,
  lineage_leakage_feedback_result: afterInventory.lineage_leakage_feedback_policy,
  output_boundary: afterInventory.output_boundary,
  consumer_inventory: {
    advisory_consumers_outside_static_audits: advisoryConsumers,
    forbidden_artifacts: forbiddenArtifacts,
  },
  remaining_gap_inventory: {
    advisory_shadow_runner: "absent",
    execution_manifest: "absent",
    recommendation_engine_consumer: "absent",
    confidence_application: "absent",
    runtime: "absent",
    persistence: "absent",
    replay: "absent",
    feedback: "absent",
  },
  shadow_readiness_review: {
    future_shadow_gate_can_remain_narrow: readinessDecision === "ready",
    runtime_preview_status: afterInventory.runtime_preview_status,
  },
  safety: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_route_created: false,
    advisory_shadow_created: false,
    feedback_executed: false,
    recommendation_mutated: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    publication_changed: false,
    confidence_applied: false,
  },
  runtime_preview_status: afterInventory.runtime_preview_status,
  unrelated_work_classification: "action_442_independent_static_confidence_calibration_advisory_hash_freeze_verification_only",
  recommended_next_action: "action_443_static_confidence_calibration_advisory_shadow_execution_approval_gate",
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exit(1);
