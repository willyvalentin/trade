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
  previewFlag: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  nextAction: "action_482_dependency_materialization_completion_gate",
  nextAfterCondition: "action_482_full_candidate_build_rehearsal",
});

const paths = Object.freeze({
  doc:
    "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate.md",
  record:
    "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-approval-record.json",
  action480:
    "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-record.json",
  action479:
    "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-record.json",
  verifier:
    "scripts/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate-verify.mjs",
  test:
    "tests/e2e/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate.spec.ts",
});

const expectedHashes = Object.freeze({
  "package.json": "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
  "package-lock.json": "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
  "next.config.ts": "614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc",
  "tsconfig.json": "83b460dca7c269a562dba8f46d08de45397869b7ddbf31101eabca1a975eaa82",
  "eslint.config.mjs": "53065bd014f2b6fb89dc5f1a84cd37053217cbec71be6f15c3958a3b3bc4143c",
  "netlify.toml": "7cc579b1e99306abc9f21c0340c5b7e94309567d7b86e2757ba996d2b414b1b7",
});

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action480 = exists(paths.action480) ? readJson(paths.action480) : {};
const action479 = exists(paths.action479) ? readJson(paths.action479) : {};

function hasAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function valuesAllFalse(object, keys) {
  return keys.every((key) => object?.[key] === false);
}

const localHashes = Object.fromEntries(
  Object.keys(expectedHashes).map((path) => [path, exists(path) ? sha256(path) : null]),
);

const noEffectKeys = [
  "deployment_authorized",
  "activation_authorized",
  "netlify_operation_authorized",
  "environment_modification_authorized",
  "preview_flag_enabled",
  "production_changed",
  "environment_modified",
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

const forbiddenRecordPhrases = [
  "authorization:",
  "bearer ",
  "cookie:",
  "password:",
  "api_key:",
  "apikey:",
  "private_key:",
  "admin.netlify.com",
];

const requiredCommands = [
  "candidate_integrity_check_equivalent_to_git_diff_check",
  "npx next typegen",
  "npx tsc --noEmit",
  "npm run build",
  "npm run lint",
  "node scripts/action-309-post-recovery-safety-guard.mjs",
  "runtime_facing_projection_call_site_count_equals_1",
  "preview_flag_absent_or_disabled",
  "production_activation_absent",
];

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  documentation_contract:
    hasAll(doc, [
      "Action 480 aborted before creating a temporary candidate or invoking Netlify",
      "Decision: `approved_with_conditions`",
      expected.nextAction,
      expected.nextAfterCondition,
      "Runtime preview remains `runtime_preview_waiting_for_operator_inputs`",
    ]),
  action480_abort:
    action480.deployment_result === "deployment_aborted" &&
    action480.deployment_attempt_count === 0 &&
    action480.candidate_reconstruction_result === "deployment_aborted_before_temp_candidate_creation" &&
    action480.netlify_cli_invoked === false &&
    action480.netlify_api_invoked === false &&
    action480.preview_activated === false &&
    action480.production_deployment_changed === false,
  action479_remains_static:
    action479.deployment_retry_decision === "deployment_retry_approved_for_future_action" &&
    action479.deployment_performed === false &&
    action479.preview_activated === false &&
    action479.production_changed === false,
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash &&
    record.candidate_file_count === 30 &&
    record.candidate_reconstruction_policy?.use_clean_base === true &&
    record.candidate_reconstruction_policy?.use_exact_approved_30_file_overlay === true &&
    record.candidate_reconstruction_policy?.broad_dirty_worktree_copy_authorized === false &&
    record.candidate_reconstruction_policy?.include_env_files === false &&
    record.candidate_reconstruction_policy?.include_credentials === false &&
    record.candidate_reconstruction_policy?.include_netlify_directory === false,
  dependency_policy:
    record.dependency_materialization_policy?.preferred_method === "immutable_local_dependency_reuse" &&
    record.dependency_materialization_policy?.preferred_method_approved_for_future_rehearsal === true &&
    record.dependency_materialization_policy?.preferred_method_status ===
      "approved_but_requires_future_isolated_candidate_proof" &&
    record.dependency_materialization_policy?.dependency_tree_mutation_authorized === false &&
    record.dependency_materialization_policy?.dependency_upgrade_authorized === false &&
    record.dependency_materialization_policy?.lockfile_rewrite_authorized === false &&
    record.dependency_materialization_policy?.arbitrary_package_install_authorized === false &&
    record.dependency_materialization_policy?.network_install_authorized_by_action_481 === false,
  frozen_install_alternative:
    record.dependency_materialization_policy?.fallback_method ===
      "frozen_lockfile_install_requires_separate_bounded_network_approval" &&
    record.network_step_authorized === false,
  manifest_hash_policy:
    Object.entries(expectedHashes).every(([path, hash]) => localHashes[path] === hash) &&
    record.package_lockfile_config_hash_policy?.package_json === expectedHashes["package.json"] &&
    record.package_lockfile_config_hash_policy?.package_lock_json ===
      expectedHashes["package-lock.json"] &&
    record.package_lockfile_config_hash_policy?.next_config_ts === expectedHashes["next.config.ts"] &&
    record.package_lockfile_config_hash_policy?.tsconfig_json === expectedHashes["tsconfig.json"] &&
    record.package_lockfile_config_hash_policy?.eslint_config_mjs === expectedHashes["eslint.config.mjs"] &&
    record.package_lockfile_config_hash_policy?.netlify_toml === expectedHashes["netlify.toml"] &&
    record.package_lockfile_config_hash_policy?.lockfile_drift_rejected === true &&
    record.package_lockfile_config_hash_policy?.package_version_drift_rejected === true,
  temporary_path_policy:
    typeof record.temporary_path_policy?.path_template === "string" &&
    record.temporary_path_policy.path_template.includes(
      "action-482-confidence-calibration-projection-preview-full-candidate-rehearsal",
    ) &&
    record.temporary_path_policy?.must_be_outside_active_repository === true &&
    record.temporary_path_policy?.must_be_outside_home_config === true &&
    record.temporary_path_policy?.must_be_absent_or_empty_before_use === true &&
    record.temporary_path_policy?.symlink_target_allowed === false &&
    record.temporary_path_policy?.parent_chain_symlink_allowed === false &&
    record.temporary_path_policy?.path_traversal_allowed === false &&
    record.temporary_path_policy?.serial_exclusive_ownership_required === true &&
    record.temporary_path_policy?.reuse_action_466_or_467_paths_allowed === false,
  rehearsal_commands:
    Array.isArray(record.rehearsal_command_inventory) &&
    requiredCommands.every((command) => record.rehearsal_command_inventory.includes(command)) &&
    record.serial_execution_required === true &&
    record.same_action_repair_run_authorized === false,
  vocabulary:
    JSON.stringify(record.result_vocabulary) ===
      JSON.stringify([
        "full_candidate_rehearsal_passed",
        "full_candidate_rehearsal_failed",
        "full_candidate_rehearsal_aborted",
      ]) &&
    JSON.stringify(record.approval_vocabulary) ===
      JSON.stringify(["approved", "approved_with_conditions", "blocked"]),
  bounded_evidence:
    record.bounded_evidence_policy?.base_identifier_permitted === true &&
    record.bounded_evidence_policy?.candidate_hashes_permitted === true &&
    record.bounded_evidence_policy?.command_result_summaries_permitted === true &&
    record.bounded_evidence_policy?.source_contents_permitted === false &&
    record.bounded_evidence_policy?.dependency_contents_permitted === false &&
    record.bounded_evidence_policy?.secret_build_logs_permitted === false &&
    record.bounded_evidence_policy?.environment_values_permitted === false &&
    record.bounded_evidence_policy?.credential_values_permitted === false &&
    record.bounded_evidence_policy?.recommendation_data_permitted === false &&
    record.bounded_evidence_policy?.projection_data_permitted === false,
  cleanup:
    record.cleanup_policy?.remove_temporary_candidate === true &&
    record.cleanup_policy?.remove_copied_temporary_dependency_tree === true &&
    record.cleanup_policy?.verify_temp_directory_absent_or_empty === true &&
    record.cleanup_policy?.retain_build_output_in_repository === false &&
    record.cleanup_policy?.retain_credentials_or_environment_values === false &&
    record.cleanup_policy?.preserve_active_working_tree_unchanged === true &&
    record.cleanup_policy?.cleanup_failure_blocks_readiness === true,
  approval_decision:
    record.approval_decision === "approved_with_conditions" &&
    Array.isArray(record.approval_conditions) &&
    record.approval_conditions.includes(
      "prove_immutable_local_dependency_reuse_inside_the_isolated_candidate_or_obtain_separate_bounded_frozen_lockfile_install_approval",
    ) &&
    record.next_action === expected.nextAction &&
    record.next_action_if_dependency_condition_completed === expected.nextAfterCondition,
  no_effects:
    valuesAllFalse(record, noEffectKeys) &&
    record.preview_flag_name === expected.previewFlag &&
    record.preview_flag_required_state === "absent_or_disabled" &&
    record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs" &&
    record.runtime_preview_active_observation_only_authorized === false,
  no_secret_values:
    !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)),
};

const failed_conditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failed_conditions.length === 0 ? "passed" : "failed",
  action_nature: record.action_nature ?? null,
  approval_decision: record.approval_decision ?? null,
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  candidate_file_count: record.candidate_file_count ?? null,
  dependency_method: record.dependency_materialization_policy?.preferred_method ?? null,
  dependency_method_status: record.dependency_materialization_policy?.preferred_method_status ?? null,
  network_step_authorized: record.network_step_authorized ?? null,
  deployment_authorized: record.deployment_authorized ?? null,
  activation_authorized: record.activation_authorized ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  next_action: record.next_action ?? null,
  next_action_if_dependency_condition_completed:
    record.next_action_if_dependency_condition_completed ?? null,
  local_hashes: localHashes,
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
