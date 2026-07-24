#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const sha256 = (path) => createHash("sha256").update(read(path)).digest("hex");

const expected = Object.freeze({
  base: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  candidateHash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  fullCandidateHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  nextAction: "action_483_full_candidate_build_rehearsal_with_bounded_dependency_materialization",
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
});

const expectedHashes = Object.freeze({
  "package.json": "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
  "package-lock.json": "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
  "next.config.ts": "614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc",
  "tsconfig.json": "83b460dca7c269a562dba8f46d08de45397869b7ddbf31101eabca1a975eaa82",
  "eslint.config.mjs": "53065bd014f2b6fb89dc5f1a84cd37053217cbec71be6f15c3958a3b3bc4143c",
  "netlify.toml": "7cc579b1e99306abc9f21c0340c5b7e94309567d7b86e2757ba996d2b414b1b7",
});

const paths = Object.freeze({
  doc:
    "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-completion-gate.md",
  record:
    "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-record.json",
  action481:
    "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-approval-record.json",
  action480:
    "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-record.json",
  test:
    "tests/e2e/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-completion-gate.spec.ts",
  verifier:
    "scripts/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-completion-gate-verify.mjs",
});

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action481 = exists(paths.action481) ? readJson(paths.action481) : {};
const action480 = exists(paths.action480) ? readJson(paths.action480) : {};
const packageJson = exists("package.json") ? readJson("package.json") : { dependencies: {}, devDependencies: {} };
const packageLock = exists("package-lock.json") ? readJson("package-lock.json") : { packages: {} };

const localHashes = Object.fromEntries(
  Object.keys(expectedHashes).map((path) => [path, exists(path) ? sha256(path) : null]),
);
const declaredDeps = {
  ...(packageJson.dependencies ?? {}),
  ...(packageJson.devDependencies ?? {}),
};
const missingTopLevelFromLock = Object.keys(declaredDeps).filter(
  (name) => !packageLock.packages?.[`node_modules/${name}`],
);

function hasAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function allFalse(object, keys) {
  return keys.every((key) => object?.[key] === false);
}

const requiredBinaryPaths = {
  next: "node_modules/.bin/next",
  typescript: "node_modules/.bin/tsc",
  eslint: "node_modules/.bin/eslint",
  playwright: "node_modules/.bin/playwright",
};
const localBinaryPresence = Object.fromEntries(
  Object.entries(requiredBinaryPaths).map(([name, path]) => [name, exists(path)]),
);

const noEffectKeys = [
  "network_step_authorized",
  "deployment_performed",
  "netlify_operation_performed",
  "preview_activated",
  "environment_modified",
  "preview_flag_enabled",
  "production_changed",
  "confidence_applied",
  "feedback_created",
  "recommendation_mutated",
  "ranking_changed",
  "scanner_changed",
  "publication_changed",
  "execution_changed",
  "add_trade_changed",
  "risk_sizing_changed",
  "provider_call_executed",
  "supabase_access_created",
  "supabase_write_executed",
  "persistence_created",
  "replay_created",
];

const noInstallKeys = [
  "network_required",
  "dependency_install_performed",
  "dependency_update_performed",
  "lockfile_modified",
  "package_manifest_modified",
  "install_lifecycle_triggered",
  "registry_access_performed",
  "package_cache_contents_inspected",
  "dependency_contents_recorded",
  "dependency_paths_recorded",
  "absolute_machine_paths_recorded",
  "credential_value_recorded",
  "environment_value_recorded",
  "registry_token_recorded",
];

const forbiddenRecordPhrases = [
  "authorization:",
  "bearer ",
  "cookie:",
  "password:",
  "api_key:",
  "apikey:",
  "private_key:",
  "npm_token",
  "admin.netlify.com",
  "/users/",
  "/node_modules/",
];

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  documentation_contract:
    hasAll(doc, [
      "Action 482 verifies whether the current local dependency installation can support",
      "Dependency decision: `dependency_materialization_ready_with_conditions`",
      expected.nextAction,
      "Runtime preview remains `runtime_preview_waiting_for_operator_inputs`",
    ]),
  action481_approval:
    action481.approval_decision === "approved_with_conditions" &&
    action481.next_action === "action_482_dependency_materialization_completion_gate" &&
    action481.deployment_authorized === false &&
    action481.activation_authorized === false &&
    action481.network_step_authorized === false,
  action480_remains_aborted:
    action480.deployment_result === "deployment_aborted" &&
    action480.deployment_attempt_count === 0 &&
    action480.preview_activated === false &&
    action480.netlify_cli_invoked === false,
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash &&
    record.candidate_file_count === 30,
  package_config_hashes:
    Object.entries(expectedHashes).every(([path, hash]) => localHashes[path] === hash) &&
    record.package_json_hash === expectedHashes["package.json"] &&
    record.package_lock_hash === expectedHashes["package-lock.json"] &&
    record.next_config_hash === expectedHashes["next.config.ts"] &&
    record.typescript_config_hash === expectedHashes["tsconfig.json"] &&
    record.eslint_config_hash === expectedHashes["eslint.config.mjs"] &&
    record.netlify_config_hash === expectedHashes["netlify.toml"] &&
    record.package_manifest_unchanged === true &&
    record.package_lock_unchanged === true &&
    record.configuration_hashes_unchanged === true,
  local_dependency_presence:
    exists("node_modules") &&
    record.local_dependency_tree_present === true &&
    record.required_local_binaries_present === true &&
    Object.values(localBinaryPresence).every(Boolean) &&
    Object.entries(record.required_local_binaries ?? {}).every(([, present]) => present === true),
  top_level_compatibility:
    Object.keys(declaredDeps).length === 15 &&
    missingTopLevelFromLock.length === 0 &&
    record.top_level_dependency_count === 15 &&
    record.top_level_dependencies_missing_from_lockfile_count === 0 &&
    record.npm_ls_depth_0_exit_code === 0 &&
    record.npm_ls_depth_0_problem_count === 5 &&
    record.npm_ls_depth_0_extraneous_problem_count === 5 &&
    record.top_level_dependency_check_result ===
      "required_top_level_dependencies_present_npm_ls_reported_extraneous_local_packages",
  no_network_install_or_mutation: allFalse(record, noInstallKeys),
  materialization_method:
    record.dependency_materialization_method ===
      "read_only_local_node_modules_reuse_or_temporary_verified_copy" &&
    record.preferred_dependency_materialization_method === "read_only_local_node_modules_reuse" &&
    record.dependency_source_classification === "verified_existing_local_installation" &&
    record.dependency_boundary_read_only === false &&
    record.dependency_boundary_read_only_status === "requires_action_483_implementation_proof" &&
    record.temporary_dependency_copy_allowed_if_read_only_link_not_practical === true &&
    record.candidate_inventory_includes_dependencies === false &&
    record.node_modules_tracked === false,
  temporary_path_policy:
    typeof record.temporary_path_policy?.path_template === "string" &&
    record.temporary_path_policy.path_template.includes(
      "action-483-confidence-calibration-projection-preview-full-candidate-rehearsal",
    ) &&
    record.temporary_path_policy?.dependency_link_or_copy_inside_temp_candidate_boundary_only === true &&
    record.temporary_path_policy?.symlink_traversal_allowed === false &&
    record.temporary_path_policy?.parent_chain_symlink_allowed === false &&
    record.temporary_path_policy?.link_to_home_config_allowed === false &&
    record.temporary_path_policy?.link_to_credential_stores_allowed === false &&
    record.temporary_path_policy?.cleanup_after_rehearsal_required === true,
  source_mutation_and_cleanup:
    record.source_mutation_protection?.before_after_hashes_match === true &&
    record.source_mutation_protection?.package_json_hash_unchanged_after_dependency_check === true &&
    record.source_mutation_protection?.package_lock_hash_unchanged_after_dependency_check === true &&
    record.source_mutation_protection?.config_hashes_unchanged_after_dependency_check === true &&
    record.source_mutation_protection?.node_modules_full_hash_required === false &&
    record.cleanup_policy?.action_482_created_temporary_candidate === false &&
    record.cleanup_policy?.action_482_created_dependency_copy === false &&
    record.cleanup_policy?.future_cleanup_removes_temporary_link_or_copy_only === true &&
    record.cleanup_policy?.future_cleanup_must_not_remove_source_dependency_tree === true,
  vocabulary_and_decision:
    JSON.stringify(record.decision_vocabulary) ===
      JSON.stringify([
        "dependency_materialization_ready",
        "dependency_materialization_ready_with_conditions",
        "dependency_materialization_blocked",
      ]) &&
    JSON.stringify(record.overall_readiness_vocabulary) ===
      JSON.stringify(["ready", "ready_with_conditions", "blocked"]) &&
    record.dependency_materialization_decision === "dependency_materialization_ready_with_conditions" &&
    record.overall_readiness === "ready_with_conditions" &&
    Array.isArray(record.unresolved_conditions) &&
    record.unresolved_conditions.includes(
      "action_483_must_choose_and_prove_read_only_link_or_bounded_temporary_copy_strategy",
    ) &&
    Array.isArray(record.invalid_conditions) &&
    record.invalid_conditions.length === 0 &&
    record.next_action === expected.nextAction,
  no_effects:
    allFalse(record, noEffectKeys) &&
    record.preview_flag_name === expected.flagName &&
    record.preview_flag_required_state === "absent_or_disabled" &&
    record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  no_secret_or_path_values:
    !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)),
};

const failed_conditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failed_conditions.length === 0 ? "passed" : "failed",
  action_nature: record.action_nature ?? null,
  dependency_materialization_decision: record.dependency_materialization_decision ?? null,
  overall_readiness: record.overall_readiness ?? null,
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  local_dependency_tree_present: record.local_dependency_tree_present ?? null,
  required_local_binaries_present: record.required_local_binaries_present ?? null,
  top_level_dependency_check_result: record.top_level_dependency_check_result ?? null,
  dependency_materialization_method: record.dependency_materialization_method ?? null,
  network_required: record.network_required ?? null,
  dependency_install_performed: record.dependency_install_performed ?? null,
  lockfile_modified: record.lockfile_modified ?? null,
  package_manifest_modified: record.package_manifest_modified ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  next_action: record.next_action ?? null,
  local_hashes: localHashes,
  local_binary_presence: localBinaryPresence,
  missing_top_level_from_lockfile_count: missingTopLevelFromLock.length,
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
