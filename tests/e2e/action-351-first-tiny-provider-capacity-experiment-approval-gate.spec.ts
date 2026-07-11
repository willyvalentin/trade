import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-351-first-tiny-provider-capacity-experiment-approval-gate.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-351-first-tiny-provider-capacity-experiment-approval-gate-verify.mjs",
);

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-351-first-tiny-provider-capacity-experiment-approval-gate-verify.mjs"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
        TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
        SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      },
    },
  );
}

test("first tiny provider capacity approval gate doc exists and is closed", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "first_tiny_provider_capacity_experiment_gate_status: gate_ready_closed",
  );
  expect(doc).toContain("experiment_implementation_approved: false");
  expect(doc).toContain("experiment_execution_approved: false");
  expect(doc).toContain("provider_call_allowed: false");
  expect(doc).toContain("deploy_readiness: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("closed provider-capacity experiment approval gate only");
  expect(doc).toContain("does not implement or execute an experiment");
  expect(doc).toContain("Current decision:");
  expect(doc).toContain("- gate_closed");
});

test("first tiny provider capacity approval gate references prerequisites and separates approvals", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 309 Post-Recovery Safe Development Protocol");
  expect(doc).toContain("Action 339 Historical Backfill Cost and Provider Capacity Plan");
  expect(doc).toContain("Action 345 First Tiny Provider Capacity Experiment Plan");
  expect(doc).toContain("Action 350 Runtime Ping-Only Route Approval Gate");
  expect(doc).toContain("Provider experiment implementation approval is separate from execution approval");
  expect(doc).toContain("Execution approval is separate from persistence approval");
  expect(doc).toContain("Implementation approval does not imply execution approval");
  expect(doc).toContain("Experiment execution approval does not authorize");
});

test("first tiny provider capacity approval gate defines tiny exact scope and future files", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("one local-only pure experiment helper/script");
  expect(doc).toContain("one focused result type/helper if needed");
  expect(doc).toContain("one focused test");
  expect(doc).toContain("one implementation result doc");
  expect(doc).toContain("No app/api, app page, proxy, middleware, Netlify, migration, scanner, ranking, or Supabase persistence files may change");
  expect(doc).toContain("provider: current configured market data provider");
  expect(doc).toContain("symbol: AAPL or SPY");
  expect(doc).toContain("interval: 5min");
  expect(doc).toContain("one known trading day");
  expect(doc).toContain("one request scope");
  expect(doc).toContain("local/dev only");
  expect(doc).toContain("no writes");
  expect(doc).toContain("no replay");
  expect(doc).toContain("no scanner/ranking effects");
  expect(doc).toContain("no visible recommendation effects");
});

test("first tiny provider capacity approval gate includes all approval flags and failure conditions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain(
    "TURE_FIRST_TINY_PROVIDER_CAPACITY_EXPERIMENT_IMPLEMENTATION_APPROVED=false",
  );
  expect(doc).toContain(
    "TURE_FIRST_TINY_PROVIDER_CAPACITY_EXPERIMENT_EXECUTION_APPROVED=false",
  );
  expect(doc).toContain("TURE_PROVIDER_CALLS_APPROVED=false");
  expect(doc).toContain("TURE_NEWS_API_CALLS_APPROVED=false");
  expect(doc).toContain("TURE_SUPABASE_READ_APPROVED=false");
  expect(doc).toContain("TURE_SUPABASE_WRITE_APPROVED=false");
  expect(doc).toContain("TURE_RAW_RESPONSE_PERSISTENCE_APPROVED=false");
  expect(doc).toContain("TURE_CANDLE_PERSISTENCE_APPROVED=false");
  expect(doc).toContain("TURE_FETCH_RUN_PERSISTENCE_APPROVED=false");
  expect(doc).toContain("TURE_REPLAY_EXECUTION_APPROVED=false");
  expect(doc).toContain("TURE_SCANNER_RANKING_MUTATION_APPROVED=false");
  expect(doc).toContain("provider scope is broader than one symbol/day/interval");
  expect(doc).toContain("expected request count is unknown");
  expect(doc).toContain("user approval is absent");
});

test("first tiny provider capacity approval gate verifier exits zero and reports false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.approval_gate_found).toBe(true);
  expect(parsed.gate_status_found).toBe(true);
  expect(parsed.prerequisite_artifacts_found).toBe(true);
  expect(parsed.implementation_conditions_found).toBe(true);
  expect(parsed.execution_conditions_found).toBe(true);
  expect(parsed.persistence_separation_found).toBe(true);
  expect(parsed.allowed_scope_found).toBe(true);
  expect(parsed.future_experiment_contract_found).toBe(true);
  expect(parsed.approval_flags_found).toBe(true);
  expect(parsed.current_gate_decision).toBe("gate_closed");
  expect(parsed.experiment_implementation_approved).toBe(false);
  expect(parsed.experiment_execution_approved).toBe(false);
  expect(parsed.experiment_implementation_allowed).toBe(false);
  expect(parsed.experiment_execution_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_read_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.raw_response_persistence_allowed).toBe(false);
  expect(parsed.candle_persistence_allowed).toBe(false);
  expect(parsed.fetch_run_persistence_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.explicit_user_approval_required).toBe(true);
});

test("first tiny provider capacity approval gate verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
});

test("first tiny provider capacity approval gate verifier source avoids forbidden imports and execution", () => {
  const source = readFileSync(verifierPath, "utf8");

  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
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

test("Action 351 adds no provider call candle fetch app api route persistence proxy middleware netlify or migration", () => {
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

test("Action 309 339 345 350 318 319 320 and golden verifiers pass", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-339-historical-backfill-cost-and-provider-capacity-plan-verify.mjs",
    "scripts/action-345-first-tiny-provider-capacity-experiment-plan-verify.mjs",
    "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
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
