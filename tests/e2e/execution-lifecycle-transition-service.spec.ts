import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionLifecycleSnapshot,
  ExecutionLifecycleTransitionResult,
} from "../../lib/execution-state-machine";
import type {
  ExecutionRecordAuditWriterLifecycleCallerResult,
} from "../../lib/server/execution-record-audit-writer-lifecycle-caller";
import type {
  ExecutionRecordAuditWriterLifecycleHookResult,
} from "../../lib/server/execution-record-audit-writer-lifecycle-hook";

const root = process.cwd();
const servicePath = join(
  root,
  "lib/server/execution-lifecycle-transition-service.ts",
);
const lifecycleCallerPath = join(
  root,
  "lib/server/execution-record-audit-writer-lifecycle-caller.ts",
);
const serviceImport = "execution-lifecycle-transition-service";
const lifecycleCallerImport = "execution-record-audit-writer-lifecycle-caller";
const lifecycleHookImport = "execution-record-audit-writer-lifecycle-hook";
const productionWritePathImport =
  "execution-record-audit-writer-production-write-path";
const auditWriterImport = "execution-record-audit-writer";
const serviceRoleAdapterImport =
  "execution-record-audit-writer-service-role-adapter";
const orchestratorImport = "execution-orchestrator";
const stateMachineImport = "execution-state-machine";

const snapshot = {
  lifecycleId: "lifecycle-action-860",
  currentState: "broker_result_captured",
  createdAt: "2026-06-26T18:00:00.000Z",
  updatedAt: "2026-06-26T18:00:00.000Z",
  mode: "semi_automatic",
  action: "buy",
  triggerType: "manual_entry_requested",
  events: [],
} satisfies ExecutionLifecycleSnapshot;

const successfulTransition = {
  ok: true,
  snapshot: {
    ...snapshot,
    currentState: "completed",
    updatedAt: "2026-06-26T18:01:00.000Z",
  },
  event: {
    eventId: "execution-event-action-860-001",
    type: "complete_execution",
    createdAt: "2026-06-26T18:01:00.000Z",
    fromState: "broker_result_captured",
    toState: "completed",
    message: "Completed by server-only lifecycle transition service.",
  },
} satisfies ExecutionLifecycleTransitionResult;

const failedTransition = {
  ok: false,
  snapshot,
  error:
    "Invalid execution lifecycle transition from broker_result_captured using create_intent.",
} satisfies ExecutionLifecycleTransitionResult;

type RuntimeServiceModule = {
  transitionExecutionLifecycleOnServer: (
    input: unknown,
    options?: {
      appendLifecycleAuditEvent?: (
        input: unknown,
      ) => Promise<ExecutionRecordAuditWriterLifecycleHookResult>;
    },
  ) => Promise<unknown>;
};

const completedHookResult = {
  status: "completed",
  ok: true,
  hookVersion: "execution_record_audit_writer_lifecycle_hook_v1",
  productionWritePathResult: {
    status: "completed",
    ok: true,
    warnings: [],
  },
  errors: [],
  warnings: [],
  safety: {
    downstreamMutationAllowed: false,
    serviceRoleExposed: false,
  },
} as unknown as ExecutionRecordAuditWriterLifecycleHookResult;

const successfulAuditCallerResult = {
  status: "completed",
  ok: true,
  callerVersion: "execution_record_audit_writer_lifecycle_caller_v1",
  transition: successfulTransition,
  hookResult: completedHookResult,
  errors: [],
  warnings: [],
  safety: {
    serverOnly: true,
    exactlyOneLifecycleCaller: true,
    lifecycleHookUsed: true,
    hookCalledOnlyAfterSuccessfulTransition: true,
    insertOnlyAuditAppend: true,
    routeBoundaryBypassed: false,
    browserClientInvocationAllowed: false,
    appShellImportAllowed: false,
    marketLoopInvocationAllowed: false,
    scannerAutomationInvocationAllowed: false,
    brokerAvanzaAllowed: false,
    automaticModeAllowed: false,
    tradeStatsPnlMutationAllowed: false,
    updateDeleteUpsertSelectAllowed: false,
    downstreamMutationAllowed: false,
    serviceRoleExposed: false,
    retryLoopAllowed: false,
  },
} satisfies Extract<
  ExecutionRecordAuditWriterLifecycleCallerResult,
  { status: "completed" }
>;

const failedAuditCallerResult = {
  status: "blocked",
  ok: false,
  callerVersion: "execution_record_audit_writer_lifecycle_caller_v1",
  transition: failedTransition,
  hookResult: null,
  errors: [failedTransition.error],
  warnings: [],
  safety: {
    serverOnly: true,
    exactlyOneLifecycleCaller: true,
    lifecycleHookUsed: true,
    hookCalledOnlyAfterSuccessfulTransition: true,
    insertOnlyAuditAppend: true,
    routeBoundaryBypassed: false,
    browserClientInvocationAllowed: false,
    appShellImportAllowed: false,
    marketLoopInvocationAllowed: false,
    scannerAutomationInvocationAllowed: false,
    brokerAvanzaAllowed: false,
    automaticModeAllowed: false,
    tradeStatsPnlMutationAllowed: false,
    updateDeleteUpsertSelectAllowed: false,
    downstreamMutationAllowed: false,
    serviceRoleExposed: false,
    retryLoopAllowed: false,
  },
} satisfies Extract<
  ExecutionRecordAuditWriterLifecycleCallerResult,
  { status: "blocked" }
>;

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function countOccurrences(source: string, fragment: string) {
  return source.split(fragment).length - 1;
}

function listSourceFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        return [];
      }

      return listSourceFiles(path);
    }

    if (!/\.(tsx?|jsx?|mjs|cjs)$/.test(entry)) {
      return [];
    }

    return [path];
  });
}

function loadRuntimeServiceModule(
  auditCallerResults: ExecutionRecordAuditWriterLifecycleCallerResult[],
  auditCallerCalls: unknown[],
): RuntimeServiceModule {
  const source = read(servicePath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: servicePath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeServiceModule>,
    require: (specifier: string) => {
      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-lifecycle-caller"
      ) {
        return {
          transitionExecutionLifecycleAndAppendAuditEvent: async (
            input: unknown,
            options: unknown,
          ) => {
            auditCallerCalls.push([input, options]);

            return auditCallerResults.shift() ?? failedAuditCallerResult;
          },
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: servicePath });

  return sandbox.exports as RuntimeServiceModule;
}

function loadRuntimeServiceModuleWithRealCaller(
  transitions: ExecutionLifecycleTransitionResult[],
  transitionCalls: unknown[],
  hookCalls: unknown[],
  hookResult: ExecutionRecordAuditWriterLifecycleHookResult = completedHookResult,
): RuntimeServiceModule {
  const callerSource = read(lifecycleCallerPath).replace('import "server-only";', "");
  const callerTranspiled = ts.transpileModule(callerSource, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: lifecycleCallerPath,
  }).outputText;
  const callerSandbox = {
    exports: {} as Partial<{
      transitionExecutionLifecycleAndAppendAuditEvent: (
        input: unknown,
        options?: unknown,
      ) => Promise<ExecutionRecordAuditWriterLifecycleCallerResult>;
    }>,
    require: (specifier: string) => {
      if (specifier === "@/lib/execution-state-machine") {
        return {
          transitionExecutionLifecycle: (...args: unknown[]) => {
            transitionCalls.push(args);

            return transitions.shift() ?? failedTransition;
          },
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-lifecycle-hook"
      ) {
        return {
          appendExecutionLifecycleTransitionAuditEvent: async (input: unknown) => {
            hookCalls.push(input);

            return hookResult;
          },
        };
      }

      return {};
    },
  };

  vm.runInNewContext(callerTranspiled, callerSandbox, {
    filename: lifecycleCallerPath,
  });

  const source = read(servicePath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: servicePath,
  }).outputText;
  const serviceSandbox = {
    exports: {} as Partial<RuntimeServiceModule>,
    require: (specifier: string) => {
      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-lifecycle-caller"
      ) {
        return callerSandbox.exports;
      }

      return {};
    },
  };

  vm.runInNewContext(transpiled, serviceSandbox, { filename: servicePath });

  return serviceSandbox.exports as RuntimeServiceModule;
}

test("server-only lifecycle transition service has the approved boundary shape", () => {
  const source = read(servicePath);
  const approvedCallerImport =
    '} from "@/lib/server/execution-record-audit-writer-lifecycle-caller";';

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain(stateMachineImport);
  expect(source).toContain(lifecycleCallerImport);
  expect(source).toContain(approvedCallerImport);
  expect(countOccurrences(source, approvedCallerImport)).toBe(1);
  expect(source).toContain("transitionExecutionLifecycleOnServer");
  expect(source).toContain("transitionExecutionLifecycleAndAppendAuditEvent");
  expect(source).not.toContain(orchestratorImport);
  expect(source).not.toContain("runExecutionOrchestrator");
  expect(source).not.toContain("createLifecycleForSelectedIntent");
  expect(source).not.toContain("buildAvanzaExecutionHandoff");
  expect(source).not.toContain("pickNextExecutionIntent");
  expect(source).not.toContain("buildSellExecutionIntentsForLivePositions");
  expect(source).not.toContain(lifecycleHookImport);
  expect(source).not.toContain(productionWritePathImport);
  expect(source).not.toContain(serviceRoleAdapterImport);
  expect(source).not.toMatch(
    new RegExp(`@/lib/server/${auditWriterImport}(?!-)`),
  );
  expect(source).not.toContain("appendExecutionLifecycleTransitionAuditEvent");
  expect(source).not.toContain("appendExecutionRecordAuditEventFromProductionWritePath");
  expect(source).not.toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("@supabase/");
  expect(source).not.toContain("createClient");
  expect(source).not.toContain("createServerClient");
  expect(source).not.toContain("createServiceRole");
  expect(source).not.toContain("supabaseServer");
  expect(source).not.toContain("serviceRoleKey");
  expect(source).not.toContain("service_role_key");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("new Request(");
  expect(source).not.toContain("POST(");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain(".select(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toContain("window.");
  expect(source).not.toContain("document.");
  expect(source).not.toContain("process.env");
  expect(source).not.toMatch(/console\./);
  expect(source).not.toMatch(/supabase\.(from|rpc|auth|storage)/);
  expect(source).not.toMatch(/SUPABASE_SERVICE_ROLE(KEY|_SECRET)?\s*=/);
  expect(source).not.toMatch(
    new RegExp("NEXT" + "_PUBLIC_[A-Z0-9_]*SERVICE", "i"),
  );
});

test("server-only lifecycle transition service exports only the approved runtime API", () => {
  const runtime = loadRuntimeServiceModule([], []);

  expect(Object.keys(runtime).sort()).toEqual([
    "transitionExecutionLifecycleOnServer",
  ]);
});

test("server-only lifecycle transition service does not duplicate orchestrator transition orchestration", () => {
  const serviceSource = read(servicePath);
  const orchestratorSource = read(join(root, "lib/execution-orchestrator.ts"));
  const orchestratorOnlyFragments = [
    "buildAvanzaExecutionHandoff",
    "pickNextExecutionIntent",
    "buildSellExecutionIntentsForLivePositions",
    "statusFromHandoff",
    "livePositionsWithDefaults",
    "createLifecycleForSelectedIntent",
    "runExecutionOrchestrator",
    "hasExecutableHandoff",
  ];

  for (const fragment of orchestratorOnlyFragments) {
    expect(orchestratorSource).toContain(fragment);
    expect(serviceSource).not.toContain(fragment);
  }
});

test("server-only lifecycle transition service is absent from UI, app shell, routes, scripts, and hooks", () => {
  const disallowedRoots = ["app", "components", "hooks", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(serviceImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});

test("server-only lifecycle transition service is not imported by routes or app shell files", () => {
  const disallowedRoots = ["app"].map((entry) => join(root, entry));
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(serviceImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});

test("server-only lifecycle transition service is absent from market, scanner, and automation runtime", () => {
  const disallowedRoots = ["app", "components", "hooks", "lib", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => /market|scan|scanner|automation/i.test(relative(root, path)))
    .filter((path) => read(path).includes(serviceImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});

test("server-only lifecycle transition service keeps audit writer and service-role surfaces disconnected", () => {
  const source = read(servicePath);
  const forbiddenFragments = [
    lifecycleHookImport,
    productionWritePathImport,
    serviceRoleAdapterImport,
    "appendExecutionLifecycleTransitionAuditEvent",
    "appendExecutionRecordAuditEventFromProductionWritePath",
    "insertExecutionRecordAuditEventWithServiceRole",
    "SUPABASE_SERVICE_ROLE",
    "service_role",
    "@supabase/",
    ".from(",
    ".insert(",
    ".update(",
    ".delete(",
    ".upsert(",
    ".select(",
    "fetch(",
    "new Request(",
    "POST(",
  ];

  for (const fragment of forbiddenFragments) {
    expect(source).not.toContain(fragment);
  }

  expect(source).toContain(lifecycleCallerImport);
  expect(source).toContain("transitionExecutionLifecycleAndAppendAuditEvent");
});

test("server-only lifecycle transition service source contains no downstream or autonomous behavior hooks", () => {
  const source = read(servicePath);

  for (const forbidden of [
    "mutateTrade",
    "updateTrade",
    "profit",
    "loss",
    "submitBrokerOrder",
    "captureBrokerResult",
    "runScanner",
    "runAutomation",
    "automaticExecution",
    "automaticMode: true",
    "brokerAvanzaBehaviorAllowed: true",
    "automaticModeAllowed: true",
    "downstreamMutationAllowed: true",
    "directSupabaseCallAllowed: true",
    "retryLoopAllowed: true",
  ]) {
    expect(source).not.toContain(forbidden);
  }
});

test("server-only lifecycle transition service blocks before audit caller when gates fail", async () => {
  const auditCallerCalls: unknown[] = [];
  const runtime = loadRuntimeServiceModule(
    [successfulAuditCallerResult],
    auditCallerCalls,
  );
  const result = await runtime.transitionExecutionLifecycleOnServer({
    boundaryApproved: false,
    auditCallerWiringApproved: false,
    caller: "ui_runtime",
    snapshot,
    eventType: "complete_execution",
  });

  expect(result).toMatchObject({
    status: "blocked",
    ok: false,
    auditCallerResult: null,
    errors: [
      "server_only_lifecycle_transition_boundary_approval_required",
      "boundary_to_audit_caller_wiring_approval_required",
      "server_only_lifecycle_transition_boundary_caller_required",
    ],
    safety: {
      serverOnly: true,
      auditCallerWiringAllowed: true,
      lifecycleCallerUsed: true,
      insertOnlyAuditAppend: true,
      uiBrowserInvocationAllowed: false,
      appShellImportAllowed: false,
      routeFetchCallAllowed: false,
      scannerAutomationInvocationAllowed: false,
      brokerAvanzaBehaviorAllowed: false,
      automaticModeAllowed: false,
      downstreamMutationAllowed: false,
      directSupabaseCallAllowed: false,
      serviceRoleExposed: false,
      retryLoopAllowed: false,
      broaderProductionRolloutAllowed: false,
    },
  });
  expect(auditCallerCalls).toEqual([]);
});

test("server-only lifecycle transition service invokes audit caller exactly once with validated server-side payload", async () => {
  const auditCallerCalls: unknown[] = [];
  const runtime = loadRuntimeServiceModule(
    [successfulAuditCallerResult],
    auditCallerCalls,
  );
  const transitionOptions = {
    createdAt: "2026-06-26T18:01:00.000Z",
    recordId: "11111111-1111-4111-8111-111111111111",
    message: "Completed by server-only lifecycle transition service.",
  };
  const hookOptions = {
    appendLifecycleAuditEvent: async () => completedHookResult,
  };
  const result = await runtime.transitionExecutionLifecycleOnServer({
    boundaryApproved: true,
    auditCallerWiringApproved: true,
    caller: "server_only_lifecycle_transition_boundary",
    snapshot,
    eventType: "complete_execution",
    transitionOptions,
    requestId: "action-863-boundary-request",
    actor: {
      actorType: "system",
      actorId: null,
    },
    metadata: {
      action: "863",
    },
  }, hookOptions);

  expect(auditCallerCalls).toHaveLength(1);
  expect(auditCallerCalls[0]).toEqual([
    {
      lifecycleCallerWiringApproved: true,
      caller: "server_only_execution_lifecycle_transition_module",
      operation: "transition_then_insert_only_audit_append",
      targetTable: "public.execution_record_audit_events",
      snapshot,
      eventType: "complete_execution",
      transitionOptions,
      executionRecordId: null,
      requestId: "action-863-boundary-request",
      actor: {
        actorType: "system",
        actorId: null,
      },
      traceId: null,
      sourceFingerprint: null,
      metadata: {
        action: "863",
        boundary: "server_only_lifecycle_transition_boundary",
        boundaryToAuditCallerWiring: "action_863_approved",
        noRetry: true,
        productionRolloutApproved: true,
        productionRolloutApproval: "action_887_approved_server_only_path",
      },
    },
    hookOptions,
  ]);
  expect(result).toMatchObject({
    status: "transition_completed",
    ok: true,
    auditCallerResult: successfulAuditCallerResult,
    errors: [],
    warnings: [],
    safety: {
      serverOnly: true,
      auditCallerWiringAllowed: true,
      lifecycleCallerUsed: true,
      insertOnlyAuditAppend: true,
      downstreamMutationAllowed: false,
      directSupabaseCallAllowed: false,
      serviceRoleExposed: false,
      retryLoopAllowed: false,
      broaderProductionRolloutAllowed: false,
    },
  });
});

test("server-only lifecycle transition service preserves failed transition diagnostics from audit caller", async () => {
  const auditCallerCalls: unknown[] = [];
  const runtime = loadRuntimeServiceModule(
    [failedAuditCallerResult],
    auditCallerCalls,
  );
  const result = await runtime.transitionExecutionLifecycleOnServer({
    boundaryApproved: true,
    auditCallerWiringApproved: true,
    caller: "server_only_lifecycle_transition_boundary",
    snapshot,
    eventType: "create_intent",
  });

  expect(auditCallerCalls).toHaveLength(1);
  expect(result).toMatchObject({
    status: "transition_failed",
    ok: false,
    auditCallerResult: failedAuditCallerResult,
    errors: [failedTransition.error],
  });
});

test("server-only lifecycle transition service does not reach audit append hook when transition fails in real caller", async () => {
  const transitionCalls: unknown[] = [];
  const hookCalls: unknown[] = [];
  const runtime = loadRuntimeServiceModuleWithRealCaller(
    [failedTransition],
    transitionCalls,
    hookCalls,
  );
  const result = await runtime.transitionExecutionLifecycleOnServer({
    boundaryApproved: true,
    auditCallerWiringApproved: true,
    caller: "server_only_lifecycle_transition_boundary",
    snapshot,
    eventType: "create_intent",
  });

  expect(transitionCalls).toEqual([[snapshot, "create_intent", {}]]);
  expect(hookCalls).toEqual([]);
  expect(result).toMatchObject({
    status: "transition_failed",
    ok: false,
    auditCallerResult: {
      status: "blocked",
      ok: false,
      transition: failedTransition,
      hookResult: null,
      errors: [failedTransition.error],
      safety: {
        hookCalledOnlyAfterSuccessfulTransition: true,
        retryLoopAllowed: false,
        downstreamMutationAllowed: false,
        serviceRoleExposed: false,
      },
    },
    errors: [failedTransition.error],
  });
});

test("server-only lifecycle transition service preserves deterministic caller idempotency and hook payload through real caller", async () => {
  const transitionCalls: unknown[] = [];
  const hookCalls: unknown[] = [];
  const transitionOptions = {
    createdAt: "2026-06-26T18:01:00.000Z",
    recordId: "11111111-1111-4111-8111-111111111111",
    eventId: "execution-event-action-864-001",
    message: "Completed by server-only lifecycle transition service.",
  };
  const runtime = loadRuntimeServiceModuleWithRealCaller(
    [
      {
        ...successfulTransition,
        event: {
          ...successfulTransition.event,
          eventId: transitionOptions.eventId,
          recordId: transitionOptions.recordId,
        },
      },
    ],
    transitionCalls,
    hookCalls,
  );
  const result = await runtime.transitionExecutionLifecycleOnServer({
    boundaryApproved: true,
    auditCallerWiringApproved: true,
    caller: "server_only_lifecycle_transition_boundary",
    snapshot,
    eventType: "complete_execution",
    transitionOptions,
    metadata: {
      action: "864",
    },
  });

  expect(transitionCalls).toEqual([
    [snapshot, "complete_execution", transitionOptions],
  ]);
  expect(hookCalls).toHaveLength(1);
  expect(hookCalls[0]).toMatchObject({
    runtimeIntegrationApproved: true,
    integrationPoint: "server_only_execution_lifecycle_transition_handler",
    operation: "insert_only_audit_append",
    targetTable: "public.execution_record_audit_events",
    executionRecordId: transitionOptions.recordId,
    requestId: transitionOptions.eventId,
    traceId: snapshot.lifecycleId,
    sourceFingerprint:
      "execution_record_audit_writer_lifecycle_caller_v1:execution-event-action-864-001",
    metadata: {
      action: "864",
      boundary: "server_only_lifecycle_transition_boundary",
      boundaryToAuditCallerWiring: "action_863_approved",
      lifecycleCallerVersion:
        "execution_record_audit_writer_lifecycle_caller_v1",
      lifecycleCaller: "server_only_execution_lifecycle_transition_module",
      noRetry: true,
      noDownstreamMutation: true,
      productionRolloutApproved: true,
      productionRolloutApproval: "action_887_approved_server_only_path",
    },
  });
  expect(result).toMatchObject({
    status: "transition_completed",
    ok: true,
    auditCallerResult: {
      status: "completed",
      ok: true,
      safety: {
        hookCalledOnlyAfterSuccessfulTransition: true,
        retryLoopAllowed: false,
        downstreamMutationAllowed: false,
        serviceRoleExposed: false,
      },
    },
    safety: {
      retryLoopAllowed: false,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
      broaderProductionRolloutAllowed: false,
    },
  });
});

test("server-only lifecycle transition service preserves hook diagnostics and no-retry behavior", async () => {
  const auditCallerCalls: unknown[] = [];
  const diagnostics = {
    category: "schema_constraint",
    code: "23514",
    message: "sanitized failure",
  };
  const hookResult = {
    ...completedHookResult,
    ok: false,
    productionWritePathResult: {
      status: "completed",
      ok: false,
      diagnostics,
      warnings: ["diagnostic_warning"],
    },
    warnings: ["diagnostic_warning"],
  } as unknown as ExecutionRecordAuditWriterLifecycleHookResult;
  const auditCallerResult = {
    ...successfulAuditCallerResult,
    ok: false,
    hookResult,
    warnings: ["diagnostic_warning"],
  } satisfies Extract<
    ExecutionRecordAuditWriterLifecycleCallerResult,
    { status: "completed" }
  >;
  const runtime = loadRuntimeServiceModule([auditCallerResult], auditCallerCalls);
  const result = await runtime.transitionExecutionLifecycleOnServer({
    boundaryApproved: true,
    auditCallerWiringApproved: true,
    caller: "server_only_lifecycle_transition_boundary",
    snapshot,
    eventType: "complete_execution",
  });

  expect(auditCallerCalls).toHaveLength(1);
  expect(result).toMatchObject({
    status: "transition_completed",
    ok: false,
    auditCallerResult: {
      hookResult: {
        productionWritePathResult: {
          diagnostics,
        },
      },
      warnings: ["diagnostic_warning"],
      safety: {
        retryLoopAllowed: false,
        downstreamMutationAllowed: false,
        serviceRoleExposed: false,
      },
    },
    warnings: ["diagnostic_warning"],
    safety: {
      retryLoopAllowed: false,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  });
});
