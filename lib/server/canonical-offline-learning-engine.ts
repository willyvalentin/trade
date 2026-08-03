import "server-only";

import { createHash } from "node:crypto";

import type {
  CanonicalEvaluationCohort,
  CanonicalEvaluationMetricsCandidate,
} from "@/lib/server/canonical-evaluation-quality-read-model";
import {
  CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  CANONICAL_CAPTURE_EVIDENCE_VERSION,
  CANONICAL_TRAINING_INPUT_MANIFEST_VERSION,
  CANONICAL_TRAINING_INPUT_REGISTRY_VERSION,
  CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION,
  canonicalCaptureEvidenceDigest,
  canonicalOfflineLearningTrustDigest,
  recomputeCanonicalFeatureContextRegistryRoot,
  recomputeCanonicalTrainingInputManifestDigest,
  recomputeCanonicalTrainingInputRegistryRoot,
  type CanonicalCapturedContextValue,
  type CanonicalCapturedNumericValue,
  type CanonicalFrozenTrainingInputManifest,
  type CanonicalOfflineLearningTrustBoundary,
  type CanonicalTrainingInputRowBinding,
  type CanonicalTrustedContextDefinition,
  type CanonicalTrustedFeatureDefinition,
} from "@/lib/server/canonical-offline-learning-trust-registry";

export const CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION =
  "canonical_offline_learning_engine_v1" as const;
export const CANONICAL_TRAINING_DATASET_VERSION =
  "canonical_training_dataset_v1" as const;
export const CANONICAL_FEATURE_SCHEMA_VERSION =
  "canonical_point_in_time_feature_schema_v1" as const;
export const CANONICAL_LABEL_POLICY_VERSION =
  "canonical_learning_label_policy_v1" as const;
export const CANONICAL_CHRONOLOGICAL_SPLIT_POLICY_VERSION =
  "canonical_trading_day_walk_forward_v1" as const;
export const CANONICAL_STANDARDIZATION_VERSION =
  "training_window_zscore_population_v1" as const;
export const CANONICAL_TRAINING_IMPLEMENTATION_VERSION =
  "deterministic_gradient_descent_v1" as const;
export const CANONICAL_CANDIDATE_MODEL_ARTIFACT_VERSION =
  "canonical_candidate_model_artifact_v1" as const;
export const CANONICAL_ATTRIBUTION_EVIDENCE_VERSION =
  "canonical_predictive_attribution_v1" as const;
export const CANONICAL_CALIBRATION_EVIDENCE_VERSION =
  "canonical_offline_calibration_evidence_v1" as const;
export const CANONICAL_LEARNING_REPRODUCIBILITY_VERSION =
  "canonical_learning_reproducibility_v1" as const;
export const CANONICAL_LEARNING_SHADOW_BINDING_VERSION =
  "canonical_learning_shadow_binding_v1" as const;
export const CANONICAL_OVERLAP_GRAPH_VERSION =
  "canonical_learning_overlap_graph_v1" as const;
export const CANONICAL_CORRELATION_DIAGNOSTIC_VERSION =
  "canonical_training_window_correlation_diagnostic_v1" as const;
export const DEFAULT_OFF_OFFLINE_LEARNING_ENGINE_ENABLED = false;
export const DEFAULT_OFF_OFFLINE_LEARNING_KILL_SWITCH_ENGAGED = true;

export type CanonicalOfflineLearningStatus =
  | "trainable"
  | "not_trainable"
  | "conflicting"
  | "non_reproducible";

export type CanonicalLearningModelFamily =
  | "regularized_logistic_target_before_stop"
  | "regularized_linear_canonical_r";

export type CanonicalLearningFeatureSchema = {
  feature_schema_version: typeof CANONICAL_FEATURE_SCHEMA_VERSION;
  trusted_registry_version:
    typeof CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION;
  trusted_registry_root_digest: string;
  feature_ids: string[];
};

export type CanonicalLearningLabelPolicy = {
  label_policy_version: typeof CANONICAL_LABEL_POLICY_VERSION;
  binary_outcome: "target_before_stop";
  binary_positive_terminal_outcome: "target_before_stop";
  binary_negative_terminal_outcome: "stop_before_target";
  linear_outcome: "canonical_r_cost_adjusted";
  transaction_cost_r: number;
  ambiguous_and_no_entry_policy: "exclude";
};

export type CanonicalLearningChronologicalSplitPolicy = {
  split_policy_version:
    typeof CANONICAL_CHRONOLOGICAL_SPLIT_POLICY_VERSION;
  initial_training_days: number;
  test_days: number;
  step_days: number;
  purge_policy: "derive_from_canonical_outcome_intervals_v1";
  embargo_policy: "after_latest_outcome_completion_v1";
  embargo_minutes: number;
  outcome_horizon_minutes: 60;
  expanding_training_window: true;
};

export type CanonicalLearningMinimumEvidence = {
  minimum_identities: number;
  minimum_trading_days: number;
  minimum_tickers: number;
  minimum_positive_outcomes: number;
  minimum_negative_outcomes: number;
  minimum_regimes: number;
};

export type CanonicalLearningModelHyperparameters = {
  family: CanonicalLearningModelFamily;
  learning_rate: number;
  l2_regularization: number;
  iterations: number;
  convergence_policy: "fixed_iterations_no_early_stop_v1";
};

export type CanonicalLearningTrainingConfig = {
  training_implementation_version:
    typeof CANONICAL_TRAINING_IMPLEMENTATION_VERSION;
  standardization_version: typeof CANONICAL_STANDARDIZATION_VERSION;
  candidate_model_contract_version: string;
  random_seed: string;
  minimum_evidence: CanonicalLearningMinimumEvidence;
  models: [
    CanonicalLearningModelHyperparameters,
    CanonicalLearningModelHyperparameters,
  ];
};

export type CanonicalOfflineLearningRow = {
  canonical_decision_identity: string;
  opportunity_set_identity: string;
  opportunity_set_digest: string;
  point_in_time_cutoff: string;
  quality_candidate: CanonicalEvaluationMetricsCandidate;
  contexts: {
    regime: CanonicalCapturedContextValue;
    sector: CanonicalCapturedContextValue;
    provider: CanonicalCapturedContextValue;
  };
  overlap_evidence: {
    scan_run_identity: string;
    evaluator_input_identity: string;
    provider_snapshot_identity: string;
    provider_snapshot_timestamp: string;
    outcome_interval_start: string;
    outcome_interval_end: string;
    outcome_completed_at: string;
  };
  features: Record<string, CanonicalCapturedNumericValue>;
};

export type CanonicalLearningShadowEvaluationInputBinding = {
  binding_version: typeof CANONICAL_LEARNING_SHADOW_BINDING_VERSION;
  action_666_evaluation_version:
    typeof CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION;
  evaluator_contract_version: string;
  provider_contract_version: string;
  terminal_outcome_policy: "primary_60m_else_30m_else_15m_v1";
  opportunity_set_inventory: string[];
};

export type CanonicalOfflineLearningRequest = {
  engine_version: typeof CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION;
  evidence_class: "synthetic_fixture_only" | "offline_shadow_only";
  cohort: CanonicalEvaluationCohort;
  sample_type: CanonicalEvaluationMetricsCandidate["sample_type"];
  feature_schema: CanonicalLearningFeatureSchema;
  label_policy: CanonicalLearningLabelPolicy;
  split_policy: CanonicalLearningChronologicalSplitPolicy;
  training_config: CanonicalLearningTrainingConfig;
  shadow_evaluation_binding: CanonicalLearningShadowEvaluationInputBinding;
  trusted_training_input_manifest_identity: string;
  rows: CanonicalOfflineLearningRow[];
};

export type CanonicalTrainingDatasetRow = {
  canonical_decision_identity: string;
  opportunity_set_identity: string;
  opportunity_set_digest: string;
  decision_timestamp: string;
  point_in_time_cutoff: string;
  decision_day: string;
  ticker: string;
  regime: string;
  sector: string;
  cohort: CanonicalEvaluationCohort;
  sample_type: CanonicalEvaluationMetricsCandidate["sample_type"];
  primary_horizon: NonNullable<
    CanonicalEvaluationMetricsCandidate["primary_horizon"]
  >;
  terminal_outcome: "target_before_stop" | "stop_before_target";
  binary_label: 0 | 1;
  canonical_r_label: number;
  features: Record<string, number>;
  feature_evidence_digest: string;
  quality_evidence_digest: string;
  capture_evidence_digest: string;
  scan_run_identity: string;
  evaluator_input_identity: string;
  provider_snapshot_identity: string;
  provider_snapshot_timestamp: string;
  outcome_interval_start: string;
  outcome_interval_end: string;
  outcome_completed_at: string;
  versions: CanonicalEvaluationMetricsCandidate["versions"];
  row_semantic_digest: string;
};

export type CanonicalLearningOverlapGraph = {
  overlap_graph_version: typeof CANONICAL_OVERLAP_GRAPH_VERSION;
  nodes: Array<{
    canonical_decision_identity: string;
    scan_run_identity: string;
    opportunity_set_identity: string;
    evaluator_input_identity: string;
    provider_snapshot_identity: string;
    point_in_time_cutoff: string;
    outcome_interval_start: string;
    outcome_interval_end: string;
    outcome_completed_at: string;
    component_identity: string;
  }>;
  components: Array<{
    component_identity: string;
    member_identities: string[];
  }>;
  semantic_digest: string;
};

export type CanonicalTrainingDataset = {
  dataset_version: typeof CANONICAL_TRAINING_DATASET_VERSION;
  dataset_identity: string;
  cohort: CanonicalEvaluationCohort;
  sample_type: CanonicalEvaluationMetricsCandidate["sample_type"];
  feature_schema_digest: string;
  feature_context_registry_root_digest: string;
  training_input_manifest_identity: string;
  training_input_manifest_digest: string;
  training_input_registry_root_digest: string;
  label_policy_digest: string;
  feature_order: string[];
  identity_count: number;
  trading_days: string[];
  tickers: string[];
  regimes: string[];
  rows: CanonicalTrainingDatasetRow[];
  overlap_graph: CanonicalLearningOverlapGraph;
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalLearningSplit = {
  split_identity: string;
  split_index: number;
  training_days: string[];
  purged_days: string[];
  test_days: string[];
  embargoed_days_after_test: string[];
  embargo_until: string;
  overlap_component_identities: string[];
  purge_derived_from_outcome_intervals: true;
  training_identities: string[];
  test_identities: string[];
  preprocessing_fit_identity_count: number;
  semantic_digest: string;
};

export type CanonicalFeatureStandardization = {
  standardization_version: typeof CANONICAL_STANDARDIZATION_VERSION;
  feature_order: string[];
  means: Record<string, number>;
  scales: Record<string, number>;
  fitted_identity_count: number;
  reason_codes: string[];
  semantic_digest: string;
};

export type CanonicalLearningSplitModelEvidence = {
  split_identity: string;
  family: CanonicalLearningModelFamily;
  training_identity_digest: string;
  training_identity_count: number;
  preprocessing: CanonicalFeatureStandardization;
  intercept: number;
  standardized_coefficients: Record<string, number>;
  semantic_digest: string;
};

export type CanonicalCandidateModelArtifact = {
  artifact_version: typeof CANONICAL_CANDIDATE_MODEL_ARTIFACT_VERSION;
  candidate_model_identity: string;
  family: CanonicalLearningModelFamily;
  candidate_model_contract_version: string;
  training_implementation_version:
    typeof CANONICAL_TRAINING_IMPLEMENTATION_VERSION;
  dataset_identity: string;
  dataset_digest: string;
  feature_context_registry_root_digest: string;
  training_input_manifest_digest: string;
  training_input_registry_root_digest: string;
  feature_schema_digest: string;
  label_policy_digest: string;
  split_policy_digest: string;
  hyperparameters: CanonicalLearningModelHyperparameters;
  random_seed: string;
  feature_order: string[];
  standardization: CanonicalFeatureStandardization;
  intercept: number;
  standardized_coefficients: Record<string, number>;
  artifact_digest_algorithm: "sha256_canonical_json_v1";
  artifact_digest: string;
};

export type CanonicalLearningPrediction = {
  prediction_identity: string;
  split_identity: string;
  family: CanonicalLearningModelFamily;
  canonical_decision_identity: string;
  opportunity_set_identity: string;
  decision_day: string;
  ticker: string;
  regime: string;
  cohort: CanonicalEvaluationCohort;
  actual: number;
  prediction: number;
  local_prediction_contribution: {
    attribution_version: typeof CANONICAL_ATTRIBUTION_EVIDENCE_VERSION;
    baseline: number;
    by_feature: Record<string, number>;
    reconstructed_prediction_scale_value: number;
    attribution_scale: "log_odds" | "canonical_r";
    attribution_unit:
      | "log_odds_target_before_stop"
      | "r_target_before_stop_cost_adjusted";
    probability_delta: number | null;
    predictive_association: true;
    causal_effect_claimed: false;
  };
  semantic_digest: string;
};

export type CanonicalLearningFeatureAblation = {
  feature: string;
  family: CanonicalLearningModelFamily;
  replacement: "training_window_standardized_baseline_zero";
  original_loss: number;
  ablated_loss: number;
  loss_delta: number;
  predictive_association: true;
  causal_effect_claimed: false;
};

export type CanonicalLearningAttributionEvidence = {
  attribution_version: typeof CANONICAL_ATTRIBUTION_EVIDENCE_VERSION;
  family: CanonicalLearningModelFamily;
  standardized_coefficients: Record<string, number>;
  ablations: CanonicalLearningFeatureAblation[];
  interpretation: "predictive_association";
  local_interpretation: "local_prediction_contribution";
  coefficient_scale: "log_odds" | "canonical_r";
  coefficient_unit:
    | "log_odds_target_before_stop"
    | "r_target_before_stop_cost_adjusted";
  reason_codes: string[];
  causal_effect_claimed: false;
  semantic_digest: string;
};

export type CanonicalLearningCorrelationEvidence = {
  diagnostic_version: typeof CANONICAL_CORRELATION_DIAGNOSTIC_VERSION;
  split_identity: string;
  strong_correlation_threshold: number;
  pairs: Array<{
    first_feature: string;
    second_feature: string;
    pearson_correlation: number;
    strongly_correlated: boolean;
    reason_codes: string[];
  }>;
  reason_codes: string[];
  causal_effect_claimed: false;
  semantic_digest: string;
};

export type CanonicalLearningCalibrationEvidence = {
  calibration_version: typeof CANONICAL_CALIBRATION_EVIDENCE_VERSION;
  family: "regularized_logistic_target_before_stop";
  semantics: "probability_target_before_stop";
  out_of_sample_identity_count: number;
  brier_score: number | null;
  buckets: Array<{
    lower_inclusive: number;
    upper_inclusive: number;
    count: number;
    mean_probability: number | null;
    observed_rate: number | null;
  }>;
  not_publishable: true;
  reason_codes: string[];
  semantic_digest: string;
};

export type CanonicalLearningCoverage = {
  input_rows: number;
  eligible_rows: number;
  excluded_rows: number;
  unique_identities: number;
  trading_days: number;
  tickers: number;
  regimes: number;
  positive_outcomes: number;
  negative_outcomes: number;
  out_of_sample_predictions: number;
  by_split: Record<string, number>;
  by_day: Record<string, number>;
  by_ticker: Record<string, number>;
  by_regime: Record<string, number>;
  by_cohort: Record<string, number>;
  reason_codes: string[];
};

export type CanonicalLearningShadowEvaluationBinding = {
  binding_version: typeof CANONICAL_LEARNING_SHADOW_BINDING_VERSION;
  action_666_evaluation_version:
    typeof CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION;
  dataset_identity: string;
  feature_context_registry_root_digest: string;
  training_input_manifest_digest: string;
  training_input_registry_root_digest: string;
  opportunity_set_inventory_digest: string;
  prediction_digest: string;
  candidate_model_identities: string[];
  candidate_model_artifact_digests: string[];
  evaluator_contract_version: string;
  provider_contract_version: string;
  terminal_outcome_policy: "primary_60m_else_30m_else_15m_v1";
  shadow_only: true;
  live_producer_created: false;
  semantic_digest: string;
};

export type CanonicalOfflineLearningResult = {
  engine_version: typeof CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION;
  status: CanonicalOfflineLearningStatus;
  executed: boolean;
  evidence_class:
    | "synthetic_fixture_only"
    | "offline_shadow_only"
    | "not_inspected_default_off";
  synthetic_evidence: true;
  not_publishable: true;
  shadow_only: true;
  live_ranking_effect: false;
  automatic_promotion_allowed: false;
  causal_improvement_claimed: false;
  dataset: CanonicalTrainingDataset | null;
  dataset_digest: string | null;
  split_policy_digest: string | null;
  split_digest: string | null;
  splits: CanonicalLearningSplit[];
  split_model_evidence: CanonicalLearningSplitModelEvidence[];
  correlation_evidence: CanonicalLearningCorrelationEvidence[];
  models: CanonicalCandidateModelArtifact[];
  model_artifact_digest: string | null;
  predictions: CanonicalLearningPrediction[];
  calibration_evidence: CanonicalLearningCalibrationEvidence | null;
  attribution_evidence: CanonicalLearningAttributionEvidence[];
  shadow_evaluation_binding: CanonicalLearningShadowEvaluationBinding | null;
  trust_evidence: {
    feature_context_registry_root_digest: string;
    training_input_manifest_identity: string;
    training_input_manifest_digest: string;
    training_input_registry_root_digest: string;
    trust_source: CanonicalOfflineLearningTrustBoundary["trust_source"];
  } | null;
  execution_counters: {
    request_reads: number;
    clones: number;
    registry_lookups: number;
    dataset_builds: number;
    training_iterations: number;
    predictions: number;
  };
  reproducibility: {
    version: typeof CANONICAL_LEARNING_REPRODUCIBILITY_VERSION;
    deterministic: boolean;
    input_order_independent: boolean;
    input_immutable: boolean;
    semantic_digest: string | null;
  };
  coverage: CanonicalLearningCoverage;
  reason_codes: string[];
  result_digest: string | null;
};

const safety = {
  synthetic_evidence: true,
  not_publishable: true,
  shadow_only: true,
  live_ranking_effect: false,
  automatic_promotion_allowed: false,
  causal_improvement_claimed: false,
} as const;

const forbiddenFeaturePattern =
  /(?:^|_)(?:outcome|label|target_hit|stop_hit|future|post_decision|mfe|mae|realized|evaluated_at)(?:_|$)/i;
const fullShaPattern = /^[0-9a-f]{64}$/;
const maximumAbsoluteCanonicalR = 1_000;

class CanonicalLearningNumericSafetyError extends Error {
  constructor(readonly reasonCode: string) {
    super(reasonCode);
  }
}

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

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function exact(first: unknown, second: unknown) {
  return JSON.stringify(canonicalize(first)) === JSON.stringify(canonicalize(second));
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

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value: number) {
  if (!Number.isFinite(value)) {
    throw new CanonicalLearningNumericSafetyError(
      "numeric_intermediate_non_finite",
    );
  }
  const rounded = Number(value.toFixed(12));
  if (!Number.isFinite(rounded)) {
    throw new CanonicalLearningNumericSafetyError(
      "numeric_rounding_non_finite",
    );
  }
  return Object.is(rounded, -0) ? 0 : rounded;
}

function increment(record: Record<string, number>, key: string) {
  record[key] = (record[key] ?? 0) + 1;
}

function baseCoverage(inputRows: number): CanonicalLearningCoverage {
  return {
    input_rows: inputRows,
    eligible_rows: 0,
    excluded_rows: inputRows,
    unique_identities: 0,
    trading_days: 0,
    tickers: 0,
    regimes: 0,
    positive_outcomes: 0,
    negative_outcomes: 0,
    out_of_sample_predictions: 0,
    by_split: {},
    by_day: {},
    by_ticker: {},
    by_regime: {},
    by_cohort: {},
    reason_codes: [],
  };
}

function nonTrainableResult(
  request: CanonicalOfflineLearningRequest,
  status: Exclude<CanonicalOfflineLearningStatus, "trainable">,
  reasonCodes: string[],
  coverage = baseCoverage(request.rows.length),
  executed = true,
): CanonicalOfflineLearningResult {
  return deepFreeze({
    engine_version: CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION,
    status,
    executed,
    evidence_class: request.evidence_class,
    ...safety,
    dataset: null,
    dataset_digest: null,
    split_policy_digest: null,
    split_digest: null,
    splits: [],
    split_model_evidence: [],
    correlation_evidence: [],
    models: [],
    model_artifact_digest: null,
    predictions: [],
    calibration_evidence: null,
    attribution_evidence: [],
    shadow_evaluation_binding: null,
    trust_evidence: null,
    execution_counters: {
      request_reads: executed ? 1 : 0,
      clones: executed ? 1 : 0,
      registry_lookups: 0,
      dataset_builds: 0,
      training_iterations: 0,
      predictions: 0,
    },
    reproducibility: {
      version: CANONICAL_LEARNING_REPRODUCIBILITY_VERSION,
      deterministic: true,
      input_order_independent: true,
      input_immutable: true,
      semantic_digest: null,
    },
    coverage: {
      ...coverage,
      reason_codes: uniqueSorted(reasonCodes),
    },
    reason_codes: uniqueSorted(reasonCodes),
    result_digest: null,
  });
}

function defaultOffResult(
  reasonCode:
    | "offline_learning_engine_disabled"
    | "offline_learning_kill_switch_engaged",
): CanonicalOfflineLearningResult {
  return deepFreeze({
    engine_version: CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION,
    status: "not_trainable",
    executed: false,
    evidence_class: "not_inspected_default_off",
    ...safety,
    dataset: null,
    dataset_digest: null,
    split_policy_digest: null,
    split_digest: null,
    splits: [],
    split_model_evidence: [],
    correlation_evidence: [],
    models: [],
    model_artifact_digest: null,
    predictions: [],
    calibration_evidence: null,
    attribution_evidence: [],
    shadow_evaluation_binding: null,
    trust_evidence: null,
    execution_counters: {
      request_reads: 0,
      clones: 0,
      registry_lookups: 0,
      dataset_builds: 0,
      training_iterations: 0,
      predictions: 0,
    },
    reproducibility: {
      version: CANONICAL_LEARNING_REPRODUCIBILITY_VERSION,
      deterministic: true,
      input_order_independent: true,
      input_immutable: true,
      semantic_digest: null,
    },
    coverage: {
      ...baseCoverage(0),
      reason_codes: [reasonCode],
    },
    reason_codes: [reasonCode],
    result_digest: null,
  });
}

function validateTopLevel(request: CanonicalOfflineLearningRequest) {
  const reasons: string[] = [];
  if (request.engine_version !== CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION) {
    reasons.push("learning_engine_version_invalid");
  }
  if (
    request.feature_schema.feature_schema_version !==
      CANONICAL_FEATURE_SCHEMA_VERSION ||
    request.feature_schema.trusted_registry_version !==
      CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION ||
    !fullShaPattern.test(
      request.feature_schema.trusted_registry_root_digest,
    ) ||
    request.feature_schema.feature_ids.length === 0 ||
    new Set(request.feature_schema.feature_ids).size !==
      request.feature_schema.feature_ids.length
  ) {
    reasons.push("feature_schema_version_invalid");
  }
  if (
    request.label_policy.label_policy_version !==
      CANONICAL_LABEL_POLICY_VERSION ||
    request.label_policy.binary_outcome !== "target_before_stop" ||
    request.label_policy.binary_positive_terminal_outcome !==
      "target_before_stop" ||
    request.label_policy.binary_negative_terminal_outcome !==
      "stop_before_target" ||
    request.label_policy.linear_outcome !== "canonical_r_cost_adjusted" ||
    request.label_policy.ambiguous_and_no_entry_policy !== "exclude" ||
    !finite(request.label_policy.transaction_cost_r) ||
    request.label_policy.transaction_cost_r < 0
  ) {
    reasons.push("label_policy_invalid");
  }
  const split = request.split_policy;
  if (
    split.split_policy_version !==
      CANONICAL_CHRONOLOGICAL_SPLIT_POLICY_VERSION ||
    !Number.isInteger(split.initial_training_days) ||
    !Number.isInteger(split.test_days) ||
    !Number.isInteger(split.step_days) ||
    !Number.isInteger(split.embargo_minutes) ||
    split.initial_training_days < 2 ||
    split.test_days < 1 ||
    split.step_days < 1 ||
    split.step_days < split.test_days ||
    split.purge_policy !==
      "derive_from_canonical_outcome_intervals_v1" ||
    split.embargo_policy !== "after_latest_outcome_completion_v1" ||
    split.embargo_minutes < 0 ||
    split.embargo_minutes > 7 * 24 * 60 ||
    split.outcome_horizon_minutes !== 60 ||
    split.expanding_training_window !== true
  ) {
    reasons.push("chronological_split_policy_invalid");
  }
  const config = request.training_config;
  if (
    config.training_implementation_version !==
      CANONICAL_TRAINING_IMPLEMENTATION_VERSION ||
    config.standardization_version !== CANONICAL_STANDARDIZATION_VERSION ||
    !config.candidate_model_contract_version.trim() ||
    !config.random_seed.trim()
  ) {
    reasons.push("training_config_version_or_identity_invalid");
  }
  const families = config.models.map((model) => model.family).sort();
  if (
    !exact(families, [
      "regularized_linear_canonical_r",
      "regularized_logistic_target_before_stop",
    ]) ||
    config.models.some(
      (model) =>
        !finite(model.learning_rate) ||
        model.learning_rate <= 0 ||
        model.learning_rate > 1 ||
        !finite(model.l2_regularization) ||
        model.l2_regularization < 0 ||
        !Number.isInteger(model.iterations) ||
        model.iterations < 1 ||
        model.iterations > 10_000 ||
        model.convergence_policy !== "fixed_iterations_no_early_stop_v1",
    )
  ) {
    reasons.push("model_family_or_hyperparameters_invalid");
  }
  const minimums = Object.values(config.minimum_evidence);
  if (
    minimums.some(
      (minimum) => !Number.isInteger(minimum) || minimum < 1,
    )
  ) {
    reasons.push("minimum_evidence_invalid");
  }
  if (
    request.shadow_evaluation_binding.binding_version !==
      CANONICAL_LEARNING_SHADOW_BINDING_VERSION ||
    request.shadow_evaluation_binding.action_666_evaluation_version !==
      CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION ||
    !request.shadow_evaluation_binding.evaluator_contract_version.trim() ||
    !request.shadow_evaluation_binding.provider_contract_version.trim() ||
    request.shadow_evaluation_binding.terminal_outcome_policy !==
      "primary_60m_else_30m_else_15m_v1"
  ) {
    reasons.push("shadow_evaluation_binding_invalid");
  }
  if (!request.trusted_training_input_manifest_identity.trim()) {
    reasons.push("trusted_training_input_manifest_identity_missing");
  }
  return uniqueSorted(reasons);
}

export function buildCanonicalTrainingInputRowBinding(
  row: CanonicalOfflineLearningRow,
): CanonicalTrainingInputRowBinding {
  const featureCaptureDigests = Object.entries(row.features)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([, feature]) => feature.capture_evidence.evidence_digest);
  const contextCaptureDigests = (
    ["provider", "regime", "sector"] as const
  ).map(
    (contextId) =>
      row.contexts[contextId].capture_evidence.evidence_digest,
  );
  const labelPayload = {
    canonical_identity: row.quality_candidate.canonical_identity,
    primary_horizon: row.quality_candidate.primary_horizon,
    terminal_outcome: row.quality_candidate.terminal_outcome,
    target_before_stop: row.quality_candidate.target_before_stop,
    r_result: row.quality_candidate.r_result,
    evaluator_version: row.quality_candidate.versions.evaluator,
    parity_verified: row.quality_candidate.parity_verified,
    reproducible: row.quality_candidate.reproducible,
    eligibility_status: row.quality_candidate.eligibility_status,
    cohort_quality_eligible:
      row.quality_candidate.cohort_quality_eligible,
  };
  const lineagePayload = {
    canonical_decision_identity: row.canonical_decision_identity,
    opportunity_set_identity: row.opportunity_set_identity,
    opportunity_set_digest: row.opportunity_set_digest,
    point_in_time_cutoff: row.point_in_time_cutoff,
    decision_timestamp: row.quality_candidate.decision_timestamp,
    versions: row.quality_candidate.versions,
    overlap_evidence: row.overlap_evidence,
  };
  const rowPayload = {
    canonical_decision_identity: row.canonical_decision_identity,
    opportunity_set_identity: row.opportunity_set_identity,
    opportunity_set_digest: row.opportunity_set_digest,
    point_in_time_cutoff: row.point_in_time_cutoff,
    quality_candidate: {
      canonical_identity: row.quality_candidate.canonical_identity,
      sample_type: row.quality_candidate.sample_type,
      cohort: row.quality_candidate.cohort,
      primary_horizon: row.quality_candidate.primary_horizon,
      terminal_outcome: row.quality_candidate.terminal_outcome,
      r_result: row.quality_candidate.r_result,
      target_before_stop: row.quality_candidate.target_before_stop,
      setup: row.quality_candidate.setup,
      window: row.quality_candidate.window,
      regime: row.quality_candidate.regime,
      sector: row.quality_candidate.sector,
      ticker: row.quality_candidate.ticker,
      decision_timestamp: row.quality_candidate.decision_timestamp,
      decision_day: row.quality_candidate.decision_day,
      versions: row.quality_candidate.versions,
      coverage: row.quality_candidate.coverage,
      parity_verified: row.quality_candidate.parity_verified,
      reproducible: row.quality_candidate.reproducible,
      cohort_quality_eligible:
        row.quality_candidate.cohort_quality_eligible,
      eligibility_status: row.quality_candidate.eligibility_status,
    },
    contexts: row.contexts,
    overlap_evidence: row.overlap_evidence,
    features: Object.fromEntries(
      Object.entries(row.features).sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    ),
  };
  return {
    canonical_decision_identity: row.canonical_decision_identity,
    row_digest: canonicalOfflineLearningTrustDigest(rowPayload),
    feature_capture_digests: featureCaptureDigests,
    context_capture_digests: contextCaptureDigests,
    label_digest: canonicalOfflineLearningTrustDigest(labelPayload),
    lineage_digest: canonicalOfflineLearningTrustDigest(lineagePayload),
  };
}

function verifyTrustBoundary(
  request: CanonicalOfflineLearningRequest,
  trustBoundary: CanonicalOfflineLearningTrustBoundary | undefined,
):
  | {
      status: "trusted";
      manifest: CanonicalFrozenTrainingInputManifest;
      featureDefinitions: Map<string, CanonicalTrustedFeatureDefinition>;
      contextDefinitions: Map<string, CanonicalTrustedContextDefinition>;
    }
  | {
      status: "conflicting";
      reason_codes: string[];
    } {
  if (!trustBoundary) {
    return {
      status: "conflicting",
      reason_codes: ["trusted_learning_boundary_missing"],
    };
  }
  const reasons: string[] = [];
  const featureRegistry = trustBoundary.feature_context_registry;
  const trainingRegistry = trustBoundary.training_input_registry;
  const actualFeatureRoot =
    recomputeCanonicalFeatureContextRegistryRoot(featureRegistry);
  if (
    featureRegistry.registry_version !==
      CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION ||
    actualFeatureRoot !== featureRegistry.root_digest ||
    actualFeatureRoot !==
      trustBoundary.expected_feature_context_registry_root_digest ||
    actualFeatureRoot !==
      request.feature_schema.trusted_registry_root_digest
  ) {
    reasons.push("trusted_feature_context_registry_root_mismatch");
  }
  const actualTrainingRoot =
    recomputeCanonicalTrainingInputRegistryRoot(trainingRegistry);
  if (
    trainingRegistry.registry_version !==
      CANONICAL_TRAINING_INPUT_REGISTRY_VERSION ||
    actualTrainingRoot !== trainingRegistry.root_digest ||
    actualTrainingRoot !==
      trustBoundary.expected_training_input_registry_root_digest
  ) {
    reasons.push("trusted_training_input_registry_root_mismatch");
  }
  const manifest = trainingRegistry.manifests.find(
    (item) =>
      item.manifest_identity ===
      request.trusted_training_input_manifest_identity,
  );
  if (!manifest) {
    reasons.push("trusted_training_input_manifest_unknown");
  } else {
    const actualManifestDigest =
      recomputeCanonicalTrainingInputManifestDigest(manifest);
    if (
      manifest.manifest_version !==
        CANONICAL_TRAINING_INPUT_MANIFEST_VERSION ||
      actualManifestDigest !== manifest.manifest_digest ||
      manifest.manifest_identity !==
        `canonical-training-input-manifest:${actualManifestDigest}` ||
      manifest.feature_context_registry_root_digest !== actualFeatureRoot ||
      manifest.cohort !== request.cohort ||
      manifest.sample_type !== request.sample_type
    ) {
      reasons.push("trusted_training_input_manifest_invalid");
    }
    const actualBindings = request.rows
      .map(buildCanonicalTrainingInputRowBinding)
      .sort((first, second) =>
        first.canonical_decision_identity.localeCompare(
          second.canonical_decision_identity,
        ),
      );
    if (
      manifest.row_count !== actualBindings.length ||
      !exact(manifest.row_bindings, actualBindings)
    ) {
      reasons.push("trusted_training_input_rows_mismatch");
    }
  }
  const featureDefinitions = new Map(
    featureRegistry.feature_definitions.map((definition) => [
      definition.feature_id,
      definition,
    ]),
  );
  if (
    !exact(
      [...featureDefinitions.keys()].sort(),
      [...request.feature_schema.feature_ids].sort(),
    )
  ) {
    reasons.push("trusted_feature_membership_mismatch");
  }
  const contextDefinitions = new Map(
    featureRegistry.context_definitions.map((definition) => [
      definition.context_id,
      definition,
    ]),
  );
  const compatibilityKey = `${request.sample_type}:${request.cohort}`;
  if (
    !featureRegistry.compatibility_policy.some(
      (item) =>
        `${item.sample_type}:${item.cohort}` === compatibilityKey,
    ) ||
    [...featureDefinitions.values()].some(
      (definition) =>
        !definition.allowed_sample_cohort_combinations.some(
          (item) =>
            `${item.sample_type}:${item.cohort}` === compatibilityKey,
        ),
    ) ||
    [...contextDefinitions.values()].some(
      (definition) =>
        !definition.allowed_sample_cohort_combinations.some(
          (item) =>
            `${item.sample_type}:${item.cohort}` === compatibilityKey,
        ),
    )
  ) {
    reasons.push("sample_cohort_compatibility_not_trusted");
  }
  if (reasons.length > 0 || !manifest) {
    return {
      status: "conflicting",
      reason_codes: uniqueSorted(reasons),
    };
  }
  return {
    status: "trusted",
    manifest,
    featureDefinitions,
    contextDefinitions,
  };
}

function captureEvidenceMatches(input: {
  value_kind: "feature" | "context";
  value_id: string;
  value: number | string;
  observed_at: string;
  source_namespace: string;
  capture_evidence: CanonicalCapturedNumericValue["capture_evidence"];
  expected_evidence_type: string;
}) {
  return (
    input.capture_evidence.evidence_version ===
      CANONICAL_CAPTURE_EVIDENCE_VERSION &&
    input.capture_evidence.evidence_type === input.expected_evidence_type &&
    input.capture_evidence.evidence_identity.trim().length > 0 &&
    input.capture_evidence.evidence_digest ===
      canonicalCaptureEvidenceDigest({
        value_kind: input.value_kind,
        value_id: input.value_id,
        value: input.value,
        observed_at: input.observed_at,
        source_namespace: input.source_namespace,
        evidence_identity: input.capture_evidence.evidence_identity,
        evidence_type: input.capture_evidence.evidence_type,
      })
  );
}

function validCanonicalTimestamp(value: string) {
  const milliseconds = Date.parse(value);
  return (
    Number.isFinite(milliseconds) &&
    new Date(milliseconds).toISOString() === value
  );
}

function buildCanonicalOverlapGraph(
  rows: CanonicalTrainingDatasetRow[],
): CanonicalLearningOverlapGraph {
  const ordered = [...rows].sort((first, second) =>
    first.canonical_decision_identity.localeCompare(
      second.canonical_decision_identity,
    ),
  );
  const parents = ordered.map((_, index) => index);
  const find = (index: number): number => {
    let current = index;
    while (parents[current] !== current) {
      parents[current] = parents[parents[current]];
      current = parents[current];
    }
    return current;
  };
  const union = (first: number, second: number) => {
    const firstRoot = find(first);
    const secondRoot = find(second);
    if (firstRoot !== secondRoot) {
      parents[Math.max(firstRoot, secondRoot)] = Math.min(
        firstRoot,
        secondRoot,
      );
    }
  };
  for (let first = 0; first < ordered.length; first += 1) {
    for (let second = first + 1; second < ordered.length; second += 1) {
      const left = ordered[first];
      const right = ordered[second];
      const intervalsOverlap =
        Date.parse(left.outcome_interval_start) <
          Date.parse(right.outcome_interval_end) &&
        Date.parse(right.outcome_interval_start) <
          Date.parse(left.outcome_interval_end);
      if (
        left.scan_run_identity === right.scan_run_identity ||
        left.opportunity_set_identity === right.opportunity_set_identity ||
        left.evaluator_input_identity === right.evaluator_input_identity ||
        left.provider_snapshot_identity === right.provider_snapshot_identity ||
        intervalsOverlap
      ) {
        union(first, second);
      }
    }
  }
  const membersByRoot = new Map<number, string[]>();
  ordered.forEach((row, index) => {
    const root = find(index);
    const members = membersByRoot.get(root) ?? [];
    members.push(row.canonical_decision_identity);
    membersByRoot.set(root, members);
  });
  const componentIdentityByMember = new Map<string, string>();
  const components = [...membersByRoot.values()]
    .map((members) => {
      const memberIdentities = [...members].sort();
      const componentIdentity = `canonical-overlap-component:${digest(
        memberIdentities,
      )}`;
      for (const identity of memberIdentities) {
        componentIdentityByMember.set(identity, componentIdentity);
      }
      return {
        component_identity: componentIdentity,
        member_identities: memberIdentities,
      };
    })
    .sort((first, second) =>
      first.component_identity.localeCompare(second.component_identity),
    );
  const nodes = ordered.map((row) => ({
    canonical_decision_identity: row.canonical_decision_identity,
    scan_run_identity: row.scan_run_identity,
    opportunity_set_identity: row.opportunity_set_identity,
    evaluator_input_identity: row.evaluator_input_identity,
    provider_snapshot_identity: row.provider_snapshot_identity,
    point_in_time_cutoff: row.point_in_time_cutoff,
    outcome_interval_start: row.outcome_interval_start,
    outcome_interval_end: row.outcome_interval_end,
    outcome_completed_at: row.outcome_completed_at,
    component_identity:
      componentIdentityByMember.get(row.canonical_decision_identity) ??
      "missing",
  }));
  const payload = {
    overlap_graph_version: CANONICAL_OVERLAP_GRAPH_VERSION,
    nodes,
    components,
  };
  return {
    ...payload,
    semantic_digest: digest(payload),
  };
}

function buildDataset(
  request: CanonicalOfflineLearningRequest,
  trust: Extract<ReturnType<typeof verifyTrustBoundary>, { status: "trusted" }>,
  trainingInputRegistryRootDigest: string,
):
  | {
      status: "built";
      dataset: CanonicalTrainingDataset;
      coverage: CanonicalLearningCoverage;
      reason_codes: string[];
    }
  | {
      status: "not_trainable" | "conflicting" | "non_reproducible";
      dataset: null;
      coverage: CanonicalLearningCoverage;
      reason_codes: string[];
    } {
  const coverage = baseCoverage(request.rows.length);
  const conflicts: string[] = [];
  const nonReproducible: string[] = [];
  const incompleteLineage: string[] = [];
  const exclusions: string[] = [];
  const featureNames = [...request.feature_schema.feature_ids].sort();
  if (
    featureNames.length === 0 ||
    new Set(featureNames).size !== featureNames.length ||
    featureNames.some(
      (featureName) =>
        !/^[a-z][a-z0-9_]{0,63}$/.test(featureName) ||
        forbiddenFeaturePattern.test(featureName) ||
        !trust.featureDefinitions.has(featureName),
    )
  ) {
    conflicts.push("feature_allowlist_invalid_or_forbidden");
  }
  const identities = request.rows.map(
    (row) => row.canonical_decision_identity,
  );
  if (new Set(identities).size !== identities.length) {
    conflicts.push("duplicate_canonical_decision_identity");
  }
  const qualityIdentities = request.rows.map(
    (row) => row.quality_candidate.canonical_identity,
  );
  if (new Set(qualityIdentities).size !== qualityIdentities.length) {
    conflicts.push("duplicate_quality_candidate_identity");
  }
  const datasetRows: CanonicalTrainingDatasetRow[] = [];
  const opportunitySetBindings = new Map<string, string>();
  for (const row of request.rows) {
    const candidate = row.quality_candidate;
    if (
      row.canonical_decision_identity !== candidate.canonical_identity
    ) {
      conflicts.push("canonical_decision_identity_mismatch");
    }
    if (
      candidate.cohort !== request.cohort ||
      candidate.sample_type !== request.sample_type
    ) {
      conflicts.push("cohort_or_sample_type_mixed");
    }
    if (
      !row.opportunity_set_identity.trim() ||
      !fullShaPattern.test(row.opportunity_set_digest)
    ) {
      conflicts.push("opportunity_set_lineage_invalid");
    } else {
      const previousDigest = opportunitySetBindings.get(
        row.opportunity_set_identity,
      );
      if (previousDigest && previousDigest !== row.opportunity_set_digest) {
        conflicts.push("opportunity_set_identity_digest_conflict");
      }
      opportunitySetBindings.set(
        row.opportunity_set_identity,
        row.opportunity_set_digest,
      );
    }
    const cutoffTimestamp = Date.parse(row.point_in_time_cutoff);
    const decisionTimestamp = Date.parse(candidate.decision_timestamp);
    if (
      !validCanonicalTimestamp(row.point_in_time_cutoff) ||
      !validCanonicalTimestamp(candidate.decision_timestamp) ||
      cutoffTimestamp > decisionTimestamp ||
      candidate.decision_day !== candidate.decision_timestamp.slice(0, 10)
    ) {
      conflicts.push("point_in_time_cutoff_invalid");
    }
    for (const contextId of ["regime", "sector", "provider"] as const) {
      const context = row.contexts[contextId];
      const definition = trust.contextDefinitions.get(contextId);
      if (
        !context ||
        !definition ||
        !context.value.trim() ||
        !definition.allowed_values.includes(context.value) ||
        context.source_namespace !== definition.source_namespace ||
        !validCanonicalTimestamp(context.observed_at) ||
        Date.parse(context.observed_at) > cutoffTimestamp ||
        Date.parse(context.observed_at) > decisionTimestamp ||
        !captureEvidenceMatches({
          value_kind: "context",
          value_id: contextId,
          value: context.value,
          observed_at: context.observed_at,
          source_namespace: context.source_namespace,
          capture_evidence: context.capture_evidence,
          expected_evidence_type: definition.capture_evidence_type,
        })
      ) {
        conflicts.push(`trusted_${contextId}_context_invalid`);
      }
    }
    if (
      row.contexts.regime.value !== candidate.regime ||
      row.contexts.sector.value !== candidate.sector ||
      row.contexts.provider.value !== candidate.versions.provider
    ) {
      conflicts.push("trusted_context_quality_candidate_mismatch");
    }
    const overlap = row.overlap_evidence;
    const intervalStart = Date.parse(overlap.outcome_interval_start);
    const intervalEnd = Date.parse(overlap.outcome_interval_end);
    const outcomeCompletedAt = Date.parse(overlap.outcome_completed_at);
    const providerSnapshotTimestamp = Date.parse(
      overlap.provider_snapshot_timestamp,
    );
    if (
      !overlap.scan_run_identity.trim() ||
      !overlap.evaluator_input_identity.trim() ||
      !overlap.provider_snapshot_identity.trim() ||
      !validCanonicalTimestamp(overlap.provider_snapshot_timestamp) ||
      !validCanonicalTimestamp(overlap.outcome_interval_start) ||
      !validCanonicalTimestamp(overlap.outcome_interval_end) ||
      !validCanonicalTimestamp(overlap.outcome_completed_at) ||
      providerSnapshotTimestamp > cutoffTimestamp ||
      intervalStart < decisionTimestamp ||
      intervalEnd <= intervalStart ||
      intervalEnd - intervalStart >
        request.split_policy.outcome_horizon_minutes * 60_000 ||
      outcomeCompletedAt < intervalEnd
    ) {
      incompleteLineage.push(
        "canonical_overlap_interval_or_completion_missing",
      );
    }
    if (
      Object.values(candidate.versions).some(
        (version) => !version.trim(),
      ) ||
      candidate.versions.provider !==
        request.shadow_evaluation_binding.provider_contract_version
    ) {
      conflicts.push("quality_version_or_provider_binding_invalid");
    }
    if (
      candidate.coverage.status !== "complete" ||
      candidate.coverage.freshness !== "fresh" ||
      !Number.isInteger(candidate.coverage.expected_candle_count) ||
      !Number.isInteger(candidate.coverage.observed_candle_count) ||
      candidate.coverage.expected_candle_count! <= 0 ||
      candidate.coverage.expected_candle_count !==
        candidate.coverage.observed_candle_count
    ) {
      conflicts.push("quality_coverage_not_complete");
    }
    if (
      !candidate.reproducible ||
      candidate.eligibility_status === "non_reproducible"
    ) {
      nonReproducible.push("quality_row_non_reproducible");
      continue;
    }
    if (
      !candidate.cohort_quality_eligible ||
      candidate.eligibility_status !== "eligible" ||
      !candidate.parity_verified
    ) {
      exclusions.push("quality_row_not_eligible");
      continue;
    }
    if (
      candidate.primary_horizon === null ||
      !candidate.ticker ||
      !candidate.regime ||
      !candidate.sector ||
      !candidate.decision_day
    ) {
      exclusions.push("quality_row_training_fields_incomplete");
      continue;
    }
    if (
      candidate.terminal_outcome !== "target_before_stop" &&
      candidate.terminal_outcome !== "stop_before_target"
    ) {
      exclusions.push("label_outcome_excluded_by_policy");
      continue;
    }
    if (!finite(candidate.r_result)) {
      exclusions.push("canonical_r_label_missing");
      continue;
    }
    if (Math.abs(candidate.r_result) > maximumAbsoluteCanonicalR) {
      conflicts.push("canonical_r_label_out_of_bounds");
      continue;
    }
    const observedFeatureNames = Object.keys(row.features).sort();
    if (!exact(observedFeatureNames, featureNames)) {
      conflicts.push("feature_membership_mismatch");
      continue;
    }
    const featureValues: Record<string, number> = {};
    for (const featureName of featureNames) {
      const feature = row.features[featureName];
      const definition = trust.featureDefinitions.get(featureName);
      if (
        !feature ||
        !definition ||
        !finite(feature.value) ||
        feature.value < definition.minimum ||
        feature.value > definition.maximum ||
        feature.source_namespace !== definition.source_namespace ||
        !validCanonicalTimestamp(feature.observed_at) ||
        !captureEvidenceMatches({
          value_kind: "feature",
          value_id: featureName,
          value: feature.value,
          observed_at: feature.observed_at,
          source_namespace: feature.source_namespace,
          capture_evidence: feature.capture_evidence,
          expected_evidence_type: definition.capture_evidence_type,
        })
      ) {
        conflicts.push("trusted_feature_value_or_provenance_invalid");
        continue;
      }
      if (
        Date.parse(feature.observed_at) > decisionTimestamp ||
        Date.parse(feature.observed_at) > cutoffTimestamp
      ) {
        conflicts.push("feature_observed_after_decision_cutoff");
      }
      featureValues[featureName] = round(feature.value);
    }
    const featureEvidenceDigest = digest(
      Object.fromEntries(
        featureNames.map((featureName) => [
          featureName,
          row.features[featureName],
        ]),
      ),
    );
    const qualityEvidenceDigest = digest({
      canonical_identity: candidate.canonical_identity,
      primary_horizon: candidate.primary_horizon,
      terminal_outcome: candidate.terminal_outcome,
      r_result: candidate.r_result,
      target_before_stop: candidate.target_before_stop,
      decision_timestamp: candidate.decision_timestamp,
      decision_day: candidate.decision_day,
      ticker: candidate.ticker,
      regime: candidate.regime,
      sector: candidate.sector,
      cohort: candidate.cohort,
      sample_type: candidate.sample_type,
      versions: candidate.versions,
      coverage: candidate.coverage,
      parity_verified: candidate.parity_verified,
      reproducible: candidate.reproducible,
      eligibility_status: candidate.eligibility_status,
      cohort_quality_eligible: candidate.cohort_quality_eligible,
    });
    const payload = {
      canonical_decision_identity: row.canonical_decision_identity,
      opportunity_set_identity: row.opportunity_set_identity,
      opportunity_set_digest: row.opportunity_set_digest,
      decision_timestamp: candidate.decision_timestamp,
      point_in_time_cutoff: row.point_in_time_cutoff,
      decision_day: candidate.decision_day,
      ticker: candidate.ticker,
      regime: candidate.regime,
      sector: candidate.sector,
      cohort: candidate.cohort,
      sample_type: candidate.sample_type,
      primary_horizon: candidate.primary_horizon,
      terminal_outcome: candidate.terminal_outcome,
      binary_label:
        candidate.terminal_outcome === "target_before_stop"
          ? (1 as const)
          : (0 as const),
      canonical_r_label: round(
        candidate.r_result - request.label_policy.transaction_cost_r,
      ),
      features: featureValues,
      feature_evidence_digest: featureEvidenceDigest,
      quality_evidence_digest: qualityEvidenceDigest,
      capture_evidence_digest: digest({
        features: Object.fromEntries(
          featureNames.map((featureName) => [
            featureName,
            row.features[featureName].capture_evidence.evidence_digest,
          ]),
        ),
        contexts: Object.fromEntries(
          (["provider", "regime", "sector"] as const).map((contextId) => [
            contextId,
            row.contexts[contextId].capture_evidence.evidence_digest,
          ]),
        ),
      }),
      scan_run_identity: overlap.scan_run_identity,
      evaluator_input_identity: overlap.evaluator_input_identity,
      provider_snapshot_identity: overlap.provider_snapshot_identity,
      provider_snapshot_timestamp: overlap.provider_snapshot_timestamp,
      outcome_interval_start: overlap.outcome_interval_start,
      outcome_interval_end: overlap.outcome_interval_end,
      outcome_completed_at: overlap.outcome_completed_at,
      versions: candidate.versions,
    };
    datasetRows.push({
      ...payload,
      row_semantic_digest: digest(payload),
    });
  }
  coverage.excluded_rows = request.rows.length - datasetRows.length;
  coverage.eligible_rows = datasetRows.length;
  coverage.unique_identities = new Set(
    datasetRows.map((row) => row.canonical_decision_identity),
  ).size;
  coverage.trading_days = new Set(datasetRows.map((row) => row.decision_day)).size;
  coverage.tickers = new Set(datasetRows.map((row) => row.ticker)).size;
  coverage.regimes = new Set(datasetRows.map((row) => row.regime)).size;
  coverage.positive_outcomes = datasetRows.filter(
    (row) => row.binary_label === 1,
  ).length;
  coverage.negative_outcomes = datasetRows.filter(
    (row) => row.binary_label === 0,
  ).length;
  if (conflicts.length > 0) {
    return {
      status: "conflicting",
      dataset: null,
      coverage,
      reason_codes: uniqueSorted(conflicts),
    };
  }
  if (nonReproducible.length > 0) {
    return {
      status: "non_reproducible",
      dataset: null,
      coverage,
      reason_codes: uniqueSorted(nonReproducible),
    };
  }
  if (incompleteLineage.length > 0) {
    return {
      status: "not_trainable",
      dataset: null,
      coverage,
      reason_codes: uniqueSorted(incompleteLineage),
    };
  }
  const minimums = request.training_config.minimum_evidence;
  const insufficient = [
    coverage.unique_identities < minimums.minimum_identities
      ? "minimum_identities_not_met"
      : null,
    coverage.trading_days < minimums.minimum_trading_days
      ? "minimum_trading_days_not_met"
      : null,
    coverage.tickers < minimums.minimum_tickers
      ? "minimum_tickers_not_met"
      : null,
    coverage.positive_outcomes < minimums.minimum_positive_outcomes
      ? "minimum_positive_outcomes_not_met"
      : null,
    coverage.negative_outcomes < minimums.minimum_negative_outcomes
      ? "minimum_negative_outcomes_not_met"
      : null,
    coverage.regimes < minimums.minimum_regimes
      ? "minimum_regimes_not_met"
      : null,
  ].filter((reason): reason is string => reason !== null);
  if (insufficient.length > 0) {
    return {
      status: "not_trainable",
      dataset: null,
      coverage,
      reason_codes: uniqueSorted([...exclusions, ...insufficient]),
    };
  }
  const sortedRows = datasetRows.sort((first, second) =>
    first.canonical_decision_identity.localeCompare(
      second.canonical_decision_identity,
    ),
  );
  const featureSchemaDigest = digest({
    feature_schema_version: request.feature_schema.feature_schema_version,
    trusted_registry_version:
      request.feature_schema.trusted_registry_version,
    trusted_registry_root_digest:
      request.feature_schema.trusted_registry_root_digest,
    feature_ids: featureNames,
  });
  const labelPolicyDigest = digest(request.label_policy);
  const overlapGraph = buildCanonicalOverlapGraph(sortedRows);
  const datasetPayload = {
    dataset_version: CANONICAL_TRAINING_DATASET_VERSION,
    cohort: request.cohort,
    sample_type: request.sample_type,
    feature_schema_digest: featureSchemaDigest,
    feature_context_registry_root_digest:
      request.feature_schema.trusted_registry_root_digest,
    training_input_manifest_identity: trust.manifest.manifest_identity,
    training_input_manifest_digest: trust.manifest.manifest_digest,
    training_input_registry_root_digest: trainingInputRegistryRootDigest,
    label_policy_digest: labelPolicyDigest,
    feature_order: featureNames,
    identity_count: sortedRows.length,
    trading_days: uniqueSorted(sortedRows.map((row) => row.decision_day)),
    tickers: uniqueSorted(sortedRows.map((row) => row.ticker)),
    regimes: uniqueSorted(sortedRows.map((row) => row.regime)),
    rows: sortedRows,
    overlap_graph: overlapGraph,
    semantic_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const semantic = digest(datasetPayload);
  const dataset: CanonicalTrainingDataset = {
    ...datasetPayload,
    dataset_identity: `canonical-training-dataset:${semantic}`,
    semantic_digest: semantic,
  };
  return {
    status: "built",
    dataset: deepFreeze(dataset),
    coverage,
    reason_codes: uniqueSorted(exclusions),
  };
}

function buildSplits(
  dataset: CanonicalTrainingDataset,
  policy: CanonicalLearningChronologicalSplitPolicy,
) {
  const splits: CanonicalLearningSplit[] = [];
  const days = dataset.trading_days;
  const componentByIdentity = new Map(
    dataset.overlap_graph.nodes.map((node) => [
      node.canonical_decision_identity,
      node.component_identity,
    ]),
  );
  let priorEmbargoUntil = Number.NEGATIVE_INFINITY;
  for (
    let testStart = policy.initial_training_days;
    testStart < days.length;
    testStart += policy.step_days
  ) {
    const testDays = days.slice(testStart, testStart + policy.test_days);
    if (testDays.length !== policy.test_days) break;
    const testRows = dataset.rows.filter((row) =>
      testDays.includes(row.decision_day),
    );
    const testWindowStart = Math.min(
      ...testRows.map((row) => Date.parse(row.decision_timestamp)),
    );
    if (
      !Number.isFinite(testWindowStart) ||
      testWindowStart <= priorEmbargoUntil
    ) {
      continue;
    }
    const testComponents = new Set(
      testRows.map((row) =>
        componentByIdentity.get(row.canonical_decision_identity),
      ),
    );
    const candidateTrainingDays = days.slice(0, testStart);
    const daysToPurge = new Set<string>();
    for (const row of dataset.rows.filter((item) =>
      candidateTrainingDays.includes(item.decision_day),
    )) {
      if (
        Date.parse(row.outcome_completed_at) >= testWindowStart ||
        testComponents.has(
          componentByIdentity.get(row.canonical_decision_identity),
        )
      ) {
        daysToPurge.add(row.decision_day);
      }
    }
    const purgedDays = [...daysToPurge].sort();
    const trainingDays = candidateTrainingDays.filter(
      (day) => !daysToPurge.has(day),
    );
    const trainingIdentities = dataset.rows
      .filter((row) => trainingDays.includes(row.decision_day))
      .map((row) => row.canonical_decision_identity)
      .sort();
    const testIdentities = testRows
      .map((row) => row.canonical_decision_identity)
      .sort();
    const trainingComponents = new Set(
      trainingIdentities.map((identity) => componentByIdentity.get(identity)),
    );
    const overlapComponentIdentities = uniqueSorted(
      [...trainingComponents, ...testComponents].filter(
        (item): item is string => typeof item === "string",
      ),
    );
    if (
      trainingIdentities.length === 0 ||
      testIdentities.length === 0 ||
      trainingIdentities.some((identity) => testIdentities.includes(identity)) ||
      [...trainingComponents].some((component) =>
        testComponents.has(component),
      )
    ) {
      continue;
    }
    const latestTestCompletion = Math.max(
      ...testRows.map((row) => Date.parse(row.outcome_completed_at)),
    );
    const embargoUntil =
      latestTestCompletion + policy.embargo_minutes * 60_000;
    const embargoedDays = days.filter((day) => {
      if (day <= testDays.at(-1)!) return false;
      const firstDecision = Math.min(
        ...dataset.rows
          .filter((row) => row.decision_day === day)
          .map((row) => Date.parse(row.decision_timestamp)),
      );
      return firstDecision <= embargoUntil;
    });
    const payload = {
      split_index: splits.length,
      training_days: trainingDays,
      purged_days: purgedDays,
      test_days: testDays,
      embargoed_days_after_test: embargoedDays,
      embargo_until: new Date(embargoUntil).toISOString(),
      overlap_component_identities: overlapComponentIdentities,
      purge_derived_from_outcome_intervals: true as const,
      training_identities: trainingIdentities,
      test_identities: testIdentities,
      preprocessing_fit_identity_count: trainingIdentities.length,
    };
    const semantic = digest(payload);
    splits.push({
      ...payload,
      split_identity: `canonical-learning-split:${semantic}`,
      semantic_digest: semantic,
    });
    priorEmbargoUntil = embargoUntil;
  }
  return splits;
}

function standardization(
  rows: CanonicalTrainingDatasetRow[],
  featureOrder: string[],
): CanonicalFeatureStandardization {
  const means: Record<string, number> = {};
  const scales: Record<string, number> = {};
  const reasonCodes: string[] = [];
  for (const feature of featureOrder) {
    const values = rows.map((row) => row.features[feature]);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      values.length;
    if (!finite(mean) || !finite(variance) || variance < 0) {
      throw new CanonicalLearningNumericSafetyError(
        "standardization_intermediate_non_finite",
      );
    }
    means[feature] = round(mean);
    const rawScale = Math.sqrt(variance);
    if (rawScale < 1e-12) {
      scales[feature] = 1;
      reasonCodes.push(`near_zero_variance_feature:${feature}`);
    } else {
      scales[feature] = round(rawScale);
    }
  }
  const payload = {
    standardization_version: CANONICAL_STANDARDIZATION_VERSION,
    feature_order: featureOrder,
    means,
    scales,
    fitted_identity_count: rows.length,
    reason_codes: uniqueSorted(reasonCodes),
  };
  return {
    ...payload,
    semantic_digest: digest(payload),
  };
}

function standardizedVector(
  row: CanonicalTrainingDatasetRow,
  preprocessing: CanonicalFeatureStandardization,
) {
  return preprocessing.feature_order.map((feature) => {
    const value =
      (row.features[feature] - preprocessing.means[feature]) /
      preprocessing.scales[feature];
    if (!finite(value) || Math.abs(value) > 1_000_000) {
      throw new CanonicalLearningNumericSafetyError(
        "standardized_feature_out_of_bounds",
      );
    }
    return round(value);
  });
}

function correlationEvidence(input: {
  split: CanonicalLearningSplit;
  rows: CanonicalTrainingDatasetRow[];
  featureOrder: string[];
}): CanonicalLearningCorrelationEvidence {
  const threshold = 0.9;
  const pairs: CanonicalLearningCorrelationEvidence["pairs"] = [];
  for (let firstIndex = 0; firstIndex < input.featureOrder.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < input.featureOrder.length;
      secondIndex += 1
    ) {
      const firstFeature = input.featureOrder[firstIndex];
      const secondFeature = input.featureOrder[secondIndex];
      const firstValues = input.rows.map((row) => row.features[firstFeature]);
      const secondValues = input.rows.map((row) => row.features[secondFeature]);
      const firstMean =
        firstValues.reduce((sum, value) => sum + value, 0) /
        firstValues.length;
      const secondMean =
        secondValues.reduce((sum, value) => sum + value, 0) /
        secondValues.length;
      let covariance = 0;
      let firstVariance = 0;
      let secondVariance = 0;
      for (let index = 0; index < firstValues.length; index += 1) {
        const firstDelta = firstValues[index] - firstMean;
        const secondDelta = secondValues[index] - secondMean;
        covariance += firstDelta * secondDelta;
        firstVariance += firstDelta ** 2;
        secondVariance += secondDelta ** 2;
      }
      if (
        !finite(covariance) ||
        !finite(firstVariance) ||
        !finite(secondVariance)
      ) {
        throw new CanonicalLearningNumericSafetyError(
          "correlation_intermediate_non_finite",
        );
      }
      const denominator = Math.sqrt(firstVariance * secondVariance);
      const nearZeroVariance = denominator < 1e-12;
      const correlation = nearZeroVariance
        ? 0
        : round(covariance / denominator);
      const stronglyCorrelated =
        !nearZeroVariance && Math.abs(correlation) >= threshold;
      const reasonCodes = [
        nearZeroVariance ? "correlation_near_zero_variance" : null,
        stronglyCorrelated
          ? "strong_feature_correlation_predictive_attribution_unstable"
          : null,
      ].filter((reason): reason is string => reason !== null);
      pairs.push({
        first_feature: firstFeature,
        second_feature: secondFeature,
        pearson_correlation: correlation,
        strongly_correlated: stronglyCorrelated,
        reason_codes: reasonCodes,
      });
    }
  }
  const reasonCodes = uniqueSorted(
    pairs.flatMap((pair) => pair.reason_codes),
  );
  const payload = {
    diagnostic_version: CANONICAL_CORRELATION_DIAGNOSTIC_VERSION,
    split_identity: input.split.split_identity,
    strong_correlation_threshold: threshold,
    pairs,
    reason_codes: reasonCodes,
    causal_effect_claimed: false as const,
  };
  return {
    ...payload,
    semantic_digest: digest(payload),
  };
}

function seededInitial(seed: string, count: number) {
  let state = Number.parseInt(digest(seed).slice(0, 8), 16) >>> 0;
  return Array.from({ length: count }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return round(((state / 0xffffffff) - 0.5) * 0.002);
  });
}

function sigmoid(value: number) {
  if (!finite(value)) {
    throw new CanonicalLearningNumericSafetyError(
      "sigmoid_input_non_finite",
    );
  }
  const bounded = Math.max(-30, Math.min(30, value));
  const probability = 1 / (1 + Math.exp(-bounded));
  if (!finite(probability)) {
    throw new CanonicalLearningNumericSafetyError(
      "sigmoid_output_non_finite",
    );
  }
  return probability;
}

function fitModel(input: {
  rows: CanonicalTrainingDatasetRow[];
  featureOrder: string[];
  hyperparameters: CanonicalLearningModelHyperparameters;
  seed: string;
}) {
  const preprocessing = standardization(input.rows, input.featureOrder);
  const matrix = input.rows.map((row) =>
    standardizedVector(row, preprocessing),
  );
  const labels = input.rows.map((row) =>
    input.hyperparameters.family ===
    "regularized_logistic_target_before_stop"
      ? row.binary_label
      : row.canonical_r_label,
  );
  const initialized = seededInitial(
    `${input.seed}:${input.hyperparameters.family}`,
    input.featureOrder.length + 1,
  );
  let intercept = initialized[0];
  const coefficients = initialized.slice(1);
  for (
    let iteration = 0;
    iteration < input.hyperparameters.iterations;
    iteration += 1
  ) {
    let interceptGradient = 0;
    const gradients = coefficients.map(() => 0);
    for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
      const linear =
        intercept +
        coefficients.reduce(
          (sum, coefficient, index) =>
            sum + coefficient * matrix[rowIndex][index],
          0,
        );
      const prediction =
        input.hyperparameters.family ===
        "regularized_logistic_target_before_stop"
          ? sigmoid(linear)
          : linear;
      const error = prediction - labels[rowIndex];
      if (!finite(linear) || !finite(prediction) || !finite(error)) {
        throw new CanonicalLearningNumericSafetyError(
          "training_linear_prediction_or_error_non_finite",
        );
      }
      interceptGradient += error;
      for (let index = 0; index < coefficients.length; index += 1) {
        gradients[index] += error * matrix[rowIndex][index];
      }
    }
    if (
      !finite(interceptGradient) ||
      gradients.some((gradient) => !finite(gradient))
    ) {
      throw new CanonicalLearningNumericSafetyError(
        "training_gradient_non_finite",
      );
    }
    intercept -=
      input.hyperparameters.learning_rate *
      (interceptGradient / matrix.length);
    for (let index = 0; index < coefficients.length; index += 1) {
      const gradient =
        gradients[index] / matrix.length +
        input.hyperparameters.l2_regularization * coefficients[index];
      coefficients[index] -= input.hyperparameters.learning_rate * gradient;
      if (!finite(gradient) || !finite(coefficients[index])) {
        throw new CanonicalLearningNumericSafetyError(
          "training_weight_non_finite",
        );
      }
    }
    intercept = round(intercept);
    for (let index = 0; index < coefficients.length; index += 1) {
      coefficients[index] = round(coefficients[index]);
    }
  }
  return {
    preprocessing,
    intercept,
    coefficients: Object.fromEntries(
      input.featureOrder.map((feature, index) => [
        feature,
        coefficients[index],
      ]),
    ),
  };
}

function predict(input: {
  row: CanonicalTrainingDatasetRow;
  family: CanonicalLearningModelFamily;
  preprocessing: CanonicalFeatureStandardization;
  intercept: number;
  coefficients: Record<string, number>;
}) {
  const vector = standardizedVector(input.row, input.preprocessing);
  const contributions = Object.fromEntries(
    input.preprocessing.feature_order.map((feature, index) => [
      feature,
      round(input.coefficients[feature] * vector[index]),
    ]),
  );
  const linear = round(
    input.intercept +
      Object.values(contributions).reduce(
        (sum, contribution) => sum + contribution,
        0,
      ),
  );
  if (
    !finite(linear) ||
    Object.values(contributions).some((value) => !finite(value))
  ) {
    throw new CanonicalLearningNumericSafetyError(
      "prediction_or_attribution_non_finite",
    );
  }
  return {
    prediction:
      input.family === "regularized_logistic_target_before_stop"
        ? round(sigmoid(linear))
        : linear,
    linear,
    contributions,
  };
}

function modelArtifact(input: {
  dataset: CanonicalTrainingDataset;
  splitPolicyDigest: string;
  config: CanonicalLearningTrainingConfig;
  hyperparameters: CanonicalLearningModelHyperparameters;
  rows: CanonicalTrainingDatasetRow[];
  seedSuffix: string;
}): CanonicalCandidateModelArtifact {
  const fitted = fitModel({
    rows: input.rows,
    featureOrder: input.dataset.feature_order,
    hyperparameters: input.hyperparameters,
    seed: `${input.config.random_seed}:${input.seedSuffix}`,
  });
  const payload = {
    artifact_version: CANONICAL_CANDIDATE_MODEL_ARTIFACT_VERSION,
    family: input.hyperparameters.family,
    candidate_model_contract_version:
      input.config.candidate_model_contract_version,
    training_implementation_version:
      CANONICAL_TRAINING_IMPLEMENTATION_VERSION,
    dataset_identity: input.dataset.dataset_identity,
    dataset_digest: input.dataset.semantic_digest,
    feature_context_registry_root_digest:
      input.dataset.feature_context_registry_root_digest,
    training_input_manifest_digest:
      input.dataset.training_input_manifest_digest,
    training_input_registry_root_digest:
      input.dataset.training_input_registry_root_digest,
    feature_schema_digest: input.dataset.feature_schema_digest,
    label_policy_digest: input.dataset.label_policy_digest,
    split_policy_digest: input.splitPolicyDigest,
    hyperparameters: input.hyperparameters,
    random_seed: input.config.random_seed,
    feature_order: input.dataset.feature_order,
    standardization: fitted.preprocessing,
    intercept: fitted.intercept,
    standardized_coefficients: fitted.coefficients,
    artifact_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const artifactDigest = digest(payload);
  return {
    ...payload,
    candidate_model_identity: [
      "canonical-candidate-model",
      input.hyperparameters.family,
      artifactDigest,
    ].join(":"),
    artifact_digest: artifactDigest,
  };
}

function predictionFor(input: {
  row: CanonicalTrainingDatasetRow;
  split: CanonicalLearningSplit;
  family: CanonicalLearningModelFamily;
  preprocessing: CanonicalFeatureStandardization;
  intercept: number;
  coefficients: Record<string, number>;
}) {
  const predicted = predict({
    row: input.row,
    family: input.family,
    preprocessing: input.preprocessing,
    intercept: input.intercept,
    coefficients: input.coefficients,
  });
  const actual =
    input.family === "regularized_logistic_target_before_stop"
      ? input.row.binary_label
      : input.row.canonical_r_label;
  const payload = {
    split_identity: input.split.split_identity,
    family: input.family,
    canonical_decision_identity: input.row.canonical_decision_identity,
    opportunity_set_identity: input.row.opportunity_set_identity,
    decision_day: input.row.decision_day,
    ticker: input.row.ticker,
    regime: input.row.regime,
    cohort: input.row.cohort,
    actual,
    prediction: predicted.prediction,
    local_prediction_contribution: {
      attribution_version: CANONICAL_ATTRIBUTION_EVIDENCE_VERSION,
      baseline: input.intercept,
      by_feature: predicted.contributions,
      reconstructed_prediction_scale_value: predicted.linear,
      attribution_scale:
        input.family === "regularized_logistic_target_before_stop"
          ? ("log_odds" as const)
          : ("canonical_r" as const),
      attribution_unit:
        input.family === "regularized_logistic_target_before_stop"
          ? ("log_odds_target_before_stop" as const)
          : ("r_target_before_stop_cost_adjusted" as const),
      probability_delta:
        input.family === "regularized_logistic_target_before_stop"
          ? round(predicted.prediction - sigmoid(input.intercept))
          : null,
      predictive_association: true as const,
      causal_effect_claimed: false as const,
    },
  };
  const semantic = digest(payload);
  return {
    ...payload,
    prediction_identity: `canonical-learning-prediction:${semantic}`,
    semantic_digest: semantic,
  };
}

function loss(
  family: CanonicalLearningModelFamily,
  actual: number,
  prediction: number,
) {
  const result = family === "regularized_logistic_target_before_stop"
    ? (prediction - actual) ** 2
    : (prediction - actual) ** 2;
  if (!finite(result)) {
    throw new CanonicalLearningNumericSafetyError(
      "loss_non_finite",
    );
  }
  return result;
}

function attributionEvidence(input: {
  family: CanonicalLearningModelFamily;
  finalModel: CanonicalCandidateModelArtifact;
  predictions: CanonicalLearningPrediction[];
  datasetByIdentity: Map<string, CanonicalTrainingDatasetRow>;
  splitModels: Map<
    string,
    {
      preprocessing: CanonicalFeatureStandardization;
      intercept: number;
      coefficients: Record<string, number>;
    }
  >;
}) {
  const familyPredictions = input.predictions.filter(
    (prediction) => prediction.family === input.family,
  );
  const originalLoss =
    familyPredictions.reduce(
      (sum, prediction) =>
        sum + loss(input.family, prediction.actual, prediction.prediction),
      0,
    ) / Math.max(1, familyPredictions.length);
  const ablations = input.finalModel.feature_order.map((feature) => {
    let ablatedLossTotal = 0;
    for (const prediction of familyPredictions) {
      const row = input.datasetByIdentity.get(
        prediction.canonical_decision_identity,
      );
      const splitModel = input.splitModels.get(prediction.split_identity);
      if (!row || !splitModel) throw new Error("ablation_lineage_missing");
      const vector = standardizedVector(row, splitModel.preprocessing);
      const linear = round(
        splitModel.intercept +
          splitModel.preprocessing.feature_order.reduce(
            (sum, currentFeature, index) =>
              sum +
              (currentFeature === feature
                ? 0
                : splitModel.coefficients[currentFeature] * vector[index]),
            0,
          ),
      );
      const ablatedPrediction =
        input.family === "regularized_logistic_target_before_stop"
          ? sigmoid(linear)
          : linear;
      ablatedLossTotal += loss(
        input.family,
        prediction.actual,
        ablatedPrediction,
      );
    }
    const ablatedLoss =
      ablatedLossTotal / Math.max(1, familyPredictions.length);
    return {
      feature,
      family: input.family,
      replacement:
        "training_window_standardized_baseline_zero" as const,
      original_loss: round(originalLoss),
      ablated_loss: round(ablatedLoss),
      loss_delta: round(ablatedLoss - originalLoss),
      predictive_association: true as const,
      causal_effect_claimed: false as const,
    };
  });
  const payload = {
    attribution_version: CANONICAL_ATTRIBUTION_EVIDENCE_VERSION,
    family: input.family,
    standardized_coefficients:
      input.finalModel.standardized_coefficients,
    ablations,
    interpretation: "predictive_association" as const,
    local_interpretation: "local_prediction_contribution" as const,
    coefficient_scale:
      input.family === "regularized_logistic_target_before_stop"
        ? ("log_odds" as const)
        : ("canonical_r" as const),
    coefficient_unit:
      input.family === "regularized_logistic_target_before_stop"
        ? ("log_odds_target_before_stop" as const)
        : ("r_target_before_stop_cost_adjusted" as const),
    reason_codes: uniqueSorted(
      input.finalModel.standardization.reason_codes,
    ),
    causal_effect_claimed: false as const,
  };
  return {
    ...payload,
    semantic_digest: digest(payload),
  };
}

function calibrationEvidence(
  predictions: CanonicalLearningPrediction[],
): CanonicalLearningCalibrationEvidence {
  const logistic = predictions.filter(
    (prediction) =>
      prediction.family === "regularized_logistic_target_before_stop",
  );
  const brier =
    logistic.length > 0
      ? logistic.reduce(
          (sum, prediction) =>
            sum + (prediction.prediction - prediction.actual) ** 2,
          0,
        ) / logistic.length
      : null;
  const boundaries = [
    [0, 0.2],
    [0.2, 0.4],
    [0.4, 0.6],
    [0.6, 0.8],
    [0.8, 1],
  ] as const;
  const buckets = boundaries.map(([lower, upper], bucketIndex) => {
    const items = logistic.filter(
      (prediction) =>
        prediction.prediction >= lower &&
        (bucketIndex === boundaries.length - 1
          ? prediction.prediction <= upper
          : prediction.prediction < upper),
    );
    return {
      lower_inclusive: lower,
      upper_inclusive: upper,
      count: items.length,
      mean_probability:
        items.length > 0
          ? round(
              items.reduce(
                (sum, item) => sum + item.prediction,
                0,
              ) / items.length,
            )
          : null,
      observed_rate:
        items.length > 0
          ? round(
              items.reduce((sum, item) => sum + item.actual, 0) /
                items.length,
            )
          : null,
    };
  });
  const payload = {
    calibration_version: CANONICAL_CALIBRATION_EVIDENCE_VERSION,
    family: "regularized_logistic_target_before_stop" as const,
    semantics: "probability_target_before_stop" as const,
    out_of_sample_identity_count: logistic.length,
    brier_score: brier === null ? null : round(brier),
    buckets,
    not_publishable: true as const,
    reason_codes:
      logistic.length > 0
        ? ["synthetic_fixture_evidence_not_publishable"]
        : ["out_of_sample_predictions_missing"],
  };
  return {
    ...payload,
    semantic_digest: digest(payload),
  };
}

function coverageWithPredictions(
  base: CanonicalLearningCoverage,
  predictions: CanonicalLearningPrediction[],
) {
  const coverage = structuredClone(base);
  coverage.out_of_sample_predictions = predictions.length;
  for (const prediction of predictions) {
    increment(coverage.by_split, prediction.split_identity);
    increment(coverage.by_day, prediction.decision_day);
    increment(coverage.by_ticker, prediction.ticker);
    increment(coverage.by_regime, prediction.regime);
    increment(coverage.by_cohort, prediction.cohort);
  }
  return coverage;
}

function trainCanonicalOfflineLearningModelsUnsafe(
  requestInput: CanonicalOfflineLearningRequest,
  trustBoundary: CanonicalOfflineLearningTrustBoundary | undefined,
): CanonicalOfflineLearningResult {
  const request = structuredClone(requestInput);
  const topLevelReasons = validateTopLevel(request);
  if (topLevelReasons.length > 0) {
    return nonTrainableResult(
      request,
      "conflicting",
      topLevelReasons,
    );
  }
  if (!trustBoundary) {
    return nonTrainableResult(
      request,
      "conflicting",
      ["trusted_learning_boundary_missing"],
    );
  }
  const trusted = verifyTrustBoundary(request, trustBoundary);
  if (trusted.status !== "trusted") {
    return nonTrainableResult(
      request,
      "conflicting",
      trusted.reason_codes,
    );
  }
  const builtDataset = buildDataset(
    request,
    trusted,
    trustBoundary.training_input_registry.root_digest,
  );
  if (builtDataset.status !== "built" || !builtDataset.dataset) {
    return nonTrainableResult(
      request,
      builtDataset.status,
      builtDataset.reason_codes,
      builtDataset.coverage,
    );
  }
  const dataset = builtDataset.dataset;
  const expectedInventory = uniqueSorted(
    dataset.rows.map((row) => row.opportunity_set_identity),
  );
  if (
    !exact(
      expectedInventory,
      uniqueSorted(
        request.shadow_evaluation_binding.opportunity_set_inventory,
      ),
    )
  ) {
    return nonTrainableResult(
      request,
      "conflicting",
      ["shadow_opportunity_set_inventory_mismatch"],
      builtDataset.coverage,
    );
  }
  const splitPolicyDigest = digest(request.split_policy);
  const splits = buildSplits(dataset, request.split_policy);
  if (splits.length === 0) {
    return nonTrainableResult(
      request,
      "not_trainable",
      ["walk_forward_split_not_constructable"],
      builtDataset.coverage,
    );
  }
  const datasetByIdentity = new Map(
    dataset.rows.map((row) => [row.canonical_decision_identity, row]),
  );
  const correlations = splits.map((split) =>
    correlationEvidence({
      split,
      rows: split.training_identities.map((identity) => {
        const row = datasetByIdentity.get(identity);
        if (!row) throw new Error("correlation_training_identity_missing");
        return row;
      }),
      featureOrder: dataset.feature_order,
    }),
  );
  const predictions: CanonicalLearningPrediction[] = [];
  const splitModelEvidence: CanonicalLearningSplitModelEvidence[] = [];
  const splitModelsByFamily = new Map<
    CanonicalLearningModelFamily,
    Map<
      string,
      {
        preprocessing: CanonicalFeatureStandardization;
        intercept: number;
        coefficients: Record<string, number>;
      }
    >
  >();
  for (const hyperparameters of request.training_config.models) {
    const familySplits = new Map<
      string,
      {
        preprocessing: CanonicalFeatureStandardization;
        intercept: number;
        coefficients: Record<string, number>;
      }
    >();
    splitModelsByFamily.set(hyperparameters.family, familySplits);
    for (const split of splits) {
      const trainingRows = split.training_identities.map((identity) => {
        const row = datasetByIdentity.get(identity);
        if (!row) throw new Error("split_training_identity_missing");
        return row;
      });
      const fitted = fitModel({
        rows: trainingRows,
        featureOrder: dataset.feature_order,
        hyperparameters,
        seed: `${request.training_config.random_seed}:${split.split_identity}`,
      });
      familySplits.set(split.split_identity, fitted);
      const splitModelPayload = {
        split_identity: split.split_identity,
        family: hyperparameters.family,
        training_identity_digest: digest(split.training_identities),
        training_identity_count: split.training_identities.length,
        preprocessing: fitted.preprocessing,
        intercept: fitted.intercept,
        standardized_coefficients: fitted.coefficients,
      };
      splitModelEvidence.push({
        ...splitModelPayload,
        semantic_digest: digest(splitModelPayload),
      });
      for (const identity of split.test_identities) {
        const row = datasetByIdentity.get(identity);
        if (!row) throw new Error("split_test_identity_missing");
        predictions.push(
          predictionFor({
            row,
            split,
            family: hyperparameters.family,
            preprocessing: fitted.preprocessing,
            intercept: fitted.intercept,
            coefficients: fitted.coefficients,
          }),
        );
      }
    }
  }
  predictions.sort((first, second) =>
    first.prediction_identity.localeCompare(second.prediction_identity),
  );
  splitModelEvidence.sort((first, second) =>
    `${first.split_identity}:${first.family}`.localeCompare(
      `${second.split_identity}:${second.family}`,
    ),
  );
  if (
    predictions.some(
      (prediction) =>
        !finite(prediction.actual) ||
        !finite(prediction.prediction) ||
        (prediction.family ===
          "regularized_logistic_target_before_stop" &&
          (prediction.prediction < 0 || prediction.prediction > 1)),
    )
  ) {
    return nonTrainableResult(
      request,
      "non_reproducible",
      ["model_prediction_non_finite"],
      builtDataset.coverage,
    );
  }
  const finalModels = request.training_config.models
    .map((hyperparameters) =>
      modelArtifact({
        dataset,
        splitPolicyDigest,
        config: request.training_config,
        hyperparameters,
        rows: dataset.rows,
        seedSuffix: "final",
      }),
    )
    .sort((first, second) => first.family.localeCompare(second.family));
  const attributions = finalModels.map((model) =>
    attributionEvidence({
      family: model.family,
      finalModel: model,
      predictions,
      datasetByIdentity,
      splitModels:
        splitModelsByFamily.get(model.family) ??
        new Map(),
    }),
  );
  const calibration = calibrationEvidence(predictions);
  const splitDigest = digest({
    splits,
    split_model_evidence: splitModelEvidence,
    correlation_evidence: correlations,
  });
  const modelArtifactDigest = digest(
    finalModels.map((model) => ({
      identity: model.candidate_model_identity,
      digest: model.artifact_digest,
    })),
  );
  const predictionDigest = digest(predictions);
  const shadowPayload = {
    binding_version: CANONICAL_LEARNING_SHADOW_BINDING_VERSION,
    action_666_evaluation_version:
      CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
    dataset_identity: dataset.dataset_identity,
    feature_context_registry_root_digest:
      dataset.feature_context_registry_root_digest,
    training_input_manifest_digest:
      dataset.training_input_manifest_digest,
    training_input_registry_root_digest:
      dataset.training_input_registry_root_digest,
    opportunity_set_inventory_digest: digest(expectedInventory),
    prediction_digest: predictionDigest,
    candidate_model_identities: finalModels.map(
      (model) => model.candidate_model_identity,
    ),
    candidate_model_artifact_digests: finalModels.map(
      (model) => model.artifact_digest,
    ),
    evaluator_contract_version:
      request.shadow_evaluation_binding.evaluator_contract_version,
    provider_contract_version:
      request.shadow_evaluation_binding.provider_contract_version,
    terminal_outcome_policy:
      request.shadow_evaluation_binding.terminal_outcome_policy,
    shadow_only: true as const,
    live_producer_created: false as const,
  };
  const shadowBinding: CanonicalLearningShadowEvaluationBinding = {
    ...shadowPayload,
    semantic_digest: digest(shadowPayload),
  };
  const coverage = coverageWithPredictions(
    builtDataset.coverage,
    predictions,
  );
  coverage.reason_codes = uniqueSorted([
    ...builtDataset.reason_codes,
    "synthetic_fixture_evidence_not_publishable",
  ]);
  const reproducibilityPayload = {
    version: CANONICAL_LEARNING_REPRODUCIBILITY_VERSION,
    deterministic: true,
    input_order_independent: true,
    input_immutable: true,
    dataset_digest: dataset.semantic_digest,
    split_digest: splitDigest,
    model_artifact_digest: modelArtifactDigest,
    prediction_digest: predictionDigest,
  };
  const payload = {
    engine_version: CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION,
    status: "trainable" as const,
    executed: true,
    evidence_class: request.evidence_class,
    ...safety,
    dataset,
    dataset_digest: dataset.semantic_digest,
    split_policy_digest: splitPolicyDigest,
    split_digest: splitDigest,
    splits,
    split_model_evidence: splitModelEvidence,
    correlation_evidence: correlations,
    models: finalModels,
    model_artifact_digest: modelArtifactDigest,
    predictions,
    calibration_evidence: calibration,
    attribution_evidence: attributions,
    shadow_evaluation_binding: shadowBinding,
    trust_evidence: {
      feature_context_registry_root_digest:
        trustBoundary.feature_context_registry.root_digest,
      training_input_manifest_identity: trusted.manifest.manifest_identity,
      training_input_manifest_digest: trusted.manifest.manifest_digest,
      training_input_registry_root_digest:
        trustBoundary.training_input_registry.root_digest,
      trust_source: trustBoundary.trust_source,
    },
    execution_counters: {
      request_reads: 1,
      clones: 1,
      registry_lookups: 2,
      dataset_builds: 1,
      training_iterations:
        request.training_config.models.reduce(
          (sum, model) => sum + model.iterations * (splits.length + 1),
          0,
        ),
      predictions: predictions.length,
    },
    reproducibility: {
      version: CANONICAL_LEARNING_REPRODUCIBILITY_VERSION,
      deterministic: true,
      input_order_independent: true,
      input_immutable: true,
      semantic_digest: digest(reproducibilityPayload),
    },
    coverage,
    reason_codes: coverage.reason_codes,
  };
  return deepFreeze({
    ...payload,
    result_digest: digest(payload),
  });
}

export function trainCanonicalOfflineLearningModels(
  request: CanonicalOfflineLearningRequest,
  trustBoundary?: CanonicalOfflineLearningTrustBoundary,
): CanonicalOfflineLearningResult {
  try {
    return trainCanonicalOfflineLearningModelsUnsafe(
      request,
      trustBoundary,
    );
  } catch (error) {
    const reasonCode =
      error instanceof CanonicalLearningNumericSafetyError
        ? error.reasonCode
        : "offline_learning_unhandled_numeric_or_contract_failure";
    return nonTrainableResult(
      request,
      "non_reproducible",
      [reasonCode],
    );
  }
}

export function verifyCanonicalOfflineLearningResult(input: {
  request: CanonicalOfflineLearningRequest;
  result: CanonicalOfflineLearningResult;
  trust_boundary: CanonicalOfflineLearningTrustBoundary;
}) {
  const trusted = verifyTrustBoundary(
    structuredClone(input.request),
    input.trust_boundary,
  );
  if (trusted.status !== "trusted") {
    return deepFreeze({
      valid: false,
      reason_codes: trusted.reason_codes,
      canonical_result: null,
    });
  }
  const expected = trainCanonicalOfflineLearningModels(
    input.request,
    input.trust_boundary,
  );
  const valid = exact(expected, input.result);
  return deepFreeze({
    valid,
    reason_codes: valid
      ? []
      : ["offline_learning_result_or_candidate_model_tampered"],
    canonical_result: valid ? expected : null,
  });
}

export type CanonicalOfflineLearningEngine = {
  enabled: boolean;
  kill_switch_engaged: boolean;
  run(request: CanonicalOfflineLearningRequest): CanonicalOfflineLearningResult;
};

export function createDefaultOffCanonicalOfflineLearningEngine(options: {
  enabled?: boolean;
  kill_switch_engaged?: boolean;
  trust_boundary?: CanonicalOfflineLearningTrustBoundary;
  train?: typeof trainCanonicalOfflineLearningModels;
} = {}): CanonicalOfflineLearningEngine {
  const enabled =
    options.enabled ?? DEFAULT_OFF_OFFLINE_LEARNING_ENGINE_ENABLED;
  const killSwitchEngaged =
    options.kill_switch_engaged ??
    DEFAULT_OFF_OFFLINE_LEARNING_KILL_SWITCH_ENGAGED;
  const train = options.train ?? trainCanonicalOfflineLearningModels;
  return {
    enabled,
    kill_switch_engaged: killSwitchEngaged,
    run(request) {
      if (!enabled) {
        return defaultOffResult("offline_learning_engine_disabled");
      }
      if (killSwitchEngaged) {
        return defaultOffResult(
          "offline_learning_kill_switch_engaged",
        );
      }
      return train(request, options.trust_boundary);
    },
  };
}
