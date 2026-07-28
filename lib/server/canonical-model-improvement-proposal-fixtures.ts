import "server-only";

import {
  action666fTrainableRequest,
  action666hTrustedLearningBoundary,
  action666hTrustedFeatureContextRegistry,
  action666hTrustedTrainingInputRegistry,
} from "@/lib/server/canonical-offline-learning-engine-fixtures";
import {
  action666mFixtureCases,
} from "@/lib/server/canonical-predictive-outcome-explanation-fixtures";
import {
  action666aScoreAsProbabilityPair,
  action666aCompleteOpportunitySet,
  action666aValidPair,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation-fixtures";
import {
  evaluateCanonicalShadowRankingConfidencePair,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_ROOT_VERSION,
  CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
  canonicalModelImprovementDigest,
  canonicalModelImprovementEvidenceSectionDigest,
  canonicalModelImprovementPolicy,
  createCanonicalModelExperimentPlan,
  createCanonicalModelImprovementCandidate,
  createCanonicalModelImprovementEngine,
  createCanonicalModelImprovementEvidenceRoot,
  createCanonicalModelImprovementMetricInventory,
  createCanonicalModelImprovementRowStability,
  createCanonicalModelImprovementRegistryAuthority,
  createCanonicalModelImprovementRegistryAuthorityManifest,
  createCanonicalModelImprovementTrustedPost,
  createCanonicalModelImprovementTrustedRegistry,
  createCanonicalMultipleTestingEvidence,
  type CanonicalModelImprovementCandidate,
  type CanonicalModelImprovementEvidenceBundle,
  type CanonicalModelImprovementEvidenceItem,
  type CanonicalModelImprovementPattern,
  type CanonicalModelImprovementProposalStatus,
  type CanonicalModelImprovementProposalType,
  type CanonicalModelImprovementRequest,
  type CanonicalModelImprovementTrustBoundary,
  type CanonicalModelImprovementTrustedPayload,
  type CanonicalModelVersionTuple,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION,
  trainCanonicalOfflineLearningModels,
} from "@/lib/server/canonical-offline-learning-engine";
import {
  CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION,
  CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION,
} from "@/lib/server/canonical-predictive-outcome-explanation";
import {
  CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  CANONICAL_QUALITY_METRICS_POLICY_VERSION,
} from "@/lib/canonical-quality-metrics";
import {
  CANONICAL_QUALITY_VERSION_COMPARISON_VERSION,
} from "@/lib/canonical-quality-scorecard";
import {
  action664hBaselineCandidates,
  action664hBaselineRankingSets,
  action664hCandidateBaselineRankingSets,
  action664hCandidateImprovementCandidates,
  action664hCandidateRankingSets,
  action664hImprovedCalibrationWorseExpectancyCandidates,
  action664hImprovedExpectancyWorseCalibrationCandidates,
  action664hRegressionCandidates,
  action664hRegressionRankingSets,
  assembleAction664hFixtureScorecard,
  action664hBootstrapSeed,
} from "@/lib/canonical-quality-scorecard-fixtures";
import {
  computeCanonicalQualityMetrics,
  type CanonicalRankingOpportunitySet,
} from "@/lib/canonical-quality-metrics";
import {
  compareCanonicalQualityScorecards,
} from "@/lib/canonical-quality-scorecard";
import type {
  CanonicalEvaluationMetricsCandidate,
} from "@/lib/server/canonical-evaluation-quality-read-model";
import {
  CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
  verifyAndProjectCanonicalModelImprovementUpstreams,
  type CanonicalModelImprovementUpstreamSources,
} from "@/lib/server/canonical-model-improvement-upstream-verification";

const canonicalLearningResult = trainCanonicalOfflineLearningModels(
  action666fTrainableRequest,
  action666hTrustedLearningBoundary,
);
if (
  canonicalLearningResult.status !== "trainable" ||
  !canonicalLearningResult.result_digest
) {
  throw new Error("action_666v_requires_verified_learning_fixture");
}

const explanationSources = action666mFixtureCases.slice(0, 8).map((fixture) => {
  if (!fixture.engine.explain) {
    throw new Error("action_666v_requires_enabled_explanation_fixture");
  }
  return {
    trust_boundary: fixture.trustBoundary,
    request: fixture.request,
    result: fixture.engine.explain(fixture.request),
  };
});

const baselineVersions = versionTuple(
  action666aValidPair.baseline.versions,
);
const candidateVersions = versionTuple(
  action666aValidPair.candidate.versions,
);

function versionTuple(input: {
  engine_version: string;
  scoring_version: string;
  ranking_version: string;
  threshold_policy_version: string;
  confidence_contract_version: string;
  evaluator_version: string;
  provider_contract_version: string;
}) {
  return {
    engine: input.engine_version,
    scoring: input.scoring_version,
    ranking: input.ranking_version,
    threshold: input.threshold_policy_version,
    confidence: input.confidence_contract_version,
    evaluator: input.evaluator_version,
    provider: input.provider_contract_version,
  } satisfies CanonicalModelVersionTuple;
}

function section<T extends Record<string, unknown>>(input: T) {
  return {
    ...input,
    evidence_digest: canonicalModelImprovementEvidenceSectionDigest(input),
  };
}

function pattern(input: Omit<CanonicalModelImprovementPattern, "evidence_digest">) {
  return {
    ...input,
    evidence_digest: canonicalModelImprovementDigest(input),
  };
}

type FixtureOptions = {
  name: string;
  expected_status: CanonicalModelImprovementProposalStatus;
  proposal_type?: CanonicalModelImprovementProposalType;
  in_sample_only?: boolean;
  calibration_delta?: number;
  expectancy_delta?: number;
  classification?: "candidate_improvement" | "non_inferior" | "regression";
  identities?: number;
  days?: number;
  tickers?: number;
  regimes?: number;
  conflicting_explanations?: number;
  complete_outcomes?: boolean;
  point_in_time_safe?: boolean;
  feature_registry_root?: string;
  primary_raw_p_value?: number;
  correction_method?:
    | "holm_bonferroni_v1"
    | "benjamini_hochberg_fdr_v1";
  protected_metric_delta?: number;
  stable_splits?: number;
  probability_semantics?:
    | "calibrated_probability"
    | "probability_semantics_missing";
  duplicate_candidate?: boolean;
  tamper_plan?: boolean;
  plan_required?: boolean;
  change_identifier?: string;
  no_change_instability?: boolean;
};

function shadowCandidates(
  candidates: CanonicalEvaluationMetricsCandidate[],
) {
  return candidates.map((candidate) => ({
    ...structuredClone(candidate),
    sample_type: "shadow" as const,
    cohort: "shadow_recommendation_quality" as const,
    standard_visible_quality_eligible: false,
  }));
}

function shadowRankingSets(sets: CanonicalRankingOpportunitySet[]) {
  return sets.map((set) => ({
    ...structuredClone(set),
    cohort: "shadow_recommendation_quality" as const,
  }));
}

function shadowScorecard(input: {
  candidates: CanonicalEvaluationMetricsCandidate[];
  ranking: CanonicalRankingOpportunitySet[];
  build: string;
}) {
  const metrics = computeCanonicalQualityMetrics({
    cohort: "shadow_recommendation_quality",
    candidates: shadowCandidates(input.candidates),
    ranking_opportunity_sets: shadowRankingSets(input.ranking),
    bootstrap_seed: action664hBootstrapSeed,
  });
  return assembleAction664hFixtureScorecard({
    metrics,
    cohort: "shadow_recommendation_quality",
    build_identity: input.build,
  }).scorecard;
}

const shadowQualityScorecards = {
  baseline: shadowScorecard({
    candidates: action664hBaselineCandidates,
    ranking: action664hBaselineRankingSets,
    build: "action666x2-shadow-baseline",
  }),
  improvement: shadowScorecard({
    candidates: action664hCandidateImprovementCandidates,
    ranking: action664hCandidateRankingSets,
    build: "action666x2-shadow-improvement",
  }),
  calibrationRegression: shadowScorecard({
    candidates: action664hImprovedExpectancyWorseCalibrationCandidates,
    ranking: action664hCandidateRankingSets,
    build: "action666x2-shadow-calibration-regression",
  }),
  expectancyRegression: shadowScorecard({
    candidates: action664hImprovedCalibrationWorseExpectancyCandidates,
    ranking: action664hCandidateBaselineRankingSets,
    build: "action666x2-shadow-expectancy-regression",
  }),
  regression: shadowScorecard({
    candidates: action664hRegressionCandidates,
    ranking: action664hRegressionRankingSets,
    build: "action666x2-shadow-regression",
  }),
};

function qualityPair(candidate: typeof shadowQualityScorecards.baseline) {
  return {
    baseline: shadowQualityScorecards.baseline,
    candidate,
    comparison: compareCanonicalQualityScorecards({
      baseline: shadowQualityScorecards.baseline,
      candidate,
      bootstrap_seed: action664hBootstrapSeed,
    }),
    bootstrap_seed: action664hBootstrapSeed,
  };
}

function canonicalQualitySource(options: FixtureOptions) {
  if (options.classification === "non_inferior") {
    return qualityPair(shadowQualityScorecards.baseline);
  }
  if ((options.calibration_delta ?? -0.03) > 0) {
    return qualityPair(shadowQualityScorecards.calibrationRegression);
  }
  if (
    (options.expectancy_delta ?? 0.18) <= 0 ||
    (options.protected_metric_delta ?? 0.04) < 0
  ) {
    const regression = (options.protected_metric_delta ?? 0.04) < 0;
    return qualityPair(
      regression
        ? shadowQualityScorecards.regression
        : shadowQualityScorecards.expectancyRegression,
    );
  }
  return qualityPair(shadowQualityScorecards.improvement);
}

function canonicalUpstreamSources(
  options: FixtureOptions,
): CanonicalModelImprovementUpstreamSources {
  const comparisonInput =
    options.probability_semantics === "probability_semantics_missing"
      ? action666aScoreAsProbabilityPair
      : action666aValidPair;
  const evaluationResult =
    evaluateCanonicalShadowRankingConfidencePair(comparisonInput);
  return {
    verifier_version:
      CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
    quality: canonicalQualitySource(options),
    opportunity_sets: [action666aCompleteOpportunitySet],
    shadow: {
      comparison_input: comparisonInput,
      evaluation_result: evaluationResult,
    },
    learning: {
      request: action666fTrainableRequest,
      result: canonicalLearningResult,
      trust_boundary: action666hTrustedLearningBoundary,
    },
    explanations: explanationSources,
  };
}

function buildEvidence(options: FixtureOptions) {
  const upstreamSources = canonicalUpstreamSources(options);
  const verified =
    verifyAndProjectCanonicalModelImprovementUpstreams(upstreamSources);
  if (verified.status !== "verified") {
    throw new Error(
      `action_666v_upstream_fixture_not_verified:${verified.reason_codes.join(",")}`,
    );
  }
  const projection = verified.projection;
  const identityInventory = Array.from(
    { length: projection.quality.identity_count },
    (_, index) => `synthetic-canonical-decision-${String(index + 1).padStart(3, "0")}`,
  );
  const tradingDays = Array.from(
    { length: options.days ?? 18 },
    (_, index) => `2026-05-${String(index + 1).padStart(2, "0")}`,
  );
  const tickers = [
    "AAPL",
    "AMD",
    "AMZN",
    "GOOGL",
    "META",
    "MSFT",
    "NVDA",
    "ORCL",
  ].slice(0, options.tickers ?? 8);
  const regimes = ["bear", "bull"].slice(0, options.regimes ?? 2);
  const coverageInventory = {
    cohort: projection.quality.cohort,
    period: {
      ...projection.quality.period,
    },
    canonical_identity_inventory_digest:
      canonicalModelImprovementDigest(identityInventory),
    verified_denominator_digest: projection.quality.denominator_digest,
    trading_days: tradingDays,
    tickers,
    regimes,
  };
  const qualityMetrics = section({
    metrics_policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    comparison_version: CANONICAL_QUALITY_VERSION_COMPARISON_VERSION,
    baseline_scorecard_digest:
      projection.quality.baseline_scorecard_digest,
    candidate_scorecard_digest:
      projection.quality.candidate_scorecard_digest,
    comparison_digest: projection.quality.comparison_digest,
    comparability_status: projection.quality.comparability_status as "comparable",
    classification: projection.quality.classification as
      | "candidate_improvement"
      | "non_inferior"
      | "regression",
    quality_eligible: true,
    ...coverageInventory,
    coverage_inventory_digest:
      canonicalModelImprovementDigest(coverageInventory),
    identity_count: projection.quality.identity_count,
    trading_day_count: options.days ?? 18,
    ticker_count: options.tickers ?? 8,
    regime_count: options.regimes ?? 2,
    cost_adjusted_expectancy_delta_r:
      projection.quality.cost_adjusted_expectancy_delta_r ?? 0,
    calibration_delta: projection.quality.calibration_delta ?? 0,
    protected_metrics: projection.quality.protected_metrics.map((metric) => ({
      metric: metric.metric,
      delta: metric.delta ?? 0,
      non_inferiority_floor:
        metric.metric === "precision_at_3" ? -0.03 : -0.02,
      status: metric.status,
    })),
    metric_inventory: createCanonicalModelImprovementMetricInventory({
      primary_metric: "cost_adjusted_expectancy_r",
      secondary_metrics: [
        "brier_score",
        "expected_calibration_error",
        "precision_at_3",
        "win_rate",
      ],
      protected_metrics: ["precision_at_3", "win_rate"],
      metrics: projection.quality.metric_results.map((metric) => {
        const protectedMetric = metric.metric === "precision_at_3" ||
          metric.metric === "win_rate";
        return {
          metric_identity: metric.metric as
            | "cost_adjusted_expectancy_r"
            | "brier_score"
            | "expected_calibration_error"
            | "precision_at_3"
            | "win_rate",
          metric_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
          roles: [
            ...(metric.metric === "cost_adjusted_expectancy_r"
              ? (["primary"] as const)
              : (["secondary"] as const)),
            ...(protectedMetric ? (["protected"] as const) : []),
          ],
          value: metric.value ?? 0,
          delta: metric.delta ?? 0,
          status: "measurable" as const,
          uncertainty_digest: metric.uncertainty_digest,
          denominator_digest: projection.quality.denominator_digest,
          cohort: projection.quality.cohort,
          period: structuredClone(projection.quality.period),
          verified_result_digest: projection.quality.comparison_digest,
          non_inferiority_floor:
            metric.metric === "precision_at_3"
              ? -0.03
              : metric.metric === "win_rate"
                ? -0.02
                : null,
          regression_boundary: protectedMetric ? 0 : null,
        };
      }),
    }),
    incomplete_rate: projection.quality.incomplete_rate,
    ambiguous_rate: projection.quality.ambiguous_rate,
    conflicting_rate: projection.quality.conflicting_rate,
    uncertainty_digest: projection.quality.uncertainty_digest,
  });
  const opportunitySets = section({
    contract_version:
      CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION,
    inventory_identity: "synthetic-action-666v-opportunity-inventory",
    opportunity_set_identities: projection.opportunity_sets.identities,
    opportunity_set_digests: projection.opportunity_sets.digests,
    denominator_digest: canonicalModelImprovementDigest({
      identities: [action666aCompleteOpportunitySet.opportunity_set_identity],
      digests: [action666aCompleteOpportunitySet.semantic_digest],
    }),
    complete_membership: projection.opportunity_sets.complete_membership,
    complete_outcome_lineage:
      options.complete_outcomes === false
        ? false
        : projection.opportunity_sets.complete_outcome_lineage,
    point_in_time_safe:
      options.point_in_time_safe === false
        ? false
        : projection.opportunity_sets.point_in_time_safe,
    expected_candidate_count:
      projection.opportunity_sets.expected_candidate_count,
    observed_candidate_count:
      projection.opportunity_sets.observed_candidate_count,
    evaluated_candidate_count:
      options.complete_outcomes === false
        ? projection.opportunity_sets.evaluated_candidate_count - 1
        : projection.opportunity_sets.evaluated_candidate_count,
  });
  const shadow = section({
    evaluation_version:
      CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
    evaluation_identity: projection.shadow.evaluation_identity,
    pair_digest: projection.shadow.pair_digest,
    evaluation_digest: projection.shadow.evaluation_digest,
    status: projection.shadow.status as
      | "evaluable"
      | "probability_semantics_missing",
    reproducible: projection.shadow.reproducible,
    out_of_sample: true,
    baseline_versions: baselineVersions,
    candidate_versions: candidateVersions,
    probability_semantics: projection.shadow.probability_semantics,
  });
  const rowLevelStability = createCanonicalModelImprovementRowStability({
    primary_metric: "cost_adjusted_expectancy_r",
    cohort: projection.quality.cohort,
    rows: projection.learning.stability_rows.map((row) => ({
      row_identity: row.prediction_identity,
      canonical_decision_identity: row.canonical_decision_identity,
      opportunity_set_identity: row.opportunity_set_identity,
      trading_day: row.trading_day,
      ticker: row.ticker,
      regime: row.regime,
      split_identity: row.split_identity,
      cohort: row.cohort,
      primary_metric: "cost_adjusted_expectancy_r",
      contribution: row.contribution,
      verified_prediction_digest: row.verified_prediction_digest,
    })),
  });
  const learning = section({
    engine_version: CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION,
    status: "trainable" as const,
    result_digest: projection.learning.result_digest!,
    dataset_digest: projection.learning.dataset_digest!,
    split_digest: projection.learning.split_digest!,
    model_artifact_digest: projection.learning.model_artifact_digest!,
    shadow_binding_digest: projection.learning.shadow_binding_digest!,
    feature_context_registry_root_digest:
      options.feature_registry_root ??
      projection.learning.feature_context_registry_root_digest!,
    training_input_registry_root_digest:
      projection.learning.training_input_registry_root_digest!,
    walk_forward_split_count: projection.learning.walk_forward_split_count,
    stable_split_count: rowLevelStability.stable_split_count,
    row_level_stability: rowLevelStability,
    out_of_sample_prediction_count:
      projection.learning.out_of_sample_prediction_count,
    reproducible: projection.learning.reproducible,
    frozen_result: true,
    in_sample_only: options.in_sample_only ?? false,
  });
  const patterns = [
    pattern({
      pattern_identity: `pattern:${options.name}:primary`,
      taxonomy_code:
        options.proposal_type === "regime_specific_abstention_candidate"
          ? "regime_associated_mismatch"
          : "false_positive",
      occurrence_count: 18,
      canonical_identity_count: 18,
      split_identities: ["split-01", "split-02", "split-03", "split-04"],
      cohorts: ["shadow_recommendation_quality"],
      regimes:
        options.proposal_type === "regime_specific_abstention_candidate"
          ? ["bear", "bull"]
          : ["bear"],
      direction: "favorable",
      effect_size: 0.18,
      point_in_time_safe: options.point_in_time_safe ?? true,
    }),
  ];
  const explanation = section({
    contract_version: CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION,
    failure_taxonomy_version:
      CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION,
    cohort_identity: `explanation-cohort:${options.name}`,
    cohort_digest: canonicalModelImprovementDigest({
      explanation_digests: projection.explanations.digests,
      patterns: patterns.map((item) => item.evidence_digest),
    }),
    explanation_digests: projection.explanations.digests,
    patterns,
    conflicting_explanation_count:
      options.conflicting_explanations ??
      projection.explanations.conflicting_count,
    point_in_time_safe:
      options.point_in_time_safe === false
        ? false
        : projection.explanations.point_in_time_safe,
  });
  const evidence = createCanonicalModelImprovementEvidenceRoot({
    evidence_root_version:
      CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_ROOT_VERSION,
    upstream_verification: {
      verifier_version: projection.verifier_version,
      source_contract_versions: projection.source_contract_versions,
      namespace_digests: projection.namespace_digests,
      temporal_evidence_digest: projection.temporal_evidence_digest,
    },
    quality_metrics: qualityMetrics,
    opportunity_sets: opportunitySets,
    shadow_evaluation: shadow,
    offline_learning: learning,
    explanation_cohort: explanation,
  } as Omit<
    CanonicalModelImprovementEvidenceBundle,
    "evidence_root_digest"
  >);
  return { evidence, upstreamSources };
}

function evidenceItems(
  evidence: CanonicalModelImprovementEvidenceBundle,
): Omit<CanonicalModelImprovementEvidenceItem, "evidence_digest">[] {
  return [
    {
      evidence_class: "observed_pattern",
      evidence_code: "repeated_canonical_failure_pattern",
      statement:
        "The frozen explanation cohort contains a repeated observed outcome pattern.",
      sources: [{
        namespace: "explanation_cohort",
        digest:
          evidence.upstream_verification.namespace_digests.explanation_cohort,
      }],
      causal_claimed: false,
      canonical_status_authority: true,
    },
    {
      evidence_class: "predictive_association",
      evidence_code: "oos_predictive_association",
      statement:
        "The frozen learning result records an out-of-sample predictive association.",
      sources: [{
        namespace: "offline_learning",
        digest:
          evidence.upstream_verification.namespace_digests.offline_learning,
      }],
      causal_claimed: false,
      canonical_status_authority: true,
    },
    {
      evidence_class: "ablation_evidence",
      evidence_code: "training_window_ablation",
      statement:
        "A frozen training-window ablation changed the synthetic prediction.",
      sources: [{
        namespace: "offline_learning",
        digest:
          evidence.upstream_verification.namespace_digests.offline_learning,
      }],
      causal_claimed: false,
      canonical_status_authority: true,
    },
    {
      evidence_class: "counterfactual_sensitivity",
      evidence_code: "bounded_threshold_sensitivity",
      statement:
        "A bounded counterfactual sensitivity was observed; it is not a causal explanation.",
      sources: [{
        namespace: "shadow_evaluation",
        digest:
          evidence.upstream_verification.namespace_digests.shadow_evaluation,
      }],
      causal_claimed: false,
      canonical_status_authority: true,
    },
    {
      evidence_class: "research_hypothesis",
      evidence_code: "candidate_feature_hypothesis",
      statement:
        "Research hypothesis only: a registered feature transformation may improve selectivity.",
      sources: [{
        namespace: "evidence_root",
        digest: evidence.evidence_root_digest,
      }],
      causal_claimed: false,
      canonical_status_authority: false,
    },
  ];
}

function candidateFor(
  options: FixtureOptions,
  evidence: CanonicalModelImprovementEvidenceBundle,
) {
  const proposalType = options.proposal_type ?? "feature_transformation";
  const noChange = proposalType === "no_change";
  return createCanonicalModelImprovementCandidate({
    proposal_type: proposalType,
    title: noChange
      ? "Retain the frozen baseline"
      : `Evaluate ${proposalType.replaceAll("_", " ")}`,
    change_set: [
      {
        operation: noChange ? "research_only" : "transform",
        target_namespace: noChange ? "model_governance" : "feature_registry",
        target_identifier:
          options.change_identifier ??
          (noChange ? "no_change" : "registered_true_signal"),
        baseline_value: noChange ? "unchanged" : "raw",
        candidate_value: noChange ? "unchanged" : "winsorized_v1",
      },
    ],
    target_feature_context_registry_root_digest:
      evidence.offline_learning.feature_context_registry_root_digest,
    evidence_root_digest: evidence.evidence_root_digest,
    evidence_items: evidenceItems(evidence),
  });
}

function planFor(input: {
  candidate: CanonicalModelImprovementCandidate;
  evidence: CanonicalModelImprovementEvidenceBundle;
  multipleTesting: ReturnType<typeof createCanonicalMultipleTestingEvidence>;
}) {
  return createCanonicalModelExperimentPlan({
    proposal_identity: input.candidate.proposal_identity,
    baseline_versions: baselineVersions,
    candidate_versions: candidateVersions,
    exact_change_set_digest: input.candidate.change_set_digest,
    primary_metric: "cost_adjusted_expectancy_r",
    secondary_metrics: [
      "brier_score",
      "expected_calibration_error",
      "precision_at_3",
      "win_rate",
    ],
    protected_metrics: [
      { metric: "precision_at_3", non_inferiority_floor: -0.03 },
      { metric: "win_rate", non_inferiority_floor: -0.02 },
    ],
    cohort: input.evidence.quality_metrics.cohort,
    period: {
      ...input.evidence.quality_metrics.period,
    },
    validation_design: {
      method: "chronological_trading_day_walk_forward_with_holdout_v1",
      holdout_locked: true,
      purge_and_embargo_required: true,
    },
    sample_minimum: {
      identities: canonicalModelImprovementPolicy.minimum_identities,
      trading_days: canonicalModelImprovementPolicy.minimum_trading_days,
      tickers: canonicalModelImprovementPolicy.minimum_tickers,
      regimes: canonicalModelImprovementPolicy.minimum_regimes,
    },
    stop_conditions: [
      "protected_metric_non_inferiority_breach",
      "point_in_time_or_lineage_failure",
      "calibration_regression",
    ],
    rollback_metadata: {
      previous_versions: baselineVersions,
      candidate_versions: candidateVersions,
      rollback_trigger_categories: [
        "calibration_regression",
        "cost_adjusted_expectancy_regression",
        "lineage_or_trust_failure",
      ],
      kill_switch_owner: "OWNER_REQUIRED_BEFORE_ANY_EXPERIMENT",
    },
    evidence_root_digest: input.evidence.evidence_root_digest,
    multiple_testing_evidence_digest: input.multipleTesting.evidence_digest,
    metric_inventory_digest:
      input.evidence.quality_metrics.metric_inventory.inventory_digest,
    hypothesis_inventory_digest:
      input.multipleTesting.hypothesis_inventory_digest,
    multiple_testing_family_identity:
      input.multipleTesting.family_identity,
    hypothesis_preregistration_identity:
      input.multipleTesting.preregistration_identity,
    preregistered: true,
    no_automatic_promotion: true,
  });
}

function fixtureDraft(options: FixtureOptions) {
  const { evidence, upstreamSources } = buildEvidence(options);
  const candidate = candidateFor(options, evidence);
  const multipleTesting = createCanonicalMultipleTestingEvidence({
    correction_method: options.correction_method ?? "holm_bonferroni_v1",
    family_identity: `canonical-hypothesis-family:${options.name}`,
    preregistration_identity:
      `canonical-preregistration:${options.name}`,
    hypotheses: [
      {
        hypothesis_identity: `hypothesis:${options.name}:expectancy`,
        family_identity: `canonical-hypothesis-family:${options.name}`,
        selection_group: "model_improvement_candidate",
        raw_p_value: options.primary_raw_p_value ?? 0.01,
        test_direction: "higher",
        metric: "cost_adjusted_expectancy_r",
        cohort: evidence.quality_metrics.cohort,
        preregistration_identity:
          `canonical-preregistration:${options.name}`,
      },
      ...(["brier_score", "precision_at_3", "win_rate"] as const).map(
        (metric, index) => ({
          hypothesis_identity: `hypothesis:${options.name}:${metric}`,
          family_identity: `canonical-hypothesis-family:${options.name}`,
          selection_group: "model_improvement_candidate",
          raw_p_value: 0.2 + index * 0.1,
          test_direction:
            metric === "brier_score"
              ? ("lower" as const)
              : ("higher" as const),
          metric,
          cohort: evidence.quality_metrics.cohort,
          preregistration_identity:
            `canonical-preregistration:${options.name}`,
        }),
      ),
    ],
  });
  const shouldHavePlan =
    options.plan_required ?? candidate.proposal_type !== "no_change";
  const canonicalPlan = shouldHavePlan
    ? planFor({
        candidate,
        evidence,
        multipleTesting,
      })
    : null;
  const experimentPlan = options.tamper_plan && canonicalPlan
    ? {
        ...structuredClone(canonicalPlan),
        primary_metric: "win_rate" as const,
      }
    : canonicalPlan;
  const candidates = options.duplicate_candidate
    ? [candidate, structuredClone(candidate)]
    : [candidate];
  const payload: CanonicalModelImprovementTrustedPayload = {
    proposal_policy_version: CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
    upstream_sources: upstreamSources,
    evidence,
    proposal_candidates: candidates,
    experiment_plan: experimentPlan,
    multiple_testing: multipleTesting,
    no_change_policy_version:
      candidate.proposal_type === "no_change"
        ? "canonical_model_improvement_no_change_policy_v1"
        : null,
  };
  const post = createCanonicalModelImprovementTrustedPost({
    trusted_input_identity: `action-666v:${options.name}`,
    payload,
  });
  const request: CanonicalModelImprovementRequest = {
    evidence_class: "synthetic_fixture_only",
    trusted_input_identity: post.trusted_input_identity,
    trusted_input_digest: post.semantic_digest,
  };
  return {
    name: options.name,
    expected_status: options.expected_status,
    payload,
    post,
    request,
  };
}

const fixtureOptions: FixtureOptions[] = [
  {
    name: "stable_improvement_across_splits",
    expected_status: "proposal_ready",
  },
  {
    name: "in_sample_only_improvement",
    expected_status: "conflicting",
    in_sample_only: true,
  },
  {
    name: "calibration_regression",
    expected_status: "research_only",
    calibration_delta: 0.04,
  },
  {
    name: "cost_eroded_edge",
    expected_status: "research_only",
    expectancy_delta: -0.01,
  },
  {
    name: "regime_specific_pattern",
    expected_status: "proposal_ready",
    proposal_type: "regime_specific_abstention_candidate",
    change_identifier: "bear_regime_abstention",
  },
  {
    name: "too_few_days_and_tickers",
    expected_status: "insufficient_evidence",
    days: 3,
    tickers: 2,
  },
  {
    name: "conflicting_explanations",
    expected_status: "conflicting",
    conflicting_explanations: 1,
  },
  {
    name: "missing_outcomes",
    expected_status: "conflicting",
    complete_outcomes: false,
  },
  {
    name: "feature_trust_drift",
    expected_status: "conflicting",
    feature_registry_root:
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  {
    name: "multiple_testing_risk",
    expected_status: "research_only",
    primary_raw_p_value: 0.2,
    correction_method: "holm_bonferroni_v1",
  },
  {
    name: "no_change",
    expected_status: "no_change",
    proposal_type: "no_change",
    classification: "non_inferior",
    expectancy_delta: 0,
    plan_required: false,
  },
  {
    name: "threshold_protected_metric_regression",
    expected_status: "research_only",
    proposal_type: "ranking_threshold_candidate",
    protected_metric_delta: -0.08,
  },
  {
    name: "duplicate_proposal_identity",
    expected_status: "conflicting",
    duplicate_candidate: true,
  },
  {
    name: "tampered_experiment_plan",
    expected_status: "conflicting",
    tamper_plan: true,
  },
  {
    name: "score_is_not_probability",
    expected_status: "research_only",
    probability_semantics: "probability_semantics_missing",
  },
  {
    name: "future_context_not_point_in_time_safe",
    expected_status: "conflicting",
    point_in_time_safe: false,
  },
];

const fixtureDrafts = fixtureOptions.map(fixtureDraft);
export const action666x1TrustedProposalRegistry =
  createCanonicalModelImprovementTrustedRegistry(
    fixtureDrafts.map((fixture) => fixture.post),
  );
export const action666x1ProposalRegistryAuthorityManifest =
  createCanonicalModelImprovementRegistryAuthorityManifest({
    authority_identity:
      "action-666x1-version-controlled-proposal-registry-authority",
    registry_root_digests: [action666x1TrustedProposalRegistry.root_digest],
    feature_context_registry_root_digest:
      action666hTrustedFeatureContextRegistry.root_digest,
    training_input_registry_root_digest:
      action666hTrustedTrainingInputRegistry.root_digest,
    upstream_verifier_version:
      CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
  });
export const action666x1ProposalRegistryAuthority =
  createCanonicalModelImprovementRegistryAuthority(
    action666x1ProposalRegistryAuthorityManifest,
  );
export const action666x2EmptyPreviousBindingLookup = {
  lookup_proposal_binding: () => null,
  lookup_experiment_binding: () => null,
};

function completeFixture(draft: (typeof fixtureDrafts)[number]) {
  const trustBoundary: CanonicalModelImprovementTrustBoundary = {
    trust_source: "version_controlled_synthetic_proposal_registry",
    registry: action666x1TrustedProposalRegistry,
    registry_authority: action666x1ProposalRegistryAuthority,
  };
  return {
    ...draft,
    registry: action666x1TrustedProposalRegistry,
    trustBoundary,
    engine: createCanonicalModelImprovementEngine({
      enabled: true,
      kill_switch_engaged: false,
      trust_boundary: trustBoundary,
      previous_binding_lookup: action666x2EmptyPreviousBindingLookup,
    }),
  };
}

const completedFixtures = fixtureDrafts.map(completeFixture);

export const action666vStableImprovementFixture = completedFixtures[0];
export const action666vInSampleOnlyFixture = completedFixtures[1];
export const action666vCalibrationRegressionFixture = completedFixtures[2];
export const action666vCostErodedFixture = completedFixtures[3];
export const action666vRegimeSpecificFixture = completedFixtures[4];
export const action666vInsufficientFixture = completedFixtures[5];
export const action666vConflictingExplanationsFixture = completedFixtures[6];
export const action666vMissingOutcomesFixture = completedFixtures[7];
export const action666vFeatureTrustDriftFixture = completedFixtures[8];
export const action666vMultipleTestingRiskFixture = completedFixtures[9];
export const action666vNoChangeFixture = completedFixtures[10];
export const action666vProtectedRegressionFixture = completedFixtures[11];
export const action666vDuplicateProposalFixture = completedFixtures[12];
export const action666vTamperedPlanFixture = completedFixtures[13];
export const action666vProbabilityMissingFixture = completedFixtures[14];
export const action666vNotPointInTimeFixture = completedFixtures[15];

export const action666vFixtureCases = [
  action666vStableImprovementFixture,
  action666vInSampleOnlyFixture,
  action666vCalibrationRegressionFixture,
  action666vCostErodedFixture,
  action666vRegimeSpecificFixture,
  action666vInsufficientFixture,
  action666vConflictingExplanationsFixture,
  action666vMissingOutcomesFixture,
  action666vFeatureTrustDriftFixture,
  action666vMultipleTestingRiskFixture,
  action666vNoChangeFixture,
  action666vProtectedRegressionFixture,
  action666vDuplicateProposalFixture,
  action666vTamperedPlanFixture,
  action666vProbabilityMissingFixture,
  action666vNotPointInTimeFixture,
] as const;

export function action666vReorderedStableFixture() {
  const payload = structuredClone(action666vStableImprovementFixture.payload);
  payload.evidence.explanation_cohort.explanation_digests.reverse();
  payload.evidence.explanation_cohort.patterns.reverse();
  payload.evidence.quality_metrics.protected_metrics.reverse();
  payload.proposal_candidates[0].change_set.reverse();
  payload.proposal_candidates[0].evidence_items.reverse();
  payload.experiment_plan?.secondary_metrics.reverse();
  payload.experiment_plan?.protected_metrics.reverse();
  payload.experiment_plan?.stop_conditions.reverse();
  const post = createCanonicalModelImprovementTrustedPost({
    trusted_input_identity:
      action666vStableImprovementFixture.post.trusted_input_identity,
    payload,
  });
  const registry = action666x1TrustedProposalRegistry;
  const trustBoundary: CanonicalModelImprovementTrustBoundary = {
    trust_source: "version_controlled_synthetic_proposal_registry",
    registry,
    registry_authority: action666x1ProposalRegistryAuthority,
  };
  return {
    post,
    registry,
    trustBoundary,
    request: {
      evidence_class: "synthetic_fixture_only" as const,
      trusted_input_identity: post.trusted_input_identity,
      trusted_input_digest: post.semantic_digest,
    },
    engine: createCanonicalModelImprovementEngine({
      enabled: true,
      kill_switch_engaged: false,
      trust_boundary: trustBoundary,
      previous_binding_lookup: action666x2EmptyPreviousBindingLookup,
    }),
  };
}
