import "server-only";

import { createHash } from "node:crypto";

import {
  verifyCanonicalCounterfactualOpportunitySet,
  type CanonicalCandidateOutcome,
  type CanonicalCounterfactualOpportunitySetContract,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  buildCanonicalShadowVersionTuple,
  type CanonicalShadowAlgorithmVersions,
  type CanonicalShadowVersionTuple,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import type {
  CanonicalLearningFeatureAblation,
  CanonicalLearningPrediction,
} from "@/lib/server/canonical-offline-learning-engine";

export const CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION =
  "canonical_predictive_outcome_explanation_v1" as const;
export const CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION =
  "canonical_predictive_failure_taxonomy_v1" as const;
export const CANONICAL_PREDICTIVE_SENSITIVITY_VERSION =
  "canonical_predictive_sensitivity_v1" as const;
export const CANONICAL_PREDICTIVE_PRIMARY_CLASSIFICATION_POLICY_VERSION =
  "canonical_predictive_primary_classification_policy_v1" as const;
export const CANONICAL_EXPLANATION_TRUSTED_INPUT_REGISTRY_VERSION =
  "canonical_explanation_trusted_input_registry_v1" as const;
export const CANONICAL_EXPLANATION_TRUSTED_INPUT_POST_VERSION =
  "canonical_explanation_trusted_input_post_v1" as const;
export const CANONICAL_EXPLANATION_MODEL_RESULT_POST_VERSION =
  "canonical_explanation_model_result_post_v1" as const;
export const CANONICAL_EXPLANATION_OUTCOME_EVIDENCE_VERSION =
  "canonical_explanation_outcome_evidence_v1" as const;
export const CANONICAL_EXPLANATION_COST_CAPTURE_VERSION =
  "canonical_explanation_cost_capture_v1" as const;
export const CANONICAL_EXPLANATION_CALIBRATION_EVIDENCE_VERSION =
  "canonical_explanation_calibration_evidence_v1" as const;
export const CANONICAL_EXPLANATION_THRESHOLD_POLICY_VERSION =
  "canonical_explanation_threshold_policy_v1" as const;
export const CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION =
  "canonical_predictive_research_hypothesis_v1" as const;

export const CANONICAL_PREDICTIVE_PRIMARY_TAXONOMY = [
  "correct_positive_trade",
  "correct_rejection_or_no_trade",
  "false_positive",
  "false_negative",
  "correct_positive_override",
  "correct_rejection_override",
  "false_positive_override",
  "false_negative_override",
] as const;

export const CANONICAL_PREDICTIVE_SECONDARY_TAXONOMY = [
  "stop_before_target",
  "target_before_stop",
  "edge_consumed_by_cost_or_slippage",
  "insufficient_reward_risk",
  "regime_associated_mismatch",
  "sector_associated_mismatch",
  "volatility_liquidity_associated_mismatch",
  "entry_timing_sensitivity",
  "exit_horizon_sensitivity",
  "calibration_overconfidence",
  "calibration_underconfidence",
  "opportunity_cost_miss",
] as const;

export const CANONICAL_PREDICTIVE_OUTCOME_TAXONOMY = [
  ...CANONICAL_PREDICTIVE_PRIMARY_TAXONOMY,
  ...CANONICAL_PREDICTIVE_SECONDARY_TAXONOMY,
  "insufficient_evidence",
  "conflicting_evidence",
  "non_reproducible",
  "not_point_in_time_safe",
] as const;

export type CanonicalPredictivePrimaryClassification =
  (typeof CANONICAL_PREDICTIVE_PRIMARY_TAXONOMY)[number];
export type CanonicalPredictiveSecondaryDiagnostic =
  (typeof CANONICAL_PREDICTIVE_SECONDARY_TAXONOMY)[number];
export type CanonicalPredictiveOutcomeTaxonomyCode =
  (typeof CANONICAL_PREDICTIVE_OUTCOME_TAXONOMY)[number];
export type CanonicalPredictiveExplanationStatus =
  | "explainable"
  | "partially_explainable"
  | "insufficient_evidence"
  | "conflicting"
  | "non_reproducible"
  | "not_point_in_time_safe";
export type CanonicalPredictiveEvidenceKind =
  | "observed_fact"
  | "canonical_derived_fact"
  | "predictive_attribution"
  | "counterfactual_sensitivity"
  | "research_hypothesis";
export type CanonicalPredictiveDecisionDisposition =
  | "published_trade"
  | "rejected_candidate"
  | "explicit_no_trade";

export type CanonicalPredictiveModelBinding = {
  candidate_model_identity: string;
  model_artifact_digest: string;
  versions: CanonicalShadowAlgorithmVersions;
  version_tuple: CanonicalShadowVersionTuple;
};

export type CanonicalPredictiveContextEvidence = {
  regime: string;
  sector: string;
  volatility_state: string;
  liquidity_state: string;
  observed_at: string;
  capture_evidence_identity: string;
  capture_evidence_digest: string;
  regime_associated_mismatch: boolean;
  sector_associated_mismatch: boolean;
  volatility_liquidity_associated_mismatch: boolean;
};

export type CanonicalPredictiveOutcomePathPoint = {
  horizon: "15m" | "30m" | "60m";
  terminal_outcome: CanonicalCandidateOutcome["terminal_outcome"];
  gross_r: number | null;
  net_r: number | null;
  completed: boolean;
  diagnostic_only: boolean;
  event_timestamp: string;
  interval_identity: string;
  evaluator_input_identity: string;
  provider_snapshot_identity: string;
  observation_cutoff: string;
  canonical_completion_timestamp: string;
  horizon_completion_timestamp: string;
  point_in_time_eligible: boolean;
  evidence_digest: string;
};

export type CanonicalPredictiveOutcomeEvidence = {
  evidence_version: typeof CANONICAL_EXPLANATION_OUTCOME_EVIDENCE_VERSION;
  evaluator_input_identity: string;
  provider_snapshot_identity: string;
  observation_cutoff: string;
  canonical_completion_timestamp: string;
  outcome_evaluated_at: string;
  evaluator_version: string;
  provider_contract_version: string;
  realized_outcome_digest: string;
  path_inventory_digest: string;
  evidence_digest: string;
};

export type CanonicalPredictiveCostEvidence = {
  capture_version: typeof CANONICAL_EXPLANATION_COST_CAPTURE_VERSION;
  capture_identity: string;
  evaluator_input_identity: string;
  provider_snapshot_identity: string;
  observed_at: string;
  unit: "canonical_r";
  gross_r: number;
  transaction_cost_r: number;
  slippage_r: number;
  net_r: number;
  minimum_reward_risk: number;
  realized_reward_risk: number;
  evidence_digest: string;
};

export type CanonicalPredictiveCalibrationBucket = {
  evidence_version:
    typeof CANONICAL_EXPLANATION_CALIBRATION_EVIDENCE_VERSION;
  bucket_identity: string;
  cohort: string;
  period_start: string;
  period_end: string;
  calibration_policy_version: string;
  denominator_identity: string;
  denominator_count: number;
  trusted_metrics_result_digest: string;
  lower_inclusive: number;
  upper_inclusive: number;
  count: number;
  mean_probability: number;
  observed_positive_rate: number;
  evidence_digest: string;
};

export type CanonicalPredictiveThresholdPolicy = {
  policy_version: typeof CANONICAL_EXPLANATION_THRESHOLD_POLICY_VERSION;
  policy_identity: string;
  canonical_threshold: number;
  allowed_threshold_variants: number[];
  semantic_digest: string;
};

export type CanonicalPredictiveModelFeatureEvidence = {
  feature_id: string;
  current_value: number;
  minimum_value: number;
  maximum_value: number;
  training_mean: number;
  training_scale: number;
  standardized_value: number;
  standardized_coefficient: number;
  log_odds_contribution: number;
};

export type CanonicalPredictiveCorrelationDiagnostic = {
  first_feature_id: string;
  second_feature_id: string;
  correlation: number;
  absolute_threshold: number;
  reason_code: "strong_training_window_feature_correlation";
};

export type CanonicalPredictiveResearchHypothesis = {
  hypothesis_version:
    typeof CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION;
  hypothesis_identity: string;
  statement: string;
  semantic_digest: string;
};

export type CanonicalPredictiveModelResultPost = {
  post_version: typeof CANONICAL_EXPLANATION_MODEL_RESULT_POST_VERSION;
  result_identity: string;
  offline_learning_result_digest: string;
  baseline_model: CanonicalPredictiveModelBinding;
  candidate_model: CanonicalPredictiveModelBinding;
  candidate_model_artifact_payload: {
    candidate_model_identity: string;
    training_input_manifest_digest: string;
    training_input_registry_root_digest: string;
    feature_context_registry_root_digest: string;
    split_identity: string;
    feature_order: string[];
    intercept: number;
    features: CanonicalPredictiveModelFeatureEvidence[];
  };
  candidate_model_artifact_digest: string;
  oos_prediction: CanonicalLearningPrediction;
  feature_ablation: CanonicalLearningFeatureAblation[];
  calibration_evidence: CanonicalPredictiveCalibrationBucket;
  correlation_diagnostics: CanonicalPredictiveCorrelationDiagnostic[];
  threshold_policy: CanonicalPredictiveThresholdPolicy;
  shadow_pair_digest: string;
  shadow_evaluation_digest: string;
  semantic_digest: string;
};

export type CanonicalPredictiveTrustedInputPayload = {
  evidence_class: "synthetic_fixture_only";
  canonical_decision_identity: string;
  explained_candidate_identity: string;
  decision_disposition: CanonicalPredictiveDecisionDisposition;
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  feature_context_registry_root_digest: string;
  training_input_manifest_identity: string;
  training_input_manifest_digest: string;
  training_input_registry_root_digest: string;
  context_evidence: CanonicalPredictiveContextEvidence;
  model_result: CanonicalPredictiveModelResultPost;
  realized_outcome: CanonicalCandidateOutcome;
  outcome_path: CanonicalPredictiveOutcomePathPoint[];
  outcome_evidence: CanonicalPredictiveOutcomeEvidence;
  cost_evidence: CanonicalPredictiveCostEvidence;
  entry_timing_sensitive: boolean;
  research_hypotheses: CanonicalPredictiveResearchHypothesis[];
};

export type CanonicalPredictiveTrustedInputPost = {
  post_version: typeof CANONICAL_EXPLANATION_TRUSTED_INPUT_POST_VERSION;
  trusted_input_identity: string;
  payload: CanonicalPredictiveTrustedInputPayload;
  semantic_digest: string;
};

export type CanonicalPredictiveTrustedInputRegistry = {
  registry_version:
    typeof CANONICAL_EXPLANATION_TRUSTED_INPUT_REGISTRY_VERSION;
  posts: CanonicalPredictiveTrustedInputPost[];
  root_digest: string;
};

export type CanonicalPredictiveExplanationTrustBoundary = {
  trust_source: "version_controlled_synthetic_explanation_registry";
  registry: CanonicalPredictiveTrustedInputRegistry;
  expected_registry_root_digest: string;
};

export type CanonicalPredictiveOutcomeExplanationRequest = {
  evidence_class: "synthetic_fixture_only";
  trusted_input_identity: string;
  trusted_input_digest: string;
};

export type CanonicalPredictiveEvidenceItem = {
  evidence_kind: CanonicalPredictiveEvidenceKind;
  evidence_code: string;
  statement: string;
  evidence_digest: string;
};

export type CanonicalPredictiveSensitivityResult = {
  sensitivity_version: typeof CANONICAL_PREDICTIVE_SENSITIVITY_VERSION;
  threshold_policy_identity: string;
  threshold_policy_digest: string;
  threshold_crossing: Array<{
    feature_id: string;
    status: "crossable" | "not_crossable" | "not_applicable";
    current_value: number;
    threshold_crossing_value: number | null;
    minimum_change: number | null;
    direction: "increase" | "decrease" | null;
  }>;
  threshold_variants: Array<{
    threshold: number;
    predicted_positive: boolean;
    differs_from_canonical_decision: boolean;
  }>;
  cost_adjustment: {
    gross_positive: boolean;
    net_positive: boolean;
    cost_changed_sign: boolean;
  };
  neighboring_horizons: {
    completed_horizons: string[];
    terminal_outcomes_stable: boolean | null;
  };
  causal_claimed: false;
  semantic_digest: string;
};

export type CanonicalPredictiveOutcomeExplanation = {
  contract_version:
    typeof CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION;
  taxonomy_version: typeof CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION;
  primary_classification_policy_version:
    typeof CANONICAL_PREDICTIVE_PRIMARY_CLASSIFICATION_POLICY_VERSION;
  explanation_identity: string;
  status: "explainable";
  trusted_input_identity: string;
  trusted_input_digest: string;
  trusted_registry_root_digest: string;
  canonical_decision_identity: string;
  explained_candidate_identity: string;
  opportunity_set_identity: string;
  opportunity_set_digest: string;
  decision_disposition: CanonicalPredictiveDecisionDisposition;
  baseline_model: CanonicalPredictiveModelBinding;
  candidate_model: CanonicalPredictiveModelBinding;
  prediction_identity: string;
  prediction_digest: string;
  prediction_probability: number;
  realized_outcome: CanonicalCandidateOutcome;
  outcome_path: CanonicalPredictiveOutcomePathPoint[];
  outcome_evidence: CanonicalPredictiveOutcomeEvidence;
  cost_evidence: CanonicalPredictiveCostEvidence;
  context_evidence: CanonicalPredictiveContextEvidence;
  calibration_bucket: CanonicalPredictiveCalibrationBucket;
  primary_classification: CanonicalPredictivePrimaryClassification;
  secondary_diagnostics: CanonicalPredictiveSecondaryDiagnostic[];
  taxonomy_codes: CanonicalPredictiveOutcomeTaxonomyCode[];
  correlation_warnings: CanonicalPredictiveCorrelationDiagnostic[];
  evidence: CanonicalPredictiveEvidenceItem[];
  sensitivity: CanonicalPredictiveSensitivityResult;
  reason_codes: string[];
  explanation_digest_algorithm: "sha256_canonical_json_v1";
  canonical_explanation_digest: string;
  shadow_only: true;
  live_ranking_effect: false;
  automatic_promotion_allowed: false;
  automatic_parameter_change_allowed: false;
  automatic_threshold_change_allowed: false;
  automatic_model_change_allowed: false;
  external_ai_canonical_truth_authority: false;
  research_hypotheses_affect_ranking: false;
  causal_claimed: false;
  synthetic_evidence: true;
  not_publishable: true;
};

export type CanonicalPredictiveOutcomeExplanationResult = {
  status: CanonicalPredictiveExplanationStatus;
  explanation: CanonicalPredictiveOutcomeExplanation | null;
  reason_codes: string[];
  shadow_only: true;
  live_ranking_effect: false;
  automatic_promotion_allowed: false;
  automatic_parameter_change_allowed: false;
  automatic_threshold_change_allowed: false;
  automatic_model_change_allowed: false;
  external_ai_canonical_truth_authority: false;
  research_hypotheses_affect_ranking: false;
  causal_claimed: false;
  synthetic_evidence: true;
  not_publishable: true;
};

export type CanonicalPredictiveExplanationExecutionCounters = {
  request_reads: number;
  clones: number;
  trust_lookups: number;
  registry_lookups: number;
  digest_computations: number;
  classifications: number;
  sensitivity_runs: number;
  outputs_built: number;
};

const safety = {
  shadow_only: true,
  live_ranking_effect: false,
  automatic_promotion_allowed: false,
  automatic_parameter_change_allowed: false,
  automatic_threshold_change_allowed: false,
  automatic_model_change_allowed: false,
  external_ai_canonical_truth_authority: false,
  research_hypotheses_affect_ranking: false,
  causal_claimed: false,
  synthetic_evidence: true,
  not_publishable: true,
} as const;

const shaPattern = /^[0-9a-f]{64}$/;
const tolerance = 1e-9;
const primarySet = new Set<string>(CANONICAL_PREDICTIVE_PRIMARY_TAXONOMY);
const secondarySet = new Set<string>(CANONICAL_PREDICTIVE_SECONDARY_TAXONOMY);

type RuntimeShape =
  | { kind: "string"; allowed?: readonly string[] }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "literal"; value: string | boolean }
  | { kind: "array"; item: RuntimeShape }
  | { kind: "record"; value: RuntimeShape }
  | { kind: "nullable"; value: RuntimeShape }
  | { kind: "optional"; value: RuntimeShape }
  | { kind: "object"; fields: Record<string, RuntimeShape> };

const runtimeString = (allowed?: readonly string[]): RuntimeShape => ({
  kind: "string",
  allowed,
});
const runtimeNumber: RuntimeShape = { kind: "number" };
const runtimeBoolean: RuntimeShape = { kind: "boolean" };
const runtimeLiteral = (value: string | boolean): RuntimeShape => ({
  kind: "literal",
  value,
});
const runtimeArray = (item: RuntimeShape): RuntimeShape => ({
  kind: "array",
  item,
});
const runtimeRecord = (value: RuntimeShape): RuntimeShape => ({
  kind: "record",
  value,
});
const runtimeNullable = (value: RuntimeShape): RuntimeShape => ({
  kind: "nullable",
  value,
});
const runtimeOptional = (value: RuntimeShape): RuntimeShape => ({
  kind: "optional",
  value,
});
const runtimeObject = (
  fields: Record<string, RuntimeShape>,
): RuntimeShape => ({ kind: "object", fields });

function isRuntimeRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function matchesRuntimeShape(value: unknown, shape: RuntimeShape): boolean {
  if (shape.kind === "string") {
    return (
      typeof value === "string" &&
      (!shape.allowed || shape.allowed.includes(value))
    );
  }
  if (shape.kind === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (shape.kind === "boolean") return typeof value === "boolean";
  if (shape.kind === "literal") return value === shape.value;
  if (shape.kind === "nullable") {
    return value === null || matchesRuntimeShape(value, shape.value);
  }
  if (shape.kind === "optional") {
    return value === undefined || matchesRuntimeShape(value, shape.value);
  }
  if (shape.kind === "array") {
    return Array.isArray(value) &&
      value.every((item) => matchesRuntimeShape(item, shape.item));
  }
  if (shape.kind === "record") {
    return (
      isRuntimeRecord(value) &&
      Object.values(value).every((item) =>
        matchesRuntimeShape(item, shape.value),
      )
    );
  }
  if (!isRuntimeRecord(value)) return false;
  const expectedKeys = Object.keys(shape.fields).sort();
  const requiredKeys = expectedKeys.filter(
    (key) => shape.fields[key].kind !== "optional",
  );
  const actualKeys = Object.keys(value).sort();
  if (
    actualKeys.some((key) => !(key in shape.fields)) ||
    requiredKeys.some((key) => !(key in value))
  ) {
    return false;
  }
  return actualKeys.every((key) =>
    matchesRuntimeShape(
      value[key],
      shape.fields[key].kind === "optional"
        ? shape.fields[key].value
        : shape.fields[key],
    ),
  );
}

const runtimeStringArray = runtimeArray(runtimeString());
const runtimeNullableString = runtimeNullable(runtimeString());
const runtimeNullableNumber = runtimeNullable(runtimeNumber);
const runtimeNullableBoolean = runtimeNullable(runtimeBoolean);

const shadowAlgorithmVersionsShape = runtimeObject({
  engine_version: runtimeString(),
  scoring_version: runtimeString(),
  ranking_version: runtimeString(),
  threshold_policy_version: runtimeString(),
  setup_taxonomy_version: runtimeString(),
  confidence_contract_version: runtimeString(),
  evaluator_version: runtimeString(),
  provider_contract_version: runtimeString(),
});

const shadowVersionTupleShape = runtimeObject({
  tuple_version: runtimeString(),
  engine_version: runtimeString(),
  scoring_version: runtimeString(),
  ranking_version: runtimeString(),
  threshold_policy_version: runtimeString(),
  setup_taxonomy_version: runtimeString(),
  confidence_contract_version: runtimeString(),
  evaluator_version: runtimeString(),
  provider_contract_version: runtimeString(),
  semantic_digest_algorithm: runtimeLiteral("sha256_canonical_json_v1"),
  semantic_digest: runtimeString(),
});

const modelBindingShape = runtimeObject({
  candidate_model_identity: runtimeString(),
  model_artifact_digest: runtimeString(),
  versions: shadowAlgorithmVersionsShape,
  version_tuple: shadowVersionTupleShape,
});

const contextEvidenceShape = runtimeObject({
  regime: runtimeString(),
  sector: runtimeString(),
  volatility_state: runtimeString(),
  liquidity_state: runtimeString(),
  observed_at: runtimeString(),
  capture_evidence_identity: runtimeString(),
  capture_evidence_digest: runtimeString(),
  regime_associated_mismatch: runtimeBoolean,
  sector_associated_mismatch: runtimeBoolean,
  volatility_liquidity_associated_mismatch: runtimeBoolean,
});

const candidateOutcomeShape = runtimeObject({
  outcome_identity: runtimeString(),
  evaluated_at: runtimeString(),
  evaluator_version: runtimeString(),
  provider_contract_version: runtimeString(),
  primary_horizon: runtimeString(["15m", "30m", "60m"]),
  terminal_outcome: runtimeString([
    "target_before_stop",
    "stop_before_target",
    "no_entry",
    "neither",
    "ambiguous_same_candle",
  ]),
  outcome_evaluable: runtimeBoolean,
  reproducible: runtimeBoolean,
  positive_outcome: runtimeNullableBoolean,
  r_result: runtimeNullableNumber,
  coverage_status: runtimeString([
    "complete",
    "provider_gap",
    "stale",
    "incomplete",
  ]),
  reason_codes: runtimeStringArray,
});

const outcomePathPointShape = runtimeObject({
  horizon: runtimeString(["15m", "30m", "60m"]),
  terminal_outcome: runtimeString([
    "target_before_stop",
    "stop_before_target",
    "no_entry",
    "neither",
    "ambiguous_same_candle",
  ]),
  gross_r: runtimeNullableNumber,
  net_r: runtimeNullableNumber,
  completed: runtimeBoolean,
  diagnostic_only: runtimeBoolean,
  event_timestamp: runtimeString(),
  interval_identity: runtimeString(),
  evaluator_input_identity: runtimeString(),
  provider_snapshot_identity: runtimeString(),
  observation_cutoff: runtimeString(),
  canonical_completion_timestamp: runtimeString(),
  horizon_completion_timestamp: runtimeString(),
  point_in_time_eligible: runtimeBoolean,
  evidence_digest: runtimeString(),
});

const outcomeEvidenceShape = runtimeObject({
  evidence_version: runtimeString(),
  evaluator_input_identity: runtimeString(),
  provider_snapshot_identity: runtimeString(),
  observation_cutoff: runtimeString(),
  canonical_completion_timestamp: runtimeString(),
  outcome_evaluated_at: runtimeString(),
  evaluator_version: runtimeString(),
  provider_contract_version: runtimeString(),
  realized_outcome_digest: runtimeString(),
  path_inventory_digest: runtimeString(),
  evidence_digest: runtimeString(),
});

const costEvidenceShape = runtimeObject({
  capture_version: runtimeString(),
  capture_identity: runtimeString(),
  evaluator_input_identity: runtimeString(),
  provider_snapshot_identity: runtimeString(),
  observed_at: runtimeString(),
  unit: runtimeLiteral("canonical_r"),
  gross_r: runtimeNumber,
  transaction_cost_r: runtimeNumber,
  slippage_r: runtimeNumber,
  net_r: runtimeNumber,
  minimum_reward_risk: runtimeNumber,
  realized_reward_risk: runtimeNumber,
  evidence_digest: runtimeString(),
});

const calibrationBucketShape = runtimeObject({
  evidence_version: runtimeString(),
  bucket_identity: runtimeString(),
  cohort: runtimeString(),
  period_start: runtimeString(),
  period_end: runtimeString(),
  calibration_policy_version: runtimeString(),
  denominator_identity: runtimeString(),
  denominator_count: runtimeNumber,
  trusted_metrics_result_digest: runtimeString(),
  lower_inclusive: runtimeNumber,
  upper_inclusive: runtimeNumber,
  count: runtimeNumber,
  mean_probability: runtimeNumber,
  observed_positive_rate: runtimeNumber,
  evidence_digest: runtimeString(),
});

const thresholdPolicyShape = runtimeObject({
  policy_version: runtimeString(),
  policy_identity: runtimeString(),
  canonical_threshold: runtimeNumber,
  allowed_threshold_variants: runtimeArray(runtimeNumber),
  semantic_digest: runtimeString(),
});

const modelFeatureEvidenceShape = runtimeObject({
  feature_id: runtimeString(),
  current_value: runtimeNumber,
  minimum_value: runtimeNumber,
  maximum_value: runtimeNumber,
  training_mean: runtimeNumber,
  training_scale: runtimeNumber,
  standardized_value: runtimeNumber,
  standardized_coefficient: runtimeNumber,
  log_odds_contribution: runtimeNumber,
});

const correlationDiagnosticShape = runtimeObject({
  first_feature_id: runtimeString(),
  second_feature_id: runtimeString(),
  correlation: runtimeNumber,
  absolute_threshold: runtimeNumber,
  reason_code: runtimeLiteral("strong_training_window_feature_correlation"),
});

const researchHypothesisShape = runtimeObject({
  hypothesis_version: runtimeString(),
  hypothesis_identity: runtimeString(),
  statement: runtimeString(),
  semantic_digest: runtimeString(),
});

const predictionAttributionShape = runtimeObject({
  attribution_version: runtimeString(),
  baseline: runtimeNumber,
  by_feature: runtimeRecord(runtimeNumber),
  reconstructed_prediction_scale_value: runtimeNumber,
  attribution_scale: runtimeString(["log_odds", "canonical_r"]),
  attribution_unit: runtimeString([
    "log_odds_target_before_stop",
    "r_target_before_stop_cost_adjusted",
  ]),
  probability_delta: runtimeNullableNumber,
  predictive_association: runtimeLiteral(true),
  causal_effect_claimed: runtimeLiteral(false),
});

const learningPredictionShape = runtimeObject({
  prediction_identity: runtimeString(),
  split_identity: runtimeString(),
  family: runtimeString([
    "regularized_logistic_target_before_stop",
    "regularized_linear_canonical_r",
  ]),
  canonical_decision_identity: runtimeString(),
  opportunity_set_identity: runtimeString(),
  decision_day: runtimeString(),
  ticker: runtimeString(),
  regime: runtimeString(),
  cohort: runtimeString([
    "visible_recommendation_quality",
    "research_only_recommendation_quality",
    "shadow_recommendation_quality",
    "historical_synthetic_recommendation_quality",
    "rejected_candidate_counterfactual",
    "no_trade_counterfactual",
  ]),
  actual: runtimeNumber,
  prediction: runtimeNumber,
  local_prediction_contribution: predictionAttributionShape,
  semantic_digest: runtimeString(),
});

const featureAblationShape = runtimeObject({
  feature: runtimeString(),
  family: runtimeString([
    "regularized_logistic_target_before_stop",
    "regularized_linear_canonical_r",
  ]),
  replacement: runtimeLiteral("training_window_standardized_baseline_zero"),
  original_loss: runtimeNumber,
  ablated_loss: runtimeNumber,
  loss_delta: runtimeNumber,
  predictive_association: runtimeLiteral(true),
  causal_effect_claimed: runtimeLiteral(false),
});

const modelResultShape = runtimeObject({
  post_version: runtimeString(),
  result_identity: runtimeString(),
  offline_learning_result_digest: runtimeString(),
  baseline_model: modelBindingShape,
  candidate_model: modelBindingShape,
  candidate_model_artifact_payload: runtimeObject({
    candidate_model_identity: runtimeString(),
    training_input_manifest_digest: runtimeString(),
    training_input_registry_root_digest: runtimeString(),
    feature_context_registry_root_digest: runtimeString(),
    split_identity: runtimeString(),
    feature_order: runtimeStringArray,
    intercept: runtimeNumber,
    features: runtimeArray(modelFeatureEvidenceShape),
  }),
  candidate_model_artifact_digest: runtimeString(),
  oos_prediction: learningPredictionShape,
  feature_ablation: runtimeArray(featureAblationShape),
  calibration_evidence: calibrationBucketShape,
  correlation_diagnostics: runtimeArray(correlationDiagnosticShape),
  threshold_policy: thresholdPolicyShape,
  shadow_pair_digest: runtimeString(),
  shadow_evaluation_digest: runtimeString(),
  semantic_digest: runtimeString(),
});

const opportunityVersionsShape = runtimeObject({
  engine_version: runtimeString(),
  scoring_version: runtimeString(),
  ranking_version: runtimeString(),
  setup_taxonomy_version: runtimeString(),
  confidence_contract_version: runtimeString(),
  evaluator_version: runtimeString(),
  provider_contract_version: runtimeString(),
  git_commit: runtimeString(),
  build_identity: runtimeString(),
  scanner_version: runtimeString(),
  universe_version: runtimeString(),
  threshold_version: runtimeString(),
  reason_taxonomy_version: runtimeString(),
});

const providerContextShape = runtimeObject({
  provider: runtimeString(),
  source_timestamp: runtimeString(),
  freshness: runtimeString(["fresh", "stale", "gap", "unknown"]),
  coverage_contract_version: runtimeString(),
  coverage_denominator: runtimeLiteral("candidate_provider_observations"),
  coverage_unit: runtimeLiteral("candidate"),
  expected_observation_count: runtimeNumber,
  observed_observation_count: runtimeNumber,
  coverage_reason_codes: runtimeStringArray,
});

const expectedOutcomeLineageShape = runtimeObject({
  lineage_version: runtimeString(),
  lineage_namespace: runtimeString(),
  evaluator_contract_version: runtimeString(),
  evaluator_version: runtimeString(),
  intended_horizon_policy: runtimeLiteral(
    "primary_60m_else_30m_else_15m_v1",
  ),
  scan_identity: runtimeString(),
  decision_identity: runtimeString(),
  candidate_identity: runtimeString(),
  batch_identity: runtimeNullableString,
  recommendation_decision_identity: runtimeNullableString,
  snapshot_identity: runtimeNullableString,
  expected_outcome_lineage_key: runtimeString(),
});

const candidateMembershipShape = runtimeObject({
  candidate_identity: runtimeString(),
  ticker: runtimeString(),
  original_rank: runtimeNullableNumber,
  original_score: runtimeNumber,
  tie_break_key: runtimeNullableString,
  setup: runtimeNullableString,
  context: runtimeObject({
    window: runtimeNullableString,
    regime: runtimeNullableString,
    sector: runtimeNullableString,
    strategy: runtimeNullableString,
  }),
  membership_status: runtimeString([
    "selected",
    "rejected",
    "overflow",
    "under_threshold",
  ]),
  rejection_reason_codes: runtimeStringArray,
  threshold_version: runtimeString(),
  ranking_version: runtimeString(),
  eligibility_at_decision: runtimeString([
    "eligible",
    "ineligible",
    "unknown",
  ]),
  data_gap_codes: runtimeStringArray,
  provider_source_timestamp: runtimeString(),
  lineage: runtimeObject({
    scan_identity: runtimeString(),
    batch_identity: runtimeNullableString,
    recommendation_decision_identity: runtimeNullableString,
    snapshot_identity: runtimeNullableString,
  }),
  expected_outcome_lineage: expectedOutcomeLineageShape,
  outcome: runtimeNullable(candidateOutcomeShape),
  canonical_candidate_identity: runtimeString(),
  canonical_order: runtimeNumber,
});

const decisionLineageNodeShape = runtimeObject({
  node_kind: runtimeString(["recommendation", "rejection", "no_trade"]),
  decision_identity: runtimeString(),
  candidate_identity: runtimeNullableString,
  snapshot_identity: runtimeNullableString,
});

const noTradeSemanticsShape = runtimeObject({
  explicit_decision_recorded: runtimeLiteral(true),
  producer_decision_id: runtimeString(),
  decision_timestamp: runtimeString(),
  decision_reason_code: runtimeString(),
  decision_reason_detail: runtimeNullableString,
  decision_source: runtimeString(),
  ai_no_trade_observed: runtimeBoolean,
  deterministic_fallback_used: runtimeLiteral(false),
});

const candidateTerminalBindingShape = runtimeObject({
  candidate_identity: runtimeString(),
  terminal_disposition: runtimeString([
    "published_recommendation",
    "deterministic_fallback_recommendation",
    "rejected_candidate",
    "overflow_candidate",
    "under_threshold_candidate",
    "explicit_no_trade_candidate",
  ]),
  decision_identity: runtimeString(),
  snapshot_identity: runtimeNullableString,
  expected_outcome_lineage_key: runtimeString(),
  evaluator_contract_version: runtimeString(),
  evaluator_version: runtimeString(),
  intended_horizon_policy: runtimeLiteral(
    "primary_60m_else_30m_else_15m_v1",
  ),
});

const decisionSemanticBindingShape = runtimeObject({
  binding_version: runtimeString(),
  decision_disposition: runtimeString([
    "publish_recommendations",
    "explicit_no_trade",
    "deterministic_fallback",
  ]),
  terminal_dispositions: runtimeArray(candidateTerminalBindingShape),
  decision_lineage_nodes: runtimeArray(decisionLineageNodeShape),
  no_trade_semantics: runtimeNullable(noTradeSemanticsShape),
  no_trade_semantics_digest: runtimeNullableString,
  lineage_graph_digest: runtimeString(),
  version_bundle_digest: runtimeString(),
  candidate_set_digest: runtimeString(),
  semantic_digest_algorithm: runtimeLiteral("sha256_canonical_json_v1"),
  semantic_digest: runtimeString(),
});

const opportunitySetShape = runtimeObject({
  contract_version: runtimeString(),
  opportunity_set_identity: runtimeString(),
  source_namespace: runtimeString(),
  scan_identity: runtimeString(),
  decision_identity: runtimeString(),
  decision_timestamp: runtimeString(),
  point_in_time_cutoff: runtimeString(),
  versions: opportunityVersionsShape,
  full_candidate_set_digest: runtimeString(),
  decision_evidence_digest: runtimeString(),
  decision_semantic_binding: decisionSemanticBindingShape,
  expected_candidate_count: runtimeNumber,
  observed_candidate_count: runtimeNumber,
  provider_context: providerContextShape,
  pre_truncation_capture_evidence_digest: runtimeString(),
  candidates: runtimeArray(candidateMembershipShape),
  readiness: runtimeObject({
    status: runtimeString([
      "evaluable",
      "incomplete_opportunity_set",
      "rank_gap",
      "candidate_outcome_missing",
      "provider_gap",
      "conflicting",
      "non_reproducible",
      "not_point_in_time_safe",
    ]),
    counterfactual_evaluation_eligible: runtimeBoolean,
    reason_codes: runtimeStringArray,
  }),
  semantic_digest_algorithm: runtimeLiteral("sha256_canonical_json_v1"),
  semantic_digest: runtimeString(),
});

const trustedPayloadShape = runtimeObject({
  evidence_class: runtimeLiteral("synthetic_fixture_only"),
  canonical_decision_identity: runtimeString(),
  explained_candidate_identity: runtimeString(),
  decision_disposition: runtimeString([
    "published_trade",
    "rejected_candidate",
    "explicit_no_trade",
  ]),
  opportunity_set: opportunitySetShape,
  feature_context_registry_root_digest: runtimeString(),
  training_input_manifest_identity: runtimeString(),
  training_input_manifest_digest: runtimeString(),
  training_input_registry_root_digest: runtimeString(),
  context_evidence: contextEvidenceShape,
  model_result: modelResultShape,
  realized_outcome: candidateOutcomeShape,
  outcome_path: runtimeArray(outcomePathPointShape),
  outcome_evidence: outcomeEvidenceShape,
  cost_evidence: runtimeOptional(costEvidenceShape),
  entry_timing_sensitive: runtimeBoolean,
  research_hypotheses: runtimeOptional(runtimeArray(researchHypothesisShape)),
});

const trustedPostShape = runtimeObject({
  post_version: runtimeString(),
  trusted_input_identity: runtimeString(),
  payload: trustedPayloadShape,
  semantic_digest: runtimeString(),
});

const trustBoundaryShape = runtimeObject({
  trust_source: runtimeLiteral(
    "version_controlled_synthetic_explanation_registry",
  ),
  registry: runtimeObject({
    registry_version: runtimeString(),
    posts: runtimeArray(trustedPostShape),
    root_digest: runtimeString(),
  }),
  expected_registry_root_digest: runtimeString(),
});

const explanationRequestShape = runtimeObject({
  evidence_class: runtimeLiteral("synthetic_fixture_only"),
  trusted_input_identity: runtimeString(),
  trusted_input_digest: runtimeString(),
});

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

export function canonicalPredictiveOutcomeExplanationDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function researchHypothesisIdentityPayload(input: {
  canonical_decision_identity: string;
  explained_candidate_identity: string;
  opportunity_set_identity: string;
  statement: string;
}) {
  return {
    hypothesis_version: CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION,
    canonical_decision_identity: input.canonical_decision_identity,
    explained_candidate_identity: input.explained_candidate_identity,
    opportunity_set_identity: input.opportunity_set_identity,
    statement: input.statement,
  };
}

export function canonicalPredictiveResearchHypothesisIdentity(input: {
  canonical_decision_identity: string;
  explained_candidate_identity: string;
  opportunity_set_identity: string;
  statement: string;
}) {
  return `canonical-predictive-research-hypothesis:${canonicalPredictiveOutcomeExplanationDigest(
    researchHypothesisIdentityPayload(input),
  )}`;
}

export function createCanonicalPredictiveResearchHypothesis(input: {
  canonical_decision_identity: string;
  explained_candidate_identity: string;
  opportunity_set_identity: string;
  statement: string;
}) {
  const payload = {
    hypothesis_version: CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION,
    hypothesis_identity:
      canonicalPredictiveResearchHypothesisIdentity(input),
    statement: input.statement,
  };
  return deepFreeze({
    ...payload,
    semantic_digest:
      canonicalPredictiveOutcomeExplanationDigest(payload),
  });
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

function finite(value: number) {
  return Number.isFinite(value);
}

function validTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value === new Date(parsed).toISOString();
}

function exact(first: unknown, second: unknown) {
  return JSON.stringify(canonicalize(first)) === JSON.stringify(canonicalize(second));
}

function unique<T>(values: T[]) {
  return new Set(values).size === values.length;
}

function uniqueSorted<T extends string>(values: T[]) {
  return [...new Set(values)].sort() as T[];
}

function researchHypothesisSortKey(value: unknown) {
  const identity =
    value &&
    typeof value === "object" &&
    typeof (value as { hypothesis_identity?: unknown })
      .hypothesis_identity === "string"
      ? (value as { hypothesis_identity: string }).hypothesis_identity
      : "";
  return `${identity}:${canonicalPredictiveOutcomeExplanationDigest(value)}`;
}

function canonicalResearchHypothesisOrder(
  values: CanonicalPredictiveResearchHypothesis[],
) {
  return [...values].sort((first, second) =>
    researchHypothesisSortKey(first).localeCompare(
      researchHypothesisSortKey(second),
    ),
  );
}

function sigmoid(value: number) {
  if (value >= 0) {
    const factor = Math.exp(-value);
    return 1 / (1 + factor);
  }
  const factor = Math.exp(value);
  return factor / (1 + factor);
}

function logit(probability: number) {
  return Math.log(probability / (1 - probability));
}

function round(value: number) {
  return Number(value.toFixed(12));
}

function payloadWithoutDigest<T extends { semantic_digest: string }>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== "semantic_digest"),
  );
}

function evidenceItem(
  evidenceKind: CanonicalPredictiveEvidenceKind,
  evidenceCode: string,
  statement: string,
  source: unknown,
): CanonicalPredictiveEvidenceItem {
  return {
    evidence_kind: evidenceKind,
    evidence_code: evidenceCode,
    statement,
    evidence_digest: canonicalPredictiveOutcomeExplanationDigest(source),
  };
}

export function canonicalPredictiveLineageDigest(input: {
  opportunitySet: CanonicalCounterfactualOpportunitySetContract;
  candidateIdentity: string;
}) {
  const candidate = input.opportunitySet.candidates.find(
    (item) => item.canonical_candidate_identity === input.candidateIdentity,
  );
  return canonicalPredictiveOutcomeExplanationDigest({
    opportunity_set_identity: input.opportunitySet.opportunity_set_identity,
    opportunity_set_digest: input.opportunitySet.semantic_digest,
    decision_identity: input.opportunitySet.decision_identity,
    decision_semantic_binding:
      input.opportunitySet.decision_semantic_binding.semantic_digest,
    candidate_identity: candidate?.canonical_candidate_identity ?? null,
    candidate_lineage: candidate?.lineage ?? null,
    expected_outcome_lineage: candidate?.expected_outcome_lineage ?? null,
    outcome_identity: candidate?.outcome?.outcome_identity ?? null,
  });
}

export function createCanonicalPredictiveTrustedInputPost(input: {
  trusted_input_identity: string;
  payload: CanonicalPredictiveTrustedInputPayload;
}) {
  const payload = structuredClone(input.payload);
  if (Array.isArray(payload.research_hypotheses)) {
    payload.research_hypotheses = canonicalResearchHypothesisOrder(
      payload.research_hypotheses,
    );
  }
  const postPayload = {
    post_version: CANONICAL_EXPLANATION_TRUSTED_INPUT_POST_VERSION,
    trusted_input_identity: input.trusted_input_identity,
    payload,
  };
  return deepFreeze({
    ...postPayload,
    semantic_digest:
      canonicalPredictiveOutcomeExplanationDigest(postPayload),
  });
}

export function createCanonicalPredictiveTrustedInputRegistry(
  posts: CanonicalPredictiveTrustedInputPost[],
) {
  const sorted = [...posts]
    .map((post) => structuredClone(post))
    .sort((first, second) =>
      first.trusted_input_identity.localeCompare(second.trusted_input_identity),
    );
  const payload = {
    registry_version:
      CANONICAL_EXPLANATION_TRUSTED_INPUT_REGISTRY_VERSION,
    posts: sorted.map((post) => ({
      trusted_input_identity: post.trusted_input_identity,
      semantic_digest: post.semantic_digest,
    })),
  };
  return deepFreeze({
    registry_version:
      CANONICAL_EXPLANATION_TRUSTED_INPUT_REGISTRY_VERSION,
    posts: sorted,
    root_digest: canonicalPredictiveOutcomeExplanationDigest(payload),
  });
}

function failure(
  status: CanonicalPredictiveExplanationStatus,
  reasons: string[],
): CanonicalPredictiveOutcomeExplanationResult {
  return deepFreeze({
    ...safety,
    status,
    explanation: null,
    reason_codes: uniqueSorted(reasons),
  });
}

function statusForReasons(reasons: string[]) {
  if (reasons.some((reason) => reason.includes("point_in_time"))) {
    return "not_point_in_time_safe" as const;
  }
  if (
    reasons.some(
      (reason) =>
        reason.includes("missing") ||
        reason.includes("incomplete") ||
        reason.includes("unknown"),
    )
  ) {
    return "insufficient_evidence" as const;
  }
  if (
    reasons.some(
      (reason) =>
        reason.includes("non_reproducible") ||
        reason.includes("prediction_model_rebuild"),
    )
  ) {
    return "non_reproducible" as const;
  }
  return "conflicting" as const;
}

function validateRegistry(
  boundary: CanonicalPredictiveExplanationTrustBoundary,
) {
  const reasons: string[] = [];
  const registry = boundary.registry;
  const identities = registry.posts.map((post) => post.trusted_input_identity);
  if (
    boundary.trust_source !==
      "version_controlled_synthetic_explanation_registry" ||
    registry.registry_version !==
      CANONICAL_EXPLANATION_TRUSTED_INPUT_REGISTRY_VERSION ||
    !shaPattern.test(boundary.expected_registry_root_digest) ||
    boundary.expected_registry_root_digest !== registry.root_digest ||
    !unique(identities)
  ) {
    reasons.push("trusted_explanation_registry_or_root_conflicting");
  }
  for (const post of registry.posts) {
    const expected = createCanonicalPredictiveTrustedInputPost({
      trusted_input_identity: post.trusted_input_identity,
      payload: post.payload,
    });
    if (
      post.post_version !== CANONICAL_EXPLANATION_TRUSTED_INPUT_POST_VERSION ||
      !exact(post, expected)
    ) {
      reasons.push("trusted_explanation_input_post_conflicting");
    }
  }
  const expectedRegistry = createCanonicalPredictiveTrustedInputRegistry(
    registry.posts,
  );
  if (expectedRegistry.root_digest !== registry.root_digest) {
    reasons.push("trusted_explanation_registry_digest_conflicting");
  }
  return reasons;
}

function validateResearchHypotheses(
  payload: CanonicalPredictiveTrustedInputPayload,
) {
  const reasons: string[] = [];
  const hypotheses = (
    payload as { research_hypotheses?: unknown }
  ).research_hypotheses;
  if (!Array.isArray(hypotheses)) {
    return ["research_hypothesis_malformed"];
  }
  const byIdentity = new Map<string, unknown>();
  for (const value of hypotheses) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      reasons.push("research_hypothesis_malformed");
      continue;
    }
    const hypothesis =
      value as Partial<CanonicalPredictiveResearchHypothesis>;
    if (
      hypothesis.hypothesis_version !==
        CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION ||
      typeof hypothesis.hypothesis_identity !== "string" ||
      !hypothesis.hypothesis_identity.trim() ||
      typeof hypothesis.statement !== "string" ||
      !hypothesis.statement.trim() ||
      hypothesis.statement.trim() !== hypothesis.statement ||
      typeof hypothesis.semantic_digest !== "string" ||
      !shaPattern.test(hypothesis.semantic_digest)
    ) {
      reasons.push("research_hypothesis_malformed");
      continue;
    }
    const expected = createCanonicalPredictiveResearchHypothesis({
      canonical_decision_identity: payload.canonical_decision_identity,
      explained_candidate_identity: payload.explained_candidate_identity,
      opportunity_set_identity:
        payload.opportunity_set.opportunity_set_identity,
      statement: hypothesis.statement,
    });
    if (hypothesis.hypothesis_identity !== expected.hypothesis_identity) {
      reasons.push("research_hypothesis_identity_conflicting");
    }
    if (hypothesis.semantic_digest !== expected.semantic_digest) {
      reasons.push("research_hypothesis_semantic_digest_conflicting");
    }
    const previous = byIdentity.get(hypothesis.hypothesis_identity);
    if (previous) {
      reasons.push(
        exact(previous, hypothesis)
          ? "duplicate_research_hypothesis_identity"
          : "conflicting_research_hypothesis_identity",
      );
    } else {
      byIdentity.set(hypothesis.hypothesis_identity, hypothesis);
    }
  }
  return uniqueSorted(reasons);
}

function predictionPayload(prediction: CanonicalLearningPrediction) {
  return {
    split_identity: prediction.split_identity,
    family: prediction.family,
    canonical_decision_identity: prediction.canonical_decision_identity,
    opportunity_set_identity: prediction.opportunity_set_identity,
    decision_day: prediction.decision_day,
    ticker: prediction.ticker,
    regime: prediction.regime,
    cohort: prediction.cohort,
    actual: prediction.actual,
    prediction: prediction.prediction,
    local_prediction_contribution:
      prediction.local_prediction_contribution,
  };
}

function validateModelResult(
  post: CanonicalPredictiveModelResultPost,
  payload: CanonicalPredictiveTrustedInputPayload,
) {
  const reasons: string[] = [];
  const expectedPostDigest = canonicalPredictiveOutcomeExplanationDigest(
    payloadWithoutDigest(post),
  );
  if (
    post.post_version !== CANONICAL_EXPLANATION_MODEL_RESULT_POST_VERSION ||
    post.semantic_digest !== expectedPostDigest ||
    !post.result_identity.trim() ||
    !shaPattern.test(post.offline_learning_result_digest) ||
    !shaPattern.test(post.shadow_pair_digest) ||
    !shaPattern.test(post.shadow_evaluation_digest)
  ) {
    reasons.push("trusted_model_result_post_conflicting");
  }
  for (const model of [post.baseline_model, post.candidate_model]) {
    if (
      !model.candidate_model_identity.trim() ||
      !shaPattern.test(model.model_artifact_digest) ||
      !exact(model.version_tuple, buildCanonicalShadowVersionTuple(model.versions))
    ) {
      reasons.push("model_version_tuple_conflicting");
    }
  }
  const artifact = post.candidate_model_artifact_payload;
  const features = artifact.features;
  if (
    artifact.candidate_model_identity !==
      post.candidate_model.candidate_model_identity ||
    post.candidate_model_artifact_digest !==
      post.candidate_model.model_artifact_digest ||
    canonicalPredictiveOutcomeExplanationDigest(artifact) !==
      post.candidate_model_artifact_digest ||
    artifact.training_input_manifest_digest !==
      payload.training_input_manifest_digest ||
    artifact.training_input_registry_root_digest !==
      payload.training_input_registry_root_digest ||
    artifact.feature_context_registry_root_digest !==
      payload.feature_context_registry_root_digest ||
    artifact.split_identity !== post.oos_prediction.split_identity ||
    !finite(artifact.intercept) ||
    !unique(artifact.feature_order) ||
    !unique(features.map((feature) => feature.feature_id)) ||
    !exact(
      artifact.feature_order,
      features.map((feature) => feature.feature_id),
    )
  ) {
    reasons.push("candidate_model_artifact_binding_conflicting");
  }
  let reconstructedLogOdds = artifact.intercept;
  const byFeature = post.oos_prediction.local_prediction_contribution.by_feature;
  for (const feature of features) {
    const expectedStandardized =
      (feature.current_value - feature.training_mean) / feature.training_scale;
    const expectedContribution =
      feature.standardized_value * feature.standardized_coefficient;
    if (
      ![
        feature.current_value,
        feature.minimum_value,
        feature.maximum_value,
        feature.training_mean,
        feature.training_scale,
        feature.standardized_value,
        feature.standardized_coefficient,
        feature.log_odds_contribution,
      ].every(finite) ||
      feature.training_scale <= 0 ||
      feature.minimum_value > feature.current_value ||
      feature.maximum_value < feature.current_value ||
      Math.abs(expectedStandardized - feature.standardized_value) > tolerance ||
      Math.abs(expectedContribution - feature.log_odds_contribution) >
        tolerance ||
      Math.abs(
        (byFeature[feature.feature_id] ?? Number.NaN) -
          feature.log_odds_contribution,
      ) > tolerance
    ) {
      reasons.push("prediction_model_feature_rebuild_non_reproducible");
    }
    reconstructedLogOdds += feature.log_odds_contribution;
    if (!finite(reconstructedLogOdds)) {
      reasons.push("prediction_model_numeric_non_reproducible");
    }
  }
  const prediction = post.oos_prediction;
  const expectedPredictionDigest =
    canonicalPredictiveOutcomeExplanationDigest(predictionPayload(prediction));
  if (
    prediction.family !== "regularized_logistic_target_before_stop" ||
    !finite(prediction.prediction) ||
    prediction.prediction <= 0 ||
    prediction.prediction >= 1 ||
    prediction.semantic_digest !== expectedPredictionDigest ||
    prediction.prediction_identity !==
      `canonical-learning-prediction:${expectedPredictionDigest}` ||
    prediction.canonical_decision_identity !==
      payload.canonical_decision_identity ||
    prediction.opportunity_set_identity !==
      payload.opportunity_set.opportunity_set_identity ||
    prediction.local_prediction_contribution.attribution_scale !== "log_odds" ||
    prediction.local_prediction_contribution.attribution_unit !==
      "log_odds_target_before_stop" ||
    prediction.local_prediction_contribution.predictive_association !== true ||
    prediction.local_prediction_contribution.causal_effect_claimed !== false ||
    !finite(
      prediction.local_prediction_contribution
        .reconstructed_prediction_scale_value,
    ) ||
    !finite(
      prediction.local_prediction_contribution.probability_delta ??
        Number.NaN,
    ) ||
    Math.abs(
      prediction.local_prediction_contribution.baseline - artifact.intercept,
    ) > tolerance ||
    !exact(
      Object.keys(prediction.local_prediction_contribution.by_feature).sort(),
      artifact.feature_order.slice().sort(),
    ) ||
    Math.abs(
      prediction.local_prediction_contribution
        .reconstructed_prediction_scale_value - reconstructedLogOdds,
    ) > tolerance ||
    Math.abs(prediction.prediction - sigmoid(reconstructedLogOdds)) >
      tolerance ||
    Math.abs(
      (prediction.local_prediction_contribution.probability_delta ??
        Number.NaN) -
        (prediction.prediction - sigmoid(artifact.intercept)),
    ) > tolerance ||
    prediction.ticker !==
      payload.opportunity_set.candidates.find(
        (item) =>
          item.canonical_candidate_identity ===
          payload.explained_candidate_identity,
      )?.ticker ||
    prediction.regime !== payload.context_evidence.regime ||
    prediction.cohort !== "shadow_recommendation_quality"
  ) {
    reasons.push("prediction_model_rebuild_non_reproducible");
  }
  const expectedPairDigest =
    canonicalPredictiveOutcomeExplanationDigest({
      baseline_model: post.baseline_model,
      candidate_model: post.candidate_model,
      opportunity_set_identity: payload.opportunity_set.opportunity_set_identity,
    });
  const expectedOfflineLearningDigest =
    canonicalPredictiveOutcomeExplanationDigest({
      candidate_model_artifact_digest: post.candidate_model_artifact_digest,
      prediction_digest: prediction.semantic_digest,
      training_input_manifest_digest:
        artifact.training_input_manifest_digest,
      training_input_registry_root_digest:
        artifact.training_input_registry_root_digest,
    });
  const expectedShadowEvaluationDigest =
    canonicalPredictiveOutcomeExplanationDigest({
      shadow_pair_digest: expectedPairDigest,
      offline_learning_result_digest: expectedOfflineLearningDigest,
      prediction_digest: prediction.semantic_digest,
      calibration_evidence_digest:
        post.calibration_evidence.evidence_digest,
    });
  if (
    post.shadow_pair_digest !== expectedPairDigest ||
    post.offline_learning_result_digest !== expectedOfflineLearningDigest ||
    post.shadow_evaluation_digest !== expectedShadowEvaluationDigest
  ) {
    reasons.push("model_shadow_learning_provenance_conflicting");
  }
  const ablationKeys = post.feature_ablation.map(
    (item) => `${item.family}:${item.feature}`,
  );
  if (
    !unique(ablationKeys) ||
    post.feature_ablation.some(
      (item) =>
        item.family !== "regularized_logistic_target_before_stop" ||
        !artifact.feature_order.includes(item.feature) ||
        item.predictive_association !== true ||
        item.causal_effect_claimed !== false ||
        !finite(item.original_loss) ||
        !finite(item.ablated_loss) ||
        !finite(item.loss_delta),
    )
  ) {
    reasons.push("feature_ablation_identity_or_model_binding_conflicting");
  }
  const threshold = post.threshold_policy;
  if (
    threshold.policy_version !==
      CANONICAL_EXPLANATION_THRESHOLD_POLICY_VERSION ||
    threshold.semantic_digest !==
      canonicalPredictiveOutcomeExplanationDigest(
        payloadWithoutDigest(threshold),
      ) ||
    !threshold.policy_identity.trim() ||
    !finite(threshold.canonical_threshold) ||
    threshold.canonical_threshold <= 0 ||
    threshold.canonical_threshold >= 1 ||
    threshold.allowed_threshold_variants.length === 0 ||
    !unique(threshold.allowed_threshold_variants) ||
    threshold.allowed_threshold_variants.some(
      (value) =>
        !finite(value) ||
        value <= 0 ||
        value >= 1 ||
        Number(value.toFixed(12)) !== value,
    )
  ) {
    reasons.push("threshold_policy_conflicting");
  }
  const correlationKeys = post.correlation_diagnostics.map((item) =>
    [item.first_feature_id, item.second_feature_id].sort().join(":"),
  );
  if (
    !unique(correlationKeys) ||
    post.correlation_diagnostics.some(
      (item) =>
        !artifact.feature_order.includes(item.first_feature_id) ||
        !artifact.feature_order.includes(item.second_feature_id) ||
        item.first_feature_id === item.second_feature_id ||
        !finite(item.correlation) ||
        Math.abs(item.correlation) > 1 ||
        !finite(item.absolute_threshold) ||
        item.absolute_threshold <= 0 ||
        item.absolute_threshold > 1 ||
        Math.abs(item.correlation) < item.absolute_threshold ||
        item.reason_code !== "strong_training_window_feature_correlation",
    )
  ) {
    reasons.push("correlation_diagnostics_conflicting");
  }
  return reasons;
}

function pathPayload(point: CanonicalPredictiveOutcomePathPoint) {
  return Object.fromEntries(
    Object.entries(point).filter(([key]) => key !== "evidence_digest"),
  );
}

function validateTemporalEvidence(
  payload: CanonicalPredictiveTrustedInputPayload,
) {
  const reasons: string[] = [];
  const outcome = payload.realized_outcome;
  const evidence = payload.outcome_evidence;
  const paths = payload.outcome_path;
  const candidate = payload.opportunity_set.candidates.find(
    (item) =>
      item.canonical_candidate_identity === payload.explained_candidate_identity,
  );
  if (!candidate?.outcome || !exact(candidate.outcome, outcome)) {
    reasons.push("realized_outcome_lineage_conflicting");
  }
  if (
    evidence.evaluator_input_identity !==
      candidate?.expected_outcome_lineage.expected_outcome_lineage_key ||
    evidence.evaluator_version !==
      candidate?.expected_outcome_lineage.evaluator_version ||
    evidence.provider_contract_version !==
      payload.opportunity_set.versions.provider_contract_version
  ) {
    reasons.push("outcome_expected_lineage_conflicting");
  }
  if (
    !outcome.outcome_evaluable ||
    !outcome.reproducible ||
    outcome.coverage_status !== "complete" ||
    outcome.r_result === null
  ) {
    reasons.push("realized_outcome_incomplete_or_non_reproducible");
  }
  const pathKeys = paths.map((point) => point.horizon);
  if (!unique(pathKeys)) reasons.push("duplicate_outcome_horizon");
  if (!unique(paths.map((point) => point.interval_identity))) {
    reasons.push("duplicate_outcome_interval_identity");
  }
  const horizonMinutes = { "15m": 15, "30m": 30, "60m": 60 } as const;
  for (const point of paths) {
    if (
      point.evidence_digest !==
        canonicalPredictiveOutcomeExplanationDigest(pathPayload(point)) ||
      !point.interval_identity.trim() ||
      point.evaluator_input_identity !== evidence.evaluator_input_identity ||
      point.provider_snapshot_identity !== evidence.provider_snapshot_identity ||
      point.observation_cutoff !== evidence.observation_cutoff ||
      point.canonical_completion_timestamp !==
        evidence.canonical_completion_timestamp ||
      ![
        point.event_timestamp,
        point.observation_cutoff,
        point.canonical_completion_timestamp,
        point.horizon_completion_timestamp,
      ].every(validTimestamp) ||
      point.point_in_time_eligible !== true ||
      Date.parse(point.observation_cutoff) >
        Date.parse(payload.opportunity_set.point_in_time_cutoff) ||
      Date.parse(point.event_timestamp) <
        Date.parse(payload.opportunity_set.decision_timestamp) ||
      Date.parse(point.event_timestamp) >
        Date.parse(point.horizon_completion_timestamp) ||
      Date.parse(point.horizon_completion_timestamp) !==
        Date.parse(payload.opportunity_set.decision_timestamp) +
          horizonMinutes[point.horizon] * 60_000 ||
      Date.parse(point.horizon_completion_timestamp) >
        Date.parse(point.canonical_completion_timestamp)
    ) {
      reasons.push("outcome_path_not_point_in_time_safe");
    }
  }
  const primary = (["60m", "30m", "15m"] as const)
    .map((horizon) =>
      paths.find((point) => point.horizon === horizon && point.completed),
    )
    .find(Boolean);
  if (
    !primary ||
    primary.horizon !== outcome.primary_horizon ||
    primary.terminal_outcome !== outcome.terminal_outcome ||
    primary.diagnostic_only ||
    paths.some(
      (point) =>
        point.horizon !== outcome.primary_horizon && !point.diagnostic_only,
    )
  ) {
    reasons.push("primary_outcome_path_conflicting");
  }
  const expectedPathInventoryDigest =
    canonicalPredictiveOutcomeExplanationDigest(
      [...paths]
        .sort((first, second) => first.horizon.localeCompare(second.horizon))
        .map((point) => point.evidence_digest),
    );
  const outcomePayload = {
    evidence_version: evidence.evidence_version,
    evaluator_input_identity: evidence.evaluator_input_identity,
    provider_snapshot_identity: evidence.provider_snapshot_identity,
    observation_cutoff: evidence.observation_cutoff,
    canonical_completion_timestamp: evidence.canonical_completion_timestamp,
    outcome_evaluated_at: evidence.outcome_evaluated_at,
    evaluator_version: evidence.evaluator_version,
    provider_contract_version: evidence.provider_contract_version,
    realized_outcome_digest: evidence.realized_outcome_digest,
    path_inventory_digest: evidence.path_inventory_digest,
  };
  if (
    evidence.evidence_version !==
      CANONICAL_EXPLANATION_OUTCOME_EVIDENCE_VERSION ||
    evidence.realized_outcome_digest !==
      canonicalPredictiveOutcomeExplanationDigest(outcome) ||
    evidence.path_inventory_digest !== expectedPathInventoryDigest ||
    evidence.evidence_digest !==
      canonicalPredictiveOutcomeExplanationDigest(outcomePayload) ||
    evidence.outcome_evaluated_at !== outcome.evaluated_at ||
    evidence.observation_cutoff !==
      payload.opportunity_set.point_in_time_cutoff ||
    evidence.evaluator_version !== outcome.evaluator_version ||
    evidence.provider_contract_version !== outcome.provider_contract_version ||
    ![
      evidence.observation_cutoff,
      evidence.canonical_completion_timestamp,
      evidence.outcome_evaluated_at,
    ].every(validTimestamp) ||
    !validTimestamp(outcome.evaluated_at) ||
    Date.parse(evidence.observation_cutoff) >
      Date.parse(payload.opportunity_set.point_in_time_cutoff) ||
    Date.parse(evidence.canonical_completion_timestamp) >
      Date.parse(evidence.outcome_evaluated_at)
  ) {
    reasons.push("outcome_evaluator_evidence_conflicting");
  }
  const cost = payload.cost_evidence;
  if (!cost) {
    reasons.push("authoritative_cost_evidence_missing");
    return reasons;
  }
  const costPayload = Object.fromEntries(
    Object.entries(cost).filter(([key]) => key !== "evidence_digest"),
  );
  const primaryGross = primary?.gross_r;
  const primaryNet = primary?.net_r;
  if (
    cost.capture_version !== CANONICAL_EXPLANATION_COST_CAPTURE_VERSION ||
    !cost.capture_identity.trim() ||
    cost.evaluator_input_identity !== evidence.evaluator_input_identity ||
    cost.provider_snapshot_identity !== evidence.provider_snapshot_identity ||
    cost.unit !== "canonical_r" ||
    !validTimestamp(cost.observed_at) ||
    Date.parse(cost.observed_at) >
      Date.parse(evidence.canonical_completion_timestamp) ||
    ![
      cost.gross_r,
      cost.transaction_cost_r,
      cost.slippage_r,
      cost.net_r,
      cost.minimum_reward_risk,
      cost.realized_reward_risk,
    ].every(finite) ||
    cost.transaction_cost_r < 0 ||
    cost.slippage_r < 0 ||
    cost.minimum_reward_risk <= 0 ||
    Math.abs(
      cost.gross_r - cost.transaction_cost_r - cost.slippage_r - cost.net_r,
    ) > tolerance ||
    typeof primaryGross !== "number" ||
    typeof primaryNet !== "number" ||
    Math.abs(primaryGross - cost.gross_r) > tolerance ||
    Math.abs(primaryNet - cost.net_r) > tolerance ||
    cost.evidence_digest !==
      canonicalPredictiveOutcomeExplanationDigest(costPayload)
  ) {
    reasons.push("authoritative_cost_evidence_conflicting");
  }
  return reasons;
}

function validateCalibration(
  bucket: CanonicalPredictiveCalibrationBucket,
  probability: number,
  decisionTimestamp: string,
) {
  const payload = Object.fromEntries(
    Object.entries(bucket).filter(([key]) => key !== "evidence_digest"),
  );
  if (
    bucket.evidence_version !==
      CANONICAL_EXPLANATION_CALIBRATION_EVIDENCE_VERSION ||
    !bucket.bucket_identity.trim() ||
    !bucket.cohort.trim() ||
    !validTimestamp(bucket.period_start) ||
    !validTimestamp(bucket.period_end) ||
    Date.parse(bucket.period_start) > Date.parse(bucket.period_end) ||
    Date.parse(bucket.period_end) > Date.parse(decisionTimestamp) ||
    !bucket.calibration_policy_version.trim() ||
    !bucket.denominator_identity.trim() ||
    bucket.denominator_count <= 0 ||
    !Number.isInteger(bucket.denominator_count) ||
    bucket.count <= 0 ||
    !Number.isInteger(bucket.count) ||
    bucket.count > bucket.denominator_count ||
    !shaPattern.test(bucket.trusted_metrics_result_digest) ||
    ![
      bucket.lower_inclusive,
      bucket.upper_inclusive,
      bucket.mean_probability,
      bucket.observed_positive_rate,
    ].every(finite) ||
    bucket.lower_inclusive < 0 ||
    bucket.upper_inclusive > 1 ||
    bucket.lower_inclusive >= bucket.upper_inclusive ||
    probability < bucket.lower_inclusive ||
    probability > bucket.upper_inclusive ||
    bucket.mean_probability < 0 ||
    bucket.mean_probability > 1 ||
    bucket.observed_positive_rate < 0 ||
    bucket.observed_positive_rate > 1 ||
    bucket.evidence_digest !==
      canonicalPredictiveOutcomeExplanationDigest(payload)
  ) {
    return ["trusted_calibration_evidence_conflicting"];
  }
  return [];
}

function primaryClassification(input: {
  probability: number;
  threshold: number;
  disposition: CanonicalPredictiveDecisionDisposition;
  netR: number;
}) {
  const predictedPositive = input.probability >= input.threshold;
  const acted = input.disposition === "published_trade";
  const netPositive = input.netR > 0;
  const key = `${predictedPositive}:${acted}:${netPositive}`;
  const table: Record<string, CanonicalPredictivePrimaryClassification> = {
    "true:true:true": "correct_positive_trade",
    "true:true:false": "false_positive",
    "true:false:true": "false_negative",
    "true:false:false": "correct_rejection_override",
    "false:true:true": "correct_positive_override",
    "false:true:false": "false_positive_override",
    "false:false:true": "false_negative_override",
    "false:false:false": "correct_rejection_or_no_trade",
  };
  return table[key] ?? null;
}

function sensitivity(input: {
  probability: number;
  model: CanonicalPredictiveModelResultPost;
  cost: CanonicalPredictiveCostEvidence;
  outcomePath: CanonicalPredictiveOutcomePathPoint[];
}) {
  const threshold = input.model.threshold_policy;
  const currentLogOdds = logit(input.probability);
  const thresholdLogOdds = logit(threshold.canonical_threshold);
  const crossings = input.model.candidate_model_artifact_payload.features.map(
    (feature) => {
      const standardizedDelta =
        (thresholdLogOdds - currentLogOdds) /
        feature.standardized_coefficient;
      const crossingValue =
        feature.current_value + standardizedDelta * feature.training_scale;
      const crossable =
        finite(crossingValue) &&
        feature.standardized_coefficient !== 0 &&
        crossingValue >= feature.minimum_value &&
        crossingValue <= feature.maximum_value;
      const change = crossingValue - feature.current_value;
      return {
        feature_id: feature.feature_id,
        status: crossable ? ("crossable" as const) : ("not_crossable" as const),
        current_value: feature.current_value,
        threshold_crossing_value: crossable ? round(crossingValue) : null,
        minimum_change: crossable ? round(Math.abs(change)) : null,
        direction: crossable
          ? change >= 0
            ? ("increase" as const)
            : ("decrease" as const)
          : null,
      };
    },
  );
  const canonicalDecision =
    input.probability >= threshold.canonical_threshold;
  const variants = [...threshold.allowed_threshold_variants]
    .sort((first, second) => first - second)
    .map((value) => ({
      threshold: value,
      predicted_positive: input.probability >= value,
      differs_from_canonical_decision:
        (input.probability >= value) !== canonicalDecision,
    }));
  const completed = input.outcomePath.filter((point) => point.completed);
  const terminalOutcomes = uniqueSorted(
    completed.map((point) => point.terminal_outcome),
  );
  const payload = {
    sensitivity_version: CANONICAL_PREDICTIVE_SENSITIVITY_VERSION,
    threshold_policy_identity: threshold.policy_identity,
    threshold_policy_digest: threshold.semantic_digest,
    threshold_crossing: crossings,
    threshold_variants: variants,
    cost_adjustment: {
      gross_positive: input.cost.gross_r > 0,
      net_positive: input.cost.net_r > 0,
      cost_changed_sign: input.cost.gross_r > 0 && input.cost.net_r <= 0,
    },
    neighboring_horizons: {
      completed_horizons: completed.map((point) => point.horizon).sort(),
      terminal_outcomes_stable:
        completed.length > 1 ? terminalOutcomes.length === 1 : null,
    },
    causal_claimed: false as const,
  };
  return {
    ...payload,
    semantic_digest: canonicalPredictiveOutcomeExplanationDigest(payload),
  };
}

function secondaryDiagnostics(input: {
  payload: CanonicalPredictiveTrustedInputPayload;
  sensitivity: CanonicalPredictiveSensitivityResult;
  primary: CanonicalPredictivePrimaryClassification;
}) {
  const diagnostics: CanonicalPredictiveSecondaryDiagnostic[] = [];
  const outcome = input.payload.realized_outcome;
  const cost = input.payload.cost_evidence;
  const context = input.payload.context_evidence;
  const calibration = input.payload.model_result.calibration_evidence;
  if (outcome.terminal_outcome === "stop_before_target") {
    diagnostics.push("stop_before_target");
  }
  if (outcome.terminal_outcome === "target_before_stop") {
    diagnostics.push("target_before_stop");
  }
  if (cost.gross_r > 0 && cost.net_r <= 0) {
    diagnostics.push("edge_consumed_by_cost_or_slippage");
  }
  if (cost.realized_reward_risk < cost.minimum_reward_risk) {
    diagnostics.push("insufficient_reward_risk");
  }
  if (context.regime_associated_mismatch) {
    diagnostics.push("regime_associated_mismatch");
  }
  if (context.sector_associated_mismatch) {
    diagnostics.push("sector_associated_mismatch");
  }
  if (context.volatility_liquidity_associated_mismatch) {
    diagnostics.push("volatility_liquidity_associated_mismatch");
  }
  if (input.payload.entry_timing_sensitive) {
    diagnostics.push("entry_timing_sensitivity");
  }
  if (input.sensitivity.neighboring_horizons.terminal_outcomes_stable === false) {
    diagnostics.push("exit_horizon_sensitivity");
  }
  const calibrationGap =
    calibration.mean_probability - calibration.observed_positive_rate;
  if (calibrationGap >= 0.1) diagnostics.push("calibration_overconfidence");
  if (calibrationGap <= -0.1) diagnostics.push("calibration_underconfidence");
  if (
    input.primary === "false_negative" ||
    input.primary === "false_negative_override"
  ) {
    diagnostics.push("opportunity_cost_miss");
  }
  if (!unique(diagnostics) || diagnostics.some((item) => !secondarySet.has(item))) {
    return null;
  }
  return diagnostics.sort();
}

function buildFromTrustedPost(input: {
  post: CanonicalPredictiveTrustedInputPost;
  registryRoot: string;
  counters: CanonicalPredictiveExplanationExecutionCounters;
}) {
  const payload = input.post.payload;
  const reasons: string[] = [];
  const opportunity = verifyCanonicalCounterfactualOpportunitySet(
    payload.opportunity_set,
  );
  if (!opportunity.valid) {
    reasons.push("opportunity_set_non_reproducible", ...opportunity.reason_codes);
  }
  const candidate = payload.opportunity_set.candidates.find(
    (item) =>
      item.canonical_candidate_identity === payload.explained_candidate_identity,
  );
  if (!candidate) reasons.push("candidate_opportunity_membership_missing");
  if (
    candidate?.lineage.recommendation_decision_identity !==
      payload.canonical_decision_identity
  ) {
    reasons.push("canonical_decision_lineage_conflicting");
  }
  if (
    payload.decision_disposition === "published_trade" &&
    candidate?.membership_status !== "selected"
  ) {
    reasons.push("published_trade_membership_conflicting");
  }
  if (
    payload.decision_disposition === "rejected_candidate" &&
    candidate?.membership_status === "selected"
  ) {
    reasons.push("rejected_candidate_membership_conflicting");
  }
  if (
    payload.decision_disposition === "explicit_no_trade" &&
    payload.opportunity_set.decision_semantic_binding.decision_disposition !==
      "explicit_no_trade"
  ) {
    reasons.push("explicit_no_trade_semantics_missing");
  }
  if (
    !shaPattern.test(payload.feature_context_registry_root_digest) ||
    !payload.training_input_manifest_identity.trim() ||
    !shaPattern.test(payload.training_input_manifest_digest) ||
    !shaPattern.test(payload.training_input_registry_root_digest) ||
    !payload.context_evidence.capture_evidence_identity.trim() ||
    payload.context_evidence.capture_evidence_digest !==
      canonicalPredictiveOutcomeExplanationDigest({
        capture_evidence_identity:
          payload.context_evidence.capture_evidence_identity,
        regime: payload.context_evidence.regime,
        sector: payload.context_evidence.sector,
        volatility_state: payload.context_evidence.volatility_state,
        liquidity_state: payload.context_evidence.liquidity_state,
        observed_at: payload.context_evidence.observed_at,
      }) ||
    !validTimestamp(payload.context_evidence.observed_at)
  ) {
    reasons.push("trusted_context_capture_conflicting");
  }
  if (
    Date.parse(payload.context_evidence.observed_at) >
      Date.parse(payload.opportunity_set.decision_timestamp) ||
    Date.parse(payload.context_evidence.observed_at) >
      Date.parse(payload.opportunity_set.point_in_time_cutoff)
  ) {
    reasons.push("context_not_point_in_time_safe");
  }
  reasons.push(...validateResearchHypotheses(payload));
  reasons.push(...validateModelResult(payload.model_result, payload));
  reasons.push(...validateTemporalEvidence(payload));
  reasons.push(
    ...validateCalibration(
      payload.model_result.calibration_evidence,
      payload.model_result.oos_prediction.prediction,
      payload.opportunity_set.decision_timestamp,
    ),
  );
  const expectedActual =
    payload.realized_outcome.terminal_outcome === "target_before_stop" ? 1 : 0;
  if (payload.model_result.oos_prediction.actual !== expectedActual) {
    reasons.push("prediction_actual_outcome_conflicting");
  }
  if (reasons.length > 0) {
    return failure(statusForReasons(reasons), reasons);
  }
  input.counters.sensitivity_runs += 1;
  const sensitivityResult = sensitivity({
    probability: payload.model_result.oos_prediction.prediction,
    model: payload.model_result,
    cost: payload.cost_evidence,
    outcomePath: payload.outcome_path,
  });
  input.counters.classifications += 1;
  const primary = primaryClassification({
    probability: payload.model_result.oos_prediction.prediction,
    threshold: payload.model_result.threshold_policy.canonical_threshold,
    disposition: payload.decision_disposition,
    netR: payload.cost_evidence.net_r,
  });
  if (!primary || !primarySet.has(primary)) {
    return failure("conflicting", ["primary_classification_not_exactly_one"]);
  }
  const secondary = secondaryDiagnostics({
    payload,
    sensitivity: sensitivityResult,
    primary,
  });
  if (!secondary) {
    return failure("conflicting", ["secondary_diagnostic_identity_conflicting"]);
  }
  const taxonomyCodes: CanonicalPredictiveOutcomeTaxonomyCode[] = [
    primary,
    ...secondary,
  ];
  if (
    taxonomyCodes.filter((code) => primarySet.has(code)).length !== 1 ||
    !unique(taxonomyCodes)
  ) {
    return failure("conflicting", ["taxonomy_exclusivity_conflicting"]);
  }
  const correlatedFeatures = new Set(
    payload.model_result.correlation_diagnostics.flatMap((item) => [
      item.first_feature_id,
      item.second_feature_id,
    ]),
  );
  const correlationWarning =
    correlatedFeatures.size > 0
      ? ` Strong training-window correlation is present for ${[
          ...correlatedFeatures,
        ].sort().join(", ")}; individual coefficients and one-feature ablations may be unstable even when joint prediction is stable.`
      : "";
  const canonicalResearchHypotheses =
    canonicalResearchHypothesisOrder(payload.research_hypotheses);
  const evidence: CanonicalPredictiveEvidenceItem[] = [
    evidenceItem(
      "observed_fact",
      "realized_terminal_outcome",
      `Observed canonical terminal outcome: ${payload.realized_outcome.terminal_outcome}.`,
      payload.outcome_evidence,
    ),
    evidenceItem(
      "observed_fact",
      "decision_time_context",
      `Observed decision-time regime ${payload.context_evidence.regime} and sector ${payload.context_evidence.sector}.`,
      payload.context_evidence,
    ),
    evidenceItem(
      "canonical_derived_fact",
      "primary_classification",
      `Exactly one primary classification was derived under ${CANONICAL_PREDICTIVE_PRIMARY_CLASSIFICATION_POLICY_VERSION}: ${primary}.`,
      { primary, policy: CANONICAL_PREDICTIVE_PRIMARY_CLASSIFICATION_POLICY_VERSION },
    ),
    evidenceItem(
      "canonical_derived_fact",
      "secondary_diagnostics",
      `Orthogonal secondary diagnostics: ${secondary.join(", ")}.`,
      secondary,
    ),
    evidenceItem(
      "predictive_attribution",
      "local_feature_contributions",
      `Feature contributions are predictive log-odds attribution, not causal effects.${correlationWarning}`,
      payload.model_result.oos_prediction.local_prediction_contribution,
    ),
    evidenceItem(
      "predictive_attribution",
      "feature_ablation",
      `Ablation deltas describe predictive association under the frozen model.${correlationWarning}`,
      payload.model_result.feature_ablation,
    ),
    evidenceItem(
      "counterfactual_sensitivity",
      "bounded_sensitivity",
      "Sensitivity reports bounded model-derived threshold, feature, cost and neighboring-horizon alternatives without identifying a true cause.",
      sensitivityResult,
    ),
    ...canonicalResearchHypotheses
      .map((hypothesis) =>
        evidenceItem(
          "research_hypothesis",
          `non_canonical_research_hypothesis:${hypothesis.hypothesis_identity}`,
          hypothesis.statement,
          hypothesis,
        ),
      ),
  ].sort((first, second) =>
    `${first.evidence_kind}:${first.evidence_code}:${first.evidence_digest}`.localeCompare(
      `${second.evidence_kind}:${second.evidence_code}:${second.evidence_digest}`,
    ),
  );
  const explanationPayload = {
    contract_version: CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION,
    taxonomy_version: CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION,
    primary_classification_policy_version:
      CANONICAL_PREDICTIVE_PRIMARY_CLASSIFICATION_POLICY_VERSION,
    status: "explainable" as const,
    trusted_input_identity: input.post.trusted_input_identity,
    trusted_input_digest: input.post.semantic_digest,
    trusted_registry_root_digest: input.registryRoot,
    canonical_decision_identity: payload.canonical_decision_identity,
    explained_candidate_identity: payload.explained_candidate_identity,
    opportunity_set_identity: payload.opportunity_set.opportunity_set_identity,
    opportunity_set_digest: payload.opportunity_set.semantic_digest,
    decision_disposition: payload.decision_disposition,
    baseline_model: payload.model_result.baseline_model,
    candidate_model: payload.model_result.candidate_model,
    prediction_identity: payload.model_result.oos_prediction.prediction_identity,
    prediction_digest: payload.model_result.oos_prediction.semantic_digest,
    prediction_probability: payload.model_result.oos_prediction.prediction,
    realized_outcome: payload.realized_outcome,
    outcome_path: [...payload.outcome_path].sort((first, second) =>
      first.horizon.localeCompare(second.horizon),
    ),
    outcome_evidence: payload.outcome_evidence,
    cost_evidence: payload.cost_evidence,
    context_evidence: payload.context_evidence,
    calibration_bucket: payload.model_result.calibration_evidence,
    primary_classification: primary,
    secondary_diagnostics: secondary,
    taxonomy_codes: taxonomyCodes,
    correlation_warnings: payload.model_result.correlation_diagnostics,
    evidence,
    sensitivity: sensitivityResult,
    reason_codes: [],
    explanation_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  const digest =
    canonicalPredictiveOutcomeExplanationDigest(explanationPayload);
  input.counters.outputs_built += 1;
  return deepFreeze({
    ...safety,
    status: "explainable" as const,
    explanation: {
      ...explanationPayload,
      explanation_identity:
        `canonical-predictive-outcome-explanation:${digest}`,
      canonical_explanation_digest: digest,
    },
    reason_codes: [],
  });
}

export function createCanonicalPredictiveExplanationEngine(input: {
  enabled?: boolean;
  kill_switch: boolean;
  trust_boundary: CanonicalPredictiveExplanationTrustBoundary;
  counters?: CanonicalPredictiveExplanationExecutionCounters;
}) {
  const counters =
    input.counters ??
    {
      request_reads: 0,
      clones: 0,
      trust_lookups: 0,
      registry_lookups: 0,
      digest_computations: 0,
      classifications: 0,
      sensitivity_runs: 0,
      outputs_built: 0,
    };
  if (input.enabled !== true || input.kill_switch !== false) {
    return deepFreeze({
      enabled: false as const,
      build: null,
      explain: null,
      counters,
    });
  }
  let boundarySnapshot: CanonicalPredictiveExplanationTrustBoundary | null =
    null;
  let registryReasons: string[] = [];
  try {
    const candidate: unknown = structuredClone(input.trust_boundary);
    if (!matchesRuntimeShape(candidate, trustBoundaryShape)) {
      registryReasons = ["trusted_explanation_runtime_shape_conflicting"];
    } else {
      boundarySnapshot = deepFreeze(
        candidate as CanonicalPredictiveExplanationTrustBoundary,
      );
      registryReasons = validateRegistry(boundarySnapshot);
    }
  } catch {
    registryReasons = ["trusted_explanation_runtime_shape_conflicting"];
  }
  const explain = (
    requestValue: CanonicalPredictiveOutcomeExplanationRequest,
  ): CanonicalPredictiveOutcomeExplanationResult => {
    counters.request_reads += 1;
    let request: CanonicalPredictiveOutcomeExplanationRequest;
    try {
      const candidate: unknown = structuredClone(requestValue);
      counters.clones += 1;
      if (!matchesRuntimeShape(candidate, explanationRequestShape)) {
        return failure("conflicting", [
          "trusted_explanation_request_runtime_shape_conflicting",
        ]);
      }
      request = candidate as CanonicalPredictiveOutcomeExplanationRequest;
    } catch {
      return failure("conflicting", [
        "trusted_explanation_request_runtime_shape_conflicting",
      ]);
    }
    counters.trust_lookups += 1;
    if (registryReasons.length > 0 || !boundarySnapshot) {
      return failure("conflicting", registryReasons);
    }
    counters.registry_lookups += 1;
    const post = boundarySnapshot.registry.posts.find(
      (item) => item.trusted_input_identity === request.trusted_input_identity,
    );
    if (
      request.evidence_class !== "synthetic_fixture_only" ||
      !post ||
      request.trusted_input_digest !== post.semantic_digest
    ) {
      return failure("conflicting", [
        post
          ? "trusted_explanation_request_digest_conflicting"
          : "trusted_explanation_input_unknown",
      ]);
    }
    counters.digest_computations += 1;
    try {
      return buildFromTrustedPost({
        post,
        registryRoot: boundarySnapshot.registry.root_digest,
        counters,
      });
    } catch {
      return failure("conflicting", [
        "trusted_explanation_runtime_validation_failed",
      ]);
    }
  };
  return {
    enabled: true as const,
    build: explain,
    explain,
    counters,
  };
}

export function verifyCanonicalPredictiveOutcomeExplanation(input: {
  engine: ReturnType<typeof createCanonicalPredictiveExplanationEngine>;
  request: CanonicalPredictiveOutcomeExplanationRequest;
  explanation_result: CanonicalPredictiveOutcomeExplanationResult;
}) {
  if (!input.engine.explain) {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["canonical_predictive_explanation_engine_disabled"],
    });
  }
  const expected = input.engine.explain(input.request);
  const valid = exact(expected, input.explanation_result);
  return deepFreeze({
    valid,
    canonical_result: valid ? expected : null,
    reason_codes: valid
      ? []
      : ["canonical_predictive_explanation_tampered"],
  });
}
