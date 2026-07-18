import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

import {
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY,
  buildImmediatePreSpawnRevalidationObservation,
  evaluateImmediatePreSpawnRevalidationCore,
  validateImmediatePreSpawnRevalidationPreLstatEligibility,
  type ImmediatePreSpawnRevalidationFileType,
  type ImmediatePreSpawnRevalidationObservation,
} from "../../lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";
import {
  neutralizeOriginalFirstLiveResolverResultCore,
  type DormantFirstLiveCompositionAdapterResult,
} from "../../lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";
import {
  buildFirstLiveTrustedResolverCandidateObservation,
  evaluateFirstLiveTrustedExecutableResolution,
  getFirstLiveTrustedResolverPolicy,
  type FirstLiveTrustedResolverCandidatePolicy,
  type FirstLiveTrustedResolverToolIdentity,
} from "../../lib/post-trade-first-live-trusted-resolver-adapter-core";
import {
  buildFixtureExecutableIdentity,
  buildResolverSessionCapability,
  buildTrustedExecutableResolutionRequest,
  type TrustedExecutableResolutionRequest,
} from "../../lib/post-trade-trusted-live-resolver-adapter-core";

const repoRoot = process.cwd();
const adapterPath = "lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts";
const corePath = "lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts";
const compositionAdapterPath = "lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.ts";
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
const TEST_COMPOSITION_PROVENANCE = new WeakSet<object>();

function markTestLiveResolverProvenance<T extends object>(input: T): T {
  TEST_LIVE_RESOLVER_PROVENANCE.add(input);
  return input;
}

function markTestCompositionProvenance<T extends object>(input: T): T {
  TEST_COMPOSITION_PROVENANCE.add(input);
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

function compositionFixture(tool: FirstLiveTrustedResolverToolIdentity = "git") {
  const request = makeRequest(tool);
  const candidate = candidateFor(tool);
  const observations = [
    buildFirstLiveTrustedResolverCandidateObservation({
      observationSource: "test_synthetic_metadata",
      candidateId: candidate.candidateId,
      observedPath: candidate.absolutePath,
      outcome: "ok",
      fileType: "regular_file",
      executablePermission: "executable",
      metadata: {
        deviceId: "9007199254740993",
        inode: tool === "git" ? "9007199254740995" : "9007199254740997",
        sizeBytes: 54321,
        mode: 0o100755,
        modifiedTimeMs: 3000,
        changedTimeMs: 3001,
      },
    }),
    ...getFirstLiveTrustedResolverPolicy().candidatePolicies
      .filter((item) => item.toolIdentity === tool && item.candidateId !== candidate.candidateId)
      .map((item) => buildFirstLiveTrustedResolverCandidateObservation({
        observationSource: "test_synthetic_metadata",
        candidateId: item.candidateId,
        observedPath: item.absolutePath,
        outcome: "missing",
        fileType: "missing",
        executablePermission: "unknown",
        metadata: null,
      })),
  ];
  const resolverResult = evaluateFirstLiveTrustedExecutableResolution({
    request,
    platform: "darwin",
    candidateObservations: observations,
  });
  expect(resolverResult.status).toBe("resolved_live_filesystem_evidence");
  const compositionAdapterResult = neutralizeOriginalFirstLiveResolverResultCore({
    request,
    resolverResult: markTestLiveResolverProvenance(resolverResult),
  }, hasTestLiveResolverProvenance);
  expect(compositionAdapterResult.status).toBe("neutralized_composition_input_ready");
  return { request, resolverResult, compositionAdapterResult: markTestCompositionProvenance(compositionAdapterResult) };
}

function matchingObservation(result: DormantFirstLiveCompositionAdapterResult, patch: Partial<ImmediatePreSpawnRevalidationObservation> = {}) {
  return buildImmediatePreSpawnRevalidationObservation({
    observationSource: patch.observationSource ?? "test_synthetic_lstat",
    observedPath: patch.observedPath ?? result.resolvedAbsolutePath ?? "/missing",
    outcome: patch.outcome ?? "ok",
    fileType: patch.fileType ?? "regular_file",
    metadata: Object.prototype.hasOwnProperty.call(patch, "metadata") ? patch.metadata ?? null : result.neutralResolverMetadata,
    observedAt: patch.observedAt ?? "2026-07-17T10:50:10.000Z",
  });
}

function jsonClone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T;
}

function deepFreezeForTest<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreezeForTest(value);
  }
  return input;
}

function markedInvalidComposition(base: DormantFirstLiveCompositionAdapterResult, patch: Record<string, unknown>): DormantFirstLiveCompositionAdapterResult {
  return markTestCompositionProvenance(deepFreezeForTest({ ...base, ...patch }) as DormantFirstLiveCompositionAdapterResult);
}

function matchingBigIntStats(result: DormantFirstLiveCompositionAdapterResult, fileType: "regular_file" | "symlink" | "directory" = "regular_file") {
  return {
    dev: BigInt(result.neutralResolverMetadata?.deviceId ?? "0"),
    ino: BigInt(result.neutralResolverMetadata?.inode ?? "0"),
    size: BigInt(result.neutralResolverMetadata?.sizeBytes ?? 0),
    mode: BigInt(result.neutralResolverMetadata?.mode ?? 0),
    mtimeMs: BigInt(result.neutralResolverMetadata?.modifiedTimeMs ?? 0),
    isSymbolicLink: () => fileType === "symlink",
    isDirectory: () => fileType === "directory",
    isFile: () => fileType === "regular_file",
    isSocket: () => false,
    isFIFO: () => false,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
  };
}

function wrapperHarness(lstatImpl: (path: string, options: { bigint: true }) => Promise<unknown>, fixedNow = "2026-07-17T10:50:10.000Z") {
  const consumed = new WeakSet<object>();
  const consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation = (input: unknown) => {
    const evaluatedAt = fixedNow;
    if (typeof input !== "object" || input === null || Array.isArray(input)) return { ok: false, evaluatedAt, blockingReasons: ["input_shape_rejected"], preLstatEligibility: null };
    const keys = Object.keys(input);
    if (keys.length !== 1 || keys[0] !== "compositionAdapterResult") return { ok: false, evaluatedAt, blockingReasons: ["input_shape_rejected"], preLstatEligibility: null };
    const compositionAdapterResult = (input as { compositionAdapterResult?: unknown }).compositionAdapterResult;
    if (typeof compositionAdapterResult !== "object" || compositionAdapterResult === null) return { ok: false, evaluatedAt, blockingReasons: ["input_shape_rejected"], preLstatEligibility: null };
    if (!TEST_COMPOSITION_PROVENANCE.has(compositionAdapterResult)) return { ok: false, evaluatedAt, blockingReasons: ["production_live_provenance_missing"], preLstatEligibility: null };
    if (consumed.has(compositionAdapterResult)) return { ok: false, evaluatedAt, blockingReasons: ["second_attempt_rejected"], preLstatEligibility: null };
    const preLstatEligibility = validateImmediatePreSpawnRevalidationPreLstatEligibility({
      compositionAdapterResult: compositionAdapterResult as DormantFirstLiveCompositionAdapterResult,
      evaluatedAt,
    });
    if (preLstatEligibility.status !== "eligible_for_single_server_lstat" || preLstatEligibility.approvedResolvedAbsolutePath === null) {
      return { ok: false, evaluatedAt, blockingReasons: preLstatEligibility.blockingReasons, preLstatEligibility };
    }
    consumed.add(compositionAdapterResult);
    return { ok: true, compositionAdapterResult, evaluatedAt, preLstatEligibility };
  };
  const sourceText = source(adapterPath)
    .replace('import "server-only";', "")
    .replace('import { createHash } from "node:crypto";', 'const { createHash } = require("node:crypto");')
    .replace('import { lstat } from "node:fs/promises";', "const { lstat } = deps;")
    .replace(/import\s+\{[\s\S]*?\}\s+from "@\/lib\/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";/u, `const {
      DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS,
      buildImmediatePreSpawnRevalidationObservation,
      evaluateImmediatePreSpawnRevalidationCore,
    } = coreDeps;`)
    .replace(/import \{ consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation \} from "@\/lib\/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter";\n/u, "const { consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation } = deps;\n")
    .replace(/import type \{ DormantFirstLiveCompositionAdapterResult \} from "@\/lib\/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";\n/u, "")
    .replace(/export \* from "@\/lib\/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";\n/u, "")
    .replace(/export type DormantServerOnlyImmediatePreSpawnRevalidationInput = Readonly<\{[\s\S]*?\}>;\n/u, "")
    .replace(/export type ImmediatePreSpawnRevalidationForDormantFixedDirectSpawnConsumption = Readonly<[\s\S]*?\n>;\n/u, "")
    .replace("export function consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn", "function consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn")
    .replace("export async function revalidateDormantServerOnlyImmediatePreSpawn", "async function revalidateDormantServerOnlyImmediatePreSpawn");
  const js = ts.transpileModule(`const Date = deps.Date;\n${sourceText}\nreturn { revalidateDormantServerOnlyImmediatePreSpawn };`, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const factory = new Function("deps", "coreDeps", "require", js);
  return factory(
    { lstat: lstatImpl, consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation, Date: class extends Date {
      constructor(...args: ConstructorParameters<typeof Date>) {
        if (args.length > 0) super(args[0]);
        else super(fixedNow);
      }
    } },
    {
      DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS,
      buildImmediatePreSpawnRevalidationObservation,
      evaluateImmediatePreSpawnRevalidationCore,
    },
    require,
  ) as { revalidateDormantServerOnlyImmediatePreSpawn(input: unknown): Promise<ReturnType<typeof evaluateImmediatePreSpawnRevalidationCore>> };
}

test.describe("dormant server-only immediate pre-spawn revalidation adapter Action 543", () => {
  test("identity and policy are frozen dormant server-only and non-authoritative", () => {
    expect(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY).toMatchObject({
      adapterId: "ture.execution.dormant-server-only-immediate-pre-spawn-revalidation-adapter.server.v1",
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
    expect(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY).toMatchObject({
      acceptsCallerPolicy: false,
      acceptsCallerFilesystem: false,
      acceptsCallerCandidatePaths: false,
      acceptsDependencyInjection: false,
      filesystemPrimitive: "lstat",
      allowedFilesystemAttempts: 1,
      retryPolicy: "none",
      fallbackPathAllowed: false,
      alternateCandidateAllowed: false,
      symlinksAllowed: false,
      grantsSpawnAuthority: false,
      toctouEliminated: false,
    });
    expect(Object.isFrozen(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY)).toBe(true);
    expect(Object.isFrozen(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.metadataKeysCompared)).toBe(true);
  });

  test("server module owns the only lstat import and pure core has no live filesystem primitive", () => {
    const adapterSource = source(adapterPath);
    const coreSource = source(corePath);
    expect(adapterSource.startsWith('import "server-only";')).toBe(true);
    expect(adapterSource).toContain('from "node:fs/promises"');
    expect(adapterSource).toMatch(/\blstat\(/u);
    expect(coreSource).not.toContain('import "server-only";');
    expect(coreSource).not.toMatch(/node:fs|from ["']fs["']|fs\/promises|\blstat\(|\bstat\(|realpath|readFile|readdir|access\(/u);
    expect(adapterSource.match(/\blstat\(/gu)).toHaveLength(1);
    expect(adapterSource).not.toMatch(/candidatePaths|input\.policy|input\.filesystem|dependency|PATH|process\.env/u);
    expect(adapterSource).not.toMatch(/export function hasDormantImmediatePreSpawnRevalidationProductionProvenance|export .*WeakSet/u);
  });

  test("successful exact regular-file metadata match returns deterministic frozen evidence without authority", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const first = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult),
      attempt: 1,
      retryCount: 0,
    });
    const second = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult),
      attempt: 1,
      retryCount: 0,
    });
    expect(first.status).toBe("revalidated_non_authoritative_evidence");
    expect(first.revalidationEvidence).toMatchObject({
      immediateRevalidationOccurred: true,
      observationSource: "test_synthetic_lstat",
      productionLiveRevalidationProvenance: "none",
      exactMetadataMatched: true,
      pointInTimeOnly: true,
      toctouEliminated: false,
      serializedEvidenceReusableAsAuthority: false,
      authoritativeLive: false,
      filesystemAuthority: "none",
      spawnAuthority: "none",
      observerAuthority: "none",
      credentialAuthority: "none",
      cliExecutionAuthority: "none",
      runnerAuthority: "none",
      processSpawned: false,
      shellUsed: false,
      cliVersionCollected: false,
      credentialAccessed: false,
      networkAccessed: false,
      observerInvoked: false,
      authorizationConsumed: false,
      retryCount: 0,
      filesystemAttemptCount: 1,
      blockingReasons: [],
    });
    expect(first.revalidationEvidence.expectedResolvedAbsolutePath).toBe("/usr/bin/git");
    expect(first.revalidationEvidence.observedResolvedAbsolutePath).toBe("/usr/bin/git");
    expect(first.revalidationEvidence.observationFingerprint).toBe(matchingObservation(compositionAdapterResult).observationFingerprint);
    expect(first.resultFingerprint).toBe(second.resultFingerprint);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.revalidationEvidence)).toBe(true);
    expect(Object.isFrozen(first.revalidationEvidence.expectedMetadata)).toBe(true);
  });

  test("supabase_cli evidence uses only reviewed source-controlled candidate paths", () => {
    const supabasePaths = getFirstLiveTrustedResolverPolicy().candidatePolicies
      .filter((candidate) => candidate.toolIdentity === "supabase_cli")
      .map((candidate) => candidate.absolutePath);
    expect(supabasePaths).toEqual(["/opt/homebrew/bin/supabase", "/usr/local/bin/supabase"]);
    expect(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.acceptsCallerCandidatePaths).toBe(false);
    expect(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.alternateCandidateAllowed).toBe(false);
    expect(source(adapterPath)).not.toMatch(/supabase.*--version|--version.*supabase/u);
  });

  test("filesystem rejection reasons fail closed for missing symlink directory special files and errors", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const cases: Array<[ImmediatePreSpawnRevalidationFileType, ImmediatePreSpawnRevalidationObservation["outcome"], string]> = [
      ["missing", "missing", "current_file_missing"],
      ["symlink", "ok", "current_file_symlink"],
      ["directory", "ok", "current_file_not_regular"],
      ["socket", "ok", "current_file_not_regular"],
      ["fifo", "ok", "current_file_not_regular"],
      ["block_device", "ok", "current_file_not_regular"],
      ["character_device", "ok", "current_file_not_regular"],
      ["unknown", "filesystem_error", "filesystem_error"],
    ];
    for (const [fileType, outcome, reason] of cases) {
      const result = evaluateImmediatePreSpawnRevalidationCore({
        compositionAdapterResult,
        currentObservation: matchingObservation(compositionAdapterResult, { outcome, fileType, metadata: null }),
      });
      expect(result.status, reason).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.blockingReasons).toContain(reason);
      expect(result.revalidationEvidence.spawnAuthority).toBe("none");
    }
  });

  test("malformed relative and non-allowlisted paths fail closed", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const forgedComposition = deepFreezeForTest({ ...compositionAdapterResult, resolvedAbsolutePath: "git" });
    const relative = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult: forgedComposition as DormantFirstLiveCompositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult, { observedPath: "git" }),
    });
    expect(relative.revalidationEvidence.blockingReasons).toEqual(expect.arrayContaining(["path_not_absolute", "path_not_policy_allowlisted"]));

    const nonAllowlisted = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult, { observedPath: "/tmp/git" }),
    });
    expect(nonAllowlisted.revalidationEvidence.blockingReasons).toContain("current_path_mismatch");
  });

  test("each trust-critical metadata field mismatch fails closed", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const base = compositionAdapterResult.neutralResolverMetadata;
    if (!base) throw new Error("missing metadata");
    for (const [field, reason, value] of [
      ["deviceId", "device_id_mismatch", "9007199254740994"],
      ["inode", "inode_mismatch", "9007199254740996"],
      ["sizeBytes", "size_bytes_mismatch", base.sizeBytes + 1],
      ["mode", "mode_mismatch", base.mode + 1],
      ["modifiedTimeMs", "modified_time_mismatch", base.modifiedTimeMs + 1],
    ] as const) {
      const result = evaluateImmediatePreSpawnRevalidationCore({
        compositionAdapterResult,
        currentObservation: matchingObservation(compositionAdapterResult, { metadata: { ...base, [field]: value } }),
      });
      expect(result.status, field).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.blockingReasons).toContain(reason);
    }
  });

  test("tool platform policy session purpose and revalidation-link mismatches fail closed", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    for (const forged of [
      { ...compositionAdapterResult, toolIdentity: "node" },
      { ...compositionAdapterResult, adapterId: "other-adapter" },
      { ...compositionAdapterResult, status: "blocked_fail_closed" },
      { ...compositionAdapterResult, immediatePreSpawnRevalidationRequired: false },
      { ...compositionAdapterResult, toctouEliminated: true },
    ]) {
      const result = evaluateImmediatePreSpawnRevalidationCore({
        compositionAdapterResult: deepFreezeForTest(forged) as DormantFirstLiveCompositionAdapterResult,
        currentObservation: matchingObservation(compositionAdapterResult),
      });
      expect(result.status).toBe("blocked_fail_closed");
    }
  });

  test("JSON clone spread clone structured clone mutation and fingerprint mismatch fail closed", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const observation = matchingObservation(compositionAdapterResult);
    for (const cloned of [
      { ...compositionAdapterResult },
      jsonClone(compositionAdapterResult),
      { ...compositionAdapterResult, resultFingerprint: "0".repeat(64) },
    ]) {
      const result = evaluateImmediatePreSpawnRevalidationCore({
        compositionAdapterResult: cloned as DormantFirstLiveCompositionAdapterResult,
        currentObservation: observation,
      });
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.spawnAuthority).toBe("none");
    }
    if (typeof structuredClone === "function") {
      const structured = evaluateImmediatePreSpawnRevalidationCore({
        compositionAdapterResult: structuredClone(compositionAdapterResult),
        currentObservation: observation,
      });
      expect(structured.status).toBe("blocked_fail_closed");
    }
  });

  test("expired stale cross-session cross-purpose cross-tool and cross-platform evidence fails closed", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const expired = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult),
      evaluatedAt: "2026-07-17T10:51:00.000Z",
    });
    expect(expired.revalidationEvidence.blockingReasons).toContain("composition_result_expired_or_stale");

    const evidence = compositionAdapterResult.neutralCompositionEvidenceSet?.evidence ?? [];
    for (const patch of [
      { ...evidence[0], boundarySessionId: "other_session" },
      { ...evidence[0], purpose: "other_purpose" },
      { ...evidence[0], toolIdentity: "supabase_cli" },
      { ...evidence[0], platform: "linux" },
    ]) {
      const forgedSet = deepFreezeForTest({ ...compositionAdapterResult.neutralCompositionEvidenceSet, evidence: [patch, ...evidence.slice(1)] });
      const result = evaluateImmediatePreSpawnRevalidationCore({
        compositionAdapterResult: deepFreezeForTest({ ...compositionAdapterResult, neutralCompositionEvidenceSet: forgedSet }) as DormantFirstLiveCompositionAdapterResult,
        currentObservation: matchingObservation(compositionAdapterResult),
      });
      expect(result.status).toBe("blocked_fail_closed");
    }
  });

  test("authority claims retry and second attempt are rejected", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const authority = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult: deepFreezeForTest({ ...compositionAdapterResult, spawnAuthority: "live_process_start" }) as unknown as DormantFirstLiveCompositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult),
    });
    expect(authority.revalidationEvidence.blockingReasons).toContain("composition_result_authority_rejected");

    const retry = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult),
      retryCount: 1 as 0,
    });
    expect(retry.revalidationEvidence.blockingReasons).toContain("retry_not_allowed");

    const second = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult),
      attempt: 2 as 1,
    });
    expect(second.revalidationEvidence.blockingReasons).toContain("second_attempt_rejected");
  });

  test("current observation mutation and unsafe metadata schema fail closed", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const observation = matchingObservation(compositionAdapterResult);
    const mutatedObservation = { ...observation, observationFingerprint: "0".repeat(64) };
    const mutated = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: mutatedObservation,
    });
    expect(mutated.revalidationEvidence.blockingReasons).toContain("current_observation_mutated");

    const badMetadata = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult, {
        metadata: { ...compositionAdapterResult.neutralResolverMetadata, changedTimeMs: 1 } as never,
      }),
    });
    expect(badMetadata.revalidationEvidence.blockingReasons).toContain("current_metadata_rejected");
  });

  test("canonical device and inode metadata reject lossy or non-decimal representations", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const base = compositionAdapterResult.neutralResolverMetadata;
    if (!base) throw new Error("missing metadata");
    for (const [deviceId, inode] of [
      ["09007199254740993", base.inode],
      ["9.007199254740993e15", base.inode],
      ["9007199254740993.0", base.inode],
      ["+9007199254740993", base.inode],
      [base.deviceId, "09007199254740995"],
      [base.deviceId, "9.007199254740995e15"],
      [base.deviceId, "-9007199254740995"],
    ]) {
      const result = evaluateImmediatePreSpawnRevalidationCore({
        compositionAdapterResult,
        currentObservation: matchingObservation(compositionAdapterResult, { metadata: { ...base, deviceId, inode } }),
      });
      expect(result.status, `${deviceId}/${inode}`).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.blockingReasons).toContain("current_metadata_rejected");
    }
  });

  test("production wrapper API is closed over time filesystem path policy metadata and dependency injection", () => {
    const adapterSource = source(adapterPath);
    expect(adapterSource).toContain("export type DormantServerOnlyImmediatePreSpawnRevalidationInput");
    expect(adapterSource).toMatch(/compositionAdapterResult: DormantFirstLiveCompositionAdapterResult/u);
    expect(adapterSource).not.toMatch(/evaluatedAt\?:|input\.evaluatedAt|clock|input\.filesystem|lstatFunction|candidatePath|input\.metadata|authorityFlags|retrySetting|testMode/u);
    expect(adapterSource).not.toMatch(/const observedAt = new Date\(\)\.toISOString\(\);/u);
    expect(adapterSource).toContain("consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation(input)");
    expect(adapterSource.indexOf("consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation(input)")).toBeLessThan(adapterSource.indexOf("await observeApprovedPathWithLstat"));
    expect(adapterSource).toContain("await observeApprovedPathWithLstat(claimed.preLstatEligibility.approvedResolvedAbsolutePath, claimed.evaluatedAt)");
    expect(adapterSource).not.toContain("compositionAdapterResult.resolvedAbsolutePath, observedAt");
  });

  test("production wrapper preserves exact bigint dev and ino strings without number coercion", () => {
    const adapterSource = source(adapterPath);
    expect(adapterSource).toContain("await lstat(path, { bigint: true })");
    expect(adapterSource).toContain("deviceId: canonicalBigIntString(stats.dev)");
    expect(adapterSource).toContain("inode: canonicalBigIntString(stats.ino)");
    expect(adapterSource).not.toMatch(/Number\(stats\.dev\)|Number\(stats\.ino\)|parseInt\(stats\.dev|parseInt\(stats\.ino|\+stats\.dev|\+stats\.ino/u);
  });

  test("test harness executes actual wrapper source with one controlled lstat success", async () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const calls: Array<{ path: string; options: { bigint: true } }> = [];
    const harness = wrapperHarness(async (path, options) => {
      calls.push({ path, options });
      return matchingBigIntStats(compositionAdapterResult);
    });
    const result = await harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult });
    expect(calls).toEqual([{ path: "/usr/bin/git", options: { bigint: true } }]);
    expect(result.status).toBe("revalidated_non_authoritative_evidence");
    expect(result.revalidationEvidence.productionLiveRevalidationProvenance).toBe("server_only_private_original_object");
    expect(result.revalidationEvidence.observationSource).toBe("server_only_lstat");
    expect(result.revalidationEvidence.observedMetadata?.deviceId).toBe("9007199254740993");
    expect(result.revalidationEvidence.observedMetadata?.inode).toBe("9007199254740995");
    expect(result.revalidationEvidence.processSpawned).toBe(false);
    expect(result.revalidationEvidence.spawnAuthority).toBe("none");
  });

  test("test harness executes actual wrapper fail-closed and one-shot ordering", async () => {
    const { compositionAdapterResult } = compositionFixture("git");
    let calls = 0;
    const harness = wrapperHarness(async () => {
      calls += 1;
      throw Object.assign(new Error("mock lstat failure"), { code: "EACCES" });
    });
    const malformed = await harness.revalidateDormantServerOnlyImmediatePreSpawn(null);
    expect(malformed.status).toBe("blocked_fail_closed");
    expect(calls).toBe(0);

    const first = await harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult });
    expect(first.status).toBe("blocked_fail_closed");
    expect(first.revalidationEvidence.blockingReasons).toContain("filesystem_error");
    expect(calls).toBe(1);

    const second = await harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult });
    expect(second.status).toBe("blocked_fail_closed");
    expect(second.revalidationEvidence.blockingReasons).toContain("second_attempt_rejected");
    expect(calls).toBe(1);
  });

  test("actual wrapper import does not lstat before invocation", () => {
    let calls = 0;
    wrapperHarness(async () => {
      calls += 1;
      return {};
    });
    expect(calls).toBe(0);
  });

  test("actual wrapper rejects non-original composition-looking objects before lstat", async () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const syntheticPureCoreComposition = neutralizeOriginalFirstLiveResolverResultCore({
      request: makeRequest("git"),
      resolverResult: markTestLiveResolverProvenance(compositionFixture("git").resolverResult),
    }, hasTestLiveResolverProvenance);
    const cases: Array<[string, unknown]> = [
      ["plain reconstruction", { compositionAdapterResult: { ...compositionAdapterResult } }],
      ["spread clone", { compositionAdapterResult: { ...compositionAdapterResult } }],
      ["JSON clone", { compositionAdapterResult: jsonClone(compositionAdapterResult) }],
      ["copied fingerprint", { compositionAdapterResult: { ...compositionAdapterResult, resultFingerprint: compositionAdapterResult.resultFingerprint } }],
      ["copied metadata", { compositionAdapterResult: { ...compositionAdapterResult, neutralResolverMetadata: compositionAdapterResult.neutralResolverMetadata } }],
      ["synthetic pure core", { compositionAdapterResult: syntheticPureCoreComposition }],
      ["missing production provenance", { compositionAdapterResult: deepFreezeForTest({ ...compositionAdapterResult }) }],
    ];
    if (typeof structuredClone === "function") cases.push(["structured clone", { compositionAdapterResult: structuredClone(compositionAdapterResult) }]);
    for (const [name, input] of cases) {
      const calls: string[] = [];
      const harness = wrapperHarness(async (path) => {
        calls.push(path);
        return matchingBigIntStats(compositionAdapterResult);
      });
      const result = await harness.revalidateDormantServerOnlyImmediatePreSpawn(input);
      expect(result.status, name).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.blockingReasons, name).toContain("production_live_provenance_missing");
      expect(result.revalidationEvidence.filesystemAttemptCount, name).toBe(0);
      expect(calls, name).toEqual([]);
    }
  });

  test("actual wrapper rejects unsafe paths tools platforms and policies before lstat", async () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const evidence = compositionAdapterResult.neutralCompositionEvidenceSet?.evidence ?? [];
    const cases: Array<[string, DormantFirstLiveCompositionAdapterResult]> = [
      ["arbitrary absolute path", markedInvalidComposition(compositionAdapterResult, { resolvedAbsolutePath: "/tmp/not-approved-git" })],
      ["relative path", markedInvalidComposition(compositionAdapterResult, { resolvedAbsolutePath: "git" })],
      ["non-allowlisted path", markedInvalidComposition(compositionAdapterResult, { resolvedAbsolutePath: "/Applications/Git.app/git" })],
      ["correct tool wrong path", markedInvalidComposition(compositionAdapterResult, { resolvedAbsolutePath: "/usr/local/bin/git" })],
      ["correct path wrong tool", markedInvalidComposition(compositionAdapterResult, { toolIdentity: "supabase_cli" })],
      ["unsupported platform", markedInvalidComposition(compositionAdapterResult, { neutralCompositionEvidenceSet: deepFreezeForTest({ ...compositionAdapterResult.neutralCompositionEvidenceSet, evidence: [{ ...evidence[0], platform: "linux" }, ...evidence.slice(1)] }) })],
      ["policy path mismatch", markedInvalidComposition(compositionAdapterResult, { neutralCompositionEvidenceSet: deepFreezeForTest({ ...compositionAdapterResult.neutralCompositionEvidenceSet, evidence: [{ ...evidence[0], resolverPolicyId: "other_policy" }, ...evidence.slice(1)] }) })],
    ];
    const accessorBacked = Object.freeze(Object.defineProperty({ ...compositionAdapterResult }, "resolvedAbsolutePath", {
      enumerable: true,
      get: () => {
        throw new Error("path getter must not run");
      },
    })) as DormantFirstLiveCompositionAdapterResult;
    markTestCompositionProvenance(accessorBacked);
    const inheritedPath = Object.create({ resolvedAbsolutePath: "/usr/bin/git" }) as Record<string, unknown>;
    for (const [key, value] of Object.entries(compositionAdapterResult)) if (key !== "resolvedAbsolutePath") inheritedPath[key] = value;
    const inherited = markTestCompositionProvenance(deepFreezeForTest(inheritedPath) as DormantFirstLiveCompositionAdapterResult);
    cases.push(["accessor-backed path", accessorBacked], ["inherited path", inherited]);

    for (const [name, composition] of cases) {
      const calls: string[] = [];
      const harness = wrapperHarness(async (path) => {
        calls.push(path);
        return matchingBigIntStats(compositionAdapterResult);
      });
      const result = await harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult: composition });
      expect(result.status, name).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.filesystemAttemptCount, name).toBe(0);
      expect(calls, name).toEqual([]);
    }
  });

  test("actual wrapper rejects stale expired and cross-boundary originals before lstat", async () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const evidence = compositionAdapterResult.neutralCompositionEvidenceSet?.evidence ?? [];
    const cases: Array<[string, DormantFirstLiveCompositionAdapterResult, string?]> = [
      ["stale original evidence", compositionAdapterResult, "2026-07-17T10:51:00.000Z"],
      ["expired original evidence", compositionAdapterResult, "2026-07-17T10:52:00.000Z"],
      ["cross-session", markedInvalidComposition(compositionAdapterResult, { neutralCompositionEvidenceSet: deepFreezeForTest({ ...compositionAdapterResult.neutralCompositionEvidenceSet, evidence: [{ ...evidence[0], boundarySessionId: "other_session" }, ...evidence.slice(1)] }) })],
      ["cross-purpose", markedInvalidComposition(compositionAdapterResult, { neutralCompositionEvidenceSet: deepFreezeForTest({ ...compositionAdapterResult.neutralCompositionEvidenceSet, evidence: [{ ...evidence[0], purpose: "other_purpose" }, ...evidence.slice(1)] }) })],
      ["cross-boundary", markedInvalidComposition(compositionAdapterResult, { adapterId: "other_adapter" })],
      ["mutated original", markedInvalidComposition(compositionAdapterResult, { resultFingerprint: "0".repeat(64) })],
      ["future-dated malformed evidence", markedInvalidComposition(compositionAdapterResult, { neutralCompositionEvidenceSet: deepFreezeForTest({ ...compositionAdapterResult.neutralCompositionEvidenceSet, evidence: [{ ...evidence[0], evaluatedAt: "2099-01-01T00:00:00.000Z" }, ...evidence.slice(1)] }) })],
    ];
    for (const [name, composition, now] of cases) {
      const calls: string[] = [];
      const harness = wrapperHarness(async (path) => {
        calls.push(path);
        return matchingBigIntStats(compositionAdapterResult);
      }, now);
      const result = await harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult: composition });
      expect(result.status, name).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.filesystemAttemptCount, name).toBe(0);
      expect(calls, name).toEqual([]);
    }
  });

  test("actual wrapper rejects authority-bearing original objects before lstat", async () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const evidence = compositionAdapterResult.neutralCompositionEvidenceSet?.evidence ?? [];
    const cases: Array<[string, DormantFirstLiveCompositionAdapterResult]> = [
      ["top-level filesystem authority", markedInvalidComposition(compositionAdapterResult, { filesystemAuthority: "live_filesystem" })],
      ["nested filesystem authority", markedInvalidComposition(compositionAdapterResult, { neutralCompositionEvidenceSet: deepFreezeForTest({ ...compositionAdapterResult.neutralCompositionEvidenceSet, evidence: [{ ...evidence[0], filesystemAuthority: "live_filesystem" }, ...evidence.slice(1)] }) })],
      ["nested spawn authority", markedInvalidComposition(compositionAdapterResult, { compositionResult: deepFreezeForTest({ ...compositionAdapterResult.compositionResult, spawnAuthority: "live_process_start" }) })],
      ["nested credential runner network trading authority", markedInvalidComposition(compositionAdapterResult, { compositionResult: deepFreezeForTest({ ...compositionAdapterResult.compositionResult, credentialAuthority: "live_credential", runnerAuthority: "live_runner", networkAuthority: "live_network", tradingAuthority: "live_trading" }) })],
    ];
    for (const [name, composition] of cases) {
      const calls: string[] = [];
      const harness = wrapperHarness(async (path) => {
        calls.push(path);
        return matchingBigIntStats(compositionAdapterResult);
      });
      const result = await harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult: composition });
      expect(result.status, name).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.blockingReasons, name).toContain("composition_result_authority_rejected");
      expect(result.revalidationEvidence.filesystemAttemptCount, name).toBe(0);
      expect(calls, name).toEqual([]);
    }
  });

  test("actual wrapper rejects malformed and closed-schema inputs before lstat", async () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const cases: unknown[] = [
      null,
      undefined,
      "git",
      1,
      [],
      { compositionAdapterResult, extra: true },
      { other: compositionAdapterResult },
    ];
    for (const input of cases) {
      const calls: string[] = [];
      const harness = wrapperHarness(async (path) => {
        calls.push(path);
        return matchingBigIntStats(compositionAdapterResult);
      });
      const result = await harness.revalidateDormantServerOnlyImmediatePreSpawn(input);
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.filesystemAttemptCount).toBe(0);
      expect(calls).toEqual([]);
    }
  });

  test("actual wrapper concurrent duplicate call performs at most one total lstat", async () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const calls: string[] = [];
    const harness = wrapperHarness(async (path) => {
      calls.push(path);
      await Promise.resolve();
      return matchingBigIntStats(compositionAdapterResult);
    });
    const [first, second] = await Promise.all([
      harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult }),
      harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult }),
    ]);
    expect(calls).toEqual(["/usr/bin/git"]);
    expect([first.status, second.status].sort()).toEqual(["blocked_fail_closed", "revalidated_non_authoritative_evidence"]);
    expect([first, second].filter((result) => result.revalidationEvidence.blockingReasons.includes("second_attempt_rejected"))).toHaveLength(1);
  });

  test("actual wrapper performs one terminal lstat for valid filesystem failures and non-regular files", async () => {
    const { compositionAdapterResult: filesystemFailure } = compositionFixture("git");
    let failureCalls = 0;
    const failureHarness = wrapperHarness(async () => {
      failureCalls += 1;
      throw Object.assign(new Error("mock stat denied"), { code: "EACCES" });
    });
    const failure = await failureHarness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult: filesystemFailure });
    expect(failure.status).toBe("blocked_fail_closed");
    expect(failure.revalidationEvidence.blockingReasons).toContain("filesystem_error");
    expect(failureCalls).toBe(1);

    for (const fileType of ["symlink", "directory"] as const) {
      const { compositionAdapterResult } = compositionFixture("git");
      const calls: string[] = [];
      const harness = wrapperHarness(async (path) => {
        calls.push(path);
        return matchingBigIntStats(compositionAdapterResult, fileType);
      });
      const result = await harness.revalidateDormantServerOnlyImmediatePreSpawn({ compositionAdapterResult });
      expect(result.status, fileType).toBe("blocked_fail_closed");
      expect(result.revalidationEvidence.filesystemAttemptCount, fileType).toBe(1);
      expect(calls, fileType).toEqual(["/usr/bin/git"]);
      expect(result.revalidationEvidence.blockingReasons, fileType).toEqual(expect.arrayContaining(fileType === "symlink" ? ["current_file_symlink"] : ["current_file_not_regular"]));
    }
  });

  test("one-shot replay is private original-object based and consumed before filesystem await", () => {
    const adapterSource = source(adapterPath);
    const compositionAdapterSource = source(compositionAdapterPath);
    expect(adapterSource).toContain("consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation(input)");
    expect(compositionAdapterSource).toContain("const DORMANT_FIRST_LIVE_COMPOSITION_RESULTS_CONSUMED_FOR_IMMEDIATE_REVALIDATION = new WeakSet<object>();");
    expect(compositionAdapterSource.indexOf("validateImmediatePreSpawnRevalidationPreLstatEligibility")).toBeLessThan(compositionAdapterSource.indexOf("DORMANT_FIRST_LIVE_COMPOSITION_RESULTS_CONSUMED_FOR_IMMEDIATE_REVALIDATION.add"));
    expect(adapterSource.indexOf("consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation(input)")).toBeLessThan(adapterSource.indexOf("await observeApprovedPathWithLstat"));
    expect(compositionAdapterSource).not.toMatch(/export .*WeakSet|reset.*CONSUMED|delete\(shape\.compositionAdapterResult\)|isTrusted|mint|brand/u);
  });

  test("pure synthetic output cannot claim production live provenance and copied provenance changes fingerprints", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    const synthetic = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult,
      currentObservation: matchingObservation(compositionAdapterResult),
      attempt: 1,
      retryCount: 0,
    });
    expect(synthetic.status).toBe("revalidated_non_authoritative_evidence");
    expect(synthetic.revalidationEvidence.observationSource).toBe("test_synthetic_lstat");
    expect(synthetic.revalidationEvidence.productionLiveRevalidationProvenance).toBe("none");
    const copied = deepFreezeForTest({
      ...synthetic,
      revalidationEvidence: {
        ...synthetic.revalidationEvidence,
        productionLiveRevalidationProvenance: "server_only_private_original_object",
      },
    });
    expect(copied.resultFingerprint).toBe(synthetic.resultFingerprint);
    expect(copied.revalidationEvidence.evidenceFingerprint).toBe(synthetic.revalidationEvidence.evidenceFingerprint);
  });

  test("static security review finds no spawn env network credentials persistence or runtime wiring", () => {
    const adapterSource = source(adapterPath);
    const coreSource = source(corePath);
    const combined = `${adapterSource}\n${coreSource}`;
    expect(combined).not.toMatch(/child_process|\bspawn\(|\bexec\(|\bexecFile\(|\bfork\(|Bun\.spawn|Deno\.Command|shellCommand/u);
    expect(combined).not.toMatch(/\bprocess\.env\b|dotenv|SUPABASE_STAGING|PATH discovery|command -v|which\s/u);
    expect(combined).not.toMatch(/\bfetch\(|axios|from ["']node:net|from ["']node:tls|@supabase|createClient/u);
    expect(combined).not.toMatch(/keytar|document\.cookie|cookies\(|localStorage|sessionStorage|bankid\(|avanza\(/iu);
    expect(combined).not.toMatch(/\binsert\(|\bdelete\(|\bupsert\(|\brpc\(|storage\.|writeFile|appendFile|mkdir|unlink|rename|chmod|chown/u);
    expect(combined).not.toMatch(/setTimeout|setInterval|AbortSignal\.timeout|kill\(|SIGTERM|SIGKILL/u);
    expect(coreSource).not.toMatch(/from ["']node:fs\/promises|await lstat|\blstat\(/u);
  });

  test("adapter is not wired into API UI runner observer spawn credential or composition modules", () => {
    const importPattern = "post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter";
    for (const candidate of [
      apiValidationRoutePath,
      tradeUiPath,
      "lib/post-trade-scoped-macos-process-observer.ts",
      "lib/post-trade-scoped-macos-process-observer-core.ts",
      "lib/post-trade-direct-spawn-driver-boundary.ts",
      "lib/post-trade-direct-spawn-driver-boundary-core.ts",
      "lib/post-trade-credential-source-adapter-boundary.ts",
      "lib/post-trade-credential-source-adapter-boundary-core.ts",
    ]) {
      expect(source(candidate), candidate).not.toContain(importPattern);
    }
    expect(source(compositionAdapterPath)).not.toMatch(/from ["']@\/lib\/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter["']/u);
    expect(source(compositionAdapterPath)).toContain("post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core");
  });

  test("neighboring dormant composition result remains non-executing after revalidation evidence exists", () => {
    const { compositionAdapterResult } = compositionFixture("git");
    expect(compositionAdapterResult.processSpawned).toBe(false);
    expect(compositionAdapterResult.shellUsed).toBe(false);
    expect(compositionAdapterResult.credentialAccessed).toBe(false);
    expect(compositionAdapterResult.cliVersionCollected).toBe(false);
    expect(compositionAdapterResult.spawnAuthority).toBe("none");
    expect(source(adapterPath)).not.toContain("composeDormantServerOnlyFirstLiveStagingPreflight(");
  });
});
