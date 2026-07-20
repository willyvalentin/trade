import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(process.cwd(), "docs/action-349-pattern-insight-static-fixture-spec.md");
const verifierPath = join(
  process.cwd(),
  "scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs",
);

const scenarios = [
  "insufficient_sample_promising_setup",
  "weak_signal_momentum_morning",
  "moderate_signal_sector_supported_momentum",
  "strong_signal_relative_strength_weak_market",
  "validated_signal_placeholder",
  "negative_pattern_false_breakout_chop",
  "overconfident_high_confidence_bucket",
  "underconfident_low_confidence_bucket",
  "high_overfitting_single_symbol",
  "catalyst_pattern_unstable",
  "missing_context_limited_insight",
  "anti_leakage_rejected_insight",
];

const fields = [
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

function runVerifier() {
  return execFileSync("node", ["scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      NEWS_API_KEY: "news-secret-that-must-not-appear",
    },
  });
}

test("pattern insight fixture spec document and verifier exist", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(existsSync(verifierPath)).toBe(true);
  expect(doc).toContain("pattern_insight_static_fixture_status: fixture_spec_ready");
  expect(doc).toContain("fixture specification only");
  expect(doc).toContain("not fixture implementation");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
});

test("pattern insight fixture spec includes all required scenarios and Action 343 fields", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const scenario of scenarios) {
    expect(doc).toContain(scenario);
  }
  for (const field of fields) {
    expect(doc).toContain(field);
  }
});

test("pattern insight fixture spec includes evidence thresholds and overfitting checks", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("under 20: insufficient_sample");
  expect(doc).toContain("20-50: weak_signal");
  expect(doc).toContain("50-100: moderate_signal");
  expect(doc).toContain("100+: potentially strong only if stable");
  expect(doc).toContain("validated_signal requires repeatability across windows/regimes");
  expect(doc).toContain("single-symbol concentration");
  expect(doc).toContain("too many segment dimensions");
  expect(doc).toContain("short time window");
  expect(doc).toContain("catalyst dependence");
  expect(doc).toContain("one-regime dependence");
  expect(doc).toContain("unstable results across periods");
  expect(doc).toContain("low data quality");
});

test("pattern insight fixture spec includes summaries mutation safety and readiness levels", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("target_hit_rate");
  expect(doc).toContain("stop_hit_rate");
  expect(doc).toContain("no_entry_rate");
  expect(doc).toContain("expectancy_r");
  expect(doc).toContain("average_gross_r_multiple");
  expect(doc).toContain("median_gross_r_multiple");
  expect(doc).toContain("confidence_bucket_hit_rate");
  expect(doc).toContain("overconfidence_gap");
  expect(doc).toContain("underconfidence_gap");
  expect(doc).toContain("mutation_allowed: false");
  expect(doc).toContain("no live scanner mutation");
  expect(doc).toContain("no live ranking mutation");
  expect(doc).toContain("no confidence-threshold mutation");
  expect(doc).toContain("no visible recommendation mutation");
  expect(doc).toContain("PIF0 fixture scenarios undefined");
  expect(doc).toContain("PIF9 shadow-calibration research ready");
  expect(doc).toContain("Current status is not PIF5 or later");
});

test("pattern insight fixture spec maps existing foundations and blocks unsafe work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 335 Learning Outcome Dataset");
  expect(doc).toContain("Action 336 Intelligence Context Schema");
  expect(doc).toContain("Action 337 Pattern Discovery Roadmap");
  expect(doc).toContain("Action 341 Learning Dataset Fixture Spec");
  expect(doc).toContain("Action 342 Context Fixture Spec");
  expect(doc).toContain("Action 343 Pattern Insight Type Spec");
  expect(doc).toContain("Action 346 Schema Compatibility Matrix");
  expect(doc).toContain("no fixture implementation");
  expect(doc).toContain("no persistence");
  expect(doc).toContain("no Supabase access");
  expect(doc).toContain("no provider/news calls");
  expect(doc).toContain("no runtime routes");
  expect(doc).toContain("no replay execution");
  expect(doc).toContain("no scanner/ranking/confidence mutation");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("pattern insight fixture spec records unrelated execution files separately", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("lib/post-trade-staging-execution-function.ts");
  expect(doc).toContain("tests/e2e/post-trade-staging-execution-function-static.spec.ts");
  expect(doc).toContain("They are not Action 349 artifacts");
  expect(doc).toContain("not allow-listed as pattern insight");
});

test("pattern insight fixture verifier exits zero and reports safe false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(parsed.verification_status).toBe("passed");
  expect(parsed.fixture_spec_found).toBe(true);
  expect(parsed.fixture_status_found).toBe(true);
  expect(parsed.core_scenarios_found).toBe(true);
  expect(parsed.required_fields_found).toBe(true);
  expect(parsed.evidence_rules_found).toBe(true);
  expect(parsed.overfitting_checks_found).toBe(true);
  expect(parsed.mutation_safety_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.fixture_implementation_allowed).toBe(false);
  expect(parsed.pattern_insight_persistence_allowed).toBe(false);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_read_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
  expect(parsed.visible_recommendation_mutation_allowed).toBe(false);
  expect(parsed.unrelated_execution_files_are_action_349_artifacts).toBe(false);
  expect(parsed.unrelated_execution_files_allowlisted_as_intelligence_artifacts).toBe(false);
});

test("pattern insight fixture verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("pattern insight fixture verifier source avoids forbidden imports and nondeterminism", () => {
  const source = readFileSync(verifierPath, "utf8");

  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("TWELVE_DATA");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("from \"../app");
  expect(source).not.toContain("@/lib/provider");
  expect(source).not.toContain("@/lib/news");
  expect(source).not.toContain("@/lib/scanner");
  expect(source).not.toContain("@/lib/ranking");
  expect(source).not.toContain("@/lib/broker");
  expect(source).not.toContain("@/lib/execution");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("writeFile");
});

test("Action 349 adds no app api route proxy middleware netlify or migration", () => {
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
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)$/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml$/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 343 Action 346 and golden verifiers still pass", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
    "scripts/action-346-existing-schema-compatibility-matrix-verify.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  ];

  const results = scripts.map((script) =>
    JSON.parse(execFileSync("node", [script], { cwd: process.cwd(), encoding: "utf8" })),
  );

  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(
    true,
  );
});

test("Actions 318 319 and 320 pass with unrelated execution files isolated outside Action 349", () => {
  const scripts = [
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  const results = scripts.map((script) =>
    JSON.parse(execFileSync("node", [script], { cwd: process.cwd(), encoding: "utf8" })),
  );

  for (const result of results) {
    expect(result.verification_status).toBe("passed");
    expect(result.isolated_unrelated_execution_files).toContain(
      "lib/post-trade-staging-execution-function.ts",
    );
    expect(result.isolated_unrelated_execution_files).toContain(
      "tests/e2e/post-trade-staging-execution-function-static.spec.ts",
    );
    expect(result.isolated_unrelated_execution_files_are_action_artifacts).toBe(false);
  }
});
