import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  getLearningDatasetStaticFixtures,
  getMalformedLearningDatasetStaticFixtureCases,
  serializeLearningDatasetStaticFixtures,
  validateLearningDatasetStaticFixtureSet,
  type Action335LearningDatasetRow,
} from "../../lib/learning-dataset-static-fixtures";
import {
  getMalformedPatternInsightStaticFixtureCases,
  getPatternInsightStaticFixtures,
  validatePatternInsightStaticFixtureSet,
} from "../../lib/pattern-insight-static-fixtures";

const learningModulePath = join(
  process.cwd(),
  "lib/learning-dataset-static-fixtures.ts",
);
const testPath = join(
  process.cwd(),
  "tests/e2e/action-385-learning-dataset-to-pattern-insight-evidence-compatibility.spec.ts",
);
const manifestPath = join(
  process.cwd(),
  "docs/action-385-learning-dataset-pattern-insight-reference-manifest.json",
);

const baseline = {
  learningValid: JSON.stringify(getLearningDatasetStaticFixtures()),
  learningMalformed: JSON.stringify(getMalformedLearningDatasetStaticFixtureCases()),
  learningSerialization: serializeLearningDatasetStaticFixtures(),
  learningIds: getLearningDatasetStaticFixtures().map(
    (fixture) => fixture.identity.dataset_row_id,
  ),
  learningTimes: getLearningDatasetStaticFixtures().map((fixture) => ({
    recommendation: fixture.snapshot_time_inputs.recommendation_created_at,
    context: fixture.context.captured_at,
    outcome: fixture.outcome_fields.evaluated_at,
  })),
  learningProvenance: JSON.stringify(
    getLearningDatasetStaticFixtures().map((fixture) => fixture.data_provenance),
  ),
  patternValid: JSON.stringify(getPatternInsightStaticFixtures()),
  patternMalformed: JSON.stringify(getMalformedPatternInsightStaticFixtureCases()),
  patternIds: getPatternInsightStaticFixtures().map((fixture) => fixture.insight_id),
  patternWindows: JSON.stringify(
    getPatternInsightStaticFixtures().map((fixture) => fixture.sample_window),
  ),
  patternSourceReferences: getPatternInsightStaticFixtures().map(
    (fixture) => fixture.sample_window.source_dataset_reference,
  ),
  patternLiteralMetrics: JSON.stringify(
    getPatternInsightStaticFixtures().map((fixture) => ({
      sample_size: fixture.sample_size,
      minimum_sample_requirement: fixture.minimum_sample_requirement,
      outcome_summary: fixture.outcome_summary,
      confidence_summary: fixture.confidence_summary,
      effect_direction: fixture.effect_direction,
      evidence_strength: fixture.evidence_strength,
      stability_score: fixture.stability_score,
      overfitting_risk: fixture.overfitting_risk,
    })),
  ),
};

function runVerifier(path: string) {
  return execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

test.describe.serial("Action 385 static evidence compatibility", () => {
  test.afterAll(() => {
    expect(JSON.stringify(getLearningDatasetStaticFixtures())).toBe(
      baseline.learningValid,
    );
    expect(JSON.stringify(getMalformedLearningDatasetStaticFixtureCases())).toBe(
      baseline.learningMalformed,
    );
    expect(serializeLearningDatasetStaticFixtures()).toBe(
      baseline.learningSerialization,
    );
    expect(
      getLearningDatasetStaticFixtures().map(
        (fixture) => fixture.identity.dataset_row_id,
      ),
    ).toEqual(baseline.learningIds);
    expect(
      getLearningDatasetStaticFixtures().map((fixture) => ({
        recommendation: fixture.snapshot_time_inputs.recommendation_created_at,
        context: fixture.context.captured_at,
        outcome: fixture.outcome_fields.evaluated_at,
      })),
    ).toEqual(baseline.learningTimes);
    expect(
      JSON.stringify(
        getLearningDatasetStaticFixtures().map(
          (fixture) => fixture.data_provenance,
        ),
      ),
    ).toBe(baseline.learningProvenance);

    expect(JSON.stringify(getPatternInsightStaticFixtures())).toBe(
      baseline.patternValid,
    );
    expect(JSON.stringify(getMalformedPatternInsightStaticFixtureCases())).toBe(
      baseline.patternMalformed,
    );
    expect(
      getPatternInsightStaticFixtures().map((fixture) => fixture.insight_id),
    ).toEqual(baseline.patternIds);
    expect(
      JSON.stringify(
        getPatternInsightStaticFixtures().map(
          (fixture) => fixture.sample_window,
        ),
      ),
    ).toBe(baseline.patternWindows);
    expect(
      getPatternInsightStaticFixtures().map(
        (fixture) => fixture.sample_window.source_dataset_reference,
      ),
    ).toEqual(baseline.patternSourceReferences);
    expect(
      JSON.stringify(
        getPatternInsightStaticFixtures().map((fixture) => ({
          sample_size: fixture.sample_size,
          minimum_sample_requirement: fixture.minimum_sample_requirement,
          outcome_summary: fixture.outcome_summary,
          confidence_summary: fixture.confidence_summary,
          effect_direction: fixture.effect_direction,
          evidence_strength: fixture.evidence_strength,
          stability_score: fixture.stability_score,
          overfitting_risk: fixture.overfitting_risk,
        })),
      ),
    ).toBe(baseline.patternLiteralMetrics);
  });

  test("Learning Dataset fixtures remain evidence examples and Pattern Insights remain output examples", () => {
    const learningFixture = getLearningDatasetStaticFixtures()[0];
    const patternFixture = getPatternInsightStaticFixtures()[0];

    expect(learningFixture.identity.dataset_row_id).toMatch(/^learning_row:/);
    expect(patternFixture.insight_id).toMatch(/^pi_insight:/);
    expect(patternFixture.generated_from_dataset_version).toBe(
      "learning_dataset_fixture:v1",
    );
    expect(patternFixture.mutation_allowed).toBe(false);
    expect(patternFixture.sample_window.source_dataset_reference).toContain(
      "learning_dataset_fixture:v1:",
    );
    expect(patternFixture.insight_id).not.toBe(
      learningFixture.identity.dataset_row_id,
    );
    expect(patternFixture.data_quality_notes).toContain(
      "coverage:positive:bullish_market_regime_alignment",
    );
  });

  test("setup context window and segment dimensions are representable without grouping", () => {
    const learningFixtures = getLearningDatasetStaticFixtures();
    const patternFixtures = getPatternInsightStaticFixtures();
    const learningSource = readFileSync(learningModulePath, "utf8");

    expect(
      learningFixtures.some(
        (fixture) => fixture.setup_and_confidence.setup_family !== "unknown",
      ),
    ).toBe(true);
    expect(
      learningFixtures.some(
        (fixture) => fixture.identity.trading_window === "morning",
      ),
    ).toBe(true);
    expect(
      learningFixtures.some(
        (fixture) => fixture.context.market.market_regime.value === "bullish",
      ),
    ).toBe(true);
    expect(
      learningFixtures.some(
        (fixture) => fixture.context.market.market_regime.state === "unknown",
      ),
    ).toBe(true);
    expect(learningSource).toContain("spy_direction");
    expect(learningSource).toContain("qqq_direction");
    expect(learningSource).toContain("iwm_direction");
    expect(learningSource).toContain("sector_industry");
    expect(learningSource).toContain("relative_strength");
    expect(learningSource).toContain("news_catalyst");
    expect(learningSource).toContain("calendar_event");
    expect(learningSource).not.toContain("peer_group:");
    expect(
      patternFixtures.some(
        (fixture) => fixture.pattern_dimension === "market_regime",
      ),
    ).toBe(true);
    expect(
      patternFixtures.some((fixture) => fixture.market_regime === "mixed"),
    ).toBe(true);
    expect(
      patternFixtures.some(
        (fixture) => fixture.data_quality_notes.includes("coverage:negative:chop_day_weakness"),
      ),
    ).toBe(true);
    expect(
      patternFixtures.some(
        (fixture) => fixture.data_quality_notes.includes("coverage:negative:index_divergence"),
      ),
    ).toBe(true);
    expect(
      patternFixtures.some(
        (fixture) => fixture.data_quality_notes.includes("coverage:quality:missing_optional_context"),
      ),
    ).toBe(true);
  });

  test("outcome availability result direction and completed-negative type support are representable", () => {
    type OutcomeStatus = Action335LearningDatasetRow["outcome_fields"]["outcome_status"];
    type CompletedNegativeStatus = Extract<OutcomeStatus, "stop_hit">;
    const completedNegativeStatus: CompletedNegativeStatus = "stop_hit";
    const fixtures = getLearningDatasetStaticFixtures();

    expect(completedNegativeStatus).toBe("stop_hit");
    expect(
      fixtures.some(
        (fixture) => fixture.outcome_fields.outcome_status === "target_hit",
      ),
    ).toBe(true);
    expect(
      fixtures.some(
        (fixture) => fixture.outcome_fields.availability === "incomplete",
      ),
    ).toBe(true);
    expect(
      fixtures.some(
        (fixture) => fixture.outcome_fields.availability === "not_yet_available",
      ),
    ).toBe(true);
    expect(
      fixtures.some(
        (fixture) =>
          fixture.outcome_fields.max_adverse_excursion_r !== null &&
          fixture.outcome_fields.max_adverse_excursion_r < 0,
      ),
    ).toBe(true);
    expect(
      fixtures.some(
        (fixture) => fixture.outcome_fields.gross_r_multiple === null,
      ),
    ).toBe(true);
    expect(
      fixtures.every(
        (fixture) =>
          fixture.outcome_fields.gross_r_multiple === null ||
          Number.isFinite(fixture.outcome_fields.gross_r_multiple),
      ),
    ).toBe(true);
  });

  test("identity recommendation context and outcome linkage remain deterministic", () => {
    const fixtures = getLearningDatasetStaticFixtures();
    const ids = fixtures.map((fixture) => fixture.identity.dataset_row_id);

    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(ids);
    for (const fixture of fixtures) {
      expect(fixture.context.context_snapshot_id).toBe(
        fixture.identity.context_snapshot_id,
      );
      expect(fixture.context.recommendation_snapshot_id).toBe(
        fixture.identity.recommendation_snapshot_id,
      );
      expect(fixture.outcome_fields.recommendation_snapshot_id).toBe(
        fixture.identity.recommendation_snapshot_id,
      );
      expect(fixture.outcome_fields.evaluated_outcome_id).toBe(
        fixture.identity.evaluated_outcome_id,
      );
    }
  });

  test("provenance quality source bounds and deterministic references remain representable", () => {
    const learningFixtures = getLearningDatasetStaticFixtures();
    const patternFixtures = getPatternInsightStaticFixtures();

    for (const fixture of learningFixtures) {
      expect(fixture.data_provenance.completeness_score).toBeGreaterThanOrEqual(0);
      expect(fixture.data_provenance.completeness_score).toBeLessThanOrEqual(1);
      if (fixture.data_provenance.source_confidence !== null) {
        expect(Number.isFinite(fixture.data_provenance.source_confidence)).toBe(
          true,
        );
        expect(fixture.data_provenance.source_confidence).toBeGreaterThanOrEqual(0);
        expect(fixture.data_provenance.source_confidence).toBeLessThanOrEqual(1);
      }
    }
    expect(
      learningFixtures.some(
        (fixture) => fixture.data_provenance.state === "complete",
      ),
    ).toBe(true);
    expect(
      learningFixtures.some(
        (fixture) => fixture.data_provenance.state === "partial",
      ),
    ).toBe(true);
    expect(
      learningFixtures.some(
        (fixture) => fixture.data_provenance.state === "unavailable",
      ),
    ).toBe(true);
    expect(
      patternFixtures.some(
        (fixture) => fixture.data_quality_notes.includes("coverage:quality:partial_provenance"),
      ),
    ).toBe(true);
    expect(
      patternFixtures.some(
        (fixture) => fixture.data_quality_notes.includes("coverage:quality:stale_source_dataset"),
      ),
    ).toBe(true);
    expect(
      patternFixtures.every((fixture) =>
        fixture.sample_window.source_dataset_reference.startsWith(
          "learning_dataset_fixture:v1:",
        ),
      ),
    ).toBe(true);
  });

  test("recommendation context outcome and observation windows preserve temporal boundaries", () => {
    for (const fixture of getLearningDatasetStaticFixtures()) {
      const recommendationAt = Date.parse(
        fixture.snapshot_time_inputs.recommendation_created_at,
      );
      expect(fixture.anti_leakage_status).toBe("passed");
      expect(Date.parse(fixture.context.captured_at)).toBeLessThanOrEqual(
        recommendationAt,
      );
      if (fixture.outcome_fields.evaluated_at) {
        expect(Date.parse(fixture.outcome_fields.evaluated_at)).toBeGreaterThanOrEqual(
          recommendationAt,
        );
      }
      expect(JSON.stringify(fixture.context)).not.toMatch(
        /target_hit|stop_hit|gross_r_multiple|outcome_status/,
      );
    }

    for (const fixture of getPatternInsightStaticFixtures()) {
      expect(Date.parse(fixture.sample_window.start)).toBeLessThan(
        Date.parse(fixture.sample_window.end),
      );
      expect(fixture.anti_leakage_status).toBe("passed");
      expect(fixture.mutation_allowed).toBe(false);
    }
  });

  test("positive negative neutral weak insufficient contradictory stale and superseded literals remain outputs", () => {
    const fixtures = getPatternInsightStaticFixtures();

    for (const direction of ["positive", "negative", "neutral", "mixed", "unknown"]) {
      expect(fixtures.some((fixture) => fixture.effect_direction === direction)).toBe(
        true,
      );
    }
    expect(
      fixtures.some(
        (fixture) => fixture.evidence_strength === "insufficient_sample",
      ),
    ).toBe(true);
    expect(
      fixtures.some((fixture) => fixture.evidence_strength === "weak_signal"),
    ).toBe(true);
    expect(
      fixtures.some(
        (fixture) => fixture.data_quality_notes.includes("coverage:quality:contradictory_evidence"),
      ),
    ).toBe(true);
    expect(
      fixtures.some(
        (fixture) => fixture.data_quality_notes.includes("coverage:quality:stale_source_dataset"),
      ),
    ).toBe(true);
    expect(
      fixtures.some(
        (fixture) => fixture.data_quality_notes.includes("coverage:quality:superseded_insight"),
      ),
    ).toBe(true);
  });

  test("all readiness states remain immutable Pattern Insight literals", () => {
    const fixtures = getPatternInsightStaticFixtures();

    for (const readiness of [
      "readiness:not_ready",
      "readiness:collecting",
      "readiness:shadow_eligible",
      "readiness:review_required",
      "readiness:calibration_candidate",
    ]) {
      expect(
        fixtures.some((fixture) => fixture.data_quality_notes.includes(readiness)),
      ).toBe(true);
    }
    expect(fixtures.every((fixture) => fixture.mutation_allowed === false)).toBe(
      true,
    );
  });

  test("Learning Dataset malformed evidence cases remain invalid without repair", () => {
    const malformed = getMalformedLearningDatasetStaticFixtureCases();
    const reasons = malformed.map((fixture) => fixture.reason);

    for (const reason of [
      "missing_required_identity",
      "conflicting_identity_linkage",
      "invalid_recommendation_context_relationship",
      "context_after_prohibited_boundary",
      "outcome_leaked_into_snapshot_fields",
      "malformed_provenance",
      "non_finite_numeric_metric",
      "invalid_completeness_bounds",
      "random_identity_attempt",
      "unstable_timestamp_attempt",
    ]) {
      expect(reasons).toContain(reason);
    }
    expect(
      malformed.every(
        (fixture) => fixture.expected_validation_status === "invalid",
      ),
    ).toBe(true);
  });

  test("Pattern Insight malformed output cases remain invalid without repair", () => {
    const malformed = getMalformedPatternInsightStaticFixtureCases();
    const reasons = malformed.map((fixture) => fixture.reason);

    for (const reason of [
      "missing_identity",
      "malformed_source_reference",
      "invalid_dataset_window",
      "support_count_greater_than_sample_size",
      "contradictory_effect_fields",
      "unsupported_readiness_state",
      "unsupported_evidence_quality_state",
      "random_id_attempt",
      "wall_clock_timestamp_attempt",
    ]) {
      expect(reasons).toContain(reason);
    }
    expect(
      malformed.every(
        (fixture) => fixture.expected_validation_status === "invalid",
      ),
    ).toBe(true);
  });

  test("existing validators pass without producing evidence or insights", () => {
    expect(validateLearningDatasetStaticFixtureSet()).toEqual({ ok: true, errors: [] });
    expect(validatePatternInsightStaticFixtureSet()).toEqual({ ok: true, errors: [] });
  });

  test("repeated reads preserve fixture counts IDs ordering windows provenance and metrics", () => {
    const learningFirst = getLearningDatasetStaticFixtures();
    const learningSecond = getLearningDatasetStaticFixtures();
    const patternFirst = getPatternInsightStaticFixtures();
    const patternSecond = getPatternInsightStaticFixtures();

    expect(learningFirst).toEqual(learningSecond);
    expect(patternFirst).toEqual(patternSecond);
    expect(learningFirst).not.toBe(learningSecond);
    expect(patternFirst).not.toBe(patternSecond);
    expect(learningFirst).toHaveLength(baseline.learningIds.length);
    expect(patternFirst).toHaveLength(baseline.patternIds.length);
    expect(serializeLearningDatasetStaticFixtures()).toBe(
      baseline.learningSerialization,
    );
    expect(JSON.stringify(patternFirst)).toBe(baseline.patternValid);
  });

  test("focused package contains no aggregation calculation discovery generation or production helper", () => {
    const source = readFileSync(testPath, "utf8");
    const libNames = readdirSync(join(process.cwd(), "lib"));

    for (const forbiddenExecution of [
      /\.reduce\s*\(/,
      /groupBy\s*\(/,
      /aggregate\w*\s*\(/,
      /calculate\w*\s*\(/,
      /compute\w*\s*\(/,
      /discover\w*\s*\(/,
      /generateInsight\s*\(/,
      /buildInsight\s*\(/,
      /rank\w*\s*\(/,
      /Date\.now\s*\(/,
      /new\s+Date\s*\(/,
      /Math\.random\s*\(/,
      /randomUUID\s*\(/,
      /process\.env\./,
      /\bfetch\s*\(/,
    ]) {
      expect(source).not.toMatch(forbiddenExecution);
    }
    expect(source).not.toMatch(/from\s+["']@supabase/);
    expect(source).not.toMatch(/from\s+["'][^"']*supabase-js/);
    expect(
      libNames.some((name) =>
        /learning-dataset-to-pattern-insight|evidence-compatibility|pattern-discovery|cohort-builder|insight-builder|effect-calculator/.test(
          name,
        ),
      ),
    ).toBe(false);
    expect(existsSync(manifestPath)).toBe(false);
  });

  test("Action 385 verifier passes with no runtime effects or secrets", () => {
    const output = runVerifier(
      "scripts/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests-verify.mjs",
    );
    const parsed = JSON.parse(output);

    expect(parsed.verification_status).toBe("passed");
    expect(parsed.compatibility_tests_implemented).toBe(true);
    expect(parsed.reference_manifest_present).toBe(false);
    expect(parsed.direct_action_380_import_found).toBe(true);
    expect(parsed.direct_action_357_import_found).toBe(true);
    expect(parsed.production_evidence_compatibility_module_found).toBe(false);
    expect(parsed.aggregation_or_discovery_logic_found).toBe(false);
    expect(parsed.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(parsed.no_effect_flags).toEqual({
      authoritative_insights_generated: false,
      calculated_metrics_created: false,
      aggregation_executed: false,
      pattern_discovery_executed: false,
      fixtures_mutated: false,
      provider_call_executed: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      confidence_behavior_changed: false,
    });
    expect(output).not.toContain("AUTOMATION_SECRET");
    expect(output).not.toContain("TWELVE_DATA_API_KEY");
    expect(output).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  test("Actions 337 343 349 357 380 383 and 384 remain healthy", () => {
    for (const verifier of [
      "scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs",
      "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
      "scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs",
      "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
      "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
      "scripts/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests-verify.mjs",
      "scripts/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate-verify.mjs",
    ]) {
      expect(JSON.parse(runVerifier(verifier)).verification_status).toBe("passed");
    }
  });

  test("Action 385 does not touch fixture runtime preview or deployment surfaces", () => {
    const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const action385Lines = status.split("\n").filter((line) => line.includes("action-385"));

    expect(action385Lines.some((line) => line.includes("lib/"))).toBe(false);
    expect(action385Lines.some((line) => line.includes("app/"))).toBe(false);
    expect(action385Lines.some((line) => line.includes("supabase/"))).toBe(false);
    expect(action385Lines.some((line) => line.includes("netlify.toml"))).toBe(false);
    expect(action385Lines.some((line) => line.includes("proxy.ts"))).toBe(false);
    expect(action385Lines.some((line) => line.includes("action-370-preview-deployment-input-manifest"))).toBe(false);
  });
});
