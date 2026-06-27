import "server-only";

import { getServerSupabaseClient } from "@/lib/supabase-server";
import type { Database } from "@/lib/supabase-database.types";
import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditEventRow,
} from "@/lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditServiceRoleAdapterDryRunInput,
  ExecutionRecordAuditServiceRoleAdapterDryRunResult,
} from "@/lib/server/execution-record-audit-writer-service-role-adapter-contract";
import {
  EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_CONTRACT_VERSION,
  EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_SAFETY_FLAGS,
} from "@/lib/server/execution-record-audit-writer-service-role-adapter-contract";

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_VERSION =
  "execution_record_audit_service_role_adapter_skeleton_v1" as const;

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_LIVE_VERSION =
  "execution_record_audit_service_role_adapter_live_v1" as const;

export type ExecutionRecordAuditServiceRoleAdapterVersion =
  typeof EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_VERSION;

export type ExecutionRecordAuditServiceRoleAdapterLiveVersion =
  typeof EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_LIVE_VERSION;

export type ExecutionRecordAuditServiceRoleEnvAlias =
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_SERVICE_ROLE"
  | "SUPABASE_SERVICE_ROLE_SECRET";

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ENV_ALIASES = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_SECRET",
] as const satisfies readonly ExecutionRecordAuditServiceRoleEnvAlias[];

export type ExecutionRecordAuditServiceRoleAdapterTable =
  Database["public"]["Tables"]["execution_record_audit_events"];

export type ExecutionRecordAuditServiceRoleAdapterLiveStatus =
  | "success"
  | "conflict_idempotent_duplicate"
  | "permission_security_failure"
  | "service_unavailable"
  | "unknown_error";

export type ExecutionRecordAuditServiceRoleAdapterInsertError = {
  code?: string | null;
  status?: number | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  name?: string | null;
};

export type ExecutionRecordAuditServiceRoleAdapterInsertResponse = {
  error: ExecutionRecordAuditServiceRoleAdapterInsertError | null;
};

export type ExecutionRecordAuditServiceRoleAdapterInsertBuilder = PromiseLike<ExecutionRecordAuditServiceRoleAdapterInsertResponse>;

export type ExecutionRecordAuditServiceRoleAdapterClient = {
  from: (
    table: "execution_record_audit_events",
  ) => {
    insert: (
      values: ExecutionRecordAuditEventInsert,
    ) => ExecutionRecordAuditServiceRoleAdapterInsertBuilder;
  };
};

export type ExecutionRecordAuditServiceRoleAdapterClientFactoryResult = {
  client: ExecutionRecordAuditServiceRoleAdapterClient | null;
  unavailable_reason: "supabase_missing_env" | "supabase_service_role_missing" | null;
};

export type ExecutionRecordAuditServiceRoleAdapterClientFactory =
  () => ExecutionRecordAuditServiceRoleAdapterClientFactoryResult;

export type ExecutionRecordAuditServiceRoleAdapterLiveInput = {
  insert: ExecutionRecordAuditEventInsert;
  getClient?: ExecutionRecordAuditServiceRoleAdapterClientFactory;
};

export type ExecutionRecordAuditServiceRoleAdapterInsertSummary = {
  eventStatus: string | null;
  eventType: string | null;
  executionRecordId: string | null;
  sourceSystem: string | null;
  idempotencyKeyPresent: boolean;
  duplicatePreventionKeyPresent: boolean;
};

export type ExecutionRecordAuditServiceRoleAdapterErrorDiagnostics = {
  category:
    | "duplicate"
    | "permission_security"
    | "service_unavailable"
    | "schema_constraint"
    | "unknown"
    | "unexpected_exception";
  code: string | null;
  status: number | null;
  message: string | null;
  details: string | null;
  hint: string | null;
  constraint: string | null;
};

export type ExecutionRecordAuditServiceRoleAdapterLiveBaseResult = {
  status: ExecutionRecordAuditServiceRoleAdapterLiveStatus;
  ok: boolean;
  version: ExecutionRecordAuditServiceRoleAdapterLiveVersion;
  targetTable: "public.execution_record_audit_events";
  operation: "insert";
  insertAttempted: boolean;
  inserted: boolean;
  serviceRoleUsed: boolean;
  queryPerformed: false;
  routeCalled: false;
  uiMutated: false;
  downstreamMutated: false;
  externalOrderCalled: false;
  externalBrowserCalled: false;
  automationEnabled: false;
  idempotencyKey: ExecutionRecordAuditEventInsert["idempotency_key"];
  insertSummary: ExecutionRecordAuditServiceRoleAdapterInsertSummary;
  auditEventId?: ExecutionRecordAuditEventRow["id"];
  errorCode?: string;
  diagnostics?: ExecutionRecordAuditServiceRoleAdapterErrorDiagnostics;
  warnings: string[];
  errors: string[];
};

export type ExecutionRecordAuditServiceRoleAdapterLiveSuccessResult =
  ExecutionRecordAuditServiceRoleAdapterLiveBaseResult & {
    status: "success";
    ok: true;
  };

export type ExecutionRecordAuditServiceRoleAdapterLiveDuplicateResult =
  ExecutionRecordAuditServiceRoleAdapterLiveBaseResult & {
    status: "conflict_idempotent_duplicate";
    ok: false;
  };

export type ExecutionRecordAuditServiceRoleAdapterLivePermissionResult =
  ExecutionRecordAuditServiceRoleAdapterLiveBaseResult & {
    status: "permission_security_failure";
    ok: false;
  };

export type ExecutionRecordAuditServiceRoleAdapterLiveUnavailableResult =
  ExecutionRecordAuditServiceRoleAdapterLiveBaseResult & {
    status: "service_unavailable";
    ok: false;
  };

export type ExecutionRecordAuditServiceRoleAdapterLiveUnknownErrorResult =
  ExecutionRecordAuditServiceRoleAdapterLiveBaseResult & {
    status: "unknown_error";
    ok: false;
  };

export type ExecutionRecordAuditServiceRoleAdapterLiveResult =
  | ExecutionRecordAuditServiceRoleAdapterLiveSuccessResult
  | ExecutionRecordAuditServiceRoleAdapterLiveDuplicateResult
  | ExecutionRecordAuditServiceRoleAdapterLivePermissionResult
  | ExecutionRecordAuditServiceRoleAdapterLiveUnavailableResult
  | ExecutionRecordAuditServiceRoleAdapterLiveUnknownErrorResult;

export type ExecutionRecordAuditServiceRoleAdapterStatus =
  | "skeleton_blocked"
  | "unavailable";

export type ExecutionRecordAuditServiceRoleAdapterReadiness = {
  status: ExecutionRecordAuditServiceRoleAdapterStatus;
  ok: false;
  version: ExecutionRecordAuditServiceRoleAdapterVersion;
  serverOnly: true;
  typedDatabaseBoundary: true;
  acceptedEnvAliases: readonly ExecutionRecordAuditServiceRoleEnvAlias[];
  clientCreated: false;
  queryPerformed: false;
  writePerformed: false;
  serviceRoleValuePrinted: false;
  reason:
    | "adapter_skeleton_not_enabled"
    | "service_role_client_creation_not_approved";
};

export function createExecutionRecordAuditServiceRoleClientAdapter():
  ExecutionRecordAuditServiceRoleAdapterReadiness {
  return {
    status: "skeleton_blocked",
    ok: false,
    version: EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_VERSION,
    serverOnly: true,
    typedDatabaseBoundary: true,
    acceptedEnvAliases: EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ENV_ALIASES,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    serviceRoleValuePrinted: false,
    reason: "adapter_skeleton_not_enabled",
  };
}

function defaultExecutionRecordAuditServiceRoleAdapterClientFactory():
  ExecutionRecordAuditServiceRoleAdapterClientFactoryResult {
  const { client, unavailable_reason } = getServerSupabaseClient();

  return {
    client: client as ExecutionRecordAuditServiceRoleAdapterClient | null,
    unavailable_reason,
  };
}

function baseLiveResult(
  input: ExecutionRecordAuditEventInsert,
): Omit<
  ExecutionRecordAuditServiceRoleAdapterLiveBaseResult,
  "ok" | "status"
> {
  return {
    version: EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_LIVE_VERSION,
    targetTable: "public.execution_record_audit_events",
    operation: "insert",
    insertAttempted: false,
    inserted: false,
    serviceRoleUsed: false,
    queryPerformed: false,
    routeCalled: false,
    uiMutated: false,
    downstreamMutated: false,
    externalOrderCalled: false,
    externalBrowserCalled: false,
    automationEnabled: false,
    idempotencyKey: input.idempotency_key,
    insertSummary: summarizeInsert(input),
    auditEventId: input.id,
    warnings: [],
    errors: [],
  };
}

function summarizeInsert(
  input: ExecutionRecordAuditEventInsert,
): ExecutionRecordAuditServiceRoleAdapterInsertSummary {
  return {
    eventStatus: input.event_status ?? null,
    eventType: input.event_type ?? null,
    executionRecordId: input.execution_record_id ?? null,
    sourceSystem: input.source_system ?? null,
    idempotencyKeyPresent:
      typeof input.idempotency_key === "string" &&
      input.idempotency_key.length > 0,
    duplicatePreventionKeyPresent:
      typeof input.duplicate_prevention_key === "string" &&
      input.duplicate_prevention_key.length > 0,
  };
}

function sanitizeDiagnosticString(value: unknown): string | null {
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
    .slice(0, 500);
}

function extractConstraintName(...values: unknown[]): string | null {
  for (const value of values) {
    const sanitized = sanitizeDiagnosticString(value);

    if (!sanitized) {
      continue;
    }

    const match =
      sanitized.match(/constraint "([^"]+)"/i) ??
      sanitized.match(/violates check constraint ([A-Za-z0-9_]+)/i) ??
      sanitized.match(/violates foreign key constraint ([A-Za-z0-9_]+)/i) ??
      sanitized.match(/violates unique constraint ([A-Za-z0-9_]+)/i);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function errorStatus(
  error: ExecutionRecordAuditServiceRoleAdapterInsertError | null,
): number | null {
  if (typeof error?.status === "number" && Number.isFinite(error.status)) {
    return error.status;
  }

  return null;
}

function diagnosticsFromError(
  error: ExecutionRecordAuditServiceRoleAdapterInsertError | null,
  category: ExecutionRecordAuditServiceRoleAdapterErrorDiagnostics["category"],
): ExecutionRecordAuditServiceRoleAdapterErrorDiagnostics {
  return {
    category,
    code: normalizeErrorCode(error),
    status: errorStatus(error),
    message: sanitizeDiagnosticString(error?.message),
    details: sanitizeDiagnosticString(error?.details),
    hint: sanitizeDiagnosticString(error?.hint),
    constraint: extractConstraintName(error?.message, error?.details, error?.hint),
  };
}

function diagnosticsFromThrown(
  error: unknown,
): ExecutionRecordAuditServiceRoleAdapterErrorDiagnostics {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    return {
      category: "unexpected_exception",
      code: sanitizeDiagnosticString(record.code) ?? null,
      status:
        typeof record.status === "number" && Number.isFinite(record.status)
          ? record.status
          : null,
      message: sanitizeDiagnosticString(record.message),
      details: sanitizeDiagnosticString(record.details),
      hint: sanitizeDiagnosticString(record.hint),
      constraint: extractConstraintName(
        record.message,
        record.details,
        record.hint,
      ),
    };
  }

  return {
    category: "unexpected_exception",
    code: null,
    status: null,
    message: sanitizeDiagnosticString(error),
    details: null,
    hint: null,
    constraint: null,
  };
}

type ExecutionRecordAuditServiceRoleAdapterUnavailableReason =
  | NonNullable<
      ExecutionRecordAuditServiceRoleAdapterClientFactoryResult["unavailable_reason"]
    >
  | "service_role_client_unavailable";

function diagnosticsFromUnavailableReason(
  unavailableReason: ExecutionRecordAuditServiceRoleAdapterUnavailableReason,
): ExecutionRecordAuditServiceRoleAdapterErrorDiagnostics {
  return {
    category: "service_unavailable",
    code: unavailableReason,
    status: null,
    message: unavailableReason,
    details: null,
    hint: null,
    constraint: null,
  };
}

function normalizeErrorCode(
  error: ExecutionRecordAuditServiceRoleAdapterInsertError | null,
): string | null {
  if (!error) {
    return null;
  }

  if (typeof error.code === "string" && error.code.trim().length > 0) {
    return error.code.trim();
  }

  if (typeof error.status === "number" && Number.isFinite(error.status)) {
    return String(error.status);
  }

  return null;
}

function isDuplicateError(errorCode: string | null): boolean {
  return errorCode === "23505" || errorCode === "409";
}

function isPermissionError(errorCode: string | null): boolean {
  return errorCode === "42501" || errorCode === "401" || errorCode === "403";
}

function isServiceUnavailableError(errorCode: string | null): boolean {
  return (
    errorCode === "503" ||
    errorCode === "504" ||
    errorCode === "PGRST000" ||
    errorCode === "PGRST301"
  );
}

function isSchemaConstraintError(errorCode: string | null): boolean {
  return errorCode === "23514" || errorCode === "23503" || errorCode === "23502";
}

export async function insertExecutionRecordAuditEventWithServiceRole(
  input: ExecutionRecordAuditServiceRoleAdapterLiveInput,
): Promise<ExecutionRecordAuditServiceRoleAdapterLiveResult> {
  const base = baseLiveResult(input.insert);
  const getClient =
    input.getClient ?? defaultExecutionRecordAuditServiceRoleAdapterClientFactory;

  try {
    const { client, unavailable_reason } = getClient();

    if (!client) {
      const reason = unavailable_reason ?? "service_role_client_unavailable";

      return {
        ...base,
        status: "service_unavailable",
        ok: false,
        diagnostics: diagnosticsFromUnavailableReason(reason),
        errors: [reason],
      };
    }

    const response = await client
      .from("execution_record_audit_events")
      .insert(input.insert);
    const errorCode = normalizeErrorCode(response.error);

    if (!response.error) {
      return {
        ...base,
        status: "success",
        ok: true,
        insertAttempted: true,
        inserted: true,
        serviceRoleUsed: true,
      };
    }

    if (isDuplicateError(errorCode)) {
      return {
        ...base,
        status: "conflict_idempotent_duplicate",
        ok: false,
        insertAttempted: true,
        serviceRoleUsed: true,
        errorCode: errorCode ?? undefined,
        diagnostics: diagnosticsFromError(response.error, "duplicate"),
        warnings: ["idempotent_duplicate_or_unique_conflict"],
      };
    }

    if (isPermissionError(errorCode)) {
      return {
        ...base,
        status: "permission_security_failure",
        ok: false,
        insertAttempted: true,
        serviceRoleUsed: true,
        errorCode: errorCode ?? undefined,
        diagnostics: diagnosticsFromError(response.error, "permission_security"),
        errors: ["permission_or_security_failure"],
      };
    }

    if (isServiceUnavailableError(errorCode)) {
      return {
        ...base,
        status: "service_unavailable",
        ok: false,
        insertAttempted: true,
        serviceRoleUsed: true,
        errorCode: errorCode ?? undefined,
        diagnostics: diagnosticsFromError(response.error, "service_unavailable"),
        errors: ["supabase_service_unavailable"],
      };
    }

    if (isSchemaConstraintError(errorCode)) {
      return {
        ...base,
        status: "unknown_error",
        ok: false,
        insertAttempted: true,
        serviceRoleUsed: true,
        errorCode: errorCode ?? undefined,
        diagnostics: diagnosticsFromError(response.error, "schema_constraint"),
        errors: ["schema_or_constraint_mismatch"],
      };
    }

    return {
      ...base,
      status: "unknown_error",
      ok: false,
      insertAttempted: true,
      serviceRoleUsed: true,
      errorCode: errorCode ?? undefined,
      diagnostics: diagnosticsFromError(response.error, "unknown"),
      errors: ["supabase_insert_error"],
    };
  } catch (error) {
    return {
      ...base,
      status: "unknown_error",
      ok: false,
      diagnostics: diagnosticsFromThrown(error),
      errors: ["live_adapter_unexpected_error"],
    };
  }
}

function normalizeDryRunInput(
  input: unknown,
): ExecutionRecordAuditServiceRoleAdapterDryRunInput | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const candidate = input as Partial<ExecutionRecordAuditServiceRoleAdapterDryRunInput>;

  if (
    !Array.isArray(candidate.checkedAliases) ||
    typeof candidate.presentAliasCount !== "number" ||
    !Number.isInteger(candidate.presentAliasCount) ||
    candidate.presentAliasCount < 0 ||
    !(
      typeof candidate.selectedAlias === "string" ||
      candidate.selectedAlias === null
    ) ||
    typeof candidate.publicExposureDetected !== "boolean" ||
    typeof candidate.leakageDetected !== "boolean" ||
    typeof candidate.readinessChecksCompleted !== "boolean"
  ) {
    return null;
  }

  if (
    !candidate.checkedAliases.every((alias) => typeof alias === "string")
  ) {
    return null;
  }

  return {
    checkedAliases: candidate.checkedAliases,
    presentAliasCount: candidate.presentAliasCount,
    selectedAlias: candidate.selectedAlias,
    publicExposureDetected: candidate.publicExposureDetected,
    leakageDetected: candidate.leakageDetected,
    readinessChecksCompleted: candidate.readinessChecksCompleted,
  };
}

function baseDryRunResult(
  input: ExecutionRecordAuditServiceRoleAdapterDryRunInput | null,
) {
  return {
    ...EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_SAFETY_FLAGS,
    checkedAliases: input?.checkedAliases ?? [],
    selectedAlias: input?.selectedAlias ?? null,
    warnings: [] as string[],
    version: EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_CONTRACT_VERSION,
  };
}

export function buildExecutionRecordAuditServiceRoleAdapterDryRun(
  input: unknown,
): ExecutionRecordAuditServiceRoleAdapterDryRunResult {
  const summary = normalizeDryRunInput(input);
  const base = baseDryRunResult(summary);

  if (!summary) {
    return {
      ...base,
      status: "blocked",
      canCreateClient: false,
      wouldUseServiceRole: false,
      reason: "service_role_client_creation_not_approved",
      warnings: ["invalid_readiness_summary"],
    };
  }

  if (!summary.readinessChecksCompleted) {
    return {
      ...base,
      status: "unknown_error",
      canCreateClient: false,
      wouldUseServiceRole: false,
      reason: "unknown_adapter_readiness_error",
      warnings: ["readiness_checks_incomplete"],
    };
  }

  if (summary.publicExposureDetected || summary.leakageDetected) {
    return {
      ...base,
      status: "unsafe_public_service_role_exposure",
      canCreateClient: false,
      wouldUseServiceRole: false,
      selectedAlias: null,
      reason: "public_service_role_exposure_detected",
      warnings: summary.publicExposureDetected
        ? ["public_exposure_detected"]
        : ["service_role_leakage_detected"],
    };
  }

  if (summary.presentAliasCount === 0) {
    return {
      ...base,
      status: "missing_service_role_env",
      canCreateClient: false,
      wouldUseServiceRole: false,
      selectedAlias: null,
      reason: "service_role_env_missing",
      warnings: ["service_role_env_absent"],
    };
  }

  if (summary.presentAliasCount > 1) {
    return {
      ...base,
      status: "multiple_service_role_aliases",
      canCreateClient: false,
      wouldUseServiceRole: false,
      selectedAlias: null,
      reason: "multiple_service_role_aliases_present",
      warnings: ["multiple_service_role_aliases_present"],
    };
  }

  if (!summary.selectedAlias) {
    return {
      ...base,
      status: "blocked",
      canCreateClient: false,
      wouldUseServiceRole: false,
      reason: "service_role_client_creation_not_approved",
      warnings: ["selected_alias_missing"],
    };
  }

  return {
    ...base,
    status: "ready",
    canCreateClient: true,
    wouldUseServiceRole: true,
    reason: "all_readiness_checks_passed",
  };
}
