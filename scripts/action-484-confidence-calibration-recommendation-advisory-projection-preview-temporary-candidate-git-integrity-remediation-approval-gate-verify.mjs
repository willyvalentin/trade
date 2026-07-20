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
  rootCause: "temporary_candidate_git_integrity_pathspec_invalid",
  strategy: "baseline_plus_overlay_manifest_integrity",
  nextAction: "action_485_full_candidate_build_rehearsal_retry",
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
    "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-gate.md",
  record:
    "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-record.json",
  action483:
    "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-record.json",
  action482:
    "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-record.json",
  verifier:
    "scripts/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-gate.spec.ts",
});

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action483 = exists(paths.action483) ? readJson(paths.action483) : {};
const action482 = exists(paths.action482) ? readJson(paths.action482) : {};

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
  "deployment_authorized",
  "deployment_performed",
  "netlify_operation_performed",
  "activation_authorized",
  "preview_activated",
  "environment_modified",
  "production_changed",
  "preview_flag_enabled",
  "confidence_applied",
  "feedback_created",
  "recommendation_mutated",
  "provider_call_executed",
  "supabase_access_created",
  "supabase_write_executed",
  "persistence_created",
  "replay_created",
  "ranking_changed",
  "scanner_changed",
  "publication_changed",
  "execution_changed",
  "add_trade_changed",
  "risk_sizing_changed",
  "route_added",
  "persistence_added",
  "replay_added",
  "provider_supabase_preview_integration_added",
  "feedback_added",
  "confidence_application_added",
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

const expectedExclusions = [
  ".git/",
  "node_modules/",
  ".next/",
  "coverage/",
  "test-results/",
  "playwright-report/",
  ".netlify/",
  ".env",
  ".env.",
  "*.log",
  ".DS_Store",
  ".idea/",
  ".vscode/",
];

const expectedIncludedAreas = [
  "app",
  "components",
  "lib",
  "tests",
  "docs required by the approved candidate",
  "scripts",
  "public static assets",
  "package.json",
  "package-lock.json",
  "configuration files",
];

const expectedCommands = [
  "candidate integrity validation",
  "npx next typegen",
  "npx tsc --noEmit",
  "npm run build",
  "npm run lint",
  "node scripts/action-309-post-recovery-safety-guard.mjs",
  "Action 461 preview-consumer suite",
  "Action 462 independent preview-consumer suite",
  "Recommendation details regression suite",
  "focused Actions 481-485 suites",
];

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  documentation_contract:
    hasAll(doc, [
      "Root-cause classification: `temporary_candidate_git_integrity_pathspec_invalid`",
      "Approved integrity strategy: `baseline_plus_overlay_manifest_integrity`",
      "Approval decision: `approved`",
      expected.nextAction,
      "Runtime preview remains `runtime_preview_waiting_for_operator_inputs`",
    ]),
  action483_failed_result:
    action483.rehearsal_decision === "full_candidate_rehearsal_failed" &&
    action483.candidate_integrity_result ===
      "failed_git_diff_check_equivalent_setup_pathspec_for_ignored_node_modules" &&
    action483.deployment_performed === false &&
    action483.preview_activated === false &&
    action483.environment_modified === false &&
    action483.network_used === false &&
    action483.install_performed === false &&
    action483.dependency_update_performed === false &&
    action483.cleanup_result === "temporary_candidate_and_dependency_copy_removed",
  action482_dependency_policy:
    action482.dependency_materialization_decision === "dependency_materialization_ready_with_conditions" &&
    action482.network_required === false &&
    action482.dependency_install_performed === false &&
    action482.lockfile_modified === false &&
    action482.package_manifest_modified === false,
  root_cause_and_non_failure:
    record.root_cause_classification === expected.rootCause &&
    record.candidate_defective === false &&
    record.dependency_copy_defective === false &&
    record.git_integrity_command_defective === true &&
    record.git_rejected_integrity_command_syntax === true &&
    record.build_or_test_command_started === false &&
    record.source_mutation_occurred === false &&
    record.cleanup_succeeded === true,
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullHash &&
    record.changed_file_count === 30,
  package_config_hashes:
    Object.entries(expectedHashes).every(([key, value]) => localHashes[key] === value) &&
    record.protected_hash_policy?.package_json === expectedHashes.package_json &&
    record.protected_hash_policy?.package_lock === expectedHashes.package_lock &&
    record.protected_hash_policy?.next_config === expectedHashes.next_config &&
    record.protected_hash_policy?.typescript_config === expectedHashes.typescript_config &&
    record.protected_hash_policy?.eslint_config === expectedHashes.eslint_config &&
    record.protected_hash_policy?.netlify_config === expectedHashes.netlify_config &&
    record.protected_hash_policy?.mismatch_aborts_before_rehearsal_commands === true,
  approved_strategy:
    record.approved_integrity_strategy === expected.strategy &&
    record.source_only_integrity_phase_required === true &&
    record.dependency_copy_after_source_integrity === true &&
    record.node_modules_staged === false &&
    record.node_modules_in_tracked_candidate_inventory === false &&
    record.invalid_pathspec_retained === false &&
    record.node_modules_excluded_without_pathspec_ambiguity === true,
  source_inventory:
    record.source_inventory_policy?.strategy === "bounded_repository_relative_source_inventory" &&
    record.source_inventory_policy?.exclude_rules_type === "exact_relative_path_or_prefix_rules" &&
    expectedExclusions.every((item) =>
      record.source_inventory_policy?.excluded_relative_paths_or_prefixes?.includes(item),
    ) &&
    expectedIncludedAreas.every((item) =>
      record.source_inventory_policy?.included_source_areas?.includes(item),
    ) &&
    record.source_inventory_policy?.detects_unexpected_source_files === true &&
    record.source_inventory_policy?.detects_missing_source_files === true &&
    record.source_inventory_policy?.detects_deleted_baseline_files === true &&
    record.source_inventory_policy?.detects_changed_unapproved_files === true &&
    record.source_inventory_policy?.detects_environment_files === true &&
    record.source_inventory_policy?.detects_secret_like_files === true &&
    record.source_inventory_policy?.detects_merge_conflict_markers === true,
  direct_overlay_hash_policy:
    record.direct_overlay_hash_policy?.all_approved_overlay_files_require_exact_path === true &&
    record.direct_overlay_hash_policy?.all_approved_overlay_files_require_exact_content_sha256 === true &&
    record.direct_overlay_hash_policy?.all_approved_overlay_files_require_exact_action_classification === true &&
    record.direct_overlay_hash_policy?.approved_overlay_file_count === 30,
  unexpected_file_handling:
    record.unexpected_file_handling?.unexpected_source_file === "abort_before_commands" &&
    record.unexpected_file_handling?.unapproved_source_differs_from_clean_base === "abort_before_commands" &&
    record.unexpected_file_handling?.approved_overlay_missing === "abort_before_commands" &&
    record.unexpected_file_handling?.baseline_file_deleted_unexpectedly === "abort_before_commands" &&
    record.unexpected_file_handling?.environment_file_appears === "abort_before_commands" &&
    record.unexpected_file_handling?.secret_like_file_appears === "abort_before_commands" &&
    record.unexpected_file_handling?.merge_conflict_marker_appears === "abort_before_commands" &&
    record.unexpected_file_handling?.node_modules_enters_tracked_candidate_inventory ===
      "abort_before_commands" &&
    record.unexpected_file_handling?.same_action_repair_allowed === false,
  dependency_policy:
    record.dependency_method === "temporary_verified_node_modules_copy" &&
    record.dependency_policy_unchanged === true &&
    record.dependency_policy?.method === "temporary_verified_node_modules_copy" &&
    record.dependency_policy?.no_install === true &&
    record.dependency_policy?.no_network === true &&
    record.dependency_policy?.no_update === true &&
    record.dependency_policy?.no_lockfile_modification === true &&
    record.dependency_policy?.known_extraneous_packages_excluded === true &&
    record.dependency_policy?.known_extraneous_packages?.length === 5 &&
    record.dependency_policy?.dependency_copy_created_only_after_source_integrity_passes === true &&
    record.dependency_policy?.dependency_copy_removed_during_cleanup === true,
  execution_order:
    JSON.stringify(record.execution_order) ===
    JSON.stringify([
      "phase_1_create_temporary_source_only_candidate",
      "phase_1_verify_clean_base",
      "phase_1_apply_exact_30_file_overlay",
      "phase_1_verify_candidate_hashes",
      "phase_1_run_source_only_git_integrity_check",
      "phase_1_run_bounded_source_inventory_comparison",
      "phase_2_materialize_temporary_node_modules_copy",
      "phase_2_verify_dependency_boundary",
      "phase_2_verify_five_extraneous_packages_remain_excluded",
      "phase_3_run_build_and_tests_serially",
      "phase_4_rerun_bounded_source_config_hash_checks",
      "phase_4_clean_temporary_candidate_and_dependencies",
    ]),
  rehearsal_commands:
    JSON.stringify(record.rehearsal_command_inventory) === JSON.stringify(expectedCommands) &&
    record.runtime_projection_call_site_count_required === 1,
  approval_decision:
    JSON.stringify(record.result_vocabulary) ===
      JSON.stringify(["approved", "approved_with_conditions", "blocked"]) &&
    record.approval_decision === "approved" &&
    Array.isArray(record.unresolved_conditions) &&
    record.unresolved_conditions.length === 0 &&
    Array.isArray(record.blocked_conditions) &&
    record.blocked_conditions.length === 0 &&
    record.next_action === expected.nextAction,
  no_effects: allFalse(record, noEffectKeys),
  runtime_state:
    record.preview_flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED" &&
    record.preview_flag_required_state === "absent_or_disabled" &&
    record.preview_flag_enabled === false &&
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
  action_483_rehearsal_result: record.action_483_rehearsal_result ?? null,
  root_cause_classification: record.root_cause_classification ?? null,
  approved_integrity_strategy: record.approved_integrity_strategy ?? null,
  approval_decision: record.approval_decision ?? null,
  next_action: record.next_action ?? null,
  dependency_method: record.dependency_method ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  candidate_binding: {
    clean_base_identifier: record.clean_base_identifier ?? null,
    approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
    full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
    changed_file_count: record.changed_file_count ?? null,
  },
  local_hashes: localHashes,
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
