import {
  computeCanonicalQualityMetrics,
  type CanonicalQualityMetricsScorecard,
  type CanonicalRankingOpportunitySet,
} from "@/lib/canonical-quality-metrics";
import {
  assembleCanonicalQualityScorecard,
  buildCanonicalQualityRollbackMetadata,
  canonicalQualitySemanticDigest,
  compareCanonicalQualityScorecards,
  evaluateCanonicalShadowModelChangeGates,
  type CanonicalQualityScorecard,
  type CanonicalScorecardCoverageCounts,
  type CanonicalScorecardVersions,
} from "@/lib/canonical-quality-scorecard";
import { action664gVisiblePerformanceCohort } from "@/lib/canonical-quality-metrics-fixtures";
import type {
  CanonicalEvaluationCohort,
  CanonicalEvaluationMetricsCandidate,
} from "@/lib/server/canonical-evaluation-quality-read-model";

export const action664hBootstrapSeed = "action-664h-version-comparison-seed-v1";
export const action664hGeneratedAt = "2026-07-26T12:00:00.000Z";
export const action664hGitCommit =
  "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33";

export const action664hBaselineVersions: CanonicalScorecardVersions = {
  engine: "engine-shadow-a-v1",
  scoring: "scoring-shadow-a-v1",
  ranking: "ranking-shadow-a-v1",
  evaluator: "evaluator-contract-v1",
  provider: "provider-contract-v1",
};

export const action664hCandidateVersions: CanonicalScorecardVersions = {
  engine: "engine-shadow-b-v1",
  scoring: "scoring-shadow-b-v1",
  ranking: "ranking-shadow-b-v1",
  evaluator: "evaluator-contract-v1",
  provider: "provider-contract-v1",
};

type CohortShape = {
  win_modulo_threshold: number;
  winning_r: number;
  calibrated: boolean;
  confidence_strength?: number;
  cohort?: CanonicalEvaluationCohort;
  count?: number;
  versions: CanonicalScorecardVersions;
};

function syntheticCohort(input: CohortShape) {
  const template = action664gVisiblePerformanceCohort[0];
  const cohort = input.cohort ?? "visible_recommendation_quality";
  const sampleType =
    cohort === "research_only_recommendation_quality"
      ? ("research_only" as const)
      : ("visible" as const);
  return Array.from({ length: input.count ?? 120 }, (_, index) => {
    const win = index % 10 < input.win_modulo_threshold;
    const day = `2026-06-${String((index % 30) + 1).padStart(2, "0")}`;
    const strength = input.confidence_strength ?? 0.75;
    const probability = input.calibrated
      ? win
        ? strength
        : 1 - strength
      : win
        ? 0.2
        : 0.8;
    return {
      ...structuredClone(template),
      canonical_identity: `rec_decision:v1:action664h:paired-${String(index).padStart(3, "0")}:1780001${String(index).padStart(6, "0")}`,
      sample_type: sampleType,
      cohort,
      terminal_outcome: win
        ? ("target_before_stop" as const)
        : ("stop_before_target" as const),
      r_result: win ? input.winning_r : -1,
      mfe_r: win ? input.winning_r + 0.4 : 0.25,
      mae_r: win ? -0.25 : -1.1,
      max_favorable_excursion: win ? input.winning_r + 0.4 : 0.25,
      max_adverse_excursion: win ? -0.25 : -1.1,
      target_before_stop: win ? ("yes" as const) : ("no" as const),
      numeric_confidence: probability,
      confidence_probability_semantics: "probability_0_1" as const,
      ticker: `SYN${String(index % 20).padStart(2, "0")}`,
      decision_timestamp: `${day}T14:30:00.000Z`,
      decision_day: day,
      standard_visible_quality_eligible:
        cohort === "visible_recommendation_quality",
      cohort_quality_eligible: true,
      eligibility_status: "eligible" as const,
      parity_verified: true,
      reproducible: true,
      reason_codes: [],
      versions: structuredClone(input.versions),
    } satisfies CanonicalEvaluationMetricsCandidate;
  });
}

function rankingOpportunitySets(
  positiveRanks: number[],
  rankingVersion: string,
  cohort: CanonicalEvaluationCohort = "visible_recommendation_quality",
): CanonicalRankingOpportunitySet[] {
  return Array.from({ length: 30 }, (_, setIndex) => ({
    opportunity_set_id: `action664h-opportunity-${String(setIndex).padStart(2, "0")}`,
    cohort,
    decision_day: `2026-06-${String(setIndex + 1).padStart(2, "0")}`,
    ranking_version: rankingVersion,
    complete: true,
    candidates: Array.from({ length: 5 }, (__, rankIndex) => ({
      canonical_identity: `action664h-rank:${setIndex}:${rankIndex}`,
      ticker: `SYN${String((setIndex + rankIndex) % 20).padStart(2, "0")}`,
      rank: rankIndex + 1,
      selection_status:
        rankIndex < 2
          ? ("selected" as const)
          : rankIndex === 2
            ? ("rejected" as const)
            : ("not_selected" as const),
      outcome_evaluable: true,
      positive_outcome: positiveRanks.includes(rankIndex + 1),
    })),
  }));
}

export const action664hBaselineCandidates = syntheticCohort({
  win_modulo_threshold: 5,
  winning_r: 1,
  calibrated: true,
  confidence_strength: 0.65,
  versions: action664hBaselineVersions,
});

export const action664hCandidateImprovementCandidates = syntheticCohort({
  win_modulo_threshold: 6,
  winning_r: 1.5,
  calibrated: true,
  confidence_strength: 0.85,
  versions: action664hCandidateVersions,
});

export const action664hImprovedExpectancyWorseCalibrationCandidates =
  syntheticCohort({
    win_modulo_threshold: 6,
    winning_r: 1.5,
    calibrated: false,
    versions: action664hCandidateVersions,
  });

export const action664hImprovedCalibrationWorseExpectancyCandidates =
  syntheticCohort({
    win_modulo_threshold: 4,
    winning_r: 1,
    calibrated: true,
    confidence_strength: 0.85,
    versions: action664hCandidateVersions,
  });

export const action664hRegressionCandidates = syntheticCohort({
  win_modulo_threshold: 3,
  winning_r: 0.5,
  calibrated: false,
  versions: action664hCandidateVersions,
});

export const action664hBaselineRankingSets = rankingOpportunitySets(
  [1, 3, 5],
  action664hBaselineVersions.ranking,
);
export const action664hCandidateRankingSets = rankingOpportunitySets(
  [1, 2, 3, 5],
  action664hCandidateVersions.ranking,
);
export const action664hCandidateBaselineRankingSets =
  rankingOpportunitySets(
    [1, 3, 5],
    action664hCandidateVersions.ranking,
  );
export const action664hRegressionRankingSets = rankingOpportunitySets(
  [3],
  action664hCandidateVersions.ranking,
);

function metrics(
  candidates: CanonicalEvaluationMetricsCandidate[],
  rankingSets: CanonicalRankingOpportunitySet[],
  cohort: CanonicalEvaluationCohort = "visible_recommendation_quality",
) {
  return computeCanonicalQualityMetrics({
    cohort,
    candidates,
    ranking_opportunity_sets: rankingSets,
    bootstrap_seed: action664hBootstrapSeed,
  });
}

function fullCoverage(count: number): CanonicalScorecardCoverageCounts {
  return {
    expected_identity_count: count,
    eligible_identity_count: count,
    missing_identity_count: 0,
    incomplete_identity_count: 0,
    ambiguous_identity_count: 0,
    conflicting_identity_count: 0,
    excluded_identity_count: 0,
    reason_codes: [],
  };
}

export function assembleAction664hFixtureScorecard(input: {
  metrics: CanonicalQualityMetricsScorecard;
  cohort?: CanonicalEvaluationCohort;
  coverage?: CanonicalScorecardCoverageCounts;
  build_identity?: string;
}) {
  const cohort = input.cohort ?? "visible_recommendation_quality";
  const counterfactual =
    cohort === "no_trade_counterfactual" ||
    cohort === "rejected_candidate_counterfactual";
  const count = counterfactual
    ? input.metrics.comparison_evidence
        .complete_counterfactual_opportunity_sets.length
    : input.metrics.diagnostics.denominator_identity_count;
  return assembleCanonicalQualityScorecard({
    metrics: input.metrics,
    cohort,
    period: {
      decided_at_or_after: "2026-06-01T00:00:00.000Z",
      decided_before: "2026-07-01T00:00:00.000Z",
      timezone: "UTC",
    },
    coverage: input.coverage ?? fullCoverage(count),
    required_metrics: counterfactual
      ? ["opportunity_cost_r"]
      : [
          "win_rate",
          "expectancy_r",
          "brier_score",
          "expected_calibration_error",
          "precision_at_5",
        ],
    generated_at: action664hGeneratedAt,
    build: {
      git_commit: action664hGitCommit,
      build_identity: input.build_identity ?? "action664h-synthetic-build",
    },
  });
}

export const action664hBaselineMetrics = metrics(
  action664hBaselineCandidates,
  action664hBaselineRankingSets,
);
export const action664hCandidateImprovementMetrics = metrics(
  action664hCandidateImprovementCandidates,
  action664hCandidateRankingSets,
);
export const action664hImprovedExpectancyWorseCalibrationMetrics = metrics(
  action664hImprovedExpectancyWorseCalibrationCandidates,
  action664hCandidateRankingSets,
);
export const action664hImprovedCalibrationWorseExpectancyMetrics = metrics(
  action664hImprovedCalibrationWorseExpectancyCandidates,
  action664hCandidateBaselineRankingSets,
);
export const action664hRegressionMetrics = metrics(
  action664hRegressionCandidates,
  action664hRegressionRankingSets,
);

export const action664hBaselineAssembly = assembleAction664hFixtureScorecard({
  metrics: action664hBaselineMetrics,
  build_identity: "action664h-baseline-build",
});
export const action664hCandidateImprovementAssembly =
  assembleAction664hFixtureScorecard({
    metrics: action664hCandidateImprovementMetrics,
    build_identity: "action664h-candidate-build",
  });
export const action664hWorseCalibrationAssembly =
  assembleAction664hFixtureScorecard({
    metrics: action664hImprovedExpectancyWorseCalibrationMetrics,
    build_identity: "action664h-worse-calibration-build",
  });
export const action664hWorseExpectancyAssembly =
  assembleAction664hFixtureScorecard({
    metrics: action664hImprovedCalibrationWorseExpectancyMetrics,
    build_identity: "action664h-worse-expectancy-build",
  });
export const action664hRegressionAssembly = assembleAction664hFixtureScorecard({
  metrics: action664hRegressionMetrics,
  build_identity: "action664h-regression-build",
});

export const action664hComparableImprovement =
  compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: action664hCandidateImprovementAssembly.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });

export const action664hIdenticalComparison =
  compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: action664hBaselineAssembly.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });

export const action664hWorseCalibrationComparison =
  compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: action664hWorseCalibrationAssembly.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });

export const action664hWorseExpectancyComparison =
  compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: action664hWorseExpectancyAssembly.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });

export const action664hRegressionComparison =
  compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: action664hRegressionAssembly.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });

export const action664hShadowGateAdvice =
  evaluateCanonicalShadowModelChangeGates({
    comparison: action664hComparableImprovement,
    candidate_scorecard: action664hCandidateImprovementAssembly.scorecard,
  });

export const action664hRollbackMetadata =
  buildCanonicalQualityRollbackMetadata({
    previous_versions: action664hBaselineVersions,
    candidate_versions: action664hCandidateVersions,
    change_reason: "Synthetic shadow-only comparison fixture.",
    evidence_digests: [
      action664hBaselineAssembly.scorecard.semantic_digest,
      action664hCandidateImprovementAssembly.scorecard.semantic_digest,
      action664hComparableImprovement.semantic_digest,
    ],
    rollback_trigger_categories: [
      "expectancy_regression",
      "calibration_regression",
      "ranking_regression",
      "data_integrity_conflict",
    ],
  });

export function resignAction664hFixtureScorecard(
  scorecard: CanonicalQualityScorecard,
) {
  const payload = structuredClone(scorecard) as Omit<
    CanonicalQualityScorecard,
    "semantic_digest"
  > & { semantic_digest?: string };
  delete payload.semantic_digest;
  return {
    ...payload,
    semantic_digest: canonicalQualitySemanticDigest(payload),
  } as CanonicalQualityScorecard;
}
