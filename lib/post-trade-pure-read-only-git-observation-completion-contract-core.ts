import { createHash } from "node:crypto";

export const PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_read_only_git_observation_completion_contract",
  contractId: "ture.execution.pure-read-only-git-observation-completion-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.read-only-git-observation-completion.fixture-boundary.v1",
  sourceSpawnContractId: "ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1",
  sourceSpawnContractVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  fixtureOnly: true,
  observedLiveProcess: false,
  authority: "none",
} as const);

export const PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY = deepFreeze({
  policyId: "pure_read_only_git_observation_completion_policy_v1",
  policyVersion: 1,
  acceptedTool: "git",
  acceptedExecutable: "/usr/bin/git",
  supportedCapabilities: [
    "git_repository_root_v1",
    "git_object_format_v1",
    "git_head_object_v1",
    "git_branch_state_v1",
  ] as const,
  stdoutLimitsByCapability: {
    git_repository_root_v1: 1024,
    git_object_format_v1: 8,
    git_head_object_v1: 65,
    git_branch_state_v1: 256,
  },
  stderrAcceptedBytes: 0,
  fixtureOnly: true,
  runtimeActivationAllowed: false,
  repositoryReadAuthorityAllowed: false,
  compatibilityAuthorityAllowed: false,
  credentialUseAllowed: false,
  networkUseAllowed: false,
  retryAllowed: false,
  fallbackAllowed: false,
  toctouEliminationClaimAllowed: false,
} as const);

export const PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-read-only-git-observation-completion:identity:v1",
  policy: "ture:pure-read-only-git-observation-completion:policy:v1",
  evidence: "ture:pure-read-only-git-observation-completion:evidence:v1",
  result: "ture:pure-read-only-git-observation-completion:result:v1",
} as const);

export const GIT_OBSERVATION_CAPABILITY_DEFINITIONS = deepFreeze({
  git_repository_root_v1: {
    capabilityIdentity: "git_repository_root_v1",
    fixedArgvIdentity: "git_repository_root_argv_v1",
    argv: ["rev-parse", "--show-toplevel"] as const,
    purpose: "git_repository_root",
    acceptedExitCodes: [0] as const,
  },
  git_object_format_v1: {
    capabilityIdentity: "git_object_format_v1",
    fixedArgvIdentity: "git_object_format_argv_v1",
    argv: ["rev-parse", "--show-object-format"] as const,
    purpose: "git_object_format",
    acceptedExitCodes: [0] as const,
  },
  git_head_object_v1: {
    capabilityIdentity: "git_head_object_v1",
    fixedArgvIdentity: "git_head_object_argv_v1",
    argv: ["rev-parse", "--verify", "HEAD"] as const,
    purpose: "git_head_object",
    acceptedExitCodes: [0] as const,
  },
  git_branch_state_v1: {
    capabilityIdentity: "git_branch_state_v1",
    fixedArgvIdentity: "git_branch_state_argv_v1",
    argv: ["symbolic-ref", "--quiet", "--short", "HEAD"] as const,
    purpose: "git_branch_state",
    acceptedExitCodes: [0, 1] as const,
  },
} as const);

export type GitObservationCapabilityIdentity = keyof typeof GIT_OBSERVATION_CAPABILITY_DEFINITIONS;
export type GitObservationFixedArgvIdentity = typeof GIT_OBSERVATION_CAPABILITY_DEFINITIONS[GitObservationCapabilityIdentity]["fixedArgvIdentity"];
export type GitObservationCompletionStatus = "accepted_fixture_git_observation_completion" | "blocked_fail_closed";
export type GitObservationCompletionReason =
  | "accepted"
  | "input_contract_rejected"
  | "input_status_rejected"
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
  | "output_overflow_rejected"
  | "invalid_encoding_rejected"
  | "stream_error_rejected"
  | "termination_state_rejected"
  | "retry_or_fallback_rejected"
  | "authority_rejected"
  | "runtime_claim_rejected"
  | "live_claim_rejected"
  | "toctou_claim_rejected"
  | "stdout_byte_count_rejected"
  | "stderr_byte_count_rejected"
  | "timestamp_rejected"
  | "unknown_field";

export type GitObservationCompletionInput = Readonly<{
  contractKind: "pure_read_only_git_observation_completion_contract";
  contractVersion: 1;
  boundaryId: typeof PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.boundaryId;
  sourceSpawnContractId: typeof PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.sourceSpawnContractId;
  sourceSpawnContractVersion: 1;
  sourceSpawnFingerprint: string;
  boundarySessionId: string;
  purpose: "first_live_read_only_staging_preflight";
  capabilityPurpose: typeof GIT_OBSERVATION_CAPABILITY_DEFINITIONS[GitObservationCapabilityIdentity]["purpose"];
  capabilityIdentity: GitObservationCapabilityIdentity;
  toolIdentity: "git";
  platform: "macos";
  policyId: typeof PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.policyId;
  policyVersion: 1;
  canonicalExecutablePath: "/usr/bin/git";
  fixedArgvIdentity: GitObservationFixedArgvIdentity;
  argv: readonly string[];
  workingDirectoryFingerprint: string;
  observationSequenceIdentity: string;
  spawnAttemptId: string;
  evidenceTimestamp: string;
  provenanceClassification: "fixture_synthetic";
  fixtureLiveClassification: "fixture_only_not_live_observation";
  spawnAttempted: boolean;
  processCreated: boolean;
  processStartedObserved: boolean;
  spawnErrorObserved: boolean;
  exitObserved: boolean;
  exitCode: number | null;
  signalObserved: boolean;
  signal: string | null;
  closeObserved: boolean;
  closeCode: number | null;
  closeSignal: string | null;
  completionTerminal: boolean;
  stdoutText: string | null;
  stderrText: string | null;
  stdoutByteCount: number;
  stderrByteCount: number;
  combinedByteCount: number;
  utf8Valid: boolean;
  stdoutOverflow: boolean;
  stderrOverflow: boolean;
  combinedOverflow: boolean;
  stdoutStreamError: boolean;
  stderrStreamError: boolean;
  unexpectedStreamChunk: boolean;
  terminationRequested: boolean;
  settledExactlyOnce: boolean;
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
  stagingAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  credentialAuthorityGranted: false;
  networkAuthorityGranted: false;
  mutationAuthorityGranted: false;
  authority: "none";
}>;

export type GitObservationCompletionEvidence = GitObservationCompletionInput & Readonly<{
  evidenceKind: "pure_read_only_git_observation_completion_evidence";
  evidenceVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.contractId;
  contractIdentityFingerprint: string;
  policyFingerprint: string;
  eligibleCompletion: boolean;
  stdoutLimitBytes: number;
  sourceOutputFingerprint: string | null;
  stderrEmpty: boolean;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type GitObservationCompletionResult = Readonly<{
  resultKind: "pure_read_only_git_observation_completion_result";
  resultVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.contractId;
  status: GitObservationCompletionStatus;
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  runtimeActivated: false;
  blockingReasons: readonly GitObservationCompletionReason[];
  evidence: GitObservationCompletionEvidence | null;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

const INPUT_KEYS = [
  "contractKind",
  "contractVersion",
  "boundaryId",
  "sourceSpawnContractId",
  "sourceSpawnContractVersion",
  "sourceSpawnFingerprint",
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
  "stdoutText",
  "stderrText",
  "stdoutByteCount",
  "stderrByteCount",
  "combinedByteCount",
  "utf8Valid",
  "stdoutOverflow",
  "stderrOverflow",
  "combinedOverflow",
  "stdoutStreamError",
  "stderrStreamError",
  "unexpectedStreamChunk",
  "terminationRequested",
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
  "eligibleCompletion",
  "stdoutLimitBytes",
  "sourceOutputFingerprint",
  "stderrEmpty",
  "evidenceFingerprintAlgorithm",
  "evidenceFingerprint",
] as const;

const RESULT_KEYS = [
  "resultKind",
  "resultVersion",
  "contractId",
  "status",
  "fixtureOnly",
  "observedLiveProcess",
  "authoritativeLive",
  "authority",
  "runtimeActivated",
  "blockingReasons",
  "evidence",
  "resultFingerprintAlgorithm",
  "resultFingerprint",
] as const;

const REASON_ORDER: readonly GitObservationCompletionReason[] = [
  "input_contract_rejected",
  "unknown_field",
  "input_identity_rejected",
  "input_fingerprint_rejected",
  "source_spawn_identity_rejected",
  "source_linkage_rejected",
  "capability_rejected",
  "platform_rejected",
  "tool_rejected",
  "executable_rejected",
  "argv_rejected",
  "completion_state_rejected",
  "exit_state_rejected",
  "signal_rejected",
  "stderr_not_empty",
  "output_overflow_rejected",
  "invalid_encoding_rejected",
  "stream_error_rejected",
  "termination_state_rejected",
  "retry_or_fallback_rejected",
  "authority_rejected",
  "runtime_claim_rejected",
  "live_claim_rejected",
  "toctou_claim_rejected",
  "stdout_byte_count_rejected",
  "stderr_byte_count_rejected",
  "timestamp_rejected",
  "accepted",
];

export function buildPureReadOnlyGitObservationCompletion(input: unknown): GitObservationCompletionResult {
  const reasons = validateInput(input);
  if (reasons.length > 0) return buildCompletionResult(null, reasons);
  const evidenceInput = input as GitObservationCompletionInput;
  const definition = GIT_OBSERVATION_CAPABILITY_DEFINITIONS[evidenceInput.capabilityIdentity];
  const sourceOutputFingerprint = typeof evidenceInput.stdoutText === "string" ? sha256("ture:pure-read-only-git-observation-completion:source-output:v1", evidenceInput.stdoutText) : null;
  const evidenceBase = deepFreeze({
    ...evidenceInput,
    evidenceKind: "pure_read_only_git_observation_completion_evidence" as const,
    evidenceVersion: 1 as const,
    contractId: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.contractId,
    contractIdentityFingerprint: identityFingerprint(),
    policyFingerprint: policyFingerprint(),
    eligibleCompletion: true,
    stdoutLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability[evidenceInput.capabilityIdentity],
    sourceOutputFingerprint,
    stderrEmpty: evidenceInput.stderrByteCount === 0 && evidenceInput.stderrText === "",
    evidenceFingerprintAlgorithm: "sha256" as const,
  });
  const evidence = deepFreeze({
    ...evidenceBase,
    evidenceFingerprint: sha256(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS.evidence, canonicalize(evidenceBase)),
  });
  void definition;
  return buildCompletionResult(evidence, ["accepted"]);
}

export function validateGitObservationCompletionResult(input: unknown, expectedCapability: GitObservationCapabilityIdentity): { valid: true; result: GitObservationCompletionResult; evidence: GitObservationCompletionEvidence } | { valid: false; reasons: readonly GitObservationCompletionReason[] } {
  if (!isPlainRecord(input) || !hasExactKeys(input, RESULT_KEYS)) return { valid: false, reasons: ["input_contract_rejected"] };
  const result = input as GitObservationCompletionResult;
  if (result.resultKind !== "pure_read_only_git_observation_completion_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.contractId
    || result.fixtureOnly !== true
    || result.observedLiveProcess !== false
    || result.authoritativeLive !== false
    || result.authority !== "none"
    || result.runtimeActivated !== false
    || result.resultFingerprintAlgorithm !== "sha256"
    || !Array.isArray(result.blockingReasons)
  ) return { valid: false, reasons: ["input_identity_rejected"] };
  if (result.status !== "accepted_fixture_git_observation_completion" || result.evidence === null) return { valid: false, reasons: ["input_status_rejected" as GitObservationCompletionReason] };
  if (!isPlainRecord(result.evidence) || !hasExactKeys(result.evidence, EVIDENCE_KEYS)) return { valid: false, reasons: ["input_contract_rejected"] };
  if (result.evidence.capabilityIdentity !== expectedCapability) return { valid: false, reasons: ["capability_rejected"] };
  const evidenceReasons = validateAcceptedEvidence(result.evidence);
  if (evidenceReasons.length > 0) return { valid: false, reasons: evidenceReasons };
  if (result.blockingReasons.length !== 1 || result.blockingReasons[0] !== "accepted") return { valid: false, reasons: ["input_status_rejected"] };
  if (!validateEvidenceFingerprint(result.evidence)) return { valid: false, reasons: ["input_fingerprint_rejected"] };
  const expectedResultFingerprint = buildResultFingerprint({ ...result, resultFingerprint: "" });
  if (result.resultFingerprint !== expectedResultFingerprint) return { valid: false, reasons: ["input_fingerprint_rejected"] };
  return { valid: true, result, evidence: result.evidence };
}

export function buildCanonicalGitObservationCompletionInput(capabilityIdentity: GitObservationCapabilityIdentity, stdoutText: string, patch: Partial<GitObservationCompletionInput> = {}): GitObservationCompletionInput {
  const definition = GIT_OBSERVATION_CAPABILITY_DEFINITIONS[capabilityIdentity];
  const stderrText = patch.stderrText ?? "";
  const stdoutByteCount = patch.stdoutByteCount ?? Buffer.byteLength(stdoutText, "utf8");
  const stderrByteCount = patch.stderrByteCount ?? Buffer.byteLength(stderrText ?? "", "utf8");
  const exitCode = patch.exitCode ?? 0;
  return deepFreeze({
    contractKind: "pure_read_only_git_observation_completion_contract",
    contractVersion: 1,
    boundaryId: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.boundaryId,
    sourceSpawnContractId: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.sourceSpawnContractId,
    sourceSpawnContractVersion: 1,
    sourceSpawnFingerprint: "a".repeat(64),
    boundarySessionId: "git-observation-session-001",
    purpose: "first_live_read_only_staging_preflight",
    capabilityPurpose: definition.purpose,
    capabilityIdentity,
    toolIdentity: "git",
    platform: "macos",
    policyId: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.policyId,
    policyVersion: 1,
    canonicalExecutablePath: "/usr/bin/git",
    fixedArgvIdentity: definition.fixedArgvIdentity,
    argv: definition.argv,
    workingDirectoryFingerprint: "b".repeat(64),
    observationSequenceIdentity: "git-observation-sequence-001",
    spawnAttemptId: "git-observation-spawn-attempt-001",
    evidenceTimestamp: "2026-07-19T12:00:00.000Z",
    provenanceClassification: "fixture_synthetic",
    fixtureLiveClassification: "fixture_only_not_live_observation",
    spawnAttempted: true,
    processCreated: true,
    processStartedObserved: true,
    spawnErrorObserved: false,
    exitObserved: true,
    exitCode,
    signalObserved: false,
    signal: null,
    closeObserved: true,
    closeCode: exitCode,
    closeSignal: null,
    completionTerminal: true,
    stdoutText,
    stderrText,
    stdoutByteCount,
    stderrByteCount,
    combinedByteCount: stdoutByteCount + stderrByteCount,
    utf8Valid: true,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    terminationRequested: false,
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
    stagingAuthorityGranted: false,
    deploymentAuthorityGranted: false,
    credentialAuthorityGranted: false,
    networkAuthorityGranted: false,
    mutationAuthorityGranted: false,
    authority: "none",
    ...patch,
  });
}

function validateInput(input: unknown): readonly GitObservationCompletionReason[] {
  const reasons: GitObservationCompletionReason[] = [];
  if (!isPlainRecord(input)) return ["input_contract_rejected"];
  if (!hasExactKeys(input, INPUT_KEYS)) reasons.push("unknown_field");
  const item = input as Partial<GitObservationCompletionInput>;
  if (item.contractKind !== "pure_read_only_git_observation_completion_contract"
    || item.contractVersion !== 1
    || item.boundaryId !== PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.boundaryId
    || item.policyId !== PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.policyId
    || item.policyVersion !== 1
  ) reasons.push("input_identity_rejected");
  if (item.sourceSpawnContractId !== PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.sourceSpawnContractId || item.sourceSpawnContractVersion !== 1 || !isSha256(item.sourceSpawnFingerprint)) reasons.push("source_spawn_identity_rejected");
  if (!isNonEmptyString(item.boundarySessionId) || item.purpose !== "first_live_read_only_staging_preflight" || !isSha256(item.workingDirectoryFingerprint) || !isNonEmptyString(item.observationSequenceIdentity)) reasons.push("source_linkage_rejected");
  if (!isCapability(item.capabilityIdentity) || item.capabilityPurpose !== (isCapability(item.capabilityIdentity) ? GIT_OBSERVATION_CAPABILITY_DEFINITIONS[item.capabilityIdentity].purpose : undefined)) reasons.push("capability_rejected");
  if (item.platform !== "macos") reasons.push("platform_rejected");
  if (item.toolIdentity !== "git") reasons.push("tool_rejected");
  if (item.canonicalExecutablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (!isCapability(item.capabilityIdentity) || item.fixedArgvIdentity !== GIT_OBSERVATION_CAPABILITY_DEFINITIONS[item.capabilityIdentity].fixedArgvIdentity || !sameArray(item.argv, GIT_OBSERVATION_CAPABILITY_DEFINITIONS[item.capabilityIdentity].argv)) reasons.push("argv_rejected");
  if (item.spawnAttempted !== true || item.processCreated !== true || item.processStartedObserved !== true || item.spawnErrorObserved !== false || item.exitObserved !== true || item.closeObserved !== true || item.completionTerminal !== true || item.settledExactlyOnce !== true) reasons.push("completion_state_rejected");
  if (!isCapability(item.capabilityIdentity) || typeof item.exitCode !== "number" || item.closeCode !== item.exitCode || !GIT_OBSERVATION_CAPABILITY_DEFINITIONS[item.capabilityIdentity].acceptedExitCodes.includes(item.exitCode as never)) reasons.push("exit_state_rejected");
  if (item.capabilityIdentity === "git_branch_state_v1" && item.exitCode === 1 && (item.stdoutText !== "" || item.stdoutByteCount !== 0)) reasons.push("exit_state_rejected");
  if (item.signalObserved !== false || item.signal !== null || item.closeSignal !== null) reasons.push("signal_rejected");
  if (item.stderrByteCount !== 0 || item.stderrText !== "") reasons.push("stderr_not_empty");
  if (item.stdoutOverflow !== false || item.stderrOverflow !== false || item.combinedOverflow !== false) reasons.push("output_overflow_rejected");
  if (item.utf8Valid !== true) reasons.push("invalid_encoding_rejected");
  if (item.stdoutStreamError !== false || item.stderrStreamError !== false || item.unexpectedStreamChunk !== false) reasons.push("stream_error_rejected");
  if (item.terminationRequested !== false) reasons.push("termination_state_rejected");
  if (item.retryCount !== 0 || item.fallbackAttempted !== false) reasons.push("retry_or_fallback_rejected");
  if (item.authority !== "none"
    || item.repositoryReadAuthorityGranted !== false
    || item.processAuthorityGranted !== false
    || item.observerAuthorityGranted !== false
    || item.cliExecutionAuthorityGranted !== false
    || item.compatibilityAuthorityGranted !== false
    || item.stagingAuthorityGranted !== false
    || item.deploymentAuthorityGranted !== false
    || item.credentialAuthorityGranted !== false
    || item.networkAuthorityGranted !== false
    || item.mutationAuthorityGranted !== false
  ) reasons.push("authority_rejected");
  if (item.runtimeActivated !== false) reasons.push("runtime_claim_rejected");
  if (item.observedLiveProcess !== false) reasons.push("live_claim_rejected");
  if (item.toctouEliminated !== false) reasons.push("toctou_claim_rejected");
  if (typeof item.stdoutText !== "string" || typeof item.stdoutByteCount !== "number" || item.stdoutByteCount !== Buffer.byteLength(item.stdoutText, "utf8") || (isCapability(item.capabilityIdentity) && item.stdoutByteCount > PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability[item.capabilityIdentity])) reasons.push("stdout_byte_count_rejected");
  if (typeof item.stderrText !== "string" || typeof item.stderrByteCount !== "number" || item.stderrByteCount !== Buffer.byteLength(item.stderrText, "utf8") || item.combinedByteCount !== (item.stdoutByteCount ?? 0) + (item.stderrByteCount ?? 0)) reasons.push("stderr_byte_count_rejected");
  if (typeof item.evidenceTimestamp !== "string" || Number.isNaN(Date.parse(item.evidenceTimestamp)) || typeof item.spawnAttemptId !== "string" || item.provenanceClassification !== "fixture_synthetic" || item.fixtureLiveClassification !== "fixture_only_not_live_observation") reasons.push("timestamp_rejected");
  return reasons.length === 0 ? [] : sortReasons(reasons);
}

function validateAcceptedEvidence(evidence: GitObservationCompletionEvidence): readonly GitObservationCompletionReason[] {
  const reasons: GitObservationCompletionReason[] = [];
  const inputProjection = Object.fromEntries(INPUT_KEYS.map((key) => [key, evidence[key]]));
  reasons.push(...validateInput(inputProjection));
  if (evidence.evidenceKind !== "pure_read_only_git_observation_completion_evidence"
    || evidence.evidenceVersion !== 1
    || evidence.contractId !== PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.contractId
    || evidence.contractIdentityFingerprint !== identityFingerprint()
    || evidence.policyFingerprint !== policyFingerprint()
    || evidence.evidenceFingerprintAlgorithm !== "sha256"
  ) reasons.push("input_identity_rejected");
  if (evidence.eligibleCompletion !== true) reasons.push("completion_state_rejected");
  if (!isCapability(evidence.capabilityIdentity) || evidence.stdoutLimitBytes !== PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability[evidence.capabilityIdentity]) reasons.push("stdout_byte_count_rejected");
  const expectedSourceOutputFingerprint = typeof evidence.stdoutText === "string" ? sha256("ture:pure-read-only-git-observation-completion:source-output:v1", evidence.stdoutText) : null;
  if (evidence.sourceOutputFingerprint !== expectedSourceOutputFingerprint) reasons.push("input_fingerprint_rejected");
  if (evidence.stderrEmpty !== true) reasons.push("stderr_not_empty");
  return reasons.length === 0 ? [] : sortReasons(reasons);
}

function buildCompletionResult(evidence: GitObservationCompletionEvidence | null, reasons: readonly GitObservationCompletionReason[]): GitObservationCompletionResult {
  const blockingReasons = sortReasons(reasons);
  const status: GitObservationCompletionStatus = evidence && blockingReasons.length === 1 && blockingReasons[0] === "accepted" ? "accepted_fixture_git_observation_completion" : "blocked_fail_closed";
  const base = deepFreeze({
    resultKind: "pure_read_only_git_observation_completion_result" as const,
    resultVersion: 1 as const,
    contractId: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY.contractId,
    status,
    fixtureOnly: true as const,
    observedLiveProcess: false as const,
    authoritativeLive: false as const,
    authority: "none" as const,
    runtimeActivated: false as const,
    blockingReasons,
    evidence,
    resultFingerprintAlgorithm: "sha256" as const,
  });
  return deepFreeze({
    ...base,
    resultFingerprint: buildResultFingerprint({ ...base, resultFingerprint: "" }),
  });
}

function validateEvidenceFingerprint(evidence: GitObservationCompletionEvidence): boolean {
  const withoutFingerprint = { ...evidence, evidenceFingerprint: undefined };
  delete withoutFingerprint.evidenceFingerprint;
  return evidence.evidenceFingerprint === sha256(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS.evidence, canonicalize(withoutFingerprint));
}

function buildResultFingerprint(result: Omit<GitObservationCompletionResult, "resultFingerprint"> & { resultFingerprint: string }): string {
  return sha256(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS.result, canonicalize({ ...result, resultFingerprint: "" }));
}

export function identityFingerprint(): string {
  return sha256(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS.identity, canonicalize(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY));
}

export function policyFingerprint(): string {
  return sha256(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS.policy, canonicalize(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY));
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function sameArray(value: unknown, expected: readonly string[]): boolean {
  return Array.isArray(value) && value.length === expected.length && value.every((item, index) => item === expected[index]);
}

function isCapability(value: unknown): value is GitObservationCapabilityIdentity {
  return value === "git_repository_root_v1" || value === "git_object_format_v1" || value === "git_head_object_v1" || value === "git_branch_state_v1";
}

function sortReasons(reasons: readonly GitObservationCompletionReason[]): readonly GitObservationCompletionReason[] {
  const unique = [...new Set(reasons.length === 0 ? ["accepted" as const] : reasons)];
  return deepFreeze(unique.sort((a, b) => REASON_ORDER.indexOf(a) - REASON_ORDER.indexOf(b)));
}
