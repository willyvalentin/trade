import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POST_TRADE_TRUSTED_RESOLVER_ID,
  POST_TRADE_TRUSTED_REPOSITORY_IDENTITY,
  buildCandidateSetFingerprint,
  buildExecutableCandidateFingerprint,
  buildExecutableCandidateObservation,
  buildExecutableCapabilityFingerprint,
  buildExecutableCapabilityMetadata,
  buildExecutableResolutionPolicy,
  buildRepositoryCapabilityFingerprint,
  buildRepositoryCwdCapabilityMetadata,
  buildRepositoryResolutionPolicy,
  buildRepositoryResolutionPolicyFingerprint,
  buildRepositoryRootObservation,
  buildResolverRevalidationFingerprint,
  buildSanitizedResolverEvidence,
  buildSanitizedResolverEvidenceFingerprint,
  buildTrustedResolverCompatibilityFingerprint,
  buildTrustedResolverCompatibilitySummary,
  buildTrustedResolverInertPlan,
  buildTrustedResolverRegistry,
  buildTrustedResolverRegistryFingerprint,
  buildExecutableResolutionPolicyFingerprint,
  buildResolverRevalidationObservation,
  evaluateExecutableCandidateSet,
  validateExecutableCandidateObservation,
  validateExecutableCapabilityMetadata,
  validateExecutableResolutionPolicy,
  validateFixtureAdapterShape,
  validateRepositoryCwdCapabilityMetadata,
  validateRepositoryResolutionPolicy,
  validateRepositoryRootObservation,
  validateResolverRevalidationObservation,
  validateSanitizedResolverEvidence,
  validateTrustedResolverCompatibility,
  validateTrustedResolverInertPlan,
  validateTrustedResolverRegistry,
} from "../../lib/post-trade-first-live-read-only-preflight-trusted-resolver-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-first-live-read-only-preflight-trusted-resolver-core.ts";
const boundaryPath = "lib/post-trade-first-live-read-only-preflight-trusted-resolver.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rehashObject(
  input: Record<string, unknown>,
  fingerprintKey: string,
  algorithmKey: string,
  buildFingerprint: (input: unknown) => string,
): Record<string, unknown> {
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  return {
    ...core,
    [algorithmKey]: "sha256",
    [fingerprintKey]: buildFingerprint(core),
  };
}

function fixtureAdapter() {
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    adapter: {
      adapterId: "post_trade_trusted_resolver_fixture_adapter_v1",
      fixtureOnly: true,
      observedLive: false,
      collectExecutableCandidateFixtureObservations: () => {
        calls += 1;
        return [buildExecutableCandidateObservation("git_cli")];
      },
      collectRepositoryFixtureObservation: () => {
        calls += 1;
        return buildRepositoryRootObservation();
      },
      collectFixtureRevalidationObservation: () => {
        calls += 1;
        return buildResolverRevalidationObservation();
      },
    disposeFixtureTransientMetadata: () => {
      calls += 1;
      return { disposed: true, fixtureOnly: true } as const;
    },
    },
  } as const;
}

test.describe("post-trade trusted executable and repository cwd resolver boundary", () => {
  test("canonical resolver registry and boundary are exact, macOS-only, fixture-only, no-live-resolution, and no-run", () => {
    const registry = buildTrustedResolverRegistry();
    const boundarySource = source(boundaryPath);
    expect(validateTrustedResolverRegistry(registry).valid).toBe(true);
    expect(registry).toMatchObject({
      resolverId: POST_TRADE_TRUSTED_RESOLVER_ID,
      platform: "macos",
      targetStagingProjectRef: "pdvzyuhykomwfqyyztru",
      rejectedProductionProjectRef: "ekdyopdrrkphlrsilyoo",
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
    });
    expect(boundarySource.startsWith('import "server-only";')).toBe(true);
    expect(boundarySource).toContain("defaultLiveResolverPresent: false");
    expect(boundarySource).toContain("fixtureAdaptersOnly: true");
    expect(boundarySource).toContain("callsAdapterOnImport: false");
    expect(boundarySource).toContain("callsAdapterOnConstruction: false");
    expect(boundarySource).toContain("canResolveLiveExecutable: false");
    expect(boundarySource).toContain("canInspectPath: false");
    expect(boundarySource).toContain("canInspectFilesystem: false");
    expect(boundarySource).toContain("canReadEnvironment: false");
    expect(boundarySource).toContain("canAccessCredential: false");
    expect(boundarySource).toContain("canSpawnProcess: false");
    for (const patch of [
      { resolverId: "reviewed_macos_preflight_executable_and_cwd_resolver_v1_suffix" },
      { resolverId: "REVIEWED_MACOS_PREFLIGHT_EXECUTABLE_AND_CWD_RESOLVER_V1" },
      { platform: "linux" },
      { platform: "windows" },
      { noPathFallback: false },
      { callerPathAllowed: true },
      { shellLookupAllowed: true },
      { whichLookupAllowed: true },
      { commandVLookupAllowed: true },
      { genericFilesystemLookupAllowed: true },
      { automaticFallbackAllowed: true },
      { environmentSelectedResolverAllowed: true },
      { callerSelectedResolverAllowed: true },
      { liveImplementationPresent: true },
      { observedLive: true },
      { fixtureOnly: false },
    ]) {
      expect(validateTrustedResolverRegistry({ ...registry, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("source remains pure resolver boundary only with no PATH/filesystem/process/Git/Supabase/env/credential/API/UI/runtime wiring", () => {
    const combined = `${source(corePath)}\n${source(boundaryPath)}`;
    const apiAndUi = `${source(apiPath)}\n${source(tradeUiPath)}`;
    expect(combined).not.toMatch(/node:fs|from ["']fs["']|readFile|readdir|statSync|lstatSync|realpath|node:child_process|child_process|spawn\(|exec\(|execFile|process\.env|@supabase|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|storage\.|git\s+--version|supabase\s+--version|command -v|which\s|osascript|open\s+|ps\s+-|kill\(/i);
    expect(combined).not.toMatch(/from ["']@\/app|from ["']@\/components|trade-app|avanza|browser automation/i);
    expect(apiAndUi).not.toContain("post-trade-first-live-read-only-preflight-trusted-resolver");
  });

  test("exact Git Supabase and repository policies exist and reject caller paths, PATH fallback, shell lookup, wrappers, scripts, aliases, unknown architecture, unsafe provenance, and public paths", () => {
    const git = buildExecutableResolutionPolicy("git_cli");
    const supabase = buildExecutableResolutionPolicy("supabase_cli");
    const repository = buildRepositoryResolutionPolicy();
    expect(validateExecutableResolutionPolicy(git).valid).toBe(true);
    expect(validateExecutableResolutionPolicy(supabase).valid).toBe(true);
    expect(validateRepositoryResolutionPolicy(repository).valid).toBe(true);
    expect(git.expectedBasename).toBe("git");
    expect(supabase.expectedBasename).toBe("supabase");
    for (const patch of [
      { wrapperAllowed: true },
      { scriptProxyAllowed: true },
      { aliasAllowed: true },
      { shellFunctionAllowed: true },
      { unresolvedSymlinkAllowed: true },
      { worldWritableExecutableAllowed: true },
      { worldWritableParentAllowed: true },
      { ambiguousOwnershipAllowed: true },
      { unsupportedArchitectureAllowed: true },
      { unknownArchitectureAllowed: true },
      { unreviewedRosettaAllowed: true },
      { unknownProvenanceAllowed: true },
      { multipleMatchesAllowed: true },
      { stableFileIdentityRequired: false },
      { fallbackAllowed: true },
      { publicPathAllowed: true },
    ]) {
      expect(validateExecutableResolutionPolicy({ ...git, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    for (const patch of [
      { repositoryMarkerRequired: false },
      { gitWorktreeRequired: false },
      { nestedUnrelatedRepositoryAllowed: true },
      { bareRepositoryAllowed: true },
      { symlinkRootAllowed: true },
      { productionCheckoutAllowed: true },
      { callerSelectedPathAllowed: true },
      { publicAbsolutePathAllowed: true },
      { homePathExposureAllowed: true },
      { stagingOnlyContextRequired: false },
      { revalidationRequired: false },
    ]) {
      expect(validateRepositoryResolutionPolicy({ ...repository, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("candidate-set evaluation fails closed for zero, multiple, mixed component, and unsafe executable observations without preferring first shortest newest system or package-manager candidates", () => {
    const git = buildExecutableCandidateObservation("git_cli");
    const supabase = buildExecutableCandidateObservation("supabase_cli");
    expect(evaluateExecutableCandidateSet([git], "git_cli").valid).toBe(true);
    expect(evaluateExecutableCandidateSet([], "git_cli").blockingReasons).toContain("zero_candidates");
    expect(evaluateExecutableCandidateSet([git, git], "git_cli").blockingReasons).toEqual(
      expect.arrayContaining(["duplicate_candidate_ids", "duplicate_stable_identities", "multiple_candidates"]),
    );
    expect(evaluateExecutableCandidateSet([supabase], "git_cli").blockingReasons).toContain("mixed_component_candidates");
    expect(
      evaluateExecutableCandidateSet(
        [
          git,
          rehashObject(
            { ...git, candidateOpaqueId: "post_trade_git_cli_opaque_candidate_002", resolverId: "reviewed_macos_preflight_executable_and_cwd_resolver_v1_alias" },
            "observationFingerprint",
            "observationFingerprintAlgorithm",
            buildExecutableCandidateFingerprint,
          ) as never,
        ],
        "git_cli",
      ).blockingReasons,
    ).toEqual(expect.arrayContaining(["mixed_resolver_candidates", "candidate_wrong_resolver"]));
    expect(
      evaluateExecutableCandidateSet(
        [
          git,
          rehashObject(
            { ...git, candidateOpaqueId: "post_trade_git_cli_opaque_candidate_003", observationSourceIdentity: "path_lookup" },
            "observationFingerprint",
            "observationFingerprintAlgorithm",
            buildExecutableCandidateFingerprint,
          ) as never,
        ],
        "git_cli",
      ).blockingReasons,
    ).toEqual(expect.arrayContaining(["mixed_source_candidates", "candidate_wrong_observation_source"]));
    for (const patch of [
      { basenameObserved: "supabase" },
      { fileTypeClassification: "wrapper" },
      { fileTypeClassification: "script_proxy" },
      { fileTypeClassification: "alias" },
      { fileTypeClassification: "shell_function" },
      { executablePermissionClassification: "not_executable" },
      { symlinkClassification: "unresolved" },
      { symlinkClassification: "relative_unsafe" },
      { symlinkClassification: "loop" },
      { symlinkClassification: "excessive_depth" },
      { symlinkClassification: "changed_target" },
      { wrapperClassification: "wrapper" },
      { scriptClassification: "script_proxy" },
      { ownershipClassification: "ambiguous" },
      { ownershipClassification: "untrusted" },
      { parentPermissionClassification: "executable_world_writable" },
      { parentPermissionClassification: "parent_world_writable" },
      { architectureClassification: "unsupported" },
      { architectureClassification: "unknown" },
      { architectureClassification: "ambiguous" },
      { rosettaClassification: "unreviewed_rosetta" },
      { provenanceClassification: "unknown" },
      { provenanceClassification: "untrusted" },
      { stableFileIdentityClassification: "changed" },
      { sizeClassification: "changed" },
      { modificationStateClassification: "changed" },
      { complete: false },
      { authoritativeFixture: false },
      { observedLive: true },
      { fixtureOnly: false },
      { callerSelectedCandidate: true },
      { fallbackCandidate: true },
      { productionSpecificWrapper: true },
      { publicPathAbsent: false },
      { pathValue: "/Users/example/bin/git" },
    ]) {
      expect(validateExecutableCandidateObservation({ ...git, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    expect(validateExecutableCandidateObservation(buildExecutableCandidateObservation("git_cli", { architectureClassification: "arm64_native" })).valid).toBe(true);
    expect(validateExecutableCandidateObservation(buildExecutableCandidateObservation("git_cli", { architectureClassification: "x86_64_native" })).valid).toBe(true);
    expect(validateExecutableCandidateObservation(buildExecutableCandidateObservation("git_cli", { architectureClassification: "x86_64_under_rosetta", rosettaClassification: "reviewed_rosetta" })).valid).toBe(true);
  });

  test("recomputed fingerprints cannot launder unsafe resolver identity, candidate source, capability scope, provenance, repository identity, path, token, or JWT-like values", () => {
    const candidate = buildExecutableCandidateObservation("git_cli");
    const executableCapability = buildExecutableCapabilityMetadata(candidate);
    const repositoryCapability = buildRepositoryCwdCapabilityMetadata();
    const evidence = buildSanitizedResolverEvidence("git_cli");
    const recomputedWrongResolver = rehashObject(
      { ...candidate, resolverId: "reviewed_macos_preflight_executable_and_cwd_resolver_v1_alias" },
      "observationFingerprint",
      "observationFingerprintAlgorithm",
      buildExecutableCandidateFingerprint,
    );
    expect(validateExecutableCandidateObservation(recomputedWrongResolver).blockingReasons).toContain("candidate_wrong_resolver");
    expect(
      validateExecutableCandidateObservation(
        rehashObject(
          { ...candidate, observationSourceIdentity: "command_v_lookup" },
          "observationFingerprint",
          "observationFingerprintAlgorithm",
          buildExecutableCandidateFingerprint,
        ),
      ).blockingReasons,
    ).toContain("candidate_wrong_observation_source");
    expect(
      validateExecutableCapabilityMetadata(
        rehashObject(
          { ...executableCapability, provenanceClassification: "unknown" },
          "capabilityFingerprint",
          "capabilityFingerprintAlgorithm",
          buildExecutableCapabilityFingerprint,
        ),
      ).blockingReasons,
    ).toContain("executable_capability_unsafe_provenance");
    expect(
      validateExecutableCapabilityMetadata(
        rehashObject(
          { ...executableCapability, operationScope: "preflight_unreviewed_operation" },
          "capabilityFingerprint",
          "capabilityFingerprintAlgorithm",
          buildExecutableCapabilityFingerprint,
        ),
      ).blockingReasons,
    ).toContain("executable_capability_unknown_operation");
    expect(
      validateRepositoryCwdCapabilityMetadata(
        rehashObject(
          { ...repositoryCapability, repositoryIdentity: "generic_repository_root" },
          "capabilityFingerprint",
          "capabilityFingerprintAlgorithm",
          buildRepositoryCapabilityFingerprint,
        ),
      ).blockingReasons,
    ).toContain("repository_capability_wrong_repository");
    expect(
      validateSanitizedResolverEvidence(
        rehashObject(
          { ...evidence, publicPath: "/Users/example/bin/git" },
          "evidenceFingerprint",
          "evidenceFingerprintAlgorithm",
          buildSanitizedResolverEvidenceFingerprint,
        ),
      ).blockingReasons,
    ).toEqual(expect.arrayContaining(["sensitive_material_present", "unknown_resolver_evidence_field:publicPath"]));
    expect(
      validateSanitizedResolverEvidence(
        rehashObject(
          { ...evidence, credentialNote: "service role token must never appear" },
          "evidenceFingerprint",
          "evidenceFingerprintAlgorithm",
          buildSanitizedResolverEvidenceFingerprint,
        ),
      ).blockingReasons,
    ).toEqual(expect.arrayContaining(["sensitive_material_present", "unknown_resolver_evidence_field:credentialNote"]));
    expect(
      validateSanitizedResolverEvidence(
        rehashObject(
          {
            ...evidence,
            tokenShape: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.redacted.redacted",
          },
          "evidenceFingerprint",
          "evidenceFingerprintAlgorithm",
          buildSanitizedResolverEvidenceFingerprint,
        ),
      ).blockingReasons,
    ).toEqual(expect.arrayContaining(["sensitive_material_present", "unknown_resolver_evidence_field:tokenShape"]));
  });

  test("executable capability metadata is private fixture-only single-use and rejects cross component/session/driver/operation, stale, reused, changed identity, changed architecture provenance permission or symlink", () => {
    const candidate = buildExecutableCandidateObservation("git_cli");
    const capability = buildExecutableCapabilityMetadata(candidate);
    expect(validateExecutableCapabilityMetadata(capability).valid).toBe(true);
    expect(JSON.stringify(capability)).not.toMatch(/\/Users\/|PATH=|pathValue|rawOwner|rawInode|credential|secret/i);
    for (const patch of [
      { executableIdentity: "supabase_cli" },
      { boundarySession: "other_session" },
      { driverIdentity: "other_driver" },
      { operationScope: "preflight_supabase_migration_history" },
      { expiresAtIso: "2026-07-17T09:59:00.000Z" },
      { singleUse: false },
      { used: true },
      { architectureClassification: "unknown" },
      { provenanceClassification: "unknown" },
      { permissionClassification: "parent_world_writable" },
      { symlinkClassification: "changed_target" },
      { observedLive: true },
      { fixtureOnly: false },
      { revalidationRequired: false },
      { spawnEnabled: true },
      { runnerEnabled: true },
    ]) {
      expect(validateExecutableCapabilityMetadata({ ...capability, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("repository observation and CWD capability bind the exact Ture repository identity without path exposure and reject wrong project, missing marker, nested, bare, symlink, production, stale, and generic verification", () => {
    const observation = buildRepositoryRootObservation();
    const capability = buildRepositoryCwdCapabilityMetadata(observation);
    expect(validateRepositoryRootObservation(observation).valid).toBe(true);
    expect(validateRepositoryCwdCapabilityMetadata(capability).valid).toBe(true);
    expect(JSON.stringify({ observation, capability })).not.toMatch(/\/Users\/|cwdPath|absolutePath|homePath|pathValue/i);
    for (const patch of [
      { rootClassification: "ambiguous" },
      { rootClassification: "wrong_project" },
      { gitWorktreeClassification: "bare" },
      { repositoryMarkerClassification: "missing" },
      { projectMarkerClassification: "alternate_project" },
      { nestedRepositoryClassification: "nested_unrelated" },
      { symlinkClassification: "symlink_root" },
      { productionReferenceClassification: "production_checkout" },
      { stableDirectoryIdentityClassification: "changed" },
      { observedAtIso: "2026-07-17T09:59:00.000Z" },
      { observedAtIso: "2026-07-17T10:01:00.000Z" },
      { complete: false },
      { authoritativeFixture: false },
      { observedLive: true },
      { fixtureOnly: false },
      { callerSelectedPath: true },
      { publicPathAbsent: false },
      { verified: true },
    ]) {
      expect(validateRepositoryRootObservation({ ...observation, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    for (const patch of [
      { boundarySession: "other_session" },
      { driverIdentity: "other_driver" },
      { used: true },
      { singleUse: false },
      { observedLive: true },
      { fixtureOnly: false },
      { revalidationRequired: false },
      { spawnEnabled: true },
      { runnerEnabled: true },
    ]) {
      expect(validateRepositoryCwdCapabilityMetadata({ ...capability, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("TOCTOU revalidation remains a fixture contract only and blocks changed stale incomplete ambiguous failed or elimination-claim states", () => {
    const unchanged = buildResolverRevalidationObservation();
    expect(validateResolverRevalidationObservation(unchanged).valid).toBe(true);
    for (const patch of [
      { classification: "changed" },
      { classification: "stale" },
      { classification: "incomplete" },
      { classification: "ambiguous" },
      { classification: "failed" },
      { samePrivateIdentity: false },
      { sameFileTypeOrRepositoryMarkers: false },
      { sameSymlinkChain: false },
      { sameOwnershipOrProjectIdentity: false },
      { samePermissionsOrWorktree: false },
      { sameArchitecture: false },
      { sameRosettaClassification: false },
      { sameProvenance: false },
      { sameSizeAndModificationState: false },
      { sameBoundarySession: false },
      { sameResolver: false },
      { sameDriver: false },
      { capabilityUnexpired: false },
      { complete: false },
      { observedLive: true },
      { fixtureOnly: false },
      { fullTocTouEliminationClaimed: true },
    ]) {
      expect(validateResolverRevalidationObservation({ ...unchanged, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("fixture adapter boundary is exact, not called on import construction validation compatibility or planning, and rejects generic filesystem path env process and credential methods", () => {
    const harness = fixtureAdapter();
    expect(validateFixtureAdapterShape(harness.adapter).valid).toBe(true);
    expect(harness.calls).toBe(0);
    const boundarySource = source(boundaryPath);
    expect(boundarySource).toContain("createFixtureOnlyTrustedResolverBoundary");
    expect(boundarySource).toContain("liveResolutionEnabled: false");
    expect(boundarySource).not.toMatch(/lookupPath|statFile|listDirectory|readFile|readPathVariable|readEnvironment|shellCommand|spawnProcess|getCredential/);
    expect(validateTrustedResolverCompatibility(buildTrustedResolverCompatibilitySummary()).valid).toBe(true);
    expect(validateTrustedResolverInertPlan(buildTrustedResolverInertPlan()).valid).toBe(true);
    expect(harness.calls).toBe(0);
    for (const patch of [
      { lookupPath: () => null },
      { statFile: () => null },
      { listDirectory: () => [] },
      { readFile: () => "" },
      { readPathVariable: () => "" },
      { readEnvironment: () => ({}) },
      { shellCommand: () => "" },
      { spawnProcess: () => null },
      { getCredential: () => null },
      { observedLive: true },
      { fixtureOnly: false },
    ]) {
      expect(validateFixtureAdapterShape({ ...harness.adapter, ...patch }).valid, Object.keys(patch).join(",")).toBe(false);
    }
  });

  test("sanitized resolver evidence is fixture-only non-authoritative and cannot enable spawn runner or prove live executable or repository existence", () => {
    for (const evidence of [buildSanitizedResolverEvidence("git_cli"), buildSanitizedResolverEvidence(POST_TRADE_TRUSTED_REPOSITORY_IDENTITY)]) {
      expect(validateSanitizedResolverEvidence(evidence).valid).toBe(true);
      expect(evidence).toMatchObject({
        fixtureOnly: true,
        observedLive: false,
        authoritativeLive: false,
        canEnableSpawn: false,
        canEnableRunner: false,
        provesExecutableExists: false,
        provesRepositoryExists: false,
      });
      expect(JSON.stringify(evidence)).not.toMatch(/\/Users\/|PATH=|cwdPath|owner id|inode|credential|secret|postgres:\/\//i);
      for (const patch of [
        { fixtureOnly: false },
        { observedLive: true },
        { authoritativeLive: true },
        { canEnableSpawn: true },
        { canEnableRunner: true },
        { provesExecutableExists: true },
        { provesRepositoryExists: true },
        { publicPath: "/Users/example/bin/git" },
      ]) {
        expect(validateSanitizedResolverEvidence({ ...evidence, ...patch }).valid, JSON.stringify(patch)).toBe(false);
      }
    }
  });

  test("fingerprints are deterministic, exact, array-order-bound, and reject changed fields partial prefix malformed unsupported nested production URL path and cycles", () => {
    const registry = buildTrustedResolverRegistry();
    const executablePolicy = buildExecutableResolutionPolicy("git_cli");
    const repositoryPolicy = buildRepositoryResolutionPolicy();
    const candidate = buildExecutableCandidateObservation("git_cli");
    const capability = buildExecutableCapabilityMetadata(candidate);
    const repositoryCapability = buildRepositoryCwdCapabilityMetadata();
    const revalidation = buildResolverRevalidationObservation();
    const evidence = buildSanitizedResolverEvidence("git_cli");
    const compatibility = buildTrustedResolverCompatibilitySummary();
    expect(buildTrustedResolverRegistryFingerprint({ ...registry, resolverFingerprint: undefined })).not.toBe(registry.resolverFingerprint);
    expect(buildExecutableResolutionPolicyFingerprint({ ...executablePolicy, policyFingerprint: undefined })).not.toBe(executablePolicy.policyFingerprint);
    expect(buildRepositoryResolutionPolicyFingerprint({ ...repositoryPolicy, policyFingerprint: undefined })).not.toBe(repositoryPolicy.policyFingerprint);
    expect(buildExecutableCandidateFingerprint({ ...candidate, observationFingerprint: undefined })).not.toBe(candidate.observationFingerprint);
    expect(buildCandidateSetFingerprint([candidate])).not.toBe(buildCandidateSetFingerprint([buildExecutableCandidateObservation("supabase_cli")]));
    expect(buildExecutableCapabilityFingerprint({ ...capability, capabilityFingerprint: undefined })).not.toBe(capability.capabilityFingerprint);
    expect(buildRepositoryCapabilityFingerprint({ ...repositoryCapability, capabilityFingerprint: undefined })).not.toBe(repositoryCapability.capabilityFingerprint);
    expect(buildResolverRevalidationFingerprint({ ...revalidation, revalidationFingerprint: undefined })).not.toBe(revalidation.revalidationFingerprint);
    expect(buildSanitizedResolverEvidenceFingerprint({ ...evidence, evidenceFingerprint: undefined })).not.toBe(evidence.evidenceFingerprint);
    expect(buildTrustedResolverCompatibilityFingerprint({ ...compatibility, compatibilityFingerprint: undefined })).not.toBe(compatibility.compatibilityFingerprint);
    expect(validateTrustedResolverRegistry({ ...registry, resolverFingerprint: registry.resolverFingerprint.slice(0, 12) }).valid).toBe(false);
    expect(validateTrustedResolverRegistry({ ...registry, resolverFingerprint: `z${registry.resolverFingerprint.slice(1)}` }).valid).toBe(false);
    expect(validateTrustedResolverRegistry({ ...registry, targetStagingProjectRef: "ekdyopdrrkphlrsilyoo" }).valid).toBe(false);
    expect(validateSanitizedResolverEvidence({ ...evidence, note: "https://ekdyopdrrkphlrsilyoo.supabase.co" }).valid).toBe(false);
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => buildTrustedResolverRegistryFingerprint(cyclic)).toThrow(/cyclic/);
  });

  test("compatibility and inert plan preserve reviewed boundaries and perform no adapter call, PATH inspection, filesystem inspection, process start, runner enablement, persistence, or authorization consumption", () => {
    const compatibility = buildTrustedResolverCompatibilitySummary();
    const plan = buildTrustedResolverInertPlan();
    expect(validateTrustedResolverCompatibility(compatibility).valid).toBe(true);
    expect(validateTrustedResolverInertPlan(plan).valid).toBe(true);
    for (const patch of [
      { preservesExecutableRegistry: false },
      { preservesArchitecturePolicy: false },
      { preservesRosettaPolicy: false },
      { preservesOwnershipPolicy: false },
      { preservesPermissionPolicy: false },
      { preservesSymlinkPolicy: false },
      { preservesProvenancePolicy: false },
      { preservesCapabilityLifetime: false },
      { preservesStableIdentityPolicy: false },
      { preservesTocTouRequirement: false },
      { preservesOneProcessAtATime: false },
      { preservesOneSession: false },
      { preservesNoRetry: false },
      { preservesStagingOnly: false },
      { preservesNoShell: false },
      { deploymentCount: 1 },
      { sqlMutationCount: 1 },
      { dataMutationCount: 1 },
      { adapterCalls: 1 },
    ]) {
      expect(validateTrustedResolverCompatibility({ ...compatibility, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    for (const key of ["containsPath", "containsPathVariable", "containsCwd", "containsCommand", "containsFilesystemOperation", "containsEnvironmentValue", "containsCredential", "containsPid", "containsRawMetadata", "containsSql", "containsDeployment", "containsRetry", "liveResolutionPerformed", "adapterCalled", "processStarted"] as const) {
      expect(validateTrustedResolverInertPlan({ ...plan, [key]: true }).valid, key).toBe(false);
    }
  });
});
