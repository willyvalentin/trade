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
  strategy: "baseline_plus_overlay_manifest_integrity",
  nextAction: "action_486_full_candidate_rehearsal_retry_abort_remediation_gate",
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
    "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry.md",
  record:
    "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  action484:
    "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-record.json",
  action483:
    "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-record.json",
  verifier:
    "scripts/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-verify.mjs",
  test:
    "tests/e2e/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry.spec.ts",
});

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action484 = exists(paths.action484) ? readJson(paths.action484) : {};
const action483 = exists(paths.action483) ? readJson(paths.action483) : {};

function allFalse(object, keys) {
  return keys.every((key) => object?.[key] === false);
}

function hasAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

const localHashes = Object.fromEntries(
  Object.keys(expectedHashes).map((file) => [file, exists(file) ? sha256(file) : null]),
);

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
  "candidate_source_modified",
  "source_dependency_tree_modified",
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

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  documentation_contract:
    hasAll(doc, [
      "Action 485 executed exactly one local full-candidate rehearsal attempt",
      "Rehearsal decision: `full_candidate_rehearsal_aborted`",
      "Abort reason: `unsafe_temp_path`",
      expected.nextAction,
    ]),
  action484_approval:
    action484.approval_decision === "approved" &&
    action484.approved_integrity_strategy === expected.strategy &&
    action484.node_modules_staged === false &&
    action484.invalid_pathspec_retained === false &&
    action484.dependency_method === "temporary_verified_node_modules_copy" &&
    action484.deployment_performed === false &&
    action484.preview_activated === false,
  action483_failed:
    action483.rehearsal_decision === "full_candidate_rehearsal_failed" &&
    action483.candidate_integrity_result ===
      "failed_git_diff_check_equivalent_setup_pathspec_for_ignored_node_modules",
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullHash &&
    record.candidate_file_count === 30,
  aborted_before_source:
    record.rehearsal_decision === "full_candidate_rehearsal_aborted" &&
    record.abort_reason === "unsafe_temp_path" &&
    record.safe_temp_path_result === "failed" &&
    record.safe_temp_path_failure_classification === "pre_source_construction_abort" &&
    record.source_candidate_constructed === false &&
    record.source_only_integrity_result === "not_run_due_unsafe_temp_path" &&
    record.command_results?.length === 0 &&
    record.serial_commands_started === false,
  source_integrity_policy_retained:
    record.integrity_strategy === expected.strategy &&
    record.node_modules_staged === false &&
    record.invalid_pathspec_used === false,
  dependency_policy_retained:
    record.dependency_materialization_method === "temporary_verified_node_modules_copy" &&
    record.dependency_copy_result === "not_run_due_unsafe_temp_path" &&
    record.dependency_copy_created === false &&
    record.dependency_copy_removed === true &&
    record.network_used === false &&
    record.install_performed === false &&
    record.dependency_update_performed === false &&
    record.lockfile_rewrite_detected === false &&
    record.package_manifest_rewrite_detected === false &&
    record.install_lifecycle_triggered === false &&
    record.registry_access_performed === false &&
    record.extraneous_local_package_count === 5,
  package_config_hashes:
    Object.entries(expectedHashes).every(([file, value]) => localHashes[file] === value) &&
    Object.entries(expectedHashes).every(([file, value]) => record.package_hashes_before?.[file] === value) &&
    Object.entries(expectedHashes).every(([file, value]) => record.package_hashes_after?.[file] === value),
  source_node_modules_unchanged:
    record.source_node_modules_boundary_before?.exists === true &&
    record.source_node_modules_boundary_after?.exists === true &&
    record.source_node_modules_boundary_before?.package_json_count ===
      record.source_node_modules_boundary_after?.package_json_count &&
    record.source_node_modules_unchanged_bounded === true,
  no_mutation: allFalse(record, mutationKeys),
  no_effects: allFalse(record, noEffectKeys),
  cleanup:
    record.cleanup_result === "temporary_candidate_and_dependency_copy_removed" &&
    record.temporary_candidate_absent_after_cleanup === true &&
    record.copied_dependencies_absent_after_cleanup === true &&
    record.build_output_retained === false &&
    record.credentials_retained === false &&
    record.environment_values_retained === false,
  attempt_and_next_action:
    record.rehearsal_attempt_count === 1 &&
    record.same_action_retry_performed === false &&
    JSON.stringify(record.rehearsal_decision_vocabulary) ===
      JSON.stringify([
        "full_candidate_rehearsal_passed",
        "full_candidate_rehearsal_failed",
        "full_candidate_rehearsal_aborted",
      ]) &&
    record.next_action === expected.nextAction,
  runtime_state:
    record.preview_flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED" &&
    record.preview_flag_enabled === false &&
    record.current_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
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
  abort_reason: record.abort_reason ?? null,
  safe_temp_path_failure_reason: record.safe_temp_path_failure_reason ?? null,
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  integrity_strategy: record.integrity_strategy ?? null,
  dependency_materialization_method: record.dependency_materialization_method ?? null,
  command_results_count: Array.isArray(record.command_results) ? record.command_results.length : null,
  cleanup_result: record.cleanup_result ?? null,
  rehearsal_attempt_count: record.rehearsal_attempt_count ?? null,
  next_action: record.next_action ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  local_hashes: localHashes,
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
