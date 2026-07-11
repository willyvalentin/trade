import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import { GET } from "../../app/api/runtime-health/ping/route";

const root = process.cwd();
const routePath = join(root, "app/api/runtime-health/ping/route.ts");
const docPath = join(
  root,
  "docs/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review.md",
);
const verifierPath =
  "scripts/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review-verify.mjs";
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
  const env = readFileSync(join(root, ".env.local"), "utf8");
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
  if (!password) throw new Error("TRADE_APP_PASSWORD is required for local proxy traversal");
  const token = createHash("sha256").update(`trade-auth:${password}`).digest("hex");
  return { cookie: `trade_auth=${token}` };
}

function runVerifier(script: string) {
  return JSON.parse(
    execFileSync("node", [script], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
        TWELVE_DATA_API_KEY: "provider-secret-that-must-not-appear",
        SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      },
    }),
  );
}

test("review documentation records ready-only-for-a-separate-preview gate", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("readiness_vocabulary: ready | ready_with_conditions | blocked");
  expect(doc).toContain("readiness_decision: ready");
  expect(doc).toContain("Decision: `ready`");
  expect(doc).toContain("separate preview-deploy approval gate may be created");
  expect(doc).toContain("It does not approve preview deployment");
  expect(doc).toContain("Failed conditions: none");
});

test("exact route integrity and one-file boundary remain intact", () => {
  const source = readFileSync(routePath, "utf8");
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: root,
    encoding: "utf8",
  });
  const appChanges = status
    .split("\n")
    .filter((line) => line.slice(3).startsWith("app/"));

  const committedAppChanges = execFileSync(
    "git",
    ["diff", "--name-only", "51aced66782ec9a37cd358238f02b6f5c0ae97bd..HEAD", "--", "app"],
    { cwd: root, encoding: "utf8" },
  ).trim().split("\n").filter(Boolean);
  expect(
    appChanges.join("\n") === "?? app/api/runtime-health/ping/route.ts" ||
      (appChanges.length === 0 && committedAppChanges.join("\n") === "app/api/runtime-health/ping/route.ts"),
  ).toBe(true);
  expect(source).not.toMatch(/^\s*import\s/m);
  expect((source.match(/export function GET\(\)/g) ?? [])).toHaveLength(1);
  expect((source.match(/export\s+(?:async\s+)?function\s+[A-Z]+/g) ?? [])).toHaveLength(1);
  expect(source).toContain("return new Response(JSON.stringify(body)");
  expect(source).toContain('"Content-Type": "application/json; charset=utf-8"');
  expect(source).toContain('"Cache-Control": "no-store, max-age=0"');
});

test("route contains no dynamic external environment or service behavior", () => {
  const source = readFileSync(routePath, "utf8");
  for (const marker of [
    ["process", ".env"].join(""),
    ["Date", ".now"].join(""),
    ["new ", "Date"].join(""),
    ["performance", ".now"].join(""),
    ["Math", ".random"].join(""),
    "randomUUID",
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

test("direct handler evidence confirms exact deterministic response", async () => {
  const first = GET();
  const second = GET();

  expect(first.status).toBe(200);
  expect(first.headers.get("content-type")).toBe("application/json; charset=utf-8");
  expect(first.headers.get("cache-control")).toBe("no-store, max-age=0");
  expect([...first.headers.keys()].sort()).toEqual(["cache-control", "content-type"]);
  expect(await first.text()).toBe(expectedText);
  expect(await second.text()).toBe(expectedText);
});

test("build route table and generated types contain only the intended new route", () => {
  const manifest = JSON.parse(
    readFileSync(join(root, ".next/server/app-paths-manifest.json"), "utf8"),
  );
  const routes = readFileSync(join(root, ".next/types/routes.d.ts"), "utf8");

  expect(manifest["/api/runtime-health/ping/route"]).toBe(
    "app/api/runtime-health/ping/route.js",
  );
  expect(routes).toContain('"/api/runtime-health/ping"');
});

test("localhost behavior confirms GET determinism and framework 405 responses", async ({ request }) => {
  const headers = authHeaders();
  const first = await request.get("/api/runtime-health/ping", { headers });
  const second = await request.get("/api/runtime-health/ping", { headers });
  const post = await request.post("/api/runtime-health/ping", { headers });
  const put = await request.put("/api/runtime-health/ping", { headers });

  expect(first.status()).toBe(200);
  expect(first.headers()["content-type"]).toBe("application/json; charset=utf-8");
  expect(first.headers()["cache-control"]).toBe("no-store, max-age=0");
  expect(await first.text()).toBe(expectedText);
  expect(await second.text()).toBe(expectedText);
  expect(post.status()).toBe(405);
  expect(put.status()).toBe(405);
  expect(await post.text()).not.toBe(expectedText);
  expect(await put.text()).not.toBe(expectedText);
});

test("proxy caveat Netlify distrust and rollback containment are explicit", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("traverses the existing unchanged application `proxy.ts`");
  expect(doc).toContain("existing `.env.local` trade password");
  expect(doc).toContain("route handler itself has no authentication or environment dependency");
  expect(doc).toContain("Netlify_runtime_trusted` remains false");
  expect(doc).toContain("Rollback remains deletion of one route file");
  expect(doc).toContain("No persisted-data cleanup is required");
});

test("preview production and main push remain blocked", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("preview_deployment_approved: false");
  expect(doc).toContain("Netlify_deployment_approved: false");
  expect(doc).toContain("production_deployment_approved: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("No Deploy Preview, Branch Deploy, Netlify deploy, or preview endpoint request is approved");
});

test("Action 361 verifier independently passes all local integrity conditions", () => {
  const result = runVerifier(verifierPath);

  expect(result.verification_status).toBe("passed");
  expect(result.readiness_decision).toBe("ready");
  expect(result.preview_deploy_approval_gate_may_be_created).toBe(true);
  expect(result.preview_deployment_approved).toBe(false);
  expect(result.exact_route_source_found).toBe(true);
  expect(result.one_runtime_file_boundary_found).toBe(true);
  expect(result.zero_imports_found).toBe(true);
  expect(result.exactly_one_get_export_found).toBe(true);
  expect(result.exact_body_key_order_and_headers_found).toBe(true);
  expect(result.local_behavioral_evidence_found).toBe(true);
  expect(result.proxy_traversal_caveat_found).toBe(true);
  expect(result.build_route_found).toBe(true);
  expect(result.generated_route_types_found).toBe(true);
  expect(result.rollback_one_file_contained).toBe(true);
  expect(result.Netlify_runtime_trusted).toBe(false);
  expect(result.failed_conditions).toEqual([]);
  expect(result.no_effect_flags.external_endpoint_contacted).toBe(false);
  expect(result.no_effect_flags.route_changed_by_action_361).toBe(false);
  expect(result.no_effect_flags.additional_runtime_file_added).toBe(false);
});

test("upstream safety route gates implementation golden and package guards pass", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
    "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
    "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
    "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
    "scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs",
    "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];
  const results = scripts.map(runVerifier);

  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
