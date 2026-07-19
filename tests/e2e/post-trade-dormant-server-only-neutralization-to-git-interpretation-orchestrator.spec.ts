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
  DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_IDENTITY,
  buildDormantNeutralizationToGitInterpretationOrchestrationResult,
  type DormantNeutralizationToGitInterpretationResult,
} from "../../lib/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator-core";
import {
  neutralizeOriginalFirstLiveResolverResultCore,
  type DormantFirstLiveCompositionAdapterResult,
} from "../../lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";
import {
  DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_FINGERPRINT_DOMAINS,
  neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion,
  type SpawnToRawCompletionNeutralizationResult,
} from "../../lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core";
import {
  PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY,
  PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS,
  PURE_GIT_VERSION_INTERPRETATION_POLICY,
  buildPureGitVersionInterpretation,
  type PureGitVersionInterpretationResult,
} from "../../lib/post-trade-pure-git-version-interpretation-contract-core";
import {
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY,
  buildPureRawProcessCompletionEvidence,
} from "../../lib/post-trade-pure-raw-process-completion-evidence-contract-core";
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
const adapterPath = "lib/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.ts";
const corePath = "lib/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator-core.ts";
const neutralizerAdapterPath = "lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.ts";
const directSpawnAdapterPath = "lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts";
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

function orchestrateWithBridge(harness: ReturnType<typeof bridgeHarness>, result: FixedReadOnlyDirectSpawnResult): DormantNeutralizationToGitInterpretationResult {
  const consumed = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result });
  const neutralizationResult = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(consumed);
  return buildDormantNeutralizationToGitInterpretationOrchestrationResult({
    neutralizationResult,
    orchestrationTimestamp: "2026-07-17T11:30:00.000Z",
  });
}

function markAndOrchestrate(observation: FixedReadOnlyDirectSpawnObservation) {
  const harness = bridgeHarness();
  const result = directSpawnFixture(observation);
  harness.markProductionDirectSpawnProvenance(result, observation);
  return { harness, result, orchestration: orchestrateWithBridge(harness, result) };
}

function validNeutralizationFixture(observation: FixedReadOnlyDirectSpawnObservation = zeroExitObservation()) {
  const harness = bridgeHarness();
  const result = directSpawnFixture(observation);
  harness.markProductionDirectSpawnProvenance(result, observation);
  const consumed = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result });
  const neutralization = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(consumed);
  expect(neutralization.status).toBe("neutralized_raw_completion_ready");
  expect(neutralization.rawCompletionResult).toBeTruthy();
  return neutralization;
}

function buildOrchestrationFromNeutralization(neutralizationResult: unknown): DormantNeutralizationToGitInterpretationResult {
  return buildDormantNeutralizationToGitInterpretationOrchestrationResult({
    neutralizationResult,
    orchestrationTimestamp: "2026-07-17T11:30:00.000Z",
  });
}

function recomputeNeutralizationFingerprint(input: unknown): unknown {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return input;
  const core = { ...(input as Record<string, unknown>) };
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  return deepFreezeForTest({
    ...(input as Record<string, unknown>),
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_FINGERPRINT_DOMAINS.result, core),
  });
}

function expectClosedPreParserRejection(result: DormantNeutralizationToGitInterpretationResult, reason: DormantNeutralizationToGitInterpretationResult["reason"]) {
  expect(result.status).toBe("neutralization_rejected");
  expect(result.reasons).toContain(reason);
  expect(result.interpretationAttempted).toBe(false);
  assertRejectedNoParsedVersion(result);
  expectNoAuthority(result);
  expect(Object.isFrozen(result)).toBe(true);
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

function nonZeroExitObservation() {
  return buildFixedReadOnlyDirectSpawnObservation({
    processAttempted: true,
    processStarted: true,
    processExited: true,
    terminalReason: "process_closed",
    exitCode: 2,
    signal: null,
    stdoutBytes: 4,
    stderrBytes: 0,
    stdoutText: "bad\n",
    stderrText: "",
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

function signalExitObservation() {
  return buildFixedReadOnlyDirectSpawnObservation({
    processAttempted: true,
    processStarted: true,
    processExited: true,
    terminalReason: "process_closed",
    exitCode: null,
    signal: "SIGTERM",
    stdoutBytes: 5,
    stderrBytes: 0,
    stdoutText: "term\n",
    stderrText: "",
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

function expectNoAuthority(result: DormantNeutralizationToGitInterpretationResult) {
  expect(result.observedLiveProcess).toBe(false);
  expect(result.processAuthorityGranted).toBe(false);
  expect(result.observerAuthorityGranted).toBe(false);
  expect(result.terminationAuthorityGranted).toBe(false);
  expect(result.cliExecutionAuthorityGranted).toBe(false);
  expect(result.gitVersionAuthorityGranted).toBe(false);
  expect(result.compatibilityAuthorityGranted).toBe(false);
  expect(result.credentialAuthorityGranted).toBe(false);
  expect(result.networkAuthorityGranted).toBe(false);
  expect(result.runtimeAuthorityGranted).toBe(false);
  expect(result.tradingAuthorityGranted).toBe(false);
  expect(result.persistenceAuthorityGranted).toBe(false);
  expect(result.deploymentAuthorityGranted).toBe(false);
  expect(result.authorizationConsumed).toBe(false);
  expect(result.runtimeActivated).toBe(false);
  expect(result.toctouEliminated).toBe(false);
  expect(result.authority).toBe("none");
}

function assertRejectedNoParsedVersion(result: DormantNeutralizationToGitInterpretationResult) {
  expect(result.parsedVersion).toBeNull();
  expect(result.parsedVersionFingerprint).toBeNull();
  expect(result.major).toBeNull();
  expect(result.minor).toBeNull();
  expect(result.patch).toBeNull();
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

function orchestratorCoreWithParserMock(
  mockParser: (input: unknown) => PureGitVersionInterpretationResult,
) {
  const coreSource = source(corePath)
    .replace('import { createHash } from "node:crypto";', "const { createHash } = require('node:crypto');")
    .replace(/import\s+\{[\s\S]*?\}\s+from "@\/lib\/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core";/u, `const {
      DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY,
      DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_FINGERPRINT_DOMAINS,
    } = neutralizerDeps;`)
    .replace(/import\s+\{[\s\S]*?\}\s+from "@\/lib\/post-trade-pure-git-version-interpretation-contract-core";/u, `const {
      PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY,
      PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS,
      PURE_GIT_VERSION_INTERPRETATION_POLICY,
      buildPureGitVersionInterpretation,
    } = parserDeps;`)
    .replace(/import\s+\{[\s\S]*?\}\s+from "@\/lib\/post-trade-pure-raw-process-completion-evidence-contract-core";/u, `const {
      PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY,
      buildPureRawProcessCompletionEvidence,
    } = rawDeps;`)
    .replace(/^export /gmu, "");
  const js = ts.transpileModule(`${coreSource}\nreturn { buildDormantNeutralizationToGitInterpretationOrchestrationResult };`, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const factory = new Function("neutralizerDeps", "parserDeps", "rawDeps", "require", js);
  return factory(
    {
      DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_ADAPTER_IDENTITY,
      DORMANT_SERVER_ONLY_SPAWN_TO_RAW_COMPLETION_NEUTRALIZATION_FINGERPRINT_DOMAINS,
    },
    {
      PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY,
      PURE_GIT_VERSION_INTERPRETATION_FINGERPRINT_DOMAINS,
      PURE_GIT_VERSION_INTERPRETATION_POLICY,
      buildPureGitVersionInterpretation: mockParser,
    },
    {
      PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY,
      buildPureRawProcessCompletionEvidence,
    },
    require,
  ) as {
    buildDormantNeutralizationToGitInterpretationOrchestrationResult(input: unknown): DormantNeutralizationToGitInterpretationResult;
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

test.describe("dormant server-only neutralization-to-Git-interpretation orchestrator Action 569", () => {
  test("server-only wrapper exposes one production entry point and no prohibited imports", () => {
    const adapterSource = source(adapterPath);
    const coreSource = source(corePath);
    expect(adapterSource.startsWith('import "server-only";\n\n')).toBe(true);
    expect(adapterSource.match(/^export function /gmu)).toHaveLength(1);
    expect(adapterSource).toContain("orchestrateOriginalFixedReadOnlyDirectSpawnGitVersionInterpretation");
    expect(adapterSource).toContain("neutralizeOriginalFixedReadOnlyDirectSpawnToRawCompletion");
    expect(adapterSource).toContain("buildDormantNeutralizationToGitInterpretationOrchestrationResult");
    expect(adapterSource).not.toContain("export *");
    expect(adapterSource).not.toMatch(/node:child_process|from "child_process"|spawn\(|execFile|exec\(|fork\(|node:fs|fs\/promises|process\.env|fetch\(|axios|keychain|keytar|osascript|kill\(|setTimeout|setInterval|createClient|supabase|avanza|bankid/ui);
    expect(coreSource).not.toMatch(/^import "server-only";|node:child_process|from "child_process"|spawn\(|execFile|exec\(|fork\(|node:fs|fs\/promises|process\.env|fetch\(|axios|keychain|keytar|osascript|kill\(|setTimeout|setInterval|createClient|supabase|Avanza|BankID/u);
    expect(coreSource).not.toMatch(/semver|compatibilityPolicy|dependencyInjection|testMode|parserOptions|neutralizerInjection|clockInjection/u);
  });

  test("original production-valid zero-exit source neutralizes before one parser interpretation and returns accepted no-authority result", () => {
    const { orchestration, result } = markAndOrchestrate(zeroExitObservation("git version 2.42.0\n"));
    expect(orchestration.status).toBe("neutralization_succeeded_interpretation_accepted");
    expect(orchestration.reason).toBe("interpretation_accepted");
    expect(orchestration.neutralizationAttempted).toBe(true);
    expect(orchestration.neutralizationStatus).toBe("neutralized_raw_completion_ready");
    expect(orchestration.interpretationAttempted).toBe(true);
    expect(orchestration.interpretationStatus).toBe("accepted_fixture_git_version_interpretation");
    expect(orchestration.parsedVersion).toBe("2.42.0");
    expect(orchestration.major).toBe(2);
    expect(orchestration.minor).toBe(42);
    expect(orchestration.patch).toBe(0);
    expect(orchestration.sourceDirectSpawnResultFingerprint).toBe(result.resultFingerprint);
    expect(orchestration.rawCompletionCategory).toBe("process_created_normal_zero_exit");
    expect(orchestration.toolIdentity).toBe("git");
    expect(orchestration.executablePath).toBe("/usr/bin/git");
    expect(orchestration.argv).toEqual(["--version"]);
    expect(orchestration.resultFingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(Object.isFrozen(orchestration)).toBe(true);
    expectNoAuthority(orchestration);
  });

  test("reconstruction spread JSON structured clone and copied fingerprints are rejected by inherited neutralizer provenance", () => {
    const harness = bridgeHarness();
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    harness.markProductionDirectSpawnProvenance(result, observation);
    const cases = [
      { ...result },
      JSON.parse(JSON.stringify(result)) as FixedReadOnlyDirectSpawnResult,
      structuredClone(result),
      { ...result, resultFingerprint: result.resultFingerprint, evidence: result.evidence },
    ];
    for (const clone of cases) {
      const orchestration = orchestrateWithBridge(harness, clone as FixedReadOnlyDirectSpawnResult);
      expect(orchestration.status).toBe("neutralization_rejected");
      expect(orchestration.reason).toBe("production_provenance_rejected");
      expect(orchestration.interpretationAttempted).toBe(false);
      assertRejectedNoParsedVersion(orchestration);
      expectNoAuthority(orchestration);
    }
  });

  test("already consumed source produces deterministic rejection and no parser attempt", () => {
    const { harness, result, orchestration } = markAndOrchestrate(zeroExitObservation());
    expect(orchestration.status).toBe("neutralization_succeeded_interpretation_accepted");
    const second = orchestrateWithBridge(harness, result);
    expect(second.status).toBe("neutralization_rejected");
    expect(second.reason).toBe("already_consumed");
    expect(second.neutralizationStatus).toBe("blocked_fail_closed");
    expect(second.interpretationAttempted).toBe(false);
    assertRejectedNoParsedVersion(second);
    expectNoAuthority(second);
  });

  test("malformed and authority-bearing sources reject before interpretation", () => {
    const rejected = buildDormantNeutralizationToGitInterpretationOrchestrationResult({
      neutralizationResult: { directSpawnResult: { authoritativeLive: true } },
      orchestrationTimestamp: "2026-07-17T11:30:00.000Z",
    });
    expect(rejected.status).toBe("neutralization_rejected");
    expect(rejected.interpretationAttempted).toBe(false);
    assertRejectedNoParsedVersion(rejected);
    expectNoAuthority(rejected);
  });

  test("ineligible supported neutralization categories do not invoke parser", () => {
    const cases = [
      nonZeroExitObservation(),
      spawnFailureObservation(),
      signalExitObservation(),
      childProcessErrorObservation(),
      overflowObservation("stdout"),
      overflowObservation("stderr"),
      overflowObservation("combined"),
    ];
    for (const observation of cases) {
      const { orchestration } = markAndOrchestrate(observation);
      expect(orchestration.status).toBe("neutralization_succeeded_interpretation_not_attempted");
      expect(orchestration.reason).toBe("raw_completion_ineligible_for_interpretation");
      expect(orchestration.neutralizationStatus).toBe("neutralized_raw_completion_ready");
      expect(orchestration.interpretationAttempted).toBe(false);
      expect(orchestration.interpretationStatus).toBeNull();
      assertRejectedNoParsedVersion(orchestration);
      expectNoAuthority(orchestration);
    }
  });

  test("unsupported neutralization state rejects and parser is never invoked", () => {
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
    const { orchestration } = markAndOrchestrate(unsupported);
    expect(orchestration.status).toBe("neutralization_rejected");
    expect(orchestration.neutralizationStatus).toBe("blocked_fail_closed");
    expect(orchestration.interpretationAttempted).toBe(false);
    assertRejectedNoParsedVersion(orchestration);
    expectNoAuthority(orchestration);
  });

  test("parser rejection for malformed stdout remains closed with no partial parsed version", () => {
    for (const stdout of ["git 2.42.0\n", "git version 2.42\n", "git version 02.42.0\n"]) {
      const { orchestration } = markAndOrchestrate(zeroExitObservation(stdout));
      expect(orchestration.status).toBe("neutralization_succeeded_interpretation_rejected");
      expect(orchestration.reason).toBe("interpretation_rejected");
      expect(orchestration.interpretationAttempted).toBe(true);
      expect(orchestration.interpretationStatus).toBe("blocked_fail_closed");
      expect(orchestration.interpretationReason).not.toBe("accepted");
      assertRejectedNoParsedVersion(orchestration);
      expectNoAuthority(orchestration);
    }
  });

  test("parser rejection for non-empty stderr remains closed", () => {
    const { orchestration } = markAndOrchestrate(zeroExitObservation("git version 2.42.0\n", "warning\n"));
    expect(orchestration.status).toBe("neutralization_succeeded_interpretation_rejected");
    expect(orchestration.interpretationAttempted).toBe(true);
    expect(orchestration.interpretationReasons).toContain("stderr_not_empty");
    assertRejectedNoParsedVersion(orchestration);
    expectNoAuthority(orchestration);
  });

  test("neutralization result linkage mutation fails closed before parsing", () => {
    const harness = bridgeHarness();
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    harness.markProductionDirectSpawnProvenance(result, observation);
    const consumed = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result });
    const neutralization = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(consumed);
    const mutated = deepFreezeForTest({
      ...neutralization,
      sourceSpawnResultFingerprint: "a".repeat(64),
    } as SpawnToRawCompletionNeutralizationResult);
    const orchestration = buildDormantNeutralizationToGitInterpretationOrchestrationResult({
      neutralizationResult: mutated,
      orchestrationTimestamp: "2026-07-17T11:30:00.000Z",
    });
    expect(orchestration.status).toBe("neutralization_rejected");
    expect(orchestration.reasons).toContain("neutralization_rejected");
    expect(orchestration.interpretationAttempted).toBe(false);
    assertRejectedNoParsedVersion(orchestration);
    expectNoAuthority(orchestration);
  });

  test("raw completion runtime or authority claim fails closed", () => {
    const harness = bridgeHarness();
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    harness.markProductionDirectSpawnProvenance(result, observation);
    const consumed = harness.consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: result });
    const neutralization = neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(consumed);
    const raw = neutralization.rawCompletionResult;
    expect(raw?.evidence).toBeTruthy();
    const mutatedRaw = deepFreezeForTest({
      ...raw,
      runtimeActivated: true,
      evidence: {
        ...raw?.evidence,
        runtimeActivated: true,
      },
    });
    const mutated = deepFreezeForTest({
      ...neutralization,
      rawCompletionResult: mutatedRaw,
    } as SpawnToRawCompletionNeutralizationResult);
    const orchestration = buildDormantNeutralizationToGitInterpretationOrchestrationResult({
      neutralizationResult: mutated,
      orchestrationTimestamp: "2026-07-17T11:30:00.000Z",
    });
    expect(orchestration.status).toBe("neutralization_rejected");
    expect(orchestration.reasons).toContain("neutralization_rejected");
    expect(orchestration.interpretationAttempted).toBe(false);
    expectNoAuthority(orchestration);
  });

  test("malformed neutralization top-level contract schema and contradictions fail closed before parsing", () => {
    const valid = validNeutralizationFixture();
    const accessorCase = { ...valid } as Record<string, unknown>;
    Object.defineProperty(accessorCase, "status", {
      enumerable: true,
      get: () => "neutralized_raw_completion_ready",
    });
    const symbolCase = { ...valid, [Symbol("stage")]: "tampered" };
    const cases: ReadonlyArray<readonly [unknown, DormantNeutralizationToGitInterpretationResult["reason"]]> = [
      [{ ...valid, resultKind: "wrong" }, "neutralization_rejected"],
      [{ ...valid, resultVersion: 2 }, "neutralization_rejected"],
      [{ ...valid, adapterId: "wrong" }, "neutralization_rejected"],
      [{ ...valid, unknown: true }, "input_rejected"],
      [symbolCase, "input_rejected"],
      [accessorCase, "input_rejected"],
      [{ ...valid, status: "blocked_fail_closed", rawCompletionAccepted: false, blockingReasons: ["source_state_rejected"] }, "raw_completion_linkage_rejected"],
      [{ ...valid, rawCompletionResult: null }, "raw_completion_linkage_rejected"],
      [{ ...valid, resultFingerprint: "b".repeat(64) }, "neutralization_rejected"],
      [{ ...valid, resultFingerprint: "not-a-sha" }, "neutralization_rejected"],
      [{ ...valid, sourceSpawnResultFingerprint: "c".repeat(64) }, "neutralization_rejected"],
      [{ ...valid, blockingReasons: ["source_state_rejected"] }, "raw_completion_linkage_rejected"],
      [{ ...valid, rawCompletionInvoked: false }, "neutralization_rejected"],
      [{ ...valid, rawCompletionAccepted: false }, "neutralization_rejected"],
      [{ ...valid, observedLiveProcess: true }, "authority_rejected"],
      [{ ...valid, authority: "future_live_process_start_authority" }, "authority_rejected"],
      [{ ...valid, gitParserInvoked: true }, "runtime_claim_rejected"],
    ];
    for (const [candidate, reason] of cases) {
      expectClosedPreParserRejection(buildOrchestrationFromNeutralization(candidate), reason);
    }
  });

  test("malformed raw-completion evidence identity linkage and copied fingerprints fail closed before parser", () => {
    const valid = validNeutralizationFixture();
    const raw = valid.rawCompletionResult;
    expect(raw?.evidence).toBeTruthy();
    const evidence = raw?.evidence;
    const cases: ReadonlyArray<readonly [unknown, DormantNeutralizationToGitInterpretationResult["reason"]]> = [
      { ...raw, unknown: true },
      { ...raw, resultKind: "wrong" },
      { ...raw, resultVersion: 2 },
      { ...raw, contractId: "wrong" },
      { ...raw, resultFingerprint: "d".repeat(64) },
      { ...raw, evidence: { ...evidence, unknown: true } },
      { ...raw, evidence: { ...evidence, contractKind: "wrong" } },
      { ...raw, evidence: { ...evidence, contractVersion: 2 } },
      { ...raw, evidence: { ...evidence, boundaryId: "wrong" } },
      { ...raw, evidence: { ...evidence, evidenceFingerprint: "e".repeat(64) } },
      { ...raw, evidence: { ...evidence, sourceSpawnFingerprint: "f".repeat(64) } },
      { ...raw, evidence: { ...evidence, boundarySessionId: "other-session" } },
      { ...raw, evidence: { ...evidence, purpose: "other_purpose" } },
      { ...raw, evidence: { ...evidence, toolIdentity: "supabase_cli" } },
      { ...raw, evidence: { ...evidence, platform: "linux" } },
      { ...raw, evidence: { ...evidence, policyId: "other_policy" } },
      { ...raw, evidence: { ...evidence, canonicalExecutablePath: "/bin/git" } },
      { ...raw, evidence: { ...evidence, argv: ["status"] } },
      { ...raw, evidence: { ...evidence, completionCategory: "process_created_non_zero_exit" } },
      { ...raw, evidence: { ...evidence, stdoutText: "git version 9.9.9\n", stdoutByteCount: 18 } },
      { ...raw, evidence: { ...evidence, observedLiveProcess: true } },
      { ...raw, evidence: { ...evidence, authority: "fixture_structural_only" } },
      { ...raw, evidence: { ...evidence, runtimeActivated: true } },
      { ...raw, evidence: { ...evidence, toctouEliminated: true } },
    ].map((candidate) => [candidate, "raw_completion_linkage_rejected"] as const);
    for (const [mutatedRaw, reason] of cases) {
      const mutated = recomputeNeutralizationFingerprint({ ...valid, rawCompletionResult: mutatedRaw });
      const orchestration = buildOrchestrationFromNeutralization(mutated);
      expect(orchestration.status).toBe("neutralization_rejected");
      expect(orchestration.reasons).toContain(reason);
      expect(orchestration.interpretationAttempted).toBe(false);
      assertRejectedNoParsedVersion(orchestration);
      expectNoAuthority(orchestration);
    }
  });

  test("parser-stage malformed identity linkage consistency and authority claims are rejected by isolated core validation", () => {
    const neutralization = validNeutralizationFixture();
    const parserMutations: ReadonlyArray<readonly [
      (result: PureGitVersionInterpretationResult) => unknown,
      DormantNeutralizationToGitInterpretationResult["reason"],
    ]> = [
      [(result) => ({ ...result, resultKind: "wrong" }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, resultVersion: 2 }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, contractId: "wrong" }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, unknown: true }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, resultFingerprint: "1".repeat(64) }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, resultFingerprint: "bad" }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, boundaryId: "wrong" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, parserGrammarId: "wrong" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, normalizationId: "wrong" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, sourceRawCompletionResultFingerprint: "2".repeat(64) } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, sourceSpawnFingerprint: "3".repeat(64) } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, boundarySessionId: "other-session" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, purpose: "other_purpose" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, toolIdentity: "supabase_cli" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, platform: "linux" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, policyId: "other_policy" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, canonicalExecutablePath: "/bin/git" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, argv: ["status"] } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, originalStdoutFingerprint: "4".repeat(64) } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, evidenceFingerprint: "5".repeat(64) } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, parsedVersion: null } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, major: 9 } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, componentCount: 0 } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, suffixPresent: true } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, status: "blocked_fail_closed", blockingReasons: ["accepted"], cliVersionInterpreted: false, evidence: { ...result.evidence, status: "rejected", primaryReason: "accepted" } }), "interpretation_linkage_rejected"],
      [(result) => ({ ...result, observedLiveProcess: true }), "authority_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, runtimeActivated: true } }), "runtime_claim_rejected"],
      [(result) => ({ ...result, evidence: { ...result.evidence, toctouEliminated: true } }), "authority_rejected"],
    ];
    for (const [mutateParserResult, reason] of parserMutations) {
      const isolated = orchestratorCoreWithParserMock((input) => mutateParserResult(buildPureGitVersionInterpretation(input)) as PureGitVersionInterpretationResult);
      const orchestration = isolated.buildDormantNeutralizationToGitInterpretationOrchestrationResult({
        neutralizationResult: neutralization,
        orchestrationTimestamp: "2026-07-17T11:30:00.000Z",
      });
      expect(orchestration.status).toBe("neutralization_succeeded_interpretation_rejected");
      expect(orchestration.reasons).toContain(reason);
      expect(orchestration.interpretationAttempted).toBe(true);
      assertRejectedNoParsedVersion(orchestration);
      expectNoAuthority(orchestration);
    }
  });

  test("result union nullability is exact for all four statuses", () => {
    const accepted = markAndOrchestrate(zeroExitObservation()).orchestration;
    const notAttempted = markAndOrchestrate(nonZeroExitObservation()).orchestration;
    const parserRejected = markAndOrchestrate(zeroExitObservation("wrong\n")).orchestration;
    const neutralRejected = orchestrateWithBridge(bridgeHarness(), directSpawnFixture(zeroExitObservation()));
    expect(accepted.status).toBe("neutralization_succeeded_interpretation_accepted");
    expect(accepted.parsedVersion).toBeTruthy();
    expect(accepted.interpretationEvidenceFingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(notAttempted.status).toBe("neutralization_succeeded_interpretation_not_attempted");
    expect(notAttempted.interpretationStatus).toBeNull();
    expect(notAttempted.interpretationEvidenceFingerprint).toBeNull();
    expect(parserRejected.status).toBe("neutralization_succeeded_interpretation_rejected");
    expect(parserRejected.interpretationStatus).toBe("blocked_fail_closed");
    expect(parserRejected.parsedVersion).toBeNull();
    expect(neutralRejected.status).toBe("neutralization_rejected");
    expect(neutralRejected.rawCompletionResultFingerprint).toBeNull();
    expect(neutralRejected.interpretationStatus).toBeNull();
    for (const result of [accepted, notAttempted, parserRejected, neutralRejected]) {
      expect(result.contractId).toBe(DORMANT_NEUTRALIZATION_TO_GIT_INTERPRETATION_ORCHESTRATOR_IDENTITY.contractId);
      expect(result.resultFingerprint).toMatch(/^[a-f0-9]{64}$/u);
      expect(Object.isFrozen(result)).toBe(true);
      expectNoAuthority(result);
    }
  });

  test("fingerprints bind timestamp stage linkage and parsed version", () => {
    const first = markAndOrchestrate(zeroExitObservation("git version 2.42.0\n")).orchestration;
    const second = markAndOrchestrate(zeroExitObservation("git version 2.43.0\n")).orchestration;
    const sameStageLaterTimestamp = buildDormantNeutralizationToGitInterpretationOrchestrationResult({
      neutralizationResult: neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(
        bridgeHarness().consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization({ directSpawnResult: directSpawnFixture(zeroExitObservation("git version 2.44.0\n")) }),
      ),
      orchestrationTimestamp: "2026-07-17T11:30:01.000Z",
    });
    expect(first.parsedVersion).toBe("2.42.0");
    expect(second.parsedVersion).toBe("2.43.0");
    expect(first.parsedVersionFingerprint).not.toBe(second.parsedVersionFingerprint);
    expect(first.resultFingerprint).not.toBe(second.resultFingerprint);
    expect(second.resultFingerprint).not.toBe(sameStageLaterTimestamp.resultFingerprint);
  });

  test("no original source reference child handle token or private marker is returned", () => {
    const { orchestration, result } = markAndOrchestrate(zeroExitObservation());
    const serialized = JSON.stringify(orchestration);
    expect(serialized).not.toContain("directSpawnResult");
    expect(serialized).not.toContain("spawnObservation");
    expect(serialized).not.toContain("WeakMap");
    expect(serialized).not.toContain("WeakSet");
    expect(serialized).not.toContain("processHandle");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain(result.evidence.evaluatedAt);
    expect(Object.values(orchestration)).not.toContain(result);
  });

  test("immediate duplicate calls and independent originals preserve one-shot semantics", () => {
    const harness = bridgeHarness();
    const firstObservation = zeroExitObservation("git version 2.42.0\n");
    const secondObservation = zeroExitObservation("git version 2.43.0\n");
    const first = directSpawnFixture(firstObservation);
    const second = directSpawnFixture(secondObservation);
    harness.markProductionDirectSpawnProvenance(first, firstObservation);
    harness.markProductionDirectSpawnProvenance(second, secondObservation);
    const firstRun = orchestrateWithBridge(harness, first);
    const firstDuplicate = orchestrateWithBridge(harness, first);
    const secondRun = orchestrateWithBridge(harness, second);
    expect(firstRun.status).toBe("neutralization_succeeded_interpretation_accepted");
    expect(firstRun.parsedVersion).toBe("2.42.0");
    expect(firstDuplicate.status).toBe("neutralization_rejected");
    expect(firstDuplicate.reason).toBe("already_consumed");
    expect(secondRun.status).toBe("neutralization_succeeded_interpretation_accepted");
    expect(secondRun.parsedVersion).toBe("2.43.0");
  });

  test("Promise-style duplicate calls allow at most one successful neutralization", async () => {
    const harness = bridgeHarness();
    const observation = zeroExitObservation();
    const result = directSpawnFixture(observation);
    harness.markProductionDirectSpawnProvenance(result, observation);
    const [first, second] = await Promise.all([
      Promise.resolve().then(() => orchestrateWithBridge(harness, result)),
      Promise.resolve().then(() => orchestrateWithBridge(harness, result)),
    ]);
    const accepted = [first, second].filter((item) => item.status === "neutralization_succeeded_interpretation_accepted");
    const rejected = [first, second].filter((item) => item.status === "neutralization_rejected");
    expect(accepted).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toBe("already_consumed");
    for (const item of [first, second]) expectNoAuthority(item);
  });

  test("static reachability remains closed to API UI runner observer credential trading persistence and deployment paths", () => {
    const apiSource = source(apiValidationRoutePath);
    const uiSource = source(tradeUiPath);
    const adapterImport = "post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator";
    expect(apiSource).not.toContain(adapterImport);
    expect(uiSource).not.toContain(adapterImport);
    const allSource = source(adapterPath) + source(corePath) + source(neutralizerAdapterPath);
    expect(allSource).not.toMatch(/compatibilityAuthorityGranted:\s*true|deploymentAuthorityGranted:\s*true|runtimeActivated:\s*true|authorizationConsumed:\s*true/u);
    expect(allSource).not.toMatch(/Avanza|BankID|orderAction|positionMutation|settlementRetrieval|createClient|supabase\.(insert|update|delete|upsert|rpc|storage)/u);
  });
});
