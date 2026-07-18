import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

import {
  DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY,
  buildFixedReadOnlyDirectSpawnObservation,
  evaluateFixedReadOnlyDirectSpawnCore,
  type FixedReadOnlyDirectSpawnResult,
} from "../../lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core";
import {
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS,
  buildImmediatePreSpawnRevalidationObservation,
  evaluateImmediatePreSpawnRevalidationCore,
  type ImmediatePreSpawnRevalidationResult,
} from "../../lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";
import {
  neutralizeOriginalFirstLiveResolverResultCore,
  type DormantFirstLiveCompositionAdapterResult,
} from "../../lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";
import {
  buildFirstLiveTrustedResolverCandidateObservation,
  evaluateFirstLiveTrustedExecutableResolution,
  getFirstLiveTrustedResolverPolicy,
  type FirstLiveTrustedResolverToolIdentity,
} from "../../lib/post-trade-first-live-trusted-resolver-adapter-core";
import {
  buildFixtureExecutableIdentity,
  buildResolverSessionCapability,
  buildTrustedExecutableResolutionRequest,
} from "../../lib/post-trade-trusted-live-resolver-adapter-core";

const repoRoot = process.cwd();
const adapterPath = "lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts";
const corePath = "lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core.ts";
const revalidationAdapterPath = "lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts";
const apiValidationRoutePath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

const TEST_LIVE_RESOLVER_PROVENANCE = new WeakSet<object>();
const TEST_REVALIDATION_PROVENANCE = new WeakSet<object>();

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function markTestLiveResolverProvenance<T extends object>(input: T): T {
  TEST_LIVE_RESOLVER_PROVENANCE.add(input);
  return input;
}

function markTestRevalidationProvenance<T extends object>(input: T): T {
  TEST_REVALIDATION_PROVENANCE.add(input);
  return input;
}

function hasTestLiveResolverProvenance(input: unknown): boolean {
  return typeof input === "object" && input !== null && TEST_LIVE_RESOLVER_PROVENANCE.has(input);
}

function compositionFixture(tool: FirstLiveTrustedResolverToolIdentity = "git") {
  const session = buildResolverSessionCapability();
  const identity = buildFixtureExecutableIdentity({
    boundarySessionId: session.boundarySessionId,
    expectedToolIdentity: tool,
    approvedRootClass: tool === "git" ? "system_usr_bin" : "homebrew_bin",
  });
  const request = buildTrustedExecutableResolutionRequest(session, identity);
  const candidate = getFirstLiveTrustedResolverPolicy().candidatePolicies.find((item) => item.toolIdentity === tool);
  if (!candidate) throw new Error(`missing candidate for ${tool}`);
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
    ],
  });
  expect(resolverResult.status).toBe("resolved_live_filesystem_evidence");
  const compositionAdapterResult = neutralizeOriginalFirstLiveResolverResultCore({
    request,
    resolverResult: markTestLiveResolverProvenance(resolverResult),
  }, hasTestLiveResolverProvenance);
  expect(compositionAdapterResult.status).toBe("neutralized_composition_input_ready");
  return compositionAdapterResult;
}

function revalidationFixture(tool: FirstLiveTrustedResolverToolIdentity = "git") {
  const composition = compositionFixture(tool);
  const coreResult = evaluateImmediatePreSpawnRevalidationCore({
    compositionAdapterResult: composition,
    currentObservation: matchingObservation(composition),
    evaluatedAt: "2026-07-17T10:50:10.000Z",
    attempt: 1,
    retryCount: 0,
    productionLiveProvenance: false,
  });
  expect(coreResult.status).toBe("revalidated_non_authoritative_evidence");
  const evidenceCore = {
    ...stripEvidenceFingerprint(coreResult.revalidationEvidence),
    productionLiveRevalidationProvenance: "server_only_private_original_object",
  };
  const evidence = deepFreezeForTest({
    ...evidenceCore,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.evidence, evidenceCore),
  } as ImmediatePreSpawnRevalidationResult["revalidationEvidence"]);
  const resultCore = {
    ...stripResultFingerprint(coreResult),
    revalidationEvidence: evidence,
  };
  return markTestRevalidationProvenance(deepFreezeForTest({
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.result, resultCore),
  } as ImmediatePreSpawnRevalidationResult));
}

function matchingObservation(result: DormantFirstLiveCompositionAdapterResult) {
  return buildImmediatePreSpawnRevalidationObservation({
    observationSource: "test_synthetic_lstat",
    observedPath: result.resolvedAbsolutePath ?? "/missing",
    outcome: "ok",
    fileType: "regular_file",
    metadata: result.neutralResolverMetadata,
    observedAt: "2026-07-17T10:50:10.000Z",
  });
}

function stripEvidenceFingerprint(input: ImmediatePreSpawnRevalidationResult["revalidationEvidence"]) {
  const core = { ...input } as Record<string, unknown>;
  delete core.evidenceFingerprintAlgorithm;
  delete core.evidenceFingerprint;
  return core;
}

function stripResultFingerprint(input: ImmediatePreSpawnRevalidationResult) {
  const core = { ...input } as Record<string, unknown>;
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  return core;
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

function markedInvalid(base: ImmediatePreSpawnRevalidationResult, patch: Record<string, unknown>): ImmediatePreSpawnRevalidationResult {
  return markTestRevalidationProvenance(deepFreezeForTest({ ...base, ...patch }) as ImmediatePreSpawnRevalidationResult);
}

function markedInvalidEvidence(base: ImmediatePreSpawnRevalidationResult, evidencePatch: Record<string, unknown>): ImmediatePreSpawnRevalidationResult {
  return markTestRevalidationProvenance(deepFreezeForTest({
    ...base,
    revalidationEvidence: {
      ...base.revalidationEvidence,
      ...evidencePatch,
    },
  }) as ImmediatePreSpawnRevalidationResult);
}

function wrapperHarness(spawnImpl: (path: string, argv: readonly string[], options: Record<string, unknown>) => unknown, fixedNow = "2026-07-17T11:10:00.000Z") {
  const consumed = new WeakSet<object>();
  const consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn = (input: unknown) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) return { ok: false, evaluatedAt: fixedNow, blockingReasons: ["input_shape_rejected"] };
    const keys = Object.keys(input);
    if (keys.length !== 1 || keys[0] !== "revalidationResult") return { ok: false, evaluatedAt: fixedNow, blockingReasons: ["input_shape_rejected"] };
    const revalidationResult = (input as { revalidationResult?: unknown }).revalidationResult;
    if (typeof revalidationResult !== "object" || revalidationResult === null || !TEST_REVALIDATION_PROVENANCE.has(revalidationResult)) {
      return { ok: false, evaluatedAt: fixedNow, blockingReasons: ["production_revalidation_provenance_missing"] };
    }
    if (consumed.has(revalidationResult)) return { ok: false, evaluatedAt: fixedNow, blockingReasons: ["second_attempt_rejected"] };
    const trial = evaluateFixedReadOnlyDirectSpawnCore({
      consumedRevalidation: {
        ok: true,
        revalidationResult: revalidationResult as ImmediatePreSpawnRevalidationResult,
        evaluatedAt: fixedNow,
        approvedExecutablePath: "/usr/bin/git",
      },
    });
    if (trial.status !== "blocked_fail_closed" || trial.evidence.blockingReasons.length === 0) {
      consumed.add(revalidationResult);
      return { ok: true, revalidationResult, evaluatedAt: fixedNow, approvedExecutablePath: "/usr/bin/git" };
    }
    return { ok: false, evaluatedAt: fixedNow, blockingReasons: trial.evidence.blockingReasons };
  };
  const sourceText = source(adapterPath)
    .replace('import "server-only";', "")
    .replace('import { spawn } from "node:child_process";', "const { spawn } = deps;")
    .replace(/import\s+\{[\s\S]*?\}\s+from "@\/lib\/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core";/u, `const {
      DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY,
      buildFixedReadOnlyDirectSpawnObservation,
      evaluateFixedReadOnlyDirectSpawnCore,
    } = coreDeps;`)
    .replace(/import\s+\{[\s\S]*?\}\s+from "@\/lib\/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter";/u, "const { consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn } = deps;")
    .replace(/import type \{ ImmediatePreSpawnRevalidationResult \} from "@\/lib\/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";\n/u, "")
    .replace(/export \* from "@\/lib\/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core";\n/u, "")
    .replace(/export type DormantServerOnlyFixedReadOnlyDirectSpawnInput = Readonly<\{[\s\S]*?\}>;\n/u, "")
    .replace("export async function spawnDormantServerOnlyFixedReadOnlyGitVersion", "async function spawnDormantServerOnlyFixedReadOnlyGitVersion");
  const js = ts.transpileModule(`${sourceText}\nreturn { spawnDormantServerOnlyFixedReadOnlyGitVersion };`, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const factory = new Function("deps", "coreDeps", "require", js);
  return factory(
    { spawn: spawnImpl, consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn },
    {
      DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY,
      buildFixedReadOnlyDirectSpawnObservation,
      evaluateFixedReadOnlyDirectSpawnCore,
    },
    require,
  ) as { spawnDormantServerOnlyFixedReadOnlyGitVersion(input: unknown): Promise<FixedReadOnlyDirectSpawnResult> };
}

type FakeChunk = Buffer | string | unknown;

type FakeChild = EventEmitter & {
  stdout: EventEmitter;
  stderr: EventEmitter;
  killCalls: string[];
  kill: (signal: string) => boolean;
};

function fakeChildProcess(input: Readonly<{
  stdout?: FakeChunk | readonly FakeChunk[];
  stderr?: FakeChunk | readonly FakeChunk[];
  exitCode?: number | null;
  signal?: string | null;
  errorCode?: string;
  stdoutError?: boolean;
  stderrError?: boolean;
  noClose?: boolean;
  killReturns?: boolean;
  killThrows?: boolean;
  emitLateEventsAfterTerminal?: boolean;
  manual?: boolean;
}>) {
  const child = new EventEmitter() as FakeChild;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.killCalls = [];
  child.kill = (signal: string) => {
    child.killCalls.push(signal);
    if (input.killThrows) throw new Error("synthetic kill throw");
    return input.killReturns ?? true;
  };
  if (input.manual) return child;
  queueMicrotask(() => {
    child.emit("spawn");
    if (input.errorCode) {
      const error = new Error(input.errorCode) as NodeJS.ErrnoException;
      error.code = input.errorCode;
      child.emit("error", error);
      return;
    }
    if (input.stdoutError) {
      child.stdout.emit("error", new Error("synthetic stdout path detail"));
      if (input.emitLateEventsAfterTerminal) emitLateEvents(child);
      return;
    }
    if (input.stderrError) {
      child.stderr.emit("error", new Error("synthetic stderr path detail"));
      if (input.emitLateEventsAfterTerminal) emitLateEvents(child);
      return;
    }
    for (const chunk of chunks(input.stdout)) child.stdout.emit("data", normalizeFakeChunk(chunk));
    for (const chunk of chunks(input.stderr)) child.stderr.emit("data", normalizeFakeChunk(chunk));
    if (input.emitLateEventsAfterTerminal) emitLateEvents(child);
    if (!input.noClose) child.emit("close", input.exitCode ?? 0, input.signal ?? null);
  });
  return child;
}

function chunks(input: FakeChunk | readonly FakeChunk[] | undefined): readonly FakeChunk[] {
  if (input === undefined) return [];
  return Array.isArray(input) ? input : [input];
}

function normalizeFakeChunk(input: FakeChunk): unknown {
  if (Buffer.isBuffer(input)) return input;
  if (typeof input === "string") return Buffer.from(input);
  return input;
}

function emitLateEvents(child: FakeChild) {
  child.stdout.emit("data", Buffer.alloc(4, "x"));
  child.stderr.emit("data", Buffer.alloc(4, "y"));
  child.stdout.emit("error", new Error("late stdout detail"));
  child.stderr.emit("error", new Error("late stderr detail"));
  child.emit("error", new Error("late child detail"));
  child.emit("close", 0, null);
  child.emit("close", 1, "SIGTERM");
}

function fingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(canonicalize(input))}`).digest("hex");
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(canonicalize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, canonicalize(value)]));
  }
  return input;
}

test.describe("dormant server-only fixed read-only direct-spawn adapter Action 550", () => {
  test("identity and policy are frozen dormant server-only fixed git-version only", () => {
    expect(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_ADAPTER_IDENTITY).toMatchObject({
      adapterId: "ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1",
      serverOnly: true,
      dormant: true,
      authoritativeLive: false,
      enablesObserverAuthority: false,
      enablesCredentialAccess: false,
      enablesNetworkAccess: false,
      enablesCliVersionAuthority: false,
      enablesPreflightRunner: false,
    });
    expect(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY).toMatchObject({
      operation: "collect_git_version",
      toolIdentity: "git",
      exactArgv: ["--version"],
      shell: false,
      detached: false,
      envMode: "fixed_source_controlled",
      fixedEnv: { LANG: "C", LC_ALL: "C" },
      retryPolicy: "none",
      fallbackAllowed: false,
      alternateExecutableAllowed: false,
      toctouEliminated: false,
    });
    expect(Object.isFrozen(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY)).toBe(true);
    expect(Object.isFrozen(DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY.fixedEnv)).toBe(true);
  });

  test("server module owns the only process primitive and core remains pure", () => {
    const adapterSource = source(adapterPath);
    const coreSource = source(corePath);
    expect(adapterSource.startsWith('import "server-only";\n\nimport { spawn } from "node:child_process";')).toBe(true);
    expect(coreSource).not.toMatch(/^import "server-only";|node:child_process|from "child_process"|spawn\(|execFile|exec\(|fork\(|process\.env|node:fs|fs\/promises|fetch\(|axios|keychain|keytar|osascript/u);
    expect(adapterSource).not.toMatch(/exec\(|execFile\(|fork\(|shell:\s*true|process\.env|process\.cwd|["']PATH["']|["']HOME["']|USERPROFILE|XDG|HTTPS?_PROXY|SUPABASE|AVANZA|BankID/u);
  });

  test("valid original revalidation object produces exactly one fixed process attempt", async () => {
    const calls: Array<{ path: string; argv: readonly string[]; options: Record<string, unknown> }> = [];
    const harness = wrapperHarness((path, argv, options) => {
      calls.push({ path, argv, options });
      return fakeChildProcess({ stdout: "git version 2.42.0\n" });
    });
    const result = await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      path: "/usr/bin/git",
      argv: ["--version"],
      options: {
        shell: false,
        detached: false,
        env: { LANG: "C", LC_ALL: "C" },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    });
    expect(calls[0].options).not.toHaveProperty("PATH");
    expect(result.status).toBe("process_exited_non_authoritative_evidence");
    expect(result.evidence.processStarted).toBe(true);
    expect(result.evidence.cliVersionCollected).toBe(false);
    expect(result.evidence.cliVersionInterpreted).toBe(false);
    expect(result.evidence.toctouEliminated).toBe(false);
    expect(result.evidence.exactRevalidatedInodeExecuted).toBe(false);
  });

  test("reconstructions clones and copied values do not reach process creation", async () => {
    const original = revalidationFixture();
    const cases: unknown[] = [
      { ...original },
      jsonClone(original),
      { ...original, resultFingerprint: original.resultFingerprint },
      { ...original, revalidationEvidence: original.revalidationEvidence },
    ];
    if (typeof structuredClone === "function") cases.push(structuredClone(original));
    for (const input of cases) {
      let attempts = 0;
      const harness = wrapperHarness(() => {
        attempts += 1;
        return fakeChildProcess({ stdout: "git version 2.42.0\n" });
      });
      const result = await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: input });
      expect(attempts).toBe(0);
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.evidence.blockingReasons).toContain("production_revalidation_provenance_missing");
    }
  });

  test("synthetic pure core missing provenance stale cross-boundary and authority-bearing evidence do not spawn", async () => {
    const valid = revalidationFixture();
    const synthetic = evaluateImmediatePreSpawnRevalidationCore({
      compositionAdapterResult: compositionFixture(),
      currentObservation: matchingObservation(compositionFixture()),
    });
    const cases = [
      synthetic,
      markedInvalid(valid, { adapterId: "other_adapter" }),
      markedInvalidEvidence(valid, { toolIdentity: "supabase_cli" }),
      markedInvalidEvidence(valid, { platform: "linux" }),
      markedInvalidEvidence(valid, { purpose: "other_purpose" }),
      markedInvalidEvidence(valid, { expectedResolvedAbsolutePath: "/tmp/git", observedResolvedAbsolutePath: "/tmp/git" }),
      markedInvalidEvidence(valid, { spawnAuthority: "live_process_start" }),
      markedInvalidEvidence(valid, { toctouEliminated: true }),
    ];
    for (const input of cases) {
      let attempts = 0;
      const harness = wrapperHarness(() => {
        attempts += 1;
        return fakeChildProcess({ stdout: "git version 2.42.0\n" });
      });
      const result = await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: input });
      expect(attempts).toBe(0);
      expect(result.status).toBe("blocked_fail_closed");
    }
  });

  test("one-shot consumption blocks repeated and concurrent duplicate attempts", async () => {
    const original = revalidationFixture();
    let attempts = 0;
    const harness = wrapperHarness(() => {
      attempts += 1;
      return fakeChildProcess({ stdout: "git version 2.42.0\n" });
    });
    const [first, second] = await Promise.all([
      harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: original }),
      harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: original }),
    ]);
    expect(attempts).toBe(1);
    expect([first.status, second.status].sort()).toEqual(["blocked_fail_closed", "process_exited_non_authoritative_evidence"].sort());
    const third = await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: original });
    expect(third.status).toBe("blocked_fail_closed");
    expect(attempts).toBe(1);
  });

  test("independent original receives one separate attempt", async () => {
    let attempts = 0;
    const harness = wrapperHarness(() => {
      attempts += 1;
      return fakeChildProcess({ stdout: "git version 2.42.0\n" });
    });
    await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
    await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
    expect(attempts).toBe(2);
  });

  test("spawn exception and spawn error are terminal and consume the input", async () => {
    const exceptionInput = revalidationFixture();
    let attempts = 0;
    const exceptionHarness = wrapperHarness(() => {
      attempts += 1;
      throw new Error("synthetic spawn throw");
    });
    const exceptionResult = await exceptionHarness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: exceptionInput });
    expect(exceptionResult.status).toBe("spawn_failed_terminal");
    expect(exceptionResult.evidence.blockingReasons).toContain("spawn_error");
    const secondException = await exceptionHarness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: exceptionInput });
    expect(secondException.status).toBe("blocked_fail_closed");
    expect(attempts).toBe(1);

    const errorInput = revalidationFixture();
    const errorHarness = wrapperHarness(() => fakeChildProcess({ errorCode: "ENOENT" }));
    const errorResult = await errorHarness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: errorInput });
    expect(errorResult.status).toBe("spawn_failed_terminal");
    expect(errorResult.evidence.blockingReasons).toContain("child_process_error");
  });

  test("non-zero exit signal termination and output failures are terminal without CLI authority", async () => {
    const cases = [
      () => fakeChildProcess({ exitCode: 2, stdout: "bad\n" }),
      () => fakeChildProcess({ signal: "SIGTERM", stdout: "term\n" }),
      () => fakeChildProcess({ stdout: Buffer.alloc(16385, "a") }),
      () => fakeChildProcess({ stderr: Buffer.alloc(16385, "b") }),
      () => fakeChildProcess({ stdout: Buffer.from([0xff]) }),
      () => fakeChildProcess({ stdout: Buffer.from([0]) }),
    ];
    for (const child of cases) {
      const harness = wrapperHarness(() => child());
      const result = await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
      expect(result.status).toBe("spawn_failed_terminal");
      expect(result.evidence.processAttemptCount).toBe(1);
      expect(result.evidence.retryCount).toBe(0);
      expect(result.evidence.cliVersionCollected).toBe(false);
      expect(result.evidence.observerAuthority).toBe("none");
      expect(result.evidence.credentialAuthority).toBe("none");
    }
  });

  test("overflow terminates exactly once and settles without close", async () => {
    for (const [emitOverflow, expectedReason] of [
      [(child: FakeChild) => child.stdout.emit("data", Buffer.alloc(16385, "a")), "stdout_output_limit_exceeded"],
      [(child: FakeChild) => child.stderr.emit("data", Buffer.alloc(16385, "b")), "stderr_output_limit_exceeded"],
      [(child: FakeChild) => {
        child.stdout.emit("data", Buffer.alloc(16000, "a"));
        child.stderr.emit("data", Buffer.alloc(16000, "b"));
        child.stdout.emit("data", Buffer.alloc(769, "c"));
      }, "combined_output_limit_exceeded"],
    ] as const) {
      const child = fakeChildProcess({ manual: true });
      let attempts = 0;
      const harness = wrapperHarness(() => {
        attempts += 1;
        return child;
      });
      const pending = harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
      await Promise.resolve();
      child.emit("spawn");
      emitOverflow(child);
      emitLateEvents(child);
      const result = await pending;
      expect(attempts).toBe(1);
      expect(child.killCalls).toEqual(["SIGKILL"]);
      expect(result.status).toBe("spawn_failed_terminal");
      expect(result.evidence.blockingReasons).toContain(expectedReason);
      expect(result.evidence.childTerminationRequested).toBe(true);
      expect(result.evidence.childTerminationSignal).toBe("SIGKILL");
      expect(result.evidence.processExited).toBe(false);
      expect(result.evidence.cliVersionCollected).toBe(false);
      expect(result.evidence.observerAuthority).toBe("none");
      expect(result.evidence.blockingReasons).toContain(expectedReason);
      expect(child.stdout.listenerCount("data")).toBe(0);
      expect(child.stderr.listenerCount("data")).toBe(0);
      expect(child.stdout.listenerCount("error")).toBeGreaterThanOrEqual(1);
      child.stdout.emit("error", new Error("late stdout should be sunk"));
      child.stderr.emit("error", new Error("late stderr should be sunk"));
      child.emit("error", new Error("late child should be sunk"));
    }
  });

  test("termination request false or throw is deterministic and does not retry", async () => {
    for (const child of [
      fakeChildProcess({ manual: true, killReturns: false }),
      fakeChildProcess({ manual: true, killThrows: true }),
    ]) {
      let attempts = 0;
      const harness = wrapperHarness(() => {
        attempts += 1;
        return child;
      });
      const original = revalidationFixture();
      const pending = harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: original });
      await Promise.resolve();
      child.emit("spawn");
      child.stdout.emit("data", Buffer.alloc(16385, "a"));
      const result = await pending;
      const second = await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: original });
      expect(attempts).toBe(1);
      expect(child.killCalls).toEqual(["SIGKILL"]);
      expect(result.evidence.childTerminationRequestFailed).toBe(true);
      expect(result.evidence.blockingReasons).toContain("child_termination_request_failed");
      expect(second.status).toBe("blocked_fail_closed");
    }
  });

  test("stdout and stderr stream errors settle once terminate once sanitize details and ignore late events", async () => {
    for (const [emitStreamError, expectedReason] of [
      [(child: FakeChild) => child.stdout.emit("error", new Error("synthetic stdout path detail")), "stdout_stream_error"],
      [(child: FakeChild) => child.stderr.emit("error", new Error("synthetic stderr path detail")), "stderr_stream_error"],
    ] as const) {
      const child = fakeChildProcess({ manual: true });
      let attempts = 0;
      const harness = wrapperHarness(() => {
        attempts += 1;
        return child;
      });
      const original = revalidationFixture();
      const pending = harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: original });
      await Promise.resolve();
      child.emit("spawn");
      emitStreamError(child);
      emitLateEvents(child);
      const result = await pending;
      const second = await harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: original });
      expect(attempts).toBe(1);
      expect(child.killCalls).toEqual(["SIGKILL"]);
      expect(result.status).toBe("spawn_failed_terminal");
      expect(result.evidence.terminalReason).toBe(expectedReason);
      expect(result.evidence.blockingReasons).toContain(expectedReason);
      expect(JSON.stringify(result)).not.toContain("synthetic");
      expect(JSON.stringify(result)).not.toContain("path detail");
      expect(second.status).toBe("blocked_fail_closed");
    }
  });

  test("event ordering handles exit before final output close duplicate close and stream-error races", async () => {
    const exitBeforeClose = new EventEmitter() as FakeChild;
    exitBeforeClose.stdout = new EventEmitter();
    exitBeforeClose.stderr = new EventEmitter();
    exitBeforeClose.killCalls = [];
    exitBeforeClose.kill = (signal: string) => {
      exitBeforeClose.killCalls.push(signal);
      return true;
    };
    queueMicrotask(() => {
      exitBeforeClose.emit("spawn");
      exitBeforeClose.emit("exit", 0, null);
      exitBeforeClose.stdout.emit("data", Buffer.from("git version 2.42.0\n"));
      exitBeforeClose.emit("close", 0, null);
      exitBeforeClose.emit("close", 2, null);
      exitBeforeClose.stdout.emit("data", Buffer.alloc(4, "x"));
    });
    const normalHarness = wrapperHarness(() => exitBeforeClose);
    const normal = await normalHarness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
    expect(normal.status).toBe("process_exited_non_authoritative_evidence");
    expect(normal.evidence.processExited).toBe(true);
    expect(normal.evidence.childTerminationRequested).toBe(false);

    const raceChild = fakeChildProcess({ manual: true });
    const raceHarness = wrapperHarness(() => raceChild);
    const racePending = raceHarness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
    await Promise.resolve();
    raceChild.emit("spawn");
    raceChild.stdout.emit("data", Buffer.alloc(16385, "a"));
    raceChild.emit("error", new Error("late child race detail"));
    const race = await racePending;
    expect(race.evidence.terminalReason).toBe("stdout_output_limit_exceeded");
    expect(raceChild.killCalls).toEqual(["SIGKILL"]);
  });

  test("output success boundaries are byte exact and split utf8 remains evidence only", async () => {
    for (const emitSuccess of [
      (child: FakeChild) => child.stdout.emit("data", Buffer.alloc(16384, "a")),
      (child: FakeChild) => child.stderr.emit("data", Buffer.alloc(16384, "b")),
      (child: FakeChild) => {
        child.stdout.emit("data", Buffer.from([0xc3]));
        child.stdout.emit("data", Buffer.from([0xa5]));
      },
    ]) {
      const child = fakeChildProcess({ manual: true });
      const harness = wrapperHarness(() => child);
      const pending = harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
      await Promise.resolve();
      child.emit("spawn");
      emitSuccess(child);
      child.emit("close", 0, null);
      const result = await pending;
      expect(result.status).toBe("process_exited_non_authoritative_evidence");
      expect(result.evidence.childTerminationRequested).toBe(false);
      expect(result.evidence.cliVersionInterpreted).toBe(false);
    }
  });

  test("output failure boundaries reject one byte above limit invalid encoding and unexpected chunk", async () => {
    for (const emitFailure of [
      (child: FakeChild) => child.stdout.emit("data", Buffer.alloc(16385, "a")),
      (child: FakeChild) => child.stderr.emit("data", Buffer.alloc(16385, "b")),
      (child: FakeChild) => child.stdout.emit("data", {}),
      (child: FakeChild) => {
        child.stdout.emit("data", Buffer.from([0xff]));
        child.emit("close", 0, null);
      },
    ]) {
      const child = fakeChildProcess({ manual: true });
      const harness = wrapperHarness(() => child);
      const pending = harness.spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult: revalidationFixture() });
      await Promise.resolve();
      child.emit("spawn");
      emitFailure(child);
      const result = await pending;
      expect(result.status).toBe("spawn_failed_terminal");
      expect(result.evidence.cliVersionCollected).toBe(false);
    }
  });

  test("core blocked result remains frozen non-authoritative with no process attempt", () => {
    const result = evaluateFixedReadOnlyDirectSpawnCore({
      consumedRevalidation: {
        ok: false,
        evaluatedAt: "2026-07-17T11:10:00.000Z",
        blockingReasons: ["production_revalidation_provenance_missing"],
      },
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.evidence)).toBe(true);
    expect(result.status).toBe("blocked_fail_closed");
    expect(result.evidence.processAttempted).toBe(false);
    expect(result.evidence.processSpawned).toBe(false);
    expect(result.evidence.spawnAuthority).toBe("none");
    expect(result.evidence.blockingReasons).toContain("production_revalidation_provenance_missing");
  });

  test("production revalidation bridge is boundary-specific and exposes no generic trust oracle", () => {
    const bridgeSource = source(revalidationAdapterPath);
    expect(bridgeSource).toContain("consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn");
    expect(bridgeSource).toContain("PRODUCTION_REVALIDATION_RESULTS_CONSUMED_FOR_DORMANT_FIXED_DIRECT_SPAWN");
    expect(bridgeSource).not.toMatch(/export .*WeakSet|reset.*CONSUMED|delete\(.*CONSUMED|isTrusted|generic.*verifier|brand|Symbol\(/u);
    expect(bridgeSource.indexOf("PRODUCTION_REVALIDATION_RESULTS_CONSUMED_FOR_DORMANT_FIXED_DIRECT_SPAWN.add")).toBeLessThan(bridgeSource.indexOf("return {\n    ok: true"));
  });

  test("no API UI runner observer credential or collector imports the dormant direct-spawn adapter", () => {
    const adapterImport = /post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter/u;
    expect(source(apiValidationRoutePath)).not.toMatch(adapterImport);
    expect(source(tradeUiPath)).not.toMatch(adapterImport);
    for (const path of [
      "lib/post-trade-scoped-macos-process-observer.ts",
      "lib/post-trade-scoped-macos-process-observer-core.ts",
      "lib/post-trade-credential-source-adapter-boundary.ts",
      "lib/post-trade-credential-source-adapter-boundary-core.ts",
      "lib/post-trade-first-live-read-only-preflight-cli-version-collector.ts",
      "lib/post-trade-first-live-read-only-preflight-process-executor.ts",
      "lib/post-trade-first-live-read-only-preflight-execution-boundary-contract.ts",
    ]) {
      expect(source(path), path).not.toMatch(adapterImport);
    }
  });

  test("static security review finds no broad process runner env network credential persistence or trading behavior", () => {
    const combined = `${source(adapterPath)}\n${source(corePath)}`;
    expect(combined).not.toMatch(/exec\(|execFile\(|fork\(|shell:\s*true|sh -c|bash -c|zsh -c|cmd\.exe|powershell/u);
    expect(combined).not.toMatch(/process\.env|process\.cwd|["']PATH["']|["']HOME["']|USERPROFILE|XDG|HTTPS?_PROXY|NO_PROXY|GIT_ASKPASS|SSH_AUTH_SOCK/u);
    expect(combined).not.toMatch(/fetch\(|axios|createClient\(|from\(["'][^"']+["']\)\.(insert|update|upsert|delete|select|rpc)\(|\.storage|keychain|keytar|osascript|Avanza|BankID|orderAction|positionMutation|settlementRetrieval/u);
    expect(combined.match(/spawn\(/gu)?.length ?? 0).toBe(1);
  });
});
