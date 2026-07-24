import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { PassThrough, Writable } from "stream";
import { pathToFileURL } from "url";

import { expect, test } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation-record.json";
const docPath =
  "docs/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation.md";
const verifierPath =
  "scripts/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation-verify.mjs";
const action529Path =
  "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs";
const action529ResultPath =
  "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json";
const action529ResultVerifierPath =
  "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs";

type JsonObject = Record<string, unknown>;

class FakeInput extends PassThrough {
  isTTY = true;
  isRaw = false;
  rawModeTransitions: boolean[] = [];

  setRawMode(value: boolean) {
    this.isRaw = value;
    this.rawModeTransitions.push(value);
    return this;
  }
}

class FakeOutput extends Writable {
  isTTY = true;
  chunks: string[] = [];

  _write(chunk: Buffer | string, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    this.chunks.push(String(chunk));
    callback();
  }

  text() {
    return this.chunks.join("");
  }
}

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

async function importAction529() {
  return await import(pathToFileURL(join(repoRoot, action529Path)).href);
}

async function hiddenInputFor(data: string) {
  const action529 = await importAction529();
  const input = new FakeInput();
  const output = new FakeOutput();
  const promise = action529.readHiddenValue({
    inputStream: input,
    outputStream: output,
    prompt: "PUBLIC_INPUT: ",
    requireTTY: true,
    installProcessHandlers: false,
  });
  input.write(data);
  const value = await promise;
  return { value, output: output.text(), rawModeTransitions: input.rawModeTransitions };
}

test.describe("Action 531 hidden input and local IPC remediation", () => {
  test("binds Action 529 evidence without retained values and preserves historical metadata", () => {
    const record = readJson<JsonObject>(recordPath);
    const result = readJson<JsonObject>(action529ResultPath);
    const resultText = read(action529ResultPath);
    const currentResultIsLaterSuccessfulAttempt =
      result.precheck_result === "external_terminal_runner_precheck_passed" &&
      result.operator_attempt_number === 2 &&
      result.prior_attempt_result === "external_terminal_runner_precheck_blocked";

    expect(result.schema_version).toBe("action_529_external_terminal_runner_precheck_result_v1");
    expect(result.execution_boundary).toBe("operator_unrestricted_local_terminal");
    expect([
      "external_terminal_runner_precheck_blocked",
      "external_terminal_runner_precheck_passed",
    ]).toContain(result.precheck_result);
    expect(result.child_process_spawn).toBe("passed");
    expect(result.loopback_binding).toBe("passed");
    expect(result.ephemeral_port_binding).toBe("passed");
    expect(result.local_ipc_capability).toBe(currentResultIsLaterSuccessfulAttempt ? "passed" : "failed");
    expect(result.temp_output_capability).toBe("passed");
    expect(result.cleanup_result).toBe("passed");
    expect(result.raw_environment_values_recorded).toBe(false);
    expect(result.environment_values_hashed).toBe(false);
    expect(result.external_network_used).toBe(false);
    expect(result.supabase_accessed).toBe(false);
    expect(result.provider_called).toBe(false);
    expect(record.historical_action_529_result).toBe("external_terminal_runner_precheck_blocked");
    expect(record.historical_local_ipc_capability).toBe("failed");
    expect(record.historical_json_raw_values_retained).toBe(false);
    expect(record.historical_json_value_hashes_retained).toBe(false);
    expect(resultText).not.toMatch(/SUPABASE[^"]*[:=]\s*["']?[A-Za-z0-9._~+/=-]{20,}/i);
  });

  test("records the prior visible-input defect and raw-mode remediation", () => {
    const record = readJson<JsonObject>(recordPath);
    const script = read(action529Path);

    expect(record.input_blocker).toBe("action_529_interactive_public_value_input_echoed");
    expect(record.input_implementation_before).toBe("readline_promises_with_output_write_masking");
    expect(record.input_implementation_after).toBe("node_raw_mode_hidden_reader");
    expect(record.input_echo_suppressed).toBe(true);
    expect(record.terminal_restoration_guaranteed).toBe(true);
    expect(script).toContain("export async function readHiddenValue");
    expect(script).toContain("inputStream.setRawMode(true)");
    expect(script).toContain("inputStream.setRawMode(wasRaw)");
    expect(script).not.toContain("createInterface");
  });

  test("shows prompt but hides synthetic typed and pasted input", async () => {
    const typed = await hiddenInputFor("SYNTHETIC_PUBLIC_VALUE\r");
    const pasted = await hiddenInputFor("SYNTHETIC_PASTED_PUBLIC_VALUE\r");

    expect(typed.value).toBe("SYNTHETIC_PUBLIC_VALUE");
    expect(typed.output).toBe("PUBLIC_INPUT: \n");
    expect(typed.output).not.toContain("SYNTHETIC_PUBLIC_VALUE");
    expect(typed.rawModeTransitions).toEqual([true, false]);
    expect(pasted.value).toBe("SYNTHETIC_PASTED_PUBLIC_VALUE");
    expect(pasted.output).toBe("PUBLIC_INPUT: \n");
    expect(pasted.output).not.toContain("SYNTHETIC_PASTED_PUBLIC_VALUE");
  });

  test("handles Enter backspace empty input error and interruption with restoration", async () => {
    const action529 = await importAction529();
    const backspace = await hiddenInputFor("ABC\u007fD\r");
    expect(backspace.value).toBe("ABD");
    expect(backspace.output).toBe("PUBLIC_INPUT: \n");

    const emptyInput = new FakeInput();
    const emptyOutput = new FakeOutput();
    const emptyPromise = action529.readHiddenValue({
      inputStream: emptyInput,
      outputStream: emptyOutput,
      prompt: "PUBLIC_INPUT: ",
      requireTTY: true,
      installProcessHandlers: false,
    });
    emptyInput.write("\r");
    await expect(emptyPromise).rejects.toThrow("input_empty");
    expect(emptyInput.rawModeTransitions).toEqual([true, false]);
    expect(emptyOutput.text()).toBe("PUBLIC_INPUT: \n");

    const interruptedInput = new FakeInput();
    const interruptedOutput = new FakeOutput();
    const interruptedPromise = action529.readHiddenValue({
      inputStream: interruptedInput,
      outputStream: interruptedOutput,
      prompt: "PUBLIC_INPUT: ",
      requireTTY: true,
      installProcessHandlers: false,
    });
    interruptedInput.write("SYNTHETIC\u0003");
    await expect(interruptedPromise).rejects.toThrow("input_interrupted");
    expect(interruptedInput.rawModeTransitions).toEqual([true, false]);
    expect(interruptedOutput.text()).not.toContain("SYNTHETIC");

    const errorInput = new FakeInput();
    const errorOutput = new FakeOutput();
    const errorPromise = action529.readHiddenValue({
      inputStream: errorInput,
      outputStream: errorOutput,
      prompt: "PUBLIC_INPUT: ",
      requireTTY: true,
      installProcessHandlers: false,
    });
    errorInput.emit("error", new Error("synthetic stream failure"));
    await expect(errorPromise).rejects.toThrow("input_stream_error");
    expect(errorInput.rawModeTransitions).toEqual([true, false]);
  });

  test("preserves no CLI env shell profile value retention and result policies", () => {
    const record = readJson<JsonObject>(recordPath);
    const script = read(action529Path);
    const verifier = read(action529ResultVerifierPath);

    expect(record.cli_values_allowed).toBe(false);
    expect(record.env_file_written).toBe(false);
    expect(record.shell_profile_modified).toBe(false);
    expect(record.input_values_written_to_stdout).toBe(false);
    expect(record.input_values_written_to_stderr).toBe(false);
    expect(record.input_values_in_errors).toBe(false);
    expect(record.input_values_in_result_json).toBe(false);
    expect(record.input_values_hashed).toBe(false);
    expect(script).toContain("raw_environment_values_recorded: false");
    expect(script).toContain("environment_values_hashed: false");
    expect(script).toContain("env_file_written: false");
    expect(script).toContain("shell_profile_modified: false");
    expect(script).not.toContain(".env.local");
    expect(script).not.toContain("process.argv[2]");
    expect(script).not.toContain("fetch(");
    expect(verifier).toContain("raw values recorded");
    expect(verifier).toContain("environment values hashed");
    expect(verifier).toContain("env file written");
  });

  test("audits and remediates local IPC as nonblocking when not proven required", async () => {
    const action529 = await importAction529();
    const record = readJson<JsonObject>(recordPath);

    expect(record.ipc_blocker).toBe("action_529_unix_domain_socket_path_length_or_shape_defect");
    expect(record.ipc_mechanism).toBe("unix_domain_socket");
    expect(record.ipc_failure_phase).toBe("listen");
    expect(record.ipc_error_classification).toBe("path_too_long");
    expect(record.ipc_test_remediated).toBe(true);
    expect(record.ipc_condition_blocks_rehearsal_environment).toBe(false);
    expect(record.ipc_requirement_classification).toBe(
      "local_ipc_not_proven_required_for_authoritative_turbopack_build",
    );
    expect(record.turbopack_evidence_classification).toBe("turbopack_worker_process_port_binding");
    expect(action529.classifyLocalIpcError({ code: "ENAMETOOLONG" })).toBe("path_too_long");
    expect(action529.classifyLocalIpcError({ code: "EACCES" })).toBe("permission_restricted");
    expect(action529.classifyLocalIpcError({ code: "EADDRINUSE" })).toBe("address_in_use");
    expect(action529.classifyLocalIpcError({ code: "ENOENT" })).toBe("parent_missing");
    expect(action529.classifyLocalIpcError({ code: "EINVAL" })).toBe("invalid_path");
    expect(action529.classifyLocalIpcError({ code: "ETIMEDOUT" })).toBe("timeout");
    expect(action529.classifyLocalIpcError({ code: "OTHER" })).toBe("unknown");
    expect(action529.classifyLocalIpcRequirement()).toBe(
      "local_ipc_not_proven_required_for_authoritative_turbopack_build",
    );
  });

  test("covers retry blocked/nonblocking outcome mapping without executing Action 529", () => {
    const record = readJson<JsonObject>(recordPath);
    const script = read(action529Path);

    expect(record.operator_retry_authorized).toBe(true);
    expect(record.operator_retry_limit).toBe(1);
    expect(record.operator_retry_command).toBe(
      "node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
    );
    expect(record.remediation_result).toBe(
      "action_529_hidden_input_and_ipc_remediation_completed_with_nonblocking_ipc_condition",
    );
    expect(record.next_action).toBe(
      "action_529_external_terminal_runner_precheck_operator_retry_after_hidden_input_and_ipc_remediation",
    );
    expect(script).toContain("operator_attempt_number: 2");
    expect(script).toContain("prior_attempt_result: \"external_terminal_runner_precheck_blocked\"");
    expect(script).toContain("input_echo_suppressed: true");
    expect(script).toContain("platform_not_required");
    expect(script).toContain("external_terminal_runner_precheck_blocked");
    expect(existsSync(join(repoRoot, action529ResultPath))).toBe(true);
  });

  test("verifier passes and confirms no build rehearsal deployment or activation", () => {
    const output = execFileSync(process.execPath, [join(repoRoot, verifierPath)], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    const verification = JSON.parse(output) as JsonObject;

    expect(verification.verification_status).toBe("passed");
    expect(verification.action_529_operator_script_executed).toBe(false);
    expect(verification.build_performed).toBe(false);
    expect(verification.candidate_reconstructed).toBe(false);
    expect(verification.rehearsal_performed).toBe(false);
    expect(verification.deployment_performed).toBe(false);
    expect(verification.preview_activated).toBe(false);
    expect(verification.provider_called).toBe(false);
    expect(verification.supabase_accessed).toBe(false);
    expect(verification.persistence_created).toBe(false);
    expect(verification.replay_created).toBe(false);
    expect(verification.confidence_applied).toBe(false);
    expect(verification.feedback_created).toBe(false);
    expect(verification.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(read(docPath)).toContain("Action 531 does not execute the retry.");
  });
});
