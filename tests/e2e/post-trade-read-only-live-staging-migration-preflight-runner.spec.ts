import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPostTradeReadOnlyLivePreflightRunnerDefaultResult,
  buildPostTradeReadOnlyLivePreflightRunnerPlan,
  runPostTradeReadOnlyLiveStagingMigrationPreflightWithInjectedDependencies,
  validatePostTradeReadOnlyLivePreflightCatalogQuerySpec,
  validatePostTradeReadOnlyLivePreflightCommandSpec,
  type PostTradeReadOnlyLivePreflightCatalogAdapter,
  type PostTradeReadOnlyLivePreflightCatalogAdapterResult,
  type PostTradeReadOnlyLivePreflightCommandExecutionResult,
  type PostTradeReadOnlyLivePreflightCommandExecutor,
  type PostTradeReadOnlyLivePreflightCommandSpec,
} from "../../lib/post-trade-read-only-live-staging-migration-preflight-runner-core";
import {
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
  POST_TRADE_STAGING_MIGRATION_FILENAME,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX,
} from "../../lib/post-trade-staging-migration-deployment-gate-core";

const hash = "a".repeat(64);
const observedAtIso = "2026-07-12T12:00:00.000Z";

function commandResult(
  spec: PostTradeReadOnlyLivePreflightCommandSpec,
  stdout: string,
  overrides: Partial<PostTradeReadOnlyLivePreflightCommandExecutionResult> = {},
): PostTradeReadOnlyLivePreflightCommandExecutionResult {
  return {
    operationId: spec.operationId,
    exitClassification: "success",
    exitCode: 0,
    timedOut: false,
    signalClassification: "none",
    stdoutFingerprint: hash,
    stderrFingerprint: hash,
    stdoutByteCount: Buffer.byteLength(stdout),
    stderrByteCount: 0,
    stdoutTruncated: false,
    stderrTruncated: false,
    parserStatus: "parsed",
    observedAtIso,
    transientStdout: stdout,
    transientStderr: "",
    ...overrides,
  };
}

function stdoutFor(spec: PostTradeReadOnlyLivePreflightCommandSpec) {
  switch (spec.family) {
    case "git_repository_root":
      return "repo_root_identity_redacted\n";
    case "git_current_commit":
      return "reviewed_commit_redacted\n";
    case "git_current_branch":
      return "reviewed_branch_redacted\n";
    case "git_porcelain_status":
    case "git_staged_files":
    case "git_unstaged_files":
    case "git_untracked_files":
      return "";
    case "local_file_metadata":
      return JSON.stringify({
        fileByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
        symlinkStatus: "not_symlink",
        regularFileStatus: "regular_file",
      });
    case "local_migration_content":
      return JSON.stringify({
        sha256: POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
        fileByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
        normalizedSqlByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
      });
    case "local_migration_inventory":
      return JSON.stringify({
        allMigrationFilenames: [POST_TRADE_STAGING_MIGRATION_FILENAME],
        orderedMigrationTimestamps: [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX],
        migrationCountInProposedDeploymentUnit: 1,
      });
    case "supabase_linked_project":
      return JSON.stringify({ linkedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF });
    case "supabase_migration_history":
      return JSON.stringify({
        observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
        remoteAppliedMigrationIdentifiers: [],
      });
  }
}

function fakeExecutor(
  mutate: (spec: PostTradeReadOnlyLivePreflightCommandSpec, result: PostTradeReadOnlyLivePreflightCommandExecutionResult) => PostTradeReadOnlyLivePreflightCommandExecutionResult = (_spec, result) => result,
): { executor: PostTradeReadOnlyLivePreflightCommandExecutor; calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    executor: async (spec) => {
      calls.push(spec.operationId);
      return mutate(spec, commandResult(spec, stdoutFor(spec)));
    },
  };
}

function catalogResult(
  queryId: PostTradeReadOnlyLivePreflightCatalogAdapterResult["queryId"],
  overrides: Partial<PostTradeReadOnlyLivePreflightCatalogAdapterResult> = {},
): PostTradeReadOnlyLivePreflightCatalogAdapterResult {
  return {
    queryId,
    resultClassification: "success",
    observedAtIso,
    evidenceFingerprint: hash,
    targetRelationAbsent: true,
    conflictingRelationKind: "none",
    targetIndexesExist: false,
    targetPoliciesExist: false,
    targetFunctionOrTriggerExists: false,
    referencedExecutionRecordsTableExists: true,
    referencedAuditEventsTableExists: true,
    referencedPrimaryKeyColumnsExist: true,
    referencedPrimaryKeyTypesMatchUuid: true,
    referencedObjectsInPublicSchema: true,
    uuidGenerationAvailable: true,
    anonGrantsClassification: "compatible",
    authenticatedGrantsClassification: "compatible",
    schemaUsageContext: "compatible",
    defaultPrivilegeObservations: "compatible",
    expectedOwnershipContext: "compatible",
    serviceRoleConsideration: "service_role_bypass_operational_risk_remains",
    rlsCapabilityAvailability: "available",
    ...overrides,
  };
}

function fakeCatalogAdapter(
  mutate: (result: PostTradeReadOnlyLivePreflightCatalogAdapterResult) => PostTradeReadOnlyLivePreflightCatalogAdapterResult = (result) => result,
): { adapter: PostTradeReadOnlyLivePreflightCatalogAdapter; calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    adapter: async (spec) => {
      calls.push(spec.queryId);
      return mutate(catalogResult(spec.queryId));
    },
  };
}

async function runValidFixture() {
  const executor = fakeExecutor();
  const catalog = fakeCatalogAdapter();
  const result = await runPostTradeReadOnlyLiveStagingMigrationPreflightWithInjectedDependencies({
    executor: executor.executor,
    catalogAdapter: catalog.adapter,
  });
  return { result, executor, catalog };
}

function cloneSpec(spec: PostTradeReadOnlyLivePreflightCommandSpec, patch: Partial<PostTradeReadOnlyLivePreflightCommandSpec>) {
  return { ...spec, ...patch } as unknown;
}

test.describe("post-trade read-only live staging migration preflight runner", () => {
  test("runner default state is not run and construction/import performs no command", () => {
    const result = buildPostTradeReadOnlyLivePreflightRunnerDefaultResult();
    const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();
    const boundarySource = readFileSync(
      join(process.cwd(), "lib/post-trade-read-only-live-staging-migration-preflight-runner.ts"),
      "utf8",
    );

    expect(result.runnerStatus).toBe("not_run");
    expect(result.evidenceCollected).toBe(false);
    expect(result.liveProjectVerified).toBe(false);
    expect(result.liveWorktreeVerified).toBe(false);
    expect(result.deploymentEnabled).toBe(false);
    expect(result.deploymentStatus).toBe("not_deployed");
    expect(result.remoteMutation).toBe(false);
    expect(result.sqlExecuted).toBe(false);
    expect(result.migrationsApplied).toBe(0);
    expect(result.rowsCreated).toBe(0);
    expect(plan.runnerStatus).toBe("not_run");
    expect(boundarySource).toContain('import "server-only"');
    expect(boundarySource).not.toMatch(/child_process|execSync|spawnSync|createClient|insert\(|upsert\(|rpc\(/);
  });

  test("inert plan contains exact read-only reviewed operations and no deployment, mutation, SQL, production target, or secrets", () => {
    const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();
    const serialized = JSON.stringify(plan);

    expect(plan.operations.map((item) => item.operationId)).toEqual([
      "preflight_git_repository_root",
      "preflight_git_current_commit",
      "preflight_git_current_branch",
      "preflight_git_porcelain_status",
      "preflight_git_staged_files",
      "preflight_git_unstaged_files",
      "preflight_git_untracked_files",
      "preflight_local_file_metadata",
      "preflight_local_migration_content",
      "preflight_local_migration_inventory",
      "preflight_supabase_linked_project",
      "preflight_supabase_migration_history",
    ]);
    expect(plan.operations.every((item) => item.readOnly)).toBe(true);
    expect(plan.catalogQueries.every((item) => item.readOnly && !item.acceptsRawSql && !item.permitsMutation)).toBe(true);
    expect(plan.operations.map((item) => item.operationId).join(" ")).not.toMatch(/deploy|db push|migration up|migration repair|db reset|insert|update|delete|upsert|rpc/i);
    expect(serialized).not.toMatch(/service_role_key|service_role_token|password|access token|refresh token|postgres:\/\//i);
    expect(serialized).not.toContain(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF);
  });

  test("valid fixture set can produce ready preflight result while remaining deployment-disabled and no-write", async () => {
    const { result, executor, catalog } = await runValidFixture();

    expect(result.sanitizedBlockingReasons).toEqual([]);
    expect(result.runnerStatus).toBe("ready_for_explicit_staging_deployment_action");
    expect(result.preflightDecision?.decisionClassification).toBe("ready_for_explicit_staging_deployment_action");
    expect(result.preflightDecision?.evidenceSessionId).toBe("post_trade_read_only_live_preflight_session_001");
    expect(result.deploymentEnabled).toBe(false);
    expect(result.deploymentStatus).toBe("not_deployed");
    expect(result.remoteMutation).toBe(false);
    expect(result.sqlExecuted).toBe(false);
    expect(result.migrationsApplied).toBe(0);
    expect(result.rowsCreated).toBe(0);
    expect(result.commandExecutionCount).toBe(12);
    expect(result.catalogQueryCount).toBe(9);
    expect(executor.calls).toHaveLength(12);
    expect(catalog.calls).toHaveLength(9);
    expect(JSON.stringify(result)).not.toMatch(/repo_root_identity_redacted|linkedProjectRef|raw stdout|raw stderr|postgres:\/\//i);
  });

  test("repeated inert planning and fixture execution are deterministic and side-effect free", async () => {
    expect(buildPostTradeReadOnlyLivePreflightRunnerPlan()).toEqual(buildPostTradeReadOnlyLivePreflightRunnerPlan());
    const first = await runValidFixture();
    const second = await runValidFixture();
    expect(first.result).toEqual(second.result);
  });

  const firstSpec = () => buildPostTradeReadOnlyLivePreflightRunnerPlan().operations[0]!;
  const supabaseSpec = () => buildPostTradeReadOnlyLivePreflightRunnerPlan().operations.find((item) => item.executable === "supabase")!;
  const catalogSpec = () => buildPostTradeReadOnlyLivePreflightRunnerPlan().catalogQueries[0]!;

  const commandValidationCases: { name: string; patch: Partial<PostTradeReadOnlyLivePreflightCommandSpec>; expected: string }[] = [
    { name: "command string input is blocked", patch: { args: "git status" as never }, expected: "arguments_not_array" },
    { name: "shell mode is blocked", patch: { shellMode: true } as never, expected: "unknown_command_spec_key:shellMode" },
    { name: "arbitrary executable path is blocked", patch: { executable: "/usr/bin/git" as never }, expected: "unknown_executable" },
    { name: "unknown command family is blocked", patch: { family: "unknown" as never }, expected: "unknown_command_family" },
    { name: "unknown executable is blocked", patch: { executable: "supabase" }, expected: "unknown_executable" },
    { name: "unknown operation id is blocked", patch: { operationId: "unknown" }, expected: "unknown_operation_id" },
    { name: "unknown subcommand is blocked", patch: { args: ["bad"] }, expected: "unknown_subcommand_or_argument" },
    { name: "unknown flag is blocked", patch: { args: ["rev-parse", "--show-toplevel", "--bad"] }, expected: "unknown_subcommand_or_argument" },
    { name: "duplicate flag is blocked", patch: { args: ["rev-parse", "--show-toplevel", "--show-toplevel"] }, expected: "unknown_subcommand_or_argument" },
    { name: "reordered fixed args are blocked", patch: { args: ["--show-toplevel", "rev-parse"] }, expected: "unknown_subcommand_or_argument" },
    { name: "arbitrary positional argument is blocked", patch: { args: ["rev-parse", "HEAD~1"] }, expected: "unknown_subcommand_or_argument" },
    { name: "empty argument is blocked", patch: { args: ["rev-parse", ""] }, expected: "unsafe_argument" },
    { name: "padded argument is blocked", patch: { args: ["rev-parse", " --show-toplevel"] }, expected: "unsafe_argument" },
    { name: "semicolon injection is blocked", patch: { args: ["rev-parse", "--show-toplevel;rm"] }, expected: "unknown_subcommand_or_argument" },
    { name: "pipe injection is blocked", patch: { args: ["rev-parse", "--show-toplevel|cat"] }, expected: "unknown_subcommand_or_argument" },
    { name: "redirection is blocked", patch: { args: ["rev-parse", "--show-toplevel>out"] }, expected: "unknown_subcommand_or_argument" },
    { name: "logical-and is blocked", patch: { args: ["rev-parse", "--show-toplevel&&bad"] }, expected: "unknown_subcommand_or_argument" },
    { name: "logical-or is blocked", patch: { args: ["rev-parse", "--show-toplevel||bad"] }, expected: "unknown_subcommand_or_argument" },
    { name: "backtick is blocked", patch: { args: ["rev-parse", "`pwd`"] }, expected: "unknown_subcommand_or_argument" },
    { name: "command substitution is blocked", patch: { args: ["rev-parse", "$(pwd)"] }, expected: "unknown_subcommand_or_argument" },
    { name: "environment interpolation is blocked", patch: { args: ["rev-parse", "${HOME}"] }, expected: "unknown_subcommand_or_argument" },
    { name: "newline injection is blocked", patch: { args: ["rev-parse", "--show-toplevel\nbad"] }, expected: "unknown_subcommand_or_argument" },
    { name: "carriage return is blocked", patch: { args: ["rev-parse", "--show-toplevel\rbad"] }, expected: "unknown_subcommand_or_argument" },
    { name: "NUL injection is blocked", patch: { args: ["rev-parse", "--show-toplevel\u0000"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Unicode separator is blocked", patch: { args: ["rev-parse", "--show-toplevel\u2028bad"] }, expected: "unknown_subcommand_or_argument" },
    { name: "wildcard is blocked", patch: { args: ["rev-parse", "*"] }, expected: "unknown_subcommand_or_argument" },
    { name: "home expansion is blocked", patch: { args: ["rev-parse", "~/repo"] }, expected: "unknown_subcommand_or_argument" },
    { name: "URL argument is blocked", patch: { args: ["rev-parse", "https://example.invalid/repo"] }, expected: "unknown_subcommand_or_argument" },
    { name: "token-like argument is blocked", patch: { args: ["rev-parse", "access_token=x"] }, expected: "unknown_subcommand_or_argument" },
    { name: "production project argument is blocked", patch: { args: ["status", "--linked", POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF] }, expected: "unknown_subcommand_or_argument" },
    { name: "alternate project argument is blocked", patch: { args: ["status", "--linked", "abcdefghijklmnopqrst"] }, expected: "unknown_subcommand_or_argument" },
    { name: "arbitrary env key is blocked", patch: { env: { X: "Y" } } as never, expected: "unknown_command_spec_key:env" },
    { name: "service-role env key is blocked", patch: { SUPABASE_SERVICE_ROLE_KEY: "x" } as never, expected: "unknown_command_spec_key:SUPABASE_SERVICE_ROLE_KEY" },
    { name: "password env key is blocked", patch: { DATABASE_PASSWORD: "x" } as never, expected: "unknown_command_spec_key:DATABASE_PASSWORD" },
    { name: "connection env key is blocked", patch: { DATABASE_URL: "x" } as never, expected: "unknown_command_spec_key:DATABASE_URL" },
    { name: "inherited full environment is blocked", patch: { inheritEnv: true } as never, expected: "unknown_command_spec_key:inheritEnv" },
    { name: "stdin enabled is blocked", patch: { stdinPolicy: "open" as never }, expected: "stdin_not_closed" },
    { name: "interactive TTY enabled is blocked", patch: { tty: true } as never, expected: "unknown_command_spec_key:tty" },
    { name: "caller-raised timeout is blocked", patch: { timeoutMs: 999_999 }, expected: "invalid_timeout" },
    { name: "caller-raised stdout limit is blocked", patch: { maxStdoutBytes: 999_999 }, expected: "invalid_stdout_limit" },
    { name: "caller-raised stderr limit is blocked", patch: { maxStderrBytes: 999_999 }, expected: "invalid_stderr_limit" },
    { name: "parser identity tampering is blocked", patch: { parserIdentity: "generic_parser" }, expected: "invalid_parser_identity" },
    { name: "expected output tampering is blocked", patch: { expectedOutputClassification: "supabase_project_status" }, expected: "invalid_expected_output_classification" },
    { name: "evidence category tampering is blocked", patch: { evidenceCategory: "project" }, expected: "invalid_evidence_category" },
    { name: "arbitrary working directory is blocked", patch: { workingDirectoryIdentity: "other" as never }, expected: "invalid_working_directory" },
    { name: "absolute working directory is blocked", patch: { workingDirectoryIdentity: "/tmp/repo" as never }, expected: "invalid_working_directory" },
    { name: "traversal working directory is blocked", patch: { workingDirectoryIdentity: "../repo" as never }, expected: "invalid_working_directory" },
    { name: "Git config override is blocked", patch: { args: ["-c", "core.pager=cat", "status"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git push is blocked", patch: { args: ["push"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git pull is blocked", patch: { args: ["pull"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git fetch is blocked", patch: { args: ["fetch"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git reset is blocked", patch: { args: ["reset", "--hard"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git clean is blocked", patch: { args: ["clean", "-fd"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git checkout is blocked", patch: { args: ["checkout", "main"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git switch is blocked", patch: { args: ["switch", "main"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git commit is blocked", patch: { args: ["commit", "-m", "x"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git add is blocked", patch: { args: ["add", "."] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git restore mutation is blocked", patch: { args: ["restore", "."] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git stash is blocked", patch: { args: ["stash"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git merge is blocked", patch: { args: ["merge", "main"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git rebase is blocked", patch: { args: ["rebase", "main"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git cherry-pick is blocked", patch: { args: ["cherry-pick", "HEAD"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git revert is blocked", patch: { args: ["revert", "HEAD"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git clone is blocked", patch: { args: ["clone", "x"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git update-index is blocked", patch: { args: ["update-index", "--assume-unchanged", "x"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git apply is blocked", patch: { args: ["apply", "x.patch"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Git gc is blocked", patch: { args: ["gc"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase db push is blocked", patch: { args: ["db", "push"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase migration up is blocked", patch: { args: ["migration", "up"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase migration repair is blocked", patch: { args: ["migration", "repair"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase db reset is blocked", patch: { args: ["db", "reset"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase link is blocked", patch: { args: ["link", "--project-ref", POST_TRADE_STAGING_MIGRATION_PROJECT_REF] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase unlink is blocked", patch: { args: ["unlink"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase function deploy is blocked", patch: { args: ["functions", "deploy", "x"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase secrets mutation is blocked", patch: { args: ["secrets", "set", "X=Y"] }, expected: "unknown_subcommand_or_argument" },
    { name: "Supabase arbitrary flag is blocked", patch: { args: ["status", "--linked", "--debug"] }, expected: "unknown_subcommand_or_argument" },
  ];

  for (const item of commandValidationCases) {
    test(item.name, () => {
      const base = item.name.startsWith("Supabase") || item.name.includes("project argument") ? supabaseSpec() : firstSpec();
      expect(validatePostTradeReadOnlyLivePreflightCommandSpec(cloneSpec(base, item.patch))).toContain(item.expected);
    });
  }

  test("catalog adapter rejects raw SQL, dynamic target, mutation query, RPC, multi-statement, and production target", () => {
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), queryId: "select * from x" })).toContain("unknown_query_identity");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), acceptsRawSql: true })).toContain("unsafe_catalog_acceptsRawSql");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), acceptsArbitraryTable: true })).toContain("unsafe_catalog_acceptsArbitraryTable");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), permitsMutation: true })).toContain("unsafe_catalog_permitsMutation");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), permitsRpc: true })).toContain("unsafe_catalog_permitsRpc");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), permitsMultipleStatements: true })).toContain("unsafe_catalog_permitsMultipleStatements");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), acceptsCallerProvidedSql: true })).toContain("unsafe_catalog_acceptsCallerProvidedSql");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), acceptsArbitrarySchema: true })).toContain("unsafe_catalog_acceptsArbitrarySchema");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), permitsTransactionControl: true })).toContain("unsafe_catalog_permitsTransactionControl");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), timeoutMs: 999_999 })).toContain("invalid_catalog_timeout");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), rawSql: "select 1" })).toContain("unknown_catalog_query_key:rawSql");
    expect(validatePostTradeReadOnlyLivePreflightCatalogQuerySpec({ ...catalogSpec(), targetProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF })).toContain("non_staging_catalog_target");
  });

  const executionCases: { name: string; mutate: Parameters<typeof fakeExecutor>[0]; status: string }[] = [
    { name: "missing mandatory executor result is blocked", mutate: (spec, value) => ({ ...value, operationId: `${spec.operationId}_missing` }), status: "ambiguous" },
    { name: "timeout is ambiguous", mutate: (_spec, value) => ({ ...value, exitClassification: "timeout", timedOut: true }), status: "ambiguous" },
    { name: "stdout overflow is ambiguous", mutate: (_spec, value) => ({ ...value, stdoutByteCount: 999_999 }), status: "ambiguous" },
    { name: "stderr overflow is ambiguous", mutate: (_spec, value) => ({ ...value, stderrByteCount: 999_999 }), status: "ambiguous" },
    { name: "truncated stdout is ambiguous", mutate: (_spec, value) => ({ ...value, stdoutTruncated: true }), status: "ambiguous" },
    { name: "truncated stderr is ambiguous", mutate: (_spec, value) => ({ ...value, stderrTruncated: true }), status: "ambiguous" },
    { name: "malformed Git root output is blocked", mutate: (spec, value) => spec.family === "git_repository_root" ? { ...value, transientStdout: "one\ntwo\n" } : value, status: "blocked" },
    { name: "malformed commit output is blocked", mutate: (spec, value) => spec.family === "git_current_commit" ? { ...value, transientStdout: "one\ntwo\n" } : value, status: "blocked" },
    { name: "malformed branch output is blocked", mutate: (spec, value) => spec.family === "git_current_branch" ? { ...value, transientStdout: "one\ntwo\n" } : value, status: "blocked" },
    { name: "ANSI sequence is blocked", mutate: (spec, value) => spec.family === "git_current_commit" ? { ...value, transientStdout: "\u001b[31mcommit\u001b[0m\n" } : value, status: "ambiguous" },
    { name: "warning banner is blocked", mutate: (spec, value) => spec.family === "git_current_commit" ? { ...value, transientStdout: "warning: using fallback\nreviewed_commit_redacted\n" } : value, status: "blocked" },
    { name: "malformed porcelain status is blocked", mutate: (spec, value) => spec.family === "git_porcelain_status" ? { ...value, parserStatus: "malformed" } : value, status: "ambiguous" },
    { name: "unknown Git status code is blocked", mutate: (spec, value) => spec.family === "git_porcelain_status" ? { ...value, parserStatus: "blocked" } : value, status: "ambiguous" },
    { name: "conflicted path is blocked", mutate: (spec, value) => spec.family === "git_porcelain_status" ? { ...value, parserStatus: "blocked", transientStdout: "UU file.ts\n" } : value, status: "ambiguous" },
    { name: "renamed target migration is blocked", mutate: (spec, value) => spec.family === "git_porcelain_status" ? { ...value, parserStatus: "blocked", transientStdout: `R  old.sql -> ${POST_TRADE_STAGING_MIGRATION_PATH}\n` } : value, status: "ambiguous" },
    { name: "copied target migration is blocked", mutate: (spec, value) => spec.family === "git_porcelain_status" ? { ...value, parserStatus: "blocked", transientStdout: `C  old.sql -> ${POST_TRADE_STAGING_MIGRATION_PATH}\n` } : value, status: "ambiguous" },
    { name: "deleted target migration is blocked", mutate: (spec, value) => spec.family === "git_porcelain_status" ? { ...value, parserStatus: "blocked", transientStdout: ` D ${POST_TRADE_STAGING_MIGRATION_PATH}\n` } : value, status: "ambiguous" },
    { name: "quoted ambiguous path is blocked", mutate: (spec, value) => spec.family === "git_untracked_files" ? { ...value, transientStdout: "\"quoted path\"\n" } : value, status: "blocked" },
    { name: "unsafe escape path is blocked", mutate: (spec, value) => spec.family === "git_untracked_files" ? { ...value, transientStdout: "dir/%2e%2e/x\n" } : value, status: "blocked" },
    { name: "submodule ambiguity is blocked", mutate: (spec, value) => spec.family === "git_porcelain_status" ? { ...value, parserStatus: "blocked", transientStdout: " M submodule\n" } : value, status: "ambiguous" },
    { name: "unsafe path is blocked", mutate: (spec, value) => spec.family === "git_untracked_files" ? { ...value, transientStdout: "../x\n" } : value, status: "blocked" },
    { name: "migration symlink is blocked", mutate: (spec, value) => spec.family === "local_file_metadata" ? { ...value, transientStdout: JSON.stringify({ fileByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH, symlinkStatus: "symlink", regularFileStatus: "regular_file" }) } : value, status: "blocked" },
    { name: "migration non-regular file is blocked", mutate: (spec, value) => spec.family === "local_file_metadata" ? { ...value, transientStdout: JSON.stringify({ fileByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH, symlinkStatus: "not_symlink", regularFileStatus: "not_regular_file" }) } : value, status: "blocked" },
    { name: "migration hash mismatch is blocked", mutate: (spec, value) => spec.family === "local_migration_content" ? { ...value, transientStdout: JSON.stringify({ sha256: "b".repeat(64), fileByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH, normalizedSqlByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH }) } : value, status: "blocked" },
    { name: "migration-length mismatch is blocked", mutate: (spec, value) => spec.family === "local_migration_content" ? { ...value, transientStdout: JSON.stringify({ sha256: POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT, fileByteLength: 1, normalizedSqlByteLength: 1 }) } : value, status: "blocked" },
    { name: "inventory duplicate timestamp is blocked", mutate: (spec, value) => spec.family === "local_migration_inventory" ? { ...value, transientStdout: JSON.stringify({ allMigrationFilenames: [POST_TRADE_STAGING_MIGRATION_FILENAME], orderedMigrationTimestamps: [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX, POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX], migrationCountInProposedDeploymentUnit: 1 }) } : value, status: "blocked" },
    { name: "inventory duplicate filename is blocked", mutate: (spec, value) => spec.family === "local_migration_inventory" ? { ...value, transientStdout: JSON.stringify({ allMigrationFilenames: [POST_TRADE_STAGING_MIGRATION_FILENAME, POST_TRADE_STAGING_MIGRATION_FILENAME], orderedMigrationTimestamps: [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX], migrationCountInProposedDeploymentUnit: 1 }) } : value, status: "blocked" },
    { name: "malformed migration filename is blocked", mutate: (spec, value) => spec.family === "local_migration_inventory" ? { ...value, transientStdout: JSON.stringify({ allMigrationFilenames: ["bad-name.sql"], orderedMigrationTimestamps: [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX], migrationCountInProposedDeploymentUnit: 1 }) } : value, status: "blocked" },
    { name: "extra deployment migration is blocked", mutate: (spec, value) => spec.family === "local_migration_inventory" ? { ...value, transientStdout: JSON.stringify({ allMigrationFilenames: [POST_TRADE_STAGING_MIGRATION_FILENAME], orderedMigrationTimestamps: [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX], migrationsNewerThanTarget: ["20260711000000_extra.sql"], migrationCountInProposedDeploymentUnit: 2 }) } : value, status: "blocked" },
    { name: "malformed linked-project output is blocked", mutate: (spec, value) => spec.family === "supabase_linked_project" ? { ...value, parserStatus: "malformed" } : value, status: "ambiguous" },
    { name: "production linked project is blocked", mutate: (spec, value) => spec.family === "supabase_linked_project" ? { ...value, transientStdout: JSON.stringify({ linkedProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF }) } : value, status: "blocked" },
    { name: "alternate linked project is blocked", mutate: (spec, value) => spec.family === "supabase_linked_project" ? { ...value, transientStdout: JSON.stringify({ linkedProjectRef: "abcdefghijklmnopqrst" }) } : value, status: "blocked" },
    { name: "missing linked project is blocked", mutate: (spec, value) => spec.family === "supabase_linked_project" ? { ...value, transientStdout: JSON.stringify({}) } : value, status: "blocked" },
    { name: "generic verified output is blocked", mutate: (spec, value) => spec.family === "supabase_linked_project" ? { ...value, transientStdout: JSON.stringify({ verified: true }) } : value, status: "blocked" },
    { name: "environment-only output is blocked", mutate: (spec, value) => spec.family === "supabase_linked_project" ? { ...value, transientStdout: JSON.stringify({ environment: "staging" }) } : value, status: "blocked" },
    { name: "login prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "login required" }), status: "ambiguous" },
    { name: "browser-auth prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "browser authentication required" }), status: "ambiguous" },
    { name: "device-code prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "enter device code" }), status: "ambiguous" },
    { name: "password prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "Password:" }), status: "ambiguous" },
    { name: "token prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "Access token:" }), status: "ambiguous" },
    { name: "project-link prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "link project?" }), status: "ambiguous" },
    { name: "migration-confirmation prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "confirm apply migration" }), status: "ambiguous" },
    { name: "MFA prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "MFA required" }), status: "ambiguous" },
    { name: "press-enter prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "Press Enter to continue" }), status: "ambiguous" },
    { name: "login URL prompt is blocked", mutate: (_spec, value) => ({ ...value, transientStderr: "Open https://example.invalid/login to authenticate" }), status: "ambiguous" },
    { name: "malformed migration history is blocked", mutate: (spec, value) => spec.family === "supabase_migration_history" ? { ...value, parserStatus: "malformed" } : value, status: "ambiguous" },
    { name: "truncated migration history is ambiguous", mutate: (spec, value) => spec.family === "supabase_migration_history" ? { ...value, stdoutTruncated: true } : value, status: "ambiguous" },
    { name: "history timeout is ambiguous", mutate: (spec, value) => spec.family === "supabase_migration_history" ? { ...value, timedOut: true, exitClassification: "timeout" } : value, status: "ambiguous" },
    { name: "target already applied is classified separately", mutate: (spec, value) => spec.family === "supabase_migration_history" ? { ...value, transientStdout: JSON.stringify({ observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF, remoteAppliedMigrationIdentifiers: [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX] }) } : value, status: "already_applied" },
    { name: "history divergence is blocked", mutate: (spec, value) => spec.family === "supabase_migration_history" ? { ...value, transientStdout: JSON.stringify({ observedProjectRef: "abcdefghijklmnopqrst", remoteAppliedMigrationIdentifiers: [] }) } : value, status: "blocked" },
    { name: "executor output containing access token is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "access token leaked" }), status: "ambiguous" },
    { name: "executor output containing service-role key is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "service_role_key" }), status: "ambiguous" },
    { name: "executor output containing password is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "database password" }), status: "ambiguous" },
    { name: "executor output containing connection string is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "postgres://example" }), status: "ambiguous" },
    { name: "executor output containing authorization header is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "Authorization: Bearer x" }), status: "ambiguous" },
    { name: "executor output containing bearer token is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "Bearer abc.def.ghi" }), status: "ambiguous" },
    { name: "executor output containing cookie is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "cookie=x" }), status: "ambiguous" },
    { name: "executor output containing session is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "session=x" }), status: "ambiguous" },
    { name: "executor output containing private key is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "private key" }), status: "ambiguous" },
    { name: "executor output containing client secret is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "client_secret=x" }), status: "ambiguous" },
    { name: "executor output containing JWT-like material is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "eyJabc.def.ghi" }), status: "ambiguous" },
    { name: "raw environment dump is blocked", mutate: (_spec, value) => ({ ...value, rawEnvironment: "x" } as never), status: "ambiguous" },
    { name: "personal absolute home path is blocked", mutate: (_spec, value) => ({ ...value, transientStdout: "/Users/example" }), status: "ambiguous" },
  ];

  for (const item of executionCases) {
    test(item.name, async () => {
      const executor = fakeExecutor(item.mutate);
      const catalog = fakeCatalogAdapter();
      const result = await runPostTradeReadOnlyLiveStagingMigrationPreflightWithInjectedDependencies({
        executor: executor.executor,
        catalogAdapter: catalog.adapter,
      });
      expect(result.runnerStatus).toBe(item.status);
      expect(result.deploymentEnabled).toBe(false);
      expect(result.sqlExecuted).toBe(false);
      expect(result.remoteMutation).toBe(false);
      expect(result.rowsCreated).toBe(0);
    });
  }

  const catalogCases: { name: string; mutate: Parameters<typeof fakeCatalogAdapter>[0]; status: string }[] = [
    { name: "missing catalog adapter result is blocked", mutate: (value) => ({ ...value, queryId: "target_relation_absence" as never, resultClassification: "missing" }), status: "ambiguous" },
    { name: "malformed catalog result is blocked", mutate: (value) => ({ ...value, resultClassification: "malformed" }), status: "ambiguous" },
    { name: "generic catalog success boolean is blocked", mutate: (value) => ({ ...value, genericSuccess: true } as never), status: "ambiguous" },
    { name: "missing target-absence observation is blocked", mutate: (value) => value.queryId === "target_relation_absence" ? ({ ...value, targetRelationAbsent: undefined } as never) : value, status: "ambiguous" },
    { name: "catalog timeout is ambiguous", mutate: (value) => ({ ...value, resultClassification: "timeout" }), status: "ambiguous" },
    { name: "target table conflict is blocked", mutate: (value) => value.queryId === "target_relation_absence" ? { ...value, targetRelationAbsent: false } : value, status: "blocked" },
    { name: "dependency missing is blocked", mutate: (value) => value.queryId === "referenced_table_existence" ? { ...value, referencedExecutionRecordsTableExists: false } : value, status: "blocked" },
    { name: "dependency type mismatch is blocked", mutate: (value) => value.queryId === "referenced_pk_type_verification" ? { ...value, referencedPrimaryKeyTypesMatchUuid: false } : value, status: "blocked" },
    { name: "privilege result missing is blocked", mutate: (value) => value.queryId === "anon_authenticated_grants" ? { ...value, resultClassification: "missing" } : value, status: "ambiguous" },
    { name: "unexpected anon grant is blocked", mutate: (value) => value.queryId === "anon_authenticated_grants" ? { ...value, anonGrantsClassification: "too_broad" } : value, status: "blocked" },
    { name: "unexpected authenticated grant is blocked", mutate: (value) => value.queryId === "anon_authenticated_grants" ? { ...value, authenticatedGrantsClassification: "too_broad" } : value, status: "blocked" },
    { name: "service-role risk remains documented", mutate: (value) => value.queryId === "ownership_rls_capability" ? { ...value, serviceRoleConsideration: "service_role_bypass_operational_risk_remains" } : value, status: "ready_for_explicit_staging_deployment_action" },
  ];

  for (const item of catalogCases) {
    test(item.name, async () => {
      const executor = fakeExecutor();
      const catalog = fakeCatalogAdapter(item.mutate);
      const result = await runPostTradeReadOnlyLiveStagingMigrationPreflightWithInjectedDependencies({
        executor: executor.executor,
        catalogAdapter: catalog.adapter,
      });
      expect(result.runnerStatus).toBe(item.status);
      expect(result.deploymentEnabled).toBe(false);
      expect(result.sqlExecuted).toBe(false);
      expect(result.rowsCreated).toBe(0);
    });
  }

  test("source files contain no real child process, Git/Supabase execution, SQL execution, persistence, API/UI wiring, or execution adapter invocation", () => {
    const core = readFileSync(
      join(process.cwd(), "lib/post-trade-read-only-live-staging-migration-preflight-runner-core.ts"),
      "utf8",
    );
    const boundary = readFileSync(
      join(process.cwd(), "lib/post-trade-read-only-live-staging-migration-preflight-runner.ts"),
      "utf8",
    );
    const api = readFileSync(join(process.cwd(), "app/api/post-trade/payload/validate/route.ts"), "utf8");
    const tradeUi = readFileSync(join(process.cwd(), "app/trade-app.tsx"), "utf8");
    const source = `${core}\n${boundary}`;

    expect(source).not.toMatch(/child_process|node:child_process|spawn\(|exec\(|execFile\(|createClient\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(|\.rpc\(|db push|migration up|migration repair|db reset|consumeReadiness|persistEvidence|deployMigration/i);
    expect(api).not.toContain("post-trade-read-only-live-staging-migration-preflight-runner");
    expect(tradeUi).not.toContain("post-trade-read-only-live-staging-migration-preflight-runner");
  });

  test("runner report contains no secret, no raw command output, no raw stdout, and no raw stderr", async () => {
    const { result } = await runValidFixture();
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/transientStdout|transientStderr|raw stdout|raw stderr|access token|service_role_key|service_role_token|password|cookie=|session=|private key|postgres:\/\//i);
    expect(serialized).not.toContain(POST_TRADE_STAGING_MIGRATION_PATH);
  });
});
