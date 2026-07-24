#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, lstatSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const resultPath =
  "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json";
const runnerPath =
  "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs";

const expected = {
  schema: "action_534_external_terminal_candidate_rehearsal_result_v1",
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  runtimePreview: "runtime_preview_waiting_for_operator_inputs",
  boundaryDefectClassification:
    "action_534_external_control_verifiers_misassigned_as_candidate_internal_prebuild_commands",
  staleExecutionClassification:
    "action_536_remediation_not_reflected_in_operator_executed_action_534_behavior",
  runnerContractVersion: "action_537_action_534_runner_contract_v1",
  action518Verifier:
    "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
  action532Verifier:
    "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
};

function sha256File(absolutePath) {
  return createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function hasUnsafeRetainedContent(text) {
  return (
    /eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/.test(text) ||
    /https?:\/\/[^\s"'{}[\],]+/i.test(text) ||
    /[a-z0-9-]+\.supabase\.co/i.test(text) ||
    /\/Users\/[A-Za-z0-9._-]+/.test(text) ||
    /\/(?:private\/)?var\/[^\s"']+/i.test(text) ||
    /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/i.test(text) ||
    /(SECRET|TOKEN|PASSWORD|KEY|SUPABASE)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{12,}/i.test(text)
  );
}

function commandStatus(results, commandPath) {
  return (Array.isArray(results) ? results : []).find((entry) =>
    typeof entry?.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

function isHistoricalAbortedAttempt(result) {
  return (
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_aborted" &&
    result.operator_rehearsal_attempt_number === 1 &&
    result.authoritative_build_attempt_count === 0 &&
    result.authoritative_error_class ===
      "candidate_hash_mismatch:docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json"
  );
}

function isBoundaryDefectFailedAttempt(result) {
  return (
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.authoritative_build_attempt_count === 0 &&
    result.candidate_reconstruction_result === "exact_candidate_reconstructed" &&
    result.runtime_dependency_closure_result === "complete" &&
    result.source_integrity_result === "baseline_plus_overlay_manifest_integrity" &&
    result.source_safety_result === "source_safety_passed" &&
    result.preview_flag_verification_result === "preview_flag_disabled_verified" &&
    result.dependency_materialization_result === "temporary_verified_node_modules_copy" &&
    commandStatus(result.prebuild_command_results, expected.action518Verifier) === "failed" &&
    commandStatus(result.prebuild_command_results, expected.action532Verifier) === "failed" &&
    commandStatus(result.prebuild_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.prebuild_command_results, "npx tsc --noEmit") === "passed" &&
    result.cleanup_result === "passed" &&
    result.deployment_performed === false &&
    result.preview_activated === false
  );
}

function isUnfingerprintedAction536CompletedAttempt(result) {
  return (
    result.runner_contract_version === undefined &&
    result.runner_script_sha256 === undefined &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.authoritative_build_attempt_count === 1 &&
    result.authoritative_build_result === "failed" &&
    result.webpack_diagnostic_attempt_count === 1 &&
    result.webpack_diagnostic_result === "passed" &&
    result.operator_rehearsal_attempt_number === 3 &&
    result.historical_operator_attempt_count === 2 &&
    result.prior_attempt_result === "external_terminal_candidate_rehearsal_failed" &&
    result.prior_attempt_blocker === "candidate_internal_external_control_boundary_defect" &&
    result.command_boundary_remediation_applied === true &&
    result.previous_blocker_classification === expected.boundaryDefectClassification &&
    Array.isArray(result.candidate_internal_command_results) &&
    commandStatus(result.candidate_internal_command_results, expected.action518Verifier) === undefined &&
    commandStatus(result.candidate_internal_command_results, expected.action532Verifier) === undefined &&
    commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed" &&
    Array.isArray(result.external_control_results) &&
    commandStatus(result.external_control_results, expected.action518Verifier) === "passed" &&
    commandStatus(result.external_control_results, expected.action532Verifier) === "passed" &&
    result.external_evidence_result === "passed" &&
    result.external_controls_can_establish_readiness_without_build === false &&
    result.cleanup_result === "passed" &&
    result.deployment_performed === false &&
    result.preview_activated === false
  );
}

function isRemediatedCompletedAttempt(result) {
  const runnerHash = sha256File(join(repoRoot, runnerPath));
  return (
    ["external_terminal_candidate_rehearsal_passed", "external_terminal_candidate_rehearsal_failed"].includes(
      result.candidate_rehearsal_result,
    ) &&
    [0, 1].includes(result.authoritative_build_attempt_count) &&
    result.runner_contract_version === expected.runnerContractVersion &&
    result.runner_script_sha256 === runnerHash &&
    result.result_written_at_classification === "fresh_action_534_result_object_created" &&
    result.fresh_result_object_created === true &&
    result.prior_command_results_reused === false &&
    result.atomic_result_replacement_enabled === true &&
    result.operator_rehearsal_attempt_number >= 4 &&
    result.historical_operator_attempt_count >= 3 &&
    result.operator_invocation_count >= 3 &&
    result.valid_runner_attempt_count >= 2 &&
    result.prior_attempt_result === "external_terminal_candidate_rehearsal_failed" &&
    [
      expected.staleExecutionClassification,
      "prior_fingerprinted_result_blocked",
      "prior_fingerprinted_result",
    ].includes(result.prior_attempt_blocker) &&
    result.command_boundary_remediation_applied === true &&
    result.previous_blocker_classification === expected.boundaryDefectClassification &&
    result.stale_execution_classification === expected.staleExecutionClassification
  );
}

function verifyAction534Result() {
  const failures = [];
  const absolute = join(repoRoot, resultPath);

  if (!existsSync(absolute)) {
    failures.push("missing Action 534 result");
  } else {
    const lstat = lstatSync(absolute);
    const stat = statSync(absolute);
    pass(!lstat.isSymbolicLink(), "result must not be symlink", failures);
    pass(stat.isFile(), "result must be regular file", failures);
    pass(stat.size > 0 && stat.size <= 40000, "result size out of bounds", failures);

    const text = readFileSync(absolute, "utf8");
    pass(!hasUnsafeRetainedContent(text), "result retained unsafe content", failures);
    const result = JSON.parse(text);

    pass(result.schema_version === expected.schema, "schema mismatch", failures);
    pass(result.source_action === 533, "source action mismatch", failures);
    pass(result.execution_boundary === "operator_unrestricted_local_terminal", "execution boundary mismatch", failures);
    pass(result.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
    pass(result.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
    pass(result.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
    pass(result.candidate_file_count === 32, "candidate count mismatch", failures);
    pass(result.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
    pass(result.required_public_build_signals_present === true, "public signals mismatch", failures);
    pass(result.input_echo_suppressed === true, "input echo mismatch", failures);
    pass(result.terminal_restoration === "raw_mode_restored_on_completion_error_and_interruption", "terminal restoration mismatch", failures);
    pass(
      isHistoricalAbortedAttempt(result) ||
        isBoundaryDefectFailedAttempt(result) ||
        isUnfingerprintedAction536CompletedAttempt(result) ||
        isRemediatedCompletedAttempt(result),
      "authoritative build attempt mismatch",
      failures,
    );
    pass([0, 1].includes(result.webpack_diagnostic_attempt_count), "webpack attempt mismatch", failures);
    pass([1, 2, 3, 4, 5].includes(result.operator_rehearsal_attempt_number), "operator attempt mismatch", failures);
    if (isBoundaryDefectFailedAttempt(result)) {
      pass(result.authoritative_build_result === "not_run", "boundary-defect build result mismatch", failures);
      pass(result.build_performed === false, "boundary-defect build flag mismatch", failures);
    }
    if (isUnfingerprintedAction536CompletedAttempt(result)) {
      pass(result.build_performed === true, "unfingerprinted completed build flag mismatch", failures);
      pass(result.next_action === "action_534_external_terminal_candidate_rehearsal_failure_diagnostic_gate", "unfingerprinted completed next action mismatch", failures);
    }
    if (isRemediatedCompletedAttempt(result)) {
      pass(Array.isArray(result.candidate_internal_command_results), "candidate internal command results missing", failures);
      pass(Array.isArray(result.external_control_results), "external control results missing", failures);
      pass(result.external_controls_can_establish_readiness_without_build === false, "external control readiness guard mismatch", failures);
    }
    pass(result.deployment_performed === false, "deployment performed", failures);
    pass(result.preview_activated === false, "preview activated", failures);
    pass(result.runtime_preview_state === expected.runtimePreview, "runtime preview mismatch", failures);

    for (const key of [
      "candidate_modified",
      "package_or_lockfile_modified",
      "configuration_modified",
      "source_dependency_tree_modified",
      "active_worktree_modified_beyond_result",
      "parent_environment_modified",
      "raw_environment_values_recorded",
      "environment_values_hashed",
      "raw_logs_retained",
      "absolute_machine_paths_recorded",
      "credential_values_recorded",
      "external_network_used",
      "supabase_accessed",
      "provider_called",
      "persistence_created",
      "replay_created",
      "feedback_created",
      "confidence_applied",
      "downstream_behavior_changed",
    ]) {
      pass(result[key] === false, `${key} must be false`, failures);
    }

    if (result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_passed") {
      pass(result.overall_readiness === "ready_for_preview_deployment_final_approval", "passed readiness mismatch", failures);
      pass(result.next_action === "action_535_external_terminal_candidate_rehearsal_evidence_acceptance_gate", "passed next action mismatch", failures);
    }
    if (result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed") {
      pass(result.overall_readiness === "blocked", "failed readiness mismatch", failures);
    }
    if (result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_aborted") {
      pass(result.overall_readiness === "blocked", "aborted readiness mismatch", failures);
    }
  }

  return {
    verifier: "action_534_external_terminal_candidate_rehearsal_result",
    verification_status: failures.length === 0 ? "passed" : "failed",
    result_path: resultPath,
    rehearsal_executed_by_verifier: false,
    build_executed_by_verifier: false,
    deployment_performed: false,
    preview_activated: false,
    runtime_preview_state: expected.runtimePreview,
    failures,
  };
}

const output = verifyAction534Result();
console.log(JSON.stringify(output, null, 2));
if (output.verification_status !== "passed") process.exit(1);
