import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import { GET } from "../../app/api/runtime-health/ping/route";

const repoRoot = process.cwd();
const routePath = join(repoRoot, "app/api/runtime-health/ping/route.ts");
const docPath = join(repoRoot, "docs/action-360-runtime-ping-only-route-implementation.md");
const verifierPath = join(
  repoRoot,
  "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs",
);

const expectedBody = {
  ok: true,
  route_ping: true,
  route_build_marker: "action_344_future_runtime_ping_only_route",
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  replay_executed: false,
  synthetic_outcomes_persisted: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  recommendation_rows_mutated: false,
  runtime_route_scope: "ping_only",
  deploy_readiness_required: true,
};

const expectedText = JSON.stringify(expectedBody);

function readEnvValue(name: string) {
  const env = readFileSync(join(repoRoot, ".env.local"), "utf8");
  const line = env
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${name}=`));
  if (!line) return "";
  return line
    .slice(line.indexOf("=") + 1)
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

function authHeaders() {
  const password = readEnvValue("TRADE_APP_PASSWORD");
  if (!password) {
    throw new Error("TRADE_APP_PASSWORD is required for authenticated localhost route traversal");
  }
  const token = createHash("sha256").update(`trade-auth:${password}`).digest("hex");
  return { cookie: `trade_auth=${token}` };
}

function runVerifier(script: string) {
  return execFileSync("node", [script], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "provider-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      NEWS_API_KEY: "news-secret-that-must-not-appear",
    },
  });
}

test("route source is the exact one-file zero-import GET implementation", () => {
  const source = readFileSync(routePath, "utf8");

  expect(existsSync(routePath)).toBe(true);
  expect((source.match(/export function GET\(\)/g) ?? [])).toHaveLength(1);
  expect((source.match(/export\s+(?:async\s+)?function\s+[A-Z]+/g) ?? [])).toHaveLength(1);
  expect(source).not.toMatch(/^\s*import\s/m);
  expect(source).toContain("return new Response(JSON.stringify(body)");
  expect(source).toContain('"Content-Type": "application/json; charset=utf-8"');
  expect(source).toContain('"Cache-Control": "no-store, max-age=0"');
});

test("route source contains no dynamic external or service behavior", () => {
  const source = readFileSync(routePath, "utf8");

  for (const marker of [
    ["process", ".env"].join(""),
    ["Date", ".now"].join(""),
    ["new ", "Date"].join(""),
    ["performance", ".now"].join(""),
    ["Math", ".random"].join(""),
    "randomUUID",
    "crypto",
    ["fetch", "("].join(""),
    "readFile",
    "writeFile",
    "setTimeout",
    "setInterval",
    ["console", "."].join(""),
    "@supabase",
    "next/server",
  ]) {
    expect(source).not.toContain(marker);
  }
});

test("native handler returns exact deterministic body status and headers", async () => {
  const first = GET();
  const second = GET();
  const firstText = await first.text();
  const secondText = await second.text();

  expect(first.status).toBe(200);
  expect(first.headers.get("content-type")).toBe("application/json; charset=utf-8");
  expect(first.headers.get("cache-control")).toBe("no-store, max-age=0");
  expect([...first.headers.keys()].sort()).toEqual(["cache-control", "content-type"]);
  expect(firstText).toBe(expectedText);
  expect(secondText).toBe(expectedText);
  expect(JSON.parse(firstText)).toEqual(expectedBody);
  expect(Object.keys(JSON.parse(firstText))).toEqual(Object.keys(expectedBody));
});

test("Action 360 documentation records blocked deployment and runtime trust", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("implementation_status: implemented_locally");
  expect(doc).toContain("deployment_approved: false");
  expect(doc).toContain("preview_deployment_approved: false");
  expect(doc).toContain("production_deployment_approved: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("Local implementation and local test success do not establish Netlify runtime trust");
});

test("Action 360 changes no runtime surface beyond the approved route", () => {
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const appChanges = status
    .split("\n")
    .filter((line) => line.slice(3).startsWith("app/"));

  const committedAppChanges = execFileSync(
    "git",
    ["diff", "--name-only", "51aced66782ec9a37cd358238f02b6f5c0ae97bd..HEAD", "--", "app"],
    { cwd: process.cwd(), encoding: "utf8" },
  ).trim().split("\n").filter(Boolean);
  expect(
    appChanges.join("\n") === "?? app/api/runtime-health/ping/route.ts" ||
      (appChanges.length === 0 && committedAppChanges.join("\n") === "app/api/runtime-health/ping/route.ts"),
  ).toBe(true);
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts$/m);
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)$/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml$/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
});

test("Action 360 verifier passes with no external effects", () => {
  const output = runVerifier(
    "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs",
  );
  const result = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(result.verification_status).toBe("passed");
  expect(result.implementation_status).toBe("implemented_locally");
  expect(result.exact_route_source_found).toBe(true);
  expect(result.exactly_one_runtime_file_found).toBe(true);
  expect(result.exactly_one_get_export_found).toBe(true);
  expect(result.no_imports_found).toBe(true);
  expect(result.native_response_found).toBe(true);
  expect(result.exact_response_and_field_order_found).toBe(true);
  expect(result.exact_headers_found).toBe(true);
  expect(result.no_extra_application_headers_found).toBe(true);
  expect(result.no_external_or_shared_service_references_found).toBe(true);
  expect(result.action_359_approved_boundary_found).toBe(true);
  expect(result.deployment_approved).toBe(false);
  expect(result.main_push_allowed).toBe(false);
  expect(result.no_effect_flags.provider_call_executed).toBe(false);
  expect(result.no_effect_flags.supabase_read_executed).toBe(false);
  expect(result.no_effect_flags.supabase_write_executed).toBe(false);
  expect(result.no_effect_flags.persisted_data).toBe(false);
  expect(result.no_effect_flags.replay_executed).toBe(false);
  expect(result.no_effect_flags.scanner_behavior_changed).toBe(false);
});

test("localhost GET returns the exact frozen response repeatedly", async ({ request }) => {
  const headers = authHeaders();
  const first = await request.get("/api/runtime-health/ping", { headers });
  const second = await request.get("/api/runtime-health/ping", { headers });

  expect(first.status()).toBe(200);
  expect(first.headers()["content-type"]).toBe("application/json; charset=utf-8");
  expect(first.headers()["cache-control"]).toBe("no-store, max-age=0");
  expect(await first.text()).toBe(expectedText);
  expect(await second.text()).toBe(expectedText);
});

test("localhost unsupported POST and PUT remain framework handled", async ({ request }) => {
  const headers = authHeaders();
  const post = await request.post("/api/runtime-health/ping", { headers });
  const put = await request.put("/api/runtime-health/ping", { headers });

  expect(post.status()).toBe(405);
  expect(put.status()).toBe(405);
  expect(await post.text()).not.toBe(expectedText);
  expect(await put.text()).not.toBe(expectedText);
});

test("upstream approval readiness safety golden and package verifiers pass", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
    "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
    "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
    "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
    "scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  const results = scripts.map((script) => JSON.parse(runVerifier(script)));
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
