import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const functionPath = "netlify/functions/ai02-staging-one-shot-outcome.ts";
const stagingUrlDigest =
  "e47565f4baf37880dd3b5ebf272980c521411e2b7b1533a955c5befb1bd721d1";
const ownerId = "0f4a6943-75d5-4414-9a2e-6d9941ac2a7e";

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
    JSON,
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
    AI02_STAGING_PROOF_TOKEN: "proof-token",
    NEXT_PUBLIC_SUPABASE_URL: "https://staging.example.test",
    DEPLOY_PRIME_URL: "https://deploy-preview-397--trade-vl.netlify.app",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
    AUTOMATION_SECRET: "automation-secret",
    TURE_APPLICATION_OWNER_USER_ID: ownerId,
    TWELVE_DATA_API_KEY: "provider-key-present",
  };
}

function request(token = "proof-token") {
  return new Request(
    "https://preview.example.test/.netlify/functions/ai02-staging-one-shot-outcome",
    {
      method: "POST",
      headers: { "x-ai02-staging-proof-token": token },
    },
  );
}

const deployPreviewContext = { deploy: { context: "deploy-preview" } };
const matureSource = {
  batch_fingerprint: "internal-batch-fingerprint",
  scheduled_function_fired_at: "2026-09-07T12:00:00.000Z",
  recommendations_created: 1,
};

test("AI-02.18 evaluates one mature exact source with one provider candle", async () => {
  const calls: FetchCall[] = [];
  const handler = loadFunction({
    environment: environment(),
    now: "2026-09-07T13:01:00.000Z",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      if (calls.length === 1) return Response.json([matureSource]);
      if (calls.length === 2) return new Response(null, { status: 201 });
      return Response.json({
        status: "completed",
        horizons: ["15m", "30m", "60m"],
        evaluated_snapshot_count: 1,
        persisted_outcome_count: 3,
        candle_requests_executed: 1,
        unique_candle_requests_count: 1,
      });
    },
  });

  const response = await handler(request(), deployPreviewContext);
  const receipt = await response.json();

  expect(response.status).toBe(200);
  expect(receipt).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_outcome_evaluation",
    one_shot_consumption: "consumed",
    result: "one_complete_server_owned_outcome_bundle_recorded",
    evaluation_status: "completed",
    evaluated_snapshots_count: 1,
    persisted_outcomes_count: 3,
    provider_candle_requests_executed: 1,
    unique_candle_requests_count: 1,
    horizons: ["15m", "30m", "60m"],
    source_rows: "not_returned",
    credential_values: "not_returned",
    provider_payload: "not_returned",
  });
  expect(calls).toHaveLength(3);
  expect(calls[0]?.url).toContain("scheduled_scan_attempts");
  expect(calls[1]?.url).toBe(
    "https://staging.example.test/rest/v1/scheduled_scan_attempts",
  );
  expect(calls[2]?.url).toBe(
    "https://deploy-preview-397--trade-vl.netlify.app/api/recommendations/evaluate-outcomes",
  );
  expect(JSON.parse(String(calls[2]?.init?.body))).toEqual({
    mode: "official_live_today",
    batch_fingerprint: "internal-batch-fingerprint",
    horizons: ["15m", "30m", "60m"],
    max_batches: 1,
    max_snapshots: 1,
    max_candle_requests: 1,
  });
  expect(JSON.stringify(receipt)).not.toContain("internal-batch-fingerprint");
  expect(JSON.stringify(receipt)).not.toContain("service-role-secret");
  expect(JSON.stringify(receipt)).not.toContain("automation-secret");
});

test("AI-02.18 rejects an upstream receipt that exceeds either one-candle bound", async () => {
  for (const overBudgetReceipt of [
    { candle_requests_executed: 2, unique_candle_requests_count: 1 },
    { candle_requests_executed: 1, unique_candle_requests_count: 2 },
  ]) {
    let calls = 0;
    const handler = loadFunction({
      environment: environment(),
      now: "2026-09-07T13:01:00.000Z",
      fetch: async () => {
        calls += 1;
        if (calls === 1) return Response.json([matureSource]);
        if (calls === 2) return new Response(null, { status: 201 });
        return Response.json({
          status: "completed",
          horizons: ["15m", "30m", "60m"],
          evaluated_snapshot_count: 1,
          persisted_outcome_count: 3,
          ...overBudgetReceipt,
          provider_payload: { should_not_be_returned: true },
        });
      },
    });

    const response = await handler(request(), deployPreviewContext);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      environment: "staging",
      operation: "ai02_one_shot_outcome_evaluation",
      one_shot_consumption: "consumed",
      result: "bounded_receipt_rejected",
      route_status_class: "2xx",
      source_rows: "not_returned",
      credential_values: "not_returned",
      provider_payload: "not_returned",
    });
    expect(calls).toBe(3);
  }
});

test("AI-02.18 does not consume its outcome marker before the source reaches 60 minutes", async () => {
  let calls = 0;
  const handler = loadFunction({
    environment: environment(),
    now: "2026-09-07T12:59:59.000Z",
    fetch: async () => {
      calls += 1;
      return Response.json([matureSource]);
    },
  });

  const response = await handler(request(), deployPreviewContext);

  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_outcome_evaluation",
    one_shot_consumption: "not_consumed",
    result: "source_outcomes_not_mature",
  });
  expect(calls).toBe(1);
});

test("AI-02.18 does not consume its outcome marker for incomplete or unavailable source evidence", async () => {
  for (const sourceResponse of [
    Response.json([{ ...matureSource, recommendations_created: 0 }]),
    new Response(null, { status: 503 }),
  ]) {
    let calls = 0;
    const handler = loadFunction({
      environment: environment(),
      now: "2026-09-07T13:01:00.000Z",
      fetch: async () => {
        calls += 1;
        return sourceResponse;
      },
    });

    const result = await handler(request(), deployPreviewContext);

    expect(result.status).toBe(sourceResponse.status === 503 ? 503 : 409);
    expect(await result.json()).toEqual({
      environment: "staging",
      operation: "ai02_one_shot_outcome_evaluation",
      one_shot_consumption: "not_consumed",
      result: "source_bundle_not_ready",
    });
    expect(calls).toBe(1);
  }
});

test("AI-02.18 cannot replay its outcome marker or use another deploy context", async () => {
  const calls: FetchCall[] = [];
  const handler = loadFunction({
    environment: environment(),
    now: "2026-09-07T13:01:00.000Z",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      if (calls.length === 1) return Response.json([matureSource]);
      return new Response(null, { status: 409 });
    },
  });

  const consumed = await handler(request(), deployPreviewContext);
  expect(consumed.status).toBe(409);
  expect(await consumed.json()).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_outcome_evaluation",
    one_shot_consumption: "already_consumed",
    result: "not_executed",
  });
  expect(calls).toHaveLength(2);

  for (const [candidate, context] of [
    [request(""), deployPreviewContext],
    [
      new Request(
        "https://preview.example.test/.netlify/functions/ai02-staging-one-shot-outcome",
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

test("AI-02.18 fails closed when its staging or provider prerequisites are absent", async () => {
  let calls = 0;
  const missingProvider = loadFunction({
    environment: { ...environment(), TWELVE_DATA_API_KEY: undefined },
    now: "2026-09-07T13:01:00.000Z",
    fetch: async () => {
      calls += 1;
      return new Response(null, { status: 500 });
    },
  });

  const missingProviderResponse = await missingProvider(
    request(),
    deployPreviewContext,
  );
  expect(missingProviderResponse.status).toBe(503);
  expect(calls).toBe(0);

  const wrongProject = loadFunction({
    environment: environment(),
    now: "2026-09-07T13:01:00.000Z",
    digest: "not-the-staging-project",
    fetch: async () => {
      calls += 1;
      return new Response(null, { status: 500 });
    },
  });
  const wrongProjectResponse = await wrongProject(request(), deployPreviewContext);
  expect(wrongProjectResponse.status).toBe(503);
  expect(calls).toBe(0);

  const ambiguousServiceRole = loadFunction({
    environment: {
      ...environment(),
      SUPABASE_SERVICE_ROLE: "second-service-role-secret",
    },
    now: "2026-09-07T13:01:00.000Z",
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

  const nonNetlifyPreview = loadFunction({
    environment: {
      ...environment(),
      DEPLOY_PRIME_URL: "https://preview.example.test",
    },
    now: "2026-09-07T13:01:00.000Z",
    fetch: async () => {
      calls += 1;
      return new Response(null, { status: 500 });
    },
  });
  const nonNetlifyPreviewResponse = await nonNetlifyPreview(
    request(),
    deployPreviewContext,
  );
  expect(nonNetlifyPreviewResponse.status).toBe(503);
  expect(await nonNetlifyPreviewResponse.json()).toEqual({
    environment: "staging",
    operation: "ai02_one_shot_outcome_evaluation",
    result: "runtime_prerequisite_unavailable",
    credential_values: "not_returned",
  });
  expect(calls).toBe(0);
});

test("AI-02.18 remains a temporary server-only adapter with fixed bounds", () => {
  const implementation = source(functionPath);

  expect(implementation).toContain('import type { Config, Context } from "@netlify/functions"');
  expect(implementation).toContain("Netlify.env.get");
  expect(implementation).toContain("scheduled_scan_attempts");
  expect(implementation).toContain("max_batches: 1");
  expect(implementation).toContain("max_snapshots: 1");
  expect(implementation).toContain("max_candle_requests: 1");
  expect(implementation).not.toMatch(/console\.|process\.env|broker|production/i);
});
