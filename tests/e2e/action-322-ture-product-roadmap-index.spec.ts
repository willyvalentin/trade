import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(process.cwd(), "docs/action-322-ture-product-roadmap-index.md");
const verifierPath = join(
  process.cwd(),
  "scripts/action-322-ture-product-roadmap-index-verify.mjs",
);

function runRoadmapIndexVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-322-ture-product-roadmap-index-verify.mjs"],
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

test("roadmap index doc exists and records planning baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("roadmap_index_status: product_roadmap_index_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
});

test("roadmap index states the product north star", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Ture is a learning recommendation engine for US daytrading");
  expect(doc).toContain("simple on the surface, hyperintelligent under the hood");
  expect(doc).toContain("limited number of");
  expect(doc).toContain("high-quality, clear, actionable day trade recommendations");
  expect(doc).toContain("Ture should learn from every recommendation");
  expect(doc).toContain("Execution is secondary");
  expect(doc).toContain("user always confirms final KÖP/SÄLJ manually");
});

test("roadmap index lists the five roadmap tracks", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("### 1. Recommendation Engine");
  expect(doc).toContain("find candidates");
  expect(doc).toContain("score setup quality");
  expect(doc).toContain("### 2. Learning / Backfill / Replay");
  expect(doc).toContain("replay historical outcomes");
  expect(doc).toContain("### 3. Product UX");
  expect(doc).toContain("show recommendation cards");
  expect(doc).toContain("### 4. Risk / Discipline / Trade Management");
  expect(doc).toContain("risk per trade");
  expect(doc).toContain("### 5. Execution Agent");
  expect(doc).toContain("semi-automatic Avanza handoff");
});

test("roadmap index lists recommended near-term order and Action 323 next", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 323: Recommendation Engine Readiness Map");
  expect(doc).toContain("Action 324: Learning/Backfill Runtime Rollout Plan");
  expect(doc).toContain("Action 325: Product UX Surface Map");
  expect(doc).toContain("Action 326: Execution Agent Boundary Refresh");
  expect(doc).toContain("Action 327: Risk / Discipline / Trade Management Readiness Map");
  expect(doc).toContain("Recommendation quality is the product core");
  expect(doc).toContain(
    "The next product-focused action should be Action 323: Recommendation Engine",
  );
});

test("roadmap index lists what not to do yet and is not deploy readiness", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("This is roadmap planning, not deploy readiness");
  expect(doc).toContain("does not authorize");
  expect(doc).toContain("production deploy");
  expect(doc).toContain("main push");
  expect(doc).toContain("runtime route additions");
  expect(doc).toContain("proxy or middleware");
  expect(doc).toContain("do not add new app/api replay route");
  expect(doc).toContain("do not change proxy/middleware");
  expect(doc).toContain("do not deploy static branch package");
  expect(doc).toContain("do not push main");
  expect(doc).toContain("do not integrate replay into scanner/ranking");
  expect(doc).toContain("do not persist synthetic outcomes");
  expect(doc).toContain("do not work on autonomous execution");
});

test("verifier script exists exits 0 and reports roadmap index ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runRoadmapIndexVerifier());

  expect(source).toContain("action-322-ture-product-roadmap-index.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.roadmap_index_found).toBe(true);
  expect(parsed.product_north_star_found).toBe(true);
  expect(parsed.roadmap_tracks_found).toBe(true);
  expect(parsed.recommendation_engine_track_found).toBe(true);
  expect(parsed.learning_backfill_replay_track_found).toBe(true);
  expect(parsed.product_ux_track_found).toBe(true);
  expect(parsed.risk_discipline_track_found).toBe(true);
  expect(parsed.execution_agent_track_found).toBe(true);
  expect(parsed.recommended_near_term_order_found).toBe(true);
  expect(parsed.what_not_to_do_yet_found).toBe(true);
  expect(parsed.action_323_next).toBe(true);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runRoadmapIndexVerifier();
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

test("Action 322 adds no app api route and does not modify proxy", () => {
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

test("Action 309 Action 320 Action 321 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const packageManifest = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-320-static-replay-branch-package-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const reconciliation = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-321-ture-roadmap-reconciliation-verify.mjs"],
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
  expect(packageManifest.verification_status).toBe("passed");
  expect(reconciliation.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
