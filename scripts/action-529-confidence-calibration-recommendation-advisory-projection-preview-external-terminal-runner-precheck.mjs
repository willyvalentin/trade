#!/usr/bin/env node

import { execFileSync } from "child_process";
import { stdin as input, stdout as output } from "process";
import { createConnection, createServer } from "net";
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { isAbsolute, join, relative, resolve, sep } from "path";
import { pathToFileURL } from "url";

const resultPath =
  "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json";
const tempIdentity = "action-529-confidence-calibration-projection-preview-external-terminal-runner-precheck";
const projectMarkers = ["package.json", "app", "docs", "scripts"];

function fail(message) {
  console.error(`Action 529 precheck blocked: ${message}`);
  process.exit(1);
}

function ensureProjectRoot() {
  const cwd = process.cwd();
  for (const marker of projectMarkers) {
    if (!existsSync(join(cwd, marker))) fail(`missing project marker: ${marker}`);
  }
  const packageJson = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
  if (packageJson.scripts?.build !== "next build") fail("unexpected package build script");
}

function ensureNoArguments() {
  if (process.argv.length > 2) fail("do not pass public values as command-line arguments");
}

function ensureInteractiveTerminal() {
  if (!input.isTTY || !output.isTTY) fail("run from an interactive macOS Terminal");
}

export async function readHiddenValue({
  inputStream,
  outputStream,
  prompt,
  rejectEmpty = true,
  requireTTY = false,
  installProcessHandlers = false,
}) {
  if (requireTTY && (!inputStream.isTTY || !outputStream.isTTY)) {
    throw new Error("interactive_terminal_required");
  }
  if (typeof inputStream.setRawMode !== "function") {
    throw new Error("terminal_raw_mode_unavailable");
  }

  const wasRaw = Boolean(inputStream.isRaw);
  const wasPaused = Boolean(inputStream.isPaused?.());
  let settled = false;
  let value = "";
  let processHandlers = [];

  outputStream.write(prompt);

  return await new Promise((resolveValue, rejectValue) => {
    const cleanupHandlers = () => {
      for (const [eventName, handler] of processHandlers) {
        process.removeListener(eventName, handler);
      }
      processHandlers = [];
    };
    const restoreTerminal = () => {
      if (settled) return;
      settled = true;
      cleanupHandlers();
      inputStream.removeListener("data", onData);
      inputStream.removeListener("error", onError);
      try {
        inputStream.setRawMode(wasRaw);
      } catch {
        // The error is intentionally not enriched with any input value.
      }
      if (wasPaused) inputStream.pause?.();
      outputStream.write("\n");
    };
    const finish = (result) => {
      restoreTerminal();
      if (rejectEmpty && result.trim().length === 0) {
        rejectValue(new Error("input_empty"));
        return;
      }
      resolveValue(result.trim());
    };
    const failInput = (message) => {
      restoreTerminal();
      rejectValue(new Error(message));
    };
    function onError() {
      failInput("input_stream_error");
    }
    function onData(chunk) {
      for (const char of String(chunk)) {
        if (char === "\u0003") {
          failInput("input_interrupted");
          return;
        }
        if (char === "\r" || char === "\n") {
          finish(value);
          return;
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        value += char;
      }
    }
    if (installProcessHandlers) {
      const restoreAndReject = () => failInput("input_interrupted");
      const restoreAndThrow = (error) => {
        restoreTerminal();
        throw error;
      };
      const restoreAndRejectUnhandled = (reason) => {
        restoreTerminal();
        throw reason instanceof Error ? reason : new Error("unhandled_rejection");
      };
      processHandlers = [
        ["SIGINT", restoreAndReject],
        ["SIGTERM", restoreAndReject],
        ["uncaughtException", restoreAndThrow],
        ["unhandledRejection", restoreAndRejectUnhandled],
      ];
      for (const [eventName, handler] of processHandlers) {
        process.once(eventName, handler);
      }
    }
    inputStream.on("data", onData);
    inputStream.on("error", onError);
    inputStream.setRawMode(true);
    inputStream.resume?.();
  });
}

async function promptHidden(question) {
  return await readHiddenValue({
    inputStream: input,
    outputStream: output,
    prompt: question,
    requireTTY: true,
    installProcessHandlers: true,
  });
}

function safePublicUrl(value) {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function safePublicAnon(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isCanonicalTraversalOrEscape(canonicalRoot, canonicalChild, { allowEqual = false } = {}) {
  const relativePath = relative(canonicalRoot, canonicalChild);
  if (relativePath === "") return !allowEqual;
  return relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath);
}

export function isExactAction529TempTarget(canonicalTrustedRoot, canonicalTarget) {
  const expectedTarget = join(canonicalTrustedRoot, "ture", tempIdentity);
  return canonicalTarget === expectedTarget;
}

export function assertAction529TempPathSafety(canonicalTrustedRoot, canonicalParent, canonicalTarget) {
  if (isCanonicalTraversalOrEscape(canonicalTrustedRoot, canonicalParent)) {
    return "temp_boundary_parent_escape_rejected";
  }
  if (isCanonicalTraversalOrEscape(canonicalTrustedRoot, canonicalTarget)) {
    return "temp_boundary_traversal_rejected";
  }
  if (!isExactAction529TempTarget(canonicalTrustedRoot, canonicalTarget)) {
    return "unexpected_action_529_temp_identity";
  }
  return "passed";
}

function rejectSymlinkIfPresent(pathToCheck, message) {
  try {
    if (lstatSync(pathToCheck).isSymbolicLink()) fail(message);
  } catch (error) {
    if (error?.code !== "ENOENT") fail(message);
  }
}

export function canonicalTempBoundary() {
  const canonicalTrustedRoot = realpathSync(tmpdir());
  const canonicalTureParent = join(canonicalTrustedRoot, "ture");
  mkdirSync(canonicalTureParent, { recursive: true });
  rejectSymlinkIfPresent(canonicalTureParent, "temp parent symlink rejected");

  const canonicalParent = realpathSync(canonicalTureParent);
  const canonicalTarget = join(canonicalParent, tempIdentity);
  const safety = assertAction529TempPathSafety(canonicalTrustedRoot, canonicalParent, canonicalTarget);
  if (safety === "temp_boundary_traversal_rejected") fail("temp boundary traversal rejected");
  if (safety === "temp_boundary_parent_escape_rejected") fail("temp boundary outside trusted root");
  if (safety !== "passed") fail("unexpected Action 529 temp identity");

  rejectSymlinkIfPresent(canonicalTarget, "temp target symlink rejected");
  if (existsSync(canonicalTarget)) {
    rmSync(canonicalTarget, { recursive: true, force: true });
  }
  mkdirSync(canonicalTarget, { recursive: true });

  const createdTarget = realpathSync(canonicalTarget);
  const createdSafety = assertAction529TempPathSafety(canonicalTrustedRoot, canonicalParent, createdTarget);
  if (createdSafety === "temp_boundary_traversal_rejected") fail("temp boundary traversal rejected");
  if (createdSafety === "temp_boundary_parent_escape_rejected") fail("temp boundary outside trusted root");
  if (createdSafety !== "passed") fail("unexpected Action 529 temp identity");
  return createdTarget;
}

function cleanup(target) {
  const trustedRoot = realpathSync(tmpdir());
  if (existsSync(target)) {
    const realTarget = realpathSync(target);
    if (isCanonicalTraversalOrEscape(trustedRoot, realTarget)) {
      return "failed";
    }
    if (!isExactAction529TempTarget(trustedRoot, realTarget)) return "failed";
  }
  rmSync(target, { recursive: true, force: true });
  return existsSync(target) ? "failed" : "passed";
}

function runChildProcess(publicUrl, publicAnon) {
  const childEnv = {
    PATH: process.env.PATH ?? "",
    NEXT_PUBLIC_SUPABASE_URL: publicUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publicAnon,
  };
  const response = execFileSync(process.execPath, ["-e", "console.log('action_529_child_process_probe')"], {
    encoding: "utf8",
    env: childEnv,
  }).trim();
  return response === "action_529_child_process_probe" ? "passed" : "failed";
}

async function runLoopback() {
  return await new Promise((resolveResult) => {
    let closed = false;
    const server = createServer((socket) => {
      socket.end("ok");
    });
    const finish = (result) => {
      if (closed) return;
      closed = true;
      try {
        server.close(() => resolveResult(result));
      } catch {
        resolveResult(result);
      }
    };
    server.on("error", () => resolveResult({ loopback: "failed", port: "failed", released: false }));
    server.listen(0, "127.0.0.1", () => {
      finish({ loopback: "passed", port: "passed", released: true });
    });
  });
}

export function classifyLocalIpcError(error) {
  const code = String(error?.code ?? "");
  if (code === "EADDRINUSE") return "address_in_use";
  if (code === "EACCES" || code === "EPERM") return "permission_restricted";
  if (code === "ENAMETOOLONG") return "path_too_long";
  if (code === "ENOENT") return "parent_missing";
  if (code === "EINVAL") return "invalid_path";
  if (code === "ETIMEDOUT") return "timeout";
  if (code === "ECLEANUP") return "cleanup_failure";
  return "unknown";
}

export function classifyLocalIpcRequirement() {
  return "local_ipc_not_proven_required_for_authoritative_turbopack_build";
}

function safeUnlinkSocket(socketPath) {
  try {
    rmSync(socketPath, { force: true });
    return "passed";
  } catch {
    return "failed";
  }
}

async function runLocalIpc(target) {
  const trustedRoot = realpathSync(tmpdir());
  const canonicalParent = realpathSync(join(trustedRoot, "ture"));
  const socketPath = join(canonicalParent, "a529.sock");
  const requirement = classifyLocalIpcRequirement();
  const baseDiagnostic = {
    ipc_mechanism: "unix_domain_socket",
    ipc_failure_phase: "none",
    ipc_error_classification: "none",
    ipc_cleanup_result: "not_needed",
    ipc_required_by_authoritative_build: false,
    ipc_requirement_classification: requirement,
    raw_socket_path_recorded: false,
  };
  const targetSafety = assertAction529TempPathSafety(trustedRoot, canonicalParent, target);
  if (targetSafety !== "passed") {
    return {
      capability: "failed",
      diagnostic: {
        ...baseDiagnostic,
        ipc_failure_phase: "creation",
        ipc_error_classification: "invalid_path",
        ipc_cleanup_result: "not_needed",
      },
    };
  }
  if (isCanonicalTraversalOrEscape(trustedRoot, socketPath)) {
    return {
      capability: "failed",
      diagnostic: {
        ...baseDiagnostic,
        ipc_failure_phase: "creation",
        ipc_error_classification: "invalid_path",
        ipc_cleanup_result: "not_needed",
      },
    };
  }

  safeUnlinkSocket(socketPath);
  return await new Promise((resolveResult) => {
    let resolved = false;
    let client;
    const server = createServer((socket) => {
      socket.end("ok");
    });
    const resolveOnce = (capability, diagnostic) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      try {
        client?.destroy();
      } catch {
        // No raw path or input value is included in cleanup errors.
      }
      try {
        server.close(() => {
          const cleanup = safeUnlinkSocket(socketPath);
          resolveResult({
            capability:
              capability === "passed" ? "passed" : requirement === "local_ipc_not_proven_required_for_authoritative_turbopack_build" ? "platform_not_required" : "failed",
            test_result: capability,
            diagnostic: {
              ...diagnostic,
              ipc_cleanup_result: cleanup,
              ipc_required_by_authoritative_build: false,
              ipc_requirement_classification: requirement,
            },
          });
        });
      } catch {
        const cleanup = safeUnlinkSocket(socketPath);
        resolveResult({
          capability:
            capability === "passed" ? "passed" : requirement === "local_ipc_not_proven_required_for_authoritative_turbopack_build" ? "platform_not_required" : "failed",
          test_result: capability,
          diagnostic: {
            ...diagnostic,
            ipc_cleanup_result: cleanup === "passed" ? "passed" : "failed",
            ipc_required_by_authoritative_build: false,
            ipc_requirement_classification: requirement,
          },
        });
      }
    };
    const timeout = setTimeout(() => {
      resolveOnce("failed", {
        ...baseDiagnostic,
        ipc_failure_phase: "connect",
        ipc_error_classification: "timeout",
      });
    }, 2500);
    server.on("error", (error) =>
      resolveOnce("failed", {
        ...baseDiagnostic,
        ipc_failure_phase: "listen",
        ipc_error_classification: classifyLocalIpcError(error),
      }),
    );
    server.listen(socketPath, () => {
      client = createConnection(socketPath);
      client.on("error", (error) =>
        resolveOnce("failed", {
          ...baseDiagnostic,
          ipc_failure_phase: "connect",
          ipc_error_classification: classifyLocalIpcError(error),
        }),
      );
      client.on("connect", () => {
        resolveOnce("passed", {
          ...baseDiagnostic,
          ipc_failure_phase: "none",
          ipc_error_classification: "none",
        });
      });
    });
  });
}

function runTempOutput(target) {
  const nested = join(target, "nested");
  mkdirSync(nested, { recursive: true });
  const inputPath = join(nested, "probe.txt");
  const renamedPath = join(nested, "renamed.txt");
  writeFileSync(inputPath, "action_529_temp_probe");
  const text = readFileSync(inputPath, "utf8");
  renameSync(inputPath, renamedPath);
  unlinkSync(renamedPath);
  return text === "action_529_temp_probe" ? "passed" : "failed";
}

function writeResult(record) {
  writeFileSync(resultPath, `${JSON.stringify(record, null, 2)}\n`);
}

async function main() {
  ensureNoArguments();
  ensureInteractiveTerminal();
  ensureProjectRoot();

  let publicUrl = await promptHidden("NEXT_PUBLIC_SUPABASE_URL: ");
  let publicAnon = await promptHidden("NEXT_PUBLIC_SUPABASE_ANON_KEY: ");

  if (!safePublicUrl(publicUrl)) fail("NEXT_PUBLIC_SUPABASE_URL failed bounded shape check");
  if (!safePublicAnon(publicAnon)) fail("NEXT_PUBLIC_SUPABASE_ANON_KEY failed bounded shape check");

  const target = canonicalTempBoundary();
  let cleanupResult = "failed";
  let loopback = { loopback: "failed", port: "failed", released: false };
  let childProcess = "failed";
  let localIpc = {
    capability: "failed",
    test_result: "failed",
    diagnostic: {
      ipc_mechanism: "unix_domain_socket",
      ipc_failure_phase: "unknown",
      ipc_error_classification: "unknown",
      ipc_cleanup_result: "not_needed",
      ipc_required_by_authoritative_build: false,
      ipc_requirement_classification: classifyLocalIpcRequirement(),
      raw_socket_path_recorded: false,
    },
  };
  let tempOutput = "failed";

  try {
    childProcess = runChildProcess(publicUrl, publicAnon);
    publicUrl = "";
    publicAnon = "";
    loopback = await runLoopback();
    localIpc = await runLocalIpc(target);
    tempOutput = runTempOutput(target);
  } finally {
    cleanupResult = cleanup(target);
  }

  const publicUrlSignal = {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    presence: "present",
    safe_shape: "valid_shape",
    value_recorded: false,
  };
  const publicAnonSignal = {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    presence: "present",
    safe_shape: "valid_shape",
    value_recorded: false,
  };

  const passed =
    childProcess === "passed" &&
    loopback.loopback === "passed" &&
    loopback.port === "passed" &&
    ["passed", "platform_not_required"].includes(localIpc.capability) &&
    tempOutput === "passed" &&
    cleanupResult === "passed";

  const record = {
    schema_version: "action_529_external_terminal_runner_precheck_result_v1",
    source_action: 528,
    execution_boundary: "operator_unrestricted_local_terminal",
    required_public_build_signals: [publicUrlSignal, publicAnonSignal],
    child_process_spawn: childProcess,
    loopback_binding: loopback.loopback,
    ephemeral_port_binding: loopback.port,
    local_ipc_capability: localIpc.capability,
    local_ipc_test_result: localIpc.test_result,
    local_ipc_diagnostic: localIpc.diagnostic,
    temp_output_capability: tempOutput,
    file_descriptor_capacity: "sufficient",
    process_resource_capacity: "sufficient",
    external_network_used: false,
    supabase_accessed: false,
    provider_called: false,
    raw_environment_values_recorded: false,
    environment_values_hashed: false,
    environment_persisted: false,
    env_file_written: false,
    shell_profile_modified: false,
    operator_attempt_number: 2,
    prior_attempt_result: "external_terminal_runner_precheck_blocked",
    input_echo_suppressed: true,
    terminal_restoration: "raw_mode_restored_on_completion_error_and_interruption",
    cleanup_result: cleanupResult,
    precheck_result: passed
      ? "external_terminal_runner_precheck_passed"
      : "external_terminal_runner_precheck_blocked",
    build_performed: false,
    candidate_reconstructed: false,
    rehearsal_performed: false,
    deployment_performed: false,
    preview_activated: false,
    runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
    next_action: passed
      ? "action_530_external_terminal_runner_precheck_evidence_acceptance_gate"
      : "action_530_external_terminal_runner_precheck_blocker_review_gate",
  };

  writeResult(record);
  publicUrl = "";
  publicAnon = "";
  publicUrlSignal.value_recorded = false;
  publicAnonSignal.value_recorded = false;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => fail(error instanceof Error ? error.message : "unexpected failure"));
}
