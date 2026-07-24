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
  ExecutionRecordAuditWriterLifecycleHookInput,
  ExecutionRecordAuditWriterLifecycleHookResult,
} from "../../lib/server/execution-record-audit-writer-lifecycle-hook";

const root = process.cwd();
const callerPath = join(
  root,
  "lib/server/execution-record-audit-writer-lifecycle-caller.ts",
);
const hookPath = join(
  root,
  "lib/server/execution-record-audit-writer-lifecycle-hook.ts",
);
const callerImport = "execution-record-audit-writer-lifecycle-caller";
const hookImport = "execution-record-audit-writer-lifecycle-hook";
const stateMachineImport = "execution-state-machine";

const snapshot = {
  lifecycleId: "lifecycle-action-855",
  currentState: "broker_result_captured",
  createdAt: "2026-06-26T14:55:00.000Z",
  updatedAt: "2026-06-26T14:55:00.000Z",
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
    updatedAt: "2026-06-26T15:00:00.000Z",
  },
  event: {
    eventId: "execution-event-action-855-001",
    type: "complete_execution",
    createdAt: "2026-06-26T15:00:00.000Z",
    fromState: "broker_result_captured",
    toState: "completed",
    recordId: "11111111-1111-4111-8111-111111111111",
    message: "Completed after validated server-side lifecycle transition.",
    metadata: {
      fixture: "action_855_lifecycle_caller",
    },
  },
} satisfies ExecutionLifecycleTransitionResult;

const blockedTransition = {
  ok: false,
  snapshot,
  error:
    "Invalid execution lifecycle transition from broker_result_captured using create_intent.",
} satisfies ExecutionLifecycleTransitionResult;

const callerInput = {
  lifecycleCallerWiringApproved: true,
  caller: "server_only_execution_lifecycle_transition_module",
  operation: "transition_then_insert_only_audit_append",
  targetTable: "public.execution_record_audit_events",
  snapshot,
  eventType: "complete_execution",
  transitionOptions: {
    createdAt: "2026-06-26T15:00:00.000Z",
    recordId: "11111111-1111-4111-8111-111111111111",
    message: "Completed after validated server-side lifecycle transition.",
    metadata: {
      fixture: "action_855_lifecycle_caller",
    },
  },
  requestId: "action-855-lifecycle-caller-request",
  actor: {
    actorType: "system",
    actorId: null,
  },
  metadata: {
    action: "855",
  },
} as const;

type RuntimeCallerModule = {
  transitionExecutionLifecycleAndAppendAuditEvent: (
    input: unknown,
    options?: {
      appendLifecycleAuditEvent?: (
        input: unknown,
      ) => Promise<ExecutionRecordAuditWriterLifecycleHookResult>;
    },
  ) => Promise<unknown>;
};

function read(path: string): string {
  return readFileSync(path, "utf8");
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

function loadRuntimeCallerModule(
  transitions: ExecutionLifecycleTransitionResult[],
  defaultHookCalls: unknown[],
): RuntimeCallerModule {
  const source = read(callerPath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: callerPath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeCallerModule>,
    require: (specifier: string) => {
      if (specifier === "@/lib/execution-state-machine") {
        return {
          transitionExecutionLifecycle: () =>
            transitions.shift() ?? blockedTransition,
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-lifecycle-hook"
      ) {
        return {
          appendExecutionLifecycleTransitionAuditEvent: async (input: unknown) => {
            defaultHookCalls.push(input);

            return {
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
            };
          },
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: callerPath });

  return sandbox.exports as RuntimeCallerModule;
}

test("lifecycle caller remains server-only and delegates only to lifecycle hook after transition", () => {
  const source = read(callerPath);

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain(stateMachineImport);
  expect(source).toContain("transitionExecutionLifecycle");
  expect(source).toContain(hookImport);
  expect(source).toContain("appendExecutionLifecycleTransitionAuditEvent");
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
  expect(source).not.toContain("process.env");
  expect(source).not.toMatch(/console\./);
  expect(source).not.toMatch(/SUPABASE_SERVICE_ROLE(KEY|_SECRET)?\s*=/);
  expect(source).not.toMatch(
    new RegExp("NEXT" + "_PUBLIC_[A-Z0-9_]*SERVICE", "i"),
  );
});

test("lifecycle caller is the only runtime source outside tests and docs that imports the lifecycle hook", () => {
  const allowedHookImporters = [
    "lib/server/execution-record-audit-writer-lifecycle-caller.ts",
  ];
  const sourceRoots = ["app", "components", "hooks", "lib", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = sourceRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(hookImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual(allowedHookImporters);
});

test("lifecycle caller remains absent from UI, app shell, route, market, scanner, and automation runtime", () => {
  const disallowedRoots = ["app", "components", "hooks", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(callerImport))
    .map((path) => relative(root, path));
  const marketScannerMatches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => /market|scan|scanner|automation/i.test(relative(root, path)))
    .filter((path) => read(path).includes(callerImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
  expect(marketScannerMatches).toEqual([]);
});

test("lifecycle caller blocks before transition and hook when approval gates fail", async () => {
  const defaultHookCalls: unknown[] = [];
  const runtime = loadRuntimeCallerModule([successfulTransition], defaultHookCalls);
  const injectedHookCalls: unknown[] = [];
  const result = await runtime.transitionExecutionLifecycleAndAppendAuditEvent(
    {
      ...callerInput,
      lifecycleCallerWiringApproved: false,
      caller: "ui_runtime",
      operation: "upsert",
      targetTable: "public.execution_records",
    },
    {
      appendLifecycleAuditEvent: async (input) => {
        injectedHookCalls.push(input);
        throw new Error("should not call lifecycle hook");
      },
    },
  );

  expect(result).toMatchObject({
    status: "blocked",
    ok: false,
    transition: null,
    hookResult: null,
    errors: [
      "lifecycle_caller_wiring_approval_required",
      "server_only_lifecycle_caller_required",
      "transition_then_insert_only_audit_append_required",
      "audit_events_table_target_required",
    ],
  });
  expect(defaultHookCalls).toEqual([]);
  expect(injectedHookCalls).toEqual([]);
});

test("lifecycle caller does not invoke hook when transition fails", async () => {
  const defaultHookCalls: unknown[] = [];
  const runtime = loadRuntimeCallerModule([blockedTransition], defaultHookCalls);
  const injectedHookCalls: unknown[] = [];
  const result = await runtime.transitionExecutionLifecycleAndAppendAuditEvent(
    callerInput,
    {
      appendLifecycleAuditEvent: async (input) => {
        injectedHookCalls.push(input);
        throw new Error("should not call lifecycle hook");
      },
    },
  );

  expect(result).toMatchObject({
    status: "blocked",
    ok: false,
    transition: blockedTransition,
    hookResult: null,
    errors: [blockedTransition.error],
    safety: {
      hookCalledOnlyAfterSuccessfulTransition: true,
      retryLoopAllowed: false,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  });
  expect(defaultHookCalls).toEqual([]);
  expect(injectedHookCalls).toEqual([]);
});

test("lifecycle caller invokes lifecycle hook exactly once after successful transition", async () => {
  const defaultHookCalls: unknown[] = [];
  const runtime = loadRuntimeCallerModule([successfulTransition], defaultHookCalls);
  const injectedHookCalls: ExecutionRecordAuditWriterLifecycleHookInput[] = [];
  const hookResult = {
    status: "completed",
    ok: true,
    hookVersion: "execution_record_audit_writer_lifecycle_hook_v1",
    productionWritePathResult: {
      status: "completed",
      ok: true,
      warnings: [],
    },
    errors: [],
    warnings: ["hook_warning"],
    safety: {
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  } as unknown as ExecutionRecordAuditWriterLifecycleHookResult;
  const result = await runtime.transitionExecutionLifecycleAndAppendAuditEvent(
    callerInput,
    {
      appendLifecycleAuditEvent: async (input) => {
        injectedHookCalls.push(input as ExecutionRecordAuditWriterLifecycleHookInput);

        return hookResult;
      },
    },
  );

  expect(defaultHookCalls).toEqual([]);
  expect(injectedHookCalls).toHaveLength(1);
  expect(injectedHookCalls[0]).toMatchObject({
    runtimeIntegrationApproved: true,
    integrationPoint: "server_only_execution_lifecycle_transition_handler",
    operation: "insert_only_audit_append",
    targetTable: "public.execution_record_audit_events",
    transition: successfulTransition,
    executionRecordId: successfulTransition.event.recordId,
    requestId: "action-855-lifecycle-caller-request",
    metadata: {
      action: "855",
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
    status: "completed",
    ok: true,
    transition: successfulTransition,
    hookResult,
    warnings: ["hook_warning"],
    safety: {
      serverOnly: true,
      exactlyOneLifecycleCaller: true,
      lifecycleHookUsed: true,
      hookCalledOnlyAfterSuccessfulTransition: true,
      insertOnlyAuditAppend: true,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
      retryLoopAllowed: false,
    },
  });
});

test("lifecycle caller preserves diagnostics and does not retry when hook fails", async () => {
  const defaultHookCalls: unknown[] = [];
  const runtime = loadRuntimeCallerModule([successfulTransition], defaultHookCalls);
  const injectedHookCalls: unknown[] = [];
  const diagnostics = {
    category: "schema_constraint",
    code: "23514",
    message: "sanitized failure",
  };
  const hookResult = {
    status: "completed",
    ok: false,
    hookVersion: "execution_record_audit_writer_lifecycle_hook_v1",
    productionWritePathResult: {
      status: "completed",
      ok: false,
      diagnostics,
      warnings: ["diagnostic_warning"],
    },
    errors: [],
    warnings: ["diagnostic_warning"],
    safety: {
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  } as unknown as ExecutionRecordAuditWriterLifecycleHookResult;
  const result = await runtime.transitionExecutionLifecycleAndAppendAuditEvent(
    callerInput,
    {
      appendLifecycleAuditEvent: async (input) => {
        injectedHookCalls.push(input);

        return hookResult;
      },
    },
  );

  expect(injectedHookCalls).toHaveLength(1);
  expect(result).toMatchObject({
    status: "completed",
    ok: false,
    hookResult: {
      productionWritePathResult: {
        diagnostics,
      },
      warnings: ["diagnostic_warning"],
    },
    warnings: ["diagnostic_warning"],
    safety: {
      retryLoopAllowed: false,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  });
});

test("lifecycle caller source contains no downstream mutation or autonomous behavior hooks", () => {
  const source = read(callerPath);

  for (const forbidden of [
    "mutateTrade",
    "updateTrade",
    "profit",
    "loss",
    "submitBrokerOrder",
    "captureBrokerResult",
    "runScanner",
    "runAutomation",
  ]) {
    expect(source).not.toContain(forbidden);
  }

  expect(source).toContain("brokerAvanzaAllowed: false");
  expect(source).toContain("automaticModeAllowed: false");
  expect(source).toContain("tradeStatsPnlMutationAllowed: false");
  expect(source).toContain("marketLoopInvocationAllowed: false");
  expect(source).toContain("scannerAutomationInvocationAllowed: false");
  expect(read(hookPath)).not.toContain(callerImport);
});
