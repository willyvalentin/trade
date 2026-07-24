import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-344-runtime-ping-only-route-implementation-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
);

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs"],
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

test("runtime ping-only implementation plan doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "runtime_ping_only_route_implementation_plan_status: implementation_plan_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("runtime ping-only route implementation planning only");
  expect(doc).toContain("not route implementation");
  expect(doc).toContain("runtime implementation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("Supabase access");
  expect(doc).toContain("replay execution");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("main-push authorization");
});

test("runtime ping-only implementation plan explains purpose", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Future runtime work must restart with the smallest possible proof route");
  expect(doc).toContain("exists only to prove Next runtime health");
  expect(doc).toContain("must not import or execute any intelligence, backfill, replay, provider, or Supabase logic");
  expect(doc).toContain("prevent another Action 307/308-style production failure");
  expect(doc).toContain("No route is added by this action");
});

test("runtime ping-only implementation plan defines future route contract", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("route path placeholder: /api/runtime-health/ping");
  expect(doc).toContain("method: GET only");
  expect(doc).toContain("response: static JSON only");
  expect(doc).toContain("no auth dependency for first proof if possible");
  expect(doc).toContain("no request body");
  expect(doc).toContain("no query behavior");
  expect(doc).toContain("no provider imports");
  expect(doc).toContain("no Supabase imports");
  expect(doc).toContain("no replay imports");
  expect(doc).toContain("no scanner/ranking imports");
  expect(doc).toContain("no env reads");
  expect(doc).toContain("no writes");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no random IDs");
  expect(doc).toContain("stable route_build_marker");
  expect(doc).toContain("all no-effect flags false");
});

test("runtime ping-only implementation plan defines required response shape", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain('"ok": true');
  expect(doc).toContain('"route_ping": true');
  expect(doc).toContain('"route_build_marker": "action_344_future_runtime_ping_only_route"');
  expect(doc).toContain('"provider_call_executed": false');
  expect(doc).toContain('"provider_call_attempted": false');
  expect(doc).toContain('"supabase_read_executed": false');
  expect(doc).toContain('"supabase_write_executed": false');
  expect(doc).toContain('"replay_executed": false');
  expect(doc).toContain('"synthetic_outcomes_persisted": false');
  expect(doc).toContain('"scanner_behavior_changed": false');
  expect(doc).toContain('"live_ranking_changed": false');
  expect(doc).toContain('"recommendation_rows_mutated": false');
  expect(doc).toContain('"runtime_route_scope": "ping_only"');
  expect(doc).toContain('"deploy_readiness_required": true');
});

test("runtime ping-only implementation plan lists forbidden implementation details", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no proxy.ts changes");
  expect(doc).toContain("no middleware changes");
  expect(doc).toContain("no netlify.toml changes");
  expect(doc).toContain("no route-publication diagnostic experiments");
  expect(doc).toContain("no broad runtime probes");
  expect(doc).toContain("no POST");
  expect(doc).toContain("no provider calls");
  expect(doc).toContain("no Supabase calls");
  expect(doc).toContain("no replay simulation");
  expect(doc).toContain("no static replay imports");
  expect(doc).toContain("no learning dataset imports");
  expect(doc).toContain("no context schema imports");
  expect(doc).toContain("no scanner/ranking imports");
  expect(doc).toContain("no auth boundary experiments");
  expect(doc).toContain("no branch deploy publish while non-production runtime is untrusted");
});

test("runtime ping-only implementation plan lists future file and validation plans", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("one app/api runtime health ping route file");
  expect(doc).toContain("one tiny pure route marker helper if necessary");
  expect(doc).toContain("one focused test spec");
  expect(doc).toContain("one implementation result doc");
  expect(doc).toContain("No other surfaces may change");
  expect(doc).toContain("git status before implementation");
  expect(doc).toContain("Action 309 guard");
  expect(doc).toContain("Action 338 checklist verifier");
  expect(doc).toContain("Action 344 plan verifier");
  expect(doc).toContain("grep for forbidden 307K marker");
  expect(doc).toContain("git diff must include only allowed future route/doc/test files");
  expect(doc).toContain("focused Playwright spec");
});

test("runtime ping-only implementation plan lists rollout preconditions and rollback", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("production old pings healthy before deploy");
  expect(doc).toContain("rollback target recorded");
  expect(doc).toContain("route table inspection plan ready");
  expect(doc).toContain("all approval flags explicitly reviewed");
  expect(doc).toContain("main branch source clean and known");
  expect(doc).toContain("deploy must be explicitly approved by user");
  expect(doc).toContain("rollback immediately on HTTP 400 empty body");
  expect(doc).toContain("rollback to deployId 6a501645908e4100088b7396 or newer known-good target");
  expect(doc).toContain("verify old known-good pings");
  expect(doc).toContain("do not hotfix proxy/middleware in production");
  expect(doc).toContain("stop and document failed route rollout");
});

test("runtime ping-only implementation plan includes approval flags and blocked work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("TURE_RUNTIME_PING_ROUTE_IMPLEMENTATION_APPROVED=false");
  expect(doc).toContain("TURE_RUNTIME_ROUTE_DEPLOY_APPROVED=false");
  expect(doc).toContain("TURE_PROVIDER_CALLS_APPROVED=false");
  expect(doc).toContain("TURE_SUPABASE_READ_APPROVED=false");
  expect(doc).toContain("TURE_SUPABASE_WRITE_APPROVED=false");
  expect(doc).toContain("TURE_REPLAY_EXECUTION_APPROVED=false");
  expect(doc).toContain("TURE_SCANNER_RANKING_MUTATION_APPROVED=false");
  expect(doc).toContain("no route implementation yet");
  expect(doc).toContain("no app/api changes yet");
  expect(doc).toContain("no deployment yet");
  expect(doc).toContain("no main push yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no Supabase access yet");
  expect(doc).toContain("no replay execution yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
});

test("runtime ping-only implementation plan lists next actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 345: First Tiny Provider Capacity Experiment Plan");
  expect(doc).toContain("Action 346: Existing Schema Compatibility Matrix");
  expect(doc).toContain("Action 347: Learning Dataset Static Fixture Implementation Plan");
  expect(doc).toContain("Action 348: Intelligence Context Static Fixture Implementation Plan");
  expect(doc).toContain("Action 349: Pattern Insight Static Fixture Spec");
  expect(doc).toContain("Action 350: Runtime Ping-Only Route Approval Gate");
});

test("runtime ping-only verifier exists exits zero and reports safe false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.implementation_plan_found).toBe(true);
  expect(parsed.plan_status_found).toBe(true);
  expect(parsed.future_route_contract_found).toBe(true);
  expect(parsed.response_shape_found).toBe(true);
  expect(parsed.forbidden_implementation_details_found).toBe(true);
  expect(parsed.future_file_plan_found).toBe(true);
  expect(parsed.local_validation_plan_found).toBe(true);
  expect(parsed.production_rollout_preconditions_found).toBe(true);
  expect(parsed.rollback_procedure_found).toBe(true);
  expect(parsed.approval_flags_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
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
  expect(parsed.no_effect_flags.route_implemented).toBe(false);
  expect(parsed.no_effect_flags.app_api_route_added).toBe(false);
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
});

test("runtime ping-only verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("runtime ping-only verifier source avoids env provider Supabase runtime and nondeterminism", () => {
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

test("Action 344 adds no app route proxy middleware netlify config or migration", () => {
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
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 338 Action 343 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const rollout = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const patternInsight = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-343-pattern-insight-static-type-spec-verify.mjs"],
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
  expect(rollout.verification_status).toBe("passed");
  expect(patternInsight.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
