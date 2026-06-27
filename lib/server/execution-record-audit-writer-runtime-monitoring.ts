import "server-only";

import type {
  ExecutionRecordAuditWriterErrorDiagnostics,
  ExecutionRecordAuditWriterResultStatus,
} from "@/lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditWriterResultWithDryRun,
} from "@/lib/server/execution-record-audit-writer";

export const EXECUTION_RECORD_AUDIT_WRITER_RUNTIME_MONITORING_VERSION =
  "execution_record_audit_writer_runtime_monitoring_v1" as const;

export type ExecutionRecordAuditWriterRuntimeMonitoringStatusCategory =
  | "blocked"
  | "success"
  | "failure";

export type ExecutionRecordAuditWriterRuntimeMonitoringAdapterStatus =
  | "success"
  | "conflict_idempotent_duplicate"
  | "permission_security_failure"
  | "service_unavailable"
  | "unknown_error"
  | null;

export type ExecutionRecordAuditWriterRuntimeMonitoringDiagnostics = {
  category: ExecutionRecordAuditWriterErrorDiagnostics["category"] | null;
  code: string | null;
  message: string | null;
};

export type ExecutionRecordAuditWriterRuntimeMonitoringServiceRoleAvailability = {
  checked: boolean;
  available: boolean | null;
  unavailable: boolean;
};

export type ExecutionRecordAuditWriterRuntimeMonitoringEvent = {
  version: typeof EXECUTION_RECORD_AUDIT_WRITER_RUNTIME_MONITORING_VERSION;
  path: "audit_writer_runtime_persistence";
  targetTable: "public.execution_record_audit_events";
  operation: "insert_only_audit_append";
  statusCategory: ExecutionRecordAuditWriterRuntimeMonitoringStatusCategory;
  writerStatus: ExecutionRecordAuditWriterResultStatus | "not_called";
  adapterStatus: ExecutionRecordAuditWriterRuntimeMonitoringAdapterStatus;
  inserted: boolean;
  noRetry: true;
  diagnostics: ExecutionRecordAuditWriterRuntimeMonitoringDiagnostics;
  serviceRoleAvailability:
    ExecutionRecordAuditWriterRuntimeMonitoringServiceRoleAvailability;
  counters: ExecutionRecordAuditWriterRuntimeMonitoringCounters;
  safety: ExecutionRecordAuditWriterRuntimeMonitoringSafety;
};

export type ExecutionRecordAuditWriterRuntimeMonitoringCounters = {
  total: number;
  success: number;
  failure: number;
  blocked: number;
  insertedTrue: number;
  insertedFalse: number;
};

export type ExecutionRecordAuditWriterRuntimeMonitoringSafety = {
  serverOnly: true;
  safeStatusCategoriesOnly: true;
  diagnosticsSanitized: true;
  serviceRoleValuesCaptured: false;
  serviceRoleAvailabilityBooleansOnly: true;
  databaseWritesAllowed: false;
  supabaseQueryAllowed: false;
  updateDeleteUpsertSelectAllowed: false;
  uiBrowserInvocationAllowed: false;
  appShellImportAllowed: false;
  marketScannerAutomationInvocationAllowed: false;
  brokerAvanzaAllowed: false;
  automaticModeAllowed: false;
  tradeStatsPnlMutationAllowed: false;
  downstreamMutationAllowed: false;
  retryLoopAllowed: false;
};

export type ExecutionRecordAuditWriterRuntimeMonitoringSink = (
  event: ExecutionRecordAuditWriterRuntimeMonitoringEvent,
) => void;

export type ExecutionRecordAuditWriterRuntimeMonitoringInput =
  | {
      status: "blocked";
      writerResult: null;
    }
  | {
      status: "completed";
      writerResult: ExecutionRecordAuditWriterResultWithDryRun;
    };

const SAFETY: ExecutionRecordAuditWriterRuntimeMonitoringSafety = {
  serverOnly: true,
  safeStatusCategoriesOnly: true,
  diagnosticsSanitized: true,
  serviceRoleValuesCaptured: false,
  serviceRoleAvailabilityBooleansOnly: true,
  databaseWritesAllowed: false,
  supabaseQueryAllowed: false,
  updateDeleteUpsertSelectAllowed: false,
  uiBrowserInvocationAllowed: false,
  appShellImportAllowed: false,
  marketScannerAutomationInvocationAllowed: false,
  brokerAvanzaAllowed: false,
  automaticModeAllowed: false,
  tradeStatsPnlMutationAllowed: false,
  downstreamMutationAllowed: false,
  retryLoopAllowed: false,
};

const counters: ExecutionRecordAuditWriterRuntimeMonitoringCounters = {
  total: 0,
  success: 0,
  failure: 0,
  blocked: 0,
  insertedTrue: 0,
  insertedFalse: 0,
};

function cloneCounters(): ExecutionRecordAuditWriterRuntimeMonitoringCounters {
  return { ...counters };
}

function sanitizeDiagnosticText(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted_jwt]")
    .replace(/service[_-]?role[=:]\s*['"]?[^'"\s]+/gi, "service_role=[redacted]")
    .replace(/supabase[_-]?service[_-]?role[_-]?key[=:]\s*['"]?[^'"\s]+/gi, "supabase_service_role_key=[redacted]")
    .slice(0, 240);
}

function diagnosticsFromWriterResult(
  writerResult: ExecutionRecordAuditWriterResultWithDryRun | null,
): ExecutionRecordAuditWriterRuntimeMonitoringDiagnostics {
  const diagnostics =
    writerResult && "diagnostics" in writerResult
      ? writerResult.diagnostics
      : undefined;

  return {
    category: diagnostics?.category ?? null,
    code: sanitizeDiagnosticText(diagnostics?.code) ?? null,
    message: sanitizeDiagnosticText(diagnostics?.message) ?? null,
  };
}

function adapterStatusFromWriterResult(
  writerResult: ExecutionRecordAuditWriterResultWithDryRun | null,
): ExecutionRecordAuditWriterRuntimeMonitoringAdapterStatus {
  if (!writerResult || !("adapterStatus" in writerResult)) {
    return null;
  }

  return writerResult.adapterStatus;
}

function statusCategory(
  input: ExecutionRecordAuditWriterRuntimeMonitoringInput,
): ExecutionRecordAuditWriterRuntimeMonitoringStatusCategory {
  if (input.status === "blocked") {
    return "blocked";
  }

  return input.writerResult.ok ? "success" : "failure";
}

function serviceRoleAvailability(
  adapterStatus: ExecutionRecordAuditWriterRuntimeMonitoringAdapterStatus,
): ExecutionRecordAuditWriterRuntimeMonitoringServiceRoleAvailability {
  if (!adapterStatus) {
    return {
      checked: false,
      available: null,
      unavailable: false,
    };
  }

  return {
    checked: true,
    available: adapterStatus !== "service_unavailable",
    unavailable: adapterStatus === "service_unavailable",
  };
}

function updateCounters(
  category: ExecutionRecordAuditWriterRuntimeMonitoringStatusCategory,
  inserted: boolean,
) {
  counters.total += 1;
  counters[category] += 1;

  if (inserted) {
    counters.insertedTrue += 1;
  } else {
    counters.insertedFalse += 1;
  }
}

export function resetExecutionRecordAuditWriterRuntimeMonitoringCounters() {
  counters.total = 0;
  counters.success = 0;
  counters.failure = 0;
  counters.blocked = 0;
  counters.insertedTrue = 0;
  counters.insertedFalse = 0;
}

export function getExecutionRecordAuditWriterRuntimeMonitoringCounters() {
  return cloneCounters();
}

export function recordExecutionRecordAuditWriterRuntimeMonitoringEvent(
  input: ExecutionRecordAuditWriterRuntimeMonitoringInput,
  sink?: ExecutionRecordAuditWriterRuntimeMonitoringSink,
): ExecutionRecordAuditWriterRuntimeMonitoringEvent {
  const category = statusCategory(input);
  const writerResult =
    input.status === "completed" ? input.writerResult : null;
  const adapterStatus = adapterStatusFromWriterResult(writerResult);
  const inserted = writerResult?.inserted === true;

  updateCounters(category, inserted);

  const event: ExecutionRecordAuditWriterRuntimeMonitoringEvent = {
    version: EXECUTION_RECORD_AUDIT_WRITER_RUNTIME_MONITORING_VERSION,
    path: "audit_writer_runtime_persistence",
    targetTable: "public.execution_record_audit_events",
    operation: "insert_only_audit_append",
    statusCategory: category,
    writerStatus: writerResult?.status ?? "not_called",
    adapterStatus,
    inserted,
    noRetry: true,
    diagnostics: diagnosticsFromWriterResult(writerResult),
    serviceRoleAvailability: serviceRoleAvailability(adapterStatus),
    counters: cloneCounters(),
    safety: SAFETY,
  };

  sink?.(event);

  return event;
}
