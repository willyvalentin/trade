import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPureAppleGitVersionInterpretation,
} from "../../lib/post-trade-pure-apple-git-version-interpretation-contract-core";
import {
  PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY,
  PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS,
  buildApprovedAggregateGitWorktreeLinkage,
} from "../../lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core";
import {
  PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY,
  PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY,
  buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest,
  buildPureDormantGitRunnerAuthorityPackage,
  type DormantGitRunnerAuthorityPackageReason,
  type PureDormantGitRunnerAuthorityPackageInput,
} from "../../lib/post-trade-pure-dormant-git-runner-authority-package-contract-core";
import {
  buildPureGitVersionInterpretation,
} from "../../lib/post-trade-pure-git-version-interpretation-contract-core";
import {
  buildPureReadOnlyGitCompatibilityPolicy,
  PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS,
  type PureReadOnlyGitCompatibilityResult,
} from "../../lib/post-trade-pure-read-only-git-compatibility-policy-contract-core";
import { sha256 } from "../../lib/post-trade-pure-read-only-git-observation-completion-contract-core";
import {
  buildCanonicalRawCompletionFixtureInput,
  buildPureRawProcessCompletionEvidence,
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY,
} from "../../lib/post-trade-pure-raw-process-completion-evidence-contract-core";
import {
  buildFixtureExecutableCandidateObservation,
  buildFixtureExecutableIdentity,
  buildResolverSessionCapability,
  buildTrustedExecutableResolutionRequest,
  buildTrustedLiveResolverFixtureAdapter,
  TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS,
  type SanitizedExecutableResolutionEvidence,
} from "../../lib/post-trade-trusted-live-resolver-adapter-core";
import {
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS,
  type ImmediatePreSpawnRevalidationEvidence,
} from "../../lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";
import {
  DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY,
} from "../../lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const uiPath = "app/trade-app.tsx";
const session = buildResolverSessionCapability().boundarySessionId;
const workingDirectoryFingerprint = "b".repeat(64);
const repositoryRootPathFingerprint = "c".repeat(64);
const issuedAt = "2026-07-17T12:00:00.000Z";
const expiresAt = "2026-07-17T12:00:30.000Z";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function raw(stdoutText: string) {
  return buildPureRawProcessCompletionEvidence(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
    boundarySessionId: session,
    stdoutText,
    stdoutByteCount: Buffer.byteLength(stdoutText, "utf8"),
    stderrText: "",
    stderrByteCount: 0,
    combinedByteCount: Buffer.byteLength(stdoutText, "utf8"),
  }));
}

function genericCompatibility(stdoutText = "git version 2.39.0\n") {
  return buildPureReadOnlyGitCompatibilityPolicy(buildPureGitVersionInterpretation(raw(stdoutText)));
}

function appleCompatibility(stdoutText = "git version 2.39.5 (Apple Git-154)\n") {
  return buildPureReadOnlyGitCompatibilityPolicy(buildPureAppleGitVersionInterpretation(raw(stdoutText)));
}

function executableResolution() {
  const resolverSession = buildResolverSessionCapability({ boundarySessionId: session });
  const identity = buildFixtureExecutableIdentity({ boundarySessionId: session, expectedToolIdentity: "git" });
  const request = buildTrustedExecutableResolutionRequest(resolverSession, identity);
  const result = buildTrustedLiveResolverFixtureAdapter().resolveExecutableFixture({
    request,
    evaluatedAt: "2026-07-17T10:10:05.000Z",
    candidates: [buildFixtureExecutableCandidateObservation(request, identity)],
  });
  expect(result.evidence.sanitizedStructuralPath).toBe("/usr/bin/git");
  expect(result.evidence.disposition).toBe("compatible_fixture_candidate");
  return result.evidence;
}

function revalidationEvidence(resolverEvidence = executableResolution(), patch: Partial<ImmediatePreSpawnRevalidationEvidence> = {}) {
  const core = {
    evidenceKind: "immediate_pre_spawn_revalidation_evidence",
    evidenceVersion: 1,
    adapterId: DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId,
    adapterIdentityFingerprint: colonJsonFingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.identity, DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY),
    policyId: DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyId,
    policyVersion: 1,
    policyFingerprint: colonJsonFingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.policy, DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY),
    purpose: "first_live_read_only_staging_preflight",
    platform: "macos",
    toolIdentity: "git",
    boundarySessionId: session,
    initialCompositionAdapterId: DORMANT_SERVER_ONLY_FIRST_LIVE_STAGING_PREFLIGHT_COMPOSITION_ADAPTER_IDENTITY.adapterId,
    initialCompositionResultFingerprint: "d".repeat(64),
    initialCompositionEvidenceSetFingerprint: "e".repeat(64),
    resolverEvidenceFingerprint: resolverEvidence.evidenceFingerprint,
    revalidationRequirementFingerprint: "f".repeat(64),
    expectedResolvedAbsolutePath: "/usr/bin/git",
    observedResolvedAbsolutePath: "/usr/bin/git",
    expectedMetadata: {
      deviceId: "9007199254740993",
      inode: "9007199254740995",
      sizeBytes: 54321,
      mode: 0o100755,
      modifiedTimeMs: 3000,
    },
    observedMetadata: {
      deviceId: "9007199254740993",
      inode: "9007199254740995",
      sizeBytes: 54321,
      mode: 0o100755,
      modifiedTimeMs: 3000,
    },
    observationSource: "server_only_lstat",
    observationFingerprint: "1".repeat(64),
    productionLiveRevalidationProvenance: "server_only_private_original_object",
    exactMetadataMatched: true,
    immediateRevalidationOccurred: true,
    pointInTimeOnly: true,
    toctouEliminated: false,
    remainingIntervalBeforeSpawnMustBeMinimized: true,
    serializedEvidenceReusableAsAuthority: false,
    authoritativeLive: false,
    filesystemAuthority: "none",
    spawnAuthority: "none",
    observerAuthority: "none",
    credentialAuthority: "none",
    cliExecutionAuthority: "none",
    runnerAuthority: "none",
    authorizationConsumptionAuthority: "none",
    networkAuthority: "none",
    apiAuthority: "none",
    uiAuthority: "none",
    tradingAuthority: "none",
    avanzaAuthority: "none",
    persistenceAuthority: "none",
    deploymentAuthority: "none",
    processSpawned: false,
    shellUsed: false,
    cliVersionCollected: false,
    credentialAccessed: false,
    networkAccessed: false,
    observerInvoked: false,
    authorizationConsumed: false,
    retryCount: 0,
    filesystemAttemptCount: 1,
    status: "revalidated_non_authoritative_evidence",
    blockingReasons: [],
    evaluatedAt: "2026-07-17T11:59:59.000Z",
    ...patch,
  } satisfies Omit<ImmediatePreSpawnRevalidationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return Object.freeze({
    ...core,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: colonJsonFingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.evidence, core),
  } satisfies ImmediatePreSpawnRevalidationEvidence);
}

function colonJsonFingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(stableNormalize(input))}`).digest("hex");
}

function stableNormalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(stableNormalize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, stableNormalize(value)]));
  }
  return input;
}

function worktree() {
  return buildApprovedAggregateGitWorktreeLinkage({
    repositoryRootPathFingerprint,
    workingDirectoryFingerprint,
    observationSequenceIdentity: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity,
  });
}

function validInput(patch: Partial<PureDormantGitRunnerAuthorityPackageInput> = {}) {
  const executableResolutionEvidence = patch.executableResolutionEvidence ?? executableResolution();
  return {
    inputKind: "pure_dormant_git_runner_authority_package_input",
    inputVersion: 1,
    contractId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.boundaryId,
    authorityPolicyId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.policyId,
    authorityPolicyVersion: 1,
    capabilitySetId: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId,
    capabilitySetVersion: 1,
    observationSequenceIdentity: PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.observationSequenceIdentity,
    packageId: "dormant-git-runner-authority-package-00000001",
    issuedAt,
    expiresAt,
    session,
    platform: "macos",
    sourcePolicyId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId,
    sourcePolicyVersion: 1,
    executableResolutionEvidence,
    executableRevalidationEvidence: patch.executableRevalidationEvidence ?? revalidationEvidence(executableResolutionEvidence),
    compatibilityPolicyResult: patch.compatibilityPolicyResult ?? genericCompatibility(),
    approvedWorktreeEvidence: patch.approvedWorktreeEvidence ?? worktree(),
    ...patch,
  } satisfies PureDormantGitRunnerAuthorityPackageInput;
}

function build(input: unknown = validInput()) {
  const result = buildPureDormantGitRunnerAuthorityPackage(input);
  expect(result.resultFingerprint).toMatch(/^[a-f0-9]{64}$/u);
  expect(Object.isFrozen(result)).toBe(true);
  return result;
}

function expectIssued(input: unknown = validInput()) {
  const result = build(input);
  expect(result.status).toBe("authority_package_issued");
  expect(result.reason).toBe("authority_package_issued");
  expect(result.issuedPackage).not.toBeNull();
  expect(result.runtimeActivated).toBe(false);
  expect(result.runtimeCallerActivationAuthorityGranted).toBe(false);
  expect(result.mutationAuthorityGranted).toBe(false);
  expect(result.arbitraryFilesystemReadAuthorityGranted).toBe(false);
  expect(result.writeCommandAuthorityGranted).toBe(false);
  expect(result.credentialAuthorityGranted).toBe(false);
  expect(result.networkAuthorityGranted).toBe(false);
  expect(result.stagingAuthorityGranted).toBe(false);
  expect(result.deploymentAuthorityGranted).toBe(false);
  expect(result.laterActivationEligibility).toBe(false);
  expect(result.toctouEliminated).toBe(false);
  return result;
}

function expectRejected(input: unknown, reason: DormantGitRunnerAuthorityPackageReason) {
  const result = build(input);
  expect(result.status).not.toBe("authority_package_issued");
  expect(result.reason).toBe(reason);
  expect(result.reasons).toContain(reason);
  expect(result.issuedPackage).toBeNull();
  expect(result.packageFingerprint).toBeNull();
  expect(result.authority).toBe("none");
  return result;
}

function withRecomputedCompatibility(patch: Partial<PureReadOnlyGitCompatibilityResult>) {
  const compatibility = genericCompatibility() as PureReadOnlyGitCompatibilityResult;
  const core = { ...compatibility, ...patch };
  delete (core as { resultFingerprintAlgorithm?: string }).resultFingerprintAlgorithm;
  delete (core as { resultFingerprint?: string }).resultFingerprint;
  return {
    ...core,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: sha256(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.result, core),
  } as PureReadOnlyGitCompatibilityResult;
}

function withRecomputedResolution(patch: Partial<SanitizedExecutableResolutionEvidence>) {
  const core = { ...executableResolution(), ...patch } as Record<string, unknown>;
  delete core.evidenceFingerprintAlgorithm;
  delete core.evidenceFingerprint;
  return {
    ...core,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: colonJsonFingerprint(TRUSTED_LIVE_RESOLVER_FINGERPRINT_DOMAINS.executableEvidence, core),
  } as SanitizedExecutableResolutionEvidence;
}

function withRecomputedWorktree(patch: Record<string, unknown>) {
  const core = { ...worktree(), ...patch } as Record<string, unknown>;
  delete core.evidenceFingerprint;
  return {
    ...core,
    evidenceFingerprint: sha256(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_FINGERPRINT_DOMAINS.worktreeLinkage, core),
  };
}

function withOwnExtra(value: Record<string, unknown>, key: string, enumerable: boolean) {
  const copy = { ...value };
  Object.defineProperty(copy, key, { value: "unexpected", enumerable });
  return copy;
}

function withAccessor(value: Record<string, unknown>, key: string) {
  const copy = { ...value };
  Object.defineProperty(copy, key, { get: () => value[key], enumerable: true });
  return copy;
}

function withInheritedEnumerable(value: Record<string, unknown>) {
  const parent = { inherited: "unexpected" };
  return Object.assign(Object.create(parent), value);
}

function withArrayExtra<T>(array: readonly T[], key: PropertyKey, value: unknown) {
  const copy = [...array] as unknown[];
  Object.defineProperty(copy, key, { value, enumerable: typeof key === "string" });
  return copy;
}

function withTemporaryPrototypeProperty<T>(prototype: object, key: PropertyKey, descriptor: PropertyDescriptor, run: () => T): T {
  const existed = Object.prototype.hasOwnProperty.call(prototype, key);
  const previous = Object.getOwnPropertyDescriptor(prototype, key);
  Object.defineProperty(prototype, key, descriptor);
  try {
    return run();
  } finally {
    if (existed && previous) Object.defineProperty(prototype, key, previous);
    else delete (prototype as Record<PropertyKey, unknown>)[key];
  }
}

test.describe("pure dormant Git runner authority package contract Action 607", () => {
  test("identity policy and source remain pure fixture-only and runtime-unreachable", () => {
    const core = source(corePath);
    expect(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY).toMatchObject({
      contractId: "ture.execution.pure-dormant-git-runner-authority-package-contract.fixture.v1",
      boundaryId: "ture.execution.dormant-git-runner-authority-package.fixture-boundary.v1",
      contractVersion: 1,
      fixtureOnly: true,
    });
    expect(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY).toMatchObject({
      executable: "/usr/bin/git",
      maximumProcessAttempts: 6,
      oneProcessAtATime: true,
      retryCount: 0,
      fallbackAllowed: false,
      authorityLifetimeMs: 30000,
      runtimeActivation: false,
      toctouEliminated: false,
    });
    expect(Object.isFrozen(PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY)).toBe(true);
    expect(core).not.toContain('import "server-only"');
    expect(core).not.toMatch(/from\s+["']node:fs|from\s+["']fs\/promises|from\s+["']node:child_process|spawn\(|exec\(|execFile\(|fork\(|process\.env|process\.cwd|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|Date\.now|performance\.now/u);
    expect(source(apiPath)).not.toContain("post-trade-pure-dormant-git-runner-authority-package");
    expect(source(uiPath)).not.toContain("post-trade-pure-dormant-git-runner-authority-package");
  });

  test("issues upstream Git package with exact initial state and scoped dormant authorities", () => {
    const result = expectIssued();
    const issued = result.issuedPackage!;
    expect(issued.packageState).toBe("issued");
    expect(issued.currentStageIndex).toBe(0);
    expect(issued.consumedStageCount).toBe(0);
    expect(issued.remainingStageCount).toBe(6);
    expect(issued.stageGrants).toHaveLength(6);
    expect(issued.fixedDurationMs).toBe(30000);
    expect(issued.expiresAt).toBe(expiresAt);
    expect(issued.processCreationAuthorityGranted).toBe(true);
    expect(issued.exactReadOnlyGitCliExecutionAuthorityGranted).toBe(true);
    expect(issued.approvedRepositoryReadAuthorityGranted).toBe(true);
    expect(issued.runtimeCallerActivationAuthorityGranted).toBe(false);
    expect(issued.mutationAuthorityGranted).toBe(false);
    expect(issued.networkAuthorityGranted).toBe(false);
    expect(issued.toctouEliminated).toBe(false);
    expect(Object.isFrozen(issued)).toBe(true);
    for (const grant of issued.stageGrants) {
      expect(Object.isFrozen(grant)).toBe(true);
      expect(Object.isFrozen(grant.argv)).toBe(true);
      expect(grant.executable).toBe("/usr/bin/git");
      expect(grant.processAttemptMaximum).toBe(1);
      expect(grant.consumed).toBe(false);
      expect(grant.retryCount).toBe(0);
      expect(grant.fallbackAttempted).toBe(false);
    }
  });

  test("issues Apple Git package with same authority scope and Apple fingerprint linkage", () => {
    const compatibilityPolicyResult = appleCompatibility();
    const result = expectIssued(validInput({ compatibilityPolicyResult }));
    expect(result.compatibilityResultFingerprint).toBe(compatibilityPolicyResult.resultFingerprint);
    expect(result.issuedPackage?.compatibilityResultFingerprint).toBe(compatibilityPolicyResult.resultFingerprint);
  });

  test("stage grants are exactly ordered and retention-scoped", () => {
    const grants = expectIssued().issuedPackage!.stageGrants;
    expect(grants.map((grant) => grant.argv)).toEqual([
      ["rev-parse", "--show-toplevel"],
      ["rev-parse", "--show-object-format"],
      ["rev-parse", "--verify", "HEAD"],
      ["symbolic-ref", "--quiet", "--short", "HEAD"],
      ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"],
      ["rev-parse", "--verify", "HEAD"],
    ]);
    expect(grants.map((grant) => grant.outputMode)).toEqual(["text", "text", "text", "text", "bytes", "text"]);
    expect(grants[0].stdoutLimitBytes).toBe(1024);
    expect(grants[1].stdoutLimitBytes).toBe(8);
    expect(grants[2].stdoutLimitBytes).toBe(65);
    expect(grants[3].stdoutLimitBytes).toBe(256);
    expect(grants[4].stdoutLimitBytes).toBe(65536);
    expect(grants[4].stderrLimitBytes).toBe(0);
    expect(new Set(grants.map((grant) => grant.stageFingerprint)).size).toBe(6);
  });

  for (const [patch, reason] of [
    [{ expiresAt: "2026-07-17T12:00:29.999Z" }, "expiry_delta_rejected"],
    [{ expiresAt: "2026-07-17T12:00:30.001Z" }, "expiry_delta_rejected"],
    [{ expiresAt: "2026-07-17T11:59:59.000Z" }, "expiry_delta_rejected"],
    [{ issuedAt: "2026-07-17T12:00:00Z" }, "timestamp_grammar_rejected"],
    [{ issuedAt: "2026-07-17T12:00:00.000+00:00" }, "timestamp_grammar_rejected"],
    [{ issuedAt: "2026-02-30T12:00:00.000Z" }, "timestamp_grammar_rejected"],
  ] as const) {
    test(`timestamp and fixed expiry reject ${JSON.stringify(patch)}`, () => {
      expectRejected(validInput(patch), reason);
    });
  }

  for (const [patch, reason] of [
    [{ inputKind: "other" }, "input_identity_rejected"],
    [{ contractId: "other" }, "input_identity_rejected"],
    [{ packageId: "bad" }, "package_id_rejected"],
    [{ capabilitySetId: "other" }, "capability_set_rejected"],
    [{ observationSequenceIdentity: "other" }, "sequence_identity_rejected"],
    [{ platform: "linux" }, "platform_linkage_rejected"],
    [{ session: "" }, "session_linkage_rejected"],
  ] as const) {
    test(`input schema and identity reject ${JSON.stringify(patch)}`, () => {
      expectRejected(validInput(patch as never), reason);
    });
  }

  test("unknown top-level fields and exotic inputs reject before package construction", () => {
    expectRejected({ ...validInput(), durationMs: 30000 }, "input_contract_rejected");
    expectRejected(null, "input_contract_rejected");
    expectRejected([], "input_contract_rejected");
    expectRejected(new (class Box { inputKind = "pure_dormant_git_runner_authority_package_input"; })(), "input_contract_rejected");
    const withSymbol = { ...validInput(), [Symbol("x")]: true };
    expectRejected(withSymbol, "input_contract_rejected");
    const accessor = { ...validInput() } as Record<string, unknown>;
    Object.defineProperty(accessor, "packageId", { get: () => "dormant-git-runner-authority-package-00000001", enumerable: true });
    expectRejected(accessor, "input_contract_rejected");
  });

  test("resolver evidence must be accepted exact fixture evidence", () => {
    expectRejected(validInput({ executableResolutionEvidence: { ...executableResolution(), sanitizedStructuralPath: "/opt/git" } as never }), "executable_resolution_rejected");
    expectRejected(validInput({ executableResolutionEvidence: { ...executableResolution(), observedLive: true } as never }), "executable_resolution_rejected");
    expectRejected(validInput({ executableResolutionEvidence: { ...executableResolution(), evidenceFingerprint: "0".repeat(64) } as never }), "input_fingerprint_rejected");
  });

  test("revalidation evidence must be accepted and linked to resolver evidence", () => {
    const resolution = executableResolution();
    expectIssued(validInput({
      executableResolutionEvidence: resolution,
      executableRevalidationEvidence: revalidationEvidence(resolution),
    }));
    expectRejected(validInput({
      executableResolutionEvidence: resolution,
      executableRevalidationEvidence: revalidationEvidence(resolution, { observedResolvedAbsolutePath: "/opt/git" }),
    }), "executable_revalidation_rejected");
    expectRejected(validInput({
      executableResolutionEvidence: resolution,
      executableRevalidationEvidence: revalidationEvidence(resolution, { resolverEvidenceFingerprint: "2".repeat(64) }),
    }), "executable_linkage_rejected");
    expectRejected(validInput({
      executableResolutionEvidence: resolution,
      executableRevalidationEvidence: { ...revalidationEvidence(resolution), evidenceFingerprint: "0".repeat(64) } as never,
    }), "input_fingerprint_rejected");
  });

  for (const [name, patch] of [
    ["fixture marker substituted", { productionLiveRevalidationProvenance: "none" }],
    ["wrong production marker", { productionLiveRevalidationProvenance: "server_only_other_original_object" }],
    ["missing production marker", { productionLiveRevalidationProvenance: null }],
    ["unsupported provenance identity", { observationSource: "test_synthetic_lstat" }],
    ["altered resolution linkage", { resolverEvidenceFingerprint: "2".repeat(64) }],
    ["altered executable path", { observedResolvedAbsolutePath: "/opt/git" }],
    ["altered platform", { platform: "linux" }],
    ["altered session", { boundarySessionId: "other-session" }],
    ["altered policy", { policyId: "other-policy" }],
    ["observedLiveProcess claim", { observedLiveProcess: true }],
    ["runtimeActivated claim", { runtimeActivated: true }],
    ["processAuthorityGranted claim", { processAuthorityGranted: true }],
    ["cliExecutionAuthorityGranted claim", { cliExecutionAuthorityGranted: true }],
    ["repositoryReadAuthorityGranted claim", { repositoryReadAuthorityGranted: true }],
    ["authorizationConsumed claim", { authorizationConsumed: true }],
    ["toctouEliminated claim", { toctouEliminated: true }],
    ["authority claim", { authority: "live_authority" }],
  ] as const) {
    test(`production-marked revalidation provenance rejects ${name}`, () => {
      const resolution = executableResolution();
      const result = expectRejected(validInput({
        executableResolutionEvidence: resolution,
        executableRevalidationEvidence: revalidationEvidence(resolution, patch as never),
      }), patch.resolverEvidenceFingerprint
        ? "executable_linkage_rejected"
        : patch.boundarySessionId
          ? "session_linkage_rejected"
          : "executable_revalidation_rejected");
      expect(result.issuedPackage).toBeNull();
      expect(result.runtimeActivated).toBe(false);
      expect(result.laterActivationEligibility).toBe(false);
      expect(result.toctouEliminated).toBe(false);
      expect(Object.isFrozen(result)).toBe(true);
    });
  }

  test("compatibility must be final approved positive result with no authority", () => {
    expectRejected(validInput({ compatibilityPolicyResult: genericCompatibility("git version 2.38.9\n") }), "compatibility_result_rejected");
    expectRejected(validInput({ compatibilityPolicyResult: withRecomputedCompatibility({ processAuthorityGranted: true as false }) }), "compatibility_result_rejected");
    expectRejected(validInput({ compatibilityPolicyResult: { ...genericCompatibility(), resultFingerprint: "0".repeat(64) } as never }), "input_fingerprint_rejected");
    expectRejected(validInput({ compatibilityPolicyResult: withRecomputedCompatibility({ capabilitySetId: "other" as never }) }), "compatibility_result_rejected");
  });

  test("worktree evidence must be approved pure linkage and exact sequence", () => {
    expectRejected(validInput({ approvedWorktreeEvidence: { ...worktree(), repositoryReadAuthorityGranted: true } as never }), "worktree_evidence_rejected");
    expectRejected(validInput({ approvedWorktreeEvidence: { ...worktree(), observationSequenceIdentity: "other" } as never }), "worktree_evidence_rejected");
    expectRejected(validInput({ approvedWorktreeEvidence: { ...worktree(), evidenceFingerprint: "0".repeat(64) } as never }), "input_fingerprint_rejected");
  });

  test("shared session platform policy and sequence linkage are enforced", () => {
    expectRejected(validInput({ session: "other-session" }), "session_linkage_rejected");
    expectRejected(validInput({ sourcePolicyId: "other-policy" }), "policy_linkage_rejected");
    expectRejected(validInput({ observationSequenceIdentity: "other-sequence" as never }), "sequence_identity_rejected");
  });

  test("fingerprints are deterministic and bind package id timestamps evidence and package", () => {
    const first = expectIssued();
    const second = expectIssued();
    const changedPackage = expectIssued(validInput({ packageId: "dormant-git-runner-authority-package-00000002" }));
    const changedTime = expectIssued(validInput({ issuedAt: "2026-07-17T12:01:00.000Z", expiresAt: "2026-07-17T12:01:30.000Z" }));
    const apple = expectIssued(validInput({ compatibilityPolicyResult: appleCompatibility("git version 2.39.5 (Apple Git-155)\n") }));
    expect(second.resultFingerprint).toBe(first.resultFingerprint);
    expect(changedPackage.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changedTime.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(apple.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changedPackage.issuedPackage!.packageFingerprint).not.toBe(first.issuedPackage!.packageFingerprint);
  });

  test("rejected results have exact nullability and no issued package", () => {
    const result = expectRejected(validInput({ packageId: "bad" }), "package_id_rejected");
    expect(result.packageId).toBeNull();
    expect(result.issuedPackage).toBeNull();
    expect(result.executable).toBeNull();
    expect(result.session).toBeNull();
    expect(result.runtimeActivated).toBe(false);
    expect(result.authority).toBe("none");
  });

  test("issued result exposes no consumption or runtime readiness", () => {
    const issued = expectIssued().issuedPackage!;
    expect(issued.activeConsumer).toBe(false);
    expect(issued.terminal).toBe(false);
    expect(issued.replayDetected).toBe(false);
    expect(issued.revoked).toBe(false);
    expect(issued.expired).toBe(false);
    expect(issued.refreshAllowed).toBe(false);
    expect(issued.automaticReissueAllowed).toBe(false);
    expect(issued.expiryExtensionAllowed).toBe(false);
    expect(issued.gracePeriodMs).toBe(0);
  });

  for (const [field, value] of [
    ["fixtureOnly", false],
    ["observedLive", true],
    ["authoritativeLive", true],
    ["provesExecutableExistsLive", true],
    ["provesExecutableTrustedLive", true],
    ["issuesLiveExecutableCapability", true],
    ["enablesProcessStart", true],
    ["enablesPreflightRunner", true],
    ["authority", "none"],
    ["completeness", "incomplete"],
    ["disposition", "blocked"],
  ] as const) {
    test(`recomputed resolution semantic forgery rejects ${field}`, () => {
      expectRejected(validInput({ executableResolutionEvidence: withRecomputedResolution({ [field]: value } as never) }), "executable_resolution_rejected");
    });
  }

  for (const [field, value] of [
    ["adapterIdentityFingerprint", "0".repeat(64)],
    ["policyFingerprint", "0".repeat(64)],
    ["productionLiveRevalidationProvenance", "none"],
    ["exactMetadataMatched", false],
    ["immediateRevalidationOccurred", false],
    ["toctouEliminated", true],
    ["serializedEvidenceReusableAsAuthority", true],
    ["authoritativeLive", true],
    ["filesystemAuthority", "future_live_filesystem_authority"],
    ["spawnAuthority", "future_live_spawn_authority"],
    ["observerAuthority", "future_live_observer_authority"],
    ["credentialAuthority", "future_live_credential_authority"],
    ["cliExecutionAuthority", "future_live_cli_authority"],
    ["runnerAuthority", "future_live_runner_authority"],
    ["authorizationConsumptionAuthority", "future_live_authorization_consumption_authority"],
    ["networkAuthority", "future_live_network_authority"],
    ["apiAuthority", "future_live_api_authority"],
    ["uiAuthority", "future_live_ui_authority"],
    ["tradingAuthority", "future_live_trading_authority"],
    ["avanzaAuthority", "future_live_avanza_authority"],
    ["persistenceAuthority", "future_live_persistence_authority"],
    ["deploymentAuthority", "future_live_deployment_authority"],
    ["processSpawned", true],
    ["shellUsed", true],
    ["cliVersionCollected", true],
    ["credentialAccessed", true],
    ["networkAccessed", true],
    ["observerInvoked", true],
    ["authorizationConsumed", true],
    ["retryCount", 1],
    ["filesystemAttemptCount", 0],
  ] as const) {
    test(`recomputed revalidation semantic forgery rejects ${field}`, () => {
      expectRejected(validInput({ executableRevalidationEvidence: revalidationEvidence(executableResolution(), { [field]: value } as never) }), "executable_revalidation_rejected");
    });
  }

  for (const [field, value] of [
    ["contractId", "other"],
    ["policyId", "other"],
    ["implementationFamily", "unsupported_vendor_git"],
    ["vendorFamily", "unknown"],
    ["sourceEvidenceFingerprint", null],
    ["stableRelease", false],
    ["meetsMinimum", false],
    ["withinReviewedRange", false],
    ["readOnlyObservationCapabilitySetSatisfied", false],
    ["generalGitCompatibility", true],
    ["writeCommandCompatibility", true],
    ["laterActivationEligibility", true],
    ["repositoryReadAuthorityGranted", true],
    ["mutationAuthorityGranted", true],
    ["processAuthorityGranted", true],
    ["observerAuthorityGranted", true],
    ["cliExecutionAuthorityGranted", true],
    ["compatibilityAuthorityGranted", true],
    ["runtimeAuthorityGranted", true],
    ["stagingAuthorityGranted", true],
    ["deploymentAuthorityGranted", true],
    ["credentialAuthorityGranted", true],
    ["networkAuthorityGranted", true],
    ["credentialsUsed", true],
    ["networkUsed", true],
    ["authorizationConsumed", true],
    ["runtimeActivated", true],
    ["observedLiveProcess", true],
    ["authoritativeLive", true],
    ["toctouEliminated", true],
    ["authority", "fixture_scoped_dormant_authority_package"],
  ] as const) {
    test(`recomputed compatibility semantic forgery rejects ${field}`, () => {
      expectRejected(validInput({ compatibilityPolicyResult: withRecomputedCompatibility({ [field]: value } as never) }), "compatibility_result_rejected");
    });
  }

  for (const [field, value] of [
    ["canonicalFilesystemPathClaimed", true],
    ["repositoryReadAuthorityGranted", true],
    ["runtimeActivated", true],
    ["toctouEliminated", true],
    ["authority", "fixture_scoped_dormant_authority_package"],
  ] as const) {
    test(`recomputed worktree semantic forgery rejects ${field}`, () => {
      expectRejected(validInput({ approvedWorktreeEvidence: withRecomputedWorktree({ [field]: value }) as never }), "worktree_evidence_rejected");
    });
  }

  for (const [name, branch, reason] of [
    ["top-level non-enumerable field", () => withOwnExtra(validInput() as unknown as Record<string, unknown>, "hidden", false), "input_contract_rejected"],
    ["top-level inherited enumerable field", () => withInheritedEnumerable(validInput() as unknown as Record<string, unknown>), "input_contract_rejected"],
    ["resolution non-enumerable field", () => validInput({ executableResolutionEvidence: withOwnExtra(executableResolution() as unknown as Record<string, unknown>, "hidden", false) as never }), "executable_resolution_rejected"],
    ["resolution accessor field", () => validInput({ executableResolutionEvidence: withAccessor(executableResolution() as unknown as Record<string, unknown>, "expectedToolIdentity") as never }), "executable_resolution_rejected"],
    ["revalidation nested metadata extra field", () => validInput({ executableRevalidationEvidence: revalidationEvidence(executableResolution(), { expectedMetadata: withOwnExtra(revalidationEvidence().expectedMetadata as unknown as Record<string, unknown>, "hidden", false) as never }) }), "executable_revalidation_rejected"],
    ["compatibility non-enumerable field", () => validInput({ compatibilityPolicyResult: withOwnExtra(genericCompatibility() as unknown as Record<string, unknown>, "hidden", false) as never }), "compatibility_result_rejected"],
    ["worktree non-enumerable field", () => validInput({ approvedWorktreeEvidence: withOwnExtra(worktree() as unknown as Record<string, unknown>, "hidden", false) as never }), "worktree_evidence_rejected"],
  ] as const) {
    test(`descriptor exact schema rejects ${name}`, () => {
      expectRejected(branch(), reason);
    });
  }

  for (const [name, arrayFactory, reason] of [
    ["resolution blockingReasons enumerable property", () => withRecomputedResolution({ blockingReasons: withArrayExtra([], "extra", true) as never }), "executable_resolution_rejected"],
    ["resolution ambiguityReasons non-enumerable property", () => withRecomputedResolution({ ambiguityReasons: withArrayExtra([], "hidden", true) as never }), "executable_resolution_rejected"],
    ["revalidation blockingReasons symbol property", () => revalidationEvidence(executableResolution(), { blockingReasons: withArrayExtra([], Symbol("x"), true) as never }), "executable_revalidation_rejected"],
    ["compatibility reasons appended element", () => withRecomputedCompatibility({ reasons: ["compatible_for_read_only_observation", "authority_rejected"] as never }), "compatibility_result_rejected"],
    ["compatibility reasons sparse array", () => {
      const sparse = Array(1);
      return withRecomputedCompatibility({ reasons: sparse as never });
    }, "compatibility_result_rejected"],
    ["compatibility reasons shadowed map", () => withRecomputedCompatibility({ reasons: withArrayExtra(["compatible_for_read_only_observation"], "map", () => []) as never }), "compatibility_result_rejected"],
  ] as const) {
    test(`exact nested array schema rejects ${name}`, () => {
      const value = arrayFactory();
      if (reason === "executable_resolution_rejected") expectRejected(validInput({ executableResolutionEvidence: value as never }), reason);
      else if (reason === "executable_revalidation_rejected") expectRejected(validInput({ executableRevalidationEvidence: value as never }), reason);
      else expectRejected(validInput({ compatibilityPolicyResult: value as never }), reason);
    });
  }

  test("policy fingerprint is present deterministic and propagated into stage package and result fingerprints", () => {
    const result = expectIssued();
    const issued = result.issuedPackage!;
    const fingerprint = buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest();
    expect(issued.authorityPolicyFingerprint).toBe(fingerprint);
    expect(result.authorityPolicyFingerprint).toBe(fingerprint);
    expect(issued.stageGrants.every((grant) => grant.authorityPolicyFingerprint === fingerprint)).toBe(true);
  });

  for (const [category, patch] of [
    ["identity/version", { identity: { contractId: "other" } }],
    ["executable", { executableAndSequence: { executable: "/opt/git" } }],
    ["stage count/order", { executableAndSequence: { stageCount: 5 } }],
    ["max process attempts", { executableAndSequence: { maximumProcessAttempts: 7 } }],
    ["one-process-at-a-time", { executableAndSequence: { oneProcessAtATime: false } }],
    ["retry/fallback/cache/rerun", { retryFallbackCache: { retryCount: 1 } }],
    ["expiry duration", { expiryFreshness: { fixedDurationMs: 29999 } }],
    ["expiry extension/refresh/grace/reissue", { expiryFreshness: { refreshAllowed: true } }],
    ["pre-consumption/per-stage/aggregate checks", { expiryFreshness: { perStageExpiryCheckRequired: false } }],
    ["process shell/PATH/env/stdin/detached", { processPolicy: { shell: true } }],
    ["stage argv", { stageSequence: [{ index: 0, argv: ["status"] }] }],
    ["output mode", { stageSequence: [{ index: 0, outputMode: "bytes" }] }],
    ["retention limit", { stageSequence: [{ index: 0, stdoutLimitBytes: 2048 }] }],
    ["truncation/persistence/UTF-8", { stageSequence: [{ index: 0, truncationAllowed: true }] }],
    ["allowed sub-capability", { capabilityAuthority: { allowed: { processCreationAuthorityGranted: false } } }],
    ["denied authority", { capabilityAuthority: { denied: { mutationAuthorityGranted: true } } }],
    ["runtime/TOCTOU", { runtimeSemanticLimits: { runtimeActivated: true } }],
    ["initial package state", { initialPackageState: { packageState: "consumed" } }],
    ["replay/storage/concurrency", { replayStorageSemantics: { storagePresent: true } }],
  ] as const) {
    test(`complete policy fingerprint changes for ${category}`, () => {
      const fingerprint = buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest();
      expect(buildPureDormantGitRunnerAuthorityPackagePolicyFingerprintForTest(patch)).not.toBe(fingerprint);
    });
  }

  test("prototype-chain exact schema rejects inherited enumerable array properties and restores prototypes", () => {
    const resolution = executableResolution();
    withTemporaryPrototypeProperty(Array.prototype, "__action611EnumerableArrayData", {
      value: "unexpected",
      enumerable: true,
      configurable: true,
    }, () => {
      expectRejected(validInput({ executableResolutionEvidence: withRecomputedResolution({ blockingReasons: [] }) }), "executable_resolution_rejected");
    });
    withTemporaryPrototypeProperty(Array.prototype, "__action611EnumerableArrayAccessor", {
      get: () => "unexpected",
      enumerable: true,
      configurable: true,
    }, () => {
      expectRejected(validInput({ compatibilityPolicyResult: withRecomputedCompatibility({ reasons: ["compatible_for_read_only_observation"] }) }), "executable_resolution_rejected");
    });
    withTemporaryPrototypeProperty(Array.prototype, Symbol.for("action611.array"), {
      value: "unexpected",
      enumerable: true,
      configurable: true,
    }, () => {
      expectRejected(validInput({ executableRevalidationEvidence: revalidationEvidence(resolution, { blockingReasons: [] }) }), "executable_resolution_rejected");
    });
    withTemporaryPrototypeProperty(Object.prototype, "__action611EnumerableObjectData", {
      value: "unexpected",
      enumerable: true,
      configurable: true,
    }, () => {
      expectRejected(validInput({ executableResolutionEvidence: withRecomputedResolution({ ambiguityReasons: [] }) }), "input_contract_rejected");
      expectRejected(validInput(), "input_contract_rejected");
    });
    expectIssued();
  });
});
