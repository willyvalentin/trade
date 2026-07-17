import { createHash } from "node:crypto";

import { POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION } from "@/lib/post-trade-live-read-only-macos-process-driver-design";
import { SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID } from "@/lib/post-trade-scoped-macos-process-observer-core";
import { TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY } from "@/lib/post-trade-trusted-live-resolver-adapter-core";

export const DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY = deepFreeze({
  driverKind: "direct_spawn_driver_boundary",
  driverId: "ture.execution.direct-spawn-driver-boundary.fixture.v1",
  platform: "macos",
  implementationMode: "fixture_only",
  executionModel: "direct_spawn",
  shellMode: "forbidden",
  sourceModel: "injected_fixture",
  policyVersion: 1,
} as const);

export const DIRECT_SPAWN_DRIVER_POLICY_ID = "first_live_read_only_direct_spawn_v1" as const;
export const DIRECT_SPAWN_TIMEOUT_POLICY_ID = "first_live_read_only_version_command_timeout_v1" as const;
export const DIRECT_SPAWN_TERMINATION_POLICY_ID = "first_live_read_only_timeout_termination_required_v1" as const;
export const DIRECT_SPAWN_ISSUED_AT = "2026-07-17T10:20:00.000Z" as const;
export const DIRECT_SPAWN_EVALUATED_AT = "2026-07-17T10:20:05.000Z" as const;
export const DIRECT_SPAWN_EXPIRES_AT = "2026-07-17T10:20:30.000Z" as const;

export const DIRECT_SPAWN_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:direct-spawn-driver-boundary:identity:v1",
  policy: "ture:direct-spawn-driver-boundary:policy:v1",
  operation: "ture:direct-spawn-driver-boundary:operation:v1",
  spawnSessionCapability: "ture:direct-spawn-driver-boundary:spawn-session-capability:v1",
  executableFixtureAuthority: "ture:direct-spawn-driver-boundary:executable-fixture-authority:v1",
  repositoryFixtureAuthority: "ture:direct-spawn-driver-boundary:repository-fixture-authority:v1",
  authorizationLink: "ture:direct-spawn-driver-boundary:authorization-link:v1",
  request: "ture:direct-spawn-driver-boundary:request:v1",
  plan: "ture:direct-spawn-driver-boundary:plan:v1",
  evidence: "ture:direct-spawn-driver-boundary:evidence:v1",
  compatibility: "ture:direct-spawn-driver-boundary:compatibility:v1",
  result: "ture:direct-spawn-driver-boundary:result:v1",
} as const);

const SPAWN_SESSION_PROVENANCE = new WeakSet<object>();
const EXECUTABLE_AUTHORITY_PROVENANCE = new WeakSet<object>();
const REPOSITORY_AUTHORITY_PROVENANCE = new WeakSet<object>();
const AUTHORIZATION_LINK_PROVENANCE = new WeakSet<object>();

export type DirectSpawnValidationResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; errors: readonly string[] }>;
export type DirectSpawnOperation = "collect_git_version" | "collect_supabase_cli_version";
export type DirectSpawnToolIdentity = "git" | "supabase_cli";
export type DirectSpawnEnvironmentMode = "empty_exact";
export type DirectSpawnStdinPolicy = "closed";
export type DirectSpawnStdoutPolicy = "bounded_sanitized_capture";
export type DirectSpawnStderrPolicy = "bounded_sanitized_capture";
export type FixtureOutputCaptureState =
  | "not_captured"
  | "modeled_within_limits"
  | "modeled_stdout_limit_exceeded"
  | "modeled_stderr_limit_exceeded"
  | "modeled_combined_limit_exceeded"
  | "modeled_invalid_encoding"
  | "modeled_binary_output"
  | "modeled_truncated"
  | "output_state_unknown";
export type FixtureTimeoutState = "not_started" | "modeled_completed_before_timeout" | "modeled_timeout_reached" | "modeled_timeout_state_unknown";
export type DirectSpawnFixtureLifecycleState =
  | "request_validated"
  | "fixture_plan_created"
  | "fixture_plan_blocked"
  | "fixture_plan_ambiguous"
  | "fixture_execution_not_started"
  | "expired"
  | "unsupported";
export type DirectSpawnAuthorityClassification = "fixture_structural_only" | "live_spawn_authorized";
export type DirectSpawnPlanCompleteness =
  | "complete_fixture_structure"
  | "incomplete_spawn_session"
  | "incomplete_executable_authority"
  | "incomplete_repository_authority"
  | "incomplete_authorization_link"
  | "incomplete_operation_binding"
  | "incomplete_output_policy"
  | "incomplete_timeout_policy"
  | "incomplete_termination_policy"
  | "incomplete_observer_policy"
  | "incomplete_freshness"
  | "incomplete_multiple"
  | "contradictory"
  | "unsupported";
export type DirectSpawnBlockingReason =
  | "request_invalid"
  | "request_expired"
  | "driver_identity_mismatch"
  | "driver_policy_unknown"
  | "operation_unknown"
  | "operation_tool_mismatch"
  | "operation_argv_mismatch"
  | "spawn_session_capability_invalid"
  | "spawn_session_capability_expired"
  | "executable_authority_invalid"
  | "executable_authority_expired"
  | "executable_authority_not_live"
  | "repository_authority_unexpected"
  | "repository_authority_required"
  | "repository_authority_invalid"
  | "repository_authority_expired"
  | "authorization_link_invalid"
  | "authorization_operation_mismatch"
  | "authorization_session_mismatch"
  | "session_mismatch"
  | "retry_not_allowed"
  | "attempt_must_be_one"
  | "shell_forbidden"
  | "arbitrary_command_forbidden"
  | "arbitrary_argv_forbidden"
  | "arbitrary_cwd_forbidden"
  | "environment_inheritance_forbidden"
  | "environment_override_forbidden"
  | "credentials_forbidden"
  | "stdin_forbidden"
  | "output_policy_mismatch"
  | "timeout_policy_mismatch"
  | "termination_policy_mismatch"
  | "observer_policy_mismatch"
  | "fixture_claimed_execution"
  | "fixture_claimed_process_spawn"
  | "fixture_claimed_pid"
  | "fixture_claimed_process_group"
  | "fixture_claimed_output_capture"
  | "fixture_claimed_timeout_schedule"
  | "fixture_claimed_signal"
  | "fixture_claimed_termination"
  | "fixture_claimed_authorization_consumption"
  | "fixture_claimed_runner_enablement";
export type DirectSpawnAmbiguityReason =
  | "spawn_session_incomplete"
  | "executable_authority_incomplete"
  | "repository_authority_incomplete"
  | "authorization_link_incomplete"
  | "operation_binding_incomplete"
  | "output_policy_incomplete"
  | "timeout_policy_incomplete"
  | "termination_policy_incomplete"
  | "observer_policy_incomplete"
  | "freshness_incomplete"
  | "session_consistency_uncertain"
  | "fixture_contradictory";

export type DirectSpawnPolicy = Readonly<{
  policyId: typeof DIRECT_SPAWN_DRIVER_POLICY_ID;
  operationScope: "first_live_read_only_staging_preflight";
  platform: "macos";
  executionModel: "direct_spawn";
  shellAllowed: false;
  oneShotOnly: true;
  retryPolicy: "none";
  oneActiveProcessOnly: true;
  arbitraryCommandsAllowed: false;
  arbitraryExecutablePathsAllowed: false;
  arbitraryArgumentsAllowed: false;
  arbitraryWorkingDirectoryAllowed: false;
  environmentInheritanceAllowed: false;
  environmentOverridesAllowed: false;
  credentialInjectionAllowed: false;
  stdinAllowed: false;
  stdoutCaptureMode: "bounded_sanitized";
  stderrCaptureMode: "bounded_sanitized";
  timeoutRequired: true;
  terminationPolicyRequired: true;
  processObserverRequiredForFutureLiveUse: true;
  exactExecutableAuthorityRequired: true;
  exactRepositoryAuthorityRequiredWhereApplicable: true;
  exactAuthorizationRequiredForFutureLiveUse: true;
  exactBoundarySessionRequired: true;
  freshCapabilitiesRequired: true;
  sameSessionRequired: true;
  fixtureMaySpawn: false;
  fixtureMayCreatePid: false;
  fixtureMayCreateProcessGroup: false;
  fixtureMaySendSignals: false;
  fixtureMayConsumeAuthorization: false;
  fixtureMayEnableRunner: false;
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
}>;

export type DirectSpawnOperationDefinition = Readonly<{
  operation: DirectSpawnOperation;
  toolIdentity: DirectSpawnToolIdentity;
  argv: readonly ["--version"];
  repositoryRequired: false;
  workingDirectoryMode: "none";
  environmentMode: DirectSpawnEnvironmentMode;
  environmentKeys: readonly [];
  inheritsParentEnvironment: false;
  stdinPolicy: DirectSpawnStdinPolicy;
  stdoutPolicy: DirectSpawnStdoutPolicy;
  stderrPolicy: DirectSpawnStderrPolicy;
  stdoutMaxBytes: 16384;
  stderrMaxBytes: 16384;
  combinedMaxBytes: 32768;
  outputEncoding: "utf8";
  binaryOutput: "reject";
  truncation: "fail_closed";
  timeoutPolicyId: typeof DIRECT_SPAWN_TIMEOUT_POLICY_ID;
  timeoutMs: 30000;
  terminationPolicyId: typeof DIRECT_SPAWN_TERMINATION_POLICY_ID;
  observerPolicyId: typeof SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID;
  parserPolicyId: "git_version_single_line_v1" | "supabase_cli_version_single_line_v1";
  credentialRequirement: "none";
  authorizationRequiredForFutureLiveUse: true;
  operationFingerprintAlgorithm: "sha256";
  operationFingerprint: string;
}>;

export type SpawnSessionCapability = Readonly<{
  capabilityKind: "spawn_session";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type FixtureExecutableSpawnAuthority = Readonly<{
  capabilityKind: "fixture_executable_spawn_authority";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  toolIdentity: DirectSpawnToolIdentity;
  structuralExecutableIdentityFingerprint: string;
  resolverEvidenceFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  authoritativeLive: false;
  enablesProcessStart: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type FixtureRepositorySpawnAuthority = Readonly<{
  capabilityKind: "fixture_repository_spawn_authority";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  structuralRepositoryIdentityFingerprint: string;
  resolverEvidenceFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  authoritativeLive: false;
  enablesWorkingDirectoryUse: false;
  enablesGitOperation: false;
  enablesProcessStart: false;
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type FixtureSpawnAuthorizationLink = Readonly<{
  linkKind: "fixture_spawn_authorization_link";
  linkVersion: 1;
  boundarySessionId: string;
  authorizationArtifactFingerprint: string;
  operation: DirectSpawnOperation;
  fixtureOnly: true;
  authorizationConsumed: false;
  authorizesLiveSpawn: false;
  linkFingerprintAlgorithm: "sha256";
  linkFingerprint: string;
}>;

export type DirectSpawnFixtureRequest = Readonly<{
  requestKind: "direct_spawn_fixture_request";
  requestVersion: 1;
  requestId: string;
  boundarySessionId: string;
  driverIdentityFingerprint: string;
  driverPolicyId: typeof DIRECT_SPAWN_DRIVER_POLICY_ID;
  operation: DirectSpawnOperation;
  spawnSessionCapability: SpawnSessionCapability;
  executableAuthority: FixtureExecutableSpawnAuthority;
  repositoryAuthority?: FixtureRepositorySpawnAuthority;
  authorizationLink: FixtureSpawnAuthorizationLink;
  requestedAt: string;
  expiresAt: string;
  attempt: 1;
  retryPolicy: "none";
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
}>;

export type SanitizedDirectSpawnFixturePlan = Readonly<{
  planKind: "sanitized_direct_spawn_fixture_plan";
  planVersion: 1;
  fixtureOnly: true;
  executionStarted: false;
  processSpawned: false;
  pidCreated: false;
  processGroupCreated: false;
  shellUsed: false;
  authorizationConsumed: false;
  credentialsAccessed: false;
  boundarySessionId: string;
  requestId: string;
  operation: DirectSpawnOperation;
  toolIdentity: DirectSpawnToolIdentity;
  argv: readonly ["--version"];
  workingDirectoryMode: "none";
  workingDirectory: null;
  environmentMode: DirectSpawnEnvironmentMode;
  environmentKeys: readonly [];
  inheritsParentEnvironment: false;
  stdinPolicy: DirectSpawnStdinPolicy;
  stdoutPolicy: DirectSpawnStdoutPolicy;
  stderrPolicy: DirectSpawnStderrPolicy;
  stdoutMaxBytes: 16384;
  stderrMaxBytes: 16384;
  combinedMaxBytes: 32768;
  timeoutPolicyId: string;
  terminationPolicyId: string;
  observerPolicyId: typeof SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID;
  authority: "fixture_structural_only";
  completeness: DirectSpawnPlanCompleteness;
  disposition: "compatible_fixture_plan" | "blocked_fixture_plan" | "ambiguous_fixture_plan";
  blockingReasons: readonly DirectSpawnBlockingReason[];
  ambiguityReasons: readonly DirectSpawnAmbiguityReason[];
  planFingerprintAlgorithm: "sha256";
  planFingerprint: string;
}>;

export type SanitizedDirectSpawnFixtureResultEvidence = Readonly<{
  evidenceKind: "sanitized_direct_spawn_fixture_result_evidence";
  evidenceVersion: 1;
  fixtureOnly: true;
  authoritativeLive: false;
  executionAttempted: false;
  executionStarted: false;
  processSpawned: false;
  pidCreated: false;
  processGroupCreated: false;
  outputCapturedLive: false;
  timeoutScheduled: false;
  terminationAttempted: false;
  signalsSent: false;
  terminationVerifiedLive: false;
  observerInvokedLive: false;
  authorizationConsumed: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  boundarySessionId: string;
  requestId: string;
  lifecycleState: DirectSpawnFixtureLifecycleState;
  authority: "fixture_structural_only";
  completeness: DirectSpawnPlanCompleteness;
  disposition: "compatible_fixture_no_execution" | "blocked_fixture_no_execution" | "ambiguous_fixture_no_execution";
  blockingReasons: readonly DirectSpawnBlockingReason[];
  ambiguityReasons: readonly DirectSpawnAmbiguityReason[];
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type DirectSpawnFixturePlanResult = Readonly<{
  resultKind: "direct_spawn_fixture_plan_result";
  resultVersion: 1;
  fixtureOnly: true;
  authoritativeLive: false;
  executionAttempted: false;
  processSpawned: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  plan: SanitizedDirectSpawnFixturePlan;
  evidence: SanitizedDirectSpawnFixtureResultEvidence;
  compatibility: ReturnType<typeof buildDirectSpawnCompatibilitySummary>;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export type DirectSpawnFixtureDriverAdapter = Readonly<{
  identity: typeof DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY;
  fixtureOnly: true;
  createFixturePlan(input: Readonly<{ request: DirectSpawnFixtureRequest; evaluatedAt: string }>): DirectSpawnFixturePlanResult;
}>;

export function buildDirectSpawnDriverIdentityFingerprint(input: unknown = DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY): string {
  return fingerprint(DIRECT_SPAWN_FINGERPRINT_DOMAINS.identity, input);
}

export function buildDirectSpawnPolicy(): DirectSpawnPolicy {
  const core = {
    policyId: DIRECT_SPAWN_DRIVER_POLICY_ID,
    operationScope: "first_live_read_only_staging_preflight",
    platform: "macos",
    executionModel: "direct_spawn",
    shellAllowed: false,
    oneShotOnly: true,
    retryPolicy: "none",
    oneActiveProcessOnly: true,
    arbitraryCommandsAllowed: false,
    arbitraryExecutablePathsAllowed: false,
    arbitraryArgumentsAllowed: false,
    arbitraryWorkingDirectoryAllowed: false,
    environmentInheritanceAllowed: false,
    environmentOverridesAllowed: false,
    credentialInjectionAllowed: false,
    stdinAllowed: false,
    stdoutCaptureMode: "bounded_sanitized",
    stderrCaptureMode: "bounded_sanitized",
    timeoutRequired: true,
    terminationPolicyRequired: true,
    processObserverRequiredForFutureLiveUse: true,
    exactExecutableAuthorityRequired: true,
    exactRepositoryAuthorityRequiredWhereApplicable: true,
    exactAuthorizationRequiredForFutureLiveUse: true,
    exactBoundarySessionRequired: true,
    freshCapabilitiesRequired: true,
    sameSessionRequired: true,
    fixtureMaySpawn: false,
    fixtureMayCreatePid: false,
    fixtureMayCreateProcessGroup: false,
    fixtureMaySendSignals: false,
    fixtureMayConsumeAuthorization: false,
    fixtureMayEnableRunner: false,
  } satisfies Omit<DirectSpawnPolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return freezeWithFingerprint(core, DIRECT_SPAWN_FINGERPRINT_DOMAINS.policy, "policyFingerprint");
}

export function buildDirectSpawnOperationRegistry(): readonly DirectSpawnOperationDefinition[] {
  return deepFreeze([
    buildDirectSpawnOperationDefinition("collect_git_version"),
    buildDirectSpawnOperationDefinition("collect_supabase_cli_version"),
  ] as const);
}

export function buildDirectSpawnOperationDefinition(operation: DirectSpawnOperation): DirectSpawnOperationDefinition {
  const core = {
    operation,
    toolIdentity: operation === "collect_git_version" ? "git" : "supabase_cli",
    argv: ["--version"] as const,
    repositoryRequired: false,
    workingDirectoryMode: "none",
    environmentMode: "empty_exact",
    environmentKeys: [] as const,
    inheritsParentEnvironment: false,
    stdinPolicy: "closed",
    stdoutPolicy: "bounded_sanitized_capture",
    stderrPolicy: "bounded_sanitized_capture",
    stdoutMaxBytes: 16384,
    stderrMaxBytes: 16384,
    combinedMaxBytes: 32768,
    outputEncoding: "utf8",
    binaryOutput: "reject",
    truncation: "fail_closed",
    timeoutPolicyId: DIRECT_SPAWN_TIMEOUT_POLICY_ID,
    timeoutMs: 30000,
    terminationPolicyId: DIRECT_SPAWN_TERMINATION_POLICY_ID,
    observerPolicyId: SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID,
    parserPolicyId: operation === "collect_git_version" ? "git_version_single_line_v1" : "supabase_cli_version_single_line_v1",
    credentialRequirement: "none",
    authorizationRequiredForFutureLiveUse: true,
  } satisfies Omit<DirectSpawnOperationDefinition, "operationFingerprintAlgorithm" | "operationFingerprint">;
  return freezeWithFingerprint(core, DIRECT_SPAWN_FINGERPRINT_DOMAINS.operation, "operationFingerprint");
}

export function buildSpawnSessionCapability(input: Partial<SpawnSessionCapability> = {}): SpawnSessionCapability {
  const core = {
    capabilityKind: "spawn_session",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? "fixture_spawn_session_capability_001",
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    issuedAt: input.issuedAt ?? DIRECT_SPAWN_ISSUED_AT,
    expiresAt: input.expiresAt ?? DIRECT_SPAWN_EXPIRES_AT,
    fixtureOnly: true,
  } satisfies Omit<SpawnSessionCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = freezeWithFingerprint(core, DIRECT_SPAWN_FINGERPRINT_DOMAINS.spawnSessionCapability, "capabilityFingerprint");
  SPAWN_SESSION_PROVENANCE.add(capability);
  return capability;
}

export function buildFixtureExecutableSpawnAuthority(input: Partial<FixtureExecutableSpawnAuthority> = {}): FixtureExecutableSpawnAuthority {
  const toolIdentity = input.toolIdentity ?? "git";
  const core = {
    capabilityKind: "fixture_executable_spawn_authority",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? `fixture_executable_spawn_authority_${toolIdentity}_001`,
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    toolIdentity,
    structuralExecutableIdentityFingerprint: input.structuralExecutableIdentityFingerprint ?? sha256(`fixture:${toolIdentity}:structural-executable`),
    resolverEvidenceFingerprint: input.resolverEvidenceFingerprint ?? sha256(`${TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY.resolverId}:${toolIdentity}:evidence`),
    issuedAt: input.issuedAt ?? DIRECT_SPAWN_ISSUED_AT,
    expiresAt: input.expiresAt ?? DIRECT_SPAWN_EXPIRES_AT,
    fixtureOnly: true,
    authoritativeLive: false,
    enablesProcessStart: false,
  } satisfies Omit<FixtureExecutableSpawnAuthority, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = freezeWithFingerprint(core, DIRECT_SPAWN_FINGERPRINT_DOMAINS.executableFixtureAuthority, "capabilityFingerprint");
  EXECUTABLE_AUTHORITY_PROVENANCE.add(capability);
  return capability;
}

export function buildFixtureRepositorySpawnAuthority(input: Partial<FixtureRepositorySpawnAuthority> = {}): FixtureRepositorySpawnAuthority {
  const core = {
    capabilityKind: "fixture_repository_spawn_authority",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? "fixture_repository_spawn_authority_001",
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    structuralRepositoryIdentityFingerprint: input.structuralRepositoryIdentityFingerprint ?? sha256("fixture:reviewed-repository:structural-root"),
    resolverEvidenceFingerprint: input.resolverEvidenceFingerprint ?? sha256(`${TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY.resolverId}:repository:evidence`),
    issuedAt: input.issuedAt ?? DIRECT_SPAWN_ISSUED_AT,
    expiresAt: input.expiresAt ?? DIRECT_SPAWN_EXPIRES_AT,
    fixtureOnly: true,
    authoritativeLive: false,
    enablesWorkingDirectoryUse: false,
    enablesGitOperation: false,
    enablesProcessStart: false,
  } satisfies Omit<FixtureRepositorySpawnAuthority, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = freezeWithFingerprint(core, DIRECT_SPAWN_FINGERPRINT_DOMAINS.repositoryFixtureAuthority, "capabilityFingerprint");
  REPOSITORY_AUTHORITY_PROVENANCE.add(capability);
  return capability;
}

export function buildFixtureSpawnAuthorizationLink(operation: DirectSpawnOperation = "collect_git_version", input: Partial<FixtureSpawnAuthorizationLink> = {}): FixtureSpawnAuthorizationLink {
  const core = {
    linkKind: "fixture_spawn_authorization_link",
    linkVersion: 1,
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    authorizationArtifactFingerprint: input.authorizationArtifactFingerprint ?? sha256(`fixture:authorization:${operation}`),
    operation: input.operation ?? operation,
    fixtureOnly: true,
    authorizationConsumed: false,
    authorizesLiveSpawn: false,
  } satisfies Omit<FixtureSpawnAuthorizationLink, "linkFingerprintAlgorithm" | "linkFingerprint">;
  const link = freezeWithFingerprint(core, DIRECT_SPAWN_FINGERPRINT_DOMAINS.authorizationLink, "linkFingerprint");
  AUTHORIZATION_LINK_PROVENANCE.add(link);
  return link;
}

export function buildDirectSpawnFixtureRequest(input: Partial<DirectSpawnFixtureRequest> = {}): DirectSpawnFixtureRequest {
  const operation = input.operation ?? "collect_git_version";
  const operationDefinition = buildDirectSpawnOperationDefinition(operation);
  const session = input.spawnSessionCapability ?? buildSpawnSessionCapability();
  const executableAuthority = input.executableAuthority ?? buildFixtureExecutableSpawnAuthority({ boundarySessionId: session.boundarySessionId, toolIdentity: operationDefinition.toolIdentity });
  const core = {
    requestKind: "direct_spawn_fixture_request",
    requestVersion: 1,
    requestId: input.requestId ?? `direct_spawn_fixture_request_${operation}_001`,
    boundarySessionId: input.boundarySessionId ?? session.boundarySessionId,
    driverIdentityFingerprint: input.driverIdentityFingerprint ?? buildDirectSpawnDriverIdentityFingerprint(),
    driverPolicyId: input.driverPolicyId ?? DIRECT_SPAWN_DRIVER_POLICY_ID,
    operation,
    spawnSessionCapability: session,
    executableAuthority,
    ...(input.repositoryAuthority ? { repositoryAuthority: input.repositoryAuthority } : {}),
    authorizationLink: input.authorizationLink ?? buildFixtureSpawnAuthorizationLink(operation, { boundarySessionId: session.boundarySessionId }),
    requestedAt: input.requestedAt ?? DIRECT_SPAWN_ISSUED_AT,
    expiresAt: input.expiresAt ?? DIRECT_SPAWN_EXPIRES_AT,
    attempt: 1,
    retryPolicy: "none",
  } satisfies Omit<DirectSpawnFixtureRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return freezeWithFingerprint(core, DIRECT_SPAWN_FINGERPRINT_DOMAINS.request, "requestFingerprint");
}

export function buildDirectSpawnFixtureDriverAdapter(): DirectSpawnFixtureDriverAdapter {
  return deepFreeze({
    identity: DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY,
    fixtureOnly: true,
    createFixturePlan: ({ request, evaluatedAt }) => createFixturePlan({ request, evaluatedAt }),
  });
}

export function buildDirectSpawnCompatibilitySummary() {
  const core = {
    compatibilityKind: "direct_spawn_driver_boundary_compatibility",
    fixtureOnly: true,
    trustedResolver: "fixture_authority_structurally_linked_but_not_live_executable_authority",
    processExecutor: "fixture_plan_structurally_compatible_but_not_executor_invoking",
    liveDriverDesign: "direct_spawn_model_compatible_but_execution_disabled",
    processObserver: "observer_policy_linked_but_not_invoked",
    cliVersionCollector: "version_operations_linked_but_not_run",
    credentialBoundary: "first_operations_require_no_credentials",
    authorization: "fixture_link_does_not_consume_or_grant_live_authorization",
    runner: "fixture_direct_spawn_plan_structurally_compatible_but_not_live_runner_enabling",
    enablesExecution: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
  } as const;
  return freezeWithFingerprint(core, DIRECT_SPAWN_FINGERPRINT_DOMAINS.compatibility, "compatibilityFingerprint");
}

export function buildDirectSpawnFutureLiveDriverPlan() {
  return deepFreeze({
    planKind: "direct_spawn_future_live_driver_plan",
    fixtureOnly: true,
    liveDriverPresent: false,
    selectedSpawnApi: "not_selected",
    requiresChildProcessSpawnReview: true,
    requiresRawExecutablePathContainmentReview: true,
    requiresCwdContainmentReview: true,
    requiresEnvironmentConstructionReview: true,
    requiresStdioImplementationReview: true,
    requiresOutputBoundsReview: true,
    requiresTimeoutImplementationReview: true,
    requiresProcessGroupBehaviorReview: true,
    requiresSignalHandlingReview: true,
    requiresObserverIntegrationReview: true,
    requiresCredentialHandlingReview: true,
    requiresAuthorizationConsumptionReview: true,
    requiresTocTouMitigationReview: true,
    requiresMacosCompatibilityReview: true,
    requiresStagingExecutionGate: true,
    requiresFinalLiveGate: true,
  } as const);
}

export function validateDirectSpawnDriverIdentity(input: unknown): DirectSpawnValidationResult<typeof DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY> {
  return exact(input, DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY, "driver_identity");
}

export function validateDirectSpawnPolicy(input: unknown): DirectSpawnValidationResult<DirectSpawnPolicy> {
  return exact(input, buildDirectSpawnPolicy(), "spawn_policy", "policyFingerprint", "policyFingerprintAlgorithm", DIRECT_SPAWN_FINGERPRINT_DOMAINS.policy);
}

export function validateDirectSpawnOperationDefinition(input: unknown): DirectSpawnValidationResult<DirectSpawnOperationDefinition> {
  if (!isRecord(input) || !isDirectSpawnOperation(input.operation)) return invalid("operation_unknown");
  return exact(input, buildDirectSpawnOperationDefinition(input.operation), "operation", "operationFingerprint", "operationFingerprintAlgorithm", DIRECT_SPAWN_FINGERPRINT_DOMAINS.operation);
}

export function validateSpawnSessionCapability(input: unknown, evaluatedAt: string = DIRECT_SPAWN_EVALUATED_AT): DirectSpawnValidationResult<SpawnSessionCapability> {
  const errors = validateFingerprintShape(input, "spawn_session_capability", "capabilityFingerprint", "capabilityFingerprintAlgorithm", DIRECT_SPAWN_FINGERPRINT_DOMAINS.spawnSessionCapability);
  if (!isRecord(input)) return invalid("spawn_session_capability_invalid");
  if (!SPAWN_SESSION_PROVENANCE.has(input)) errors.push("spawn_session_capability_invalid");
  if (input.capabilityKind !== "spawn_session" || input.capabilityVersion !== 1 || input.fixtureOnly !== true) errors.push("spawn_session_capability_invalid");
  if (!isCapabilityId(input.capabilityId, "fixture_spawn_session_capability_")) errors.push("spawn_session_capability_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  validateTime(input.issuedAt, input.expiresAt, evaluatedAt, errors, "spawn_session_capability_expired");
  if (hasUnsafeInput(pickUnknown(input, SPAWN_SESSION_KEYS))) errors.push("request_invalid");
  return validation(input, errors);
}

export function validateFixtureExecutableSpawnAuthority(input: unknown, operation: DirectSpawnOperation = "collect_git_version", evaluatedAt: string = DIRECT_SPAWN_EVALUATED_AT): DirectSpawnValidationResult<FixtureExecutableSpawnAuthority> {
  const errors = validateFingerprintShape(input, "executable_authority", "capabilityFingerprint", "capabilityFingerprintAlgorithm", DIRECT_SPAWN_FINGERPRINT_DOMAINS.executableFixtureAuthority);
  if (!isRecord(input)) return invalid("executable_authority_invalid");
  const expected = buildDirectSpawnOperationDefinition(operation);
  if (!EXECUTABLE_AUTHORITY_PROVENANCE.has(input)) errors.push("executable_authority_invalid");
  if (input.capabilityKind !== "fixture_executable_spawn_authority" || input.capabilityVersion !== 1 || input.fixtureOnly !== true) errors.push("executable_authority_invalid");
  if (!isCapabilityId(input.capabilityId, "fixture_executable_spawn_authority_")) errors.push("executable_authority_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (input.toolIdentity !== expected.toolIdentity) errors.push("operation_tool_mismatch");
  if (input.authoritativeLive !== false) errors.push("executable_authority_invalid");
  if (input.enablesProcessStart !== false) errors.push("fixture_claimed_process_spawn");
  validateTime(input.issuedAt, input.expiresAt, evaluatedAt, errors, "executable_authority_expired");
  if (hasUnsafeInput(pickUnknown(input, EXECUTABLE_AUTHORITY_KEYS))) errors.push("request_invalid");
  return validation(input, errors);
}

export function validateFixtureRepositorySpawnAuthority(input: unknown, evaluatedAt: string = DIRECT_SPAWN_EVALUATED_AT): DirectSpawnValidationResult<FixtureRepositorySpawnAuthority> {
  const errors = validateFingerprintShape(input, "repository_authority", "capabilityFingerprint", "capabilityFingerprintAlgorithm", DIRECT_SPAWN_FINGERPRINT_DOMAINS.repositoryFixtureAuthority);
  if (!isRecord(input)) return invalid("repository_authority_invalid");
  if (!REPOSITORY_AUTHORITY_PROVENANCE.has(input)) errors.push("repository_authority_invalid");
  if (input.capabilityKind !== "fixture_repository_spawn_authority" || input.capabilityVersion !== 1 || input.fixtureOnly !== true) errors.push("repository_authority_invalid");
  if (!isCapabilityId(input.capabilityId, "fixture_repository_spawn_authority_")) errors.push("repository_authority_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (input.authoritativeLive !== false || input.enablesWorkingDirectoryUse !== false || input.enablesGitOperation !== false || input.enablesProcessStart !== false) errors.push("repository_authority_invalid");
  validateTime(input.issuedAt, input.expiresAt, evaluatedAt, errors, "repository_authority_expired");
  if (hasUnsafeInput(pickUnknown(input, REPOSITORY_AUTHORITY_KEYS))) errors.push("request_invalid");
  return validation(input, errors);
}

export function validateFixtureSpawnAuthorizationLink(input: unknown, operation: DirectSpawnOperation = "collect_git_version"): DirectSpawnValidationResult<FixtureSpawnAuthorizationLink> {
  const errors = validateFingerprintShape(input, "authorization_link", "linkFingerprint", "linkFingerprintAlgorithm", DIRECT_SPAWN_FINGERPRINT_DOMAINS.authorizationLink);
  if (!isRecord(input)) return invalid("authorization_link_invalid");
  if (!AUTHORIZATION_LINK_PROVENANCE.has(input)) errors.push("authorization_link_invalid");
  if (input.linkKind !== "fixture_spawn_authorization_link" || input.linkVersion !== 1 || input.fixtureOnly !== true) errors.push("authorization_link_invalid");
  if (input.operation !== operation) errors.push("authorization_operation_mismatch");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("authorization_session_mismatch");
  if (!isSha256(input.authorizationArtifactFingerprint)) errors.push("authorization_link_invalid");
  if (input.authorizationConsumed !== false) errors.push("fixture_claimed_authorization_consumption");
  if (input.authorizesLiveSpawn !== false) errors.push("authorization_link_invalid");
  if (hasUnsafeInput(pickUnknown(input, AUTHORIZATION_LINK_KEYS))) errors.push("request_invalid");
  return validation(input, errors);
}

export function validateDirectSpawnFixtureRequest(input: unknown, evaluatedAt: string = DIRECT_SPAWN_EVALUATED_AT): DirectSpawnValidationResult<DirectSpawnFixtureRequest> {
  const errors = validateFingerprintShape(input, "request", "requestFingerprint", "requestFingerprintAlgorithm", DIRECT_SPAWN_FINGERPRINT_DOMAINS.request);
  if (!isRecord(input)) return invalid("request_invalid");
  if (input.requestKind !== "direct_spawn_fixture_request" || input.requestVersion !== 1) errors.push("request_invalid");
  if (!isRequestId(input.requestId)) errors.push("request_invalid");
  if (input.boundarySessionId !== POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION) errors.push("session_mismatch");
  if (input.driverIdentityFingerprint !== buildDirectSpawnDriverIdentityFingerprint()) errors.push("driver_identity_mismatch");
  if (input.driverPolicyId !== DIRECT_SPAWN_DRIVER_POLICY_ID) errors.push("driver_policy_unknown");
  if (!isDirectSpawnOperation(input.operation)) errors.push("operation_unknown");
  const operation = isDirectSpawnOperation(input.operation) ? input.operation : "collect_git_version";
  errors.push(...validationErrors(validateSpawnSessionCapability(input.spawnSessionCapability, evaluatedAt)));
  errors.push(...validationErrors(validateFixtureExecutableSpawnAuthority(input.executableAuthority, operation, evaluatedAt)));
  if (input.repositoryAuthority !== undefined) errors.push("repository_authority_unexpected");
  errors.push(...validationErrors(validateFixtureSpawnAuthorizationLink(input.authorizationLink, operation)));
  if (isRecord(input.spawnSessionCapability) && input.boundarySessionId !== input.spawnSessionCapability.boundarySessionId) errors.push("session_mismatch");
  if (isRecord(input.executableAuthority) && input.boundarySessionId !== input.executableAuthority.boundarySessionId) errors.push("session_mismatch");
  if (isRecord(input.authorizationLink) && input.boundarySessionId !== input.authorizationLink.boundarySessionId) errors.push("authorization_session_mismatch");
  if (input.attempt !== 1) errors.push("attempt_must_be_one");
  if (input.retryPolicy !== "none") errors.push("retry_not_allowed");
  validateTime(input.requestedAt, input.expiresAt, evaluatedAt, errors, "request_expired");
  for (const key of Object.keys(input)) if (!REQUEST_KEYS.has(key)) errors.push(`unknown_request_field:${key}`);
  if (hasUnsafeInput(pickUnknown(input, REQUEST_KEYS))) errors.push("request_invalid");
  return validation(input, errors);
}

export function validateExactArgvForOperation(operation: DirectSpawnOperation, argv: unknown): DirectSpawnValidationResult<readonly ["--version"]> {
  const expected = buildDirectSpawnOperationDefinition(operation).argv;
  const errors: string[] = [];
  if (!Array.isArray(argv) || safeStringify(argv) !== safeStringify(expected)) errors.push("operation_argv_mismatch");
  if (hasUnsafeArgv(argv)) errors.push("arbitrary_argv_forbidden");
  return validation(expected, errors);
}

function createFixturePlan(input: Readonly<{ request: DirectSpawnFixtureRequest; evaluatedAt: string }>): DirectSpawnFixturePlanResult {
  const requestValidation = validateDirectSpawnFixtureRequest(input.request, input.evaluatedAt);
  const blocking = requestValidation.ok ? [] : mapBlockingReasons(requestValidation.errors);
  const ambiguity: DirectSpawnAmbiguityReason[] = [];
  const operation = isDirectSpawnOperation(input.request?.operation) ? input.request.operation : "collect_git_version";
  const definition = buildDirectSpawnOperationDefinition(operation);
  if (definition.observerPolicyId !== SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID) blocking.push("observer_policy_mismatch");
  if (definition.timeoutPolicyId !== DIRECT_SPAWN_TIMEOUT_POLICY_ID) blocking.push("timeout_policy_mismatch");
  if (definition.terminationPolicyId !== DIRECT_SPAWN_TERMINATION_POLICY_ID) blocking.push("termination_policy_mismatch");
  const completeness = deriveCompleteness(blocking, ambiguity);
  const disposition = blocking.length > 0 ? "blocked_fixture_plan" : ambiguity.length > 0 ? "ambiguous_fixture_plan" : "compatible_fixture_plan";
  const evidenceDisposition = blocking.length > 0 ? "blocked_fixture_no_execution" : ambiguity.length > 0 ? "ambiguous_fixture_no_execution" : "compatible_fixture_no_execution";
  const lifecycleState: DirectSpawnFixtureLifecycleState = blocking.length > 0 ? "fixture_plan_blocked" : ambiguity.length > 0 ? "fixture_plan_ambiguous" : "fixture_execution_not_started";
  const planCore = {
    planKind: "sanitized_direct_spawn_fixture_plan",
    planVersion: 1,
    fixtureOnly: true,
    executionStarted: false,
    processSpawned: false,
    pidCreated: false,
    processGroupCreated: false,
    shellUsed: false,
    authorizationConsumed: false,
    credentialsAccessed: false,
    boundarySessionId: input.request.boundarySessionId,
    requestId: input.request.requestId,
    operation,
    toolIdentity: definition.toolIdentity,
    argv: definition.argv,
    workingDirectoryMode: "none",
    workingDirectory: null,
    environmentMode: "empty_exact",
    environmentKeys: [] as const,
    inheritsParentEnvironment: false,
    stdinPolicy: "closed",
    stdoutPolicy: "bounded_sanitized_capture",
    stderrPolicy: "bounded_sanitized_capture",
    stdoutMaxBytes: 16384,
    stderrMaxBytes: 16384,
    combinedMaxBytes: 32768,
    timeoutPolicyId: definition.timeoutPolicyId,
    terminationPolicyId: definition.terminationPolicyId,
    observerPolicyId: definition.observerPolicyId,
    authority: "fixture_structural_only",
    completeness,
    disposition,
    blockingReasons: sorted(blocking),
    ambiguityReasons: sorted(ambiguity),
  } satisfies Omit<SanitizedDirectSpawnFixturePlan, "planFingerprintAlgorithm" | "planFingerprint">;
  const plan = freezeWithFingerprint(planCore, DIRECT_SPAWN_FINGERPRINT_DOMAINS.plan, "planFingerprint");
  const evidenceCore = {
    evidenceKind: "sanitized_direct_spawn_fixture_result_evidence",
    evidenceVersion: 1,
    fixtureOnly: true,
    authoritativeLive: false,
    executionAttempted: false,
    executionStarted: false,
    processSpawned: false,
    pidCreated: false,
    processGroupCreated: false,
    outputCapturedLive: false,
    timeoutScheduled: false,
    terminationAttempted: false,
    signalsSent: false,
    terminationVerifiedLive: false,
    observerInvokedLive: false,
    authorizationConsumed: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    boundarySessionId: input.request.boundarySessionId,
    requestId: input.request.requestId,
    lifecycleState,
    authority: "fixture_structural_only",
    completeness,
    disposition: evidenceDisposition,
    blockingReasons: sorted(blocking),
    ambiguityReasons: sorted(ambiguity),
  } satisfies Omit<SanitizedDirectSpawnFixtureResultEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  const evidence = freezeWithFingerprint(evidenceCore, DIRECT_SPAWN_FINGERPRINT_DOMAINS.evidence, "evidenceFingerprint");
  const compatibility = buildDirectSpawnCompatibilitySummary();
  const resultCore = {
    resultKind: "direct_spawn_fixture_plan_result",
    resultVersion: 1,
    fixtureOnly: true,
    authoritativeLive: false,
    executionAttempted: false,
    processSpawned: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    plan,
    evidence,
    compatibility,
  } satisfies Omit<DirectSpawnFixturePlanResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return freezeWithFingerprint(resultCore, DIRECT_SPAWN_FINGERPRINT_DOMAINS.result, "resultFingerprint");
}

function deriveCompleteness(blocking: readonly string[], ambiguity: readonly string[]): DirectSpawnPlanCompleteness {
  const missing = new Set<DirectSpawnPlanCompleteness>();
  if (blocking.includes("spawn_session_capability_invalid") || ambiguity.includes("spawn_session_incomplete")) missing.add("incomplete_spawn_session");
  if (blocking.includes("executable_authority_invalid") || blocking.includes("operation_tool_mismatch") || ambiguity.includes("executable_authority_incomplete")) missing.add("incomplete_executable_authority");
  if (blocking.includes("repository_authority_required") || blocking.includes("repository_authority_invalid") || ambiguity.includes("repository_authority_incomplete")) missing.add("incomplete_repository_authority");
  if (blocking.includes("authorization_link_invalid") || ambiguity.includes("authorization_link_incomplete")) missing.add("incomplete_authorization_link");
  if (blocking.includes("operation_unknown") || blocking.includes("operation_argv_mismatch") || ambiguity.includes("operation_binding_incomplete")) missing.add("incomplete_operation_binding");
  if (blocking.includes("output_policy_mismatch") || ambiguity.includes("output_policy_incomplete")) missing.add("incomplete_output_policy");
  if (blocking.includes("timeout_policy_mismatch") || ambiguity.includes("timeout_policy_incomplete")) missing.add("incomplete_timeout_policy");
  if (blocking.includes("termination_policy_mismatch") || ambiguity.includes("termination_policy_incomplete")) missing.add("incomplete_termination_policy");
  if (blocking.includes("observer_policy_mismatch") || ambiguity.includes("observer_policy_incomplete")) missing.add("incomplete_observer_policy");
  if (blocking.includes("request_expired") || blocking.includes("spawn_session_capability_expired") || blocking.includes("executable_authority_expired") || ambiguity.includes("freshness_incomplete")) missing.add("incomplete_freshness");
  if (blocking.includes("session_mismatch") || blocking.includes("authorization_session_mismatch")) return "contradictory";
  if (missing.size > 1) return "incomplete_multiple";
  return missing.values().next().value ?? "complete_fixture_structure";
}

const REQUEST_KEYS = new Set([
  "requestKind",
  "requestVersion",
  "requestId",
  "boundarySessionId",
  "driverIdentityFingerprint",
  "driverPolicyId",
  "operation",
  "spawnSessionCapability",
  "executableAuthority",
  "repositoryAuthority",
  "authorizationLink",
  "requestedAt",
  "expiresAt",
  "attempt",
  "retryPolicy",
  "requestFingerprintAlgorithm",
  "requestFingerprint",
]);

const SPAWN_SESSION_KEYS = new Set([
  "capabilityKind",
  "capabilityVersion",
  "capabilityId",
  "boundarySessionId",
  "issuedAt",
  "expiresAt",
  "fixtureOnly",
  "capabilityFingerprintAlgorithm",
  "capabilityFingerprint",
]);

const EXECUTABLE_AUTHORITY_KEYS = new Set([
  "capabilityKind",
  "capabilityVersion",
  "capabilityId",
  "boundarySessionId",
  "toolIdentity",
  "structuralExecutableIdentityFingerprint",
  "resolverEvidenceFingerprint",
  "issuedAt",
  "expiresAt",
  "fixtureOnly",
  "authoritativeLive",
  "enablesProcessStart",
  "capabilityFingerprintAlgorithm",
  "capabilityFingerprint",
]);

const REPOSITORY_AUTHORITY_KEYS = new Set([
  "capabilityKind",
  "capabilityVersion",
  "capabilityId",
  "boundarySessionId",
  "structuralRepositoryIdentityFingerprint",
  "resolverEvidenceFingerprint",
  "issuedAt",
  "expiresAt",
  "fixtureOnly",
  "authoritativeLive",
  "enablesWorkingDirectoryUse",
  "enablesGitOperation",
  "enablesProcessStart",
  "capabilityFingerprintAlgorithm",
  "capabilityFingerprint",
]);

const AUTHORIZATION_LINK_KEYS = new Set([
  "linkKind",
  "linkVersion",
  "boundarySessionId",
  "authorizationArtifactFingerprint",
  "operation",
  "fixtureOnly",
  "authorizationConsumed",
  "authorizesLiveSpawn",
  "linkFingerprintAlgorithm",
  "linkFingerprint",
]);

function validateFingerprintShape(input: unknown, prefix: string, fingerprintKey: string, algorithmKey: string, domain: string): string[] {
  const errors: string[] = [];
  if (!isRecord(input)) return [`${prefix}_invalid`];
  if (input[algorithmKey] !== "sha256") errors.push("fingerprint_invalid");
  if (!isSha256(input[fingerprintKey])) errors.push("fingerprint_invalid");
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  const expected = safeFingerprint(domain, core);
  if (!expected || input[fingerprintKey] !== expected) errors.push("fingerprint_invalid");
  return errors;
}

function exact<T>(input: unknown, expected: T, prefix: string, fingerprintKey?: string, algorithmKey?: string, domain?: string): DirectSpawnValidationResult<T> {
  const errors: string[] = [];
  if (!isRecord(input) || !isRecord(expected)) return invalid(`${prefix}_invalid`);
  for (const key of Object.keys(input)) if (!Object.keys(expected).includes(key)) errors.push(`unknown_${prefix}_field:${key}`);
  for (const key of Object.keys(expected)) if (!Object.keys(input).includes(key)) errors.push(`missing_${prefix}_field:${key}`);
  if (fingerprintKey && algorithmKey && domain) errors.push(...validateFingerprintShape(input, prefix, fingerprintKey, algorithmKey, domain));
  const inputJson = safeStringify(input);
  const expectedJson = safeStringify(expected);
  if (!inputJson || !expectedJson || inputJson !== expectedJson) errors.push(`${prefix}_not_exact`);
  if (hasUnsafeInput(pickUnknown(input, new Set(Object.keys(expected))))) errors.push("request_invalid");
  return validation(input, errors);
}

function hasUnsafeArgv(input: unknown): boolean {
  if (!Array.isArray(input)) return true;
  return input.some((value) => typeof value !== "string" || value.length === 0 || /[\0\r\n;&|`*?[\]\uFF06\uFF1B\uFF5C]/u.test(value) || value.includes("$(") || value.startsWith("@") || value.includes("$"));
}

function hasUnsafeInput(input: unknown): boolean {
  const prohibited = new Set([
    "pid",
    "ppid",
    "pgid",
    "processId",
    "processGroupId",
    "command",
    "commandLine",
    "shell",
    "shellCommand",
    "executablePath",
    "cwd",
    "workingDirectory",
    "env",
    "environment",
    "PATH",
    "stdin",
    "stdio",
    "spawn",
    "fork",
    "exec",
    "execFile",
    "signal",
    "kill",
    "terminate",
    "timeoutHandle",
    "credentials",
    "authorized",
    "token",
    "secret",
    "executionAttempted",
    "authorizationConsumed",
    "executionStarted",
    "processSpawned",
    "pidCreated",
    "processGroupCreated",
    "enablesProcessStart",
    "enablesPreflightRunner",
    "safe",
    "authority",
    "completeness",
  ]);
  const seen = new WeakSet<object>();
  let nodes = 0;
  const visit = (value: unknown, depth: number): boolean => {
    if (depth > 24 || nodes > 512) return true;
    if (typeof value === "string") return hasSensitiveMaterial(value);
    if (typeof value === "function" || typeof value === "symbol") return true;
    if (value === null || typeof value !== "object") return false;
    if (seen.has(value)) return false;
    seen.add(value);
    nodes += 1;
    if (Array.isArray(value)) return value.some((item) => visit(item, depth + 1));
    const record = value as Record<string, unknown>;
    return Object.keys(record).some((key) => prohibited.has(key) || visit(record[key], depth + 1));
  };
  return visit(input, 0);
}

function hasSensitiveMaterial(input: string): boolean {
  return /\b(bearer|token|secret|password|credential|cookie|session|bankid|jwt)\b/iu.test(input) || /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/u.test(input);
}

function pickUnknown(input: Record<string, unknown>, allowed: Set<string>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([key]) => !allowed.has(key)));
}

function validateTime(issuedAt: unknown, expiresAt: unknown, evaluatedAt: string, errors: string[], expiredReason: string): void {
  if (!isIso(issuedAt) || !isIso(expiresAt) || !isIso(evaluatedAt)) {
    errors.push("request_invalid");
    return;
  }
  if (expiresAt <= issuedAt || evaluatedAt > expiresAt) errors.push(expiredReason);
}

function validation<T>(input: unknown, errors: readonly string[]): DirectSpawnValidationResult<T> {
  if (errors.length > 0) return deepFreeze({ ok: false, errors: sorted(errors) });
  return deepFreeze({ ok: true, value: input as T });
}

function invalid<T>(error: string): DirectSpawnValidationResult<T> {
  return deepFreeze({ ok: false, errors: [error] });
}

function validationErrors(result: DirectSpawnValidationResult<unknown>): readonly DirectSpawnBlockingReason[] {
  return result.ok ? [] : mapBlockingReasons(result.errors);
}

const DIRECT_SPAWN_BLOCKING_REASON_VALUES = [
  "request_invalid",
  "request_expired",
  "driver_identity_mismatch",
  "driver_policy_unknown",
  "operation_unknown",
  "operation_tool_mismatch",
  "operation_argv_mismatch",
  "spawn_session_capability_invalid",
  "spawn_session_capability_expired",
  "executable_authority_invalid",
  "executable_authority_expired",
  "executable_authority_not_live",
  "repository_authority_unexpected",
  "repository_authority_required",
  "repository_authority_invalid",
  "repository_authority_expired",
  "authorization_link_invalid",
  "authorization_operation_mismatch",
  "authorization_session_mismatch",
  "session_mismatch",
  "retry_not_allowed",
  "attempt_must_be_one",
  "shell_forbidden",
  "arbitrary_command_forbidden",
  "arbitrary_argv_forbidden",
  "arbitrary_cwd_forbidden",
  "environment_inheritance_forbidden",
  "environment_override_forbidden",
  "credentials_forbidden",
  "stdin_forbidden",
  "output_policy_mismatch",
  "timeout_policy_mismatch",
  "termination_policy_mismatch",
  "observer_policy_mismatch",
  "fixture_claimed_execution",
  "fixture_claimed_process_spawn",
  "fixture_claimed_pid",
  "fixture_claimed_process_group",
  "fixture_claimed_output_capture",
  "fixture_claimed_timeout_schedule",
  "fixture_claimed_signal",
  "fixture_claimed_termination",
  "fixture_claimed_authorization_consumption",
  "fixture_claimed_runner_enablement",
] as const satisfies readonly DirectSpawnBlockingReason[];

const DIRECT_SPAWN_BLOCKING_REASON_SET = new Set<string>(DIRECT_SPAWN_BLOCKING_REASON_VALUES);

function mapBlockingReasons(errors: readonly string[]): DirectSpawnBlockingReason[] {
  return sorted(errors.map((error) => (DIRECT_SPAWN_BLOCKING_REASON_SET.has(error) ? (error as DirectSpawnBlockingReason) : "request_invalid")));
}

function isDirectSpawnOperation(input: unknown): input is DirectSpawnOperation {
  return input === "collect_git_version" || input === "collect_supabase_cli_version";
}

function isRequestId(input: unknown): boolean {
  return typeof input === "string" && /^direct_spawn_fixture_request_[a-z0-9_]+$/u.test(input);
}

function isCapabilityId(input: unknown, prefix: string): boolean {
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
