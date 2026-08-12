import "server-only";

import { createHash } from "node:crypto";

import {
  CANONICAL_QUALITY_METRICS_POLICY_VERSION,
} from "@/lib/canonical-quality-metrics";
import {
  CANONICAL_QUALITY_VERSION_COMPARISON_VERSION,
} from "@/lib/canonical-quality-scorecard";
import {
  CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION,
} from "@/lib/server/canonical-offline-learning-engine";
import {
  CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION,
  CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION,
} from "@/lib/server/canonical-predictive-outcome-explanation";
import {
  CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_NAMESPACES,
  CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
  verifyAndProjectCanonicalModelImprovementUpstreams,
  type CanonicalModelImprovementEvidenceNamespace,
  type CanonicalModelImprovementUpstreamSources,
} from "@/lib/server/canonical-model-improvement-upstream-verification";

export const CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION =
  "canonical_model_improvement_proposal_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION =
  "canonical_model_improvement_policy_v1" as const;
export const CANONICAL_MODEL_EXPERIMENT_PREREGISTRATION_VERSION =
  "canonical_model_experiment_preregistration_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_ROOT_VERSION =
  "canonical_model_improvement_evidence_root_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_TRUSTED_POST_VERSION =
  "canonical_model_improvement_trusted_post_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_TRUSTED_REGISTRY_VERSION =
  "canonical_model_improvement_trusted_registry_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_MULTIPLE_TESTING_POLICY_VERSION =
  "canonical_model_improvement_multiple_testing_policy_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_METRIC_TAXONOMY_VERSION =
  "canonical_model_improvement_metric_taxonomy_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_METRIC_INVENTORY_VERSION =
  "canonical_model_improvement_metric_inventory_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_HYPOTHESIS_INVENTORY_VERSION =
  "canonical_model_improvement_hypothesis_inventory_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_ROW_STABILITY_VERSION =
  "canonical_model_improvement_row_stability_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_NO_CHANGE_POLICY_VERSION =
  "canonical_model_improvement_no_change_policy_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_REGISTRY_AUTHORITY_VERSION =
  "canonical_model_improvement_registry_authority_v1" as const;
export const CANONICAL_MODEL_IMPROVEMENT_REGISTRY_MANIFEST_VERSION =
  "canonical_model_improvement_registry_manifest_v1" as const;

export const DEFAULT_OFF_MODEL_IMPROVEMENT_ENABLED = false;
export const DEFAULT_OFF_MODEL_IMPROVEMENT_KILL_SWITCH_ENGAGED = true;
export const CANONICAL_MODEL_IMPROVEMENT_FROZEN_REGISTRY_MANIFEST_DIGEST =
  "3d8713736e37dc288f9e6ff6991f3306b6a3230cfa01c6273c041f1b3c07e5be" as const;

export const CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_TYPES = [
  "feature_addition",
  "feature_removal",
  "feature_transformation",
  "regularization_or_model_hyperparameter_candidate",
  "ranking_threshold_candidate",
  "calibrated_confidence_threshold_candidate",
  "regime_specific_abstention_candidate",
  "no_trade_or_selectivity_candidate",
  "stop_target_or_horizon_research_candidate",
  "data_quality_or_provider_coverage_candidate",
  "no_change",
] as const;

export type CanonicalModelImprovementProposalType =
  (typeof CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_TYPES)[number];

export const CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_CLASSES = [
  "observed_pattern",
  "predictive_association",
  "ablation_evidence",
  "counterfactual_sensitivity",
  "research_hypothesis",
  "approved_experiment_candidate",
] as const;

export type CanonicalModelImprovementEvidenceClass =
  (typeof CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_CLASSES)[number];

export type CanonicalModelImprovementProposalStatus =
  | "proposal_ready"
  | "research_only"
  | "insufficient_evidence"
  | "conflicting"
  | "non_reproducible"
  | "not_point_in_time_safe"
  | "no_change";

export const canonicalModelImprovementPolicy = {
  policy_version: CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
  minimum_identities: 20,
  minimum_trading_days: 5,
  minimum_tickers: 4,
  minimum_regimes: 2,
  minimum_walk_forward_splits: 3,
  minimum_stable_splits: 3,
  minimum_effect_stability_ratio: 0.75,
  maximum_incomplete_rate: 0,
  maximum_ambiguous_rate: 0,
  maximum_conflicting_rate: 0,
  maximum_adjusted_primary_p_value: 0.05,
  protected_metric_default_non_inferiority_floor: 0,
  multiple_testing_policy_version:
    CANONICAL_MODEL_IMPROVEMENT_MULTIPLE_TESTING_POLICY_VERSION,
  allowed_correction_methods: [
    "holm_bonferroni_v1",
    "benjamini_hochberg_fdr_v1",
    "single_preregistered_hypothesis_v1",
  ],
  no_automatic_promotion: true,
} as const;

export type CanonicalModelVersionTuple = {
  engine: string;
  scoring: string;
  ranking: string;
  threshold: string;
  confidence: string;
  evaluator: string;
  provider: string;
};

export type CanonicalModelImprovementPattern = {
  pattern_identity: string;
  taxonomy_code: string;
  occurrence_count: number;
  canonical_identity_count: number;
  split_identities: string[];
  cohorts: string[];
  regimes: string[];
  direction: "favorable" | "unfavorable" | "mixed";
  effect_size: number;
  point_in_time_safe: boolean;
  evidence_digest: string;
};

export type CanonicalProtectedMetric = {
  metric: string;
  delta: number;
  non_inferiority_floor: number;
  status: "measurable" | "not_measurable";
};

export const CANONICAL_MODEL_IMPROVEMENT_METRICS = [
  "cost_adjusted_expectancy_r",
  "brier_score",
  "expected_calibration_error",
  "precision_at_3",
  "win_rate",
] as const;

export type CanonicalModelImprovementMetricIdentity =
  (typeof CANONICAL_MODEL_IMPROVEMENT_METRICS)[number];

export type CanonicalModelImprovementMetricEvidence = {
  metric_identity: CanonicalModelImprovementMetricIdentity;
  metric_version: typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION;
  roles: ("primary" | "secondary" | "protected")[];
  value: number;
  delta: number;
  status: "measurable";
  uncertainty_digest: string;
  denominator_digest: string;
  cohort: string;
  period: { start: string; end: string };
  verified_result_digest: string;
  non_inferiority_floor: number | null;
  regression_boundary: number | null;
  semantic_digest: string;
};

export type CanonicalModelImprovementMetricInventory = {
  inventory_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_METRIC_INVENTORY_VERSION;
  taxonomy_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_METRIC_TAXONOMY_VERSION;
  primary_metric: CanonicalModelImprovementMetricIdentity;
  secondary_metrics: CanonicalModelImprovementMetricIdentity[];
  protected_metrics: CanonicalModelImprovementMetricIdentity[];
  metrics: CanonicalModelImprovementMetricEvidence[];
  inventory_digest: string;
};

export type CanonicalModelImprovementStabilityRow = {
  row_identity: string;
  canonical_decision_identity: string;
  opportunity_set_identity: string;
  trading_day: string;
  ticker: string;
  regime: string;
  split_identity: string;
  cohort: string;
  primary_metric: CanonicalModelImprovementMetricIdentity;
  contribution: number;
  verified_prediction_digest: string;
  row_digest: string;
};

export type CanonicalModelImprovementSplitStability = {
  split_identity: string;
  cohort: string;
  primary_metric: CanonicalModelImprovementMetricIdentity;
  row_count: number;
  effect_value: number;
  uncertainty: { lower: number; upper: number; method: string };
  direction: "favorable" | "unfavorable" | "mixed";
  row_inventory_digest: string;
  semantic_digest: string;
};

export type CanonicalModelImprovementRowStabilityEvidence = {
  stability_version: typeof CANONICAL_MODEL_IMPROVEMENT_ROW_STABILITY_VERSION;
  primary_metric: CanonicalModelImprovementMetricIdentity;
  cohort: string;
  rows: CanonicalModelImprovementStabilityRow[];
  splits: CanonicalModelImprovementSplitStability[];
  identity_count: number;
  trading_day_count: number;
  ticker_count: number;
  regime_count: number;
  stable_split_count: number;
  inventory_digest: string;
};

export type CanonicalModelImprovementEvidenceBundle = {
  evidence_root_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_ROOT_VERSION;
  upstream_verification: {
    verifier_version:
      typeof CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION;
    source_contract_versions: Record<string, string>;
    namespace_digests: Record<
      Exclude<
        CanonicalModelImprovementEvidenceNamespace,
        "evidence_root" | "experiment_plan"
      >,
      string
    >;
    temporal_evidence_digest: string;
  };
  quality_metrics: {
    metrics_policy_version: typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION;
    comparison_version: typeof CANONICAL_QUALITY_VERSION_COMPARISON_VERSION;
    baseline_scorecard_digest: string;
    candidate_scorecard_digest: string;
    comparison_digest: string;
    comparability_status: "comparable";
    classification: "candidate_improvement" | "non_inferior" | "regression";
    quality_eligible: boolean;
    cohort: string;
    period: {
      start: string;
      end: string;
    };
    canonical_identity_inventory_digest: string;
    verified_denominator_digest: string;
    trading_days: string[];
    tickers: string[];
    regimes: string[];
    coverage_inventory_digest: string;
    identity_count: number;
    trading_day_count: number;
    ticker_count: number;
    regime_count: number;
    cost_adjusted_expectancy_delta_r: number;
    calibration_delta: number;
    protected_metrics: CanonicalProtectedMetric[];
    metric_inventory: CanonicalModelImprovementMetricInventory;
    incomplete_rate: number;
    ambiguous_rate: number;
    conflicting_rate: number;
    uncertainty_digest: string;
    evidence_digest: string;
  };
  opportunity_sets: {
    contract_version:
      typeof CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION;
    inventory_identity: string;
    opportunity_set_identities: string[];
    opportunity_set_digests: string[];
    denominator_digest: string;
    complete_membership: boolean;
    complete_outcome_lineage: boolean;
    point_in_time_safe: boolean;
    expected_candidate_count: number;
    observed_candidate_count: number;
    evaluated_candidate_count: number;
    evidence_digest: string;
  };
  shadow_evaluation: {
    evaluation_version:
      typeof CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION;
    evaluation_identity: string;
    pair_digest: string;
    evaluation_digest: string;
    status: "evaluable" | "probability_semantics_missing";
    reproducible: boolean;
    out_of_sample: boolean;
    baseline_versions: CanonicalModelVersionTuple;
    candidate_versions: CanonicalModelVersionTuple;
    probability_semantics:
      | "calibrated_probability"
      | "probability_semantics_missing";
    evidence_digest: string;
  };
  offline_learning: {
    engine_version: typeof CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION;
    status: "trainable";
    result_digest: string;
    dataset_digest: string;
    split_digest: string;
    model_artifact_digest: string;
    shadow_binding_digest: string;
    feature_context_registry_root_digest: string;
    training_input_registry_root_digest: string;
    walk_forward_split_count: number;
    stable_split_count: number;
    row_level_stability: CanonicalModelImprovementRowStabilityEvidence;
    out_of_sample_prediction_count: number;
    reproducible: boolean;
    frozen_result: boolean;
    in_sample_only: boolean;
    evidence_digest: string;
  };
  explanation_cohort: {
    contract_version:
      typeof CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION;
    failure_taxonomy_version:
      typeof CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION;
    cohort_identity: string;
    cohort_digest: string;
    explanation_digests: string[];
    patterns: CanonicalModelImprovementPattern[];
    conflicting_explanation_count: number;
    point_in_time_safe: boolean;
    evidence_digest: string;
  };
  evidence_root_digest: string;
};

export type CanonicalModelImprovementEvidenceItem = {
  evidence_class: CanonicalModelImprovementEvidenceClass;
  evidence_code: string;
  statement: string;
  sources: {
    namespace: CanonicalModelImprovementEvidenceNamespace;
    digest: string;
  }[];
  causal_claimed: false;
  canonical_status_authority: boolean;
  evidence_digest: string;
};

export type CanonicalModelImprovementChange = {
  operation:
    | "add"
    | "remove"
    | "transform"
    | "set_candidate"
    | "research_only";
  target_namespace: string;
  target_identifier: string;
  baseline_value: string | number | boolean | null;
  candidate_value: string | number | boolean | null;
};

export type CanonicalModelImprovementCandidate = {
  proposal_type: CanonicalModelImprovementProposalType;
  proposal_identity: string;
  title: string;
  change_set: CanonicalModelImprovementChange[];
  change_set_digest: string;
  target_feature_context_registry_root_digest: string;
  evidence_items: CanonicalModelImprovementEvidenceItem[];
  semantic_digest: string;
};

export type CanonicalMultipleTestingEvidence = {
  policy_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_MULTIPLE_TESTING_POLICY_VERSION;
  correction_method:
    | "holm_bonferroni_v1"
    | "benjamini_hochberg_fdr_v1"
    | "single_preregistered_hypothesis_v1";
  family_identity: string;
  preregistration_identity: string;
  hypotheses: {
    hypothesis_identity: string;
    family_identity: string;
    selection_group: string;
    raw_p_value: number;
    test_direction: "higher" | "lower" | "two_sided";
    metric: CanonicalModelImprovementMetricIdentity;
    cohort: string;
    preregistration_identity: string;
  }[];
  adjusted_results: {
    hypothesis_identity: string;
    raw_p_value: number;
    adjusted_p_value: number;
    canonical_order: number;
  }[];
  hypothesis_inventory_digest: string;
  selection_risk: "controlled" | "uncontrolled";
  evidence_digest: string;
};

export type CanonicalModelExperimentPlan = {
  plan_version: typeof CANONICAL_MODEL_EXPERIMENT_PREREGISTRATION_VERSION;
  plan_identity: string;
  proposal_identity: string;
  baseline_versions: CanonicalModelVersionTuple;
  candidate_versions: CanonicalModelVersionTuple;
  exact_change_set_digest: string;
  primary_metric: CanonicalModelImprovementMetricIdentity;
  secondary_metrics: CanonicalModelImprovementMetricIdentity[];
  protected_metrics: {
    metric: string;
    non_inferiority_floor: number;
  }[];
  cohort: string;
  period: {
    start: string;
    end: string;
  };
  validation_design: {
    method: "chronological_trading_day_walk_forward_with_holdout_v1";
    holdout_locked: true;
    purge_and_embargo_required: true;
  };
  sample_minimum: {
    identities: number;
    trading_days: number;
    tickers: number;
    regimes: number;
  };
  stop_conditions: string[];
  rollback_metadata: {
    previous_versions: CanonicalModelVersionTuple;
    candidate_versions: CanonicalModelVersionTuple;
    rollback_trigger_categories: string[];
    kill_switch_owner: string;
  };
  evidence_root_digest: string;
  multiple_testing_evidence_digest: string;
  metric_inventory_digest: string;
  hypothesis_inventory_digest: string;
  multiple_testing_family_identity: string;
  hypothesis_preregistration_identity: string;
  preregistered: true;
  no_automatic_promotion: true;
  semantic_digest: string;
};

export type CanonicalModelImprovementPreviousBindingLookup = {
  lookup_proposal_binding: (
    proposalIdentity: string,
  ) => { semantic_digest: string } | null;
  lookup_experiment_binding: (
    planIdentity: string,
  ) => { semantic_digest: string } | null;
};

export type CanonicalModelImprovementTrustedPayload = {
  proposal_policy_version: typeof CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION;
  upstream_sources: CanonicalModelImprovementUpstreamSources;
  evidence: CanonicalModelImprovementEvidenceBundle;
  proposal_candidates: CanonicalModelImprovementCandidate[];
  experiment_plan: CanonicalModelExperimentPlan | null;
  multiple_testing: CanonicalMultipleTestingEvidence;
  no_change_policy_version:
    | typeof CANONICAL_MODEL_IMPROVEMENT_NO_CHANGE_POLICY_VERSION
    | null;
};

export type CanonicalModelImprovementTrustedPost = {
  post_version: typeof CANONICAL_MODEL_IMPROVEMENT_TRUSTED_POST_VERSION;
  trusted_input_identity: string;
  payload: CanonicalModelImprovementTrustedPayload;
  semantic_digest: string;
};

export type CanonicalModelImprovementTrustedRegistry = {
  registry_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_TRUSTED_REGISTRY_VERSION;
  posts: CanonicalModelImprovementTrustedPost[];
  root_digest: string;
};

export type CanonicalModelImprovementRegistryAuthorityManifest = {
  manifest_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_REGISTRY_MANIFEST_VERSION;
  authority_identity: string;
  registry_root_digests: string[];
  feature_context_registry_root_digest: string;
  training_input_registry_root_digest: string;
  upstream_verifier_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION;
  manifest_digest: string;
};

export type CanonicalModelImprovementRegistryAuthority = {
  authority_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_REGISTRY_AUTHORITY_VERSION;
  authority_identity: string;
  frozen_manifest_digest: string;
  allowed_registry_root_digests: string[];
  expected_feature_context_registry_root_digest: string;
  expected_training_input_registry_root_digest: string;
  upstream_verifier_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION;
};

export type CanonicalModelImprovementTrustBoundary = {
  trust_source: "version_controlled_synthetic_proposal_registry";
  registry: CanonicalModelImprovementTrustedRegistry;
  registry_authority: CanonicalModelImprovementRegistryAuthority;
};

export type CanonicalModelImprovementRequest = {
  evidence_class: "synthetic_fixture_only";
  trusted_input_identity: string;
  trusted_input_digest: string;
};

export type CanonicalModelImprovementProposal = {
  proposal_version: typeof CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION;
  policy_version: typeof CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION;
  proposal_identity: string;
  proposal_type: CanonicalModelImprovementProposalType;
  status: CanonicalModelImprovementProposalStatus;
  evidence_root_digest: string;
  trusted_registry_root_digest: string;
  registry_authority_identity: string;
  registry_authority_manifest_digest: string;
  candidate: CanonicalModelImprovementCandidate;
  experiment_plan: CanonicalModelExperimentPlan | null;
  multiple_testing: CanonicalMultipleTestingEvidence;
  evidence_items: CanonicalModelImprovementEvidenceItem[];
  reason_codes: string[];
  proposal_digest_algorithm: "sha256_canonical_json_v1";
  canonical_proposal_digest: string;
  shadow_only: true;
  live_ranking_effect: false;
  automatic_training_allowed: false;
  automatic_parameter_change_allowed: false;
  automatic_promotion_allowed: false;
  experiment_execution_allowed: false;
  external_ai_canonical_decision_authority: false;
  causal_claimed: false;
  synthetic_evidence: true;
  not_publishable: true;
};

export type CanonicalModelImprovementResult = {
  status:
    | CanonicalModelImprovementProposalStatus
    | "disabled"
    | "kill_switch_engaged";
  proposal: CanonicalModelImprovementProposal | null;
  reason_codes: string[];
  shadow_only: true;
  live_ranking_effect: false;
  automatic_training_allowed: false;
  automatic_parameter_change_allowed: false;
  automatic_promotion_allowed: false;
  experiment_execution_allowed: false;
  external_ai_canonical_decision_authority: false;
  causal_claimed: false;
  synthetic_evidence: true;
  not_publishable: true;
};

export type CanonicalModelImprovementExecutionCounters = {
  request_reads: number;
  clones: number;
  trust_lookups: number;
  registry_lookups: number;
  validations: number;
  proposals_built: number;
};

type CanonicalModelImprovementBuild = (
  request: CanonicalModelImprovementRequest,
) => CanonicalModelImprovementResult;

const canonicalModelImprovementEngineAuthorities = new WeakMap<
  object,
  CanonicalModelImprovementBuild | null
>();

function emptyExecutionCounters(): CanonicalModelImprovementExecutionCounters {
  return {
    request_reads: 0,
    clones: 0,
    trust_lookups: 0,
    registry_lookups: 0,
    validations: 0,
    proposals_built: 0,
  };
}

function publishCanonicalModelImprovementEngine<
  T extends {
    enabled: boolean;
    status: string;
    build: CanonicalModelImprovementBuild | null;
  },
>(
  fields: T,
  counters: CanonicalModelImprovementExecutionCounters,
  canonicalBuild: CanonicalModelImprovementBuild | null,
) {
  const engine = {
    ...fields,
    get counters() {
      return deepFreeze(structuredClone(counters));
    },
  };
  Object.freeze(engine);
  canonicalModelImprovementEngineAuthorities.set(engine, canonicalBuild);
  return engine;
}

const safety = {
  shadow_only: true,
  live_ranking_effect: false,
  automatic_training_allowed: false,
  automatic_parameter_change_allowed: false,
  automatic_promotion_allowed: false,
  experiment_execution_allowed: false,
  external_ai_canonical_decision_authority: false,
  causal_claimed: false,
  synthetic_evidence: true,
  not_publishable: true,
} as const;

const shaPattern = /^[a-f0-9]{64}$/;
const recognizedRegistryAuthorities =
  new WeakSet<CanonicalModelImprovementRegistryAuthority>();

function canonicalize(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non_finite_canonical_value");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, nested]) => nested !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  throw new Error("unsupported_canonical_value");
}

export function canonicalModelImprovementDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
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

function isRuntimeRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasCanonicalRuntimeSurface(
  value: unknown,
  visited = new WeakSet<object>(),
): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object" || visited.has(value)) return false;
  visited.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) return false;
      const expectedKeys = [
        ...Array.from({ length: value.length }, (_, index) => String(index)),
        "length",
      ];
      const actualKeys = Reflect.ownKeys(value);
      if (
        actualKeys.length !== expectedKeys.length ||
        actualKeys.some((key, index) => key !== expectedKeys[index])
      ) {
        return false;
      }
      for (let index = 0; index < value.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (
          !descriptor ||
          !("value" in descriptor) ||
          descriptor.enumerable !== true ||
          !hasCanonicalRuntimeSurface(descriptor.value, visited)
        ) {
          return false;
        }
      }
      return true;
    }

    if (!isRuntimeRecord(value)) return false;
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string") return false;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (
        !descriptor ||
        !("value" in descriptor) ||
        descriptor.enumerable !== true ||
        !hasCanonicalRuntimeSurface(descriptor.value, visited)
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  } finally {
    visited.delete(value);
  }
}

function ownDataValue(value: object, key: string) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor) return { present: false as const, value: undefined };
  if (!("value" in descriptor)) {
    throw new Error(`runtime_accessor_not_allowed:${key}`);
  }
  return { present: true as const, value: descriptor.value };
}

function isExecutionCounterSnapshot(
  value: unknown,
): value is CanonicalModelImprovementExecutionCounters {
  if (!isRuntimeRecord(value)) return false;
  const expectedKeys = [
    "clones",
    "proposals_built",
    "registry_lookups",
    "request_reads",
    "trust_lookups",
    "validations",
  ];
  const keys = Reflect.ownKeys(value).sort((first, second) =>
    String(first).localeCompare(String(second)),
  );
  return (
    keys.length === expectedKeys.length &&
    keys.every((key, index) => key === expectedKeys[index]) &&
    expectedKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return (
        descriptor !== undefined &&
        "value" in descriptor &&
        descriptor.enumerable === true &&
        typeof descriptor.value === "number" &&
        Number.isSafeInteger(descriptor.value) &&
        descriptor.value >= 0
      );
    })
  );
}

function capturePreviousBindingLookup(
  value: unknown,
): CanonicalModelImprovementPreviousBindingLookup {
  if (!isRuntimeRecord(value)) {
    throw new Error("previous_binding_lookup_not_plain_object");
  }
  const expectedKeys = [
    "lookup_experiment_binding",
    "lookup_proposal_binding",
  ];
  const keys = Reflect.ownKeys(value).sort((first, second) =>
    String(first).localeCompare(String(second)),
  );
  if (
    keys.length !== expectedKeys.length ||
    !keys.every((key, index) => key === expectedKeys[index])
  ) {
    throw new Error("previous_binding_lookup_keys_conflicting");
  }
  const proposalDescriptor = Object.getOwnPropertyDescriptor(
    value,
    "lookup_proposal_binding",
  );
  const experimentDescriptor = Object.getOwnPropertyDescriptor(
    value,
    "lookup_experiment_binding",
  );
  if (
    !proposalDescriptor ||
    !("value" in proposalDescriptor) ||
    proposalDescriptor.enumerable !== true ||
    typeof proposalDescriptor.value !== "function" ||
    !experimentDescriptor ||
    !("value" in experimentDescriptor) ||
    experimentDescriptor.enumerable !== true ||
    typeof experimentDescriptor.value !== "function"
  ) {
    throw new Error("previous_binding_lookup_descriptors_conflicting");
  }
  const lookupProposalBinding = proposalDescriptor.value as (
    identity: string,
  ) => { semantic_digest: string } | null;
  const lookupExperimentBinding = experimentDescriptor.value as (
    identity: string,
  ) => { semantic_digest: string } | null;
  const receiver = Object.freeze({
    lookup_proposal_binding: lookupProposalBinding,
    lookup_experiment_binding: lookupExperimentBinding,
  });
  const validatedBinding = (
    binding: unknown,
    reason: string,
  ): { semantic_digest: string } | null => {
    if (binding === null) return null;
    if (!hasCanonicalRuntimeSurface(binding) || !isRuntimeRecord(binding)) {
      throw new Error(reason);
    }
    const keys = Reflect.ownKeys(binding);
    const descriptor = Object.getOwnPropertyDescriptor(
      binding,
      "semantic_digest",
    );
    if (
      keys.length !== 1 ||
      keys[0] !== "semantic_digest" ||
      !descriptor ||
      !("value" in descriptor) ||
      descriptor.enumerable !== true ||
      typeof descriptor.value !== "string" ||
      !shaPattern.test(descriptor.value)
    ) {
      throw new Error(reason);
    }
    return structuredClone(binding) as { semantic_digest: string };
  };
  return Object.freeze({
    lookup_proposal_binding: (proposalIdentity) => {
      const binding = Reflect.apply(lookupProposalBinding, receiver, [
        proposalIdentity,
      ]) as { semantic_digest: string } | null;
      return validatedBinding(
        binding,
        "previous_proposal_binding_runtime_surface_conflicting",
      );
    },
    lookup_experiment_binding: (planIdentity) => {
      const binding = Reflect.apply(lookupExperimentBinding, receiver, [
        planIdentity,
      ]) as { semantic_digest: string } | null;
      return validatedBinding(
        binding,
        "previous_experiment_binding_runtime_surface_conflicting",
      );
    },
  });
}

function isCanonicalModelImprovementRequest(
  value: unknown,
): value is CanonicalModelImprovementRequest {
  if (!isRuntimeRecord(value)) return false;
  const expectedKeys = [
    "evidence_class",
    "trusted_input_digest",
    "trusted_input_identity",
  ];
  const actualKeys = Object.keys(value).sort();
  return (
    actualKeys.length === expectedKeys.length &&
    expectedKeys.every((key, index) => key === actualKeys[index]) &&
    value.evidence_class === "synthetic_fixture_only" &&
    typeof value.trusted_input_identity === "string" &&
    typeof value.trusted_input_digest === "string"
  );
}

function exact(first: unknown, second: unknown) {
  return JSON.stringify(canonicalize(first)) === JSON.stringify(canonicalize(second));
}

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort();
}

function finiteRate(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function payloadWithoutDigest<T extends Record<string, unknown>>(
  value: T,
  digestField: string,
) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== digestField),
  );
}

function canonicalPatternOrder(values: CanonicalModelImprovementPattern[]) {
  return [...values].sort((first, second) =>
    first.pattern_identity.localeCompare(second.pattern_identity),
  );
}

function canonicalChangeOrder(values: CanonicalModelImprovementChange[]) {
  return [...values].sort((first, second) =>
    `${first.target_namespace}:${first.target_identifier}:${first.operation}`.localeCompare(
      `${second.target_namespace}:${second.target_identifier}:${second.operation}`,
    ),
  );
}

function canonicalEvidenceOrder(
  values: CanonicalModelImprovementEvidenceItem[],
) {
  return [...values].sort((first, second) =>
    `${first.evidence_class}:${first.evidence_code}:${first.evidence_digest}`.localeCompare(
      `${second.evidence_class}:${second.evidence_code}:${second.evidence_digest}`,
    ),
  );
}

function canonicalProtectedMetricOrder(values: CanonicalProtectedMetric[]) {
  return [...values].sort((first, second) =>
    first.metric.localeCompare(second.metric),
  );
}

function canonicalMetricIdentityOrder(
  values: CanonicalModelImprovementMetricIdentity[],
) {
  return [...values].sort();
}

function canonicalMetricEvidenceOrder(
  values: CanonicalModelImprovementMetricEvidence[],
) {
  return [...values]
    .map((metric) => ({
      ...structuredClone(metric),
      roles: [...metric.roles].sort(),
    }))
    .sort((first, second) =>
      first.metric_identity.localeCompare(second.metric_identity),
    );
}

function canonicalStabilityRows(
  values: CanonicalModelImprovementStabilityRow[],
) {
  return [...values].sort((first, second) =>
    first.row_identity.localeCompare(second.row_identity),
  );
}

function canonicalStabilitySplits(
  values: CanonicalModelImprovementSplitStability[],
) {
  return [...values].sort((first, second) =>
    first.split_identity.localeCompare(second.split_identity),
  );
}

function validModelVersionTuple(value: CanonicalModelVersionTuple) {
  return Object.values(value).every(
    (version) => typeof version === "string" && version.trim().length > 0,
  );
}

function qualityCoverageInventoryPayload(
  value: CanonicalModelImprovementEvidenceBundle["quality_metrics"],
) {
  return {
    cohort: value.cohort,
    period: value.period,
    canonical_identity_inventory_digest:
      value.canonical_identity_inventory_digest,
    verified_denominator_digest: value.verified_denominator_digest,
    trading_days: [...value.trading_days].sort(),
    tickers: [...value.tickers].sort(),
    regimes: [...value.regimes].sort(),
  };
}

function canonicalPlan(
  plan: CanonicalModelExperimentPlan | null,
): CanonicalModelExperimentPlan | null {
  if (!plan) return null;
  return {
    ...structuredClone(plan),
    secondary_metrics: canonicalMetricIdentityOrder(plan.secondary_metrics),
    protected_metrics: [...plan.protected_metrics].sort((first, second) =>
      first.metric.localeCompare(second.metric),
    ),
    stop_conditions: uniqueSorted(plan.stop_conditions),
    rollback_metadata: {
      ...structuredClone(plan.rollback_metadata),
      rollback_trigger_categories: uniqueSorted(
        plan.rollback_metadata.rollback_trigger_categories,
      ),
    },
  };
}

function canonicalTrustedPayload(
  input: CanonicalModelImprovementTrustedPayload,
) {
  const payload = structuredClone(input);
  payload.evidence.quality_metrics.protected_metrics =
    canonicalProtectedMetricOrder(
      payload.evidence.quality_metrics.protected_metrics,
    );
  payload.evidence.quality_metrics.metric_inventory = {
    ...payload.evidence.quality_metrics.metric_inventory,
    secondary_metrics: canonicalMetricIdentityOrder(
      payload.evidence.quality_metrics.metric_inventory.secondary_metrics,
    ),
    protected_metrics: canonicalMetricIdentityOrder(
      payload.evidence.quality_metrics.metric_inventory.protected_metrics,
    ),
    metrics: canonicalMetricEvidenceOrder(
      payload.evidence.quality_metrics.metric_inventory.metrics,
    ),
  };
  payload.evidence.quality_metrics.trading_days =
    [...payload.evidence.quality_metrics.trading_days].sort();
  payload.evidence.quality_metrics.tickers =
    [...payload.evidence.quality_metrics.tickers].sort();
  payload.evidence.quality_metrics.regimes =
    [...payload.evidence.quality_metrics.regimes].sort();
  payload.evidence.opportunity_sets.opportunity_set_identities =
    [...payload.evidence.opportunity_sets.opportunity_set_identities].sort();
  payload.evidence.opportunity_sets.opportunity_set_digests =
    [...payload.evidence.opportunity_sets.opportunity_set_digests].sort();
  payload.evidence.explanation_cohort.explanation_digests =
    [...payload.evidence.explanation_cohort.explanation_digests].sort();
  payload.evidence.explanation_cohort.patterns = canonicalPatternOrder(
    payload.evidence.explanation_cohort.patterns,
  ).map((pattern) => ({
    ...pattern,
    split_identities: [...pattern.split_identities].sort(),
    cohorts: [...pattern.cohorts].sort(),
    regimes: [...pattern.regimes].sort(),
  }));
  payload.evidence.offline_learning.row_level_stability = {
    ...payload.evidence.offline_learning.row_level_stability,
    rows: canonicalStabilityRows(
      payload.evidence.offline_learning.row_level_stability.rows,
    ),
    splits: canonicalStabilitySplits(
      payload.evidence.offline_learning.row_level_stability.splits,
    ),
  };
  payload.multiple_testing = canonicalMultipleTesting(
    payload.multiple_testing,
  );
  payload.proposal_candidates = [...payload.proposal_candidates]
    .map((candidate) => ({
      ...candidate,
      change_set: canonicalChangeOrder(candidate.change_set),
      evidence_items: canonicalEvidenceOrder(candidate.evidence_items).map(
        (item) => ({
          ...item,
          sources: [...item.sources].sort((first, second) =>
            `${first.namespace}:${first.digest}`.localeCompare(
              `${second.namespace}:${second.digest}`,
            ),
          ),
        }),
      ),
    }))
    .sort((first, second) =>
      first.proposal_identity.localeCompare(second.proposal_identity),
    );
  payload.experiment_plan = canonicalPlan(payload.experiment_plan);
  return payload;
}

function evidenceSectionDigest<T extends Record<string, unknown>>(value: T) {
  return canonicalModelImprovementDigest(
    payloadWithoutDigest(value, "evidence_digest"),
  );
}

export function canonicalModelImprovementEvidenceSectionDigest(
  value: Record<string, unknown>,
) {
  return evidenceSectionDigest(value);
}

function evidenceRootPayload(
  evidence: CanonicalModelImprovementEvidenceBundle,
) {
  return {
    evidence_root_version: evidence.evidence_root_version,
    upstream_verification: evidence.upstream_verification,
    quality_metrics_digest: evidence.quality_metrics.evidence_digest,
    opportunity_sets_digest: evidence.opportunity_sets.evidence_digest,
    shadow_evaluation_digest: evidence.shadow_evaluation.evidence_digest,
    offline_learning_digest: evidence.offline_learning.evidence_digest,
    explanation_cohort_digest:
      evidence.explanation_cohort.evidence_digest,
  };
}

export function createCanonicalModelImprovementEvidenceRoot(
  input: Omit<CanonicalModelImprovementEvidenceBundle, "evidence_root_digest">,
) {
  const evidence = structuredClone(input) as CanonicalModelImprovementEvidenceBundle;
  evidence.quality_metrics.protected_metrics =
    canonicalProtectedMetricOrder(evidence.quality_metrics.protected_metrics);
  evidence.quality_metrics.metric_inventory = {
    ...evidence.quality_metrics.metric_inventory,
    secondary_metrics: canonicalMetricIdentityOrder(
      evidence.quality_metrics.metric_inventory.secondary_metrics,
    ),
    protected_metrics: canonicalMetricIdentityOrder(
      evidence.quality_metrics.metric_inventory.protected_metrics,
    ),
    metrics: canonicalMetricEvidenceOrder(
      evidence.quality_metrics.metric_inventory.metrics,
    ),
  };
  evidence.quality_metrics.trading_days =
    [...evidence.quality_metrics.trading_days].sort();
  evidence.quality_metrics.tickers =
    [...evidence.quality_metrics.tickers].sort();
  evidence.quality_metrics.regimes =
    [...evidence.quality_metrics.regimes].sort();
  evidence.opportunity_sets.opportunity_set_identities =
    [...evidence.opportunity_sets.opportunity_set_identities].sort();
  evidence.opportunity_sets.opportunity_set_digests =
    [...evidence.opportunity_sets.opportunity_set_digests].sort();
  evidence.explanation_cohort.explanation_digests =
    [...evidence.explanation_cohort.explanation_digests].sort();
  evidence.explanation_cohort.patterns = canonicalPatternOrder(
    evidence.explanation_cohort.patterns,
  );
  evidence.offline_learning.row_level_stability = {
    ...evidence.offline_learning.row_level_stability,
    rows: canonicalStabilityRows(
      evidence.offline_learning.row_level_stability.rows,
    ),
    splits: canonicalStabilitySplits(
      evidence.offline_learning.row_level_stability.splits,
    ),
  };
  evidence.evidence_root_digest = canonicalModelImprovementDigest(
    evidenceRootPayload(evidence),
  );
  return deepFreeze(evidence);
}

function proposalIdentityPayload(input: {
  proposal_type: CanonicalModelImprovementProposalType;
  title: string;
  change_set_digest: string;
  evidence_root_digest: string;
}) {
  return {
    proposal_version: CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION,
    proposal_type: input.proposal_type,
    title: input.title,
    change_set_digest: input.change_set_digest,
    evidence_root_digest: input.evidence_root_digest,
  };
}

export function createCanonicalModelImprovementCandidate(input: {
  proposal_type: CanonicalModelImprovementProposalType;
  title: string;
  change_set: CanonicalModelImprovementChange[];
  target_feature_context_registry_root_digest: string;
  evidence_root_digest: string;
  evidence_items: Omit<
    CanonicalModelImprovementEvidenceItem,
    "evidence_digest"
  >[];
}) {
  const changeSet = canonicalChangeOrder(structuredClone(input.change_set));
  const changeSetDigest = canonicalModelImprovementDigest(changeSet);
  const proposalIdentity =
    `canonical-model-improvement-proposal:${canonicalModelImprovementDigest(
      proposalIdentityPayload({
        proposal_type: input.proposal_type,
        title: input.title,
        change_set_digest: changeSetDigest,
        evidence_root_digest: input.evidence_root_digest,
      }),
    )}`;
  const evidenceItems = canonicalEvidenceOrder(
    input.evidence_items.map((item) => ({
      ...structuredClone(item),
      sources: [...item.sources].sort((first, second) =>
        `${first.namespace}:${first.digest}`.localeCompare(
          `${second.namespace}:${second.digest}`,
        ),
      ),
      evidence_digest: canonicalModelImprovementDigest({
        ...item,
        sources: [...item.sources].sort((first, second) =>
          `${first.namespace}:${first.digest}`.localeCompare(
            `${second.namespace}:${second.digest}`,
          ),
        ),
      }),
    })),
  );
  const payload = {
    proposal_type: input.proposal_type,
    proposal_identity: proposalIdentity,
    title: input.title,
    change_set: changeSet,
    change_set_digest: changeSetDigest,
    target_feature_context_registry_root_digest:
      input.target_feature_context_registry_root_digest,
    evidence_items: evidenceItems,
  };
  return deepFreeze({
    ...payload,
    semantic_digest: canonicalModelImprovementDigest(payload),
  });
}

function modelTransitionDigest(input: {
  baseline: CanonicalModelVersionTuple;
  candidate: CanonicalModelVersionTuple;
}) {
  return canonicalModelImprovementDigest({
    baseline: input.baseline,
    candidate: input.candidate,
  });
}

function roundCanonical(value: number) {
  return Math.round(value * 1_000_000_000_000) / 1_000_000_000_000;
}

function canonicalMultipleTesting(value: CanonicalMultipleTestingEvidence) {
  return {
    ...structuredClone(value),
    hypotheses: [...value.hypotheses].sort((first, second) =>
      first.hypothesis_identity.localeCompare(second.hypothesis_identity),
    ),
    adjusted_results: [...value.adjusted_results].sort((first, second) =>
      first.hypothesis_identity.localeCompare(second.hypothesis_identity),
    ),
  };
}

export function createCanonicalMultipleTestingEvidence(input: {
  correction_method: CanonicalMultipleTestingEvidence["correction_method"];
  family_identity: string;
  preregistration_identity: string;
  hypotheses: CanonicalMultipleTestingEvidence["hypotheses"];
}) {
  if (
    !canonicalModelImprovementPolicy.allowed_correction_methods.includes(
      input.correction_method,
    ) ||
    !input.family_identity.trim() ||
    !input.preregistration_identity.trim() ||
    input.hypotheses.length === 0 ||
    !unique(input.hypotheses.map((item) => item.hypothesis_identity)) ||
    input.hypotheses.some(
      (item) =>
        !item.hypothesis_identity.trim() ||
        !item.selection_group.trim() ||
        !item.cohort.trim() ||
        !["higher", "lower", "two_sided"].includes(item.test_direction) ||
        !CANONICAL_MODEL_IMPROVEMENT_METRICS.includes(item.metric) ||
        !finiteRate(item.raw_p_value) ||
        item.family_identity !== input.family_identity ||
        item.preregistration_identity !== input.preregistration_identity,
    )
  ) {
    throw new Error("canonical_hypothesis_inventory_conflicting");
  }
  const hypotheses = [...structuredClone(input.hypotheses)].sort(
    (first, second) =>
      first.raw_p_value - second.raw_p_value ||
      first.hypothesis_identity.localeCompare(second.hypothesis_identity),
  );
  const count = hypotheses.length;
  const rawAdjusted =
    input.correction_method === "single_preregistered_hypothesis_v1"
      ? hypotheses.map((hypothesis) => hypothesis.raw_p_value)
      : input.correction_method === "holm_bonferroni_v1"
        ? hypotheses.reduce<number[]>((values, hypothesis, index) => {
            values.push(
              Math.max(
                values[index - 1] ?? 0,
                Math.min(1, hypothesis.raw_p_value * (count - index)),
              ),
            );
            return values;
          }, [])
        : (() => {
            const adjusted = Array<number>(count);
            let previous = 1;
            for (let index = count - 1; index >= 0; index -= 1) {
              previous = Math.min(
                previous,
                Math.min(1, hypotheses[index].raw_p_value * count / (index + 1)),
              );
              adjusted[index] = previous;
            }
            return adjusted;
          })();
  const adjustedResults = hypotheses
    .map((hypothesis, index) => ({
      hypothesis_identity: hypothesis.hypothesis_identity,
      raw_p_value: hypothesis.raw_p_value,
      adjusted_p_value: roundCanonical(rawAdjusted[index]),
      canonical_order: index + 1,
    }))
    .sort((first, second) =>
      first.hypothesis_identity.localeCompare(second.hypothesis_identity),
    );
  const canonicalHypotheses = [...hypotheses].sort((first, second) =>
    first.hypothesis_identity.localeCompare(second.hypothesis_identity),
  );
  const hypothesisInventoryDigest = canonicalModelImprovementDigest({
    inventory_version:
      CANONICAL_MODEL_IMPROVEMENT_HYPOTHESIS_INVENTORY_VERSION,
    family_identity: input.family_identity,
    preregistration_identity: input.preregistration_identity,
    hypotheses: canonicalHypotheses,
  });
  const payload = {
    policy_version:
      CANONICAL_MODEL_IMPROVEMENT_MULTIPLE_TESTING_POLICY_VERSION,
    correction_method: input.correction_method,
    family_identity: input.family_identity,
    preregistration_identity: input.preregistration_identity,
    hypotheses: canonicalHypotheses,
    adjusted_results: adjustedResults,
    hypothesis_inventory_digest: hypothesisInventoryDigest,
    selection_risk:
      (input.correction_method === "single_preregistered_hypothesis_v1" &&
        count !== 1) ||
      (input.correction_method !== "single_preregistered_hypothesis_v1" &&
        count < 2)
        ? ("uncontrolled" as const)
        : ("controlled" as const),
  };
  return deepFreeze({
    ...payload,
    evidence_digest: canonicalModelImprovementDigest(payload),
  });
}

export function createCanonicalModelImprovementMetricInventory(input: {
  primary_metric: CanonicalModelImprovementMetricIdentity;
  secondary_metrics: CanonicalModelImprovementMetricIdentity[];
  protected_metrics: CanonicalModelImprovementMetricIdentity[];
  metrics: Omit<CanonicalModelImprovementMetricEvidence, "semantic_digest">[];
}) {
  const metrics = canonicalMetricEvidenceOrder(
    input.metrics.map((metric) => ({
      ...structuredClone(metric),
      semantic_digest: canonicalModelImprovementDigest({
        ...metric,
        roles: [...metric.roles].sort(),
      }),
    })),
  );
  const payload = {
    inventory_version:
      CANONICAL_MODEL_IMPROVEMENT_METRIC_INVENTORY_VERSION,
    taxonomy_version:
      CANONICAL_MODEL_IMPROVEMENT_METRIC_TAXONOMY_VERSION,
    primary_metric: input.primary_metric,
    secondary_metrics: canonicalMetricIdentityOrder(input.secondary_metrics),
    protected_metrics: canonicalMetricIdentityOrder(input.protected_metrics),
    metrics,
  };
  return deepFreeze({
    ...payload,
    inventory_digest: canonicalModelImprovementDigest(payload),
  });
}

function splitUncertainty(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.length > 1
      ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        (values.length - 1)
      : 0;
  const margin = 1.96 * Math.sqrt(variance / values.length);
  return {
    mean: roundCanonical(mean),
    lower: roundCanonical(mean - margin),
    upper: roundCanonical(mean + margin),
  };
}

export function createCanonicalModelImprovementRowStability(input: {
  primary_metric: CanonicalModelImprovementMetricIdentity;
  cohort: string;
  rows: Omit<CanonicalModelImprovementStabilityRow, "row_digest">[];
}) {
  if (
    input.rows.length === 0 ||
    !unique(input.rows.map((row) => row.row_identity)) ||
    !unique(input.rows.map((row) => row.canonical_decision_identity)) ||
    input.rows.some(
      (row) =>
        row.primary_metric !== input.primary_metric ||
        row.cohort !== input.cohort ||
        !Number.isFinite(row.contribution) ||
        !row.row_identity.trim() ||
        !row.canonical_decision_identity.trim() ||
        !row.opportunity_set_identity.trim() ||
        !row.trading_day.trim() ||
        !row.ticker.trim() ||
        !row.regime.trim() ||
        !row.split_identity.trim() ||
        !shaPattern.test(row.verified_prediction_digest),
    )
  ) {
    throw new Error("canonical_row_stability_inventory_conflicting");
  }
  const decisionSplits = new Map<string, string>();
  for (const row of input.rows) {
    const prior = decisionSplits.get(row.canonical_decision_identity);
    if (prior && prior !== row.split_identity) {
      throw new Error("canonical_row_cross_split_overlap");
    }
    decisionSplits.set(row.canonical_decision_identity, row.split_identity);
  }
  const rows = canonicalStabilityRows(
    input.rows.map((row) => ({
      ...structuredClone(row),
      row_digest: canonicalModelImprovementDigest(row),
    })),
  );
  const splits = canonicalStabilitySplits(
    [...new Set(rows.map((row) => row.split_identity))].map((splitIdentity) => {
      const splitRows = rows.filter(
        (row) => row.split_identity === splitIdentity,
      );
      const interval = splitUncertainty(
        splitRows.map((row) => row.contribution),
      );
      const payload = {
        split_identity: splitIdentity,
        cohort: input.cohort,
        primary_metric: input.primary_metric,
        row_count: splitRows.length,
        effect_value: interval.mean,
        uncertainty: {
          lower: interval.lower,
          upper: interval.upper,
          method: "normal_95_from_verified_row_contributions_v1",
        },
        direction:
          interval.mean > 0
            ? ("favorable" as const)
            : interval.mean < 0
              ? ("unfavorable" as const)
              : ("mixed" as const),
        row_inventory_digest: canonicalModelImprovementDigest(
          splitRows.map((row) => row.row_digest).sort(),
        ),
      };
      return {
        ...payload,
        semantic_digest: canonicalModelImprovementDigest(payload),
      };
    }),
  );
  const payload = {
    stability_version: CANONICAL_MODEL_IMPROVEMENT_ROW_STABILITY_VERSION,
    primary_metric: input.primary_metric,
    cohort: input.cohort,
    rows,
    splits,
    identity_count: new Set(
      rows.map((row) => row.canonical_decision_identity),
    ).size,
    trading_day_count: new Set(rows.map((row) => row.trading_day)).size,
    ticker_count: new Set(rows.map((row) => row.ticker)).size,
    regime_count: new Set(rows.map((row) => row.regime)).size,
    stable_split_count: splits.filter(
      (split) => split.direction === "favorable",
    ).length,
  };
  return deepFreeze({
    ...payload,
    inventory_digest: canonicalModelImprovementDigest(payload),
  });
}

export function createCanonicalModelExperimentPlan(input: Omit<
  CanonicalModelExperimentPlan,
  "plan_version" | "plan_identity" | "semantic_digest"
>) {
  const normalized = canonicalPlan({
    plan_version: CANONICAL_MODEL_EXPERIMENT_PREREGISTRATION_VERSION,
    plan_identity: "",
    ...structuredClone(input),
    semantic_digest: "",
  })!;
  const identityPayload = {
    ...normalized,
    plan_identity: undefined,
    semantic_digest: undefined,
    model_transition_digest: modelTransitionDigest({
      baseline: normalized.baseline_versions,
      candidate: normalized.candidate_versions,
    }),
  };
  const planIdentity =
    `canonical-model-experiment-plan:${canonicalModelImprovementDigest(
      identityPayload,
    )}`;
  const payload = {
    ...normalized,
    plan_identity: planIdentity,
  };
  delete (payload as { semantic_digest?: string }).semantic_digest;
  return deepFreeze({
    ...payload,
    semantic_digest: canonicalModelImprovementDigest(payload),
  });
}

export function createCanonicalModelImprovementTrustedPost(input: {
  trusted_input_identity: string;
  payload: CanonicalModelImprovementTrustedPayload;
}) {
  const payload = canonicalTrustedPayload(input.payload);
  const postPayload = {
    post_version: CANONICAL_MODEL_IMPROVEMENT_TRUSTED_POST_VERSION,
    trusted_input_identity: input.trusted_input_identity,
    payload,
  };
  return deepFreeze({
    ...postPayload,
    semantic_digest: canonicalModelImprovementDigest(postPayload),
  });
}

export function createCanonicalModelImprovementTrustedRegistry(
  posts: CanonicalModelImprovementTrustedPost[],
) {
  const ordered = [...posts]
    .map((post) => structuredClone(post))
    .sort((first, second) =>
      first.trusted_input_identity.localeCompare(second.trusted_input_identity),
    );
  const rootPayload = {
    registry_version:
      CANONICAL_MODEL_IMPROVEMENT_TRUSTED_REGISTRY_VERSION,
    posts: ordered.map((post) => ({
      trusted_input_identity: post.trusted_input_identity,
      semantic_digest: post.semantic_digest,
    })),
  };
  return deepFreeze({
    registry_version:
      CANONICAL_MODEL_IMPROVEMENT_TRUSTED_REGISTRY_VERSION,
    posts: ordered,
    root_digest: canonicalModelImprovementDigest(rootPayload),
  });
}

export function createCanonicalModelImprovementRegistryAuthorityManifest(
  input: Omit<
    CanonicalModelImprovementRegistryAuthorityManifest,
    "manifest_version" | "manifest_digest"
  >,
) {
  const payload = {
    manifest_version:
      CANONICAL_MODEL_IMPROVEMENT_REGISTRY_MANIFEST_VERSION,
    ...structuredClone(input),
    registry_root_digests: [...input.registry_root_digests].sort(),
  };
  return deepFreeze({
    ...payload,
    manifest_digest: canonicalModelImprovementDigest(payload),
  });
}

export function createCanonicalModelImprovementRegistryAuthority(
  manifest: CanonicalModelImprovementRegistryAuthorityManifest,
) {
  const expected = createCanonicalModelImprovementRegistryAuthorityManifest({
    authority_identity: manifest.authority_identity,
    registry_root_digests: [...manifest.registry_root_digests].sort(),
    feature_context_registry_root_digest:
      manifest.feature_context_registry_root_digest,
    training_input_registry_root_digest:
      manifest.training_input_registry_root_digest,
    upstream_verifier_version: manifest.upstream_verifier_version,
  });
  if (
    !exact(expected, manifest) ||
    manifest.manifest_digest !==
      CANONICAL_MODEL_IMPROVEMENT_FROZEN_REGISTRY_MANIFEST_DIGEST
  ) {
    throw new Error("proposal_registry_manifest_not_externally_authorized");
  }
  const authority = deepFreeze({
    authority_version:
      CANONICAL_MODEL_IMPROVEMENT_REGISTRY_AUTHORITY_VERSION,
    authority_identity: manifest.authority_identity,
    frozen_manifest_digest: manifest.manifest_digest,
    allowed_registry_root_digests: [...manifest.registry_root_digests].sort(),
    expected_feature_context_registry_root_digest:
      manifest.feature_context_registry_root_digest,
    expected_training_input_registry_root_digest:
      manifest.training_input_registry_root_digest,
    upstream_verifier_version: manifest.upstream_verifier_version,
  });
  recognizedRegistryAuthorities.add(authority);
  return authority;
}

function failure(
  status: CanonicalModelImprovementResult["status"],
  reasonCodes: string[],
): CanonicalModelImprovementResult {
  return deepFreeze({
    ...safety,
    status,
    proposal: null,
    reason_codes: uniqueSorted(reasonCodes),
  });
}

function validateRegistry(
  boundary: CanonicalModelImprovementTrustBoundary,
) {
  const reasons: string[] = [];
  const authority = boundary.registry_authority;
  if (
    boundary.trust_source !==
      "version_controlled_synthetic_proposal_registry" ||
    boundary.registry.registry_version !==
      CANONICAL_MODEL_IMPROVEMENT_TRUSTED_REGISTRY_VERSION ||
    !recognizedRegistryAuthorities.has(authority) ||
    authority.authority_version !==
      CANONICAL_MODEL_IMPROVEMENT_REGISTRY_AUTHORITY_VERSION ||
    authority.upstream_verifier_version !==
      CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION ||
    authority.frozen_manifest_digest !==
      CANONICAL_MODEL_IMPROVEMENT_FROZEN_REGISTRY_MANIFEST_DIGEST ||
    authority.allowed_registry_root_digests.length === 0 ||
    !unique(authority.allowed_registry_root_digests) ||
    !authority.allowed_registry_root_digests.every((root) =>
      shaPattern.test(root)
    ) ||
    !shaPattern.test(
      authority.expected_feature_context_registry_root_digest,
    ) ||
    !shaPattern.test(authority.expected_training_input_registry_root_digest) ||
    !authority.allowed_registry_root_digests.includes(
      boundary.registry.root_digest,
    )
  ) {
    reasons.push("external_proposal_registry_authority_conflicting");
  }
  const identities = boundary.registry.posts.map(
    (post) => post.trusted_input_identity,
  );
  if (!unique(identities)) {
    reasons.push("duplicate_trusted_proposal_post_identity");
  }
  for (const post of boundary.registry.posts) {
    const expected = createCanonicalModelImprovementTrustedPost({
      trusted_input_identity: post.trusted_input_identity,
      payload: post.payload,
    });
    if (!exact(post, expected)) {
      reasons.push("trusted_proposal_post_conflicting");
    }
  }
  const expectedRegistry = createCanonicalModelImprovementTrustedRegistry(
    boundary.registry.posts,
  );
  if (expectedRegistry.root_digest !== boundary.registry.root_digest) {
    reasons.push("trusted_proposal_registry_digest_conflicting");
  }
  reasons.push(
    ...verifyCanonicalModelImprovementRegistryIdentityUniqueness(
      boundary.registry.posts,
    ),
  );
  return uniqueSorted(reasons);
}

export function verifyCanonicalModelImprovementRegistryIdentityUniqueness(
  posts: CanonicalModelImprovementTrustedPost[],
) {
  const proposalBindings = new Map<
    string,
    { semantic_digest: string; post_identity: string }
  >();
  const experimentBindings = new Map<
    string,
    { semantic_digest: string; post_identity: string }
  >();
  const reasons: string[] = [];
  for (const post of posts) {
    for (const proposal of post.payload.proposal_candidates) {
      const prior = proposalBindings.get(proposal.proposal_identity);
      if (
        prior !== undefined &&
        prior.post_identity !== post.trusted_input_identity
      ) {
        reasons.push(
          prior.semantic_digest === proposal.semantic_digest
            ? "duplicate_proposal_identity_across_registry"
            : "proposal_identity_semantic_collision_across_registry",
        );
      }
      proposalBindings.set(proposal.proposal_identity, {
        semantic_digest: proposal.semantic_digest,
        post_identity: post.trusted_input_identity,
      });
    }
    const plan = post.payload.experiment_plan;
    if (plan) {
      const prior = experimentBindings.get(plan.plan_identity);
      if (
        prior !== undefined &&
        prior.post_identity !== post.trusted_input_identity
      ) {
        reasons.push(
          prior.semantic_digest === plan.semantic_digest
            ? "duplicate_experiment_identity_across_registry"
            : "experiment_identity_semantic_collision_across_registry",
        );
      }
      experimentBindings.set(plan.plan_identity, {
        semantic_digest: plan.semantic_digest,
        post_identity: post.trusted_input_identity,
      });
    }
  }
  return uniqueSorted(reasons);
}

export function validateEvidence(
  evidence: CanonicalModelImprovementEvidenceBundle,
) {
  const reasons: string[] = [];
  const sections = [
    evidence.quality_metrics,
    evidence.opportunity_sets,
    evidence.shadow_evaluation,
    evidence.offline_learning,
    evidence.explanation_cohort,
  ];
  for (const section of sections) {
    if (
      !shaPattern.test(section.evidence_digest) ||
      evidenceSectionDigest(section) !== section.evidence_digest
    ) {
      reasons.push("proposal_evidence_section_digest_conflicting");
    }
  }
  if (
    evidence.evidence_root_version !==
      CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_ROOT_VERSION ||
    !shaPattern.test(evidence.evidence_root_digest) ||
    canonicalModelImprovementDigest(evidenceRootPayload(evidence)) !==
      evidence.evidence_root_digest
  ) {
    reasons.push("proposal_evidence_root_conflicting");
  }
  const quality = evidence.quality_metrics;
  if (
    quality.metrics_policy_version !==
      CANONICAL_QUALITY_METRICS_POLICY_VERSION ||
    quality.comparison_version !==
      CANONICAL_QUALITY_VERSION_COMPARISON_VERSION ||
    quality.comparability_status !== "comparable" ||
    !quality.quality_eligible ||
    ![
      quality.baseline_scorecard_digest,
      quality.candidate_scorecard_digest,
      quality.comparison_digest,
      quality.canonical_identity_inventory_digest,
      quality.verified_denominator_digest,
      quality.coverage_inventory_digest,
    ].every((digest) => shaPattern.test(digest)) ||
    ![
      quality.incomplete_rate,
      quality.ambiguous_rate,
      quality.conflicting_rate,
    ].every(finiteRate)
  ) {
    reasons.push("quality_metrics_evidence_conflicting");
  }
  if (
    !quality.cohort.trim() ||
    quality.period.start >= quality.period.end ||
    !unique(quality.trading_days) ||
    !unique(quality.tickers) ||
    !unique(quality.regimes) ||
    quality.trading_days.length !== quality.trading_day_count ||
    quality.tickers.length !== quality.ticker_count ||
    quality.regimes.length !== quality.regime_count ||
    canonicalModelImprovementDigest(
      qualityCoverageInventoryPayload(quality),
    ) !== quality.coverage_inventory_digest
  ) {
    reasons.push("quality_coverage_inventory_conflicting");
  }
  if (
    !unique(quality.protected_metrics.map((metric) => metric.metric)) ||
    quality.protected_metrics.some(
      (metric) =>
        !Number.isFinite(metric.delta) ||
        !Number.isFinite(metric.non_inferiority_floor),
    )
  ) {
    reasons.push("protected_metric_evidence_conflicting");
  }
  const rebuiltMetricInventory = createCanonicalModelImprovementMetricInventory({
    primary_metric: quality.metric_inventory.primary_metric,
    secondary_metrics: quality.metric_inventory.secondary_metrics,
    protected_metrics: quality.metric_inventory.protected_metrics,
    metrics: quality.metric_inventory.metrics.map((metric) => {
      const copy = structuredClone(metric) as Omit<
        CanonicalModelImprovementMetricEvidence,
        "semantic_digest"
      > & { semantic_digest?: string };
      delete copy.semantic_digest;
      return copy;
    }),
  });
  const metricRoles = new Map(
    quality.metric_inventory.metrics.map((metric) => [
      metric.metric_identity,
      metric.roles,
    ]),
  );
  const metricSet = quality.metric_inventory.metrics.map(
    (metric) => metric.metric_identity,
  );
  if (
    !exact(rebuiltMetricInventory, quality.metric_inventory) ||
    !unique(metricSet) ||
    !unique(quality.metric_inventory.secondary_metrics) ||
    !unique(quality.metric_inventory.protected_metrics) ||
    quality.metric_inventory.secondary_metrics.includes(
      quality.metric_inventory.primary_metric,
    ) ||
    !CANONICAL_MODEL_IMPROVEMENT_METRICS.includes(
      quality.metric_inventory.primary_metric,
    ) ||
    !exact(
      metricSet.slice().sort(),
      uniqueSorted([
        quality.metric_inventory.primary_metric,
        ...quality.metric_inventory.secondary_metrics,
        ...quality.metric_inventory.protected_metrics,
      ]),
    ) ||
    metricRoles.get(quality.metric_inventory.primary_metric)?.includes(
      "primary",
    ) !== true ||
    quality.metric_inventory.secondary_metrics.some(
      (metric) => !metricRoles.get(metric)?.includes("secondary"),
    ) ||
    quality.metric_inventory.protected_metrics.some(
      (metric) => !metricRoles.get(metric)?.includes("protected"),
    ) ||
    quality.metric_inventory.metrics.some(
      (metric) =>
        !unique(metric.roles) ||
        metric.metric_version !== CANONICAL_QUALITY_METRICS_POLICY_VERSION ||
        metric.denominator_digest !== quality.verified_denominator_digest ||
        metric.cohort !== quality.cohort ||
        !exact(metric.period, quality.period) ||
        metric.verified_result_digest !== quality.comparison_digest ||
        metric.status !== "measurable" ||
        !Number.isFinite(metric.value) ||
        !Number.isFinite(metric.delta),
    )
  ) {
    reasons.push("canonical_metric_inventory_conflicting");
  }
  const opportunity = evidence.opportunity_sets;
  if (
    opportunity.contract_version !==
      CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION ||
    !unique(opportunity.opportunity_set_identities) ||
    !unique(opportunity.opportunity_set_digests) ||
    opportunity.opportunity_set_identities.length !==
      opportunity.opportunity_set_digests.length ||
    opportunity.expected_candidate_count < 0 ||
    opportunity.observed_candidate_count < 0 ||
    opportunity.evaluated_candidate_count < 0 ||
    opportunity.observed_candidate_count >
      opportunity.expected_candidate_count ||
    opportunity.evaluated_candidate_count >
      opportunity.observed_candidate_count
  ) {
    reasons.push("opportunity_set_evidence_conflicting");
  }
  const shadow = evidence.shadow_evaluation;
  if (
    shadow.evaluation_version !==
      CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION ||
    !["evaluable", "probability_semantics_missing"].includes(shadow.status) ||
    ![
      shadow.pair_digest,
      shadow.evaluation_digest,
    ].every((digest) => shaPattern.test(digest)) ||
    !validModelVersionTuple(shadow.baseline_versions) ||
    !validModelVersionTuple(shadow.candidate_versions)
  ) {
    reasons.push("shadow_evaluation_evidence_conflicting");
  }
  const learning = evidence.offline_learning;
  if (
    learning.engine_version !== CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION ||
    learning.status !== "trainable" ||
    ![
      learning.result_digest,
      learning.dataset_digest,
      learning.split_digest,
      learning.model_artifact_digest,
      learning.shadow_binding_digest,
      learning.feature_context_registry_root_digest,
      learning.training_input_registry_root_digest,
    ].every((digest) => shaPattern.test(digest))
  ) {
    reasons.push("offline_learning_evidence_conflicting");
  }
  const stability = learning.row_level_stability;
  const rebuiltStability = createCanonicalModelImprovementRowStability({
    primary_metric: stability.primary_metric,
    cohort: stability.cohort,
    rows: stability.rows.map((row) => {
      const copy = structuredClone(row) as Omit<
        CanonicalModelImprovementStabilityRow,
        "row_digest"
      > & { row_digest?: string };
      delete copy.row_digest;
      return copy;
    }),
  });
  const rowIdentities = stability.rows.map((row) => row.row_identity);
  const decisionSplits = new Map<string, string>();
  let crossSplitOverlap = false;
  for (const row of stability.rows) {
    const prior = decisionSplits.get(row.canonical_decision_identity);
    if (prior && prior !== row.split_identity) crossSplitOverlap = true;
    decisionSplits.set(row.canonical_decision_identity, row.split_identity);
  }
  if (
    !exact(rebuiltStability, stability) ||
    stability.primary_metric !== quality.metric_inventory.primary_metric ||
    stability.cohort !== quality.cohort ||
    !unique(rowIdentities) ||
    crossSplitOverlap ||
    stability.splits.length !== learning.walk_forward_split_count ||
    stability.stable_split_count !== learning.stable_split_count ||
    stability.rows.length !== learning.out_of_sample_prediction_count / 2 ||
    stability.rows.some(
      (row) =>
        row.primary_metric !== stability.primary_metric ||
        row.cohort !== stability.cohort ||
        !row.canonical_decision_identity.trim() ||
        !row.opportunity_set_identity.trim() ||
        !row.trading_day.trim() ||
        !row.ticker.trim() ||
        !row.regime.trim() ||
        !Number.isFinite(row.contribution) ||
        !shaPattern.test(row.verified_prediction_digest),
    )
  ) {
    reasons.push("canonical_row_level_stability_conflicting");
  }
  const explanation = evidence.explanation_cohort;
  if (
    explanation.contract_version !==
      CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION ||
    explanation.failure_taxonomy_version !==
      CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION ||
    !shaPattern.test(explanation.cohort_digest) ||
    !unique(explanation.explanation_digests) ||
    !unique(explanation.patterns.map((pattern) => pattern.pattern_identity))
  ) {
    reasons.push("explanation_cohort_evidence_conflicting");
  }
  for (const pattern of explanation.patterns) {
    const expected = canonicalModelImprovementDigest(
      payloadWithoutDigest(pattern, "evidence_digest"),
    );
    if (
      !shaPattern.test(pattern.evidence_digest) ||
      expected !== pattern.evidence_digest ||
      !unique(pattern.split_identities) ||
      !unique(pattern.cohorts) ||
      !unique(pattern.regimes) ||
      pattern.occurrence_count < 0 ||
      pattern.canonical_identity_count < 0 ||
      !Number.isFinite(pattern.effect_size)
    ) {
      reasons.push("explanation_pattern_evidence_conflicting");
    }
  }
  return uniqueSorted(reasons);
}

function validateEvidenceProjection(input: {
  evidence: CanonicalModelImprovementEvidenceBundle;
  sources: CanonicalModelImprovementUpstreamSources;
}) {
  const verified = verifyAndProjectCanonicalModelImprovementUpstreams(
    input.sources,
  );
  if (verified.status !== "verified") {
    return verified.reason_codes;
  }
  const projection = verified.projection;
  const evidence = input.evidence;
  const reasons: string[] = [];
  const protectedProjection = projection.quality.protected_metrics.map(
    (metric) => ({
      metric: metric.metric,
      delta: metric.delta,
      status: metric.status,
    }),
  );
  const protectedEvidence = evidence.quality_metrics.protected_metrics.map(
    (metric) => ({
      metric: metric.metric,
      delta: metric.delta,
      status: metric.status,
    }),
  );
  if (
    evidence.upstream_verification.verifier_version !==
      projection.verifier_version ||
    !exact(
      evidence.upstream_verification.source_contract_versions,
      projection.source_contract_versions,
    ) ||
    !exact(
      evidence.upstream_verification.namespace_digests,
      projection.namespace_digests,
    ) ||
    evidence.upstream_verification.temporal_evidence_digest !==
      projection.temporal_evidence_digest
  ) {
    reasons.push("canonical_upstream_verifier_binding_conflicting");
  }
  if (
    evidence.quality_metrics.baseline_scorecard_digest !==
      projection.quality.baseline_scorecard_digest ||
    evidence.quality_metrics.candidate_scorecard_digest !==
      projection.quality.candidate_scorecard_digest ||
    evidence.quality_metrics.comparison_digest !==
      projection.quality.comparison_digest ||
    evidence.quality_metrics.comparability_status !==
      projection.quality.comparability_status ||
    evidence.quality_metrics.quality_eligible !==
      (projection.quality.comparability_status === "comparable") ||
    evidence.quality_metrics.classification !==
      projection.quality.classification ||
    evidence.quality_metrics.cohort !== projection.quality.cohort ||
    !exact(evidence.quality_metrics.period, projection.quality.period) ||
    evidence.quality_metrics.identity_count !==
      projection.quality.identity_count ||
    evidence.quality_metrics.verified_denominator_digest !==
      projection.quality.denominator_digest ||
    evidence.quality_metrics.cost_adjusted_expectancy_delta_r !==
      projection.quality.cost_adjusted_expectancy_delta_r ||
    evidence.quality_metrics.calibration_delta !==
      projection.quality.calibration_delta ||
    evidence.quality_metrics.incomplete_rate !==
      projection.quality.incomplete_rate ||
    evidence.quality_metrics.ambiguous_rate !==
      projection.quality.ambiguous_rate ||
    evidence.quality_metrics.conflicting_rate !==
      projection.quality.conflicting_rate ||
    evidence.quality_metrics.uncertainty_digest !==
      projection.quality.uncertainty_digest ||
    !exact(protectedEvidence, protectedProjection) ||
    !exact(
      evidence.quality_metrics.metric_inventory.metrics.map((metric) => ({
        metric: metric.metric_identity,
        value: metric.value,
        delta: metric.delta,
        status: metric.status,
        uncertainty_digest: metric.uncertainty_digest,
      })).sort((first, second) => first.metric.localeCompare(second.metric)),
      [...projection.quality.metric_results].sort((first, second) =>
        first.metric.localeCompare(second.metric)
      ),
    )
  ) {
    reasons.push("action_664_verified_projection_mismatch");
  }
  if (
    !exact(
      evidence.opportunity_sets.opportunity_set_identities,
      projection.opportunity_sets.identities,
    ) ||
    !exact(
      evidence.opportunity_sets.opportunity_set_digests,
      projection.opportunity_sets.digests,
    ) ||
    evidence.opportunity_sets.complete_membership !==
      projection.opportunity_sets.complete_membership ||
    evidence.opportunity_sets.complete_outcome_lineage !==
      projection.opportunity_sets.complete_outcome_lineage ||
    evidence.opportunity_sets.point_in_time_safe !==
      projection.opportunity_sets.point_in_time_safe ||
    evidence.opportunity_sets.expected_candidate_count !==
      projection.opportunity_sets.expected_candidate_count ||
    evidence.opportunity_sets.observed_candidate_count !==
      projection.opportunity_sets.observed_candidate_count ||
    evidence.opportunity_sets.evaluated_candidate_count !==
      projection.opportunity_sets.evaluated_candidate_count
  ) {
    reasons.push("action_665_verified_projection_mismatch");
  }
  if (
    evidence.shadow_evaluation.evaluation_identity !==
      projection.shadow.evaluation_identity ||
    evidence.shadow_evaluation.pair_digest !== projection.shadow.pair_digest ||
    evidence.shadow_evaluation.evaluation_digest !==
      projection.shadow.evaluation_digest ||
    evidence.shadow_evaluation.status !== projection.shadow.status ||
    evidence.shadow_evaluation.reproducible !==
      projection.shadow.reproducible ||
    evidence.shadow_evaluation.out_of_sample !==
      projection.shadow.out_of_sample ||
    evidence.shadow_evaluation.probability_semantics !==
      projection.shadow.probability_semantics
  ) {
    reasons.push("action_666_shadow_verified_projection_mismatch");
  }
  if (
    evidence.offline_learning.status !== projection.learning.status ||
    evidence.offline_learning.result_digest !==
      projection.learning.result_digest ||
    evidence.offline_learning.dataset_digest !==
      projection.learning.dataset_digest ||
    evidence.offline_learning.split_digest !==
      projection.learning.split_digest ||
    evidence.offline_learning.model_artifact_digest !==
      projection.learning.model_artifact_digest ||
    evidence.offline_learning.shadow_binding_digest !==
      projection.learning.shadow_binding_digest ||
    evidence.offline_learning.feature_context_registry_root_digest !==
      projection.learning.feature_context_registry_root_digest ||
    evidence.offline_learning.training_input_registry_root_digest !==
      projection.learning.training_input_registry_root_digest ||
    evidence.offline_learning.walk_forward_split_count !==
      projection.learning.walk_forward_split_count ||
    evidence.offline_learning.out_of_sample_prediction_count !==
      projection.learning.out_of_sample_prediction_count ||
    evidence.offline_learning.reproducible !==
      projection.learning.reproducible ||
    evidence.offline_learning.frozen_result !==
      projection.learning.frozen_result ||
    evidence.offline_learning.in_sample_only !==
      projection.learning.in_sample_only ||
    !exact(
      evidence.offline_learning.row_level_stability.rows.map((row) => ({
        prediction_identity: row.row_identity,
        canonical_decision_identity: row.canonical_decision_identity,
        opportunity_set_identity: row.opportunity_set_identity,
        trading_day: row.trading_day,
        ticker: row.ticker,
        regime: row.regime,
        split_identity: row.split_identity,
        cohort: row.cohort,
        contribution: row.contribution,
        verified_prediction_digest: row.verified_prediction_digest,
      })),
      projection.learning.stability_rows,
    )
  ) {
    reasons.push("action_666_learning_verified_projection_mismatch");
  }
  if (
    !exact(
      evidence.explanation_cohort.explanation_digests,
      projection.explanations.digests,
    ) ||
    evidence.explanation_cohort.conflicting_explanation_count !==
      projection.explanations.conflicting_count ||
    evidence.explanation_cohort.point_in_time_safe !==
      projection.explanations.point_in_time_safe
  ) {
    reasons.push("action_666_explanation_verified_projection_mismatch");
  }
  return uniqueSorted(reasons);
}

function validateCandidate(
  candidate: CanonicalModelImprovementCandidate,
  evidence: CanonicalModelImprovementEvidenceBundle,
) {
  const reasons: string[] = [];
  if (
    !CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_TYPES.includes(
      candidate.proposal_type,
    ) ||
    !candidate.title.trim() ||
    !unique(
      candidate.change_set.map(
        (change) =>
          `${change.target_namespace}:${change.target_identifier}:${change.operation}`,
      ),
    ) ||
    canonicalModelImprovementDigest(
      canonicalChangeOrder(candidate.change_set),
    ) !== candidate.change_set_digest ||
    candidate.target_feature_context_registry_root_digest !==
      evidence.offline_learning.feature_context_registry_root_digest
  ) {
    reasons.push("proposal_candidate_contract_conflicting");
  }
  const expectedIdentity =
    `canonical-model-improvement-proposal:${canonicalModelImprovementDigest(
      proposalIdentityPayload({
        proposal_type: candidate.proposal_type,
        title: candidate.title,
        change_set_digest: candidate.change_set_digest,
        evidence_root_digest: evidence.evidence_root_digest,
      }),
    )}`;
  if (candidate.proposal_identity !== expectedIdentity) {
    reasons.push("proposal_identity_conflicting");
  }
  const candidatePayload = payloadWithoutDigest(
    candidate as unknown as Record<string, unknown>,
    "semantic_digest",
  );
  if (
    !shaPattern.test(candidate.semantic_digest) ||
    canonicalModelImprovementDigest(candidatePayload) !==
      candidate.semantic_digest
  ) {
    reasons.push("proposal_candidate_digest_conflicting");
  }
  const evidenceIdentities = candidate.evidence_items.map(
    (item) => `${item.evidence_class}:${item.evidence_code}`,
  );
  if (!unique(evidenceIdentities)) {
    reasons.push("duplicate_proposal_evidence_identity");
  }
  for (const item of candidate.evidence_items) {
    if (
      !CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_CLASSES.includes(
        item.evidence_class,
      ) ||
      item.causal_claimed !== false ||
      item.evidence_class === "approved_experiment_candidate" ||
      item.canonical_status_authority !==
        (item.evidence_class !== "research_hypothesis") ||
      canonicalModelImprovementDigest(
        payloadWithoutDigest(
          item as unknown as Record<string, unknown>,
          "evidence_digest",
        ),
      ) !== item.evidence_digest
    ) {
      reasons.push("proposal_evidence_class_boundary_conflicting");
    }
    reasons.push(
      ...verifyCanonicalModelImprovementEvidenceSourceNamespaces({
        item,
        evidence,
      }),
    );
  }
  return uniqueSorted(reasons);
}

export function verifyCanonicalModelImprovementEvidenceSourceNamespaces(input: {
  item: CanonicalModelImprovementEvidenceItem;
  evidence: CanonicalModelImprovementEvidenceBundle;
  experiment_plan_digest?: string;
}) {
  const sourceIdentities = input.item.sources.map(
    (source) => `${source.namespace}:${source.digest}`,
  );
  const requiredNamespaces: CanonicalModelImprovementEvidenceNamespace[] =
    input.item.evidence_class === "observed_pattern"
      ? ["explanation_cohort"]
      : input.item.evidence_class === "predictive_association" ||
          input.item.evidence_class === "ablation_evidence"
        ? ["offline_learning"]
        : input.item.evidence_class === "counterfactual_sensitivity"
          ? ["shadow_evaluation"]
          : input.item.evidence_class === "research_hypothesis"
            ? ["evidence_root"]
            : ["evidence_root", "experiment_plan"];
  const expectedDigest = (
    namespace: CanonicalModelImprovementEvidenceNamespace,
  ) =>
    namespace === "evidence_root"
      ? input.evidence.evidence_root_digest
      : namespace === "experiment_plan"
        ? input.experiment_plan_digest ?? null
        : input.evidence.upstream_verification.namespace_digests[namespace];
  return !unique(sourceIdentities) ||
    input.item.sources.length !== requiredNamespaces.length ||
    requiredNamespaces.some(
      (namespace) =>
        !input.item.sources.some(
          (source) =>
            source.namespace === namespace &&
            source.digest === expectedDigest(namespace),
        ),
    ) ||
    input.item.sources.some(
      (source) =>
        !CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_NAMESPACES.includes(
          source.namespace,
        ) ||
        !shaPattern.test(source.digest) ||
        source.digest !== expectedDigest(source.namespace),
    )
    ? ["proposal_evidence_source_namespace_conflicting"]
    : [];
}

export function validateMultipleTesting(value: CanonicalMultipleTestingEvidence) {
  const reasons: string[] = [];
  let expected: CanonicalMultipleTestingEvidence | null = null;
  try {
    expected = createCanonicalMultipleTestingEvidence({
      correction_method: value.correction_method,
      family_identity: value.family_identity,
      preregistration_identity: value.preregistration_identity,
      hypotheses: value.hypotheses,
    });
  } catch {
    expected = null;
  }
  if (
    value.policy_version !==
      CANONICAL_MODEL_IMPROVEMENT_MULTIPLE_TESTING_POLICY_VERSION ||
    value.hypotheses.length < 1 ||
    !unique(value.hypotheses.map((item) => item.hypothesis_identity)) ||
    value.hypotheses.some(
      (item) =>
        !finiteRate(item.raw_p_value) ||
        item.family_identity !== value.family_identity ||
        item.preregistration_identity !== value.preregistration_identity ||
        !CANONICAL_MODEL_IMPROVEMENT_METRICS.includes(item.metric),
    ) ||
    !expected ||
    !exact(expected, value)
  ) {
    reasons.push("multiple_testing_evidence_conflicting");
  }
  return reasons;
}

function adjustedPrimaryPValue(
  multiple: CanonicalMultipleTestingEvidence,
  primaryMetric: CanonicalModelImprovementMetricIdentity,
) {
  const hypothesis = multiple.hypotheses.find(
    (item) => item.metric === primaryMetric,
  );
  return hypothesis
    ? multiple.adjusted_results.find(
        (item) => item.hypothesis_identity === hypothesis.hypothesis_identity,
      )?.adjusted_p_value ?? null
    : null;
}

export function validatePlan(input: {
  plan: CanonicalModelExperimentPlan;
  candidate: CanonicalModelImprovementCandidate;
  evidence: CanonicalModelImprovementEvidenceBundle;
  multipleTesting: CanonicalMultipleTestingEvidence;
}) {
  const planInput = Object.fromEntries(
    Object.entries(input.plan).filter(
      ([key]) =>
        key !== "plan_version" &&
        key !== "plan_identity" &&
        key !== "semantic_digest",
    ),
  ) as Omit<
    CanonicalModelExperimentPlan,
    "plan_version" | "plan_identity" | "semantic_digest"
  >;
  const expected = createCanonicalModelExperimentPlan(planInput);
  const reasons: string[] = [];
  if (!exact(input.plan, expected)) {
    reasons.push("experiment_plan_digest_or_identity_conflicting");
  }
  if (
    input.plan.proposal_identity !== input.candidate.proposal_identity ||
    input.plan.exact_change_set_digest !==
      input.candidate.change_set_digest ||
    input.plan.evidence_root_digest !==
      input.evidence.evidence_root_digest ||
    input.plan.multiple_testing_evidence_digest !==
      input.multipleTesting.evidence_digest ||
    input.plan.metric_inventory_digest !==
      input.evidence.quality_metrics.metric_inventory.inventory_digest ||
    input.plan.hypothesis_inventory_digest !==
      input.multipleTesting.hypothesis_inventory_digest ||
    input.plan.multiple_testing_family_identity !==
      input.multipleTesting.family_identity ||
    input.plan.hypothesis_preregistration_identity !==
      input.multipleTesting.preregistration_identity ||
    input.plan.cohort !== input.evidence.quality_metrics.cohort ||
    !exact(input.plan.period, input.evidence.quality_metrics.period) ||
    !exact(
      input.plan.baseline_versions,
      input.evidence.shadow_evaluation.baseline_versions,
    ) ||
    !exact(
      input.plan.candidate_versions,
      input.evidence.shadow_evaluation.candidate_versions,
    ) ||
    !input.plan.preregistered ||
    !input.plan.no_automatic_promotion ||
    !input.plan.rollback_metadata.kill_switch_owner.trim() ||
    !exact(
      input.plan.rollback_metadata.previous_versions,
      input.plan.baseline_versions,
    ) ||
    !exact(
      input.plan.rollback_metadata.candidate_versions,
      input.plan.candidate_versions,
    )
  ) {
    reasons.push("experiment_plan_binding_conflicting");
  }
  const qualityProtectedMetrics = new Map(
    input.evidence.quality_metrics.protected_metrics.map((metric) => [
      metric.metric,
      metric,
    ]),
  );
  const inventory = input.evidence.quality_metrics.metric_inventory;
  if (
    input.plan.primary_metric !== inventory.primary_metric ||
    !unique(input.plan.secondary_metrics) ||
    !unique(input.plan.protected_metrics.map((metric) => metric.metric)) ||
    input.plan.secondary_metrics.includes(input.plan.primary_metric) ||
    !exact(
      canonicalMetricIdentityOrder(input.plan.secondary_metrics),
      inventory.secondary_metrics,
    ) ||
    !exact(
      canonicalMetricIdentityOrder(
        input.plan.protected_metrics.map((metric) => metric.metric as
          CanonicalModelImprovementMetricIdentity),
      ),
      inventory.protected_metrics,
    ) ||
    input.plan.protected_metrics.some((metric) => {
      const evidenceMetric = qualityProtectedMetrics.get(metric.metric);
      return (
        !evidenceMetric ||
        evidenceMetric.non_inferiority_floor !==
          metric.non_inferiority_floor
      );
    })
  ) {
    reasons.push("experiment_metric_set_binding_conflicting");
  }
  const stability = input.evidence.offline_learning.row_level_stability;
  if (
    stability.primary_metric !== input.plan.primary_metric ||
    stability.cohort !== input.plan.cohort ||
    stability.splits.some(
      (split) =>
        split.primary_metric !== input.plan.primary_metric ||
        split.cohort !== input.plan.cohort,
    )
  ) {
    reasons.push("experiment_row_stability_binding_conflicting");
  }
  if (
    input.plan.period.start >= input.plan.period.end ||
    input.plan.validation_design.method !==
      "chronological_trading_day_walk_forward_with_holdout_v1" ||
    !input.plan.validation_design.holdout_locked ||
    !input.plan.validation_design.purge_and_embargo_required ||
    input.plan.sample_minimum.identities <
      canonicalModelImprovementPolicy.minimum_identities ||
    input.plan.sample_minimum.trading_days <
      canonicalModelImprovementPolicy.minimum_trading_days ||
    input.plan.sample_minimum.tickers <
      canonicalModelImprovementPolicy.minimum_tickers ||
    input.plan.sample_minimum.regimes <
      canonicalModelImprovementPolicy.minimum_regimes ||
    input.plan.stop_conditions.length === 0 ||
    input.plan.protected_metrics.length === 0
  ) {
    reasons.push("experiment_preregistration_incomplete");
  }
  return uniqueSorted(reasons);
}

export function deriveGateStatus(
  payload: CanonicalModelImprovementTrustedPayload,
  candidate: CanonicalModelImprovementCandidate,
) {
  const evidence = payload.evidence;
  const reasons: string[] = [];
  if (
    !evidence.opportunity_sets.point_in_time_safe ||
    !evidence.explanation_cohort.point_in_time_safe ||
    evidence.explanation_cohort.patterns.some(
      (pattern) => !pattern.point_in_time_safe,
    )
  ) {
    return {
      status: "not_point_in_time_safe" as const,
      reasonCodes: ["proposal_evidence_not_point_in_time_safe"],
    };
  }
  if (
    !evidence.shadow_evaluation.reproducible ||
    !evidence.offline_learning.reproducible ||
    !evidence.offline_learning.frozen_result
  ) {
    return {
      status: "non_reproducible" as const,
      reasonCodes: ["proposal_oos_evidence_non_reproducible"],
    };
  }
  if (
    !evidence.opportunity_sets.complete_membership ||
    !evidence.opportunity_sets.complete_outcome_lineage ||
    evidence.opportunity_sets.evaluated_candidate_count !==
      evidence.opportunity_sets.expected_candidate_count
  ) {
    return {
      status: "insufficient_evidence" as const,
      reasonCodes: ["complete_opportunity_or_outcome_lineage_missing"],
    };
  }
  const quality = evidence.quality_metrics;
  const stability = evidence.offline_learning.row_level_stability;
  if (
    quality.identity_count <
      canonicalModelImprovementPolicy.minimum_identities ||
    quality.trading_day_count <
      canonicalModelImprovementPolicy.minimum_trading_days ||
    quality.ticker_count < canonicalModelImprovementPolicy.minimum_tickers ||
    quality.regime_count < canonicalModelImprovementPolicy.minimum_regimes ||
    stability.identity_count <
      canonicalModelImprovementPolicy.minimum_identities ||
    stability.trading_day_count <
      canonicalModelImprovementPolicy.minimum_trading_days ||
    stability.ticker_count <
      canonicalModelImprovementPolicy.minimum_tickers ||
    stability.regime_count <
      canonicalModelImprovementPolicy.minimum_regimes
  ) {
    return {
      status: "insufficient_evidence" as const,
      reasonCodes: ["proposal_minimum_evidence_not_met"],
    };
  }
  if (
    evidence.offline_learning.walk_forward_split_count <
      canonicalModelImprovementPolicy.minimum_walk_forward_splits ||
    evidence.offline_learning.stable_split_count <
      canonicalModelImprovementPolicy.minimum_stable_splits ||
    evidence.offline_learning.stable_split_count /
      evidence.offline_learning.walk_forward_split_count <
      canonicalModelImprovementPolicy.minimum_effect_stability_ratio
  ) {
    reasons.push("effect_not_stable_across_walk_forward_splits");
  }
  if (evidence.offline_learning.in_sample_only) {
    reasons.push("in_sample_only_evidence_cannot_approve_experiment");
  }
  if (
    evidence.shadow_evaluation.probability_semantics !==
    "calibrated_probability"
  ) {
    reasons.push("probability_semantics_missing");
  }
  if (
    quality.classification === "regression" ||
    (candidate.proposal_type === "no_change"
      ? quality.cost_adjusted_expectancy_delta_r < 0
      : quality.cost_adjusted_expectancy_delta_r <= 0) ||
    quality.calibration_delta > 0
  ) {
    reasons.push(
      quality.classification === "regression"
        ? "quality_comparison_regression_blocks_experiment"
        : quality.calibration_delta > 0
        ? "calibration_regression_blocks_experiment"
        : "cost_adjusted_edge_not_positive",
    );
  }
  if (
    quality.protected_metrics.some(
      (metric) =>
        metric.status !== "measurable" ||
        metric.delta < metric.non_inferiority_floor,
    )
  ) {
    reasons.push("protected_metric_regression_blocks_experiment");
  }
  if (
    quality.incomplete_rate >
      canonicalModelImprovementPolicy.maximum_incomplete_rate ||
    quality.ambiguous_rate >
      canonicalModelImprovementPolicy.maximum_ambiguous_rate ||
    quality.conflicting_rate >
      canonicalModelImprovementPolicy.maximum_conflicting_rate
  ) {
    reasons.push("data_quality_rate_exceeds_policy");
  }
  const multiple = payload.multiple_testing;
  const adjustedPrimary = adjustedPrimaryPValue(
    multiple,
    quality.metric_inventory.primary_metric,
  );
  if (
    multiple.selection_risk !== "controlled" ||
    adjustedPrimary === null ||
    adjustedPrimary >
      canonicalModelImprovementPolicy.maximum_adjusted_primary_p_value
  ) {
    reasons.push("multiple_testing_or_selection_risk_uncontrolled");
  }
  if (candidate.proposal_type === "no_change") {
    if (
      quality.classification !== "non_inferior" ||
      quality.cost_adjusted_expectancy_delta_r < 0 ||
      quality.calibration_delta > 0 ||
      reasons.length > 0
    ) {
      return {
        status: "research_only" as const,
        reasonCodes: uniqueSorted([
          ...reasons,
          "verified_evidence_does_not_support_no_change",
        ]),
      };
    }
    return {
      status: "no_change" as const,
      reasonCodes: [
        "canonical_no_change_policy_all_quality_gates_passed",
      ],
    };
  }
  if (!payload.experiment_plan) {
    reasons.push("preregistered_experiment_plan_missing");
  }
  if (reasons.length > 0) {
    return {
      status: "research_only" as const,
      reasonCodes: uniqueSorted(reasons),
    };
  }
  return {
    status: "proposal_ready" as const,
    reasonCodes: ["all_experiment_candidate_gates_passed"],
  };
}

function buildFromPost(input: {
  post: CanonicalModelImprovementTrustedPost;
  registryRoot: string;
  registryAuthority: CanonicalModelImprovementRegistryAuthority;
  expectedFeatureContextRegistryRoot: string;
  expectedTrainingInputRegistryRoot: string;
  previousBindingLookup: CanonicalModelImprovementPreviousBindingLookup;
  counters: CanonicalModelImprovementExecutionCounters;
}): CanonicalModelImprovementResult {
  input.counters.validations += 1;
  const payload = input.post.payload;
  const reasons = [
    ...validateEvidenceProjection({
      evidence: payload.evidence,
      sources: payload.upstream_sources,
    }),
    ...validateEvidence(payload.evidence),
    ...validateMultipleTesting(payload.multiple_testing),
  ];
  if (
    payload.evidence.offline_learning.feature_context_registry_root_digest !==
      input.expectedFeatureContextRegistryRoot ||
    payload.evidence.offline_learning.training_input_registry_root_digest !==
      input.expectedTrainingInputRegistryRoot
  ) {
    reasons.push("external_learning_trust_root_conflicting");
  }
  const proposalIdentities = payload.proposal_candidates.map(
    (candidate) => candidate.proposal_identity,
  );
  if (
    payload.proposal_policy_version !==
      CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION ||
    payload.proposal_candidates.length !== 1
  ) {
    reasons.push("proposal_candidate_cardinality_conflicting");
  }
  if (!unique(proposalIdentities)) {
    reasons.push("duplicate_proposal_identity");
  }
  for (const candidate of payload.proposal_candidates) {
    reasons.push(...validateCandidate(candidate, payload.evidence));
  }
  const candidate = payload.proposal_candidates[0];
  if (
    candidate &&
    (candidate.proposal_type === "no_change"
      ? payload.no_change_policy_version !==
        CANONICAL_MODEL_IMPROVEMENT_NO_CHANGE_POLICY_VERSION
      : payload.no_change_policy_version !== null)
  ) {
    reasons.push("no_change_policy_binding_conflicting");
  }
  if (candidate) {
    const previous = input.previousBindingLookup.lookup_proposal_binding(
      candidate.proposal_identity,
    );
    if (previous && previous.semantic_digest !== candidate.semantic_digest) {
      reasons.push("previous_proposal_binding_semantic_conflict");
    }
  }
  if (candidate && payload.experiment_plan) {
    reasons.push(
      ...validatePlan({
        plan: payload.experiment_plan,
        candidate,
        evidence: payload.evidence,
        multipleTesting: payload.multiple_testing,
      }),
    );
    const previous = input.previousBindingLookup.lookup_experiment_binding(
      payload.experiment_plan.plan_identity,
    );
    if (
      previous &&
      previous.semantic_digest !== payload.experiment_plan.semantic_digest
    ) {
      reasons.push("previous_experiment_binding_semantic_conflict");
    }
  }
  if (
    payload.evidence.explanation_cohort.conflicting_explanation_count > 0
  ) {
    reasons.push("conflicting_explanation_evidence");
  }
  if (reasons.length > 0 || !candidate) {
    return failure("conflicting", reasons);
  }
  const gate = deriveGateStatus(payload, candidate);
  if (
    gate.status === "proposal_ready" &&
    !payload.experiment_plan
  ) {
    return failure("conflicting", [
      "proposal_ready_without_experiment_plan",
    ]);
  }
  const approvedEvidence =
    gate.status === "proposal_ready"
      ? [
          {
            evidence_class:
              "approved_experiment_candidate" as const,
            evidence_code: "preregistered_shadow_experiment_candidate",
            statement:
              "All versioned evidence and preregistration gates passed for an offline shadow experiment candidate; this is not permission to execute, promote, deploy, or change Ture.",
            sources: [
              {
                namespace: "evidence_root" as const,
                digest: payload.evidence.evidence_root_digest,
              },
              {
                namespace: "experiment_plan" as const,
                digest: payload.experiment_plan!.semantic_digest,
              },
            ],
            causal_claimed: false as const,
            canonical_status_authority: true,
            evidence_digest: "",
          },
        ].map((item) => ({
          ...item,
          evidence_digest: canonicalModelImprovementDigest({
            ...item,
            evidence_digest: undefined,
          }),
        }))
      : [];
  const evidenceItems = canonicalEvidenceOrder([
    ...candidate.evidence_items,
    ...approvedEvidence,
  ]);
  const proposalPayload = {
    proposal_version: CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION,
    policy_version: CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
    proposal_identity: candidate.proposal_identity,
    proposal_type: candidate.proposal_type,
    status: gate.status,
    evidence_root_digest: payload.evidence.evidence_root_digest,
    trusted_registry_root_digest: input.registryRoot,
    registry_authority_identity: input.registryAuthority.authority_identity,
    registry_authority_manifest_digest:
      input.registryAuthority.frozen_manifest_digest,
    candidate,
    experiment_plan: payload.experiment_plan,
    multiple_testing: payload.multiple_testing,
    no_change_policy_version:
      candidate.proposal_type === "no_change"
        ? CANONICAL_MODEL_IMPROVEMENT_NO_CHANGE_POLICY_VERSION
        : null,
    evidence_items: evidenceItems,
    reason_codes: gate.reasonCodes,
    proposal_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  input.counters.proposals_built += 1;
  const proposal = {
    ...proposalPayload,
    canonical_proposal_digest:
      canonicalModelImprovementDigest(proposalPayload),
  };
  return deepFreeze({
    ...safety,
    status: gate.status,
    proposal,
    reason_codes: gate.reasonCodes,
  });
}

export function createCanonicalModelImprovementEngine(input: {
  enabled?: boolean;
  kill_switch_engaged?: boolean;
  trust_boundary?: CanonicalModelImprovementTrustBoundary;
  previous_binding_lookup?: CanonicalModelImprovementPreviousBindingLookup;
  counters?: CanonicalModelImprovementExecutionCounters;
} = {}) {
  const counters = emptyExecutionCounters();
  let enabled = false;
  let killSwitchClear = false;
  try {
    if (!isRuntimeRecord(input)) {
      throw new Error("model_improvement_options_not_plain_object");
    }
    const enabledInput = ownDataValue(input, "enabled");
    const killSwitchInput = ownDataValue(input, "kill_switch_engaged");
    enabled = enabledInput.present && enabledInput.value === true;
    killSwitchClear =
      killSwitchInput.present && killSwitchInput.value === false;
  } catch {
    enabled = false;
    killSwitchClear = false;
  }
  if (!enabled || !killSwitchClear) {
    return publishCanonicalModelImprovementEngine(
      {
        enabled: false as const,
        status: !enabled
          ? ("disabled" as const)
          : ("kill_switch_engaged" as const),
        build: null,
      },
      counters,
      null,
    );
  }
  let boundarySnapshot: CanonicalModelImprovementTrustBoundary | null = null;
  let lookupSnapshot: CanonicalModelImprovementPreviousBindingLookup | null =
    null;
  let registryReasons: string[] = [];
  try {
    const countersInput = ownDataValue(input, "counters");
    if (countersInput.present) {
      if (!isExecutionCounterSnapshot(countersInput.value)) {
        throw new Error("execution_counters_conflicting");
      }
      Object.assign(counters, structuredClone(countersInput.value));
    }
    const boundaryInput = ownDataValue(input, "trust_boundary");
    const lookupInput = ownDataValue(input, "previous_binding_lookup");
    if (!boundaryInput.present || !boundaryInput.value) {
      registryReasons = ["trusted_proposal_boundary_missing"];
    } else if (!lookupInput.present || !lookupInput.value) {
      registryReasons = ["previous_binding_lookup_missing"];
    } else if (!hasCanonicalRuntimeSurface(boundaryInput.value)) {
      throw new Error("trusted_proposal_runtime_surface_conflicting");
    } else {
      const boundary =
        boundaryInput.value as CanonicalModelImprovementTrustBoundary;
      boundarySnapshot = deepFreeze({
        trust_source: structuredClone(boundary.trust_source),
        registry: structuredClone(boundary.registry),
        registry_authority: boundary.registry_authority,
      });
      lookupSnapshot = capturePreviousBindingLookup(lookupInput.value);
      registryReasons = validateRegistry(boundarySnapshot);
    }
  } catch {
    registryReasons = ["trusted_proposal_runtime_shape_conflicting"];
  }
  if (registryReasons.length > 0) {
    const conflictingBuild = () => failure("conflicting", registryReasons);
    return publishCanonicalModelImprovementEngine(
      {
        enabled: true as const,
        status: "conflicting" as const,
        build: conflictingBuild,
      },
      counters,
      conflictingBuild,
    );
  }
  if (!boundarySnapshot || !lookupSnapshot) {
    const conflictingBuild = () =>
      failure("conflicting", [
        "validated_model_improvement_snapshot_missing",
      ]);
    return publishCanonicalModelImprovementEngine(
      {
        enabled: true as const,
        status: "conflicting" as const,
        build: conflictingBuild,
      },
      counters,
      conflictingBuild,
    );
  }
  const build = (
    requestValue: CanonicalModelImprovementRequest,
  ): CanonicalModelImprovementResult => {
    try {
      counters.request_reads += 1;
      if (!hasCanonicalRuntimeSurface(requestValue)) {
        return failure("conflicting", [
          "trusted_proposal_request_runtime_shape_conflicting",
        ]);
      }
      const request: unknown = structuredClone(requestValue);
      counters.clones += 1;
      if (!isCanonicalModelImprovementRequest(request)) {
        return failure("conflicting", [
          "trusted_proposal_request_runtime_shape_conflicting",
        ]);
      }
      counters.trust_lookups += 1;
      counters.registry_lookups += 1;
      const post = boundarySnapshot!.registry.posts.find(
        (item) =>
          item.trusted_input_identity === request.trusted_input_identity,
      );
      if (!post || post.semantic_digest !== request.trusted_input_digest) {
        return failure("conflicting", [
          post
            ? "trusted_proposal_request_digest_conflicting"
            : "trusted_proposal_input_unknown",
        ]);
      }
      return buildFromPost({
        post,
        registryRoot: boundarySnapshot!.registry.root_digest,
        registryAuthority: boundarySnapshot!.registry_authority,
        expectedFeatureContextRegistryRoot:
          boundarySnapshot!.registry_authority
            .expected_feature_context_registry_root_digest,
        expectedTrainingInputRegistryRoot:
          boundarySnapshot!.registry_authority
            .expected_training_input_registry_root_digest,
        previousBindingLookup: lookupSnapshot!,
        counters,
      });
    } catch {
      return failure("conflicting", [
        "trusted_proposal_runtime_shape_conflicting",
      ]);
    }
  };
  return publishCanonicalModelImprovementEngine(
    {
      enabled: true as const,
      status: "ready" as const,
      build,
    },
    counters,
    build,
  );
}

export function verifyCanonicalModelImprovementResult(input: {
  engine: ReturnType<typeof createCanonicalModelImprovementEngine>;
  request: CanonicalModelImprovementRequest;
  result: CanonicalModelImprovementResult;
}) {
  const canonicalBuild =
    input.engine && typeof input.engine === "object"
      ? canonicalModelImprovementEngineAuthorities.get(input.engine)
      : undefined;
  if (!canonicalBuild) {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: [
        canonicalBuild === null
          ? "model_improvement_engine_disabled"
          : "model_improvement_engine_unrecognized",
      ],
    });
  }
  try {
    const expected = canonicalBuild(input.request);
    const valid = exact(expected, input.result);
    return deepFreeze({
      valid,
      canonical_result: valid ? expected : null,
      reason_codes: valid
        ? []
        : ["canonical_model_improvement_result_tampered"],
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["canonical_model_improvement_result_tampered"],
    });
  }
}
