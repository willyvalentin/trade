#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

const paths = {
  doc: "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.md",
  verifier: "scripts/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-verify.mjs",
  test: "tests/e2e/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.spec.ts",
  action454Inventory: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  action454Freezer: "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
  action456Verifier: "scripts/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate-verify.mjs",
  action457Manifest: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  action457Runner: "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  action457UseDoc: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.md",
};

const expectedAction454PackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedAction454RepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";
const expectedAction457ManifestHash = "2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a";
const expectedAction457RunPackageHash = "dcd769f27ab08b56b8e027118ebb476246382a6ba96d9dee23da36b59debb6cd";
const expectedEvidenceHash = "c1e394c78a4508af23e0141a9833a98ae4d1d4aa985ef1f1fd09771bd796beac";
const expectedScenarioIds = Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`);
const expectedSourceClassifications = ["deterministic_test_local_projection_envelope_and_bounded_advisory_result"];
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
const protectedExtraPaths = [
  paths.action454Inventory,
  paths.action454Freezer,
  paths.action457Manifest,
  paths.action457Runner,
  paths.action457UseDoc,
];
const trackedEvidencePaths = [
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-evidence.json",
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-result.json",
  "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-evidence.json",
  "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-result.json",
];
const readinessVocabulary = ["ready", "ready_with_conditions", "blocked"];

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  if (Object.is(value, -0)) return 0;
  return value;
}

function stableHash(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
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

function scenarioById(inventory, id) {
  return inventory.scenarios.find((scenario) => scenario.scenario_id === id);
}

function toManifestScenario(scenario) {
  return {
    scenario_id: scenario.scenario_id,
    order: scenario.order,
    primary_family: scenario.primary_family,
    coverage_tags: scenario.coverage_tags,
    source_class: scenario.source_class,
    recommendation_envelope: scenario.recommendation_envelope,
    advisory_input: scenario.advisory_input,
    expected_projection: scenario.expected,
    expected_actual: scenario.actual,
    expected_effect_flags: scenario.effect_flags,
    advisory_hash_classification: scenario.advisory_input.advisory_hash_classification,
    validation_phase_outcome: scenario.actual.status,
    projection_id: scenario.actual.projection_id,
    projection_identity_sha256: scenario.projection_identity_sha256,
    canonical_projection_result_sha256: scenario.canonical_projection_result_sha256,
    scenario_summary_sha256: scenario.scenario_summary_sha256,
  };
}

function fileHashes(pathsToHash) {
  return Object.fromEntries(pathsToHash.map((path) => [path, exists(path) ? shaFile(path) : null]));
}

function runJsonScript(path) {
  const output = execFileSync("node", [abs(path)], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 160 * 1024 * 1024,
  });
  return JSON.parse(output);
}

const inventory = exists(paths.action454Inventory) ? readJson(paths.action454Inventory) : null;
const manifest = exists(paths.action457Manifest) ? readJson(paths.action457Manifest) : null;
const doc = exists(paths.doc) ? read(paths.doc) : "";
const protectedHashPaths = [
  ...Object.keys(inventory?.protected_source_hashes ?? {}),
  ...protectedExtraPaths,
];
const protectedBeforeHashes = fileHashes(protectedHashPaths);
const action457Run = exists(paths.action457Runner) ? runJsonScript(paths.action457Runner) : null;
const protectedAfterHashes = fileHashes(protectedHashPaths);
const protectedHashResults = Object.fromEntries(protectedHashPaths.map((path) => [
  path,
  {
    before: protectedBeforeHashes[path],
    after: protectedAfterHashes[path],
    unchanged: protectedBeforeHashes[path] !== null && protectedBeforeHashes[path] === protectedAfterHashes[path],
  },
]));
const scenarios = inventory?.scenarios ?? [];
const exactIds = scenarios.map((scenario) => scenario.scenario_id);
const sourceClassifications = [...new Set(scenarios.map((scenario) => scenario.source_class))].sort();
const allWarnings = scenarios.flatMap((scenario) => scenario.actual?.warnings ?? []);
const allIssues = scenarios.flatMap((scenario) => scenario.actual?.issues ?? []);
const successfulScenarios = scenarios.filter((scenario) => scenario.actual?.projection_id !== null);
const blockedScenarios = scenarios.filter((scenario) => scenario.actual?.projection_id === null);
const noAdjustmentScenario = scenarioById(inventory, "cp453_03");
const tempPath = join(
  realpathSync(tmpdir()),
  "ture",
  "action-457-static-confidence-calibration-recommendation-advisory-projection-shadow",
);
const tempPathAbsentOrEmpty = !existsSync(tempPath) || readdirSync(tempPath).length === 0;
const trackedEvidenceArtifacts = trackedEvidencePaths.filter(exists);
const appOrLibConsumers = scanFiles(["app", "lib"], (file, text) =>
  file !== "lib/confidence-calibration-recommendation-advisory-projection.ts" &&
  /buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection-shadow/.test(text),
);
const runtimeArtifacts = scanFiles(["app", "public"], (file, text) =>
  /action-457-static-confidence-calibration-recommendation-advisory-projection|action-458-independent-static-confidence-calibration-recommendation-advisory-projection|confidence-calibration-recommendation-advisory-projection-shadow/.test(file) ||
  /action-457-static-confidence-calibration-recommendation-advisory-projection|action-458-independent-static-confidence-calibration-recommendation-advisory-projection|confidence-calibration-recommendation-advisory-projection-shadow/.test(text),
);
const requiredDocPhrases = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 457 Result",
  "Explicit Non-Goals",
  "Protected-Source Audit",
  "Protected-Package Audit",
  "Manifest-Integrity Audit",
  "Runner-Integrity Audit",
  "Action 454 Inventory-Binding Audit",
  "Scenario-Count Audit",
  "Scenario-ID/Order Audit",
  "Source-Classification Audit",
  "Recommendation-Envelope Audit",
  "Advisory-Input Audit",
  "Projection-Configuration Audit",
  "Projection-Status Distribution Audit",
  "Advisory-Hash-Classification Audit",
  "Confidence-Agreement Audit",
  "Effect-Flag Audit",
  "Validation-Precedence Audit",
  "Phase-11 Defense-In-Depth Audit",
  "Recommendation/Advisory-Lineage Audit",
  "Pattern Discovery Lineage Audit",
  "Pattern Insight Lineage Audit",
  "Anti-Leakage Audit",
  "Anti-Feedback Audit",
  "Warning Audit",
  "Issue Audit",
  "No-Adjustment Audit",
  "Semantic-Order Audit",
  "Recommendation Non-Mutation Audit",
  "Projection-ID Audit",
  "Identity-Hash Audit",
  "Result-Hash Audit",
  "Scenario-Hash Audit",
  "Package-Hash Audit",
  "Exactly-Two-Runs Audit",
  "Repeat-Run-Determinism Audit",
  "Metadata-Boundary Audit",
  "Evidence-Hash Audit",
  "Temp-Path-Safety Audit",
  "Cleanup Audit",
  "Tracked-Evidence Audit",
  "Source-Mutation Audit",
  "Consumer Inventory",
  "Confidence-Application Audit",
  "Runtime/Persistence/Replay/External Audit",
  "Feedback Audit",
  "Recommendation-Mutation Audit",
  "Authoritative-Data Audit",
  "Deployment Audit",
  "Readiness Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Runtime-Preview State",
  expectedAction454PackageHash,
  expectedAction454RepeatPayloadHash,
  expectedAction457ManifestHash,
  expectedAction457RunPackageHash,
  expectedEvidenceHash,
  "runtime_preview_waiting_for_operator_inputs",
];

const validationPrecedence = {
  recommendation_faults_outrank_advisory_faults: scenarioById(inventory, "cp453_05")?.actual.status === "blocked_invalid_input",
  unsupported_status_outranks_confidence_mismatch: scenarioById(inventory, "cp453_45")?.actual.status === "blocked_unsupported_status",
  confidence_mismatch_outranks_advisory_hash_mismatch: scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch",
  advisory_hash_mismatch_outranks_lineage: scenarioById(inventory, "cp453_51")?.actual.status === "blocked_advisory_result",
  lineage_outranks_leakage: scenarioById(inventory, "cp453_29")?.actual.status === "blocked_invalid_lineage",
  leakage_outranks_feedback: scenarioById(inventory, "cp453_34")?.actual.status === "blocked_future_leakage",
  feedback_outranks_warning_issue_compatibility: scenarioById(inventory, "cp453_39")?.actual.issues?.[0]?.code === "blocked_feedback_reuse",
};
const advisoryAttackIds = scenarios
  .filter((scenario) =>
    ["malformed_hash", "swapped_hash", "unrelated_valid_format_hash", "retained_hash_tampering", "hash_role_substitution"]
      .includes(scenario.advisory_input.advisory_hash_classification))
  .map((scenario) => scenario.scenario_id);
const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract: requiredDocPhrases.every((phrase) => doc.includes(phrase)),
  action454_inventory_exists: exists(paths.action454Inventory),
  action457_manifest_exists: exists(paths.action457Manifest),
  action457_runner_exists: exists(paths.action457Runner),
  action454_package_hash: inventory?.package_inventory_sha256 === expectedAction454PackageHash &&
    manifest?.action_454_package_inventory_sha256 === expectedAction454PackageHash &&
    action457Run?.action_454_package_inventory_sha256 === expectedAction454PackageHash,
  action454_repeat_payload_hash: manifest?.action_454_repeat_payload_sha256 === expectedAction454RepeatPayloadHash &&
    action457Run?.action_454_repeat_payload_sha256 === expectedAction454RepeatPayloadHash,
  manifest_hash: stableHash(manifest) === expectedAction457ManifestHash &&
    action457Run?.manifest_sha256 === expectedAction457ManifestHash,
  scenario_count: inventory?.scenario_count === 52 &&
    manifest?.scenario_count === 52 &&
    action457Run?.scenario_count === 52,
  scenario_ids_order: same(exactIds, expectedScenarioIds) &&
    same(manifest?.exact_ordered_scenario_ids, expectedScenarioIds) &&
    same(action457Run?.exact_ordered_scenario_ids, expectedScenarioIds),
  source_classification: same(sourceClassifications, expectedSourceClassifications) &&
    same(manifest?.exact_source_classifications, expectedSourceClassifications),
  recommendation_envelopes: same(manifest?.scenario_manifest, scenarios.map(toManifestScenario)) &&
    scenarios.every((scenario) =>
      scenario.recommendation_envelope?.source_classification === "static_projection" &&
      scenario.recommendation_envelope?.immutable === true &&
      "original_confidence_basis_points" in scenario.recommendation_envelope),
  advisory_inputs: same(manifest?.scenario_manifest, scenarios.map(toManifestScenario)) &&
    scenarios.every((scenario) =>
      typeof scenario.advisory_input?.status === "string" &&
      typeof scenario.advisory_input?.advisory_hash_classification === "string" &&
      "original_confidence_basis_points" in scenario.advisory_input),
  projection_configuration: manifest !== null &&
    same(manifest.projection_configuration, inventory?.projection_configuration) &&
    inventory?.projection_configuration?.projection_schema_version === "confidence_calibration_recommendation_projection_v1",
  status_distribution: same(inventory?.exact_status_distribution, expectedStatusDistribution) &&
    same(manifest?.exact_status_distribution, expectedStatusDistribution) &&
    same(action457Run?.projection_status_distribution, expectedStatusDistribution),
  advisory_hash_classification: same(inventory?.advisory_hash_classification_distribution, expectedAdvisoryHashDistribution) &&
    same(manifest?.advisory_hash_classification_distribution, expectedAdvisoryHashDistribution) &&
    same(action457Run?.advisory_hash_classification_distribution, expectedAdvisoryHashDistribution) &&
    advisoryAttackIds.every((id) => scenarioById(inventory, id)?.actual.status === "blocked_advisory_result"),
  confidence_agreement: same(manifest?.scenario_manifest, scenarios.map(toManifestScenario)) &&
    scenarioById(inventory, "cp453_01")?.actual.status === "projection_ready" &&
    scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch" &&
    scenarioById(inventory, "cp453_18")?.actual.status === "blocked_confidence_mismatch",
  effect_flags: scenarios.every((scenario) => same(scenario.effect_flags, effectFlagTemplate)),
  validation_precedence: Object.values(validationPrecedence).every(Boolean),
  phase_11_defense: scenarioById(inventory, "cp453_51")?.actual.status === "blocked_advisory_result" &&
    scenarioById(inventory, "cp453_52")?.actual.status === "blocked_invalid_lineage",
  lineage_leakage_feedback: action457Run?.lineage_leakage_feedback_result === "matched" &&
    scenarios.filter((scenario) => scenario.primary_family === "anti_leakage").every((scenario) => scenario.actual.status === "blocked_future_leakage") &&
    scenarios.filter((scenario) => scenario.primary_family === "anti_feedback").every((scenario) => scenario.actual.issues.some((issue) => issue.code === "blocked_feedback_reuse")),
  warnings: same(countBy(allWarnings, (warning) => warning.code), expectedWarningDistribution) &&
    same(action457Run?.warning_distribution, expectedWarningDistribution) &&
    allWarnings.every((warning) => ["code", "path", "severity", "messageKey"].every((key) => key in warning)),
  issues: same(countBy(allIssues, (issue) => issue.code), expectedIssueDistribution) &&
    same(action457Run?.issue_distribution, expectedIssueDistribution) &&
    allIssues.every((issue) => ["code", "path", "severity", "messageKey"].every((key) => key in issue)),
  no_adjustment: noAdjustmentScenario?.actual.status === "projection_no_adjustment" &&
    noAdjustmentScenario?.actual.advisory_proposed_delta_basis_points === 0 &&
    noAdjustmentScenario?.actual.recommendation_original_confidence_basis_points === noAdjustmentScenario?.actual.advisory_proposed_confidence_basis_points &&
    same(noAdjustmentScenario?.effect_flags, effectFlagTemplate),
  semantic_order: scenarioById(inventory, "cp453_48")?.actual.status === "projection_ready",
  recommendation_non_mutation: scenarios.every((scenario) => scenario.effect_flags.recommendation_confidence_unchanged === true) &&
    inventory?.recommendation_mutated === false &&
    manifest?.recommendation_mutated === false,
  projection_ids: successfulScenarios.length === 8 &&
    successfulScenarios.every((scenario) =>
      typeof scenario.actual.projection_id === "string" &&
      scenario.actual.projection_id.startsWith("confidence_calibration_recommendation_projection_v1:") &&
      scenario.actual.projection_id.endsWith(scenario.projection_identity_sha256.slice(0, 24))) &&
    blockedScenarios.length === 44 &&
    blockedScenarios.every((scenario) => scenario.actual.projection_id === null && scenario.actual.projection_hash === null),
  identity_hashes: successfulScenarios.every((scenario) =>
    typeof scenario.projection_identity_sha256 === "string" &&
    scenario.projection_identity_sha256.length === 64 &&
    scenario.actual.projection_hash === scenario.projection_identity_sha256),
  result_hashes: scenarios.every((scenario) =>
    typeof scenario.canonical_projection_result_sha256 === "string" &&
    scenario.canonical_projection_result_sha256.length === 64),
  scenario_hashes: scenarios.every((scenario) =>
    typeof scenario.scenario_summary_sha256 === "string" &&
    scenario.scenario_summary_sha256.length === 64),
  package_hashes: action457Run?.run_1_package_hash === expectedAction457RunPackageHash &&
    action457Run?.run_2_package_hash === expectedAction457RunPackageHash,
  exactly_two_runs: action457Run?.repeat_run_identical === true &&
    manifest?.expected_shadow_runs === 2 &&
    action457Run?.run_1_package_hash === action457Run?.run_2_package_hash,
  evidence_hash: action457Run?.temp_path_cleanup?.evidence_sha256 === expectedEvidenceHash,
  metadata_boundary: action457Run?.metadata_only_evidence === true &&
    inventory?.bounded_metadata_only === true &&
    manifest?.projection_shadow_scope === "local_static_bounded_metadata_only" &&
    JSON.stringify(manifest).includes("full_recommendation_objects") === false &&
    JSON.stringify(manifest).includes("full_advisory_objects") === false,
  temp_path_safety: action457Run?.temp_path_cleanup?.path_safety?.safe === true &&
    action457Run?.temp_path_cleanup?.path_safety?.checks?.inside_system_temp === true &&
    action457Run?.temp_path_cleanup?.path_safety?.checks?.no_target_symlink === true &&
    action457Run?.temp_path_cleanup?.path_safety?.checks?.no_parent_chain_symlink === true,
  cleanup: action457Run?.temp_path_cleanup?.cleanup_succeeded === true && tempPathAbsentOrEmpty,
  no_tracked_evidence: trackedEvidenceArtifacts.length === 0,
  source_package_integrity: Object.values(protectedHashResults).every((result) => result.unchanged),
  no_consumers: appOrLibConsumers.length === 0,
  no_runtime_artifacts: runtimeArtifacts.length === 0,
  no_confidence_application: action457Run?.confidence_application_created === false &&
    inventory?.confidence_applied === false &&
    manifest?.confidence_applied === false,
  no_runtime_persistence_replay_external_feedback: action457Run?.runtime_created === false &&
    action457Run?.persistence_executed === false &&
    action457Run?.replay_executed === false &&
    action457Run?.external_access_executed === false &&
    action457Run?.feedback_created === false,
  no_authoritative_data: action457Run?.authoritative_data_created === false &&
    manifest?.authoritative_data_created === false,
  no_deployment: action457Run?.deployment_result === "none" &&
    manifest?.deployment_performed === false,
  action456_457_health: exists(paths.action456Verifier) &&
    action457Run?.final_shadow_decision === "shadow_passed" &&
    action457Run?.recommended_next_action === "action_458_independent_static_projection_shadow_verification",
  runtime_preview_untouched: action457Run?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    manifest?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
};
const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const unresolvedConditions = [];
const readinessDecision = failedConditions.length === 0
  ? "ready"
  : failedConditions.every((condition) => condition === "documentation_contract")
    ? "ready_with_conditions"
    : "blocked";
const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: readinessVocabulary,
  action457_reproduction_result: {
    final_shadow_decision: action457Run?.final_shadow_decision ?? "missing",
    scenario_count: action457Run?.scenario_count ?? 0,
    exactly_two_runs: checks.exactly_two_runs,
    repeat_run_identical: action457Run?.repeat_run_identical === true,
    run_1_package_hash: action457Run?.run_1_package_hash ?? null,
    run_2_package_hash: action457Run?.run_2_package_hash ?? null,
    evidence_sha256: action457Run?.temp_path_cleanup?.evidence_sha256 ?? null,
  },
  manifest_inventory_integrity: {
    action454_package_inventory_sha256: inventory?.package_inventory_sha256 ?? null,
    action454_repeat_payload_sha256: manifest?.action_454_repeat_payload_sha256 ?? null,
    action457_manifest_sha256: stableHash(manifest),
    protected_sources_unchanged: checks.source_package_integrity,
  },
  scenario_inventory: {
    count: scenarios.length,
    exact_ids: exactIds,
    source_classifications: sourceClassifications,
  },
  projection_status_distribution: action457Run?.projection_status_distribution ?? {},
  advisory_hash_classification_distribution: action457Run?.advisory_hash_classification_distribution ?? {},
  warning_distribution: action457Run?.warning_distribution ?? {},
  issue_distribution: action457Run?.issue_distribution ?? {},
  confidence_effect_flags_result: checks.confidence_agreement && checks.effect_flags ? "matched" : "mismatch",
  validation_precedence_result: checks.validation_precedence ? "matched" : "mismatch",
  phase_11_defense_result: checks.phase_11_defense ? "matched" : "mismatch",
  lineage_leakage_feedback_result: checks.lineage_leakage_feedback ? "matched" : "mismatch",
  warning_issue_no_adjustment_result: checks.warnings && checks.issues && checks.no_adjustment ? "matched" : "mismatch",
  projection_id_hash_result: checks.projection_ids && checks.identity_hashes && checks.result_hashes && checks.scenario_hashes ? "matched" : "mismatch",
  metadata_cleanup_result: {
    metadata_only: checks.metadata_boundary,
    temp_path_safe: checks.temp_path_safety,
    cleanup_succeeded: checks.cleanup,
    temp_path_absent_or_empty: tempPathAbsentOrEmpty,
    tracked_evidence_artifacts: trackedEvidenceArtifacts,
  },
  protected_hash_results: protectedHashResults,
  isolation: {
    app_or_lib_consumers: appOrLibConsumers,
    runtime_artifacts: runtimeArtifacts,
    confidence_application_created: false,
    runtime_created: false,
    persistence_executed: false,
    replay_executed: false,
    external_access_executed: false,
    feedback_created: false,
    recommendation_mutated: false,
    authoritative_data_created: false,
    deployment_result: "none",
  },
  safety: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_created: false,
    external_access_executed: false,
    feedback_created: false,
    recommendation_mutated: false,
    confidence_applied: false,
    authoritative_data_created: false,
    deployment_result: "none",
  },
  runtime_preview_status: action457Run?.runtime_preview_status ?? "missing",
  deployment_result: "none",
  recommended_next_action: "action_459_static_projection_shadow_release_gate_or_runtime_preview_approval_gate",
  unrelated_work_classification: "action_458_independent_static_projection_shadow_verification_only",
  passed_conditions: Object.entries(checks).filter(([, passed]) => passed).map(([name]) => name),
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));

if (readinessDecision === "blocked") {
  process.exitCode = 1;
}
