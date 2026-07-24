import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditWriterInput,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditServiceRoleAdapterLiveResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter";
import type {
  ExecutionRecordAuditWriterResultWithDryRun,
} from "../../lib/server/execution-record-audit-writer";
import type {
  ExecutionRecordAuditWriterProductionWritePathInput,
  ExecutionRecordAuditWriterProductionWritePathResult,
} from "../../lib/server/execution-record-audit-writer-production-write-path";

const root = process.cwd();
const writerPath = join(root, "lib/server/execution-record-audit-writer.ts");
const adapterPath = join(
  root,
  "lib/server/execution-record-audit-writer-service-role-adapter.ts",
);
const writePathPath = join(
  root,
  "lib/server/execution-record-audit-writer-production-write-path.ts",
);
const routePath = join(root, "app/api/execution/audit/writer/route.ts");
const writePathImport = "execution-record-audit-writer-production-write-path";

type RuntimeWriterModule = {
  appendExecutionRecordAuditEvent: (
    input: unknown,
    options?: {
      insertWithServiceRole?: (input: {
        insert: ExecutionRecordAuditEventInsert;
      }) => Promise<ExecutionRecordAuditServiceRoleAdapterLiveResult>;
    },
  ) => Promise<ExecutionRecordAuditWriterResultWithDryRun>;
};

type RuntimeWritePathModule = {
  appendExecutionRecordAuditEventFromProductionWritePath: (
    input: unknown,
  ) => Promise<ExecutionRecordAuditWriterProductionWritePathResult>;
};

type WriterSuccessResult = Extract<
  ExecutionRecordAuditWriterResultWithDryRun,
  { status: "success" }
>;

type ProductionCompletedResult = Extract<
  ExecutionRecordAuditWriterProductionWritePathResult,
  { status: "completed" }
>;

const writerInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "action_846_success_regression",
  source: {
    eventSource: "action_846_success_regression",
    sourceSystem: "trade_app",
    sourceFingerprint: "action-846-success-regression-fingerprint",
    traceId: "action-846-success-regression-trace",
    writerVersion: "action_847_success_regression",
  },
  requestId: "action-846-success-regression-request",
  idempotencyKey: "action-846-success-regression:idempotency",
  duplicatePreventionKey: "action-846-success-regression:duplicate",
  actor: {
    actorType: "operator",
    actorId: null,
  },
  authorityMode: "server_append_only",
  payload: {
    smoke_test: true,
    production_rollout: false,
  },
  evidence: {
    action: "847",
    source: "mocked_success_regression",
  },
  provenance: {
    generatedBy: "action_847_test",
  },
  occurredAt: "2026-06-26T02:47:00.000Z",
  schemaVersion: "1",
  metadata: {
    deterministic: true,
  },
} satisfies ExecutionRecordAuditWriterInput;

const dryRunInsert = {
  actor_id: null,
  actor_type: "operator",
  duplicate_prevention_key: writerInput.duplicatePreventionKey,
  event_payload: writerInput.payload,
  event_source: writerInput.source.eventSource,
  event_status: "dry_run_ready",
  event_type: writerInput.eventType,
  evidence_payload: writerInput.evidence,
  execution_record_id: writerInput.executionRecordId,
  idempotency_key: writerInput.idempotencyKey,
  metadata: {
    authorityMode: writerInput.authorityMode,
    inputMetadata: writerInput.metadata,
    provenance: writerInput.provenance,
    wouldWrite: false,
  },
  occurred_at: writerInput.occurredAt,
  request_id: writerInput.requestId,
  schema_version: "1",
  source_fingerprint: writerInput.source.sourceFingerprint,
  source_system: writerInput.source.sourceSystem,
  trace_id: writerInput.source.traceId,
  writer_version: writerInput.source.writerVersion,
} satisfies ExecutionRecordAuditEventInsert;

const readyDryRun = {
  status: "ready",
  ok: true,
  wouldWrite: false,
  wouldInsert: dryRunInsert,
  validation: {
    valid: true,
    errors: [],
    warnings: [],
  },
  warnings: [],
} as const;

const productionInput = {
  productionWritePathApproved: true,
  liveSmokeInsertApproved: false,
  payloadSource: "validated_server_side_audit_payload",
  operation: "insert_only_audit_append",
  targetTable: "public.execution_record_audit_events",
  input: writerInput,
} satisfies ExecutionRecordAuditWriterProductionWritePathInput;

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

function transpile(path: string): string {
  return ts.transpileModule(read(path).replace('import "server-only";', ""), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: path,
  }).outputText;
}

function loadRuntimeWriterModule(): RuntimeWriterModule {
  const sandbox = {
    exports: {} as Partial<RuntimeWriterModule>,
    require: (specifier: string) => {
      if (specifier === "@/lib/server/execution-record-audit-writer-validation") {
        return {
          validateExecutionRecordAuditWriterInput: () => ({
            valid: true,
            errors: [],
            warnings: [],
          }),
        };
      }

      if (specifier === "@/lib/server/execution-record-audit-writer-dry-run") {
        return {
          buildExecutionRecordAuditWriterDryRun: () => readyDryRun,
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-service-role-adapter"
      ) {
        return {
          insertExecutionRecordAuditEventWithServiceRole: async () => {
            throw new Error("default adapter should not be called");
          },
        };
      }

      if (specifier === "@/lib/server/execution-record-audit-writer-contract") {
        return {
          EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION:
            "execution_record_audit_writer_server_only_contract_v1",
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpile(writerPath), sandbox, { filename: writerPath });
  return sandbox.exports as RuntimeWriterModule;
}

function loadRuntimeWritePathModule(
  writerResult: ExecutionRecordAuditWriterResultWithDryRun,
  writerCalls: unknown[],
): RuntimeWritePathModule {
  const sandbox = {
    exports: {} as Partial<RuntimeWritePathModule>,
    require: (specifier: string) => {
      if (specifier === "@/lib/server/execution-record-audit-writer") {
        return {
          appendExecutionRecordAuditEvent: async (input: unknown) => {
            writerCalls.push(input);

            return writerResult;
          },
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-runtime-monitoring"
      ) {
        return {
          recordExecutionRecordAuditWriterRuntimeMonitoringEvent: () => ({
            version: "execution_record_audit_writer_runtime_monitoring_v1",
            path: "audit_writer_runtime_persistence",
            targetTable: "public.execution_record_audit_events",
            operation: "insert_only_audit_append",
            statusCategory: "success",
            writerStatus: "success",
            adapterStatus: "success",
            inserted: true,
            noRetry: true,
            diagnostics: {
              category: null,
              code: null,
              message: null,
            },
            serviceRoleAvailability: {
              checked: true,
              available: true,
              unavailable: false,
            },
            counters: {
              total: 1,
              success: 1,
              failure: 0,
              blocked: 0,
              insertedTrue: 1,
              insertedFalse: 0,
            },
            safety: {
              serverOnly: true,
              serviceRoleValuesCaptured: false,
              databaseWritesAllowed: false,
              supabaseQueryAllowed: false,
              updateDeleteUpsertSelectAllowed: false,
            },
          }),
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpile(writePathPath), sandbox, {
    filename: writePathPath,
  });

  return sandbox.exports as RuntimeWritePathModule;
}

test("success regression locks writer success envelope without select confirmation", async () => {
  const runtimeWriter = loadRuntimeWriterModule();
  const seenInserts: ExecutionRecordAuditEventInsert[] = [];
  const result = await runtimeWriter.appendExecutionRecordAuditEvent(writerInput, {
    insertWithServiceRole: async ({ insert }) => {
      seenInserts.push(insert);

      return {
        status: "success",
        ok: true,
        version: "execution_record_audit_service_role_adapter_live_v1",
        targetTable: "public.execution_record_audit_events",
        operation: "insert",
        insertAttempted: true,
        inserted: true,
        serviceRoleUsed: true,
        queryPerformed: false,
        routeCalled: false,
        uiMutated: false,
        downstreamMutated: false,
        externalOrderCalled: false,
        externalBrowserCalled: false,
        automationEnabled: false,
        idempotencyKey: insert.idempotency_key,
        insertSummary: {
          eventStatus: insert.event_status ?? null,
          eventType: insert.event_type ?? null,
          executionRecordId: insert.execution_record_id ?? null,
          sourceSystem: insert.source_system ?? null,
          idempotencyKeyPresent: true,
          duplicatePreventionKeyPresent: true,
        },
        warnings: [],
        errors: [],
      };
    },
  });

  expect(seenInserts).toHaveLength(1);
  expect(seenInserts[0]?.event_status).toBe("attempted");
  expect(seenInserts[0]?.metadata).toMatchObject({
    dryRunEventStatus: "dry_run_ready",
    liveEventStatus: "attempted",
    liveWrite: true,
  });
  expect(result.status).toBe("success");
  const successResult = result as WriterSuccessResult;

  expect(result.ok).toBe(true);
  expect(successResult.inserted).toBe(true);
  expect("diagnostics" in successResult ? successResult.diagnostics : null).toBeNull();
  expect(successResult.auditEventId).toBe("unconfirmed_without_select");
  expect(successResult.warnings).toContain(
    "audit_event_id_unconfirmed_without_select",
  );
  expect(result.dryRun.wouldInsert?.event_status).toBe("dry_run_ready");
});

test("production write path preserves successful writer envelope without diagnostics", async () => {
  const writerSuccess = {
    status: "success",
    ok: true,
    inserted: true,
    auditEventId: "unconfirmed_without_select",
    executionRecordId: writerInput.executionRecordId,
    idempotencyKey: writerInput.idempotencyKey,
    row: {
      actor_id: null,
      actor_type: "operator",
      created_at: "unconfirmed_without_select",
      duplicate_prevention_key: writerInput.duplicatePreventionKey,
      event_payload: writerInput.payload,
      event_source: writerInput.source.eventSource,
      event_status: "attempted",
      event_type: writerInput.eventType,
      evidence_payload: writerInput.evidence,
      execution_record_id: writerInput.executionRecordId,
      id: "unconfirmed_without_select",
      idempotency_key: writerInput.idempotencyKey,
      metadata: {
        liveWrite: true,
      },
      occurred_at: writerInput.occurredAt,
      request_id: writerInput.requestId,
      schema_version: "1",
      source_fingerprint: writerInput.source.sourceFingerprint,
      source_system: writerInput.source.sourceSystem,
      trace_id: writerInput.source.traceId,
      writer_version: writerInput.source.writerVersion,
    },
    warnings: ["audit_event_id_unconfirmed_without_select"],
    dryRun: {
      contractVersion: "execution_record_audit_writer_server_only_contract_v1",
      skeletonVersion: "execution_record_audit_writer_implementation_skeleton_v1",
      status: "ready",
      wouldWrite: false,
      wouldInsert: dryRunInsert,
      executionRecordId: writerInput.executionRecordId,
      eventType: writerInput.eventType,
      eventSource: writerInput.source.eventSource,
      sourceSystem: writerInput.source.sourceSystem,
      requestId: writerInput.requestId,
      idempotencyKey: writerInput.idempotencyKey,
      warnings: [],
    },
    adapterStatus: "success",
  } as ExecutionRecordAuditWriterResultWithDryRun;
  const writerCalls: unknown[] = [];
  const runtime = loadRuntimeWritePathModule(writerSuccess, writerCalls);
  const result =
    await runtime.appendExecutionRecordAuditEventFromProductionWritePath(
      productionInput,
    );

  expect(writerCalls).toEqual([writerInput]);
  expect(result.status).toBe("completed");
  const completedResult = result as ProductionCompletedResult;
  const completedWriterResult =
    completedResult.writerResult as WriterSuccessResult;

  expect(completedResult.ok).toBe(true);
  expect(completedWriterResult.status).toBe("success");
  expect(completedWriterResult.inserted).toBe(true);
  expect(completedResult.diagnostics ?? null).toBeNull();
  expect(completedWriterResult.auditEventId).toBe("unconfirmed_without_select");
  expect(completedWriterResult.row.event_status).toBe("attempted");
  expect(completedResult.safety).toMatchObject({
    serverOnly: true,
    insertOnlyAuditAppend: true,
    browserClientInvocationAllowed: false,
    marketLoopInvocationAllowed: false,
    brokerAvanzaAllowed: false,
    automaticModeAllowed: false,
    tradeStatsPnlMutationAllowed: false,
    updateDeleteUpsertSelectAllowed: false,
    downstreamMutationAllowed: false,
    serviceRoleExposed: false,
  });
});

test("success path source remains insert-only and has no retry loop or select requirement", () => {
  const writerSource = read(writerPath);
  const adapterSource = read(adapterPath);
  const writePathSource = read(writePathPath);

  expect(writePathSource.startsWith('import "server-only";')).toBe(true);
  expect(writePathSource).not.toContain("fetch(");
  expect(writePathSource).not.toContain(".from(");
  expect(writePathSource).not.toContain(".insert(");
  expect(writePathSource).not.toContain(".select(");
  expect(writePathSource).not.toContain(".update(");
  expect(writePathSource).not.toContain(".delete(");
  expect(writePathSource).not.toContain(".upsert(");
  expect(writerSource).not.toContain(".select(");
  expect(writerSource).not.toContain(".update(");
  expect(writerSource).not.toContain(".delete(");
  expect(writerSource).not.toContain(".upsert(");
  expect(adapterSource).toContain('.from("execution_record_audit_events")');
  expect(adapterSource).toContain(".insert(input.insert)");
  expect(adapterSource).not.toContain(".select(");
  expect(adapterSource).not.toContain(".update(");
  expect(adapterSource).not.toContain(".delete(");
  expect(adapterSource).not.toContain(".upsert(");
  expect(writerSource).not.toMatch(/for\s*\(|while\s*\(/);
  expect(writePathSource).not.toMatch(/for\s*\(|while\s*\(/);
});

test("success path remains absent from UI/browser/app-shell and market-loop runtime", () => {
  const runtimeRoots = ["app", "components", "hooks", "scripts"].map((entry) =>
    join(root, entry),
  );
  const runtimeMatches = runtimeRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(writePathImport))
    .map((path) => relative(root, path));
  const marketScannerMatches = runtimeRoots
    .flatMap(listSourceFiles)
    .filter((path) => /market|scan|scanner|automation/i.test(relative(root, path)))
    .filter((path) => read(path).includes(writePathImport))
    .map((path) => relative(root, path));

  expect(runtimeMatches).toEqual([]);
  expect(marketScannerMatches).toEqual([]);
  expect(read(routePath)).not.toContain(writePathImport);
});

test("failure diagnostics remain available for non-success results", async () => {
  const runtimeWriter = loadRuntimeWriterModule();
  const result = await runtimeWriter.appendExecutionRecordAuditEvent(writerInput, {
    insertWithServiceRole: async ({ insert }) => ({
      status: "unknown_error",
      ok: false,
      version: "execution_record_audit_service_role_adapter_live_v1",
      targetTable: "public.execution_record_audit_events",
      operation: "insert",
      insertAttempted: true,
      inserted: false,
      serviceRoleUsed: true,
      queryPerformed: false,
      routeCalled: false,
      uiMutated: false,
      downstreamMutated: false,
      externalOrderCalled: false,
      externalBrowserCalled: false,
      automationEnabled: false,
      idempotencyKey: insert.idempotency_key,
      insertSummary: {
        eventStatus: insert.event_status ?? null,
        eventType: insert.event_type ?? null,
        executionRecordId: insert.execution_record_id ?? null,
        sourceSystem: insert.source_system ?? null,
        idempotencyKeyPresent: true,
        duplicatePreventionKeyPresent: true,
      },
      diagnostics: {
        category: "schema_constraint",
        code: "23514",
        status: null,
        message: "mocked failure",
        details: null,
        hint: null,
        constraint: "execution_record_audit_events_event_status_check",
      },
      errorCode: "23514",
      warnings: [],
      errors: ["schema_or_constraint_mismatch"],
    }),
  });

  expect(result.status).toBe("unknown_error");
  expect("diagnostics" in result ? result.diagnostics : null).toMatchObject({
    category: "schema_constraint",
    code: "23514",
    insertSummary: {
      eventStatus: "attempted",
    },
  });
});

test("service unavailable diagnostics identify missing service-role client without real write", async () => {
  const runtimeWriter = loadRuntimeWriterModule();
  const seenInserts: ExecutionRecordAuditEventInsert[] = [];
  const result = await runtimeWriter.appendExecutionRecordAuditEvent(writerInput, {
    insertWithServiceRole: async ({ insert }) => {
      seenInserts.push(insert);

      return {
        status: "service_unavailable",
        ok: false,
        version: "execution_record_audit_service_role_adapter_live_v1",
        targetTable: "public.execution_record_audit_events",
        operation: "insert",
        insertAttempted: false,
        inserted: false,
        serviceRoleUsed: false,
        queryPerformed: false,
        routeCalled: false,
        uiMutated: false,
        downstreamMutated: false,
        externalOrderCalled: false,
        externalBrowserCalled: false,
        automationEnabled: false,
        idempotencyKey: insert.idempotency_key,
        insertSummary: {
          eventStatus: insert.event_status ?? null,
          eventType: insert.event_type ?? null,
          executionRecordId: insert.execution_record_id ?? null,
          sourceSystem: insert.source_system ?? null,
          idempotencyKeyPresent: true,
          duplicatePreventionKeyPresent: true,
        },
        diagnostics: {
          category: "service_unavailable",
          code: "supabase_service_role_missing",
          status: null,
          message: "supabase_service_role_missing",
          details: null,
          hint: null,
          constraint: null,
        },
        warnings: [],
        errors: ["supabase_service_role_missing"],
      };
    },
  });

  expect(seenInserts).toHaveLength(1);
  expect(result.status).toBe("service_unavailable");
  if (result.status !== "service_unavailable") {
    throw new Error(`Unexpected writer status: ${result.status}`);
  }
  expect(result.ok).toBe(false);
  expect(result.inserted).toBe(false);
  expect(result.adapterStatus).toBe("service_unavailable");
  expect(result.errors).toEqual(["supabase_service_role_missing"]);
  expect(result.dryRun.status).toBe("ready");
  expect("diagnostics" in result ? result.diagnostics : null).toMatchObject({
    category: "service_unavailable",
    code: "supabase_service_role_missing",
    insertSummary: {
      eventStatus: "attempted",
      idempotencyKeyPresent: true,
      duplicatePreventionKeyPresent: true,
    },
  });
  expect(JSON.stringify(result)).not.toMatch(
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  );
});
