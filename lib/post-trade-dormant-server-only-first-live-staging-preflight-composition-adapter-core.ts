import { createHash } from "node:crypto";

import {
  FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY,
  FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS,
  FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID,
  type FirstLiveTrustedExecutableResolutionResult,
  type FirstLiveTrustedResolverToolIdentity,
} from "@/lib/post-trade-first-live-trusted-resolver-adapter-core";
import {
  validateTrustedExecutableResolutionRequest,
  type TrustedExecutableResolutionRequest,
} from "@/lib/post-trade-trusted-live-resolver-adapter-core";
import {
  buildAuthorizationLifecycleEvidence,
  buildCliVersionEvidenceExpectation,
  buildDirectSpawnPlanEvidence,
  buildImmediatePreSpawnRevalidationRequirementEvidence,
  buildNoCredentialEvidence,
  buildResolverEvidenceLink,
  buildScopedObserverPlanEvidence,
  FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER,
  FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS,
  composeFirstLiveReadOnlyStagingPreflight,
  validateCompositionEvidenceSet,
  type CompositionEvidenceSet,
  type CompositionResult,
  type ResolverMetadata,
} from "@/lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core";

export const DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY = deepFreeze({
  adapterKind: "dormant_server_only_first_live_staging_preflight_composition_adapter",
  adapterId: "ture.execution.dormant-server-only-first-live-staging-preflight-composition-adapter.server.v1",
  contractVersion: 1,
  platform: "macos",
  implementationMode: "server_only_dormant_original_provenance_neutralization",
  purpose: "first_live_read_only_staging_preflight",
  serverOnly: true,
  dormant: true,
  fixtureOnly: false,
  authoritativeLive: false,
  invokesApprovedResolverOnly: true,
  enablesFilesystemAuthority: false,
  enablesProcessStart: false,
  enablesObserverAuthority: false,
  enablesCredentialAccess: false,
  enablesNetworkAccess: false,
  enablesPreflightRunner: false,
} as const);

export const DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_POLICY = deepFreeze({
  policyId: "dormant_server_only_first_live_staging_preflight_composition_adapter_policy_v1",
  policyVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  acceptsCallerPolicy: false,
  acceptsCallerFilesystem: false,
  acceptsCallerCandidatePaths: false,
  acceptsDependencyInjection: false,
  acceptsArbitraryMetadata: false,
  acceptsAuthorityFlags: false,
  requiresOriginalResolverObject: true,
  requiresLiveResolverPrivateProvenance: true,
  neutralizedMetadataKeys: ["deviceId", "inode", "sizeBytes", "mode", "modifiedTimeMs"] as const,
  emitsPrivateProvenance: false,
  compositionInputObservedLiveFilesystem: false,
  invokesSpawn: false,
  invokesObserver: false,
  invokesCredentialBoundary: false,
  executesCli: false,
  collectsCliVersion: false,
  oneShotOnly: true,
  retryPolicy: "none",
  immediatePreSpawnRevalidationRequired: true,
  toctouEliminated: false,
} as const);

export type DormantFirstLiveCompositionBlockingReason =
  | "input_shape_rejected"
  | "request_invalid"
  | "resolver_result_missing_private_provenance"
  | "resolver_result_not_resolved"
  | "resolver_result_mutated"
  | "resolver_result_expired_or_stale"
  | "resolver_result_session_mismatch"
  | "resolver_result_purpose_mismatch"
  | "resolver_result_tool_mismatch"
  | "resolver_result_platform_mismatch"
  | "resolver_result_boundary_mismatch"
  | "resolver_result_policy_mismatch"
  | "resolver_result_metadata_rejected"
  | "resolver_result_authority_rejected"
  | "neutralized_composition_rejected";

export type DormantFirstLiveCompositionAdapterInput = Readonly<{
  request: TrustedExecutableResolutionRequest;
  evaluatedAt?: string;
}>;

export type VerifiedOriginalResolverResultInput = Readonly<{
  request: TrustedExecutableResolutionRequest;
  resolverResult: FirstLiveTrustedExecutableResolutionResult;
  evaluatedAt?: string;
}>;

export type DormantFirstLiveCompositionCoreDependencies = Readonly<{
  resolveFirstLiveTrustedExecutable(input: DormantFirstLiveCompositionAdapterInput): Promise<FirstLiveTrustedExecutableResolutionResult>;
  hasLiveResolverPrivateProvenance(input: unknown): boolean;
}>;

export type DormantFirstLiveCompositionAdapterResult = Readonly<{
  resultKind: "dormant_server_only_first_live_staging_preflight_composition_adapter_result";
  resultVersion: 1;
  adapterId: typeof DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId;
  status: "neutralized_composition_input_ready" | "blocked_fail_closed";
  serverOnly: true;
  dormant: true;
  authoritativeLive: false;
  remoteExecution: false;
  liveResolverInvoked: boolean;
  resolverPrivateProvenanceVerified: boolean;
  originalResolverObjectConsumedInProcess: boolean;
  neutralizedObservedLiveFilesystem: false;
  filesystemAuthority: "none";
  spawnAuthority: "none";
  observerAuthority: "none";
  credentialAuthority: "none";
  networkAuthority: "none";
  runnerAuthority: "none";
  cliExecutionAuthority: "none";
  authorizationConsumptionAuthority: "none";
  apiAuthority: "none";
  uiAuthority: "none";
  tradingAuthority: "none";
  avanzaAuthority: "none";
  deploymentAuthority: "none";
  processSpawned: false;
  shellUsed: false;
  credentialAccessed: false;
  networkAccessed: false;
  cliVersionCollected: false;
  authorizationConsumed: false;
  immediatePreSpawnRevalidationRequired: true;
  toctouEliminated: false;
  toolIdentity: FirstLiveTrustedResolverToolIdentity | null;
  resolvedAbsolutePath: string | null;
  neutralResolverMetadata: ResolverMetadata | null;
  neutralCompositionEvidenceSet: CompositionEvidenceSet | null;
  compositionResult: CompositionResult | null;
  blockingReasons: readonly DormantFirstLiveCompositionBlockingReason[];
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export async function composeDormantServerOnlyFirstLiveStagingPreflightCore(
  input: DormantFirstLiveCompositionAdapterInput,
  dependencies: DormantFirstLiveCompositionCoreDependencies,
): Promise<DormantFirstLiveCompositionAdapterResult> {
  const shapeReasons = validateTopLevelInputShape(input, ["request", "evaluatedAt"]);
  if (shapeReasons.length > 0) return finalizeResult({ liveResolverInvoked: false, blockingReasons: shapeReasons });
  const requestValidation = validateTrustedExecutableResolutionRequest(input.request, input.evaluatedAt);
  if (!requestValidation.ok) return finalizeResult({ liveResolverInvoked: false, blockingReasons: ["request_invalid"] });
  const resolverResult = await dependencies.resolveFirstLiveTrustedExecutable(input);
  return neutralizeOriginalFirstLiveResolverResultCore(
    { request: input.request, resolverResult, evaluatedAt: input.evaluatedAt },
    dependencies.hasLiveResolverPrivateProvenance,
    true,
  );
}

export function neutralizeOriginalFirstLiveResolverResultCore(
  input: VerifiedOriginalResolverResultInput,
  hasLiveResolverPrivateProvenance: (input: unknown) => boolean,
  liveResolverInvoked = false,
): DormantFirstLiveCompositionAdapterResult {
  const shapeReasons = validateTopLevelInputShape(input, ["request", "resolverResult", "evaluatedAt"]);
  if (shapeReasons.length > 0) return finalizeResult({ liveResolverInvoked, blockingReasons: shapeReasons });
  const reasons = validateOriginalResolverResult(input, hasLiveResolverPrivateProvenance);
  if (reasons.length > 0) return finalizeResult({ liveResolverInvoked, blockingReasons: reasons });

  const toolIdentity = input.resolverResult.evidence.expectedToolIdentity;
  const metadata = neutralMetadata(input.resolverResult.evidence.metadata);
  const resolverEvidence = buildResolverEvidenceLink({
    toolIdentity,
    resolvedAbsolutePath: input.resolverResult.evidence.resolvedAbsolutePath as never,
    metadata,
    observedLiveFilesystem: false,
  });
  const neutralEvidenceSet = buildNeutralEvidenceSet(toolIdentity, resolverEvidence);
  if (validateCompositionEvidenceSet(neutralEvidenceSet).length > 0) {
    return finalizeResult({
      liveResolverInvoked,
      blockingReasons: ["neutralized_composition_rejected"],
      toolIdentity,
      resolvedAbsolutePath: input.resolverResult.evidence.resolvedAbsolutePath,
      neutralResolverMetadata: metadata,
    });
  }
  return finalizeResult({
    liveResolverInvoked,
    resolverPrivateProvenanceVerified: true,
    originalResolverObjectConsumedInProcess: true,
    toolIdentity,
    resolvedAbsolutePath: input.resolverResult.evidence.resolvedAbsolutePath,
    neutralResolverMetadata: metadata,
    neutralCompositionEvidenceSet: neutralEvidenceSet,
    compositionResult: composeFirstLiveReadOnlyStagingPreflight({ evidenceSet: neutralEvidenceSet }),
    blockingReasons: [],
  });
}

function buildNeutralEvidenceSet(toolIdentity: FirstLiveTrustedResolverToolIdentity, resolverEvidence: ReturnType<typeof buildResolverEvidenceLink>): CompositionEvidenceSet {
  const evidence = [
    resolverEvidence,
    buildImmediatePreSpawnRevalidationRequirementEvidence(resolverEvidence),
    buildDirectSpawnPlanEvidence({ toolIdentity }),
    buildScopedObserverPlanEvidence({ toolIdentity }),
    buildNoCredentialEvidence({ toolIdentity }),
    buildCliVersionEvidenceExpectation({ toolIdentity }),
    buildAuthorizationLifecycleEvidence({ toolIdentity }),
  ] as const;
  const core = {
    evidenceSetKind: "first_live_read_only_staging_preflight_composition_evidence_set",
    evidenceSetVersion: 1,
    boundarySessionId: evidence[0].boundarySessionId,
    canonicalOrder: FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER,
    evidence,
  } satisfies Omit<CompositionEvidenceSet, "evidenceSetFingerprintAlgorithm" | "evidenceSetFingerprint">;
  return deepFreeze({
    ...core,
    evidenceSetFingerprintAlgorithm: "sha256",
    evidenceSetFingerprint: fingerprint(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS.evidenceSet, core),
  } satisfies CompositionEvidenceSet);
}

function validateOriginalResolverResult(
  input: VerifiedOriginalResolverResultInput,
  hasLiveResolverPrivateProvenance: (input: unknown) => boolean,
): readonly DormantFirstLiveCompositionBlockingReason[] {
  const reasons: DormantFirstLiveCompositionBlockingReason[] = [];
  const requestValidation = validateTrustedExecutableResolutionRequest(input.request, input.evaluatedAt);
  if (!requestValidation.ok) reasons.push("request_invalid");
  if (!hasLiveResolverPrivateProvenance(input.resolverResult)) reasons.push("resolver_result_missing_private_provenance");
  if (!isRecord(input.resolverResult) || !isRecord(input.resolverResult.evidence)) reasons.push("resolver_result_mutated");
  else {
    const result = input.resolverResult;
    const evidence = result.evidence;
    if (result.status !== "resolved_live_filesystem_evidence" || evidence.status !== "resolved_live_filesystem_evidence") reasons.push("resolver_result_not_resolved");
    if (result.adapterId !== FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId || evidence.adapterId !== FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId) reasons.push("resolver_result_boundary_mismatch");
    if (evidence.policyId !== FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID) reasons.push("resolver_result_policy_mismatch");
    if (result.platform !== "macos") reasons.push("resolver_result_platform_mismatch");
    if (evidence.boundarySessionId !== input.request.boundarySessionId || evidence.resolverSessionCapabilityFingerprint !== input.request.resolverSessionCapability.capabilityFingerprint) reasons.push("resolver_result_session_mismatch");
    if (input.request.operation !== "resolve_trusted_executable" || evidence.requestId !== input.request.requestId || evidence.requestFingerprint !== input.request.requestFingerprint) reasons.push("resolver_result_purpose_mismatch");
    if (evidence.expectedToolIdentity !== input.request.expectedToolIdentity) reasons.push("resolver_result_tool_mismatch");
    if (result.remoteExecution !== false || result.processSpawned !== false || result.shellUsed !== false || result.credentialAccessed !== false || result.authorizationConsumed !== false || result.enablesProcessStart !== false || result.enablesPreflightRunner !== false) reasons.push("resolver_result_authority_rejected");
    if (evidence.authoritativeLive !== false || evidence.issuesLiveExecutableCapability !== false || evidence.enablesProcessStart !== false || evidence.enablesPreflightRunner !== false) reasons.push("resolver_result_authority_rejected");
    if (evidence.toctouEliminated !== false || evidence.requiresFutureSpawnRevalidation !== true) reasons.push("resolver_result_expired_or_stale");
    if (!isNeutralizableMetadata(evidence.metadata)) reasons.push("resolver_result_metadata_rejected");
    if (!isSha256(result.resultFingerprint) || result.resultFingerprint !== resultFingerprint(result)) reasons.push("resolver_result_mutated");
    if (!isSha256(evidence.evidenceFingerprint) || evidence.evidenceFingerprint !== evidenceFingerprint(evidence)) reasons.push("resolver_result_mutated");
    if (typeof evidence.evaluatedAt !== "string" || (typeof input.request.expiresAt === "string" && evidence.evaluatedAt > input.request.expiresAt)) reasons.push("resolver_result_expired_or_stale");
  }
  return sorted(reasons);
}

function validateTopLevelInputShape(input: unknown, allowedKeys: readonly string[]): readonly DormantFirstLiveCompositionBlockingReason[] {
  if (!isRecord(input) || !hasSafeObjectShape(input)) return ["input_shape_rejected"];
  for (const key of Object.keys(input)) if (!allowedKeys.includes(key)) return ["input_shape_rejected"];
  return [];
}

function neutralMetadata(input: FirstLiveTrustedExecutableResolutionResult["evidence"]["metadata"]): ResolverMetadata {
  if (!isNeutralizableMetadata(input)) throw new Error("resolver_result_metadata_rejected");
  return deepFreeze({
    deviceId: input.deviceId,
    inode: input.inode,
    sizeBytes: input.sizeBytes,
    mode: input.mode,
    modifiedTimeMs: input.modifiedTimeMs,
  } satisfies ResolverMetadata);
}

function isNeutralizableMetadata(input: unknown): input is NonNullable<FirstLiveTrustedExecutableResolutionResult["evidence"]["metadata"]> {
  if (!isRecord(input) || !hasSafeObjectShape(input)) return false;
  const keys = Object.keys(input).sort();
  if (JSON.stringify(keys) !== JSON.stringify(["changedTimeMs", "deviceId", "inode", "mode", "modifiedTimeMs", "sizeBytes"])) return false;
  if (typeof input.deviceId !== "string" || input.deviceId.length === 0) return false;
  if (typeof input.inode !== "string" || input.inode.length === 0) return false;
  return isFiniteNumber(input.sizeBytes) && input.sizeBytes >= 0
    && isFiniteNumber(input.mode) && input.mode >= 0
    && isFiniteNumber(input.modifiedTimeMs) && input.modifiedTimeMs >= 0
    && isFiniteNumber(input.changedTimeMs) && input.changedTimeMs >= 0;
}

function finalizeResult(input: Partial<DormantFirstLiveCompositionAdapterResult> & Readonly<{ blockingReasons: readonly DormantFirstLiveCompositionBlockingReason[] }>): DormantFirstLiveCompositionAdapterResult {
  const status = input.blockingReasons.length === 0 ? "neutralized_composition_input_ready" : "blocked_fail_closed";
  const core = {
    resultKind: "dormant_server_only_first_live_staging_preflight_composition_adapter_result",
    resultVersion: 1,
    adapterId: DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId,
    status,
    serverOnly: true,
    dormant: true,
    authoritativeLive: false,
    remoteExecution: false,
    liveResolverInvoked: input.liveResolverInvoked ?? false,
    resolverPrivateProvenanceVerified: input.resolverPrivateProvenanceVerified ?? false,
    originalResolverObjectConsumedInProcess: input.originalResolverObjectConsumedInProcess ?? false,
    neutralizedObservedLiveFilesystem: false,
    filesystemAuthority: "none",
    spawnAuthority: "none",
    observerAuthority: "none",
    credentialAuthority: "none",
    networkAuthority: "none",
    runnerAuthority: "none",
    cliExecutionAuthority: "none",
    authorizationConsumptionAuthority: "none",
    apiAuthority: "none",
    uiAuthority: "none",
    tradingAuthority: "none",
    avanzaAuthority: "none",
    deploymentAuthority: "none",
    processSpawned: false,
    shellUsed: false,
    credentialAccessed: false,
    networkAccessed: false,
    cliVersionCollected: false,
    authorizationConsumed: false,
    immediatePreSpawnRevalidationRequired: true,
    toctouEliminated: false,
    toolIdentity: input.toolIdentity ?? null,
    resolvedAbsolutePath: input.resolvedAbsolutePath ?? null,
    neutralResolverMetadata: input.neutralResolverMetadata ?? null,
    neutralCompositionEvidenceSet: input.neutralCompositionEvidenceSet ?? null,
    compositionResult: input.compositionResult ?? null,
    blockingReasons: sorted(input.blockingReasons),
  } satisfies Omit<DormantFirstLiveCompositionAdapterResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint("ture:dormant-server-only-first-live-staging-preflight-composition-adapter:result:v1", core),
  } satisfies DormantFirstLiveCompositionAdapterResult);
}

function evidenceFingerprint(input: FirstLiveTrustedExecutableResolutionResult["evidence"]): string {
  const core = { ...input } as Record<string, unknown>;
  delete core.evidenceFingerprintAlgorithm;
  delete core.evidenceFingerprint;
  return fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.evidence, core);
}

function resultFingerprint(input: FirstLiveTrustedExecutableResolutionResult): string {
  const core = { ...input } as Record<string, unknown>;
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  return fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.result, core);
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

function isSha256(input: unknown): input is string {
  return typeof input === "string" && /^[a-f0-9]{64}$/u.test(input);
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

function sorted<T extends string>(input: readonly T[]): readonly T[] {
  return [...new Set(input)].sort();
}

function deepFreeze<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreeze(value);
  }
  return input;
}
