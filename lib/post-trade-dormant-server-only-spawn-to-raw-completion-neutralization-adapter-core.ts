import { createHash } from "node:crypto";

import {
  DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY,
  type FixedReadOnlyDirectSpawnObservation,
  type FixedReadOnlyDirectSpawnResult,
} from "@/lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core";
import {
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY,
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY,
  buildPureRawProcessCompletionEvidence,
  type RawProcessCompletionCategory,
  type RawProcessCompletionEvidenceInput,
  type RawProcessCompletionResult,
} from "@/lib/post-trade-pure-raw-process-completion-evidence-contract-core";

export const DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY = deepFreeze({
  adapterKind: "dormant_server_only_spawn_to_raw_completion_neutralization_adapter",
  adapterId: "ture.execution.dormant-server-only-spawn-to-raw-completion-neutralization-adapter.server.v1",
  adapterVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  serverOnlyWrapperRequired: true,
  dormant: true,
  authoritativeLive: false,
  observesLiveProcess: false,
  createsProcess: false,
  parsesCliOutput: false,
  enablesRuntime: false,
} as const);

export const DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_POLICY = deepFreeze({
  policyId: "dormant_server_only_spawn_to_raw_completion_neutralization_policy_v1",
  policyVersion: 1,
  acceptedSourceAdapterId: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY.adapterId,
  acceptedSourcePolicyId: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.policyId,
  acceptedRawCompletionContractId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId,
  acceptedRawCompletionPolicyId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId,
  acceptedPurpose: "first_live_read_only_staging_preflight",
  acceptedToolIdentity: "git",
  acceptedPlatform: "macos",
  acceptedExecutablePath: "/usr/bin/git",
  acceptedArgv: ["--version"] as const,
  supportedCategories: [
    "spawn_failed_before_process_creation",
    "process_created_normal_zero_exit",
    "process_created_non_zero_exit",
    "process_created_signal_termination",
    "child_process_error",
    "stdout_output_limit_exceeded",
    "stderr_output_limit_exceeded",
    "combined_output_limit_exceeded",
  ] as const,
  unsupportedCategories: [
    "stdout_stream_error",
    "stderr_stream_error",
    "invalid_output_encoding",
    "unexpected_stream_chunk",
    "process_close_without_exit",
    "internally_terminal_process_death_unconfirmed",
  ] as const,
  provenanceClassification: "fixture_synthetic",
  fixtureLiveClassification: "fixture_only_not_live_observation",
  observedLiveProcess: false,
  authority: "none",
  retryAllowed: false,
  fallbackAllowed: false,
  toctouEliminated: false,
} as const);

export const DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:dormant-server-only-spawn-to-raw-completion-neutralization-adapter:identity:v1",
  policy: "ture:dormant-server-only-spawn-to-raw-completion-neutralization-adapter:policy:v1",
  sourceLinkage: "ture:dormant-server-only-spawn-to-raw-completion-neutralization-adapter:source-linkage:v1",
  result: "ture:dormant-server-only-spawn-to-raw-completion-neutralization-adapter:result:v1",
} as const);

export type SpawnToRawCompletionNeutralizationReason =
  | "accepted"
  | "input_rejected"
  | "production_provenance_rejected"
  | "already_consumed"
  | "source_contract_identity_rejected"
  | "source_result_fingerprint_rejected"
  | "source_revalidation_linkage_rejected"
  | "session_rejected"
  | "purpose_rejected"
  | "tool_rejected"
  | "platform_rejected"
  | "policy_rejected"
  | "executable_rejected"
  | "argv_rejected"
  | "source_state_rejected"
  | "source_lifecycle_rejected"
  | "source_output_rejected"
  | "source_encoding_rejected"
  | "source_termination_rejected"
  | "source_authority_rejected"
  | "source_live_claim_rejected"
  | "stale_or_expired"
  | "mapping_rejected"
  | "raw_completion_builder_rejected"
  | "unexpected_internal_failure";

export type NeutralizationSourceRecord = Readonly<{
  ok: true;
  sourceKind: "fixed_read_only_direct_spawn_raw_completion_neutralization_source";
  sourceVersion: 1;
  directSpawnResult: FixedReadOnlyDirectSpawnResult;
  spawnObservation: FixedReadOnlyDirectSpawnObservation;
  consumedAt: string;
}>;

export type SpawnToRawCompletionNeutralizationResult = Readonly<{
  resultKind: "dormant_server_only_spawn_to_raw_completion_neutralization_result";
  resultVersion: 1;
  adapterId: typeof DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY.adapterId;
  status: "neutralized_raw_completion_ready" | "blocked_fail_closed";
  serverOnly: true;
  dormant: true;
  rawCompletionInvoked: boolean;
  rawCompletionAccepted: boolean;
  gitParserInvoked: false;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  blockingReasons: readonly SpawnToRawCompletionNeutralizationReason[];
  sourceSpawnResultFingerprint: string | null;
  sourceSpawnEvidenceFingerprint: string | null;
  sourceSpawnObservationFingerprint: string | null;
  neutralizationTimestamp: string | null;
  rawCompletionResult: RawProcessCompletionResult | null;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export function neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(input: unknown): SpawnToRawCompletionNeutralizationResult {
  if (!isRecord(input) || input.ok !== true) {
    return buildNeutralizationResult({
      reasons: mapSourceBlockingReasons(isRecord(input) && Array.isArray(input.blockingReasons) ? input.blockingReasons : ["input_rejected"]),
      source: null,
      rawCompletionResult: null,
      rawCompletionInvoked: false,
    });
  }
  const source = input as NeutralizationSourceRecord;
  const sourceReasons = validateSourceRecord(source);
  const mapping = sourceReasons.length === 0 ? mapSourceToRawInput(source) : { ok: false as const, reasons: sourceReasons };
  if (!mapping.ok) {
    return buildNeutralizationResult({
      reasons: mapping.reasons,
      source,
      rawCompletionResult: null,
      rawCompletionInvoked: false,
    });
  }
  const rawCompletionResult = buildPureRawProcessCompletionEvidence(mapping.rawInput);
  if (rawCompletionResult.status !== "accepted_fixture_raw_completion_evidence") {
    return buildNeutralizationResult({
      reasons: ["raw_completion_builder_rejected"],
      source,
      rawCompletionResult,
      rawCompletionInvoked: true,
    });
  }
  return buildNeutralizationResult({
    reasons: [],
    source,
    rawCompletionResult,
    rawCompletionInvoked: true,
  });
}

function validateSourceRecord(source: NeutralizationSourceRecord): readonly SpawnToRawCompletionNeutralizationReason[] {
  const reasons: SpawnToRawCompletionNeutralizationReason[] = [];
  const result = source.directSpawnResult;
  const evidence = result?.evidence;
  const observation = source.spawnObservation;
  if (source.sourceKind !== "fixed_read_only_direct_spawn_raw_completion_neutralization_source" || source.sourceVersion !== 1) reasons.push("input_rejected");
  if (typeof source.consumedAt !== "string" || !isIsoTimestamp(source.consumedAt)) reasons.push("stale_or_expired");
  if (!isRecord(result) || !isRecord(evidence) || !isRecord(observation)) return sorted([...reasons, "input_rejected"]);
  if (result.resultKind !== "dormant_server_only_fixed_read_only_direct_spawn_result" || result.resultVersion !== 1 || result.adapterId !== DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY.adapterId) reasons.push("source_contract_identity_rejected");
  if (result.status === "blocked_fail_closed" || evidence.status === "blocked_fail_closed") reasons.push("source_state_rejected");
  if (result.serverOnly !== true || result.dormant !== true) reasons.push("source_contract_identity_rejected");
  if (result.authoritativeLive !== false || evidence.authoritativeLive !== false) reasons.push("source_authority_rejected");
  if (evidence.policyId !== DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.policyId || evidence.policyVersion !== 1) reasons.push("policy_rejected");
  if (evidence.purpose !== "first_live_read_only_staging_preflight") reasons.push("purpose_rejected");
  if (evidence.platform !== "macos") reasons.push("platform_rejected");
  if (evidence.toolIdentity !== "git") reasons.push("tool_rejected");
  if (evidence.executablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (!Array.isArray(evidence.argv) || evidence.argv.length !== 1 || evidence.argv[0] !== "--version") reasons.push("argv_rejected");
  if (typeof evidence.boundarySessionId !== "string" || evidence.boundarySessionId.length === 0) reasons.push("session_rejected");
  if (typeof evidence.acceptedRevalidationResultFingerprint !== "string" || typeof evidence.acceptedRevalidationEvidenceFingerprint !== "string" || typeof evidence.acceptedRevalidationObservationFingerprint !== "string") reasons.push("source_revalidation_linkage_rejected");
  if (result.processAttempted !== evidence.processAttempted || result.processStarted !== evidence.processStarted || result.processSpawned !== evidence.processSpawned) reasons.push("source_lifecycle_rejected");
  if (evidence.processAttemptCount !== 1 || evidence.retryCount !== 0 || evidence.fallbackAttempted !== false || evidence.alternateExecutableAttempted !== false) reasons.push("source_lifecycle_rejected");
  if (result.shellUsed || result.credentialAccessed || result.networkAccessed || result.cliVersionCollected || result.cliVersionInterpreted || result.observerInvoked || result.authorizationConsumed) reasons.push("source_authority_rejected");
  if (result.enablesObserverAuthority || result.enablesCredentialAccess || result.enablesCliVersionAuthority || result.enablesPreflightRunner) reasons.push("source_authority_rejected");
  if (evidence.shellUsed || evidence.cliVersionCollected || evidence.cliVersionInterpreted || evidence.observerInvoked || evidence.credentialAccessed || evidence.networkAccessed || evidence.authorizationConsumed) reasons.push("source_authority_rejected");
  if (evidence.spawnAuthority !== "single_consumed_attempt_only" || evidence.observerAuthority !== "none" || evidence.credentialAuthority !== "none" || evidence.cliVersionAuthority !== "none" || evidence.runnerAuthority !== "none" || evidence.authorizationConsumptionAuthority !== "none" || evidence.networkAuthority !== "none" || evidence.apiAuthority !== "none" || evidence.uiAuthority !== "none" || evidence.tradingAuthority !== "none" || evidence.avanzaAuthority !== "none" || evidence.persistenceAuthority !== "none" || evidence.deploymentAuthority !== "none") reasons.push("source_authority_rejected");
  if (evidence.toctouEliminated !== false || evidence.exactRevalidatedInodeExecuted !== false) reasons.push("source_live_claim_rejected");
  if (observation.observationKind !== "dormant_fixed_read_only_direct_spawn_observation" || observation.observationVersion !== 1) reasons.push("source_lifecycle_rejected");
  if (observation.processAttempted !== true) reasons.push("source_lifecycle_rejected");
  if (observation.observedAt !== evidence.evaluatedAt) reasons.push("source_lifecycle_rejected");
  return sorted(reasons);
}

function mapSourceToRawInput(source: NeutralizationSourceRecord): { ok: true; rawInput: RawProcessCompletionEvidenceInput } | { ok: false; reasons: readonly SpawnToRawCompletionNeutralizationReason[] } {
  const result = source.directSpawnResult;
  const evidence = result.evidence;
  const observation = source.spawnObservation;
  const category = mapCompletionCategory(observation);
  if (!category.ok) return { ok: false, reasons: category.reasons };
  const output = mapOutput(observation, category.category);
  if (!output.ok) return { ok: false, reasons: output.reasons };
  const termination = mapTermination(observation, category.category);
  if (!termination.ok) return { ok: false, reasons: termination.reasons };
  const isCloseCategory = category.category === "process_created_normal_zero_exit" || category.category === "process_created_non_zero_exit" || category.category === "process_created_signal_termination";
  const isSpawnFailure = category.category === "spawn_failed_before_process_creation";
  const rawInput: RawProcessCompletionEvidenceInput = deepFreeze({
    contractKind: "pure_raw_process_completion_evidence_contract",
    contractVersion: 1,
    boundaryId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId,
    sourceSpawnContractId: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY.adapterId,
    sourceSpawnContractVersion: 1,
    sourceSpawnFingerprint: result.resultFingerprint,
    boundarySessionId: evidence.boundarySessionId as string,
    purpose: "first_live_read_only_staging_preflight",
    toolIdentity: "git",
    platform: "macos",
    policyId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId,
    policyVersion: 1,
    canonicalExecutablePath: "/usr/bin/git",
    fixedArgvIdentity: "git_version_argv_v1",
    argv: ["--version"],
    spawnAttemptId: result.resultFingerprint,
    evidenceTimestamp: source.consumedAt,
    provenanceClassification: "fixture_synthetic",
    fixtureLiveClassification: "fixture_only_not_live_observation",
    spawnAttempted: true,
    processCreated: !isSpawnFailure,
    spawnErrorObserved: isSpawnFailure || category.category === "child_process_error",
    spawnErrorReason: isSpawnFailure ? "spawn_exception" : category.category === "child_process_error" ? "child_process_error" : "none",
    processStartedObserved: !isSpawnFailure,
    exitObserved: isCloseCategory,
    exitCode: category.category === "process_created_signal_termination" ? null : isCloseCategory ? observation.exitCode : null,
    signalObserved: category.category === "process_created_signal_termination",
    signal: category.category === "process_created_signal_termination" ? observation.signal : null,
    closeObserved: isCloseCategory,
    closeCode: category.category === "process_created_signal_termination" ? null : isCloseCategory ? observation.exitCode : null,
    closeSignal: category.category === "process_created_signal_termination" ? observation.signal : null,
    completionTerminal: true,
    completionCategory: category.category,
    completionReason: category.category,
    stdoutByteCount: output.stdoutByteCount,
    stderrByteCount: output.stderrByteCount,
    combinedByteCount: output.stdoutByteCount + output.stderrByteCount,
    stdoutText: output.stdoutText,
    stderrText: output.stderrText,
    utf8Valid: output.utf8Valid,
    stdoutOverflow: category.category === "stdout_output_limit_exceeded",
    stderrOverflow: category.category === "stderr_output_limit_exceeded",
    combinedOverflow: category.category === "combined_output_limit_exceeded",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    terminationRequested: termination.terminationRequested,
    terminationSignal: termination.terminationSignal,
    terminationRequestSucceeded: termination.terminationRequestSucceeded,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    lifecycleState: lifecycleForCategory(category.category),
    eventOrderClassification: eventOrderForCategory(category.category),
    terminalSettlementTimestamp: evidence.evaluatedAt,
    settledExactlyOnce: true,
    retryCount: 0,
    fallbackAttempted: false,
    shellUsed: false,
    pathLookupUsed: false,
    inheritedEnvironmentUsed: false,
    credentialsUsed: false,
    networkUsed: false,
    observerAuthorityGranted: false,
    cliVersionInterpreted: false,
    authorizationConsumed: false,
    runtimeActivated: false,
    toctouEliminated: false,
    authority: "none",
  });
  return { ok: true, rawInput };
}

function mapCompletionCategory(observation: FixedReadOnlyDirectSpawnObservation): { ok: true; category: RawProcessCompletionCategory } | { ok: false; reasons: readonly SpawnToRawCompletionNeutralizationReason[] } {
  if (observation.spawnError && observation.processStarted === false && observation.spawnErrorCode === "spawn_exception") return { ok: true, category: "spawn_failed_before_process_creation" };
  if (observation.terminalReason === "child_process_error" && observation.spawnErrorCode === "child_process_error") return { ok: true, category: "child_process_error" };
  if (observation.terminalReason === "stdout_output_limit_exceeded" && observation.stdoutOverflow) return { ok: true, category: "stdout_output_limit_exceeded" };
  if (observation.terminalReason === "stderr_output_limit_exceeded" && observation.stderrOverflow) return { ok: true, category: "stderr_output_limit_exceeded" };
  if (observation.terminalReason === "combined_output_limit_exceeded" && observation.combinedOutputOverflow) return { ok: true, category: "combined_output_limit_exceeded" };
  if (observation.terminalReason === "process_closed" && observation.processStarted && observation.processExited && !observation.invalidStdoutEncoding && !observation.invalidStderrEncoding && !observation.binaryStdout && !observation.binaryStderr) {
    if (observation.signal !== null) return { ok: true, category: "process_created_signal_termination" };
    if (observation.exitCode === 0) return { ok: true, category: "process_created_normal_zero_exit" };
    if (typeof observation.exitCode === "number") return { ok: true, category: "process_created_non_zero_exit" };
  }
  if (observation.invalidStdoutEncoding || observation.invalidStderrEncoding || observation.binaryStdout || observation.binaryStderr) return { ok: false, reasons: ["source_encoding_rejected"] };
  if (observation.terminalReason === "stdout_stream_error" || observation.terminalReason === "stderr_stream_error" || observation.terminalReason === "unexpected_stream_chunk") return { ok: false, reasons: ["source_termination_rejected"] };
  return { ok: false, reasons: ["source_state_rejected"] };
}

function mapOutput(
  observation: FixedReadOnlyDirectSpawnObservation,
  category: RawProcessCompletionCategory,
): { ok: true; stdoutByteCount: number; stderrByteCount: number; stdoutText: string | null; stderrText: string | null; utf8Valid: boolean } | { ok: false; reasons: readonly SpawnToRawCompletionNeutralizationReason[] } {
  if (category === "stdout_output_limit_exceeded" || category === "stderr_output_limit_exceeded" || category === "combined_output_limit_exceeded") {
    return { ok: true, stdoutByteCount: observation.stdoutBytes, stderrByteCount: observation.stderrBytes, stdoutText: null, stderrText: null, utf8Valid: true };
  }
  if (category === "spawn_failed_before_process_creation" || category === "child_process_error") {
    if (observation.stdoutBytes !== 0 || observation.stderrBytes !== 0) return { ok: false, reasons: ["source_output_rejected"] };
    return { ok: true, stdoutByteCount: 0, stderrByteCount: 0, stdoutText: "", stderrText: "", utf8Valid: true };
  }
  if (typeof observation.stdoutText !== "string" || typeof observation.stderrText !== "string") return { ok: false, reasons: ["source_output_rejected"] };
  if (Buffer.byteLength(observation.stdoutText, "utf8") !== observation.stdoutBytes || Buffer.byteLength(observation.stderrText, "utf8") !== observation.stderrBytes) return { ok: false, reasons: ["source_output_rejected"] };
  return { ok: true, stdoutByteCount: observation.stdoutBytes, stderrByteCount: observation.stderrBytes, stdoutText: observation.stdoutText, stderrText: observation.stderrText, utf8Valid: true };
}

function mapTermination(
  observation: FixedReadOnlyDirectSpawnObservation,
  category: RawProcessCompletionCategory,
): { ok: true; terminationRequested: boolean; terminationSignal: "SIGKILL" | null; terminationRequestSucceeded: boolean | null } | { ok: false; reasons: readonly SpawnToRawCompletionNeutralizationReason[] } {
  const overflow = category === "stdout_output_limit_exceeded" || category === "stderr_output_limit_exceeded" || category === "combined_output_limit_exceeded";
  if (!overflow) {
    if (observation.childTerminationRequested || observation.childTerminationSignal !== null || observation.childTerminationRequestFailed) return { ok: false, reasons: ["source_termination_rejected"] };
    return { ok: true, terminationRequested: false, terminationSignal: null, terminationRequestSucceeded: null };
  }
  if (!observation.childTerminationRequested || observation.childTerminationSignal !== "SIGKILL" || observation.childTerminationRequestFailed) return { ok: false, reasons: ["source_termination_rejected"] };
  return { ok: true, terminationRequested: true, terminationSignal: "SIGKILL", terminationRequestSucceeded: true };
}

function lifecycleForCategory(category: RawProcessCompletionCategory): RawProcessCompletionEvidenceInput["lifecycleState"] {
  if (category === "spawn_failed_before_process_creation") return "spawn_failed_before_process_creation";
  if (category === "stdout_output_limit_exceeded" || category === "stderr_output_limit_exceeded" || category === "combined_output_limit_exceeded") return "process_created_terminal_overflow";
  if (category === "child_process_error") return "process_created_terminal_error";
  return "process_created_terminal_close_observed";
}

function eventOrderForCategory(category: RawProcessCompletionCategory): RawProcessCompletionEvidenceInput["eventOrderClassification"] {
  if (category === "spawn_failed_before_process_creation") return "spawn_error_without_process";
  if (category === "stdout_output_limit_exceeded" || category === "stderr_output_limit_exceeded" || category === "combined_output_limit_exceeded" || category === "child_process_error") return "spawn_then_internal_terminal";
  return "spawn_then_exit_then_close";
}

function buildNeutralizationResult(input: Readonly<{
  reasons: readonly SpawnToRawCompletionNeutralizationReason[];
  source: NeutralizationSourceRecord | null;
  rawCompletionResult: RawProcessCompletionResult | null;
  rawCompletionInvoked: boolean;
}>): SpawnToRawCompletionNeutralizationResult {
  const reasons = sorted(input.reasons);
  const status = reasons.length === 0 && input.rawCompletionResult?.status === "accepted_fixture_raw_completion_evidence"
    ? "neutralized_raw_completion_ready"
    : "blocked_fail_closed";
  const core = {
    resultKind: "dormant_server_only_spawn_to_raw_completion_neutralization_result",
    resultVersion: 1,
    adapterId: DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY.adapterId,
    status,
    serverOnly: true,
    dormant: true,
    rawCompletionInvoked: input.rawCompletionInvoked,
    rawCompletionAccepted: status === "neutralized_raw_completion_ready",
    gitParserInvoked: false,
    observedLiveProcess: false,
    authoritativeLive: false,
    authority: "none",
    blockingReasons: status === "neutralized_raw_completion_ready" ? [] : reasons.length > 0 ? reasons : ["mapping_rejected"],
    sourceSpawnResultFingerprint: input.source?.directSpawnResult.resultFingerprint ?? null,
    sourceSpawnEvidenceFingerprint: input.source?.directSpawnResult.evidence.evidenceFingerprint ?? null,
    sourceSpawnObservationFingerprint: input.source?.spawnObservation.observationFingerprint ?? null,
    neutralizationTimestamp: input.source?.consumedAt ?? null,
    rawCompletionResult: input.rawCompletionResult,
  } satisfies Omit<SpawnToRawCompletionNeutralizationResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_FINGERPRINT_DOMAINS.result, core),
  } satisfies SpawnToRawCompletionNeutralizationResult);
}

function mapSourceBlockingReasons(input: readonly unknown[]): readonly SpawnToRawCompletionNeutralizationReason[] {
  return sorted(input.map((reason) => {
    if (reason === "already_consumed") return "already_consumed";
    if (reason === "production_provenance_rejected") return "production_provenance_rejected";
    if (reason === "source_result_fingerprint_rejected") return "source_result_fingerprint_rejected";
    if (reason === "source_contract_identity_rejected") return "source_contract_identity_rejected";
    if (reason === "source_state_rejected") return "source_state_rejected";
    if (reason === "source_authority_rejected") return "source_authority_rejected";
    if (reason === "source_live_claim_rejected") return "source_live_claim_rejected";
    return "input_rejected";
  }));
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isIsoTimestamp(input: string): boolean {
  const parsed = Date.parse(input);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === input;
}

function sorted<T extends string>(input: readonly T[]): readonly T[] {
  return [...new Set(input)].sort();
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

function deepFreeze<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreeze(value);
  }
  return input;
}
