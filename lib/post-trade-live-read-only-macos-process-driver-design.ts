import { createHash } from "node:crypto";

import {
  buildEnvironmentPolicy as buildExecutorEnvironmentPolicy,
  buildProcessExecutableRegistry,
  buildProcessLifecyclePolicy as buildExecutorLifecyclePolicy,
  buildProcessOperationRegistry,
  buildProcessOutputLimitRegistry as buildExecutorOutputLimitRegistry,
  buildProcessTimeoutRegistry as buildExecutorTimeoutRegistry,
  buildWorkingDirectoryPolicy as buildExecutorWorkingDirectoryPolicy,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTAINMENT_POLICY_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID,
  validateProcessExecutableRegistry,
  validateProcessExecutorAuthorizationCompatibility,
  validateProcessExecutorCliVersionCollectorCompatibility,
  validateProcessExecutorCredentialDesignCompatibility,
  validateProcessExecutorExecutionBoundaryCompatibility,
  validateProcessExecutorRunnerCompatibility,
  validateProcessOperationRegistry,
  type ProcessExecutableIdentity,
  type ProcessOperationIdentity,
} from "@/lib/post-trade-first-live-read-only-preflight-process-executor-core";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID =
  "reviewed_macos_read_only_preflight_process_driver_v1" as const;
export const POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_VERSION =
  "post_trade_live_read_only_macos_process_driver_design_v1" as const;
export const POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM = "macos" as const;
export const POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION =
  "post_trade_first_live_read_only_staging_preflight_boundary_session_001" as const;

export type ValidationResult = { valid: boolean; blockingReasons: readonly string[] };
export type SupportedArchitecture = "arm64" | "x64" | "universal";
export type ArchitectureTranslationClassification =
  | "native_arm64"
  | "native_x64"
  | "rosetta_reviewed"
  | "translation_unknown_blocked";
export type ExecutableCapabilityStatus =
  | "verified"
  | "blocked_ambiguous"
  | "blocked_changed_before_spawn"
  | "blocked_stale"
  | "blocked_future";
export type ContainmentClassification =
  | "containment_verified"
  | "containment_incomplete"
  | "containment_failed"
  | "unexpected_descendant"
  | "process_group_escape"
  | "detached_descendant"
  | "ambiguous";
export type TerminationClassification =
  | "not_required"
  | "graceful_termination_confirmed"
  | "forced_termination_confirmed"
  | "termination_unconfirmed"
  | "descendant_survived"
  | "process_group_escape_detected"
  | "observer_failed"
  | "observer_ambiguous"
  | "termination_ambiguous";
export type DriverLifecycleState =
  | "not_initialized"
  | "initialized"
  | "executable_resolving"
  | "executable_verified"
  | "spawn_preparing"
  | "process_starting"
  | "process_running"
  | "exit_observed"
  | "timeout_detected"
  | "termination_planning"
  | "graceful_termination_requested"
  | "graceful_wait"
  | "force_termination_requested"
  | "force_wait"
  | "containment_verifying"
  | "output_disposing"
  | "completed"
  | "failed"
  | "terminated"
  | "ambiguous"
  | "disposed";
export type DriverLifecycleTransition = `${DriverLifecycleState}->${DriverLifecycleState}`;
export type DriverResultClassification =
  | "completed_read_only"
  | "failed_read_only"
  | "blocked_before_spawn"
  | "timed_out_terminated"
  | "timed_out_unconfirmed"
  | "output_overflow"
  | "interactive_prompt_detected"
  | "secret_material_detected"
  | "unexpected_descendant"
  | "containment_failed"
  | "mutation_detected"
  | "ambiguous";

export type LiveMacosProcessDriverDesign = {
  designId: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID;
  designVersion: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_VERSION;
  platform: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM;
  genericCrossPlatformDriver: false;
  supportedArchitectures: readonly SupportedArchitecture[];
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  directSpawnOnly: true;
  shellDisabled: true;
  detached: false;
  stdinClosed: true;
  ttyDisabled: true;
  pseudoTtyDisabled: true;
  boundedOutputRequired: true;
  fixedTimeoutPoliciesRequired: true;
  processTreeObservationRequired: true;
  descendantTerminationVerificationRequired: true;
  automaticRetryAllowed: false;
  oneProcessAtATime: true;
  oneBoundarySession: true;
  globalProcessEnumerationAllowed: false;
  arbitraryExecutableAllowed: false;
  arbitraryArgumentsAllowed: false;
  arbitraryEnvironmentAllowed: false;
  deploymentCapability: false;
  noRunInDesign: true;
  sourceControlledDesignOnly: true;
  environmentSelectedDriverAllowed: false;
  callerSelectedDriverAllowed: false;
  automaticPlatformFallbackAllowed: false;
  liveExecutableVerificationClaim: false;
  liveFilesystemIdentityClaim: false;
  liveProcessStartedClaim: false;
  liveProcessObservedClaim: false;
  liveContainmentVerifiedClaim: false;
  liveTerminationVerifiedClaim: false;
  liveCleanupVerifiedClaim: false;
  commandBehaviorProvenReadOnlyClaim: false;
  designFingerprintAlgorithm: "sha256";
  designFingerprint: string;
};

export type ArchitectureCompatibilityPolicy = {
  architecturePolicyId: "post_trade_macos_architecture_compatibility_policy_v1";
  platform: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM;
  supportedHostArchitectures: readonly ["arm64", "x64"];
  supportedExecutableArchitectures: readonly ["arm64", "x64", "universal"];
  hostArchitectureEvidenceRequired: true;
  executableArchitectureEvidenceRequired: true;
  translationClassificationRequired: true;
  rosettaTranslatedExecutionRequiresReview: true;
  unknownArchitectureAllowed: false;
  unknownTranslationAllowed: false;
  genericArchitectureAllowed: false;
  architectureFallbackAllowed: false;
  architectureFingerprintAlgorithm: "sha256";
  architectureFingerprint: string;
};

export type ExecutableResolverPolicy = {
  resolverPolicyId: "post_trade_macos_exact_executable_resolver_policy_v1";
  designId: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID;
  executableIdentities: readonly ProcessExecutableIdentity[];
  callerSelectedPathAllowed: false;
  inheritedPathOnlyAllowed: false;
  shellAliasAllowed: false;
  shellFunctionAllowed: false;
  wrapperAllowed: false;
  scriptProxyAllowed: false;
  unreviewedSymlinkAllowed: false;
  multipleMatchesAllowed: false;
  worldWritableExecutableAllowed: false;
  worldWritableDirectoryAllowed: false;
  productionWrapperAllowed: false;
  expectedOwnershipRequired: true;
  expectedFileTypeRequired: true;
  expectedArchitectureRequired: true;
  provenanceClassificationRequired: true;
  codeSigningClassificationRequiredWhereFeasible: true;
  publicAbsolutePathAllowed: false;
  deviceInodePublicEvidenceAllowed: false;
  exactResolverVersion: "macos_exact_resolver_contract_v1";
  shortValidityRequired: true;
  recheckImmediatelyBeforeSpawn: true;
  noFallbackAfterSelection: true;
  shellLookupAllowed: false;
  whichLookupAllowed: false;
  commandVLookupAllowed: false;
  packageManagerShimAllowedWithoutReview: false;
  resolverFingerprintAlgorithm: "sha256";
  resolverFingerprint: string;
};

export type ExecutableCapabilityEvidence = {
  capabilityId: string;
  executableIdentity: ProcessExecutableIdentity;
  expectedBasename: "git" | "supabase";
  platform: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM;
  architectureSupport: SupportedArchitecture;
  resolverVersion: "macos_exact_resolver_contract_v1";
  status: ExecutableCapabilityStatus;
  observedAtIso: "2026-07-16T10:00:00.000Z";
  expiresAtIso: "2026-07-16T10:00:05.000Z";
  publicAbsolutePathAbsent: true;
  publicDeviceInodeAbsent: true;
  personalPathAbsent: true;
  regularExecutable: true;
  shellFunction: false;
  shellAlias: false;
  wrapperScript: false;
  scriptProxy: false;
  unreviewedSymlink: false;
  multipleMatches: false;
  callerSelectedPath: false;
  worldWritableExecutable: false;
  worldWritableDirectory: false;
  productionWrapper: false;
  ownershipClassification: "expected_owner";
  fileTypeClassification: "regular_executable";
  codeSigningClassification: "reviewed_or_not_applicable";
  provenanceClassification: "reviewed_installation_identity";
  hostArchitectureEvidenceRequired: true;
  executableArchitectureEvidenceRequired: true;
  translationClassification: ArchitectureTranslationClassification;
  translationUnknown: false;
  sizeChangedBeforeSpawn: false;
  mtimeChangedBeforeSpawn: false;
  symlinkTargetChangedBeforeSpawn: false;
  containingDirectoryChangedBeforeSpawn: false;
  executableChangedBeforeSpawn: false;
  pathChangedAfterVerification: false;
  replacedAfterVerification: false;
  stablePrivateFileIdentityHeld: true;
  privateDigestAvailable: boolean;
  reusableAcrossSessions: false;
  reusableAcrossOperations: false;
  clonedCapability: false;
  sanitizedExecutableFingerprintAlgorithm: "sha256";
  sanitizedExecutableFingerprint: string;
};

export type TocTouRevalidationPolicy = {
  toctouPolicyId: "post_trade_macos_toctou_revalidation_policy_v1";
  stableFileIdentityRecheckRequired: true;
  sizeRecheckRequired: true;
  modificationStateRecheckRequired: true;
  ownershipRecheckRequired: true;
  fileTypeRecheckRequired: true;
  architectureRecheckRequired: true;
  optionalDigestRecheckWhenAvailable: true;
  sameBoundarySessionRequired: true;
  sameDriverInstanceRequired: true;
  cwdIdentityRecheckRequired: true;
  operationRegistryRecheckRequired: true;
  processPolicyRecheckRequired: true;
  completeEliminationClaimed: false;
  raceStillPossible: true;
  toctouFingerprintAlgorithm: "sha256";
  toctouFingerprint: string;
};

export type WorkingDirectoryCapability = {
  capabilityId: "post_trade_macos_reviewed_repository_cwd_capability_v1";
  workdirIdentity: "ture_trade_repository_root";
  boundarySession: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION;
  expectedRepositoryIdentity: "reviewed_repository_root_identity_v1";
  verifiedRepositoryRoot: true;
  symlinkRoot: false;
  nestedUnrelatedRepository: false;
  productionCheckout: false;
  callerSelectedPath: false;
  publicAbsolutePathAbsent: true;
  personalPathAbsent: true;
  observedAtIso: "2026-07-16T10:00:00.000Z";
  expiresAtIso: "2026-07-16T10:00:05.000Z";
  reusableAcrossSessions: false;
  repositoryIdentityChanged: false;
  cwdFingerprintAlgorithm: "sha256";
  cwdFingerprint: string;
};

export type SpawnPolicy = {
  spawnPolicyId: "post_trade_macos_direct_spawn_policy_v1";
  directExecutableRequired: true;
  argumentArrayRequired: true;
  shellFalseRequired: true;
  detachedFalseRequired: true;
  stdinIgnoredOrClosedRequired: true;
  stdoutPipeRequired: true;
  stderrPipeRequired: true;
  inheritedStdioAllowed: false;
  commandStringAllowed: false;
  shellCommandAllowed: false;
  commandConcatenationAllowed: false;
  pipesRedirectionAllowed: false;
  commandSubstitutionAllowed: false;
  shellExpansionAllowed: false;
  interactiveTerminalAllowed: false;
  backgroundLaunchAllowed: false;
  guiLaunchAllowed: false;
  arbitraryCwdAllowed: false;
  arbitraryEnvironmentAllowed: false;
  genericSpawnOptionsObjectAllowed: false;
  multipleOperationsAllowed: false;
  multipleExecutableCapabilitiesAllowed: false;
  callerSuppliedPidAllowed: false;
  spawnFingerprintAlgorithm: "sha256";
  spawnFingerprint: string;
};

export type EnvironmentConstructionPolicy = {
  environmentPolicyId: "post_trade_macos_minimal_non_secret_environment_policy_v1";
  startsFromEmptyEnvironment: true;
  fixedNonSecretEntries: readonly ["LC_ALL=C.UTF-8", "LANG=C.UTF-8", "NO_COLOR=1", "PAGER=", "EDITOR=", "GIT_TERMINAL_PROMPT=0", "SUPABASE_NON_INTERACTIVE=1"];
  inheritedEnvironmentAllowed: false;
  pathDumpAllowed: false;
  homeAllowed: false;
  userAllowed: false;
  shellConfigAllowed: false;
  arbitraryGitConfigAllowed: false;
  arbitrarySupabaseConfigAllowed: false;
  secretValuesPubliclyRepresentable: false;
  credentialHandoffPubliclyRepresentable: false;
  credentialVariableNamePubliclySelected: false;
  cleanupRequiredAfterEveryOutcome: true;
  environmentFingerprintAlgorithm: "sha256";
  environmentFingerprint: string;
};

export type CredentialCapabilityPolicy = {
  credentialPolicyId: "post_trade_macos_opaque_credential_capability_policy_v1";
  opaqueCapabilityOnly: true;
  credentialRequiredOperations: readonly ProcessOperationIdentity[];
  oneOperationOnly: true;
  reuseAllowed: false;
  publicSecretSlotValueAllowed: false;
  publicEnvironmentVariableNameAllowed: false;
  cleanupRequiredAfterSuccess: true;
  cleanupRequiredAfterFailure: true;
  cleanupRequiredAfterTimeout: true;
  cleanupRequiredAfterPrompt: true;
  cleanupRequiredAfterSecretDetection: true;
  cleanupRequiredAfterOverflow: true;
  cleanupRequiredAfterContainmentFailure: true;
  cleanupRequiredAfterObserverAmbiguity: true;
  cleanupRequiredAfterTerminationAmbiguity: true;
  cleanupAmbiguityBlocksResult: true;
  exportAllowed: false;
  serializationAllowed: false;
  loggingAllowed: false;
  commandArgumentAllowed: false;
  stdinAllowed: false;
  configFileAllowed: false;
  credentialFingerprintAlgorithm: "sha256";
  credentialFingerprint: string;
};

export type OutputCapturePolicy = {
  outputPolicyId: "post_trade_macos_bounded_transient_output_policy_v1";
  stdoutLimitBytesGit: 16_384;
  stdoutLimitBytesSupabase: 32_768;
  stderrLimitBytes: 8_192;
  callerMayRaiseLimits: false;
  separateStdoutStderrBuffers: true;
  byteCountBeforeParserAuthority: true;
  overflowBlocksAuthority: true;
  truncationBlocksAuthority: true;
  rawOutputLoggingAllowed: false;
  inheritedOutputAllowed: false;
  fileOutputAllowed: false;
  persistentBufferAllowed: false;
  promptDetectionBeforeParser: true;
  secretDetectionBeforeParser: true;
  byteLevelSecretScanBeforeDecode: true;
  rawBufferDisposalRequired: true;
  minimalCopiesRequired: true;
  mutableBufferOverwriteWherePractical: true;
  referencesDroppedAfterClassification: true;
  snapshottingAllowed: false;
  rawOutputInExceptionAllowed: false;
  zeroizationGuaranteed: false;
  outputFingerprintAlgorithm: "sha256";
  outputFingerprint: string;
};

export type OutputDecoderPolicy = {
  decoderPolicyId: "post_trade_macos_strict_output_decoder_policy_v1";
  utf8Only: true;
  invalidEncodingClassification: "blocked_invalid_encoding";
  nulRejected: true;
  controlCharactersRejected: true;
  unicodeSeparatorsRejected: true;
  ansiRejected: true;
  promptAndBannerDetectionRequired: true;
  lineCountEnforced: true;
  parserHandoffRequiresCleanClassification: true;
  byteLevelPreDecodeScreeningRequired: true;
  perfectDetectionClaimed: false;
  decoderFingerprintAlgorithm: "sha256";
  decoderFingerprint: string;
};

export type ProcessInstanceMetadataPolicy = {
  instancePolicyId: "post_trade_macos_private_process_instance_metadata_policy_v1";
  privatePidAllowed: true;
  privateProcessGroupIdAllowed: true;
  publicPidAllowed: false;
  publicProcessGroupIdAllowed: false;
  publicProcessHandleAllowed: false;
  globalRegistryAllowed: false;
  moduleGlobalCacheAllowed: false;
  reusableProcessInstanceAllowed: false;
  secondOperationAllowed: false;
  crossSessionUseAllowed: false;
  overlappingLeaseAllowed: false;
  overlappingObserverAllowed: false;
  secondProcessBeforeOutputDisposalAllowed: false;
  secondProcessBeforeCredentialCleanupAllowed: false;
  instanceFingerprintAlgorithm: "sha256";
  instanceFingerprint: string;
};

export type ProcessObserverPolicy = {
  observerPolicyId: "post_trade_macos_scoped_process_tree_observer_policy_v1";
  scopedToKnownProcessInstance: true;
  scopedToKnownProcessGroup: true;
  unrestrictedGlobalProcessListingAllowed: false;
  parentStateRequired: true;
  directChildStateRequired: true;
  descendantStateRequired: true;
  processGroupStateRequired: true;
  detachedDescendantDetectionRequired: true;
  processGroupEscapeDetectionRequired: true;
  browserChildDetectionRequired: true;
  guiChildDetectionRequired: true;
  urlOpenerDetectionRequired: true;
  credentialHelperDetectionRequired: true;
  daemonDetectionRequired: true;
  unknownChildDetectionRequired: true;
  helperProcessRequiresSeparateReview: true;
  genericContainmentBooleanAllowed: false;
  genericTerminationBooleanAllowed: false;
  arbitraryPidQueryAllowed: false;
  signalCapabilityAllowed: false;
  rawCommandLineOutputAllowed: false;
  environmentOutputAllowed: false;
  personalPathOutputAllowed: false;
  expectedChildrenAllowedForFirstRun: false;
  observerFingerprintAlgorithm: "sha256";
  observerFingerprint: string;
};

export type TimeoutMonitoringPolicy = {
  timeoutPolicyId: "post_trade_macos_monotonic_timeout_policy_v1";
  monotonicTimeRequired: true;
  wallClockOnlyAllowed: false;
  gitOperationTimeoutMs: 5_000;
  supabaseOperationTimeoutMs: 15_000;
  gracefulTerminationMs: 750;
  forceTerminationMs: 750;
  containmentVerificationDeadlineMs: 500;
  callerOverrideAllowed: false;
  sessionInvalidatedAtTimeout: true;
  retryAllowed: false;
  timeoutFingerprintAlgorithm: "sha256";
  timeoutFingerprint: string;
};

export type TerminationPolicy = {
  terminationPolicyId: "post_trade_macos_termination_policy_v1";
  knownProcessOrGroupTargetRequired: true;
  arbitraryPidSignalAllowed: false;
  unrestrictedSignalApiAllowed: false;
  gracefulSignalClassification: "reviewed_graceful_signal";
  forcedSignalClassification: "reviewed_forced_signal";
  sessionInvalidatedBeforeSignal: true;
  stopFutureOperationsBeforeSignal: true;
  gracefulWaitBounded: true;
  forceWaitBounded: true;
  containmentObservationAfterGraceful: true;
  containmentObservationAfterForce: true;
  parentOnlyExitSufficient: false;
  signalDeliverySuccessSufficient: false;
  processGroupExitAloneSufficientWhenEscapeUnknown: false;
  forceKillClaimsDetachedCertainty: false;
  cleanupAfterFinalClassification: true;
  operationRetryAllowed: false;
  terminationFingerprintAlgorithm: "sha256";
  terminationFingerprint: string;
};

export type DriverLifecyclePolicy = {
  lifecyclePolicyId: "post_trade_macos_process_driver_lifecycle_policy_v1";
  allowedTransitions: readonly DriverLifecycleTransition[];
  terminalStates: readonly DriverLifecycleState[];
  secondStartAllowed: false;
  disposedReuseAllowed: false;
  failedRetryAllowed: false;
  ambiguousRetryAllowed: false;
  cleanupAmbiguityToCompletedAllowed: false;
  lifecycleFingerprintAlgorithm: "sha256";
  lifecycleFingerprint: string;
};

export type SanitizedDriverResult = {
  driverResultId: string;
  driverIdentity: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID;
  processRequestId: string;
  operationId: ProcessOperationIdentity;
  opaqueProcessInstanceId: string;
  boundarySession: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION;
  executableIdentityFingerprint: string;
  workdirIdentity: "ture_trade_repository_root";
  environmentPolicyIdentity: EnvironmentConstructionPolicy["environmentPolicyId"];
  credentialHandoffUsed: boolean;
  lifecycleTerminalState: "completed" | "failed" | "terminated" | "ambiguous";
  startedAtIso: "2026-07-16T10:00:00.000Z";
  endedAtIso: "2026-07-16T10:00:30.000Z";
  exitClassification: "zero" | "nonzero" | "none";
  signalClassification: "none" | "reviewed_graceful_signal" | "reviewed_forced_signal" | "unknown";
  timeout: boolean;
  gracefulTerminationRequested: boolean;
  forceTerminationRequested: boolean;
  containmentClassification: ContainmentClassification;
  terminationClassification: TerminationClassification;
  childClassification: "none" | "expected_reviewed" | "unexpected" | "unknown";
  promptDetected: boolean;
  secretDetected: boolean;
  mutationDetected: boolean;
  stdoutByteCount: number;
  stderrByteCount: number;
  stdoutFingerprint: string;
  stderrFingerprint: string;
  overflow: boolean;
  truncation: boolean;
  outputDisposed: boolean;
  credentialCleanupConfirmed: boolean | "not_required";
  resultClassification: DriverResultClassification;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
};

export type CompatibilitySummary = {
  compatibilityId: "post_trade_macos_driver_design_action_519_520_compatibility_v1";
  processExecutorId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID;
  executableRegistryId: "post_trade_first_live_read_only_staging_preflight_process_executable_registry_v1";
  operationRegistryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID;
  containmentPolicyId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTAINMENT_POLICY_ID;
  preservesNoShell: true;
  preservesNoTty: true;
  preservesClosedStdin: true;
  preservesDetachedFalse: true;
  preservesOneProcessAtATime: true;
  preservesOneRunnerInvocation: true;
  preservesOneCollectionSession: true;
  preservesNoRetry: true;
  preservesStagingOnly: true;
  deploymentCount: 0;
  sqlMutationCount: 0;
  dataMutationCount: 0;
  compatibilityFingerprintAlgorithm: "sha256";
  compatibilityFingerprint: string;
};

export function buildLiveMacosProcessDriverDesign(): LiveMacosProcessDriverDesign {
  const core = {
    designId: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID,
    designVersion: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_VERSION,
    platform: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM,
    genericCrossPlatformDriver: false,
    supportedArchitectures: ["arm64", "x64", "universal"],
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    directSpawnOnly: true,
    shellDisabled: true,
    detached: false,
    stdinClosed: true,
    ttyDisabled: true,
    pseudoTtyDisabled: true,
    boundedOutputRequired: true,
    fixedTimeoutPoliciesRequired: true,
    processTreeObservationRequired: true,
    descendantTerminationVerificationRequired: true,
    automaticRetryAllowed: false,
    oneProcessAtATime: true,
    oneBoundarySession: true,
    globalProcessEnumerationAllowed: false,
    arbitraryExecutableAllowed: false,
    arbitraryArgumentsAllowed: false,
    arbitraryEnvironmentAllowed: false,
    deploymentCapability: false,
    noRunInDesign: true,
    sourceControlledDesignOnly: true,
    environmentSelectedDriverAllowed: false,
    callerSelectedDriverAllowed: false,
    automaticPlatformFallbackAllowed: false,
    liveExecutableVerificationClaim: false,
    liveFilesystemIdentityClaim: false,
    liveProcessStartedClaim: false,
    liveProcessObservedClaim: false,
    liveContainmentVerifiedClaim: false,
    liveTerminationVerifiedClaim: false,
    liveCleanupVerifiedClaim: false,
    commandBehaviorProvenReadOnlyClaim: false,
  } satisfies Omit<LiveMacosProcessDriverDesign, "designFingerprintAlgorithm" | "designFingerprint">;
  return { ...core, designFingerprintAlgorithm: "sha256", designFingerprint: fingerprint(core) };
}

export function buildArchitectureCompatibilityPolicy(): ArchitectureCompatibilityPolicy {
  const core = {
    architecturePolicyId: "post_trade_macos_architecture_compatibility_policy_v1",
    platform: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM,
    supportedHostArchitectures: ["arm64", "x64"],
    supportedExecutableArchitectures: ["arm64", "x64", "universal"],
    hostArchitectureEvidenceRequired: true,
    executableArchitectureEvidenceRequired: true,
    translationClassificationRequired: true,
    rosettaTranslatedExecutionRequiresReview: true,
    unknownArchitectureAllowed: false,
    unknownTranslationAllowed: false,
    genericArchitectureAllowed: false,
    architectureFallbackAllowed: false,
  } satisfies Omit<ArchitectureCompatibilityPolicy, "architectureFingerprintAlgorithm" | "architectureFingerprint">;
  return { ...core, architectureFingerprintAlgorithm: "sha256", architectureFingerprint: fingerprint(core) };
}

export function buildExecutableResolverPolicy(): ExecutableResolverPolicy {
  const core = {
    resolverPolicyId: "post_trade_macos_exact_executable_resolver_policy_v1",
    designId: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID,
    executableIdentities: ["git_cli", "supabase_cli"],
    callerSelectedPathAllowed: false,
    inheritedPathOnlyAllowed: false,
    shellAliasAllowed: false,
    shellFunctionAllowed: false,
    wrapperAllowed: false,
    scriptProxyAllowed: false,
    unreviewedSymlinkAllowed: false,
    multipleMatchesAllowed: false,
    worldWritableExecutableAllowed: false,
    worldWritableDirectoryAllowed: false,
    productionWrapperAllowed: false,
    expectedOwnershipRequired: true,
    expectedFileTypeRequired: true,
    expectedArchitectureRequired: true,
    provenanceClassificationRequired: true,
    codeSigningClassificationRequiredWhereFeasible: true,
    publicAbsolutePathAllowed: false,
    deviceInodePublicEvidenceAllowed: false,
    exactResolverVersion: "macos_exact_resolver_contract_v1",
    shortValidityRequired: true,
    recheckImmediatelyBeforeSpawn: true,
    noFallbackAfterSelection: true,
    shellLookupAllowed: false,
    whichLookupAllowed: false,
    commandVLookupAllowed: false,
    packageManagerShimAllowedWithoutReview: false,
  } satisfies Omit<ExecutableResolverPolicy, "resolverFingerprintAlgorithm" | "resolverFingerprint">;
  return { ...core, resolverFingerprintAlgorithm: "sha256", resolverFingerprint: fingerprint(core) };
}

export function buildExecutableCapabilityEvidence(
  executableIdentity: ProcessExecutableIdentity,
  patch: Partial<Omit<ExecutableCapabilityEvidence, "sanitizedExecutableFingerprintAlgorithm" | "sanitizedExecutableFingerprint">> = {},
): ExecutableCapabilityEvidence {
  const core = {
    capabilityId: `post_trade_macos_${executableIdentity}_capability_001`,
    executableIdentity,
    expectedBasename: executableIdentity === "git_cli" ? "git" : "supabase",
    platform: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM,
    architectureSupport: "universal",
    resolverVersion: "macos_exact_resolver_contract_v1",
    status: "verified",
    observedAtIso: "2026-07-16T10:00:00.000Z",
    expiresAtIso: "2026-07-16T10:00:05.000Z",
    publicAbsolutePathAbsent: true,
    publicDeviceInodeAbsent: true,
    personalPathAbsent: true,
    regularExecutable: true,
    shellFunction: false,
    shellAlias: false,
    wrapperScript: false,
    scriptProxy: false,
    unreviewedSymlink: false,
    multipleMatches: false,
    callerSelectedPath: false,
    worldWritableExecutable: false,
    worldWritableDirectory: false,
    productionWrapper: false,
    ownershipClassification: "expected_owner",
    fileTypeClassification: "regular_executable",
    codeSigningClassification: "reviewed_or_not_applicable",
    provenanceClassification: "reviewed_installation_identity",
    hostArchitectureEvidenceRequired: true,
    executableArchitectureEvidenceRequired: true,
    translationClassification: "native_arm64",
    translationUnknown: false,
    sizeChangedBeforeSpawn: false,
    mtimeChangedBeforeSpawn: false,
    symlinkTargetChangedBeforeSpawn: false,
    containingDirectoryChangedBeforeSpawn: false,
    executableChangedBeforeSpawn: false,
    pathChangedAfterVerification: false,
    replacedAfterVerification: false,
    stablePrivateFileIdentityHeld: true,
    privateDigestAvailable: false,
    reusableAcrossSessions: false,
    reusableAcrossOperations: false,
    clonedCapability: false,
    ...patch,
  } satisfies Omit<ExecutableCapabilityEvidence, "sanitizedExecutableFingerprintAlgorithm" | "sanitizedExecutableFingerprint">;
  return { ...core, sanitizedExecutableFingerprintAlgorithm: "sha256", sanitizedExecutableFingerprint: fingerprint(core) };
}

export function buildTocTouRevalidationPolicy(): TocTouRevalidationPolicy {
  const core = {
    toctouPolicyId: "post_trade_macos_toctou_revalidation_policy_v1",
    stableFileIdentityRecheckRequired: true,
    sizeRecheckRequired: true,
    modificationStateRecheckRequired: true,
    ownershipRecheckRequired: true,
    fileTypeRecheckRequired: true,
    architectureRecheckRequired: true,
    optionalDigestRecheckWhenAvailable: true,
    sameBoundarySessionRequired: true,
    sameDriverInstanceRequired: true,
    cwdIdentityRecheckRequired: true,
    operationRegistryRecheckRequired: true,
    processPolicyRecheckRequired: true,
    completeEliminationClaimed: false,
    raceStillPossible: true,
  } satisfies Omit<TocTouRevalidationPolicy, "toctouFingerprintAlgorithm" | "toctouFingerprint">;
  return { ...core, toctouFingerprintAlgorithm: "sha256", toctouFingerprint: fingerprint(core) };
}

export function buildWorkingDirectoryCapability(patch: Partial<Omit<WorkingDirectoryCapability, "cwdFingerprintAlgorithm" | "cwdFingerprint">> = {}): WorkingDirectoryCapability {
  const core = {
    capabilityId: "post_trade_macos_reviewed_repository_cwd_capability_v1",
    workdirIdentity: "ture_trade_repository_root",
    boundarySession: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    expectedRepositoryIdentity: "reviewed_repository_root_identity_v1",
    verifiedRepositoryRoot: true,
    symlinkRoot: false,
    nestedUnrelatedRepository: false,
    productionCheckout: false,
    callerSelectedPath: false,
    publicAbsolutePathAbsent: true,
    personalPathAbsent: true,
    observedAtIso: "2026-07-16T10:00:00.000Z",
    expiresAtIso: "2026-07-16T10:00:05.000Z",
    reusableAcrossSessions: false,
    repositoryIdentityChanged: false,
    ...patch,
  } satisfies Omit<WorkingDirectoryCapability, "cwdFingerprintAlgorithm" | "cwdFingerprint">;
  return { ...core, cwdFingerprintAlgorithm: "sha256", cwdFingerprint: fingerprint(core) };
}

export function buildSpawnPolicy(): SpawnPolicy {
  const core = {
    spawnPolicyId: "post_trade_macos_direct_spawn_policy_v1",
    directExecutableRequired: true,
    argumentArrayRequired: true,
    shellFalseRequired: true,
    detachedFalseRequired: true,
    stdinIgnoredOrClosedRequired: true,
    stdoutPipeRequired: true,
    stderrPipeRequired: true,
    inheritedStdioAllowed: false,
    commandStringAllowed: false,
    shellCommandAllowed: false,
    commandConcatenationAllowed: false,
    pipesRedirectionAllowed: false,
    commandSubstitutionAllowed: false,
    shellExpansionAllowed: false,
    interactiveTerminalAllowed: false,
    backgroundLaunchAllowed: false,
    guiLaunchAllowed: false,
    arbitraryCwdAllowed: false,
    arbitraryEnvironmentAllowed: false,
    genericSpawnOptionsObjectAllowed: false,
    multipleOperationsAllowed: false,
    multipleExecutableCapabilitiesAllowed: false,
    callerSuppliedPidAllowed: false,
  } satisfies Omit<SpawnPolicy, "spawnFingerprintAlgorithm" | "spawnFingerprint">;
  return { ...core, spawnFingerprintAlgorithm: "sha256", spawnFingerprint: fingerprint(core) };
}

export function buildEnvironmentConstructionPolicy(): EnvironmentConstructionPolicy {
  const core = {
    environmentPolicyId: "post_trade_macos_minimal_non_secret_environment_policy_v1",
    startsFromEmptyEnvironment: true,
    fixedNonSecretEntries: ["LC_ALL=C.UTF-8", "LANG=C.UTF-8", "NO_COLOR=1", "PAGER=", "EDITOR=", "GIT_TERMINAL_PROMPT=0", "SUPABASE_NON_INTERACTIVE=1"],
    inheritedEnvironmentAllowed: false,
    pathDumpAllowed: false,
    homeAllowed: false,
    userAllowed: false,
    shellConfigAllowed: false,
    arbitraryGitConfigAllowed: false,
    arbitrarySupabaseConfigAllowed: false,
    secretValuesPubliclyRepresentable: false,
    credentialHandoffPubliclyRepresentable: false,
    credentialVariableNamePubliclySelected: false,
    cleanupRequiredAfterEveryOutcome: true,
  } satisfies Omit<EnvironmentConstructionPolicy, "environmentFingerprintAlgorithm" | "environmentFingerprint">;
  return { ...core, environmentFingerprintAlgorithm: "sha256", environmentFingerprint: fingerprint(core) };
}

export function buildCredentialCapabilityPolicy(): CredentialCapabilityPolicy {
  const credentialRequiredOperations = buildProcessOperationRegistry().operations
    .filter((operation) => operation.credentialRequirement !== "none")
    .map((operation) => operation.operationId);
  const core = {
    credentialPolicyId: "post_trade_macos_opaque_credential_capability_policy_v1",
    opaqueCapabilityOnly: true,
    credentialRequiredOperations,
    oneOperationOnly: true,
    reuseAllowed: false,
    publicSecretSlotValueAllowed: false,
    publicEnvironmentVariableNameAllowed: false,
    cleanupRequiredAfterSuccess: true,
    cleanupRequiredAfterFailure: true,
    cleanupRequiredAfterTimeout: true,
    cleanupRequiredAfterPrompt: true,
    cleanupRequiredAfterSecretDetection: true,
    cleanupRequiredAfterOverflow: true,
    cleanupRequiredAfterContainmentFailure: true,
    cleanupRequiredAfterObserverAmbiguity: true,
    cleanupRequiredAfterTerminationAmbiguity: true,
    cleanupAmbiguityBlocksResult: true,
    exportAllowed: false,
    serializationAllowed: false,
    loggingAllowed: false,
    commandArgumentAllowed: false,
    stdinAllowed: false,
    configFileAllowed: false,
  } satisfies Omit<CredentialCapabilityPolicy, "credentialFingerprintAlgorithm" | "credentialFingerprint">;
  return { ...core, credentialFingerprintAlgorithm: "sha256", credentialFingerprint: fingerprint(core) };
}

export function buildOutputCapturePolicy(): OutputCapturePolicy {
  const core = {
    outputPolicyId: "post_trade_macos_bounded_transient_output_policy_v1",
    stdoutLimitBytesGit: 16_384,
    stdoutLimitBytesSupabase: 32_768,
    stderrLimitBytes: 8_192,
    callerMayRaiseLimits: false,
    separateStdoutStderrBuffers: true,
    byteCountBeforeParserAuthority: true,
    overflowBlocksAuthority: true,
    truncationBlocksAuthority: true,
    rawOutputLoggingAllowed: false,
    inheritedOutputAllowed: false,
    fileOutputAllowed: false,
    persistentBufferAllowed: false,
    promptDetectionBeforeParser: true,
    secretDetectionBeforeParser: true,
    byteLevelSecretScanBeforeDecode: true,
    rawBufferDisposalRequired: true,
    minimalCopiesRequired: true,
    mutableBufferOverwriteWherePractical: true,
    referencesDroppedAfterClassification: true,
    snapshottingAllowed: false,
    rawOutputInExceptionAllowed: false,
    zeroizationGuaranteed: false,
  } satisfies Omit<OutputCapturePolicy, "outputFingerprintAlgorithm" | "outputFingerprint">;
  return { ...core, outputFingerprintAlgorithm: "sha256", outputFingerprint: fingerprint(core) };
}

export function buildOutputDecoderPolicy(): OutputDecoderPolicy {
  const core = {
    decoderPolicyId: "post_trade_macos_strict_output_decoder_policy_v1",
    utf8Only: true,
    invalidEncodingClassification: "blocked_invalid_encoding",
    nulRejected: true,
    controlCharactersRejected: true,
    unicodeSeparatorsRejected: true,
    ansiRejected: true,
    promptAndBannerDetectionRequired: true,
    lineCountEnforced: true,
    parserHandoffRequiresCleanClassification: true,
    byteLevelPreDecodeScreeningRequired: true,
    perfectDetectionClaimed: false,
  } satisfies Omit<OutputDecoderPolicy, "decoderFingerprintAlgorithm" | "decoderFingerprint">;
  return { ...core, decoderFingerprintAlgorithm: "sha256", decoderFingerprint: fingerprint(core) };
}

export function buildProcessInstanceMetadataPolicy(): ProcessInstanceMetadataPolicy {
  const core = {
    instancePolicyId: "post_trade_macos_private_process_instance_metadata_policy_v1",
    privatePidAllowed: true,
    privateProcessGroupIdAllowed: true,
    publicPidAllowed: false,
    publicProcessGroupIdAllowed: false,
    publicProcessHandleAllowed: false,
    globalRegistryAllowed: false,
    moduleGlobalCacheAllowed: false,
    reusableProcessInstanceAllowed: false,
    secondOperationAllowed: false,
    crossSessionUseAllowed: false,
    overlappingLeaseAllowed: false,
    overlappingObserverAllowed: false,
    secondProcessBeforeOutputDisposalAllowed: false,
    secondProcessBeforeCredentialCleanupAllowed: false,
  } satisfies Omit<ProcessInstanceMetadataPolicy, "instanceFingerprintAlgorithm" | "instanceFingerprint">;
  return { ...core, instanceFingerprintAlgorithm: "sha256", instanceFingerprint: fingerprint(core) };
}

export function buildProcessObserverPolicy(): ProcessObserverPolicy {
  const core = {
    observerPolicyId: "post_trade_macos_scoped_process_tree_observer_policy_v1",
    scopedToKnownProcessInstance: true,
    scopedToKnownProcessGroup: true,
    unrestrictedGlobalProcessListingAllowed: false,
    parentStateRequired: true,
    directChildStateRequired: true,
    descendantStateRequired: true,
    processGroupStateRequired: true,
    detachedDescendantDetectionRequired: true,
    processGroupEscapeDetectionRequired: true,
    browserChildDetectionRequired: true,
    guiChildDetectionRequired: true,
    urlOpenerDetectionRequired: true,
    credentialHelperDetectionRequired: true,
    daemonDetectionRequired: true,
    unknownChildDetectionRequired: true,
    helperProcessRequiresSeparateReview: true,
    genericContainmentBooleanAllowed: false,
    genericTerminationBooleanAllowed: false,
    arbitraryPidQueryAllowed: false,
    signalCapabilityAllowed: false,
    rawCommandLineOutputAllowed: false,
    environmentOutputAllowed: false,
    personalPathOutputAllowed: false,
    expectedChildrenAllowedForFirstRun: false,
  } satisfies Omit<ProcessObserverPolicy, "observerFingerprintAlgorithm" | "observerFingerprint">;
  return { ...core, observerFingerprintAlgorithm: "sha256", observerFingerprint: fingerprint(core) };
}

export function buildTimeoutMonitoringPolicy(): TimeoutMonitoringPolicy {
  const core = {
    timeoutPolicyId: "post_trade_macos_monotonic_timeout_policy_v1",
    monotonicTimeRequired: true,
    wallClockOnlyAllowed: false,
    gitOperationTimeoutMs: 5_000,
    supabaseOperationTimeoutMs: 15_000,
    gracefulTerminationMs: 750,
    forceTerminationMs: 750,
    containmentVerificationDeadlineMs: 500,
    callerOverrideAllowed: false,
    sessionInvalidatedAtTimeout: true,
    retryAllowed: false,
  } satisfies Omit<TimeoutMonitoringPolicy, "timeoutFingerprintAlgorithm" | "timeoutFingerprint">;
  return { ...core, timeoutFingerprintAlgorithm: "sha256", timeoutFingerprint: fingerprint(core) };
}

export function buildTerminationPolicy(): TerminationPolicy {
  const core = {
    terminationPolicyId: "post_trade_macos_termination_policy_v1",
    knownProcessOrGroupTargetRequired: true,
    arbitraryPidSignalAllowed: false,
    unrestrictedSignalApiAllowed: false,
    gracefulSignalClassification: "reviewed_graceful_signal",
    forcedSignalClassification: "reviewed_forced_signal",
    sessionInvalidatedBeforeSignal: true,
    stopFutureOperationsBeforeSignal: true,
    gracefulWaitBounded: true,
    forceWaitBounded: true,
    containmentObservationAfterGraceful: true,
    containmentObservationAfterForce: true,
    parentOnlyExitSufficient: false,
    signalDeliverySuccessSufficient: false,
    processGroupExitAloneSufficientWhenEscapeUnknown: false,
    forceKillClaimsDetachedCertainty: false,
    cleanupAfterFinalClassification: true,
    operationRetryAllowed: false,
  } satisfies Omit<TerminationPolicy, "terminationFingerprintAlgorithm" | "terminationFingerprint">;
  return { ...core, terminationFingerprintAlgorithm: "sha256", terminationFingerprint: fingerprint(core) };
}

export function buildDriverLifecyclePolicy(): DriverLifecyclePolicy {
  const allowedTransitions: DriverLifecycleTransition[] = [
    "not_initialized->initialized",
    "initialized->executable_resolving",
    "executable_resolving->executable_verified",
    "executable_verified->spawn_preparing",
    "spawn_preparing->process_starting",
    "process_starting->process_running",
    "process_running->exit_observed",
    "exit_observed->containment_verifying",
    "containment_verifying->output_disposing",
    "output_disposing->completed",
    "completed->disposed",
    "process_running->timeout_detected",
    "timeout_detected->termination_planning",
    "termination_planning->graceful_termination_requested",
    "graceful_termination_requested->graceful_wait",
    "graceful_wait->containment_verifying",
    "graceful_wait->force_termination_requested",
    "force_termination_requested->force_wait",
    "force_wait->containment_verifying",
    "output_disposing->terminated",
    "terminated->disposed",
    "process_running->failed",
    "failed->output_disposing",
    "containment_verifying->ambiguous",
    "ambiguous->output_disposing",
  ];
  const core = {
    lifecyclePolicyId: "post_trade_macos_process_driver_lifecycle_policy_v1",
    allowedTransitions,
    terminalStates: ["completed", "failed", "terminated", "ambiguous", "disposed"],
    secondStartAllowed: false,
    disposedReuseAllowed: false,
    failedRetryAllowed: false,
    ambiguousRetryAllowed: false,
    cleanupAmbiguityToCompletedAllowed: false,
  } satisfies Omit<DriverLifecyclePolicy, "lifecycleFingerprintAlgorithm" | "lifecycleFingerprint">;
  return { ...core, lifecycleFingerprintAlgorithm: "sha256", lifecycleFingerprint: fingerprint(core) };
}

export function buildSanitizedDriverResult(patch: Partial<Omit<SanitizedDriverResult, "resultFingerprintAlgorithm" | "resultFingerprint">> = {}): SanitizedDriverResult {
  const executable = buildExecutableCapabilityEvidence("git_cli");
  const core = {
    driverResultId: "post_trade_macos_driver_result_001",
    driverIdentity: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID,
    processRequestId: "post_trade_first_live_read_only_staging_preflight_preflight_git_current_commit_process_request_001",
    operationId: "preflight_git_current_commit",
    opaqueProcessInstanceId: "post_trade_macos_opaque_process_instance_001",
    boundarySession: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    executableIdentityFingerprint: executable.sanitizedExecutableFingerprint,
    workdirIdentity: "ture_trade_repository_root",
    environmentPolicyIdentity: "post_trade_macos_minimal_non_secret_environment_policy_v1",
    credentialHandoffUsed: false,
    lifecycleTerminalState: "completed",
    startedAtIso: "2026-07-16T10:00:00.000Z",
    endedAtIso: "2026-07-16T10:00:30.000Z",
    exitClassification: "zero",
    signalClassification: "none",
    timeout: false,
    gracefulTerminationRequested: false,
    forceTerminationRequested: false,
    containmentClassification: "containment_verified",
    terminationClassification: "not_required",
    childClassification: "none",
    promptDetected: false,
    secretDetected: false,
    mutationDetected: false,
    stdoutByteCount: 12,
    stderrByteCount: 0,
    stdoutFingerprint: hash("fixture_stdout"),
    stderrFingerprint: hash(""),
    overflow: false,
    truncation: false,
    outputDisposed: true,
    credentialCleanupConfirmed: "not_required",
    resultClassification: "completed_read_only",
    ...patch,
  } satisfies Omit<SanitizedDriverResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return { ...core, resultFingerprintAlgorithm: "sha256", resultFingerprint: fingerprint(core) };
}

export function buildCompatibilitySummary(): CompatibilitySummary {
  const core = {
    compatibilityId: "post_trade_macos_driver_design_action_519_520_compatibility_v1",
    processExecutorId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID,
    executableRegistryId: "post_trade_first_live_read_only_staging_preflight_process_executable_registry_v1",
    operationRegistryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID,
    containmentPolicyId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTAINMENT_POLICY_ID,
    preservesNoShell: true,
    preservesNoTty: true,
    preservesClosedStdin: true,
    preservesDetachedFalse: true,
    preservesOneProcessAtATime: true,
    preservesOneRunnerInvocation: true,
    preservesOneCollectionSession: true,
    preservesNoRetry: true,
    preservesStagingOnly: true,
    deploymentCount: 0,
    sqlMutationCount: 0,
    dataMutationCount: 0,
  } satisfies Omit<CompatibilitySummary, "compatibilityFingerprintAlgorithm" | "compatibilityFingerprint">;
  return { ...core, compatibilityFingerprintAlgorithm: "sha256", compatibilityFingerprint: fingerprint(core) };
}

export function buildInertLiveMacosDriverImplementationPlan() {
  return {
    planId: "post_trade_macos_live_read_only_driver_inert_future_implementation_plan_001",
    steps: [
      "validate live-driver design",
      "validate Action 519-520 compatibility",
      "validate CLI-version collector compatibility",
      "validate credential-boundary compatibility",
      "require separately reviewed executable resolver",
      "require separately reviewed macOS process observer",
      "create one private executable capability",
      "create one private cwd capability",
      "validate one exact process request",
      "optionally receive one opaque credential capability",
      "start one direct read-only process in a future action",
      "capture bounded transient output in a future action",
      "observe process tree in a future action",
      "enforce timeout in a future action",
      "terminate and verify if required in a future action",
      "dispose output in a future action",
      "confirm credential cleanup where applicable",
      "emit sanitized driver evidence",
      "stop without invoking preflight or deployment",
    ],
    containsExecutablePath: false,
    containsCwdPath: false,
    containsCommandString: false,
    containsCredential: false,
    containsSecretEnvironmentValue: false,
    containsRawOutput: false,
    containsPid: false,
    containsShell: false,
    containsSql: false,
    containsDeployment: false,
    containsRetry: false,
    liveCommandsExecuted: 0,
    processStarted: false,
    executableResolved: false,
    pathInspected: false,
    environmentRead: false,
    credentialAccessed: false,
  } as const;
}

export function validateLiveMacosProcessDriverDesign(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildLiveMacosProcessDriverDesign(), "driver_design", fingerprint, "designFingerprint", "designFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  if (input.platform !== "macos") reasons.push("wrong_platform");
  if (input.genericCrossPlatformDriver !== false) reasons.push("generic_cross_platform_driver");
  if (input.noRunInDesign !== true) reasons.push("design_may_run");
  for (const key of ["shellDisabled", "stdinClosed", "ttyDisabled", "pseudoTtyDisabled", "directSpawnOnly", "boundedOutputRequired", "processTreeObservationRequired", "descendantTerminationVerificationRequired", "oneProcessAtATime", "oneBoundarySession"]) {
    if (input[key] !== true) reasons.push(`missing_required_driver_property:${key}`);
  }
  for (const key of ["detached", "automaticRetryAllowed", "globalProcessEnumerationAllowed", "arbitraryExecutableAllowed", "arbitraryArgumentsAllowed", "arbitraryEnvironmentAllowed", "deploymentCapability"]) {
    if (input[key] !== false) reasons.push(`unsafe_driver_property:${key}`);
  }
  for (const key of ["environmentSelectedDriverAllowed", "callerSelectedDriverAllowed", "automaticPlatformFallbackAllowed", "liveExecutableVerificationClaim", "liveFilesystemIdentityClaim", "liveProcessStartedClaim", "liveProcessObservedClaim", "liveContainmentVerifiedClaim", "liveTerminationVerifiedClaim", "liveCleanupVerifiedClaim", "commandBehaviorProvenReadOnlyClaim"]) {
    if (input[key] !== false) reasons.push(`unsafe_or_live_claim_driver_property:${key}`);
  }
  return result(reasons);
}

export function validateArchitectureCompatibilityPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildArchitectureCompatibilityPolicy(), "architecture_policy", "architectureFingerprint", "architectureFingerprintAlgorithm", [
    "hostArchitectureEvidenceRequired", "executableArchitectureEvidenceRequired", "translationClassificationRequired", "rosettaTranslatedExecutionRequiresReview",
  ], [
    "unknownArchitectureAllowed", "unknownTranslationAllowed", "genericArchitectureAllowed", "architectureFallbackAllowed",
  ]);
}

export function validateExecutableResolverPolicy(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildExecutableResolverPolicy(), "resolver_policy", fingerprint, "resolverFingerprint", "resolverFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  for (const key of ["callerSelectedPathAllowed", "inheritedPathOnlyAllowed", "shellAliasAllowed", "shellFunctionAllowed", "wrapperAllowed", "scriptProxyAllowed", "unreviewedSymlinkAllowed", "multipleMatchesAllowed", "worldWritableExecutableAllowed", "worldWritableDirectoryAllowed", "productionWrapperAllowed", "publicAbsolutePathAllowed", "deviceInodePublicEvidenceAllowed", "shellLookupAllowed", "whichLookupAllowed", "commandVLookupAllowed", "packageManagerShimAllowedWithoutReview"]) {
    if (input[key] !== false) reasons.push(`unsafe_resolver_property:${key}`);
  }
  return result(reasons);
}

export function validateExecutableCapabilityEvidence(input: unknown): ValidationResult {
  const reasons: string[] = [];
  if (!isRecord(input)) return invalid(["executable_capability_not_object"]);
  if (input.sanitizedExecutableFingerprintAlgorithm !== "sha256" || !isSha256(input.sanitizedExecutableFingerprint)) reasons.push("invalid_executable_fingerprint");
  const core = omitFingerprint(input, "sanitizedExecutableFingerprint", "sanitizedExecutableFingerprintAlgorithm");
  if (isSha256(input.sanitizedExecutableFingerprint) && input.sanitizedExecutableFingerprint !== fingerprint(core)) reasons.push("executable_fingerprint_mismatch");
  if (!["git_cli", "supabase_cli"].includes(String(input.executableIdentity))) reasons.push("unknown_executable_identity");
  if (input.platform !== "macos") reasons.push("wrong_platform");
  if (input.status !== "verified") reasons.push(`executable_not_verified:${String(input.status)}`);
  if (input.observedAtIso !== "2026-07-16T10:00:00.000Z") reasons.push("stale_or_future_executable_capability");
  if (input.expiresAtIso !== "2026-07-16T10:00:05.000Z") reasons.push("invalid_executable_capability_expiry");
  for (const key of ["publicAbsolutePathAbsent", "publicDeviceInodeAbsent", "personalPathAbsent", "regularExecutable", "hostArchitectureEvidenceRequired", "executableArchitectureEvidenceRequired", "stablePrivateFileIdentityHeld"]) {
    if (input[key] !== true) reasons.push(`missing_executable_safety:${key}`);
  }
  for (const key of ["shellFunction", "shellAlias", "wrapperScript", "scriptProxy", "unreviewedSymlink", "multipleMatches", "callerSelectedPath", "worldWritableExecutable", "worldWritableDirectory", "productionWrapper", "translationUnknown", "sizeChangedBeforeSpawn", "mtimeChangedBeforeSpawn", "symlinkTargetChangedBeforeSpawn", "containingDirectoryChangedBeforeSpawn", "executableChangedBeforeSpawn", "pathChangedAfterVerification", "replacedAfterVerification", "reusableAcrossSessions", "reusableAcrossOperations", "clonedCapability"]) {
    if (input[key] !== false) reasons.push(`unsafe_executable_capability:${key}`);
  }
  if (input.ownershipClassification !== "expected_owner") reasons.push("ambiguous_ownership");
  if (input.fileTypeClassification !== "regular_executable") reasons.push("unexpected_file_type");
  if (String(input.architectureSupport) === "unsupported") reasons.push("unsupported_architecture");
  if (input.translationClassification === "translation_unknown_blocked") reasons.push("translation_unknown_blocked");
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  return result(reasons);
}

export function validateTocTouRevalidationPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildTocTouRevalidationPolicy(), "toctou_policy", "toctouFingerprint", "toctouFingerprintAlgorithm", [
    "stableFileIdentityRecheckRequired", "sizeRecheckRequired", "modificationStateRecheckRequired", "ownershipRecheckRequired", "fileTypeRecheckRequired", "architectureRecheckRequired", "optionalDigestRecheckWhenAvailable", "sameBoundarySessionRequired", "sameDriverInstanceRequired", "cwdIdentityRecheckRequired", "operationRegistryRecheckRequired", "processPolicyRecheckRequired", "raceStillPossible",
  ], ["completeEliminationClaimed"]);
}

export function validateWorkingDirectoryCapability(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildWorkingDirectoryCapability(), "cwd_capability", fingerprint, "cwdFingerprint", "cwdFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  for (const key of ["verifiedRepositoryRoot", "publicAbsolutePathAbsent", "personalPathAbsent"]) if (input[key] !== true) reasons.push(`missing_cwd_safety:${key}`);
  for (const key of ["symlinkRoot", "nestedUnrelatedRepository", "productionCheckout", "callerSelectedPath", "reusableAcrossSessions", "repositoryIdentityChanged"]) if (input[key] !== false) reasons.push(`unsafe_cwd:${key}`);
  return result(reasons);
}

export function validateSpawnPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildSpawnPolicy(), "spawn_policy", "spawnFingerprint", "spawnFingerprintAlgorithm", [
    "directExecutableRequired", "argumentArrayRequired", "shellFalseRequired", "detachedFalseRequired", "stdinIgnoredOrClosedRequired", "stdoutPipeRequired", "stderrPipeRequired",
  ], [
    "inheritedStdioAllowed", "commandStringAllowed", "shellCommandAllowed", "commandConcatenationAllowed", "pipesRedirectionAllowed", "commandSubstitutionAllowed", "shellExpansionAllowed", "interactiveTerminalAllowed", "backgroundLaunchAllowed", "guiLaunchAllowed", "arbitraryCwdAllowed", "arbitraryEnvironmentAllowed", "genericSpawnOptionsObjectAllowed", "multipleOperationsAllowed", "multipleExecutableCapabilitiesAllowed", "callerSuppliedPidAllowed",
  ]);
}

export function validateEnvironmentConstructionPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildEnvironmentConstructionPolicy(), "environment_policy", "environmentFingerprint", "environmentFingerprintAlgorithm", [
    "startsFromEmptyEnvironment", "cleanupRequiredAfterEveryOutcome",
  ], [
    "inheritedEnvironmentAllowed", "pathDumpAllowed", "homeAllowed", "userAllowed", "shellConfigAllowed", "arbitraryGitConfigAllowed", "arbitrarySupabaseConfigAllowed", "secretValuesPubliclyRepresentable", "credentialHandoffPubliclyRepresentable", "credentialVariableNamePubliclySelected",
  ]);
}

export function validateCredentialCapabilityPolicy(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCredentialCapabilityPolicy(), "credential_policy", fingerprint, "credentialFingerprint", "credentialFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  for (const key of ["opaqueCapabilityOnly", "oneOperationOnly", "cleanupRequiredAfterSuccess", "cleanupRequiredAfterFailure", "cleanupRequiredAfterTimeout", "cleanupRequiredAfterPrompt", "cleanupRequiredAfterSecretDetection", "cleanupRequiredAfterOverflow", "cleanupRequiredAfterContainmentFailure", "cleanupRequiredAfterObserverAmbiguity", "cleanupRequiredAfterTerminationAmbiguity", "cleanupAmbiguityBlocksResult"]) {
    if (input[key] !== true) reasons.push(`missing_credential_safety:${key}`);
  }
  for (const key of ["reuseAllowed", "publicSecretSlotValueAllowed", "publicEnvironmentVariableNameAllowed", "exportAllowed", "serializationAllowed", "loggingAllowed", "commandArgumentAllowed", "stdinAllowed", "configFileAllowed"]) if (input[key] !== false) reasons.push(`unsafe_credential_policy:${key}`);
  return result(reasons);
}

export function validateOutputCapturePolicy(input: unknown): ValidationResult {
  const reasons = validateBooleanPolicy(input, buildOutputCapturePolicy(), "output_policy", "outputFingerprint", "outputFingerprintAlgorithm", [
    "separateStdoutStderrBuffers", "byteCountBeforeParserAuthority", "overflowBlocksAuthority", "truncationBlocksAuthority", "promptDetectionBeforeParser", "secretDetectionBeforeParser", "byteLevelSecretScanBeforeDecode", "rawBufferDisposalRequired", "minimalCopiesRequired", "mutableBufferOverwriteWherePractical", "referencesDroppedAfterClassification",
  ], [
    "callerMayRaiseLimits", "rawOutputLoggingAllowed", "inheritedOutputAllowed", "fileOutputAllowed", "persistentBufferAllowed", "snapshottingAllowed", "rawOutputInExceptionAllowed", "zeroizationGuaranteed",
  ]).blockingReasons.slice();
  if (isRecord(input)) {
    const canonical = buildOutputCapturePolicy();
    if (typeof input.stdoutLimitBytesGit === "number" && input.stdoutLimitBytesGit > canonical.stdoutLimitBytesGit) reasons.push("caller_raised_git_stdout_limit");
    if (typeof input.stdoutLimitBytesSupabase === "number" && input.stdoutLimitBytesSupabase > canonical.stdoutLimitBytesSupabase) reasons.push("caller_raised_supabase_stdout_limit");
    if (typeof input.stderrLimitBytes === "number" && input.stderrLimitBytes > canonical.stderrLimitBytes) reasons.push("caller_raised_stderr_limit");
  }
  return result(reasons);
}

export function validateOutputDecoderPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildOutputDecoderPolicy(), "decoder_policy", "decoderFingerprint", "decoderFingerprintAlgorithm", [
    "utf8Only", "nulRejected", "controlCharactersRejected", "unicodeSeparatorsRejected", "ansiRejected", "promptAndBannerDetectionRequired", "lineCountEnforced", "parserHandoffRequiresCleanClassification", "byteLevelPreDecodeScreeningRequired",
  ], ["perfectDetectionClaimed"]);
}

export function validateProcessInstanceMetadataPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildProcessInstanceMetadataPolicy(), "instance_policy", "instanceFingerprint", "instanceFingerprintAlgorithm", [
    "privatePidAllowed", "privateProcessGroupIdAllowed",
  ], [
    "publicPidAllowed", "publicProcessGroupIdAllowed", "publicProcessHandleAllowed", "globalRegistryAllowed", "moduleGlobalCacheAllowed", "reusableProcessInstanceAllowed", "secondOperationAllowed", "crossSessionUseAllowed", "overlappingLeaseAllowed", "overlappingObserverAllowed", "secondProcessBeforeOutputDisposalAllowed", "secondProcessBeforeCredentialCleanupAllowed",
  ]);
}

export function validateProcessObserverPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildProcessObserverPolicy(), "observer_policy", "observerFingerprint", "observerFingerprintAlgorithm", [
    "scopedToKnownProcessInstance", "scopedToKnownProcessGroup", "parentStateRequired", "directChildStateRequired", "descendantStateRequired", "processGroupStateRequired", "detachedDescendantDetectionRequired", "processGroupEscapeDetectionRequired", "browserChildDetectionRequired", "guiChildDetectionRequired", "urlOpenerDetectionRequired", "credentialHelperDetectionRequired", "daemonDetectionRequired", "unknownChildDetectionRequired", "helperProcessRequiresSeparateReview",
  ], ["unrestrictedGlobalProcessListingAllowed", "genericContainmentBooleanAllowed", "genericTerminationBooleanAllowed", "arbitraryPidQueryAllowed", "signalCapabilityAllowed", "rawCommandLineOutputAllowed", "environmentOutputAllowed", "personalPathOutputAllowed", "expectedChildrenAllowedForFirstRun"]);
}

export function validateTimeoutMonitoringPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildTimeoutMonitoringPolicy(), "timeout_policy", "timeoutFingerprint", "timeoutFingerprintAlgorithm", [
    "monotonicTimeRequired", "sessionInvalidatedAtTimeout",
  ], ["wallClockOnlyAllowed", "callerOverrideAllowed", "retryAllowed"]);
}

export function validateTerminationPolicy(input: unknown): ValidationResult {
  return validateBooleanPolicy(input, buildTerminationPolicy(), "termination_policy", "terminationFingerprint", "terminationFingerprintAlgorithm", [
    "knownProcessOrGroupTargetRequired", "sessionInvalidatedBeforeSignal", "stopFutureOperationsBeforeSignal", "gracefulWaitBounded", "forceWaitBounded", "containmentObservationAfterGraceful", "containmentObservationAfterForce", "cleanupAfterFinalClassification",
  ], ["arbitraryPidSignalAllowed", "unrestrictedSignalApiAllowed", "parentOnlyExitSufficient", "signalDeliverySuccessSufficient", "processGroupExitAloneSufficientWhenEscapeUnknown", "forceKillClaimsDetachedCertainty", "operationRetryAllowed"]);
}

export function validateDriverLifecyclePolicy(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildDriverLifecyclePolicy(), "lifecycle_policy", fingerprint, "lifecycleFingerprint", "lifecycleFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  const allowed = new Set(buildDriverLifecyclePolicy().allowedTransitions);
  if (Array.isArray(input.allowedTransitions)) {
    for (const transition of input.allowedTransitions) if (!allowed.has(String(transition) as DriverLifecycleTransition)) reasons.push(`illegal_lifecycle_transition:${String(transition)}`);
  }
  for (const key of ["secondStartAllowed", "disposedReuseAllowed", "failedRetryAllowed", "ambiguousRetryAllowed", "cleanupAmbiguityToCompletedAllowed"]) {
    if (input[key] !== false) reasons.push(`unsafe_lifecycle:${key}`);
  }
  return result(reasons);
}

export function validateDriverLifecycleTransitions(transitions: readonly DriverLifecycleTransition[]): ValidationResult {
  const allowed = new Set(buildDriverLifecyclePolicy().allowedTransitions);
  return result(transitions.flatMap((transition) => allowed.has(transition) ? [] : [`illegal_lifecycle_transition:${transition}`]));
}

export function validateSanitizedDriverResult(input: unknown): ValidationResult {
  const reasons: string[] = [];
  if (!isRecord(input)) return invalid(["driver_result_not_object"]);
  if (input.resultFingerprintAlgorithm !== "sha256" || !isSha256(input.resultFingerprint)) reasons.push("invalid_driver_result_fingerprint");
  const core = omitFingerprint(input, "resultFingerprint", "resultFingerprintAlgorithm");
  if (isSha256(input.resultFingerprint) && input.resultFingerprint !== fingerprint(core)) reasons.push("driver_result_fingerprint_mismatch");
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  for (const key of ["rawStdout", "rawStderr", "executablePath", "cwdPath", "pid", "processGroupId", "environmentValue", "credential", "keychainMetadata", "userIdentity"]) {
    if (key in input) reasons.push(`public_result_contains_forbidden_field:${key}`);
  }
  if (input.resultClassification === "completed_read_only") {
    if (input.containmentClassification !== "containment_verified") reasons.push("completed_without_verified_containment");
    if (input.mutationDetected !== false) reasons.push("completed_with_mutation");
    if (input.outputDisposed !== true) reasons.push("completed_without_output_disposal");
    if (input.credentialHandoffUsed === true && input.credentialCleanupConfirmed !== true) reasons.push("completed_without_credential_cleanup");
    if (input.exitClassification !== "zero") reasons.push("completed_without_zero_exit");
    if (input.promptDetected !== false || input.secretDetected !== false || input.overflow !== false || input.truncation !== false) reasons.push("completed_with_blocking_output_signal");
  }
  return result(reasons);
}

export function validateCompatibilitySummary(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCompatibilitySummary(), "compatibility", fingerprint, "compatibilityFingerprint", "compatibilityFingerprintAlgorithm");
  if (!isRecord(input)) return invalid(reasons);
  reasons.push(...validateProcessExecutorExecutionBoundaryCompatibility().blockingReasons);
  reasons.push(...validateProcessExecutorAuthorizationCompatibility().blockingReasons);
  reasons.push(...validateProcessExecutorRunnerCompatibility().blockingReasons);
  reasons.push(...validateProcessExecutorCliVersionCollectorCompatibility().blockingReasons);
  reasons.push(...validateProcessExecutorCredentialDesignCompatibility().blockingReasons);
  if (!validateProcessExecutableRegistry(buildProcessExecutableRegistry()).valid) reasons.push("executor_executable_registry_invalid");
  if (!validateProcessOperationRegistry(buildProcessOperationRegistry()).valid) reasons.push("executor_operation_registry_invalid");
  if (!validateExecutorTimeoutPolicies()) reasons.push("executor_timeout_policy_invalid");
  if (!validateExecutorOutputPolicies()) reasons.push("executor_output_policy_invalid");
  if (!validateExecutorWorkdirAndEnvironmentPolicies()) reasons.push("executor_workdir_or_environment_policy_invalid");
  return result(reasons);
}

export function validateInertLiveMacosDriverImplementationPlan(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildInertLiveMacosDriverImplementationPlan(), "inert_plan");
  if (!isRecord(input)) return invalid(reasons);
  for (const key of ["containsExecutablePath", "containsCwdPath", "containsCommandString", "containsCredential", "containsSecretEnvironmentValue", "containsRawOutput", "containsPid", "containsShell", "containsSql", "containsDeployment", "containsRetry", "processStarted", "executableResolved", "pathInspected", "environmentRead", "credentialAccessed"]) {
    if (input[key] !== false) reasons.push(`inert_plan_not_inert:${key}`);
  }
  if (input.liveCommandsExecuted !== 0) reasons.push("inert_plan_executed_command");
  return result(reasons);
}

export const buildDriverDesignFingerprint = fingerprint;
export const buildArchitecturePolicyFingerprint = fingerprint;
export const buildResolverPolicyFingerprint = fingerprint;
export const buildExecutableCapabilityFingerprint = fingerprint;
export const buildTocTouPolicyFingerprint = fingerprint;
export const buildCwdCapabilityFingerprint = fingerprint;
export const buildSpawnPolicyFingerprint = fingerprint;
export const buildEnvironmentPolicyFingerprint = fingerprint;
export const buildCredentialPolicyFingerprint = fingerprint;
export const buildOutputPolicyFingerprint = fingerprint;
export const buildDecoderPolicyFingerprint = fingerprint;
export const buildInstancePolicyFingerprint = fingerprint;
export const buildObserverPolicyFingerprint = fingerprint;
export const buildTimeoutPolicyFingerprint = fingerprint;
export const buildTerminationPolicyFingerprint = fingerprint;
export const buildLifecyclePolicyFingerprint = fingerprint;
export const buildDriverResultFingerprint = fingerprint;
export const buildCompatibilityFingerprint = fingerprint;

function validateBooleanPolicy(
  input: unknown,
  canonical: unknown,
  prefix: string,
  fingerprintKey: string,
  algorithmKey: string,
  requiredTrue: readonly string[],
  requiredFalse: readonly string[],
): ValidationResult {
  const reasons = validateExactReasons(input, canonical, prefix, fingerprint, fingerprintKey, algorithmKey);
  if (!isRecord(input)) return invalid(reasons);
  for (const key of requiredTrue) if (input[key] !== true) reasons.push(`missing_required_true:${key}`);
  for (const key of requiredFalse) if (input[key] !== false) reasons.push(`unsafe_true:${key}`);
  return result(reasons);
}

function validateExecutorTimeoutPolicies(): boolean {
  const policy = buildExecutorTimeoutRegistry();
  return policy.unknownPolicyAllowed === false && policy.policies.every((item) => item.automaticRetryAllowed === false && item.callerMayIncrease === false && item.sessionInvalidatedOnTimeout === true);
}

function validateExecutorOutputPolicies(): boolean {
  const policy = buildExecutorOutputLimitRegistry();
  return policy.unknownPolicyAllowed === false && policy.policies.every((item) => item.automaticRetryAllowed === false && item.callerMayIncrease === false && item.truncationProhibited === true && item.overflowBlocksParserAuthority === true);
}

function validateExecutorWorkdirAndEnvironmentPolicies(): boolean {
  const workdir = buildExecutorWorkingDirectoryPolicy();
  const environment = buildExecutorEnvironmentPolicy();
  const lifecycle = buildExecutorLifecyclePolicy();
  return workdir.callerSelectedAbsolutePathAllowed === false
    && environment.startsFromEmptyEnvironment === true
    && environment.credentialInjectionImplemented === false
    && lifecycle.noSecondInvocationFromTerminalState === true;
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

function fingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
