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
  ExecutionRecordAuditServiceRoleAdapterLiveResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter";
import type {
  ExecutionRecordAuditWriterIntegratedConflictResult,
  ExecutionRecordAuditWriterIntegratedServiceUnavailableResult,
  ExecutionRecordAuditWriterIntegratedSuccessResult,
  ExecutionRecordAuditWriterIntegratedUnknownErrorResult,
  ExecutionRecordAuditWriterSkeletonBlockedResult,
  ExecutionRecordAuditWriterSkeletonValidationFailedResult,
} from "../../lib/server/execution-record-audit-writer";

const writerPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer.ts",
);

type RuntimeWriterModule = {
  appendExecutionRecordAuditEvent: (
    input: unknown,
    options?: {
      insertWithServiceRole?: (input: {
        insert: ExecutionRecordAuditEventInsert;
      }) => Promise<ExecutionRecordAuditServiceRoleAdapterLiveResult>;
    },
  ) => Promise<
    | ExecutionRecordAuditWriterIntegratedConflictResult
    | ExecutionRecordAuditWriterIntegratedServiceUnavailableResult
    | ExecutionRecordAuditWriterIntegratedSuccessResult
    | ExecutionRecordAuditWriterIntegratedUnknownErrorResult
    | ExecutionRecordAuditWriterSkeletonBlockedResult
    | ExecutionRecordAuditWriterSkeletonValidationFailedResult
  >;
};

const validInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "execution_record_created",
  source: {
    eventSource: "writer_skeleton_test",
    sourceSystem: "trade_app",
    sourceFingerprint: "fingerprint-1",
    traceId: "trace-1",
    writerVersion: "skeleton-test",
  },
  requestId: "request-1",
  idempotencyKey: "execution-record-audit:request-1",
  duplicatePreventionKey: "execution-record-audit:duplicate-1",
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
    generatedBy: "action_804_test",
  },
  occurredAt: "2026-06-22T12:30:00.000Z",
  metadata: {
    deterministic: true,
  },
} satisfies ExecutionRecordAuditWriterInput;

const expectedWouldInsert = {
  actor_id: null,
  actor_type: "system",
  duplicate_prevention_key: "execution-record-audit:duplicate-1",
  event_payload: validInput.payload,
  event_source: "writer_skeleton_test",
  event_status: "dry_run_ready",
  event_type: "execution_record_created",
  evidence_payload: validInput.evidence,
  execution_record_id: validInput.executionRecordId,
  idempotency_key: validInput.idempotencyKey,
  metadata: {
    authorityMode: "server_append_only",
    inputMetadata: validInput.metadata,
    provenance: validInput.provenance,
    wouldWrite: false,
  },
  occurred_at: validInput.occurredAt,
  request_id: validInput.requestId,
  schema_version: "1",
  source_fingerprint: "fingerprint-1",
  source_system: "trade_app",
  trace_id: "trace-1",
  writer_version: "skeleton-test",
} satisfies ExecutionRecordAuditEventInsert;

const expectedLiveInsert = {
  ...expectedWouldInsert,
  event_status: "attempted",
  metadata: {
    ...expectedWouldInsert.metadata,
    dryRunEventStatus: "dry_run_ready",
    liveEventStatus: "attempted",
    liveWrite: true,
  },
} satisfies ExecutionRecordAuditEventInsert;

const validValidation = {
  valid: true,
  errors: [],
  warnings: [],
} as const;

const readyDryRun = {
  status: "ready",
  ok: true,
  wouldWrite: false,
  wouldInsert: expectedWouldInsert,
  validation: validValidation,
  warnings: [],
} as const;

function adapterResult(
  status: ExecutionRecordAuditServiceRoleAdapterLiveResult["status"],
): ExecutionRecordAuditServiceRoleAdapterLiveResult {
  return {
    status,
    ok: status === "success",
    version: "execution_record_audit_service_role_adapter_live_v1",
    targetTable: "public.execution_record_audit_events",
    operation: "insert",
    insertAttempted: status !== "service_unavailable",
    inserted: status === "success",
    serviceRoleUsed: status !== "service_unavailable",
    queryPerformed: false,
    routeCalled: false,
    uiMutated: false,
    downstreamMutated: false,
    externalOrderCalled: false,
    externalBrowserCalled: false,
    automationEnabled: false,
    idempotencyKey: expectedWouldInsert.idempotency_key,
    auditEventId: "33333333-3333-4333-8333-333333333333",
    warnings:
      status === "conflict_idempotent_duplicate"
        ? ["idempotent_duplicate_or_unique_conflict"]
        : [],
    errors:
      status === "permission_security_failure"
        ? ["permission_or_security_failure"]
        : status === "service_unavailable"
          ? ["supabase_service_unavailable"]
          : status === "unknown_error"
            ? ["supabase_insert_error"]
            : [],
  } as ExecutionRecordAuditServiceRoleAdapterLiveResult;
}

function loadRuntimeWriterModule({
  dryRun,
  validation,
}: {
  dryRun: unknown;
  validation: unknown;
}): RuntimeWriterModule {
  const source = readFileSync(writerPath, "utf8").replace(
    'import "server-only";',
    "",
  );
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: writerPath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeWriterModule>,
    require: (specifier: string) => {
      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-contract"
      ) {
        return {
          EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION:
            "execution_record_audit_writer_server_only_contract_v1",
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-validation"
      ) {
        return {
          validateExecutionRecordAuditWriterInput: () => validation,
        };
      }

      if (
        specifier === "@/lib/server/execution-record-audit-writer-dry-run"
      ) {
        return {
          buildExecutionRecordAuditWriterDryRun: () => dryRun,
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-service-role-adapter"
      ) {
        return {
          insertExecutionRecordAuditEventWithServiceRole: async () =>
            adapterResult("service_unavailable"),
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: writerPath });

  return sandbox.exports as RuntimeWriterModule;
}

test("audit writer source remains server-only and adapter-only for writes", () => {
  const source = readFileSync(writerPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("appendExecutionRecordAuditEvent");
  expect(source).toContain("validateExecutionRecordAuditWriterInput");
  expect(source).toContain("buildExecutionRecordAuditWriterDryRun");
  expect(source).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(source).toContain("wouldWrite: false");

  expect(source).not.toContain("createClient");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("supabase-server");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
});

test("audit writer valid ready input calls injected live adapter and maps success", async () => {
  const runtimeWriter = loadRuntimeWriterModule({
    dryRun: readyDryRun,
    validation: validValidation,
  });
  const seenInserts: ExecutionRecordAuditEventInsert[] = [];
  const result = await runtimeWriter.appendExecutionRecordAuditEvent(validInput, {
    insertWithServiceRole: async ({ insert }) => {
      seenInserts.push(insert);
      return adapterResult("success");
    },
  });
  const success = result as ExecutionRecordAuditWriterIntegratedSuccessResult;

  expect(validInput.authorityMode).toBe("server_append_only");
  expect(seenInserts).toEqual([expectedLiveInsert]);
  expect(success.status).toBe("success");
  expect(success.inserted).toBe(true);
  expect(success.auditEventId).toBe("33333333-3333-4333-8333-333333333333");
  expect(success.row.event_status).toBe("attempted");
  expect(result.dryRun.status).toBe("ready");
  expect(result.dryRun.wouldWrite).toBe(false);
  expect(result.dryRun.wouldInsert).toEqual(expectedWouldInsert);
  expect(result.dryRun.idempotencyKey).toBe(validInput.idempotencyKey);
  expect(success.adapterStatus).toBe("success");
});

test("audit writer maps adapter conflict, unavailable, permission, and unknown outcomes", async () => {
  const runtimeWriter = loadRuntimeWriterModule({
    dryRun: readyDryRun,
    validation: validValidation,
  });
  const run = (status: ExecutionRecordAuditServiceRoleAdapterLiveResult["status"]) =>
    runtimeWriter.appendExecutionRecordAuditEvent(validInput, {
      insertWithServiceRole: async () => adapterResult(status),
    });

  const conflict = (await run(
    "conflict_idempotent_duplicate",
  )) as ExecutionRecordAuditWriterIntegratedConflictResult;
  const unavailable = (await run(
    "service_unavailable",
  )) as ExecutionRecordAuditWriterIntegratedServiceUnavailableResult;
  const permission = (await run(
    "permission_security_failure",
  )) as ExecutionRecordAuditWriterIntegratedUnknownErrorResult;
  const unknown = (await run(
    "unknown_error",
  )) as ExecutionRecordAuditWriterIntegratedUnknownErrorResult;

  expect(conflict.status).toBe("conflict_idempotent_duplicate");
  expect(conflict.idempotencyKey).toBe(validInput.idempotencyKey);
  expect(conflict.adapterStatus).toBe("conflict_idempotent_duplicate");
  expect(unavailable.status).toBe("service_unavailable");
  expect(unavailable.adapterStatus).toBe("service_unavailable");
  expect(permission.status).toBe("unknown_error");
  expect(permission.adapterStatus).toBe("permission_security_failure");
  expect(unknown.status).toBe("unknown_error");
  expect(unknown.adapterStatus).toBe("unknown_error");
});

test("audit writer invalid input returns validation failed without adapter call", async () => {
  const invalidValidation = {
    valid: false,
    errors: ["execution_record_id_invalid_uuid"],
    warnings: [],
  } as const;
  const runtimeWriter = loadRuntimeWriterModule({
    dryRun: readyDryRun,
    validation: invalidValidation,
  });
  let adapterCalled = false;
  const result = await runtimeWriter.appendExecutionRecordAuditEvent(
    {
      ...validInput,
      executionRecordId: "not-a-uuid",
    },
    {
      insertWithServiceRole: async () => {
        adapterCalled = true;
        return adapterResult("success");
      },
    },
  );
  const validationFailed =
    result as ExecutionRecordAuditWriterSkeletonValidationFailedResult;

  expect(adapterCalled).toBe(false);
  expect(validationFailed.status).toBe("validation_failed");
  expect(validationFailed.inserted).toBe(false);
  expect(validationFailed.wouldWrite).toBe(false);
  expect(validationFailed.dryRun.status).toBe("validation_failed");
  expect(validationFailed.dryRun.wouldInsert).toBeNull();
});

test("audit writer blocked dry-run input returns blocked without adapter call", async () => {
  const runtimeWriter = loadRuntimeWriterModule({
    dryRun: {
      status: "blocked",
      ok: false,
      wouldWrite: false,
      wouldInsert: null,
      validation: validValidation,
      errors: ["authority_mode_blocked"],
      warnings: [],
    },
    validation: validValidation,
  });
  let adapterCalled = false;
  const result = await runtimeWriter.appendExecutionRecordAuditEvent(
    {
      ...validInput,
      authorityMode: "blocked",
    } satisfies ExecutionRecordAuditWriterInput,
    {
      insertWithServiceRole: async () => {
        adapterCalled = true;
        return adapterResult("success");
      },
    },
  );
  const blocked = result as ExecutionRecordAuditWriterSkeletonBlockedResult;

  expect(adapterCalled).toBe(false);
  expect(blocked.status).toBe("blocked");
  expect(blocked.reason).toBe("authority_boundary_violation");
  expect(blocked.inserted).toBe(false);
  expect(blocked.wouldWrite).toBe(false);
  expect(blocked.dryRun.status).toBe("blocked");
});

test("audit writer skeleton source is deterministic and side-effect free", () => {
  const source = readFileSync(writerPath, "utf8");

  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("crypto.randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
});
