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
const harnessPath = join(
  root,
  "lib/server/execution-record-audit-writer-route-invocation-harness.ts",
);
const routeLiteral = "/api/execution/audit/writer";
const routeContractVersion =
  "execution_record_audit_writer_route_boundary_v1";
const writerContractVersion =
  "execution_record_audit_writer_server_only_contract_v1";

type RuntimeRouteModule = {
  POST: (request: {
    headers: { get: (name: string) => string | null };
    json: () => Promise<unknown>;
  }) => Promise<{
    body: unknown;
    init: { status?: number };
  }>;
};

type RuntimeRequest = {
  request: {
    headers: { get: (name: string) => string | null };
    json: () => Promise<unknown>;
  };
  jsonCallCount: () => number;
};

const validInput = {
  executionRecordId: "11111111-1111-4111-8111-111111111111",
  eventType: "execution_record_created",
  source: {
    eventSource: "writer_route_auth_hardening_test",
    sourceSystem: "trade_app",
    sourceFingerprint: "writer-route-auth-hardening-fingerprint",
    traceId: "writer-route-auth-hardening-trace",
    writerVersion: "writer-route-auth-hardening-test",
  },
  requestId: "writer-route-auth-hardening-request",
  idempotencyKey: "execution-record-audit:writer-route-auth-hardening",
  duplicatePreventionKey:
    "execution-record-audit:writer-route-auth-hardening-duplicate",
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
    generatedBy: "action_832_test",
  },
  occurredAt: "2026-06-26T00:32:00.000Z",
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
  appPassword?: string;
  writerResult?: unknown;
  seenWriterInputs?: unknown[];
  authTokenCalls?: unknown[];
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
        ...(input.appPassword === undefined
          ? { TRADE_APP_PASSWORD: "test-password" }
          : input.appPassword
            ? { TRADE_APP_PASSWORD: input.appPassword }
            : {}),
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
          getTradeAuthToken: async (password: string) => {
            input.authTokenCalls?.push(password);

            return "expected-token";
          },
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
  contentType?: string | null;
  jsonThrows?: boolean;
}): RuntimeRequest {
  let jsonCallCount = 0;

  return {
    request: {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === "cookie") {
            return input.cookie ?? null;
          }

          if (name.toLowerCase() === "content-type") {
            return input.contentType ?? null;
          }

          return null;
        },
      },
      json: async () => {
        jsonCallCount += 1;

        if (input.jsonThrows) {
          throw new Error("invalid json");
        }

        return input.body;
      },
    },
    jsonCallCount: () => jsonCallCount,
  };
}

function expectTypedEnvelope(body: unknown) {
  expect(body).toMatchObject({
    routeContractVersion,
    writerContractVersion,
    routePath: routeLiteral,
    method: "POST",
    receivedAt: expect.any(String),
    evaluatedAt: expect.any(String),
    validationErrors: expect.any(Array),
    safety: {
      serverOnly: true,
      authGateRequired: true,
      devGateRequired: true,
      hardDisabled: true,
      routeCallAllowed: false,
      uiWiringAdded: false,
      browserClientInvocationAllowed: false,
      scheduledInvocationAllowed: false,
      productionExecutionPersistenceBlocked: true,
      supabaseExecutionRecordsWriteAllowed: false,
      productionWritePathApproved: false,
      liveSmokeInsertApproved: false,
      updateDeleteUpsertSelectAllowed: false,
      tradeStatsPnlMutationAllowed: false,
      externalOrderBrowserAllowed: false,
      externalOrderSubmissionAllowed: false,
      finalBuySellClickAllowed: false,
      autonomousModeAllowed: false,
    },
  });
}

test("audit writer route auth hardening source remains server-only and direct-write free", () => {
  const source = read(routePath);

  expect(source).toContain('import { NextResponse } from "next/server";');
  expect(source).toContain("isExecutionDevToolsEnabled");
  expect(source).toContain("getTradeAuthToken");
  expect(source).toContain("appendExecutionRecordAuditEvent");
  expect(source).not.toContain("execution-record-audit-writer-service-role-adapter");
  expect(source).not.toContain("getServerSupabaseClient");
  expect(source).not.toContain("createClient");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain(".select(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
  expect(source).not.toMatch(/auto(matic|mated)/i);
  expect(source).not.toContain("SUPABASE_SERVICE_ROLE");
});

test("missing dev-tools gate blocks before auth json parse or writer call", async () => {
  const seenWriterInputs: unknown[] = [];
  const authTokenCalls: unknown[] = [];
  const runtimeRoute = loadRouteModule({
    devToolsEnabled: false,
    seenWriterInputs,
    authTokenCalls,
  });
  const blockedRequest = request({
    body: validRouteBody,
    cookie: "trade_auth=expected-token",
  });
  const result = await runtimeRoute.POST(blockedRequest.request);

  expect(result.init.status).toBe(403);
  expect(authTokenCalls).toEqual([]);
  expect(blockedRequest.jsonCallCount()).toBe(0);
  expect(seenWriterInputs).toEqual([]);
  expectTypedEnvelope(result.body);
  expect(result.body).toMatchObject({
    status: "blocked",
    writerResult: null,
    safety: {
      devGatePassed: false,
      authGatePassed: false,
    },
  });
});

test("hard-disabled boundary blocks before auth cookie json parse or writer call", async () => {
  for (const cookie of [null, "trade_auth=wrong-token", "other=expected-token"]) {
    const seenWriterInputs: unknown[] = [];
    const authTokenCalls: unknown[] = [];
    const runtimeRoute = loadRouteModule({
      seenWriterInputs,
      authTokenCalls,
    });
    const blockedRequest = request({
      body: validRouteBody,
      cookie,
    });
    const result = await runtimeRoute.POST(blockedRequest.request);

    expect(result.init.status).toBe(403);
    expect(authTokenCalls).toEqual([]);
    expect(blockedRequest.jsonCallCount()).toBe(0);
    expect(seenWriterInputs).toEqual([]);
    expectTypedEnvelope(result.body);
    expect(result.body).toMatchObject({
      status: "blocked",
      writerResult: null,
      safety: {
        devGatePassed: true,
        authGatePassed: false,
        hardDisabled: true,
        routeCallAllowed: false,
      },
    });
  }
});

test("missing auth env fails closed before json parse or writer call", async () => {
  const seenWriterInputs: unknown[] = [];
  const authTokenCalls: unknown[] = [];
  const runtimeRoute = loadRouteModule({
    appPassword: "",
    seenWriterInputs,
    authTokenCalls,
  });
  const blockedRequest = request({
    body: validRouteBody,
    cookie: "trade_auth=expected-token",
  });
  const result = await runtimeRoute.POST(blockedRequest.request);

  expect(result.init.status).toBe(403);
  expect(authTokenCalls).toEqual([]);
  expect(blockedRequest.jsonCallCount()).toBe(0);
  expect(seenWriterInputs).toEqual([]);
  expectTypedEnvelope(result.body);
  expect(result.body).toMatchObject({
    status: "blocked",
    writerResult: null,
    safety: {
      authGatePassed: false,
      devGatePassed: true,
      hardDisabled: true,
      routeCallAllowed: false,
    },
  });
});

test("malformed json is not parsed while hard-disabled boundary is active", async () => {
  const seenWriterInputs: unknown[] = [];
  const runtimeRoute = loadRouteModule({ seenWriterInputs });
  const malformedRequest = request({
    jsonThrows: true,
    cookie: "trade_auth=expected-token",
    contentType: "application/json",
  });
  const result = await runtimeRoute.POST(malformedRequest.request);

  expect(result.init.status).toBe(403);
  expect(malformedRequest.jsonCallCount()).toBe(0);
  expect(seenWriterInputs).toEqual([]);
  expectTypedEnvelope(result.body);
  expect(result.body).toMatchObject({
    status: "blocked",
    writerResult: null,
    safety: {
      authGatePassed: false,
      devGatePassed: true,
      hardDisabled: true,
      routeCallAllowed: false,
    },
  });
});

test("invalid request shape is not parsed while hard-disabled boundary is active", async () => {
  const invalidBodies = [
    {
      body: null,
      fieldPath: undefined,
    },
    {
      body: { ...validRouteBody, input: null },
      fieldPath: "input",
    },
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
    const invalidRequest = request({
      body: invalidBody.body,
      cookie: "trade_auth=expected-token",
      contentType: "application/json",
    });
    const result = await runtimeRoute.POST(invalidRequest.request);

    expect(result.init.status).toBe(403);
    expect(invalidRequest.jsonCallCount()).toBe(0);
    expect(seenWriterInputs).toEqual([]);
    expectTypedEnvelope(result.body);
    expect(result.body).toMatchObject({
      status: "blocked",
      writerResult: null,
      safety: {
        authGatePassed: false,
        devGatePassed: true,
        hardDisabled: true,
        routeCallAllowed: false,
      },
    });
  }
});

test("valid fixture request remains blocked by hard-disabled boundary", async () => {
  const seenWriterInputs: unknown[] = [];
  const runtimeRoute = loadRouteModule({ seenWriterInputs });
  const validRequest = request({
    body: validRouteBody,
    cookie: "trade_auth=expected-token",
    contentType: "application/json",
  });
  const result = await runtimeRoute.POST(validRequest.request);

  expect(result.init.status).toBe(403);
  expect(validRequest.jsonCallCount()).toBe(0);
  expect(seenWriterInputs).toEqual([]);
  expectTypedEnvelope(result.body);
  expect(result.body).toMatchObject({
    status: "blocked",
    writerResult: null,
    safety: {
      authGatePassed: false,
      devGatePassed: true,
      hardDisabled: true,
      routeCallAllowed: false,
      productionWritePathApproved: false,
      liveSmokeInsertApproved: false,
    },
  });
});

test("writer failures cannot be reached while hard-disabled boundary is active", async () => {
  const runtimeRoute = loadRouteModule({
    writerResult: {
      status: "service_unavailable",
      ok: false,
      inserted: false,
      errorCode: "service_unavailable",
      errorMessage: "mock unavailable",
      warnings: [],
      dryRun: {
        status: "ready",
        wouldWrite: false,
        warnings: [],
      },
      adapterStatus: "service_unavailable",
    },
  });
  const result = await runtimeRoute.POST(
    request({
      body: validRouteBody,
      cookie: "trade_auth=expected-token",
      contentType: "application/json",
    }).request,
  );

  expect(result.init.status).toBe(403);
  expectTypedEnvelope(result.body);
  expect(result.body).toMatchObject({
    status: "blocked",
    writerResult: null,
    safety: {
      authGatePassed: false,
      devGatePassed: true,
      hardDisabled: true,
      routeCallAllowed: false,
      productionWritePathApproved: false,
      liveSmokeInsertApproved: false,
    },
  });
});

test("route auth hardening keeps route literal out of UI runtime and scripts", () => {
  const sourceMatches = ["app", "components", "hooks", "scripts"]
    .map((entry) => join(root, entry))
    .flatMap(listSourceFiles)
    .filter((path) => !path.startsWith(join(root, "app", "api")))
    .filter((path) => read(path).includes(routeLiteral))
    .map((path) => relative(root, path));

  expect(sourceMatches).toEqual([]);
});

test("approved harness remains the only non-route source route literal owner", () => {
  const sourceMatches = ["app", "components", "hooks", "lib", "scripts"]
    .map((entry) => join(root, entry))
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(routeLiteral))
    .map((path) => relative(root, path));

  expect(sourceMatches).toEqual([
    "app/api/execution/audit/writer/route.ts",
    relative(root, harnessPath),
  ]);
});
