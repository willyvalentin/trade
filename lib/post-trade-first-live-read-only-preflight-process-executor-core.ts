import { createHash } from "node:crypto";

import {
  buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES,
} from "@/lib/post-trade-first-live-read-only-preflight-authorization-artifact-core";
import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_POLICY_ID,
} from "@/lib/post-trade-first-live-read-only-preflight-execution-boundary-contract";
import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_ID,
  validateCliVersionCollectorAuthorizationCompatibility,
  validateCliVersionCollectorCredentialDesignCompatibility,
  validateCliVersionCollectorExecutionBoundaryCompatibility,
  validateCliVersionCollectorRunnerCompatibility,
} from "@/lib/post-trade-first-live-read-only-preflight-cli-version-collector-core";
import {
  POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_VERSION,
  validateProviderDesignCompatibility,
} from "@/lib/post-trade-live-ephemeral-staging-supabase-credential-provider-design";
import {
  buildPostTradeReadOnlyLivePreflightRunnerPlan,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_EXPECTED_WORKDIR,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
  type PostTradeReadOnlyLivePreflightCommandSpec,
} from "@/lib/post-trade-read-only-live-staging-migration-preflight-runner-core";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID =
  "post_trade_first_live_read_only_staging_preflight_process_executor_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_VERSION =
  "post_trade_first_live_read_only_staging_preflight_process_executor_contract_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_DRIVER_CONTRACT_ID =
  "post_trade_first_live_read_only_staging_preflight_injected_process_driver_contract_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_EXECUTABLE_REGISTRY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_executable_registry_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_operation_registry_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TIMEOUT_REGISTRY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_timeout_registry_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_output_limit_registry_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_LIFECYCLE_POLICY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_lifecycle_policy_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTAINMENT_POLICY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_tree_containment_policy_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TERMINATION_POLICY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_termination_policy_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID =
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.environmentPolicy;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID =
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_EXPECTED_WORKDIR;

export type ValidationResult = { valid: boolean; blockingReasons: readonly string[] };
export type ProcessExecutableIdentity = "git_cli" | "supabase_cli";
export type ProcessOperationIdentity =
  | "preflight_git_repository_root"
  | "preflight_git_current_commit"
  | "preflight_git_current_branch"
  | "preflight_git_porcelain_status"
  | "preflight_git_staged_files"
  | "preflight_git_unstaged_files"
  | "preflight_git_untracked_files"
  | "preflight_supabase_linked_project"
  | "preflight_supabase_migration_history"
  | "preflight_supabase_cli_version";
export type ProcessLifecycleState =
  | "not_started"
  | "starting"
  | "running"
  | "exit_observed"
  | "termination_requested"
  | "graceful_termination_wait"
  | "force_termination_requested"
  | "force_termination_wait"
  | "containment_verification"
  | "terminated"
  | "completed"
  | "failed"
  | "timed_out"
  | "termination_failed"
  | "ambiguous";
export type ProcessLifecycleTransition = `${ProcessLifecycleState}->${ProcessLifecycleState}`;
export type ProcessResultClassification =
  | "completed_read_only"
  | "blocked_before_start"
  | "failed_read_only"
  | "timed_out_terminated"
  | "timed_out_termination_unconfirmed"
  | "output_overflow"
  | "interactive_prompt_detected"
  | "secret_material_detected"
  | "unexpected_child_process"
  | "mutation_detected"
  | "ambiguous";

export type ProcessExecutorDefaultState = {
  executorId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID;
  executorStatus: "not_run";
  processesStarted: 0;
  processesCompleted: 0;
  processesTerminated: 0;
  liveCommandsExecuted: 0;
  runnerExecutionEnabled: false;
  preflightRunStatus: "not_run";
  deploymentEnabled: false;
  remoteMutation: false;
  gitMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
};

export type ProcessExecutableRegistryEntry = {
  executableIdentity: ProcessExecutableIdentity;
  expectedBasename: "git" | "supabase";
  executableContractVersion: "post_trade_process_executable_identity_contract_v1";
  resolverPolicyIdentity: "reviewed_fixture_only_no_path_resolution_v1";
  wrapperProhibited: true;
  aliasProhibited: true;
  shellFunctionProhibited: true;
  scriptProxyProhibited: true;
  unresolvedSymlinkProhibited: true;
  callerSelectedPathProhibited: true;
  productionWrapperProhibited: true;
  shellDisabled: true;
  detachedProhibited: true;
  executablePathAbsent: true;
};

export type ProcessExecutableRegistry = {
  registryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_EXECUTABLE_REGISTRY_ID;
  executorContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_VERSION;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  executables: readonly ProcessExecutableRegistryEntry[];
  arbitraryExecutableAllowed: false;
  callerSelectedPathAllowed: false;
  pathResolutionPerformed: false;
  registryFingerprintAlgorithm: "sha256";
  registryFingerprint: string;
};

export type ProcessOperation = {
  operationId: ProcessOperationIdentity;
  sourceRunnerOperationId: string;
  executableIdentity: ProcessExecutableIdentity;
  exactArguments: readonly string[];
  parserIdentity: string;
  timeoutPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TIMEOUT_REGISTRY_ID;
  stdoutLimitPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID;
  stderrLimitPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID;
  workingDirectoryPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID;
  environmentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID;
  stdinPolicy: "closed";
  ttyPolicy: "disabled";
  shellPolicy: "disabled";
  readOnly: true;
  networkClassification: "local_only" | "staging_metadata_only";
  credentialRequirement: "none" | "opaque_staging_cli_credential_slot";
  expectedChildProcessClassification: "zero_expected";
  expectedOutputClassification: "single_line" | "porcelain_status" | "name_status" | "supabase_project_status" | "supabase_migration_history";
  arbitraryArgumentsAllowed: false;
  wildcardArgumentsAllowed: false;
  commandStringAbsent: true;
};

export type ProcessOperationRegistry = {
  registryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID;
  runnerId: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID;
  runnerVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION;
  processExecutorContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_VERSION;
  operations: readonly ProcessOperation[];
  catalogAdapterOperationsIncluded: false;
  arbitraryOperationAllowed: false;
  wildcardOperationAllowed: false;
  prefixMatchingAllowed: false;
  operationFingerprintAlgorithm: "sha256";
  operationFingerprint: string;
};

export type ProcessTimeoutPolicy = {
  operationId: ProcessOperationIdentity;
  timeoutMs: number;
  gracefulTerminationGraceMs: 750;
  forcedTerminationGraceMs: 750;
  containmentVerificationDeadlineMs: 500;
  callerMayIncrease: false;
  automaticRetryAllowed: false;
  sessionInvalidatedOnTimeout: true;
};

export type ProcessTimeoutRegistry = {
  registryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TIMEOUT_REGISTRY_ID;
  policies: readonly ProcessTimeoutPolicy[];
  unknownPolicyAllowed: false;
  timeoutFingerprintAlgorithm: "sha256";
  timeoutFingerprint: string;
};

export type ProcessOutputLimitPolicy = {
  operationId: ProcessOperationIdentity;
  maxStdoutBytes: number;
  maxStderrBytes: number;
  callerMayIncrease: false;
  truncationProhibited: true;
  overflowBlocksParserAuthority: true;
  rawOutputDisposalRequired: true;
  automaticRetryAllowed: false;
  sessionInvalidatedOnOverflow: true;
};

export type ProcessOutputLimitRegistry = {
  registryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID;
  policies: readonly ProcessOutputLimitPolicy[];
  unknownPolicyAllowed: false;
  outputFingerprintAlgorithm: "sha256";
  outputFingerprint: string;
};

export type WorkingDirectoryPolicy = {
  workingDirectoryPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID;
  repositoryRootIdentity: "reviewed_repository_root_identity_v1";
  repositoryEvidenceFingerprint: string;
  expectedRepositoryClassification: "ture_trade_repository_root";
  callerSelectedAbsolutePathAllowed: false;
  personalPathInEvidenceAllowed: false;
  traversalAllowed: false;
  symlinkRootAllowed: false;
  nestedUnrelatedRepositoryAllowed: false;
  productionCheckoutAllowed: false;
  rootVerifiedBeforeDependentOperations: true;
};

export type EnvironmentPolicy = {
  environmentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID;
  startsFromEmptyEnvironment: true;
  fixedLocaleIdentity: "c_utf8_locale_identity";
  noColor: true;
  pagerDisabled: true;
  editorDisabled: true;
  promptingDisabled: true;
  terminalDisabled: true;
  inheritedEnvironmentAllowed: false;
  arbitraryEnvironmentEntryAllowed: false;
  credentialValueAllowed: false;
  actualSecretEnvironmentNameAllowed: false;
  pathDumpAllowed: false;
  homeAllowed: false;
  userAllowed: false;
  shellConfigurationAllowed: false;
  gitConfigOverrideAllowed: false;
  supabaseTokenAllowed: false;
  serviceRoleKeyAllowed: false;
  connectionStringAllowed: false;
  cookieAllowed: false;
  sessionAllowed: false;
  bankIdMaterialAllowed: false;
  opaqueCredentialSlot: "deferred_opaque_staging_cli_credential_slot";
  credentialInjectionImplemented: false;
};

export type ProcessRequest = {
  requestId: string;
  processOperationId: ProcessOperationIdentity;
  processInstanceId: string;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  authorizationFingerprint: string;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  executableIdentity: ProcessExecutableIdentity;
  exactArguments: readonly string[];
  parserIdentity: string;
  workingDirectoryIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID;
  environmentPlanIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID;
  timeoutPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TIMEOUT_REGISTRY_ID;
  stdoutLimitPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID;
  stderrLimitPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID;
  stdinClosed: true;
  ttyDisabled: true;
  pseudoTtyDisabled: true;
  shellDisabled: true;
  detached: false;
  readOnly: true;
  automaticRetryAllowed: false;
  requestedAtIso: "2026-07-16T10:00:00.000Z";
  expiresAtIso: "2026-07-16T10:05:00.000Z";
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
};

export type ProcessLifecyclePolicy = {
  lifecyclePolicyId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_LIFECYCLE_POLICY_ID;
  allowedTransitions: readonly ProcessLifecycleTransition[];
  terminalStates: readonly ProcessLifecycleState[];
  noSecondInvocationFromTerminalState: true;
  overflowToCompletedAllowed: false;
  promptToParsingAllowed: false;
  secretToParsingAllowed: false;
  lifecycleFingerprintAlgorithm: "sha256";
  lifecycleFingerprint: string;
};

export type ProcessContainmentEvidence = {
  containmentPolicyId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTAINMENT_POLICY_ID;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  processInstanceId: string;
  platformClassification: "macos_requires_reviewed_process_tree_observer";
  parentProcessIdentity: "opaque_parent_process_identity";
  processGroupIdentityClassification: "reviewed_process_group_identity";
  directChildCountClassification: "zero" | "nonzero" | "unknown";
  descendantCountClassification: "zero" | "nonzero" | "unknown";
  detachedChildDetected: boolean;
  processGroupEscapeDetected: boolean;
  browserChildDetected: boolean;
  credentialHelperChildDetected: boolean;
  daemonizationDetected: boolean;
  guiChildDetected: boolean;
  urlOpenerDetected: boolean;
  containmentAuthority: "reviewed_process_group_boundary";
  observationSourceIdentity: "fixture_process_tree_observer_v1";
  observedAtIso: "2026-07-16T10:00:30.000Z";
  expiresAtIso: "2026-07-16T10:05:00.000Z";
  complete: boolean;
  authoritative: boolean;
  resultClassification: "contained" | "ambiguous" | "unexpected_child_process";
  containmentFingerprintAlgorithm: "sha256";
  containmentFingerprint: string;
};

export type TerminationPlan = {
  terminationPolicyId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TERMINATION_POLICY_ID;
  requestId: string;
  processOperationId: ProcessOperationIdentity;
  processInstanceId: string;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  trigger: "timeout" | "prompt_detected" | "secret_detected" | "overflow_detected" | "unexpected_child_detected" | "mutation_detected";
  sessionInvalidated: true;
  stopStartingNewOperations: true;
  gracefulParentOrGroupTerminationRequired: true;
  gracefulWaitMs: 750;
  containmentInspectionRequiredAfterGraceful: true;
  forceTerminationIfNeeded: true;
  forceWaitMs: 750;
  containmentInspectionRequiredAfterForce: true;
  parentAndDescendantExitConfirmationRequired: true;
  rawOutputDisposalRequired: true;
  automaticRetryAllowed: false;
  terminalReadinessClassification: "blocked";
  terminationFingerprintAlgorithm: "sha256";
  terminationFingerprint: string;
};

export type FakeDriverFixtureResult = {
  requestId: string;
  lifecycleState: "completed" | "failed" | "timed_out" | "ambiguous";
  exitCode: number | null;
  signalClassification: "none" | "terminated" | "killed" | "unknown";
  timeout: boolean;
  terminationRequested: boolean;
  gracefulTerminationAttempted: boolean;
  forceTerminationAttempted: boolean;
  parentTerminated: boolean;
  directChildrenTerminated: boolean;
  processGroupTerminated: boolean;
  detachedDescendantDetected: boolean;
  unexpectedChildDetected: boolean;
  stdoutByteCount: number;
  stderrByteCount: number;
  stdoutFingerprint: string;
  stderrFingerprint: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  outputOverflow: boolean;
  promptDetected: boolean;
  promptClassification: string | null;
  secretDetected: boolean;
  mutationDetected: boolean;
  containment: ProcessContainmentEvidence;
  observedAtIso: "2026-07-16T10:00:30.000Z";
};

export type SanitizedProcessResultEvidence = {
  requestId: string;
  processOperationId: ProcessOperationIdentity;
  processInstanceId: string;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  executableIdentity: ProcessExecutableIdentity;
  argumentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.argumentPolicy;
  environmentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID;
  workingDirectoryIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID;
  timeoutPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TIMEOUT_REGISTRY_ID;
  stdoutLimitPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID;
  stderrLimitPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID;
  lifecycleTerminalState: FakeDriverFixtureResult["lifecycleState"];
  startedAtIso: "2026-07-16T10:00:00.000Z";
  endedAtIso: "2026-07-16T10:00:30.000Z";
  exitCodeClassification: "zero" | "nonzero" | "none";
  signalClassification: FakeDriverFixtureResult["signalClassification"];
  timeout: boolean;
  terminationRequested: boolean;
  gracefulTerminationAttempted: boolean;
  forceTerminationAttempted: boolean;
  parentTerminated: boolean;
  directChildrenTerminated: boolean;
  processGroupTerminated: boolean;
  detachedDescendantDetected: boolean;
  containmentAuthority: ProcessContainmentEvidence["containmentAuthority"];
  containmentVerified: boolean;
  stdoutByteCount: number;
  stderrByteCount: number;
  stdoutFingerprint: string;
  stderrFingerprint: string;
  truncation: boolean;
  overflow: boolean;
  promptDetected: boolean;
  promptClassification: string | null;
  secretDetected: boolean;
  unexpectedChildDetected: boolean;
  readOnly: true;
  mutationDetected: boolean;
  resultClassification: ProcessResultClassification;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
};

export type ProcessDriverContract = {
  driverContractId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_DRIVER_CONTRACT_ID;
  supportsOnlyExactProcessRequest: true;
  genericExecExposed: false;
  genericSpawnExposed: false;
  shellStringExposed: false;
  arbitraryExecutableExposed: false;
  arbitraryArgumentsExposed: false;
  arbitraryWorkingDirectoryExposed: false;
  arbitraryEnvironmentExposed: false;
  interactiveStdinExposed: false;
  rawProcessObjectExposed: false;
  detachedProcessControlExposed: false;
  unrestrictedSignalDispatchExposed: false;
  arbitraryPidAccessExposed: false;
  globalProcessListingExposed: false;
  genericContainmentAssertionAccepted: false;
  genericTerminationAssertionAccepted: false;
  rawOutputLoggingExposed: false;
  noDefaultLiveDriver: true;
  driverFingerprintAlgorithm: "sha256";
  driverFingerprint: string;
};

export type InjectedFakeProcessDriver = {
  startExactProcessRequest: (request: ProcessRequest) => Promise<{ processInstanceId: string; started: true }>;
  observeProcessStatus: (request: ProcessRequest) => Promise<FakeDriverFixtureResult>;
  requestGracefulTermination: (request: ProcessRequest) => Promise<{ requested: true }>;
  requestForcedTermination: (request: ProcessRequest) => Promise<{ requested: true }>;
  inspectReviewedContainmentState: (request: ProcessRequest) => Promise<ProcessContainmentEvidence>;
  confirmProcessTreeTermination: (request: ProcessRequest) => Promise<ProcessContainmentEvidence>;
  disposeTransientOutputBuffers: (request: ProcessRequest) => Promise<{ disposed: true }>;
};

export type FixtureDriverCollectionResult = {
  adapterInvoked: true;
  valid: boolean;
  blockingReasons: readonly string[];
  resultEvidence: SanitizedProcessResultEvidence | null;
  liveCommandsExecuted: 0;
  observedLive: false;
};

export function buildProcessExecutorDefaultState(): ProcessExecutorDefaultState {
  return {
    executorId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID,
    executorStatus: "not_run",
    processesStarted: 0,
    processesCompleted: 0,
    processesTerminated: 0,
    liveCommandsExecuted: 0,
    runnerExecutionEnabled: false,
    preflightRunStatus: "not_run",
    deploymentEnabled: false,
    remoteMutation: false,
    gitMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
  };
}

export function buildProcessExecutableRegistry(): ProcessExecutableRegistry {
  const executables: ProcessExecutableRegistryEntry[] = [
    executable("git_cli", "git"),
    executable("supabase_cli", "supabase"),
  ];
  const core = {
    registryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_EXECUTABLE_REGISTRY_ID,
    executorContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_VERSION,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    executables,
    arbitraryExecutableAllowed: false,
    callerSelectedPathAllowed: false,
    pathResolutionPerformed: false,
  } satisfies Omit<ProcessExecutableRegistry, "registryFingerprintAlgorithm" | "registryFingerprint">;
  return { ...core, registryFingerprintAlgorithm: "sha256", registryFingerprint: buildProcessExecutableRegistryFingerprint(core) };
}

export function buildProcessOperationRegistry(): ProcessOperationRegistry {
  const operations = [
    ...buildPostTradeReadOnlyLivePreflightRunnerPlan().operations
      .filter((item) => item.executable === "git" || item.executable === "supabase")
      .map(operationFromRunnerSpec),
    {
      operationId: "preflight_supabase_cli_version",
      sourceRunnerOperationId: "preflight_supabase_cli_version",
      executableIdentity: "supabase_cli",
      exactArguments: ["--version"],
      parserIdentity: "supabase_cli_version_parser_v1",
      timeoutPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TIMEOUT_REGISTRY_ID,
      stdoutLimitPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID,
      stderrLimitPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID,
      workingDirectoryPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID,
      environmentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID,
      stdinPolicy: "closed",
      ttyPolicy: "disabled",
      shellPolicy: "disabled",
      readOnly: true,
      networkClassification: "local_only",
      credentialRequirement: "none",
      expectedChildProcessClassification: "zero_expected",
      expectedOutputClassification: "single_line",
      arbitraryArgumentsAllowed: false,
      wildcardArgumentsAllowed: false,
      commandStringAbsent: true,
    } satisfies ProcessOperation,
  ];
  const core = {
    registryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID,
    runnerId: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
    runnerVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
    processExecutorContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_VERSION,
    operations,
    catalogAdapterOperationsIncluded: false,
    arbitraryOperationAllowed: false,
    wildcardOperationAllowed: false,
    prefixMatchingAllowed: false,
  } satisfies Omit<ProcessOperationRegistry, "operationFingerprintAlgorithm" | "operationFingerprint">;
  return { ...core, operationFingerprintAlgorithm: "sha256", operationFingerprint: buildProcessOperationRegistryFingerprint(core) };
}

export function buildProcessTimeoutRegistry(): ProcessTimeoutRegistry {
  const policies = buildProcessOperationRegistry().operations.map((operation) => ({
    operationId: operation.operationId,
    timeoutMs: operation.executableIdentity === "supabase_cli" ? 15_000 : 5_000,
    gracefulTerminationGraceMs: 750,
    forcedTerminationGraceMs: 750,
    containmentVerificationDeadlineMs: 500,
    callerMayIncrease: false,
    automaticRetryAllowed: false,
    sessionInvalidatedOnTimeout: true,
  } satisfies ProcessTimeoutPolicy));
  const core = {
    registryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TIMEOUT_REGISTRY_ID,
    policies,
    unknownPolicyAllowed: false,
  } satisfies Omit<ProcessTimeoutRegistry, "timeoutFingerprintAlgorithm" | "timeoutFingerprint">;
  return { ...core, timeoutFingerprintAlgorithm: "sha256", timeoutFingerprint: buildProcessTimeoutRegistryFingerprint(core) };
}

export function buildProcessOutputLimitRegistry(): ProcessOutputLimitRegistry {
  const policies = buildProcessOperationRegistry().operations.map((operation) => ({
    operationId: operation.operationId,
    maxStdoutBytes: operation.executableIdentity === "supabase_cli" ? 32_768 : 16_384,
    maxStderrBytes: 8_192,
    callerMayIncrease: false,
    truncationProhibited: true,
    overflowBlocksParserAuthority: true,
    rawOutputDisposalRequired: true,
    automaticRetryAllowed: false,
    sessionInvalidatedOnOverflow: true,
  } satisfies ProcessOutputLimitPolicy));
  const core = {
    registryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID,
    policies,
    unknownPolicyAllowed: false,
  } satisfies Omit<ProcessOutputLimitRegistry, "outputFingerprintAlgorithm" | "outputFingerprint">;
  return { ...core, outputFingerprintAlgorithm: "sha256", outputFingerprint: buildProcessOutputLimitRegistryFingerprint(core) };
}

export function buildWorkingDirectoryPolicy(): WorkingDirectoryPolicy {
  return {
    workingDirectoryPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID,
    repositoryRootIdentity: "reviewed_repository_root_identity_v1",
    repositoryEvidenceFingerprint: hash("reviewed_repository_root_identity_v1"),
    expectedRepositoryClassification: "ture_trade_repository_root",
    callerSelectedAbsolutePathAllowed: false,
    personalPathInEvidenceAllowed: false,
    traversalAllowed: false,
    symlinkRootAllowed: false,
    nestedUnrelatedRepositoryAllowed: false,
    productionCheckoutAllowed: false,
    rootVerifiedBeforeDependentOperations: true,
  };
}

export function buildEnvironmentPolicy(): EnvironmentPolicy {
  return {
    environmentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID,
    startsFromEmptyEnvironment: true,
    fixedLocaleIdentity: "c_utf8_locale_identity",
    noColor: true,
    pagerDisabled: true,
    editorDisabled: true,
    promptingDisabled: true,
    terminalDisabled: true,
    inheritedEnvironmentAllowed: false,
    arbitraryEnvironmentEntryAllowed: false,
    credentialValueAllowed: false,
    actualSecretEnvironmentNameAllowed: false,
    pathDumpAllowed: false,
    homeAllowed: false,
    userAllowed: false,
    shellConfigurationAllowed: false,
    gitConfigOverrideAllowed: false,
    supabaseTokenAllowed: false,
    serviceRoleKeyAllowed: false,
    connectionStringAllowed: false,
    cookieAllowed: false,
    sessionAllowed: false,
    bankIdMaterialAllowed: false,
    opaqueCredentialSlot: "deferred_opaque_staging_cli_credential_slot",
    credentialInjectionImplemented: false,
  };
}

export function buildProcessLifecyclePolicy(): ProcessLifecyclePolicy {
  const allowedTransitions: ProcessLifecycleTransition[] = [
    "not_started->starting",
    "starting->running",
    "running->exit_observed",
    "exit_observed->completed",
    "running->timed_out",
    "timed_out->termination_requested",
    "termination_requested->graceful_termination_wait",
    "graceful_termination_wait->containment_verification",
    "graceful_termination_wait->force_termination_requested",
    "force_termination_requested->force_termination_wait",
    "force_termination_wait->containment_verification",
    "containment_verification->terminated",
    "running->failed",
    "termination_requested->termination_failed",
    "containment_verification->ambiguous",
  ];
  const core = {
    lifecyclePolicyId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_LIFECYCLE_POLICY_ID,
    allowedTransitions,
    terminalStates: ["completed", "failed", "terminated", "termination_failed", "ambiguous"],
    noSecondInvocationFromTerminalState: true,
    overflowToCompletedAllowed: false,
    promptToParsingAllowed: false,
    secretToParsingAllowed: false,
  } satisfies Omit<ProcessLifecyclePolicy, "lifecycleFingerprintAlgorithm" | "lifecycleFingerprint">;
  return { ...core, lifecycleFingerprintAlgorithm: "sha256", lifecycleFingerprint: buildProcessLifecyclePolicyFingerprint(core) };
}

export function buildProcessRequest(operationId: ProcessOperationIdentity): ProcessRequest {
  const operation = findOperation(operationId);
  const authorization = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();
  const core = {
    requestId: `post_trade_first_live_read_only_staging_preflight_${operationId}_process_request_001`,
    processOperationId: operationId,
    processInstanceId: `post_trade_first_live_read_only_staging_preflight_${operationId}_process_instance_001`,
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    authorizationArtifactId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
    authorizationFingerprint: authorization.artifactFingerprint,
    preflightRunId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
    executableIdentity: operation.executableIdentity,
    exactArguments: operation.exactArguments,
    parserIdentity: operation.parserIdentity,
    workingDirectoryIdentity: operation.workingDirectoryPolicyIdentity,
    environmentPlanIdentity: operation.environmentPolicyIdentity,
    timeoutPolicyIdentity: operation.timeoutPolicyIdentity,
    stdoutLimitPolicyIdentity: operation.stdoutLimitPolicyIdentity,
    stderrLimitPolicyIdentity: operation.stderrLimitPolicyIdentity,
    stdinClosed: true,
    ttyDisabled: true,
    pseudoTtyDisabled: true,
    shellDisabled: true,
    detached: false,
    readOnly: true,
    automaticRetryAllowed: false,
    requestedAtIso: "2026-07-16T10:00:00.000Z",
    expiresAtIso: "2026-07-16T10:05:00.000Z",
  } satisfies Omit<ProcessRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return { ...core, requestFingerprintAlgorithm: "sha256", requestFingerprint: buildProcessRequestFingerprint(core) };
}

export function buildContainmentEvidence(
  request: ProcessRequest,
  patch: Partial<Omit<ProcessContainmentEvidence, "containmentFingerprintAlgorithm" | "containmentFingerprint">> = {},
): ProcessContainmentEvidence {
  const core = {
    containmentPolicyId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTAINMENT_POLICY_ID,
    boundarySessionId: request.boundarySessionId,
    processInstanceId: request.processInstanceId,
    platformClassification: "macos_requires_reviewed_process_tree_observer",
    parentProcessIdentity: "opaque_parent_process_identity",
    processGroupIdentityClassification: "reviewed_process_group_identity",
    directChildCountClassification: "zero",
    descendantCountClassification: "zero",
    detachedChildDetected: false,
    processGroupEscapeDetected: false,
    browserChildDetected: false,
    credentialHelperChildDetected: false,
    daemonizationDetected: false,
    guiChildDetected: false,
    urlOpenerDetected: false,
    containmentAuthority: "reviewed_process_group_boundary",
    observationSourceIdentity: "fixture_process_tree_observer_v1",
    observedAtIso: "2026-07-16T10:00:30.000Z",
    expiresAtIso: "2026-07-16T10:05:00.000Z",
    complete: true,
    authoritative: true,
    resultClassification: "contained",
    ...patch,
  } satisfies Omit<ProcessContainmentEvidence, "containmentFingerprintAlgorithm" | "containmentFingerprint">;
  return { ...core, containmentFingerprintAlgorithm: "sha256", containmentFingerprint: buildProcessContainmentFingerprint(core) };
}

export function buildTerminationPlan(request: ProcessRequest, trigger: TerminationPlan["trigger"] = "timeout"): TerminationPlan {
  const core = {
    terminationPolicyId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TERMINATION_POLICY_ID,
    requestId: request.requestId,
    processOperationId: request.processOperationId,
    processInstanceId: request.processInstanceId,
    boundarySessionId: request.boundarySessionId,
    trigger,
    sessionInvalidated: true,
    stopStartingNewOperations: true,
    gracefulParentOrGroupTerminationRequired: true,
    gracefulWaitMs: 750,
    containmentInspectionRequiredAfterGraceful: true,
    forceTerminationIfNeeded: true,
    forceWaitMs: 750,
    containmentInspectionRequiredAfterForce: true,
    parentAndDescendantExitConfirmationRequired: true,
    rawOutputDisposalRequired: true,
    automaticRetryAllowed: false,
    terminalReadinessClassification: "blocked",
  } satisfies Omit<TerminationPlan, "terminationFingerprintAlgorithm" | "terminationFingerprint">;
  return { ...core, terminationFingerprintAlgorithm: "sha256", terminationFingerprint: buildTerminationPlanFingerprint(core) };
}

export function buildFakeDriverFixtureResult(
  request: ProcessRequest,
  patch: Partial<FakeDriverFixtureResult> = {},
): FakeDriverFixtureResult {
  return {
    requestId: request.requestId,
    lifecycleState: "completed",
    exitCode: 0,
    signalClassification: "none",
    timeout: false,
    terminationRequested: false,
    gracefulTerminationAttempted: false,
    forceTerminationAttempted: false,
    parentTerminated: true,
    directChildrenTerminated: true,
    processGroupTerminated: true,
    detachedDescendantDetected: false,
    unexpectedChildDetected: false,
    stdoutByteCount: 12,
    stderrByteCount: 0,
    stdoutFingerprint: hash("fixture_stdout"),
    stderrFingerprint: hash(""),
    stdoutTruncated: false,
    stderrTruncated: false,
    outputOverflow: false,
    promptDetected: false,
    promptClassification: null,
    secretDetected: false,
    mutationDetected: false,
    containment: buildContainmentEvidence(request),
    observedAtIso: "2026-07-16T10:00:30.000Z",
    ...patch,
  };
}

export function buildSanitizedProcessResultEvidence(
  request: ProcessRequest,
  fixture: FakeDriverFixtureResult,
): SanitizedProcessResultEvidence {
  const classification = classifyProcessFixtureResult(request, fixture);
  const core = {
    requestId: request.requestId,
    processOperationId: request.processOperationId,
    processInstanceId: request.processInstanceId,
    boundarySessionId: request.boundarySessionId,
    executableIdentity: request.executableIdentity,
    argumentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.argumentPolicy,
    environmentPolicyIdentity: request.environmentPlanIdentity,
    workingDirectoryIdentity: request.workingDirectoryIdentity,
    timeoutPolicyIdentity: request.timeoutPolicyIdentity,
    stdoutLimitPolicyIdentity: request.stdoutLimitPolicyIdentity,
    stderrLimitPolicyIdentity: request.stderrLimitPolicyIdentity,
    lifecycleTerminalState: fixture.lifecycleState,
    startedAtIso: "2026-07-16T10:00:00.000Z",
    endedAtIso: "2026-07-16T10:00:30.000Z",
    exitCodeClassification: fixture.exitCode === 0 ? "zero" : fixture.exitCode === null ? "none" : "nonzero",
    signalClassification: fixture.signalClassification,
    timeout: fixture.timeout,
    terminationRequested: fixture.terminationRequested,
    gracefulTerminationAttempted: fixture.gracefulTerminationAttempted,
    forceTerminationAttempted: fixture.forceTerminationAttempted,
    parentTerminated: fixture.parentTerminated,
    directChildrenTerminated: fixture.directChildrenTerminated,
    processGroupTerminated: fixture.processGroupTerminated,
    detachedDescendantDetected: fixture.detachedDescendantDetected,
    containmentAuthority: fixture.containment.containmentAuthority,
    containmentVerified: fixture.containment.complete && fixture.containment.authoritative && fixture.containment.resultClassification === "contained",
    stdoutByteCount: fixture.stdoutByteCount,
    stderrByteCount: fixture.stderrByteCount,
    stdoutFingerprint: fixture.stdoutFingerprint,
    stderrFingerprint: fixture.stderrFingerprint,
    truncation: fixture.stdoutTruncated || fixture.stderrTruncated,
    overflow: fixture.outputOverflow,
    promptDetected: fixture.promptDetected,
    promptClassification: fixture.promptClassification,
    secretDetected: fixture.secretDetected,
    unexpectedChildDetected: fixture.unexpectedChildDetected,
    readOnly: true,
    mutationDetected: fixture.mutationDetected,
    resultClassification: classification,
  } satisfies Omit<SanitizedProcessResultEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return { ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: buildSanitizedProcessResultFingerprint(core) };
}

export function buildProcessDriverContract(): ProcessDriverContract {
  const core = {
    driverContractId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_DRIVER_CONTRACT_ID,
    supportsOnlyExactProcessRequest: true,
    genericExecExposed: false,
    genericSpawnExposed: false,
    shellStringExposed: false,
    arbitraryExecutableExposed: false,
    arbitraryArgumentsExposed: false,
    arbitraryWorkingDirectoryExposed: false,
    arbitraryEnvironmentExposed: false,
    interactiveStdinExposed: false,
    rawProcessObjectExposed: false,
    detachedProcessControlExposed: false,
    unrestrictedSignalDispatchExposed: false,
    arbitraryPidAccessExposed: false,
    globalProcessListingExposed: false,
    genericContainmentAssertionAccepted: false,
    genericTerminationAssertionAccepted: false,
    rawOutputLoggingExposed: false,
    noDefaultLiveDriver: true,
  } satisfies Omit<ProcessDriverContract, "driverFingerprintAlgorithm" | "driverFingerprint">;
  return { ...core, driverFingerprintAlgorithm: "sha256", driverFingerprint: buildProcessDriverContractFingerprint(core) };
}

export function buildInertProcessExecutorPlan() {
  return {
    planId: "post_trade_first_live_read_only_staging_preflight_process_executor_inert_plan_001",
    executorId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID,
    status: "not_run",
    steps: [
      "validate executor contract",
      "validate authorization compatibility",
      "validate runner compatibility",
      "validate version-collector compatibility",
      "validate credential-boundary compatibility",
      "validate executable and operation registries",
      "resolve no executable yet",
      "prepare one exact process request",
      "require a separately reviewed live driver",
      "start one contained read-only process in future action",
      "collect bounded transient output in future action",
      "parse prompt and secret conditions",
      "apply timeout and termination policy",
      "build sanitized process evidence",
      "stop before deployment",
    ],
    containsCommandString: false,
    containsExecutablePath: false,
    containsEnvironmentValue: false,
    containsCredential: false,
    containsRawOutput: false,
    containsSql: false,
    containsDeployment: false,
    containsRetry: false,
    liveCommandsExecuted: 0,
    driverInvoked: false,
    runnerExecutionEnabled: false,
    deploymentEnabled: false,
  } as const;
}

export async function collectProcessResultFromInjectedFakeDriver(
  driver: InjectedFakeProcessDriver,
  request: ProcessRequest,
): Promise<FixtureDriverCollectionResult> {
  const requestValidation = validateProcessRequest(request);
  if (!requestValidation.valid) {
    return { adapterInvoked: false as true, valid: false, blockingReasons: requestValidation.blockingReasons, resultEvidence: null, liveCommandsExecuted: 0, observedLive: false };
  }
  await driver.startExactProcessRequest(request);
  const fixture = await driver.observeProcessStatus(request);
  const fixtureValidation = validateFakeDriverFixtureResult(request, fixture);
  await driver.disposeTransientOutputBuffers(request);
  if (!fixtureValidation.valid) {
    return { adapterInvoked: true, valid: false, blockingReasons: fixtureValidation.blockingReasons, resultEvidence: null, liveCommandsExecuted: 0, observedLive: false };
  }
  const resultEvidence = buildSanitizedProcessResultEvidence(request, fixture);
  const resultValidation = validateSanitizedProcessResultEvidence(resultEvidence);
  return {
    adapterInvoked: true,
    valid: resultValidation.valid,
    blockingReasons: resultValidation.blockingReasons,
    resultEvidence: resultValidation.valid ? resultEvidence : null,
    liveCommandsExecuted: 0,
    observedLive: false,
  };
}

export function validateProcessExecutableRegistry(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildProcessExecutableRegistry(), "executable_registry", buildProcessExecutableRegistryFingerprint, "registryFingerprint", "registryFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  const executables = input.executables;
  if (!Array.isArray(executables)) reasons.push("executables_not_array");
  const identities = Array.isArray(executables) ? executables.map((item) => isRecord(item) ? item.executableIdentity : "") : [];
  if (!identities.includes("git_cli")) reasons.push("missing_git_cli");
  if (!identities.includes("supabase_cli")) reasons.push("missing_supabase_cli");
  if (new Set(identities).size !== identities.length) reasons.push("duplicate_executable_identity");
  for (const entry of Array.isArray(executables) ? executables : []) {
    if (!isRecord(entry)) continue;
    if (entry.wrapperProhibited !== true || entry.aliasProhibited !== true || entry.shellFunctionProhibited !== true || entry.scriptProxyProhibited !== true) reasons.push("unsafe_executable_wrapper_surface");
    if (entry.callerSelectedPathProhibited !== true || entry.executablePathAbsent !== true) reasons.push("caller_selected_or_path_exposed");
  }
  return result(reasons);
}

export function validateProcessOperationRegistry(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildProcessOperationRegistry(), "operation_registry", buildProcessOperationRegistryFingerprint, "operationFingerprint", "operationFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  const operations = input.operations;
  if (!Array.isArray(operations)) reasons.push("operations_not_array");
  const expected = buildProcessOperationRegistry().operations;
  const identities = Array.isArray(operations) ? operations.map((item) => isRecord(item) ? item.operationId : "") : [];
  if (new Set(identities).size !== identities.length) reasons.push("duplicate_operation_identity");
  for (const operation of expected) if (!identities.includes(operation.operationId)) reasons.push(`missing_operation:${operation.operationId}`);
  for (const item of Array.isArray(operations) ? operations : []) {
    if (!isRecord(item)) continue;
    const known = expected.find((operation) => operation.operationId === item.operationId);
    if (!known) {
      reasons.push("unknown_operation");
      continue;
    }
    if (item.executableIdentity !== known.executableIdentity) reasons.push("operation_executable_mismatch");
    if (!Array.isArray(item.exactArguments) || item.exactArguments.length !== known.exactArguments.length || item.exactArguments.some((arg, index) => arg !== known.exactArguments[index])) {
      reasons.push("altered_arguments");
    }
    if (Array.isArray(item.exactArguments)) reasons.push(...validateArgumentArray(item.exactArguments, known.exactArguments));
    if (item.commandStringAbsent !== true) reasons.push("command_string_present");
    if (item.arbitraryArgumentsAllowed !== false || item.wildcardArgumentsAllowed !== false) reasons.push("arbitrary_or_wildcard_arguments_allowed");
  }
  return result(reasons);
}

export function validateProcessRequest(input: unknown): ValidationResult {
  if (!isRecord(input)) return invalid(["request_not_object"]);
  const known = isProcessOperationIdentity(input.processOperationId) ? findOperation(input.processOperationId) : null;
  const canonical = known ? buildProcessRequest(known.operationId) : null;
  const reasons = canonical
    ? validateExactReasons(input, canonical, "process_request", buildProcessRequestFingerprint, "requestFingerprint", "requestFingerprintAlgorithm")
    : ["unknown_operation"];
  if (!known) return invalid(reasons);
  if (input.executableIdentity !== known.executableIdentity) reasons.push("operation_executable_mismatch");
  if (!Array.isArray(input.exactArguments)) reasons.push("arguments_not_array");
  if (Array.isArray(input.exactArguments)) reasons.push(...validateArgumentArray(input.exactArguments, known.exactArguments));
  if (input.workingDirectoryIdentity !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID) reasons.push("invalid_working_directory");
  if (input.environmentPlanIdentity !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID) reasons.push("invalid_environment_policy");
  if (input.stdinClosed !== true) reasons.push("stdin_enabled");
  if (input.ttyDisabled !== true || input.pseudoTtyDisabled !== true) reasons.push("tty_enabled");
  if (input.shellDisabled !== true) reasons.push("shell_enabled");
  if (input.detached !== false) reasons.push("detached_enabled");
  if (input.automaticRetryAllowed !== false) reasons.push("retry_enabled");
  return result(reasons);
}

export function validateWorkingDirectoryPolicy(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildWorkingDirectoryPolicy(), "working_directory_policy");
  if (!isRecord(input)) return invalid(reasons);
  if (input.callerSelectedAbsolutePathAllowed !== false) reasons.push("absolute_cwd_allowed");
  if (input.traversalAllowed !== false) reasons.push("traversal_cwd_allowed");
  if (input.personalPathInEvidenceAllowed !== false) reasons.push("personal_path_allowed");
  if (input.symlinkRootAllowed !== false) reasons.push("symlink_root_allowed");
  if (input.nestedUnrelatedRepositoryAllowed !== false) reasons.push("nested_unrelated_repository_allowed");
  if (input.productionCheckoutAllowed !== false) reasons.push("production_checkout_allowed");
  return result(reasons);
}

export function validateEnvironmentPolicy(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildEnvironmentPolicy(), "environment_policy");
  if (!isRecord(input)) return invalid(reasons);
  const forbiddenTrue = [
    "inheritedEnvironmentAllowed",
    "arbitraryEnvironmentEntryAllowed",
    "credentialValueAllowed",
    "actualSecretEnvironmentNameAllowed",
    "pathDumpAllowed",
    "homeAllowed",
    "userAllowed",
    "shellConfigurationAllowed",
    "gitConfigOverrideAllowed",
    "supabaseTokenAllowed",
    "serviceRoleKeyAllowed",
    "connectionStringAllowed",
    "cookieAllowed",
    "sessionAllowed",
    "bankIdMaterialAllowed",
  ];
  for (const key of forbiddenTrue) if (input[key] !== false) reasons.push(`unsafe_environment_${key}`);
  if (input.startsFromEmptyEnvironment !== true) reasons.push("environment_not_empty_start");
  return result(reasons);
}

export function validateProcessTimeoutRegistry(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildProcessTimeoutRegistry(), "timeout_registry", buildProcessTimeoutRegistryFingerprint, "timeoutFingerprint", "timeoutFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  if (!Array.isArray(input.policies)) return invalid([...reasons, "timeout_policies_not_array"]);
  for (const policy of input.policies) {
    if (!isRecord(policy)) continue;
    const canonical = buildProcessTimeoutRegistry().policies.find((item) => item.operationId === policy.operationId);
    if (!canonical) reasons.push("unknown_timeout_policy");
    if (canonical && typeof policy.timeoutMs === "number" && policy.timeoutMs > canonical.timeoutMs) reasons.push("caller_raised_timeout");
    if (policy.automaticRetryAllowed !== false) reasons.push("timeout_retry_allowed");
  }
  return result(reasons);
}

export function validateProcessOutputLimitRegistry(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildProcessOutputLimitRegistry(), "output_registry", buildProcessOutputLimitRegistryFingerprint, "outputFingerprint", "outputFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  if (!Array.isArray(input.policies)) return invalid([...reasons, "output_policies_not_array"]);
  for (const policy of input.policies) {
    if (!isRecord(policy)) continue;
    const canonical = buildProcessOutputLimitRegistry().policies.find((item) => item.operationId === policy.operationId);
    if (!canonical) reasons.push("unknown_output_policy");
    if (canonical && typeof policy.maxStdoutBytes === "number" && policy.maxStdoutBytes > canonical.maxStdoutBytes) reasons.push("caller_raised_stdout_limit");
    if (canonical && typeof policy.maxStderrBytes === "number" && policy.maxStderrBytes > canonical.maxStderrBytes) reasons.push("caller_raised_stderr_limit");
    if (policy.truncationProhibited !== true) reasons.push("truncation_not_prohibited");
    if (policy.overflowBlocksParserAuthority !== true) reasons.push("overflow_does_not_block_parser");
  }
  return result(reasons);
}

export function validateLifecycleTransitions(transitions: readonly ProcessLifecycleTransition[]): ValidationResult {
  const allowed = new Set(buildProcessLifecyclePolicy().allowedTransitions);
  const reasons: string[] = [];
  for (const transition of transitions) {
    if (!allowed.has(transition)) reasons.push(`illegal_lifecycle_transition:${transition}`);
  }
  return result(reasons);
}

export function validateContainmentEvidence(input: unknown): ValidationResult {
  const reasons: string[] = [];
  if (!isRecord(input)) return invalid(["containment_not_object"]);
  if (input.containmentFingerprintAlgorithm !== "sha256" || !isSha256(input.containmentFingerprint)) reasons.push("invalid_containment_fingerprint");
  const core = omitFingerprint(input, "containmentFingerprint", "containmentFingerprintAlgorithm");
  if (isSha256(input.containmentFingerprint) && input.containmentFingerprint !== buildProcessContainmentFingerprint(core)) reasons.push("containment_fingerprint_mismatch");
  if (input.boundarySessionId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID) reasons.push("wrong_boundary_session");
  if (input.complete !== true || input.authoritative !== true) reasons.push("incomplete_or_non_authoritative_containment");
  if (input.resultClassification !== "contained") reasons.push("containment_not_confirmed");
  if (input.directChildCountClassification !== "zero") reasons.push("missing_or_surviving_child_evidence");
  if (input.descendantCountClassification !== "zero") reasons.push("missing_or_surviving_descendant_evidence");
  for (const key of ["detachedChildDetected", "processGroupEscapeDetected", "browserChildDetected", "credentialHelperChildDetected", "daemonizationDetected", "guiChildDetected", "urlOpenerDetected"]) {
    if (input[key] !== false) reasons.push(`containment_violation:${key}`);
  }
  return result(reasons);
}

export function validateTerminationPlan(input: unknown): ValidationResult {
  const reasons: string[] = [];
  if (!isRecord(input)) return invalid(["termination_plan_not_object"]);
  if (input.terminationFingerprintAlgorithm !== "sha256" || !isSha256(input.terminationFingerprint)) reasons.push("invalid_termination_fingerprint");
  const core = omitFingerprint(input, "terminationFingerprint", "terminationFingerprintAlgorithm");
  if (isSha256(input.terminationFingerprint) && input.terminationFingerprint !== buildTerminationPlanFingerprint(core)) reasons.push("termination_fingerprint_mismatch");
  if (input.sessionInvalidated !== true) reasons.push("timeout_does_not_invalidate_session");
  if (input.stopStartingNewOperations !== true) reasons.push("does_not_stop_new_operations");
  if (input.automaticRetryAllowed !== false) reasons.push("retry_allowed");
  if (input.parentAndDescendantExitConfirmationRequired !== true) reasons.push("parent_only_termination_treated_complete");
  return result(reasons);
}

export function validateFakeDriverFixtureResult(request: ProcessRequest, input: unknown): ValidationResult {
  const reasons: string[] = [];
  if (!isRecord(input)) return invalid(["fixture_result_not_object"]);
  const allowed = new Set(Object.keys(buildFakeDriverFixtureResult(request)));
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) reasons.push(`unknown_fixture_result_field:${key}`);
    if (!allowed.has(key) && isSensitiveFieldName(key)) reasons.push("sensitive_unknown_fixture_field_present");
  }
  if (input.requestId !== request.requestId) reasons.push("fixture_request_mismatch");
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  const containment = validateContainmentEvidence(input.containment);
  if (!containment.valid) reasons.push(...containment.blockingReasons);
  if (input.lifecycleState === "completed" && input.exitCode !== 0) reasons.push("completed_requires_zero_exit");
  if (input.lifecycleState === "completed" && input.timeout === true) reasons.push("completed_with_timeout");
  if (input.lifecycleState === "completed" && input.terminationRequested === true) reasons.push("completed_with_termination_request");
  if (input.lifecycleState === "completed" && input.outputOverflow === true) reasons.push("completed_with_overflow");
  if (input.lifecycleState === "completed" && input.promptDetected === true) reasons.push("completed_with_prompt");
  if (input.lifecycleState === "completed" && input.secretDetected === true) reasons.push("completed_with_secret");
  if (input.lifecycleState === "completed" && input.unexpectedChildDetected === true) reasons.push("completed_with_unexpected_child");
  if (input.lifecycleState === "completed" && input.mutationDetected === true) reasons.push("completed_with_mutation");
  if (input.promptDetected === true && !isKnownPromptClassification(input.promptClassification)) reasons.push("unknown_prompt_classification");
  if (input.timeout === true && (input.terminationRequested !== true || input.gracefulTerminationAttempted !== true || input.parentTerminated !== true || input.directChildrenTerminated !== true || input.processGroupTerminated !== true)) {
    reasons.push("timeout_missing_termination_evidence");
  }
  if (input.stdoutTruncated === true || input.stderrTruncated === true) reasons.push("truncated_output_ambiguous");
  return result(reasons);
}

export function validateSanitizedProcessResultEvidence(input: unknown): ValidationResult {
  const reasons: string[] = [];
  if (!isRecord(input)) return invalid(["process_result_not_object"]);
  if (input.evidenceFingerprintAlgorithm !== "sha256" || !isSha256(input.evidenceFingerprint)) reasons.push("invalid_result_fingerprint");
  const core = omitFingerprint(input, "evidenceFingerprint", "evidenceFingerprintAlgorithm");
  if (isSha256(input.evidenceFingerprint) && input.evidenceFingerprint !== buildSanitizedProcessResultFingerprint(core)) reasons.push("result_fingerprint_mismatch");
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  if ("rawStdout" in input || "rawStderr" in input || "executablePath" in input || "pid" in input) reasons.push("raw_or_path_material_present");
  if (input.resultClassification === "completed_read_only") {
    if (input.timeout !== false || input.overflow !== false || input.promptDetected !== false || input.secretDetected !== false || input.unexpectedChildDetected !== false || input.mutationDetected !== false) {
      reasons.push("completed_read_only_has_blocking_signal");
    }
    if (input.containmentVerified !== true) reasons.push("completed_read_only_without_containment");
    if (input.exitCodeClassification !== "zero") reasons.push("completed_read_only_without_zero_exit");
    if (input.lifecycleTerminalState !== "completed") reasons.push("completed_read_only_without_completed_lifecycle");
    if (input.terminationRequested !== false) reasons.push("completed_read_only_with_termination_request");
  }
  return result(reasons);
}

export function validateProcessDriverContract(input: unknown): ValidationResult {
  return validateExact(input, buildProcessDriverContract(), "driver_contract", buildProcessDriverContractFingerprint, "driverFingerprint", "driverFingerprintAlgorithm");
}

export function validateProcessExecutorExecutionBoundaryCompatibility(): ValidationResult {
  const reasons: string[] = [];
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION !== "post_trade_first_live_read_only_staging_preflight_execution_boundary_contract_v1") reasons.push("unexpected_execution_boundary_version");
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_POLICY_ID !== "post_trade_first_live_read_only_staging_preflight_process_policy_v1") reasons.push("unexpected_process_policy");
  reasons.push(...validateCliVersionCollectorExecutionBoundaryCompatibility().blockingReasons);
  return result(reasons);
}

export function validateProcessExecutorAuthorizationCompatibility(): ValidationResult {
  const artifact = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();
  const artifactValidation = validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact(artifact);
  const collectorValidation = validateCliVersionCollectorAuthorizationCompatibility();
  return result([...artifactValidation.blockingReasons, ...collectorValidation.blockingReasons]);
}

export function validateProcessExecutorRunnerCompatibility(): ValidationResult {
  const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();
  const reasons: string[] = [];
  if (plan.runnerId !== POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID) reasons.push("runner_id_mismatch");
  if (plan.runnerStatus !== "not_run") reasons.push("runner_not_inert");
  if (plan.deploymentEnabled !== false || plan.remoteMutation !== false || plan.sqlExecuted !== false) reasons.push("runner_mutation_enabled");
  reasons.push(...validateCliVersionCollectorRunnerCompatibility().blockingReasons);
  return result(reasons);
}

export function validateProcessExecutorCliVersionCollectorCompatibility(): ValidationResult {
  const reasons: string[] = [];
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID !== "post_trade_first_live_read_only_staging_preflight_cli_version_collector_001") reasons.push("collector_id_mismatch");
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION !== "post_trade_first_live_read_only_staging_preflight_cli_version_collector_contract_v1") reasons.push("collector_version_mismatch");
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_ID !== "post_trade_first_live_read_only_staging_preflight_process_executor_contract_v1") reasons.push("collector_executor_contract_mismatch");
  return result(reasons);
}

export function validateProcessExecutorCredentialDesignCompatibility(): ValidationResult {
  const reasons = [
    ...validateProviderDesignCompatibility().blockingReasons,
    ...validateCliVersionCollectorCredentialDesignCompatibility().blockingReasons,
  ];
  if (POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_VERSION !== "post_trade_live_ephemeral_staging_supabase_credential_provider_design_v1") {
    reasons.push("credential_provider_design_version_mismatch");
  }
  return result(reasons);
}

export const buildProcessExecutableRegistryFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildProcessOperationRegistryFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildProcessRequestFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildProcessTimeoutRegistryFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildProcessOutputLimitRegistryFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildProcessLifecyclePolicyFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildProcessContainmentFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildTerminationPlanFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildSanitizedProcessResultFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildProcessDriverContractFingerprint = (input: unknown) => hash(stableStringify(input));
export const buildProcessCompatibilityFingerprint = (input: unknown) => hash(stableStringify(input));

function executable(executableIdentity: ProcessExecutableIdentity, expectedBasename: "git" | "supabase"): ProcessExecutableRegistryEntry {
  return {
    executableIdentity,
    expectedBasename,
    executableContractVersion: "post_trade_process_executable_identity_contract_v1",
    resolverPolicyIdentity: "reviewed_fixture_only_no_path_resolution_v1",
    wrapperProhibited: true,
    aliasProhibited: true,
    shellFunctionProhibited: true,
    scriptProxyProhibited: true,
    unresolvedSymlinkProhibited: true,
    callerSelectedPathProhibited: true,
    productionWrapperProhibited: true,
    shellDisabled: true,
    detachedProhibited: true,
    executablePathAbsent: true,
  };
}

function operationFromRunnerSpec(spec: PostTradeReadOnlyLivePreflightCommandSpec): ProcessOperation {
  return {
    operationId: spec.operationId as ProcessOperationIdentity,
    sourceRunnerOperationId: spec.operationId,
    executableIdentity: spec.executable === "git" ? "git_cli" : "supabase_cli",
    exactArguments: spec.args,
    parserIdentity: spec.parserIdentity,
    timeoutPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_TIMEOUT_REGISTRY_ID,
    stdoutLimitPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID,
    stderrLimitPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OUTPUT_REGISTRY_ID,
    workingDirectoryPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_WORKDIR_POLICY_ID,
    environmentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ENVIRONMENT_POLICY_ID,
    stdinPolicy: "closed",
    ttyPolicy: "disabled",
    shellPolicy: "disabled",
    readOnly: true,
    networkClassification: spec.executable === "supabase" ? "staging_metadata_only" : "local_only",
    credentialRequirement: spec.executable === "supabase" ? "opaque_staging_cli_credential_slot" : "none",
    expectedChildProcessClassification: "zero_expected",
    expectedOutputClassification: spec.expectedOutputClassification as ProcessOperation["expectedOutputClassification"],
    arbitraryArgumentsAllowed: false,
    wildcardArgumentsAllowed: false,
    commandStringAbsent: true,
  };
}

function findOperation(operationId: ProcessOperationIdentity): ProcessOperation {
  const operation = buildProcessOperationRegistry().operations.find((item) => item.operationId === operationId);
  if (!operation) throw new Error(`unknown process operation: ${operationId}`);
  return operation;
}

function isProcessOperationIdentity(value: unknown): value is ProcessOperationIdentity {
  return typeof value === "string" && buildProcessOperationRegistry().operations.some((item) => item.operationId === value);
}

function validateArgumentArray(actual: readonly unknown[], expected: readonly string[]): string[] {
  const reasons: string[] = [];
  if (actual.length < expected.length) reasons.push("missing_argument");
  if (actual.length > expected.length) reasons.push("extra_argument");
  if (actual.length === expected.length && actual.some((arg, index) => arg !== expected[index])) reasons.push("unknown_or_reordered_argument");
  const seenFlags = new Set<string>();
  for (const arg of actual) {
    if (typeof arg !== "string") {
      reasons.push("argument_not_string");
      continue;
    }
    if (arg.length === 0) reasons.push("empty_argument");
    if (arg.trim() !== arg) reasons.push("padded_argument");
    if (arg.startsWith("-") && seenFlags.has(arg)) reasons.push("duplicate_flag");
    if (arg.startsWith("-")) seenFlags.add(arg);
    if (containsUnsafeArgument(arg)) reasons.push("unsafe_argument");
  }
  return [...new Set(reasons)].sort();
}

function containsUnsafeArgument(value: string): boolean {
  if (value.includes(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF)) return true;
  if (/[;&|<>`]/u.test(value)) return true;
  if (value.includes("$(") || /\$[A-Za-z_]/u.test(value)) return true;
  if (/[\n\r\0\u2028\u2029]/u.test(value)) return true;
  if (/[\u0001-\u001f\u007f]/u.test(value)) return true;
  if (value.includes("*") || value.includes("?") || value.startsWith("~") || value.includes("..")) return true;
  if (/https?:\/\/[^/\s]+:[^@\s]+@/iu.test(value)) return true;
  if (/(token|password|secret|service[_-]?role|apikey|api[_-]?key|cookie|session|bankid|bearer)/iu.test(value)) return true;
  if (/^[0-9a-f]{7,40}$/iu.test(value) && !["--porcelain=v1"].includes(value)) return true;
  return false;
}

function classifyProcessFixtureResult(request: ProcessRequest, fixture: FakeDriverFixtureResult): ProcessResultClassification {
  if (fixture.mutationDetected) return "mutation_detected";
  if (fixture.secretDetected) return "secret_material_detected";
  if (fixture.promptDetected) return "interactive_prompt_detected";
  if (fixture.unexpectedChildDetected || fixture.containment.resultClassification === "unexpected_child_process") return "unexpected_child_process";
  if (fixture.outputOverflow) return "output_overflow";
  if (fixture.timeout) {
    return fixture.parentTerminated && fixture.directChildrenTerminated && fixture.processGroupTerminated && fixture.containment.complete && fixture.containment.authoritative
      ? "timed_out_terminated"
      : "timed_out_termination_unconfirmed";
  }
  if (fixture.lifecycleState === "completed" && fixture.exitCode === 0 && fixture.requestId === request.requestId && !fixture.stdoutTruncated && !fixture.stderrTruncated && fixture.containment.complete && fixture.containment.authoritative && fixture.containment.resultClassification === "contained") {
    return "completed_read_only";
  }
  if (fixture.lifecycleState === "failed" || (typeof fixture.exitCode === "number" && fixture.exitCode !== 0)) return "failed_read_only";
  return "ambiguous";
}

function validateExact(input: unknown, expected: unknown, prefix: string, fingerprintBuilder?: (input: unknown) => string, fingerprintKey?: string, algorithmKey?: string): ValidationResult {
  return result(validateExactReasons(input, expected, prefix, fingerprintBuilder, fingerprintKey, algorithmKey));
}

function validateExactReasons(input: unknown, expected: unknown, prefix: string, fingerprintBuilder?: (input: unknown) => string, fingerprintKey?: string, algorithmKey?: string): string[] {
  const reasons: string[] = [];
  if (!isRecord(input)) return [`${prefix}_not_object`];
  if (containsSensitiveMaterial(input)) reasons.push("secret_or_sensitive_material_present");
  const inputKeys = Object.keys(input).sort();
  const expectedKeys = isRecord(expected) ? Object.keys(expected).sort() : [];
  for (const key of inputKeys) if (!expectedKeys.includes(key)) reasons.push(`unknown_${prefix}_field:${key}`);
  for (const key of expectedKeys) if (!inputKeys.includes(key)) reasons.push(`missing_${prefix}_field:${key}`);
  if (fingerprintBuilder && fingerprintKey && algorithmKey) {
    if (input[algorithmKey] !== "sha256") reasons.push(`${prefix}_fingerprint_algorithm_invalid`);
    if (!isSha256(input[fingerprintKey])) reasons.push(`${prefix}_fingerprint_invalid`);
    const core = omitFingerprint(input, fingerprintKey, algorithmKey);
    if (isSha256(input[fingerprintKey]) && input[fingerprintKey] !== fingerprintBuilder(core)) reasons.push(`${prefix}_fingerprint_mismatch`);
  }
  if (stableStringify(input) !== stableStringify(expected)) reasons.push(`${prefix}_not_exact`);
  return [...new Set(reasons)].sort();
}

function result(reasons: readonly string[]): ValidationResult {
  const blockingReasons = [...new Set(reasons)].sort();
  return { valid: blockingReasons.length === 0, blockingReasons };
}

function invalid(reasons: readonly string[]): ValidationResult {
  return result(reasons);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function omitFingerprint(input: Record<string, unknown>, fingerprintKey: string, algorithmKey: string): Record<string, unknown> {
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  return core;
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/u.test(value);
}

function containsSensitiveMaterial(input: unknown): boolean {
  return collectStringValues(input).some((value) =>
    /(access[_ -]?token|refresh[_ -]?token|service[_ -]?role|anon[_ -]?key|api[_ -]?key|password\s*[=:]|connection[_ -]?string|postgres:\/\/|authorization header|bearer|cookie|session token|private[_ -]?key|client[_ -]?secret|keychain|raw[_ -]?environment|path dump|bankid|jwt|\/users\/|\\users\\)/iu.test(value),
  );
}

function isSensitiveFieldName(value: string): boolean {
  return /^(accessToken|refreshToken|serviceRoleKey|anonKey|apiKey|password|connectionString|authorizationHeader|bearerToken|cookie|sessionToken|privateKey|clientSecret|credentialPath|rawEnvironment|pathDump|bankId|jwt)$/u.test(value);
}

function isKnownPromptClassification(value: unknown): boolean {
  return value === null || [
    "login",
    "browser_auth",
    "device_code",
    "mfa",
    "password",
    "token",
    "confirmation",
    "project_link",
    "migration_confirmation",
    "credential_helper",
    "gui_launch",
    "url_opener",
    "interactive_selection",
    "press_enter",
  ].includes(String(value));
}

function collectStringValues(input: unknown): string[] {
  const values: string[] = [];
  const seen = new WeakSet<object>();
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      values.push(value);
      return;
    }
    if (value === null || typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    for (const item of Object.values(value as Record<string, unknown>)) visit(item);
  };
  visit(input);
  return values;
}

function stableStringify(input: unknown): string {
  const stack = new WeakSet<object>();
  const normalize = (value: unknown): unknown => {
    if (value === null || typeof value !== "object") return value;
    if (stack.has(value)) throw new Error("cyclic input is not supported");
    stack.add(value);
    if (Array.isArray(value)) {
      const normalizedArray = value.map(normalize);
      stack.delete(value);
      return normalizedArray;
    }
    const record = value as Record<string, unknown>;
    const normalizedRecord = Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalize(record[key])]));
    stack.delete(value);
    return normalizedRecord;
  };
  return JSON.stringify(normalize(input));
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
