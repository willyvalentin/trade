import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditEventRow,
  ExecutionRecordAuditWriterAuthorityBoundaries,
  ExecutionRecordAuditWriterBlockedResult,
  ExecutionRecordAuditWriterConflictResult,
  ExecutionRecordAuditWriterInput,
  ExecutionRecordAuditWriterServiceUnavailableResult,
  ExecutionRecordAuditWriterSuccessResult,
  ExecutionRecordAuditWriterUnknownErrorResult,
  ExecutionRecordAuditWriterValidationFailedResult,
  ExecutionRecordAuditWriterValidationResult,
} from "../../lib/server/execution-record-audit-writer-contract";

const contractPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-contract.ts",
);

const representativeJson = {
  source: "contract_test",
  nested: {
    ok: true,
    count: 1,
  },
  items: ["payload", "evidence", "provenance"],
};

test("audit writer contract source remains server-only and non-writing", () => {
  const source = readFileSync(contractPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("@/lib/supabase-database.types");
  expect(source).toContain("ExecutionRecordAuditEventRow");
  expect(source).toContain("ExecutionRecordAuditEventInsert");
  expect(source).toContain("ExecutionRecordAuditEventUpdate");
  expect(source).toContain("ExecutionRecordAuditWriterInput");
  expect(source).toContain("ExecutionRecordAuditWriterResult");

  expect(source).not.toContain("createClient");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
});

test("audit writer contract accepts representative input and JSON payloads", () => {
  const input = {
    executionRecordId: "11111111-1111-4111-8111-111111111111",
    eventType: "execution_record_created",
    source: {
      eventSource: "contract_test",
      sourceSystem: "trade_app",
      sourceFingerprint: "fingerprint-1",
      traceId: "trace-1",
      writerVersion: "contract-only",
    },
    requestId: "request-1",
    idempotencyKey: "execution-record-audit:request-1",
    duplicatePreventionKey: "execution-record-audit:duplicate-1",
    actor: {
      actorType: "system",
      actorId: null,
    },
    authorityMode: "server_append_only",
    payload: representativeJson,
    evidence: representativeJson,
    provenance: representativeJson,
    occurredAt: "2026-06-22T12:30:00.000Z",
    schemaVersion: "1",
    metadata: representativeJson,
  } satisfies ExecutionRecordAuditWriterInput;

  expect(input.authorityMode).toBe("server_append_only");
  expect(input.payload).toEqual(representativeJson);
  expect(input.evidence).toEqual(representativeJson);
  expect(input.provenance).toEqual(representativeJson);
});

test("audit writer contract classifies success and failure result shapes", () => {
  const auditRow = {
    actor_id: null,
    actor_type: "system",
    created_at: "2026-06-22T12:30:00.000Z",
    duplicate_prevention_key: "duplicate-1",
    event_payload: representativeJson,
    event_source: "contract_test",
    event_status: "recorded",
    event_type: "execution_record_created",
    evidence_payload: representativeJson,
    execution_record_id: "11111111-1111-4111-8111-111111111111",
    id: "22222222-2222-4222-8222-222222222222",
    idempotency_key: "execution-record-audit:request-1",
    metadata: representativeJson,
    occurred_at: "2026-06-22T12:30:00.000Z",
    request_id: "request-1",
    schema_version: "1",
    source_fingerprint: "fingerprint-1",
    source_system: "trade_app",
    trace_id: "trace-1",
    writer_version: "contract-only",
  } satisfies ExecutionRecordAuditEventRow;

  const insertPayload = {
    event_source: "contract_test",
    event_status: "recorded",
    event_type: "execution_record_created",
    execution_record_id: auditRow.execution_record_id,
    idempotency_key: auditRow.idempotency_key,
    source_system: "trade_app",
  } satisfies ExecutionRecordAuditEventInsert;

  const valid = {
    valid: true,
    errors: [],
    warnings: [],
  } satisfies ExecutionRecordAuditWriterValidationResult;

  const invalid = {
    valid: false,
    errors: ["missing_idempotency_key"],
    warnings: ["contract_test_warning"],
  } satisfies ExecutionRecordAuditWriterValidationResult;

  const success = {
    status: "success",
    ok: true,
    inserted: true,
    auditEventId: auditRow.id,
    executionRecordId: auditRow.execution_record_id,
    idempotencyKey: auditRow.idempotency_key,
    row: auditRow,
    warnings: [],
  } satisfies ExecutionRecordAuditWriterSuccessResult;

  const blocked = {
    status: "blocked",
    ok: false,
    inserted: false,
    errors: ["write_path_not_approved"],
    warnings: [],
    reason: "write_path_not_approved",
  } satisfies ExecutionRecordAuditWriterBlockedResult;

  const validationFailed = {
    status: "validation_failed",
    ok: false,
    inserted: false,
    validation: invalid,
  } satisfies ExecutionRecordAuditWriterValidationFailedResult;

  const conflict = {
    status: "conflict_idempotent_duplicate",
    ok: false,
    inserted: false,
    idempotencyKey: auditRow.idempotency_key,
    existingAuditEventId: auditRow.id,
    warnings: ["duplicate"],
  } satisfies ExecutionRecordAuditWriterConflictResult;

  const serviceUnavailable = {
    status: "service_unavailable",
    ok: false,
    inserted: false,
    errors: ["service_role_unavailable"],
    warnings: [],
  } satisfies ExecutionRecordAuditWriterServiceUnavailableResult;

  const unknownError = {
    status: "unknown_error",
    ok: false,
    inserted: false,
    errors: ["unknown"],
    warnings: [],
  } satisfies ExecutionRecordAuditWriterUnknownErrorResult;

  expect(insertPayload.idempotency_key).toBe(auditRow.idempotency_key);
  expect(valid.valid).toBe(true);
  expect(success.inserted).toBe(true);
  expect(blocked.inserted).toBe(false);
  expect(validationFailed.validation.valid).toBe(false);
  expect(conflict.status).toBe("conflict_idempotent_duplicate");
  expect(serviceUnavailable.status).toBe("service_unavailable");
  expect(unknownError.status).toBe("unknown_error");
});

test("audit writer authority boundaries do not imply downstream authority", () => {
  const boundaries = {
    mayAppendAuditEvent: true,
    mayMutateTrades: false,
    mayUpdateStatsPnl: false,
    mayCallBroker: false,
    mayCallAvanza: false,
    mayApproveExecution: false,
    mayEnableAutomaticMode: false,
  } satisfies ExecutionRecordAuditWriterAuthorityBoundaries;

  expect(boundaries.mayAppendAuditEvent).toBe(true);
  expect(boundaries.mayMutateTrades).toBe(false);
  expect(boundaries.mayUpdateStatsPnl).toBe(false);
  expect(boundaries.mayCallBroker).toBe(false);
  expect(boundaries.mayCallAvanza).toBe(false);
  expect(boundaries.mayApproveExecution).toBe(false);
  expect(boundaries.mayEnableAutomaticMode).toBe(false);
});
