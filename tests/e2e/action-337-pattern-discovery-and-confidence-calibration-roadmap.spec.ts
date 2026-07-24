import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-337-pattern-discovery-and-confidence-calibration-roadmap.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs",
);

const patternDimensions = [
  "setup_family",
  "confidence_bucket",
  "trading_window",
  "market_regime",
  "sector",
  "industry",
  "relative_strength_profile",
  "catalyst_type",
  "catalyst_freshness",
  "volume/liquidity_profile",
  "risk_reward_profile",
  "entry_quality_profile",
  "stop_quality_profile",
  "target_realism_profile",
  "data_quality_profile",
];

const outcomeMetrics = [
  "target_hit_rate",
  "stop_hit_rate",
  "no_entry_rate",
  "open_at_window_end_rate",
  "ambiguous_intrabar_rate",
  "average_gross_r_multiple",
  "median_gross_r_multiple",
  "max_favorable_excursion_r",
  "max_adverse_excursion_r",
  "time_to_entry",
  "time_to_exit",
  "expectancy_by_group",
  "stability_score",
  "overconfidence_gap",
  "underconfidence_gap",
];

const nextActions = [
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
  "Action 343: Pattern Insight Static Type Spec",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs"],
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

test("pattern roadmap doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("pattern_discovery_confidence_calibration_status: roadmap_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("roadmap planning only");
  expect(doc).toContain("not runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("confidence threshold mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("roadmap explains purpose without allowing live mutation", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("discovering which conditions produce good recommendations");
  expect(doc).toContain("connect setup, confidence, market regime, sector/industry, relative strength, catalysts, and outcomes");
  expect(doc).toContain("identify overconfidence and underconfidence");
  expect(doc).toContain("research insights first, not immediate live ranking changes");
  expect(doc).toContain("Scanner/ranking mutation remains blocked");
});

test("roadmap lists all pattern dimensions", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const dimension of patternDimensions) {
    expect(doc).toContain(dimension);
  }
  expect(doc).toContain("what it represents");
  expect(doc).toContain("expected learning question");
  expect(doc).toContain("example pattern insight");
  expect(doc).toContain("risk of misuse");
});

test("roadmap includes outcome metrics and calibration questions", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const metric of outcomeMetrics) {
    expect(doc).toContain(metric);
  }
  expect(doc).toContain("Do High confidence recommendations outperform Medium?");
  expect(doc).toContain("Are Very High recommendations rare and actually superior?");
  expect(doc).toContain("Which setup families are overconfident?");
  expect(doc).toContain("Which regimes make confidence unreliable?");
  expect(doc).toContain("Which sectors produce false breakouts?");
  expect(doc).toContain("Which catalyst types improve expectancy?");
  expect(doc).toContain("Are targets too ambitious?");
  expect(doc).toContain("Are stops too tight?");
  expect(doc).toContain("Are entries too early or too late?");
});

test("roadmap includes pattern discovery stages 0 through 7", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Stage 0: Static roadmap only");
  expect(doc).toContain("Stage 1: Static fixture exploration");
  expect(doc).toContain("Stage 2: Offline historical dataset analysis");
  expect(doc).toContain("Stage 3: Read-only dashboards/reports");
  expect(doc).toContain("Stage 4: Calibration research candidates");
  expect(doc).toContain("Stage 5: Shadow calibration");
  expect(doc).toContain("Stage 6: Controlled recommendation engine experiment");
  expect(doc).toContain("Stage 7: Production-grade calibration");
  expect(doc).toContain("no runtime");
  expect(doc).toContain("no persistence");
  expect(doc).toContain("no ranking mutation");
  expect(doc).toContain("no live mutation");
});

test("roadmap includes minimum evidence rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no pattern conclusion with tiny sample sizes");
  expect(doc).toContain("less than 20 samples: diagnostic only");
  expect(doc).toContain("20-50: weak signal");
  expect(doc).toContain("50-100: moderate signal");
  expect(doc).toContain("100+: stronger signal");
  expect(doc).toContain("context-specific patterns require separate sample thresholds");
  expect(doc).toContain("never mutate ranking from one-off examples");
  expect(doc).toContain("ambiguous/noisy data must be excluded or downweighted");
  expect(doc).toContain("anti-leakage rules must pass");
});

test("roadmap defines future pattern insight output format", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("insight_id");
  expect(doc).toContain("pattern_dimension");
  expect(doc).toContain("segment_key");
  expect(doc).toContain("sample_size");
  expect(doc).toContain("outcome_summary");
  expect(doc).toContain("confidence_summary");
  expect(doc).toContain("effect_direction");
  expect(doc).toContain("evidence_strength");
  expect(doc).toContain("risk_of_overfitting");
  expect(doc).toContain("recommended_action_type: observe | investigate | downgrade_candidate | upgrade_candidate | adjust_confidence_research | block_until_more_data");
  expect(doc).toContain("mutation_allowed: false by default");
});

test("roadmap blocks unsafe implementation work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no pattern persistence yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no replay execution yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("does not authorize deploys");
  expect(doc).toContain("does not authorize deploys, main pushes, runtime route changes");
});

test("roadmap lists next actions 338 through 343", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
});

test("verifier script exists exits 0 and reports roadmap ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-337-pattern-discovery-and-confidence-calibration-roadmap.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.pattern_roadmap_found).toBe(true);
  expect(parsed.roadmap_status_found).toBe(true);
  expect(parsed.pattern_dimensions_found).toBe(true);
  expect(parsed.outcome_metrics_found).toBe(true);
  expect(parsed.calibration_questions_found).toBe(true);
  expect(parsed.discovery_stages_found).toBe(true);
  expect(parsed.minimum_evidence_rules_found).toBe(true);
  expect(parsed.pattern_insight_output_format_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main push runtime provider news Supabase pattern persistence scanner ranking and confidence changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.pattern_persistence_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
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
  expect(parsed.no_effect_flags.news_api_call_executed).toBe(false);
  expect(parsed.no_effect_flags.news_api_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.supabase_read_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.pattern_persisted).toBe(false);
  expect(parsed.no_effect_flags.pattern_persistence_changed).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
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

test("Action 337 adds no app api or page route and does not modify proxy", () => {
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
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 336 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const contextSchema = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-336-intelligence-context-schema-draft-verify.mjs"],
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
  expect(contextSchema.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
