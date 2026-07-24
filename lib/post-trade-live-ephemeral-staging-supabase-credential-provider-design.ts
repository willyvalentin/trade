import { createHash } from "node:crypto";

import {
  buildCredentialProviderRegistry,
  buildCredentialRequiredOperationSubset,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID,
} from "@/lib/post-trade-first-live-read-only-preflight-credential-provider-core";
import {
  buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
} from "@/lib/post-trade-first-live-read-only-preflight-authorization-artifact-core";
import {
  buildCredentialBoundaryRequirements,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLEANUP_REQUIREMENT_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
} from "@/lib/post-trade-first-live-read-only-preflight-execution-boundary-contract";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_ID =
  "post_trade_live_ephemeral_staging_supabase_credential_provider_design_001" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_VERSION =
  "post_trade_live_ephemeral_staging_supabase_credential_provider_design_v1" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID =
  "reviewed_macos_keychain_ephemeral_staging_supabase_source_v1" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_OS_SOURCE_ID =
  "reviewed_os_credential_adapter_ephemeral_staging_supabase_source_v1" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CI_SOURCE_ID =
  "reviewed_ci_ephemeral_staging_supabase_source_v1" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_REQUEST_ID =
  "post_trade_first_live_read_only_staging_preflight_credential_resolution_request_001" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID =
  "post_trade_first_live_read_only_staging_preflight_ephemeral_lease_001" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_HANDOFF_ID =
  "post_trade_first_live_read_only_staging_preflight_one_operation_handoff_001" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PROCESS_POLICY_ID =
  "post_trade_first_live_read_only_staging_preflight_process_executor_policy_v1" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_SOURCE_ADAPTER_VERSION =
  "post_trade_live_ephemeral_staging_supabase_source_adapter_v1" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CLEANUP_POLICY_VERSION =
  "post_trade_live_ephemeral_staging_supabase_cleanup_policy_v1" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LIFECYCLE_POLICY_VERSION =
  "post_trade_live_ephemeral_staging_supabase_lifecycle_policy_v1" as const;
export const POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_INJECTION_POLICY_VERSION =
  "post_trade_live_ephemeral_staging_supabase_injection_policy_v1" as const;

export type ValidationResult = { valid: boolean; blockingReasons: string[] };

export type CredentialSourceIdentity =
  | typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID
  | typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_OS_SOURCE_ID
  | typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CI_SOURCE_ID;

export type CredentialResolutionResultClassification =
  | "credential_lease_resolved"
  | "credential_source_unavailable"
  | "credential_source_blocked"
  | "credential_source_invalid"
  | "credential_source_expired"
  | "credential_source_revoked"
  | "credential_source_ambiguous";

export type LeaseLifecycleState =
  | "not_requested"
  | "resolution_requested"
  | "resolved"
  | "leased"
  | "in_use"
  | "cleanup_required"
  | "cleanup_requested"
  | "cleanup_confirmed"
  | "cleanup_failed"
  | "cleanup_ambiguous"
  | "expired"
  | "revoked"
  | "invalid";

export type AuthenticationEvidenceClassification =
  | "non_interactive_authentication_accepted"
  | "authentication_rejected"
  | "authentication_missing"
  | "authentication_prompt_detected"
  | "authentication_scope_mismatch"
  | "authentication_ambiguous";

export type SourceAvailabilityClassification = "structurally_available" | "unavailable" | "blocked" | "invalid" | "ambiguous";

export type CredentialSourceRegistry = {
  registryId: "post_trade_live_ephemeral_staging_supabase_source_registry_001";
  preferredSourceIdentity: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID;
  acceptedSourceIdentities: readonly CredentialSourceIdentity[];
  rejectedSourceIdentities: readonly string[];
  requiresReviewedSourceAdapter: true;
  requiresStagingOnly: true;
  requiresNonInteractive: true;
  requiresSingleOperationLease: true;
  requiresCleanupCapability: true;
  rejectsAlreadyAuthenticatedCliContextByDefault: true;
  cliContextAcceptedOnlyIfSeparatelyProven: true;
  registryFingerprintAlgorithm: "sha256";
  registryFingerprint: string;
};

export type CredentialResolutionRequest = {
  requestId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_REQUEST_ID;
  providerIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  sourceIdentity: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID;
  providerDesignVersion: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_VERSION;
  opaqueBoundaryVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION;
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  authorizationArtifactFingerprint: string;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  preflightOperationId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  credentialPurpose: "read_only_staging_supabase_preflight_metadata";
  allowedOperationIdentity: string;
  secretSlotId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID;
  requestedAtIso: "2026-07-15T09:00:00.000Z";
  expiresAtIso: "2026-07-15T09:05:00.000Z";
  singleOperation: true;
  singleSession: true;
  nonInteractive: true;
  browserAuthAllowed: false;
  deviceCodeAllowed: false;
  commandArgumentAllowed: false;
  serializationAllowed: false;
  loggingAllowed: false;
  cleanupRequired: true;
  retryAllowed: false;
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
};

export type CredentialResolutionResult = {
  requestId: CredentialResolutionRequest["requestId"];
  opaqueLeaseId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID;
  opaqueHandleId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID;
  sourceIdentity: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  resolvedAtIso: "2026-07-15T09:00:10.000Z";
  expiresAtIso: CredentialResolutionRequest["expiresAtIso"];
  revocationClassification: "not_revoked";
  leaseState: "leased";
  singleUseConfirmed: true;
  sourceBindingClassification: "staging_only_source_binding";
  authenticationSuccessClaimed: false;
  resultClassification: CredentialResolutionResultClassification;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
};

export type PrivateLeasePolicy = {
  policyId: "post_trade_live_ephemeral_staging_supabase_private_lease_policy_001";
  leaseId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID;
  nonSerializable: true;
  nonCloneableWherePractical: true;
  jsonRepresentationAllowed: false;
  stringCoercionAllowed: false;
  inspectionOutputAllowed: false;
  loggingAllowed: false;
  fingerprintingSecretAllowed: false;
  persistenceAllowed: false;
  globalCacheAllowed: false;
  moduleGlobalStorageAllowed: false;
  browserLocalPersistenceAllowed: false;
  filesystemStorageAllowed: false;
  databaseStorageAllowed: false;
  boundOperationIdentity: string;
  boundBoundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  boundStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  shortLived: true;
  invalidAfterFirstUse: true;
  invalidAfterTimeout: true;
  invalidAfterParserFailure: true;
  invalidAfterPromptDetection: true;
  invalidAfterSecretDetection: true;
  invalidAfterAuthenticationRejection: true;
  invalidAfterCleanupAmbiguity: true;
  invalidAfterProcessAmbiguity: true;
  noSecondLeaseFromResolutionResult: true;
  retryAllowed: false;
  cryptographicZeroizationClaimed: false;
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
};

export type CredentialInjectionPolicy = {
  policyId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_INJECTION_POLICY_VERSION;
  leaseId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID;
  operationIdentity: string;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  secretSlotId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID;
  processInvocationCount: 1;
  boundarySessionCount: 1;
  directProcessEnvironmentOnlyThroughReviewedExecutor: true;
  shellAllowed: false;
  commandLineArgumentAllowed: false;
  urlCredentialAllowed: false;
  stdinAllowed: false;
  configFileAllowed: false;
  inheritedEnvironmentAllowed: false;
  gitOperationAllowed: false;
  catalogAdapterAllowed: false;
  productionProjectAllowed: false;
  secondOperationAllowed: false;
  retryAllowed: false;
  actualCredentialEnvironmentNameAbsent: true;
  injectionFingerprintAlgorithm: "sha256";
  injectionFingerprint: string;
};

export type CleanupPolicy = {
  policyId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CLEANUP_POLICY_VERSION;
  cleanupAfterSuccess: true;
  cleanupAfterProcessFailure: true;
  cleanupAfterTimeout: true;
  cleanupAfterOutputOverflow: true;
  cleanupAfterParserFailure: true;
  cleanupAfterPromptDetection: true;
  cleanupAfterAuthenticationRejection: true;
  cleanupAfterSecretDetection: true;
  cleanupAfterUnexpectedChildProcess: true;
  cleanupAfterTerminationAmbiguity: true;
  invalidatesLease: true;
  removesSecretFromEnvironmentBuilder: true;
  dropsInternalReferences: true;
  overwritesMutableBuffersWherePractical: true;
  clearsSecretSlot: true;
  preventsProviderReuse: true;
  invalidatesBoundarySessionAfterAmbiguity: true;
  callerAssertionAccepted: false;
  provesMemoryZeroization: false;
  cleanupFingerprintAlgorithm: "sha256";
  cleanupFingerprint: string;
};

export type SourceAvailabilityEvidence = {
  sourceIdentity: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID;
  providerIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  requestId: CredentialResolutionRequest["requestId"];
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  availabilityClassification: SourceAvailabilityClassification;
  nonInteractiveCapability: true;
  stagingBindingCapability: true;
  singleOperationCapability: true;
  cleanupCapability: true;
  credentialValidityClaimed: false;
  observedAtIso: "2026-07-15T09:00:00.000Z";
  expiresAtIso: CredentialResolutionRequest["expiresAtIso"];
  resultClassification: "source_structurally_available";
  availabilityFingerprintAlgorithm: "sha256";
  availabilityFingerprint: string;
};

export type AuthenticationEvidence = {
  operationIdentity: string;
  leaseId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID;
  providerIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  sourceIdentity: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  processResultIdentity: "future_process_result_identity_not_collected";
  authenticationInteractionClassification: "non_interactive_no_prompt_observed";
  nonInteractiveConfirmed: true;
  noPromptConfirmed: true;
  noBrowserConfirmed: true;
  tokenValidityClaimed: false;
  resultClassification: AuthenticationEvidenceClassification;
  observedAtIso: "2026-07-15T09:00:30.000Z";
  authEvidenceFingerprintAlgorithm: "sha256";
  authEvidenceFingerprint: string;
};

export type CapabilityHandoffMetadata = {
  handoffId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_HANDOFF_ID;
  leaseId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID;
  operationIdentity: string;
  processPolicyIdentity: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PROCESS_POLICY_ID;
  environmentPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  oneUse: true;
  cleanupRequired: true;
  secretExportAllowed: false;
  genericCallbackAllowed: false;
  resultClassification: "opaque_one_operation_handoff_metadata_only";
  handoffFingerprintAlgorithm: "sha256";
  handoffFingerprint: string;
};

export type ProviderImplementationDesign = {
  designId: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_ID;
  providerIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  preferredSourceIdentity: typeof POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  sourceRegistry: CredentialSourceRegistry;
  request: CredentialResolutionRequest;
  resolutionResult: CredentialResolutionResult;
  privateLeasePolicy: PrivateLeasePolicy;
  injectionPolicy: CredentialInjectionPolicy;
  cleanupPolicy: CleanupPolicy;
  sourceAvailabilityEvidence: SourceAvailabilityEvidence;
  authenticationEvidence: AuthenticationEvidence;
  handoffMetadata: CapabilityHandoffMetadata;
  designFingerprintAlgorithm: "sha256";
  designFingerprint: string;
};

export function buildCredentialSourceRegistry(): CredentialSourceRegistry {
  const core = {
    registryId: "post_trade_live_ephemeral_staging_supabase_source_registry_001",
    preferredSourceIdentity: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
    acceptedSourceIdentities: [
      POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
      POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_OS_SOURCE_ID,
      POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CI_SOURCE_ID,
    ],
    rejectedSourceIdentities: [
      "raw_environment",
      "dotenv",
      "process_environment",
      "source_control",
      "pasted_token",
      "command_argument",
      "url_embedded",
      "browser_auth",
      "device_code",
      "interactive_login",
      "keychain_generic",
      "keychain_caller_selected",
      "os_credential_caller_selected",
      "ci_secret_unreviewed",
      "cli_authenticated_context_unproven",
      "credential_helper",
      "gui_auth",
      "url_opener",
      "mfa_prompt",
      "credential_prompt",
      "token_prompt",
      "project_link_prompt",
      "confirmation_prompt",
      "shared_global_auth",
      "globally_shared_credential",
      "production_credential",
      "generic",
      "unknown",
    ],
    requiresReviewedSourceAdapter: true,
    requiresStagingOnly: true,
    requiresNonInteractive: true,
    requiresSingleOperationLease: true,
    requiresCleanupCapability: true,
    rejectsAlreadyAuthenticatedCliContextByDefault: true,
    cliContextAcceptedOnlyIfSeparatelyProven: true,
  } satisfies Omit<CredentialSourceRegistry, "registryFingerprintAlgorithm" | "registryFingerprint">;
  return { ...core, registryFingerprintAlgorithm: "sha256", registryFingerprint: buildSourceRegistryFingerprint(core) };
}

export function buildCredentialResolutionRequest(operationIdentity = buildCredentialRequiredOperationSubset()[0] ?? ""): CredentialResolutionRequest {
  const artifact = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();
  const core = {
    requestId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_REQUEST_ID,
    providerIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    sourceIdentity: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
    providerDesignVersion: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_VERSION,
    opaqueBoundaryVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION,
    authorizationArtifactId: artifact.authorizationArtifactId,
    authorizationArtifactFingerprint: artifact.artifactFingerprint,
    preflightRunId: artifact.preflightRunId,
    preflightOperationId: artifact.preflightOperationId,
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    credentialPurpose: "read_only_staging_supabase_preflight_metadata",
    allowedOperationIdentity: operationIdentity,
    secretSlotId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID,
    requestedAtIso: "2026-07-15T09:00:00.000Z",
    expiresAtIso: "2026-07-15T09:05:00.000Z",
    singleOperation: true,
    singleSession: true,
    nonInteractive: true,
    browserAuthAllowed: false,
    deviceCodeAllowed: false,
    commandArgumentAllowed: false,
    serializationAllowed: false,
    loggingAllowed: false,
    cleanupRequired: true,
    retryAllowed: false,
  } satisfies Omit<CredentialResolutionRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return { ...core, requestFingerprintAlgorithm: "sha256", requestFingerprint: buildResolutionRequestFingerprint(core) };
}

export function buildCredentialResolutionResult(classification: CredentialResolutionResultClassification = "credential_lease_resolved"): CredentialResolutionResult {
  const core = {
    requestId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_REQUEST_ID,
    opaqueLeaseId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID,
    opaqueHandleId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID,
    sourceIdentity: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    resolvedAtIso: "2026-07-15T09:00:10.000Z",
    expiresAtIso: "2026-07-15T09:05:00.000Z",
    revocationClassification: "not_revoked",
    leaseState: "leased",
    singleUseConfirmed: true,
    sourceBindingClassification: "staging_only_source_binding",
    authenticationSuccessClaimed: false,
    resultClassification: classification,
  } satisfies Omit<CredentialResolutionResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return { ...core, resultFingerprintAlgorithm: "sha256", resultFingerprint: buildResolutionResultFingerprint(core) };
}

export function buildPrivateLeasePolicy(operationIdentity = buildCredentialRequiredOperationSubset()[0] ?? ""): PrivateLeasePolicy {
  const core = {
    policyId: "post_trade_live_ephemeral_staging_supabase_private_lease_policy_001",
    leaseId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID,
    nonSerializable: true,
    nonCloneableWherePractical: true,
    jsonRepresentationAllowed: false,
    stringCoercionAllowed: false,
    inspectionOutputAllowed: false,
    loggingAllowed: false,
    fingerprintingSecretAllowed: false,
    persistenceAllowed: false,
    globalCacheAllowed: false,
    moduleGlobalStorageAllowed: false,
    browserLocalPersistenceAllowed: false,
    filesystemStorageAllowed: false,
    databaseStorageAllowed: false,
    boundOperationIdentity: operationIdentity,
    boundBoundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    boundStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    shortLived: true,
    invalidAfterFirstUse: true,
    invalidAfterTimeout: true,
    invalidAfterParserFailure: true,
    invalidAfterPromptDetection: true,
    invalidAfterSecretDetection: true,
    invalidAfterAuthenticationRejection: true,
    invalidAfterCleanupAmbiguity: true,
    invalidAfterProcessAmbiguity: true,
    noSecondLeaseFromResolutionResult: true,
    retryAllowed: false,
    cryptographicZeroizationClaimed: false,
  } satisfies Omit<PrivateLeasePolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return { ...core, policyFingerprintAlgorithm: "sha256", policyFingerprint: buildPrivateLeasePolicyFingerprint(core) };
}

export function buildCredentialInjectionPolicy(operationIdentity = buildCredentialRequiredOperationSubset()[0] ?? ""): CredentialInjectionPolicy {
  const core = {
    policyId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_INJECTION_POLICY_VERSION,
    leaseId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID,
    operationIdentity,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    secretSlotId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID,
    processInvocationCount: 1,
    boundarySessionCount: 1,
    directProcessEnvironmentOnlyThroughReviewedExecutor: true,
    shellAllowed: false,
    commandLineArgumentAllowed: false,
    urlCredentialAllowed: false,
    stdinAllowed: false,
    configFileAllowed: false,
    inheritedEnvironmentAllowed: false,
    gitOperationAllowed: false,
    catalogAdapterAllowed: false,
    productionProjectAllowed: false,
    secondOperationAllowed: false,
    retryAllowed: false,
    actualCredentialEnvironmentNameAbsent: true,
  } satisfies Omit<CredentialInjectionPolicy, "injectionFingerprintAlgorithm" | "injectionFingerprint">;
  return { ...core, injectionFingerprintAlgorithm: "sha256", injectionFingerprint: buildInjectionPolicyFingerprint(core) };
}

export function buildCleanupPolicy(): CleanupPolicy {
  const core = {
    policyId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CLEANUP_POLICY_VERSION,
    cleanupAfterSuccess: true,
    cleanupAfterProcessFailure: true,
    cleanupAfterTimeout: true,
    cleanupAfterOutputOverflow: true,
    cleanupAfterParserFailure: true,
    cleanupAfterPromptDetection: true,
    cleanupAfterAuthenticationRejection: true,
    cleanupAfterSecretDetection: true,
    cleanupAfterUnexpectedChildProcess: true,
    cleanupAfterTerminationAmbiguity: true,
    invalidatesLease: true,
    removesSecretFromEnvironmentBuilder: true,
    dropsInternalReferences: true,
    overwritesMutableBuffersWherePractical: true,
    clearsSecretSlot: true,
    preventsProviderReuse: true,
    invalidatesBoundarySessionAfterAmbiguity: true,
    callerAssertionAccepted: false,
    provesMemoryZeroization: false,
  } satisfies Omit<CleanupPolicy, "cleanupFingerprintAlgorithm" | "cleanupFingerprint">;
  return { ...core, cleanupFingerprintAlgorithm: "sha256", cleanupFingerprint: buildCleanupPolicyFingerprint(core) };
}

export function buildSourceAvailabilityEvidence(classification: SourceAvailabilityClassification = "structurally_available"): SourceAvailabilityEvidence {
  const core = {
    sourceIdentity: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
    providerIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    requestId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_REQUEST_ID,
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    availabilityClassification: classification,
    nonInteractiveCapability: true,
    stagingBindingCapability: true,
    singleOperationCapability: true,
    cleanupCapability: true,
    credentialValidityClaimed: false,
    observedAtIso: "2026-07-15T09:00:00.000Z",
    expiresAtIso: "2026-07-15T09:05:00.000Z",
    resultClassification: "source_structurally_available",
  } satisfies Omit<SourceAvailabilityEvidence, "availabilityFingerprintAlgorithm" | "availabilityFingerprint">;
  return { ...core, availabilityFingerprintAlgorithm: "sha256", availabilityFingerprint: buildSourceAvailabilityEvidenceFingerprint(core) };
}

export function buildAuthenticationEvidence(classification: AuthenticationEvidenceClassification = "non_interactive_authentication_accepted"): AuthenticationEvidence {
  const core = {
    operationIdentity: buildCredentialRequiredOperationSubset()[0] ?? "",
    leaseId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID,
    providerIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    sourceIdentity: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    processResultIdentity: "future_process_result_identity_not_collected",
    authenticationInteractionClassification: "non_interactive_no_prompt_observed",
    nonInteractiveConfirmed: true,
    noPromptConfirmed: true,
    noBrowserConfirmed: true,
    tokenValidityClaimed: false,
    resultClassification: classification,
    observedAtIso: "2026-07-15T09:00:30.000Z",
  } satisfies Omit<AuthenticationEvidence, "authEvidenceFingerprintAlgorithm" | "authEvidenceFingerprint">;
  return { ...core, authEvidenceFingerprintAlgorithm: "sha256", authEvidenceFingerprint: buildAuthenticationEvidenceFingerprint(core) };
}

export function buildCapabilityHandoffMetadata(operationIdentity = buildCredentialRequiredOperationSubset()[0] ?? ""): CapabilityHandoffMetadata {
  const core = {
    handoffId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_HANDOFF_ID,
    leaseId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LEASE_ID,
    operationIdentity,
    processPolicyIdentity: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PROCESS_POLICY_ID,
    environmentPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID,
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    oneUse: true,
    cleanupRequired: true,
    secretExportAllowed: false,
    genericCallbackAllowed: false,
    resultClassification: "opaque_one_operation_handoff_metadata_only",
  } satisfies Omit<CapabilityHandoffMetadata, "handoffFingerprintAlgorithm" | "handoffFingerprint">;
  return { ...core, handoffFingerprintAlgorithm: "sha256", handoffFingerprint: buildCapabilityHandoffFingerprint(core) };
}

export function buildProviderImplementationDesign(): ProviderImplementationDesign {
  const core = {
    designId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_ID,
    providerIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    preferredSourceIdentity: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    sourceRegistry: buildCredentialSourceRegistry(),
    request: buildCredentialResolutionRequest(),
    resolutionResult: buildCredentialResolutionResult(),
    privateLeasePolicy: buildPrivateLeasePolicy(),
    injectionPolicy: buildCredentialInjectionPolicy(),
    cleanupPolicy: buildCleanupPolicy(),
    sourceAvailabilityEvidence: buildSourceAvailabilityEvidence(),
    authenticationEvidence: buildAuthenticationEvidence(),
    handoffMetadata: buildCapabilityHandoffMetadata(),
  } satisfies Omit<ProviderImplementationDesign, "designFingerprintAlgorithm" | "designFingerprint">;
  return { ...core, designFingerprintAlgorithm: "sha256", designFingerprint: buildProviderDesignFingerprint(core) };
}

export function buildLeaseLifecyclePolicy() {
  const core = {
    policyId: POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_LIFECYCLE_POLICY_VERSION,
    initialState: "not_requested" as const,
    terminalStates: ["cleanup_confirmed", "cleanup_failed", "cleanup_ambiguous", "expired", "revoked", "invalid"] as const,
    allowedTransitions: [
      ["not_requested", "resolution_requested"],
      ["resolution_requested", "resolved"],
      ["resolved", "leased"],
      ["leased", "in_use"],
      ["in_use", "cleanup_required"],
      ["cleanup_required", "cleanup_requested"],
      ["cleanup_requested", "cleanup_confirmed"],
      ["resolution_requested", "invalid"],
      ["resolution_requested", "expired"],
      ["resolution_requested", "revoked"],
      ["in_use", "cleanup_failed"],
      ["in_use", "cleanup_ambiguous"],
      ["in_use", "expired"],
      ["in_use", "revoked"],
      ["in_use", "invalid"],
    ] as const,
    rejectedTransitions: [
      ["resolved", "cleanup_confirmed"],
      ["resolved", "resolved"],
      ["resolved", "in_use"],
      ["leased", "leased"],
      ["in_use", "in_use"],
      ["cleanup_confirmed", "resolved"],
      ["cleanup_confirmed", "leased"],
      ["cleanup_confirmed", "in_use"],
      ["cleanup_failed", "resolved"],
      ["cleanup_failed", "leased"],
      ["cleanup_failed", "in_use"],
      ["cleanup_ambiguous", "leased"],
      ["cleanup_ambiguous", "in_use"],
      ["expired", "resolved"],
      ["expired", "leased"],
      ["revoked", "resolved"],
      ["revoked", "leased"],
      ["revoked", "in_use"],
      ["invalid", "resolved"],
      ["invalid", "leased"],
      ["invalid", "in_use"],
    ] as const,
    secondUseAllowed: false,
    rollbackAfterCleanupAllowed: false,
    lifecycleFingerprintAlgorithm: "sha256" as const,
  };
  return { ...core, lifecycleFingerprint: buildLifecyclePolicyFingerprint(core) };
}

export function buildInertLiveProviderImplementationPlan() {
  return {
    planStatus: "inert_live_provider_implementation_design_only",
    containsCredential: false,
    containsEnvironmentValue: false,
    containsCommand: false,
    containsSql: false,
    containsDeployment: false,
    containsAutomaticReattempt: false,
    accessesSource: false,
    accessesCredential: false,
    invokesProvider: false,
    authenticates: false,
    spawnsProcess: false,
    steps: [
      "validate_provider_implementation_design",
      "validate_opaque_boundary_compatibility",
      "validate_execution_boundary_compatibility",
      "validate_authorization_compatibility",
      "verify_exact_source_adapter_version",
      "verify_structural_source_availability",
      "create_one_credential_resolution_request",
      "require_final_live_credential_access_gate",
      "resolve_one_private_ephemeral_lease_in_future_action",
      "handoff_one_operation_capability_to_process_executor",
      "run_one_read_only_supabase_operation_in_future_action",
      "collect_non_secret_authentication_evidence",
      "clean_up_lease",
      "verify_cleanup_evidence",
      "invalidate_lease",
      "stop_without_deployment",
    ],
  } as const;
}

export function validateCredentialSourceRegistry(input: unknown): ValidationResult {
  return validateExact(input, buildCredentialSourceRegistry(), "sourceRegistry", buildSourceRegistryFingerprint, "registryFingerprint", "registryFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
}

export function validateCredentialResolutionRequest(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCredentialResolutionRequest(), "resolutionRequest", buildResolutionRequestFingerprint, "requestFingerprint", "requestFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<CredentialResolutionRequest> & { allowedOperationIdentities?: unknown };
  if (!buildCredentialRequiredOperationSubset().includes(String(item.allowedOperationIdentity))) reasons.push("operation_not_credential_required");
  if (Array.isArray(item.allowedOperationIdentities) || typeof item.allowedOperationIdentities !== "undefined") reasons.push("multiple_operation_identity_shape");
  if (item.retryAllowed !== false) reasons.push("retry_allowed");
  if (item.browserAuthAllowed || item.deviceCodeAllowed || item.commandArgumentAllowed) reasons.push("interactive_or_argument_auth_allowed");
  return result(reasons);
}

export function validateCredentialResolutionResult(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCredentialResolutionResult(), "resolutionResult", buildResolutionResultFingerprint, "resultFingerprint", "resultFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<CredentialResolutionResult>;
  if (item.authenticationSuccessClaimed !== false) reasons.push("authentication_success_claimed");
  if (item.resultClassification !== "credential_lease_resolved") reasons.push("credential_lease_not_resolved");
  return result(reasons);
}

export function validatePrivateLeasePolicy(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildPrivateLeasePolicy(), "privateLeasePolicy", buildPrivateLeasePolicyFingerprint, "policyFingerprint", "policyFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<PrivateLeasePolicy>;
  if (item.cryptographicZeroizationClaimed !== false) reasons.push("zeroization_claimed");
  if (item.globalCacheAllowed || item.persistenceAllowed || item.filesystemStorageAllowed || item.databaseStorageAllowed) reasons.push("lease_storage_allowed");
  if (item.invalidAfterSecretDetection !== true || item.invalidAfterAuthenticationRejection !== true) reasons.push("secret_or_auth_rejection_does_not_invalidate");
  if (item.noSecondLeaseFromResolutionResult !== true || item.retryAllowed !== false) reasons.push("second_lease_or_retry_allowed");
  return result(reasons);
}

export function validateCredentialInjectionPolicy(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCredentialInjectionPolicy(), "injectionPolicy", buildInjectionPolicyFingerprint, "injectionFingerprint", "injectionFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<CredentialInjectionPolicy>;
  if (!buildCredentialRequiredOperationSubset().includes(String(item.operationIdentity))) reasons.push("operation_not_credential_required");
  if (
    item.shellAllowed ||
    item.commandLineArgumentAllowed ||
    item.urlCredentialAllowed ||
    item.stdinAllowed ||
    item.configFileAllowed ||
    item.inheritedEnvironmentAllowed ||
    item.gitOperationAllowed ||
    item.catalogAdapterAllowed ||
    item.productionProjectAllowed
  ) {
    reasons.push("unsafe_injection_path_allowed");
  }
  if (item.secondOperationAllowed || item.retryAllowed) reasons.push("second_use_or_retry_allowed");
  return result(reasons);
}

export function validateCleanupPolicy(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCleanupPolicy(), "cleanupPolicy", buildCleanupPolicyFingerprint, "cleanupFingerprint", "cleanupFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<CleanupPolicy>;
  if (item.provesMemoryZeroization !== false) reasons.push("zeroization_claimed");
  if (item.callerAssertionAccepted !== false) reasons.push("caller_cleanup_assertion_allowed");
  return result(reasons);
}

export function validateSourceAvailabilityEvidence(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildSourceAvailabilityEvidence(), "sourceAvailability", buildSourceAvailabilityEvidenceFingerprint, "availabilityFingerprint", "availabilityFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<SourceAvailabilityEvidence>;
  if (item.credentialValidityClaimed !== false) reasons.push("credential_validity_claimed");
  if (item.availabilityClassification !== "structurally_available") reasons.push("source_not_structurally_available");
  return result(reasons);
}

export function validateAuthenticationEvidence(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildAuthenticationEvidence(), "authenticationEvidence", buildAuthenticationEvidenceFingerprint, "authEvidenceFingerprint", "authEvidenceFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<AuthenticationEvidence>;
  if (item.tokenValidityClaimed !== false) reasons.push("token_validity_claimed");
  if (item.resultClassification !== "non_interactive_authentication_accepted") reasons.push("authentication_not_non_interactive_accepted");
  return result(reasons);
}

export function validateCapabilityHandoffMetadata(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCapabilityHandoffMetadata(), "capabilityHandoff", buildCapabilityHandoffFingerprint, "handoffFingerprint", "handoffFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<CapabilityHandoffMetadata>;
  if (item.secretExportAllowed !== false || item.genericCallbackAllowed !== false) reasons.push("secret_export_or_generic_callback_allowed");
  if (item.oneUse !== true || item.cleanupRequired !== true) reasons.push("handoff_not_one_use_or_cleanup_required");
  return result(reasons);
}

export function validateProviderImplementationDesign(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildProviderImplementationDesign(), "providerDesign", buildProviderDesignFingerprint, "designFingerprint", "designFingerprintAlgorithm", {
    skipSensitiveScan: true,
  });
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<ProviderImplementationDesign>;
  if (item.sourceRegistry) reasons.push(...validateCredentialSourceRegistry(item.sourceRegistry).blockingReasons.map((reason) => `sourceRegistry:${reason}`));
  if (item.request) reasons.push(...validateCredentialResolutionRequest(item.request).blockingReasons.map((reason) => `request:${reason}`));
  if (item.resolutionResult) reasons.push(...validateCredentialResolutionResult(item.resolutionResult).blockingReasons.map((reason) => `result:${reason}`));
  if (item.privateLeasePolicy) reasons.push(...validatePrivateLeasePolicy(item.privateLeasePolicy).blockingReasons.map((reason) => `lease:${reason}`));
  if (item.injectionPolicy) reasons.push(...validateCredentialInjectionPolicy(item.injectionPolicy).blockingReasons.map((reason) => `injection:${reason}`));
  if (item.cleanupPolicy) reasons.push(...validateCleanupPolicy(item.cleanupPolicy).blockingReasons.map((reason) => `cleanup:${reason}`));
  if (item.sourceAvailabilityEvidence) reasons.push(...validateSourceAvailabilityEvidence(item.sourceAvailabilityEvidence).blockingReasons.map((reason) => `availability:${reason}`));
  if (item.authenticationEvidence) reasons.push(...validateAuthenticationEvidence(item.authenticationEvidence).blockingReasons.map((reason) => `auth:${reason}`));
  if (item.handoffMetadata) reasons.push(...validateCapabilityHandoffMetadata(item.handoffMetadata).blockingReasons.map((reason) => `handoff:${reason}`));
  return result(reasons);
}

export function validateLeaseLifecycleTransition(from: LeaseLifecycleState, to: LeaseLifecycleState): ValidationResult {
  const policy = buildLeaseLifecyclePolicy();
  const allowed = policy.allowedTransitions.some(([left, right]) => left === from && right === to);
  const rejected = policy.rejectedTransitions.some(([left, right]) => left === from && right === to);
  return result(allowed && !rejected ? [] : ["lease_lifecycle_transition_rejected"]);
}

export function validateProviderDesignCompatibility(input = buildProviderImplementationDesign()): ValidationResult {
  const reasons = [
    ...validateProviderImplementationDesign(input).blockingReasons,
    ...validateOpaqueBoundaryCompatibility(input).blockingReasons,
    ...validateExecutionBoundaryCompatibility(input).blockingReasons,
    ...validateAuthorizationCompatibility(input).blockingReasons,
    ...validateRunnerPlanCompatibility(input).blockingReasons,
  ];
  return result(reasons);
}

export function validateOpaqueBoundaryCompatibility(input = buildProviderImplementationDesign()): ValidationResult {
  const registry = buildCredentialProviderRegistry();
  const reasons: string[] = [];
  if (input.providerIdentity !== registry.preferredProviderIdentity) reasons.push("provider_identity_mismatch");
  if (input.request.opaqueBoundaryVersion !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION) reasons.push("opaque_boundary_version_mismatch");
  if (input.request.secretSlotId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID) reasons.push("secret_slot_mismatch");
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_CONTRACT_VERSION !== "post_trade_first_live_read_only_staging_preflight_opaque_secret_slot_contract_v1") reasons.push("secret_slot_contract_mismatch");
  return result(reasons);
}

export function validateExecutionBoundaryCompatibility(input = buildProviderImplementationDesign()): ValidationResult {
  const requirements = buildCredentialBoundaryRequirements();
  const reasons: string[] = [];
  if (input.providerIdentity !== requirements.credentialProviderRecommendation) reasons.push("execution_provider_mismatch");
  if (!same([input.request.allowedOperationIdentity], [requirements.allowedCommandOperationIdentities[0]])) reasons.push("execution_operation_subset_mismatch");
  if (input.handoffMetadata.environmentPolicyIdentity !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID) reasons.push("environment_policy_mismatch");
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLEANUP_REQUIREMENT_ID !== "post_trade_first_live_read_only_staging_preflight_credential_cleanup_required_v1") reasons.push("cleanup_policy_mismatch");
  return result(reasons);
}

export function validateAuthorizationCompatibility(input = buildProviderImplementationDesign()): ValidationResult {
  const artifact = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();
  const reasons: string[] = [];
  if (input.request.authorizationArtifactId !== artifact.authorizationArtifactId) reasons.push("authorization_id_mismatch");
  if (input.request.authorizationArtifactFingerprint !== artifact.artifactFingerprint) reasons.push("authorization_fingerprint_mismatch");
  if (input.request.preflightRunId !== artifact.preflightRunId) reasons.push("authorization_run_mismatch");
  if (input.request.preflightOperationId !== artifact.preflightOperationId) reasons.push("authorization_operation_mismatch");
  if (artifact.expectedCounts.deploymentOperations !== 0 || artifact.expectedCounts.sqlOperations !== 0 || artifact.expectedCounts.mutationOperations !== 0) reasons.push("authorization_mutation_scope_nonzero");
  if (artifact.automaticRetryAllowed !== false || artifact.oneShot !== true) reasons.push("authorization_retry_or_one_shot_mismatch");
  return result(reasons);
}

export function validateRunnerPlanCompatibility(input = buildProviderImplementationDesign()): ValidationResult {
  const reasons: string[] = [];
  if (input.targetStagingProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) reasons.push("runner_staging_project_mismatch");
  if (input.request.singleOperation !== true || input.request.singleSession !== true) reasons.push("runner_single_operation_or_session_mismatch");
  if (input.request.retryAllowed !== false) reasons.push("runner_retry_allowed");
  if (input.injectionPolicy.operationIdentity !== input.request.allowedOperationIdentity) reasons.push("runner_injection_operation_mismatch");
  return result(reasons);
}

export function buildSourceRegistryFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildResolutionRequestFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildResolutionResultFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildPrivateLeasePolicyFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildLifecyclePolicyFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildInjectionPolicyFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildCleanupPolicyFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildSourceAvailabilityEvidenceFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildAuthenticationEvidenceFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildCapabilityHandoffFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildProviderDesignFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

function validateExact(
  input: unknown,
  canonical: unknown,
  label: string,
  builder: (input: unknown) => string,
  fingerprintKey: string,
  algorithmKey: string,
  options: { skipSensitiveScan?: boolean } = {},
): ValidationResult {
  return result(validateExactReasons(input, canonical, label, builder, fingerprintKey, algorithmKey, options));
}

function validateExactReasons(
  input: unknown,
  canonical: unknown,
  label: string,
  builder: (input: unknown) => string,
  fingerprintKey: string,
  algorithmKey: string,
  options: { skipSensitiveScan?: boolean } = {},
): string[] {
  const reasons: string[] = [];
  if (!isPlainObject(input)) return [`${label}_not_object`];
  if (containsUnsupportedValue(input)) reasons.push("unsupported_nested_value");
  if (hasCycle(input)) reasons.push("cyclic_input");
  if (!options.skipSensitiveScan && containsSensitiveMaterial(input)) reasons.push("credential_or_secret_material_present");
  if (containsUnexpectedProductionReference(input)) reasons.push("unexpected_production_reference");
  if (containsExcessiveString(input)) reasons.push("excessive_or_empty_string");
  if (containsUnsupportedValue(input) || hasCycle(input)) return [...new Set(reasons)].sort();
  if (stableStringify(input) !== stableStringify(canonical)) reasons.push(`${label}_canonical_mismatch`);
  checkFingerprint(input as Record<string, unknown>, fingerprintKey, algorithmKey, builder, reasons);
  return [...new Set(reasons)].sort();
}

function checkFingerprint(input: Record<string, unknown>, fingerprintKey: string, algorithmKey: string, builder: (input: unknown) => string, reasons: string[]): void {
  const fingerprint = input[fingerprintKey];
  if (input[algorithmKey] !== "sha256") reasons.push("unknown_fingerprint_algorithm");
  if (typeof fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(fingerprint)) reasons.push("malformed_fingerprint");
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  if (fingerprint !== builder(core)) reasons.push("fingerprint_mismatch");
}

function invalid(reasons: string[]): ValidationResult {
  return result(reasons.length > 0 ? reasons : ["invalid_input"]);
}

function result(reasons: string[]): ValidationResult {
  return { valid: reasons.length === 0, blockingReasons: [...new Set(reasons)].sort() };
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

function containsExcessiveString(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") return value.trim().length === 0 || value.length > 180;
  if (Array.isArray(value)) return value.some((item) => containsExcessiveString(item, seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.values(value).some((nested) => containsExcessiveString(nested, seen));
}

function containsSensitiveMaterial(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    if (safeLabelValues.has(value)) return false;
    return /access[_ -]?token|refresh[_ -]?token|service[_ -]?role|anon[_ -]?key|api[_ -]?key|password|connection[_ -]?string|postgres(?:ql)?:\/\/|authorization:\s*bearer|bearer\s+[a-z0-9._-]+|cookie|session[_ -]?(token|cookie|secret|value)|private[_ -]?key|client[_ -]?secret|credential[_ -]?file|raw[_ -]?environment|bankid|\/Users\/|\/home\/|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/i.test(value);
  }
  if (Array.isArray(value)) return value.some((item) => containsSensitiveMaterial(item, seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) =>
    /accessToken|refreshToken|serviceRoleKey|anonKey|apiKey|password|connectionString|authorizationHeader|bearerToken|cookie(Value|Secret|Token)?|session(Token|Cookie|Secret|Value)?|privateKey|clientSecret|credentialFile|keychainPath|rawEnvironment|bankid|fileDescriptor|environmentVariableName|secretName|sourceItemName|credentialPath|tokenMetadata|secretLength/i.test(key) ||
    containsSensitiveMaterial(nested, seen),
  );
}

const safeLabelValues = new Set([
  POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
  POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_OS_SOURCE_ID,
  POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CI_SOURCE_ID,
  "production_credential",
  "raw_environment",
  "pasted_token",
  "command_argument",
  "url_embedded",
  "read_only_staging_supabase_preflight_metadata",
  "staging_only_source_binding",
  "opaque_one_operation_handoff_metadata_only",
]);

function containsUnexpectedProductionReference(value: unknown, path: readonly string[] = [], seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    return value.includes(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) &&
      !["rejectedProductionProjectRef"].includes(path[path.length - 1] ?? "");
  }
  if (Array.isArray(value)) return value.some((item, index) => containsUnexpectedProductionReference(item, [...path, String(index)], seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) => containsUnexpectedProductionReference(nested, [...path, key], seen));
}
