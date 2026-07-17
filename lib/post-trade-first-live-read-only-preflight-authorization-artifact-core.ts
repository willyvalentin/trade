import { createHash } from "node:crypto";

import {
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT,
} from "@/lib/post-trade-read-only-live-staging-migration-preflight-contract";
import {
  buildPostTradeReadOnlyLivePreflightRunnerPlan,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_EXPECTED_WORKDIR,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
  type PostTradeReadOnlyLivePreflightCatalogQueryIdentity,
  type PostTradeReadOnlyLivePreflightCommandFamily,
} from "@/lib/post-trade-read-only-live-staging-migration-preflight-runner-core";
import {
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID,
} from "@/lib/post-trade-staging-migration-deployment-readiness-artifact-core";
import {
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID =
  "post_trade_first_live_read_only_staging_preflight_authorization_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_VERSION =
  "post_trade_first_live_read_only_staging_preflight_authorization_artifact_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_TYPE =
  "single_use_source_controlled_first_live_read_only_staging_preflight_authorization" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_CONTRACT_VERSION =
  "post_trade_first_live_read_only_staging_preflight_authorization_contract_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_SOURCE_ACTION =
  "Action 509 - Add Single-Use Source-Controlled Authorization Artifact for First Live Read-Only Staging Preflight Run" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID =
  "post_trade_first_live_read_only_staging_preflight_run_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID =
  "post_trade_collect_read_only_staging_migration_preflight_evidence_once_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ISSUED_AT =
  "2026-07-14T12:00:00.000Z" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_EXPIRES_AT =
  "2026-07-14T12:10:00.000Z" as const;

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_DECISION =
  "post_trade_read_only_live_staging_migration_preflight_contract_ready_no_commands_no_deployment" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_DECISION =
  "post_trade_read_only_live_staging_migration_preflight_contract_static_security_review_ready_for_allowlisted_read_only_runner_implementation" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_DECISION =
  "post_trade_allowlisted_read_only_live_staging_migration_preflight_runner_ready_for_static_security_review" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_DECISION =
  "post_trade_allowlisted_read_only_live_staging_migration_preflight_runner_static_security_review_ready_for_first_live_read_only_authorization_artifact" as const;

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_CHECKPOINT =
  "docs/post-trade-read-only-live-staging-migration-preflight-contract-no-commands-no-deployment.md" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_CHECKPOINT =
  "docs/post-trade-read-only-live-staging-migration-preflight-contract-static-security-review-no-commands-no-deployment.md" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_CHECKPOINT =
  "docs/post-trade-allowlisted-read-only-live-staging-migration-preflight-runner-not-run-no-deployment.md" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_CHECKPOINT =
  "docs/post-trade-allowlisted-read-only-live-staging-migration-preflight-runner-static-security-review-not-run-no-deployment.md" as const;

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES = {
  timeoutPolicy: "post_trade_read_only_live_preflight_fixed_timeout_policy_v1",
  outputLimitPolicy: "post_trade_read_only_live_preflight_fixed_output_limit_policy_v1",
  argumentPolicy: "post_trade_read_only_live_preflight_exact_argument_allowlist_policy_v1",
  environmentPolicy: "minimal_non_secret_no_color_no_pager",
  workingDirectoryPolicy: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_EXPECTED_WORKDIR,
  stdinPolicy: "closed",
  promptDetectionPolicy: "post_trade_read_only_live_preflight_prompt_detection_policy_v2",
  secretScanningPolicy: "post_trade_read_only_live_preflight_secret_scanning_policy_v2",
  parserRegistry: "post_trade_read_only_live_preflight_parser_registry_v2",
  evidenceSourceRegistry: "post_trade_read_only_live_preflight_evidence_source_registry_v1",
  versionPolicy: "post_trade_read_only_live_preflight_cli_version_policy_v1",
} as const;

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_FORBIDDEN_CAPABILITIES = {
  deployment: false,
  sqlExecution: false,
  schemaMutation: false,
  rowCreation: false,
  seedExecution: false,
  migrationRepair: false,
  migrationReset: false,
  migrationApplication: false,
  functionDeployment: false,
  policyCreation: false,
  triggerCreation: false,
  rpcExecution: false,
  gitMutation: false,
  gitNetworkOperation: false,
  repositoryCleanup: false,
  authorizationConsumption: false,
  readinessArtifactConsumption: false,
  persistence: false,
  apiActivation: false,
  uiActivation: false,
  clientActivation: false,
  runtimeExecutionActivation: false,
  avanzaIntegration: false,
  browserAutomation: false,
  buyBehavior: false,
  sellBehavior: false,
  settlementRetrieval: false,
  tradeMutation: false,
  positionMutation: false,
  automaticRetry: false,
  secondRunnerInvocation: false,
  multipleCollectionSessions: false,
  productionConnection: false,
} as const;

export type PostTradeFirstLiveReadOnlyPreflightAuthorizationState =
  | "unused"
  | "consumed"
  | "invalid"
  | "expired";

type RunnerPlanBinding = {
  runnerId: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID;
  runnerVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION;
  runnerContractVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION;
  runnerImplementationIdentity: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID;
  runnerStaticReviewIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_CHECKPOINT;
  expectedCollectorVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION;
  commandOperationIdentities: readonly string[];
  commandFamilies: readonly PostTradeReadOnlyLivePreflightCommandFamily[];
  catalogQueryIdentities: readonly PostTradeReadOnlyLivePreflightCatalogQueryIdentity[];
  parserIdentities: readonly string[];
  evidenceCategories: readonly string[];
  timeoutMsByOperation: Readonly<Record<string, number>>;
  maxStdoutBytesByOperation: Readonly<Record<string, number>>;
  maxStderrBytesByOperation: Readonly<Record<string, number>>;
};

export type PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactCore = {
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  artifactVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_VERSION;
  artifactType: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_TYPE;
  sourceActionIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_SOURCE_ACTION;
  authorizationContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_CONTRACT_VERSION;
  preflightContractId: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID;
  preflightContractVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION;
  issuedAtIso: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ISSUED_AT;
  expiresAtIso: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_EXPIRES_AT;
  authorizationState: PostTradeFirstLiveReadOnlyPreflightAuthorizationState;
  preflightRunStatus: "not_run";
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  preflightOperationId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID;
  expectedCollectionSessionContractVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION;
  expectedCollectorVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION;
  runnerExecutionEnabled: false;
  liveEvidenceCollected: false;
  deploymentEnabled: false;
  deploymentStatus: "not_deployed";
  remoteMutation: false;
  gitMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  authorizationConsumed: false;
  automaticRetryAllowed: false;
  oneShot: true;
  readOnly: true;
  stagingOnly: true;
  readinessBinding: {
    readinessArtifactId: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID;
    readinessArtifactFingerprint: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT;
  };
  migrationBinding: {
    reviewedMigrationPath: typeof POST_TRADE_STAGING_MIGRATION_PATH;
    reviewedMigrationFingerprint: typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT;
  };
  projectBinding: {
    exactStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
    rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  };
  reviewBinding: {
    action505Decision: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_DECISION;
    action506Decision: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_DECISION;
    action507Decision: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_DECISION;
    action508Decision: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_DECISION;
    action505Checkpoint: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_CHECKPOINT;
    action506Checkpoint: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_CHECKPOINT;
    action507Checkpoint: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_CHECKPOINT;
    action508Checkpoint: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_CHECKPOINT;
  };
  runnerPlanBinding: RunnerPlanBinding;
  expectedCounts: {
    commandExecutorOperations: number;
    catalogAdapterOperations: number;
    evidenceCategories: number;
    collectionSessions: 1;
    runnerInvocations: 1;
    deploymentOperations: 0;
    sqlOperations: 0;
    mutationOperations: 0;
    migrationApplications: 0;
    expectedRowsCreated: 0;
  };
  policyBinding: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES;
  liveVerificationLimitations: {
    credentialBoundaryVerified: false;
    processTerminationVerified: false;
    cliVersionCompatibilityVerified: false;
    liveProjectContextVerified: false;
    liveWorktreeContextVerified: false;
    liveRemoteReachabilityVerified: false;
    cliVersionsLiveVerified: false;
  };
  processTerminationRequirement: {
    perOperationTimeoutRequired: true;
    authoritativeTerminationResultRequired: true;
    noDetachedProcessesRequired: true;
    noSurvivingChildProcessRequired: true;
    noAutomaticRetryRequired: true;
    sessionInvalidationOnTimeoutRequired: true;
  };
  cliVersionRequirement: {
    requiredVersionPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.versionPolicy;
    gitVersionEvidenceRequired: true;
    supabaseCliVersionEvidenceRequired: true;
    parserRegistryVersionEvidenceRequired: true;
    catalogAdapterVersionEvidenceRequired: true;
    collectorVersionEvidenceRequired: true;
    cliVersionsLiveVerified: false;
  };
  toctouRestrictions: {
    oneCollectionSessionOnly: true;
    noEvidenceReuseAcrossSessions: true;
    shortArtifactValidityRequired: true;
    immediatePreRunGatesRequired: true;
    contextChangeInvalidatesRun: true;
    noDelayOrUnrelatedOperationBeforeRunnerStart: true;
    freshDeploymentPreflightRequiredAfterRunner: true;
    ambiguousRunnerResultInvalidatesAuthorization: true;
  };
  forbiddenCapabilities: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_FORBIDDEN_CAPABILITIES;
};

export type PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact =
  PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactCore & {
    artifactFingerprintAlgorithm: "sha256";
    artifactFingerprint: string;
  };

export type PostTradeFirstLiveReadOnlyPreflightAuthorizationValidation = {
  valid: boolean;
  structurallyReadyForFirstLiveReadOnlyPreflightAuthorization: boolean;
  runnerExecutionEnabled: false;
  deploymentEnabled: false;
  remoteMutation: false;
  gitMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  authorizationConsumed: false;
  liveEvidenceCollected: false;
  artifactFingerprint: string | null;
  blockingReasons: string[];
};

export type PostTradeFirstLiveReadOnlyPreflightRunnerCompatibility = {
  compatible: boolean;
  runnerExecutionEnabled: false;
  remoteMutation: false;
  sqlExecuted: false;
  preservesExactPlan: boolean;
  preservesExactCommandAllowlist: boolean;
  preservesExactCatalogAllowlist: boolean;
  preservesExactParserRegistry: boolean;
  preservesExactTimeouts: boolean;
  preservesExactOutputLimits: boolean;
  preservesExactPolicies: boolean;
  preservesExpectedCounts: boolean;
  preservesNoRetry: boolean;
  preservesNoMutation: boolean;
  createsCollectionSession: false;
  createsLiveEvidence: false;
  consumesAuthorization: false;
  persistsState: false;
  invokesRunner: false;
  invokesExecutor: false;
  invokesCatalogAdapter: false;
  blockingReasons: string[];
};

export type PostTradeFirstLiveReadOnlyPreflightFutureRunPlan = {
  planStatus: "inert_future_first_live_read_only_preflight_only";
  steps: readonly string[];
  targetProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  runnerInvocationCount: 1;
  collectionSessionCount: 1;
  deploymentEnabled: false;
  remoteMutation: false;
  gitMutation: false;
  sqlExecuted: false;
  containsCredentials: false;
  containsCommandStrings: false;
  containsShellStrings: false;
  containsSql: false;
  containsDeployment: false;
  consumesAuthorization: false;
};

const ARTIFACT_KEYS = [
  "authorizationArtifactId",
  "artifactVersion",
  "artifactType",
  "sourceActionIdentity",
  "authorizationContractVersion",
  "preflightContractId",
  "preflightContractVersion",
  "issuedAtIso",
  "expiresAtIso",
  "authorizationState",
  "preflightRunStatus",
  "preflightRunId",
  "preflightOperationId",
  "expectedCollectionSessionContractVersion",
  "expectedCollectorVersion",
  "runnerExecutionEnabled",
  "liveEvidenceCollected",
  "deploymentEnabled",
  "deploymentStatus",
  "remoteMutation",
  "gitMutation",
  "sqlExecuted",
  "migrationsApplied",
  "rowsCreated",
  "authorizationConsumed",
  "automaticRetryAllowed",
  "oneShot",
  "readOnly",
  "stagingOnly",
  "readinessBinding",
  "migrationBinding",
  "projectBinding",
  "reviewBinding",
  "runnerPlanBinding",
  "expectedCounts",
  "policyBinding",
  "liveVerificationLimitations",
  "processTerminationRequirement",
  "cliVersionRequirement",
  "toctouRestrictions",
  "forbiddenCapabilities",
  "artifactFingerprintAlgorithm",
  "artifactFingerprint",
] as const;

const MAX_VALIDITY_MS = 10 * 60 * 1000;

export function buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactCore():
  PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactCore {
  const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();
  const commandOperationIdentities = plan.operations.map((item) => item.operationId);
  const catalogQueryIdentities = plan.catalogQueries.map((item) => item.queryId);
  const evidenceCategories = [...new Set<string>([...plan.operations.map((item) => item.evidenceCategory), "catalog", "privilege"])].sort();

  return {
    authorizationArtifactId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
    artifactVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_VERSION,
    artifactType: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_TYPE,
    sourceActionIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_SOURCE_ACTION,
    authorizationContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_CONTRACT_VERSION,
    preflightContractId: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID,
    preflightContractVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
    issuedAtIso: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ISSUED_AT,
    expiresAtIso: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_EXPIRES_AT,
    authorizationState: "unused",
    preflightRunStatus: "not_run",
    preflightRunId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
    preflightOperationId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID,
    expectedCollectionSessionContractVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
    expectedCollectorVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION,
    runnerExecutionEnabled: false,
    liveEvidenceCollected: false,
    deploymentEnabled: false,
    deploymentStatus: "not_deployed",
    remoteMutation: false,
    gitMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    authorizationConsumed: false,
    automaticRetryAllowed: false,
    oneShot: true,
    readOnly: true,
    stagingOnly: true,
    readinessBinding: {
      readinessArtifactId: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID,
      readinessArtifactFingerprint: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT,
    },
    migrationBinding: {
      reviewedMigrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
      reviewedMigrationFingerprint: POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
    },
    projectBinding: {
      exactStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    },
    reviewBinding: {
      action505Decision: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_DECISION,
      action506Decision: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_DECISION,
      action507Decision: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_DECISION,
      action508Decision: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_DECISION,
      action505Checkpoint: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_CHECKPOINT,
      action506Checkpoint: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_CHECKPOINT,
      action507Checkpoint: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_CHECKPOINT,
      action508Checkpoint: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_CHECKPOINT,
    },
    runnerPlanBinding: {
      runnerId: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
      runnerVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
      runnerContractVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
      runnerImplementationIdentity: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
      runnerStaticReviewIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_CHECKPOINT,
      expectedCollectorVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION,
      commandOperationIdentities,
      commandFamilies: plan.operations.map((item) => item.family),
      catalogQueryIdentities,
      parserIdentities: plan.operations.map((item) => item.parserIdentity),
      evidenceCategories,
      timeoutMsByOperation: Object.fromEntries(plan.operations.map((item) => [item.operationId, item.timeoutMs])),
      maxStdoutBytesByOperation: Object.fromEntries(plan.operations.map((item) => [item.operationId, item.maxStdoutBytes])),
      maxStderrBytesByOperation: Object.fromEntries(plan.operations.map((item) => [item.operationId, item.maxStderrBytes])),
    },
    expectedCounts: {
      commandExecutorOperations: plan.operations.length,
      catalogAdapterOperations: plan.catalogQueries.length,
      evidenceCategories: evidenceCategories.length,
      collectionSessions: 1,
      runnerInvocations: 1,
      deploymentOperations: 0,
      sqlOperations: 0,
      mutationOperations: 0,
      migrationApplications: 0,
      expectedRowsCreated: 0,
    },
    policyBinding: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES,
    liveVerificationLimitations: {
      credentialBoundaryVerified: false,
      processTerminationVerified: false,
      cliVersionCompatibilityVerified: false,
      liveProjectContextVerified: false,
      liveWorktreeContextVerified: false,
      liveRemoteReachabilityVerified: false,
      cliVersionsLiveVerified: false,
    },
    processTerminationRequirement: {
      perOperationTimeoutRequired: true,
      authoritativeTerminationResultRequired: true,
      noDetachedProcessesRequired: true,
      noSurvivingChildProcessRequired: true,
      noAutomaticRetryRequired: true,
      sessionInvalidationOnTimeoutRequired: true,
    },
    cliVersionRequirement: {
      requiredVersionPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.versionPolicy,
      gitVersionEvidenceRequired: true,
      supabaseCliVersionEvidenceRequired: true,
      parserRegistryVersionEvidenceRequired: true,
      catalogAdapterVersionEvidenceRequired: true,
      collectorVersionEvidenceRequired: true,
      cliVersionsLiveVerified: false,
    },
    toctouRestrictions: {
      oneCollectionSessionOnly: true,
      noEvidenceReuseAcrossSessions: true,
      shortArtifactValidityRequired: true,
      immediatePreRunGatesRequired: true,
      contextChangeInvalidatesRun: true,
      noDelayOrUnrelatedOperationBeforeRunnerStart: true,
      freshDeploymentPreflightRequiredAfterRunner: true,
      ambiguousRunnerResultInvalidatesAuthorization: true,
    },
    forbiddenCapabilities: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_FORBIDDEN_CAPABILITIES,
  };
}

export function buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact():
  PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact {
  const core = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactCore();
  return {
    ...core,
    artifactFingerprintAlgorithm: "sha256",
    artifactFingerprint: buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactFingerprint(core),
  };
}

export function buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactFingerprint(
  input: unknown,
): string {
  return createHash("sha256").update(stableStringify(input)).digest("hex");
}

export function validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact(
  input: unknown,
  evaluatedAtIso = "2026-07-14T12:01:00.000Z",
): PostTradeFirstLiveReadOnlyPreflightAuthorizationValidation {
  const blockingReasons: string[] = [];
  const canonical = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();

  if (!isPlainObject(input)) {
    return validation(false, null, ["artifact_not_object"]);
  }

  validateKnownKeys(input, ARTIFACT_KEYS, "artifact", blockingReasons);
  const unsupportedNestedValue = containsUnsupportedValue(input) || hasCycle(input);
  if (unsupportedNestedValue) blockingReasons.push("unsupported_nested_value");
  if (containsCredentialMaterial(input)) blockingReasons.push("credential_or_secret_material_present");
  if (containsUnexpectedProductionReference(input)) blockingReasons.push("unexpected_production_reference");
  if (containsEmptyCriticalString(input)) blockingReasons.push("empty_critical_string");
  if (containsMalformedCount(input)) blockingReasons.push("malformed_count");
  if (unsupportedNestedValue) return validation(false, null, blockingReasons);

  const fingerprint = typeof input.artifactFingerprint === "string" ? input.artifactFingerprint : null;
  if (!fingerprint || !/^[a-f0-9]{64}$/.test(fingerprint)) blockingReasons.push("malformed_artifact_fingerprint");
  if (input.artifactFingerprintAlgorithm !== "sha256") blockingReasons.push("unknown_fingerprint_algorithm");

  const core = { ...input };
  delete (core as Partial<PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact>).artifactFingerprint;
  delete (core as Partial<PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact>).artifactFingerprintAlgorithm;
  const recomputed = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactFingerprint(core);
  if (fingerprint !== recomputed) blockingReasons.push("artifact_fingerprint_mismatch");

  for (const key of Object.keys(canonical) as (keyof PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact)[]) {
    if (key === "artifactFingerprint") continue;
    if (stableStringify(input[key]) !== stableStringify(canonical[key])) {
      blockingReasons.push(`canonical_mismatch:${String(key)}`);
    }
  }

  const issued = parseIso(input.issuedAtIso);
  const expires = parseIso(input.expiresAtIso);
  const evaluated = parseIso(evaluatedAtIso);
  if (!issued) blockingReasons.push("malformed_issued_at");
  if (!expires) blockingReasons.push("malformed_expires_at");
  if (!evaluated) blockingReasons.push("malformed_evaluated_at");
  if (issued && expires && expires.getTime() <= issued.getTime()) blockingReasons.push("expiry_before_issuance");
  if (issued && expires && expires.getTime() - issued.getTime() > MAX_VALIDITY_MS) blockingReasons.push("excessive_validity_window");
  if (issued && evaluated && issued.getTime() > evaluated.getTime()) blockingReasons.push("future_issued_artifact");
  if (expires && evaluated && expires.getTime() <= evaluated.getTime()) blockingReasons.push("expired_artifact");

  const valid = blockingReasons.length === 0;
  return validation(valid, fingerprint, blockingReasons);
}

export function mapFirstLiveReadOnlyPreflightAuthorizationToRunnerCompatibility(
  artifact: unknown,
): PostTradeFirstLiveReadOnlyPreflightRunnerCompatibility {
  const validationResult = validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact(artifact);
  const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();
  const item = isPlainObject(artifact) ? artifact as Partial<PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact> : {};
  const binding = item.runnerPlanBinding;
  const preservesExactPlan = Boolean(
    isPlainObject(binding) &&
    stableStringify(binding.commandOperationIdentities) === stableStringify(plan.operations.map((operation) => operation.operationId)) &&
    stableStringify(binding.catalogQueryIdentities) === stableStringify(plan.catalogQueries.map((query) => query.queryId)),
  );
  const preservesExactCommandAllowlist = Boolean(
    isPlainObject(binding) &&
    stableStringify(binding.commandFamilies) === stableStringify(plan.operations.map((operation) => operation.family)),
  );
  const preservesExactCatalogAllowlist = Boolean(
    isPlainObject(binding) &&
    stableStringify(binding.catalogQueryIdentities) === stableStringify(plan.catalogQueries.map((query) => query.queryId)),
  );
  const preservesExactParserRegistry = Boolean(
    isPlainObject(binding) &&
    stableStringify(binding.parserIdentities) === stableStringify(plan.operations.map((operation) => operation.parserIdentity)),
  );
  const preservesExactTimeouts = Boolean(
    isPlainObject(binding) &&
    stableStringify(binding.timeoutMsByOperation) ===
      stableStringify(Object.fromEntries(plan.operations.map((operation) => [operation.operationId, operation.timeoutMs]))),
  );
  const preservesExactOutputLimits = Boolean(
    isPlainObject(binding) &&
    stableStringify(binding.maxStdoutBytesByOperation) ===
      stableStringify(Object.fromEntries(plan.operations.map((operation) => [operation.operationId, operation.maxStdoutBytes]))) &&
    stableStringify(binding.maxStderrBytesByOperation) ===
      stableStringify(Object.fromEntries(plan.operations.map((operation) => [operation.operationId, operation.maxStderrBytes]))),
  );
  const preservesExactPolicies = Boolean(
    isPlainObject(artifact) &&
    stableStringify(artifact.policyBinding) === stableStringify(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES),
  );
  const preservesExpectedCounts = Boolean(
    isPlainObject(artifact) &&
    stableStringify(artifact.expectedCounts) === stableStringify(buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact().expectedCounts),
  );

  return {
    compatible: validationResult.valid &&
      preservesExactPlan &&
      preservesExactCommandAllowlist &&
      preservesExactCatalogAllowlist &&
      preservesExactParserRegistry &&
      preservesExactTimeouts &&
      preservesExactOutputLimits &&
      preservesExactPolicies &&
      preservesExpectedCounts,
    runnerExecutionEnabled: false,
    remoteMutation: false,
    sqlExecuted: false,
    preservesExactPlan,
    preservesExactCommandAllowlist,
    preservesExactCatalogAllowlist,
    preservesExactParserRegistry,
    preservesExactTimeouts,
    preservesExactOutputLimits,
    preservesExactPolicies,
    preservesExpectedCounts,
    preservesNoRetry: isPlainObject(artifact) && artifact.automaticRetryAllowed === false,
    preservesNoMutation: isPlainObject(artifact) && artifact.remoteMutation === false && artifact.gitMutation === false,
    createsCollectionSession: false,
    createsLiveEvidence: false,
    consumesAuthorization: false,
    persistsState: false,
    invokesRunner: false,
    invokesExecutor: false,
    invokesCatalogAdapter: false,
    blockingReasons: validationResult.blockingReasons,
  };
}

export function buildPostTradeFirstLiveReadOnlyPreflightFutureRunPlan():
  PostTradeFirstLiveReadOnlyPreflightFutureRunPlan {
  return {
    planStatus: "inert_future_first_live_read_only_preflight_only",
    targetProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    runnerInvocationCount: 1,
    collectionSessionCount: 1,
    deploymentEnabled: false,
    remoteMutation: false,
    gitMutation: false,
    sqlExecuted: false,
    containsCredentials: false,
    containsCommandStrings: false,
    containsShellStrings: false,
    containsSql: false,
    containsDeployment: false,
    consumesAuthorization: false,
    steps: [
      "validate_authorization_artifact",
      "verify_artifact_unused_and_unexpired",
      "verify_exact_runner_implementation_and_fingerprint",
      "verify_command_and_catalog_allowlists",
      "verify_credential_boundary_separately",
      "verify_cli_versions_separately",
      "verify_process_termination_boundary_separately",
      "verify_local_repository_context",
      "verify_exact_staging_only_target",
      "invoke_one_read_only_runner_collection_session",
      "generate_sanitized_preflight_result",
      "stop_without_deployment",
      "consume_or_invalidate_authorization_through_later_reviewed_durable_mechanism",
    ],
  };
}

function validation(
  valid: boolean,
  artifactFingerprint: string | null,
  blockingReasons: string[],
): PostTradeFirstLiveReadOnlyPreflightAuthorizationValidation {
  return {
    valid,
    structurallyReadyForFirstLiveReadOnlyPreflightAuthorization: valid,
    runnerExecutionEnabled: false,
    deploymentEnabled: false,
    remoteMutation: false,
    gitMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    authorizationConsumed: false,
    liveEvidenceCollected: false,
    artifactFingerprint,
    blockingReasons: [...new Set(blockingReasons)].sort(),
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function validateKnownKeys(
  value: unknown,
  keys: readonly string[],
  path: string,
  blockingReasons: string[],
): void {
  if (!isPlainObject(value)) return;
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) blockingReasons.push(`unknown_field:${path}.${key}`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function parseIso(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
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
    return /count|operations|applied|created|invocations|sessions/i.test(path[path.length - 1] ?? "") &&
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
    return /access[_ -]?token|refresh[_ -]?token|personal access token|service[_ -]?role|anon[_ -]?key|database[_ -]?password|connection[_ -]?string|authorization:\s*bearer|bearer\s+[a-z0-9._-]+|private key|client[_ -]?secret|cookie|session|bankid|rawEnvironment|\/Users\/|\/home\/|postgres(?:ql)?:\/\//i.test(value);
  }
  if (Array.isArray(value)) return value.some((item) => containsCredentialMaterial(item, seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) =>
    /accessToken|refreshToken|serviceRoleKey|anonKey|databasePassword|connectionString|authorizationHeader|privateKey|clientSecret|cookie(Value|Secret|Token)?|session(Token|Cookie|Secret|Value)|BankID|rawEnvironment|personalPath/i.test(key) ||
    containsCredentialMaterial(nested, seen),
  );
}

function containsUnexpectedProductionReference(value: unknown, path: readonly string[] = [], seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    return value.includes(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) &&
      path.join(".") !== "projectBinding.rejectedProductionProjectRef";
  }
  if (Array.isArray(value)) return value.some((item, index) => containsUnexpectedProductionReference(item, [...path, String(index)], seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) => containsUnexpectedProductionReference(nested, [...path, key], seen));
}
