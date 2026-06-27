import "server-only";

import type {
  ExecutionRecordAuditWriterDryRunResult,
} from "@/lib/server/execution-record-audit-writer-dry-run";

// Pure preview adapter for audit writer dry-run results. This module formats a
// display-safe summary only; it never creates clients, reads env, calls routes,
// writes data, or grants downstream authority.

export type ExecutionRecordAuditWriterDryRunPreviewSeverity =
  | "info"
  | "warning"
  | "error";

export type ExecutionRecordAuditWriterDryRunJsonSummary = {
  kind: "null" | "scalar" | "array" | "object" | "unsupported";
  itemCount?: number;
  keys?: string[];
  preview?: unknown;
  redactedKeys: string[];
  truncated: boolean;
};

export type ExecutionRecordAuditWriterDryRunInsertPreview = {
  executionRecordId: string | null;
  eventType: string | null;
  eventSource: string | null;
  sourceSystem: string | null;
  requestId: string | null;
  idempotencyKey: string | null;
  duplicatePreventionKey: string | null;
  authorityMode: string | null;
  occurredAt: string | null;
  schemaVersion: string | null;
  wouldWrite: false;
  payloadSummary: ExecutionRecordAuditWriterDryRunJsonSummary;
  evidenceSummary: ExecutionRecordAuditWriterDryRunJsonSummary;
  provenanceSummary: ExecutionRecordAuditWriterDryRunJsonSummary;
};

export type ExecutionRecordAuditWriterDryRunPreview = {
  status: ExecutionRecordAuditWriterDryRunResult["status"];
  label: string;
  severity: ExecutionRecordAuditWriterDryRunPreviewSeverity;
  wouldWrite: false;
  notWritten: true;
  approvalImplied: false;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    errorCount: number;
    warningCount: number;
  };
  insertPreview: ExecutionRecordAuditWriterDryRunInsertPreview | null;
};

const sensitiveKeyPattern =
  /(password|credential|cookie|session|secret|token|auth|authorization|apikey|api_key|connection|string|dsn|service_role)/i;
const maxPreviewKeys = 8;
const maxPreviewArrayItems = 5;
const maxPreviewStringLength = 120;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function truncateString(value: string) {
  return value.length > maxPreviewStringLength
    ? `${value.slice(0, maxPreviewStringLength)}...`
    : value;
}

function sanitizePreviewValue(
  value: unknown,
  redactedKeys: Set<string>,
  depth = 0,
): unknown {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (typeof value === "string") {
    return truncateString(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (depth >= 2) {
    return "[summary_truncated]";
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, maxPreviewArrayItems)
      .map((entry) => sanitizePreviewValue(entry, redactedKeys, depth + 1));
  }

  if (!isRecord(value)) {
    return "[unsupported]";
  }

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, maxPreviewKeys)
      .map(([key, entry]) => {
        if (sensitiveKeyPattern.test(key)) {
          redactedKeys.add(key);
          return [key, "[redacted]"];
        }

        return [key, sanitizePreviewValue(entry, redactedKeys, depth + 1)];
      }),
  );
}

function summarizeJson(value: unknown): ExecutionRecordAuditWriterDryRunJsonSummary {
  const redactedKeys = new Set<string>();

  if (value === null || value === undefined) {
    return {
      kind: "null",
      preview: null,
      redactedKeys: [],
      truncated: false,
    };
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return {
      kind: "scalar",
      preview:
        typeof value === "string" ? sanitizePreviewValue(value, redactedKeys) : value,
      redactedKeys: [],
      truncated:
        typeof value === "string" && value.length > maxPreviewStringLength,
    };
  }

  if (Array.isArray(value)) {
    return {
      kind: "array",
      itemCount: value.length,
      preview: sanitizePreviewValue(value, redactedKeys),
      redactedKeys: [...redactedKeys].sort(),
      truncated: value.length > maxPreviewArrayItems,
    };
  }

  if (!isRecord(value)) {
    return {
      kind: "unsupported",
      redactedKeys: [],
      truncated: false,
    };
  }

  const keys = Object.keys(value);

  return {
    kind: "object",
    itemCount: keys.length,
    keys: keys.slice(0, maxPreviewKeys),
    preview: sanitizePreviewValue(value, redactedKeys),
    redactedKeys: [...redactedKeys].sort(),
    truncated: keys.length > maxPreviewKeys,
  };
}

function metadataRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function buildInsertPreview(
  result: Extract<ExecutionRecordAuditWriterDryRunResult, { status: "ready" }>,
): ExecutionRecordAuditWriterDryRunInsertPreview {
  const metadata = metadataRecord(result.wouldInsert.metadata);

  return {
    executionRecordId: result.wouldInsert.execution_record_id ?? null,
    eventType: result.wouldInsert.event_type ?? null,
    eventSource: result.wouldInsert.event_source ?? null,
    sourceSystem: result.wouldInsert.source_system ?? null,
    requestId: result.wouldInsert.request_id ?? null,
    idempotencyKey: result.wouldInsert.idempotency_key ?? null,
    duplicatePreventionKey: result.wouldInsert.duplicate_prevention_key ?? null,
    authorityMode:
      typeof metadata.authorityMode === "string" ? metadata.authorityMode : null,
    occurredAt: result.wouldInsert.occurred_at ?? null,
    schemaVersion: result.wouldInsert.schema_version ?? null,
    wouldWrite: false,
    payloadSummary: summarizeJson(result.wouldInsert.event_payload),
    evidenceSummary: summarizeJson(result.wouldInsert.evidence_payload),
    provenanceSummary: summarizeJson(metadata.provenance ?? null),
  };
}

function labelForStatus(status: ExecutionRecordAuditWriterDryRunResult["status"]) {
  if (status === "ready") {
    return "Ready dry-run preview - not written";
  }

  if (status === "blocked") {
    return "Blocked dry-run preview - not writable";
  }

  return "Validation failed dry-run preview - not writable";
}

function severityForStatus(
  status: ExecutionRecordAuditWriterDryRunResult["status"],
): ExecutionRecordAuditWriterDryRunPreviewSeverity {
  if (status === "ready") {
    return "info";
  }

  if (status === "blocked") {
    return "warning";
  }

  return "error";
}

export function buildExecutionRecordAuditWriterDryRunPreview(
  result: ExecutionRecordAuditWriterDryRunResult,
): ExecutionRecordAuditWriterDryRunPreview {
  return {
    status: result.status,
    label: labelForStatus(result.status),
    severity: severityForStatus(result.status),
    wouldWrite: false,
    notWritten: true,
    approvalImplied: false,
    validation: {
      valid: result.validation.valid,
      errors: result.validation.valid ? [] : result.validation.errors,
      warnings: result.validation.warnings,
      errorCount: result.validation.valid ? 0 : result.validation.errors.length,
      warningCount: result.validation.warnings.length,
    },
    insertPreview:
      result.status === "ready" ? buildInsertPreview(result) : null,
  };
}
