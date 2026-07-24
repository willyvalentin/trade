#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation-record.json",
  doc:
    "docs/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation.md",
  action529Result:
    "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json",
  action529Script:
    "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
  action529ResultVerifier:
    "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  inputBlocker: "action_529_interactive_public_value_input_echoed",
  ipcBlocker: "action_529_unix_domain_socket_path_length_or_shape_defect",
  ipcRequirement: "local_ipc_not_proven_required_for_authoritative_turbopack_build",
  result: "action_529_hidden_input_and_ipc_remediation_completed_with_nonblocking_ipc_condition",
  nextAction: "action_529_external_terminal_runner_precheck_operator_retry_after_hidden_input_and_ipc_remediation",
  retryCommand:
    "node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function allFalse(record, keys, failures) {
  for (const key of keys) pass(record[key] === false, `${key} must be false`, failures);
}

function noSecretLikeAssignment(text) {
  return !/(SUPABASE|SECRET|TOKEN|PASSWORD|KEY)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{20,}/i.test(text);
}

const failures = [];
for (const requiredPath of Object.values(paths)) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const action529Result = readJson(paths.action529Result);
  const action529 = read(paths.action529Script);
  const action529ResultVerifier = read(paths.action529ResultVerifier);
  const doc = read(paths.doc);
  const resultText = read(paths.action529Result);
  const serializedRecord = JSON.stringify(record);

  pass(record.schema_version === "action_531_action_529_hidden_input_and_local_ipc_remediation_record_v1", "schema mismatch", failures);
  pass(record.source_action === 529, "source action mismatch", failures);
  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "candidate hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "route export mismatch", failures);

  const action529ResultIsHistoricalBlocked =
    action529Result.precheck_result === "external_terminal_runner_precheck_blocked";
  const action529ResultIsLaterSuccessfulAttempt =
    action529Result.precheck_result === "external_terminal_runner_precheck_passed" &&
    action529Result.operator_attempt_number === 2 &&
    action529Result.prior_attempt_result === "external_terminal_runner_precheck_blocked" &&
    action529Result.input_echo_suppressed === true &&
    action529Result.terminal_restoration === "raw_mode_restored_on_completion_error_and_interruption";

  pass(action529Result.schema_version === "action_529_external_terminal_runner_precheck_result_v1", "historical result schema mismatch", failures);
  pass(action529Result.execution_boundary === "operator_unrestricted_local_terminal", "historical execution boundary mismatch", failures);
  pass(
    action529ResultIsHistoricalBlocked || action529ResultIsLaterSuccessfulAttempt,
    "Action 529 result must be historical blocked attempt or later successful attempt 2",
    failures,
  );
  pass(action529Result.child_process_spawn === "passed", "historical child process mismatch", failures);
  pass(action529Result.loopback_binding === "passed", "historical loopback mismatch", failures);
  pass(action529Result.ephemeral_port_binding === "passed", "historical port mismatch", failures);
  pass(
    action529ResultIsLaterSuccessfulAttempt
      ? action529Result.local_ipc_capability === "passed"
      : action529Result.local_ipc_capability === "failed",
    "historical IPC mismatch",
    failures,
  );
  pass(action529Result.temp_output_capability === "passed", "historical temp output mismatch", failures);
  pass(action529Result.file_descriptor_capacity === "sufficient", "historical file descriptor mismatch", failures);
  pass(action529Result.process_resource_capacity === "sufficient", "historical process resource mismatch", failures);
  pass(action529Result.cleanup_result === "passed", "historical cleanup mismatch", failures);
  pass(action529Result.external_network_used === false, "historical network mismatch", failures);
  pass(action529Result.supabase_accessed === false, "historical Supabase mismatch", failures);
  pass(action529Result.provider_called === false, "historical provider mismatch", failures);
  pass(action529Result.raw_environment_values_recorded === false, "historical raw values retained", failures);
  pass(action529Result.environment_values_hashed === false, "historical values hashed", failures);
  pass(action529Result.build_performed === false, "historical build mismatch", failures);
  pass(action529Result.candidate_reconstructed === false, "historical candidate mismatch", failures);
  pass(action529Result.rehearsal_performed === false, "historical rehearsal mismatch", failures);
  pass(action529Result.deployment_performed === false, "historical deployment mismatch", failures);
  pass(action529Result.preview_activated === false, "historical activation mismatch", failures);
  pass(action529Result.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "historical runtime preview mismatch", failures);

  pass(record.historical_action_529_result === "external_terminal_runner_precheck_blocked", "record historical precheck binding mismatch", failures);
  pass(record.historical_local_ipc_capability === "failed", "record historical IPC binding mismatch", failures);
  pass(record.historical_json_raw_values_retained === false, "record raw value retention mismatch", failures);
  pass(record.historical_json_value_hashes_retained === false, "record value hash retention mismatch", failures);
  pass(noSecretLikeAssignment(resultText), "historical result contains secret-like assignment", failures);

  pass(record.input_blocker === expected.inputBlocker, "input blocker mismatch", failures);
  pass(record.input_implementation_before === "readline_promises_with_output_write_masking", "input before mismatch", failures);
  pass(record.input_implementation_after === "node_raw_mode_hidden_reader", "input after mismatch", failures);
  pass(record.input_echo_suppressed === true, "input echo suppression mismatch", failures);
  pass(record.terminal_restoration_guaranteed === true, "terminal restoration mismatch", failures);
  for (const key of [
    "input_prompt_label_printed",
    "input_paste_supported",
    "input_enter_completes",
    "input_backspace_supported",
    "input_empty_rejected",
    "input_values_memory_only",
  ]) {
    pass(record[key] === true, `${key} must be true`, failures);
  }
  for (const key of [
    "input_values_written_to_stdout",
    "input_values_written_to_stderr",
    "input_values_in_errors",
    "input_values_in_result_json",
    "input_values_hashed",
    "cli_values_allowed",
    "env_file_written",
    "shell_profile_modified",
  ]) {
    pass(record[key] === false, `${key} must be false`, failures);
  }
  for (const restorationPath of [
    "normal_completion",
    "empty_input_rejection",
    "shape_rejection",
    "capability_check_failure",
    "SIGINT",
    "SIGTERM",
    "uncaught_exception",
    "unhandled_rejection",
  ]) {
    pass(record.terminal_restoration_paths.includes(restorationPath), `missing restoration path: ${restorationPath}`, failures);
  }

  pass(action529.includes("export async function readHiddenValue"), "Action 529 missing hidden input export", failures);
  pass(action529.includes("inputStream.setRawMode(true)"), "Action 529 missing raw mode enable", failures);
  pass(action529.includes("inputStream.setRawMode(wasRaw)"), "Action 529 missing raw mode restoration", failures);
  pass(action529.includes("[\"SIGINT\", restoreAndReject]"), "Action 529 missing SIGINT restoration", failures);
  pass(action529.includes("[\"SIGTERM\", restoreAndReject]"), "Action 529 missing SIGTERM restoration", failures);
  pass(action529.includes("process.once(eventName, handler)"), "Action 529 missing process restoration handler install", failures);
  pass(action529.includes("uncaughtException"), "Action 529 missing uncaught exception restoration", failures);
  pass(action529.includes("unhandledRejection"), "Action 529 missing unhandled rejection restoration", failures);
  pass(action529.includes("input_empty"), "Action 529 missing empty input rejection", failures);
  pass(action529.includes("input_interrupted"), "Action 529 missing interruption rejection", failures);
  pass(action529.includes("value = value.slice(0, -1)"), "Action 529 missing backspace handling", failures);
  pass(!action529.includes("createInterface"), "Action 529 must not use readline masking", failures);
  pass(!action529.includes(".env.local"), "Action 529 must not read env files", failures);
  pass(!action529.includes("process.argv[2]"), "Action 529 must not read CLI values", failures);
  pass(!action529.includes("fetch("), "Action 529 must not call network", failures);
  pass(!/execFileSync\([^)]*next\s+build/.test(action529), "Action 529 must not run Next build", failures);
  pass(!/execFileSync\([^)]*npm[^)]*build/.test(action529), "Action 529 must not run npm build", failures);

  pass(record.ipc_blocker === expected.ipcBlocker, "IPC blocker mismatch", failures);
  pass(record.ipc_mechanism === "unix_domain_socket", "IPC mechanism mismatch", failures);
  pass(record.ipc_failure_phase === "listen", "IPC failure phase mismatch", failures);
  pass(record.ipc_error_classification === "path_too_long", "IPC error class mismatch", failures);
  pass(record.ipc_requirement_classification === expected.ipcRequirement, "IPC requirement mismatch", failures);
  pass(record.ipc_test_remediated === true, "IPC test remediation mismatch", failures);
  pass(record.ipc_condition_blocks_rehearsal_environment === false, "IPC condition block mismatch", failures);
  pass(record.successful_capability_evidence_preserved === true, "successful evidence preservation mismatch", failures);
  for (const key of [
    "ipc_stale_socket_cleanup_added",
    "ipc_client_connect_check_added",
    "ipc_bounded_timeout_added",
    "ipc_error_classification_added",
  ]) {
    pass(record[key] === true, `${key} must be true`, failures);
  }
  pass(action529.includes("export function classifyLocalIpcError"), "Action 529 missing IPC classifier export", failures);
  pass(action529.includes("export function classifyLocalIpcRequirement"), "Action 529 missing IPC requirement export", failures);
  pass(action529.includes("createConnection(socketPath)"), "Action 529 missing IPC client connect", failures);
  pass(action529.includes("setTimeout"), "Action 529 missing IPC timeout", failures);
  pass(action529.includes("a529.sock"), "Action 529 missing short bounded IPC socket name", failures);
  pass(action529.includes("raw_socket_path_recorded: false"), "Action 529 missing no raw IPC path flag", failures);

  pass(record.result_schema_updated === true, "result schema update mismatch", failures);
  pass(record.result_verifier_updated === true, "result verifier update mismatch", failures);
  pass(action529.includes("operator_attempt_number: 2"), "Action 529 missing attempt number", failures);
  pass(action529.includes("prior_attempt_result: \"external_terminal_runner_precheck_blocked\""), "Action 529 missing prior result", failures);
  pass(action529.includes("input_echo_suppressed: true"), "Action 529 missing input echo result flag", failures);
  pass(action529ResultVerifier.includes("operator_attempt_number"), "result verifier missing attempt number", failures);
  pass(action529ResultVerifier.includes("local_ipc_diagnostic"), "result verifier missing IPC diagnostic", failures);
  pass(action529ResultVerifier.includes("raw IPC socket path recorded"), "result verifier missing raw path guard", failures);

  pass(record.operator_retry_authorized === true, "operator retry authorization mismatch", failures);
  pass(record.operator_retry_limit === 1, "operator retry limit mismatch", failures);
  pass(record.operator_retry_command === expected.retryCommand, "operator retry command mismatch", failures);
  pass(record.remediation_result === expected.result, "remediation result mismatch", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);
  allFalse(
    record,
    [
      "candidate_change_required",
      "candidate_hash_change_required",
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
    ],
    failures,
  );

  pass(doc.includes(expected.inputBlocker), "doc missing input blocker", failures);
  pass(doc.includes(expected.ipcBlocker), "doc missing IPC blocker", failures);
  pass(doc.includes(expected.ipcRequirement), "doc missing IPC requirement", failures);
  pass(doc.includes(expected.retryCommand), "doc missing retry command", failures);
  pass(doc.includes("Action 531 does not execute the retry."), "doc missing non-execution statement", failures);
  pass(noSecretLikeAssignment(doc), "doc contains secret-like assignment", failures);
  pass(noSecretLikeAssignment(serializedRecord), "record contains secret-like assignment", failures);
}

const output = {
  action: 531,
  verification_status: failures.length === 0 ? "passed" : "failed",
  remediation_result: failures.length === 0 ? expected.result : "action_529_hidden_input_and_ipc_remediation_failed",
  action_529_operator_script_executed: false,
  build_performed: false,
  candidate_reconstructed: false,
  rehearsal_performed: false,
  deployment_performed: false,
  preview_activated: false,
  provider_called: false,
  supabase_accessed: false,
  persistence_created: false,
  replay_created: false,
  confidence_applied: false,
  feedback_created: false,
  runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
  next_action: expected.nextAction,
  failures,
};

console.log(JSON.stringify(output, null, 2));
if (failures.length > 0) process.exit(1);
