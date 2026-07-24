#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-approval-record.json";
const docPath =
  "docs/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-gate.md";
const action511Path =
  "docs/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  addedRuntimeHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  blocker: "webpack_comparison_child_process_node_runtime_not_resolved",
  cause: "diagnostic_child_process_path_sanitized_too_aggressively",
  invocationModel: "ephemeral_allowlisted_runtime_path_propagation",
  readiness: "webpack_invocation_remediation_ready_with_conditions",
  approval: "approved_with_conditions",
  nextAction: "action_513_webpack_invocation_runtime_precheck_completion_gate",
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

function includesAll(values, expectedValues) {
  return expectedValues.every((value) => values.includes(value));
}

const failures = [];
for (const relativePath of [recordPath, docPath, action511Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const action511 = readJson(action511Path);
  const doc = read(docPath);

  failUnless(action511.diagnostic_result === "webpack_diagnostic_failure_captured", "Action 511 result mismatch", failures);
  failUnless(action511.webpack_exit_code === 127, "Action 511 exit code mismatch", failures);
  failUnless(
    action511.candidate_vs_runner_classification === "webpack_comparison_invocation_defect",
    "Action 511 comparison classification mismatch",
    failures,
  );
  failUnless(action511.webpack_started === false, "Action 511 should not have started Webpack", failures);

  failUnless(
    record.schema_version === "action_512_webpack_comparison_invocation_remediation_approval_record_v1",
    "schema mismatch",
    failures,
  );
  failUnless(record.source_action === 511, "source action mismatch", failures);
  failUnless(record.action_511_diagnostic_result === action511.diagnostic_result, "record Action 511 result mismatch", failures);
  failUnless(record.action_511_exit_code === 127, "record Action 511 exit mismatch", failures);
  failUnless(record.action_511_failure_classification === "webpack_comparison_invocation_defect", "failure classification mismatch", failures);
  failUnless(record.blocker_classification === expected.blocker, "blocker classification mismatch", failures);
  failUnless(record.blocker_boundary.env_launcher_executed === true, "env launcher boundary mismatch", failures);
  failUnless(record.blocker_boundary.node_runtime_resolved_by_child === false, "child node resolution mismatch", failures);
  failUnless(record.blocker_boundary.webpack_compilation_started === false, "webpack boundary mismatch", failures);
  failUnless(record.blocker_boundary.source_path_implicated === false, "source path implication mismatch", failures);
  failUnless(record.blocker_boundary.candidate_defect_proven === false, "candidate defect boundary mismatch", failures);
  failUnless(record.blocker_boundary.cleanup_passed === true, "cleanup boundary mismatch", failures);

  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  failUnless(record.candidate_file_count === 31, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedRuntimeHash, "added runtime hash mismatch", failures);
  failUnless(record.preview_flag_state === "absent_or_disabled", "preview flag mismatch", failures);

  failUnless(record.current_process_node_runtime === "present", "current node runtime mismatch", failures);
  failUnless(record.current_process_node_version_classification === "node_26_x", "node version classification mismatch", failures);
  failUnless(record.local_next_cli === "present", "local next cli mismatch", failures);
  failUnless(record.candidate_local_next_cli === "present", "candidate local next cli mismatch", failures);
  failUnless(record.candidate_node_modules_next_cli === "present", "candidate node_modules next cli mismatch", failures);
  failUnless(record.next_version_classification === "16.2.6", "next version classification mismatch", failures);
  failUnless(record.source_dependency_tree_node_runtime_dependency === "not_applicable", "node dependency tree mismatch", failures);

  failUnless(record.invocation_failure_cause === expected.cause, "invocation failure cause mismatch", failures);
  failUnless(includesAll(record.invocation_failure_cause_vocabulary, [expected.cause, "local_node_runtime_unavailable"]), "cause vocabulary incomplete", failures);
  failUnless(record.approved_invocation_model === expected.invocationModel, "approved invocation model mismatch", failures);
  failUnless(record.permitted_alternative_invocation_model === "direct_local_node_cli_invocation", "alternative invocation model mismatch", failures);
  failUnless(record.runtime_path_policy === "process_scoped_ephemeral_allowlisted_runtime_path_only", "runtime path policy mismatch", failures);
  failUnless(record.candidate_local_cli_required === true, "candidate local CLI requirement mismatch", failures);
  failUnless(record.authoritative_executable_boundary.next_cli === "candidate_local_next_cli_from_materialized_node_modules", "Next CLI boundary mismatch", failures);
  failUnless(record.authoritative_executable_boundary.global_next_cli_allowed === false, "global Next CLI should be rejected", failures);
  failUnless(record.authoritative_executable_boundary.npx_allowed === false, "npx should be rejected", failures);
  failUnless(record.authoritative_executable_boundary.arguments.join(" ") === "build --webpack", "frozen arguments mismatch", failures);

  failUnless(record.environment_allowlist_policy.path === "ephemeral_runtime_path_supplied", "PATH policy mismatch", failures);
  failUnless(record.environment_allowlist_policy.canonical_preview_flag === "absent_or_disabled", "environment preview flag mismatch", failures);
  failUnless(record.runtime_resolution_precheck_required_for_action_513 === true, "Action 513 precheck requirement mismatch", failures);
  failUnless(
    includesAll(record.runtime_resolution_precheck_requirements, [
      "node_runtime_resolves_in_proposed_child_environment",
      "candidate_local_next_cli_resolves",
      "next_version_classification_matches_16_2_6",
      "no_network_required",
    ]),
    "precheck requirements incomplete",
    failures,
  );

  failUnless(record.retry_command_semantics === "next build --webpack", "retry command semantics mismatch", failures);
  failUnless(record.diagnostic_retry_limit === 1, "retry limit mismatch", failures);
  failUnless(record.authoritative_build_authorized === false, "authoritative build should not be authorized", failures);
  failUnless(record.authoritative_build_attempt_limit === 0, "authoritative attempt limit mismatch", failures);
  failUnless(record.full_rehearsal_authorized === false, "full rehearsal should not be authorized", failures);
  failUnless(record.same_action_retry_authorized === false, "same-action retry should not be authorized", failures);
  failUnless(record.deployment_authorized === false, "deployment should not be authorized", failures);
  failUnless(record.activation_authorized === false, "activation should not be authorized", failures);

  for (const key of [
    "raw_path_recorded",
    "full_environment_enumerated",
    "raw_environment_values_recorded",
    "credential_values_recorded",
    "absolute_executable_paths_recorded",
    "environment_persisted",
    "candidate_change_required",
    "package_or_config_change_required",
    "package_script_change_required",
    "install_required",
    "network_required",
    "node_install_allowed",
    "next_install_allowed",
    "sudo_allowed",
    "shell_profile_modification_allowed",
    "persistent_path_modification_allowed",
    "candidate_modified",
    "package_or_lockfile_modified",
    "configuration_modified",
    "persistent_environment_modified",
    "network_used",
    "install_performed",
    "deployment_performed",
    "preview_activated",
    "production_changed",
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
  failUnless(record.environment_restored === true, "environment restored mismatch", failures);

  failUnless(record.blocking_rules.missing_node_runtime === "blocked", "missing node blocking rule mismatch", failures);
  failUnless(record.blocking_rules.global_next_cli_required === "blocked", "global Next blocking rule mismatch", failures);
  failUnless(record.blocking_rules.another_next_version_required === "blocked", "Next version blocking rule mismatch", failures);
  failUnless(record.blocking_rules.package_script_modification_required === "blocked", "package script blocking rule mismatch", failures);

  failUnless(record.invocation_readiness === expected.readiness, "readiness mismatch", failures);
  failUnless(record.approval_decision === expected.approval, "approval mismatch", failures);
  failUnless(record.unresolved_conditions.length === 1, "unresolved condition count mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Blocker classification: `webpack_comparison_child_process_node_runtime_not_resolved`",
    "Approved invocation model: `ephemeral_allowlisted_runtime_path_propagation`",
    "Raw PATH recorded: `false`",
    "Approval decision: `approved_with_conditions`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_512_confidence_calibration_recommendation_advisory_projection_preview_webpack_comparison_invocation_remediation_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  blocker_classification: record?.blocker_classification ?? null,
  invocation_failure_cause: record?.invocation_failure_cause ?? null,
  approved_invocation_model: record?.approved_invocation_model ?? null,
  invocation_readiness: record?.invocation_readiness ?? null,
  approval_decision: record?.approval_decision ?? null,
  diagnostic_retry_limit: record?.diagnostic_retry_limit ?? null,
  authoritative_build_authorized: record?.authoritative_build_authorized ?? null,
  full_rehearsal_authorized: record?.full_rehearsal_authorized ?? null,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  credential_value_free: true,
  next_action: record?.next_action ?? null,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
