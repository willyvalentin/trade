import { createHash } from "node:crypto";

import {
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY,
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY,
  buildPureRawProcessCompletionEvidence,
  type RawProcessCompletionEvidence,
  type RawProcessCompletionEvidenceInput,
  type RawProcessCompletionResult,
} from "@/lib/post-trade-pure-raw-process-completion-evidence-contract-core";

export const PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_apple_git_version_interpretation_contract",
  contractId: "ture.execution.pure-apple-git-version-interpretation-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.apple-git-version-interpretation.fixture-boundary.v1",
  parserGrammarId: "ture.execution.apple-git-version-grammar.exact-upstream-three-component-apple-build-integer.v1",
  parserGrammarVersion: 1,
  normalizationId: "ture.execution.apple-git-version-normalization.optional-single-final-lf.v1",
  normalizationVersion: 1,
  vendorIdentity: "apple-git",
  sourceRawCompletionContractId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId,
  sourceRawCompletionContractVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  fixtureOnly: true,
  observedLiveProcess: false,
  authority: "none",
} as const);

export const PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY = deepFreeze({
  policyId: "pure_apple_git_version_interpretation_policy_v1",
  policyVersion: 1,
  acceptedTool: "git",
  acceptedPlatform: "macos",
  acceptedExecutable: "/usr/bin/git",
  acceptedArgvIdentity: "git_version_argv_v1",
  acceptedArgv: ["--version"] as const,
  acceptedCompletionCategory: "process_created_normal_zero_exit",
  acceptedStdoutPrefix: "git version ",
  acceptedVendorLabel: "Apple Git",
  acceptedVendorPrefix: " (Apple Git-",
  acceptedVendorSuffix: ")",
  finalLfNormalizationAllowed: true,
  stderrMustBeEmpty: true,
  asciiOnly: true,
  upstreamExactComponentCount: 3,
  upstreamMaxComponentDigits: 5,
  upstreamMaxComponentValue: 65535,
  appleBuildComponentCount: 1,
  appleBuildMaxDigits: 8,
  appleBuildMaxValue: 99999999,
  authorityGranted: "none",
} as const);

export const PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-apple-git-version-interpretation-contract:identity:v1",
  policy: "ture:pure-apple-git-version-interpretation-contract:policy:v1",
  sourceLinkage: "ture:pure-apple-git-version-interpretation-contract:source-linkage:v1",
  originalStdout: "ture:pure-apple-git-version-interpretation-contract:original-stdout:v1",
  normalizedStdout: "ture:pure-apple-git-version-interpretation-contract:normalized-stdout:v1",
  appleBuildMetadata: "ture:pure-apple-git-version-interpretation-contract:apple-build-metadata:v1",
  evidence: "ture:pure-apple-git-version-interpretation-contract:evidence:v1",
  result: "ture:pure-apple-git-version-interpretation-contract:result:v1",
} as const);

export type PureAppleGitVersionInterpretationReason =
  | "accepted"
  | "input_contract_rejected"
  | "input_identity_rejected"
  | "input_fingerprint_rejected"
  | "input_status_rejected"
  | "source_spawn_identity_rejected"
  | "source_linkage_rejected"
  | "platform_rejected"
  | "tool_rejected"
  | "executable_rejected"
  | "argv_rejected"
  | "completion_category_rejected"
  | "completion_state_rejected"
  | "output_overflow_rejected"
  | "invalid_encoding_rejected"
  | "stream_error_rejected"
  | "termination_state_rejected"
  | "retry_or_fallback_rejected"
  | "authority_rejected"
  | "runtime_claim_rejected"
  | "live_claim_rejected"
  | "toctou_claim_rejected"
  | "stderr_not_empty"
  | "stdout_empty"
  | "stdout_byte_count_rejected"
  | "stdout_multiple_lines"
  | "whitespace_rejected"
  | "carriage_return_rejected"
  | "nul_rejected"
  | "control_character_rejected"
  | "ansi_escape_rejected"
  | "prefix_rejected"
  | "apple_suffix_rejected"
  | "vendor_label_rejected"
  | "parentheses_rejected"
  | "upstream_version_grammar_rejected"
  | "upstream_leading_zero_rejected"
  | "upstream_component_digit_length_rejected"
  | "upstream_component_range_rejected"
  | "apple_build_grammar_rejected"
  | "apple_build_leading_zero_rejected"
  | "apple_build_digit_length_rejected"
  | "apple_build_range_rejected"
  | "unexpected_extra_text";

export type PureAppleGitVersionInterpretationEvidence = Readonly<{
  evidenceKind: "pure_apple_git_version_interpretation_evidence";
  evidenceVersion: 1;
  contractId: typeof PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId;
  contractVersion: 1;
  boundaryId: typeof PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.boundaryId;
  parserGrammarId: typeof PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.parserGrammarId;
  parserGrammarVersion: 1;
  normalizationId: typeof PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.normalizationId;
  normalizationVersion: 1;
  vendorIdentity: typeof PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.vendorIdentity;
  sourceRawCompletionContractId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId | null;
  sourceRawCompletionContractVersion: 1 | null;
  sourceRawCompletionBoundaryId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId | null;
  sourceRawCompletionEvidenceFingerprint: string | null;
  sourceRawCompletionResultFingerprint: string | null;
  sourceSpawnContractId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.sourceSpawnContractId | null;
  sourceSpawnContractVersion: 1 | null;
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
  sourceEvidenceTimestamp: string | null;
  provenanceClassification: "fixture_synthetic" | null;
  fixtureLiveClassification: "fixture_only_not_live_observation" | null;
  status: "accepted" | "rejected";
  primaryReason: PureAppleGitVersionInterpretationReason;
  reasons: readonly PureAppleGitVersionInterpretationReason[];
  originalStdoutFingerprint: string | null;
  normalizedStdoutFingerprint: string | null;
  originalRawStdoutByteCount: number | null;
  normalizedStdoutByteCount: number | null;
  finalLfRemoved: boolean;
  stderrEmpty: boolean;
  eligibleCompletion: boolean;
  upstreamVersionString: string | null;
  upstreamMajor: number | null;
  upstreamMinor: number | null;
  upstreamPatch: number | null;
  upstreamComponentCount: 0 | 3;
  upstreamSuffixPresent: false;
  vendorSuffixPresent: boolean;
  appleVendorLabel: "Apple Git" | null;
  appleBuildString: string | null;
  appleBuildNumber: number | null;
  appleBuildComponentCount: 0 | 1;
  appleBuildMetadataFingerprint: string | null;
  observedLiveProcess: false;
  processAuthorityGranted: false;
  observerAuthorityGranted: false;
  cliExecutionAuthorityGranted: false;
  gitVersionAuthorityGranted: false;
  compatibilityAuthorityGranted: false;
  runtimeAuthorityGranted: false;
  stagingAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  credentialAuthorityGranted: false;
  networkAuthorityGranted: false;
  authorizationConsumed: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  contractIdentityFingerprint: string;
  parserPolicyFingerprint: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type PureAppleGitVersionInterpretationResult = Readonly<{
  resultKind: "pure_apple_git_version_interpretation_result";
  resultVersion: 1;
  contractId: typeof PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId;
  status: "accepted_fixture_apple_git_version_interpretation" | "blocked_fail_closed";
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  appleGitVersionInterpreted: boolean;
  compatibilityAuthorityGranted: false;
  runtimeActivated: false;
  blockingReasons: readonly PureAppleGitVersionInterpretationReason[];
  evidence: PureAppleGitVersionInterpretationEvidence;
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

const REASON_ORDER: readonly PureAppleGitVersionInterpretationReason[] = [
  "input_contract_rejected",
  "input_identity_rejected",
  "input_status_rejected",
  "input_fingerprint_rejected",
  "source_spawn_identity_rejected",
  "source_linkage_rejected",
  "platform_rejected",
  "live_claim_rejected",
  "authority_rejected",
  "runtime_claim_rejected",
  "toctou_claim_rejected",
  "tool_rejected",
  "executable_rejected",
  "argv_rejected",
  "completion_category_rejected",
  "completion_state_rejected",
  "stream_error_rejected",
  "output_overflow_rejected",
  "invalid_encoding_rejected",
  "termination_state_rejected",
  "retry_or_fallback_rejected",
  "stderr_not_empty",
  "stdout_byte_count_rejected",
  "nul_rejected",
  "control_character_rejected",
  "ansi_escape_rejected",
  "carriage_return_rejected",
  "stdout_multiple_lines",
  "stdout_empty",
  "prefix_rejected",
  "whitespace_rejected",
  "parentheses_rejected",
  "vendor_label_rejected",
  "apple_suffix_rejected",
  "unexpected_extra_text",
  "upstream_version_grammar_rejected",
  "upstream_leading_zero_rejected",
  "upstream_component_digit_length_rejected",
  "upstream_component_range_rejected",
  "apple_build_grammar_rejected",
  "apple_build_leading_zero_rejected",
  "apple_build_digit_length_rejected",
  "apple_build_range_rejected",
  "accepted",
];

type ParsedAppleGitVersion = Readonly<{
  normalizedStdout: string;
  finalLfRemoved: boolean;
  upstreamVersionString: string;
  upstreamMajor: number;
  upstreamMinor: number;
  upstreamPatch: number;
  appleVendorLabel: "Apple Git";
  appleBuildString: string;
  appleBuildNumber: number;
}>;

export function buildPureAppleGitVersionInterpretation(input: unknown): PureAppleGitVersionInterpretationResult {
  const raw = validateAndExtractRawCompletion(input);
  const reasons: PureAppleGitVersionInterpretationReason[] = [...raw.reasons];
  const evidence = raw.evidence;
  let completionEligible = false;
  if (evidence) {
    validateEligibleCompletion(evidence, reasons);
    completionEligible = reasons.length === 0;
    if (completionEligible) validateOutputPolicy(evidence, reasons);
  }
  const parsed = evidence && reasons.length === 0 ? normalizeAndParseAppleStdout(evidence.stdoutText ?? "", reasons) : null;
  const accepted = evidence !== null && reasons.length === 0 && parsed !== null;
  return buildResult(buildEvidence(evidence, raw.resultFingerprint, accepted, sortedReasons(accepted ? ["accepted"] : reasons), parsed, completionEligible), accepted);
}

function validateAndExtractRawCompletion(input: unknown): { evidence: RawProcessCompletionEvidence | null; resultFingerprint: string | null; reasons: readonly PureAppleGitVersionInterpretationReason[] } {
  const reasons: PureAppleGitVersionInterpretationReason[] = [];
  if (!isPlainDataObject(input)) return { evidence: null, resultFingerprint: null, reasons: ["input_contract_rejected"] };
  if (!hasExactKeys(input, RAW_RESULT_KEYS)) reasons.push("input_contract_rejected");
  const result = input as Partial<RawProcessCompletionResult>;
  if (
    result.resultKind !== "pure_raw_process_completion_evidence_contract_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId
  ) reasons.push("input_identity_rejected");
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
  ) reasons.push("input_status_rejected");
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

function validateEligibleCompletion(evidence: RawProcessCompletionEvidence, reasons: PureAppleGitVersionInterpretationReason[]) {
  if (evidence.sourceSpawnContractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.sourceSpawnContractId || evidence.sourceSpawnContractVersion !== 1 || !isSha256(evidence.sourceSpawnFingerprint)) reasons.push("source_spawn_identity_rejected");
  if (!isSha256(evidence.evidenceFingerprint) || !isSha256(evidence.policyFingerprint) || !isSha256(evidence.contractIdentityFingerprint)) reasons.push("source_linkage_rejected");
  if (evidence.platform !== "macos") reasons.push("platform_rejected");
  if (evidence.toolIdentity !== "git") reasons.push("tool_rejected");
  if (evidence.canonicalExecutablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (evidence.fixedArgvIdentity !== "git_version_argv_v1" || !isExactVersionArgv(evidence.argv)) reasons.push("argv_rejected");
  if (evidence.completionCategory !== "process_created_normal_zero_exit" || evidence.completionReason !== "process_created_normal_zero_exit") reasons.push("completion_category_rejected");
  if (
    evidence.processCreated !== true
    || evidence.processStartedObserved !== true
    || evidence.spawnAttempted !== true
    || evidence.spawnErrorObserved !== false
    || evidence.spawnErrorReason !== "none"
    || evidence.exitObserved !== true
    || evidence.exitCode !== 0
    || evidence.signalObserved !== false
    || evidence.signal !== null
    || evidence.closeObserved !== true
    || evidence.closeCode !== 0
    || evidence.closeSignal !== null
    || evidence.completionTerminal !== true
    || evidence.lifecycleState !== "process_created_terminal_close_observed"
    || evidence.eventOrderClassification !== "spawn_then_exit_then_close"
    || evidence.settledExactlyOnce !== true
  ) reasons.push("completion_state_rejected");
  if (evidence.stdoutStreamError !== false || evidence.stderrStreamError !== false) reasons.push("stream_error_rejected");
  if (evidence.stdoutOverflow || evidence.stderrOverflow || evidence.combinedOverflow) reasons.push("output_overflow_rejected");
  if (evidence.utf8Valid !== true || typeof evidence.stdoutText !== "string" || typeof evidence.stderrText !== "string") reasons.push("invalid_encoding_rejected");
  if (evidence.unexpectedStreamChunk !== false) reasons.push("stream_error_rejected");
  if (evidence.terminationRequested !== false || evidence.terminationSignal !== null || evidence.terminationRequestSucceeded !== null || evidence.processDeathConfirmed !== false || evidence.processDeathConfirmationSource !== "none") reasons.push("termination_state_rejected");
  if (evidence.retryCount !== 0 || evidence.fallbackAttempted !== false) reasons.push("retry_or_fallback_rejected");
  if (evidence.observerAuthorityGranted || evidence.cliVersionInterpreted || evidence.authority !== "none") reasons.push("authority_rejected");
  if (evidence.runtimeActivated !== false) reasons.push("runtime_claim_rejected");
  if (evidence.toctouEliminated !== false) reasons.push("toctou_claim_rejected");
  if (evidence.shellUsed || evidence.pathLookupUsed || evidence.inheritedEnvironmentUsed || evidence.credentialsUsed || evidence.networkUsed || evidence.authorizationConsumed) reasons.push("authority_rejected");
  if (evidence.observedLiveProcess !== false || evidence.provenanceClassification !== "fixture_synthetic" || evidence.fixtureLiveClassification !== "fixture_only_not_live_observation") reasons.push("live_claim_rejected");
}

function validateOutputPolicy(evidence: RawProcessCompletionEvidence, reasons: PureAppleGitVersionInterpretationReason[]) {
  const stdout = evidence.stdoutText ?? "";
  const stderr = evidence.stderrText ?? "";
  if (evidence.stderrByteCount !== 0 || stderr !== "") reasons.push("stderr_not_empty");
  if (Buffer.byteLength(stdout, "utf8") !== evidence.stdoutByteCount || Buffer.byteLength(stderr, "utf8") !== evidence.stderrByteCount || evidence.combinedByteCount !== evidence.stdoutByteCount + evidence.stderrByteCount) reasons.push("stdout_byte_count_rejected");
  if (stdout.length === 0) reasons.push("stdout_empty");
  if (stdout.includes("\0")) reasons.push("nul_rejected");
  if (/\x1B\[[0-?]*[ -/]*[@-~]/u.test(stdout)) reasons.push("ansi_escape_rejected");
  if (stdout.includes("\r")) reasons.push("carriage_return_rejected");
  if (/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u.test(stdout)) reasons.push("control_character_rejected");
  const lfCount = [...stdout].filter((char) => char === "\n").length;
  if (lfCount > 1 || (lfCount === 1 && !stdout.endsWith("\n"))) reasons.push("stdout_multiple_lines");
  const candidate = stdout.endsWith("\n") ? stdout.slice(0, -1) : stdout;
  if (candidate.length === 0) reasons.push("stdout_empty");
  if (!candidate.startsWith(PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY.acceptedStdoutPrefix)) reasons.push("prefix_rejected");
  if (/^\s|\s$/u.test(candidate) || candidate.includes("\t")) reasons.push("whitespace_rejected");
}

function normalizeAndParseAppleStdout(stdout: string, reasons: PureAppleGitVersionInterpretationReason[]): ParsedAppleGitVersion | null {
  const finalLfRemoved = stdout.endsWith("\n");
  const normalizedStdout = finalLfRemoved ? stdout.slice(0, -1) : stdout;
  const prefix = PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY.acceptedStdoutPrefix;
  if (!normalizedStdout.startsWith(prefix)) return null;
  const token = normalizedStdout.slice(prefix.length);
  const match = token.match(/^([0-9.]+) \((Apple Git)-([0-9]+)\)$/u);
  if (!token.includes("(") || !token.includes(")")) reasons.push("parentheses_rejected");
  if (!token.includes(PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY.acceptedVendorLabel)) reasons.push("vendor_label_rejected");
  const hasExactAppleSuffixShape = /^[0-9.]+ \(Apple Git-.*\)$/u.test(token);
  if (!hasExactAppleSuffixShape) reasons.push("apple_suffix_rejected");
  if (match === null) {
    if (hasExactAppleSuffixShape) reasons.push("apple_build_grammar_rejected");
    if (/[^\d. ()A-Za-z-]/u.test(token)) reasons.push("unexpected_extra_text");
    if (!/^[0-9.]+ \([A-Za-z ]+-[0-9]+\)$/u.test(token)) reasons.push("unexpected_extra_text");
    return null;
  }
  const upstream = match[1];
  const build = match[3];
  validateUpstream(upstream, reasons);
  validateAppleBuild(build, reasons);
  if (reasons.length > 0) return null;
  const [upstreamMajor, upstreamMinor, upstreamPatch] = upstream.split(".").map((part) => Number(part)) as [number, number, number];
  return {
    normalizedStdout,
    finalLfRemoved,
    upstreamVersionString: `${upstreamMajor}.${upstreamMinor}.${upstreamPatch}`,
    upstreamMajor,
    upstreamMinor,
    upstreamPatch,
    appleVendorLabel: "Apple Git",
    appleBuildString: String(Number(build)),
    appleBuildNumber: Number(build),
  };
}

function validateUpstream(input: string, reasons: PureAppleGitVersionInterpretationReason[]) {
  const components = input.split(".");
  if (components.length !== 3) reasons.push("upstream_version_grammar_rejected");
  for (const component of components) {
    if (component.length === 0 || !/^[0-9]+$/u.test(component)) reasons.push("upstream_version_grammar_rejected");
    if (component.length > 1 && component.startsWith("0")) reasons.push("upstream_leading_zero_rejected");
    if (component.length > PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY.upstreamMaxComponentDigits) reasons.push("upstream_component_digit_length_rejected");
    const value = Number(component);
    if (!Number.isSafeInteger(value) || value > PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY.upstreamMaxComponentValue) reasons.push("upstream_component_range_rejected");
  }
}

function validateAppleBuild(input: string, reasons: PureAppleGitVersionInterpretationReason[]) {
  if (!/^[0-9]+$/u.test(input)) reasons.push("apple_build_grammar_rejected");
  if (input.length > 1 && input.startsWith("0")) reasons.push("apple_build_leading_zero_rejected");
  if (input.length > PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY.appleBuildMaxDigits) reasons.push("apple_build_digit_length_rejected");
  const value = Number(input);
  if (!Number.isSafeInteger(value) || value > PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY.appleBuildMaxValue) reasons.push("apple_build_range_rejected");
}

function buildEvidence(
  source: RawProcessCompletionEvidence | null,
  sourceRawCompletionResultFingerprint: string | null,
  accepted: boolean,
  reasons: readonly PureAppleGitVersionInterpretationReason[],
  parsed: ParsedAppleGitVersion | null,
  completionEligible: boolean,
): PureAppleGitVersionInterpretationEvidence {
  const sourceLinkage = source ? {
    sourceRawCompletionEvidenceFingerprint: source.evidenceFingerprint,
    sourceRawCompletionResultFingerprint,
    sourceSpawnContractId: source.sourceSpawnContractId,
    sourceSpawnFingerprint: source.sourceSpawnFingerprint,
    boundarySessionId: source.boundarySessionId,
    purpose: source.purpose,
    platform: source.platform,
    policyId: source.policyId,
    canonicalExecutablePath: source.canonicalExecutablePath,
    fixedArgvIdentity: source.fixedArgvIdentity,
    argv: source.argv,
  } : null;
  const originalStdoutFingerprint = source && typeof source.stdoutText === "string" ? fingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.originalStdout, { stdoutText: source.stdoutText, stdoutByteCount: source.stdoutByteCount }) : null;
  const normalizedStdoutFingerprint = parsed ? fingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.normalizedStdout, { stdoutText: parsed.normalizedStdout, stdoutByteCount: Buffer.byteLength(parsed.normalizedStdout, "utf8") }) : null;
  const appleBuildMetadataFingerprint = parsed ? fingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.appleBuildMetadata, { vendorIdentity: "apple-git", appleVendorLabel: parsed.appleVendorLabel, appleBuildString: parsed.appleBuildString, appleBuildNumber: parsed.appleBuildNumber }) : null;
  const core = {
    evidenceKind: "pure_apple_git_version_interpretation_evidence",
    evidenceVersion: 1,
    contractId: PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId,
    contractVersion: 1,
    boundaryId: PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.boundaryId,
    parserGrammarId: PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.parserGrammarId,
    parserGrammarVersion: 1,
    normalizationId: PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.normalizationId,
    normalizationVersion: 1,
    vendorIdentity: PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.vendorIdentity,
    sourceRawCompletionContractId: source ? PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId : null,
    sourceRawCompletionContractVersion: source ? 1 : null,
    sourceRawCompletionBoundaryId: source?.boundaryId ?? null,
    sourceRawCompletionEvidenceFingerprint: source?.evidenceFingerprint ?? null,
    sourceRawCompletionResultFingerprint,
    sourceSpawnContractId: source?.sourceSpawnContractId ?? null,
    sourceSpawnContractVersion: source?.sourceSpawnContractVersion ?? null,
    sourceSpawnFingerprint: source?.sourceSpawnFingerprint ?? null,
    sourceLinkageFingerprint: sourceLinkage ? fingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.sourceLinkage, sourceLinkage) : null,
    boundarySessionId: source?.boundarySessionId ?? null,
    purpose: source?.purpose ?? null,
    toolIdentity: source?.toolIdentity ?? null,
    platform: source?.platform ?? null,
    policyId: source?.policyId ?? null,
    policyVersion: source?.policyVersion ?? null,
    canonicalExecutablePath: source?.canonicalExecutablePath ?? null,
    fixedArgvIdentity: source?.fixedArgvIdentity ?? null,
    argv: source?.argv ?? null,
    sourceEvidenceTimestamp: source?.evidenceTimestamp ?? null,
    provenanceClassification: source?.provenanceClassification ?? null,
    fixtureLiveClassification: source?.fixtureLiveClassification ?? null,
    status: accepted ? "accepted" : "rejected",
    primaryReason: reasons[0] ?? "input_contract_rejected",
    reasons,
    originalStdoutFingerprint,
    normalizedStdoutFingerprint,
    originalRawStdoutByteCount: source?.stdoutByteCount ?? null,
    normalizedStdoutByteCount: parsed ? Buffer.byteLength(parsed.normalizedStdout, "utf8") : null,
    finalLfRemoved: parsed?.finalLfRemoved ?? false,
    stderrEmpty: accepted,
    eligibleCompletion: completionEligible,
    upstreamVersionString: parsed?.upstreamVersionString ?? null,
    upstreamMajor: parsed?.upstreamMajor ?? null,
    upstreamMinor: parsed?.upstreamMinor ?? null,
    upstreamPatch: parsed?.upstreamPatch ?? null,
    upstreamComponentCount: parsed ? 3 : 0,
    upstreamSuffixPresent: false,
    vendorSuffixPresent: parsed !== null,
    appleVendorLabel: parsed?.appleVendorLabel ?? null,
    appleBuildString: parsed?.appleBuildString ?? null,
    appleBuildNumber: parsed?.appleBuildNumber ?? null,
    appleBuildComponentCount: parsed ? 1 : 0,
    appleBuildMetadataFingerprint,
    observedLiveProcess: false,
    processAuthorityGranted: false,
    observerAuthorityGranted: false,
    cliExecutionAuthorityGranted: false,
    gitVersionAuthorityGranted: false,
    compatibilityAuthorityGranted: false,
    runtimeAuthorityGranted: false,
    stagingAuthorityGranted: false,
    deploymentAuthorityGranted: false,
    credentialAuthorityGranted: false,
    networkAuthorityGranted: false,
    authorizationConsumed: false,
    runtimeActivated: false,
    toctouEliminated: false,
    authority: "none",
    contractIdentityFingerprint: fingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.identity, PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY),
    parserPolicyFingerprint: fingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.policy, PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY),
  } satisfies Omit<PureAppleGitVersionInterpretationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return deepFreeze({
    ...core,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.evidence, core),
  } satisfies PureAppleGitVersionInterpretationEvidence);
}

function buildResult(evidence: PureAppleGitVersionInterpretationEvidence, accepted: boolean): PureAppleGitVersionInterpretationResult {
  const core = {
    resultKind: "pure_apple_git_version_interpretation_result",
    resultVersion: 1,
    contractId: PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId,
    status: accepted ? "accepted_fixture_apple_git_version_interpretation" : "blocked_fail_closed",
    fixtureOnly: true,
    observedLiveProcess: false,
    authoritativeLive: false,
    authority: "none",
    appleGitVersionInterpreted: accepted,
    compatibilityAuthorityGranted: false,
    runtimeActivated: false,
    blockingReasons: accepted ? ["accepted"] : evidence.reasons,
    evidence,
  } satisfies Omit<PureAppleGitVersionInterpretationResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.result, core),
  } satisfies PureAppleGitVersionInterpretationResult);
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

function sortedReasons(input: readonly PureAppleGitVersionInterpretationReason[]): readonly PureAppleGitVersionInterpretationReason[] {
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
