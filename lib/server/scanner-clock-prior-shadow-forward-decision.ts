import "server-only";

import { createHash } from "node:crypto";

import {
  canonicalQualityCalibrationBuckets,
  canonicalQualityPublishabilityPolicy,
  canonicalQualityRankingKValues,
} from "@/lib/canonical-quality-metrics";
import type { RecommendationEvaluationCharter } from "@/lib/recommendation-evaluation-charter";
import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ObservationCycleReceipt } from "@/lib/observation-cycle-receipt";
import type { BasicFreeScheduledScanCreditReadback } from "@/lib/basic-free-scheduled-scan-credit-readback";
import {
  SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION,
  buildScannerScoreProbabilityCalibrationModel,
  type ScannerScoreProbabilityCalibrationTrainingInput,
} from "@/lib/scanner-score-probability-calibration";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
  scannerClockPriorShadowComparisonFromUnknown,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  buildCanonicalShadowVersionTuple,
  deriveCanonicalShadowVersionDifferenceSet,
  type CanonicalShadowVersionDifferenceSet,
  type CanonicalShadowVersionTuple,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  evaluateScannerClockPriorShadowScan,
  SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION,
} from "@/lib/server/scanner-clock-prior-shadow-canonical-evaluation";
import {
  SCANNER_RANKING_SHADOW_CANDIDATE_PERFORMANCE_AT_K_VERSION,
  SCANNER_RANKING_SHADOW_CONCENTRATION_INPUT_VERSION,
  SCANNER_RANKING_SHADOW_DIAGNOSTIC_THRESHOLD_POLICY_VERSION,
  SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_INPUT_VERSION,
  SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION,
  type ScannerRankingShadowConcentrationInput,
  type ScannerRankingShadowProbabilityCalibrationObservation,
} from "@/lib/server/scanner-intraday-liquidity-shadow-canonical-evaluation";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_PLAN_VERSION =
  "scanner_clock_prior_shadow_forward_decision_plan_v2" as const;
export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION =
  "scanner_clock_prior_shadow_forward_decision_v2" as const;
export const SCANNER_CLOCK_PRIOR_SHADOW_POLICY_REFERENCE_VERSION =
  "scanner_clock_prior_shadow_policy_reference_v1" as const;
export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_SCORECARD_METRICS_VERSION =
  "scanner_clock_prior_shadow_forward_scorecard_metrics_v4" as const;

type RankingK = (typeof canonicalQualityRankingKValues)[number];
type PartitionName = "held_out" | "walk_forward";

const MAXIMUM_SCAN_RUNS = 10_000;
const MAXIMUM_SNAPSHOTS_OR_OUTCOMES = 100_000;

export type ScannerClockPriorShadowForwardWindow = {
  start_at: string;
  end_at: string;
  minimum_opportunity_sets: number;
  minimum_ranked_candidates: number;
  minimum_trading_days: number;
};

export type ScannerClockPriorShadowPolicyReference = {
  contract_version: typeof SCANNER_CLOCK_PRIOR_SHADOW_POLICY_REFERENCE_VERSION;
  reference_fingerprint: string;
  created_at: string;
  owner_user_id: string;
  segment_key: string;
  evaluation_charter_id: string;
  evaluation_charter_fingerprint: string;
  baseline_version_tuple: CanonicalShadowVersionTuple;
  candidate_version_tuple: CanonicalShadowVersionTuple;
  version_difference_set: CanonicalShadowVersionDifferenceSet;
  source_revision: {
    recommendation_publish_policy_version: string;
    git_commit: string;
    build_identity: string;
  };
  evidence_classification: "semantic_identity_not_quality_baseline";
  quality_evidence_status: "not_evaluated";
  generic_learning_baseline_required_for_promotion: true;
  shadow_only: true;
  live_ranking_effect: false;
  publication_effect: false;
  promotion_effect: false;
  provider_effect: false;
  broker_effect: false;
};

export type ScannerClockPriorShadowForwardDecisionPlan = {
  contract_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_PLAN_VERSION;
  plan_fingerprint: string;
  created_at: string;
  owner_user_id: string;
  segment_key: string;
  hypothesis: string;
  evaluation_charter_id: string;
  evaluation_charter_fingerprint: string;
  policy_reference: ScannerClockPriorShadowPolicyReference;
  baseline_ranking_version: string;
  candidate_ranking_version: string;
  primary_k: RankingK;
  windows: Record<PartitionName, ScannerClockPriorShadowForwardWindow>;
  thresholds: {
    continue_minimum_precision_delta: number;
    reject_maximum_precision_delta: number;
  };
};

export type ScannerClockPriorShadowForwardDecisionPlanInput = Omit<
  ScannerClockPriorShadowForwardDecisionPlan,
  "contract_version" | "plan_fingerprint"
>;

export type ScannerClockPriorShadowForwardEvidenceBindings = {
  evaluation_charter: {
    charter_id: string;
    charter_fingerprint: string;
    owner_user_id: string;
    segment_key: string;
    hypothesis: string;
    baseline_ranking_version: string;
    created_at: string;
  };
  policy_reference: {
    reference_fingerprint: string;
    owner_user_id: string;
    segment_key: string;
    evaluation_charter_fingerprint: string;
    baseline_ranking_version: string;
    candidate_ranking_version: string;
    created_at: string;
  };
};

type ProportionInterval = {
  value: number;
  numerator: number;
  denominator: number;
  lower: number;
  upper: number;
};

type ConcentrationShare = {
  key: string;
  value: number;
  numerator: number;
  denominator: number;
};

type ConcentrationSummary = {
  denominator: number;
  maximum_single_ticker_share: ConcentrationShare | null;
  maximum_single_sector_share: ConcentrationShare | null;
  maximum_single_setup_share: ConcentrationShare | null;
  maximum_single_regime_share: ConcentrationShare | null;
};

type CalibrationArmSummary = {
  brier_score: number;
  expected_calibration_error: number;
};

type ProbabilityCalibrationSummary = {
  model_version: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION;
  model_fingerprint: string;
  observation_version:
    typeof SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION;
  binary_outcome_count: number;
  probability_coverage: ProportionInterval;
  baseline: CalibrationArmSummary;
  candidate: CalibrationArmSummary;
  bucket_policy: "fixed_calibration_buckets_v1";
};

export type ScannerClockPriorShadowForwardRuntimeEvidence = Readonly<{
  receipt: ObservationCycleReceipt;
  credit_readback: BasicFreeScheduledScanCreditReadback;
}>;

type RuntimeReliabilitySummary = {
  invocation_count: number;
  admitted_attempt_count: number;
  completed_attempt_count: number;
  terminal_error_count: number;
  active_attempt_count: number;
  admission_rejected_count: number;
  admission_unknown_count: number;
  linked_decision_count: number;
  timeout_error_count: number;
  rate_limit_error_count: number;
  provider_error_count: number;
  other_error_count: number;
  reliability: ProportionInterval | null;
};

type ProviderCostSummary = {
  decision_denominator: number;
  exact_credit_receipt_count: number;
  finalized_credit_receipt_count: number;
  provider_request_attempt_count: number;
  provider_ticker_request_count: number;
  reserved_provider_credits: number;
  credits_per_decision: number | null;
};

export type ScannerClockPriorShadowForwardPartitionResult = {
  scorecard_metrics_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_SCORECARD_METRICS_VERSION;
  partition: PartitionName;
  opportunity_set_count: number;
  no_trade_opportunity_set_count: number;
  ranked_candidate_count: number;
  trading_day_count: number;
  baseline_precision: ProportionInterval | null;
  candidate_precision: ProportionInterval | null;
  outcome_coverage: ProportionInterval | null;
  evidence_missingness: ProportionInterval | null;
  concentration: ConcentrationSummary;
  probability_calibration: ProbabilityCalibrationSummary | null;
  runtime_reliability: RuntimeReliabilitySummary;
  provider_cost: ProviderCostSummary;
  precision_delta: {
    value: number;
    conservative_lower: number;
    conservative_upper: number;
    interval_method: "seeded_trading_day_cluster_bootstrap_v1";
    bootstrap_iterations: 1_000;
    bootstrap_seed: string;
  } | null;
  evidence_complete: boolean;
  reason_codes: string[];
};

export type ScannerClockPriorShadowForwardDecisionResult = {
  contract_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION;
  status:
    | "invalid_plan"
    | "conflicting"
    | "evidence_incomplete"
    | "decision_ready";
  decision: "pending" | "continue" | "narrow" | "reject";
  plan_fingerprint: string | null;
  evidence_binding: {
    owner_user_id: string;
    segment_key: string;
    evaluation_charter_id: string;
    evaluation_charter_fingerprint: string;
    policy_reference_fingerprint: string;
  } | null;
  partitions: ScannerClockPriorShadowForwardPartitionResult[];
  reason_codes: string[];
  shadow_only: true;
  live_ranking_effect: false;
  publication_effect: false;
  causal_improvement_claimed: false;
  authority: {
    can_change_ranking_or_publication: false;
    can_promote_policy: false;
    can_request_provider_data: false;
    can_execute_broker_action: false;
  };
};

const safety = {
  shadow_only: true as const,
  live_ranking_effect: false as const,
  publication_effect: false as const,
  causal_improvement_claimed: false as const,
  authority: {
    can_change_ranking_or_publication: false as const,
    can_promote_policy: false as const,
    can_request_provider_data: false as const,
    can_execute_broker_action: false as const,
  },
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

function fingerprint(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function boundedUnitDelta(value: unknown): value is number {
  return finite(value) && value >= -1 && value <= 1;
}

function positiveInteger(value: unknown): value is number {
  return finite(value) && Number.isInteger(value) && value >= 1;
}

function validIso(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validFingerprint(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function boundedText(value: unknown, minimum: number, maximum: number) {
  return typeof value === "string" &&
    value.trim().length >= minimum &&
    value.trim().length <= maximum;
}

function validWindow(value: ScannerClockPriorShadowForwardWindow) {
  return validIso(value?.start_at) &&
    validIso(value?.end_at) &&
    Date.parse(value.start_at) < Date.parse(value.end_at) &&
    positiveInteger(value.minimum_opportunity_sets) &&
    value.minimum_opportunity_sets >=
      canonicalQualityPublishabilityPolicy.minimum_ranking_opportunity_sets &&
    positiveInteger(value.minimum_ranked_candidates) &&
    value.minimum_ranked_candidates >=
      canonicalQualityPublishabilityPolicy.minimum_proportion_identities &&
    positiveInteger(value.minimum_trading_days) &&
    value.minimum_trading_days >=
      canonicalQualityPublishabilityPolicy.minimum_trading_days;
}

function policyReferencePayload(
  value: Omit<ScannerClockPriorShadowPolicyReference, "reference_fingerprint">,
) {
  return {
    contract_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_REFERENCE_VERSION,
    created_at: value.created_at,
    owner_user_id: value.owner_user_id,
    segment_key: value.segment_key.trim(),
    evaluation_charter_id: value.evaluation_charter_id,
    evaluation_charter_fingerprint: value.evaluation_charter_fingerprint,
    baseline_version_tuple: value.baseline_version_tuple,
    candidate_version_tuple: value.candidate_version_tuple,
    version_difference_set: value.version_difference_set,
    source_revision: value.source_revision,
    evidence_classification: "semantic_identity_not_quality_baseline" as const,
    quality_evidence_status: "not_evaluated" as const,
    generic_learning_baseline_required_for_promotion: true as const,
    shadow_only: true as const,
    live_ranking_effect: false as const,
    publication_effect: false as const,
    promotion_effect: false as const,
    provider_effect: false as const,
    broker_effect: false as const,
  };
}

export function buildScannerClockPriorShadowPolicyReference({
  charter,
  createdAt,
}: {
  charter: RecommendationEvaluationCharter;
  createdAt: string;
}): ScannerClockPriorShadowPolicyReference | null {
  const versions = charter.policy_attribution.canonical_evaluation_versions;
  if (
    !validIso(createdAt) ||
    !validUuid(charter.owner_user_id) ||
    !validUuid(charter.charter_id) ||
    !validFingerprint(charter.charter_fingerprint) ||
    !boundedText(charter.segment_key, 1, 16_384) ||
    versions.ranking_version !== SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION ||
    Date.parse(charter.created_at) > Date.parse(createdAt)
  ) {
    return null;
  }
  const shared = {
    engine_version: versions.engine_version,
    scoring_version: versions.scoring_version,
    threshold_policy_version:
      SCANNER_RANKING_SHADOW_DIAGNOSTIC_THRESHOLD_POLICY_VERSION,
    setup_taxonomy_version: versions.setup_taxonomy_version,
    confidence_contract_version: versions.confidence_contract_version,
    evaluator_version: versions.evaluator_version,
    provider_contract_version: versions.provider_contract_version,
  };
  const baselineVersions = {
    ...shared,
    ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  };
  const candidateVersions = {
    ...shared,
    ranking_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
  };
  const baseline = buildCanonicalShadowVersionTuple(baselineVersions);
  const candidate = buildCanonicalShadowVersionTuple(candidateVersions);
  const differences = deriveCanonicalShadowVersionDifferenceSet({
    baseline: baselineVersions,
    candidate: candidateVersions,
  });
  if (
    differences.differences.length !== 1 ||
    differences.differences[0] !== "ranking_version"
  ) {
    return null;
  }
  const payload = policyReferencePayload({
    contract_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_REFERENCE_VERSION,
    created_at: createdAt,
    owner_user_id: charter.owner_user_id,
    segment_key: charter.segment_key,
    evaluation_charter_id: charter.charter_id,
    evaluation_charter_fingerprint: charter.charter_fingerprint,
    baseline_version_tuple: baseline,
    candidate_version_tuple: candidate,
    version_difference_set: differences,
    source_revision: {
      recommendation_publish_policy_version:
        charter.policy_attribution.recommendation_publish_policy_version,
      git_commit: versions.git_commit,
      build_identity: versions.build_identity,
    },
    evidence_classification: "semantic_identity_not_quality_baseline",
    quality_evidence_status: "not_evaluated",
    generic_learning_baseline_required_for_promotion: true,
    shadow_only: true,
    live_ranking_effect: false,
    publication_effect: false,
    promotion_effect: false,
    provider_effect: false,
    broker_effect: false,
  });
  return Object.freeze({
    ...payload,
    reference_fingerprint: fingerprint(payload),
  });
}

function verifiedPolicyReference(value: ScannerClockPriorShadowPolicyReference) {
  if (
    value.contract_version !== SCANNER_CLOCK_PRIOR_SHADOW_POLICY_REFERENCE_VERSION ||
    !validFingerprint(value.reference_fingerprint) ||
    value.evidence_classification !== "semantic_identity_not_quality_baseline" ||
    value.quality_evidence_status !== "not_evaluated" ||
    value.generic_learning_baseline_required_for_promotion !== true ||
    value.shadow_only !== true || value.live_ranking_effect !== false ||
    value.publication_effect !== false || value.promotion_effect !== false ||
    value.provider_effect !== false || value.broker_effect !== false ||
    value.baseline_version_tuple.ranking_version !==
      SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION ||
    value.candidate_version_tuple.ranking_version !==
      SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION ||
    value.version_difference_set.differences.length !== 1 ||
    value.version_difference_set.differences[0] !== "ranking_version" ||
    value.version_difference_set.baseline_version_tuple_digest !==
      value.baseline_version_tuple.semantic_digest ||
    value.version_difference_set.candidate_version_tuple_digest !==
      value.candidate_version_tuple.semantic_digest
  ) return null;
  const payload = policyReferencePayload(value);
  return fingerprint(payload) === value.reference_fingerprint ? value : null;
}

function planPayload(input: ScannerClockPriorShadowForwardDecisionPlanInput) {
  return {
    contract_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_PLAN_VERSION,
    created_at: input.created_at,
    owner_user_id: input.owner_user_id,
    segment_key: input.segment_key.trim(),
    hypothesis: input.hypothesis.trim(),
    evaluation_charter_id: input.evaluation_charter_id,
    evaluation_charter_fingerprint: input.evaluation_charter_fingerprint,
    policy_reference: input.policy_reference,
    baseline_ranking_version: input.baseline_ranking_version.trim(),
    candidate_ranking_version: input.candidate_ranking_version.trim(),
    primary_k: input.primary_k,
    windows: input.windows,
    thresholds: input.thresholds,
  };
}

export function buildScannerClockPriorShadowForwardDecisionPlan(
  input: ScannerClockPriorShadowForwardDecisionPlanInput,
): ScannerClockPriorShadowForwardDecisionPlan | null {
  if (
    !validIso(input.created_at) ||
    !validUuid(input.owner_user_id) ||
    !boundedText(input.segment_key, 1, 16_384) ||
    !boundedText(input.hypothesis, 20, 2_800) ||
    !validUuid(input.evaluation_charter_id) ||
    !validFingerprint(input.evaluation_charter_fingerprint) ||
    !verifiedPolicyReference(input.policy_reference) ||
    input.policy_reference.owner_user_id !== input.owner_user_id ||
    input.policy_reference.segment_key !== input.segment_key ||
    input.policy_reference.evaluation_charter_id !==
      input.evaluation_charter_id ||
    input.policy_reference.evaluation_charter_fingerprint !==
      input.evaluation_charter_fingerprint ||
    Date.parse(input.policy_reference.created_at) > Date.parse(input.created_at) ||
    !boundedText(input.baseline_ranking_version, 1, 512) ||
    !boundedText(input.candidate_ranking_version, 1, 512) ||
    input.baseline_ranking_version.trim() ===
      input.candidate_ranking_version.trim() ||
    input.baseline_ranking_version !==
      input.policy_reference.baseline_version_tuple.ranking_version ||
    input.candidate_ranking_version !==
      input.policy_reference.candidate_version_tuple.ranking_version ||
    !canonicalQualityRankingKValues.includes(input.primary_k) ||
    !validWindow(input.windows?.held_out) ||
    !validWindow(input.windows?.walk_forward) ||
    Date.parse(input.created_at) >= Date.parse(input.windows.held_out.start_at) ||
    Date.parse(input.windows.held_out.end_at) >
      Date.parse(input.windows.walk_forward.start_at) ||
    !boundedUnitDelta(
      input.thresholds?.continue_minimum_precision_delta,
    ) ||
    !boundedUnitDelta(input.thresholds?.reject_maximum_precision_delta) ||
    input.thresholds.reject_maximum_precision_delta >=
      input.thresholds.continue_minimum_precision_delta
  ) {
    return null;
  }
  const payload = planPayload(input);
  return Object.freeze({
    ...payload,
    plan_fingerprint: fingerprint(payload),
  });
}

function evidenceBindingsMatchPlan(
  plan: ScannerClockPriorShadowForwardDecisionPlan,
  bindings: ScannerClockPriorShadowForwardEvidenceBindings | null,
) {
  if (!bindings) return false;
  const charter = bindings.evaluation_charter;
  const reference = bindings.policy_reference;
  return validUuid(charter.charter_id) &&
    validFingerprint(charter.charter_fingerprint) &&
    validUuid(charter.owner_user_id) &&
    boundedText(charter.segment_key, 1, 16_384) &&
    boundedText(charter.hypothesis, 20, 2_800) &&
    boundedText(charter.baseline_ranking_version, 1, 512) &&
    validIso(charter.created_at) &&
    validFingerprint(reference.reference_fingerprint) &&
    validUuid(reference.owner_user_id) &&
    boundedText(reference.segment_key, 1, 16_384) &&
    validFingerprint(reference.evaluation_charter_fingerprint) &&
    boundedText(reference.baseline_ranking_version, 1, 512) &&
    boundedText(reference.candidate_ranking_version, 1, 512) &&
    validIso(reference.created_at) &&
    charter.charter_id === plan.evaluation_charter_id &&
    charter.charter_fingerprint === plan.evaluation_charter_fingerprint &&
    charter.owner_user_id === plan.owner_user_id &&
    charter.segment_key === plan.segment_key &&
    charter.hypothesis.trim() === plan.hypothesis &&
    charter.baseline_ranking_version === plan.baseline_ranking_version &&
    reference.reference_fingerprint ===
      plan.policy_reference.reference_fingerprint &&
    reference.owner_user_id === plan.owner_user_id &&
    reference.segment_key === plan.segment_key &&
    reference.evaluation_charter_fingerprint ===
      plan.evaluation_charter_fingerprint &&
    reference.baseline_ranking_version === plan.baseline_ranking_version &&
    reference.candidate_ranking_version === plan.candidate_ranking_version &&
    Date.parse(charter.created_at) <= Date.parse(plan.created_at) &&
    Date.parse(reference.created_at) <= Date.parse(plan.created_at);
}

function verifiedPlan(
  value: ScannerClockPriorShadowForwardDecisionPlan | null,
) {
  if (!value || value.contract_version !==
    SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_PLAN_VERSION) return null;
  const rebuilt = buildScannerClockPriorShadowForwardDecisionPlan(value);
  return rebuilt?.plan_fingerprint === value.plan_fingerprint ? rebuilt : null;
}

function emptyPartition(
  partition: PartitionName,
  reasonCodes: string[],
): ScannerClockPriorShadowForwardPartitionResult {
  return {
    scorecard_metrics_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_SCORECARD_METRICS_VERSION,
    partition,
    opportunity_set_count: 0,
    no_trade_opportunity_set_count: 0,
    ranked_candidate_count: 0,
    trading_day_count: 0,
    baseline_precision: null,
    candidate_precision: null,
    outcome_coverage: null,
    evidence_missingness: null,
    concentration: {
      denominator: 0,
      maximum_single_ticker_share: null,
      maximum_single_sector_share: null,
      maximum_single_setup_share: null,
      maximum_single_regime_share: null,
    },
    probability_calibration: null,
    runtime_reliability: {
      invocation_count: 0,
      admitted_attempt_count: 0,
      completed_attempt_count: 0,
      terminal_error_count: 0,
      active_attempt_count: 0,
      admission_rejected_count: 0,
      admission_unknown_count: 0,
      linked_decision_count: 0,
      timeout_error_count: 0,
      rate_limit_error_count: 0,
      provider_error_count: 0,
      other_error_count: 0,
      reliability: null,
    },
    provider_cost: {
      decision_denominator: 0,
      exact_credit_receipt_count: 0,
      finalized_credit_receipt_count: 0,
      provider_request_attempt_count: 0,
      provider_ticker_request_count: 0,
      reserved_provider_credits: 0,
      credits_per_decision: null,
    },
    precision_delta: null,
    evidence_complete: false,
    reason_codes: uniqueSorted(reasonCodes),
  };
}

function terminalResult(input: {
  status: ScannerClockPriorShadowForwardDecisionResult["status"];
  decision?: ScannerClockPriorShadowForwardDecisionResult["decision"];
  plan?: ScannerClockPriorShadowForwardDecisionPlan | null;
  partitions?: ScannerClockPriorShadowForwardPartitionResult[];
  reasons: Iterable<string>;
}): ScannerClockPriorShadowForwardDecisionResult {
  const reasons = uniqueSorted(input.reasons);
  return {
    contract_version: SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION,
    status: input.status,
    decision: input.decision ?? "pending",
    plan_fingerprint: input.plan?.plan_fingerprint ?? null,
    evidence_binding: input.plan
      ? {
          owner_user_id: input.plan.owner_user_id,
          segment_key: input.plan.segment_key,
          evaluation_charter_id: input.plan.evaluation_charter_id,
          evaluation_charter_fingerprint:
            input.plan.evaluation_charter_fingerprint,
          policy_reference_fingerprint:
            input.plan.policy_reference.reference_fingerprint,
        }
      : null,
    partitions: input.partitions ?? [
      emptyPartition("held_out", reasons),
      emptyPartition("walk_forward", reasons),
    ],
    reason_codes: reasons,
    ...safety,
  };
}

function partitionForTimestamp(
  timestamp: string,
  windows: ScannerClockPriorShadowForwardDecisionPlan["windows"],
): PartitionName | null {
  const observed = Date.parse(timestamp);
  for (const partition of ["held_out", "walk_forward"] as const) {
    const window = windows[partition];
    if (
      observed >= Date.parse(window.start_at) &&
      observed < Date.parse(window.end_at)
    ) return partition;
  }
  return null;
}

function wilson(numerator: number, denominator: number): ProportionInterval {
  const value = numerator / denominator;
  const z = 1.959963984540054;
  const zSquared = z * z;
  const adjusted = 1 + zSquared / denominator;
  const center = (value + zSquared / (2 * denominator)) / adjusted;
  const margin = z * Math.sqrt(
    (value * (1 - value) + zSquared / (4 * denominator)) / denominator,
  ) / adjusted;
  return {
    value,
    numerator,
    denominator,
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
  };
}

type PartitionObservation = {
  decision_at: string;
  no_trade: boolean;
  ranked_candidate_count: number;
  baseline_numerator: number;
  baseline_denominator: number;
  candidate_numerator: number;
  candidate_denominator: number;
  candidate_expectancy_numerator: number;
  candidate_expectancy_denominator: number;
};

type PartitionCoverageObservation = {
  expected_candidate_count: number;
  exact_snapshot_count: number;
  canonical_primary_outcome_count: number;
};

function rounded(value: number) {
  return Math.round(value * 1e12) / 1e12;
}

function calibrationError(
  rows: Array<{ probability: number; actual: 0 | 1 }>,
) {
  let value = 0;
  for (const bucket of canonicalQualityCalibrationBuckets) {
    const members = rows.filter(
      (row) =>
        row.probability >= bucket.lower &&
        (row.probability < bucket.upper ||
          (bucket.include_upper && row.probability === bucket.upper)),
    );
    if (members.length === 0) continue;
    const averageProbability = members.reduce(
      (sum, row) => sum + row.probability,
      0,
    ) / members.length;
    const observedRate = members.reduce(
      (sum, row) => sum + row.actual,
      0,
    ) / members.length;
    value += Math.abs(averageProbability - observedRate) *
      (members.length / rows.length);
  }
  return rounded(value);
}

function calibrationArmSummary(
  rows: Array<{ probability: number; actual: 0 | 1 }>,
): CalibrationArmSummary {
  return {
    brier_score: rounded(
      rows.reduce(
        (sum, row) => sum + (row.probability - row.actual) ** 2,
        0,
      ) / rows.length,
    ),
    expected_calibration_error: calibrationError(rows),
  };
}

function probabilityCalibrationSummary(input: {
  observations: ScannerRankingShadowProbabilityCalibrationObservation[];
  modelFingerprint: string | null;
}) {
  const binaryRows = input.observations.filter(
    (observation): observation is
      ScannerRankingShadowProbabilityCalibrationObservation & {
        terminal_binary: 0 | 1;
      } => observation.terminal_binary === 0 || observation.terminal_binary === 1,
  );
  const uniqueIdentities = new Set(
    binaryRows.map((observation) => observation.candidate_id),
  );
  const probabilityRows = binaryRows.filter(
    (observation): observation is typeof observation & {
      baseline_probability: number;
      candidate_probability: number;
    } =>
      finite(observation.baseline_probability) &&
      observation.baseline_probability >= 0 &&
      observation.baseline_probability <= 1 &&
      finite(observation.candidate_probability) &&
      observation.candidate_probability >= 0 &&
      observation.candidate_probability <= 1,
  );
  const denominator = binaryRows.length;
  const probabilityCoverage = denominator > 0
    ? wilson(probabilityRows.length, denominator)
    : null;
  const modelFingerprint = input.modelFingerprint;
  const complete =
    validFingerprint(modelFingerprint) &&
    denominator >= canonicalQualityPublishabilityPolicy
      .minimum_calibration_identities &&
    uniqueIdentities.size === denominator &&
    probabilityRows.length === denominator &&
    probabilityCoverage !== null;
  if (!complete || !validFingerprint(modelFingerprint) || !probabilityCoverage) {
    return { summary: null, complete: false };
  }
  const baselineRows = probabilityRows.map((observation) => ({
    probability: observation.baseline_probability,
    actual: observation.terminal_binary,
  }));
  const candidateRows = probabilityRows.map((observation) => ({
    probability: observation.candidate_probability,
    actual: observation.terminal_binary,
  }));
  return {
    summary: {
      model_version: SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION,
      model_fingerprint: modelFingerprint,
      observation_version:
        SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION,
      binary_outcome_count: denominator,
      probability_coverage: probabilityCoverage,
      baseline: calibrationArmSummary(baselineRows),
      candidate: calibrationArmSummary(candidateRows),
      bucket_policy: "fixed_calibration_buckets_v1" as const,
    } satisfies ProbabilityCalibrationSummary,
    complete: true,
  };
}

function maximumConcentrationShare(
  values: string[],
  denominator: number,
): ConcentrationShare | null {
  if (denominator < 1 || values.length !== denominator) return null;
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const maximum = [...counts.entries()].sort(
    ([leftKey, leftCount], [rightKey, rightCount]) =>
      rightCount - leftCount || leftKey.localeCompare(rightKey),
  )[0];
  return maximum
    ? {
        key: maximum[0],
        value: maximum[1] / denominator,
        numerator: maximum[1],
        denominator,
      }
    : null;
}

function concentrationSummary(input: {
  observations: ScannerRankingShadowConcentrationInput[];
  denominator: number;
}) {
  const identities = new Set(input.observations.map((item) => item.candidate_id));
  const complete = input.denominator > 0 &&
    input.observations.length === input.denominator &&
    identities.size === input.denominator;
  const observations = complete ? input.observations : [];
  return {
    summary: {
      denominator: input.denominator,
      maximum_single_ticker_share: maximumConcentrationShare(
        observations.map((item) => item.ticker),
        input.denominator,
      ),
      maximum_single_sector_share: maximumConcentrationShare(
        observations.map((item) => item.sector),
        input.denominator,
      ),
      maximum_single_setup_share: maximumConcentrationShare(
        observations.map((item) => item.setup),
        input.denominator,
      ),
      maximum_single_regime_share: maximumConcentrationShare(
        observations.map((item) => item.regime),
        input.denominator,
      ),
    } satisfies ConcentrationSummary,
    complete,
  };
}

function seededUnit(seed: string) {
  let state = createHash("sha256").update(seed).digest().readUInt32BE(0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function clusteredPrecisionDeltaInterval(
  observations: PartitionObservation[],
  seed: string,
) {
  const ranked = observations.filter((observation) => !observation.no_trade);
  const byDay = new Map<string, PartitionObservation[]>();
  for (const observation of ranked) {
    const day = observation.decision_at.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), observation]);
  }
  const clusters = [...byDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, values]) => values);
  if (clusters.length === 0) return null;
  const random = seededUnit(seed);
  const values: number[] = [];
  for (let iteration = 0;
    iteration < canonicalQualityPublishabilityPolicy.bootstrap_iterations;
    iteration += 1) {
    let baselineNumerator = 0;
    let baselineDenominator = 0;
    let candidateNumerator = 0;
    let candidateDenominator = 0;
    for (let index = 0; index < clusters.length; index += 1) {
      const cluster = clusters[Math.floor(random() * clusters.length)]!;
      for (const observation of cluster) {
        baselineNumerator += observation.baseline_numerator;
        baselineDenominator += observation.baseline_denominator;
        candidateNumerator += observation.candidate_numerator;
        candidateDenominator += observation.candidate_denominator;
      }
    }
    if (baselineDenominator > 0 && candidateDenominator > 0) {
      values.push(
        candidateNumerator / candidateDenominator -
          baselineNumerator / baselineDenominator,
      );
    }
  }
  if (values.length !==
    canonicalQualityPublishabilityPolicy.bootstrap_iterations) return null;
  values.sort((left, right) => left - right);
  const lowerIndex = Math.floor((values.length - 1) * 0.025);
  const upperIndex = Math.ceil((values.length - 1) * 0.975);
  return {
    lower: values[lowerIndex]!,
    upper: values[upperIndex]!,
  };
}

function runtimeSignalText(receipt: ObservationCycleReceipt) {
  return [
    receipt.provider_response.latest_error_type,
    ...receipt.admission.reason_codes,
    ...receipt.freshness.reason_codes,
    ...receipt.publication.reason_codes,
    ...receipt.decision.reason_codes,
  ].filter((value): value is string => Boolean(value)).join(" ").toLowerCase();
}

function runtimeFailureClass(
  evidence: ScannerClockPriorShadowForwardRuntimeEvidence,
) {
  const receipt = evidence.receipt;
  const signal = runtimeSignalText(receipt);
  if (signal.includes("timeout") || signal.includes("timed_out")) {
    return "timeout" as const;
  }
  if (
    signal.includes("rate_limit") ||
    signal.includes("rate-limit") ||
    evidence.credit_readback.reservation.safe_blocker ===
      "per_minute_credit_limit_reached" ||
    evidence.credit_readback.reservation.safe_blocker ===
      "daily_credit_limit_reached"
  ) {
    return "rate_limit" as const;
  }
  if (
    receipt.provider_response.status === "failed" ||
    receipt.provider_response.error_count > 0 ||
    receipt.provider_response.latest_error_type !== null
  ) {
    return "provider_error" as const;
  }
  return "other_error" as const;
}

function runtimeAndCostSummary(input: {
  evidence: ScannerClockPriorShadowForwardRuntimeEvidence[];
  expectedScanFingerprints: Set<string>;
}) {
  const admitted = input.evidence.filter(
    (item) => item.receipt.admission.status === "admitted",
  );
  const completed = admitted.filter(
    (item) =>
      item.receipt.cycle_status === "completed" &&
      item.receipt.scan_run_fingerprint !== null &&
      input.expectedScanFingerprints.has(item.receipt.scan_run_fingerprint),
  );
  const terminalErrors = admitted.filter(
    (item) =>
      item.receipt.cycle_status !== "active" &&
      !completed.includes(item),
  );
  const active = admitted.filter(
    (item) => item.receipt.cycle_status === "active",
  );
  const failureClasses = terminalErrors.map(runtimeFailureClass);
  const exactCreditReceipts = admitted.filter(
    (item) => item.credit_readback.status === "available",
  );
  const finalizedCreditReceipts = exactCreditReceipts.filter((item) => {
    const reservation = item.credit_readback.reservation;
    return reservation.status === "not_required" ||
      reservation.finalization_proven === true;
  });
  const reservedProviderCredits = admitted.reduce(
    (sum, item) => sum + item.receipt.provider_request.reserved_credits,
    0,
  );
  const denominator = admitted.length;
  const linkedDecisionCount = admitted.filter(
    (item) =>
      item.receipt.scan_run_fingerprint !== null &&
      input.expectedScanFingerprints.has(item.receipt.scan_run_fingerprint),
  ).length;

  return {
    reliability: {
      invocation_count: input.evidence.length,
      admitted_attempt_count: denominator,
      completed_attempt_count: completed.length,
      terminal_error_count: terminalErrors.length,
      active_attempt_count: active.length,
      admission_rejected_count: input.evidence.filter(
        (item) => item.receipt.admission.status === "rejected",
      ).length,
      admission_unknown_count: input.evidence.filter(
        (item) => item.receipt.admission.status === "unknown",
      ).length,
      linked_decision_count: linkedDecisionCount,
      timeout_error_count: failureClasses.filter((value) => value === "timeout")
        .length,
      rate_limit_error_count: failureClasses.filter(
        (value) => value === "rate_limit",
      ).length,
      provider_error_count: failureClasses.filter(
        (value) => value === "provider_error",
      ).length,
      other_error_count: failureClasses.filter(
        (value) => value === "other_error",
      ).length,
      reliability: denominator > 0 ? wilson(completed.length, denominator) : null,
    } satisfies RuntimeReliabilitySummary,
    cost: {
      decision_denominator: denominator,
      exact_credit_receipt_count: exactCreditReceipts.length,
      finalized_credit_receipt_count: finalizedCreditReceipts.length,
      provider_request_attempt_count: admitted.filter(
        (item) => item.receipt.provider_request.status === "attempted",
      ).length,
      provider_ticker_request_count: admitted.reduce(
        (sum, item) => sum + item.receipt.provider_request.attempted_tickers,
        0,
      ),
      reserved_provider_credits: reservedProviderCredits,
      credits_per_decision: denominator > 0
        ? rounded(reservedProviderCredits / denominator)
        : null,
    } satisfies ProviderCostSummary,
  };
}

function summarizePartition(input: {
  partition: PartitionName;
  observations: PartitionObservation[];
  coverageObservations: PartitionCoverageObservation[];
  concentrationObservations: ScannerRankingShadowConcentrationInput[];
  probabilityCalibrationObservations:
    ScannerRankingShadowProbabilityCalibrationObservation[];
  probabilityCalibrationModelFingerprint: string | null;
  runtimeEvidence: ScannerClockPriorShadowForwardRuntimeEvidence[];
  expectedScanFingerprints: Set<string>;
  window: ScannerClockPriorShadowForwardWindow;
  evaluationReasons: string[];
  bootstrapSeed: string;
}) {
  const ranked = input.observations.filter((observation) => !observation.no_trade);
  const rankedCandidateCount = input.observations.reduce(
    (sum, observation) => sum + observation.ranked_candidate_count,
    0,
  );
  const tradingDayCount = new Set(
    input.observations.map((observation) => observation.decision_at.slice(0, 10)),
  ).size;
  const reasons = [...input.evaluationReasons];
  if (input.observations.length < input.window.minimum_opportunity_sets) {
    reasons.push("minimum_opportunity_sets_not_met");
  }
  if (rankedCandidateCount < input.window.minimum_ranked_candidates) {
    reasons.push("minimum_ranked_candidates_not_met");
  }
  if (tradingDayCount < input.window.minimum_trading_days) {
    reasons.push("minimum_trading_days_not_met");
  }
  const baselineDenominator = ranked.reduce(
    (sum, observation) => sum + observation.baseline_denominator,
    0,
  );
  const candidateDenominator = ranked.reduce(
    (sum, observation) => sum + observation.candidate_denominator,
    0,
  );
  if (
    baselineDenominator === 0 ||
    candidateDenominator === 0 ||
    baselineDenominator !== candidateDenominator
  ) {
    reasons.push("paired_precision_denominator_missing_or_mismatched");
  }
  const baseline = baselineDenominator > 0
    ? wilson(
        ranked.reduce(
          (sum, observation) => sum + observation.baseline_numerator,
          0,
        ),
        baselineDenominator,
      )
    : null;
  const candidate = candidateDenominator > 0
    ? wilson(
        ranked.reduce(
          (sum, observation) => sum + observation.candidate_numerator,
          0,
        ),
        candidateDenominator,
      )
    : null;
  const candidateExpectancyDenominator = ranked.reduce(
    (sum, observation) => sum + observation.candidate_expectancy_denominator,
    0,
  );
  const candidateExpectancy = candidateExpectancyDenominator > 0
    ? ranked.reduce(
        (sum, observation) =>
          sum + observation.candidate_expectancy_numerator,
        0,
      ) / candidateExpectancyDenominator
    : null;
  const expectedOutcomeCount = input.coverageObservations.reduce(
    (sum, observation) => sum + observation.expected_candidate_count,
    0,
  );
  const canonicalOutcomeCount = input.coverageObservations.reduce(
    (sum, observation) => sum + observation.canonical_primary_outcome_count,
    0,
  );
  const exactSnapshotCount = input.coverageObservations.reduce(
    (sum, observation) => sum + observation.exact_snapshot_count,
    0,
  );
  const missingEvidenceCount = expectedOutcomeCount - exactSnapshotCount;
  const outcomeCoverage = expectedOutcomeCount > 0
    ? wilson(canonicalOutcomeCount, expectedOutcomeCount)
    : null;
  const evidenceMissingness = expectedOutcomeCount > 0
    ? wilson(missingEvidenceCount, expectedOutcomeCount)
    : null;
  const concentration = concentrationSummary({
    observations: input.concentrationObservations,
    denominator: expectedOutcomeCount,
  });
  const probabilityCalibration = probabilityCalibrationSummary({
    observations: input.probabilityCalibrationObservations,
    modelFingerprint: input.probabilityCalibrationModelFingerprint,
  });
  const operational = runtimeAndCostSummary({
    evidence: input.runtimeEvidence,
    expectedScanFingerprints: input.expectedScanFingerprints,
  });
  const charterThresholds =
    scannerClockPriorShadowEvaluationCharterDefinition.thresholds;
  if (
    candidate === null ||
    candidate.value < charterThresholds.minimum_precision_at_k
  ) {
    reasons.push("candidate_precision_charter_minimum_not_met");
  }
  if (
    candidateExpectancy === null ||
    candidateExpectancy < charterThresholds.minimum_expectancy_r
  ) {
    reasons.push("candidate_expectancy_charter_minimum_not_met");
  }
  if (
    outcomeCoverage === null ||
    outcomeCoverage.value < charterThresholds.minimum_outcome_coverage
  ) {
    reasons.push("outcome_coverage_charter_minimum_not_met");
  }
  if (
    evidenceMissingness === null ||
    evidenceMissingness.value > charterThresholds.maximum_missingness
  ) {
    reasons.push("evidence_missingness_charter_maximum_exceeded");
  }
  const concentrationLimits =
    scannerClockPriorShadowEvaluationCharterDefinition.concentration_limits;
  if (!concentration.complete) {
    reasons.push("candidate_concentration_denominator_missing_or_mismatched");
  }
  const concentrationChecks = [
    [
      concentration.summary.maximum_single_ticker_share,
      concentrationLimits.maximum_single_ticker_share,
      "ticker_concentration_charter_maximum_exceeded",
    ],
    [
      concentration.summary.maximum_single_sector_share,
      concentrationLimits.maximum_single_sector_share,
      "sector_concentration_charter_maximum_exceeded",
    ],
    [
      concentration.summary.maximum_single_setup_share,
      concentrationLimits.maximum_single_setup_share,
      "setup_concentration_charter_maximum_exceeded",
    ],
    [
      concentration.summary.maximum_single_regime_share,
      concentrationLimits.maximum_single_regime_share,
      "regime_concentration_charter_maximum_exceeded",
    ],
  ] as const;
  for (const [share, maximum, reason] of concentrationChecks) {
    if (share === null || share.value > maximum) reasons.push(reason);
  }
  if (!probabilityCalibration.complete || !probabilityCalibration.summary) {
    reasons.push("candidate_probability_calibration_evidence_incomplete");
  } else if (
    probabilityCalibration.summary.candidate.expected_calibration_error >
      charterThresholds.maximum_calibration_error
  ) {
    reasons.push("candidate_calibration_error_charter_maximum_exceeded");
  }
  if (
    operational.reliability.reliability === null ||
    operational.reliability.reliability.value <
      charterThresholds.minimum_reliability
  ) {
    reasons.push("runtime_reliability_charter_minimum_not_met");
  }
  if (operational.reliability.active_attempt_count > 0) {
    reasons.push("runtime_attempts_not_terminal");
  }
  if (operational.reliability.admission_unknown_count > 0) {
    reasons.push("runtime_admission_evidence_unknown");
  }
  if (
    operational.reliability.linked_decision_count !==
      input.expectedScanFingerprints.size
  ) {
    reasons.push("runtime_decision_lineage_incomplete");
  }
  if (
    operational.cost.exact_credit_receipt_count !==
      operational.cost.decision_denominator ||
    operational.cost.finalized_credit_receipt_count !==
      operational.cost.decision_denominator
  ) {
    reasons.push("provider_cost_receipt_incomplete");
  }
  if (
    operational.cost.credits_per_decision === null ||
    operational.cost.credits_per_decision >
      charterThresholds.maximum_provider_credits_per_decision
  ) {
    reasons.push("provider_cost_charter_maximum_exceeded");
  }
  // Feasibility is the only remaining charter dimension after the exact
  // runtime and provider-cost evidence is attached to this partition.
  reasons.push("forward_charter_scorecard_incomplete");
  const clusteredInterval = clusteredPrecisionDeltaInterval(
    input.observations,
    input.bootstrapSeed,
  );
  if (!clusteredInterval) {
    reasons.push("trading_day_cluster_interval_not_defined");
  }
  const delta = baseline && candidate && clusteredInterval
    ? {
        value: candidate.value - baseline.value,
        conservative_lower: clusteredInterval.lower,
        conservative_upper: clusteredInterval.upper,
        interval_method:
          "seeded_trading_day_cluster_bootstrap_v1" as const,
        bootstrap_iterations: 1_000 as const,
        bootstrap_seed: input.bootstrapSeed,
      }
    : null;
  const reasonCodes = uniqueSorted(reasons);
  return {
    scorecard_metrics_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_SCORECARD_METRICS_VERSION,
    partition: input.partition,
    opportunity_set_count: input.observations.length,
    no_trade_opportunity_set_count: input.observations.filter(
      (observation) => observation.no_trade,
    ).length,
    ranked_candidate_count: rankedCandidateCount,
    trading_day_count: tradingDayCount,
    baseline_precision: baseline,
    candidate_precision: candidate,
    outcome_coverage: outcomeCoverage,
    evidence_missingness: evidenceMissingness,
    concentration: concentration.summary,
    probability_calibration: probabilityCalibration.summary,
    runtime_reliability: operational.reliability,
    provider_cost: operational.cost,
    precision_delta: delta,
    evidence_complete: reasonCodes.length === 0,
    reason_codes: reasonCodes,
  } satisfies ScannerClockPriorShadowForwardPartitionResult;
}

export function classifyScannerClockPriorShadowForwardPrecisionDecision(input: {
  partitions: readonly ScannerClockPriorShadowForwardPartitionResult[];
  thresholds: ScannerClockPriorShadowForwardDecisionPlan["thresholds"];
}): ScannerClockPriorShadowForwardDecisionResult["decision"] {
  const partitionNames = input.partitions.map((partition) => partition.partition);
  if (input.partitions.length !== 2 ||
    new Set(partitionNames).size !== 2 ||
    !partitionNames.includes("held_out") ||
    !partitionNames.includes("walk_forward") ||
    !boundedUnitDelta(input.thresholds.continue_minimum_precision_delta) ||
    !boundedUnitDelta(input.thresholds.reject_maximum_precision_delta) ||
    input.thresholds.reject_maximum_precision_delta >=
      input.thresholds.continue_minimum_precision_delta ||
    input.partitions.some((partition) =>
      !partition.evidence_complete || partition.precision_delta === null
    )) return "pending";
  const deltas = input.partitions.map((partition) => partition.precision_delta!);
  if (deltas.every(
    (delta) => delta.conservative_lower >=
      input.thresholds.continue_minimum_precision_delta,
  )) return "continue";
  if (deltas.some(
    (delta) => delta.conservative_upper <=
      input.thresholds.reject_maximum_precision_delta,
  )) return "reject";
  return "narrow";
}

/**
 * Evaluates a predeclared held-out -> walk-forward clock-prior cohort. The
 * decision is advisory and shadow-only: `continue` means continue shadow
 * validation, never promote the policy or alter live ranking.
 */
export function evaluateScannerClockPriorShadowForwardDecision(input: {
  plan: ScannerClockPriorShadowForwardDecisionPlan | null;
  evidenceBindings: ScannerClockPriorShadowForwardEvidenceBindings | null;
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  calibrationScanRuns?: LearningBaselineScanRun[];
  calibrationSnapshots?: RecommendationSnapshot[];
  calibrationOutcomes?: RecommendationOutcome[];
  runtimeEvidence?: ScannerClockPriorShadowForwardRuntimeEvidence[];
  bootstrapSeed: string;
}): ScannerClockPriorShadowForwardDecisionResult {
  const plan = verifiedPlan(input.plan);
  if (!plan) {
    return terminalResult({
      status: "invalid_plan",
      reasons: ["forward_decision_plan_invalid_or_changed"],
    });
  }
  if (!evidenceBindingsMatchPlan(plan, input.evidenceBindings)) {
    return terminalResult({
      status: "invalid_plan",
      plan,
      reasons: ["forward_decision_charter_or_policy_reference_binding_invalid"],
    });
  }
  if (!boundedText(input.bootstrapSeed, 1, 512) ||
    input.scanRuns.length > MAXIMUM_SCAN_RUNS ||
    input.snapshots.length > MAXIMUM_SNAPSHOTS_OR_OUTCOMES ||
    input.outcomes.length > MAXIMUM_SNAPSHOTS_OR_OUTCOMES ||
    (input.calibrationScanRuns?.length ?? 0) > MAXIMUM_SCAN_RUNS ||
    (input.calibrationSnapshots?.length ?? 0) >
      MAXIMUM_SNAPSHOTS_OR_OUTCOMES ||
    (input.calibrationOutcomes?.length ?? 0) >
      MAXIMUM_SNAPSHOTS_OR_OUTCOMES ||
    (input.runtimeEvidence?.length ?? 0) > MAXIMUM_SCAN_RUNS) {
    return terminalResult({
      status: "conflicting",
      plan,
      reasons: ["forward_decision_input_bounds_invalid"],
    });
  }
  const observations: Record<PartitionName, PartitionObservation[]> = {
    held_out: [],
    walk_forward: [],
  };
  const coverageObservations: Record<PartitionName, PartitionCoverageObservation[]> = {
    held_out: [],
    walk_forward: [],
  };
  const concentrationObservations: Record<
    PartitionName,
    ScannerRankingShadowConcentrationInput[]
  > = {
    held_out: [],
    walk_forward: [],
  };
  const probabilityCalibrationObservations: Record<
    PartitionName,
    ScannerRankingShadowProbabilityCalibrationObservation[]
  > = {
    held_out: [],
    walk_forward: [],
  };
  const runtimeEvidence: Record<
    PartitionName,
    ScannerClockPriorShadowForwardRuntimeEvidence[]
  > = {
    held_out: [],
    walk_forward: [],
  };
  const reasonsByPartition: Record<PartitionName, string[]> = {
    held_out: [],
    walk_forward: [],
  };
  const globalReasons: string[] = [];
  const seenScanFingerprints = new Set<string>();
  const seenEvaluationIdentities = new Set<string>();
  const seenCalibrationCandidateIds = new Set<string>();
  let versionCohortIdentity: string | null = null;
  const calibrationTrainingInputs: ScannerScoreProbabilityCalibrationTrainingInput[] = [];
  const calibrationWindowEndAt = plan.windows.held_out.start_at;
  const calibrationWindowStartAt = new Date(
    Date.parse(calibrationWindowEndAt) - 30 * 24 * 60 * 60 * 1_000,
  ).toISOString();
  for (const scanRun of input.calibrationScanRuns ?? []) {
    if (
      Date.parse(scanRun.observed_at) < Date.parse(calibrationWindowStartAt) ||
      Date.parse(scanRun.observed_at) >= Date.parse(calibrationWindowEndAt)
    ) continue;
    const comparison = scannerClockPriorShadowComparisonFromUnknown(
      scanRun.payload_json.scanner_clock_prior_shadow_comparison,
    );
    if (
      !comparison ||
      comparison.baseline_policy_version !== plan.baseline_ranking_version ||
      comparison.shadow_policy_version !== plan.candidate_ranking_version
    ) continue;
    const calibrationEvaluation = evaluateScannerClockPriorShadowScan({
      scanRun,
      snapshots: input.calibrationSnapshots ?? [],
      outcomes: input.calibrationOutcomes ?? [],
      bootstrapSeed:
        `${input.bootstrapSeed}:calibration:${scanRun.run_fingerprint}`,
    });
    if (
      calibrationEvaluation.probability_calibration_input_version ===
        SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_INPUT_VERSION &&
      calibrationEvaluation.probability_calibration_inputs
    ) {
      calibrationTrainingInputs.push(
        ...calibrationEvaluation.probability_calibration_inputs,
      );
    }
  }
  const probabilityCalibration = buildScannerScoreProbabilityCalibrationModel({
    fittedAt: calibrationWindowEndAt,
    trainingStartAt: calibrationWindowStartAt,
    trainingEndAt: calibrationWindowEndAt,
    observations: calibrationTrainingInputs,
  });

  for (const scanRun of input.scanRuns) {
    const decisionAt = scanRun.observed_at;
    const partition = partitionForTimestamp(decisionAt, plan.windows);
    if (!partition) {
      globalReasons.push("scan_outside_declared_evaluation_windows");
      continue;
    }
    if (seenScanFingerprints.has(scanRun.run_fingerprint)) {
      globalReasons.push("duplicate_scan_run_fingerprint");
      continue;
    }
    seenScanFingerprints.add(scanRun.run_fingerprint);
    const comparison = scannerClockPriorShadowComparisonFromUnknown(
      scanRun.payload_json.scanner_clock_prior_shadow_comparison,
    );
    if (!comparison ||
      comparison.baseline_policy_version !== plan.baseline_ranking_version ||
      comparison.shadow_policy_version !== plan.candidate_ranking_version) {
      globalReasons.push("declared_clock_prior_policy_mismatch");
      continue;
    }
    const evaluation = evaluateScannerClockPriorShadowScan({
      scanRun,
      snapshots: input.snapshots,
      outcomes: input.outcomes,
      bootstrapSeed: `${input.bootstrapSeed}:${scanRun.run_fingerprint}`,
      probabilityCalibration,
    });
    const coverage = evaluation.coverage;
    if (
      !Number.isInteger(coverage.expected_candidate_count) ||
      !Number.isInteger(coverage.exact_snapshot_count) ||
      !Number.isInteger(coverage.canonical_primary_outcome_count) ||
      coverage.expected_candidate_count < 0 ||
      coverage.exact_snapshot_count < 0 ||
      coverage.canonical_primary_outcome_count < 0 ||
      coverage.exact_snapshot_count > coverage.expected_candidate_count ||
      coverage.canonical_primary_outcome_count > coverage.exact_snapshot_count
    ) {
      globalReasons.push("canonical_scan_coverage_counts_conflicting");
      continue;
    }
    if (evaluation.status !== "conflicting") {
      coverageObservations[partition].push(coverage);
    }
    if (
      evaluation.comparison_identity !== null &&
      !evaluation.comparison_identity.startsWith(`${scanRun.run_fingerprint}:`)
    ) {
      globalReasons.push("scan_comparison_identity_mismatch");
      continue;
    }
    if (
      evaluation.status === "insufficient_evidence" &&
      evaluation.coverage.expected_candidate_count === 0 &&
      evaluation.reason_codes.length === 1 &&
      evaluation.reason_codes[0] === "no_ranked_candidates_to_evaluate"
    ) {
      observations[partition].push({
        decision_at: decisionAt,
        no_trade: true,
        ranked_candidate_count: 0,
        baseline_numerator: 0,
        baseline_denominator: 0,
        candidate_numerator: 0,
        candidate_denominator: 0,
        candidate_expectancy_numerator: 0,
        candidate_expectancy_denominator: 0,
      });
      continue;
    }
    if (!evaluation.evaluation ||
      (evaluation.status !== "evaluable" &&
        evaluation.status !== "probability_semantics_missing")) {
      reasonsByPartition[partition].push(
        ...evaluation.reason_codes,
        "canonical_scan_evaluation_incomplete",
      );
      continue;
    }
    const canonical = evaluation.evaluation;
    const pairing = canonical.pairing_evidence;
    if (
      evaluation.adapter_version !==
        SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION ||
      pairing.baseline_version_tuple.ranking_version !==
        plan.baseline_ranking_version ||
      pairing.candidate_version_tuple.ranking_version !==
        plan.candidate_ranking_version ||
      pairing.shared_opportunity_set_identity.length === 0 ||
      pairing.baseline_version_tuple.semantic_digest.length !== 64 ||
      pairing.candidate_version_tuple.semantic_digest.length !== 64
    ) {
      globalReasons.push("evaluation_policy_or_identity_mismatch");
      continue;
    }
    if (pairing.baseline_version_tuple.engine_version !==
      pairing.candidate_version_tuple.engine_version ||
      pairing.baseline_version_tuple.scoring_version !==
        pairing.candidate_version_tuple.scoring_version ||
      pairing.version_difference_set.differences.length !== 1 ||
      pairing.version_difference_set.differences[0] !== "ranking_version") {
      globalReasons.push("clock_prior_ranking_must_be_only_policy_difference");
      continue;
    }
    if (pairing.baseline_version_tuple.provider_contract_version !==
      pairing.candidate_version_tuple.provider_contract_version ||
      pairing.baseline_version_tuple.evaluator_version !==
        pairing.candidate_version_tuple.evaluator_version) {
      globalReasons.push("provider_or_evaluator_contract_mismatch");
      continue;
    }
    if (canonical.pairing_evidence.baseline_binding_digest.length !== 64 ||
      canonical.pairing_evidence.candidate_binding_digest.length !== 64) {
      globalReasons.push("evaluation_pairing_digest_invalid");
      continue;
    }
    const currentVersionCohortIdentity = [
      pairing.baseline_version_tuple.semantic_digest,
      pairing.candidate_version_tuple.semantic_digest,
      pairing.baseline_version_tuple.provider_contract_version,
      pairing.baseline_version_tuple.evaluator_version,
    ].join(":");
    if (versionCohortIdentity !== null &&
      versionCohortIdentity !== currentVersionCohortIdentity) {
      globalReasons.push("evaluation_version_cohort_not_homogeneous");
      continue;
    }
    versionCohortIdentity = currentVersionCohortIdentity;
    if (seenEvaluationIdentities.has(canonical.evaluation_identity)) {
      globalReasons.push("duplicate_canonical_evaluation_identity");
      continue;
    }
    seenEvaluationIdentities.add(canonical.evaluation_identity);
    const key = String(plan.primary_k);
    const baselineMetric = canonical.baseline.ranking.precision_at_k[key];
    const candidateMetric = canonical.candidate.ranking.precision_at_k[key];
    const candidateExpectancy =
      evaluation.candidate_performance_at_k?.[key]?.expectancy_r;
    if (!baselineMetric || !candidateMetric ||
      !finite(baselineMetric.numerator) ||
      !finite(candidateMetric.numerator) ||
      !positiveInteger(baselineMetric.denominator) ||
      !positiveInteger(candidateMetric.denominator) ||
      baselineMetric.identity_count !== baselineMetric.denominator ||
      candidateMetric.identity_count !== candidateMetric.denominator ||
      evaluation.candidate_performance_at_k_version !==
        SCANNER_RANKING_SHADOW_CANDIDATE_PERFORMANCE_AT_K_VERSION ||
      !candidateExpectancy || !finite(candidateExpectancy.numerator) ||
      !positiveInteger(candidateExpectancy.denominator) ||
      candidateExpectancy.identity_count !== candidateExpectancy.denominator) {
      reasonsByPartition[partition].push(
        "canonical_precision_or_expectancy_metric_incomplete",
      );
      continue;
    }
    const concentrationInputs = evaluation.concentration_inputs;
    if (
      evaluation.concentration_input_version !==
        SCANNER_RANKING_SHADOW_CONCENTRATION_INPUT_VERSION ||
      !concentrationInputs ||
      concentrationInputs.length !== evaluation.coverage.expected_candidate_count ||
      new Set(concentrationInputs.map((item) => item.candidate_id)).size !==
        concentrationInputs.length
    ) {
      reasonsByPartition[partition].push(
        "candidate_concentration_inputs_incomplete",
      );
    } else {
      concentrationObservations[partition].push(...concentrationInputs);
    }
    if (evaluation.status === "probability_semantics_missing") {
      reasonsByPartition[partition].push(
        "candidate_calibrated_probability_semantics_missing",
      );
    }
    const calibrationObservations =
      evaluation.probability_calibration_observations;
    if (
      evaluation.probability_calibration_observation_version !==
        SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION ||
      !calibrationObservations ||
      calibrationObservations.length !==
        evaluation.coverage.expected_candidate_count ||
      (probabilityCalibration && (
        evaluation.probability_calibration_model_version !==
          SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION ||
        evaluation.probability_calibration_model_fingerprint !==
          probabilityCalibration.model_fingerprint
      ))
    ) {
      reasonsByPartition[partition].push(
        "candidate_probability_calibration_observations_incomplete",
      );
    } else {
      let duplicateIdentity = false;
      for (const calibrationObservation of calibrationObservations) {
        if (seenCalibrationCandidateIds.has(calibrationObservation.candidate_id)) {
          duplicateIdentity = true;
        }
        seenCalibrationCandidateIds.add(calibrationObservation.candidate_id);
      }
      if (duplicateIdentity) {
        globalReasons.push("duplicate_probability_calibration_candidate_identity");
      } else {
        probabilityCalibrationObservations[partition].push(
          ...calibrationObservations,
        );
      }
    }
    observations[partition].push({
      decision_at: decisionAt,
      no_trade: false,
      ranked_candidate_count: evaluation.coverage.expected_candidate_count,
      baseline_numerator: baselineMetric.numerator,
      baseline_denominator: baselineMetric.denominator,
      candidate_numerator: candidateMetric.numerator,
      candidate_denominator: candidateMetric.denominator,
      candidate_expectancy_numerator: candidateExpectancy.numerator,
      candidate_expectancy_denominator: candidateExpectancy.denominator,
    });
  }

  const runtimeAttemptFingerprints = new Set<string>();
  const runtimeScanFingerprintCounts = new Map<string, number>();
  for (const item of input.runtimeEvidence ?? []) {
    const receipt = item.receipt;
    if (
      receipt.owner_user_id !== plan.owner_user_id ||
      receipt.trigger.kind !== "netlify_schedule"
    ) {
      globalReasons.push("runtime_evidence_owner_or_trigger_mismatch");
      continue;
    }
    if (runtimeAttemptFingerprints.has(receipt.source_attempt_fingerprint)) {
      globalReasons.push("duplicate_runtime_attempt_fingerprint");
      continue;
    }
    runtimeAttemptFingerprints.add(receipt.source_attempt_fingerprint);
    const runtimeTimestamp =
      receipt.trigger.scheduled_slot_started_at_utc ??
      receipt.trigger.occurred_at;
    const partition = partitionForTimestamp(runtimeTimestamp, plan.windows);
    if (!partition) {
      globalReasons.push("runtime_attempt_outside_declared_evaluation_windows");
      continue;
    }
    const scanFingerprint = receipt.scan_run_fingerprint;
    if (scanFingerprint !== null) {
      if (!seenScanFingerprints.has(scanFingerprint)) {
        globalReasons.push("runtime_receipt_scan_population_mismatch");
        continue;
      }
      runtimeScanFingerprintCounts.set(
        scanFingerprint,
        (runtimeScanFingerprintCounts.get(scanFingerprint) ?? 0) + 1,
      );
    }
    const requestedCredits = item.credit_readback.reservation.requested_credits;
    if (
      item.credit_readback.status === "available" &&
      ((requestedCredits === null &&
        receipt.provider_request.reserved_credits !== 0) ||
        (requestedCredits !== null &&
          receipt.provider_request.reserved_credits > requestedCredits))
    ) {
      globalReasons.push("runtime_provider_credit_receipt_conflicting");
      continue;
    }
    runtimeEvidence[partition].push(item);
  }
  if ([...runtimeScanFingerprintCounts.values()].some((count) => count !== 1)) {
    globalReasons.push("duplicate_runtime_decision_lineage");
  }

  if (globalReasons.length > 0) {
    return terminalResult({
      status: "conflicting",
      plan,
      reasons: globalReasons,
    });
  }
  const partitions = (["held_out", "walk_forward"] as const).map(
    (partition) => summarizePartition({
      partition,
      observations: observations[partition],
      coverageObservations: coverageObservations[partition],
      concentrationObservations: concentrationObservations[partition],
      probabilityCalibrationObservations:
        probabilityCalibrationObservations[partition],
      probabilityCalibrationModelFingerprint:
        probabilityCalibration?.model_fingerprint ?? null,
      runtimeEvidence: runtimeEvidence[partition],
      expectedScanFingerprints: new Set(
        input.scanRuns
          .filter((scanRun) =>
            partitionForTimestamp(scanRun.observed_at, plan.windows) === partition
          )
          .map((scanRun) => scanRun.run_fingerprint),
      ),
      window: plan.windows[partition],
      evaluationReasons: reasonsByPartition[partition],
      bootstrapSeed: `${input.bootstrapSeed}:${plan.plan_fingerprint}:${partition}`,
    }),
  );
  const evidenceReasons = uniqueSorted(
    partitions.flatMap((partition) => partition.reason_codes),
  );
  if (evidenceReasons.length > 0 ||
    partitions.some((partition) => !partition.evidence_complete)) {
    return terminalResult({
      status: "evidence_incomplete",
      plan,
      partitions,
      reasons: evidenceReasons,
    });
  }
  const decision = classifyScannerClockPriorShadowForwardPrecisionDecision({
    partitions,
    thresholds: plan.thresholds,
  });
  return terminalResult({
    status: "decision_ready",
    decision,
    plan,
    partitions,
    reasons: decision === "continue"
      ? ["both_partitions_clear_continue_boundary"]
      : decision === "reject"
        ? ["at_least_one_partition_clears_reject_boundary"]
        : ["complete_evidence_does_not_clear_continue_or_reject_boundary"],
  });
}
