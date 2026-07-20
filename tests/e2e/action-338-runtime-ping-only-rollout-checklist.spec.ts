import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-338-runtime-ping-only-rollout-checklist.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
);

const preconditions = [
  "production pings healthy on rollback deploy or newer known-good deploy",
  "rollback target confirmed",
  "working tree clean",
  "current branch verified",
  "no forbidden 307K/runtime artifacts",
  "no proxy.ts changes",
  "no middleware changes",
  "no Netlify config changes",
  "all approvals false",
  "no provider/Supabase/replay imports planned",
  "route table inspection plan exists",
  "immediate rollback plan exists",
  "production test commands prepared",
];

const futureRequirements = [
  "isolated route",
  "GET only",
  "returns static JSON only",
  "no auth dependency for first proof if possible",
  "no provider imports",
  "no Supabase imports",
  "no replay imports",
  "no scanner/ranking imports",
  "no env reads unless strictly needed",
  "no writes",
  "no dynamic Date.now timestamp",
  "stable route_build_marker",
  "no-effect flags all false",
];

const approvalFlags = [
  "TURE_RUNTIME_PING_ROLLOUT_APPROVED=false",
  "TURE_RUNTIME_ROUTE_DEPLOY_APPROVED=false",
  "TURE_PROVIDER_CALLS_APPROVED=false",
  "TURE_SUPABASE_READ_APPROVED=false",
  "TURE_SUPABASE_WRITE_APPROVED=false",
  "TURE_REPLAY_EXECUTION_APPROVED=false",
  "TURE_SCANNER_RANKING_MUTATION_APPROVED=false",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs"],
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

test("runtime ping-only checklist doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("runtime_ping_only_rollout_checklist_status: checklist_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("runtime ping-only rollout planning only");
  expect(doc).toContain("not route implementation");
  expect(doc).toContain("not route implementation, runtime implementation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("main-push authorization");
});

test("checklist explains purpose and adds no route", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("smallest possible ping-only route");
  expect(doc).toContain("prove Next runtime health");
  expect(doc).toContain("prevent another Action 307/308-style production break");
  expect(doc).toContain("No runtime route is added by this action");
});

test("checklist lists preconditions before any future ping route", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const precondition of preconditions) {
    expect(doc).toContain(precondition);
  }
});

test("checklist lists future ping-only route requirements", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const requirement of futureRequirements) {
    expect(doc).toContain(requirement);
  }
});

test("checklist lists forbidden route behavior", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no POST");
  expect(doc).toContain("no provider calls");
  expect(doc).toContain("no Supabase reads/writes");
  expect(doc).toContain("no replay execution");
  expect(doc).toContain("no synthetic outcome persistence");
  expect(doc).toContain("no scanner/ranking mutation");
  expect(doc).toContain("no proxy marker");
  expect(doc).toContain("no broad diagnostics");
  expect(doc).toContain("no route-publication experiments");
  expect(doc).toContain("no Netlify config changes");
  expect(doc).toContain("no middleware changes");
});

test("checklist includes required verification before deploy and production test sequence", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 309 guard passes");
  expect(doc).toContain("relevant branch/package verifier passes");
  expect(doc).toContain("git diff shows only planned route/doc/test files");
  expect(doc).toContain("no proxy/middleware/netlify changes");
  expect(doc).toContain("build passes");
  expect(doc).toContain("lint passes");
  expect(doc).toContain("typegen passes");
  expect(doc).toContain("Playwright route spec passes locally");
  expect(doc).toContain("production currently healthy before deploy");
  expect(doc).toContain("confirm old known-good pings still return HTTP 200 JSON");
  expect(doc).toContain("deploy only after explicit deploy readiness approval");
  expect(doc).toContain("inspect Netlify route table");
  expect(doc).toContain("test new ping route first");
  expect(doc).toContain("test old known-good pings second");
  expect(doc).toContain("if any HTTP 400 empty body appears, rollback immediately");
  expect(doc).toContain("never test write/replay/provider routes first");
});

test("checklist includes rollback plan and approval flags default false", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("rollback to deployId 6a501645908e4100088b7396 or newer known-good deploy");
  expect(doc).toContain("verify old pings after rollback");
  expect(doc).toContain("do not attempt fixes directly in production");
  expect(doc).toContain("do not retry with proxy/middleware changes");
  expect(doc).toContain("document failed deploy and stop");

  for (const flag of approvalFlags) {
    expect(doc).toContain(flag);
  }
});

test("checklist blocks current route deploy main provider Supabase replay and scanner work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no runtime ping route yet");
  expect(doc).toContain("no deploy yet");
  expect(doc).toContain("no main push yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no Supabase access yet");
  expect(doc).toContain("no replay execution yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("does not authorize route implementation");
  expect(doc).toContain("deploys");
  expect(doc).toContain("main pushes");
});

test("checklist lists next actions 339 through 344", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 339: Historical Backfill Cost and Provider Capacity Plan");
  expect(doc).toContain("Action 340: Snapshot Field Inventory Against Existing Schema");
  expect(doc).toContain("Action 341: Learning Dataset Static Fixture Spec");
  expect(doc).toContain("Action 342: Intelligence Context Static Fixture Spec");
  expect(doc).toContain("Action 343: Pattern Insight Static Type Spec");
  expect(doc).toContain("Action 344: Runtime Ping-Only Route Implementation Plan");
});

test("verifier script exists exits 0 and reports checklist ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-338-runtime-ping-only-rollout-checklist.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.checklist_found).toBe(true);
  expect(parsed.checklist_status_found).toBe(true);
  expect(parsed.preconditions_found).toBe(true);
  expect(parsed.future_ping_route_requirements_found).toBe(true);
  expect(parsed.forbidden_route_behavior_found).toBe(true);
  expect(parsed.required_verification_found).toBe(true);
  expect(parsed.production_test_sequence_found).toBe(true);
  expect(parsed.rollback_plan_found).toBe(true);
  expect(parsed.approval_flags_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy route implementation runtime provider Supabase replay scanner proxy middleware and Netlify changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.route_implementation_allowed).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.supabase_read_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.middleware_changes_allowed).toBe(false);
  expect(parsed.netlify_config_changes_allowed).toBe(false);
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
  expect(parsed.no_effect_flags.supabase_read_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.route_implemented).toBe(false);
  expect(parsed.no_effect_flags.app_api_route_added).toBe(false);
  expect(parsed.no_effect_flags.app_page_route_added).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(parsed.no_effect_flags.proxy_changed).toBe(false);
  expect(parsed.no_effect_flags.middleware_changed).toBe(false);
  expect(parsed.no_effect_flags.netlify_config_changed).toBe(false);
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

test("Action 338 adds no app api page proxy middleware or Netlify config changes", () => {
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
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml/m);
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 337 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const patternRoadmap = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs"],
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
  expect(patternRoadmap.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
