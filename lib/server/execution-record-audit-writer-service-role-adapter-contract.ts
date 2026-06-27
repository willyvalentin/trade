import "server-only";

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_CONTRACT_VERSION =
  "execution_record_audit_service_role_adapter_dry_run_contract_v1" as const;

export type ExecutionRecordAuditServiceRoleAdapterDryRunContractVersion =
  typeof EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_STATUSES = [
  "ready",
  "blocked",
  "missing_service_role_env",
  "multiple_service_role_aliases",
  "unsafe_public_service_role_exposure",
  "unknown_error",
] as const;

export type ExecutionRecordAuditServiceRoleAdapterDryRunStatus =
  (typeof EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_STATUSES)[number];

export type ExecutionRecordAuditServiceRoleAdapterDryRunReason =
  | "all_readiness_checks_passed"
  | "adapter_not_implemented"
  | "service_role_client_creation_not_approved"
  | "service_role_env_missing"
  | "multiple_service_role_aliases_present"
  | "public_service_role_exposure_detected"
  | "unknown_adapter_readiness_error";

export type ExecutionRecordAuditServiceRoleAdapterDryRunInput = {
  checkedAliases: readonly string[];
  presentAliasCount: number;
  selectedAlias: string | null;
  publicExposureDetected: boolean;
  leakageDetected: boolean;
  readinessChecksCompleted: boolean;
};

export type ExecutionRecordAuditServiceRoleAdapterDryRunBaseResult = {
  status: ExecutionRecordAuditServiceRoleAdapterDryRunStatus;
  canCreateClient: boolean;
  wouldUseServiceRole: boolean;
  wouldWrite: false;
  wouldQuery: false;
  clientCreated: false;
  queryPerformed: false;
  writePerformed: false;
  secretsPrinted: false;
  reason: ExecutionRecordAuditServiceRoleAdapterDryRunReason;
  warnings: string[];
  checkedAliases: readonly string[];
  selectedAlias: string | null;
  version: ExecutionRecordAuditServiceRoleAdapterDryRunContractVersion;
};

export type ExecutionRecordAuditServiceRoleAdapterDryRunReadyResult =
  ExecutionRecordAuditServiceRoleAdapterDryRunBaseResult & {
    status: "ready";
    canCreateClient: true;
    wouldUseServiceRole: true;
    reason: "all_readiness_checks_passed";
  };

export type ExecutionRecordAuditServiceRoleAdapterDryRunBlockedResult =
  ExecutionRecordAuditServiceRoleAdapterDryRunBaseResult & {
    status: "blocked";
    canCreateClient: false;
    wouldUseServiceRole: false;
    reason:
      | "adapter_not_implemented"
      | "service_role_client_creation_not_approved";
  };

export type ExecutionRecordAuditServiceRoleAdapterDryRunMissingEnvResult =
  ExecutionRecordAuditServiceRoleAdapterDryRunBaseResult & {
    status: "missing_service_role_env";
    canCreateClient: false;
    wouldUseServiceRole: false;
    selectedAlias: null;
    reason: "service_role_env_missing";
  };

export type ExecutionRecordAuditServiceRoleAdapterDryRunMultipleAliasesResult =
  ExecutionRecordAuditServiceRoleAdapterDryRunBaseResult & {
    status: "multiple_service_role_aliases";
    canCreateClient: false;
    wouldUseServiceRole: false;
    selectedAlias: null;
    reason: "multiple_service_role_aliases_present";
  };

export type ExecutionRecordAuditServiceRoleAdapterDryRunUnsafeExposureResult =
  ExecutionRecordAuditServiceRoleAdapterDryRunBaseResult & {
    status: "unsafe_public_service_role_exposure";
    canCreateClient: false;
    wouldUseServiceRole: false;
    selectedAlias: null;
    reason: "public_service_role_exposure_detected";
  };

export type ExecutionRecordAuditServiceRoleAdapterDryRunUnknownErrorResult =
  ExecutionRecordAuditServiceRoleAdapterDryRunBaseResult & {
    status: "unknown_error";
    canCreateClient: false;
    wouldUseServiceRole: false;
    reason: "unknown_adapter_readiness_error";
  };

export type ExecutionRecordAuditServiceRoleAdapterDryRunResult =
  | ExecutionRecordAuditServiceRoleAdapterDryRunReadyResult
  | ExecutionRecordAuditServiceRoleAdapterDryRunBlockedResult
  | ExecutionRecordAuditServiceRoleAdapterDryRunMissingEnvResult
  | ExecutionRecordAuditServiceRoleAdapterDryRunMultipleAliasesResult
  | ExecutionRecordAuditServiceRoleAdapterDryRunUnsafeExposureResult
  | ExecutionRecordAuditServiceRoleAdapterDryRunUnknownErrorResult;

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_SAFETY_FLAGS = {
  wouldWrite: false,
  wouldQuery: false,
  clientCreated: false,
  queryPerformed: false,
  writePerformed: false,
  secretsPrinted: false,
} as const;
