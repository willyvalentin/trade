import "server-only";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditEventRow,
  ExecutionRecordAuditWriterValidationResult,
} from "@/lib/server/execution-record-audit-writer-contract";
import {
  buildExecutionRecordAuditWriterDryRun,
} from "@/lib/server/execution-record-audit-writer-dry-run";
import {
  runExecutionRecordAuditServiceRoleAdapterMock,
  type ExecutionRecordAuditServiceRoleAdapterMockBehavior,
  type ExecutionRecordAuditServiceRoleAdapterMockResult,
  type ExecutionRecordAuditServiceRoleAdapterMockStatus,
} from "@/lib/server/execution-record-audit-writer-service-role-adapter-mock";

export const EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_HARNESS_VERSION =
  "execution_record_audit_writer_mock_integration_harness_v1" as const;

export type ExecutionRecordAuditWriterMockIntegrationHarnessVersion =
  typeof EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_HARNESS_VERSION;

export type ExecutionRecordAuditWriterMockIntegrationSafety = {
  realSupabaseCalled: false;
  serviceRoleUsed: false;
  writePerformed: false;
  remoteMutated: false;
  wouldWrite: false;
};

export const EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_SAFETY = {
  realSupabaseCalled: false,
  serviceRoleUsed: false,
  writePerformed: false,
  remoteMutated: false,
  wouldWrite: false,
} as const satisfies ExecutionRecordAuditWriterMockIntegrationSafety;

export type ExecutionRecordAuditWriterMockIntegrationDryRunSummary = {
  status: "ready" | "validation_failed" | "blocked";
  executionRecordId: ExecutionRecordAuditEventInsert["execution_record_id"] | null;
  eventType: ExecutionRecordAuditEventInsert["event_type"] | null;
  eventSource: ExecutionRecordAuditEventInsert["event_source"] | null;
  sourceSystem: ExecutionRecordAuditEventInsert["source_system"] | null;
  requestId: ExecutionRecordAuditEventInsert["request_id"] | null;
  idempotencyKey: ExecutionRecordAuditEventInsert["idempotency_key"] | null;
};

export type ExecutionRecordAuditWriterMockIntegrationMockSummary = {
  status: ExecutionRecordAuditServiceRoleAdapterMockStatus;
  ok: boolean;
  auditEventId?: ExecutionRecordAuditEventRow["id"];
  idempotencyKey?: ExecutionRecordAuditEventInsert["idempotency_key"];
  existingAuditEventId?: ExecutionRecordAuditEventRow["id"];
  warnings: string[];
  errors: string[];
};

export type ExecutionRecordAuditWriterMockIntegrationInput = {
  writerInput: unknown;
  allowMockAdapter: boolean;
  insertAuditEventMock?: ExecutionRecordAuditServiceRoleAdapterMockBehavior;
};

export type ExecutionRecordAuditWriterMockIntegrationValidationFailedResult =
  ExecutionRecordAuditWriterMockIntegrationSafety & {
    status: "validation_failed";
    ok: false;
    inserted: false;
    version: ExecutionRecordAuditWriterMockIntegrationHarnessVersion;
    validation: ExecutionRecordAuditWriterValidationResult;
    dryRun: ExecutionRecordAuditWriterMockIntegrationDryRunSummary;
    mockAdapterInvoked: false;
    warnings: string[];
    errors: string[];
  };

export type ExecutionRecordAuditWriterMockIntegrationBlockedResult =
  ExecutionRecordAuditWriterMockIntegrationSafety & {
    status: "blocked";
    ok: false;
    inserted: false;
    version: ExecutionRecordAuditWriterMockIntegrationHarnessVersion;
    reason:
      | "dry_run_blocked"
      | "mock_adapter_not_allowed"
      | "mock_adapter_missing";
    dryRun: ExecutionRecordAuditWriterMockIntegrationDryRunSummary;
    mockAdapterInvoked: false;
    warnings: string[];
    errors: string[];
  };

export type ExecutionRecordAuditWriterMockIntegrationMappedResult =
  ExecutionRecordAuditWriterMockIntegrationSafety & {
    status: ExecutionRecordAuditServiceRoleAdapterMockStatus;
    ok: boolean;
    inserted: false;
    version: ExecutionRecordAuditWriterMockIntegrationHarnessVersion;
    dryRun: ExecutionRecordAuditWriterMockIntegrationDryRunSummary;
    mockAdapterInvoked: true;
    mockResult: ExecutionRecordAuditWriterMockIntegrationMockSummary;
    warnings: string[];
    errors: string[];
  };

export type ExecutionRecordAuditWriterMockIntegrationResult =
  | ExecutionRecordAuditWriterMockIntegrationValidationFailedResult
  | ExecutionRecordAuditWriterMockIntegrationBlockedResult
  | ExecutionRecordAuditWriterMockIntegrationMappedResult;

function summarizeDryRun(
  dryRun: ReturnType<typeof buildExecutionRecordAuditWriterDryRun>,
): ExecutionRecordAuditWriterMockIntegrationDryRunSummary {
  if (dryRun.status !== "ready") {
    return {
      status: dryRun.status,
      executionRecordId: null,
      eventType: null,
      eventSource: null,
      sourceSystem: null,
      requestId: null,
      idempotencyKey: null,
    };
  }

  return {
    status: dryRun.status,
    executionRecordId: dryRun.wouldInsert.execution_record_id ?? null,
    eventType: dryRun.wouldInsert.event_type ?? null,
    eventSource: dryRun.wouldInsert.event_source ?? null,
    sourceSystem: dryRun.wouldInsert.source_system ?? null,
    requestId: dryRun.wouldInsert.request_id ?? null,
    idempotencyKey: dryRun.wouldInsert.idempotency_key ?? null,
  };
}

function summarizeMockResult(
  result: ExecutionRecordAuditServiceRoleAdapterMockResult,
): ExecutionRecordAuditWriterMockIntegrationMockSummary {
  if (result.status === "success") {
    return {
      status: result.status,
      ok: result.ok,
      auditEventId: result.row.id,
      idempotencyKey: result.idempotencyKey,
      warnings: result.warnings,
      errors: result.errors,
    };
  }

  if (result.status === "conflict_idempotent_duplicate") {
    return {
      status: result.status,
      ok: result.ok,
      idempotencyKey: result.idempotencyKey,
      existingAuditEventId: result.existingAuditEventId,
      warnings: result.warnings,
      errors: result.errors,
    };
  }

  return {
    status: result.status,
    ok: result.ok,
    warnings: result.warnings,
    errors: result.errors,
  };
}

export async function runExecutionRecordAuditWriterMockIntegration(
  input: ExecutionRecordAuditWriterMockIntegrationInput,
): Promise<ExecutionRecordAuditWriterMockIntegrationResult> {
  const dryRun = buildExecutionRecordAuditWriterDryRun(input.writerInput);
  const dryRunSummary = summarizeDryRun(dryRun);

  if (dryRun.status === "validation_failed") {
    return {
      status: "validation_failed",
      ok: false,
      inserted: false,
      version: EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_HARNESS_VERSION,
      validation: dryRun.validation,
      dryRun: dryRunSummary,
      mockAdapterInvoked: false,
      warnings: dryRun.warnings,
      errors: dryRun.errors,
      ...EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_SAFETY,
    };
  }

  if (dryRun.status === "blocked") {
    return {
      status: "blocked",
      ok: false,
      inserted: false,
      version: EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_HARNESS_VERSION,
      reason: "dry_run_blocked",
      dryRun: dryRunSummary,
      mockAdapterInvoked: false,
      warnings: dryRun.warnings,
      errors: dryRun.errors,
      ...EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_SAFETY,
    };
  }

  if (!input.allowMockAdapter) {
    return {
      status: "blocked",
      ok: false,
      inserted: false,
      version: EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_HARNESS_VERSION,
      reason: "mock_adapter_not_allowed",
      dryRun: dryRunSummary,
      mockAdapterInvoked: false,
      warnings: dryRun.warnings,
      errors: ["mock_adapter_not_allowed"],
      ...EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_SAFETY,
    };
  }

  if (!input.insertAuditEventMock) {
    return {
      status: "blocked",
      ok: false,
      inserted: false,
      version: EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_HARNESS_VERSION,
      reason: "mock_adapter_missing",
      dryRun: dryRunSummary,
      mockAdapterInvoked: false,
      warnings: dryRun.warnings,
      errors: ["mock_adapter_missing"],
      ...EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_SAFETY,
    };
  }

  const mockResult = await runExecutionRecordAuditServiceRoleAdapterMock({
    wouldInsert: dryRun.wouldInsert,
    insertAuditEventMock: input.insertAuditEventMock,
  });

  return {
    status: mockResult.status,
    ok: mockResult.ok,
    inserted: false,
    version: EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_HARNESS_VERSION,
    dryRun: dryRunSummary,
    mockAdapterInvoked: true,
    mockResult: summarizeMockResult(mockResult),
    warnings: [...dryRun.warnings, ...mockResult.warnings],
    errors: mockResult.errors,
    ...EXECUTION_RECORD_AUDIT_WRITER_MOCK_INTEGRATION_SAFETY,
  };
}
