import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  ACTION_343_PATTERN_INSIGHT_CONTRACT_REFERENCE,
  PATTERN_INSIGHT_STATIC_FIXTURE_SCHEMA_VERSION,
  PATTERN_INSIGHT_STATIC_GENERATED_AT_LABEL,
  getMalformedPatternInsightStaticFixtureCases,
  getPatternInsightStaticFixtureById,
  getPatternInsightStaticFixtures,
  validatePatternInsightStaticFixtureSet,
} from "../../lib/pattern-insight-static-fixtures";

const docPath = join(
  process.cwd(),
  "docs/action-357-pattern-insight-static-fixture-implementation.md",
);
const modulePath = join(process.cwd(), "lib/pattern-insight-static-fixtures.ts");
const verifierPath = join(
  process.cwd(),
  "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
);

function runVerifier(scriptPath: string) {
  return execFileSync("node", [scriptPath], {
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

test("Pattern Insight static fixture implementation doc and module exist", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(existsSync(modulePath)).toBe(true);
  expect(existsSync(verifierPath)).toBe(true);
  expect(doc).toContain("implementation_status: pattern_insight_static_fixtures_implemented");
  expect(doc).toContain("implementation_scope: static_contract_fixtures_only");
  expect(doc).toContain("Pattern Discovery remains blocked");
  expect(doc).toContain("provider/news/Supabase access remains blocked");
  expect(doc).toContain("replay execution remains blocked");
  expect(doc).toContain("deployment remains blocked");
});

test("Pattern Insight static fixture implementation uses Action 343 contract reference", () => {
  expect(ACTION_343_PATTERN_INSIGHT_CONTRACT_REFERENCE).toBe(
    "docs/action-343-pattern-insight-static-type-spec.md",
  );
  expect(PATTERN_INSIGHT_STATIC_FIXTURE_SCHEMA_VERSION).toBe(
    "pattern_insight_static_fixture_schema_v1",
  );
  expect(PATTERN_INSIGHT_STATIC_GENERATED_AT_LABEL).toBe(
    "static_fixture_generation_2026_07_11",
  );

  const source = readFileSync(modulePath, "utf8");
  expect(source).not.toContain("interface PatternInsight");
  expect(source).not.toContain("fixture-only shadow schema");
});

test("valid Pattern Insight fixtures cover required positive negative neutral weak and quality families", () => {
  const fixtures = getPatternInsightStaticFixtures();
  const notes = fixtures.flatMap((fixture) => fixture.data_quality_notes);

  expect(fixtures).toHaveLength(21);
  expect(notes).toContain("coverage:positive:bullish_market_regime_alignment");
  expect(notes).toContain("coverage:positive:sector_alignment");
  expect(notes).toContain("coverage:positive:positive_relative_strength");
  expect(notes).toContain("coverage:positive:news_catalyst_present");
  expect(notes).toContain("coverage:positive:trend_day_alignment");
  expect(notes).toContain("coverage:negative:chop_day_weakness");
  expect(notes).toContain("coverage:negative:index_divergence");
  expect(notes).toContain("coverage:negative:weak_sector_context");
  expect(notes).toContain("coverage:negative:high_impact_macro_event_proximity");
  expect(notes).toContain("coverage:negative:low_freshness_context");
  expect(notes).toContain("coverage:neutral:no_meaningful_difference");
  expect(notes).toContain("coverage:weak:promising_direction_with_small_sample");
  expect(notes).toContain("coverage:weak:sufficient_sample_with_weak_effect");
  expect(notes).toContain("coverage:weak:conflicting_metrics");
  expect(notes).toContain("coverage:weak:inconsistent_outcomes_across_windows");
  expect(notes).toContain("coverage:quality:insufficient_sample");
  expect(notes).toContain("coverage:quality:partial_provenance");
  expect(notes).toContain("coverage:quality:stale_source_dataset");
  expect(notes).toContain("coverage:quality:low_completeness");
  expect(notes).toContain("coverage:quality:unknown_segment_value");
  expect(notes).toContain("coverage:quality:missing_optional_context");
  expect(notes).toContain("coverage:quality:contradictory_evidence");
  expect(notes).toContain("coverage:quality:superseded_insight");
});

test("Pattern Insight fixtures include calibration readiness coverage without mutating live behavior", () => {
  const notes = getPatternInsightStaticFixtures().flatMap(
    (fixture) => fixture.data_quality_notes,
  );

  expect(notes).toContain("readiness:not_ready");
  expect(notes).toContain("readiness:collecting");
  expect(notes).toContain("readiness:shadow_eligible");
  expect(notes).toContain("readiness:review_required");
  expect(notes).toContain("readiness:calibration_candidate");

  for (const fixture of getPatternInsightStaticFixtures()) {
    expect(fixture.mutation_allowed).toBe(false);
    expect(fixture.anti_leakage_status).toBe("passed");
  }
});

test("Pattern Insight fixtures are deterministic and use fixed windows and source references", () => {
  const fixtures = getPatternInsightStaticFixtures();
  const ids = fixtures.map((fixture) => fixture.insight_id);

  expect(new Set(ids).size).toBe(ids.length);
  expect([...ids].sort()).toEqual(ids);
  expect(JSON.stringify(getPatternInsightStaticFixtures())).toBe(
    JSON.stringify(getPatternInsightStaticFixtures()),
  );

  for (const fixture of fixtures) {
    expect(fixture.generated_at_label).toBe("static_fixture_generation_2026_07_11");
    expect(fixture.sample_window.start).toBe("2026-04-01T13:45:00.000Z");
    expect(fixture.sample_window.end).toBe("2026-06-30T20:00:00.000Z");
    expect(fixture.sample_window.source_dataset_reference).toMatch(
      /^learning_dataset_fixture:v1:/,
    );
    expect(fixture.outcome_summary.sample_size).toBe(fixture.sample_size);
    expect(Number.isFinite(fixture.outcome_summary.expectancy_r)).toBe(true);
    expect(Number.isFinite(fixture.confidence_summary.confidence_bucket_expectancy_r)).toBe(
      true,
    );
  }
});

test("Pattern Insight fixture accessors return cloned stable values", () => {
  const firstRead = getPatternInsightStaticFixtures();
  const secondRead = getPatternInsightStaticFixtures();
  const firstId = firstRead[0].insight_id;
  const byId = getPatternInsightStaticFixtureById(firstId);

  expect(firstRead).not.toBe(secondRead);
  expect(firstRead[0]).not.toBe(secondRead[0]);
  expect(byId).toEqual(firstRead[0]);
  expect(byId).not.toBe(firstRead[0]);
  expect(getPatternInsightStaticFixtureById("missing")).toBeNull();
});

test("malformed Pattern Insight fixture cases are isolated from valid fixtures", () => {
  const malformed = getMalformedPatternInsightStaticFixtureCases();
  const reasons = malformed.map((item) => item.reason);

  expect(malformed).toHaveLength(17);
  expect(getPatternInsightStaticFixtures().some((fixture) => fixture.insight_id.startsWith("malformed:"))).toBe(false);
  expect(reasons).toContain("missing_identity");
  expect(reasons).toContain("duplicate_identity");
  expect(reasons).toContain("invalid_pattern_key");
  expect(reasons).toContain("invalid_segment_key");
  expect(reasons).toContain("malformed_source_reference");
  expect(reasons).toContain("non_finite_numeric_metric");
  expect(reasons).toContain("negative_sample_size");
  expect(reasons).toContain("support_count_greater_than_sample_size");
  expect(reasons).toContain("invalid_timestamp_ordering");
  expect(reasons).toContain("invalid_dataset_window");
  expect(reasons).toContain("contradictory_effect_fields");
  expect(reasons).toContain("unsupported_readiness_state");
  expect(reasons).toContain("unsupported_evidence_quality_state");
  expect(reasons).toContain("missing_required_provenance");
  expect(reasons).toContain("unstable_ordering_attempt");
  expect(reasons).toContain("wall_clock_timestamp_attempt");
  expect(reasons).toContain("random_id_attempt");
});

test("static Pattern Insight fixture validator passes local literal checks", () => {
  expect(validatePatternInsightStaticFixtureSet()).toEqual({
    ok: true,
    errors: [],
  });
});

test("Pattern Insight static fixture source avoids runtime imports external access and nondeterminism", () => {
  const source = readFileSync(modulePath, "utf8");

  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("TWELVE_DATA");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("from \"fs\"");
  expect(source).not.toContain("from 'fs'");
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
  expect(source).not.toContain("randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("readFile");
});

test("Action 357 verifier exits zero and reports no runtime effects", () => {
  const parsed = JSON.parse(runVerifier("scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs"));

  expect(parsed.verification_status).toBe("passed");
  expect(parsed.required_files_found).toBe(true);
  expect(parsed.static_fixture_module_found).toBe(true);
  expect(parsed.action_343_contract_reference_found).toBe(true);
  expect(parsed.duplicate_pattern_insight_interface_absent).toBe(true);
  expect(parsed.positive_negative_neutral_quality_readiness_coverage_found).toBe(true);
  expect(parsed.malformed_boundary_coverage_found).toBe(true);
  expect(parsed.valid_fixture_count).toBe(21);
  expect(parsed.malformed_case_count).toBe(17);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
});

test("Action 357 verifier output contains no secrets", () => {
  const output = runVerifier("scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs");

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("Action 357 adds no app api route proxy middleware netlify or migration", () => {
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

test("upstream safety planning and package verifiers remain healthy after Action 357", () => {
  const verifiers = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
    "scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs",
    "scripts/action-355-pattern-insight-static-fixture-implementation-plan-verify.mjs",
    "scripts/action-356-pattern-insight-static-fixture-implementation-approval-gate-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  for (const script of verifiers) {
    const parsed = JSON.parse(runVerifier(script));
    expect(parsed.verification_status ?? parsed.guard_status).toMatch(/^(passed)$/);
  }
});
