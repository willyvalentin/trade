import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-326-setup-taxonomy-and-confidence-calibration-map.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-326-setup-taxonomy-and-confidence-calibration-map-verify.mjs",
);

const setupFamilies = [
  "momentum_continuation",
  "vwap_reclaim",
  "opening_drive",
  "pullback_to_support",
  "breakout_continuation",
  "reversal_from_exhaustion",
  "range_break",
  "news_or_catalyst_momentum",
];

const confidenceComponents = [
  "data_quality_confidence",
  "setup_quality_confidence",
  "momentum_confirmation",
  "volume_confirmation",
  "vwap_context_confirmation",
  "liquidity_confidence",
  "trade_geometry_quality",
  "risk_reward_quality",
  "market_session_fit",
  "historical_setup_performance",
  "shadow_outcome_feedback",
];

const calibrationMetrics = [
  "target_hit_rate_by_setup",
  "stop_hit_rate_by_setup",
  "no_entry_rate_by_setup",
  "open_at_window_end_rate_by_setup",
  "average_gross_r_multiple_by_setup",
  "confidence_bucket_hit_rate",
  "confidence_bucket_expectancy",
  "confidence_bucket_overconfidence_gap",
  "confidence_bucket_underconfidence_gap",
  "setup_failure_modes",
  "window_specific_performance",
];

function runSetupTaxonomyVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-326-setup-taxonomy-and-confidence-calibration-map-verify.mjs"],
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

test("setup taxonomy map doc exists and records safe map baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "setup_taxonomy_confidence_calibration_status: map_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("setup/confidence roadmap planning only");
  expect(doc).toContain("not runtime change");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("confidence threshold mutation");
});

test("setup taxonomy map explains purpose and calibration promise", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("clear setup taxonomy");
  expect(doc).toContain("understandable, comparable, and learnable");
  expect(doc).toContain("evidence strength and expected outcome reliability");
  expect(doc).toContain("target/stop-first outcomes");
  expect(doc).toContain("no-entry outcomes");
  expect(doc).toContain("open-at-window-end outcomes");
  expect(doc).toContain("R-multiple distributions");
  expect(doc).toContain("fewer, clearer, higher-quality recommendations");
});

test("setup taxonomy map lists all eight setup families with expected details", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const setupFamily of setupFamilies) {
    expect(doc).toContain(setupFamily);
  }
  expect(doc).toContain("description:");
  expect(doc).toContain("required evidence:");
  expect(doc).toContain("helpful confirming evidence:");
  expect(doc).toContain("common failure mode:");
  expect(doc).toContain("confidence sensitivity:");
  expect(doc).toContain("learning metrics to track later:");
});

test("setup taxonomy map includes confidence model and labels", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const component of confidenceComponents) {
    expect(doc).toContain(component);
  }
  expect(doc).toContain(
    "Current confidence should be treated as uncalibrated or partially calibrated",
  );
  expect(doc).toContain(
    "Confidence labels should map to user-facing clarity but remain evidence-backed",
  );
  expect(doc).toContain("Low");
  expect(doc).toContain("Medium");
  expect(doc).toContain("High");
  expect(doc).toContain("Very High / Strong");
  expect(doc).toContain("what it should mean to the user:");
  expect(doc).toContain("evidence required:");
  expect(doc).toContain("what should prevent it from being assigned:");
  expect(doc).toContain("historical calibration:");
});

test("setup taxonomy map includes calibration loop and metrics", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("recommendation generated");
  expect(doc).toContain("snapshot saved");
  expect(doc).toContain("shadow outcome tracked");
  expect(doc).toContain("replay/backfill evaluates outcome");
  expect(doc).toContain("outcome categorized");
  expect(doc).toContain("R multiple calculated");
  expect(doc).toContain("setup family performance updated");
  expect(doc).toContain("confidence bucket performance reviewed");
  expect(doc).toContain("future confidence/ranking adjusted only after safe rollout");

  for (const metric of calibrationMetrics) {
    expect(doc).toContain(metric);
  }
});

test("setup taxonomy map lists blocked work and next actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no automatic calibration update yet");
  expect(doc).toContain("no Supabase synthetic outcome persistence yet");
  expect(doc).toContain("no runtime replay route yet");
  expect(doc).toContain("no provider refetch path yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("Action 327: Learning/Backfill Runtime Rollout Plan");
  expect(doc).toContain("Action 328: Product UX Surface Map");
  expect(doc).toContain("Action 329: Recommendation Engine Gate Test Plan");
  expect(doc).toContain("Action 330: Confidence Calibration Static Metric Spec");
});

test("verifier script exists exits 0 and reports map ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runSetupTaxonomyVerifier());

  expect(source).toContain(
    "action-326-setup-taxonomy-and-confidence-calibration-map.md",
  );
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.setup_taxonomy_map_found).toBe(true);
  expect(parsed.map_status_found).toBe(true);
  expect(parsed.setup_families_found).toBe(true);
  expect(parsed.setup_families_missing).toEqual([]);
  expect(parsed.confidence_model_found).toBe(true);
  expect(parsed.confidence_components_missing).toEqual([]);
  expect(parsed.confidence_labels_found).toBe(true);
  expect(parsed.calibration_loop_found).toBe(true);
  expect(parsed.calibration_metrics_found).toBe(true);
  expect(parsed.calibration_metrics_missing).toEqual([]);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main runtime proxy scanner ranking and confidence threshold mutation", () => {
  const parsed = JSON.parse(runSetupTaxonomyVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runSetupTaxonomyVerifier();
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

test("Action 326 adds no app api route and does not modify proxy", () => {
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

test("Action 309 Action 323 Action 325 and golden verifiers still pass", () => {
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
  const qualityGates = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-325-recommendation-quality-gates-audit-verify.mjs"],
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
  expect(qualityGates.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
