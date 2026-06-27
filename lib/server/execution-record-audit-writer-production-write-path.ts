import "server-only";

import {
  appendExecutionRecordAuditEvent,
  type ExecutionRecordAuditWriterResultWithDryRun,
} from "@/lib/server/execution-record-audit-writer";
import {
  recordExecutionRecordAuditWriterRuntimeMonitoringEvent,
  type ExecutionRecordAuditWriterRuntimeMonitoringEvent,
  type ExecutionRecordAuditWriterRuntimeMonitoringSink,
} from "@/lib/server/execution-record-audit-writer-runtime-monitoring";
import type {
  ExecutionRecordAuditWriterErrorDiagnostics,
  ExecutionRecordAuditWriterInput,
} from "@/lib/server/execution-record-audit-writer-contract";

export const EXECUTION_RECORD_AUDIT_WRITER_PRODUCTION_WRITE_PATH_VERSION =
  "execution_record_audit_writer_production_write_path_v1" as const;

export type ExecutionRecordAuditWriterProductionWritePathPayloadSource =
  "validated_server_side_audit_payload";

export type ExecutionRecordAuditWriterProductionWritePathOperation =
  "insert_only_audit_append";

export type ExecutionRecordAuditWriterProductionWritePathInput = {
  productionWritePathApproved: true;
  liveSmokeInsertApproved: false;
  payloadSource: ExecutionRecordAuditWriterProductionWritePathPayloadSource;
  operation: ExecutionRecordAuditWriterProductionWritePathOperation;
  targetTable: "public.execution_record_audit_events";
  input: ExecutionRecordAuditWriterInput;
};

export type ExecutionRecordAuditWriterProductionWritePathSafety = {
  serverOnly: true;
  internalWriterBoundaryUsed: true;
  routeBoundaryBypassed: false;
  validatedServerSidePayloadRequired: true;
  productionWritePathApproved: true;
  liveSmokeInsertApproved: false;
  insertOnlyAuditAppend: true;
  browserClientInvocationAllowed: false;
  uiWiringAdded: false;
  marketLoopInvocationAllowed: false;
  brokerAvanzaAllowed: false;
  automaticModeAllowed: false;
  tradeStatsPnlMutationAllowed: false;
  updateDeleteUpsertSelectAllowed: false;
  downstreamMutationAllowed: false;
  serviceRoleExposed: false;
};

export type ExecutionRecordAuditWriterProductionWritePathResult =
  | {
      status: "completed";
      ok: boolean;
      writePathVersion:
        typeof EXECUTION_RECORD_AUDIT_WRITER_PRODUCTION_WRITE_PATH_VERSION;
      writerResult: ExecutionRecordAuditWriterResultWithDryRun;
      monitoring?: ExecutionRecordAuditWriterRuntimeMonitoringEvent;
      errors: [];
      diagnostics?: ExecutionRecordAuditWriterErrorDiagnostics;
      warnings: string[];
      safety: ExecutionRecordAuditWriterProductionWritePathSafety;
    }
  | {
      status: "blocked";
      ok: false;
      writePathVersion:
        typeof EXECUTION_RECORD_AUDIT_WRITER_PRODUCTION_WRITE_PATH_VERSION;
      writerResult: null;
      monitoring?: ExecutionRecordAuditWriterRuntimeMonitoringEvent;
      errors: string[];
      diagnostics?: null;
      warnings: string[];
      safety: ExecutionRecordAuditWriterProductionWritePathSafety;
    };

export type ExecutionRecordAuditWriterProductionWritePathOptions = {
  monitoringSink?: ExecutionRecordAuditWriterRuntimeMonitoringSink;
};

function safety(): ExecutionRecordAuditWriterProductionWritePathSafety {
  return {
    serverOnly: true,
    internalWriterBoundaryUsed: true,
    routeBoundaryBypassed: false,
    validatedServerSidePayloadRequired: true,
    productionWritePathApproved: true,
    liveSmokeInsertApproved: false,
    insertOnlyAuditAppend: true,
    browserClientInvocationAllowed: false,
    uiWiringAdded: false,
    marketLoopInvocationAllowed: false,
    brokerAvanzaAllowed: false,
    automaticModeAllowed: false,
    tradeStatsPnlMutationAllowed: false,
    updateDeleteUpsertSelectAllowed: false,
    downstreamMutationAllowed: false,
    serviceRoleExposed: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateWritePathInput(input: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return ["production_write_path_input_invalid"];
  }

  if (input.productionWritePathApproved !== true) {
    errors.push("production_write_path_approval_required");
  }

  if (input.liveSmokeInsertApproved !== false) {
    errors.push("live_smoke_insert_not_approved");
  }

  if (input.payloadSource !== "validated_server_side_audit_payload") {
    errors.push("validated_server_side_payload_required");
  }

  if (input.operation !== "insert_only_audit_append") {
    errors.push("insert_only_audit_append_required");
  }

  if (input.targetTable !== "public.execution_record_audit_events") {
    errors.push("audit_events_table_target_required");
  }

  if (!isRecord(input.input)) {
    errors.push("writer_input_required");
  }

  return errors;
}

function writerWarnings(
  writerResult: ExecutionRecordAuditWriterResultWithDryRun,
): string[] {
  if ("warnings" in writerResult) {
    return writerResult.warnings;
  }

  return writerResult.dryRun.warnings;
}

function writerDiagnostics(
  writerResult: ExecutionRecordAuditWriterResultWithDryRun,
): ExecutionRecordAuditWriterErrorDiagnostics | undefined {
  if ("diagnostics" in writerResult) {
    return writerResult.diagnostics;
  }

  return undefined;
}

export async function appendExecutionRecordAuditEventFromProductionWritePath(
  input: unknown,
  options: ExecutionRecordAuditWriterProductionWritePathOptions = {},
): Promise<ExecutionRecordAuditWriterProductionWritePathResult> {
  const errors = validateWritePathInput(input);

  if (errors.length > 0) {
    const monitoring = recordExecutionRecordAuditWriterRuntimeMonitoringEvent(
      {
        status: "blocked",
        writerResult: null,
      },
      options.monitoringSink,
    );

    return {
      status: "blocked",
      ok: false,
      writePathVersion:
        EXECUTION_RECORD_AUDIT_WRITER_PRODUCTION_WRITE_PATH_VERSION,
      writerResult: null,
      monitoring,
      errors,
      diagnostics: null,
      warnings: [],
      safety: safety(),
    };
  }

  const approvedInput =
    input as ExecutionRecordAuditWriterProductionWritePathInput;
  const writerResult = await appendExecutionRecordAuditEvent(approvedInput.input);
  const monitoring = recordExecutionRecordAuditWriterRuntimeMonitoringEvent(
    {
      status: "completed",
      writerResult,
    },
    options.monitoringSink,
  );

  return {
    status: "completed",
    ok: writerResult.ok,
    writePathVersion:
      EXECUTION_RECORD_AUDIT_WRITER_PRODUCTION_WRITE_PATH_VERSION,
    writerResult,
    monitoring,
    errors: [],
    ...(writerDiagnostics(writerResult)
      ? { diagnostics: writerDiagnostics(writerResult) }
      : {}),
    warnings: writerWarnings(writerResult),
    safety: safety(),
  };
}
