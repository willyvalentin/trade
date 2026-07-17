import { createHash } from "node:crypto";

import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID,
  buildProcessExecutableRegistry,
  buildProcessOperationRegistry,
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
  POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
  POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID,
  POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM,
  validateArchitectureCompatibilityPolicy,
  validateLiveMacosProcessDriverDesign,
  validateTocTouRevalidationPolicy,
  buildArchitectureCompatibilityPolicy,
  buildLiveMacosProcessDriverDesign,
  buildTocTouRevalidationPolicy,
} from "@/lib/post-trade-live-read-only-macos-process-driver-design";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_TRUSTED_RESOLVER_ID =
  "reviewed_macos_preflight_executable_and_cwd_resolver_v1" as const;
export const POST_TRADE_TRUSTED_RESOLVER_VERSION =
  "post_trade_trusted_executable_repository_cwd_resolver_v1" as const;
export const POST_TRADE_TRUSTED_REPOSITORY_IDENTITY = "ture_trade_repository_root" as const;
export const POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT = "2026-07-17T10:00:00.000Z" as const;
export const POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT = "2026-07-17T10:00:05.000Z" as const;

export type ValidationResult = { valid: boolean; blockingReasons: readonly string[] };
export type ArchitectureClassification =
  | "arm64_native"
  | "x86_64_native"
  | "x86_64_under_rosetta"
  | "universal_binary"
  | "unsupported"
  | "unknown"
  | "ambiguous";
export type RosettaClassification = "not_required" | "reviewed_rosetta" | "unreviewed_rosetta" | "unknown" | "ambiguous";
export type FileTypeClassification = "regular_executable" | "wrapper" | "script_proxy" | "alias" | "shell_function" | "unknown";
export type SymlinkClassification =
  | "none"
  | "reviewed_single"
  | "reviewed_bounded_chain"
  | "unresolved"
  | "relative_unsafe"
  | "loop"
  | "excessive_depth"
  | "cross_volume"
  | "changed_target"
  | "ambiguous";
export type OwnershipClassification = "trusted_system" | "trusted_reviewed_user" | "untrusted" | "ambiguous";
export type PermissionClassification =
  | "non_world_writable_executable"
  | "executable_world_writable"
  | "executable_group_writable"
  | "executable_user_writable_unreviewed"
  | "parent_world_writable"
  | "parent_writable_unreviewed"
  | "permission_unknown";
export type ProvenanceClassification =
  | "macos_system_component"
  | "reviewed_homebrew_installation"
  | "reviewed_npm_cli_installation"
  | "reviewed_standalone_installation"
  | "unknown"
  | "untrusted"
  | "ambiguous";
export type StableIdentityClassification = "complete" | "changed" | "incomplete" | "ambiguous";
export type ResolutionDecision = "accepted_fixture_only" | "blocked";
export type RevalidationClassification = "unchanged" | "changed" | "stale" | "incomplete" | "ambiguous" | "failed";

export type TrustedResolverRegistry = {
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  resolverVersion: typeof POST_TRADE_TRUSTED_RESOLVER_VERSION;
  platform: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  gitExecutableIdentity: "git_cli";
  supabaseExecutableIdentity: "supabase_cli";
  repositoryIdentity: typeof POST_TRADE_TRUSTED_REPOSITORY_IDENTITY;
  noPathFallback: true;
  callerPathAllowed: false;
  shellLookupAllowed: false;
  whichLookupAllowed: false;
  commandVLookupAllowed: false;
  genericFilesystemLookupAllowed: false;
  automaticFallbackAllowed: false;
  environmentSelectedResolverAllowed: false;
  callerSelectedResolverAllowed: false;
  liveImplementationPresent: false;
  observedLive: false;
  fixtureOnly: true;
  resolverFingerprintAlgorithm: "sha256";
  resolverFingerprint: string;
};

export type ExecutableResolutionPolicy = {
  policyId: string;
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  executableIdentity: ProcessExecutableIdentity;
  expectedBasename: "git" | "supabase";
  expectedFileType: "regular_executable";
  executablePermissionRequired: true;
  regularFileRequired: true;
  wrapperAllowed: false;
  scriptProxyAllowed: false;
  aliasAllowed: false;
  shellFunctionAllowed: false;
  unresolvedSymlinkAllowed: false;
  worldWritableExecutableAllowed: false;
  worldWritableParentAllowed: false;
  ambiguousOwnershipAllowed: false;
  unsupportedArchitectureAllowed: false;
  unknownArchitectureAllowed: false;
  unreviewedRosettaAllowed: false;
  unknownProvenanceAllowed: false;
  multipleMatchesAllowed: false;
  stableFileIdentityRequired: true;
  capabilityLifetimeMs: 5_000;
  fallbackAllowed: false;
  publicPathAllowed: false;
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
};

export type RepositoryResolutionPolicy = {
  policyId: "post_trade_trusted_ture_repository_cwd_policy_v1";
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  repositoryIdentity: typeof POST_TRADE_TRUSTED_REPOSITORY_IDENTITY;
  expectedProjectClassification: "ture_trade_project";
  repositoryMarkerRequired: true;
  gitWorktreeRequired: true;
  nestedUnrelatedRepositoryAllowed: false;
  bareRepositoryAllowed: false;
  symlinkRootAllowed: false;
  productionCheckoutAllowed: false;
  callerSelectedPathAllowed: false;
  publicAbsolutePathAllowed: false;
  homePathExposureAllowed: false;
  stagingOnlyContextRequired: true;
  capabilityLifetimeMs: 5_000;
  revalidationRequired: true;
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
};

export type ExecutableCandidateObservation = {
  observationId: string;
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  candidateOpaqueId: string;
  executableIdentity: ProcessExecutableIdentity;
  expectedBasename: "git" | "supabase";
  basenameObserved: "git" | "supabase";
  fileTypeClassification: FileTypeClassification;
  executablePermissionClassification: "executable" | "not_executable" | "unknown";
  symlinkClassification: SymlinkClassification;
  symlinkDepthClassification: "none" | "single" | "bounded" | "excessive" | "loop" | "ambiguous";
  wrapperClassification: "not_wrapper" | "wrapper" | "ambiguous";
  scriptClassification: "not_script" | "script_proxy" | "ambiguous";
  ownershipClassification: OwnershipClassification;
  parentPermissionClassification: PermissionClassification;
  architectureClassification: ArchitectureClassification;
  rosettaClassification: RosettaClassification;
  provenanceClassification: ProvenanceClassification;
  stableFileIdentityClassification: StableIdentityClassification;
  sizeClassification: "stable" | "changed" | "unknown";
  modificationStateClassification: "stable" | "changed" | "unknown";
  optionalDigestClassification: "not_collected" | "sanitized_digest_available" | "changed" | "unknown";
  observationSourceIdentity: "fixture_adapter";
  observedAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT;
  expiresAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT;
  complete: true;
  authoritativeFixture: true;
  observedLive: false;
  fixtureOnly: true;
  callerSelectedCandidate: false;
  fallbackCandidate: false;
  productionSpecificWrapper: false;
  publicPathAbsent: true;
  publicPathValue?: never;
  pathValue?: never;
  homePathValue?: never;
  rawOwnerId?: never;
  rawGroupId?: never;
  rawDeviceId?: never;
  rawInode?: never;
  rawDigest?: never;
  observationFingerprintAlgorithm: "sha256";
  observationFingerprint: string;
};

export type RepositoryRootObservation = {
  observationId: "post_trade_trusted_repository_root_fixture_observation_001";
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  repositoryOpaqueId: "post_trade_ture_repository_root_opaque_fixture_001";
  repositoryIdentity: typeof POST_TRADE_TRUSTED_REPOSITORY_IDENTITY;
  rootClassification: "reviewed_repository_root" | "ambiguous" | "wrong_project";
  gitWorktreeClassification: "worktree" | "bare" | "missing" | "ambiguous";
  repositoryMarkerClassification: "present" | "missing" | "ambiguous";
  projectMarkerClassification: "ture_trade_project" | "alternate_project" | "missing" | "ambiguous";
  nestedRepositoryClassification: "none" | "nested_unrelated" | "ambiguous";
  symlinkClassification: "none" | "symlink_root" | "ambiguous";
  productionReferenceClassification: "none" | "production_checkout" | "production_reference" | "ambiguous";
  stableDirectoryIdentityClassification: StableIdentityClassification;
  observationSourceIdentity: "fixture_adapter";
  observedAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT;
  expiresAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT;
  complete: true;
  authoritativeFixture: true;
  observedLive: false;
  fixtureOnly: true;
  callerSelectedPath: false;
  publicPathAbsent: true;
  observationFingerprintAlgorithm: "sha256";
  observationFingerprint: string;
};

export type ExecutableCapabilityMetadata = {
  capabilityId: string;
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  executableIdentity: ProcessExecutableIdentity;
  executableOpaqueId: string;
  expectedBasename: "git" | "supabase";
  architectureClassification: ArchitectureClassification;
  rosettaClassification: RosettaClassification;
  provenanceClassification: ProvenanceClassification;
  ownershipClassification: OwnershipClassification;
  permissionClassification: PermissionClassification;
  symlinkClassification: SymlinkClassification;
  stableFileIdentityFingerprint: string;
  resolverEvidenceFingerprint: string;
  boundarySession: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION;
  driverIdentity: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID;
  operationScope: ProcessOperationIdentity;
  issuedAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT;
  expiresAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT;
  singleUse: true;
  used: false;
  observedLive: false;
  fixtureOnly: true;
  revalidationRequired: true;
  spawnEnabled: false;
  runnerEnabled: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
};

export type RepositoryCwdCapabilityMetadata = {
  capabilityId: "post_trade_trusted_repository_cwd_capability_fixture_001";
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  repositoryIdentity: typeof POST_TRADE_TRUSTED_REPOSITORY_IDENTITY;
  repositoryOpaqueId: "post_trade_ture_repository_root_opaque_fixture_001";
  rootClassification: "reviewed_repository_root";
  stableDirectoryIdentityFingerprint: string;
  repositoryEvidenceFingerprint: string;
  boundarySession: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION;
  driverIdentity: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID;
  operationScope: ProcessOperationIdentity;
  issuedAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT;
  expiresAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT;
  singleUse: true;
  used: false;
  fixtureOnly: true;
  observedLive: false;
  revalidationRequired: true;
  spawnEnabled: false;
  runnerEnabled: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
};

export type ResolverRevalidationObservation = {
  revalidationId: "post_trade_trusted_resolver_revalidation_fixture_001";
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  targetType: "executable" | "repository";
  targetIdentity: ProcessExecutableIdentity | typeof POST_TRADE_TRUSTED_REPOSITORY_IDENTITY;
  classification: RevalidationClassification;
  samePrivateIdentity: true;
  sameFileTypeOrRepositoryMarkers: true;
  sameSymlinkChain: true;
  sameOwnershipOrProjectIdentity: true;
  samePermissionsOrWorktree: true;
  sameArchitecture: true;
  sameRosettaClassification: true;
  sameProvenance: true;
  sameSizeAndModificationState: true;
  sameBoundarySession: true;
  sameResolver: true;
  sameDriver: true;
  capabilityUnexpired: true;
  complete: true;
  fixtureOnly: true;
  observedLive: false;
  fullTocTouEliminationClaimed: false;
  revalidationFingerprintAlgorithm: "sha256";
  revalidationFingerprint: string;
};

export type SanitizedResolverEvidence = {
  evidenceId: string;
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  targetIdentity: ProcessExecutableIdentity | typeof POST_TRADE_TRUSTED_REPOSITORY_IDENTITY;
  decision: ResolutionDecision;
  candidateCountClassification: "exactly_one" | "zero" | "multiple" | "mixed";
  architectureClassification: ArchitectureClassification | "not_applicable";
  rosettaClassification: RosettaClassification | "not_applicable";
  fileTypeClassification: FileTypeClassification | "not_applicable";
  ownershipClassification: OwnershipClassification | "not_applicable";
  permissionClassification: PermissionClassification | "not_applicable";
  symlinkClassification: SymlinkClassification | "not_applicable";
  provenanceClassification: ProvenanceClassification | "not_applicable";
  identityCompleteness: "complete" | "incomplete" | "ambiguous";
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  canEnableSpawn: false;
  canEnableRunner: false;
  provesExecutableExists: false;
  provesRepositoryExists: false;
  issuedAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT;
  expiresAtIso: typeof POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
};

export type TrustedResolverCompatibilitySummary = {
  compatibilityId: "post_trade_trusted_resolver_first_live_preflight_compatibility_v1";
  resolverId: typeof POST_TRADE_TRUSTED_RESOLVER_ID;
  driverIdentity: typeof POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID;
  processExecutorId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID;
  operationRegistryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID;
  preservesExecutableRegistry: true;
  preservesArchitecturePolicy: true;
  preservesRosettaPolicy: true;
  preservesOwnershipPolicy: true;
  preservesPermissionPolicy: true;
  preservesSymlinkPolicy: true;
  preservesProvenancePolicy: true;
  preservesCapabilityLifetime: true;
  preservesStableIdentityPolicy: true;
  preservesTocTouRequirement: true;
  preservesOneProcessAtATime: true;
  preservesOneSession: true;
  preservesNoRetry: true;
  preservesStagingOnly: true;
  preservesNoShell: true;
  deploymentCount: 0;
  sqlMutationCount: 0;
  dataMutationCount: 0;
  adapterCalls: 0;
  compatibilityFingerprintAlgorithm: "sha256";
  compatibilityFingerprint: string;
};

export type TrustedResolverFixtureAdapter = {
  readonly adapterId: "post_trade_trusted_resolver_fixture_adapter_v1";
  readonly fixtureOnly: true;
  readonly observedLive: false;
  collectExecutableCandidateFixtureObservations: () => readonly ExecutableCandidateObservation[];
  collectRepositoryFixtureObservation: () => RepositoryRootObservation;
  collectFixtureRevalidationObservation: () => ResolverRevalidationObservation;
  disposeFixtureTransientMetadata: () => { disposed: true; fixtureOnly: true };
};

export function buildTrustedResolverRegistry(): TrustedResolverRegistry {
  const core = {
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    resolverVersion: POST_TRADE_TRUSTED_RESOLVER_VERSION,
    platform: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_PLATFORM,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    gitExecutableIdentity: "git_cli",
    supabaseExecutableIdentity: "supabase_cli",
    repositoryIdentity: POST_TRADE_TRUSTED_REPOSITORY_IDENTITY,
    noPathFallback: true,
    callerPathAllowed: false,
    shellLookupAllowed: false,
    whichLookupAllowed: false,
    commandVLookupAllowed: false,
    genericFilesystemLookupAllowed: false,
    automaticFallbackAllowed: false,
    environmentSelectedResolverAllowed: false,
    callerSelectedResolverAllowed: false,
    liveImplementationPresent: false,
    observedLive: false,
    fixtureOnly: true,
  } satisfies Omit<TrustedResolverRegistry, "resolverFingerprintAlgorithm" | "resolverFingerprint">;
  return { ...core, resolverFingerprintAlgorithm: "sha256", resolverFingerprint: fingerprint(core) };
}

export function buildExecutableResolutionPolicy(executableIdentity: ProcessExecutableIdentity): ExecutableResolutionPolicy {
  const core = {
    policyId: `post_trade_trusted_${executableIdentity}_resolution_policy_v1`,
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    executableIdentity,
    expectedBasename: executableIdentity === "git_cli" ? "git" : "supabase",
    expectedFileType: "regular_executable",
    executablePermissionRequired: true,
    regularFileRequired: true,
    wrapperAllowed: false,
    scriptProxyAllowed: false,
    aliasAllowed: false,
    shellFunctionAllowed: false,
    unresolvedSymlinkAllowed: false,
    worldWritableExecutableAllowed: false,
    worldWritableParentAllowed: false,
    ambiguousOwnershipAllowed: false,
    unsupportedArchitectureAllowed: false,
    unknownArchitectureAllowed: false,
    unreviewedRosettaAllowed: false,
    unknownProvenanceAllowed: false,
    multipleMatchesAllowed: false,
    stableFileIdentityRequired: true,
    capabilityLifetimeMs: 5_000,
    fallbackAllowed: false,
    publicPathAllowed: false,
  } satisfies Omit<ExecutableResolutionPolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return { ...core, policyFingerprintAlgorithm: "sha256", policyFingerprint: fingerprint(core) };
}

export function buildRepositoryResolutionPolicy(): RepositoryResolutionPolicy {
  const core = {
    policyId: "post_trade_trusted_ture_repository_cwd_policy_v1",
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    repositoryIdentity: POST_TRADE_TRUSTED_REPOSITORY_IDENTITY,
    expectedProjectClassification: "ture_trade_project",
    repositoryMarkerRequired: true,
    gitWorktreeRequired: true,
    nestedUnrelatedRepositoryAllowed: false,
    bareRepositoryAllowed: false,
    symlinkRootAllowed: false,
    productionCheckoutAllowed: false,
    callerSelectedPathAllowed: false,
    publicAbsolutePathAllowed: false,
    homePathExposureAllowed: false,
    stagingOnlyContextRequired: true,
    capabilityLifetimeMs: 5_000,
    revalidationRequired: true,
  } satisfies Omit<RepositoryResolutionPolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return { ...core, policyFingerprintAlgorithm: "sha256", policyFingerprint: fingerprint(core) };
}

export function buildExecutableCandidateObservation(
  executableIdentity: ProcessExecutableIdentity,
  patch: Partial<Omit<ExecutableCandidateObservation, "observationFingerprintAlgorithm" | "observationFingerprint">> = {},
): ExecutableCandidateObservation {
  const core = {
    observationId: `post_trade_trusted_${executableIdentity}_candidate_fixture_001`,
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    candidateOpaqueId: `post_trade_${executableIdentity}_opaque_candidate_001`,
    executableIdentity,
    expectedBasename: executableIdentity === "git_cli" ? "git" : "supabase",
    basenameObserved: executableIdentity === "git_cli" ? "git" : "supabase",
    fileTypeClassification: "regular_executable",
    executablePermissionClassification: "executable",
    symlinkClassification: "none",
    symlinkDepthClassification: "none",
    wrapperClassification: "not_wrapper",
    scriptClassification: "not_script",
    ownershipClassification: "trusted_reviewed_user",
    parentPermissionClassification: "non_world_writable_executable",
    architectureClassification: "universal_binary",
    rosettaClassification: "not_required",
    provenanceClassification: "reviewed_homebrew_installation",
    stableFileIdentityClassification: "complete",
    sizeClassification: "stable",
    modificationStateClassification: "stable",
    optionalDigestClassification: "not_collected",
    observationSourceIdentity: "fixture_adapter",
    observedAtIso: POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT,
    expiresAtIso: POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT,
    complete: true,
    authoritativeFixture: true,
    observedLive: false,
    fixtureOnly: true,
    callerSelectedCandidate: false,
    fallbackCandidate: false,
    productionSpecificWrapper: false,
    publicPathAbsent: true,
    ...patch,
  } satisfies Omit<ExecutableCandidateObservation, "observationFingerprintAlgorithm" | "observationFingerprint">;
  return { ...core, observationFingerprintAlgorithm: "sha256", observationFingerprint: fingerprint(core) };
}

export function buildRepositoryRootObservation(
  patch: Partial<Omit<RepositoryRootObservation, "observationFingerprintAlgorithm" | "observationFingerprint">> = {},
): RepositoryRootObservation {
  const core = {
    observationId: "post_trade_trusted_repository_root_fixture_observation_001",
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    repositoryOpaqueId: "post_trade_ture_repository_root_opaque_fixture_001",
    repositoryIdentity: POST_TRADE_TRUSTED_REPOSITORY_IDENTITY,
    rootClassification: "reviewed_repository_root",
    gitWorktreeClassification: "worktree",
    repositoryMarkerClassification: "present",
    projectMarkerClassification: "ture_trade_project",
    nestedRepositoryClassification: "none",
    symlinkClassification: "none",
    productionReferenceClassification: "none",
    stableDirectoryIdentityClassification: "complete",
    observationSourceIdentity: "fixture_adapter",
    observedAtIso: POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT,
    expiresAtIso: POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT,
    complete: true,
    authoritativeFixture: true,
    observedLive: false,
    fixtureOnly: true,
    callerSelectedPath: false,
    publicPathAbsent: true,
    ...patch,
  } satisfies Omit<RepositoryRootObservation, "observationFingerprintAlgorithm" | "observationFingerprint">;
  return { ...core, observationFingerprintAlgorithm: "sha256", observationFingerprint: fingerprint(core) };
}

export function evaluateExecutableCandidateSet(candidates: readonly ExecutableCandidateObservation[], executableIdentity: ProcessExecutableIdentity): ValidationResult {
  const reasons: string[] = [];
  if (candidates.length === 0) reasons.push("zero_candidates");
  if (candidates.length > 1) reasons.push("multiple_candidates");
  const candidateIds = new Set<string>();
  const stableIdentities = new Set<string>();
  const resolverIds = new Set<string>();
  const sourceIdentities = new Set<string>();
  for (const candidate of candidates) {
    reasons.push(...validateExecutableCandidateObservation(candidate).blockingReasons);
    if (candidate.executableIdentity !== executableIdentity) reasons.push("mixed_component_candidates");
    if (candidateIds.has(candidate.candidateOpaqueId)) reasons.push("duplicate_candidate_ids");
    candidateIds.add(candidate.candidateOpaqueId);
    if (stableIdentities.has(candidate.stableFileIdentityClassification)) reasons.push("duplicate_stable_identities");
    stableIdentities.add(candidate.stableFileIdentityClassification);
    resolverIds.add(candidate.resolverId);
    sourceIdentities.add(candidate.observationSourceIdentity);
  }
  if (resolverIds.size > 1) reasons.push("mixed_resolver_candidates");
  if (sourceIdentities.size > 1) reasons.push("mixed_source_candidates");
  return result(reasons);
}

export function buildExecutableCapabilityMetadata(
  candidate: ExecutableCandidateObservation = buildExecutableCandidateObservation("git_cli"),
  operationScope: ProcessOperationIdentity = "preflight_git_current_commit",
): ExecutableCapabilityMetadata {
  const core = {
    capabilityId: `post_trade_trusted_${candidate.executableIdentity}_capability_fixture_001`,
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    executableIdentity: candidate.executableIdentity,
    executableOpaqueId: candidate.candidateOpaqueId,
    expectedBasename: candidate.expectedBasename,
    architectureClassification: candidate.architectureClassification,
    rosettaClassification: candidate.rosettaClassification,
    provenanceClassification: candidate.provenanceClassification,
    ownershipClassification: candidate.ownershipClassification,
    permissionClassification: candidate.parentPermissionClassification,
    symlinkClassification: candidate.symlinkClassification,
    stableFileIdentityFingerprint: hash(`stable:${candidate.candidateOpaqueId}:${candidate.stableFileIdentityClassification}`),
    resolverEvidenceFingerprint: candidate.observationFingerprint,
    boundarySession: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    driverIdentity: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID,
    operationScope,
    issuedAtIso: POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT,
    expiresAtIso: POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT,
    singleUse: true,
    used: false,
    observedLive: false,
    fixtureOnly: true,
    revalidationRequired: true,
    spawnEnabled: false,
    runnerEnabled: false,
  } satisfies Omit<ExecutableCapabilityMetadata, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  return { ...core, capabilityFingerprintAlgorithm: "sha256", capabilityFingerprint: fingerprint(core) };
}

export function buildRepositoryCwdCapabilityMetadata(
  observation: RepositoryRootObservation = buildRepositoryRootObservation(),
  operationScope: ProcessOperationIdentity = "preflight_git_current_commit",
): RepositoryCwdCapabilityMetadata {
  const core = {
    capabilityId: "post_trade_trusted_repository_cwd_capability_fixture_001",
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    repositoryIdentity: observation.repositoryIdentity,
    repositoryOpaqueId: observation.repositoryOpaqueId,
    rootClassification: "reviewed_repository_root",
    stableDirectoryIdentityFingerprint: hash(`stable:${observation.repositoryOpaqueId}:${observation.stableDirectoryIdentityClassification}`),
    repositoryEvidenceFingerprint: observation.observationFingerprint,
    boundarySession: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    driverIdentity: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID,
    operationScope,
    issuedAtIso: POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT,
    expiresAtIso: POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT,
    singleUse: true,
    used: false,
    fixtureOnly: true,
    observedLive: false,
    revalidationRequired: true,
    spawnEnabled: false,
    runnerEnabled: false,
  } satisfies Omit<RepositoryCwdCapabilityMetadata, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  return { ...core, capabilityFingerprintAlgorithm: "sha256", capabilityFingerprint: fingerprint(core) };
}

export function buildResolverRevalidationObservation(
  patch: Partial<Omit<ResolverRevalidationObservation, "revalidationFingerprintAlgorithm" | "revalidationFingerprint">> = {},
): ResolverRevalidationObservation {
  const core = {
    revalidationId: "post_trade_trusted_resolver_revalidation_fixture_001",
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    targetType: "executable",
    targetIdentity: "git_cli",
    classification: "unchanged",
    samePrivateIdentity: true,
    sameFileTypeOrRepositoryMarkers: true,
    sameSymlinkChain: true,
    sameOwnershipOrProjectIdentity: true,
    samePermissionsOrWorktree: true,
    sameArchitecture: true,
    sameRosettaClassification: true,
    sameProvenance: true,
    sameSizeAndModificationState: true,
    sameBoundarySession: true,
    sameResolver: true,
    sameDriver: true,
    capabilityUnexpired: true,
    complete: true,
    fixtureOnly: true,
    observedLive: false,
    fullTocTouEliminationClaimed: false,
    ...patch,
  } satisfies Omit<ResolverRevalidationObservation, "revalidationFingerprintAlgorithm" | "revalidationFingerprint">;
  return { ...core, revalidationFingerprintAlgorithm: "sha256", revalidationFingerprint: fingerprint(core) };
}

export function buildSanitizedResolverEvidence(targetIdentity: SanitizedResolverEvidence["targetIdentity"] = "git_cli"): SanitizedResolverEvidence {
  const core = {
    evidenceId: `post_trade_trusted_resolver_${targetIdentity}_sanitized_evidence_001`,
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    targetIdentity,
    decision: "accepted_fixture_only",
    candidateCountClassification: "exactly_one",
    architectureClassification: targetIdentity === POST_TRADE_TRUSTED_REPOSITORY_IDENTITY ? "not_applicable" : "universal_binary",
    rosettaClassification: targetIdentity === POST_TRADE_TRUSTED_REPOSITORY_IDENTITY ? "not_applicable" : "not_required",
    fileTypeClassification: targetIdentity === POST_TRADE_TRUSTED_REPOSITORY_IDENTITY ? "not_applicable" : "regular_executable",
    ownershipClassification: targetIdentity === POST_TRADE_TRUSTED_REPOSITORY_IDENTITY ? "not_applicable" : "trusted_reviewed_user",
    permissionClassification: targetIdentity === POST_TRADE_TRUSTED_REPOSITORY_IDENTITY ? "not_applicable" : "non_world_writable_executable",
    symlinkClassification: targetIdentity === POST_TRADE_TRUSTED_REPOSITORY_IDENTITY ? "not_applicable" : "none",
    provenanceClassification: targetIdentity === POST_TRADE_TRUSTED_REPOSITORY_IDENTITY ? "not_applicable" : "reviewed_homebrew_installation",
    identityCompleteness: "complete",
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    canEnableSpawn: false,
    canEnableRunner: false,
    provesExecutableExists: false,
    provesRepositoryExists: false,
    issuedAtIso: POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT,
    expiresAtIso: POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT,
  } satisfies Omit<SanitizedResolverEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return { ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: fingerprint(core) };
}

export function buildTrustedResolverCompatibilitySummary(): TrustedResolverCompatibilitySummary {
  const core = {
    compatibilityId: "post_trade_trusted_resolver_first_live_preflight_compatibility_v1",
    resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
    driverIdentity: POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID,
    processExecutorId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_ID,
    operationRegistryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_OPERATION_REGISTRY_ID,
    preservesExecutableRegistry: true,
    preservesArchitecturePolicy: true,
    preservesRosettaPolicy: true,
    preservesOwnershipPolicy: true,
    preservesPermissionPolicy: true,
    preservesSymlinkPolicy: true,
    preservesProvenancePolicy: true,
    preservesCapabilityLifetime: true,
    preservesStableIdentityPolicy: true,
    preservesTocTouRequirement: true,
    preservesOneProcessAtATime: true,
    preservesOneSession: true,
    preservesNoRetry: true,
    preservesStagingOnly: true,
    preservesNoShell: true,
    deploymentCount: 0,
    sqlMutationCount: 0,
    dataMutationCount: 0,
    adapterCalls: 0,
  } satisfies Omit<TrustedResolverCompatibilitySummary, "compatibilityFingerprintAlgorithm" | "compatibilityFingerprint">;
  return { ...core, compatibilityFingerprintAlgorithm: "sha256", compatibilityFingerprint: fingerprint(core) };
}

export function buildTrustedResolverInertPlan() {
  return {
    planId: "post_trade_trusted_resolver_inert_future_resolution_plan_001",
    steps: [
      "validate resolver boundary",
      "validate driver-design compatibility",
      "validate process-executor compatibility",
      "validate version-collector compatibility",
      "validate authorization compatibility",
      "require separately reviewed live resolver adapters",
      "collect exact executable candidates in a future action",
      "require exactly one valid Git candidate in a future action",
      "require exactly one valid Supabase candidate in a future action",
      "collect exact repository-root observation in a future action",
      "construct private executable capabilities",
      "construct private repository-CWD capability",
      "require immediate TOCTOU revalidation before spawn",
      "emit sanitized resolver evidence",
      "stop without spawning a process",
    ],
    containsPath: false,
    containsPathVariable: false,
    containsCwd: false,
    containsCommand: false,
    containsFilesystemOperation: false,
    containsEnvironmentValue: false,
    containsCredential: false,
    containsPid: false,
    containsRawMetadata: false,
    containsSql: false,
    containsDeployment: false,
    containsRetry: false,
    liveResolutionPerformed: false,
    adapterCalled: false,
    processStarted: false,
  } as const;
}

export function validateTrustedResolverRegistry(input: unknown): ValidationResult {
  return validateExact(input, buildTrustedResolverRegistry(), "resolver_registry", "resolverFingerprint", "resolverFingerprintAlgorithm");
}

export function validateExecutableResolutionPolicy(input: unknown): ValidationResult {
  return validateExact(input, buildExecutableResolutionPolicy(isRecord(input) && input.executableIdentity === "supabase_cli" ? "supabase_cli" : "git_cli"), "executable_policy", "policyFingerprint", "policyFingerprintAlgorithm");
}

export function validateRepositoryResolutionPolicy(input: unknown): ValidationResult {
  return validateExact(input, buildRepositoryResolutionPolicy(), "repository_policy", "policyFingerprint", "policyFingerprintAlgorithm");
}

export function validateExecutableCandidateObservation(input: unknown): ValidationResult {
  const expected = buildExecutableCandidateObservation(isRecord(input) && input.executableIdentity === "supabase_cli" ? "supabase_cli" : "git_cli");
  const reasons = validateSchemaAndFingerprint(input, expected, "candidate", "observationFingerprint", "observationFingerprintAlgorithm").blockingReasons.slice();
  if (!isRecord(input)) return result(reasons);
  if (input.resolverId !== POST_TRADE_TRUSTED_RESOLVER_ID) reasons.push("candidate_wrong_resolver");
  if (input.executableIdentity !== expected.executableIdentity) reasons.push("candidate_wrong_component");
  if (input.expectedBasename !== expected.expectedBasename) reasons.push("candidate_wrong_expected_basename");
  if (input.observationSourceIdentity !== "fixture_adapter") reasons.push("candidate_wrong_observation_source");
  if (input.expectedBasename !== input.basenameObserved) reasons.push("basename_mismatch");
  for (const [key, safe] of Object.entries({
    fileTypeClassification: "regular_executable",
    executablePermissionClassification: "executable",
    wrapperClassification: "not_wrapper",
    scriptClassification: "not_script",
    ownershipClassification: "trusted_reviewed_user",
    parentPermissionClassification: "non_world_writable_executable",
    stableFileIdentityClassification: "complete",
    sizeClassification: "stable",
    modificationStateClassification: "stable",
    complete: true,
    authoritativeFixture: true,
    observedLive: false,
    fixtureOnly: true,
    callerSelectedCandidate: false,
    fallbackCandidate: false,
    productionSpecificWrapper: false,
    publicPathAbsent: true,
  })) if (input[key] !== safe) reasons.push(`unsafe_candidate:${key}`);
  if (!["none", "reviewed_single", "reviewed_bounded_chain"].includes(String(input.symlinkClassification))) reasons.push("unsafe_symlink");
  if (!["arm64_native", "x86_64_native", "x86_64_under_rosetta", "universal_binary"].includes(String(input.architectureClassification))) reasons.push("unsupported_architecture");
  if (input.rosettaClassification === "unreviewed_rosetta" || input.rosettaClassification === "unknown" || input.rosettaClassification === "ambiguous") reasons.push("unreviewed_rosetta");
  if (["unknown", "untrusted", "ambiguous"].includes(String(input.provenanceClassification))) reasons.push("unsafe_provenance");
  if (input.observedAtIso !== POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT || input.expiresAtIso !== POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT) reasons.push("stale_or_future_observation");
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  return result(reasons);
}

export function validateRepositoryRootObservation(input: unknown): ValidationResult {
  const reasons = validateExact(input, buildRepositoryRootObservation(), "repository_observation", "observationFingerprint", "observationFingerprintAlgorithm").blockingReasons.slice();
  if (!isRecord(input)) return result(reasons);
  for (const [key, safe] of Object.entries({
    rootClassification: "reviewed_repository_root",
    gitWorktreeClassification: "worktree",
    repositoryMarkerClassification: "present",
    projectMarkerClassification: "ture_trade_project",
    nestedRepositoryClassification: "none",
    symlinkClassification: "none",
    productionReferenceClassification: "none",
    stableDirectoryIdentityClassification: "complete",
    complete: true,
    authoritativeFixture: true,
    observedLive: false,
    fixtureOnly: true,
    callerSelectedPath: false,
    publicPathAbsent: true,
  })) if (input[key] !== safe) reasons.push(`unsafe_repository_observation:${key}`);
  if (input.observedAtIso !== POST_TRADE_TRUSTED_RESOLVER_OBSERVED_AT || input.expiresAtIso !== POST_TRADE_TRUSTED_RESOLVER_EXPIRES_AT) reasons.push("stale_or_future_repository_observation");
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  return result(reasons);
}

export function validateExecutableCapabilityMetadata(input: unknown): ValidationResult {
  const expected = buildExecutableCapabilityMetadata(buildExecutableCandidateObservation(isRecord(input) && input.executableIdentity === "supabase_cli" ? "supabase_cli" : "git_cli"), isRecord(input) && typeof input.operationScope === "string" ? input.operationScope as ProcessOperationIdentity : "preflight_git_current_commit");
  const reasons = validateSchemaAndFingerprint(input, expected, "executable_capability", "capabilityFingerprint", "capabilityFingerprintAlgorithm").blockingReasons.slice();
  if (!isRecord(input)) return result(reasons);
  if (input.resolverId !== POST_TRADE_TRUSTED_RESOLVER_ID) reasons.push("executable_capability_wrong_resolver");
  if (input.executableOpaqueId !== expected.executableOpaqueId) reasons.push("executable_capability_wrong_candidate");
  if (input.expectedBasename !== expected.expectedBasename) reasons.push("executable_capability_wrong_basename");
  if (!isReviewedOperationScope(input.operationScope)) reasons.push("executable_capability_unknown_operation");
  for (const [key, safe] of Object.entries({ singleUse: true, used: false, observedLive: false, fixtureOnly: true, revalidationRequired: true, spawnEnabled: false, runnerEnabled: false })) {
    if (input[key] !== safe) reasons.push(`unsafe_executable_capability:${key}`);
  }
  if (!["arm64_native", "x86_64_native", "x86_64_under_rosetta", "universal_binary"].includes(String(input.architectureClassification))) reasons.push("executable_capability_unsupported_architecture");
  if (input.rosettaClassification === "unreviewed_rosetta" || input.rosettaClassification === "unknown" || input.rosettaClassification === "ambiguous") reasons.push("executable_capability_unreviewed_rosetta");
  if (["unknown", "untrusted", "ambiguous"].includes(String(input.provenanceClassification))) reasons.push("executable_capability_unsafe_provenance");
  if (!["trusted_system", "trusted_reviewed_user"].includes(String(input.ownershipClassification))) reasons.push("executable_capability_unsafe_ownership");
  if (input.permissionClassification !== "non_world_writable_executable") reasons.push("executable_capability_unsafe_permission");
  if (!["none", "reviewed_single", "reviewed_bounded_chain"].includes(String(input.symlinkClassification))) reasons.push("executable_capability_unsafe_symlink");
  if (input.boundarySession !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) reasons.push("capability_cross_session");
  if (input.driverIdentity !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID) reasons.push("capability_cross_driver");
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  return result(reasons);
}

export function validateRepositoryCwdCapabilityMetadata(input: unknown): ValidationResult {
  const reasons = validateSchemaAndFingerprint(input, buildRepositoryCwdCapabilityMetadata(), "repository_capability", "capabilityFingerprint", "capabilityFingerprintAlgorithm").blockingReasons.slice();
  if (!isRecord(input)) return result(reasons);
  if (input.resolverId !== POST_TRADE_TRUSTED_RESOLVER_ID) reasons.push("repository_capability_wrong_resolver");
  if (input.repositoryIdentity !== POST_TRADE_TRUSTED_REPOSITORY_IDENTITY) reasons.push("repository_capability_wrong_repository");
  if (input.rootClassification !== "reviewed_repository_root") reasons.push("repository_capability_wrong_root");
  if (!isReviewedOperationScope(input.operationScope)) reasons.push("repository_capability_unknown_operation");
  for (const [key, safe] of Object.entries({ singleUse: true, used: false, observedLive: false, fixtureOnly: true, revalidationRequired: true, spawnEnabled: false, runnerEnabled: false })) {
    if (input[key] !== safe) reasons.push(`unsafe_repository_capability:${key}`);
  }
  if (input.boundarySession !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) reasons.push("repository_capability_cross_session");
  if (input.driverIdentity !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_DESIGN_ID) reasons.push("repository_capability_cross_driver");
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  return result(reasons);
}

export function validateResolverRevalidationObservation(input: unknown): ValidationResult {
  const reasons = validateExact(input, buildResolverRevalidationObservation(), "revalidation", "revalidationFingerprint", "revalidationFingerprintAlgorithm").blockingReasons.slice();
  if (!isRecord(input)) return result(reasons);
  for (const [key, safe] of Object.entries({
    classification: "unchanged",
    samePrivateIdentity: true,
    sameFileTypeOrRepositoryMarkers: true,
    sameSymlinkChain: true,
    sameOwnershipOrProjectIdentity: true,
    samePermissionsOrWorktree: true,
    sameArchitecture: true,
    sameRosettaClassification: true,
    sameProvenance: true,
    sameSizeAndModificationState: true,
    sameBoundarySession: true,
    sameResolver: true,
    sameDriver: true,
    capabilityUnexpired: true,
    complete: true,
    fixtureOnly: true,
    observedLive: false,
    fullTocTouEliminationClaimed: false,
  })) if (input[key] !== safe) reasons.push(`unsafe_revalidation:${key}`);
  return result(reasons);
}

export function validateSanitizedResolverEvidence(input: unknown): ValidationResult {
  const target = isRecord(input) && input.targetIdentity === POST_TRADE_TRUSTED_REPOSITORY_IDENTITY ? POST_TRADE_TRUSTED_REPOSITORY_IDENTITY : "git_cli";
  const reasons = validateExact(input, buildSanitizedResolverEvidence(target), "resolver_evidence", "evidenceFingerprint", "evidenceFingerprintAlgorithm").blockingReasons.slice();
  if (!isRecord(input)) return result(reasons);
  for (const [key, safe] of Object.entries({ fixtureOnly: true, observedLive: false, authoritativeLive: false, canEnableSpawn: false, canEnableRunner: false, provesExecutableExists: false, provesRepositoryExists: false })) {
    if (input[key] !== safe) reasons.push(`unsafe_resolver_evidence:${key}`);
  }
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  return result(reasons);
}

export function validateTrustedResolverCompatibility(input: unknown): ValidationResult {
  const reasons = validateExact(input, buildTrustedResolverCompatibilitySummary(), "resolver_compatibility", "compatibilityFingerprint", "compatibilityFingerprintAlgorithm").blockingReasons.slice();
  reasons.push(...validateLiveMacosProcessDriverDesign(buildLiveMacosProcessDriverDesign()).blockingReasons);
  reasons.push(...validateArchitectureCompatibilityPolicy(buildArchitectureCompatibilityPolicy()).blockingReasons);
  reasons.push(...validateTocTouRevalidationPolicy(buildTocTouRevalidationPolicy()).blockingReasons);
  reasons.push(...validateProcessExecutorExecutionBoundaryCompatibility().blockingReasons);
  reasons.push(...validateProcessExecutorAuthorizationCompatibility().blockingReasons);
  reasons.push(...validateProcessExecutorRunnerCompatibility().blockingReasons);
  reasons.push(...validateProcessExecutorCliVersionCollectorCompatibility().blockingReasons);
  reasons.push(...validateProcessExecutorCredentialDesignCompatibility().blockingReasons);
  if (!validateProcessExecutableRegistry(buildProcessExecutableRegistry()).valid) reasons.push("executor_executable_registry_invalid");
  if (!validateProcessOperationRegistry(buildProcessOperationRegistry()).valid) reasons.push("executor_operation_registry_invalid");
  if (isRecord(input) && input.adapterCalls !== 0) reasons.push("compatibility_called_adapter");
  return result(reasons);
}

export function validateTrustedResolverInertPlan(input: unknown): ValidationResult {
  const reasons = validateExact(input, buildTrustedResolverInertPlan(), "resolver_inert_plan").blockingReasons.slice();
  if (!isRecord(input)) return result(reasons);
  for (const key of ["containsPath", "containsPathVariable", "containsCwd", "containsCommand", "containsFilesystemOperation", "containsEnvironmentValue", "containsCredential", "containsPid", "containsRawMetadata", "containsSql", "containsDeployment", "containsRetry", "liveResolutionPerformed", "adapterCalled", "processStarted"]) {
    if (input[key] !== false) reasons.push(`inert_plan_not_inert:${key}`);
  }
  return result(reasons);
}

export function validateFixtureAdapterShape(input: unknown): ValidationResult {
  const reasons: string[] = [];
  if (!isRecord(input)) return result(["adapter_not_object"]);
  const allowed = ["adapterId", "fixtureOnly", "observedLive", "collectExecutableCandidateFixtureObservations", "collectRepositoryFixtureObservation", "collectFixtureRevalidationObservation", "disposeFixtureTransientMetadata"];
  for (const key of Object.keys(input)) if (!allowed.includes(key)) reasons.push(`unknown_adapter_field:${key}`);
  if (input.adapterId !== "post_trade_trusted_resolver_fixture_adapter_v1") reasons.push("invalid_adapter_id");
  if (input.fixtureOnly !== true || input.observedLive !== false) reasons.push("adapter_not_fixture_only");
  for (const key of allowed.slice(3)) if (typeof input[key] !== "function") reasons.push(`missing_adapter_method:${key}`);
  return result(reasons);
}

export const buildTrustedResolverRegistryFingerprint = fingerprint;
export const buildExecutableResolutionPolicyFingerprint = fingerprint;
export const buildRepositoryResolutionPolicyFingerprint = fingerprint;
export const buildExecutableCandidateFingerprint = fingerprint;
export const buildCandidateSetFingerprint = fingerprint;
export const buildExecutableCapabilityFingerprint = fingerprint;
export const buildRepositoryCapabilityFingerprint = fingerprint;
export const buildResolverRevalidationFingerprint = fingerprint;
export const buildSanitizedResolverEvidenceFingerprint = fingerprint;
export const buildTrustedResolverCompatibilityFingerprint = fingerprint;

function validateExact(input: unknown, expected: unknown, prefix: string, fingerprintKey?: string, algorithmKey?: string): ValidationResult {
  const reasons = validateSchemaAndFingerprint(input, expected, prefix, fingerprintKey, algorithmKey).blockingReasons.slice();
  if (!isRecord(input)) return result(reasons);
  if (stableStringify(input) !== stableStringify(expected)) reasons.push(`${prefix}_not_exact`);
  return result(reasons);
}

function validateSchemaAndFingerprint(input: unknown, expected: unknown, prefix: string, fingerprintKey?: string, algorithmKey?: string): ValidationResult {
  const reasons: string[] = [];
  if (!isRecord(input)) return result([`${prefix}_not_object`]);
  if (containsSensitiveMaterial(input)) reasons.push("sensitive_material_present");
  const inputKeys = Object.keys(input).sort();
  const expectedKeys = isRecord(expected) ? Object.keys(expected).sort() : [];
  for (const key of inputKeys) if (!expectedKeys.includes(key)) reasons.push(`unknown_${prefix}_field:${key}`);
  for (const key of expectedKeys) if (!inputKeys.includes(key)) reasons.push(`missing_${prefix}_field:${key}`);
  if (fingerprintKey && algorithmKey) {
    if (input[algorithmKey] !== "sha256") reasons.push(`${prefix}_fingerprint_algorithm_invalid`);
    if (!isSha256(input[fingerprintKey])) reasons.push(`${prefix}_fingerprint_invalid`);
    const core = omitFingerprint(input, fingerprintKey, algorithmKey);
    if (isSha256(input[fingerprintKey]) && input[fingerprintKey] !== fingerprint(core)) reasons.push(`${prefix}_fingerprint_mismatch`);
  }
  return result(reasons);
}

function result(reasons: readonly string[]): ValidationResult {
  const blockingReasons = [...new Set(reasons)].sort();
  return { valid: blockingReasons.length === 0, blockingReasons };
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

function isReviewedOperationScope(value: unknown): value is ProcessOperationIdentity {
  return typeof value === "string" && buildProcessOperationRegistry().operations.some((operation) => operation.operationId === value);
}

function containsSensitiveMaterial(input: unknown): boolean {
  return collectStringValues(input).some((value) =>
    /(\/users\/|\\users\\|path=|path:|path variable|home directory|username|owner id|group id|device id|inode|raw digest|file contents|access[_ -]?token|refresh[_ -]?token|service[_ -]?role|anon[_ -]?key|api[_ -]?key|password|connection[_ -]?string|postgres:\/\/|authorization header|bearer|cookie|session[_ -]?(token|secret|cookie)|private[_ -]?key|client[_ -]?secret|keychain|raw[_ -]?environment|bankid|jwt|eyj[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+)/iu.test(value),
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
      const normalized = value.map(normalize);
      stack.delete(value);
      return normalized;
    }
    const record = value as Record<string, unknown>;
    const normalized = Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalize(record[key])]));
    stack.delete(value);
    return normalized;
  };
  return JSON.stringify(normalize(input));
}

function fingerprint(input: unknown): string {
  return hash(stableStringify(input));
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
