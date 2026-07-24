import { createHash } from "node:crypto";

import { type DirectSpawnOperation } from "@/lib/post-trade-direct-spawn-driver-boundary-core";
import { POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION } from "@/lib/post-trade-live-read-only-macos-process-driver-design";

export const CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY = deepFreeze({
  adapterKind: "credential_source_adapter_boundary",
  adapterId: "ture.execution.credential-source-adapter-boundary.fixture.v1",
  platform: "macos",
  implementationMode: "fixture_only",
  secretMaterialMode: "forbidden",
  sourceModel: "injected_fixture_metadata",
  policyVersion: 1,
} as const);

export const NO_CREDENTIAL_POLICY_ID = "first_live_read_only_no_credentials_required_v1" as const;
export const FUTURE_KEYCHAIN_REFERENCE_POLICY_ID = "future_scoped_keychain_credential_reference_fixture_v1" as const;
export const CREDENTIAL_SOURCE_ISSUED_AT = "2026-07-17T10:40:00.000Z" as const;
export const CREDENTIAL_SOURCE_EVALUATED_AT = "2026-07-17T10:40:05.000Z" as const;
export const CREDENTIAL_SOURCE_EXPIRES_AT = "2026-07-17T10:40:30.000Z" as const;

export const CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:credential-source-adapter-boundary:identity:v1",
  noCredentialPolicy: "ture:credential-source-adapter-boundary:no-credential-policy:v1",
  referencePolicy: "ture:credential-source-adapter-boundary:reference-policy:v1",
  purpose: "ture:credential-source-adapter-boundary:purpose:v1",
  credentialSessionCapability: "ture:credential-source-adapter-boundary:credential-session-capability:v1",
  fixtureReferenceCapability: "ture:credential-source-adapter-boundary:fixture-reference-capability:v1",
  noCredentialCapability: "ture:credential-source-adapter-boundary:no-credential-capability:v1",
  noCredentialRequest: "ture:credential-source-adapter-boundary:no-credential-request:v1",
  referenceRequest: "ture:credential-source-adapter-boundary:reference-request:v1",
  authorizationLink: "ture:credential-source-adapter-boundary:authorization-link:v1",
  fixtureLease: "ture:credential-source-adapter-boundary:fixture-lease:v1",
  sourceEvidence: "ture:credential-source-adapter-boundary:source-evidence:v1",
  cleanupEvidence: "ture:credential-source-adapter-boundary:cleanup-evidence:v1",
  revocationEvidence: "ture:credential-source-adapter-boundary:revocation-evidence:v1",
  compatibility: "ture:credential-source-adapter-boundary:compatibility:v1",
  result: "ture:credential-source-adapter-boundary:result:v1",
} as const);

const CREDENTIAL_SESSION_PROVENANCE = new WeakSet<object>();
const CREDENTIAL_REFERENCE_PROVENANCE = new WeakSet<object>();
const NO_CREDENTIAL_PROVENANCE = new WeakSet<object>();
const CREDENTIAL_AUTHORIZATION_LINK_PROVENANCE = new WeakSet<object>();

export type CredentialSourceValidationResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; errors: readonly string[] }>;
export type CredentialPurpose = "no_credential_required" | "future_supabase_cli_authentication" | "future_git_remote_authentication";
export type CredentialSourceClassification =
  | "none"
  | "macos_keychain_reference_fixture"
  | "unsupported_environment_source"
  | "unsupported_file_source"
  | "unsupported_credential_helper"
  | "unsupported_browser_session"
  | "unsupported_network_broker"
  | "unknown";
export type SecretPresenceClassification = "confirmed_absent" | "secret_reference_metadata_only" | "secret_material_detected" | "secret_presence_unknown" | "contradictory";
export type CredentialAudience = "none" | "future_supabase_cli_process" | "future_git_remote_process";
export type CredentialScope = "none" | "future_supabase_read_only_auth_scope" | "future_git_remote_read_only_scope";
export type CredentialDeliveryChannel = "none" | "future_in_memory_handle";
export type CredentialHelperState = "not_used" | "fixture_helper_reference_rejected" | "helper_state_unknown";
export type FixtureCredentialLeaseState =
  | "not_required"
  | "fixture_reference_validated"
  | "fixture_lease_modeled_not_issued"
  | "fixture_lease_blocked"
  | "fixture_lease_ambiguous"
  | "expired";
export type FixtureCredentialCleanupPlanState = "not_required" | "fixture_cleanup_plan_present" | "fixture_cleanup_plan_incomplete" | "fixture_cleanup_plan_blocked";
export type FixtureCredentialRevocationPlanState = "not_required" | "fixture_revocation_plan_present" | "fixture_revocation_plan_incomplete" | "fixture_revocation_plan_blocked";
export type CredentialBoundaryAuthorityClassification = "fixture_structural_only" | "live_credential_reference_authority" | "live_credential_lease_authority";
export type CredentialBoundaryCompleteness =
  | "complete_no_credential_fixture_structure"
  | "complete_reference_fixture_structure"
  | "incomplete_credential_session"
  | "incomplete_source_classification"
  | "incomplete_purpose_binding"
  | "incomplete_operation_binding"
  | "incomplete_audience_binding"
  | "incomplete_scope_binding"
  | "incomplete_authorization_link"
  | "incomplete_lifetime"
  | "incomplete_cleanup_plan"
  | "incomplete_revocation_plan"
  | "incomplete_freshness"
  | "incomplete_multiple"
  | "secret_material_detected"
  | "contradictory"
  | "unsupported";
export type CredentialSourceFixtureLifecycleState =
  | "request_validated"
  | "fixture_no_credential_confirmed"
  | "fixture_reference_validated"
  | "fixture_lease_modeled_not_issued"
  | "fixture_cleanup_modeled_not_executed"
  | "fixture_revocation_modeled_not_executed"
  | "fixture_blocked"
  | "fixture_ambiguous"
  | "expired"
  | "unsupported";
export type CredentialBoundaryBlockingReason =
  | "request_invalid"
  | "request_expired"
  | "adapter_identity_mismatch"
  | "credential_policy_unknown"
  | "credential_session_invalid"
  | "credential_session_expired"
  | "credential_reference_invalid"
  | "credential_reference_expired"
  | "no_credential_capability_invalid"
  | "no_credential_capability_expired"
  | "session_mismatch"
  | "purpose_mismatch"
  | "operation_mismatch"
  | "audience_mismatch"
  | "scope_mismatch"
  | "authorization_link_invalid"
  | "authorization_link_mismatch"
  | "retry_not_allowed"
  | "attempt_must_be_one"
  | "credential_not_allowed_for_operation"
  | "credential_required_but_missing"
  | "unsupported_credential_source"
  | "environment_source_forbidden"
  | "file_source_forbidden"
  | "credential_helper_forbidden"
  | "browser_session_forbidden"
  | "network_broker_forbidden"
  | "keychain_access_forbidden"
  | "secret_material_detected"
  | "token_material_detected"
  | "password_material_detected"
  | "api_key_material_detected"
  | "private_key_material_detected"
  | "encrypted_secret_blob_detected"
  | "encoded_secret_blob_detected"
  | "environment_delivery_forbidden"
  | "argv_delivery_forbidden"
  | "stdin_delivery_forbidden"
  | "filesystem_delivery_forbidden"
  | "persistence_forbidden"
  | "logging_forbidden"
  | "renewal_forbidden"
  | "replay_forbidden"
  | "fixture_claimed_credential_access"
  | "fixture_claimed_secret_material"
  | "fixture_claimed_live_lease"
  | "fixture_claimed_keychain_access"
  | "fixture_claimed_delivery"
  | "fixture_claimed_cleanup"
  | "fixture_claimed_revocation"
  | "fixture_claimed_authorization_consumption"
  | "fixture_claimed_process_start"
  | "fixture_claimed_runner_enablement";
export type CredentialBoundaryAmbiguityReason =
  | "credential_session_incomplete"
  | "source_classification_unknown"
  | "purpose_binding_incomplete"
  | "operation_binding_incomplete"
  | "audience_binding_incomplete"
  | "scope_binding_incomplete"
  | "authorization_link_incomplete"
  | "lifetime_incomplete"
  | "cleanup_plan_incomplete"
  | "revocation_plan_incomplete"
  | "secret_presence_unknown"
  | "freshness_incomplete"
  | "session_consistency_uncertain"
  | "fixture_contradictory";

export type CredentialSourcePolicy = Readonly<{
  policyId: typeof NO_CREDENTIAL_POLICY_ID | typeof FUTURE_KEYCHAIN_REFERENCE_POLICY_ID;
  credentialRequirement: "none" | "future_scoped_reference_only";
  allowedSources: readonly CredentialSourceClassification[];
  secretMaterialAllowed: false;
  credentialReferenceAllowed: boolean;
  leaseAllowed: false | "fixture_metadata_only";
  environmentDeliveryAllowed: false;
  argvDeliveryAllowed: false;
  stdinDeliveryAllowed: false;
  filesystemDeliveryAllowed: false;
  credentialHelperAllowed: false;
  keychainAccessAllowed: false;
  networkBrokerAllowed: false;
  browserSessionAllowed: false;
  persistenceAllowed: false;
  loggingAllowed: false;
  retryPolicy: "none";
  oneShotOnly: true;
  renewable: false;
  sameSessionRequired: true;
  freshEvidenceRequired: true;
  exactAudienceRequired: boolean;
  exactOperationRequired: boolean;
  exactScopeRequired: boolean;
  shortLifetimeRequired: boolean;
  cleanupPlanRequired: boolean;
  revocationPlanRequired: boolean;
  fixtureMayAccessCredential: false;
  fixtureMayIssueLiveLease: false;
  fixtureMayProveCleanup: false;
  fixtureMayProveRevocation: false;
  fixtureMayEnableProcessStart: false;
  fixtureMayEnableRunner: false;
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
}>;

export type CredentialPurposeDefinition = Readonly<{
  purpose: CredentialPurpose;
  audience: CredentialAudience;
  scope: CredentialScope;
  currentOperationAllowed: boolean;
  fixtureOnly: true;
  liveUseRequiresSeparateReview: true;
  purposeFingerprintAlgorithm: "sha256";
  purposeFingerprint: string;
}>;

export type CredentialSessionCapability = Readonly<{
  capabilityKind: "credential_session";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  intendedPurpose: CredentialPurpose;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  containsSecretMaterial: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type FixtureCredentialReferenceCapability = Readonly<{
  capabilityKind: "fixture_credential_reference";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  purpose: Exclude<CredentialPurpose, "no_credential_required">;
  sourceClassification: "macos_keychain_reference_fixture";
  referenceIdentityFingerprint: string;
  audienceFingerprint: string;
  scopeFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  containsSecretMaterial: false;
  accessesKeychain: false;
  enablesCredentialAccess: false;
  enablesProcessStart: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type FixtureNoCredentialRequirementCapability = Readonly<{
  capabilityKind: "fixture_no_credential_requirement";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  purpose: "no_credential_required";
  operation: DirectSpawnOperation;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  containsSecretMaterial: false;
  credentialAccessRequired: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type CredentialFixtureAuthorizationLink = Readonly<{
  linkKind: "fixture_credential_authorization_link";
  linkVersion: 1;
  boundarySessionId: string;
  purpose: CredentialPurpose;
  operation: DirectSpawnOperation | "future_authentication_operation";
  audienceFingerprint: string;
  scopeFingerprint: string;
  credentialPolicyFingerprint: string;
  authorizationArtifactFingerprint: string;
  fixtureOnly: true;
  authorizationConsumed: false;
  authorizesCredentialAccessLive: false;
  linkFingerprintAlgorithm: "sha256";
  linkFingerprint: string;
}>;

export type NoCredentialFixtureRequest = Readonly<{
  requestKind: "no_credential_fixture_request";
  requestVersion: 1;
  requestId: string;
  boundarySessionId: string;
  adapterIdentityFingerprint: string;
  credentialPolicyId: typeof NO_CREDENTIAL_POLICY_ID;
  purpose: "no_credential_required";
  operation: DirectSpawnOperation;
  credentialSessionCapability: CredentialSessionCapability;
  noCredentialRequirementCapability: FixtureNoCredentialRequirementCapability;
  requestedAt: string;
  expiresAt: string;
  attempt: 1;
  retryPolicy: "none";
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
}>;

export type CredentialReferenceFixtureRequest = Readonly<{
  requestKind: "credential_reference_fixture_request";
  requestVersion: 1;
  requestId: string;
  boundarySessionId: string;
  adapterIdentityFingerprint: string;
  credentialPolicyId: typeof FUTURE_KEYCHAIN_REFERENCE_POLICY_ID;
  purpose: Exclude<CredentialPurpose, "no_credential_required">;
  operationFingerprint: string;
  credentialSessionCapability: CredentialSessionCapability;
  credentialReferenceCapability: FixtureCredentialReferenceCapability;
  authorizationLinkFingerprint: string;
  requestedAt: string;
  expiresAt: string;
  attempt: 1;
  retryPolicy: "none";
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
}>;

export type SanitizedFixtureCredentialLeaseMetadata = Readonly<{
  metadataKind: "sanitized_fixture_credential_lease";
  metadataVersion: 1;
  fixtureOnly: true;
  authoritativeLive: false;
  secretMaterialPresent: false;
  credentialAccessed: false;
  credentialDecrypted: false;
  credentialDelivered: false;
  leaseIssuedLive: false;
  leaseActivatedLive: false;
  renewable: false;
  replayable: false;
  boundarySessionId: string;
  requestId: string;
  purpose: CredentialPurpose;
  sourceClassification: CredentialSourceClassification;
  audienceFingerprint?: string;
  scopeFingerprint?: string;
  issuedAtFixture: string;
  expiresAtFixture: string;
  authority: "fixture_structural_only";
  completeness: CredentialBoundaryCompleteness;
  disposition: "compatible_fixture_no_credential" | "compatible_fixture_reference_no_secret" | "blocked_fixture" | "ambiguous_fixture";
  blockingReasons: readonly CredentialBoundaryBlockingReason[];
  ambiguityReasons: readonly CredentialBoundaryAmbiguityReason[];
  leaseFingerprintAlgorithm: "sha256";
  leaseFingerprint: string;
}>;

export type SanitizedCredentialCleanupEvidence = Readonly<{
  evidenceKind: "sanitized_credential_cleanup_evidence";
  evidenceVersion: 1;
  fixtureOnly: true;
  secretMaterialPresent: false;
  credentialAccessed: false;
  credentialDelivered: false;
  cleanupRequiredLive: false;
  cleanupAttemptedLive: false;
  cleanupCompletedLive: false;
  provesCredentialCleanupLive: false;
  keychainItemModified: false;
  keychainItemDeleted: false;
  credentialFileDeleted: false;
  environmentCleared: false;
  processMemoryVerifiedCleared: false;
  boundarySessionId: string;
  requestId: string;
  cleanupPlanState: FixtureCredentialCleanupPlanState;
  authority: "fixture_structural_only";
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type SanitizedCredentialRevocationEvidence = Readonly<{
  evidenceKind: "sanitized_credential_revocation_evidence";
  evidenceVersion: 1;
  fixtureOnly: true;
  credentialRevokedLive: false;
  revocationAttemptedLive: false;
  provesRevocationLive: false;
  keychainModified: false;
  providerContacted: false;
  boundarySessionId: string;
  requestId: string;
  revocationPlanState: FixtureCredentialRevocationPlanState;
  authority: "fixture_structural_only";
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type SanitizedCredentialSourceEvidence = Readonly<{
  evidenceKind: "sanitized_credential_source_evidence";
  evidenceVersion: 1;
  fixtureOnly: true;
  authoritativeLive: false;
  secretMaterialPresent: false;
  credentialAccessed: false;
  credentialRead: false;
  credentialDecrypted: false;
  credentialDelivered: false;
  keychainAccessAttempted: false;
  environmentRead: false;
  filesystemRead: false;
  credentialHelperInvoked: false;
  networkBrokerContacted: false;
  authorizationConsumed: false;
  enablesCredentialAccess: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  boundarySessionId: string;
  requestId: string;
  purpose: CredentialPurpose;
  sourceClassification: CredentialSourceClassification;
  secretPresence: SecretPresenceClassification;
  authority: "fixture_structural_only";
  completeness: CredentialBoundaryCompleteness;
  lifecycleState: CredentialSourceFixtureLifecycleState;
  disposition: "compatible_fixture_no_credential" | "compatible_fixture_reference_no_secret" | "blocked_fixture" | "ambiguous_fixture";
  blockingReasons: readonly CredentialBoundaryBlockingReason[];
  ambiguityReasons: readonly CredentialBoundaryAmbiguityReason[];
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type CredentialSourceCompatibilitySummary = Readonly<{
  compatibilityKind: "credential_source_adapter_boundary_compatibility";
  fixtureOnly: true;
  directSpawnDriver: "current_version_operations_require_no_credentials";
  trustedResolver: "credential_boundary_does_not_resolve_paths";
  processObserver: "no_credential_helper_or_keychain_child_expected";
  processExecutor: "no_credential_delivery_to_executor";
  cliVersionCollector: "version_operations_require_no_credentials";
  authorization: "fixture_link_structural_no_consumption_no_live_access";
  runner: "fixture_credential_source_structurally_compatible_but_not_live_runner_enabling";
  credentialCleanupDesign: "fixture_cleanup_and_revocation_modeled_without_live_proof";
  enablesCredentialAccess: false;
  enablesExecution: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  compatibilityFingerprintAlgorithm: "sha256";
  compatibilityFingerprint: string;
}>;

export type CredentialSourceFixtureResult = Readonly<{
  resultKind: "credential_source_fixture_result";
  resultVersion: 1;
  fixtureOnly: true;
  authoritativeLive: false;
  secretMaterialPresent: false;
  credentialAccessed: false;
  credentialRead: false;
  credentialDecrypted: false;
  credentialDelivered: false;
  leaseIssuedLive: false;
  leaseActivatedLive: false;
  keychainAccessAttempted: false;
  keychainItemRead: false;
  keychainItemModified: false;
  keychainItemDeleted: false;
  environmentRead: false;
  environmentCredentialInjected: false;
  argvCredentialInjected: false;
  stdinCredentialInjected: false;
  filesystemRead: false;
  credentialFileCreated: false;
  credentialHelperInvoked: false;
  networkBrokerContacted: false;
  authorizationConsumed: false;
  cleanupAttemptedLive: false;
  cleanupCompletedLive: false;
  provesCredentialCleanupLive: false;
  revocationAttemptedLive: false;
  credentialRevokedLive: false;
  provesRevocationLive: false;
  enablesCredentialAccess: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  lease: SanitizedFixtureCredentialLeaseMetadata;
  sourceEvidence: SanitizedCredentialSourceEvidence;
  cleanupEvidence: SanitizedCredentialCleanupEvidence;
  revocationEvidence: SanitizedCredentialRevocationEvidence;
  compatibility: CredentialSourceCompatibilitySummary;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export type CredentialSourceFixtureAdapter = Readonly<{
  identity: typeof CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY;
  fixtureOnly: true;
  evaluateNoCredentialFixture(input: Readonly<{ request: NoCredentialFixtureRequest; evaluatedAt: string }>): CredentialSourceFixtureResult;
  evaluateCredentialReferenceFixture(input: Readonly<{ request: CredentialReferenceFixtureRequest; evaluatedAt: string }>): CredentialSourceFixtureResult;
}>;

export function buildCredentialSourceAdapterIdentityFingerprint(input: unknown = CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY): string {
  if (hasUnsafeInput(input) || hasUnsafeValues(input)) throw new Error("credential_source_fixture_input_rejected");
  return fingerprint(CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.identity, input);
}

export function buildCredentialSourcePolicy(policyId: typeof NO_CREDENTIAL_POLICY_ID | typeof FUTURE_KEYCHAIN_REFERENCE_POLICY_ID): CredentialSourcePolicy {
  if (policyId !== NO_CREDENTIAL_POLICY_ID && policyId !== FUTURE_KEYCHAIN_REFERENCE_POLICY_ID) throw new Error("credential_source_policy_rejected");
  const isNoCredential = policyId === NO_CREDENTIAL_POLICY_ID;
  const core = {
    policyId,
    credentialRequirement: isNoCredential ? "none" : "future_scoped_reference_only",
    allowedSources: isNoCredential ? ["none"] as const : ["macos_keychain_reference_fixture"] as const,
    secretMaterialAllowed: false,
    credentialReferenceAllowed: !isNoCredential,
    leaseAllowed: isNoCredential ? false : "fixture_metadata_only",
    environmentDeliveryAllowed: false,
    argvDeliveryAllowed: false,
    stdinDeliveryAllowed: false,
    filesystemDeliveryAllowed: false,
    credentialHelperAllowed: false,
    keychainAccessAllowed: false,
    networkBrokerAllowed: false,
    browserSessionAllowed: false,
    persistenceAllowed: false,
    loggingAllowed: false,
    retryPolicy: "none",
    oneShotOnly: true,
    renewable: false,
    sameSessionRequired: true,
    freshEvidenceRequired: true,
    exactAudienceRequired: !isNoCredential,
    exactOperationRequired: !isNoCredential,
    exactScopeRequired: !isNoCredential,
    shortLifetimeRequired: !isNoCredential,
    cleanupPlanRequired: !isNoCredential,
    revocationPlanRequired: !isNoCredential,
    fixtureMayAccessCredential: false,
    fixtureMayIssueLiveLease: false,
    fixtureMayProveCleanup: false,
    fixtureMayProveRevocation: false,
    fixtureMayEnableProcessStart: false,
    fixtureMayEnableRunner: false,
  } satisfies Omit<CredentialSourcePolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return freezeWithFingerprint(core, isNoCredential ? CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.noCredentialPolicy : CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.referencePolicy, "policyFingerprint");
}

export function buildCredentialSourcePolicyRegistry(): readonly CredentialSourcePolicy[] {
  return deepFreeze([
    buildCredentialSourcePolicy(NO_CREDENTIAL_POLICY_ID),
    buildCredentialSourcePolicy(FUTURE_KEYCHAIN_REFERENCE_POLICY_ID),
  ] as const);
}

export function buildCredentialPurposeDefinition(purpose: CredentialPurpose): CredentialPurposeDefinition {
  if (!isCredentialPurpose(purpose)) throw new Error("credential_source_purpose_rejected");
  const core = {
    purpose,
    audience: purpose === "future_supabase_cli_authentication" ? "future_supabase_cli_process" : purpose === "future_git_remote_authentication" ? "future_git_remote_process" : "none",
    scope: purpose === "future_supabase_cli_authentication" ? "future_supabase_read_only_auth_scope" : purpose === "future_git_remote_authentication" ? "future_git_remote_read_only_scope" : "none",
    currentOperationAllowed: purpose === "no_credential_required",
    fixtureOnly: true,
    liveUseRequiresSeparateReview: true,
  } satisfies Omit<CredentialPurposeDefinition, "purposeFingerprintAlgorithm" | "purposeFingerprint">;
  return freezeWithFingerprint(core, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.purpose, "purposeFingerprint");
}

export function buildCredentialPurposeRegistry(): readonly CredentialPurposeDefinition[] {
  return deepFreeze([
    buildCredentialPurposeDefinition("no_credential_required"),
    buildCredentialPurposeDefinition("future_supabase_cli_authentication"),
    buildCredentialPurposeDefinition("future_git_remote_authentication"),
  ] as const);
}

export function buildCredentialSessionCapability(input: Partial<CredentialSessionCapability> = {}): CredentialSessionCapability {
  rejectUnsafeBuilderInput(input);
  if (input.intendedPurpose !== undefined && !isCredentialPurpose(input.intendedPurpose)) throw new Error("credential_source_purpose_rejected");
  const core = {
    capabilityKind: "credential_session",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? "fixture_credential_session_001",
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    intendedPurpose: input.intendedPurpose ?? "no_credential_required",
    issuedAt: input.issuedAt ?? CREDENTIAL_SOURCE_ISSUED_AT,
    expiresAt: input.expiresAt ?? CREDENTIAL_SOURCE_EXPIRES_AT,
    fixtureOnly: true,
    containsSecretMaterial: false,
  } satisfies Omit<CredentialSessionCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = freezeWithFingerprint(core, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.credentialSessionCapability, "capabilityFingerprint");
  CREDENTIAL_SESSION_PROVENANCE.add(capability);
  return capability;
}

export function buildFixtureCredentialReferenceCapability(input: Partial<FixtureCredentialReferenceCapability> = {}): FixtureCredentialReferenceCapability {
  rejectUnsafeBuilderInput(input);
  if ("accessesKeychain" in input || "enablesCredentialAccess" in input || "enablesProcessStart" in input || "containsSecretMaterial" in input) throw new Error("credential_source_fixture_input_rejected");
  const requestedPurpose = input.purpose as unknown;
  if (requestedPurpose !== undefined && (requestedPurpose === "no_credential_required" || !isCredentialPurpose(requestedPurpose))) throw new Error("credential_source_purpose_rejected");
  const purpose = input.purpose ?? "future_supabase_cli_authentication";
  const definition = buildCredentialPurposeDefinition(purpose);
  const core = {
    capabilityKind: "fixture_credential_reference",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? `fixture_credential_reference_${purpose}_001`,
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    purpose,
    sourceClassification: "macos_keychain_reference_fixture",
    referenceIdentityFingerprint: input.referenceIdentityFingerprint ?? sha256(`fixture-reference:${purpose}`),
    audienceFingerprint: input.audienceFingerprint ?? sha256(`fixture-audience:${definition.audience}`),
    scopeFingerprint: input.scopeFingerprint ?? sha256(`fixture-scope:${definition.scope}`),
    issuedAt: input.issuedAt ?? CREDENTIAL_SOURCE_ISSUED_AT,
    expiresAt: input.expiresAt ?? CREDENTIAL_SOURCE_EXPIRES_AT,
    fixtureOnly: true,
    containsSecretMaterial: false,
    accessesKeychain: false,
    enablesCredentialAccess: false,
    enablesProcessStart: false,
  } satisfies Omit<FixtureCredentialReferenceCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = freezeWithFingerprint(core, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.fixtureReferenceCapability, "capabilityFingerprint");
  CREDENTIAL_REFERENCE_PROVENANCE.add(capability);
  return capability;
}

export function buildFixtureNoCredentialRequirementCapability(input: Partial<FixtureNoCredentialRequirementCapability> = {}): FixtureNoCredentialRequirementCapability {
  rejectUnsafeBuilderInput(input);
  if ("credentialAccessRequired" in input || "containsSecretMaterial" in input) throw new Error("credential_source_fixture_input_rejected");
  if (input.operation !== undefined && !isDirectSpawnOperation(input.operation)) throw new Error("credential_source_operation_rejected");
  const operation = input.operation ?? "collect_git_version";
  const core = {
    capabilityKind: "fixture_no_credential_requirement",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? `fixture_no_credential_requirement_${operation}_001`,
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    purpose: "no_credential_required",
    operation,
    issuedAt: input.issuedAt ?? CREDENTIAL_SOURCE_ISSUED_AT,
    expiresAt: input.expiresAt ?? CREDENTIAL_SOURCE_EXPIRES_AT,
    fixtureOnly: true,
    containsSecretMaterial: false,
    credentialAccessRequired: false,
  } satisfies Omit<FixtureNoCredentialRequirementCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = freezeWithFingerprint(core, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.noCredentialCapability, "capabilityFingerprint");
  NO_CREDENTIAL_PROVENANCE.add(capability);
  return capability;
}

export function buildCredentialFixtureAuthorizationLink(input: Partial<CredentialFixtureAuthorizationLink> = {}): CredentialFixtureAuthorizationLink {
  rejectUnsafeBuilderInput(input);
  if ("authorizationConsumed" in input || "authorizesCredentialAccessLive" in input) throw new Error("credential_source_fixture_input_rejected");
  if (input.purpose !== undefined && !isCredentialPurpose(input.purpose)) throw new Error("credential_source_purpose_rejected");
  if (input.operation !== undefined && input.operation !== "future_authentication_operation" && !isDirectSpawnOperation(input.operation)) throw new Error("credential_source_operation_rejected");
  const purpose = input.purpose ?? "no_credential_required";
  const definition = buildCredentialPurposeDefinition(purpose);
  const policy = buildCredentialSourcePolicy(purpose === "no_credential_required" ? NO_CREDENTIAL_POLICY_ID : FUTURE_KEYCHAIN_REFERENCE_POLICY_ID);
  const core = {
    linkKind: "fixture_credential_authorization_link",
    linkVersion: 1,
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    purpose,
    operation: input.operation ?? "collect_git_version",
    audienceFingerprint: input.audienceFingerprint ?? sha256(`fixture-audience:${definition.audience}`),
    scopeFingerprint: input.scopeFingerprint ?? sha256(`fixture-scope:${definition.scope}`),
    credentialPolicyFingerprint: input.credentialPolicyFingerprint ?? policy.policyFingerprint,
    authorizationArtifactFingerprint: input.authorizationArtifactFingerprint ?? sha256(`fixture-credential-authorization:${purpose}`),
    fixtureOnly: true,
    authorizationConsumed: false,
    authorizesCredentialAccessLive: false,
  } satisfies Omit<CredentialFixtureAuthorizationLink, "linkFingerprintAlgorithm" | "linkFingerprint">;
  const link = freezeWithFingerprint(core, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.authorizationLink, "linkFingerprint");
  CREDENTIAL_AUTHORIZATION_LINK_PROVENANCE.add(link);
  return link;
}

export function buildNoCredentialFixtureRequest(input: Partial<NoCredentialFixtureRequest> = {}): NoCredentialFixtureRequest {
  rejectUnsafeBuilderInput(input);
  if (input.operation !== undefined && !isDirectSpawnOperation(input.operation)) throw new Error("credential_source_operation_rejected");
  const operation = input.operation ?? "collect_git_version";
  const session = input.credentialSessionCapability ?? buildCredentialSessionCapability({ intendedPurpose: "no_credential_required" });
  const noCredential = input.noCredentialRequirementCapability ?? buildFixtureNoCredentialRequirementCapability({ boundarySessionId: session.boundarySessionId, operation });
  const core = {
    requestKind: "no_credential_fixture_request",
    requestVersion: 1,
    requestId: input.requestId ?? `no_credential_fixture_request_${operation}_001`,
    boundarySessionId: input.boundarySessionId ?? session.boundarySessionId,
    adapterIdentityFingerprint: input.adapterIdentityFingerprint ?? buildCredentialSourceAdapterIdentityFingerprint(),
    credentialPolicyId: input.credentialPolicyId ?? NO_CREDENTIAL_POLICY_ID,
    purpose: "no_credential_required",
    operation,
    credentialSessionCapability: session,
    noCredentialRequirementCapability: noCredential,
    requestedAt: input.requestedAt ?? CREDENTIAL_SOURCE_ISSUED_AT,
    expiresAt: input.expiresAt ?? CREDENTIAL_SOURCE_EXPIRES_AT,
    attempt: 1,
    retryPolicy: "none",
  } satisfies Omit<NoCredentialFixtureRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return freezeWithFingerprint(core, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.noCredentialRequest, "requestFingerprint");
}

export function buildCredentialReferenceFixtureRequest(input: Partial<CredentialReferenceFixtureRequest> = {}): CredentialReferenceFixtureRequest {
  rejectUnsafeBuilderInput(input);
  const requestedPurpose = input.purpose as unknown;
  if (requestedPurpose !== undefined && (requestedPurpose === "no_credential_required" || !isCredentialPurpose(requestedPurpose))) throw new Error("credential_source_purpose_rejected");
  const purpose = input.purpose ?? "future_supabase_cli_authentication";
  const session = input.credentialSessionCapability ?? buildCredentialSessionCapability({ intendedPurpose: purpose });
  const reference = input.credentialReferenceCapability ?? buildFixtureCredentialReferenceCapability({ boundarySessionId: session.boundarySessionId, purpose });
  const authorization = buildCredentialFixtureAuthorizationLink({ boundarySessionId: session.boundarySessionId, purpose, operation: "future_authentication_operation" });
  const core = {
    requestKind: "credential_reference_fixture_request",
    requestVersion: 1,
    requestId: input.requestId ?? `credential_reference_fixture_request_${purpose}_001`,
    boundarySessionId: input.boundarySessionId ?? session.boundarySessionId,
    adapterIdentityFingerprint: input.adapterIdentityFingerprint ?? buildCredentialSourceAdapterIdentityFingerprint(),
    credentialPolicyId: input.credentialPolicyId ?? FUTURE_KEYCHAIN_REFERENCE_POLICY_ID,
    purpose,
    operationFingerprint: input.operationFingerprint ?? buildCredentialPurposeDefinition(purpose).purposeFingerprint,
    credentialSessionCapability: session,
    credentialReferenceCapability: reference,
    authorizationLinkFingerprint: input.authorizationLinkFingerprint ?? authorization.linkFingerprint,
    requestedAt: input.requestedAt ?? CREDENTIAL_SOURCE_ISSUED_AT,
    expiresAt: input.expiresAt ?? CREDENTIAL_SOURCE_EXPIRES_AT,
    attempt: 1,
    retryPolicy: "none",
  } satisfies Omit<CredentialReferenceFixtureRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return freezeWithFingerprint(core, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.referenceRequest, "requestFingerprint");
}

export function buildCredentialSourceFixtureAdapter(): CredentialSourceFixtureAdapter {
  return deepFreeze({
    identity: CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY,
    fixtureOnly: true,
    evaluateNoCredentialFixture: ({ request, evaluatedAt }) => evaluateNoCredentialFixture({ request, evaluatedAt }),
    evaluateCredentialReferenceFixture: ({ request, evaluatedAt }) => evaluateCredentialReferenceFixture({ request, evaluatedAt }),
  });
}

export function buildCredentialSourceCompatibilitySummary(): CredentialSourceCompatibilitySummary {
  const core = {
    compatibilityKind: "credential_source_adapter_boundary_compatibility",
    fixtureOnly: true,
    directSpawnDriver: "current_version_operations_require_no_credentials",
    trustedResolver: "credential_boundary_does_not_resolve_paths",
    processObserver: "no_credential_helper_or_keychain_child_expected",
    processExecutor: "no_credential_delivery_to_executor",
    cliVersionCollector: "version_operations_require_no_credentials",
    authorization: "fixture_link_structural_no_consumption_no_live_access",
    runner: "fixture_credential_source_structurally_compatible_but_not_live_runner_enabling",
    credentialCleanupDesign: "fixture_cleanup_and_revocation_modeled_without_live_proof",
    enablesCredentialAccess: false,
    enablesExecution: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
  } satisfies Omit<CredentialSourceCompatibilitySummary, "compatibilityFingerprintAlgorithm" | "compatibilityFingerprint">;
  return freezeWithFingerprint(core, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.compatibility, "compatibilityFingerprint");
}

export function buildCredentialSourceFutureLivePlan() {
  return deepFreeze({
    planKind: "credential_source_future_live_plan",
    fixtureOnly: true,
    liveCredentialAdapterPresent: false,
    selectedKeychainApi: "not_selected",
    keychainAccessImplemented: false,
    credentialHelperImplemented: false,
    environmentFallbackImplemented: false,
    credentialFileFallbackImplemented: false,
    requiresKeychainApiReview: true,
    requiresExactItemIdentityReview: true,
    requiresUserPresenceReview: true,
    requiresSecretMemoryReview: true,
    requiresDeliveryMechanismReview: true,
    requiresCleanupReview: true,
    requiresRevocationReview: true,
    requiresAuthorizationConsumptionReview: true,
    requiresObserverInteractionReview: true,
    requiresStagingValidationGate: true,
    requiresFinalLiveGate: true,
  } as const);
}

export function validateCredentialSourceAdapterIdentity(input: unknown): CredentialSourceValidationResult<typeof CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY> {
  return exact(input, CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY, "adapter_identity");
}

export function validateCredentialSourcePolicy(input: unknown): CredentialSourceValidationResult<CredentialSourcePolicy> {
  if (!isRecord(input) || (input.policyId !== NO_CREDENTIAL_POLICY_ID && input.policyId !== FUTURE_KEYCHAIN_REFERENCE_POLICY_ID)) return invalid("credential_policy_unknown");
  const domain = input.policyId === NO_CREDENTIAL_POLICY_ID ? CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.noCredentialPolicy : CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.referencePolicy;
  return exact(input, buildCredentialSourcePolicy(input.policyId), "credential_policy", "policyFingerprint", "policyFingerprintAlgorithm", domain);
}

export function validateCredentialPurposeDefinition(input: unknown): CredentialSourceValidationResult<CredentialPurposeDefinition> {
  if (!isRecord(input) || !isCredentialPurpose(input.purpose)) return invalid("purpose_mismatch");
  return exact(input, buildCredentialPurposeDefinition(input.purpose), "credential_purpose", "purposeFingerprint", "purposeFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.purpose);
}

export function validateCredentialSessionCapability(input: unknown, evaluatedAt: string = CREDENTIAL_SOURCE_EVALUATED_AT): CredentialSourceValidationResult<CredentialSessionCapability> {
  const errors = validateFingerprintShape(input, "credential_session", "capabilityFingerprint", "capabilityFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.credentialSessionCapability);
  if (!isRecord(input)) return invalid("credential_session_invalid");
  if (!CREDENTIAL_SESSION_PROVENANCE.has(input)) errors.push("credential_session_invalid");
  if (input.capabilityKind !== "credential_session" || input.capabilityVersion !== 1 || input.fixtureOnly !== true) errors.push("credential_session_invalid");
  if (!isCapabilityId(input.capabilityId, "fixture_credential_session_")) errors.push("credential_session_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (!isCredentialPurpose(input.intendedPurpose)) errors.push("purpose_mismatch");
  if (input.containsSecretMaterial !== false) errors.push("fixture_claimed_secret_material");
  validateTime(input.issuedAt, input.expiresAt, evaluatedAt, errors, "credential_session_expired");
  if (hasUnsafeValues(input)) errors.push("secret_material_detected");
  if (hasUnsafeInput(pickUnknown(input, CREDENTIAL_SESSION_KEYS))) errors.push("secret_material_detected");
  errors.push(...validateFingerprintMatch(input, "credential_session", "capabilityFingerprint", "capabilityFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.credentialSessionCapability));
  return validation(input, errors);
}

export function validateFixtureCredentialReferenceCapability(input: unknown, purpose: Exclude<CredentialPurpose, "no_credential_required"> = "future_supabase_cli_authentication", evaluatedAt: string = CREDENTIAL_SOURCE_EVALUATED_AT): CredentialSourceValidationResult<FixtureCredentialReferenceCapability> {
  const errors = validateFingerprintShape(input, "credential_reference", "capabilityFingerprint", "capabilityFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.fixtureReferenceCapability);
  if (!isRecord(input)) return invalid("credential_reference_invalid");
  if (!CREDENTIAL_REFERENCE_PROVENANCE.has(input)) errors.push("credential_reference_invalid");
  if (input.capabilityKind !== "fixture_credential_reference" || input.capabilityVersion !== 1 || input.fixtureOnly !== true) errors.push("credential_reference_invalid");
  if (!isCapabilityId(input.capabilityId, "fixture_credential_reference_")) errors.push("credential_reference_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (input.purpose !== purpose) errors.push("purpose_mismatch");
  if (input.sourceClassification !== "macos_keychain_reference_fixture") errors.push(sourceBlockingReason(input.sourceClassification));
  if (!isSha256(input.referenceIdentityFingerprint) || !isSha256(input.audienceFingerprint) || !isSha256(input.scopeFingerprint)) errors.push("credential_reference_invalid");
  if (input.containsSecretMaterial !== false) errors.push("fixture_claimed_secret_material");
  if (input.accessesKeychain !== false) errors.push("fixture_claimed_keychain_access");
  if (input.enablesCredentialAccess !== false) errors.push("fixture_claimed_credential_access");
  if (input.enablesProcessStart !== false) errors.push("fixture_claimed_process_start");
  validateTime(input.issuedAt, input.expiresAt, evaluatedAt, errors, "credential_reference_expired");
  if (hasUnsafeValues(input)) errors.push("secret_material_detected");
  if (hasUnsafeInput(pickUnknown(input, CREDENTIAL_REFERENCE_KEYS))) errors.push("secret_material_detected");
  errors.push(...validateFingerprintMatch(input, "credential_reference", "capabilityFingerprint", "capabilityFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.fixtureReferenceCapability));
  return validation(input, errors);
}

export function validateFixtureNoCredentialRequirementCapability(input: unknown, operation: DirectSpawnOperation = "collect_git_version", evaluatedAt: string = CREDENTIAL_SOURCE_EVALUATED_AT): CredentialSourceValidationResult<FixtureNoCredentialRequirementCapability> {
  const errors = validateFingerprintShape(input, "no_credential", "capabilityFingerprint", "capabilityFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.noCredentialCapability);
  if (!isRecord(input)) return invalid("no_credential_capability_invalid");
  if (!NO_CREDENTIAL_PROVENANCE.has(input)) errors.push("no_credential_capability_invalid");
  if (input.capabilityKind !== "fixture_no_credential_requirement" || input.capabilityVersion !== 1 || input.fixtureOnly !== true) errors.push("no_credential_capability_invalid");
  if (!isCapabilityId(input.capabilityId, "fixture_no_credential_requirement_")) errors.push("no_credential_capability_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (input.purpose !== "no_credential_required") errors.push("purpose_mismatch");
  if (input.operation !== operation) errors.push("operation_mismatch");
  if (input.containsSecretMaterial !== false) errors.push("fixture_claimed_secret_material");
  if (input.credentialAccessRequired !== false) errors.push("credential_not_allowed_for_operation");
  validateTime(input.issuedAt, input.expiresAt, evaluatedAt, errors, "no_credential_capability_expired");
  if (hasUnsafeValues(input)) errors.push("secret_material_detected");
  if (hasUnsafeInput(pickUnknown(input, NO_CREDENTIAL_KEYS))) errors.push("secret_material_detected");
  errors.push(...validateFingerprintMatch(input, "no_credential", "capabilityFingerprint", "capabilityFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.noCredentialCapability));
  return validation(input, errors);
}

export function validateCredentialFixtureAuthorizationLink(input: unknown, purpose: CredentialPurpose = "no_credential_required"): CredentialSourceValidationResult<CredentialFixtureAuthorizationLink> {
  const errors = validateFingerprintShape(input, "authorization_link", "linkFingerprint", "linkFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.authorizationLink);
  if (!isRecord(input)) return invalid("authorization_link_invalid");
  if (!CREDENTIAL_AUTHORIZATION_LINK_PROVENANCE.has(input)) errors.push("authorization_link_invalid");
  if (input.linkKind !== "fixture_credential_authorization_link" || input.linkVersion !== 1 || input.fixtureOnly !== true) errors.push("authorization_link_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (input.purpose !== purpose) errors.push("purpose_mismatch");
  if (!isSha256(input.audienceFingerprint) || !isSha256(input.scopeFingerprint) || !isSha256(input.credentialPolicyFingerprint) || !isSha256(input.authorizationArtifactFingerprint)) errors.push("authorization_link_invalid");
  if (input.authorizationConsumed !== false) errors.push("fixture_claimed_authorization_consumption");
  if (input.authorizesCredentialAccessLive !== false) errors.push("fixture_claimed_credential_access");
  if (hasUnsafeValues(input)) errors.push("secret_material_detected");
  if (hasUnsafeInput(pickUnknown(input, AUTHORIZATION_LINK_KEYS))) errors.push("secret_material_detected");
  errors.push(...validateFingerprintMatch(input, "authorization_link", "linkFingerprint", "linkFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.authorizationLink));
  return validation(input, errors);
}

export function validateNoCredentialFixtureRequest(input: unknown, evaluatedAt: string = CREDENTIAL_SOURCE_EVALUATED_AT): CredentialSourceValidationResult<NoCredentialFixtureRequest> {
  const errors = validateFingerprintShape(input, "no_credential_request", "requestFingerprint", "requestFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.noCredentialRequest);
  if (!isRecord(input)) return invalid("request_invalid");
  if (input.requestKind !== "no_credential_fixture_request" || input.requestVersion !== 1) errors.push("request_invalid");
  if (!isRequestId(input.requestId, "no_credential_fixture_request_")) errors.push("request_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (input.adapterIdentityFingerprint !== buildCredentialSourceAdapterIdentityFingerprint()) errors.push("adapter_identity_mismatch");
  if (input.credentialPolicyId !== NO_CREDENTIAL_POLICY_ID) errors.push("credential_policy_unknown");
  if (input.purpose !== "no_credential_required") errors.push("purpose_mismatch");
  if (!isDirectSpawnOperation(input.operation)) errors.push("operation_mismatch");
  const operation = isDirectSpawnOperation(input.operation) ? input.operation : "collect_git_version";
  errors.push(...validationErrors(validateCredentialSessionCapability(input.credentialSessionCapability, evaluatedAt)));
  errors.push(...validationErrors(validateFixtureNoCredentialRequirementCapability(input.noCredentialRequirementCapability, operation, evaluatedAt)));
  if (isRecord(input.credentialSessionCapability) && input.boundarySessionId !== input.credentialSessionCapability.boundarySessionId) errors.push("session_mismatch");
  if (isRecord(input.noCredentialRequirementCapability) && input.boundarySessionId !== input.noCredentialRequirementCapability.boundarySessionId) errors.push("session_mismatch");
  if (input.attempt !== 1) errors.push("attempt_must_be_one");
  if (input.retryPolicy !== "none") errors.push("retry_not_allowed");
  validateTime(input.requestedAt, input.expiresAt, evaluatedAt, errors, "request_expired");
  for (const key of Object.keys(input)) if (!NO_CREDENTIAL_REQUEST_KEYS.has(key)) errors.push("request_invalid");
  if (hasUnsafeValues(input)) errors.push("secret_material_detected");
  if (hasUnsafeInput(pickUnknown(input, NO_CREDENTIAL_REQUEST_KEYS))) errors.push("secret_material_detected");
  errors.push(...validateFingerprintMatch(input, "no_credential_request", "requestFingerprint", "requestFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.noCredentialRequest));
  return validation(input, errors);
}

export function validateCredentialReferenceFixtureRequest(input: unknown, evaluatedAt: string = CREDENTIAL_SOURCE_EVALUATED_AT): CredentialSourceValidationResult<CredentialReferenceFixtureRequest> {
  const errors = validateFingerprintShape(input, "reference_request", "requestFingerprint", "requestFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.referenceRequest);
  if (!isRecord(input)) return invalid("request_invalid");
  if (input.requestKind !== "credential_reference_fixture_request" || input.requestVersion !== 1) errors.push("request_invalid");
  if (!isRequestId(input.requestId, "credential_reference_fixture_request_")) errors.push("request_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (input.adapterIdentityFingerprint !== buildCredentialSourceAdapterIdentityFingerprint()) errors.push("adapter_identity_mismatch");
  if (input.credentialPolicyId !== FUTURE_KEYCHAIN_REFERENCE_POLICY_ID) errors.push("credential_policy_unknown");
  if (input.purpose !== "future_supabase_cli_authentication" && input.purpose !== "future_git_remote_authentication") errors.push("purpose_mismatch");
  const purpose = input.purpose === "future_git_remote_authentication" ? "future_git_remote_authentication" : "future_supabase_cli_authentication";
  errors.push(...validationErrors(validateCredentialSessionCapability(input.credentialSessionCapability, evaluatedAt)));
  errors.push(...validationErrors(validateFixtureCredentialReferenceCapability(input.credentialReferenceCapability, purpose, evaluatedAt)));
  if (isRecord(input.credentialSessionCapability) && input.credentialSessionCapability.intendedPurpose !== purpose) errors.push("purpose_mismatch");
  if (isRecord(input.credentialReferenceCapability) && input.boundarySessionId !== input.credentialReferenceCapability.boundarySessionId) errors.push("session_mismatch");
  if (!isSha256(input.operationFingerprint)) errors.push("operation_mismatch");
  if (!isSha256(input.authorizationLinkFingerprint)) errors.push("authorization_link_mismatch");
  if (input.attempt !== 1) errors.push("attempt_must_be_one");
  if (input.retryPolicy !== "none") errors.push("retry_not_allowed");
  validateTime(input.requestedAt, input.expiresAt, evaluatedAt, errors, "request_expired");
  for (const key of Object.keys(input)) if (!REFERENCE_REQUEST_KEYS.has(key)) errors.push("request_invalid");
  if (hasUnsafeValues(input)) errors.push("secret_material_detected");
  if (hasUnsafeInput(pickUnknown(input, REFERENCE_REQUEST_KEYS))) errors.push("secret_material_detected");
  errors.push(...validateFingerprintMatch(input, "reference_request", "requestFingerprint", "requestFingerprintAlgorithm", CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.referenceRequest));
  return validation(input, errors);
}

export function classifyCredentialSource(input: unknown): CredentialSourceClassification {
  if (input === "none") return "none";
  if (input === "macos_keychain_reference_fixture") return "macos_keychain_reference_fixture";
  if (input === "unsupported_environment_source") return "unsupported_environment_source";
  if (input === "unsupported_file_source") return "unsupported_file_source";
  if (input === "unsupported_credential_helper") return "unsupported_credential_helper";
  if (input === "unsupported_browser_session") return "unsupported_browser_session";
  if (input === "unsupported_network_broker") return "unsupported_network_broker";
  return "unknown";
}

export function classifySecretPresence(input: unknown, reference = false): SecretPresenceClassification {
  if (hasUnsafeInput(input)) return "secret_material_detected";
  return reference ? "secret_reference_metadata_only" : "confirmed_absent";
}

export function validateCurrentOperationCredentialCompatibility(operation: unknown, source: CredentialSourceClassification = "none"): CredentialSourceValidationResult<Readonly<{ operation: DirectSpawnOperation; purpose: "no_credential_required"; compatible: true }>> {
  if (!isDirectSpawnOperation(operation)) return invalid("operation_mismatch");
  if (source !== "none") return invalid("credential_not_allowed_for_operation");
  return deepFreeze({ ok: true, value: { operation, purpose: "no_credential_required", compatible: true } as const });
}

function evaluateNoCredentialFixture(input: Readonly<{ request: NoCredentialFixtureRequest; evaluatedAt: string }>): CredentialSourceFixtureResult {
  const requestValidation = validateNoCredentialFixtureRequest(input.request, input.evaluatedAt);
  const blocking = requestValidation.ok ? [] : mapBlockingReasons(requestValidation.errors);
  const operation = isDirectSpawnOperation(input.request?.operation) ? input.request.operation : "collect_git_version";
  if (!validateCurrentOperationCredentialCompatibility(operation, "none").ok) blocking.push("operation_mismatch");
  return buildFixtureResult({
    boundarySessionId: isRecord(input.request) && typeof input.request.boundarySessionId === "string" ? input.request.boundarySessionId : POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    requestId: isRecord(input.request) && typeof input.request.requestId === "string" ? input.request.requestId : "invalid_request",
    purpose: "no_credential_required",
    sourceClassification: "none",
    secretPresence: requestValidation.ok ? "confirmed_absent" : deriveSecretPresence(blocking),
    leaseState: "not_required",
    cleanupPlanState: "not_required",
    revocationPlanState: "not_required",
    blocking,
    ambiguity: [],
  });
}

function evaluateCredentialReferenceFixture(input: Readonly<{ request: CredentialReferenceFixtureRequest; evaluatedAt: string }>): CredentialSourceFixtureResult {
  const requestValidation = validateCredentialReferenceFixtureRequest(input.request, input.evaluatedAt);
  const blocking = requestValidation.ok ? [] : mapBlockingReasons(requestValidation.errors);
  const purpose = isRecord(input.request) && (input.request.purpose === "future_git_remote_authentication" || input.request.purpose === "future_supabase_cli_authentication")
    ? input.request.purpose
    : "future_supabase_cli_authentication";
  return buildFixtureResult({
    boundarySessionId: isRecord(input.request) && typeof input.request.boundarySessionId === "string" ? input.request.boundarySessionId : POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    requestId: isRecord(input.request) && typeof input.request.requestId === "string" ? input.request.requestId : "invalid_request",
    purpose,
    sourceClassification: "macos_keychain_reference_fixture",
    secretPresence: requestValidation.ok ? "secret_reference_metadata_only" : deriveSecretPresence(blocking),
    leaseState: requestValidation.ok ? "fixture_reference_validated" : "fixture_lease_blocked",
    cleanupPlanState: requestValidation.ok ? "fixture_cleanup_plan_present" : "fixture_cleanup_plan_blocked",
    revocationPlanState: requestValidation.ok ? "fixture_revocation_plan_present" : "fixture_revocation_plan_blocked",
    blocking,
    ambiguity: [],
  });
}

function buildFixtureResult(input: Readonly<{
  boundarySessionId: string;
  requestId: string;
  purpose: CredentialPurpose;
  sourceClassification: CredentialSourceClassification;
  secretPresence: SecretPresenceClassification;
  leaseState: FixtureCredentialLeaseState;
  cleanupPlanState: FixtureCredentialCleanupPlanState;
  revocationPlanState: FixtureCredentialRevocationPlanState;
  blocking: readonly CredentialBoundaryBlockingReason[];
  ambiguity: readonly CredentialBoundaryAmbiguityReason[];
}>): CredentialSourceFixtureResult {
  const blocking = sorted(input.blocking);
  const ambiguity = sorted(input.ambiguity);
  const completeness = deriveCompleteness(blocking, ambiguity, input.purpose);
  const disposition = blocking.length > 0 ? "blocked_fixture" : ambiguity.length > 0 ? "ambiguous_fixture" : input.purpose === "no_credential_required" ? "compatible_fixture_no_credential" : "compatible_fixture_reference_no_secret";
  const lifecycleState: CredentialSourceFixtureLifecycleState = blocking.length > 0 ? "fixture_blocked" : ambiguity.length > 0 ? "fixture_ambiguous" : input.purpose === "no_credential_required" ? "fixture_no_credential_confirmed" : "fixture_reference_validated";
  const lease = freezeWithFingerprint({
    metadataKind: "sanitized_fixture_credential_lease",
    metadataVersion: 1,
    fixtureOnly: true,
    authoritativeLive: false,
    secretMaterialPresent: false,
    credentialAccessed: false,
    credentialDecrypted: false,
    credentialDelivered: false,
    leaseIssuedLive: false,
    leaseActivatedLive: false,
    renewable: false,
    replayable: false,
    boundarySessionId: input.boundarySessionId,
    requestId: input.requestId,
    purpose: input.purpose,
    sourceClassification: input.sourceClassification,
    ...(input.sourceClassification === "macos_keychain_reference_fixture" ? { audienceFingerprint: sha256(`fixture-audience:${input.purpose}`), scopeFingerprint: sha256(`fixture-scope:${input.purpose}`) } : {}),
    issuedAtFixture: CREDENTIAL_SOURCE_ISSUED_AT,
    expiresAtFixture: CREDENTIAL_SOURCE_EXPIRES_AT,
    authority: "fixture_structural_only",
    completeness,
    disposition,
    blockingReasons: blocking,
    ambiguityReasons: ambiguity,
  } satisfies Omit<SanitizedFixtureCredentialLeaseMetadata, "leaseFingerprintAlgorithm" | "leaseFingerprint">, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.fixtureLease, "leaseFingerprint");
  const sourceEvidence = freezeWithFingerprint({
    evidenceKind: "sanitized_credential_source_evidence",
    evidenceVersion: 1,
    fixtureOnly: true,
    authoritativeLive: false,
    secretMaterialPresent: false,
    credentialAccessed: false,
    credentialRead: false,
    credentialDecrypted: false,
    credentialDelivered: false,
    keychainAccessAttempted: false,
    environmentRead: false,
    filesystemRead: false,
    credentialHelperInvoked: false,
    networkBrokerContacted: false,
    authorizationConsumed: false,
    enablesCredentialAccess: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    boundarySessionId: input.boundarySessionId,
    requestId: input.requestId,
    purpose: input.purpose,
    sourceClassification: input.sourceClassification,
    secretPresence: input.secretPresence,
    authority: "fixture_structural_only",
    completeness,
    lifecycleState,
    disposition,
    blockingReasons: blocking,
    ambiguityReasons: ambiguity,
  } satisfies Omit<SanitizedCredentialSourceEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.sourceEvidence, "evidenceFingerprint");
  const cleanupEvidence = freezeWithFingerprint({
    evidenceKind: "sanitized_credential_cleanup_evidence",
    evidenceVersion: 1,
    fixtureOnly: true,
    secretMaterialPresent: false,
    credentialAccessed: false,
    credentialDelivered: false,
    cleanupRequiredLive: false,
    cleanupAttemptedLive: false,
    cleanupCompletedLive: false,
    provesCredentialCleanupLive: false,
    keychainItemModified: false,
    keychainItemDeleted: false,
    credentialFileDeleted: false,
    environmentCleared: false,
    processMemoryVerifiedCleared: false,
    boundarySessionId: input.boundarySessionId,
    requestId: input.requestId,
    cleanupPlanState: input.cleanupPlanState,
    authority: "fixture_structural_only",
  } satisfies Omit<SanitizedCredentialCleanupEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.cleanupEvidence, "evidenceFingerprint");
  const revocationEvidence = freezeWithFingerprint({
    evidenceKind: "sanitized_credential_revocation_evidence",
    evidenceVersion: 1,
    fixtureOnly: true,
    credentialRevokedLive: false,
    revocationAttemptedLive: false,
    provesRevocationLive: false,
    keychainModified: false,
    providerContacted: false,
    boundarySessionId: input.boundarySessionId,
    requestId: input.requestId,
    revocationPlanState: input.revocationPlanState,
    authority: "fixture_structural_only",
  } satisfies Omit<SanitizedCredentialRevocationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.revocationEvidence, "evidenceFingerprint");
  const compatibility = buildCredentialSourceCompatibilitySummary();
  return freezeWithFingerprint({
    resultKind: "credential_source_fixture_result",
    resultVersion: 1,
    fixtureOnly: true,
    authoritativeLive: false,
    secretMaterialPresent: false,
    credentialAccessed: false,
    credentialRead: false,
    credentialDecrypted: false,
    credentialDelivered: false,
    leaseIssuedLive: false,
    leaseActivatedLive: false,
    keychainAccessAttempted: false,
    keychainItemRead: false,
    keychainItemModified: false,
    keychainItemDeleted: false,
    environmentRead: false,
    environmentCredentialInjected: false,
    argvCredentialInjected: false,
    stdinCredentialInjected: false,
    filesystemRead: false,
    credentialFileCreated: false,
    credentialHelperInvoked: false,
    networkBrokerContacted: false,
    authorizationConsumed: false,
    cleanupAttemptedLive: false,
    cleanupCompletedLive: false,
    provesCredentialCleanupLive: false,
    revocationAttemptedLive: false,
    credentialRevokedLive: false,
    provesRevocationLive: false,
    enablesCredentialAccess: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    lease,
    sourceEvidence,
    cleanupEvidence,
    revocationEvidence,
    compatibility,
  } satisfies Omit<CredentialSourceFixtureResult, "resultFingerprintAlgorithm" | "resultFingerprint">, CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS.result, "resultFingerprint");
}

function deriveCompleteness(blocking: readonly CredentialBoundaryBlockingReason[], ambiguity: readonly CredentialBoundaryAmbiguityReason[], purpose: CredentialPurpose): CredentialBoundaryCompleteness {
  if (blocking.includes("secret_material_detected") || blocking.includes("fixture_claimed_secret_material")) return "secret_material_detected";
  if (blocking.includes("session_mismatch") || blocking.includes("purpose_mismatch")) return "contradictory";
  const missing = new Set<CredentialBoundaryCompleteness>();
  if (blocking.includes("credential_session_invalid")) missing.add("incomplete_credential_session");
  if (blocking.includes("unsupported_credential_source")) missing.add("incomplete_source_classification");
  if (blocking.includes("purpose_mismatch")) missing.add("incomplete_purpose_binding");
  if (blocking.includes("operation_mismatch")) missing.add("incomplete_operation_binding");
  if (blocking.includes("audience_mismatch")) missing.add("incomplete_audience_binding");
  if (blocking.includes("scope_mismatch")) missing.add("incomplete_scope_binding");
  if (blocking.includes("authorization_link_invalid") || blocking.includes("authorization_link_mismatch")) missing.add("incomplete_authorization_link");
  if (blocking.includes("credential_session_expired") || blocking.includes("credential_reference_expired") || blocking.includes("no_credential_capability_expired") || blocking.includes("request_expired")) missing.add("incomplete_freshness");
  if (ambiguity.length > 1 || missing.size > 1) return "incomplete_multiple";
  if (missing.size === 1) return missing.values().next().value ?? "unsupported";
  return purpose === "no_credential_required" ? "complete_no_credential_fixture_structure" : "complete_reference_fixture_structure";
}

function deriveSecretPresence(blocking: readonly CredentialBoundaryBlockingReason[]): SecretPresenceClassification {
  if (blocking.includes("secret_material_detected") || blocking.includes("token_material_detected") || blocking.includes("password_material_detected")) return "secret_material_detected";
  if (blocking.includes("request_invalid")) return "secret_presence_unknown";
  return "confirmed_absent";
}

const CREDENTIAL_SESSION_KEYS = new Set(["capabilityKind", "capabilityVersion", "capabilityId", "boundarySessionId", "intendedPurpose", "issuedAt", "expiresAt", "fixtureOnly", "containsSecretMaterial", "capabilityFingerprintAlgorithm", "capabilityFingerprint"]);
const CREDENTIAL_REFERENCE_KEYS = new Set(["capabilityKind", "capabilityVersion", "capabilityId", "boundarySessionId", "purpose", "sourceClassification", "referenceIdentityFingerprint", "audienceFingerprint", "scopeFingerprint", "issuedAt", "expiresAt", "fixtureOnly", "containsSecretMaterial", "accessesKeychain", "enablesCredentialAccess", "enablesProcessStart", "capabilityFingerprintAlgorithm", "capabilityFingerprint"]);
const NO_CREDENTIAL_KEYS = new Set(["capabilityKind", "capabilityVersion", "capabilityId", "boundarySessionId", "purpose", "operation", "issuedAt", "expiresAt", "fixtureOnly", "containsSecretMaterial", "credentialAccessRequired", "capabilityFingerprintAlgorithm", "capabilityFingerprint"]);
const AUTHORIZATION_LINK_KEYS = new Set(["linkKind", "linkVersion", "boundarySessionId", "purpose", "operation", "audienceFingerprint", "scopeFingerprint", "credentialPolicyFingerprint", "authorizationArtifactFingerprint", "fixtureOnly", "authorizationConsumed", "authorizesCredentialAccessLive", "linkFingerprintAlgorithm", "linkFingerprint"]);
const NO_CREDENTIAL_REQUEST_KEYS = new Set(["requestKind", "requestVersion", "requestId", "boundarySessionId", "adapterIdentityFingerprint", "credentialPolicyId", "purpose", "operation", "credentialSessionCapability", "noCredentialRequirementCapability", "requestedAt", "expiresAt", "attempt", "retryPolicy", "requestFingerprintAlgorithm", "requestFingerprint"]);
const REFERENCE_REQUEST_KEYS = new Set(["requestKind", "requestVersion", "requestId", "boundarySessionId", "adapterIdentityFingerprint", "credentialPolicyId", "purpose", "operationFingerprint", "credentialSessionCapability", "credentialReferenceCapability", "authorizationLinkFingerprint", "requestedAt", "expiresAt", "attempt", "retryPolicy", "requestFingerprintAlgorithm", "requestFingerprint"]);

const BLOCKING_REASON_VALUES = [
  "request_invalid", "request_expired", "adapter_identity_mismatch", "credential_policy_unknown", "credential_session_invalid", "credential_session_expired", "credential_reference_invalid", "credential_reference_expired", "no_credential_capability_invalid", "no_credential_capability_expired", "session_mismatch", "purpose_mismatch", "operation_mismatch", "audience_mismatch", "scope_mismatch", "authorization_link_invalid", "authorization_link_mismatch", "retry_not_allowed", "attempt_must_be_one", "credential_not_allowed_for_operation", "credential_required_but_missing", "unsupported_credential_source", "environment_source_forbidden", "file_source_forbidden", "credential_helper_forbidden", "browser_session_forbidden", "network_broker_forbidden", "keychain_access_forbidden", "secret_material_detected", "token_material_detected", "password_material_detected", "api_key_material_detected", "private_key_material_detected", "encrypted_secret_blob_detected", "encoded_secret_blob_detected", "environment_delivery_forbidden", "argv_delivery_forbidden", "stdin_delivery_forbidden", "filesystem_delivery_forbidden", "persistence_forbidden", "logging_forbidden", "renewal_forbidden", "replay_forbidden", "fixture_claimed_credential_access", "fixture_claimed_secret_material", "fixture_claimed_live_lease", "fixture_claimed_keychain_access", "fixture_claimed_delivery", "fixture_claimed_cleanup", "fixture_claimed_revocation", "fixture_claimed_authorization_consumption", "fixture_claimed_process_start", "fixture_claimed_runner_enablement",
] as const satisfies readonly CredentialBoundaryBlockingReason[];
const BLOCKING_REASON_SET = new Set<string>(BLOCKING_REASON_VALUES);

function mapBlockingReasons(errors: readonly string[]): CredentialBoundaryBlockingReason[] {
  return sorted(errors.map((error) => (BLOCKING_REASON_SET.has(error) ? error as CredentialBoundaryBlockingReason : "request_invalid")));
}

function validationErrors(result: CredentialSourceValidationResult<unknown>): readonly CredentialBoundaryBlockingReason[] {
  return result.ok ? [] : mapBlockingReasons(result.errors);
}

function sourceBlockingReason(input: unknown): CredentialBoundaryBlockingReason {
  if (input === "unsupported_environment_source") return "environment_source_forbidden";
  if (input === "unsupported_file_source") return "file_source_forbidden";
  if (input === "unsupported_credential_helper") return "credential_helper_forbidden";
  if (input === "unsupported_browser_session") return "browser_session_forbidden";
  if (input === "unsupported_network_broker") return "network_broker_forbidden";
  return "unsupported_credential_source";
}

function validateFingerprintShape(input: unknown, prefix: string, fingerprintKey: string, algorithmKey: string, domain: string): string[] {
  void domain;
  const errors: string[] = [];
  if (!isRecord(input)) return [`${prefix}_invalid`];
  if (input[algorithmKey] !== "sha256") errors.push("request_invalid");
  if (!isSha256(input[fingerprintKey])) errors.push("request_invalid");
  return errors;
}

function validateFingerprintMatch(input: unknown, prefix: string, fingerprintKey: string, algorithmKey: string, domain: string): string[] {
  const errors: string[] = [];
  if (!isRecord(input)) return [`${prefix}_invalid`];
  if (hasUnsafeValues(input)) return ["secret_material_detected"];
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  const expected = safeFingerprint(domain, core);
  if (!expected || input[fingerprintKey] !== expected) errors.push("request_invalid");
  return errors;
}

function exact<T>(input: unknown, expected: T, prefix: string, fingerprintKey?: string, algorithmKey?: string, domain?: string): CredentialSourceValidationResult<T> {
  const errors: string[] = [];
  if (!isRecord(input) || !isRecord(expected)) return invalid(`${prefix}_invalid`);
  for (const key of Object.keys(input)) if (!Object.keys(expected).includes(key)) errors.push("request_invalid");
  for (const key of Object.keys(expected)) if (!Object.keys(input).includes(key)) errors.push("request_invalid");
  if (hasUnsafeValues(input) || hasUnsafeInput(pickUnknown(input, new Set(Object.keys(expected))))) errors.push("secret_material_detected");
  if (fingerprintKey && algorithmKey && domain) {
    errors.push(...validateFingerprintShape(input, prefix, fingerprintKey, algorithmKey, domain));
    errors.push(...validateFingerprintMatch(input, prefix, fingerprintKey, algorithmKey, domain));
  }
  const inputJson = safeStringify(input);
  const expectedJson = safeStringify(expected);
  if (!inputJson || !expectedJson || inputJson !== expectedJson) errors.push("request_invalid");
  return validation(input, errors);
}

function hasUnsafeInput(input: unknown): boolean {
  const prohibited = new Set([
    "password", "passphrase", "token", "accesstoken", "refreshtoken", "apikey", "secret", "secretvalue", "privatekey", "clientsecret", "sessioncookie", "authorizationheader", "bearer", "credential", "credentialvalue", "keychainresult", "environmentvalue", "filecontent", "stdinvalue", "argvcredential", "encryptedsecret", "encodedsecret", "base64secret", "hexsecret", "keychainaccount", "keychainservice", "keychainpassword", "credentialfile", "credentialpath", "env", "environment", "processenv", "authorizationconsumed", "credentialaccessed", "credentialread", "credentialdelivered", "leaseissuedlive", "cleanupcompletedlive", "credentialrevokedlive", "enablescredentialaccess", "enablesprocessstart", "enablespreflightrunner", "keychainaccessattempted", "keychainitemread",
  ].map(normalizeCredentialKey));
  const seen = new WeakSet<object>();
  let nodes = 0;
  const visit = (value: unknown, depth: number): boolean => {
    if (depth > 24 || nodes > 512) return true;
    if (typeof value === "string") return hasSensitiveValue(value);
    if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return true;
    if (value === null || typeof value !== "object") return false;
    if (seen.has(value)) return false;
    seen.add(value);
    nodes += 1;
    if (Array.isArray(value)) return value.length > 256 || value.some((item) => visit(item, depth + 1));
    const record = value as Record<string, unknown>;
    return Object.keys(record).some((key) => prohibited.has(normalizeCredentialKey(key)) || visit(record[key], depth + 1));
  };
  return visit(input, 0);
}

function hasUnsafeValues(input: unknown): boolean {
  const seen = new WeakSet<object>();
  let nodes = 0;
  const visit = (value: unknown, depth: number): boolean => {
    if (depth > 24 || nodes > 512) return true;
    if (typeof value === "string") return hasSensitiveValue(value);
    if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return true;
    if (value === null || typeof value !== "object") return false;
    if (seen.has(value)) return false;
    seen.add(value);
    nodes += 1;
    if (Array.isArray(value)) return value.length > 256 || value.some((item) => visit(item, depth + 1));
    return Object.values(value as Record<string, unknown>).some((item) => visit(item, depth + 1));
  };
  return visit(input, 0);
}

function hasSensitiveValue(input: string): boolean {
  if (input.length > 512) return true;
  const normalized = input.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/gu, "");
  const decoded = safeDecodeURIComponent(normalized);
  return /authorization:\s*bearer|bearer\s+[a-z0-9._-]+|password\s*=|api[\s_-]?key\s*=|access[\s_-]?token\s*=|refresh[\s_-]?token\s*=|-----BEGIN[\s\S]{0,80}PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}|https?:\/\/[^/\s:@]+:[^/\s:@]+@|base64[\s_-]?secret|hex[\s_-]?secret|[A-Za-z0-9+/]{80,}={0,2}/iu.test(normalized)
    || (decoded !== normalized && hasSensitiveValue(decoded));
}

function pickUnknown(input: Record<string, unknown>, allowed: Set<string>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([key]) => !allowed.has(key)));
}

function rejectUnsafeBuilderInput(input: unknown): void {
  if (hasSecretBearingInput(input) || hasUnsafeValues(input)) throw new Error("credential_source_fixture_input_rejected");
}

function normalizeCredentialKey(input: string): string {
  return input.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/gu, "").replace(/[\s_-]+/gu, "").toLowerCase();
}

function hasSecretBearingInput(input: unknown): boolean {
  const prohibited = new Set([
    "password", "passphrase", "token", "accesstoken", "refreshtoken", "apikey", "secret", "secretvalue", "privatekey", "clientsecret", "sessioncookie", "authorizationheader", "bearer", "credential", "credentialvalue", "keychainresult", "environmentvalue", "filecontent", "stdinvalue", "argvcredential", "encryptedsecret", "encodedsecret", "base64secret", "hexsecret", "keychainaccount", "keychainservice", "keychainpassword", "credentialfile", "credentialpath", "env", "environment", "processenv",
  ].map(normalizeCredentialKey));
  const seen = new WeakSet<object>();
  let nodes = 0;
  const visit = (value: unknown, depth: number): boolean => {
    if (depth > 24 || nodes > 512) return true;
    if (typeof value === "string") return hasSensitiveValue(value);
    if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return true;
    if (value === null || typeof value !== "object") return false;
    if (seen.has(value)) return false;
    seen.add(value);
    nodes += 1;
    if (Array.isArray(value)) return value.length > 256 || value.some((item) => visit(item, depth + 1));
    const record = value as Record<string, unknown>;
    return Object.keys(record).some((key) => prohibited.has(normalizeCredentialKey(key)) || visit(record[key], depth + 1));
  };
  return visit(input, 0);
}

function safeDecodeURIComponent(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function validateTime(issuedAt: unknown, expiresAt: unknown, evaluatedAt: string, errors: string[], expiredReason: string): void {
  if (!isIso(issuedAt) || !isIso(expiresAt) || !isIso(evaluatedAt)) {
    errors.push("request_invalid");
    return;
  }
  if (expiresAt <= issuedAt || evaluatedAt > expiresAt) errors.push(expiredReason);
}

function validation<T>(input: unknown, errors: readonly string[]): CredentialSourceValidationResult<T> {
  if (errors.length > 0) return deepFreeze({ ok: false, errors: sorted(mapRawErrors(errors)) });
  return deepFreeze({ ok: true, value: input as T });
}

function invalid<T>(error: string): CredentialSourceValidationResult<T> {
  return deepFreeze({ ok: false, errors: [error] });
}

function mapRawErrors(errors: readonly string[]): string[] {
  return errors.map((error) => error === "password_material_detected" || error === "token_material_detected" ? error : error);
}

function isCredentialPurpose(input: unknown): input is CredentialPurpose {
  return input === "no_credential_required" || input === "future_supabase_cli_authentication" || input === "future_git_remote_authentication";
}

function isDirectSpawnOperation(input: unknown): input is DirectSpawnOperation {
  return input === "collect_git_version" || input === "collect_supabase_cli_version";
}

function isCapabilityId(input: unknown, prefix: string): boolean {
  return typeof input === "string" && input.startsWith(prefix) && /^[a-z0-9_]+$/u.test(input);
}

function isRequestId(input: unknown, prefix: string): boolean {
  return typeof input === "string" && input.startsWith(prefix) && /^[a-z0-9_]+$/u.test(input);
}

function isSha256(input: unknown): input is string {
  return typeof input === "string" && /^[a-f0-9]{64}$/u.test(input);
}

function isIso(input: unknown): input is string {
  return typeof input === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(input) && !Number.isNaN(Date.parse(input));
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function sorted<T extends string>(input: readonly T[]): T[] {
  return [...new Set(input)].sort();
}

function freezeWithFingerprint<T extends Record<string, unknown>, K extends string>(core: T, domain: string, key: K): Readonly<T & Record<`${K}Algorithm`, "sha256"> & Record<K, string>> {
  return deepFreeze({ ...core, [`${key}Algorithm`]: "sha256", [key]: fingerprint(domain, core) } as T & Record<`${K}Algorithm`, "sha256"> & Record<K, string>);
}

function safeFingerprint(domain: string, input: unknown): string | null {
  const value = safeStringify(input);
  return value ? sha256(`${domain}:${value}`) : null;
}

function fingerprint(domain: string, input: unknown): string {
  return sha256(`${domain}:${stableStringify(input)}`);
}

function stableStringify(input: unknown): string {
  const seen = new WeakSet<object>();
  const normalize = (value: unknown): unknown => {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) throw new Error("cyclic input");
    seen.add(value);
    if (Array.isArray(value)) {
      const mapped = value.map(normalize);
      seen.delete(value);
      return mapped;
    }
    const record = value as Record<string, unknown>;
    const mapped = Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalize(record[key])]));
    seen.delete(value);
    return mapped;
  };
  return JSON.stringify(normalize(input));
}

function safeStringify(input: unknown): string | null {
  try {
    return stableStringify(input);
  } catch {
    return null;
  }
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function deepFreeze<T>(input: T): T {
  if (input === null || typeof input !== "object") return input;
  Object.freeze(input);
  for (const value of Object.values(input as Record<string, unknown>)) if (value && typeof value === "object" && !Object.isFrozen(value)) deepFreeze(value);
  return input;
}
