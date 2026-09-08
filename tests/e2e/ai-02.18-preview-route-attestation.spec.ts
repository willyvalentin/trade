import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const functionPath = "netlify/functions/ai02-preview-route-attestation.ts";

type LoadedFunction = (request: Request, context: unknown) => Promise<Response>;

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function loadFunction(token: string | undefined) {
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
    Request,
    Response,
    Netlify: { env: { get() { return token; } } },
    exports: {} as Record<string, unknown>,
    require(specifier: string) {
      if (specifier === "node:crypto") return { timingSafeEqual };
      throw new Error(`unexpected import: ${specifier}`);
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: functionPath });
  return sandbox.exports.default as LoadedFunction;
}

function request(token = "preview-attestation-token", method = "POST") {
  return new Request(
    "https://deploy-preview-999--trade-vl.netlify.app/api/diagnostics/ai02-preview-route-attestation",
    { method, headers: { "x-ai02-preview-attestation-token": token } },
  );
}

const previewContext = {
  deploy: { context: "deploy-preview" },
  site: { name: "trade-vl" },
};

test("AI-02.18 returns one fixed receipt only for its protected expected preview", async () => {
  const response = await loadFunction("preview-attestation-token")(
    request(),
    previewContext,
  );

  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual({
    environment: "staging",
    operation: "ai02_preview_route_attestation",
    result: "preview_route_attested",
    credential_values: "not_returned",
    database_activity: "not_performed",
    provider_data_access: "not_performed",
    application_runtime_binding: "not_performed",
  });
});

test("AI-02.18 hides its route on wrong method, token, context, site, or absent secret", async () => {
  const handler = loadFunction("preview-attestation-token");
  const candidates: Array<[Request, unknown]> = [
    [request("wrong-token"), previewContext],
    [request("", "GET"), previewContext],
    [request(), { ...previewContext, deploy: { context: "production" } }],
    [request(), { ...previewContext, site: { name: "another-site" } }],
  ];

  for (const [candidateRequest, candidateContext] of candidates) {
    const response = await handler(candidateRequest, candidateContext);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found" });
  }

  const missingSecret = await loadFunction(undefined)(request(), previewContext);
  expect(missingSecret.status).toBe(404);
  expect(await missingSecret.json()).toEqual({ error: "not_found" });
});

test("AI-02.18 has no data, provider, scan, or application-route capability", () => {
  const implementation = source(functionPath);

  expect(implementation).toContain(
    'path: "/api/diagnostics/ai02-preview-route-attestation"',
  );
  expect(implementation).toContain('Netlify.env.get("AI02_PREVIEW_ATTESTATION_TOKEN")');
  expect(implementation).not.toMatch(
    /fetch\s*\(|process\.env|SUPABASE|scheduled_scan|run-scan|recommendation|polygon|twelve|openai|broker/i,
  );
});
