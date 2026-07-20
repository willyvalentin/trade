import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-330-confidence-calibration-static-metric-spec.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-330-confidence-calibration-static-metric-spec-verify.mjs",
);

const confidenceInputs = [
  "numeric_confidence",
  "confidence_label",
  "setup_family",
  "trading_window",
  "direction",
  "planned_entry",
  "planned_stop",
  "planned_target",
  "planned_risk",
  "planned_reward",
  "quality_gate_statuses",
  "setup_evidence_components",
  "market_session_context",
  "data_freshness_status",
  "snapshot_id",
  "recommendation_id",
];

const outcomeInputs = [
  "entry_touched",
  "target_hit",
  "stop_hit",
  "no_entry_triggered",
  "open_at_window_end",
  "ambiguous_intrabar_conservative_stop",
  "gross_r_multiple",
  "max_favorable_excursion_r",
  "max_adverse_excursion_r",
  "time_to_entry",
  "time_to_exit",
  "exit_reason",
  "outcome_window",
  "shadow_outcome_available",
];

const calibrationMetrics = [
  "confidence_bucket_hit_rate",
  "confidence_bucket_stop_rate",
  "confidence_bucket_no_entry_rate",
  "confidence_bucket_expectancy_r",
  "confidence_bucket_average_mfe_r",
  "confidence_bucket_average_mae_r",
  "confidence_bucket_overconfidence_gap",
  "confidence_bucket_underconfidence_gap",
  "setup_family_hit_rate",
  "setup_family_expectancy_r",
  "setup_family_failure_mode_rate",
  "window_specific_hit_rate",
  "window_specific_expectancy_r",
  "calibration_sample_size",
  "calibration_stability_score",
  "ambiguity_rate",
  "invalid_geometry_rate",
  "data_quality_failure_rate",
];

function runMetricSpecVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-330-confidence-calibration-static-metric-spec-verify.mjs"],
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

test("confidence calibration metric spec doc exists and records safe planning baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "confidence_calibration_metric_spec_status: metric_spec_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("confidence calibration metric planning only");
  expect(doc).toContain("not runtime change");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("threshold mutation");
  expect(doc).toContain("confidence implementation");
  expect(doc).toContain("This is not deploy readiness.");
});

test("confidence calibration metric spec explains purpose", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Confidence should become evidence-backed");
  expect(doc).toContain("Low/Medium/High/Very High recommendations");
  expect(doc).toContain("overconfidence");
  expect(doc).toContain("underconfidence");
  expect(doc).toContain("setup-specific weakness");
  expect(doc).toContain("window-specific weakness");
  expect(doc).toContain("fewer, better recommendations and user trust");
  expect(doc).toContain("offline/static until safe learning/backfill runtime exists");
});

test("confidence calibration metric spec lists confidence inputs", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const input of confidenceInputs) {
    expect(doc).toContain(input);
  }
});

test("confidence calibration metric spec lists outcome inputs", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const input of outcomeInputs) {
    expect(doc).toContain(input);
  }
});

test("confidence calibration metric spec lists all eighteen metrics with details", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const metric of calibrationMetrics) {
    expect(doc).toContain(metric);
  }
  expect(doc).toContain("purpose:");
  expect(doc).toContain("formula idea:");
  expect(doc).toContain("interpretation:");
  expect(doc).toContain("minimum sample size note:");
  expect(doc).toContain("risk of misuse:");
});

test("confidence calibration metric spec includes interpretation rules and sample guidance", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("High confidence should not mean certainty");
  expect(doc).toContain(
    "Very High / Strong should require both strong evidence and historical support",
  );
  expect(doc).toContain("Low confidence can still work but should not dominate the feed");
  expect(doc).toContain(
    "If High confidence underperforms Medium confidence, calibration is suspect",
  );
  expect(doc).toContain("If confidence buckets have small samples, no adjustment should be made");
  expect(doc).toContain("less than 20 samples: diagnostic only");
  expect(doc).toContain("20-50 samples: weak signal");
  expect(doc).toContain("50-100 samples: moderate signal");
  expect(doc).toContain("100+ samples: stronger calibration signal");
  expect(doc).toContain(
    "setup/window-specific conclusions need separate sample thresholds",
  );
});

test("confidence calibration metric spec lists blocked work and next actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no automatic confidence adjustment yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no threshold changes yet");
  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("Scanner/ranking mutation is blocked");
  expect(doc).toContain("Confidence threshold changes are blocked");
  expect(doc).toContain("Action 331: Recommendation Card Content Hierarchy Spec");
  expect(doc).toContain("Action 332: History/Statistics Learning Surface Spec");
  expect(doc).toContain("Action 333: Execution Agent Boundary Refresh");
  expect(doc).toContain("Action 334: First Static Gate Helper Extraction Plan");
  expect(doc).toContain("Action 335: Confidence Calibration Static Fixture Plan");
});

test("verifier script exists exits 0 and reports metric spec ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runMetricSpecVerifier());

  expect(source).toContain("action-330-confidence-calibration-static-metric-spec.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.metric_spec_found).toBe(true);
  expect(parsed.metric_spec_status_found).toBe(true);
  expect(parsed.confidence_inputs_found).toBe(true);
  expect(parsed.confidence_inputs_missing).toEqual([]);
  expect(parsed.outcome_inputs_found).toBe(true);
  expect(parsed.outcome_inputs_missing).toEqual([]);
  expect(parsed.calibration_metrics_found).toBe(true);
  expect(parsed.calibration_metrics_missing).toEqual([]);
  expect(parsed.interpretation_rules_found).toBe(true);
  expect(parsed.minimum_sample_guidance_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main runtime proxy scanner ranking and confidence threshold mutation", () => {
  const parsed = JSON.parse(runMetricSpecVerifier());

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
  const output = runMetricSpecVerifier();
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
  expect(parsed.no_effect_flags.confidence_implementation_added).toBe(false);
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

test("Action 330 adds no app api route and does not modify proxy", () => {
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

test("Action 309 Action 326 Action 329 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const setupTaxonomy = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-326-setup-taxonomy-and-confidence-calibration-map-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const gateTestPlan = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-329-recommendation-engine-gate-test-plan-verify.mjs"],
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
  expect(setupTaxonomy.verification_status).toBe("passed");
  expect(gateTestPlan.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
