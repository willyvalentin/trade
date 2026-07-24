import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-327-learning-backfill-runtime-rollout-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-327-learning-backfill-runtime-rollout-plan-verify.mjs",
);

const rolloutPhases = [
  "Phase 0: Static/local only",
  "Phase 1: Runtime ping-only route",
  "Phase 2: Runtime diagnostic read-only route",
  "Phase 3: Supabase read-only replay input route",
  "Phase 4: Replay execution dry-run route",
  "Phase 5: Synthetic outcome write audit route",
  "Phase 6: Learning review integration",
  "Phase 7: Controlled calibration/ranking research",
];

const approvalFlags = [
  "TURE_RUNTIME_PING_ROLLOUT_APPROVED=false",
  "TURE_REPLAY_READ_ONLY_ROUTE_APPROVED=false",
  "TURE_REPLAY_DRY_RUN_ROUTE_APPROVED=false",
  "TURE_SYNTHETIC_OUTCOME_WRITE_APPROVED=false",
  "TURE_LEARNING_REVIEW_INTEGRATION_APPROVED=false",
  "TURE_CONFIDENCE_CALIBRATION_RESEARCH_APPROVED=false",
  "TURE_SCANNER_RANKING_MUTATION_APPROVED=false",
];

function runRolloutPlanVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-327-learning-backfill-runtime-rollout-plan-verify.mjs"],
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

test("rollout plan doc exists and records safe rollout baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "learning_backfill_runtime_rollout_status: rollout_plan_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("runtime rollout planning only");
  expect(doc).toContain("not runtime implementation");
  expect(doc).toContain("This is not deploy readiness.");
});

test("rollout plan explains purpose after runtime boundary recovery", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("learn from every recommendation");
  expect(doc).toContain("target/stop-first outcomes");
  expect(doc).toContain("no-entry outcomes");
  expect(doc).toContain("R multiples");
  expect(doc).toContain("confidence calibration");
  expect(doc).toContain("setup performance");
  expect(doc).toContain("Action 307/308 exposed a production runtime boundary failure");
  expect(doc).toContain("prevent another production break");
});

test("rollout plan lists prerequisites and phases 0 through 7", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("production remains healthy on rollback deploy");
  expect(doc).toContain("local/static replay foundation passes");
  expect(doc).toContain("staging or production-safe route rollout checklist exists");
  expect(doc).toContain("approval flags remain false by default");
  expect(doc).toContain("no provider calls without explicit approval");
  expect(doc).toContain("no Supabase writes without explicit approval");
  expect(doc).toContain("no scanner/ranking mutation until learning results are validated");
  expect(doc).toContain("deployment route table is inspected before testing");

  for (const phase of rolloutPhases) {
    expect(doc).toContain(phase);
  }
});

test("rollout plan lists approval flags default false", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const flag of approvalFlags) {
    expect(doc).toContain(flag);
  }
});

test("rollout plan includes route safety and production deploy checklist", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no proxy.ts changes");
  expect(doc).toContain("no middleware changes");
  expect(doc).toContain("no Netlify config changes");
  expect(doc).toContain("no broad route publication experiments");
  expect(doc).toContain("no 307K-style diagnostic proxy marker");
  expect(doc).toContain("route must return no-effect flags");
  expect(doc).toContain("route must not import provider/Supabase unless phase allows it");
  expect(doc).toContain("confirm production pings healthy before deploy");
  expect(doc).toContain("inspect Netlify route table before testing");
  expect(doc).toContain("rollback immediately on HTTP 400 empty body");
  expect(doc).toContain("never test write/execution route first");
  expect(doc).toContain(
    "never publish branch deploy if non-production runtime is still untrusted",
  );
});

test("rollout plan lists blocked work and next actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("any new runtime route implementation");
  expect(doc).toContain("any Supabase write");
  expect(doc).toContain("any provider refetch path");
  expect(doc).toContain("any synthetic outcome persistence");
  expect(doc).toContain("any scanner/ranking mutation");
  expect(doc).toContain("any confidence threshold mutation");
  expect(doc).toContain("Action 328: Product UX Surface Map");
  expect(doc).toContain("Action 329: Recommendation Engine Gate Test Plan");
  expect(doc).toContain("Action 330: Confidence Calibration Static Metric Spec");
  expect(doc).toContain("Action 331: Runtime Ping-Only Rollout Checklist");
  expect(doc).toContain("Action 332: Staging Site Setup Plan");
});

test("verifier script exists exits 0 and reports rollout plan ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runRolloutPlanVerifier());

  expect(source).toContain("action-327-learning-backfill-runtime-rollout-plan.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.rollout_plan_found).toBe(true);
  expect(parsed.rollout_status_found).toBe(true);
  expect(parsed.prerequisites_found).toBe(true);
  expect(parsed.rollout_phases_found).toBe(true);
  expect(parsed.rollout_phases_missing).toEqual([]);
  expect(parsed.approval_flags_found).toBe(true);
  expect(parsed.approval_flags_missing).toEqual([]);
  expect(parsed.route_safety_rules_found).toBe(true);
  expect(parsed.production_deploy_safety_checklist_found).toBe(true);
  expect(parsed.blocked_until_later_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks runtime deploy provider Supabase and scanner ranking mutation", () => {
  const parsed = JSON.parse(runRolloutPlanVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.runtime_implementation_allowed).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runRolloutPlanVerifier();
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
  expect(parsed.no_effect_flags.confidence_thresholds_mutated).toBe(false);
  expect(parsed.no_effect_flags.runtime_route_added).toBe(false);
  expect(parsed.no_effect_flags.deploy_executed).toBe(false);
  expect(parsed.no_effect_flags.main_pushed).toBe(false);
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

test("Action 327 adds no app api route and does not modify proxy", () => {
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

test("Action 309 Action 323 Action 326 and golden verifiers still pass", () => {
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
  const setupTaxonomy = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-326-setup-taxonomy-and-confidence-calibration-map-verify.mjs"],
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
  expect(setupTaxonomy.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
