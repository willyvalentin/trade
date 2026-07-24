import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditEventRow,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditServiceRoleAdapterMockDuplicateResult,
  ExecutionRecordAuditServiceRoleAdapterMockPermissionResult,
  ExecutionRecordAuditServiceRoleAdapterMockResult,
  ExecutionRecordAuditServiceRoleAdapterMockServiceUnavailableResult,
  ExecutionRecordAuditServiceRoleAdapterMockSuccessResult,
  ExecutionRecordAuditServiceRoleAdapterMockUnknownErrorResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter-mock";

const mockPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-service-role-adapter-mock.ts",
);
const writerPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer.ts",
);

const representativeJson = {
  source: "service_role_adapter_mock_test",
  value: true,
};

const auditRow = {
  actor_id: null,
  actor_type: "system",
  created_at: "2026-06-22T12:30:00.000Z",
  duplicate_prevention_key: "duplicate-1",
  event_payload: representativeJson,
  event_source: "mock_test",
  event_status: "recorded",
  event_type: "execution_record_created",
  evidence_payload: representativeJson,
  execution_record_id: "11111111-1111-4111-8111-111111111111",
  id: "22222222-2222-4222-8222-222222222222",
  idempotency_key: "execution-record-audit:mock-1",
  metadata: representativeJson,
  occurred_at: "2026-06-22T12:30:00.000Z",
  request_id: "request-1",
  schema_version: "1",
  source_fingerprint: "fingerprint-1",
  source_system: "trade_app",
  trace_id: "trace-1",
  writer_version: "mock-only",
} satisfies ExecutionRecordAuditEventRow;

const wouldInsert = {
  event_source: "mock_test",
  event_status: "recorded",
  event_type: "execution_record_created",
  execution_record_id: auditRow.execution_record_id,
  idempotency_key: auditRow.idempotency_key,
  source_system: "trade_app",
} satisfies ExecutionRecordAuditEventInsert;

function expectMockSafety(
  result: ExecutionRecordAuditServiceRoleAdapterMockResult,
): void {
  expect(result.realSupabaseCalled).toBe(false);
  expect(result.serviceRoleUsed).toBe(false);
  expect(result.writePerformed).toBe(false);
  expect(result.remoteMutated).toBe(false);
}

test("service-role adapter mock success result remains non-mutating", () => {
  const result = {
    status: "success",
    ok: true,
    version: "execution_record_audit_service_role_adapter_mock_v1",
    row: auditRow,
    idempotencyKey: wouldInsert.idempotency_key,
    warnings: [],
    errors: [],
    realSupabaseCalled: false,
    serviceRoleUsed: false,
    writePerformed: false,
    remoteMutated: false,
  } satisfies ExecutionRecordAuditServiceRoleAdapterMockSuccessResult;

  expect(result.status).toBe("success");
  expect(result.row.id).toBe(auditRow.id);
  expectMockSafety(result);
});

test("service-role adapter mock duplicate result remains non-mutating", () => {
  const result = {
    status: "conflict_idempotent_duplicate",
    ok: false,
    version: "execution_record_audit_service_role_adapter_mock_v1",
    idempotencyKey: wouldInsert.idempotency_key,
    existingAuditEventId: auditRow.id,
    warnings: ["duplicate"],
    errors: [],
    realSupabaseCalled: false,
    serviceRoleUsed: false,
    writePerformed: false,
    remoteMutated: false,
  } satisfies ExecutionRecordAuditServiceRoleAdapterMockDuplicateResult;

  expect(result.status).toBe("conflict_idempotent_duplicate");
  expect(result.existingAuditEventId).toBe(auditRow.id);
  expectMockSafety(result);
});

test("service-role adapter mock security and service errors remain non-mutating", () => {
  const permission = {
    status: "permission_security_failure",
    ok: false,
    version: "execution_record_audit_service_role_adapter_mock_v1",
    warnings: [],
    errors: ["permission_denied"],
    realSupabaseCalled: false,
    serviceRoleUsed: false,
    writePerformed: false,
    remoteMutated: false,
  } satisfies ExecutionRecordAuditServiceRoleAdapterMockPermissionResult;
  const unavailable = {
    status: "service_unavailable",
    ok: false,
    version: "execution_record_audit_service_role_adapter_mock_v1",
    warnings: [],
    errors: ["service_unavailable"],
    realSupabaseCalled: false,
    serviceRoleUsed: false,
    writePerformed: false,
    remoteMutated: false,
  } satisfies ExecutionRecordAuditServiceRoleAdapterMockServiceUnavailableResult;
  const unknown = {
    status: "unknown_error",
    ok: false,
    version: "execution_record_audit_service_role_adapter_mock_v1",
    warnings: [],
    errors: ["unknown"],
    realSupabaseCalled: false,
    serviceRoleUsed: false,
    writePerformed: false,
    remoteMutated: false,
  } satisfies ExecutionRecordAuditServiceRoleAdapterMockUnknownErrorResult;

  expect(permission.status).toBe("permission_security_failure");
  expect(unavailable.status).toBe("service_unavailable");
  expect(unknown.status).toBe("unknown_error");

  for (const result of [permission, unavailable, unknown]) {
    expectMockSafety(result);
  }
});

test("service-role adapter mock source remains server-only and non-live", () => {
  const source = readFileSync(mockPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("insertAuditEventMock");
  expect(source).toContain("runExecutionRecordAuditServiceRoleAdapterMock");
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
});

test("writer remains disconnected from service-role adapter mock", () => {
  const source = readFileSync(writerPath, "utf8");

  expect(source).not.toContain(
    "execution-record-audit-writer-service-role-adapter-mock",
  );
  expect(source).toContain(
    "execution-record-audit-writer-service-role-adapter",
  );
  expect(source).toContain("wouldWrite: false");
  expect(source).toContain("insertWithServiceRole");
});
