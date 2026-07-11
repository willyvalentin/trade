import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-345-first-tiny-provider-capacity-experiment-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-345-first-tiny-provider-capacity-experiment-plan-verify.mjs",
);

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-345-first-tiny-provider-capacity-experiment-plan-verify.mjs"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
        TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
        SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
        NEWS_API_KEY: "news-secret-that-must-not-appear",
      },
    },
  );
}

test("provider capacity experiment plan doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "first_tiny_provider_capacity_experiment_status: experiment_plan_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("provider capacity experiment planning only");
  expect(doc).toContain("not provider implementation");
  expect(doc).toContain("runtime implementation");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("replay execution");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("provider capacity experiment plan explains purpose", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("provider capacity knowledge before broad data collection");
  expect(doc).toContain("tiny and capacity-focused");
  expect(doc).toContain("request behavior, response shape, row count, latency, payload size, and failure modes");
  expect(doc).toContain("must not start broad backfill");
  expect(doc).toContain("must not write to Supabase");
  expect(doc).toContain("must not affect recommendations");
});

test("provider capacity experiment plan defines future experiment scope", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("provider: Twelve Data or current configured market data provider");
  expect(doc).toContain("symbol: one highly liquid ticker, preferably AAPL or SPY");
  expect(doc).toContain("interval: 5min");
  expect(doc).toContain("trading day: one known trading day");
  expect(doc).toContain("adjusted: explicitly declared");
  expect(doc).toContain("output: inspect response only");
  expect(doc).toContain("writes: none");
  expect(doc).toContain("replay: none");
  expect(doc).toContain("scanner/ranking: none");
  expect(doc).toContain("route: none unless separately approved by runtime ping checklist");
  expect(doc).toContain("execution context: local/dev only first");
});

test("provider capacity experiment plan includes metrics to measure", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("request_started");
  expect(doc).toContain("request_completed");
  expect(doc).toContain("request_duration_ms");
  expect(doc).toContain("provider_status_code");
  expect(doc).toContain("provider_error_code");
  expect(doc).toContain("rate_limit_headers_available");
  expect(doc).toContain("response_size_bytes");
  expect(doc).toContain("candle_rows_returned");
  expect(doc).toContain("first_candle_timestamp");
  expect(doc).toContain("last_candle_timestamp");
  expect(doc).toContain("missing_candle_count");
  expect(doc).toContain("malformed_rows_count");
  expect(doc).toContain("provider_time_zone_behavior");
  expect(doc).toContain("estimated_requests_for_backfill_window");
});

test("provider capacity experiment plan includes capacity calculations and no-write result shape", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("candles_per_day_by_interval");
  expect(doc).toContain("requests_per_symbol");
  expect(doc).toContain("requests_per_universe_tier");
  expect(doc).toContain("requests_per_backfill_window");
  expect(doc).toContain("estimated_payload_size");
  expect(doc).toContain("estimated_storage_size_normalized");
  expect(doc).toContain("estimated_raw_response_size");
  expect(doc).toContain("estimated_daily_collection_cost");
  expect(doc).toContain("estimated_backfill_cost");
  expect(doc).toContain("experiment_status");
  expect(doc).toContain("provider_call_executed");
  expect(doc).toContain("provider_call_attempted");
  expect(doc).toContain("supabase_write_executed: false");
  expect(doc).toContain("candles_persisted: false");
  expect(doc).toContain("raw_response_persisted: false");
  expect(doc).toContain("fetch_run_persisted: false");
  expect(doc).toContain("capacity_estimates");
});

test("provider capacity experiment plan includes approval gates and safety constraints", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("TURE_FIRST_TINY_PROVIDER_CAPACITY_EXPERIMENT_APPROVED=false");
  expect(doc).toContain("TURE_PROVIDER_CALLS_APPROVED=false");
  expect(doc).toContain("TURE_SUPABASE_WRITE_APPROVED=false");
  expect(doc).toContain("TURE_RAW_RESPONSE_PERSISTENCE_APPROVED=false");
  expect(doc).toContain("TURE_CANDLE_PERSISTENCE_APPROVED=false");
  expect(doc).toContain("TURE_REPLAY_EXECUTION_APPROVED=false");
  expect(doc).toContain("TURE_SCANNER_RANKING_MUTATION_APPROVED=false");
  expect(doc).toContain("no production route required");
  expect(doc).toContain("no broad universe");
  expect(doc).toContain("no multi-day backfill");
  expect(doc).toContain("no news API call");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("provider capacity experiment plan includes success and failure criteria", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("one request scope clearly bounded");
  expect(doc).toContain("response shape understood");
  expect(doc).toContain("row count understood");
  expect(doc).toContain("latency understood");
  expect(doc).toContain("payload size understood");
  expect(doc).toContain("failure/rate-limit behavior captured if present");
  expect(doc).toContain("no writes happened");
  expect(doc).toContain("capacity estimate produced");
  expect(doc).toContain("provider request unavailable");
  expect(doc).toContain("ambiguous response shape");
  expect(doc).toContain("missing required candle fields");
  expect(doc).toContain("unexpected timezone behavior");
  expect(doc).toContain("rate limit encountered");
  expect(doc).toContain("any scanner/ranking mutation attempted");
});

test("provider capacity experiment plan maps to existing work and blocks implementation", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("historical candle persistence/readback foundation");
  expect(doc).toContain("fetch-run audit work");
  expect(doc).toContain("Action 339 cost/capacity plan");
  expect(doc).toContain("Action 333 existing coverage audit");
  expect(doc).toContain("Action 338/344 runtime safety plans");
  expect(doc).toContain("extend existing provider/audit patterns where valid");
  expect(doc).toContain("Do not duplicate existing historical candle storage or fetch-run audit concepts");
  expect(doc).toContain("no provider experiment implementation yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime route yet");
  expect(doc).toContain("no broad backfill yet");
  expect(doc).toContain("no replay execution yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("provider capacity experiment plan lists next actions 346 through 351", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 346: Existing Schema Compatibility Matrix");
  expect(doc).toContain("Action 347: Learning Dataset Static Fixture Implementation Plan");
  expect(doc).toContain("Action 348: Intelligence Context Static Fixture Implementation Plan");
  expect(doc).toContain("Action 349: Pattern Insight Static Fixture Spec");
  expect(doc).toContain("Action 350: Runtime Ping-Only Route Approval Gate");
  expect(doc).toContain("Action 351: First Tiny Provider Capacity Experiment Approval Gate");
});

test("provider capacity verifier exists exits zero and reports safe false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.experiment_plan_found).toBe(true);
  expect(parsed.plan_status_found).toBe(true);
  expect(parsed.future_experiment_scope_found).toBe(true);
  expect(parsed.metrics_to_measure_found).toBe(true);
  expect(parsed.capacity_calculations_found).toBe(true);
  expect(parsed.no_write_result_shape_found).toBe(true);
  expect(parsed.approval_gates_found).toBe(true);
  expect(parsed.safety_constraints_found).toBe(true);
  expect(parsed.success_criteria_found).toBe(true);
  expect(parsed.failure_criteria_found).toBe(true);
  expect(parsed.relation_to_existing_work_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.experiment_implementation_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.raw_response_persistence_allowed).toBe(false);
  expect(parsed.candle_persistence_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.raw_response_persisted).toBe(false);
  expect(parsed.no_effect_flags.candles_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
});

test("provider capacity verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("provider capacity verifier source avoids env provider Supabase runtime and nondeterminism", () => {
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
  expect(source).not.toContain("@/lib/broker");
  expect(source).not.toContain("@/lib/execution");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("writeFile");
});

test("Action 345 adds no app api route proxy or migration", () => {
  const status = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );

  expect(status).not.toMatch(/^(..|\?\?) app\/api\//m);
  expect(status).not.toMatch(/^(..|\?\?) app\/[^/]+\/page\.tsx/m);
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 339 Action 344 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const capacityPlan = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-339-historical-backfill-cost-and-provider-capacity-plan-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const runtimePlan = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const golden = JSON.parse(
    execFileSync(
      "node",
      ["scripts/replay-with-signal-package-static-preview-verify-golden.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );

  expect(guard.guard_status).toBe("passed");
  expect(capacityPlan.verification_status).toBe("passed");
  expect(runtimePlan.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
