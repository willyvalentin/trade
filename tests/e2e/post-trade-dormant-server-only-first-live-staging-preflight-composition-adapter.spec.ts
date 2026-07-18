import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_POLICY,
  composeDormantServerOnlyFirstLiveStagingPreflightCore,
  neutralizeOriginalFirstLiveResolverResultCore,
} from "../../lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";
import {
  buildFirstLiveTrustedResolverCandidateObservation,
  FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY,
  evaluateFirstLiveTrustedExecutableResolution,
  getFirstLiveTrustedResolverPolicy,
  type FirstLiveTrustedResolverCandidatePolicy,
  type FirstLiveTrustedExecutableResolutionResult,
  type FirstLiveTrustedResolverToolIdentity,
} from "../../lib/post-trade-first-live-trusted-resolver-adapter-core";
import {
  buildFixtureExecutableIdentity,
  buildResolverSessionCapability,
  buildTrustedExecutableResolutionRequest,
  type TrustedExecutableResolutionRequest,
} from "../../lib/post-trade-trusted-live-resolver-adapter-core";

const repoRoot = process.cwd();
const adapterPath = "lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.ts";
const corePath = "lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core.ts";
const liveResolverPath = "lib/post-trade-first-live-trusted-resolver-adapter.ts";
const apiValidationRoutePath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function makeRequest(tool: FirstLiveTrustedResolverToolIdentity = "git", session = buildResolverSessionCapability()): TrustedExecutableResolutionRequest {
  const identity = buildFixtureExecutableIdentity({
    boundarySessionId: session.boundarySessionId,
    expectedToolIdentity: tool,
    approvedRootClass: tool === "git" ? "system_usr_bin" : "homebrew_bin",
  });
  return buildTrustedExecutableResolutionRequest(session, identity);
}

const TEST_LIVE_RESOLVER_PROVENANCE = new WeakSet<object>();

function markTestLiveResolverProvenance<T extends object>(input: T): T {
  TEST_LIVE_RESOLVER_PROVENANCE.add(input);
  return input;
}

function hasTestLiveResolverProvenance(input: unknown): boolean {
  return typeof input === "object" && input !== null && TEST_LIVE_RESOLVER_PROVENANCE.has(input);
}

function candidateFor(tool: FirstLiveTrustedResolverToolIdentity): FirstLiveTrustedResolverCandidatePolicy {
  const candidate = getFirstLiveTrustedResolverPolicy().candidatePolicies.find((item) => item.toolIdentity === tool);
  if (!candidate) throw new Error(`missing ${tool} candidate policy`);
  return candidate;
}

function resolvedFixture(tool: FirstLiveTrustedResolverToolIdentity = "git", request = makeRequest(tool)) {
  const candidate = candidateFor(tool);
  const resolverResult = evaluateFirstLiveTrustedExecutableResolution({
    request,
    platform: "darwin",
    candidateObservations: [
      buildFirstLiveTrustedResolverCandidateObservation({
        observationSource: "test_synthetic_metadata",
        candidateId: candidate.candidateId,
        observedPath: candidate.absolutePath,
        outcome: "ok",
        fileType: "regular_file",
        executablePermission: "executable",
        metadata: { deviceId: "action-540-device", inode: `action-540-${tool}-inode`, sizeBytes: 12345, mode: 0o100755, modifiedTimeMs: 1000, changedTimeMs: 1001 },
      }),
    ],
  });
  expect(resolverResult.status).toBe("resolved_live_filesystem_evidence");
  return { request, resolverResult: markTestLiveResolverProvenance(resolverResult) };
}

function jsonClone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T;
}

test.describe("dormant server-only first-live staging preflight composition adapter Action 540", () => {
  test("adapter identity is server-only dormant and distinct from the live resolver identity", () => {
    expect(DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY).toMatchObject({
      serverOnly: true,
      dormant: true,
      authoritativeLive: false,
      enablesFilesystemAuthority: false,
      enablesProcessStart: false,
      enablesObserverAuthority: false,
      enablesCredentialAccess: false,
      enablesNetworkAccess: false,
      enablesPreflightRunner: false,
    });
    expect(DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId).toBe(
      "ture.execution.dormant-server-only-first-live-staging-preflight-composition-adapter.server.v1",
    );
    expect(DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId).not.toBe(
      FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId,
    );
  });

  test("policy is frozen source-controlled closed and explicitly non-executing", () => {
    const policy = DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_POLICY;
    expect(policy).toMatchObject({
      acceptsCallerPolicy: false,
      acceptsCallerFilesystem: false,
      acceptsCallerCandidatePaths: false,
      acceptsDependencyInjection: false,
      acceptsArbitraryMetadata: false,
      acceptsAuthorityFlags: false,
      requiresOriginalResolverObject: true,
      requiresLiveResolverPrivateProvenance: true,
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
    });
    expect(policy.neutralizedMetadataKeys).toEqual(["deviceId", "inode", "sizeBytes", "mode", "modifiedTimeMs"]);
    expect(Object.isFrozen(policy)).toBe(true);
    expect(Object.isFrozen(policy.neutralizedMetadataKeys)).toBe(true);
    expect(() => (policy.neutralizedMetadataKeys as unknown as string[]).push("changedTimeMs")).toThrow();
  });

  test("module is server-only and only composes through the approved live resolver boundary", () => {
    const adapterSource = source(adapterPath);
    expect(adapterSource.startsWith('import "server-only";')).toBe(true);
    expect(adapterSource).toContain("resolveFirstLiveTrustedExecutable");
    expect(adapterSource).toContain("hasFirstLiveTrustedResolverLiveFilesystemProvenance");
    expect(source(liveResolverPath)).toContain("LIVE_FILESYSTEM_RESULT_PROVENANCE.has(input)");
    expect(adapterSource).not.toMatch(/from ["']node:fs|from ["']fs|fs\/promises|lstat\(|stat\(/u);
    expect(source(corePath)).not.toContain('import "server-only";');
  });

  test("valid original live resolver result neutralizes to pure composition input without live authority", async () => {
    const { request, resolverResult } = resolvedFixture("git");
    const result = neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult }, hasTestLiveResolverProvenance);

    expect(result.status).toBe("neutralized_composition_input_ready");
    expect(result.liveResolverInvoked).toBe(false);
    expect(result.resolverPrivateProvenanceVerified).toBe(true);
    expect(result.originalResolverObjectConsumedInProcess).toBe(true);
    expect(result.neutralizedObservedLiveFilesystem).toBe(false);
    expect(result.authoritativeLive).toBe(false);
    expect(result.remoteExecution).toBe(false);
    expect(result.processSpawned).toBe(false);
    expect(result.shellUsed).toBe(false);
    expect(result.credentialAccessed).toBe(false);
    expect(result.networkAccessed).toBe(false);
    expect(result.cliVersionCollected).toBe(false);
    expect(result.authorizationConsumed).toBe(false);
    expect(result.immediatePreSpawnRevalidationRequired).toBe(true);
    expect(result.toctouEliminated).toBe(false);
    expect(result.blockingReasons).toEqual([]);
    expect(result.compositionResult?.state).toBe("composition_complete");
    expect(result.compositionResult?.compositionComplete).toBe(true);
    expect(result.compositionResult?.runnerAuthority).toBe("none");
    expect(result.compositionResult?.filesystemAuthority).toBe("none");
    expect(result.compositionResult?.spawnAuthority).toBe("none");
  });

  test("composition helper invokes the resolver once but still returns dormant neutralized evidence only", async () => {
    const request = makeRequest("git");
    const { resolverResult } = resolvedFixture("git", request);
    const result = await composeDormantServerOnlyFirstLiveStagingPreflightCore({ request }, {
      resolveFirstLiveTrustedExecutable: async () => resolverResult,
      hasLiveResolverPrivateProvenance: hasTestLiveResolverProvenance,
    });
    expect(result.liveResolverInvoked).toBe(true);
    expect(result.resolverPrivateProvenanceVerified).toBe(true);
    expect(result.neutralizedObservedLiveFilesystem).toBe(false);
    expect(result.filesystemAuthority).toBe("none");
    expect(result.spawnAuthority).toBe("none");
    expect(result.observerAuthority).toBe("none");
    expect(result.runnerAuthority).toBe("none");
  });

  test("neutralized resolver metadata contains exactly five non-private metadata fields", async () => {
    const { request, resolverResult } = resolvedFixture("git");
    const result = neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult }, hasTestLiveResolverProvenance);
    expect(Object.keys(result.neutralResolverMetadata ?? {}).sort()).toEqual(["deviceId", "inode", "mode", "modifiedTimeMs", "sizeBytes"]);
    expect(result.neutralResolverMetadata).not.toHaveProperty("changedTimeMs");
    expect(result.neutralCompositionEvidenceSet?.evidence[0]).toMatchObject({
      evidenceKind: "trusted_resolver_evidence_link",
      observedLiveFilesystem: false,
      toctouEliminated: false,
      requiresImmediateRevalidation: true,
    });
    expect(result.neutralCompositionEvidenceSet?.evidence[0]).not.toHaveProperty("observedLiveFilesystemProvenance");
  });

  test("JSON and spread cloned resolver results are rejected because private provenance is absent", async () => {
    const { request, resolverResult } = resolvedFixture("git");
    const spreadClone = { ...resolverResult, evidence: { ...resolverResult.evidence } };
    const serializedClone = jsonClone(resolverResult);

    expect(neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult: spreadClone as FirstLiveTrustedExecutableResolutionResult }, hasTestLiveResolverProvenance).blockingReasons).toContain(
      "resolver_result_missing_private_provenance",
    );
    expect(neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult: serializedClone }, hasTestLiveResolverProvenance).blockingReasons).toContain(
      "resolver_result_missing_private_provenance",
    );
  });

  test("structured cloned resolver result is rejected when structuredClone is available", async () => {
    const { request, resolverResult } = resolvedFixture("git");
    test.skip(typeof structuredClone !== "function", "structuredClone unavailable");
    const cloned = structuredClone(resolverResult);
    const result = neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult: cloned }, hasTestLiveResolverProvenance);
    expect(result.status).toBe("blocked_fail_closed");
    expect(result.blockingReasons).toContain("resolver_result_missing_private_provenance");
  });

  test("cross-session request is rejected before neutralization can become authority", async () => {
    const { resolverResult } = resolvedFixture("git");
    const otherRequest = makeRequest("git", buildResolverSessionCapability({ boundarySessionId: "resolver_session_other_for_action_540" }));
    const result = neutralizeOriginalFirstLiveResolverResultCore({ request: otherRequest, resolverResult }, hasTestLiveResolverProvenance);
    expect(result.status).toBe("blocked_fail_closed");
    expect(result.blockingReasons).toContain("resolver_result_session_mismatch");
    expect(result.filesystemAuthority).toBe("none");
  });

  test("cross-tool request is rejected", async () => {
    const { resolverResult } = resolvedFixture("git");
    const supabaseRequest = makeRequest("supabase_cli");
    const result = neutralizeOriginalFirstLiveResolverResultCore({ request: supabaseRequest, resolverResult }, hasTestLiveResolverProvenance);
    expect(result.status).toBe("blocked_fail_closed");
    expect(result.blockingReasons).toContain("resolver_result_tool_mismatch");
  });

  test("expired request blocks neutralization", async () => {
    const { resolverResult } = resolvedFixture("git");
    const expiredSession = buildResolverSessionCapability({ expiresAt: "2026-07-17T10:10:01.000Z" });
    const expiredRequest = makeRequest("git", expiredSession);
    const result = neutralizeOriginalFirstLiveResolverResultCore({
      request: expiredRequest,
      resolverResult,
      evaluatedAt: "2026-07-17T10:10:05.000Z",
    }, hasTestLiveResolverProvenance);
    expect(result.status).toBe("blocked_fail_closed");
    expect(result.blockingReasons).toContain("request_invalid");
  });

  test("malformed or caller-extended top-level inputs fail closed before filesystem access can be requested", async () => {
    const request = makeRequest("git");
    for (const input of [
      null,
      [],
      { request, policy: {} },
      { request, filesystem: {} },
      { request, candidatePaths: ["/usr/bin/git"] },
      { request, metadata: {} },
      { request, enablesProcessStart: true },
    ]) {
      const result = await composeDormantServerOnlyFirstLiveStagingPreflightCore(input as never, {
        resolveFirstLiveTrustedExecutable: async () => {
          throw new Error("resolver should not be invoked for rejected input shape");
        },
        hasLiveResolverPrivateProvenance: hasTestLiveResolverProvenance,
      });
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.liveResolverInvoked).toBe(false);
      expect(result.blockingReasons).toContain("input_shape_rejected");
    }
  });

  test("authority flags in the original resolver result are rejected even when shape looks close", async () => {
    const { request, resolverResult } = resolvedFixture("git");
    const forged = { ...resolverResult, enablesProcessStart: true };
    const result = neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult: forged as FirstLiveTrustedExecutableResolutionResult }, hasTestLiveResolverProvenance);
    expect(result.status).toBe("blocked_fail_closed");
    expect(result.blockingReasons).toContain("resolver_result_missing_private_provenance");
    expect(result.spawnAuthority).toBe("none");
  });

  test("result and nested evidence are deeply frozen and deterministic", async () => {
    const { request, resolverResult } = resolvedFixture("git");
    const first = neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult }, hasTestLiveResolverProvenance);
    const second = neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult }, hasTestLiveResolverProvenance);
    expect(second.resultFingerprint).toBe(first.resultFingerprint);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.neutralResolverMetadata)).toBe(true);
    expect(Object.isFrozen(first.neutralCompositionEvidenceSet)).toBe(true);
    expect(Object.isFrozen(first.compositionResult)).toBe(true);
    expect(() => ((first.blockingReasons as string[]).push("request_invalid"))).toThrow();
  });

  test("TOCTOU boundary is explicit and never claimed eliminated", async () => {
    const { request, resolverResult } = resolvedFixture("git");
    const result = neutralizeOriginalFirstLiveResolverResultCore({ request, resolverResult }, hasTestLiveResolverProvenance);
    expect(result.toctouEliminated).toBe(false);
    expect(result.immediatePreSpawnRevalidationRequired).toBe(true);
    expect(result.compositionResult?.evidenceSet?.evidence[1]).toMatchObject({
      evidenceKind: "immediate_pre_spawn_revalidation_requirement",
      revalidationOperationImplemented: false,
      revalidationRequiredBeforeSpawn: true,
      toctouEliminated: false,
    });
  });

  test("static security review finds no process credential network persistence or env APIs in the new adapter", () => {
    const adapterSource = source(adapterPath);
    expect(adapterSource).not.toMatch(/child_process|\bspawn\(|\bexec\(|\bexecFile\(|\bfork\(|Bun\.spawn|Deno\.Command/u);
    expect(adapterSource).not.toMatch(/\bprocess\.env\b|dotenv|SUPABASE|AVANZA|BANKID|KEYCHAIN|keytar|document\.cookie|localStorage|sessionStorage/u);
    expect(adapterSource).not.toMatch(/\bfetch\(|axios|from ["']node:net|from ["']node:tls|@supabase|createClient/u);
    expect(adapterSource).not.toMatch(/\binsert\(|\bupdate\(|\bdelete\(|\bupsert\(|\brpc\(|storage\./u);
    expect(adapterSource).not.toMatch(/setTimeout|setInterval|AbortSignal\.timeout|kill\(|SIGTERM|SIGKILL/u);
  });

  test("adapter is not wired into API UI runner observer spawn or credential boundaries", () => {
    const apiSource = source(apiValidationRoutePath);
    const uiSource = source(tradeUiPath);
    expect(apiSource).not.toContain("post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter");
    expect(uiSource).not.toContain("post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter");

    const adapterImportPattern = "post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter";
    const productionReferences = [
      "lib/post-trade-scoped-macos-process-observer.ts",
      "lib/post-trade-scoped-macos-process-observer-core.ts",
      "lib/post-trade-direct-spawn-driver-boundary.ts",
      "lib/post-trade-direct-spawn-driver-boundary-core.ts",
      "lib/post-trade-credential-source-adapter-boundary.ts",
      "lib/post-trade-credential-source-adapter-boundary-core.ts",
    ];
    for (const candidate of productionReferences) {
      const candidateSource = source(candidate);
      expect(candidateSource).not.toContain(adapterImportPattern);
    }
  });
});
