#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-record.json";
const docPath =
  "docs/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-completion-gate.md";
const action512Path =
  "docs/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-approval-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  addedRuntimeHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  precheck: "webpack_invocation_runtime_precheck_completion",
  readiness: "webpack_invocation_runtime_precheck_ready",
  approval: "approved",
  selectedModel: "direct_local_node_cli_invocation",
  nextAction: "action_514_webpack_build_failure_bounded_diagnostic_retry_after_invocation_remediation",
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
for (const relativePath of [recordPath, docPath, action512Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const action512 = readJson(action512Path);
  const doc = read(docPath);

  failUnless(action512.approval_decision === "approved_with_conditions", "Action 512 approval mismatch", failures);
  failUnless(
    action512.blocker_classification === "webpack_comparison_child_process_node_runtime_not_resolved",
    "Action 512 blocker mismatch",
    failures,
  );
  failUnless(
    action512.invocation_failure_cause === "diagnostic_child_process_path_sanitized_too_aggressively",
    "Action 512 cause mismatch",
    failures,
  );

  failUnless(
    record.schema_version === "action_513_webpack_invocation_runtime_precheck_completion_record_v1",
    "schema mismatch",
    failures,
  );
  failUnless(record.source_action === 512, "source action mismatch", failures);
  failUnless(record.precheck_classification === expected.precheck, "precheck classification mismatch", failures);
  failUnless(record.prior_blocker === action512.blocker_classification, "prior blocker mismatch", failures);
  failUnless(record.prior_failure_cause === action512.invocation_failure_cause, "prior cause mismatch", failures);
  failUnless(record.previous_webpack_compilation_started === false, "previous compilation boundary mismatch", failures);
  failUnless(record.candidate_defect_proven === false, "candidate defect boundary mismatch", failures);
  failUnless(record.candidate_hash_change_required === false, "candidate hash boundary mismatch", failures);

  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === 31, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedRuntimeHash, "added runtime hash mismatch", failures);
  failUnless(record.preview_flag_state === "absent_or_disabled", "preview flag mismatch", failures);

  failUnless(record.temporary_boundary.classification === "action_513_safe_canonical_temp_boundary", "temp boundary mismatch", failures);
  failUnless(record.temporary_boundary.path_relative_containment === true, "temp containment mismatch", failures);
  failUnless(record.temporary_boundary.textual_prefix_only_containment_rejected === true, "textual containment mismatch", failures);
  failUnless(record.temporary_boundary.traversal_rejected === true, "traversal mismatch", failures);
  failUnless(record.temporary_boundary.cleanup_result === "cleanup_passed", "temp cleanup mismatch", failures);

  failUnless(record.parent_node_runtime_result === "parent_node_runtime_present", "parent Node result mismatch", failures);
  failUnless(record.parent_node_runtime_executable_classification === "approved_existing_local_runtime", "parent runtime class mismatch", failures);
  failUnless(record.parent_node_version_classification === "node_26_x", "parent Node version mismatch", failures);
  failUnless(record.parent_node_child_constant_check === "passed", "parent child check mismatch", failures);
  failUnless(record.parent_node_network_access === false, "parent network mismatch", failures);

  failUnless(record.candidate_local_next_cli_result === "candidate_local_next_cli_present", "candidate local Next result mismatch", failures);
  failUnless(record.candidate_local_next_cli_tree_classification === "materialized_candidate_dependency_tree", "Next tree mismatch", failures);
  failUnless(record.candidate_local_next_version_classification === "16.2.6", "Next version mismatch", failures);
  failUnless(record.candidate_local_next_cli_global === false, "global Next should be false", failures);
  failUnless(record.candidate_local_next_cli_resolved_by_approved_node_runtime === true, "Next runtime resolution mismatch", failures);

  failUnless(record.selected_invocation_model === expected.selectedModel, "selected invocation model mismatch", failures);
  failUnless(record.runtime_path_policy === "direct_runtime_invocation", "runtime path policy mismatch", failures);
  failUnless(record.node_runtime_resolves_in_child === true, "child Node resolution mismatch", failures);
  failUnless(record.candidate_local_cli_resolves_in_child === true, "child CLI resolution mismatch", failures);
  failUnless(record.next_version_matches === true, "Next version match mismatch", failures);
  failUnless(record.webpack_option_supported === true, "Webpack option support mismatch", failures);
  failUnless(record.evaluated_invocation_models.direct_local_node_cli_invocation.selected === true, "direct model selection mismatch", failures);
  failUnless(record.evaluated_invocation_models.ephemeral_allowlisted_runtime_path_propagation.fallback_available === true, "fallback model mismatch", failures);
  failUnless(record.harmless_invocation_checks.full_build_arguments_invoked === false, "full build args should not be invoked", failures);
  failUnless(record.harmless_invocation_checks.build_started === false, "help check should not start build", failures);

  for (const key of [
    "global_next_cli_used",
    "another_node_version_used",
    "another_next_version_used",
    "npx_used",
    "raw_path_recorded",
    "full_environment_enumerated",
    "raw_environment_values_recorded",
    "credential_values_recorded",
    "absolute_executable_paths_recorded",
    "environment_persisted",
    "persistent_environment_modified",
    "network_used",
    "install_performed",
    "build_started",
    "webpack_executed",
    "authoritative_build_executed",
    "full_rehearsal_executed",
    "candidate_modified",
    "package_or_lockfile_modified",
    "package_script_modified",
    "configuration_modified",
    "candidate_change_required",
    "package_or_config_change_required",
    "install_required",
    "persistent_path_modification_required",
    "raw_environment_exposure_required",
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

  failUnless(includesAll(record.readiness_vocabulary, ["webpack_invocation_runtime_precheck_ready", "webpack_invocation_runtime_precheck_blocked"]), "readiness vocabulary mismatch", failures);
  failUnless(record.blocking_rules.parent_node_runtime_absent === "blocked", "parent Node absent rule mismatch", failures);
  failUnless(record.blocking_rules.candidate_local_next_cli_absent === "blocked", "candidate Next absent rule mismatch", failures);
  failUnless(record.blocking_rules.candidate_local_next_cli_version_mismatch === "blocked", "version mismatch rule mismatch", failures);
  failUnless(record.blocking_rules.global_next_cli_required === "blocked", "global CLI rule mismatch", failures);
  failUnless(record.blocking_rules.persistent_path_modification_required === "blocked", "persistent PATH rule mismatch", failures);

  failUnless(record.precheck_readiness === expected.readiness, "readiness mismatch", failures);
  failUnless(record.approval_decision === expected.approval, "approval mismatch", failures);
  failUnless(record.unresolved_conditions.length === 0, "unresolved conditions mismatch", failures);
  failUnless(record.diagnostic_retry_authorized === true, "diagnostic retry authorization mismatch", failures);
  failUnless(record.diagnostic_retry_limit === 1, "diagnostic retry limit mismatch", failures);
  failUnless(record.diagnostic_retry_performed === false, "diagnostic retry should not be performed", failures);
  failUnless(record.authoritative_build_authorized === false, "authoritative build should not be authorized", failures);
  failUnless(record.authoritative_build_attempt_limit === 0, "authoritative attempt limit mismatch", failures);
  failUnless(record.full_rehearsal_authorized === false, "full rehearsal should not be authorized", failures);
  failUnless(record.same_action_retry_authorized === false, "same-action retry should not be authorized", failures);
  failUnless(record.deployment_authorized === false, "deployment should not be authorized", failures);
  failUnless(record.activation_authorized === false, "activation should not be authorized", failures);
  failUnless(record.cleanup_result === "cleanup_passed", "cleanup mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Selected model: `direct_local_node_cli_invocation`",
    "Build started: `false`",
    "Precheck readiness: `webpack_invocation_runtime_precheck_ready`",
    "Approval decision: `approved`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_513_confidence_calibration_recommendation_advisory_projection_preview_webpack_invocation_runtime_precheck_completion_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  precheck_classification: record?.precheck_classification ?? null,
  parent_node_runtime_result: record?.parent_node_runtime_result ?? null,
  candidate_local_next_cli_result: record?.candidate_local_next_cli_result ?? null,
  selected_invocation_model: record?.selected_invocation_model ?? null,
  webpack_option_supported: record?.webpack_option_supported ?? null,
  build_started: record?.build_started ?? null,
  precheck_readiness: record?.precheck_readiness ?? null,
  approval_decision: record?.approval_decision ?? null,
  diagnostic_retry_authorized: record?.diagnostic_retry_authorized ?? null,
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
