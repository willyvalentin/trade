import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ExecutionRecordAuditServiceRoleAdapterDryRunMissingEnvResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunMultipleAliasesResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunReadyResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunUnsafeExposureResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunUnknownErrorResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter-contract";

const fixturePath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-service-role-adapter-fixtures.ts",
);
const writerPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer.ts",
);

test("service-role adapter dry-run fixture source remains server-only and static", () => {
  const source = readFileSync(fixturePath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("buildExecutionRecordAuditServiceRoleAdapterDryRun");
  expect(source).toContain(
    "executionRecordAuditServiceRoleAdapterDryRunFixtureSummaries",
  );
  expect(source).toContain(
    "executionRecordAuditServiceRoleAdapterDryRunFixtureResults",
  );

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

test("service-role adapter dry-run fixture summaries cover required states", () => {
  const source = readFileSync(fixturePath, "utf8");

  for (const fixtureName of [
    "ready",
    "missing",
    "multiple",
    "unsafePublicExposure",
    "leakageDetected",
    "incomplete",
  ]) {
    expect(source).toContain(`${fixtureName}: {`);
  }

  expect(source).toContain("presentAliasCount: 1");
  expect(source).toContain("presentAliasCount: 0");
  expect(source).toContain("presentAliasCount: 2");
  expect(source).toContain("publicExposureDetected: true");
  expect(source).toContain("leakageDetected: true");
  expect(source).toContain("readinessChecksCompleted: false");
});

test("service-role adapter dry-run fixture representative results cover statuses", () => {
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
    checkedAliases: ["accepted-service-role-alias"],
    selectedAlias: "accepted-service-role-alias",
    version: "execution_record_audit_service_role_adapter_dry_run_contract_v1",
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunReadyResult;
  const missing = {
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
  const multiple = {
    status: "multiple_service_role_aliases",
    canCreateClient: false,
    wouldUseServiceRole: false,
    wouldWrite: false,
    wouldQuery: false,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    secretsPrinted: false,
    reason: "multiple_service_role_aliases_present",
    warnings: ["multiple_service_role_aliases_present"],
    checkedAliases: [
      "accepted-service-role-alias-one",
      "accepted-service-role-alias-two",
    ],
    selectedAlias: null,
    version: "execution_record_audit_service_role_adapter_dry_run_contract_v1",
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunMultipleAliasesResult;
  const unsafePublicExposure = {
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
  const leakageDetected = {
    ...unsafePublicExposure,
    warnings: ["service_role_leakage_detected"],
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunUnsafeExposureResult;
  const incomplete = {
    status: "unknown_error",
    canCreateClient: false,
    wouldUseServiceRole: false,
    wouldWrite: false,
    wouldQuery: false,
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    secretsPrinted: false,
    reason: "unknown_adapter_readiness_error",
    warnings: ["readiness_checks_incomplete"],
    checkedAliases: ["accepted-service-role-alias"],
    selectedAlias: "accepted-service-role-alias",
    version: "execution_record_audit_service_role_adapter_dry_run_contract_v1",
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunUnknownErrorResult;
  const results: ExecutionRecordAuditServiceRoleAdapterDryRunResult[] = [
    ready,
    missing,
    multiple,
    unsafePublicExposure,
    leakageDetected,
    incomplete,
  ];

  expect(ready.status).toBe("ready");
  expect(missing.status).toBe("missing_service_role_env");
  expect(multiple.status).toBe("multiple_service_role_aliases");
  expect(unsafePublicExposure.status).toBe(
    "unsafe_public_service_role_exposure",
  );
  expect(leakageDetected.status).toBe("unsafe_public_service_role_exposure");
  expect(incomplete.status).toBe("unknown_error");

  for (const result of results) {
    expect(result.wouldWrite).toBe(false);
    expect(result.wouldQuery).toBe(false);
    expect(result.clientCreated).toBe(false);
    expect(result.queryPerformed).toBe(false);
    expect(result.writePerformed).toBe(false);
    expect(result.secretsPrinted).toBe(false);
  }
});

test("service-role adapter dry-run fixture results are built from deterministic summaries", () => {
  const source = readFileSync(fixturePath, "utf8");

  expect(source).toContain(
    "ready: buildExecutionRecordAuditServiceRoleAdapterDryRun",
  );
  expect(source).toContain(
    "missing: buildExecutionRecordAuditServiceRoleAdapterDryRun",
  );
  expect(source).toContain(
    "multiple: buildExecutionRecordAuditServiceRoleAdapterDryRun",
  );
  expect(source).toContain(
    "unsafePublicExposure: buildExecutionRecordAuditServiceRoleAdapterDryRun",
  );
  expect(source).toContain(
    "leakageDetected: buildExecutionRecordAuditServiceRoleAdapterDryRun",
  );
  expect(source).toContain(
    "incomplete: buildExecutionRecordAuditServiceRoleAdapterDryRun",
  );

  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("crypto.randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
});

test("writer skeleton remains write-blocked and disconnected from adapter fixtures", () => {
  const source = readFileSync(writerPath, "utf8");

  expect(source).not.toContain(
    "execution-record-audit-writer-service-role-adapter-fixtures",
  );
  expect(source).not.toContain(
    "execution-record-audit-writer-service-role-adapter",
  );
  expect(source).toContain("writer_implementation_not_enabled");
  expect(source).toContain("wouldWrite: false");
});
