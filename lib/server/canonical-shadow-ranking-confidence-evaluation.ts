import "server-only";

import { createHash } from "node:crypto";

import {
  CANONICAL_QUALITY_METRICS_POLICY_VERSION,
  canonicalQualityRankingKValues,
  computeCanonicalQualityMetrics,
  type CanonicalConfidenceCalibrationResult,
  type CanonicalCounterfactualOpportunitySet,
  type CanonicalMetricResult,
  type CanonicalRankingOpportunitySet,
} from "@/lib/canonical-quality-metrics";
import {
  verifyCanonicalCounterfactualOpportunitySet,
  type CanonicalCandidateMembership,
  type CanonicalCounterfactualOpportunitySetContract,
} from "@/lib/canonical-counterfactual-opportunity-set";
import type {
  CanonicalEvaluationCohort,
  CanonicalEvaluationMetricsCandidate,
} from "@/lib/server/canonical-evaluation-quality-read-model";

export const CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION =
  "canonical_shadow_ranking_confidence_evaluation_v1" as const;
export const CANONICAL_SHADOW_PAIRING_EVIDENCE_VERSION =
  "canonical_shadow_pairing_evidence_v1" as const;
export const CANONICAL_SHADOW_THRESHOLD_SWEEP_VERSION =
  "canonical_shadow_threshold_sweep_v1" as const;
export const CANONICAL_SHADOW_TERMINAL_OUTCOME_POLICY =
  "primary_60m_else_30m_else_15m_v1" as const;
export const CANONICAL_SHADOW_VERSION_TUPLE_VERSION =
  "canonical_shadow_version_tuple_v1" as const;
export const CANONICAL_SHADOW_VERSION_DIFFERENCE_SET_VERSION =
  "canonical_shadow_version_difference_set_v1" as const;
export const CANONICAL_SHADOW_EVALUATION_RESULT_VERSION =
  "canonical_shadow_evaluation_result_v1" as const;

export type CanonicalShadowEvaluationStatus =
  | "evaluable"
  | "insufficient_evidence"
  | "not_comparable"
  | "conflicting"
  | "non_reproducible"
  | "probability_semantics_missing";

export type CanonicalShadowSampleType =
  | "shadow"
  | "no_trade"
  | "rejected_candidate";

export type CanonicalShadowVersionDifference =
  | "ranking_version"
  | "scoring_version"
  | "threshold_policy_version"
  | "setup_taxonomy_version"
  | "confidence_contract_version"
  | "engine_version"
  | "evaluator_version"
  | "provider_contract_version";

export type CanonicalShadowAlgorithmVersions = {
  engine_version: string;
  scoring_version: string;
  ranking_version: string;
  threshold_policy_version: string;
  setup_taxonomy_version: string;
  confidence_contract_version: string;
  evaluator_version: string;
  provider_contract_version: string;
};

export type CanonicalShadowVersionTuple = {
  tuple_version: typeof CANONICAL_SHADOW_VERSION_TUPLE_VERSION;
  engine_version: string;
  scoring_version: string;
  ranking_version: string;
  threshold_policy_version: string;
  setup_taxonomy_version: string;
  confidence_contract_version: string;
  evaluator_version: string;
  provider_contract_version: string;
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalShadowVersionDifferenceSet = {
  difference_set_version:
    typeof CANONICAL_SHADOW_VERSION_DIFFERENCE_SET_VERSION;
  baseline_version_tuple_digest: string;
  candidate_version_tuple_digest: string;
  differences: CanonicalShadowVersionDifference[];
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalShadowConfidenceSemantics =
  | "calibrated_probability_0_1"
  | "non_probability_numeric"
  | null;

export type CanonicalShadowProbabilitySource =
  | "numeric_confidence"
  | "score"
  | "tier"
  | "evidence_strength"
  | "label"
  | null;

export type CanonicalShadowCandidateObservation = {
  canonical_candidate_identity: string;
  rank: number;
  tie_break_key: string;
  score: number;
  tier: string | null;
  evidence_strength: number | null;
  numeric_confidence: number | null;
  confidence_label: string | null;
  confidence_semantics: CanonicalShadowConfidenceSemantics;
  probability_source: CanonicalShadowProbabilitySource;
};

export type CanonicalShadowThresholdPolicy = {
  version: string;
  dimension: "score" | "numeric_confidence";
  thresholds: number[];
};

export type CanonicalShadowPairingBinding = {
  binding_version: typeof CANONICAL_SHADOW_PAIRING_EVIDENCE_VERSION;
  opportunity_set_identity: string;
  authoritative_opportunity_set_digest: string;
  full_candidate_set_digest: string;
  full_membership_identity_digest: string;
  decision_timestamp: string;
  point_in_time_cutoff: string;
  outcome_evaluator_lineage_digest: string;
  provider_contract: string;
  evaluator_contract: string;
  cohort: CanonicalEvaluationCohort;
  sample_type: CanonicalShadowSampleType;
  terminal_outcome_policy: typeof CANONICAL_SHADOW_TERMINAL_OUTCOME_POLICY;
  coverage_denominator: string;
  expected_coverage: number;
  observed_coverage: number;
  trading_days: string[];
  opportunity_set_inventory: string[];
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalShadowEvaluationArm = {
  arm: "baseline" | "candidate";
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  pairing_binding: CanonicalShadowPairingBinding;
  versions: CanonicalShadowAlgorithmVersions;
  threshold_policy: CanonicalShadowThresholdPolicy;
  candidates: CanonicalShadowCandidateObservation[];
};

export type CanonicalShadowSafetyContract = {
  shadow_only: true;
  live_ranking_effect: false;
  causal_improvement_claimed: false;
};

export type CanonicalShadowArmBuildResult =
  | {
      status: "built";
      arm: CanonicalShadowEvaluationArm;
      reason_codes: [];
    } & CanonicalShadowSafetyContract
  | {
      status: "conflicting";
      arm: null;
      reason_codes: string[];
    } & CanonicalShadowSafetyContract;

export type CanonicalShadowThresholdResult = {
  threshold_sweep_version: typeof CANONICAL_SHADOW_THRESHOLD_SWEEP_VERSION;
  threshold_policy_version: string;
  dimension: CanonicalShadowThresholdPolicy["dimension"];
  threshold: number;
  status: "evaluable" | "insufficient_evidence";
  expected_candidate_count: number;
  observed_metric_count: number;
  coverage_rate: number;
  publish_count: number;
  publish_rate: number;
  trade_count: number;
  trade_rate: number;
  rejected_count: number;
  rejected_candidate_opportunity_cost_r: CanonicalMetricResult;
  projected_no_trade: boolean;
  no_trade_counterfactual_evaluable: boolean;
  reason_codes: string[];
};

export type CanonicalShadowArmMetrics = {
  metrics_policy_version: typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION;
  ranking: {
    status: "evaluable";
    precision_at_k: Record<string, CanonicalMetricResult>;
  };
  calibration: {
    status: "evaluable" | "probability_semantics_missing";
    metrics: CanonicalConfidenceCalibrationResult;
    reason_codes: string[];
  };
  threshold_sweep: CanonicalShadowThresholdResult[];
};

export type CanonicalShadowCandidateDisplacement = {
  canonical_candidate_identity: string;
  baseline_position: number;
  candidate_position: number;
  rank_change: number;
};

export type CanonicalShadowTopKDisplacement = {
  k: (typeof canonicalQualityRankingKValues)[number];
  entered_candidate_identities: string[];
  exited_candidate_identities: string[];
};

export type CanonicalShadowPairingEvidence = {
  evidence_version: typeof CANONICAL_SHADOW_PAIRING_EVIDENCE_VERSION;
  pair_identity: string;
  baseline_arm_identity: string;
  candidate_arm_identity: string;
  baseline_binding_digest: string;
  candidate_binding_digest: string;
  shared_opportunity_set_identity: string;
  shared_candidate_set_digest: string;
  baseline_version_tuple: CanonicalShadowVersionTuple;
  candidate_version_tuple: CanonicalShadowVersionTuple;
  version_difference_set: CanonicalShadowVersionDifferenceSet;
  engine_change_intended: boolean;
  pair_semantic_digest_algorithm: "sha256_canonical_json_v1";
  pair_semantic_digest: string;
};

export type CanonicalShadowEvaluation = {
  result_version: typeof CANONICAL_SHADOW_EVALUATION_RESULT_VERSION;
  evaluation_version:
    typeof CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION;
  evaluation_identity: string;
  status: "evaluable" | "probability_semantics_missing";
  shadow_only: true;
  live_ranking_effect: false;
  causal_improvement_claimed: false;
  pairing_evidence: CanonicalShadowPairingEvidence;
  baseline: CanonicalShadowArmMetrics;
  candidate: CanonicalShadowArmMetrics;
  precision_delta_at_k: Record<string, number | null>;
  calibration_delta: {
    brier_score: number | null;
    expected_calibration_error: number | null;
  };
  candidate_displacement: CanonicalShadowCandidateDisplacement[];
  top_k_displacement: CanonicalShadowTopKDisplacement[];
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
  evaluation_digest_algorithm: "sha256_canonical_json_v1";
  evaluation_digest: string;
};

export type CanonicalShadowEvaluationResult =
  | {
      status: "evaluable" | "probability_semantics_missing";
      evaluation: CanonicalShadowEvaluation;
      reason_codes: string[];
    } & CanonicalShadowSafetyContract
  | {
      status:
        | "insufficient_evidence"
        | "not_comparable"
        | "conflicting"
        | "non_reproducible";
      evaluation: null;
      reason_codes: string[];
    } & CanonicalShadowSafetyContract;

export type CanonicalShadowPairComparisonInput = {
  baseline: CanonicalShadowEvaluationArm;
  candidate: CanonicalShadowEvaluationArm;
  declared_version_differences: CanonicalShadowVersionDifference[];
  engine_change_intended: boolean;
  bootstrap_seed: string;
};

const versionFields = [
  "engine_version",
  "scoring_version",
  "ranking_version",
  "threshold_policy_version",
  "setup_taxonomy_version",
  "confidence_contract_version",
  "evaluator_version",
  "provider_contract_version",
] as const satisfies readonly CanonicalShadowVersionDifference[];

const sampleCohorts: Record<
  CanonicalShadowSampleType,
  CanonicalEvaluationCohort
> = {
  shadow: "shadow_recommendation_quality",
  no_trade: "no_trade_counterfactual",
  rejected_candidate: "rejected_candidate_counterfactual",
};

const shadowSafety = {
  shadow_only: true,
  live_ranking_effect: false,
  causal_improvement_claimed: false,
} as const;

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

function semanticDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function exactCanonicalJson(first: unknown, second: unknown) {
  return (
    JSON.stringify(canonicalize(first)) ===
    JSON.stringify(canonicalize(second))
  );
}

export function buildCanonicalShadowVersionTuple(
  versions: CanonicalShadowAlgorithmVersions,
): CanonicalShadowVersionTuple {
  const payload: Omit<CanonicalShadowVersionTuple, "semantic_digest"> = {
    tuple_version: CANONICAL_SHADOW_VERSION_TUPLE_VERSION,
    engine_version: versions.engine_version,
    scoring_version: versions.scoring_version,
    ranking_version: versions.ranking_version,
    threshold_policy_version: versions.threshold_policy_version,
    setup_taxonomy_version: versions.setup_taxonomy_version,
    confidence_contract_version: versions.confidence_contract_version,
    evaluator_version: versions.evaluator_version,
    provider_contract_version: versions.provider_contract_version,
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    ...payload,
    semantic_digest: semanticDigest(payload),
  };
}

export function deriveCanonicalShadowVersionDifferenceSet(input: {
  baseline: CanonicalShadowAlgorithmVersions;
  candidate: CanonicalShadowAlgorithmVersions;
}): CanonicalShadowVersionDifferenceSet {
  const baseline = buildCanonicalShadowVersionTuple(input.baseline);
  const candidate = buildCanonicalShadowVersionTuple(input.candidate);
  const differences = versionFields
    .filter((field) => input.baseline[field] !== input.candidate[field])
    .sort();
  const payload: Omit<
    CanonicalShadowVersionDifferenceSet,
    "semantic_digest"
  > = {
    difference_set_version:
      CANONICAL_SHADOW_VERSION_DIFFERENCE_SET_VERSION,
    baseline_version_tuple_digest: baseline.semantic_digest,
    candidate_version_tuple_digest: candidate.semantic_digest,
    differences,
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    ...payload,
    semantic_digest: semanticDigest(payload),
  };
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value: number) {
  return Math.round(value * 1_000_000_000_000) / 1_000_000_000_000;
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

function bindingPayload(
  binding: Omit<CanonicalShadowPairingBinding, "semantic_digest">,
) {
  return binding;
}

function derivePairingBinding(input: {
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  cohort: CanonicalEvaluationCohort;
  sample_type: CanonicalShadowSampleType;
}): { binding: CanonicalShadowPairingBinding | null; reason_codes: string[] } {
  const { opportunity_set: opportunitySet } = input;
  const evaluatorContracts = uniqueSorted(
    opportunitySet.candidates.map(
      (candidate) =>
        candidate.expected_outcome_lineage.evaluator_contract_version,
    ),
  );
  const horizonPolicies = uniqueSorted(
    opportunitySet.candidates.map(
      (candidate) =>
        candidate.expected_outcome_lineage.intended_horizon_policy,
    ),
  );
  const reasonCodes = [
    ...(sampleCohorts[input.sample_type] !== input.cohort
      ? ["sample_type_cohort_mismatch"]
      : []),
    ...(evaluatorContracts.length !== 1
      ? ["evaluator_contract_mixed_or_missing"]
      : []),
    ...(horizonPolicies.length !== 1 ||
    horizonPolicies[0] !== CANONICAL_SHADOW_TERMINAL_OUTCOME_POLICY
      ? ["terminal_outcome_policy_mismatch"]
      : []),
  ];
  if (reasonCodes.length > 0) {
    return { binding: null, reason_codes: uniqueSorted(reasonCodes) };
  }

  const membership = opportunitySet.candidates
    .map((candidate) => candidate.canonical_candidate_identity)
    .sort();
  const lineage = opportunitySet.candidates
    .map((candidate) => ({
      canonical_candidate_identity: candidate.canonical_candidate_identity,
      expected_outcome_lineage: candidate.expected_outcome_lineage,
      outcome: candidate.outcome,
    }))
    .sort((first, second) =>
      first.canonical_candidate_identity.localeCompare(
        second.canonical_candidate_identity,
      ),
    );
  const payload: Omit<CanonicalShadowPairingBinding, "semantic_digest"> = {
    binding_version: CANONICAL_SHADOW_PAIRING_EVIDENCE_VERSION,
    opportunity_set_identity: opportunitySet.opportunity_set_identity,
    authoritative_opportunity_set_digest: opportunitySet.semantic_digest,
    full_candidate_set_digest: opportunitySet.full_candidate_set_digest,
    full_membership_identity_digest: semanticDigest(membership),
    decision_timestamp: opportunitySet.decision_timestamp,
    point_in_time_cutoff: opportunitySet.point_in_time_cutoff,
    outcome_evaluator_lineage_digest: semanticDigest(lineage),
    provider_contract: opportunitySet.versions.provider_contract_version,
    evaluator_contract: evaluatorContracts[0],
    cohort: input.cohort,
    sample_type: input.sample_type,
    terminal_outcome_policy: CANONICAL_SHADOW_TERMINAL_OUTCOME_POLICY,
    coverage_denominator:
      opportunitySet.provider_context.coverage_denominator,
    expected_coverage:
      opportunitySet.provider_context.expected_observation_count,
    observed_coverage:
      opportunitySet.provider_context.observed_observation_count,
    trading_days: [opportunitySet.decision_timestamp.slice(0, 10)],
    opportunity_set_inventory: [opportunitySet.opportunity_set_identity],
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    binding: {
      ...payload,
      semantic_digest: semanticDigest(bindingPayload(payload)),
    },
    reason_codes: [],
  };
}

function armStructuralReasons(input: {
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  versions: CanonicalShadowAlgorithmVersions;
  threshold_policy: CanonicalShadowThresholdPolicy;
  candidates: CanonicalShadowCandidateObservation[];
}) {
  const reasons: string[] = [];
  if (
    versionFields.some(
      (field) =>
        typeof input.versions[field] !== "string" ||
        input.versions[field].trim().length === 0,
    )
  ) {
    reasons.push("algorithm_versions_incomplete");
  }
  if (
    input.threshold_policy.version !==
    input.versions.threshold_policy_version
  ) {
    reasons.push("threshold_policy_version_mismatch");
  }
  if (
    input.versions.evaluator_version !==
      input.opportunity_set.versions.evaluator_version ||
    input.versions.provider_contract_version !==
      input.opportunity_set.versions.provider_contract_version
  ) {
    reasons.push("arm_evaluator_or_provider_version_mixed");
  }
  if (
    input.threshold_policy.thresholds.length === 0 ||
    input.threshold_policy.thresholds.some(
      (threshold) =>
        !finite(threshold) ||
        (input.threshold_policy.dimension === "numeric_confidence" &&
          (threshold < 0 || threshold > 1)),
    ) ||
    new Set(input.threshold_policy.thresholds).size !==
      input.threshold_policy.thresholds.length
  ) {
    reasons.push("threshold_policy_invalid");
  }

  const expectedMembership = input.opportunity_set.candidates
    .map((candidate) => candidate.canonical_candidate_identity)
    .sort();
  const observedMembership = input.candidates
    .map((candidate) => candidate.canonical_candidate_identity)
    .sort();
  if (
    expectedMembership.length !== observedMembership.length ||
    expectedMembership.some(
      (identity, index) => identity !== observedMembership[index],
    )
  ) {
    reasons.push("arm_candidate_membership_incomplete_or_drifted");
  }
  if (new Set(observedMembership).size !== observedMembership.length) {
    reasons.push("arm_candidate_identity_duplicate");
  }
  if (
    input.candidates.some(
      (candidate) =>
        !Number.isInteger(candidate.rank) ||
        candidate.rank < 1 ||
        !candidate.tie_break_key.trim() ||
        !finite(candidate.score) ||
        (candidate.evidence_strength !== null &&
          !finite(candidate.evidence_strength)) ||
        (candidate.numeric_confidence !== null &&
          (!finite(candidate.numeric_confidence) ||
            candidate.numeric_confidence < 0 ||
            candidate.numeric_confidence > 1)),
    )
  ) {
    reasons.push("arm_candidate_observation_invalid");
  }
  const rankTieKeys = input.candidates.map(
    (candidate) => `${candidate.rank}:${candidate.tie_break_key}`,
  );
  if (new Set(rankTieKeys).size !== rankTieKeys.length) {
    reasons.push("rank_tie_break_duplicate");
  }
  const uniqueRanks = Array.from(
    new Set(input.candidates.map((candidate) => candidate.rank)),
  ).sort((first, second) => first - second);
  if (
    uniqueRanks.some((rank, index) => rank !== index + 1)
  ) {
    reasons.push("rank_gap");
  }
  return uniqueSorted(reasons);
}

export function buildCanonicalShadowEvaluationArm(input: {
  arm: "baseline" | "candidate";
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  cohort: CanonicalEvaluationCohort;
  sample_type: CanonicalShadowSampleType;
  versions: CanonicalShadowAlgorithmVersions;
  threshold_policy: CanonicalShadowThresholdPolicy;
  candidates: CanonicalShadowCandidateObservation[];
}): CanonicalShadowArmBuildResult {
  const source = structuredClone(input);
  const verification = verifyCanonicalCounterfactualOpportunitySet(
    source.opportunity_set,
  );
  if (!verification.valid) {
    return {
      ...shadowSafety,
      status: "conflicting",
      arm: null,
      reason_codes: uniqueSorted([
        "authoritative_opportunity_set_invalid",
        ...verification.reason_codes,
      ]),
    };
  }
  const derived = derivePairingBinding(source);
  const reasons = uniqueSorted([
    ...derived.reason_codes,
    ...armStructuralReasons(source),
  ]);
  if (!derived.binding || reasons.length > 0) {
    return {
      ...shadowSafety,
      status: "conflicting",
      arm: null,
      reason_codes: reasons,
    };
  }
  const arm: CanonicalShadowEvaluationArm = {
    arm: source.arm,
    opportunity_set: source.opportunity_set,
    pairing_binding: derived.binding,
    versions: source.versions,
    threshold_policy: {
      ...source.threshold_policy,
      thresholds: [...source.threshold_policy.thresholds].sort(
        (first, second) => first - second,
      ),
    },
    candidates: [...source.candidates].sort((first, second) =>
      first.canonical_candidate_identity.localeCompare(
        second.canonical_candidate_identity,
      ),
    ),
  };
  return {
    ...shadowSafety,
    status: "built",
    arm: deepFreeze(arm),
    reason_codes: [],
  };
}

function verifyArm(arm: CanonicalShadowEvaluationArm) {
  const verification = verifyCanonicalCounterfactualOpportunitySet(
    arm.opportunity_set,
  );
  const derived = derivePairingBinding({
    opportunity_set: arm.opportunity_set,
    cohort: arm.pairing_binding.cohort,
    sample_type: arm.pairing_binding.sample_type,
  });
  const bindingReasons =
    derived.binding &&
    JSON.stringify(canonicalize(derived.binding)) ===
      JSON.stringify(canonicalize(arm.pairing_binding))
      ? []
      : ["pairing_binding_tampered_or_stale"];
  return uniqueSorted([
    ...(!verification.valid
      ? ["authoritative_opportunity_set_invalid", ...verification.reason_codes]
      : []),
    ...armStructuralReasons(arm),
    ...bindingReasons,
  ]);
}

function comparisonReasons(
  baseline: CanonicalShadowPairingBinding,
  candidate: CanonicalShadowPairingBinding,
) {
  const reasons: string[] = [];
  const exactFields = [
    "opportunity_set_identity",
    "authoritative_opportunity_set_digest",
    "full_candidate_set_digest",
    "full_membership_identity_digest",
    "decision_timestamp",
    "point_in_time_cutoff",
    "outcome_evaluator_lineage_digest",
    "provider_contract",
    "evaluator_contract",
    "cohort",
    "sample_type",
    "terminal_outcome_policy",
    "coverage_denominator",
    "expected_coverage",
    "observed_coverage",
  ] as const;
  for (const field of exactFields) {
    if (baseline[field] !== candidate[field]) {
      reasons.push(`pair_${field}_mismatch`);
    }
  }
  if (
    JSON.stringify(baseline.trading_days) !==
    JSON.stringify(candidate.trading_days)
  ) {
    reasons.push("pair_trading_days_mismatch");
  }
  if (
    JSON.stringify(baseline.opportunity_set_inventory) !==
    JSON.stringify(candidate.opportunity_set_inventory)
  ) {
    reasons.push("pair_opportunity_set_inventory_mismatch");
  }
  return uniqueSorted(reasons);
}

function declaredVersionReasons(input: CanonicalShadowPairComparisonInput) {
  const reasons: string[] = [];
  const declared = new Set(input.declared_version_differences);
  const allowed = new Set<string>(versionFields);
  if (declared.size !== input.declared_version_differences.length) {
    reasons.push("declared_version_difference_duplicate");
  }
  if (
    input.declared_version_differences.some(
      (difference) => !allowed.has(difference),
    )
  ) {
    reasons.push("declared_version_difference_unknown");
  }
  const derived = deriveCanonicalShadowVersionDifferenceSet({
    baseline: input.baseline.versions,
    candidate: input.candidate.versions,
  });
  const declaredSorted = [...declared].sort();
  if (!exactCanonicalJson(declaredSorted, derived.differences)) {
    reasons.push("declared_version_difference_set_mismatch");
    for (const field of derived.differences) {
      if (!declared.has(field)) {
        reasons.push(`undeclared_${field}_difference`);
      }
    }
    for (const field of declaredSorted) {
      if (
        allowed.has(field) &&
        !derived.differences.includes(
          field as CanonicalShadowVersionDifference,
        )
      ) {
        reasons.push(`declared_${field}_without_difference`);
      }
    }
  }
  if (
    derived.differences.includes("engine_version") &&
    !input.engine_change_intended
  ) {
    reasons.push("engine_change_not_explicitly_intended");
  }
  if (
    input.engine_change_intended &&
    !derived.differences.includes("engine_version")
  ) {
    reasons.push("engine_change_intent_without_engine_difference");
  }
  return uniqueSorted(reasons);
}

function readinessStatus(
  set: CanonicalCounterfactualOpportunitySetContract,
): {
  status:
    | "ready"
    | "insufficient_evidence"
    | "non_reproducible"
    | "conflicting";
  reason_codes: string[];
} {
  if (
    set.expected_candidate_count !== set.observed_candidate_count ||
    set.expected_candidate_count !== set.candidates.length
  ) {
    return {
      status: "insufficient_evidence",
      reason_codes: ["complete_opportunity_set_required"],
    };
  }
  if (set.readiness.status === "conflicting") {
    return {
      status: "conflicting",
      reason_codes: set.readiness.reason_codes,
    };
  }
  if (
    set.readiness.status === "non_reproducible" ||
    set.readiness.status === "not_point_in_time_safe"
  ) {
    return {
      status: "non_reproducible",
      reason_codes: set.readiness.reason_codes,
    };
  }
  if (!set.readiness.counterfactual_evaluation_eligible) {
    return {
      status: "insufficient_evidence",
      reason_codes: uniqueSorted([
        "complete_evaluable_candidate_outcomes_required",
        ...set.readiness.reason_codes,
      ]),
    };
  }
  return { status: "ready", reason_codes: [] };
}

function targetBeforeStop(
  candidate: CanonicalCandidateMembership,
): CanonicalEvaluationMetricsCandidate["target_before_stop"] {
  switch (candidate.outcome?.terminal_outcome) {
    case "target_before_stop":
      return "yes";
    case "stop_before_target":
      return "no";
    case "ambiguous_same_candle":
      return "ambiguous";
    default:
      return "not_applicable";
  }
}

function metricsCandidate(input: {
  arm: CanonicalShadowEvaluationArm;
  membership: CanonicalCandidateMembership;
  observation: CanonicalShadowCandidateObservation;
  canonical_identity?: string;
  cohort?: CanonicalEvaluationCohort;
  sample_type?: CanonicalShadowSampleType;
}): CanonicalEvaluationMetricsCandidate {
  const { arm, membership, observation } = input;
  const outcome = membership.outcome;
  const probabilityReady =
    observation.probability_source === "numeric_confidence" &&
    observation.confidence_semantics === "calibrated_probability_0_1";
  return {
    read_model_version: "canonical_evaluation_quality_read_model_v1",
    canonical_identity:
      input.canonical_identity ?? membership.canonical_candidate_identity,
    sample_type: input.sample_type ?? arm.pairing_binding.sample_type,
    cohort: input.cohort ?? arm.pairing_binding.cohort,
    primary_horizon: outcome?.primary_horizon ?? null,
    terminal_outcome: outcome?.terminal_outcome ?? "incomplete",
    r_result: outcome?.r_result ?? null,
    mfe_r: null,
    mae_r: null,
    max_favorable_excursion: null,
    max_adverse_excursion: null,
    target_before_stop: targetBeforeStop(membership),
    numeric_confidence: observation.numeric_confidence,
    confidence_probability_semantics: probabilityReady
      ? "probability_0_1"
      : null,
    setup: membership.setup,
    window: membership.context.window,
    regime: membership.context.regime,
    sector: membership.context.sector,
    ticker: membership.ticker,
    decision_timestamp: arm.opportunity_set.decision_timestamp,
    decision_day: arm.opportunity_set.decision_timestamp.slice(0, 10),
    versions: {
      engine: arm.versions.engine_version,
      scoring: arm.versions.scoring_version,
      ranking: arm.versions.ranking_version,
      evaluator: arm.versions.evaluator_version,
      provider: arm.versions.provider_contract_version,
    },
    coverage: {
      status:
        arm.opportunity_set.provider_context.freshness === "fresh"
          ? "complete"
          : arm.opportunity_set.provider_context.freshness,
      expected_candle_count:
        arm.opportunity_set.provider_context.expected_observation_count,
      observed_candle_count:
        arm.opportunity_set.provider_context.observed_observation_count,
      freshness: arm.opportunity_set.provider_context.freshness,
    },
    parity_verified: true,
    reproducible: outcome?.reproducible === true,
    standard_visible_quality_eligible: false,
    cohort_quality_eligible: true,
    eligibility_status: "eligible",
    reason_codes: [],
    diagnostic_horizons: [],
  };
}

function orderedArmCandidates(arm: CanonicalShadowEvaluationArm) {
  return [...arm.candidates].sort(
    (first, second) =>
      first.rank - second.rank ||
      first.tie_break_key.localeCompare(second.tie_break_key) ||
      first.canonical_candidate_identity.localeCompare(
        second.canonical_candidate_identity,
      ),
  );
}

function rankingOpportunitySet(
  arm: CanonicalShadowEvaluationArm,
): CanonicalRankingOpportunitySet {
  const membershipByIdentity = new Map(
    arm.opportunity_set.candidates.map((candidate) => [
      candidate.canonical_candidate_identity,
      candidate,
    ]),
  );
  return {
    opportunity_set_id: arm.opportunity_set.opportunity_set_identity,
    cohort: arm.pairing_binding.cohort,
    decision_day: arm.opportunity_set.decision_timestamp.slice(0, 10),
    ranking_version: arm.versions.ranking_version,
    complete: true,
    candidates: orderedArmCandidates(arm).map((observation, index) => {
      const membership = membershipByIdentity.get(
        observation.canonical_candidate_identity,
      );
      if (!membership) {
        throw new Error("arm_membership_not_found_after_validation");
      }
      return {
        canonical_identity: observation.canonical_candidate_identity,
        ticker: membership.ticker,
        rank: index + 1,
        selection_status:
          membership.membership_status === "selected"
            ? "selected"
            : membership.membership_status === "rejected"
              ? "rejected"
              : "not_selected",
        outcome_evaluable: membership.outcome?.outcome_evaluable === true,
        positive_outcome: membership.outcome?.positive_outcome ?? null,
      };
    }),
  };
}

function counterfactualMetric(input: {
  arm: CanonicalShadowEvaluationArm;
  threshold: number;
  candidates: CanonicalCandidateMembership[];
  bootstrap_seed: string;
}) {
  if (input.candidates.length === 0) {
    return computeCanonicalQualityMetrics({
      cohort: "rejected_candidate_counterfactual",
      candidates: [],
      counterfactual_opportunity_sets: [],
      bootstrap_seed: input.bootstrap_seed,
    }).counterfactual.opportunity_cost_r;
  }
  const identity = [
    input.arm.opportunity_set.opportunity_set_identity,
    input.arm.arm,
    input.arm.threshold_policy.version,
    String(input.threshold),
  ].join(":");
  const firstMembership = input.candidates[0];
  const firstObservation = input.arm.candidates.find(
    (candidate) =>
      candidate.canonical_candidate_identity ===
      firstMembership.canonical_candidate_identity,
  );
  if (!firstObservation) {
    throw new Error("counterfactual_observation_not_found_after_validation");
  }
  const decisionCandidate = metricsCandidate({
    arm: input.arm,
    membership: firstMembership,
    observation: firstObservation,
    canonical_identity: identity,
    cohort: "rejected_candidate_counterfactual",
    sample_type: "rejected_candidate",
  });
  const opportunitySet: CanonicalCounterfactualOpportunitySet = {
    opportunity_set_id: [
      input.arm.opportunity_set.opportunity_set_identity,
      input.arm.arm,
      input.arm.threshold_policy.version,
      String(input.threshold),
    ].join(":"),
    decision_canonical_identity: identity,
    cohort: "rejected_candidate_counterfactual",
    decision_day: input.arm.opportunity_set.decision_timestamp.slice(0, 10),
    complete: true,
    candidates: input.candidates.map((candidate) => ({
      canonical_identity: candidate.canonical_candidate_identity,
      ticker: candidate.ticker,
      outcome_evaluable: candidate.outcome?.outcome_evaluable === true,
      r_result: candidate.outcome?.r_result ?? null,
    })),
  };
  return computeCanonicalQualityMetrics({
    cohort: "rejected_candidate_counterfactual",
    candidates: [decisionCandidate],
    counterfactual_opportunity_sets: [opportunitySet],
    bootstrap_seed: input.bootstrap_seed,
  }).counterfactual.opportunity_cost_r;
}

function thresholdValue(
  policy: CanonicalShadowThresholdPolicy,
  observation: CanonicalShadowCandidateObservation,
) {
  return policy.dimension === "score"
    ? observation.score
    : observation.numeric_confidence;
}

function thresholdSweep(
  arm: CanonicalShadowEvaluationArm,
  bootstrapSeed: string,
) {
  const membershipByIdentity = new Map(
    arm.opportunity_set.candidates.map((candidate) => [
      candidate.canonical_candidate_identity,
      candidate,
    ]),
  );
  return arm.threshold_policy.thresholds.map((threshold) => {
    const observed = arm.candidates.filter((candidate) =>
      finite(thresholdValue(arm.threshold_policy, candidate)),
    );
    const published = observed.filter(
      (candidate) =>
        (thresholdValue(arm.threshold_policy, candidate) as number) >=
        threshold,
    );
    const traded = published.filter((candidate) => {
      const membership = membershipByIdentity.get(
        candidate.canonical_candidate_identity,
      );
      return (
        membership?.outcome?.outcome_evaluable === true &&
        membership.outcome.terminal_outcome !== "no_entry"
      );
    });
    const rejectedMembership = observed
      .filter(
        (candidate) =>
          (thresholdValue(arm.threshold_policy, candidate) as number) <
          threshold,
      )
      .map((candidate) =>
        membershipByIdentity.get(candidate.canonical_candidate_identity),
      )
      .filter(
        (candidate): candidate is CanonicalCandidateMembership =>
          Boolean(candidate),
      );
    const expected = arm.opportunity_set.candidates.length;
    const completeCoverage = observed.length === expected;
    const opportunityCost = counterfactualMetric({
      arm,
      threshold,
      candidates: rejectedMembership,
      bootstrap_seed: `${bootstrapSeed}:${arm.arm}:threshold:${threshold}`,
    });
    const projectedNoTrade = published.length === 0;
    const noTradeEvaluable =
      projectedNoTrade &&
      completeCoverage &&
      arm.opportunity_set.readiness.counterfactual_evaluation_eligible;
    return {
      threshold_sweep_version: CANONICAL_SHADOW_THRESHOLD_SWEEP_VERSION,
      threshold_policy_version: arm.threshold_policy.version,
      dimension: arm.threshold_policy.dimension,
      threshold,
      status: completeCoverage ? "evaluable" : "insufficient_evidence",
      expected_candidate_count: expected,
      observed_metric_count: observed.length,
      coverage_rate: round(observed.length / expected),
      publish_count: published.length,
      publish_rate: round(published.length / expected),
      trade_count: traded.length,
      trade_rate: round(traded.length / expected),
      rejected_count: rejectedMembership.length,
      rejected_candidate_opportunity_cost_r: opportunityCost,
      projected_no_trade: projectedNoTrade,
      no_trade_counterfactual_evaluable: noTradeEvaluable,
      reason_codes: completeCoverage
        ? []
        : ["threshold_dimension_coverage_incomplete"],
    } satisfies CanonicalShadowThresholdResult;
  });
}

function armMetrics(
  arm: CanonicalShadowEvaluationArm,
  bootstrapSeed: string,
): CanonicalShadowArmMetrics {
  const observationByIdentity = new Map(
    arm.candidates.map((candidate) => [
      candidate.canonical_candidate_identity,
      candidate,
    ]),
  );
  const candidates = arm.opportunity_set.candidates.map((membership) => {
    const observation = observationByIdentity.get(
      membership.canonical_candidate_identity,
    );
    if (!observation) {
      throw new Error("metrics_observation_not_found_after_validation");
    }
    return metricsCandidate({ arm, membership, observation });
  });
  const metrics = computeCanonicalQualityMetrics({
    cohort: arm.pairing_binding.cohort,
    candidates,
    ranking_opportunity_sets: [rankingOpportunitySet(arm)],
    bootstrap_seed: `${bootstrapSeed}:${arm.arm}`,
  });
  const calibrationReady = arm.candidates.every(
    (candidate) =>
      candidate.probability_source === "numeric_confidence" &&
      candidate.confidence_semantics === "calibrated_probability_0_1" &&
      candidate.numeric_confidence !== null,
  );
  return {
    metrics_policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    ranking: {
      status: "evaluable",
      precision_at_k: metrics.ranking.precision_at_k,
    },
    calibration: {
      status: calibrationReady
        ? "evaluable"
        : "probability_semantics_missing",
      metrics: metrics.calibration,
      reason_codes: calibrationReady
        ? []
        : [
            "explicit_calibrated_numeric_probability_required",
            "score_tier_evidence_or_label_not_probability",
          ],
    },
    threshold_sweep: thresholdSweep(arm, bootstrapSeed),
  };
}

function metricDelta(
  baseline: CanonicalMetricResult,
  candidate: CanonicalMetricResult,
) {
  return baseline.value === null || candidate.value === null
    ? null
    : round(candidate.value - baseline.value);
}

function displacement(
  baseline: CanonicalShadowEvaluationArm,
  candidate: CanonicalShadowEvaluationArm,
) {
  const baselineOrdered = orderedArmCandidates(baseline);
  const candidateOrdered = orderedArmCandidates(candidate);
  const baselinePosition = new Map(
    baselineOrdered.map((item, index) => [
      item.canonical_candidate_identity,
      index + 1,
    ]),
  );
  const candidatePosition = new Map(
    candidateOrdered.map((item, index) => [
      item.canonical_candidate_identity,
      index + 1,
    ]),
  );
  const candidates = [...baselinePosition.keys()].sort().map((identity) => {
    const baselineRank = baselinePosition.get(identity) as number;
    const candidateRank = candidatePosition.get(identity) as number;
    return {
      canonical_candidate_identity: identity,
      baseline_position: baselineRank,
      candidate_position: candidateRank,
      rank_change: baselineRank - candidateRank,
    };
  });
  const topK = canonicalQualityRankingKValues.map((k) => {
    const baselineTop = new Set(
      baselineOrdered
        .slice(0, k)
        .map((item) => item.canonical_candidate_identity),
    );
    const candidateTop = new Set(
      candidateOrdered
        .slice(0, k)
        .map((item) => item.canonical_candidate_identity),
    );
    return {
      k,
      entered_candidate_identities: [...candidateTop]
        .filter((identity) => !baselineTop.has(identity))
        .sort(),
      exited_candidate_identities: [...baselineTop]
        .filter((identity) => !candidateTop.has(identity))
        .sort(),
    };
  });
  return { candidates, topK };
}

function canonicalShadowArmIdentity(
  arm: CanonicalShadowEvaluationArm,
  tuple: CanonicalShadowVersionTuple,
) {
  return [
    "canonical-shadow-arm",
    arm.arm,
    semanticDigest({
      pairing_binding_digest: arm.pairing_binding.semantic_digest,
      version_tuple_digest: tuple.semantic_digest,
      threshold_policy: arm.threshold_policy,
      candidates: [...arm.candidates].sort((first, second) =>
        first.canonical_candidate_identity.localeCompare(
          second.canonical_candidate_identity,
        ),
      ),
    }),
  ].join(":");
}

function pairEvidence(input: CanonicalShadowPairComparisonInput) {
  const baselineVersionTuple = buildCanonicalShadowVersionTuple(
    input.baseline.versions,
  );
  const candidateVersionTuple = buildCanonicalShadowVersionTuple(
    input.candidate.versions,
  );
  const versionDifferenceSet = deriveCanonicalShadowVersionDifferenceSet({
    baseline: input.baseline.versions,
    candidate: input.candidate.versions,
  });
  const baselineArmIdentity = canonicalShadowArmIdentity(
    input.baseline,
    baselineVersionTuple,
  );
  const candidateArmIdentity = canonicalShadowArmIdentity(
    input.candidate,
    candidateVersionTuple,
  );
  const pairIdentity = [
    "canonical-shadow-pair",
    semanticDigest({
      baseline_arm_identity: baselineArmIdentity,
      candidate_arm_identity: candidateArmIdentity,
      shared_opportunity_set_identity:
        input.baseline.pairing_binding.opportunity_set_identity,
      version_difference_set_digest: versionDifferenceSet.semantic_digest,
    }),
  ].join(":");
  const payload: Omit<
    CanonicalShadowPairingEvidence,
    "pair_semantic_digest"
  > = {
    evidence_version: CANONICAL_SHADOW_PAIRING_EVIDENCE_VERSION,
    pair_identity: pairIdentity,
    baseline_arm_identity: baselineArmIdentity,
    candidate_arm_identity: candidateArmIdentity,
    baseline_binding_digest: input.baseline.pairing_binding.semantic_digest,
    candidate_binding_digest: input.candidate.pairing_binding.semantic_digest,
    shared_opportunity_set_identity:
      input.baseline.pairing_binding.opportunity_set_identity,
    shared_candidate_set_digest:
      input.baseline.pairing_binding.full_candidate_set_digest,
    baseline_version_tuple: baselineVersionTuple,
    candidate_version_tuple: candidateVersionTuple,
    version_difference_set: versionDifferenceSet,
    engine_change_intended: input.engine_change_intended,
    pair_semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    ...payload,
    pair_semantic_digest: semanticDigest(payload),
  };
}

export function evaluateCanonicalShadowRankingConfidencePair(
  input: CanonicalShadowPairComparisonInput,
): CanonicalShadowEvaluationResult {
  const source = structuredClone(input);
  const baselineReasons = verifyArm(source.baseline);
  const candidateReasons = verifyArm(source.candidate);
  if (baselineReasons.length > 0 || candidateReasons.length > 0) {
    const membershipReasons = uniqueSorted([
      ...baselineReasons
        .filter((reason) =>
          reason.includes("arm_candidate_membership_incomplete_or_drifted"),
        )
        .map((reason) => `baseline_${reason}`),
      ...candidateReasons
        .filter((reason) =>
          reason.includes("arm_candidate_membership_incomplete_or_drifted"),
        )
        .map((reason) => `candidate_${reason}`),
    ]);
    const nonMembershipReasons = [
      ...baselineReasons,
      ...candidateReasons,
    ].filter(
      (reason) =>
        !reason.includes("arm_candidate_membership_incomplete_or_drifted"),
    );
    if (membershipReasons.length > 0 && nonMembershipReasons.length === 0) {
      return {
        ...shadowSafety,
        status: "not_comparable",
        evaluation: null,
        reason_codes: membershipReasons,
      };
    }
    return {
      ...shadowSafety,
      status: "conflicting",
      evaluation: null,
      reason_codes: uniqueSorted([
        ...baselineReasons.map((reason) => `baseline_${reason}`),
        ...candidateReasons.map((reason) => `candidate_${reason}`),
      ]),
    };
  }
  if (source.baseline.arm !== "baseline" || source.candidate.arm !== "candidate") {
    return {
      ...shadowSafety,
      status: "conflicting",
      evaluation: null,
      reason_codes: ["comparison_arm_roles_invalid"],
    };
  }
  const pairReasons = comparisonReasons(
    source.baseline.pairing_binding,
    source.candidate.pairing_binding,
  );
  const versionReasons = declaredVersionReasons(source);
  if (pairReasons.length > 0 || versionReasons.length > 0) {
    return {
      ...shadowSafety,
      status: "not_comparable",
      evaluation: null,
      reason_codes: uniqueSorted([...pairReasons, ...versionReasons]),
    };
  }
  const baselineReadiness = readinessStatus(source.baseline.opportunity_set);
  const candidateReadiness = readinessStatus(source.candidate.opportunity_set);
  const readinessReasons = uniqueSorted([
    ...baselineReadiness.reason_codes.map((reason) => `baseline_${reason}`),
    ...candidateReadiness.reason_codes.map((reason) => `candidate_${reason}`),
  ]);
  if (
    baselineReadiness.status === "conflicting" ||
    candidateReadiness.status === "conflicting"
  ) {
    return {
      ...shadowSafety,
      status: "conflicting",
      evaluation: null,
      reason_codes: readinessReasons,
    };
  }
  if (
    baselineReadiness.status === "non_reproducible" ||
    candidateReadiness.status === "non_reproducible"
  ) {
    return {
      ...shadowSafety,
      status: "non_reproducible",
      evaluation: null,
      reason_codes: readinessReasons,
    };
  }
  if (
    baselineReadiness.status === "insufficient_evidence" ||
    candidateReadiness.status === "insufficient_evidence"
  ) {
    return {
      ...shadowSafety,
      status: "insufficient_evidence",
      evaluation: null,
      reason_codes: readinessReasons,
    };
  }

  const baselineMetrics = armMetrics(source.baseline, source.bootstrap_seed);
  const candidateMetrics = armMetrics(source.candidate, source.bootstrap_seed);
  const probabilityReady =
    baselineMetrics.calibration.status === "evaluable" &&
    candidateMetrics.calibration.status === "evaluable";
  const status = probabilityReady
    ? ("evaluable" as const)
    : ("probability_semantics_missing" as const);
  const movement = displacement(source.baseline, source.candidate);
  const evidence = pairEvidence(source);
  const evaluationIdentity = [
    "canonical-shadow-evaluation",
    semanticDigest({
      pair_identity: evidence.pair_identity,
      pair_semantic_digest: evidence.pair_semantic_digest,
      evaluation_version:
        CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
      metrics_policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    }),
  ].join(":");
  const payload: Omit<
    CanonicalShadowEvaluation,
    "semantic_digest" | "evaluation_digest"
  > = {
    result_version: CANONICAL_SHADOW_EVALUATION_RESULT_VERSION,
    evaluation_version:
      CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
    evaluation_identity: evaluationIdentity,
    status,
    shadow_only: true,
    live_ranking_effect: false,
    causal_improvement_claimed: false,
    pairing_evidence: evidence,
    baseline: baselineMetrics,
    candidate: candidateMetrics,
    precision_delta_at_k: Object.fromEntries(
      canonicalQualityRankingKValues.map((k) => [
        String(k),
        metricDelta(
          baselineMetrics.ranking.precision_at_k[String(k)],
          candidateMetrics.ranking.precision_at_k[String(k)],
        ),
      ]),
    ),
    calibration_delta: {
      brier_score: metricDelta(
        baselineMetrics.calibration.metrics.brier_score,
        candidateMetrics.calibration.metrics.brier_score,
      ),
      expected_calibration_error: metricDelta(
        baselineMetrics.calibration.metrics.expected_calibration_error,
        candidateMetrics.calibration.metrics.expected_calibration_error,
      ),
    },
    candidate_displacement: movement.candidates,
    top_k_displacement: movement.topK,
    semantic_digest_algorithm: "sha256_canonical_json_v1",
    evaluation_digest_algorithm: "sha256_canonical_json_v1",
  };
  const semantic = semanticDigest(payload);
  const evaluation: CanonicalShadowEvaluation = {
    ...payload,
    semantic_digest: semantic,
    evaluation_digest: semanticDigest({
      result_version: CANONICAL_SHADOW_EVALUATION_RESULT_VERSION,
      evaluation_identity: evaluationIdentity,
      pair_identity: evidence.pair_identity,
      pair_semantic_digest: evidence.pair_semantic_digest,
      baseline_version_tuple_digest:
        evidence.baseline_version_tuple.semantic_digest,
      candidate_version_tuple_digest:
        evidence.candidate_version_tuple.semantic_digest,
      version_difference_set_digest:
        evidence.version_difference_set.semantic_digest,
      semantic_digest: semantic,
    }),
  };
  return {
    ...shadowSafety,
    status,
    evaluation: deepFreeze(evaluation),
    reason_codes: probabilityReady
      ? []
      : ["paired_probability_semantics_incomplete"],
  };
}

export type CanonicalShadowEvaluationResultVerification = {
  valid: boolean;
  reason_codes: string[];
  canonical_result: CanonicalShadowEvaluationResult | null;
};

export function verifyCanonicalShadowEvaluationResult(input: {
  comparison_input: CanonicalShadowPairComparisonInput;
  evaluation_result: CanonicalShadowEvaluationResult;
}): CanonicalShadowEvaluationResultVerification {
  let expected: CanonicalShadowEvaluationResult;
  let observed: CanonicalShadowEvaluationResult;
  try {
    expected = evaluateCanonicalShadowRankingConfidencePair(
      structuredClone(input.comparison_input),
    );
    observed = structuredClone(input.evaluation_result);
  } catch {
    return {
      valid: false,
      reason_codes: ["evaluation_result_not_cloneable_or_rebuild_failed"],
      canonical_result: null,
    };
  }
  const reasons: string[] = [];
  if (
    observed.shadow_only !== true ||
    observed.live_ranking_effect !== false ||
    observed.causal_improvement_claimed !== false
  ) {
    reasons.push("evaluation_safety_contract_mismatch");
  }
  if (observed.status !== expected.status) {
    reasons.push("evaluation_status_mismatch");
  }
  if (observed.evaluation && expected.evaluation) {
    const observedEvaluation = observed.evaluation;
    const expectedEvaluation = expected.evaluation;
    if (
      observedEvaluation.pairing_evidence.pair_identity !==
        expectedEvaluation.pairing_evidence.pair_identity ||
      observedEvaluation.pairing_evidence.baseline_arm_identity !==
        expectedEvaluation.pairing_evidence.baseline_arm_identity ||
      observedEvaluation.pairing_evidence.candidate_arm_identity !==
        expectedEvaluation.pairing_evidence.candidate_arm_identity
    ) {
      reasons.push("evaluation_pair_identity_mismatch");
    }
    if (
      observedEvaluation.pairing_evidence.pair_semantic_digest !==
      expectedEvaluation.pairing_evidence.pair_semantic_digest
    ) {
      reasons.push("evaluation_pair_digest_mismatch");
    }
    if (
      !exactCanonicalJson(
        observedEvaluation.pairing_evidence.baseline_version_tuple,
        expectedEvaluation.pairing_evidence.baseline_version_tuple,
      ) ||
      !exactCanonicalJson(
        observedEvaluation.pairing_evidence.candidate_version_tuple,
        expectedEvaluation.pairing_evidence.candidate_version_tuple,
      ) ||
      !exactCanonicalJson(
        observedEvaluation.pairing_evidence.version_difference_set,
        expectedEvaluation.pairing_evidence.version_difference_set,
      )
    ) {
      reasons.push("evaluation_version_provenance_mismatch");
    }
    if (
      observedEvaluation.semantic_digest !==
      expectedEvaluation.semantic_digest
    ) {
      reasons.push("evaluation_semantic_digest_mismatch");
    }
    if (
      observedEvaluation.evaluation_identity !==
        expectedEvaluation.evaluation_identity ||
      observedEvaluation.evaluation_digest !==
        expectedEvaluation.evaluation_digest
    ) {
      reasons.push("evaluation_identity_or_digest_mismatch");
    }
  } else if (Boolean(observed.evaluation) !== Boolean(expected.evaluation)) {
    reasons.push("evaluation_payload_presence_mismatch");
  }
  if (!exactCanonicalJson(observed, expected)) {
    reasons.push("evaluation_result_payload_mismatch");
  }
  return reasons.length > 0
    ? {
        valid: false,
        reason_codes: uniqueSorted(reasons),
        canonical_result: null,
      }
    : {
        valid: true,
        reason_codes: [],
        canonical_result: deepFreeze(expected),
      };
}
