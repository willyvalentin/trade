import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditWriterRouteInvocationHarnessResult,
} from "../../lib/server/execution-record-audit-writer-route-invocation-harness";

const root = process.cwd();
const harnessPath = join(
  root,
  "lib/server/execution-record-audit-writer-route-invocation-harness.ts",
);
const routePath = join(root, "app/api/execution/audit/writer/route.ts");
const routeLiteral = "/api/execution/audit/writer";
const routeContractVersion =
  "execution_record_audit_writer_route_boundary_v1";
const writerContractVersion =
  "execution_record_audit_writer_server_only_contract_v1";

type RuntimeHarnessModule = {
  buildExecutionRecordAuditWriterRouteInvocationFixture: () => unknown;
  invokeExecutionRecordAuditWriterRouteHarness: (input: {
    routeHandler: (request: Request) => Promise<Response>;
    explicitTrigger?: boolean;
    invocationMode?: string;
    payloadSource?: string;
    routeHandlerProvenance?: string;
    authCookieValue?: string | null;
    productionWritePathApproved?: boolean;
    liveSmokeInsertApproved?: boolean;
  }) => Promise<ExecutionRecordAuditWriterRouteInvocationHarnessResult>;
};

type RuntimeRouteModule = {
  POST: (request: Request) => Promise<Response>;
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

function loadHarnessModule(): RuntimeHarnessModule {
  const source = read(harnessPath).replace('import "server-only";', "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: harnessPath,
  }).outputText;
  const sandbox = {
    Request,
    exports: {} as Partial<RuntimeHarnessModule>,
    require: (specifier: string) => {
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

  vm.runInNewContext(transpiled, sandbox, { filename: harnessPath });

  return sandbox.exports as RuntimeHarnessModule;
}

function loadRouteModule(input: {
  devToolsEnabled?: boolean;
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
    Response,
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
            json: (body: unknown, init: { status?: number } = {}) =>
              Response.json(body, init),
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

            return {
              status: "success",
              ok: true,
              inserted: true,
              auditEventId: "33333333-3333-4333-8333-333333333333",
              executionRecordId: "11111111-1111-4111-8111-111111111111",
              idempotencyKey:
                "execution-record-audit:route-invocation-harness",
              row: {},
              warnings: [],
              dryRun: {
                status: "ready",
                wouldWrite: false,
                wouldInsert: {},
                executionRecordId: "11111111-1111-4111-8111-111111111111",
                eventType: "execution_record_created",
                eventSource: "route_invocation_harness_fixture",
                sourceSystem: "trade_app",
                requestId: "route-invocation-harness-request",
                idempotencyKey:
                  "execution-record-audit:route-invocation-harness",
                warnings: [],
              },
              adapterStatus: "success",
            };
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

test("route invocation harness is server-only and has no live route or Supabase dependency", () => {
  const source = read(harnessPath);

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("invokeExecutionRecordAuditWriterRouteHarness");
  expect(source).toContain("routeHandlerInjected: true");
  expect(source).toContain("routeHandlerMustBeMocked: true");
  expect(source).toContain("fixturePayloadOnly: true");
  expect(source).toContain("normalAppRuntimeRouteCallAdded: false");

  expect(source).not.toContain("next/server");
  expect(source).not.toContain("next/navigation");
  expect(source).not.toContain("react");
  expect(source).not.toContain("use client");
  expect(source).not.toContain("createClient");
  expect(source).not.toContain("getServerSupabaseClient");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain(".select(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toContain("SUPABASE_SERVICE_ROLE");
  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
});

test("route invocation harness constructs only local Request objects without network fetch", () => {
  const source = read(harnessPath);

  expect(source).toContain("new Request(");
  expect(source).toContain("`http://localhost${");
  expect(source).toContain("await input.routeHandler(request)");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("await POST(");
  expect(source).not.toContain("import { POST");
});

test("route invocation harness builds only fixture route payloads", () => {
  const harness = loadHarnessModule();
  const fixture =
    harness.buildExecutionRecordAuditWriterRouteInvocationFixture() as {
      routeContractVersion: string;
      writerContractVersion: string;
      routePath: string;
      method: string;
      input: {
        source: { eventSource: string };
        payload: { status: string };
        metadata: {
          fixtureOnly: boolean;
          liveSmokeInsertApproved: boolean;
          productionWritePathApproved: boolean;
        };
      };
    };

  expect(fixture).toMatchObject({
    routeContractVersion,
    writerContractVersion,
    routePath: routeLiteral,
    method: "POST",
  });
  expect(fixture.input.source.eventSource).toBe(
    "route_invocation_harness_fixture",
  );
  expect(fixture.input.payload.status).toBe("fixture_only");
  expect(fixture.input.metadata).toEqual({
    fixtureOnly: true,
    liveSmokeInsertApproved: false,
    productionWritePathApproved: false,
  });
});

test("route invocation harness blocks non-explicit non-fixture or non-mocked invocation without calling route", async () => {
  const harness = loadHarnessModule();
  let routeCallCount = 0;
  const routeHandler = async () => {
    routeCallCount += 1;
    return Response.json({ status: "unexpected" }, { status: 500 });
  };
  const blockedInputs = [
    {
      explicitTrigger: false,
      invocationMode: "dev_manual_test_only",
      payloadSource: "fixture",
      routeHandlerProvenance: "test_vm_mocked_route",
    },
    {
      explicitTrigger: true,
      invocationMode: "automatic",
      payloadSource: "fixture",
      routeHandlerProvenance: "test_vm_mocked_route",
    },
    {
      explicitTrigger: true,
      invocationMode: "dev_manual_test_only",
      payloadSource: "runtime",
      routeHandlerProvenance: "test_vm_mocked_route",
    },
    {
      explicitTrigger: true,
      invocationMode: "dev_manual_test_only",
      payloadSource: "fixture",
      routeHandlerProvenance: "unknown",
    },
    {
      explicitTrigger: true,
      invocationMode: "dev_manual_test_only",
      payloadSource: "fixture",
      routeHandlerProvenance: "test_vm_mocked_route",
      liveSmokeInsertApproved: true,
    },
    {
      explicitTrigger: true,
      invocationMode: "dev_manual_test_only",
      payloadSource: "fixture",
      routeHandlerProvenance: "test_vm_mocked_route",
      productionWritePathApproved: true,
    },
    {
      invocationMode: "dev_manual_test_only",
      payloadSource: "fixture",
      routeHandlerProvenance: "test_vm_mocked_route",
    },
    {
      explicitTrigger: true,
      payloadSource: "fixture",
      routeHandlerProvenance: "test_vm_mocked_route",
    },
    {
      explicitTrigger: true,
      invocationMode: "dev_manual_test_only",
      routeHandlerProvenance: "test_vm_mocked_route",
    },
    {
      explicitTrigger: true,
      invocationMode: "dev_manual_test_only",
      payloadSource: "fixture",
    },
  ];

  for (const input of blockedInputs) {
    const result = await harness.invokeExecutionRecordAuditWriterRouteHarness({
      routeHandler,
      ...input,
    });

    expect(result.status).toBe("blocked");
    expect(result.ok).toBe(false);
    expect(result.routeStatus).toBeNull();
    expect(result.routeResponse).toBeNull();
    expect(result.safety).toMatchObject({
      explicitTriggerOnly: true,
      fixturePayloadOnly: true,
      routeHandlerMustBeMocked: true,
      productionWritePathApproved: false,
      liveSmokeInsertApproved: false,
      routeGateBypassAllowed: false,
    });
  }

  expect(routeCallCount).toBe(0);
});

test("route invocation harness invokes mocked route and preserves dev and auth gate behavior", async () => {
  const harness = loadHarnessModule();
  const route = loadRouteModule({});
  const devBlockedRoute = loadRouteModule({ devToolsEnabled: false });
  const seenWriterInputs: unknown[] = [];
  const routeWithSeenWriterInput = loadRouteModule({ seenWriterInputs });
  const devBlocked = await harness.invokeExecutionRecordAuditWriterRouteHarness({
    routeHandler: devBlockedRoute.POST,
    explicitTrigger: true,
    invocationMode: "dev_manual_test_only",
    payloadSource: "fixture",
    routeHandlerProvenance: "test_vm_mocked_route",
    authCookieValue: "expected-token",
  });
  const missingAuth = await harness.invokeExecutionRecordAuditWriterRouteHarness({
    routeHandler: route.POST,
    explicitTrigger: true,
    invocationMode: "dev_manual_test_only",
    payloadSource: "fixture",
    routeHandlerProvenance: "test_vm_mocked_route",
  });
  const accepted = await harness.invokeExecutionRecordAuditWriterRouteHarness({
    routeHandler: routeWithSeenWriterInput.POST,
    explicitTrigger: true,
    invocationMode: "dev_manual_test_only",
    payloadSource: "fixture",
    routeHandlerProvenance: "test_vm_mocked_route",
    authCookieValue: "expected-token",
  });

  expect(devBlocked).toMatchObject({
    status: "invoked",
    ok: true,
    routeStatus: 403,
    routeResponse: {
      status: "blocked",
      writerResult: null,
      safety: {
        authGatePassed: false,
        devGatePassed: false,
      },
    },
  });
  expect(missingAuth).toMatchObject({
    status: "invoked",
    ok: true,
    routeStatus: 401,
    routeResponse: {
      status: "blocked",
      writerResult: null,
      safety: {
        authGatePassed: false,
        devGatePassed: true,
      },
    },
  });
  expect(accepted).toMatchObject({
    status: "invoked",
    ok: true,
    routeStatus: 201,
    routeResponse: {
      status: "accepted",
      routePath: routeLiteral,
      writerResult: {
        status: "success",
        inserted: true,
      },
      safety: {
        authGatePassed: true,
        devGatePassed: true,
        serverOnly: true,
        uiWiringAdded: false,
        browserClientInvocationAllowed: false,
        productionWritePathApproved: false,
        liveSmokeInsertApproved: false,
        updateDeleteUpsertSelectAllowed: false,
        tradeStatsPnlMutationAllowed: false,
      },
    },
  });
  expect(seenWriterInputs).toHaveLength(1);
});

test("route invocation harness preserves typed route response envelope", async () => {
  const harness = loadHarnessModule();
  const route = loadRouteModule({});
  const result = await harness.invokeExecutionRecordAuditWriterRouteHarness({
    routeHandler: route.POST,
    explicitTrigger: true,
    invocationMode: "dev_manual_test_only",
    payloadSource: "fixture",
    routeHandlerProvenance: "test_vm_mocked_route",
    authCookieValue: "expected-token",
  });

  expect(result).toMatchObject({
    status: "invoked",
    ok: true,
    targetRoute: routeLiteral,
    routeStatus: 201,
    safety: {
      serverOnly: true,
      explicitTriggerOnly: true,
      fixturePayloadOnly: true,
      devManualTestOnly: true,
      preservesRouteDevGate: true,
      preservesRouteAuthGate: true,
      routeGateBypassAllowed: false,
      productionWritePathApproved: false,
      liveSmokeInsertApproved: false,
    },
    routeResponse: {
      routeContractVersion,
      writerContractVersion,
      routePath: routeLiteral,
      method: "POST",
      status: "accepted",
      validationErrors: [],
      writerResult: {
        status: "success",
      },
    },
  });
});

test("route invocation harness is absent from UI hooks app runtime and scripts", () => {
  const harnessImport = "execution-record-audit-writer-route-invocation-harness";
  const appRuntimeMatches = listSourceFiles(join(root, "app"))
    .filter((path) => !path.startsWith(join(root, "app", "api")))
    .filter((path) => read(path).includes(harnessImport))
    .map((path) => relative(root, path));
  const uiMatches = ["components", "hooks", "scripts"]
    .map((entry) => join(root, entry))
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(harnessImport))
    .map((path) => relative(root, path));

  expect(appRuntimeMatches).toEqual([]);
  expect(uiMatches).toEqual([]);
});

test("route invocation harness route literal is limited to approved server-only source and tests docs", () => {
  const sourceMatches = ["app", "components", "hooks", "lib", "scripts"]
    .map((entry) => join(root, entry))
    .flatMap(listSourceFiles)
    .filter((path) => read(path).includes(routeLiteral))
    .map((path) => relative(root, path));

  expect(sourceMatches).toEqual([
    "app/api/execution/audit/writer/route.ts",
    "lib/server/execution-record-audit-writer-route-invocation-harness.ts",
  ]);
});

test("route invocation harness documents no production path or live smoke authority", () => {
  const source = read(harnessPath);

  for (const expectedFalseFlag of [
    "productionUiAdded: false",
    "browserClientRuntimePathAdded: false",
    "normalAppRuntimeRouteCallAdded: false",
    "automaticInvocationAllowed: false",
    "marketLoopInvocationAllowed: false",
    "liveSmokeInsertApproved: false",
    "productionWritePathApproved: false",
    "externalExecutionBehaviorAllowed: false",
    "automaticModeAllowed: false",
    "tradeStatsPnlMutationAllowed: false",
    "routeGateBypassAllowed: false",
  ]) {
    expect(source).toContain(expectedFalseFlag);
  }
});
