import {
  canonicalize,
  deepFreeze,
  hasExactKeys,
  isPlainRecord,
  isSha256,
  sha256,
} from "@/lib/post-trade-pure-read-only-git-observation-completion-contract-core";
import {
  PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY,
  type PureGitBranchStateResult,
} from "@/lib/post-trade-pure-read-only-git-branch-state-interpretation-contract-core";
import {
  PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY,
  type PureGitHeadObjectIdResult,
} from "@/lib/post-trade-pure-read-only-git-head-object-id-interpretation-contract-core";
import {
  PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY,
  type PureGitObjectFormatResult,
} from "@/lib/post-trade-pure-read-only-git-object-format-interpretation-contract-core";
import {
  PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY,
  PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS,
  type PureGitPorcelainStatusInterpretationResult,
} from "@/lib/post-trade-pure-read-only-git-porcelain-status-interpretation-contract-core";
import {
  PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY,
  type PureGitRepositoryRootResult,
} from "@/lib/post-trade-pure-read-only-git-repository-root-interpretation-contract-core";

export const PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_aggregate_read_only_git_repository_observation_contract",
  contractId: "ture.execution.pure-aggregate-read-only-git-repository-observation-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.aggregate-read-only-git-repository-observation.fixture-boundary.v1",
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  fixtureOnly: true,
  observedLiveProcess: false,
  authority: "none",
} as const);

export const PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY = deepFreeze({
  policyId: "ture.execution.aggregate-read-only-git-repository-observation.policy.v1",
  policyVersion: 1,
  acceptedTool: "git",
  acceptedExecutable: "/usr/bin/git",
  supportedObjectFormats: ["sha1", "sha256"] as const,
  sequenceIdentity: "ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1",
  stageSlots: [
    "repository_root",
    "object_format",
    "head_before",
    "branch_state",
    "porcelain_status",
    "head_after",
  ] as const,
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

export const PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-aggregate-read-only-git-repository-observation:identity:v1",
  policy: "ture:pure-aggregate-read-only-git-repository-observation:policy:v1",
  worktreeLinkage: "ture:pure-aggregate-read-only-git-repository-observation:worktree-linkage:v1",
  evidence: "ture:pure-aggregate-read-only-git-repository-observation:evidence:v1",
  result: "ture:pure-aggregate-read-only-git-repository-observation:result:v1",
} as const);

export type PureAggregateGitRepositoryObservationStatus =
  | "input_rejected"
  | "repository_root_mismatch"
  | "unsupported_object_format"
  | "head_changed_during_observation"
  | "detached_head"
  | "repository_dirty"
  | "repository_clean_stable_observation";

export type PureAggregateGitRepositoryObservationReason =
  | "input_contract_rejected"
  | "input_identity_rejected"
  | "aggregate_policy_rejected"
  | "root_evidence_rejected"
  | "object_format_evidence_rejected"
  | "head_before_evidence_rejected"
  | "branch_evidence_rejected"
  | "status_evidence_rejected"
  | "head_after_evidence_rejected"
  | "worktree_evidence_rejected"
  | "source_linkage_rejected"
  | "session_linkage_rejected"
  | "platform_linkage_rejected"
  | "policy_linkage_rejected"
  | "executable_linkage_rejected"
  | "worktree_linkage_rejected"
  | "sequence_identity_rejected"
  | "object_format_head_linkage_rejected"
  | "authority_rejected"
  | "runtime_claim_rejected"
  | "live_claim_rejected"
  | "toctou_claim_rejected"
  | "repository_root_mismatch"
  | "unsupported_object_format"
  | "head_changed_during_observation"
  | "detached_head"
  | "repository_dirty"
  | "repository_clean_stable_observation";

export type PureAggregateGitWorktreeLinkage = Readonly<{
  evidenceKind: "pure_aggregate_read_only_git_worktree_linkage_evidence";
  evidenceVersion: 1;
  linkagePolicyId: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId;
  linkagePolicyVersion: 1;
  repositoryRootPathFingerprint: string;
  workingDirectoryFingerprint: string;
  observationSequenceIdentity: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity;
  sourceClassification: "approved_worktree_path_linkage";
  canonicalFilesystemPathClaimed: false;
  repositoryReadAuthorityGranted: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  evidenceFingerprint: string;
}>;

export type PureAggregateGitRepositoryObservationInput = Readonly<{
  contractKind: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractKind;
  contractVersion: 1;
  boundaryId: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.boundaryId;
  policyId: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId;
  policyVersion: 1;
  repositoryRootEvidence: PureGitRepositoryRootResult;
  objectFormatEvidence: PureGitObjectFormatResult;
  headBeforeEvidence: PureGitHeadObjectIdResult;
  branchStateEvidence: PureGitBranchStateResult;
  porcelainStatusEvidence: PureGitPorcelainStatusInterpretationResult;
  headAfterEvidence: PureGitHeadObjectIdResult;
  approvedWorktreeEvidence: PureAggregateGitWorktreeLinkage;
}>;

export type PureAggregateGitRepositoryObservationEvidence = Readonly<{
  evidenceKind: "pure_aggregate_read_only_git_repository_observation_evidence";
  evidenceVersion: 1;
  contractKind: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractKind;
  contractId: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractId;
  contractVersion: 1;
  boundaryId: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.boundaryId;
  policyId: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId;
  policyVersion: 1;
  status: PureAggregateGitRepositoryObservationStatus;
  reason: PureAggregateGitRepositoryObservationReason;
  rootEvidenceFingerprint: string | null;
  objectFormatEvidenceFingerprint: string | null;
  headBeforeEvidenceFingerprint: string | null;
  branchEvidenceFingerprint: string | null;
  statusEvidenceFingerprint: string | null;
  headAfterEvidenceFingerprint: string | null;
  approvedWorktreeEvidenceFingerprint: string | null;
  observationSequenceIdentity: string | null;
  boundarySessionId: string | null;
  platform: "macos" | null;
  sourcePolicyId: string | null;
  sourcePolicyVersion: 1 | null;
  executable: "/usr/bin/git" | null;
  workingDirectoryFingerprint: string | null;
  repositoryRootMatched: boolean;
  objectFormat: "sha1" | "sha256" | null;
  objectFormatSupported: boolean;
  headBeforeObjectIdFingerprint: string | null;
  headAfterObjectIdFingerprint: string | null;
  headStable: boolean;
  branchState: "attached" | "detached" | null;
  branchNameFingerprint: string | null;
  detached: boolean;
  clean: boolean;
  dirty: boolean;
  stagedChangeCount: number | null;
  unstagedChangeCount: number | null;
  untrackedCount: number | null;
  ignoredCount: number | null;
  unmergedCount: number | null;
  submoduleChangeCount: number | null;
  laterActivationEligibility: false;
  eligibilityPolicyResolved: false;
  compatibilityDecision: null;
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
  credentialsUsed: false;
  networkUsed: false;
  authorizationConsumed: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  contractIdentityFingerprint: string;
  policyFingerprint: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type PureAggregateGitRepositoryObservationResult = Readonly<{
  resultKind: "pure_aggregate_read_only_git_repository_observation_result";
  resultVersion: 1;
  contractId: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.boundaryId;
  status: PureAggregateGitRepositoryObservationStatus;
  reason: PureAggregateGitRepositoryObservationReason;
  blockingReasons: readonly PureAggregateGitRepositoryObservationReason[];
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  runtimeActivated: false;
  compatibilityAuthorityGranted: false;
  repositoryReadAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  evidence: PureAggregateGitRepositoryObservationEvidence;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

type StageContext = Readonly<{
  boundarySessionId: string;
  platform: "macos";
  policyId: string;
  policyVersion: 1;
  executable: "/usr/bin/git";
  workingDirectoryFingerprint: string;
  observationSequenceIdentity: string;
}>;

const AGGREGATE_INPUT_KEYS = [
  "contractKind",
  "contractVersion",
  "boundaryId",
  "policyId",
  "policyVersion",
  "repositoryRootEvidence",
  "objectFormatEvidence",
  "headBeforeEvidence",
  "branchStateEvidence",
  "porcelainStatusEvidence",
  "headAfterEvidence",
  "approvedWorktreeEvidence",
] as const;

const WORKTREE_LINKAGE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "linkagePolicyId",
  "linkagePolicyVersion",
  "repositoryRootPathFingerprint",
  "workingDirectoryFingerprint",
  "observationSequenceIdentity",
  "sourceClassification",
  "canonicalFilesystemPathClaimed",
  "repositoryReadAuthorityGranted",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
  "evidenceFingerprint",
] as const;

const SIMPLE_RESULT_KEYS = [
  "resultKind",
  "resultVersion",
  "contractId",
  "status",
  "blockingReasons",
  "evidence",
  "resultFingerprint",
] as const;

const ROOT_EVIDENCE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "contractId",
  "boundaryId",
  "grammarId",
  "normalizationId",
  "sourceCompletionEvidenceFingerprint",
  "sourceSpawnFingerprint",
  "boundarySessionId",
  "purpose",
  "platform",
  "executable",
  "argv",
  "workingDirectoryFingerprint",
  "observationSequenceIdentity",
  "evidenceTimestamp",
  "status",
  "primaryReason",
  "reasons",
  "originalStdoutFingerprint",
  "normalizedStdoutFingerprint",
  "originalStdoutByteCount",
  "normalizedStdoutByteCount",
  "finalLfRemoved",
  "stderrEmpty",
  "eligibleCompletion",
  "repositoryRootPath",
  "repositoryRootPathFingerprint",
  "absolutePath",
  "canonicalFilesystemPathClaimed",
  "pathComponentCount",
  "rootPath",
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
  "authorizationConsumed",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
  "evidenceFingerprint",
] as const;

const OBJECT_FORMAT_EVIDENCE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "contractId",
  "boundaryId",
  "grammarId",
  "normalizationId",
  "sourceCompletionEvidenceFingerprint",
  "sourceSpawnFingerprint",
  "boundarySessionId",
  "purpose",
  "platform",
  "executable",
  "argv",
  "workingDirectoryFingerprint",
  "observationSequenceIdentity",
  "evidenceTimestamp",
  "status",
  "primaryReason",
  "reasons",
  "originalStdoutFingerprint",
  "normalizedStdoutFingerprint",
  "originalStdoutByteCount",
  "normalizedStdoutByteCount",
  "finalLfRemoved",
  "stderrEmpty",
  "eligibleCompletion",
  "objectFormat",
  "objectIdHexLength",
  "objectIdByteLength",
  "transitionFormat",
  "observedLiveProcess",
  "repositoryReadAuthorityGranted",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
  "evidenceFingerprint",
] as const;

const HEAD_EVIDENCE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "contractId",
  "boundaryId",
  "grammarId",
  "normalizationId",
  "sourceCompletionEvidenceFingerprint",
  "sourceSpawnFingerprint",
  "objectFormatEvidenceFingerprint",
  "boundarySessionId",
  "purpose",
  "platform",
  "executable",
  "argv",
  "workingDirectoryFingerprint",
  "observationSequenceIdentity",
  "status",
  "primaryReason",
  "reasons",
  "originalStdoutFingerprint",
  "normalizedStdoutFingerprint",
  "finalLfRemoved",
  "stderrEmpty",
  "eligibleCompletion",
  "objectFormat",
  "headObjectId",
  "headObjectIdFingerprint",
  "headObjectIdHexLength",
  "fullObjectId",
  "allZero",
  "observedLiveProcess",
  "repositoryReadAuthorityGranted",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
  "evidenceFingerprint",
] as const;

const BRANCH_EVIDENCE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "contractId",
  "boundaryId",
  "grammarId",
  "normalizationId",
  "sourceCompletionEvidenceFingerprint",
  "sourceSpawnFingerprint",
  "boundarySessionId",
  "purpose",
  "platform",
  "executable",
  "argv",
  "workingDirectoryFingerprint",
  "observationSequenceIdentity",
  "status",
  "primaryReason",
  "reasons",
  "originalStdoutFingerprint",
  "normalizedStdoutFingerprint",
  "finalLfRemoved",
  "stderrEmpty",
  "eligibleCompletion",
  "branchState",
  "branchName",
  "branchNameFingerprint",
  "detached",
  "shortRef",
  "refGrammarIdentity",
  "exactExitCode",
  "observedLiveProcess",
  "repositoryReadAuthorityGranted",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
  "evidenceFingerprint",
] as const;

const STATUS_RESULT_KEYS = [
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
  "repositoryReadAuthorityGranted",
  "deploymentAuthorityGranted",
  "blockingReasons",
  "evidence",
  "resultFingerprintAlgorithm",
  "resultFingerprint",
] as const;

const STATUS_EVIDENCE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "contractKind",
  "contractId",
  "contractVersion",
  "boundaryId",
  "grammarId",
  "grammarVersion",
  "normalizationId",
  "normalizationVersion",
  "sourceCompletionContractId",
  "sourceCompletionContractVersion",
  "sourceCompletionBoundaryId",
  "sourceCompletionResultFingerprint",
  "sourceCompletionEvidenceFingerprint",
  "sourceByteCompletionIdentityFingerprint",
  "sourceByteCompletionPolicyFingerprint",
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
  "sourcePolicyId",
  "sourcePolicyVersion",
  "canonicalExecutablePath",
  "fixedArgvIdentity",
  "argv",
  "workingDirectoryFingerprint",
  "observationSequenceIdentity",
  "sourceEvidenceTimestamp",
  "rawByteCount",
  "rawOutputFingerprint",
  "stderrEmpty",
  "eligibleCompletion",
  "truncated",
  "status",
  "reason",
  "clean",
  "recordCount",
  "cumulativePathByteCount",
  "stagedChangeCount",
  "unstagedChangeCount",
  "untrackedCount",
  "ignoredCount",
  "unmergedCount",
  "submoduleChangeCount",
  "unsupportedCount",
  "statusCodeBreakdown",
  "orderedRecordFingerprint",
  "recordSummaries",
  "fixtureOnly",
  "observedLiveProcess",
  "authoritativeLive",
  "repositoryReadAuthorityGranted",
  "mutationAuthorityGranted",
  "processAuthorityGranted",
  "observerAuthorityGranted",
  "cliExecutionAuthorityGranted",
  "compatibilityAuthorityGranted",
  "runtimeAuthorityGranted",
  "stagingAuthorityGranted",
  "deploymentAuthorityGranted",
  "credentialAuthorityGranted",
  "networkAuthorityGranted",
  "authorizationConsumed",
  "credentialsUsed",
  "networkUsed",
  "shellUsed",
  "pathLookupUsed",
  "inheritedEnvironmentUsed",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
  "contractIdentityFingerprint",
  "policyFingerprint",
  "evidenceFingerprintAlgorithm",
  "evidenceFingerprint",
] as const;

const REASON_ORDER: readonly PureAggregateGitRepositoryObservationReason[] = [
  "input_contract_rejected",
  "input_identity_rejected",
  "aggregate_policy_rejected",
  "root_evidence_rejected",
  "object_format_evidence_rejected",
  "head_before_evidence_rejected",
  "branch_evidence_rejected",
  "status_evidence_rejected",
  "head_after_evidence_rejected",
  "worktree_evidence_rejected",
  "source_linkage_rejected",
  "session_linkage_rejected",
  "platform_linkage_rejected",
  "policy_linkage_rejected",
  "executable_linkage_rejected",
  "worktree_linkage_rejected",
  "sequence_identity_rejected",
  "object_format_head_linkage_rejected",
  "authority_rejected",
  "runtime_claim_rejected",
  "live_claim_rejected",
  "toctou_claim_rejected",
  "repository_root_mismatch",
  "unsupported_object_format",
  "head_changed_during_observation",
  "detached_head",
  "repository_dirty",
  "repository_clean_stable_observation",
];

export function buildApprovedAggregateGitWorktreeLinkage(input: {
  repositoryRootPathFingerprint: string;
  workingDirectoryFingerprint: string;
  observationSequenceIdentity?: typeof PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity;
}): PureAggregateGitWorktreeLinkage {
  const base = deepFreeze({
    evidenceKind: "pure_aggregate_read_only_git_worktree_linkage_evidence" as const,
    evidenceVersion: 1 as const,
    linkagePolicyId: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId,
    linkagePolicyVersion: 1 as const,
    repositoryRootPathFingerprint: input.repositoryRootPathFingerprint,
    workingDirectoryFingerprint: input.workingDirectoryFingerprint,
    observationSequenceIdentity: input.observationSequenceIdentity ?? PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity,
    sourceClassification: "approved_worktree_path_linkage" as const,
    canonicalFilesystemPathClaimed: false as const,
    repositoryReadAuthorityGranted: false as const,
    runtimeActivated: false as const,
    toctouEliminated: false as const,
    authority: "none" as const,
  });
  return deepFreeze({
    ...base,
    evidenceFingerprint: sha256(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS.worktreeLinkage, canonicalize(base)),
  });
}

export function buildPureAggregateReadOnlyGitRepositoryObservation(input: unknown): PureAggregateGitRepositoryObservationResult {
  const inputValidation = validateInputEnvelope(input);
  if (!inputValidation.valid) return buildResult("input_rejected", inputValidation.reason, null);
  const aggregateInput = inputValidation.input;

  const root = validateRootResult(aggregateInput.repositoryRootEvidence);
  if (!root.valid) return buildResult("input_rejected", "root_evidence_rejected", null);
  const objectFormat = validateObjectFormatResult(aggregateInput.objectFormatEvidence);
  if (!objectFormat.valid) return buildResult("input_rejected", "object_format_evidence_rejected", { root });
  const headBefore = validateHeadResult(aggregateInput.headBeforeEvidence);
  if (!headBefore.valid) return buildResult("input_rejected", "head_before_evidence_rejected", { root, objectFormat });
  const branch = validateBranchResult(aggregateInput.branchStateEvidence);
  if (!branch.valid) return buildResult("input_rejected", "branch_evidence_rejected", { root, objectFormat, headBefore });
  const status = validatePorcelainStatusResult(aggregateInput.porcelainStatusEvidence);
  if (!status.valid) return buildResult("input_rejected", "status_evidence_rejected", { root, objectFormat, headBefore, branch });
  const headAfter = validateHeadResult(aggregateInput.headAfterEvidence);
  if (!headAfter.valid) return buildResult("input_rejected", "head_after_evidence_rejected", { root, objectFormat, headBefore, branch, status });
  const worktree = validateWorktreeLinkage(aggregateInput.approvedWorktreeEvidence);
  if (!worktree.valid) return buildResult("input_rejected", "worktree_evidence_rejected", { root, objectFormat, headBefore, branch, status, headAfter });

  const shared = validateSharedLinkage({ root, objectFormat, headBefore, branch, status, headAfter, worktree });
  if (shared) return buildResult("input_rejected", shared, { root, objectFormat, headBefore, branch, status, headAfter, worktree });

  if (root.evidence.repositoryRootPathFingerprint !== worktree.evidence.repositoryRootPathFingerprint) {
    return buildResult("repository_root_mismatch", "repository_root_mismatch", { root, objectFormat, headBefore, branch, status, headAfter, worktree });
  }
  if (objectFormat.evidence.objectFormat !== "sha1" && objectFormat.evidence.objectFormat !== "sha256") {
    return buildResult("unsupported_object_format", "unsupported_object_format", { root, objectFormat, headBefore, branch, status, headAfter, worktree });
  }
  if (headBefore.evidence.objectFormatEvidenceFingerprint !== objectFormat.evidence.evidenceFingerprint
    || headAfter.evidence.objectFormatEvidenceFingerprint !== objectFormat.evidence.evidenceFingerprint
    || headBefore.evidence.objectFormat !== objectFormat.evidence.objectFormat
    || headAfter.evidence.objectFormat !== objectFormat.evidence.objectFormat
    || headBefore.evidence.headObjectIdHexLength !== objectFormat.evidence.objectIdHexLength
    || headAfter.evidence.headObjectIdHexLength !== objectFormat.evidence.objectIdHexLength
  ) {
    return buildResult("input_rejected", "object_format_head_linkage_rejected", { root, objectFormat, headBefore, branch, status, headAfter, worktree });
  }
  if (headBefore.evidence.headObjectId !== headAfter.evidence.headObjectId) {
    return buildResult("head_changed_during_observation", "head_changed_during_observation", { root, objectFormat, headBefore, branch, status, headAfter, worktree });
  }
  if (branch.evidence.detached) {
    return buildResult("detached_head", "detached_head", { root, objectFormat, headBefore, branch, status, headAfter, worktree });
  }
  if (!status.evidence.clean
    || status.evidence.stagedChangeCount > 0
    || status.evidence.unstagedChangeCount > 0
    || status.evidence.untrackedCount > 0
    || status.evidence.ignoredCount > 0
    || status.evidence.unmergedCount > 0
    || status.evidence.submoduleChangeCount > 0
  ) {
    return buildResult("repository_dirty", "repository_dirty", { root, objectFormat, headBefore, branch, status, headAfter, worktree });
  }
  return buildResult("repository_clean_stable_observation", "repository_clean_stable_observation", { root, objectFormat, headBefore, branch, status, headAfter, worktree });
}

export function identityFingerprint(): string {
  return sha256(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS.identity, canonicalize(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY));
}

export function policyFingerprint(): string {
  return sha256(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS.policy, canonicalize(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY));
}

function validateInputEnvelope(input: unknown): { valid: true; input: PureAggregateGitRepositoryObservationInput } | { valid: false; reason: PureAggregateGitRepositoryObservationReason } {
  if (!isPlainRecord(input) || !hasExactKeys(input, AGGREGATE_INPUT_KEYS)) return { valid: false, reason: "input_contract_rejected" };
  const item = input as Partial<PureAggregateGitRepositoryObservationInput>;
  if (item.contractKind !== PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractKind
    || item.contractVersion !== 1
    || item.boundaryId !== PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.boundaryId
  ) return { valid: false, reason: "input_identity_rejected" };
  if (item.policyId !== PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId || item.policyVersion !== 1) return { valid: false, reason: "aggregate_policy_rejected" };
  return { valid: true, input: input as PureAggregateGitRepositoryObservationInput };
}

function validateRootResult(input: unknown) {
  if (!isPlainRecord(input) || !hasExactKeys(input, SIMPLE_RESULT_KEYS)) return { valid: false as const };
  const result = input as PureGitRepositoryRootResult;
  if (result.resultKind !== "pure_read_only_git_repository_root_interpretation_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.contractId
    || result.status !== "accepted_fixture_git_repository_root"
    || !singleReason(result.blockingReasons, "accepted")
    || !isPlainRecord(result.evidence)
    || !hasExactKeys(result.evidence, ROOT_EVIDENCE_KEYS)
    || result.evidence.evidenceKind !== "pure_read_only_git_repository_root_interpretation_evidence"
    || result.evidence.evidenceVersion !== 1
    || result.evidence.contractId !== PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.contractId
    || result.evidence.boundaryId !== PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.boundaryId
    || result.evidence.status !== "accepted"
    || result.evidence.primaryReason !== "accepted"
    || !singleReason(result.evidence.reasons, "accepted")
    || !commonSimpleEvidenceValid(result.evidence, ["rev-parse", "--show-toplevel"])
    || !isSha256(result.evidence.repositoryRootPathFingerprint)
    || typeof result.evidence.repositoryRootPath !== "string"
    || result.evidence.canonicalFilesystemPathClaimed !== false
    || result.evidence.absolutePath !== true
	    || result.evidence.rootPath !== false
	    || typeof result.evidence.pathComponentCount !== "number"
	    || !rootSecurityPostureValid(result.evidence)
	  ) return { valid: false as const };
	  if (!fingerprintsMatch(result, "ture:pure-read-only-git-root:evidence:v1", "ture:pure-read-only-git-root:result:v1")) return { valid: false as const };
	  return { valid: true as const, result, evidence: result.evidence, context: simpleContext(result.evidence) };
	}

function validateObjectFormatResult(input: unknown) {
  if (!isPlainRecord(input) || !hasExactKeys(input, SIMPLE_RESULT_KEYS)) return { valid: false as const };
  const result = input as PureGitObjectFormatResult;
  if (result.resultKind !== "pure_read_only_git_object_format_interpretation_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.contractId
    || result.status !== "accepted_fixture_git_object_format"
    || !singleReason(result.blockingReasons, "accepted")
    || !isPlainRecord(result.evidence)
    || !hasExactKeys(result.evidence, OBJECT_FORMAT_EVIDENCE_KEYS)
    || result.evidence.evidenceKind !== "pure_read_only_git_object_format_interpretation_evidence"
    || result.evidence.evidenceVersion !== 1
    || result.evidence.contractId !== PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.contractId
    || result.evidence.boundaryId !== PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.boundaryId
    || result.evidence.status !== "accepted"
    || result.evidence.primaryReason !== "accepted"
    || !singleReason(result.evidence.reasons, "accepted")
    || !commonSimpleEvidenceValid(result.evidence, ["rev-parse", "--show-object-format"])
    || (result.evidence.objectFormat !== "sha1" && result.evidence.objectFormat !== "sha256")
    || result.evidence.objectIdHexLength !== (result.evidence.objectFormat === "sha1" ? 40 : 64)
    || result.evidence.objectIdByteLength !== (result.evidence.objectFormat === "sha1" ? 20 : 32)
    || result.evidence.transitionFormat !== false
  ) return { valid: false as const };
  if (!fingerprintsMatch(result, "ture:pure-read-only-git-object-format:evidence:v1", "ture:pure-read-only-git-object-format:result:v1")) return { valid: false as const };
  return { valid: true as const, result, evidence: result.evidence, context: simpleContext(result.evidence) };
}

function validateHeadResult(input: unknown) {
  if (!isPlainRecord(input) || !hasExactKeys(input, SIMPLE_RESULT_KEYS)) return { valid: false as const };
  const result = input as PureGitHeadObjectIdResult;
  if (result.resultKind !== "pure_read_only_git_head_object_id_interpretation_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.contractId
    || result.status !== "accepted_fixture_git_head_object_id"
    || !singleReason(result.blockingReasons, "accepted")
    || !isPlainRecord(result.evidence)
    || !hasExactKeys(result.evidence, HEAD_EVIDENCE_KEYS)
    || result.evidence.evidenceKind !== "pure_read_only_git_head_object_id_interpretation_evidence"
    || result.evidence.evidenceVersion !== 1
    || result.evidence.contractId !== PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.contractId
    || result.evidence.boundaryId !== PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.boundaryId
    || result.evidence.status !== "accepted"
    || result.evidence.primaryReason !== "accepted"
    || !singleReason(result.evidence.reasons, "accepted")
    || !commonSimpleEvidenceValid(result.evidence, ["rev-parse", "--verify", "HEAD"])
    || !isSha256(result.evidence.objectFormatEvidenceFingerprint)
    || (result.evidence.objectFormat !== "sha1" && result.evidence.objectFormat !== "sha256")
    || !isNonEmptyString(result.evidence.headObjectId)
    || !isSha256(result.evidence.headObjectIdFingerprint)
    || result.evidence.headObjectIdHexLength !== (result.evidence.objectFormat === "sha1" ? 40 : 64)
    || result.evidence.headObjectId.length !== result.evidence.headObjectIdHexLength
    || result.evidence.fullObjectId !== true
    || result.evidence.allZero !== false
  ) return { valid: false as const };
  if (!fingerprintsMatch(result, "ture:pure-read-only-git-head-object-id:evidence:v1", "ture:pure-read-only-git-head-object-id:result:v1")) return { valid: false as const };
  return { valid: true as const, result, evidence: result.evidence, context: simpleContext(result.evidence) };
}

function validateBranchResult(input: unknown) {
  if (!isPlainRecord(input) || !hasExactKeys(input, SIMPLE_RESULT_KEYS)) return { valid: false as const };
  const result = input as PureGitBranchStateResult;
  if (result.resultKind !== "pure_read_only_git_branch_state_interpretation_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.contractId
    || result.status !== "accepted_fixture_git_branch_state"
    || !Array.isArray(result.blockingReasons)
    || result.blockingReasons.length !== 1
    || (result.blockingReasons[0] !== "attached" && result.blockingReasons[0] !== "detached")
    || !isPlainRecord(result.evidence)
    || !hasExactKeys(result.evidence, BRANCH_EVIDENCE_KEYS)
    || result.evidence.evidenceKind !== "pure_read_only_git_branch_state_interpretation_evidence"
    || result.evidence.evidenceVersion !== 1
    || result.evidence.contractId !== PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.contractId
    || result.evidence.boundaryId !== PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.boundaryId
    || result.evidence.status !== "accepted"
    || result.evidence.primaryReason !== result.blockingReasons[0]
    || !singleReason(result.evidence.reasons, result.blockingReasons[0])
    || !commonSimpleEvidenceValid(result.evidence, ["symbolic-ref", "--quiet", "--short", "HEAD"])
    || (result.evidence.branchState !== "attached" && result.evidence.branchState !== "detached")
    || result.evidence.detached !== (result.evidence.branchState === "detached")
    || result.evidence.shortRef !== (result.evidence.branchState === "attached")
    || result.evidence.exactExitCode !== (result.evidence.branchState === "attached" ? 0 : 1)
    || (result.evidence.branchState === "attached" && (!isNonEmptyString(result.evidence.branchName) || !isSha256(result.evidence.branchNameFingerprint)))
    || (result.evidence.branchState === "detached" && (result.evidence.branchName !== null || result.evidence.branchNameFingerprint !== null))
  ) return { valid: false as const };
  if (!fingerprintsMatch(result, "ture:pure-read-only-git-branch-state:evidence:v1", "ture:pure-read-only-git-branch-state:result:v1")) return { valid: false as const };
  return { valid: true as const, result, evidence: result.evidence, context: simpleContext(result.evidence) };
}

function validatePorcelainStatusResult(input: unknown) {
  if (!isPlainRecord(input) || !hasExactKeys(input, STATUS_RESULT_KEYS)) return { valid: false as const };
  const result = input as PureGitPorcelainStatusInterpretationResult;
  if (result.resultKind !== "pure_read_only_git_porcelain_status_interpretation_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractId
    || result.boundaryId !== PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.boundaryId
    || (result.status !== "accepted_clean" && result.status !== "accepted_dirty")
    || (result.reason !== "clean" && result.reason !== "dirty")
    || result.reason !== (result.status === "accepted_clean" ? "clean" : "dirty")
    || !singleReason(result.blockingReasons, result.reason)
    || result.fixtureOnly !== true
    || result.observedLiveProcess !== false
    || result.authoritativeLive !== false
    || result.authority !== "none"
    || result.runtimeActivated !== false
    || result.compatibilityAuthorityGranted !== false
    || result.repositoryReadAuthorityGranted !== false
    || result.deploymentAuthorityGranted !== false
    || result.resultFingerprintAlgorithm !== "sha256"
    || !isPlainRecord(result.evidence)
    || !hasExactKeys(result.evidence, STATUS_EVIDENCE_KEYS)
    || result.evidence.evidenceKind !== "pure_read_only_git_porcelain_status_interpretation_evidence"
    || result.evidence.evidenceVersion !== 1
    || result.evidence.contractKind !== PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractKind
    || result.evidence.contractId !== PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.contractId
    || result.evidence.contractVersion !== 1
    || result.evidence.boundaryId !== PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY.boundaryId
    || result.evidence.status !== result.status
    || result.evidence.reason !== result.reason
    || result.evidence.clean !== (result.status === "accepted_clean")
    || !statusCountsValid(result.evidence)
    || !statusSecurityValid(result.evidence)
    || result.evidence.evidenceFingerprintAlgorithm !== "sha256"
    || !isSha256(result.evidence.evidenceFingerprint)
  ) return { valid: false as const };
  const { evidenceFingerprint, ...evidenceWithoutFingerprint } = result.evidence;
  if (evidenceFingerprint !== sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.evidence, canonicalize(evidenceWithoutFingerprint))) return { valid: false as const };
  const { resultFingerprint, ...resultWithoutFingerprint } = result;
  if (resultFingerprint !== sha256(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_FINGERPRINT_DOMAINS.result, canonicalize(resultWithoutFingerprint))) return { valid: false as const };
  return { valid: true as const, result, evidence: result.evidence, context: statusContext(result.evidence) };
}

function validateWorktreeLinkage(input: unknown) {
  if (!isPlainRecord(input) || !hasExactKeys(input, WORKTREE_LINKAGE_KEYS)) return { valid: false as const };
  const evidence = input as PureAggregateGitWorktreeLinkage;
  if (evidence.evidenceKind !== "pure_aggregate_read_only_git_worktree_linkage_evidence"
    || evidence.evidenceVersion !== 1
    || evidence.linkagePolicyId !== PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId
    || evidence.linkagePolicyVersion !== 1
    || !isSha256(evidence.repositoryRootPathFingerprint)
    || !isSha256(evidence.workingDirectoryFingerprint)
    || evidence.observationSequenceIdentity !== PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity
    || evidence.sourceClassification !== "approved_worktree_path_linkage"
    || evidence.canonicalFilesystemPathClaimed !== false
    || evidence.repositoryReadAuthorityGranted !== false
    || evidence.runtimeActivated !== false
    || evidence.toctouEliminated !== false
    || evidence.authority !== "none"
  ) return { valid: false as const };
  const { evidenceFingerprint, ...withoutFingerprint } = evidence;
  if (evidenceFingerprint !== sha256(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS.worktreeLinkage, canonicalize(withoutFingerprint))) return { valid: false as const };
  return { valid: true as const, evidence };
}

function validateSharedLinkage(stages: {
  root: ValidRoot;
  objectFormat: ValidObjectFormat;
  headBefore: ValidHead;
  branch: ValidBranch;
  status: ValidStatus;
  headAfter: ValidHead;
  worktree: ValidWorktree;
}): PureAggregateGitRepositoryObservationReason | null {
  const simpleContexts = [
    stages.root.context,
    stages.objectFormat.context,
    stages.headBefore.context,
    stages.branch.context,
    stages.headAfter.context,
  ];
  const first = simpleContexts[0];
  const contexts = [...simpleContexts, stages.status.context];
  if (contexts.some((context) => context.boundarySessionId !== first.boundarySessionId)) return "session_linkage_rejected";
  if (contexts.some((context) => context.platform !== first.platform)) return "platform_linkage_rejected";
  if (simpleContexts.some((context) => context.policyId !== first.policyId || context.policyVersion !== first.policyVersion)
    || stages.status.context.policyId !== "pure_byte_oriented_porcelain_status_completion_policy_v1"
    || stages.status.context.policyVersion !== 1
  ) return "policy_linkage_rejected";
  if (contexts.some((context) => context.executable !== first.executable)) return "executable_linkage_rejected";
  if (contexts.some((context) => context.workingDirectoryFingerprint !== first.workingDirectoryFingerprint)
    || stages.worktree.evidence.workingDirectoryFingerprint !== first.workingDirectoryFingerprint
  ) return "worktree_linkage_rejected";
  if (contexts.some((context) => context.observationSequenceIdentity !== first.observationSequenceIdentity)
    || stages.worktree.evidence.observationSequenceIdentity !== first.observationSequenceIdentity
    || first.observationSequenceIdentity !== PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity
  ) return "sequence_identity_rejected";
  return null;
}

type ValidRoot = ReturnType<typeof validateRootResult> & { valid: true };
type ValidObjectFormat = ReturnType<typeof validateObjectFormatResult> & { valid: true };
type ValidHead = ReturnType<typeof validateHeadResult> & { valid: true };
type ValidBranch = ReturnType<typeof validateBranchResult> & { valid: true };
type ValidStatus = ReturnType<typeof validatePorcelainStatusResult> & { valid: true };
type ValidWorktree = ReturnType<typeof validateWorktreeLinkage> & { valid: true };

function buildResult(status: PureAggregateGitRepositoryObservationStatus, reason: PureAggregateGitRepositoryObservationReason, stages: Partial<{
  root: ValidRoot;
  objectFormat: ValidObjectFormat;
  headBefore: ValidHead;
  branch: ValidBranch;
  status: ValidStatus;
  headAfter: ValidHead;
  worktree: ValidWorktree;
}> | null): PureAggregateGitRepositoryObservationResult {
  const stageStatus = stages?.status;
  const root = stages?.root;
  const objectFormat = stages?.objectFormat;
  const headBefore = stages?.headBefore;
  const branch = stages?.branch;
  const headAfter = stages?.headAfter;
  const worktree = stages?.worktree;
  const clean = status === "repository_clean_stable_observation";
  const dirty = status === "repository_dirty";
  const evidenceBase = deepFreeze({
    evidenceKind: "pure_aggregate_read_only_git_repository_observation_evidence" as const,
    evidenceVersion: 1 as const,
    contractKind: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractKind,
    contractId: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractId,
    contractVersion: 1 as const,
    boundaryId: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.boundaryId,
    policyId: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId,
    policyVersion: 1 as const,
    status,
    reason,
    rootEvidenceFingerprint: root?.evidence.evidenceFingerprint ?? null,
    objectFormatEvidenceFingerprint: objectFormat?.evidence.evidenceFingerprint ?? null,
    headBeforeEvidenceFingerprint: headBefore?.evidence.evidenceFingerprint ?? null,
    branchEvidenceFingerprint: branch?.evidence.evidenceFingerprint ?? null,
    statusEvidenceFingerprint: stageStatus?.evidence.evidenceFingerprint ?? null,
    headAfterEvidenceFingerprint: headAfter?.evidence.evidenceFingerprint ?? null,
    approvedWorktreeEvidenceFingerprint: worktree?.evidence.evidenceFingerprint ?? null,
    observationSequenceIdentity: firstNonNull(root?.context.observationSequenceIdentity, objectFormat?.context.observationSequenceIdentity, headBefore?.context.observationSequenceIdentity, branch?.context.observationSequenceIdentity, stageStatus?.context.observationSequenceIdentity, headAfter?.context.observationSequenceIdentity, worktree?.evidence.observationSequenceIdentity),
    boundarySessionId: firstNonNull(root?.context.boundarySessionId, objectFormat?.context.boundarySessionId, headBefore?.context.boundarySessionId, branch?.context.boundarySessionId, stageStatus?.context.boundarySessionId, headAfter?.context.boundarySessionId),
    platform: firstNonNull(root?.context.platform, objectFormat?.context.platform, headBefore?.context.platform, branch?.context.platform, stageStatus?.context.platform, headAfter?.context.platform),
    sourcePolicyId: firstNonNull(root?.context.policyId, objectFormat?.context.policyId, headBefore?.context.policyId, branch?.context.policyId, stageStatus?.context.policyId, headAfter?.context.policyId),
    sourcePolicyVersion: firstNonNull(root?.context.policyVersion, objectFormat?.context.policyVersion, headBefore?.context.policyVersion, branch?.context.policyVersion, stageStatus?.context.policyVersion, headAfter?.context.policyVersion),
    executable: firstNonNull(root?.context.executable, objectFormat?.context.executable, headBefore?.context.executable, branch?.context.executable, stageStatus?.context.executable, headAfter?.context.executable),
    workingDirectoryFingerprint: firstNonNull(root?.context.workingDirectoryFingerprint, objectFormat?.context.workingDirectoryFingerprint, headBefore?.context.workingDirectoryFingerprint, branch?.context.workingDirectoryFingerprint, stageStatus?.context.workingDirectoryFingerprint, headAfter?.context.workingDirectoryFingerprint, worktree?.evidence.workingDirectoryFingerprint),
    repositoryRootMatched: status !== "repository_root_mismatch" && !!root && !!worktree && root.evidence.repositoryRootPathFingerprint === worktree.evidence.repositoryRootPathFingerprint,
    objectFormat: objectFormat?.evidence.objectFormat ?? null,
    objectFormatSupported: !!objectFormat && (objectFormat.evidence.objectFormat === "sha1" || objectFormat.evidence.objectFormat === "sha256"),
    headBeforeObjectIdFingerprint: headBefore?.evidence.headObjectIdFingerprint ?? null,
    headAfterObjectIdFingerprint: headAfter?.evidence.headObjectIdFingerprint ?? null,
    headStable: !!headBefore && !!headAfter && headBefore.evidence.headObjectId === headAfter.evidence.headObjectId,
    branchState: branch?.evidence.branchState ?? null,
    branchNameFingerprint: branch?.evidence.branchNameFingerprint ?? null,
    detached: branch?.evidence.detached ?? false,
    clean,
    dirty,
    stagedChangeCount: stageStatus?.evidence.stagedChangeCount ?? null,
    unstagedChangeCount: stageStatus?.evidence.unstagedChangeCount ?? null,
    untrackedCount: stageStatus?.evidence.untrackedCount ?? null,
    ignoredCount: stageStatus?.evidence.ignoredCount ?? null,
    unmergedCount: stageStatus?.evidence.unmergedCount ?? null,
    submoduleChangeCount: stageStatus?.evidence.submoduleChangeCount ?? null,
    laterActivationEligibility: false as const,
    eligibilityPolicyResolved: false as const,
    compatibilityDecision: null,
    ...securityFields(),
    contractIdentityFingerprint: identityFingerprint(),
    policyFingerprint: policyFingerprint(),
    evidenceFingerprintAlgorithm: "sha256" as const,
  } satisfies Omit<PureAggregateGitRepositoryObservationEvidence, "evidenceFingerprint">);
  const evidence = deepFreeze({
    ...evidenceBase,
    evidenceFingerprint: sha256(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS.evidence, canonicalize(evidenceBase)),
  });
  const base = deepFreeze({
    resultKind: "pure_aggregate_read_only_git_repository_observation_result" as const,
    resultVersion: 1 as const,
    contractId: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.boundaryId,
    status,
    reason,
    blockingReasons: sortReasons([reason]),
    fixtureOnly: true as const,
    observedLiveProcess: false as const,
    authoritativeLive: false as const,
    authority: "none" as const,
    runtimeActivated: false as const,
    compatibilityAuthorityGranted: false as const,
    repositoryReadAuthorityGranted: false as const,
    deploymentAuthorityGranted: false as const,
    evidence,
    resultFingerprintAlgorithm: "sha256" as const,
  } satisfies Omit<PureAggregateGitRepositoryObservationResult, "resultFingerprint">);
  return deepFreeze({
    ...base,
    resultFingerprint: sha256(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS.result, canonicalize(base)),
  });
}

function commonSimpleEvidenceValid(evidence: {
  sourceCompletionEvidenceFingerprint: string | null;
  sourceSpawnFingerprint: string | null;
  boundarySessionId: string | null;
  purpose: "first_live_read_only_staging_preflight" | null;
  platform: "macos" | null;
  executable: "/usr/bin/git" | null;
  argv: readonly string[] | null;
  workingDirectoryFingerprint: string | null;
  observationSequenceIdentity: string | null;
  evidenceTimestamp?: string | null;
  stderrEmpty: boolean;
  eligibleCompletion: boolean;
  observedLiveProcess: false;
  repositoryReadAuthorityGranted: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
}, expectedArgv: readonly string[]): boolean {
  return isSha256(evidence.sourceCompletionEvidenceFingerprint)
    && isSha256(evidence.sourceSpawnFingerprint)
    && isNonEmptyString(evidence.boundarySessionId)
    && evidence.purpose === "first_live_read_only_staging_preflight"
    && evidence.platform === "macos"
    && evidence.executable === "/usr/bin/git"
    && sameArray(evidence.argv, expectedArgv)
    && isSha256(evidence.workingDirectoryFingerprint)
    && isNonEmptyString(evidence.observationSequenceIdentity)
    && (evidence.evidenceTimestamp === undefined || typeof evidence.evidenceTimestamp === "string")
    && evidence.stderrEmpty === true
    && evidence.eligibleCompletion === true
    && evidence.observedLiveProcess === false
    && evidence.repositoryReadAuthorityGranted === false
    && evidence.runtimeActivated === false
    && evidence.toctouEliminated === false
    && evidence.authority === "none";
}

function simpleContext(evidence: {
  boundarySessionId: string | null;
  platform: "macos" | null;
  executable: "/usr/bin/git" | null;
  workingDirectoryFingerprint: string | null;
  observationSequenceIdentity: string | null;
}): StageContext {
  return {
    boundarySessionId: evidence.boundarySessionId ?? "",
    platform: evidence.platform ?? "macos",
    policyId: "pure_read_only_git_observation_completion_policy_v1",
    policyVersion: 1,
    executable: evidence.executable ?? "/usr/bin/git",
    workingDirectoryFingerprint: evidence.workingDirectoryFingerprint ?? "",
    observationSequenceIdentity: evidence.observationSequenceIdentity ?? "",
  };
}

function statusContext(evidence: {
  boundarySessionId: string;
  platform: "macos";
  canonicalExecutablePath: "/usr/bin/git";
  sourcePolicyId: string;
  sourcePolicyVersion: 1;
  workingDirectoryFingerprint: string;
  observationSequenceIdentity: string;
}): StageContext {
  return {
    boundarySessionId: evidence.boundarySessionId,
    platform: evidence.platform,
    policyId: evidence.sourcePolicyId,
    policyVersion: evidence.sourcePolicyVersion,
    executable: evidence.canonicalExecutablePath,
    workingDirectoryFingerprint: evidence.workingDirectoryFingerprint,
    observationSequenceIdentity: evidence.observationSequenceIdentity,
  };
}

function statusCountsValid(evidence: NonNullable<PureGitPorcelainStatusInterpretationResult["evidence"]>): boolean {
  const numericFields = [
    evidence.rawByteCount,
    evidence.recordCount,
    evidence.cumulativePathByteCount,
    evidence.stagedChangeCount,
    evidence.unstagedChangeCount,
    evidence.untrackedCount,
    evidence.ignoredCount,
    evidence.unmergedCount,
    evidence.submoduleChangeCount,
    evidence.unsupportedCount,
  ];
  return numericFields.every((value) => Number.isInteger(value) && value >= 0)
    && evidence.ignoredCount === 0
    && evidence.submoduleChangeCount === 0
    && evidence.unsupportedCount === 0
    && evidence.clean === (evidence.status === "accepted_clean")
    && evidence.recordCount === evidence.recordSummaries.length
    && evidence.stagedChangeCount === evidence.recordSummaries.filter((record) => record.stagedChange).length
    && evidence.unstagedChangeCount === evidence.recordSummaries.filter((record) => record.unstagedChange).length
    && evidence.untrackedCount === evidence.recordSummaries.filter((record) => record.untracked).length
    && evidence.unmergedCount === evidence.recordSummaries.filter((record) => record.unmerged).length;
}

	function statusSecurityValid(evidence: NonNullable<PureGitPorcelainStatusInterpretationResult["evidence"]>): boolean {
	  return evidence.fixtureOnly === true
    && evidence.observedLiveProcess === false
    && evidence.authoritativeLive === false
    && evidence.repositoryReadAuthorityGranted === false
    && evidence.mutationAuthorityGranted === false
    && evidence.processAuthorityGranted === false
    && evidence.observerAuthorityGranted === false
    && evidence.cliExecutionAuthorityGranted === false
    && evidence.compatibilityAuthorityGranted === false
    && evidence.runtimeAuthorityGranted === false
    && evidence.stagingAuthorityGranted === false
    && evidence.deploymentAuthorityGranted === false
    && evidence.credentialAuthorityGranted === false
    && evidence.networkAuthorityGranted === false
    && evidence.authorizationConsumed === false
    && evidence.credentialsUsed === false
    && evidence.networkUsed === false
    && evidence.shellUsed === false
    && evidence.pathLookupUsed === false
    && evidence.inheritedEnvironmentUsed === false
    && evidence.runtimeActivated === false
    && evidence.toctouEliminated === false
    && evidence.authority === "none"
    && evidence.stderrEmpty === true
    && evidence.eligibleCompletion === true
    && evidence.truncated === false
    && evidence.platform === "macos"
    && evidence.toolIdentity === "git"
    && evidence.canonicalExecutablePath === "/usr/bin/git"
    && evidence.purpose === "first_live_read_only_staging_preflight"
    && isSha256(evidence.workingDirectoryFingerprint)
    && isNonEmptyString(evidence.observationSequenceIdentity)
    && isSha256(evidence.sourceSpawnFingerprint)
    && isSha256(evidence.sourceSpawnEvidenceFingerprint)
	    && isSha256(evidence.sourceSpawnObservationFingerprint);
	}

	function rootSecurityPostureValid(evidence: ValidRoot["evidence"]): boolean {
	  return evidence.observedLiveProcess === false
	    && evidence.repositoryReadAuthorityGranted === false
	    && evidence.processAuthorityGranted === false
	    && evidence.observerAuthorityGranted === false
	    && evidence.cliExecutionAuthorityGranted === false
	    && evidence.compatibilityAuthorityGranted === false
	    && evidence.runtimeAuthorityGranted === false
	    && evidence.stagingAuthorityGranted === false
	    && evidence.deploymentAuthorityGranted === false
	    && evidence.credentialAuthorityGranted === false
	    && evidence.networkAuthorityGranted === false
	    && evidence.mutationAuthorityGranted === false
	    && evidence.authorizationConsumed === false
	    && evidence.runtimeActivated === false
	    && evidence.toctouEliminated === false
	    && evidence.authority === "none";
	}

	function fingerprintsMatch(result: { evidence: { evidenceFingerprint: string }; resultFingerprint: string }, evidenceDomain: string, resultDomain: string): boolean {
  const { evidenceFingerprint, ...evidenceWithoutFingerprint } = result.evidence;
  if (evidenceFingerprint !== sha256(evidenceDomain, canonicalize(evidenceWithoutFingerprint))) return false;
  const { resultFingerprint, ...resultWithoutFingerprint } = result;
  return resultFingerprint === sha256(resultDomain, canonicalize(resultWithoutFingerprint));
}

function securityFields() {
  return {
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
    credentialsUsed: false as const,
    networkUsed: false as const,
    authorizationConsumed: false as const,
    runtimeActivated: false as const,
    toctouEliminated: false as const,
    authority: "none" as const,
  };
}

function firstNonNull<T>(...values: readonly (T | null | undefined)[]): T | null {
  return values.find((value): value is T => value !== null && value !== undefined) ?? null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function sameArray(value: unknown, expected: readonly string[]): boolean {
  return Array.isArray(value) && value.length === expected.length && value.every((item, index) => item === expected[index]);
}

function singleReason(value: unknown, expected: string): boolean {
  return Array.isArray(value) && value.length === 1 && value[0] === expected;
}

function sortReasons(reasons: readonly PureAggregateGitRepositoryObservationReason[]): readonly PureAggregateGitRepositoryObservationReason[] {
  const unique = [...new Set(reasons)];
  return deepFreeze(unique.sort((a, b) => REASON_ORDER.indexOf(a) - REASON_ORDER.indexOf(b)));
}
