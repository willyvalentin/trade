import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(process.cwd(), "docs/action-343-pattern-insight-static-type-spec.md");
const verifierPath = join(
  process.cwd(),
  "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
);

const coreInsightFields = [
  "insight_id",
  "insight_version",
  "generated_from_dataset_version",
  "generated_at_label",
  "pattern_dimension",
  "segment_key",
  "segment_description",
  "sample_size",
  "minimum_sample_requirement",
  "sample_window",
  "setup_family",
  "trading_window",
  "market_regime",
  "sector",
  "industry",
  "relative_strength_profile",
  "catalyst_type",
  "confidence_bucket",
  "outcome_summary",
  "confidence_summary",
  "effect_direction",
  "evidence_strength",
  "stability_score",
  "overfitting_risk",
  "data_quality_notes",
  "anti_leakage_status",
  "recommended_action_type",
  "mutation_allowed",
  "blocked_reason",
  "review_status",
];

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
  "volume_liquidity_profile",
  "risk_reward_profile",
  "entry_quality_profile",
  "stop_quality_profile",
  "target_realism_profile",
  "data_quality_profile",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-343-pattern-insight-static-type-spec-verify.mjs"],
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

test("pattern insight type spec doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("pattern_insight_static_type_status: type_spec_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("pattern insight type/spec planning only");
  expect(doc).toContain("not type implementation");
  expect(doc).toContain("persistence");
  expect(doc).toContain("runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("confidence threshold mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("pattern insight type spec explains purpose and unit", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Pattern insights are research outputs from the learning dataset");
  expect(doc).toContain("without directly mutating live ranking");
  expect(doc).toContain("promising and weak setup-context combinations");
  expect(doc).toContain("future confidence calibration and recommendation quality improvements");
  expect(doc).toContain("evidence strength and overfitting risk");
  expect(doc).toContain("One pattern insight represents one observed pattern across a segment of learning rows");
  expect(doc).toContain("segment definition");
  expect(doc).toContain("outcome metrics");
  expect(doc).toContain("confidence metrics");
  expect(doc).toContain("recommended action type");
  expect(doc).toContain("mutation_allowed: false");
});

test("pattern insight type spec includes core fields and dimensions", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const field of coreInsightFields) {
    expect(doc).toContain(field);
  }
  for (const dimension of patternDimensions) {
    expect(doc).toContain(dimension);
  }
});

test("pattern insight type spec includes outcome summary fields", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("target_hit_rate");
  expect(doc).toContain("stop_hit_rate");
  expect(doc).toContain("no_entry_rate");
  expect(doc).toContain("open_at_window_end_rate");
  expect(doc).toContain("ambiguous_intrabar_rate");
  expect(doc).toContain("average_gross_r_multiple");
  expect(doc).toContain("median_gross_r_multiple");
  expect(doc).toContain("expectancy_r");
  expect(doc).toContain("max_favorable_excursion_avg_r");
  expect(doc).toContain("max_adverse_excursion_avg_r");
  expect(doc).toContain("outcome_quality");
});

test("pattern insight type spec includes confidence summary fields", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("confidence_bucket");
  expect(doc).toContain("confidence_bucket_hit_rate");
  expect(doc).toContain("confidence_bucket_expectancy_r");
  expect(doc).toContain("overconfidence_gap");
  expect(doc).toContain("underconfidence_gap");
  expect(doc).toContain("calibration_stability_score");
  expect(doc).toContain("confidence_sample_size");
  expect(doc).toContain("confidence_interpretation");
});

test("pattern insight type spec includes evidence and overfitting levels", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("insufficient_sample");
  expect(doc).toContain("weak_signal");
  expect(doc).toContain("moderate_signal");
  expect(doc).toContain("strong_signal");
  expect(doc).toContain("validated_signal");
  expect(doc).toContain("under 20: insufficient_sample");
  expect(doc).toContain("20-50: weak_signal");
  expect(doc).toContain("50-100: moderate_signal");
  expect(doc).toContain("100+: potentially strong if stable");
  expect(doc).toContain("high");
  expect(doc).toContain("medium");
  expect(doc).toContain("low");
  expect(doc).toContain("unknown");
  expect(doc).toContain("Single-symbol insights are risky");
  expect(doc).toContain("Regime-specific insights need separate validation");
});

test("pattern insight type spec includes recommended actions and review statuses", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("observe");
  expect(doc).toContain("investigate");
  expect(doc).toContain("downgrade_candidate_research");
  expect(doc).toContain("upgrade_candidate_research");
  expect(doc).toContain("adjust_confidence_research");
  expect(doc).toContain("block_until_more_data");
  expect(doc).toContain("candidate_for_shadow_calibration");
  expect(doc).toContain("candidate_for_future_experiment");
  expect(doc).toContain("recommended_action_type must not directly mutate ranking/scanner");
  expect(doc).toContain("mutation_allowed must default false");
  expect(doc).toContain("unreviewed");
  expect(doc).toContain("reviewed_no_action");
  expect(doc).toContain("research_candidate");
  expect(doc).toContain("shadow_calibration_candidate");
  expect(doc).toContain("rejected_overfit_risk");
  expect(doc).toContain("approved_for_future_experiment");
});

test("pattern insight type spec includes anti-leakage requirements and foundation mapping", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("insight must be generated only from audited learning rows");
  expect(doc).toContain("snapshot-time features must remain separated from outcomes");
  expect(doc).toContain("post-outcome context must be labeled");
  expect(doc).toContain("news/catalyst availability must be snapshot-time safe");
  expect(doc).toContain("data quality exclusions must be explicit");
  expect(doc).toContain("scanner/ranking mutation remains blocked");
  expect(doc).toContain("Learning Outcome Dataset Design");
  expect(doc).toContain("Intelligence Context Schema Draft");
  expect(doc).toContain("Learning Dataset Static Fixture Spec");
  expect(doc).toContain("Intelligence Context Static Fixture Spec");
  expect(doc).toContain("Static replay result model");
  expect(doc).toContain("Static replay summary/report pipeline");
  expect(doc).toContain("History/Statistics foundations");
});

test("pattern insight type spec includes readiness levels and blocked work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("PI0: insight shape undefined");
  expect(doc).toContain("PI1: insight fields documented");
  expect(doc).toContain("PI2: static type spec exists");
  expect(doc).toContain("PI3: static fixture examples designed");
  expect(doc).toContain("PI4: local type implementation ready");
  expect(doc).toContain("PI5: local fixture tests pass");
  expect(doc).toContain("PI6: offline report integration ready");
  expect(doc).toContain("PI7: shadow calibration research-ready");
  expect(doc).toContain("PI8: controlled experiment-ready");
  expect(doc).toContain("PI9: trusted pattern insight signal");
  expect(doc).toContain("Current pattern insight type is not yet PI9");
  expect(doc).toContain("no type implementation yet");
  expect(doc).toContain("no pattern insight persistence yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no replay execution yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("pattern insight type spec lists next actions 344 through 349", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 344: Runtime Ping-Only Route Implementation Plan");
  expect(doc).toContain("Action 345: First Tiny Provider Capacity Experiment Plan");
  expect(doc).toContain("Action 346: Existing Schema Compatibility Matrix");
  expect(doc).toContain("Action 347: Learning Dataset Static Fixture Implementation Plan");
  expect(doc).toContain("Action 348: Intelligence Context Static Fixture Implementation Plan");
  expect(doc).toContain("Action 349: Pattern Insight Static Fixture Spec");
});

test("pattern insight verifier exists exits zero and reports safe false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.pattern_insight_type_spec_found).toBe(true);
  expect(parsed.type_status_found).toBe(true);
  expect(parsed.pattern_insight_unit_found).toBe(true);
  expect(parsed.core_insight_fields_found).toBe(true);
  expect(parsed.pattern_dimensions_found).toBe(true);
  expect(parsed.outcome_summary_fields_found).toBe(true);
  expect(parsed.confidence_summary_fields_found).toBe(true);
  expect(parsed.evidence_strength_levels_found).toBe(true);
  expect(parsed.overfitting_risk_levels_found).toBe(true);
  expect(parsed.recommended_action_types_found).toBe(true);
  expect(parsed.review_status_found).toBe(true);
  expect(parsed.anti_leakage_requirements_found).toBe(true);
  expect(parsed.existing_foundation_mapping_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.pattern_insight_persistence_allowed).toBe(false);
  expect(parsed.type_implementation_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.news_api_call_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.pattern_insight_persisted).toBe(false);
  expect(parsed.no_effect_flags.type_implemented).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
});

test("pattern insight verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("pattern insight verifier source avoids env provider Supabase runtime and nondeterminism", () => {
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

test("Action 343 adds no app api route proxy or migration", () => {
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
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 337 Action 342 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const roadmap = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const contextFixture = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-342-intelligence-context-static-fixture-spec-verify.mjs"],
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
  expect(roadmap.verification_status).toBe("passed");
  expect(contextFixture.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
