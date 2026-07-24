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
  manifest: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  runner: "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  doc: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.md",
  verifier: "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use-verify.mjs",
  test: "tests/e2e/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.spec.ts",
};

const expectedPackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedRepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";
const expectedManifestHash = "2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a";
const expectedRunPackageHash = "dcd769f27ab08b56b8e027118ebb476246382a6ba96d9dee23da36b59debb6cd";
const expectedScenarioIds = Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`);
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

function runJsonScript(path) {
  const output = execFileSync("node", [abs(path)], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 160 * 1024 * 1024,
  });
  return JSON.parse(output);
}

const manifest = exists(paths.manifest) ? readJson(paths.manifest) : null;
const doc = exists(paths.doc) ? read(paths.doc) : "";
const runnerReport = exists(paths.runner) ? runJsonScript(paths.runner) : null;
const protectedHashResults = Object.fromEntries(
  Object.entries(manifest?.protected_source_hashes ?? {}).map(([path, expected]) => [
    path,
    {
      expected,
      actual: exists(path) ? shaFile(path) : null,
      matched: exists(path) && shaFile(path) === expected,
    },
  ]),
);
const protectedSourceUnchanged = Object.values(protectedHashResults).every((result) => result.matched);
const tempPath = join(
  realpathSync(tmpdir()),
  "ture",
  "action-457-static-confidence-calibration-recommendation-advisory-projection-shadow",
);
const tempPathAbsentOrEmpty = !existsSync(tempPath) || readdirSync(tempPath).length === 0;
const appOrLibConsumers = scanFiles(["app", "lib"], (file, text) =>
  file !== "lib/confidence-calibration-recommendation-advisory-projection.ts" &&
  /buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection-shadow/.test(text),
);
const runtimeArtifacts = scanFiles(["app", "public"], (file, text) =>
  /action-457-static-confidence-calibration-recommendation-advisory-projection|confidence-calibration-recommendation-advisory-projection-shadow/.test(file) ||
  /action-457-static-confidence-calibration-recommendation-advisory-projection|confidence-calibration-recommendation-advisory-projection-shadow/.test(text),
);
const trackedEvidenceArtifacts = [
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-evidence.json",
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-result.json",
].filter(exists);
const requiredDocPhrases = [
  "Action 456 Approval",
  "Exact Package Boundary",
  "Action 454 Package Hashes",
  "Exact Scenario Inventory",
  "Expected And Actual Projection-Status Distribution",
  "Expected And Actual Advisory-Hash Classification",
  "Repeat-Run Determinism",
  "Metadata-Only Evidence",
  "Path Safety",
  "No Consumer",
  "No Confidence Application",
  "No Persistence",
  "No Replay",
  "No Runtime",
  "No External Access",
  "No Feedback",
  "Deployment Result",
  "Final Shadow Decision",
  "Runtime Preview",
  "Action 458 remains mandatory",
  expectedPackageHash,
  expectedRepeatPayloadHash,
  expectedManifestHash,
  expectedRunPackageHash,
  "shadow_passed",
  "runtime_preview_waiting_for_operator_inputs",
];

const checks = {
  documentation_exists: exists(paths.doc),
  runner_exists: exists(paths.runner),
  manifest_exists: exists(paths.manifest),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract: requiredDocPhrases.every((phrase) => doc.includes(phrase)),
  manifest_schema: manifest?.manifest_schema_version === "action_457_static_projection_shadow_input_manifest_v1",
  manifest_action: manifest?.action === "action_457_static_confidence_calibration_recommendation_advisory_projection_shadow_execution",
  action456_approval_bound: manifest?.action_456_approval_decision === "approved",
  exact_52_ids_order: manifest?.scenario_count === 52 && same(manifest?.exact_ordered_scenario_ids, expectedScenarioIds),
  action454_hashes: manifest?.action_454_package_inventory_sha256 === expectedPackageHash &&
    manifest?.action_454_repeat_payload_sha256 === expectedRepeatPayloadHash,
  protected_hashes_current: protectedSourceUnchanged,
  status_distribution_exact: same(manifest?.exact_status_distribution, expectedStatusDistribution) &&
    same(runnerReport?.projection_status_distribution, expectedStatusDistribution),
  advisory_hash_distribution_exact: same(manifest?.advisory_hash_classification_distribution, expectedAdvisoryHashDistribution) &&
    same(runnerReport?.advisory_hash_classification_distribution, expectedAdvisoryHashDistribution),
  warning_distribution_exact: same(manifest?.warning_distribution, expectedWarningDistribution) &&
    same(runnerReport?.warning_distribution, expectedWarningDistribution),
  issue_distribution_exact: same(manifest?.issue_distribution, expectedIssueDistribution) &&
    same(runnerReport?.issue_distribution, expectedIssueDistribution),
  static_flags: manifest?.static_only === true &&
    manifest?.non_production === true &&
    manifest?.non_authoritative === true &&
    manifest?.non_learning === true &&
    manifest?.no_persistence === true &&
    manifest?.no_replay === true &&
    manifest?.no_runtime === true &&
    manifest?.no_external_access === true &&
    manifest?.no_feedback === true &&
    manifest?.recommendation_mutated === false &&
    manifest?.confidence_applied === false &&
    manifest?.deployment_performed === false &&
    manifest?.authoritative_data_created === false,
  runner_final_decision: runnerReport?.final_shadow_decision === "shadow_passed",
  runner_scenario_count: runnerReport?.scenario_count === 52,
  runner_order: same(runnerReport?.exact_ordered_scenario_ids, expectedScenarioIds),
  confidence_effect_flags: runnerReport?.confidence_effect_flag_result === "matched",
  validation_precedence: runnerReport?.validation_precedence_result === "matched",
  phase_11_defense: runnerReport?.phase_11_defense_result === "matched",
  lineage_leakage_feedback: runnerReport?.lineage_leakage_feedback_result === "matched",
  warning_issue_no_adjustment: runnerReport?.warning_issue_no_adjustment_result === "matched",
  projection_ids_hashes: runnerReport?.projection_id_hash_result === "matched",
  manifest_semantic_hash: runnerReport?.manifest_sha256 === expectedManifestHash,
  exactly_two_runs: runnerReport?.run_1_package_hash === expectedRunPackageHash &&
    runnerReport?.run_2_package_hash === expectedRunPackageHash &&
    runnerReport?.repeat_run_identical === true &&
    manifest?.expected_shadow_runs === 2,
  metadata_only_evidence: runnerReport?.metadata_only_evidence === true,
  safe_temp_path: runnerReport?.temp_path_cleanup?.path_safety?.safe === true,
  symlink_path_checks: runnerReport?.temp_path_cleanup?.path_safety?.checks?.no_target_symlink === true &&
    runnerReport?.temp_path_cleanup?.path_safety?.checks?.no_parent_chain_symlink === true,
  cleanup: runnerReport?.temp_path_cleanup?.cleanup_succeeded === true && tempPathAbsentOrEmpty,
  no_tracked_evidence: trackedEvidenceArtifacts.length === 0,
  no_implementation_modification: protectedSourceUnchanged,
  no_consumer: appOrLibConsumers.length === 0,
  no_runtime_artifacts: runtimeArtifacts.length === 0,
  no_effects: runnerReport?.confidence_application_created === false &&
    runnerReport?.persistence_executed === false &&
    runnerReport?.replay_executed === false &&
    runnerReport?.runtime_created === false &&
    runnerReport?.external_access_executed === false &&
    runnerReport?.feedback_created === false &&
    runnerReport?.recommendation_mutated === false &&
    runnerReport?.authoritative_data_created === false &&
    runnerReport?.deployment_result === "none",
  runtime_preview_untouched: runnerReport?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    manifest?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  final_decision_vocabulary: same(runnerReport?.decision_vocabulary, [
    "shadow_passed",
    "shadow_passed_with_conditions",
    "shadow_failed",
    "shadow_aborted",
  ]),
  action458_identified: runnerReport?.recommended_next_action === "action_458_independent_static_projection_shadow_verification" &&
    manifest?.mandatory_next_action === "action_458_independent_static_projection_shadow_verification",
};

const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  final_shadow_decision: runnerReport?.final_shadow_decision ?? "missing",
  scenario_count: runnerReport?.scenario_count ?? 0,
  projection_status_distribution: runnerReport?.projection_status_distribution ?? {},
  advisory_hash_classification_distribution: runnerReport?.advisory_hash_classification_distribution ?? {},
  warning_distribution: runnerReport?.warning_distribution ?? {},
  issue_distribution: runnerReport?.issue_distribution ?? {},
  confidence_effect_flag_result: runnerReport?.confidence_effect_flag_result ?? "missing",
  validation_precedence_result: runnerReport?.validation_precedence_result ?? "missing",
  phase_11_defense_result: runnerReport?.phase_11_defense_result ?? "missing",
  lineage_leakage_feedback_result: runnerReport?.lineage_leakage_feedback_result ?? "missing",
  warning_issue_no_adjustment_result: runnerReport?.warning_issue_no_adjustment_result ?? "missing",
  projection_id_hash_result: runnerReport?.projection_id_hash_result ?? "missing",
  manifest_sha256: runnerReport?.manifest_sha256 ?? null,
  action_454_package_inventory_sha256: runnerReport?.action_454_package_inventory_sha256 ?? null,
  action_454_repeat_payload_sha256: runnerReport?.action_454_repeat_payload_sha256 ?? null,
  run_1_package_hash: runnerReport?.run_1_package_hash ?? null,
  run_2_package_hash: runnerReport?.run_2_package_hash ?? null,
  repeat_run_identical: runnerReport?.repeat_run_identical ?? false,
  metadata_only_evidence: runnerReport?.metadata_only_evidence ?? false,
  temp_path_cleanup: runnerReport?.temp_path_cleanup ?? null,
  temp_path_absent_or_empty: tempPathAbsentOrEmpty,
  protected_hash_results: protectedHashResults,
  app_or_lib_consumers: appOrLibConsumers,
  runtime_artifacts: runtimeArtifacts,
  tracked_evidence_artifacts: trackedEvidenceArtifacts,
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
  runtime_preview_status: runnerReport?.runtime_preview_status ?? "missing",
  recommended_next_action: "action_458_independent_static_projection_shadow_verification",
  passed_conditions: Object.entries(checks).filter(([, passed]) => passed).map(([name]) => name),
  failed_conditions: failedConditions,
  unresolved_conditions: [],
  checks,
};

console.log(JSON.stringify(report, null, 2));

if (failedConditions.length > 0) {
  process.exitCode = 1;
}
