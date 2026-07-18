import "server-only";

import { spawn } from "node:child_process";

import {
  DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY,
  buildFixedReadOnlyDirectSpawnObservation,
  evaluateFixedReadOnlyDirectSpawnCore,
  type FixedReadOnlyDirectSpawnObservation,
  type FixedReadOnlyDirectSpawnResult,
  type FixedReadOnlyDirectSpawnTerminalReason,
} from "@/lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core";
import {
  consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn,
} from "@/lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter";
import type { ImmediatePreSpawnRevalidationResult } from "@/lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";

export * from "@/lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core";

export type DormantServerOnlyFixedReadOnlyDirectSpawnInput = Readonly<{
  revalidationResult: ImmediatePreSpawnRevalidationResult;
}>;

export async function spawnDormantServerOnlyFixedReadOnlyGitVersion(input: DormantServerOnlyFixedReadOnlyDirectSpawnInput): Promise<FixedReadOnlyDirectSpawnResult> {
  const consumedRevalidation = consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn(input);
  if (!consumedRevalidation.ok) return evaluateFixedReadOnlyDirectSpawnCore({ consumedRevalidation });
  try {
    const spawnObservation = await performOneFixedGitVersionSpawn(consumedRevalidation.approvedExecutablePath, consumedRevalidation.evaluatedAt);
    return evaluateFixedReadOnlyDirectSpawnCore({ consumedRevalidation, spawnObservation });
  } catch {
    const spawnObservation = buildFixedReadOnlyDirectSpawnObservation({
      processAttempted: true,
      processStarted: false,
      processExited: false,
      spawnError: true,
      spawnErrorCode: "spawn_exception",
      observedAt: consumedRevalidation.evaluatedAt,
    });
    return evaluateFixedReadOnlyDirectSpawnCore({ consumedRevalidation, spawnObservation });
  }
}

function performOneFixedGitVersionSpawn(executablePath: string, observedAt: string) {
  return new Promise<ReturnType<typeof buildFixedReadOnlyDirectSpawnObservation>>((resolve) => {
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let stdoutOverflow = false;
    let stderrOverflow = false;
    let combinedOutputOverflow = false;
    let settled = false;
    let processStarted = false;
    let processExited = false;
    let terminalReason: FixedReadOnlyDirectSpawnTerminalReason = "none";
    let internalTerminalCondition = false;
    let childTerminationRequested = false;
    let childTerminationRequestFailed = false;
    let processClosedAfterInternalTerminalCondition = false;
    const noopErrorSink = () => undefined;
    const fixedEnv = {
      LANG: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.fixedEnv.LANG,
      LC_ALL: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.fixedEnv.LC_ALL,
    } satisfies Record<string, string>;
    const child = spawn(executablePath, [...DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.exactArgv], {
      shell: false,
      detached: false,
      cwd: undefined,
      env: fixedEnv as unknown as NodeJS.ProcessEnv,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    child.on("error", noopErrorSink);
    child.stdout?.on("error", noopErrorSink);
    child.stderr?.on("error", noopErrorSink);

    const detachListeners = () => {
      child.off("spawn", onSpawn);
      child.off("error", onChildError);
      child.off("exit", onExit);
      child.off("close", onClose);
      child.stdout?.off("data", onStdoutData);
      child.stdout?.off("error", onStdoutError);
      child.stderr?.off("data", onStderrData);
      child.stderr?.off("error", onStderrError);
    };

    const installLateErrorSinks = () => {
      if (child.listenerCount("error") === 0) child.on("error", noopErrorSink);
      if (child.stdout && child.stdout.listenerCount("error") === 0) child.stdout.on("error", noopErrorSink);
      if (child.stderr && child.stderr.listenerCount("error") === 0) child.stderr.on("error", noopErrorSink);
    };

    const settle = (observation: ReturnType<typeof buildFixedReadOnlyDirectSpawnObservation>) => {
      if (settled) return;
      settled = true;
      stdoutChunks.length = 0;
      stderrChunks.length = 0;
      detachListeners();
      installLateErrorSinks();
      resolve(observation);
    };

    const requestFixedTermination = () => {
      if (childTerminationRequested) return;
      childTerminationRequested = true;
      try {
        const accepted = child.kill("SIGKILL");
        if (accepted !== true) childTerminationRequestFailed = true;
      } catch {
        childTerminationRequestFailed = true;
      }
    };

    const terminalObservation = (patch: Partial<FixedReadOnlyDirectSpawnObservation>) => buildFixedReadOnlyDirectSpawnObservation({
      processAttempted: true,
      processStarted,
      processExited,
      stdoutBytes,
      stderrBytes,
      stdoutOverflow,
      stderrOverflow,
      combinedOutputOverflow,
      terminalReason,
      internalTerminalCondition,
      childTerminationRequested,
      childTerminationSignal: childTerminationRequested ? "SIGKILL" : null,
      childTerminationRequestFailed,
      processClosedAfterInternalTerminalCondition,
      observedAt,
      ...patch,
    });

    const settleInternalTerminal = (reason: FixedReadOnlyDirectSpawnTerminalReason, patch: Partial<FixedReadOnlyDirectSpawnObservation> = {}) => {
      if (settled) return;
      terminalReason = reason;
      internalTerminalCondition = true;
      requestFixedTermination();
      settle(terminalObservation({
        processExited: false,
        ...patch,
      }));
    };

    const recordChunk = (stream: "stdout" | "stderr", chunk: unknown) => {
      if (settled) return;
      if (!Buffer.isBuffer(chunk) && typeof chunk !== "string") {
        settleInternalTerminal("unexpected_stream_chunk", { unexpectedStreamChunk: true });
        return;
      }
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      if (stream === "stdout") stdoutBytes += buffer.byteLength;
      else stderrBytes += buffer.byteLength;
      if (stdoutBytes > DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.stdoutMaxBytes) stdoutOverflow = true;
      if (stderrBytes > DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.stderrMaxBytes) stderrOverflow = true;
      if (stdoutBytes + stderrBytes > DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.combinedMaxBytes) combinedOutputOverflow = true;
      if (stdoutOverflow) {
        settleInternalTerminal("stdout_output_limit_exceeded");
        return;
      }
      if (stderrOverflow) {
        settleInternalTerminal("stderr_output_limit_exceeded");
        return;
      }
      if (combinedOutputOverflow) {
        settleInternalTerminal("combined_output_limit_exceeded");
        return;
      }
      if (stream === "stdout") stdoutChunks.push(buffer);
      else stderrChunks.push(buffer);
    };

    const onSpawn = () => {
      if (settled) return;
      processStarted = true;
    };
    const onStdoutData = (chunk: unknown) => recordChunk("stdout", chunk);
    const onStderrData = (chunk: unknown) => recordChunk("stderr", chunk);
    const onStdoutError = () => settleInternalTerminal("stdout_stream_error");
    const onStderrError = () => settleInternalTerminal("stderr_stream_error");
    const onChildError = () => {
      if (settled) return;
      terminalReason = "child_process_error";
      internalTerminalCondition = true;
      settle(terminalObservation({
        processAttempted: true,
        processStarted,
        processExited: false,
        spawnError: true,
        spawnErrorCode: "child_process_error",
      }));
    };
    const onExit = () => {
      if (settled) return;
      processExited = true;
    };
    const onClose = (exitCode: number | null, signal: NodeJS.Signals | null) => {
      if (settled) {
        processClosedAfterInternalTerminalCondition = internalTerminalCondition;
        return;
      }
      terminalReason = "process_closed";
      processStarted = true;
      processExited = true;
      const stdout = decodeBoundedUtf8(Buffer.concat(stdoutChunks));
      const stderr = decodeBoundedUtf8(Buffer.concat(stderrChunks));
      settle(terminalObservation({
        exitCode,
        signal,
        stdoutText: stdout.text,
        stderrText: stderr.text,
        invalidStdoutEncoding: stdout.invalidEncoding,
        invalidStderrEncoding: stderr.invalidEncoding,
        binaryStdout: stdout.binary,
        binaryStderr: stderr.binary,
      }));
    };

    if (!child.stdout || !child.stderr) {
      settleInternalTerminal("unexpected_stream_chunk", { unexpectedStreamChunk: true });
      return;
    }

    child.once("spawn", onSpawn);
    child.stdout?.on("data", onStdoutData);
    child.stderr?.on("data", onStderrData);
    child.stdout?.once("error", onStdoutError);
    child.stderr?.once("error", onStderrError);
    child.once("error", onChildError);
    child.once("exit", onExit);
    child.once("close", onClose);
  });
}

function decodeBoundedUtf8(input: Buffer): Readonly<{ text: string | null; invalidEncoding: boolean; binary: boolean }> {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(input);
    return { text, invalidEncoding: false, binary: text.includes("\0") };
  } catch {
    return { text: null, invalidEncoding: true, binary: false };
  }
}
