#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-record.json";
const docPath =
  "docs/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-gate.md";
const action506Path =
  "docs/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-approval-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  candidateCount: 31,
  nextAction: "action_508_turbopack_runner_environment_comparison_and_runtime_complete_candidate_rehearsal",
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
for (const relativePath of [recordPath, docPath, action506Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action506 = readJson(action506Path);

  failUnless(action506.approval_decision === "approved_with_conditions", "Action 506 approval mismatch", failures);
  failUnless(
    action506.comparison_readiness === "turbopack_comparison_ready_with_conditions",
    "Action 506 comparison readiness mismatch",
    failures,
  );
  failUnless(
    action506.next_action === "action_507_turbopack_comparison_invocation_completion_gate",
    "Action 506 next action mismatch",
    failures,
  );

  failUnless(record.schema_version === "action_507_turbopack_comparison_invocation_completion_record_v1", "schema mismatch", failures);
  failUnless(record.source_action === 506, "source action mismatch", failures);
  failUnless(
    record.comparison_completion_classification === "turbopack_comparison_invocation_completion",
    "completion classification mismatch",
    failures,
  );
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.candidateCount, "candidate count mismatch", failures);

  failUnless(record.authoritative_build_command === "npm run build", "authoritative command mismatch", failures);
  failUnless(
    record.authoritative_build_classification === "authoritative_turbopack_build",
    "authoritative build class mismatch",
    failures,
  );
  failUnless(
    record.installed_next_tooling_classification === "next_16_2_6_build_cli_supports_explicit_webpack_flag",
    "installed tooling classification mismatch",
    failures,
  );
  failUnless(record.installed_next_version_classification === "next_16_2_6", "Next version classification mismatch", failures);
  failUnless(
    record.local_tooling_inspection_sources.includes("installed_next_build_cli_option_parser"),
    "missing CLI parser inspection source",
    failures,
  );
  failUnless(record.full_cli_help_output_retained === false, "full CLI help should not be retained", failures);
  failUnless(record.raw_cli_output_retained === false, "raw CLI output should not be retained", failures);

  for (const classification of [
    "supported_non_turbopack_comparison_invocation",
    "supported_explicit_turbopack_invocation_only",
    "no_supported_engine_selection_invocation",
    "invocation_requires_package_script_change",
    "invocation_requires_configuration_change",
    "invocation_requires_dependency_change",
    "invocation_capability_ambiguous",
    "invocation_inspection_failed",
  ]) {
    failUnless(
      record.comparison_invocation_classification_vocabulary.includes(classification),
      `missing invocation classification: ${classification}`,
      failures,
    );
  }
  failUnless(
    record.comparison_invocation_classification === "supported_non_turbopack_comparison_invocation",
    "invocation classification mismatch",
    failures,
  );
  failUnless(record.comparison_invocation_supported === true, "comparison invocation should be supported", failures);
  failUnless(record.supported_by_installed_tooling === true, "installed tooling support mismatch", failures);
  failUnless(record.comparison_engine_classification === "webpack_comparison_engine", "comparison engine mismatch", failures);
  failUnless(
    record.comparison_invocation.executable_classification === "installed_next_cli_from_same_candidate_dependency_tree",
    "executable classification mismatch",
    failures,
  );
  failUnless(
    record.comparison_invocation.argument_list_classification === "build_with_explicit_webpack_flag",
    "argument list classification mismatch",
    failures,
  );
  failUnless(record.comparison_invocation.sanitized_command_form === "next build --webpack", "sanitized command mismatch", failures);
  failUnless(record.comparison_invocation.executed === false, "comparison invocation should not be executed", failures);

  for (const key of [
    "package_script_change_required",
    "configuration_change_required",
    "dependency_change_required",
    "candidate_change_required",
    "network_required",
    "install_required",
    "persistent_environment_mutation_required",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.authoritative_attempt_limit === 1, "authoritative attempt limit mismatch", failures);
  failUnless(record.comparison_attempt_limit === 1, "comparison attempt limit mismatch", failures);
  failUnless(record.maximum_build_process_invocations === 2, "max invocation mismatch", failures);
  failUnless(record.same_action_retry_allowed === false, "same-action retry should be false", failures);
  failUnless(record.two_authoritative_builds_allowed === false, "two authoritative builds should be false", failures);
  failUnless(
    record.comparison_establishes_deployment_readiness === false,
    "comparison deployment readiness mismatch",
    failures,
  );
  failUnless(record.authoritative_build_required_for_readiness === true, "authoritative readiness mismatch", failures);

  failUnless(record.future_action_508_sequence.length === 7, "Action 508 sequence length mismatch", failures);
  failUnless(
    record.future_action_508_boundary.authoritative_first_sequence_required === true,
    "authoritative-first boundary mismatch",
    failures,
  );
  failUnless(record.future_action_508_boundary.comparison_first_allowed === false, "comparison-first should be blocked", failures);
  failUnless(
    record.future_action_508_boundary.changed_authoritative_failure_classification_blocks_comparison === true,
    "changed failure classification boundary mismatch",
    failures,
  );

  failUnless(
    record.outcome_mapping.authoritative_build_passes.outcome === "turbopack_passed_comparison_not_required",
    "authoritative pass outcome mismatch",
    failures,
  );
  failUnless(
    record.outcome_mapping.authoritative_same_resource_failure_and_comparison_passes.outcome ===
      "turbopack_failed_comparison_passed",
    "same failure comparison pass outcome mismatch",
    failures,
  );
  failUnless(record.outcome_mapping.both_fail.outcome === "turbopack_failed_comparison_failed", "both-fail outcome mismatch", failures);
  failUnless(
    record.outcome_mapping.authoritative_failure_not_reproduced.outcome === "turbopack_failure_not_reproduced",
    "not-reproduced outcome mismatch",
    failures,
  );

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

  failUnless(record.invocation_readiness === "comparison_invocation_ready", "invocation readiness mismatch", failures);
  failUnless(record.execution_readiness === "comparison_execution_ready", "execution readiness mismatch", failures);
  failUnless(record.approval_decision === "approved", "approval decision mismatch", failures);
  failUnless(record.unresolved_conditions.length === 0, "unresolved conditions should be empty", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const key of [
    "build_performed",
    "comparison_performed",
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
    "raw_environment_values_recorded",
    "complete_command_output_recorded",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);

  for (const phrase of [
    "Comparison invocation classification: `supported_non_turbopack_comparison_invocation`",
    "Sanitized command form: `next build --webpack`",
    "Invocation readiness: `comparison_invocation_ready`",
    "Execution readiness: `comparison_execution_ready`",
    "Approval decision: `approved`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_507_confidence_calibration_recommendation_advisory_projection_preview_turbopack_comparison_invocation_completion_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  installed_next_tooling_classification: record?.installed_next_tooling_classification ?? null,
  comparison_invocation_classification: record?.comparison_invocation_classification ?? null,
  comparison_invocation_supported: record?.comparison_invocation_supported ?? null,
  authoritative_build_command: record?.authoritative_build_command ?? null,
  invocation_readiness: record?.invocation_readiness ?? null,
  execution_readiness: record?.execution_readiness ?? null,
  approval_decision: record?.approval_decision ?? null,
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
