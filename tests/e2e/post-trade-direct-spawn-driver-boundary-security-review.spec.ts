import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY,
  DIRECT_SPAWN_EVALUATED_AT,
  buildDirectSpawnCompatibilitySummary,
  buildDirectSpawnFixtureDriverAdapter,
  buildDirectSpawnFixtureRequest,
  buildDirectSpawnOperationDefinition,
  buildDirectSpawnOperationRegistry,
  buildFixtureExecutableSpawnAuthority,
  buildFixtureRepositorySpawnAuthority,
  buildFixtureSpawnAuthorizationLink,
  buildSpawnSessionCapability,
  validateDirectSpawnFixtureRequest,
  validateExactArgvForOperation,
  validateFixtureExecutableSpawnAuthority,
  validateFixtureRepositorySpawnAuthority,
  validateSpawnSessionCapability,
  type DirectSpawnBlockingReason,
  type DirectSpawnOperation,
} from "../../lib/post-trade-direct-spawn-driver-boundary-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-direct-spawn-driver-boundary-core.ts";
const boundaryPath = "lib/post-trade-direct-spawn-driver-boundary.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

const blockingReasons: readonly DirectSpawnBlockingReason[] = [
  "request_invalid",
  "request_expired",
  "driver_identity_mismatch",
  "driver_policy_unknown",
  "operation_unknown",
  "operation_tool_mismatch",
  "operation_argv_mismatch",
  "spawn_session_capability_invalid",
  "spawn_session_capability_expired",
  "executable_authority_invalid",
  "executable_authority_expired",
  "executable_authority_not_live",
  "repository_authority_unexpected",
  "repository_authority_required",
  "repository_authority_invalid",
  "repository_authority_expired",
  "authorization_link_invalid",
  "authorization_operation_mismatch",
  "authorization_session_mismatch",
  "session_mismatch",
  "retry_not_allowed",
  "attempt_must_be_one",
  "shell_forbidden",
  "arbitrary_command_forbidden",
  "arbitrary_argv_forbidden",
  "arbitrary_cwd_forbidden",
  "environment_inheritance_forbidden",
  "environment_override_forbidden",
  "credentials_forbidden",
  "stdin_forbidden",
  "output_policy_mismatch",
  "timeout_policy_mismatch",
  "termination_policy_mismatch",
  "observer_policy_mismatch",
  "fixture_claimed_execution",
  "fixture_claimed_process_spawn",
  "fixture_claimed_pid",
  "fixture_claimed_process_group",
  "fixture_claimed_output_capture",
  "fixture_claimed_timeout_schedule",
  "fixture_claimed_signal",
  "fixture_claimed_termination",
  "fixture_claimed_authorization_consumption",
  "fixture_claimed_runner_enablement",
];

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function fixture(operation: DirectSpawnOperation = "collect_git_version") {
  const session = buildSpawnSessionCapability();
  const definition = buildDirectSpawnOperationDefinition(operation);
  const executable = buildFixtureExecutableSpawnAuthority({
    boundarySessionId: session.boundarySessionId,
    toolIdentity: definition.toolIdentity,
  });
  const authorization = buildFixtureSpawnAuthorizationLink(operation, {
    boundarySessionId: session.boundarySessionId,
  });
  const request = buildDirectSpawnFixtureRequest({
    operation,
    spawnSessionCapability: session,
    executableAuthority: executable,
    authorizationLink: authorization,
  });
  const adapter = buildDirectSpawnFixtureDriverAdapter();
  return { adapter, authorization, executable, request, session };
}

function expectInvalid(result: { ok: true } | { ok: false; errors: readonly string[] }) {
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.errors.length).toBeGreaterThan(0);
}

test.describe("direct spawn boundary static security review", () => {
  test("production dependency surface contains no live process, timer, environment, cwd, fs, or shell primitives", () => {
    const combined = `${source(corePath)}\n${source(boundaryPath)}`;
    for (const pattern of [
      /child_process|node:child_process|cross-spawn|execa|Bun\.spawn|Deno\.Command/u,
      /\bspawnSync\(|\bspawn\(|\bexecSync\(|\bexec\(|\bexecFileSync\(|\bexecFile\(|\bfork\(/u,
      /process\.kill|pkill|killall|setTimeout\(|setInterval\(|AbortSignal\.timeout|timers\/promises/u,
      /process\.env|process\.cwd|process\.execPath|node:fs|from ['"]fs['"]|fs\/promises|Keychain|security find/u,
      /\beval\(|\bFunction\(|import\(/u,
    ]) {
      expect(combined).not.toMatch(pattern);
    }
  });

  test("production source never emits unsafe true execution semantics", () => {
    const combined = `${source(corePath)}\n${source(boundaryPath)}`;
    expect(combined).not.toMatch(
      /authoritativeLive: true|executionAttempted: true|executionStarted: true|processSpawned: true|pidCreated: true|processGroupCreated: true|shellUsed: true|outputCapturedLive: true|timeoutScheduled: true|terminationAttempted: true|signalsSent: true|terminationVerifiedLive: true|observerInvokedLive: true|authorizationConsumed: true|enablesProcessStart: true|enablesPreflightRunner: true/u,
    );
  });

  test("server wrapper is server-only and the boundary is not wired into API or Trade UI", () => {
    expect(source(boundaryPath).startsWith('import "server-only";')).toBe(true);
    expect(source(apiPath)).not.toContain("post-trade-direct-spawn-driver-boundary");
    expect(source(tradeUiPath)).not.toContain("post-trade-direct-spawn-driver-boundary");
  });

  test("operation registry and argv references are deeply immutable and cannot alter future plans", () => {
    const registry = buildDirectSpawnOperationRegistry();
    const operation = registry[0];
    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(operation)).toBe(true);
    expect(Object.isFrozen(operation.argv)).toBe(true);
    expect(() => (operation.argv as unknown as string[]).push("--help")).toThrow();

    const { adapter, request } = fixture("collect_git_version");
    const first = adapter.createFixturePlan({ request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(Object.isFrozen(first.plan.argv)).toBe(true);
    expect(() => (first.plan.argv as unknown as string[]).push("--help")).toThrow();

    const second = adapter.createFixturePlan({ request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(second.plan.argv).toEqual(["--version"]);
    expect(second.plan).toEqual(first.plan);
  });

  test("plain-object, spread-clone, JSON-clone, and structured-clone capabilities fail provenance checks", () => {
    const { authorization, executable, session } = fixture();
    const repository = buildFixtureRepositorySpawnAuthority();
    const clones = [
      validateSpawnSessionCapability({ ...session }),
      validateSpawnSessionCapability(JSON.parse(JSON.stringify(session))),
      validateFixtureExecutableSpawnAuthority({ ...executable }),
      validateFixtureExecutableSpawnAuthority(JSON.parse(JSON.stringify(executable))),
      validateFixtureRepositorySpawnAuthority({ ...repository }),
      validateFixtureRepositorySpawnAuthority(JSON.parse(JSON.stringify(repository))),
      validateDirectSpawnFixtureRequest({ ...buildDirectSpawnFixtureRequest({ spawnSessionCapability: { ...session } as typeof session }) }),
      validateDirectSpawnFixtureRequest(
        buildDirectSpawnFixtureRequest({
          authorizationLink: JSON.parse(JSON.stringify(authorization)),
          executableAuthority: executable,
          spawnSessionCapability: session,
        }),
      ),
    ];
    for (const result of clones) expectInvalid(result);
    if (typeof structuredClone === "function") expectInvalid(validateSpawnSessionCapability(structuredClone(session)));
  });

  test("capability types are noninterchangeable and cannot substitute repository authority for executable authority", () => {
    const { executable, session } = fixture();
    const repository = buildFixtureRepositorySpawnAuthority();
    expectInvalid(validateFixtureExecutableSpawnAuthority(repository as unknown, "collect_git_version"));
    expectInvalid(validateFixtureRepositorySpawnAuthority(executable as unknown));
    expectInvalid(validateFixtureExecutableSpawnAuthority(session as unknown, "collect_git_version"));
  });

  test("cross-session capability and authorization substitution fail closed", () => {
    const session = buildSpawnSessionCapability({ boundarySessionId: "other_session" });
    const executable = buildFixtureExecutableSpawnAuthority({ boundarySessionId: "other_session", toolIdentity: "git" });
    const authorization = buildFixtureSpawnAuthorizationLink("collect_git_version", { boundarySessionId: "other_session" });
    expectInvalid(validateSpawnSessionCapability(session));
    expectInvalid(validateFixtureExecutableSpawnAuthority(executable));
    expectInvalid(validateDirectSpawnFixtureRequest(buildDirectSpawnFixtureRequest({ authorizationLink: authorization })));
  });

  test("unknown fields, fingerprints, and malformed nested values collapse to closed blocking reasons in plans", () => {
    const { adapter, request } = fixture();
    const tampered = {
      ...request,
      requestFingerprint: "0".repeat(64),
      commandLine: "git --version",
      nested: { harmless: "Bearer should-never-be-accepted" },
    };
    const result = adapter.createFixturePlan({ request: tampered as typeof request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(result.plan.disposition).toBe("blocked_fixture_plan");
    expect(result.plan.blockingReasons.length).toBeGreaterThan(0);
    for (const reason of result.plan.blockingReasons) expect(blockingReasons).toContain(reason);
    expect(result.plan.blockingReasons).toContain("request_invalid");
    expect(result.evidence).toMatchObject(noExecutionEvidence());
  });

  test("recursive prohibited-input scanner handles arrays, cycles, depth, and object-count limits without execution", () => {
    const { adapter, request } = fixture();
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const deep = Array.from({ length: 30 }).reduce<Record<string, unknown>>((value) => ({ next: value }), {});
    const many = Object.fromEntries(Array.from({ length: 530 }, (_, index) => [`k${index}`, { safe: "value" }]));

    for (const extra of [{ nested: [{ shell: true }] }, { cyclic }, { deep }, { many }]) {
      const result = adapter.createFixturePlan({
        request: { ...request, ...extra } as typeof request,
        evaluatedAt: DIRECT_SPAWN_EVALUATED_AT,
      });
      expect(result.plan.disposition).toBe("blocked_fixture_plan");
      expect(result.evidence).toMatchObject(noExecutionEvidence());
    }
  });

  test("argv validation rejects shell smuggling and unicode shell-like punctuation", () => {
    for (const argv of [
      ["--version;rm"],
      ["--version|cat"],
      ["--version&"],
      ["`version`"],
      ["$(version)"],
      ["--version\0"],
      ["--version\n"],
      ["--version\uFF1B"],
      ["--version\uFF5Ccat"],
      ["--version", "--verbose"],
      [],
    ]) {
      expectInvalid(validateExactArgvForOperation("collect_supabase_cli_version", argv));
    }
  });

  test("operation-to-tool binding cannot be substituted in either direction", () => {
    const git = fixture("collect_git_version");
    const supabase = fixture("collect_supabase_cli_version");
    const gitWithSupabase = buildDirectSpawnFixtureRequest({
      operation: "collect_git_version",
      spawnSessionCapability: git.session,
      executableAuthority: supabase.executable,
      authorizationLink: git.authorization,
    });
    const supabaseWithGit = buildDirectSpawnFixtureRequest({
      operation: "collect_supabase_cli_version",
      spawnSessionCapability: supabase.session,
      executableAuthority: git.executable,
      authorizationLink: supabase.authorization,
    });

    expect(git.adapter.createFixturePlan({ request: gitWithSupabase, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT }).plan.blockingReasons).toContain("operation_tool_mismatch");
    expect(supabase.adapter.createFixturePlan({ request: supabaseWithGit, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT }).plan.blockingReasons).toContain("operation_tool_mismatch");
  });

  test("fixture plan and compatibility never become execution readiness", () => {
    const { adapter, request } = fixture();
    const result = adapter.createFixturePlan({ request, evaluatedAt: DIRECT_SPAWN_EVALUATED_AT });
    expect(result.plan.authority).toBe("fixture_structural_only");
    expect(result.plan.completeness).toBe("complete_fixture_structure");
    expect(result.evidence).toMatchObject(noExecutionEvidence());
    expect(result.compatibility).toMatchObject({
      enablesExecution: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
    });
    expect(buildDirectSpawnCompatibilitySummary().runner).toBe("fixture_direct_spawn_plan_structurally_compatible_but_not_live_runner_enabling");
  });

  test("identity, fingerprints, sessions, and policy bindings are deterministic and field sensitive", () => {
    const git = buildDirectSpawnOperationDefinition("collect_git_version");
    const supabase = buildDirectSpawnOperationDefinition("collect_supabase_cli_version");
    expect(DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY.driverId).toBe("ture.execution.direct-spawn-driver-boundary.fixture.v1");
    expect(git.operationFingerprint).not.toBe(supabase.operationFingerprint);
    expect(git.toolIdentity).toBe("git");
    expect(supabase.toolIdentity).toBe("supabase_cli");
    expect(git.argv).toEqual(["--version"]);
    expect(supabase.argv).toEqual(["--version"]);
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
