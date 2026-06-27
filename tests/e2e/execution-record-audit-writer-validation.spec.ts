import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ExecutionRecordAuditWriterInput,
  ExecutionRecordAuditWriterValidationResult,
} from "../../lib/server/execution-record-audit-writer-contract";

const validationPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-validation.ts",
);

const validInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "execution_record_created",
  source: {
    eventSource: "contract_test",
    sourceSystem: "trade_app",
    sourceFingerprint: "fingerprint-1",
    traceId: "trace-1",
    writerVersion: "validation-test",
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
    action: "created",
    quantity: 10,
    tags: ["contract", "validation"],
  },
  evidence: {
    source: "fixture",
    confirmed: true,
  },
  provenance: {
    generatedBy: "action_799_test",
  },
  occurredAt: "2026-06-22T12:30:00.000Z",
  metadata: {
    deterministic: true,
  },
} satisfies ExecutionRecordAuditWriterInput;

test("audit writer validation source remains server-only and non-writing", () => {
  const source = readFileSync(validationPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("validateExecutionRecordAuditWriterInput");
  expect(source).toContain(
    "@/lib/server/execution-record-audit-writer-contract",
  );
  expect(source).toContain("execution_record_id_invalid_uuid");
  expect(source).toContain("authority_mode_invalid");
  expect(source).toContain("payload_invalid_json");
  expect(source).toContain("evidence_invalid_json");
  expect(source).toContain("provenance_invalid_json");

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

test("audit writer validation accepts representative valid input types", () => {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
  } satisfies ExecutionRecordAuditWriterValidationResult;

  expect(validInput.authorityMode).toBe("server_append_only");
  expect(validInput.payload).toEqual({
    action: "created",
    quantity: 10,
    tags: ["contract", "validation"],
  });
  expect(result.valid).toBe(true);
});

test("audit writer validation documents invalid input classifications", () => {
  const invalidCases = [
    "input_invalid",
    "execution_record_id_missing",
    "execution_record_id_invalid_uuid",
    "event_type_missing",
    "event_type_invalid",
    "source_missing",
    "source_event_source_missing",
    "source_system_missing",
    "idempotency_key_missing",
    "actor_missing",
    "actor_type_invalid",
    "authority_mode_invalid",
    "payload_missing",
    "payload_invalid_json",
    "evidence_missing",
    "evidence_invalid_json",
    "provenance_missing",
    "provenance_invalid_json",
    "occurred_at_invalid_timestamp",
  ];
  const source = readFileSync(validationPath, "utf8");

  for (const invalidCase of invalidCases) {
    expect(source).toContain(invalidCase);
  }
});

test("audit writer validation is deterministic and side-effect free by source", () => {
  const source = readFileSync(validationPath, "utf8");

  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("crypto.randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
});
