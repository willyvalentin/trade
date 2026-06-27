import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditWriterInput,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditWriterResultWithDryRun,
} from "../../lib/server/execution-record-audit-writer";
import type {
  ExecutionRecordAuditWriterProductionWritePathInput,
  ExecutionRecordAuditWriterProductionWritePathResult,
  ExecutionRecordAuditWriterProductionWritePathOptions,
} from "../../lib/server/execution-record-audit-writer-production-write-path";
import type {
  ExecutionRecordAuditWriterRuntimeMonitoringEvent,
} from "../../lib/server/execution-record-audit-writer-runtime-monitoring";

const root = process.cwd();
const writePathPath = join(
  root,
  "lib/server/execution-record-audit-writer-production-write-path.ts",
);
const writerPath = join(root, "lib/server/execution-record-audit-writer.ts");
const routePath = join(root, "app/api/execution/audit/writer/route.ts");
const writerImport = "execution-record-audit-writer";
const directWriterImport =
  'from "@/lib/server/execution-record-audit-writer";';
const writePathImport = "execution-record-audit-writer-production-write-path";
const serviceRoleAdapterImport =
  "execution-record-audit-writer-service-role-adapter";
const runtimeMonitoringImport =
  "execution-record-audit-writer-runtime-monitoring";
const routeLiteral = "/api/execution/audit/writer";

const writerInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "execution_record_created",
  source: {
    eventSource: "production_write_path_test",
    sourceSystem: "trade_app",
    sourceFingerprint: "production-write-path-test-fingerprint",
    traceId: "production-write-path-test-trace",
    writerVersion: "production-write-path-test",
  },
  requestId: "production-write-path-test-request",
  idempotencyKey: "execution-record-audit:production-write-path-test",
  duplicatePreventionKey:
    "execution-record-audit:production-write-path-test-duplicate",
  actor: {
    actorType: "system",
    actorId: null,
  },
  authorityMode: "server_append_only",
  payload: {
    status: "created",
  },
  evidence: {
    source: "server_side_test",
  },
  provenance: {
    generatedBy: "action_836_test",
  },
  occurredAt: "2026-06-26T01:09:00.000Z",
  metadata: {
    productionWritePathApproved: true,
    liveSmokeInsertApproved: false,
  },
} satisfies ExecutionRecordAuditWriterInput;

const approvedInput = {
  productionWritePathApproved: true,
  liveSmokeInsertApproved: false,
  payloadSource: "validated_server_side_audit_payload",
  operation: "insert_only_audit_append",
  targetTable: "public.execution_record_audit_events",
  input: writerInput,
} satisfies ExecutionRecordAuditWriterProductionWritePathInput;

const writerResult = {
  status: "success",
  ok: true,
  inserted: true,
  auditEventId: "33333333-3333-4333-8333-333333333333",
  executionRecordId: writerInput.executionRecordId,
  idempotencyKey: writerInput.idempotencyKey,
  row: {
    actor_id: null,
    actor_type: "system",
    created_at: "unconfirmed_without_select",
    duplicate_prevention_key: approvedInput.input.duplicatePreventionKey,
    event_payload: writerInput.payload,
    event_source: writerInput.source.eventSource,
    event_status: "dry_run_ready",
    event_type: writerInput.eventType,
    evidence_payload: writerInput.evidence,
    execution_record_id: writerInput.executionRecordId,
    id: "33333333-3333-4333-8333-333333333333",
    idempotency_key: writerInput.idempotencyKey,
    metadata: {},
    occurred_at: writerInput.occurredAt,
    request_id: writerInput.requestId,
    schema_version: "1",
    source_fingerprint: writerInput.source.sourceFingerprint,
    source_system: writerInput.source.sourceSystem,
    trace_id: writerInput.source.traceId,
    writer_version: writerInput.source.writerVersion,
  },
  warnings: ["writer_warning"],
  dryRun: {
    contractVersion: "execution_record_audit_writer_server_only_contract_v1",
    skeletonVersion: "execution_record_audit_writer_implementation_skeleton_v1",
    status: "ready",
    wouldWrite: false,
    wouldInsert: null,
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

type RuntimeWritePathModule = {
  appendExecutionRecordAuditEventFromProductionWritePath: (
    input: unknown,
    options?: ExecutionRecordAuditWriterProductionWritePathOptions,
  ) => Promise<ExecutionRecordAuditWriterProductionWritePathResult>;
};

function monitoringEvent(
  input: {
    status: "blocked";
    writerResult: null;
  } | {
    status: "completed";
    writerResult: ExecutionRecordAuditWriterResultWithDryRun;
  },
): ExecutionRecordAuditWriterRuntimeMonitoringEvent {
  const writer = input.status === "completed" ? input.writerResult : null;

  return {
    version: "execution_record_audit_writer_runtime_monitoring_v1",
    path: "audit_writer_runtime_persistence",
    targetTable: "public.execution_record_audit_events",
    operation: "insert_only_audit_append",
    statusCategory:
      input.status === "blocked" ? "blocked" : writer?.ok ? "success" : "failure",
    writerStatus: writer?.status ?? "not_called",
    adapterStatus:
      writer && "adapterStatus" in writer ? writer.adapterStatus : null,
    inserted: writer?.inserted === true,
    noRetry: true,
    diagnostics: {
      category: null,
      code: null,
      message: null,
    },
    serviceRoleAvailability: {
      checked: Boolean(writer && "adapterStatus" in writer),
      available: writer && "adapterStatus" in writer ? true : null,
      unavailable: false,
    },
    counters: {
      total: 1,
      success: writer?.ok ? 1 : 0,
      failure: input.status === "completed" && !writer?.ok ? 1 : 0,
      blocked: input.status === "blocked" ? 1 : 0,
      insertedTrue: writer?.inserted === true ? 1 : 0,
      insertedFalse: writer?.inserted === true ? 0 : 1,
    },
    safety: {
      serverOnly: true,
      safeStatusCategoriesOnly: true,
      diagnosticsSanitized: true,
      serviceRoleValuesCaptured: false,
      serviceRoleAvailabilityBooleansOnly: true,
      databaseWritesAllowed: false,
      supabaseQueryAllowed: false,
      updateDeleteUpsertSelectAllowed: false,
      uiBrowserInvocationAllowed: false,
      appShellImportAllowed: false,
      marketScannerAutomationInvocationAllowed: false,
      brokerAvanzaAllowed: false,
      automaticModeAllowed: false,
      tradeStatsPnlMutationAllowed: false,
      downstreamMutationAllowed: false,
      retryLoopAllowed: false,
    },
  };
}

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

function loadRuntimeWritePathModule(
  writerCalls: unknown[],
): RuntimeWritePathModule {
  const source = read(writePathPath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: writePathPath,
  }).outputText;
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
          recordExecutionRecordAuditWriterRuntimeMonitoringEvent: (
            input: Parameters<
              typeof monitoringEvent
            >[0],
            sink?: (event: ExecutionRecordAuditWriterRuntimeMonitoringEvent) => void,
          ) => {
            const event = monitoringEvent(input);

            sink?.(event);

            return event;
          },
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: writePathPath });

  return sandbox.exports as RuntimeWritePathModule;
}

test("production write path caller remains server-only and internal-writer-only", () => {
  const source = read(writePathPath);

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("@/lib/server/execution-record-audit-writer");
  expect(source).toContain(
    "@/lib/server/execution-record-audit-writer-runtime-monitoring",
  );
  expect(source).toContain("appendExecutionRecordAuditEvent");
  expect(source).toContain("recordExecutionRecordAuditWriterRuntimeMonitoringEvent");
  expect(source).not.toContain(serviceRoleAdapterImport);
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("fetch(");
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

test("production write path monitoring import remains server-only and non-persistent", () => {
  const source = read(writePathPath);

  expect(source).toContain(runtimeMonitoringImport);
  expect(source).toContain("monitoringSink");
  expect(source).toContain("recordExecutionRecordAuditWriterRuntimeMonitoringEvent");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
  expect(source).not.toContain("console.");
  expect(source).not.toContain("setTimeout");
  expect(source).not.toContain("setInterval");
});

test("production write path caller is absent from browser, UI, and route runtime", () => {
  const disallowedRoots = ["app", "components", "hooks"].map((entry) =>
    join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(writePathImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
  expect(read(routePath)).not.toContain(writePathImport);
});

test("production write path caller is absent from market scanner and automation runtime", () => {
  const runtimeRoots = ["app", "components", "hooks", "scripts"].map((entry) =>
    join(root, entry),
  );
  const runtimeMatches = runtimeRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(writePathImport))
    .map((path) => relative(root, path));
  const marketScannerMatches = runtimeRoots
    .flatMap(listSourceFiles)
    .filter((path) => {
      const relativePath = relative(root, path);

      return /market|scan|scanner|automation/i.test(relativePath);
    })
    .filter((path) => read(path).includes(writePathImport))
    .map((path) => relative(root, path));

  expect(runtimeMatches).toEqual([]);
  expect(marketScannerMatches).toEqual([]);
});

test("production write path is the only additional approved writer importer", () => {
  const routeMatches = listSourceFiles(join(root, "app", "api"))
    .filter((path) => read(path).includes(writerImport))
    .map((path) => relative(root, path));
  const serverMatches = listSourceFiles(join(root, "lib", "server"))
    .filter((path) => path !== writerPath)
    .filter((path) => read(path).includes(directWriterImport))
    .map((path) => relative(root, path));
  const browserMatches = ["app", "components", "hooks"]
    .flatMap((entry) => listSourceFiles(join(root, entry)))
    .filter((path) => !path.startsWith(join(root, "app", "api")))
    .filter((path) => read(path).includes(writerImport))
    .map((path) => relative(root, path));

  expect(routeMatches).toEqual([relative(root, routePath)]);
  expect(serverMatches).toContain(
    "lib/server/execution-record-audit-writer-production-write-path.ts",
  );
  expect(serverMatches).not.toContain(
    "lib/server/execution-record-audit-writer-service-role-adapter.ts",
  );
  expect(browserMatches).toEqual([]);
});

test("production write path blocks before writer when approval or payload gates fail", async () => {
  const writerCalls: unknown[] = [];
  const runtime = loadRuntimeWritePathModule(writerCalls);
  const result =
    await runtime.appendExecutionRecordAuditEventFromProductionWritePath({
      ...approvedInput,
      productionWritePathApproved: false,
      payloadSource: "fixture",
      liveSmokeInsertApproved: true,
    });

  expect(result.status).toBe("blocked");
  expect(result.ok).toBe(false);
  expect(result.writerResult).toBeNull();
  expect(result.monitoring).toBeDefined();
  const monitoring = result.monitoring!;
  expect(monitoring.statusCategory).toBe("blocked");
  expect(monitoring.writerStatus).toBe("not_called");
  expect(monitoring.inserted).toBe(false);
  expect(monitoring.safety.databaseWritesAllowed).toBe(false);
  expect(result.errors).toEqual([
    "production_write_path_approval_required",
    "live_smoke_insert_not_approved",
    "validated_server_side_payload_required",
  ]);
  expect(writerCalls).toEqual([]);
  expect(result.safety.downstreamMutationAllowed).toBe(false);
});

test("production write path rejects each required boundary gate before writer call", async () => {
  const cases: Array<{
    name: string;
    input: Record<string, unknown>;
    errors: string[];
  }> = [
    {
      name: "missing approval",
      input: {
        ...approvedInput,
        productionWritePathApproved: undefined,
      },
      errors: ["production_write_path_approval_required"],
    },
    {
      name: "live smoke approved",
      input: {
        ...approvedInput,
        liveSmokeInsertApproved: true,
      },
      errors: ["live_smoke_insert_not_approved"],
    },
    {
      name: "unvalidated payload source",
      input: {
        ...approvedInput,
        payloadSource: "fixture",
      },
      errors: ["validated_server_side_payload_required"],
    },
    {
      name: "non-insert operation",
      input: {
        ...approvedInput,
        operation: "upsert",
      },
      errors: ["insert_only_audit_append_required"],
    },
    {
      name: "wrong target table",
      input: {
        ...approvedInput,
        targetTable: "public.execution_records",
      },
      errors: ["audit_events_table_target_required"],
    },
    {
      name: "missing writer input",
      input: {
        ...approvedInput,
        input: null,
      },
      errors: ["writer_input_required"],
    },
  ];

  for (const boundaryCase of cases) {
    const writerCalls: unknown[] = [];
    const runtime = loadRuntimeWritePathModule(writerCalls);
    const result =
      await runtime.appendExecutionRecordAuditEventFromProductionWritePath(
        boundaryCase.input,
      );

    expect(result.status, boundaryCase.name).toBe("blocked");
    expect(result.writerResult, boundaryCase.name).toBeNull();
    expect(result.errors, boundaryCase.name).toEqual(boundaryCase.errors);
    expect(writerCalls, boundaryCase.name).toEqual([]);
  }
});

test("production write path source is audit-only and contains no downstream behavior hooks", () => {
  const source = read(writePathPath);

  for (const forbidden of [
    "tradeMutation",
    "mutateTrade",
    "updateTrade",
    "stats",
    "pnl",
    "profit",
    "loss",
    "rollback",
    "correction",
    "scanner",
    "automation",
  ]) {
    expect(source).not.toContain(forbidden);
  }

  expect(source.match(/broker/gi)).toEqual(["broker", "broker"]);
  expect(source.match(/Avanza/g)).toEqual(["Avanza", "Avanza"]);
  expect(source.match(/marketLoop/g)).toEqual(["marketLoop", "marketLoop"]);
  expect(source.match(/automatic/gi)).toEqual(["automatic", "automatic"]);
  expect(source).toContain("marketLoopInvocationAllowed: false");
  expect(source).toContain("brokerAvanzaAllowed: false");
  expect(source).toContain("automaticModeAllowed: false");
});

test("production write path uses no route call or live smoke mechanics", () => {
  const source = read(writePathPath);

  expect(source).not.toContain(routeLiteral);
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("new Request(");
  expect(source).not.toContain("POST(");
  expect(source).not.toContain("liveSmokeInsertApproved: true");
  expect(source).toContain("liveSmokeInsertApproved: false");
});

test("production write path monitoring preserves insert-only writer delegation", () => {
  const source = read(writePathPath);

  expect(source).toContain("appendExecutionRecordAuditEvent(approvedInput.input)");
  expect(source).toContain("recordExecutionRecordAuditWriterRuntimeMonitoringEvent");
  expect(source).not.toContain(".select(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(source).not.toContain(serviceRoleAdapterImport);
});

test("production write path delegates approved payload to typed writer boundary", async () => {
  const writerCalls: unknown[] = [];
  const monitoringEvents: ExecutionRecordAuditWriterRuntimeMonitoringEvent[] = [];
  const runtime = loadRuntimeWritePathModule(writerCalls);
  const result =
    await runtime.appendExecutionRecordAuditEventFromProductionWritePath(approvedInput, {
      monitoringSink: (event) => monitoringEvents.push(event),
    });

  expect(writerCalls).toEqual([writerInput]);
  expect(result.status).toBe("completed");
  expect(result.ok).toBe(true);
  expect(result.writerResult).toEqual(writerResult);
  expect(result.monitoring).toBeDefined();
  const monitoring = result.monitoring!;
  expect(monitoring).toEqual(monitoringEvents[0]);
  expect(monitoring).toMatchObject({
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
  });
  expect(monitoring.safety).toMatchObject({
    serverOnly: true,
    serviceRoleValuesCaptured: false,
    databaseWritesAllowed: false,
    supabaseQueryAllowed: false,
    updateDeleteUpsertSelectAllowed: false,
    uiBrowserInvocationAllowed: false,
    marketScannerAutomationInvocationAllowed: false,
    brokerAvanzaAllowed: false,
    automaticModeAllowed: false,
    tradeStatsPnlMutationAllowed: false,
    downstreamMutationAllowed: false,
    retryLoopAllowed: false,
  });
  expect(result.warnings).toEqual(["writer_warning"]);
  expect(result.safety).toEqual({
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
  });
});
