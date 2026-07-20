#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-approval-record.json",
  doc:
    "docs/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate.md",
  action532Record:
    "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-record.json",
  action532Verifier:
    "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
  action534Script:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
  action534ResultVerifier:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs",
  action534Result:
    "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  command:
    "node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
  nextAction: "action_534_external_terminal_candidate_rehearsal_operator_execution",
  runtimePreview: "runtime_preview_waiting_for_operator_inputs",
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

function nodeCheck(relativePath, failures) {
  try {
    execFileSync("node", ["--check", relativePath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`syntax check failed: ${relativePath}`);
  }
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

function noRawValueOutput(script) {
  return (
    script.includes("raw_environment_values_recorded: false") &&
    script.includes("environment_values_hashed: false") &&
    script.includes("credential_values_recorded: false") &&
    !script.includes("console.log(publicSignals") &&
    !script.includes("console.log(process.env") &&
    !script.includes("fetch(")
  );
}

function isHistoricalAction534AbortedResult() {
  if (!existsSync(join(repoRoot, paths.action534Result))) return false;
  try {
    const result = JSON.parse(readFileSync(join(repoRoot, paths.action534Result), "utf8"));
    return (
      result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
      result.source_action === 533 &&
      result.operator_rehearsal_attempt_number === 1 &&
      result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_aborted" &&
      result.authoritative_build_attempt_count === 0 &&
      result.webpack_diagnostic_attempt_count === 0 &&
      result.build_performed === false &&
      result.deployment_performed === false &&
      result.preview_activated === false &&
      result.cleanup_result === "passed" &&
      result.authoritative_error_class ===
        "candidate_hash_mismatch:docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json"
    );
  } catch {
    return false;
  }
}

function commandStatus(results, commandPath) {
  return (Array.isArray(results) ? results : []).find((entry) =>
    typeof entry?.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

function isBoundaryDefectAction534FailedResult() {
  if (!existsSync(join(repoRoot, paths.action534Result))) return false;
  try {
    const result = JSON.parse(readFileSync(join(repoRoot, paths.action534Result), "utf8"));
    return (
      result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
      result.source_action === 533 &&
      result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
      result.authoritative_build_attempt_count === 0 &&
      result.build_performed === false &&
      result.candidate_reconstruction_result === "exact_candidate_reconstructed" &&
      result.runtime_dependency_closure_result === "complete" &&
      result.source_integrity_result === "baseline_plus_overlay_manifest_integrity" &&
      result.source_safety_result === "source_safety_passed" &&
      result.preview_flag_verification_result === "preview_flag_disabled_verified" &&
      result.dependency_materialization_result === "temporary_verified_node_modules_copy" &&
      commandStatus(
        result.prebuild_command_results,
        "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
      ) === "failed" &&
      commandStatus(
        result.prebuild_command_results,
        "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
      ) === "failed" &&
      commandStatus(result.prebuild_command_results, "npx next typegen") === "passed" &&
      commandStatus(result.prebuild_command_results, "npx tsc --noEmit") === "passed" &&
      result.deployment_performed === false &&
      result.preview_activated === false &&
      result.cleanup_result === "passed"
    );
  } catch {
    return false;
  }
}

function isUnfingerprintedAction536Action534FailedResult() {
  if (!existsSync(join(repoRoot, paths.action534Result))) return false;
  try {
    const result = JSON.parse(readFileSync(join(repoRoot, paths.action534Result), "utf8"));
    return (
      result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
      result.source_action === 533 &&
      result.runner_contract_version === undefined &&
      result.runner_script_sha256 === undefined &&
      result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
      result.operator_rehearsal_attempt_number === 3 &&
      result.historical_operator_attempt_count === 2 &&
      result.authoritative_build_attempt_count === 1 &&
      result.authoritative_build_result === "failed" &&
      result.webpack_diagnostic_attempt_count === 1 &&
      result.webpack_diagnostic_result === "passed" &&
      commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed" &&
      commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed" &&
      commandStatus(
        result.external_control_results,
        "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
      ) === "passed" &&
      commandStatus(
        result.external_control_results,
        "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
      ) === "passed" &&
      result.deployment_performed === false &&
      result.preview_activated === false &&
      result.cleanup_result === "passed"
    );
  } catch {
    return false;
  }
}

function isFingerprintedAction537Action534FailedResult() {
  if (!existsSync(join(repoRoot, paths.action534Result))) return false;
  try {
    const result = JSON.parse(readFileSync(join(repoRoot, paths.action534Result), "utf8"));
    return (
      result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
      result.source_action === 533 &&
      result.runner_contract_version === "action_537_action_534_runner_contract_v1" &&
      typeof result.runner_script_sha256 === "string" &&
      /^[a-f0-9]{64}$/.test(result.runner_script_sha256) &&
      result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
      result.operator_rehearsal_attempt_number === 4 &&
      result.historical_operator_attempt_count === 3 &&
      result.authoritative_build_attempt_count === 1 &&
      result.authoritative_build_result === "failed" &&
      result.webpack_diagnostic_attempt_count === 1 &&
      result.webpack_diagnostic_result === "passed" &&
      commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed" &&
      commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed" &&
      result.deployment_performed === false &&
      result.preview_activated === false &&
      result.cleanup_result === "passed"
    );
  } catch {
    return false;
  }
}

const failures = [];
for (const requiredPath of [paths.record, paths.doc, paths.action532Record, paths.action532Verifier, paths.action534Script, paths.action534ResultVerifier]) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
}

nodeCheck(paths.action534Script, failures);
nodeCheck(paths.action534ResultVerifier, failures);
runStaticVerifier(paths.action532Verifier, failures);

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action532 = readJson(paths.action532Record);
  const script = read(paths.action534Script);
  const resultVerifier = read(paths.action534ResultVerifier);

  pass(record.schema_version === "action_533_external_terminal_candidate_rehearsal_handoff_approval_record_v1", "record schema mismatch", failures);
  pass(record.source_action === 532, "source action mismatch", failures);
  pass(record.action_532_evidence_acceptance_result === "external_terminal_runner_evidence_accepted", "Action 532 acceptance mismatch", failures);
  pass(record.action_532_rehearsal_environment_readiness === "external_terminal_candidate_rehearsal_environment_ready", "Action 532 readiness mismatch", failures);
  pass(record.action_532_approval_decision === "approved", "Action 532 approval mismatch", failures);
  pass(action532.evidence_acceptance_result === record.action_532_evidence_acceptance_result, "Action 532 record binding mismatch", failures);
  pass(action532.approval_decision === record.action_532_approval_decision, "Action 532 approval binding mismatch", failures);

  pass(record.execution_boundary_required === "operator_unrestricted_local_terminal", "execution boundary mismatch", failures);
  pass(record.operator_terminal_required === "macOS Terminal.app", "operator terminal mismatch", failures);
  pass(record.vscode_integrated_terminal_allowed === false, "VS Code terminal must be disallowed", failures);
  pass(record.codex_runner_allowed === false, "Codex runner must be disallowed", failures);
  pass(record.operator_run_limit === 1, "operator run limit mismatch", failures);
  pass(record.operator_command === expected.command, "operator command mismatch", failures);
  pass(record.operator_command_arguments_allowed === false, "CLI args mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "route export mismatch", failures);

  pass(record.operator_script_path === paths.action534Script, "operator script path mismatch", failures);
  pass(record.result_path === paths.action534Result, "result path mismatch", failures);
  pass(record.result_verifier_path === paths.action534ResultVerifier, "result verifier path mismatch", failures);
  pass(record.hidden_input_policy?.raw_mode_hidden_input === true, "hidden input mismatch", failures);
  pass(record.hidden_input_policy?.tty_required === true, "TTY policy mismatch", failures);
  pass(record.hidden_input_policy?.cli_values_allowed === false, "CLI values policy mismatch", failures);
  pass(record.hidden_input_policy?.env_file_allowed === false, "env file policy mismatch", failures);
  pass(record.hidden_input_policy?.value_hashing_allowed === false, "value hashing policy mismatch", failures);
  pass(record.safe_temp_subtree === "ture/action-534-confidence-calibration-projection-preview-external-terminal-candidate-rehearsal", "safe temp subtree mismatch", failures);
  pass(record.reconstruction_policy?.candidate_hash_verification_before_commands === true, "reconstruction policy mismatch", failures);
  pass(record.runtime_build_closure_policy?.runtime_dependency_closure === "complete", "runtime closure mismatch", failures);
  pass(record.preview_flag_policy?.result === "preview_flag_disabled_verified", "preview flag policy mismatch", failures);
  pass(record.dependency_materialization_policy?.mode === "temporary_verified_node_modules_copy", "dependency mode mismatch", failures);
  pass(record.dependency_materialization_policy?.install_allowed === false, "install policy mismatch", failures);
  pass(record.dependency_materialization_policy?.network_allowed === false, "network policy mismatch", failures);
  pass(record.authoritative_build_command === "npm run build", "authoritative build command mismatch", failures);
  pass(record.authoritative_build_attempt_limit === 1, "authoritative build limit mismatch", failures);
  pass(record.webpack_diagnostic_policy?.only_after_authoritative_failure === true, "webpack boundary mismatch", failures);
  pass(record.webpack_diagnostic_policy?.can_establish_readiness === false, "webpack readiness mismatch", failures);
  pass(record.attempt_accounting?.operator_rehearsal_attempts === 1, "attempt accounting mismatch", failures);
  pass(record.deployment_authorization === false, "deployment authorization mismatch", failures);
  pass(record.preview_activation_authorization === false, "preview activation authorization mismatch", failures);
  pass(record.operator_script_executed_by_action_533 === false, "script executed by Action 533", failures);
  pass(record.result_file_expected_now === false, "result file expected now mismatch", failures);
  pass(record.approval_decision === "approved", "approval mismatch", failures);
  pass(record.runtime_preview_state === expected.runtimePreview, "runtime preview mismatch", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const key of [
    "build_performed_by_action_533",
    "candidate_reconstructed_by_action_533",
    "rehearsal_performed_by_action_533",
    "deployment_performed_by_action_533",
    "preview_activated_by_action_533",
  ]) {
    pass(record[key] === false, `${key} must be false`, failures);
  }

  for (const snippet of [
    "import { readHiddenValue }",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "requireTTY: true",
    "installProcessHandlers: true",
    "action-534-confidence-calibration-projection-preview-external-terminal-candidate-rehearsal",
    "materializeCleanBase",
    "applyCandidateInventory",
    "verifyCandidateIntegrity",
    "preview_flag_disabled_verified",
    "temporary_verified_node_modules_copy",
    "npx\", args: [\"next\", \"typegen\"]",
    "npx\", args: [\"tsc\", \"--noEmit\"]",
    "spawnChecked(\"npm\", [\"run\", \"build\"]",
    "build\", \"--webpack\"",
    "spawnChecked(\"npm\", [\"run\", \"lint\"]",
    "runtime_projection_call_site_count",
    "external_terminal_candidate_rehearsal_passed",
    "action_535_external_terminal_candidate_rehearsal_evidence_acceptance_gate",
  ]) {
    pass(script.includes(snippet), `Action 534 script missing ${snippet}`, failures);
  }
  pass(noRawValueOutput(script), "Action 534 script raw-value output guard mismatch", failures);
  pass(!script.includes(".env.local"), "Action 534 script must not read .env.local", failures);
  pass(!script.includes("process.argv[2]"), "Action 534 script must not accept CLI values", failures);

  pass(resultVerifier.includes("action_534_external_terminal_candidate_rehearsal_result_v1"), "result verifier schema missing", failures);
  pass(resultVerifier.includes("isBoundaryDefectFailedAttempt"), "result verifier boundary-defect check missing", failures);
  pass(resultVerifier.includes("isRemediatedCompletedAttempt"), "result verifier remediated attempt check missing", failures);
  pass(resultVerifier.includes("deployment_performed === false"), "result verifier deployment guard missing", failures);
  pass(resultVerifier.includes("preview_activated === false"), "result verifier activation guard missing", failures);
  pass(resultVerifier.includes("hasUnsafeRetainedContent"), "result verifier safety scan missing", failures);

  pass(
    !existsSync(join(repoRoot, paths.action534Result)) ||
      isHistoricalAction534AbortedResult() ||
      isBoundaryDefectAction534FailedResult() ||
      isUnfingerprintedAction536Action534FailedResult() ||
      isFingerprintedAction537Action534FailedResult(),
    "Action 534 result must be absent, historical aborted, bounded command-boundary failed evidence, un-fingerprinted Action 536 attempt evidence, or fingerprinted Action 537 attempt evidence",
    failures,
  );

  for (const snippet of [
    expected.command,
    "Action 533 is a static handoff gate",
    "does not execute that script",
    "does not authorize deployment",
    "action_534_external_terminal_candidate_rehearsal_operator_execution",
  ]) {
    pass(doc.includes(snippet), `doc missing ${snippet}`, failures);
  }
}

const output = {
  action: 533,
  verification_status: failures.length === 0 ? "passed" : "failed",
  action_532_approval: "approved",
  operator_script_path: paths.action534Script,
  result_path: paths.action534Result,
  operator_command: expected.command,
  operator_script_executed_by_action_533: false,
  build_performed: false,
  candidate_reconstructed: false,
  rehearsal_performed: false,
  deployment_performed: false,
  preview_activated: false,
  runtime_preview_state: expected.runtimePreview,
  next_action: expected.nextAction,
  failures,
};

console.log(JSON.stringify(output, null, 2));
if (failures.length > 0) process.exit(1);
