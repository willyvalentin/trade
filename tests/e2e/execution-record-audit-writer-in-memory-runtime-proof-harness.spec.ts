import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const harnessPath = join(
  root,
  "lib/server/execution-record-audit-writer-in-memory-runtime-proof-harness.ts",
);
const servicePath = join(
  root,
  "lib/server/execution-lifecycle-transition-service.ts",
);
const callerPath = join(
  root,
  "lib/server/execution-record-audit-writer-lifecycle-caller.ts",
);
const stateMachinePath = join(root, "lib/execution-state-machine.ts");
const harnessImport =
  "execution-record-audit-writer-in-memory-runtime-proof-harness";
const serviceImport = "execution-lifecycle-transition-service";
const lifecycleCallerImport = "execution-record-audit-writer-lifecycle-caller";
const lifecycleHookImport = "execution-record-audit-writer-lifecycle-hook";
const productionWritePathImport =
  "execution-record-audit-writer-production-write-path";
const serviceRoleAdapterImport =
  "execution-record-audit-writer-service-role-adapter";

type RuntimeHarnessModule = {
  runExecutionRecordAuditWriterInMemoryRuntimeProofHarness: () => Promise<{
    status: string;
    ok: boolean;
    proofStage: string;
    successfulTransitionCreatesAppendIntent: boolean;
    failedTransitionCreatesNoAppendIntent: boolean;
    payloadPreserved: boolean;
    idempotencyPreserved: boolean;
    diagnosticsPreserved: boolean;
    warningsPreserved: boolean;
    noRetryPreserved: boolean;
    appendIntentCount: number;
    appendIntents: unknown[];
    errors: string[];
    warnings: string[];
    safety: Record<string, unknown>;
  }>;
};

type RuntimeServiceModule = {
  transitionExecutionLifecycleOnServer: (
    input: {
      boundaryApproved: boolean;
      auditCallerWiringApproved: boolean;
      caller: string;
      snapshot: Record<string, unknown>;
      eventType: string;
      transitionOptions?: Record<string, unknown>;
      executionRecordId?: string | null;
      requestId?: string | null;
      actor?: Record<string, unknown> | null;
      metadata?: Record<string, unknown> | null;
    },
    options?: {
      appendLifecycleAuditEvent?: (input: unknown) => Promise<unknown>;
    },
  ) => Promise<{
    status: string;
    ok: boolean;
    auditCallerResult: unknown;
    errors: string[];
    safety: Record<string, unknown>;
  }>;
};

type RuntimeModules = {
  harness: RuntimeHarnessModule;
  service: RuntimeServiceModule;
};

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function compile(path: string) {
  return ts.transpileModule(read(path).replace('import "server-only";', ""), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: path,
  }).outputText;
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

function loadRuntimeModules(): RuntimeModules {
  const stateMachineSandbox = {
    exports: {},
    require: () => ({}),
  };
  vm.runInNewContext(compile(stateMachinePath), stateMachineSandbox, {
    filename: stateMachinePath,
  });

  const callerSandbox = {
    exports: {},
    require: (specifier: string) => {
      if (specifier === "@/lib/execution-state-machine") {
        return stateMachineSandbox.exports;
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-lifecycle-hook"
      ) {
        return {
          appendExecutionLifecycleTransitionAuditEvent: async () => {
            throw new Error(
              "default lifecycle hook must not run during in-memory proof",
            );
          },
        };
      }

      return {};
    },
  };
  vm.runInNewContext(compile(callerPath), callerSandbox, {
    filename: callerPath,
  });

  const serviceSandbox = {
    exports: {},
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
  vm.runInNewContext(compile(servicePath), serviceSandbox, {
    filename: servicePath,
  });

  const harnessSandbox = {
    exports: {},
    require: (specifier: string) => {
      if (specifier === "@/lib/server/execution-lifecycle-transition-service") {
        return serviceSandbox.exports;
      }

      return {};
    },
  };
  vm.runInNewContext(compile(harnessPath), harnessSandbox, {
    filename: harnessPath,
  });

  return {
    harness: harnessSandbox.exports as RuntimeHarnessModule,
    service: serviceSandbox.exports as RuntimeServiceModule,
  };
}

function loadRuntimeHarnessModule(): RuntimeHarnessModule {
  return loadRuntimeModules().harness;
}

test("in-memory runtime proof harness has the approved server-only no-write shape", () => {
  const source = read(harnessPath);

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain(serviceImport);
  expect(source).toContain("transitionExecutionLifecycleOnServer");
  expect(source).toContain("runExecutionRecordAuditWriterInMemoryRuntimeProofHarness");
  expect(source).not.toContain(lifecycleCallerImport);
  expect(source).not.toContain(lifecycleHookImport);
  expect(source).not.toContain(productionWritePathImport);
  expect(source).not.toContain(serviceRoleAdapterImport);
  expect(source).not.toContain("@supabase/");
  expect(source).not.toContain("createClient");
  expect(source).not.toContain("createServiceRole");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("NEXT_PUBLIC_");
  expect(source).not.toContain("SUPABASE_SERVICE_ROLE");
  expect(source).not.toContain("service_role");
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
  expect(source).not.toContain("tradeStatsPnlMutationAllowed: true");
  expect(source).not.toContain("downstreamMutationAllowed: true");
  expect(source).not.toContain("retryLoopAllowed: true");
  expect(source).not.toContain("brokerAvanzaBehaviorAllowed: true");
  expect(source).not.toContain("automaticModeAllowed: true");
  expect(source).not.toMatch(/console\./);
  expect(source).not.toMatch(/SUPABASE_SERVICE_ROLE(KEY|_SECRET)?\s*=/);
});

test("in-memory runtime proof harness proves success append intent and failed no-append behavior", async () => {
  const runtime = loadRuntimeHarnessModule();
  const result =
    await runtime.runExecutionRecordAuditWriterInMemoryRuntimeProofHarness();

  expect(result).toMatchObject({
    status: "completed",
    ok: true,
    proofStage: "stage_a_in_memory_runtime_proof",
    successfulTransitionCreatesAppendIntent: true,
    failedTransitionCreatesNoAppendIntent: true,
    payloadPreserved: true,
    idempotencyPreserved: true,
    diagnosticsPreserved: true,
    warningsPreserved: true,
    noRetryPreserved: true,
    appendIntentCount: 1,
    errors: [],
    warnings: ["in_memory_runtime_proof_warning"],
    safety: {
      serverOnly: true,
      inMemoryOnly: true,
      databaseWritesAllowed: false,
      supabaseQueryAllowed: false,
      liveInsertAllowed: false,
      realServiceRoleAdapterCallAllowed: false,
      insertUpdateDeleteUpsertSelectAllowed: false,
      uiBrowserInvocationAllowed: false,
      appShellImportAllowed: false,
      marketScannerAutomationInvocationAllowed: false,
      brokerAvanzaBehaviorAllowed: false,
      automaticModeAllowed: false,
      productionRolloutAllowed: false,
      serviceRoleExposed: false,
      retryLoopAllowed: false,
      downstreamMutationAllowed: false,
    },
  });
  expect(result.appendIntents).toHaveLength(1);
  expect(result.appendIntents[0]).toMatchObject({
    runtimeIntegrationApproved: true,
    integrationPoint: "server_only_execution_lifecycle_transition_handler",
    operation: "insert_only_audit_append",
    targetTable: "public.execution_record_audit_events",
    executionRecordId: "11111111-1111-4111-8111-111111111111",
    requestId: "action-867-in-memory-runtime-proof",
    metadata: {
      action: "867",
      proofStage: "stage_a_in_memory_runtime_proof",
      boundary: "server_only_lifecycle_transition_boundary",
      boundaryToAuditCallerWiring: "action_863_approved",
      lifecycleCallerVersion:
        "execution_record_audit_writer_lifecycle_caller_v1",
      lifecycleCaller: "server_only_execution_lifecycle_transition_module",
      noRetry: true,
      noDownstreamMutation: true,
      productionRolloutApproved: false,
    },
  });
  expect(JSON.stringify(result.appendIntents)).not.toMatch(
    /SUPABASE|SERVICE_ROLE|service_role|secret|password|token|eyJ/i,
  );
});

test("in-memory runtime proof harness preserves deterministic bounded idempotency, diagnostics, warnings, and no-retry evidence", async () => {
  const runtime = loadRuntimeHarnessModule();
  const result =
    await runtime.runExecutionRecordAuditWriterInMemoryRuntimeProofHarness();
  const intent = result.appendIntents[0] as {
    sourceFingerprint?: unknown;
    metadata?: Record<string, unknown>;
  };

  expect(result.ok).toBe(true);
  expect(result.payloadPreserved).toBe(true);
  expect(result.idempotencyPreserved).toBe(true);
  expect(result.diagnosticsPreserved).toBe(true);
  expect(result.warningsPreserved).toBe(true);
  expect(result.noRetryPreserved).toBe(true);
  expect(result.warnings).toEqual(["in_memory_runtime_proof_warning"]);
  expect(intent.sourceFingerprint).toBe(
    "execution_record_audit_writer_lifecycle_caller_v1:execution-event-action-867-in-memory-proof-001",
  );
  expect(String(intent.sourceFingerprint).length).toBeLessThan(120);
  expect(intent.metadata).toMatchObject({
    noRetry: true,
    noDownstreamMutation: true,
    productionRolloutApproved: false,
  });
});

test("in-memory runtime proof chain blocks missing approval gates before append intent", async () => {
  const { service } = loadRuntimeModules();
  const appendIntents: unknown[] = [];
  const appendLifecycleAuditEvent = async (input: unknown) => {
    appendIntents.push(input);

    return {
      status: "completed",
      ok: true,
      errors: [],
      warnings: [],
      safety: {
        retryLoopAllowed: false,
        downstreamMutationAllowed: false,
      },
    };
  };
  const snapshot = {
    lifecycleId: "lifecycle-action-868-gate-proof",
    currentState: "broker_result_captured",
    createdAt: "2026-06-26T19:55:00.000Z",
    updatedAt: "2026-06-26T19:55:00.000Z",
    mode: "semi_automatic",
    action: "buy",
    triggerType: "manual_entry_requested",
    events: [],
  };

  const boundaryBlocked = await service.transitionExecutionLifecycleOnServer(
    {
      boundaryApproved: false,
      auditCallerWiringApproved: true,
      caller: "server_only_lifecycle_transition_boundary",
      snapshot,
      eventType: "complete_execution",
    },
    { appendLifecycleAuditEvent },
  );
  const wiringBlocked = await service.transitionExecutionLifecycleOnServer(
    {
      boundaryApproved: true,
      auditCallerWiringApproved: false,
      caller: "server_only_lifecycle_transition_boundary",
      snapshot,
      eventType: "complete_execution",
    },
    { appendLifecycleAuditEvent },
  );

  expect(boundaryBlocked).toMatchObject({
    status: "blocked",
    ok: false,
    auditCallerResult: null,
    errors: ["server_only_lifecycle_transition_boundary_approval_required"],
  });
  expect(wiringBlocked).toMatchObject({
    status: "blocked",
    ok: false,
    auditCallerResult: null,
    errors: ["boundary_to_audit_caller_wiring_approval_required"],
  });
  expect(appendIntents).toEqual([]);
});

test("in-memory runtime proof harness source stays free of broker, Avanza, automatic, and downstream mutation behavior", () => {
  const source = read(harnessPath);

  expect(source).not.toMatch(/from ["'].*broker/i);
  expect(source).not.toMatch(/from ["'].*avanza/i);
  expect(source).not.toMatch(/from ["'].*(?:market|scanner|automation)/i);
  expect(source).not.toMatch(/run[-_]?scan|executeScan|startAutomation/i);
  expect(source).not.toMatch(/from ["'].*(?:trade|stats|pnl|profit|loss)/i);
  expect(source).not.toMatch(/mutateTrade|updateStats|recordPnL|recordPnl/i);
  expect(source).not.toContain("marketScannerAutomationInvocationAllowed: true");
  expect(source).not.toContain("marketLoopInvocationAllowed: true");
  expect(source).not.toContain("scannerAutomationInvocationAllowed: true");
  expect(source).not.toContain("automaticModeAllowed: true");
  expect(source).not.toContain("brokerAvanzaBehaviorAllowed: true");
  expect(source).not.toContain("brokerAvanzaAllowed: true");
  expect(source).not.toContain("tradeStatsPnlMutationAllowed: true");
  expect(source).not.toContain("downstreamMutationAllowed: true");
});

test("in-memory runtime proof harness is absent from UI, app shell, routes, hooks, and scripts", () => {
  const disallowedRoots = ["app", "components", "hooks", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(harnessImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});

test("in-memory runtime proof harness is not imported by non-test runtime files", () => {
  const runtimeRoots = ["app", "components", "hooks", "lib", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = runtimeRoots
    .flatMap(listSourceFiles)
    .filter((path) => path !== harnessPath)
    .filter((path) => !relative(root, path).startsWith("lib/server/"))
    .filter((path) => read(path).includes(harnessImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});

test("in-memory runtime proof harness is absent from market, scanner, and automation runtime", () => {
  const disallowedRoots = ["app", "components", "hooks", "lib", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => /market|scan|scanner|automation/i.test(relative(root, path)))
    .filter((path) => read(path).includes(harnessImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});
