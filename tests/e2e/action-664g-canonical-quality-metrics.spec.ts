import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import {
  CANONICAL_QUALITY_METRICS_POLICY_VERSION,
  canonicalQualityCalibrationBuckets,
  canonicalQualityRankingKValues,
  computeCanonicalQualityMetrics,
  type CanonicalMetricResult,
} from "@/lib/canonical-quality-metrics";
import {
  action664gAmbiguousCandidate,
  action664gBootstrapSeed,
  action664gCompleteRankingOpportunitySets,
  action664gGoldenNoTradeScorecard,
  action664gGoldenResearchScorecard,
  action664gGoldenVisibleScorecard,
  action664gIncompleteCandidate,
  action664gIncompleteNoTradeOpportunitySets,
  action664gIncompleteRankingOpportunitySets,
  action664gMiscalibratedVisibleCohort,
  action664gMissingProbabilitySemanticsCohort,
  action664gNoEntryCandidate,
  action664gNoTradeCohortCandidate,
  action664gNonReproducibleCandidate,
  action664gResearchPerformanceCohort,
  action664gVisiblePerformanceCohort,
} from "@/lib/canonical-quality-metrics-fixtures";

function filesRecursively(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? filesRecursively(path) : [path];
  });
}

function expectMetricShape(metric: CanonicalMetricResult) {
  expect(metric.policy_version).toBe(CANONICAL_QUALITY_METRICS_POLICY_VERSION);
  expect(["measurable", "not_measurable_yet", "not_publishable"]).toContain(
    metric.status,
  );
  expect(Number.isInteger(metric.denominator)).toBe(true);
  expect(Number.isInteger(metric.identity_count)).toBe(true);
  expect(Number.isInteger(metric.trading_day_count)).toBe(true);
  expect(Number.isInteger(metric.ticker_count)).toBe(true);
  expect(
    metric.value === null || Number.isFinite(metric.value),
  ).toBe(true);
  expect(
    metric.numerator === null || Number.isFinite(metric.numerator),
  ).toBe(true);
}

test("policy version, fixed buckets, and ranking K values are frozen", () => {
  expect(CANONICAL_QUALITY_METRICS_POLICY_VERSION).toBe(
    "canonical_quality_metrics_v1",
  );
  expect(canonicalQualityCalibrationBuckets).toEqual([
    { id: "p_0_20", lower: 0, upper: 0.2, include_upper: false },
    { id: "p_20_40", lower: 0.2, upper: 0.4, include_upper: false },
    { id: "p_40_60", lower: 0.4, upper: 0.6, include_upper: false },
    { id: "p_60_80", lower: 0.6, upper: 0.8, include_upper: false },
    { id: "p_80_100", lower: 0.8, upper: 1, include_upper: true },
  ]);
  expect(canonicalQualityRankingKValues).toEqual([1, 3, 5]);
});

test("visible golden performance is measurable with explicit identity denominator", () => {
  const scorecard = action664gGoldenVisibleScorecard;

  expect(scorecard.cohort).toBe("visible_recommendation_quality");
  expect(scorecard.synthetic_test_evidence_only).toBe(true);
  expect(scorecard.diagnostics.denominator_identity_count).toBe(20);
  expect(scorecard.performance.win_rate).toMatchObject({
    status: "measurable",
    value: 0.5,
    numerator: 10,
    denominator: 20,
    identity_count: 20,
    trading_day_count: 5,
    ticker_count: 4,
  });
  expect(scorecard.performance.expectancy_r).toMatchObject({
    status: "measurable",
    value: 0.5,
    numerator: 10,
    denominator: 20,
  });
  expect(scorecard.performance.average_winning_r.value).toBe(2);
  expect(scorecard.performance.average_losing_r.value).toBe(-1);
  expect(scorecard.performance.average_mfe_r.value).toBe(1.4);
  expect(scorecard.performance.average_mae_r.value).toBe(-0.75);
  expect(scorecard.performance.target_before_stop_rate.value).toBe(0.5);
  expect(scorecard.performance.win_rate.confidence_interval?.method).toBe(
    "wilson_score_interval_v1",
  );
  expect(scorecard.performance.expectancy_r.confidence_interval).toMatchObject({
    method: "seeded_trading_day_cluster_bootstrap_v1",
    bootstrap_seed: `${action664gBootstrapSeed}:expectancy_r`,
    bootstrap_iterations: 1000,
  });
});

test("no-entry and ambiguity are diagnostics, never wins or losses", () => {
  const scorecard = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: [
      ...action664gVisiblePerformanceCohort,
      action664gNoEntryCandidate,
      action664gAmbiguousCandidate,
    ],
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(scorecard.performance.win_rate.denominator).toBe(20);
  expect(scorecard.performance.win_rate.numerator).toBe(10);
  expect(scorecard.performance.no_entry_rate_diagnostic).toMatchObject({
    numerator: 1,
    denominator: 21,
  });
  expect(scorecard.performance.ambiguous_rate_diagnostic).toMatchObject({
    numerator: 1,
    denominator: 22,
  });
});

test("incomplete and non-reproducible rows affect no standard numerator or denominator", () => {
  const baseline = action664gGoldenVisibleScorecard;
  const augmented = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: [
      ...action664gVisiblePerformanceCohort,
      action664gIncompleteCandidate,
      action664gNonReproducibleCandidate,
    ],
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(augmented.performance.win_rate).toEqual(
    baseline.performance.win_rate,
  );
  expect(augmented.performance.expectancy_r).toEqual(
    baseline.performance.expectancy_r,
  );
  expect(augmented.diagnostics.excluded_ineligible_rows).toBe(2);
});

test("diagnostic horizons never inflate recommendation metrics", () => {
  const inflatedDiagnostics = action664gVisiblePerformanceCohort.map(
    (candidate, index) => ({
      ...structuredClone(candidate),
      diagnostic_horizons: [
        ...structuredClone(candidate.diagnostic_horizons),
        ...structuredClone(candidate.diagnostic_horizons),
        {
          ...structuredClone(candidate.diagnostic_horizons[0]),
          id: `extra-diagnostic-${index}`,
        },
      ],
    }),
  );
  const scorecard = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: inflatedDiagnostics,
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(scorecard.performance.win_rate).toEqual(
    action664gGoldenVisibleScorecard.performance.win_rate,
  );
  expect(scorecard.performance.expectancy_r).toEqual(
    action664gGoldenVisibleScorecard.performance.expectancy_r,
  );
  expect(scorecard.diagnostics.denominator_identity_count).toBe(20);
  expect(scorecard.diagnostics.diagnostic_horizon_count).toBeGreaterThan(40);
});

test("a duplicated identity is excluded rather than counted twice", () => {
  const duplicated = [
    ...action664gVisiblePerformanceCohort,
    structuredClone(action664gVisiblePerformanceCohort[0]),
  ];
  const scorecard = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: duplicated,
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(scorecard.diagnostics.duplicated_identity_count).toBe(1);
  expect(scorecard.diagnostics.denominator_identity_count).toBe(19);
  expect(scorecard.performance.win_rate.denominator).toBe(19);
  expect(scorecard.diagnostics.warning_codes).toContain(
    "duplicated_identity_excluded_from_denominator",
  );
});

test("research data with identical outcomes remains isolated from visible", () => {
  const mixedInput = [
    ...action664gVisiblePerformanceCohort,
    ...action664gResearchPerformanceCohort,
  ];
  const visible = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: mixedInput,
    bootstrap_seed: action664gBootstrapSeed,
  });
  const research = computeCanonicalQualityMetrics({
    cohort: "research_only_recommendation_quality",
    candidates: mixedInput,
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(visible.performance.win_rate.denominator).toBe(20);
  expect(research.performance.win_rate.denominator).toBe(20);
  expect(visible.diagnostics.excluded_other_cohort_rows).toBe(20);
  expect(research.diagnostics.excluded_other_cohort_rows).toBe(20);
  expect(action664gGoldenResearchScorecard.cohort).toBe(
    "research_only_recommendation_quality",
  );
});

test("well-calibrated numeric probabilities produce Brier and ECE", () => {
  const calibration = action664gGoldenVisibleScorecard.calibration;

  expect(calibration.brier_score).toMatchObject({
    status: "measurable",
    value: 0.0225,
    denominator: 20,
  });
  expect(calibration.expected_calibration_error).toMatchObject({
    status: "measurable",
    value: 0.15,
    denominator: 20,
  });
  expect(
    calibration.buckets.find((bucket) => bucket.bucket_id === "p_0_20"),
  ).toMatchObject({
    value: 0,
    average_confidence: 0.15,
    denominator: 10,
  });
  expect(
    calibration.buckets.find((bucket) => bucket.bucket_id === "p_80_100"),
  ).toMatchObject({
    value: 1,
    average_confidence: 0.85,
    denominator: 10,
  });
});

test("intentional miscalibration is visible in Brier score and ECE", () => {
  const scorecard = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664gMiscalibratedVisibleCohort,
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(scorecard.calibration.brier_score.value).toBe(0.81);
  expect(scorecard.calibration.expected_calibration_error.value).toBe(0.9);
});

test("missing probability semantics makes calibration not measurable", () => {
  const scorecard = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664gMissingProbabilitySemanticsCohort,
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(scorecard.calibration.brier_score).toMatchObject({
    status: "not_measurable_yet",
    value: null,
    numerator: null,
    denominator: 0,
  });
  expect(scorecard.calibration.brier_score.reason_codes).toContain(
    "confidence_probability_semantics_missing",
  );
  expect(scorecard.calibration.brier_score.reason_codes).toContain(
    "confidence_label_not_probability",
  );
});

test("complete explicit ranking opportunity sets produce versioned precision@K", () => {
  const ranking = action664gGoldenVisibleScorecard.ranking.precision_at_k;

  expect(ranking["1"]).toMatchObject({
    value: 1,
    numerator: 3,
    denominator: 3,
    status: "not_publishable",
  });
  expect(ranking["3"]).toMatchObject({
    value: 0.666666666667,
    numerator: 6,
    denominator: 9,
    status: "not_publishable",
  });
  expect(ranking["5"]).toMatchObject({
    value: 0.6,
    numerator: 9,
    denominator: 15,
    status: "measurable",
  });
});

test("missing rank or candidate outcome makes precision@K not measurable", () => {
  const scorecard = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664gVisiblePerformanceCohort,
    ranking_opportunity_sets: action664gIncompleteRankingOpportunitySets,
    bootstrap_seed: action664gBootstrapSeed,
  });

  for (const metric of Object.values(scorecard.ranking.precision_at_k)) {
    expect(metric.status).toBe("not_measurable_yet");
    expect(metric.value).toBeNull();
    expect(metric.reason_codes).toEqual(
      expect.arrayContaining([
        "ranking_candidate_outcome_missing",
        "ranking_opportunity_set_incomplete",
        "ranking_rank_missing_or_duplicate",
      ]),
    );
  }
});

test("complete no-trade opportunity sets yield separate opportunity cost", () => {
  const metric =
    action664gGoldenNoTradeScorecard.counterfactual.opportunity_cost_r;

  expect(action664gGoldenNoTradeScorecard.cohort).toBe(
    "no_trade_counterfactual",
  );
  expect(metric).toMatchObject({
    status: "measurable",
    value: 1.333333333333,
    numerator: 4,
    denominator: 3,
  });
  expect(action664gGoldenNoTradeScorecard.performance.win_rate.denominator).toBe(
    0,
  );
});

test("no-trade without an evaluable opportunity set is not measurable", () => {
  const scorecard = computeCanonicalQualityMetrics({
    cohort: "no_trade_counterfactual",
    candidates: [action664gNoTradeCohortCandidate],
    counterfactual_opportunity_sets:
      action664gIncompleteNoTradeOpportunitySets,
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(scorecard.counterfactual.opportunity_cost_r).toMatchObject({
    status: "not_measurable_yet",
    value: null,
    denominator: 0,
  });
  expect(
    scorecard.counterfactual.opportunity_cost_r.reason_codes,
  ).toContain("counterfactual_opportunity_set_not_evaluable");
});

test("undefined cohort has no denominator and every metric is unpublishable", () => {
  const scorecard = computeCanonicalQualityMetrics({
    cohort: null,
    candidates: action664gVisiblePerformanceCohort,
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(scorecard.cohort).toBeNull();
  expect(scorecard.performance.win_rate).toMatchObject({
    status: "not_measurable_yet",
    value: null,
    denominator: 0,
  });
  expect(scorecard.performance.win_rate.reason_codes).toEqual([
    "denominator_undefined",
    "explicit_cohort_required",
  ]);
});

test("below minimum sample remains diagnostic but not publishable", () => {
  const scorecard = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664gVisiblePerformanceCohort.slice(0, 4),
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(scorecard.performance.win_rate.status).toBe("not_publishable");
  expect(scorecard.performance.win_rate.value).toBe(0.5);
  expect(scorecard.performance.win_rate.reason_codes).toContain(
    "minimum_identity_count_not_met",
  );
});

test("input order and opportunity-set order do not change any result", () => {
  const forward = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664gVisiblePerformanceCohort,
    ranking_opportunity_sets: action664gCompleteRankingOpportunitySets,
    bootstrap_seed: action664gBootstrapSeed,
  });
  const reversed = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: [...action664gVisiblePerformanceCohort].reverse(),
    ranking_opportunity_sets: [...action664gCompleteRankingOpportunitySets]
      .reverse()
      .map((set) => ({
        ...structuredClone(set),
        candidates: [...set.candidates].reverse(),
      })),
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(reversed).toEqual(forward);
});

test("same bootstrap seed gives byte-identical confidence intervals", () => {
  const first = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664gVisiblePerformanceCohort,
    bootstrap_seed: action664gBootstrapSeed,
  });
  const second = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664gVisiblePerformanceCohort,
    bootstrap_seed: action664gBootstrapSeed,
  });

  expect(first.performance.expectancy_r.confidence_interval).toEqual(
    second.performance.expectancy_r.confidence_interval,
  );
  expect(JSON.stringify(first)).toBe(JSON.stringify(second));
});

test("all metric outputs are finite or explicit null with complete result shape", () => {
  const scorecards = [
    action664gGoldenVisibleScorecard,
    action664gGoldenResearchScorecard,
    action664gGoldenNoTradeScorecard,
  ];
  for (const scorecard of scorecards) {
    for (const metric of Object.values(scorecard.performance)) {
      expectMetricShape(metric);
    }
    expectMetricShape(scorecard.calibration.brier_score);
    expectMetricShape(scorecard.calibration.expected_calibration_error);
    for (const metric of Object.values(scorecard.ranking.precision_at_k)) {
      expectMetricShape(metric);
    }
    expectMetricShape(scorecard.counterfactual.opportunity_cost_r);
    expect(JSON.stringify(scorecard)).not.toMatch(/NaN|Infinity/);
  }
});

test("local golden scorecard is synthetic and matches computed evidence", () => {
  const artifact = JSON.parse(
    readFileSync(
      "docs/action-664g-golden-quality-scorecard.json",
      "utf8",
    ),
  ) as {
    policy_version: string;
    synthetic_test_evidence_only: boolean;
    production_baseline: boolean;
    visible_recommendation_quality: {
      metrics: {
        win_rate: CanonicalMetricResult;
      };
      calibration: {
        brier_score: CanonicalMetricResult;
      };
    };
    no_trade_counterfactual: {
      opportunity_cost_r: CanonicalMetricResult;
    };
  };

  expect(artifact).toMatchObject({
    policy_version: "canonical_quality_metrics_v1",
    synthetic_test_evidence_only: true,
    production_baseline: false,
  });
  expect(
    artifact.visible_recommendation_quality.metrics.win_rate,
  ).toMatchObject({
    status: action664gGoldenVisibleScorecard.performance.win_rate.status,
    value: action664gGoldenVisibleScorecard.performance.win_rate.value,
    numerator: action664gGoldenVisibleScorecard.performance.win_rate.numerator,
    denominator:
      action664gGoldenVisibleScorecard.performance.win_rate.denominator,
  });
  expect(
    artifact.visible_recommendation_quality.calibration.brier_score.value,
  ).toBe(action664gGoldenVisibleScorecard.calibration.brier_score.value);
  expect(
    artifact.no_trade_counterfactual.opportunity_cost_r.value,
  ).toBe(
    action664gGoldenNoTradeScorecard.counterfactual.opportunity_cost_r.value,
  );
});

test("metrics contract remains absent from all live consumers", () => {
  const source = readFileSync("lib/canonical-quality-metrics.ts", "utf8");
  expect(source).not.toMatch(/supabase|scanner|collector|fetch\s*\(/i);

  const importers = ["app", "components", "scripts"]
    .flatMap(filesRecursively)
    .filter((path) => /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(path))
    .filter((path) =>
      readFileSync(path, "utf8").includes("canonical-quality-metrics"),
    );
  expect(importers).toEqual([]);
});
