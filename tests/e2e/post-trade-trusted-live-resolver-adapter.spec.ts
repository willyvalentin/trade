import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY,
  TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
  TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID,
  TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS,
  TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID,
  asFixtureAbsoluteMacosPath,
  buildFixtureExecutableCandidateCapability,
  buildFixtureExecutableCandidateObservation,
  buildFixtureExecutableIdentity,
  buildFixtureRepositoryCandidateCapability,
  buildFixtureRepositoryCandidateObservation,
  buildFixtureRepositoryIdentity,
  buildResolverSessionCapability,
  buildTrustedExecutableResolutionPolicy,
  buildTrustedExecutableResolutionRequest,
  buildTrustedLiveResolverCompatibilitySummary,
  buildTrustedLiveResolverFixtureAdapter,
  buildTrustedLiveResolverFuturePlan,
  buildTrustedRepositoryResolutionPolicy,
  buildTrustedRepositoryResolutionRequest,
  buildTrustedResolverIdentityFingerprint,
  validateExecutableCandidateCapability,
  validateExecutableCandidateObservation,
  validateFixtureAbsoluteMacosPath,
  validateRepositoryCandidateCapability,
  validateRepositoryCandidateObservation,
  validateResolverSessionCapability,
  validateTrustedExecutableResolutionPolicy,
  validateTrustedExecutableResolutionRequest,
  validateTrustedRepositoryResolutionPolicy,
  validateTrustedRepositoryResolutionRequest,
  validateTrustedResolverIdentity,
} from "../../lib/post-trade-trusted-live-resolver-adapter-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-trusted-live-resolver-adapter-core.ts";
const boundaryPath = "lib/post-trade-trusted-live-resolver-adapter.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function errorsOf(result: { ok: true } | { ok: false; errors: readonly string[] } | { ok: boolean; errors: readonly string[] }) {
  return result.ok ? [] : result.errors;
}

function expectInvalid(result: { ok: true } | { ok: false; errors: readonly string[] } | { ok: boolean; errors: readonly string[] }) {
  expect(errorsOf(result).length).toBeGreaterThan(0);
}

function execFixture(tool: "git" | "supabase_cli" = "git") {
  const session = buildResolverSessionCapability();
  const identity = buildFixtureExecutableIdentity({ boundarySessionId: session.boundarySessionId, expectedToolIdentity: tool });
  const request = buildTrustedExecutableResolutionRequest(session, identity);
  const observation = buildFixtureExecutableCandidateObservation(request, identity);
  const adapter = buildTrustedLiveResolverFixtureAdapter();
  return { session, identity, request, observation, adapter };
}

function repoFixture() {
  const session = buildResolverSessionCapability();
  const identity = buildFixtureRepositoryIdentity({ boundarySessionId: session.boundarySessionId });
  const request = buildTrustedRepositoryResolutionRequest(session, identity);
  const observation = buildFixtureRepositoryCandidateObservation(request, identity);
  const adapter = buildTrustedLiveResolverFixtureAdapter();
  return { session, identity, request, observation, adapter };
}

function clone<T extends object>(input: T): T {
  return { ...input };
}

test.describe("trusted live resolver adapter fixture boundary canonical behavior", () => {
  test("identity, server boundary and future plan are fixture-only no-live-resolution", () => {
    const boundarySource = source(boundaryPath);
    const adapter = buildTrustedLiveResolverFixtureAdapter();
    expect(validateTrustedResolverIdentity(TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY).ok).toBe(true);
    expect(validateTrustedResolverIdentity(adapter.identity).ok).toBe(true);
    expect(adapter).toMatchObject({ fixtureOnly: true, observedLive: false, authoritativeLive: false });
    expect(boundarySource.startsWith('import "server-only";')).toBe(true);
    for (const fragment of [
      "defaultLiveResolverPresent: false",
      "exposesPathLookup: false",
      "exposesFilesystemReader: false",
      "canRunGit: false",
      "canRunSupabase: false",
      "enablesProcessStart: false",
      "enablesPreflightRunner: false",
      "liveResolutionEnabled: false",
    ]) {
      expect(boundarySource).toContain(fragment);
    }
    expect(buildTrustedLiveResolverFuturePlan()).toMatchObject({ liveResolverPresent: false, selectedFilesystemApi: "not_selected" });
  });

  test("canonical executable and repository policies are exact and non-enabling", () => {
    const executablePolicy = buildTrustedExecutableResolutionPolicy();
    const repositoryPolicy = buildTrustedRepositoryResolutionPolicy();
    expect(validateTrustedExecutableResolutionPolicy(executablePolicy).ok).toBe(true);
    expect(validateTrustedRepositoryResolutionPolicy(repositoryPolicy).ok).toBe(true);
    expect(executablePolicy.policyId).toBe(TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID);
    expect(repositoryPolicy.policyId).toBe(TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID);
    expect(executablePolicy.allowPathSearch).toBe(false);
    expect(executablePolicy.allowFilesystemInspection).toBe(false);
    expect(repositoryPolicy.allowGitCommandDiscovery).toBe(false);
    expect(repositoryPolicy.fixtureMayEnableRunner).toBe(false);
  });

  test("canonical executable fixture resolves to compatible fixture candidate only", () => {
    const { adapter, request, observation } = execFixture("git");
    const result = adapter.resolveExecutableFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.disposition).toBe("compatible_fixture_candidate");
    expect(result.evidence.authority).toBe("fixture_structural_only");
    expect(result).toMatchObject({
      fixtureOnly: true,
      observedLive: false,
      authoritativeLive: false,
      issuesLiveExecutableCapability: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
    });
    expect(result.evidence.provesExecutableExistsLive).toBe(false);
    expect(result.evidence.provesExecutableTrustedLive).toBe(false);
  });

  test("canonical repository fixture resolves to compatible fixture repository only", () => {
    const { adapter, request, observation } = repoFixture();
    const result = adapter.resolveRepositoryFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.disposition).toBe("compatible_fixture_repository");
    expect(result.evidence.authority).toBe("fixture_structural_only");
    expect(result).toMatchObject({
      fixtureOnly: true,
      observedLive: false,
      authoritativeLive: false,
      issuesLiveRepositoryCapability: false,
      enablesGitOperation: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
    });
    expect(result.evidence.provesRepositoryExistsLive).toBe(false);
    expect(result.evidence.provesRepositoryTrustedLive).toBe(false);
  });

  test("compatibility is structural and cannot enable live resolution execution or runner", () => {
    expect(buildTrustedLiveResolverCompatibilitySummary()).toMatchObject({
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
    });
  });
});

const identityPatches: Array<[string, Record<string, unknown>]> = [
  ["changed kind", { resolverKind: "path_resolver" }],
  ["changed resolver id", { resolverId: "ture.execution.trusted-live-resolver-adapter.live.v1" }],
  ["live-looking id", { resolverId: "live_resolver" }],
  ["changed platform", { platform: "linux" }],
  ["missing platform", { platform: undefined }],
  ["live mode", { implementationMode: "live" }],
  ["hybrid mode", { implementationMode: "hybrid" }],
  ["changed source model", { sourceModel: "filesystem" }],
  ["changed policy version", { policyVersion: 2 }],
  ["caller authority", { authority: "live_authoritative" }],
  ["caller completeness", { completeness: "complete_fixture_structure" }],
  ["extra trusted", { trusted: true }],
  ["extra resolved", { resolved: true }],
  ["extra command", { command: "which git" }],
  ["extra cwd", { cwd: "/tmp" }],
];

for (const [name, patch] of identityPatches) {
  test(`identity rejects ${name}`, () => {
    expectInvalid(validateTrustedResolverIdentity({ ...TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY, ...patch }));
  });
}

const executablePolicyPatches: Array<[string, Record<string, unknown>]> = [
  ["unknown policy", { policyId: "unknown" }],
  ["case-changed policy", { policyId: TRUSTED_LIVE_RESOLVER_EXECUTABLE_POLICY_ID.toUpperCase() }],
  ["caller policy", { policyId: "caller_policy" }],
  ["PATH enabled", { allowPathSearch: true }],
  ["filesystem enabled", { allowFilesystemInspection: true }],
  ["environment PATH enabled", { allowEnvironmentPath: true }],
  ["shell lookup enabled", { allowShellLookup: true }],
  ["cwd lookup enabled", { allowCurrentWorkingDirectoryLookup: true }],
  ["relative paths enabled", { allowRelativePaths: true }],
  ["home expansion enabled", { allowHomeExpansion: true }],
  ["glob enabled", { allowGlob: true }],
  ["wildcard enabled", { allowWildcard: true }],
  ["symlink target allowed", { allowSymlinkTargetSelection: true }],
  ["retry override", { retryPolicy: "retry_once" }],
  ["regular file disabled", { requireRegularFileStructure: false }],
  ["ownership disabled", { requireOwnershipEvidence: false }],
  ["provenance disabled", { requireProvenanceEvidence: false }],
  ["architecture disabled", { requireArchitectureEvidence: false }],
  ["live capability override", { fixtureMayIssueLiveCapability: true }],
  ["runner override", { fixtureMayEnableRunner: true }],
];

for (const [name, patch] of executablePolicyPatches) {
  test(`executable policy rejects ${name}`, () => {
    expectInvalid(validateTrustedExecutableResolutionPolicy({ ...buildTrustedExecutableResolutionPolicy(), ...patch }));
  });
}

const repositoryPolicyPatches: Array<[string, Record<string, unknown>]> = [
  ["unknown policy", { policyId: "unknown" }],
  ["case-changed policy", { policyId: TRUSTED_LIVE_RESOLVER_REPOSITORY_POLICY_ID.toUpperCase() }],
  ["filesystem enabled", { allowFilesystemInspection: true }],
  ["cwd discovery enabled", { allowCurrentWorkingDirectoryDiscovery: true }],
  ["parent traversal enabled", { allowParentDirectoryTraversal: true }],
  ["Git discovery enabled", { allowGitCommandDiscovery: true }],
  ["environment root enabled", { allowEnvironmentRoot: true }],
  ["relative paths enabled", { allowRelativePaths: true }],
  ["home expansion enabled", { allowHomeExpansion: true }],
  ["glob enabled", { allowGlob: true }],
  ["wildcard enabled", { allowWildcard: true }],
  ["directory requirement disabled", { requireDirectoryStructure: false }],
  ["repository marker disabled", { requireRepositoryMarkerEvidence: false }],
  ["ownership disabled", { requireOwnershipEvidence: false }],
  ["provenance disabled", { requireProvenanceEvidence: false }],
  ["symlink disabled", { requireSymlinkEvidence: false }],
  ["Git enablement override", { fixtureMayEnableGitOperation: true }],
  ["process start override", { fixtureMayEnableProcessStart: true }],
  ["runner override", { fixtureMayEnableRunner: true }],
  ["retry override", { retryPolicy: "retry_once" }],
];

for (const [name, patch] of repositoryPolicyPatches) {
  test(`repository policy rejects ${name}`, () => {
    expectInvalid(validateTrustedRepositoryResolutionPolicy({ ...buildTrustedRepositoryResolutionPolicy(), ...patch }));
  });
}

const capabilityPatches: Array<[string, Record<string, unknown>]> = [
  ["wrong kind", { capabilityKind: "other" }],
  ["wrong version", { capabilityVersion: 2 }],
  ["bad id", { capabilityId: "bad-id" }],
  ["bad session", { boundarySessionId: "other_session" }],
  ["bad platform", { intendedPlatform: "linux" }],
  ["invalid issued time", { issuedAt: "today" }],
  ["invalid expiry", { expiresAt: "tomorrow" }],
  ["expiry before issuance", { expiresAt: "2026-07-17T10:09:00.000Z" }],
  ["expired", { expiresAt: "2026-07-17T10:10:01.000Z" }],
  ["contains PATH", { nested: { PATH: "/usr/bin" } }],
  ["contains cwd", { nested: { cwd: "/tmp" } }],
  ["contains home", { nested: { homeDirectory: "/Users/example" } }],
  ["contains env", { nested: { pathEnv: "PATH" } }],
  ["contains authority", { nested: { authority: "live_authoritative" } }],
  ["contains shell", { nested: { shell: "zsh" } }],
  ["contains command", { nested: { command: "which git" } }],
  ["contains process start", { nested: { enablesProcessStartOverride: true } }],
  ["contains runner", { nested: { enablesPreflightRunnerOverride: true } }],
  ["contains credential", { nested: { token: "service role key" } }],
  ["bad fingerprint", { capabilityFingerprint: "a".repeat(64) }],
];

for (const [name, patch] of capabilityPatches) {
  test(`resolver session capability rejects ${name}`, () => {
    expectInvalid(validateResolverSessionCapability({ ...buildResolverSessionCapability(), ...patch }));
  });
}

test("resolver session capability rejects cloned plain object despite exact public fields", () => {
  const capability = buildResolverSessionCapability();
  expect(validateResolverSessionCapability(capability).ok).toBe(true);
  expect(errorsOf(validateResolverSessionCapability(clone(capability)))).toContain("resolver_session_capability_invalid");
});

test("candidate capabilities reject cloned plain objects and noninterchangeable shapes", () => {
  const executableIdentity = buildFixtureExecutableIdentity();
  const repositoryIdentity = buildFixtureRepositoryIdentity();
  const executableCapability = buildFixtureExecutableCandidateCapability(executableIdentity);
  const repositoryCapability = buildFixtureRepositoryCandidateCapability(repositoryIdentity);
  expect(validateExecutableCandidateCapability(executableCapability, executableIdentity).ok).toBe(true);
  expect(validateRepositoryCandidateCapability(repositoryCapability, repositoryIdentity).ok).toBe(true);
  expect(errorsOf(validateExecutableCandidateCapability(clone(executableCapability), executableIdentity))).toContain("candidate_capability_invalid");
  expect(errorsOf(validateRepositoryCandidateCapability(clone(repositoryCapability), repositoryIdentity))).toContain("candidate_capability_invalid");
  expect(validateExecutableCandidateCapability(repositoryCapability, executableIdentity).ok).toBe(false);
  expect(validateRepositoryCandidateCapability(executableCapability, repositoryIdentity).ok).toBe(false);
});

const pathCases: Array<[string, string, boolean]> = [
  ["system git", "/usr/bin/git", true],
  ["homebrew supabase", "/opt/homebrew/bin/supabase", true],
  ["application support", "/Library/Application Support/Ture/tool", true],
  ["relative", "usr/bin/git", false],
  ["empty", "", false],
  ["tilde", "~", false],
  ["tilde path", "~/bin/git", false],
  ["env interpolation", "${PATH}/git", false],
  ["home env", "$HOME/bin/git", false],
  ["nul", "/usr/bin/gi\u0000t", false],
  ["newline", "/usr/bin/git\n", false],
  ["carriage", "/usr/bin/git\r", false],
  ["dot segment", "/usr/./bin/git", false],
  ["parent traversal", "/usr/bin/../git", false],
  ["duplicate slash", "/usr//bin/git", false],
  ["url", "https://example.invalid/git", false],
  ["file url", "file:///usr/bin/git", false],
  ["command substitution", "/usr/bin/$(git)", false],
  ["backticks", "/usr/bin/`git`", false],
  ["semicolon", "/usr/bin/git;id", false],
  ["pipe", "/usr/bin/git|cat", false],
  ["ampersand", "/usr/bin/git&cat", false],
  ["glob star", "/usr/bin/*", false],
  ["glob question", "/usr/bin/gi?", false],
  ["glob bracket", "/usr/bin/[git]", false],
  ["overlong", `/${"a".repeat(241)}`, false],
  ["control", "/usr/bin/git\u0001", false],
];

for (const [name, value, valid] of pathCases) {
  test(`structural path ${valid ? "accepts" : "rejects"} ${name}`, () => {
    expect(validateFixtureAbsoluteMacosPath(value).length === 0).toBe(valid);
  });
}

const executableIdentityPatches: Array<[string, Record<string, unknown>, string]> = [
  ["arbitrary tool", { expectedToolIdentity: "node" }, "tool_identity_mismatch"],
  ["empty tool", { expectedToolIdentity: "" }, "tool_identity_mismatch"],
  ["candidate mismatch", { candidateId: "other_candidate" }, "candidate_identity_mismatch"],
  ["session mismatch", { boundarySessionId: "other_session" }, "session_mismatch"],
  ["wrong object type directory", { filesystemObjectType: "directory" }, "filesystem_object_not_regular_file"],
  ["wrong object type symlink", { filesystemObjectType: "symlink" }, "filesystem_object_not_regular_file"],
  ["missing executable permission", { executablePermissionState: "modeled_not_executable" }, "executable_permission_missing"],
  ["unexpected owner", { ownershipState: "modeled_unexpected_owner" }, "ownership_mismatch"],
  ["world writable", { ownershipState: "modeled_world_writable" }, "unsafe_permissions"],
  ["group writable", { ownershipState: "modeled_group_writable" }, "unsafe_permissions"],
  ["unapproved provenance", { provenanceState: "modeled_unapproved_source" }, "provenance_unapproved"],
  ["unsupported architecture", { architectureState: "modeled_unsupported" }, "architecture_unsupported"],
  ["unapproved Rosetta", { rosettaState: "modeled_rosetta_required_not_approved" }, "rosetta_not_approved"],
  ["unknown object", { filesystemObjectType: "unknown" }, "filesystem_object_type_unknown"],
  ["unknown owner", { ownershipState: "ownership_unavailable" }, "ownership_unavailable"],
  ["unknown provenance", { provenanceState: "provenance_unavailable" }, "provenance_unavailable"],
  ["unknown architecture", { architectureState: "architecture_unavailable" }, "architecture_unavailable"],
  ["unknown Rosetta", { rosettaState: "rosetta_state_unavailable" }, "rosetta_state_unavailable"],
  ["symlink", { symlinkState: "modeled_symlink" }, "symlink_candidate"],
  ["bad path", { structuralPath: asFixtureAbsoluteMacosPath("../git") }, "path_not_absolute"],
];

for (const [name, patch, expectedReason] of executableIdentityPatches) {
  test(`executable fixture blocks or marks ${name}`, () => {
    const { request } = execFixture();
    const identity = buildFixtureExecutableIdentity({ boundarySessionId: request.boundarySessionId, ...patch });
    const observation = buildFixtureExecutableCandidateObservation(request, identity, { candidateCapability: buildFixtureExecutableCandidateCapability(identity) });
    const result = buildTrustedLiveResolverFixtureAdapter().resolveExecutableFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect([...result.evidence.blockingReasons, ...result.evidence.ambiguityReasons]).toContain(expectedReason);
  });
}

const repositoryIdentityPatches: Array<[string, Record<string, unknown>, string]> = [
  ["arbitrary identity", { candidateId: "other_repo" }, "repository_identity_mismatch"],
  ["session mismatch", { boundarySessionId: "other_session" }, "session_mismatch"],
  ["regular file root", { filesystemObjectType: "regular_file" }, "filesystem_object_not_directory"],
  ["symlink root", { filesystemObjectType: "symlink" }, "filesystem_object_not_directory"],
  ["missing root", { filesystemObjectType: "missing" }, "filesystem_object_not_directory"],
  ["generic marker mismatch", { repositoryMarkerState: "modeled_repository_marker_present_but_identity_mismatch" }, "repository_marker_mismatch"],
  ["not repository", { repositoryMarkerState: "modeled_not_repository" }, "repository_marker_mismatch"],
  ["marker unavailable", { repositoryMarkerState: "repository_marker_unavailable" }, "repository_marker_unavailable"],
  ["marker ambiguous", { repositoryMarkerState: "repository_marker_ambiguous" }, "repository_marker_ambiguous"],
  ["unexpected owner", { ownershipState: "modeled_unexpected_owner" }, "ownership_mismatch"],
  ["unsafe permissions", { ownershipState: "modeled_unsafe_permissions" }, "unsafe_permissions"],
  ["unapproved provenance", { provenanceState: "modeled_unapproved_source" }, "provenance_unapproved"],
  ["symlink", { symlinkState: "modeled_symlink" }, "symlink_candidate"],
  ["bad path", { structuralRootPath: asFixtureAbsoluteMacosPath("/Users/reviewed/../trade") }, "path_contains_parent_traversal"],
];

for (const [name, patch, expectedReason] of repositoryIdentityPatches) {
  test(`repository fixture blocks or marks ${name}`, () => {
    const { request } = repoFixture();
    const identity = buildFixtureRepositoryIdentity({ boundarySessionId: request.boundarySessionId, ...patch });
    const observation = buildFixtureRepositoryCandidateObservation(request, identity, { candidateCapability: buildFixtureRepositoryCandidateCapability(identity) });
    const result = buildTrustedLiveResolverFixtureAdapter().resolveRepositoryFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect([...result.evidence.blockingReasons, ...result.evidence.ambiguityReasons]).toContain(expectedReason);
  });
}

test.describe("candidate cardinality and fixture selection", () => {
  test("zero executable candidates block and incomplete zero candidates are ambiguous", () => {
    const { adapter, request } = execFixture();
    expect(adapter.resolveExecutableFixture({ request, candidates: [], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT }).evidence.blockingReasons).toContain("no_candidate");
    expect(adapter.resolveExecutableFixture({ request, candidates: [], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT, candidateSetCompleteness: "modeled_incomplete" }).evidence.ambiguityReasons).toContain("candidate_set_incomplete");
  });

  test("multiple executable candidates block without selecting first", () => {
    const { adapter, request, observation } = execFixture();
    const other = buildFixtureExecutableCandidateObservation(request, buildFixtureExecutableIdentity({ candidateId: "fixture_executable_candidate_git_002" }));
    const result = adapter.resolveExecutableFixture({ request, candidates: [observation, other], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.candidateSetClassification).toBe("multiple_candidates");
    expect(result.evidence.blockingReasons).toContain("multiple_candidates");
    expect(result.evidence.disposition).toBe("blocked_fixture_candidate");
  });

  test("zero and multiple repository candidates block without discovery fallback", () => {
    const { adapter, request, observation } = repoFixture();
    expect(adapter.resolveRepositoryFixture({ request, candidates: [], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT }).evidence.blockingReasons).toContain("no_candidate");
    expect(adapter.resolveRepositoryFixture({ request, candidates: [observation, observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT }).evidence.blockingReasons).toContain("multiple_candidates");
  });
});

const executableRequestPatches: Array<[string, Record<string, unknown>]> = [
  ["wrong kind", { requestKind: "path_resolution" }],
  ["wrong version", { requestVersion: 2 }],
  ["malformed id", { requestId: "bad-id" }],
  ["session mismatch", { boundarySessionId: "other_session" }],
  ["resolver mismatch", { resolverIdentityFingerprint: "a".repeat(64) }],
  ["policy mismatch", { resolverPolicyId: "unknown" }],
  ["operation mismatch", { operation: "resolve_path" }],
  ["attempt zero", { attempt: 0 }],
  ["attempt two", { attempt: 2 }],
  ["retry policy", { retryPolicy: "retry_once" }],
  ["expired", { expiresAt: "2026-07-17T10:10:01.000Z" }],
  ["expiry before issuance", { expiresAt: "2026-07-17T10:09:00.000Z" }],
  ["arbitrary path", { path: "/usr/bin/git" }],
  ["outside enum", { expectedToolIdentity: "node" }],
  ["search roots", { searchRoots: ["/usr/bin"] }],
  ["PATH lookup", { pathEnv: "PATH" }],
  ["cwd lookup", { cwd: "/tmp" }],
  ["predicate", { predicate: "isExecutable" }],
  ["authority", { authority: "live_authoritative" }],
  ["completeness", { completeness: "complete_fixture_structure" }],
  ["trusted true", { trusted: true }],
  ["resolved true", { resolved: true }],
  ["runner", { enablesPreflightRunnerOverride: true }],
  ["process start", { enablesProcessStartOverride: true }],
];

for (const [name, patch] of executableRequestPatches) {
  test(`executable request rejects ${name}`, () => {
    expectInvalid(validateTrustedExecutableResolutionRequest({ ...execFixture().request, ...patch }));
  });
}

const repositoryRequestPatches: Array<[string, Record<string, unknown>]> = [
  ["wrong kind", { requestKind: "repository_discovery" }],
  ["wrong version", { requestVersion: 2 }],
  ["malformed id", { requestId: "bad-id" }],
  ["session mismatch", { boundarySessionId: "other_session" }],
  ["resolver mismatch", { resolverIdentityFingerprint: "a".repeat(64) }],
  ["policy mismatch", { resolverPolicyId: "unknown" }],
  ["operation mismatch", { operation: "discover_repository" }],
  ["attempt zero", { attempt: 0 }],
  ["attempt two", { attempt: 2 }],
  ["retry policy", { retryPolicy: "retry_once" }],
  ["expired", { expiresAt: "2026-07-17T10:10:01.000Z" }],
  ["starting directory", { startingDirectory: "/tmp" }],
  ["parent traversal count", { parentTraversalCount: 2 }],
  ["cwd", { currentWorkingDirectory: "/tmp" }],
  ["arbitrary repository", { repositoryName: "trade" }],
  ["arbitrary path", { path: "/Users/example/trade" }],
  ["git discovery", { lookupCommand: "git rev-parse" }],
  ["environment root", { environmentRoot: "ROOT" }],
  ["home directory", { homeDirectory: "/Users/example" }],
  ["glob", { glob: "*" }],
  ["authority", { authority: "live_authoritative" }],
  ["trusted true", { trusted: true }],
  ["git enablement", { enablesGitOperationOverride: true }],
];

for (const [name, patch] of repositoryRequestPatches) {
  test(`repository request rejects ${name}`, () => {
    expectInvalid(validateTrustedRepositoryResolutionRequest({ ...repoFixture().request, ...patch }));
  });
}

const prohibitedKeys = [
  "pid",
  "ppid",
  "pgid",
  "uid",
  "gid",
  "PATH",
  "cwd",
  "shell",
  "command",
  "commandLine",
  "spawn",
  "exec",
  "realpath",
  "stat",
  "fileDescriptor",
  "trusted",
  "safe",
  "resolvedLive",
  "authoritativeLiveOverride",
  "enablesProcessStartOverride",
  "enablesPreflightRunnerOverride",
  "enablesGitOperationOverride",
] as const;

for (const key of prohibitedKeys) {
  test(`recursive prohibited key ${key} is rejected in executable request`, () => {
    expectInvalid(validateTrustedExecutableResolutionRequest({ ...execFixture().request, nested: [{ [key]: key === "trusted" || key === "safe" ? true : "value" }] }));
  });
}

const executableFixtureFlagPatches: Array<[string, Record<string, unknown>, string]> = [
  ["fixtureOnly false", { fixtureOnly: false }, "fixture_claimed_live_observation"],
  ["observed live", { observedLive: true }, "fixture_claimed_live_observation"],
  ["authoritative live", { authoritativeLive: true }, "fixture_claimed_live_authority"],
  ["existence proof", { provesExecutableExistsLive: true }, "fixture_claimed_live_existence_proof"],
  ["trust proof", { provesExecutableTrustedLive: true }, "fixture_claimed_live_trust_proof"],
  ["live capability", { issuesLiveExecutableCapability: true }, "fixture_claimed_live_capability"],
  ["process start", { enablesProcessStart: true }, "fixture_claimed_process_start"],
  ["runner", { enablesPreflightRunner: true }, "fixture_claimed_runner_enablement"],
];

for (const [name, patch, expectedReason] of executableFixtureFlagPatches) {
  test(`executable fixture rejects ${name}`, () => {
    const { request, observation, adapter } = execFixture();
    const result = adapter.resolveExecutableFixture({ request, candidates: [{ ...observation, ...patch }], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.blockingReasons).toContain(expectedReason);
  });
}

const repositoryFixtureFlagPatches: Array<[string, Record<string, unknown>, string]> = [
  ["fixtureOnly false", { fixtureOnly: false }, "fixture_claimed_live_observation"],
  ["observed live", { observedLive: true }, "fixture_claimed_live_observation"],
  ["authoritative live", { authoritativeLive: true }, "fixture_claimed_live_authority"],
  ["existence proof", { provesRepositoryExistsLive: true }, "fixture_claimed_live_existence_proof"],
  ["trust proof", { provesRepositoryTrustedLive: true }, "fixture_claimed_live_trust_proof"],
  ["live capability", { issuesLiveRepositoryCapability: true }, "fixture_claimed_live_capability"],
  ["git enablement", { enablesGitOperation: true }, "fixture_claimed_git_enablement"],
  ["process start", { enablesProcessStart: true }, "fixture_claimed_process_start"],
  ["runner", { enablesPreflightRunner: true }, "fixture_claimed_runner_enablement"],
];

for (const [name, patch, expectedReason] of repositoryFixtureFlagPatches) {
  test(`repository fixture rejects ${name}`, () => {
    const { request, observation, adapter } = repoFixture();
    const result = adapter.resolveRepositoryFixture({ request, candidates: [{ ...observation, ...patch }], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.blockingReasons).toContain(expectedReason);
  });
}

const freshnessPatches: Array<[string, Record<string, unknown>]> = [
  ["stale executable evidence", { evidenceExpiresAt: "2026-07-17T10:10:01.000Z" }],
  ["future-invalid observation order", { observationEndedAt: "2026-07-17T10:09:59.000Z" }],
  ["capture outside window", { evidenceCapturedAt: "2026-07-17T10:09:59.000Z" }],
  ["invalid timestamp", { evidenceCapturedAt: "not-date" }],
  ["timestamp without timezone", { evidenceCapturedAt: "2026-07-17T10:10:05.000" }],
];

for (const [name, patch] of freshnessPatches) {
  test(`executable fixture marks ${name}`, () => {
    const { request, observation, adapter } = execFixture();
    const result = adapter.resolveExecutableFixture({ request, candidates: [{ ...observation, ...patch }], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.ambiguityReasons).toContain("evidence_stale");
  });
}

test.describe("fingerprints, immutability, source isolation and end-to-end invariants", () => {
  test("fingerprint domains are present and deterministic lowercase sha256", () => {
    for (const domain of Object.values(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS)) {
      expect(domain).toContain("ture:trusted-live-resolver-adapter:");
    }
    const fingerprint = buildTrustedResolverIdentityFingerprint();
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(buildTrustedResolverIdentityFingerprint({ ...TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY, platform: "linux" })).not.toBe(fingerprint);
  });

  test("trust-critical mutations change result fingerprints", () => {
    const base = execFixture();
    const compatible = base.adapter.resolveExecutableFixture({ request: base.request, candidates: [base.observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    const blockedIdentity = buildFixtureExecutableIdentity({ ownershipState: "modeled_world_writable" });
    const blockedObservation = buildFixtureExecutableCandidateObservation(base.request, blockedIdentity, { candidateCapability: buildFixtureExecutableCandidateCapability(blockedIdentity) });
    const blocked = base.adapter.resolveExecutableFixture({ request: base.request, candidates: [blockedObservation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(blocked.resultFingerprint).not.toBe(compatible.resultFingerprint);
    expect(blocked.evidence.evidenceFingerprint).not.toBe(compatible.evidence.evidenceFingerprint);
  });

  test("inputs are not mutated and identical invocations are deeply equal", () => {
    const { request, observation, adapter } = execFixture();
    const before = JSON.stringify({ request, observation });
    const first = adapter.resolveExecutableFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    const second = adapter.resolveExecutableFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(JSON.stringify({ request, observation })).toBe(before);
    expect(second).toEqual(first);
    expect(() => ((first as unknown as { fixtureOnly: boolean }).fixtureOnly = false)).toThrow();
  });

  test("source contains no prohibited live imports or APIs", () => {
    const implementation = `${source(corePath)}\n${source(boundaryPath)}`;
    expect(implementation).not.toMatch(/node:fs|from ['"]fs['"]|fs\/promises|stat\(|lstat\(|realpath\(|path\.resolve|process\.env|process\.cwd|process\.execPath|process\.arch|child_process|spawn\(|exec\(|execFile\(|fork\(/u);
    expect(implementation).not.toMatch(/git rev-parse|git status|\bwhich\b|\bsysctl\b|\barch\b|osascript/u);
    expect(implementation).not.toMatch(/fetch\(|XMLHttpRequest|localStorage|sessionStorage/u);
  });

  test("server-only boundary is not wired into API Trade UI or runner", () => {
    expect(source(boundaryPath).startsWith('import "server-only";')).toBe(true);
    expect(source(apiPath)).not.toContain("post-trade-trusted-live-resolver-adapter");
    expect(source(tradeUiPath)).not.toContain("post-trade-trusted-live-resolver-adapter");
  });

  test("compatible fixtures cannot issue live capabilities enable Git process start or runner", () => {
    const executable = execFixture();
    const repository = repoFixture();
    const executableResult = executable.adapter.resolveExecutableFixture({ request: executable.request, candidates: [executable.observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    const repositoryResult = repository.adapter.resolveRepositoryFixture({ request: repository.request, candidates: [repository.observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(executableResult.evidence.issuesLiveExecutableCapability).toBe(false);
    expect(executableResult.evidence.enablesProcessStart).toBe(false);
    expect(executableResult.evidence.enablesPreflightRunner).toBe(false);
    expect(repositoryResult.evidence.issuesLiveRepositoryCapability).toBe(false);
    expect(repositoryResult.evidence.enablesGitOperation).toBe(false);
    expect(repositoryResult.evidence.enablesProcessStart).toBe(false);
    expect(repositoryResult.evidence.enablesPreflightRunner).toBe(false);
  });
});

const bulkPathMutations = Array.from({ length: 40 }, (_, index) => [`bulk invalid structural path ${index}`, `/tmp/tool${index}${index % 2 === 0 ? "/.." : "*"}`] as const);
for (const [name, path] of bulkPathMutations) {
  test(name, () => {
    expect(validateFixtureAbsoluteMacosPath(path).length).toBeGreaterThan(0);
  });
}

const bulkExecutableStateMutations = [
  "filesystemObjectType",
  "executablePermissionState",
  "ownershipState",
  "provenanceState",
  "symlinkState",
  "architectureState",
  "rosettaState",
] as const;
for (let index = 0; index < 90; index += 1) {
  test(`bulk executable adversarial mutation ${index}`, () => {
    const { request, adapter } = execFixture(index % 2 === 0 ? "git" : "supabase_cli");
    const key = bulkExecutableStateMutations[index % bulkExecutableStateMutations.length];
    const patch: Record<string, unknown> = {};
    patch[key] =
      key === "filesystemObjectType" ? "unknown" :
      key === "executablePermissionState" ? "unknown" :
      key === "ownershipState" ? "ownership_ambiguous" :
      key === "provenanceState" ? "provenance_ambiguous" :
      key === "symlinkState" ? "symlink_state_ambiguous" :
      key === "architectureState" ? "architecture_ambiguous" :
      "rosetta_state_ambiguous";
    const identity = buildFixtureExecutableIdentity({ boundarySessionId: request.boundarySessionId, expectedToolIdentity: request.expectedToolIdentity, ...patch });
    const observation = buildFixtureExecutableCandidateObservation(request, identity, { candidateCapability: buildFixtureExecutableCandidateCapability(identity) });
    const result = adapter.resolveExecutableFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.disposition).not.toBe("compatible_fixture_candidate");
  });
}

const bulkRepositoryStateMutations = ["filesystemObjectType", "repositoryMarkerState", "ownershipState", "provenanceState", "symlinkState"] as const;
for (let index = 0; index < 70; index += 1) {
  test(`bulk repository adversarial mutation ${index}`, () => {
    const { request, adapter } = repoFixture();
    const key = bulkRepositoryStateMutations[index % bulkRepositoryStateMutations.length];
    const patch: Record<string, unknown> = {};
    patch[key] =
      key === "filesystemObjectType" ? "unknown" :
      key === "repositoryMarkerState" ? "repository_marker_ambiguous" :
      key === "ownershipState" ? "ownership_ambiguous" :
      key === "provenanceState" ? "provenance_ambiguous" :
      "symlink_state_ambiguous";
    const identity = buildFixtureRepositoryIdentity({ boundarySessionId: request.boundarySessionId, ...patch });
    const observation = buildFixtureRepositoryCandidateObservation(request, identity, { candidateCapability: buildFixtureRepositoryCandidateCapability(identity) });
    const result = adapter.resolveRepositoryFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.disposition).not.toBe("compatible_fixture_repository");
  });
}

for (let index = 0; index < 35; index += 1) {
  test(`bulk recursive prohibited payload rejection ${index}`, () => {
    const key = prohibitedKeys[index % prohibitedKeys.length];
    const request = { ...execFixture().request, fixtureBag: [{ nested: { [key]: "blocked" } }] };
    expectInvalid(validateTrustedExecutableResolutionRequest(request));
  });
}

test("legitimate exact schema field names are not false positives", () => {
  const { request, observation } = execFixture();
  expect(validateTrustedExecutableResolutionRequest(request).ok).toBe(true);
  expect(validateExecutableCandidateObservation(observation, request).blocking).not.toContain("request_invalid");
  const repository = repoFixture();
  expect(validateTrustedRepositoryResolutionRequest(repository.request).ok).toBe(true);
  expect(validateRepositoryCandidateObservation(repository.observation, repository.request).blocking).not.toContain("request_invalid");
});
