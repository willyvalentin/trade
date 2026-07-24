#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-record.json",
  doc:
    "docs/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation.md",
  action534Result:
    "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json",
  action534Script:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
  action534ResultVerifier:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs",
  action533Verifier:
    "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs",
  action535Verifier:
    "scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs",
  action518Record:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  action518Verifier:
    "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  blockerClassification:
    "action_534_external_control_verifiers_misassigned_as_candidate_internal_prebuild_commands",
  remediationResult: "action_534_command_boundary_remediation_completed",
  nextAction: "action_534_external_terminal_candidate_rehearsal_operator_retry_after_command_boundary_remediation",
  retryCommand:
    "node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
  action518:
    "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
  action532:
    "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
};

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function runStaticVerifier(relativePath, failures) {
  try {
    execFileSync("node", [relativePath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`static verifier failed: ${relativePath}`);
  }
}

function commandStatus(results, commandPath) {
  return (Array.isArray(results) ? results : []).find((entry) =>
    typeof entry?.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

function isOriginalBoundaryDefectResult(result) {
  return (
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.authoritative_build_attempt_count === 0 &&
    commandStatus(result.prebuild_command_results, expected.action518) === "failed" &&
    commandStatus(result.prebuild_command_results, expected.action532) === "failed" &&
    commandStatus(result.prebuild_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.prebuild_command_results, "npx tsc --noEmit") === "passed" &&
    result.cleanup_result === "passed"
  );
}

function isUnfingerprintedRemediatedResult(result) {
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
    commandStatus(result.candidate_internal_command_results, expected.action518) === undefined &&
    commandStatus(result.candidate_internal_command_results, expected.action532) === undefined &&
    commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed" &&
    commandStatus(result.external_control_results, expected.action518) === "passed" &&
    commandStatus(result.external_control_results, expected.action532) === "passed" &&
    result.external_evidence_result === "passed" &&
    result.cleanup_result === "passed"
  );
}

function isFingerprintedAction537Result(result) {
  return (
    result.runner_contract_version === "action_537_action_534_runner_contract_v1" &&
    typeof result.runner_script_sha256 === "string" &&
    /^[a-f0-9]{64}$/.test(result.runner_script_sha256) &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.authoritative_build_attempt_count === 1 &&
    result.authoritative_build_result === "failed" &&
    result.webpack_diagnostic_attempt_count === 1 &&
    result.webpack_diagnostic_result === "passed" &&
    result.operator_rehearsal_attempt_number === 4 &&
    result.historical_operator_attempt_count === 3 &&
    commandStatus(result.candidate_internal_command_results, expected.action518) === undefined &&
    commandStatus(result.candidate_internal_command_results, expected.action532) === undefined &&
    commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed" &&
    commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed" &&
    commandStatus(result.external_control_results, expected.action518) === "passed" &&
    commandStatus(result.external_control_results, expected.action532) === "passed" &&
    result.external_evidence_result === "passed" &&
    result.cleanup_result === "passed"
  );
}

async function verifyBoundaryClassifier(failures, candidatePaths) {
  const action534 = await import(pathToFileURL(join(repoRoot, paths.action534Script)).href);
  const classify = action534.classifyAction534CommandBoundary;
  pass(typeof classify === "function", "Action 534 command boundary classifier missing", failures);
  if (typeof classify !== "function") return;

  for (const verifierPath of [expected.action518, expected.action532]) {
    const result = classify(`node ${verifierPath}`, candidatePaths);
    pass(result.path === verifierPath, `${verifierPath} path mismatch`, failures);
    pass(result.candidate_membership === false, `${verifierPath} candidate membership mismatch`, failures);
    pass(result.runtime_build_required_candidate_path === false, `${verifierPath} runtime requirement mismatch`, failures);
    pass(result.control_only_verifier === true, `${verifierPath} control-only mismatch`, failures);
    pass(result.classification === "external_control_required_after_cleanup", `${verifierPath} classification mismatch`, failures);
    pass(result.intended_execution_boundary === "external_after_cleanup", `${verifierPath} boundary mismatch`, failures);
    pass(result.failure_reason === "absent_from_candidate", `${verifierPath} failure reason mismatch`, failures);
  }

  for (const command of ["node -e process.exit(0)", "npx next typegen", "npx tsc --noEmit", "npm run build"]) {
    const result = classify(command, candidatePaths);
    pass(result.classification === "candidate_internal_required", `${command} candidate classification mismatch`, failures);
    pass(result.control_only_verifier === false, `${command} control-only mismatch`, failures);
    pass(result.intended_execution_boundary === "candidate_internal", `${command} boundary mismatch`, failures);
  }

  const invalid = classify("node scripts/not-in-boundary.mjs", candidatePaths);
  pass(invalid.classification === "invalid_boundary_assignment", "invalid command not rejected", failures);
}

async function verifyAction536() {
  const failures = [];
  for (const requiredPath of Object.values(paths)) {
    pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
  }

  runStaticVerifier(paths.action534ResultVerifier, failures);
  runStaticVerifier(paths.action533Verifier, failures);
  runStaticVerifier(paths.action535Verifier, failures);
  runStaticVerifier(paths.action518Verifier, failures);

  if (failures.length === 0) {
    const record = readJson(paths.record);
    const doc = read(paths.doc);
    const result = readJson(paths.action534Result);
    const action518 = readJson(paths.action518Record);
    const script = read(paths.action534Script);
    const candidatePaths = new Set((action518.new_changed_file_inventory ?? []).map((entry) => entry.path));

    pass(record.schema_version === "action_536_action_534_command_boundary_remediation_record_v1", "record schema mismatch", failures);
    pass(record.source_action === 534, "record source action mismatch", failures);
    pass(record.latest_action_534_result === "external_terminal_candidate_rehearsal_failed", "latest result mismatch", failures);
    pass(record.latest_authoritative_build_attempt_count === 0, "latest build count mismatch", failures);
    pass(record.latest_cleanup_result === "passed", "latest cleanup mismatch", failures);
    pass(record.blocker_classification === expected.blockerClassification, "blocker classification mismatch", failures);

    pass(result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1", "Action 534 result schema mismatch", failures);
    pass(result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed", "Action 534 result mismatch", failures);
    pass(
      isOriginalBoundaryDefectResult(result) ||
        isUnfingerprintedRemediatedResult(result) ||
        isFingerprintedAction537Result(result),
      "Action 534 result no longer matches known Action 536 evidence states",
      failures,
    );
    pass(result.candidate_reconstruction_result === "exact_candidate_reconstructed", "candidate reconstruction mismatch", failures);
    pass(result.runtime_dependency_closure_result === "complete", "runtime closure mismatch", failures);
    pass(result.source_integrity_result === "baseline_plus_overlay_manifest_integrity", "source integrity mismatch", failures);
    pass(result.source_safety_result === "source_safety_passed", "source safety mismatch", failures);
    pass(result.preview_flag_verification_result === "preview_flag_disabled_verified", "preview flag mismatch", failures);
    pass(result.dependency_materialization_result === "temporary_verified_node_modules_copy", "dependency materialization mismatch", failures);
    if (isOriginalBoundaryDefectResult(result)) {
      pass(commandStatus(result.prebuild_command_results, expected.action518) === "failed", "Action 518 failed command missing", failures);
      pass(commandStatus(result.prebuild_command_results, expected.action532) === "failed", "Action 532 failed command missing", failures);
      pass(commandStatus(result.prebuild_command_results, "npx next typegen") === "passed", "typegen result mismatch", failures);
      pass(commandStatus(result.prebuild_command_results, "npx tsc --noEmit") === "passed", "TypeScript result mismatch", failures);
    }
    if (isUnfingerprintedRemediatedResult(result)) {
      pass(commandStatus(result.candidate_internal_command_results, expected.action518) === undefined, "Action 518 still candidate-internal", failures);
      pass(commandStatus(result.candidate_internal_command_results, expected.action532) === undefined, "Action 532 still candidate-internal", failures);
      pass(commandStatus(result.external_control_results, expected.action518) === "passed", "Action 518 external control mismatch", failures);
      pass(commandStatus(result.external_control_results, expected.action532) === "passed", "Action 532 external control mismatch", failures);
    }
    if (isFingerprintedAction537Result(result)) {
      pass(commandStatus(result.candidate_internal_command_results, expected.action518) === undefined, "Action 518 still candidate-internal", failures);
      pass(commandStatus(result.candidate_internal_command_results, expected.action532) === undefined, "Action 532 still candidate-internal", failures);
      pass(commandStatus(result.external_control_results, expected.action518) === "passed", "Action 518 external control mismatch", failures);
      pass(commandStatus(result.external_control_results, expected.action532) === "passed", "Action 532 external control mismatch", failures);
    }
    pass(result.deployment_performed === false, "Action 534 deployment mismatch", failures);
    pass(result.preview_activated === false, "Action 534 activation mismatch", failures);

    pass(action518.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
    pass(action518.new_change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
    pass(action518.new_full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
    pass(action518.new_candidate_file_count === 32, "candidate count mismatch", failures);
    pass(action518.added_route_hash === expected.routeHash, "route hash mismatch", failures);
    pass(!candidatePaths.has(expected.action518), "Action 518 verifier unexpectedly in candidate", failures);
    pass(!candidatePaths.has(expected.action532), "Action 532 verifier unexpectedly in candidate", failures);

    for (const implicated of record.implicated_commands) {
      pass([expected.action518, expected.action532].includes(implicated.path), `unexpected implicated command ${implicated.path}`, failures);
      pass(implicated.candidate_membership === false, `${implicated.path} membership mismatch`, failures);
      pass(implicated.runtime_build_required_candidate_path === false, `${implicated.path} runtime flag mismatch`, failures);
      pass(implicated.control_only_verifier === true, `${implicated.path} control flag mismatch`, failures);
      pass(implicated.classification === "external_control_required_after_cleanup", `${implicated.path} classification mismatch`, failures);
      pass(implicated.intended_execution_boundary === "external_after_cleanup", `${implicated.path} boundary mismatch`, failures);
      pass(implicated.failure_reason === "absent_from_candidate", `${implicated.path} failure reason mismatch`, failures);
    }

    pass(record.candidate_internal_preconditions_passed_in_latest_attempt === true, "candidate precondition rollup mismatch", failures);
    pass(record.candidate_change_required === false, "candidate change mismatch", failures);
    pass(record.candidate_hash_change_required === false, "candidate hash change mismatch", failures);
    pass(record.authoritative_build_command === "npm run build", "build command mismatch", failures);
    pass(record.authoritative_build_attempt_limit === 1, "build attempt limit mismatch", failures);
    pass(record.same_action_build_retry_allowed === false, "same-action retry mismatch", failures);
    pass(record.source_repair_during_rehearsal_allowed === false, "source repair mismatch", failures);
    pass(record.historical_operator_attempt_count === 2, "historical attempt count mismatch", failures);
    pass(record.next_operator_attempt_number === 3, "next attempt mismatch", failures);
    pass(record.prior_attempt_result === "external_terminal_candidate_rehearsal_failed", "prior attempt result mismatch", failures);
    pass(record.prior_attempt_blocker === "candidate_internal_external_control_boundary_defect", "prior blocker mismatch", failures);
    pass(record.operator_retry_authorized === true, "operator retry mismatch", failures);
    pass(record.operator_retry_limit === 1, "operator retry limit mismatch", failures);
    pass(record.operator_retry_command === expected.retryCommand, "operator command mismatch", failures);
    pass(record.remediation_result === expected.remediationResult, "remediation result mismatch", failures);
    pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
    pass(record.next_action === expected.nextAction, "next action mismatch", failures);

    for (const key of [
      "build_performed",
      "candidate_reconstructed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ]) {
      pass(record[key] === false, `${key} must be false`, failures);
    }

    for (const snippet of [
      "candidateInternalPrebuild",
      "externalControlsAfterCleanup",
      "deferredExternalResultControls",
      "classifyAction534CommandBoundary",
      "runExternalControlCommands",
      "runnerContractVersion",
      "runnerScriptSha256",
      "deriveAttemptMetadata",
      "readPriorResult",
      "prior_command_results_reused: false",
      "atomic_result_replacement_enabled: true",
      "external_controls_can_establish_readiness_without_build: false",
    ]) {
      pass(script.includes(snippet), `Action 534 script missing ${snippet}`, failures);
    }
    pass(!script.includes("scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs\"], phase: \"candidate_integrity_confirmation\""), "Action 518 still candidate-internal", failures);
    pass(!script.includes("scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs\"], phase: \"strict_source_safety_hash_matrix\""), "Action 532 still candidate-internal", failures);

    for (const snippet of [
      expected.blockerClassification,
      "external_control_required_after_cleanup",
      "candidate_internal_required",
      "historical operator attempt count is frozen as `2`",
      expected.retryCommand,
      "does not execute Action 534",
    ]) {
      pass(doc.includes(snippet), `doc missing ${snippet}`, failures);
    }

    await verifyBoundaryClassifier(failures, candidatePaths);
  }

  return {
    action: 536,
    verification_status: failures.length === 0 ? "passed" : "failed",
    latest_action_534_result: "external_terminal_candidate_rehearsal_failed",
    blocker_classification: expected.blockerClassification,
    remediation_result: failures.length === 0 ? expected.remediationResult : "action_534_command_boundary_remediation_failed",
    historical_operator_attempt_count: 2,
    next_operator_attempt_number: 3,
    operator_retry_authorized: failures.length === 0,
    operator_retry_limit: failures.length === 0 ? 1 : 0,
    action_534_script_executed_by_action_536: false,
    build_performed: false,
    candidate_reconstructed: false,
    rehearsal_performed: false,
    deployment_performed: false,
    preview_activated: false,
    runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
    next_action: expected.nextAction,
    failures,
  };
}

const output = await verifyAction536();
console.log(JSON.stringify(output, null, 2));
if (output.verification_status !== "passed") process.exit(1);
