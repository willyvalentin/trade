import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditEventInsert,
  ExecutionRecordAuditWriterInput,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditServiceRoleAdapterLiveResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter";
import type {
  ExecutionRecordAuditWriterIntegratedConflictResult,
  ExecutionRecordAuditWriterIntegratedServiceUnavailableResult,
  ExecutionRecordAuditWriterIntegratedSuccessResult,
  ExecutionRecordAuditWriterIntegratedUnknownErrorResult,
  ExecutionRecordAuditWriterSkeletonBlockedResult,
  ExecutionRecordAuditWriterSkeletonValidationFailedResult,
} from "../../lib/server/execution-record-audit-writer";

const root = process.cwd();
const writerPath = join(root, "lib/server/execution-record-audit-writer.ts");
const adapterPath = join(
  root,
  "lib/server/execution-record-audit-writer-service-role-adapter.ts",
);
const approvedRoutePath = join(root, "app/api/execution/audit/writer/route.ts");
const approvedProductionWritePath = join(
  root,
  "lib/server/execution-record-audit-writer-production-write-path.ts",
);
const writerImport = "execution-record-audit-writer";
const directWriterImport =
  'from "@/lib/server/execution-record-audit-writer";';
const liveAdapterImport = "execution-record-audit-writer-service-role-adapter";

type RuntimeWriterModule = {
  appendExecutionRecordAuditEvent: (
    input: unknown,
    options?: {
      insertWithServiceRole?: (input: {
        insert: ExecutionRecordAuditEventInsert;
      }) => Promise<ExecutionRecordAuditServiceRoleAdapterLiveResult>;
    },
  ) => Promise<
    | ExecutionRecordAuditWriterIntegratedConflictResult
    | ExecutionRecordAuditWriterIntegratedServiceUnavailableResult
    | ExecutionRecordAuditWriterIntegratedSuccessResult
    | ExecutionRecordAuditWriterIntegratedUnknownErrorResult
    | ExecutionRecordAuditWriterSkeletonBlockedResult
    | ExecutionRecordAuditWriterSkeletonValidationFailedResult
  >;
};

const validInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "execution_record_created",
  source: {
    eventSource: "writer_integration_boundary_regression",
    sourceSystem: "trade_app",
    sourceFingerprint: "writer-integration-boundary-fingerprint",
    traceId: "writer-integration-boundary-trace",
    writerVersion: "writer-integration-boundary-test",
  },
  requestId: "writer-integration-boundary-request",
  idempotencyKey: "execution-record-audit:writer-integration-boundary",
  duplicatePreventionKey:
    "execution-record-audit:writer-integration-boundary-duplicate",
  actor: {
    actorType: "system",
    actorId: null,
  },
  authorityMode: "server_append_only",
  payload: {
    status: "created",
  },
  evidence: {
    source: "fixture",
  },
  provenance: {
    generatedBy: "action_824_test",
  },
  occurredAt: "2026-06-25T21:35:00.000Z",
  metadata: {
    deterministic: true,
  },
} satisfies ExecutionRecordAuditWriterInput;

const expectedWouldInsert = {
  actor_id: null,
  actor_type: "system",
  duplicate_prevention_key:
    "execution-record-audit:writer-integration-boundary-duplicate",
  event_payload: validInput.payload,
  event_source: "writer_integration_boundary_regression",
  event_status: "dry_run_ready",
  event_type: "execution_record_created",
  evidence_payload: validInput.evidence,
  execution_record_id: validInput.executionRecordId,
  idempotency_key: validInput.idempotencyKey,
  metadata: {
    authorityMode: "server_append_only",
    inputMetadata: validInput.metadata,
    provenance: validInput.provenance,
    wouldWrite: false,
  },
  occurred_at: validInput.occurredAt,
  request_id: validInput.requestId,
  schema_version: "1",
  source_fingerprint: "writer-integration-boundary-fingerprint",
  source_system: "trade_app",
  trace_id: "writer-integration-boundary-trace",
  writer_version: "writer-integration-boundary-test",
} satisfies ExecutionRecordAuditEventInsert;

const expectedLiveInsert = {
  ...expectedWouldInsert,
  event_status: "attempted",
  metadata: {
    ...expectedWouldInsert.metadata,
    dryRunEventStatus: "dry_run_ready",
    liveEventStatus: "attempted",
    liveWrite: true,
  },
} satisfies ExecutionRecordAuditEventInsert;

const validValidation = {
  valid: true,
  errors: [],
  warnings: [],
} as const;

const readyDryRun = {
  status: "ready",
  ok: true,
  wouldWrite: false,
  wouldInsert: expectedWouldInsert,
  validation: validValidation,
  warnings: [],
} as const;

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function listSourceFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        return [];
      }

      return listSourceFiles(path);
    }

    if (!/\.(tsx?|jsx?|mjs|cjs)$/.test(entry)) {
      return [];
    }

    return [path];
  });
}

function adapterResult(
  status: ExecutionRecordAuditServiceRoleAdapterLiveResult["status"],
): ExecutionRecordAuditServiceRoleAdapterLiveResult {
  return {
    status,
    ok: status === "success",
    version: "execution_record_audit_service_role_adapter_live_v1",
    targetTable: "public.execution_record_audit_events",
    operation: "insert",
    insertAttempted: status !== "service_unavailable",
    inserted: status === "success",
    serviceRoleUsed: status !== "service_unavailable",
    queryPerformed: false,
    routeCalled: false,
    uiMutated: false,
    downstreamMutated: false,
    externalOrderCalled: false,
    externalBrowserCalled: false,
    automationEnabled: false,
    idempotencyKey: expectedWouldInsert.idempotency_key,
    auditEventId: "33333333-3333-4333-8333-333333333333",
    warnings:
      status === "conflict_idempotent_duplicate"
        ? ["idempotent_duplicate_or_unique_conflict"]
        : [],
    errors:
      status === "permission_security_failure"
        ? ["permission_or_security_failure"]
        : status === "service_unavailable"
          ? ["supabase_service_unavailable"]
          : status === "unknown_error"
            ? ["supabase_insert_error"]
            : [],
  } as ExecutionRecordAuditServiceRoleAdapterLiveResult;
}

function loadRuntimeWriterModule({
  dryRun,
  validation,
}: {
  dryRun: unknown;
  validation: unknown;
}): RuntimeWriterModule {
  const source = read(writerPath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: writerPath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeWriterModule>,
    require: (specifier: string) => {
      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-contract"
      ) {
        return {
          EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION:
            "execution_record_audit_writer_server_only_contract_v1",
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-validation"
      ) {
        return {
          validateExecutionRecordAuditWriterInput: () => validation,
        };
      }

      if (
        specifier === "@/lib/server/execution-record-audit-writer-dry-run"
      ) {
        return {
          buildExecutionRecordAuditWriterDryRun: () => dryRun,
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-service-role-adapter"
      ) {
        return {
          insertExecutionRecordAuditEventWithServiceRole: async () =>
            adapterResult("service_unavailable"),
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: writerPath });

  return sandbox.exports as RuntimeWriterModule;
}

test("integrated audit writer remains server-only and imports only the live server adapter", () => {
  const writerSource = read(writerPath);

  expect(writerSource.startsWith('import "server-only";')).toBe(true);
  expect(writerSource).toContain(
    "@/lib/server/execution-record-audit-writer-service-role-adapter",
  );
  expect(writerSource).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(read(adapterPath).startsWith('import "server-only";')).toBe(true);

  expect(writerSource).not.toContain("next/server");
  expect(writerSource).not.toContain("next/navigation");
  expect(writerSource).not.toContain("react");
  expect(writerSource).not.toContain("createClient");
  expect(writerSource).not.toContain("getServerSupabaseClient");
  expect(writerSource).not.toContain("process.env");
});

test("integrated audit writer is imported only by approved server boundaries", () => {
  const routeMatches = listSourceFiles(join(root, "app", "api"))
    .filter((path) => read(path).includes(writerImport))
    .map((path) => relative(root, path));
  const serverMatches = listSourceFiles(join(root, "lib", "server"))
    .filter((path) => path !== writerPath)
    .filter((path) => read(path).includes(directWriterImport))
    .map((path) => relative(root, path));
  const uiMatches = ["components", "hooks"]
    .flatMap((entry) => listSourceFiles(join(root, entry)))
    .filter((path) => read(path).includes(writerImport))
    .map((path) => relative(root, path));
  const apiRoot = join(root, "app", "api");
  const appRuntimeMatches = listSourceFiles(join(root, "app"))
    .filter((path) => !path.startsWith(apiRoot))
    .filter((path) => read(path).includes(writerImport))
    .map((path) => relative(root, path));

  expect(routeMatches).toEqual([
    relative(root, approvedRoutePath),
  ]);
  expect(serverMatches).toContain(relative(root, approvedProductionWritePath));
  expect(serverMatches).not.toContain(relative(root, adapterPath));
  expect(uiMatches).toEqual([]);
  expect(appRuntimeMatches).toEqual([]);
  expect(read(approvedRoutePath)).toContain("appendExecutionRecordAuditEvent");
  expect(read(approvedRoutePath)).not.toContain(liveAdapterImport);
});

test("no browser/client bundle path imports the writer or live adapter", () => {
  const browserSourceRoots = ["app", "components", "hooks"].map((entry) =>
    join(root, entry),
  );
  const matches = browserSourceRoots
    .flatMap(listSourceFiles)
    .filter((path) => !path.startsWith(join(root, "app", "api")))
    .filter((path) => {
      const source = read(path);

      return source.includes(writerImport) || source.includes(liveAdapterImport);
    })
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});

test("integrated audit writer has no direct route, browser, downstream, or Supabase write calls", () => {
  const source = read(writerPath);

  for (const forbidden of [
    ".from(",
    ".insert(",
    ".update(",
    ".delete(",
    ".upsert(",
    ".select(",
    "fetch(",
    "localStorage",
    "sessionStorage",
    "tradeMutation",
    "stats",
    "pnl",
    "profit",
    "loss",
    "rollback",
    "correction",
  ]) {
    expect(source).not.toContain(forbidden);
  }

  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
  expect(source).not.toMatch(new RegExp("automatic", "i"));
  expect(source).not.toMatch(/console\./);
  expect(source).not.toMatch(
    new RegExp("NEXT" + "_PUBLIC_[A-Z0-9_]*SERVICE", "i"),
  );
  expect(source).not.toMatch(/SUPABASE_SERVICE_ROLE(KEY|_SECRET)?\s*=/);
});

test("integrated audit writer calls adapter only after validation and dry-run ready gates", async () => {
  const runtimeWriter = loadRuntimeWriterModule({
    dryRun: readyDryRun,
    validation: validValidation,
  });
  const seenInserts: ExecutionRecordAuditEventInsert[] = [];
  const result = await runtimeWriter.appendExecutionRecordAuditEvent(validInput, {
    insertWithServiceRole: async ({ insert }) => {
      seenInserts.push(insert);

      return adapterResult("success");
    },
  });
  const success = result as ExecutionRecordAuditWriterIntegratedSuccessResult;

  expect(seenInserts).toEqual([expectedLiveInsert]);
  expect(success.status).toBe("success");
  expect(success.inserted).toBe(true);
  expect(success.adapterStatus).toBe("success");
  expect(success.row.event_status).toBe("attempted");
  expect(success.dryRun.status).toBe("ready");
  expect(success.dryRun.wouldWrite).toBe(false);
  expect(success.dryRun.wouldInsert).toEqual(expectedWouldInsert);
});

test("invalid and blocked audit writer inputs never call the live adapter", async () => {
  let invalidAdapterCalled = false;
  const invalidRuntimeWriter = loadRuntimeWriterModule({
    dryRun: readyDryRun,
    validation: {
      valid: false,
      errors: ["execution_record_id_invalid_uuid"],
      warnings: [],
    },
  });
  const invalidResult = await invalidRuntimeWriter.appendExecutionRecordAuditEvent(
    { ...validInput, executionRecordId: "not-a-uuid" },
    {
      insertWithServiceRole: async () => {
        invalidAdapterCalled = true;

        return adapterResult("success");
      },
    },
  );

  let blockedAdapterCalled = false;
  const blockedRuntimeWriter = loadRuntimeWriterModule({
    dryRun: {
      status: "blocked",
      ok: false,
      wouldWrite: false,
      wouldInsert: null,
      validation: validValidation,
      errors: ["authority_mode_blocked"],
      warnings: [],
    },
    validation: validValidation,
  });
  const blockedResult = await blockedRuntimeWriter.appendExecutionRecordAuditEvent(
    { ...validInput, authorityMode: "blocked" },
    {
      insertWithServiceRole: async () => {
        blockedAdapterCalled = true;

        return adapterResult("success");
      },
    },
  );

  expect(invalidAdapterCalled).toBe(false);
  expect(invalidResult.status).toBe("validation_failed");
  expect(invalidResult.inserted).toBe(false);
  expect(invalidResult.dryRun.wouldWrite).toBe(false);
  expect(blockedAdapterCalled).toBe(false);
  expect(blockedResult.status).toBe("blocked");
  expect(blockedResult.inserted).toBe(false);
  expect(blockedResult.dryRun.wouldWrite).toBe(false);
});

test("integrated audit writer maps all approved adapter outcomes without downstream mutation flags", async () => {
  const runtimeWriter = loadRuntimeWriterModule({
    dryRun: readyDryRun,
    validation: validValidation,
  });
  const run = (status: ExecutionRecordAuditServiceRoleAdapterLiveResult["status"]) =>
    runtimeWriter.appendExecutionRecordAuditEvent(validInput, {
      insertWithServiceRole: async () => adapterResult(status),
    });

  const success = (await run(
    "success",
  )) as ExecutionRecordAuditWriterIntegratedSuccessResult;
  const duplicate = (await run(
    "conflict_idempotent_duplicate",
  )) as ExecutionRecordAuditWriterIntegratedConflictResult;
  const security = (await run(
    "permission_security_failure",
  )) as ExecutionRecordAuditWriterIntegratedUnknownErrorResult;
  const unavailable = (await run(
    "service_unavailable",
  )) as ExecutionRecordAuditWriterIntegratedServiceUnavailableResult;
  const unknown = (await run(
    "unknown_error",
  )) as ExecutionRecordAuditWriterIntegratedUnknownErrorResult;

  expect(success.status).toBe("success");
  expect(success.adapterStatus).toBe("success");
  expect(duplicate.status).toBe("conflict_idempotent_duplicate");
  expect(duplicate.adapterStatus).toBe("conflict_idempotent_duplicate");
  expect(security.status).toBe("unknown_error");
  expect(security.adapterStatus).toBe("permission_security_failure");
  expect(unavailable.status).toBe("service_unavailable");
  expect(unavailable.adapterStatus).toBe("service_unavailable");
  expect(unknown.status).toBe("unknown_error");
  expect(unknown.adapterStatus).toBe("unknown_error");

  for (const result of [success, duplicate, security, unavailable, unknown]) {
    expect(result.inserted).toBe(result.status === "success");
    expect(result.dryRun.wouldWrite).toBe(false);
    expect(result.dryRun.idempotencyKey).toBe(validInput.idempotencyKey);
  }
});
