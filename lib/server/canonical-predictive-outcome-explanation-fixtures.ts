import "server-only";

import {
  action665aExplicitNoTradeOpportunitySet,
} from "@/lib/canonical-counterfactual-opportunity-set-fixtures";
import type {
  CanonicalCounterfactualOpportunitySetContract,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  CANONICAL_ATTRIBUTION_EVIDENCE_VERSION,
  type CanonicalLearningFeatureAblation,
  type CanonicalLearningPrediction,
} from "@/lib/server/canonical-offline-learning-engine";
import {
  action666hTrustedFeatureContextRegistry,
  action666hTrustedTrainingInputRegistry,
} from "@/lib/server/canonical-offline-learning-engine-fixtures";
import {
  CANONICAL_EXPLANATION_CALIBRATION_EVIDENCE_VERSION,
  CANONICAL_EXPLANATION_COST_CAPTURE_VERSION,
  CANONICAL_EXPLANATION_MODEL_RESULT_POST_VERSION,
  CANONICAL_EXPLANATION_OUTCOME_EVIDENCE_VERSION,
  CANONICAL_EXPLANATION_THRESHOLD_POLICY_VERSION,
  canonicalPredictiveOutcomeExplanationDigest,
  createCanonicalPredictiveExplanationEngine,
  createCanonicalPredictiveTrustedInputPost,
  createCanonicalPredictiveTrustedInputRegistry,
  type CanonicalPredictiveCalibrationBucket,
  type CanonicalPredictiveCostEvidence,
  type CanonicalPredictiveExplanationTrustBoundary,
  type CanonicalPredictiveModelFeatureEvidence,
  type CanonicalPredictiveModelResultPost,
  type CanonicalPredictiveOutcomeExplanationRequest,
  type CanonicalPredictiveOutcomePathPoint,
  type CanonicalPredictiveTrustedInputPayload,
  type CanonicalPredictiveTrustedInputPost,
} from "@/lib/server/canonical-predictive-outcome-explanation";
import {
  action666aCompleteOpportunitySet,
  action666aValidPair,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation-fixtures";
import {
  buildCanonicalShadowVersionTuple,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";

function digest(value: unknown) {
  return canonicalPredictiveOutcomeExplanationDigest(value);
}

function isoAt(decisionTimestamp: string, minutes: number) {
  return new Date(Date.parse(decisionTimestamp) + minutes * 60_000).toISOString();
}

function prediction(input: {
  canonicalDecisionIdentity: string;
  opportunitySetIdentity: string;
  ticker: string;
  regime: string;
  probability: number;
  actual: 0 | 1;
  intercept: number;
  contributions: Record<string, number>;
}): CanonicalLearningPrediction {
  const linear =
    input.intercept +
    Object.values(input.contributions).reduce((sum, value) => sum + value, 0);
  const payload = {
    split_identity: "canonical-learning-split:action-666o-fixture",
    family: "regularized_logistic_target_before_stop" as const,
    canonical_decision_identity: input.canonicalDecisionIdentity,
    opportunity_set_identity: input.opportunitySetIdentity,
    decision_day: "2026-07-26",
    ticker: input.ticker,
    regime: input.regime,
    cohort: "shadow_recommendation_quality" as const,
    actual: input.actual,
    prediction: input.probability,
    local_prediction_contribution: {
      attribution_version: CANONICAL_ATTRIBUTION_EVIDENCE_VERSION,
      baseline: input.intercept,
      by_feature: input.contributions,
      reconstructed_prediction_scale_value: linear,
      attribution_scale: "log_odds" as const,
      attribution_unit: "log_odds_target_before_stop" as const,
      probability_delta:
        input.probability - 1 / (1 + Math.exp(-input.intercept)),
      predictive_association: true as const,
      causal_effect_claimed: false as const,
    },
  };
  const semanticDigest = digest(payload);
  return {
    ...payload,
    prediction_identity: `canonical-learning-prediction:${semanticDigest}`,
    semantic_digest: semanticDigest,
  };
}

function evidenceDigest<T extends Record<string, unknown>>(payload: T) {
  return {
    ...payload,
    evidence_digest: digest(payload),
  };
}

function costEvidence(input: {
  grossR: number;
  evaluatorInputIdentity: string;
  providerSnapshotIdentity: string;
  observedAt: string;
  costR?: number;
  slippageR?: number;
  rewardRisk?: number;
}): CanonicalPredictiveCostEvidence {
  const transactionCostR = input.costR ?? 0.05;
  const slippageR = input.slippageR ?? 0.02;
  return evidenceDigest({
    capture_version: CANONICAL_EXPLANATION_COST_CAPTURE_VERSION,
    capture_identity: `cost-capture:${digest({
      gross: input.grossR,
      evaluator: input.evaluatorInputIdentity,
    })}`,
    evaluator_input_identity: input.evaluatorInputIdentity,
    provider_snapshot_identity: input.providerSnapshotIdentity,
    observed_at: input.observedAt,
    unit: "canonical_r" as const,
    gross_r: input.grossR,
    transaction_cost_r: transactionCostR,
    slippage_r: slippageR,
    net_r: input.grossR - transactionCostR - slippageR,
    minimum_reward_risk: 1.5,
    realized_reward_risk: input.rewardRisk ?? 2,
  });
}

function calibrationBucket(input: {
  identity: string;
  lower: number;
  upper: number;
  count: number;
  meanProbability: number;
  observedPositiveRate: number;
}): CanonicalPredictiveCalibrationBucket {
  return evidenceDigest({
    evidence_version: CANONICAL_EXPLANATION_CALIBRATION_EVIDENCE_VERSION,
    bucket_identity: input.identity,
    cohort: "shadow_recommendation_quality",
    period_start: "2026-06-01T00:00:00.000Z",
    period_end: "2026-07-25T23:59:59.999Z",
    calibration_policy_version: "fixed_probability_buckets_v1",
    denominator_identity: "calibration-denominator:action-666o-fixture",
    denominator_count: 100,
    trusted_metrics_result_digest: digest("metrics-result-action-666o"),
    lower_inclusive: input.lower,
    upper_inclusive: input.upper,
    count: input.count,
    mean_probability: input.meanProbability,
    observed_positive_rate: input.observedPositiveRate,
  });
}

function outcomePath(input: {
  opportunitySet: CanonicalCounterfactualOpportunitySetContract;
  terminalOutcome: "target_before_stop" | "stop_before_target";
  grossR: number;
  netR: number;
  evaluatorInputIdentity: string;
  providerSnapshotIdentity: string;
  neighborOutcome?: "target_before_stop" | "stop_before_target";
}) {
  const cutoff = input.opportunitySet.point_in_time_cutoff;
  const completion = isoAt(input.opportunitySet.decision_timestamp, 60);
  return ([15, 30, 60] as const).map((minutes) => {
    const horizon = `${minutes}m` as "15m" | "30m" | "60m";
    const payload = {
      horizon,
      terminal_outcome:
        minutes === 15 && input.neighborOutcome
          ? input.neighborOutcome
          : input.terminalOutcome,
      gross_r: input.grossR * (minutes / 60),
      net_r: input.netR * (minutes / 60),
      completed: true,
      diagnostic_only: minutes !== 60,
      event_timestamp: isoAt(input.opportunitySet.decision_timestamp, minutes),
      interval_identity:
        `canonical-outcome-interval:${input.evaluatorInputIdentity}:${horizon}`,
      evaluator_input_identity: input.evaluatorInputIdentity,
      provider_snapshot_identity: input.providerSnapshotIdentity,
      observation_cutoff: cutoff,
      canonical_completion_timestamp: completion,
      horizon_completion_timestamp: isoAt(
        input.opportunitySet.decision_timestamp,
        minutes,
      ),
      point_in_time_eligible: true,
    };
    return evidenceDigest(payload);
  }) satisfies CanonicalPredictiveOutcomePathPoint[];
}

const featureAblation: CanonicalLearningFeatureAblation[] = [
  {
    feature: "momentum_strength",
    family: "regularized_logistic_target_before_stop",
    replacement: "training_window_standardized_baseline_zero",
    original_loss: 0.08,
    ablated_loss: 0.15,
    loss_delta: 0.07,
    predictive_association: true,
    causal_effect_claimed: false,
  },
  {
    feature: "regime_alignment",
    family: "regularized_logistic_target_before_stop",
    replacement: "training_window_standardized_baseline_zero",
    original_loss: 0.08,
    ablated_loss: 0.11,
    loss_delta: 0.03,
    predictive_association: true,
    causal_effect_claimed: false,
  },
];

function modelResult(input: {
  payloadBase: {
    canonicalDecisionIdentity: string;
    opportunitySetIdentity: string;
    ticker: string;
    regime: string;
    actual: 0 | 1;
  };
  probability: number;
  calibration?: CanonicalPredictiveCalibrationBucket;
}) {
  const contributions = {
    momentum_strength: 0.7,
    regime_alignment: 0.35,
    liquidity_quality: 0.15,
  };
  const logOdds = Math.log(input.probability / (1 - input.probability));
  const intercept =
    logOdds -
    Object.values(contributions).reduce((sum, value) => sum + value, 0);
  const features: CanonicalPredictiveModelFeatureEvidence[] = [
    {
      feature_id: "momentum_strength",
      current_value: 1,
      minimum_value: -3,
      maximum_value: 3,
      training_mean: 0,
      training_scale: 1,
      standardized_value: 1,
      standardized_coefficient: 0.7,
      log_odds_contribution: 0.7,
    },
    {
      feature_id: "regime_alignment",
      current_value: 1,
      minimum_value: -2,
      maximum_value: 2,
      training_mean: 0,
      training_scale: 1,
      standardized_value: 1,
      standardized_coefficient: 0.35,
      log_odds_contribution: 0.35,
    },
    {
      feature_id: "liquidity_quality",
      current_value: 1,
      minimum_value: -2,
      maximum_value: 2,
      training_mean: 0,
      training_scale: 1,
      standardized_value: 1,
      standardized_coefficient: 0.15,
      log_odds_contribution: 0.15,
    },
  ];
  const artifactPayload = {
    candidate_model_identity: "canonical-candidate-model:candidate:action-666o",
    training_input_manifest_digest:
      action666hTrustedTrainingInputRegistry.manifests[0].manifest_digest,
    training_input_registry_root_digest:
      action666hTrustedTrainingInputRegistry.root_digest,
    feature_context_registry_root_digest:
      action666hTrustedFeatureContextRegistry.root_digest,
    split_identity: "canonical-learning-split:action-666o-fixture",
    feature_order: features.map((feature) => feature.feature_id),
    intercept,
    features,
  };
  const artifactDigest = digest(artifactPayload);
  const baselineVersions = action666aValidPair.baseline.versions;
  const candidateVersions = action666aValidPair.candidate.versions;
  const baselineModel = {
    candidate_model_identity: "canonical-candidate-model:baseline:action-666o",
    model_artifact_digest: digest("baseline-model-action-666o"),
    versions: baselineVersions,
    version_tuple: buildCanonicalShadowVersionTuple(baselineVersions),
  };
  const candidateModel = {
    candidate_model_identity: artifactPayload.candidate_model_identity,
    model_artifact_digest: artifactDigest,
    versions: candidateVersions,
    version_tuple: buildCanonicalShadowVersionTuple(candidateVersions),
  };
  const oosPrediction = prediction({
    ...input.payloadBase,
    probability: input.probability,
    intercept,
    contributions,
  });
  const thresholdPayload = {
    policy_version: CANONICAL_EXPLANATION_THRESHOLD_POLICY_VERSION,
    policy_identity: "threshold-policy:action-666o-fixture",
    canonical_threshold: 0.7,
    allowed_threshold_variants: [0.5, 0.6, 0.7, 0.8, 0.9],
  };
  const calibration =
    input.calibration ??
    calibrationBucket({
      identity: "calibration-bucket:fixture",
      lower: Math.floor(input.probability * 5) / 5,
      upper: Math.min(1, Math.floor(input.probability * 5) / 5 + 0.2),
      count: 20,
      meanProbability: input.probability,
      observedPositiveRate: input.probability,
    });
  const shadowPairDigest = digest({
    baseline_model: baselineModel,
    candidate_model: candidateModel,
    opportunity_set_identity: input.payloadBase.opportunitySetIdentity,
  });
  const offlineLearningResultDigest = digest({
    candidate_model_artifact_digest: artifactDigest,
    prediction_digest: oosPrediction.semantic_digest,
    training_input_manifest_digest:
      artifactPayload.training_input_manifest_digest,
    training_input_registry_root_digest:
      artifactPayload.training_input_registry_root_digest,
  });
  const shadowEvaluationDigest = digest({
    shadow_pair_digest: shadowPairDigest,
    offline_learning_result_digest: offlineLearningResultDigest,
    prediction_digest: oosPrediction.semantic_digest,
    calibration_evidence_digest: calibration.evidence_digest,
  });
  const postPayload = {
    post_version: CANONICAL_EXPLANATION_MODEL_RESULT_POST_VERSION,
    result_identity:
      `canonical-model-result:${input.payloadBase.canonicalDecisionIdentity}`,
    offline_learning_result_digest: offlineLearningResultDigest,
    baseline_model: baselineModel,
    candidate_model: candidateModel,
    candidate_model_artifact_payload: artifactPayload,
    candidate_model_artifact_digest: artifactDigest,
    oos_prediction: oosPrediction,
    feature_ablation: structuredClone(featureAblation),
    calibration_evidence: calibration,
    correlation_diagnostics: [
      {
        first_feature_id: "momentum_strength",
        second_feature_id: "regime_alignment",
        correlation: 0.91,
        absolute_threshold: 0.85,
        reason_code:
          "strong_training_window_feature_correlation" as const,
      },
    ],
    threshold_policy: {
      ...thresholdPayload,
      semantic_digest: digest(thresholdPayload),
    },
    shadow_pair_digest: shadowPairDigest,
    shadow_evaluation_digest: shadowEvaluationDigest,
  };
  return {
    ...postPayload,
    semantic_digest: digest(postPayload),
  } satisfies CanonicalPredictiveModelResultPost;
}

function basePayload(input: {
  candidateIndex?: number;
  probability?: number;
  disposition?: "published_trade" | "rejected_candidate";
  opportunitySet?: CanonicalCounterfactualOpportunitySetContract;
  calibration?: CanonicalPredictiveCalibrationBucket;
} = {}): CanonicalPredictiveTrustedInputPayload {
  const opportunitySet =
    input.opportunitySet ?? action666aCompleteOpportunitySet;
  const candidate = opportunitySet.candidates[input.candidateIndex ?? 0];
  if (!candidate.outcome) throw new Error("fixture_candidate_outcome_missing");
  const disposition =
    input.disposition ??
    (candidate.membership_status === "selected"
      ? "published_trade"
      : "rejected_candidate");
  const probability = input.probability ?? 0.82;
  const evaluatorInputIdentity =
    candidate.expected_outcome_lineage.expected_outcome_lineage_key;
  const providerSnapshotIdentity =
    `outcome-provider-snapshot:${candidate.outcome.outcome_identity}`;
  const grossR = candidate.outcome.r_result ?? 0;
  const contextPayload = {
    capture_evidence_identity:
      `context-capture:${candidate.canonical_candidate_identity}`,
    regime: candidate.context.regime ?? "unknown",
    sector: candidate.context.sector ?? "unknown",
    volatility_state: "normal",
    liquidity_state: "liquid",
    observed_at: opportunitySet.provider_context.source_timestamp,
  };
  const contextEvidence = {
    ...contextPayload,
    capture_evidence_digest: digest(contextPayload),
    regime_associated_mismatch: false,
    sector_associated_mismatch: false,
    volatility_liquidity_associated_mismatch: false,
  };
  const model = modelResult({
    payloadBase: {
      canonicalDecisionIdentity:
        candidate.lineage.recommendation_decision_identity as string,
      opportunitySetIdentity: opportunitySet.opportunity_set_identity,
      ticker: candidate.ticker,
      regime: candidate.context.regime ?? "unknown",
      actual:
        candidate.outcome.terminal_outcome === "target_before_stop" ? 1 : 0,
    },
    probability,
    calibration: input.calibration,
  });
  const cost = costEvidence({
    grossR,
    evaluatorInputIdentity,
    providerSnapshotIdentity,
    observedAt: isoAt(opportunitySet.decision_timestamp, 60),
  });
  const path = outcomePath({
    opportunitySet,
    terminalOutcome:
      candidate.outcome.terminal_outcome === "target_before_stop"
        ? "target_before_stop"
        : "stop_before_target",
    grossR,
    netR: cost.net_r,
    evaluatorInputIdentity,
    providerSnapshotIdentity,
  });
  const pathInventoryDigest = digest(
    [...path]
      .sort((first, second) => first.horizon.localeCompare(second.horizon))
      .map((point) => point.evidence_digest),
  );
  const outcomeEvidence = evidenceDigest({
    evidence_version: CANONICAL_EXPLANATION_OUTCOME_EVIDENCE_VERSION,
    evaluator_input_identity: evaluatorInputIdentity,
    provider_snapshot_identity: providerSnapshotIdentity,
    observation_cutoff: opportunitySet.point_in_time_cutoff,
    canonical_completion_timestamp: isoAt(
      opportunitySet.decision_timestamp,
      60,
    ),
    outcome_evaluated_at: candidate.outcome.evaluated_at,
    evaluator_version: candidate.outcome.evaluator_version,
    provider_contract_version: candidate.outcome.provider_contract_version,
    realized_outcome_digest: digest(candidate.outcome),
    path_inventory_digest: pathInventoryDigest,
  });
  return {
    evidence_class: "synthetic_fixture_only",
    canonical_decision_identity:
      candidate.lineage.recommendation_decision_identity as string,
    explained_candidate_identity: candidate.canonical_candidate_identity,
    decision_disposition: disposition,
    opportunity_set: structuredClone(opportunitySet),
    feature_context_registry_root_digest:
      action666hTrustedFeatureContextRegistry.root_digest,
    training_input_manifest_identity:
      action666hTrustedTrainingInputRegistry.manifests[0].manifest_identity,
    training_input_manifest_digest:
      action666hTrustedTrainingInputRegistry.manifests[0].manifest_digest,
    training_input_registry_root_digest:
      action666hTrustedTrainingInputRegistry.root_digest,
    context_evidence: contextEvidence,
    model_result: model,
    realized_outcome: structuredClone(candidate.outcome),
    outcome_path: path,
    outcome_evidence: outcomeEvidence,
    cost_evidence: cost,
    entry_timing_sensitive: false,
    research_hypotheses: [
      "Research-only: test whether the observed regime association persists in a separately frozen OOS sample.",
    ],
  };
}

export function action666oCreateBasePayload(
  input: Parameters<typeof basePayload>[0] = {},
) {
  return basePayload(input);
}

export function action666oFixtureFromPayload(input: {
  name: string;
  payload: CanonicalPredictiveTrustedInputPayload;
  expectedRootOverride?: string;
}) {
  const post = createCanonicalPredictiveTrustedInputPost({
    trusted_input_identity: `trusted-explanation-input:${input.name}`,
    payload: input.payload,
  });
  const registry = createCanonicalPredictiveTrustedInputRegistry([post]);
  const trustBoundary: CanonicalPredictiveExplanationTrustBoundary = {
    trust_source: "version_controlled_synthetic_explanation_registry",
    registry,
    expected_registry_root_digest:
      input.expectedRootOverride ?? registry.root_digest,
  };
  const request: CanonicalPredictiveOutcomeExplanationRequest = {
    evidence_class: "synthetic_fixture_only",
    trusted_input_identity: post.trusted_input_identity,
    trusted_input_digest: post.semantic_digest,
  };
  const engine = createCanonicalPredictiveExplanationEngine({
    enabled: true,
    kill_switch: false,
    trust_boundary: trustBoundary,
  });
  return { post, registry, trustBoundary, request, engine };
}

const successful = action666oFixtureFromPayload({
  name: "successful-trade",
  payload: basePayload(),
});
export const action666mSuccessfulTradePayload = successful.post.payload;
export const action666mSuccessfulTradePost = successful.post;
export const action666mSuccessfulTradeRequest = successful.request;
export const action666mSuccessfulTradeTrustBoundary =
  successful.trustBoundary;
export const action666mSuccessfulTradeEngine = successful.engine;

function fixture(input: {
  name: string;
  payload: CanonicalPredictiveTrustedInputPayload;
  expected_status:
    | "explainable"
    | "insufficient_evidence"
    | "conflicting"
    | "non_reproducible"
    | "not_point_in_time_safe";
}) {
  return {
    name: input.name,
    ...action666oFixtureFromPayload({
      name: input.name,
      payload: input.payload,
    }),
    expected_status: input.expected_status,
  };
}

const falsePositive = basePayload({
  candidateIndex: 1,
  probability: 0.88,
  disposition: "published_trade",
});
const falseNegative = basePayload({
  candidateIndex: 2,
  probability: 0.3,
  disposition: "rejected_candidate",
});
const correctRejection = basePayload({
  candidateIndex: 3,
  probability: 0.25,
  disposition: "rejected_candidate",
});
const explicitNoTrade = basePayload({
  opportunitySet: action665aExplicitNoTradeOpportunitySet,
  probability: 0.25,
});
explicitNoTrade.decision_disposition = "explicit_no_trade";
const costReversal = basePayload();
costReversal.cost_evidence = costEvidence({
  grossR: 0.08,
  evaluatorInputIdentity:
    costReversal.outcome_evidence.evaluator_input_identity,
  providerSnapshotIdentity:
    costReversal.outcome_evidence.provider_snapshot_identity,
  observedAt: costReversal.outcome_evidence.canonical_completion_timestamp,
  costR: 0.05,
  slippageR: 0.05,
  rewardRisk: 0.8,
});
costReversal.outcome_path = outcomePath({
  opportunitySet: costReversal.opportunity_set,
  terminalOutcome: "target_before_stop",
  grossR: 0.08,
  netR: -0.02,
  evaluatorInputIdentity:
    costReversal.outcome_evidence.evaluator_input_identity,
  providerSnapshotIdentity:
    costReversal.outcome_evidence.provider_snapshot_identity,
});
costReversal.outcome_evidence = evidenceDigest({
  ...Object.fromEntries(
    Object.entries(costReversal.outcome_evidence).filter(
      ([key]) => key !== "evidence_digest" && key !== "path_inventory_digest",
    ),
  ),
  path_inventory_digest: digest(
    [...costReversal.outcome_path]
      .sort((first, second) => first.horizon.localeCompare(second.horizon))
      .map((point) => point.evidence_digest),
  ),
}) as typeof costReversal.outcome_evidence;
const association = basePayload({
  candidateIndex: 1,
  probability: 0.88,
  disposition: "published_trade",
});
association.context_evidence.regime_associated_mismatch = true;
association.context_evidence.sector_associated_mismatch = true;
const overconfidenceCalibration = calibrationBucket({
  identity: "calibration-bucket:0.9-1.0",
  lower: 0.9,
  upper: 1,
  count: 25,
  meanProbability: 0.93,
  observedPositiveRate: 0.55,
});
const overconfidence = basePayload({
  candidateIndex: 1,
  probability: 0.92,
  disposition: "published_trade",
  calibration: overconfidenceCalibration,
});

const missingMembership = basePayload();
missingMembership.explained_candidate_identity = "canonical-candidate:missing";
const featureDrift = basePayload();
featureDrift.model_result.candidate_model_artifact_payload.features[0]
  .feature_id = "renamed-untrusted-feature";
const futureLeakage = basePayload();
futureLeakage.context_evidence.observed_at = "2026-07-26T12:01:00.000Z";
const lineageConflict = basePayload();
lineageConflict.canonical_decision_identity = "canonical-decision:conflict";
const predictionConflict = basePayload();
predictionConflict.model_result.oos_prediction.prediction = 0.99;

export const action666mFixtureCases = [
  fixture({
    name: "successful_trade",
    payload: basePayload(),
    expected_status: "explainable",
  }),
  fixture({
    name: "false_positive",
    payload: falsePositive,
    expected_status: "explainable",
  }),
  fixture({
    name: "false_negative",
    payload: falseNegative,
    expected_status: "explainable",
  }),
  fixture({
    name: "correct_rejection",
    payload: correctRejection,
    expected_status: "explainable",
  }),
  fixture({
    name: "explicit_no_trade",
    payload: explicitNoTrade,
    expected_status: "explainable",
  }),
  fixture({
    name: "cost_reversal",
    payload: costReversal,
    expected_status: "explainable",
  }),
  fixture({
    name: "association",
    payload: association,
    expected_status: "explainable",
  }),
  fixture({
    name: "overconfidence",
    payload: overconfidence,
    expected_status: "explainable",
  }),
  fixture({
    name: "missing_membership",
    payload: missingMembership,
    expected_status: "insufficient_evidence",
  }),
  fixture({
    name: "feature_drift",
    payload: featureDrift,
    expected_status: "conflicting",
  }),
  fixture({
    name: "future_leakage",
    payload: futureLeakage,
    expected_status: "not_point_in_time_safe",
  }),
  fixture({
    name: "lineage_conflict",
    payload: lineageConflict,
    expected_status: "non_reproducible",
  }),
  fixture({
    name: "prediction_conflict",
    payload: predictionConflict,
    expected_status: "non_reproducible",
  }),
];

export const action666mFalsePositiveFixture = action666mFixtureCases[1];
export const action666mFalseNegativeFixture = action666mFixtureCases[2];
export const action666mCorrectRejectionFixture = action666mFixtureCases[3];
export const action666mExplicitNoTradeFixture = action666mFixtureCases[4];
export const action666mCostReversalFixture = action666mFixtureCases[5];
export const action666mAssociationFixture = action666mFixtureCases[6];
export const action666mOverconfidenceFixture = action666mFixtureCases[7];

export const action666mReorderedPayload = structuredClone(
  action666mSuccessfulTradePayload,
);
action666mReorderedPayload.model_result.feature_ablation.reverse();
action666mReorderedPayload.model_result.candidate_model_artifact_payload
  .features.reverse();
action666mReorderedPayload.model_result.candidate_model_artifact_payload
  .feature_order.reverse();
action666mReorderedPayload.model_result.threshold_policy
  .allowed_threshold_variants.reverse();
action666mReorderedPayload.research_hypotheses.reverse();

export function cloneTrustedPost(
  post: CanonicalPredictiveTrustedInputPost,
) {
  return structuredClone(post);
}
