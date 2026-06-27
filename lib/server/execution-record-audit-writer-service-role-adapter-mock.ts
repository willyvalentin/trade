import "server-only";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditEventRow,
} from "@/lib/server/execution-record-audit-writer-contract";

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_VERSION =
  "execution_record_audit_service_role_adapter_mock_v1" as const;

export type ExecutionRecordAuditServiceRoleAdapterMockVersion =
  typeof EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_VERSION;

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_STATUSES = [
  "success",
  "conflict_idempotent_duplicate",
  "permission_security_failure",
  "service_unavailable",
  "unknown_error",
] as const;

export type ExecutionRecordAuditServiceRoleAdapterMockStatus =
  (typeof EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_STATUSES)[number];

export type ExecutionRecordAuditServiceRoleAdapterMockSafety = {
  realSupabaseCalled: false;
  serviceRoleUsed: false;
  writePerformed: false;
  remoteMutated: false;
};

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_SAFETY = {
  realSupabaseCalled: false,
  serviceRoleUsed: false,
  writePerformed: false,
  remoteMutated: false,
} as const satisfies ExecutionRecordAuditServiceRoleAdapterMockSafety;

export type ExecutionRecordAuditServiceRoleAdapterMockBaseResult =
  ExecutionRecordAuditServiceRoleAdapterMockSafety & {
    status: ExecutionRecordAuditServiceRoleAdapterMockStatus;
    ok: boolean;
    version: ExecutionRecordAuditServiceRoleAdapterMockVersion;
    warnings: string[];
    errors: string[];
  };

export type ExecutionRecordAuditServiceRoleAdapterMockSuccessResult =
  ExecutionRecordAuditServiceRoleAdapterMockBaseResult & {
    status: "success";
    ok: true;
    row: ExecutionRecordAuditEventRow;
    idempotencyKey: ExecutionRecordAuditEventInsert["idempotency_key"];
  };

export type ExecutionRecordAuditServiceRoleAdapterMockDuplicateResult =
  ExecutionRecordAuditServiceRoleAdapterMockBaseResult & {
    status: "conflict_idempotent_duplicate";
    ok: false;
    idempotencyKey: ExecutionRecordAuditEventInsert["idempotency_key"];
    existingAuditEventId?: ExecutionRecordAuditEventRow["id"];
  };

export type ExecutionRecordAuditServiceRoleAdapterMockPermissionResult =
  ExecutionRecordAuditServiceRoleAdapterMockBaseResult & {
    status: "permission_security_failure";
    ok: false;
  };

export type ExecutionRecordAuditServiceRoleAdapterMockServiceUnavailableResult =
  ExecutionRecordAuditServiceRoleAdapterMockBaseResult & {
    status: "service_unavailable";
    ok: false;
  };

export type ExecutionRecordAuditServiceRoleAdapterMockUnknownErrorResult =
  ExecutionRecordAuditServiceRoleAdapterMockBaseResult & {
    status: "unknown_error";
    ok: false;
  };

export type ExecutionRecordAuditServiceRoleAdapterMockResult =
  | ExecutionRecordAuditServiceRoleAdapterMockSuccessResult
  | ExecutionRecordAuditServiceRoleAdapterMockDuplicateResult
  | ExecutionRecordAuditServiceRoleAdapterMockPermissionResult
  | ExecutionRecordAuditServiceRoleAdapterMockServiceUnavailableResult
  | ExecutionRecordAuditServiceRoleAdapterMockUnknownErrorResult;

export type ExecutionRecordAuditServiceRoleAdapterMockBehavior =
  (wouldInsert: ExecutionRecordAuditEventInsert) =>
    | ExecutionRecordAuditServiceRoleAdapterMockResult
    | Promise<ExecutionRecordAuditServiceRoleAdapterMockResult>;

export type ExecutionRecordAuditServiceRoleAdapterMockInput = {
  wouldInsert: ExecutionRecordAuditEventInsert;
  insertAuditEventMock: ExecutionRecordAuditServiceRoleAdapterMockBehavior;
};

function withMockSafety<T extends ExecutionRecordAuditServiceRoleAdapterMockResult>(
  result: T,
): T {
  return {
    ...result,
    ...EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_SAFETY,
    version: EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_VERSION,
  };
}

export async function runExecutionRecordAuditServiceRoleAdapterMock(
  input: ExecutionRecordAuditServiceRoleAdapterMockInput,
): Promise<ExecutionRecordAuditServiceRoleAdapterMockResult> {
  try {
    return withMockSafety(await input.insertAuditEventMock(input.wouldInsert));
  } catch (error) {
    return withMockSafety({
      status: "unknown_error",
      ok: false,
      version: EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_VERSION,
      warnings: [],
      errors: [
        error instanceof Error && error.message
          ? "mock_behavior_error"
          : "unknown_mock_behavior_error",
      ],
      ...EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_MOCK_SAFETY,
    });
  }
}
