import "server-only";

import type {
  ExecutionRecordAuditWriterMockIntegrationResult,
} from "@/lib/server/execution-record-audit-writer-mock-integration-harness";

export const EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_PREVIEW_FIXTURE_VERSION =
  "execution_record_audit_writer_mock_integration_preview_fixtures_v1" as const;

export type ExecutionRecordAuditWriterMockIntegrationPreviewFixtureStatus =
  | "success"
  | "conflict_idempotent_duplicate"
  | "permission_security_failure"
  | "service_unavailable"
  | "unknown_error"
  | "validation_failed"
  | "blocked";

export type ExecutionRecordAuditWriterMockIntegrationPreviewFixture = {
  id: string;
  title: "Audit Writer Mock Integration Preview";
  fixtureOnly: true;
  liveWriterBlocked: true;
  approvalImplied: false;
  status: ExecutionRecordAuditWriterMockIntegrationPreviewFixtureStatus;
  result: ExecutionRecordAuditWriterMockIntegrationResult;
};

const baseDryRun = {
  status: "ready",
  executionRecordId: "77777777-7777-4777-8777-777777777777",
  eventType: "execution_record_created",
  eventSource: "mock_integration_preview_fixture",
  sourceSystem: "trade_app",
  requestId: "audit-mock-integration-preview-request-1",
  idempotencyKey: "execution-record-audit:mock-integration-preview-1",
} as const;

const baseMappedSafety = {
  inserted: false,
  version: "execution_record_audit_writer_mock_integration_harness_v1",
  dryRun: baseDryRun,
  mockAdapterInvoked: true,
  realSupabaseCalled: false,
  serviceRoleUsed: false,
  writePerformed: false,
  remoteMutated: false,
  wouldWrite: false,
} as const;

const basePreview = {
  title: "Audit Writer Mock Integration Preview",
  fixtureOnly: true,
  liveWriterBlocked: true,
  approvalImplied: false,
} as const;

export const auditWriterMockIntegrationPreviewFixtures = [
  {
    ...basePreview,
    id: "mock-success-preview-fixture",
    status: "success",
    result: {
      ...baseMappedSafety,
      status: "success",
      ok: true,
      mockResult: {
        status: "success",
        ok: true,
        auditEventId: "88888888-8888-4888-8888-888888888888",
        idempotencyKey: baseDryRun.idempotencyKey,
        warnings: [],
        errors: [],
      },
      warnings: [],
      errors: [],
    },
  },
  {
    ...basePreview,
    id: "mock-duplicate-preview-fixture",
    status: "conflict_idempotent_duplicate",
    result: {
      ...baseMappedSafety,
      status: "conflict_idempotent_duplicate",
      ok: false,
      mockResult: {
        status: "conflict_idempotent_duplicate",
        ok: false,
        idempotencyKey: baseDryRun.idempotencyKey,
        existingAuditEventId: "88888888-8888-4888-8888-888888888888",
        warnings: ["duplicate_fixture"],
        errors: [],
      },
      warnings: ["duplicate_fixture"],
      errors: [],
    },
  },
  {
    ...basePreview,
    id: "mock-security-preview-fixture",
    status: "permission_security_failure",
    result: {
      ...baseMappedSafety,
      status: "permission_security_failure",
      ok: false,
      mockResult: {
        status: "permission_security_failure",
        ok: false,
        warnings: [],
        errors: ["permission_denied_fixture"],
      },
      warnings: [],
      errors: ["permission_denied_fixture"],
    },
  },
  {
    ...basePreview,
    id: "mock-unavailable-preview-fixture",
    status: "service_unavailable",
    result: {
      ...baseMappedSafety,
      status: "service_unavailable",
      ok: false,
      mockResult: {
        status: "service_unavailable",
        ok: false,
        warnings: [],
        errors: ["service_unavailable_fixture"],
      },
      warnings: [],
      errors: ["service_unavailable_fixture"],
    },
  },
  {
    ...basePreview,
    id: "mock-unknown-preview-fixture",
    status: "unknown_error",
    result: {
      ...baseMappedSafety,
      status: "unknown_error",
      ok: false,
      mockResult: {
        status: "unknown_error",
        ok: false,
        warnings: [],
        errors: ["unknown_error_fixture"],
      },
      warnings: [],
      errors: ["unknown_error_fixture"],
    },
  },
  {
    ...basePreview,
    id: "mock-invalid-preview-fixture",
    status: "validation_failed",
    result: {
      status: "validation_failed",
      ok: false,
      inserted: false,
      version: "execution_record_audit_writer_mock_integration_harness_v1",
      validation: {
        valid: false,
        errors: ["execution_record_id_invalid_uuid"],
        warnings: [],
      },
      dryRun: {
        status: "validation_failed",
        executionRecordId: null,
        eventType: null,
        eventSource: null,
        sourceSystem: null,
        requestId: null,
        idempotencyKey: null,
      },
      mockAdapterInvoked: false,
      warnings: [],
      errors: ["execution_record_id_invalid_uuid"],
      realSupabaseCalled: false,
      serviceRoleUsed: false,
      writePerformed: false,
      remoteMutated: false,
      wouldWrite: false,
    },
  },
  {
    ...basePreview,
    id: "mock-blocked-preview-fixture",
    status: "blocked",
    result: {
      status: "blocked",
      ok: false,
      inserted: false,
      version: "execution_record_audit_writer_mock_integration_harness_v1",
      reason: "mock_adapter_not_allowed",
      dryRun: baseDryRun,
      mockAdapterInvoked: false,
      warnings: [],
      errors: ["mock_adapter_not_allowed"],
      realSupabaseCalled: false,
      serviceRoleUsed: false,
      writePerformed: false,
      remoteMutated: false,
      wouldWrite: false,
    },
  },
] as const satisfies readonly ExecutionRecordAuditWriterMockIntegrationPreviewFixture[];

export function getAuditWriterMockIntegrationPreviewFixtures() {
  return auditWriterMockIntegrationPreviewFixtures;
}
