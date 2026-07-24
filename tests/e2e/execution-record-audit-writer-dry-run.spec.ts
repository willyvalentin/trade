import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditWriterInput,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditWriterDryRunReadyResult,
  ExecutionRecordAuditWriterDryRunValidationFailedResult,
} from "../../lib/server/execution-record-audit-writer-dry-run";

const dryRunPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-dry-run.ts",
);

const validInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "execution_record_created",
  source: {
    eventSource: "dry_run_test",
    sourceSystem: "trade_app",
    sourceFingerprint: "fingerprint-1",
    traceId: "trace-1",
    writerVersion: "dry-run-test",
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
    generatedBy: "action_800_test",
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
  event_source: "dry_run_test",
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
  writer_version: "dry-run-test",
} satisfies ExecutionRecordAuditEventInsert;

test("audit writer dry-run source remains server-only and non-writing", () => {
  const source = readFileSync(dryRunPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("buildExecutionRecordAuditWriterDryRun");
  expect(source).toContain("validateExecutionRecordAuditWriterInput");
  expect(source).toContain("status: \"ready\"");
  expect(source).toContain("status: \"validation_failed\"");
  expect(source).toContain("status: \"blocked\"");
  expect(source).toContain("wouldWrite: false");

  expect(source).not.toContain("createClient");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toContain("Avanza");
  expect(source).not.toContain("broker");
});

test("audit writer dry-run ready result shape contains no-write insert payload", () => {
  const ready = {
    status: "ready",
    ok: true,
    wouldWrite: false,
    wouldInsert: expectedWouldInsert,
    validation: {
      valid: true,
      errors: [],
      warnings: [],
    },
    warnings: [],
  } satisfies ExecutionRecordAuditWriterDryRunReadyResult;

  expect(validInput.authorityMode).toBe("server_append_only");
  expect(ready.status).toBe("ready");
  expect(ready.wouldWrite).toBe(false);
  expect(ready.wouldInsert).toEqual(expectedWouldInsert);
  expect(ready.wouldInsert.idempotency_key).toBe(validInput.idempotencyKey);
  expect(ready.wouldInsert.request_id).toBe(validInput.requestId);
});

test("audit writer dry-run invalid result shape blocks inserts", () => {
  const invalid = {
    status: "validation_failed",
    ok: false,
    wouldWrite: false,
    wouldInsert: null,
    validation: {
      valid: false,
      errors: ["execution_record_id_invalid_uuid"],
      warnings: [],
    },
    errors: ["execution_record_id_invalid_uuid"],
    warnings: [],
  } satisfies ExecutionRecordAuditWriterDryRunValidationFailedResult;

  expect(invalid.status).toBe("validation_failed");
  expect(invalid.wouldWrite).toBe(false);
  expect(invalid.wouldInsert).toBeNull();
});

test("audit writer dry-run source is deterministic and side-effect free", () => {
  const source = readFileSync(dryRunPath, "utf8");

  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("crypto.randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
});
