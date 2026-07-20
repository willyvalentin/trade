import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-323-recommendation-engine-readiness-map.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-323-recommendation-engine-readiness-map-verify.mjs",
);

function runReadinessVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-323-recommendation-engine-readiness-map-verify.mjs"],
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

test("readiness map doc exists and records safe roadmap baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("recommendation_engine_readiness_status: roadmap_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("not runtime change, deploy");
  expect(doc).toContain("scanner/ranking mutation");
});

test("readiness map states recommendation engine role in Ture", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("The recommendation engine is the product core");
  expect(doc).toContain("find, score, rank, and explain");
  expect(doc).toContain("limited number of day trade recommendations");
  expect(doc).toContain("Ture should minimize user analysis");
  expect(doc).toContain("recommendations per trading window");
  expect(doc).toContain("quality over quantity");
  expect(doc).toContain("learn from every recommendation");
});

test("readiness map lists all core responsibilities", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Market Scanning");
  expect(doc).toContain("Candidate Filtering");
  expect(doc).toContain("Setup Quality Assessment");
  expect(doc).toContain("Trade Geometry");
  expect(doc).toContain("Confidence Scoring");
  expect(doc).toContain("Ranking And Selection");
  expect(doc).toContain("Recommendation Explanation");
  expect(doc).toContain("Snapshot And Learning Integration");
});

test("readiness map records strengths gaps and all quality gates", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("existing recommendation generation exists");
  expect(doc).toContain("scan/window/tier systems exist");
  expect(doc).toContain("current scanner/ranking quality needs review");
  expect(doc).toContain("confidence calibration is not fully proven");
  expect(doc).toContain("data_freshness_gate");
  expect(doc).toContain("market_session_gate");
  expect(doc).toContain("liquidity_gate");
  expect(doc).toContain("spread_or_volatility_gate");
  expect(doc).toContain("risk_reward_gate");
  expect(doc).toContain("trade_geometry_gate");
  expect(doc).toContain("confidence_gate");
  expect(doc).toContain("duplicate_candidate_gate");
  expect(doc).toContain("recommendation_limit_gate");
  expect(doc).toContain("snapshot_persistence_gate");
  expect(doc).toContain("learning_feedback_gate");
});

test("readiness map includes readiness levels R0 through R5 and not yet R5", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("R0: undocumented / unknown");
  expect(doc).toContain("R1: existing but unaudited");
  expect(doc).toContain("R2: documented and test-covered");
  expect(doc).toContain("R3: validated with historical outcomes");
  expect(doc).toContain("R4: calibrated and trusted for product use");
  expect(doc).toContain("R5: production-grade recommendation engine");
  expect(doc).toContain("The recommendation engine is not yet R5");
});

test("readiness map lists next recommended actions and what not to do yet", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 324: Recommendation Engine Code Surface Inventory");
  expect(doc).toContain("Action 325: Recommendation Quality Gates Audit");
  expect(doc).toContain("Action 326: Setup Taxonomy and Confidence Calibration Map");
  expect(doc).toContain("Action 327: Learning/Backfill Runtime Rollout Plan");
  expect(doc).toContain("Action 328: Product UX Surface Map");
  expect(doc).toContain("do not mutate scanner/ranking from static replay yet");
  expect(doc).toContain("do not add runtime replay routes");
  expect(doc).toContain("do not persist synthetic outcomes");
  expect(doc).toContain("do not deploy branch package");
  expect(doc).toContain("do not push main");
  expect(doc).toContain("do not prioritize execution agent over recommendation quality");
});

test("readiness map says not deploy readiness and blocks runtime changes", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("not runtime change");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("scanner/ranking mutation");
  expect(doc).toContain("does not authorize");
  expect(doc).toContain("production deploy");
  expect(doc).toContain("main push");
  expect(doc).toContain("runtime route additions");
  expect(doc).toContain("proxy or middleware");
});

test("verifier script exists exits 0 and reports roadmap readiness", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runReadinessVerifier());

  expect(source).toContain("action-323-recommendation-engine-readiness-map.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.recommendation_engine_readiness_map_found).toBe(true);
  expect(parsed.product_core_statement_found).toBe(true);
  expect(parsed.core_responsibilities_found).toBe(true);
  expect(parsed.quality_gates_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
  expect(parsed.what_not_to_do_yet_found).toBe(true);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runReadinessVerifier();
  const parsed = JSON.parse(output);

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.provider_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.supabase_read_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(parsed.no_effect_flags.recommendation_rows_mutated).toBe(false);
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

test("Action 323 adds no app api route and does not modify proxy", () => {
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
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 321 Action 322 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const reconciliation = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-321-ture-roadmap-reconciliation-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const roadmapIndex = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-322-ture-product-roadmap-index-verify.mjs"],
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
  expect(reconciliation.verification_status).toBe("passed");
  expect(roadmapIndex.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
