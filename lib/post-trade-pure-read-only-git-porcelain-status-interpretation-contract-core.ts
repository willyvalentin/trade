import { createHash } from "node:crypto";

import {
  PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY,
  PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY,
  buildPureByteOrientedPorcelainStatusCompletion,
  canonicalize as canonicalizeByteCompletion,
  identityFingerprint as byteCompletionIdentityFingerprint,
  policyFingerprint as byteCompletionPolicyFingerprint,
  validatePureByteOrientedPorcelainStatusCompletionResult,
  type PorcelainStatusCompletionEvidence,
  type PorcelainStatusCompletionInput,
  type PorcelainStatusCompletionResult,
} from "./post-trade-pure-byte-oriented-porcelain-status-completion-contract-core";

export const PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_read_only_git_porcelain_status_interpretation_contract",
  contractId: "ture.execution.pure-read-only-git-porcelain-status-interpretation-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.read-only-git-porcelain-status-interpretation.fixture-boundary.v1",
  grammarId: "ture.execution.git-porcelain-v1-z.no-renames.path-bytes.v1",
  grammarVersion: 1,
  normalizationId: "ture.execution.git-porcelain-v1-z.no-normalization.v1",
  normalizationVersion: 1,
  sourceCompletionContractId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId,
  sourceCompletionContractVersion: 1,
  sourceCompletionBoundaryId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId,
  capabilityIdentity: "git_porcelain_status_v1",
  capabilityPurpose: "git_porcelain_status",
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  fixtureOnly: true,
  observedLiveProcess: false,
  authority: "none",
} as const);

export const PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY = deepFreeze({
  policyId: "pure_read_only_git_porcelain_status_interpretation_policy_v1",
  policyVersion: 1,
  acceptedTool: "git",
  acceptedExecutable: "/usr/bin/git",
  fixedArgvIdentity: "git_porcelain_status_argv_v1",
  argv: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.argv,
  rawStdoutLimitBytes: 65536,
  maxRecordCount: 2048,
  maxPathBytesPerRecord: 4096,
  maxCumulativePathBytes: 65536,
  ignoredRecordsAccepted: false,
  renameCopyAccepted: false,
  submoduleSpecificClassification: false,
  fixtureOnly: true,
  runtimeActivationAllowed: false,
  repositoryReadAuthorityAllowed: false,
  compatibilityAuthorityAllowed: false,
  parserAcceptsCallerOptions: false,
} as const);

export const PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-read-only-git-porcelain-status-interpretation:identity:v1",
  policy: "ture:pure-read-only-git-porcelain-status-interpretation:policy:v1",
  pathBytes: "ture:pure-read-only-git-porcelain-status-interpretation:path-bytes:v1",
  record: "ture:pure-read-only-git-porcelain-status-interpretation:record:v1",
  orderedRecords: "ture:pure-read-only-git-porcelain-status-interpretation:ordered-records:v1",
  evidence: "ture:pure-read-only-git-porcelain-status-interpretation:evidence:v1",
  result: "ture:pure-read-only-git-porcelain-status-interpretation:result:v1",
} as const);

const ACCEPTED_ORDINARY_STATUS_PAIRS = [
  " M", " T", " D",
  "M ", "MM", "MT", "MD",
  "T ", "TM", "TT", "TD",
  "A ", "AM", "AT", "AD",
  "D ", "DM", "DT",
] as const;

const ACCEPTED_UNMERGED_STATUS_PAIRS = ["DD", "AU", "UD", "UA", "DU", "AA", "UU"] as const;

export const PURE_READ_ONLY_GIT_PORCELAIN_STATUS_ACCEPTED_STATUS_TABLE = deepFreeze({
  ordinary: ACCEPTED_ORDINARY_STATUS_PAIRS,
  untracked: ["??"] as const,
  unmerged: ACCEPTED_UNMERGED_STATUS_PAIRS,
  ignoredRejected: ["!!"] as const,
  renameCopyRejectedStatusBytes: ["R", "C"] as const,
} as const);

export type PureGitPorcelainStatusInterpretationStatus = "accepted_clean" | "accepted_dirty" | "rejected";

export type PureGitPorcelainStatusInterpretationReason =
  | "clean"
  | "dirty"
  | "input_contract_rejected"
  | "input_identity_rejected"
  | "input_fingerprint_rejected"
  | "input_status_rejected"
  | "source_spawn_identity_rejected"
  | "source_linkage_rejected"
  | "capability_rejected"
  | "platform_rejected"
  | "tool_rejected"
  | "executable_rejected"
  | "argv_rejected"
  | "authority_rejected"
  | "runtime_claim_rejected"
  | "live_claim_rejected"
  | "toctou_claim_rejected"
  | "completion_state_rejected"
  | "stderr_not_empty"
  | "output_overflow_rejected"
  | "truncated_output_rejected"
  | "stream_error_rejected"
  | "termination_state_rejected"
  | "retry_or_fallback_rejected"
  | "malformed_nul_termination"
  | "empty_record_rejected"
  | "truncated_record"
  | "malformed_status_prefix"
  | "malformed_separator"
  | "unsupported_status_code"
  | "impossible_status_combination"
  | "rename_or_copy_rejected"
  | "ignored_record_rejected"
  | "path_empty"
  | "path_too_long"
  | "too_many_records"
  | "cumulative_path_limit_rejected"
  | "raw_output_limit_rejected"
  | "submodule_state_rejected"
  | "unexpected_extra_bytes";

export type PureGitPorcelainStatusRecordSummary = Readonly<{
  recordIndex: number;
  xStatus: string;
  yStatus: string;
  statusPair: string;
  pathByteCount: number;
  pathBytesFingerprint: string;
  recordFingerprint: string;
  stagedChange: boolean;
  unstagedChange: boolean;
  untracked: boolean;
  ignored: false;
  unmerged: boolean;
  submoduleChange: false;
}>;

export type PureGitPorcelainStatusCodeBreakdown = Readonly<Record<
  typeof ACCEPTED_ORDINARY_STATUS_PAIRS[number] | typeof ACCEPTED_UNMERGED_STATUS_PAIRS[number] | "??",
  number
>>;

export type PureGitPorcelainStatusInterpretationEvidence = Readonly<{
  evidenceKind: "pure_read_only_git_porcelain_status_interpretation_evidence";
  evidenceVersion: 1;
  contractKind: typeof PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractKind;
  contractId: typeof PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractId;
  contractVersion: 1;
  boundaryId: typeof PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.boundaryId;
  grammarId: typeof PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.grammarId;
  grammarVersion: 1;
  normalizationId: typeof PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.normalizationId;
  normalizationVersion: 1;
  sourceCompletionContractId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId;
  sourceCompletionContractVersion: 1;
  sourceCompletionBoundaryId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId;
  sourceCompletionResultFingerprint: string;
  sourceCompletionEvidenceFingerprint: string;
  sourceByteCompletionIdentityFingerprint: string;
  sourceByteCompletionPolicyFingerprint: string;
  sourceSpawnContractId: string;
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
  sourcePolicyId: typeof PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.policyId;
  sourcePolicyVersion: 1;
  canonicalExecutablePath: "/usr/bin/git";
  fixedArgvIdentity: "git_porcelain_status_argv_v1";
  argv: readonly string[];
  workingDirectoryFingerprint: string;
  observationSequenceIdentity: string;
  sourceEvidenceTimestamp: string;
  rawByteCount: number;
  rawOutputFingerprint: string;
  stderrEmpty: true;
  eligibleCompletion: true;
  truncated: false;
  status: "accepted_clean" | "accepted_dirty";
  reason: "clean" | "dirty";
  clean: boolean;
  recordCount: number;
  cumulativePathByteCount: number;
  stagedChangeCount: number;
  unstagedChangeCount: number;
  untrackedCount: number;
  ignoredCount: 0;
  unmergedCount: number;
  submoduleChangeCount: 0;
  unsupportedCount: 0;
  statusCodeBreakdown: PureGitPorcelainStatusCodeBreakdown;
  orderedRecordFingerprint: string;
  recordSummaries: readonly PureGitPorcelainStatusRecordSummary[];
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  repositoryReadAuthorityGranted: false;
  mutationAuthorityGranted: false;
  processAuthorityGranted: false;
  observerAuthorityGranted: false;
  cliExecutionAuthorityGranted: false;
  compatibilityAuthorityGranted: false;
  runtimeAuthorityGranted: false;
  stagingAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  credentialAuthorityGranted: false;
  networkAuthorityGranted: false;
  authorizationConsumed: false;
  credentialsUsed: false;
  networkUsed: false;
  shellUsed: false;
  pathLookupUsed: false;
  inheritedEnvironmentUsed: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  contractIdentityFingerprint: string;
  policyFingerprint: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type PureGitPorcelainStatusInterpretationResult = Readonly<{
  resultKind: "pure_read_only_git_porcelain_status_interpretation_result";
  resultVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.boundaryId;
  status: PureGitPorcelainStatusInterpretationStatus;
  reason: PureGitPorcelainStatusInterpretationReason;
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  runtimeActivated: false;
  compatibilityAuthorityGranted: false;
  repositoryReadAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  blockingReasons: readonly PureGitPorcelainStatusInterpretationReason[];
  evidence: PureGitPorcelainStatusInterpretationEvidence | null;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

const ALL_ACCEPTED_STATUS_PAIRS = [...ACCEPTED_ORDINARY_STATUS_PAIRS, ...ACCEPTED_UNMERGED_STATUS_PAIRS, "??"] as const;

const REASON_ORDER: readonly PureGitPorcelainStatusInterpretationReason[] = [
  "input_contract_rejected",
  "input_identity_rejected",
  "input_fingerprint_rejected",
  "input_status_rejected",
  "source_spawn_identity_rejected",
  "source_linkage_rejected",
  "capability_rejected",
  "platform_rejected",
  "tool_rejected",
  "executable_rejected",
  "argv_rejected",
  "authority_rejected",
  "runtime_claim_rejected",
  "live_claim_rejected",
  "toctou_claim_rejected",
  "completion_state_rejected",
  "stderr_not_empty",
  "output_overflow_rejected",
  "truncated_output_rejected",
  "stream_error_rejected",
  "termination_state_rejected",
  "retry_or_fallback_rejected",
  "raw_output_limit_rejected",
  "malformed_nul_termination",
  "empty_record_rejected",
  "truncated_record",
  "malformed_status_prefix",
  "malformed_separator",
  "unsupported_status_code",
  "rename_or_copy_rejected",
  "ignored_record_rejected",
  "impossible_status_combination",
  "submodule_state_rejected",
  "path_empty",
  "path_too_long",
  "too_many_records",
  "cumulative_path_limit_rejected",
  "unexpected_extra_bytes",
  "clean",
  "dirty",
];

export function buildPureReadOnlyGitPorcelainStatusInterpretation(input: unknown): PureGitPorcelainStatusInterpretationResult {
  const source = validateSourceCompletion(input);
  if (source.reasons.length > 0 || !source.evidence || !source.result) return buildResult(null, source.reasons);
  const bytes = hexToBytes(source.evidence.stdoutBytesHex);
  if (bytes.length > PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.rawStdoutLimitBytes) return buildResult(null, ["raw_output_limit_rejected"]);
  if (bytes.length === 0) return buildAcceptedEvidence(source.result, source.evidence, []);
  if (bytes.at(-1) !== 0) return buildResult(null, ["malformed_nul_termination"]);
  const records = splitRecords(bytes);
  if (records.some((record) => record.length === 0)) return buildResult(null, ["empty_record_rejected"]);
  if (records.length > PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.maxRecordCount) return buildResult(null, ["too_many_records"]);

  const summaries: PureGitPorcelainStatusRecordSummary[] = [];
  let cumulativePathByteCount = 0;
  for (const [index, record] of records.entries()) {
    const parsed = parseRecord(index, record);
    if ("reason" in parsed) return buildResult(null, [parsed.reason]);
    cumulativePathByteCount += parsed.pathByteCount;
    if (cumulativePathByteCount > PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.maxCumulativePathBytes) return buildResult(null, ["cumulative_path_limit_rejected"]);
    summaries.push(parsed);
  }
  return buildAcceptedEvidence(source.result, source.evidence, summaries);
}

function validateSourceCompletion(input: unknown): { result: PorcelainStatusCompletionResult | null; evidence: PorcelainStatusCompletionEvidence | null; reasons: readonly PureGitPorcelainStatusInterpretationReason[] } {
  const rejectedSourceReasons = rejectedSourceCompletionReasons(input);
  if (rejectedSourceReasons.length > 0) return { result: null, evidence: null, reasons: rejectedSourceReasons };
  const source = validatePureByteOrientedPorcelainStatusCompletionResult(input);
  if (!source.valid) return { result: null, evidence: null, reasons: mapSourceReasons(source.reasons) };
  const rebuilt = buildPureByteOrientedPorcelainStatusCompletion(sourceCompletionInputFromEvidence(source.evidence));
  if (rebuilt.resultFingerprint !== source.result.resultFingerprint
    || rebuilt.evidence?.evidenceFingerprint !== source.evidence.evidenceFingerprint
    || canonicalizeByteCompletion(rebuilt) !== canonicalizeByteCompletion(source.result)
  ) return { result: null, evidence: null, reasons: ["input_fingerprint_rejected"] };
  const reasons = validateSourceEvidence(source.evidence);
  return { result: reasons.length === 0 ? source.result : null, evidence: reasons.length === 0 ? source.evidence : null, reasons };
}

function rejectedSourceCompletionReasons(input: unknown): readonly PureGitPorcelainStatusInterpretationReason[] {
  if (!isPlainRecord(input)) return [];
  if (input.resultKind !== "pure_byte_oriented_porcelain_status_completion_result"
    || input.contractId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId
    || input.boundaryId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId
    || input.status !== "blocked_fail_closed"
    || typeof input.reason !== "string"
  ) return [];
  return mapSourceReasons([input.reason]);
}

function sourceCompletionInputFromEvidence(evidence: PorcelainStatusCompletionEvidence): PorcelainStatusCompletionInput {
  return deepFreeze({
    contractKind: evidence.contractKind,
    contractVersion: evidence.contractVersion,
    boundaryId: evidence.boundaryId,
    byteRepresentationId: evidence.byteRepresentationId,
    sourceSpawnContractId: evidence.sourceSpawnContractId,
    sourceSpawnContractVersion: evidence.sourceSpawnContractVersion,
    sourceSpawnFingerprint: evidence.sourceSpawnFingerprint,
    sourceSpawnEvidenceFingerprint: evidence.sourceSpawnEvidenceFingerprint,
    sourceSpawnObservationFingerprint: evidence.sourceSpawnObservationFingerprint,
    boundarySessionId: evidence.boundarySessionId,
    purpose: evidence.purpose,
    capabilityPurpose: evidence.capabilityPurpose,
    capabilityIdentity: evidence.capabilityIdentity,
    toolIdentity: evidence.toolIdentity,
    platform: evidence.platform,
    policyId: evidence.policyId,
    policyVersion: evidence.policyVersion,
    canonicalExecutablePath: evidence.canonicalExecutablePath,
    fixedArgvIdentity: evidence.fixedArgvIdentity,
    argv: deepFreeze([...evidence.argv]),
    workingDirectoryFingerprint: evidence.workingDirectoryFingerprint,
    observationSequenceIdentity: evidence.observationSequenceIdentity,
    spawnAttemptId: evidence.spawnAttemptId,
    evidenceTimestamp: evidence.evidenceTimestamp,
    provenanceClassification: evidence.provenanceClassification,
    fixtureLiveClassification: evidence.fixtureLiveClassification,
    spawnAttempted: evidence.spawnAttempted,
    processCreated: evidence.processCreated,
    processStartedObserved: evidence.processStartedObserved,
    spawnErrorObserved: evidence.spawnErrorObserved,
    exitObserved: evidence.exitObserved,
    exitCode: evidence.exitCode,
    signalObserved: evidence.signalObserved,
    signal: evidence.signal,
    closeObserved: evidence.closeObserved,
    closeCode: evidence.closeCode,
    closeSignal: evidence.closeSignal,
    completionTerminal: evidence.completionTerminal,
    completionCategory: evidence.completionCategory,
    completionReason: evidence.completionReason,
    childProcessErrorObserved: evidence.childProcessErrorObserved,
    processDeathConfirmed: evidence.processDeathConfirmed,
    stdoutBytesHex: evidence.stdoutBytesHex,
    stdoutByteCount: evidence.stdoutByteCount,
    stderrBytesHex: evidence.stderrBytesHex,
    stderrByteCount: evidence.stderrByteCount,
    combinedByteCount: evidence.combinedByteCount,
    stdoutTruncated: evidence.stdoutTruncated,
    stderrTruncated: evidence.stderrTruncated,
    combinedTruncated: evidence.combinedTruncated,
    stdoutOverflow: evidence.stdoutOverflow,
    stderrOverflow: evidence.stderrOverflow,
    combinedOverflow: evidence.combinedOverflow,
    stdoutStreamError: evidence.stdoutStreamError,
    stderrStreamError: evidence.stderrStreamError,
    unexpectedStreamChunk: evidence.unexpectedStreamChunk,
    decodedStdoutTextPresent: evidence.decodedStdoutTextPresent,
    decodedStderrTextPresent: evidence.decodedStderrTextPresent,
    replacementDecodingUsed: evidence.replacementDecodingUsed,
    terminationRequested: evidence.terminationRequested,
    terminationAttempted: evidence.terminationAttempted,
    settledExactlyOnce: evidence.settledExactlyOnce,
    retryCount: evidence.retryCount,
    fallbackAttempted: evidence.fallbackAttempted,
    shellUsed: evidence.shellUsed,
    pathLookupUsed: evidence.pathLookupUsed,
    inheritedEnvironmentUsed: evidence.inheritedEnvironmentUsed,
    credentialsUsed: evidence.credentialsUsed,
    networkUsed: evidence.networkUsed,
    authorizationConsumed: evidence.authorizationConsumed,
    runtimeActivated: evidence.runtimeActivated,
    toctouEliminated: evidence.toctouEliminated,
    observedLiveProcess: evidence.observedLiveProcess,
    repositoryReadAuthorityGranted: evidence.repositoryReadAuthorityGranted,
    processAuthorityGranted: evidence.processAuthorityGranted,
    observerAuthorityGranted: evidence.observerAuthorityGranted,
    cliExecutionAuthorityGranted: evidence.cliExecutionAuthorityGranted,
    compatibilityAuthorityGranted: evidence.compatibilityAuthorityGranted,
    runtimeAuthorityGranted: evidence.runtimeAuthorityGranted,
    stagingAuthorityGranted: evidence.stagingAuthorityGranted,
    deploymentAuthorityGranted: evidence.deploymentAuthorityGranted,
    credentialAuthorityGranted: evidence.credentialAuthorityGranted,
    networkAuthorityGranted: evidence.networkAuthorityGranted,
    mutationAuthorityGranted: evidence.mutationAuthorityGranted,
    authority: evidence.authority,
  });
}

function validateSourceEvidence(evidence: PorcelainStatusCompletionEvidence): readonly PureGitPorcelainStatusInterpretationReason[] {
  const reasons: PureGitPorcelainStatusInterpretationReason[] = [];
  if (evidence.sourceSpawnContractId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.sourceSpawnContractId || evidence.sourceSpawnContractVersion !== 1) reasons.push("source_spawn_identity_rejected");
  if (evidence.contractKind !== "pure_byte_oriented_porcelain_status_completion_contract"
    || evidence.contractVersion !== 1
    || evidence.boundaryId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId
    || evidence.byteRepresentationId !== PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.byteRepresentationId
    || evidence.status !== "accepted"
    || evidence.reason !== "accepted"
    || evidence.eligibleCompletion !== true
  ) reasons.push("input_identity_rejected");
  if (!isSha256(evidence.sourceSpawnFingerprint) || !isSha256(evidence.sourceSpawnEvidenceFingerprint) || !isSha256(evidence.sourceSpawnObservationFingerprint)) reasons.push("source_spawn_identity_rejected");
  if (!isSha256(evidence.workingDirectoryFingerprint) || typeof evidence.boundarySessionId !== "string" || evidence.boundarySessionId.length === 0 || typeof evidence.observationSequenceIdentity !== "string" || evidence.observationSequenceIdentity.length === 0) reasons.push("source_linkage_rejected");
  if (evidence.purpose !== "first_live_read_only_staging_preflight" || evidence.capabilityIdentity !== "git_porcelain_status_v1" || evidence.capabilityPurpose !== "git_porcelain_status") reasons.push("capability_rejected");
  if (evidence.platform !== "macos") reasons.push("platform_rejected");
  if (evidence.toolIdentity !== "git") reasons.push("tool_rejected");
  if (evidence.canonicalExecutablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (evidence.fixedArgvIdentity !== "git_porcelain_status_argv_v1" || !sameArray(evidence.argv, PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.argv)) reasons.push("argv_rejected");
  if (evidence.stderrEmpty !== true || evidence.stderrBytesHex !== "" || evidence.stderrByteCount !== 0) reasons.push("stderr_not_empty");
  if (evidence.stdoutOverflow || evidence.stderrOverflow || evidence.combinedOverflow) reasons.push("output_overflow_rejected");
  if (evidence.truncated || evidence.stdoutTruncated || evidence.stderrTruncated || evidence.combinedTruncated) reasons.push("truncated_output_rejected");
  if (evidence.stdoutStreamError || evidence.stderrStreamError || evidence.unexpectedStreamChunk || evidence.decodedStdoutTextPresent || evidence.decodedStderrTextPresent || evidence.replacementDecodingUsed) reasons.push("stream_error_rejected");
  if (evidence.exitCode !== 0 || evidence.closeCode !== 0 || evidence.completionCategory !== "normal_zero_exit" || evidence.completionReason !== "exit_zero_close_zero" || evidence.spawnAttempted !== true || evidence.processCreated !== true || evidence.processStartedObserved !== true || evidence.spawnErrorObserved !== false || evidence.completionTerminal !== true || evidence.processDeathConfirmed !== true) reasons.push("completion_state_rejected");
  if (evidence.terminationRequested || evidence.terminationAttempted || evidence.signalObserved || evidence.signal !== null || evidence.closeSignal !== null) reasons.push("termination_state_rejected");
  if (evidence.retryCount !== 0 || evidence.fallbackAttempted) reasons.push("retry_or_fallback_rejected");
  if (evidence.authority !== "none" || evidence.repositoryReadAuthorityGranted || evidence.processAuthorityGranted || evidence.observerAuthorityGranted || evidence.cliExecutionAuthorityGranted || evidence.compatibilityAuthorityGranted || evidence.runtimeAuthorityGranted || evidence.stagingAuthorityGranted || evidence.deploymentAuthorityGranted || evidence.credentialAuthorityGranted || evidence.networkAuthorityGranted || evidence.mutationAuthorityGranted) reasons.push("authority_rejected");
  if (evidence.runtimeActivated || evidence.shellUsed || evidence.pathLookupUsed || evidence.inheritedEnvironmentUsed || evidence.credentialsUsed || evidence.networkUsed || evidence.authorizationConsumed) reasons.push("runtime_claim_rejected");
  if (evidence.observedLiveProcess) reasons.push("live_claim_rejected");
  if (evidence.toctouEliminated) reasons.push("toctou_claim_rejected");
  return sortReasons(reasons);
}

function parseRecord(recordIndex: number, bytes: readonly number[]): PureGitPorcelainStatusRecordSummary | { reason: PureGitPorcelainStatusInterpretationReason } {
  if (bytes.length < 3) return { reason: "truncated_record" };
  const xStatus = statusByte(bytes[0]);
  const yStatus = statusByte(bytes[1]);
  if (!xStatus || !yStatus) return { reason: "malformed_status_prefix" };
  if (bytes[2] !== 0x20) return { reason: "malformed_separator" };
  const statusPair = `${xStatus}${yStatus}`;
  if (xStatus === "R" || xStatus === "C" || yStatus === "R" || yStatus === "C") return { reason: "rename_or_copy_rejected" };
  if (statusPair === "!!") return { reason: "ignored_record_rejected" };
  if (!isKnownStatus(xStatus) || !isKnownStatus(yStatus)) return { reason: "unsupported_status_code" };
  const classification = classifyStatusPair(statusPair);
  if (!classification) return { reason: "impossible_status_combination" };
  const path = bytes.slice(3);
  if (path.length === 0) return { reason: "path_empty" };
  if (path.length > PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.maxPathBytesPerRecord) return { reason: "path_too_long" };
  const pathBytesFingerprint = sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.pathBytes, {
    pathByteCount: path.length,
    pathBytesHex: bytesToHex(path),
  });
  const base = deepFreeze({
    recordIndex,
    xStatus,
    yStatus,
    statusPair,
    pathByteCount: path.length,
    pathBytesFingerprint,
    stagedChange: classification.stagedChange,
    unstagedChange: classification.unstagedChange,
    untracked: classification.untracked,
    ignored: false as const,
    unmerged: classification.unmerged,
    submoduleChange: false as const,
  });
  return deepFreeze({
    ...base,
    recordFingerprint: sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.record, canonicalize(base)),
  });
}

function classifyStatusPair(statusPair: string): Pick<PureGitPorcelainStatusRecordSummary, "stagedChange" | "unstagedChange" | "untracked" | "unmerged"> | null {
  if (statusPair === "??") return { stagedChange: false, unstagedChange: false, untracked: true, unmerged: false };
  if ((ACCEPTED_UNMERGED_STATUS_PAIRS as readonly string[]).includes(statusPair)) return { stagedChange: false, unstagedChange: false, untracked: false, unmerged: true };
  if (!(ACCEPTED_ORDINARY_STATUS_PAIRS as readonly string[]).includes(statusPair)) return null;
  return {
    stagedChange: ["M", "T", "A", "D"].includes(statusPair[0] ?? ""),
    unstagedChange: ["M", "T", "D"].includes(statusPair[1] ?? ""),
    untracked: false,
    unmerged: false,
  };
}

function buildAcceptedEvidence(sourceResult: PorcelainStatusCompletionResult, sourceEvidence: PorcelainStatusCompletionEvidence, recordSummaries: readonly PureGitPorcelainStatusRecordSummary[]): PureGitPorcelainStatusInterpretationResult {
  const clean = recordSummaries.length === 0;
  const statusCodeBreakdown = buildStatusCodeBreakdown(recordSummaries);
  const orderedRecordFingerprint = sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.orderedRecords, {
    recordFingerprints: recordSummaries.map((record) => record.recordFingerprint),
    pathBytesFingerprints: recordSummaries.map((record) => record.pathBytesFingerprint),
  });
  const evidenceBase = deepFreeze({
    evidenceKind: "pure_read_only_git_porcelain_status_interpretation_evidence" as const,
    evidenceVersion: 1 as const,
    contractKind: PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractKind,
    contractId: PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractId,
    contractVersion: 1 as const,
    boundaryId: PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.boundaryId,
    grammarId: PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.grammarId,
    grammarVersion: 1 as const,
    normalizationId: PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.normalizationId,
    normalizationVersion: 1 as const,
    sourceCompletionContractId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.contractId,
    sourceCompletionContractVersion: 1 as const,
    sourceCompletionBoundaryId: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY.boundaryId,
    sourceCompletionResultFingerprint: sourceResult.resultFingerprint,
    sourceCompletionEvidenceFingerprint: sourceEvidence.evidenceFingerprint,
    sourceByteCompletionIdentityFingerprint: byteCompletionIdentityFingerprint(),
    sourceByteCompletionPolicyFingerprint: byteCompletionPolicyFingerprint(),
    sourceSpawnContractId: sourceEvidence.sourceSpawnContractId,
    sourceSpawnContractVersion: sourceEvidence.sourceSpawnContractVersion,
    sourceSpawnFingerprint: sourceEvidence.sourceSpawnFingerprint,
    sourceSpawnEvidenceFingerprint: sourceEvidence.sourceSpawnEvidenceFingerprint,
    sourceSpawnObservationFingerprint: sourceEvidence.sourceSpawnObservationFingerprint,
    boundarySessionId: sourceEvidence.boundarySessionId,
    purpose: sourceEvidence.purpose,
    capabilityPurpose: sourceEvidence.capabilityPurpose,
    capabilityIdentity: sourceEvidence.capabilityIdentity,
    toolIdentity: sourceEvidence.toolIdentity,
    platform: sourceEvidence.platform,
    sourcePolicyId: sourceEvidence.policyId,
    sourcePolicyVersion: sourceEvidence.policyVersion,
    canonicalExecutablePath: sourceEvidence.canonicalExecutablePath,
    fixedArgvIdentity: sourceEvidence.fixedArgvIdentity,
    argv: deepFreeze([...sourceEvidence.argv]),
    workingDirectoryFingerprint: sourceEvidence.workingDirectoryFingerprint,
    observationSequenceIdentity: sourceEvidence.observationSequenceIdentity,
    sourceEvidenceTimestamp: sourceEvidence.evidenceTimestamp,
    rawByteCount: sourceEvidence.stdoutByteCount,
    rawOutputFingerprint: sourceEvidence.rawOutputFingerprint,
    stderrEmpty: true as const,
    eligibleCompletion: true as const,
    truncated: false as const,
    status: clean ? "accepted_clean" as const : "accepted_dirty" as const,
    reason: clean ? "clean" as const : "dirty" as const,
    clean,
    recordCount: recordSummaries.length,
    cumulativePathByteCount: recordSummaries.reduce((sum, record) => sum + record.pathByteCount, 0),
    stagedChangeCount: recordSummaries.filter((record) => record.stagedChange).length,
    unstagedChangeCount: recordSummaries.filter((record) => record.unstagedChange).length,
    untrackedCount: recordSummaries.filter((record) => record.untracked).length,
    ignoredCount: 0 as const,
    unmergedCount: recordSummaries.filter((record) => record.unmerged).length,
    submoduleChangeCount: 0 as const,
    unsupportedCount: 0 as const,
    statusCodeBreakdown,
    orderedRecordFingerprint,
    recordSummaries: deepFreeze([...recordSummaries]),
    fixtureOnly: true as const,
    observedLiveProcess: false as const,
    authoritativeLive: false as const,
    repositoryReadAuthorityGranted: false as const,
    mutationAuthorityGranted: false as const,
    processAuthorityGranted: false as const,
    observerAuthorityGranted: false as const,
    cliExecutionAuthorityGranted: false as const,
    compatibilityAuthorityGranted: false as const,
    runtimeAuthorityGranted: false as const,
    stagingAuthorityGranted: false as const,
    deploymentAuthorityGranted: false as const,
    credentialAuthorityGranted: false as const,
    networkAuthorityGranted: false as const,
    authorizationConsumed: false as const,
    credentialsUsed: false as const,
    networkUsed: false as const,
    shellUsed: false as const,
    pathLookupUsed: false as const,
    inheritedEnvironmentUsed: false as const,
    runtimeActivated: false as const,
    toctouEliminated: false as const,
    authority: "none" as const,
    contractIdentityFingerprint: identityFingerprint(),
    policyFingerprint: policyFingerprint(),
    evidenceFingerprintAlgorithm: "sha256" as const,
  } satisfies Omit<PureGitPorcelainStatusInterpretationEvidence, "evidenceFingerprint">);
  const evidence = deepFreeze({
    ...evidenceBase,
    evidenceFingerprint: sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.evidence, canonicalize(evidenceBase)),
  });
  return buildResult(evidence, [evidence.reason]);
}

function buildResult(evidence: PureGitPorcelainStatusInterpretationEvidence | null, reasons: readonly PureGitPorcelainStatusInterpretationReason[]): PureGitPorcelainStatusInterpretationResult {
  const blockingReasons = sortReasons(reasons);
  const status: PureGitPorcelainStatusInterpretationStatus = evidence ? evidence.status : "rejected";
  const base = deepFreeze({
    resultKind: "pure_read_only_git_porcelain_status_interpretation_result" as const,
    resultVersion: 1 as const,
    contractId: PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.boundaryId,
    status,
    reason: blockingReasons[0] ?? "input_contract_rejected",
    fixtureOnly: true as const,
    observedLiveProcess: false as const,
    authoritativeLive: false as const,
    authority: "none" as const,
    runtimeActivated: false as const,
    compatibilityAuthorityGranted: false as const,
    repositoryReadAuthorityGranted: false as const,
    deploymentAuthorityGranted: false as const,
    blockingReasons,
    evidence,
    resultFingerprintAlgorithm: "sha256" as const,
  });
  return deepFreeze({
    ...base,
    resultFingerprint: sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.result, canonicalize(base)),
  });
}

function buildStatusCodeBreakdown(records: readonly PureGitPorcelainStatusRecordSummary[]): PureGitPorcelainStatusCodeBreakdown {
  const entries = ALL_ACCEPTED_STATUS_PAIRS.map((pair) => [pair, 0] as const);
  const base = Object.fromEntries(entries) as Record<typeof ALL_ACCEPTED_STATUS_PAIRS[number], number>;
  for (const record of records) base[record.statusPair as typeof ALL_ACCEPTED_STATUS_PAIRS[number]] += 1;
  return deepFreeze(base);
}

function mapSourceReasons(reasons: readonly string[]): readonly PureGitPorcelainStatusInterpretationReason[] {
  return sortReasons(reasons.map((reason) => {
    if (reason === "accepted") return "input_status_rejected";
    if (reason === "exit_state_rejected") return "completion_state_rejected";
    if (reason === "signal_rejected") return "termination_state_rejected";
    if (reason === "stdout_overflow_rejected" || reason === "stderr_overflow_rejected" || reason === "combined_overflow_rejected") return "output_overflow_rejected";
    if (reason === "stdout_hex_grammar_rejected" || reason === "stdout_hex_odd_length_rejected" || reason === "stdout_byte_count_rejected" || reason === "stderr_hex_grammar_rejected" || reason === "stderr_hex_odd_length_rejected" || reason === "stderr_byte_count_rejected" || reason === "combined_byte_count_rejected") return "input_contract_rejected";
    return isInterpretationReason(reason) ? reason : "input_contract_rejected";
  }));
}

function splitRecords(bytes: readonly number[]): readonly (readonly number[])[] {
  const records: number[][] = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 0) {
      records.push(bytes.slice(start, index));
      start = index + 1;
    }
  }
  return deepFreeze(records);
}

function statusByte(value: number | undefined): string | null {
  if (value === 0x20) return " ";
  if (value === undefined || value < 0x21 || value > 0x7e) return null;
  return String.fromCharCode(value);
}

function isKnownStatus(value: string): boolean {
  return [" ", "M", "T", "A", "D", "R", "C", "U", "?", "!"].includes(value);
}

function hexToBytes(hex: string): readonly number[] {
  const bytes: number[] = [];
  for (let index = 0; index < hex.length; index += 2) bytes.push(Number.parseInt(hex.slice(index, index + 2), 16));
  return deepFreeze(bytes);
}

function bytesToHex(bytes: readonly number[]): string {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function identityFingerprint(): string {
  return sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.identity, canonicalize(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY));
}

export function policyFingerprint(): string {
  return sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.policy, canonicalize(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY));
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
  if (isPlainRecord(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  throw new Error("unsupported_canonical_value");
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;
  return Object.values(Object.getOwnPropertyDescriptors(value)).every((descriptor) => "value" in descriptor);
}

function sameArray(value: unknown, expected: readonly string[]): boolean {
  return Array.isArray(value) && value.length === expected.length && value.every((item, index) => item === expected[index]);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/u.test(value);
}

function isInterpretationReason(value: string): value is PureGitPorcelainStatusInterpretationReason {
  return (REASON_ORDER as readonly string[]).includes(value);
}

function sortReasons(reasons: readonly PureGitPorcelainStatusInterpretationReason[]): readonly PureGitPorcelainStatusInterpretationReason[] {
  const unique = [...new Set(reasons)];
  return deepFreeze(unique.sort((a, b) => REASON_ORDER.indexOf(a) - REASON_ORDER.indexOf(b)));
}
