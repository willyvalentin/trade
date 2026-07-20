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
  action486RootCause: "temporary_candidate_realpath_comparison_used_noncanonical_prefix_boundary",
  nextAction: "action_488_source_safety_marker_classification_remediation_gate",
  runtimeState: "runtime_preview_waiting_for_operator_inputs",
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
    "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-temp-path-remediation.md",
  record:
    "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  action486:
    "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-record.json",
  action485:
    "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  verifier:
    "scripts/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-temp-path-remediation-verify.mjs",
  test:
    "tests/e2e/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-temp-path-remediation.spec.ts",
});

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action486 = exists(paths.action486) ? readJson(paths.action486) : {};
const action485 = exists(paths.action485) ? readJson(paths.action485) : {};

function hasAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function allFalse(object, keys) {
  return keys.every((key) => object?.[key] === false);
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
  "/private/var/",
  "/var/folders/",
];

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  action486_approval:
    action486.approval_decision === "approved" &&
    action486.root_cause_classification === expected.action486RootCause &&
    action486.next_action === "action_487_full_candidate_build_rehearsal_retry_after_temp_path_remediation" &&
    action486.deployment_performed === false &&
    action486.preview_activated === false,
  action485_aborted:
    action485.rehearsal_decision === "full_candidate_rehearsal_aborted" &&
    action485.abort_reason === "unsafe_temp_path" &&
    action485.safe_temp_path_failure_reason === "temporary_path_realpath_prefix_mismatch",
  documentation_contract:
    hasAll(doc, [
      "Action 487 executed exactly one local full-candidate rehearsal attempt",
      "The Action 487 path-safety phase passed",
      "blocked_by_secret_like_file_name_detection_before_source_only_integrity",
      "Rehearsal decision: `full_candidate_rehearsal_aborted`",
      expected.nextAction,
    ]),
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullHash &&
    record.candidate_file_count === 30,
  path_safety:
    record.canonical_temp_root_result === "passed" &&
    record.canonical_candidate_path_result === "passed" &&
    record.containment_result === "passed_path_relative_containment" &&
    record.macos_alias_handling_result === "canonicalized_runtime_temp_root_used" &&
    record.symlink_result === "passed" &&
    record.forbidden_root_result === "passed" &&
    record.path_safety_result === "passed" &&
    record.caller_controlled_path_used === false,
  source_construction:
    record.source_candidate_created === true &&
    record.source_candidate_constructed === true &&
    record.candidate_reconstruction_result ===
      "temporary_candidate_constructed_from_clean_base_plus_approved_overlay" &&
    record.base_materialization_result === "git_archive_clean_base_materialized_without_broad_dirty_worktree" &&
    record.overlay_result === "exact_30_candidate_files_overlaid" &&
    record.overlaid_file_count === 30,
  overlay_and_inventory:
    record.direct_overlay_hash_result ===
      "passed_for_29_explicit_hashes_one_prior_inventory_null_hash_preserved" &&
    record.direct_overlay_hashes_verified_count === 29 &&
    record.prior_inventory_null_hash_preserved_count === 1 &&
    record.source_inventory_result === "passed_bounded_git_head_plus_exact_overlay_inventory" &&
    record.unexpected_source_file_count === 0 &&
    record.missing_source_file_count === 0 &&
    record.merge_conflict_markers_detected === false &&
    record.environment_files_detected === false,
  source_safety_abort:
    record.secret_like_files_detected === true &&
    record.source_safety_marker_result ===
      "blocked_by_secret_like_file_name_detection_before_source_only_integrity" &&
    record.source_safety_marker_detection_scope ===
      "bounded_source_inventory_path_name_scan_no_file_contents_or_paths_recorded" &&
    record.candidate_defective === false &&
    record.source_only_integrity_result === "not_started" &&
    record.rehearsal_decision === "full_candidate_rehearsal_aborted" &&
    record.abort_reason === "source_safety_marker_detected",
  dependency_not_run:
    record.dependency_materialization_method === "temporary_verified_node_modules_copy" &&
    record.dependency_copy_result === "not_started" &&
    record.dependency_copy_created === false &&
    record.dependency_copy_removed === true &&
    record.extraneous_local_package_count === 5 &&
    record.extraneous_packages_excluded === false &&
    record.extraneous_dependency_influence_result === "not_evaluated",
  commands_not_started:
    record.command_inventory_result === "not_started" &&
    record.command_results?.length === 0 &&
    record.serial_commands_started === false &&
    record.no_parallel_temp_execution === true &&
    record.runtime_projection_call_site_count === null,
  package_config_hashes:
    Object.entries(expectedHashes).every(([file, value]) => localHashes[file] === value) &&
    Object.entries(expectedHashes).every(([file, value]) => record.package_hashes_before?.[file] === value) &&
    Object.entries(expectedHashes).every(([file, value]) => record.package_hashes_after?.[file] === value),
  no_mutation: allFalse(record, mutationKeys),
  no_effects: allFalse(record, noEffectKeys),
  source_node_modules_unchanged:
    record.source_node_modules_boundary_before?.exists === true &&
    record.source_node_modules_boundary_after?.exists === true &&
    record.source_node_modules_boundary_before?.package_json_count ===
      record.source_node_modules_boundary_after?.package_json_count &&
    record.source_node_modules_unchanged_bounded === true,
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
    JSON.stringify(record.decision_vocabulary) ===
      JSON.stringify([
        "full_candidate_rehearsal_passed",
        "full_candidate_rehearsal_failed",
        "full_candidate_rehearsal_aborted",
      ]) &&
    record.next_action === expected.nextAction,
  runtime_state:
    record.preview_flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED" &&
    record.preview_flag_state === "absent_or_disabled" &&
    record.preview_flag_enabled === false &&
    record.current_runtime_preview_state === expected.runtimeState,
  no_secret_or_path_values:
    !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)) &&
    !forbiddenRecordPhrases.some((phrase) => doc.toLowerCase().includes(phrase)),
};

const failed_conditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failed_conditions.length === 0 ? "passed" : "failed",
  action_nature: record.action_nature ?? null,
  rehearsal_decision: record.rehearsal_decision ?? null,
  abort_reason: record.abort_reason ?? null,
  path_safety_result: record.path_safety_result ?? null,
  source_safety_marker_result: record.source_safety_marker_result ?? null,
  dependency_copy_result: record.dependency_copy_result ?? null,
  command_inventory_result: record.command_inventory_result ?? null,
  cleanup_result: record.cleanup_result ?? null,
  next_action: record.next_action ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  local_hashes: localHashes,
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
