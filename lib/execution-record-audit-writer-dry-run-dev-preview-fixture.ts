export type AuditWriterDryRunDevPreviewStatus =
  | "ready"
  | "validation_failed"
  | "blocked";

export type AuditWriterDryRunDevPreviewSeverity =
  | "info"
  | "warning"
  | "error";

export type AuditWriterDryRunDevPreviewJsonSummary = {
  kind: "null" | "scalar" | "array" | "object" | "unsupported";
  itemCount?: number;
  keys?: string[];
  preview?: unknown;
  redactedKeys: string[];
  truncated: boolean;
};

export type AuditWriterDryRunDevPreviewInsert = {
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
  payloadSummary: AuditWriterDryRunDevPreviewJsonSummary;
  evidenceSummary: AuditWriterDryRunDevPreviewJsonSummary;
  provenanceSummary: AuditWriterDryRunDevPreviewJsonSummary;
};

export type AuditWriterDryRunDevPreviewFixture = {
  id: string;
  title: "Audit Writer Dry-Run Preview";
  badges: readonly ["Fixture only", "No write performed", "Writer blocked"];
  status: AuditWriterDryRunDevPreviewStatus;
  severity: AuditWriterDryRunDevPreviewSeverity;
  label: string;
  wouldWrite: false;
  notWritten: true;
  approvalImplied: false;
  validation: {
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
    errorCount: number;
    warningCount: number;
  };
  insertPreview: AuditWriterDryRunDevPreviewInsert | null;
};

const baseBadges = [
  "Fixture only",
  "No write performed",
  "Writer blocked",
] as const;

const safePayloadSummary = {
  kind: "object",
  itemCount: 3,
  keys: ["symbol", "side", "quantity"],
  preview: {
    symbol: "AMD",
    side: "buy",
    quantity: 10,
  },
  redactedKeys: [],
  truncated: false,
} satisfies AuditWriterDryRunDevPreviewJsonSummary;

const safeEvidenceSummary = {
  kind: "object",
  itemCount: 3,
  keys: ["captureMode", "confirmationState", "maskedAccount"],
  preview: {
    captureMode: "fixture",
    confirmationState: "observed",
    maskedAccount: "[redacted]",
  },
  redactedKeys: ["maskedAccount"],
  truncated: false,
} satisfies AuditWriterDryRunDevPreviewJsonSummary;

const safeProvenanceSummary = {
  kind: "object",
  itemCount: 3,
  keys: ["generatedBy", "action", "fixtureOnly"],
  preview: {
    generatedBy: "action_802_dev_preview_fixture",
    action: "802",
    fixtureOnly: true,
  },
  redactedKeys: [],
  truncated: false,
} satisfies AuditWriterDryRunDevPreviewJsonSummary;

export const auditWriterDryRunDevPreviewFixtures = [
  {
    id: "ready-fixture",
    title: "Audit Writer Dry-Run Preview",
    badges: baseBadges,
    status: "ready",
    severity: "info",
    label: "Ready fixture - no write performed",
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
      executionRecordId: "11111111-1111-4111-8111-111111111111",
      eventType: "execution_record_created",
      eventSource: "dry_run_dev_preview_fixture",
      sourceSystem: "trade_app",
      requestId: "audit-dev-preview-request-1",
      idempotencyKey: "execution-record-audit:dev-preview-request-1",
      duplicatePreventionKey: "audit-dev-preview-duplicate-1",
      authorityMode: "server_append_only",
      occurredAt: "2026-06-22T12:30:00.000Z",
      schemaVersion: "1",
      wouldWrite: false,
      payloadSummary: safePayloadSummary,
      evidenceSummary: safeEvidenceSummary,
      provenanceSummary: safeProvenanceSummary,
    },
  },
  {
    id: "validation-failed-fixture",
    title: "Audit Writer Dry-Run Preview",
    badges: baseBadges,
    status: "validation_failed",
    severity: "error",
    label: "Validation failed fixture - no write performed",
    wouldWrite: false,
    notWritten: true,
    approvalImplied: false,
    validation: {
      valid: false,
      errors: ["execution_record_id_invalid_uuid"],
      warnings: [],
      errorCount: 1,
      warningCount: 0,
    },
    insertPreview: null,
  },
  {
    id: "blocked-fixture",
    title: "Audit Writer Dry-Run Preview",
    badges: baseBadges,
    status: "blocked",
    severity: "warning",
    label: "Blocked fixture - writer remains blocked",
    wouldWrite: false,
    notWritten: true,
    approvalImplied: false,
    validation: {
      valid: true,
      errors: [],
      warnings: ["writer_implementation_absent"],
      errorCount: 0,
      warningCount: 1,
    },
    insertPreview: null,
  },
] as const satisfies readonly AuditWriterDryRunDevPreviewFixture[];

export function getAuditWriterDryRunDevPreviewFixtures() {
  return auditWriterDryRunDevPreviewFixtures;
}
