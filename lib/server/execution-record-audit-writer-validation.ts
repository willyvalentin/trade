import "server-only";

import {
  EXECUTION_RECORD_AUDIT_WRITER_AUTHORITY_MODES,
  type ExecutionRecordAuditWriterInput,
  type ExecutionRecordAuditWriterValidationResult,
} from "@/lib/server/execution-record-audit-writer-contract";

// Pure validation helper for future audit writer inputs. This module does not
// create Supabase clients, read env vars, call routes, write data, or authorize
// downstream execution behavior.

const uuidLikePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isoLikeTimestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const boundedIdentifierPattern = /^[a-zA-Z0-9:_./-]{1,160}$/;
const allowedActorTypes = [
  "system",
  "operator",
  "user",
  "service",
  "unknown",
] as const;

export const EXECUTION_RECORD_AUDIT_WRITER_VALIDATION_ERROR_LABELS = [
  "input_invalid",
  "execution_record_id_missing",
  "execution_record_id_invalid_uuid",
  "event_type_missing",
  "event_type_invalid",
  "source_missing",
  "source_event_source_missing",
  "source_event_source_invalid",
  "source_system_missing",
  "source_system_invalid",
  "idempotency_key_missing",
  "idempotency_key_invalid",
  "actor_missing",
  "actor_type_invalid",
  "actor_id_invalid_uuid",
  "authority_mode_invalid",
  "payload_missing",
  "payload_invalid_json",
  "evidence_missing",
  "evidence_invalid_json",
  "provenance_missing",
  "provenance_invalid_json",
  "metadata_invalid_json",
  "occurred_at_invalid_timestamp",
] as const;

export type ExecutionRecordAuditWriterValidationErrorLabel =
  (typeof EXECUTION_RECORD_AUDIT_WRITER_VALIDATION_ERROR_LABELS)[number];

export const EXECUTION_RECORD_AUDIT_WRITER_VALIDATION_WARNING_LABELS = [
  "request_id_missing",
] as const;

export type ExecutionRecordAuditWriterValidationWarningLabel =
  (typeof EXECUTION_RECORD_AUDIT_WRITER_VALIDATION_WARNING_LABELS)[number];

type ValidationAccumulator = {
  errors: string[];
  warnings: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isBoundedIdentifier(value: unknown): value is string {
  return isNonEmptyString(value) && boundedIdentifierPattern.test(value);
}

function validateRequiredString(
  value: unknown,
  field: string,
  { errors }: ValidationAccumulator,
) {
  if (!isNonEmptyString(value)) {
    errors.push(`${field}_missing`);
    return;
  }

  if (!isBoundedIdentifier(value)) {
    errors.push(`${field}_invalid`);
  }
}

function validateOptionalString(
  value: unknown,
  field: string,
  { errors }: ValidationAccumulator,
) {
  if (value === undefined || value === null) {
    return;
  }

  if (!isNonEmptyString(value)) {
    errors.push(`${field}_invalid`);
    return;
  }

  if (value.length > 512) {
    errors.push(`${field}_too_long`);
  }
}

function validateUuidLike(
  value: unknown,
  field: string,
  { errors }: ValidationAccumulator,
) {
  if (!isNonEmptyString(value)) {
    errors.push(`${field}_missing`);
    return;
  }

  if (!uuidLikePattern.test(value)) {
    errors.push(`${field}_invalid_uuid`);
  }
}

function validateOptionalUuidLike(
  value: unknown,
  field: string,
  { errors }: ValidationAccumulator,
) {
  if (value === undefined || value === null) {
    return;
  }

  if (!isNonEmptyString(value) || !uuidLikePattern.test(value)) {
    errors.push(`${field}_invalid_uuid`);
  }
}

function isJsonCompatible(value: unknown): boolean {
  const seen = new WeakSet<object>();

  function visit(item: unknown): boolean {
    if (item === null) {
      return true;
    }

    if (typeof item === "string" || typeof item === "boolean") {
      return true;
    }

    if (typeof item === "number") {
      return Number.isFinite(item);
    }

    if (Array.isArray(item)) {
      return item.every((entry) => visit(entry));
    }

    if (!isRecord(item)) {
      return false;
    }

    if (seen.has(item)) {
      return false;
    }

    seen.add(item);

    return Object.entries(item).every(
      ([key, entry]) => isNonEmptyString(key) && visit(entry),
    );
  }

  return visit(value);
}

function validateJsonField(
  value: unknown,
  field: string,
  { errors }: ValidationAccumulator,
) {
  if (value === undefined) {
    errors.push(`${field}_missing`);
    return;
  }

  if (!isJsonCompatible(value)) {
    errors.push(`${field}_invalid_json`);
  }
}

function validateTimestamp(
  value: unknown,
  field: string,
  { errors }: ValidationAccumulator,
) {
  if (value === undefined || value === null) {
    return;
  }

  if (!isNonEmptyString(value) || !isoLikeTimestampPattern.test(value)) {
    errors.push(`${field}_invalid_timestamp`);
    return;
  }

  if (Number.isNaN(Date.parse(value))) {
    errors.push(`${field}_invalid_timestamp`);
  }
}

function validateSource(
  value: unknown,
  accumulator: ValidationAccumulator,
) {
  if (!isRecord(value)) {
    accumulator.errors.push("source_missing");
    return;
  }

  validateRequiredString(value.eventSource, "source_event_source", accumulator);
  validateRequiredString(value.sourceSystem, "source_system", accumulator);
  validateOptionalString(
    value.sourceFingerprint,
    "source_fingerprint",
    accumulator,
  );
  validateOptionalString(value.traceId, "source_trace_id", accumulator);
  validateOptionalString(value.writerVersion, "source_writer_version", accumulator);
}

function validateActor(
  value: unknown,
  accumulator: ValidationAccumulator,
) {
  if (!isRecord(value)) {
    accumulator.errors.push("actor_missing");
    return;
  }

  if (
    !isNonEmptyString(value.actorType) ||
    !allowedActorTypes.includes(
      value.actorType as (typeof allowedActorTypes)[number],
    )
  ) {
    accumulator.errors.push("actor_type_invalid");
  }

  validateOptionalUuidLike(value.actorId, "actor_id", accumulator);
}

function validateAuthorityMode(
  value: unknown,
  { errors }: ValidationAccumulator,
) {
  if (
    !isNonEmptyString(value) ||
    !EXECUTION_RECORD_AUDIT_WRITER_AUTHORITY_MODES.includes(
      value as (typeof EXECUTION_RECORD_AUDIT_WRITER_AUTHORITY_MODES)[number],
    )
  ) {
    errors.push("authority_mode_invalid");
  }
}

export function validateExecutionRecordAuditWriterInput(
  input: unknown,
): ExecutionRecordAuditWriterValidationResult {
  const accumulator: ValidationAccumulator = {
    errors: [],
    warnings: [],
  };

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: ["input_invalid"],
      warnings: [],
    };
  }

  validateUuidLike(input.executionRecordId, "execution_record_id", accumulator);
  validateRequiredString(input.eventType, "event_type", accumulator);
  validateSource(input.source, accumulator);
  validateOptionalString(input.requestId, "request_id", accumulator);
  validateRequiredString(input.idempotencyKey, "idempotency_key", accumulator);
  validateOptionalString(
    input.duplicatePreventionKey,
    "duplicate_prevention_key",
    accumulator,
  );
  validateActor(input.actor, accumulator);
  validateAuthorityMode(input.authorityMode, accumulator);
  validateJsonField(input.payload, "payload", accumulator);
  validateJsonField(input.evidence, "evidence", accumulator);
  validateJsonField(input.provenance, "provenance", accumulator);
  validateTimestamp(input.occurredAt, "occurred_at", accumulator);

  if (input.requestId === undefined || input.requestId === null) {
    accumulator.warnings.push("request_id_missing");
  }

  if (!isJsonCompatible(input.metadata ?? {})) {
    accumulator.errors.push("metadata_invalid_json");
  }

  if (accumulator.errors.length > 0) {
    return {
      valid: false,
      errors: accumulator.errors,
      warnings: accumulator.warnings,
    };
  }

  return {
    valid: true,
    errors: [],
    warnings: accumulator.warnings,
  };
}

export type ValidatedExecutionRecordAuditWriterInput =
  ExecutionRecordAuditWriterInput;
