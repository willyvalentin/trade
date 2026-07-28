import "server-only";

import { createHash } from "node:crypto";

import {
  compareCanonicalQualityScorecards,
  verifyCanonicalPairBoundComparabilityEvidence,
  verifyCanonicalQualityScorecardDigest,
  verifyCanonicalQualityVersionComparisonDigest,
  type CanonicalQualityScorecard,
  type CanonicalQualityVersionComparison,
} from "@/lib/canonical-quality-scorecard";
import {
  verifyCanonicalCounterfactualOpportunitySet,
  type CanonicalCounterfactualOpportunitySetContract,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  verifyCanonicalOfflineLearningResult,
  type CanonicalOfflineLearningRequest,
  type CanonicalOfflineLearningResult,
} from "@/lib/server/canonical-offline-learning-engine";
import {
  type CanonicalOfflineLearningTrustBoundary,
} from "@/lib/server/canonical-offline-learning-trust-registry";
import {
  createCanonicalPredictiveExplanationEngine,
  verifyCanonicalPredictiveOutcomeExplanation,
  type CanonicalPredictiveExplanationTrustBoundary,
  type CanonicalPredictiveOutcomeExplanationRequest,
  type CanonicalPredictiveOutcomeExplanationResult,
} from "@/lib/server/canonical-predictive-outcome-explanation";
import {
  CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
  verifyCanonicalShadowEvaluationResult,
  type CanonicalShadowEvaluationResult,
  type CanonicalShadowPairComparisonInput,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";

export const CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION =
  "canonical_model_improvement_upstream_verifier_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_TEMPORAL_POLICY_VERSION =
  "canonical_model_improvement_explicit_instant_policy_v1" as const;

export const CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_NAMESPACES = [
  "quality_metrics",
  "opportunity_sets",
  "shadow_evaluation",
  "offline_learning",
  "explanation_cohort",
  "evidence_root",
  "experiment_plan",
] as const;

export type CanonicalModelImprovementEvidenceNamespace =
  (typeof CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_NAMESPACES)[number];

export type CanonicalModelImprovementUpstreamSources = {
  verifier_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION;
  quality: {
    baseline: CanonicalQualityScorecard;
    candidate: CanonicalQualityScorecard;
    comparison: CanonicalQualityVersionComparison;
    bootstrap_seed: string;
  };
  opportunity_sets: CanonicalCounterfactualOpportunitySetContract[];
  shadow: {
    comparison_input: CanonicalShadowPairComparisonInput;
    evaluation_result: CanonicalShadowEvaluationResult;
  };
  learning: {
    request: CanonicalOfflineLearningRequest;
    result: CanonicalOfflineLearningResult;
    trust_boundary: CanonicalOfflineLearningTrustBoundary;
  };
  explanations: {
    trust_boundary: CanonicalPredictiveExplanationTrustBoundary;
    request: CanonicalPredictiveOutcomeExplanationRequest;
    result: CanonicalPredictiveOutcomeExplanationResult;
  }[];
};

export type CanonicalExplicitInstant = {
  source: string;
  epoch_nanoseconds: bigint;
};

export type CanonicalModelImprovementUpstreamProjection = {
  verifier_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION;
  source_contract_versions: {
    quality: string;
    opportunity_sets: string;
    shadow: string;
    learning: string;
    explanations: string;
    temporal: typeof CANONICAL_MODEL_IMPROVEMENT_TEMPORAL_POLICY_VERSION;
  };
  quality: {
    baseline_scorecard_digest: string;
    candidate_scorecard_digest: string;
    comparison_digest: string;
    comparability_status: CanonicalQualityVersionComparison["comparability_status"];
    classification: CanonicalQualityVersionComparison["classification"];
    cohort: string;
    period: { start: string; end: string };
    denominator_digest: string;
    identity_count: number;
    cost_adjusted_expectancy_delta_r: number | null;
    calibration_delta: number | null;
    protected_metrics: {
      metric: string;
      delta: number | null;
      status: "measurable" | "not_measurable";
    }[];
    metric_results: {
      metric: string;
      value: number | null;
      delta: number | null;
      status: "measurable" | "not_measurable";
      uncertainty_digest: string;
    }[];
    incomplete_rate: number;
    ambiguous_rate: number;
    conflicting_rate: number;
    uncertainty_digest: string;
  };
  opportunity_sets: {
    identities: string[];
    digests: string[];
    complete_membership: boolean;
    complete_outcome_lineage: boolean;
    point_in_time_safe: boolean;
    expected_candidate_count: number;
    observed_candidate_count: number;
    evaluated_candidate_count: number;
  };
  shadow: {
    evaluation_identity: string;
    pair_digest: string;
    evaluation_digest: string;
    status: CanonicalShadowEvaluationResult["status"];
    reproducible: boolean;
    out_of_sample: boolean;
    probability_semantics:
      | "calibrated_probability"
      | "probability_semantics_missing";
  };
  learning: {
    status: CanonicalOfflineLearningResult["status"];
    result_digest: string | null;
    dataset_digest: string | null;
    split_digest: string | null;
    model_artifact_digest: string | null;
    shadow_binding_digest: string | null;
    feature_context_registry_root_digest: string | null;
    training_input_registry_root_digest: string | null;
    walk_forward_split_count: number;
    out_of_sample_prediction_count: number;
    reproducible: boolean;
    frozen_result: boolean;
    in_sample_only: boolean;
    stability_rows: {
      prediction_identity: string;
      canonical_decision_identity: string;
      opportunity_set_identity: string;
      trading_day: string;
      ticker: string;
      regime: string;
      split_identity: string;
      cohort: string;
      contribution: number;
      verified_prediction_digest: string;
    }[];
  };
  explanations: {
    digests: string[];
    conflicting_count: number;
    point_in_time_safe: boolean;
  };
  namespace_digests: Record<
    Exclude<
      CanonicalModelImprovementEvidenceNamespace,
      "evidence_root" | "experiment_plan"
    >,
    string
  >;
  temporal_evidence_digest: string;
};

export type CanonicalModelImprovementUpstreamVerification =
  | {
      status: "verified";
      projection: CanonicalModelImprovementUpstreamProjection;
      reason_codes: [];
    }
  | {
      status: "conflicting" | "not_point_in_time_safe";
      projection: null;
      reason_codes: string[];
    };

const explicitInstantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;

function canonicalize(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, nested]) => nested !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

export function parseCanonicalExplicitInstant(
  value: string,
): CanonicalExplicitInstant | null {
  const match = explicitInstantPattern.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = "", zone] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }
  const localMilliseconds = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(localMilliseconds);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute ||
    check.getUTCSeconds() !== second
  ) {
    return null;
  }
  let offsetSeconds = 0;
  if (zone !== "Z") {
    const sign = zone[0] === "+" ? 1 : -1;
    const offsetHour = Number(zone.slice(1, 3));
    const offsetMinute = Number(zone.slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) return null;
    offsetSeconds = sign * (offsetHour * 3_600 + offsetMinute * 60);
  }
  const wholeSeconds =
    BigInt(Math.trunc(localMilliseconds / 1_000) - offsetSeconds);
  const fractionalNanoseconds = BigInt(fraction.padEnd(9, "0") || "0");
  return {
    source: value,
    epoch_nanoseconds:
      wholeSeconds * BigInt(1_000_000_000) + fractionalNanoseconds,
  };
}

function strictInstant(value: string, reasons: string[], code: string) {
  const parsed = parseCanonicalExplicitInstant(value);
  if (!parsed) reasons.push(code);
  return parsed;
}

function rate(count: number, denominator: number) {
  return denominator > 0 ? count / denominator : 0;
}

const qualityVerificationCache = new Map<string, boolean>();
const opportunityVerificationCache = new Map<
  string,
  ReturnType<typeof verifyCanonicalCounterfactualOpportunitySet>
>();
const shadowVerificationCache = new Map<
  string,
  ReturnType<typeof verifyCanonicalShadowEvaluationResult>
>();
const learningVerificationCache = new Map<
  string,
  ReturnType<typeof verifyCanonicalOfflineLearningResult>
>();
const explanationVerificationCache = new Map<
  string,
  ReturnType<typeof verifyCanonicalPredictiveOutcomeExplanation>
>();

export function verifyAndProjectCanonicalModelImprovementUpstreams(
  sources: CanonicalModelImprovementUpstreamSources,
): CanonicalModelImprovementUpstreamVerification {
  const reasons: string[] = [];
  if (
    !sources ||
    typeof sources !== "object" ||
    !sources.quality ||
    !sources.opportunity_sets ||
    !sources.shadow ||
    !sources.learning ||
    !sources.explanations
  ) {
    return {
      status: "conflicting",
      projection: null,
      reason_codes: ["canonical_upstream_verifier_inputs_missing"],
    };
  }
  if (
    sources.verifier_version !==
    CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION
  ) {
    reasons.push("upstream_verifier_version_conflicting");
  }

  const quality = sources.quality;
  const qualityKey = digest(quality);
  let qualityValid = qualityVerificationCache.get(qualityKey);
  if (qualityValid === undefined) {
    const replayedComparison = compareCanonicalQualityScorecards({
      baseline: quality.baseline,
      candidate: quality.candidate,
      bootstrap_seed: quality.bootstrap_seed,
    });
    qualityValid =
      verifyCanonicalQualityScorecardDigest(quality.baseline) &&
      verifyCanonicalQualityScorecardDigest(quality.candidate) &&
      verifyCanonicalPairBoundComparabilityEvidence(
        quality.comparison.comparison_evidence,
      ) &&
      verifyCanonicalQualityVersionComparisonDigest(quality.comparison) &&
      digest(replayedComparison) === digest(quality.comparison);
    qualityVerificationCache.set(qualityKey, qualityValid);
  }
  if (!qualityValid) {
    reasons.push("action_664_quality_replay_conflicting");
  }

  if (
    sources.opportunity_sets.length === 0 ||
    !unique(
      sources.opportunity_sets.map((item) => item.opportunity_set_identity),
    )
  ) {
    reasons.push("action_665_opportunity_inventory_conflicting");
  }
  for (const set of sources.opportunity_sets) {
    const key = digest(set);
    let verification = opportunityVerificationCache.get(key);
    if (!verification) {
      verification = verifyCanonicalCounterfactualOpportunitySet(set);
      opportunityVerificationCache.set(key, verification);
    }
    if (!verification.valid) {
      reasons.push("action_665_opportunity_replay_conflicting");
    }
  }

  const shadowKey = digest(sources.shadow);
  let shadowVerification = shadowVerificationCache.get(shadowKey);
  if (!shadowVerification) {
    shadowVerification = verifyCanonicalShadowEvaluationResult({
      comparison_input: sources.shadow.comparison_input,
      evaluation_result: sources.shadow.evaluation_result,
    });
    shadowVerificationCache.set(shadowKey, shadowVerification);
  }
  if (!shadowVerification.valid || !shadowVerification.canonical_result) {
    reasons.push("action_666_shadow_replay_conflicting");
  }

  const learningKey = digest(sources.learning);
  let learningVerification = learningVerificationCache.get(learningKey);
  if (!learningVerification) {
    learningVerification = verifyCanonicalOfflineLearningResult({
      request: sources.learning.request,
      result: sources.learning.result,
      trust_boundary: sources.learning.trust_boundary,
    });
    learningVerificationCache.set(learningKey, learningVerification);
  }
  if (!learningVerification.valid || !learningVerification.canonical_result) {
    reasons.push("action_666_learning_replay_conflicting");
  }

  const explanationResults = sources.explanations.map((source) => {
    const key = digest(source);
    const cached = explanationVerificationCache.get(key);
    if (cached) return cached;
    const engine = createCanonicalPredictiveExplanationEngine({
        enabled: true,
        kill_switch: false,
        trust_boundary: source.trust_boundary,
      });
    const verification = verifyCanonicalPredictiveOutcomeExplanation({
        engine,
        request: source.request,
        explanation_result: source.result,
      });
    explanationVerificationCache.set(key, verification);
    return verification;
  });
  if (
    explanationResults.length === 0 ||
    explanationResults.some((verification) => !verification.valid)
  ) {
    reasons.push("action_666_explanation_replay_conflicting");
  }

  if (reasons.length > 0) {
    return {
      status: "conflicting",
      projection: null,
      reason_codes: [...new Set(reasons)].sort(),
    };
  }

  const candidateScorecard = quality.candidate;
  const periodStart = candidateScorecard.period.decided_at_or_after;
  const periodEnd = candidateScorecard.period.decided_before;
  const startInstant = strictInstant(
    periodStart,
    reasons,
    "quality_period_start_not_explicit_instant",
  );
  const endInstant = strictInstant(
    periodEnd,
    reasons,
    "quality_period_end_not_explicit_instant",
  );
  if (
    startInstant &&
    endInstant &&
    startInstant.epoch_nanoseconds >= endInstant.epoch_nanoseconds
  ) {
    reasons.push("quality_period_not_strictly_increasing");
  }

  const temporalInventory: Array<{
    namespace: string;
    timestamp: string;
    epoch_nanoseconds: string;
  }> = [];
  const registerInstant = (namespace: string, value: string) => {
    const parsed = strictInstant(
      value,
      reasons,
      `${namespace}_instant_invalid`,
    );
    if (parsed) {
      temporalInventory.push({
        namespace,
        timestamp: value,
        epoch_nanoseconds: parsed.epoch_nanoseconds.toString(),
      });
    }
    return parsed;
  };

  for (const set of sources.opportunity_sets) {
    const decision = registerInstant(
      "opportunity_decision",
      set.decision_timestamp,
    );
    const cutoff = registerInstant(
      "opportunity_cutoff",
      set.point_in_time_cutoff,
    );
    if (
      decision &&
      cutoff &&
      cutoff.epoch_nanoseconds > decision.epoch_nanoseconds
    ) {
      reasons.push("opportunity_cutoff_after_decision");
    }
    for (const candidate of set.candidates) {
      const provider = registerInstant(
        "candidate_provider_source",
        candidate.provider_source_timestamp,
      );
      if (
        provider &&
        cutoff &&
        provider.epoch_nanoseconds > cutoff.epoch_nanoseconds
      ) {
        reasons.push("provider_evidence_after_point_in_time_cutoff");
      }
      if (candidate.outcome) {
        const completion = registerInstant(
          "candidate_outcome_completion",
          candidate.outcome.evaluated_at,
        );
        if (
          completion &&
          decision &&
          completion.epoch_nanoseconds < decision.epoch_nanoseconds
        ) {
          reasons.push("outcome_completion_before_decision");
        }
      }
    }
  }

  for (const row of sources.learning.request.rows) {
    const cutoff = registerInstant("learning_cutoff", row.point_in_time_cutoff);
    const provider = registerInstant(
      "learning_provider_snapshot",
      row.overlap_evidence.provider_snapshot_timestamp,
    );
    const intervalStart = registerInstant(
      "learning_outcome_interval_start",
      row.overlap_evidence.outcome_interval_start,
    );
    const intervalEnd = registerInstant(
      "learning_outcome_interval_end",
      row.overlap_evidence.outcome_interval_end,
    );
    const completion = registerInstant(
      "learning_outcome_completion",
      row.overlap_evidence.outcome_completed_at,
    );
    if (
      cutoff &&
      provider &&
      provider.epoch_nanoseconds > cutoff.epoch_nanoseconds
    ) {
      reasons.push("learning_provider_snapshot_after_cutoff");
    }
    if (
      intervalStart &&
      intervalEnd &&
      intervalStart.epoch_nanoseconds >= intervalEnd.epoch_nanoseconds
    ) {
      reasons.push("learning_outcome_interval_invalid");
    }
    if (
      intervalEnd &&
      completion &&
      completion.epoch_nanoseconds < intervalEnd.epoch_nanoseconds
    ) {
      reasons.push("learning_completion_before_outcome_interval_end");
    }
  }

  const canonicalExplanationResults = explanationResults.map(
    (verification) => verification.canonical_result!,
  );
  if (
    canonicalExplanationResults.some(
      (result) => result.status === "not_point_in_time_safe",
    )
  ) {
    reasons.push("canonical_explanation_not_point_in_time_safe");
  }
  for (const result of canonicalExplanationResults) {
    const explanation = result.explanation;
    if (!explanation) continue;
    const observationCutoff = registerInstant(
      "explanation_observation_cutoff",
      explanation.outcome_evidence.observation_cutoff,
    );
    const context = registerInstant(
      "explanation_context_observed",
      explanation.context_evidence.observed_at,
    );
    const evaluated = registerInstant(
      "explanation_outcome_evaluated",
      explanation.outcome_evidence.outcome_evaluated_at,
    );
    const completion = registerInstant(
      "explanation_outcome_completion",
      explanation.outcome_evidence.canonical_completion_timestamp,
    );
    if (
      context &&
      observationCutoff &&
      context.epoch_nanoseconds > observationCutoff.epoch_nanoseconds
    ) {
      reasons.push("explanation_context_after_observation_cutoff");
    }
    if (
      evaluated &&
      completion &&
      evaluated.epoch_nanoseconds < completion.epoch_nanoseconds
    ) {
      reasons.push("explanation_evaluation_before_canonical_completion");
    }
  }

  if (reasons.length > 0) {
    return {
      status: "not_point_in_time_safe",
      projection: null,
      reason_codes: [...new Set(reasons)].sort(),
    };
  }

  const opportunityIdentities = sources.opportunity_sets
    .map((item) => item.opportunity_set_identity)
    .sort();
  const opportunityDigests = sources.opportunity_sets
    .map((item) => item.semantic_digest)
    .sort();
  const candidates = sources.opportunity_sets.flatMap((item) => item.candidates);
  const evaluatedCandidates = candidates.filter(
    (candidate) =>
      candidate.outcome?.outcome_evaluable === true &&
      candidate.outcome.reproducible &&
      candidate.outcome.coverage_status === "complete",
  );
  const canonicalShadow = shadowVerification.canonical_result!;
  const shadowEvaluation = canonicalShadow.evaluation;
  const canonicalLearning = learningVerification.canonical_result!;
  const explanationDigests = canonicalExplanationResults
    .flatMap((result) =>
      result.explanation
        ? [result.explanation.canonical_explanation_digest]
        : [],
    )
    .sort();
  const qualityCoverage = candidateScorecard.coverage;
  const expectancyDelta = quality.comparison.deltas.expectancy_r.delta;
  const calibrationDelta =
    quality.comparison.deltas.expected_calibration_error.delta;
  const protectedMetrics = [
    quality.comparison.deltas.precision_at_k["3"],
    quality.comparison.deltas.win_rate,
  ].map((metric) => ({
    metric: metric.metric,
    delta: metric.delta,
    status:
      metric.status === "measurable"
        ? ("measurable" as const)
        : ("not_measurable" as const),
  }));
  const metricResults = [
    quality.comparison.deltas.expectancy_r,
    quality.comparison.deltas.brier_score,
    quality.comparison.deltas.expected_calibration_error,
    quality.comparison.deltas.precision_at_k["3"],
    quality.comparison.deltas.win_rate,
  ].map((metric) => ({
    metric:
      metric.metric === "expectancy_r"
        ? "cost_adjusted_expectancy_r"
        : metric.metric,
    value: metric.candidate_value,
    delta: metric.delta,
    status:
      metric.status === "measurable"
        ? ("measurable" as const)
        : ("not_measurable" as const),
    uncertainty_digest: digest({
      metric: metric.metric,
      confidence_interval: metric.confidence_interval,
    }),
  }));
  const stabilityRows = canonicalLearning.predictions
    .filter(
      (prediction) =>
        prediction.family === "regularized_linear_canonical_r",
    )
    .map((prediction) => ({
      prediction_identity: prediction.prediction_identity,
      canonical_decision_identity: prediction.canonical_decision_identity,
      opportunity_set_identity: prediction.opportunity_set_identity,
      trading_day: prediction.decision_day,
      ticker: prediction.ticker,
      regime: prediction.regime,
      split_identity: prediction.split_identity,
      cohort: prediction.cohort,
      contribution: prediction.actual,
      verified_prediction_digest: prediction.semantic_digest,
    }))
    .sort((first, second) =>
      first.prediction_identity.localeCompare(second.prediction_identity),
    );
  const uncertaintyDigest = digest({
    expectancy_r: quality.comparison.deltas.expectancy_r.confidence_interval,
    win_rate: quality.comparison.deltas.win_rate.confidence_interval,
    brier_score: quality.comparison.deltas.brier_score.confidence_interval,
    expected_calibration_error:
      quality.comparison.deltas.expected_calibration_error.confidence_interval,
    precision_at_3:
      quality.comparison.deltas.precision_at_k["3"].confidence_interval,
  });

  const namespaceDigests = {
    quality_metrics: digest({
      baseline: quality.baseline.semantic_digest,
      candidate: quality.candidate.semantic_digest,
      comparison: quality.comparison.semantic_digest,
      uncertainty: uncertaintyDigest,
    }),
    opportunity_sets: digest({
      identities: opportunityIdentities,
      digests: opportunityDigests,
    }),
    shadow_evaluation: digest(canonicalShadow),
    offline_learning: digest(canonicalLearning),
    explanation_cohort: digest({
      explanation_digests: explanationDigests,
    }),
  };

  const projection: CanonicalModelImprovementUpstreamProjection = {
    verifier_version: CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
    source_contract_versions: {
      quality: quality.comparison.comparison_version,
      opportunity_sets: sources.opportunity_sets[0].contract_version,
      shadow:
        shadowEvaluation?.evaluation_version ??
        CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
      learning: canonicalLearning.engine_version,
      explanations:
        canonicalExplanationResults.find((item) => item.explanation)
          ?.explanation?.contract_version ??
        sources.explanations[0].result.explanation?.contract_version ??
        "canonical_predictive_outcome_explanation_v1",
      temporal: CANONICAL_MODEL_IMPROVEMENT_TEMPORAL_POLICY_VERSION,
    },
    quality: {
      baseline_scorecard_digest: quality.baseline.semantic_digest,
      candidate_scorecard_digest: quality.candidate.semantic_digest,
      comparison_digest: quality.comparison.semantic_digest,
      comparability_status: quality.comparison.comparability_status,
      classification: quality.comparison.classification,
      cohort: candidateScorecard.cohort,
      period: { start: periodStart, end: periodEnd },
      denominator_digest:
        candidateScorecard.denominator_identity.canonical_identity_set_sha256,
      identity_count:
        candidateScorecard.denominator_identity.canonical_identity_count,
      cost_adjusted_expectancy_delta_r: expectancyDelta,
      calibration_delta: calibrationDelta,
      protected_metrics: protectedMetrics,
      metric_results: metricResults,
      incomplete_rate: rate(
        qualityCoverage.incomplete_identity_count,
        qualityCoverage.expected_identity_count,
      ),
      ambiguous_rate: rate(
        qualityCoverage.ambiguous_identity_count,
        qualityCoverage.expected_identity_count,
      ),
      conflicting_rate: rate(
        qualityCoverage.conflicting_identity_count,
        qualityCoverage.expected_identity_count,
      ),
      uncertainty_digest: uncertaintyDigest,
    },
    opportunity_sets: {
      identities: opportunityIdentities,
      digests: opportunityDigests,
      complete_membership: sources.opportunity_sets.every(
        (item) =>
          item.expected_candidate_count === item.observed_candidate_count &&
          item.observed_candidate_count === item.candidates.length,
      ),
      complete_outcome_lineage: evaluatedCandidates.length === candidates.length,
      point_in_time_safe: true,
      expected_candidate_count: sources.opportunity_sets.reduce(
        (sum, item) => sum + item.expected_candidate_count,
        0,
      ),
      observed_candidate_count: sources.opportunity_sets.reduce(
        (sum, item) => sum + item.observed_candidate_count,
        0,
      ),
      evaluated_candidate_count: evaluatedCandidates.length,
    },
    shadow: {
      evaluation_identity: shadowEvaluation?.evaluation_identity ?? "",
      pair_digest:
        shadowEvaluation?.pairing_evidence.pair_semantic_digest ?? "",
      evaluation_digest: shadowEvaluation?.evaluation_digest ?? "",
      status: canonicalShadow.status,
      reproducible: shadowVerification.valid,
      out_of_sample: true,
      probability_semantics:
        canonicalShadow.status === "evaluable"
          ? "calibrated_probability"
          : "probability_semantics_missing",
    },
    learning: {
      status: canonicalLearning.status,
      result_digest: canonicalLearning.result_digest,
      dataset_digest: canonicalLearning.dataset_digest,
      split_digest: canonicalLearning.split_digest,
      model_artifact_digest: canonicalLearning.model_artifact_digest,
      shadow_binding_digest:
        canonicalLearning.shadow_evaluation_binding?.semantic_digest ?? null,
      feature_context_registry_root_digest:
        canonicalLearning.trust_evidence
          ?.feature_context_registry_root_digest ?? null,
      training_input_registry_root_digest:
        canonicalLearning.trust_evidence
          ?.training_input_registry_root_digest ?? null,
      walk_forward_split_count: canonicalLearning.splits.length,
      out_of_sample_prediction_count: canonicalLearning.predictions.length,
      reproducible: canonicalLearning.reproducibility.deterministic,
      frozen_result: true,
      in_sample_only: false,
      stability_rows: stabilityRows,
    },
    explanations: {
      digests: explanationDigests,
      conflicting_count: canonicalExplanationResults.filter(
        (result) => result.status === "conflicting",
      ).length,
      point_in_time_safe: canonicalExplanationResults.every(
        (result) => result.status !== "not_point_in_time_safe",
      ),
    },
    namespace_digests: namespaceDigests,
    temporal_evidence_digest: digest(
      [...temporalInventory].sort((first, second) =>
        `${first.namespace}:${first.epoch_nanoseconds}`.localeCompare(
          `${second.namespace}:${second.epoch_nanoseconds}`,
        ),
      ),
    ),
  };
  return { status: "verified", projection, reason_codes: [] };
}
