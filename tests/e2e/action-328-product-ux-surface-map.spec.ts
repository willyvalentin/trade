import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(process.cwd(), "docs/action-328-product-ux-surface-map.md");
const verifierPath = join(
  process.cwd(),
  "scripts/action-328-product-ux-surface-map-verify.mjs",
);

const primarySurfaces = [
  "Today / Active Window Dashboard",
  "Recommendation Card",
  "Recommendation Detail Modal",
  "History",
  "Statistics",
  "Learning / Replay Review",
  "Risk / Trade Management Surface",
  "Execution / Avanza Handoff Surface",
];

const uxReadinessStates = [
  "UX0: undocumented surface",
  "UX1: planned surface",
  "UX2: wireframe-ready",
  "UX3: implemented but unaudited",
  "UX4: validated against product principle",
  "UX5: production-grade low-noise experience",
];

function runProductUxVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-328-product-ux-surface-map-verify.mjs"],
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

test("product UX surface map doc exists and records safe planning baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("product_ux_surface_map_status: map_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("UX/product planning only");
  expect(doc).toContain("not UI implementation");
  expect(doc).toContain("runtime change");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("execution change");
  expect(doc).toContain("This is not deploy readiness.");
});

test("product UX surface map states quiet co-pilot principle", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Ture should feel like a quiet intelligent co-pilot");
  expect(doc).toContain("simple, calm, and action-oriented");
  expect(doc).toContain("should not need to analyze raw market noise");
  expect(doc).toContain(
    "Recommendation cards should explain the trade without overwhelming the user",
  );
  expect(doc).toContain("Deeper diagnostics belong behind secondary surfaces");
});

test("product UX surface map lists all primary user surfaces", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const surface of primarySurfaces) {
    expect(doc).toContain(surface);
  }
  expect(doc).toContain("show current trading window");
  expect(doc).toContain("show limited recommendations");
  expect(doc).toContain("present ticker, direction, entry, stop, target");
  expect(doc).toContain("include recommendations not taken by user");
  expect(doc).toContain("support learning transparency");
  expect(doc).toContain("semi-automatic order preparation");
  expect(doc).toContain("final buy/sell confirmation always manual");
});

test("product UX surface map includes recommendation card hierarchy", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Recommendation Card Information Hierarchy");
  expect(doc).toContain("Primary:");
  expect(doc).toContain("ticker");
  expect(doc).toContain("direction");
  expect(doc).toContain("entry");
  expect(doc).toContain("stop");
  expect(doc).toContain("target");
  expect(doc).toContain("confidence");
  expect(doc).toContain("setup label");
  expect(doc).toContain("one-sentence reason");
  expect(doc).toContain("CTA");
  expect(doc).toContain("Secondary:");
  expect(doc).toContain("risk/reward");
  expect(doc).toContain("quality gates");
  expect(doc).toContain("VWAP/momentum/volume evidence");
  expect(doc).toContain("Hidden/deep:");
  expect(doc).toContain("raw candles");
  expect(doc).toContain("provider diagnostics");
  expect(doc).toContain("replay diagnostics");
  expect(doc).toContain("dev-only no-effect flags");
});

test("product UX surface map includes noise reduction rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no broad market data tables on primary surface");
  expect(doc).toContain("no excessive indicators on cards");
  expect(doc).toContain("no provider/internal diagnostics unless needed");
  expect(doc).toContain("no replay/debug info in primary recommendation card");
  expect(doc).toContain("no execution controls before recommendation quality is clear");
  expect(doc).toContain("no autonomous execution copy");
  expect(doc).toContain("no false certainty in confidence language");
});

test("product UX surface map includes learning replay placement and UX states", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain(
    "Static replay foundation should eventually inform History/Statistics and dev review first",
  );
  expect(doc).toContain("Replay should not immediately alter live ranking");
  expect(doc).toContain("Replay results should be framed as evaluation, not trading advice");
  expect(doc).toContain(
    "Learning feedback should improve future confidence only after validation",
  );

  for (const state of uxReadinessStates) {
    expect(doc).toContain(state);
  }
  expect(doc).toContain("Current UX is not yet UX5");
});

test("product UX surface map lists next UX actions and blocked work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 329: Recommendation Engine Gate Test Plan");
  expect(doc).toContain("Action 330: Confidence Calibration Static Metric Spec");
  expect(doc).toContain("Action 331: Recommendation Card Content Hierarchy Spec");
  expect(doc).toContain("Action 332: History/Statistics Learning Surface Spec");
  expect(doc).toContain("Action 333: Execution Agent Boundary Refresh");
  expect(doc).toContain("do not implement UI changes in this action");
  expect(doc).toContain("do not add app/page routes");
  expect(doc).toContain("do not deploy");
  expect(doc).toContain("do not push main");
});

test("verifier script exists exits 0 and reports map ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runProductUxVerifier());

  expect(source).toContain("action-328-product-ux-surface-map.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.product_ux_surface_map_found).toBe(true);
  expect(parsed.map_status_found).toBe(true);
  expect(parsed.product_ux_principle_found).toBe(true);
  expect(parsed.primary_surfaces_found).toBe(true);
  expect(parsed.primary_surfaces_missing).toEqual([]);
  expect(parsed.recommendation_card_hierarchy_found).toBe(true);
  expect(parsed.noise_reduction_rules_found).toBe(true);
  expect(parsed.learning_replay_ux_placement_found).toBe(true);
  expect(parsed.ux_readiness_states_found).toBe(true);
  expect(parsed.ux_readiness_states_missing).toEqual([]);
  expect(parsed.next_ux_actions_found).toBe(true);
  expect(parsed.what_not_to_do_yet_found).toBe(true);
});

test("verifier output blocks deploy main runtime page UI proxy scanner ranking and execution changes", () => {
  const parsed = JSON.parse(runProductUxVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.page_route_changes_allowed).toBe(false);
  expect(parsed.ui_implementation_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.execution_change_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runProductUxVerifier();
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
  expect(parsed.no_effect_flags.ui_implementation_changed).toBe(false);
  expect(parsed.no_effect_flags.app_page_route_added).toBe(false);
  expect(parsed.no_effect_flags.add_trade_changed).toBe(false);
  expect(parsed.no_effect_flags.broker_execution_risk_changed).toBe(false);
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

test("Action 328 adds no app api or page route and does not modify proxy", () => {
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

test("Action 309 Action 323 Action 327 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const readinessMap = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-323-recommendation-engine-readiness-map-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const rolloutPlan = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-327-learning-backfill-runtime-rollout-plan-verify.mjs"],
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
  expect(readinessMap.verification_status).toBe("passed");
  expect(rolloutPlan.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
