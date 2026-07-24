#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-record.json";
const docPath =
  "docs/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-completion-gate.md";
const action504Path =
  "docs/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-remediation-approval-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  nextAction: "action_506_turbopack_runner_environment_comparison_and_rehearsal_gate",
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
for (const relativePath of [recordPath, docPath, action504Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action504 = readJson(action504Path);

  failUnless(action504.approval_decision === "approved_with_conditions", "Action 504 approval mismatch", failures);
  failUnless(
    action504.runner_remediation_readiness === "runner_environment_remediation_ready_with_conditions",
    "Action 504 readiness mismatch",
    failures,
  );
  failUnless(record.schema_version === "action_505_runner_environment_precheck_record_v1", "schema mismatch", failures);
  failUnless(record.source_action === 504, "source action mismatch", failures);
  failUnless(record.diagnostic_classification === "runner_environment_precheck_completion", "classification mismatch", failures);
  failUnless(record.prior_root_cause === "candidate_build_environment_contract_defect", "prior root cause mismatch", failures);
  failUnless(record.prior_build_phase === "build_bundling", "prior phase mismatch", failures);
  failUnless(record.prior_error_class === "process_resource_error", "prior error class mismatch", failures);
  failUnless(record.prior_os_error === "operation_not_permitted", "prior OS error mismatch", failures);
  failUnless(record.implicated_resource === "app/globals.css", "implicated resource mismatch", failures);
  failUnless(record.candidate_source_defect_proven === false, "candidate source defect should not be proven", failures);
  failUnless(record.candidate_hash_change_required === false, "candidate hash change should not be required", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);

  failUnless(record.source_exists === true, "source missing", failures);
  failUnless(record.source_hash_matches === true, "source hash mismatch", failures);
  failUnless(record.source_readability === "passed", "source readability mismatch", failures);
  failUnless(record.directory_traversal === "passed", "directory traversal mismatch", failures);
  failUnless(record.output_parent_writability === "passed", "output parent writability mismatch", failures);
  failUnless(record.nested_output_writability === "passed", "nested output writability mismatch", failures);
  failUnless(record.temporary_file_round_trip === "passed", "temporary round trip mismatch", failures);
  failUnless(record.output_cleanup === "passed", "output cleanup mismatch", failures);
  failUnless(record.dependency_copy_available === "passed", "dependency copy mismatch", failures);
  failUnless(record.required_binary_modes_preserved === "passed", "binary mode preservation mismatch", failures);
  failUnless(record.dependency_readability === "passed", "dependency readability mismatch", failures);
  failUnless(record.source_dependency_tree_modified === false, "source dependency tree changed", failures);
  failUnless(record.child_process_capability === "passed", "child process capability mismatch", failures);
  failUnless(record.local_binary_execution === "passed", "local binary execution mismatch", failures);
  failUnless(record.bounded_file_resource_operation === "passed", "bounded file operation mismatch", failures);

  failUnless(record.temp_boundary_classification_vocabulary.includes(record.temp_boundary_classification), "temp boundary classification outside vocabulary", failures);
  failUnless(record.temp_boundary_classification === "temp_boundary_restriction_not_detected", "temp boundary classification mismatch", failures);
  failUnless(record.approved_execution_root_classification === "canonical_system_temp", "execution root mismatch", failures);
  failUnless(record.remediation_strategy === "bounded_turbopack_runner_environment_adjustment", "remediation strategy mismatch", failures);
  failUnless(
    record.turbopack_comparison_policy === "turbopack_comparison_recommended_for_diagnosis_only",
    "Turbopack comparison policy mismatch",
    failures,
  );
  failUnless(
    record.precheck_readiness === "runner_environment_precheck_ready_with_conditions",
    "precheck readiness mismatch",
    failures,
  );
  failUnless(record.approval_decision === "approved_with_conditions", "approval decision mismatch", failures);
  failUnless(record.unresolved_conditions.length === 1, "unresolved condition count mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const key of [
    "elevated_privilege_required",
    "sudo_used",
    "global_permission_change_required",
    "global_permission_change_performed",
    "candidate_source_change_required",
    "candidate_hash_change_required",
    "package_or_lockfile_change_required",
    "source_permission_change_performed",
    "build_performed",
    "rehearsal_performed",
    "deployment_performed",
    "preview_activated",
    "environment_modified",
    "network_used",
    "install_performed",
    "netlify_operation_performed",
    "provider_called",
    "supabase_accessed",
    "persistence_created",
    "replay_created",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
    "credential_values_recorded",
    "absolute_machine_paths_recorded",
    "ownership_names_recorded",
    "complete_file_mode_inventory_recorded",
    "raw_command_output_recorded",
    "environment_values_recorded",
    "source_contents_recorded",
    "mount_table_output_recorded",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.cleanup_result === "cleanup_passed", "cleanup mismatch", failures);
  failUnless(record.temporary_precheck_subtree_absent_after_cleanup === true, "temp subtree cleanup mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);

  for (const phrase of [
    "Source readability: `passed`",
    "Output parent writability: `passed`",
    "Required binary modes preserved: `passed`",
    "Temp-boundary classification: `temp_boundary_restriction_not_detected`",
    "Remediation strategy: `bounded_turbopack_runner_environment_adjustment`",
    "Precheck readiness: `runner_environment_precheck_ready_with_conditions`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_505_confidence_calibration_recommendation_advisory_projection_preview_runner_environment_precheck_completion_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  precheck_readiness: record?.precheck_readiness ?? null,
  approval_decision: record?.approval_decision ?? null,
  temp_boundary_classification: record?.temp_boundary_classification ?? null,
  approved_execution_root_classification: record?.approved_execution_root_classification ?? null,
  remediation_strategy: record?.remediation_strategy ?? null,
  turbopack_comparison_policy: record?.turbopack_comparison_policy ?? null,
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
