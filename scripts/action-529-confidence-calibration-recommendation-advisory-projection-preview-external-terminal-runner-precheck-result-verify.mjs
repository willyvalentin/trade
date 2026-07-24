#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const resultPath =
  "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json";
const expectedKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
const absolutePath = join(repoRoot, resultPath);

if (!existsSync(absolutePath)) {
  failures.push("missing Action 529 external terminal precheck result");
} else {
  const record = JSON.parse(readFileSync(absolutePath, "utf8"));
  const serialized = JSON.stringify(record);
  const signals = record.required_public_build_signals ?? [];

  pass(record.schema_version === "action_529_external_terminal_runner_precheck_result_v1", "schema mismatch", failures);
  pass(record.source_action === 528, "source action mismatch", failures);
  pass(record.execution_boundary === "operator_unrestricted_local_terminal", "execution boundary mismatch", failures);
  pass(JSON.stringify(signals.map((signal) => signal.key).sort()) === JSON.stringify([...expectedKeys].sort()), "required keys mismatch", failures);
  pass(signals.every((signal) => signal.presence === "present"), "required signal not present", failures);
  pass(signals.every((signal) => signal.safe_shape === "valid_shape"), "required signal shape mismatch", failures);
  pass(signals.every((signal) => signal.value_recorded === false), "signal value recorded", failures);
  pass(record.raw_environment_values_recorded === false, "raw values recorded", failures);
  pass(record.environment_values_hashed === false, "environment values hashed", failures);
  pass(record.env_file_written === false, "env file written", failures);
  pass(record.shell_profile_modified === false, "shell profile modified", failures);
  pass(record.external_network_used === false, "external network used", failures);
  pass(record.supabase_accessed === false, "Supabase accessed", failures);
  pass(record.provider_called === false, "provider called", failures);
  pass(record.cleanup_result === "passed", "cleanup mismatch", failures);
  pass(record.build_performed === false, "build performed", failures);
  pass(record.candidate_reconstructed === false, "candidate reconstructed", failures);
  pass(record.rehearsal_performed === false, "rehearsal performed", failures);
  pass(record.deployment_performed === false, "deployment performed", failures);
  pass(record.preview_activated === false, "preview activated", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
  pass(
    ["external_terminal_runner_precheck_passed", "external_terminal_runner_precheck_blocked", "external_terminal_runner_precheck_failed"].includes(
      record.precheck_result,
    ),
    "precheck vocabulary mismatch",
    failures,
  );
  if (record.precheck_result === "external_terminal_runner_precheck_passed") {
    pass(record.next_action === "action_530_external_terminal_runner_precheck_evidence_acceptance_gate", "passed next action mismatch", failures);
    for (const key of ["child_process_spawn", "loopback_binding", "ephemeral_port_binding", "temp_output_capability"]) {
      pass(record[key] === "passed", `${key} must pass`, failures);
    }
    pass(["passed", "platform_not_required"].includes(record.local_ipc_capability), "local IPC must pass or be not required", failures);
  }
  if (record.operator_attempt_number !== undefined) {
    pass(record.operator_attempt_number === 2, "operator attempt number mismatch", failures);
    pass(record.prior_attempt_result === "external_terminal_runner_precheck_blocked", "prior attempt result mismatch", failures);
    pass(record.input_echo_suppressed === true, "input echo suppression mismatch", failures);
    pass(
      record.terminal_restoration === "raw_mode_restored_on_completion_error_and_interruption",
      "terminal restoration mismatch",
      failures,
    );
  }
  if (record.local_ipc_diagnostic !== undefined) {
    const diagnostic = record.local_ipc_diagnostic;
    pass(diagnostic.ipc_mechanism === "unix_domain_socket", "IPC mechanism mismatch", failures);
    pass(diagnostic.raw_socket_path_recorded === false, "raw IPC socket path recorded", failures);
    pass(
      ["none", "creation", "bind", "listen", "connect", "close", "unlink", "unknown"].includes(
        diagnostic.ipc_failure_phase,
      ),
      "IPC failure phase vocabulary mismatch",
      failures,
    );
    pass(
      [
        "none",
        "permission_restricted",
        "address_in_use",
        "path_too_long",
        "parent_missing",
        "invalid_path",
        "unsupported_platform_behavior",
        "lifecycle_order_defect",
        "timeout",
        "cleanup_failure",
        "unknown",
      ].includes(diagnostic.ipc_error_classification),
      "IPC error classification vocabulary mismatch",
      failures,
    );
    pass(
      diagnostic.ipc_requirement_classification ===
        "local_ipc_not_proven_required_for_authoritative_turbopack_build",
      "IPC requirement classification mismatch",
      failures,
    );
  }
  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(serialized), "result may contain assignment-like secret value", failures);
}

const output = {
  verifier: "action_529_external_terminal_runner_precheck_result",
  verification_status: failures.length === 0 ? "passed" : "failed",
  result_path: resultPath,
  build_performed: false,
  candidate_reconstructed: false,
  rehearsal_performed: false,
  deployment_performed: false,
  preview_activated: false,
  runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
  failures,
};

console.log(JSON.stringify(output, null, 2));
if (failures.length > 0) process.exit(1);
