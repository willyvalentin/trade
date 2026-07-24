import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-325-recommendation-quality-gates-audit.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-325-recommendation-quality-gates-audit-verify.mjs",
);

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

function runQualityGatesVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-325-recommendation-quality-gates-audit-verify.mjs"],
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

test("quality gates audit doc exists and records safe audit baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("recommendation_quality_gates_audit_status: audit_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("recommendation quality gate audit planning only");
  expect(doc).toContain("not runtime change");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
});

test("quality gates audit explains purpose and product promise", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("reject weak/noisy/stale/unsafe recommendations");
  expect(doc).toContain("limited, high-quality, actionable recommendations");
  expect(doc).toContain("quiet and intelligent");
  expect(doc).toContain(
    "connect to learning/backfill outcomes and confidence calibration",
  );
});

test("quality gates audit lists all fourteen required gates", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const gate of requiredGates) {
    expect(doc).toContain(gate);
  }
  expect(doc).toContain("purpose:");
  expect(doc).toContain("protects against:");
  expect(doc).toContain("expected pass idea:");
  expect(doc).toContain("expected fail idea:");
  expect(doc).toContain("evidence needed:");
  expect(doc).toContain("current readiness:");
  expect(doc).toContain("next audit step:");
});

test("quality gates audit includes severity model and product interpretation", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Gate Severity Model");
  expect(doc).toContain("blocking: recommendation must not be shown");
  expect(doc).toContain(
    "warning: recommendation may be shown but should be marked/discounted",
  );
  expect(doc).toContain("diagnostic: background insight only");
  expect(doc).toContain("fewer but better recommendations");
  expect(doc).toContain("less user analysis");
  expect(doc).toContain("clearer cards");
  expect(doc).toContain("better trust");
  expect(doc).toContain("better learning feedback loop");
});

test("quality gates audit includes findings summary and blocked operations", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Audit Findings Summary");
  expect(doc).toContain(
    "| gate | severity | current readiness | likely product risk if weak | next audit action |",
  );
  expect(doc).toContain("Current readiness values are known | partial | needs audit");
  expect(doc).toContain("do not change gate thresholds");
  expect(doc).toContain("do not mutate scanner/ranking");
  expect(doc).toContain("do not add API routes");
  expect(doc).toContain("do not connect static replay to live ranking");
  expect(doc).toContain("do not persist synthetic outcomes");
  expect(doc).toContain("do not deploy");
  expect(doc).toContain("do not push main");
});

test("quality gates audit lists next actions 326 through 329", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 326: Setup Taxonomy and Confidence Calibration Map");
  expect(doc).toContain("Action 327: Learning/Backfill Runtime Rollout Plan");
  expect(doc).toContain("Action 328: Product UX Surface Map");
  expect(doc).toContain("Action 329: Recommendation Engine Gate Test Plan");
});

test("verifier script exists exits 0 and reports audit ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runQualityGatesVerifier());

  expect(source).toContain("action-325-recommendation-quality-gates-audit.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.quality_gates_audit_found).toBe(true);
  expect(parsed.audit_status_found).toBe(true);
  expect(parsed.all_required_gates_found).toBe(true);
  expect(parsed.required_gates_missing).toEqual([]);
  expect(parsed.severity_model_found).toBe(true);
  expect(parsed.product_interpretation_found).toBe(true);
  expect(parsed.audit_findings_summary_found).toBe(true);
  expect(parsed.what_not_to_do_yet_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main runtime proxy and scanner ranking mutation", () => {
  const parsed = JSON.parse(runQualityGatesVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runQualityGatesVerifier();
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

test("Action 325 adds no app api route and does not modify proxy", () => {
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

test("Action 309 Action 323 Action 324 and golden verifiers still pass", () => {
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
  const inventory = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-324-recommendation-engine-code-surface-inventory-verify.mjs"],
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
  expect(inventory.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
