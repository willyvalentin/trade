import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditWriterInput,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditServiceRoleAdapterClient,
  ExecutionRecordAuditServiceRoleAdapterLiveResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter";
import type {
  ExecutionRecordAuditWriterResultWithDryRun,
} from "../../lib/server/execution-record-audit-writer";

const root = process.cwd();
const adapterPath = join(
  root,
  "lib/server/execution-record-audit-writer-service-role-adapter.ts",
);
const writerPath = join(root, "lib/server/execution-record-audit-writer.ts");
const migrationPath = join(
  root,
  "supabase/migrations/20260615000000_create_execution_record_audit_events.sql",
);

type RuntimeAdapterModule = {
  insertExecutionRecordAuditEventWithServiceRole: (input: {
    insert: ExecutionRecordAuditEventInsert;
    getClient: () => {
      client: ExecutionRecordAuditServiceRoleAdapterClient | null;
      unavailable_reason: "supabase_missing_env" | "supabase_service_role_missing" | null;
    };
  }) => Promise<ExecutionRecordAuditServiceRoleAdapterLiveResult>;
};

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

const writerInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "execution_record_created",
  source: {
    eventSource: "live_smoke_diagnostic_test",
    sourceSystem: "trade_app",
    sourceFingerprint: "diagnostic-fingerprint",
    traceId: "diagnostic-trace",
    writerVersion: "diagnostic-test",
  },
  requestId: "diagnostic-request",
  idempotencyKey: "execution-record-audit:diagnostic-request",
  duplicatePreventionKey: "execution-record-audit:diagnostic-duplicate",
  actor: {
    actorType: "system",
    actorId: null,
  },
  authorityMode: "server_append_only",
  payload: {
    status: "created",
  },
  evidence: {
    source: "fixture",
  },
  provenance: {
    generatedBy: "action_844_test",
  },
  occurredAt: "2026-06-26T02:00:00.000Z",
  metadata: {
    deterministic: true,
  },
} satisfies ExecutionRecordAuditWriterInput;

const dryRunInsert = {
  actor_id: null,
  actor_type: "system",
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

function transpile(path: string): string {
  return ts.transpileModule(
    readFileSync(path, "utf8").replace('import "server-only";', ""),
    {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: path,
    },
  ).outputText;
}

function loadRuntimeAdapterModule(): RuntimeAdapterModule {
  const sandbox = {
    exports: {} as Partial<RuntimeAdapterModule>,
    require: (specifier: string) => {
      if (specifier === "@/lib/supabase-server") {
        return {
          getServerSupabaseClient: () => ({
            client: null,
            unavailable_reason: "supabase_service_role_missing",
          }),
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpile(adapterPath), sandbox, { filename: adapterPath });
  return sandbox.exports as RuntimeAdapterModule;
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
            throw new Error("unexpected default adapter call");
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

function createMockClient(
  error: {
    code?: string | null;
    status?: number | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  },
): ExecutionRecordAuditServiceRoleAdapterClient {
  return {
    from: (table) => {
      expect(table).toBe("execution_record_audit_events");

      return {
        insert: async () => ({ error }),
      };
    },
  };
}

test("live smoke insert diagnostics capture schema constraint failures without secrets", async () => {
  const runtimeAdapter = loadRuntimeAdapterModule();
  const result = await runtimeAdapter.insertExecutionRecordAuditEventWithServiceRole({
    insert: {
      ...dryRunInsert,
      event_status: "attempted",
    },
    getClient: () => ({
      client: createMockClient({
        code: "23514",
        message:
          'new row violates check constraint "execution_record_audit_events_event_status_check"',
        details:
          "Failing row includes service_role=service-role-looking-value and eyJhbGciOiJIUzI1NiJ9.payload.signature",
        hint: "Check the event_status value.",
      }),
      unavailable_reason: null,
    }),
  });

  expect(result.status).toBe("unknown_error");
  expect(result.errors).toEqual(["schema_or_constraint_mismatch"]);
  expect(result.errorCode).toBe("23514");
  expect(result.diagnostics).toMatchObject({
    category: "schema_constraint",
    code: "23514",
    constraint: "execution_record_audit_events_event_status_check",
    hint: "Check the event_status value.",
  });
  expect(result.insertSummary).toEqual({
    eventStatus: "attempted",
    eventType: "execution_record_created",
    executionRecordId: writerInput.executionRecordId,
    sourceSystem: "trade_app",
    idempotencyKeyPresent: true,
    duplicatePreventionKeyPresent: true,
  });
  expect(JSON.stringify(result)).not.toContain("service-role-looking-value");
  expect(JSON.stringify(result)).not.toContain("eyJhbGciOiJIUzI1NiJ9");
});

test("writer maps dry-run status to migration-compatible live event status", async () => {
  const migration = readFileSync(migrationPath, "utf8");
  const runtimeWriter = loadRuntimeWriterModule();
  const seenInserts: ExecutionRecordAuditEventInsert[] = [];
  const result = await runtimeWriter.appendExecutionRecordAuditEvent(writerInput, {
    insertWithServiceRole: async ({ insert }) => {
      seenInserts.push(insert);

      return {
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
          message: "mocked constraint failure",
          details: null,
          hint: null,
          constraint: "execution_record_audit_events_event_status_check",
        },
        errorCode: "23514",
        warnings: [],
        errors: ["schema_or_constraint_mismatch"],
      };
    },
  });

  expect(migration).toContain(
    "check (event_status in ('attempted', 'succeeded', 'failed', 'blocked', 'duplicate', 'unknown'))",
  );
  expect(migration).not.toContain("'dry_run_ready'");
  expect(seenInserts).toHaveLength(1);
  expect(seenInserts[0]?.event_status).toBe("attempted");
  expect(seenInserts[0]?.metadata).toMatchObject({
    dryRunEventStatus: "dry_run_ready",
    liveEventStatus: "attempted",
    liveWrite: true,
  });
  expect(result.status).toBe("unknown_error");
  expect(result.dryRun.wouldInsert?.event_status).toBe("dry_run_ready");
  expect("diagnostics" in result ? result.diagnostics : null).toMatchObject({
    category: "schema_constraint",
    insertSummary: {
      eventStatus: "attempted",
    },
  });
});
