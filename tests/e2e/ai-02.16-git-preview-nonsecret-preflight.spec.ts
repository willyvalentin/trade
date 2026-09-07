import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const functionPath = "netlify/functions/ai02-nonsecret-preflight.ts";

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
    Netlify: { env: { get(name: string) { return environment[name]; } } },
    Request,
    Response,
    exports: {} as Record<string, unknown>,
    require(specifier: string) {
      if (specifier === "node:crypto") return { timingSafeEqual };
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: functionPath });
  return sandbox.exports.default as LoadedFunction;
}

function request(token = "temporary-proof-token") {
  return new Request("https://preview.example.test/.netlify/functions/ai02-nonsecret-preflight", {
    headers: { "x-ai02-preflight-token": token },
  });
}

const deployPreviewContext = { deploy: { context: "deploy-preview" } };

test("AI-02.16 returns exactly the redacted receipt for one authorized preview GET", async () => {
  const handler = loadFunction({
    AI02_PREFLIGHT_PROOF_TOKEN: "temporary-proof-token",
    AI02_APPLICATION_OWNER_PREFLIGHT_CONFIRMED: "confirmed",
    TWELVE_DATA_API_KEY: "provider-secret-is-never-returned",
  });

  const response = await handler(request(), deployPreviewContext);
  const receipt = await response.json();

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
});

test("AI-02.16 fails closed for an empty token, non-GET or non-preview context", async () => {
  const handler = loadFunction({ AI02_PREFLIGHT_PROOF_TOKEN: "temporary-proof-token" });
  for (const [candidate, context] of [
    [request(""), deployPreviewContext],
    [new Request("https://preview.example.test/.netlify/functions/ai02-nonsecret-preflight", { method: "POST" }), deployPreviewContext],
    [request(), { deploy: { context: "production" } }],
  ] as const) {
    const response = await handler(candidate, context);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found" });
  }
});

test("AI-02.16 contains no database, provider, transport or logging side effect", () => {
  const implementation = source(functionPath);
  expect(implementation).toContain('import type { Config, Context } from "@netlify/functions"');
  expect(implementation).toContain("Netlify.env.get");
  expect(implementation).not.toMatch(/\bfetch\s*\(|@supabase\/supabase-js|\bpg\b|console\.|process\.env/i);
  expect(implementation).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
});
