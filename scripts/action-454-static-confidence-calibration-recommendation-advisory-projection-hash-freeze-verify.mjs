#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

import {
  buildRepeatFreezeReport,
  canonicalize,
  expectedProtectedSourceHashes,
  expectedScenarioIds,
  expectedStatusDistribution,
  paths,
  stableHash,
} from "./action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

const expectedPackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedAdvisoryHashClassificationDistribution = {
  valid_advisory_hash: 42,
  malformed_hash: 1,
  swapped_hash: 1,
  unrelated_valid_format_hash: 1,
  retained_hash_tampering: 6,
  hash_role_substitution: 1,
};

function same(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function statusFiles() {
  const result = spawnSync("git", ["status", "--short"], { cwd: root, encoding: "utf8", maxBuffer: 80 * 1024 * 1024 });
  if (result.status !== 0) return [];
  return result.stdout
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
}

const requiredDocPhrases = [
  "Action 453 approved one future static fixture/hash-freeze package",
  "Runtime preview remains paused at `runtime_preview_waiting_for_operator_inputs`",
  "`ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072`",
  "No shadow runner.",
  "No Recommendation Engine consumer.",
  "No confidence application.",
  "No runtime route.",
  "No provider or Supabase access.",
  "`action_455_independent_projection_hash_freeze_verification`",
];

const allowedAuditFiles = new Set([
  paths.doc,
  paths.inventory,
  paths.freezer,
  paths.verifier,
  paths.test,
  "docs/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.md",
  "scripts/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification-verify.mjs",
  "tests/e2e/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.spec.ts",
  "docs/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.md",
  "scripts/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate-verify.mjs",
  "tests/e2e/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.spec.ts",
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.md",
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use-verify.mjs",
  "tests/e2e/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.spec.ts",
  "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.md",
  "scripts/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-verify.mjs",
  "tests/e2e/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.spec.ts",
  "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md",
  "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  "tests/e2e/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.spec.ts",
  "docs/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.md",
  "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
  "tests/e2e/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.spec.ts",
  paths.action453Doc,
  paths.action453Verifier,
  "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
  "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
  "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
  "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
  "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
  "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
  "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
  "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
  "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
  "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
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

const forbiddenShadowOrRuntime = [
  "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  "lib/confidence-calibration-recommendation-advisory-projection-consumer.ts",
  "lib/recommendation-engine-confidence-calibration-advisory-projection-consumer.ts",
  "app/api/confidence-calibration-recommendation-advisory-projection",
  "app/confidence-calibration-recommendation-advisory-projection",
  "app/api/action-454",
  "app/action-454",
  "public/action-454",
].filter(exists);

const doc = exists(paths.doc) ? read(paths.doc) : "";
const inventory = exists(paths.inventory) ? JSON.parse(read(paths.inventory)) : null;
const freezeReport = buildRepeatFreezeReport();
const regenerated = freezeReport.inventory;
const inventoryMatchesRegenerated = inventory !== null && same(inventory, regenerated);
const inventoryPayloadHash = inventory ? stableHash(inventory) : null;
const protectedHashReport = Object.fromEntries(Object.entries(expectedProtectedSourceHashes).map(([path, expected]) => [
  path,
  {
    expected,
    actual: exists(path) ? shaFile(path) : null,
    matches: exists(path) && shaFile(path) === expected,
  },
]));

const auditConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["scripts", "tests"],
).filter((path) => !allowedAuditFiles.has(path));
const appOrLibConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["app", "lib"],
).filter((path) => path !== paths.projection);
const deploymentFilesChanged = statusFiles().filter((path) =>
  path === "netlify.toml" ||
  path.startsWith(".netlify/") ||
  path.startsWith(".openai/") ||
  path.startsWith("app/api/") ||
  path.startsWith("app/action-454") ||
  path.startsWith("public/action-454")
);

const checks = {
  documentation_exists: exists(paths.doc),
  inventory_exists: exists(paths.inventory),
  freezer_exists: exists(paths.freezer),
  verifier_exists: exists(paths.verifier),
  test_exists: exists(paths.test),
  doc_contract_present: requiredDocPhrases.every((phrase) => doc.includes(phrase)),
  inventory_schema_version: inventory?.inventory_schema_version === "action_454_static_projection_hash_inventory_v1",
  scenario_count_exact: inventory?.scenario_count === 52,
  scenario_ids_exact: same(inventory?.exact_ids, expectedScenarioIds),
  status_distribution_exact: same(inventory?.exact_status_distribution, expectedStatusDistribution),
  advisory_hash_classification_distribution_exact: same(
    inventory?.advisory_hash_classification_distribution,
    expectedAdvisoryHashClassificationDistribution,
  ),
  package_hash_exact: inventory?.package_inventory_sha256 === expectedPackageHash,
  inventory_matches_regenerated_freeze: inventoryMatchesRegenerated,
  repeat_freeze_exactly_two_runs: freezeReport.repeat_freeze.run_count === 2,
  repeat_freeze_identical: freezeReport.repeat_freeze.identical === true,
  repeat_freeze_package_hash_exact: freezeReport.repeat_freeze.package_inventory_sha256 === expectedPackageHash,
  protected_hashes_match: Object.values(protectedHashReport).every((item) => item.matches),
  static_only: inventory?.static_only === true,
  non_production: inventory?.non_production === true,
  non_authoritative: inventory?.non_authoritative === true,
  non_learning: inventory?.non_learning === true,
  no_persistence: inventory?.no_persistence === true,
  no_replay: inventory?.no_replay === true,
  no_runtime: inventory?.no_runtime === true,
  no_external_access: inventory?.no_external_access === true,
  no_feedback: inventory?.no_feedback === true,
  recommendation_mutated_false: inventory?.recommendation_mutated === false,
  confidence_applied_false: inventory?.confidence_applied === false,
  projection_shadow_executed_false: inventory?.projection_shadow_executed === false,
  bounded_metadata_only: inventory?.bounded_metadata_only === true,
  no_full_recommendation_objects: inventory?.full_recommendation_objects_retained === false,
  no_full_advisory_objects: inventory?.full_advisory_objects_retained === false,
  runtime_preview_paused: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  all_scenarios_have_hashes: Array.isArray(inventory?.scenarios) &&
    inventory.scenarios.length === 52 &&
    inventory.scenarios.every((scenario) =>
      typeof scenario.scenario_summary_sha256 === "string" &&
      typeof scenario.canonical_projection_result_sha256 === "string" &&
      (scenario.actual.projection_id === null || typeof scenario.projection_identity_sha256 === "string")),
  successful_projection_ids_present: Array.isArray(inventory?.scenarios) &&
    inventory.scenarios.filter((scenario) => scenario.actual.projection_id !== null).length === 8,
  blocked_projection_ids_null: Array.isArray(inventory?.scenarios) &&
    inventory.scenarios.filter((scenario) => scenario.actual.projection_id === null).length === 44,
  no_shadow_or_runtime_artifacts: forbiddenShadowOrRuntime.length === 0,
  no_unexpected_audit_consumers: auditConsumers.length === 0,
  no_app_or_lib_consumers: appOrLibConsumers.length === 0,
  no_deployment_artifacts_changed: deploymentFilesChanged.length === 0,
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  failed_conditions: failedConditions,
  hash_freeze_result: failedConditions.length === 0 ? "frozen" : "blocked",
  scenario_count: inventory?.scenario_count ?? 0,
  exact_ids: inventory?.exact_ids ?? [],
  exact_status_distribution: inventory?.exact_status_distribution ?? {},
  advisory_hash_classification_distribution: inventory?.advisory_hash_classification_distribution ?? {},
  warning_distribution: inventory?.warning_distribution ?? {},
  issue_distribution: inventory?.issue_distribution ?? {},
  package_inventory_sha256: inventory?.package_inventory_sha256 ?? null,
  inventory_payload_sha256: inventoryPayloadHash,
  repeat_freeze: freezeReport.repeat_freeze,
  protected_hash_report: protectedHashReport,
  source_integrity: {
    protected_sources_unchanged: checks.protected_hashes_match,
    protected_paths: Object.keys(expectedProtectedSourceHashes),
  },
  bounded_metadata_result: checks.bounded_metadata_only ? "bounded_metadata_only" : "failed",
  isolation: {
    forbidden_shadow_or_runtime_artifacts: forbiddenShadowOrRuntime,
    unexpected_audit_consumers: auditConsumers,
    app_or_lib_consumers: appOrLibConsumers,
    deployment_files_changed: deploymentFilesChanged,
    no_runner_manifest_shadow: checks.no_shadow_or_runtime_artifacts,
    no_consumer_or_confidence_application: checks.no_app_or_lib_consumers && checks.confidence_applied_false,
  },
  safety: {
    provider_call_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    projection_shadow_executed: false,
    confidence_applied: false,
    recommendation_mutated: false,
    ranking_changed: false,
    scanner_changed: false,
    deployment_authorized: false,
  },
  runtime_preview_status: inventory?.runtime_preview_status ?? "missing",
  deployment_status: "not_authorized_not_required",
  recommended_next_action: inventory?.recommended_next_action ?? "action_455_independent_projection_hash_freeze_verification",
  unrelated_work_classification: "action_454_static_hash_freeze_only",
};

console.log(JSON.stringify(report, null, 2));

if (failedConditions.length > 0) {
  process.exitCode = 1;
}
