import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  TRUSTED_LIVE_RESOLVER_EVALUATED_AT,
  asFixtureAbsoluteMacosPath,
  buildFixtureExecutableCandidateObservation,
  buildFixtureExecutableIdentity,
  buildFixtureRepositoryCandidateObservation,
  buildFixtureRepositoryIdentity,
  buildResolverSessionCapability,
  buildTrustedExecutableResolutionRequest,
  buildTrustedLiveResolverCompatibilitySummary,
  buildTrustedLiveResolverFixtureAdapter,
  buildTrustedRepositoryResolutionRequest,
  validateExecutableCandidateCapability,
  validateFixtureAbsoluteMacosPath,
  validateRepositoryCandidateCapability,
  validateResolverSessionCapability,
  validateTrustedExecutableResolutionRequest,
  validateTrustedRepositoryResolutionRequest,
} from "../../lib/post-trade-trusted-live-resolver-adapter-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-trusted-live-resolver-adapter-core.ts";
const boundaryPath = "lib/post-trade-trusted-live-resolver-adapter.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function executableFixture(tool: "git" | "supabase_cli" = "git") {
  const session = buildResolverSessionCapability();
  const identity = buildFixtureExecutableIdentity({ boundarySessionId: session.boundarySessionId, expectedToolIdentity: tool });
  const request = buildTrustedExecutableResolutionRequest(session, identity);
  const observation = buildFixtureExecutableCandidateObservation(request, identity);
  return { session, identity, request, observation, adapter: buildTrustedLiveResolverFixtureAdapter() };
}

function repositoryFixture() {
  const session = buildResolverSessionCapability();
  const identity = buildFixtureRepositoryIdentity({ boundarySessionId: session.boundarySessionId });
  const request = buildTrustedRepositoryResolutionRequest(session, identity);
  const observation = buildFixtureRepositoryCandidateObservation(request, identity);
  return { session, identity, request, observation, adapter: buildTrustedLiveResolverFixtureAdapter() };
}

test.describe("trusted live resolver adapter Action 528 security review regressions", () => {
  test("supported supabase_cli fixture request remains canonical and compatible", () => {
    const { adapter, request, observation } = executableFixture("supabase_cli");
    expect(validateTrustedExecutableResolutionRequest(request).ok).toBe(true);
    const result = adapter.resolveExecutableFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.disposition).toBe("compatible_fixture_candidate");
    expect(result.evidence.authority).toBe("fixture_structural_only");
    expect(result.evidence.expectedToolIdentity).toBe("supabase_cli");
    expect(result.issuesLiveExecutableCapability).toBe(false);
    expect(result.enablesProcessStart).toBe(false);
    expect(result.enablesPreflightRunner).toBe(false);
  });

  test("approved executable root prefix collisions fail closed with segment boundaries", () => {
    const { adapter, request, identity } = executableFixture("git");
    const evilIdentity = buildFixtureExecutableIdentity({
      ...identity,
      structuralPath: asFixtureAbsoluteMacosPath("/usr/bin-evil/git"),
      approvedRootFingerprint: identity.approvedRootFingerprint,
    });
    const observation = buildFixtureExecutableCandidateObservation(request, evilIdentity);
    const result = adapter.resolveExecutableFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.blockingReasons).toContain("approved_root_mismatch");
    expect(result.evidence.disposition).toBe("blocked_fixture_candidate");
  });

  test("approved repository root prefix collisions fail closed", () => {
    const { adapter, request, identity } = repositoryFixture();
    const evilIdentity = buildFixtureRepositoryIdentity({
      ...identity,
      structuralRootPath: asFixtureAbsoluteMacosPath("/Users/reviewed/workspace/trade-evil"),
      approvedRootFingerprint: identity.approvedRootFingerprint,
    });
    const observation = buildFixtureRepositoryCandidateObservation(request, evilIdentity);
    const result = adapter.resolveRepositoryFixture({ request, candidates: [observation], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.blockingReasons).toContain("approved_root_mismatch");
    expect(result.evidence.disposition).toBe("blocked_fixture_repository");
  });

  test("fixture paths reject traversal, shell controls, duplicate separators and unsupported Unicode", () => {
    for (const path of [
      "usr/bin/git",
      "/usr/bin/../git",
      "/usr/bin/git;rm",
      "/usr/bin/git|cat",
      "/usr/bin/$(git)",
      "/usr/bin/`git`",
      "/usr//bin/git",
      "/usr／bin/git",
      "/usr∕bin/git",
      "/usr/bin/\u200bgit",
      "/usr/bin/\u202egit",
    ]) {
      expect(validateFixtureAbsoluteMacosPath(path).length, path).toBeGreaterThan(0);
    }
  });

  test("capability provenance is runtime checked, clone resistant and noninterchangeable", () => {
    const executable = executableFixture();
    const repository = repositoryFixture();
    expect(validateResolverSessionCapability(executable.session).ok).toBe(true);
    expect(validateResolverSessionCapability({ ...executable.session }).ok).toBe(false);
    expect(validateExecutableCandidateCapability(executable.observation.candidateCapability, executable.identity).ok).toBe(true);
    expect(validateExecutableCandidateCapability({ ...executable.observation.candidateCapability }, executable.identity).ok).toBe(false);
    expect(validateRepositoryCandidateCapability(repository.observation.candidateCapability, repository.identity).ok).toBe(true);
    expect(validateRepositoryCandidateCapability(executable.observation.candidateCapability, repository.identity).ok).toBe(false);
  });

  test("registered capabilities are deeply frozen before provenance use", () => {
    const { session, observation } = executableFixture();
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(observation.candidateCapability)).toBe(true);
    expect(() => Object.assign(session as unknown as Record<string, unknown>, { boundarySessionId: "attacker" })).toThrow();
    expect(validateResolverSessionCapability(session).ok).toBe(true);
  });

  test("cyclic malicious request input fails closed without hanging or escaping validation", () => {
    const cyclic: Record<string, unknown> = { requestKind: "trusted_executable_resolution" };
    cyclic.self = cyclic;
    expect(() => validateTrustedExecutableResolutionRequest(cyclic)).not.toThrow();
    expect(validateTrustedExecutableResolutionRequest(cyclic).ok).toBe(false);
    expect(() => validateTrustedRepositoryResolutionRequest(cyclic)).not.toThrow();
    expect(validateTrustedRepositoryResolutionRequest(cyclic).ok).toBe(false);
  });

  test("fixture attempts to claim live evidence or enablement are blocked", () => {
    const { adapter, request, observation } = executableFixture();
    const claimedLive = {
      ...observation,
      observedLive: true,
      authoritativeLive: true,
      provesExecutableExistsLive: true,
      provesExecutableTrustedLive: true,
      issuesLiveExecutableCapability: true,
      enablesProcessStart: true,
      enablesPreflightRunner: true,
    } as unknown as typeof observation;
    const result = adapter.resolveExecutableFixture({ request, candidates: [claimedLive], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.evidence.blockingReasons).toEqual(
      expect.arrayContaining([
        "fixture_claimed_live_observation",
        "fixture_claimed_live_authority",
        "fixture_claimed_live_existence_proof",
        "fixture_claimed_live_trust_proof",
        "fixture_claimed_live_capability",
        "fixture_claimed_process_start",
        "fixture_claimed_runner_enablement",
      ]),
    );
    expect(result.observedLive).toBe(false);
    expect(result.authoritativeLive).toBe(false);
  });

  test("candidate cardinality never selects first candidate from ambiguous sets", () => {
    const { adapter, request, observation } = executableFixture();
    const duplicate = buildFixtureExecutableCandidateObservation(request, observation.executableIdentity);
    const result = adapter.resolveExecutableFixture({ request, candidates: [observation, duplicate], evaluatedAt: TRUSTED_LIVE_RESOLVER_EVALUATED_AT });
    expect(result.candidateSetClassification).toBe("multiple_candidates");
    expect(result.evidence.blockingReasons).toContain("multiple_candidates");
    expect(result.evidence.disposition).toBe("blocked_fixture_candidate");
  });

  test("compatibility summary cannot become readiness or live authority", () => {
    const summary = buildTrustedLiveResolverCompatibilitySummary();
    expect(summary.enablesLiveResolution).toBe(false);
    expect(summary.enablesProcessStart).toBe(false);
    expect(summary.enablesPreflightRunner).toBe(false);
    expect(JSON.stringify(summary)).not.toContain("live_authoritative");
  });

  test("production adapter files have no live resolution invocation path", () => {
    const combined = `${source(corePath)}\n${source(boundaryPath)}`;
    for (const forbidden of [
      /node:fs|from ["']fs["']|fs\/promises/u,
      /\bstat\(|\blstat\(|\brealpath\(|\breadlink\(|\breaddir\(|\baccess\(/u,
      /path\.resolve|path\.normalize/u,
      /process\.env|process\.cwd|process\.execPath|process\.arch|os\.homedir/u,
      /child_process|\bspawn\(|\bexec\(|\bexecFile\(|\bfork\(/u,
      /git rev-parse|git status|git config|supabase\s+(db|migration|projects|status)|\bwhich\b|\bwhere\b|\bsysctl\b|\bosascript\b/u,
      /observedLive: true|authoritativeLive: true|issuesLiveExecutableCapability: true|issuesLiveRepositoryCapability: true/u,
      /enablesGitOperation: true|enablesProcessStart: true|enablesPreflightRunner: true/u,
    ]) {
      expect(combined).not.toMatch(forbidden);
    }
  });

  test("server-only adapter is not imported by API route or Trade UI", () => {
    const apiSource = source(apiPath);
    const tradeUiSource = source(tradeUiPath);
    expect(source(boundaryPath).startsWith('import "server-only";')).toBe(true);
    expect(apiSource).not.toContain("post-trade-trusted-live-resolver-adapter");
    expect(tradeUiSource).not.toContain("post-trade-trusted-live-resolver-adapter");
  });
});
