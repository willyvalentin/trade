import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditServiceRoleAdapterClient,
  ExecutionRecordAuditServiceRoleAdapterLiveResult,
} from "../../lib/server/execution-record-audit-writer-service-role-adapter";

const root = process.cwd();
const adapterPath = join(
  root,
  "lib/server/execution-record-audit-writer-service-role-adapter.ts",
);
const writerPath = join(root, "lib/server/execution-record-audit-writer.ts");
const adapterImport = "execution-record-audit-writer-service-role-adapter";

const allowedImports = new Set([
  'import "server-only";',
  'import { getServerSupabaseClient } from "@/lib/supabase-server";',
  'import type { Database } from "@/lib/supabase-database.types";',
  'import type {',
  '} from "@/lib/server/execution-record-audit-writer-contract";',
  '} from "@/lib/server/execution-record-audit-writer-service-role-adapter-contract";',
  'import {',
]);

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
      unavailable_reason: "supabase_missing_env" | "supabase_service_role_missing" | null;
    };
  }) => Promise<ExecutionRecordAuditServiceRoleAdapterLiveResult>;
};

const representativeInsert = {
  event_source: "live_boundary_regression",
  event_status: "attempted",
  event_type: "execution_record_created",
  execution_record_id: "11111111-1111-4111-8111-111111111111",
  id: "22222222-2222-4222-8222-222222222222",
  idempotency_key: "execution-record-audit:live-boundary-regression",
  source_system: "trade_app",
};

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

function loadRuntimeAdapterModule(): RuntimeAdapterModule {
  const source = read(adapterPath).replace('import "server-only";', "");
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
          getServerSupabaseClient: () => {
            throw new Error("default live client must not be used in regression tests");
          },
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
  calls: { table: string[]; insertCount: number },
): ExecutionRecordAuditServiceRoleAdapterClient {
  return {
    from: (table) => {
      calls.table.push(table);

      return {
        insert: async (values) => {
          calls.insertCount += 1;
          expect(values).toBe(representativeInsert);

          return { error };
        },
      };
    },
  };
}

test("live adapter keeps only approved server-only imports", () => {
  const source = read(adapterPath);
  const importLines = source
    .split("\n")
    .filter((line) => line.startsWith("import ") || line.startsWith("} from "))
    .map((line) => line.trim());

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(importLines).toContain(
    'import { getServerSupabaseClient } from "@/lib/supabase-server";',
  );
  expect(importLines).toContain(
    'import type { Database } from "@/lib/supabase-database.types";',
  );

  for (const line of importLines) {
    expect(allowedImports.has(line)).toBe(true);
  }

  expect(source).not.toContain("../../");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("next/navigation");
  expect(source).not.toContain("react");
});

test("live adapter remains audit-table insert-only with no unrelated write targets", () => {
  const source = read(adapterPath);
  const fromTargets = [...source.matchAll(/\.from\("([^"]+)"\)/g)].map(
    (match) => match[1],
  );
  const insertCalls = [...source.matchAll(/\.insert\(([^)]+)\)/g)].map(
    (match) => match[1],
  );

  expect(source).toContain('targetTable: "public.execution_record_audit_events"');
  expect(source).toContain('operation: "insert"');
  expect(fromTargets).toEqual(["execution_record_audit_events"]);
  expect(insertCalls).toEqual(["input.insert"]);

  for (const forbidden of [
    ".select(",
    ".update(",
    ".delete(",
    ".upsert(",
    "execution_records",
    "trades",
    "positions",
    "stats",
    "pnl",
    "profit",
    "loss",
    "localStorage",
    "sessionStorage",
    "fetch(",
  ]) {
    expect(source).not.toContain(forbidden);
  }
});

test("live adapter is absent from route, UI, and runtime shell imports", () => {
  const searchRoots = ["app", "components", "hooks", "lib"].map((entry) =>
    join(root, entry),
  );
  const allowedServerAdapterFiles = new Set([
    adapterPath,
    join(root, "lib/server/execution-record-audit-writer-service-role-adapter-contract.ts"),
    join(root, "lib/server/execution-record-audit-writer-service-role-adapter-fixtures.ts"),
    join(root, "lib/server/execution-record-audit-writer-service-role-adapter-mock.ts"),
    join(root, "lib/server/execution-record-audit-writer-mock-integration-harness.ts"),
    join(
      root,
      "lib/server/execution-record-audit-writer-mock-integration-preview-fixtures.ts",
    ),
  ]);
  const matches = searchRoots
    .flatMap(listSourceFiles)
    .filter((path) => !allowedServerAdapterFiles.has(path))
    .filter((path) => path !== writerPath)
    .filter((path) => read(path).includes(adapterImport))
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
  expect(read(writerPath)).toContain(adapterImport);
  expect(read(writerPath)).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(read(writerPath)).not.toContain(".from(");
  expect(read(writerPath)).not.toContain(".insert(");
  expect(read(writerPath)).toContain("wouldWrite: false");
});

test("route files do not import or call the live adapter", () => {
  const routeFiles = listSourceFiles(join(root, "app", "api")).map((path) => ({
    path,
    source: read(path),
  }));
  const matches = routeFiles
    .filter(({ source }) => source.includes(adapterImport))
    .map(({ path }) => relative(root, path));

  expect(matches).toEqual([]);
  expect(
    routeFiles.some(({ source }) =>
      source.includes("insertExecutionRecordAuditEventWithServiceRole"),
    ),
  ).toBe(false);
});

test("live adapter does not expose service-role values or downstream execution authority", () => {
  const source = read(adapterPath);

  expect(source).not.toMatch(
    new RegExp("NEXT" + "_PUBLIC_[A-Z0-9_]*SERVICE", "i"),
  );
  expect(source).not.toMatch(
    new RegExp("SERVICE" + "_ROLE.*NEXT" + "_PUBLIC_", "i"),
  );
  expect(source).not.toMatch(/process\.env/);
  expect(source).not.toMatch(/console\./);
  expect(source).not.toMatch(/service_role_key\s*=/i);
  expect(source).not.toMatch(/SUPABASE_SERVICE_ROLE(KEY|_SECRET)?\s*=/);
  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
  expect(source).not.toMatch(new RegExp("automatic", "i"));
  expect(source).not.toMatch(/stats|pnl|profit|loss|rollback|correction|trade/i);
});

test("live adapter maps all approved outcomes through injected clients only", async () => {
  const runtimeAdapter = loadRuntimeAdapterModule();
  const run = async (
    error: { code?: string | null; status?: number | null } | null,
  ) => {
    const calls = { table: [] as string[], insertCount: 0 };
    const result =
      await runtimeAdapter.insertExecutionRecordAuditEventWithServiceRole({
        insert: representativeInsert,
        getClient: () => ({
          client: createMockClient(error, calls),
          unavailable_reason: null,
        }),
      });

    return { calls, result };
  };

  const success = await run(null);
  const duplicate = await run({ code: "23505" });
  const permission = await run({ code: "42501" });
  const unavailable = await run({ status: 503 });
  const unknown = await run({ code: "PGRST999" });
  const unavailableClient =
    await runtimeAdapter.insertExecutionRecordAuditEventWithServiceRole({
      insert: representativeInsert,
      getClient: () => ({
        client: null,
        unavailable_reason: "supabase_service_role_missing",
      }),
    });

  expect(success.result.status).toBe("success");
  expect(duplicate.result.status).toBe("conflict_idempotent_duplicate");
  expect(permission.result.status).toBe("permission_security_failure");
  expect(unavailable.result.status).toBe("service_unavailable");
  expect(unknown.result.status).toBe("unknown_error");
  expect(unavailableClient.status).toBe("service_unavailable");
  expect(unavailableClient.insertAttempted).toBe(false);
  expect(unavailableClient.serviceRoleUsed).toBe(false);

  for (const { calls, result } of [
    success,
    duplicate,
    permission,
    unavailable,
    unknown,
  ]) {
    expect(calls.table).toEqual(["execution_record_audit_events"]);
    expect(calls.insertCount).toBe(1);
    expect(result.targetTable).toBe("public.execution_record_audit_events");
    expect(result.operation).toBe("insert");
    expect(result.routeCalled).toBe(false);
    expect(result.uiMutated).toBe(false);
    expect(result.downstreamMutated).toBe(false);
    expect(result.externalOrderCalled).toBe(false);
    expect(result.externalBrowserCalled).toBe(false);
    expect(result.automationEnabled).toBe(false);
  }
});
