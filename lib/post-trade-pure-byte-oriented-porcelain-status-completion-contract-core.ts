import { createHash } from "node:crypto";

export const PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_byte_oriented_porcelain_status_completion_contract",
  contractId: "ture.execution.pure-read-only-git-porcelain-status-completion-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.read-only-git-porcelain-status-completion.fixture-boundary.v1",
  byteRepresentationId: "ture.execution.byte-representation.lowercase-even-hex.v1",
  sourceSpawnContractId: "ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1",
  sourceSpawnContractVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  capabilityIdentity: "git_porcelain_status_v1",
  capabilityPurpose: "git_porcelain_status",
  platform: "macos",
  fixtureOnly: true,
  observedLiveProcess: false,
  authority: "none",
} as const);

export const PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY = deepFreeze({
  policyId: "pure_byte_oriented_porcelain_status_completion_policy_v1",
  policyVersion: 1,
  acceptedTool: "git",
  acceptedExecutable: "/usr/bin/git",
  capabilityIdentity: "git_porcelain_status_v1",
  capabilityPurpose: "git_porcelain_status",
  fixedArgvIdentity: "git_porcelain_status_argv_v1",
  argv: [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
    "--no-renames",
    "--ignore-submodules=none",
  ] as const,
  stdoutLimitBytes: 65536,
  stderrLimitBytes: 0,
  combinedLimitBytes: 65536,
  byteRepresentationId: "ture.execution.byte-representation.lowercase-even-hex.v1",
  fixtureOnly: true,
  runtimeActivationAllowed: false,
  repositoryReadAuthorityAllowed: false,
  compatibilityAuthorityAllowed: false,
  credentialUseAllowed: false,
  networkUseAllowed: false,
  retryAllowed: false,
  fallbackAllowed: false,
  parserAllowed: false,
  statusInterpretationAllowed: false,
  toctouEliminationClaimAllowed: false,
} as const);

export const PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-byte-oriented-porcelain-status-completion:identity:v1",
  policy: "ture:pure-byte-oriented-porcelain-status-completion:policy:v1",
  stdoutBytes: "ture:pure-byte-oriented-porcelain-status-completion:stdout-bytes:v1",
  stderrBytes: "ture:pure-byte-oriented-porcelain-status-completion:stderr-bytes:v1",
  rawOutput: "ture:pure-byte-oriented-porcelain-status-completion:raw-output:v1",
  evidence: "ture:pure-byte-oriented-porcelain-status-completion:evidence:v1",
  rejectedInput: "ture:pure-byte-oriented-porcelain-status-completion:rejected-input:v1",
  result: "ture:pure-byte-oriented-porcelain-status-completion:result:v1",
} as const);

export type PorcelainStatusCompletionStatus =
  | "accepted_fixture_byte_oriented_porcelain_status_completion"
  | "blocked_fail_closed";

export type PorcelainStatusCompletionReason =
  | "accepted"
  | "input_contract_rejected"
  | "input_identity_rejected"
  | "input_fingerprint_rejected"
  | "source_spawn_identity_rejected"
  | "source_linkage_rejected"
  | "capability_rejected"
  | "platform_rejected"
  | "tool_rejected"
  | "executable_rejected"
  | "argv_rejected"
  | "completion_state_rejected"
  | "exit_state_rejected"
  | "signal_rejected"
  | "stderr_not_empty"
  | "stdout_overflow_rejected"
  | "stderr_overflow_rejected"
  | "combined_overflow_rejected"
  | "truncated_output_rejected"
  | "stream_error_rejected"
  | "termination_state_rejected"
  | "retry_or_fallback_rejected"
  | "authority_rejected"
  | "runtime_claim_rejected"
  | "live_claim_rejected"
  | "toctou_claim_rejected"
  | "stdout_hex_grammar_rejected"
  | "stdout_hex_odd_length_rejected"
  | "stdout_byte_count_rejected"
  | "stderr_hex_grammar_rejected"
  | "stderr_hex_odd_length_rejected"
  | "stderr_byte_count_rejected"
  | "combined_byte_count_rejected";

export type PorcelainStatusCompletionInput = Readonly<{
  contractKind: "pure_byte_oriented_porcelain_status_completion_contract";
  contractVersion: 1;
  boundaryId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId;
  byteRepresentationId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.byteRepresentationId;
  sourceSpawnContractId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.sourceSpawnContractId;
  sourceSpawnContractVersion: 1;
  sourceSpawnFingerprint: string;
  sourceSpawnEvidenceFingerprint: string;
  sourceSpawnObservationFingerprint: string;
  boundarySessionId: string;
  purpose: "first_live_read_only_staging_preflight";
  capabilityPurpose: "git_porcelain_status";
  capabilityIdentity: "git_porcelain_status_v1";
  toolIdentity: "git";
  platform: "macos";
  policyId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.policyId;
  policyVersion: 1;
  canonicalExecutablePath: "/usr/bin/git";
  fixedArgvIdentity: "git_porcelain_status_argv_v1";
  argv: readonly string[];
  workingDirectoryFingerprint: string;
  observationSequenceIdentity: string;
  spawnAttemptId: string;
  evidenceTimestamp: string;
  provenanceClassification: "fixture_synthetic";
  fixtureLiveClassification: "fixture_only_not_live_observation";
  spawnAttempted: true;
  processCreated: true;
  processStartedObserved: true;
  spawnErrorObserved: false;
  exitObserved: true;
  exitCode: 0;
  signalObserved: false;
  signal: null;
  closeObserved: true;
  closeCode: 0;
  closeSignal: null;
  completionTerminal: true;
  completionCategory: "normal_zero_exit";
  completionReason: "exit_zero_close_zero";
  childProcessErrorObserved: false;
  processDeathConfirmed: true;
  stdoutBytesHex: string;
  stdoutByteCount: number;
  stderrBytesHex: string;
  stderrByteCount: number;
  combinedByteCount: number;
  stdoutTruncated: false;
  stderrTruncated: false;
  combinedTruncated: false;
  stdoutOverflow: false;
  stderrOverflow: false;
  combinedOverflow: false;
  stdoutStreamError: false;
  stderrStreamError: false;
  unexpectedStreamChunk: false;
  decodedStdoutTextPresent: false;
  decodedStderrTextPresent: false;
  replacementDecodingUsed: false;
  terminationRequested: false;
  terminationAttempted: false;
  settledExactlyOnce: true;
  retryCount: 0;
  fallbackAttempted: false;
  shellUsed: false;
  pathLookupUsed: false;
  inheritedEnvironmentUsed: false;
  credentialsUsed: false;
  networkUsed: false;
  authorizationConsumed: false;
  runtimeActivated: false;
  toctouEliminated: false;
  observedLiveProcess: false;
  repositoryReadAuthorityGranted: false;
  processAuthorityGranted: false;
  observerAuthorityGranted: false;
  cliExecutionAuthorityGranted: false;
  compatibilityAuthorityGranted: false;
  runtimeAuthorityGranted: false;
  stagingAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  credentialAuthorityGranted: false;
  networkAuthorityGranted: false;
  mutationAuthorityGranted: false;
  authority: "none";
}>;

export type PorcelainStatusCompletionEvidence = PorcelainStatusCompletionInput & Readonly<{
  evidenceKind: "pure_byte_oriented_porcelain_status_completion_evidence";
  evidenceVersion: 1;
  contractId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId;
  contractIdentityFingerprint: string;
  policyFingerprint: string;
  status: "accepted";
  reason: "accepted";
  eligibleCompletion: true;
  stderrEmpty: true;
  truncated: false;
  stdoutLimitBytes: 65536;
  stderrLimitBytes: 0;
  combinedLimitBytes: 65536;
  stdoutBytesFingerprint: string;
  stderrBytesFingerprint: string;
  rawOutputFingerprint: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type PorcelainStatusRejectedInputEvidence = Readonly<{
  evidenceKind: "pure_byte_oriented_porcelain_status_rejected_input_evidence";
  evidenceVersion: 1;
  validationStage: "safe_output_retention_state";
  selectedReason: Exclude<PorcelainStatusCompletionReason, "accepted">;
  eligibleCompletion: false;
  stdoutOverflow: boolean;
  stderrOverflow: boolean;
  combinedOverflow: boolean;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  combinedTruncated: boolean;
  truncated: boolean;
  stdoutByteCount: number;
  stderrByteCount: number;
  combinedByteCount: number;
  stdoutBytesFingerprint: string | null;
  stderrBytesFingerprint: string | null;
  rawOutputFingerprint: string | null;
  lifecycleCategory: "normal_zero_exit";
  completionReason: "exit_zero_close_zero";
  sourceSpawnFingerprint: string;
  sourceSpawnEvidenceFingerprint: string;
  sourceSpawnObservationFingerprint: string;
  boundarySessionId: string;
  purpose: "first_live_read_only_staging_preflight";
  capabilityPurpose: "git_porcelain_status";
  capabilityIdentity: "git_porcelain_status_v1";
  toolIdentity: "git";
  platform: "macos";
  policyId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.policyId;
  policyVersion: 1;
  canonicalExecutablePath: "/usr/bin/git";
  fixedArgvIdentity: "git_porcelain_status_argv_v1";
  workingDirectoryFingerprint: string;
  observationSequenceIdentity: string;
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  runtimeActivated: false;
  compatibilityAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  repositoryReadAuthorityGranted: false;
  toctouEliminated: false;
  rejectedInputFingerprintAlgorithm: "sha256";
  rejectedInputFingerprint: string;
}>;

export type PorcelainStatusCompletionResult = Readonly<{
  resultKind: "pure_byte_oriented_porcelain_status_completion_result";
  resultVersion: 1;
  contractId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId;
  status: PorcelainStatusCompletionStatus;
  reason: PorcelainStatusCompletionReason;
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  runtimeActivated: false;
  compatibilityAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  blockingReasons: readonly PorcelainStatusCompletionReason[];
  evidence: PorcelainStatusCompletionEvidence | null;
  rejectedInputEvidence: PorcelainStatusRejectedInputEvidence | null;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

const INPUT_KEYS = [
  "contractKind",
  "contractVersion",
  "boundaryId",
  "byteRepresentationId",
  "sourceSpawnContractId",
  "sourceSpawnContractVersion",
  "sourceSpawnFingerprint",
  "sourceSpawnEvidenceFingerprint",
  "sourceSpawnObservationFingerprint",
  "boundarySessionId",
  "purpose",
  "capabilityPurpose",
  "capabilityIdentity",
  "toolIdentity",
  "platform",
  "policyId",
  "policyVersion",
  "canonicalExecutablePath",
  "fixedArgvIdentity",
  "argv",
  "workingDirectoryFingerprint",
  "observationSequenceIdentity",
  "spawnAttemptId",
  "evidenceTimestamp",
  "provenanceClassification",
  "fixtureLiveClassification",
  "spawnAttempted",
  "processCreated",
  "processStartedObserved",
  "spawnErrorObserved",
  "exitObserved",
  "exitCode",
  "signalObserved",
  "signal",
  "closeObserved",
  "closeCode",
  "closeSignal",
  "completionTerminal",
  "completionCategory",
  "completionReason",
  "childProcessErrorObserved",
  "processDeathConfirmed",
  "stdoutBytesHex",
  "stdoutByteCount",
  "stderrBytesHex",
  "stderrByteCount",
  "combinedByteCount",
  "stdoutTruncated",
  "stderrTruncated",
  "combinedTruncated",
  "stdoutOverflow",
  "stderrOverflow",
  "combinedOverflow",
  "stdoutStreamError",
  "stderrStreamError",
  "unexpectedStreamChunk",
  "decodedStdoutTextPresent",
  "decodedStderrTextPresent",
  "replacementDecodingUsed",
  "terminationRequested",
  "terminationAttempted",
  "settledExactlyOnce",
  "retryCount",
  "fallbackAttempted",
  "shellUsed",
  "pathLookupUsed",
  "inheritedEnvironmentUsed",
  "credentialsUsed",
  "networkUsed",
  "authorizationConsumed",
  "runtimeActivated",
  "toctouEliminated",
  "observedLiveProcess",
  "repositoryReadAuthorityGranted",
  "processAuthorityGranted",
  "observerAuthorityGranted",
  "cliExecutionAuthorityGranted",
  "compatibilityAuthorityGranted",
  "runtimeAuthorityGranted",
  "stagingAuthorityGranted",
  "deploymentAuthorityGranted",
  "credentialAuthorityGranted",
  "networkAuthorityGranted",
  "mutationAuthorityGranted",
  "authority",
] as const;

const EVIDENCE_KEYS = [
  ...INPUT_KEYS,
  "evidenceKind",
  "evidenceVersion",
  "contractId",
  "contractIdentityFingerprint",
  "policyFingerprint",
  "status",
  "reason",
  "eligibleCompletion",
  "stderrEmpty",
  "truncated",
  "stdoutLimitBytes",
  "stderrLimitBytes",
  "combinedLimitBytes",
  "stdoutBytesFingerprint",
  "stderrBytesFingerprint",
  "rawOutputFingerprint",
  "evidenceFingerprintAlgorithm",
  "evidenceFingerprint",
] as const;

const RESULT_KEYS = [
  "resultKind",
  "resultVersion",
  "contractId",
  "boundaryId",
  "status",
  "reason",
  "fixtureOnly",
  "observedLiveProcess",
  "authoritativeLive",
  "authority",
  "runtimeActivated",
  "compatibilityAuthorityGranted",
  "deploymentAuthorityGranted",
  "blockingReasons",
  "evidence",
  "rejectedInputEvidence",
  "resultFingerprintAlgorithm",
  "resultFingerprint",
] as const;

const REASON_ORDER: readonly PorcelainStatusCompletionReason[] = [
  "input_contract_rejected",
  "input_identity_rejected",
  "input_fingerprint_rejected",
  "capability_rejected",
  "platform_rejected",
  "tool_rejected",
  "executable_rejected",
  "argv_rejected",
  "source_spawn_identity_rejected",
  "source_linkage_rejected",
  "completion_state_rejected",
  "exit_state_rejected",
  "signal_rejected",
  "termination_state_rejected",
  "retry_or_fallback_rejected",
  "authority_rejected",
  "runtime_claim_rejected",
  "live_claim_rejected",
  "toctou_claim_rejected",
  "stream_error_rejected",
  "stdout_overflow_rejected",
  "stderr_overflow_rejected",
  "combined_overflow_rejected",
  "truncated_output_rejected",
  "stderr_not_empty",
  "stdout_hex_grammar_rejected",
  "stdout_hex_odd_length_rejected",
  "stderr_hex_grammar_rejected",
  "stderr_hex_odd_length_rejected",
  "stdout_byte_count_rejected",
  "stderr_byte_count_rejected",
  "combined_byte_count_rejected",
  "accepted",
];

export function buildPureByteOrientedPorcelainStatusCompletion(input: unknown): PorcelainStatusCompletionResult {
  const reasons = validateInput(input);
  if (reasons.length > 0) return buildCompletionResult(null, reasons, buildRejectedInputEvidence(input, reasons));
  const evidenceInput = input as PorcelainStatusCompletionInput;
  const stdoutBytesFingerprint = sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.stdoutBytes, {
    byteRepresentationId: evidenceInput.byteRepresentationId,
    stdoutBytesHex: evidenceInput.stdoutBytesHex,
    stdoutByteCount: evidenceInput.stdoutByteCount,
  });
  const stderrBytesFingerprint = sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.stderrBytes, {
    byteRepresentationId: evidenceInput.byteRepresentationId,
    stderrBytesHex: evidenceInput.stderrBytesHex,
    stderrByteCount: evidenceInput.stderrByteCount,
  });
  const rawOutputFingerprint = sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.rawOutput, {
    byteRepresentationId: evidenceInput.byteRepresentationId,
    stdoutBytesHex: evidenceInput.stdoutBytesHex,
    stdoutByteCount: evidenceInput.stdoutByteCount,
    stderrBytesHex: evidenceInput.stderrBytesHex,
    stderrByteCount: evidenceInput.stderrByteCount,
    combinedByteCount: evidenceInput.combinedByteCount,
    stdoutBytesFingerprint,
    stderrBytesFingerprint,
  });
  const evidenceBase = deepFreeze({
    ...evidenceInput,
    evidenceKind: "pure_byte_oriented_porcelain_status_completion_evidence" as const,
    evidenceVersion: 1 as const,
    contractId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId,
    contractIdentityFingerprint: identityFingerprint(),
    policyFingerprint: policyFingerprint(),
    status: "accepted" as const,
    reason: "accepted" as const,
    eligibleCompletion: true as const,
    stderrEmpty: true as const,
    truncated: false as const,
    stdoutLimitBytes: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stdoutLimitBytes,
    stderrLimitBytes: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stderrLimitBytes,
    combinedLimitBytes: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.combinedLimitBytes,
    stdoutBytesFingerprint,
    stderrBytesFingerprint,
    rawOutputFingerprint,
    evidenceFingerprintAlgorithm: "sha256" as const,
  });
  const evidence = deepFreeze({
    ...evidenceBase,
    evidenceFingerprint: sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.evidence, canonicalize(evidenceBase)),
  });
  return buildCompletionResult(evidence, ["accepted"], null);
}

export function validatePureByteOrientedPorcelainStatusCompletionResult(input: unknown): { valid: true; result: PorcelainStatusCompletionResult; evidence: PorcelainStatusCompletionEvidence } | { valid: false; reasons: readonly PorcelainStatusCompletionReason[] } {
  if (!isPlainRecord(input) || !hasExactKeys(input, RESULT_KEYS)) return { valid: false, reasons: ["input_contract_rejected"] };
  const result = input as PorcelainStatusCompletionResult;
  if (result.resultKind !== "pure_byte_oriented_porcelain_status_completion_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId
    || result.boundaryId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId
    || result.fixtureOnly !== true
    || result.observedLiveProcess !== false
    || result.authoritativeLive !== false
    || result.authority !== "none"
    || result.runtimeActivated !== false
    || result.compatibilityAuthorityGranted !== false
    || result.deploymentAuthorityGranted !== false
    || result.resultFingerprintAlgorithm !== "sha256"
    || !Array.isArray(result.blockingReasons)
  ) return { valid: false, reasons: ["input_identity_rejected"] };
  if (result.rejectedInputEvidence !== null) return { valid: false, reasons: ["input_contract_rejected"] };
  if (result.status !== "accepted_fixture_byte_oriented_porcelain_status_completion" || result.evidence === null || result.reason !== "accepted") return { valid: false, reasons: ["input_contract_rejected"] };
  if (!isPlainRecord(result.evidence) || !hasExactKeys(result.evidence, EVIDENCE_KEYS)) return { valid: false, reasons: ["input_contract_rejected"] };
  const evidenceReasons = validateAcceptedEvidence(result.evidence);
  if (evidenceReasons.length > 0) return { valid: false, reasons: evidenceReasons };
  if (result.blockingReasons.length !== 1 || result.blockingReasons[0] !== "accepted") return { valid: false, reasons: ["input_contract_rejected"] };
  if (!validateEvidenceFingerprint(result.evidence)) return { valid: false, reasons: ["input_fingerprint_rejected"] };
  const expectedResultFingerprint = buildResultFingerprint({ ...result, resultFingerprint: "" });
  if (result.resultFingerprint !== expectedResultFingerprint) return { valid: false, reasons: ["input_fingerprint_rejected"] };
  return { valid: true, result, evidence: result.evidence };
}

export function buildCanonicalPorcelainStatusCompletionInput(stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}): PorcelainStatusCompletionInput {
  const stderrBytesHex = patch.stderrBytesHex ?? "";
  const stdoutByteCount = patch.stdoutByteCount ?? byteCountFromHex(stdoutBytesHex);
  const stderrByteCount = patch.stderrByteCount ?? byteCountFromHex(stderrBytesHex);
  return deepFreeze({
    contractKind: "pure_byte_oriented_porcelain_status_completion_contract",
    contractVersion: 1,
    boundaryId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId,
    byteRepresentationId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.byteRepresentationId,
    sourceSpawnContractId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.sourceSpawnContractId,
    sourceSpawnContractVersion: 1,
    sourceSpawnFingerprint: "a".repeat(64),
    sourceSpawnEvidenceFingerprint: "b".repeat(64),
    sourceSpawnObservationFingerprint: "c".repeat(64),
    boundarySessionId: "git-porcelain-status-session-001",
    purpose: "first_live_read_only_staging_preflight",
    capabilityPurpose: "git_porcelain_status",
    capabilityIdentity: "git_porcelain_status_v1",
    toolIdentity: "git",
    platform: "macos",
    policyId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.policyId,
    policyVersion: 1,
    canonicalExecutablePath: "/usr/bin/git",
    fixedArgvIdentity: "git_porcelain_status_argv_v1",
    argv: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.argv,
    workingDirectoryFingerprint: "d".repeat(64),
    observationSequenceIdentity: "git-porcelain-status-sequence-001",
    spawnAttemptId: "git-porcelain-status-spawn-attempt-001",
    evidenceTimestamp: "2026-07-19T12:00:00.000Z",
    provenanceClassification: "fixture_synthetic",
    fixtureLiveClassification: "fixture_only_not_live_observation",
    spawnAttempted: true,
    processCreated: true,
    processStartedObserved: true,
    spawnErrorObserved: false,
    exitObserved: true,
    exitCode: 0,
    signalObserved: false,
    signal: null,
    closeObserved: true,
    closeCode: 0,
    closeSignal: null,
    completionTerminal: true,
    completionCategory: "normal_zero_exit",
    completionReason: "exit_zero_close_zero",
    childProcessErrorObserved: false,
    processDeathConfirmed: true,
    stdoutBytesHex,
    stdoutByteCount,
    stderrBytesHex,
    stderrByteCount,
    combinedByteCount: stdoutByteCount + stderrByteCount,
    stdoutTruncated: false,
    stderrTruncated: false,
    combinedTruncated: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    decodedStdoutTextPresent: false,
    decodedStderrTextPresent: false,
    replacementDecodingUsed: false,
    terminationRequested: false,
    terminationAttempted: false,
    settledExactlyOnce: true,
    retryCount: 0,
    fallbackAttempted: false,
    shellUsed: false,
    pathLookupUsed: false,
    inheritedEnvironmentUsed: false,
    credentialsUsed: false,
    networkUsed: false,
    authorizationConsumed: false,
    runtimeActivated: false,
    toctouEliminated: false,
    observedLiveProcess: false,
    repositoryReadAuthorityGranted: false,
    processAuthorityGranted: false,
    observerAuthorityGranted: false,
    cliExecutionAuthorityGranted: false,
    compatibilityAuthorityGranted: false,
    runtimeAuthorityGranted: false,
    stagingAuthorityGranted: false,
    deploymentAuthorityGranted: false,
    credentialAuthorityGranted: false,
    networkAuthorityGranted: false,
    mutationAuthorityGranted: false,
    authority: "none",
    ...patch,
  });
}

function validateInput(input: unknown): readonly PorcelainStatusCompletionReason[] {
  const reasons: PorcelainStatusCompletionReason[] = [];
  if (!isPlainRecord(input)) return ["input_contract_rejected"];
  if (!hasExactKeys(input, INPUT_KEYS)) reasons.push("input_contract_rejected");
  const item = input as Partial<PorcelainStatusCompletionInput>;
  if (item.contractKind !== "pure_byte_oriented_porcelain_status_completion_contract"
    || item.contractVersion !== 1
    || item.boundaryId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId
    || item.byteRepresentationId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.byteRepresentationId
    || item.policyId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.policyId
    || item.policyVersion !== 1
  ) reasons.push("input_identity_rejected");
  if (item.sourceSpawnContractId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.sourceSpawnContractId
    || item.sourceSpawnContractVersion !== 1
    || !isSha256(item.sourceSpawnFingerprint)
    || !isSha256(item.sourceSpawnEvidenceFingerprint)
    || !isSha256(item.sourceSpawnObservationFingerprint)
  ) reasons.push("source_spawn_identity_rejected");
  if (!isNonEmptyString(item.boundarySessionId)
    || item.purpose !== "first_live_read_only_staging_preflight"
    || !isSha256(item.workingDirectoryFingerprint)
    || !isNonEmptyString(item.observationSequenceIdentity)
    || !isNonEmptyString(item.spawnAttemptId)
    || typeof item.evidenceTimestamp !== "string"
    || Number.isNaN(Date.parse(item.evidenceTimestamp))
    || item.provenanceClassification !== "fixture_synthetic"
    || item.fixtureLiveClassification !== "fixture_only_not_live_observation"
  ) reasons.push("source_linkage_rejected");
  if (item.capabilityIdentity !== "git_porcelain_status_v1" || item.capabilityPurpose !== "git_porcelain_status") reasons.push("capability_rejected");
  if (item.platform !== "macos") reasons.push("platform_rejected");
  if (item.toolIdentity !== "git") reasons.push("tool_rejected");
  if (item.canonicalExecutablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (item.fixedArgvIdentity !== "git_porcelain_status_argv_v1" || !sameArray(item.argv, PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.argv)) reasons.push("argv_rejected");
  if (item.spawnAttempted !== true
    || item.processCreated !== true
    || item.processStartedObserved !== true
    || item.spawnErrorObserved !== false
    || item.exitObserved !== true
    || item.closeObserved !== true
    || item.completionTerminal !== true
    || item.completionCategory !== "normal_zero_exit"
    || item.completionReason !== "exit_zero_close_zero"
    || item.childProcessErrorObserved !== false
    || item.processDeathConfirmed !== true
    || item.settledExactlyOnce !== true
  ) reasons.push("completion_state_rejected");
  if (item.exitCode !== 0 || item.closeCode !== 0) reasons.push("exit_state_rejected");
  if (item.signalObserved !== false || item.signal !== null || item.closeSignal !== null) reasons.push("signal_rejected");
  const stdoutHexReasons = validateHex("stdout", item.stdoutBytesHex);
  const stderrHexReasons = validateHex("stderr", item.stderrBytesHex);
  reasons.push(...stdoutHexReasons, ...stderrHexReasons);
  const stdoutByteCount = byteCountFromHexIfValid(item.stdoutBytesHex);
  const stderrByteCount = byteCountFromHexIfValid(item.stderrBytesHex);
  if (!isNonNegativeInteger(item.stdoutByteCount) || stdoutByteCount === null || item.stdoutByteCount !== stdoutByteCount) reasons.push("stdout_byte_count_rejected");
  if (!isNonNegativeInteger(item.stderrByteCount) || stderrByteCount === null || item.stderrByteCount !== stderrByteCount) reasons.push("stderr_byte_count_rejected");
  if (item.stderrBytesHex !== "" || item.stderrByteCount !== 0) reasons.push("stderr_not_empty");
  const expectedCombined = typeof item.stdoutByteCount === "number" && typeof item.stderrByteCount === "number"
    ? item.stdoutByteCount + item.stderrByteCount
    : null;
  if (!isNonNegativeInteger(item.combinedByteCount) || expectedCombined === null || item.combinedByteCount !== expectedCombined) reasons.push("combined_byte_count_rejected");
  if (isNonNegativeInteger(item.stdoutByteCount) && item.stdoutByteCount > PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stdoutLimitBytes) reasons.push("stdout_overflow_rejected");
  if (isNonNegativeInteger(item.stderrByteCount) && item.stderrByteCount > PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stderrLimitBytes) reasons.push("stderr_overflow_rejected");
  if (isNonNegativeInteger(item.combinedByteCount) && item.combinedByteCount > PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.combinedLimitBytes) reasons.push("combined_overflow_rejected");
  if (item.stdoutOverflow !== false) reasons.push("stdout_overflow_rejected");
  if (item.stderrOverflow !== false) reasons.push("stderr_overflow_rejected");
  if (item.combinedOverflow !== false) reasons.push("combined_overflow_rejected");
  if (item.stdoutTruncated !== false || item.stderrTruncated !== false || item.combinedTruncated !== false) reasons.push("truncated_output_rejected");
  if (item.stdoutStreamError !== false
    || item.stderrStreamError !== false
    || item.unexpectedStreamChunk !== false
    || item.decodedStdoutTextPresent !== false
    || item.decodedStderrTextPresent !== false
    || item.replacementDecodingUsed !== false
  ) reasons.push("stream_error_rejected");
  if (item.terminationRequested !== false || item.terminationAttempted !== false) reasons.push("termination_state_rejected");
  if (item.retryCount !== 0 || item.fallbackAttempted !== false) reasons.push("retry_or_fallback_rejected");
  if (item.authority !== "none"
    || item.repositoryReadAuthorityGranted !== false
    || item.processAuthorityGranted !== false
    || item.observerAuthorityGranted !== false
    || item.cliExecutionAuthorityGranted !== false
    || item.compatibilityAuthorityGranted !== false
    || item.runtimeAuthorityGranted !== false
    || item.stagingAuthorityGranted !== false
    || item.deploymentAuthorityGranted !== false
    || item.credentialAuthorityGranted !== false
    || item.networkAuthorityGranted !== false
    || item.mutationAuthorityGranted !== false
  ) reasons.push("authority_rejected");
  if (item.runtimeActivated !== false) reasons.push("runtime_claim_rejected");
  if (item.observedLiveProcess !== false) reasons.push("live_claim_rejected");
  if (item.toctouEliminated !== false) reasons.push("toctou_claim_rejected");
  if (item.shellUsed !== false
    || item.pathLookupUsed !== false
    || item.inheritedEnvironmentUsed !== false
    || item.credentialsUsed !== false
    || item.networkUsed !== false
    || item.authorizationConsumed !== false
  ) reasons.push("runtime_claim_rejected");
  return reasons.length === 0 ? [] : sortReasons(reasons);
}

function validateAcceptedEvidence(evidence: PorcelainStatusCompletionEvidence): readonly PorcelainStatusCompletionReason[] {
  const reasons: PorcelainStatusCompletionReason[] = [];
  const inputProjection = Object.fromEntries(INPUT_KEYS.map((key) => [key, evidence[key]]));
  reasons.push(...validateInput(inputProjection));
  if (evidence.evidenceKind !== "pure_byte_oriented_porcelain_status_completion_evidence"
    || evidence.evidenceVersion !== 1
    || evidence.contractId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId
    || evidence.contractIdentityFingerprint !== identityFingerprint()
    || evidence.policyFingerprint !== policyFingerprint()
    || evidence.status !== "accepted"
    || evidence.reason !== "accepted"
    || evidence.eligibleCompletion !== true
    || evidence.stderrEmpty !== true
    || evidence.truncated !== false
    || evidence.stdoutLimitBytes !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stdoutLimitBytes
    || evidence.stderrLimitBytes !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stderrLimitBytes
    || evidence.combinedLimitBytes !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.combinedLimitBytes
    || evidence.evidenceFingerprintAlgorithm !== "sha256"
  ) reasons.push("input_identity_rejected");
  if (evidence.stdoutBytesFingerprint !== sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.stdoutBytes, {
    byteRepresentationId: evidence.byteRepresentationId,
    stdoutBytesHex: evidence.stdoutBytesHex,
    stdoutByteCount: evidence.stdoutByteCount,
  })) reasons.push("input_fingerprint_rejected");
  if (evidence.stderrBytesFingerprint !== sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.stderrBytes, {
    byteRepresentationId: evidence.byteRepresentationId,
    stderrBytesHex: evidence.stderrBytesHex,
    stderrByteCount: evidence.stderrByteCount,
  })) reasons.push("input_fingerprint_rejected");
  if (evidence.rawOutputFingerprint !== sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.rawOutput, {
    byteRepresentationId: evidence.byteRepresentationId,
    stdoutBytesHex: evidence.stdoutBytesHex,
    stdoutByteCount: evidence.stdoutByteCount,
    stderrBytesHex: evidence.stderrBytesHex,
    stderrByteCount: evidence.stderrByteCount,
    combinedByteCount: evidence.combinedByteCount,
    stdoutBytesFingerprint: evidence.stdoutBytesFingerprint,
    stderrBytesFingerprint: evidence.stderrBytesFingerprint,
  })) reasons.push("input_fingerprint_rejected");
  return reasons.length === 0 ? [] : sortReasons(reasons);
}

function buildRejectedInputEvidence(input: unknown, reasons: readonly PorcelainStatusCompletionReason[]): PorcelainStatusRejectedInputEvidence | null {
  const blockingReasons = sortReasons(reasons);
  const selectedReason = blockingReasons[0];
  if (!selectedReason || selectedReason === "accepted" || !hasOutputRetentionReason(blockingReasons)) return null;
  if (!isPlainRecord(input) || !hasExactKeys(input, INPUT_KEYS)) return null;
  const item = input as Partial<PorcelainStatusCompletionInput>;
  if (!hasSafeRejectedSummaryIdentity(item)) return null;
  if (!hasSafeRejectedSummarySourceLinkage(item)) return null;
  if (!hasSafeRejectedSummaryLifecycle(item)) return null;
  if (!hasSafeRejectedSummaryAuthority(item)) return null;
  if (!hasSafeRejectedSummaryCountsAndFlags(item)) return null;

  const stdoutBytesFingerprint = safeByteFingerprint("stdout", item);
  const stderrBytesFingerprint = safeByteFingerprint("stderr", item);
  const rawOutputFingerprint = stdoutBytesFingerprint && stderrBytesFingerprint
    ? sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.rawOutput, {
      byteRepresentationId: item.byteRepresentationId,
      stdoutByteCount: item.stdoutByteCount,
      stderrByteCount: item.stderrByteCount,
      combinedByteCount: item.combinedByteCount,
      stdoutBytesFingerprint,
      stderrBytesFingerprint,
    })
    : null;

  const base = deepFreeze({
    evidenceKind: "pure_byte_oriented_porcelain_status_rejected_input_evidence" as const,
    evidenceVersion: 1 as const,
    validationStage: "safe_output_retention_state" as const,
    selectedReason: selectedReason as Exclude<PorcelainStatusCompletionReason, "accepted">,
    eligibleCompletion: false as const,
    stdoutOverflow: item.stdoutOverflow,
    stderrOverflow: item.stderrOverflow,
    combinedOverflow: item.combinedOverflow,
    stdoutTruncated: item.stdoutTruncated,
    stderrTruncated: item.stderrTruncated,
    combinedTruncated: item.combinedTruncated,
    truncated: item.stdoutTruncated || item.stderrTruncated || item.combinedTruncated,
    stdoutByteCount: item.stdoutByteCount,
    stderrByteCount: item.stderrByteCount,
    combinedByteCount: item.combinedByteCount,
    stdoutBytesFingerprint,
    stderrBytesFingerprint,
    rawOutputFingerprint,
    lifecycleCategory: item.completionCategory,
    completionReason: item.completionReason,
    sourceSpawnFingerprint: item.sourceSpawnFingerprint,
    sourceSpawnEvidenceFingerprint: item.sourceSpawnEvidenceFingerprint,
    sourceSpawnObservationFingerprint: item.sourceSpawnObservationFingerprint,
    boundarySessionId: item.boundarySessionId,
    purpose: item.purpose,
    capabilityPurpose: item.capabilityPurpose,
    capabilityIdentity: item.capabilityIdentity,
    toolIdentity: item.toolIdentity,
    platform: item.platform,
    policyId: item.policyId,
    policyVersion: item.policyVersion,
    canonicalExecutablePath: item.canonicalExecutablePath,
    fixedArgvIdentity: item.fixedArgvIdentity,
    workingDirectoryFingerprint: item.workingDirectoryFingerprint,
    observationSequenceIdentity: item.observationSequenceIdentity,
    fixtureOnly: true as const,
    observedLiveProcess: false as const,
    authoritativeLive: false as const,
    authority: "none" as const,
    runtimeActivated: false as const,
    compatibilityAuthorityGranted: false as const,
    deploymentAuthorityGranted: false as const,
    repositoryReadAuthorityGranted: false as const,
    toctouEliminated: false as const,
    rejectedInputFingerprintAlgorithm: "sha256" as const,
  } satisfies Omit<PorcelainStatusRejectedInputEvidence, "rejectedInputFingerprint">);
  return deepFreeze({
    ...base,
    rejectedInputFingerprint: sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.rejectedInput, canonicalize(base)),
  });
}

function buildCompletionResult(evidence: PorcelainStatusCompletionEvidence | null, reasons: readonly PorcelainStatusCompletionReason[], rejectedInputEvidence: PorcelainStatusRejectedInputEvidence | null): PorcelainStatusCompletionResult {
  const blockingReasons = sortReasons(reasons);
  const accepted = evidence && blockingReasons.length === 1 && blockingReasons[0] === "accepted";
  const base = deepFreeze({
    resultKind: "pure_byte_oriented_porcelain_status_completion_result" as const,
    resultVersion: 1 as const,
    contractId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId,
    status: accepted ? "accepted_fixture_byte_oriented_porcelain_status_completion" as const : "blocked_fail_closed" as const,
    reason: blockingReasons[0] ?? "input_contract_rejected",
    fixtureOnly: true as const,
    observedLiveProcess: false as const,
    authoritativeLive: false as const,
    authority: "none" as const,
    runtimeActivated: false as const,
    compatibilityAuthorityGranted: false as const,
    deploymentAuthorityGranted: false as const,
    blockingReasons,
    evidence,
    rejectedInputEvidence: accepted ? null : rejectedInputEvidence,
    resultFingerprintAlgorithm: "sha256" as const,
  });
  return deepFreeze({
    ...base,
    resultFingerprint: buildResultFingerprint({ ...base, resultFingerprint: "" }),
  });
}

function hasOutputRetentionReason(reasons: readonly PorcelainStatusCompletionReason[]): boolean {
  return reasons.some((reason) => reason === "stdout_overflow_rejected"
    || reason === "stderr_overflow_rejected"
    || reason === "combined_overflow_rejected"
    || reason === "truncated_output_rejected");
}

function hasSafeRejectedSummaryIdentity(item: Partial<PorcelainStatusCompletionInput>): item is Partial<PorcelainStatusCompletionInput> & Pick<PorcelainStatusCompletionInput,
  "contractKind" | "contractVersion" | "boundaryId" | "byteRepresentationId" | "policyId" | "policyVersion" | "sourceSpawnContractId" | "sourceSpawnContractVersion" | "capabilityPurpose" | "capabilityIdentity" | "toolIdentity" | "platform" | "canonicalExecutablePath" | "fixedArgvIdentity" | "argv"
> {
  return item.contractKind === "pure_byte_oriented_porcelain_status_completion_contract"
    && item.contractVersion === 1
    && item.boundaryId === PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId
    && item.byteRepresentationId === PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.byteRepresentationId
    && item.policyId === PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.policyId
    && item.policyVersion === 1
    && item.sourceSpawnContractId === PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.sourceSpawnContractId
    && item.sourceSpawnContractVersion === 1
    && item.capabilityPurpose === "git_porcelain_status"
    && item.capabilityIdentity === "git_porcelain_status_v1"
    && item.toolIdentity === "git"
    && item.platform === "macos"
    && item.canonicalExecutablePath === "/usr/bin/git"
    && item.fixedArgvIdentity === "git_porcelain_status_argv_v1"
    && sameArray(item.argv, PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.argv);
}

function hasSafeRejectedSummarySourceLinkage(item: Partial<PorcelainStatusCompletionInput>): item is Partial<PorcelainStatusCompletionInput> & Pick<PorcelainStatusCompletionInput,
  "sourceSpawnFingerprint" | "sourceSpawnEvidenceFingerprint" | "sourceSpawnObservationFingerprint" | "boundarySessionId" | "purpose" | "workingDirectoryFingerprint" | "observationSequenceIdentity" | "spawnAttemptId" | "evidenceTimestamp" | "provenanceClassification" | "fixtureLiveClassification"
> {
  return isSha256(item.sourceSpawnFingerprint)
    && isSha256(item.sourceSpawnEvidenceFingerprint)
    && isSha256(item.sourceSpawnObservationFingerprint)
    && isNonEmptyString(item.boundarySessionId)
    && item.purpose === "first_live_read_only_staging_preflight"
    && isSha256(item.workingDirectoryFingerprint)
    && isNonEmptyString(item.observationSequenceIdentity)
    && isNonEmptyString(item.spawnAttemptId)
    && typeof item.evidenceTimestamp === "string"
    && !Number.isNaN(Date.parse(item.evidenceTimestamp))
    && item.provenanceClassification === "fixture_synthetic"
    && item.fixtureLiveClassification === "fixture_only_not_live_observation";
}

function hasSafeRejectedSummaryLifecycle(item: Partial<PorcelainStatusCompletionInput>): item is Partial<PorcelainStatusCompletionInput> & Pick<PorcelainStatusCompletionInput, "completionCategory" | "completionReason"> {
  return item.spawnAttempted === true
    && item.processCreated === true
    && item.processStartedObserved === true
    && item.spawnErrorObserved === false
    && item.exitObserved === true
    && item.exitCode === 0
    && item.signalObserved === false
    && item.signal === null
    && item.closeObserved === true
    && item.closeCode === 0
    && item.closeSignal === null
    && item.completionTerminal === true
    && item.completionCategory === "normal_zero_exit"
    && item.completionReason === "exit_zero_close_zero"
    && item.childProcessErrorObserved === false
    && item.processDeathConfirmed === true
    && item.stdoutStreamError === false
    && item.stderrStreamError === false
    && item.unexpectedStreamChunk === false
    && item.decodedStdoutTextPresent === false
    && item.decodedStderrTextPresent === false
    && item.replacementDecodingUsed === false
    && item.terminationRequested === false
    && item.terminationAttempted === false
    && item.settledExactlyOnce === true
    && item.retryCount === 0
    && item.fallbackAttempted === false;
}

function hasSafeRejectedSummaryAuthority(item: Partial<PorcelainStatusCompletionInput>): boolean {
  return item.shellUsed === false
    && item.pathLookupUsed === false
    && item.inheritedEnvironmentUsed === false
    && item.credentialsUsed === false
    && item.networkUsed === false
    && item.authorizationConsumed === false
    && item.runtimeActivated === false
    && item.toctouEliminated === false
    && item.observedLiveProcess === false
    && item.repositoryReadAuthorityGranted === false
    && item.processAuthorityGranted === false
    && item.observerAuthorityGranted === false
    && item.cliExecutionAuthorityGranted === false
    && item.compatibilityAuthorityGranted === false
    && item.runtimeAuthorityGranted === false
    && item.stagingAuthorityGranted === false
    && item.deploymentAuthorityGranted === false
    && item.credentialAuthorityGranted === false
    && item.networkAuthorityGranted === false
    && item.mutationAuthorityGranted === false
    && item.authority === "none";
}

function hasSafeRejectedSummaryCountsAndFlags(item: Partial<PorcelainStatusCompletionInput>): item is Partial<PorcelainStatusCompletionInput> & Pick<PorcelainStatusCompletionInput,
  "stdoutBytesHex" | "stderrBytesHex" | "stdoutByteCount" | "stderrByteCount" | "combinedByteCount" | "stdoutOverflow" | "stderrOverflow" | "combinedOverflow" | "stdoutTruncated" | "stderrTruncated" | "combinedTruncated"
> {
  return typeof item.stdoutBytesHex === "string"
    && typeof item.stderrBytesHex === "string"
    && isNonNegativeInteger(item.stdoutByteCount)
    && isNonNegativeInteger(item.stderrByteCount)
    && isNonNegativeInteger(item.combinedByteCount)
    && typeof item.stdoutOverflow === "boolean"
    && typeof item.stderrOverflow === "boolean"
    && typeof item.combinedOverflow === "boolean"
    && typeof item.stdoutTruncated === "boolean"
    && typeof item.stderrTruncated === "boolean"
    && typeof item.combinedTruncated === "boolean";
}

function safeByteFingerprint(kind: "stdout" | "stderr", item: Pick<PorcelainStatusCompletionInput, "byteRepresentationId" | "stdoutBytesHex" | "stdoutByteCount" | "stderrBytesHex" | "stderrByteCount">): string | null {
  if (kind === "stdout") {
    if (byteCountFromHexIfValid(item.stdoutBytesHex) !== item.stdoutByteCount) return null;
    return sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.stdoutBytes, {
      byteRepresentationId: item.byteRepresentationId,
      stdoutBytesHex: item.stdoutBytesHex,
      stdoutByteCount: item.stdoutByteCount,
    });
  }
  if (byteCountFromHexIfValid(item.stderrBytesHex) !== item.stderrByteCount) return null;
  return sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.stderrBytes, {
    byteRepresentationId: item.byteRepresentationId,
    stderrBytesHex: item.stderrBytesHex,
    stderrByteCount: item.stderrByteCount,
  });
}

function validateEvidenceFingerprint(evidence: PorcelainStatusCompletionEvidence): boolean {
  const withoutFingerprint = { ...evidence, evidenceFingerprint: undefined };
  delete withoutFingerprint.evidenceFingerprint;
  return evidence.evidenceFingerprint === sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.evidence, canonicalize(withoutFingerprint));
}

function buildResultFingerprint(result: Omit<PorcelainStatusCompletionResult, "resultFingerprint"> & { resultFingerprint: string }): string {
  return sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.result, canonicalize({ ...result, resultFingerprint: "" }));
}

export function identityFingerprint(): string {
  return sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.identity, canonicalize(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY));
}

export function policyFingerprint(): string {
  return sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.policy, canonicalize(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY));
}

export function sha256(domain: string, value: unknown): string {
  return createHash("sha256").update(`${domain}\0${typeof value === "string" ? value : canonicalize(value)}`).digest("hex");
}

export function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Object.is(value, -0)) throw new Error("non_canonical_number");
    return String(value);
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  if (isPlainRecord(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  throw new Error("unsupported_canonical_value");
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;
  return Object.values(Object.getOwnPropertyDescriptors(value)).every((descriptor) => "value" in descriptor);
}

export function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

export function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/u.test(value);
}

function validateHex(kind: "stdout" | "stderr", value: unknown): readonly PorcelainStatusCompletionReason[] {
  const grammarReason = kind === "stdout" ? "stdout_hex_grammar_rejected" : "stderr_hex_grammar_rejected";
  const oddReason = kind === "stdout" ? "stdout_hex_odd_length_rejected" : "stderr_hex_odd_length_rejected";
  if (typeof value !== "string") return [grammarReason];
  const reasons: PorcelainStatusCompletionReason[] = [];
  if (!/^[0-9a-f]*$/u.test(value)) reasons.push(grammarReason);
  if (value.length % 2 !== 0) reasons.push(oddReason);
  return reasons;
}

function byteCountFromHex(value: string): number {
  return value.length / 2;
}

function byteCountFromHexIfValid(value: unknown): number | null {
  return typeof value === "string" && /^[0-9a-f]*$/u.test(value) && value.length % 2 === 0 ? value.length / 2 : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && Number.isFinite(value) && !Object.is(value, -0);
}

function sameArray(value: unknown, expected: readonly string[]): boolean {
  return Array.isArray(value) && value.length === expected.length && value.every((item, index) => item === expected[index]);
}

function sortReasons(reasons: readonly PorcelainStatusCompletionReason[]): readonly PorcelainStatusCompletionReason[] {
  const unique = [...new Set(reasons.length === 0 ? ["accepted" as const] : reasons)];
  return deepFreeze(unique.sort((a, b) => REASON_ORDER.indexOf(a) - REASON_ORDER.indexOf(b)));
}
