import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const harnessPath = join(
  root,
  "lib/server/execution-record-audit-writer-dry-run-runtime-proof-harness.ts",
);
const servicePath = join(
  root,
  "lib/server/execution-lifecycle-transition-service.ts",
);
const callerPath = join(
  root,
  "lib/server/execution-record-audit-writer-lifecycle-caller.ts",
);
const dryRunPath = join(
  root,
  "lib/server/execution-record-audit-writer-dry-run.ts",
);
const validationPath = join(
  root,
  "lib/server/execution-record-audit-writer-validation.ts",
);
const contractPath = join(
  root,
  "lib/server/execution-record-audit-writer-contract.ts",
);
const stateMachinePath = join(root, "lib/execution-state-machine.ts");
const harnessImport =
  "execution-record-audit-writer-dry-run-runtime-proof-harness";
const serviceImport = "execution-lifecycle-transition-service";
const dryRunImport = "execution-record-audit-writer-dry-run";
const lifecycleCallerImport = "execution-record-audit-writer-lifecycle-caller";
const lifecycleHookImport = "execution-record-audit-writer-lifecycle-hook";
const productionWritePathImport =
  "execution-record-audit-writer-production-write-path";
const serviceRoleAdapterImport =
  "execution-record-audit-writer-service-role-adapter";

type RuntimeHarnessModule = {
  runExecutionRecordAuditWriterDryRunRuntimeProofHarness: () => Promise<{
    status: string;
    ok: boolean;
    proofStage: string;
    successfulTransitionProducesWouldWritePayload: boolean;
    failedTransitionProducesNoWouldWritePayload: boolean;
    missingGateProducesNoWouldWritePayload: boolean;
    dryRunReady: boolean;
    dryRunWouldWriteFalse: boolean;
    payloadPreserved: boolean;
    idempotencyPreserved: boolean;
    diagnosticsPreserved: boolean;
    warningsPreserved: boolean;
    noRetryPreserved: boolean;
    noDatabaseWriteOccurred: boolean;
    noSupabaseQueryOccurred: boolean;
    noRealServiceRoleAdapterCallOccurred: boolean;
    noInsertUpdateDeleteUpsertSelectOccurred: boolean;
    wouldWritePayloadCount: number;
    wouldWritePayloads: unknown[];
    dryRunHookInputs: unknown[];
    dryRunWriterCallCount: number;
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

  const contractSandbox = {
    exports: {},
    require: () => ({}),
  };
  vm.runInNewContext(compile(contractPath), contractSandbox, {
    filename: contractPath,
  });

  const validationSandbox = {
    exports: {},
    require: (specifier: string) => {
      if (
        specifier === "@/lib/server/execution-record-audit-writer-contract"
      ) {
        return contractSandbox.exports;
      }

      return {};
    },
  };
  vm.runInNewContext(compile(validationPath), validationSandbox, {
    filename: validationPath,
  });

  const dryRunSandbox = {
    exports: {},
    require: (specifier: string) => {
      if (
        specifier === "@/lib/server/execution-record-audit-writer-validation"
      ) {
        return validationSandbox.exports;
      }

      return {};
    },
  };
  vm.runInNewContext(compile(dryRunPath), dryRunSandbox, {
    filename: dryRunPath,
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
              "default lifecycle hook must not run during dry-run proof",
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

      if (specifier === "@/lib/server/execution-record-audit-writer-dry-run") {
        return dryRunSandbox.exports;
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

test("dry-run runtime proof harness has the approved server-only no-write shape", () => {
  const source = read(harnessPath);

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain(serviceImport);
  expect(source).toContain(dryRunImport);
  expect(source).toContain("transitionExecutionLifecycleOnServer");
  expect(source).toContain("buildExecutionRecordAuditWriterDryRun");
  expect(source).toContain("runExecutionRecordAuditWriterDryRunRuntimeProofHarness");
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

test("dry-run runtime proof proves success would-write payload and failed no-payload behavior", async () => {
  const runtime = loadRuntimeHarnessModule();
  const result =
    await runtime.runExecutionRecordAuditWriterDryRunRuntimeProofHarness();

  expect(result).toMatchObject({
    status: "completed",
    ok: true,
    proofStage: "stage_b_dry_run_runtime_proof",
    successfulTransitionProducesWouldWritePayload: true,
    failedTransitionProducesNoWouldWritePayload: true,
    missingGateProducesNoWouldWritePayload: true,
    dryRunReady: true,
    dryRunWouldWriteFalse: true,
    payloadPreserved: true,
    idempotencyPreserved: true,
    diagnosticsPreserved: true,
    warningsPreserved: true,
    noRetryPreserved: true,
    noDatabaseWriteOccurred: true,
    noSupabaseQueryOccurred: true,
    noRealServiceRoleAdapterCallOccurred: true,
    noInsertUpdateDeleteUpsertSelectOccurred: true,
    wouldWritePayloadCount: 1,
    dryRunWriterCallCount: 1,
    errors: [],
    warnings: ["dry_run_runtime_proof_warning"],
    safety: {
      serverOnly: true,
      dryRunOnly: true,
      databaseWritesAllowed: false,
      databaseWritePerformed: false,
      supabaseQueryAllowed: false,
      supabaseQueryPerformed: false,
      liveInsertAllowed: false,
      liveInsertPerformed: false,
      realServiceRoleAdapterCallAllowed: false,
      realServiceRoleAdapterCalled: false,
      insertUpdateDeleteUpsertSelectAllowed: false,
      insertUpdateDeleteUpsertSelectPerformed: false,
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
  expect(result.dryRunHookInputs).toHaveLength(1);
  expect(result.wouldWritePayloads).toHaveLength(1);
});

test("dry-run runtime proof preserves payload, idempotency, diagnostics, warnings, and no-retry evidence", async () => {
  const runtime = loadRuntimeHarnessModule();
  const result =
    await runtime.runExecutionRecordAuditWriterDryRunRuntimeProofHarness();
  const payload = result.wouldWritePayloads[0] as {
    execution_record_id?: unknown;
    event_status?: unknown;
    event_type?: unknown;
    idempotency_key?: unknown;
    metadata?: { inputMetadata?: Record<string, unknown>; wouldWrite?: unknown };
    request_id?: unknown;
    source_fingerprint?: unknown;
  };
  const hookInput = result.dryRunHookInputs[0] as {
    sourceFingerprint?: unknown;
    metadata?: Record<string, unknown>;
  };

  expect(payload).toMatchObject({
    execution_record_id: "22222222-2222-4222-8222-222222222222",
    event_status: "dry_run_ready",
    event_type: "execution_lifecycle_complete_execution",
    request_id: "action-870-dry-run-runtime-proof",
    source_fingerprint:
      "execution_record_audit_writer_lifecycle_caller_v1:execution-event-action-870-dry-run-proof-001",
  });
  expect(payload.metadata).toMatchObject({
    wouldWrite: false,
    inputMetadata: {
      action: "870",
      proofStage: "stage_b_dry_run_runtime_proof",
      noRetry: true,
      noDownstreamMutation: true,
      databaseWritePerformed: false,
      supabaseQueryPerformed: false,
      realServiceRoleAdapterCalled: false,
      productionRolloutApproved: false,
    },
  });
  expect(payload.idempotency_key).toBe(
    "dry-run-runtime-proof:execution_record_audit_writer_lifecycle_caller_v1:execution-event-action-870-dry-run-proof-001",
  );
  expect(String(payload.idempotency_key).length).toBeLessThanOrEqual(160);
  expect(hookInput.sourceFingerprint).toBe(
    "execution_record_audit_writer_lifecycle_caller_v1:execution-event-action-870-dry-run-proof-001",
  );
  expect(JSON.stringify(result.wouldWritePayloads)).not.toMatch(
    /SERVICE_ROLE|service_role|secret|password|token|eyJ/i,
  );
});

test("dry-run runtime proof blocks failed transitions before any dry-run writer call", async () => {
  const { service } = loadRuntimeModules();
  const wouldWritePayloads: unknown[] = [];
  const appendLifecycleAuditEvent = async (input: unknown) => {
    wouldWritePayloads.push(input);

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
    lifecycleId: "lifecycle-action-871-dry-run-failed-proof",
    currentState: "broker_result_captured",
    createdAt: "2026-06-26T18:20:00.000Z",
    updatedAt: "2026-06-26T18:20:00.000Z",
    mode: "semi_automatic",
    action: "buy",
    triggerType: "manual_entry_requested",
    events: [],
  };

  const failed = await service.transitionExecutionLifecycleOnServer(
    {
      boundaryApproved: true,
      auditCallerWiringApproved: true,
      caller: "server_only_lifecycle_transition_boundary",
      snapshot,
      eventType: "create_intent",
      metadata: {
        action: "871",
        proofStage: "stage_b_dry_run_runtime_proof_regression",
      },
    },
    { appendLifecycleAuditEvent },
  );

  expect(failed).toMatchObject({
    status: "transition_failed",
    ok: false,
    errors: [
      "Invalid execution lifecycle transition from broker_result_captured using create_intent.",
    ],
    safety: {
      retryLoopAllowed: false,
      downstreamMutationAllowed: false,
    },
  });
  expect(wouldWritePayloads).toEqual([]);
});

test("dry-run runtime proof blocks approval gates before any dry-run writer call", async () => {
  const { service } = loadRuntimeModules();
  const wouldWritePayloads: unknown[] = [];
  const appendLifecycleAuditEvent = async (input: unknown) => {
    wouldWritePayloads.push(input);

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
    lifecycleId: "lifecycle-action-871-dry-run-gate-proof",
    currentState: "broker_result_captured",
    createdAt: "2026-06-26T18:21:00.000Z",
    updatedAt: "2026-06-26T18:21:00.000Z",
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
  expect(wouldWritePayloads).toEqual([]);
});

test("dry-run runtime proof keeps would-write payload redacted and non-mutating", async () => {
  const runtime = loadRuntimeHarnessModule();
  const result =
    await runtime.runExecutionRecordAuditWriterDryRunRuntimeProofHarness();
  const serializedPayload = JSON.stringify(result.wouldWritePayloads);

  expect(result.ok).toBe(true);
  expect(serializedPayload).not.toMatch(
    /SERVICE_ROLE|service_role|secret|password|credential|cookie|authorization|bearer|eyJ/i,
  );
  expect(serializedPayload).toContain("\"wouldWrite\":false");
  expect(serializedPayload).toContain("\"databaseWritePerformed\":false");
  expect(serializedPayload).toContain("\"supabaseQueryPerformed\":false");
  expect(serializedPayload).toContain("\"realServiceRoleAdapterCalled\":false");
  expect(serializedPayload).toContain("\"noDownstreamMutation\":true");
  expect(serializedPayload).not.toMatch(/tradeStatsPnlMutationAllowed":true/);
  expect(serializedPayload).not.toMatch(/brokerAvanzaAllowed":true/);
  expect(serializedPayload).not.toMatch(/automaticModeAllowed":true/);
});

test("dry-run runtime proof harness source stays free of broker, Avanza, automatic, and downstream mutation behavior", () => {
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

test("dry-run runtime proof harness is absent from UI, app shell, routes, hooks, and scripts", () => {
  const disallowedRoots = ["app", "components", "hooks", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(harnessImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});

test("dry-run runtime proof harness is absent from route handlers and app shell entry files", () => {
  const appFiles = listSourceFiles(join(root, "app"));
  const routeMatches = appFiles
    .filter((path) => /route\.(tsx?|jsx?)$/.test(path))
    .filter((path) => read(path).includes(harnessImport))
    .map((path) => relative(root, path));
  const shellMatches = appFiles
    .filter((path) => /(?:layout|page|template|loading|error)\.(tsx?|jsx?)$/.test(path))
    .filter((path) => read(path).includes(harnessImport))
    .map((path) => relative(root, path));

  expect(routeMatches).toEqual([]);
  expect(shellMatches).toEqual([]);
});

test("dry-run runtime proof harness is absent from market, scanner, and automation runtime", () => {
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
