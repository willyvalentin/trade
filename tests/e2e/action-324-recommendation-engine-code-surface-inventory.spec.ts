import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-324-recommendation-engine-code-surface-inventory.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-324-recommendation-engine-code-surface-inventory-verify.mjs",
);

function runInventoryVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-324-recommendation-engine-code-surface-inventory-verify.mjs"],
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

test("inventory doc exists and records static inventory baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "recommendation_engine_inventory_status: code_surface_inventory_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("code surface inventory only");
  expect(doc).toContain("not runtime change");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
});

test("inventory doc explains purpose and recovery caution", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain(
    "locate existing recommendation-engine surfaces before changing them",
  );
  expect(doc).toContain("supports the Action 323 readiness map");
  expect(doc).toContain("avoid changing scanner/ranking blindly");
});

test("inventory doc lists all ten inventory categories", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Market Data / Provider Intake");
  expect(doc).toContain("Scan Orchestration");
  expect(doc).toContain("Candidate Generation");
  expect(doc).toContain("Candidate Validation / Quality Gates");
  expect(doc).toContain("Trade Geometry");
  expect(doc).toContain("Confidence / Scoring");
  expect(doc).toContain("Ranking / Selection");
  expect(doc).toContain("Recommendation Persistence / Snapshots");
  expect(doc).toContain("Learning / Outcome Integration");
  expect(doc).toContain("UI Surfaces That Display Recommendations");
});

test("inventory doc names representative recommendation engine files", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("lib/market-data.ts");
  expect(doc).toContain("lib/day-trade-scan-orchestration.ts");
  expect(doc).toContain("lib/recommendation-generator.ts");
  expect(doc).toContain("lib/real-scanner-candidate-generation.ts");
  expect(doc).toContain("lib/scanner-candidate-ranking.ts");
  expect(doc).toContain("lib/recommendation-snapshot.ts");
  expect(doc).toContain("lib/recommendation-outcome-evaluation-runner.ts");
  expect(doc).toContain("lib/learning-acceleration-mode.ts");
  expect(doc).toContain("app/trade-app.tsx");
  expect(doc).toContain("lib/market-diagnostics-console.ts");
});

test("inventory doc lists no-touch surfaces and blocked operations", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("app/api route additions are blocked");
  expect(doc).toContain("proxy.ts is blocked");
  expect(doc).toContain("middleware is blocked");
  expect(doc).toContain("netlify.toml is blocked");
  expect(doc).toContain("Supabase write changes are blocked");
  expect(doc).toContain("provider calls are blocked");
  expect(doc).toContain("scanner/ranking mutation is blocked in this action");
  expect(doc).toContain("do not modify scanner/ranking");
  expect(doc).toContain("do not add API routes");
  expect(doc).toContain("do not deploy");
  expect(doc).toContain("do not push main");
});

test("inventory doc lists next actions 325 through 328", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 325: Recommendation Quality Gates Audit");
  expect(doc).toContain("Action 326: Setup Taxonomy and Confidence Calibration Map");
  expect(doc).toContain("Action 327: Learning/Backfill Runtime Rollout Plan");
  expect(doc).toContain("Action 328: Product UX Surface Map");
});

test("verifier script exists exits 0 and reports inventory ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runInventoryVerifier());

  expect(source).toContain(
    "action-324-recommendation-engine-code-surface-inventory.md",
  );
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.inventory_doc_found).toBe(true);
  expect(parsed.inventory_status_found).toBe(true);
  expect(parsed.inventory_categories_found).toBe(true);
  expect(parsed.market_data_category_found).toBe(true);
  expect(parsed.scan_orchestration_category_found).toBe(true);
  expect(parsed.candidate_generation_category_found).toBe(true);
  expect(parsed.validation_quality_gates_category_found).toBe(true);
  expect(parsed.trade_geometry_category_found).toBe(true);
  expect(parsed.confidence_scoring_category_found).toBe(true);
  expect(parsed.ranking_selection_category_found).toBe(true);
  expect(parsed.persistence_snapshots_category_found).toBe(true);
  expect(parsed.learning_outcome_category_found).toBe(true);
  expect(parsed.ui_surfaces_category_found).toBe(true);
  expect(parsed.no_touch_surfaces_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main runtime proxy and scanner ranking mutation", () => {
  const output = runInventoryVerifier();
  const parsed = JSON.parse(output);

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runInventoryVerifier();
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

test("Action 324 adds no app api route and does not modify proxy", () => {
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

test("Action 309 Action 321 Action 322 Action 323 and golden verifiers still pass", () => {
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
  const readinessMap = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-323-recommendation-engine-readiness-map-verify.mjs"],
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
  expect(readinessMap.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
