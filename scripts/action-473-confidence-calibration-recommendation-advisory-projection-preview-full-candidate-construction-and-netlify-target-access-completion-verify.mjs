#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const expected = Object.freeze({
  hash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  fileCount: 30,
  base: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  fullHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  nextAction: "action_474_netlify_target_and_secure_access_completion",
});

const paths = Object.freeze({
  doc:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-construction-and-netlify-target-access-completion.md",
  inventory:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
  netlify:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-access-record.json",
  action472:
    "docs/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-record.json",
  action466:
    "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json",
  verifier:
    "scripts/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-construction-and-netlify-target-access-completion-verify.mjs",
  test:
    "tests/e2e/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-construction-and-netlify-target-access-completion.spec.ts",
});

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function arrayIncludesAll(array, values) {
  return Array.isArray(array) && values.every((value) => array.includes(value));
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key])]));
  }
  return value;
}

function computeInventoryHash(inventory) {
  const canonical = sortValue({
    approved_change_candidate_file_count: inventory.approved_change_candidate_file_count,
    approved_change_candidate_hash: inventory.approved_change_candidate_hash,
    candidate_classification: inventory.full_candidate_classification,
    changed_file_content_hashes: inventory.changed_file_content_hashes,
    changed_file_paths: inventory.changed_file_paths,
    full_candidate_build_result: inventory.full_candidate_build_result,
    full_candidate_test_result: inventory.full_candidate_test_result,
    preview_flag_state: inventory.preview_flag_state,
    repository_base_identifier: inventory.repository_base_identifier,
    required_lockfile_hash: inventory.required_lockfile_hash,
    required_manifest_hashes: inventory.required_manifest_hashes,
    runtime_projection_call_site_count: inventory.runtime_projection_call_site_count,
    unexpected_changed_file_count: inventory.unexpected_changed_file_count,
    unrelated_post_trade_changed_file_count: inventory.unrelated_post_trade_changed_file_count,
    environment_file_count: inventory.environment_file_count,
    secret_file_count: inventory.secret_file_count,
    merge_conflict_count: inventory.merge_conflict_count,
  });
  return sha256(JSON.stringify(canonical));
}

function gitSuccess(args) {
  try {
    execFileSync("git", args, {
      cwd: root,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const inventory = exists(paths.inventory) ? readJson(paths.inventory) : {};
const netlify = exists(paths.netlify) ? readJson(paths.netlify) : {};
const action472 = exists(paths.action472) ? readJson(paths.action472) : {};
const action466 = exists(paths.action466) ? readJson(paths.action466) : {};
const currentHead = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).trim();
const baseCommitAvailable = gitSuccess(["cat-file", "-e", `${expected.base}^{commit}`]);
const baseIsAncestorOfCurrentHead = gitSuccess([
  "merge-base",
  "--is-ancestor",
  expected.base,
  "HEAD",
]);

const noEffectResults = {
  deployment_performed: inventory.deployment_performed === false && netlify.deployment_performed === false,
  preview_activated: inventory.preview_activated === false && netlify.preview_activated === false,
  production_changed: inventory.production_changed === false && netlify.production_changed === false,
  network_step_performed: netlify.network_step_performed === false,
  authentication_performed: netlify.authentication_performed === false,
  credential_value_recorded: netlify.credential_value_recorded === false,
  environment_value_recorded: netlify.environment_value_recorded === false,
};

const candidatePaths = action466.candidate_paths ?? [];
const candidateHashes = action466.candidate_content_hashes ?? {};

const checks = {
  documentation_exists: exists(paths.doc),
  inventory_exists: exists(paths.inventory),
  netlify_record_exists: exists(paths.netlify),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "## Clean Repository Base",
      "## Full-Candidate Construction",
      "Full-candidate decision: `full_candidate_ready_with_conditions`",
      "Netlify-access decision: `netlify_target_access_ready_with_conditions`",
      expected.nextAction,
    ]),
  action472_approval:
    action472.approval_decision === "approved_with_conditions" &&
    action472.next_permitted_action ===
      "action_473_preview_full_candidate_construction_and_netlify_target_access_completion",
  candidate_binding:
    inventory.approved_change_candidate_hash === expected.hash &&
    inventory.approved_change_candidate_file_count === expected.fileCount &&
    action466.action_465_candidate_inventory_hash === expected.hash &&
    action466.candidate_file_count === expected.fileCount &&
    action466.unexpected_file_count === 0 &&
    action466.secret_file_count === 0 &&
    action466.environment_file_count === 0,
  clean_base:
    inventory.repository_base_identifier === expected.base &&
    baseCommitAvailable &&
    baseIsAncestorOfCurrentHead &&
    inventory.repository_base_type === "local_git_head_commit" &&
    inventory.repository_base_available === true &&
    inventory.repository_base_integrity_result === "locally_verified_from_git_object_database" &&
    inventory.repository_base_contains_package_manifest === true &&
    inventory.repository_base_contains_lockfile === true &&
    inventory.repository_base_contains_next_config === true &&
    inventory.repository_base_contains_application_structure === true,
  temporary_path_safety:
    inventory.temporary_candidate_safety?.outside_repository === true &&
    inventory.temporary_candidate_safety?.outside_home_config === true &&
    inventory.temporary_candidate_safety?.empty_or_absent_before_use === true &&
    inventory.temporary_candidate_safety?.no_symlink_target === true &&
    inventory.temporary_candidate_safety?.no_parent_chain_symlink === true &&
    inventory.temporary_candidate_safety?.no_traversal === true,
  exact_overlay:
    inventory.overlay_result === "exact_30_candidate_files_overlaid" &&
    inventory.overlaid_file_count === expected.fileCount &&
    Array.isArray(inventory.changed_file_paths) &&
    inventory.changed_file_paths.length === expected.fileCount &&
    arrayIncludesAll(inventory.changed_file_paths, candidatePaths) &&
    Object.entries(candidateHashes).every(
      ([path, hash]) => inventory.changed_file_content_hashes?.[path] === hash,
    ),
  changed_path_boundary:
    inventory.unexpected_changed_file_count === 0 &&
    inventory.unrelated_post_trade_changed_file_count === 0 &&
    inventory.secret_file_count === 0 &&
    inventory.environment_file_count === 0 &&
    inventory.merge_conflict_count === 0,
  baseline_hashes:
    inventory.required_manifest_hashes?.["package.json"] ===
      "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58" &&
    inventory.required_lockfile_hash ===
      "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657" &&
    inventory.required_manifest_hashes?.["next.config.ts"] ===
      "614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc",
  buildability_results:
    inventory.full_candidate_build_result ===
      "local_workspace_validation_passed_temp_build_blocked_by_dependency_materialization_policy" &&
    inventory.full_candidate_test_result ===
      "focused_static_validation_passed_temp_full_suite_not_run_dependency_materialization_policy" &&
    inventory.dependency_handling_result ===
      "local_dependencies_available_in_active_workspace_temp_candidate_dependency_reuse_requires_future_approval",
  runtime_and_flag:
    inventory.runtime_projection_call_site_count === 1 &&
    inventory.preview_flag_state === "disabled_by_policy_not_read_from_env" &&
    inventory.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  inventory_hash:
    inventory.full_candidate_inventory_hash === expected.fullHash &&
    computeInventoryHash(inventory) === expected.fullHash,
  cleanup:
    inventory.temporary_candidate_cleanup_result === "temporary_candidate_removed" &&
    inventory.temporary_candidate_absent_after_cleanup === true,
  netlify_target:
    netlify.schema_version === "action_473_netlify_target_access_record_v1" &&
    netlify.environment_classification === "non_production_preview" &&
    netlify.deployment_platform === "Netlify" &&
    netlify.site_association_known === false &&
    netlify.credential_available === false &&
    netlify.netlify_target_access_decision === "netlify_target_access_ready_with_conditions" &&
    netlify.production_alias_protected === null,
  credential_policy:
    netlify.authentication_method_classification === "not_verified_no_network_no_interactive_auth" &&
    netlify.credential_verification_result === "conditional_user_completion_required" &&
    netlify.credential_value_recorded === false &&
    netlify.secret_url_recorded === false &&
    netlify.environment_value_recorded === false,
  decisions:
    inventory.full_candidate_decision === "full_candidate_ready_with_conditions" &&
    netlify.netlify_target_access_decision === "netlify_target_access_ready_with_conditions",
  next_action: expected.nextAction === "action_474_netlify_target_and_secure_access_completion",
  no_side_effects: Object.values(noEffectResults).every(Boolean),
};

const fullCandidateDecision = inventory.full_candidate_decision ?? "full_candidate_blocked";
const netlifyDecision = netlify.netlify_target_access_decision ?? "netlify_target_access_blocked";
const overallReadiness =
  fullCandidateDecision === "full_candidate_ready" &&
  netlifyDecision === "netlify_target_access_ready"
    ? "ready"
    : fullCandidateDecision.startsWith("full_candidate_ready") &&
        netlifyDecision === "netlify_target_access_ready_with_conditions"
      ? "ready_with_conditions"
      : "blocked";

checks.overall_readiness = overallReadiness === "ready_with_conditions";

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "local_full_candidate_construction_and_target_access_completion_no_deploy_no_activation",
  repository_base_identifier: inventory.repository_base_identifier ?? null,
  current_repository_head: currentHead,
  repository_base_available_from_git: baseCommitAvailable,
  repository_base_is_ancestor_of_current_head: baseIsAncestorOfCurrentHead,
  approved_change_candidate_hash: inventory.approved_change_candidate_hash ?? null,
  approved_change_candidate_file_count: inventory.approved_change_candidate_file_count ?? null,
  changed_file_count: inventory.changed_file_paths?.length ?? null,
  unexpected_changed_file_count: inventory.unexpected_changed_file_count ?? null,
  unrelated_post_trade_changed_file_count: inventory.unrelated_post_trade_changed_file_count ?? null,
  full_candidate_build_result: inventory.full_candidate_build_result ?? null,
  full_candidate_test_result: inventory.full_candidate_test_result ?? null,
  runtime_projection_call_site_count: inventory.runtime_projection_call_site_count ?? null,
  full_candidate_inventory_hash: inventory.full_candidate_inventory_hash ?? null,
  temporary_candidate_cleanup_result: inventory.temporary_candidate_cleanup_result ?? null,
  site_association_known: netlify.site_association_known ?? null,
  credential_available: netlify.credential_available ?? null,
  full_candidate_decision: fullCandidateDecision,
  netlify_target_access_decision: netlifyDecision,
  overall_readiness: overallReadiness,
  next_action: expected.nextAction,
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
