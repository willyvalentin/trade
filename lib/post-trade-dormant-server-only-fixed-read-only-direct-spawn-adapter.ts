import "server-only";

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

import {
  DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY,
  DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS,
  buildFixedReadOnlyDirectSpawnObservation,
  evaluateFixedReadOnlyDirectSpawnCore,
  type FixedReadOnlyDirectSpawnObservation,
  type FixedReadOnlyDirectSpawnEvidence,
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

export type FixedReadOnlyDirectSpawnForRawCompletionNeutralizationConsumption = Readonly<
  | {
    ok: true;
    sourceKind: "fixed_read_only_direct_spawn_raw_completion_neutralization_source";
    sourceVersion: 1;
    directSpawnResult: FixedReadOnlyDirectSpawnResult;
    spawnObservation: FixedReadOnlyDirectSpawnObservation;
    consumedAt: string;
  }
  | {
    ok: false;
    consumedAt: string;
    blockingReasons: readonly string[];
  }
>;

const PRODUCTION_FIXED_DIRECT_SPAWN_RESULT_PROVENANCE = new WeakMap<FixedReadOnlyDirectSpawnResult, FixedReadOnlyDirectSpawnObservation>();
const PRODUCTION_FIXED_DIRECT_SPAWN_EVIDENCE_PROVENANCE = new WeakSet<FixedReadOnlyDirectSpawnEvidence>();
const PRODUCTION_FIXED_DIRECT_SPAWN_RESULTS_CONSUMED_FOR_RAW_COMPLETION_NEUTRALIZATION = new WeakSet<FixedReadOnlyDirectSpawnResult>();

export async function spawnDormantServerOnlyFixedReadOnlyGitVersion(input: DormantServerOnlyFixedReadOnlyDirectSpawnInput): Promise<FixedReadOnlyDirectSpawnResult> {
  const consumedRevalidation = consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn(input);
  if (!consumedRevalidation.ok) return evaluateFixedReadOnlyDirectSpawnCore({ consumedRevalidation });
  try {
    const spawnObservation = await performOneFixedGitVersionSpawn(consumedRevalidation.approvedExecutablePath, consumedRevalidation.evaluatedAt);
    return markProductionDirectSpawnProvenance(evaluateFixedReadOnlyDirectSpawnCore({ consumedRevalidation, spawnObservation }), spawnObservation);
  } catch {
    const spawnObservation = buildFixedReadOnlyDirectSpawnObservation({
      processAttempted: true,
      processStarted: false,
      processExited: false,
      spawnError: true,
      spawnErrorCode: "spawn_exception",
      observedAt: consumedRevalidation.evaluatedAt,
    });
    return markProductionDirectSpawnProvenance(evaluateFixedReadOnlyDirectSpawnCore({ consumedRevalidation, spawnObservation }), spawnObservation);
  }
}

export function consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization(input: unknown): FixedReadOnlyDirectSpawnForRawCompletionNeutralizationConsumption {
  const consumedAt = new Date().toISOString();
  if (!isPlainOwnDataObject(input)) return { ok: false, consumedAt, blockingReasons: ["input_rejected"] };
  const keys = Object.keys(input);
  if (keys.length !== 1 || keys[0] !== "directSpawnResult") return { ok: false, consumedAt, blockingReasons: ["input_rejected"] };
  const directSpawnResult = input.directSpawnResult;
  if (typeof directSpawnResult !== "object" || directSpawnResult === null) return { ok: false, consumedAt, blockingReasons: ["input_rejected"] };
  const typedResult = directSpawnResult as FixedReadOnlyDirectSpawnResult;
  const spawnObservation = PRODUCTION_FIXED_DIRECT_SPAWN_RESULT_PROVENANCE.get(typedResult);
  if (!spawnObservation || !PRODUCTION_FIXED_DIRECT_SPAWN_EVIDENCE_PROVENANCE.has(typedResult.evidence)) {
    return { ok: false, consumedAt, blockingReasons: ["production_provenance_rejected"] };
  }
  if (PRODUCTION_FIXED_DIRECT_SPAWN_RESULTS_CONSUMED_FOR_RAW_COMPLETION_NEUTRALIZATION.has(typedResult)) {
    return { ok: false, consumedAt, blockingReasons: ["already_consumed"] };
  }
  const reasons = validateProductionFixedDirectSpawnResultForRawCompletionNeutralization(typedResult, spawnObservation);
  PRODUCTION_FIXED_DIRECT_SPAWN_RESULTS_CONSUMED_FOR_RAW_COMPLETION_NEUTRALIZATION.add(typedResult);
  if (reasons.length > 0) return { ok: false, consumedAt, blockingReasons: reasons };
  return {
    ok: true,
    sourceKind: "fixed_read_only_direct_spawn_raw_completion_neutralization_source",
    sourceVersion: 1,
    directSpawnResult: typedResult,
    spawnObservation,
    consumedAt,
  };
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

function markProductionDirectSpawnProvenance(result: FixedReadOnlyDirectSpawnResult, spawnObservation: FixedReadOnlyDirectSpawnObservation): FixedReadOnlyDirectSpawnResult {
  if (result.status === "blocked_fail_closed" || result.processAttempted !== true) return result;
  PRODUCTION_FIXED_DIRECT_SPAWN_RESULT_PROVENANCE.set(result, spawnObservation);
  PRODUCTION_FIXED_DIRECT_SPAWN_EVIDENCE_PROVENANCE.add(result.evidence);
  return result;
}

function validateProductionFixedDirectSpawnResultForRawCompletionNeutralization(
  result: FixedReadOnlyDirectSpawnResult,
  spawnObservation: FixedReadOnlyDirectSpawnObservation,
): readonly string[] {
  const reasons: string[] = [];
  const evidence = result.evidence;
  if (!Object.isFrozen(result) || !Object.isFrozen(evidence) || !Object.isFrozen(spawnObservation)) reasons.push("source_result_fingerprint_rejected");
  if (result.resultKind !== "dormant_server_only_fixed_read_only_direct_spawn_result" || result.resultVersion !== 1) reasons.push("source_contract_identity_rejected");
  if (result.adapterId !== "ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1") reasons.push("source_contract_identity_rejected");
  if (result.serverOnly !== true || result.dormant !== true) reasons.push("source_contract_identity_rejected");
  if (result.status === "blocked_fail_closed" || evidence.status === "blocked_fail_closed") reasons.push("source_state_rejected");
  if (result.authoritativeLive !== false || evidence.authoritativeLive !== false) reasons.push("source_authority_rejected");
  if (result.processSpawned !== evidence.processSpawned || result.processStarted !== evidence.processStarted || result.processAttempted !== evidence.processAttempted) reasons.push("source_lifecycle_rejected");
  if (result.shellUsed !== false || result.credentialAccessed !== false || result.networkAccessed !== false || result.cliVersionCollected !== false || result.cliVersionInterpreted !== false || result.observerInvoked !== false || result.authorizationConsumed !== false) reasons.push("source_authority_rejected");
  if (result.enablesObserverAuthority !== false || result.enablesCredentialAccess !== false || result.enablesCliVersionAuthority !== false || result.enablesPreflightRunner !== false) reasons.push("source_authority_rejected");
  if (evidence.policyId !== DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.policyId || evidence.policyVersion !== DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.policyVersion) reasons.push("policy_rejected");
  if (evidence.purpose !== "first_live_read_only_staging_preflight") reasons.push("purpose_rejected");
  if (evidence.toolIdentity !== "git") reasons.push("tool_rejected");
  if (evidence.platform !== "macos") reasons.push("platform_rejected");
  if (evidence.executablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (JSON.stringify(evidence.argv) !== JSON.stringify(["--version"])) reasons.push("argv_rejected");
  if (evidence.shellUsed !== false || evidence.cliVersionCollected !== false || evidence.cliVersionInterpreted !== false || evidence.observerInvoked !== false || evidence.credentialAccessed !== false || evidence.networkAccessed !== false || evidence.authorizationConsumed !== false || evidence.retryCount !== 0 || evidence.fallbackAttempted !== false || evidence.alternateExecutableAttempted !== false) reasons.push("source_authority_rejected");
  if (evidence.spawnAuthority !== "single_consumed_attempt_only" || evidence.observerAuthority !== "none" || evidence.credentialAuthority !== "none" || evidence.cliVersionAuthority !== "none" || evidence.runnerAuthority !== "none" || evidence.authorizationConsumptionAuthority !== "none" || evidence.networkAuthority !== "none" || evidence.apiAuthority !== "none" || evidence.uiAuthority !== "none" || evidence.tradingAuthority !== "none" || evidence.avanzaAuthority !== "none" || evidence.persistenceAuthority !== "none" || evidence.deploymentAuthority !== "none") reasons.push("source_authority_rejected");
  if (evidence.toctouEliminated !== false || evidence.exactRevalidatedInodeExecuted !== false) reasons.push("source_live_claim_rejected");
  if (result.resultFingerprintAlgorithm !== "sha256" || result.resultFingerprint !== fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.result, stripResultFingerprint(result))) reasons.push("source_result_fingerprint_rejected");
  if (evidence.evidenceFingerprintAlgorithm !== "sha256" || evidence.evidenceFingerprint !== fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.evidence, stripEvidenceFingerprint(evidence))) reasons.push("source_result_fingerprint_rejected");
  if (spawnObservation.observationFingerprintAlgorithm !== "sha256" || spawnObservation.observationFingerprint !== fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.spawnObservation, stripObservationFingerprint(spawnObservation))) reasons.push("source_result_fingerprint_rejected");
  return [...new Set(reasons)].sort();
}

function stripEvidenceFingerprint(input: FixedReadOnlyDirectSpawnEvidence): Omit<FixedReadOnlyDirectSpawnEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint"> {
  const core = { ...input } as Record<string, unknown>;
  delete core.evidenceFingerprintAlgorithm;
  delete core.evidenceFingerprint;
  return core as Omit<FixedReadOnlyDirectSpawnEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
}

function stripResultFingerprint(input: FixedReadOnlyDirectSpawnResult): Omit<FixedReadOnlyDirectSpawnResult, "resultFingerprintAlgorithm" | "resultFingerprint"> {
  const core = { ...input } as Record<string, unknown>;
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  return core as Omit<FixedReadOnlyDirectSpawnResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
}

function stripObservationFingerprint(input: FixedReadOnlyDirectSpawnObservation): Omit<FixedReadOnlyDirectSpawnObservation, "observationFingerprintAlgorithm" | "observationFingerprint"> {
  const core = { ...input } as Record<string, unknown>;
  delete core.observationFingerprintAlgorithm;
  delete core.observationFingerprint;
  return core as Omit<FixedReadOnlyDirectSpawnObservation, "observationFingerprintAlgorithm" | "observationFingerprint">;
}

function isPlainOwnDataObject(input: unknown): input is Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return false;
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(input).length > 0) return false;
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") return false;
    if (descriptor.get || descriptor.set || !descriptor.enumerable) return false;
  }
  for (const key in input) if (!Object.prototype.hasOwnProperty.call(input, key)) return false;
  return true;
}

function fingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(canonicalize(input))}`).digest("hex");
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(canonicalize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, canonicalize(value)]));
  }
  return input;
}
