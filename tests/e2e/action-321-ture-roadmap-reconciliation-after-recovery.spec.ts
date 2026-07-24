import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-321-ture-roadmap-reconciliation-after-recovery.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-321-ture-roadmap-reconciliation-verify.mjs",
);

function runRoadmapVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-321-ture-roadmap-reconciliation-verify.mjs"],
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

test("roadmap reconciliation doc exists and records recovery baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("roadmap_reconciliation_status: product_focus_restored");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("9b55e5a");
  expect(doc).toContain("f8775dd");
  expect(doc).toContain("Action 320 package manifest exists: yes");
});

test("roadmap reconciliation restores Ture product identity", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Ture is a learning recommendation engine for US daytrading");
  expect(doc).toContain("quiet intelligent co-pilot");
  expect(doc).toContain("not a noisy analysis tool");
  expect(doc).toContain("limited number of high-quality day trade recommendations");
  expect(doc).toContain("Ture should learn from all recommendations");
  expect(doc).toContain("Execution is secondary until the recommendation engine proves value");
  expect(doc).toContain("user always makes the final manual");
  expect(doc).toContain("KÖP/SÄLJ confirmation");
});

test("roadmap reconciliation includes the five active roadmap tracks", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("1. Recommendation Engine");
  expect(doc).toContain("scan windows");
  expect(doc).toContain("candidate discovery");
  expect(doc).toContain("2. Learning / Backfill / Replay");
  expect(doc).toContain("recommendation snapshots");
  expect(doc).toContain("target/stop-first evaluation");
  expect(doc).toContain("3. User-Facing Product UX");
  expect(doc).toContain("simple recommendation cards");
  expect(doc).toContain("4. Risk / Discipline / Trade Management");
  expect(doc).toContain("stop discipline");
  expect(doc).toContain("5. Execution Agent");
  expect(doc).toContain("semi-automatic Avanza handoff");
});

test("roadmap reconciliation maps Actions 309-320 to learning backfill replay", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Actions 309-320");
  expect(doc).toContain("roadmap track 2: Learning / Backfill / Replay");
  expect(doc).toContain("result model");
  expect(doc).toContain("static simulation engine");
  expect(doc).toContain("fixtures");
  expect(doc).toContain("summary evaluator");
  expect(doc).toContain("inspection report");
  expect(doc).toContain("local preview script");
  expect(doc).toContain("golden snapshots");
  expect(doc).toContain("branch package manifest");
  expect(doc).toContain("learn from every recommendation");
});

test("roadmap reconciliation lists paused and blocked work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("runtime replay route");
  expect(doc).toContain("production API route work");
  expect(doc).toContain("Supabase replay write path");
  expect(doc).toContain("provider refetch path");
  expect(doc).toContain("scanner/ranking integration");
  expect(doc).toContain("UI surfacing of replay reports");
  expect(doc).toContain("execution agent work");
  expect(doc).toContain("Any new app/api route");
  expect(doc).toContain("Any proxy/middleware change");
  expect(doc).toContain("Any Netlify config change");
  expect(doc).toContain("Any production replay execution");
  expect(doc).toContain("Any deploy without explicit deploy readiness checklist");
});

test("roadmap reconciliation lists next product-focused sequence and final direction", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 322: Ture Product Roadmap Index");
  expect(doc).toContain("Action 323: Recommendation Engine Readiness Map");
  expect(doc).toContain("Action 324: Learning/Backfill Runtime Rollout Plan");
  expect(doc).toContain(
    "Action 325: Product UX Surface Map for Recommendation Cards, History, Statistics",
  );
  expect(doc).toContain("Action 326: Execution Agent Boundary Refresh");
  expect(doc).toContain("Runtime rollout must stay blocked");
  expect(doc).toContain("Execution remains secondary");
  expect(doc).toContain("We are still building Ture");
});

test("roadmap reconciliation says not deploy readiness", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("This is a roadmap reconciliation, not deploy readiness");
  expect(doc).toContain("does not authorize");
  expect(doc).toContain("production deploy");
  expect(doc).toContain("main push");
  expect(doc).toContain("runtime route additions");
  expect(doc).toContain("proxy or middleware");
});

test("verifier script exists exits 0 and reports restored product focus", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runRoadmapVerifier());

  expect(source).toContain("action-321-ture-roadmap-reconciliation-after-recovery.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.roadmap_reconciliation_found).toBe(true);
  expect(parsed.product_focus_restored).toBe(true);
  expect(parsed.includes_ture_product_identity).toBe(true);
  expect(parsed.includes_roadmap_tracks).toBe(true);
  expect(parsed.includes_actions_309_320_mapping).toBe(true);
  expect(parsed.includes_paused_work).toBe(true);
  expect(parsed.includes_blocked_work).toBe(true);
  expect(parsed.includes_next_product_sequence).toBe(true);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("verifier output contains no secrets and all no-effect flags remain false", () => {
  const output = runRoadmapVerifier();
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
  expect(parsed.no_effect_flags.learning_acceleration_changed).toBe(false);
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

test("Action 321 adds no app api route and does not modify proxy", () => {
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

test("Action 309 through Action 320 verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const manifest = JSON.parse(
    execFileSync("node", ["scripts/action-317-static-release-manifest-verify.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const readiness = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-318-static-replay-batch-commit-readiness-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const postCommit = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-319-static-replay-batch-post-commit-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const packageManifest = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-320-static-replay-branch-package-verify.mjs"],
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
  expect(manifest.verification_status).toBe("passed");
  expect(readiness.verification_status).toBe("passed");
  expect(postCommit.verification_status).toBe("passed");
  expect(packageManifest.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
