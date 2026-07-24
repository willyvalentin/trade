import "server-only";

import {
  EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION,
  type ExecutionRecordAuditEventInsert,
  type ExecutionRecordAuditEventRow,
  type ExecutionRecordAuditWriterErrorDiagnostics,
  type ExecutionRecordAuditWriterBlockedResult,
  type ExecutionRecordAuditWriterConflictResult,
  type ExecutionRecordAuditWriterResult,
  type ExecutionRecordAuditWriterServiceUnavailableResult,
  type ExecutionRecordAuditWriterSuccessResult,
  type ExecutionRecordAuditWriterUnknownErrorResult,
  type ExecutionRecordAuditWriterValidationFailedResult,
  type ExecutionRecordAuditWriterValidationResult,
} from "@/lib/server/execution-record-audit-writer-contract";
import {
  validateExecutionRecordAuditWriterInput,
} from "@/lib/server/execution-record-audit-writer-validation";
import {
  buildExecutionRecordAuditWriterDryRun,
  type ExecutionRecordAuditWriterDryRunResult,
} from "@/lib/server/execution-record-audit-writer-dry-run";
import {
  insertExecutionRecordAuditEventWithServiceRole,
  type ExecutionRecordAuditServiceRoleAdapterLiveInput,
  type ExecutionRecordAuditServiceRoleAdapterLiveResult,
} from "@/lib/server/execution-record-audit-writer-service-role-adapter";

export const EXECUTION_RECORD_AUDIT_WRITER_IMPLEMENTATION_SKELETON_VERSION =
  "execution_record_audit_writer_implementation_skeleton_v1" as const;

export const EXECUTION_RECORD_AUDIT_WRITER_LIVE_EVENT_STATUS =
  "attempted" as const;

export type ExecutionRecordAuditWriterSkeletonDryRunMetadata = {
  contractVersion: typeof EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION;
  skeletonVersion:
    typeof EXECUTION_RECORD_AUDIT_WRITER_IMPLEMENTATION_SKELETON_VERSION;
  status: ExecutionRecordAuditWriterDryRunResult["status"];
  wouldWrite: false;
  wouldInsert: ExecutionRecordAuditEventInsert | null;
  executionRecordId: string | null;
  eventType: string | null;
  eventSource: string | null;
  sourceSystem: string | null;
  requestId: string | null;
  idempotencyKey: string | null;
  warnings: string[];
};

export type ExecutionRecordAuditWriterSkeletonBlockedResult =
  ExecutionRecordAuditWriterBlockedResult & {
    reason: "writer_not_implemented" | "authority_boundary_violation";
    wouldWrite: false;
    dryRun: ExecutionRecordAuditWriterSkeletonDryRunMetadata;
  };

export type ExecutionRecordAuditWriterSkeletonValidationFailedResult =
  ExecutionRecordAuditWriterValidationFailedResult & {
    wouldWrite: false;
    dryRun: ExecutionRecordAuditWriterSkeletonDryRunMetadata;
  };

export type ExecutionRecordAuditWriterIntegratedSuccessResult =
  ExecutionRecordAuditWriterSuccessResult & {
    dryRun: ExecutionRecordAuditWriterSkeletonDryRunMetadata;
    adapterStatus: ExecutionRecordAuditServiceRoleAdapterLiveResult["status"];
  };

export type ExecutionRecordAuditWriterIntegratedConflictResult =
  ExecutionRecordAuditWriterConflictResult & {
    dryRun: ExecutionRecordAuditWriterSkeletonDryRunMetadata;
    adapterStatus: "conflict_idempotent_duplicate";
  };

export type ExecutionRecordAuditWriterIntegratedServiceUnavailableResult =
  ExecutionRecordAuditWriterServiceUnavailableResult & {
    dryRun: ExecutionRecordAuditWriterSkeletonDryRunMetadata;
    adapterStatus: "service_unavailable";
  };

export type ExecutionRecordAuditWriterIntegratedUnknownErrorResult =
  ExecutionRecordAuditWriterUnknownErrorResult & {
    dryRun: ExecutionRecordAuditWriterSkeletonDryRunMetadata;
    adapterStatus: "permission_security_failure" | "unknown_error";
  };

export type ExecutionRecordAuditWriterIntegratedResult =
  | ExecutionRecordAuditWriterIntegratedSuccessResult
  | ExecutionRecordAuditWriterIntegratedConflictResult
  | ExecutionRecordAuditWriterIntegratedServiceUnavailableResult
  | ExecutionRecordAuditWriterIntegratedUnknownErrorResult;

export type ExecutionRecordAuditWriterResultWithDryRun =
  | ExecutionRecordAuditWriterSkeletonBlockedResult
  | ExecutionRecordAuditWriterSkeletonValidationFailedResult
  | ExecutionRecordAuditWriterIntegratedResult;

export type ExecutionRecordAuditWriterSkeletonResult =
  ExecutionRecordAuditWriterResultWithDryRun;

export type ExecutionRecordAuditWriterIntegrationOptions = {
  insertWithServiceRole?: (
    input: ExecutionRecordAuditServiceRoleAdapterLiveInput,
  ) => Promise<ExecutionRecordAuditServiceRoleAdapterLiveResult>;
};

function emptyDryRunMetadata(
  validation: ExecutionRecordAuditWriterValidationResult,
): ExecutionRecordAuditWriterSkeletonDryRunMetadata {
  return {
    contractVersion: EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION,
    skeletonVersion: EXECUTION_RECORD_AUDIT_WRITER_IMPLEMENTATION_SKELETON_VERSION,
    status: validation.valid ? "blocked" : "validation_failed",
    wouldWrite: false,
    wouldInsert: null,
    executionRecordId: null,
    eventType: null,
    eventSource: null,
    sourceSystem: null,
    requestId: null,
    idempotencyKey: null,
    warnings: validation.warnings,
  };
}

function dryRunMetadata(
  dryRun: ExecutionRecordAuditWriterDryRunResult,
): ExecutionRecordAuditWriterSkeletonDryRunMetadata {
  if (dryRun.status !== "ready") {
    return {
      contractVersion: EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION,
      skeletonVersion:
        EXECUTION_RECORD_AUDIT_WRITER_IMPLEMENTATION_SKELETON_VERSION,
      status: dryRun.status,
      wouldWrite: false,
      wouldInsert: null,
      executionRecordId: null,
      eventType: null,
      eventSource: null,
      sourceSystem: null,
      requestId: null,
      idempotencyKey: null,
      warnings: dryRun.warnings,
    };
  }

  return {
    contractVersion: EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION,
    skeletonVersion: EXECUTION_RECORD_AUDIT_WRITER_IMPLEMENTATION_SKELETON_VERSION,
    status: dryRun.status,
    wouldWrite: false,
    wouldInsert: dryRun.wouldInsert,
    executionRecordId: dryRun.wouldInsert.execution_record_id ?? null,
    eventType: dryRun.wouldInsert.event_type ?? null,
    eventSource: dryRun.wouldInsert.event_source ?? null,
    sourceSystem: dryRun.wouldInsert.source_system ?? null,
    requestId: dryRun.wouldInsert.request_id ?? null,
    idempotencyKey: dryRun.wouldInsert.idempotency_key ?? null,
    warnings: dryRun.warnings,
  };
}

function projectedInsertedRow(
  insert: ExecutionRecordAuditEventInsert,
  auditEventId: string,
): ExecutionRecordAuditEventRow {
  return {
    actor_id: insert.actor_id ?? null,
    actor_type: insert.actor_type ?? null,
    created_at: insert.created_at ?? "unconfirmed_without_select",
    duplicate_prevention_key: insert.duplicate_prevention_key ?? null,
    event_payload: insert.event_payload ?? {},
    event_source: insert.event_source,
    event_status: insert.event_status,
    event_type: insert.event_type,
    evidence_payload: insert.evidence_payload ?? {},
    execution_record_id: insert.execution_record_id,
    id: auditEventId,
    idempotency_key: insert.idempotency_key,
    metadata: insert.metadata ?? {},
    occurred_at: insert.occurred_at ?? null,
    request_id: insert.request_id ?? null,
    schema_version: insert.schema_version ?? "1",
    source_fingerprint: insert.source_fingerprint ?? null,
    source_system: insert.source_system,
    trace_id: insert.trace_id ?? null,
    writer_version: insert.writer_version ?? null,
  };
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function buildLiveInsertFromDryRun(
  insert: ExecutionRecordAuditEventInsert,
): ExecutionRecordAuditEventInsert {
  return {
    ...insert,
    event_status: EXECUTION_RECORD_AUDIT_WRITER_LIVE_EVENT_STATUS,
    metadata: {
      ...(isJsonObject(insert.metadata) ? insert.metadata : {}),
      dryRunEventStatus: insert.event_status,
      liveEventStatus: EXECUTION_RECORD_AUDIT_WRITER_LIVE_EVENT_STATUS,
      liveWrite: true,
    },
  };
}

function diagnosticsFromAdapterResult(
  adapterResult: ExecutionRecordAuditServiceRoleAdapterLiveResult,
): ExecutionRecordAuditWriterErrorDiagnostics | undefined {
  if (!adapterResult.diagnostics) {
    return undefined;
  }

  return {
    ...adapterResult.diagnostics,
    insertSummary: adapterResult.insertSummary,
  };
}

function mapAdapterResult(
  adapterResult: ExecutionRecordAuditServiceRoleAdapterLiveResult,
  dryRun: ExecutionRecordAuditWriterDryRunResult,
  liveInsert: ExecutionRecordAuditEventInsert,
): ExecutionRecordAuditWriterResult {
  if (dryRun.status !== "ready") {
    return {
      status: "blocked",
      ok: false,
      inserted: false,
      errors: dryRun.errors,
      warnings: dryRun.warnings,
      reason: "authority_boundary_violation",
    };
  }

  const insert = liveInsert;
  const diagnostics = diagnosticsFromAdapterResult(adapterResult);

  if (adapterResult.status === "success") {
    const auditEventId =
      adapterResult.auditEventId ?? insert.id ?? "unconfirmed_without_select";

    return {
      status: "success",
      ok: true,
      inserted: true,
      auditEventId,
      executionRecordId: insert.execution_record_id,
      idempotencyKey: insert.idempotency_key,
      row: projectedInsertedRow(insert, auditEventId),
      warnings: [
        ...dryRun.warnings,
        ...adapterResult.warnings,
        ...(adapterResult.auditEventId || insert.id
          ? []
          : ["audit_event_id_unconfirmed_without_select"]),
      ],
    };
  }

  if (adapterResult.status === "conflict_idempotent_duplicate") {
    return {
      status: "conflict_idempotent_duplicate",
      ok: false,
      inserted: false,
      idempotencyKey: insert.idempotency_key,
      existingAuditEventId: adapterResult.auditEventId,
      ...(diagnostics ? { diagnostics } : {}),
      warnings: [...dryRun.warnings, ...adapterResult.warnings],
    };
  }

  if (adapterResult.status === "service_unavailable") {
    return {
      status: "service_unavailable",
      ok: false,
      inserted: false,
      errors: adapterResult.errors,
      ...(diagnostics ? { diagnostics } : {}),
      warnings: [...dryRun.warnings, ...adapterResult.warnings],
    };
  }

  return {
    status: "unknown_error",
    ok: false,
    inserted: false,
    errors: adapterResult.errors.length
      ? adapterResult.errors
      : ["audit_writer_adapter_error"],
    ...(diagnostics ? { diagnostics } : {}),
    warnings: [...dryRun.warnings, ...adapterResult.warnings],
  };
}

function withDryRunMetadata(
  result: ExecutionRecordAuditWriterResult,
  dryRun: ExecutionRecordAuditWriterDryRunResult,
  adapterStatus?: ExecutionRecordAuditServiceRoleAdapterLiveResult["status"],
): ExecutionRecordAuditWriterResultWithDryRun {
  return {
    ...result,
    dryRun: dryRunMetadata(dryRun),
    ...(adapterStatus ? { adapterStatus } : {}),
  } as ExecutionRecordAuditWriterResultWithDryRun;
}

export async function appendExecutionRecordAuditEvent(
  input: unknown,
  options: ExecutionRecordAuditWriterIntegrationOptions = {},
): Promise<ExecutionRecordAuditWriterResultWithDryRun> {
  const validation = validateExecutionRecordAuditWriterInput(input);

  if (!validation.valid) {
    return {
      status: "validation_failed",
      ok: false,
      inserted: false,
      validation,
      wouldWrite: false,
      dryRun: emptyDryRunMetadata(validation),
    };
  }

  const dryRun = buildExecutionRecordAuditWriterDryRun(input);

  if (dryRun.status !== "ready") {
    return {
      status: "blocked",
      ok: false,
      inserted: false,
      errors: dryRun.errors,
      warnings: dryRun.warnings,
      reason: "authority_boundary_violation",
      wouldWrite: false,
      dryRun: dryRunMetadata(dryRun),
    };
  }

  const insertWithServiceRole =
    options.insertWithServiceRole ?? insertExecutionRecordAuditEventWithServiceRole;
  const liveInsert = buildLiveInsertFromDryRun(dryRun.wouldInsert);
  const adapterResult = await insertWithServiceRole({
    insert: liveInsert,
  });

  return withDryRunMetadata(
    mapAdapterResult(adapterResult, dryRun, liveInsert),
    dryRun,
    adapterResult.status,
  );
}
