import "server-only";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditWriterInput,
  ExecutionRecordAuditWriterValidationResult,
} from "@/lib/server/execution-record-audit-writer-contract";
import {
  validateExecutionRecordAuditWriterInput,
} from "@/lib/server/execution-record-audit-writer-validation";

// Pure dry-run builder for future audit writer inputs. This module validates
// and shapes a would-insert payload only; it never creates clients, reads env,
// calls routes, writes data, or grants downstream authority.

export const EXECUTION_RECORD_AUDIT_WRITER_DRY_RUN_STATUSES = [
  "ready",
  "validation_failed",
  "blocked",
] as const;

export type ExecutionRecordAuditWriterDryRunStatus =
  (typeof EXECUTION_RECORD_AUDIT_WRITER_DRY_RUN_STATUSES)[number];

export type ExecutionRecordAuditWriterDryRunReadyResult = {
  status: "ready";
  ok: true;
  wouldWrite: false;
  wouldInsert: ExecutionRecordAuditEventInsert;
  validation: Extract<
    ExecutionRecordAuditWriterValidationResult,
    { valid: true }
  >;
  warnings: string[];
};

export type ExecutionRecordAuditWriterDryRunValidationFailedResult = {
  status: "validation_failed";
  ok: false;
  wouldWrite: false;
  wouldInsert: null;
  validation: ExecutionRecordAuditWriterValidationResult;
  errors: string[];
  warnings: string[];
};

export type ExecutionRecordAuditWriterDryRunBlockedResult = {
  status: "blocked";
  ok: false;
  wouldWrite: false;
  wouldInsert: null;
  validation: ExecutionRecordAuditWriterValidationResult;
  errors: string[];
  warnings: string[];
};

export type ExecutionRecordAuditWriterDryRunResult =
  | ExecutionRecordAuditWriterDryRunReadyResult
  | ExecutionRecordAuditWriterDryRunValidationFailedResult
  | ExecutionRecordAuditWriterDryRunBlockedResult;

function toValidInput(input: unknown): ExecutionRecordAuditWriterInput {
  return input as ExecutionRecordAuditWriterInput;
}

function buildWouldInsert(
  input: ExecutionRecordAuditWriterInput,
): ExecutionRecordAuditEventInsert {
  return {
    actor_id: input.actor.actorId ?? null,
    actor_type: input.actor.actorType,
    duplicate_prevention_key: input.duplicatePreventionKey ?? null,
    event_payload: input.payload,
    event_source: input.source.eventSource,
    event_status: "dry_run_ready",
    event_type: input.eventType,
    evidence_payload: input.evidence,
    execution_record_id: input.executionRecordId,
    idempotency_key: input.idempotencyKey,
    metadata: {
      authorityMode: input.authorityMode,
      inputMetadata: input.metadata ?? {},
      provenance: input.provenance,
      wouldWrite: false,
    },
    occurred_at: input.occurredAt ?? null,
    request_id: input.requestId ?? null,
    schema_version: input.schemaVersion ?? "1",
    source_fingerprint: input.source.sourceFingerprint ?? null,
    source_system: input.source.sourceSystem,
    trace_id: input.source.traceId ?? null,
    writer_version: input.source.writerVersion ?? null,
  };
}

export function buildExecutionRecordAuditWriterDryRun(
  input: unknown,
): ExecutionRecordAuditWriterDryRunResult {
  const validation = validateExecutionRecordAuditWriterInput(input);

  if (!validation.valid) {
    return {
      status: "validation_failed",
      ok: false,
      wouldWrite: false,
      wouldInsert: null,
      validation,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  const validInput = toValidInput(input);

  if (validInput.authorityMode === "blocked") {
    return {
      status: "blocked",
      ok: false,
      wouldWrite: false,
      wouldInsert: null,
      validation,
      errors: ["authority_mode_blocked"],
      warnings: validation.warnings,
    };
  }

  return {
    status: "ready",
    ok: true,
    wouldWrite: false,
    wouldInsert: buildWouldInsert(validInput),
    validation,
    warnings: validation.warnings,
  };
}
