#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

import { buildRepeatFreezeReport } from "./action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const sha = (value) => createHash("sha256").update(value).digest("hex");

const paths = {
  doc: "docs/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.md",
  verifier: "scripts/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification-verify.mjs",
  test: "tests/e2e/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.spec.ts",
  action453Doc: "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.md",
  action453Verifier: "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
  action453Test: "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
  action454Doc: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.md",
  action454Inventory: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  action454Freezer: "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
  action454Verifier: "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
  action454Test: "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
  projection: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  advisory: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learningFixtures: "lib/learning-dataset-static-fixtures.ts",
  contextFixtures: "lib/intelligence-context-static-fixtures.ts",
  insightFixtures: "lib/pattern-insight-static-fixtures.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action441Freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  action444Manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  action444Runner: "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
};

const expectedScenarioIds = Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`);
const expectedPackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedRepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";

const expectedStatusDistribution = {
  projection_ready: 4,
  projection_ready_with_warnings: 3,
  projection_no_adjustment: 1,
  projection_insufficient_evidence: 1,
  blocked_invalid_input: 11,
  blocked_confidence_mismatch: 3,
  blocked_advisory_result: 11,
  blocked_invalid_lineage: 12,
  blocked_future_leakage: 5,
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

const protectedPaths = [
  paths.projection,
  paths.advisory,
  paths.calibration,
  paths.patternDiscovery,
  paths.mapper,
  paths.learningFixtures,
  paths.contextFixtures,
  paths.insightFixtures,
  paths.action441Inventory,
  paths.action441Freezer,
  paths.action444Manifest,
  paths.action444Runner,
  paths.action454Inventory,
  paths.action454Freezer,
];

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  if (Object.is(value, -0)) return 0;
  return value;
}

function stableHash(value) {
  return sha(JSON.stringify(canonicalize(value)));
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

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function statusFiles() {
  const result = spawnSync("git", ["status", "--short"], { cwd: root, encoding: "utf8", maxBuffer: 120 * 1024 * 1024 });
  if (result.status !== 0) return [];
  return result.stdout
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
}

const beforeSourceHashes = Object.fromEntries(protectedPaths.map((path) => [path, exists(path) ? shaFile(path) : null]));
const action454FreezeReport = buildRepeatFreezeReport();
const afterSourceHashes = Object.fromEntries(protectedPaths.map((path) => [path, exists(path) ? shaFile(path) : null]));

const inventory = exists(paths.action454Inventory) ? readJson(paths.action454Inventory) : null;
const doc = exists(paths.doc) ? read(paths.doc) : "";
const action454Doc = exists(paths.action454Doc) ? read(paths.action454Doc) : "";
const scenarios = inventory?.scenarios ?? [];

const statusIds = Object.fromEntries(Object.keys(expectedStatusDistribution).map((status) => [
  status,
  idsFor(inventory ?? { scenarios: [] }, (scenario) => scenario.actual.status === status),
]));
const advisoryHashClassIds = Object.fromEntries(Object.keys(expectedAdvisoryHashDistribution).map((classification) => [
  classification,
  idsFor(inventory ?? { scenarios: [] }, (scenario) => scenario.advisory_input.advisory_hash_classification === classification),
]));
const familyIds = Object.fromEntries([...new Set(scenarios.map((scenario) => scenario.primary_family))].sort().map((family) => [
  family,
  idsFor(inventory, (scenario) => scenario.primary_family === family),
]));

const independentInventoryPayloadHash = inventory ? stableHash(inventory) : null;
const freezeInventoryPayloadHash = stableHash(action454FreezeReport.inventory);
const sourceClassifications = [...new Set(scenarios.map((scenario) => scenario.source_class))].sort();
const approvedSourceClassifications = [
  "deterministic_test_local_projection_envelope_and_bounded_advisory_result",
];

const successfulScenarios = scenarios.filter((scenario) => scenario.actual.projection_id !== null);
const blockedScenarios = scenarios.filter((scenario) => scenario.actual.projection_id === null);
const allIssueRecords = scenarios.flatMap((scenario) => scenario.actual.issues ?? []);
const allWarningRecords = scenarios.flatMap((scenario) => scenario.actual.warnings ?? []);
const validIssueWarningRecord = (record) =>
  typeof record.code === "string" &&
  typeof record.path === "string" &&
  ["error", "warning"].includes(record.severity) &&
  typeof record.messageKey === "string";
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

const boundedInventoryText = inventory ? JSON.stringify(inventory) : "";
const forbiddenBoundedTerms = [
  "AUTOMATION_SECRET",
  "SUPABASE_SERVICE_ROLE",
  "TWELVE_DATA_API_KEY",
  "process.env",
  ".env.local",
  "/Users/",
  "raw_response",
  "full_calibration_result",
  "pattern_insights",
  "pattern_discovery_output",
];

const allowedAuditConsumers = new Set([
  paths.action453Verifier,
  paths.action454Freezer,
  paths.action454Verifier,
  paths.verifier,
  paths.action453Test,
  paths.action454Test,
  paths.test,
  "scripts/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate-verify.mjs",
  "tests/e2e/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.spec.ts",
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use-verify.mjs",
  "tests/e2e/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.spec.ts",
  "scripts/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-verify.mjs",
  "tests/e2e/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.spec.ts",
  "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md",
  "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  "tests/e2e/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.spec.ts",
  "docs/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.md",
  "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
  "tests/e2e/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.spec.ts",
  "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
  "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
  "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
  "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
  "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
  "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
  "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
  "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
  "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
  "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
  "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
  "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
  "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
  "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
  "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
  "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
]);

const auditConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["scripts", "tests"],
).filter((path) => !allowedAuditConsumers.has(path));
const appOrLibConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["app", "lib"],
).filter((path) => path !== paths.projection);
const deploymentFilesChanged = statusFiles().filter((path) =>
  path === "netlify.toml" ||
  path.startsWith(".netlify/") ||
  path.startsWith(".openai/") ||
  path.startsWith("app/api/") ||
  path.startsWith("app/action-455") ||
  path.startsWith("public/action-455")
);

const forbiddenShadowArtifacts = [
  "docs/action-455-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  "scripts/action-455-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  "docs/action-455-static-confidence-calibration-recommendation-advisory-projection-execution-manifest.json",
  "lib/confidence-calibration-recommendation-advisory-projection-consumer.ts",
  "lib/recommendation-engine-confidence-calibration-advisory-projection-consumer.ts",
  "app/api/confidence-calibration-recommendation-advisory-projection",
  "app/confidence-calibration-recommendation-advisory-projection",
  "app/api/action-455",
  "app/action-455",
  "public/action-455",
].filter(exists);

const requiredDocPhrases = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 453 Approval Summary",
  "Action 454 Freeze Summary",
  "Explicit Non-Goals",
  "Protected-Source Audit",
  "Inventory-Integrity Audit",
  "Freezer-Integrity Audit",
  "Scenario-Count Audit",
  "Scenario-ID/Order Audit",
  "Source-Classification Audit",
  "Projection-Configuration Audit",
  "Recommendation-Envelope Audit",
  "Advisory-Result Audit",
  "Projection-Status Distribution Audit",
  "Confidence-Agreement Audit",
  "Advisory-Hash Classification Audit",
  "Validation-Precedence Audit",
  "Phase-11 Defense-In-Depth Audit",
  "Recommendation-Lineage Audit",
  "Advisory-Lineage Audit",
  "Pattern Discovery Lineage Audit",
  "Pattern Insight Lineage Audit",
  "Anti-Leakage Audit",
  "Anti-Feedback Audit",
  "Warning-Distribution Audit",
  "Issue-Distribution Audit",
  "No-Adjustment Audit",
  "Effect-Flag Audit",
  "Semantic-Order-Equivalence Audit",
  "Recommendation Non-Mutation Audit",
  "Projection-ID Audit",
  "Identity-Hash Audit",
  "Result-Hash Audit",
  "Scenario-Hash Audit",
  "Independent-Canonicalization Audit",
  "Repeat-Freeze Audit",
  "Package-Inventory-Hash Audit",
  "Bounded-Metadata Audit",
  "Source-Mutation Audit",
  "Consumer Inventory",
  "Remaining-Gap Inventory",
  "Shadow-Readiness Review",
  "Readiness Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Deployment Status",
  expectedPackageHash,
  expectedRepeatPayloadHash,
  "runtime_preview_waiting_for_operator_inputs",
];

const phasePrecedenceMatrix = {
  top_level_input: "outranks_projection_configuration",
  projection_configuration: "outranks_recommendation_envelope",
  recommendation_envelope: "outranks_recommendation_fingerprint",
  recommendation_fingerprint: "outranks_recommendation_snapshot_hash",
  recommendation_snapshot_hash: "outranks_original_confidence",
  original_confidence: "outranks_advisory_result_shape",
  advisory_result_shape: "outranks_advisory_status",
  unsupported_advisory_status: "outranks_confidence_mismatch",
  confidence_mismatch: "outranks_advisory_hash_mismatch",
  advisory_hash_mismatch: "outranks_lineage",
  lineage: "outranks_leakage",
  leakage: "outranks_feedback",
  feedback: "outranks_warning_issue_compatibility",
  warning_issue_compatibility: "outranks_projection_output",
  projection_output: "terminal",
};

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract: requiredDocPhrases.every((phrase) => doc.includes(phrase)),
  action454_doc_summary_present: action454Doc.includes(expectedPackageHash),
  inventory_exists: exists(paths.action454Inventory),
  freezer_exists: exists(paths.action454Freezer),
  inventory_schema_exact: inventory?.inventory_schema_version === "action_454_static_projection_hash_inventory_v1",
  scenario_count_exact: inventory?.scenario_count === 52 && scenarios.length === 52,
  scenario_ids_exact_order: same(inventory?.exact_ids, expectedScenarioIds) &&
    same(scenarios.map((scenario) => scenario.scenario_id), expectedScenarioIds),
  scenario_ids_unique: new Set(inventory?.exact_ids ?? []).size === 52,
  status_distribution_exact: same(inventory?.exact_status_distribution, expectedStatusDistribution) &&
    same(countBy(scenarios, (scenario) => scenario.actual.status), expectedStatusDistribution),
  status_distribution_total_52: Object.values(inventory?.exact_status_distribution ?? {}).reduce((sum, count) => sum + count, 0) === 52,
  advisory_hash_distribution_exact: same(inventory?.advisory_hash_classification_distribution, expectedAdvisoryHashDistribution) &&
    same(countBy(scenarios, (scenario) => scenario.advisory_input.advisory_hash_classification), expectedAdvisoryHashDistribution),
  warning_distribution_exact: same(inventory?.warning_distribution, expectedWarningDistribution) &&
    same(countBy(allWarningRecords, (warning) => warning.code), expectedWarningDistribution),
  issue_distribution_exact: same(inventory?.issue_distribution, expectedIssueDistribution) &&
    same(countBy(allIssueRecords, (issue) => issue.code), expectedIssueDistribution),
  source_classification_exact: same(sourceClassifications, approvedSourceClassifications),
  protected_sources_unchanged: same(beforeSourceHashes, afterSourceHashes) &&
    Object.values(beforeSourceHashes).every((hashValue) => typeof hashValue === "string"),
  inventory_matches_freezer: same(inventory, action454FreezeReport.inventory),
  package_hash_exact: inventory?.package_inventory_sha256 === expectedPackageHash &&
    action454FreezeReport.repeat_freeze.package_inventory_sha256 === expectedPackageHash,
  repeat_payload_hash_exact: independentInventoryPayloadHash === expectedRepeatPayloadHash &&
    freezeInventoryPayloadHash === expectedRepeatPayloadHash,
  repeat_freeze_exactly_two_runs: action454FreezeReport.repeat_freeze.run_count === 2,
  repeat_freeze_identical: action454FreezeReport.repeat_freeze.identical === true &&
    action454FreezeReport.repeat_freeze.first_payload_sha256 === action454FreezeReport.repeat_freeze.second_payload_sha256,
  static_declarations: inventory?.static_only === true &&
    inventory?.non_production === true &&
    inventory?.non_authoritative === true &&
    inventory?.non_learning === true,
  no_runtime_persistence_feedback_declarations: inventory?.no_runtime === true &&
    inventory?.no_persistence === true &&
    inventory?.no_replay === true &&
    inventory?.no_external_access === true &&
    inventory?.no_feedback === true,
  no_confidence_application_or_mutation: inventory?.recommendation_mutated === false &&
    inventory?.confidence_applied === false &&
    inventory?.projection_shadow_executed === false &&
    inventory?.consumer_added === false,
  bounded_metadata_only: inventory?.bounded_metadata_only === true &&
    inventory?.full_recommendation_objects_retained === false &&
    inventory?.full_advisory_objects_retained === false &&
    !forbiddenBoundedTerms.some((term) => boundedInventoryText.includes(term)),
  projection_configuration_exact: inventory?.projection_configuration?.projection_schema_version === "confidence_calibration_recommendation_projection_v1" &&
    inventory?.projection_configuration?.configuration_version === "confidence_calibration_recommendation_projection_config_v1" &&
    inventory?.projection_configuration?.confidence_scale_basis_points_per_point === 100,
  recommendation_envelopes_bounded: scenarios.every((scenario) =>
    typeof scenario.recommendation_envelope.fingerprint_state === "string" &&
    typeof scenario.recommendation_envelope.snapshot_hash_state === "string" &&
    scenario.recommendation_envelope.source_classification === "static_projection" &&
    scenario.recommendation_envelope.immutable === true),
  advisory_inputs_bounded: scenarios.every((scenario) =>
    typeof scenario.advisory_input.status === "string" &&
    typeof scenario.advisory_input.advisory_hash_classification === "string" &&
    typeof scenario.advisory_input.advisory_id_present === "boolean"),
  all_expected_actual_statuses_match: scenarios.every((scenario) => scenario.expected.status === scenario.actual.status),
  confidence_agreement_exact: scenarioById(inventory, "cp453_01")?.actual.status === "projection_ready" &&
    scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch" &&
    scenarioById(inventory, "cp453_12")?.actual.status === "blocked_confidence_mismatch" &&
    scenarioById(inventory, "cp453_13")?.actual.status === "blocked_invalid_input" &&
    scenarioById(inventory, "cp453_14")?.actual.status === "blocked_invalid_input" &&
    scenarioById(inventory, "cp453_15")?.actual.status === "blocked_invalid_input" &&
    scenarioById(inventory, "cp453_16")?.actual.status === "blocked_invalid_input" &&
    scenarioById(inventory, "cp453_17")?.actual.status === "blocked_invalid_input" &&
    scenarioById(inventory, "cp453_18")?.actual.status === "blocked_confidence_mismatch",
  advisory_hash_membership_exact: same(advisoryHashClassIds, {
    valid_advisory_hash: [
      "cp453_01", "cp453_02", "cp453_03", "cp453_04", "cp453_05", "cp453_06", "cp453_07", "cp453_08",
      "cp453_09", "cp453_10", "cp453_11", "cp453_12", "cp453_13", "cp453_14", "cp453_15", "cp453_16",
      "cp453_17", "cp453_18", "cp453_29", "cp453_30", "cp453_31", "cp453_32", "cp453_33", "cp453_34",
      "cp453_35", "cp453_36", "cp453_37", "cp453_38", "cp453_39", "cp453_40", "cp453_41", "cp453_42",
      "cp453_43", "cp453_44", "cp453_45", "cp453_46", "cp453_47", "cp453_48", "cp453_49", "cp453_50",
      "cp453_51", "cp453_52",
    ],
    malformed_hash: ["cp453_19"],
    swapped_hash: ["cp453_20"],
    unrelated_valid_format_hash: ["cp453_21"],
    retained_hash_tampering: ["cp453_22", "cp453_23", "cp453_24", "cp453_25", "cp453_26", "cp453_27"],
    hash_role_substitution: ["cp453_28"],
  }),
  invalid_hash_attacks_block: idsFor(inventory, (scenario) =>
    ["malformed_hash", "swapped_hash", "unrelated_valid_format_hash", "retained_hash_tampering", "hash_role_substitution"]
      .includes(scenario.advisory_input.advisory_hash_classification))
    .every((id) => scenarioById(inventory, id)?.actual.status === "blocked_advisory_result"),
  validation_precedence_exact: scenarioById(inventory, "cp453_05")?.actual.status === "blocked_invalid_input" &&
    scenarioById(inventory, "cp453_45")?.actual.status === "blocked_unsupported_status" &&
    scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch" &&
    scenarioById(inventory, "cp453_19")?.actual.status === "blocked_advisory_result" &&
    scenarioById(inventory, "cp453_29")?.actual.status === "blocked_invalid_lineage" &&
    scenarioById(inventory, "cp453_34")?.actual.status === "blocked_future_leakage" &&
    scenarioById(inventory, "cp453_39")?.actual.status === "blocked_invalid_lineage",
  phase_11_defense_exact: scenarioById(inventory, "cp453_51")?.actual.status === "blocked_advisory_result" &&
    scenarioById(inventory, "cp453_51")?.actual.issues?.[0]?.path === "/advisory/advisory_hash" &&
    scenarioById(inventory, "cp453_52")?.actual.status === "blocked_invalid_lineage" &&
    scenarioById(inventory, "cp453_52")?.actual.issues?.[0]?.path === "/advisory/lineage_hashes",
  lineage_leakage_feedback_exact: familyIds.lineage?.length === 5 &&
    familyIds.anti_leakage?.length === 5 &&
    familyIds.anti_feedback?.length === 6 &&
    familyIds.lineage.every((id) => scenarioById(inventory, id).actual.status === "blocked_invalid_lineage") &&
    familyIds.anti_leakage.every((id) => scenarioById(inventory, id).actual.status === "blocked_future_leakage") &&
    familyIds.anti_feedback.every((id) => scenarioById(inventory, id).actual.issues?.[0]?.code === "blocked_feedback_reuse"),
  warning_issue_records_complete: allWarningRecords.every(validIssueWarningRecord) &&
    allIssueRecords.every(validIssueWarningRecord) &&
    scenarioById(inventory, "cp453_46")?.actual.warnings?.length === 2 &&
    scenarioById(inventory, "cp453_47")?.actual.issues?.length === 2,
  no_adjustment_exact: scenarioById(inventory, "cp453_03")?.actual.status === "projection_no_adjustment" &&
    scenarioById(inventory, "cp453_03")?.actual.advisory_proposed_delta_basis_points === 0 &&
    scenarioById(inventory, "cp453_03")?.actual.advisory_proposed_confidence_basis_points ===
      scenarioById(inventory, "cp453_03")?.actual.recommendation_original_confidence_basis_points,
  effect_flags_exact: scenarios.every((scenario) => same(scenario.effect_flags, effectFlagTemplate)),
  semantic_ordering_exact: scenarioById(inventory, "cp453_48")?.actual.status === "projection_ready" &&
    scenarioById(inventory, "cp453_48")?.actual.projection_id === "confidence_calibration_recommendation_projection_v1:35f78c2da26985e8cbf8e98e",
  projection_hashes_exact: successfulScenarios.length === 8 &&
    blockedScenarios.length === 44 &&
    successfulScenarios.every((scenario) =>
      typeof scenario.actual.projection_id === "string" &&
      typeof scenario.actual.projection_hash === "string" &&
      scenario.actual.projection_hash === scenario.projection_identity_sha256 &&
      scenario.actual.projection_id.endsWith(scenario.actual.projection_hash.slice(0, 24))) &&
    blockedScenarios.every((scenario) => scenario.actual.projection_id === null && scenario.actual.projection_hash === null),
  scenario_hashes_stable: scenarios.every((scenario) =>
    typeof scenario.scenario_summary_sha256 === "string" &&
    scenario.scenario_summary_sha256.length === 64 &&
    typeof scenario.canonical_projection_result_sha256 === "string" &&
    scenario.canonical_projection_result_sha256.length === 64),
  independent_canonicalization_exact: stableHash(inventory) === expectedRepeatPayloadHash &&
    stableHash(action454FreezeReport.inventory) === expectedRepeatPayloadHash,
  recommendation_non_mutation_audit: scenarios.every((scenario) => scenario.effect_flags.recommendation_confidence_unchanged === true),
  no_shadow_runner_manifest_or_evidence: forbiddenShadowArtifacts.length === 0,
  no_unexpected_audit_consumers: auditConsumers.length === 0,
  no_app_or_lib_consumers: appOrLibConsumers.length === 0,
  no_deployment_artifacts_changed: deploymentFilesChanged.length === 0,
  runtime_preview_paused: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  action453_454_health: exists(paths.action453Verifier) && exists(paths.action454Verifier),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);
const unresolvedConditions = [];
const readinessDecision = failedConditions.length === 0
  ? "ready"
  : failedConditions.every((name) => name.includes("documentation"))
    ? "ready_with_conditions"
    : "blocked";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  action454_reproduction_result: {
    freeze_status: failedConditions.length === 0 ? "passed" : "blocked",
    scenario_count: inventory?.scenario_count ?? 0,
    inventory_matches_freezer: checks.inventory_matches_freezer,
    repeat_run_count: action454FreezeReport.repeat_freeze.run_count,
    repeat_identical: action454FreezeReport.repeat_freeze.identical,
    package_inventory_sha256: inventory?.package_inventory_sha256 ?? null,
    repeat_payload_sha256: independentInventoryPayloadHash,
  },
  scenario_inventory_integrity: {
    scenario_count: inventory?.scenario_count ?? 0,
    exact_ids: inventory?.exact_ids ?? [],
    unique_ids: checks.scenario_ids_unique,
    source_classifications: sourceClassifications,
    status_ids: statusIds,
    family_ids: familyIds,
  },
  projection_status_distribution: inventory?.exact_status_distribution ?? {},
  advisory_hash_result: {
    distribution: inventory?.advisory_hash_classification_distribution ?? {},
    scenario_membership: advisoryHashClassIds,
    invalid_hash_attacks_block: checks.invalid_hash_attacks_block,
  },
  confidence_agreement_result: {
    exact_basis_point_equality: scenarioById(inventory, "cp453_01")?.actual.status,
    one_basis_point_mismatch: scenarioById(inventory, "cp453_11")?.actual.status,
    decimal_mismatch: scenarioById(inventory, "cp453_12")?.actual.status,
    invalid_precision: scenarioById(inventory, "cp453_13")?.actual.status,
    below_range: scenarioById(inventory, "cp453_14")?.actual.status,
    above_range: scenarioById(inventory, "cp453_15")?.actual.status,
    non_finite_nan: scenarioById(inventory, "cp453_16")?.actual.status,
    non_finite_infinity: scenarioById(inventory, "cp453_17")?.actual.status,
    signed_zero: scenarioById(inventory, "cp453_18")?.actual.status,
    no_repair_or_rounding: true,
  },
  validation_precedence_result: {
    phase_matrix: phasePrecedenceMatrix,
    recommendation_faults_outrank_advisory_faults: scenarioById(inventory, "cp453_05")?.actual.status === "blocked_invalid_input",
    unsupported_status_outranks_confidence_mismatch: scenarioById(inventory, "cp453_45")?.actual.status === "blocked_unsupported_status",
    confidence_mismatch_outranks_hash: scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch",
    advisory_hash_outranks_lineage: scenarioById(inventory, "cp453_51")?.actual.status === "blocked_advisory_result",
    lineage_outranks_leakage: scenarioById(inventory, "cp453_29")?.actual.status === "blocked_invalid_lineage",
    leakage_outranks_feedback: scenarioById(inventory, "cp453_34")?.actual.status === "blocked_future_leakage",
    feedback_outranks_warning_issue_compatibility: scenarioById(inventory, "cp453_39")?.actual.status === "blocked_invalid_lineage",
  },
  phase_11_defense_result: {
    retained_old_hash: scenarioById(inventory, "cp453_51")?.actual.status,
    recomputed_matching_hash: scenarioById(inventory, "cp453_52")?.actual.status,
  },
  lineage_leakage_feedback_result: {
    recommendation_lineage_ids: familyIds.lineage ?? [],
    anti_leakage_ids: familyIds.anti_leakage ?? [],
    anti_feedback_ids: familyIds.anti_feedback ?? [],
    exact: checks.lineage_leakage_feedback_exact,
  },
  warning_issue_no_adjustment_effect_result: {
    warning_distribution: inventory?.warning_distribution ?? {},
    issue_distribution: inventory?.issue_distribution ?? {},
    warning_issue_records_complete: checks.warning_issue_records_complete,
    no_adjustment: scenarioById(inventory, "cp453_03")?.actual ?? null,
    effect_flags_exact: checks.effect_flags_exact,
  },
  semantic_order_result: {
    semantic_ordering_scenario: "cp453_48",
    projection_id: scenarioById(inventory, "cp453_48")?.actual.projection_id ?? null,
    result: checks.semantic_ordering_exact ? "stable" : "failed",
  },
  projection_identity_hash_result: {
    successful_projection_count: successfulScenarios.length,
    blocked_projection_count: blockedScenarios.length,
    projection_hashes_exact: checks.projection_hashes_exact,
    scenario_hashes_stable: checks.scenario_hashes_stable,
    independent_canonicalization_exact: checks.independent_canonicalization_exact,
  },
  bounded_metadata_result: checks.bounded_metadata_only ? "bounded_metadata_only" : "failed",
  source_integrity: {
    protected_paths: protectedPaths,
    before_hashes: beforeSourceHashes,
    after_hashes: afterSourceHashes,
    unchanged: checks.protected_sources_unchanged,
  },
  isolation: {
    forbidden_shadow_artifacts: forbiddenShadowArtifacts,
    unexpected_audit_consumers: auditConsumers,
    app_or_lib_consumers: appOrLibConsumers,
    deployment_files_changed: deploymentFilesChanged,
    no_shadow_runner_manifest_or_evidence: checks.no_shadow_runner_manifest_or_evidence,
    no_consumers: checks.no_unexpected_audit_consumers && checks.no_app_or_lib_consumers,
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
  passed_conditions: Object.entries(checks).filter(([, passed]) => passed).map(([name]) => name),
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  checks,
  deployment_status: "not_authorized_not_required",
  runtime_preview_status: inventory?.runtime_preview_status ?? "missing",
  unrelated_work_classification: "action_455_independent_static_hash_freeze_verification_only",
  recommended_next_action: "action_456_projection_shadow_execution_approval_gate",
};

console.log(JSON.stringify(report, null, 2));

if (failedConditions.length > 0) {
  process.exitCode = 1;
}
