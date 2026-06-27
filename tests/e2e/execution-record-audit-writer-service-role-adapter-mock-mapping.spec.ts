import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditEventRow,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditServiceRoleAdapterMockResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter-mock";

const mockPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-service-role-adapter-mock.ts",
);
const writerPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer.ts",
);

type RuntimeMockModule = {
  runExecutionRecordAuditServiceRoleAdapterMock: (input: {
    wouldInsert: ExecutionRecordAuditEventInsert;
    insertAuditEventMock: (
      wouldInsert: ExecutionRecordAuditEventInsert,
    ) =>
      | ExecutionRecordAuditServiceRoleAdapterMockResult
      | Promise<ExecutionRecordAuditServiceRoleAdapterMockResult>;
  }) => Promise<ExecutionRecordAuditServiceRoleAdapterMockResult>;
};

const representativeJson = {
  mapping: "service_role_adapter_mock_mapping_test",
  value: true,
};

const auditRow = {
  actor_id: null,
  actor_type: "system",
  created_at: "2026-06-22T12:30:00.000Z",
  duplicate_prevention_key: "duplicate-mapping-1",
  event_payload: representativeJson,
  event_source: "mock_mapping_test",
  event_status: "recorded",
  event_type: "execution_record_created",
  evidence_payload: representativeJson,
  execution_record_id: "33333333-3333-4333-8333-333333333333",
  id: "44444444-4444-4444-8444-444444444444",
  idempotency_key: "execution-record-audit:mock-mapping-1",
  metadata: representativeJson,
  occurred_at: "2026-06-22T12:30:00.000Z",
  request_id: "request-mapping-1",
  schema_version: "1",
  source_fingerprint: "fingerprint-mapping-1",
  source_system: "trade_app",
  trace_id: "trace-mapping-1",
  writer_version: "mock-only",
} satisfies ExecutionRecordAuditEventRow;

const wouldInsert = {
  event_payload: representativeJson,
  event_source: "mock_mapping_test",
  event_status: "recorded",
  event_type: "execution_record_created",
  execution_record_id: auditRow.execution_record_id,
  idempotency_key: auditRow.idempotency_key,
  source_system: "trade_app",
} satisfies ExecutionRecordAuditEventInsert;

function loadRuntimeMockModule(): RuntimeMockModule {
  const source = readFileSync(mockPath, "utf8").replace(
    'import "server-only";',
    "",
  );
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: mockPath,
  }).outputText;
  const sandbox = {
    Error,
    exports: {} as Partial<RuntimeMockModule>,
    require: (specifier: string): never => {
      throw new Error(`Unexpected runtime require in mock mapping test: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: mockPath });
  return sandbox.exports as RuntimeMockModule;
}

function expectMockSafety(
  result: ExecutionRecordAuditServiceRoleAdapterMockResult,
): void {
  expect(result.realSupabaseCalled).toBe(false);
  expect(result.serviceRoleUsed).toBe(false);
  expect(result.writePerformed).toBe(false);
  expect(result.remoteMutated).toBe(false);
}

function expectNoUnsafePayloadExposure(
  result: ExecutionRecordAuditServiceRoleAdapterMockResult,
  suspiciousValue: string,
): void {
  expect(JSON.stringify(result)).not.toContain(suspiciousValue);
}

test("mock adapter maps injected success outcome to success with safety fields", async () => {
  const runtimeMock = loadRuntimeMockModule();
  const result = await runtimeMock.runExecutionRecordAuditServiceRoleAdapterMock({
    wouldInsert,
    insertAuditEventMock: (insert) => {
      const hostileResult = {
        status: "success",
        ok: true,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        row: { ...auditRow, idempotency_key: insert.idempotency_key },
        idempotencyKey: insert.idempotency_key,
        warnings: [],
        errors: [],
        realSupabaseCalled: true,
        serviceRoleUsed: true,
        writePerformed: true,
        remoteMutated: true,
      };
      return hostileResult as unknown as ExecutionRecordAuditServiceRoleAdapterMockResult;
    },
  });

  expect(result.status).toBe("success");
  expect(result.ok).toBe(true);
  expect(result.version).toBe("execution_record_audit_service_role_adapter_mock_v1");
  expectMockSafety(result);
});

test("mock adapter maps injected duplicate and security outcomes with safety fields", async () => {
  const runtimeMock = loadRuntimeMockModule();
  const duplicate =
    await runtimeMock.runExecutionRecordAuditServiceRoleAdapterMock({
      wouldInsert,
      insertAuditEventMock: (insert) =>
        ({
        status: "conflict_idempotent_duplicate",
        ok: false,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        idempotencyKey: insert.idempotency_key,
        existingAuditEventId: auditRow.id,
        warnings: ["duplicate"],
        errors: [],
        realSupabaseCalled: true,
        serviceRoleUsed: true,
        writePerformed: true,
        remoteMutated: true,
      }) as unknown as ExecutionRecordAuditServiceRoleAdapterMockResult,
    });
  const permission =
    await runtimeMock.runExecutionRecordAuditServiceRoleAdapterMock({
      wouldInsert,
      insertAuditEventMock: () =>
        ({
        status: "permission_security_failure",
        ok: false,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        warnings: [],
        errors: ["permission_denied"],
        realSupabaseCalled: true,
        serviceRoleUsed: true,
        writePerformed: true,
        remoteMutated: true,
      }) as unknown as ExecutionRecordAuditServiceRoleAdapterMockResult,
    });

  expect(duplicate.status).toBe("conflict_idempotent_duplicate");
  expect(duplicate.ok).toBe(false);
  expect(permission.status).toBe("permission_security_failure");
  expect(permission.ok).toBe(false);
  expectMockSafety(duplicate);
  expectMockSafety(permission);
});

test("mock adapter maps service unavailable and thrown errors with safety fields", async () => {
  const runtimeMock = loadRuntimeMockModule();
  const unavailable =
    await runtimeMock.runExecutionRecordAuditServiceRoleAdapterMock({
      wouldInsert,
      insertAuditEventMock: () =>
        ({
        status: "service_unavailable",
        ok: false,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        warnings: [],
        errors: ["network_unavailable"],
        realSupabaseCalled: true,
        serviceRoleUsed: true,
        writePerformed: true,
        remoteMutated: true,
      }) as unknown as ExecutionRecordAuditServiceRoleAdapterMockResult,
    });
  const unknown = await runtimeMock.runExecutionRecordAuditServiceRoleAdapterMock({
    wouldInsert,
    insertAuditEventMock: () => {
      throw new Error("simulated adapter mock failure");
    },
  });

  expect(unavailable.status).toBe("service_unavailable");
  expect(unavailable.ok).toBe(false);
  expect(unknown.status).toBe("unknown_error");
  expect(unknown.ok).toBe(false);
  expect(unknown.errors).toEqual(["mock_behavior_error"]);
  expectMockSafety(unavailable);
  expectMockSafety(unknown);
});

test("mock adapter does not expose suspicious input payload strings or mutate input", async () => {
  const runtimeMock = loadRuntimeMockModule();
  const suspiciousValue =
    "service-role-looking-value-do-not-print-or-propagate";
  const suspiciousInsert = {
    ...wouldInsert,
    event_payload: {
      suspiciousValue,
    },
    evidence_payload: {
      nested: {
        suspiciousValue,
      },
    },
    metadata: {
      suspiciousValue,
    },
  } satisfies ExecutionRecordAuditEventInsert;
  const before = JSON.stringify(suspiciousInsert);

  const result = await runtimeMock.runExecutionRecordAuditServiceRoleAdapterMock({
    wouldInsert: suspiciousInsert,
    insertAuditEventMock: (insert) => {
      expect(insert).toBe(suspiciousInsert);
      return {
        status: "permission_security_failure",
        ok: false,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        warnings: [],
        errors: ["blocked_without_echoing_payload"],
        realSupabaseCalled: false,
        serviceRoleUsed: false,
        writePerformed: false,
        remoteMutated: false,
      };
    },
  });

  expect(JSON.stringify(suspiciousInsert)).toBe(before);
  expectNoUnsafePayloadExposure(result, suspiciousValue);
  expectMockSafety(result);
});

test("mock adapter mapping source and writer boundary remain non-live", () => {
  const source = readFileSync(mockPath, "utf8");
  const writerSource = readFileSync(writerPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("runExecutionRecordAuditServiceRoleAdapterMock");
  expect(source).toContain("insertAuditEventMock");
  expect(source).toContain("realSupabaseCalled: false");
  expect(source).toContain("serviceRoleUsed: false");
  expect(source).toContain("writePerformed: false");
  expect(source).toContain("remoteMutated: false");

  expect(source).not.toContain("createClient");
  expect(source).not.toContain("supabase-server");
  expect(source).not.toContain("process.env");
  expect(source).not.toMatch(new RegExp("SUPABASE" + "_SERVICE_ROLE"));
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
  expect(source).not.toMatch(new RegExp("automatic", "i"));

  expect(writerSource).not.toContain(
    "execution-record-audit-writer-service-role-adapter-mock",
  );
  expect(writerSource).toContain("writer_implementation_not_enabled");
  expect(writerSource).toContain("wouldWrite: false");
});
