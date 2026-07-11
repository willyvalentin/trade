import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(process.cwd(), "docs/action-350-runtime-ping-only-route-approval-gate.md");
const verifierPath = join(
  process.cwd(),
  "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
);

function runVerifier() {
  return execFileSync("node", ["scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
    },
  });
}

test("runtime ping approval gate doc exists and is closed", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("runtime_ping_only_route_approval_gate_status: gate_ready_closed");
  expect(doc).toContain("route_implementation_approved: false");
  expect(doc).toContain("runtime_route_changes_allowed: false");
  expect(doc).toContain("deploy_readiness: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("Current decision:");
  expect(doc).toContain("- gate_closed");
  expect(doc).toContain("closed approval gate only");
  expect(doc).toContain("does not implement a route");
});

test("runtime ping approval gate references prerequisite actions and separates approvals", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 309 Post-Recovery Safe Development Protocol");
  expect(doc).toContain("Action 338 Runtime Ping-Only Rollout Checklist");
  expect(doc).toContain("Action 344 Runtime Ping-Only Route Implementation Plan");
  expect(doc).toContain("Approval to implement is separate from approval to deploy");
  expect(doc).toContain("Route implementation approval does not imply deploy approval");
  expect(doc).toContain("user explicitly approves implementation");
  expect(doc).toContain("user explicitly approves deploy");
});

test("runtime ping approval gate constrains future files and route contract", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("one GET-only app/api ping route");
  expect(doc).toContain("one focused test");
  expect(doc).toContain("one implementation result doc");
  expect(doc).toContain("optionally one tiny pure marker helper if required");
  expect(doc).toContain("No other files may change");
  expect(doc).toContain("`/api/runtime-health/ping`");
  expect(doc).toContain("GET only");
  expect(doc).toContain("static JSON only");
  expect(doc).toContain("no request body");
  expect(doc).toContain("no query behavior");
  expect(doc).toContain("no provider calls");
  expect(doc).toContain("no Supabase access");
  expect(doc).toContain("no replay");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no random IDs");
  expect(doc).toContain("stable route_build_marker");
});

test("runtime ping approval gate includes all approval flags and failure conditions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("TURE_RUNTIME_PING_ROUTE_IMPLEMENTATION_APPROVED=false");
  expect(doc).toContain("TURE_RUNTIME_ROUTE_DEPLOY_APPROVED=false");
  expect(doc).toContain("TURE_PROVIDER_CALLS_APPROVED=false");
  expect(doc).toContain("TURE_SUPABASE_READ_APPROVED=false");
  expect(doc).toContain("TURE_SUPABASE_WRITE_APPROVED=false");
  expect(doc).toContain("TURE_REPLAY_EXECUTION_APPROVED=false");
  expect(doc).toContain("TURE_SCANNER_RANKING_MUTATION_APPROVED=false");
  expect(doc).toContain("package guards fail");
  expect(doc).toContain("worktree contains unrelated runtime/execution artifacts");
  expect(doc).toContain("forbidden Action 307 diagnostics exist");
  expect(doc).toContain("provider/Supabase/replay imports are planned");
  expect(doc).toContain("user approval is absent");
});

test("runtime ping approval gate verifier exits zero and reports false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.approval_gate_found).toBe(true);
  expect(parsed.gate_status_found).toBe(true);
  expect(parsed.prerequisite_artifacts_found).toBe(true);
  expect(parsed.implementation_conditions_found).toBe(true);
  expect(parsed.deployment_conditions_found).toBe(true);
  expect(parsed.allowed_scope_found).toBe(true);
  expect(parsed.future_route_contract_found).toBe(true);
  expect(parsed.approval_flags_found).toBe(true);
  expect(parsed.decision_model_found).toBe(true);
  expect(parsed.current_gate_decision).toBe("gate_closed");
  expect(parsed.route_implementation_approved).toBe(false);
  expect(parsed.route_implementation_allowed).toBe(false);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.deploy_approved).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.supabase_read_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.middleware_changes_allowed).toBe(false);
  expect(parsed.netlify_config_changes_allowed).toBe(false);
  expect(parsed.explicit_user_approval_required).toBe(true);
});

test("runtime ping approval gate verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
});

test("runtime ping approval gate verifier source avoids forbidden imports and nondeterminism", () => {
  const source = readFileSync(verifierPath, "utf8");

  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("TWELVE_DATA");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("from \"../app");
  expect(source).not.toContain("@/lib/provider");
  expect(source).not.toContain("@/lib/scanner");
  expect(source).not.toContain("@/lib/ranking");
  expect(source).not.toContain("@/lib/replay");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("writeFile");
});

test("Action 350 adds no app api route runtime proxy middleware netlify or migration", () => {
  const status = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  expect(status).not.toMatch(/^(..|\?\?) app\/api\//m);
  expect(status).not.toMatch(/^(..|\?\?) app\/[^/]+\/page\.tsx/m);
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)$/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml$/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
});

test("Action 309 338 344 318 319 320 and golden verifiers pass", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
    "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  ];

  const results = scripts.map((script) =>
    JSON.parse(execFileSync("node", [script], { cwd: process.cwd(), encoding: "utf8" })),
  );

  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(
    true,
  );
});
