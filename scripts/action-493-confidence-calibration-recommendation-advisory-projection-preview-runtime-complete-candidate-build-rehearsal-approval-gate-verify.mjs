#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const action492RecordPath =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const action493RecordPath =
  "docs/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-record.json";
const action493DocPath =
  "docs/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-gate.md";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  oldChangeHash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  oldFullHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  newChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  newFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  candidateCount: 31,
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nextAction: "action_494_runtime_complete_candidate_build_rehearsal",
};

function sha256(relativePath) {
  return createHash("sha256").update(readFileSync(join(repoRoot, relativePath))).digest("hex");
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8"));
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const relativePath of [action492RecordPath, action493RecordPath, action493DocPath]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing required file: ${relativePath}`, failures);
}

if (failures.length === 0) {
  const action492 = readJson(action492RecordPath);
  const record = readJson(action493RecordPath);
  const doc = readFileSync(join(repoRoot, action493DocPath), "utf8");
  const action492Paths = new Set(
    action492.new_changed_file_inventory.map((entry) => entry.path),
  );

  failUnless(record.source_action === 492, "source action is not 492", failures);
  failUnless(
    action492.candidate_reconstruction_result === "runtime_complete_candidate_reconstructed_and_frozen",
    "Action 492 result is not reconstructed and frozen",
    failures,
  );
  failUnless(record.source_action_result === action492.candidate_reconstruction_result, "source result mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.newChangeHash, "new change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.newFullHash, "new full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.candidateCount, "candidate file count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedPath, "added runtime path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedHash, "added runtime hash mismatch", failures);
  failUnless(
    action492.new_change_candidate_hash === record.change_candidate_hash &&
      action492.new_full_candidate_inventory_hash === record.full_candidate_inventory_hash &&
      action492.new_candidate_file_count === record.candidate_file_count,
    "Action 492 bindings do not match Action 493 record",
    failures,
  );
  failUnless(record.historical_change_candidate_hash === expected.oldChangeHash, "historical change hash mismatch", failures);
  failUnless(record.historical_full_candidate_inventory_hash === expected.oldFullHash, "historical full hash mismatch", failures);
  failUnless(record.historical_candidate_status === "historical_candidate_runtime_incomplete", "historical candidate not superseded", failures);
  failUnless(record.historical_deployment_approval_executable === false, "historical deployment approval executable", failures);
  failUnless(record.runtime_dependency_closure_complete === true, "runtime closure incomplete", failures);
  failUnless(record.runtime_dependency_paths_missing === 0, "runtime dependency paths missing", failures);
  failUnless(record.unresolved_source_versions === 0, "unresolved source versions present", failures);

  failUnless(record.temporary_path_policy.future_action === 494, "temp path future action mismatch", failures);
  failUnless(
    record.temporary_path_policy.target_subtree ===
      "ture/action-494-confidence-calibration-projection-preview-runtime-complete-candidate-rehearsal",
    "temp subtree mismatch",
    failures,
  );
  failUnless(record.temporary_path_policy.textual_prefix_only_containment_allowed === false, "textual prefix containment allowed", failures);
  failUnless(record.temporary_path_policy.traversal_allowed === false, "path traversal allowed", failures);
  failUnless(record.temporary_path_policy.target_or_parent_symlink_allowed === false, "symlink target allowed", failures);
  failUnless(record.temporary_path_policy.bounded_cleanup_required === true, "bounded cleanup not required", failures);

  failUnless(record.source_reconstruction_policy.method === "exact_clean_base_plus_action_492_31_file_overlay", "source reconstruction method mismatch", failures);
  failUnless(record.source_reconstruction_policy.broad_dirty_worktree_copy_allowed === false, "broad dirty worktree copy allowed", failures);
  failUnless(record.source_reconstruction_policy.changed_paths_required === expected.candidateCount, "source reconstruction count mismatch", failures);
  failUnless(record.source_reconstruction_policy.environment_or_credential_files_allowed === 0, "environment or credentials allowed", failures);
  failUnless(record.integrity_strategy === "baseline_plus_overlay_manifest_integrity", "integrity strategy mismatch", failures);
  failUnless(record.source_integrity_policy.env_files_allowed === false, "env files allowed", failures);
  failUnless(record.source_integrity_policy.credential_files_allowed === false, "credential files allowed", failures);
  failUnless(record.source_integrity_policy.node_modules_in_source_inventory_allowed === false, "node_modules source inventory allowed", failures);
  failUnless(record.source_integrity_policy.invalid_historical_node_modules_pathspec_allowed === false, "invalid historical node_modules pathspec allowed", failures);

  failUnless(record.source_safety_policy.policy_name === "action_488_ordered_source_safety_classification", "source safety policy mismatch", failures);
  failUnless(record.source_safety_policy.raw_secret_value_storage_allowed === false, "raw secret storage allowed", failures);
  failUnless(record.source_safety_policy.raw_secret_value_printing_allowed === false, "raw secret printing allowed", failures);
  failUnless(record.source_safety_policy.filename_only_sensitive_words_authoritative === false, "filename-only sensitive words authoritative", failures);

  failUnless(record.dependency_materialization_method === "temporary_verified_node_modules_copy", "dependency method mismatch", failures);
  failUnless(record.dependency_materialization_policy.npm_install_allowed === false, "npm install allowed", failures);
  failUnless(record.dependency_materialization_policy.npm_ci_allowed === false, "npm ci allowed", failures);
  failUnless(record.dependency_materialization_policy.registry_access_allowed === false, "registry access allowed", failures);
  failUnless(record.dependency_materialization_policy.lockfile_rewrite_allowed === false, "lockfile rewrite allowed", failures);
  failUnless(record.dependency_materialization_policy.known_extraneous_packages_excluded_count === 5, "extraneous exclusion count mismatch", failures);
  failUnless(record.dependency_materialization_policy.extraneous_influence === "no_influence_detected", "extraneous influence mismatch", failures);

  const orders = record.candidate_internal_command_inventory.map((entry) => entry.order);
  failUnless(
    orders.every((order, index) => order === index + 1),
    "candidate internal command inventory is not serial",
    failures,
  );
  for (const entry of record.candidate_internal_command_inventory) {
    if (entry.candidate_member_required) {
      failUnless(
        entry.required_candidate_path && action492Paths.has(entry.required_candidate_path),
        `internal required path missing from Action 492 candidate: ${entry.required_candidate_path}`,
        failures,
      );
    }
  }
  failUnless(record.candidate_internal_required_paths_missing === 0, "internal required paths missing", failures);
  failUnless(record.candidate_internal_required_missing_paths.length === 0, "internal missing path list not empty", failures);
  failUnless(
    record.conditional_candidate_internal_checks.every(
      (entry) => entry.status === "optional_absent_not_required",
    ),
    "conditional internal checks have unresolved requirements",
    failures,
  );
  failUnless(record.external_control_inventory.length >= 4, "external control inventory too small", failures);
  for (const entry of record.external_control_inventory) {
    failUnless(entry.candidate_internal === false, `external control marked candidate internal: ${entry.name}`, failures);
    failUnless(existsSync(join(repoRoot, entry.path)), `external control path missing: ${entry.path}`, failures);
  }

  failUnless(
    JSON.stringify(record.execution_order) ===
      JSON.stringify([
        "phase_0_safe_temp_path_validation",
        "phase_1_source_only_candidate_reconstruction_and_integrity",
        "phase_2_temporary_verified_node_modules_copy",
        "phase_3_candidate_internal_commands_serial",
        "phase_4_post_command_protected_hash_checks_record_and_cleanup",
        "phase_5_external_rehearsal_control_verifiers_and_contract_tests",
      ]),
    "execution order mismatch",
    failures,
  );

  for (const [relativePath, expectedHash] of Object.entries(
    record.post_command_integrity_policy.protected_path_hashes,
  )) {
    failUnless(existsSync(join(repoRoot, relativePath)), `protected path missing: ${relativePath}`, failures);
    if (existsSync(join(repoRoot, relativePath))) {
      failUnless(sha256(relativePath) === expectedHash, `protected path hash changed: ${relativePath}`, failures);
    }
  }
  failUnless(record.post_command_integrity_policy.install_marker_allowed === false, "install marker allowed", failures);
  failUnless(record.post_command_integrity_policy.environment_file_allowed === false, "environment file allowed", failures);
  failUnless(record.post_command_integrity_policy.credential_file_allowed === false, "credential file allowed", failures);
  failUnless(record.post_command_integrity_policy.raw_secret_recorded_allowed === false, "raw secret recorded allowed", failures);
  failUnless(record.post_command_integrity_policy.preview_flag_must_remain_disabled === true, "preview flag disabled not required", failures);

  failUnless(record.candidate_rehearsal_result_vocabulary.includes("full_candidate_rehearsal_passed"), "candidate result vocabulary missing pass", failures);
  failUnless(record.external_evidence_result_vocabulary.includes("rehearsal_evidence_verification_failed"), "external evidence vocabulary missing failure", failures);
  failUnless(record.overall_readiness_vocabulary.includes("ready_for_preview_deployment_final_approval"), "overall readiness vocabulary missing ready", failures);
  failUnless(JSON.stringify(record.approval_vocabulary) === JSON.stringify(["approved", "approved_with_conditions", "blocked"]), "approval vocabulary mismatch", failures);
  failUnless(record.failure_semantics.same_action_repair_or_rerun_allowed === false, "same-action rerun allowed", failures);
  failUnless(
    record.failure_semantics.external_verifier_failure_after_candidate_internal_pass ===
      "rehearsal_evidence_verification_failed",
    "external failure semantics mismatch",
    failures,
  );
  failUnless(record.rehearsal_attempt_limit === 1, "rehearsal attempt limit mismatch", failures);

  failUnless(record.approval_decision === "approved", "approval decision is not approved", failures);
  failUnless(record.unresolved_conditions.length === 0, "unresolved conditions present", failures);
  failUnless(record.candidate_reconstruction_performed === false, "candidate reconstruction performed", failures);
  failUnless(record.build_performed === false, "build performed", failures);
  failUnless(record.rehearsal_performed === false, "rehearsal performed", failures);
  failUnless(record.deployment_performed === false, "deployment performed", failures);
  failUnless(record.preview_activated === false, "preview activated", failures);
  failUnless(record.network_used === false, "network used", failures);
  failUnless(record.install_performed === false, "install performed", failures);
  failUnless(record.environment_modified === false, "environment modified", failures);
  failUnless(record.package_or_lockfile_modified === false, "package or lockfile modified", failures);
  failUnless(record.netlify_operation_performed === false, "Netlify operation performed", failures);
  failUnless(record.provider_call_executed === false, "provider call executed", failures);
  failUnless(record.supabase_read_executed === false, "Supabase read executed", failures);
  failUnless(record.supabase_write_executed === false, "Supabase write executed", failures);
  failUnless(record.persistence_created === false, "persistence created", failures);
  failUnless(record.replay_created === false, "replay created", failures);
  failUnless(record.confidence_applied === false, "confidence applied", failures);
  failUnless(record.feedback_created === false, "feedback created", failures);
  failUnless(record.scanner_changed === false, "scanner changed", failures);
  failUnless(record.ranking_changed === false, "ranking changed", failures);
  failUnless(record.publication_changed === false, "publication changed", failures);
  failUnless(record.execution_changed === false, "execution changed", failures);
  failUnless(record.add_trade_changed === false, "Add Trade changed", failures);
  failUnless(record.risk_sizing_changed === false, "risk sizing changed", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.preview_flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED", "preview flag name mismatch", failures);
  failUnless(record.preview_flag_state === "absent_or_disabled", "preview flag state mismatch", failures);
  failUnless(record.preview_flag_enabled === false, "preview flag enabled", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 493 approves",
    expected.newChangeHash,
    expected.newFullHash,
    expected.addedPath,
    "temporary_verified_node_modules_copy",
    "full_candidate_rehearsal_passed",
    "approved",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  failUnless(!doc.includes("AUTOMATION_SECRET="), "doc contains automation secret assignment", failures);
  failUnless(!doc.includes("SUPABASE_SERVICE_ROLE_KEY="), "doc contains Supabase secret assignment", failures);
  failUnless(!doc.includes("TWELVE_DATA_API_KEY="), "doc contains provider secret assignment", failures);
}

const result = {
  verification_status: failures.length === 0 ? "passed" : "failed",
  approval_decision: failures.length === 0 ? "approved" : "blocked",
  next_action: expected.nextAction,
  verifier: "action_493_runtime_complete_candidate_build_rehearsal_approval_gate",
  reconstruction_free: true,
  build_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_immutable: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exit(1);
