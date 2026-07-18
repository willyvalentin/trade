import { createHash } from "node:crypto";
import { normalize } from "node:path";

import {
  FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY,
  FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID,
  getFirstLiveTrustedResolverPolicy,
  type FirstLiveTrustedResolverToolIdentity,
} from "@/lib/post-trade-first-live-trusted-resolver-adapter-core";
import {
  DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY,
  type DormantFirstLiveCompositionAdapterResult,
} from "@/lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";
import {
  FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS,
  validateCompositionEvidenceSet,
  type ImmediatePreSpawnRevalidationRequirement,
  type ResolverEvidenceLink,
  type ResolverMetadata,
} from "@/lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core";

export const DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY = deepFreeze({
  adapterKind: "dormant_server_only_immediate_pre_spawn_revalidation_adapter",
  adapterId: "ture.execution.dormant-server-only-immediate-pre-spawn-revalidation-adapter.server.v1",
  contractVersion: 1,
  platform: "macos",
  implementationMode: "server_only_lstat_point_in_time_revalidation_no_spawn",
  purpose: "first_live_read_only_staging_preflight",
  serverOnly: true,
  dormant: true,
  authoritativeLive: false,
  enablesFilesystemAuthority: false,
  enablesProcessStart: false,
  enablesObserverAuthority: false,
  enablesCredentialAccess: false,
  enablesNetworkAccess: false,
  enablesPreflightRunner: false,
} as const);

export const DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY = deepFreeze({
  policyId: "dormant_server_only_immediate_pre_spawn_revalidation_adapter_policy_v1",
  policyVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  acceptsCallerPolicy: false,
  acceptsCallerFilesystem: false,
  acceptsCallerCandidatePaths: false,
  acceptsDependencyInjection: false,
  acceptsArbitraryMetadata: false,
  acceptsAuthorityFlags: false,
  pathSource: "approved_dormant_composition_result",
  filesystemPrimitive: "lstat",
  allowedFilesystemAttempts: 1,
  retryPolicy: "none",
  fallbackPathAllowed: false,
  alternateCandidateAllowed: false,
  acceptedFilesystemObjectType: "regular_file",
  symlinksAllowed: false,
  metadataKeysCompared: ["resolvedAbsolutePath", "toolIdentity", "platform", "policyId", "policyVersion", "boundarySessionId", "purpose", "deviceId", "inode", "sizeBytes", "mode", "modifiedTimeMs"] as const,
  toctouEliminated: false,
  grantsSpawnAuthority: false,
} as const);

export const DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:dormant-server-only-immediate-pre-spawn-revalidation-adapter:identity:v1",
  policy: "ture:dormant-server-only-immediate-pre-spawn-revalidation-adapter:policy:v1",
  observation: "ture:dormant-server-only-immediate-pre-spawn-revalidation-adapter:observation:v1",
  evidence: "ture:dormant-server-only-immediate-pre-spawn-revalidation-adapter:evidence:v1",
  result: "ture:dormant-server-only-immediate-pre-spawn-revalidation-adapter:result:v1",
} as const);

export type ImmediatePreSpawnRevalidationFileType =
  | "regular_file"
  | "directory"
  | "symlink"
  | "missing"
  | "socket"
  | "fifo"
  | "block_device"
  | "character_device"
  | "other"
  | "unknown";

export type ImmediatePreSpawnRevalidationBlockingReason =
  | "input_shape_rejected"
  | "production_live_provenance_missing"
  | "production_live_provenance_rejected"
  | "composition_result_rejected"
  | "composition_result_not_ready"
  | "composition_result_mutated_or_cloned"
  | "composition_result_expired_or_stale"
  | "composition_result_session_mismatch"
  | "composition_result_purpose_mismatch"
  | "composition_result_tool_mismatch"
  | "composition_result_platform_mismatch"
  | "composition_result_boundary_mismatch"
  | "composition_result_policy_mismatch"
  | "composition_result_metadata_rejected"
  | "composition_result_authority_rejected"
  | "revalidation_requirement_rejected"
  | "unsupported_platform"
  | "unsupported_tool"
  | "path_missing"
  | "path_malformed"
  | "path_not_absolute"
  | "path_not_policy_allowlisted"
  | "path_mismatch"
  | "current_observation_missing"
  | "current_observation_failed"
  | "current_observation_mutated"
  | "current_path_mismatch"
  | "current_file_missing"
  | "current_file_not_regular"
  | "current_file_symlink"
  | "current_metadata_rejected"
  | "device_id_mismatch"
  | "inode_mismatch"
  | "size_bytes_mismatch"
  | "mode_mismatch"
  | "modified_time_mismatch"
  | "retry_not_allowed"
  | "second_attempt_rejected"
  | "authority_claim_rejected"
  | "filesystem_error";

export type ImmediatePreSpawnRevalidationObservation = Readonly<{
  observationKind: "immediate_pre_spawn_revalidation_lstat_observation";
  observationVersion: 1;
  observationSource: "server_only_lstat" | "test_synthetic_lstat";
  observedPath: string;
  outcome: "ok" | "missing" | "filesystem_error";
  fileType: ImmediatePreSpawnRevalidationFileType;
  metadata: ResolverMetadata | null;
  observedAt: string;
  observationFingerprintAlgorithm: "sha256";
  observationFingerprint: string;
}>;

export type ImmediatePreSpawnRevalidationEvidence = Readonly<{
  evidenceKind: "immediate_pre_spawn_revalidation_evidence";
  evidenceVersion: 1;
  adapterId: typeof DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId;
  adapterIdentityFingerprint: string;
  policyId: typeof DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyId;
  policyVersion: 1;
  policyFingerprint: string;
  purpose: "first_live_read_only_staging_preflight";
  platform: "macos";
  toolIdentity: FirstLiveTrustedResolverToolIdentity | null;
  boundarySessionId: string | null;
  initialCompositionAdapterId: typeof DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId | null;
  initialCompositionResultFingerprint: string | null;
  initialCompositionEvidenceSetFingerprint: string | null;
  resolverEvidenceFingerprint: string | null;
  revalidationRequirementFingerprint: string | null;
  expectedResolvedAbsolutePath: string | null;
  observedResolvedAbsolutePath: string | null;
  expectedMetadata: ResolverMetadata | null;
  observedMetadata: ResolverMetadata | null;
  observationSource: ImmediatePreSpawnRevalidationObservation["observationSource"] | null;
  observationFingerprint: string | null;
  productionLiveRevalidationProvenance: "none" | "server_only_private_original_object";
  exactMetadataMatched: boolean;
  immediateRevalidationOccurred: boolean;
  pointInTimeOnly: true;
  toctouEliminated: false;
  remainingIntervalBeforeSpawnMustBeMinimized: true;
  serializedEvidenceReusableAsAuthority: false;
  authoritativeLive: false;
  filesystemAuthority: "none";
  spawnAuthority: "none";
  observerAuthority: "none";
  credentialAuthority: "none";
  cliExecutionAuthority: "none";
  runnerAuthority: "none";
  authorizationConsumptionAuthority: "none";
  networkAuthority: "none";
  apiAuthority: "none";
  uiAuthority: "none";
  tradingAuthority: "none";
  avanzaAuthority: "none";
  persistenceAuthority: "none";
  deploymentAuthority: "none";
  processSpawned: false;
  shellUsed: false;
  cliVersionCollected: false;
  credentialAccessed: false;
  networkAccessed: false;
  observerInvoked: false;
  authorizationConsumed: false;
  retryCount: 0;
  filesystemAttemptCount: 0 | 1;
  status: "revalidated_non_authoritative_evidence" | "blocked_fail_closed";
  blockingReasons: readonly ImmediatePreSpawnRevalidationBlockingReason[];
  evaluatedAt: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type ImmediatePreSpawnRevalidationResult = Readonly<{
  resultKind: "dormant_server_only_immediate_pre_spawn_revalidation_result";
  resultVersion: 1;
  adapterId: typeof DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId;
  status: "revalidated_non_authoritative_evidence" | "blocked_fail_closed";
  serverOnly: true;
  dormant: true;
  authoritativeLive: false;
  remoteExecution: false;
  processSpawned: false;
  shellUsed: false;
  credentialAccessed: false;
  networkAccessed: false;
  cliVersionCollected: false;
  observerInvoked: false;
  authorizationConsumed: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  revalidationEvidence: ImmediatePreSpawnRevalidationEvidence;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export type ImmediatePreSpawnRevalidationCoreInput = Readonly<{
  compositionAdapterResult: DormantFirstLiveCompositionAdapterResult;
  currentObservation: ImmediatePreSpawnRevalidationObservation;
  evaluatedAt?: string;
  attempt?: 1;
  retryCount?: 0;
  productionLiveProvenance?: false;
}>;

export type ImmediatePreSpawnRevalidationPreLstatEligibility = Readonly<{
  eligibilityKind: "immediate_pre_spawn_revalidation_pre_lstat_eligibility";
  eligibilityVersion: 1;
  status: "eligible_for_single_server_lstat" | "blocked_fail_closed";
  preLstatOnly: true;
  grantsFilesystemAuthority: false;
  grantsSpawnAuthority: false;
  authoritativeLive: false;
  approvedResolvedAbsolutePath: string | null;
  evaluatedAt: string;
  blockingReasons: readonly ImmediatePreSpawnRevalidationBlockingReason[];
}>;

export function buildImmediatePreSpawnRevalidationObservation(input: Readonly<{
  observationSource: ImmediatePreSpawnRevalidationObservation["observationSource"];
  observedPath: string;
  outcome: ImmediatePreSpawnRevalidationObservation["outcome"];
  fileType: ImmediatePreSpawnRevalidationFileType;
  metadata: ResolverMetadata | null;
  observedAt: string;
}>): ImmediatePreSpawnRevalidationObservation {
  const core = {
    observationKind: "immediate_pre_spawn_revalidation_lstat_observation",
    observationVersion: 1,
    observationSource: input.observationSource,
    observedPath: input.observedPath,
    outcome: input.outcome,
    fileType: input.fileType,
    metadata: input.metadata,
    observedAt: input.observedAt,
  } satisfies Omit<ImmediatePreSpawnRevalidationObservation, "observationFingerprintAlgorithm" | "observationFingerprint">;
  return deepFreeze({
    ...core,
    observationFingerprintAlgorithm: "sha256",
    observationFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.observation, core),
  } satisfies ImmediatePreSpawnRevalidationObservation);
}

export function validateImmediatePreSpawnRevalidationPreLstatEligibility(input: Readonly<{
  compositionAdapterResult: DormantFirstLiveCompositionAdapterResult;
  evaluatedAt: string;
}>): ImmediatePreSpawnRevalidationPreLstatEligibility {
  const reasons: ImmediatePreSpawnRevalidationBlockingReason[] = [];
  if (!isRecord(input) || !hasSafeObjectShape(input)) reasons.push("input_shape_rejected");
  else {
    for (const key of Object.keys(input)) if (!["compositionAdapterResult", "evaluatedAt"].includes(key)) reasons.push("input_shape_rejected");
    if (typeof input.evaluatedAt !== "string") reasons.push("input_shape_rejected");
    reasons.push(...validateCompositionAdapterResult(input.compositionAdapterResult, input.evaluatedAt));
  }
  const blockingReasons = sorted(reasons);
  const composition = isRecord(input?.compositionAdapterResult) ? input.compositionAdapterResult : null;
  return deepFreeze({
    eligibilityKind: "immediate_pre_spawn_revalidation_pre_lstat_eligibility",
    eligibilityVersion: 1,
    status: blockingReasons.length === 0 ? "eligible_for_single_server_lstat" : "blocked_fail_closed",
    preLstatOnly: true,
    grantsFilesystemAuthority: false,
    grantsSpawnAuthority: false,
    authoritativeLive: false,
    approvedResolvedAbsolutePath: blockingReasons.length === 0 && typeof composition?.resolvedAbsolutePath === "string" ? composition.resolvedAbsolutePath : null,
    evaluatedAt: isRecord(input) && typeof input.evaluatedAt === "string" ? input.evaluatedAt : "",
    blockingReasons,
  } satisfies ImmediatePreSpawnRevalidationPreLstatEligibility);
}

export function evaluateImmediatePreSpawnRevalidationCore(input: ImmediatePreSpawnRevalidationCoreInput): ImmediatePreSpawnRevalidationResult {
  const evaluatedAt = isRecord(input) && typeof input.evaluatedAt === "string" ? input.evaluatedAt : "2026-07-17T10:50:10.000Z";
  const reasons: ImmediatePreSpawnRevalidationBlockingReason[] = [];
  if (!isRecord(input) || !hasSafeObjectShape(input)) reasons.push("input_shape_rejected");
  else {
    for (const key of Object.keys(input)) {
      if (!["compositionAdapterResult", "currentObservation", "evaluatedAt", "attempt", "retryCount", "productionLiveProvenance"].includes(key)) reasons.push("input_shape_rejected");
    }
    if (input.productionLiveProvenance !== undefined && input.productionLiveProvenance !== false) reasons.push("production_live_provenance_rejected");
    if (input.attempt !== undefined && input.attempt !== 1) reasons.push("second_attempt_rejected");
    if (input.retryCount !== undefined && input.retryCount !== 0) reasons.push("retry_not_allowed");
    reasons.push(...validateCompositionAdapterResult(input.compositionAdapterResult, evaluatedAt));
    reasons.push(...validateObservation(input.currentObservation));
    if (reasons.length === 0) reasons.push(...compareCurrentObservation(input.compositionAdapterResult, input.currentObservation));
  }
  return finalizeResult({ compositionAdapterResult: input?.compositionAdapterResult, currentObservation: input?.currentObservation, evaluatedAt, blockingReasons: reasons });
}

function validateCompositionAdapterResult(input: unknown, evaluatedAt: string): readonly ImmediatePreSpawnRevalidationBlockingReason[] {
  const reasons: ImmediatePreSpawnRevalidationBlockingReason[] = [];
  if (!isRecord(input) || !hasSafeObjectShape(input) || !Object.isFrozen(input)) return ["composition_result_rejected"];
  if (input.resultKind !== "dormant_server_only_first_live_staging_preflight_composition_adapter_result" || input.resultVersion !== 1) reasons.push("composition_result_rejected");
  if (input.adapterId !== DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId) reasons.push("composition_result_boundary_mismatch");
  if (input.status !== "neutralized_composition_input_ready" || input.compositionResult === null || input.neutralCompositionEvidenceSet === null) reasons.push("composition_result_not_ready");
  if (input.serverOnly !== true || input.dormant !== true) reasons.push("composition_result_boundary_mismatch");
  if (hasAuthorityClaim(input)) reasons.push("composition_result_authority_rejected");
  if (input.immediatePreSpawnRevalidationRequired !== true || input.toctouEliminated !== false) reasons.push("composition_result_expired_or_stale");
  if (input.resultFingerprintAlgorithm !== "sha256" || typeof input.resultFingerprint !== "string" || input.resultFingerprint !== compositionAdapterResultFingerprint(input)) reasons.push("composition_result_mutated_or_cloned");
  if (!isValidResolverMetadata(input.neutralResolverMetadata)) reasons.push("composition_result_metadata_rejected");
  if (input.resolvedAbsolutePath === null || typeof input.resolvedAbsolutePath !== "string") reasons.push("path_missing");
  else validateApprovedPath(input.toolIdentity, input.resolvedAbsolutePath, reasons);
  if (input.toolIdentity !== "git" && input.toolIdentity !== "supabase_cli") reasons.push("unsupported_tool");

  if (isRecord(input.neutralCompositionEvidenceSet)) {
    const compositionReasons = validateCompositionEvidenceSet(input.neutralCompositionEvidenceSet, evaluatedAt);
    if (compositionReasons.length > 0) reasons.push(compositionReasons.includes("expired_evidence") ? "composition_result_expired_or_stale" : "composition_result_rejected");
    const evidence = Array.isArray(input.neutralCompositionEvidenceSet.evidence) ? input.neutralCompositionEvidenceSet.evidence : [];
    const resolver = evidence[0];
    const revalidation = evidence[1];
    reasons.push(...validateResolverAndRequirement(input, resolver, revalidation));
  } else reasons.push("composition_result_rejected");

  if (isRecord(input.compositionResult)) {
    if (input.compositionResult.state !== "composition_complete" || input.compositionResult.compositionComplete !== true) reasons.push("composition_result_not_ready");
    if (hasAuthorityClaim(input.compositionResult)) reasons.push("composition_result_authority_rejected");
    if (input.compositionResult.resultFingerprintAlgorithm !== "sha256" || typeof input.compositionResult.resultFingerprint !== "string" || input.compositionResult.resultFingerprint !== compositionResultFingerprint(input.compositionResult)) reasons.push("composition_result_mutated_or_cloned");
  } else reasons.push("composition_result_not_ready");
  return sorted(reasons);
}

function validateResolverAndRequirement(input: Record<string, unknown>, resolver: unknown, revalidation: unknown): readonly ImmediatePreSpawnRevalidationBlockingReason[] {
  const reasons: ImmediatePreSpawnRevalidationBlockingReason[] = [];
  if (!isRecord(resolver) || !isRecord(revalidation)) return ["revalidation_requirement_rejected"];
  if (resolver.evidenceKind !== "trusted_resolver_evidence_link") reasons.push("composition_result_rejected");
  if (revalidation.evidenceKind !== "immediate_pre_spawn_revalidation_requirement") reasons.push("revalidation_requirement_rejected");
  if (resolver.resolverAdapterId !== FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId || resolver.resolverPolicyId !== FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID) reasons.push("composition_result_policy_mismatch");
  if (resolver.purpose !== "first_live_read_only_staging_preflight" || revalidation.purpose !== "first_live_read_only_staging_preflight") reasons.push("composition_result_purpose_mismatch");
  if (resolver.platform !== "macos" || revalidation.platform !== "macos") reasons.push("composition_result_platform_mismatch");
  if (resolver.boundarySessionId !== revalidation.boundarySessionId) reasons.push("composition_result_session_mismatch");
  if (resolver.toolIdentity !== input.toolIdentity || revalidation.toolIdentity !== input.toolIdentity) reasons.push("composition_result_tool_mismatch");
  if (resolver.resolvedAbsolutePath !== input.resolvedAbsolutePath || revalidation.expectedResolvedAbsolutePath !== input.resolvedAbsolutePath) reasons.push("path_mismatch");
  if (JSON.stringify(resolver.metadata) !== JSON.stringify(input.neutralResolverMetadata) || JSON.stringify(revalidation.expectedMetadata) !== JSON.stringify(input.neutralResolverMetadata)) reasons.push("composition_result_metadata_rejected");
  if (revalidation.revalidationOperationImplemented !== false || revalidation.revalidationRequiredBeforeSpawn !== true) reasons.push("revalidation_requirement_rejected");
  if (resolver.toctouEliminated !== false || revalidation.toctouEliminated !== false) reasons.push("composition_result_expired_or_stale");
  if (hasAuthorityClaim(resolver) || hasAuthorityClaim(revalidation)) reasons.push("composition_result_authority_rejected");
  return sorted(reasons);
}

function validateObservation(input: unknown): readonly ImmediatePreSpawnRevalidationBlockingReason[] {
  const reasons: ImmediatePreSpawnRevalidationBlockingReason[] = [];
  if (!isRecord(input) || !hasSafeObjectShape(input)) return ["current_observation_missing"];
  if (input.observationKind !== "immediate_pre_spawn_revalidation_lstat_observation" || input.observationVersion !== 1) reasons.push("current_observation_missing");
  if (input.observationSource !== "server_only_lstat" && input.observationSource !== "test_synthetic_lstat") reasons.push("current_observation_missing");
  if (input.observationSource === "server_only_lstat" && input.outcome !== "ok") reasons.push("current_observation_failed");
  if (input.outcome === "missing") reasons.push("current_file_missing");
  if (input.outcome === "filesystem_error") reasons.push("filesystem_error");
  if (input.fileType === "symlink") reasons.push("current_file_symlink");
  if (input.fileType !== "regular_file" && input.fileType !== "missing") reasons.push("current_file_not_regular");
  if (!isValidResolverMetadata(input.metadata)) reasons.push("current_metadata_rejected");
  if (typeof input.observedPath !== "string" || input.observedPath.length === 0) reasons.push("path_missing");
  else if (!input.observedPath.startsWith("/")) reasons.push("path_not_absolute");
  if (input.observationFingerprintAlgorithm !== "sha256" || typeof input.observationFingerprint !== "string" || input.observationFingerprint !== observationFingerprint(input)) reasons.push("current_observation_mutated");
  return sorted(reasons);
}

function compareCurrentObservation(composition: DormantFirstLiveCompositionAdapterResult, observation: ImmediatePreSpawnRevalidationObservation): readonly ImmediatePreSpawnRevalidationBlockingReason[] {
  const reasons: ImmediatePreSpawnRevalidationBlockingReason[] = [];
  const expected = composition.neutralResolverMetadata;
  const observed = observation.metadata;
  if (composition.resolvedAbsolutePath !== observation.observedPath) reasons.push("current_path_mismatch");
  if (expected && observed) {
    if (expected.deviceId !== observed.deviceId) reasons.push("device_id_mismatch");
    if (expected.inode !== observed.inode) reasons.push("inode_mismatch");
    if (expected.sizeBytes !== observed.sizeBytes) reasons.push("size_bytes_mismatch");
    if (expected.mode !== observed.mode) reasons.push("mode_mismatch");
    if (expected.modifiedTimeMs !== observed.modifiedTimeMs) reasons.push("modified_time_mismatch");
  }
  return sorted(reasons);
}

function validateApprovedPath(toolIdentity: unknown, path: string, reasons: ImmediatePreSpawnRevalidationBlockingReason[]) {
  if (!path.startsWith("/")) reasons.push("path_not_absolute");
  if (path !== normalize(path)) reasons.push("path_malformed");
  if (path.includes("\0") || path.includes("..") || /[\s;&|`$<>]/u.test(path)) reasons.push("path_malformed");
  const candidate = getFirstLiveTrustedResolverPolicy().candidatePolicies.find((item) => item.toolIdentity === toolIdentity && item.absolutePath === path);
  if (!candidate) reasons.push("path_not_policy_allowlisted");
}

function finalizeResult(input: Readonly<{
  compositionAdapterResult: unknown;
  currentObservation: unknown;
  evaluatedAt: string;
  blockingReasons: readonly ImmediatePreSpawnRevalidationBlockingReason[];
}>): ImmediatePreSpawnRevalidationResult {
  const composition = isRecord(input.compositionAdapterResult) ? input.compositionAdapterResult : null;
  const observation = isRecord(input.currentObservation) ? input.currentObservation : null;
  const evidenceItems = isRecord(composition?.neutralCompositionEvidenceSet) && Array.isArray(composition.neutralCompositionEvidenceSet.evidence)
    ? composition.neutralCompositionEvidenceSet.evidence
    : [];
  const resolver = evidenceItems[0] as ResolverEvidenceLink | undefined;
  const revalidation = evidenceItems[1] as ImmediatePreSpawnRevalidationRequirement | undefined;
  const reasons = sorted(input.blockingReasons);
  const status: ImmediatePreSpawnRevalidationEvidence["status"] = reasons.length === 0 ? "revalidated_non_authoritative_evidence" : "blocked_fail_closed";
  const evidenceCore = {
    evidenceKind: "immediate_pre_spawn_revalidation_evidence",
    evidenceVersion: 1,
    adapterId: DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId,
    adapterIdentityFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.identity, DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY),
    policyId: DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyId,
    policyVersion: DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyVersion,
    policyFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.policy, DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY),
    purpose: "first_live_read_only_staging_preflight",
    platform: "macos",
    toolIdentity: composition?.toolIdentity === "git" || composition?.toolIdentity === "supabase_cli" ? composition.toolIdentity : null,
    boundarySessionId: typeof resolver?.boundarySessionId === "string" ? resolver.boundarySessionId : null,
    initialCompositionAdapterId: composition?.adapterId === DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId ? composition.adapterId : null,
    initialCompositionResultFingerprint: typeof composition?.resultFingerprint === "string" ? composition.resultFingerprint : null,
    initialCompositionEvidenceSetFingerprint: isRecord(composition?.neutralCompositionEvidenceSet) && typeof composition.neutralCompositionEvidenceSet.evidenceSetFingerprint === "string" ? composition.neutralCompositionEvidenceSet.evidenceSetFingerprint : null,
    resolverEvidenceFingerprint: typeof resolver?.evidenceFingerprint === "string" ? resolver.evidenceFingerprint : null,
    revalidationRequirementFingerprint: typeof revalidation?.evidenceFingerprint === "string" ? revalidation.evidenceFingerprint : null,
    expectedResolvedAbsolutePath: typeof composition?.resolvedAbsolutePath === "string" ? composition.resolvedAbsolutePath : null,
    observedResolvedAbsolutePath: typeof observation?.observedPath === "string" ? observation.observedPath : null,
    expectedMetadata: isValidResolverMetadata(composition?.neutralResolverMetadata) ? composition.neutralResolverMetadata : null,
    observedMetadata: isValidResolverMetadata(observation?.metadata) ? observation.metadata : null,
    observationSource: observation?.observationSource === "server_only_lstat" || observation?.observationSource === "test_synthetic_lstat" ? observation.observationSource : null,
    observationFingerprint: typeof observation?.observationFingerprint === "string" ? observation.observationFingerprint : null,
    productionLiveRevalidationProvenance: "none",
    exactMetadataMatched: status === "revalidated_non_authoritative_evidence",
    immediateRevalidationOccurred: status === "revalidated_non_authoritative_evidence",
    pointInTimeOnly: true,
    toctouEliminated: false,
    remainingIntervalBeforeSpawnMustBeMinimized: true,
    serializedEvidenceReusableAsAuthority: false,
    authoritativeLive: false,
    filesystemAuthority: "none",
    spawnAuthority: "none",
    observerAuthority: "none",
    credentialAuthority: "none",
    cliExecutionAuthority: "none",
    runnerAuthority: "none",
    authorizationConsumptionAuthority: "none",
    networkAuthority: "none",
    apiAuthority: "none",
    uiAuthority: "none",
    tradingAuthority: "none",
    avanzaAuthority: "none",
    persistenceAuthority: "none",
    deploymentAuthority: "none",
    processSpawned: false,
    shellUsed: false,
    cliVersionCollected: false,
    credentialAccessed: false,
    networkAccessed: false,
    observerInvoked: false,
    authorizationConsumed: false,
    retryCount: 0,
    filesystemAttemptCount: status === "revalidated_non_authoritative_evidence" || observation ? 1 : 0,
    status,
    blockingReasons: reasons,
    evaluatedAt: input.evaluatedAt,
  } satisfies Omit<ImmediatePreSpawnRevalidationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return finalizeResultFromEvidenceCore(evidenceCore);
}

function finalizeResultFromEvidenceCore(evidenceCore: Omit<ImmediatePreSpawnRevalidationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">): ImmediatePreSpawnRevalidationResult {
  const evidence = deepFreeze({
    ...evidenceCore,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.evidence, evidenceCore),
  } satisfies ImmediatePreSpawnRevalidationEvidence);
  const resultCore = {
    resultKind: "dormant_server_only_immediate_pre_spawn_revalidation_result",
    resultVersion: 1,
    adapterId: DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId,
    status: evidence.status,
    serverOnly: true,
    dormant: true,
    authoritativeLive: false,
    remoteExecution: false,
    processSpawned: false,
    shellUsed: false,
    credentialAccessed: false,
    networkAccessed: false,
    cliVersionCollected: false,
    observerInvoked: false,
    authorizationConsumed: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    revalidationEvidence: evidence,
  } satisfies Omit<ImmediatePreSpawnRevalidationResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.result, resultCore),
  } satisfies ImmediatePreSpawnRevalidationResult);
}

function compositionAdapterResultFingerprint(input: Record<string, unknown>): string {
  const core = { ...input };
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  return fingerprint("ture:dormant-server-only-first-live-staging-preflight-composition-adapter:result:v1", core);
}

function compositionResultFingerprint(input: Record<string, unknown>): string {
  const core = { ...input };
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  return fingerprint(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS.result, core);
}

function observationFingerprint(input: Record<string, unknown>): string {
  const core = { ...input };
  delete core.observationFingerprintAlgorithm;
  delete core.observationFingerprint;
  return fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.observation, core);
}

function isValidResolverMetadata(input: unknown): input is ResolverMetadata {
  if (!isRecord(input) || !hasSafeObjectShape(input)) return false;
  const keys = Object.keys(input).sort();
  if (JSON.stringify(keys) !== JSON.stringify(["deviceId", "inode", "mode", "modifiedTimeMs", "sizeBytes"])) return false;
  if (!isCanonicalNonNegativeIntegerString(input.deviceId)) return false;
  if (!isCanonicalNonNegativeIntegerString(input.inode)) return false;
  return isFiniteNumber(input.sizeBytes) && input.sizeBytes >= 0
    && isFiniteNumber(input.mode) && input.mode >= 0
    && isFiniteNumber(input.modifiedTimeMs) && input.modifiedTimeMs >= 0;
}

function isCanonicalNonNegativeIntegerString(input: unknown): input is string {
  return typeof input === "string" && (input === "0" || /^[1-9][0-9]*$/u.test(input));
}

function hasAuthorityClaim(input: Record<string, unknown>): boolean {
  return [
    "authoritativeLive",
    "enablesFilesystemAuthority",
    "enablesProcessStart",
    "enablesObserverAuthority",
    "enablesCredentialAccess",
    "enablesNetworkAccess",
    "enablesPreflightRunner",
    "processSpawned",
    "shellUsed",
    "credentialAccessed",
    "networkAccessed",
    "cliVersionCollected",
    "observerInvoked",
    "authorizationConsumed",
    "remoteExecution",
    "filesystemAuthority",
    "spawnAuthority",
    "observerAuthority",
    "credentialAuthority",
    "networkAuthority",
    "runnerAuthority",
    "cliExecutionAuthority",
    "authorizationConsumptionAuthority",
    "apiAuthority",
    "uiAuthority",
    "tradingAuthority",
    "avanzaAuthority",
    "deploymentAuthority",
  ].some((key) => Object.prototype.hasOwnProperty.call(input, key) && (input[key] === true || (typeof input[key] === "string" && input[key] !== "none")));
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function hasSafeObjectShape(input: Record<string, unknown>): boolean {
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(input).length > 0) return false;
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") return false;
    if (descriptor.get || descriptor.set) return false;
  }
  for (const key in input) if (!Object.prototype.hasOwnProperty.call(input, key)) return false;
  return true;
}

function isFiniteNumber(input: unknown): input is number {
  return typeof input === "number" && Number.isFinite(input);
}

function sorted<T extends string>(input: readonly T[]): readonly T[] {
  return [...new Set(input)].sort();
}

function fingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(canonicalize(input))}`).digest("hex");
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(canonicalize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, canonicalize(value)]));
  }
  return input;
}

function deepFreeze<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreeze(value);
  }
  return input;
}
