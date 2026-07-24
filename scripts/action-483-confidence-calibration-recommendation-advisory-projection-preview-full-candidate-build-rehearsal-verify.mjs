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
  fullHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  nextAction: "action_484_full_candidate_rehearsal_integrity_command_remediation_gate",
});

const expectedHashes = Object.freeze({
  package_json: "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
  package_lock: "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
  next_config: "614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc",
  typescript_config: "83b460dca7c269a562dba8f46d08de45397869b7ddbf31101eabca1a975eaa82",
  eslint_config: "53065bd014f2b6fb89dc5f1a84cd37053217cbec71be6f15c3958a3b3bc4143c",
  netlify_config: "7cc579b1e99306abc9f21c0340c5b7e94309567d7b86e2757ba996d2b414b1b7",
});

const paths = Object.freeze({
  doc:
    "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal.md",
  record:
    "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-record.json",
  action482:
    "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-record.json",
  action481:
    "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-approval-record.json",
  verifier:
    "scripts/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-verify.mjs",
  test:
    "tests/e2e/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal.spec.ts",
});

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action482 = exists(paths.action482) ? readJson(paths.action482) : {};
const action481 = exists(paths.action481) ? readJson(paths.action481) : {};

function hasAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function allFalse(object, keys) {
  return keys.every((key) => object?.[key] === false);
}

const localHashes = {
  package_json: exists("package.json") ? sha256("package.json") : null,
  package_lock: exists("package-lock.json") ? sha256("package-lock.json") : null,
  next_config: exists("next.config.ts") ? sha256("next.config.ts") : null,
  typescript_config: exists("tsconfig.json") ? sha256("tsconfig.json") : null,
  eslint_config: exists("eslint.config.mjs") ? sha256("eslint.config.mjs") : null,
  netlify_config: exists("netlify.toml") ? sha256("netlify.toml") : null,
};

const noEffectKeys = [
  "deployment_performed",
  "netlify_operation_performed",
  "preview_activated",
  "production_changed",
  "environment_modified",
  "confidence_applied",
  "persistence_created",
  "replay_created",
  "provider_call_executed",
  "supabase_access_created",
  "supabase_write_executed",
  "feedback_created",
  "downstream_behavior_changed",
  "ranking_changed",
  "scanner_changed",
  "publication_changed",
  "execution_changed",
  "add_trade_changed",
  "risk_sizing_changed",
];

const mutationKeys = [
  "package_manifest_modified",
  "lockfile_modified",
  "configuration_modified",
  "source_dependency_tree_modified",
  "candidate_source_modified",
  "unexpected_generated_tracked_files",
  "dependency_install_marker_detected",
  "environment_file_created",
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

const commandResults = Array.isArray(record.command_results) ? record.command_results : [];
const firstCommand = commandResults[0] ?? {};
const laterCommands = commandResults.slice(1);

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  documentation_contract:
    hasAll(doc, [
      "Action 483 constructed the isolated full candidate",
      "Rehearsal decision: `full_candidate_rehearsal_failed`",
      "candidate_integrity_command_setup_failed_before_build_test_commands",
      expected.nextAction,
    ]),
  action482_condition:
    action482.dependency_materialization_decision === "dependency_materialization_ready_with_conditions" &&
    action482.overall_readiness === "ready_with_conditions" &&
    action482.network_required === false &&
    action482.dependency_install_performed === false,
  action481_static:
    action481.approval_decision === "approved_with_conditions" &&
    action481.deployment_authorized === false &&
    action481.activation_authorized === false,
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullHash &&
    record.candidate_file_count === 30,
  package_config_hashes:
    Object.entries(expectedHashes).every(([key, value]) => localHashes[key] === value) &&
    record.package_json_hash_before === expectedHashes.package_json &&
    record.package_json_hash_after === expectedHashes.package_json &&
    record.package_lock_hash_before === expectedHashes.package_lock &&
    record.package_lock_hash_after === expectedHashes.package_lock &&
    record.next_config_hash_before === expectedHashes.next_config &&
    record.next_config_hash_after === expectedHashes.next_config &&
    record.typescript_config_hash_before === expectedHashes.typescript_config &&
    record.typescript_config_hash_after === expectedHashes.typescript_config &&
    record.eslint_config_hash_before === expectedHashes.eslint_config &&
    record.eslint_config_hash_after === expectedHashes.eslint_config &&
    record.netlify_config_hash_before === expectedHashes.netlify_config &&
    record.netlify_config_hash_after === expectedHashes.netlify_config,
  temp_safety_and_reconstruction:
    record.temporary_candidate_safety?.outside_repository === true &&
    record.temporary_candidate_safety?.outside_home_config === true &&
    record.temporary_candidate_safety?.absent_or_empty_before_use === true &&
    record.temporary_candidate_safety?.no_target_symlink === true &&
    record.candidate_reconstruction_result ===
      "temporary_candidate_constructed_from_clean_base_plus_approved_overlay" &&
    record.base_materialization_result === "git_archive_clean_base_materialized_without_broad_dirty_worktree" &&
    record.overlay_result === "exact_30_candidate_files_overlaid" &&
    record.overlaid_file_count === 30 &&
    record.unexpected_changed_files === 0 &&
    record.unrelated_post_trade_files === 0 &&
    record.environment_files === 0 &&
    record.secret_files === 0 &&
    record.merge_conflict_markers === 0,
  dependency_materialization:
    record.dependency_materialization_method === "temporary_verified_node_modules_copy" &&
    record.dependency_source_classification === "verified_existing_local_installation" &&
    record.dependency_copy_created === true &&
    record.dependency_copy_removed === true &&
    record.network_used === false &&
    record.install_performed === false &&
    record.dependency_update_performed === false &&
    record.install_lifecycle_triggered === false &&
    record.registry_access_performed === false &&
    record.candidate_inventory_includes_dependencies === false &&
    record.node_modules_tracked === false,
  extraneous_dependency_result:
    record.extraneous_local_package_count === 5 &&
    Array.isArray(record.extraneous_package_names_recorded) &&
    record.extraneous_package_names_recorded.length === 5 &&
    record.extraneous_packages_present_in_temporary_dependency_tree === false &&
    record.extraneous_dependency_influence_result ===
      "no_influence_detected_absent_from_temporary_dependency_tree",
  command_failure:
    record.candidate_integrity_result ===
      "failed_git_diff_check_equivalent_setup_pathspec_for_ignored_node_modules" &&
    firstCommand.name === "candidate_integrity_equivalent_to_git_diff_check" &&
    firstCommand.status === "failed" &&
    laterCommands.length > 0 &&
    laterCommands.every((command) => command.status === "not_run_due_prior_failure") &&
    record.serial_execution_result === "stopped_after_first_failed_temp_sensitive_command" &&
    record.same_action_retry_performed === false,
  runtime_and_flag:
    record.runtime_projection_call_site_count === 1 &&
    record.preview_flag_state === "disabled_by_policy_not_read_from_env" &&
    record.current_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  no_mutation: allFalse(record, mutationKeys),
  no_side_effects: allFalse(record, noEffectKeys),
  cleanup:
    record.cleanup_result === "temporary_candidate_and_dependency_copy_removed" &&
    record.temporary_candidate_absent_after_cleanup === true &&
    record.copied_dependencies_absent_after_cleanup === true &&
    record.build_output_retained === false &&
    record.credentials_retained === false &&
    record.environment_values_retained === false,
  decision:
    JSON.stringify(record.decision_vocabulary) ===
      JSON.stringify([
        "full_candidate_rehearsal_passed",
        "full_candidate_rehearsal_failed",
        "full_candidate_rehearsal_aborted",
      ]) &&
    record.rehearsal_decision === "full_candidate_rehearsal_failed" &&
    record.failure_classification === "candidate_integrity_command_setup_failed_before_build_test_commands" &&
    record.next_action === expected.nextAction,
  no_secret_or_path_values:
    !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)),
};

const failed_conditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failed_conditions.length === 0 ? "passed" : "failed",
  action_nature: record.action_nature ?? null,
  rehearsal_decision: record.rehearsal_decision ?? null,
  failure_classification: record.failure_classification ?? null,
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  dependency_materialization_method: record.dependency_materialization_method ?? null,
  extraneous_dependency_influence_result: record.extraneous_dependency_influence_result ?? null,
  candidate_integrity_result: record.candidate_integrity_result ?? null,
  command_results: commandResults.map((command) => ({
    name: command.name,
    status: command.status,
  })),
  cleanup_result: record.cleanup_result ?? null,
  next_action: record.next_action ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  local_hashes: localHashes,
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
