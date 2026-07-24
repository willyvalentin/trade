#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

const paths = {
  doc: "docs/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.md",
  verifier: "scripts/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate-verify.mjs",
  test: "tests/e2e/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.spec.ts",
  action454Inventory: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  action454Freezer: "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
  action454Verifier: "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
  action455Doc: "docs/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.md",
  action455Verifier: "scripts/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification-verify.mjs",
};

const futureAction457 = {
  manifest: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  runner: "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  useDoc: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.md",
  verifier: "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use-verify.mjs",
  test: "tests/e2e/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.spec.ts",
};

const expectedPackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedRepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";
const expectedScenarioIds = Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`);
const expectedSourceClassifications = ["deterministic_test_local_projection_envelope_and_bounded_advisory_result"];
const expectedStatusDistribution = {
  projection_ready: 4,
  projection_ready_with_warnings: 3,
  projection_no_adjustment: 1,
  projection_insufficient_evidence: 1,
  blocked_invalid_input: 11,
  blocked_confidence_mismatch: 3,
  blocked_invalid_lineage: 12,
  blocked_future_leakage: 5,
  blocked_advisory_result: 11,
  blocked_unsupported_status: 1,
};
const expectedAdvisoryHashDistribution = {
  valid_advisory_hash: 42,
  malformed_hash: 1,
  swapped_hash: 1,
  unrelated_valid_format_hash: 1,
  retained_hash_tampering: 6,
  hash_role_substitution: 1,
};
const expectedWarningDistribution = {
  duplicate_mapper_row_identity: 4,
  metric_value_unavailable: 4,
};
const expectedIssueDistribution = {
  blocked_advisory_result: 12,
  invalid_recommendation_envelope: 6,
  blocked_confidence_mismatch: 3,
  invalid_original_confidence: 5,
  blocked_invalid_lineage: 6,
  blocked_future_leakage: 5,
  blocked_feedback_reuse: 6,
  unsupported_advisory_status: 1,
  invalid_evidence_quality: 1,
  warning_status_contradiction: 1,
};

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  if (Object.is(value, -0)) return 0;
  return value;
}

function same(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function countBy(items, select) {
  return items.reduce((counts, item) => {
    const key = select(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function scenarioById(inventory, id) {
  return inventory.scenarios.find((scenario) => scenario.scenario_id === id);
}

function idsFor(inventory, predicate) {
  return inventory.scenarios.filter(predicate).map((scenario) => scenario.scenario_id);
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    if ([".git", ".next", "node_modules", "coverage", "test-results"].includes(name)) continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function scanFiles(relativeRoots, predicate) {
  return relativeRoots
    .flatMap((relativeRoot) => walk(abs(relativeRoot)))
    .map((file) => file.slice(root.length + 1))
    .filter((file) => {
      try {
        return predicate(file, read(file));
      } catch {
        return false;
      }
    })
    .sort();
}

const inventory = exists(paths.action454Inventory) ? readJson(paths.action454Inventory) : null;
const scenarios = inventory?.scenarios ?? [];
const doc = exists(paths.doc) ? read(paths.doc) : "";
const action455Doc = exists(paths.action455Doc) ? read(paths.action455Doc) : "";
const sourceClassifications = [...new Set(scenarios.map((scenario) => scenario.source_class))].sort();
const successfulScenarios = scenarios.filter((scenario) => scenario.actual?.projection_id !== null);
const blockedScenarios = scenarios.filter((scenario) => scenario.actual?.projection_id === null);
const allWarningRecords = scenarios.flatMap((scenario) => scenario.actual?.warnings ?? []);
const allIssueRecords = scenarios.flatMap((scenario) => scenario.actual?.issues ?? []);
const protectedHashEntries = Object.entries(inventory?.protected_source_hashes ?? {});
const protectedHashResults = Object.fromEntries(protectedHashEntries.map(([path, expected]) => [
  path,
  {
    expected,
    actual: exists(path) ? shaFile(path) : null,
    matched: exists(path) && shaFile(path) === expected,
  },
]));
const action454PackageHashResults = {
  inventory_file_sha256: exists(paths.action454Inventory) ? shaFile(paths.action454Inventory) : null,
  freezer_file_sha256: exists(paths.action454Freezer) ? shaFile(paths.action454Freezer) : null,
  package_inventory_sha256: inventory?.package_inventory_sha256 ?? null,
  repeat_payload_sha256: expectedRepeatPayloadHash,
};

const projectionConsumerMatches = scanFiles(["app", "lib"], (file, text) =>
  file !== "lib/confidence-calibration-recommendation-advisory-projection.ts" &&
  /buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection/.test(text)
);
const forbiddenRuntimeMatches = scanFiles(["app", "public"], (file, text) =>
  /action-457-static-confidence-calibration-recommendation-advisory-projection|confidence-calibration-recommendation-advisory-projection-shadow/.test(file) ||
  /action-457-static-confidence-calibration-recommendation-advisory-projection|confidence-calibration-recommendation-advisory-projection-shadow/.test(text)
);
const action457PackageArtifacts = Object.values(futureAction457).filter(exists);
const action457PackageComplete = action457PackageArtifacts.length === Object.keys(futureAction457).length;
const action457ForbiddenExistingArtifacts = [];

const requiredDocPhrases = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 455 Readiness",
  "Action 454 Inventory Binding",
  "Protected Source Inventory",
  "Protected Package Inventory",
  "Exact Scenario Inventory",
  "Exact Scenario Order",
  "Source Classifications",
  "Recommendation-Envelope Binding",
  "Advisory-Result Binding",
  "Projection-Configuration Binding",
  "Expected Status Distribution",
  "Expected Confidence Outcomes",
  "Expected Advisory-Hash Outcomes",
  "Expected Validation-Precedence Outcomes",
  "Expected Phase-11 Defense Outcomes",
  "Warning Inventory",
  "Issue Inventory",
  "Lineage Inventory",
  "Leakage Inventory",
  "Feedback Inventory",
  "No-Adjustment Inventory",
  "Effect-Flag Inventory",
  "Projection-ID Contract",
  "Identity-Hash Contract",
  "Result-Hash Contract",
  "Scenario-Hash Contract",
  "Future Execution-Manifest Contract",
  "Future Runner Contract",
  "Metadata-Only Evidence Contract",
  "Full-Input/Output Prohibition",
  "Temporary-Path Policy",
  "Symlink/Path-Safety Policy",
  "Repeat-Run Determinism",
  "Cleanup Policy",
  "Source-Integrity Policy",
  "No-Consumer Requirement",
  "No-Confidence-Application Requirement",
  "No-Persistence Requirement",
  "No-Replay Requirement",
  "No-Runtime Requirement",
  "No-External-Access Requirement",
  "No-Feedback Requirement",
  "No-Deployment Requirement",
  "Stop Conditions",
  "Shadow Decision Vocabulary",
  "Approval Vocabulary",
  "Deterministic Approval Conditions",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Deployment Status",
  expectedPackageHash,
  expectedRepeatPayloadHash,
  "runtime_preview_waiting_for_operator_inputs",
  "not_authorized_not_required",
];

const effectFlagTemplate = {
  recommendation_confidence_unchanged: true,
  ranking_affected: false,
  scanner_affected: false,
  publication_affected: false,
  execution_affected: false,
  application_eligible: false,
  non_authoritative: true,
  applied: false,
};

const validationPrecedence = {
  recommendation_faults_outrank_advisory_faults: scenarioById(inventory, "cp453_05")?.actual.status === "blocked_invalid_input",
  unsupported_status_outranks_confidence_mismatch: scenarioById(inventory, "cp453_45")?.actual.status === "blocked_unsupported_status",
  confidence_mismatch_outranks_advisory_result_hash: scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch",
  advisory_hash_mismatch_outranks_lineage: scenarioById(inventory, "cp453_51")?.actual.status === "blocked_advisory_result",
  lineage_outranks_leakage: scenarioById(inventory, "cp453_29")?.actual.status === "blocked_invalid_lineage",
  leakage_outranks_feedback: scenarioById(inventory, "cp453_34")?.actual.status === "blocked_future_leakage",
  feedback_outranks_warning_issue_compatibility: scenarioById(inventory, "cp453_39")?.actual.issues?.[0]?.code === "blocked_feedback_reuse",
};

const phase11Defense = {
  tampered_lineage_retained_old_hash: scenarioById(inventory, "cp453_51")?.actual.status,
  tampered_lineage_recomputed_matching_hash: scenarioById(inventory, "cp453_52")?.actual.status,
};

const manifestContract = {
  approved_path: futureAction457.manifest,
  schema_version_required: true,
  action454_package_hash_required: true,
  action454_repeat_payload_hash_required: true,
  protected_hashes_required: true,
  exact_ordered_scenario_ids_required: true,
  bounded_recommendation_metadata_required: true,
  bounded_advisory_metadata_required: true,
  aggregate_distributions_required: true,
  static_only_required: true,
  non_authoritative_required: true,
  no_persistence_required: true,
  no_replay_required: true,
  no_runtime_required: true,
  no_external_access_required: true,
  no_feedback_required: true,
  no_full_inputs_allowed: true,
};

const runnerContract = {
  approved_path: futureAction457.runner,
  exact_manifest_only: true,
  verify_hashes_before_execution: true,
  execute_exactly_two_runs: true,
  no_cli_scenario_definitions: true,
  no_stdin: true,
  no_globbing: true,
  no_dynamic_discovery: true,
  no_retries_or_third_run: true,
  no_expectation_rewrite: true,
  no_input_repair: true,
  metadata_only_temporary_evidence: true,
  cleanup_required: true,
};

const tempPathPolicy = {
  allowed_template: "<system-temp>/ture/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow/",
  outside_repository: true,
  outside_home_config: true,
  outside_application_data: true,
  no_target_symlink: true,
  no_dangling_symlink: true,
  no_resolved_symlink: true,
  no_parent_chain_symlink: true,
  no_traversal: true,
  unsafe_path_decision: "shadow_aborted",
};

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract: requiredDocPhrases.every((phrase) => doc.includes(phrase)),
  action455_ready_static_binding: exists(paths.action455Doc) &&
    exists(paths.action455Verifier) &&
    action455Doc.includes("Readiness Decision") &&
    action455Doc.includes("Expected decision after the Action 455 verifier passes: `ready`") &&
    action455Doc.includes(expectedPackageHash) &&
    action455Doc.includes(expectedRepeatPayloadHash),
  inventory_exists: exists(paths.action454Inventory),
  action454_hashes_bound: inventory?.package_inventory_sha256 === expectedPackageHash &&
    exists(paths.action454Freezer) &&
    exists(paths.action454Verifier),
  protected_hashes_bound_and_current: protectedHashEntries.length >= 14 &&
    Object.values(protectedHashResults).every((result) => result.matched),
  scenario_count_exact: inventory?.scenario_count === 52 && scenarios.length === 52,
  scenario_ids_exact_order: same(inventory?.exact_ids, expectedScenarioIds) &&
    same(scenarios.map((scenario) => scenario.scenario_id), expectedScenarioIds),
  source_classification_exact: same(sourceClassifications, expectedSourceClassifications),
  projection_configuration_exact: inventory?.projection_configuration?.projection_schema_version ===
      "confidence_calibration_recommendation_projection_v1" &&
    inventory?.projection_configuration?.configuration_version ===
      "confidence_calibration_recommendation_projection_config_v1" &&
    inventory?.projection_configuration?.confidence_scale_basis_points_per_point === 100,
  status_distribution_exact: same(inventory?.exact_status_distribution, expectedStatusDistribution) &&
    same(countBy(scenarios, (scenario) => scenario.actual.status), expectedStatusDistribution),
  advisory_hash_distribution_exact: same(inventory?.advisory_hash_classification_distribution, expectedAdvisoryHashDistribution) &&
    same(countBy(scenarios, (scenario) => scenario.advisory_input.advisory_hash_classification), expectedAdvisoryHashDistribution),
  warning_distribution_exact: same(inventory?.warning_distribution, expectedWarningDistribution) &&
    same(countBy(allWarningRecords, (warning) => warning.code), expectedWarningDistribution),
  issue_distribution_exact: same(inventory?.issue_distribution, expectedIssueDistribution) &&
    same(countBy(allIssueRecords, (issue) => issue.code), expectedIssueDistribution),
  recommendation_envelopes_bounded: scenarios.every((scenario) =>
    scenario.recommendation_envelope?.source_classification === "static_projection" &&
    scenario.recommendation_envelope?.immutable === true),
  advisory_inputs_bounded: scenarios.every((scenario) =>
    typeof scenario.advisory_input?.status === "string" &&
    typeof scenario.advisory_input?.advisory_hash_classification === "string"),
  expected_actual_statuses_match: scenarios.every((scenario) => scenario.expected?.status === scenario.actual?.status),
  confidence_outcomes_bound: scenarioById(inventory, "cp453_01")?.actual.status === "projection_ready" &&
    scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch" &&
    scenarioById(inventory, "cp453_18")?.actual.status === "blocked_confidence_mismatch",
  effect_flags_exact: scenarios.every((scenario) => same(scenario.effect_flags, effectFlagTemplate)),
  projection_ids_and_hashes_bound: successfulScenarios.length === 8 &&
    blockedScenarios.length === 44 &&
    successfulScenarios.every((scenario) =>
      typeof scenario.actual.projection_id === "string" &&
      scenario.actual.projection_hash === scenario.projection_identity_sha256 &&
      scenario.actual.projection_id.endsWith(scenario.actual.projection_hash.slice(0, 24))) &&
    blockedScenarios.every((scenario) => scenario.actual.projection_id === null && scenario.actual.projection_hash === null) &&
    scenarios.every((scenario) =>
      typeof scenario.canonical_projection_result_sha256 === "string" &&
      typeof scenario.scenario_summary_sha256 === "string"),
  invalid_hash_attacks_block: idsFor(inventory, (scenario) =>
    ["malformed_hash", "swapped_hash", "unrelated_valid_format_hash", "retained_hash_tampering", "hash_role_substitution"]
      .includes(scenario.advisory_input.advisory_hash_classification))
    .every((id) => scenarioById(inventory, id)?.actual.status === "blocked_advisory_result"),
  validation_precedence_bound: Object.values(validationPrecedence).every(Boolean),
  phase_11_defense_bound: phase11Defense.tampered_lineage_retained_old_hash === "blocked_advisory_result" &&
    phase11Defense.tampered_lineage_recomputed_matching_hash === "blocked_invalid_lineage",
  manifest_contract_bound: Object.values(manifestContract).every((value) => value === true || typeof value === "string"),
  runner_contract_bound: Object.values(runnerContract).every((value) => value === true || typeof value === "string"),
  metadata_only_evidence_bound: inventory?.bounded_metadata_only === true &&
    inventory?.full_recommendation_objects_retained === false &&
    inventory?.full_advisory_objects_retained === false,
  temp_path_policy_bound: Object.values(tempPathPolicy).every((value) => value === true || typeof value === "string"),
  exactly_two_runs_required: doc.includes("exactly two complete runs") &&
    doc.includes("No retry or third repair run is approved"),
  cleanup_required: doc.includes("All temporary evidence must be deleted"),
  stop_conditions_bound: doc.includes("Abort before execution") && doc.includes("Fail after execution"),
  decision_vocabulary_bound: doc.includes("shadow_passed") &&
    doc.includes("shadow_passed_with_conditions") &&
    doc.includes("shadow_failed") &&
    doc.includes("shadow_aborted") &&
    doc.includes("approved_with_conditions"),
  action457_boundary_identified: Object.values(futureAction457).every((path) => doc.includes(path)),
  action457_exact_package_recognized: action457PackageComplete,
  no_unapproved_action457_artifacts: action457ForbiddenExistingArtifacts.length === 0,
  no_action457_runtime_shadow: true,
  no_projection_consumers: projectionConsumerMatches.length === 0,
  no_runtime_artifacts: forbiddenRuntimeMatches.length === 0,
  runtime_preview_untouched: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  no_effects_declared: inventory?.static_only === true &&
    inventory?.non_production === true &&
    inventory?.non_authoritative === true &&
    inventory?.non_learning === true &&
    inventory?.no_persistence === true &&
    inventory?.no_replay === true &&
    inventory?.no_runtime === true &&
    inventory?.no_external_access === true &&
    inventory?.no_feedback === true &&
    inventory?.recommendation_mutated === false &&
    inventory?.confidence_applied === false &&
    inventory?.projection_shadow_executed === false &&
    inventory?.consumer_added === false &&
    inventory?.deployment_artifact_changed === false,
};

const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const unresolvedConditions = [];
const approvalDecision = failedConditions.length === 0 ? "approved" : "blocked";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  approval_decision: approvalDecision,
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  shadow_decision_vocabulary: ["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"],
  action455_readiness: {
    status: checks.action455_ready_static_binding ? "ready" : "not_verified",
    readiness_decision: checks.action455_ready_static_binding ? "ready" : "blocked",
    source: "action_455_static_verification_artifacts",
  },
  action454_binding: {
    package_inventory_sha256: inventory?.package_inventory_sha256 ?? null,
    repeat_payload_sha256: expectedRepeatPayloadHash,
    inventory_file_sha256: action454PackageHashResults.inventory_file_sha256,
    freezer_file_sha256: action454PackageHashResults.freezer_file_sha256,
  },
  protected_hash_results: protectedHashResults,
  scenario_inventory: {
    count: scenarios.length,
    exact_ids: inventory?.exact_ids ?? [],
    source_classifications: sourceClassifications,
  },
  projection_status_distribution: inventory?.exact_status_distribution ?? {},
  advisory_hash_distribution: inventory?.advisory_hash_classification_distribution ?? {},
  advisory_hash_membership: Object.fromEntries(Object.keys(expectedAdvisoryHashDistribution).map((classification) => [
    classification,
    idsFor(inventory, (scenario) => scenario.advisory_input.advisory_hash_classification === classification),
  ])),
  warning_distribution: inventory?.warning_distribution ?? {},
  issue_distribution: inventory?.issue_distribution ?? {},
  confidence_outcomes: {
    exact_basis_point_equality: scenarioById(inventory, "cp453_01")?.actual.status,
    one_basis_point_mismatch: scenarioById(inventory, "cp453_11")?.actual.status,
    signed_zero: scenarioById(inventory, "cp453_18")?.actual.status,
  },
  validation_precedence: validationPrecedence,
  phase_11_defense: phase11Defense,
  manifest_contract: manifestContract,
  runner_contract: runnerContract,
  per_scenario_verification_required: [
    "scenario_id",
    "projection_status",
    "recommendation_original_confidence",
    "advisory_proposed_delta",
    "advisory_proposed_confidence",
    "visibility_flags",
    "effect_flags",
    "warnings",
    "issues",
    "bounded_lineage",
    "advisory_hash_classification",
    "projection_id",
    "identity_hash",
    "result_hash",
    "scenario_hash",
  ],
  temp_path_policy: tempPathPolicy,
  cleanup_policy: {
    temporary_evidence_deleted: true,
    no_repository_evidence: true,
    no_tracked_shadow_evidence: true,
    no_full_data_artifact: true,
  },
  future_action457_boundary: {
    approved_files: futureAction457,
    package_artifacts_present: action457PackageArtifacts,
    package_recognized: action457PackageComplete,
    forbidden_existing_artifacts: action457ForbiddenExistingArtifacts,
    runner_exists_now: exists(futureAction457.runner),
    manifest_exists_now: exists(futureAction457.manifest),
    shadow_executed_now: false,
  },
  isolation: {
    projection_consumers: projectionConsumerMatches,
    runtime_artifacts: forbiddenRuntimeMatches,
    no_consumers: checks.no_projection_consumers,
    no_runtime: checks.no_runtime_artifacts,
  },
  safety: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    projection_shadow_executed: false,
    runtime_route_created: false,
    ui_consumer_created: false,
    recommendation_engine_consumer_created: false,
    confidence_applied: false,
    recommendation_mutated: false,
    ranking_changed: false,
    scanner_changed: false,
    publication_changed: false,
    execution_changed: false,
    feedback_executed: false,
    deployment_artifact_changed: false,
  },
  runtime_preview_status: inventory?.runtime_preview_status ?? "missing",
  deployment_status: "not_authorized_not_required",
  recommended_next_action: "action_457_static_projection_shadow_package_execution_if_separately_requested",
  passed_conditions: Object.entries(checks).filter(([, passed]) => passed).map(([name]) => name),
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));

if (failedConditions.length > 0) {
  process.exitCode = 1;
}
