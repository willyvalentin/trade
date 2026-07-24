#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "fs";
import { homedir, tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-430-independent-static-confidence-calibration-shadow-verification.md",
  verifier: "scripts/action-430-independent-static-confidence-calibration-shadow-verification-verify.mjs",
  test: "tests/e2e/action-430-independent-static-confidence-calibration-shadow-verification.spec.ts",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  action428Verifier: "scripts/action-428-static-confidence-calibration-shadow-execution-approval-gate-verify.mjs",
  action429Verifier: "scripts/action-429-static-confidence-calibration-shadow-use-verify.mjs",
  action429Manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  action429Runner: "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
  action429Doc: "docs/action-429-static-confidence-calibration-shadow-use.md",
};

const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";
const expectedManifestSemanticHash = "99d492a606d1bdf651dff6f6c0eb4be8de6886d3cbd16f60dcc6d9bb5bce4f19";
const expectedPackageHash = "3bec2908f1c07da1fbdf2052f4e5cce4987f4d4a6589141dc94a29f34fa6c7ef";
const expectedScenarioIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
const expectedStatusDistribution = {
  calibrated: 14,
  calibrated_with_warnings: 11,
  no_adjustment: 5,
  blocked_invalid_input: 9,
  blocked_overlapping_evidence: 1,
  blocked_unsupported_insight: 1,
  blocked_invalid_lineage: 1,
  blocked_future_leakage: 1,
  blocked_invalid_configuration: 1,
  insufficient_eligible_evidence: 1,
};
const expectedWarningDistribution = {
  duplicate_mapper_row_identity: 4,
  metric_value_unavailable: 3,
  duplicate_insight_deduped: 1,
  overlapping_insight_excluded: 3,
  confidence_clamped_to_bounds: 2,
};
const expectedIssueDistribution = {
  warning_status_contradiction: 2,
  overlapping_evidence_conflict: 2,
  ineligible_pattern_discovery_status: 1,
  invalid_lineage: 1,
  future_leakage: 1,
  invalid_insight_structure: 1,
  invalid_configuration_shape: 1,
  invalid_base_confidence: 6,
  insufficient_eligible_evidence: 1,
};
const protectedFileHashes = {
  "lib/pure-confidence-calibration.ts": "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  "lib/pure-pattern-discovery.ts": "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json": "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs": "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
  "docs/action-426-static-confidence-calibration-hash-inventory.json": "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
  "scripts/action-426-static-confidence-calibration-hash-freeze.mjs": "f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa",
  [paths.action429Manifest]: "f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59",
  [paths.action429Runner]: "dd073134a96583caddae345c9c84be6bc4a327198c65aa29d8d191e4ea21b882",
  [paths.action429Doc]: "3b0dd01f11435d4c7bbe4911a571a7de70a401863d0c61593aa6ecf97acc826e",
  [paths.action429Verifier]: "79705540adf2914f813d7bde00df7ce4ef1e299c910cae67e8af477a746ee524",
  "tests/e2e/action-429-static-confidence-calibration-shadow-use.spec.ts": "5d44964384cc9557586d86790cc82c3aa3285cb7837750c8cfed7cd3b92deaae",
};
const allowedAction430Files = [
  paths.doc,
  paths.verifier,
  paths.test,
];
const allowedAction429Files = [
  paths.action429Manifest,
  paths.action429Runner,
  paths.action429Doc,
  paths.action429Verifier,
  "tests/e2e/action-429-static-confidence-calibration-shadow-use.spec.ts",
];
const readinessVocabulary = ["ready", "ready_with_conditions", "blocked"];
const forbiddenEvidencePatterns = [
  /action-430.*evidence/i,
  /action-430.*output/i,
  /action-430.*result/i,
  /confidence-calibration-shadow-evidence/i,
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaText = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const shaFile = (path) => shaText(read(path));

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_canonical_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_canonical_value");
}

function stableHash(value) {
  return shaText(JSON.stringify(canonicalize(value)));
}

function exactObject(actual, expected) {
  return JSON.stringify(Object.fromEntries(Object.entries(actual ?? {}).sort())) ===
    JSON.stringify(Object.fromEntries(Object.entries(expected).sort()));
}

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => {
    if (entry === ".git" || entry === ".next" || entry === "node_modules") return [];
    return collectFiles(join(path, entry));
  }).sort();
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function hashFiles() {
  return Object.fromEntries(
    Object.entries(protectedFileHashes).map(([path, expected]) => {
      const actual = exists(path) ? shaFile(path) : null;
      return [path, { expected, actual, exists: actual !== null, matches_expected: actual === expected }];
    }),
  );
}

function scenarioById(manifest, id) {
  return manifest.scenarios.find((scenario) => scenario.scenario_id === id);
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const manifest = exists(paths.action429Manifest) ? JSON.parse(read(paths.action429Manifest)) : null;
const action429RunnerText = exists(paths.action429Runner) ? read(paths.action429Runner) : "";
const beforeHashes = hashFiles();
const action429Run = exists(paths.action429Runner) ? runJson(paths.action429Runner) : null;
const afterHashes = hashFiles();
const action428 = exists(paths.action428Verifier) ? runJson(paths.action428Verifier) : null;
const action429 = exists(paths.action429Verifier) ? runJson(paths.action429Verifier) : null;
const action309 = exists(paths.action309Guard) ? runJson(paths.action309Guard) : null;
const golden = exists(paths.goldenVerifier) ? runJson(paths.goldenVerifier) : null;
const manifestScenarios = manifest?.scenarios ?? [];
const baseConfidenceInventory = [...new Set(
  manifestScenarios.map((scenario) => String(scenario.base_confidence?.canonical_basis_points)),
)].sort((left, right) => left.localeCompare(right));
const action429Files = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-429/i.test(path));
const action430Files = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-430/i.test(path));
const unapprovedAction429Files = action429Files.filter((path) => !allowedAction429Files.includes(path));
const unapprovedAction430Files = action430Files.filter((path) => !allowedAction430Files.includes(path));
const trackedEvidenceFiles = [...action429Files, ...action430Files]
  .filter((path) => forbiddenEvidencePatterns.some((pattern) => pattern.test(path)));
const tempDirectory = resolve(tmpdir(), "ture/action-429-static-confidence-calibration-shadow");
const tempEvidenceRemaining = existsSync(tempDirectory);
const calibrationIdPattern = /^confidence_calibration_v1:[a-f0-9]{24}$/;
const hashPattern = /^[a-f0-9]{64}$/;

const { assertSafeTempDirectory } = exists(paths.action429Runner)
  ? await import(pathToFileURL(abs(paths.action429Runner)).href)
  : { assertSafeTempDirectory: null };
function rejectsTempPath(candidate) {
  if (!assertSafeTempDirectory) return false;
  try {
    assertSafeTempDirectory(candidate);
    return false;
  } catch {
    return true;
  }
}

const tempProbeRoot = resolve(tmpdir(), "ture-action-430-temp-path-probes");
rmSync(tempProbeRoot, { recursive: true, force: true });
mkdirSync(tempProbeRoot, { recursive: true });
const unsafeFile = join(tempProbeRoot, "unsafe-file");
writeFileSync(unsafeFile, "not a directory\n");
const nonEmptyDirectory = join(tempProbeRoot, "non-empty");
mkdirSync(nonEmptyDirectory, { recursive: true });
writeFileSync(join(nonEmptyDirectory, "child"), "not empty\n");
const symlinkTarget = join(tempProbeRoot, "target");
mkdirSync(symlinkTarget, { recursive: true });
const symlinkPath = join(tempProbeRoot, "link");
symlinkSync(symlinkTarget, symlinkPath);
const danglingSymlinkPath = join(tempProbeRoot, "dangling");
symlinkSync(join(tempProbeRoot, "missing-target"), danglingSymlinkPath);
const symlinkParentPath = join(tempProbeRoot, "parent-link");
symlinkSync(symlinkTarget, symlinkParentPath);
const tempPathSafety = {
  repository_path_rejected: rejectsTempPath(resolve(root, ".tmp-action-430")),
  home_path_rejected: rejectsTempPath(resolve(homedir(), "action-430")),
  target_symlink_rejected: rejectsTempPath(symlinkPath),
  dangling_symlink_rejected: rejectsTempPath(danglingSymlinkPath),
  parent_chain_symlink_rejected: rejectsTempPath(join(symlinkParentPath, "child")),
  unsafe_file_rejected: rejectsTempPath(unsafeFile),
  non_empty_directory_rejected: rejectsTempPath(nonEmptyDirectory),
  path_traversal_guard_covered: action429RunnerText.includes("unsafe_output_path_traversal"),
  app_data_path_guard_covered: action429RunnerText.includes("unsafe_output_home_or_config_path") &&
    action429RunnerText.includes("unsafe_output_repository_path"),
};
rmSync(tempProbeRoot, { recursive: true, force: true });

const completeIssueRecords = manifestScenarios.flatMap((scenario) =>
  (scenario.complete_issue_inventory ?? []).map((issue) => ({ scenario_id: scenario.scenario_id, ...issue })));
const expectedIssueCount = Object.values(expectedIssueDistribution).reduce((sum, count) => sum + count, 0);
const representativeChecks = {
  supportive_delta_table: scenarioById(manifest, "cc425_01")?.post_cap_aggregate_delta_basis_points === 200 &&
    scenarioById(manifest, "cc425_02")?.post_cap_aggregate_delta_basis_points === 100 &&
    scenarioById(manifest, "cc425_03")?.post_cap_aggregate_delta_basis_points === 50,
  adverse_delta_table: scenarioById(manifest, "cc425_06")?.post_cap_aggregate_delta_basis_points === -100 &&
    scenarioById(manifest, "cc425_07")?.post_cap_aggregate_delta_basis_points === -200 &&
    scenarioById(manifest, "cc425_08")?.post_cap_aggregate_delta_basis_points === -300,
  attenuation_and_duplicate_warnings: ["cc425_09", "cc425_10", "cc425_11", "cc425_12", "cc425_13"]
    .every((id) => scenarioById(manifest, id)?.status === "calibrated_with_warnings"),
  positive_and_negative_caps: scenarioById(manifest, "cc425_16")?.post_cap_aggregate_delta_basis_points === 400 &&
    scenarioById(manifest, "cc425_17")?.post_cap_aggregate_delta_basis_points === -600,
  upper_and_lower_clamps: scenarioById(manifest, "cc425_29")?.clamping_state?.warning_code === "confidence_clamped_to_bounds" &&
    scenarioById(manifest, "cc425_31")?.clamping_state?.warning_code === "confidence_clamped_to_bounds",
  overlap_and_conflict: scenarioById(manifest, "cc425_23")?.complete_warning_inventory?.some((warning) => warning.code === "duplicate_insight_deduped") &&
    scenarioById(manifest, "cc425_27")?.status === "blocked_overlapping_evidence",
  zero_adjustments: ["cc425_04", "cc425_05", "cc425_20", "cc425_32", "cc425_33"]
    .every((id) => scenarioById(manifest, id)?.status === "no_adjustment"),
};
const consumerFiles = ["app", "proxy.ts", "middleware.ts", "middleware.js"].flatMap((path) =>
  collectFiles(path).filter((file) => {
    const text = read(file);
    return text.includes("pure-confidence-calibration") ||
      text.includes("calibrateConfidence") ||
      text.includes("action-429-static-confidence-calibration") ||
      text.includes("action-430-independent-static-confidence-calibration");
  }));

const checks = {
  documentation_exists: exists(paths.doc) &&
    doc.includes("Action 430 - Independent Static Confidence Calibration Shadow Verification"),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action429_package_immutable_boundary: unapprovedAction429Files.length === 0 &&
    unapprovedAction430Files.length === 0,
  protected_hashes_match_before_and_after: Object.values(beforeHashes).every((entry) => entry.matches_expected) &&
    Object.entries(afterHashes).every(([path, entry]) =>
      entry.matches_expected && entry.actual === beforeHashes[path]?.actual),
  action429_manifest_file_hash_bound: beforeHashes[paths.action429Manifest]?.matches_expected === true,
  action429_runner_file_hash_bound: beforeHashes[paths.action429Runner]?.matches_expected === true,
  action_426_inventory_binding: manifest?.action_426_inventory_sha256 === expectedInventoryHash &&
    action429Run?.source_integrity?.["docs/action-426-static-confidence-calibration-hash-inventory.json"]?.matches === true,
  manifest_semantic_hash_exact: manifest ? stableHash(manifest) === expectedManifestSemanticHash &&
    action429Run?.manifest_sha256 === expectedManifestSemanticHash : false,
  exact_45_scenarios_and_order: manifest?.scenario_count === 45 &&
    manifestScenarios.length === 45 &&
    action429Run?.scenario_count === 45 &&
    JSON.stringify(manifest?.scenario_ids ?? []) === JSON.stringify(expectedScenarioIds) &&
    JSON.stringify(action429Run?.scenario_ids ?? []) === JSON.stringify(expectedScenarioIds),
  configuration_and_source_classification: manifest?.configuration?.configuration_version === "confidence_calibration_config_v1" &&
    manifest?.source_classifications?.includes("deterministic_test_local_confidence_calibration_insight_envelope") &&
    manifestScenarios.every((scenario) => scenario.source_classification === "deterministic_test_local_confidence_calibration_insight_envelope"),
  base_confidence_inventory_bound: JSON.stringify(baseConfidenceInventory) === JSON.stringify([
    "-1",
    "0",
    "100",
    "10000",
    "10001",
    "50",
    "50.00",
    "5000",
    "5000.1",
    "9800",
    "9900",
    "Infinity",
    "NaN",
  ]),
  insight_envelope_metadata_bounded: manifestScenarios.every((scenario) =>
    scenario.source_classification === "deterministic_test_local_confidence_calibration_insight_envelope" &&
    scenario.insight_inventory.every((insight) =>
      insight.static_only === true &&
      insight.non_authoritative === true &&
      insight.no_persistence === true &&
      insight.no_replay === true &&
      insight.no_runtime === true &&
      insight.no_feedback === true)),
  final_shadow_decision: action429Run?.final_shadow_decision === "shadow_passed",
  exactly_two_runs: action429RunnerText.includes('executePackage(manifest, "run_1")') &&
    action429RunnerText.includes('executePackage(manifest, "run_2")') &&
    !action429RunnerText.includes('"run_3"') &&
    !action429RunnerText.includes("retry"),
  repeat_run_package_hashes: action429Run?.repeat_run_identical === true &&
    action429Run?.run_1_package_sha256 === expectedPackageHash &&
    action429Run?.run_2_package_sha256 === expectedPackageHash,
  status_distribution_exact: exactObject(action429Run?.status_distribution, expectedStatusDistribution),
  warning_distribution_exact: exactObject(action429Run?.warning_distribution, expectedWarningDistribution),
  issue_distribution_exact: exactObject(action429Run?.issue_distribution, expectedIssueDistribution),
  complete_issue_metadata_exact: completeIssueRecords.length === expectedIssueCount &&
    completeIssueRecords.every((issue) =>
      issue.path?.startsWith("/") &&
      issue.severity === "error" &&
      issue.messageKey === `confidence_calibration.${issue.code}`) &&
    action429Run?.complete_issue_metadata_matched === true,
  representative_delta_cap_clamp_overlap_zero: Object.values(representativeChecks).every(Boolean) &&
    action429Run?.delta_cap_clamp_overlap_result === "matched",
  calibration_ids_and_hashes: manifestScenarios.every((scenario) =>
    scenario.calibration_id === null || calibrationIdPattern.test(scenario.calibration_id)) &&
    manifestScenarios.every((scenario) =>
      [scenario.identity_sha256, scenario.independent_identity_sha256, scenario.canonical_result_sha256, scenario.scenario_summary_sha256]
        .every((hash) => hash === null || hashPattern.test(hash))) &&
    action429Run?.calibration_id_and_semantic_hash_result === "matched",
  metadata_boundary: action429Run?.metadata_only_evidence_verified === true &&
    manifest?.full_insights_retained === false &&
    manifest?.full_pattern_discovery_results_retained === false &&
    manifest?.recommendation_objects_retained === false,
  temp_path_safety: Object.values(tempPathSafety).every(Boolean),
  cleanup_and_no_tracked_evidence: action429Run?.temporary_evidence_deleted === true &&
    action429Run?.temporary_output_exists_after_cleanup === false &&
    tempEvidenceRemaining === false &&
    trackedEvidenceFiles.length === 0,
  no_runtime_persistence_replay_external_feedback: action429Run?.persistence_result === "none" &&
    action429Run?.replay_result === "none" &&
    action429Run?.runtime_result === "none" &&
    action429Run?.external_access_result === "none" &&
    action429Run?.feedback_result === "none" &&
    action429Run?.provider_call_executed === false &&
    action429Run?.supabase_read_executed === false &&
    action429Run?.supabase_write_executed === false,
  no_recommendation_mutation_or_authoritative_data: action429Run?.recommendation_mutated === false &&
    action429Run?.authoritative_data_created === false,
  consumer_inventory_zero: consumerFiles.length === 0,
  upstream_action428_healthy: action428?.verification_status === "passed",
  upstream_action429_healthy: action429?.verification_status === "passed",
  action309_guard_healthy: action309?.guard_status === "passed",
  golden_static_safety_healthy: golden?.verification_status === "passed",
  runtime_preview_paused: action429Run?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  readiness_vocabulary_exact: doc.includes("ready") &&
    doc.includes("ready_with_conditions") &&
    doc.includes("blocked"),
  next_action_identified: doc.includes("action_431_static_confidence_calibration_shadow_readiness_gate"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);
const unresolvedConditions = [];
const readinessDecision = failedConditions.length > 0
  ? "blocked"
  : unresolvedConditions.length > 0
    ? "ready_with_conditions"
    : "ready";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: readinessVocabulary,
  checks,
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: unresolvedConditions.length,
  action429_reproduction: {
    final_shadow_decision: action429Run?.final_shadow_decision ?? "unknown",
    scenario_count: action429Run?.scenario_count ?? 0,
    run_1_package_sha256: action429Run?.run_1_package_sha256 ?? null,
    run_2_package_sha256: action429Run?.run_2_package_sha256 ?? null,
    repeat_run_identical: action429Run?.repeat_run_identical === true,
  },
  manifest_integrity: {
    action_426_inventory_sha256: manifest?.action_426_inventory_sha256 ?? null,
    expected_action_426_inventory_sha256: expectedInventoryHash,
    manifest_semantic_sha256: manifest ? stableHash(manifest) : null,
    expected_manifest_semantic_sha256: expectedManifestSemanticHash,
    manifest_file_sha256: beforeHashes[paths.action429Manifest]?.actual ?? null,
    expected_manifest_file_sha256: protectedFileHashes[paths.action429Manifest],
  },
  package_integrity: {
    action429_runner_file_sha256: beforeHashes[paths.action429Runner]?.actual ?? null,
    expected_action429_runner_file_sha256: protectedFileHashes[paths.action429Runner],
    before_hashes: beforeHashes,
    after_hashes: afterHashes,
  },
  scenario_count: action429Run?.scenario_count ?? 0,
  scenario_ids: action429Run?.scenario_ids ?? [],
  status_distribution: action429Run?.status_distribution ?? {},
  warning_distribution: action429Run?.warning_distribution ?? {},
  issue_distribution: action429Run?.issue_distribution ?? {},
  complete_issue_metadata_matched: action429Run?.complete_issue_metadata_matched === true,
  complete_warning_metadata_matched: action429Run?.complete_warning_metadata_matched === true,
  representative_checks: representativeChecks,
  delta_cap_clamp_overlap_zero_result: action429Run?.delta_cap_clamp_overlap_result ?? "unknown",
  calibration_id_and_semantic_hash_result: action429Run?.calibration_id_and_semantic_hash_result ?? "unknown",
  exactly_two_runs: checks.exactly_two_runs,
  package_hash: expectedPackageHash,
  metadata_only_evidence_verified: action429Run?.metadata_only_evidence_verified === true,
  temp_path_safety: tempPathSafety,
  cleanup: {
    temporary_evidence_deleted: action429Run?.temporary_evidence_deleted === true,
    temporary_output_exists_after_cleanup: action429Run?.temporary_output_exists_after_cleanup ?? null,
    temp_evidence_remaining: tempEvidenceRemaining,
    tracked_evidence_files: trackedEvidenceFiles,
  },
  isolation: {
    production_consumer_files: consumerFiles,
    persistence_result: action429Run?.persistence_result ?? "unknown",
    replay_result: action429Run?.replay_result ?? "unknown",
    runtime_result: action429Run?.runtime_result ?? "unknown",
    external_access_result: action429Run?.external_access_result ?? "unknown",
    feedback_result: action429Run?.feedback_result ?? "unknown",
    provider_call_executed: action429Run?.provider_call_executed ?? true,
    supabase_read_executed: action429Run?.supabase_read_executed ?? true,
    supabase_write_executed: action429Run?.supabase_write_executed ?? true,
    recommendation_mutated: action429Run?.recommendation_mutated ?? true,
    authoritative_data_created: action429Run?.authoritative_data_created ?? true,
  },
  runtime_preview_status: action429Run?.runtime_preview_status ?? "unknown",
  unrelated_work_classification: "action_430_independent_static_confidence_calibration_shadow_verification_only",
  recommended_next_action: "action_431_static_confidence_calibration_shadow_readiness_gate",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (failedConditions.length > 0) process.exitCode = 1;
