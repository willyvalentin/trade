import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = resolve(__dirname, "../..");
const functionPath = "netlify/functions/ai02-nonsecret-preflight.ts";

type Receipt = Record<string, string>;

type LoadedFunction = (request: Request, context: unknown) => Promise<Response>;

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function loadFunction(environment: Record<string, string | undefined>) {
  const transpiled = ts.transpileModule(source(functionPath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: functionPath,
  }).outputText;
  const sandbox = {
    Buffer,
    JSON,
    Netlify: {
      env: {
        get(name: string) {
          return environment[name];
        },
      },
    },
    Request,
    Response,
    exports: {} as Record<string, unknown>,
    require(specifier: string) {
      if (specifier === "node:crypto") {
        return require("node:crypto");
      }
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: functionPath });
  return sandbox.exports.default as LoadedFunction;
}

function deployPreviewContext(context = "deploy-preview") {
  return { deploy: { context } };
}

function authorizedRequest(token = "temporary-proof-token") {
  return new Request("https://preview.example.test/.netlify/functions/ai02-nonsecret-preflight", {
    headers: { "x-ai02-preflight-token": token },
  });
}

test("AI-02.16 returns only an AI-02.15-compatible redacted receipt", async () => {
  const handler = loadFunction({
    AI02_PREFLIGHT_PROOF_TOKEN: "temporary-proof-token",
    AI02_APPLICATION_OWNER_PREFLIGHT_CONFIRMED: "confirmed",
    TWELVE_DATA_API_KEY: "provider-secret-is-never-returned",
  });

  const response = await handler(authorizedRequest(), deployPreviewContext());
  const receipt = (await response.json()) as Receipt;

  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(receipt).toEqual({
    environment: "staging",
    source_relation: "public.recommendation_outcomes",
    existing_source_availability: "no_completed_bundle_available",
    credential_presence: "present",
    application_owner_preflight: "confirmed",
    deploy_preview_transport: "available",
    credential_values: "not_returned",
    credential_names: "not_returned",
    application_owner_identifier: "not_returned",
    deploy_identifier_or_url: "not_returned",
    source_rows: "not_returned",
    staging_connection: "not_opened",
    provider_evaluator: "not_invoked",
    branch_adapter: "not_deployed",
    outcome_persistence: "not_admitted",
    active_evidence_migration: "not_admitted",
    active_evidence_write: "not_admitted",
    offline_dataset: "not_admitted",
    offline_evaluation: "not_admitted",
    runtime_binding: "not_admitted",
    broker_binding: "not_admitted",
    production_binding: "not_admitted",
  });
  expect(JSON.stringify(receipt)).not.toContain("provider-secret-is-never-returned");
  expect(JSON.stringify(receipt)).not.toContain("TWELVE_DATA_API_KEY");
  expect(JSON.stringify(receipt)).not.toContain("temporary-proof-token");
});

test("AI-02.16 fails closed outside a protected deploy preview", async () => {
  const handler = loadFunction({
    AI02_PREFLIGHT_PROOF_TOKEN: "temporary-proof-token",
    AI02_APPLICATION_OWNER_PREFLIGHT_CONFIRMED: "confirmed",
    TWELVE_DATA_API_KEY: "provider-secret-is-never-returned",
  });

  for (const [request, context] of [
    [new Request("https://preview.example.test/.netlify/functions/ai02-nonsecret-preflight", { method: "POST" }), deployPreviewContext()],
    [authorizedRequest("incorrect"), deployPreviewContext()],
    [authorizedRequest(), deployPreviewContext("production")],
  ] as const) {
    const response = await handler(request, context);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found" });
  }
});

test("AI-02.16 preserves unfavorable nonsecret observations without widening scope", async () => {
  const handler = loadFunction({
    AI02_PREFLIGHT_PROOF_TOKEN: "temporary-proof-token",
  });

  const response = await handler(authorizedRequest(), deployPreviewContext());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    credential_presence: "absent",
    application_owner_preflight: "not_confirmed",
    deploy_preview_transport: "available",
    credential_values: "not_returned",
    credential_names: "not_returned",
    application_owner_identifier: "not_returned",
    deploy_identifier_or_url: "not_returned",
    source_rows: "not_returned",
    staging_connection: "not_opened",
    provider_evaluator: "not_invoked",
    branch_adapter: "not_deployed",
    outcome_persistence: "not_admitted",
    active_evidence_migration: "not_admitted",
    active_evidence_write: "not_admitted",
    offline_dataset: "not_admitted",
    offline_evaluation: "not_admitted",
    runtime_binding: "not_admitted",
    broker_binding: "not_admitted",
    production_binding: "not_admitted",
  });
});

test("AI-02.16 contains no transport, database, provider or logging side effect", () => {
  const implementation = source(functionPath);
  expect(implementation).toContain('import type { Config, Context } from "@netlify/functions"');
  expect(implementation).toContain("Netlify.env.get");
  expect(implementation).not.toMatch(/\bfetch\s*\(|@supabase\/supabase-js|\bpg\b|console\.|process\.env/i);
  expect(implementation).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  expect(implementation).not.toContain("NEXT_PUBLIC_SUPABASE_URL");
});
