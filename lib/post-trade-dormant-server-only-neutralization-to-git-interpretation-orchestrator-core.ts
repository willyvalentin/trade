import { createHash } from "node:crypto";

import {
  DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_FINGERPRINT_DOMAINS,
  type SpawnToRawCompletionNeutralizationReason,
  type SpawnToRawCompletionNeutralizationResult,
} from "@/lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core";
import {
  PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY,
  PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS,
  PURE_GIT_VERSION_INTERPRETATION_POLICY,
  buildPureGitVersionInterpretation,
  type PureGitVersionInterpretationEvidence,
  type PureGitVersionInterpretationReason,
  type PureGitVersionInterpretationResult,
} from "@/lib/post-trade-pure-git-version-interpretation-contract-core";
import {
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY,
  buildPureRawProcessCompletionEvidence,
  type RawProcessCompletionCategory,
  type RawProcessCompletionEvidence,
  type RawProcessCompletionEvidenceInput,
  type RawProcessCompletionResult,
} from "@/lib/post-trade-pure-raw-process-completion-evidence-contract-core";

export const DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_IDENTITY = deepFreeze({
  contractKind: "dormant_neutralization_to_git_interpretation_orchestration_contract",
  contractId: "ture.execution.dormant-neutralization-to-git-interpretation-orchestration.server-only.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.dormant-neutralization-to-git-interpretation.server-only-boundary.v1",
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  dormant: true,
  serverOnlyWrapperRequired: true,
  authoritativeLive: false,
  authority: "none",
  runtimeActivated: false,
  compatibilityAuthorityGranted: false,
} as const);

export const DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_POLICY = deepFreeze({
  policyId: "dormant_neutralization_to_git_interpretation_orchestration_policy_v1",
  policyVersion: 1,
  acceptedPurpose: "first_live_read_only_staging_preflight",
  acceptedPlatform: "macos",
  acceptedToolIdentity: "git",
  acceptedExecutablePath: "/usr/bin/git",
  acceptedArgv: ["--version"] as const,
  acceptedNeutralizationAdapterId: DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY.adapterId,
  acceptedRawCompletionContractId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId,
  acceptedParserContractId: PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId,
  parserEligibleCompletionCategory: "process_created_normal_zero_exit",
  retryAllowed: false,
  fallbackAllowed: false,
  compatibilityEvaluationAllowed: false,
  runtimeActivationAllowed: false,
  authority: "none",
} as const);

export const DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:dormant-neutralization-to-git-interpretation-orchestrator:identity:v1",
  policy: "ture:dormant-neutralization-to-git-interpretation-orchestrator:policy:v1",
  linkage: "ture:dormant-neutralization-to-git-interpretation-orchestrator:linkage:v1",
  parsedVersion: "ture:dormant-neutralization-to-git-interpretation-orchestrator:parsed-version:v1",
  result: "ture:dormant-neutralization-to-git-interpretation-orchestrator:result:v1",
} as const);

export type DormantNeutralizationToGitInterpretationStatus =
  | "neutralization_rejected"
  | "neutralization_succeeded_interpretation_not_attempted"
  | "neutralization_succeeded_interpretation_rejected"
  | "neutralization_succeeded_interpretation_accepted";

export type DormantNeutralizationToGitInterpretationReason =
  | "input_rejected"
  | "production_provenance_rejected"
  | "already_consumed"
  | "neutralization_rejected"
  | "neutralization_internal_failure"
  | "raw_completion_ineligible_for_interpretation"
  | "interpretation_not_attempted"
  | "interpretation_rejected"
  | "interpretation_internal_failure"
  | "interpretation_accepted"
  | "source_linkage_rejected"
  | "raw_completion_linkage_rejected"
  | "interpretation_linkage_rejected"
  | "authority_rejected"
  | "runtime_claim_rejected"
  | "unexpected_internal_failure";

export type DormantNeutralizationToGitInterpretationResult = Readonly<{
  resultKind: "dormant_neutralization_to_git_interpretation_orchestration_result";
  resultVersion: 1;
  contractId: typeof DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_IDENTITY.contractId;
  boundaryId: typeof DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_IDENTITY.boundaryId;
  policyId: typeof DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_POLICY.policyId;
  policyVersion: 1;
  status: DormantNeutralizationToGitInterpretationStatus;
  reason: DormantNeutralizationToGitInterpretationReason;
  reasons: readonly DormantNeutralizationToGitInterpretationReason[];
  orchestrationTimestamp: string;
  sourceDirectSpawnContractId: string | null;
  sourceDirectSpawnContractVersion: 1 | null;
  sourceDirectSpawnResultFingerprint: string | null;
  sourceDirectSpawnEvidenceFingerprint: string | null;
  sourceDirectSpawnObservationFingerprint: string | null;
  sourceRevalidationFingerprint: string | null;
  boundarySessionId: string | null;
  purpose: "first_live_read_only_staging_preflight" | null;
  toolIdentity: "git" | null;
  platform: "macos" | null;
  policyIdentity: string | null;
  sourcePolicyVersion: 1 | null;
  executablePath: "/usr/bin/git" | null;
  argv: readonly ["--version"] | null;
  neutralizationAttempted: true;
  neutralizationStatus: SpawnToRawCompletionNeutralizationResult["status"] | null;
  neutralizationReason: SpawnToRawCompletionNeutralizationReason | null;
  neutralizationReasons: readonly SpawnToRawCompletionNeutralizationReason[];
  neutralizationResultFingerprint: string | null;
  rawCompletionResultFingerprint: string | null;
  rawCompletionEvidenceFingerprint: string | null;
  rawCompletionCategory: RawProcessCompletionCategory | null;
  interpretationAttempted: boolean;
  interpretationStatus: PureGitVersionInterpretationResult["status"] | null;
  interpretationReason: PureGitVersionInterpretationReason | null;
  interpretationReasons: readonly PureGitVersionInterpretationReason[];
  interpretationResultFingerprint: string | null;
  interpretationEvidenceFingerprint: string | null;
  parsedVersion: string | null;
  parsedVersionFingerprint: string | null;
  major: number | null;
  minor: number | null;
  patch: number | null;
  observedLiveProcess: false;
  processAuthorityGranted: false;
  observerAuthorityGranted: false;
  terminationAuthorityGranted: false;
  cliExecutionAuthorityGranted: false;
  gitVersionAuthorityGranted: false;
  compatibilityAuthorityGranted: false;
  credentialAuthorityGranted: false;
  networkAuthorityGranted: false;
  runtimeAuthorityGranted: false;
  tradingAuthorityGranted: false;
  persistenceAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  authorizationConsumed: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

type BuildInput = Readonly<{
  neutralizationResult: unknown;
  orchestrationTimestamp: string;
}>;

const NEUTRALIZATION_RESULT_KEYS = [
  "resultKind",
  "resultVersion",
  "adapterId",
  "status",
  "serverOnly",
  "dormant",
  "rawCompletionInvoked",
  "rawCompletionAccepted",
  "gitParserInvoked",
  "observedLiveProcess",
  "authoritativeLive",
  "authority",
  "blockingReasons",
  "sourceSpawnResultFingerprint",
  "sourceSpawnEvidenceFingerprint",
  "sourceSpawnObservationFingerprint",
  "neutralizationTimestamp",
  "rawCompletionResult",
  "resultFingerprintAlgorithm",
  "resultFingerprint",
] as const;

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

const INTERPRETATION_RESULT_KEYS = [
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

const INTERPRETATION_EVIDENCE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "contractId",
  "contractVersion",
  "boundaryId",
  "parserGrammarId",
  "parserGrammarVersion",
  "normalizationId",
  "normalizationVersion",
  "sourceRawCompletionContractId",
  "sourceRawCompletionContractVersion",
  "sourceRawCompletionBoundaryId",
  "sourceRawCompletionEvidenceFingerprint",
  "sourceRawCompletionResultFingerprint",
  "sourceSpawnFingerprint",
  "sourceLinkageFingerprint",
  "boundarySessionId",
  "purpose",
  "toolIdentity",
  "platform",
  "policyId",
  "policyVersion",
  "canonicalExecutablePath",
  "fixedArgvIdentity",
  "argv",
  "evidenceTimestamp",
  "provenanceClassification",
  "fixtureLiveClassification",
  "status",
  "primaryReason",
  "reasons",
  "originalStdoutFingerprint",
  "normalizedStdoutFingerprint",
  "originalRawStdoutByteCount",
  "finalLfRemoved",
  "parsedVersion",
  "major",
  "minor",
  "patch",
  "componentCount",
  "suffixPresent",
  "stderrEmpty",
  "eligibleCompletion",
  "observedLiveProcess",
  "spawnAuthorityGranted",
  "observerAuthorityGranted",
  "cliExecutionAuthorityGranted",
  "cliVersionAuthorityGranted",
  "compatibilityAuthorityGranted",
  "authorizationConsumed",
  "credentialsUsed",
  "networkUsed",
  "runtimeActivated",
  "deploymentAuthorityGranted",
  "toctouEliminated",
  "authority",
  "contractIdentityFingerprint",
  "parserPolicyFingerprint",
  "evidenceFingerprintAlgorithm",
  "evidenceFingerprint",
] as const;

const NEUTRALIZATION_REASONS: readonly SpawnToRawCompletionNeutralizationReason[] = [
  "accepted",
  "input_rejected",
  "production_provenance_rejected",
  "already_consumed",
  "source_contract_identity_rejected",
  "source_result_fingerprint_rejected",
  "source_revalidation_linkage_rejected",
  "session_rejected",
  "purpose_rejected",
  "tool_rejected",
  "platform_rejected",
  "policy_rejected",
  "executable_rejected",
  "argv_rejected",
  "source_state_rejected",
  "source_lifecycle_rejected",
  "source_output_rejected",
  "source_encoding_rejected",
  "source_termination_rejected",
  "source_authority_rejected",
  "source_live_claim_rejected",
  "stale_or_expired",
  "mapping_rejected",
  "raw_completion_builder_rejected",
  "unexpected_internal_failure",
];

const INTERPRETATION_REASONS: readonly PureGitVersionInterpretationReason[] = [
  "accepted",
  "input_contract_rejected",
  "input_fingerprint_rejected",
  "source_spawn_identity_rejected",
  "tool_rejected",
  "executable_rejected",
  "argv_rejected",
  "completion_category_rejected",
  "process_not_created",
  "process_not_started",
  "spawn_error_rejected",
  "non_zero_exit",
  "signal_termination",
  "close_state_rejected",
  "child_process_error_rejected",
  "stdout_stream_error_rejected",
  "stderr_stream_error_rejected",
  "output_overflow_rejected",
  "invalid_encoding_rejected",
  "unexpected_chunk_rejected",
  "termination_state_rejected",
  "retry_or_fallback_rejected",
  "security_posture_rejected",
  "authority_rejected",
  "live_claim_rejected",
  "stderr_not_empty",
  "stdout_empty",
  "stdout_multiple_lines",
  "prefix_rejected",
  "whitespace_rejected",
  "carriage_return_rejected",
  "control_character_rejected",
  "ansi_escape_rejected",
  "nul_rejected",
  "version_grammar_rejected",
  "component_count_rejected",
  "leading_zero_rejected",
  "component_digit_length_rejected",
  "component_range_rejected",
  "suffix_rejected",
  "output_byte_count_rejected",
  "timestamp_rejected",
  "unsupported_contract_identity",
];

export function buildDormantNeutralizationToGitInterpretationOrchestrationResult(input: BuildInput): DormantNeutralizationToGitInterpretationResult {
  try {
    if (!isIsoTimestamp(input.orchestrationTimestamp)) {
      return buildResult({
        orchestrationTimestamp: fallbackTimestamp(input.orchestrationTimestamp),
        status: "neutralization_rejected",
        reasons: ["input_rejected"],
        neutralization: null,
        rawCompletion: null,
        interpretation: null,
      });
    }
    const neutralizationValidation = validateNeutralizationResult(input.neutralizationResult);
    const neutralization = neutralizationValidation.neutralization;
    if (!neutralization) {
      return buildResult({
        orchestrationTimestamp: input.orchestrationTimestamp,
        status: "neutralization_rejected",
        reasons: neutralizationValidation.reasons,
        neutralization: null,
        rawCompletion: null,
        interpretation: null,
      });
    }
    if (neutralization.status !== "neutralized_raw_completion_ready" || !neutralization.rawCompletionResult) {
      return buildResult({
        orchestrationTimestamp: input.orchestrationTimestamp,
        status: "neutralization_rejected",
        reasons: mapNeutralizationReasons(neutralization.blockingReasons),
        neutralization,
        rawCompletion: neutralization.rawCompletionResult,
        interpretation: null,
      });
    }
    const rawValidationReasons = validateRawCompletionForOrchestration(neutralization.rawCompletionResult, neutralization);
    if (rawValidationReasons.length > 0) {
      return buildResult({
        orchestrationTimestamp: input.orchestrationTimestamp,
        status: "neutralization_rejected",
        reasons: rawValidationReasons,
        neutralization,
        rawCompletion: neutralization.rawCompletionResult,
        interpretation: null,
      });
    }
    const rawEvidence = neutralization.rawCompletionResult.evidence;
    if (!rawEvidence || !isParserEligible(rawEvidence)) {
      return buildResult({
        orchestrationTimestamp: input.orchestrationTimestamp,
        status: "neutralization_succeeded_interpretation_not_attempted",
        reasons: ["raw_completion_ineligible_for_interpretation", "interpretation_not_attempted"],
        neutralization,
        rawCompletion: neutralization.rawCompletionResult,
        interpretation: null,
      });
    }
    const interpretation = buildPureGitVersionInterpretation(neutralization.rawCompletionResult);
    const interpretationValidation = validateInterpretationForOrchestration(interpretation, neutralization.rawCompletionResult);
    if (interpretationValidation.length > 0) {
      return buildResult({
        orchestrationTimestamp: input.orchestrationTimestamp,
        status: "neutralization_succeeded_interpretation_rejected",
        reasons: interpretationValidation,
        neutralization,
        rawCompletion: neutralization.rawCompletionResult,
        interpretation,
      });
    }
    if (interpretation.status !== "accepted_fixture_git_version_interpretation") {
      return buildResult({
        orchestrationTimestamp: input.orchestrationTimestamp,
        status: "neutralization_succeeded_interpretation_rejected",
        reasons: ["interpretation_rejected"],
        neutralization,
        rawCompletion: neutralization.rawCompletionResult,
        interpretation,
      });
    }
    return buildResult({
      orchestrationTimestamp: input.orchestrationTimestamp,
      status: "neutralization_succeeded_interpretation_accepted",
      reasons: ["interpretation_accepted"],
      neutralization,
      rawCompletion: neutralization.rawCompletionResult,
      interpretation,
    });
  } catch {
    return buildResult({
      orchestrationTimestamp: fallbackTimestamp(input.orchestrationTimestamp),
      status: "neutralization_rejected",
      reasons: ["unexpected_internal_failure"],
      neutralization: null,
      rawCompletion: null,
      interpretation: null,
    });
  }
}

function validateNeutralizationResult(input: unknown): { neutralization: SpawnToRawCompletionNeutralizationResult | null; reasons: readonly DormantNeutralizationToGitInterpretationReason[] } {
  if (!isPlainDataObject(input) || !hasExactKeys(input, NEUTRALIZATION_RESULT_KEYS)) return { neutralization: null, reasons: ["input_rejected"] };
  const result = input as Partial<SpawnToRawCompletionNeutralizationResult>;
  const reasons: DormantNeutralizationToGitInterpretationReason[] = [];
  if (
    result.resultKind !== "dormant_server_only_spawn_to_raw_completion_neutralization_result"
    || result.resultVersion !== 1
    || result.adapterId !== DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY.adapterId
  ) reasons.push("neutralization_rejected");
  if (result.serverOnly !== true || result.dormant !== true) reasons.push("neutralization_rejected");
  if (result.observedLiveProcess !== false || result.authoritativeLive !== false || result.authority !== "none") reasons.push("authority_rejected");
  if (result.gitParserInvoked !== false) reasons.push("runtime_claim_rejected");
  if (result.resultFingerprintAlgorithm !== "sha256" || !isSha256(result.resultFingerprint)) reasons.push("neutralization_rejected");
  if (!isClosedReasonArray(result.blockingReasons, NEUTRALIZATION_REASONS)) reasons.push("neutralization_rejected");
  if (result.status !== "neutralized_raw_completion_ready" && result.status !== "blocked_fail_closed") reasons.push("neutralization_rejected");
  if (result.rawCompletionInvoked !== (result.rawCompletionResult !== null)) reasons.push("neutralization_rejected");
  if (result.rawCompletionAccepted !== (result.status === "neutralized_raw_completion_ready")) reasons.push("neutralization_rejected");
  if (result.status === "neutralized_raw_completion_ready") {
    if (result.rawCompletionResult === null || result.blockingReasons?.length !== 0) reasons.push("raw_completion_linkage_rejected");
    if (!isSha256(result.sourceSpawnResultFingerprint) || !isSha256(result.sourceSpawnEvidenceFingerprint) || !isSha256(result.sourceSpawnObservationFingerprint)) reasons.push("source_linkage_rejected");
    if (!isIsoTimestamp(result.neutralizationTimestamp)) reasons.push("neutralization_rejected");
  }
  if (result.status === "blocked_fail_closed") {
    if (result.blockingReasons?.length === 0) reasons.push("neutralization_rejected");
    if (result.rawCompletionAccepted !== false) reasons.push("neutralization_rejected");
    if (result.rawCompletionResult?.status === "accepted_fixture_raw_completion_evidence") reasons.push("raw_completion_linkage_rejected");
  }
  if (result.rawCompletionResult !== null && !isPlainDataObject(result.rawCompletionResult)) reasons.push("raw_completion_linkage_rejected");
  if (isSha256(result.resultFingerprint) && result.resultFingerprint !== fingerprint(DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_FINGERPRINT_DOMAINS.result, stripGeneratedFingerprint(result))) reasons.push("neutralization_rejected");
  return { neutralization: reasons.length === 0 ? input as SpawnToRawCompletionNeutralizationResult : null, reasons: sortedReasons(reasons) };
}

function validateRawCompletionForOrchestration(
  rawCompletion: RawProcessCompletionResult,
  neutralization: SpawnToRawCompletionNeutralizationResult,
): readonly DormantNeutralizationToGitInterpretationReason[] {
  const reasons: DormantNeutralizationToGitInterpretationReason[] = [];
  if (!isPlainDataObject(rawCompletion) || !hasExactKeys(rawCompletion, RAW_RESULT_KEYS) || rawCompletion.status !== "accepted_fixture_raw_completion_evidence" || rawCompletion.fixtureOnly !== true) reasons.push("raw_completion_linkage_rejected");
  if (rawCompletion.observedLiveProcess !== false || rawCompletion.authoritativeLive !== false || rawCompletion.authority !== "none") reasons.push("authority_rejected");
  if (rawCompletion.cliVersionInterpreted !== false || rawCompletion.runtimeActivated !== false) reasons.push("runtime_claim_rejected");
  if (rawCompletion.resultFingerprintAlgorithm !== "sha256" || !isSha256(rawCompletion.resultFingerprint)) reasons.push("raw_completion_linkage_rejected");
  if (rawCompletion.resultKind !== "pure_raw_process_completion_evidence_contract_result" || rawCompletion.resultVersion !== 1 || rawCompletion.contractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId) reasons.push("raw_completion_linkage_rejected");
  if (rawCompletion.resultFingerprint !== neutralization.rawCompletionResult?.resultFingerprint) reasons.push("raw_completion_linkage_rejected");
  const evidence = rawCompletion.evidence;
  if (!isPlainDataObject(evidence) || !hasExactKeys(evidence, RAW_EVIDENCE_KEYS)) return sortedReasons([...reasons, "raw_completion_linkage_rejected"]);
  if (evidence.contractKind !== "pure_raw_process_completion_evidence_contract" || evidence.contractVersion !== 1 || evidence.boundaryId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId) reasons.push("raw_completion_linkage_rejected");
  if (evidence.sourceSpawnFingerprint !== neutralization.sourceSpawnResultFingerprint) reasons.push("source_linkage_rejected");
  if (evidence.evidenceFingerprint !== neutralization.rawCompletionResult?.evidence?.evidenceFingerprint) reasons.push("raw_completion_linkage_rejected");
  const rebuiltRawCompletion = buildPureRawProcessCompletionEvidence(extractRawEvidenceInput(evidence));
  if (
    rebuiltRawCompletion.status !== "accepted_fixture_raw_completion_evidence"
    || rebuiltRawCompletion.resultFingerprint !== rawCompletion.resultFingerprint
    || rebuiltRawCompletion.evidence?.evidenceFingerprint !== evidence.evidenceFingerprint
    || canonicalString(rebuiltRawCompletion) !== canonicalString(rawCompletion)
  ) reasons.push("raw_completion_linkage_rejected");
  if (evidence.observedLiveProcess !== false || evidence.authority !== "none" || evidence.toctouEliminated !== false) reasons.push("authority_rejected");
  if (evidence.runtimeActivated !== false || evidence.cliVersionInterpreted !== false || evidence.authorizationConsumed !== false) reasons.push("runtime_claim_rejected");
  if (evidence.boundarySessionId.length === 0 || evidence.purpose !== "first_live_read_only_staging_preflight" || evidence.toolIdentity !== "git" || evidence.platform !== "macos") reasons.push("source_linkage_rejected");
  if (evidence.canonicalExecutablePath !== "/usr/bin/git" || evidence.fixedArgvIdentity !== "git_version_argv_v1" || !isExactArgv(evidence.argv)) reasons.push("source_linkage_rejected");
  return sortedReasons(reasons);
}

function validateInterpretationForOrchestration(
  interpretation: PureGitVersionInterpretationResult,
  rawCompletion: RawProcessCompletionResult,
): readonly DormantNeutralizationToGitInterpretationReason[] {
  const reasons: DormantNeutralizationToGitInterpretationReason[] = [];
  if (!isPlainDataObject(interpretation) || !hasExactKeys(interpretation, INTERPRETATION_RESULT_KEYS) || interpretation.resultKind !== "pure_git_version_interpretation_result" || interpretation.resultVersion !== 1 || interpretation.contractId !== PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId) reasons.push("interpretation_linkage_rejected");
  if (interpretation.fixtureOnly !== true || interpretation.observedLiveProcess !== false || interpretation.authoritativeLive !== false || interpretation.authority !== "none") reasons.push("authority_rejected");
  if (interpretation.runtimeActivated !== false) reasons.push("runtime_claim_rejected");
  if (interpretation.resultFingerprintAlgorithm !== "sha256" || !isSha256(interpretation.resultFingerprint)) reasons.push("interpretation_linkage_rejected");
  if (!isClosedReasonArray(interpretation.blockingReasons, INTERPRETATION_REASONS)) reasons.push("interpretation_linkage_rejected");
  const evidence = interpretation.evidence;
  if (!isPlainDataObject(evidence) || !hasExactKeys(evidence, INTERPRETATION_EVIDENCE_KEYS)) return sortedReasons([...reasons, "interpretation_linkage_rejected"]);
  if (
    evidence.evidenceKind !== "pure_git_version_interpretation_evidence"
    || evidence.evidenceVersion !== 1
    || evidence.contractId !== PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId
    || evidence.contractVersion !== 1
    || evidence.boundaryId !== PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.boundaryId
    || evidence.parserGrammarId !== PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.parserGrammarId
    || evidence.parserGrammarVersion !== 1
    || evidence.normalizationId !== PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.normalizationId
    || evidence.normalizationVersion !== 1
  ) reasons.push("interpretation_linkage_rejected");
  if (evidence.sourceRawCompletionResultFingerprint !== rawCompletion.resultFingerprint) reasons.push("interpretation_linkage_rejected");
  if (evidence.sourceRawCompletionContractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId || evidence.sourceRawCompletionContractVersion !== 1 || evidence.sourceRawCompletionBoundaryId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId) reasons.push("interpretation_linkage_rejected");
  if (evidence.sourceRawCompletionEvidenceFingerprint !== rawCompletion.evidence?.evidenceFingerprint) reasons.push("interpretation_linkage_rejected");
  if (evidence.sourceSpawnFingerprint !== rawCompletion.evidence?.sourceSpawnFingerprint) reasons.push("interpretation_linkage_rejected");
  if (evidence.toolIdentity !== rawCompletion.evidence?.toolIdentity || evidence.boundarySessionId !== rawCompletion.evidence?.boundarySessionId || evidence.purpose !== rawCompletion.evidence?.purpose || evidence.platform !== rawCompletion.evidence?.platform || evidence.policyId !== rawCompletion.evidence?.policyId || evidence.policyVersion !== rawCompletion.evidence?.policyVersion) reasons.push("interpretation_linkage_rejected");
  if (evidence.canonicalExecutablePath !== rawCompletion.evidence?.canonicalExecutablePath || evidence.fixedArgvIdentity !== rawCompletion.evidence?.fixedArgvIdentity || !isExactArgv(evidence.argv)) reasons.push("interpretation_linkage_rejected");
  if (evidence.originalRawStdoutByteCount !== rawCompletion.evidence?.stdoutByteCount) reasons.push("interpretation_linkage_rejected");
  if (evidence.contractIdentityFingerprint !== fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.identity, PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY)) reasons.push("interpretation_linkage_rejected");
  if (evidence.parserPolicyFingerprint !== fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.policy, PURE_GIT_VERSION_INTERPRETATION_POLICY)) reasons.push("interpretation_linkage_rejected");
  if (evidence.sourceLinkageFingerprint !== expectedInterpretationSourceLinkageFingerprint(evidence)) reasons.push("interpretation_linkage_rejected");
  if (evidence.originalStdoutFingerprint !== expectedOriginalStdoutFingerprint(rawCompletion.evidence ?? null)) reasons.push("interpretation_linkage_rejected");
  if (evidence.normalizedStdoutFingerprint !== expectedNormalizedStdoutFingerprint(evidence.parsedVersion)) reasons.push("interpretation_linkage_rejected");
  if (evidence.evidenceFingerprintAlgorithm !== "sha256" || evidence.evidenceFingerprint !== fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.evidence, stripGeneratedFingerprint(evidence))) reasons.push("interpretation_linkage_rejected");
  if (interpretation.resultFingerprint !== fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.result, stripGeneratedFingerprint(interpretation))) reasons.push("interpretation_linkage_rejected");
  if (evidence.observedLiveProcess !== false || evidence.authority !== "none" || evidence.toctouEliminated !== false || evidence.compatibilityAuthorityGranted !== false || evidence.deploymentAuthorityGranted !== false) reasons.push("authority_rejected");
  if (evidence.runtimeActivated !== false || evidence.authorizationConsumed !== false || evidence.credentialsUsed !== false || evidence.networkUsed !== false) reasons.push("runtime_claim_rejected");
  if (interpretation.status === "accepted_fixture_git_version_interpretation") {
    if (evidence.status !== "accepted" || evidence.primaryReason !== "accepted" || interpretation.blockingReasons.length !== 1 || interpretation.blockingReasons[0] !== "accepted" || interpretation.cliVersionInterpreted !== true) reasons.push("interpretation_linkage_rejected");
    if (typeof evidence.parsedVersion !== "string" || !/^\d+\.\d+\.\d+$/u.test(evidence.parsedVersion) || evidence.major === null || evidence.minor === null || evidence.patch === null) reasons.push("interpretation_linkage_rejected");
    if (evidence.componentCount !== 3 || evidence.suffixPresent !== false || evidence.eligibleCompletion !== true || evidence.stderrEmpty !== true) reasons.push("interpretation_linkage_rejected");
    if (evidence.parsedVersion !== `${evidence.major}.${evidence.minor}.${evidence.patch}`) reasons.push("interpretation_linkage_rejected");
  } else if (interpretation.status === "blocked_fail_closed") {
    if (interpretation.blockingReasons.includes("accepted") || interpretation.cliVersionInterpreted !== false) reasons.push("interpretation_linkage_rejected");
    if (evidence.status !== "rejected" || evidence.primaryReason === "accepted") reasons.push("interpretation_linkage_rejected");
    if (evidence.parsedVersion !== null || evidence.major !== null || evidence.minor !== null || evidence.patch !== null || evidence.componentCount !== 0 || evidence.eligibleCompletion !== false) reasons.push("interpretation_linkage_rejected");
  } else {
    reasons.push("interpretation_linkage_rejected");
  }
  return sortedReasons(reasons);
}

function isParserEligible(evidence: NonNullable<RawProcessCompletionResult["evidence"]>): boolean {
  return evidence.completionCategory === DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_POLICY.parserEligibleCompletionCategory
    && evidence.toolIdentity === "git"
    && evidence.canonicalExecutablePath === "/usr/bin/git"
    && isExactArgv(evidence.argv)
    && evidence.processCreated === true
    && evidence.processStartedObserved === true
    && evidence.exitObserved === true
    && evidence.exitCode === 0
    && evidence.closeObserved === true
    && evidence.closeCode === 0
    && evidence.signalObserved === false
    && evidence.signal === null
    && evidence.closeSignal === null
    && evidence.stdoutStreamError === false
    && evidence.stderrStreamError === false
    && evidence.stdoutOverflow === false
    && evidence.stderrOverflow === false
    && evidence.combinedOverflow === false
    && evidence.utf8Valid === true
    && evidence.unexpectedStreamChunk === false
    && evidence.terminationRequested === false
    && evidence.retryCount === 0
    && evidence.fallbackAttempted === false
    && evidence.observedLiveProcess === false
    && evidence.authority === "none"
    && evidence.runtimeActivated === false
    && evidence.toctouEliminated === false;
}

function buildResult(input: Readonly<{
  orchestrationTimestamp: string;
  status: DormantNeutralizationToGitInterpretationStatus;
  reasons: readonly DormantNeutralizationToGitInterpretationReason[];
  neutralization: SpawnToRawCompletionNeutralizationResult | null;
  rawCompletion: RawProcessCompletionResult | null;
  interpretation: PureGitVersionInterpretationResult | null;
}>): DormantNeutralizationToGitInterpretationResult {
  const rawEvidence = input.rawCompletion?.evidence ?? null;
  const interpretationEvidence = input.interpretation?.evidence ?? null;
  const reasons = sortedReasons(input.reasons);
  const parsedVersion = input.status === "neutralization_succeeded_interpretation_accepted" ? interpretationEvidence?.parsedVersion ?? null : null;
  const parsedVersionFingerprint = parsedVersion
    ? fingerprint(DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_FINGERPRINT_DOMAINS.parsedVersion, {
      parsedVersion,
      major: interpretationEvidence?.major ?? null,
      minor: interpretationEvidence?.minor ?? null,
      patch: interpretationEvidence?.patch ?? null,
    })
    : null;
  const core = {
    resultKind: "dormant_neutralization_to_git_interpretation_orchestration_result",
    resultVersion: 1,
    contractId: DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_IDENTITY.contractId,
    boundaryId: DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_IDENTITY.boundaryId,
    policyId: DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_POLICY.policyId,
    policyVersion: 1,
    status: input.status,
    reason: reasons[0] ?? "unexpected_internal_failure",
    reasons,
    orchestrationTimestamp: input.orchestrationTimestamp,
    sourceDirectSpawnContractId: rawEvidence?.sourceSpawnContractId ?? null,
    sourceDirectSpawnContractVersion: rawEvidence?.sourceSpawnContractVersion ?? null,
    sourceDirectSpawnResultFingerprint: input.neutralization?.sourceSpawnResultFingerprint ?? rawEvidence?.sourceSpawnFingerprint ?? null,
    sourceDirectSpawnEvidenceFingerprint: input.neutralization?.sourceSpawnEvidenceFingerprint ?? null,
    sourceDirectSpawnObservationFingerprint: input.neutralization?.sourceSpawnObservationFingerprint ?? null,
    sourceRevalidationFingerprint: null,
    boundarySessionId: rawEvidence?.boundarySessionId ?? null,
    purpose: rawEvidence?.purpose ?? null,
    toolIdentity: rawEvidence?.toolIdentity ?? null,
    platform: rawEvidence?.platform ?? null,
    policyIdentity: rawEvidence?.policyId ?? null,
    sourcePolicyVersion: rawEvidence?.policyVersion ?? null,
    executablePath: rawEvidence?.canonicalExecutablePath ?? null,
    argv: rawEvidence?.argv ?? null,
    neutralizationAttempted: true,
    neutralizationStatus: input.neutralization?.status ?? null,
    neutralizationReason: input.neutralization?.blockingReasons[0] ?? (input.neutralization?.status === "neutralized_raw_completion_ready" ? "accepted" : null),
    neutralizationReasons: input.neutralization?.blockingReasons ?? [],
    neutralizationResultFingerprint: input.neutralization?.resultFingerprint ?? null,
    rawCompletionResultFingerprint: input.rawCompletion?.resultFingerprint ?? null,
    rawCompletionEvidenceFingerprint: rawEvidence?.evidenceFingerprint ?? null,
    rawCompletionCategory: rawEvidence?.completionCategory ?? null,
    interpretationAttempted: input.interpretation !== null,
    interpretationStatus: input.interpretation?.status ?? null,
    interpretationReason: input.interpretation?.blockingReasons[0] ?? null,
    interpretationReasons: input.interpretation?.blockingReasons ?? [],
    interpretationResultFingerprint: input.interpretation?.resultFingerprint ?? null,
    interpretationEvidenceFingerprint: interpretationEvidence?.evidenceFingerprint ?? null,
    parsedVersion,
    parsedVersionFingerprint,
    major: parsedVersion ? interpretationEvidence?.major ?? null : null,
    minor: parsedVersion ? interpretationEvidence?.minor ?? null : null,
    patch: parsedVersion ? interpretationEvidence?.patch ?? null : null,
    observedLiveProcess: false,
    processAuthorityGranted: false,
    observerAuthorityGranted: false,
    terminationAuthorityGranted: false,
    cliExecutionAuthorityGranted: false,
    gitVersionAuthorityGranted: false,
    compatibilityAuthorityGranted: false,
    credentialAuthorityGranted: false,
    networkAuthorityGranted: false,
    runtimeAuthorityGranted: false,
    tradingAuthorityGranted: false,
    persistenceAuthorityGranted: false,
    deploymentAuthorityGranted: false,
    authorizationConsumed: false,
    runtimeActivated: false,
    toctouEliminated: false,
    authority: "none",
  } satisfies Omit<DormantNeutralizationToGitInterpretationResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_FINGERPRINT_DOMAINS.result, core),
  } satisfies DormantNeutralizationToGitInterpretationResult);
}

function mapNeutralizationReasons(input: readonly SpawnToRawCompletionNeutralizationReason[]): readonly DormantNeutralizationToGitInterpretationReason[] {
  if (input.includes("production_provenance_rejected")) return ["production_provenance_rejected"];
  if (input.includes("already_consumed")) return ["already_consumed"];
  if (input.includes("source_result_fingerprint_rejected") || input.includes("source_revalidation_linkage_rejected") || input.includes("session_rejected") || input.includes("purpose_rejected") || input.includes("tool_rejected") || input.includes("platform_rejected") || input.includes("policy_rejected") || input.includes("executable_rejected") || input.includes("argv_rejected")) return ["source_linkage_rejected"];
  if (input.includes("source_authority_rejected") || input.includes("source_live_claim_rejected")) return ["authority_rejected"];
  if (input.includes("raw_completion_builder_rejected")) return ["raw_completion_linkage_rejected"];
  if (input.includes("unexpected_internal_failure")) return ["neutralization_internal_failure"];
  return ["neutralization_rejected"];
}

function sortedReasons(input: readonly DormantNeutralizationToGitInterpretationReason[]): readonly DormantNeutralizationToGitInterpretationReason[] {
  const unique = [...new Set(input)];
  const order: readonly DormantNeutralizationToGitInterpretationReason[] = [
    "input_rejected",
    "production_provenance_rejected",
    "already_consumed",
    "neutralization_rejected",
    "source_linkage_rejected",
    "raw_completion_linkage_rejected",
    "authority_rejected",
    "runtime_claim_rejected",
    "neutralization_internal_failure",
    "raw_completion_ineligible_for_interpretation",
    "interpretation_not_attempted",
    "interpretation_rejected",
    "interpretation_linkage_rejected",
    "interpretation_internal_failure",
    "interpretation_accepted",
    "unexpected_internal_failure",
  ];
  return order.filter((reason) => unique.includes(reason));
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isPlainDataObject(input: unknown): input is Record<string, unknown> {
  if (!isRecord(input)) return false;
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

function hasExactKeys(input: Record<string, unknown>, keys: readonly string[]): boolean {
  const ownKeys = Object.keys(input).sort();
  const expected = [...keys].sort();
  return ownKeys.length === expected.length && ownKeys.every((key, index) => key === expected[index]);
}

function isClosedReasonArray<T extends string>(input: unknown, allowed: readonly T[]): input is readonly T[] {
  return Array.isArray(input)
    && Object.getPrototypeOf(input) === Array.prototype
    && Object.getOwnPropertySymbols(input).length === 0
    && input.every((reason) => typeof reason === "string" && allowed.includes(reason as T));
}

function isExactArgv(input: unknown): input is readonly ["--version"] {
  if (!Array.isArray(input)) return false;
  if (Object.getPrototypeOf(input) !== Array.prototype) return false;
  if (input.length !== 1) return false;
  if (!Object.prototype.hasOwnProperty.call(input, "0")) return false;
  if (input[0] !== "--version") return false;
  if (Object.getOwnPropertySymbols(input).length > 0) return false;
  const descriptors = Object.getOwnPropertyDescriptors(input);
  if (descriptors["0"]?.get || descriptors["0"]?.set) return false;
  return JSON.stringify(Object.getOwnPropertyNames(input).sort()) === JSON.stringify(["0", "length"]);
}

function isSha256(input: unknown): input is string {
  return typeof input === "string" && /^[a-f0-9]{64}$/u.test(input);
}

function isIsoTimestamp(input: unknown): input is string {
  if (typeof input !== "string") return false;
  const parsed = Date.parse(input);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === input;
}

function fallbackTimestamp(input: unknown): string {
  return typeof input === "string" && isIsoTimestamp(input) ? input : "1970-01-01T00:00:00.000Z";
}

function fingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(canonicalize(input))}`).digest("hex");
}

function canonicalString(input: unknown): string {
  return JSON.stringify(canonicalize(input));
}

function stripGeneratedFingerprint<T extends Record<string, unknown>>(input: T): Omit<T, "resultFingerprintAlgorithm" | "resultFingerprint" | "evidenceFingerprintAlgorithm" | "evidenceFingerprint"> {
  const core = { ...input };
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  delete core.evidenceFingerprintAlgorithm;
  delete core.evidenceFingerprint;
  return core;
}

function extractRawEvidenceInput(evidence: RawProcessCompletionEvidence): RawProcessCompletionEvidenceInput {
  return Object.fromEntries(RAW_EVIDENCE_INPUT_KEYS.map((key) => [key, evidence[key]])) as RawProcessCompletionEvidenceInput;
}

function expectedInterpretationSourceLinkageFingerprint(evidence: PureGitVersionInterpretationEvidence): string | null {
  if (
    evidence.sourceRawCompletionEvidenceFingerprint === null
    || evidence.sourceSpawnFingerprint === null
    || evidence.boundarySessionId === null
    || evidence.purpose === null
    || evidence.toolIdentity === null
    || evidence.canonicalExecutablePath === null
    || evidence.fixedArgvIdentity === null
  ) return null;
  return fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.sourceLinkage, {
    sourceRawCompletionEvidenceFingerprint: evidence.sourceRawCompletionEvidenceFingerprint,
    sourceRawCompletionResultContractId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId,
    sourceSpawnFingerprint: evidence.sourceSpawnFingerprint,
    boundarySessionId: evidence.boundarySessionId,
    purpose: evidence.purpose,
    toolIdentity: evidence.toolIdentity,
    canonicalExecutablePath: evidence.canonicalExecutablePath,
    fixedArgvIdentity: evidence.fixedArgvIdentity,
  });
}

function expectedOriginalStdoutFingerprint(evidence: RawProcessCompletionEvidence | null): string | null {
  if (!evidence || typeof evidence.stdoutText !== "string") return null;
  return fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.originalStdout, {
    stdoutText: evidence.stdoutText,
    stdoutByteCount: evidence.stdoutByteCount,
  });
}

function expectedNormalizedStdoutFingerprint(parsedVersion: string | null): string | null {
  if (parsedVersion === null) return null;
  return fingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.normalizedStdout, {
    stdoutText: `${PURE_GIT_VERSION_INTERPRETATION_POLICY.acceptedStdoutPrefix}${parsedVersion}`,
  });
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
