import { createHash } from "node:crypto";

import type { RecommendationLearningBaselineSegment } from "@/lib/recommendation-learning-baseline-segments";

export const RECOMMENDATION_EVALUATION_CHARTER_VERSION =
  "recommendation_evaluation_charter_v1" as const;

type PrimaryOutcomeHorizon = "15m" | "30m" | "60m";
type FeasibilityRequirement = "required" | "unavailable_disclosed";

export type RecommendationEvaluationCharterDefinition = {
  contract_version: typeof RECOMMENDATION_EVALUATION_CHARTER_VERSION;
  hypothesis: string;
  eligible_universe: string;
  setup_slices: string[];
  regime_slices: string[];
  outcome_rules: {
    primary_horizon: PrimaryOutcomeHorizon;
    diagnostic_horizons: PrimaryOutcomeHorizon[];
    semantics: string;
  };
  evaluation_window: {
    minimum_complete_decisions: number;
    held_out_decision_count: number;
    walk_forward_decision_count: number;
  };
  thresholds: {
    minimum_precision_at_k: number;
    minimum_expectancy_r: number;
    maximum_calibration_error: number;
    minimum_outcome_coverage: number;
    maximum_missingness: number;
    maximum_provider_credits_per_decision: number;
    minimum_reliability: number;
  };
  concentration_limits: {
    maximum_single_ticker_share: number;
    maximum_single_sector_share: number;
    maximum_single_setup_share: number;
    maximum_single_regime_share: number;
  };
  feasibility_inputs: {
    spread: FeasibilityRequirement;
    liquidity: FeasibilityRequirement;
    volatility: FeasibilityRequirement;
    halt_risk: FeasibilityRequirement;
    trigger_attainment: FeasibilityRequirement;
    conservative_slippage: FeasibilityRequirement;
  };
};

export type RecommendationEvaluationCharter = {
  charter_id: string;
  charter_fingerprint: string;
  owner_user_id: string;
  segment_key: string;
  policy_attribution: RecommendationLearningBaselineSegment["policy_attribution"];
  charter: RecommendationEvaluationCharterDefinition;
  created_at: string;
};

export type RecommendationEvaluationCharterInput = Omit<
  RecommendationEvaluationCharter,
  "charter_id" | "created_at"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validEvaluationCharterFingerprint(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function validIso(value: unknown): value is string {
  return typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value));
}

function boundedText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" &&
    value.trim().length >= min &&
    value.trim().length <= max;
}

function stringList(value: unknown, min: number, max: number): value is string[] {
  return Array.isArray(value) &&
    value.length >= min &&
    value.length <= max &&
    value.every((item) => boundedText(item, 1, 160)) &&
    new Set(value.map((item) => item.trim().toLowerCase())).size === value.length;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 100_000;
}

function unitInterval(value: unknown): value is number {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1;
}

function finiteRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max;
}

function normalizedList(values: string[]) {
  return [...values]
    .map((value) => value.trim())
    .sort((left, right) => left.localeCompare(right));
}

function policyAttribution(
  value: unknown,
): RecommendationLearningBaselineSegment["policy_attribution"] | null {
  if (!isRecord(value) || !boundedText(value.recommendation_publish_policy_version, 1, 512)) {
    return null;
  }
  const versions = value.canonical_evaluation_versions;
  if (!isRecord(versions)) return null;
  const required = [
    "engine_version",
    "scoring_version",
    "ranking_version",
    "setup_taxonomy_version",
    "confidence_contract_version",
    "evaluator_version",
    "provider_contract_version",
    "git_commit",
    "build_identity",
  ] as const;
  if (!required.every((key) => boundedText(versions[key], 1, 512))) return null;

  return {
    recommendation_publish_policy_version: value.recommendation_publish_policy_version.trim(),
    canonical_evaluation_versions: {
      engine_version: versions.engine_version as string,
      scoring_version: versions.scoring_version as string,
      ranking_version: versions.ranking_version as string,
      setup_taxonomy_version: versions.setup_taxonomy_version as string,
      confidence_contract_version: versions.confidence_contract_version as string,
      evaluator_version: versions.evaluator_version as string,
      provider_contract_version: versions.provider_contract_version as string,
      git_commit: versions.git_commit as string,
      build_identity: versions.build_identity as string,
    },
  };
}

export function parseRecommendationEvaluationCharterDefinition(
  value: unknown,
): RecommendationEvaluationCharterDefinition | null {
  if (!isRecord(value) || value.contract_version !== RECOMMENDATION_EVALUATION_CHARTER_VERSION) {
    return null;
  }
  if (!boundedText(value.hypothesis, 20, 2800) || !boundedText(value.eligible_universe, 1, 2800)) {
    return null;
  }
  if (!stringList(value.setup_slices, 1, 50) || !stringList(value.regime_slices, 1, 50)) {
    return null;
  }
  const outcome = value.outcome_rules;
  const evaluationWindow = value.evaluation_window;
  const thresholds = value.thresholds;
  const concentration = value.concentration_limits;
  const feasibility = value.feasibility_inputs;
  if (!isRecord(outcome) || !isRecord(evaluationWindow) || !isRecord(thresholds) ||
    !isRecord(concentration) || !isRecord(feasibility)) return null;
  const horizons: PrimaryOutcomeHorizon[] = ["15m", "30m", "60m"];
  if (!horizons.includes(outcome.primary_horizon as PrimaryOutcomeHorizon) ||
    !Array.isArray(outcome.diagnostic_horizons) ||
    outcome.diagnostic_horizons.length !== 3 ||
    new Set(outcome.diagnostic_horizons).size !== 3 ||
    !outcome.diagnostic_horizons.every((horizon) => horizons.includes(horizon as PrimaryOutcomeHorizon)) ||
    !boundedText(outcome.semantics, 20, 2800)) return null;
  if (!positiveInteger(evaluationWindow.minimum_complete_decisions) ||
    !positiveInteger(evaluationWindow.held_out_decision_count) ||
    !positiveInteger(evaluationWindow.walk_forward_decision_count)) return null;
  if (!unitInterval(thresholds.minimum_precision_at_k) ||
    !finiteRange(thresholds.minimum_expectancy_r, -20, 20) ||
    !unitInterval(thresholds.maximum_calibration_error) ||
    !unitInterval(thresholds.minimum_outcome_coverage) ||
    !unitInterval(thresholds.maximum_missingness) ||
    !finiteRange(thresholds.maximum_provider_credits_per_decision, 0, 10_000) ||
    !unitInterval(thresholds.minimum_reliability)) return null;
  if (!unitInterval(concentration.maximum_single_ticker_share) ||
    !unitInterval(concentration.maximum_single_sector_share) ||
    !unitInterval(concentration.maximum_single_setup_share) ||
    !unitInterval(concentration.maximum_single_regime_share)) return null;
  const feasibilityKeys = [
    "spread",
    "liquidity",
    "volatility",
    "halt_risk",
    "trigger_attainment",
    "conservative_slippage",
  ] as const;
  if (!feasibilityKeys.every((key) =>
    feasibility[key] === "required" || feasibility[key] === "unavailable_disclosed"
  )) return null;

  return {
    contract_version: RECOMMENDATION_EVALUATION_CHARTER_VERSION,
    hypothesis: value.hypothesis.trim(),
    eligible_universe: value.eligible_universe.trim(),
    setup_slices: normalizedList(value.setup_slices),
    regime_slices: normalizedList(value.regime_slices),
    outcome_rules: {
      primary_horizon: outcome.primary_horizon as PrimaryOutcomeHorizon,
      diagnostic_horizons: [...outcome.diagnostic_horizons] as PrimaryOutcomeHorizon[],
      semantics: outcome.semantics.trim(),
    },
    evaluation_window: {
      minimum_complete_decisions: evaluationWindow.minimum_complete_decisions,
      held_out_decision_count: evaluationWindow.held_out_decision_count,
      walk_forward_decision_count: evaluationWindow.walk_forward_decision_count,
    },
    thresholds: {
      minimum_precision_at_k: thresholds.minimum_precision_at_k,
      minimum_expectancy_r: thresholds.minimum_expectancy_r,
      maximum_calibration_error: thresholds.maximum_calibration_error,
      minimum_outcome_coverage: thresholds.minimum_outcome_coverage,
      maximum_missingness: thresholds.maximum_missingness,
      maximum_provider_credits_per_decision: thresholds.maximum_provider_credits_per_decision,
      minimum_reliability: thresholds.minimum_reliability,
    },
    concentration_limits: {
      maximum_single_ticker_share: concentration.maximum_single_ticker_share,
      maximum_single_sector_share: concentration.maximum_single_sector_share,
      maximum_single_setup_share: concentration.maximum_single_setup_share,
      maximum_single_regime_share: concentration.maximum_single_regime_share,
    },
    feasibility_inputs: {
      spread: feasibility.spread as FeasibilityRequirement,
      liquidity: feasibility.liquidity as FeasibilityRequirement,
      volatility: feasibility.volatility as FeasibilityRequirement,
      halt_risk: feasibility.halt_risk as FeasibilityRequirement,
      trigger_attainment: feasibility.trigger_attainment as FeasibilityRequirement,
      conservative_slippage: feasibility.conservative_slippage as FeasibilityRequirement,
    },
  };
}

export function buildRecommendationEvaluationCharterInput({
  ownerUserId,
  segmentKey,
  policy,
  charter,
}: {
  ownerUserId: string;
  segmentKey: string;
  policy: RecommendationLearningBaselineSegment["policy_attribution"];
  charter: unknown;
}): RecommendationEvaluationCharterInput | null {
  const normalizedCharter = parseRecommendationEvaluationCharterDefinition(charter);
  const normalizedPolicy = policyAttribution(policy);
  if (!validUuid(ownerUserId) || !boundedText(segmentKey, 1, 16_384) ||
    !normalizedCharter || !normalizedPolicy) return null;

  const payload = {
    contract_version: RECOMMENDATION_EVALUATION_CHARTER_VERSION,
    owner_user_id: ownerUserId,
    segment_key: segmentKey,
    policy_attribution: normalizedPolicy,
    charter: normalizedCharter,
  };

  return {
    ...payload,
    charter_fingerprint: createHash("sha256")
      .update(JSON.stringify(payload), "utf8")
      .digest("hex"),
  };
}

export function recommendationEvaluationCharterFromRow(
  value: unknown,
): RecommendationEvaluationCharter | null {
  if (!isRecord(value) || !validUuid(value.charter_id) ||
    !validEvaluationCharterFingerprint(value.charter_fingerprint) ||
    !validUuid(value.owner_user_id) || !boundedText(value.segment_key, 1, 16_384) ||
    !validIso(value.created_at)) return null;
  const policy = policyAttribution(value.policy_attribution);
  const charter = parseRecommendationEvaluationCharterDefinition(value.charter_json);
  if (!policy || !charter) return null;
  const rebuilt = buildRecommendationEvaluationCharterInput({
    ownerUserId: value.owner_user_id,
    segmentKey: value.segment_key,
    policy,
    charter,
  });
  if (!rebuilt || rebuilt.charter_fingerprint !== value.charter_fingerprint) {
    return null;
  }
  return {
    charter_id: value.charter_id,
    charter_fingerprint: value.charter_fingerprint,
    owner_user_id: value.owner_user_id,
    segment_key: value.segment_key,
    policy_attribution: policy,
    charter,
    created_at: value.created_at,
  };
}

export function recommendationEvaluationCharterMatchesPolicySegment({
  charter,
  segmentKey,
  policy,
}: {
  charter: RecommendationEvaluationCharter;
  segmentKey: string;
  policy: RecommendationLearningBaselineSegment["policy_attribution"];
}) {
  const expected = policyAttribution(policy);
  if (!expected || charter.segment_key !== segmentKey ||
    charter.policy_attribution.recommendation_publish_policy_version !==
      expected.recommendation_publish_policy_version) return false;
  return Object.entries(expected.canonical_evaluation_versions).every(
    ([key, value]) => charter.policy_attribution.canonical_evaluation_versions[
      key as keyof typeof charter.policy_attribution.canonical_evaluation_versions
    ] === value,
  );
}
