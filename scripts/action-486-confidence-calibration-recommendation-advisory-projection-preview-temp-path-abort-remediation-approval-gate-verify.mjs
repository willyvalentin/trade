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
  rootCause: "temporary_candidate_realpath_comparison_used_noncanonical_prefix_boundary",
  nextAction: "action_487_full_candidate_build_rehearsal_retry_after_temp_path_remediation",
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
    "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-gate.md",
  record:
    "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-record.json",
  action485:
    "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  action484:
    "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-record.json",
  verifier:
    "scripts/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-gate.spec.ts",
});

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action485 = exists(paths.action485) ? readJson(paths.action485) : {};
const action484 = exists(paths.action484) ? readJson(paths.action484) : {};

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
  "rehearsal_performed",
  "deployment_authorized",
  "deployment_performed",
  "activation_authorized",
  "preview_activated",
  "environment_modified",
  "netlify_operation_performed",
  "provider_call_executed",
  "supabase_access_created",
  "supabase_write_executed",
  "persistence_created",
  "replay_created",
  "confidence_applied",
  "feedback_created",
  "downstream_behavior_changed",
  "scanner_changed",
  "ranking_changed",
  "publication_changed",
  "execution_changed",
  "add_trade_changed",
  "risk_sizing_changed",
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
];

const acceptedTests = [
  "canonical_temp_child",
  "macos_var_input_resolves_to_private_var",
  "already_canonical_private_var",
  "absent_target",
  "empty_safe_target",
];

const rejectedTests = [
  "candidate_equals_temp_root",
  "sibling_textual_prefix_path",
  "dotdot_traversal",
  "absolute_escape",
  "repository_path",
  "home_path",
  "config_path",
  "application_data_path",
  "source_node_modules_path",
  "target_symlink",
  "dangling_symlink",
  "nested_parent_symlink",
  "non_empty_target",
  "wrong_action_number_or_path",
  "caller_controlled_path_override",
  "cleanup_target_outside_approved_subtree",
];

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  action485_aborted_result:
    action485.rehearsal_decision === "full_candidate_rehearsal_aborted" &&
    action485.abort_reason === "unsafe_temp_path" &&
    action485.safe_temp_path_failure_reason === "temporary_path_realpath_prefix_mismatch" &&
    action485.command_results?.length === 0 &&
    action485.source_candidate_constructed === false &&
    action485.dependency_copy_created === false,
  action484_remains_approved:
    action484.approval_decision === "approved" &&
    action484.approved_integrity_strategy === "baseline_plus_overlay_manifest_integrity" &&
    action484.dependency_method === "temporary_verified_node_modules_copy" &&
    action484.deployment_performed === false &&
    action484.preview_activated === false,
  documentation_contract:
    hasAll(doc, [
      "temporary_candidate_realpath_comparison_used_noncanonical_prefix_boundary",
      "macOS, `/var/...` may canonicalize to `/private/var/...`",
      "String-prefix-only checks are rejected",
      "<canonical-system-temp>/ture/action-487-confidence-calibration-projection-preview-full-candidate-rehearsal/",
      "Action 486 does not reopen those decisions",
      expected.nextAction,
    ]),
  record_root_cause:
    record.root_cause_classification === expected.rootCause &&
    record.candidate_defective === false &&
    record.action_485_result === "full_candidate_rehearsal_aborted" &&
    record.action_485_failure_reason === "temporary_path_realpath_prefix_mismatch",
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullHash &&
    record.candidate_file_count === 30,
  canonicalization_policy:
    record.canonicalization_policy?.trusted_temp_root_source === "runtime_platform_api" &&
    record.canonicalization_policy?.canonical_temp_root_required === true &&
    record.canonicalization_policy?.canonical_candidate_parent_required === true &&
    record.canonicalization_policy?.canonical_candidate_after_creation_required === true &&
    record.canonicalization_policy?.compare_only_canonical_absolute_paths === true &&
    record.canonicalization_policy?.macos_var_private_var_alias_supported === true &&
    record.canonicalization_policy?.string_prefix_only_allowed === false,
  containment_policy:
    record.containment_policy?.method === "path_relative_boundary_check" &&
    record.containment_policy?.candidate_must_be_inside_canonical_temp_root === true &&
    record.containment_policy?.candidate_must_not_equal_temp_root === true &&
    record.containment_policy?.reject_relative_dotdot === true &&
    record.containment_policy?.reject_relative_dotdot_prefix === true &&
    record.containment_policy?.reject_absolute_escape === true &&
    record.containment_policy?.reject_textual_prefix_siblings === true &&
    record.containment_policy?.require_exact_action_specific_subtree ===
      "ture/action-487-confidence-calibration-projection-preview-full-candidate-rehearsal",
  action_specific_path_policy:
    record.action_specific_location?.action === 487 &&
    record.action_specific_location?.caller_supplied_path_allowed === false &&
    record.action_specific_location?.cli_path_argument_allowed === false &&
    record.action_specific_location?.environment_override_allowed === false &&
    record.action_specific_location?.stdin_path_allowed === false &&
    record.action_specific_location?.reuse_prior_action_path_allowed === false,
  symlink_policy:
    record.symlink_policy?.inspect_existing_parent_components_below_temp_root === true &&
    record.symlink_policy?.reject_target_symlink === true &&
    record.symlink_policy?.reject_dangling_target_symlink === true &&
    record.symlink_policy?.reject_parent_chain_symlink_inside_action_subtree === true &&
    record.symlink_policy?.reject_symlink_resolving_outside_temp_root === true &&
    record.symlink_policy?.reject_symlink_resolving_into_repository_home_config_or_app_data === true &&
    record.symlink_policy?.platform_defined_temp_root_alias_not_user_symlink_when_canonicalized === true,
  forbidden_roots:
    record.forbidden_root_policy?.canonicalize_all_forbidden_roots === true &&
    record.forbidden_root_policy?.candidate_must_not_equal_or_be_inside_forbidden_root === true &&
    [
      "active_repository_root",
      "repository_parent_selected_as_deployment_source",
      "home",
      "home_configuration_directories",
      "application_support_or_data_directories",
      "netlify_local_metadata_directory",
      "source_node_modules",
      "build_output_directories",
      "credential_stores",
    ].every((item) => record.forbidden_root_policy?.forbidden_roots?.includes(item)),
  creation_and_cleanup:
    record.creation_sequence?.at(0) === "obtain_trusted_system_temp_root" &&
    record.creation_sequence?.includes("begin_source_construction_only_after_all_checks_pass") &&
    record.cleanup_sequence?.includes("remove_only_exact_canonical_action_specific_subtree") &&
    record.cleanup_sequence?.includes("cleanup_idempotent_and_bounded"),
  test_matrix:
    acceptedTests.every((item) => record.test_matrix?.accepted?.includes(item)) &&
    rejectedTests.every((item) => record.test_matrix?.rejected?.includes(item)),
  rehearsal_policy:
    record.rehearsal_policy_unchanged === true &&
    record.integrity_strategy === "baseline_plus_overlay_manifest_integrity" &&
    record.source_only_integrity_before_dependencies === true &&
    record.dependency_materialization_method === "temporary_verified_node_modules_copy" &&
    record.extraneous_local_package_count === 5 &&
    record.extraneous_packages_excluded === true &&
    record.network_used === false &&
    record.install_performed === false &&
    record.dependency_update_performed === false,
  approval_and_next_action:
    JSON.stringify(record.approval_vocabulary) ===
      JSON.stringify(["approved", "approved_with_conditions", "blocked"]) &&
    record.approval_decision === "approved" &&
    Array.isArray(record.unresolved_conditions) &&
    record.unresolved_conditions.length === 0 &&
    record.next_action === expected.nextAction,
  no_effects: allFalse(record, noEffectKeys),
  runtime_state:
    record.preview_flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED" &&
    record.preview_flag_enabled === false &&
    record.current_runtime_preview_state === expected.runtimeState,
  package_config_hashes:
    Object.entries(expectedHashes).every(([file, value]) => localHashes[file] === value),
  no_secret_values:
    !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)) &&
    !forbiddenRecordPhrases.some((phrase) => doc.toLowerCase().includes(phrase)),
};

const failed_conditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failed_conditions.length === 0 ? "passed" : "failed",
  action_nature: record.action_nature ?? null,
  action_485_result: record.action_485_result ?? null,
  root_cause_classification: record.root_cause_classification ?? null,
  approval_decision: record.approval_decision ?? null,
  next_action: record.next_action ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  rehearsal_performed: record.rehearsal_performed ?? null,
  deployment_authorized: record.deployment_authorized ?? null,
  activation_authorized: record.activation_authorized ?? null,
  local_hashes: localHashes,
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
