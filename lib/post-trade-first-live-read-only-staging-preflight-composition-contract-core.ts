import { createHash } from "node:crypto";

import {
  FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY,
  FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID,
  type FirstLiveTrustedResolverToolIdentity,
} from "@/lib/post-trade-first-live-trusted-resolver-adapter-core";
import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
} from "@/lib/post-trade-first-live-read-only-preflight-authorization-artifact-core";
import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
} from "@/lib/post-trade-first-live-read-only-preflight-execution-boundary-contract";
import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION,
} from "@/lib/post-trade-first-live-read-only-preflight-cli-version-collector-core";
import {
  DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY,
  DIRECT_SPAWN_DRIVER_POLICY_ID,
  buildDirectSpawnOperationDefinition,
  type DirectSpawnOperation,
} from "@/lib/post-trade-direct-spawn-driver-boundary-core";
import {
  SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY,
  SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID,
} from "@/lib/post-trade-scoped-macos-process-observer-core";
import {
  CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY,
  NO_CREDENTIAL_POLICY_ID,
} from "@/lib/post-trade-credential-source-adapter-boundary-core";

export const FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY = deepFreeze({
  compositionKind: "first_live_read_only_staging_preflight_composition_contract",
  compositionId: "ture.execution.first-live-read-only-staging-preflight-composition.fixture.v1",
  contractVersion: 1,
  platform: "macos",
  implementationMode: "fixture_only_pure_contract",
  purpose: "first_live_read_only_staging_preflight",
  sourceModel: "source_controlled_contract",
  liveResolverInvoked: false,
  filesystemAccess: false,
  processSpawned: false,
  cliVersionCollected: false,
  credentialAccessed: false,
  networkAccessed: false,
  enablesExecution: false,
  enablesRunner: false,
} as const);

export const FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_POLICY_ID =
  "first_live_read_only_staging_preflight_composition_policy_v1" as const;
export const FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_SESSION_ID =
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
export const FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVALUATED_AT =
  "2026-07-17T10:50:05.000Z" as const;
export const FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EXPIRES_AT =
  "2026-07-17T10:50:30.000Z" as const;

export const FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:first-live-read-only-staging-preflight-composition:identity:v1",
  policy: "ture:first-live-read-only-staging-preflight-composition:policy:v1",
  evidence: "ture:first-live-read-only-staging-preflight-composition:evidence:v1",
  evidenceSet: "ture:first-live-read-only-staging-preflight-composition:evidence-set:v1",
  result: "ture:first-live-read-only-staging-preflight-composition:result:v1",
} as const);

const RESOLVER_EVIDENCE_PROVENANCE = new WeakSet<object>();
const REVALIDATION_EVIDENCE_PROVENANCE = new WeakSet<object>();
const SPAWN_PLAN_EVIDENCE_PROVENANCE = new WeakSet<object>();
const OBSERVER_PLAN_EVIDENCE_PROVENANCE = new WeakSet<object>();
const NO_CREDENTIAL_EVIDENCE_PROVENANCE = new WeakSet<object>();
const CLI_VERSION_EVIDENCE_PROVENANCE = new WeakSet<object>();
const AUTHORIZATION_LIFECYCLE_EVIDENCE_PROVENANCE = new WeakSet<object>();

export type FirstLiveReadOnlyStagingPreflightCompositionState =
  | "uninitialized"
  | "resolver_evidence_required"
  | "resolver_evidence_accepted"
  | "immediate_revalidation_required"
  | "spawn_plan_required"
  | "observer_plan_required"
  | "no_credential_evidence_required"
  | "cli_version_evidence_required"
  | "composition_complete"
  | "blocked"
  | "expired"
  | "cancelled"
  | "unknown";

export type FirstLiveReadOnlyStagingPreflightBlockingReason =
  | "missing_evidence"
  | "malformed_evidence"
  | "wrong_identity"
  | "wrong_capability_version"
  | "wrong_purpose"
  | "wrong_session"
  | "wrong_tool"
  | "wrong_platform"
  | "expired_evidence"
  | "stale_resolver_evidence"
  | "missing_immediate_revalidation_requirement"
  | "cloned_evidence"
  | "mutated_evidence"
  | "fingerprint_mismatch"
  | "provenance_mismatch"
  | "cross_boundary_substitution"
  | "duplicate_evidence"
  | "ambiguous_evidence"
  | "unexpected_credentials"
  | "retry_not_allowed"
  | "second_execution_attempt"
  | "unsupported_operation"
  | "evidence_order_invalid"
  | "fixture_live_authority_confusion"
  | "arbitrary_arguments_forbidden"
  | "shell_syntax_forbidden"
  | "toctou_not_eliminated_claimed"
  | "runtime_activation_claimed"
  | "authority_claim_rejected"
  | "live_observation_claim_rejected"
  | "resolver_metadata_schema_rejected";

export type FirstLiveReadOnlyStagingPreflightEvidenceKind =
  | "trusted_resolver_evidence_link"
  | "immediate_pre_spawn_revalidation_requirement"
  | "direct_spawn_plan_link"
  | "scoped_process_observer_plan_link"
  | "no_credential_evidence_link"
  | "cli_version_evidence_expectation"
  | "authorization_one_shot_lifecycle_evidence";

export type CompositionEvidenceBase = Readonly<{
  evidenceKind: FirstLiveReadOnlyStagingPreflightEvidenceKind;
  evidenceVersion: 1;
  boundarySessionId: typeof FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_SESSION_ID;
  purpose: "first_live_read_only_staging_preflight";
  platform: "macos";
  toolIdentity: FirstLiveTrustedResolverToolIdentity;
  operation: DirectSpawnOperation;
  issuedAt: "2026-07-17T10:50:00.000Z";
  expiresAt: typeof FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EXPIRES_AT;
  fixtureOnly: true;
  authoritativeLive: false;
  enablesFilesystemAuthority: false;
  enablesProcessStart: false;
  enablesObserverAuthority: false;
  enablesCredentialAccess: false;
  enablesNetworkAccess: false;
  enablesPreflightRunner: false;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type ResolverEvidenceLink = CompositionEvidenceBase & Readonly<{
  evidenceKind: "trusted_resolver_evidence_link";
  resolverAdapterId: typeof FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId;
  resolverPolicyId: typeof FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID;
  resolvedAbsolutePath: "/usr/bin/git" | "/opt/homebrew/bin/supabase" | "/usr/local/bin/supabase";
  metadata: ResolverMetadata;
  observedLiveFilesystem: boolean;
  toctouEliminated: false;
  requiresImmediateRevalidation: true;
}>;

export type ImmediatePreSpawnRevalidationRequirement = CompositionEvidenceBase & Readonly<{
  evidenceKind: "immediate_pre_spawn_revalidation_requirement";
  resolverEvidenceFingerprint: string;
  revalidationOperationImplemented: false;
  revalidationRequiredBeforeSpawn: true;
  expectedResolvedAbsolutePath: ResolverEvidenceLink["resolvedAbsolutePath"];
  expectedMetadata: ResolverMetadata;
  toctouEliminated: false;
}>;

export type DirectSpawnPlanLink = CompositionEvidenceBase & Readonly<{
  evidenceKind: "direct_spawn_plan_link";
  driverId: typeof DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY.driverId;
  driverPolicyId: typeof DIRECT_SPAWN_DRIVER_POLICY_ID;
  argv: readonly ["--version"];
  shellAllowed: false;
  retryPolicy: "none";
  attempt: 1;
  executionStarted: false;
  processSpawned: false;
}>;

export type ScopedProcessObserverPlanLink = CompositionEvidenceBase & Readonly<{
  evidenceKind: "scoped_process_observer_plan_link";
  observerId: typeof SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY.observerId;
  observerPolicyId: typeof SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID;
  observerInvoked: false;
  expectedChildPolicy: "no_children_expected";
}>;

export type NoCredentialEvidenceLink = CompositionEvidenceBase & Readonly<{
  evidenceKind: "no_credential_evidence_link";
  credentialAdapterId: typeof CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY.adapterId;
  credentialPolicyId: typeof NO_CREDENTIAL_POLICY_ID;
  noCredentialRequired: true;
  credentialMaterialPresent: false;
  tokenPresent: false;
  cookiePresent: false;
  keychainAccessed: false;
  browserStateAccessed: false;
  bankIdPresent: false;
  avanzaSessionPresent: false;
  supabaseAuthenticationPresent: false;
}>;

export type CliVersionEvidenceExpectation = CompositionEvidenceBase & Readonly<{
  evidenceKind: "cli_version_evidence_expectation";
  collectorId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID;
  collectorContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION;
  cliVersionEvidenceRequired: true;
  cliVersionCollected: false;
  versionCommandsExecuted: 0;
}>;

export type AuthorizationOneShotLifecycleEvidence = CompositionEvidenceBase & Readonly<{
  evidenceKind: "authorization_one_shot_lifecycle_evidence";
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  preflightOperationId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID;
  oneShot: true;
  retryPolicy: "none";
  attempt: 1;
  authorizationConsumed: false;
}>;

export type CompositionEvidence =
  | ResolverEvidenceLink
  | ImmediatePreSpawnRevalidationRequirement
  | DirectSpawnPlanLink
  | ScopedProcessObserverPlanLink
  | NoCredentialEvidenceLink
  | CliVersionEvidenceExpectation
  | AuthorizationOneShotLifecycleEvidence;

export type ResolverMetadata = Readonly<{
  deviceId: string;
  inode: string;
  sizeBytes: number;
  mode: number;
  modifiedTimeMs: number;
}>;

export type CompositionEvidenceSet = Readonly<{
  evidenceSetKind: "first_live_read_only_staging_preflight_composition_evidence_set";
  evidenceSetVersion: 1;
  boundarySessionId: typeof FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_SESSION_ID;
  canonicalOrder: readonly FirstLiveReadOnlyStagingPreflightEvidenceKind[];
  evidence: readonly CompositionEvidence[];
  evidenceSetFingerprintAlgorithm: "sha256";
  evidenceSetFingerprint: string;
}>;

export type CompositionResult = Readonly<{
  resultKind: "first_live_read_only_staging_preflight_composition_result";
  resultVersion: 1;
  compositionId: typeof FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY.compositionId;
  state: FirstLiveReadOnlyStagingPreflightCompositionState;
  fixtureOnly: true;
  compositionComplete: boolean;
  executionAuthority: "none";
  filesystemAuthority: "none";
  spawnAuthority: "none";
  observerAuthority: "none";
  credentialAuthority: "none";
  networkAuthority: "none";
  runnerAuthority: "none";
  apiAuthority: "none";
  uiAuthority: "none";
  tradingAuthority: "none";
  avanzaAuthority: "none";
  deploymentAuthority: "none";
  liveResolverInvoked: false;
  filesystemOperationPerformed: false;
  cliVersionCollected: false;
  processSpawned: false;
  shellUsed: false;
  credentialAccessed: false;
  networkAccessed: false;
  retryAllowed: false;
  toctouEliminated: false;
  requiresImmediatePreSpawnRevalidation: true;
  evidenceSet: CompositionEvidenceSet | null;
  blockingReasons: readonly FirstLiveReadOnlyStagingPreflightBlockingReason[];
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export const FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER = deepFreeze([
  "trusted_resolver_evidence_link",
  "immediate_pre_spawn_revalidation_requirement",
  "direct_spawn_plan_link",
  "scoped_process_observer_plan_link",
  "no_credential_evidence_link",
  "cli_version_evidence_expectation",
  "authorization_one_shot_lifecycle_evidence",
] as const);

export const FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_POLICY = deepFreeze({
  policyId: FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_POLICY_ID,
  policyVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  supportedToolIdentities: ["git", "supabase_cli"] as const,
  supportedOperations: ["collect_git_version", "collect_supabase_cli_version"] as const,
  evidenceOrder: FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER,
  oneShotOnly: true,
  retryPolicy: "none",
  compositionMayExecute: false,
  compositionMayInvokeLiveResolver: false,
  compositionMayAccessFilesystem: false,
  compositionMaySpawn: false,
  compositionMayAccessCredentials: false,
  compositionMayAccessNetwork: false,
  compositionMayEnableRunner: false,
  immediatePreSpawnRevalidationRequired: true,
  toctouEliminated: false,
} as const);

export function buildResolverEvidenceLink(input: Partial<ResolverEvidenceLink> = {}): ResolverEvidenceLink {
  const toolIdentity = input.toolIdentity ?? "git";
  const operation = operationForTool(toolIdentity);
  const metadata = Object.prototype.hasOwnProperty.call(input, "metadata") ? input.metadata : metadataFor(toolIdentity);
  if (!isValidResolverMetadata(metadata)) throw new Error("resolver_metadata_schema_rejected");
  const core = baseEvidence("trusted_resolver_evidence_link", toolIdentity, operation, input, {
    resolverAdapterId: FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId,
    resolverPolicyId: FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID,
    resolvedAbsolutePath: input.resolvedAbsolutePath ?? (toolIdentity === "git" ? "/usr/bin/git" : "/opt/homebrew/bin/supabase"),
    metadata,
    observedLiveFilesystem: input.observedLiveFilesystem ?? false,
    toctouEliminated: false,
    requiresImmediateRevalidation: true,
  });
  const evidence = finalizeEvidence(core) as ResolverEvidenceLink;
  RESOLVER_EVIDENCE_PROVENANCE.add(evidence);
  return evidence;
}

export function buildImmediatePreSpawnRevalidationRequirementEvidence(resolverEvidence = buildResolverEvidenceLink(), input: Partial<ImmediatePreSpawnRevalidationRequirement> = {}): ImmediatePreSpawnRevalidationRequirement {
  const core = baseEvidence("immediate_pre_spawn_revalidation_requirement", input.toolIdentity ?? resolverEvidence.toolIdentity, input.operation ?? resolverEvidence.operation, input, {
    resolverEvidenceFingerprint: input.resolverEvidenceFingerprint ?? resolverEvidence.evidenceFingerprint,
    revalidationOperationImplemented: false,
    revalidationRequiredBeforeSpawn: true,
    expectedResolvedAbsolutePath: input.expectedResolvedAbsolutePath ?? resolverEvidence.resolvedAbsolutePath,
    expectedMetadata: input.expectedMetadata ?? resolverEvidence.metadata,
    toctouEliminated: false,
  });
  const evidence = finalizeEvidence(core) as ImmediatePreSpawnRevalidationRequirement;
  REVALIDATION_EVIDENCE_PROVENANCE.add(evidence);
  return evidence;
}

export function buildDirectSpawnPlanEvidence(input: Partial<DirectSpawnPlanLink> = {}): DirectSpawnPlanLink {
  const toolIdentity = input.toolIdentity ?? "git";
  const operation = input.operation ?? operationForTool(toolIdentity);
  const definition = buildDirectSpawnOperationDefinition(operation);
  const core = baseEvidence("direct_spawn_plan_link", toolIdentity, operation, input, {
    driverId: DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY.driverId,
    driverPolicyId: DIRECT_SPAWN_DRIVER_POLICY_ID,
    argv: input.argv ?? definition.argv,
    shellAllowed: false,
    retryPolicy: "none",
    attempt: 1,
    executionStarted: false,
    processSpawned: false,
  });
  const evidence = finalizeEvidence(core) as DirectSpawnPlanLink;
  SPAWN_PLAN_EVIDENCE_PROVENANCE.add(evidence);
  return evidence;
}

export function buildScopedObserverPlanEvidence(input: Partial<ScopedProcessObserverPlanLink> = {}): ScopedProcessObserverPlanLink {
  const toolIdentity = input.toolIdentity ?? "git";
  const core = baseEvidence("scoped_process_observer_plan_link", toolIdentity, input.operation ?? operationForTool(toolIdentity), input, {
    observerId: SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY.observerId,
    observerPolicyId: SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID,
    observerInvoked: false,
    expectedChildPolicy: "no_children_expected",
  });
  const evidence = finalizeEvidence(core) as ScopedProcessObserverPlanLink;
  OBSERVER_PLAN_EVIDENCE_PROVENANCE.add(evidence);
  return evidence;
}

export function buildNoCredentialEvidence(input: Partial<NoCredentialEvidenceLink> = {}): NoCredentialEvidenceLink {
  const toolIdentity = input.toolIdentity ?? "git";
  const core = baseEvidence("no_credential_evidence_link", toolIdentity, input.operation ?? operationForTool(toolIdentity), input, {
    credentialAdapterId: CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY.adapterId,
    credentialPolicyId: NO_CREDENTIAL_POLICY_ID,
    noCredentialRequired: true,
    credentialMaterialPresent: false,
    tokenPresent: false,
    cookiePresent: false,
    keychainAccessed: false,
    browserStateAccessed: false,
    bankIdPresent: false,
    avanzaSessionPresent: false,
    supabaseAuthenticationPresent: false,
  });
  const evidence = finalizeEvidence(core) as NoCredentialEvidenceLink;
  NO_CREDENTIAL_EVIDENCE_PROVENANCE.add(evidence);
  return evidence;
}

export function buildCliVersionEvidenceExpectation(input: Partial<CliVersionEvidenceExpectation> = {}): CliVersionEvidenceExpectation {
  const toolIdentity = input.toolIdentity ?? "git";
  const core = baseEvidence("cli_version_evidence_expectation", toolIdentity, input.operation ?? operationForTool(toolIdentity), input, {
    collectorId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID,
    collectorContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION,
    cliVersionEvidenceRequired: true,
    cliVersionCollected: false,
    versionCommandsExecuted: 0,
  });
  const evidence = finalizeEvidence(core) as CliVersionEvidenceExpectation;
  CLI_VERSION_EVIDENCE_PROVENANCE.add(evidence);
  return evidence;
}

export function buildAuthorizationLifecycleEvidence(input: Partial<AuthorizationOneShotLifecycleEvidence> = {}): AuthorizationOneShotLifecycleEvidence {
  const toolIdentity = input.toolIdentity ?? "git";
  const core = baseEvidence("authorization_one_shot_lifecycle_evidence", toolIdentity, input.operation ?? operationForTool(toolIdentity), input, {
    authorizationArtifactId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
    preflightRunId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
    preflightOperationId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID,
    oneShot: true,
    retryPolicy: "none",
    attempt: 1,
    authorizationConsumed: false,
  });
  const evidence = finalizeEvidence(core) as AuthorizationOneShotLifecycleEvidence;
  AUTHORIZATION_LIFECYCLE_EVIDENCE_PROVENANCE.add(evidence);
  return evidence;
}

export function buildCanonicalCompositionEvidenceSet(toolIdentity: FirstLiveTrustedResolverToolIdentity = "git"): CompositionEvidenceSet {
  const resolver = buildResolverEvidenceLink({ toolIdentity });
  const evidence = [
    resolver,
    buildImmediatePreSpawnRevalidationRequirementEvidence(resolver),
    buildDirectSpawnPlanEvidence({ toolIdentity }),
    buildScopedObserverPlanEvidence({ toolIdentity }),
    buildNoCredentialEvidence({ toolIdentity }),
    buildCliVersionEvidenceExpectation({ toolIdentity }),
    buildAuthorizationLifecycleEvidence({ toolIdentity }),
  ] as const;
  return finalizeEvidenceSet(evidence);
}

export function composeFirstLiveReadOnlyStagingPreflight(input: Readonly<{ evidenceSet: CompositionEvidenceSet; evaluatedAt?: string }>): CompositionResult {
  const evaluatedAt = input.evaluatedAt ?? FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVALUATED_AT;
  const blockingReasons = validateCompositionEvidenceSet(input.evidenceSet, evaluatedAt);
  const state = blockingReasons.includes("expired_evidence") ? "expired" : blockingReasons.length > 0 ? "blocked" : "composition_complete";
  return finalizeResult({
    state,
    compositionComplete: state === "composition_complete",
    evidenceSet: blockingReasons.length === 0 ? input.evidenceSet : null,
    blockingReasons,
  });
}

export function validateCompositionEvidenceSet(input: unknown, evaluatedAt: string = FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVALUATED_AT): readonly FirstLiveReadOnlyStagingPreflightBlockingReason[] {
  const reasons: FirstLiveReadOnlyStagingPreflightBlockingReason[] = [];
  if (!isRecord(input)) return ["missing_evidence"];
  if (input.evidenceSetKind !== "first_live_read_only_staging_preflight_composition_evidence_set" || input.evidenceSetVersion !== 1) reasons.push("malformed_evidence");
  if (input.boundarySessionId !== FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_SESSION_ID) reasons.push("wrong_session");
  if (!Array.isArray(input.evidence)) reasons.push("missing_evidence");
  else validateEvidenceArray(input.evidence, evaluatedAt, reasons);
  if (input.evidenceSetFingerprintAlgorithm !== "sha256" || typeof input.evidenceSetFingerprint !== "string") reasons.push("fingerprint_mismatch");
  else {
    const core = { ...input } as Record<string, unknown>;
    delete core.evidenceSetFingerprintAlgorithm;
    delete core.evidenceSetFingerprint;
    if (input.evidenceSetFingerprint !== fingerprint(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS.evidenceSet, core)) reasons.push("fingerprint_mismatch");
  }
  return sorted(reasons);
}

export function transitionFirstLiveReadOnlyStagingPreflightState(state: FirstLiveReadOnlyStagingPreflightCompositionState, event: "start" | "accept_resolver" | "require_revalidation" | "accept_spawn_plan" | "accept_observer_plan" | "accept_no_credential" | "accept_cli_version" | "complete" | "block" | "expire" | "cancel"): FirstLiveReadOnlyStagingPreflightCompositionState {
  if (event === "block") return "blocked";
  if (event === "expire") return "expired";
  if (event === "cancel") return "cancelled";
  const next: Record<string, FirstLiveReadOnlyStagingPreflightCompositionState> = {
    "uninitialized:start": "resolver_evidence_required",
    "resolver_evidence_required:accept_resolver": "resolver_evidence_accepted",
    "resolver_evidence_accepted:require_revalidation": "immediate_revalidation_required",
    "immediate_revalidation_required:accept_spawn_plan": "spawn_plan_required",
    "spawn_plan_required:accept_observer_plan": "observer_plan_required",
    "observer_plan_required:accept_no_credential": "no_credential_evidence_required",
    "no_credential_evidence_required:accept_cli_version": "cli_version_evidence_required",
    "cli_version_evidence_required:complete": "composition_complete",
  };
  return next[`${state}:${event}`] ?? "blocked";
}

function validateEvidenceArray(evidence: unknown[], evaluatedAt: string, reasons: FirstLiveReadOnlyStagingPreflightBlockingReason[]) {
  if (evidence.length !== FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER.length) reasons.push("missing_evidence");
  if (evidence.length > FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER.length) reasons.push("ambiguous_evidence");
  const kinds = evidence.map((item) => isRecord(item) ? item.evidenceKind : "");
  if (new Set(kinds).size !== kinds.length) reasons.push("duplicate_evidence");
  if (JSON.stringify(kinds) !== JSON.stringify(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER)) reasons.push("evidence_order_invalid");
  for (const item of evidence) validateEvidence(item, evaluatedAt, reasons);
  const resolver = evidence[0] as ResolverEvidenceLink | undefined;
  const revalidation = evidence[1] as ImmediatePreSpawnRevalidationRequirement | undefined;
  if (isRecord(resolver) && isRecord(revalidation)) validateRevalidationLink(resolver, revalidation, reasons);
}

function validateEvidence(input: unknown, evaluatedAt: string, reasons: FirstLiveReadOnlyStagingPreflightBlockingReason[]) {
  if (!isRecord(input)) {
    reasons.push("malformed_evidence");
    return;
  }
  if (!hasSafeObjectShape(input)) {
    reasons.push("malformed_evidence");
    return;
  }
  if (!hasExpectedProvenance(input)) reasons.push("provenance_mismatch");
  if (input.evidenceVersion !== 1) reasons.push("wrong_capability_version");
  if (input.boundarySessionId !== FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_SESSION_ID) reasons.push("wrong_session");
  if (input.purpose !== "first_live_read_only_staging_preflight") reasons.push("wrong_purpose");
  if (input.platform !== "macos") reasons.push("wrong_platform");
  if (input.fixtureOnly !== true || input.authoritativeLive !== false) reasons.push("fixture_live_authority_confusion");
  if (hasAuthorityClaim(input)) reasons.push("authority_claim_rejected");
  if (input.enablesProcessStart !== false || input.enablesPreflightRunner !== false) reasons.push("runtime_activation_claimed");
  if (input.enablesCredentialAccess !== false) reasons.push("unexpected_credentials");
  if (input.evidenceFingerprintAlgorithm !== "sha256" || typeof input.evidenceFingerprint !== "string") reasons.push("fingerprint_mismatch");
  else if (input.evidenceFingerprint !== evidenceFingerprint(input)) reasons.push("fingerprint_mismatch");
  if (typeof input.expiresAt === "string" && input.expiresAt <= evaluatedAt) reasons.push("expired_evidence");
  if (input.toolIdentity !== "git" && input.toolIdentity !== "supabase_cli") reasons.push("wrong_tool");
  if (input.operation !== "collect_git_version" && input.operation !== "collect_supabase_cli_version") reasons.push("unsupported_operation");
  if ((input.toolIdentity === "git" && input.operation !== "collect_git_version") || (input.toolIdentity === "supabase_cli" && input.operation !== "collect_supabase_cli_version")) reasons.push("wrong_tool");
  validateKindSpecific(input, reasons);
}

function validateKindSpecific(input: Record<string, unknown>, reasons: FirstLiveReadOnlyStagingPreflightBlockingReason[]) {
  if (input.evidenceKind === "trusted_resolver_evidence_link") {
    if (input.resolverAdapterId !== FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId || input.resolverPolicyId !== FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID) reasons.push("wrong_identity");
    if (input.observedLiveFilesystem !== false || input.source === "server_only_lstat" || input.observationSource === "server_only_lstat" || input.filesystemObservationSource === "server_only_lstat") reasons.push("live_observation_claim_rejected");
    if (input.requiresImmediateRevalidation !== true) reasons.push("missing_immediate_revalidation_requirement");
    if (input.toctouEliminated !== false) reasons.push("toctou_not_eliminated_claimed");
    if (!isValidResolverMetadata(input.metadata)) reasons.push("resolver_metadata_schema_rejected");
  } else if (input.evidenceKind === "immediate_pre_spawn_revalidation_requirement") {
    if (input.revalidationRequiredBeforeSpawn !== true) reasons.push("missing_immediate_revalidation_requirement");
    if (input.revalidationOperationImplemented !== false) reasons.push("runtime_activation_claimed");
    if (input.toctouEliminated !== false) reasons.push("toctou_not_eliminated_claimed");
  } else if (input.evidenceKind === "direct_spawn_plan_link") {
    if (input.driverId !== DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY.driverId || input.driverPolicyId !== DIRECT_SPAWN_DRIVER_POLICY_ID) reasons.push("wrong_identity");
    if (JSON.stringify(input.argv) !== JSON.stringify(["--version"])) reasons.push("arbitrary_arguments_forbidden");
    if (input.shellAllowed !== false) reasons.push("shell_syntax_forbidden");
    if (input.retryPolicy !== "none") reasons.push("retry_not_allowed");
    if (input.attempt !== 1) reasons.push("second_execution_attempt");
    if (input.executionStarted !== false || input.processSpawned !== false) reasons.push("runtime_activation_claimed");
  } else if (input.evidenceKind === "scoped_process_observer_plan_link") {
    if (input.observerId !== SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY.observerId || input.observerPolicyId !== SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID) reasons.push("wrong_identity");
    if (input.observerInvoked !== false) reasons.push("runtime_activation_claimed");
  } else if (input.evidenceKind === "no_credential_evidence_link") {
    if (input.credentialAdapterId !== CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY.adapterId || input.credentialPolicyId !== NO_CREDENTIAL_POLICY_ID) reasons.push("wrong_identity");
    for (const key of ["credentialMaterialPresent", "tokenPresent", "cookiePresent", "keychainAccessed", "browserStateAccessed", "bankIdPresent", "avanzaSessionPresent", "supabaseAuthenticationPresent"]) if (input[key] !== false) reasons.push("unexpected_credentials");
  } else if (input.evidenceKind === "cli_version_evidence_expectation") {
    if (input.collectorId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID || input.collectorContractVersion !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION) reasons.push("wrong_identity");
    if (input.cliVersionCollected !== false || input.versionCommandsExecuted !== 0) reasons.push("runtime_activation_claimed");
  } else if (input.evidenceKind === "authorization_one_shot_lifecycle_evidence") {
    if (input.authorizationArtifactId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID || input.preflightRunId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID || input.preflightOperationId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID) reasons.push("wrong_identity");
    if (input.oneShot !== true) reasons.push("wrong_purpose");
    if (input.retryPolicy !== "none") reasons.push("retry_not_allowed");
    if (input.attempt !== 1) reasons.push("second_execution_attempt");
    if (input.authorizationConsumed !== false) reasons.push("runtime_activation_claimed");
  } else reasons.push("malformed_evidence");
}

function hasAuthorityClaim(input: Record<string, unknown>): boolean {
  return [
    "enablesFilesystemAuthority",
    "enablesObserverAuthority",
    "enablesNetworkAccess",
    "enablesSpawnAuthority",
    "enablesRunnerAuthority",
    "enablesCredentialAuthority",
    "enablesExecutionAuthority",
    "enablesCliExecution",
    "enablesAuthorizationConsumption",
    "enablesApiAccess",
    "enablesUiAccess",
    "enablesTradingAuthority",
    "enablesAvanzaAuthority",
    "enablesOrderMutation",
    "enablesPositionMutation",
    "enablesSettlementAuthority",
    "enablesPersistence",
    "enablesDeployment",
    "filesystemAuthority",
    "observerAuthority",
    "networkAuthority",
    "spawnAuthority",
    "runnerAuthority",
    "credentialAuthority",
    "executionAuthority",
    "apiAuthority",
    "uiAuthority",
    "tradingAuthority",
    "avanzaAuthority",
    "deploymentAuthority",
  ].some((key) => hasOwnDataProperty(input, key) && (input[key] === true || (typeof input[key] === "string" && input[key] !== "none")));
}

function isValidResolverMetadata(input: unknown): input is ResolverMetadata {
  if (!isRecord(input) || !hasSafeObjectShape(input)) return false;
  const keys = Object.keys(input).sort();
  if (JSON.stringify(keys) !== JSON.stringify(["deviceId", "inode", "mode", "modifiedTimeMs", "sizeBytes"])) return false;
  if (hasNestedAuthorityClaim(input)) return false;
  if (typeof input.deviceId !== "string" || input.deviceId.length === 0) return false;
  if (typeof input.inode !== "string" || input.inode.length === 0) return false;
  return isFiniteNumber(input.sizeBytes) && input.sizeBytes >= 0
    && isFiniteNumber(input.mode) && input.mode >= 0
    && isFiniteNumber(input.modifiedTimeMs) && input.modifiedTimeMs >= 0;
}

function hasNestedAuthorityClaim(input: Record<string, unknown>): boolean {
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== "string") return true;
    if (isForbiddenNestedKey(key)) return true;
    const value = input[key];
    if (typeof value === "function") return true;
    if (value && typeof value === "object") return true;
  }
  return false;
}

function isForbiddenNestedKey(key: string): boolean {
  return key === "__proto__"
    || key === "constructor"
    || key === "prototype"
    || key === "authority"
    || key === "authorities"
    || key === "permissions"
    || key === "capabilities"
    || key === "grants"
    || key === "access"
    || key === "privileges"
    || key.startsWith("enables")
    || key.endsWith("Authority")
    || key.endsWith("Mutation");
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

function hasOwnDataProperty(input: Record<string, unknown>, key: string): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return Boolean(descriptor && "value" in descriptor);
}

function isFiniteNumber(input: unknown): input is number {
  return typeof input === "number" && Number.isFinite(input);
}

function validateRevalidationLink(resolver: ResolverEvidenceLink, revalidation: ImmediatePreSpawnRevalidationRequirement, reasons: FirstLiveReadOnlyStagingPreflightBlockingReason[]) {
  if (revalidation.resolverEvidenceFingerprint !== resolver.evidenceFingerprint) reasons.push("fingerprint_mismatch");
  if (revalidation.expectedResolvedAbsolutePath !== resolver.resolvedAbsolutePath) reasons.push("stale_resolver_evidence");
  if (JSON.stringify(revalidation.expectedMetadata) !== JSON.stringify(resolver.metadata)) reasons.push("stale_resolver_evidence");
}

function baseEvidence(kind: FirstLiveReadOnlyStagingPreflightEvidenceKind, toolIdentity: FirstLiveTrustedResolverToolIdentity, operation: DirectSpawnOperation, input: Partial<CompositionEvidenceBase>, extra: Record<string, unknown>) {
  return {
    evidenceKind: kind,
    evidenceVersion: input.evidenceVersion ?? 1,
    boundarySessionId: input.boundarySessionId ?? FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_SESSION_ID,
    purpose: input.purpose ?? "first_live_read_only_staging_preflight",
    platform: input.platform ?? "macos",
    toolIdentity,
    operation,
    issuedAt: input.issuedAt ?? "2026-07-17T10:50:00.000Z",
    expiresAt: input.expiresAt ?? FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EXPIRES_AT,
    fixtureOnly: input.fixtureOnly ?? true,
    authoritativeLive: input.authoritativeLive ?? false,
    enablesFilesystemAuthority: input.enablesFilesystemAuthority ?? false,
    enablesProcessStart: input.enablesProcessStart ?? false,
    enablesObserverAuthority: input.enablesObserverAuthority ?? false,
    enablesCredentialAccess: input.enablesCredentialAccess ?? false,
    enablesNetworkAccess: input.enablesNetworkAccess ?? false,
    enablesPreflightRunner: input.enablesPreflightRunner ?? false,
    ...extra,
  };
}

function finalizeEvidence(input: Record<string, unknown>): CompositionEvidence {
  return deepFreeze({ ...input, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: fingerprint(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS.evidence, input) } as CompositionEvidence);
}

function finalizeEvidenceSet(evidence: readonly CompositionEvidence[]): CompositionEvidenceSet {
  const core = {
    evidenceSetKind: "first_live_read_only_staging_preflight_composition_evidence_set",
    evidenceSetVersion: 1,
    boundarySessionId: FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_SESSION_ID,
    canonicalOrder: FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER,
    evidence,
  } satisfies Omit<CompositionEvidenceSet, "evidenceSetFingerprintAlgorithm" | "evidenceSetFingerprint">;
  return deepFreeze({ ...core, evidenceSetFingerprintAlgorithm: "sha256", evidenceSetFingerprint: fingerprint(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS.evidenceSet, core) } satisfies CompositionEvidenceSet);
}

function finalizeResult(input: Pick<CompositionResult, "state" | "compositionComplete" | "evidenceSet" | "blockingReasons">): CompositionResult {
  const core = {
    resultKind: "first_live_read_only_staging_preflight_composition_result",
    resultVersion: 1,
    compositionId: FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY.compositionId,
    state: input.state,
    fixtureOnly: true,
    compositionComplete: input.compositionComplete,
    executionAuthority: "none",
    filesystemAuthority: "none",
    spawnAuthority: "none",
    observerAuthority: "none",
    credentialAuthority: "none",
    networkAuthority: "none",
    runnerAuthority: "none",
    apiAuthority: "none",
    uiAuthority: "none",
    tradingAuthority: "none",
    avanzaAuthority: "none",
    deploymentAuthority: "none",
    liveResolverInvoked: false,
    filesystemOperationPerformed: false,
    cliVersionCollected: false,
    processSpawned: false,
    shellUsed: false,
    credentialAccessed: false,
    networkAccessed: false,
    retryAllowed: false,
    toctouEliminated: false,
    requiresImmediatePreSpawnRevalidation: true,
    evidenceSet: input.evidenceSet,
    blockingReasons: sorted(input.blockingReasons),
  } satisfies Omit<CompositionResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({ ...core, resultFingerprintAlgorithm: "sha256", resultFingerprint: fingerprint(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS.result, core) } satisfies CompositionResult);
}

function hasExpectedProvenance(input: Record<string, unknown>): boolean {
  if (input.evidenceKind === "trusted_resolver_evidence_link") return RESOLVER_EVIDENCE_PROVENANCE.has(input);
  if (input.evidenceKind === "immediate_pre_spawn_revalidation_requirement") return REVALIDATION_EVIDENCE_PROVENANCE.has(input);
  if (input.evidenceKind === "direct_spawn_plan_link") return SPAWN_PLAN_EVIDENCE_PROVENANCE.has(input);
  if (input.evidenceKind === "scoped_process_observer_plan_link") return OBSERVER_PLAN_EVIDENCE_PROVENANCE.has(input);
  if (input.evidenceKind === "no_credential_evidence_link") return NO_CREDENTIAL_EVIDENCE_PROVENANCE.has(input);
  if (input.evidenceKind === "cli_version_evidence_expectation") return CLI_VERSION_EVIDENCE_PROVENANCE.has(input);
  if (input.evidenceKind === "authorization_one_shot_lifecycle_evidence") return AUTHORIZATION_LIFECYCLE_EVIDENCE_PROVENANCE.has(input);
  return false;
}

function operationForTool(toolIdentity: FirstLiveTrustedResolverToolIdentity): DirectSpawnOperation {
  return toolIdentity === "git" ? "collect_git_version" : "collect_supabase_cli_version";
}

function metadataFor(toolIdentity: FirstLiveTrustedResolverToolIdentity): ResolverMetadata {
  return toolIdentity === "git"
    ? deepFreeze({ deviceId: "fixture-device-git", inode: "fixture-inode-git", sizeBytes: 123456, mode: 0o100755, modifiedTimeMs: 1000 })
    : deepFreeze({ deviceId: "fixture-device-supabase", inode: "fixture-inode-supabase", sizeBytes: 234567, mode: 0o100755, modifiedTimeMs: 2000 });
}

function evidenceFingerprint(input: Record<string, unknown>): string {
  const core = { ...input };
  delete core.evidenceFingerprintAlgorithm;
  delete core.evidenceFingerprint;
  return fingerprint(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_FINGERPRINT_DOMAINS.evidence, core);
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function fingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(canonicalize(input))}`).digest("hex");
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(canonicalize);
  if (input && typeof input === "object") return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, canonicalize(value)]));
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
