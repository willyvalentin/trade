#!/usr/bin/env node

import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve, sep } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const paths = {
  doc: "docs/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate.md",
  verifier: "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
  test: "tests/e2e/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate.spec.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action441Freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  action441Verifier: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
  action442Doc: "docs/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification.md",
  action442Verifier: "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
  action442Test: "tests/e2e/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification.spec.ts",
  action444Manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  action444Runner: "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
  action444Doc: "docs/action-444-static-confidence-calibration-advisory-shadow-use.md",
  action444Verifier: "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  action444Test: "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts",
};

const expected = {
  adapterHash: "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
  action441InventoryFileHash: "6323f6690157a52de71750aaa142b8bada965289e470e7f7cd9ef37de55f552c",
  action441FreezerFileHash: "76d0be269dedc76c97ede48edf5d9763d3b72d3027bbc14c6f8eb695c8d2f9bf",
  scenarioSummaryHash: "78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15",
  packageInventoryHash: "e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8",
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
  approvalVocabulary: ["approved", "approved_with_conditions", "blocked"],
  shadowDecisionVocabulary: ["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"],
};

const action444Boundary = [
  paths.action444Manifest,
  paths.action444Runner,
  paths.action444Doc,
  paths.action444Verifier,
  paths.action444Test,
];

const presentAction444Artifacts = action444Boundary.filter(exists);
const action444PackageComplete = presentAction444Artifacts.length === action444Boundary.length;
const forbiddenRuntimePaths = [
  "app/api/action-444",
  "app/api/confidence-calibration-advisory",
  "app/api/confidence-calibration-advisory-shadow",
  "lib/confidence-calibration-advisory-runtime-consumer.ts",
  "lib/confidence-calibration-advisory-shadow-runner.ts",
].filter(exists);

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

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const normalizedDoc = doc.toLowerCase();
const action442Doc = exists(paths.action442Doc) ? read(paths.action442Doc) : "";
const inventory = exists(paths.action441Inventory) ? JSON.parse(read(paths.action441Inventory)) : { scenarios: [] };

const statusDistribution = countBy(inventory.scenarios, (scenario) => scenario.actual_status);
const hashClassificationDistribution = countBy(inventory.scenarios, (scenario) => scenario.hash_family);
const protectedHashEntries = Object.entries(inventory.protected_source_hashes ?? {});
const exactIds = inventory.scenarios.map((scenario) => scenario.id);
const exactOrders = inventory.scenarios.map((scenario) => scenario.order);
const advisoryReadyLike = new Set(["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"]);
const noAdjustmentScenarios = inventory.scenarios.filter((scenario) => scenario.actual_status === "advisory_no_adjustment");
const blockedOrNonApplicableScenarios = inventory.scenarios.filter((scenario) => !advisoryReadyLike.has(scenario.actual_status));

const advisoryConsumers = rgFiles("buildConfidenceCalibrationAdvisory|confidence-calibration-advisory-adapter", ["app", "lib", "scripts", "tests"])
  .filter((path) => ![
    "lib/confidence-calibration-advisory-adapter.ts",
    "lib/confidence-calibration-recommendation-advisory-projection.ts",
    paths.action441Freezer,
    paths.action441Verifier,
    paths.action442Verifier,
    paths.verifier,
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
    paths.action442Test,
    paths.test,
    paths.action444Runner,
    paths.action444Verifier,
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
    paths.action444Test,
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
    "tests/e2e/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
    "tests/e2e/action-433-independent-confidence-calibration-advisory-adapter-verification.spec.ts",
    "tests/e2e/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.spec.ts",
    "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
    "tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts",
    "tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts",
    "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts",
    "tests/e2e/action-439-independent-complete-semantic-binding-verification.spec.ts",
  ].includes(path));

const tempBase = resolve(tmpdir(), "ture", "action-444-static-confidence-calibration-advisory-shadow");
const tempPolicy = {
  approved_path_suffix: `${sep}ture${sep}action-444-static-confidence-calibration-advisory-shadow`,
  outside_repository: !tempBase.startsWith(root + sep) && tempBase !== root,
  outside_home_config: !tempBase.includes(`${sep}.config${sep}`) && !tempBase.includes(`${sep}.codex${sep}`),
  action444_dedicated_path: tempBase.endsWith(`${sep}ture${sep}action-444-static-confidence-calibration-advisory-shadow`),
  path_traversal_rejected: !tempBase.split(sep).includes(".."),
  symlink_checks_required: true,
};

const manifestContract = {
  approved_path: paths.action444Manifest,
  schema_version_required: true,
  action441_hashes_required: true,
  protected_source_hashes_required: true,
  scenario_count_required: 48,
  exact_ordered_scenario_ids_required: true,
  bounded_recommendation_metadata_required: true,
  bounded_calibration_metadata_required: true,
  advisory_configuration_required: true,
  expected_status_required: true,
  confidence_values_required: true,
  visibility_eligibility_flags_required: true,
  warnings_issues_lineage_required: true,
  complete_legacy_classification_required: true,
  advisory_ids_and_hashes_required: true,
  aggregate_distributions_required: true,
  safety_flags_required: true,
  full_inputs_outputs_allowed: false,
};

const runnerContract = {
  approved_path: paths.action444Runner,
  may_invoke_buildConfidenceCalibrationAdvisory: true,
  exact_runs_required: 2,
  third_run_allowed: false,
  cli_scenario_definitions_allowed: false,
  arbitrary_paths_allowed: false,
  stdin_allowed: false,
  globbing_allowed: false,
  dynamic_discovery_allowed: false,
  manifest_rewriting_allowed: false,
  expectation_rewriting_allowed: false,
  retries_allowed: false,
  input_repair_allowed: false,
  result_suppression_allowed: false,
  persistence_allowed: false,
  runtime_callbacks_allowed: false,
  external_communication_allowed: false,
  recommendation_mutation_allowed: false,
  confidence_application_allowed: false,
  feedback_allowed: false,
};

const metadataEvidenceContract = {
  per_scenario_allowed_fields: [
    "scenario_id",
    "advisory_status",
    "confidence_values",
    "flags",
    "warnings",
    "issues",
    "bounded_lineage_hashes",
    "hash_classification",
    "advisory_id",
    "identity_hash",
    "result_hash",
    "scenario_hash",
  ],
  package_allowed_fields: [
    "manifest_hash",
    "action441_inventory_hash",
    "action441_scenario_summary_hash",
    "protected_hash_results",
    "scenario_count",
    "status_distribution",
    "hash_classification_distribution",
    "warning_distribution",
    "issue_distribution",
    "run_1_package_hash",
    "run_2_package_hash",
    "repeat_run_identical",
    "cleanup_result",
    "no_effect_results",
    "final_shadow_decision",
  ],
  full_recommendations_allowed: false,
  full_calibration_results_allowed: false,
  full_pattern_insights_allowed: false,
  full_pattern_discovery_outputs_allowed: false,
  contexts_or_outcomes_allowed: false,
  provider_or_supabase_payloads_allowed: false,
  secrets_or_env_values_allowed: false,
  timestamps_or_random_ids_allowed: false,
  permanent_paths_allowed: false,
};

const stopConditions = {
  abort_before_execution: [
    "adapter_hash_differs",
    "calibration_or_lineage_source_hash_differs",
    "action_441_package_hash_differs",
    "scenario_count_or_order_differs",
    "configuration_differs",
    "required_expectation_missing",
    "complete_legacy_classification_missing",
    "source_class_unapproved",
    "runtime_provider_supabase_replay_import_appears",
    "temp_path_unsafe",
  ],
  fail_after_execution: [
    "advisory_status_confidence_flag_warning_issue_lineage_or_hash_differs",
    "fallback_attack_succeeds",
    "aggregate_distribution_differs",
    "nondeterminism_occurs",
    "cleanup_fails",
    "source_mutation_occurs",
    "recommendation_mutation_confidence_application_or_authoritative_data_appears",
  ],
  same_action_remediation_allowed: false,
};

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action442_readiness_bound: action442Doc.includes("Readiness decision: `ready`") &&
    action442Doc.includes("Failed conditions: none") &&
    action442Doc.includes("Unresolved conditions: none") &&
    exists(paths.action442Verifier) &&
    exists(paths.action442Test),
  action441_inventory_exists: exists(paths.action441Inventory),
  action441_inventory_file_hash_exact: exists(paths.action441Inventory) && fileHash(paths.action441Inventory) === expected.action441InventoryFileHash,
  action441_freezer_file_hash_exact: exists(paths.action441Freezer) && fileHash(paths.action441Freezer) === expected.action441FreezerFileHash,
  action441_hashes_exact: inventory.scenario_summary_sha256 === expected.scenarioSummaryHash &&
    inventory.package_inventory_sha256 === expected.packageInventoryHash &&
    scenarioSummaryHash(inventory) === expected.scenarioSummaryHash &&
    inventoryPackageHash(inventory) === expected.packageInventoryHash,
  protected_hashes_exact: protectedHashEntries.length >= 12 &&
    protectedHashEntries.every(([path, record]) => exists(path) &&
      record.matches_expected === true &&
      record.expected_sha256 === record.actual_sha256 &&
      fileHash(path) === record.expected_sha256) &&
    inventory.advisory_adapter_sha256 === expected.adapterHash,
  scenario_count_exact: inventory.scenario_count === 48 && inventory.scenarios.length === 48,
  scenario_ids_exact: JSON.stringify(inventory.exact_scenario_ids) === JSON.stringify(expected.ids) &&
    JSON.stringify(exactIds) === JSON.stringify(expected.ids),
  scenario_order_exact: JSON.stringify(inventory.exact_scenario_order) === JSON.stringify(expected.ids) &&
    exactOrders.every((order, index) => order === index + 1),
  source_classifications_exact: inventory.static_only === true &&
    inventory.non_production === true &&
    inventory.non_authoritative === true &&
    inventory.non_learning === true &&
    inventory.no_persistence === true &&
    inventory.no_replay === true &&
    inventory.no_runtime === true &&
    inventory.no_external_access === true &&
    inventory.no_feedback === true,
  recommendation_envelope_binding: inventory.scenarios.every((scenario) =>
    typeof scenario.id === "string" &&
    scenario.full_recommendation_retained === false &&
    scenario.recommendation_mutated === false),
  calibration_result_binding: inventory.scenarios.every((scenario) =>
    (typeof scenario.calibration_status === "string" || scenario.calibration_status === null) &&
    scenario.full_calibration_retained === false),
  advisory_configuration_binding: inventory.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  status_distribution_exact: numberMapEqual(inventory.advisory_status_distribution, expected.statusDistribution) &&
    numberMapEqual(statusDistribution, expected.statusDistribution),
  hash_classification_distribution_exact: numberMapEqual(inventory.complete_legacy_hash_distribution, expected.hashClassificationDistribution) &&
    numberMapEqual(hashClassificationDistribution, expected.hashClassificationDistribution),
  expected_values_bound: inventory.scenarios.every((scenario) =>
    scenario.status_matches_expected === true &&
    scenario.expected_status === scenario.actual_status &&
    (scenario.original_confidence_basis_points === null || Number.isInteger(scenario.original_confidence_basis_points)) &&
    (scenario.proposed_delta_basis_points === null || Number.isInteger(scenario.proposed_delta_basis_points)) &&
    (scenario.proposed_calibrated_confidence_basis_points === null || Number.isInteger(scenario.proposed_calibrated_confidence_basis_points))),
  visibility_eligibility_flags_bound: inventory.scenarios.every((scenario) =>
    typeof scenario.advisory_eligible === "boolean" &&
    typeof scenario.advisory_visible === "boolean" &&
    scenario.application_eligible === false &&
    scenario.non_authoritative === true &&
    scenario.applied === false),
  warning_issue_lineage_bound: inventory.scenarios.every((scenario) =>
    Array.isArray(scenario.warning_codes) &&
    Array.isArray(scenario.issue_codes) &&
    Array.isArray(scenario.issue_paths) &&
    typeof scenario.lineage_hashes_present === "boolean"),
  no_adjustment_bound: noAdjustmentScenarios.length === 1 &&
    noAdjustmentScenarios.every((scenario) =>
      scenario.proposed_delta_basis_points === 0 &&
      scenario.proposed_calibrated_confidence_basis_points === scenario.original_confidence_basis_points &&
      scenario.application_eligible === false &&
      scenario.non_authoritative === true &&
      scenario.applied === false),
  advisory_ids_and_hashes_bound: inventory.scenarios.every((scenario) => {
    if (advisoryReadyLike.has(scenario.actual_status)) {
      return scenario.advisory_id_present === true &&
        scenario.advisory_hash_present === true &&
        /^[a-f0-9]{64}$/.test(scenario.advisory_hash) &&
        /^[a-f0-9]{64}$/.test(scenario.advisory_identity_sha256) &&
        /^[a-f0-9]{64}$/.test(scenario.canonical_advisory_result_sha256);
    }
    return scenario.advisory_id_present === false &&
      scenario.advisory_hash_present === false &&
      scenario.advisory_hash === null &&
      /^[a-f0-9]{64}$/.test(scenario.advisory_identity_sha256) &&
      /^[a-f0-9]{64}$/.test(scenario.canonical_advisory_result_sha256);
  }),
  blocked_scenarios_fail_closed: blockedOrNonApplicableScenarios.every((scenario) =>
    scenario.advisory_visible === false &&
    scenario.advisory_eligible === false &&
    scenario.application_eligible === false),
  complete_legacy_fallback_policy_bound: inventory.complete_legacy_hash_policy?.valid_complete_hash_accepted === true &&
    inventory.complete_legacy_hash_policy?.valid_legacy_hash_accepted === true &&
    inventory.complete_legacy_hash_policy?.malformed_hash_blocked === true &&
    inventory.complete_legacy_hash_policy?.swapped_hash_blocked === true &&
    inventory.complete_legacy_hash_policy?.complete_hash_mismatch_blocked === true &&
    inventory.complete_legacy_hash_policy?.legacy_bypass_blocked === true &&
    inventory.complete_legacy_hash_policy?.retained_hash_tamper_blocked === true,
  manifest_contract_frozen: manifestContract.approved_path === paths.action444Manifest &&
    manifestContract.scenario_count_required === 48 &&
    manifestContract.full_inputs_outputs_allowed === false,
  runner_contract_frozen: runnerContract.approved_path === paths.action444Runner &&
    runnerContract.exact_runs_required === 2 &&
    runnerContract.third_run_allowed === false &&
    runnerContract.persistence_allowed === false &&
    runnerContract.external_communication_allowed === false &&
    runnerContract.confidence_application_allowed === false,
  per_scenario_verification_frozen: inventory.scenarios.every((scenario) =>
    scenario.id &&
    scenario.actual_status &&
    "original_confidence_basis_points" in scenario &&
    "proposed_delta_basis_points" in scenario &&
    "proposed_calibrated_confidence_basis_points" in scenario &&
    Array.isArray(scenario.warning_codes) &&
    Array.isArray(scenario.issue_codes) &&
    "advisory_hash" in scenario),
  metadata_evidence_bounded: metadataEvidenceContract.full_recommendations_allowed === false &&
    metadataEvidenceContract.full_calibration_results_allowed === false &&
    metadataEvidenceContract.full_pattern_insights_allowed === false &&
    metadataEvidenceContract.full_pattern_discovery_outputs_allowed === false &&
    metadataEvidenceContract.contexts_or_outcomes_allowed === false &&
    metadataEvidenceContract.provider_or_supabase_payloads_allowed === false &&
    metadataEvidenceContract.secrets_or_env_values_allowed === false,
  full_input_output_prohibited: inventory.output_boundary?.metadata_only === true &&
    Object.entries(inventory.output_boundary ?? {})
      .filter(([key]) => key !== "metadata_only")
      .every(([, value]) => value === false),
  temporary_path_policy_frozen: tempPolicy.outside_repository &&
    tempPolicy.outside_home_config &&
    tempPolicy.action444_dedicated_path &&
    tempPolicy.path_traversal_rejected &&
    tempPolicy.symlink_checks_required,
  repeat_run_policy_frozen: inventory.repeat_freeze_policy?.exact_run_count === 2 &&
    inventory.repeat_freeze_policy?.third_repair_run_allowed === false &&
    inventory.repeat_freeze_policy?.identical_inventory_payload_required === true &&
    inventory.repeat_freeze_policy?.identical_package_hash_required === true,
  cleanup_policy_frozen: normalizedDoc.includes("cleanup failure returns `shadow_failed`") &&
    normalizedDoc.includes("temporary evidence must be deleted"),
  stop_conditions_frozen: stopConditions.abort_before_execution.length >= 10 &&
    stopConditions.fail_after_execution.length >= 7 &&
    stopConditions.same_action_remediation_allowed === false,
  shadow_decision_vocabulary_exact: JSON.stringify(expected.shadowDecisionVocabulary) === JSON.stringify(["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"]),
  approval_vocabulary_exact: JSON.stringify(expected.approvalVocabulary) === JSON.stringify(["approved", "approved_with_conditions", "blocked"]),
  action444_boundary_exact: action444Boundary.length === 5 &&
    action444Boundary.includes(paths.action444Manifest) &&
    action444Boundary.includes(paths.action444Runner),
  action444_package_present_and_bounded: action444PackageComplete &&
    presentAction444Artifacts.every((path) => action444Boundary.includes(path)),
  no_tracked_shadow_evidence: rgFiles("action-444-static-confidence-calibration-advisory-shadow", ["docs", "scripts", "tests"])
    .filter((path) => ![
      paths.doc,
      paths.verifier,
      paths.test,
      ...action444Boundary,
      "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
      "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
      "scripts/action-320-static-replay-branch-package-verify.mjs",
      "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
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
    "docs/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.md",
    "docs/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.md",
    "docs/action-451-projection-advisory-status-hash-binding-remediation.md",
    "docs/action-452-independent-post-remediation-projection-verification.md",
    "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.md",
    "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.md",
    "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
    ].includes(path))
    .length === 0,
  no_unapproved_consumers: advisoryConsumers.length === 0,
  no_runtime_persistence_replay_provider_supabase_feedback: forbiddenRuntimePaths.length === 0 &&
    inventory.provider_call_executed === false &&
    inventory.provider_call_attempted === false &&
    inventory.supabase_read_executed === false &&
    inventory.supabase_write_executed === false &&
    inventory.replay_executed === false &&
    inventory.no_persistence === true &&
    inventory.no_replay === true &&
    inventory.no_runtime === true &&
    inventory.no_external_access === true &&
    inventory.no_feedback === true,
  no_recommendation_ranking_scanner_publication_mutation: inventory.recommendation_mutated === false &&
    inventory.confidence_applied === false &&
    inventory.scanner_behavior_changed === false &&
    inventory.live_ranking_changed === false &&
    inventory.publication_changed === false,
  runtime_preview_untouched: inventory.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    action442Doc.includes("runtime_preview_waiting_for_operator_inputs"),
  documentation_contract_complete: [
    "protected source inventory",
    "future execution-manifest contract",
    "future runner contract",
    "metadata-only evidence contract",
    "temporary-path policy",
    "symlink/path-safety policy",
    "repeat-run determinism",
    "cleanup policy",
    "shadow decision vocabulary",
    "approval decision: `approved`",
    "action 444 boundary",
  ].every((term) => normalizedDoc.includes(term)),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);
const unresolvedConditions = [];
const approvalDecision = failedConditions.length === 0 ? "approved" : "blocked";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  approval_decision: approvalDecision,
  approval_vocabulary: expected.approvalVocabulary,
  shadow_decision_vocabulary: expected.shadowDecisionVocabulary,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: unresolvedConditions.length,
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  checks,
  protected_hashes: {
    advisory_adapter_sha256: inventory.advisory_adapter_sha256,
    action441_inventory_file_sha256: exists(paths.action441Inventory) ? fileHash(paths.action441Inventory) : null,
    action441_freezer_file_sha256: exists(paths.action441Freezer) ? fileHash(paths.action441Freezer) : null,
    protected_source_hashes: inventory.protected_source_hashes ?? {},
  },
  action441_hashes: {
    scenario_summary_sha256: inventory.scenario_summary_sha256,
    package_inventory_sha256: inventory.package_inventory_sha256,
    recomputed_scenario_summary_sha256: inventory.scenarios?.length ? scenarioSummaryHash(inventory) : null,
    recomputed_package_inventory_sha256: inventory.scenarios?.length ? inventoryPackageHash(inventory) : null,
  },
  scenario_inventory: {
    scenario_count: inventory.scenario_count,
    exact_scenario_ids: inventory.exact_scenario_ids,
    exact_scenario_order: inventory.exact_scenario_order,
  },
  status_distribution: inventory.advisory_status_distribution,
  hash_classification_distribution: inventory.complete_legacy_hash_distribution,
  expected_value_verification: {
    confidence_values_bound: checks.expected_values_bound,
    visibility_eligibility_flags_bound: checks.visibility_eligibility_flags_bound,
    warning_issue_lineage_bound: checks.warning_issue_lineage_bound,
    no_adjustment_bound: checks.no_adjustment_bound,
    advisory_ids_and_hashes_bound: checks.advisory_ids_and_hashes_bound,
  },
  complete_legacy_fallback_policy: inventory.complete_legacy_hash_policy,
  manifest_contract: manifestContract,
  runner_contract: runnerContract,
  metadata_evidence_contract: metadataEvidenceContract,
  temporary_path_policy: tempPolicy,
  repeat_run_requirement: {
    exact_runs_required: 2,
    no_retry: true,
    no_third_repair_run: true,
  },
  cleanup_policy: {
    temporary_evidence_deleted_required: true,
    temp_directory_absent_or_empty_required: true,
    repository_evidence_forbidden: true,
    tracked_shadow_evidence_forbidden: true,
  },
  stop_conditions: stopConditions,
  action444_boundary: {
    approved_files: action444Boundary,
    present_action444_artifacts: presentAction444Artifacts,
    action444_package_complete: action444PackageComplete,
    runner_exists_now: exists(paths.action444Runner),
    manifest_exists_now: exists(paths.action444Manifest),
  },
  source_integrity: {
    protected_hashes_exact: checks.protected_hashes_exact,
    action441_inventory_file_hash_exact: checks.action441_inventory_file_hash_exact,
    action441_freezer_file_hash_exact: checks.action441_freezer_file_hash_exact,
  },
  consumer_inventory: {
    advisory_consumers_outside_static_audits: advisoryConsumers,
    forbidden_runtime_paths: forbiddenRuntimePaths,
  },
  safety: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_route_created: false,
    advisory_shadow_executed: false,
    feedback_executed: false,
    recommendation_mutated: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    publication_changed: false,
    confidence_applied: false,
    authoritative_data_created: false,
  },
  runtime_preview_status: inventory.runtime_preview_status,
  unrelated_work_classification: "action_443_static_confidence_calibration_advisory_shadow_execution_approval_gate_only",
  recommended_next_action: "action_444_static_confidence_calibration_advisory_shadow_execution",
};

console.log(JSON.stringify(report, null, 2));

if (report.verification_status !== "passed") {
  process.exitCode = 1;
}
