import { execFileSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  getLearningDatasetStaticFixtures,
  getMalformedLearningDatasetStaticFixtureCases,
  serializeLearningDatasetStaticFixtures,
  validateLearningDatasetStaticFixtureSet,
  type LearningDatasetContext,
  type LearningDatasetContextValue,
  type LearningDatasetProvenance,
} from "../../lib/learning-dataset-static-fixtures";
import {
  getIntelligenceContextStaticFixtures,
  getIntelligenceContextStaticFixturesByFamily,
  getMalformedIntelligenceContextStaticFixtureCases,
  serializeIntelligenceContextStaticFixtures,
  validateIntelligenceContextStaticFixtureSet,
} from "../../lib/intelligence-context-static-fixtures";

const learningModulePath = join(
  process.cwd(),
  "lib/learning-dataset-static-fixtures.ts",
);
const contextModulePath = join(
  process.cwd(),
  "lib/intelligence-context-static-fixtures.ts",
);
const testPath = join(
  process.cwd(),
  "tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts",
);

const baseline = {
  learningValid: JSON.stringify(getLearningDatasetStaticFixtures()),
  learningMalformed: JSON.stringify(getMalformedLearningDatasetStaticFixtureCases()),
  learningSerialization: serializeLearningDatasetStaticFixtures(),
  learningIds: getLearningDatasetStaticFixtures().map(
    (fixture) => fixture.identity.dataset_row_id,
  ),
  learningTimestamps: getLearningDatasetStaticFixtures().map((fixture) => ({
    recommendation: fixture.snapshot_time_inputs.recommendation_created_at,
    captured: fixture.context.captured_at,
    outcome: fixture.outcome_fields.evaluated_at,
  })),
  learningProvenance: JSON.stringify(
    getLearningDatasetStaticFixtures().map((fixture) => fixture.data_provenance),
  ),
  contextValid: JSON.stringify(getIntelligenceContextStaticFixtures()),
  contextMalformed: JSON.stringify(
    getMalformedIntelligenceContextStaticFixtureCases(),
  ),
  contextSerialization: serializeIntelligenceContextStaticFixtures(),
  contextIds: getIntelligenceContextStaticFixtures().map(
    (fixture) => fixture.fixture_id,
  ),
  contextTimestamps: getIntelligenceContextStaticFixtures().map((fixture) => ({
    recommendation: fixture.recommendation_linkage.recommendation_created_at,
    captured: fixture.context.captured_at,
    effective: fixture.effective_at,
  })),
  contextProvenance: JSON.stringify(
    getIntelligenceContextStaticFixtures().map(
      (fixture) => fixture.data_provenance,
    ),
  ),
};

function runVerifier(path: string) {
  return execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

test.describe.serial("Action 383 static fixture compatibility", () => {
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
        captured: fixture.context.captured_at,
        outcome: fixture.outcome_fields.evaluated_at,
      })),
    ).toEqual(baseline.learningTimestamps);
    expect(
      JSON.stringify(
        getLearningDatasetStaticFixtures().map(
          (fixture) => fixture.data_provenance,
        ),
      ),
    ).toBe(baseline.learningProvenance);

    expect(JSON.stringify(getIntelligenceContextStaticFixtures())).toBe(
      baseline.contextValid,
    );
    expect(
      JSON.stringify(getMalformedIntelligenceContextStaticFixtureCases()),
    ).toBe(baseline.contextMalformed);
    expect(serializeIntelligenceContextStaticFixtures()).toBe(
      baseline.contextSerialization,
    );
    expect(
      getIntelligenceContextStaticFixtures().map(
        (fixture) => fixture.fixture_id,
      ),
    ).toEqual(baseline.contextIds);
    expect(
      getIntelligenceContextStaticFixtures().map((fixture) => ({
        recommendation: fixture.recommendation_linkage.recommendation_created_at,
        captured: fixture.context.captured_at,
        effective: fixture.effective_at,
      })),
    ).toEqual(baseline.contextTimestamps);
    expect(
      JSON.stringify(
        getIntelligenceContextStaticFixtures().map(
          (fixture) => fixture.data_provenance,
        ),
      ),
    ).toBe(baseline.contextProvenance);
  });

  test("shared context and provenance contracts are directly representable", () => {
    const learningFixture = getLearningDatasetStaticFixtures()[0];
    const contextFixture = getIntelligenceContextStaticFixtures()[0];
    const learningContext: LearningDatasetContext = learningFixture.context;
    const intelligenceContext: LearningDatasetContext = contextFixture.context;
    const learningProvenance: LearningDatasetProvenance =
      learningFixture.data_provenance;
    const intelligenceProvenance: LearningDatasetProvenance =
      contextFixture.data_provenance;
    const learningRegime: LearningDatasetContextValue =
      learningContext.market.market_regime;
    const intelligenceRegime: LearningDatasetContextValue =
      intelligenceContext.market.market_regime;

    expect(Object.keys(intelligenceContext).sort()).toEqual(
      Object.keys(learningContext).sort(),
    );
    expect(Object.keys(intelligenceContext.market).sort()).toEqual(
      Object.keys(learningContext.market).sort(),
    );
    expect(Object.keys(intelligenceContext.sector_industry).sort()).toEqual(
      Object.keys(learningContext.sector_industry).sort(),
    );
    expect(Object.keys(intelligenceContext.relative_strength).sort()).toEqual(
      Object.keys(learningContext.relative_strength).sort(),
    );
    expect(Object.keys(intelligenceContext.news_catalyst).sort()).toEqual(
      Object.keys(learningContext.news_catalyst).sort(),
    );
    expect(Object.keys(intelligenceContext.calendar_event).sort()).toEqual(
      Object.keys(learningContext.calendar_event).sort(),
    );
    expect(Object.keys(intelligenceProvenance).sort()).toEqual(
      Object.keys(learningProvenance).sort(),
    );
    expect(learningRegime.state).toBe("present");
    expect(intelligenceRegime.state).toBe("present");
  });

  test("identity contracts are deterministic unique independent and internally linked", () => {
    const learningFixtures = getLearningDatasetStaticFixtures();
    const contextFixtures = getIntelligenceContextStaticFixtures();
    const learningIds = learningFixtures.map(
      (fixture) => fixture.identity.dataset_row_id,
    );
    const contextIds = contextFixtures.map((fixture) => fixture.fixture_id);

    expect(new Set(learningIds).size).toBe(learningIds.length);
    expect(new Set(contextIds).size).toBe(contextIds.length);
    expect([...learningIds].sort()).toEqual(learningIds);
    expect([...contextIds].sort()).toEqual(contextIds);
    expect(contextIds.some((id) => learningIds.includes(id))).toBe(false);

    for (const fixture of learningFixtures) {
      expect(fixture.context.context_snapshot_id).toBe(
        fixture.identity.context_snapshot_id,
      );
      expect(fixture.context.recommendation_snapshot_id).toBe(
        fixture.identity.recommendation_snapshot_id,
      );
      expect(fixture.context.recommendation_id).toBe(
        fixture.identity.recommendation_id,
      );
      expect(fixture.outcome_fields.recommendation_snapshot_id).toBe(
        fixture.identity.recommendation_snapshot_id,
      );
    }

    for (const fixture of contextFixtures) {
      expect(typeof fixture.fixture_id).toBe("string");
      expect(typeof fixture.recommendation_linkage.recommendation_snapshot_id).toBe(
        "string",
      );
      expect(fixture.context.recommendation_snapshot_id).toBe(
        fixture.recommendation_linkage.recommendation_snapshot_id,
      );
      expect(fixture.context.recommendation_id).toBe(
        fixture.recommendation_linkage.recommendation_id,
      );
    }
  });

  test("identity incompatibilities remain isolated and are never repaired", () => {
    const malformed = getMalformedIntelligenceContextStaticFixtureCases();
    const reasons = malformed.map((fixture) => fixture.reason);

    expect(reasons).toContain("missing_context_identity");
    expect(reasons).toContain("duplicate_fixture_identity");
    expect(reasons).toContain("invalid_recommendation_linkage");
    for (const fixture of malformed.filter((item) =>
      [
        "missing_context_identity",
        "duplicate_fixture_identity",
        "invalid_recommendation_linkage",
      ].includes(item.reason),
    )) {
      expect(fixture.expected_validation_status).toBe("invalid");
    }
  });

  test("capture effective catalyst and outcome times preserve snapshot boundaries", () => {
    for (const fixture of getIntelligenceContextStaticFixtures()) {
      const recommendationAt = Date.parse(
        fixture.recommendation_linkage.recommendation_created_at,
      );
      expect(Date.parse(fixture.context.captured_at)).toBeLessThanOrEqual(
        recommendationAt,
      );
      expect(Date.parse(fixture.effective_at)).toBeLessThanOrEqual(
        recommendationAt,
      );
      if (fixture.context.news_catalyst.catalyst_timestamp) {
        expect(
          Date.parse(fixture.context.news_catalyst.catalyst_timestamp),
        ).toBeLessThanOrEqual(recommendationAt);
      }
    }

    for (const fixture of getLearningDatasetStaticFixtures()) {
      const recommendationAt = Date.parse(
        fixture.snapshot_time_inputs.recommendation_created_at,
      );
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
  });

  test("future company and macro facts remain explicit exclusions", () => {
    const fixture = getIntelligenceContextStaticFixturesByFamily(
      "event_after_recommendation_excluded",
    )[0];
    const recommendationAt = Date.parse(
      fixture.recommendation_linkage.recommendation_created_at,
    );

    expect(fixture.excluded_future_context).toHaveLength(2);
    expect(fixture.excluded_future_context.map((item) => item.domain)).toEqual([
      "company_news",
      "macro_event",
    ]);
    for (const excluded of fixture.excluded_future_context) {
      expect(excluded.included_in_snapshot_context).toBe(false);
      expect(Date.parse(excluded.effective_at)).toBeGreaterThan(recommendationAt);
    }
    expect(JSON.stringify(fixture.context)).not.toContain("2026-07-08T14:00:00.000Z");
    expect(JSON.stringify(fixture.context)).not.toContain("2026-07-08T15:00:00.000Z");
  });

  test("temporal and leakage malformed cases remain explicit invalid boundaries", () => {
    const malformed = getMalformedIntelligenceContextStaticFixtureCases();
    const reasons = malformed.map((fixture) => fixture.reason);

    for (const reason of [
      "capture_after_recommendation_boundary",
      "effective_after_recommendation_without_exclusion",
      "future_news_leakage",
      "future_macro_event_leakage",
      "outcome_data_embedded_in_context",
    ]) {
      expect(reasons).toContain(reason);
      expect(
        malformed.find((fixture) => fixture.reason === reason)
          ?.expected_validation_status,
      ).toBe("invalid");
    }
  });

  test("market index relative news company and calendar values are representable", () => {
    for (const family of [
      "bullish_market_regime",
      "bearish_market_regime",
      "neutral_or_mixed_regime",
      "trend_day",
      "chop_day",
      "elevated_volatility",
      "low_volatility",
      "spy_aligned",
      "spy_diverging",
      "qqq_aligned",
      "qqq_diverging",
      "iwm_aligned",
      "iwm_diverging",
      "strong_sector",
      "weak_sector",
      "strong_industry",
      "weak_industry",
      "strong_peer_group",
      "weak_peer_group",
      "positive_relative_strength",
      "negative_relative_strength",
      "conflicting_relative_signals",
      "positive_material_news",
      "negative_material_news",
      "neutral_news",
      "no_material_news",
      "news_unavailable",
      "earnings_event",
      "guidance_event",
      "fda_event",
      "sec_event",
      "cpi_event",
      "fomc_event",
      "jobs_report_event",
      "options_expiration_event",
      "absent_optional_domain",
    ]) {
      const fixtures = getIntelligenceContextStaticFixturesByFamily(family);
      expect(fixtures.length).toBeGreaterThan(0);
      for (const fixture of fixtures) {
        const compatibleContext: LearningDatasetContext = fixture.context;
        expect(compatibleContext.available_at_snapshot_time).toBe(true);
      }
    }
  });

  test("null absent unknown unavailable stale conflicting partial and complete remain distinct", () => {
    const explicitNull = getIntelligenceContextStaticFixturesByFamily(
      "explicit_null",
    )[0];
    const unavailable = getIntelligenceContextStaticFixturesByFamily(
      "unavailable_source",
    )[0];
    const stale = getIntelligenceContextStaticFixturesByFamily("stale_source")[0];
    const conflicting = getIntelligenceContextStaticFixturesByFamily(
      "conflicting_sources",
    )[0];
    const partial = getIntelligenceContextStaticFixturesByFamily(
      "partial_provenance",
    )[0];
    const complete = getIntelligenceContextStaticFixturesByFamily(
      "complete_provenance",
    )[0];
    const absent = getIntelligenceContextStaticFixturesByFamily(
      "no_material_news",
    )[0];

    expect(explicitNull.context.sector_industry.industry).toEqual({
      state: "explicit_null",
      value: null,
    });
    expect(explicitNull.context.market.market_regime).toEqual({
      state: "unknown",
      value: "unknown",
    });
    expect(unavailable.context.news_catalyst.availability).toBe("unavailable");
    expect(unavailable.data_provenance.state).toBe("unavailable");
    expect(stale.freshness.state).toBe("stale");
    expect(conflicting.conflict_metadata.state).toBe("conflicting");
    expect(partial.data_provenance.state).toBe("partial");
    expect(complete.data_provenance.state).toBe("complete");
    expect(absent.context.news_catalyst.availability).toBe("absent");
  });

  test("provenance quality bounds freshness conflicts and completeness are compatible", () => {
    for (const fixture of getIntelligenceContextStaticFixtures()) {
      const provenance: LearningDatasetProvenance = fixture.data_provenance;
      expect(provenance.completeness_score).toBeGreaterThanOrEqual(0);
      expect(provenance.completeness_score).toBeLessThanOrEqual(1);
      if (provenance.source_confidence !== null) {
        expect(Number.isFinite(provenance.source_confidence)).toBe(true);
        expect(provenance.source_confidence).toBeGreaterThanOrEqual(0);
        expect(provenance.source_confidence).toBeLessThanOrEqual(1);
      }
      if (fixture.freshness.state === "fresh") {
        expect(fixture.freshness.age_minutes_at_recommendation).not.toBeNull();
        expect(fixture.freshness.age_minutes_at_recommendation).toBeLessThan(60);
      }
      if (fixture.freshness.state === "stale") {
        expect(fixture.freshness.age_minutes_at_recommendation).toBeGreaterThanOrEqual(
          60,
        );
      }
      if (fixture.conflict_metadata.state === "conflicting") {
        expect(fixture.conflict_metadata.source_ids.length).toBeGreaterThanOrEqual(2);
        expect(fixture.conflict_metadata.details).not.toBeNull();
      }
      if (fixture.context.market.completeness === "complete") {
        expect(
          JSON.stringify(fixture.context.market).includes('"state":"unavailable"'),
        ).toBe(false);
      }
    }
    expect(validateLearningDatasetStaticFixtureSet()).toEqual({ ok: true, errors: [] });
    expect(validateIntelligenceContextStaticFixtureSet()).toEqual({
      ok: true,
      errors: [],
    });
  });

  test("all malformed incompatibility scenarios remain isolated without repair", () => {
    const malformed = getMalformedIntelligenceContextStaticFixtureCases();
    const reasons = malformed.map((fixture) => fixture.reason);

    for (const reason of [
      "missing_context_identity",
      "duplicate_fixture_identity",
      "invalid_recommendation_linkage",
      "capture_after_recommendation_boundary",
      "effective_after_recommendation_without_exclusion",
      "future_news_leakage",
      "future_macro_event_leakage",
      "outcome_data_embedded_in_context",
      "malformed_provenance",
      "unsupported_categorical_value",
      "invalid_freshness_state",
      "stale_timestamp_marked_fresh",
      "conflicting_without_metadata",
      "partial_context_marked_complete",
      "non_finite_relative_strength_metric",
      "invalid_confidence_or_source_quality_bounds",
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
    expect(
      getIntelligenceContextStaticFixtures().some((fixture) =>
        fixture.fixture_id.startsWith("malformed_context:"),
      ),
    ).toBe(false);
  });

  test("repeated reads preserve counts ordering IDs timestamps provenance and serialization", () => {
    const learningFirst = getLearningDatasetStaticFixtures();
    const learningSecond = getLearningDatasetStaticFixtures();
    const contextFirst = getIntelligenceContextStaticFixtures();
    const contextSecond = getIntelligenceContextStaticFixtures();

    expect(learningFirst).toEqual(learningSecond);
    expect(contextFirst).toEqual(contextSecond);
    expect(learningFirst).not.toBe(learningSecond);
    expect(contextFirst).not.toBe(contextSecond);
    expect(learningFirst).toHaveLength(baseline.learningIds.length);
    expect(contextFirst).toHaveLength(baseline.contextIds.length);
    expect(serializeLearningDatasetStaticFixtures()).toBe(
      baseline.learningSerialization,
    );
    expect(serializeIntelligenceContextStaticFixtures()).toBe(
      baseline.contextSerialization,
    );
  });

  test("focused package adds no mapper helper production module or nondeterminism", () => {
    const source = readFileSync(testPath, "utf8");
    const libNames = readdirSync(join(process.cwd(), "lib"));

    for (const forbiddenExecution of [
      /Date\.now\s*\(/,
      /new\s+Date\s*\(/,
      /Math\.random\s*\(/,
      /randomUUID\s*\(/,
      /process\.env\./,
      /\bfetch\s*\(/,
      /mapSnapshotToLearningDataset\s*\(/,
      /transformContext\s*\(/,
      /normalizeContext\s*\(/,
      /generateLearningRow\s*\(/,
      /resolveConflicts\s*\(/,
      /calculateCompleteness\s*\(/,
    ]) {
      expect(source).not.toMatch(forbiddenExecution);
    }
    expect(source).not.toMatch(/from\s+["']@supabase/);
    expect(source).not.toMatch(/from\s+["'][^"']*supabase-js/);
    expect(
      libNames.some((name) =>
        /context-to-learning-dataset-compatibility|compatibility-composition|context-row-mapper/.test(
          name,
        ),
      ),
    ).toBe(false);
    expect(readFileSync(learningModulePath, "utf8")).toContain(
      "learningDatasetStaticFixtures",
    );
    expect(readFileSync(contextModulePath, "utf8")).toContain(
      "intelligenceContextStaticFixtures",
    );
  });

  test("Action 383 verifier passes with no runtime effects or secrets", () => {
    const output = runVerifier(
      "scripts/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests-verify.mjs",
    );
    const parsed = JSON.parse(output);

    expect(parsed.verification_status).toBe("passed");
    expect(parsed.compatibility_tests_implemented).toBe(true);
    expect(parsed.direct_action_380_import_found).toBe(true);
    expect(parsed.direct_action_381_import_found).toBe(true);
    expect(parsed.production_compatibility_module_found).toBe(false);
    expect(parsed.mapper_or_transformation_helper_found).toBe(false);
    expect(parsed.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(parsed.no_effect_flags).toEqual({
      authoritative_rows_constructed: false,
      fixtures_mutated: false,
      mapper_implemented: false,
      provider_call_executed: false,
      news_call_executed: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      confidence_behavior_changed: false,
    });
    expect(output).not.toContain("automation-secret-that-must-not-appear");
    expect(output).not.toContain("provider-secret-that-must-not-appear");
    expect(output).not.toContain("supabase-secret-that-must-not-appear");
    expect(output).not.toContain("news-secret-that-must-not-appear");
  });

  test("Actions 352 354 and 380 through 382 remain healthy", () => {
    for (const verifier of [
      "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
      "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
      "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
      "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs",
      "scripts/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate-verify.mjs",
    ]) {
      expect(JSON.parse(runVerifier(verifier)).verification_status).toBe("passed");
    }
  });

  test("Action 383 does not touch fixture runtime preview or deployment surfaces", () => {
    const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const action383Lines = status.split("\n").filter((line) => line.includes("action-383"));

    expect(action383Lines.some((line) => line.includes("lib/"))).toBe(false);
    expect(action383Lines.some((line) => line.includes("app/"))).toBe(false);
    expect(action383Lines.some((line) => line.includes("supabase/"))).toBe(false);
    expect(action383Lines.some((line) => line.includes("netlify.toml"))).toBe(false);
    expect(action383Lines.some((line) => line.includes("proxy.ts"))).toBe(false);
    expect(action383Lines.some((line) => line.includes("action-370-preview-deployment-input-manifest"))).toBe(false);
  });
});
