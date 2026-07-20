import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-331-intelligence-first-roadmap-reprioritization.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-331-intelligence-first-roadmap-reprioritization-verify.mjs",
);

const priorityAreas = [
  "Recommendation Engine Intelligence",
  "Daily Data Collection",
  "Historical Data Collection / Backfill",
  "Learning / Replay / Outcome Analysis",
  "Confidence Calibration / Pattern Recognition",
  "Product UX / UI",
  "Execution Agent",
];

const nextActions = [
  "Action 332: Daily Trading Data Collection Readiness Map",
  "Action 333: Historical Data Backfill Coverage Plan",
  "Action 334: Recommendation Snapshot Completeness Audit",
  "Action 335: Learning Outcome Dataset Design",
  "Action 336: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 337: First Static Gate Helper Extraction Plan",
  "Action 338: Runtime Ping-Only Rollout Checklist",
];

function runReprioritizationVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-331-intelligence-first-roadmap-reprioritization-verify.mjs"],
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

test("intelligence-first reprioritization doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("intelligence_first_roadmap_status: reprioritized");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("roadmap reprioritization only");
  expect(doc).toContain("not runtime implementation");
  expect(doc).toContain("UI implementation");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("data collection implementation");
  expect(doc).toContain("This is not deploy readiness.");
});

test("intelligence-first reprioritization records user direction", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("The user already has a Figma design for the UI");
  expect(doc).toContain("UX/UI work should be handled near the end");
  expect(doc).toContain("Current priority is the recommendation engine and intelligence layer");
  expect(doc).toContain("Ture should collect data every trading day");
  expect(doc).toContain("Ture should collect historical data");
  expect(doc).toContain("Ture should learn as much as possible from recommendations and outcomes");
  expect(doc).toContain("Ture should detect patterns");
  expect(doc).toContain("Execution and UI polish are secondary");
});

test("intelligence-first reprioritization lists updated product priority order", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const area of priorityAreas) {
    expect(doc).toContain(area);
  }
  expect(doc).toContain("scan quality");
  expect(doc).toContain("setup detection");
  expect(doc).toContain("collect market data every trading day");
  expect(doc).toContain("preserve recommendation snapshots");
  expect(doc).toContain("collect enough historical candles");
  expect(doc).toContain("target/stop/no-entry/open-at-window-end outcomes");
  expect(doc).toContain("identify which confidence labels are over/underconfident");
});

test("intelligence-first reprioritization moves UX later and preserves Figma reference", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Product UX Surface Map remains useful");
  expect(doc).toContain("UX/UI is no longer the next active development priority");
  expect(doc).toContain("Recommendation Card hierarchy and UI implementation should be postponed");
  expect(doc).toContain("Figma design should remain the reference for later product surface work");
  expect(doc).toContain("use existing Figma design later");
});

test("intelligence-first reprioritization lists new next actions and Action 332 next", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
  expect(doc).toContain(
    "The next action should be Action 332: Daily Trading Data Collection Readiness Map",
  );
});

test("intelligence-first reprioritization includes runtime caution and blocked work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("runtime/provider/Supabase paths");
  expect(doc).toContain("still blocked until a safe rollout checklist exists");
  expect(doc).toContain("No new app/api routes yet");
  expect(doc).toContain("No provider calls yet");
  expect(doc).toContain("No Supabase writes yet");
  expect(doc).toContain("No deploy yet");
  expect(doc).toContain("do not focus on UI implementation now");
  expect(doc).toContain("do not add runtime data collection routes yet");
  expect(doc).toContain("do not mutate scanner/ranking yet");
  expect(doc).toContain("do not change confidence thresholds yet");
  expect(doc).toContain("do not deploy");
  expect(doc).toContain("do not push main");
});

test("verifier script exists exits 0 and reports reprioritized", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runReprioritizationVerifier());

  expect(source).toContain("action-331-intelligence-first-roadmap-reprioritization.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.reprioritization_doc_found).toBe(true);
  expect(parsed.intelligence_first_status_found).toBe(true);
  expect(parsed.user_direction_found).toBe(true);
  expect(parsed.updated_priority_order_found).toBe(true);
  expect(parsed.priority_areas_missing).toEqual([]);
  expect(parsed.ux_deprioritized_found).toBe(true);
  expect(parsed.figma_reference_preserved).toBe(true);
  expect(parsed.new_next_actions_found).toBe(true);
  expect(parsed.next_actions_missing).toEqual([]);
  expect(parsed.runtime_caution_found).toBe(true);
  expect(parsed.what_not_to_do_yet_found).toBe(true);
  expect(parsed.action_332_next_found).toBe(true);
});

test("verifier output blocks runtime provider Supabase UI execution scanner ranking and confidence threshold changes", () => {
  const parsed = JSON.parse(runReprioritizationVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.ui_implementation_allowed).toBe(false);
  expect(parsed.execution_change_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runReprioritizationVerifier();
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
  expect(parsed.no_effect_flags.confidence_thresholds_mutated).toBe(false);
  expect(parsed.no_effect_flags.ui_implementation_changed).toBe(false);
  expect(parsed.no_effect_flags.execution_changed).toBe(false);
  expect(parsed.no_effect_flags.data_collection_implemented).toBe(false);
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

test("Action 331 adds no app api or page route and does not modify proxy", () => {
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

test("Action 309 Action 327 Action 330 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const rolloutPlan = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-327-learning-backfill-runtime-rollout-plan-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const metricSpec = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-330-confidence-calibration-static-metric-spec-verify.mjs"],
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
  expect(rolloutPlan.verification_status).toBe("passed");
  expect(metricSpec.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
