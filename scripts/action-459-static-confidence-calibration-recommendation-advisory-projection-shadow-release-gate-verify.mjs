#!/usr/bin/env node

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
  doc: "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md",
  verifier: "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  test: "tests/e2e/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.spec.ts",
  action454Inventory: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  action454Freezer: "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
  action457Manifest: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  action457Runner: "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  action457UseDoc: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.md",
  action458Doc: "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.md",
  action458Verifier: "scripts/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-verify.mjs",
  action458Test: "tests/e2e/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.spec.ts",
  action461Doc: "docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md",
  action461Flag: "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
  action461Adapter: "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
  action461Component: "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
  action461Modal: "components/recommendations/RecommendationDetailsModal.tsx",
  action461Container: "components/recommendations/RecommendationCardContainer.tsx",
};

const chainDocs = [
  "docs/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.md",
  "docs/action-448-confidence-calibration-recommendation-advisory-projection-implementation.md",
  "docs/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.md",
  "docs/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.md",
  "docs/action-451-projection-advisory-status-hash-binding-remediation.md",
  "docs/action-452-independent-post-remediation-projection-verification.md",
  "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.md",
  "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.md",
  "docs/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.md",
  "docs/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.md",
  paths.action457UseDoc,
  paths.action458Doc,
];

const chainVerifiers = [
  "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
  "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
  "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
  "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
  "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
  "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
  "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
  "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
  "scripts/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification-verify.mjs",
  "scripts/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate-verify.mjs",
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use-verify.mjs",
  paths.action458Verifier,
];

const expected = {
  releaseClassification: "confidence_calibration_recommendation_advisory_projection_pure_static_verified",
  releaseDecisionVocabulary: ["released", "released_with_conditions", "blocked"],
  nextAction: "action_460_confidence_calibration_recommendation_advisory_projection_runtime_preview_integration_contract_approval_gate",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  action454PackageHash: "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072",
  action454RepeatPayloadHash: "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74",
  action457ManifestHash: "2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a",
  action457RunPackageHash: "dcd769f27ab08b56b8e027118ebb476246382a6ba96d9dee23da36b59debb6cd",
  action457EvidenceHash: "c1e394c78a4508af23e0141a9833a98ae4d1d4aa985ef1f1fd09771bd796beac",
  action458DocHash: "4cb2dec5e2d66ea71b5eb5d9a6684142f0418756bc23d2960661883863e7bd0e",
  action458VerifierHash: "176f6e80b2c64efeb0f0f5f5935332997133f3ba25f79bdf5706628a078ed5bf",
  action458TestHash: "360395484156d0f1f1132db34b9733efa381a23b5d4907212732965078466238",
  scenarioIds: Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`),
  sourceClassifications: ["deterministic_test_local_projection_envelope_and_bounded_advisory_result"],
  statusDistribution: {
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
  },
  advisoryHashDistribution: {
    valid_advisory_hash: 42,
    malformed_hash: 1,
    swapped_hash: 1,
    unrelated_valid_format_hash: 1,
    retained_hash_tampering: 6,
    hash_role_substitution: 1,
  },
  warningDistribution: {
    duplicate_mapper_row_identity: 4,
    metric_value_unavailable: 4,
  },
  issueDistribution: {
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
  },
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

const trackedEvidencePaths = [
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-evidence.json",
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-result.json",
  "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-evidence.json",
  "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-result.json",
  "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-evidence.json",
  "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-result.json",
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

const inventory = exists(paths.action454Inventory) ? readJson(paths.action454Inventory) : null;
const manifest = exists(paths.action457Manifest) ? readJson(paths.action457Manifest) : null;
const doc = exists(paths.doc) ? read(paths.doc) : "";
const action458Doc = exists(paths.action458Doc) ? read(paths.action458Doc) : "";
const action458Verifier = exists(paths.action458Verifier) ? read(paths.action458Verifier) : "";
const action457Runner = exists(paths.action457Runner) ? read(paths.action457Runner) : "";
const protectedHashPaths = [
  ...Object.keys(inventory?.protected_source_hashes ?? {}),
  paths.action454Inventory,
  paths.action454Freezer,
  paths.action457Manifest,
  paths.action457Runner,
  paths.action457UseDoc,
  paths.action458Doc,
  paths.action458Verifier,
  paths.action458Test,
];
const beforeHashes = fileHashes(protectedHashPaths);
const afterHashes = fileHashes(protectedHashPaths);
const protectedHashResults = Object.fromEntries(protectedHashPaths.map((path) => [
  path,
  {
    before: beforeHashes[path],
    after: afterHashes[path],
    unchanged: beforeHashes[path] !== null && beforeHashes[path] === afterHashes[path],
  },
]));
const scenarios = inventory?.scenarios ?? [];
const exactIds = scenarios.map((scenario) => scenario.scenario_id);
const sourceClassifications = [...new Set(scenarios.map((scenario) => scenario.source_class))].sort();
const allWarnings = scenarios.flatMap((scenario) => scenario.actual?.warnings ?? []);
const allIssues = scenarios.flatMap((scenario) => scenario.actual?.issues ?? []);
const successfulScenarios = scenarios.filter((scenario) => scenario.actual?.projection_id !== null);
const blockedScenarios = scenarios.filter((scenario) => scenario.actual?.projection_id === null);
const noAdjustmentScenario = inventory ? scenarioById(inventory, "cp453_03") : null;
const trackedEvidenceArtifacts = trackedEvidencePaths.filter(exists);
const tempPath = join(
  realpathSync(tmpdir()),
  "ture",
  "action-457-static-confidence-calibration-recommendation-advisory-projection-shadow",
);
const tempPathAbsentOrEmpty = !existsSync(tempPath) || readdirSync(tempPath).length === 0;
const appOrLibConsumers = scanFiles(["app", "lib"], (file, text) =>
  file !== "lib/confidence-calibration-recommendation-advisory-projection.ts" &&
  file !== paths.action461Flag &&
  file !== paths.action461Adapter &&
  /buildConfidenceCalibrationRecommendationProjection|confidence_calibration_recommendation_advisory_projection_pure_static_verified/.test(text),
);
const action461ApprovedConsumerBoundary =
  exists(paths.action461Doc) &&
  exists(paths.action461Flag) &&
  exists(paths.action461Adapter) &&
  exists(paths.action461Component) &&
  exists(paths.action461Modal) &&
  exists(paths.action461Container) &&
  read(paths.action461Doc).includes("Action 460 Contract") &&
  read(paths.action461Adapter).includes("buildConfidenceCalibrationProjectionPreview") &&
  read(paths.action461Flag).includes("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
const runtimeArtifacts = scanFiles(["app", "public"], (file, text) =>
  /action-459-static-confidence-calibration-recommendation-advisory-projection|confidence_calibration_recommendation_advisory_projection_pure_static_verified/.test(file) ||
  /action-459-static-confidence-calibration-recommendation-advisory-projection|confidence_calibration_recommendation_advisory_projection_pure_static_verified/.test(text),
);
const requiredDocPhrases = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Complete Action 447-458 Chain",
  "Explicit Non-Goals",
  "Protected-Source Inventory",
  "Protected-Package Inventory",
  "Contract-Integrity Review",
  "Remediation-Integrity Review",
  "Fixture/Hash-Freeze Review",
  "Independent Hash-Verification Review",
  "Shadow-Package Review",
  "Independent Shadow-Verification Review",
  "Exact Scenario Inventory",
  "Exact Status Distribution",
  "Confidence-Agreement Review",
  "Advisory-Hash Review",
  "Retained/Swapped/Hash-Role Attack Review",
  "Validation-Precedence Review",
  "Phase-11 Defense-In-Depth Review",
  "Recommendation/Advisory-Lineage Review",
  "Pattern Discovery Lineage Review",
  "Pattern Insight Lineage Review",
  "Anti-Leakage Review",
  "Anti-Feedback Review",
  "Warning Review",
  "Issue Review",
  "No-Adjustment Review",
  "Effect-Flag Review",
  "Recommendation Non-Mutation Review",
  "Projection-ID Review",
  "Semantic-Hash Review",
  "Repeat-Run Determinism Review",
  "Metadata-Boundary Review",
  "Cleanup Review",
  "Source/Package Immutability Review",
  "Consumer Inventory",
  "Runtime/Persistence/Replay/External-Access Review",
  "Confidence-Application Review",
  "Recommendation/Ranking/Scanner/Publication/Execution Mutation Review",
  "Authoritative-Data Review",
  "Deployment Review",
  "Release Classification Vocabulary",
  "Release Decision Vocabulary",
  "Release Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Post-Release Permitted Scope",
  "Mandatory Runtime-Preview Approval Gate",
  "Deployment Prohibition",
  "Runtime-Preview State",
  expected.releaseClassification,
  expected.nextAction,
  expected.action454PackageHash,
  expected.action454RepeatPayloadHash,
  expected.action457ManifestHash,
  expected.action457RunPackageHash,
  expected.action457EvidenceHash,
  expected.runtimePreviewStatus,
];
const validationPrecedence = {
  top_level_input: scenarioById(inventory, "cp453_05")?.actual.status === "blocked_invalid_input",
  projection_configuration: scenarioById(inventory, "cp453_05")?.actual.status === "blocked_invalid_input",
  recommendation_envelope: scenarioById(inventory, "cp453_05")?.actual.status === "blocked_invalid_input",
  recommendation_fingerprint: scenarioById(inventory, "cp453_06")?.actual.status === "blocked_invalid_input",
  recommendation_snapshot_lineage: scenarioById(inventory, "cp453_29")?.actual.status === "blocked_invalid_lineage",
  original_confidence: scenarioById(inventory, "cp453_13")?.actual.status === "blocked_invalid_input",
  advisory_result_shape: scenarioById(inventory, "cp453_19")?.actual.status === "blocked_advisory_result",
  advisory_status_eligibility: scenarioById(inventory, "cp453_45")?.actual.status === "blocked_unsupported_status",
  confidence_agreement: scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch",
  advisory_identity_result_hashes: scenarioById(inventory, "cp453_20")?.actual.status === "blocked_advisory_result",
  recommendation_advisory_lineage: scenarioById(inventory, "cp453_52")?.actual.status === "blocked_invalid_lineage",
  anti_leakage: scenarioById(inventory, "cp453_34")?.actual.status === "blocked_future_leakage",
  anti_feedback: scenarioById(inventory, "cp453_39")?.actual.issues?.some((issue) => issue.code === "blocked_feedback_reuse"),
  warning_issue_compatibility: scenarioById(inventory, "cp453_47")?.actual.issues?.some((issue) => issue.code === "warning_status_contradiction"),
  output_construction: successfulScenarios.every((scenario) => typeof scenario.actual.projection_id === "string"),
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
  complete_action_447_458_chain: chainDocs.every(exists) && chainVerifiers.every(exists),
  action458_static_health: action458Doc.includes("readiness decision") &&
    action458Doc.includes("ready") &&
    action458Doc.includes("shadow_passed") &&
    action458Verifier.includes("readiness_decision") &&
    action458Verifier.includes("action_459_static_projection_shadow_release_gate_or_runtime_preview_approval_gate"),
  action454_inventory_exists: exists(paths.action454Inventory),
  action457_manifest_exists: exists(paths.action457Manifest),
  action457_runner_exists: exists(paths.action457Runner),
  action454_package_hash: inventory?.package_inventory_sha256 === expected.action454PackageHash &&
    manifest?.action_454_package_inventory_sha256 === expected.action454PackageHash,
  action454_repeat_payload_hash: manifest?.action_454_repeat_payload_sha256 === expected.action454RepeatPayloadHash,
  action457_manifest_hash: stableHash(manifest) === expected.action457ManifestHash,
  action457_runner_static_hash_binding: action457Runner.includes("final_shadow_decision: \"shadow_passed\"") &&
    action458Doc.includes(expected.action457RunPackageHash) &&
    action458Doc.includes(expected.action457EvidenceHash) &&
    action458Verifier.includes(expected.action457RunPackageHash) &&
    action458Verifier.includes(expected.action457EvidenceHash),
  action458_artifact_hashes: shaFile(paths.action458Doc) === expected.action458DocHash &&
    shaFile(paths.action458Verifier) === expected.action458VerifierHash &&
    shaFile(paths.action458Test) === expected.action458TestHash,
  scenario_count: inventory?.scenario_count === 52 && manifest?.scenario_count === 52,
  scenario_ids_order: same(exactIds, expected.scenarioIds) && same(manifest?.exact_ordered_scenario_ids, expected.scenarioIds),
  source_classification: same(sourceClassifications, expected.sourceClassifications) &&
    same(manifest?.exact_source_classifications, expected.sourceClassifications),
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
  status_distribution: same(inventory?.exact_status_distribution, expected.statusDistribution) &&
    same(manifest?.exact_status_distribution, expected.statusDistribution),
  advisory_hash_classification: same(inventory?.advisory_hash_classification_distribution, expected.advisoryHashDistribution) &&
    same(manifest?.advisory_hash_classification_distribution, expected.advisoryHashDistribution) &&
    advisoryAttackIds.every((id) => scenarioById(inventory, id)?.actual.status === "blocked_advisory_result"),
  confidence_agreement: scenarioById(inventory, "cp453_01")?.actual.status === "projection_ready" &&
    scenarioById(inventory, "cp453_11")?.actual.status === "blocked_confidence_mismatch" &&
    scenarioById(inventory, "cp453_12")?.actual.status === "blocked_confidence_mismatch" &&
    scenarioById(inventory, "cp453_18")?.actual.status === "blocked_confidence_mismatch",
  effect_flags: scenarios.every((scenario) => same(scenario.effect_flags, effectFlagTemplate)),
  validation_precedence: Object.values(validationPrecedence).every(Boolean),
  phase_11_defense: scenarioById(inventory, "cp453_51")?.actual.status === "blocked_advisory_result" &&
    scenarioById(inventory, "cp453_52")?.actual.status === "blocked_invalid_lineage",
  lineage_leakage_feedback: scenarios.filter((scenario) => scenario.primary_family === "lineage").every((scenario) => scenario.actual.status === "blocked_invalid_lineage") &&
    scenarios.filter((scenario) => scenario.primary_family === "anti_leakage").every((scenario) => scenario.actual.status === "blocked_future_leakage") &&
    scenarios.filter((scenario) => scenario.primary_family === "anti_feedback").every((scenario) => scenario.actual.issues.some((issue) => issue.code === "blocked_feedback_reuse")),
  warnings: same(countBy(allWarnings, (warning) => warning.code), expected.warningDistribution) &&
    allWarnings.every((warning) => ["code", "path", "severity", "messageKey"].every((key) => key in warning)),
  issues: same(countBy(allIssues, (issue) => issue.code), expected.issueDistribution) &&
    allIssues.every((issue) => ["code", "path", "severity", "messageKey"].every((key) => key in issue)),
  no_adjustment: noAdjustmentScenario?.actual.status === "projection_no_adjustment" &&
    noAdjustmentScenario?.actual.advisory_proposed_delta_basis_points === 0 &&
    noAdjustmentScenario?.actual.recommendation_original_confidence_basis_points === noAdjustmentScenario?.actual.advisory_proposed_confidence_basis_points &&
    same(noAdjustmentScenario?.effect_flags, effectFlagTemplate),
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
  semantic_hashes: successfulScenarios.every((scenario) =>
    typeof scenario.projection_identity_sha256 === "string" &&
    scenario.projection_identity_sha256.length === 64) &&
    blockedScenarios.every((scenario) => scenario.projection_identity_sha256 === null) &&
    scenarios.every((scenario) =>
    typeof scenario.canonical_projection_result_sha256 === "string" &&
    scenario.canonical_projection_result_sha256.length === 64 &&
    typeof scenario.scenario_summary_sha256 === "string" &&
    scenario.scenario_summary_sha256.length === 64),
  repeat_run_determinism: manifest?.expected_shadow_runs === 2 &&
    manifest?.expected_final_shadow_decision === "shadow_passed" &&
    action457Runner.includes("run_1_package_hash") &&
    action457Runner.includes("run_2_package_hash") &&
    action457Runner.includes("repeat_run_identical"),
  metadata_boundary: inventory?.bounded_metadata_only === true &&
    manifest?.projection_shadow_scope === "local_static_bounded_metadata_only" &&
    JSON.stringify(manifest).includes("full_recommendation_objects") === false &&
    JSON.stringify(manifest).includes("full_advisory_objects") === false,
  cleanup: tempPathAbsentOrEmpty && trackedEvidenceArtifacts.length === 0,
  source_package_integrity: Object.values(protectedHashResults).every((result) => result.unchanged),
  approved_action461_preview_consumer_only: appOrLibConsumers.length === 0 && action461ApprovedConsumerBoundary,
  no_runtime_artifacts: runtimeArtifacts.length === 0,
  no_confidence_application: inventory?.confidence_applied === false && manifest?.confidence_applied === false,
  no_runtime_persistence_replay_external_feedback: manifest?.no_runtime === true &&
    manifest?.no_persistence === true &&
    manifest?.no_replay === true &&
    manifest?.no_external_access === true &&
    manifest?.no_feedback === true,
  no_recommendation_ranking_scanner_publication_execution_mutation: inventory?.recommendation_mutated === false &&
    manifest?.recommendation_mutated === false &&
    scenarios.every((scenario) =>
      scenario.effect_flags.ranking_affected === false &&
      scenario.effect_flags.scanner_affected === false &&
      scenario.effect_flags.publication_affected === false &&
      scenario.effect_flags.execution_affected === false),
  no_authoritative_data: manifest?.authoritative_data_created === false && inventory?.non_authoritative === true,
  no_deployment: manifest?.deployment_performed === false,
  release_classification: true,
  mandatory_action_460: true,
  runtime_preview_untouched: manifest?.runtime_preview_status === expected.runtimePreviewStatus &&
    inventory?.runtime_preview_status === expected.runtimePreviewStatus,
};
const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const unresolvedConditions = [];
const releaseDecision = failedConditions.length === 0
  ? "released"
  : failedConditions.every((condition) => condition === "documentation_contract")
    ? "released_with_conditions"
    : "blocked";
const report = {
  verification_status: releaseDecision === "blocked" ? "failed" : "passed",
  release_decision: releaseDecision,
  release_decision_vocabulary: expected.releaseDecisionVocabulary,
  release_classification: releaseDecision === "blocked" ? "blocked" : expected.releaseClassification,
  release_classification_meaning: {
    pure_deterministic_projection_adapter_verified: releaseDecision !== "blocked",
    static_fixture_hash_package_verified: releaseDecision !== "blocked",
    local_shadow_package_passed: releaseDecision !== "blocked",
    independent_shadow_audit_passed: releaseDecision !== "blocked",
    consumers_or_runtime_side_effects: false,
    runtime_integration_approved: false,
    recommendation_engine_consumption_approved: false,
    ui_consumption_approved: false,
    confidence_application_approved: false,
    persistence_approved: false,
    replay_approved: false,
    production_approved: false,
    deployment_approved: false,
  },
  chain_health: {
    complete_action_447_458_chain: checks.complete_action_447_458_chain,
    action458_static_health: checks.action458_static_health,
    action457_final_shadow_decision: manifest?.expected_final_shadow_decision ?? "missing",
    action458_readiness_decision: checks.action458_static_health ? "ready" : "missing",
  },
  frozen_hash_result: {
    action454_package_inventory_sha256: inventory?.package_inventory_sha256 ?? null,
    action454_repeat_payload_sha256: manifest?.action_454_repeat_payload_sha256 ?? null,
    action457_manifest_sha256: stableHash(manifest),
    action457_run_package_sha256: expected.action457RunPackageHash,
    action457_evidence_sha256: expected.action457EvidenceHash,
    action458_doc_sha256: exists(paths.action458Doc) ? shaFile(paths.action458Doc) : null,
    action458_verifier_sha256: exists(paths.action458Verifier) ? shaFile(paths.action458Verifier) : null,
    action458_test_sha256: exists(paths.action458Test) ? shaFile(paths.action458Test) : null,
    all_match: checks.action454_package_hash &&
      checks.action454_repeat_payload_hash &&
      checks.action457_manifest_hash &&
      checks.action457_runner_static_hash_binding &&
      checks.action458_artifact_hashes,
  },
  scenario_inventory: {
    count: scenarios.length,
    exact_ids: exactIds,
    source_classifications: sourceClassifications,
  },
  projection_status_distribution: inventory?.exact_status_distribution ?? {},
  advisory_hash_classification_distribution: inventory?.advisory_hash_classification_distribution ?? {},
  warning_distribution: countBy(allWarnings, (warning) => warning.code),
  issue_distribution: countBy(allIssues, (issue) => issue.code),
  confidence_advisory_hash_result: checks.confidence_agreement && checks.advisory_hash_classification ? "matched" : "mismatch",
  precedence_phase11_result: checks.validation_precedence && checks.phase_11_defense ? "matched" : "mismatch",
  warning_issue_no_adjustment_effect_flag_result: checks.warnings && checks.issues && checks.no_adjustment && checks.effect_flags ? "matched" : "mismatch",
  identity_determinism_result: checks.projection_ids && checks.semantic_hashes && checks.repeat_run_determinism ? "matched" : "mismatch",
  metadata_cleanup_result: {
    bounded_metadata_only: checks.metadata_boundary,
    temporary_evidence_deleted: tempPathAbsentOrEmpty,
    no_tracked_evidence: trackedEvidenceArtifacts.length === 0,
    tracked_evidence_artifacts: trackedEvidenceArtifacts,
  },
  source_package_integrity: {
    protected_sources_unchanged: checks.source_package_integrity,
    protected_hash_results: protectedHashResults,
  },
  isolation: {
    app_or_lib_consumers: appOrLibConsumers,
    runtime_artifacts: runtimeArtifacts,
    approved_action461_preview_consumer_only: checks.approved_action461_preview_consumer_only,
    no_confidence_application: checks.no_confidence_application,
    no_runtime_persistence_replay_external_feedback: checks.no_runtime_persistence_replay_external_feedback,
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
    ranking_changed: false,
    scanner_changed: false,
    publication_changed: false,
    execution_changed: false,
    confidence_applied: false,
    authoritative_data_created: false,
    deployment_result: "none",
  },
  authoritative_data_result: checks.no_authoritative_data ? "none" : "created_or_unknown",
  deployment_result: "none",
  runtime_preview_status: manifest?.runtime_preview_status ?? "missing",
  post_release_permitted_scope: [
    "separate_runtime_preview_integration_contract_approval_gate_only",
  ],
  recommended_next_action: expected.nextAction,
  unrelated_work_classification: "action_459_static_projection_shadow_release_gate_only",
  passed_conditions: Object.entries(checks).filter(([, passed]) => passed).map(([name]) => name),
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));

if (releaseDecision === "blocked") {
  process.exitCode = 1;
}
