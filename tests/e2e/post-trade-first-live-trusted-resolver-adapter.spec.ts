import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY,
  FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID,
  buildFirstLiveTrustedResolverCandidateObservation,
  evaluateFirstLiveTrustedExecutableResolution,
  getFirstLiveTrustedResolverPolicy,
  validateFirstLiveTrustedResolverPolicy,
  type FirstLiveTrustedResolverCandidateObservation,
  type FirstLiveTrustedResolverCandidatePolicy,
} from "../../lib/post-trade-first-live-trusted-resolver-adapter-core";
import {
  TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY,
  TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
  buildFixtureExecutableIdentity,
  buildResolverSessionCapability,
  buildTrustedExecutableResolutionRequest,
} from "../../lib/post-trade-trusted-live-resolver-adapter-core";

const repoRoot = process.cwd();
const liveAdapterPath = "lib/post-trade-first-live-trusted-resolver-adapter.ts";
const liveCorePath = "lib/post-trade-first-live-trusted-resolver-adapter-core.ts";
const fixtureCorePath = "lib/post-trade-trusted-live-resolver-adapter-core.ts";
const fixtureBoundaryPath = "lib/post-trade-trusted-live-resolver-adapter.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function makeRequest(tool: "git" | "supabase_cli" = "git", session = buildResolverSessionCapability()) {
  const identity = buildFixtureExecutableIdentity({
    boundarySessionId: session.boundarySessionId,
    expectedToolIdentity: tool,
    approvedRootClass: tool === "git" ? "system_usr_bin" : "homebrew_bin",
  });
  return buildTrustedExecutableResolutionRequest(session, identity);
}

function candidateFor(tool: "git" | "supabase_cli" = "git") {
  const candidate = getFirstLiveTrustedResolverPolicy().candidatePolicies.find((item) => item.toolIdentity === tool);
  if (!candidate) throw new Error(`missing canonical ${tool} candidate`);
  return candidate;
}

function observationFor(candidate: FirstLiveTrustedResolverCandidatePolicy, patch: Partial<Pick<FirstLiveTrustedResolverCandidateObservation, "outcome" | "fileType" | "executablePermission" | "metadata" | "observationSource">> = {}) {
  return buildFirstLiveTrustedResolverCandidateObservation({
    observationSource: patch.observationSource ?? "test_synthetic_metadata",
    candidateId: candidate.candidateId,
    observedPath: candidate.absolutePath,
    outcome: patch.outcome ?? "ok",
    fileType: patch.fileType ?? "regular_file",
    executablePermission: patch.executablePermission ?? "executable",
    metadata: patch.metadata === undefined ? { deviceId: "1", inode: "2", sizeBytes: 12345, mode: 0o100755, modifiedTimeMs: 1000, changedTimeMs: 1001 } : patch.metadata,
  });
}

test.describe("first live trusted resolver adapter Action 534/535R", () => {
  test("live adapter identity is distinct from fixture identity and does not enable execution", () => {
    expect(FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId).toBe("ture.execution.trusted-live-resolver-adapter.live.macos.v1");
    expect(FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId).not.toBe(TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY.resolverId);
    expect(FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY).toMatchObject({
      serverOnly: true,
      authoritativeLive: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
    });
  });

  test("server-only closure protects every live filesystem primitive", () => {
    const adapterSource = source(liveAdapterPath);
    const coreSource = source(liveCorePath);
    expect(adapterSource.startsWith('import "server-only";')).toBe(true);
    expect(adapterSource).toMatch(/from "node:fs\/promises"/u);
    expect(adapterSource).toMatch(/\blstat\(/u);
    expect(coreSource).not.toMatch(/server-only|node:fs|from ["']fs["']|fs\/promises|\blstat\(|\bstat\(|globalThis\.process|\bprocess\./u);
    expect(coreSource).not.toMatch(/child_process|\bspawn\(|\bexec\(|\bexecFile\(|\bfork\(/u);
    expect(coreSource).not.toContain("server_only_lstat");
    expect(adapterSource).not.toMatch(/export (const|let|var|function).*PROVENANCE|export .*WeakSet/u);
  });

  test("canonical policy is frozen versioned deterministic and supports only reviewed tools", () => {
    const policy = getFirstLiveTrustedResolverPolicy();
    expect(policy.policyId).toBe(FIRST_LIVE_TRUSTED_RESOLVER_POLICY_ID);
    expect(policy.policyVersion).toBe(1);
    expect(policy.supportedToolIdentities).toEqual(["git", "supabase_cli"]);
    expect(policy.candidatePolicies.map((candidate) => candidate.absolutePath)).toEqual(["/usr/bin/git", "/opt/homebrew/bin/supabase", "/usr/local/bin/supabase"]);
    expect(policy.allowCallerCandidatePaths).toBe(false);
    expect(policy.allowEnvironmentCandidatePaths).toBe(false);
    expect(policy.allowPathSearch).toBe(false);
    expect(policy.allowShellLookup).toBe(false);
    expect(Object.isFrozen(policy)).toBe(true);
    expect(Object.isFrozen(policy.supportedToolIdentities)).toBe(true);
    expect(Object.isFrozen(policy.candidatePolicies)).toBe(true);
    expect(Object.isFrozen(policy.candidatePolicies[0])).toBe(true);
    expect(validateFirstLiveTrustedResolverPolicy(policy)).toEqual([]);
    expect(() => (policy.candidatePolicies as unknown as Array<unknown>).push({})).toThrow();
  });

  test("production contract exposes no policy filesystem or candidate-path injection", () => {
    const adapterSource = source(liveAdapterPath);
    const coreSource = source(liveCorePath);
    expect(adapterSource).not.toMatch(/policy\?:|filesystem\?:|candidatePath|candidatePaths|input\.policy|input\.filesystem/u);
    expect(adapterSource).toContain("const policy = getFirstLiveTrustedResolverPolicy();");
    expect(coreSource).not.toContain("export function buildFirstLiveTrustedResolverPolicy");
    expect(coreSource).not.toContain("export async function resolveFirstLiveTrustedExecutable");
    expect(coreSource).not.toMatch(/type FirstLiveTrustedResolverInput[\s\S]*policy\?:/u);
    expect(coreSource).not.toMatch(/type FirstLiveTrustedResolverInput[\s\S]*filesystem\?:/u);
  });

  test("pure core cannot forge server-only live filesystem provenance", () => {
    const candidate = candidateFor("git");
    const forgedServerObservation = {
      ...observationFor(candidate),
      observationSource: "server_only_lstat",
    } as unknown as FirstLiveTrustedResolverCandidateObservation;
    const forged = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git"), platform: "darwin", candidateObservations: [forgedServerObservation] });
    expect(forged.status).toBe("blocked_fail_closed");
    expect(forged.evidence.observedLiveFilesystem).toBe(false);
    expect(forged.evidence.blockingReasons).toContain("filesystem_error");

    const synthetic = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git"), platform: "darwin", candidateObservations: [observationFor(candidate)] });
    expect(synthetic.evidence.observedLiveFilesystem).toBe(false);
    expect(({ ...synthetic }).evidence.observedLiveFilesystem).toBe(false);
    expect(JSON.parse(JSON.stringify(synthetic)).evidence.observedLiveFilesystem).toBe(false);

    const callerMutated = { ...synthetic, evidence: { ...synthetic.evidence, observedLiveFilesystem: true } };
    expect(callerMutated.evidence.observedLiveFilesystem).toBe(true);
    expect(source(liveAdapterPath)).toContain("LIVE_FILESYSTEM_RESULT_PROVENANCE.add(liveResult)");
    expect(source(liveAdapterPath)).toContain("LIVE_FILESYSTEM_RESULT_PROVENANCE.has(input)");
  });

  test("policy validation rejects unsupported tools caller paths relative paths malformed paths and mutation", () => {
    const valid = getFirstLiveTrustedResolverPolicy();
    for (const patch of [
      { supportedToolIdentities: ["git", "supabase_cli", "node"] },
      { allowCallerCandidatePaths: true },
      { allowEnvironmentCandidatePaths: true },
      { allowPathSearch: true },
      { allowShellLookup: true },
      { candidatePolicies: [{ ...valid.candidatePolicies[0], toolIdentity: "node" }] },
      { candidatePolicies: [{ ...valid.candidatePolicies[0], absolutePath: "git" }] },
      { candidatePolicies: [{ ...valid.candidatePolicies[0], absolutePath: "/usr/bin/../git" }] },
      { candidatePolicies: [{ ...valid.candidatePolicies[0], absolutePath: "/usr/bin/git;rm" }] },
      { policyFingerprint: "0".repeat(64) },
    ]) {
      expect(validateFirstLiveTrustedResolverPolicy({ ...valid, ...patch }), JSON.stringify(patch)).not.toEqual([]);
    }
  });

  test("synthetic metadata seam resolves approved regular-file evidence without live filesystem trust", () => {
    const candidate = candidateFor("git");
    const result = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git"), platform: "darwin", candidateObservations: [observationFor(candidate)] });
    expect(result.status).toBe("resolved_live_filesystem_evidence");
    expect(result.remoteExecution).toBe(false);
    expect(result.processSpawned).toBe(false);
    expect(result.shellUsed).toBe(false);
    expect(result.credentialAccessed).toBe(false);
    expect(result.evidence).toMatchObject({
      status: "resolved_live_filesystem_evidence",
      expectedToolIdentity: "git",
      resolvedAbsolutePath: "/usr/bin/git",
      fileType: "regular_file",
      executablePermission: "executable",
      observedLiveFilesystem: false,
      authoritativeLive: false,
      issuesLiveExecutableCapability: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
      toctouEliminated: false,
      requiresFutureSpawnRevalidation: true,
      blockingReasons: [],
    });
    expect(result.evidence.metadata?.inode).toBe("2");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.evidence)).toBe(true);
    expect(Object.isFrozen(result.evidence.metadata)).toBe(true);
  });

  test("repeated synthetic evaluation against unchanged input produces equivalent semantic evidence", () => {
    const candidate = candidateFor("git");
    const request = makeRequest("git");
    const observation = observationFor(candidate);
    const first = evaluateFirstLiveTrustedExecutableResolution({ request, platform: "darwin", candidateObservations: [observation] });
    const second = evaluateFirstLiveTrustedExecutableResolution({ request, platform: "darwin", candidateObservations: [observation] });
    expect(second.evidence.evidenceFingerprint).toBe(first.evidence.evidenceFingerprint);
    expect(second.resultFingerprint).toBe(first.resultFingerprint);
  });

  test("missing directory symlink broken synthetic and not executable observations fail closed", () => {
    const candidate = candidateFor("git");
    const missing = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git"), platform: "darwin", candidateObservations: [observationFor(candidate, { outcome: "missing", fileType: "missing", executablePermission: "unknown", metadata: null })] });
    expect(missing.evidence.blockingReasons).toContain("candidate_missing");

    const directory = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git"), platform: "darwin", candidateObservations: [observationFor(candidate, { fileType: "directory", executablePermission: "unknown" })] });
    expect(directory.evidence.blockingReasons).toContain("candidate_not_regular_file");

    const symlink = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git"), platform: "darwin", candidateObservations: [observationFor(candidate, { fileType: "symlink", executablePermission: "unknown" })] });
    expect(symlink.evidence.blockingReasons).toContain("candidate_symlink");

    const broken = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git"), platform: "darwin", candidateObservations: [observationFor(candidate, { outcome: "missing", fileType: "missing", executablePermission: "unknown", metadata: null })] });
    expect(broken.evidence.blockingReasons).toContain("candidate_missing");

    const nonExecutable = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git"), platform: "darwin", candidateObservations: [observationFor(candidate, { executablePermission: "not_executable" })] });
    expect(nonExecutable.evidence.blockingReasons).toContain("candidate_not_executable");
  });

  test("unsupported tool platform ambiguity stat failure and observation mutation fail closed", () => {
    const candidate = candidateFor("git");
    const request = makeRequest("git");
    const unsupportedPlatform = evaluateFirstLiveTrustedExecutableResolution({ request, platform: "linux", candidateObservations: [observationFor(candidate)] });
    expect(unsupportedPlatform.evidence.blockingReasons).toContain("unsupported_platform");

    const badTool = evaluateFirstLiveTrustedExecutableResolution({
      request: { ...request, expectedToolIdentity: "node" } as unknown as typeof request,
      platform: "darwin",
      candidateObservations: [observationFor(candidate)],
    });
    expect(badTool.evidence.blockingReasons).toContain("tool_identity_mismatch");

    const duplicate = evaluateFirstLiveTrustedExecutableResolution({
      request: makeRequest("supabase_cli"),
      platform: "darwin",
      candidateObservations: getFirstLiveTrustedResolverPolicy().candidatePolicies.filter((item) => item.toolIdentity === "supabase_cli").map((item) => observationFor(item)),
    });
    expect(duplicate.evidence.blockingReasons).toContain("multiple_acceptable_candidates");

    const statFailure = evaluateFirstLiveTrustedExecutableResolution({ request, platform: "darwin", candidateObservations: [observationFor(candidate, { outcome: "stat_failed", fileType: "missing", executablePermission: "unknown", metadata: null })] });
    expect(statFailure.evidence.blockingReasons).toContain("candidate_stat_failed");

    const mutatedObservation = { ...observationFor(candidate), observationFingerprint: "0".repeat(64) };
    const mutated = evaluateFirstLiveTrustedExecutableResolution({ request, platform: "darwin", candidateObservations: [mutatedObservation] });
    expect(mutated.evidence.blockingReasons).toContain("filesystem_error");
  });

  test("capability and provenance checks reject malformed wrong-purpose expired cloned mutated and cross-boundary inputs", () => {
    const candidate = candidateFor("git");
    const observation = observationFor(candidate);
    const request = makeRequest("git");
    const malformed = evaluateFirstLiveTrustedExecutableResolution({ request: { ...request, requestKind: "other" } as unknown as typeof request, platform: "darwin", candidateObservations: [observation] });
    expect(malformed.evidence.blockingReasons).toContain("request_invalid");

    const wrongPurpose = evaluateFirstLiveTrustedExecutableResolution({ request: { ...request, operation: "resolve_trusted_repository_root" } as unknown as typeof request, platform: "darwin", candidateObservations: [observation] });
    expect(wrongPurpose.evidence.blockingReasons).toContain("request_invalid");

    const expiredSession = buildResolverSessionCapability({ expiresAt: "2026-07-17T10:10:01.000Z" });
    const expired = evaluateFirstLiveTrustedExecutableResolution({ request: makeRequest("git", expiredSession), platform: "darwin", candidateObservations: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(expired.evidence.blockingReasons).toContain("resolver_session_capability_expired");

    const clonedSession = { ...request.resolverSessionCapability };
    const cloned = evaluateFirstLiveTrustedExecutableResolution({ request: { ...request, resolverSessionCapability: clonedSession } as typeof request, platform: "darwin", candidateObservations: [observation] });
    expect(cloned.evidence.blockingReasons).toContain("resolver_session_capability_invalid");

    const mutated = evaluateFirstLiveTrustedExecutableResolution({ request: { ...request, requestFingerprint: "0".repeat(64) } as typeof request, platform: "darwin", candidateObservations: [observation] });
    expect(mutated.evidence.blockingReasons).toContain("request_invalid");

    const crossBoundary = evaluateFirstLiveTrustedExecutableResolution({ request: { ...request, resolverSessionCapability: { capabilityKind: "spawn_session" } } as unknown as typeof request, platform: "darwin", candidateObservations: [observation] });
    expect(crossBoundary.evidence.blockingReasons).toContain("resolver_session_capability_invalid");
  });

  test("static security keeps live resolver dormant and avoids process env network credential and wiring paths", () => {
    const adapterSource = source(liveAdapterPath);
    const coreSource = source(liveCorePath);
    const fixtureSource = `${source(fixtureCorePath)}\n${source(fixtureBoundaryPath)}`;
    expect(`${adapterSource}\n${coreSource}`).not.toMatch(/node:child_process|child_process|\bspawn\(|\bexec\(|\bexecFile\(|\bfork\(|Bun\.spawn|Deno\.Command/u);
    expect(`${adapterSource}\n${coreSource}`).not.toMatch(/process\.env|fetch\(|from ["']axios["']|from ["']node:net["']|from ["']node:tls["']|@supabase|createClient\(|from ["']keytar["']|Keychain\.|document\.cookie|cookies\(|localStorage|sessionStorage|bankid\(|avanza\(/iu);
    expect(`${adapterSource}\n${coreSource}`).not.toMatch(/\.insert\(|\.upsert\(|\.delete\(|\.rpc\(|(?:supabase|client|db)\.update\(|storage\./u);
    expect(`${adapterSource}\n${coreSource}`).not.toMatch(/enablesProcessStart: true|enablesPreflightRunner: true|processSpawned: true|shellUsed: true/u);
    expect(fixtureSource).not.toMatch(/node:fs|from ["']fs["']|fs\/promises|\blstat\(|\bstat\(/u);
    expect(source(apiPath)).not.toContain("post-trade-first-live-trusted-resolver-adapter");
    expect(source(tradeUiPath)).not.toContain("post-trade-first-live-trusted-resolver-adapter");
  });
});
