import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-339-historical-backfill-cost-and-provider-capacity-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-339-historical-backfill-cost-and-provider-capacity-plan-verify.mjs",
);

const providerCapacityDimensions = [
  "request_limit_per_minute",
  "request_limit_per_day",
  "symbols_per_request",
  "candles_per_request",
  "supported_intervals",
  "historical_depth",
  "adjusted_vs_unadjusted_support",
  "intraday_delay_or_realtime_status",
  "response_size",
  "retry_policy",
  "failure_rate_tracking",
  "cost_per_plan",
  "overage_risk",
  "provider_terms_constraints",
];

const dataVolumeDimensions = [
  "symbol_count",
  "trading_days",
  "interval",
  "candles_per_day",
  "rows_per_symbol",
  "total_candle_rows",
  "raw_response_storage_size",
  "normalized_storage_size",
  "index/context_symbol_multiplier",
  "sector/peer_multiplier",
  "news/catalyst_record_count",
  "audit/readback_metadata_size",
];

const universeTiers = [
  "Tier 0: already recommended tickers",
  "Tier 1: active scan universe",
  "Tier 2: index context symbols SPY/QQQ/IWM",
  "Tier 3: sector ETFs",
  "Tier 4: peer groups for recommended tickers",
  "Tier 5: high-liquidity US large/mid caps",
  "Tier 6: broader universe later",
];

const nextActions = [
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
  "Action 343: Pattern Insight Static Type Spec",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 345: First Tiny Provider Capacity Experiment Plan",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-339-historical-backfill-cost-and-provider-capacity-plan-verify.mjs"],
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

test("historical backfill cost capacity plan doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("historical_backfill_cost_capacity_status: plan_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("cost/capacity planning only");
  expect(doc).toContain("not provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("runtime implementation");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("plan explains purpose and prioritization", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("enough historical and daily data to learn patterns");
  expect(doc).toContain("Data collection must be paced to provider capacity and cost");
  expect(doc).toContain("Broad backfill should not start before tiny scoped backfill is proven");
  expect(doc).toContain("Recommendation-linked tickers and context symbols should be prioritized");
  expect(doc).toContain("News/catalyst data should be planned separately");
});

test("plan includes provider capacity dimensions", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const dimension of providerCapacityDimensions) {
    expect(doc).toContain(dimension);
  }
});

test("plan includes data volume dimensions", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const dimension of dataVolumeDimensions) {
    expect(doc).toContain(dimension);
  }
});

test("plan includes universe tiers and collection priority", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const tier of universeTiers) {
    expect(doc).toContain(tier);
  }
  expect(doc).toContain("purpose");
  expect(doc).toContain("expected value");
  expect(doc).toContain("backfill priority");
  expect(doc).toContain("cost/risk");
  expect(doc).toContain("recommended start scope");
});

test("plan includes backfill windows and expected cost risk", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("last 5 trading days");
  expect(doc).toContain("last 20 trading days");
  expect(doc).toContain("last 60 trading days");
  expect(doc).toContain("last 120 trading days");
  expect(doc).toContain("last 252 trading days");
  expect(doc).toContain("multi-year later");
  expect(doc).toContain("learning value");
  expect(doc).toContain("provider request risk");
  expect(doc).toContain("storage risk");
  expect(doc).toContain("recommended universe tier");
  expect(doc).toContain("suitable for first implementation");
});

test("plan includes daily cadence news catalyst and storage retention planning", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("premarket context collection");
  expect(doc).toContain("scan-window candle collection");
  expect(doc).toContain("recommendation snapshot persistence");
  expect(doc).toContain("market regime snapshot");
  expect(doc).toContain("sector/industry snapshot");
  expect(doc).toContain("relative strength snapshot");
  expect(doc).toContain("news/catalyst snapshot");
  expect(doc).toContain("end-of-day outcome reconstruction");
  expect(doc).toContain("daily data quality audit");
  expect(doc).toContain("future planning only and not implementation");
  expect(doc).toContain("news provider may be separate from candle provider");
  expect(doc).toContain("catalyst timestamp matters for anti-leakage");
  expect(doc).toContain("headline summaries must be snapshot-time safe");
  expect(doc).toContain("start with catalyst presence/type before full NLP");
  expect(doc).toContain("normalized candle storage");
  expect(doc).toContain("raw response retention policy");
  expect(doc).toContain("context snapshot storage");
  expect(doc).toContain("avoid duplicate storage of same candle/provider rows");
});

test("plan includes first safe capacity experiment design", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("one provider");
  expect(doc).toContain("one symbol");
  expect(doc).toContain("one interval");
  expect(doc).toContain("one trading day");
  expect(doc).toContain("no writes first");
  expect(doc).toContain("then tiny write/readback only after approval");
  expect(doc).toContain("no broad universe");
  expect(doc).toContain("no news calls");
  expect(doc).toContain("no scanner/ranking mutation");
  expect(doc).toContain("rollback-ready");
});

test("plan blocks unsafe implementation work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no broad backfill jobs yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("does not authorize deploys");
  expect(doc).toContain("main pushes");
});

test("plan lists next actions 340 through 345", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
});

test("verifier script exists exits 0 and reports plan ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-339-historical-backfill-cost-and-provider-capacity-plan.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.cost_capacity_plan_found).toBe(true);
  expect(parsed.plan_status_found).toBe(true);
  expect(parsed.provider_capacity_dimensions_found).toBe(true);
  expect(parsed.data_volume_dimensions_found).toBe(true);
  expect(parsed.universe_tiers_found).toBe(true);
  expect(parsed.backfill_windows_found).toBe(true);
  expect(parsed.daily_collection_cadence_found).toBe(true);
  expect(parsed.news_catalyst_provider_planning_found).toBe(true);
  expect(parsed.storage_retention_planning_found).toBe(true);
  expect(parsed.first_safe_capacity_experiment_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main push runtime provider news Supabase broad backfill scanner ranking and confidence changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.broad_backfill_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.provider_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.news_api_call_executed).toBe(false);
  expect(parsed.no_effect_flags.news_api_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.supabase_read_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.broad_backfill_executed).toBe(false);
  expect(parsed.no_effect_flags.broad_backfill_job_added).toBe(false);
  expect(parsed.no_effect_flags.candles_persisted).toBe(false);
  expect(parsed.no_effect_flags.news_persisted).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(parsed.no_effect_flags.confidence_thresholds_mutated).toBe(false);
});

test("verifier source avoids env provider Supabase runtime and nondeterminism", () => {
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

test("Action 339 adds no app api route and does not modify proxy", () => {
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
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 338 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const runtimeChecklist = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs"],
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
  expect(runtimeChecklist.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
