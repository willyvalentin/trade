import { createHash } from "node:crypto";

import {
  PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS,
  PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY,
  type PureAggregateGitWorktreeLinkage,
} from "@/lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core";
import {
  PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY,
  PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY,
  PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS,
  type PureReadOnlyGitCompatibilityResult,
} from "@/lib/post-trade-pure-read-only-git-compatibility-policy-contract-core";
import {
  GIT_OBSERVATION_CAPABILITY_DEFINITIONS,
  PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY,
  canonicalize,
  deepFreeze,
  isSha256,
  sha256,
} from "@/lib/post-trade-pure-read-only-git-observation-completion-contract-core";
import {
  PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY,
} from "@/lib/post-trade-pure-byte-oriented-porcelain-status-completion-contract-core";
import {
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS,
  type ImmediatePreSpawnRevalidationEvidence,
} from "@/lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";
import {
  DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY,
} from "@/lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";
import {
  TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY,
  TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS,
  buildTrustedExecutableResolutionPolicy,
  type SanitizedExecutableResolutionEvidence,
} from "@/lib/post-trade-trusted-live-resolver-adapter-core";

export const PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_dormant_git_runner_authority_package_contract",
  contractId: "ture.execution.pure-dormant-git-runner-authority-package-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.dormant-git-runner-authority-package.fixture-boundary.v1",
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  fixtureOnly: true,
  authority: "fixture_scoped_dormant_authority_package",
} as const);

export const PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY = deepFreeze({
  policyId: "ture.execution.dormant-git-runner.repository-read-process-authority.policy.v1",
  policyVersion: 1,
  packageStatePolicyId: "ture.execution.dormant-git-runner-authority-package-state.policy.v1",
  sequenceStagePolicyId: "ture.execution.dormant-git-runner-authority-sequence-stage.policy.v1",
  outputRetentionPolicyId: "ture.execution.dormant-git-runner-output-retention.policy.v1",
  expiryPolicyId: "ture.execution.dormant-git-runner-authority-expiry-policy.v1",
  fixedDurationId: "ture.execution.dormant-git-runner-authority-fixed-duration.30s.v1",
  freshnessPolicyId: "ture.execution.dormant-git-runner-authority-freshness-policy.v1",
  timeRepresentationId: "ture.execution.utc-iso8601-ms-time-representation.v1",
  capabilitySetId: "ture.execution.read-only-git-repository-observation-capability-set.v1",
  capabilitySetVersion: 1,
  observationSequenceIdentity: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity,
  executable: "/usr/bin/git",
  platform: "macos",
  maximumProcessAttempts: 6,
  oneProcessAtATime: true,
  retryCount: 0,
  fallbackAllowed: false,
  cacheSubstitutionAllowed: false,
  authorityLifetimeMs: 30000,
  expiryExtensionAllowed: false,
  gracePeriodMs: 0,
  refreshAllowed: false,
  automaticReissueAllowed: false,
  runtimeActivation: false,
  mutationAuthority: false,
  networkAuthority: false,
  credentialAuthority: false,
  arbitraryFilesystemAuthority: false,
  writeCommandAuthority: false,
  toctouEliminated: false,
} as const);

export const PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-dormant-git-runner-authority-package:identity:v1",
  policy: "ture:pure-dormant-git-runner-authority-package:policy:v1",
  stageGrant: "ture:pure-dormant-git-runner-authority-package:stage-grant:v1",
  package: "ture:pure-dormant-git-runner-authority-package:package:v1",
  result: "ture:pure-dormant-git-runner-authority-package:result:v1",
} as const);

export type DormantGitRunnerAuthorityPackageStatus =
  | "input_rejected"
  | "prerequisite_rejected"
  | "compatibility_rejected"
  | "worktree_rejected"
  | "expiry_policy_rejected"
  | "authority_package_issued";

export type DormantGitRunnerAuthorityPackageReason =
  | "input_contract_rejected"
  | "input_identity_rejected"
  | "input_fingerprint_rejected"
  | "package_id_rejected"
  | "timestamp_grammar_rejected"
  | "expiry_delta_rejected"
  | "executable_resolution_rejected"
  | "executable_revalidation_rejected"
  | "executable_linkage_rejected"
  | "compatibility_result_rejected"
  | "compatibility_linkage_rejected"
  | "worktree_evidence_rejected"
  | "worktree_linkage_rejected"
  | "capability_set_rejected"
  | "session_linkage_rejected"
  | "platform_linkage_rejected"
  | "policy_linkage_rejected"
  | "sequence_identity_rejected"
  | "authority_conflict_rejected"
  | "authority_package_issued";

export type DormantGitRunnerStageGrant = Readonly<{
  grantKind: "dormant_git_runner_stage_authority_grant";
  grantVersion: 1;
  authorityPolicyFingerprint: string;
  stageIndex: 0 | 1 | 2 | 3 | 4 | 5;
  stageIdentity: string;
  capabilityIdentity: string;
  capabilityPurpose: string;
  executable: "/usr/bin/git";
  argv: readonly string[];
  workingDirectoryFingerprint: string;
  repositoryRootPathFingerprint: string;
  outputMode: "text" | "bytes";
  stdoutLimitBytes: number;
  stderrLimitBytes: number;
  combinedLimitBytes: number;
  processAttemptMaximum: 1;
  processCreationGrant: true;
  exactReadOnlyGitCliGrant: true;
  repositoryReadGrant: true;
  outputRetentionGrant: true;
  evidenceConstructionGrant: true;
  consumed: false;
  retryCount: 0;
  fallbackAttempted: false;
  stageFingerprintAlgorithm: "sha256";
  stageFingerprint: string;
}>;

export type DormantGitRunnerAuthorityPackage = Readonly<{
  packageKind: "pure_dormant_git_runner_authority_package";
  packageVersion: 1;
  packageId: string;
  authorityPolicyFingerprint: string;
  contractId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId;
  authorityPolicyId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId;
  authorityPolicyVersion: 1;
  capabilitySetId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId;
  capabilitySetVersion: 1;
  observationSequenceIdentity: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity;
  session: string;
  platform: "macos";
  executable: "/usr/bin/git";
  sourcePolicyId: string;
  sourcePolicyVersion: 1;
  executableResolutionFingerprint: string;
  executableRevalidationFingerprint: string;
  compatibilityResultFingerprint: string;
  worktreeEvidenceFingerprint: string;
  worktreeFingerprint: string;
  repositoryRootPathFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  fixedDurationMs: 30000;
  expiryPolicyId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId;
  fixedDurationId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.fixedDurationId;
  freshnessPolicyId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId;
  timeRepresentationId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.timeRepresentationId;
  preConsumptionRevalidationRequired: true;
  perStageExpiryCheckRequired: true;
  aggregateConstructionExpiryCheckRequired: true;
  expiryExtensionAllowed: false;
  refreshAllowed: false;
  gracePeriodMs: 0;
  automaticReissueAllowed: false;
  packageState: "issued";
  currentStageIndex: 0;
  consumedStageCount: 0;
  remainingStageCount: 6;
  terminal: false;
  activeConsumer: false;
  retryCount: 0;
  fallbackAttempted: false;
  replayDetected: false;
  revoked: false;
  expired: false;
  executableResolutionLinked: true;
  executableRevalidationLinked: true;
  processCreationAuthorityGranted: true;
  exactReadOnlyGitCliExecutionAuthorityGranted: true;
  approvedRepositoryReadAuthorityGranted: true;
  boundedTextRetentionAuthorityGranted: true;
  boundedByteRetentionAuthorityGranted: true;
  stageEvidenceConstructionAuthorityGranted: true;
  aggregateObservationConstructionAuthorityGranted: true;
  nonAuthoritativeResultExposureAuthorityGranted: true;
  runtimeCallerActivationAuthorityGranted: false;
  mutationAuthorityGranted: false;
  arbitraryFilesystemReadAuthorityGranted: false;
  writeCommandAuthorityGranted: false;
  credentialAuthorityGranted: false;
  networkAuthorityGranted: false;
  stagingAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  laterActivationEligibility: false;
  runtimeActivated: false;
  toctouEliminated: false;
  stageGrants: readonly DormantGitRunnerStageGrant[];
  packageFingerprintAlgorithm: "sha256";
  packageFingerprint: string;
}>;

export type PureDormantGitRunnerAuthorityPackageInput = Readonly<{
  inputKind: "pure_dormant_git_runner_authority_package_input";
  inputVersion: 1;
  contractId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId;
  authorityPolicyId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId;
  authorityPolicyVersion: 1;
  capabilitySetId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId;
  capabilitySetVersion: 1;
  observationSequenceIdentity: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity;
  packageId: string;
  issuedAt: string;
  expiresAt: string;
  session: string;
  platform: "macos";
  sourcePolicyId: string;
  sourcePolicyVersion: 1;
  executableResolutionEvidence: SanitizedExecutableResolutionEvidence;
  executableRevalidationEvidence: ImmediatePreSpawnRevalidationEvidence;
  compatibilityPolicyResult: PureReadOnlyGitCompatibilityResult;
  approvedWorktreeEvidence: PureAggregateGitWorktreeLinkage;
}>;

export type PureDormantGitRunnerAuthorityPackageResult = Readonly<{
  resultKind: "pure_dormant_git_runner_authority_package_result";
  resultVersion: 1;
  contractKind: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractKind;
  contractId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId;
  contractVersion: 1;
  boundaryId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId;
  authorityPolicyId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId;
  authorityPolicyVersion: 1;
  capabilitySetId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId;
  capabilitySetVersion: 1;
  expiryPolicyId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId;
  freshnessPolicyId: typeof PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId;
  authorityPolicyFingerprint: string;
  status: DormantGitRunnerAuthorityPackageStatus;
  reason: DormantGitRunnerAuthorityPackageReason;
  reasons: readonly DormantGitRunnerAuthorityPackageReason[];
  packageId: string | null;
  packageFingerprint: string | null;
  executableResolutionFingerprint: string | null;
  executableRevalidationFingerprint: string | null;
  compatibilityResultFingerprint: string | null;
  worktreeEvidenceFingerprint: string | null;
  executable: "/usr/bin/git" | null;
  worktreeFingerprint: string | null;
  session: string | null;
  sequenceIdentity: string | null;
  platform: "macos" | null;
  sourcePolicyId: string | null;
  sourcePolicyVersion: 1 | null;
  issuedPackage: DormantGitRunnerAuthorityPackage | null;
  runtimeActivated: false;
  runtimeCallerActivationAuthorityGranted: false;
  mutationAuthorityGranted: false;
  arbitraryFilesystemReadAuthorityGranted: false;
  writeCommandAuthorityGranted: false;
  credentialAuthorityGranted: false;
  networkAuthorityGranted: false;
  stagingAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  laterActivationEligibility: false;
  toctouEliminated: false;
  authority: "none" | "fixture_scoped_dormant_authority_package";
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

const INPUT_KEYS = [
  "inputKind",
  "inputVersion",
  "contractId",
  "boundaryId",
  "authorityPolicyId",
  "authorityPolicyVersion",
  "capabilitySetId",
  "capabilitySetVersion",
  "observationSequenceIdentity",
  "packageId",
  "issuedAt",
  "expiresAt",
  "session",
  "platform",
  "sourcePolicyId",
  "sourcePolicyVersion",
  "executableResolutionEvidence",
  "executableRevalidationEvidence",
  "compatibilityPolicyResult",
  "approvedWorktreeEvidence",
] as const;

const RESOLVER_METADATA_KEYS = ["deviceId", "inode", "sizeBytes", "mode", "modifiedTimeMs"] as const;

const EXECUTABLE_RESOLUTION_EVIDENCE_KEYS = [
  "evidenceKind", "evidenceVersion", "fixtureOnly", "observedLive", "authoritativeLive",
  "provesExecutableExistsLive", "provesExecutableTrustedLive", "issuesLiveExecutableCapability",
  "enablesProcessStart", "enablesPreflightRunner", "boundarySessionId", "requestId",
  "expectedToolIdentity", "sanitizedStructuralPath", "resolverIdentityFingerprint",
  "resolverPolicyFingerprint", "resolverSessionCapabilityFingerprint", "candidateCapabilityFingerprint",
  "fixtureObservationFingerprint", "authority", "completeness", "disposition", "blockingReasons",
  "ambiguityReasons", "evaluatedAt", "expiresAt", "evidenceFingerprintAlgorithm", "evidenceFingerprint",
] as const;

const REVALIDATION_EVIDENCE_KEYS = [
  "evidenceKind", "evidenceVersion", "adapterId", "adapterIdentityFingerprint", "policyId", "policyVersion",
  "policyFingerprint", "purpose", "platform", "toolIdentity", "boundarySessionId", "initialCompositionAdapterId",
  "initialCompositionResultFingerprint", "initialCompositionEvidenceSetFingerprint", "resolverEvidenceFingerprint",
  "revalidationRequirementFingerprint", "expectedResolvedAbsolutePath", "observedResolvedAbsolutePath",
  "expectedMetadata", "observedMetadata", "observationSource", "observationFingerprint",
  "productionLiveRevalidationProvenance", "exactMetadataMatched", "immediateRevalidationOccurred",
  "pointInTimeOnly", "toctouEliminated", "remainingIntervalBeforeSpawnMustBeMinimized",
  "serializedEvidenceReusableAsAuthority", "authoritativeLive", "filesystemAuthority", "spawnAuthority",
  "observerAuthority", "credentialAuthority", "cliExecutionAuthority", "runnerAuthority",
  "authorizationConsumptionAuthority", "networkAuthority", "apiAuthority", "uiAuthority", "tradingAuthority",
  "avanzaAuthority", "persistenceAuthority", "deploymentAuthority", "processSpawned", "shellUsed",
  "cliVersionCollected", "credentialAccessed", "networkAccessed", "observerInvoked", "authorizationConsumed",
  "retryCount", "filesystemAttemptCount", "status", "blockingReasons", "evaluatedAt",
  "evidenceFingerprintAlgorithm", "evidenceFingerprint",
] as const;

const COMPATIBILITY_RESULT_KEYS = [
  "resultKind", "resultVersion", "contractKind", "contractId", "contractVersion", "boundaryId",
  "policyId", "policyVersion", "capabilitySetId", "capabilitySetVersion", "semanticBaselineId",
  "implementationFamilyPolicyId", "status", "reason", "reasons", "implementationFamily",
  "sourceParserContractId", "sourceParserContractVersion", "sourceParserBoundaryId",
  "sourceEvidenceFingerprint", "sourceResultFingerprint", "sourceCompletionFingerprint",
  "sourceCompletionResultFingerprint", "sourceSpawnFingerprint", "executable", "platform", "session",
  "sourcePolicyId", "sourcePolicyVersion", "major", "minor", "patch", "stableRelease", "vendorFamily",
  "appleBuild", "appleBuildString", "appleBuildMetadataFingerprint", "appleBuildComparisonMode",
  "minimumMajor", "minimumMinor", "minimumPatch", "maximumReviewedMajor", "meetsMinimum",
  "withinReviewedRange", "readOnlyObservationCapabilitySetSatisfied", "generalGitCompatibility",
  "writeCommandCompatibility", "laterActivationEligibility", "repositoryReadAuthorityGranted",
  "mutationAuthorityGranted", "processAuthorityGranted", "observerAuthorityGranted",
  "cliExecutionAuthorityGranted", "compatibilityAuthorityGranted", "runtimeAuthorityGranted",
  "stagingAuthorityGranted", "deploymentAuthorityGranted", "credentialAuthorityGranted",
  "networkAuthorityGranted", "credentialsUsed", "networkUsed", "authorizationConsumed", "runtimeActivated",
  "observedLiveProcess", "authoritativeLive", "toctouEliminated", "authority",
  "contractIdentityFingerprint", "policyFingerprint", "inputLinkageFingerprint",
  "versionEvidenceFingerprint", "capabilityScopeFingerprint", "resultFingerprintAlgorithm", "resultFingerprint",
] as const;

const WORKTREE_LINKAGE_KEYS = [
  "evidenceKind", "evidenceVersion", "linkagePolicyId", "linkagePolicyVersion",
  "repositoryRootPathFingerprint", "workingDirectoryFingerprint", "observationSequenceIdentity",
  "sourceClassification", "canonicalFilesystemPathClaimed", "repositoryReadAuthorityGranted",
  "runtimeActivated", "toctouEliminated", "authority", "evidenceFingerprint",
] as const;

const REASON_ORDER: readonly DormantGitRunnerAuthorityPackageReason[] = [
  "input_contract_rejected",
  "input_identity_rejected",
  "package_id_rejected",
  "timestamp_grammar_rejected",
  "expiry_delta_rejected",
  "executable_resolution_rejected",
  "executable_revalidation_rejected",
  "compatibility_result_rejected",
  "worktree_evidence_rejected",
  "executable_linkage_rejected",
  "compatibility_linkage_rejected",
  "worktree_linkage_rejected",
  "capability_set_rejected",
  "session_linkage_rejected",
  "platform_linkage_rejected",
  "policy_linkage_rejected",
  "sequence_identity_rejected",
  "authority_conflict_rejected",
  "input_fingerprint_rejected",
  "authority_package_issued",
] as const;

const STAGE_DEFINITIONS = [
  {
    stageIdentity: "git_repository_root_v1",
    capabilityIdentity: "git_repository_root_v1",
    capabilityPurpose: "git_repository_root",
    argv: ["rev-parse", "--show-toplevel"],
    outputMode: "text",
    stdoutLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_repository_root_v1,
    stderrLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stderrAcceptedBytes,
    combinedLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_repository_root_v1,
  },
  {
    stageIdentity: "git_object_format_v1",
    capabilityIdentity: "git_object_format_v1",
    capabilityPurpose: "git_object_format",
    argv: ["rev-parse", "--show-object-format"],
    outputMode: "text",
    stdoutLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_object_format_v1,
    stderrLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stderrAcceptedBytes,
    combinedLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_object_format_v1,
  },
  {
    stageIdentity: "git_head_before_v1",
    capabilityIdentity: "git_head_object_v1",
    capabilityPurpose: "git_head_object",
    argv: ["rev-parse", "--verify", "HEAD"],
    outputMode: "text",
    stdoutLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_head_object_v1,
    stderrLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stderrAcceptedBytes,
    combinedLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_head_object_v1,
  },
  {
    stageIdentity: "git_branch_state_v1",
    capabilityIdentity: "git_branch_state_v1",
    capabilityPurpose: "git_branch_state",
    argv: ["symbolic-ref", "--quiet", "--short", "HEAD"],
    outputMode: "text",
    stdoutLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_branch_state_v1,
    stderrLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stderrAcceptedBytes,
    combinedLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_branch_state_v1,
  },
  {
    stageIdentity: "git_porcelain_status_v1",
    capabilityIdentity: "git_porcelain_status_v1",
    capabilityPurpose: "git_porcelain_status",
    argv: ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"],
    outputMode: "bytes",
    stdoutLimitBytes: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stdoutLimitBytes,
    stderrLimitBytes: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stderrLimitBytes,
    combinedLimitBytes: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.combinedLimitBytes,
  },
  {
    stageIdentity: "git_head_after_v1",
    capabilityIdentity: "git_head_object_v1",
    capabilityPurpose: "git_head_object",
    argv: ["rev-parse", "--verify", "HEAD"],
    outputMode: "text",
    stdoutLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_head_object_v1,
    stderrLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stderrAcceptedBytes,
    combinedLimitBytes: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.stdoutLimitsByCapability.git_head_object_v1,
  },
] as const;

const COMPLETE_AUTHORITY_POLICY_MODEL = deepFreeze({
  identity: {
    contractKind: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractKind,
    contractId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId,
    contractVersion: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractVersion,
    boundaryId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId,
    purpose: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.purpose,
    platform: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.platform,
    fixtureOnly: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.fixtureOnly,
    authority: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.authority,
    authorityPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId,
    authorityPolicyVersion: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyVersion,
    capabilitySetId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId,
    capabilitySetVersion: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetVersion,
    expiryPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId,
    freshnessPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId,
    fixedDurationId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.fixedDurationId,
    timeRepresentationId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.timeRepresentationId,
    packageStatePolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.packageStatePolicyId,
    sequenceStagePolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.sequenceStagePolicyId,
    outputRetentionPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.outputRetentionPolicyId,
    observationSequenceIdentity: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity,
  },
  executableAndSequence: {
    executable: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.executable,
    platform: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.platform,
    stageCount: 6,
    maximumProcessAttempts: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.maximumProcessAttempts,
    oneProcessAtATime: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.oneProcessAtATime,
    fixedOrder: true,
    stageSkippingAllowed: false,
    stageRepetitionAllowed: false,
    callerStageSelectionAllowed: false,
  },
  retryFallbackCache: {
    retryCount: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.retryCount,
    fallbackAllowed: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.fallbackAllowed,
    cacheSubstitutionAllowed: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.cacheSubstitutionAllowed,
    automaticRerunAllowed: false,
    alternateExecutableAllowed: false,
  },
  expiryFreshness: {
    fixedDurationMs: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.authorityLifetimeMs,
    expiryExtensionAllowed: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryExtensionAllowed,
    refreshAllowed: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.refreshAllowed,
    gracePeriodMs: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.gracePeriodMs,
    automaticReissueAllowed: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.automaticReissueAllowed,
    preConsumptionRevalidationRequired: true,
    perStageExpiryCheckRequired: true,
    aggregateConstructionExpiryCheckRequired: true,
    observedAtEvaluationRequiredBeforeConsumption: true,
    liveTimeProvenance: "none_pure_caller_supplied_timestamp_only",
  },
  processPolicy: {
    shell: false,
    pathLookupAllowed: false,
    inheritedEnvironmentAllowed: false,
    stdin: "ignore",
    detachedProcessAllowed: false,
    processGroupAllowed: false,
    oneProcessPerStage: true,
    sixTotalAttemptsMaximum: true,
  },
  capabilityAuthority: {
    allowed: {
      executableResolutionLinked: true,
      executableRevalidationLinked: true,
      processCreationAuthorityGranted: true,
      exactReadOnlyGitCliExecutionAuthorityGranted: true,
      approvedRepositoryReadAuthorityGranted: true,
      boundedTextRetentionAuthorityGranted: true,
      boundedByteRetentionAuthorityGranted: true,
      stageEvidenceConstructionAuthorityGranted: true,
      aggregateObservationConstructionAuthorityGranted: true,
      nonAuthoritativeResultExposureAuthorityGranted: true,
    },
    denied: {
      runtimeCallerActivationAuthorityGranted: false,
      mutationAuthorityGranted: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.mutationAuthority,
      arbitraryFilesystemReadAuthorityGranted: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.arbitraryFilesystemAuthority,
      writeCommandAuthorityGranted: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.writeCommandAuthority,
      credentialAuthorityGranted: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.credentialAuthority,
      networkAuthorityGranted: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.networkAuthority,
      stagingAuthorityGranted: false,
      deploymentAuthorityGranted: false,
      toctouEliminated: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.toctouEliminated,
    },
  },
  stageSequence: STAGE_DEFINITIONS.map((definition, index) => ({
    index,
    stageIdentity: definition.stageIdentity,
    purpose: definition.capabilityPurpose,
    capabilityIdentity: definition.capabilityIdentity,
    executable: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.executable,
    argv: definition.argv,
    outputMode: definition.outputMode,
    stdoutLimitBytes: definition.stdoutLimitBytes,
    stderrLimitBytes: definition.stderrLimitBytes,
    combinedLimitBytes: definition.combinedLimitBytes,
    stderrEmptyRequired: true,
    truncationAllowed: false,
    persistenceAllowed: false,
    utf8Required: definition.outputMode === "text",
    byteDecodingAllowed: definition.outputMode === "bytes",
    attemptMaximum: 1,
    processGrant: true,
    cliGrant: true,
    repositoryReadGrant: true,
    retentionGrant: true,
    evidenceConstructionGrant: true,
    retryCount: 0,
    fallbackAttempted: false,
  })),
  referencedRetentionPolicies: {
    textObservationPolicy: PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY,
    porcelainStatusPolicy: PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY,
    aggregatePolicy: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY,
  },
  initialPackageState: {
    packageState: "issued",
    currentStageIndex: 0,
    consumedStageCount: 0,
    remainingStageCount: 6,
    allGrantsConsumed: false,
    terminal: false,
    activeConsumer: false,
    replayDetected: false,
    revoked: false,
    expired: false,
    retryCount: 0,
    fallbackAttempted: false,
  },
  replayStorageSemantics: {
    authorityConsumedLive: false,
    atomicReplayProtectionPresent: false,
    storagePresent: false,
    clonedPackageLiveSafe: false,
    concurrentConsumerProtectionPresent: false,
  },
  runtimeSemanticLimits: {
    runtimeActivated: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.runtimeActivation,
    laterActivationEligibility: false,
    runnerImplemented: false,
    deploymentReady: false,
    stagingReady: false,
    repositorySafetyClaimed: false,
    toctouEliminated: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.toctouEliminated,
  },
} as const);

export function buildPureDormantGitRunnerAuthorityPackage(input: unknown): PureDormantGitRunnerAuthorityPackageResult {
  const validation = validateInput(input);
  if (!validation.input) return buildResult(statusForReason(validation.reasons[0] ?? "input_contract_rejected"), validation.reasons[0] ?? "input_contract_rejected", validation.reasons, null);
  const packageValue = buildPackage(validation.input);
  return buildResult("authority_package_issued", "authority_package_issued", ["authority_package_issued"], validation.input, packageValue);
}

function validateInput(input: unknown): { input: PureDormantGitRunnerAuthorityPackageInput | null; reasons: readonly DormantGitRunnerAuthorityPackageReason[] } {
  const reasons: DormantGitRunnerAuthorityPackageReason[] = [];
  if (!isExactRecord(input, INPUT_KEYS)) return { input: null, reasons: ["input_contract_rejected"] };
  const candidate = input as unknown as PureDormantGitRunnerAuthorityPackageInput;
  if (
    candidate.inputKind !== "pure_dormant_git_runner_authority_package_input"
    || candidate.inputVersion !== 1
    || candidate.contractId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId
    || candidate.boundaryId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId
    || candidate.authorityPolicyId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId
    || candidate.authorityPolicyVersion !== 1
  ) reasons.push("input_identity_rejected");
  if (typeof candidate.packageId !== "string" || !/^dormant-git-runner-authority-package-[a-z0-9-]{8,80}$/u.test(candidate.packageId)) reasons.push("package_id_rejected");
  if (!isCanonicalTimestamp(candidate.issuedAt) || !isCanonicalTimestamp(candidate.expiresAt)) reasons.push("timestamp_grammar_rejected");
  else if (Date.parse(candidate.expiresAt) - Date.parse(candidate.issuedAt) !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.authorityLifetimeMs) reasons.push("expiry_delta_rejected");
  if (candidate.capabilitySetId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId || candidate.capabilitySetVersion !== 1) reasons.push("capability_set_rejected");
  if (candidate.observationSequenceIdentity !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity) reasons.push("sequence_identity_rejected");
  if (candidate.platform !== "macos") reasons.push("platform_linkage_rejected");
  if (typeof candidate.session !== "string" || candidate.session.length === 0) reasons.push("session_linkage_rejected");
  if (typeof candidate.sourcePolicyId !== "string" || candidate.sourcePolicyVersion !== 1) reasons.push("policy_linkage_rejected");
  validateExecutableResolution(candidate.executableResolutionEvidence, reasons);
  validateExecutableRevalidation(candidate.executableRevalidationEvidence, reasons);
  validateCompatibility(candidate.compatibilityPolicyResult, reasons);
  validateWorktree(candidate.approvedWorktreeEvidence, reasons);
  if (reasons.length === 0) validateLinkage(candidate, reasons);
  if (reasons.length > 0) return { input: null, reasons: sortedReasons(reasons) };
  return { input: candidate, reasons: [] };
}

function validateExecutableResolution(evidence: unknown, reasons: DormantGitRunnerAuthorityPackageReason[]): void {
  if (!isExactRecord(evidence, EXECUTABLE_RESOLUTION_EVIDENCE_KEYS)) {
    reasons.push("executable_resolution_rejected");
    return;
  }
  const candidate = evidence as SanitizedExecutableResolutionEvidence;
  const policy = buildTrustedExecutableResolutionPolicy();
  if (
    candidate.evidenceKind !== "sanitized_executable_resolution_evidence"
    || candidate.evidenceVersion !== 1
    || candidate.fixtureOnly !== true
    || candidate.observedLive !== false
    || candidate.authoritativeLive !== false
    || candidate.provesExecutableExistsLive !== false
    || candidate.provesExecutableTrustedLive !== false
    || candidate.issuesLiveExecutableCapability !== false
    || candidate.enablesProcessStart !== false
    || candidate.enablesPreflightRunner !== false
    || candidate.expectedToolIdentity !== "git"
    || candidate.sanitizedStructuralPath !== "/usr/bin/git"
    || candidate.resolverIdentityFingerprint !== resolverFingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.identity, TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY)
    || candidate.resolverPolicyFingerprint !== policy.policyFingerprint
    || !isSha256(candidate.resolverSessionCapabilityFingerprint)
    || !isSha256(candidate.candidateCapabilityFingerprint)
    || !isSha256(candidate.fixtureObservationFingerprint)
    || candidate.authority !== "fixture_structural_only"
    || candidate.completeness !== "complete_fixture_structure"
    || candidate.disposition !== "compatible_fixture_candidate"
    || !isExactArray(candidate.blockingReasons, [])
    || !isExactArray(candidate.ambiguityReasons, [])
    || !isCanonicalTimestamp(candidate.evaluatedAt)
    || !isCanonicalTimestamp(candidate.expiresAt)
    || candidate.evidenceFingerprintAlgorithm !== "sha256"
    || !isSha256(candidate.evidenceFingerprint)
  ) reasons.push("executable_resolution_rejected");
  else {
    const withoutFingerprint = { ...candidate } as Record<string, unknown>;
    delete withoutFingerprint.evidenceFingerprintAlgorithm;
    delete withoutFingerprint.evidenceFingerprint;
    if (candidate.evidenceFingerprint !== resolverFingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableEvidence, withoutFingerprint)) reasons.push("input_fingerprint_rejected");
  }
}

function validateExecutableRevalidation(evidence: unknown, reasons: DormantGitRunnerAuthorityPackageReason[]): void {
  if (!isExactRecord(evidence, REVALIDATION_EVIDENCE_KEYS)) {
    reasons.push("executable_revalidation_rejected");
    return;
  }
  const candidate = evidence as ImmediatePreSpawnRevalidationEvidence;
  if (
    candidate.evidenceKind !== "immediate_pre_spawn_revalidation_evidence"
    || candidate.evidenceVersion !== 1
    || candidate.adapterId !== DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId
    || candidate.adapterIdentityFingerprint !== colonJsonFingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.identity, DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY)
    || candidate.policyId !== DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyId
    || candidate.policyVersion !== 1
    || candidate.policyFingerprint !== colonJsonFingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.policy, DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY)
    || candidate.purpose !== "first_live_read_only_staging_preflight"
    || candidate.platform !== "macos"
    || candidate.toolIdentity !== "git"
    || candidate.expectedResolvedAbsolutePath !== "/usr/bin/git"
    || candidate.observedResolvedAbsolutePath !== "/usr/bin/git"
    || candidate.initialCompositionAdapterId !== DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId
    || !isSha256(candidate.initialCompositionResultFingerprint)
    || !isSha256(candidate.initialCompositionEvidenceSetFingerprint)
    || !isSha256(candidate.resolverEvidenceFingerprint)
    || !isSha256(candidate.revalidationRequirementFingerprint)
    || !isResolverMetadata(candidate.expectedMetadata)
    || !isResolverMetadata(candidate.observedMetadata)
    || canonicalize(candidate.expectedMetadata) !== canonicalize(candidate.observedMetadata)
    || candidate.observationSource !== "server_only_lstat"
    || !isSha256(candidate.observationFingerprint)
    || candidate.productionLiveRevalidationProvenance !== "server_only_private_original_object"
    || candidate.status !== "revalidated_non_authoritative_evidence"
    || !isExactArray(candidate.blockingReasons, [])
    || candidate.exactMetadataMatched !== true
    || candidate.immediateRevalidationOccurred !== true
    || candidate.pointInTimeOnly !== true
    || candidate.toctouEliminated !== false
    || candidate.serializedEvidenceReusableAsAuthority !== false
    || candidate.authoritativeLive !== false
    || candidate.filesystemAuthority !== "none"
    || candidate.spawnAuthority !== "none"
    || candidate.observerAuthority !== "none"
    || candidate.credentialAuthority !== "none"
    || candidate.cliExecutionAuthority !== "none"
    || candidate.runnerAuthority !== "none"
    || candidate.authorizationConsumptionAuthority !== "none"
    || candidate.networkAuthority !== "none"
    || candidate.apiAuthority !== "none"
    || candidate.uiAuthority !== "none"
    || candidate.tradingAuthority !== "none"
    || candidate.avanzaAuthority !== "none"
    || candidate.persistenceAuthority !== "none"
    || candidate.deploymentAuthority !== "none"
    || candidate.processSpawned !== false
    || candidate.shellUsed !== false
    || candidate.cliVersionCollected !== false
    || candidate.credentialAccessed !== false
    || candidate.networkAccessed !== false
    || candidate.observerInvoked !== false
    || candidate.authorizationConsumed !== false
    || candidate.retryCount !== 0
    || candidate.filesystemAttemptCount !== 1
    || !isCanonicalTimestamp(candidate.evaluatedAt)
    || candidate.evidenceFingerprintAlgorithm !== "sha256"
    || !isSha256(candidate.evidenceFingerprint)
  ) reasons.push("executable_revalidation_rejected");
  else {
    const withoutFingerprint = { ...candidate } as Record<string, unknown>;
    delete withoutFingerprint.evidenceFingerprintAlgorithm;
    delete withoutFingerprint.evidenceFingerprint;
    if (candidate.evidenceFingerprint !== colonJsonFingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.evidence, withoutFingerprint)) reasons.push("input_fingerprint_rejected");
  }
}

function validateCompatibility(result: unknown, reasons: DormantGitRunnerAuthorityPackageReason[]): void {
  if (!isExactRecord(result, COMPATIBILITY_RESULT_KEYS)) {
    reasons.push("compatibility_result_rejected");
    return;
  }
  const candidate = result as PureReadOnlyGitCompatibilityResult;
  if (
    candidate.resultKind !== "pure_read_only_git_compatibility_policy_result"
    || candidate.resultVersion !== 1
    || candidate.contractKind !== PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.contractKind
    || candidate.contractId !== PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.contractId
    || candidate.contractVersion !== 1
    || candidate.boundaryId !== PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY.boundaryId
    || candidate.policyId !== PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.policyId
    || candidate.policyVersion !== 1
    || candidate.semanticBaselineId !== PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.semanticBaselineId
    || candidate.implementationFamilyPolicyId !== PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.implementationFamilyPolicyId
    || candidate.status !== "compatible_for_read_only_observation"
    || candidate.reason !== "compatible_for_read_only_observation"
    || !isExactArray(candidate.reasons, ["compatible_for_read_only_observation"])
    || (candidate.implementationFamily !== "upstream_git" && candidate.implementationFamily !== "apple_git")
    || candidate.vendorFamily !== candidate.implementationFamily
    || typeof candidate.sourceParserContractId !== "string"
    || candidate.sourceParserContractVersion !== 1
    || typeof candidate.sourceParserBoundaryId !== "string"
    || !isSha256(candidate.sourceEvidenceFingerprint)
    || !isSha256(candidate.sourceResultFingerprint)
    || !isSha256(candidate.sourceCompletionFingerprint)
    || !isSha256(candidate.sourceCompletionResultFingerprint)
    || !isSha256(candidate.sourceSpawnFingerprint)
    || candidate.capabilitySetId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId
    || candidate.capabilitySetVersion !== 1
    || candidate.readOnlyObservationCapabilitySetSatisfied !== true
    || candidate.executable !== "/usr/bin/git"
    || candidate.platform !== "macos"
    || typeof candidate.session !== "string"
    || candidate.session.length === 0
    || typeof candidate.sourcePolicyId !== "string"
    || candidate.sourcePolicyVersion !== 1
    || !isValidVersionNumber(candidate.major)
    || !isValidVersionNumber(candidate.minor)
    || !isValidVersionNumber(candidate.patch)
    || candidate.stableRelease !== true
    || candidate.minimumMajor !== 2
    || candidate.minimumMinor !== 39
    || candidate.minimumPatch !== 0
    || candidate.maximumReviewedMajor !== 2
    || candidate.meetsMinimum !== true
    || candidate.withinReviewedRange !== true
    || (candidate.implementationFamily === "upstream_git" && (
      candidate.appleBuild !== null
      || candidate.appleBuildString !== null
      || candidate.appleBuildMetadataFingerprint !== null
      || candidate.appleBuildComparisonMode !== null
    ))
    || (candidate.implementationFamily === "apple_git" && (
      !Number.isInteger(candidate.appleBuild)
      || typeof candidate.appleBuildString !== "string"
      || !isSha256(candidate.appleBuildMetadataFingerprint)
      || candidate.appleBuildComparisonMode !== "evidence_only"
    ))
    || candidate.generalGitCompatibility !== false
    || candidate.writeCommandCompatibility !== false
    || candidate.laterActivationEligibility !== false
    || candidate.repositoryReadAuthorityGranted !== false
    || candidate.mutationAuthorityGranted !== false
    || candidate.processAuthorityGranted !== false
    || candidate.observerAuthorityGranted !== false
    || candidate.cliExecutionAuthorityGranted !== false
    || candidate.compatibilityAuthorityGranted !== false
    || candidate.runtimeAuthorityGranted !== false
    || candidate.stagingAuthorityGranted !== false
    || candidate.deploymentAuthorityGranted !== false
    || candidate.credentialAuthorityGranted !== false
    || candidate.networkAuthorityGranted !== false
    || candidate.credentialsUsed !== false
    || candidate.networkUsed !== false
    || candidate.authorizationConsumed !== false
    || candidate.runtimeActivated !== false
    || candidate.observedLiveProcess !== false
    || candidate.authoritativeLive !== false
    || candidate.toctouEliminated !== false
    || candidate.authority !== "none"
    || candidate.contractIdentityFingerprint !== sha256(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.identity, PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY)
    || candidate.policyFingerprint !== sha256(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.policy, PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY)
    || !isSha256(candidate.inputLinkageFingerprint)
    || !isSha256(candidate.versionEvidenceFingerprint)
    || !isSha256(candidate.capabilityScopeFingerprint)
    || candidate.resultFingerprintAlgorithm !== "sha256"
    || !isSha256(candidate.resultFingerprint)
  ) reasons.push("compatibility_result_rejected");
  else {
    const withoutFingerprint = { ...candidate } as Record<string, unknown>;
    delete withoutFingerprint.resultFingerprintAlgorithm;
    delete withoutFingerprint.resultFingerprint;
    if (candidate.resultFingerprint !== sha256(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.result, withoutFingerprint)) reasons.push("input_fingerprint_rejected");
  }
}

function validateWorktree(evidence: unknown, reasons: DormantGitRunnerAuthorityPackageReason[]): void {
  if (!isExactRecord(evidence, WORKTREE_LINKAGE_KEYS)) {
    reasons.push("worktree_evidence_rejected");
    return;
  }
  const candidate = evidence as PureAggregateGitWorktreeLinkage;
  if (
    candidate.evidenceKind !== "pure_aggregate_read_only_git_worktree_linkage_evidence"
    || candidate.evidenceVersion !== 1
    || candidate.linkagePolicyId !== PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId
    || candidate.linkagePolicyVersion !== 1
    || !isSha256(candidate.repositoryRootPathFingerprint)
    || !isSha256(candidate.workingDirectoryFingerprint)
    || candidate.observationSequenceIdentity !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity
    || candidate.sourceClassification !== "approved_worktree_path_linkage"
    || candidate.canonicalFilesystemPathClaimed !== false
    || candidate.repositoryReadAuthorityGranted !== false
    || candidate.runtimeActivated !== false
    || candidate.toctouEliminated !== false
    || candidate.authority !== "none"
    || !isSha256(candidate.evidenceFingerprint)
  ) reasons.push("worktree_evidence_rejected");
  else {
    const { evidenceFingerprint, ...withoutFingerprint } = candidate;
    if (evidenceFingerprint !== sha256(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS.worktreeLinkage, withoutFingerprint)) reasons.push("input_fingerprint_rejected");
  }
}

function validateLinkage(input: PureDormantGitRunnerAuthorityPackageInput, reasons: DormantGitRunnerAuthorityPackageReason[]): void {
  if (input.executableResolutionEvidence.boundarySessionId !== input.session
    || input.executableRevalidationEvidence.boundarySessionId !== input.session
    || input.compatibilityPolicyResult.session !== input.session) reasons.push("session_linkage_rejected");
  if (input.executableResolutionEvidence.sanitizedStructuralPath !== "/usr/bin/git"
    || input.executableRevalidationEvidence.expectedResolvedAbsolutePath !== "/usr/bin/git"
    || input.compatibilityPolicyResult.executable !== "/usr/bin/git") reasons.push("executable_linkage_rejected");
  if (input.executableRevalidationEvidence.resolverEvidenceFingerprint !== input.executableResolutionEvidence.evidenceFingerprint) reasons.push("executable_linkage_rejected");
  if (input.executableRevalidationEvidence.platform !== input.platform || input.compatibilityPolicyResult.platform !== input.platform) reasons.push("platform_linkage_rejected");
  if (input.compatibilityPolicyResult.sourcePolicyId !== input.sourcePolicyId || input.compatibilityPolicyResult.sourcePolicyVersion !== input.sourcePolicyVersion) reasons.push("policy_linkage_rejected");
  if (input.approvedWorktreeEvidence.observationSequenceIdentity !== input.observationSequenceIdentity) reasons.push("sequence_identity_rejected");
}

function buildPackage(input: PureDormantGitRunnerAuthorityPackageInput): DormantGitRunnerAuthorityPackage {
  const stageGrants = STAGE_DEFINITIONS.map((definition, index) => buildStageGrant(definition, index as 0 | 1 | 2 | 3 | 4 | 5, input.approvedWorktreeEvidence)) as readonly DormantGitRunnerStageGrant[];
  const authorityPolicyFingerprint = buildAuthorityPolicyFingerprint();
  const core = {
    packageKind: "pure_dormant_git_runner_authority_package",
    packageVersion: 1,
    packageId: input.packageId,
    authorityPolicyFingerprint,
    contractId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId,
    authorityPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId,
    authorityPolicyVersion: 1,
    capabilitySetId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId,
    capabilitySetVersion: 1,
    observationSequenceIdentity: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity,
    session: input.session,
    platform: "macos",
    executable: "/usr/bin/git",
    sourcePolicyId: input.sourcePolicyId,
    sourcePolicyVersion: 1,
    executableResolutionFingerprint: input.executableResolutionEvidence.evidenceFingerprint,
    executableRevalidationFingerprint: input.executableRevalidationEvidence.evidenceFingerprint,
    compatibilityResultFingerprint: input.compatibilityPolicyResult.resultFingerprint,
    worktreeEvidenceFingerprint: input.approvedWorktreeEvidence.evidenceFingerprint,
    worktreeFingerprint: input.approvedWorktreeEvidence.workingDirectoryFingerprint,
    repositoryRootPathFingerprint: input.approvedWorktreeEvidence.repositoryRootPathFingerprint,
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    fixedDurationMs: 30000,
    expiryPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId,
    fixedDurationId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.fixedDurationId,
    freshnessPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId,
    timeRepresentationId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.timeRepresentationId,
    preConsumptionRevalidationRequired: true,
    perStageExpiryCheckRequired: true,
    aggregateConstructionExpiryCheckRequired: true,
    expiryExtensionAllowed: false,
    refreshAllowed: false,
    gracePeriodMs: 0,
    automaticReissueAllowed: false,
    packageState: "issued",
    currentStageIndex: 0,
    consumedStageCount: 0,
    remainingStageCount: 6,
    terminal: false,
    activeConsumer: false,
    retryCount: 0,
    fallbackAttempted: false,
    replayDetected: false,
    revoked: false,
    expired: false,
    executableResolutionLinked: true,
    executableRevalidationLinked: true,
    processCreationAuthorityGranted: true,
    exactReadOnlyGitCliExecutionAuthorityGranted: true,
    approvedRepositoryReadAuthorityGranted: true,
    boundedTextRetentionAuthorityGranted: true,
    boundedByteRetentionAuthorityGranted: true,
    stageEvidenceConstructionAuthorityGranted: true,
    aggregateObservationConstructionAuthorityGranted: true,
    nonAuthoritativeResultExposureAuthorityGranted: true,
    runtimeCallerActivationAuthorityGranted: false,
    mutationAuthorityGranted: false,
    arbitraryFilesystemReadAuthorityGranted: false,
    writeCommandAuthorityGranted: false,
    credentialAuthorityGranted: false,
    networkAuthorityGranted: false,
    stagingAuthorityGranted: false,
    deploymentAuthorityGranted: false,
    laterActivationEligibility: false,
    runtimeActivated: false,
    toctouEliminated: false,
    stageGrants,
  } satisfies Omit<DormantGitRunnerAuthorityPackage, "packageFingerprintAlgorithm" | "packageFingerprint">;
  return deepFreeze({
    ...core,
    packageFingerprintAlgorithm: "sha256",
    packageFingerprint: sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.package, core),
  } satisfies DormantGitRunnerAuthorityPackage);
}

function buildStageGrant(
  definition: typeof STAGE_DEFINITIONS[number],
  stageIndex: 0 | 1 | 2 | 3 | 4 | 5,
  worktree: PureAggregateGitWorktreeLinkage,
): DormantGitRunnerStageGrant {
  const expectedCapability = GIT_OBSERVATION_CAPABILITY_DEFINITIONS[definition.capabilityIdentity as keyof typeof GIT_OBSERVATION_CAPABILITY_DEFINITIONS];
  if (definition.capabilityIdentity !== "git_porcelain_status_v1" && canonicalize(definition.argv) !== canonicalize(expectedCapability.argv)) throw new Error("stage_policy_drift");
  const authorityPolicyFingerprint = buildAuthorityPolicyFingerprint();
  const core = {
    grantKind: "dormant_git_runner_stage_authority_grant",
    grantVersion: 1,
    authorityPolicyFingerprint,
    stageIndex,
    stageIdentity: definition.stageIdentity,
    capabilityIdentity: definition.capabilityIdentity,
    capabilityPurpose: definition.capabilityPurpose,
    executable: "/usr/bin/git",
    argv: definition.argv,
    workingDirectoryFingerprint: worktree.workingDirectoryFingerprint,
    repositoryRootPathFingerprint: worktree.repositoryRootPathFingerprint,
    outputMode: definition.outputMode,
    stdoutLimitBytes: definition.stdoutLimitBytes,
    stderrLimitBytes: definition.stderrLimitBytes,
    combinedLimitBytes: definition.combinedLimitBytes,
    processAttemptMaximum: 1,
    processCreationGrant: true,
    exactReadOnlyGitCliGrant: true,
    repositoryReadGrant: true,
    outputRetentionGrant: true,
    evidenceConstructionGrant: true,
    consumed: false,
    retryCount: 0,
    fallbackAttempted: false,
  } satisfies Omit<DormantGitRunnerStageGrant, "stageFingerprintAlgorithm" | "stageFingerprint">;
  return deepFreeze({
    ...core,
    stageFingerprintAlgorithm: "sha256",
    stageFingerprint: sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.stageGrant, core),
  } satisfies DormantGitRunnerStageGrant);
}

function buildResult(
  status: DormantGitRunnerAuthorityPackageStatus,
  reason: DormantGitRunnerAuthorityPackageReason,
  reasons: readonly DormantGitRunnerAuthorityPackageReason[],
  input: PureDormantGitRunnerAuthorityPackageInput | null,
  issuedPackage: DormantGitRunnerAuthorityPackage | null = null,
): PureDormantGitRunnerAuthorityPackageResult {
  const core = {
    resultKind: "pure_dormant_git_runner_authority_package_result",
    resultVersion: 1,
    contractKind: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractKind,
    contractId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId,
    contractVersion: 1,
    boundaryId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId,
    authorityPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId,
    authorityPolicyVersion: 1,
    authorityPolicyFingerprint: buildAuthorityPolicyFingerprint(),
    capabilitySetId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId,
    capabilitySetVersion: 1,
    expiryPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId,
    freshnessPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId,
    status,
    reason,
    reasons: sortedReasons(reasons),
    packageId: input?.packageId ?? null,
    packageFingerprint: issuedPackage?.packageFingerprint ?? null,
    executableResolutionFingerprint: input?.executableResolutionEvidence.evidenceFingerprint ?? null,
    executableRevalidationFingerprint: input?.executableRevalidationEvidence.evidenceFingerprint ?? null,
    compatibilityResultFingerprint: input?.compatibilityPolicyResult.resultFingerprint ?? null,
    worktreeEvidenceFingerprint: input?.approvedWorktreeEvidence.evidenceFingerprint ?? null,
    executable: input ? "/usr/bin/git" : null,
    worktreeFingerprint: input?.approvedWorktreeEvidence.workingDirectoryFingerprint ?? null,
    session: input?.session ?? null,
    sequenceIdentity: input?.observationSequenceIdentity ?? null,
    platform: input?.platform ?? null,
    sourcePolicyId: input?.sourcePolicyId ?? null,
    sourcePolicyVersion: input?.sourcePolicyVersion ?? null,
    issuedPackage,
    runtimeActivated: false,
    runtimeCallerActivationAuthorityGranted: false,
    mutationAuthorityGranted: false,
    arbitraryFilesystemReadAuthorityGranted: false,
    writeCommandAuthorityGranted: false,
    credentialAuthorityGranted: false,
    networkAuthorityGranted: false,
    stagingAuthorityGranted: false,
    deploymentAuthorityGranted: false,
    laterActivationEligibility: false,
    toctouEliminated: false,
    authority: status === "authority_package_issued" ? "fixture_scoped_dormant_authority_package" : "none",
  } satisfies Omit<PureDormantGitRunnerAuthorityPackageResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.result, core),
  } satisfies PureDormantGitRunnerAuthorityPackageResult);
}

function statusForReason(reason: DormantGitRunnerAuthorityPackageReason): DormantGitRunnerAuthorityPackageStatus {
  if (reason === "expiry_delta_rejected" || reason === "timestamp_grammar_rejected") return "expiry_policy_rejected";
  if (reason.startsWith("compatibility_") || reason === "capability_set_rejected") return "compatibility_rejected";
  if (reason.startsWith("worktree_") || reason === "sequence_identity_rejected") return "worktree_rejected";
  if (reason.startsWith("executable_") || reason.endsWith("_linkage_rejected")) return "prerequisite_rejected";
  return "input_rejected";
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function isValidVersionNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
}

function buildAuthorityPolicyFingerprint(): string {
  return sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.policy, buildCompleteAuthorityPolicyFingerprintInput());
}

export function buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest(policyPatch: unknown = null): string {
  const policyInput = policyPatch === null ? buildCompleteAuthorityPolicyFingerprintInput() : { ...(buildCompleteAuthorityPolicyFingerprintInput() as Record<string, unknown>), ...(policyPatch as Record<string, unknown>) };
  return sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.policy, policyInput);
}

function buildCompleteAuthorityPolicyFingerprintInput(): unknown {
  return COMPLETE_AUTHORITY_POLICY_MODEL;
}

function isExactRecord(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (Object.getPrototypeOf(value) !== Object.prototype) return false;
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key !== "string")) return false;
  const actual = (ownKeys as string[]).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) return false;
  for (const key of expected) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor) || descriptor.enumerable !== true) return false;
  }
  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) return false;
  }
  return true;
}

function isExactArray<T extends readonly unknown[]>(value: unknown, expected: T): value is T {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return false;
  if (hasEnumerablePrototypeProperties(value)) return false;
  if (value.length !== expected.length) return false;
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key !== "string")) return false;
  const expectedKeys = [...Array.from({ length: expected.length }, (_, index) => String(index)), "length"].sort();
  const actualKeys = (ownKeys as string[]).sort();
  if (actualKeys.length !== expectedKeys.length || actualKeys.some((key, index) => key !== expectedKeys[index])) return false;
  for (let index = 0; index < expected.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, index)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor) || descriptor.value !== expected[index]) return false;
  }
  return true;
}

function hasEnumerablePrototypeProperties(value: object): boolean {
  let prototype = Object.getPrototypeOf(value);
  while (prototype !== null) {
    for (const key of Reflect.ownKeys(prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
      if (descriptor?.enumerable === true) return true;
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return false;
}

function isResolverMetadata(value: unknown): value is NonNullable<ImmediatePreSpawnRevalidationEvidence["expectedMetadata"]> {
  if (!isExactRecord(value, RESOLVER_METADATA_KEYS)) return false;
  return isCanonicalNonNegativeIntegerString(value.deviceId)
    && isCanonicalNonNegativeIntegerString(value.inode)
    && isFiniteNonNegativeNumber(value.sizeBytes)
    && isFiniteNonNegativeNumber(value.mode)
    && isFiniteNonNegativeNumber(value.modifiedTimeMs);
}

function isCanonicalNonNegativeIntegerString(value: unknown): value is string {
  return typeof value === "string" && (value === "0" || /^[1-9][0-9]*$/u.test(value));
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0) && value >= 0;
}

function sortedReasons(reasons: readonly DormantGitRunnerAuthorityPackageReason[]): readonly DormantGitRunnerAuthorityPackageReason[] {
  const unique = [...new Set(reasons)];
  return REASON_ORDER.filter((reason) => unique.includes(reason));
}

function resolverFingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(stableNormalize(input))}`).digest("hex");
}

function colonJsonFingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(stableNormalize(input))}`).digest("hex");
}

function stableNormalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(stableNormalize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, stableNormalize(value)]));
  }
  return input;
}
