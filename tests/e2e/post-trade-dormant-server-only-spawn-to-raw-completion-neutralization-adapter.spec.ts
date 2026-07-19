import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

import {
  DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS,
  buildFixedReadOnlyDirectSpawnObservation,
  evaluateFixedReadOnlyDirectSpawnCore,
  type FixedReadOnlyDirectSpawnObservation,
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
  neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion,
} from "../../lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core";
import {
  buildFirstLiveTrustedResolverCandidateObservation,
  evaluateFirstLiveTrustedExecutableResolution,
  getFirstLiveTrustedResolverPolicy,
} from "../../lib/post-trade-first-live-trusted-resolver-adapter-core";
import {
  buildFixtureExecutableIdentity,
  buildResolverSessionCapability,
  buildTrustedExecutableResolutionRequest,
} from "../../lib/post-trade-trusted-live-resolver-adapter-core";

const repoRoot = process.cwd();
const adapterPath = "lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.ts";
const corePath = "lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core.ts";
const directSpawnAdapterPath = "lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts";
const rawCorePath = "lib/post-trade-pure-raw-process-completion-evidence-contract-core.ts";
const gitParserPath = "lib/post-trade-pure-git-version-interpretation-contract-core.ts";
const apiValidationRoutePath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

const TEST_LIVE_RESOLVER_PROVENANCE = new WeakSet<object>();

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function markTestLiveResolverProvenance<T extends object>(input: T): T {
  TEST_LIVE_RESOLVER_PROVENANCE.add(input);
  return input;
}

function hasTestLiveResolverProvenance(input: unknown): boolean {
  return typeof input === "object" && input !== null && TEST_LIVE_RESOLVER_PROVENANCE.has(input);
}

function compositionFixture() {
  const session = buildResolverSessionCapability();
  const identity = buildFixtureExecutableIdentity({
    boundarySessionId: session.boundarySessionId,
    expectedToolIdentity: "git",
    approvedRootClass: "system_usr_bin",
  });
  const request = buildTrustedExecutableResolutionRequest(session, identity);
  const candidate = getFirstLiveTrustedResolverPolicy().candidatePolicies.find((item) => item.toolIdentity === "git");
  if (!candidate) throw new Error("missing git candidate");
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
          inode: "9007199254740995",
          sizeBytes: 54321,
          mode: 0o100755,
          modifiedTimeMs: 3000,
          changedTimeMs: 3001,
        },
      }),
      ...getFirstLiveTrustedResolverPolicy().candidatePolicies
        .filter((item) => item.toolIdentity === "git" && item.candidateId !== candidate.candidateId)
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

function revalidationFixture() {
  const composition = compositionFixture();
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
  return deepFreezeForTest({
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.result, resultCore),
  } as ImmediatePreSpawnRevalidationResult);
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

function directSpawnFixture(observation: FixedReadOnlyDirectSpawnObservation) {
  const result = evaluateFixedReadOnlyDirectSpawnCore({
    consumedRevalidation: {
      ok: true,
      revalidationResult: revalidationFixture(),
      evaluatedAt: "2026-07-17T11:10:00.000Z",
      approvedExecutablePath: "/usr/bin/git",
    },
    spawnObservation: observation,
  });
  expect(result.status).not.toBe("blocked_fail_closed");
  return result;
}

function sourceRecord(result: FixedReadOnlyDirectSpawnResult, observation: FixedReadOnlyDirectSpawnObservation, consumedAt = "2026-07-17T11:20:00.000Z") {
  return deepFreezeForTest({
    ok: true,
    sourceKind: "fixed_read_only_direct_spawn_raw_completion_neutralization_source",
    sourceVersion: 1,
    directSpawnResult: result,
    spawnObservation: observation,
    consumedAt,
  });
}

function productionSourceRecord(harness: ReturnType<typeof bridgeHarness>, result: FixedReadOnlyDirectSpawnResult, observation: FixedReadOnlyDirectSpawnObservation) {
  harness.markProductionDirectSpawnProvenance(result, observation);
  const consumed = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result });
  expect(consumed).toMatchObject({ ok: true });
  return consumed;
}

function expectBridgeRejected(input: unknown, reason: string) {
  const rejected = input as { ok?: boolean; blockingReasons?: readonly string[] };
  expect(rejected.ok).toBe(false);
  expect(rejected.blockingReasons).toContain(reason);
}

function zeroExitObservation(stdout = "git version 2.42.0\n", stderr = "") {
  return buildFixedReadOnlyDirectSpawnObservation({
    processAttempted: true,
    processStarted: true,
    processExited: true,
    terminalReason: "process_closed",
    exitCode: 0,
    signal: null,
    stdoutBytes: Buffer.byteLength(stdout, "utf8"),
    stderrBytes: Buffer.byteLength(stderr, "utf8"),
    stdoutText: stdout,
    stderrText: stderr,
    observedAt: "2026-07-17T11:10:00.000Z",
  });
}

function nonZeroExitObservation(stdout = "bad\n", stderr = "") {
  return buildFixedReadOnlyDirectSpawnObservation({
    processAttempted: true,
    processStarted: true,
    processExited: true,
    terminalReason: "process_closed",
    exitCode: 2,
    signal: null,
    stdoutBytes: Buffer.byteLength(stdout, "utf8"),
    stderrBytes: Buffer.byteLength(stderr, "utf8"),
    stdoutText: stdout,
    stderrText: stderr,
    observedAt: "2026-07-17T11:10:00.000Z",
  });
}

function signalExitObservation(stdout = "term\n", stderr = "") {
  return buildFixedReadOnlyDirectSpawnObservation({
    processAttempted: true,
    processStarted: true,
    processExited: true,
    terminalReason: "process_closed",
    exitCode: null,
    signal: "SIGTERM",
    stdoutBytes: Buffer.byteLength(stdout, "utf8"),
    stderrBytes: Buffer.byteLength(stderr, "utf8"),
    stdoutText: stdout,
    stderrText: stderr,
    observedAt: "2026-07-17T11:10:00.000Z",
  });
}

function spawnFailureObservation() {
  return buildFixedReadOnlyDirectSpawnObservation({
    processAttempted: true,
    processStarted: false,
    processExited: false,
    spawnError: true,
    spawnErrorCode: "spawn_exception",
    observedAt: "2026-07-17T11:10:00.000Z",
  });
}

function childProcessErrorObservation() {
  return buildFixedReadOnlyDirectSpawnObservation({
    processAttempted: true,
    processStarted: true,
    processExited: false,
    spawnError: true,
    spawnErrorCode: "child_process_error",
    terminalReason: "child_process_error",
    observedAt: "2026-07-17T11:10:00.000Z",
  });
}

function overflowObservation(kind: "stdout" | "stderr" | "combined") {
  return buildFixedReadOnlyDirectSpawnObservation({
    processAttempted: true,
    processStarted: true,
    processExited: false,
    stdoutBytes: kind === "stderr" ? 0 : kind === "combined" ? 16000 : 16385,
    stderrBytes: kind === "stdout" ? 0 : kind === "combined" ? 16769 : 16385,
    stdoutOverflow: kind === "stdout",
    stderrOverflow: kind === "stderr",
    combinedOutputOverflow: kind === "combined",
    terminalReason: kind === "stdout" ? "stdout_output_limit_exceeded" : kind === "stderr" ? "stderr_output_limit_exceeded" : "combined_output_limit_exceeded",
    internalTerminalCondition: true,
    childTerminationRequested: true,
    childTerminationSignal: "SIGKILL",
    observedAt: "2026-07-17T11:10:00.000Z",
  });
}

function expectAcceptedNeutralization(input: ReturnType<typeof neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion>, category: RawCategory) {
  expect(input.status).toBe("neutralized_raw_completion_ready");
  expect(input.rawCompletionAccepted).toBe(true);
  expect(input.gitParserInvoked).toBe(false);
  expect(input.observedLiveProcess).toBe(false);
  expect(input.authoritativeLive).toBe(false);
  expect(input.authority).toBe("none");
  expect(input.rawCompletionResult?.status).toBe("accepted_fixture_raw_completion_evidence");
  const evidence = input.rawCompletionResult?.evidence;
  expect(evidence).toBeTruthy();
  expect(evidence?.completionCategory).toBe(category);
  expect(evidence?.completionReason).toBe(category);
  expect(evidence?.observedLiveProcess).toBe(false);
  expect(evidence?.authority).toBe("none");
  expect(evidence?.toctouEliminated).toBe(false);
  expect(evidence?.retryCount).toBe(0);
  expect(evidence?.fallbackAttempted).toBe(false);
  expect(evidence?.settledExactlyOnce).toBe(true);
  expect(evidence?.sourceSpawnFingerprint).toBe(input.sourceSpawnResultFingerprint);
  expect(Object.isFrozen(input)).toBe(true);
  expect(Object.isFrozen(input.rawCompletionResult)).toBe(true);
  expect(Object.isFrozen(evidence)).toBe(true);
}

function cloneWith<T>(input: T, patch: Record<string, unknown>): T {
  return deepFreezeForTest({
    ...(input as Record<string, unknown>),
    ...patch,
  } as T);
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

function bridgeHarness() {
  const directSource = source(directSpawnAdapterPath)
    .replace('import "server-only";', "")
    .replace('import { spawn } from "node:child_process";', "const spawn = () => { throw new Error('spawn unavailable in bridge harness'); };")
    .replace('import { createHash } from "node:crypto";', "const { createHash } = require('node:crypto');")
    .replace(/import\s+\{[\s\S]*?\}\s+from "@\/lib\/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core";/u, `const {
      DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY,
      DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS,
      buildFixedReadOnlyDirectSpawnObservation,
      evaluateFixedReadOnlyDirectSpawnCore,
    } = coreDeps;`)
    .replace(/import\s+\{[\s\S]*?\}\s+from "@\/lib\/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter";/u, "const { consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn } = deps;")
    .replace(/import type \{ ImmediatePreSpawnRevalidationResult \} from "@\/lib\/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";\n/u, "")
    .replace(/export \* from "@\/lib\/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core";\n/u, "")
    .replace(/^export /gmu, "")
    .replace("export async function spawnDormantServerOnlyFixedReadOnlyGitVersion", "async function spawnDormantServerOnlyFixedReadOnlyGitVersion")
    .replace("export function consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization", "function consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization")
    .replace("function markProductionDirectSpawnProvenance", "function markProductionDirectSpawnProvenance");
  const js = ts.transpileModule(`${directSource}\nreturn { markProductionDirectSpawnProvenance, consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization };`, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const factory = new Function("deps", "coreDeps", "require", js);
  return factory(
    { consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn: () => ({ ok: false, evaluatedAt: "2026-07-17T11:20:00.000Z", blockingReasons: ["not_used"] }) },
    {
      DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_POLICY: { policyId: "dormant_server_only_fixed_read_only_direct_spawn_git_version_policy_v1", policyVersion: 1 },
      DORMANT_SERVER_ONLY_FIXED_READ_ONLY_DIRECT_SPAWN_FINGERPRINT_DOMAINS,
      buildFixedReadOnlyDirectSpawnObservation,
      evaluateFixedReadOnlyDirectSpawnCore,
    },
    require,
  ) as {
    markProductionDirectSpawnProvenance(result: FixedReadOnlyDirectSpawnResult, observation: FixedReadOnlyDirectSpawnObservation): FixedReadOnlyDirectSpawnResult;
    consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization(input: unknown): unknown;
  };
}

function deepFreezeForTest<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreezeForTest(value);
  }
  return input;
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

test.describe("dormant server-only spawn-to-raw-completion neutralization adapter Action 564", () => {
  test("server-only wrapper and pure core keep the production API closed", () => {
    const adapterSource = source(adapterPath);
    const coreSource = source(corePath);
    const directSource = source(directSpawnAdapterPath);
    expect(adapterSource.startsWith('import "server-only";\n\n')).toBe(true);
    expect(adapterSource).not.toMatch(/node:child_process|from "child_process"|spawn\(|execFile|exec\(|fork\(|node:fs|fs\/promises|process\.env|fetch\(|axios|keychain|keytar|osascript|kill\(|setTimeout|setInterval/u);
    expect(coreSource).not.toMatch(/^import "server-only";|node:child_process|from "child_process"|spawn\(|execFile|exec\(|fork\(|node:fs|fs\/promises|process\.env|fetch\(|axios|keychain|keytar|osascript|kill\(|setTimeout|setInterval/u);
    expect(adapterSource).toContain("neutralizeOriginalFixedReadOnlyDirectSpawnToRawCompletion");
    expect(adapterSource).not.toContain("post-trade-pure-git-version-interpretation-contract-core");
    expect(directSource).toContain("consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization");
    expect(directSource).not.toMatch(/isTrustedSpawnResult|export const .*WeakSet|export const .*WeakMap|reset|mint|token|Symbol\(/u);
  });

  test("original marked production-valid direct-spawn result is consumed once and clones are rejected", () => {
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    const harness = bridgeHarness();
    harness.markProductionDirectSpawnProvenance(result, observation);
    const consumed = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result }) as { ok: boolean; blockingReasons?: readonly string[] };
    expect(consumed.ok).toBe(true);
    const second = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result }) as { ok: boolean; blockingReasons?: readonly string[] };
    expect(second).toMatchObject({ ok: false, blockingReasons: ["already_consumed"] });
    for (const clone of [{ ...result }, jsonClone(result), structuredClone(result)]) {
      const cloned = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: clone }) as { ok: boolean; blockingReasons?: readonly string[] };
      expect(cloned.ok).toBe(false);
      expect(cloned.blockingReasons).toContain("production_provenance_rejected");
    }
  });

  test("Action 566 original-object provenance rejects reconstructed exotic and accessor forgeries before mapping", () => {
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    const harness = bridgeHarness();
    harness.markProductionDirectSpawnProvenance(result, observation);
    const assignClone = Object.assign({}, result);
    const descriptorClone = Object.create(Object.getPrototypeOf(result), Object.getOwnPropertyDescriptors(result)) as FixedReadOnlyDirectSpawnResult;
    const objectCreateClone = Object.assign(Object.create(null), result) as FixedReadOnlyDirectSpawnResult;
    const nestedReferenceClone = { ...result, evidence: result.evidence };
    const proxyResult = new Proxy(result, {});
    class ForgedResult {
      resultKind = result.resultKind;
      evidence = result.evidence;
    }
    const classInstance = new ForgedResult();
    const exoticPrototype = Object.assign(Object.create({ inherited: true }), result);
    const accessorWrapper = Object.defineProperty({}, "directSpawnResult", {
      enumerable: true,
      get: () => result,
    });
    const symbolWrapper = {
      directSpawnResult: result,
      [Symbol("forged")]: true,
    };
    const inheritedWrapper = Object.create({ directSpawnResult: result });
    const copiedFingerprintClone = {
      ...result,
      resultFingerprint: result.resultFingerprint,
      processAttempted: result.processAttempted,
      processStarted: result.processStarted,
      evidence: result.evidence,
    };
    const copiedLifecycleOutputClone = {
      ...result,
      processAttempted: true,
      processStarted: true,
      processSpawned: true,
      evidence: {
        ...result.evidence,
        processAttempted: true,
        processStarted: true,
      },
    };
    const cases: Array<readonly [string, unknown, string]> = [
      ["plain reconstruction", { directSpawnResult: { ...result } }, "production_provenance_rejected"],
      ["Object.assign clone", { directSpawnResult: assignClone }, "production_provenance_rejected"],
      ["prototype-preserving clone", { directSpawnResult: descriptorClone }, "production_provenance_rejected"],
      ["Object.create clone", { directSpawnResult: objectCreateClone }, "production_provenance_rejected"],
      ["copied fingerprint", { directSpawnResult: copiedFingerprintClone }, "production_provenance_rejected"],
      ["copied lifecycle/output", { directSpawnResult: copiedLifecycleOutputClone }, "production_provenance_rejected"],
      ["copied nested references", { directSpawnResult: nestedReferenceClone }, "production_provenance_rejected"],
      ["proxied result", { directSpawnResult: proxyResult }, "production_provenance_rejected"],
      ["class instance result", { directSpawnResult: classInstance }, "production_provenance_rejected"],
      ["exotic prototype result", { directSpawnResult: exoticPrototype }, "production_provenance_rejected"],
      ["accessor wrapper", accessorWrapper, "input_rejected"],
      ["symbol-bearing wrapper", symbolWrapper, "input_rejected"],
      ["inherited-property wrapper", inheritedWrapper, "input_rejected"],
    ];
    for (const [, input, reason] of cases) {
      expectBridgeRejected(harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization(input), reason);
    }
    const original = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result });
    expect(original).toMatchObject({ ok: true });
  });

  test("Action 566 trusted result and nested aliases are deeply frozen against post-registration mutation", () => {
    const observation = zeroExitObservation("git version 2.42.0\n", "");
    const result = directSpawnFixture(observation);
    const harness = bridgeHarness();
    harness.markProductionDirectSpawnProvenance(result, observation);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.evidence)).toBe(true);
    expect(Object.isFrozen(result.evidence.argv)).toBe(true);
    expect(Object.isFrozen(result.evidence.fixedEnvironment)).toBe(true);
    expect(Object.isFrozen(observation)).toBe(true);
    expect(Reflect.set(result as Record<string, unknown>, "processStarted", false)).toBe(false);
    expect(Reflect.set(result.evidence as Record<string, unknown>, "toolIdentity", "supabase")).toBe(false);
    expect(Reflect.set(result.evidence.argv as unknown as Record<string, unknown>, "0", "status")).toBe(false);
    expect(Reflect.set(observation as Record<string, unknown>, "stdoutText", "changed")).toBe(false);
    const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(productionSourceRecord(harness, result, observation));
    expectAcceptedNeutralization(neutralized, "process_created_normal_zero_exit");
    expect(neutralized.rawCompletionResult?.evidence?.stdoutText).toBe("git version 2.42.0\n");
    expect(neutralized.rawCompletionResult?.evidence?.argv).toEqual(["--version"]);
    expect(neutralized.rawCompletionResult?.evidence?.toolIdentity).toBe("git");
  });

  test("Action 566 one-shot consumption survives mapping failure and independent originals remain isolated", () => {
    const harness = bridgeHarness();
    const unsupported = buildFixedReadOnlyDirectSpawnObservation({
      processAttempted: true,
      processStarted: true,
      processExited: false,
      terminalReason: "stdout_stream_error",
      internalTerminalCondition: true,
      childTerminationRequested: true,
      childTerminationSignal: "SIGKILL",
      observedAt: "2026-07-17T11:10:00.000Z",
    });
    const failedSource = productionSourceRecord(harness, directSpawnFixture(unsupported), unsupported);
    const failed = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(failedSource);
    expect(failed.status).toBe("blocked_fail_closed");
    expect(failed.rawCompletionInvoked).toBe(false);
    expectBridgeRejected(harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: (failedSource as { directSpawnResult: FixedReadOnlyDirectSpawnResult }).directSpawnResult }), "already_consumed");

    const firstObservation = zeroExitObservation("git version 2.42.0\n");
    const secondObservation = zeroExitObservation("git version 2.43.0\n");
    const first = directSpawnFixture(firstObservation);
    const second = directSpawnFixture(secondObservation);
    const firstNeutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(productionSourceRecord(harness, first, firstObservation));
    const secondNeutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(productionSourceRecord(harness, second, secondObservation));
    expectAcceptedNeutralization(firstNeutralized, "process_created_normal_zero_exit");
    expectAcceptedNeutralization(secondNeutralized, "process_created_normal_zero_exit");
    expect(firstNeutralized.rawCompletionResult?.evidence?.stdoutText).toBe("git version 2.42.0\n");
    expect(secondNeutralized.rawCompletionResult?.evidence?.stdoutText).toBe("git version 2.43.0\n");
  });

  test("Action 566 duplicate and Promise-all consumption yield at most one source record", async () => {
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    const harness = bridgeHarness();
    harness.markProductionDirectSpawnProvenance(result, observation);
    const first = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result }) as { ok: boolean; blockingReasons?: readonly string[] };
    const second = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result }) as { ok: boolean; blockingReasons?: readonly string[] };
    expect([first, second].filter((item) => item.ok).length).toBe(1);
    expect([first, second].filter((item) => !item.ok && item.blockingReasons?.includes("already_consumed")).length).toBe(1);

    const concurrentObservation = zeroExitObservation("git version 2.44.0\n");
    const concurrentResult = directSpawnFixture(concurrentObservation);
    harness.markProductionDirectSpawnProvenance(concurrentResult, concurrentObservation);
    const results = await Promise.all([
      Promise.resolve().then(() => harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: concurrentResult }) as { ok: boolean; blockingReasons?: readonly string[] }),
      Promise.resolve().then(() => harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: concurrentResult }) as { ok: boolean; blockingReasons?: readonly string[] }),
    ]);
    expect(results.filter((item) => item.ok).length).toBe(1);
    expect(results.filter((item) => !item.ok && item.blockingReasons?.includes("already_consumed")).length).toBe(1);
  });

  test("normal zero-exit output maps to accepted neutral raw-completion evidence without parser authority", () => {
    const observation = zeroExitObservation("git version 2.42.0\n", "");
    const result = directSpawnFixture(observation);
    const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(result, observation));
    expect(neutralized.status).toBe("neutralized_raw_completion_ready");
    expect(neutralized.rawCompletionAccepted).toBe(true);
    expect(neutralized.gitParserInvoked).toBe(false);
    expect(neutralized.observedLiveProcess).toBe(false);
    expect(neutralized.authority).toBe("none");
    expect(Object.isFrozen(neutralized)).toBe(true);
    const raw = neutralized.rawCompletionResult?.evidence;
    expect(raw).toMatchObject({
      completionCategory: "process_created_normal_zero_exit",
      stdoutText: "git version 2.42.0\n",
      stderrText: "",
      stdoutByteCount: Buffer.byteLength("git version 2.42.0\n", "utf8"),
      stderrByteCount: 0,
      observedLiveProcess: false,
      authority: "none",
      toctouEliminated: false,
      cliVersionInterpreted: false,
    });
  });

  test("supported terminal source states map to exact raw completion categories", () => {
    const cases: Array<readonly [RawCategory, FixedReadOnlyDirectSpawnObservation]> = [
      ["spawn_failed_before_process_creation", spawnFailureObservation()],
      ["process_created_normal_zero_exit", zeroExitObservation()],
      ["process_created_non_zero_exit", nonZeroExitObservation()],
      ["process_created_signal_termination", signalExitObservation()],
      ["child_process_error", childProcessErrorObservation()],
      ["stdout_output_limit_exceeded", overflowObservation("stdout")],
      ["stderr_output_limit_exceeded", overflowObservation("stderr")],
      ["combined_output_limit_exceeded", overflowObservation("combined")],
    ];
    for (const [expected, observation] of cases) {
      const result = directSpawnFixture(observation);
      const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(result, observation));
      expectAcceptedNeutralization(neutralized, expected);
      expect(neutralized.rawCompletionResult?.evidence?.spawnAttempted).toBe(true);
      expect(neutralized.rawCompletionResult?.evidence?.processDeathConfirmed).toBe(false);
      expect(neutralized.rawCompletionResult?.evidence?.terminationRequested).toBe(expected.endsWith("_output_limit_exceeded"));
      expect(neutralized.rawCompletionResult?.evidence?.terminationSignal).toBe(expected.endsWith("_output_limit_exceeded") ? "SIGKILL" : null);
    }
  });

  test("unsupported source states fail closed and do not become malformed success", () => {
    const cases = [
      buildFixedReadOnlyDirectSpawnObservation({
        processAttempted: true,
        processStarted: true,
        processExited: false,
        terminalReason: "stdout_stream_error",
        internalTerminalCondition: true,
        childTerminationRequested: true,
        childTerminationSignal: "SIGKILL",
        observedAt: "2026-07-17T11:10:00.000Z",
      }),
      buildFixedReadOnlyDirectSpawnObservation({
        processAttempted: true,
        processStarted: true,
        processExited: true,
        terminalReason: "process_closed",
        invalidStdoutEncoding: true,
        stdoutBytes: 1,
        stdoutText: null,
        observedAt: "2026-07-17T11:10:00.000Z",
      }),
      buildFixedReadOnlyDirectSpawnObservation({
        processAttempted: true,
        processStarted: true,
        processExited: false,
        terminalReason: "stderr_stream_error",
        internalTerminalCondition: true,
        childTerminationRequested: true,
        childTerminationSignal: "SIGKILL",
        observedAt: "2026-07-17T11:10:00.000Z",
      }),
      buildFixedReadOnlyDirectSpawnObservation({
        processAttempted: true,
        processStarted: true,
        processExited: true,
        terminalReason: "process_closed",
        invalidStderrEncoding: true,
        stderrBytes: 1,
        stderrText: null,
        observedAt: "2026-07-17T11:10:00.000Z",
      }),
      buildFixedReadOnlyDirectSpawnObservation({
        processAttempted: true,
        processStarted: true,
        processExited: false,
        terminalReason: "unexpected_stream_chunk",
        unexpectedStreamChunk: true,
        internalTerminalCondition: true,
        childTerminationRequested: true,
        childTerminationSignal: "SIGKILL",
        observedAt: "2026-07-17T11:10:00.000Z",
      }),
      buildFixedReadOnlyDirectSpawnObservation({
        processAttempted: true,
        processStarted: true,
        processExited: false,
        terminalReason: "none",
        observedAt: "2026-07-17T11:10:00.000Z",
      }),
      buildFixedReadOnlyDirectSpawnObservation({
        processAttempted: true,
        processStarted: false,
        processExited: false,
        terminalReason: "process_closed",
        observedAt: "2026-07-17T11:10:00.000Z",
      }),
    ];
    for (const observation of cases) {
      const result = directSpawnFixture(observation);
      const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(result, observation));
      expect(neutralized.status).toBe("blocked_fail_closed");
      expect(neutralized.rawCompletionResult?.evidence?.completionCategory).not.toBe("malformed_completion_evidence");
      expect(neutralized.rawCompletionAccepted).toBe(false);
    }
  });

  test("Action 566 output boundaries preserve exact UTF-8 text and reject mismatches", () => {
    const exactStdout = "a".repeat(16384);
    const exactStderr = "b".repeat(16384);
    const exactCombinedStdout = "c".repeat(16384);
    const exactCombinedStderr = "d".repeat(16384);
    const multibyte = "å".repeat(8192);
    const acceptedCases = [
      zeroExitObservation("", ""),
      zeroExitObservation(exactStdout, ""),
      zeroExitObservation("", exactStderr),
      zeroExitObservation(exactCombinedStdout, exactCombinedStderr),
      zeroExitObservation(multibyte, ""),
      zeroExitObservation(" git version 2.42.0 \n\n", "\nwarning\n"),
    ];
    for (const observation of acceptedCases) {
      const result = directSpawnFixture(observation);
      const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(result, observation));
      expectAcceptedNeutralization(neutralized, "process_created_normal_zero_exit");
      expect(neutralized.rawCompletionResult?.evidence?.stdoutText).toBe(observation.stdoutText);
      expect(neutralized.rawCompletionResult?.evidence?.stderrText).toBe(observation.stderrText);
      expect(neutralized.rawCompletionResult?.evidence?.stdoutByteCount).toBe(observation.stdoutBytes);
      expect(neutralized.rawCompletionResult?.evidence?.stderrByteCount).toBe(observation.stderrBytes);
    }

    const rejectedCases = [
      buildFixedReadOnlyDirectSpawnObservation({ ...zeroExitObservation("abc"), stdoutBytes: 2, observedAt: "2026-07-17T11:10:00.000Z" }),
      buildFixedReadOnlyDirectSpawnObservation({ ...zeroExitObservation("abc"), stdoutBytes: -1, observedAt: "2026-07-17T11:10:00.000Z" }),
      buildFixedReadOnlyDirectSpawnObservation({ ...zeroExitObservation("abc"), stdoutBytes: 1.5, observedAt: "2026-07-17T11:10:00.000Z" }),
      buildFixedReadOnlyDirectSpawnObservation({ ...zeroExitObservation("abc"), stdoutBytes: Number.POSITIVE_INFINITY, observedAt: "2026-07-17T11:10:00.000Z" }),
      buildFixedReadOnlyDirectSpawnObservation({ ...zeroExitObservation("abc"), stderrBytes: 32769, stderrText: "x".repeat(32769), observedAt: "2026-07-17T11:10:00.000Z" }),
    ];
    for (const observation of rejectedCases) {
      const result = directSpawnFixture(observation);
      const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(result, observation));
      expect(neutralized.status).toBe("blocked_fail_closed");
      expect(neutralized.rawCompletionAccepted).toBe(false);
    }

    for (const observation of [overflowObservation("stdout"), overflowObservation("stderr"), overflowObservation("combined")]) {
      const result = directSpawnFixture(observation);
      const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(result, observation));
      expect(neutralized.status).toBe("neutralized_raw_completion_ready");
      expect(neutralized.rawCompletionResult?.evidence?.stdoutText).toBeNull();
      expect(neutralized.rawCompletionResult?.evidence?.stderrText).toBeNull();
    }
  });

  test("raw builder rejection is terminal after mapping and does not retry", () => {
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    const corrupted = deepFreezeForTest({
      ...result,
      resultFingerprint: "not-a-sha256",
    } as FixedReadOnlyDirectSpawnResult);
    const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(corrupted, observation));
    expect(neutralized.status).toBe("blocked_fail_closed");
    expect(neutralized.rawCompletionInvoked).toBe(true);
    expect(neutralized.blockingReasons).toContain("raw_completion_builder_rejected");
  });

  test("Action 566 builder rejection after source consumption remains permanently consumed", () => {
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    const harness = bridgeHarness();
    const consumed = productionSourceRecord(harness, result, observation) as { directSpawnResult: FixedReadOnlyDirectSpawnResult; spawnObservation: FixedReadOnlyDirectSpawnObservation };
    const corruptedSource = sourceRecord(cloneWith(consumed.directSpawnResult, { resultFingerprint: "not-a-sha256" }), consumed.spawnObservation);
    const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(corruptedSource);
    expect(neutralized.status).toBe("blocked_fail_closed");
    expect(neutralized.rawCompletionInvoked).toBe(true);
    expect(neutralized.blockingReasons).toContain("raw_completion_builder_rejected");
    expectBridgeRejected(harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: consumed.directSpawnResult }), "already_consumed");
  });

  test("Action 566 identity fingerprint linkage and authority mismatches fail closed", () => {
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    const mismatchCases: Array<readonly [string, FixedReadOnlyDirectSpawnResult, FixedReadOnlyDirectSpawnObservation, string]> = [
      ["wrong result kind", cloneWith(result, { resultKind: "wrong_kind" }), observation, "source_contract_identity_rejected"],
      ["wrong result version", cloneWith(result, { resultVersion: 2 }), observation, "source_contract_identity_rejected"],
      ["wrong adapter id", cloneWith(result, { adapterId: "wrong.boundary" }), observation, "source_contract_identity_rejected"],
      ["wrong evidence policy", cloneWith(result, { evidence: cloneWith(result.evidence, { policyId: "wrong_policy" }) }), observation, "policy_rejected"],
      ["wrong policy version", cloneWith(result, { evidence: cloneWith(result.evidence, { policyVersion: 2 }) }), observation, "policy_rejected"],
      ["wrong session", cloneWith(result, { evidence: cloneWith(result.evidence, { boundarySessionId: "" }) }), observation, "session_rejected"],
      ["wrong purpose", cloneWith(result, { evidence: cloneWith(result.evidence, { purpose: "wrong_purpose" }) }), observation, "purpose_rejected"],
      ["wrong tool", cloneWith(result, { evidence: cloneWith(result.evidence, { toolIdentity: "supabase" }) }), observation, "tool_rejected"],
      ["wrong platform", cloneWith(result, { evidence: cloneWith(result.evidence, { platform: "linux" }) }), observation, "platform_rejected"],
      ["wrong executable", cloneWith(result, { evidence: cloneWith(result.evidence, { executablePath: "/usr/local/bin/git" }) }), observation, "executable_rejected"],
      ["wrong argv", cloneWith(result, { evidence: cloneWith(result.evidence, { argv: ["status"] }) }), observation, "argv_rejected"],
      ["wrong revalidation result link", cloneWith(result, { evidence: cloneWith(result.evidence, { acceptedRevalidationResultFingerprint: null }) }), observation, "source_revalidation_linkage_rejected"],
      ["runtime activated claim", cloneWith(result, { evidence: cloneWith(result.evidence, { runnerAuthority: "future_live_runner_authority" }) }), observation, "source_authority_rejected"],
      ["credential claim", cloneWith(result, { credentialAccessed: true, evidence: cloneWith(result.evidence, { credentialAccessed: true }) }), observation, "source_authority_rejected"],
      ["network claim", cloneWith(result, { networkAccessed: true, evidence: cloneWith(result.evidence, { networkAccessed: true }) }), observation, "source_authority_rejected"],
      ["observed-live claim", cloneWith(result, { evidence: cloneWith(result.evidence, { toctouEliminated: true }) }), observation, "source_live_claim_rejected"],
    ];
    for (const [, forgedResult, forgedObservation, reason] of mismatchCases) {
      const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(forgedResult, forgedObservation));
      expect(neutralized.status).toBe("blocked_fail_closed");
      expect(neutralized.rawCompletionAccepted).toBe(false);
      expect(neutralized.blockingReasons).toContain(reason);
    }

    const harness = bridgeHarness();
    const fingerprintCases: Array<readonly [FixedReadOnlyDirectSpawnResult, FixedReadOnlyDirectSpawnObservation]> = [
      [cloneWith(result, { resultFingerprint: "bad" }), observation],
      [cloneWith(result, { evidence: cloneWith(result.evidence, { evidenceFingerprint: "bad" }) }), observation],
      [result, cloneWith(observation, { observationFingerprint: "bad" })],
    ];
    for (const [forgedResult, forgedObservation] of fingerprintCases) {
      harness.markProductionDirectSpawnProvenance(forgedResult, forgedObservation);
      expectBridgeRejected(harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: forgedResult }), "source_result_fingerprint_rejected");
    }
  });

  test("Action 566 successful neutral output carries no source reference token handle or authority after cloning", () => {
    const observation = zeroExitObservation("git version 2.42.0\n", "");
    const result = directSpawnFixture(observation);
    const neutralized = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(sourceRecord(result, observation));
    expectAcceptedNeutralization(neutralized, "process_created_normal_zero_exit");
    const serialized = JSON.stringify(neutralized);
    expect(serialized).not.toContain("sourceKind");
    expect(serialized).not.toContain("fixed_read_only_direct_spawn_raw_completion_neutralization_source");
    expect(serialized).not.toContain("WeakMap");
    expect(serialized).not.toContain("WeakSet");
    expect(serialized).not.toContain("child");
    expect(serialized).not.toContain("handle");
    const clone = jsonClone(neutralized);
    expect(clone.observedLiveProcess).toBe(false);
    expect(clone.authoritativeLive).toBe(false);
    expect(clone.authority).toBe("none");
    expect(clone.rawCompletionResult?.evidence?.observerAuthorityGranted).toBe(false);
    expect(clone.rawCompletionResult?.evidence?.credentialsUsed).toBe(false);
    expect(clone.rawCompletionResult?.evidence?.networkUsed).toBe(false);
    expect(clone.rawCompletionResult?.evidence?.runtimeActivated).toBe(false);
  });

  test("API UI runtime parser and forbidden dependency reachability remains absent", () => {
    const adapterSource = source(adapterPath);
    const coreSource = source(corePath);
    const apiSource = source(apiValidationRoutePath);
    const tradeUiSource = source(tradeUiPath);
    const gitParserSource = source(gitParserPath);
    const rawCoreSource = source(rawCorePath);
    expect(apiSource).not.toContain("spawn-to-raw-completion");
    expect(tradeUiSource).not.toContain("spawn-to-raw-completion");
    expect(gitParserSource).not.toContain("spawn-to-raw-completion");
    expect(rawCoreSource).not.toContain("spawn-to-raw-completion");
    expect(`${adapterSource}\n${coreSource}`).not.toMatch(/Avanza|BankID|createClient|\.from\(|\.insert\(|\.upsert\(|\.delete\(|\.rpc\(|\.storage|fetch\(|axios|keychain|keytar|process\.env/u);
    expect(`${adapterSource}\n${coreSource}`).not.toMatch(/genericVerifier|genericConsume|WeakSet|WeakMap|reset|replay|mint|testMode|post-trade-pure-git-version-interpretation-contract-core/u);
  });
});

type RawCategory =
  | "spawn_failed_before_process_creation"
  | "process_created_normal_zero_exit"
  | "process_created_non_zero_exit"
  | "process_created_signal_termination"
  | "child_process_error"
  | "stdout_output_limit_exceeded"
  | "stderr_output_limit_exceeded"
  | "combined_output_limit_exceeded";
