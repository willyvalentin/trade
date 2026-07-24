#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-approval-record.json";
const docPath =
  "docs/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-gate.md";
const action505Path =
  "docs/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  runtimePathHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  candidateCount: 31,
  nextAction: "action_507_turbopack_comparison_invocation_completion_gate",
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
for (const relativePath of [recordPath, docPath, action505Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action505 = readJson(action505Path);

  failUnless(
    action505.precheck_readiness === "runner_environment_precheck_ready_with_conditions",
    "Action 505 readiness mismatch",
    failures,
  );
  failUnless(
    action505.temp_boundary_classification === "temp_boundary_restriction_not_detected",
    "Action 505 temp classification mismatch",
    failures,
  );
  failUnless(
    action505.remediation_strategy === "bounded_turbopack_runner_environment_adjustment",
    "Action 505 remediation strategy mismatch",
    failures,
  );

  failUnless(
    record.schema_version === "action_506_turbopack_runner_environment_comparison_and_rehearsal_approval_record_v1",
    "schema mismatch",
    failures,
  );
  failUnless(record.source_action === 505, "source action mismatch", failures);
  failUnless(record.action_505_precheck_readiness === action505.precheck_readiness, "record Action 505 readiness mismatch", failures);
  failUnless(
    record.action_505_temp_boundary_classification === action505.temp_boundary_classification,
    "record Action 505 temp classification mismatch",
    failures,
  );
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.candidateCount, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.runtimePathHash, "runtime path hash mismatch", failures);

  failUnless(
    record.comparison_classification === "turbopack_runner_environment_comparison",
    "comparison classification mismatch",
    failures,
  );
  failUnless(record.authoritative_build_command === "npm run build", "authoritative build command mismatch", failures);
  failUnless(
    record.authoritative_build_classification === "authoritative_turbopack_build",
    "authoritative build class mismatch",
    failures,
  );
  for (const classification of [
    "authoritative_turbopack_build",
    "comparison_non_turbopack_build",
    "comparison_not_available",
    "comparison_not_safe",
  ]) {
    failUnless(
      record.comparison_command_classification_vocabulary.includes(classification),
      `missing comparison classification: ${classification}`,
      failures,
    );
  }
  failUnless(
    record.comparison_command_classification === "comparison_non_turbopack_build",
    "comparison command classification mismatch",
    failures,
  );
  failUnless(
    record.comparison_invocation_exactness === "unresolved_local_tooling_precheck_required",
    "comparison invocation exactness mismatch",
    failures,
  );

  for (const outcome of [
    "turbopack_failed_comparison_passed",
    "turbopack_failed_comparison_failed",
    "turbopack_passed_comparison_not_required",
    "turbopack_failure_not_reproduced",
    "comparison_unavailable",
    "comparison_inconclusive",
    "comparison_execution_failed",
  ]) {
    failUnless(record.comparison_outcome_vocabulary.includes(outcome), `missing outcome: ${outcome}`, failures);
  }

  failUnless(record.comparison_attempt_limit === 1, "comparison attempt limit mismatch", failures);
  failUnless(record.authoritative_rehearsal_attempt_limit === 1, "authoritative attempt limit mismatch", failures);
  failUnless(record.maximum_build_process_invocations === 2, "maximum invocation count mismatch", failures);
  failUnless(record.same_action_retry_allowed === false, "same-action retry should be false", failures);
  failUnless(record.two_authoritative_builds_allowed === false, "two authoritative builds should be false", failures);
  failUnless(
    record.comparison_can_establish_deployment_readiness === false,
    "comparison readiness authority mismatch",
    failures,
  );
  failUnless(record.authoritative_build_required_for_readiness === true, "authoritative readiness requirement mismatch", failures);

  failUnless(record.future_action_507_sequence.length === 8, "Action 507 sequence length mismatch", failures);
  failUnless(
    record.future_action_507_sequence[0] === "phase_0_safe_canonical_action_specific_temp_boundary",
    "Action 507 phase 0 mismatch",
    failures,
  );
  failUnless(
    record.future_action_507_boundary.maximum_total_build_process_invocations === 2,
    "Action 507 max invocation mismatch",
    failures,
  );
  failUnless(
    record.future_action_507_boundary.comparison_must_retain_no_raw_logs === true,
    "comparison raw-log boundary mismatch",
    failures,
  );
  failUnless(
    record.future_action_507_boundary.authoritative_rehearsal_can_pass_only_when_npm_run_build_passes === true,
    "authoritative rehearsal semantics mismatch",
    failures,
  );

  for (const key of [
    "retain_command_classification",
    "retain_pass_fail",
    "retain_exit_classification",
    "retain_build_phase",
    "retain_primary_error_class",
    "retain_bounded_sanitized_summary",
    "retain_repository_relative_implicated_paths",
    "retain_turbopack_specific_comparison_result",
  ]) {
    failUnless(record.diagnostic_evidence_boundary[key] === true, `${key} should be retained`, failures);
  }
  for (const key of [
    "retain_full_logs",
    "retain_absolute_paths",
    "retain_environment_values",
    "retain_credentials",
    "retain_source_contents",
    "retain_complete_stack_traces",
  ]) {
    failUnless(record.diagnostic_evidence_boundary[key] === false, `${key} should not be retained`, failures);
  }

  failUnless(record.candidate_preservation.candidate_count_required === expected.candidateCount, "candidate preservation count mismatch", failures);
  failUnless(record.candidate_preservation.change_hash_required === expected.changeHash, "candidate preservation change hash mismatch", failures);
  failUnless(record.candidate_preservation.full_inventory_hash_required === expected.fullHash, "candidate preservation full hash mismatch", failures);
  for (const key of [
    "app_globals_css_unchanged_required",
    "package_json_unchanged_required",
    "package_lock_json_unchanged_required",
    "next_config_unchanged_required",
    "preview_helper_unchanged_required",
    "source_node_modules_unchanged_required",
    "active_worktree_unchanged_required",
  ]) {
    failUnless(record.candidate_preservation[key] === true, `${key} should be required`, failures);
  }

  for (const key of [
    "candidate_change_required",
    "package_script_change_required",
    "configuration_change_required",
    "package_or_lockfile_change_required",
    "environment_change_required",
    "build_or_comparison_performed",
    "build_performed",
    "comparison_performed",
    "rehearsal_performed",
    "deployment_performed",
    "activation_performed",
    "deployment_authorized",
    "activation_authorized",
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
    "raw_command_output_recorded",
    "environment_values_recorded",
    "source_contents_recorded",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(
    record.comparison_readiness === "turbopack_comparison_ready_with_conditions",
    "comparison readiness mismatch",
    failures,
  );
  failUnless(
    record.rehearsal_readiness === "runner_remediated_rehearsal_ready_with_conditions",
    "rehearsal readiness mismatch",
    failures,
  );
  failUnless(record.approval_decision === "approved_with_conditions", "approval decision mismatch", failures);
  failUnless(record.unresolved_conditions.length === 1, "unresolved condition count mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Authoritative command: `npm run build`",
    "Comparison can establish deployment readiness: `false`",
    "Comparison readiness: `turbopack_comparison_ready_with_conditions`",
    "Rehearsal readiness: `runner_remediated_rehearsal_ready_with_conditions`",
    "Approval decision: `approved_with_conditions`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_506_confidence_calibration_recommendation_advisory_projection_preview_turbopack_runner_environment_comparison_and_rehearsal_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  comparison_readiness: record?.comparison_readiness ?? null,
  rehearsal_readiness: record?.rehearsal_readiness ?? null,
  approval_decision: record?.approval_decision ?? null,
  comparison_command_classification: record?.comparison_command_classification ?? null,
  authoritative_build_command: record?.authoritative_build_command ?? null,
  maximum_build_process_invocations: record?.maximum_build_process_invocations ?? null,
  next_action: record?.next_action ?? null,
  build_free: true,
  comparison_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  candidate_immutable: true,
  environment_immutable: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
