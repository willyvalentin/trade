import { createHash } from "node:crypto";

import {
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY,
  type ImmediatePreSpawnRevalidationResult,
} from "@/lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";
import {
  FIRST_LIVE_TRUSTED_RESOLVER_POLICY,
} from "@/lib/post-trade-first-live-trusted-resolver-adapter-core";

export const DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY = deepFreeze({
  adapterKind: "dormant_server_only_fixed_read_only_direct_spawn_adapter",
  adapterId: "ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1",
  contractVersion: 1,
  platform: "macos",
  implementationMode: "server_only_fixed_git_version_direct_spawn_dormant",
  purpose: "first_live_read_only_staging_preflight",
  serverOnly: true,
  dormant: true,
  authoritativeLive: false,
  enablesObserverAuthority: false,
  enablesCredentialAccess: false,
  enablesNetworkAccess: false,
  enablesCliVersionAuthority: false,
  enablesPreflightRunner: false,
} as const);

export const DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY = deepFreeze({
  policyId: "dormant_server_only_fixed_read_only_direct_spawn_git_version_policy_v1",
  policyVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  operation: "collect_git_version",
  toolIdentity: "git",
  executablePathSource: "consumed_original_immediate_pre_spawn_revalidation",
  acceptedRevalidationAdapterId: DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId,
  acceptedRevalidationPolicyId: DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyId,
  acceptedResolverPolicyId: FIRST_LIVE_TRUSTED_RESOLVER_POLICY.policyId,
  exactArgv: ["--version"] as const,
  shell: false,
  detached: false,
  cwdMode: "none",
  envMode: "fixed_source_controlled",
  fixedEnv: {
    LANG: "C",
    LC_ALL: "C",
  },
  inheritsParentEnvironment: false,
  stdin: "ignore",
  stdout: "bounded_pipe",
  stderr: "bounded_pipe",
  stdoutMaxBytes: 16384,
  stderrMaxBytes: 16384,
  combinedMaxBytes: 32768,
  outputEncoding: "utf8",
  invalidEncoding: "fail_closed",
  binaryOutput: "fail_closed",
  overflow: "fail_closed",
  retryPolicy: "none",
  fallbackAllowed: false,
  alternateExecutableAllowed: false,
  observerAuthorityGranted: false,
  credentialAuthorityGranted: false,
  cliVersionAuthorityGranted: false,
  authorizationConsumptionAuthorityGranted: false,
  toctouEliminated: false,
} as const);

export const DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:dormant-server-only-fixed-read-only-direct-spawn-adapter:identity:v1",
  policy: "ture:dormant-server-only-fixed-read-only-direct-spawn-adapter:policy:v1",
  spawnObservation: "ture:dormant-server-only-fixed-read-only-direct-spawn-adapter:spawn-observation:v1",
  evidence: "ture:dormant-server-only-fixed-read-only-direct-spawn-adapter:evidence:v1",
  result: "ture:dormant-server-only-fixed-read-only-direct-spawn-adapter:result:v1",
} as const);

export type FixedReadOnlyDirectSpawnLifecycleState =
  | "spawn_eligibility_blocked"
  | "spawn_attempt_started"
  | "spawn_failed"
  | "process_started"
  | "terminal_without_process"
  | "terminal_process_started_no_result_yet"
  | "terminal_process_exited_no_cli_interpretation";

export type FixedReadOnlyDirectSpawnBlockingReason =
  | "input_shape_rejected"
  | "production_revalidation_provenance_missing"
  | "production_revalidation_provenance_rejected"
  | "revalidation_result_rejected"
  | "revalidation_result_not_ready"
  | "revalidation_result_consumed"
  | "revalidation_result_stale_or_expired"
  | "revalidation_result_mutated_or_cloned"
  | "revalidation_result_session_mismatch"
  | "revalidation_result_purpose_mismatch"
  | "revalidation_result_tool_mismatch"
  | "revalidation_result_platform_mismatch"
  | "revalidation_result_boundary_mismatch"
  | "revalidation_result_policy_mismatch"
  | "revalidation_result_path_mismatch"
  | "revalidation_result_metadata_rejected"
  | "revalidation_result_authority_rejected"
  | "revalidation_result_toctou_claim_rejected"
  | "unsupported_tool"
  | "unsupported_platform"
  | "spawn_exception"
  | "spawn_error"
  | "child_process_error"
  | "process_exit_nonzero"
  | "process_signal_termination"
  | "stdout_overflow"
  | "stderr_overflow"
  | "combined_output_overflow"
  | "stdout_output_limit_exceeded"
  | "stderr_output_limit_exceeded"
  | "combined_output_limit_exceeded"
  | "invalid_stdout_encoding"
  | "invalid_stderr_encoding"
  | "invalid_output_encoding"
  | "binary_stdout"
  | "binary_stderr"
  | "stdout_stream_error"
  | "stderr_stream_error"
  | "child_termination_requested"
  | "child_termination_request_failed"
  | "unexpected_stream_chunk"
  | "process_closed_after_internal_terminal_condition";

export type FixedReadOnlyDirectSpawnTerminalReason =
  | "none"
  | "process_closed"
  | "spawn_exception"
  | "child_process_error"
  | "stdout_output_limit_exceeded"
  | "stderr_output_limit_exceeded"
  | "combined_output_limit_exceeded"
  | "stdout_stream_error"
  | "stderr_stream_error"
  | "unexpected_stream_chunk";

export type FixedReadOnlyDirectSpawnObservation = Readonly<{
  observationKind: "dormant_fixed_read_only_direct_spawn_observation";
  observationVersion: 1;
  processAttempted: boolean;
  processStarted: boolean;
  processExited: boolean;
  spawnError: boolean;
  spawnErrorCode: string | null;
  exitCode: number | null;
  signal: string | null;
  stdoutBytes: number;
  stderrBytes: number;
  stdoutText: string | null;
  stderrText: string | null;
  stdoutOverflow: boolean;
  stderrOverflow: boolean;
  combinedOutputOverflow: boolean;
  invalidStdoutEncoding: boolean;
  invalidStderrEncoding: boolean;
  binaryStdout: boolean;
  binaryStderr: boolean;
  unexpectedStreamChunk: boolean;
  terminalReason: FixedReadOnlyDirectSpawnTerminalReason;
  internalTerminalCondition: boolean;
  childTerminationRequested: boolean;
  childTerminationSignal: "SIGKILL" | null;
  childTerminationRequestFailed: boolean;
  processClosedAfterInternalTerminalCondition: boolean;
  observedAt: string;
  observationFingerprintAlgorithm: "sha256";
  observationFingerprint: string;
}>;

export type FixedReadOnlyDirectSpawnEvidence = Readonly<{
  evidenceKind: "dormant_fixed_read_only_direct_spawn_evidence";
  evidenceVersion: 1;
  adapterId: typeof DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY.adapterId;
  adapterIdentityFingerprint: string;
  policyId: typeof DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.policyId;
  policyVersion: 1;
  policyFingerprint: string;
  purpose: "first_live_read_only_staging_preflight";
  platform: "macos";
  operation: "collect_git_version";
  toolIdentity: "git" | null;
  executablePath: string | null;
  argv: readonly ["--version"];
  fixedEnvironment: typeof DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.fixedEnv;
  shell: false;
  detached: false;
  stdin: "ignore";
  stdoutMaxBytes: 16384;
  stderrMaxBytes: 16384;
  combinedMaxBytes: 32768;
  acceptedRevalidationResultFingerprint: string | null;
  acceptedRevalidationEvidenceFingerprint: string | null;
  acceptedRevalidationObservationFingerprint: string | null;
  acceptedRevalidationMetadata: ImmediatePreSpawnRevalidationResult["revalidationEvidence"]["observedMetadata"];
  boundarySessionId: string | null;
  productionRevalidationProvenance: "none" | "server_only_private_original_object";
  processAttempted: boolean;
  processStarted: boolean;
  processExited: boolean;
  processSpawned: boolean;
  terminalReason: FixedReadOnlyDirectSpawnTerminalReason;
  internalTerminalCondition: boolean;
  childTerminationRequested: boolean;
  childTerminationSignal: "SIGKILL" | null;
  childTerminationRequestFailed: boolean;
  processClosedAfterInternalTerminalCondition: boolean;
  shellUsed: false;
  cliVersionCollected: false;
  cliVersionInterpreted: false;
  observerInvoked: false;
  credentialAccessed: false;
  networkAccessed: false;
  authorizationConsumed: false;
  retryCount: 0;
  processAttemptCount: 0 | 1;
  fallbackAttempted: false;
  alternateExecutableAttempted: false;
  toctouEliminated: false;
  exactRevalidatedInodeExecuted: false;
  authoritativeLive: false;
  spawnAuthority: "single_consumed_attempt_only" | "none";
  observerAuthority: "none";
  credentialAuthority: "none";
  cliVersionAuthority: "none";
  runnerAuthority: "none";
  authorizationConsumptionAuthority: "none";
  networkAuthority: "none";
  apiAuthority: "none";
  uiAuthority: "none";
  tradingAuthority: "none";
  avanzaAuthority: "none";
  persistenceAuthority: "none";
  deploymentAuthority: "none";
  lifecycleState: FixedReadOnlyDirectSpawnLifecycleState;
  status: "blocked_fail_closed" | "spawn_failed_terminal" | "process_exited_non_authoritative_evidence";
  blockingReasons: readonly FixedReadOnlyDirectSpawnBlockingReason[];
  evaluatedAt: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type FixedReadOnlyDirectSpawnResult = Readonly<{
  resultKind: "dormant_server_only_fixed_read_only_direct_spawn_result";
  resultVersion: 1;
  adapterId: typeof DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY.adapterId;
  status: FixedReadOnlyDirectSpawnEvidence["status"];
  serverOnly: true;
  dormant: true;
  authoritativeLive: false;
  processAttempted: boolean;
  processStarted: boolean;
  processSpawned: boolean;
  shellUsed: false;
  credentialAccessed: false;
  networkAccessed: false;
  cliVersionCollected: false;
  cliVersionInterpreted: false;
  observerInvoked: false;
  authorizationConsumed: false;
  enablesObserverAuthority: false;
  enablesCredentialAccess: false;
  enablesCliVersionAuthority: false;
  enablesPreflightRunner: false;
  evidence: FixedReadOnlyDirectSpawnEvidence;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export type ConsumedRevalidationForFixedDirectSpawn =
  | Readonly<{
    ok: true;
    revalidationResult: ImmediatePreSpawnRevalidationResult;
    evaluatedAt: string;
    approvedExecutablePath: string;
  }>
  | Readonly<{
    ok: false;
    evaluatedAt: string;
    blockingReasons: readonly string[];
  }>;

export function buildFixedReadOnlyDirectSpawnObservation(input: Readonly<{
  processAttempted: boolean;
  processStarted: boolean;
  processExited: boolean;
  spawnError?: boolean;
  spawnErrorCode?: string | null;
  exitCode?: number | null;
  signal?: string | null;
  stdoutBytes?: number;
  stderrBytes?: number;
  stdoutText?: string | null;
  stderrText?: string | null;
  stdoutOverflow?: boolean;
  stderrOverflow?: boolean;
  combinedOutputOverflow?: boolean;
  invalidStdoutEncoding?: boolean;
  invalidStderrEncoding?: boolean;
  binaryStdout?: boolean;
  binaryStderr?: boolean;
  unexpectedStreamChunk?: boolean;
  terminalReason?: FixedReadOnlyDirectSpawnTerminalReason;
  internalTerminalCondition?: boolean;
  childTerminationRequested?: boolean;
  childTerminationSignal?: "SIGKILL" | null;
  childTerminationRequestFailed?: boolean;
  processClosedAfterInternalTerminalCondition?: boolean;
  observedAt: string;
}>): FixedReadOnlyDirectSpawnObservation {
  const core = {
    observationKind: "dormant_fixed_read_only_direct_spawn_observation",
    observationVersion: 1,
    processAttempted: input.processAttempted,
    processStarted: input.processStarted,
    processExited: input.processExited,
    spawnError: input.spawnError ?? false,
    spawnErrorCode: input.spawnErrorCode ?? null,
    exitCode: input.exitCode ?? null,
    signal: input.signal ?? null,
    stdoutBytes: input.stdoutBytes ?? 0,
    stderrBytes: input.stderrBytes ?? 0,
    stdoutText: input.stdoutText ?? null,
    stderrText: input.stderrText ?? null,
    stdoutOverflow: input.stdoutOverflow ?? false,
    stderrOverflow: input.stderrOverflow ?? false,
    combinedOutputOverflow: input.combinedOutputOverflow ?? false,
    invalidStdoutEncoding: input.invalidStdoutEncoding ?? false,
    invalidStderrEncoding: input.invalidStderrEncoding ?? false,
    binaryStdout: input.binaryStdout ?? false,
    binaryStderr: input.binaryStderr ?? false,
    unexpectedStreamChunk: input.unexpectedStreamChunk ?? false,
    terminalReason: input.terminalReason ?? "none",
    internalTerminalCondition: input.internalTerminalCondition ?? false,
    childTerminationRequested: input.childTerminationRequested ?? false,
    childTerminationSignal: input.childTerminationSignal ?? null,
    childTerminationRequestFailed: input.childTerminationRequestFailed ?? false,
    processClosedAfterInternalTerminalCondition: input.processClosedAfterInternalTerminalCondition ?? false,
    observedAt: input.observedAt,
  } satisfies Omit<FixedReadOnlyDirectSpawnObservation, "observationFingerprintAlgorithm" | "observationFingerprint">;
  return deepFreeze({
    ...core,
    observationFingerprintAlgorithm: "sha256",
    observationFingerprint: fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.spawnObservation, core),
  } satisfies FixedReadOnlyDirectSpawnObservation);
}

export function evaluateFixedReadOnlyDirectSpawnCore(input: Readonly<{
  consumedRevalidation: ConsumedRevalidationForFixedDirectSpawn;
  spawnObservation?: FixedReadOnlyDirectSpawnObservation;
}>): FixedReadOnlyDirectSpawnResult {
  const evaluatedAt = isRecord(input?.consumedRevalidation) && typeof input.consumedRevalidation.evaluatedAt === "string"
    ? input.consumedRevalidation.evaluatedAt
    : "2026-07-17T11:10:00.000Z";
  const reasons: FixedReadOnlyDirectSpawnBlockingReason[] = [];
  const consumed = input?.consumedRevalidation;
  const observation = input?.spawnObservation;
  if (!isRecord(input) || !hasSafeObjectShape(input)) reasons.push("input_shape_rejected");
  if (!isRecord(consumed) || !hasSafeObjectShape(consumed)) reasons.push("input_shape_rejected");
  else if (consumed.ok !== true) reasons.push(...mapUpstreamReasons(Array.isArray(consumed.blockingReasons) ? consumed.blockingReasons : ["revalidation_result_rejected"]));
  else reasons.push(...validateAcceptedRevalidation(consumed.revalidationResult, consumed.approvedExecutablePath));
  if (observation) reasons.push(...validateObservation(observation));
  return finalizeFixedDirectSpawnResult({
    consumedRevalidation: consumed,
    spawnObservation: observation,
    evaluatedAt,
    blockingReasons: reasons,
  });
}

function validateAcceptedRevalidation(input: unknown, approvedPath: unknown): readonly FixedReadOnlyDirectSpawnBlockingReason[] {
  const reasons: FixedReadOnlyDirectSpawnBlockingReason[] = [];
  if (!isRecord(input) || !hasSafeObjectShape(input) || !Object.isFrozen(input)) return ["revalidation_result_rejected"];
  if (input.resultKind !== "dormant_server_only_immediate_pre_spawn_revalidation_result" || input.resultVersion !== 1) reasons.push("revalidation_result_rejected");
  if (input.adapterId !== DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId) reasons.push("revalidation_result_boundary_mismatch");
  if (input.status !== "revalidated_non_authoritative_evidence") reasons.push("revalidation_result_not_ready");
  if (input.serverOnly !== true || input.dormant !== true) reasons.push("revalidation_result_boundary_mismatch");
  if (hasAuthorityClaim(input)) reasons.push("revalidation_result_authority_rejected");
  if (input.resultFingerprintAlgorithm !== "sha256" || typeof input.resultFingerprint !== "string") reasons.push("revalidation_result_mutated_or_cloned");
  const evidence = input.revalidationEvidence;
  if (!isRecord(evidence) || !Object.isFrozen(evidence)) return sorted([...reasons, "revalidation_result_rejected"]);
  if (evidence.status !== "revalidated_non_authoritative_evidence") reasons.push("revalidation_result_not_ready");
  if (evidence.productionLiveRevalidationProvenance !== "server_only_private_original_object") reasons.push("production_revalidation_provenance_missing");
  if (evidence.toolIdentity !== "git") reasons.push("unsupported_tool");
  if (evidence.platform !== "macos") reasons.push("unsupported_platform");
  if (evidence.purpose !== "first_live_read_only_staging_preflight") reasons.push("revalidation_result_purpose_mismatch");
  if (evidence.policyId !== DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyId || evidence.policyVersion !== 1) reasons.push("revalidation_result_policy_mismatch");
  if (evidence.expectedResolvedAbsolutePath !== "/usr/bin/git" || evidence.observedResolvedAbsolutePath !== "/usr/bin/git" || approvedPath !== "/usr/bin/git") reasons.push("revalidation_result_path_mismatch");
  if (evidence.exactMetadataMatched !== true || !isValidResolverMetadata(evidence.observedMetadata) || !isValidResolverMetadata(evidence.expectedMetadata)) reasons.push("revalidation_result_metadata_rejected");
  if (evidence.toctouEliminated !== false || evidence.pointInTimeOnly !== true) reasons.push("revalidation_result_toctou_claim_rejected");
  if (hasAuthorityClaim(evidence)) reasons.push("revalidation_result_authority_rejected");
  if (evidence.evidenceFingerprintAlgorithm !== "sha256" || typeof evidence.evidenceFingerprint !== "string") reasons.push("revalidation_result_mutated_or_cloned");
  if (input.resultFingerprintAlgorithm === "sha256" && typeof input.resultFingerprint === "string" && input.resultFingerprint !== revalidationResultFingerprint(input)) reasons.push("revalidation_result_mutated_or_cloned");
  if (evidence.evidenceFingerprintAlgorithm === "sha256" && typeof evidence.evidenceFingerprint === "string" && evidence.evidenceFingerprint !== revalidationEvidenceFingerprint(evidence)) reasons.push("revalidation_result_mutated_or_cloned");
  return sorted(reasons);
}

function validateObservation(input: FixedReadOnlyDirectSpawnObservation): readonly FixedReadOnlyDirectSpawnBlockingReason[] {
  const reasons: FixedReadOnlyDirectSpawnBlockingReason[] = [];
  if (input.observationKind !== "dormant_fixed_read_only_direct_spawn_observation" || input.observationVersion !== 1) reasons.push("spawn_error");
  if (input.processAttempted !== true) reasons.push("spawn_error");
  if (input.spawnError) reasons.push(input.terminalReason === "child_process_error" ? "child_process_error" : "spawn_error");
  if (input.processStarted !== true && !input.internalTerminalCondition) reasons.push("spawn_error");
  if (input.processExited !== true && !input.internalTerminalCondition) reasons.push("spawn_error");
  if (input.exitCode !== null && input.exitCode !== 0) reasons.push("process_exit_nonzero");
  if (input.signal !== null) reasons.push("process_signal_termination");
  if (input.stdoutOverflow) reasons.push("stdout_overflow", "stdout_output_limit_exceeded");
  if (input.stderrOverflow) reasons.push("stderr_overflow", "stderr_output_limit_exceeded");
  if (input.combinedOutputOverflow) reasons.push("combined_output_overflow", "combined_output_limit_exceeded");
  if (input.invalidStdoutEncoding) reasons.push("invalid_stdout_encoding", "invalid_output_encoding");
  if (input.invalidStderrEncoding) reasons.push("invalid_stderr_encoding", "invalid_output_encoding");
  if (input.binaryStdout) reasons.push("binary_stdout");
  if (input.binaryStderr) reasons.push("binary_stderr");
  if (input.unexpectedStreamChunk) reasons.push("unexpected_stream_chunk");
  if (input.terminalReason === "stdout_stream_error") reasons.push("stdout_stream_error");
  if (input.terminalReason === "stderr_stream_error") reasons.push("stderr_stream_error");
  if (input.childTerminationRequested) reasons.push("child_termination_requested");
  if (input.childTerminationRequestFailed) reasons.push("child_termination_request_failed");
  if (input.processClosedAfterInternalTerminalCondition) reasons.push("process_closed_after_internal_terminal_condition");
  if (input.observationFingerprintAlgorithm !== "sha256" || input.observationFingerprint !== observationFingerprint(input)) reasons.push("spawn_error");
  return sorted(reasons);
}

function finalizeFixedDirectSpawnResult(input: Readonly<{
  consumedRevalidation: unknown;
  spawnObservation: FixedReadOnlyDirectSpawnObservation | undefined;
  evaluatedAt: string;
  blockingReasons: readonly FixedReadOnlyDirectSpawnBlockingReason[];
}>): FixedReadOnlyDirectSpawnResult {
  const consumed = isRecord(input.consumedRevalidation) && input.consumedRevalidation.ok === true ? input.consumedRevalidation : null;
  const revalidation = isRecord(consumed?.revalidationResult) ? consumed.revalidationResult as ImmediatePreSpawnRevalidationResult : null;
  const revalidationEvidence = revalidation?.revalidationEvidence;
  const reasons = sorted(input.blockingReasons);
  const attempted = input.spawnObservation?.processAttempted === true;
  const started = input.spawnObservation?.processStarted === true;
  const exited = input.spawnObservation?.processExited === true;
  const lifecycleState: FixedReadOnlyDirectSpawnLifecycleState = reasons.length > 0
    ? attempted
      ? started
        ? exited
          ? "terminal_process_exited_no_cli_interpretation"
          : "terminal_process_started_no_result_yet"
        : "spawn_failed"
      : "spawn_eligibility_blocked"
    : "terminal_process_exited_no_cli_interpretation";
  const status: FixedReadOnlyDirectSpawnEvidence["status"] = reasons.length > 0
    ? attempted ? "spawn_failed_terminal" : "blocked_fail_closed"
    : "process_exited_non_authoritative_evidence";
  const evidenceCore = {
    evidenceKind: "dormant_fixed_read_only_direct_spawn_evidence",
    evidenceVersion: 1,
    adapterId: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY.adapterId,
    adapterIdentityFingerprint: fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.identity, DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY),
    policyId: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.policyId,
    policyVersion: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.policyVersion,
    policyFingerprint: fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.policy, DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY),
    purpose: "first_live_read_only_staging_preflight",
    platform: "macos",
    operation: "collect_git_version",
    toolIdentity: revalidationEvidence?.toolIdentity === "git" ? "git" : null,
    executablePath: typeof revalidationEvidence?.observedResolvedAbsolutePath === "string" ? revalidationEvidence.observedResolvedAbsolutePath : null,
    argv: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.exactArgv,
    fixedEnvironment: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.fixedEnv,
    shell: false,
    detached: false,
    stdin: "ignore",
    stdoutMaxBytes: 16384,
    stderrMaxBytes: 16384,
    combinedMaxBytes: 32768,
    acceptedRevalidationResultFingerprint: typeof revalidation?.resultFingerprint === "string" ? revalidation.resultFingerprint : null,
    acceptedRevalidationEvidenceFingerprint: typeof revalidationEvidence?.evidenceFingerprint === "string" ? revalidationEvidence.evidenceFingerprint : null,
    acceptedRevalidationObservationFingerprint: typeof revalidationEvidence?.observationFingerprint === "string" ? revalidationEvidence.observationFingerprint : null,
    acceptedRevalidationMetadata: revalidationEvidence?.observedMetadata ?? null,
    boundarySessionId: typeof revalidationEvidence?.boundarySessionId === "string" ? revalidationEvidence.boundarySessionId : null,
    productionRevalidationProvenance: revalidationEvidence?.productionLiveRevalidationProvenance === "server_only_private_original_object" ? "server_only_private_original_object" : "none",
    processAttempted: attempted,
    processStarted: started,
    processExited: exited,
    processSpawned: started,
    terminalReason: input.spawnObservation?.terminalReason ?? "none",
    internalTerminalCondition: input.spawnObservation?.internalTerminalCondition ?? false,
    childTerminationRequested: input.spawnObservation?.childTerminationRequested ?? false,
    childTerminationSignal: input.spawnObservation?.childTerminationSignal ?? null,
    childTerminationRequestFailed: input.spawnObservation?.childTerminationRequestFailed ?? false,
    processClosedAfterInternalTerminalCondition: input.spawnObservation?.processClosedAfterInternalTerminalCondition ?? false,
    shellUsed: false,
    cliVersionCollected: false,
    cliVersionInterpreted: false,
    observerInvoked: false,
    credentialAccessed: false,
    networkAccessed: false,
    authorizationConsumed: false,
    retryCount: 0,
    processAttemptCount: attempted ? 1 : 0,
    fallbackAttempted: false,
    alternateExecutableAttempted: false,
    toctouEliminated: false,
    exactRevalidatedInodeExecuted: false,
    authoritativeLive: false,
    spawnAuthority: attempted ? "single_consumed_attempt_only" : "none",
    observerAuthority: "none",
    credentialAuthority: "none",
    cliVersionAuthority: "none",
    runnerAuthority: "none",
    authorizationConsumptionAuthority: "none",
    networkAuthority: "none",
    apiAuthority: "none",
    uiAuthority: "none",
    tradingAuthority: "none",
    avanzaAuthority: "none",
    persistenceAuthority: "none",
    deploymentAuthority: "none",
    lifecycleState,
    status,
    blockingReasons: reasons,
    evaluatedAt: input.evaluatedAt,
  } satisfies Omit<FixedReadOnlyDirectSpawnEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  const evidence = deepFreeze({
    ...evidenceCore,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.evidence, evidenceCore),
  } satisfies FixedReadOnlyDirectSpawnEvidence);
  const resultCore = {
    resultKind: "dormant_server_only_fixed_read_only_direct_spawn_result",
    resultVersion: 1,
    adapterId: DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY.adapterId,
    status: evidence.status,
    serverOnly: true,
    dormant: true,
    authoritativeLive: false,
    processAttempted: evidence.processAttempted,
    processStarted: evidence.processStarted,
    processSpawned: evidence.processSpawned,
    shellUsed: false,
    credentialAccessed: false,
    networkAccessed: false,
    cliVersionCollected: false,
    cliVersionInterpreted: false,
    observerInvoked: false,
    authorizationConsumed: false,
    enablesObserverAuthority: false,
    enablesCredentialAccess: false,
    enablesCliVersionAuthority: false,
    enablesPreflightRunner: false,
    evidence,
  } satisfies Omit<FixedReadOnlyDirectSpawnResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.result, resultCore),
  } satisfies FixedReadOnlyDirectSpawnResult);
}

function mapUpstreamReasons(input: readonly string[]): FixedReadOnlyDirectSpawnBlockingReason[] {
  return input.map((reason) => {
    if (reason === "second_attempt_rejected") return "revalidation_result_consumed";
    if (reason.includes("provenance")) return "production_revalidation_provenance_missing";
    if (reason.includes("expired") || reason.includes("stale")) return "revalidation_result_stale_or_expired";
    if (reason.includes("session")) return "revalidation_result_session_mismatch";
    if (reason.includes("purpose")) return "revalidation_result_purpose_mismatch";
    if (reason.includes("tool")) return "revalidation_result_tool_mismatch";
    if (reason.includes("platform")) return "revalidation_result_platform_mismatch";
    if (reason.includes("boundary")) return "revalidation_result_boundary_mismatch";
    if (reason.includes("policy")) return "revalidation_result_policy_mismatch";
    if (reason.includes("path")) return "revalidation_result_path_mismatch";
    if (reason.includes("metadata")) return "revalidation_result_metadata_rejected";
    if (reason.includes("authority")) return "revalidation_result_authority_rejected";
    if (reason.includes("mutated") || reason.includes("cloned")) return "revalidation_result_mutated_or_cloned";
    return "revalidation_result_rejected";
  });
}

function hasAuthorityClaim(input: Record<string, unknown>): boolean {
  return [
    "authoritativeLive",
    "enablesFilesystemAuthority",
    "enablesProcessStart",
    "enablesObserverAuthority",
    "enablesCredentialAccess",
    "enablesNetworkAccess",
    "enablesPreflightRunner",
    "processSpawned",
    "shellUsed",
    "cliVersionCollected",
    "credentialAccessed",
    "networkAccessed",
    "observerInvoked",
    "authorizationConsumed",
  ].some((key) => {
    const value = input[key];
    return value === true || (typeof value === "string" && !["none", "server_only_private_original_object"].includes(value));
  });
}

function isValidResolverMetadata(input: unknown): input is FixedReadOnlyDirectSpawnEvidence["acceptedRevalidationMetadata"] {
  if (!isRecord(input) || !hasSafeObjectShape(input)) return false;
  const keys = Object.keys(input).sort();
  if (JSON.stringify(keys) !== JSON.stringify(["deviceId", "inode", "mode", "modifiedTimeMs", "sizeBytes"])) return false;
  return typeof input.deviceId === "string"
    && typeof input.inode === "string"
    && typeof input.sizeBytes === "number"
    && typeof input.mode === "number"
    && typeof input.modifiedTimeMs === "number";
}

function observationFingerprint(input: FixedReadOnlyDirectSpawnObservation): string {
  const core = { ...input } as Record<string, unknown>;
  delete core.observationFingerprintAlgorithm;
  delete core.observationFingerprint;
  return fingerprint(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS.spawnObservation, core);
}

function revalidationEvidenceFingerprint(input: Record<string, unknown>): string {
  const core = { ...input };
  delete core.evidenceFingerprintAlgorithm;
  delete core.evidenceFingerprint;
  return fingerprint("ture:dormant-server-only-immediate-pre-spawn-revalidation-adapter:evidence:v1", core);
}

function revalidationResultFingerprint(input: Record<string, unknown>): string {
  const core = { ...input };
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  return fingerprint("ture:dormant-server-only-immediate-pre-spawn-revalidation-adapter:result:v1", core);
}

function sorted<T extends string>(input: readonly T[]): readonly T[] {
  return [...new Set(input)].sort();
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function hasSafeObjectShape(input: Record<string, unknown>): boolean {
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(input).length > 0) return false;
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") return false;
    if (descriptor.get || descriptor.set || !descriptor.enumerable) return false;
  }
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

function deepFreeze<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreeze(value);
  }
  return input;
}
