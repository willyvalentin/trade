import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ExecutionRecordAuditWriterDryRunReadyResult,
  ExecutionRecordAuditWriterDryRunBlockedResult,
  ExecutionRecordAuditWriterDryRunValidationFailedResult,
} from "../../lib/server/execution-record-audit-writer-dry-run";
import type {
  ExecutionRecordAuditWriterDryRunPreview,
} from "../../lib/server/execution-record-audit-writer-dry-run-preview";

const previewPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-dry-run-preview.ts",
);

const readyDryRun = {
  status: "ready",
  ok: true,
  wouldWrite: false,
  wouldInsert: {
    actor_id: null,
    actor_type: "system",
    duplicate_prevention_key: "duplicate-1",
    event_payload: {
      symbol: "AMD",
      credential: "hidden",
      details: {
        token: "hidden",
        visible: true,
      },
    },
    event_source: "preview_test",
    event_status: "dry_run_ready",
    event_type: "execution_record_created",
    evidence_payload: {
      source: "fixture",
      sessionCookie: "hidden",
    },
    execution_record_id: "11111111-1111-4111-8111-111111111111",
    idempotency_key: "execution-record-audit:request-1",
    metadata: {
      authorityMode: "server_append_only",
      provenance: {
        generatedBy: "action_801_test",
        service_role: "hidden",
      },
      wouldWrite: false,
    },
    occurred_at: "2026-06-22T12:30:00.000Z",
    request_id: "request-1",
    schema_version: "1",
    source_fingerprint: "fingerprint-1",
    source_system: "trade_app",
    trace_id: "trace-1",
    writer_version: "preview-test",
  },
  validation: {
    valid: true,
    errors: [],
    warnings: [],
  },
  warnings: [],
} satisfies ExecutionRecordAuditWriterDryRunReadyResult;

test("audit writer dry-run preview source remains server-only and non-writing", () => {
  const source = readFileSync(previewPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("buildExecutionRecordAuditWriterDryRunPreview");
  expect(source).toContain("wouldWrite: false");
  expect(source).toContain("approvalImplied: false");
  expect(source).toContain("[redacted]");
  expect(source).toContain("Ready dry-run preview - not written");

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

test("audit writer ready preview shape is not writable and carries identifiers", () => {
  const preview = {
    status: "ready",
    label: "Ready dry-run preview - not written",
    severity: "info",
    wouldWrite: false,
    notWritten: true,
    approvalImplied: false,
    validation: {
      valid: true,
      errors: [],
      warnings: [],
      errorCount: 0,
      warningCount: 0,
    },
    insertPreview: {
      executionRecordId: readyDryRun.wouldInsert.execution_record_id,
      eventType: readyDryRun.wouldInsert.event_type,
      eventSource: readyDryRun.wouldInsert.event_source,
      sourceSystem: readyDryRun.wouldInsert.source_system,
      requestId: readyDryRun.wouldInsert.request_id,
      idempotencyKey: readyDryRun.wouldInsert.idempotency_key,
      duplicatePreventionKey:
        readyDryRun.wouldInsert.duplicate_prevention_key,
      authorityMode: "server_append_only",
      occurredAt: readyDryRun.wouldInsert.occurred_at,
      schemaVersion: readyDryRun.wouldInsert.schema_version,
      wouldWrite: false,
      payloadSummary: {
        kind: "object",
        itemCount: 3,
        keys: ["symbol", "credential", "details"],
        preview: {
          symbol: "AMD",
          credential: "[redacted]",
          details: {
            token: "[redacted]",
            visible: true,
          },
        },
        redactedKeys: ["credential", "token"],
        truncated: false,
      },
      evidenceSummary: {
        kind: "object",
        itemCount: 2,
        keys: ["source", "sessionCookie"],
        preview: {
          source: "fixture",
          sessionCookie: "[redacted]",
        },
        redactedKeys: ["sessionCookie"],
        truncated: false,
      },
      provenanceSummary: {
        kind: "object",
        itemCount: 2,
        keys: ["generatedBy", "service_role"],
        preview: {
          generatedBy: "action_801_test",
          service_role: "[redacted]",
        },
        redactedKeys: ["service_role"],
        truncated: false,
      },
    },
  } satisfies ExecutionRecordAuditWriterDryRunPreview;

  expect(preview.status).toBe("ready");
  expect(preview.wouldWrite).toBe(false);
  expect(preview.approvalImplied).toBe(false);
  expect(preview.insertPreview?.executionRecordId).toBe(
    "11111111-1111-4111-8111-111111111111",
  );
  expect(preview.insertPreview?.idempotencyKey).toBe(
    "execution-record-audit:request-1",
  );
  expect(preview.insertPreview?.payloadSummary.redactedKeys).toContain(
    "credential",
  );
});

test("audit writer invalid and blocked preview shapes are not writable", () => {
  const validationFailed = {
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
  const blocked = {
    status: "blocked",
    ok: false,
    wouldWrite: false,
    wouldInsert: null,
    validation: {
      valid: true,
      errors: [],
      warnings: [],
    },
    errors: ["authority_mode_blocked"],
    warnings: [],
  } satisfies ExecutionRecordAuditWriterDryRunBlockedResult;
  const invalidPreview = {
    status: validationFailed.status,
    label: "Validation failed dry-run preview - not writable",
    severity: "error",
    wouldWrite: false,
    notWritten: true,
    approvalImplied: false,
    validation: {
      valid: false,
      errors: validationFailed.errors,
      warnings: [],
      errorCount: 1,
      warningCount: 0,
    },
    insertPreview: null,
  } satisfies ExecutionRecordAuditWriterDryRunPreview;
  const blockedPreview = {
    status: blocked.status,
    label: "Blocked dry-run preview - not writable",
    severity: "warning",
    wouldWrite: false,
    notWritten: true,
    approvalImplied: false,
    validation: {
      valid: true,
      errors: [],
      warnings: [],
      errorCount: 0,
      warningCount: 0,
    },
    insertPreview: null,
  } satisfies ExecutionRecordAuditWriterDryRunPreview;

  expect(invalidPreview.wouldWrite).toBe(false);
  expect(invalidPreview.insertPreview).toBeNull();
  expect(invalidPreview.validation.errors).toEqual([
    "execution_record_id_invalid_uuid",
  ]);
  expect(blockedPreview.wouldWrite).toBe(false);
  expect(blockedPreview.insertPreview).toBeNull();
});

test("audit writer dry-run preview source is deterministic and side-effect free", () => {
  const source = readFileSync(previewPath, "utf8");

  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("crypto.randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
});
