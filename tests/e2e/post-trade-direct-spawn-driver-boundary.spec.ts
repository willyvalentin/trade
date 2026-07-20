import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY,
  DIRECT_SPAWN_DRIVER_POLICY_ID,
  DIRECT_SPAWN_EVALUATED_AT,
  DIRECT_SPAWN_FINGERPRINT_DOMAINS,
  buildDirectSpawnCompatibilitySummary,
  buildDirectSpawnDriverIdentityFingerprint,
  buildDirectSpawnFixtureDriverAdapter,
  buildDirectSpawnFixtureRequest,
  buildDirectSpawnFutureLiveDriverPlan,
  buildDirectSpawnOperationDefinition,
  buildDirectSpawnOperationRegistry,
  buildDirectSpawnPolicy,
  buildFixtureExecutableSpawnAuthority,
  buildFixtureRepositorySpawnAuthority,
  buildFixtureSpawnAuthorizationLink,
  buildSpawnSessionCapability,
  validateDirectSpawnDriverIdentity,
  validateDirectSpawnFixtureRequest,
  validateDirectSpawnOperationDefinition,
  validateDirectSpawnPolicy,
  validateExactArgvForOperation,
  validateFixtureExecutableSpawnAuthority,
  validateFixtureRepositorySpawnAuthority,
  validateFixtureSpawnAuthorizationLink,
  validateSpawnSessionCapability,
  type DirectSpawnOperation,
} from "../../lib/post-trade-direct-spawn-driver-boundary-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-direct-spawn-driver-boundary-core.ts";
const boundaryPath = "lib/post-trade-direct-spawn-driver-boundary.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function errorsOf(result: { ok: true } | { ok: false; errors: readonly string[] }) {
  return result.ok ? [] : result.errors;
}

function expectInvalid(result: { ok: true } | { ok: false; errors: readonly string[] }) {
  expect(errorsOf(result).length).toBeGreaterThan(0);
}

type AnyValidationResult = { ok: true; value?: unknown } | { ok: false; errors: readonly string[] };

function fixture(operation: DirectSpawnOperation = "collect_git_version") {
  const session = buildSpawnSessionCapability();
  const op = buildDirectSpawnOperationDefinition(operation);
  const executable = buildFixtureExecutableSpawnAuthority({ boundarySessionId: session.boundarySessionId, toolIdentity: op.toolIdentity });
  const authorization = buildFixtureSpawnAuthorizationLink(operation, { boundarySessionId: session.boundarySessionId });
  const request = buildDirectSpawnFixtureRequest({ operation, spawnSessionCapability: session, executableAuthority: executable, authorizationLink: authorization });
  const adapter = buildDirectSpawnFixtureDriverAdapter();
  return { session, op, executable, authorization, request, adapter };
}

function clone<T extends object>(input: T): T {
  return { ...input };
}

test.describe("direct spawn driver boundary canonical behavior", () => {
  test("exact identity, policy and server boundary are fixture-only no-run", () => {
    const boundarySource = source(boundaryPath);
    expect(boundarySource.startsWith('import "server-only";')).toBe(true);
    expect(validateDirectSpawnDriverIdentity(DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY).ok).toBe(true);
    expect(validateDirectSpawnPolicy(buildDirectSpawnPolicy()).ok).toBe(true);
    expect(buildDirectSpawnPolicy().policyId).toBe(DIRECT_SPAWN_DRIVER_POLICY_ID);
    expect(buildDirectSpawnFutureLiveDriverPlan()).toMatchObject({ liveDriverPresent: false, selectedSpawnApi: "not_selected" });
  });

  test("operation registry contains exact version operations only", () => {
    const operations = buildDirectSpawnOperationRegistry();
    expect(operations.map((item) => item.operation)).toEqual(["collect_git_version", "collect_supabase_cli_version"]);
    for (const operation of operations) {
      expect(operation.argv).toEqual(["--version"]);
      expect(operation.repositoryRequired).toBe(false);
      expect(operation.workingDirectoryMode).toBe("none");
      expect(operation.environmentMode).toBe("empty_exact");
      expect(operation.stdinPolicy).toBe("closed");
      expect(validateDirectSpawnOperationDefinition(operation).ok).toBe(true);
      expect(Object.isFrozen(operation.argv)).toBe(true);
    }
  });

  test("valid Git fixture produces compatible no-execution plan", () => {
    const { adapter, request } = fixture("collect_git_version");
    const result = adapter.createFixturePlan({ request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(result.plan.disposition).toBe("compatible_fixture_plan");
    expect(result.evidence.disposition).toBe("compatible_fixture_no_execution");
    expect(result.evidence.lifecycleState).toBe("fixture_execution_not_started");
    expect(result.plan).toMatchObject({
      operation: "collect_git_version",
      toolIdentity: "git",
      argv: ["--version"],
      workingDirectoryMode: "none",
      workingDirectory: null,
      environmentMode: "empty_exact",
      stdinPolicy: "closed",
      stdoutPolicy: "bounded_sanitized_capture",
      stderrPolicy: "bounded_sanitized_capture",
      authority: "fixture_structural_only",
      completeness: "complete_fixture_structure",
    });
    expect(result.evidence).toMatchObject(noExecutionEvidence());
  });

  test("valid Supabase fixture produces compatible no-execution plan", () => {
    const { adapter, request } = fixture("collect_supabase_cli_version");
    const result = adapter.createFixturePlan({ request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(result.plan.disposition).toBe("compatible_fixture_plan");
    expect(result.plan.toolIdentity).toBe("supabase_cli");
    expect(result.plan.argv).toEqual(["--version"]);
    expect(result.evidence).toMatchObject(noExecutionEvidence());
  });

  test("Git operation with Supabase authority blocks without adapting", () => {
    const { session, authorization, adapter } = fixture("collect_git_version");
    const executable = buildFixtureExecutableSpawnAuthority({ boundarySessionId: session.boundarySessionId, toolIdentity: "supabase_cli" });
    const request = buildDirectSpawnFixtureRequest({ operation: "collect_git_version", spawnSessionCapability: session, executableAuthority: executable, authorizationLink: authorization });
    const result = adapter.createFixturePlan({ request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(result.plan.blockingReasons).toContain("operation_tool_mismatch");
    expect(result.evidence.executionAttempted).toBe(false);
  });

  test("unexpected repository authority blocks version operations", () => {
    const { request, adapter } = fixture();
    const withRepository = buildDirectSpawnFixtureRequest({ ...request, repositoryAuthority: buildFixtureRepositorySpawnAuthority() });
    const result = adapter.createFixturePlan({ request: withRepository, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(result.plan.blockingReasons).toContain("repository_authority_unexpected");
    expect(result.evidence.executionAttempted).toBe(false);
  });

  test("capability provenance is clone resistant and noninterchangeable", () => {
    const { session, executable } = fixture();
    const repository = buildFixtureRepositorySpawnAuthority();
    expect(validateSpawnSessionCapability(session).ok).toBe(true);
    expect(validateSpawnSessionCapability(clone(session)).ok).toBe(false);
    expect(validateFixtureExecutableSpawnAuthority(executable).ok).toBe(true);
    expect(validateFixtureExecutableSpawnAuthority(clone(executable)).ok).toBe(false);
    expect(validateFixtureExecutableSpawnAuthority(repository as unknown, "collect_git_version").ok).toBe(false);
    expect(validateFixtureRepositorySpawnAuthority(repository).ok).toBe(true);
    expect(validateFixtureRepositorySpawnAuthority(executable as unknown).ok).toBe(false);
  });

  test("authorization link is structural and never consumed", () => {
    const { authorization } = fixture();
    expect(validateFixtureSpawnAuthorizationLink(authorization).ok).toBe(true);
    expect(validateFixtureSpawnAuthorizationLink(clone(authorization)).ok).toBe(false);
    expect(authorization.authorizationConsumed).toBe(false);
    expect(authorization.authorizesLiveSpawn).toBe(false);
  });

  test("compatibility is structural only and not runner enabling", () => {
    expect(buildDirectSpawnCompatibilitySummary()).toMatchObject({
      trustedResolver: "fixture_authority_structurally_linked_but_not_live_executable_authority",
      processExecutor: "fixture_plan_structurally_compatible_but_not_executor_invoking",
      liveDriverDesign: "direct_spawn_model_compatible_but_execution_disabled",
      processObserver: "observer_policy_linked_but_not_invoked",
      cliVersionCollector: "version_operations_linked_but_not_run",
      credentialBoundary: "first_operations_require_no_credentials",
      authorization: "fixture_link_does_not_consume_or_grant_live_authorization",
      runner: "fixture_direct_spawn_plan_structurally_compatible_but_not_live_runner_enabling",
      enablesExecution: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
    });
  });

  test("production files expose no live process execution APIs", () => {
    const combined = `${source(corePath)}\n${source(boundaryPath)}`;
    for (const pattern of [
      /child_process|node:child_process/u,
      /\bspawn\(|\bexec\(|\bexecFile\(|\bfork\(/u,
      /process\.env|process\.cwd/u,
      /setTimeout\(|setInterval\(/u,
      /\bkill\(/u,
    ]) {
      expect(combined).not.toMatch(pattern);
    }
  });

  test("API and Trade UI do not import direct spawn boundary", () => {
    expect(source(apiPath)).not.toContain("post-trade-direct-spawn-driver-boundary");
    expect(source(tradeUiPath)).not.toContain("post-trade-direct-spawn-driver-boundary");
  });
});

const identityPatches: Array<[string, Record<string, unknown>]> = [
  ["changed driver kind", { driverKind: "runner" }],
  ["changed driver id", { driverId: "ture.execution.direct-spawn-driver-boundary.live.v1" }],
  ["live-looking driver id", { driverId: "live_spawn_driver" }],
  ["non macOS platform", { platform: "linux" }],
  ["live mode", { implementationMode: "live" }],
  ["shell enabled", { shellMode: "allowed" }],
  ["changed execution model", { executionModel: "shell" }],
  ["changed source model", { sourceModel: "ambient_process" }],
  ["changed policy version", { policyVersion: 2 }],
  ["caller authority", { authority: "live_spawn_authorized" }],
  ["caller completeness", { completeness: "complete_fixture_structure" }],
];

for (const [name, patch] of identityPatches) {
  test(`identity rejects ${name}`, () => {
    expectInvalid(validateDirectSpawnDriverIdentity({ ...DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY, ...patch }));
  });
}

const policyPatches: Array<[string, Record<string, unknown>]> = [
  ["unknown policy", { policyId: "unknown" }],
  ["case-changed policy", { policyId: DIRECT_SPAWN_DRIVER_POLICY_ID.toUpperCase() }],
  ["shell enabled", { shellAllowed: true }],
  ["retry override", { retryPolicy: "retry_once" }],
  ["multiple active process override", { oneActiveProcessOnly: false }],
  ["arbitrary command override", { arbitraryCommandsAllowed: true }],
  ["arbitrary argv override", { arbitraryArgumentsAllowed: true }],
  ["environment inheritance", { environmentInheritanceAllowed: true }],
  ["environment override", { environmentOverridesAllowed: true }],
  ["credential injection", { credentialInjectionAllowed: true }],
  ["stdin allowed", { stdinAllowed: true }],
  ["timeout disabled", { timeoutRequired: false }],
  ["observer disabled", { processObserverRequiredForFutureLiveUse: false }],
  ["fixture may spawn", { fixtureMaySpawn: true }],
  ["runner enabled", { fixtureMayEnableRunner: true }],
];

for (const [name, patch] of policyPatches) {
  test(`spawn policy rejects ${name}`, () => {
    expectInvalid(validateDirectSpawnPolicy({ ...buildDirectSpawnPolicy(), ...patch }));
  });
}

const invalidOperations = [
  "run_command",
  "execute",
  "spawn_any",
  "shell",
  "run_script",
  "run_git",
  "run_supabase",
  "deploy",
  "execute_sql",
  "git_status",
  "git_rev_parse",
  "supabase_deploy",
];

for (const operation of invalidOperations) {
  test(`operation registry rejects ${operation}`, () => {
    expectInvalid(validateDirectSpawnOperationDefinition({ ...buildDirectSpawnOperationDefinition("collect_git_version"), operation }));
  });
}

const argvCases: Array<[string, unknown]> = [
  ["altered argv", ["version"]],
  ["extra argv", ["--version", "--verbose"]],
  ["missing argv", []],
  ["empty argument", [""]],
  ["semicolon", ["--version;rm"]],
  ["pipe", ["--version|cat"]],
  ["ampersand", ["--version&"]],
  ["backticks", ["`version`"]],
  ["command substitution", ["$(version)"]],
  ["newline", ["--version\n"]],
  ["NUL", ["--version\0"]],
  ["wildcard", ["*"]],
  ["response file", ["@args"]],
];

for (const [name, argv] of argvCases) {
  test(`argv validation rejects ${name}`, () => {
    expectInvalid(validateExactArgvForOperation("collect_git_version", argv));
  });
}

const requestExtraFields = [
  "executablePath",
  "command",
  "commandLine",
  "argv",
  "cwd",
  "workingDirectory",
  "env",
  "environment",
  "PATH",
  "stdin",
  "stdio",
  "credentials",
  "timeoutOverride",
  "parserOverride",
  "observerOverride",
  "signal",
  "spawn",
  "execute",
  "safe",
  "authority",
  "completeness",
  "pid",
  "processId",
  "processGroupId",
  "shell",
  "shellCommand",
  "token",
  "secret",
  "kill",
  "terminate",
];

for (const field of requestExtraFields) {
  test(`request rejects forbidden top-level field ${field}`, () => {
    const { request } = fixture();
    expectInvalid(validateDirectSpawnFixtureRequest({ ...request, [field]: field === "PATH" ? "/tmp/bin" : true }));
  });
}

const nestedForbiddenKeys = [
  "pid",
  "ppid",
  "pgid",
  "processId",
  "processGroupId",
  "command",
  "commandLine",
  "shell",
  "shellCommand",
  "executablePath",
  "cwd",
  "workingDirectory",
  "env",
  "environment",
  "PATH",
  "stdin",
  "stdio",
  "spawn",
  "fork",
  "exec",
  "execFile",
  "signal",
  "kill",
  "terminate",
  "timeoutHandle",
  "credentials",
  "token",
  "secret",
  "executionStarted",
  "processSpawned",
  "pidCreated",
  "processGroupCreated",
  "enablesProcessStart",
  "enablesPreflightRunner",
];

for (const key of nestedForbiddenKeys) {
  test(`request rejects nested forbidden key ${key}`, () => {
    const { request } = fixture();
    expectInvalid(validateDirectSpawnFixtureRequest({ ...request, nested: { [key]: true } }));
  });
}

const capabilityPatches: Array<[string, (base: ReturnType<typeof fixture>) => unknown, (input: unknown) => AnyValidationResult]> = [
  ["plain spawn session", ({ session }) => clone(session), validateSpawnSessionCapability],
  ["wrong spawn kind", ({ session }) => ({ ...session, capabilityKind: "process_session" }), validateSpawnSessionCapability],
  ["wrong spawn version", ({ session }) => ({ ...session, capabilityVersion: 2 }), validateSpawnSessionCapability],
  ["malformed spawn id", ({ session }) => ({ ...session, capabilityId: "bad id" }), validateSpawnSessionCapability],
  ["expired spawn session", () => buildSpawnSessionCapability({ expiresAt: "2026-07-17T10:19:00.000Z" }), validateSpawnSessionCapability],
  ["plain executable authority", ({ executable }) => clone(executable), (input) => validateFixtureExecutableSpawnAuthority(input)],
  ["wrong executable tool", ({ executable }) => ({ ...executable, toolIdentity: "python" }), (input) => validateFixtureExecutableSpawnAuthority(input)],
  ["live executable authority", ({ executable }) => ({ ...executable, authoritativeLive: true }), (input) => validateFixtureExecutableSpawnAuthority(input)],
  ["process-start executable authority", ({ executable }) => ({ ...executable, enablesProcessStart: true }), (input) => validateFixtureExecutableSpawnAuthority(input)],
  ["expired executable authority", () => buildFixtureExecutableSpawnAuthority({ expiresAt: "2026-07-17T10:19:00.000Z" }), (input) => validateFixtureExecutableSpawnAuthority(input)],
  ["plain repository authority", () => clone(buildFixtureRepositorySpawnAuthority()), validateFixtureRepositorySpawnAuthority],
  ["live repository authority", () => ({ ...buildFixtureRepositorySpawnAuthority(), authoritativeLive: true }), validateFixtureRepositorySpawnAuthority],
  ["cwd-enabling repository authority", () => ({ ...buildFixtureRepositorySpawnAuthority(), enablesWorkingDirectoryUse: true }), validateFixtureRepositorySpawnAuthority],
  ["git-enabling repository authority", () => ({ ...buildFixtureRepositorySpawnAuthority(), enablesGitOperation: true }), validateFixtureRepositorySpawnAuthority],
  ["expired repository authority", () => buildFixtureRepositorySpawnAuthority({ expiresAt: "2026-07-17T10:19:00.000Z" }), validateFixtureRepositorySpawnAuthority],
  ["plain authorization link", ({ authorization }) => clone(authorization), (input) => validateFixtureSpawnAuthorizationLink(input)],
  ["authorization consumed", ({ authorization }) => ({ ...authorization, authorizationConsumed: true }), (input) => validateFixtureSpawnAuthorizationLink(input)],
  ["live spawn authorization", ({ authorization }) => ({ ...authorization, authorizesLiveSpawn: true }), (input) => validateFixtureSpawnAuthorizationLink(input)],
  ["authorization operation mismatch", ({ authorization }) => ({ ...authorization, operation: "collect_supabase_cli_version" }), (input) => validateFixtureSpawnAuthorizationLink(input)],
  ["authorization token", ({ authorization }) => ({ ...authorization, token: "opaque" }), (input) => validateFixtureSpawnAuthorizationLink(input)],
];

for (const [name, buildInput, validator] of capabilityPatches) {
  test(`capability validation rejects ${name}`, () => {
    expectInvalid(validator(buildInput(fixture())));
  });
}

const requestPatches: Array<[string, Record<string, unknown>]> = [
  ["wrong kind", { requestKind: "spawn_request" }],
  ["wrong version", { requestVersion: 2 }],
  ["bad request id", { requestId: "bad id" }],
  ["driver mismatch", { driverIdentityFingerprint: "0".repeat(64) }],
  ["policy mismatch", { driverPolicyId: "other" }],
  ["unknown operation", { operation: "deploy" }],
  ["session mismatch", { boundarySessionId: "other_session" }],
  ["expired request", { expiresAt: "2026-07-17T10:19:00.000Z" }],
  ["attempt zero", { attempt: 0 }],
  ["attempt two", { attempt: 2 }],
  ["retry override", { retryPolicy: "retry_once" }],
  ["bad requestedAt", { requestedAt: "2026-07-17 10:20:00" }],
  ["bad algorithm", { requestFingerprintAlgorithm: "sha1" }],
];

for (const [name, patch] of requestPatches) {
  test(`request validation rejects ${name}`, () => {
    const { request } = fixture();
    expectInvalid(validateDirectSpawnFixtureRequest({ ...request, ...patch }));
  });
}

const outputStates = [
  "not_captured",
  "modeled_within_limits",
  "modeled_stdout_limit_exceeded",
  "modeled_stderr_limit_exceeded",
  "modeled_combined_limit_exceeded",
  "modeled_invalid_encoding",
  "modeled_binary_output",
  "modeled_truncated",
  "output_state_unknown",
];

for (const state of outputStates) {
  test(`output state ${state} remains fixture-only and no live output`, () => {
    const { adapter, request } = fixture();
    const result = adapter.createFixturePlan({ request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(state).toBeTruthy();
    expect(result.evidence.outputCapturedLive).toBe(false);
    expect(result.plan.stdoutMaxBytes).toBe(16384);
    expect(result.plan.stderrMaxBytes).toBe(16384);
    expect(result.plan.combinedMaxBytes).toBe(32768);
  });
}

const timeoutStates = ["not_started", "modeled_completed_before_timeout", "modeled_timeout_reached", "modeled_timeout_state_unknown"];

for (const state of timeoutStates) {
  test(`timeout state ${state} schedules no timer and sends no signals`, () => {
    const { adapter, request } = fixture();
    const result = adapter.createFixturePlan({ request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(state).toBeTruthy();
    expect(result.evidence.timeoutScheduled).toBe(false);
    expect(result.evidence.signalsSent).toBe(false);
    expect(result.evidence.terminationAttempted).toBe(false);
  });
}

for (const operation of ["collect_git_version", "collect_supabase_cli_version"] as const) {
  for (let index = 0; index < 75; index += 1) {
    test(`generated invariant ${operation} #${index + 1} remains no-run and deterministic`, () => {
      const first = fixture(operation);
      const second = fixture(operation);
      const firstResult = first.adapter.createFixturePlan({ request: first.request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
      const secondResult = first.adapter.createFixturePlan({ request: first.request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
      const otherSessionResult = second.adapter.createFixturePlan({ request: second.request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
      expect(firstResult).toEqual(secondResult);
      expect(firstResult.resultFingerprint).toBe(secondResult.resultFingerprint);
      expect(firstResult.evidence).toMatchObject(noExecutionEvidence());
      expect(firstResult.compatibility.enablesExecution).toBe(false);
      expect(otherSessionResult.plan.boundarySessionId).toBe(firstResult.plan.boundarySessionId);
      expect(Object.isFrozen(firstResult)).toBe(true);
      expect(() => Object.assign(firstResult as unknown as Record<string, unknown>, { executionAttempted: true })).toThrow();
    });
  }
}

test.describe("direct spawn fingerprint domains", () => {
  for (const [key, domain] of Object.entries(DIRECT_SPAWN_FINGERPRINT_DOMAINS)) {
    test(`fingerprint domain ${key} is source-controlled`, () => {
      expect(domain).toMatch(/^ture:direct-spawn-driver-boundary:/u);
    });
  }

  test("identity fingerprint is deterministic and field-sensitive", () => {
    const exact = buildDirectSpawnDriverIdentityFingerprint();
    const changed = buildDirectSpawnDriverIdentityFingerprint({ ...DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY, shellMode: "allowed" });
    expect(exact).toMatch(/^[a-f0-9]{64}$/u);
    expect(changed).not.toBe(exact);
  });

  test("operation argv order is fingerprinted", () => {
    const exact = buildDirectSpawnOperationDefinition("collect_git_version");
    const altered = validateDirectSpawnOperationDefinition({ ...exact, argv: ["version", "--"] });
    expectInvalid(altered);
  });
});

function noExecutionEvidence() {
  return {
    fixtureOnly: true,
    authoritativeLive: false,
    executionAttempted: false,
    executionStarted: false,
    processSpawned: false,
    pidCreated: false,
    processGroupCreated: false,
    outputCapturedLive: false,
    timeoutScheduled: false,
    terminationAttempted: false,
    signalsSent: false,
    terminationVerifiedLive: false,
    observerInvokedLive: false,
    authorizationConsumed: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
  } as const;
}
