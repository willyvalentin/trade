import "server-only";

import type { Database, Json } from "@/lib/supabase-database.types";

// Server-only audit writer contract types. This module does not create a
// Supabase client, read environment variables, append audit rows, call routes,
// mutate trades, update stats/PnL, call broker/Avanza, or enable automatic mode.

export const EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION =
  "execution_record_audit_writer_server_only_contract_v1" as const;

export type ExecutionRecordAuditWriterContractVersion =
  typeof EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION;

export type ExecutionRecordAuditEventTable =
  Database["public"]["Tables"]["execution_record_audit_events"];

export type ExecutionRecordAuditEventRow = ExecutionRecordAuditEventTable["Row"];

export type ExecutionRecordAuditEventInsert =
  ExecutionRecordAuditEventTable["Insert"];

export type ExecutionRecordAuditEventUpdate =
  ExecutionRecordAuditEventTable["Update"];

export type ExecutionRecordTable =
  Database["public"]["Tables"]["execution_records"];

export type ExecutionRecordRow = ExecutionRecordTable["Row"];

export const EXECUTION_RECORD_AUDIT_WRITER_RESULT_STATUSES = [
  "success",
  "blocked",
  "validation_failed",
  "conflict_idempotent_duplicate",
  "service_unavailable",
  "unknown_error",
] as const;

export type ExecutionRecordAuditWriterResultStatus =
  (typeof EXECUTION_RECORD_AUDIT_WRITER_RESULT_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_WRITER_AUTHORITY_MODES = [
  "server_append_only",
  "dry_run",
  "blocked",
] as const;

export type ExecutionRecordAuditWriterAuthorityMode =
  (typeof EXECUTION_RECORD_AUDIT_WRITER_AUTHORITY_MODES)[number];

export type ExecutionRecordAuditWriterActor = {
  actorType: "system" | "operator" | "user" | "service" | "unknown";
  actorId?: string | null;
};

export type ExecutionRecordAuditWriterAuthorityBoundaries = {
  mayAppendAuditEvent: true;
  mayMutateTrades: false;
  mayUpdateStatsPnl: false;
  mayCallBroker: false;
  mayCallAvanza: false;
  mayApproveExecution: false;
  mayEnableAutomaticMode: false;
};

export const EXECUTION_RECORD_AUDIT_WRITER_AUTHORITY_BOUNDARIES = {
  mayAppendAuditEvent: true,
  mayMutateTrades: false,
  mayUpdateStatsPnl: false,
  mayCallBroker: false,
  mayCallAvanza: false,
  mayApproveExecution: false,
  mayEnableAutomaticMode: false,
} as const satisfies ExecutionRecordAuditWriterAuthorityBoundaries;

export type ExecutionRecordAuditWriterInput = {
  executionRecordId: ExecutionRecordRow["id"];
  eventType: ExecutionRecordAuditEventInsert["event_type"];
  source: {
    eventSource: ExecutionRecordAuditEventInsert["event_source"];
    sourceSystem: ExecutionRecordAuditEventInsert["source_system"];
    sourceFingerprint?: ExecutionRecordAuditEventInsert["source_fingerprint"];
    traceId?: ExecutionRecordAuditEventInsert["trace_id"];
    writerVersion?: ExecutionRecordAuditEventInsert["writer_version"];
  };
  requestId?: ExecutionRecordAuditEventInsert["request_id"];
  idempotencyKey: ExecutionRecordAuditEventInsert["idempotency_key"];
  duplicatePreventionKey?: ExecutionRecordAuditEventInsert["duplicate_prevention_key"];
  actor: ExecutionRecordAuditWriterActor;
  authorityMode: ExecutionRecordAuditWriterAuthorityMode;
  payload: Json;
  evidence: Json;
  provenance: Json;
  occurredAt?: ExecutionRecordAuditEventInsert["occurred_at"];
  schemaVersion?: ExecutionRecordAuditEventInsert["schema_version"];
  metadata?: Json;
};

export type ExecutionRecordAuditWriterValidationResult =
  | {
      valid: true;
      errors: [];
      warnings: string[];
    }
  | {
      valid: false;
      errors: string[];
      warnings: string[];
    };

export type ExecutionRecordAuditWriterErrorDiagnostics = {
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
  insertSummary?: {
    eventStatus: string | null;
    eventType: string | null;
    executionRecordId: string | null;
    sourceSystem: string | null;
    idempotencyKeyPresent: boolean;
    duplicatePreventionKeyPresent: boolean;
  };
};

export type ExecutionRecordAuditWriterSuccessResult = {
  status: "success";
  ok: true;
  inserted: true;
  auditEventId: ExecutionRecordAuditEventRow["id"];
  executionRecordId: ExecutionRecordAuditEventRow["execution_record_id"];
  idempotencyKey: ExecutionRecordAuditEventRow["idempotency_key"];
  row: ExecutionRecordAuditEventRow;
  warnings: string[];
};

export type ExecutionRecordAuditWriterBlockedResult = {
  status: "blocked";
  ok: false;
  inserted: false;
  errors: string[];
  warnings: string[];
  reason:
    | "writer_not_implemented"
    | "server_only_boundary_missing"
    | "service_role_unavailable"
    | "route_auth_missing"
    | "write_path_not_approved"
    | "authority_boundary_violation";
};

export type ExecutionRecordAuditWriterValidationFailedResult = {
  status: "validation_failed";
  ok: false;
  inserted: false;
  validation: ExecutionRecordAuditWriterValidationResult;
};

export type ExecutionRecordAuditWriterConflictResult = {
  status: "conflict_idempotent_duplicate";
  ok: false;
  inserted: false;
  idempotencyKey: ExecutionRecordAuditEventInsert["idempotency_key"];
  existingAuditEventId?: ExecutionRecordAuditEventRow["id"];
  diagnostics?: ExecutionRecordAuditWriterErrorDiagnostics;
  warnings: string[];
};

export type ExecutionRecordAuditWriterServiceUnavailableResult = {
  status: "service_unavailable";
  ok: false;
  inserted: false;
  errors: string[];
  diagnostics?: ExecutionRecordAuditWriterErrorDiagnostics;
  warnings: string[];
};

export type ExecutionRecordAuditWriterUnknownErrorResult = {
  status: "unknown_error";
  ok: false;
  inserted: false;
  errors: string[];
  diagnostics?: ExecutionRecordAuditWriterErrorDiagnostics;
  warnings: string[];
};

export type ExecutionRecordAuditWriterResult =
  | ExecutionRecordAuditWriterSuccessResult
  | ExecutionRecordAuditWriterBlockedResult
  | ExecutionRecordAuditWriterValidationFailedResult
  | ExecutionRecordAuditWriterConflictResult
  | ExecutionRecordAuditWriterServiceUnavailableResult
  | ExecutionRecordAuditWriterUnknownErrorResult;

export const EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_SAFETY_NOTES = [
  "contract_only_not_writer_implementation",
  "server_only_required",
  "service_role_must_not_be_exposed",
  "no_supabase_client_created",
  "no_env_values_read",
  "no_runtime_write_path",
  "no_audit_append_executed",
  "no_trade_mutation",
  "no_stats_pnl_update",
  "no_broker_or_avanza_call",
  "no_execution_approval",
  "automatic_mode_not_enabled",
] as const;

export type ExecutionRecordAuditWriterContractSafetyNote =
  (typeof EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_SAFETY_NOTES)[number];
