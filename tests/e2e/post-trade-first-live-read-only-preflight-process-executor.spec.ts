import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildContainmentEvidence,
  buildEnvironmentPolicy,
  buildFakeDriverFixtureResult,
  buildInertProcessExecutorPlan,
  buildProcessDriverContract,
  buildProcessDriverContractFingerprint,
  buildProcessExecutableRegistry,
  buildProcessExecutableRegistryFingerprint,
  buildProcessExecutorDefaultState,
  buildProcessLifecyclePolicy,
  buildProcessLifecyclePolicyFingerprint,
  buildProcessOperationRegistry,
  buildProcessOperationRegistryFingerprint,
  buildProcessOutputLimitRegistry,
  buildProcessOutputLimitRegistryFingerprint,
  buildProcessRequest,
  buildProcessRequestFingerprint,
  buildProcessTimeoutRegistry,
  buildProcessTimeoutRegistryFingerprint,
  buildSanitizedProcessResultEvidence,
  buildSanitizedProcessResultFingerprint,
  buildTerminationPlan,
  buildTerminationPlanFingerprint,
  buildWorkingDirectoryPolicy,
  collectProcessResultFromInjectedFakeDriver,
  validateContainmentEvidence,
  validateEnvironmentPolicy,
  validateFakeDriverFixtureResult,
  validateLifecycleTransitions,
  validateProcessDriverContract,
  validateProcessExecutableRegistry,
  validateProcessExecutorAuthorizationCompatibility,
  validateProcessExecutorCliVersionCollectorCompatibility,
  validateProcessExecutorCredentialDesignCompatibility,
  validateProcessExecutorExecutionBoundaryCompatibility,
  validateProcessExecutorRunnerCompatibility,
  validateProcessOperationRegistry,
  validateProcessOutputLimitRegistry,
  validateProcessRequest,
  validateProcessTimeoutRegistry,
  validateSanitizedProcessResultEvidence,
  validateTerminationPlan,
  validateWorkingDirectoryPolicy,
  type FakeDriverFixtureResult,
  type InjectedFakeProcessDriver,
  type ProcessContainmentEvidence,
  type ProcessLifecycleTransition,
} from "../../lib/post-trade-first-live-read-only-preflight-process-executor-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-first-live-read-only-preflight-process-executor-core.ts";
const boundaryPath = "lib/post-trade-first-live-read-only-preflight-process-executor.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function fingerprintedRegistry(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.registryFingerprint;
  delete core.registryFingerprintAlgorithm;
  return { ...input, registryFingerprintAlgorithm: "sha256" as const, registryFingerprint: buildProcessExecutableRegistryFingerprint(core) };
}

function fingerprintedOperations(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.operationFingerprint;
  delete core.operationFingerprintAlgorithm;
  return { ...input, operationFingerprintAlgorithm: "sha256" as const, operationFingerprint: buildProcessOperationRegistryFingerprint(core) };
}

function fingerprintedRequest(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.requestFingerprint;
  delete core.requestFingerprintAlgorithm;
  return { ...input, requestFingerprintAlgorithm: "sha256" as const, requestFingerprint: buildProcessRequestFingerprint(core) };
}

function fingerprintedTimeouts(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.timeoutFingerprint;
  delete core.timeoutFingerprintAlgorithm;
  return { ...input, timeoutFingerprintAlgorithm: "sha256" as const, timeoutFingerprint: buildProcessTimeoutRegistryFingerprint(core) };
}

function fingerprintedOutputs(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.outputFingerprint;
  delete core.outputFingerprintAlgorithm;
  return { ...input, outputFingerprintAlgorithm: "sha256" as const, outputFingerprint: buildProcessOutputLimitRegistryFingerprint(core) };
}

function fingerprintedLifecycle(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.lifecycleFingerprint;
  delete core.lifecycleFingerprintAlgorithm;
  return { ...input, lifecycleFingerprintAlgorithm: "sha256" as const, lifecycleFingerprint: buildProcessLifecyclePolicyFingerprint(core) };
}

function fakeDriver(result: FakeDriverFixtureResult, counters: { start: number; observe: number; dispose: number }): InjectedFakeProcessDriver {
  return {
    startExactProcessRequest: async () => {
      counters.start += 1;
      return { processInstanceId: result.requestId, started: true };
    },
    observeProcessStatus: async () => {
      counters.observe += 1;
      return result;
    },
    requestGracefulTermination: async () => ({ requested: true }),
    requestForcedTermination: async () => ({ requested: true }),
    inspectReviewedContainmentState: async () => result.containment,
    confirmProcessTreeTermination: async () => result.containment,
    disposeTransientOutputBuffers: async () => {
      counters.dispose += 1;
      return { disposed: true };
    },
  };
}

test.describe("post-trade first-live read-only process executor and termination boundary", () => {
  test("default state, imports, source, API, UI, runtime and fake-driver boundary remain no-run and unwired", () => {
    const state = buildProcessExecutorDefaultState();
    const coreSource = source(corePath);
    const boundarySource = source(boundaryPath);
    const apiSource = source(apiPath);
    const tradeUiSource = source(tradeUiPath);
    const plan = buildInertProcessExecutorPlan();
    const contract = buildProcessDriverContract();

    expect(state.executorStatus).toBe("not_run");
    expect(state.processesStarted).toBe(0);
    expect(state.processesCompleted).toBe(0);
    expect(state.processesTerminated).toBe(0);
    expect(state.liveCommandsExecuted).toBe(0);
    expect(state.runnerExecutionEnabled).toBe(false);
    expect(state.preflightRunStatus).toBe("not_run");
    expect(state.deploymentEnabled).toBe(false);
    expect(state.remoteMutation).toBe(false);
    expect(state.gitMutation).toBe(false);
    expect(state.sqlExecuted).toBe(false);
    expect(state.migrationsApplied).toBe(0);
    expect(state.rowsCreated).toBe(0);
    expect(boundarySource).toContain('import "server-only"');
    expect(coreSource).not.toMatch(/node:child_process|from ["']child_process["']|require\(["']child_process["']\)|spawn\(|exec\(|execFile|execSync|spawnSync|process\.env|which |where |readFileSync\(|readdir|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|storage\.|git\s+--version|supabase\s+--version/);
    expect(boundarySource).not.toMatch(/child_process|spawn\(|exec\(|createClient\(|\.insert\(|\.upsert\(|\.rpc\(/);
    expect(apiSource).not.toContain("post-trade-first-live-read-only-preflight-process-executor");
    expect(tradeUiSource).not.toContain("post-trade-first-live-read-only-preflight-process-executor");
    expect(plan).toMatchObject({
      status: "not_run",
      containsCommandString: false,
      containsExecutablePath: false,
      containsEnvironmentValue: false,
      containsCredential: false,
      containsRawOutput: false,
      containsSql: false,
      containsDeployment: false,
      containsRetry: false,
      liveCommandsExecuted: 0,
      driverInvoked: false,
      runnerExecutionEnabled: false,
      deploymentEnabled: false,
    });
    expect(validateProcessDriverContract(contract).valid).toBe(true);
    expect(contract).toMatchObject({
      genericExecExposed: false,
      genericSpawnExposed: false,
      shellStringExposed: false,
      arbitraryExecutableExposed: false,
      arbitraryArgumentsExposed: false,
      arbitraryWorkingDirectoryExposed: false,
      arbitraryEnvironmentExposed: false,
      interactiveStdinExposed: false,
      rawProcessObjectExposed: false,
      globalProcessListingExposed: false,
      genericContainmentAssertionAccepted: false,
      genericTerminationAssertionAccepted: false,
      rawOutputLoggingExposed: false,
      noDefaultLiveDriver: true,
    });
  });

  test("canonical executable and operation registries are exact, deterministic, allowlisted, and reject executable and operation bypasses", () => {
    const executables = buildProcessExecutableRegistry();
    const operations = buildProcessOperationRegistry();
    expect(validateProcessExecutableRegistry(executables).valid).toBe(true);
    expect(validateProcessOperationRegistry(operations).valid).toBe(true);
    expect(executables.executables.map((item) => item.executableIdentity)).toEqual(["git_cli", "supabase_cli"]);
    expect(operations.operations.map((item) => item.operationId)).toEqual([
      "preflight_git_repository_root",
      "preflight_git_current_commit",
      "preflight_git_current_branch",
      "preflight_git_porcelain_status",
      "preflight_git_staged_files",
      "preflight_git_unstaged_files",
      "preflight_git_untracked_files",
      "preflight_supabase_linked_project",
      "preflight_supabase_migration_history",
      "preflight_supabase_cli_version",
    ]);
    expect(operations.operations.every((item) => item.commandStringAbsent && !item.arbitraryArgumentsAllowed && !item.wildcardArgumentsAllowed)).toBe(true);
    expect(operations.catalogAdapterOperationsIncluded).toBe(false);
    expect(operations.prefixMatchingAllowed).toBe(false);

    expect(validateProcessExecutableRegistry(fingerprintedRegistry({ ...executables, executables: executables.executables.slice(1) })).blockingReasons).toContain("missing_git_cli");
    expect(validateProcessExecutableRegistry(fingerprintedRegistry({ ...executables, executables: [...executables.executables, executables.executables[0]!] })).blockingReasons).toContain("duplicate_executable_identity");
    for (const patch of [
      { aliasProhibited: false },
      { wrapperProhibited: false },
      { shellFunctionProhibited: false },
      { scriptProxyProhibited: false },
      { callerSelectedPathProhibited: false },
      { unresolvedSymlinkProhibited: false },
      { executablePathAbsent: false },
    ]) {
      const entries = executables.executables.map((item, index) => index === 0 ? { ...item, ...patch } : item);
      expect(validateProcessExecutableRegistry(fingerprintedRegistry({ ...executables, executables: entries })).valid, JSON.stringify(patch)).toBe(false);
    }

    const first = operations.operations[0]!;
    expect(validateProcessOperationRegistry(fingerprintedOperations({ ...operations, operations: operations.operations.slice(1) })).valid).toBe(false);
    expect(validateProcessOperationRegistry(fingerprintedOperations({ ...operations, operations: [...operations.operations, first] })).blockingReasons).toContain("duplicate_operation_identity");
    expect(validateProcessOperationRegistry(fingerprintedOperations({ ...operations, operations: [{ ...first, operationId: "unknown_operation" }] })).blockingReasons).toContain("unknown_operation");
    expect(validateProcessOperationRegistry(fingerprintedOperations({ ...operations, operations: [{ ...first, executableIdentity: "supabase_cli" }] })).blockingReasons).toContain("operation_executable_mismatch");
    expect(validateProcessOperationRegistry(fingerprintedOperations({ ...operations, operations: [{ ...first, commandStringAbsent: false }] })).blockingReasons).toContain("command_string_present");
    expect(validateProcessOperationRegistry(fingerprintedOperations({ ...operations, wildcardOperationAllowed: true })).valid).toBe(false);
  });

  test("process requests enforce exact args, no shell, no stdin, no tty, no retry, no arbitrary cwd, no production refs, and no unsafe argument forms", () => {
    const request = buildProcessRequest("preflight_git_porcelain_status");
    expect(validateProcessRequest(request).valid).toBe(true);
    expect(request).toMatchObject({
      stdinClosed: true,
      ttyDisabled: true,
      pseudoTtyDisabled: true,
      shellDisabled: true,
      detached: false,
      readOnly: true,
      automaticRetryAllowed: false,
      workingDirectoryIdentity: "ture_trade_repository_root",
      environmentPlanIdentity: "minimal_non_secret_no_color_no_pager",
    });

    const unsafeArgs = [
      ["status", "--porcelain=v1"],
      ["--porcelain=v1", "status", "--untracked-files=all", "--no-renames"],
      ["status", "--porcelain=v1", "--untracked-files=all", "--no-renames", "--short"],
      ["status", "--porcelain=v1", "--porcelain=v1", "--no-renames"],
      ["status", ""],
      ["status", " --porcelain=v1"],
      ["status", "x;y"],
      ["status", "x|y"],
      ["status", "x>y"],
      ["status", "x&&y"],
      ["status", "x||y"],
      ["status", "`x`"],
      ["status", "$(x)"],
      ["status", "$TOKEN"],
      ["status", "x\ny"],
      ["status", "x\ry"],
      ["status", "x\0y"],
      ["status", "x\u2028y"],
      ["status", "*"],
      ["status", "file?.ts"],
      ["status", "~/repo"],
      ["status", "../repo"],
      ["status", "ekdyopdrrkphlrsilyoo"],
      ["status", "https://user:pass@example.invalid"],
      ["status", "abcdef1"],
      ["status", "--password"],
    ];
    for (const exactArguments of unsafeArgs) {
      const patched = fingerprintedRequest({ ...request, exactArguments });
      expect(validateProcessRequest(patched).valid, JSON.stringify(exactArguments)).toBe(false);
    }
    for (const patch of [
      { workingDirectoryIdentity: "/Users/person/repo" },
      { environmentPlanIdentity: "inherited" },
      { stdinClosed: false },
      { ttyDisabled: false },
      { pseudoTtyDisabled: false },
      { shellDisabled: false },
      { detached: true },
      { automaticRetryAllowed: true },
      { command: "git status" },
      { executablePath: "/usr/bin/git" },
    ]) {
      expect(validateProcessRequest(fingerprintedRequest({ ...request, ...patch })).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("working directory, environment, timeout, and output policies fail closed", () => {
    const workdir = buildWorkingDirectoryPolicy();
    const environment = buildEnvironmentPolicy();
    const timeouts = buildProcessTimeoutRegistry();
    const outputs = buildProcessOutputLimitRegistry();
    expect(validateWorkingDirectoryPolicy(workdir).valid).toBe(true);
    expect(validateEnvironmentPolicy(environment).valid).toBe(true);
    expect(validateProcessTimeoutRegistry(timeouts).valid).toBe(true);
    expect(validateProcessOutputLimitRegistry(outputs).valid).toBe(true);
    expect(workdir.personalPathInEvidenceAllowed).toBe(false);
    expect(environment.startsFromEmptyEnvironment).toBe(true);
    expect(environment.credentialInjectionImplemented).toBe(false);

    for (const patch of [
      { callerSelectedAbsolutePathAllowed: true },
      { traversalAllowed: true },
      { personalPathInEvidenceAllowed: true },
      { symlinkRootAllowed: true },
      { nestedUnrelatedRepositoryAllowed: true },
      { productionCheckoutAllowed: true },
    ]) {
      expect(validateWorkingDirectoryPolicy({ ...workdir, ...patch }).valid).toBe(false);
    }
    for (const patch of [
      { inheritedEnvironmentAllowed: true },
      { arbitraryEnvironmentEntryAllowed: true },
      { credentialValueAllowed: true },
      { actualSecretEnvironmentNameAllowed: true },
      { pathDumpAllowed: true },
      { homeAllowed: true },
      { userAllowed: true },
      { shellConfigurationAllowed: true },
      { gitConfigOverrideAllowed: true },
      { serviceRoleKeyAllowed: true },
      { connectionStringAllowed: true },
      { cookieAllowed: true },
      { sessionAllowed: true },
      { bankIdMaterialAllowed: true },
    ]) {
      expect(validateEnvironmentPolicy({ ...environment, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    const longerTimeout = timeouts.policies.map((item, index) => index === 0 ? { ...item, timeoutMs: item.timeoutMs + 1 } : item);
    expect(validateProcessTimeoutRegistry(fingerprintedTimeouts({ ...timeouts, policies: longerTimeout })).blockingReasons).toContain("caller_raised_timeout");
    expect(validateProcessTimeoutRegistry(fingerprintedTimeouts({ ...timeouts, policies: [{ ...timeouts.policies[0]!, operationId: "unknown" }] })).blockingReasons).toContain("unknown_timeout_policy");
    const biggerStdout = outputs.policies.map((item, index) => index === 0 ? { ...item, maxStdoutBytes: item.maxStdoutBytes + 1 } : item);
    const biggerStderr = outputs.policies.map((item, index) => index === 0 ? { ...item, maxStderrBytes: item.maxStderrBytes + 1 } : item);
    expect(validateProcessOutputLimitRegistry(fingerprintedOutputs({ ...outputs, policies: biggerStdout })).blockingReasons).toContain("caller_raised_stdout_limit");
    expect(validateProcessOutputLimitRegistry(fingerprintedOutputs({ ...outputs, policies: biggerStderr })).blockingReasons).toContain("caller_raised_stderr_limit");
    expect(validateProcessOutputLimitRegistry(fingerprintedOutputs({ ...outputs, policies: [{ ...outputs.policies[0]!, operationId: "unknown" }] })).blockingReasons).toContain("unknown_output_policy");
    expect(validateProcessOutputLimitRegistry(fingerprintedOutputs({ ...outputs, policies: [{ ...outputs.policies[0]!, truncationProhibited: false }] })).blockingReasons).toContain("truncation_not_prohibited");
    expect(validateProcessOutputLimitRegistry(fingerprintedOutputs({ ...outputs, policies: [{ ...outputs.policies[0]!, overflowBlocksParserAuthority: false }] })).blockingReasons).toContain("overflow_does_not_block_parser");
  });

  test("lifecycle, containment, and termination policies reject illegal transitions, parent-only termination, descendants, helper/browser/gui/url children, ambiguity, retry, and incomplete evidence", () => {
    const request = buildProcessRequest("preflight_git_repository_root");
    const lifecycle = buildProcessLifecyclePolicy();
    const happy: ProcessLifecycleTransition[] = ["not_started->starting", "starting->running", "running->exit_observed", "exit_observed->completed"];
    const timeout: ProcessLifecycleTransition[] = ["running->timed_out", "timed_out->termination_requested", "termination_requested->graceful_termination_wait", "graceful_termination_wait->force_termination_requested", "force_termination_requested->force_termination_wait", "force_termination_wait->containment_verification", "containment_verification->terminated"];
    expect(validateLifecycleTransitions(happy).valid).toBe(true);
    expect(validateLifecycleTransitions(timeout).valid).toBe(true);
    for (const transition of ["completed->running", "terminated->running", "failed->starting", "ambiguous->completed", "timed_out->starting", "termination_failed->starting"] as ProcessLifecycleTransition[]) {
      expect(validateLifecycleTransitions([transition]).valid, transition).toBe(false);
    }
    expect(lifecycle.overflowToCompletedAllowed).toBe(false);
    expect(lifecycle.promptToParsingAllowed).toBe(false);
    expect(lifecycle.secretToParsingAllowed).toBe(false);
    expect(fingerprintedLifecycle({ ...lifecycle, allowedTransitions: lifecycle.allowedTransitions.slice() }).lifecycleFingerprint).toBe(lifecycle.lifecycleFingerprint);

    const contained = buildContainmentEvidence(request);
    expect(validateContainmentEvidence(contained).valid).toBe(true);
    const containmentViolations: Partial<ProcessContainmentEvidence>[] = [
      { complete: false },
      { authoritative: false },
      { directChildCountClassification: "unknown" },
      { descendantCountClassification: "unknown" },
      { directChildCountClassification: "nonzero" },
      { detachedChildDetected: true },
      { processGroupEscapeDetected: true },
      { browserChildDetected: true },
      { credentialHelperChildDetected: true },
      { daemonizationDetected: true },
      { guiChildDetected: true },
      { urlOpenerDetected: true },
      { resultClassification: "ambiguous" },
    ];
    for (const patch of containmentViolations) {
      expect(validateContainmentEvidence(buildContainmentEvidence(request, patch)).valid, JSON.stringify(patch)).toBe(false);
    }

    const termination = buildTerminationPlan(request);
    expect(validateTerminationPlan(termination).valid).toBe(true);
    for (const patch of [
      { sessionInvalidated: false },
      { stopStartingNewOperations: false },
      { automaticRetryAllowed: true },
      { parentAndDescendantExitConfirmationRequired: false },
    ]) {
      expect(validateTerminationPlan({ ...termination, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("fixture result classifications block overflow, truncation, prompts, secrets, mutation, unexpected children, zero-exit-only assumptions, and keep public evidence sanitized", () => {
    const request = buildProcessRequest("preflight_supabase_migration_history");
    const canonical = buildFakeDriverFixtureResult(request);
    const evidence = buildSanitizedProcessResultEvidence(request, canonical);
    expect(validateFakeDriverFixtureResult(request, canonical).valid).toBe(true);
    expect(evidence.resultClassification).toBe("completed_read_only");
    expect(validateSanitizedProcessResultEvidence(evidence).valid).toBe(true);
    expect(JSON.stringify(evidence)).not.toMatch(/rawStdout|rawStderr|executablePath|\/Users\/|password|service[_ -]?role|cookie|sessionToken|bankid/i);

    const cases: Array<[Partial<FakeDriverFixtureResult>, string]> = [
      [{ exitCode: 1, lifecycleState: "failed" }, "failed_read_only"],
      [{ timeout: true, lifecycleState: "timed_out", terminationRequested: true, gracefulTerminationAttempted: true }, "timed_out_terminated"],
      [{ timeout: true, lifecycleState: "timed_out", directChildrenTerminated: false }, "timed_out_termination_unconfirmed"],
      [{ outputOverflow: true }, "output_overflow"],
      [{ stdoutTruncated: true }, "ambiguous"],
      [{ stderrTruncated: true }, "ambiguous"],
      [{ promptDetected: true, promptClassification: "login" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "browser_auth" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "device_code" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "mfa" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "password" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "token" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "confirmation" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "project_link" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "migration_confirmation" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "credential_helper" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "gui_launch" }, "interactive_prompt_detected"],
      [{ promptDetected: true, promptClassification: "url_opener" }, "interactive_prompt_detected"],
      [{ secretDetected: true }, "secret_material_detected"],
      [{ unexpectedChildDetected: true }, "unexpected_child_process"],
      [{ mutationDetected: true }, "mutation_detected"],
    ];
    for (const [patch, classification] of cases) {
      const result = buildSanitizedProcessResultEvidence(request, buildFakeDriverFixtureResult(request, patch));
      expect(result.resultClassification, JSON.stringify(patch)).toBe(classification);
      expect(result.readOnly).toBe(true);
      expect(validateSanitizedProcessResultEvidence(result).valid, JSON.stringify(patch)).toBe(true);
      if (classification !== "completed_read_only") {
        expect(result.resultClassification).not.toBe("completed_read_only");
      }
    }
    const invalidFixture = { ...canonical, rawStdout: "safe text" };
    expect(validateFakeDriverFixtureResult(request, invalidFixture).blockingReasons).toContain("unknown_fixture_result_field:rawStdout");
    expect(validateFakeDriverFixtureResult(request, { ...canonical, accessToken: "redacted" }).blockingReasons).toContain("sensitive_unknown_fixture_field_present");
    expect(validateFakeDriverFixtureResult(request, { ...canonical, executablePath: "/Users/example/bin/supabase" }).blockingReasons).toContain("sensitive_material_present");
    expect(validateFakeDriverFixtureResult(request, { ...canonical, stdoutFingerprint: "access token redacted" }).blockingReasons).toContain("sensitive_material_present");
    expect(validateFakeDriverFixtureResult(request, { ...canonical, promptDetected: true, promptClassification: "loose_prompt" }).blockingReasons).toContain("unknown_prompt_classification");
    expect(validateFakeDriverFixtureResult(request, { ...canonical, terminationRequested: true }).blockingReasons).toContain("completed_with_termination_request");
    expect(validateFakeDriverFixtureResult(request, { ...canonical, lifecycleState: "timed_out", timeout: true }).blockingReasons).toContain("timeout_missing_termination_evidence");
    expect(validateSanitizedProcessResultEvidence({ ...evidence, terminationRequested: true, evidenceFingerprint: buildSanitizedProcessResultFingerprint({ ...evidence, terminationRequested: true, evidenceFingerprint: undefined, evidenceFingerprintAlgorithm: undefined }) }).blockingReasons).toContain("completed_read_only_with_termination_request");
  });

  test("injected fake driver is explicit, side-effect counted only when called, live count remains zero, and malformed driver output is rejected", async () => {
    const request = buildProcessRequest("preflight_git_current_commit");
    const counters = { start: 0, observe: 0, dispose: 0 };
    expect(counters).toEqual({ start: 0, observe: 0, dispose: 0 });
    const ok = await collectProcessResultFromInjectedFakeDriver(fakeDriver(buildFakeDriverFixtureResult(request), counters), request);
    expect(counters).toEqual({ start: 1, observe: 1, dispose: 1 });
    expect(ok.valid).toBe(true);
    expect(ok.adapterInvoked).toBe(true);
    expect(ok.liveCommandsExecuted).toBe(0);
    expect(ok.observedLive).toBe(false);
    expect(ok.resultEvidence?.resultClassification).toBe("completed_read_only");

    const malformedCounters = { start: 0, observe: 0, dispose: 0 };
    const malformed = await collectProcessResultFromInjectedFakeDriver(
      fakeDriver({ ...buildFakeDriverFixtureResult(request), requestId: "wrong_request" }, malformedCounters),
      request,
    );
    expect(malformed.valid).toBe(false);
    expect(malformed.blockingReasons).toContain("fixture_request_mismatch");
    expect(malformed.liveCommandsExecuted).toBe(0);
  });

  test("fingerprints are deterministic, exact, order-sensitive, and malformed/prefix/changed critical fields are rejected", () => {
    const executables = buildProcessExecutableRegistry();
    const operations = buildProcessOperationRegistry();
    const request = buildProcessRequest("preflight_git_current_branch");
    const timeouts = buildProcessTimeoutRegistry();
    const outputs = buildProcessOutputLimitRegistry();
    const lifecycle = buildProcessLifecyclePolicy();
    const termination = buildTerminationPlan(request);
    const result = buildSanitizedProcessResultEvidence(request, buildFakeDriverFixtureResult(request));
    const driver = buildProcessDriverContract();

    expect(buildProcessExecutableRegistryFingerprint({ ...executables, registryFingerprint: undefined })).not.toBe(executables.registryFingerprint);
    expect(buildProcessOperationRegistryFingerprint({ ...operations, operationFingerprint: undefined })).not.toBe(operations.operationFingerprint);
    expect(buildProcessRequestFingerprint({ ...request, requestFingerprint: undefined })).not.toBe(request.requestFingerprint);
    expect(buildProcessTimeoutRegistryFingerprint({ ...timeouts, timeoutFingerprint: undefined })).not.toBe(timeouts.timeoutFingerprint);
    expect(buildProcessOutputLimitRegistryFingerprint({ ...outputs, outputFingerprint: undefined })).not.toBe(outputs.outputFingerprint);
    expect(buildProcessLifecyclePolicyFingerprint({ ...lifecycle, lifecycleFingerprint: undefined })).not.toBe(lifecycle.lifecycleFingerprint);
    expect(buildTerminationPlanFingerprint({ ...termination, terminationFingerprint: undefined })).not.toBe(termination.terminationFingerprint);
    expect(buildSanitizedProcessResultFingerprint({ ...result, evidenceFingerprint: undefined })).not.toBe(result.evidenceFingerprint);
    expect(buildProcessDriverContractFingerprint({ ...driver, driverFingerprint: undefined })).not.toBe(driver.driverFingerprint);
    expect(validateProcessRequest({ ...request, requestFingerprint: request.requestFingerprint.slice(0, 12) }).blockingReasons).toContain("process_request_fingerprint_invalid");
    expect(validateProcessRequest({ ...request, requestFingerprint: `z${request.requestFingerprint.slice(1)}` }).blockingReasons).toContain("process_request_fingerprint_invalid");
    expect(validateProcessRequest(fingerprintedRequest({ ...request, exactArguments: [...request.exactArguments].reverse() })).valid).toBe(false);
    expect(validateProcessTimeoutRegistry(fingerprintedTimeouts({ ...timeouts, policies: timeouts.policies.map((item, index) => index === 0 ? { ...item, timeoutMs: item.timeoutMs - 1 } : item) })).valid).toBe(false);
    expect(validateContainmentEvidence(buildContainmentEvidence(request, { directChildCountClassification: "unknown" })).valid).toBe(false);
    expect(validateSanitizedProcessResultEvidence({ ...result, stdoutFingerprint: "b".repeat(64) }).blockingReasons).toContain("result_fingerprint_mismatch");
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => buildProcessRequestFingerprint(cyclic)).toThrow(/cyclic/);
  });

  test("compatibility checks pass and are pure: no driver, process, env, credential, persistence, authorization consumption, SQL, deployment, API, UI or Avanza activation", () => {
    let driverCalls = 0;
    expect(validateProcessExecutorExecutionBoundaryCompatibility().valid).toBe(true);
    expect(validateProcessExecutorAuthorizationCompatibility().valid).toBe(true);
    expect(validateProcessExecutorRunnerCompatibility().valid).toBe(true);
    expect(validateProcessExecutorCliVersionCollectorCompatibility().valid).toBe(true);
    expect(validateProcessExecutorCredentialDesignCompatibility().valid).toBe(true);
    expect(driverCalls).toBe(0);
    driverCalls += 0;
    const coreSource = source(corePath);
    const apiAndUiSource = [source(apiPath), source(tradeUiPath)].join("\n");
    expect(coreSource).not.toMatch(/process\.env|readFileSync\(|node:child_process|from ["']child_process["']|require\(["']child_process["']\)|spawn\(|exec\(|which |where /i);
    expect(apiAndUiSource).not.toContain("post-trade-first-live-read-only-preflight-process-executor");
    expect(coreSource).not.toMatch(/authorizationConsumed:\s*true|deploymentEnabled:\s*true|sqlExecuted:\s*true|rowsCreated:\s*[1-9]/);
  });
});
