import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ExecutionRecordAuditServiceRoleAdapterDryRunBlockedResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunInput,
  ExecutionRecordAuditServiceRoleAdapterDryRunMissingEnvResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunReadyResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunUnsafeExposureResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter-contract";

const contractPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-service-role-adapter-contract.ts",
);
const writerPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer.ts",
);

test("service-role adapter dry-run contract exposes readiness statuses", () => {
  const source = readFileSync(contractPath, "utf8");

  for (const status of [
    "ready",
    "blocked",
    "missing_service_role_env",
    "multiple_service_role_aliases",
    "unsafe_public_service_role_exposure",
    "unknown_error",
  ]) {
    expect(source).toContain(`"${status}"`);
  }
});

test("service-role adapter dry-run ready result never implies query or write", () => {
  const input = {
    checkedAliases: ["accepted-service-role-alias"],
    presentAliasCount: 1,
    selectedAlias: "accepted-service-role-alias",
    publicExposureDetected: false,
    leakageDetected: false,
    readinessChecksCompleted: true,
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunInput;
  const ready = {
    status: "ready",
    canCreateClient: true,
    wouldUseServiceRole: true,
    wouldWrite: false,
    wouldQuery: false,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    secretsPrinted: false,
    reason: "all_readiness_checks_passed",
    warnings: [],
    checkedAliases: input.checkedAliases,
    selectedAlias: input.selectedAlias,
    version: "execution_record_audit_service_role_adapter_dry_run_contract_v1",
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunReadyResult;

  expect(ready.canCreateClient).toBe(true);
  expect(ready.wouldUseServiceRole).toBe(true);
  expect(ready.wouldWrite).toBe(false);
  expect(ready.wouldQuery).toBe(false);
  expect(ready.clientCreated).toBe(false);
  expect(ready.queryPerformed).toBe(false);
  expect(ready.writePerformed).toBe(false);
  expect(ready.secretsPrinted).toBe(false);
});

test("service-role adapter dry-run blocked and missing-env results remain non-writing", () => {
  const blocked = {
    status: "blocked",
    canCreateClient: false,
    wouldUseServiceRole: false,
    wouldWrite: false,
    wouldQuery: false,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    secretsPrinted: false,
    reason: "service_role_client_creation_not_approved",
    warnings: ["adapter_contract_only"],
    checkedAliases: [],
    selectedAlias: null,
    version: "execution_record_audit_service_role_adapter_dry_run_contract_v1",
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunBlockedResult;
  const missingEnv = {
    status: "missing_service_role_env",
    canCreateClient: false,
    wouldUseServiceRole: false,
    wouldWrite: false,
    wouldQuery: false,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    secretsPrinted: false,
    reason: "service_role_env_missing",
    warnings: ["service_role_env_absent"],
    checkedAliases: ["accepted-service-role-alias"],
    selectedAlias: null,
    version: "execution_record_audit_service_role_adapter_dry_run_contract_v1",
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunMissingEnvResult;

  const results: ExecutionRecordAuditServiceRoleAdapterDryRunResult[] = [
    blocked,
    missingEnv,
  ];

  for (const result of results) {
    expect(result.canCreateClient).toBe(false);
    expect(result.wouldUseServiceRole).toBe(false);
    expect(result.wouldWrite).toBe(false);
    expect(result.clientCreated).toBe(false);
    expect(result.writePerformed).toBe(false);
    expect(result.secretsPrinted).toBe(false);
  }
});

test("service-role adapter dry-run unsafe public exposure result blocks client creation", () => {
  const unsafe = {
    status: "unsafe_public_service_role_exposure",
    canCreateClient: false,
    wouldUseServiceRole: false,
    wouldWrite: false,
    wouldQuery: false,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    secretsPrinted: false,
    reason: "public_service_role_exposure_detected",
    warnings: ["public_exposure_detected"],
    checkedAliases: ["accepted-service-role-alias"],
    selectedAlias: null,
    version: "execution_record_audit_service_role_adapter_dry_run_contract_v1",
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunUnsafeExposureResult;

  expect(unsafe.canCreateClient).toBe(false);
  expect(unsafe.wouldUseServiceRole).toBe(false);
  expect(unsafe.wouldWrite).toBe(false);
  expect(unsafe.secretsPrinted).toBe(false);
});

test("service-role adapter dry-run safety flags are all no-query/no-write", () => {
  const safetyFlags = {
    wouldWrite: false,
    wouldQuery: false,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    secretsPrinted: false,
  } satisfies {
    wouldWrite: false;
    wouldQuery: false;
    clientCreated: false;
    queryPerformed: false;
    writePerformed: false;
    secretsPrinted: false;
  };

  expect(safetyFlags).toEqual({
    wouldWrite: false,
    wouldQuery: false,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    secretsPrinted: false,
  });
});

test("service-role adapter dry-run contract source remains server-only and static", () => {
  const source = readFileSync(contractPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).not.toContain("createClient");
  expect(source).not.toContain("supabase-server");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toMatch(new RegExp("NEXT" + "_PUBLIC_.*SERVICE", "i"));
  expect(source).not.toMatch(new RegExp("SUPABASE" + "_SERVICE_ROLE"));
  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
  expect(source).not.toMatch(new RegExp("automatic", "i"));
});

test("writer skeleton remains write-blocked and disconnected from adapter contract", () => {
  const source = readFileSync(writerPath, "utf8");

  expect(source).not.toContain(
    "execution-record-audit-writer-service-role-adapter-contract",
  );
  expect(source).not.toContain(
    "execution-record-audit-writer-service-role-adapter",
  );
  expect(source).toContain("writer_implementation_not_enabled");
  expect(source).toContain("wouldWrite: false");
});
