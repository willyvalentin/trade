import {
  PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY,
  PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS,
  PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY,
  buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest,
  type DormantGitRunnerAuthorityPackage,
  type DormantGitRunnerStageGrant,
  type PureDormantGitRunnerAuthorityPackageResult,
} from "@/lib/post-trade-pure-dormant-git-runner-authority-package-contract-core";
import {
  canonicalize,
  deepFreeze,
  isSha256,
  sha256,
} from "@/lib/post-trade-pure-read-only-git-observation-completion-contract-core";

export const PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_dormant_git_authority_consumption_transition_contract",
  contractId: "ture.execution.pure-dormant-git-authority-consumption-transition-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.dormant-git-authority-consumption-transition.fixture-boundary.v1",
  purpose: "first_live_read_only_staging_preflight",
  fixtureOnly: true,
  authority: "none",
} as const);

export const PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY = deepFreeze({
  policyId: "ture.execution.dormant-git-authority-consumption.transition-policy.v1",
  policyVersion: 1,
  statePolicyId: "ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1",
  replayPolicyId: "ture.execution.dormant-git-authority-consumption.replay-policy.v1",
  concurrencyPolicyId: "ture.execution.dormant-git-authority-consumption.concurrency-policy.v1",
  terminalStatePolicyId: "ture.execution.dormant-git-authority-consumption.terminal-state-policy.v1",
  auditEventPolicyId: "ture.execution.dormant-git-authority-consumption.audit-event-policy.v1",
  compareAndSetPolicyId: "ture.execution.dormant-git-authority-consumption.compare-and-set-policy.v1",
  stageCount: 6,
  fixedDurationMs: 30000,
  retryCount: 0,
  fallbackAllowed: false,
  runtimeActivated: false,
  toctouEliminated: false,
  authority: "none",
} as const);

export const PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-dormant-git-authority-consumption-transition:identity:v1",
  policy: "ture:pure-dormant-git-authority-consumption-transition:policy:v1",
  consumptionKey: "ture:pure-dormant-git-authority-consumption-transition:consumption-key:v1",
  state: "ture:pure-dormant-git-authority-consumption-transition:state:v1",
  auditEvent: "ture:pure-dormant-git-authority-consumption-transition:audit-event:v1",
  result: "ture:pure-dormant-git-authority-consumption-transition:result:v1",
} as const);

export type DormantGitAuthorityConsumptionState =
  | "issued"
  | "active"
  | "partially_consumed"
  | "consumed"
  | "failed_consumed"
  | "ambiguous_failed_consumed"
  | "expired"
  | "revoked";

export type DormantGitAuthorityConsumptionOperation =
  | "register_package"
  | "claim_consumer"
  | "consume_stage"
  | "record_stage_completion"
  | "terminalize_failure"
  | "terminalize_ambiguous_failure"
  | "terminalize_expiry"
  | "revoke_package"
  | "finalize_aggregate";

export type DormantGitAuthorityConsumptionReason =
  | "input_contract_rejected"
  | "input_identity_rejected"
  | "input_fingerprint_rejected"
  | "current_state_rejected"
  | "authority_package_rejected"
  | "operation_rejected"
  | "package_linkage_rejected"
  | "consumer_linkage_rejected"
  | "stale_transition_rejected"
  | "state_transition_rejected"
  | "package_terminal_rejected"
  | "package_expired"
  | "timestamp_rejected"
  | "package_not_claimable"
  | "concurrent_consumer_rejected"
  | "stage_order_rejected"
  | "stage_already_consumed"
  | "stage_not_consumed"
  | "stage_completion_already_recorded"
  | "stage_prerequisite_rejected"
  | "process_request_linkage_rejected"
  | "completion_linkage_rejected"
  | "detached_outcome_rejected"
  | "failure_terminalization_rejected"
  | "ambiguous_terminalization_rejected"
  | "revocation_rejected"
  | "expiry_transition_rejected"
  | "aggregate_prerequisite_rejected"
  | "aggregate_finalization_rejected"
  | "package_registered"
  | "consumer_claimed"
  | "stage_authority_consumed"
  | "stage_completion_recorded"
  | "stage_failed_terminal"
  | "ambiguous_failed_terminal"
  | "package_expired_terminal"
  | "package_revoked_terminal"
  | "sequence_consumed";

export type DormantGitStageCompletionOutcome =
  | "accepted"
  | "accepted_detached_observation"
  | "rejected"
  | "process_failed"
  | "ambiguous_process_state";

export type DormantGitAuthorityConsumptionStageState = Readonly<{
  stageRecordKind: "dormant_git_authority_consumption_stage_state";
  stageRecordVersion: 1;
  stageIndex: 0 | 1 | 2 | 3 | 4 | 5;
  stageIdentity: string;
  stageGrantFingerprint: string;
  consumed: boolean;
  consumedAt: string | null;
  consumedByFingerprint: string | null;
  stageConsumptionFingerprint: string | null;
  processRequestFingerprint: string | null;
  completionRecorded: boolean;
  completionFingerprint: string | null;
  interpretationFingerprint: string | null;
  outcome: DormantGitStageCompletionOutcome | null;
  reason: DormantGitAuthorityConsumptionReason | null;
  completedAt: string | null;
}>;

export type DormantGitAuthorityConsumptionCurrentState = Readonly<{
  stateKind: "dormant_git_authority_consumption_current_state";
  stateVersion: 1;
  recordId: string;
  consumptionKey: string;
  authorityPackageId: string;
  authorityPackageFingerprint: string;
  authorityPolicyFingerprint: string;
  session: string;
  sequenceIdentity: string;
  executableFingerprint: string;
  worktreeFingerprint: string;
  compatibilityResultFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  state: DormantGitAuthorityConsumptionState;
  currentStageIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  consumedStageCount: number;
  remainingStageCount: number;
  transitionVersion: number;
  activeConsumerId: string | null;
  activeConsumerFingerprint: string | null;
  claimedAt: string | null;
  terminal: boolean;
  terminalReason: DormantGitAuthorityConsumptionReason | null;
  terminalAt: string | null;
  expired: boolean;
  revoked: boolean;
  retryCount: 0;
  fallbackAttempted: false;
  stages: readonly DormantGitAuthorityConsumptionStageState[];
  aggregateFingerprint: string | null;
  nextAuditSequence: number;
  stateCoreFingerprint: string;
  lastAuditEventFingerprint: string | null;
  stateFingerprintAlgorithm: "sha256";
  stateFingerprint: string;
}>;

export type DormantGitAuthorityConsumptionAuditEvent = Readonly<{
  eventKind: "dormant_git_authority_consumption_audit_event";
  eventVersion: 1;
  eventIdentity: "ture.execution.dormant-git-authority-consumption.audit-event.fixture.v1";
  eventPolicyId: typeof PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY.auditEventPolicyId;
  eventPolicyVersion: 1;
  eventSequence: number;
  operation: DormantGitAuthorityConsumptionOperation;
  authorityPackageId: string;
  packageFingerprint: string;
  authorityPolicyFingerprint: string;
  consumptionKey: string;
  previousStateFingerprint: string | null;
  nextStateCoreFingerprint: string;
  consumerFingerprint: string | null;
  stageIndex: 0 | 1 | 2 | 3 | 4 | 5 | null;
  stageIdentity: string | null;
  transitionVersionBefore: number | null;
  transitionVersionAfter: number | null;
  expectedTransitionVersion: number | null;
  resultingTransitionVersion: number;
  status: "transition_permitted";
  reason: DormantGitAuthorityConsumptionReason;
  observedAt: string;
  evidenceFingerprint: string | null;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  atomicReplayProtectionPresent: false;
  storageCommitted: false;
  eventFingerprintAlgorithm: "sha256";
  eventFingerprint: string;
}>;

type BaseInput = Readonly<{
  inputKind: "pure_dormant_git_authority_consumption_transition_input";
  inputVersion: 1;
  contractId: typeof PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId;
  operation: DormantGitAuthorityConsumptionOperation;
  observedAt: string;
}>;

export type RegisterPackageTransitionInput = BaseInput & Readonly<{
  operation: "register_package";
  authorityPackageResult: PureDormantGitRunnerAuthorityPackageResult;
  consumptionKey: string;
  initialTransitionVersion: 0;
}>;

export type ExistingStateTransitionInput = BaseInput & Readonly<{
  currentState: DormantGitAuthorityConsumptionCurrentState;
  currentStateFingerprint: string;
  expectedTransitionVersion: number;
}>;

export type ClaimConsumerTransitionInput = ExistingStateTransitionInput & Readonly<{
  operation: "claim_consumer";
  consumerId: string;
  consumerFingerprint: string;
}>;

export type ConsumeStageTransitionInput = ExistingStateTransitionInput & Readonly<{
  operation: "consume_stage";
  consumerId: string;
  consumerFingerprint: string;
  stageIndex: 0 | 1 | 2 | 3 | 4 | 5;
  stageGrantFingerprint: string;
  processRequestFingerprint: string;
}>;

export type RecordStageCompletionTransitionInput = ExistingStateTransitionInput & Readonly<{
  operation: "record_stage_completion";
  consumerId: string;
  consumerFingerprint: string;
  stageIndex: 0 | 1 | 2 | 3 | 4 | 5;
  processRequestFingerprint: string;
  completionFingerprint: string;
  interpretationFingerprint: string | null;
  outcome: DormantGitStageCompletionOutcome;
}>;

export type TerminalizeFailureTransitionInput = ExistingStateTransitionInput & Readonly<{
  operation: "terminalize_failure" | "terminalize_ambiguous_failure";
  consumerId: string;
  consumerFingerprint: string;
  failureFingerprint: string;
}>;

export type ExpiryTransitionInput = ExistingStateTransitionInput & Readonly<{
  operation: "terminalize_expiry";
}>;

export type RevokePackageTransitionInput = ExistingStateTransitionInput & Readonly<{
  operation: "revoke_package";
  revocationFingerprint: string;
  revocationReason: "operator_revoked" | "policy_revoked" | "superseded_by_new_package";
}>;

export type FinalizeAggregateTransitionInput = ExistingStateTransitionInput & Readonly<{
  operation: "finalize_aggregate";
  consumerId: string;
  consumerFingerprint: string;
  aggregateFingerprint: string;
}>;

export type DormantGitAuthorityConsumptionTransitionInput =
  | RegisterPackageTransitionInput
  | ClaimConsumerTransitionInput
  | ConsumeStageTransitionInput
  | RecordStageCompletionTransitionInput
  | TerminalizeFailureTransitionInput
  | ExpiryTransitionInput
  | RevokePackageTransitionInput
  | FinalizeAggregateTransitionInput;

export type DormantGitAuthorityConsumptionTransitionResult = Readonly<{
  resultKind: "pure_dormant_git_authority_consumption_transition_result";
  resultVersion: 1;
  contractKind: typeof PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractKind;
  contractId: typeof PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId;
  contractVersion: 1;
  boundaryId: typeof PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId;
  transitionPolicyId: typeof PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY.policyId;
  transitionPolicyVersion: 1;
  operation: DormantGitAuthorityConsumptionOperation | null;
  status: "transition_permitted" | "transition_rejected";
  reason: DormantGitAuthorityConsumptionReason;
  previousStateFingerprint: string | null;
  nextStateCoreFingerprint: string | null;
  nextStateFingerprint: string | null;
  expectedTransitionVersion: number | null;
  resultingTransitionVersion: number | null;
  nextState: DormantGitAuthorityConsumptionCurrentState | null;
  auditEvents: readonly DormantGitAuthorityConsumptionAuditEvent[];
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

const REGISTER_KEYS = ["inputKind", "inputVersion", "contractId", "boundaryId", "operation", "observedAt", "authorityPackageResult", "consumptionKey", "initialTransitionVersion"] as const;
const EXISTING_KEYS = ["inputKind", "inputVersion", "contractId", "boundaryId", "operation", "observedAt", "currentState", "currentStateFingerprint", "expectedTransitionVersion"] as const;
const CLAIM_KEYS = [...EXISTING_KEYS, "consumerId", "consumerFingerprint"] as const;
const CONSUME_KEYS = [...CLAIM_KEYS, "stageIndex", "stageGrantFingerprint", "processRequestFingerprint"] as const;
const COMPLETE_KEYS = [...CLAIM_KEYS, "stageIndex", "processRequestFingerprint", "completionFingerprint", "interpretationFingerprint", "outcome"] as const;
const TERMINALIZE_FAILURE_KEYS = [...CLAIM_KEYS, "failureFingerprint"] as const;
const REVOKE_KEYS = [...EXISTING_KEYS, "revocationFingerprint", "revocationReason"] as const;
const AGGREGATE_KEYS = [...CLAIM_KEYS, "aggregateFingerprint"] as const;

const STATE_KEYS = [
  "stateKind", "stateVersion", "recordId", "consumptionKey", "authorityPackageId", "authorityPackageFingerprint",
  "authorityPolicyFingerprint", "session", "sequenceIdentity", "executableFingerprint", "worktreeFingerprint",
  "compatibilityResultFingerprint", "issuedAt", "expiresAt", "state", "currentStageIndex", "consumedStageCount",
  "remainingStageCount", "transitionVersion", "activeConsumerId", "activeConsumerFingerprint", "claimedAt",
  "terminal", "terminalReason", "terminalAt", "expired", "revoked", "retryCount", "fallbackAttempted",
  "stages", "aggregateFingerprint", "nextAuditSequence", "stateCoreFingerprint", "lastAuditEventFingerprint",
  "stateFingerprintAlgorithm", "stateFingerprint",
] as const;

const STAGE_STATE_KEYS = [
  "stageRecordKind", "stageRecordVersion", "stageIndex", "stageIdentity", "stageGrantFingerprint",
  "consumed", "consumedAt", "consumedByFingerprint", "stageConsumptionFingerprint", "processRequestFingerprint",
  "completionRecorded", "completionFingerprint", "interpretationFingerprint", "outcome", "reason",
  "completedAt",
] as const;

const PACKAGE_RESULT_KEYS = [
  "resultKind", "resultVersion", "contractKind", "contractId", "contractVersion", "boundaryId",
  "authorityPolicyId", "authorityPolicyVersion", "authorityPolicyFingerprint", "capabilitySetId",
  "capabilitySetVersion", "expiryPolicyId", "freshnessPolicyId", "status", "reason", "reasons",
  "packageId", "packageFingerprint", "executableResolutionFingerprint", "executableRevalidationFingerprint",
  "compatibilityResultFingerprint", "worktreeEvidenceFingerprint", "executable", "worktreeFingerprint",
  "session", "sequenceIdentity", "platform", "sourcePolicyId", "sourcePolicyVersion", "issuedPackage",
  "runtimeActivated", "runtimeCallerActivationAuthorityGranted", "mutationAuthorityGranted",
  "arbitraryFilesystemReadAuthorityGranted", "writeCommandAuthorityGranted", "credentialAuthorityGranted",
  "networkAuthorityGranted", "stagingAuthorityGranted", "deploymentAuthorityGranted", "laterActivationEligibility",
  "toctouEliminated", "authority", "resultFingerprintAlgorithm", "resultFingerprint",
] as const;

const PACKAGE_KEYS = [
  "packageKind", "packageVersion", "packageId", "authorityPolicyFingerprint", "contractId", "boundaryId",
  "authorityPolicyId", "authorityPolicyVersion", "capabilitySetId", "capabilitySetVersion",
  "observationSequenceIdentity", "session", "platform", "executable", "sourcePolicyId", "sourcePolicyVersion",
  "executableResolutionFingerprint", "executableRevalidationFingerprint", "compatibilityResultFingerprint",
  "worktreeEvidenceFingerprint", "worktreeFingerprint", "repositoryRootPathFingerprint", "issuedAt", "expiresAt",
  "fixedDurationMs", "expiryPolicyId", "fixedDurationId", "freshnessPolicyId", "timeRepresentationId",
  "preConsumptionRevalidationRequired", "perStageExpiryCheckRequired", "aggregateConstructionExpiryCheckRequired",
  "expiryExtensionAllowed", "refreshAllowed", "gracePeriodMs", "automaticReissueAllowed", "packageState",
  "currentStageIndex", "consumedStageCount", "remainingStageCount", "terminal", "activeConsumer", "retryCount",
  "fallbackAttempted", "replayDetected", "revoked", "expired", "executableResolutionLinked",
  "executableRevalidationLinked", "processCreationAuthorityGranted", "exactReadOnlyGitCliExecutionAuthorityGranted",
  "approvedRepositoryReadAuthorityGranted", "boundedTextRetentionAuthorityGranted", "boundedByteRetentionAuthorityGranted",
  "stageEvidenceConstructionAuthorityGranted", "aggregateObservationConstructionAuthorityGranted",
  "nonAuthoritativeResultExposureAuthorityGranted", "runtimeCallerActivationAuthorityGranted", "mutationAuthorityGranted",
  "arbitraryFilesystemReadAuthorityGranted", "writeCommandAuthorityGranted", "credentialAuthorityGranted",
  "networkAuthorityGranted", "stagingAuthorityGranted", "deploymentAuthorityGranted", "laterActivationEligibility",
  "runtimeActivated", "toctouEliminated", "stageGrants", "packageFingerprintAlgorithm", "packageFingerprint",
] as const;

const STAGE_GRANT_KEYS = [
  "grantKind", "grantVersion", "authorityPolicyFingerprint", "stageIndex", "stageIdentity", "capabilityIdentity",
  "capabilityPurpose", "executable", "argv", "workingDirectoryFingerprint", "repositoryRootPathFingerprint",
  "outputMode", "stdoutLimitBytes", "stderrLimitBytes", "combinedLimitBytes", "processAttemptMaximum",
  "processCreationGrant", "exactReadOnlyGitCliGrant", "repositoryReadGrant", "outputRetentionGrant",
  "evidenceConstructionGrant", "consumed", "retryCount", "fallbackAttempted", "stageFingerprintAlgorithm",
  "stageFingerprint",
] as const;

const EXPECTED_STAGE_DEFINITIONS = [
  {
    stageIdentity: "git_repository_root_v1",
    capabilityIdentity: "git_repository_root_v1",
    capabilityPurpose: "git_repository_root",
    argv: ["rev-parse", "--show-toplevel"],
    outputMode: "text",
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 0,
    combinedLimitBytes: 4096,
  },
  {
    stageIdentity: "git_object_format_v1",
    capabilityIdentity: "git_object_format_v1",
    capabilityPurpose: "git_object_format",
    argv: ["rev-parse", "--show-object-format"],
    outputMode: "text",
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 0,
    combinedLimitBytes: 4096,
  },
  {
    stageIdentity: "git_head_before_v1",
    capabilityIdentity: "git_head_object_v1",
    capabilityPurpose: "git_head_object",
    argv: ["rev-parse", "--verify", "HEAD"],
    outputMode: "text",
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 0,
    combinedLimitBytes: 4096,
  },
  {
    stageIdentity: "git_branch_state_v1",
    capabilityIdentity: "git_branch_state_v1",
    capabilityPurpose: "git_branch_state",
    argv: ["symbolic-ref", "--quiet", "--short", "HEAD"],
    outputMode: "text",
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 0,
    combinedLimitBytes: 4096,
  },
  {
    stageIdentity: "git_porcelain_status_v1",
    capabilityIdentity: "git_porcelain_status_v1",
    capabilityPurpose: "git_porcelain_status",
    argv: ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"],
    outputMode: "bytes",
    stdoutLimitBytes: 65536,
    stderrLimitBytes: 0,
    combinedLimitBytes: 65536,
  },
  {
    stageIdentity: "git_head_after_v1",
    capabilityIdentity: "git_head_object_v1",
    capabilityPurpose: "git_head_object",
    argv: ["rev-parse", "--verify", "HEAD"],
    outputMode: "text",
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 0,
    combinedLimitBytes: 4096,
  },
] as const;

export function buildDormantGitAuthorityConsumptionTransition(input: unknown): DormantGitAuthorityConsumptionTransitionResult {
  const parsed = parseTransitionInput(input);
  if (!parsed.input) return rejected(parsed.operation, parsed.reason, null, null);
  switch (parsed.input.operation) {
    case "register_package":
      return registerPackage(parsed.input);
    case "claim_consumer":
      return claimConsumer(parsed.input);
    case "consume_stage":
      return consumeStage(parsed.input);
    case "record_stage_completion":
      return recordStageCompletion(parsed.input);
    case "terminalize_failure":
    case "terminalize_ambiguous_failure":
      return terminalizeFailure(parsed.input);
    case "terminalize_expiry":
      return terminalizeExpiry(parsed.input);
    case "revoke_package":
      return revokePackage(parsed.input);
    case "finalize_aggregate":
      return finalizeAggregate(parsed.input);
    default:
      return rejected(null, "operation_rejected", null, null);
  }
}

export function buildDormantGitAuthorityConsumptionKey(packageId: string, packageFingerprint: string): string {
  return sha256(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS.consumptionKey, {
    packageId,
    packageFingerprint,
  });
}

export function buildDormantGitAuthorityCurrentStateFingerprint(state: Omit<DormantGitAuthorityConsumptionCurrentState, "stateFingerprintAlgorithm" | "stateFingerprint">): string {
  return sha256(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS.state, state);
}

export function buildDormantGitAuthorityCurrentStateCoreFingerprint(state: Omit<DormantGitAuthorityConsumptionCurrentState, "stateCoreFingerprint" | "lastAuditEventFingerprint" | "stateFingerprintAlgorithm" | "stateFingerprint">): string {
  return sha256(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS.state, state);
}

export function buildDormantGitAuthorityAuditEventFingerprintForTest(event: Omit<DormantGitAuthorityConsumptionAuditEvent, "eventFingerprint">): string {
  return sha256(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS.auditEvent, event);
}

export function buildFixtureDormantGitAuthorityPackageIssuedResultForTransition(input: {
  packageId?: string;
  session?: string;
  issuedAt?: string;
  expiresAt?: string;
  worktreeFingerprint?: string;
  compatibilityResultFingerprint?: string;
} = {}): PureDormantGitRunnerAuthorityPackageResult {
  const issuedAt = input.issuedAt ?? "2026-07-17T12:00:00.000Z";
  const expiresAt = input.expiresAt ?? "2026-07-17T12:00:30.000Z";
  const packageId = input.packageId ?? "dormant-git-runner-authority-package-transition-0001";
  const session = input.session ?? "resolver-session-transition-0001";
  const authorityPolicyFingerprint = buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest();
  const stageGrants = Array.from({ length: 6 }, (_, index) => buildFixtureStageGrant(index as 0 | 1 | 2 | 3 | 4 | 5, authorityPolicyFingerprint, input.worktreeFingerprint ?? "a".repeat(64)));
  const packageCore = {
    packageKind: "pure_dormant_git_runner_authority_package",
    packageVersion: 1,
    packageId,
    authorityPolicyFingerprint,
    contractId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId,
    authorityPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId,
    authorityPolicyVersion: 1,
    capabilitySetId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId,
    capabilitySetVersion: 1,
    observationSequenceIdentity: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity,
    session,
    platform: "macos",
    executable: "/usr/bin/git",
    sourcePolicyId: "ture.execution.fixture-source-policy.transition.v1",
    sourcePolicyVersion: 1,
    executableResolutionFingerprint: "1".repeat(64),
    executableRevalidationFingerprint: "2".repeat(64),
    compatibilityResultFingerprint: input.compatibilityResultFingerprint ?? "3".repeat(64),
    worktreeEvidenceFingerprint: "4".repeat(64),
    worktreeFingerprint: input.worktreeFingerprint ?? "a".repeat(64),
    repositoryRootPathFingerprint: "b".repeat(64),
    issuedAt,
    expiresAt,
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
  const issuedPackage = deepFreeze({
    ...packageCore,
    packageFingerprintAlgorithm: "sha256",
    packageFingerprint: sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.package, packageCore),
  } satisfies DormantGitRunnerAuthorityPackage);
  const resultCore = {
    resultKind: "pure_dormant_git_runner_authority_package_result",
    resultVersion: 1,
    contractKind: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractKind,
    contractId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId,
    contractVersion: 1,
    boundaryId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId,
    authorityPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId,
    authorityPolicyVersion: 1,
    authorityPolicyFingerprint,
    capabilitySetId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId,
    capabilitySetVersion: 1,
    expiryPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId,
    freshnessPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId,
    status: "authority_package_issued",
    reason: "authority_package_issued",
    reasons: ["authority_package_issued"],
    packageId,
    packageFingerprint: issuedPackage.packageFingerprint,
    executableResolutionFingerprint: issuedPackage.executableResolutionFingerprint,
    executableRevalidationFingerprint: issuedPackage.executableRevalidationFingerprint,
    compatibilityResultFingerprint: issuedPackage.compatibilityResultFingerprint,
    worktreeEvidenceFingerprint: issuedPackage.worktreeEvidenceFingerprint,
    executable: "/usr/bin/git",
    worktreeFingerprint: issuedPackage.worktreeFingerprint,
    session,
    sequenceIdentity: issuedPackage.observationSequenceIdentity,
    platform: "macos",
    sourcePolicyId: issuedPackage.sourcePolicyId,
    sourcePolicyVersion: 1,
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
    authority: "fixture_scoped_dormant_authority_package",
  } satisfies Omit<PureDormantGitRunnerAuthorityPackageResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.result, resultCore),
  } satisfies PureDormantGitRunnerAuthorityPackageResult);
}

function registerPackage(input: RegisterPackageTransitionInput): DormantGitAuthorityConsumptionTransitionResult {
  const packageResult = validateAuthorityPackageResult(input.authorityPackageResult);
  if (!packageResult.packageValue) return rejected("register_package", packageResult.reason, null, null);
  if (!isCanonicalTimestamp(input.observedAt)) return rejected("register_package", "timestamp_rejected", null, null);
  if (input.initialTransitionVersion !== 0) return rejected("register_package", "stale_transition_rejected", null, null);
  if (Date.parse(input.observedAt) >= Date.parse(packageResult.packageValue.expiresAt)) return rejected("register_package", "package_expired", null, null);
  if (input.consumptionKey !== buildDormantGitAuthorityConsumptionKey(packageResult.packageValue.packageId, packageResult.packageValue.packageFingerprint)) {
    return rejected("register_package", "package_linkage_rejected", null, null);
  }
  const state = withStateFingerprint({
    stateKind: "dormant_git_authority_consumption_current_state",
    stateVersion: 1,
    recordId: `record:${input.consumptionKey}`,
    consumptionKey: input.consumptionKey,
    authorityPackageId: packageResult.packageValue.packageId,
    authorityPackageFingerprint: packageResult.packageValue.packageFingerprint,
    authorityPolicyFingerprint: packageResult.packageValue.authorityPolicyFingerprint,
    session: packageResult.packageValue.session,
    sequenceIdentity: packageResult.packageValue.observationSequenceIdentity,
    executableFingerprint: packageResult.packageValue.executableRevalidationFingerprint,
    worktreeFingerprint: packageResult.packageValue.worktreeFingerprint,
    compatibilityResultFingerprint: packageResult.packageValue.compatibilityResultFingerprint,
    issuedAt: packageResult.packageValue.issuedAt,
    expiresAt: packageResult.packageValue.expiresAt,
    state: "issued",
    currentStageIndex: 0,
    consumedStageCount: 0,
    remainingStageCount: 6,
    transitionVersion: 1,
    activeConsumerId: null,
    activeConsumerFingerprint: null,
    claimedAt: null,
    terminal: false,
    terminalReason: null,
    terminalAt: null,
    expired: false,
    revoked: false,
    retryCount: 0,
    fallbackAttempted: false,
    stages: packageResult.packageValue.stageGrants.map(stageFromGrant),
    aggregateFingerprint: null,
    nextAuditSequence: 1,
    stateCoreFingerprint: "0".repeat(64),
    lastAuditEventFingerprint: null,
  });
  return permitted("register_package", "package_registered", null, state, null, input.observedAt, null);
}

function claimConsumer(input: ClaimConsumerTransitionInput): DormantGitAuthorityConsumptionTransitionResult {
  const validation = validateExistingInput(input);
  if (validation) return validation;
  const state = input.currentState;
  if (state.state !== "issued" || state.activeConsumerId !== null || state.activeConsumerFingerprint !== null) return rejected(input.operation, "package_not_claimable", state.stateFingerprint, input.expectedTransitionVersion);
  if (!isConsumer(input.consumerId, input.consumerFingerprint)) return rejected(input.operation, "consumer_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (isExpiredAt(state, input.observedAt)) return rejected(input.operation, "package_expired", state.stateFingerprint, input.expectedTransitionVersion);
  const next = withStateFingerprint({
    ...stateWithoutFingerprint(state),
    state: "active",
    transitionVersion: state.transitionVersion + 1,
    activeConsumerId: input.consumerId,
    activeConsumerFingerprint: input.consumerFingerprint,
    claimedAt: input.observedAt,
    nextAuditSequence: state.nextAuditSequence + 1,
  });
  return permitted(input.operation, "consumer_claimed", state, next, input.consumerFingerprint, input.observedAt, null);
}

function consumeStage(input: ConsumeStageTransitionInput): DormantGitAuthorityConsumptionTransitionResult {
  const validation = validateExistingInput(input);
  if (validation) return validation;
  const state = input.currentState;
  if (!matchesConsumer(state, input.consumerId, input.consumerFingerprint)) return rejected(input.operation, "consumer_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (state.state !== "active" && state.state !== "partially_consumed") return rejected(input.operation, "state_transition_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (isExpiredAt(state, input.observedAt)) return rejected(input.operation, "package_expired", state.stateFingerprint, input.expectedTransitionVersion);
  if (input.stageIndex !== state.currentStageIndex || input.stageIndex < 0 || input.stageIndex > 5) return rejected(input.operation, "stage_order_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  const stage = state.stages[input.stageIndex];
  if (!stage || stage.stageIndex !== input.stageIndex || stage.stageGrantFingerprint !== input.stageGrantFingerprint) return rejected(input.operation, "stage_prerequisite_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (stage.consumed) return rejected(input.operation, "stage_already_consumed", state.stateFingerprint, input.expectedTransitionVersion);
  if (input.stageIndex > 0 && !isPreviousStageAccepted(state, input.stageIndex)) return rejected(input.operation, "stage_prerequisite_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (!isSha256(input.processRequestFingerprint)) return rejected(input.operation, "process_request_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  const consumedStage = {
    ...stage,
    consumed: true,
    consumedAt: input.observedAt,
    consumedByFingerprint: input.consumerFingerprint,
    stageConsumptionFingerprint: sha256(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS.state, {
      operation: input.operation,
      stageIndex: input.stageIndex,
      processRequestFingerprint: input.processRequestFingerprint,
      previousStateFingerprint: state.stateFingerprint,
      observedAt: input.observedAt,
    }),
    processRequestFingerprint: input.processRequestFingerprint,
  } satisfies DormantGitAuthorityConsumptionStageState;
  const nextStages = replaceStage(state.stages, consumedStage);
  const next = withStateFingerprint({
    ...stateWithoutFingerprint(state),
    state: "partially_consumed",
    consumedStageCount: state.consumedStageCount + 1,
    remainingStageCount: state.remainingStageCount - 1,
    transitionVersion: state.transitionVersion + 1,
    stages: nextStages,
    nextAuditSequence: state.nextAuditSequence + 1,
  });
  return permitted(input.operation, "stage_authority_consumed", state, next, input.consumerFingerprint, input.observedAt, consumedStage.stageConsumptionFingerprint, input.stageIndex);
}

function recordStageCompletion(input: RecordStageCompletionTransitionInput): DormantGitAuthorityConsumptionTransitionResult {
  const validation = validateExistingInput(input);
  if (validation) return validation;
  const state = input.currentState;
  if (!matchesConsumer(state, input.consumerId, input.consumerFingerprint)) return rejected(input.operation, "consumer_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (state.state !== "partially_consumed") return rejected(input.operation, "state_transition_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (input.stageIndex !== state.currentStageIndex || input.stageIndex < 0 || input.stageIndex > 5) return rejected(input.operation, "stage_order_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  const stage = state.stages[input.stageIndex];
  if (!stage?.consumed) return rejected(input.operation, "stage_not_consumed", state.stateFingerprint, input.expectedTransitionVersion);
  if (stage.completionRecorded) return rejected(input.operation, "stage_completion_already_recorded", state.stateFingerprint, input.expectedTransitionVersion);
  if (stage.processRequestFingerprint !== input.processRequestFingerprint) return rejected(input.operation, "process_request_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (!isSha256(input.completionFingerprint) || (input.interpretationFingerprint !== null && !isSha256(input.interpretationFingerprint))) return rejected(input.operation, "completion_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (stage.consumedAt !== null && Date.parse(input.observedAt) < Date.parse(stage.consumedAt)) return rejected(input.operation, "timestamp_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (input.outcome === "accepted_detached_observation" && input.stageIndex !== 3) return rejected(input.operation, "detached_outcome_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if ((input.outcome === "accepted" || input.outcome === "accepted_detached_observation") && input.interpretationFingerprint === null) return rejected(input.operation, "completion_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if ((input.outcome === "rejected" || input.outcome === "process_failed" || input.outcome === "ambiguous_process_state") && input.interpretationFingerprint !== null) return rejected(input.operation, "completion_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  const reason = completionReason(input.outcome);
  const completedStage = {
    ...stage,
    completionRecorded: true,
    completionFingerprint: input.completionFingerprint,
    interpretationFingerprint: input.interpretationFingerprint,
    outcome: input.outcome,
    reason,
    completedAt: input.observedAt,
  } satisfies DormantGitAuthorityConsumptionStageState;
  const base = {
    ...stateWithoutFingerprint(state),
    stages: replaceStage(state.stages, completedStage),
    transitionVersion: state.transitionVersion + 1,
    nextAuditSequence: state.nextAuditSequence + 1,
  };
  if (input.outcome === "rejected" || input.outcome === "process_failed") {
    const next = withStateFingerprint({
      ...base,
      state: "failed_consumed",
      activeConsumerId: null,
      activeConsumerFingerprint: null,
      terminal: true,
      terminalReason: "stage_failed_terminal",
      terminalAt: input.observedAt,
    });
    return permitted(input.operation, "stage_failed_terminal", state, next, input.consumerFingerprint, input.observedAt, input.completionFingerprint, input.stageIndex);
  }
  if (input.outcome === "ambiguous_process_state") {
    const next = withStateFingerprint({
      ...base,
      state: "ambiguous_failed_consumed",
      activeConsumerId: null,
      activeConsumerFingerprint: null,
      terminal: true,
      terminalReason: "ambiguous_failed_terminal",
      terminalAt: input.observedAt,
    });
    return permitted(input.operation, "ambiguous_failed_terminal", state, next, input.consumerFingerprint, input.observedAt, input.completionFingerprint, input.stageIndex);
  }
  const next = withStateFingerprint({
    ...base,
    state: "partially_consumed",
    currentStageIndex: (input.stageIndex + 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  });
  return permitted(input.operation, "stage_completion_recorded", state, next, input.consumerFingerprint, input.observedAt, input.completionFingerprint, input.stageIndex);
}

function terminalizeFailure(input: TerminalizeFailureTransitionInput): DormantGitAuthorityConsumptionTransitionResult {
  const validation = validateExistingInput(input);
  if (validation) return validation;
  const state = input.currentState;
  if (!matchesConsumer(state, input.consumerId, input.consumerFingerprint)) return rejected(input.operation, "consumer_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (state.consumedStageCount < 1 || !isSha256(input.failureFingerprint)) {
    return rejected(input.operation, input.operation === "terminalize_failure" ? "failure_terminalization_rejected" : "ambiguous_terminalization_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  }
  const reason = input.operation === "terminalize_failure" ? "stage_failed_terminal" : "ambiguous_failed_terminal";
  const next = withStateFingerprint({
    ...stateWithoutFingerprint(state),
    state: input.operation === "terminalize_failure" ? "failed_consumed" : "ambiguous_failed_consumed",
    activeConsumerId: null,
    activeConsumerFingerprint: null,
    transitionVersion: state.transitionVersion + 1,
    terminal: true,
    terminalReason: reason,
    terminalAt: input.observedAt,
    nextAuditSequence: state.nextAuditSequence + 1,
  });
  return permitted(input.operation, reason, state, next, input.consumerFingerprint, input.observedAt, input.failureFingerprint, Math.min(state.currentStageIndex, 5) as 0 | 1 | 2 | 3 | 4 | 5);
}

function terminalizeExpiry(input: ExpiryTransitionInput): DormantGitAuthorityConsumptionTransitionResult {
  const validation = validateExistingInput(input, { allowExpiredObservedAt: true });
  if (validation) return validation;
  const state = input.currentState;
  if (Date.parse(input.observedAt) < Date.parse(state.expiresAt)) return rejected(input.operation, "expiry_transition_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  const next = withStateFingerprint({
    ...stateWithoutFingerprint(state),
    state: "expired",
    activeConsumerId: null,
    activeConsumerFingerprint: null,
    transitionVersion: state.transitionVersion + 1,
    terminal: true,
    terminalReason: "package_expired_terminal",
    terminalAt: input.observedAt,
    expired: true,
    nextAuditSequence: state.nextAuditSequence + 1,
  });
  return permitted(input.operation, "package_expired_terminal", state, next, null, input.observedAt, null);
}

function revokePackage(input: RevokePackageTransitionInput): DormantGitAuthorityConsumptionTransitionResult {
  const validation = validateExistingInput(input);
  if (validation) return validation;
  const state = input.currentState;
  if (!isSha256(input.revocationFingerprint)) return rejected(input.operation, "revocation_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  const next = withStateFingerprint({
    ...stateWithoutFingerprint(state),
    state: "revoked",
    activeConsumerId: null,
    activeConsumerFingerprint: null,
    transitionVersion: state.transitionVersion + 1,
    terminal: true,
    terminalReason: "package_revoked_terminal",
    terminalAt: input.observedAt,
    revoked: true,
    nextAuditSequence: state.nextAuditSequence + 1,
  });
  return permitted(input.operation, "package_revoked_terminal", state, next, null, input.observedAt, input.revocationFingerprint);
}

function finalizeAggregate(input: FinalizeAggregateTransitionInput): DormantGitAuthorityConsumptionTransitionResult {
  const validation = validateExistingInput(input);
  if (validation) return validation;
  const state = input.currentState;
  if (!matchesConsumer(state, input.consumerId, input.consumerFingerprint)) return rejected(input.operation, "consumer_linkage_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (!isSha256(input.aggregateFingerprint)) return rejected(input.operation, "aggregate_finalization_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (isExpiredAt(state, input.observedAt)) return rejected(input.operation, "package_expired", state.stateFingerprint, input.expectedTransitionVersion);
  if (state.currentStageIndex !== 6 || state.consumedStageCount !== 6 || state.remainingStageCount !== 0 || !state.stages.every((stage) => stage.consumed && stage.completionRecorded && isAcceptedOutcome(stage.outcome))) {
    return rejected(input.operation, "aggregate_prerequisite_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  }
  const next = withStateFingerprint({
    ...stateWithoutFingerprint(state),
    state: "consumed",
    transitionVersion: state.transitionVersion + 1,
    activeConsumerId: null,
    activeConsumerFingerprint: null,
    terminal: true,
    terminalReason: "sequence_consumed",
    terminalAt: input.observedAt,
    aggregateFingerprint: input.aggregateFingerprint,
    nextAuditSequence: state.nextAuditSequence + 1,
  });
  return permitted(input.operation, "sequence_consumed", state, next, input.consumerFingerprint, input.observedAt, input.aggregateFingerprint);
}

function validateExistingInput(input: ExistingStateTransitionInput, options: { allowExpiredObservedAt?: boolean } = {}): DormantGitAuthorityConsumptionTransitionResult | null {
  if (!isCanonicalTimestamp(input.observedAt)) return rejected(input.operation, "timestamp_rejected", null, input.expectedTransitionVersion);
  const stateReason = validateCurrentState(input.currentState);
  if (stateReason) return rejected(input.operation, stateReason, null, input.expectedTransitionVersion);
  const state = input.currentState;
  if (input.currentStateFingerprint !== state.stateFingerprint) return rejected(input.operation, "input_fingerprint_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (input.expectedTransitionVersion !== state.transitionVersion) return rejected(input.operation, "stale_transition_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (state.terminal) return rejected(input.operation, "package_terminal_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (state.revoked) return rejected(input.operation, "package_terminal_rejected", state.stateFingerprint, input.expectedTransitionVersion);
  if (!options.allowExpiredObservedAt && Date.parse(input.observedAt) >= Date.parse(state.expiresAt)) return rejected(input.operation, "package_expired", state.stateFingerprint, input.expectedTransitionVersion);
  return null;
}

function parseTransitionInput(input: unknown): { input: DormantGitAuthorityConsumptionTransitionInput | null; operation: DormantGitAuthorityConsumptionOperation | null; reason: DormantGitAuthorityConsumptionReason } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { input: null, operation: null, reason: "input_contract_rejected" };
  if (Object.getPrototypeOf(input) !== Object.prototype || hasEnumerablePrototypeProperties(input)) return { input: null, operation: null, reason: "input_contract_rejected" };
  const candidate = input as Record<string, unknown>;
  const operation = typeof candidate.operation === "string" ? candidate.operation as DormantGitAuthorityConsumptionOperation : null;
  const expectedKeys = keysForOperation(operation);
  if (!expectedKeys || !isExactRecord(input, expectedKeys)) return { input: null, operation, reason: "input_contract_rejected" };
  if (
    candidate.inputKind !== "pure_dormant_git_authority_consumption_transition_input"
    || candidate.inputVersion !== 1
    || candidate.contractId !== PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId
    || candidate.boundaryId !== PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId
  ) return { input: null, operation, reason: "input_identity_rejected" };
  if (!isCanonicalTimestamp(candidate.observedAt)) return { input: null, operation, reason: "timestamp_rejected" };
  return { input: candidate as unknown as DormantGitAuthorityConsumptionTransitionInput, operation, reason: "operation_rejected" };
}

function keysForOperation(operation: DormantGitAuthorityConsumptionOperation | null): readonly string[] | null {
  switch (operation) {
    case "register_package": return REGISTER_KEYS;
    case "claim_consumer": return CLAIM_KEYS;
    case "consume_stage": return CONSUME_KEYS;
    case "record_stage_completion": return COMPLETE_KEYS;
    case "terminalize_failure":
    case "terminalize_ambiguous_failure": return TERMINALIZE_FAILURE_KEYS;
    case "terminalize_expiry": return EXISTING_KEYS;
    case "revoke_package": return REVOKE_KEYS;
    case "finalize_aggregate": return AGGREGATE_KEYS;
    default: return null;
  }
}

function validateAuthorityPackageResult(result: unknown): { packageValue: DormantGitRunnerAuthorityPackage | null; reason: DormantGitAuthorityConsumptionReason } {
  if (!isExactRecord(result, PACKAGE_RESULT_KEYS)) return { packageValue: null, reason: "authority_package_rejected" };
  const candidate = result as PureDormantGitRunnerAuthorityPackageResult;
  if (
    candidate.resultKind !== "pure_dormant_git_runner_authority_package_result"
    || candidate.resultVersion !== 1
    || candidate.contractKind !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractKind
    || candidate.contractId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId
    || candidate.contractVersion !== 1
    || candidate.boundaryId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId
    || candidate.authorityPolicyId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId
    || candidate.authorityPolicyVersion !== 1
    || candidate.authorityPolicyFingerprint !== buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest()
    || candidate.capabilitySetId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId
    || candidate.capabilitySetVersion !== 1
    || candidate.expiryPolicyId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId
    || candidate.freshnessPolicyId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId
    || candidate.status !== "authority_package_issued"
    || candidate.reason !== "authority_package_issued"
    || candidate.authority !== "fixture_scoped_dormant_authority_package"
    || candidate.runtimeActivated !== false
    || candidate.runtimeCallerActivationAuthorityGranted !== false
    || candidate.mutationAuthorityGranted !== false
    || candidate.arbitraryFilesystemReadAuthorityGranted !== false
    || candidate.writeCommandAuthorityGranted !== false
    || candidate.credentialAuthorityGranted !== false
    || candidate.networkAuthorityGranted !== false
    || candidate.stagingAuthorityGranted !== false
    || candidate.deploymentAuthorityGranted !== false
    || candidate.laterActivationEligibility !== false
    || candidate.toctouEliminated !== false
    || candidate.resultFingerprintAlgorithm !== "sha256"
    || !isSha256(candidate.resultFingerprint)
    || !isExactArray(candidate.reasons, ["authority_package_issued"])
    || !validatePackage(candidate.issuedPackage)
    || candidate.packageId !== candidate.issuedPackage.packageId
    || candidate.packageFingerprint !== candidate.issuedPackage.packageFingerprint
    || candidate.authorityPolicyFingerprint !== candidate.issuedPackage.authorityPolicyFingerprint
    || candidate.executableResolutionFingerprint !== candidate.issuedPackage.executableResolutionFingerprint
    || candidate.executableRevalidationFingerprint !== candidate.issuedPackage.executableRevalidationFingerprint
    || candidate.compatibilityResultFingerprint !== candidate.issuedPackage.compatibilityResultFingerprint
    || candidate.worktreeEvidenceFingerprint !== candidate.issuedPackage.worktreeEvidenceFingerprint
    || candidate.executable !== candidate.issuedPackage.executable
    || candidate.worktreeFingerprint !== candidate.issuedPackage.worktreeFingerprint
    || candidate.session !== candidate.issuedPackage.session
    || candidate.sequenceIdentity !== candidate.issuedPackage.observationSequenceIdentity
    || candidate.platform !== candidate.issuedPackage.platform
    || candidate.sourcePolicyId !== candidate.issuedPackage.sourcePolicyId
    || candidate.sourcePolicyVersion !== candidate.issuedPackage.sourcePolicyVersion
  ) return { packageValue: null, reason: "authority_package_rejected" };
  const withoutFingerprint = { ...candidate } as Record<string, unknown>;
  delete withoutFingerprint.resultFingerprintAlgorithm;
  delete withoutFingerprint.resultFingerprint;
  if (candidate.resultFingerprint !== sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.result, withoutFingerprint)) return { packageValue: null, reason: "input_fingerprint_rejected" };
  return { packageValue: candidate.issuedPackage, reason: "package_registered" };
}

function validatePackage(packageValue: unknown): packageValue is DormantGitRunnerAuthorityPackage {
  if (!isExactRecord(packageValue, PACKAGE_KEYS)) return false;
  const candidate = packageValue as DormantGitRunnerAuthorityPackage;
  if (
    candidate.packageKind !== "pure_dormant_git_runner_authority_package"
    || candidate.packageVersion !== 1
    || candidate.authorityPolicyFingerprint !== buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest()
    || candidate.contractId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId
    || candidate.boundaryId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId
    || candidate.authorityPolicyId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId
    || candidate.authorityPolicyVersion !== 1
    || candidate.capabilitySetId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId
    || candidate.capabilitySetVersion !== 1
    || candidate.observationSequenceIdentity !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity
    || typeof candidate.packageId !== "string"
    || !/^dormant-git-runner-authority-package-[a-z0-9-]{4,96}$/u.test(candidate.packageId)
    || typeof candidate.session !== "string"
    || candidate.session.length < 8
    || typeof candidate.sourcePolicyId !== "string"
    || candidate.sourcePolicyVersion !== 1
    || candidate.platform !== "macos"
    || candidate.executable !== "/usr/bin/git"
    || !isSha256(candidate.executableResolutionFingerprint)
    || !isSha256(candidate.executableRevalidationFingerprint)
    || !isSha256(candidate.compatibilityResultFingerprint)
    || !isSha256(candidate.worktreeEvidenceFingerprint)
    || !isSha256(candidate.worktreeFingerprint)
    || !isSha256(candidate.repositoryRootPathFingerprint)
    || !isCanonicalTimestamp(candidate.issuedAt)
    || !isCanonicalTimestamp(candidate.expiresAt)
    || Date.parse(candidate.expiresAt) - Date.parse(candidate.issuedAt) !== 30000
    || candidate.fixedDurationMs !== 30000
    || candidate.expiryPolicyId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId
    || candidate.fixedDurationId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.fixedDurationId
    || candidate.freshnessPolicyId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId
    || candidate.timeRepresentationId !== PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.timeRepresentationId
    || candidate.preConsumptionRevalidationRequired !== true
    || candidate.perStageExpiryCheckRequired !== true
    || candidate.aggregateConstructionExpiryCheckRequired !== true
    || candidate.expiryExtensionAllowed !== false
    || candidate.refreshAllowed !== false
    || candidate.gracePeriodMs !== 0
    || candidate.automaticReissueAllowed !== false
    || candidate.packageState !== "issued"
    || candidate.currentStageIndex !== 0
    || candidate.consumedStageCount !== 0
    || candidate.remainingStageCount !== 6
    || candidate.terminal !== false
    || candidate.activeConsumer !== false
    || candidate.retryCount !== 0
    || candidate.fallbackAttempted !== false
    || candidate.replayDetected !== false
    || candidate.revoked !== false
    || candidate.expired !== false
    || candidate.executableResolutionLinked !== true
    || candidate.executableRevalidationLinked !== true
    || candidate.processCreationAuthorityGranted !== true
    || candidate.exactReadOnlyGitCliExecutionAuthorityGranted !== true
    || candidate.approvedRepositoryReadAuthorityGranted !== true
    || candidate.boundedTextRetentionAuthorityGranted !== true
    || candidate.boundedByteRetentionAuthorityGranted !== true
    || candidate.stageEvidenceConstructionAuthorityGranted !== true
    || candidate.aggregateObservationConstructionAuthorityGranted !== true
    || candidate.nonAuthoritativeResultExposureAuthorityGranted !== true
    || candidate.runtimeCallerActivationAuthorityGranted !== false
    || candidate.mutationAuthorityGranted !== false
    || candidate.arbitraryFilesystemReadAuthorityGranted !== false
    || candidate.writeCommandAuthorityGranted !== false
    || candidate.credentialAuthorityGranted !== false
    || candidate.networkAuthorityGranted !== false
    || candidate.stagingAuthorityGranted !== false
    || candidate.deploymentAuthorityGranted !== false
    || candidate.laterActivationEligibility !== false
    || candidate.runtimeActivated !== false
    || candidate.toctouEliminated !== false
    || candidate.stageGrants.length !== 6
    || candidate.packageFingerprintAlgorithm !== "sha256"
    || !isSha256(candidate.packageFingerprint)
  ) return false;
  if (!isExactArray(candidate.stageGrants, candidate.stageGrants as unknown as readonly unknown[])) return false;
  if (!candidate.stageGrants.every((grant, index) => validateStageGrant(grant, index))) return false;
  const withoutFingerprint = { ...candidate } as Record<string, unknown>;
  delete withoutFingerprint.packageFingerprintAlgorithm;
  delete withoutFingerprint.packageFingerprint;
  return candidate.packageFingerprint === sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.package, withoutFingerprint);
}

function validateStageGrant(grant: unknown, index: number): grant is DormantGitRunnerStageGrant {
  if (!isExactRecord(grant, STAGE_GRANT_KEYS)) return false;
  const candidate = grant as DormantGitRunnerStageGrant;
  const expected = EXPECTED_STAGE_DEFINITIONS[index];
  if (!expected) return false;
  if (
    candidate.grantKind !== "dormant_git_runner_stage_authority_grant"
    || candidate.grantVersion !== 1
    || candidate.authorityPolicyFingerprint !== buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest()
    || candidate.stageIndex !== index
    || candidate.stageIdentity !== expected.stageIdentity
    || candidate.capabilityIdentity !== expected.capabilityIdentity
    || candidate.capabilityPurpose !== expected.capabilityPurpose
    || candidate.executable !== "/usr/bin/git"
    || !isExactArray(candidate.argv, expected.argv)
    || !isSha256(candidate.workingDirectoryFingerprint)
    || !isSha256(candidate.repositoryRootPathFingerprint)
    || candidate.outputMode !== expected.outputMode
    || candidate.stdoutLimitBytes !== expected.stdoutLimitBytes
    || candidate.stderrLimitBytes !== expected.stderrLimitBytes
    || candidate.combinedLimitBytes !== expected.combinedLimitBytes
    || candidate.processAttemptMaximum !== 1
    || candidate.processCreationGrant !== true
    || candidate.exactReadOnlyGitCliGrant !== true
    || candidate.repositoryReadGrant !== true
    || candidate.outputRetentionGrant !== true
    || candidate.evidenceConstructionGrant !== true
    || candidate.stageFingerprintAlgorithm !== "sha256"
    || !isSha256(candidate.stageFingerprint)
    || candidate.consumed !== false
    || candidate.retryCount !== 0
    || candidate.fallbackAttempted !== false
  ) return false;
  const fingerprintCore = {
    grantKind: candidate.grantKind,
    grantVersion: candidate.grantVersion,
    authorityPolicyFingerprint: candidate.authorityPolicyFingerprint,
    stageIndex: candidate.stageIndex,
    stageIdentity: candidate.stageIdentity,
    capabilityIdentity: candidate.capabilityIdentity,
    capabilityPurpose: candidate.capabilityPurpose,
    executable: candidate.executable,
    argv: candidate.argv,
    workingDirectoryFingerprint: candidate.workingDirectoryFingerprint,
    repositoryRootPathFingerprint: candidate.repositoryRootPathFingerprint,
    outputMode: candidate.outputMode,
    stdoutLimitBytes: candidate.stdoutLimitBytes,
    stderrLimitBytes: candidate.stderrLimitBytes,
    combinedLimitBytes: candidate.combinedLimitBytes,
    processAttemptMaximum: candidate.processAttemptMaximum,
    processCreationGrant: candidate.processCreationGrant,
    exactReadOnlyGitCliGrant: candidate.exactReadOnlyGitCliGrant,
    repositoryReadGrant: candidate.repositoryReadGrant,
    outputRetentionGrant: candidate.outputRetentionGrant,
    evidenceConstructionGrant: candidate.evidenceConstructionGrant,
    consumed: candidate.consumed,
    retryCount: candidate.retryCount,
    fallbackAttempted: candidate.fallbackAttempted,
  };
  return candidate.stageFingerprint === sha256(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_FINGERPRINT_DOMAINS.stageGrant, fingerprintCore);
}

function validateCurrentState(state: unknown): DormantGitAuthorityConsumptionReason | null {
  if (!isExactRecord(state, STATE_KEYS)) return "current_state_rejected";
  const candidate = state as DormantGitAuthorityConsumptionCurrentState;
  if (
    candidate.stateKind !== "dormant_git_authority_consumption_current_state"
    || candidate.stateVersion !== 1
    || !isSha256(candidate.consumptionKey)
    || !isSha256(candidate.authorityPackageFingerprint)
    || !isSha256(candidate.authorityPolicyFingerprint)
    || !isSha256(candidate.executableFingerprint)
    || !isSha256(candidate.worktreeFingerprint)
    || !isSha256(candidate.compatibilityResultFingerprint)
    || !isCanonicalTimestamp(candidate.issuedAt)
    || !isCanonicalTimestamp(candidate.expiresAt)
    || candidate.retryCount !== 0
    || candidate.fallbackAttempted !== false
    || candidate.consumedStageCount + candidate.remainingStageCount !== 6
    || candidate.currentStageIndex < 0
    || candidate.currentStageIndex > 6
    || candidate.stages.length !== 6
    || candidate.nextAuditSequence < 1
    || !isSha256(candidate.stateCoreFingerprint)
    || (candidate.lastAuditEventFingerprint !== null && !isSha256(candidate.lastAuditEventFingerprint))
    || candidate.stateFingerprintAlgorithm !== "sha256"
    || !isSha256(candidate.stateFingerprint)
  ) return "current_state_rejected";
  if (!isExactArrayShape(candidate.stages, 6)) return "current_state_rejected";
  if (!candidate.stages.every((stage, index) => validateStageState(stage, index))) return "current_state_rejected";
  if (candidate.stages.filter((stage) => stage.consumed).length !== candidate.consumedStageCount) return "current_state_rejected";
  if (candidate.remainingStageCount !== 6 - candidate.consumedStageCount) return "current_state_rejected";
  if (candidate.stages.some((stage) => stage.completionRecorded && !stage.consumed)) return "current_state_rejected";
  if (candidate.terminal && (!candidate.terminalReason || !candidate.terminalAt || candidate.activeConsumerId !== null || candidate.activeConsumerFingerprint !== null)) return "current_state_rejected";
  if (!candidate.terminal && (candidate.terminalReason !== null || candidate.terminalAt !== null)) return "current_state_rejected";
  if (!validateStageProgression(candidate)) return "current_state_rejected";
  const stateCore = stateCoreWithoutAuditFingerprint(candidate);
  if (candidate.stateCoreFingerprint !== buildDormantGitAuthorityCurrentStateCoreFingerprint(stateCore)) return "input_fingerprint_rejected";
  const core = stateWithoutFingerprint(candidate);
  if (candidate.stateFingerprint !== buildDormantGitAuthorityCurrentStateFingerprint(core)) return "input_fingerprint_rejected";
  if (candidate.consumptionKey !== buildDormantGitAuthorityConsumptionKey(candidate.authorityPackageId, candidate.authorityPackageFingerprint)) return "current_state_rejected";
  if (candidate.recordId !== `record:${candidate.consumptionKey}`) return "current_state_rejected";
  if (Date.parse(candidate.expiresAt) - Date.parse(candidate.issuedAt) !== 30000) return "current_state_rejected";
  if (candidate.claimedAt !== null && Date.parse(candidate.claimedAt) < Date.parse(candidate.issuedAt)) return "current_state_rejected";
  if ((candidate.state === "issued") !== (candidate.activeConsumerId === null && candidate.activeConsumerFingerprint === null && candidate.claimedAt === null && candidate.consumedStageCount === 0 && candidate.currentStageIndex === 0 && !candidate.terminal)) return "current_state_rejected";
  if ((candidate.state === "active" || candidate.state === "partially_consumed") && (candidate.activeConsumerId === null || candidate.activeConsumerFingerprint === null)) return "current_state_rejected";
  if (candidate.state === "consumed" && (candidate.consumedStageCount !== 6 || candidate.remainingStageCount !== 0 || candidate.aggregateFingerprint === null || candidate.terminalReason !== "sequence_consumed")) return "current_state_rejected";
  if (candidate.state !== "consumed" && candidate.aggregateFingerprint !== null) return "current_state_rejected";
  if (candidate.state === "expired" && (!candidate.expired || candidate.terminalReason !== "package_expired_terminal")) return "current_state_rejected";
  if (candidate.state === "revoked" && (!candidate.revoked || candidate.terminalReason !== "package_revoked_terminal")) return "current_state_rejected";
  if (candidate.state !== "expired" && candidate.expired) return "current_state_rejected";
  if (candidate.state !== "revoked" && candidate.revoked) return "current_state_rejected";
  return null;
}

function validateStageState(stage: unknown, index: number): stage is DormantGitAuthorityConsumptionStageState {
  if (!isExactRecord(stage, STAGE_STATE_KEYS)) return false;
  const candidate = stage as DormantGitAuthorityConsumptionStageState;
  if (
    candidate.stageRecordKind !== "dormant_git_authority_consumption_stage_state"
    || candidate.stageRecordVersion !== 1
    || candidate.stageIndex !== index
    || typeof candidate.stageIdentity !== "string"
    || !isSha256(candidate.stageGrantFingerprint)
    || (candidate.consumedAt !== null && !isCanonicalTimestamp(candidate.consumedAt))
    || (candidate.consumedByFingerprint !== null && !isSha256(candidate.consumedByFingerprint))
    || (candidate.stageConsumptionFingerprint !== null && !isSha256(candidate.stageConsumptionFingerprint))
    || (candidate.processRequestFingerprint !== null && !isSha256(candidate.processRequestFingerprint))
    || (candidate.completionFingerprint !== null && !isSha256(candidate.completionFingerprint))
    || (candidate.interpretationFingerprint !== null && !isSha256(candidate.interpretationFingerprint))
    || (candidate.completedAt !== null && !isCanonicalTimestamp(candidate.completedAt))
  ) return false;
  if (!candidate.consumed && (candidate.consumedAt !== null || candidate.consumedByFingerprint !== null || candidate.stageConsumptionFingerprint !== null || candidate.processRequestFingerprint !== null)) return false;
  if (candidate.consumed && (!candidate.consumedAt || !candidate.consumedByFingerprint || !candidate.stageConsumptionFingerprint || !candidate.processRequestFingerprint)) return false;
  if (!candidate.completionRecorded && (candidate.completionFingerprint !== null || candidate.interpretationFingerprint !== null || candidate.outcome !== null || candidate.reason !== null || candidate.completedAt !== null)) return false;
  if (candidate.completionRecorded) {
    if (!candidate.completionFingerprint || candidate.outcome === null || candidate.reason === null || candidate.completedAt === null) return false;
    if (Date.parse(candidate.completedAt) < Date.parse(candidate.consumedAt ?? "")) return false;
    if (candidate.outcome === "accepted" && (candidate.reason !== "stage_completion_recorded" || candidate.interpretationFingerprint === null)) return false;
    if (candidate.outcome === "accepted_detached_observation" && (candidate.stageIndex !== 3 || candidate.reason !== "stage_completion_recorded" || candidate.interpretationFingerprint === null)) return false;
    if ((candidate.outcome === "rejected" || candidate.outcome === "process_failed") && (candidate.reason !== "stage_failed_terminal" || candidate.interpretationFingerprint !== null)) return false;
    if (candidate.outcome === "ambiguous_process_state" && (candidate.reason !== "ambiguous_failed_terminal" || candidate.interpretationFingerprint !== null)) return false;
  }
  return true;
}

function permitted(
  operation: DormantGitAuthorityConsumptionOperation,
  reason: DormantGitAuthorityConsumptionReason,
  previousState: DormantGitAuthorityConsumptionCurrentState | null,
  nextState: DormantGitAuthorityConsumptionCurrentState,
  consumerFingerprint: string | null,
  observedAt: string,
  evidenceFingerprint: string | null,
  stageIndex: 0 | 1 | 2 | 3 | 4 | 5 | null = null,
): DormantGitAuthorityConsumptionTransitionResult {
  const nextStateCore = stateCoreWithoutAuditFingerprint({
    ...stateWithoutFingerprint(nextState),
    nextAuditSequence: (previousState?.nextAuditSequence ?? 0) + 1,
    lastAuditEventFingerprint: null,
  });
  const nextStateCoreFingerprint = buildDormantGitAuthorityCurrentStateCoreFingerprint(nextStateCore);
  const audit = buildAuditEvent(operation, reason, previousState, nextState, nextStateCoreFingerprint, consumerFingerprint, observedAt, evidenceFingerprint, stageIndex);
  const state = withStateFingerprint({
    ...stateWithoutFingerprint(nextState),
    nextAuditSequence: (previousState?.nextAuditSequence ?? 0) + 1,
    stateCoreFingerprint: nextStateCoreFingerprint,
    lastAuditEventFingerprint: audit.eventFingerprint,
  });
  return buildResult({
    operation,
    status: "transition_permitted",
    reason,
    previousStateFingerprint: previousState?.stateFingerprint ?? null,
    nextStateCoreFingerprint,
    nextStateFingerprint: state.stateFingerprint,
    expectedTransitionVersion: previousState?.transitionVersion ?? null,
    resultingTransitionVersion: state.transitionVersion,
    nextState: state,
    auditEvents: [audit],
  });
}

function rejected(
  operation: DormantGitAuthorityConsumptionOperation | null,
  reason: DormantGitAuthorityConsumptionReason,
  previousStateFingerprint: string | null,
  expectedTransitionVersion: number | null,
): DormantGitAuthorityConsumptionTransitionResult {
  return buildResult({
    operation,
    status: "transition_rejected",
    reason,
    previousStateFingerprint,
    nextStateCoreFingerprint: null,
    nextStateFingerprint: null,
    expectedTransitionVersion,
    resultingTransitionVersion: null,
    nextState: null,
    auditEvents: [],
  });
}

function buildResult(coreInput: Omit<DormantGitAuthorityConsumptionTransitionResult, "resultKind" | "resultVersion" | "contractKind" | "contractId" | "contractVersion" | "boundaryId" | "transitionPolicyId" | "transitionPolicyVersion" | "runtimeActivated" | "toctouEliminated" | "authority" | "resultFingerprintAlgorithm" | "resultFingerprint">): DormantGitAuthorityConsumptionTransitionResult {
  const core = {
    resultKind: "pure_dormant_git_authority_consumption_transition_result",
    resultVersion: 1,
    contractKind: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractKind,
    contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
    contractVersion: 1,
    boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
    transitionPolicyId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY.policyId,
    transitionPolicyVersion: 1,
    ...coreInput,
    runtimeActivated: false,
    toctouEliminated: false,
    authority: "none",
  } satisfies Omit<DormantGitAuthorityConsumptionTransitionResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: sha256(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS.result, core),
  } satisfies DormantGitAuthorityConsumptionTransitionResult);
}

function buildAuditEvent(
  operation: DormantGitAuthorityConsumptionOperation,
  reason: DormantGitAuthorityConsumptionReason,
  previousState: DormantGitAuthorityConsumptionCurrentState | null,
  nextState: DormantGitAuthorityConsumptionCurrentState,
  nextStateCoreFingerprint: string,
  consumerFingerprint: string | null,
  observedAt: string,
  evidenceFingerprint: string | null,
  explicitStageIndex: 0 | 1 | 2 | 3 | 4 | 5 | null,
): DormantGitAuthorityConsumptionAuditEvent {
  const stageIndex = explicitStageIndex;
  const core = {
    eventKind: "dormant_git_authority_consumption_audit_event",
    eventVersion: 1,
    eventIdentity: "ture.execution.dormant-git-authority-consumption.audit-event.fixture.v1",
    eventPolicyId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY.auditEventPolicyId,
    eventPolicyVersion: 1,
    eventSequence: previousState?.nextAuditSequence ?? 0,
    operation,
    authorityPackageId: nextState.authorityPackageId,
    packageFingerprint: nextState.authorityPackageFingerprint,
    authorityPolicyFingerprint: nextState.authorityPolicyFingerprint,
    consumptionKey: nextState.consumptionKey,
    previousStateFingerprint: previousState?.stateFingerprint ?? null,
    nextStateCoreFingerprint,
    consumerFingerprint,
    stageIndex,
    stageIdentity: stageIndex === null ? null : nextState.stages[stageIndex]?.stageIdentity ?? null,
    transitionVersionBefore: previousState?.transitionVersion ?? null,
    transitionVersionAfter: nextState.transitionVersion,
    expectedTransitionVersion: previousState?.transitionVersion ?? null,
    resultingTransitionVersion: nextState.transitionVersion,
    status: "transition_permitted",
    reason,
    observedAt,
    evidenceFingerprint,
    runtimeActivated: false,
    toctouEliminated: false,
    authority: "none",
    atomicReplayProtectionPresent: false,
    storageCommitted: false,
    eventFingerprintAlgorithm: "sha256",
  } satisfies Omit<DormantGitAuthorityConsumptionAuditEvent, "eventFingerprint">;
  return deepFreeze({
    ...core,
    eventFingerprint: buildDormantGitAuthorityAuditEventFingerprintForTest(core),
  } satisfies DormantGitAuthorityConsumptionAuditEvent);
}

function buildFixtureStageGrant(stageIndex: 0 | 1 | 2 | 3 | 4 | 5, authorityPolicyFingerprint: string, worktreeFingerprint: string): DormantGitRunnerStageGrant {
  const definition = EXPECTED_STAGE_DEFINITIONS[stageIndex];
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
    workingDirectoryFingerprint: worktreeFingerprint,
    repositoryRootPathFingerprint: "b".repeat(64),
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

function stageFromGrant(grant: DormantGitRunnerStageGrant): DormantGitAuthorityConsumptionStageState {
  return deepFreeze({
    stageRecordKind: "dormant_git_authority_consumption_stage_state",
    stageRecordVersion: 1,
    stageIndex: grant.stageIndex,
    stageIdentity: grant.stageIdentity,
    stageGrantFingerprint: grant.stageFingerprint,
    consumed: false,
    consumedAt: null,
    consumedByFingerprint: null,
    stageConsumptionFingerprint: null,
    processRequestFingerprint: null,
    completionRecorded: false,
    completionFingerprint: null,
    interpretationFingerprint: null,
    outcome: null,
    reason: null,
    completedAt: null,
  } satisfies DormantGitAuthorityConsumptionStageState);
}

function completionReason(outcome: DormantGitStageCompletionOutcome): DormantGitAuthorityConsumptionReason {
  if (outcome === "ambiguous_process_state") return "ambiguous_failed_terminal";
  if (outcome === "process_failed" || outcome === "rejected") return "stage_failed_terminal";
  return "stage_completion_recorded";
}

function isAcceptedOutcome(outcome: DormantGitStageCompletionOutcome | null): boolean {
  return outcome === "accepted" || outcome === "accepted_detached_observation";
}

function isPreviousStageAccepted(state: DormantGitAuthorityConsumptionCurrentState, stageIndex: number): boolean {
  const previous = state.stages[stageIndex - 1];
  return Boolean(previous?.completionRecorded && isAcceptedOutcome(previous.outcome));
}

function validateStageProgression(state: DormantGitAuthorityConsumptionCurrentState): boolean {
  const consumedCount = state.stages.filter((stage) => stage.consumed).length;
  const acceptedCompletedCount = state.stages.filter((stage) => stage.completionRecorded && isAcceptedOutcome(stage.outcome)).length;
  const pendingStages = state.stages.filter((stage) => stage.consumed && !stage.completionRecorded);
  if (consumedCount !== state.consumedStageCount || state.remainingStageCount !== 6 - consumedCount) return false;
  if (pendingStages.length > 1) return false;

  let cursor = 0;
  for (; cursor < 6; cursor += 1) {
    const stage = state.stages[cursor];
    if (!(stage.consumed && stage.completionRecorded && isAcceptedOutcome(stage.outcome))) break;
  }

  for (let index = 0; index < cursor; index += 1) {
    const stage = state.stages[index];
    if (!stage.consumed || !stage.completionRecorded || !isAcceptedOutcome(stage.outcome)) return false;
  }

  const pending = pendingStages[0] ?? null;
  if (pending && pending.stageIndex !== cursor) return false;
  for (let index = cursor + (pending ? 1 : 0); index < 6; index += 1) {
    const stage = state.stages[index];
    if (stage.consumed || stage.completionRecorded) return false;
  }

  const failedStage = state.stages.find((stage) => stage.completionRecorded && (stage.outcome === "rejected" || stage.outcome === "process_failed"));
  const ambiguousStage = state.stages.find((stage) => stage.completionRecorded && stage.outcome === "ambiguous_process_state");
  if (failedStage && ambiguousStage) return false;
  if (failedStage && state.state !== "failed_consumed") return false;
  if (ambiguousStage && state.state !== "ambiguous_failed_consumed") return false;

  const terminalProblemStage = failedStage ?? ambiguousStage ?? null;
  if (terminalProblemStage) {
    for (let index = terminalProblemStage.stageIndex + 1; index < 6; index += 1) {
      const stage = state.stages[index];
      if (stage.consumed || stage.completionRecorded) return false;
    }
  }

  switch (state.state) {
    case "issued":
      return state.currentStageIndex === 0
        && consumedCount === 0
        && acceptedCompletedCount === 0
        && pending === null
        && state.activeConsumerId === null
        && state.activeConsumerFingerprint === null
        && state.claimedAt === null
        && !state.terminal;
    case "active":
      return state.currentStageIndex === 0
        && consumedCount === 0
        && acceptedCompletedCount === 0
        && pending === null
        && state.activeConsumerId !== null
        && state.activeConsumerFingerprint !== null
        && state.claimedAt !== null
        && !state.terminal;
    case "partially_consumed":
      return state.activeConsumerId !== null
        && state.activeConsumerFingerprint !== null
        && state.claimedAt !== null
        && !state.terminal
        && state.aggregateFingerprint === null
        && state.currentStageIndex === cursor
        && (pending !== null || acceptedCompletedCount > 0)
        && acceptedCompletedCount <= 6;
    case "consumed":
      return state.currentStageIndex === 6
        && consumedCount === 6
        && acceptedCompletedCount === 6
        && pending === null
        && state.terminal
        && state.activeConsumerId === null
        && state.activeConsumerFingerprint === null
        && state.terminalReason === "sequence_consumed"
        && state.aggregateFingerprint !== null;
    case "failed_consumed":
      return state.terminal
        && state.activeConsumerId === null
        && state.activeConsumerFingerprint === null
        && state.terminalReason === "stage_failed_terminal"
        && failedStage !== undefined
        && state.aggregateFingerprint === null;
    case "ambiguous_failed_consumed":
      return state.terminal
        && state.activeConsumerId === null
        && state.activeConsumerFingerprint === null
        && state.terminalReason === "ambiguous_failed_terminal"
        && ambiguousStage !== undefined
        && state.aggregateFingerprint === null;
    case "expired":
      return state.terminal
        && state.expired
        && !state.revoked
        && state.activeConsumerId === null
        && state.activeConsumerFingerprint === null
        && state.terminalReason === "package_expired_terminal"
        && state.aggregateFingerprint === null;
    case "revoked":
      return state.terminal
        && state.revoked
        && !state.expired
        && state.activeConsumerId === null
        && state.activeConsumerFingerprint === null
        && state.terminalReason === "package_revoked_terminal"
        && state.aggregateFingerprint === null;
    default:
      return false;
  }
}

function isExpiredAt(state: DormantGitAuthorityConsumptionCurrentState, observedAt: string): boolean {
  return Date.parse(observedAt) >= Date.parse(state.expiresAt);
}

function isConsumer(consumerId: unknown, consumerFingerprint: unknown): boolean {
  return typeof consumerId === "string" && /^dormant-git-authority-consumer-[a-z0-9-]{4,80}$/u.test(consumerId) && isSha256(consumerFingerprint);
}

function matchesConsumer(state: DormantGitAuthorityConsumptionCurrentState, consumerId: string, consumerFingerprint: string): boolean {
  return state.activeConsumerId === consumerId && state.activeConsumerFingerprint === consumerFingerprint;
}

function replaceStage(stages: readonly DormantGitAuthorityConsumptionStageState[], stage: DormantGitAuthorityConsumptionStageState): readonly DormantGitAuthorityConsumptionStageState[] {
  return deepFreeze(stages.map((current) => current.stageIndex === stage.stageIndex ? deepFreeze(stage) : current));
}

function withStateFingerprint(state: Omit<DormantGitAuthorityConsumptionCurrentState, "stateFingerprintAlgorithm" | "stateFingerprint">): DormantGitAuthorityConsumptionCurrentState {
  const stateCoreFingerprint = buildDormantGitAuthorityCurrentStateCoreFingerprint(stateCoreWithoutAuditFingerprint(state));
  const finalStateCore = {
    ...state,
    stateCoreFingerprint,
  } satisfies Omit<DormantGitAuthorityConsumptionCurrentState, "stateFingerprintAlgorithm" | "stateFingerprint">;
  return deepFreeze({
    ...finalStateCore,
    stateFingerprintAlgorithm: "sha256",
    stateFingerprint: buildDormantGitAuthorityCurrentStateFingerprint(finalStateCore),
  } satisfies DormantGitAuthorityConsumptionCurrentState);
}

function stateWithoutFingerprint(state: DormantGitAuthorityConsumptionCurrentState): Omit<DormantGitAuthorityConsumptionCurrentState, "stateFingerprintAlgorithm" | "stateFingerprint"> {
  const { stateFingerprintAlgorithm, stateFingerprint, ...rest } = state;
  void stateFingerprintAlgorithm;
  void stateFingerprint;
  return rest;
}

function stateCoreWithoutAuditFingerprint(state: DormantGitAuthorityConsumptionCurrentState | Omit<DormantGitAuthorityConsumptionCurrentState, "stateFingerprintAlgorithm" | "stateFingerprint">): Omit<DormantGitAuthorityConsumptionCurrentState, "stateCoreFingerprint" | "lastAuditEventFingerprint" | "stateFingerprintAlgorithm" | "stateFingerprint"> {
  const source = state as Record<string, unknown>;
  const { stateCoreFingerprint, lastAuditEventFingerprint, stateFingerprintAlgorithm, stateFingerprint, ...rest } = source;
  void stateCoreFingerprint;
  void lastAuditEventFingerprint;
  void stateFingerprintAlgorithm;
  void stateFingerprint;
  return rest as Omit<DormantGitAuthorityConsumptionCurrentState, "stateCoreFingerprint" | "lastAuditEventFingerprint" | "stateFingerprintAlgorithm" | "stateFingerprint">;
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function isExactRecord(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (Object.getPrototypeOf(value) !== Object.prototype) return false;
  if (hasEnumerablePrototypeProperties(value)) return false;
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key !== "string")) return false;
  const actual = (ownKeys as string[]).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) return false;
  for (const key of expected) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor) || descriptor.enumerable !== true) return false;
  }
  return true;
}

function isExactArray(value: unknown, expected: readonly unknown[]): boolean {
  if (!isExactArrayShape(value, expected.length)) return false;
  const array = value as readonly unknown[];
  for (let index = 0; index < expected.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(array, String(index));
    if (!descriptor || !("value" in descriptor) || canonicalize(descriptor.value) !== canonicalize(expected[index])) return false;
  }
  return true;
}

function isExactArrayShape(value: unknown, expectedLength: number): boolean {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || hasEnumerablePrototypeProperties(value)) return false;
  if (value.length !== expectedLength) return false;
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key !== "string")) return false;
  const expectedKeys = [...Array.from({ length: expectedLength }, (_, index) => String(index)), "length"].sort();
  const actualKeys = (ownKeys as string[]).sort();
  if (actualKeys.length !== expectedKeys.length || actualKeys.some((key, index) => key !== expectedKeys[index])) return false;
  for (let index = 0; index < expectedLength; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, index)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor)) return false;
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

export function buildPureDormantGitAuthorityConsumptionTransitionIdentityFingerprintForTest(): string {
  return sha256(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS.identity, PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY);
}

export function buildPureDormantGitAuthorityConsumptionTransitionPolicyFingerprintForTest(): string {
  return sha256(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_FINGERPRINT_DOMAINS.policy, PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY);
}
