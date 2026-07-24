#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-remediation-approval-record.json";
const docPath =
  "docs/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-or-environment-remediation-gate.md";
const action503Path =
  "docs/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  nextAction: "action_505_runner_environment_precheck_completion_gate",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const relativePath of [recordPath, docPath, action503Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action503 = readJson(action503Path);

  failUnless(action503.diagnostic_result === "diagnostic_build_failure_captured", "Action 503 result mismatch", failures);
  failUnless(action503.build_phase === "build_bundling", "Action 503 phase mismatch", failures);
  failUnless(action503.primary_error_class === "process_resource_error", "Action 503 error class mismatch", failures);
  failUnless(
    action503.root_cause_classification === "candidate_build_environment_contract_defect",
    "Action 503 root cause mismatch",
    failures,
  );
  failUnless(action503.candidate_hash_impact === "candidate_hash_change_not_required", "Action 503 hash impact mismatch", failures);

  failUnless(record.schema_version === "action_504_candidate_build_runner_environment_remediation_approval_gate_v1", "schema mismatch", failures);
  failUnless(record.source_action === 503, "source action mismatch", failures);
  failUnless(record.action_503_diagnostic_result === "diagnostic_build_failure_captured", "record Action 503 result mismatch", failures);
  failUnless(record.build_phase === "build_bundling", "build phase mismatch", failures);
  failUnless(record.primary_error_class === "process_resource_error", "error class mismatch", failures);
  failUnless(record.sanitized_operating_system_error === "operation_not_permitted", "OS error mismatch", failures);
  failUnless(record.root_cause_classification === "candidate_build_environment_contract_defect", "root cause mismatch", failures);
  failUnless(record.candidate_hash_impact === "candidate_hash_change_not_required", "hash impact mismatch", failures);
  failUnless(record.implicated_path === "app/globals.css", "implicated path mismatch", failures);
  failUnless(record.implicated_path_classification === "clean_base_file", "path classification mismatch", failures);
  failUnless(record.candidate_source_defect_proven === false, "candidate source defect should not be proven", failures);
  failUnless(record.candidate_configuration_defect_proven === false, "candidate config defect should not be proven", failures);
  failUnless(record.candidate_hash_change_required === false, "candidate hash change should not be required", failures);

  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.remediation_scope === "runner_environment_contract_remediation", "remediation scope mismatch", failures);
  failUnless(record.remediation_scope_vocabulary.includes("temporary_candidate_mount_or_sandbox_remediation"), "scope vocabulary missing mount/sandbox", failures);
  failUnless(record.remediation_scope_vocabulary.includes("runner_environment_contract_remediation"), "scope vocabulary missing runner contract", failures);

  failUnless(record.source_readability_policy === "candidate_source_files_readable_by_current_process", "source readability policy mismatch", failures);
  failUnless(
    record.output_writability_policy === "generated_output_directories_writable_inside_action_temp_candidate",
    "output writability policy mismatch",
    failures,
  );
  failUnless(
    record.dependency_executable_mode_policy === "preserve_required_executable_modes_from_verified_local_copy",
    "dependency executable policy mismatch",
    failures,
  );
  failUnless(record.sandbox_or_mount_policy === "unresolved_precheck_required_before_rehearsal_retry", "sandbox/mount policy mismatch", failures);
  failUnless(
    record.temporary_permission_policy === "temporary_action_specific_subtree_only_no_global_permission_change",
    "temporary permission policy mismatch",
    failures,
  );

  for (const key of [
    "candidate_directories_traversable",
    "candidate_source_files_readable",
    "generated_output_directories_writable",
    "copied_local_executables_executable_only_where_already_required",
  ]) {
    failUnless(record.path_permission_contract[key] === true, `${key} should be true`, failures);
  }
  for (const key of [
    "world_writable_required",
    "elevated_privilege_required",
    "sudo_required",
    "global_permission_changes_required",
    "active_repository_permissions_modified",
    "source_node_modules_permissions_modified",
  ]) {
    failUnless(record.path_permission_contract[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.turbopack_policy.turbopack_process_resource_failure_recorded === true, "Turbopack failure policy mismatch", failures);
  failUnless(record.turbopack_policy.silently_replace_production_build_path === false, "Turbopack replacement allowed", failures);
  failUnless(record.turbopack_policy.non_turbopack_comparison_only === true, "comparison-only policy mismatch", failures);
  failUnless(record.turbopack_policy.non_turbopack_comparison_establishes_deployment_readiness === false, "comparison deployment readiness mismatch", failures);

  failUnless(record.candidate_preservation_requirements.candidate_file_count === expected.count, "preserved count mismatch", failures);
  failUnless(record.candidate_preservation_requirements.change_candidate_hash === expected.changeHash, "preserved change hash mismatch", failures);
  failUnless(record.candidate_preservation_requirements.full_candidate_inventory_hash === expected.fullHash, "preserved full hash mismatch", failures);
  failUnless(record.candidate_preservation_requirements.app_globals_css_unchanged_required === true, "app globals preservation missing", failures);
  failUnless(record.candidate_preservation_requirements.package_json_unchanged_required === true, "package preservation missing", failures);
  failUnless(record.candidate_preservation_requirements.preview_helper_unchanged_required === true, "preview helper preservation missing", failures);

  failUnless(record.future_action_505_boundary.max_rehearsal_attempts === 1, "Action 505 attempt mismatch", failures);
  failUnless(record.future_action_505_boundary.same_action_retry_allowed === false, "Action 505 retry allowed", failures);
  failUnless(record.future_action_505_boundary.deployment_authorized === false, "Action 505 deployment authorized", failures);
  failUnless(record.future_action_505_boundary.activation_authorized === false, "Action 505 activation authorized", failures);
  failUnless(record.future_action_505_boundary.network_or_install_authorized === false, "Action 505 network/install authorized", failures);

  for (const key of [
    "elevated_privilege_authorized",
    "global_permission_change_authorized",
    "broad_permission_weakening_authorized",
    "candidate_source_change_authorized",
    "app_globals_css_change_authorized",
    "package_or_lockfile_change_authorized",
    "package_script_change_authorized",
    "nextjs_update_authorized",
    "dependency_install_authorized",
    "raw_logs_retained",
    "raw_environment_values_recorded",
    "credential_values_recorded",
    "absolute_machine_paths_recorded",
    "build_performed",
    "rehearsal_authorized",
    "rehearsal_performed",
    "deployment_authorized",
    "deployment_performed",
    "activation_authorized",
    "preview_activated",
    "provider_called",
    "supabase_accessed",
    "persistence_created",
    "replay_created",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(
    record.runner_remediation_readiness === "runner_environment_remediation_ready_with_conditions",
    "readiness mismatch",
    failures,
  );
  failUnless(record.approval_decision === "approved_with_conditions", "approval decision mismatch", failures);
  failUnless(record.unresolved_conditions.length === 1, "unresolved condition count mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Build phase: `build_bundling`",
    "Primary error class: `process_resource_error`",
    "Primary remediation scope: `runner_environment_contract_remediation`",
    "Runner remediation readiness: `runner_environment_remediation_ready_with_conditions`",
    "Approval decision: `approved_with_conditions`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_504_confidence_calibration_recommendation_advisory_projection_preview_candidate_build_runner_or_environment_remediation_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  approval_decision: record?.approval_decision ?? null,
  runner_remediation_readiness: record?.runner_remediation_readiness ?? null,
  remediation_scope: record?.remediation_scope ?? null,
  root_cause_classification: record?.root_cause_classification ?? null,
  candidate_hash_impact: record?.candidate_hash_impact ?? null,
  next_action: record?.next_action ?? null,
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

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
