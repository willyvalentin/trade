import "server-only";

import {
  buildExecutionRecordAuditServiceRoleAdapterDryRun,
} from "@/lib/server/execution-record-audit-writer-service-role-adapter";
import type {
  ExecutionRecordAuditServiceRoleAdapterDryRunInput,
  ExecutionRecordAuditServiceRoleAdapterDryRunResult,
} from "@/lib/server/execution-record-audit-writer-service-role-adapter-contract";
import {
  EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_STATUSES,
} from "@/lib/server/execution-record-audit-writer-service-role-adapter-contract";

export const EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_FIXTURE_STATUSES =
  EXECUTION_RECORD_AUDIT_SERVICE_ROLE_ADAPTER_DRY_RUN_STATUSES;

export const executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries = {
  ready: {
    checkedAliases: ["accepted-service-role-alias"],
    presentAliasCount: 1,
    selectedAlias: "accepted-service-role-alias",
    publicExposureDetected: false,
    leakageDetected: false,
    readinessChecksCompleted: true,
  },
  missing: {
    checkedAliases: ["accepted-service-role-alias"],
    presentAliasCount: 0,
    selectedAlias: null,
    publicExposureDetected: false,
    leakageDetected: false,
    readinessChecksCompleted: true,
  },
  multiple: {
    checkedAliases: [
      "accepted-service-role-alias-one",
      "accepted-service-role-alias-two",
    ],
    presentAliasCount: 2,
    selectedAlias: null,
    publicExposureDetected: false,
    leakageDetected: false,
    readinessChecksCompleted: true,
  },
  unsafePublicExposure: {
    checkedAliases: ["accepted-service-role-alias"],
    presentAliasCount: 1,
    selectedAlias: "accepted-service-role-alias",
    publicExposureDetected: true,
    leakageDetected: false,
    readinessChecksCompleted: true,
  },
  leakageDetected: {
    checkedAliases: ["accepted-service-role-alias"],
    presentAliasCount: 1,
    selectedAlias: "accepted-service-role-alias",
    publicExposureDetected: false,
    leakageDetected: true,
    readinessChecksCompleted: true,
  },
  incomplete: {
    checkedAliases: ["accepted-service-role-alias"],
    presentAliasCount: 1,
    selectedAlias: "accepted-service-role-alias",
    publicExposureDetected: false,
    leakageDetected: false,
    readinessChecksCompleted: false,
  },
} as const satisfies Record<
  string,
  ExecutionRecordAuditServiceRoleAdapterDryRunInput
>;

export const executionRecordAuditServiceRoleAdapterDryRunFixtureResults = {
  ready: buildExecutionRecordAuditServiceRoleAdapterDryRun(
    executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries.ready,
  ),
  missing: buildExecutionRecordAuditServiceRoleAdapterDryRun(
    executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries.missing,
  ),
  multiple: buildExecutionRecordAuditServiceRoleAdapterDryRun(
    executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries.multiple,
  ),
  unsafePublicExposure: buildExecutionRecordAuditServiceRoleAdapterDryRun(
    executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries
      .unsafePublicExposure,
  ),
  leakageDetected: buildExecutionRecordAuditServiceRoleAdapterDryRun(
    executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries.leakageDetected,
  ),
  incomplete: buildExecutionRecordAuditServiceRoleAdapterDryRun(
    executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries.incomplete,
  ),
} as const satisfies Record<
  keyof typeof executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries,
  ExecutionRecordAuditServiceRoleAdapterDryRunResult
>;
