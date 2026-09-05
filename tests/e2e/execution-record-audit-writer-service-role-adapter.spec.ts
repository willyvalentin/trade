import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditServiceRoleAdapterClient,
  ExecutionRecordAuditServiceRoleAdapterReadiness,
  ExecutionRecordAuditServiceRoleAdapterLiveResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter";
import type {
  ExecutionRecordAuditServiceRoleAdapterDryRunInput,
  ExecutionRecordAuditServiceRoleAdapterDryRunMissingEnvResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunMultipleAliasesResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunReadyResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunResult,
  ExecutionRecordAuditServiceRoleAdapterDryRunUnsafeExposureResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter-contract";

const adapterPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-service-role-adapter.ts",
);
const writerPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer.ts",
);

type RuntimeAdapterUnavailableReason =
  | "supabase_missing_env"
  | "supabase_service_role_missing"
  | "supabase_service_role_ambiguous"
  | null;

type RuntimeAdapterModule = {
  insertExecutionRecordAuditEventWithServiceRole: (input: {
    insert: {
      event_source: string;
      event_status: string;
      event_type: string;
      execution_record_id: string;
      id?: string;
      idempotency_key: string;
      source_system: string;
    };
    getClient: () => {
      client: ExecutionRecordAuditServiceRoleAdapterClient | null;
      unavailable_reason: RuntimeAdapterUnavailableReason;
    };
  }) => Promise<ExecutionRecordAuditServiceRoleAdapterLiveResult>;
};

const representativeInsert = {
  event_source: "adapter_live_test",
  event_status: "attempted",
  event_type: "execution_record_created",
  execution_record_id: "11111111-1111-4111-8111-111111111111",
  id: "22222222-2222-4222-8222-222222222222",
  idempotency_key: "execution-record-audit:adapter-live-test-1",
  source_system: "trade_app",
};

function loadRuntimeAdapterModule(): RuntimeAdapterModule {
  const source = readFileSync(adapterPath, "utf8").replace(
    'import "server-only";',
    "",
  );
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: adapterPath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeAdapterModule>,
    require: (specifier: string) => {
      if (specifier === "@/lib/supabase-server") {
        return {
          getServerSupabaseClient: () => ({
            client: null,
            unavailable_reason: "supabase_service_role_missing",
          }),
        };
      }

      return {};
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: adapterPath });
  return sandbox.exports as RuntimeAdapterModule;
}

function createMockClient(
  error: { code?: string | null; status?: number | null } | null,
): ExecutionRecordAuditServiceRoleAdapterClient {
  return {
    from: (table) => {
      expect(table).toBe("execution_record_audit_events");
      return {
        insert: async (values) => {
          expect(values).toBe(representativeInsert);
          return { error };
        },
      };
    },
  };
}

test("audit writer service-role adapter source remains server-only and insert-only", () => {
  const source = readFileSync(adapterPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("@/lib/supabase-database.types");
  expect(source).toContain("@/lib/supabase-server");
  expect(source).toContain(
    "@/lib/server/execution-record-audit-writer-service-role-adapter-contract",
  );
  expect(source).toContain("createExecutionRecordAuditServiceRoleClientAdapter");
  expect(source).toContain("buildExecutionRecordAuditServiceRoleAdapterDryRun");
  expect(source).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(source).toContain('targetTable: "public.execution_record_audit_events"');
  expect(source).toContain('operation: "insert"');
  expect(source).toContain("clientCreated: false");
  expect(source).toContain("queryPerformed: false");
  expect(source).toContain("writePerformed: false");

  expect(source).not.toContain("createClient");
  expect(source).not.toContain("process.env");
  expect(source).toContain('.from("execution_record_audit_events")');
  expect(source).toContain(".insert(input.insert)");
  expect(source).not.toContain(".select(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("console.");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toMatch(new RegExp("NEXT" + "_PUBLIC_.*SERVICE", "i"));
  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
  expect(source).not.toMatch(new RegExp("automatic" + "Mode", "i"));
});

test("audit writer service-role adapter exposes blocked readiness shape only", () => {
  const readiness = {
    status: "skeleton_blocked",
    ok: false,
    version: "execution_record_audit_service_role_adapter_skeleton_v1",
    serverOnly: true,
    typedDatabaseBoundary: true,
    acceptedEnvAliases: [
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_SERVICE_ROLE",
      "SUPABASE_SERVICE_ROLE_SECRET",
    ],
    clientCreated: false,
    queryPerformed: false,
    writePerformed: false,
    serviceRoleValuePrinted: false,
    reason: "adapter_skeleton_not_enabled",
  } satisfies ExecutionRecordAuditServiceRoleAdapterReadiness;

  expect(readiness.status).toBe("skeleton_blocked");
  expect(readiness.clientCreated).toBe(false);
  expect(readiness.queryPerformed).toBe(false);
  expect(readiness.writePerformed).toBe(false);
  expect(readiness.serviceRoleValuePrinted).toBe(false);
});

test("audit writer service-role live adapter maps insert outcomes without downstream mutation", async () => {
  const runtimeAdapter = loadRuntimeAdapterModule();
  const run = (
    client: ExecutionRecordAuditServiceRoleAdapterClient | null,
    unavailable_reason: RuntimeAdapterUnavailableReason = client
      ? null
      : "supabase_service_role_missing",
  ) =>
    runtimeAdapter.insertExecutionRecordAuditEventWithServiceRole({
      insert: representativeInsert,
      getClient: () => ({
        client,
        unavailable_reason,
      }),
    });

  const success = await run(createMockClient(null));
  const duplicate = await run(createMockClient({ code: "23505" }));
  const permission = await run(createMockClient({ code: "42501" }));
  const unavailable = await run(createMockClient({ status: 503 }));
  const unknown = await run(createMockClient({ code: "PGRST999" }));
  const noClient = await run(null);
  const ambiguousClient = await run(null, "supabase_service_role_ambiguous");

  expect(success.status).toBe("success");
  expect(success.ok).toBe(true);
  expect(success.inserted).toBe(true);
  expect(success.auditEventId).toBe(representativeInsert.id);
  expect(duplicate.status).toBe("conflict_idempotent_duplicate");
  expect(permission.status).toBe("permission_security_failure");
  expect(unavailable.status).toBe("service_unavailable");
  expect(unknown.status).toBe("unknown_error");
  expect(noClient.status).toBe("service_unavailable");
  expect(noClient.insertAttempted).toBe(false);
  expect(noClient.serviceRoleUsed).toBe(false);
  expect(noClient.errors).toEqual(["supabase_service_role_missing"]);
  expect(noClient.diagnostics).toMatchObject({
    category: "service_unavailable",
    code: "supabase_service_role_missing",
    message: "supabase_service_role_missing",
    details: null,
    hint: null,
    constraint: null,
  });
  expect(ambiguousClient.status).toBe("service_unavailable");
  expect(ambiguousClient.insertAttempted).toBe(false);
  expect(ambiguousClient.serviceRoleUsed).toBe(false);
  expect(ambiguousClient.errors).toEqual(["supabase_service_role_ambiguous"]);
  expect(ambiguousClient.diagnostics).toMatchObject({
    category: "service_unavailable",
    code: "supabase_service_role_ambiguous",
    message: "supabase_service_role_ambiguous",
    details: null,
    hint: null,
    constraint: null,
  });

  for (const result of [
    success,
    duplicate,
    permission,
    unavailable,
    unknown,
    noClient,
    ambiguousClient,
  ]) {
    expect(result.targetTable).toBe("public.execution_record_audit_events");
    expect(result.operation).toBe("insert");
    expect(result.queryPerformed).toBe(false);
    expect(result.routeCalled).toBe(false);
    expect(result.uiMutated).toBe(false);
    expect(result.downstreamMutated).toBe(false);
    expect(result.externalOrderCalled).toBe(false);
    expect(result.externalBrowserCalled).toBe(false);
    expect(result.automationEnabled).toBe(false);
    expect(JSON.stringify(result)).not.toContain("service-role-looking-value");
  }
});

test("audit writer service-role adapter dry-run classifies safe and blocked summaries", () => {
  const safeSummary = {
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
    checkedAliases: safeSummary.checkedAliases,
    selectedAlias: safeSummary.selectedAlias,
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
    checkedAliases: [],
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
    checkedAliases: ["one", "two"],
    selectedAlias: null,
    version: "execution_record_audit_service_role_adapter_dry_run_contract_v1",
  } satisfies ExecutionRecordAuditServiceRoleAdapterDryRunMultipleAliasesResult;
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
  const results: ExecutionRecordAuditServiceRoleAdapterDryRunResult[] = [
    ready,
    missing,
    multiple,
    unsafe,
  ];

  expect(ready.status).toBe("ready");
  expect(ready.canCreateClient).toBe(true);

  for (const result of results) {
    expect(result.wouldWrite).toBe(false);
    expect(result.wouldQuery).toBe(false);
    expect(result.clientCreated).toBe(false);
    expect(result.queryPerformed).toBe(false);
    expect(result.writePerformed).toBe(false);
    expect(result.secretsPrinted).toBe(false);
  }
});

test("audit writer service-role adapter dry-run implementation contains deterministic classifiers", () => {
  const source = readFileSync(adapterPath, "utf8");

  expect(source).toContain("normalizeDryRunInput");
  expect(source).toContain("baseDryRunResult");
  expect(source).toContain("summary.publicExposureDetected");
  expect(source).toContain("summary.leakageDetected");
  expect(source).toContain("summary.presentAliasCount === 0");
  expect(source).toContain("summary.presentAliasCount > 1");
  expect(source).toContain("!summary.selectedAlias");
  expect(source).toContain('status: "ready"');
  expect(source).toContain('status: "missing_service_role_env"');
  expect(source).toContain('status: "multiple_service_role_aliases"');
  expect(source).toContain('status: "unsafe_public_service_role_exposure"');
  expect(source).toContain('status: "blocked"');
  expect(source).toContain('status: "unknown_error"');
});

test("audit writer imports service-role adapter only through server-only writer boundary", () => {
  const source = readFileSync(writerPath, "utf8");

  expect(source).toContain("execution-record-audit-writer-service-role-adapter");
  expect(source).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).toContain("wouldWrite: false");
});

test("audit writer service-role adapter source is deterministic and side-effect free", () => {
  const source = readFileSync(adapterPath, "utf8");

  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("crypto.randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
});
