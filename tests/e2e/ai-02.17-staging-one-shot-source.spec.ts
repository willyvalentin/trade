import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const functionPath = "netlify/functions/ai02-staging-one-shot-source.ts";
const stagingUrlDigest =
  "e47565f4baf37880dd3b5ebf272980c521411e2b7b1533a955c5befb1bd721d1";

type LoadedFunction = (request: Request, context: unknown) => Promise<Response>;
type FetchCall = { url: string; init: RequestInit | undefined };

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function fixedDate(iso: string) {
  return class FixedDate extends Date {
    constructor(value?: string | number | Date) {
      super(value === undefined ? iso : value);
    }

    static now() {
      return new Date(iso).getTime();
    }
  };
}

function loadFunction(input: {
  environment: Record<string, string | undefined>;
  now: string;
  digest?: string;
  fetch: typeof fetch;
}) {
  const transpiled = ts.transpileModule(source(functionPath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: functionPath,
  }).outputText;
  const sandbox = {
    Buffer,
    Date: fixedDate(input.now),
    Intl,
    JSON,
    Map,
    Request,
    Response,
    URL,
    Netlify: { env: { get(name: string) { return input.environment[name]; } } },
    exports: {} as Record<string, unknown>,
    fetch: input.fetch,
    require(specifier: string) {
      if (specifier === "node:crypto") {
        return {
          timingSafeEqual,
          createHash() {
            return {
              update() {
                return {
                  digest() {
                    return input.digest ?? stagingUrlDigest;
                  },
                };
              },
            };
          },
        };
      }
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: functionPath });
  return sandbox.exports.default as LoadedFunction;
}

function environment() {
  return {
    AI02_STAGING_PROOF_TOKEN: "one-shot-token",
    NEXT_PUBLIC_SUPABASE_URL: "https://staging.example.test",
    DEPLOY_PRIME_URL: "https://preview.example.test",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
    AUTOMATION_SECRET: "automation-secret",
    TURE_APPLICATION_OWNER_USER_ID: "0f4a6943-75d5-4414-9a2e-6d9941ac2a7e",
    OPENAI_API_KEY: "present-but-not-invoked",
    TWELVE_DATA_API_KEY: "provider-key-present",
  };
}

function request(token = "one-shot-token") {
  return new Request(
    "https://preview.example.test/.netlify/functions/ai02-staging-one-shot-source",
    {
      method: "POST",
      headers: { "x-ai02-staging-proof-token": token },
    },
  );
}

const deployPreviewContext = { deploy: { context: "deploy-preview" } };

test("AI-02.17 reserves one staging marker then invokes exactly one bounded official scan", async () => {
  const calls: FetchCall[] = [];
  const handler = loadFunction({
    environment: environment(),
    now: "2026-09-07T14:00:00.000Z",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      if (calls.length === 1) return new Response(null, { status: 404 });
      if (calls.length === 2) return new Response(null, { status: 201 });
      if (calls.length === 3) return new Response(null, { status: 201 });
      return Response.json({
        decision: "scanned",
        recommendations_created: 1,
        active_scan_trace: {
          persistence: { snapshots_persisted_count: 1 },
        },
      });
    },
  });

  const response = await handler(request(), deployPreviewContext);
  const receipt = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(receipt).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_source_creation",
    one_shot_consumption: "consumed",
    result: "one_server_owned_snapshot_recorded",
    scan_decision: "scanned",
    recommendations_created: 1,
    snapshots_persisted_count: 1,
    provider_data_access: "official_scan_route_invoked",
    source_rows: "not_returned",
    credential_values: "not_returned",
    provider_payload: "not_returned",
  });
  expect(calls).toHaveLength(4);
  expect(calls[0]?.url).toBe(
    "https://staging.example.test/auth/v1/admin/users/0f4a6943-75d5-4414-9a2e-6d9941ac2a7e",
  );
  expect(calls[1]?.url).toBe(
    "https://staging.example.test/auth/v1/admin/users",
  );
  expect(JSON.parse(String(calls[1]?.init?.body))).toEqual({
    id: "0f4a6943-75d5-4414-9a2e-6d9941ac2a7e",
    email: "ai02-staging-owner-0f4a6943-75d5-4414-9a2e-6d9941ac2a7e@example.invalid",
    email_confirm: true,
  });
  expect(calls[2]?.url).toBe(
    "https://staging.example.test/rest/v1/scheduled_scan_attempts",
  );
  expect(calls[3]?.url).toBe(
    "https://preview.example.test/api/automation/run-scan",
  );
  expect(JSON.parse(String(calls[3]?.init?.body))).toEqual({
    force: true,
    ignore_existing_run: false,
    source: "ai02_staging_one_shot_source",
    scheduled_scan_attempt_fingerprint: "ai02_staging_one_shot_source_v1",
    scheduled_function_fired_at_utc: "2026-09-07T14:00:00.000Z",
    max_tickers: 1,
    max_recommendations: 1,
    skip_openai: true,
    timeout_ms: 25_000,
  });
  expect(JSON.stringify(receipt)).not.toContain("service-role-secret");
  expect(JSON.stringify(receipt)).not.toContain("automation-secret");
});

test("AI-02.17 fails closed before consuming its marker outside the admitted source window", async () => {
  let calls = 0;
  const handler = loadFunction({
    environment: environment(),
    now: "2026-09-07T10:00:00.000Z",
    fetch: async () => {
      calls += 1;
      return new Response(null, { status: 500 });
    },
  });

  const response = await handler(request(), deployPreviewContext);

  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_source_creation",
    one_shot_consumption: "not_consumed",
    result: "source_window_not_admitted",
  });
  expect(calls).toBe(0);
});

test("AI-02.17 cannot replay an already consumed marker or run outside preview", async () => {
  const calls: FetchCall[] = [];
  const handler = loadFunction({
    environment: environment(),
    now: "2026-09-07T14:00:00.000Z",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(null, { status: calls.length === 1 ? 200 : 409 });
    },
  });

  const consumed = await handler(request(), deployPreviewContext);
  expect(consumed.status).toBe(409);
  expect(await consumed.json()).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_source_creation",
    one_shot_consumption: "already_consumed",
    result: "not_executed",
  });
  expect(calls).toHaveLength(2);

  for (const [candidate, context] of [
    [request(""), deployPreviewContext],
    [
      new Request(
        "https://preview.example.test/.netlify/functions/ai02-staging-one-shot-source",
      ),
      deployPreviewContext,
    ],
    [request(), { deploy: { context: "production" } }],
  ] as const) {
    const rejected = await handler(candidate, context);
    expect(rejected.status).toBe(404);
    expect(await rejected.json()).toEqual({ error: "not_found" });
  }
});

test("AI-02.17 rejects a non-staging binding before it touches staging", async () => {
  let calls = 0;
  const handler = loadFunction({
    environment: environment(),
    now: "2026-09-07T14:00:00.000Z",
    digest: "not-the-staging-project",
    fetch: async () => {
      calls += 1;
      return new Response(null, { status: 500 });
    },
  });

  const response = await handler(request(), deployPreviewContext);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_source_creation",
    result: "runtime_prerequisite_unavailable",
    credential_values: "not_returned",
  });
  expect(calls).toBe(0);
});

test("AI-02.17 rejects missing or ambiguous canonical bindings before consuming its marker", async () => {
  let calls = 0;
  const handler = loadFunction({
    environment: {
      ...environment(),
      TWELVE_DATA_API_KEY: undefined,
    },
    now: "2026-09-07T14:00:00.000Z",
    fetch: async () => {
      calls += 1;
      return new Response(null, { status: 500 });
    },
  });

  const response = await handler(request(), deployPreviewContext);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_source_creation",
    result: "runtime_prerequisite_unavailable",
    credential_values: "not_returned",
  });
  expect(calls).toBe(0);

  const ambiguousServiceRole = loadFunction({
    environment: {
      ...environment(),
      SUPABASE_SERVICE_ROLE: "second-service-role-secret",
    },
    now: "2026-09-07T14:00:00.000Z",
    fetch: async () => {
      calls += 1;
      return new Response(null, { status: 500 });
    },
  });
  const ambiguousResponse = await ambiguousServiceRole(
    request(),
    deployPreviewContext,
  );
  expect(ambiguousResponse.status).toBe(503);
  expect(calls).toBe(0);
});

test("AI-02.17 keeps the temporary route server-only and free of runtime or broker bindings", () => {
  const implementation = source(functionPath);
  const scanRoute = source("app/api/automation/run-scan/route.ts");

  expect(implementation).toContain('import type { Config, Context } from "@netlify/functions"');
  expect(implementation).toContain("Netlify.env.get");
  expect(implementation).toContain("/auth/v1/admin/users");
  expect(implementation).toContain("scheduled_scan_attempts");
  expect(implementation).not.toMatch(/console\.|process\.env|broker|production/i);
  expect(scanRoute).toContain("max_recommendations?: unknown");
  expect(scanRoute).toContain("scheduled_max_recommendations");
});
