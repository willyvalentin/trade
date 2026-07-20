import { createHash } from "node:crypto";

import { POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION } from "@/lib/post-trade-live-read-only-macos-process-driver-design";

export const TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY = deepFreeze({
  resolverKind: "trusted_live_resolver_adapter",
  resolverId: "ture.execution.trusted-live-resolver-adapter.fixture.v1",
  platform: "macos",
  implementationMode: "fixture_only",
  sourceModel: "injected_fixture",
  policyVersion: 1,
} as const);

export const TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID = "first_live_read_only_executable_resolution_v1" as const;
export const TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID = "first_live_read_only_repository_root_resolution_v1" as const;
export const TRUSTED_LIVE_RESOLVER_ISSUED_AT = "2026-07-17T10:10:00.000Z" as const;
export const TRUSTED_LIVE_RESOLVER_EVALUATED_AT = "2026-07-17T10:10:05.000Z" as const;
export const TRUSTED_LIVE_RESOLVER_EXPIRES_AT = "2026-07-17T10:10:30.000Z" as const;

export const TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:trusted-live-resolver-adapter:identity:v1",
  executablePolicy: "ture:trusted-live-resolver-adapter:executable-policy:v1",
  repositoryPolicy: "ture:trusted-live-resolver-adapter:repository-policy:v1",
  resolverSessionCapability: "ture:trusted-live-resolver-adapter:resolver-session-capability:v1",
  executableCandidateCapability: "ture:trusted-live-resolver-adapter:executable-candidate-capability:v1",
  repositoryCandidateCapability: "ture:trusted-live-resolver-adapter:repository-candidate-capability:v1",
  executableRequest: "ture:trusted-live-resolver-adapter:executable-request:v1",
  repositoryRequest: "ture:trusted-live-resolver-adapter:repository-request:v1",
  executableFixture: "ture:trusted-live-resolver-adapter:executable-fixture:v1",
  repositoryFixture: "ture:trusted-live-resolver-adapter:repository-fixture:v1",
  executableEvidence: "ture:trusted-live-resolver-adapter:executable-evidence:v1",
  repositoryEvidence: "ture:trusted-live-resolver-adapter:repository-evidence:v1",
  executableCompatibility: "ture:trusted-live-resolver-adapter:executable-compatibility:v1",
  repositoryCompatibility: "ture:trusted-live-resolver-adapter:repository-compatibility:v1",
  executableResult: "ture:trusted-live-resolver-adapter:executable-result:v1",
  repositoryResult: "ture:trusted-live-resolver-adapter:repository-result:v1",
} as const);

const RESOLVER_SESSION_CAPABILITY_PROVENANCE = new WeakSet<object>();
const EXECUTABLE_CANDIDATE_CAPABILITY_PROVENANCE = new WeakSet<object>();
const REPOSITORY_CANDIDATE_CAPABILITY_PROVENANCE = new WeakSet<object>();

export type ValidationResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; errors: readonly string[] }>;
export type TrustedResolverOperation = "resolve_trusted_executable" | "resolve_trusted_repository_root";
export type FixtureAbsoluteMacosPath = string & { readonly __fixtureAbsoluteMacosPath: unique symbol };
export type ApprovedExecutableRootClass = "system_usr_bin" | "homebrew_opt" | "homebrew_bin" | "approved_application_support_tooling";
export type ApprovedRepositoryRootClass = "reviewed_workspace_root";
export type FixtureFilesystemObjectType = "regular_file" | "directory" | "symlink" | "other" | "missing" | "unknown";
export type FixtureOwnershipState =
  | "modeled_expected_owner"
  | "modeled_unexpected_owner"
  | "modeled_group_writable"
  | "modeled_world_writable"
  | "modeled_unsafe_permissions"
  | "ownership_unavailable"
  | "ownership_ambiguous";
export type FixtureProvenanceState =
  | "modeled_approved_distribution"
  | "modeled_approved_repository"
  | "modeled_unapproved_source"
  | "provenance_unavailable"
  | "provenance_ambiguous";
export type FixtureSymlinkState = "modeled_not_symlink" | "modeled_symlink" | "symlink_state_unavailable" | "symlink_state_ambiguous";
export type FixtureArchitectureState = "modeled_arm64" | "modeled_x86_64" | "modeled_universal" | "modeled_unsupported" | "architecture_unavailable" | "architecture_ambiguous";
export type FixtureRosettaState =
  | "modeled_native_execution"
  | "modeled_rosetta_required_and_approved"
  | "modeled_rosetta_required_not_approved"
  | "modeled_rosetta_not_applicable"
  | "rosetta_state_unavailable"
  | "rosetta_state_ambiguous";
export type FixtureRepositoryMarkerState =
  | "modeled_exact_reviewed_repository"
  | "modeled_repository_marker_present_but_identity_mismatch"
  | "modeled_not_repository"
  | "repository_marker_unavailable"
  | "repository_marker_ambiguous";
export type ResolverCandidateSetClassification = "exactly_one_candidate" | "no_candidate" | "multiple_candidates" | "candidate_set_incomplete" | "candidate_set_ambiguous";
export type ExecutableSelectionDisposition = "compatible_fixture_candidate" | "blocked_fixture_candidate" | "ambiguous_fixture_candidate";
export type RepositorySelectionDisposition = "compatible_fixture_repository" | "blocked_fixture_repository" | "ambiguous_fixture_repository";
export type TrustedResolverAuthorityClassification = "fixture_structural_only" | "live_non_authoritative" | "live_authoritative";
export type ExecutableResolutionCompleteness =
  | "complete_fixture_structure"
  | "incomplete_candidate_set"
  | "incomplete_path_scope"
  | "incomplete_object_type"
  | "incomplete_permissions"
  | "incomplete_ownership"
  | "incomplete_provenance"
  | "incomplete_symlink_state"
  | "incomplete_architecture"
  | "incomplete_rosetta_state"
  | "incomplete_freshness"
  | "incomplete_multiple"
  | "contradictory"
  | "unsupported";
export type RepositoryResolutionCompleteness =
  | "complete_fixture_structure"
  | "incomplete_candidate_set"
  | "incomplete_path_scope"
  | "incomplete_object_type"
  | "incomplete_repository_marker"
  | "incomplete_ownership"
  | "incomplete_provenance"
  | "incomplete_symlink_state"
  | "incomplete_freshness"
  | "incomplete_multiple"
  | "contradictory"
  | "unsupported";

export type ExecutableResolverBlockingReason =
  | "request_invalid"
  | "request_expired"
  | "resolver_identity_mismatch"
  | "resolver_policy_unknown"
  | "operation_mismatch"
  | "resolver_session_capability_invalid"
  | "resolver_session_capability_expired"
  | "candidate_capability_invalid"
  | "candidate_capability_expired"
  | "session_mismatch"
  | "no_candidate"
  | "multiple_candidates"
  | "candidate_identity_mismatch"
  | "tool_identity_mismatch"
  | "path_invalid"
  | "path_not_absolute"
  | "path_contains_parent_traversal"
  | "path_contains_glob"
  | "path_contains_shell_control"
  | "approved_root_mismatch"
  | "filesystem_object_not_regular_file"
  | "executable_permission_missing"
  | "ownership_mismatch"
  | "unsafe_permissions"
  | "provenance_unapproved"
  | "symlink_candidate"
  | "architecture_unsupported"
  | "rosetta_not_approved"
  | "fixture_claimed_live_observation"
  | "fixture_claimed_live_authority"
  | "fixture_claimed_live_existence_proof"
  | "fixture_claimed_live_trust_proof"
  | "fixture_claimed_live_capability"
  | "fixture_claimed_process_start"
  | "fixture_claimed_runner_enablement"
  | "sensitive_material_present";
export type RepositoryResolverBlockingReason =
  | "request_invalid"
  | "request_expired"
  | "resolver_identity_mismatch"
  | "resolver_policy_unknown"
  | "operation_mismatch"
  | "resolver_session_capability_invalid"
  | "resolver_session_capability_expired"
  | "candidate_capability_invalid"
  | "candidate_capability_expired"
  | "session_mismatch"
  | "no_candidate"
  | "multiple_candidates"
  | "repository_identity_mismatch"
  | "path_invalid"
  | "path_not_absolute"
  | "path_contains_parent_traversal"
  | "path_contains_glob"
  | "approved_root_mismatch"
  | "filesystem_object_not_directory"
  | "repository_marker_mismatch"
  | "ownership_mismatch"
  | "unsafe_permissions"
  | "provenance_unapproved"
  | "symlink_candidate"
  | "fixture_claimed_live_observation"
  | "fixture_claimed_live_authority"
  | "fixture_claimed_live_existence_proof"
  | "fixture_claimed_live_trust_proof"
  | "fixture_claimed_live_capability"
  | "fixture_claimed_git_enablement"
  | "fixture_claimed_process_start"
  | "fixture_claimed_runner_enablement"
  | "sensitive_material_present";
export type ExecutableResolverAmbiguityReason =
  | "candidate_set_incomplete"
  | "candidate_set_ambiguous"
  | "path_scope_incomplete"
  | "filesystem_object_type_unknown"
  | "executable_permission_unknown"
  | "ownership_unavailable"
  | "ownership_ambiguous"
  | "provenance_unavailable"
  | "provenance_ambiguous"
  | "symlink_state_unavailable"
  | "symlink_state_ambiguous"
  | "architecture_unavailable"
  | "architecture_ambiguous"
  | "rosetta_state_unavailable"
  | "rosetta_state_ambiguous"
  | "evidence_stale"
  | "evidence_session_inconsistent"
  | "fixture_contradictory";
export type RepositoryResolverAmbiguityReason =
  | "candidate_set_incomplete"
  | "candidate_set_ambiguous"
  | "path_scope_incomplete"
  | "filesystem_object_type_unknown"
  | "repository_marker_unavailable"
  | "repository_marker_ambiguous"
  | "ownership_unavailable"
  | "ownership_ambiguous"
  | "provenance_unavailable"
  | "provenance_ambiguous"
  | "symlink_state_unavailable"
  | "symlink_state_ambiguous"
  | "evidence_stale"
  | "evidence_session_inconsistent"
  | "fixture_contradictory";

export type ResolverSessionCapability = Readonly<{
  capabilityKind: "resolver_session";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  intendedPlatform: "macos";
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type FixtureExecutableCandidateCapability = Readonly<{
  capabilityKind: "fixture_executable_candidate";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  candidateIdentityFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  observedLive: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type FixtureRepositoryCandidateCapability = Readonly<{
  capabilityKind: "fixture_repository_candidate";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  candidateIdentityFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  observedLive: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type TrustedExecutableResolutionPolicy = Readonly<{
  policyId: typeof TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID;
  operation: "resolve_trusted_executable";
  platform: "macos";
  candidateSource: "injected_fixture";
  oneExactExecutableOnly: true;
  allowPathSearch: false;
  allowFilesystemInspection: false;
  allowEnvironmentPath: false;
  allowShellLookup: false;
  allowCurrentWorkingDirectoryLookup: false;
  allowRelativePaths: false;
  allowHomeExpansion: false;
  allowGlob: false;
  allowWildcard: false;
  allowSymlinkTargetSelection: false;
  requireAbsolutePathStructure: true;
  requireApprovedRootScope: true;
  requireRegularFileStructure: true;
  requireExecutablePermissionEvidence: true;
  requireOwnershipEvidence: true;
  requireProvenanceEvidence: true;
  requireSymlinkEvidence: true;
  requireArchitectureEvidence: true;
  requireRosettaEvidence: true;
  requireFreshEvidence: true;
  requireSameSessionEvidence: true;
  retryPolicy: "none";
  fixtureMayIssueLiveCapability: false;
  fixtureMayEnableProcessStart: false;
  fixtureMayEnableRunner: false;
  allowedArchitectureStates: readonly ["modeled_arm64", "modeled_universal"];
  allowedRosettaStates: readonly ["modeled_native_execution", "modeled_rosetta_not_applicable"];
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
}>;

export type TrustedRepositoryResolutionPolicy = Readonly<{
  policyId: typeof TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID;
  operation: "resolve_trusted_repository_root";
  candidateSource: "injected_fixture";
  oneExactRepositoryRootOnly: true;
  allowFilesystemInspection: false;
  allowCurrentWorkingDirectoryDiscovery: false;
  allowParentDirectoryTraversal: false;
  allowGitCommandDiscovery: false;
  allowEnvironmentRoot: false;
  allowRelativePaths: false;
  allowHomeExpansion: false;
  allowGlob: false;
  allowWildcard: false;
  requireAbsolutePathStructure: true;
  requireApprovedRootScope: true;
  requireDirectoryStructure: true;
  requireRepositoryMarkerEvidence: true;
  requireOwnershipEvidence: true;
  requireProvenanceEvidence: true;
  requireSymlinkEvidence: true;
  requireFreshEvidence: true;
  requireSameSessionEvidence: true;
  retryPolicy: "none";
  fixtureMayIssueLiveCapability: false;
  fixtureMayEnableGitOperation: false;
  fixtureMayEnableProcessStart: false;
  fixtureMayEnableRunner: false;
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
}>;

export type FixtureExecutableIdentity = Readonly<{
  identityKind: "fixture_executable_identity";
  identityVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  candidateId: string;
  boundarySessionId: string;
  structuralPath: FixtureAbsoluteMacosPath;
  basename: string;
  approvedRootClass: ApprovedExecutableRootClass;
  approvedRootFingerprint: string;
  expectedToolIdentity: "git" | "supabase_cli";
  filesystemObjectType: FixtureFilesystemObjectType;
  executablePermissionState: "modeled_executable" | "modeled_not_executable" | "unknown";
  ownershipState: FixtureOwnershipState;
  provenanceState: FixtureProvenanceState;
  symlinkState: FixtureSymlinkState;
  architectureState: FixtureArchitectureState;
  rosettaState: FixtureRosettaState;
  evidenceCapturedAt: string;
  evidenceExpiresAt: string;
  identityFingerprintAlgorithm: "sha256";
  identityFingerprint: string;
}>;

export type FixtureRepositoryIdentity = Readonly<{
  identityKind: "fixture_repository_identity";
  identityVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  candidateId: string;
  boundarySessionId: string;
  structuralRootPath: FixtureAbsoluteMacosPath;
  approvedRootClass: "reviewed_workspace_root";
  approvedRootFingerprint: string;
  filesystemObjectType: FixtureFilesystemObjectType;
  repositoryMarkerState: FixtureRepositoryMarkerState;
  ownershipState: FixtureOwnershipState;
  provenanceState: FixtureProvenanceState;
  symlinkState: FixtureSymlinkState;
  evidenceCapturedAt: string;
  evidenceExpiresAt: string;
  identityFingerprintAlgorithm: "sha256";
  identityFingerprint: string;
}>;

export type TrustedExecutableResolutionRequest = Readonly<{
  requestKind: "trusted_executable_resolution";
  requestVersion: 1;
  requestId: string;
  boundarySessionId: string;
  resolverIdentityFingerprint: string;
  resolverPolicyId: typeof TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID;
  operation: "resolve_trusted_executable";
  resolverSessionCapability: ResolverSessionCapability;
  expectedToolIdentity: "git" | "supabase_cli";
  expectedApprovedRootClass: ApprovedExecutableRootClass;
  expectedCandidateIdentityFingerprint: string;
  requestedAt: string;
  expiresAt: string;
  attempt: 1;
  retryPolicy: "none";
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
}>;

export type TrustedRepositoryResolutionRequest = Readonly<{
  requestKind: "trusted_repository_root_resolution";
  requestVersion: 1;
  requestId: string;
  boundarySessionId: string;
  resolverIdentityFingerprint: string;
  resolverPolicyId: typeof TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID;
  operation: "resolve_trusted_repository_root";
  resolverSessionCapability: ResolverSessionCapability;
  expectedRepositoryIdentityFingerprint: string;
  expectedApprovedRootClass: "reviewed_workspace_root";
  requestedAt: string;
  expiresAt: string;
  attempt: 1;
  retryPolicy: "none";
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
}>;

export type FixtureExecutableCandidateObservation = Readonly<{
  fixtureKind: "fixture_executable_candidate_observation";
  fixtureVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  requestId: string;
  boundarySessionId: string;
  candidateCapability: FixtureExecutableCandidateCapability;
  executableIdentity: FixtureExecutableIdentity;
  approvedRootScope: "modeled_in_approved_root" | "modeled_outside_approved_root" | "root_scope_unavailable" | "root_scope_ambiguous";
  observationCompleteness: "modeled_complete" | "modeled_incomplete" | "modeled_ambiguous";
  observationStartedAt: string;
  observationEndedAt: string;
  evidenceCapturedAt: string;
  evidenceExpiresAt: string;
  provesExecutableExistsLive: false;
  provesExecutableTrustedLive: false;
  issuesLiveExecutableCapability: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  fixtureFingerprintAlgorithm: "sha256";
  fixtureFingerprint: string;
}>;

export type FixtureRepositoryCandidateObservation = Readonly<{
  fixtureKind: "fixture_repository_candidate_observation";
  fixtureVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  requestId: string;
  boundarySessionId: string;
  candidateCapability: FixtureRepositoryCandidateCapability;
  repositoryIdentity: FixtureRepositoryIdentity;
  approvedRootScope: "modeled_in_approved_root" | "modeled_outside_approved_root" | "root_scope_unavailable" | "root_scope_ambiguous";
  observationCompleteness: "modeled_complete" | "modeled_incomplete" | "modeled_ambiguous";
  observationStartedAt: string;
  observationEndedAt: string;
  evidenceCapturedAt: string;
  evidenceExpiresAt: string;
  provesRepositoryExistsLive: false;
  provesRepositoryTrustedLive: false;
  issuesLiveRepositoryCapability: false;
  enablesGitOperation: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  fixtureFingerprintAlgorithm: "sha256";
  fixtureFingerprint: string;
}>;

export type SanitizedExecutableResolutionEvidence = Readonly<{
  evidenceKind: "sanitized_executable_resolution_evidence";
  evidenceVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  provesExecutableExistsLive: false;
  provesExecutableTrustedLive: false;
  issuesLiveExecutableCapability: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  boundarySessionId: string;
  requestId: string;
  expectedToolIdentity: "git" | "supabase_cli";
  sanitizedStructuralPath: string;
  resolverIdentityFingerprint: string;
  resolverPolicyFingerprint: string;
  resolverSessionCapabilityFingerprint: string;
  candidateCapabilityFingerprint: string;
  fixtureObservationFingerprint: string;
  authority: "fixture_structural_only";
  completeness: ExecutableResolutionCompleteness;
  disposition: ExecutableSelectionDisposition;
  blockingReasons: readonly ExecutableResolverBlockingReason[];
  ambiguityReasons: readonly ExecutableResolverAmbiguityReason[];
  evaluatedAt: string;
  expiresAt: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type SanitizedRepositoryResolutionEvidence = Readonly<{
  evidenceKind: "sanitized_repository_resolution_evidence";
  evidenceVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  provesRepositoryExistsLive: false;
  provesRepositoryTrustedLive: false;
  issuesLiveRepositoryCapability: false;
  enablesGitOperation: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  boundarySessionId: string;
  requestId: string;
  sanitizedStructuralRootPath: string;
  resolverIdentityFingerprint: string;
  resolverPolicyFingerprint: string;
  resolverSessionCapabilityFingerprint: string;
  candidateCapabilityFingerprint: string;
  fixtureObservationFingerprint: string;
  authority: "fixture_structural_only";
  completeness: RepositoryResolutionCompleteness;
  disposition: RepositorySelectionDisposition;
  blockingReasons: readonly RepositoryResolverBlockingReason[];
  ambiguityReasons: readonly RepositoryResolverAmbiguityReason[];
  evaluatedAt: string;
  expiresAt: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type TrustedExecutableResolutionFixtureResult = Readonly<{
  resultKind: "trusted_executable_resolution_fixture_result";
  resultVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  issuesLiveExecutableCapability: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  authority: "fixture_structural_only";
  candidateSetClassification: ResolverCandidateSetClassification;
  evidence: SanitizedExecutableResolutionEvidence;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export type TrustedRepositoryResolutionFixtureResult = Readonly<{
  resultKind: "trusted_repository_resolution_fixture_result";
  resultVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  issuesLiveRepositoryCapability: false;
  enablesGitOperation: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  authority: "fixture_structural_only";
  candidateSetClassification: ResolverCandidateSetClassification;
  evidence: SanitizedRepositoryResolutionEvidence;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export type TrustedLiveResolverFixtureAdapter = Readonly<{
  identity: typeof TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  resolveExecutableFixture(input: Readonly<{
    request: TrustedExecutableResolutionRequest;
    candidates: readonly FixtureExecutableCandidateObservation[];
    evaluatedAt: string;
    candidateSetCompleteness?: "modeled_complete" | "modeled_incomplete" | "modeled_ambiguous";
  }>): TrustedExecutableResolutionFixtureResult;
  resolveRepositoryFixture(input: Readonly<{
    request: TrustedRepositoryResolutionRequest;
    candidates: readonly FixtureRepositoryCandidateObservation[];
    evaluatedAt: string;
    candidateSetCompleteness?: "modeled_complete" | "modeled_incomplete" | "modeled_ambiguous";
  }>): TrustedRepositoryResolutionFixtureResult;
}>;

export function buildTrustedResolverIdentityFingerprint(input: unknown = TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY): string {
  return fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.identity, input);
}

export function buildTrustedExecutableResolutionPolicy(): TrustedExecutableResolutionPolicy {
  const core = {
    policyId: TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID,
    operation: "resolve_trusted_executable",
    platform: "macos",
    candidateSource: "injected_fixture",
    oneExactExecutableOnly: true,
    allowPathSearch: false,
    allowFilesystemInspection: false,
    allowEnvironmentPath: false,
    allowShellLookup: false,
    allowCurrentWorkingDirectoryLookup: false,
    allowRelativePaths: false,
    allowHomeExpansion: false,
    allowGlob: false,
    allowWildcard: false,
    allowSymlinkTargetSelection: false,
    requireAbsolutePathStructure: true,
    requireApprovedRootScope: true,
    requireRegularFileStructure: true,
    requireExecutablePermissionEvidence: true,
    requireOwnershipEvidence: true,
    requireProvenanceEvidence: true,
    requireSymlinkEvidence: true,
    requireArchitectureEvidence: true,
    requireRosettaEvidence: true,
    requireFreshEvidence: true,
    requireSameSessionEvidence: true,
    retryPolicy: "none",
    fixtureMayIssueLiveCapability: false,
    fixtureMayEnableProcessStart: false,
    fixtureMayEnableRunner: false,
    allowedArchitectureStates: ["modeled_arm64", "modeled_universal"],
    allowedRosettaStates: ["modeled_native_execution", "modeled_rosetta_not_applicable"],
  } satisfies Omit<TrustedExecutableResolutionPolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return deepFreeze({ ...core, policyFingerprintAlgorithm: "sha256", policyFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executablePolicy, core) } satisfies TrustedExecutableResolutionPolicy);
}

export function buildTrustedRepositoryResolutionPolicy(): TrustedRepositoryResolutionPolicy {
  const core = {
    policyId: TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID,
    operation: "resolve_trusted_repository_root",
    candidateSource: "injected_fixture",
    oneExactRepositoryRootOnly: true,
    allowFilesystemInspection: false,
    allowCurrentWorkingDirectoryDiscovery: false,
    allowParentDirectoryTraversal: false,
    allowGitCommandDiscovery: false,
    allowEnvironmentRoot: false,
    allowRelativePaths: false,
    allowHomeExpansion: false,
    allowGlob: false,
    allowWildcard: false,
    requireAbsolutePathStructure: true,
    requireApprovedRootScope: true,
    requireDirectoryStructure: true,
    requireRepositoryMarkerEvidence: true,
    requireOwnershipEvidence: true,
    requireProvenanceEvidence: true,
    requireSymlinkEvidence: true,
    requireFreshEvidence: true,
    requireSameSessionEvidence: true,
    retryPolicy: "none",
    fixtureMayIssueLiveCapability: false,
    fixtureMayEnableGitOperation: false,
    fixtureMayEnableProcessStart: false,
    fixtureMayEnableRunner: false,
  } satisfies Omit<TrustedRepositoryResolutionPolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return deepFreeze({ ...core, policyFingerprintAlgorithm: "sha256", policyFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryPolicy, core) } satisfies TrustedRepositoryResolutionPolicy);
}

export const TRUSTED_LIVE_RESOLVER_POLICY_REGISTRY = deepFreeze({
  registryKind: "trusted_live_resolver_policy_registry",
  registryVersion: 1,
  resolverIdentityFingerprint: buildTrustedResolverIdentityFingerprint(),
  executablePolicy: buildTrustedExecutableResolutionPolicy(),
  repositoryPolicy: buildTrustedRepositoryResolutionPolicy(),
  policyMergingAllowed: false,
  policyExtensionAllowed: false,
  callerOverridesAllowed: false,
} as const);

export function buildResolverSessionCapability(input: Partial<ResolverSessionCapability> = {}): ResolverSessionCapability {
  const core = {
    capabilityKind: "resolver_session",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? "trusted_resolver_session_capability_001",
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    intendedPlatform: "macos",
    issuedAt: input.issuedAt ?? TRUSTED_LIVE_RESOLVER_ISSUED_AT,
    expiresAt: input.expiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
    fixtureOnly: true,
  } satisfies Omit<ResolverSessionCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = deepFreeze({ ...core, capabilityFingerprintAlgorithm: "sha256", capabilityFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.resolverSessionCapability, core) } satisfies ResolverSessionCapability);
  RESOLVER_SESSION_CAPABILITY_PROVENANCE.add(capability);
  return capability;
}

export function asFixtureAbsoluteMacosPath(input: string): FixtureAbsoluteMacosPath {
  return input as FixtureAbsoluteMacosPath;
}

export function buildFixtureExecutableIdentity(input: Partial<FixtureExecutableIdentity> = {}): FixtureExecutableIdentity {
  const expectedToolIdentity = input.expectedToolIdentity ?? "git";
  const structuralPath = input.structuralPath ?? asFixtureAbsoluteMacosPath(expectedToolIdentity === "git" ? "/usr/bin/git" : "/opt/homebrew/bin/supabase");
  const basename = input.basename ?? (expectedToolIdentity === "git" ? "git" : "supabase");
  const core = {
    identityKind: "fixture_executable_identity",
    identityVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    candidateId: input.candidateId ?? `fixture_executable_candidate_${expectedToolIdentity}_001`,
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    structuralPath,
    basename,
    approvedRootClass: input.approvedRootClass ?? (expectedToolIdentity === "git" ? "system_usr_bin" : "homebrew_bin"),
    approvedRootFingerprint: input.approvedRootFingerprint ?? sha256(expectedToolIdentity === "git" ? "/usr/bin" : "/opt/homebrew/bin"),
    expectedToolIdentity,
    filesystemObjectType: input.filesystemObjectType ?? "regular_file",
    executablePermissionState: input.executablePermissionState ?? "modeled_executable",
    ownershipState: input.ownershipState ?? "modeled_expected_owner",
    provenanceState: input.provenanceState ?? "modeled_approved_distribution",
    symlinkState: input.symlinkState ?? "modeled_not_symlink",
    architectureState: input.architectureState ?? "modeled_arm64",
    rosettaState: input.rosettaState ?? "modeled_native_execution",
    evidenceCapturedAt: input.evidenceCapturedAt ?? TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
    evidenceExpiresAt: input.evidenceExpiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
  } satisfies Omit<FixtureExecutableIdentity, "identityFingerprintAlgorithm" | "identityFingerprint">;
  return deepFreeze({ ...core, identityFingerprintAlgorithm: "sha256", identityFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableFixture, core) } satisfies FixtureExecutableIdentity);
}

export function buildFixtureRepositoryIdentity(input: Partial<FixtureRepositoryIdentity> = {}): FixtureRepositoryIdentity {
  const core = {
    identityKind: "fixture_repository_identity",
    identityVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    candidateId: input.candidateId ?? "fixture_repository_candidate_ture_workspace_001",
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    structuralRootPath: input.structuralRootPath ?? asFixtureAbsoluteMacosPath("/Users/reviewed/workspace/trade"),
    approvedRootClass: "reviewed_workspace_root",
    approvedRootFingerprint: input.approvedRootFingerprint ?? sha256("reviewed_workspace_root"),
    filesystemObjectType: input.filesystemObjectType ?? "directory",
    repositoryMarkerState: input.repositoryMarkerState ?? "modeled_exact_reviewed_repository",
    ownershipState: input.ownershipState ?? "modeled_expected_owner",
    provenanceState: input.provenanceState ?? "modeled_approved_repository",
    symlinkState: input.symlinkState ?? "modeled_not_symlink",
    evidenceCapturedAt: input.evidenceCapturedAt ?? TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
    evidenceExpiresAt: input.evidenceExpiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
  } satisfies Omit<FixtureRepositoryIdentity, "identityFingerprintAlgorithm" | "identityFingerprint">;
  return deepFreeze({ ...core, identityFingerprintAlgorithm: "sha256", identityFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryFixture, core) } satisfies FixtureRepositoryIdentity);
}

export function buildFixtureExecutableCandidateCapability(identity: FixtureExecutableIdentity = buildFixtureExecutableIdentity(), input: Partial<FixtureExecutableCandidateCapability> = {}): FixtureExecutableCandidateCapability {
  const core = {
    capabilityKind: "fixture_executable_candidate",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? "fixture_executable_candidate_capability_001",
    boundarySessionId: input.boundarySessionId ?? identity.boundarySessionId,
    candidateIdentityFingerprint: input.candidateIdentityFingerprint ?? identity.identityFingerprint,
    issuedAt: input.issuedAt ?? TRUSTED_LIVE_RESOLVER_ISSUED_AT,
    expiresAt: input.expiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
    fixtureOnly: true,
    observedLive: false,
  } satisfies Omit<FixtureExecutableCandidateCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = deepFreeze({ ...core, capabilityFingerprintAlgorithm: "sha256", capabilityFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableCandidateCapability, core) } satisfies FixtureExecutableCandidateCapability);
  EXECUTABLE_CANDIDATE_CAPABILITY_PROVENANCE.add(capability);
  return capability;
}

export function buildFixtureRepositoryCandidateCapability(identity: FixtureRepositoryIdentity = buildFixtureRepositoryIdentity(), input: Partial<FixtureRepositoryCandidateCapability> = {}): FixtureRepositoryCandidateCapability {
  const core = {
    capabilityKind: "fixture_repository_candidate",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? "fixture_repository_candidate_capability_001",
    boundarySessionId: input.boundarySessionId ?? identity.boundarySessionId,
    candidateIdentityFingerprint: input.candidateIdentityFingerprint ?? identity.identityFingerprint,
    issuedAt: input.issuedAt ?? TRUSTED_LIVE_RESOLVER_ISSUED_AT,
    expiresAt: input.expiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
    fixtureOnly: true,
    observedLive: false,
  } satisfies Omit<FixtureRepositoryCandidateCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = deepFreeze({ ...core, capabilityFingerprintAlgorithm: "sha256", capabilityFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryCandidateCapability, core) } satisfies FixtureRepositoryCandidateCapability);
  REPOSITORY_CANDIDATE_CAPABILITY_PROVENANCE.add(capability);
  return capability;
}

export function buildTrustedExecutableResolutionRequest(
  sessionCapability: ResolverSessionCapability = buildResolverSessionCapability(),
  identity: FixtureExecutableIdentity = buildFixtureExecutableIdentity({ boundarySessionId: sessionCapability.boundarySessionId }),
  input: Partial<TrustedExecutableResolutionRequest> = {},
): TrustedExecutableResolutionRequest {
  const core = {
    requestKind: "trusted_executable_resolution",
    requestVersion: 1,
    requestId: input.requestId ?? "trusted_executable_resolution_request_001",
    boundarySessionId: input.boundarySessionId ?? sessionCapability.boundarySessionId,
    resolverIdentityFingerprint: input.resolverIdentityFingerprint ?? buildTrustedResolverIdentityFingerprint(),
    resolverPolicyId: input.resolverPolicyId ?? TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID,
    operation: "resolve_trusted_executable",
    resolverSessionCapability: input.resolverSessionCapability ?? sessionCapability,
    expectedToolIdentity: input.expectedToolIdentity ?? identity.expectedToolIdentity,
    expectedApprovedRootClass: input.expectedApprovedRootClass ?? identity.approvedRootClass,
    expectedCandidateIdentityFingerprint: input.expectedCandidateIdentityFingerprint ?? identity.identityFingerprint,
    requestedAt: input.requestedAt ?? TRUSTED_LIVE_RESOLVER_ISSUED_AT,
    expiresAt: input.expiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
    attempt: 1,
    retryPolicy: "none",
  } satisfies Omit<TrustedExecutableResolutionRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return deepFreeze({ ...core, requestFingerprintAlgorithm: "sha256", requestFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableRequest, core) } satisfies TrustedExecutableResolutionRequest);
}

export function buildTrustedRepositoryResolutionRequest(
  sessionCapability: ResolverSessionCapability = buildResolverSessionCapability(),
  identity: FixtureRepositoryIdentity = buildFixtureRepositoryIdentity({ boundarySessionId: sessionCapability.boundarySessionId }),
  input: Partial<TrustedRepositoryResolutionRequest> = {},
): TrustedRepositoryResolutionRequest {
  const core = {
    requestKind: "trusted_repository_root_resolution",
    requestVersion: 1,
    requestId: input.requestId ?? "trusted_repository_resolution_request_001",
    boundarySessionId: input.boundarySessionId ?? sessionCapability.boundarySessionId,
    resolverIdentityFingerprint: input.resolverIdentityFingerprint ?? buildTrustedResolverIdentityFingerprint(),
    resolverPolicyId: input.resolverPolicyId ?? TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID,
    operation: "resolve_trusted_repository_root",
    resolverSessionCapability: input.resolverSessionCapability ?? sessionCapability,
    expectedRepositoryIdentityFingerprint: input.expectedRepositoryIdentityFingerprint ?? identity.identityFingerprint,
    expectedApprovedRootClass: "reviewed_workspace_root",
    requestedAt: input.requestedAt ?? TRUSTED_LIVE_RESOLVER_ISSUED_AT,
    expiresAt: input.expiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
    attempt: 1,
    retryPolicy: "none",
  } satisfies Omit<TrustedRepositoryResolutionRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return deepFreeze({ ...core, requestFingerprintAlgorithm: "sha256", requestFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryRequest, core) } satisfies TrustedRepositoryResolutionRequest);
}

export function buildFixtureExecutableCandidateObservation(
  request: TrustedExecutableResolutionRequest = buildTrustedExecutableResolutionRequest(),
  identity: FixtureExecutableIdentity = buildFixtureExecutableIdentity({
    boundarySessionId: request.boundarySessionId,
    expectedToolIdentity: request.expectedToolIdentity,
    approvedRootClass: request.expectedApprovedRootClass,
  }),
  input: Partial<FixtureExecutableCandidateObservation> = {},
): FixtureExecutableCandidateObservation {
  const candidateCapability = input.candidateCapability ?? buildFixtureExecutableCandidateCapability(identity);
  const core = {
    fixtureKind: "fixture_executable_candidate_observation",
    fixtureVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    requestId: input.requestId ?? request.requestId,
    boundarySessionId: input.boundarySessionId ?? request.boundarySessionId,
    candidateCapability,
    executableIdentity: input.executableIdentity ?? identity,
    approvedRootScope: input.approvedRootScope ?? "modeled_in_approved_root",
    observationCompleteness: input.observationCompleteness ?? "modeled_complete",
    observationStartedAt: input.observationStartedAt ?? TRUSTED_LIVE_RESOLVER_ISSUED_AT,
    observationEndedAt: input.observationEndedAt ?? TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
    evidenceCapturedAt: input.evidenceCapturedAt ?? TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
    evidenceExpiresAt: input.evidenceExpiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
    provesExecutableExistsLive: false,
    provesExecutableTrustedLive: false,
    issuesLiveExecutableCapability: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
  } satisfies Omit<FixtureExecutableCandidateObservation, "fixtureFingerprintAlgorithm" | "fixtureFingerprint">;
  return deepFreeze({ ...core, fixtureFingerprintAlgorithm: "sha256", fixtureFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableFixture, core) } satisfies FixtureExecutableCandidateObservation);
}

export function buildFixtureRepositoryCandidateObservation(
  request: TrustedRepositoryResolutionRequest = buildTrustedRepositoryResolutionRequest(),
  identity: FixtureRepositoryIdentity = buildFixtureRepositoryIdentity({ boundarySessionId: request.boundarySessionId }),
  input: Partial<FixtureRepositoryCandidateObservation> = {},
): FixtureRepositoryCandidateObservation {
  const candidateCapability = input.candidateCapability ?? buildFixtureRepositoryCandidateCapability(identity);
  const core = {
    fixtureKind: "fixture_repository_candidate_observation",
    fixtureVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    requestId: input.requestId ?? request.requestId,
    boundarySessionId: input.boundarySessionId ?? request.boundarySessionId,
    candidateCapability,
    repositoryIdentity: input.repositoryIdentity ?? identity,
    approvedRootScope: input.approvedRootScope ?? "modeled_in_approved_root",
    observationCompleteness: input.observationCompleteness ?? "modeled_complete",
    observationStartedAt: input.observationStartedAt ?? TRUSTED_LIVE_RESOLVER_ISSUED_AT,
    observationEndedAt: input.observationEndedAt ?? TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
    evidenceCapturedAt: input.evidenceCapturedAt ?? TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
    evidenceExpiresAt: input.evidenceExpiresAt ?? TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
    provesRepositoryExistsLive: false,
    provesRepositoryTrustedLive: false,
    issuesLiveRepositoryCapability: false,
    enablesGitOperation: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
  } satisfies Omit<FixtureRepositoryCandidateObservation, "fixtureFingerprintAlgorithm" | "fixtureFingerprint">;
  return deepFreeze({ ...core, fixtureFingerprintAlgorithm: "sha256", fixtureFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryFixture, core) } satisfies FixtureRepositoryCandidateObservation);
}

export function buildTrustedLiveResolverCompatibilitySummary() {
  const core = {
    compatibilityKind: "trusted_live_resolver_adapter_compatibility",
    fixtureOnly: true,
    observedLive: false,
    trustedResolverDesign: "fixture_adapter_structurally_compatible_but_not_live_resolver_enabling",
    processExecutor: "structurally_compatible_but_no_executable_authority_issued",
    liveDriverDesign: "structurally_compatible_but_direct_spawn_disabled",
    processObserver: "session_model_compatible_and_no_process_capability_created",
    cliVersionCollector: "structurally_compatible_but_no_version_command_enabled",
    credentialBoundary: "compatible_and_no_credential_access",
    authorization: "compatible_and_no_authorization_issue_or_consumption",
    runner: "fixture_resolver_structurally_compatible_but_not_live_runner_enabling",
    enablesLiveResolution: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
  } as const;
  return deepFreeze({ ...core, compatibilityFingerprintAlgorithm: "sha256", compatibilityFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableCompatibility, core) });
}

export function buildTrustedLiveResolverFuturePlan() {
  return deepFreeze({
    planKind: "trusted_live_resolver_future_plan",
    fixtureOnly: true,
    observedLive: false,
    liveResolverPresent: false,
    selectedFilesystemApi: "not_selected",
    pathPolicySelected: false,
    requiresFilesystemApiSelectionReview: true,
    requiresPathPolicyReview: true,
    requiresAbsoluteExecutablePathReview: true,
    requiresSymlinkHandlingReview: true,
    requiresOwnershipSemanticsReview: true,
    requiresMacosPermissionSemanticsReview: true,
    requiresArchitectureInspectionReview: true,
    requiresRosettaInspectionReview: true,
    requiresRepositoryMarkerVerificationReview: true,
    requiresGitFreeRepositoryIdentityReview: true,
    requiresRawPathContainmentReview: true,
    requiresTocTouMitigationReview: true,
    requiresLiveCapabilityIssuanceReview: true,
    requiresServerOnlyRuntimeIntegrationReview: true,
    requiresStagingValidation: true,
    requiresFinalLiveGate: true,
    implementsNoLiveItem: true,
  } as const);
}

export function buildTrustedLiveResolverFixtureAdapter(): TrustedLiveResolverFixtureAdapter {
  return deepFreeze({
    identity: TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    resolveExecutableFixture: ({ request, candidates, evaluatedAt, candidateSetCompleteness }) =>
      resolveExecutableFixture({ request, candidates, evaluatedAt, candidateSetCompleteness }),
    resolveRepositoryFixture: ({ request, candidates, evaluatedAt, candidateSetCompleteness }) =>
      resolveRepositoryFixture({ request, candidates, evaluatedAt, candidateSetCompleteness }),
  });
}

export function validateTrustedResolverIdentity(input: unknown): ValidationResult<typeof TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY> {
  return exact(input, TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY, "resolver_identity");
}

export function validateTrustedExecutableResolutionPolicy(input: unknown): ValidationResult<TrustedExecutableResolutionPolicy> {
  return exact(input, buildTrustedExecutableResolutionPolicy(), "executable_policy", "policyFingerprint", "policyFingerprintAlgorithm", TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executablePolicy);
}

export function validateTrustedRepositoryResolutionPolicy(input: unknown): ValidationResult<TrustedRepositoryResolutionPolicy> {
  return exact(input, buildTrustedRepositoryResolutionPolicy(), "repository_policy", "policyFingerprint", "policyFingerprintAlgorithm", TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryPolicy);
}

export function validateResolverSessionCapability(input: unknown, evaluatedAt: string = TRUSTED_LIVE_RESOLVER_EVALUATED_AT): ValidationResult<ResolverSessionCapability> {
  const errors = validateShape(input, buildResolverSessionCapability(), "resolver_session_capability", "capabilityFingerprint", "capabilityFingerprintAlgorithm", TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.resolverSessionCapability);
  if (isRecord(input)) {
    if (!RESOLVER_SESSION_CAPABILITY_PROVENANCE.has(input)) errors.push("resolver_session_capability_invalid");
    if (!isCapabilityId(input.capabilityId, "trusted_resolver_session_capability_")) errors.push("resolver_session_capability_invalid");
    if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
    validateTimeRange(input.issuedAt, input.expiresAt, evaluatedAt, errors, "resolver_session_capability_expired");
  }
  return validation(input, errors);
}

export function validateExecutableCandidateCapability(input: unknown, identity: FixtureExecutableIdentity, evaluatedAt: string = TRUSTED_LIVE_RESOLVER_EVALUATED_AT): ValidationResult<FixtureExecutableCandidateCapability> {
  const errors = validateShape(input, buildFixtureExecutableCandidateCapability(identity), "executable_candidate_capability", "capabilityFingerprint", "capabilityFingerprintAlgorithm", TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableCandidateCapability);
  if (isRecord(input)) {
    if (!EXECUTABLE_CANDIDATE_CAPABILITY_PROVENANCE.has(input)) errors.push("candidate_capability_invalid");
    if (input.boundarySessionId !== identity.boundarySessionId) errors.push("session_mismatch");
    if (input.candidateIdentityFingerprint !== identity.identityFingerprint) errors.push("candidate_identity_mismatch");
    validateTimeRange(input.issuedAt, input.expiresAt, evaluatedAt, errors, "candidate_capability_expired");
  }
  return validation(input, errors);
}

export function validateRepositoryCandidateCapability(input: unknown, identity: FixtureRepositoryIdentity, evaluatedAt: string = TRUSTED_LIVE_RESOLVER_EVALUATED_AT): ValidationResult<FixtureRepositoryCandidateCapability> {
  const errors = validateShape(input, buildFixtureRepositoryCandidateCapability(identity), "repository_candidate_capability", "capabilityFingerprint", "capabilityFingerprintAlgorithm", TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryCandidateCapability);
  if (isRecord(input)) {
    if (!REPOSITORY_CANDIDATE_CAPABILITY_PROVENANCE.has(input)) errors.push("candidate_capability_invalid");
    if (input.boundarySessionId !== identity.boundarySessionId) errors.push("session_mismatch");
    if (input.candidateIdentityFingerprint !== identity.identityFingerprint) errors.push("repository_identity_mismatch");
    validateTimeRange(input.issuedAt, input.expiresAt, evaluatedAt, errors, "candidate_capability_expired");
  }
  return validation(input, errors);
}

export function validateFixtureAbsoluteMacosPath(input: unknown): readonly string[] {
  const errors: string[] = [];
  if (typeof input !== "string" || input.length === 0) return ["path_invalid"];
  if (!input.startsWith("/")) errors.push("path_not_absolute");
  if (input.length > 240) errors.push("path_invalid");
  if (/[^\x20-\x7E]/u.test(input)) errors.push("path_invalid");
  if (/[\0\r\n\x00-\x1F\x7F]/u.test(input)) errors.push("path_invalid");
  if (/^https?:\/\//iu.test(input) || /^file:\/\//iu.test(input)) errors.push("path_invalid");
  if (input.includes("~") || input.includes("${") || input.includes("$")) errors.push("path_invalid");
  if (/[?*[\]]/u.test(input)) errors.push("path_contains_glob");
  if (/[;&|`]/u.test(input) || input.includes("$(")) errors.push("path_contains_shell_control");
  if (input.includes("//")) errors.push("path_invalid");
  if (input.split("/").includes(".") || input.split("/").includes("..")) errors.push("path_contains_parent_traversal");
  return sorted(errors);
}

export function validateTrustedExecutableResolutionRequest(input: unknown, evaluatedAt: string = TRUSTED_LIVE_RESOLVER_EVALUATED_AT): { ok: boolean; errors: readonly string[] } {
  const session = isRecord(input) && isRecord(input.resolverSessionCapability) ? input.resolverSessionCapability as unknown as ResolverSessionCapability : buildResolverSessionCapability();
  const expectedToolIdentity = isRecord(input) && input.expectedToolIdentity === "supabase_cli" ? "supabase_cli" : "git";
  const identity = buildFixtureExecutableIdentity({ boundarySessionId: session.boundarySessionId as string | undefined, expectedToolIdentity });
  const errors = validateShape(input, buildTrustedExecutableResolutionRequest(session, identity), "executable_request", "requestFingerprint", "requestFingerprintAlgorithm", TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableRequest);
  if (!isRecord(input)) return { ok: false, errors };
  errors.push(...validationErrors(validateResolverSessionCapability(input.resolverSessionCapability, evaluatedAt)));
  if (input.resolverIdentityFingerprint !== buildTrustedResolverIdentityFingerprint()) errors.push("resolver_identity_mismatch");
  if (input.resolverPolicyId !== TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID) errors.push("resolver_policy_unknown");
  if (input.operation !== "resolve_trusted_executable") errors.push("operation_mismatch");
  if (!["git", "supabase_cli"].includes(String(input.expectedToolIdentity))) errors.push("tool_identity_mismatch");
  if (!isRecord(input.resolverSessionCapability) || input.boundarySessionId !== input.resolverSessionCapability.boundarySessionId) errors.push("session_mismatch");
  if (input.attempt !== 1 || input.retryPolicy !== "none") errors.push("request_invalid");
  validateTimeRange(input.requestedAt, input.expiresAt, evaluatedAt, errors, "request_expired");
  if (hasProhibitedResolverInput(input)) errors.push("request_invalid");
  return { ok: errors.length === 0, errors: sorted(errors) };
}

export function validateTrustedRepositoryResolutionRequest(input: unknown, evaluatedAt: string = TRUSTED_LIVE_RESOLVER_EVALUATED_AT): { ok: boolean; errors: readonly string[] } {
  const session = isRecord(input) && isRecord(input.resolverSessionCapability) ? input.resolverSessionCapability as unknown as ResolverSessionCapability : buildResolverSessionCapability();
  const identity = buildFixtureRepositoryIdentity({ boundarySessionId: session.boundarySessionId as string | undefined });
  const errors = validateShape(input, buildTrustedRepositoryResolutionRequest(session, identity), "repository_request", "requestFingerprint", "requestFingerprintAlgorithm", TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryRequest);
  if (!isRecord(input)) return { ok: false, errors };
  errors.push(...validationErrors(validateResolverSessionCapability(input.resolverSessionCapability, evaluatedAt)));
  if (input.resolverIdentityFingerprint !== buildTrustedResolverIdentityFingerprint()) errors.push("resolver_identity_mismatch");
  if (input.resolverPolicyId !== TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID) errors.push("resolver_policy_unknown");
  if (input.operation !== "resolve_trusted_repository_root") errors.push("operation_mismatch");
  if (input.expectedApprovedRootClass !== "reviewed_workspace_root") errors.push("approved_root_mismatch");
  if (!isRecord(input.resolverSessionCapability) || input.boundarySessionId !== input.resolverSessionCapability.boundarySessionId) errors.push("session_mismatch");
  if (input.attempt !== 1 || input.retryPolicy !== "none") errors.push("request_invalid");
  validateTimeRange(input.requestedAt, input.expiresAt, evaluatedAt, errors, "request_expired");
  if (hasProhibitedResolverInput(input)) errors.push("request_invalid");
  return { ok: errors.length === 0, errors: sorted(errors) };
}

export function validateExecutableCandidateObservation(input: unknown, request: TrustedExecutableResolutionRequest, evaluatedAt: string = TRUSTED_LIVE_RESOLVER_EVALUATED_AT): { blocking: ExecutableResolverBlockingReason[]; ambiguity: ExecutableResolverAmbiguityReason[] } {
  const blocking: ExecutableResolverBlockingReason[] = [];
  const ambiguity: ExecutableResolverAmbiguityReason[] = [];
  if (!isRecord(input)) return { blocking: ["candidate_capability_invalid"], ambiguity };
  if (input.fixtureOnly !== true) blocking.push("fixture_claimed_live_observation");
  if (input.observedLive !== false) blocking.push("fixture_claimed_live_observation");
  if (input.authoritativeLive !== false) blocking.push("fixture_claimed_live_authority");
  if (input.provesExecutableExistsLive !== false) blocking.push("fixture_claimed_live_existence_proof");
  if (input.provesExecutableTrustedLive !== false) blocking.push("fixture_claimed_live_trust_proof");
  if (input.issuesLiveExecutableCapability !== false) blocking.push("fixture_claimed_live_capability");
  if (input.enablesProcessStart !== false) blocking.push("fixture_claimed_process_start");
  if (input.enablesPreflightRunner !== false) blocking.push("fixture_claimed_runner_enablement");
  if (input.boundarySessionId !== request.boundarySessionId || input.requestId !== request.requestId) ambiguity.push("evidence_session_inconsistent");
  const identity = input.executableIdentity as FixtureExecutableIdentity;
  if (!isRecord(identity)) blocking.push("candidate_identity_mismatch");
  else {
    if (identity.boundarySessionId !== request.boundarySessionId) blocking.push("session_mismatch");
    if (identity.identityFingerprint !== request.expectedCandidateIdentityFingerprint) blocking.push("candidate_identity_mismatch");
    if (identity.expectedToolIdentity !== request.expectedToolIdentity || identity.basename !== (request.expectedToolIdentity === "git" ? "git" : "supabase")) blocking.push("tool_identity_mismatch");
    if (identity.approvedRootClass !== request.expectedApprovedRootClass) blocking.push("approved_root_mismatch");
    classifyPath(identity.structuralPath, blocking);
    if (!isWithinApprovedExecutableRoot(String(identity.structuralPath), identity.approvedRootClass, identity.approvedRootFingerprint)) blocking.push("approved_root_mismatch");
    if (input.approvedRootScope === "modeled_outside_approved_root") blocking.push("approved_root_mismatch");
    if (input.approvedRootScope === "root_scope_unavailable") ambiguity.push("path_scope_incomplete");
    if (input.approvedRootScope === "root_scope_ambiguous") ambiguity.push("candidate_set_ambiguous");
    if (identity.filesystemObjectType === "unknown") ambiguity.push("filesystem_object_type_unknown");
    else if (identity.filesystemObjectType !== "regular_file") blocking.push("filesystem_object_not_regular_file");
    if (identity.executablePermissionState === "unknown") ambiguity.push("executable_permission_unknown");
    else if (identity.executablePermissionState !== "modeled_executable") blocking.push("executable_permission_missing");
    classifyOwnership(identity.ownershipState, blocking, ambiguity);
    classifyProvenance(identity.provenanceState, blocking, ambiguity);
    classifySymlink(identity.symlinkState, blocking, ambiguity);
    classifyArchitecture(identity.architectureState, blocking, ambiguity);
    classifyRosetta(identity.rosettaState, blocking, ambiguity);
    validateObservationTimes(input, evaluatedAt, ambiguity);
    blocking.push(...validationErrors(validateExecutableCandidateCapability(input.candidateCapability, identity, evaluatedAt)) as ExecutableResolverBlockingReason[]);
  }
  if (input.observationCompleteness === "modeled_incomplete") ambiguity.push("candidate_set_incomplete");
  if (input.observationCompleteness === "modeled_ambiguous") ambiguity.push("candidate_set_ambiguous");
  if (hasSensitiveMaterial(input)) blocking.push("sensitive_material_present");
  if (hasProhibitedResolverInput(input)) blocking.push("request_invalid");
  return { blocking: sorted(blocking) as ExecutableResolverBlockingReason[], ambiguity: sorted(ambiguity) as ExecutableResolverAmbiguityReason[] };
}

export function validateRepositoryCandidateObservation(input: unknown, request: TrustedRepositoryResolutionRequest, evaluatedAt: string = TRUSTED_LIVE_RESOLVER_EVALUATED_AT): { blocking: RepositoryResolverBlockingReason[]; ambiguity: RepositoryResolverAmbiguityReason[] } {
  const blocking: RepositoryResolverBlockingReason[] = [];
  const ambiguity: RepositoryResolverAmbiguityReason[] = [];
  if (!isRecord(input)) return { blocking: ["candidate_capability_invalid"], ambiguity };
  if (input.fixtureOnly !== true) blocking.push("fixture_claimed_live_observation");
  if (input.observedLive !== false) blocking.push("fixture_claimed_live_observation");
  if (input.authoritativeLive !== false) blocking.push("fixture_claimed_live_authority");
  if (input.provesRepositoryExistsLive !== false) blocking.push("fixture_claimed_live_existence_proof");
  if (input.provesRepositoryTrustedLive !== false) blocking.push("fixture_claimed_live_trust_proof");
  if (input.issuesLiveRepositoryCapability !== false) blocking.push("fixture_claimed_live_capability");
  if (input.enablesGitOperation !== false) blocking.push("fixture_claimed_git_enablement");
  if (input.enablesProcessStart !== false) blocking.push("fixture_claimed_process_start");
  if (input.enablesPreflightRunner !== false) blocking.push("fixture_claimed_runner_enablement");
  if (input.boundarySessionId !== request.boundarySessionId || input.requestId !== request.requestId) ambiguity.push("evidence_session_inconsistent");
  const identity = input.repositoryIdentity as FixtureRepositoryIdentity;
  if (!isRecord(identity)) blocking.push("repository_identity_mismatch");
  else {
    if (identity.boundarySessionId !== request.boundarySessionId) blocking.push("session_mismatch");
    if (identity.identityFingerprint !== request.expectedRepositoryIdentityFingerprint) blocking.push("repository_identity_mismatch");
    if (identity.approvedRootClass !== request.expectedApprovedRootClass) blocking.push("approved_root_mismatch");
    classifyPath(identity.structuralRootPath, blocking);
    if (!isWithinApprovedRepositoryRoot(String(identity.structuralRootPath), identity.approvedRootClass, identity.approvedRootFingerprint)) blocking.push("approved_root_mismatch");
    if (input.approvedRootScope === "modeled_outside_approved_root") blocking.push("approved_root_mismatch");
    if (input.approvedRootScope === "root_scope_unavailable") ambiguity.push("path_scope_incomplete");
    if (input.approvedRootScope === "root_scope_ambiguous") ambiguity.push("candidate_set_ambiguous");
    if (identity.filesystemObjectType === "unknown") ambiguity.push("filesystem_object_type_unknown");
    else if (identity.filesystemObjectType !== "directory") blocking.push("filesystem_object_not_directory");
    if (identity.repositoryMarkerState === "modeled_exact_reviewed_repository") {
      // exact marker accepted
    } else if (identity.repositoryMarkerState === "repository_marker_unavailable") ambiguity.push("repository_marker_unavailable");
    else if (identity.repositoryMarkerState === "repository_marker_ambiguous") ambiguity.push("repository_marker_ambiguous");
    else blocking.push("repository_marker_mismatch");
    classifyOwnership(identity.ownershipState, blocking, ambiguity);
    classifyProvenance(identity.provenanceState, blocking, ambiguity);
    classifySymlink(identity.symlinkState, blocking, ambiguity);
    validateObservationTimes(input, evaluatedAt, ambiguity);
    blocking.push(...validationErrors(validateRepositoryCandidateCapability(input.candidateCapability, identity, evaluatedAt)) as RepositoryResolverBlockingReason[]);
  }
  if (input.observationCompleteness === "modeled_incomplete") ambiguity.push("candidate_set_incomplete");
  if (input.observationCompleteness === "modeled_ambiguous") ambiguity.push("candidate_set_ambiguous");
  if (hasSensitiveMaterial(input)) blocking.push("sensitive_material_present");
  if (hasProhibitedResolverInput(input)) blocking.push("request_invalid");
  return { blocking: sorted(blocking) as RepositoryResolverBlockingReason[], ambiguity: sorted(ambiguity) as RepositoryResolverAmbiguityReason[] };
}

function resolveExecutableFixture(input: Readonly<{
  request: TrustedExecutableResolutionRequest;
  candidates: readonly FixtureExecutableCandidateObservation[];
  evaluatedAt: string;
  candidateSetCompleteness?: "modeled_complete" | "modeled_incomplete" | "modeled_ambiguous";
}>): TrustedExecutableResolutionFixtureResult {
  const requestErrors = validateTrustedExecutableResolutionRequest(input.request, input.evaluatedAt).errors as ExecutableResolverBlockingReason[];
  const set = classifyCandidateSet(input.candidates, input.candidateSetCompleteness);
  const blocking: ExecutableResolverBlockingReason[] = [...requestErrors];
  const ambiguity: ExecutableResolverAmbiguityReason[] = [];
  if (set === "no_candidate") blocking.push("no_candidate");
  if (set === "multiple_candidates") blocking.push("multiple_candidates");
  if (set === "candidate_set_incomplete") ambiguity.push("candidate_set_incomplete");
  if (set === "candidate_set_ambiguous") ambiguity.push("candidate_set_ambiguous");
  if (input.candidates.length === 1) {
    const candidate = validateExecutableCandidateObservation(input.candidates[0], input.request, input.evaluatedAt);
    blocking.push(...candidate.blocking);
    ambiguity.push(...candidate.ambiguity);
  }
  const completeness = executableCompleteness(blocking, ambiguity);
  const disposition: ExecutableSelectionDisposition = blocking.length > 0 ? "blocked_fixture_candidate" : ambiguity.length > 0 ? "ambiguous_fixture_candidate" : "compatible_fixture_candidate";
  const candidate = input.candidates[0];
  const evidenceCore = {
    evidenceKind: "sanitized_executable_resolution_evidence",
    evidenceVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    provesExecutableExistsLive: false,
    provesExecutableTrustedLive: false,
    issuesLiveExecutableCapability: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    boundarySessionId: input.request.boundarySessionId,
    requestId: input.request.requestId,
    expectedToolIdentity: input.request.expectedToolIdentity,
    sanitizedStructuralPath: candidate?.executableIdentity?.structuralPath ?? "fixture_path_unavailable",
    resolverIdentityFingerprint: buildTrustedResolverIdentityFingerprint(),
    resolverPolicyFingerprint: buildTrustedExecutableResolutionPolicy().policyFingerprint,
    resolverSessionCapabilityFingerprint: input.request.resolverSessionCapability.capabilityFingerprint,
    candidateCapabilityFingerprint: candidate?.candidateCapability?.capabilityFingerprint ?? "fixture_candidate_unavailable",
    fixtureObservationFingerprint: candidate?.fixtureFingerprint ?? "fixture_observation_unavailable",
    authority: "fixture_structural_only",
    completeness,
    disposition,
    blockingReasons: sorted(blocking) as ExecutableResolverBlockingReason[],
    ambiguityReasons: sorted(ambiguity) as ExecutableResolverAmbiguityReason[],
    evaluatedAt: input.evaluatedAt,
    expiresAt: TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
  } satisfies Omit<SanitizedExecutableResolutionEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  const evidence = deepFreeze({ ...evidenceCore, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableEvidence, evidenceCore) } satisfies SanitizedExecutableResolutionEvidence);
  const resultCore = {
    resultKind: "trusted_executable_resolution_fixture_result",
    resultVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    issuesLiveExecutableCapability: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    authority: "fixture_structural_only",
    candidateSetClassification: set,
    evidence,
  } satisfies Omit<TrustedExecutableResolutionFixtureResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({ ...resultCore, resultFingerprintAlgorithm: "sha256", resultFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableResult, resultCore) } satisfies TrustedExecutableResolutionFixtureResult);
}

function resolveRepositoryFixture(input: Readonly<{
  request: TrustedRepositoryResolutionRequest;
  candidates: readonly FixtureRepositoryCandidateObservation[];
  evaluatedAt: string;
  candidateSetCompleteness?: "modeled_complete" | "modeled_incomplete" | "modeled_ambiguous";
}>): TrustedRepositoryResolutionFixtureResult {
  const requestErrors = validateTrustedRepositoryResolutionRequest(input.request, input.evaluatedAt).errors as RepositoryResolverBlockingReason[];
  const set = classifyCandidateSet(input.candidates, input.candidateSetCompleteness);
  const blocking: RepositoryResolverBlockingReason[] = [...requestErrors];
  const ambiguity: RepositoryResolverAmbiguityReason[] = [];
  if (set === "no_candidate") blocking.push("no_candidate");
  if (set === "multiple_candidates") blocking.push("multiple_candidates");
  if (set === "candidate_set_incomplete") ambiguity.push("candidate_set_incomplete");
  if (set === "candidate_set_ambiguous") ambiguity.push("candidate_set_ambiguous");
  if (input.candidates.length === 1) {
    const candidate = validateRepositoryCandidateObservation(input.candidates[0], input.request, input.evaluatedAt);
    blocking.push(...candidate.blocking);
    ambiguity.push(...candidate.ambiguity);
  }
  const completeness = repositoryCompleteness(blocking, ambiguity);
  const disposition: RepositorySelectionDisposition = blocking.length > 0 ? "blocked_fixture_repository" : ambiguity.length > 0 ? "ambiguous_fixture_repository" : "compatible_fixture_repository";
  const candidate = input.candidates[0];
  const evidenceCore = {
    evidenceKind: "sanitized_repository_resolution_evidence",
    evidenceVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    provesRepositoryExistsLive: false,
    provesRepositoryTrustedLive: false,
    issuesLiveRepositoryCapability: false,
    enablesGitOperation: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    boundarySessionId: input.request.boundarySessionId,
    requestId: input.request.requestId,
    sanitizedStructuralRootPath: candidate?.repositoryIdentity?.structuralRootPath ?? "fixture_path_unavailable",
    resolverIdentityFingerprint: buildTrustedResolverIdentityFingerprint(),
    resolverPolicyFingerprint: buildTrustedRepositoryResolutionPolicy().policyFingerprint,
    resolverSessionCapabilityFingerprint: input.request.resolverSessionCapability.capabilityFingerprint,
    candidateCapabilityFingerprint: candidate?.candidateCapability?.capabilityFingerprint ?? "fixture_candidate_unavailable",
    fixtureObservationFingerprint: candidate?.fixtureFingerprint ?? "fixture_observation_unavailable",
    authority: "fixture_structural_only",
    completeness,
    disposition,
    blockingReasons: sorted(blocking) as RepositoryResolverBlockingReason[],
    ambiguityReasons: sorted(ambiguity) as RepositoryResolverAmbiguityReason[],
    evaluatedAt: input.evaluatedAt,
    expiresAt: TRUSTED_LIVE_RESOLVER_EXPIRES_AT,
  } satisfies Omit<SanitizedRepositoryResolutionEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  const evidence = deepFreeze({ ...evidenceCore, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryEvidence, evidenceCore) } satisfies SanitizedRepositoryResolutionEvidence);
  const resultCore = {
    resultKind: "trusted_repository_resolution_fixture_result",
    resultVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    issuesLiveRepositoryCapability: false,
    enablesGitOperation: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    authority: "fixture_structural_only",
    candidateSetClassification: set,
    evidence,
  } satisfies Omit<TrustedRepositoryResolutionFixtureResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({ ...resultCore, resultFingerprintAlgorithm: "sha256", resultFingerprint: fingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.repositoryResult, resultCore) } satisfies TrustedRepositoryResolutionFixtureResult);
}

function classifyCandidateSet(candidates: readonly unknown[], completeness: "modeled_complete" | "modeled_incomplete" | "modeled_ambiguous" = "modeled_complete"): ResolverCandidateSetClassification {
  if (completeness === "modeled_incomplete") return "candidate_set_incomplete";
  if (completeness === "modeled_ambiguous") return "candidate_set_ambiguous";
  if (candidates.length === 0) return "no_candidate";
  if (candidates.length > 1) return "multiple_candidates";
  return "exactly_one_candidate";
}

function classifyPath(path: unknown, blocking: string[]): void {
  const errors = validateFixtureAbsoluteMacosPath(path);
  for (const error of errors) blocking.push(error);
}

function isWithinApprovedExecutableRoot(path: string, rootClass: ApprovedExecutableRootClass, rootFingerprint: string): boolean {
  const rootByClass: Record<ApprovedExecutableRootClass, string> = {
    system_usr_bin: "/usr/bin",
    homebrew_bin: "/opt/homebrew/bin",
    homebrew_opt: "/opt/homebrew/opt",
    approved_application_support_tooling: "/Library/Application Support/Ture",
  };
  const root = rootByClass[rootClass];
  return rootFingerprint === sha256(root) && (path === root || path.startsWith(`${root}/`));
}

function isWithinApprovedRepositoryRoot(path: string, rootClass: ApprovedRepositoryRootClass, rootFingerprint: string): boolean {
  const root = "/Users/reviewed/workspace/trade";
  return rootClass === "reviewed_workspace_root" && rootFingerprint === sha256("reviewed_workspace_root") && path === root;
}

function classifyOwnership(state: FixtureOwnershipState, blocking: string[], ambiguity: string[]): void {
  if (state === "modeled_expected_owner") return;
  if (state === "ownership_unavailable") ambiguity.push("ownership_unavailable");
  else if (state === "ownership_ambiguous") ambiguity.push("ownership_ambiguous");
  else if (state === "modeled_group_writable" || state === "modeled_world_writable" || state === "modeled_unsafe_permissions") blocking.push("unsafe_permissions");
  else blocking.push("ownership_mismatch");
}

function classifyProvenance(state: FixtureProvenanceState, blocking: string[], ambiguity: string[]): void {
  if (state === "modeled_approved_distribution" || state === "modeled_approved_repository") return;
  if (state === "provenance_unavailable") ambiguity.push("provenance_unavailable");
  else if (state === "provenance_ambiguous") ambiguity.push("provenance_ambiguous");
  else blocking.push("provenance_unapproved");
}

function classifySymlink(state: FixtureSymlinkState, blocking: string[], ambiguity: string[]): void {
  if (state === "modeled_not_symlink") return;
  if (state === "symlink_state_unavailable") ambiguity.push("symlink_state_unavailable");
  else if (state === "symlink_state_ambiguous") ambiguity.push("symlink_state_ambiguous");
  else blocking.push("symlink_candidate");
}

function classifyArchitecture(state: FixtureArchitectureState, blocking: string[], ambiguity: string[]): void {
  if (state === "modeled_arm64" || state === "modeled_universal") return;
  if (state === "architecture_unavailable") ambiguity.push("architecture_unavailable");
  else if (state === "architecture_ambiguous") ambiguity.push("architecture_ambiguous");
  else blocking.push("architecture_unsupported");
}

function classifyRosetta(state: FixtureRosettaState, blocking: string[], ambiguity: string[]): void {
  if (state === "modeled_native_execution" || state === "modeled_rosetta_not_applicable") return;
  if (state === "rosetta_state_unavailable") ambiguity.push("rosetta_state_unavailable");
  else if (state === "rosetta_state_ambiguous") ambiguity.push("rosetta_state_ambiguous");
  else blocking.push("rosetta_not_approved");
}

function validateObservationTimes(input: Record<string, unknown>, evaluatedAt: string, ambiguity: string[]): void {
  for (const key of ["observationStartedAt", "observationEndedAt", "evidenceCapturedAt", "evidenceExpiresAt"]) if (!isIso(input[key])) ambiguity.push("evidence_stale");
  if (isIso(input.observationStartedAt) && isIso(input.observationEndedAt) && input.observationEndedAt < input.observationStartedAt) ambiguity.push("evidence_stale");
  if (isIso(input.evidenceCapturedAt) && isIso(input.observationStartedAt) && input.evidenceCapturedAt < input.observationStartedAt) ambiguity.push("evidence_stale");
  if (isIso(input.evidenceCapturedAt) && isIso(input.observationEndedAt) && input.evidenceCapturedAt > input.observationEndedAt) ambiguity.push("evidence_stale");
  if (isIso(input.evidenceExpiresAt) && isIso(evaluatedAt) && evaluatedAt > input.evidenceExpiresAt) ambiguity.push("evidence_stale");
}

function executableCompleteness(blocking: readonly string[], ambiguity: readonly string[]): ExecutableResolutionCompleteness {
  if (blocking.includes("path_contains_parent_traversal")) return "contradictory";
  const incomplete = new Set<ExecutableResolutionCompleteness>();
  if (blocking.includes("no_candidate") || blocking.includes("multiple_candidates") || ambiguity.includes("candidate_set_incomplete") || ambiguity.includes("candidate_set_ambiguous")) incomplete.add("incomplete_candidate_set");
  if (blocking.includes("path_invalid") || blocking.includes("path_not_absolute") || ambiguity.includes("path_scope_incomplete")) incomplete.add("incomplete_path_scope");
  if (blocking.includes("filesystem_object_not_regular_file") || ambiguity.includes("filesystem_object_type_unknown")) incomplete.add("incomplete_object_type");
  if (blocking.includes("executable_permission_missing") || ambiguity.includes("executable_permission_unknown")) incomplete.add("incomplete_permissions");
  if (blocking.includes("ownership_mismatch") || blocking.includes("unsafe_permissions") || ambiguity.includes("ownership_unavailable") || ambiguity.includes("ownership_ambiguous")) incomplete.add("incomplete_ownership");
  if (blocking.includes("provenance_unapproved") || ambiguity.includes("provenance_unavailable") || ambiguity.includes("provenance_ambiguous")) incomplete.add("incomplete_provenance");
  if (blocking.includes("symlink_candidate") || ambiguity.includes("symlink_state_unavailable") || ambiguity.includes("symlink_state_ambiguous")) incomplete.add("incomplete_symlink_state");
  if (blocking.includes("architecture_unsupported") || ambiguity.includes("architecture_unavailable") || ambiguity.includes("architecture_ambiguous")) incomplete.add("incomplete_architecture");
  if (blocking.includes("rosetta_not_approved") || ambiguity.includes("rosetta_state_unavailable") || ambiguity.includes("rosetta_state_ambiguous")) incomplete.add("incomplete_rosetta_state");
  if (ambiguity.includes("evidence_stale")) incomplete.add("incomplete_freshness");
  if (incomplete.size > 1) return "incomplete_multiple";
  return incomplete.values().next().value ?? "complete_fixture_structure";
}

function repositoryCompleteness(blocking: readonly string[], ambiguity: readonly string[]): RepositoryResolutionCompleteness {
  if (blocking.includes("path_contains_parent_traversal")) return "contradictory";
  const incomplete = new Set<RepositoryResolutionCompleteness>();
  if (blocking.includes("no_candidate") || blocking.includes("multiple_candidates") || ambiguity.includes("candidate_set_incomplete") || ambiguity.includes("candidate_set_ambiguous")) incomplete.add("incomplete_candidate_set");
  if (blocking.includes("path_invalid") || blocking.includes("path_not_absolute") || ambiguity.includes("path_scope_incomplete")) incomplete.add("incomplete_path_scope");
  if (blocking.includes("filesystem_object_not_directory") || ambiguity.includes("filesystem_object_type_unknown")) incomplete.add("incomplete_object_type");
  if (blocking.includes("repository_marker_mismatch") || ambiguity.includes("repository_marker_unavailable") || ambiguity.includes("repository_marker_ambiguous")) incomplete.add("incomplete_repository_marker");
  if (blocking.includes("ownership_mismatch") || blocking.includes("unsafe_permissions") || ambiguity.includes("ownership_unavailable") || ambiguity.includes("ownership_ambiguous")) incomplete.add("incomplete_ownership");
  if (blocking.includes("provenance_unapproved") || ambiguity.includes("provenance_unavailable") || ambiguity.includes("provenance_ambiguous")) incomplete.add("incomplete_provenance");
  if (blocking.includes("symlink_candidate") || ambiguity.includes("symlink_state_unavailable") || ambiguity.includes("symlink_state_ambiguous")) incomplete.add("incomplete_symlink_state");
  if (ambiguity.includes("evidence_stale")) incomplete.add("incomplete_freshness");
  if (incomplete.size > 1) return "incomplete_multiple";
  return incomplete.values().next().value ?? "complete_fixture_structure";
}

function exact<T>(input: unknown, expected: T, prefix: string, fingerprintKey?: string, algorithmKey?: string, domain?: string): ValidationResult<T> {
  const errors = validateShape(input, expected, prefix, fingerprintKey, algorithmKey, domain);
  const inputJson = safeStableStringify(input);
  const expectedJson = safeStableStringify(expected);
  if (!inputJson || !expectedJson || inputJson !== expectedJson) errors.push(`${prefix}_not_exact`);
  return validation(input, errors);
}

function validateShape(input: unknown, expected: unknown, prefix: string, fingerprintKey?: string, algorithmKey?: string, domain?: string): string[] {
  const errors: string[] = [];
  if (!isRecord(input) || !isRecord(expected)) return [`${prefix}_invalid`];
  for (const key of Object.keys(input)) if (!Object.keys(expected).includes(key)) errors.push(`unknown_${prefix}_field:${key}`);
  for (const key of Object.keys(expected)) if (!Object.keys(input).includes(key)) errors.push(`missing_${prefix}_field:${key}`);
  if (hasSensitiveMaterial(input)) errors.push("sensitive_material_present");
  if (hasProhibitedResolverInput(input)) errors.push("request_invalid");
  if (fingerprintKey && algorithmKey && domain) {
    if (input[algorithmKey] !== "sha256") errors.push("fingerprint_invalid");
    if (!isSha256(input[fingerprintKey])) errors.push("fingerprint_invalid");
    const core = { ...input };
    delete core[fingerprintKey];
    delete core[algorithmKey];
    if (isSha256(input[fingerprintKey])) {
      const expectedFingerprint = safeFingerprint(domain, core);
      if (!expectedFingerprint || input[fingerprintKey] !== expectedFingerprint) errors.push("fingerprint_invalid");
    }
  }
  for (const key of Object.keys(expected)) {
    if (key === fingerprintKey || key === algorithmKey) continue;
    const inputJson = safeStableStringify(input[key]);
    const expectedJson = safeStableStringify(expected[key]);
    if (!inputJson || !expectedJson || inputJson !== expectedJson) errors.push(`${prefix}_field_mismatch:${key}`);
  }
  return sorted(errors);
}

function validateTimeRange(issuedAt: unknown, expiresAt: unknown, evaluatedAt: string, errors: string[], expiredReason: string): void {
  if (!isIso(issuedAt) || !isIso(expiresAt)) {
    errors.push("request_invalid");
    return;
  }
  if (expiresAt <= issuedAt || (isIso(evaluatedAt) && evaluatedAt > expiresAt)) errors.push(expiredReason);
}

function hasProhibitedResolverInput(input: unknown): boolean {
  const prohibited = new Set([
    "pid",
    "ppid",
    "pgid",
    "uid",
    "gid",
    "pathEnv",
    "PATH",
    "cwd",
    "currentWorkingDirectory",
    "homeDirectory",
    "shell",
    "command",
    "commandLine",
    "args",
    "spawn",
    "exec",
    "lookupCommand",
    "realpath",
    "stat",
    "lstat",
    "fileDescriptor",
    "contained",
    "terminated",
    "safe",
    "trusted",
    "resolvedLive",
    "observedLiveOverride",
    "authoritativeLiveOverride",
    "provesLive",
    "enablesProcessStartOverride",
    "enablesPreflightRunnerOverride",
    "enablesGitOperationOverride",
    "approved",
    "trustedRoot",
    "resolved",
  ]);
  const seen = new WeakSet<object>();
  const visit = (value: unknown): boolean => {
    if (value === null || typeof value !== "object") return false;
    if (seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.some(visit);
    const record = value as Record<string, unknown>;
    return Object.keys(record).some((key) => prohibited.has(key) || visit(record[key]));
  };
  return visit(input);
}

function hasSensitiveMaterial(input: unknown): boolean {
  const seen = new WeakSet<object>();
  const visit = (value: unknown): boolean => {
    if (typeof value === "string") return /(access[_ -]?token|refresh[_ -]?token|service[_ -]?role|anon[_ -]?key|api[_ -]?key|password|connection[_ -]?string|postgres:\/\/|authorization header|bearer|cookie|session[_ -]?(token|secret|cookie)|private[_ -]?key|client[_ -]?secret|keychain|bankid|jwt|eyj[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+)/iu.test(value);
    if (value === null || typeof value !== "object") return false;
    if (seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.some(visit);
    return Object.values(value as Record<string, unknown>).some(visit);
  };
  return visit(input);
}

function validation<T>(input: unknown, errors: readonly string[]): ValidationResult<T> {
  if (errors.length > 0) return deepFreeze({ ok: false, errors: sorted(errors) });
  return deepFreeze({ ok: true, value: input as T });
}

function validationErrors(result: ValidationResult<unknown> | { ok: boolean; errors: readonly string[] }): readonly string[] {
  return result.ok ? [] : result.errors;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isSha256(input: unknown): input is string {
  return typeof input === "string" && /^[a-f0-9]{64}$/u.test(input);
}

function isIso(input: unknown): input is string {
  return typeof input === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(input) && !Number.isNaN(Date.parse(input));
}

function isCapabilityId(input: unknown, prefix: string): boolean {
  return typeof input === "string" && input.startsWith(prefix) && /^[a-z0-9_]+$/u.test(input);
}

function sorted<T extends string>(input: readonly T[]): T[] {
  return [...new Set(input)].sort();
}

function stableStringify(input: unknown): string {
  const stack = new WeakSet<object>();
  const normalize = (value: unknown): unknown => {
    if (value === null || typeof value !== "object") return value;
    if (stack.has(value)) throw new Error("cyclic input is not supported");
    stack.add(value);
    if (Array.isArray(value)) {
      const mapped = value.map(normalize);
      stack.delete(value);
      return mapped;
    }
    const record = value as Record<string, unknown>;
    const mapped = Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalize(record[key])]));
    stack.delete(value);
    return mapped;
  };
  return JSON.stringify(normalize(input));
}

function safeStableStringify(input: unknown): string | null {
  try {
    return stableStringify(input);
  } catch {
    return null;
  }
}

function fingerprint(domain: string, input: unknown): string {
  return sha256(`${domain}:${stableStringify(input)}`);
}

function safeFingerprint(domain: string, input: unknown): string | null {
  const serialized = safeStableStringify(input);
  return serialized ? sha256(`${domain}:${serialized}`) : null;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function deepFreeze<T>(input: T): T {
  if (input === null || typeof input !== "object") return input;
  Object.freeze(input);
  for (const value of Object.values(input as Record<string, unknown>)) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) deepFreeze(value);
  }
  return input;
}
