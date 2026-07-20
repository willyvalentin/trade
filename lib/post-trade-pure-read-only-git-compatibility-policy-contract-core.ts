import { createHash } from "node:crypto";

import {
  PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY,
  PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS,
  PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY,
  type PureAppleGitVersionInterpretationEvidence,
  type PureAppleGitVersionInterpretationResult,
} from "@/lib/post-trade-pure-apple-git-version-interpretation-contract-core";
import {
  PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY,
  PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS,
  PURE_GIT_VERSION_INTERPRETATION_POLICY,
  type PureGitVersionInterpretationEvidence,
  type PureGitVersionInterpretationResult,
} from "@/lib/post-trade-pure-git-version-interpretation-contract-core";
import {
  canonicalize,
  deepFreeze,
  hasExactKeys,
  isPlainRecord,
  isSha256,
} from "@/lib/post-trade-pure-read-only-git-observation-completion-contract-core";
import { PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY, PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY } from "@/lib/post-trade-pure-raw-process-completion-evidence-contract-core";

export const PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_read_only_git_compatibility_policy_contract",
  contractId: "ture.execution.pure-read-only-git-compatibility-policy-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.read-only-git-compatibility-policy.fixture-boundary.v1",
  purpose: "first_live_read_only_staging_preflight",
  fixtureOnly: true,
  observedLiveProcess: false,
  authority: "none",
} as const);

export const PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY = deepFreeze({
  policyId: "ture.execution.read-only-git-observation-compatibility-policy.v1",
  policyVersion: 1,
  capabilitySetId: "ture.execution.read-only-git-repository-observation-capability-set.v1",
  capabilitySetVersion: 1,
  semanticBaselineId: "ture.execution.git-semantic-baseline.2-39-0.major-2.v1",
  implementationFamilyPolicyId: "ture.execution.git-implementation-families.upstream-and-apple.v1",
  minimumVersion: { major: 2, minor: 39, patch: 0 },
  supportedMajorFamily: 2,
  stableReleaseRequired: true,
  prereleaseAllowed: false,
  developmentBuildAllowed: false,
  futureMajorAllowed: false,
  unknownVendorAllowed: false,
  genericPolicy: {
    family: "upstream_git",
    minimumVersion: { major: 2, minor: 39, patch: 0 },
    maximumReviewedMajor: 2,
  },
  applePolicy: {
    family: "apple_git",
    minimumUpstreamEquivalentVersion: { major: 2, minor: 39, patch: 0 },
    maximumReviewedUpstreamEquivalentMajor: 2,
    appleBuildComparisonMode: "evidence_only",
    appleBuildMinimum: null,
    appleBuildAllowlist: null,
  },
  capabilitySet: [
    { capabilityIdentity: "git_repository_root_v1", argv: ["rev-parse", "--show-toplevel"] },
    { capabilityIdentity: "git_object_format_v1", argv: ["rev-parse", "--show-object-format"] },
    { capabilityIdentity: "git_head_object_v1", argv: ["rev-parse", "--verify", "HEAD"] },
    { capabilityIdentity: "git_branch_state_v1", argv: ["symbolic-ref", "--quiet", "--short", "HEAD"] },
    { capabilityIdentity: "git_porcelain_status_v1", argv: ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"] },
  ],
  authority: "none",
  compatibilityAuthorityGranted: false,
  runtimeActivated: false,
  repositoryReadAuthorityGranted: false,
  processAuthorityGranted: false,
  cliExecutionAuthorityGranted: false,
  laterActivationEligibility: false,
  toctouEliminated: false,
} as const);

export const PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-read-only-git-compatibility-policy-contract:identity:v1",
  policy: "ture:pure-read-only-git-compatibility-policy-contract:policy:v1",
  inputLinkage: "ture:pure-read-only-git-compatibility-policy-contract:input-linkage:v1",
  versionEvidence: "ture:pure-read-only-git-compatibility-policy-contract:version-evidence:v1",
  scope: "ture:pure-read-only-git-compatibility-policy-contract:capability-scope:v1",
  result: "ture:pure-read-only-git-compatibility-policy-contract:result:v1",
} as const);

export type ReadOnlyGitImplementationFamily = "upstream_git" | "apple_git" | "unsupported_vendor_git" | "unknown";
export type PureReadOnlyGitCompatibilityStatus =
  | "input_rejected"
  | "version_below_baseline"
  | "version_above_reviewed_range"
  | "compatible_for_read_only_observation";

export type PureReadOnlyGitCompatibilityReason =
  | "input_contract_rejected"
  | "input_identity_rejected"
  | "input_fingerprint_rejected"
  | "parser_result_rejected"
  | "source_linkage_rejected"
  | "executable_rejected"
  | "platform_rejected"
  | "authority_rejected"
  | "runtime_claim_rejected"
  | "live_claim_rejected"
  | "toctou_claim_rejected"
  | "prerelease_or_development_rejected"
  | "version_below_baseline"
  | "version_above_reviewed_range"
  | "compatible_for_read_only_observation";

type VersionTriplet = Readonly<{ major: number; minor: number; patch: number }>;

export type PureReadOnlyGitCompatibilityResult = Readonly<{
  resultKind: "pure_read_only_git_compatibility_policy_result";
  resultVersion: 1;
  contractKind: typeof PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.contractKind;
  contractId: typeof PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.contractId;
  contractVersion: 1;
  boundaryId: typeof PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.boundaryId;
  policyId: typeof PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.policyId;
  policyVersion: 1;
  capabilitySetId: typeof PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.capabilitySetId;
  capabilitySetVersion: 1;
  semanticBaselineId: typeof PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.semanticBaselineId;
  implementationFamilyPolicyId: typeof PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.implementationFamilyPolicyId;
  status: PureReadOnlyGitCompatibilityStatus;
  reason: PureReadOnlyGitCompatibilityReason;
  reasons: readonly PureReadOnlyGitCompatibilityReason[];
  implementationFamily: ReadOnlyGitImplementationFamily;
  sourceParserContractId: string | null;
  sourceParserContractVersion: 1 | null;
  sourceParserBoundaryId: string | null;
  sourceEvidenceFingerprint: string | null;
  sourceResultFingerprint: string | null;
  sourceCompletionFingerprint: string | null;
  sourceCompletionResultFingerprint: string | null;
  sourceSpawnFingerprint: string | null;
  executable: "/usr/bin/git" | null;
  platform: "macos" | null;
  session: string | null;
  sourcePolicyId: string | null;
  sourcePolicyVersion: 1 | null;
  major: number | null;
  minor: number | null;
  patch: number | null;
  stableRelease: boolean;
  vendorFamily: ReadOnlyGitImplementationFamily;
  appleBuild: number | null;
  appleBuildString: string | null;
  appleBuildMetadataFingerprint: string | null;
  appleBuildComparisonMode: "evidence_only" | null;
  minimumMajor: 2;
  minimumMinor: 39;
  minimumPatch: 0;
  maximumReviewedMajor: 2;
  meetsMinimum: boolean;
  withinReviewedRange: boolean;
  readOnlyObservationCapabilitySetSatisfied: boolean;
  generalGitCompatibility: false;
  writeCommandCompatibility: false;
  laterActivationEligibility: false;
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
  credentialsUsed: false;
  networkUsed: false;
  authorizationConsumed: false;
  runtimeActivated: false;
  observedLiveProcess: false;
  authoritativeLive: false;
  toctouEliminated: false;
  authority: "none";
  contractIdentityFingerprint: string;
  policyFingerprint: string;
  inputLinkageFingerprint: string | null;
  versionEvidenceFingerprint: string | null;
  capabilityScopeFingerprint: string;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

const GENERIC_RESULT_KEYS = [
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

const GENERIC_EVIDENCE_KEYS = [
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

const APPLE_RESULT_KEYS = [
  "resultKind",
  "resultVersion",
  "contractId",
  "status",
  "fixtureOnly",
  "observedLiveProcess",
  "authoritativeLive",
  "authority",
  "appleGitVersionInterpreted",
  "compatibilityAuthorityGranted",
  "runtimeActivated",
  "blockingReasons",
  "evidence",
  "resultFingerprintAlgorithm",
  "resultFingerprint",
] as const;

const APPLE_EVIDENCE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "contractId",
  "contractVersion",
  "boundaryId",
  "parserGrammarId",
  "parserGrammarVersion",
  "normalizationId",
  "normalizationVersion",
  "vendorIdentity",
  "sourceRawCompletionContractId",
  "sourceRawCompletionContractVersion",
  "sourceRawCompletionBoundaryId",
  "sourceRawCompletionEvidenceFingerprint",
  "sourceRawCompletionResultFingerprint",
  "sourceSpawnContractId",
  "sourceSpawnContractVersion",
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
  "sourceEvidenceTimestamp",
  "provenanceClassification",
  "fixtureLiveClassification",
  "status",
  "primaryReason",
  "reasons",
  "originalStdoutFingerprint",
  "normalizedStdoutFingerprint",
  "originalRawStdoutByteCount",
  "normalizedStdoutByteCount",
  "finalLfRemoved",
  "stderrEmpty",
  "eligibleCompletion",
  "upstreamVersionString",
  "upstreamMajor",
  "upstreamMinor",
  "upstreamPatch",
  "upstreamComponentCount",
  "upstreamSuffixPresent",
  "vendorSuffixPresent",
  "appleVendorLabel",
  "appleBuildString",
  "appleBuildNumber",
  "appleBuildComponentCount",
  "appleBuildMetadataFingerprint",
  "observedLiveProcess",
  "processAuthorityGranted",
  "observerAuthorityGranted",
  "cliExecutionAuthorityGranted",
  "gitVersionAuthorityGranted",
  "compatibilityAuthorityGranted",
  "runtimeAuthorityGranted",
  "stagingAuthorityGranted",
  "deploymentAuthorityGranted",
  "credentialAuthorityGranted",
  "networkAuthorityGranted",
  "authorizationConsumed",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
  "contractIdentityFingerprint",
  "parserPolicyFingerprint",
  "evidenceFingerprintAlgorithm",
  "evidenceFingerprint",
] as const;

const REASON_ORDER: readonly PureReadOnlyGitCompatibilityReason[] = [
  "input_contract_rejected",
  "input_identity_rejected",
  "parser_result_rejected",
  "input_fingerprint_rejected",
  "source_linkage_rejected",
  "executable_rejected",
  "platform_rejected",
  "authority_rejected",
  "runtime_claim_rejected",
  "live_claim_rejected",
  "toctou_claim_rejected",
  "prerelease_or_development_rejected",
  "version_above_reviewed_range",
  "version_below_baseline",
  "compatible_for_read_only_observation",
];

type ValidatedInput = Readonly<{
  family: "upstream_git" | "apple_git";
  sourceParserContractId: string;
  sourceParserContractVersion: 1;
  sourceParserBoundaryId: string;
  sourceEvidenceFingerprint: string;
  sourceResultFingerprint: string;
  sourceCompletionFingerprint: string;
  sourceCompletionResultFingerprint: string;
  sourceSpawnFingerprint: string;
  executable: "/usr/bin/git";
  platform: "macos";
  session: string;
  sourcePolicyId: string;
  sourcePolicyVersion: 1;
  version: VersionTriplet;
  appleBuild: number | null;
  appleBuildString: string | null;
  appleBuildMetadataFingerprint: string | null;
}>;

export function buildPureReadOnlyGitCompatibilityPolicy(input: unknown): PureReadOnlyGitCompatibilityResult {
  const validation = validateInput(input);
  if (!validation.input) return buildResult("input_rejected", validation.reasons[0] ?? "input_contract_rejected", validation.reasons, null);

  const range = compareVersion(validation.input.version);
  if (!range.withinReviewedRange) return buildResult("version_above_reviewed_range", "version_above_reviewed_range", ["version_above_reviewed_range"], validation.input);
  if (!range.meetsMinimum) return buildResult("version_below_baseline", "version_below_baseline", ["version_below_baseline"], validation.input);
  return buildResult("compatible_for_read_only_observation", "compatible_for_read_only_observation", ["compatible_for_read_only_observation"], validation.input);
}

function validateInput(input: unknown): { input: ValidatedInput | null; reasons: readonly PureReadOnlyGitCompatibilityReason[] } {
  if (!isPlainRecord(input)) return { input: null, reasons: ["input_contract_rejected"] };
  if (hasExactKeys(input, GENERIC_RESULT_KEYS)) return validateGeneric(input);
  if (hasExactKeys(input, APPLE_RESULT_KEYS)) return validateApple(input);
  return { input: null, reasons: ["input_contract_rejected"] };
}

function validateGeneric(input: Record<string, unknown>): { input: ValidatedInput | null; reasons: readonly PureReadOnlyGitCompatibilityReason[] } {
  const reasons: PureReadOnlyGitCompatibilityReason[] = [];
  const result = input as unknown as PureGitVersionInterpretationResult;
  if (
    result.resultKind !== "pure_git_version_interpretation_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId
  ) reasons.push("input_identity_rejected");
  if (
    result.status !== "accepted_fixture_git_version_interpretation"
    || result.fixtureOnly !== true
    || result.observedLiveProcess !== false
    || result.authoritativeLive !== false
    || result.authority !== "none"
    || result.cliVersionInterpreted !== true
    || result.runtimeActivated !== false
  ) reasons.push("parser_result_rejected");
  if (!reasons.includes("parser_result_rejected")) {
    if (!hasExactArrayShape(result.blockingReasons, 1)) reasons.push("input_contract_rejected");
    else if (!isExactAcceptedArray(result.blockingReasons)) reasons.push("parser_result_rejected");
    if (!isPlainRecord(result.evidence) || !hasExactKeys(result.evidence, GENERIC_EVIDENCE_KEYS)) reasons.push("input_contract_rejected");
    if (!isSha256(result.resultFingerprint) || result.resultFingerprintAlgorithm !== "sha256") reasons.push("input_fingerprint_rejected");
  }
  const evidence = result.evidence as PureGitVersionInterpretationEvidence;
  if (reasons.length === 0 && !fingerprintsMatchGeneric(result, evidence)) reasons.push("input_fingerprint_rejected");
  if (reasons.length === 0) validateGenericEvidence(evidence, reasons);
  if (reasons.length > 0) return { input: null, reasons: sortedReasons(reasons) };
  const genericVersion = { major: evidence.major as number, minor: evidence.minor as number, patch: evidence.patch as number };
  return { input: {
    family: "upstream_git",
    sourceParserContractId: result.contractId,
    sourceParserContractVersion: 1,
    sourceParserBoundaryId: evidence.boundaryId,
    sourceEvidenceFingerprint: evidence.evidenceFingerprint,
    sourceResultFingerprint: result.resultFingerprint,
    sourceCompletionFingerprint: evidence.sourceRawCompletionEvidenceFingerprint as string,
    sourceCompletionResultFingerprint: evidence.sourceRawCompletionResultFingerprint as string,
    sourceSpawnFingerprint: evidence.sourceSpawnFingerprint as string,
    executable: evidence.canonicalExecutablePath as "/usr/bin/git",
    platform: evidence.platform as "macos",
    session: evidence.boundarySessionId as string,
    sourcePolicyId: evidence.policyId as string,
    sourcePolicyVersion: evidence.policyVersion as 1,
    version: genericVersion,
    appleBuild: null,
    appleBuildString: null,
    appleBuildMetadataFingerprint: null,
  }, reasons: [] };
}

function validateGenericEvidence(evidence: PureGitVersionInterpretationEvidence, reasons: PureReadOnlyGitCompatibilityReason[]) {
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
    || evidence.status !== "accepted"
    || evidence.primaryReason !== "accepted"
  ) reasons.push("input_identity_rejected");
  if (!hasExactArrayShape(evidence.reasons, 1)) reasons.push("input_contract_rejected");
  else if (!isExactAcceptedArray(evidence.reasons)) reasons.push("input_identity_rejected");
  if (evidence.sourceRawCompletionContractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId || evidence.sourceRawCompletionContractVersion !== 1 || evidence.sourceRawCompletionBoundaryId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId) reasons.push("source_linkage_rejected");
  if (!isSha256(evidence.sourceRawCompletionEvidenceFingerprint) || !isSha256(evidence.sourceRawCompletionResultFingerprint) || !isSha256(evidence.sourceSpawnFingerprint) || !isSha256(evidence.sourceLinkageFingerprint)) reasons.push("source_linkage_rejected");
  if (!hasExactArrayShape(evidence.argv, 1)) reasons.push("input_contract_rejected");
  else if (evidence.purpose !== "first_live_read_only_staging_preflight" || evidence.toolIdentity !== "git" || evidence.fixedArgvIdentity !== "git_version_argv_v1" || !isExactArray(evidence.argv, ["--version"])) reasons.push("source_linkage_rejected");
  if (evidence.canonicalExecutablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (evidence.platform !== "macos") reasons.push("platform_rejected");
  if (evidence.policyId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId || evidence.policyVersion !== 1 || typeof evidence.boundarySessionId !== "string" || evidence.boundarySessionId.length === 0) reasons.push("source_linkage_rejected");
  if (evidence.componentCount !== 3 || evidence.parsedVersion !== `${evidence.major}.${evidence.minor}.${evidence.patch}` || evidence.suffixPresent !== false || evidence.stderrEmpty !== true || evidence.eligibleCompletion !== true) reasons.push("prerelease_or_development_rejected");
  if (!validVersion(evidence.major, evidence.minor, evidence.patch)) reasons.push("prerelease_or_development_rejected");
  if (evidence.contractIdentityFingerprint !== parserFingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.identity, PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY) || evidence.parserPolicyFingerprint !== parserFingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.policy, PURE_GIT_VERSION_INTERPRETATION_POLICY)) reasons.push("input_fingerprint_rejected");
  if (evidence.observedLiveProcess !== false) reasons.push("live_claim_rejected");
  if (evidence.runtimeActivated !== false) reasons.push("runtime_claim_rejected");
  if (evidence.toctouEliminated !== false) reasons.push("toctou_claim_rejected");
  if (evidence.spawnAuthorityGranted !== false || evidence.observerAuthorityGranted !== false || evidence.cliExecutionAuthorityGranted !== false || evidence.cliVersionAuthorityGranted !== false || evidence.compatibilityAuthorityGranted !== false || evidence.authorizationConsumed !== false || evidence.credentialsUsed !== false || evidence.networkUsed !== false || evidence.deploymentAuthorityGranted !== false || evidence.authority !== "none") reasons.push("authority_rejected");
}

function validateApple(input: Record<string, unknown>): { input: ValidatedInput | null; reasons: readonly PureReadOnlyGitCompatibilityReason[] } {
  const reasons: PureReadOnlyGitCompatibilityReason[] = [];
  const result = input as unknown as PureAppleGitVersionInterpretationResult;
  if (
    result.resultKind !== "pure_apple_git_version_interpretation_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId
  ) reasons.push("input_identity_rejected");
  if (
    result.status !== "accepted_fixture_apple_git_version_interpretation"
    || result.fixtureOnly !== true
    || result.observedLiveProcess !== false
    || result.authoritativeLive !== false
    || result.authority !== "none"
    || result.appleGitVersionInterpreted !== true
    || result.compatibilityAuthorityGranted !== false
    || result.runtimeActivated !== false
  ) reasons.push("parser_result_rejected");
  if (!reasons.includes("parser_result_rejected")) {
    if (!hasExactArrayShape(result.blockingReasons, 1)) reasons.push("input_contract_rejected");
    else if (!isExactAcceptedArray(result.blockingReasons)) reasons.push("parser_result_rejected");
    if (!isPlainRecord(result.evidence) || !hasExactKeys(result.evidence, APPLE_EVIDENCE_KEYS)) reasons.push("input_contract_rejected");
    if (!isSha256(result.resultFingerprint) || result.resultFingerprintAlgorithm !== "sha256") reasons.push("input_fingerprint_rejected");
  }
  const evidence = result.evidence as PureAppleGitVersionInterpretationEvidence;
  if (reasons.length === 0 && !fingerprintsMatchApple(result, evidence)) reasons.push("input_fingerprint_rejected");
  if (reasons.length === 0) validateAppleEvidence(evidence, reasons);
  if (reasons.length > 0) return { input: null, reasons: sortedReasons(reasons) };
  const appleVersion = { major: evidence.upstreamMajor as number, minor: evidence.upstreamMinor as number, patch: evidence.upstreamPatch as number };
  return { input: {
    family: "apple_git",
    sourceParserContractId: result.contractId,
    sourceParserContractVersion: 1,
    sourceParserBoundaryId: evidence.boundaryId,
    sourceEvidenceFingerprint: evidence.evidenceFingerprint,
    sourceResultFingerprint: result.resultFingerprint,
    sourceCompletionFingerprint: evidence.sourceRawCompletionEvidenceFingerprint as string,
    sourceCompletionResultFingerprint: evidence.sourceRawCompletionResultFingerprint as string,
    sourceSpawnFingerprint: evidence.sourceSpawnFingerprint as string,
    executable: evidence.canonicalExecutablePath as "/usr/bin/git",
    platform: evidence.platform as "macos",
    session: evidence.boundarySessionId as string,
    sourcePolicyId: evidence.policyId as string,
    sourcePolicyVersion: evidence.policyVersion as 1,
    version: appleVersion,
    appleBuild: evidence.appleBuildNumber as number,
    appleBuildString: evidence.appleBuildString as string,
    appleBuildMetadataFingerprint: evidence.appleBuildMetadataFingerprint as string,
  }, reasons: [] };
}

function validateAppleEvidence(evidence: PureAppleGitVersionInterpretationEvidence, reasons: PureReadOnlyGitCompatibilityReason[]) {
  if (
    evidence.evidenceKind !== "pure_apple_git_version_interpretation_evidence"
    || evidence.evidenceVersion !== 1
    || evidence.contractId !== PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.contractId
    || evidence.contractVersion !== 1
    || evidence.boundaryId !== PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.boundaryId
    || evidence.parserGrammarId !== PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.parserGrammarId
    || evidence.parserGrammarVersion !== 1
    || evidence.normalizationId !== PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY.normalizationId
    || evidence.normalizationVersion !== 1
    || evidence.vendorIdentity !== "apple-git"
    || evidence.status !== "accepted"
    || evidence.primaryReason !== "accepted"
  ) reasons.push("input_identity_rejected");
  if (!hasExactArrayShape(evidence.reasons, 1)) reasons.push("input_contract_rejected");
  else if (!isExactAcceptedArray(evidence.reasons)) reasons.push("input_identity_rejected");
  if (evidence.sourceRawCompletionContractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId || evidence.sourceRawCompletionContractVersion !== 1 || evidence.sourceRawCompletionBoundaryId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId) reasons.push("source_linkage_rejected");
  if (!isSha256(evidence.sourceRawCompletionEvidenceFingerprint) || !isSha256(evidence.sourceRawCompletionResultFingerprint) || !isSha256(evidence.sourceSpawnFingerprint) || !isSha256(evidence.sourceLinkageFingerprint)) reasons.push("source_linkage_rejected");
  if (!hasExactArrayShape(evidence.argv, 1)) reasons.push("input_contract_rejected");
  else if (evidence.purpose !== "first_live_read_only_staging_preflight" || evidence.toolIdentity !== "git" || evidence.fixedArgvIdentity !== "git_version_argv_v1" || !isExactArray(evidence.argv, ["--version"])) reasons.push("source_linkage_rejected");
  if (evidence.canonicalExecutablePath !== "/usr/bin/git") reasons.push("executable_rejected");
  if (evidence.platform !== "macos") reasons.push("platform_rejected");
  if (evidence.policyId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId || evidence.policyVersion !== 1 || typeof evidence.boundarySessionId !== "string" || evidence.boundarySessionId.length === 0) reasons.push("source_linkage_rejected");
  if (evidence.upstreamComponentCount !== 3 || evidence.upstreamVersionString !== `${evidence.upstreamMajor}.${evidence.upstreamMinor}.${evidence.upstreamPatch}` || evidence.upstreamSuffixPresent !== false || evidence.vendorSuffixPresent !== true || evidence.appleVendorLabel !== "Apple Git" || evidence.appleBuildComponentCount !== 1 || typeof evidence.appleBuildString !== "string" || evidence.appleBuildString !== String(evidence.appleBuildNumber) || !isSha256(evidence.appleBuildMetadataFingerprint) || evidence.stderrEmpty !== true || evidence.eligibleCompletion !== true) reasons.push("prerelease_or_development_rejected");
  if (!validVersion(evidence.upstreamMajor, evidence.upstreamMinor, evidence.upstreamPatch) || !Number.isInteger(evidence.appleBuildNumber) || (evidence.appleBuildNumber ?? -1) < 0) reasons.push("prerelease_or_development_rejected");
  if (evidence.contractIdentityFingerprint !== parserFingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.identity, PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY) || evidence.parserPolicyFingerprint !== parserFingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.policy, PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY)) reasons.push("input_fingerprint_rejected");
  if (evidence.observedLiveProcess !== false) reasons.push("live_claim_rejected");
  if (evidence.runtimeActivated !== false) reasons.push("runtime_claim_rejected");
  if (evidence.toctouEliminated !== false) reasons.push("toctou_claim_rejected");
  if (evidence.processAuthorityGranted !== false || evidence.observerAuthorityGranted !== false || evidence.cliExecutionAuthorityGranted !== false || evidence.gitVersionAuthorityGranted !== false || evidence.compatibilityAuthorityGranted !== false || evidence.runtimeAuthorityGranted !== false || evidence.stagingAuthorityGranted !== false || evidence.deploymentAuthorityGranted !== false || evidence.credentialAuthorityGranted !== false || evidence.networkAuthorityGranted !== false || evidence.authorizationConsumed !== false || evidence.authority !== "none") reasons.push("authority_rejected");
}

function compareVersion(version: VersionTriplet): { meetsMinimum: boolean; withinReviewedRange: boolean } {
  const maxMajor = PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.supportedMajorFamily;
  if (version.major > maxMajor) return { meetsMinimum: true, withinReviewedRange: false };
  if (version.major < maxMajor) return { meetsMinimum: false, withinReviewedRange: true };
  const minimum = PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.minimumVersion;
  const meetsMinimum = version.minor > minimum.minor || (version.minor === minimum.minor && version.patch >= minimum.patch);
  return { meetsMinimum, withinReviewedRange: true };
}

function buildResult(
  status: PureReadOnlyGitCompatibilityStatus,
  reason: PureReadOnlyGitCompatibilityReason,
  reasons: readonly PureReadOnlyGitCompatibilityReason[],
  input: ValidatedInput | null,
): PureReadOnlyGitCompatibilityResult {
  const range = input ? compareVersion(input.version) : { meetsMinimum: false, withinReviewedRange: false };
  const positive = status === "compatible_for_read_only_observation";
  const linkage = input ? {
    implementationFamily: input.family,
    sourceParserContractId: input.sourceParserContractId,
    sourceEvidenceFingerprint: input.sourceEvidenceFingerprint,
    sourceResultFingerprint: input.sourceResultFingerprint,
    sourceCompletionFingerprint: input.sourceCompletionFingerprint,
    sourceSpawnFingerprint: input.sourceSpawnFingerprint,
    executable: input.executable,
    platform: input.platform,
    session: input.session,
    sourcePolicyId: input.sourcePolicyId,
  } : null;
  const versionEvidence = input ? {
    implementationFamily: input.family,
    version: input.version,
    appleBuild: input.appleBuild,
    appleBuildString: input.appleBuildString,
    appleBuildMetadataFingerprint: input.appleBuildMetadataFingerprint,
    appleBuildComparisonMode: input.family === "apple_git" ? "evidence_only" : null,
    minimumVersion: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.minimumVersion,
    maximumReviewedMajor: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.supportedMajorFamily,
    meetsMinimum: range.meetsMinimum,
    withinReviewedRange: range.withinReviewedRange,
  } : null;
  const scope = {
    capabilitySetId: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.capabilitySetId,
    capabilitySetVersion: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.capabilitySetVersion,
    capabilitySet: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.capabilitySet,
    readOnlyObservationCapabilitySetSatisfied: positive,
    generalGitCompatibility: false,
    writeCommandCompatibility: false,
  };
  const core = {
    resultKind: "pure_read_only_git_compatibility_policy_result",
    resultVersion: 1,
    contractKind: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.contractKind,
    contractId: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.contractId,
    contractVersion: 1,
    boundaryId: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.boundaryId,
    policyId: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.policyId,
    policyVersion: 1,
    capabilitySetId: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.capabilitySetId,
    capabilitySetVersion: 1,
    semanticBaselineId: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.semanticBaselineId,
    implementationFamilyPolicyId: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.implementationFamilyPolicyId,
    status,
    reason,
    reasons: sortedReasons(reasons),
    implementationFamily: input?.family ?? "unknown",
    sourceParserContractId: input?.sourceParserContractId ?? null,
    sourceParserContractVersion: input?.sourceParserContractVersion ?? null,
    sourceParserBoundaryId: input?.sourceParserBoundaryId ?? null,
    sourceEvidenceFingerprint: input?.sourceEvidenceFingerprint ?? null,
    sourceResultFingerprint: input?.sourceResultFingerprint ?? null,
    sourceCompletionFingerprint: input?.sourceCompletionFingerprint ?? null,
    sourceCompletionResultFingerprint: input?.sourceCompletionResultFingerprint ?? null,
    sourceSpawnFingerprint: input?.sourceSpawnFingerprint ?? null,
    executable: input?.executable ?? null,
    platform: input?.platform ?? null,
    session: input?.session ?? null,
    sourcePolicyId: input?.sourcePolicyId ?? null,
    sourcePolicyVersion: input?.sourcePolicyVersion ?? null,
    major: input?.version.major ?? null,
    minor: input?.version.minor ?? null,
    patch: input?.version.patch ?? null,
    stableRelease: input !== null,
    vendorFamily: input?.family ?? "unknown",
    appleBuild: input?.appleBuild ?? null,
    appleBuildString: input?.appleBuildString ?? null,
    appleBuildMetadataFingerprint: input?.appleBuildMetadataFingerprint ?? null,
    appleBuildComparisonMode: input?.family === "apple_git" ? "evidence_only" : null,
    minimumMajor: 2,
    minimumMinor: 39,
    minimumPatch: 0,
    maximumReviewedMajor: 2,
    meetsMinimum: range.meetsMinimum,
    withinReviewedRange: range.withinReviewedRange,
    readOnlyObservationCapabilitySetSatisfied: positive,
    generalGitCompatibility: false,
    writeCommandCompatibility: false,
    laterActivationEligibility: false,
    repositoryReadAuthorityGranted: false,
    mutationAuthorityGranted: false,
    processAuthorityGranted: false,
    observerAuthorityGranted: false,
    cliExecutionAuthorityGranted: false,
    compatibilityAuthorityGranted: false,
    runtimeAuthorityGranted: false,
    stagingAuthorityGranted: false,
    deploymentAuthorityGranted: false,
    credentialAuthorityGranted: false,
    networkAuthorityGranted: false,
    credentialsUsed: false,
    networkUsed: false,
    authorizationConsumed: false,
    runtimeActivated: false,
    observedLiveProcess: false,
    authoritativeLive: false,
    toctouEliminated: false,
    authority: "none",
    contractIdentityFingerprint: localFingerprint(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.identity, PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY),
    policyFingerprint: localFingerprint(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.policy, PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY),
    inputLinkageFingerprint: linkage ? localFingerprint(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.inputLinkage, linkage) : null,
    versionEvidenceFingerprint: versionEvidence ? localFingerprint(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.versionEvidence, versionEvidence) : null,
    capabilityScopeFingerprint: localFingerprint(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.scope, scope),
  } satisfies Omit<PureReadOnlyGitCompatibilityResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: localFingerprint(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.result, core),
  } satisfies PureReadOnlyGitCompatibilityResult);
}

function fingerprintsMatchGeneric(result: PureGitVersionInterpretationResult, evidence: PureGitVersionInterpretationEvidence): boolean {
  const evidenceCore = omit(evidence, ["evidenceFingerprintAlgorithm", "evidenceFingerprint"]);
  const resultCore = omit(result, ["resultFingerprintAlgorithm", "resultFingerprint"]);
  return evidence.evidenceFingerprint === parserFingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.evidence, evidenceCore)
    && result.resultFingerprint === parserFingerprint(PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.result, resultCore);
}

function fingerprintsMatchApple(result: PureAppleGitVersionInterpretationResult, evidence: PureAppleGitVersionInterpretationEvidence): boolean {
  const evidenceCore = omit(evidence, ["evidenceFingerprintAlgorithm", "evidenceFingerprint"]);
  const resultCore = omit(result, ["resultFingerprintAlgorithm", "resultFingerprint"]);
  const appleBuildMetadataFingerprint = evidence.appleBuildNumber !== null && evidence.appleBuildString !== null
    ? parserFingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.appleBuildMetadata, {
        vendorIdentity: "apple-git",
        appleVendorLabel: evidence.appleVendorLabel,
        appleBuildString: evidence.appleBuildString,
        appleBuildNumber: evidence.appleBuildNumber,
      })
    : null;
  return evidence.appleBuildMetadataFingerprint === appleBuildMetadataFingerprint
    && evidence.evidenceFingerprint === parserFingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.evidence, evidenceCore)
    && result.resultFingerprint === parserFingerprint(PURE_APPLE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS.result, resultCore);
}

function omit<T extends Record<string, unknown>, K extends keyof T>(input: T, keys: readonly K[]): Omit<T, K> {
  const blocked = new Set<string>(keys as readonly string[]);
  return Object.fromEntries(Object.entries(input).filter(([key]) => !blocked.has(key))) as Omit<T, K>;
}

function validVersion(major: unknown, minor: unknown, patch: unknown): boolean {
  return Number.isInteger(major)
    && Number.isInteger(minor)
    && Number.isInteger(patch)
    && (major as number) >= 0
    && (minor as number) >= 0
    && (patch as number) >= 0;
}

function isExactAcceptedArray(input: unknown): input is readonly ["accepted"] {
  return isExactArray(input, ["accepted"]);
}

function isExactArray<const T extends readonly unknown[]>(input: unknown, expected: T): input is T {
  if (!hasExactArrayShape(input, expected.length)) return false;
  for (let index = 0; index < expected.length; index += 1) {
    if (input[index] !== expected[index]) return false;
  }
  return true;
}

function hasExactArrayShape(input: unknown, expectedLength: number): input is readonly unknown[] {
  if (!Array.isArray(input) || Object.getPrototypeOf(input) !== Array.prototype) return false;
  if (Object.getOwnPropertySymbols(input).length > 0 || input.length !== expectedLength) return false;
  const expectedNames = new Set(["length", ...Array.from({ length: expectedLength }, (_, index) => String(index))]);
  const ownNames = Object.getOwnPropertyNames(input);
  if (ownNames.length !== expectedNames.size || ownNames.some((name) => !expectedNames.has(name))) return false;
  for (const key in input) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) return false;
  }
  const descriptors = Object.getOwnPropertyDescriptors(input) as Record<string, PropertyDescriptor>;
  if (!descriptors.length || !("value" in descriptors.length)) return false;
  for (let index = 0; index < expectedLength; index += 1) {
    const descriptor = descriptors[String(index)];
    if (!descriptor || !("value" in descriptor)) return false;
  }
  return true;
}

function sortedReasons(input: readonly PureReadOnlyGitCompatibilityReason[]): readonly PureReadOnlyGitCompatibilityReason[] {
  const unique = [...new Set(input)];
  return REASON_ORDER.filter((reason) => unique.includes(reason));
}

function localFingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}\0${canonicalize(input)}`).digest("hex");
}

function parserFingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(parserCanonicalize(input))}`).digest("hex");
}

function parserCanonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return Array.from({ length: input.length }, (_, index) => parserCanonicalize(input[index]));
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, parserCanonicalize(value)]));
  }
  return input;
}
