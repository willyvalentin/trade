import { createHash } from "node:crypto";

import {
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY,
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY,
  buildPureRawProcessCompletionEvidence,
  type RawProcessCompletionEvidence,
  type RawProcessCompletionEvidenceInput,
  type RawProcessCompletionResult,
} from "@/lib/post-trade-pure-raw-process-completion-evidence-contract-core";

export const PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_git_version_interpretation_contract",
  contractId: "ture.execution.pure-git-version-interpretation-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.git-version-interpretation.fixture-boundary.v1",
  parserGrammarId: "ture.execution.git-version-grammar.strict-three-component-ascii.v1",
  parserGrammarVersion: 1,
  normalizationId: "ture.execution.git-version-normalization.optional-single-final-lf.v1",
  normalizationVersion: 1,
  sourceRawCompletionContractId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId,
  sourceRawCompletionContractVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  fixtureOnly: true,
  observedLiveProcess: false,
  authority: "none",
} as const);

export const PURE_GIT_VERSION_INTERPRETATION_POLICY = deepFreeze({
  policyId: "pure_git_version_interpretation_policy_v1",
  policyVersion: 1,
  acceptedTool: "git",
  acceptedPlatform: "macos",
  acceptedExecutable: "/usr/bin/git",
  acceptedArgvIdentity: "git_version_argv_v1",
  acceptedArgv: ["--version"] as const,
  acceptedCompletionCategory: "process_created_normal_zero_exit",
  acceptedStdoutPrefix: "git version ",
  finalLfNormalizationAllowed: true,
  stderrMustBeEmpty: true,
  asciiOnly: true,
  exactComponentCount: 3,
  maxComponentDigits: 5,
  maxComponentValue: 65535,
  suffixAllowed: false,
  semverDependencyAllowed: false,
  authorityGranted: "none",
} as const);

export const PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-git-version-interpretation-contract:identity:v1",
  policy: "ture:pure-git-version-interpretation-contract:policy:v1",
  sourceLinkage: "ture:pure-git-version-interpretation-contract:source-linkage:v1",
  originalStdout: "ture:pure-git-version-interpretation-contract:original-stdout:v1",
  normalizedStdout: "ture:pure-git-version-interpretation-contract:normalized-stdout:v1",
  evidence: "ture:pure-git-version-interpretation-contract:evidence:v1",
  result: "ture:pure-git-version-interpretation-contract:result:v1",
} as const);

export type PureGitVersionInterpretationReason =
  | "accepted"
  | "input_contract_rejected"
  | "input_fingerprint_rejected"
  | "source_spawn_identity_rejected"
  | "tool_rejected"
  | "executable_rejected"
  | "argv_rejected"
  | "completion_category_rejected"
  | "process_not_created"
  | "process_not_started"
  | "spawn_error_rejected"
  | "non_zero_exit"
  | "signal_termination"
  | "close_state_rejected"
  | "child_process_error_rejected"
  | "stdout_stream_error_rejected"
  | "stderr_stream_error_rejected"
  | "output_overflow_rejected"
  | "invalid_encoding_rejected"
  | "unexpected_chunk_rejected"
  | "termination_state_rejected"
  | "retry_or_fallback_rejected"
  | "security_posture_rejected"
  | "authority_rejected"
  | "live_claim_rejected"
  | "stderr_not_empty"
  | "stdout_empty"
  | "stdout_multiple_lines"
  | "prefix_rejected"
  | "whitespace_rejected"
  | "carriage_return_rejected"
  | "control_character_rejected"
  | "ansi_escape_rejected"
  | "nul_rejected"
  | "version_grammar_rejected"
  | "component_count_rejected"
  | "leading_zero_rejected"
  | "component_digit_length_rejected"
  | "component_range_rejected"
  | "suffix_rejected"
  | "output_byte_count_rejected"
  | "timestamp_rejected"
  | "unsupported_contract_identity";

export type PureGitVersionInterpretationEvidence = Readonly<{
  evidenceKind: "pure_git_version_interpretation_evidence";
  evidenceVersion: 1;
  contractId: typeof PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId;
  contractVersion: 1;
  boundaryId: typeof PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.boundaryId;
  parserGrammarId: typeof PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.parserGrammarId;
  parserGrammarVersion: 1;
  normalizationId: typeof PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.normalizationId;
  normalizationVersion: 1;
  sourceRawCompletionContractId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId | null;
  sourceRawCompletionContractVersion: 1 | null;
  sourceRawCompletionBoundaryId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId | null;
  sourceRawCompletionEvidenceFingerprint: string | null;
  sourceRawCompletionResultFingerprint: string | null;
  sourceSpawnFingerprint: string | null;
  sourceLinkageFingerprint: string | null;
  boundarySessionId: string | null;
  purpose: "first_live_read_only_staging_preflight" | null;
  toolIdentity: "git" | null;
  platform: "macos" | null;
  policyId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId | null;
  policyVersion: 1 | null;
  canonicalExecutablePath: "/usr/bin/git" | null;
  fixedArgvIdentity: "git_version_argv_v1" | null;
  argv: readonly ["--version"] | null;
  evidenceTimestamp: string | null;
  provenanceClassification: "fixture_synthetic" | null;
  fixtureLiveClassification: "fixture_only_not_live_observation" | null;
  status: "accepted" | "rejected";
  primaryReason: PureGitVersionInterpretationReason;
  reasons: readonly PureGitVersionInterpretationReason[];
  originalStdoutFingerprint: string | null;
  normalizedStdoutFingerprint: string | null;
  originalRawStdoutByteCount: number | null;
  finalLfRemoved: boolean;
  parsedVersion: string | null;
  major: number | null;
  minor: number | null;
  patch: number | null;
  componentCount: 0 | 3;
  suffixPresent: false;
  stderrEmpty: boolean;
  eligibleCompletion: boolean;
  observedLiveProcess: false;
  spawnAuthorityGranted: false;
  observerAuthorityGranted: false;
  cliExecutionAuthorityGranted: false;
  cliVersionAuthorityGranted: false;
  compatibilityAuthorityGranted: false;
  authorizationConsumed: false;
  credentialsUsed: false;
  networkUsed: false;
  runtimeActivated: false;
  deploymentAuthorityGranted: false;
  toctouEliminated: false;
  authority: "none";
  contractIdentityFingerprint: string;
  parserPolicyFingerprint: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type PureGitVersionInterpretationResult = Readonly<{
  resultKind: "pure_git_version_interpretation_result";
  resultVersion: 1;
  contractId: typeof PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId;
  status: "accepted_fixture_git_version_interpretation" | "blocked_fail_closed";
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  cliVersionInterpreted: boolean;
  runtimeActivated: false;
  blockingReasons: readonly PureGitVersionInterpretationReason[];
  evidence: PureGitVersionInterpretationEvidence;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

const RAW_RESULT_KEYS = [
  "resultKind",
  "resultVersion",
  "contractId",
  "status",
  "fixtureOnly",
  "observedLiveProcess",
  "authoritativeLive",
  "authority",
  "cliVersionInterpreted",
  "runtimeActivated",
  "blockingReasons",
  "evidence",
  "resultFingerprintAlgorithm",
  "resultFingerprint",
] as const;

const RAW_EVIDENCE_INPUT_KEYS = [
  "contractKind",
  "contractVersion",
  "boundaryId",
  "sourceSpawnContractId",
  "sourceSpawnContractVersion",
  "sourceSpawnFingerprint",
  "boundarySessionId",
  "purpose",
  "toolIdentity",
  "platform",
  "policyId",
  "policyVersion",
  "canonicalExecutablePath",
  "fixedArgvIdentity",
  "argv",
  "spawnAttemptId",
  "evidenceTimestamp",
  "provenanceClassification",
  "fixtureLiveClassification",
  "spawnAttempted",
  "processCreated",
  "spawnErrorObserved",
  "spawnErrorReason",
  "processStartedObserved",
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
  "stdoutByteCount",
  "stderrByteCount",
  "combinedByteCount",
  "stdoutText",
  "stderrText",
  "utf8Valid",
  "stdoutOverflow",
  "stderrOverflow",
  "combinedOverflow",
  "stdoutStreamError",
  "stderrStreamError",
  "unexpectedStreamChunk",
  "terminationRequested",
  "terminationSignal",
  "terminationRequestSucceeded",
  "processDeathConfirmed",
  "processDeathConfirmationSource",
  "lifecycleState",
  "eventOrderClassification",
  "terminalSettlementTimestamp",
  "settledExactlyOnce",
  "retryCount",
  "fallbackAttempted",
  "shellUsed",
  "pathLookupUsed",
  "inheritedEnvironmentUsed",
  "credentialsUsed",
  "networkUsed",
  "observerAuthorityGranted",
  "cliVersionInterpreted",
  "authorizationConsumed",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
] as const;

const RAW_EVIDENCE_GENERATED_KEYS = [
  "contractIdentityFingerprint",
  "policyFingerprint",
  "observedLiveProcess",
  "processHandleExposed",
  "processIdAuthority",
  "observerCapability",
  "cliVersionAuthority",
  "credentialAuthority",
  "networkAuthority",
  "apiAuthority",
  "uiAuthority",
  "runnerAuthority",
  "tradingAuthority",
  "avanzaAuthority",
  "persistenceAuthority",
  "deploymentAuthority",
  "evidenceFingerprintAlgorithm",
  "evidenceFingerprint",
] as const;

const RAW_EVIDENCE_KEYS = [...RAW_EVIDENCE_INPUT_KEYS, ...RAW_EVIDENCE_GENERATED_KEYS] as const;

const REASON_ORDER: readonly PureGitVersionInterpretationReason[] = [
  "input_contract_rejected",
  "unsupported_contract_identity",
  "input_fingerprint_rejected",
  "source_spawn_identity_rejected",
  "live_claim_rejected",
  "authority_rejected",
  "security_posture_rejected",
  "tool_rejected",
  "executable_rejected",
  "argv_rejected",
  "completion_category_rejected",
  "process_not_created",
  "process_not_started",
  "spawn_error_rejected",
  "child_process_error_rejected",
  "non_zero_exit",
  "signal_termination",
  "close_state_rejected",
  "stdout_stream_error_rejected",
  "stderr_stream_error_rejected",
  "output_overflow_rejected",
  "invalid_encoding_rejected",
  "unexpected_chunk_rejected",
  "termination_state_rejected",
  "retry_or_fallback_rejected",
  "stderr_not_empty",
  "output_byte_count_rejected",
  "timestamp_rejected",
  "nul_rejected",
  "control_character_rejected",
  "ansi_escape_rejected",
  "carriage_return_rejected",
  "stdout_multiple_lines",
  "stdout_empty",
  "prefix_rejected",
  "whitespace_rejected",
  "suffix_rejected",
  "version_grammar_rejected",
  "component_count_rejected",
  "leading_zero_rejected",
  "component_digit_length_rejected",
  "component_range_rejected",
  "accepted",
];

export function buildPureGitVersionInterpretation(input: unknown): PureGitVersionInterpretationResult {
  const raw = validateAndExtractRawCompletion(input);
  const reasons: PureGitVersionInterpretationReason[] = [...raw.reasons];
  const evidence = raw.evidence;
  if (evidence) {
    validateEligibleCompletion(evidence, reasons);
    if (reasons.length === 0) validateOutputPolicy(evidence, reasons);
  }
  const normalized = evidence && reasons.length === 0 ? normalizeAndParseStdout(evidence.stdoutText ?? "", reasons) : null;
  const accepted = evidence !== null && reasons.length === 0 && normalized !== null;
  return buildResult(buildEvidence(evidence, raw.resultFingerprint, accepted, sortedReasons(accepted ? ["accepted"] : reasons), normalized), accepted);
}

function validateAndExtractRawCompletion(input: unknown): { evidence: RawProcessCompletionEvidence | null; resultFingerprint: string | null; reasons: readonly PureGitVersionInterpretationReason[] } {
  const reasons: PureGitVersionInterpretationReason[] = [];
  if (!isPlainDataObject(input)) return { evidence: null, resultFingerprint: null, reasons: ["input_contract_rejected"] };
  if (!hasExactKeys(input, RAW_RESULT_KEYS)) reasons.push("input_contract_rejected");
  const result = input as Partial<RawProcessCompletionResult>;
  if (
    result.resultKind !== "pure_raw_process_completion_evidence_contract_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId
  ) reasons.push("unsupported_contract_identity");
  if (
    result.status !== "accepted_fixture_raw_completion_evidence"
    || result.fixtureOnly !== true
    || result.observedLiveProcess !== false
    || result.authoritativeLive !== false
    || result.authority !== "none"
    || result.cliVersionInterpreted !== false
    || result.runtimeActivated !== false
    || result.resultFingerprintAlgorithm !== "sha256"
    || !isSha256(result.resultFingerprint)
    || !Array.isArray(result.blockingReasons)
    || result.blockingReasons.length !== 1
    || result.blockingReasons[0] !== "accepted"
  ) reasons.push("input_contract_rejected");
  if (!isPlainDataObject(result.evidence) || !hasExactKeys(result.evidence, RAW_EVIDENCE_KEYS)) {
    reasons.push("input_contract_rejected");
    return { evidence: null, resultFingerprint: isSha256(result.resultFingerprint) ? result.resultFingerprint as string : null, reasons: sortedReasons(reasons) };
  }
  const extracted = extractRawEvidenceInput(result.evidence);
  const rebuilt = buildPureRawProcessCompletionEvidence(extracted);
  if (rebuilt.status !== "accepted_fixture_raw_completion_evidence" || rebuilt.evidence === null) {
    reasons.push("input_contract_rejected");
    return { evidence: null, resultFingerprint: isSha256(result.resultFingerprint) ? result.resultFingerprint as string : null, reasons: sortedReasons(reasons) };
  }
  if (
    rebuilt.resultFingerprint !== result.resultFingerprint
    || rebuilt.evidence.evidenceFingerprint !== (result.evidence as RawProcessCompletionEvidence).evidenceFingerprint
    || JSON.stringify(canonicalize(rebuilt.evidence)) !== JSON.stringify(canonicalize(result.evidence))
    || JSON.stringify(canonicalize(rebuilt)) !== JSON.stringify(canonicalize(result))
  ) reasons.push("input_fingerprint_rejected");
  return { evidence: reasons.length === 0 ? rebuilt.evidence : null, resultFingerprint: isSha256(result.resultFingerprint) ? result.resultFingerprint as string : null, reasons: sortedReasons(reasons) };
}

function validateEligibleCompletion(evidence: RawProcessCompletionEvidence, reasons: PureGitVersionInterpretationReason[]) {
  if (evidence.sourceSpawnContractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.sourceSpawnContractId || evidence.sourceSpawnContractVersion !== 1 || !isSha256(evidence.sourceSpawnFingerprint)) reasons.push("source_spawn_identity_rejected");
  if (evidence.toolIdentity !== "git") reasons.push("tool_rejected");
  if (evidence.canonicalExecutablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (evidence.fixedArgvIdentity !== "git_version_argv_v1" || !isExactVersionArgv(evidence.argv)) reasons.push("argv_rejected");
  if (evidence.completionCategory !== "process_created_normal_zero_exit" || evidence.completionReason !== "process_created_normal_zero_exit") reasons.push("completion_category_rejected");
  if (evidence.processCreated !== true) reasons.push("process_not_created");
  if (evidence.processStartedObserved !== true || evidence.spawnAttempted !== true) reasons.push("process_not_started");
  if (evidence.spawnErrorObserved !== false || evidence.spawnErrorReason !== "none") reasons.push("spawn_error_rejected");
  if (evidence.spawnErrorReason === "child_process_error") reasons.push("child_process_error_rejected");
  if (evidence.exitObserved !== true || evidence.exitCode !== 0) reasons.push("non_zero_exit");
  if (evidence.signalObserved !== false || evidence.signal !== null || evidence.closeSignal !== null) reasons.push("signal_termination");
  if (evidence.closeObserved !== true || evidence.closeCode !== 0 || evidence.completionTerminal !== true || evidence.lifecycleState !== "process_created_terminal_close_observed" || evidence.eventOrderClassification !== "spawn_then_exit_then_close" || evidence.settledExactlyOnce !== true) reasons.push("close_state_rejected");
  if (evidence.stdoutStreamError !== false) reasons.push("stdout_stream_error_rejected");
  if (evidence.stderrStreamError !== false) reasons.push("stderr_stream_error_rejected");
  if (evidence.stdoutOverflow || evidence.stderrOverflow || evidence.combinedOverflow) reasons.push("output_overflow_rejected");
  if (evidence.utf8Valid !== true || typeof evidence.stdoutText !== "string" || typeof evidence.stderrText !== "string") reasons.push("invalid_encoding_rejected");
  if (evidence.unexpectedStreamChunk !== false) reasons.push("unexpected_chunk_rejected");
  if (evidence.terminationRequested !== false || evidence.terminationSignal !== null || evidence.terminationRequestSucceeded !== null || evidence.processDeathConfirmed !== false || evidence.processDeathConfirmationSource !== "none") reasons.push("termination_state_rejected");
  if (evidence.retryCount !== 0 || evidence.fallbackAttempted !== false) reasons.push("retry_or_fallback_rejected");
  if (evidence.shellUsed || evidence.pathLookupUsed || evidence.inheritedEnvironmentUsed || evidence.credentialsUsed || evidence.networkUsed || evidence.authorizationConsumed || evidence.runtimeActivated) reasons.push("security_posture_rejected");
  if (evidence.observerAuthorityGranted || evidence.cliVersionInterpreted || evidence.authority !== "none" || evidence.toctouEliminated !== false) reasons.push("authority_rejected");
  if (evidence.observedLiveProcess !== false || evidence.provenanceClassification !== "fixture_synthetic" || evidence.fixtureLiveClassification !== "fixture_only_not_live_observation") reasons.push("live_claim_rejected");
  if (!isIsoTimestamp(evidence.evidenceTimestamp)) reasons.push("timestamp_rejected");
}

function validateOutputPolicy(evidence: RawProcessCompletionEvidence, reasons: PureGitVersionInterpretationReason[]) {
  const stdout = evidence.stdoutText ?? "";
  const stderr = evidence.stderrText ?? "";
  if (evidence.stderrByteCount !== 0 || stderr !== "") reasons.push("stderr_not_empty");
  if (Buffer.byteLength(stdout, "utf8") !== evidence.stdoutByteCount || Buffer.byteLength(stderr, "utf8") !== evidence.stderrByteCount || evidence.combinedByteCount !== evidence.stdoutByteCount + evidence.stderrByteCount) reasons.push("output_byte_count_rejected");
  if (stdout.length === 0) reasons.push("stdout_empty");
  if (stdout.includes("\0")) reasons.push("nul_rejected");
  if (/\x1B\[[0-?]*[ -/]*[@-~]/u.test(stdout)) reasons.push("ansi_escape_rejected");
  if (stdout.includes("\r")) reasons.push("carriage_return_rejected");
  if (/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u.test(stdout)) reasons.push("control_character_rejected");
  const lfCount = [...stdout].filter((char) => char === "\n").length;
  if (lfCount > 1 || (lfCount === 1 && !stdout.endsWith("\n"))) reasons.push("stdout_multiple_lines");
  const candidate = stdout.endsWith("\n") ? stdout.slice(0, -1) : stdout;
  if (candidate.length === 0) reasons.push("stdout_empty");
  if (!candidate.startsWith(PURE_GIT_VERSION_INTERPRETATION_POLICY.acceptedStdoutPrefix)) reasons.push("prefix_rejected");
  if (/^\s|\s$/u.test(candidate) || candidate.includes("\t")) reasons.push("whitespace_rejected");
  const token = candidate.slice(PURE_GIT_VERSION_INTERPRETATION_POLICY.acceptedStdoutPrefix.length);
  if (/[A-Za-z+-]/u.test(token) || token.includes("_")) reasons.push("suffix_rejected");
  if (!/^[0-9.]+$/u.test(token)) reasons.push("version_grammar_rejected");
}

function normalizeAndParseStdout(stdout: string, reasons: PureGitVersionInterpretationReason[]): { stdout: string; finalLfRemoved: boolean; major: number; minor: number; patch: number; parsedVersion: string } | null {
  const finalLfRemoved = stdout.endsWith("\n");
  const normalized = finalLfRemoved ? stdout.slice(0, -1) : stdout;
  const token = normalized.slice(PURE_GIT_VERSION_INTERPRETATION_POLICY.acceptedStdoutPrefix.length);
  const components = token.split(".");
  if (components.length !== 3) reasons.push("component_count_rejected");
  for (const component of components) {
    if (component.length === 0 || !/^[0-9]+$/u.test(component)) reasons.push("version_grammar_rejected");
    if (component.length > 1 && component.startsWith("0")) reasons.push("leading_zero_rejected");
    if (component.length > PURE_GIT_VERSION_INTERPRETATION_POLICY.maxComponentDigits) reasons.push("component_digit_length_rejected");
    const value = Number(component);
    if (!Number.isSafeInteger(value) || value > PURE_GIT_VERSION_INTERPRETATION_POLICY.maxComponentValue) reasons.push("component_range_rejected");
  }
  if (reasons.length > 0 || components.length !== 3) return null;
  const [major, minor, patch] = components.map((component) => Number(component)) as [number, number, number];
  return { stdout: normalized, finalLfRemoved, major, minor, patch, parsedVersion: `${major}.${minor}.${patch}` };
}

function buildEvidence(
  source: RawProcessCompletionEvidence | null,
  sourceRawCompletionResultFingerprint: string | null,
  accepted: boolean,
  reasons: readonly PureGitVersionInterpretationReason[],
  parsed: { stdout: string; finalLfRemoved: boolean; major: number; minor: number; patch: number; parsedVersion: string } | null,
): PureGitVersionInterpretationEvidence {
  const sourceLinkage = source ? {
    sourceRawCompletionEvidenceFingerprint: source.evidenceFingerprint,
    sourceRawCompletionResultContractId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId,
    sourceSpawnFingerprint: source.sourceSpawnFingerprint,
    boundarySessionId: source.boundarySessionId,
    purpose: source.purpose,
    toolIdentity: source.toolIdentity,
    canonicalExecutablePath: source.canonicalExecutablePath,
    fixedArgvIdentity: source.fixedArgvIdentity,
  } : null;
  const originalStdoutFingerprint = source && typeof source.stdoutText === "string" ? fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.originalStdout, { stdoutText: source.stdoutText, stdoutByteCount: source.stdoutByteCount }) : null;
  const normalizedStdoutFingerprint = parsed ? fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.normalizedStdout, { stdoutText: parsed.stdout }) : null;
  const core = {
    evidenceKind: "pure_git_version_interpretation_evidence",
    evidenceVersion: 1,
    contractId: PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId,
    contractVersion: 1,
    boundaryId: PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.boundaryId,
    parserGrammarId: PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.parserGrammarId,
    parserGrammarVersion: 1,
    normalizationId: PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.normalizationId,
    normalizationVersion: 1,
    sourceRawCompletionContractId: source ? PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId : null,
    sourceRawCompletionContractVersion: source ? 1 : null,
    sourceRawCompletionBoundaryId: source?.boundaryId ?? null,
    sourceRawCompletionEvidenceFingerprint: source?.evidenceFingerprint ?? null,
    sourceRawCompletionResultFingerprint,
    sourceSpawnFingerprint: source?.sourceSpawnFingerprint ?? null,
    sourceLinkageFingerprint: sourceLinkage ? fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.sourceLinkage, sourceLinkage) : null,
    boundarySessionId: source?.boundarySessionId ?? null,
    purpose: source?.purpose ?? null,
    toolIdentity: source?.toolIdentity ?? null,
    platform: source?.platform ?? null,
    policyId: source?.policyId ?? null,
    policyVersion: source?.policyVersion ?? null,
    canonicalExecutablePath: source?.canonicalExecutablePath ?? null,
    fixedArgvIdentity: source?.fixedArgvIdentity ?? null,
    argv: source?.argv ?? null,
    evidenceTimestamp: source?.evidenceTimestamp ?? null,
    provenanceClassification: source?.provenanceClassification ?? null,
    fixtureLiveClassification: source?.fixtureLiveClassification ?? null,
    status: accepted ? "accepted" : "rejected",
    primaryReason: reasons[0] ?? "input_contract_rejected",
    reasons,
    originalStdoutFingerprint,
    normalizedStdoutFingerprint,
    originalRawStdoutByteCount: source?.stdoutByteCount ?? null,
    finalLfRemoved: parsed?.finalLfRemoved ?? false,
    parsedVersion: parsed?.parsedVersion ?? null,
    major: parsed?.major ?? null,
    minor: parsed?.minor ?? null,
    patch: parsed?.patch ?? null,
    componentCount: parsed ? 3 : 0,
    suffixPresent: false,
    stderrEmpty: accepted,
    eligibleCompletion: accepted,
    observedLiveProcess: false,
    spawnAuthorityGranted: false,
    observerAuthorityGranted: false,
    cliExecutionAuthorityGranted: false,
    cliVersionAuthorityGranted: false,
    compatibilityAuthorityGranted: false,
    authorizationConsumed: false,
    credentialsUsed: false,
    networkUsed: false,
    runtimeActivated: false,
    deploymentAuthorityGranted: false,
    toctouEliminated: false,
    authority: "none",
    contractIdentityFingerprint: fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.identity, PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY),
    parserPolicyFingerprint: fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.policy, PURE_GIT_VERSION_INTERPRETATION_POLICY),
  } satisfies Omit<PureGitVersionInterpretationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return deepFreeze({
    ...core,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.evidence, core),
  } satisfies PureGitVersionInterpretationEvidence);
}

function buildResult(evidence: PureGitVersionInterpretationEvidence, accepted: boolean): PureGitVersionInterpretationResult {
  const core = {
    resultKind: "pure_git_version_interpretation_result",
    resultVersion: 1,
    contractId: PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId,
    status: accepted ? "accepted_fixture_git_version_interpretation" : "blocked_fail_closed",
    fixtureOnly: true,
    observedLiveProcess: false,
    authoritativeLive: false,
    authority: "none",
    cliVersionInterpreted: accepted,
    runtimeActivated: false,
    blockingReasons: accepted ? ["accepted"] : evidence.reasons,
    evidence,
  } satisfies Omit<PureGitVersionInterpretationResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.result, core),
  } satisfies PureGitVersionInterpretationResult);
}

function extractRawEvidenceInput(evidence: Record<string, unknown>): RawProcessCompletionEvidenceInput {
  return Object.fromEntries(RAW_EVIDENCE_INPUT_KEYS.map((key) => [key, evidence[key]])) as RawProcessCompletionEvidenceInput;
}

function hasExactKeys(input: Record<string, unknown>, keys: readonly string[]): boolean {
  const ownKeys = Object.keys(input).sort();
  const expected = [...keys].sort();
  return ownKeys.length === expected.length && ownKeys.every((key, index) => key === expected[index]);
}

function isPlainDataObject(input: unknown): input is Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return false;
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(input).length > 0) return false;
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") return false;
    if (descriptor.get || descriptor.set || !descriptor.enumerable) return false;
  }
  for (const key in input) if (!Object.prototype.hasOwnProperty.call(input, key)) return false;
  return !Object.values(input).some((value) => typeof value === "function");
}

function isExactVersionArgv(input: unknown): input is readonly ["--version"] {
  return Array.isArray(input)
    && Object.getPrototypeOf(input) === Array.prototype
    && input.length === 1
    && Object.prototype.hasOwnProperty.call(input, "0")
    && input[0] === "--version"
    && Object.getOwnPropertySymbols(input).length === 0
    && JSON.stringify(Object.getOwnPropertyNames(input).sort()) === JSON.stringify(["0", "length"]);
}

function isSha256(input: unknown): boolean {
  return typeof input === "string" && /^[a-f0-9]{64}$/u.test(input);
}

function isIsoTimestamp(input: unknown): boolean {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(input)) return false;
  const parsed = Date.parse(input);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === input;
}

function sortedReasons(input: readonly PureGitVersionInterpretationReason[]): readonly PureGitVersionInterpretationReason[] {
  const unique = [...new Set(input)];
  return REASON_ORDER.filter((reason) => unique.includes(reason));
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
