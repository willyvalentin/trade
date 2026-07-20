import { createHash } from "node:crypto";

import {
  buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES,
} from "@/lib/post-trade-first-live-read-only-preflight-authorization-artifact-core";
import {
  buildPostTradeReadOnlyLivePreflightRunnerPlan,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
} from "@/lib/post-trade-read-only-live-staging-migration-preflight-runner-core";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_ID =
  "post_trade_first_live_read_only_staging_preflight_execution_boundary_contract_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION =
  "post_trade_first_live_read_only_staging_preflight_execution_boundary_contract_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID =
  "post_trade_first_live_read_only_staging_preflight_boundary_session_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID =
  "post_trade_first_live_read_only_staging_preflight_opaque_credential_handle_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER =
  "reviewed_ephemeral_staging_supabase_cli_credential_provider_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_POLICY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_policy_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID =
  "post_trade_first_live_read_only_staging_preflight_cli_version_policy_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID =
  "post_trade_first_live_read_only_staging_preflight_minimal_credential_injection_policy_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLEANUP_REQUIREMENT_ID =
  "post_trade_first_live_read_only_staging_preflight_credential_cleanup_required_v1" as const;

export type BoundaryDecision = "ready_for_first_live_read_only_preflight_gate" | "blocked" | "invalid" | "expired" | "ambiguous";
export type CredentialBoundaryClassification =
  | "credential_boundary_ready"
  | "credential_boundary_blocked"
  | "credential_boundary_invalid"
  | "credential_boundary_expired"
  | "credential_boundary_ambiguous";
export type VersionCompatibilityClassification = "compatible" | "incompatible" | "unknown" | "stale" | "malformed" | "ambiguous";
export type ProcessLifecycleState =
  | "not_started"
  | "starting"
  | "running"
  | "exited"
  | "termination_requested"
  | "terminated"
  | "termination_failed"
  | "timed_out"
  | "ambiguous";
export type ProcessExecutionClassification =
  | "completed_read_only"
  | "blocked_before_start"
  | "failed_read_only"
  | "timed_out_terminated"
  | "timed_out_termination_unconfirmed"
  | "output_overflow"
  | "interactive_prompt_detected"
  | "secret_material_detected"
  | "unexpected_child_process"
  | "ambiguous";
export type EnvironmentEntryClassification = "fixed_non_secret" | "opaque_secret_injection" | "forbidden" | "absent";
export type ProcessLifecycleTransition =
  | "not_started->starting"
  | "starting->running"
  | "running->exited"
  | "running->termination_requested"
  | "termination_requested->terminated"
  | "termination_requested->termination_failed"
  | "running->timed_out"
  | "timed_out->termination_requested"
  | "timed_out->ambiguous";

export type CredentialBoundaryEvidence = {
  boundaryEvidenceId: "post_trade_first_live_read_only_staging_preflight_credential_boundary_evidence_001";
  evidenceVersion: "post_trade_first_live_read_only_staging_preflight_credential_boundary_evidence_v1";
  sourceIdentity: "reviewed_credential_boundary_contract_fixture_v1";
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  credentialHandleId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID;
  credentialProviderIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  credentialPurpose: "read_only_staging_supabase_preflight_metadata";
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  allowedCommandOperationIdentities: readonly string[];
  issuedAtIso: "2026-07-14T12:00:00.000Z";
  expiresAtIso: "2026-07-14T12:05:00.000Z";
  revoked: false;
  singleSession: true;
  nonExportable: true;
  nonLoggable: true;
  noInteractiveAuth: true;
  browserLoginAllowed: false;
  deviceCodeAuthAllowed: false;
  promptAllowed: false;
  cleanupRequired: true;
  secretValueAbsent: true;
  environmentPassthrough: "none";
  environmentInjectionPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID;
  cleanupRequirementIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLEANUP_REQUIREMENT_ID;
  environmentEntryClassifications: Readonly<Record<string, EnvironmentEntryClassification>>;
  resultClassification: CredentialBoundaryClassification;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
};

export type VersionEvidence = {
  componentIdentity: "git" | "supabase_cli" | "runner_collector" | "parser_registry" | "catalog_adapter" | "normalization_policy" | "command_registry";
  observedVersion: string;
  requiredPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID;
  compatibilityClassification: VersionCompatibilityClassification;
  evidenceSourceIdentity: "trusted_read_only_version_boundary_fixture_v1";
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  observedAtIso: "2026-07-14T12:00:30.000Z";
  expiresAtIso: "2026-07-14T12:05:00.000Z";
  outputFingerprint: string;
  parserIdentity: string;
  executableBasename: string;
  executableResolvedIdentity: string;
  callerSelectedPath: false;
  shellWrapper: false;
  alias: false;
  functionWrapper: false;
  scriptProxy: false;
  productionSpecificWrapper: false;
  authoritative: true;
  complete: true;
  readOnly: true;
  truncated: false;
  promptDetected: false;
  warningBannerDetected: false;
  multipleVersionLines: false;
  prerelease: false;
};

export type VersionEvidenceSet = {
  evidenceSetId: "post_trade_first_live_read_only_staging_preflight_version_evidence_set_001";
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  requiredPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID;
  evidence: readonly VersionEvidence[];
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
};

export type ProcessExecutionPolicy = {
  processPolicyId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_POLICY_ID;
  exactExecutableIdentityRequired: true;
  exactArgumentArrayRequired: true;
  exactWorkingDirectoryIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.workingDirectoryPolicy;
  environmentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.environmentPolicy;
  argumentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.argumentPolicy;
  stdinClosed: true;
  ttyDisabled: true;
  shellDisabled: true;
  detached: false;
  processGroupContainmentRequired: true;
  processTreeTerminationRequired: true;
  boundedCleanupIntervalMs: 2000;
  timeoutMsByOperation: Readonly<Record<string, number>>;
  maxStdoutBytesByOperation: Readonly<Record<string, number>>;
  maxStderrBytesByOperation: Readonly<Record<string, number>>;
  automaticRetryAllowed: false;
  allowedLifecycleTransitions: readonly ProcessLifecycleTransition[];
  rejectedLifecycleTransitions: readonly string[];
  runnerInvocationCount: 1;
  collectionSessionCount: 1;
  deploymentOperations: 0;
  sqlOperations: 0;
  mutationOperations: 0;
  directSqlAllowed: false;
  browserLaunchAllowed: false;
  externalAuthSubprocessAllowed: false;
  credentialHelperSubprocessAllowed: false;
  platformContainmentNote: "macos_process_tree_containment_requires_future_implementation_validation";
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
};

export type ProcessResultEvidence = {
  processOperationId: string;
  processInstanceId: "post_trade_first_live_read_only_staging_preflight_process_instance_001";
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  executableIdentity: "reviewed_direct_executable_identity_v1";
  argumentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.argumentPolicy;
  environmentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.environmentPolicy;
  workingDirectoryIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.workingDirectoryPolicy;
  lifecycleState: ProcessLifecycleState;
  startedAtIso: "2026-07-14T12:01:00.000Z";
  endedAtIso: "2026-07-14T12:01:01.000Z";
  exitCode: 0 | null;
  signalClassification: "none" | "terminated" | "killed" | "unknown";
  timeout: false;
  terminationRequested: false;
  terminationConfirmed: true;
  parentProcessExited: true;
  directChildrenExited: true;
  processGroupExited: true;
  processTreeTerminationConfirmed: true;
  noDetachedDescendantsKnown: true;
  containmentAuthority: "reviewed_process_group_boundary";
  terminationVerificationSource: "reviewed_process_tree_observer_v1";
  terminationVerifiedAtIso: "2026-07-14T12:01:01.000Z";
  detached: false;
  childProcessCountClassification: "zero" | "reviewed_zero" | "unexpected" | "unknown";
  stdoutByteCount: number;
  stderrByteCount: number;
  stdoutFingerprint: string;
  stderrFingerprint: string;
  truncation: false;
  outputOverflow: false;
  promptDetected: false;
  secretDetected: false;
  unexpectedChildProcess: false;
  browserChildProcess: false;
  credentialHelperChildProcess: false;
  daemonizationDetected: false;
  backgroundChildDetected: false;
  guiLaunchDetected: false;
  urlOpenerDetected: false;
  rawStdoutPresent: false;
  rawStderrPresent: false;
  resultClassification: ProcessExecutionClassification;
};

export type BoundarySession = {
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  boundaryContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION;
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  authorizationFingerprint: string;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  preflightOperationId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID;
  credentialHandleId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID;
  versionEvidenceSetId: VersionEvidenceSet["evidenceSetId"];
  processPolicyId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_POLICY_ID;
  runnerContractIdentity: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID;
  runnerVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION;
  collectorVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION;
  startedAtIso: "2026-07-14T12:00:00.000Z";
  expiresAtIso: "2026-07-14T12:05:00.000Z";
  stagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  sessionFingerprintAlgorithm: "sha256";
  sessionFingerprint: string;
};

export type BoundaryReadinessInput = {
  inputId: "post_trade_first_live_read_only_staging_preflight_boundary_readiness_input_001";
  authorizationArtifact: ReturnType<typeof buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact>;
  credentialEvidence: CredentialBoundaryEvidence;
  versionEvidenceSet: VersionEvidenceSet;
  processPolicy: ProcessExecutionPolicy;
  processResultEvidence: ProcessResultEvidence;
  boundarySession: BoundarySession;
  inputFingerprintAlgorithm: "sha256";
  inputFingerprint: string;
};

export type BoundaryReadinessDecision = {
  decision: BoundaryDecision;
  ready: boolean;
  runnerExecutionEnabled: false;
  preflightRunStatus: "not_run";
  deploymentEnabled: false;
  deploymentStatus: "not_deployed";
  remoteMutation: false;
  gitMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  recommendsSeparateFinalLiveRunGate: true;
  blockingReasons: string[];
};

type ValidationResult = { valid: boolean; blockingReasons: string[] };

const evaluatedAtIso = "2026-07-14T12:01:00.000Z";
const expectedVersionEvidenceCount = 7;

export function buildCredentialBoundaryRequirements() {
  const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();
  const allowedSupabaseOperations = plan.operations
    .filter((operation) => operation.family.startsWith("supabase_"))
    .map((operation) => operation.operationId);

  return {
    credentialProviderRecommendation: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    rejectedProviderIdentities: [
      "caller",
      "manual",
      "pasted_token",
      "raw_environment",
      "dotenv_dump",
      "command_argument",
      "source_control",
      "browser_login",
      "interactive_login",
      "unknown",
    ],
    allowedCommandOperationIdentities: allowedSupabaseOperations,
    environmentPolicy: {
      startsFromEmptyEnvironment: true,
      arbitraryEnvironmentPassthrough: false,
      gitCredentialInjection: false,
      secretSerialization: false,
      secretFingerprinting: false,
      cleanupRequired: true,
    },
  } as const;
}

export function buildCliVersionRequirements() {
  return {
    policyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID,
    allowedCompatibility: "compatible" as const,
    noLatest: true,
    noWildcardMajorVersion: true,
    noUnboundedSemver: true,
    noBuildMetadataAmbiguity: true,
    noLexicalVersionComparison: true,
    noCallerSelectedRange: true,
    noEnvironmentOverride: true,
    noPrereleaseAcceptance: true,
    noImplicitNewerVersionAcceptance: true,
    componentVersionPolicy: {
      git: "narrow_reviewed_range_allowed_after_static_review",
      supabase_cli: "exact_reviewed_version_required_initially",
      runner_collector: "exact_internal_version_required",
      parser_registry: "exact_policy_identity_required",
      catalog_adapter: "exact_policy_identity_required",
      normalization_policy: "exact_policy_identity_required",
      command_registry: "exact_policy_identity_required",
    },
    components: [
      "git",
      "supabase_cli",
      "runner_collector",
      "parser_registry",
      "catalog_adapter",
      "normalization_policy",
      "command_registry",
    ] as const,
  };
}

export function buildProcessExecutionRequirements(): ProcessExecutionPolicy {
  const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();
  const core = {
    processPolicyId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_POLICY_ID,
    exactExecutableIdentityRequired: true,
    exactArgumentArrayRequired: true,
    exactWorkingDirectoryIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.workingDirectoryPolicy,
    environmentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.environmentPolicy,
    argumentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.argumentPolicy,
    stdinClosed: true,
    ttyDisabled: true,
    shellDisabled: true,
    detached: false,
    processGroupContainmentRequired: true,
    processTreeTerminationRequired: true,
    boundedCleanupIntervalMs: 2000,
    timeoutMsByOperation: Object.fromEntries(plan.operations.map((operation) => [operation.operationId, operation.timeoutMs])),
    maxStdoutBytesByOperation: Object.fromEntries(plan.operations.map((operation) => [operation.operationId, operation.maxStdoutBytes])),
    maxStderrBytesByOperation: Object.fromEntries(plan.operations.map((operation) => [operation.operationId, operation.maxStderrBytes])),
    automaticRetryAllowed: false,
    allowedLifecycleTransitions: [
      "not_started->starting",
      "starting->running",
      "running->exited",
      "running->termination_requested",
      "termination_requested->terminated",
      "termination_requested->termination_failed",
      "running->timed_out",
      "timed_out->termination_requested",
      "timed_out->ambiguous",
    ],
    rejectedLifecycleTransitions: [
      "not_started->terminated",
      "exited->running",
      "terminated->running",
      "termination_failed->starting",
      "timed_out->starting",
      "ambiguous->completed_read_only",
      "failed_read_only->completed_read_only",
      "interactive_prompt_detected->completed_read_only",
      "output_overflow->completed_read_only",
    ],
    runnerInvocationCount: 1,
    collectionSessionCount: 1,
    deploymentOperations: 0,
    sqlOperations: 0,
    mutationOperations: 0,
    directSqlAllowed: false,
    browserLaunchAllowed: false,
    externalAuthSubprocessAllowed: false,
    credentialHelperSubprocessAllowed: false,
    platformContainmentNote: "macos_process_tree_containment_requires_future_implementation_validation",
  } satisfies Omit<ProcessExecutionPolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return {
    ...core,
    policyFingerprintAlgorithm: "sha256",
    policyFingerprint: buildProcessPolicyFingerprint(core),
  };
}

export function buildCanonicalCredentialBoundaryEvidence(): CredentialBoundaryEvidence {
  const core = {
    boundaryEvidenceId: "post_trade_first_live_read_only_staging_preflight_credential_boundary_evidence_001",
    evidenceVersion: "post_trade_first_live_read_only_staging_preflight_credential_boundary_evidence_v1",
    sourceIdentity: "reviewed_credential_boundary_contract_fixture_v1",
    authorizationArtifactId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
    preflightRunId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
    credentialHandleId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID,
    credentialProviderIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    credentialPurpose: "read_only_staging_supabase_preflight_metadata",
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    allowedCommandOperationIdentities: buildCredentialBoundaryRequirements().allowedCommandOperationIdentities,
    issuedAtIso: "2026-07-14T12:00:00.000Z",
    expiresAtIso: "2026-07-14T12:05:00.000Z",
    revoked: false,
    singleSession: true,
    nonExportable: true,
    nonLoggable: true,
    noInteractiveAuth: true,
    browserLoginAllowed: false,
    deviceCodeAuthAllowed: false,
    promptAllowed: false,
    cleanupRequired: true,
    secretValueAbsent: true,
    environmentPassthrough: "none",
    environmentInjectionPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID,
    cleanupRequirementIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLEANUP_REQUIREMENT_ID,
    environmentEntryClassifications: {
      NO_COLOR: "fixed_non_secret",
      PAGER: "absent",
      reviewed_staging_supabase_cli_secret_slot: "opaque_secret_injection",
      GIT_ASKPASS: "absent",
    },
    resultClassification: "credential_boundary_ready",
  } satisfies Omit<CredentialBoundaryEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return {
    ...core,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: buildCredentialBoundaryEvidenceFingerprint(core),
  };
}

export function buildCanonicalVersionEvidenceSet(): VersionEvidenceSet {
  const base = {
    requiredPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID,
    evidenceSourceIdentity: "trusted_read_only_version_boundary_fixture_v1",
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    observedAtIso: "2026-07-14T12:00:30.000Z",
    expiresAtIso: "2026-07-14T12:05:00.000Z",
    compatibilityClassification: "compatible",
    authoritative: true,
    complete: true,
    readOnly: true,
    truncated: false,
    promptDetected: false,
    warningBannerDetected: false,
    multipleVersionLines: false,
    prerelease: false,
    callerSelectedPath: false,
    shellWrapper: false,
    alias: false,
    functionWrapper: false,
    scriptProxy: false,
    productionSpecificWrapper: false,
  } as const;
  const evidence: VersionEvidence[] = [
    versionEvidence("git", "git-2.50-reviewed-output-contract", "git_version_parser_v1", "git"),
    versionEvidence("supabase_cli", "supabase-cli-2.33-reviewed-output-contract", "supabase_cli_version_parser_v1", "supabase"),
    versionEvidence("runner_collector", POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION, "runner_collector_version_parser_v1", "collector"),
    versionEvidence("parser_registry", POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.parserRegistry, "parser_registry_version_parser_v1", "parser-registry"),
    versionEvidence("catalog_adapter", "post_trade_read_only_live_preflight_catalog_adapter_v1", "catalog_adapter_version_parser_v1", "catalog-adapter"),
    versionEvidence("normalization_policy", "post_trade_read_only_live_preflight_normalization_policy_v1", "normalization_policy_parser_v1", "normalization-policy"),
    versionEvidence("command_registry", "post_trade_read_only_live_preflight_command_registry_v1", "command_registry_version_parser_v1", "command-registry"),
  ].map((item) => ({ ...base, ...item }));
  const core = {
    evidenceSetId: "post_trade_first_live_read_only_staging_preflight_version_evidence_set_001",
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    requiredPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID,
    evidence,
  } satisfies Omit<VersionEvidenceSet, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return {
    ...core,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: buildVersionEvidenceSetFingerprint(core),
  };
}

export function buildCanonicalProcessResultEvidence(): ProcessResultEvidence {
  return {
    processOperationId: buildCredentialBoundaryRequirements().allowedCommandOperationIdentities[0] ?? "preflight_supabase_linked_project",
    processInstanceId: "post_trade_first_live_read_only_staging_preflight_process_instance_001",
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    executableIdentity: "reviewed_direct_executable_identity_v1",
    argumentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.argumentPolicy,
    environmentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.environmentPolicy,
    workingDirectoryIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.workingDirectoryPolicy,
    lifecycleState: "exited",
    startedAtIso: "2026-07-14T12:01:00.000Z",
    endedAtIso: "2026-07-14T12:01:01.000Z",
    exitCode: 0,
    signalClassification: "none",
    timeout: false,
    terminationRequested: false,
    terminationConfirmed: true,
    parentProcessExited: true,
    directChildrenExited: true,
    processGroupExited: true,
    processTreeTerminationConfirmed: true,
    noDetachedDescendantsKnown: true,
    containmentAuthority: "reviewed_process_group_boundary",
    terminationVerificationSource: "reviewed_process_tree_observer_v1",
    terminationVerifiedAtIso: "2026-07-14T12:01:01.000Z",
    detached: false,
    childProcessCountClassification: "zero",
    stdoutByteCount: 256,
    stderrByteCount: 0,
    stdoutFingerprint: hash("sanitized-stdout-fingerprint-only"),
    stderrFingerprint: hash("empty-stderr-fingerprint-only"),
    truncation: false,
    outputOverflow: false,
    promptDetected: false,
    secretDetected: false,
    unexpectedChildProcess: false,
    browserChildProcess: false,
    credentialHelperChildProcess: false,
    daemonizationDetected: false,
    backgroundChildDetected: false,
    guiLaunchDetected: false,
    urlOpenerDetected: false,
    rawStdoutPresent: false,
    rawStderrPresent: false,
    resultClassification: "completed_read_only",
  };
}

export function buildBoundarySession(
  authorizationArtifact = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact(),
  versionEvidenceSet = buildCanonicalVersionEvidenceSet(),
  processPolicy = buildProcessExecutionRequirements(),
): BoundarySession {
  const core = {
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    boundaryContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION,
    authorizationArtifactId: authorizationArtifact.authorizationArtifactId,
    authorizationFingerprint: authorizationArtifact.artifactFingerprint,
    preflightRunId: authorizationArtifact.preflightRunId,
    preflightOperationId: authorizationArtifact.preflightOperationId,
    credentialHandleId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID,
    versionEvidenceSetId: versionEvidenceSet.evidenceSetId,
    processPolicyId: processPolicy.processPolicyId,
    runnerContractIdentity: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
    runnerVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
    collectorVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION,
    startedAtIso: "2026-07-14T12:00:00.000Z",
    expiresAtIso: "2026-07-14T12:05:00.000Z",
    stagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  } satisfies Omit<BoundarySession, "sessionFingerprintAlgorithm" | "sessionFingerprint">;
  return {
    ...core,
    sessionFingerprintAlgorithm: "sha256",
    sessionFingerprint: buildBoundarySessionFingerprint(core),
  };
}

export function buildCanonicalBoundaryReadinessInput(): BoundaryReadinessInput {
  const authorizationArtifact = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();
  const credentialEvidence = buildCanonicalCredentialBoundaryEvidence();
  const versionEvidenceSet = buildCanonicalVersionEvidenceSet();
  const processPolicy = buildProcessExecutionRequirements();
  const processResultEvidence = buildCanonicalProcessResultEvidence();
  const boundarySession = buildBoundarySession(authorizationArtifact, versionEvidenceSet, processPolicy);
  const core = {
    inputId: "post_trade_first_live_read_only_staging_preflight_boundary_readiness_input_001",
    authorizationArtifact,
    credentialEvidence,
    versionEvidenceSet,
    processPolicy,
    processResultEvidence,
    boundarySession,
  } satisfies Omit<BoundaryReadinessInput, "inputFingerprintAlgorithm" | "inputFingerprint">;
  return {
    ...core,
    inputFingerprintAlgorithm: "sha256",
    inputFingerprint: buildBoundaryReadinessInputFingerprint(core),
  };
}

export function validateCredentialBoundaryEvidence(input: unknown): ValidationResult {
  const canonical = buildCanonicalCredentialBoundaryEvidence();
  const blockingReasons = baseValidation(input, canonical, "credential");
  if (!isPlainObject(input)) return invalid(blockingReasons);
  const item = input as Partial<CredentialBoundaryEvidence>;
  if (item.resultClassification !== "credential_boundary_ready") blockingReasons.push("credential_not_ready");
  if (item.credentialProviderIdentity !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER) blockingReasons.push("unknown_credential_provider");
  if (item.targetStagingProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) blockingReasons.push("credential_project_mismatch");
  if (String(item.targetStagingProjectRef) === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) blockingReasons.push("production_credential_target");
  if (item.revoked !== false) blockingReasons.push("credential_revoked");
  if (item.singleSession !== true) blockingReasons.push("credential_multiple_sessions_allowed");
  if (item.nonExportable !== true) blockingReasons.push("credential_exportable");
  if (item.nonLoggable !== true) blockingReasons.push("credential_loggable");
  if (item.noInteractiveAuth !== true || item.browserLoginAllowed !== false || item.deviceCodeAuthAllowed !== false || item.promptAllowed !== false) {
    blockingReasons.push("interactive_auth_allowed");
  }
  if (item.cleanupRequired !== true) blockingReasons.push("credential_cleanup_not_required");
  if (item.secretValueAbsent !== true) blockingReasons.push("credential_secret_value_present");
  if (item.environmentPassthrough !== "none") blockingReasons.push("broad_environment_passthrough");
  if (!same(item.allowedCommandOperationIdentities, canonical.allowedCommandOperationIdentities)) blockingReasons.push("credential_operation_scope_mismatch");
  if (Array.isArray(item.allowedCommandOperationIdentities) && item.allowedCommandOperationIdentities.some((operation) => operation.includes("git"))) {
    blockingReasons.push("credential_injected_into_git_operation");
  }
  checkFingerprint(item, "evidenceFingerprint", "evidenceFingerprintAlgorithm", buildCredentialBoundaryEvidenceFingerprint, blockingReasons);
  return result(blockingReasons);
}

export function evaluateVersionEvidenceSet(input: unknown): ValidationResult {
  const canonical = buildCanonicalVersionEvidenceSet();
  const blockingReasons = baseValidation(input, canonical, "versionSet");
  if (!isPlainObject(input)) return invalid(blockingReasons);
  const item = input as Partial<VersionEvidenceSet>;
  if (!Array.isArray(item.evidence) || item.evidence.length !== expectedVersionEvidenceCount) blockingReasons.push("version_evidence_count_mismatch");
  for (const evidence of item.evidence ?? []) {
    if (evidence.compatibilityClassification !== "compatible") blockingReasons.push(`version_not_compatible:${evidence.componentIdentity}`);
    if (evidence.requiredPolicyIdentity !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID) blockingReasons.push("version_policy_mismatch");
    if (!evidence.authoritative || !evidence.complete || !evidence.readOnly) blockingReasons.push("version_evidence_not_authoritative_complete_read_only");
    if (evidence.callerSelectedPath || evidence.shellWrapper || evidence.alias || evidence.functionWrapper || evidence.scriptProxy || evidence.productionSpecificWrapper) {
      blockingReasons.push("executable_identity_not_direct");
    }
    if (evidence.truncated) blockingReasons.push("version_output_truncated");
    if (evidence.promptDetected) blockingReasons.push("version_prompt_detected");
    if (evidence.warningBannerDetected) blockingReasons.push("version_warning_banner_detected");
    if (evidence.multipleVersionLines) blockingReasons.push("multiple_version_lines");
    if (evidence.prerelease) blockingReasons.push("prerelease_version_unreviewed");
    if (!/^[a-f0-9]{64}$/.test(evidence.outputFingerprint)) blockingReasons.push("malformed_version_output_fingerprint");
  }
  checkFingerprint(item, "evidenceFingerprint", "evidenceFingerprintAlgorithm", buildVersionEvidenceSetFingerprint, blockingReasons);
  return result(blockingReasons);
}

export function validateProcessExecutionPolicy(input: unknown): ValidationResult {
  const canonical = buildProcessExecutionRequirements();
  const blockingReasons = baseValidation(input, canonical, "processPolicy");
  if (!isPlainObject(input)) return invalid(blockingReasons);
  const item = input as Partial<ProcessExecutionPolicy>;
  if (!item.shellDisabled) blockingReasons.push("shell_enabled");
  if (!item.stdinClosed) blockingReasons.push("stdin_enabled");
  if (!item.ttyDisabled) blockingReasons.push("tty_enabled");
  if (item.detached !== false) blockingReasons.push("detached_process_allowed");
  if (!item.processGroupContainmentRequired || !item.processTreeTerminationRequired) blockingReasons.push("process_tree_containment_missing");
  if (item.automaticRetryAllowed) blockingReasons.push("automatic_retry_allowed");
  if (!same(item.allowedLifecycleTransitions, canonical.allowedLifecycleTransitions)) blockingReasons.push("lifecycle_transition_policy_mismatch");
  if (!same(item.rejectedLifecycleTransitions, canonical.rejectedLifecycleTransitions)) blockingReasons.push("rejected_lifecycle_transition_policy_mismatch");
  if (item.runnerInvocationCount !== 1) blockingReasons.push("runner_invocation_count_invalid");
  if (item.collectionSessionCount !== 1) blockingReasons.push("collection_session_count_invalid");
  if (item.deploymentOperations !== 0 || item.sqlOperations !== 0 || item.mutationOperations !== 0) blockingReasons.push("mutation_scope_nonzero");
  if (item.browserLaunchAllowed || item.externalAuthSubprocessAllowed || item.credentialHelperSubprocessAllowed) blockingReasons.push("external_interactive_subprocess_allowed");
  checkFingerprint(item, "policyFingerprint", "policyFingerprintAlgorithm", buildProcessPolicyFingerprint, blockingReasons);
  return result(blockingReasons);
}

export function classifyProcessResultEvidence(input: unknown): ValidationResult {
  const canonical = buildCanonicalProcessResultEvidence();
  const blockingReasons = baseValidation(input, canonical, "processResult");
  if (!isPlainObject(input)) return invalid(blockingReasons);
  const item = input as Partial<ProcessResultEvidence>;
  if (item.resultClassification !== "completed_read_only") blockingReasons.push(`process_not_completed_read_only:${String(item.resultClassification)}`);
  if (item.timeout || item.lifecycleState === "timed_out") blockingReasons.push("timeout_invalidates_session");
  if (!item.terminationConfirmed || !item.processTreeTerminationConfirmed) blockingReasons.push("termination_unconfirmed");
  if (!item.parentProcessExited || !item.directChildrenExited || !item.processGroupExited || !item.noDetachedDescendantsKnown) {
    blockingReasons.push("process_tree_exit_evidence_incomplete");
  }
  if (item.containmentAuthority !== "reviewed_process_group_boundary" || item.terminationVerificationSource !== "reviewed_process_tree_observer_v1") {
    blockingReasons.push("process_tree_verification_source_mismatch");
  }
  if (item.detached || item.childProcessCountClassification === "unexpected" || item.childProcessCountClassification === "unknown") blockingReasons.push("unexpected_child_process");
  if (item.truncation || item.outputOverflow) blockingReasons.push("output_not_authoritative");
  if (item.promptDetected) blockingReasons.push("interactive_prompt_detected");
  if (item.secretDetected) blockingReasons.push("secret_material_detected");
  if (item.browserChildProcess || item.credentialHelperChildProcess || item.daemonizationDetected || item.backgroundChildDetected || item.guiLaunchDetected || item.urlOpenerDetected) {
    blockingReasons.push("forbidden_child_or_gui_activity");
  }
  if (item.rawStdoutPresent || item.rawStderrPresent) blockingReasons.push("raw_output_present");
  return result(blockingReasons);
}

export function validateBoundarySession(input: unknown): ValidationResult {
  const canonical = buildBoundarySession();
  const blockingReasons = baseValidation(input, canonical, "boundarySession");
  if (!isPlainObject(input)) return invalid(blockingReasons);
  const item = input as Partial<BoundarySession>;
  if (item.stagingProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) blockingReasons.push("session_staging_project_mismatch");
  if (String(item.stagingProjectRef) === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) blockingReasons.push("session_production_target");
  checkFingerprint(item, "sessionFingerprint", "sessionFingerprintAlgorithm", buildBoundarySessionFingerprint, blockingReasons);
  return result(blockingReasons);
}

export function mapAuthorizationCompatibilityToExecutionBoundary(input: BoundaryReadinessInput): ValidationResult {
  const blockingReasons: string[] = [];
  const artifactDecision = validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact(input.authorizationArtifact, evaluatedAtIso);
  if (!artifactDecision.valid) blockingReasons.push(...artifactDecision.blockingReasons.map((reason) => `authorization:${reason}`));
  if (input.authorizationArtifact.authorizationArtifactId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID) blockingReasons.push("authorization_artifact_mismatch");
  if (input.authorizationArtifact.preflightRunId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID) blockingReasons.push("authorization_run_mismatch");
  if (input.authorizationArtifact.preflightOperationId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID) blockingReasons.push("authorization_operation_mismatch");
  if (input.authorizationArtifact.projectBinding.exactStagingProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) blockingReasons.push("authorization_staging_project_mismatch");
  if (input.authorizationArtifact.automaticRetryAllowed !== false || input.authorizationArtifact.oneShot !== true) blockingReasons.push("authorization_one_shot_retry_mismatch");
  if (input.authorizationArtifact.expectedCounts.runnerInvocations !== 1 || input.authorizationArtifact.expectedCounts.collectionSessions !== 1) blockingReasons.push("authorization_session_count_mismatch");
  if (
    input.authorizationArtifact.expectedCounts.deploymentOperations !== 0 ||
    input.authorizationArtifact.expectedCounts.sqlOperations !== 0 ||
    input.authorizationArtifact.expectedCounts.mutationOperations !== 0
  ) {
    blockingReasons.push("authorization_mutation_scope_nonzero");
  }
  return result(blockingReasons);
}

export function evaluateCombinedBoundaryReadiness(input: unknown): BoundaryReadinessDecision {
  const blockingReasons = baseValidation(input, buildCanonicalBoundaryReadinessInput(), "readinessInput");
  if (!isPlainObject(input)) return readiness("invalid", blockingReasons);
  const item = input as BoundaryReadinessInput;
  blockingReasons.push(...mapAuthorizationCompatibilityToExecutionBoundary(item).blockingReasons);
  blockingReasons.push(...validateCredentialBoundaryEvidence(item.credentialEvidence).blockingReasons.map((reason) => `credential:${reason}`));
  blockingReasons.push(...evaluateVersionEvidenceSet(item.versionEvidenceSet).blockingReasons.map((reason) => `version:${reason}`));
  blockingReasons.push(...validateProcessExecutionPolicy(item.processPolicy).blockingReasons.map((reason) => `processPolicy:${reason}`));
  blockingReasons.push(...classifyProcessResultEvidence(item.processResultEvidence).blockingReasons.map((reason) => `processResult:${reason}`));
  blockingReasons.push(...validateBoundarySession(item.boundarySession).blockingReasons.map((reason) => `session:${reason}`));
  if (
    item.boundarySession.boundarySessionId !== item.versionEvidenceSet.boundarySessionId ||
    item.boundarySession.boundarySessionId !== item.processResultEvidence.boundarySessionId
  ) {
    blockingReasons.push("mixed_boundary_sessions");
  }
  checkFingerprint(item, "inputFingerprint", "inputFingerprintAlgorithm", buildBoundaryReadinessInputFingerprint, blockingReasons);
  const uniqueReasons = [...new Set(blockingReasons)].sort();
  if (uniqueReasons.some((reason) => reason.includes("expired"))) return readiness("expired", uniqueReasons);
  if (uniqueReasons.some((reason) => reason.includes("ambiguous") || reason.includes("truncated") || reason.includes("termination_unconfirmed"))) {
    return readiness("ambiguous", uniqueReasons);
  }
  return readiness(uniqueReasons.length === 0 ? "ready_for_first_live_read_only_preflight_gate" : "blocked", uniqueReasons);
}

export function buildInertFutureExecutionBoundaryPlan() {
  return {
    planStatus: "inert_execution_boundary_verification_plan_only",
    containsCommandStrings: false,
    containsCredentials: false,
    containsSql: false,
    containsDeployment: false,
    containsRetry: false,
    runnerExecutionEnabled: false,
    steps: [
      "validate_authorization_artifact",
      "validate_opaque_credential_boundary_evidence",
      "validate_cli_and_internal_version_evidence",
      "validate_direct_process_policy",
      "validate_process_result_evidence_shape",
      "validate_single_boundary_session",
      "stop_before_runner_execution",
      "recommend_separate_final_live_run_gate",
    ],
  } as const;
}

export function buildCredentialBoundaryEvidenceFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildVersionEvidenceSetFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildProcessPolicyFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildBoundarySessionFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildBoundaryReadinessInputFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

function versionEvidence(
  componentIdentity: VersionEvidence["componentIdentity"],
  observedVersion: string,
  parserIdentity: string,
  executableBasename: string,
): Omit<VersionEvidence, "requiredPolicyIdentity" | "compatibilityClassification" | "evidenceSourceIdentity" | "boundarySessionId" | "observedAtIso" | "expiresAtIso" | "authoritative" | "complete" | "readOnly" | "truncated" | "promptDetected" | "warningBannerDetected" | "multipleVersionLines" | "prerelease" | "callerSelectedPath" | "shellWrapper" | "alias" | "functionWrapper" | "scriptProxy" | "productionSpecificWrapper"> {
  return {
    componentIdentity,
    observedVersion,
    parserIdentity,
    executableBasename,
    executableResolvedIdentity: `reviewed_direct_${executableBasename}_identity`,
    outputFingerprint: hash(`${componentIdentity}:${observedVersion}:${parserIdentity}`),
  };
}

function baseValidation(input: unknown, canonical: unknown, label: string): string[] {
  const blockingReasons: string[] = [];
  if (!isPlainObject(input)) return [`${label}_not_object`];
  if (containsUnsupportedValue(input)) blockingReasons.push("unsupported_nested_value");
  if (hasCycle(input)) blockingReasons.push("cyclic_input");
  if (containsCredentialMaterial(input)) blockingReasons.push("credential_or_secret_material_present");
  if (containsUnexpectedProductionReference(input)) blockingReasons.push("unexpected_production_reference");
  if (containsEmptyCriticalString(input)) blockingReasons.push("empty_critical_string");
  if (containsMalformedCount(input)) blockingReasons.push("malformed_count");
  if (containsUnsupportedValue(input) || hasCycle(input)) return [...new Set(blockingReasons)].sort();
  if (stableStringify(input) !== stableStringify(canonical)) blockingReasons.push(`${label}_canonical_mismatch`);
  return [...new Set(blockingReasons)].sort();
}

function checkFingerprint(
  input: Record<string, unknown>,
  fingerprintKey: string,
  algorithmKey: string,
  builder: (input: unknown) => string,
  blockingReasons: string[],
): void {
  const fingerprint = input[fingerprintKey];
  if (input[algorithmKey] !== "sha256") blockingReasons.push("unknown_fingerprint_algorithm");
  if (typeof fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(fingerprint)) blockingReasons.push("malformed_fingerprint");
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  if (fingerprint !== builder(core)) blockingReasons.push("fingerprint_mismatch");
}

function readiness(decision: BoundaryDecision, blockingReasons: string[]): BoundaryReadinessDecision {
  return {
    decision,
    ready: decision === "ready_for_first_live_read_only_preflight_gate",
    runnerExecutionEnabled: false,
    preflightRunStatus: "not_run",
    deploymentEnabled: false,
    deploymentStatus: "not_deployed",
    remoteMutation: false,
    gitMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    recommendsSeparateFinalLiveRunGate: true,
    blockingReasons: [...new Set(blockingReasons)].sort(),
  };
}

function result(blockingReasons: string[]): ValidationResult {
  return { valid: blockingReasons.length === 0, blockingReasons: [...new Set(blockingReasons)].sort() };
}

function invalid(blockingReasons: string[]): ValidationResult {
  return result(blockingReasons.length > 0 ? blockingReasons : ["invalid_input"]);
}

function same(left: unknown, right: unknown): boolean {
  return stableStringify(left) === stableStringify(right);
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableStringify(value: unknown, seen = new WeakSet<object>()): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (seen.has(value)) return "\"[cycle]\"";
  seen.add(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item, seen)).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key], seen)}`).join(",")}}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function hasCycle(value: unknown, seen = new WeakSet<object>()): boolean {
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.values(value as Record<string, unknown>).some((nested) => hasCycle(nested, seen));
}

function containsUnsupportedValue(value: unknown, seen = new WeakSet<object>()): boolean {
  if (value === null) return true;
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint" || typeof value === "undefined") return true;
  if (typeof value === "number") return !Number.isFinite(value);
  if (Array.isArray(value)) return value.some((item) => containsUnsupportedValue(item, seen));
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return true;
  seen.add(value);
  if (!isPlainObject(value)) return true;
  return Object.values(value).some((nested) => containsUnsupportedValue(nested, seen));
}

function containsEmptyCriticalString(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.some((item) => containsEmptyCriticalString(item, seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.values(value).some((nested) => containsEmptyCriticalString(nested, seen));
}

function containsMalformedCount(value: unknown, path: readonly string[] = [], seen = new WeakSet<object>()): boolean {
  if (typeof value === "number") {
    return /count|operations|invocations|sessions|timeout|bytes|interval/i.test(path[path.length - 1] ?? "") &&
      (!Number.isInteger(value) || value < 0);
  }
  if (Array.isArray(value)) return value.some((item, index) => containsMalformedCount(item, [...path, String(index)], seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) => containsMalformedCount(nested, [...path, key], seen));
}

function containsCredentialMaterial(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    return /access[_ -]?token|refresh[_ -]?token|personal access token|service[_ -]?role|anon[_ -]?key|database[_ -]?password|connection[_ -]?string|authorization:\s*bearer|bearer\s+[a-z0-9._-]+|private key|client[_ -]?secret|cookie\s*[:=]|session\s*[:=]|session[_ -]?token|bankid|rawEnvironment|\/Users\/|\/home\/|postgres(?:ql)?:\/\//i.test(value);
  }
  if (Array.isArray(value)) return value.some((item) => containsCredentialMaterial(item, seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) =>
    /accessToken|refreshToken|serviceRoleKey|anonKey|databasePassword|connectionString|authorizationHeader|privateKey|clientSecret|cookie(Value|Secret|Token)|session(Token|Cookie|Secret|Value)|BankID|rawEnvironment|personalPath|^secretValue$/i.test(key) ||
    containsCredentialMaterial(nested, seen),
  );
}

function containsUnexpectedProductionReference(value: unknown, path: readonly string[] = [], seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    return value.includes(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) &&
      !["rejectedProductionProjectRef", "rejectedProductionProject"].includes(path[path.length - 1] ?? "");
  }
  if (Array.isArray(value)) return value.some((item, index) => containsUnexpectedProductionReference(item, [...path, String(index)], seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) => containsUnexpectedProductionReference(nested, [...path, key], seen));
}
