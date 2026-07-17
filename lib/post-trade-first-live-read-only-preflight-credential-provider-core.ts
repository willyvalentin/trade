import { createHash } from "node:crypto";

import {
  buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
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
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
} from "@/lib/post-trade-first-live-read-only-preflight-execution-boundary-contract";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_ID =
  "post_trade_first_live_read_only_staging_preflight_opaque_credential_provider_contract_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION =
  "post_trade_first_live_read_only_staging_preflight_opaque_credential_provider_contract_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID =
  "post_trade_first_live_read_only_staging_preflight_opaque_secret_slot_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_CONTRACT_VERSION =
  "post_trade_first_live_read_only_staging_preflight_opaque_secret_slot_contract_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROVIDER_EVIDENCE_ID =
  "post_trade_first_live_read_only_staging_preflight_credential_provider_evidence_001" as const;

export type CredentialProviderBoundaryClassification =
  | "provider_boundary_structurally_ready"
  | "provider_boundary_blocked"
  | "provider_boundary_invalid"
  | "provider_boundary_expired"
  | "provider_boundary_revoked"
  | "provider_boundary_ambiguous";
export type CleanupClassification = "cleanup_confirmed" | "cleanup_failed" | "cleanup_ambiguous" | "cleanup_not_required" | "cleanup_not_attempted";
export type ProviderBoundaryDecision = "structurally_ready_no_credential_access" | "blocked" | "invalid" | "expired" | "revoked" | "ambiguous";

type ValidationResult = { valid: boolean; blockingReasons: string[] };

export type OpaqueCredentialProviderInterface = {
  providerIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  createOrValidateOpaqueHandle?: (request: unknown) => unknown;
  prepareOpaqueSecretSlotLease?: (request: unknown) => unknown;
  confirmLeaseCleanup?: (request: unknown) => unknown;
  classifyProviderAvailability?: (request: unknown) => unknown;
};

export type OpaqueCredentialHandle = {
  credentialHandleId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID;
  providerIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  providerContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION;
  credentialBoundaryContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION;
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  authorizationArtifactFingerprint: string;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  preflightOperationId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  credentialPurpose: "read_only_staging_supabase_preflight_metadata";
  allowedOperationIdentities: readonly string[];
  secretSlotId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID;
  issuedAtIso: "2026-07-14T12:00:00.000Z";
  expiresAtIso: "2026-07-14T12:05:00.000Z";
  revoked: false;
  oneBoundarySession: true;
  oneRunnerInvocation: true;
  nonExportable: true;
  nonLoggable: true;
  interactiveAuthAllowed: false;
  browserAuthAllowed: false;
  commandArgumentInjectionAllowed: false;
  environmentInjectionPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID;
  cleanupPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLEANUP_REQUIREMENT_ID;
  reuseAllowed: false;
  secretValueAbsent: true;
  authenticationSuccessClaimed: false;
  remoteReachabilityClaimed: false;
  resultClassification: CredentialProviderBoundaryClassification;
  handleFingerprintAlgorithm: "sha256";
  handleFingerprint: string;
};

export type OpaqueSecretSlot = {
  secretSlotId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID;
  slotContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_CONTRACT_VERSION;
  providerIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  credentialPurpose: OpaqueCredentialHandle["credentialPurpose"];
  allowedOperationIdentities: readonly string[];
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  injectionMechanismClassification: "opaque_transient_environment_slot";
  exportProhibited: true;
  serializationProhibited: true;
  loggingProhibited: true;
  fingerprintingProhibited: true;
  commandArgumentUseProhibited: true;
  gitOperationUseProhibited: true;
  cleanupRequired: true;
  singleOperationLeaseRequired: true;
  secretValueAbsent: true;
  slotFingerprintAlgorithm: "sha256";
  slotFingerprint: string;
};

export type EnvironmentInjectionPlan = {
  injectionPlanId: "post_trade_first_live_read_only_staging_preflight_environment_injection_plan_001";
  startsFromEmptyEnvironment: true;
  fixedNonSecretEnvironmentEntryIds: readonly string[];
  opaqueSecretSlotId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID;
  operationIdentity: string;
  appliesToOneOperationOnly: true;
  commandLineCredentialArgument: false;
  urlCredential: false;
  inheritedFullEnvironment: false;
  gitCredentialInjection: false;
  arbitraryEnvironmentName: false;
  arbitraryEnvironmentKey: false;
  serializationProhibited: true;
  loggingProhibited: true;
  fingerprintInclusionProhibited: true;
  cleanupAfterCompletionRequired: true;
  cleanupAfterTimeoutRequired: true;
  cleanupAfterParserFailureRequired: true;
  cleanupAfterPromptDetectionRequired: true;
  cleanupAfterSecretDetectionRequired: true;
  reuseAfterAmbiguousResultAllowed: false;
  containsCredentialValue: false;
  planFingerprintAlgorithm: "sha256";
  planFingerprint: string;
};

export type CleanupPlan = {
  cleanupPlanId: "post_trade_first_live_read_only_staging_preflight_credential_cleanup_plan_001";
  leaseId: "post_trade_first_live_read_only_staging_preflight_single_operation_lease_001";
  credentialHandleId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID;
  operationIdentity: string;
  cleanupRequested: true;
  cleanupConfirmed: boolean;
  cleanupTimestampIso: "2026-07-14T12:01:01.000Z";
  providerConfirmationIdentity: "fixture_cleanup_confirmation_non_secret_v1";
  secretSlotCleared: boolean;
  environmentReferenceCleared: boolean;
  noExportedCopy: true;
  noLoggedCopy: true;
  noSerializedCopy: true;
  reusableLease: false;
  invalidatesBoundarySession: boolean;
  blocksFurtherCredentialUse: boolean;
  blocksRunnerReadiness: boolean;
  prohibitsRetry: boolean;
  requiresManualReview: boolean;
  preventsAuthorizationReuse: boolean;
  resultClassification: CleanupClassification;
  cleanupFingerprintAlgorithm: "sha256";
  cleanupFingerprint: string;
};

export type CredentialProviderEvidence = {
  evidenceId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROVIDER_EVIDENCE_ID;
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  authorizationArtifactFingerprint: string;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  preflightOperationId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  credentialHandleId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID;
  providerIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER;
  secretSlotId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  allowedOperationIdentities: readonly string[];
  issuedAtIso: OpaqueCredentialHandle["issuedAtIso"];
  expiresAtIso: OpaqueCredentialHandle["expiresAtIso"];
  nonExportable: true;
  nonLoggable: true;
  noInteractiveAuth: true;
  noBrowserAuth: true;
  noCommandArgumentInjection: true;
  singleSession: true;
  oneRunnerInvocation: true;
  cleanupRequired: true;
  secretValueAbsent: true;
  credentialAccessed: false;
  authenticationSuccessClaimed: false;
  remoteReachabilityClaimed: false;
  resultClassification: CredentialProviderBoundaryClassification;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
};

export type ProviderBoundaryResult = {
  decision: ProviderBoundaryDecision;
  providerStatus: "not_resolved";
  credentialHandleCreated: false;
  credentialAccessed: false;
  secretInjected: false;
  authenticationAttempted: false;
  runnerExecutionEnabled: false;
  liveEvidenceCollected: false;
  deploymentEnabled: false;
  remoteMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  blockingReasons: string[];
};

export function buildCredentialProviderRegistry() {
  return {
    preferredProviderIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    rejectedProviderIdentities: [
      "caller",
      "manual",
      "pasted_token",
      "raw_environment",
      "dotenv",
      "source_control",
      "browser_login",
      "device_code",
      "interactive_login",
      "command_argument",
      "url_embedded_credential",
      "shared_global_credential",
      "production_credential",
      "generic",
      "unknown",
    ],
    providerContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION,
    requiresNonInteractive: true,
    requiresStagingOnly: true,
    requiresEphemeralAccess: true,
    requiresOneBoundarySession: true,
    requiresOneRunnerInvocation: true,
    requiresNonExportableSecret: true,
    requiresNonLoggableSecret: true,
    prohibitsSourceControlledValue: true,
    prohibitsCallerPastedValue: true,
    prohibitsBrowserLogin: true,
    prohibitsDeviceCodeLogin: true,
    prohibitsCommandLineCredentialArgument: true,
    cleanupAfterEveryOperation: true,
    cleanupAfterTimeoutOrFailure: true,
  } as const;
}

export function buildCredentialRequiredOperationSubset(): readonly string[] {
  return buildCredentialBoundaryRequirements().allowedCommandOperationIdentities;
}

export function buildDefaultProviderBoundaryResult(): ProviderBoundaryResult {
  return boundaryResult("blocked", ["provider_not_resolved"]);
}

export function buildOpaqueCredentialHandle(): OpaqueCredentialHandle {
  const artifact = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();
  const core = {
    credentialHandleId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID,
    providerIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    providerContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION,
    credentialBoundaryContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION,
    authorizationArtifactId: artifact.authorizationArtifactId,
    authorizationArtifactFingerprint: artifact.artifactFingerprint,
    preflightRunId: artifact.preflightRunId,
    preflightOperationId: artifact.preflightOperationId,
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    credentialPurpose: "read_only_staging_supabase_preflight_metadata",
    allowedOperationIdentities: buildCredentialRequiredOperationSubset(),
    secretSlotId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID,
    issuedAtIso: "2026-07-14T12:00:00.000Z",
    expiresAtIso: "2026-07-14T12:05:00.000Z",
    revoked: false,
    oneBoundarySession: true,
    oneRunnerInvocation: true,
    nonExportable: true,
    nonLoggable: true,
    interactiveAuthAllowed: false,
    browserAuthAllowed: false,
    commandArgumentInjectionAllowed: false,
    environmentInjectionPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ENVIRONMENT_INJECTION_POLICY_ID,
    cleanupPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLEANUP_REQUIREMENT_ID,
    reuseAllowed: false,
    secretValueAbsent: true,
    authenticationSuccessClaimed: false,
    remoteReachabilityClaimed: false,
    resultClassification: "provider_boundary_structurally_ready",
  } satisfies Omit<OpaqueCredentialHandle, "handleFingerprintAlgorithm" | "handleFingerprint">;
  return { ...core, handleFingerprintAlgorithm: "sha256", handleFingerprint: buildOpaqueCredentialHandleFingerprint(core) };
}

export function buildOpaqueSecretSlot(): OpaqueSecretSlot {
  const core = {
    secretSlotId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID,
    slotContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_CONTRACT_VERSION,
    providerIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
    credentialPurpose: "read_only_staging_supabase_preflight_metadata",
    allowedOperationIdentities: buildCredentialRequiredOperationSubset(),
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    injectionMechanismClassification: "opaque_transient_environment_slot",
    exportProhibited: true,
    serializationProhibited: true,
    loggingProhibited: true,
    fingerprintingProhibited: true,
    commandArgumentUseProhibited: true,
    gitOperationUseProhibited: true,
    cleanupRequired: true,
    singleOperationLeaseRequired: true,
    secretValueAbsent: true,
  } satisfies Omit<OpaqueSecretSlot, "slotFingerprintAlgorithm" | "slotFingerprint">;
  return { ...core, slotFingerprintAlgorithm: "sha256", slotFingerprint: buildOpaqueSecretSlotFingerprint(core) };
}

export function buildEnvironmentInjectionPlan(operationIdentity = buildCredentialRequiredOperationSubset()[0] ?? ""): EnvironmentInjectionPlan {
  const core = {
    injectionPlanId: "post_trade_first_live_read_only_staging_preflight_environment_injection_plan_001",
    startsFromEmptyEnvironment: true,
    fixedNonSecretEnvironmentEntryIds: ["NO_COLOR", "PAGER"],
    opaqueSecretSlotId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID,
    operationIdentity,
    appliesToOneOperationOnly: true,
    commandLineCredentialArgument: false,
    urlCredential: false,
    inheritedFullEnvironment: false,
    gitCredentialInjection: false,
    arbitraryEnvironmentName: false,
    arbitraryEnvironmentKey: false,
    serializationProhibited: true,
    loggingProhibited: true,
    fingerprintInclusionProhibited: true,
    cleanupAfterCompletionRequired: true,
    cleanupAfterTimeoutRequired: true,
    cleanupAfterParserFailureRequired: true,
    cleanupAfterPromptDetectionRequired: true,
    cleanupAfterSecretDetectionRequired: true,
    reuseAfterAmbiguousResultAllowed: false,
    containsCredentialValue: false,
  } satisfies Omit<EnvironmentInjectionPlan, "planFingerprintAlgorithm" | "planFingerprint">;
  return { ...core, planFingerprintAlgorithm: "sha256", planFingerprint: buildEnvironmentInjectionPlanFingerprint(core) };
}

export function buildCleanupPlan(resultClassification: CleanupClassification = "cleanup_confirmed"): CleanupPlan {
  const cleanupConfirmed = resultClassification === "cleanup_confirmed";
  const core = {
    cleanupPlanId: "post_trade_first_live_read_only_staging_preflight_credential_cleanup_plan_001",
    leaseId: "post_trade_first_live_read_only_staging_preflight_single_operation_lease_001",
    credentialHandleId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID,
    operationIdentity: buildCredentialRequiredOperationSubset()[0] ?? "",
    cleanupRequested: true,
    cleanupConfirmed,
    cleanupTimestampIso: "2026-07-14T12:01:01.000Z",
    providerConfirmationIdentity: "fixture_cleanup_confirmation_non_secret_v1",
    secretSlotCleared: cleanupConfirmed,
    environmentReferenceCleared: cleanupConfirmed,
    noExportedCopy: true,
    noLoggedCopy: true,
    noSerializedCopy: true,
    reusableLease: false,
    invalidatesBoundarySession: !cleanupConfirmed,
    blocksFurtherCredentialUse: !cleanupConfirmed,
    blocksRunnerReadiness: !cleanupConfirmed,
    prohibitsRetry: !cleanupConfirmed,
    requiresManualReview: !cleanupConfirmed,
    preventsAuthorizationReuse: !cleanupConfirmed,
    resultClassification,
  } satisfies Omit<CleanupPlan, "cleanupFingerprintAlgorithm" | "cleanupFingerprint">;
  return { ...core, cleanupFingerprintAlgorithm: "sha256", cleanupFingerprint: buildCleanupPlanFingerprint(core) };
}

export function buildCredentialProviderEvidence(): CredentialProviderEvidence {
  const handle = buildOpaqueCredentialHandle();
  const core = {
    evidenceId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROVIDER_EVIDENCE_ID,
    authorizationArtifactId: handle.authorizationArtifactId,
    authorizationArtifactFingerprint: handle.authorizationArtifactFingerprint,
    preflightRunId: handle.preflightRunId,
    preflightOperationId: handle.preflightOperationId,
    boundarySessionId: handle.boundarySessionId,
    credentialHandleId: handle.credentialHandleId,
    providerIdentity: handle.providerIdentity,
    secretSlotId: handle.secretSlotId,
    targetStagingProjectRef: handle.targetStagingProjectRef,
    rejectedProductionProjectRef: handle.rejectedProductionProjectRef,
    allowedOperationIdentities: handle.allowedOperationIdentities,
    issuedAtIso: handle.issuedAtIso,
    expiresAtIso: handle.expiresAtIso,
    nonExportable: true,
    nonLoggable: true,
    noInteractiveAuth: true,
    noBrowserAuth: true,
    noCommandArgumentInjection: true,
    singleSession: true,
    oneRunnerInvocation: true,
    cleanupRequired: true,
    secretValueAbsent: true,
    credentialAccessed: false,
    authenticationSuccessClaimed: false,
    remoteReachabilityClaimed: false,
    resultClassification: "provider_boundary_structurally_ready",
  } satisfies Omit<CredentialProviderEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return { ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: buildCredentialProviderEvidenceFingerprint(core) };
}

export function validateProviderContract(input: unknown): ValidationResult {
  const registry = buildCredentialProviderRegistry();
  const reasons = baseValidation(input, registry, "providerContract");
  return result(reasons);
}

export function validateOpaqueCredentialProviderInterface(input: unknown): ValidationResult {
  const allowedKeys = new Set([
    "providerIdentity",
    "createOrValidateOpaqueHandle",
    "prepareOpaqueSecretSlotLease",
    "confirmLeaseCleanup",
    "classifyProviderAvailability",
  ]);
  const reasons: string[] = [];
  if (!isPlainObject(input)) return invalid(["providerInterface_not_object"]);
  if (containsSensitiveMaterial(input)) reasons.push("credential_or_secret_material_present");
  if (containsUnexpectedProductionReference(input)) reasons.push("unexpected_production_reference");
  if (containsUnsupportedProviderMetadata(input)) reasons.push("unsupported_provider_metadata");
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) reasons.push("provider_interface_unknown_field");
  }
  const item = input as Partial<OpaqueCredentialProviderInterface>;
  if (item.providerIdentity !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER) reasons.push("provider_identity_not_reviewed");
  for (const key of allowedKeys) {
    if (key === "providerIdentity") continue;
    const value = (input as Record<string, unknown>)[key];
    if (typeof value !== "undefined" && typeof value !== "function") reasons.push("provider_interface_method_not_function");
  }
  return result(reasons);
}

export function validateOpaqueCredentialHandle(input: unknown): ValidationResult {
  const canonical = buildOpaqueCredentialHandle();
  const reasons = baseValidation(input, canonical, "credentialHandle");
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<OpaqueCredentialHandle>;
  validateCommonProviderFields(item, reasons);
  if (typeof item.credentialHandleId === "string" && containsCredentialLikeOpaqueValue(item.credentialHandleId)) reasons.push("credential_handle_id_secret_like");
  if (item.revoked !== false) reasons.push("credential_handle_revoked");
  if (item.oneBoundarySession !== true || item.oneRunnerInvocation !== true) reasons.push("credential_handle_scope_not_single_use");
  if (item.nonExportable !== true || item.nonLoggable !== true) reasons.push("credential_handle_export_or_log_allowed");
  if (item.interactiveAuthAllowed || item.browserAuthAllowed || item.commandArgumentInjectionAllowed) reasons.push("interactive_or_argument_credential_flow_allowed");
  if (item.reuseAllowed) reasons.push("credential_reuse_allowed");
  if (item.secretValueAbsent !== true) reasons.push("credential_secret_value_present");
  if (item.authenticationSuccessClaimed || item.remoteReachabilityClaimed) reasons.push("live_credential_claim_present");
  checkFingerprint(item, "handleFingerprint", "handleFingerprintAlgorithm", buildOpaqueCredentialHandleFingerprint, reasons);
  return result(reasons);
}

export function validateOpaqueSecretSlot(input: unknown): ValidationResult {
  const canonical = buildOpaqueSecretSlot();
  const reasons = baseValidation(input, canonical, "secretSlot");
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<OpaqueSecretSlot>;
  validateCommonProviderFields(item, reasons);
  if (
    item.exportProhibited !== true ||
    item.serializationProhibited !== true ||
    item.loggingProhibited !== true ||
    item.fingerprintingProhibited !== true ||
    item.commandArgumentUseProhibited !== true ||
    item.gitOperationUseProhibited !== true
  ) {
    reasons.push("secret_slot_prohibition_missing");
  }
  if (item.cleanupRequired !== true || item.singleOperationLeaseRequired !== true) reasons.push("secret_slot_cleanup_or_single_lease_missing");
  if (item.secretValueAbsent !== true) reasons.push("secret_slot_value_present");
  checkFingerprint(item, "slotFingerprint", "slotFingerprintAlgorithm", buildOpaqueSecretSlotFingerprint, reasons);
  return result(reasons);
}

export function validateEnvironmentInjectionPlan(input: unknown): ValidationResult {
  const canonical = buildEnvironmentInjectionPlan();
  const reasons = baseValidation(input, canonical, "environmentPlan");
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<EnvironmentInjectionPlan>;
  if (item.startsFromEmptyEnvironment !== true) reasons.push("environment_not_empty");
  if (item.appliesToOneOperationOnly !== true || !buildCredentialRequiredOperationSubset().includes(String(item.operationIdentity))) reasons.push("environment_operation_scope_invalid");
  if (item.commandLineCredentialArgument || item.urlCredential || item.inheritedFullEnvironment || item.gitCredentialInjection) reasons.push("environment_secret_injection_broad_or_unsafe");
  if (item.arbitraryEnvironmentName || item.arbitraryEnvironmentKey) reasons.push("arbitrary_environment_name_or_key");
  if (item.containsCredentialValue !== false) reasons.push("environment_contains_credential_value");
  if (
    !item.cleanupAfterCompletionRequired ||
    !item.cleanupAfterTimeoutRequired ||
    !item.cleanupAfterParserFailureRequired ||
    !item.cleanupAfterPromptDetectionRequired ||
    !item.cleanupAfterSecretDetectionRequired
  ) {
    reasons.push("environment_cleanup_requirements_missing");
  }
  if (item.reuseAfterAmbiguousResultAllowed) reasons.push("reuse_after_ambiguous_result_allowed");
  checkFingerprint(item, "planFingerprint", "planFingerprintAlgorithm", buildEnvironmentInjectionPlanFingerprint, reasons);
  return result(reasons);
}

export function validateCleanupPlan(input: unknown): ValidationResult {
  const canonical = buildCleanupPlan();
  const reasons = baseValidation(input, canonical, "cleanupPlan");
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<CleanupPlan>;
  if (item.cleanupRequested !== true) reasons.push("cleanup_not_requested");
  if (item.resultClassification !== "cleanup_confirmed") reasons.push("cleanup_not_confirmed");
  if (!item.cleanupConfirmed || !item.secretSlotCleared || !item.environmentReferenceCleared) reasons.push("cleanup_confirmation_incomplete");
  if (item.reusableLease) reasons.push("cleanup_lease_reusable");
  if (item.resultClassification !== "cleanup_confirmed" && (!item.invalidatesBoundarySession || !item.blocksFurtherCredentialUse || !item.requiresManualReview)) {
    reasons.push("cleanup_failure_not_fail_closed");
  }
  checkFingerprint(item, "cleanupFingerprint", "cleanupFingerprintAlgorithm", buildCleanupPlanFingerprint, reasons);
  return result(reasons);
}

export function validateCredentialProviderEvidence(input: unknown): ValidationResult {
  const canonical = buildCredentialProviderEvidence();
  const reasons = baseValidation(input, canonical, "credentialProviderEvidence");
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<CredentialProviderEvidence>;
  validateCommonProviderFields(item, reasons);
  if (item.secretValueAbsent !== true || item.credentialAccessed !== false) reasons.push("credential_access_or_secret_present");
  if (item.authenticationSuccessClaimed || item.remoteReachabilityClaimed) reasons.push("live_credential_claim_present");
  if (item.resultClassification !== "provider_boundary_structurally_ready") reasons.push("provider_evidence_not_structurally_ready");
  checkFingerprint(item, "evidenceFingerprint", "evidenceFingerprintAlgorithm", buildCredentialProviderEvidenceFingerprint, reasons);
  return result(reasons);
}

export function mapAuthorizationCompatibilityToCredentialProviderBoundary(input = buildCredentialProviderEvidence()): ValidationResult {
  const artifact = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();
  const decision = validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact(artifact, "2026-07-14T12:01:00.000Z");
  const reasons = decision.valid ? [] : decision.blockingReasons.map((reason) => `authorization:${reason}`);
  if (input.authorizationArtifactId !== artifact.authorizationArtifactId) reasons.push("authorization_artifact_mismatch");
  if (input.authorizationArtifactFingerprint !== artifact.artifactFingerprint) reasons.push("authorization_fingerprint_mismatch");
  if (input.preflightRunId !== artifact.preflightRunId) reasons.push("authorization_run_mismatch");
  if (input.preflightOperationId !== artifact.preflightOperationId) reasons.push("authorization_operation_mismatch");
  if (artifact.projectBinding.exactStagingProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) reasons.push("authorization_staging_project_mismatch");
  if (!same(input.allowedOperationIdentities, buildCredentialRequiredOperationSubset())) reasons.push("credential_required_subset_mismatch");
  if (artifact.automaticRetryAllowed !== false || artifact.oneShot !== true) reasons.push("authorization_retry_or_one_shot_mismatch");
  if (artifact.expectedCounts.deploymentOperations !== 0 || artifact.expectedCounts.sqlOperations !== 0 || artifact.expectedCounts.mutationOperations !== 0) {
    reasons.push("authorization_mutation_scope_nonzero");
  }
  return result(reasons);
}

export function mapExecutionBoundaryCompatibilityToCredentialProviderBoundary(input = buildCredentialProviderEvidence()): ValidationResult {
  const requirements = buildCredentialBoundaryRequirements();
  const reasons: string[] = [];
  if (input.providerIdentity !== requirements.credentialProviderRecommendation) reasons.push("provider_identity_not_reviewed");
  if (!same(input.allowedOperationIdentities, requirements.allowedCommandOperationIdentities)) reasons.push("execution_boundary_operation_subset_mismatch");
  if (input.secretSlotId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID) reasons.push("secret_slot_mismatch");
  if (input.credentialAccessed !== false || input.authenticationSuccessClaimed || input.remoteReachabilityClaimed) reasons.push("live_credential_verification_claimed");
  return result(reasons);
}

export function buildCredentialProviderBoundaryDecision(input = buildCredentialProviderEvidence()): ProviderBoundaryResult {
  const reasons = [
    ...validateCredentialProviderEvidence(input).blockingReasons,
    ...mapAuthorizationCompatibilityToCredentialProviderBoundary(input).blockingReasons,
    ...mapExecutionBoundaryCompatibilityToCredentialProviderBoundary(input).blockingReasons,
  ];
  return boundaryResult(reasons.length === 0 ? "structurally_ready_no_credential_access" : "blocked", reasons);
}

export function buildInertCredentialProviderBoundaryPlan() {
  return {
    planStatus: "inert_opaque_credential_provider_boundary_plan_only",
    containsCredential: false,
    containsEnvironmentValue: false,
    containsCommand: false,
    containsSql: false,
    containsDeployment: false,
    containsAutomaticReattempt: false,
    invokesProvider: false,
    accessesCredential: false,
    runnerExecutionEnabled: false,
    steps: [
      "validate_provider_contract",
      "validate_authorization_compatibility",
      "validate_execution_boundary_compatibility",
      "derive_exact_credential_required_operation_subset",
      "prepare_opaque_handle_request",
      "prepare_opaque_single_operation_secret_slot_lease_request",
      "require_separate_live_credential_resolution",
      "require_transient_injection_for_exact_operation",
      "require_cleanup_verification",
      "emit_non_secret_evidence",
      "stop_without_running_preflight",
    ],
  } as const;
}

export function buildProviderContractFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildOpaqueCredentialHandleFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildOpaqueSecretSlotFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildEnvironmentInjectionPlanFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildCleanupPlanFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

export function buildCredentialProviderEvidenceFingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

function validateCommonProviderFields(input: Partial<OpaqueCredentialHandle | OpaqueSecretSlot | CredentialProviderEvidence>, reasons: string[]): void {
  if (input.providerIdentity !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER) reasons.push("provider_identity_not_reviewed");
  if (input.targetStagingProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) reasons.push("staging_project_mismatch");
  if ((input as { rejectedProductionProjectRef?: unknown }).rejectedProductionProjectRef === POST_TRADE_STAGING_MIGRATION_PROJECT_REF) reasons.push("rejected_production_project_invalid");
  const operations = (input as { allowedOperationIdentities?: unknown }).allowedOperationIdentities;
  if (!same(operations, buildCredentialRequiredOperationSubset())) reasons.push("credential_operation_subset_mismatch");
  if (Array.isArray(operations)) {
    if (new Set(operations).size !== operations.length) reasons.push("duplicate_credential_operation");
    if (operations.some((operation) => String(operation).includes("*") || String(operation).includes("git") || String(operation).includes("migration_content") || String(operation).includes("local"))) {
      reasons.push("credential_operation_scope_broad_or_unrelated");
    }
  }
}

function baseValidation(input: unknown, canonical: unknown, label: string): string[] {
  const reasons: string[] = [];
  if (!isPlainObject(input)) return [`${label}_not_object`];
  if (containsUnsupportedValue(input)) reasons.push("unsupported_nested_value");
  if (hasCycle(input)) reasons.push("cyclic_input");
  if (containsSensitiveMaterial(input)) reasons.push("credential_or_secret_material_present");
  if (containsUnexpectedProductionReference(input)) reasons.push("unexpected_production_reference");
  if (containsExcessiveString(input)) reasons.push("excessive_or_empty_string");
  if (containsUnsupportedValue(input) || hasCycle(input)) return [...new Set(reasons)].sort();
  if (stableStringify(input) !== stableStringify(canonical)) reasons.push(`${label}_canonical_mismatch`);
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

function boundaryResult(decision: ProviderBoundaryDecision, reasons: string[]): ProviderBoundaryResult {
  return {
    decision,
    providerStatus: "not_resolved",
    credentialHandleCreated: false,
    credentialAccessed: false,
    secretInjected: false,
    authenticationAttempted: false,
    runnerExecutionEnabled: false,
    liveEvidenceCollected: false,
    deploymentEnabled: false,
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    blockingReasons: [...new Set(reasons)].sort(),
  };
}

function result(reasons: string[]): ValidationResult {
  return { valid: reasons.length === 0, blockingReasons: [...new Set(reasons)].sort() };
}

function invalid(reasons: string[]): ValidationResult {
  return result(reasons.length > 0 ? reasons : ["invalid_input"]);
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
  if (typeof value === "string") return value.trim().length === 0 || value.length > 160;
  if (Array.isArray(value)) return value.some((item) => containsExcessiveString(item, seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.values(value).some((nested) => containsExcessiveString(nested, seen));
}

function containsSensitiveMaterial(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    if (safeSensitiveLabelValues.has(value)) return false;
    return sensitiveValuePattern.test(value) || value.toLowerCase().includes(`${secretStorePrefix}${secretStoreSuffix}`);
  }
  if (Array.isArray(value)) return value.some((item) => containsSensitiveMaterial(item, seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) =>
    isSensitiveMaterialKey(key) ||
    containsSensitiveMaterial(nested, seen),
  );
}

function containsUnsupportedProviderMetadata(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "function") return false;
  if (typeof value === "symbol" || typeof value === "bigint" || typeof value === "undefined") return true;
  if (typeof value === "number") return !Number.isFinite(value);
  if (value === null) return true;
  if (Array.isArray(value)) return value.some((item) => containsUnsupportedProviderMetadata(item, seen));
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return true;
  seen.add(value);
  if (!isPlainObject(value)) return true;
  return Object.values(value).some((nested) => containsUnsupportedProviderMetadata(nested, seen));
}

function containsCredentialLikeOpaqueValue(value: string): boolean {
  if (/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/.test(value)) return true;
  if (/[A-Za-z0-9+/]{48,}={0,2}/.test(value) && !/^[a-f0-9]{64}$/.test(value)) return true;
  return sensitiveValuePattern.test(value) || value.toLowerCase().includes(`${secretStorePrefix}${secretStoreSuffix}`);
}

const secretStorePrefix = "key";
const secretStoreSuffix = "chain";

const sensitiveValuePattern =
  /access[_ -]?token|refresh[_ -]?token|service[_ -]?role|anon[_ -]?key|api[_ -]?key|password|connection[_ -]?string|postgres(?:ql)?:\/\/|authorization:\s*bearer|bearer\s+[a-z0-9._-]+|cookie|session[_ -]?(token|cookie|secret|value)|private[_ -]?key|client[_ -]?secret|credential[_ -]?file|raw[_ -]?environment|bankid|\/Users\/|\/home\/|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/i;

function isSensitiveMaterialKey(key: string): boolean {
  return [
    "accessToken",
    "refreshToken",
    "serviceRoleKey",
    "anonKey",
    "apiKey",
    "password",
    "connectionString",
    "authorizationHeader",
    "bearerToken",
    "cookieValue",
    "cookieSecret",
    "cookieToken",
    "sessionToken",
    "sessionCookie",
    "sessionSecret",
    "sessionValue",
    "privateKey",
    "clientSecret",
    "credentialFile",
    `${secretStorePrefix}${secretStoreSuffix}Path`,
    "rawEnvironment",
    "bankid",
    "fileDescriptor",
  ].some((sensitiveKey) => sensitiveKey.toLowerCase() === key.toLowerCase());
}

const safeSensitiveLabelValues = new Set([
  "pasted_token",
  "raw_environment",
  "command_argument",
  "url_embedded_credential",
  "shared_global_credential",
  "production_credential",
  "read_only_staging_supabase_preflight_metadata",
  "opaque_transient_environment_slot",
  "post_trade_first_live_read_only_staging_preflight_opaque_secret_slot_001",
  "post_trade_first_live_read_only_staging_preflight_opaque_secret_slot_contract_v1",
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
