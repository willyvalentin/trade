import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-329-recommendation-engine-gate-test-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-329-recommendation-engine-gate-test-plan-verify.mjs",
);

const testStrategyLevels = [
  "Static fixture tests",
  "Unit tests for gate helpers",
  "Integration tests with mock provider data",
  "Read-only runtime tests",
  "Historical replay validation",
  "Calibration validation",
];

const requiredGates = [
  "data_freshness_gate",
  "market_session_gate",
  "liquidity_gate",
  "spread_or_volatility_gate",
  "vwap_context_gate",
  "momentum_gate",
  "volume_trend_gate",
  "risk_reward_gate",
  "trade_geometry_gate",
  "confidence_gate",
  "duplicate_candidate_gate",
  "recommendation_limit_gate",
  "snapshot_persistence_gate",
  "learning_feedback_gate",
];

function runGateTestPlanVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-329-recommendation-engine-gate-test-plan-verify.mjs"],
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

test("gate test plan doc exists and records safe planning baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "recommendation_engine_gate_test_plan_status: test_plan_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("gate test planning only");
  expect(doc).toContain("not gate implementation");
  expect(doc).toContain("runtime change");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("threshold mutation");
  expect(doc).toContain("This is not deploy readiness.");
});

test("gate test plan explains purpose and product promise", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Quality gates need tests");
  expect(doc).toContain("prevent weak/noisy/stale/unsafe recommendations");
  expect(doc).toContain("fewer, clearer, higher-quality recommendations");
  expect(doc).toContain("before connecting replay/backfill output to ranking");
});

test("gate test plan lists all six test strategy levels", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const level of testStrategyLevels) {
    expect(doc).toContain(level);
  }
  expect(doc).toContain("pure in-memory inputs");
  expect(doc).toContain("no provider/Supabase");
  expect(doc).toContain("mock candles/provider responses only");
  expect(doc).toContain("no scanner/ranking mutation");
  expect(doc).toContain("offline first");
});

test("gate test plan lists all fourteen gates with expected details", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const gate of requiredGates) {
    expect(doc).toContain(gate);
  }
  expect(doc).toContain("gate name:");
  expect(doc).toContain("minimum fixture scenarios:");
  expect(doc).toContain("expected pass case:");
  expect(doc).toContain("expected fail case:");
  expect(doc).toContain("boundary cases:");
  expect(doc).toContain("required assertions:");
  expect(doc).toContain("test level to start with:");
  expect(doc).toContain("implementation risk:");
});

test("gate test plan includes fixture design principles", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("deterministic timestamps");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no random data");
  expect(doc).toContain("explicit market session labels");
  expect(doc).toContain("explicit stale/fresh data cases");
  expect(doc).toContain("explicit valid/invalid geometry");
  expect(doc).toContain("explicit duplicate candidates");
  expect(doc).toContain("explicit confidence buckets");
  expect(doc).toContain("explicit missing snapshot cases");
  expect(doc).toContain("no provider calls");
  expect(doc).toContain("no Supabase writes");
});

test("gate test plan includes standardized assertions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("gate_status: pass | warn | fail | unknown");
  expect(doc).toContain("blocker_reason");
  expect(doc).toContain("warning_reason");
  expect(doc).toContain("candidate_visible");
  expect(doc).toContain("recommendation_allowed");
  expect(doc).toContain("confidence_discount_applied");
  expect(doc).toContain("tier_change_allowed");
  expect(doc).toContain("no_effect_flags");
  expect(doc).toContain("audit_metadata");
});

test("gate test plan lists blocked work and next actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("do not implement gate threshold changes");
  expect(doc).toContain("do not mutate scanner/ranking");
  expect(doc).toContain("do not add API routes");
  expect(doc).toContain("do not connect static replay to live ranking");
  expect(doc).toContain("do not persist synthetic outcomes");
  expect(doc).toContain("do not deploy");
  expect(doc).toContain("do not push main");
  expect(doc).toContain("Scanner/ranking mutation is blocked");
  expect(doc).toContain("Action 330: Confidence Calibration Static Metric Spec");
  expect(doc).toContain("Action 331: Recommendation Card Content Hierarchy Spec");
  expect(doc).toContain("Action 332: History/Statistics Learning Surface Spec");
  expect(doc).toContain("Action 333: Execution Agent Boundary Refresh");
  expect(doc).toContain("Action 334: First Static Gate Helper Extraction Plan");
});

test("verifier script exists exits 0 and reports test plan ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runGateTestPlanVerifier());

  expect(source).toContain("action-329-recommendation-engine-gate-test-plan.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.gate_test_plan_found).toBe(true);
  expect(parsed.test_plan_status_found).toBe(true);
  expect(parsed.test_strategy_levels_found).toBe(true);
  expect(parsed.test_strategy_levels_missing).toEqual([]);
  expect(parsed.all_required_gates_found).toBe(true);
  expect(parsed.required_gates_missing).toEqual([]);
  expect(parsed.fixture_design_principles_found).toBe(true);
  expect(parsed.standardized_assertions_found).toBe(true);
  expect(parsed.what_not_to_do_yet_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main runtime proxy scanner ranking and threshold mutation", () => {
  const parsed = JSON.parse(runGateTestPlanVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.threshold_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runGateTestPlanVerifier();
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
  expect(parsed.no_effect_flags.threshold_mutation_executed).toBe(false);
  expect(parsed.no_effect_flags.gate_implementation_added).toBe(false);
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

test("Action 329 adds no app api route and does not modify proxy", () => {
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

test("Action 309 Action 325 Action 328 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const qualityGates = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-325-recommendation-quality-gates-audit-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const productUx = JSON.parse(
    execFileSync("node", ["scripts/action-328-product-ux-surface-map-verify.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const golden = JSON.parse(
    execFileSync(
      "node",
      ["scripts/replay-with-signal-package-static-preview-verify-golden.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );

  expect(guard.guard_status).toBe("passed");
  expect(qualityGates.verification_status).toBe("passed");
  expect(productUx.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
