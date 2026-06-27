import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditWriterInput,
} from "../../lib/server/execution-record-audit-writer-contract";

const root = process.cwd();
const routePath = join(root, "app/api/execution/audit/writer/route.ts");
const writerPath = join(root, "lib/server/execution-record-audit-writer.ts");
const routeLiteral = "/api/execution/audit/writer";
const routeContractVersion =
  "execution_record_audit_writer_route_boundary_v1";
const writerContractVersion =
  "execution_record_audit_writer_server_only_contract_v1";
const productionApprovalTerms = [
  "productionWritePathApproved: true",
  "liveSmokeInsertApproved: true",
  "uiWiringAdded: true",
  "browserClientInvocationAllowed: true",
  "scheduledInvocationAllowed: true",
  "tradeStatsPnlMutationAllowed: true",
  "updateDeleteUpsertSelectAllowed: true",
  "externalOrderBrowserAllowed: true",
  "autonomousModeAllowed: true",
] as const;
const downstreamMutationTerms = [
  "tradeRepository",
  "updateTrade(",
  "deleteTrade(",
  "mutateTrade",
  "updateStats",
  "updatePnl",
  "profitLoss",
  "rollback",
  "correction",
] as const;

type RuntimeRouteModule = {
  POST: (request: {
    headers: { get: (name: string) => string | null };
    json: () => Promise<unknown>;
  }) => Promise<{
    body: unknown;
    init: { status?: number };
  }>;
};

const validInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "execution_record_created",
  source: {
    eventSource: "writer_route_boundary_test",
    sourceSystem: "trade_app",
    sourceFingerprint: "writer-route-boundary-fingerprint",
    traceId: "writer-route-boundary-trace",
    writerVersion: "writer-route-boundary-test",
  },
  requestId: "writer-route-boundary-request",
  idempotencyKey: "execution-record-audit:writer-route-boundary",
  duplicatePreventionKey: "execution-record-audit:writer-route-boundary-duplicate",
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
    generatedBy: "action_826_test",
  },
  occurredAt: "2026-06-26T00:04:00.000Z",
  metadata: {
    deterministic: true,
  },
} satisfies ExecutionRecordAuditWriterInput;

const validRouteBody = {
  routeContractVersion,
  writerContractVersion,
  routePath: routeLiteral,
  method: "POST",
  input: validInput,
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

function loadRouteModule(input: {
  devToolsEnabled?: boolean;
  writerResult?: unknown;
  seenWriterInputs?: unknown[];
}): RuntimeRouteModule {
  const source = read(routePath);
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: routePath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeRouteModule>,
    process: {
      env: {
        TRADE_APP_PASSWORD: "test-password",
      },
    },
    require: (specifier: string) => {
      if (specifier === "next/server") {
        return {
          NextResponse: {
            json: (body: unknown, init: { status?: number } = {}) => ({
              body,
              init,
            }),
          },
        };
      }

      if (specifier === "@/lib/execution") {
        return {
          isExecutionDevToolsEnabled: () => input.devToolsEnabled ?? true,
        };
      }

      if (specifier === "@/lib/trade-auth") {
        return {
          TRADE_AUTH_COOKIE: "trade_auth",
          getTradeAuthToken: async () => "expected-token",
        };
      }

      if (specifier === "@/lib/server/execution-record-audit-writer") {
        return {
          appendExecutionRecordAuditEvent: async (writerInput: unknown) => {
            input.seenWriterInputs?.push(writerInput);

            return (
              input.writerResult ?? {
                status: "success",
                ok: true,
                inserted: true,
                auditEventId: "33333333-3333-4333-8333-333333333333",
                executionRecordId: validInput.executionRecordId,
                idempotencyKey: validInput.idempotencyKey,
                row: {},
                warnings: [],
                dryRun: {
                  status: "ready",
                  wouldWrite: false,
                  wouldInsert: {},
                  executionRecordId: validInput.executionRecordId,
                  eventType: validInput.eventType,
                  eventSource: validInput.source.eventSource,
                  sourceSystem: validInput.source.sourceSystem,
                  requestId: validInput.requestId,
                  idempotencyKey: validInput.idempotencyKey,
                  warnings: [],
                },
                adapterStatus: "success",
              }
            );
          },
        };
      }

      if (
        specifier ===
        "@/lib/server/execution-record-audit-writer-contract"
      ) {
        return {
          EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION:
            writerContractVersion,
        };
      }

      return {};
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: routePath });

  return sandbox.exports as RuntimeRouteModule;
}

function request(input: {
  body?: unknown;
  cookie?: string | null;
  jsonThrows?: boolean;
}) {
  return {
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "cookie" ? (input.cookie ?? null) : null,
    },
    json: async () => {
      if (input.jsonThrows) {
        throw new Error("invalid json");
      }

      return input.body;
    },
  };
}

test("audit writer route boundary file exists at the approved path", () => {
  expect(existsSync(routePath)).toBe(true);
  expect(relative(root, routePath)).toBe(
    "app/api/execution/audit/writer/route.ts",
  );
});

test("audit writer route imports only server-side boundaries", () => {
  const source = read(routePath);

  expect(source).toContain('import { NextResponse } from "next/server";');
  expect(source).toContain("appendExecutionRecordAuditEvent");
  expect(source).toContain("@/lib/server/execution-record-audit-writer");
  expect(source).toContain("@/lib/trade-auth");
  expect(source).toContain("isExecutionDevToolsEnabled");
  expect(read(writerPath).startsWith('import "server-only";')).toBe(true);

  expect(source).not.toContain("next/navigation");
  expect(source).not.toContain("react");
  expect(source).not.toContain("use client");
  expect(source).not.toContain("execution-record-audit-writer-service-role-adapter");
  expect(source).not.toContain("getServerSupabaseClient");
  expect(source).not.toContain("createClient");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain(".select(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
});

test("audit writer route exposes no production approval or downstream mutation authority", () => {
  const source = read(routePath);

  for (const term of productionApprovalTerms) {
    expect(source).not.toContain(term);
  }

  for (const term of downstreamMutationTerms) {
    expect(source).not.toContain(term);
  }

  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
  expect(source).not.toMatch(/auto(matic|mated)/i);
  expect(source).not.toMatch(/service[_-]?role/i);
  expect(source).not.toContain("SUPABASE_SERVICE_ROLE");
  expect(source).not.toContain("console.log");
  expect(source).not.toContain("console.error");
});

test("audit writer route is absent from UI, hooks, and app runtime imports", () => {
  const sourceRoots = ["components", "hooks"].map((entry) => join(root, entry));
  const uiMatches = sourceRoots
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(routeLiteral))
    .map((path) => relative(root, path));
  const appRuntimeMatches = listSourceFiles(join(root, "app"))
    .filter((path) => !path.startsWith(join(root, "app", "api")))
    .filter((path) => read(path).includes(routeLiteral))
    .map((path) => relative(root, path));

  expect(uiMatches).toEqual([]);
  expect(appRuntimeMatches).toEqual([]);
});

test("audit writer route literal is limited to approved server-only sources", () => {
  const sourceMatches = ["app", "components", "hooks", "lib"]
    .map((entry) => join(root, entry))
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(routeLiteral))
    .map((path) => relative(root, path));

  expect(sourceMatches).toEqual([
    "app/api/execution/audit/writer/route.ts",
    "lib/server/execution-record-audit-writer-route-invocation-harness.ts",
  ]);
});

test("audit writer route blocks before writer call when dev gate fails", async () => {
  const seenWriterInputs: unknown[] = [];
  const runtimeRoute = loadRouteModule({
    devToolsEnabled: false,
    seenWriterInputs,
  });
  const result = await runtimeRoute.POST(
    request({
      body: validRouteBody,
      cookie: "trade_auth=expected-token",
    }),
  );

  expect(result.init.status).toBe(403);
  expect(seenWriterInputs).toEqual([]);
  expect(result.body).toMatchObject({
    status: "blocked",
    writerResult: null,
    safety: {
      devGatePassed: false,
      authGatePassed: false,
      productionWritePathApproved: false,
      liveSmokeInsertApproved: false,
    },
  });
});

test("audit writer route blocks before writer call when auth gate fails", async () => {
  const seenWriterInputs: unknown[] = [];
  const runtimeRoute = loadRouteModule({ seenWriterInputs });
  const result = await runtimeRoute.POST(
    request({
      body: validRouteBody,
      cookie: "trade_auth=wrong-token",
    }),
  );

  expect(result.init.status).toBe(401);
  expect(seenWriterInputs).toEqual([]);
  expect(result.body).toMatchObject({
    status: "blocked",
    writerResult: null,
    safety: {
      devGatePassed: true,
      authGatePassed: false,
    },
  });
});

test("audit writer route validates json and request shape before writer call", async () => {
  const seenWriterInputs: unknown[] = [];
  const runtimeRoute = loadRouteModule({ seenWriterInputs });
  const invalidJson = await runtimeRoute.POST(
    request({
      jsonThrows: true,
      cookie: "trade_auth=expected-token",
    }),
  );
  const invalidShape = await runtimeRoute.POST(
    request({
      body: {
        ...validRouteBody,
        input: null,
      },
      cookie: "trade_auth=expected-token",
    }),
  );

  expect(invalidJson.init.status).toBe(400);
  expect(invalidShape.init.status).toBe(400);
  expect(seenWriterInputs).toEqual([]);
  expect(invalidJson.body).toMatchObject({ status: "validation_failed" });
  expect(invalidShape.body).toMatchObject({ status: "validation_failed" });
});

test("audit writer route validates route and writer contract metadata before writer call", async () => {
  const invalidBodies = [
    {
      body: { ...validRouteBody, routeContractVersion: "wrong" },
      fieldPath: "routeContractVersion",
    },
    {
      body: { ...validRouteBody, writerContractVersion: "wrong" },
      fieldPath: "writerContractVersion",
    },
    {
      body: { ...validRouteBody, routePath: "/api/execution/audit/other" },
      fieldPath: "routePath",
    },
    {
      body: { ...validRouteBody, method: "GET" },
      fieldPath: "method",
    },
  ];

  for (const invalidBody of invalidBodies) {
    const seenWriterInputs: unknown[] = [];
    const runtimeRoute = loadRouteModule({ seenWriterInputs });
    const result = await runtimeRoute.POST(
      request({
        body: invalidBody.body,
        cookie: "trade_auth=expected-token",
      }),
    );

    expect(result.init.status).toBe(400);
    expect(seenWriterInputs).toEqual([]);
    expect(result.body).toMatchObject({
      status: "validation_failed",
      writerResult: null,
      safety: {
        authGatePassed: true,
        devGatePassed: true,
        productionWritePathApproved: false,
        liveSmokeInsertApproved: false,
      },
    });
    expect(
      (result.body as { validationErrors: { fieldPath?: string }[] })
        .validationErrors,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fieldPath: invalidBody.fieldPath }),
      ]),
    );
  }
});

test("audit writer route calls server-only writer after dev auth and shape gates pass", async () => {
  const seenWriterInputs: unknown[] = [];
  const runtimeRoute = loadRouteModule({ seenWriterInputs });
  const result = await runtimeRoute.POST(
    request({
      body: validRouteBody,
      cookie: "trade_auth=expected-token",
    }),
  );

  expect(result.init.status).toBe(201);
  expect(seenWriterInputs).toEqual([validInput]);
  expect(result.body).toMatchObject({
    routeContractVersion,
    writerContractVersion,
    routePath: routeLiteral,
    method: "POST",
    status: "accepted",
    validationErrors: [],
    writerResult: {
      status: "success",
      inserted: true,
    },
    safety: {
      serverOnly: true,
      authGateRequired: true,
      authGatePassed: true,
      devGateRequired: true,
      devGatePassed: true,
      routeCallAllowed: true,
      uiWiringAdded: false,
      browserClientInvocationAllowed: false,
      scheduledInvocationAllowed: false,
      productionWritePathApproved: false,
      liveSmokeInsertApproved: false,
      updateDeleteUpsertSelectAllowed: false,
      tradeStatsPnlMutationAllowed: false,
      externalOrderBrowserAllowed: false,
      autonomousModeAllowed: false,
    },
  });
});
