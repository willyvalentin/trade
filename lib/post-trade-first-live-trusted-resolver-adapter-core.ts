import { createHash } from "node:crypto";
import { basename, isAbsolute, normalize } from "node:path";

import {
  TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
  TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID,
  buildTrustedExecutableResolutionPolicy,
  validateResolverSessionCapability,
  validateTrustedExecutableResolutionRequest,
  type ApprovedExecutableRootClass,
  type TrustedExecutableResolutionRequest,
} from "@/lib/post-trade-trusted-live-resolver-adapter-core";

export const FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY = deepFreeze({
  resolverKind: "trusted_live_resolver_adapter",
  resolverId: "ture.execution.trusted-live-resolver-adapter.live.macos.v1",
  platform: "macos",
  implementationMode: "live_filesystem_inspection_no_execution",
  sourceModel: "source_controlled_policy",
  policyVersion: 1,
  serverOnly: true,
  fixtureOnly: false,
  observedLiveFilesystem: true,
  authoritativeLive: false,
  enablesProcessStart: false,
  enablesPreflightRunner: false,
} as const);

export const FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID = "first_live_trusted_executable_resolution_macos_v1" as const;

export const FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:first-live-trusted-resolver-adapter:identity:v1",
  policy: "ture:first-live-trusted-resolver-adapter:policy:v1",
  observation: "ture:first-live-trusted-resolver-adapter:observation:v1",
  evidence: "ture:first-live-trusted-resolver-adapter:evidence:v1",
  result: "ture:first-live-trusted-resolver-adapter:result:v1",
} as const);

export type FirstLiveTrustedResolverToolIdentity = "git" | "supabase_cli";
export type FirstLiveTrustedResolverPlatform = "darwin" | "linux" | "win32" | "unsupported";
export type FirstLiveTrustedResolverStatus = "resolved_live_filesystem_evidence" | "blocked_fail_closed";
export type FirstLiveTrustedResolverBlockingReason =
  | "request_invalid"
  | "resolver_session_capability_invalid"
  | "resolver_session_capability_expired"
  | "session_mismatch"
  | "unsupported_platform"
  | "policy_invalid"
  | "tool_identity_mismatch"
  | "candidate_path_invalid"
  | "candidate_path_not_absolute"
  | "candidate_path_outside_approved_root"
  | "candidate_path_basename_mismatch"
  | "candidate_missing"
  | "candidate_not_regular_file"
  | "candidate_symlink"
  | "candidate_not_executable"
  | "candidate_stat_failed"
  | "multiple_acceptable_candidates"
  | "filesystem_error"
  | "sensitive_material_present";

export type FirstLiveTrustedResolverCandidatePolicy = Readonly<{
  candidateId: string;
  toolIdentity: FirstLiveTrustedResolverToolIdentity;
  absolutePath: string;
  expectedBasename: "git" | "supabase";
  approvedRootClass: ApprovedExecutableRootClass;
  approvedRootPath: string;
}>;

export type FirstLiveTrustedResolverPolicy = Readonly<{
  policyId: typeof FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID;
  policyVersion: 1;
  sourceControlled: true;
  platform: "macos";
  supportedToolIdentities: readonly ["git", "supabase_cli"];
  candidateSource: "source_controlled_absolute_paths";
  deterministicCandidateOrdering: true;
  allowCallerCandidatePaths: false;
  allowEnvironmentCandidatePaths: false;
  allowPathSearch: false;
  allowShellLookup: false;
  allowRelativePaths: false;
  allowDirectorySearch: false;
  allowSymlinks: false;
  acceptedFilesystemObjectType: "regular_file";
  requireExecutablePermission: true;
  requireSameSessionEvidence: true;
  issueLiveExecutableCapability: false;
  enableProcessStart: false;
  enablePreflightRunner: false;
  candidatePolicies: readonly FirstLiveTrustedResolverCandidatePolicy[];
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
}>;

export type FirstLiveTrustedResolverMetadata = Readonly<{
  deviceId: string;
  inode: string;
  sizeBytes: number;
  mode: number;
  modifiedTimeMs: number;
  changedTimeMs: number;
}>;

export type FirstLiveTrustedResolverCandidateObservation = Readonly<{
  observationKind: "first_live_trusted_resolver_candidate_observation";
  observationVersion: 1;
  observationSource: "test_synthetic_metadata";
  candidateId: string;
  observedPath: string;
  outcome: "ok" | "missing" | "stat_failed" | "filesystem_error";
  fileType: "regular_file" | "directory" | "symlink" | "other" | "missing" | "unknown";
  executablePermission: "executable" | "not_executable" | "unknown";
  metadata: FirstLiveTrustedResolverMetadata | null;
  observationFingerprintAlgorithm: "sha256";
  observationFingerprint: string;
}>;

export type FirstLiveTrustedExecutableResolutionEvidence = Readonly<{
  evidenceKind: "first_live_trusted_executable_resolution_evidence";
  evidenceVersion: 1;
  adapterIdentityFingerprint: string;
  adapterId: typeof FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId;
  policyId: typeof FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID;
  policyFingerprint: string;
  fixtureContractPolicyId: typeof TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID;
  fixtureContractPolicyFingerprint: string;
  requestId: string;
  requestFingerprint: string;
  boundarySessionId: string;
  resolverSessionCapabilityFingerprint: string;
  expectedToolIdentity: FirstLiveTrustedResolverToolIdentity;
  candidateId: string | null;
  resolvedAbsolutePath: string | null;
  fileType: "regular_file" | "directory" | "symlink" | "other" | "missing" | "unknown";
  executablePermission: "executable" | "not_executable" | "unknown";
  metadata: FirstLiveTrustedResolverMetadata | null;
  observedLiveFilesystem: boolean;
  authoritativeLive: false;
  issuesLiveExecutableCapability: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  toctouEliminated: false;
  requiresFutureSpawnRevalidation: true;
  status: FirstLiveTrustedResolverStatus;
  blockingReasons: readonly FirstLiveTrustedResolverBlockingReason[];
  evaluatedAt: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type FirstLiveTrustedExecutableResolutionResult = Readonly<{
  resultKind: "first_live_trusted_executable_resolution_result";
  resultVersion: 1;
  serverOnly: true;
  adapterId: typeof FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId;
  platform: "macos";
  remoteExecution: false;
  processSpawned: false;
  shellUsed: false;
  credentialAccessed: false;
  authorizationConsumed: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  status: FirstLiveTrustedResolverStatus;
  evidence: FirstLiveTrustedExecutableResolutionEvidence;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export type FirstLiveTrustedResolverEvaluationInput = Readonly<{
  request: TrustedExecutableResolutionRequest;
  evaluatedAt?: string;
  platform: FirstLiveTrustedResolverPlatform;
  candidateObservations?: readonly FirstLiveTrustedResolverCandidateObservation[];
}>;

const FIRST_LIVE_TRUSTED_RESOLVER_POLICY_CORE = deepFreeze({
  policyId: FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID,
  policyVersion: 1,
  sourceControlled: true,
  platform: "macos",
  supportedToolIdentities: ["git", "supabase_cli"],
  candidateSource: "source_controlled_absolute_paths",
  deterministicCandidateOrdering: true,
  allowCallerCandidatePaths: false,
  allowEnvironmentCandidatePaths: false,
  allowPathSearch: false,
  allowShellLookup: false,
  allowRelativePaths: false,
  allowDirectorySearch: false,
  allowSymlinks: false,
  acceptedFilesystemObjectType: "regular_file",
  requireExecutablePermission: true,
  requireSameSessionEvidence: true,
  issueLiveExecutableCapability: false,
  enableProcessStart: false,
  enablePreflightRunner: false,
  candidatePolicies: [
    { candidateId: "first_live_git_usr_bin_001", toolIdentity: "git", absolutePath: "/usr/bin/git", expectedBasename: "git", approvedRootClass: "system_usr_bin", approvedRootPath: "/usr/bin" },
    { candidateId: "first_live_supabase_homebrew_bin_001", toolIdentity: "supabase_cli", absolutePath: "/opt/homebrew/bin/supabase", expectedBasename: "supabase", approvedRootClass: "homebrew_bin", approvedRootPath: "/opt/homebrew/bin" },
    { candidateId: "first_live_supabase_usr_local_bin_001", toolIdentity: "supabase_cli", absolutePath: "/usr/local/bin/supabase", expectedBasename: "supabase", approvedRootClass: "homebrew_bin", approvedRootPath: "/usr/local/bin" },
  ],
} satisfies Omit<FirstLiveTrustedResolverPolicy, "policyFingerprintAlgorithm" | "policyFingerprint">);

export const FIRST_LIVE_TRUSTED_RESOLVER_POLICY = deepFreeze({
  ...FIRST_LIVE_TRUSTED_RESOLVER_POLICY_CORE,
  policyFingerprintAlgorithm: "sha256",
  policyFingerprint: fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.policy, FIRST_LIVE_TRUSTED_RESOLVER_POLICY_CORE),
} satisfies FirstLiveTrustedResolverPolicy);

export function getFirstLiveTrustedResolverPolicy(): FirstLiveTrustedResolverPolicy {
  return FIRST_LIVE_TRUSTED_RESOLVER_POLICY;
}

export function buildFirstLiveTrustedResolverIdentityFingerprint(input: unknown = FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY): string {
  return fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.identity, input);
}

export function validateFirstLiveTrustedResolverPolicy(input: unknown): readonly FirstLiveTrustedResolverBlockingReason[] {
  const errors: FirstLiveTrustedResolverBlockingReason[] = [];
  if (!isRecord(input)) return ["policy_invalid"];
  const expectedKeys = Object.keys(FIRST_LIVE_TRUSTED_RESOLVER_POLICY);
  for (const key of Object.keys(input)) if (!expectedKeys.includes(key)) errors.push("policy_invalid");
  if (input.policyId !== FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID) errors.push("policy_invalid");
  if (input.policyVersion !== 1 || input.sourceControlled !== true || input.platform !== "macos") errors.push("policy_invalid");
  if (!Array.isArray(input.supportedToolIdentities) || input.supportedToolIdentities.join("|") !== "git|supabase_cli") errors.push("policy_invalid");
  for (const key of ["deterministicCandidateOrdering", "requireExecutablePermission", "requireSameSessionEvidence"]) if (input[key] !== true) errors.push("policy_invalid");
  for (const key of ["allowCallerCandidatePaths", "allowEnvironmentCandidatePaths", "allowPathSearch", "allowShellLookup", "allowRelativePaths", "allowDirectorySearch", "allowSymlinks", "issueLiveExecutableCapability", "enableProcessStart", "enablePreflightRunner"]) if (input[key] !== false) errors.push("policy_invalid");
  if (input.candidateSource !== "source_controlled_absolute_paths" || input.acceptedFilesystemObjectType !== "regular_file") errors.push("policy_invalid");
  validateCandidateSet(input, errors);
  if (input.policyFingerprintAlgorithm !== "sha256" || !isSha256(input.policyFingerprint)) errors.push("policy_invalid");
  else {
    const core = { ...input } as Record<string, unknown>;
    delete core.policyFingerprintAlgorithm;
    delete core.policyFingerprint;
    if (input.policyFingerprint !== fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.policy, core)) errors.push("policy_invalid");
  }
  if (containsSensitiveMaterial(input)) errors.push("sensitive_material_present");
  return sorted(errors);
}

export function buildFirstLiveTrustedResolverCandidateObservation(input: Readonly<{
  observationSource: FirstLiveTrustedResolverCandidateObservation["observationSource"];
  candidateId: string;
  observedPath: string;
  outcome: FirstLiveTrustedResolverCandidateObservation["outcome"];
  fileType: FirstLiveTrustedResolverCandidateObservation["fileType"];
  executablePermission: FirstLiveTrustedResolverCandidateObservation["executablePermission"];
  metadata: FirstLiveTrustedResolverMetadata | null;
}>): FirstLiveTrustedResolverCandidateObservation {
  const core = {
    observationKind: "first_live_trusted_resolver_candidate_observation",
    observationVersion: 1,
    observationSource: input.observationSource,
    candidateId: input.candidateId,
    observedPath: input.observedPath,
    outcome: input.outcome,
    fileType: input.fileType,
    executablePermission: input.executablePermission,
    metadata: input.metadata,
  } satisfies Omit<FirstLiveTrustedResolverCandidateObservation, "observationFingerprintAlgorithm" | "observationFingerprint">;
  return deepFreeze({ ...core, observationFingerprintAlgorithm: "sha256", observationFingerprint: fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.observation, core) } satisfies FirstLiveTrustedResolverCandidateObservation);
}

export function evaluateFirstLiveTrustedExecutableResolution(input: FirstLiveTrustedResolverEvaluationInput): FirstLiveTrustedExecutableResolutionResult {
  const evaluatedAt = input.evaluatedAt ?? TRUSTED_LIVE_RESOLVER_EVALUATED_AT;
  const policy = FIRST_LIVE_TRUSTED_RESOLVER_POLICY;
  const observations = input.candidateObservations ?? [];
  const blocking: FirstLiveTrustedResolverBlockingReason[] = [];

  const requestValidation = validateTrustedExecutableResolutionRequest(input.request, evaluatedAt);
  if (!requestValidation.ok) blocking.push("request_invalid");
  const sessionValidation = validateResolverSessionCapability(input.request?.resolverSessionCapability, evaluatedAt);
  if (!sessionValidation.ok) {
    if (sessionValidation.errors.includes("resolver_session_capability_expired")) blocking.push("resolver_session_capability_expired");
    else blocking.push("resolver_session_capability_invalid");
  }
  if (input.request?.boundarySessionId !== input.request?.resolverSessionCapability?.boundarySessionId) blocking.push("session_mismatch");
  if (input.platform !== "darwin") blocking.push("unsupported_platform");
  blocking.push(...validateFirstLiveTrustedResolverPolicy(policy));
  if (!isSupportedTool(input.request?.expectedToolIdentity)) blocking.push("tool_identity_mismatch");

  const candidates = isSupportedTool(input.request?.expectedToolIdentity) ? policy.candidatePolicies.filter((candidate) => candidate.toolIdentity === input.request.expectedToolIdentity) : [];
  const acceptable: Array<{ candidate: FirstLiveTrustedResolverCandidatePolicy; observation: FirstLiveTrustedResolverCandidateObservation }> = [];
  let selectedCandidate: FirstLiveTrustedResolverCandidatePolicy | null = null;
  let selectedObservation: FirstLiveTrustedResolverCandidateObservation | null = null;
  let fileType: FirstLiveTrustedExecutableResolutionEvidence["fileType"] = "unknown";
  let executablePermission: FirstLiveTrustedExecutableResolutionEvidence["executablePermission"] = "unknown";

  if (blocking.length === 0 && candidates.length === 0) blocking.push("policy_invalid");
  if (blocking.length === 0) {
    for (const candidate of candidates) {
      const candidateErrors = validateCandidatePolicy(candidate);
      if (candidateErrors.length > 0) {
        blocking.push(...candidateErrors);
        continue;
      }
      const observation = observations.find((item) => item.candidateId === candidate.candidateId);
      if (!observation) {
        fileType = "missing";
        blocking.push("candidate_missing");
        continue;
      }
      const observationErrors = validateObservationForCandidate(observation, candidate);
      if (observationErrors.length > 0) {
        blocking.push(...observationErrors);
        fileType = observation.fileType;
        executablePermission = observation.executablePermission;
        continue;
      }
      fileType = observation.fileType;
      executablePermission = observation.executablePermission;
      if (observation.outcome === "missing") blocking.push("candidate_missing");
      else if (observation.outcome === "stat_failed") blocking.push("candidate_stat_failed");
      else if (observation.outcome === "filesystem_error") blocking.push("filesystem_error");
      else {
        const classification = classifyObservation(observation);
        if (classification.length === 0) acceptable.push({ candidate, observation });
        else blocking.push(...classification);
      }
    }
    if (acceptable.length > 1) blocking.push("multiple_acceptable_candidates");
    if (acceptable.length === 1 && !blocking.includes("multiple_acceptable_candidates")) {
      selectedCandidate = acceptable[0].candidate;
      selectedObservation = acceptable[0].observation;
      fileType = "regular_file";
      executablePermission = "executable";
    }
  }

  const evidence = buildEvidence({ request: input.request, policy, selectedCandidate, selectedObservation, fileType, executablePermission, blocking, evaluatedAt });
  const resultCore = {
    resultKind: "first_live_trusted_executable_resolution_result",
    resultVersion: 1,
    serverOnly: true,
    adapterId: FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId,
    platform: "macos",
    remoteExecution: false,
    processSpawned: false,
    shellUsed: false,
    credentialAccessed: false,
    authorizationConsumed: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    status: evidence.status,
    evidence,
  } satisfies Omit<FirstLiveTrustedExecutableResolutionResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({ ...resultCore, resultFingerprintAlgorithm: "sha256", resultFingerprint: fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.result, resultCore) } satisfies FirstLiveTrustedExecutableResolutionResult);
}

export function platformToFirstLiveTrustedResolverPlatform(platform: string | undefined): FirstLiveTrustedResolverPlatform {
  if (platform === "darwin" || platform === "linux" || platform === "win32") return platform;
  return "unsupported";
}

function validateCandidateSet(input: Record<string, unknown>, errors: FirstLiveTrustedResolverBlockingReason[]) {
  if (!Array.isArray(input.candidatePolicies) || input.candidatePolicies.length === 0) {
    errors.push("policy_invalid");
    return;
  }
  const ids = new Set<string>();
  const paths = new Set<string>();
  for (const candidate of input.candidatePolicies) {
    if (!isRecord(candidate)) {
      errors.push("policy_invalid");
      continue;
    }
    errors.push(...validateCandidatePolicy(candidate as Partial<FirstLiveTrustedResolverCandidatePolicy>));
    if (typeof candidate.candidateId === "string") {
      if (ids.has(candidate.candidateId)) errors.push("policy_invalid");
      ids.add(candidate.candidateId);
    }
    if (typeof candidate.absolutePath === "string") {
      if (paths.has(candidate.absolutePath)) errors.push("policy_invalid");
      paths.add(candidate.absolutePath);
    }
  }
}

function buildEvidence(input: Readonly<{
  request: TrustedExecutableResolutionRequest;
  policy: FirstLiveTrustedResolverPolicy;
  selectedCandidate: FirstLiveTrustedResolverCandidatePolicy | null;
  selectedObservation: FirstLiveTrustedResolverCandidateObservation | null;
  fileType: FirstLiveTrustedExecutableResolutionEvidence["fileType"];
  executablePermission: FirstLiveTrustedExecutableResolutionEvidence["executablePermission"];
  blocking: readonly FirstLiveTrustedResolverBlockingReason[];
  evaluatedAt: string;
}>): FirstLiveTrustedExecutableResolutionEvidence {
  const blockingReasons = sorted(input.blocking);
  const status: FirstLiveTrustedResolverStatus = blockingReasons.length === 0 ? "resolved_live_filesystem_evidence" : "blocked_fail_closed";
  const metadata = input.selectedObservation?.metadata ?? null;
  const fixturePolicy = buildTrustedExecutableResolutionPolicy();
  const core = {
    evidenceKind: "first_live_trusted_executable_resolution_evidence",
    evidenceVersion: 1,
    adapterIdentityFingerprint: buildFirstLiveTrustedResolverIdentityFingerprint(),
    adapterId: FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId,
    policyId: FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID,
    policyFingerprint: input.policy.policyFingerprint,
    fixtureContractPolicyId: TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID,
    fixtureContractPolicyFingerprint: fixturePolicy.policyFingerprint,
    requestId: input.request?.requestId ?? "request_unavailable",
    requestFingerprint: input.request?.requestFingerprint ?? "request_fingerprint_unavailable",
    boundarySessionId: input.request?.boundarySessionId ?? "session_unavailable",
    resolverSessionCapabilityFingerprint: input.request?.resolverSessionCapability?.capabilityFingerprint ?? "resolver_session_unavailable",
    expectedToolIdentity: isSupportedTool(input.request?.expectedToolIdentity) ? input.request.expectedToolIdentity : "git",
    candidateId: input.selectedCandidate?.candidateId ?? null,
    resolvedAbsolutePath: input.selectedCandidate?.absolutePath ?? null,
    fileType: input.fileType,
    executablePermission: input.executablePermission,
    metadata,
    observedLiveFilesystem: false,
    authoritativeLive: false,
    issuesLiveExecutableCapability: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    toctouEliminated: false,
    requiresFutureSpawnRevalidation: true,
    status,
    blockingReasons,
    evaluatedAt: input.evaluatedAt,
  } satisfies Omit<FirstLiveTrustedExecutableResolutionEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return deepFreeze({ ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.evidence, core) } satisfies FirstLiveTrustedExecutableResolutionEvidence);
}

function validateCandidatePolicy(candidate: Partial<FirstLiveTrustedResolverCandidatePolicy>): readonly FirstLiveTrustedResolverBlockingReason[] {
  const errors: FirstLiveTrustedResolverBlockingReason[] = [];
  if (typeof candidate.candidateId !== "string" || !/^first_live_[a-z0-9_]+$/u.test(candidate.candidateId)) errors.push("policy_invalid");
  if (!isSupportedTool(candidate.toolIdentity)) errors.push("tool_identity_mismatch");
  if (typeof candidate.absolutePath !== "string" || candidate.absolutePath.length === 0) errors.push("candidate_path_invalid");
  else {
    if (!isAbsolute(candidate.absolutePath)) errors.push("candidate_path_not_absolute");
    if (candidate.absolutePath !== normalize(candidate.absolutePath)) errors.push("candidate_path_invalid");
    if (candidate.absolutePath.includes("..") || candidate.absolutePath.includes("//")) errors.push("candidate_path_invalid");
    if (/[?*[\];&|`$]/u.test(candidate.absolutePath)) errors.push("candidate_path_invalid");
  }
  if (candidate.expectedBasename !== (candidate.toolIdentity === "git" ? "git" : "supabase")) errors.push("candidate_path_basename_mismatch");
  if (typeof candidate.absolutePath === "string" && candidate.expectedBasename && basename(candidate.absolutePath) !== candidate.expectedBasename) errors.push("candidate_path_basename_mismatch");
  if (typeof candidate.approvedRootPath !== "string" || !isAbsolute(candidate.approvedRootPath)) errors.push("candidate_path_outside_approved_root");
  else if (typeof candidate.absolutePath === "string" && !(candidate.absolutePath === candidate.approvedRootPath || candidate.absolutePath.startsWith(`${candidate.approvedRootPath}/`))) errors.push("candidate_path_outside_approved_root");
  if (candidate.toolIdentity === "git" && candidate.approvedRootClass !== "system_usr_bin") errors.push("candidate_path_outside_approved_root");
  if (candidate.toolIdentity === "supabase_cli" && !["homebrew_bin", "homebrew_opt"].includes(String(candidate.approvedRootClass))) errors.push("candidate_path_outside_approved_root");
  if (containsSensitiveMaterial(candidate)) errors.push("sensitive_material_present");
  return sorted(errors);
}

function validateObservationForCandidate(observation: FirstLiveTrustedResolverCandidateObservation, candidate: FirstLiveTrustedResolverCandidatePolicy): readonly FirstLiveTrustedResolverBlockingReason[] {
  const errors: FirstLiveTrustedResolverBlockingReason[] = [];
  if (observation.observationKind !== "first_live_trusted_resolver_candidate_observation" || observation.observationVersion !== 1) errors.push("filesystem_error");
  if (observation.observationSource !== "test_synthetic_metadata") errors.push("filesystem_error");
  if (observation.candidateId !== candidate.candidateId || observation.observedPath !== candidate.absolutePath) errors.push("candidate_path_invalid");
  if (!["ok", "missing", "stat_failed", "filesystem_error"].includes(observation.outcome)) errors.push("filesystem_error");
  if (observation.outcome === "ok" && !observation.metadata) errors.push("filesystem_error");
  if (observation.observationFingerprintAlgorithm !== "sha256" || !isSha256(observation.observationFingerprint)) errors.push("filesystem_error");
  else {
    const core = { ...observation } as Record<string, unknown>;
    delete core.observationFingerprintAlgorithm;
    delete core.observationFingerprint;
    if (observation.observationFingerprint !== fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.observation, core)) errors.push("filesystem_error");
  }
  if (containsSensitiveMaterial(observation)) errors.push("sensitive_material_present");
  return sorted(errors);
}

function classifyObservation(observation: FirstLiveTrustedResolverCandidateObservation): readonly FirstLiveTrustedResolverBlockingReason[] {
  if (observation.fileType === "symlink") return ["candidate_symlink"];
  if (observation.fileType !== "regular_file") return ["candidate_not_regular_file"];
  if (observation.executablePermission !== "executable") return ["candidate_not_executable"];
  return [];
}

function isSupportedTool(input: unknown): input is FirstLiveTrustedResolverToolIdentity {
  return input === "git" || input === "supabase_cli";
}

function containsSensitiveMaterial(input: unknown): boolean {
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

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isSha256(input: unknown): input is string {
  return typeof input === "string" && /^[a-f0-9]{64}$/u.test(input);
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
