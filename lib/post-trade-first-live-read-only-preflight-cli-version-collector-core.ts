import { createHash } from "node:crypto";

import {
  buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES,
} from "@/lib/post-trade-first-live-read-only-preflight-authorization-artifact-core";
import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID,
} from "@/lib/post-trade-first-live-read-only-preflight-execution-boundary-contract";
import {
  POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_VERSION,
  validateProviderDesignCompatibility,
} from "@/lib/post-trade-live-ephemeral-staging-supabase-credential-provider-design";
import {
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
} from "@/lib/post-trade-read-only-live-staging-migration-preflight-contract";
import {
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
  buildPostTradeReadOnlyLivePreflightRunnerPlan,
} from "@/lib/post-trade-read-only-live-staging-migration-preflight-runner-core";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID =
  "post_trade_first_live_read_only_staging_preflight_cli_version_collector_001" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION =
  "post_trade_first_live_read_only_staging_preflight_cli_version_collector_contract_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_FIXTURE_SOURCE_ID =
  "post_trade_first_live_read_only_staging_preflight_cli_version_fixture_source_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_PARSER_REGISTRY_ID =
  "post_trade_first_live_read_only_staging_preflight_cli_version_parser_registry_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COMMAND_REGISTRY_ID =
  "post_trade_first_live_read_only_staging_preflight_cli_version_command_registry_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_NORMALIZATION_POLICY_ID =
  "post_trade_first_live_read_only_staging_preflight_cli_version_normalization_policy_v1" as const;
export const POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_ID =
  "post_trade_first_live_read_only_staging_preflight_process_executor_contract_v1" as const;

export type ValidationResult = { valid: boolean; blockingReasons: string[] };
export type ComponentKind = "external_executable" | "internal_source_controlled";
export type ComponentIdentity =
  | "git_cli"
  | "supabase_cli"
  | "preflight_collector"
  | "runner_contract"
  | "runner_implementation"
  | "parser_registry"
  | "command_registry"
  | "catalog_adapter_contract"
  | "normalization_policy"
  | "evidence_source_registry"
  | "process_executor_contract";
export type VersionPolicyState = "reviewed_exact" | "reviewed_narrow_range" | "blocked" | "unresolved";
export type VersionCompatibilityClassification =
  | "compatible"
  | "incompatible"
  | "unresolved"
  | "unknown"
  | "malformed"
  | "stale"
  | "ambiguous";
export type ExecutableIdentityClassification =
  | "not_observed"
  | "reviewed_fixture_identity"
  | "reviewed_regular_executable"
  | "alias"
  | "shell_function"
  | "wrapper"
  | "script_proxy"
  | "caller_selected_path"
  | "unknown_symlink"
  | "production_wrapper"
  | "malformed"
  | "ambiguous";

export type ComponentRegistryEntry = {
  componentIdentity: ComponentIdentity;
  componentKind: ComponentKind;
  componentContractVersion: string;
  expectedBasename: "git" | "supabase" | "internal";
  required: true;
  sourceControlled: boolean;
  liveObservationRequiredForFinalReadiness: boolean;
};

export type ComponentRegistry = {
  registryId: "post_trade_first_live_read_only_staging_preflight_cli_component_registry_001";
  collectorContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  components: readonly ComponentRegistryEntry[];
  arbitraryComponentsAllowed: false;
  callerAddedComponentsAllowed: false;
  genericExecutableCategoryAllowed: false;
  registryFingerprintAlgorithm: "sha256";
  registryFingerprint: string;
};

export type VersionPolicy = {
  componentIdentity: ComponentIdentity;
  policyState: VersionPolicyState;
  exactVersion: string | null;
  minVersionInclusive: string | null;
  maxVersionExclusive: string | null;
  prereleaseAllowed: false;
  buildMetadataAllowed: false;
  latestAllowed: false;
  wildcardAllowed: false;
  openEndedRangeAllowed: false;
  lexicalComparisonAllowed: false;
  callerSuppliedRangeAllowed: false;
  environmentOverrideAllowed: false;
  automaticNewerAcceptanceAllowed: false;
};

export type VersionPolicyRegistry = {
  policyRegistryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID;
  collectorContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION;
  policies: readonly VersionPolicy[];
  unresolvedExternalPolicyBlocksReadiness: true;
  fallbackPolicyAllowed: false;
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
};

export type ExecutableIdentityEvidence = {
  componentIdentity: "git_cli" | "supabase_cli";
  expectedBasename: "git" | "supabase";
  executableContractVersion: "post_trade_cli_executable_identity_contract_v1";
  resolverSourceIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_FIXTURE_SOURCE_ID;
  resolvedIdentityClassification: ExecutableIdentityClassification;
  regularExecutable: boolean;
  symlinkClassification: "not_observed" | "not_symlink" | "reviewed_symlink" | "unknown_symlink";
  wrapperClassification: "not_observed" | "not_wrapper" | "wrapper" | "ambiguous";
  aliasClassification: "not_observed" | "not_alias" | "alias";
  shellFunctionClassification: "not_observed" | "not_shell_function" | "shell_function";
  scriptProxyClassification: "not_observed" | "not_script_proxy" | "script_proxy";
  callerSelectedPath: false;
  trustedInstallationClassification: "not_observed" | "trusted" | "untrusted" | "ambiguous";
  observedAtIso: "2026-07-15T10:00:00.000Z";
  expiresAtIso: "2026-07-15T10:05:00.000Z";
  sanitizedResolvedIdentityFingerprint: string;
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
};

export type VersionObservationRequest = {
  requestId: string;
  componentIdentity: ComponentIdentity;
  policyRegistryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID;
  collectorContractVersion: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  expectedOperationIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID;
  expectedExecutableIdentity: "git" | "supabase" | "internal";
  parserIdentity: string;
  requestedAtIso: "2026-07-15T10:00:00.000Z";
  expiresAtIso: "2026-07-15T10:05:00.000Z";
  readOnly: true;
  stdinClosed: true;
  ttyDisabled: true;
  shellDisabled: true;
  timeoutPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.timeoutPolicy;
  outputLimitPolicyIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.outputLimitPolicy;
  expectedOutputLineCount: 1;
  expectedOutputFormatIdentity: "git_version_single_line_v1" | "supabase_cli_version_single_line_v1" | "internal_component_identity_v1";
  rawCommandStringAbsent: true;
  executablePathAbsent: true;
  arbitraryFlagsAllowed: false;
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
};

export type FixtureVersionObservation = {
  requestId: string;
  componentIdentity: ComponentIdentity;
  executableIdentity: ExecutableIdentityEvidence | null;
  stdoutFingerprint: string;
  stderrFingerprint: string;
  stdoutByteCount: number;
  stderrByteCount: number;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  timedOut: boolean;
  outputOverflow: boolean;
  promptDetected: boolean;
  warningBannerDetected: boolean;
  observedAtIso: "2026-07-15T10:00:30.000Z";
  parserInputClassification: "fixture_transient_output" | "source_controlled_internal_identity";
  fixtureOutput: string;
};

export type VersionEvidence = {
  evidenceId: string;
  evidenceVersion: "post_trade_first_live_read_only_staging_preflight_cli_version_evidence_v1";
  componentIdentity: ComponentIdentity;
  policyRegistryId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID;
  executableIdentityClassification: ExecutableIdentityClassification;
  observedVersion: string | null;
  normalizedVersion: string | null;
  compatibilityClassification: VersionCompatibilityClassification;
  parserIdentity: string;
  collectorIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID;
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  observedAtIso: "2026-07-15T10:00:30.000Z";
  expiresAtIso: "2026-07-15T10:05:00.000Z";
  outputFingerprint: string;
  stdoutByteCount: number;
  stderrByteCount: number;
  complete: boolean;
  authoritative: boolean;
  readOnly: true;
  observedLive: false;
  versionCommandsExecuted: 0;
  resultClassification: "fixture_only" | "source_controlled_internal_identity" | "blocked" | "ambiguous";
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
};

export type VersionEvidenceSet = {
  evidenceSetId: "post_trade_first_live_read_only_staging_preflight_cli_version_evidence_set_001";
  collectorIdentity: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID;
  collectorStatus: "not_run" | "fixture_evaluated";
  boundarySessionId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID;
  authorizationArtifactId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID;
  preflightRunId: typeof POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  versionsObservedLive: false;
  executableIdentitiesVerifiedLive: false;
  runnerExecutionEnabled: false;
  preflightRunStatus: "not_run";
  deploymentEnabled: false;
  remoteMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  evidence: readonly VersionEvidence[];
  compatibilityClassification: VersionCompatibilityClassification;
  blockingReasons: readonly string[];
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
};

export type VersionCollectorDefaultState = Omit<VersionEvidenceSet, "evidence" | "compatibilityClassification" | "blockingReasons" | "evidenceFingerprintAlgorithm" | "evidenceFingerprint"> & {
  versionCommandsExecuted: 0;
};

export type VersionObservationAdapter = (request: VersionObservationRequest) => Promise<FixtureVersionObservation>;

export type FixtureCliVersionCollectionResult = {
  collectorStatus: "fixture_evaluated";
  adapterInvoked: boolean;
  requests: readonly VersionObservationRequest[];
  evidenceSet: VersionEvidenceSet | null;
  valid: boolean;
  blockingReasons: readonly string[];
  versionCommandsExecuted: 0;
  observedLive: false;
};

export function buildCliVersionComponentRegistry(): ComponentRegistry {
  const components: ComponentRegistryEntry[] = [
    component("git_cli", "external_executable", "git"),
    component("supabase_cli", "external_executable", "supabase"),
    component("preflight_collector", "internal_source_controlled", "internal", POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION),
    component("runner_contract", "internal_source_controlled", "internal", POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION),
    component("runner_implementation", "internal_source_controlled", "internal", POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION),
    component("parser_registry", "internal_source_controlled", "internal", POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_PARSER_REGISTRY_ID),
    component("command_registry", "internal_source_controlled", "internal", POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COMMAND_REGISTRY_ID),
    component("catalog_adapter_contract", "internal_source_controlled", "internal", "post_trade_read_only_live_preflight_catalog_adapter_contract_v1"),
    component("normalization_policy", "internal_source_controlled", "internal", POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_NORMALIZATION_POLICY_ID),
    component("evidence_source_registry", "internal_source_controlled", "internal", "post_trade_read_only_live_preflight_evidence_source_registry_v1"),
    component("process_executor_contract", "internal_source_controlled", "internal", POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROCESS_EXECUTOR_CONTRACT_ID),
  ];
  const core = {
    registryId: "post_trade_first_live_read_only_staging_preflight_cli_component_registry_001",
    collectorContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    components,
    arbitraryComponentsAllowed: false,
    callerAddedComponentsAllowed: false,
    genericExecutableCategoryAllowed: false,
  } satisfies Omit<ComponentRegistry, "registryFingerprintAlgorithm" | "registryFingerprint">;
  return { ...core, registryFingerprintAlgorithm: "sha256", registryFingerprint: buildCliVersionComponentRegistryFingerprint(core) };
}

export function buildCliVersionPolicyRegistry(): VersionPolicyRegistry {
  const policies: VersionPolicy[] = buildCliVersionComponentRegistry().components.map((entry) => {
    if (entry.componentIdentity === "supabase_cli") return policy(entry.componentIdentity, "unresolved", null);
    if (entry.componentIdentity === "git_cli") return policy(entry.componentIdentity, "reviewed_narrow_range", null, "2.39.0", "2.50.0");
    return policy(entry.componentIdentity, "reviewed_exact", entry.componentContractVersion);
  });
  const core = {
    policyRegistryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID,
    collectorContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION,
    policies,
    unresolvedExternalPolicyBlocksReadiness: true,
    fallbackPolicyAllowed: false,
  } satisfies Omit<VersionPolicyRegistry, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return { ...core, policyFingerprintAlgorithm: "sha256", policyFingerprint: buildCliVersionPolicyRegistryFingerprint(core) };
}

export function buildCliVersionCollectorDefaultState(): VersionCollectorDefaultState {
  return {
    evidenceSetId: "post_trade_first_live_read_only_staging_preflight_cli_version_evidence_set_001",
    collectorIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID,
    collectorStatus: "not_run",
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    authorizationArtifactId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
    preflightRunId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    versionsObservedLive: false,
    executableIdentitiesVerifiedLive: false,
    versionCommandsExecuted: 0,
    runnerExecutionEnabled: false,
    preflightRunStatus: "not_run",
    deploymentEnabled: false,
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
  };
}

export function buildVersionObservationRequests(): readonly VersionObservationRequest[] {
  return buildCliVersionComponentRegistry().components.map((entry) => buildVersionObservationRequest(entry.componentIdentity));
}

export function buildVersionObservationRequest(componentIdentity: ComponentIdentity): VersionObservationRequest {
  const entry = findComponent(componentIdentity);
  const core = {
    requestId: `post_trade_first_live_read_only_staging_preflight_${componentIdentity}_version_request_001`,
    componentIdentity,
    policyRegistryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID,
    collectorContractVersion: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_CONTRACT_VERSION,
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    authorizationArtifactId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
    preflightRunId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
    expectedOperationIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID,
    expectedExecutableIdentity: entry.expectedBasename,
    parserIdentity: parserFor(componentIdentity),
    requestedAtIso: "2026-07-15T10:00:00.000Z",
    expiresAtIso: "2026-07-15T10:05:00.000Z",
    readOnly: true,
    stdinClosed: true,
    ttyDisabled: true,
    shellDisabled: true,
    timeoutPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.timeoutPolicy,
    outputLimitPolicyIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES.outputLimitPolicy,
    expectedOutputLineCount: 1,
    expectedOutputFormatIdentity:
      componentIdentity === "git_cli" ? "git_version_single_line_v1" :
      componentIdentity === "supabase_cli" ? "supabase_cli_version_single_line_v1" :
      "internal_component_identity_v1",
    rawCommandStringAbsent: true,
    executablePathAbsent: true,
    arbitraryFlagsAllowed: false,
  } satisfies Omit<VersionObservationRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return { ...core, requestFingerprintAlgorithm: "sha256", requestFingerprint: buildVersionObservationRequestFingerprint(core) };
}

export function buildExecutableIdentityEvidence(
  componentIdentity: "git_cli" | "supabase_cli",
  classification: ExecutableIdentityClassification = "reviewed_fixture_identity",
): ExecutableIdentityEvidence {
  const expectedBasename = componentIdentity === "git_cli" ? "git" : "supabase";
  const identityCore = {
    componentIdentity,
    expectedBasename,
    classification,
    fixtureSource: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_FIXTURE_SOURCE_ID,
  };
  const core = {
    componentIdentity,
    expectedBasename,
    executableContractVersion: "post_trade_cli_executable_identity_contract_v1",
    resolverSourceIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_FIXTURE_SOURCE_ID,
    resolvedIdentityClassification: classification,
    regularExecutable: classification === "reviewed_fixture_identity" || classification === "reviewed_regular_executable",
    symlinkClassification: "not_observed",
    wrapperClassification: "not_observed",
    aliasClassification: "not_observed",
    shellFunctionClassification: "not_observed",
    scriptProxyClassification: "not_observed",
    callerSelectedPath: false,
    trustedInstallationClassification: classification === "reviewed_regular_executable" ? "trusted" : "not_observed",
    observedAtIso: "2026-07-15T10:00:00.000Z",
    expiresAtIso: "2026-07-15T10:05:00.000Z",
    sanitizedResolvedIdentityFingerprint: hash(stableStringify(identityCore)),
  } satisfies Omit<ExecutableIdentityEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return { ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: buildExecutableIdentityFingerprint(core) };
}

export function parseGitVersionFixture(output: string): ValidationResult & { version: string | null; normalizedVersion: string | null } {
  return parseVersionLine(output, /^git version ([0-9]+\.[0-9]+\.[0-9]+)$/);
}

export function parseSupabaseVersionFixture(output: string): ValidationResult & { version: string | null; normalizedVersion: string | null } {
  return parseVersionLine(output, /^([0-9]+\.[0-9]+\.[0-9]+)$/);
}

export function buildVersionEvidenceFromFixture(
  request: VersionObservationRequest,
  observation: FixtureVersionObservation,
): VersionEvidence {
  const policy = findPolicy(request.componentIdentity);
  const parse =
    request.componentIdentity === "git_cli" ? parseGitVersionFixture(observation.fixtureOutput) :
    request.componentIdentity === "supabase_cli" ? parseSupabaseVersionFixture(observation.fixtureOutput) :
    { valid: true, blockingReasons: [], version: findComponent(request.componentIdentity).componentContractVersion, normalizedVersion: findComponent(request.componentIdentity).componentContractVersion };
  const observationIssue = classifyObservationIssue(request, observation, parse.blockingReasons);
  const compatibility = observationIssue ?? evaluatePolicyCompatibility(policy, parse.normalizedVersion);
  const core = {
    evidenceId: `post_trade_first_live_read_only_staging_preflight_${request.componentIdentity}_version_evidence_001`,
    evidenceVersion: "post_trade_first_live_read_only_staging_preflight_cli_version_evidence_v1",
    componentIdentity: request.componentIdentity,
    policyRegistryId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID,
    executableIdentityClassification: observation.executableIdentity?.resolvedIdentityClassification ?? "not_observed",
    observedVersion: parse.version,
    normalizedVersion: parse.normalizedVersion,
    compatibilityClassification: compatibility,
    parserIdentity: request.parserIdentity,
    collectorIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID,
    boundarySessionId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_BOUNDARY_SESSION_ID,
    authorizationArtifactId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
    preflightRunId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID,
    observedAtIso: "2026-07-15T10:00:30.000Z",
    expiresAtIso: "2026-07-15T10:05:00.000Z",
    outputFingerprint: observation.stdoutFingerprint,
    stdoutByteCount: observation.stdoutByteCount,
    stderrByteCount: observation.stderrByteCount,
    complete: compatibility !== "ambiguous" && compatibility !== "malformed",
    authoritative: request.componentIdentity !== "git_cli" && request.componentIdentity !== "supabase_cli",
    readOnly: true,
    observedLive: false,
    versionCommandsExecuted: 0,
    resultClassification: request.componentIdentity === "git_cli" || request.componentIdentity === "supabase_cli" ? "fixture_only" : "source_controlled_internal_identity",
  } satisfies Omit<VersionEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return { ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: buildVersionEvidenceFingerprint(core) };
}

export function buildCanonicalFixtureVersionEvidenceSet(): VersionEvidenceSet {
  const evidence = buildVersionObservationRequests().map((request) => buildVersionEvidenceFromFixture(request, buildCanonicalFixtureObservation(request)));
  return buildVersionEvidenceSet(evidence);
}

export async function collectCliVersionEvidenceFromInjectedFixtureAdapter(
  adapter: VersionObservationAdapter,
): Promise<FixtureCliVersionCollectionResult> {
  const requests = buildVersionObservationRequests();
  const evidence: VersionEvidence[] = [];
  const blockingReasons: string[] = [];
  for (const request of requests) {
    const observation = await adapter(request);
    const validation = validateFixtureVersionObservation(request, observation);
    if (!validation.valid) {
      blockingReasons.push(...validation.blockingReasons.map((reason) => `${request.componentIdentity}:${reason}`));
      continue;
    }
    evidence.push(buildVersionEvidenceFromFixture(request, observation));
  }
  return {
    collectorStatus: "fixture_evaluated",
    adapterInvoked: true,
    requests,
    evidenceSet: blockingReasons.length === 0 ? buildVersionEvidenceSet(evidence) : null,
    valid: blockingReasons.length === 0,
    blockingReasons: [...new Set(blockingReasons)].sort(),
    versionCommandsExecuted: 0,
    observedLive: false,
  };
}

export function buildVersionEvidenceSet(evidence: readonly VersionEvidence[]): VersionEvidenceSet {
  const blockingReasons = evaluateVersionEvidenceSetBlockingReasons(evidence);
  const nonReadinessReasons = blockingReasons.filter((reason) => reason !== "unresolved_external_policy");
  const compatibilityClassification = blockingReasons.length === 0 ? "compatible" : nonReadinessReasons.length === 0 && blockingReasons.includes("unresolved_external_policy") ? "unresolved" : "incompatible";
  const core = {
    ...buildCliVersionCollectorDefaultState(),
    collectorStatus: "fixture_evaluated",
    evidence,
    compatibilityClassification,
    blockingReasons,
  } satisfies Omit<VersionEvidenceSet, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return { ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: buildVersionEvidenceSetFingerprint(core) };
}

export function validateCliVersionComponentRegistry(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCliVersionComponentRegistry(), "component_registry", buildCliVersionComponentRegistryFingerprint, "registryFingerprint", "registryFingerprintAlgorithm");
  if (!isPlainObject(input)) return invalid(reasons);
  const components = (input as Partial<ComponentRegistry>).components;
  if (!Array.isArray(components)) reasons.push("components_not_array");
  const identities = Array.isArray(components) ? components.map((item) => isPlainObject(item) ? item.componentIdentity : "") : [];
  if (new Set(identities).size !== identities.length) reasons.push("duplicate_component_identity");
  if (!identities.includes("git_cli")) reasons.push("missing_git_cli");
  if (!identities.includes("supabase_cli")) reasons.push("missing_supabase_cli");
  return result(reasons);
}

export function validateCliVersionPolicyRegistry(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCliVersionPolicyRegistry(), "policy_registry", buildCliVersionPolicyRegistryFingerprint, "policyFingerprint", "policyFingerprintAlgorithm");
  if (!isPlainObject(input)) return invalid(reasons);
  const policies = (input as Partial<VersionPolicyRegistry>).policies;
  if (!Array.isArray(policies)) reasons.push("policies_not_array");
  if (Array.isArray(policies)) {
    for (const item of policies) {
      if (!isPlainObject(item)) {
        reasons.push("policy_not_object");
        continue;
      }
      if (item.latestAllowed !== false || item.wildcardAllowed !== false || item.openEndedRangeAllowed !== false || item.lexicalComparisonAllowed !== false || item.callerSuppliedRangeAllowed !== false || item.environmentOverrideAllowed !== false || item.automaticNewerAcceptanceAllowed !== false || item.prereleaseAllowed !== false || item.buildMetadataAllowed !== false) {
        reasons.push("unsafe_policy_capability");
      }
      if (typeof item.exactVersion === "string" && /latest|\*|(?:^|[.])x(?:[.]|$)|>=|\+|-/.test(item.exactVersion)) reasons.push("unsafe_exact_version");
      if (item.policyState === "reviewed_narrow_range") {
        if (typeof item.minVersionInclusive !== "string" || typeof item.maxVersionExclusive !== "string") reasons.push("missing_narrow_range_bound");
        if (typeof item.minVersionInclusive === "string" && typeof item.maxVersionExclusive === "string") {
          const min = parseSemver(item.minVersionInclusive);
          const max = parseSemver(item.maxVersionExclusive);
          if (!min.valid || !max.valid) reasons.push("malformed_narrow_range_bound");
          if (min.valid && max.valid && compareSemver(item.minVersionInclusive, item.maxVersionExclusive) >= 0) reasons.push("invalid_narrow_range_order");
        }
      }
    }
  }
  return result(reasons);
}

export function validateVersionObservationRequest(input: unknown): ValidationResult {
  const component = isPlainObject(input) && typeof input.componentIdentity === "string" && componentIdentities.includes(input.componentIdentity as ComponentIdentity)
    ? input.componentIdentity as ComponentIdentity
    : "git_cli";
  const reasons = validateExactReasons(input, buildVersionObservationRequest(component), "observation_request", buildVersionObservationRequestFingerprint, "requestFingerprint", "requestFingerprintAlgorithm");
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<VersionObservationRequest> & { command?: unknown; args?: unknown; executablePath?: unknown };
  const allowedKeys = new Set([
    "requestId",
    "componentIdentity",
    "policyRegistryId",
    "collectorContractVersion",
    "boundarySessionId",
    "authorizationArtifactId",
    "preflightRunId",
    "expectedOperationIdentity",
    "expectedExecutableIdentity",
    "parserIdentity",
    "requestedAtIso",
    "expiresAtIso",
    "readOnly",
    "stdinClosed",
    "ttyDisabled",
    "shellDisabled",
    "timeoutPolicyIdentity",
    "outputLimitPolicyIdentity",
    "expectedOutputLineCount",
    "expectedOutputFormatIdentity",
    "rawCommandStringAbsent",
    "executablePathAbsent",
    "arbitraryFlagsAllowed",
    "requestFingerprintAlgorithm",
    "requestFingerprint",
  ]);
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) reasons.push(`unknown_request_field:${key}`);
  }
  if (item.readOnly !== true || item.stdinClosed !== true || item.ttyDisabled !== true || item.shellDisabled !== true) reasons.push("unsafe_request_execution_surface");
  if (item.rawCommandStringAbsent !== true || item.executablePathAbsent !== true || item.arbitraryFlagsAllowed !== false) reasons.push("command_or_path_allowed");
  if (typeof item.command !== "undefined" || typeof item.args !== "undefined" || typeof item.executablePath !== "undefined") reasons.push("raw_command_shape_present");
  return result(reasons);
}

export function validateExecutableIdentityEvidence(input: unknown): ValidationResult {
  const component = isPlainObject(input) && input.componentIdentity === "supabase_cli" ? "supabase_cli" : "git_cli";
  const reasons = validateExactReasons(input, buildExecutableIdentityEvidence(component), "executable_identity", buildExecutableIdentityFingerprint, "evidenceFingerprint", "evidenceFingerprintAlgorithm");
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<ExecutableIdentityEvidence> & { executablePath?: unknown; pathContents?: unknown };
  if (item.resolvedIdentityClassification !== "reviewed_fixture_identity" && item.resolvedIdentityClassification !== "reviewed_regular_executable") reasons.push("untrusted_executable_identity");
  if (item.callerSelectedPath !== false) reasons.push("caller_selected_path");
  if (typeof item.executablePath !== "undefined" || typeof item.pathContents !== "undefined") reasons.push("path_material_present");
  return result(reasons);
}

export function validateFixtureVersionObservation(
  request: VersionObservationRequest,
  input: unknown,
): ValidationResult {
  const reasons: string[] = [];
  if (!isPlainObject(input)) return invalid(["fixture_observation_not_object"]);
  if (containsUnsupportedValue(input)) reasons.push("unsupported_nested_value");
  if (hasCycle(input)) reasons.push("cyclic_input");
  if (containsSensitiveMaterial(input)) reasons.push("secret_or_sensitive_material_present");
  if (containsUnexpectedProductionReference(input)) reasons.push("unexpected_production_reference");
  const allowedKeys = new Set([
    "requestId",
    "componentIdentity",
    "executableIdentity",
    "stdoutFingerprint",
    "stderrFingerprint",
    "stdoutByteCount",
    "stderrByteCount",
    "stdoutTruncated",
    "stderrTruncated",
    "timedOut",
    "outputOverflow",
    "promptDetected",
    "warningBannerDetected",
    "observedAtIso",
    "parserInputClassification",
    "fixtureOutput",
  ]);
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) reasons.push(`unknown_fixture_field:${key}`);
  }
  const item = input as Partial<FixtureVersionObservation> & {
    authoritative?: unknown;
    compatibilityClassification?: unknown;
    observedLive?: unknown;
    rawStdout?: unknown;
    rawStderr?: unknown;
    executablePath?: unknown;
  };
  if (item.requestId !== request.requestId) reasons.push("request_id_mismatch");
  if (item.componentIdentity !== request.componentIdentity) reasons.push("component_identity_mismatch");
  if (typeof item.authoritative !== "undefined" || typeof item.compatibilityClassification !== "undefined" || typeof item.observedLive !== "undefined") reasons.push("self_asserted_authority_or_compatibility");
  if (typeof item.rawStdout !== "undefined" || typeof item.rawStderr !== "undefined" || typeof item.executablePath !== "undefined") reasons.push("raw_or_path_material_present");
  if (typeof item.stdoutFingerprint !== "string" || !/^[a-f0-9]{64}$/.test(item.stdoutFingerprint)) reasons.push("malformed_stdout_fingerprint");
  if (typeof item.stderrFingerprint !== "string" || !/^[a-f0-9]{64}$/.test(item.stderrFingerprint)) reasons.push("malformed_stderr_fingerprint");
  if (item.observedAtIso !== "2026-07-15T10:00:30.000Z") reasons.push("unexpected_observed_at");
  if (request.componentIdentity === "git_cli" || request.componentIdentity === "supabase_cli") {
    if (!item.executableIdentity) {
      reasons.push("missing_executable_identity");
    } else {
      reasons.push(...validateExecutableIdentityEvidence(item.executableIdentity).blockingReasons);
    }
    if (item.parserInputClassification !== "fixture_transient_output") reasons.push("unexpected_parser_input_classification");
  } else {
    if (item.executableIdentity !== null) reasons.push("internal_component_executable_identity_present");
    if (item.parserInputClassification !== "source_controlled_internal_identity") reasons.push("unexpected_parser_input_classification");
  }
  if (typeof item.fixtureOutput !== "string") reasons.push("missing_fixture_output");
  return result(reasons);
}

export function validateVersionEvidence(input: unknown): ValidationResult {
  if (!isPlainObject(input)) return invalid(["version_evidence_not_object"]);
  const item = input as Partial<VersionEvidence>;
  const request = buildVersionObservationRequest(componentIdentities.includes(item.componentIdentity as ComponentIdentity) ? item.componentIdentity as ComponentIdentity : "git_cli");
  const fixture = buildCanonicalFixtureObservation(request);
  const canonical = buildVersionEvidenceFromFixture(request, fixture);
  const reasons = validateExactReasons(input, canonical, "version_evidence", buildVersionEvidenceFingerprint, "evidenceFingerprint", "evidenceFingerprintAlgorithm");
  if (item.observedLive !== false || item.versionCommandsExecuted !== 0) reasons.push("live_version_claimed");
  if (item.readOnly !== true) reasons.push("not_read_only");
  return result(reasons);
}

export function validateVersionEvidenceSet(input: unknown): ValidationResult {
  const reasons = validateExactReasons(input, buildCanonicalFixtureVersionEvidenceSet(), "version_evidence_set", buildVersionEvidenceSetFingerprint, "evidenceFingerprint", "evidenceFingerprintAlgorithm");
  if (!isPlainObject(input)) return invalid(reasons);
  const item = input as Partial<VersionEvidenceSet>;
  if (item.versionsObservedLive !== false || item.executableIdentitiesVerifiedLive !== false) reasons.push("live_version_or_identity_claimed");
  if (item.runnerExecutionEnabled !== false || item.deploymentEnabled !== false || item.remoteMutation !== false || item.sqlExecuted !== false) reasons.push("unsafe_execution_enabled");
  if (Array.isArray(item.evidence)) {
    reasons.push(...evaluateVersionEvidenceSetBlockingReasons(item.evidence).filter((reason) => reason !== "unresolved_external_policy"));
  }
  return result(reasons);
}

export function evaluateVersionEvidenceSetBlockingReasons(evidence: readonly VersionEvidence[]): string[] {
  const reasons: string[] = [];
  const identities = evidence.map((item) => item.componentIdentity);
  const identityCounts = new Map<ComponentIdentity, number>();
  for (const identity of identities) identityCounts.set(identity, (identityCounts.get(identity) ?? 0) + 1);
  for (const required of componentIdentities) {
    if (!identities.includes(required)) reasons.push(`missing_component:${required}`);
    if ((identityCounts.get(required) ?? 0) > 1) reasons.push(`duplicate_component_evidence:${required}`);
  }
  if (new Set(evidence.map((item) => item.boundarySessionId)).size > 1) reasons.push("mixed_boundary_sessions");
  if (new Set(evidence.map((item) => item.collectorIdentity)).size > 1) reasons.push("mixed_collector_identities");
  for (const item of evidence) {
    if (item.compatibilityClassification === "unresolved" && (item.componentIdentity === "supabase_cli" || item.componentIdentity === "git_cli")) reasons.push("unresolved_external_policy");
    if (item.compatibilityClassification === "stale") reasons.push(`stale_component:${item.componentIdentity}`);
    if (item.compatibilityClassification === "ambiguous") reasons.push(`ambiguous_component:${item.componentIdentity}`);
    if (item.compatibilityClassification === "malformed") reasons.push(`malformed_component:${item.componentIdentity}`);
    if (!["compatible", "unresolved"].includes(item.compatibilityClassification)) reasons.push(`component_not_compatible:${item.componentIdentity}`);
  }
  return [...new Set(reasons)].sort();
}

export function validateCliVersionCollectorAuthorizationCompatibility(): ValidationResult {
  const artifact = buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact();
  const reasons: string[] = [];
  if (artifact.authorizationArtifactId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID) reasons.push("authorization_id_mismatch");
  if (artifact.preflightRunId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_RUN_ID) reasons.push("run_id_mismatch");
  if (artifact.preflightOperationId !== POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_OPERATION_ID) reasons.push("operation_id_mismatch");
  if (artifact.liveVerificationLimitations.cliVersionCompatibilityVerified !== false) reasons.push("live_version_claimed_upstream");
  return result(reasons);
}

export function validateCliVersionCollectorExecutionBoundaryCompatibility(): ValidationResult {
  const reasons: string[] = [];
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_EXECUTION_BOUNDARY_CONTRACT_VERSION !== "post_trade_first_live_read_only_staging_preflight_execution_boundary_contract_v1") reasons.push("execution_boundary_version_mismatch");
  if (POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_VERSION_POLICY_ID !== "post_trade_first_live_read_only_staging_preflight_cli_version_policy_v1") reasons.push("version_policy_mismatch");
  return result(reasons);
}

export function validateCliVersionCollectorRunnerCompatibility(): ValidationResult {
  const runner = buildPostTradeReadOnlyLivePreflightRunnerPlan();
  const reasons: string[] = [];
  if (runner.runnerId !== POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID) reasons.push("runner_id_mismatch");
  if (runner.runnerVersion !== POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION) reasons.push("runner_version_mismatch");
  if (runner.deploymentEnabled !== false || runner.remoteMutation !== false || runner.sqlExecuted !== false) reasons.push("runner_not_inert");
  return result(reasons);
}

export function validateCliVersionCollectorCredentialDesignCompatibility(): ValidationResult {
  const reasons = validateProviderDesignCompatibility().blockingReasons;
  if (POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_CREDENTIAL_PROVIDER_DESIGN_VERSION !== "post_trade_live_ephemeral_staging_supabase_credential_provider_design_v1") reasons.push("credential_design_version_mismatch");
  return result(reasons);
}

export function buildInertCliVersionCollectionPlan() {
  return {
    planStatus: "inert_cli_version_collection_contract_fixture_only",
    collectorId: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CLI_VERSION_COLLECTOR_ID,
    containsCommandString: false,
    containsExecutablePath: false,
    containsProcessCallback: false,
    containsShell: false,
    containsCredential: false,
    containsSecret: false,
    containsSql: false,
    containsDeployment: false,
    containsRetry: false,
    inspectsPath: false,
    readsEnvironment: false,
    spawnsProcess: false,
    runsGit: false,
    runsSupabase: false,
    consumesAuthorization: false,
    persistsEvidence: false,
    steps: [
      "validate_collector_contract",
      "validate_authorization_compatibility",
      "validate_execution_boundary_compatibility",
      "validate_runner_compatibility",
      "validate_component_and_policy_registries",
      "prepare_exact_observation_requests",
      "require_reviewed_process_executor",
      "collect_one_version_observation_per_external_executable_in_future_action",
      "build_source_controlled_internal_evidence",
      "parse_and_validate_fixture_observations",
      "evaluate_exact_compatibility",
      "emit_sanitized_version_evidence_set",
      "stop_without_running_preflight",
    ],
  } as const;
}

export function buildCliVersionComponentRegistryFingerprint(input: unknown): string { return hash(stableStringify(input)); }
export function buildCliVersionPolicyRegistryFingerprint(input: unknown): string { return hash(stableStringify(input)); }
export function buildExecutableIdentityFingerprint(input: unknown): string { return hash(stableStringify(input)); }
export function buildVersionObservationRequestFingerprint(input: unknown): string { return hash(stableStringify(input)); }
export function buildVersionEvidenceFingerprint(input: unknown): string { return hash(stableStringify(input)); }
export function buildVersionEvidenceSetFingerprint(input: unknown): string { return hash(stableStringify(input)); }

function component(
  componentIdentity: ComponentIdentity,
  componentKind: ComponentKind,
  expectedBasename: ComponentRegistryEntry["expectedBasename"],
  componentContractVersion = `${componentIdentity}_contract_unresolved_until_live_review_v1`,
): ComponentRegistryEntry {
  return {
    componentIdentity,
    componentKind,
    componentContractVersion,
    expectedBasename,
    required: true,
    sourceControlled: componentKind === "internal_source_controlled",
    liveObservationRequiredForFinalReadiness: componentKind === "external_executable",
  };
}

function policy(
  componentIdentity: ComponentIdentity,
  policyState: VersionPolicyState,
  exactVersion: string | null,
  minVersionInclusive: string | null = null,
  maxVersionExclusive: string | null = null,
): VersionPolicy {
  return {
    componentIdentity,
    policyState,
    exactVersion,
    minVersionInclusive,
    maxVersionExclusive,
    prereleaseAllowed: false,
    buildMetadataAllowed: false,
    latestAllowed: false,
    wildcardAllowed: false,
    openEndedRangeAllowed: false,
    lexicalComparisonAllowed: false,
    callerSuppliedRangeAllowed: false,
    environmentOverrideAllowed: false,
    automaticNewerAcceptanceAllowed: false,
  };
}

const componentIdentities: readonly ComponentIdentity[] = [
  "git_cli",
  "supabase_cli",
  "preflight_collector",
  "runner_contract",
  "runner_implementation",
  "parser_registry",
  "command_registry",
  "catalog_adapter_contract",
  "normalization_policy",
  "evidence_source_registry",
  "process_executor_contract",
];

function findComponent(componentIdentity: ComponentIdentity): ComponentRegistryEntry {
  const found = buildCliVersionComponentRegistry().components.find((item) => item.componentIdentity === componentIdentity);
  if (!found) throw new Error("unreachable_component_identity");
  return found;
}

function findPolicy(componentIdentity: ComponentIdentity): VersionPolicy {
  const found = buildCliVersionPolicyRegistry().policies.find((item) => item.componentIdentity === componentIdentity);
  if (!found) throw new Error("unreachable_policy_identity");
  return found;
}

function parserFor(componentIdentity: ComponentIdentity): string {
  return componentIdentity === "git_cli" ? "git_version_single_line_parser_v1" :
    componentIdentity === "supabase_cli" ? "supabase_cli_version_single_line_parser_v1" :
    "internal_component_identity_parser_v1";
}

function buildCanonicalFixtureObservation(request: VersionObservationRequest): FixtureVersionObservation {
  const external = request.componentIdentity === "git_cli" || request.componentIdentity === "supabase_cli";
  const executableComponent = request.componentIdentity as "git_cli" | "supabase_cli";
  const fixtureOutput = request.componentIdentity === "git_cli" ? "git version 2.45.1\n" :
    request.componentIdentity === "supabase_cli" ? "0.0.0\n" :
    `${findComponent(request.componentIdentity).componentContractVersion}\n`;
  return {
    requestId: request.requestId,
    componentIdentity: request.componentIdentity,
    executableIdentity: external ? buildExecutableIdentityEvidence(executableComponent) : null,
    stdoutFingerprint: hash(fixtureOutput),
    stderrFingerprint: hash(""),
    stdoutByteCount: fixtureOutput.length,
    stderrByteCount: 0,
    stdoutTruncated: false,
    stderrTruncated: false,
    timedOut: false,
    outputOverflow: false,
    promptDetected: false,
    warningBannerDetected: false,
    observedAtIso: "2026-07-15T10:00:30.000Z",
    parserInputClassification: external ? "fixture_transient_output" : "source_controlled_internal_identity",
    fixtureOutput,
  };
}

function parseVersionLine(output: string, pattern: RegExp): ValidationResult & { version: string | null; normalizedVersion: string | null } {
  const reasons: string[] = [];
  if (output.length > 128) reasons.push("output_too_long");
  const line = output.endsWith("\n") ? output.slice(0, -1) : output;
  if (!line) reasons.push("empty_output");
  if (line !== line.trim()) reasons.push("version_whitespace");
  if (containsSensitiveMaterial(output)) reasons.push("secret_like_output");
  if (/[\u001b\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029]/.test(output)) reasons.push("control_or_ansi_output");
  if (/warning|update available|deprecated|login|browser|token prompt|credential prompt|confirm|https?:\/\//i.test(output)) reasons.push("interactive_or_warning_output");
  if (/\/Users\/|\/home\/|[A-Za-z]:\\|\/usr\/|\/bin\/|\\/.test(output)) reasons.push("path_like_output");
  const lines = line.split(/\n/).filter(Boolean);
  if (lines.length !== 1) reasons.push("unexpected_line_count");
  const match = lines[0]?.match(pattern);
  if (!match) reasons.push("unexpected_version_format");
  const version = match?.[1] ?? null;
  if (version && !parseSemver(version).valid) reasons.push(...parseSemver(version).blockingReasons);
  return { valid: reasons.length === 0, blockingReasons: [...new Set(reasons)].sort(), version, normalizedVersion: version };
}

function parseSemver(version: string): ValidationResult {
  const reasons: string[] = [];
  if (version.length > 32) reasons.push("version_too_long");
  if (version.trim() !== version) reasons.push("version_whitespace");
  if (/[+]/.test(version)) reasons.push("build_metadata_ambiguous");
  if (/-/.test(version)) reasons.push("prerelease_not_reviewed");
  if (/[xX*]/.test(version) || version.includes(">")) reasons.push("wildcard_or_open_range");
  const parts = version.split(".");
  if (parts.length !== 3) reasons.push("missing_core_segment");
  for (const part of parts) {
    if (!/^[0-9]+$/.test(part)) reasons.push("non_numeric_segment");
    if (part.length > 1 && part.startsWith("0")) reasons.push("leading_zero_segment");
    const numeric = Number(part);
    if (!Number.isSafeInteger(numeric) || numeric < 0 || numeric > 9999) reasons.push("excessive_or_negative_segment");
  }
  return result(reasons);
}

function evaluatePolicyCompatibility(policy: VersionPolicy, version: string | null): VersionCompatibilityClassification {
  if (policy.policyState === "unresolved") return "unresolved";
  if (policy.policyState === "blocked") return "incompatible";
  if (policy.policyState === "reviewed_exact") return policy.exactVersion === version ? "compatible" : "incompatible";
  if (!version || !parseSemver(version).valid) return "malformed";
  if (policy.policyState === "reviewed_narrow_range" && policy.minVersionInclusive && policy.maxVersionExclusive) {
    return compareSemver(version, policy.minVersionInclusive) >= 0 && compareSemver(version, policy.maxVersionExclusive) < 0 ? "compatible" : "incompatible";
  }
  return "unknown";
}

function compareSemver(left: string, right: string): number {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if ((a[index] ?? 0) > (b[index] ?? 0)) return 1;
    if ((a[index] ?? 0) < (b[index] ?? 0)) return -1;
  }
  return 0;
}

function classifyObservationIssue(request: VersionObservationRequest, observation: FixtureVersionObservation, parseReasons: readonly string[]): VersionCompatibilityClassification | null {
  if (observation.requestId !== request.requestId || observation.componentIdentity !== request.componentIdentity) return "malformed";
  if (observation.timedOut || observation.stdoutTruncated || observation.stderrTruncated || observation.outputOverflow || observation.promptDetected || observation.warningBannerDetected) return "ambiguous";
  const identity = observation.executableIdentity?.resolvedIdentityClassification;
  if ((request.componentIdentity === "git_cli" || request.componentIdentity === "supabase_cli") && identity !== "reviewed_fixture_identity" && identity !== "reviewed_regular_executable") return "ambiguous";
  if (parseReasons.some((reason) => reason.includes("secret"))) return "malformed";
  if (parseReasons.length > 0) return "malformed";
  return null;
}

function validateExactReasons(
  input: unknown,
  canonical: unknown,
  label: string,
  builder: (input: unknown) => string,
  fingerprintKey: string,
  algorithmKey: string,
): string[] {
  const reasons: string[] = [];
  if (!isPlainObject(input)) return [`${label}_not_object`];
  if (containsUnsupportedValue(input)) reasons.push("unsupported_nested_value");
  if (hasCycle(input)) reasons.push("cyclic_input");
  if (containsSensitiveMaterial(input)) reasons.push("secret_or_sensitive_material_present");
  if (containsUnexpectedProductionReference(input)) reasons.push("unexpected_production_reference");
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

function invalid(reasons: readonly string[]): ValidationResult {
  return result(reasons.length > 0 ? reasons : ["invalid_input"]);
}

function result(reasons: readonly string[]): ValidationResult {
  return { valid: reasons.length === 0, blockingReasons: [...new Set(reasons)].sort() };
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
  if (value === null) return false;
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint" || typeof value === "undefined") return true;
  if (typeof value === "number") return !Number.isFinite(value);
  if (Array.isArray(value)) return value.some((item) => containsUnsupportedValue(item, seen));
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return true;
  seen.add(value);
  if (!isPlainObject(value)) return true;
  return Object.values(value).some((nested) => containsUnsupportedValue(nested, seen));
}

function containsSensitiveMaterial(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    return /access[_ -]?token|refresh[_ -]?token|service[_ -]?role|anon[_ -]?key|api[_ -]?key|password|connection[_ -]?string|postgres(?:ql)?:\/\/|authorization:\s*bearer|bearer\s+[a-z0-9._-]+|cookie|session[_ -]?(token|cookie|secret|value)|private[_ -]?key|client[_ -]?secret|credential[_ -]?path|keychain|path dump|environment dump|PATH=|\/Users\/|\/home\/|bankid|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+|[A-Za-z0-9+/]{80,}={0,2}/.test(value);
  }
  if (Array.isArray(value)) return value.some((item) => containsSensitiveMaterial(item, seen));
  if (!isPlainObject(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) =>
    /token|serviceRole|anonKey|apiKey|password|connectionString|bearer|cookie|rawSession|session(Token|Secret|Cookie|Value)|privateKey|clientSecret|credentialPath|keychain|pathContents|environmentDump|pathDump|homePath|rawStd(out|err)|executablePath(?!Absent)/i.test(key) ||
    containsSensitiveMaterial(nested, seen),
  );
}

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
