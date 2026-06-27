import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionLifecycleTransitionResult,
} from "../../lib/execution-state-machine";
import type {
  ExecutionRecordAuditWriterInput,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditWriterProductionWritePathInput,
  ExecutionRecordAuditWriterProductionWritePathResult,
} from "../../lib/server/execution-record-audit-writer-production-write-path";

const root = process.cwd();
const hookPath = join(
  root,
  "lib/server/execution-record-audit-writer-lifecycle-hook.ts",
);
const validationPath = join(
  root,
  "lib/server/execution-record-audit-writer-validation.ts",
);
const writePathImport = "execution-record-audit-writer-production-write-path";
const hookImport = "execution-record-audit-writer-lifecycle-hook";

type RuntimeHookModule = {
  appendExecutionLifecycleTransitionAuditEvent: (
    input: unknown,
    options?: {
      appendFromProductionWritePath?: (
        input: unknown,
      ) => Promise<ExecutionRecordAuditWriterProductionWritePathResult>;
    },
  ) => Promise<unknown>;
};

type RuntimeValidationModule = {
  validateExecutionRecordAuditWriterInput: (input: unknown) => {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
};

const transition = {
  ok: true,
  snapshot: {
    lifecycleId: "lifecycle-action-852",
    currentState: "completed",
    createdAt: "2026-06-26T14:32:00.000Z",
    updatedAt: "2026-06-26T14:33:00.000Z",
    mode: "semi_automatic",
    action: "buy",
    triggerType: "manual_entry_requested",
    events: [],
  },
  event: {
    eventId: "execution-event-action-852-001",
    type: "complete_execution",
    createdAt: "2026-06-26T14:33:00.000Z",
    fromState: "broker_result_captured",
    toState: "completed",
    recordId: "11111111-1111-4111-8111-111111111111",
    message: "Completed after validated broker result.",
    metadata: {
      fixture: "action_852_lifecycle_hook",
    },
  },
} satisfies ExecutionLifecycleTransitionResult;

const hookInput = {
  runtimeIntegrationApproved: true,
  integrationPoint: "server_only_execution_lifecycle_transition_handler",
  operation: "insert_only_audit_append",
  targetTable: "public.execution_record_audit_events",
  transition,
  requestId: "action-852-lifecycle-hook-request",
  actor: {
    actorType: "system",
    actorId: null,
  },
  metadata: {
    action: "852",
  },
} as const;

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

function loadRuntimeHookModule(): RuntimeHookModule {
  const source = read(hookPath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: hookPath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeHookModule>,
    require: (specifier: string) => {
      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-production-write-path"
      ) {
        return {
          appendExecutionRecordAuditEventFromProductionWritePath: async () => {
            throw new Error("default production write path should not be called");
          },
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: hookPath });

  return sandbox.exports as RuntimeHookModule;
}

function loadRuntimeValidationModule(): RuntimeValidationModule {
  const source = read(validationPath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: validationPath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeValidationModule>,
    require: (specifier: string) => {
      if (specifier === "@/lib/server/execution-record-audit-writer-contract") {
        return {
          EXECUTION_RECORD_AUDIT_WRITER_AUTHORITY_MODES: [
            "server_append_only",
            "dry_run",
            "blocked",
          ],
        };
      }

      return {};
    },
    WeakSet,
    Number,
    Array,
    Object,
    RegExp,
    String,
    Date,
  };

  vm.runInNewContext(transpiled, sandbox, { filename: validationPath });

  return sandbox.exports as RuntimeValidationModule;
}

test("lifecycle hook remains server-only and delegates only to production write path", () => {
  const source = read(hookPath);

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain(writePathImport);
  expect(source).toContain("appendExecutionRecordAuditEventFromProductionWritePath");
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
  expect(source).not.toMatch(/supabase\.(from|rpc|auth|storage)/);
  expect(source).not.toMatch(
    new RegExp("NEXT" + "_PUBLIC_[A-Z0-9_]*SERVICE", "i"),
  );
});

test("lifecycle hook is absent from UI, app shell, route, market, scanner, and automation runtime", () => {
  const disallowedRoots = ["app", "components", "hooks", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(hookImport))
    .map((path) => relative(root, path));
  const marketScannerMatches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => /market|scan|scanner|automation/i.test(relative(root, path)))
    .filter((path) => read(path).includes(hookImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
  expect(marketScannerMatches).toEqual([]);
});

test("lifecycle hook blocks before production write path when gates fail", async () => {
  const runtime = loadRuntimeHookModule();
  const productionCalls: unknown[] = [];
  const result = await runtime.appendExecutionLifecycleTransitionAuditEvent(
    {
      ...hookInput,
      runtimeIntegrationApproved: false,
      operation: "upsert",
      targetTable: "public.execution_records",
    },
    {
      appendFromProductionWritePath: async (input) => {
        productionCalls.push(input);
        throw new Error("should not call production write path");
      },
    },
  );

  expect(result).toMatchObject({
    status: "blocked",
    ok: false,
    productionWritePathResult: null,
    errors: [
      "runtime_integration_approval_required",
      "insert_only_audit_append_required",
      "audit_events_table_target_required",
    ],
    safety: {
      serverOnly: true,
      productionWritePathUsed: true,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  });
  expect(productionCalls).toEqual([]);
});

test("lifecycle hook blocks wrong integration point before production write path", async () => {
  const runtime = loadRuntimeHookModule();
  const productionCalls: unknown[] = [];
  const result = await runtime.appendExecutionLifecycleTransitionAuditEvent(
    {
      ...hookInput,
      integrationPoint: "server_only_route_boundary",
    },
    {
      appendFromProductionWritePath: async (input) => {
        productionCalls.push(input);
        throw new Error("should not call production write path");
      },
    },
  );

  expect(result).toMatchObject({
    status: "blocked",
    ok: false,
    productionWritePathResult: null,
    errors: ["server_only_lifecycle_integration_point_required"],
  });
  expect(productionCalls).toEqual([]);
});

test("lifecycle hook blocks failed transition results before production write path", async () => {
  const runtime = loadRuntimeHookModule();
  const productionCalls: unknown[] = [];
  const result = await runtime.appendExecutionLifecycleTransitionAuditEvent(
    {
      ...hookInput,
      transition: {
        ok: false,
        snapshot: transition.snapshot,
        error: "Invalid transition.",
      },
    },
    {
      appendFromProductionWritePath: async (input) => {
        productionCalls.push(input);
        throw new Error("should not call production write path");
      },
    },
  );

  expect(result).toMatchObject({
    status: "blocked",
    ok: false,
    productionWritePathResult: null,
    errors: ["successful_transition_required"],
  });
  expect(productionCalls).toEqual([]);
});

test("lifecycle hook constructs validated server-side payload and preserves write-path gates", async () => {
  const runtime = loadRuntimeHookModule();
  const productionCalls: ExecutionRecordAuditWriterProductionWritePathInput[] = [];
  const productionResult = {
    status: "completed",
    ok: true,
    writePathVersion: "execution_record_audit_writer_production_write_path_v1",
    writerResult: {
      status: "success",
      ok: true,
      inserted: true,
      auditEventId: "unconfirmed_without_select",
      executionRecordId: transition.event.recordId,
      idempotencyKey: "execution-lifecycle:idempotency",
      row: {},
      warnings: [],
      dryRun: {
        warnings: [],
      },
      adapterStatus: "success",
    },
    errors: [],
    warnings: [],
    safety: {
      serverOnly: true,
      internalWriterBoundaryUsed: true,
      routeBoundaryBypassed: false,
      validatedServerSidePayloadRequired: true,
      productionWritePathApproved: true,
      liveSmokeInsertApproved: false,
      insertOnlyAuditAppend: true,
      browserClientInvocationAllowed: false,
      uiWiringAdded: false,
      marketLoopInvocationAllowed: false,
      brokerAvanzaAllowed: false,
      automaticModeAllowed: false,
      tradeStatsPnlMutationAllowed: false,
      updateDeleteUpsertSelectAllowed: false,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  } as unknown as ExecutionRecordAuditWriterProductionWritePathResult;
  const result = await runtime.appendExecutionLifecycleTransitionAuditEvent(
    hookInput,
    {
      appendFromProductionWritePath: async (input) => {
        productionCalls.push(
          input as ExecutionRecordAuditWriterProductionWritePathInput,
        );

        return productionResult;
      },
    },
  );

  expect(productionCalls).toHaveLength(1);
  expect(productionCalls[0]).toMatchObject({
    productionWritePathApproved: true,
    liveSmokeInsertApproved: false,
    payloadSource: "validated_server_side_audit_payload",
    operation: "insert_only_audit_append",
    targetTable: "public.execution_record_audit_events",
  });

  const writerInput = productionCalls[0]?.input as ExecutionRecordAuditWriterInput;

  expect(writerInput.executionRecordId).toBe(transition.event.recordId);
  expect(writerInput.eventType).toBe("execution_lifecycle_complete_execution");
  expect(writerInput.source).toMatchObject({
    eventSource: "execution_lifecycle_transition_handler",
    sourceSystem: "trade_app",
    writerVersion: "execution_record_audit_writer_lifecycle_hook_v1",
  });
  expect(writerInput.idempotencyKey).toMatch(/^execution-lifecycle:/);
  expect(writerInput.idempotencyKey.length).toBeLessThanOrEqual(160);
  expect(writerInput.duplicatePreventionKey).toMatch(
    /^execution-lifecycle-duplicate:/,
  );
  expect(writerInput.duplicatePreventionKey?.length).toBeLessThanOrEqual(160);
  expect(writerInput.authorityMode).toBe("server_append_only");
  expect(writerInput.payload).toMatchObject({
    lifecycleId: transition.snapshot.lifecycleId,
    eventId: transition.event.eventId,
    eventType: "complete_execution",
    fromState: "broker_result_captured",
    toState: "completed",
    currentState: "completed",
  });
  expect(writerInput.provenance).toMatchObject({
    generatedBy: "execution_record_audit_writer_lifecycle_hook_v1",
    integrationPoint: "server_only_execution_lifecycle_transition_handler",
    targetTable: "public.execution_record_audit_events",
    operation: "insert_only_audit_append",
    productionWritePathUsed: true,
  });
  expect(writerInput.metadata).toMatchObject({
    lifecycleHookVersion: "execution_record_audit_writer_lifecycle_hook_v1",
    noDownstreamMutation: true,
    productionRolloutApproved: true,
    productionRolloutApproval: "action_887_approved_server_only_path",
    browserClientInvocationAllowed: false,
    marketLoopInvocationAllowed: false,
    brokerAvanzaAllowed: false,
    automaticModeAllowed: false,
  });
  expect(result).toMatchObject({
    status: "completed",
    ok: true,
    productionWritePathResult: productionResult,
    safety: {
      serverOnly: true,
      lifecycleTransitionHandler: true,
      insertOnlyAuditAppend: true,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  });
});

test("lifecycle hook normalizes non-uuid operator actor id before writer validation", async () => {
  const runtime = loadRuntimeHookModule();
  const validation = loadRuntimeValidationModule();
  const productionCalls: ExecutionRecordAuditWriterProductionWritePathInput[] = [];
  const productionResult = {
    status: "completed",
    ok: true,
    writePathVersion: "execution_record_audit_writer_production_write_path_v1",
    writerResult: {
      status: "success",
      ok: true,
      inserted: true,
      auditEventId: "unconfirmed_without_select",
      executionRecordId: "5d682086-4195-40ec-ba80-a0a1b39a6923",
      idempotencyKey: "execution-lifecycle:idempotency",
      row: {},
      warnings: [],
      dryRun: {
        warnings: [],
      },
      adapterStatus: "success",
    },
    errors: [],
    warnings: [],
    safety: {
      serverOnly: true,
      internalWriterBoundaryUsed: true,
      routeBoundaryBypassed: false,
      validatedServerSidePayloadRequired: true,
      productionWritePathApproved: true,
      liveSmokeInsertApproved: false,
      insertOnlyAuditAppend: true,
      browserClientInvocationAllowed: false,
      uiWiringAdded: false,
      marketLoopInvocationAllowed: false,
      brokerAvanzaAllowed: false,
      automaticModeAllowed: false,
      tradeStatsPnlMutationAllowed: false,
      updateDeleteUpsertSelectAllowed: false,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  } as unknown as ExecutionRecordAuditWriterProductionWritePathResult;
  const action873Transition = {
    ok: true,
    snapshot: {
      lifecycleId: "action_873_controlled_live_runtime_proof",
      currentState: "intent_created",
      createdAt: "2026-06-26T18:44:23.899Z",
      updatedAt: "2026-06-26T18:44:23.899Z",
      mode: "semi_automatic",
      action: "buy",
      triggerType: "manual_entry_requested",
      events: [],
    },
    event: {
      eventId: "action_873_controlled_live_runtime_proof_event",
      type: "create_intent",
      createdAt: "2026-06-26T18:44:23.899Z",
      fromState: "idle",
      toState: "intent_created",
      recordId: "5d682086-4195-40ec-ba80-a0a1b39a6923",
      message: "Action 873 controlled live runtime proof transition.",
      metadata: {
        action: "873",
      },
    },
  } satisfies ExecutionLifecycleTransitionResult;
  const result = await runtime.appendExecutionLifecycleTransitionAuditEvent(
    {
      ...hookInput,
      transition: action873Transition,
      executionRecordId: "5d682086-4195-40ec-ba80-a0a1b39a6923",
      requestId: "action_873_controlled_live_runtime_proof_request",
      actor: {
        actorType: "operator",
        actorId: "willy_simonsson",
      },
      traceId: "action_873_controlled_live_runtime_proof",
      sourceFingerprint:
        "action_873_controlled_live_runtime_proof:5d682086-4195-40ec-ba80-a0a1b39a6923",
      metadata: {
        action: "873",
        proofStage: "stage_c_controlled_live_runtime_proof",
      },
    },
    {
      appendFromProductionWritePath: async (input) => {
        productionCalls.push(
          input as ExecutionRecordAuditWriterProductionWritePathInput,
        );

        return productionResult;
      },
    },
  );

  expect(productionCalls).toHaveLength(1);

  const writerInput = productionCalls[0]?.input as ExecutionRecordAuditWriterInput;
  const validationResult = validation.validateExecutionRecordAuditWriterInput(
    writerInput,
  );

  expect(writerInput.actor).toEqual({
    actorType: "operator",
    actorId: null,
  });
  expect(validationResult).toEqual({
    valid: true,
    errors: [],
    warnings: [],
  });
  expect(result).toMatchObject({
    status: "completed",
    ok: true,
  });
});

test("lifecycle hook preserves diagnostics and does not retry on writer failure", async () => {
  const runtime = loadRuntimeHookModule();
  const productionCalls: ExecutionRecordAuditWriterProductionWritePathInput[] = [];
  const diagnostics = {
    category: "schema_constraint",
    code: "23514",
    status: null,
    message: "new row violates check constraint",
    details: "sanitized details",
    hint: null,
    constraint: "execution_record_audit_events_event_status_check",
  };
  const productionResult = {
    status: "completed",
    ok: false,
    writePathVersion: "execution_record_audit_writer_production_write_path_v1",
    writerResult: {
      status: "unknown_error",
      ok: false,
      inserted: false,
      errors: ["writer_failed"],
      diagnostics,
      warnings: ["diagnostic_warning"],
      dryRun: {
        warnings: [],
      },
      adapterStatus: "unknown_error",
    },
    diagnostics,
    errors: [],
    warnings: ["diagnostic_warning"],
    safety: {
      serverOnly: true,
      internalWriterBoundaryUsed: true,
      routeBoundaryBypassed: false,
      validatedServerSidePayloadRequired: true,
      productionWritePathApproved: true,
      liveSmokeInsertApproved: false,
      insertOnlyAuditAppend: true,
      browserClientInvocationAllowed: false,
      uiWiringAdded: false,
      marketLoopInvocationAllowed: false,
      brokerAvanzaAllowed: false,
      automaticModeAllowed: false,
      tradeStatsPnlMutationAllowed: false,
      updateDeleteUpsertSelectAllowed: false,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  } as unknown as ExecutionRecordAuditWriterProductionWritePathResult;
  const result = await runtime.appendExecutionLifecycleTransitionAuditEvent(
    hookInput,
    {
      appendFromProductionWritePath: async (input) => {
        productionCalls.push(
          input as ExecutionRecordAuditWriterProductionWritePathInput,
        );

        return productionResult;
      },
    },
  );

  expect(productionCalls).toHaveLength(1);
  expect(result).toMatchObject({
    status: "completed",
    ok: false,
    productionWritePathResult: {
      status: "completed",
      ok: false,
      diagnostics,
      warnings: ["diagnostic_warning"],
    },
    warnings: ["diagnostic_warning"],
    safety: {
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  });
});

test("lifecycle hook source contains no downstream mutation or autonomous behavior hooks", () => {
  const source = read(hookPath);

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
  expect(source).not.toContain("brokerAvanzaAllowed: true");
  expect(source).not.toContain("automaticModeAllowed: true");
  expect(source).not.toContain("tradeStatsPnlMutationAllowed: true");
});
