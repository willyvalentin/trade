import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditWriterResultWithDryRun,
} from "../../lib/server/execution-record-audit-writer";
import type {
  ExecutionRecordAuditWriterRuntimeMonitoringEvent,
} from "../../lib/server/execution-record-audit-writer-runtime-monitoring";

const root = process.cwd();
const monitoringPath = join(
  root,
  "lib/server/execution-record-audit-writer-runtime-monitoring.ts",
);
const monitoringImport =
  "execution-record-audit-writer-runtime-monitoring";
const supabaseServerImport = "supabase-server";
const supabaseClientImport = "@supabase";

type RuntimeMonitoringModule = {
  recordExecutionRecordAuditWriterRuntimeMonitoringEvent: (
    input:
      | {
          status: "blocked";
          writerResult: null;
        }
      | {
          status: "completed";
          writerResult: ExecutionRecordAuditWriterResultWithDryRun;
        },
    sink?: (event: ExecutionRecordAuditWriterRuntimeMonitoringEvent) => void,
  ) => ExecutionRecordAuditWriterRuntimeMonitoringEvent;
  resetExecutionRecordAuditWriterRuntimeMonitoringCounters: () => void;
  getExecutionRecordAuditWriterRuntimeMonitoringCounters: () => {
    total: number;
    success: number;
    failure: number;
    blocked: number;
    insertedTrue: number;
    insertedFalse: number;
  };
};

const successWriterResult = {
  status: "success",
  ok: true,
  inserted: true,
  auditEventId: "33333333-3333-4333-8333-333333333333",
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  idempotencyKey: "runtime-monitoring-success",
  row: {} as ExecutionRecordAuditWriterResultWithDryRun extends {
    row: infer Row;
  }
    ? Row
    : never,
  warnings: [],
  dryRun: {
    contractVersion: "execution_record_audit_writer_server_only_contract_v1",
    skeletonVersion: "execution_record_audit_writer_implementation_skeleton_v1",
    status: "ready",
    wouldWrite: false,
    wouldInsert: null,
    executionRecordId: "11111111-1111-4111-8111-111111111111",
    eventType: "execution_lifecycle_complete_execution",
    eventSource: "execution_lifecycle_transition_handler",
    sourceSystem: "trade_app",
    requestId: "runtime-monitoring-request",
    idempotencyKey: "runtime-monitoring-success",
    warnings: [],
  },
  adapterStatus: "success",
} as ExecutionRecordAuditWriterResultWithDryRun;

const serviceUnavailableWriterResult = {
  status: "service_unavailable",
  ok: false,
  inserted: false,
  errors: ["supabase_service_unavailable"],
  diagnostics: {
    category: "service_unavailable",
    code: "503",
    status: 503,
    message:
      "service_role=super-secret eyJhbGciOiJIUzI1NiJ9.payload.signature unavailable",
    details: null,
    hint: null,
    constraint: null,
  },
  warnings: [],
  dryRun: {
    contractVersion: "execution_record_audit_writer_server_only_contract_v1",
    skeletonVersion: "execution_record_audit_writer_implementation_skeleton_v1",
    status: "ready",
    wouldWrite: false,
    wouldInsert: null,
    executionRecordId: "11111111-1111-4111-8111-111111111111",
    eventType: "execution_lifecycle_complete_execution",
    eventSource: "execution_lifecycle_transition_handler",
    sourceSystem: "trade_app",
    requestId: "runtime-monitoring-request",
    idempotencyKey: "runtime-monitoring-service-unavailable",
    warnings: [],
  },
  adapterStatus: "service_unavailable",
} as ExecutionRecordAuditWriterResultWithDryRun;

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

function loadRuntimeMonitoringModule(): RuntimeMonitoringModule {
  const source = read(monitoringPath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: monitoringPath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeMonitoringModule>,
    require: () => ({}),
  };

  vm.runInNewContext(transpiled, sandbox, { filename: monitoringPath });

  return sandbox.exports as RuntimeMonitoringModule;
}

test("runtime monitoring module remains server-only and non-persistent", () => {
  const source = read(monitoringPath);

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).not.toContain(supabaseServerImport);
  expect(source).not.toContain(supabaseClientImport);
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("route.ts");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain(".select(");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toContain("window");
  expect(source).not.toContain("document");
  expect(source).not.toContain("process.env");
  expect(source).not.toMatch(/console\./);
  expect(source).not.toMatch(/SUPABASE_SERVICE_ROLE(KEY|_SECRET)?\s*=/);
});

test("runtime monitoring source records only approved status categories and no retry loop", () => {
  const source = read(monitoringPath);

  expect(source).toContain('"blocked"');
  expect(source).toContain('"success"');
  expect(source).toContain('"failure"');
  expect(source).toContain("noRetry: true");
  expect(source).toContain("retryLoopAllowed: false");
  expect(source).not.toContain("setTimeout");
  expect(source).not.toContain("setInterval");
  expect(source).not.toContain("retry(");
  expect(source).not.toContain("for await");
});

test("runtime monitoring source has no trade stats pnl broker avanza or automatic behavior", () => {
  const source = read(monitoringPath);

  for (const forbidden of [
    "mutateTrade",
    "tradeMutation",
    "updateTrade",
    "stats",
    "pnl",
    "profit",
    "loss",
    "callBroker",
    "callAvanza",
    "brokerClient",
    "avanzaClient",
    "automaticModeAllowed: true",
    "automationEnabled",
  ]) {
    expect(source).not.toContain(forbidden);
  }

  expect(source).toContain("tradeStatsPnlMutationAllowed: false");
  expect(source).toContain("brokerAvanzaAllowed: false");
  expect(source).toContain("automaticModeAllowed: false");
});

test("runtime monitoring import is absent from UI, app shell, and market scanner paths", () => {
  const disallowedRoots = ["app", "components", "hooks", "scripts"].map(
    (entry) => join(root, entry),
  );
  const matches = disallowedRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(monitoringImport))
    .map((path) => relative(root, path));
  const marketScannerMatches = matches.filter((path) =>
    /market|scan|scanner|automation|avanza|broker/i.test(path),
  );

  expect(matches).toEqual([]);
  expect(marketScannerMatches).toEqual([]);
});

test("runtime monitoring import is limited to server boundary and test files", () => {
  const sourceRoots = ["app", "components", "hooks", "lib", "scripts", "tests"].map(
    (entry) => join(root, entry),
  );
  const matches = sourceRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(monitoringImport))
    .map((path) => relative(root, path))
    .sort();

  expect(matches).toEqual([
    "lib/server/execution-record-audit-writer-production-write-path.ts",
    "tests/e2e/execution-record-audit-writer-live-smoke-success-regression.spec.ts",
    "tests/e2e/execution-record-audit-writer-production-write-path.spec.ts",
    "tests/e2e/execution-record-audit-writer-runtime-monitoring.spec.ts",
    "tests/e2e/execution-record-audit-writer-runtime-persistence-rollout.spec.ts",
  ]);
});

test("runtime monitoring records safe success and blocked counters only", () => {
  const runtime = loadRuntimeMonitoringModule();
  const sinkEvents: ExecutionRecordAuditWriterRuntimeMonitoringEvent[] = [];

  runtime.resetExecutionRecordAuditWriterRuntimeMonitoringCounters();

  const blocked = runtime.recordExecutionRecordAuditWriterRuntimeMonitoringEvent(
    {
      status: "blocked",
      writerResult: null,
    },
    (event) => sinkEvents.push(event),
  );
  const success = runtime.recordExecutionRecordAuditWriterRuntimeMonitoringEvent(
    {
      status: "completed",
      writerResult: successWriterResult,
    },
    (event) => sinkEvents.push(event),
  );

  expect(sinkEvents).toEqual([blocked, success]);
  expect(blocked).toMatchObject({
    statusCategory: "blocked",
    writerStatus: "not_called",
    adapterStatus: null,
    inserted: false,
    noRetry: true,
    serviceRoleAvailability: {
      checked: false,
      available: null,
      unavailable: false,
    },
  });
  expect(success).toMatchObject({
    statusCategory: "success",
    writerStatus: "success",
    adapterStatus: "success",
    inserted: true,
    noRetry: true,
    serviceRoleAvailability: {
      checked: true,
      available: true,
      unavailable: false,
    },
    counters: {
      total: 2,
      success: 1,
      failure: 0,
      blocked: 1,
      insertedTrue: 1,
      insertedFalse: 1,
    },
  });
  expect(runtime.getExecutionRecordAuditWriterRuntimeMonitoringCounters()).toEqual(
    success.counters,
  );
  expect(success.safety).toMatchObject({
    serverOnly: true,
    serviceRoleValuesCaptured: false,
    serviceRoleAvailabilityBooleansOnly: true,
    databaseWritesAllowed: false,
    supabaseQueryAllowed: false,
    updateDeleteUpsertSelectAllowed: false,
    uiBrowserInvocationAllowed: false,
    marketScannerAutomationInvocationAllowed: false,
    brokerAvanzaAllowed: false,
    automaticModeAllowed: false,
    tradeStatsPnlMutationAllowed: false,
    downstreamMutationAllowed: false,
    retryLoopAllowed: false,
  });
});

test("runtime monitoring records writer and adapter failure statuses without changing inserted false", () => {
  const runtime = loadRuntimeMonitoringModule();

  runtime.resetExecutionRecordAuditWriterRuntimeMonitoringCounters();

  const event = runtime.recordExecutionRecordAuditWriterRuntimeMonitoringEvent({
    status: "completed",
    writerResult: {
      ...serviceUnavailableWriterResult,
      status: "conflict_idempotent_duplicate",
      adapterStatus: "conflict_idempotent_duplicate",
      diagnostics: {
        category: "duplicate",
        code: "23505",
        status: null,
        message: "duplicate idempotency key",
        details: null,
        hint: null,
        constraint: null,
      },
    } as ExecutionRecordAuditWriterResultWithDryRun,
  });

  expect(event).toMatchObject({
    statusCategory: "failure",
    writerStatus: "conflict_idempotent_duplicate",
    adapterStatus: "conflict_idempotent_duplicate",
    inserted: false,
    diagnostics: {
      category: "duplicate",
      code: "23505",
      message: "duplicate idempotency key",
    },
    counters: {
      total: 1,
      success: 0,
      failure: 1,
      blocked: 0,
      insertedTrue: 0,
      insertedFalse: 1,
    },
  });
});

test("runtime monitoring sanitizes diagnostics and records service-role availability as booleans", () => {
  const runtime = loadRuntimeMonitoringModule();

  runtime.resetExecutionRecordAuditWriterRuntimeMonitoringCounters();

  const event = runtime.recordExecutionRecordAuditWriterRuntimeMonitoringEvent({
    status: "completed",
    writerResult: serviceUnavailableWriterResult,
  });

  expect(event).toMatchObject({
    statusCategory: "failure",
    writerStatus: "service_unavailable",
    adapterStatus: "service_unavailable",
    inserted: false,
    diagnostics: {
      category: "service_unavailable",
      code: "503",
    },
    serviceRoleAvailability: {
      checked: true,
      available: false,
      unavailable: true,
    },
    counters: {
      total: 1,
      success: 0,
      failure: 1,
      blocked: 0,
      insertedTrue: 0,
      insertedFalse: 1,
    },
  });
  expect(event.diagnostics.message).toContain("service_role=[redacted]");
  expect(event.diagnostics.message).toContain("[redacted_jwt]");
  expect(event.diagnostics.message).not.toContain("super-secret");
  expect(event.diagnostics.message).not.toContain(
    "eyJhbGciOiJIUzI1NiJ9.payload.signature",
  );
});
