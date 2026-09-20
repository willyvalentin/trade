import {
  buildRecommendationEvaluationCharterInput,
  recommendationEvaluationCharterMatchesPolicySegment,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type { RecommendationLearningBaselineFreeze } from "@/lib/recommendation-learning-baseline-freeze-store";
import type { RecommendationLearningBaselineSegment } from "@/lib/recommendation-learning-baseline-segments";

export const RECOMMENDATION_POLICY_COMPARISON_VERSION =
  "recommendation_policy_comparison_v1" as const;

type PolicyAttribution = RecommendationLearningBaselineSegment["policy_attribution"];
type Partition = "held_out" | "walk_forward";
type OutcomeTerminal = "target_first" | "stop_first" | "neither";
type FeasibilityKey = keyof RecommendationEvaluationCharter["charter"]["feasibility_inputs"];

export type RecommendationPolicyEvaluation = {
  policy_attribution: PolicyAttribution;
  selected: boolean;
  rank: number | null;
  /** A calibrated 0–1 probability; ordinal confidence labels are not valid. */
  predicted_probability: number | null;
  provider_cost_credits: number | null;
  source_reliable: boolean | null;
  feasibility: Record<FeasibilityKey, boolean | null>;
};

export type RecommendationPolicyComparisonSample = {
  opportunity_id: string;
  decision_at: string;
  outcome_at: string;
  partition: Partition;
  source_cohort_key: string;
  ticker: string;
  sector: string;
  setup: string;
  regime: string;
  outcome: {
    complete: boolean;
    terminal: OutcomeTerminal | null;
    r_multiple: number | null;
  };
  baseline: RecommendationPolicyEvaluation;
  candidate: RecommendationPolicyEvaluation;
};

type PolicyMetrics = {
  selected_count: number;
  complete_outcome_count: number;
  precision_at_selected_k: number | null;
  expectancy_r: number | null;
  calibration_error: number | null;
  outcome_coverage: number | null;
  missingness: number | null;
  provider_credits_per_decision: number | null;
  reliability: number | null;
  max_ticker_share: number | null;
  max_sector_share: number | null;
  max_setup_share: number | null;
  max_regime_share: number | null;
  feasibility_missing: FeasibilityKey[];
};

type PolicyGate = {
  passed: boolean;
  failures: string[];
};

export type RecommendationPolicyComparisonPartitionResult = {
  partition: Partition;
  source_cohort_key: string | null;
  opportunity_count: number;
  baseline: PolicyMetrics | null;
  candidate: PolicyMetrics | null;
  candidate_thresholds: PolicyGate | null;
  comparison: {
    baseline_comparable: boolean;
    candidate_beats_baseline: boolean;
    strict_quality_improvements: string[];
    regressions: string[];
  } | null;
  blockers: string[];
};

export type RecommendationPolicyComparisonResult = {
  contract_version: typeof RECOMMENDATION_POLICY_COMPARISON_VERSION;
  status: "invalid_input" | "evidence_incomplete" | "shadow_candidate_supported";
  decision: "remain_shadow" | "not_comparable";
  baseline_fingerprint: string | null;
  evaluation_charter_fingerprint: string | null;
  candidate_policy_version: string | null;
  partitions: RecommendationPolicyComparisonPartitionResult[];
  blockers: string[];
  authority: {
    can_change_ranking_or_publication: false;
    can_promote_policy: false;
    can_request_provider_data: false;
    can_execute_broker_action: false;
  };
};

const authority = {
  can_change_ranking_or_publication: false,
  can_promote_policy: false,
  can_request_provider_data: false,
  can_execute_broker_action: false,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function unit(value: unknown): value is number {
  return finite(value) && value >= 0 && value <= 1;
}

function positiveInteger(value: unknown): value is number {
  return finite(value) && Number.isInteger(value) && value >= 1;
}

function iso(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function hash(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function uuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function samePolicy(left: PolicyAttribution, right: PolicyAttribution) {
  return left.recommendation_publish_policy_version ===
    right.recommendation_publish_policy_version &&
    Object.entries(left.canonical_evaluation_versions).every(([key, value]) =>
      right.canonical_evaluation_versions[
        key as keyof PolicyAttribution["canonical_evaluation_versions"]
      ] === value
    );
}

function isValidPolicy(value: unknown): value is PolicyAttribution {
  if (!isRecord(value) || !text(value.recommendation_publish_policy_version)) return false;
  const versions = value.canonical_evaluation_versions;
  if (!isRecord(versions)) return false;
  return [
    "engine_version",
    "scoring_version",
    "ranking_version",
    "setup_taxonomy_version",
    "confidence_contract_version",
    "evaluator_version",
    "provider_contract_version",
    "git_commit",
    "build_identity",
  ].every((key) => text(versions[key]));
}

function validBaseline(value: unknown): value is RecommendationLearningBaselineFreeze {
  if (!isRecord(value) || !hash(value.baseline_fingerprint) || !uuid(value.owner_user_id) ||
    !uuid(value.baseline_id) || !text(value.segment_key) || !hash(value.evaluation_charter_fingerprint) ||
    !iso(value.frozen_at) || !Array.isArray(value.decision_record_fingerprints) ||
    value.decision_record_fingerprints.length === 0 || value.decision_record_fingerprints.length > 10_000 ||
    !value.decision_record_fingerprints.every((fingerprint) => text(fingerprint) && fingerprint.length <= 240) ||
    new Set(value.decision_record_fingerprints).size !== value.decision_record_fingerprints.length) {
    return false;
  }
  const plan = value.evaluation_plan;
  return isRecord(plan) &&
    plan.contract_version === "recommendation_learning_evaluation_plan_v1" &&
    plan.status === "ready_for_explicit_freeze" &&
    plan.segment_key === value.segment_key &&
    isRecord(plan.policy_attribution) &&
    isValidPolicy(plan.policy_attribution) &&
    isRecord(plan.decision_records) &&
    positiveInteger(plan.decision_records.count) &&
    Array.isArray(plan.decision_records.scan_run_fingerprints) &&
    plan.decision_records.count === value.decision_record_fingerprints.length &&
    plan.decision_records.scan_run_fingerprints.length === value.decision_record_fingerprints.length &&
    plan.decision_records.scan_run_fingerprints.every((fingerprint) => text(fingerprint) && fingerprint.length <= 240) &&
    plan.decision_records.scan_run_fingerprints.every((fingerprint, index) =>
      fingerprint === value.decision_record_fingerprints[index]
    ) &&
    plan.metrics !== null;
}

function validCharter(value: unknown): value is RecommendationEvaluationCharter {
  if (!isRecord(value) || !uuid(value.charter_id) || !hash(value.charter_fingerprint) ||
    !uuid(value.owner_user_id) || !text(value.segment_key) || !iso(value.created_at) ||
    !isValidPolicy(value.policy_attribution)) return false;
  const rebuilt = buildRecommendationEvaluationCharterInput({
    ownerUserId: value.owner_user_id,
    segmentKey: value.segment_key,
    policy: value.policy_attribution,
    charter: value.charter,
  });
  return rebuilt?.charter_fingerprint === value.charter_fingerprint;
}

function validEvaluation(value: unknown): value is RecommendationPolicyEvaluation {
  if (!isRecord(value) || !isValidPolicy(value.policy_attribution) ||
    typeof value.selected !== "boolean" ||
    (value.rank !== null && !positiveInteger(value.rank)) ||
    (value.predicted_probability !== null && !unit(value.predicted_probability)) ||
    (value.provider_cost_credits !== null && (!finite(value.provider_cost_credits) || value.provider_cost_credits < 0)) ||
    (value.source_reliable !== null && typeof value.source_reliable !== "boolean") ||
    !isRecord(value.feasibility)) return false;

  return ["spread", "liquidity", "volatility", "halt_risk", "trigger_attainment", "conservative_slippage"].every(
    (key) => value.feasibility[key] === true || value.feasibility[key] === false || value.feasibility[key] === null,
  );
}

function validSample(value: unknown): value is RecommendationPolicyComparisonSample {
  if (!isRecord(value) || !text(value.opportunity_id) || !iso(value.decision_at) ||
    !iso(value.outcome_at) || Date.parse(value.outcome_at as string) <= Date.parse(value.decision_at as string) ||
    (value.partition !== "held_out" && value.partition !== "walk_forward") || !text(value.source_cohort_key) ||
    !text(value.ticker) || !text(value.sector) || !text(value.setup) || !text(value.regime) ||
    !isRecord(value.outcome) || typeof value.outcome.complete !== "boolean" ||
    (value.outcome.terminal !== "target_first" && value.outcome.terminal !== "stop_first" &&
      value.outcome.terminal !== "neither" && value.outcome.terminal !== null) ||
    (value.outcome.r_multiple !== null && !finite(value.outcome.r_multiple)) ||
    !validEvaluation(value.baseline) || !validEvaluation(value.candidate)) return false;

  return value.outcome.complete
    ? value.outcome.terminal !== null && value.outcome.r_multiple !== null
    : value.outcome.terminal === null && value.outcome.r_multiple === null;
}

function average(values: number[]) {
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function maximumShare(values: string[]) {
  if (values.length === 0) return null;
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Math.max(...counts.values()) / values.length;
}

function metricFor(
  samples: RecommendationPolicyComparisonSample[],
  policy: "baseline" | "candidate",
  charter: RecommendationEvaluationCharter,
): PolicyMetrics {
  const selected = samples.filter((sample) => sample[policy].selected);
  const complete = selected.filter((sample) => sample.outcome.complete);
  const probabilityPairs = complete.filter((sample) => sample[policy].predicted_probability !== null);
  const costValues = samples
    .map((sample) => sample[policy].provider_cost_credits)
    .filter((value): value is number => value !== null);
  const reliable = selected.filter((sample) => sample[policy].source_reliable === true);
  const feasibilityMissing = (Object.entries(charter.charter.feasibility_inputs) as Array<[FeasibilityKey, string]>)
    .filter(([key, requirement]) => requirement === "required" && selected.some((sample) => sample[policy].feasibility[key] !== true))
    .map(([key]) => key)
    .sort();

  return {
    selected_count: selected.length,
    complete_outcome_count: complete.length,
    precision_at_selected_k: complete.length === 0
      ? null
      : complete.filter((sample) => sample.outcome.terminal === "target_first").length / complete.length,
    expectancy_r: average(complete.map((sample) => sample.outcome.r_multiple!)),
    calibration_error: probabilityPairs.length !== complete.length || probabilityPairs.length === 0
      ? null
      : average(probabilityPairs.map((sample) => Math.abs(
        sample[policy].predicted_probability! - (sample.outcome.terminal === "target_first" ? 1 : 0),
      ))),
    outcome_coverage: selected.length === 0 ? null : complete.length / selected.length,
    missingness: selected.length === 0 ? null : 1 - complete.length / selected.length,
    provider_credits_per_decision: costValues.length !== selected.length || selected.length === 0
      ? null
      : average(costValues),
    reliability: selected.length === 0 ? null : reliable.length / selected.length,
    max_ticker_share: maximumShare(selected.map((sample) => sample.ticker.trim().toUpperCase())),
    max_sector_share: maximumShare(selected.map((sample) => sample.sector.trim().toLowerCase())),
    max_setup_share: maximumShare(selected.map((sample) => sample.setup.trim().toLowerCase())),
    max_regime_share: maximumShare(selected.map((sample) => sample.regime.trim().toLowerCase())),
    feasibility_missing: feasibilityMissing,
  };
}

function gate(metrics: PolicyMetrics, charter: RecommendationEvaluationCharter): PolicyGate {
  const thresholds = charter.charter.thresholds;
  const limits = charter.charter.concentration_limits;
  const failures: string[] = [];
  if (metrics.selected_count === 0) failures.push("no_selected_decisions");
  if (metrics.precision_at_selected_k === null || metrics.precision_at_selected_k < thresholds.minimum_precision_at_k) failures.push("precision_threshold_not_met");
  if (metrics.expectancy_r === null || metrics.expectancy_r < thresholds.minimum_expectancy_r) failures.push("expectancy_threshold_not_met");
  if (metrics.calibration_error === null || metrics.calibration_error > thresholds.maximum_calibration_error) failures.push("calibration_threshold_not_met");
  if (metrics.outcome_coverage === null || metrics.outcome_coverage < thresholds.minimum_outcome_coverage) failures.push("outcome_coverage_threshold_not_met");
  if (metrics.missingness === null || metrics.missingness > thresholds.maximum_missingness) failures.push("missingness_threshold_not_met");
  if (metrics.provider_credits_per_decision === null || metrics.provider_credits_per_decision > thresholds.maximum_provider_credits_per_decision) failures.push("provider_cost_threshold_not_met");
  if (metrics.reliability === null || metrics.reliability < thresholds.minimum_reliability) failures.push("reliability_threshold_not_met");
  if (metrics.max_ticker_share === null || metrics.max_ticker_share > limits.maximum_single_ticker_share) failures.push("ticker_concentration_limit_exceeded");
  if (metrics.max_sector_share === null || metrics.max_sector_share > limits.maximum_single_sector_share) failures.push("sector_concentration_limit_exceeded");
  if (metrics.max_setup_share === null || metrics.max_setup_share > limits.maximum_single_setup_share) failures.push("setup_concentration_limit_exceeded");
  if (metrics.max_regime_share === null || metrics.max_regime_share > limits.maximum_single_regime_share) failures.push("regime_concentration_limit_exceeded");
  for (const key of metrics.feasibility_missing) failures.push(`required_feasibility_missing:${key}`);
  return { passed: failures.length === 0, failures };
}

function compare(baseline: PolicyMetrics, candidate: PolicyMetrics) {
  const checks: Array<[string, number | null, number | null, "higher" | "lower"]> = [
    ["precision_at_selected_k", baseline.precision_at_selected_k, candidate.precision_at_selected_k, "higher"],
    ["expectancy_r", baseline.expectancy_r, candidate.expectancy_r, "higher"],
    ["calibration_error", baseline.calibration_error, candidate.calibration_error, "lower"],
    ["outcome_coverage", baseline.outcome_coverage, candidate.outcome_coverage, "higher"],
    ["reliability", baseline.reliability, candidate.reliability, "higher"],
    ["provider_credits_per_decision", baseline.provider_credits_per_decision, candidate.provider_credits_per_decision, "lower"],
  ];
  if (checks.some(([, left, right]) => left === null || right === null)) {
    return { baseline_comparable: false, candidate_beats_baseline: false, strict_quality_improvements: [], regressions: ["baseline_or_candidate_metrics_missing"] };
  }
  const improvements = checks.filter(([name, left, right, direction]) =>
    ["precision_at_selected_k", "expectancy_r", "calibration_error"].includes(name) &&
    (direction === "higher" ? right! > left! : right! < left!),
  ).map(([name]) => name);
  const regressions = checks.filter(([, left, right, direction]) =>
    direction === "higher" ? right! < left! : right! > left!,
  ).map(([name]) => name);
  return {
    baseline_comparable: true,
    candidate_beats_baseline: improvements.length > 0 && regressions.length === 0,
    strict_quality_improvements: improvements,
    regressions,
  };
}

function emptyPartition(partition: Partition, blockers: string[]): RecommendationPolicyComparisonPartitionResult {
  return {
    partition,
    source_cohort_key: null,
    opportunity_count: 0,
    baseline: null,
    candidate: null,
    candidate_thresholds: null,
    comparison: null,
    blockers,
  };
}

function invalidResult(blockers: string[]): RecommendationPolicyComparisonResult {
  return {
    contract_version: RECOMMENDATION_POLICY_COMPARISON_VERSION,
    status: "invalid_input",
    decision: "not_comparable",
    baseline_fingerprint: null,
    evaluation_charter_fingerprint: null,
    candidate_policy_version: null,
    partitions: [
      emptyPartition("held_out", blockers),
      emptyPartition("walk_forward", blockers),
    ],
    blockers: [...new Set(blockers)].sort(),
    authority,
  };
}

/**
 * Evaluates a supplied, pairwise comparable historical policy comparison. It is
 * deliberately pure and non-promoting: future live-shadow evidence must still
 * independently support any policy change.
 */
export function evaluateRecommendationPolicyComparison({
  baseline,
  charter,
  candidatePolicy,
  samples,
}: {
  baseline: RecommendationLearningBaselineFreeze | null;
  charter: RecommendationEvaluationCharter | null;
  candidatePolicy: PolicyAttribution | null;
  samples: readonly RecommendationPolicyComparisonSample[];
}): RecommendationPolicyComparisonResult {
  if (!validBaseline(baseline) || !validCharter(charter) || !isValidPolicy(candidatePolicy)) {
    return invalidResult(["baseline_charter_or_candidate_policy_invalid"]);
  }
  const baselinePolicy = baseline.evaluation_plan.policy_attribution;
  if (!recommendationEvaluationCharterMatchesPolicySegment({
    charter,
    segmentKey: baseline.segment_key,
    policy: baselinePolicy,
  }) || baseline.evaluation_charter_fingerprint !== charter.charter_fingerprint) {
    return invalidResult(["baseline_and_charter_are_not_bound"]);
  }
  if (samePolicy(baselinePolicy, candidatePolicy)) {
    return invalidResult(["candidate_policy_matches_frozen_baseline"]);
  }
  if (!Array.isArray(samples) || samples.some((sample) => !validSample(sample))) {
    return invalidResult(["comparison_sample_invalid"]);
  }

  const ids = new Set<string>();
  const ordered = [...samples].sort((left, right) => Date.parse(left.decision_at) - Date.parse(right.decision_at));
  const invalidBlockers: string[] = [];
  for (const sample of ordered) {
    if (ids.has(sample.opportunity_id)) invalidBlockers.push("duplicate_opportunity_id");
    ids.add(sample.opportunity_id);
    if (!samePolicy(sample.baseline.policy_attribution, baselinePolicy)) invalidBlockers.push("sample_baseline_policy_mismatch");
    if (!samePolicy(sample.candidate.policy_attribution, candidatePolicy)) invalidBlockers.push("sample_candidate_policy_mismatch");
  }
  if (invalidBlockers.length > 0) return invalidResult(invalidBlockers);

  const evidenceBlockers: string[] = [];
  if (ordered.filter((sample) => sample.outcome.complete).length <
    charter.charter.evaluation_window.minimum_complete_decisions) {
    evidenceBlockers.push("minimum_complete_decision_count_not_met");
  }
  const heldOutDecisionTimes = ordered
    .filter((sample) => sample.partition === "held_out")
    .map((sample) => Date.parse(sample.decision_at));
  const walkForwardDecisionTimes = ordered
    .filter((sample) => sample.partition === "walk_forward")
    .map((sample) => Date.parse(sample.decision_at));
  if (heldOutDecisionTimes.length > 0 && walkForwardDecisionTimes.length > 0 &&
    Math.max(...heldOutDecisionTimes) >= Math.min(...walkForwardDecisionTimes)) {
    evidenceBlockers.push("walk_forward_not_after_held_out");
  }

  const partitions = (["held_out", "walk_forward"] as const).map((partition) => {
    const partitionSamples = ordered.filter((sample) => sample.partition === partition);
    const blockers: string[] = [];
    const requiredCount = partition === "held_out"
      ? charter.charter.evaluation_window.held_out_decision_count
      : charter.charter.evaluation_window.walk_forward_decision_count;
    if (partitionSamples.length < requiredCount) blockers.push("minimum_partition_decision_count_not_met");
    const cohorts = [...new Set(partitionSamples.map((sample) => sample.source_cohort_key))];
    if (cohorts.length !== 1) blockers.push("source_cohort_not_homogeneous");
    const baselineMetrics = partitionSamples.length > 0 ? metricFor(partitionSamples, "baseline", charter) : null;
    const candidateMetrics = partitionSamples.length > 0 ? metricFor(partitionSamples, "candidate", charter) : null;
    const candidateThresholds = candidateMetrics ? gate(candidateMetrics, charter) : null;
    const comparison = baselineMetrics && candidateMetrics
      ? compare(baselineMetrics, candidateMetrics)
      : null;
    if (candidateThresholds && !candidateThresholds.passed) blockers.push(...candidateThresholds.failures);
    if (comparison && !comparison.candidate_beats_baseline) blockers.push(...comparison.regressions, "candidate_does_not_outperform_baseline");
    return {
      partition,
      source_cohort_key: cohorts.length === 1 ? cohorts[0]! : null,
      opportunity_count: partitionSamples.length,
      baseline: baselineMetrics,
      candidate: candidateMetrics,
      candidate_thresholds: candidateThresholds,
      comparison,
      blockers: [...new Set(blockers)].sort(),
    } satisfies RecommendationPolicyComparisonPartitionResult;
  });
  const blockers = [...evidenceBlockers, ...partitions.flatMap((partition) => partition.blockers)];
  const supported = blockers.length === 0 && partitions.every((partition) =>
    partition.candidate_thresholds?.passed === true &&
    partition.comparison?.candidate_beats_baseline === true,
  );

  return {
    contract_version: RECOMMENDATION_POLICY_COMPARISON_VERSION,
    status: supported ? "shadow_candidate_supported" : "evidence_incomplete",
    decision: supported ? "remain_shadow" : "not_comparable",
    baseline_fingerprint: baseline.baseline_fingerprint,
    evaluation_charter_fingerprint: charter.charter_fingerprint,
    candidate_policy_version: candidatePolicy.recommendation_publish_policy_version,
    partitions,
    blockers: [...new Set(blockers)].sort(),
    authority,
  };
}
