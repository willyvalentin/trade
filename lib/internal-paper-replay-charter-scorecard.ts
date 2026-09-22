import { createHash } from "node:crypto";

import {
  INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
  runInternalPaperReplayExperiment,
  type InternalPaperReplayExperimentInput,
  type InternalPaperReplayExperimentPartition,
} from "@/lib/internal-paper-replay-experiment";
import { runInternalPaperReplayCorpus } from "@/lib/internal-paper-replay-corpus";
import {
  buildRecommendationEvaluationCharterInput,
  recommendationEvaluationCharterMatchesPolicySegment,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type { RecommendationLearningBaselineFreeze } from "@/lib/recommendation-learning-baseline-freeze-store";

export const INTERNAL_PAPER_REPLAY_CHARTER_SCORECARD_VERSION =
  "internal_paper_replay_charter_scorecard_v1" as const;
export const INTERNAL_PAPER_REPLAY_CHARTER_EVIDENCE_VERSION =
  "internal_paper_replay_charter_evidence_v1" as const;

export const internalPaperReplayCharterScorecardPolicy = {
  policy_version: "internal_paper_replay_charter_scorecard_policy_v1",
  confidence_level: 0.95,
  bootstrap_iterations: 1_000,
  minimum_complete_selected_decisions: 20,
  minimum_effective_trading_days: 5,
  minimum_effective_tickers: 4,
} as const;

type FeasibilityKey =
  keyof RecommendationEvaluationCharter["charter"]["feasibility_inputs"];

export type InternalPaperReplayCharterPolicyEvidence = Readonly<{
  predicted_probability: number | null;
  provider_cost_credits: number | null;
  source_reliable: boolean | null;
  feasibility: Record<FeasibilityKey, boolean | null>;
}>;

export type InternalPaperReplayCharterDecisionEvidence = Readonly<{
  scan_run_fingerprint: string;
  trading_date: string;
  setup: string | null;
  regime: string | null;
  baseline: InternalPaperReplayCharterPolicyEvidence;
  candidate: InternalPaperReplayCharterPolicyEvidence;
}>;

export type InternalPaperReplayCharterEvidenceInput = Readonly<{
  evidence_version: typeof INTERNAL_PAPER_REPLAY_CHARTER_EVIDENCE_VERSION;
  evaluated_at: string;
  bootstrap_seed: string;
  decisions: readonly InternalPaperReplayCharterDecisionEvidence[];
}>;

export type InternalPaperReplayCharterEvidence =
  InternalPaperReplayCharterEvidenceInput &
    Readonly<{
      evidence_digest: string;
    }>;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

type Interval = Readonly<{
  method:
    | "wilson_score_interval_v1"
    | "seeded_trading_day_cluster_bootstrap_v1";
  confidence_level: 0.95;
  lower: number;
  upper: number;
  bootstrap_seed: string | null;
  bootstrap_iterations: 1_000 | null;
}>;

type Metric = Readonly<{
  value: number | null;
  denominator: number;
  confidence_interval: Interval | null;
  reason_codes: string[];
}>;

type Gate = Readonly<{
  gate: string;
  status: "pass" | "fail" | "inconclusive";
  observed: number | null;
  threshold: number;
  confidence_interval: Interval | null;
  reason_codes: string[];
}>;

type PolicyMetrics = Readonly<{
  decision_count: number;
  selected_count: number;
  complete_selected_count: number;
  explicit_no_trade_count: number;
  effective_trading_day_count: number;
  effective_ticker_count: number;
  precision: Metric;
  expectancy_r: Metric;
  calibration_error: Metric;
  outcome_coverage: number | null;
  missingness: number | null;
  provider_credits_per_decision: number | null;
  reliability: number | null;
  maximum_single_ticker_share: number | null;
  maximum_single_sector_share: number | null;
  maximum_single_setup_share: number | null;
  maximum_single_regime_share: number | null;
  required_feasibility_missing: FeasibilityKey[];
}>;

export type InternalPaperReplayCharterPartitionScorecard = Readonly<{
  partition: "held_out" | "walk_forward";
  verdict: "pass" | "fail" | "inconclusive";
  trading_dates: string[];
  expected_decision_count: number;
  evidenced_decision_count: number;
  complete_paired_decision_coverage: boolean;
  baseline: PolicyMetrics;
  candidate: PolicyMetrics;
  paired_net_pnl_delta: Metric;
  sample_gates: Gate[];
  candidate_quality_gates: Gate[];
  baseline_comparison_gate: Gate;
  reason_codes: string[];
}>;

export type InternalPaperReplayCharterScorecardResult =
  | Readonly<{
      scorecard_version: typeof INTERNAL_PAPER_REPLAY_CHARTER_SCORECARD_VERSION;
      status: "blocked";
      verdict: "inconclusive";
      reason_codes: string[];
      experiment_id: string | null;
      experiment_manifest_digest: string | null;
      baseline_fingerprint: string | null;
      evaluation_charter_fingerprint: string | null;
      evidence_digest: string | null;
      authority: Authority;
      scorecard_digest: string;
    }>
  | Readonly<{
      scorecard_version: typeof INTERNAL_PAPER_REPLAY_CHARTER_SCORECARD_VERSION;
      status: "completed";
      verdict: "pass" | "fail" | "inconclusive";
      scientific_disposition: "research_scorecard_not_strategy_accepted";
      experiment_id: string;
      experiment_manifest_digest: string;
      experiment_result_digest: string;
      baseline_fingerprint: string;
      evaluation_charter_fingerprint: string;
      evidence_digest: string;
      policy_version: typeof internalPaperReplayCharterScorecardPolicy.policy_version;
      population: Readonly<{
        expected_decision_count: number;
        evidenced_decision_count: number;
        complete_paired_decision_coverage: boolean;
        explicit_no_trade_decision_count: number;
      }>;
      partitions: InternalPaperReplayCharterPartitionScorecard[];
      reason_codes: string[];
      evidence_limits: readonly [
        "repository_or_declared_source_rights_not_independently_verified",
        "no_forward_shadow_evidence",
        "no_automatic_policy_promotion",
      ];
      authority: Authority;
      scorecard_digest: string;
    }>;

type NormalizedDecision = Readonly<{
  scan_run_fingerprint: string;
  trading_date: string;
  partition: InternalPaperReplayExperimentPartition;
  ticker: string | null;
  sector: string | null;
  setup: string | null;
  regime: string | null;
  baseline: InternalPaperReplayCharterPolicyEvidence & {
    selected: boolean;
    r_multiple: number | null;
    realized_net_pnl: number;
  };
  candidate: InternalPaperReplayCharterPolicyEvidence & {
    selected: boolean;
    r_multiple: number | null;
    realized_net_pnl: number;
  };
}>;

const AUTHORITY = {
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_promote_strategy: false,
  can_execute_broker_action: false,
} as const;

const EVIDENCE_LIMITS = [
  "repository_or_declared_source_rights_not_independently_verified",
  "no_forward_shadow_evidence",
  "no_automatic_policy_promotion",
] as const;

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PARTITIONS = ["held_out", "walk_forward"] as const;
const FEASIBILITY_KEYS = [
  "spread",
  "liquidity",
  "volatility",
  "halt_risk",
  "trigger_attainment",
  "conservative_slippage",
] as const satisfies readonly FeasibilityKey[];

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function terminal<T extends object>(value: T): T & { scorecard_digest: string } {
  return { ...value, scorecard_digest: digest(value) };
}

export function verifyInternalPaperReplayCharterScorecardDigest(
  value: InternalPaperReplayCharterScorecardResult,
) {
  const { scorecard_digest: scorecardDigest, ...payload } = value;
  return (
    SHA256_PATTERN.test(scorecardDigest) && digest(payload) === scorecardDigest
  );
}

function round(value: number) {
  return Math.round(value * 1_000_000_000_000) / 1_000_000_000_000;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function unit(value: unknown): value is number {
  return finite(value) && value >= 0 && value <= 1;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function mean(values: number[]) {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function maximumShare(values: Array<string | null>) {
  if (values.length === 0 || values.some((value) => value === null)) return null;
  const counts = new Map<string, number>();
  for (const value of values as string[]) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Math.max(...counts.values()) / values.length;
}

function quantile(values: number[], probability: number) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower]!;
  const fraction = position - lower;
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * fraction;
}

function hashSeed(seed: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function clusteredMeanInterval(
  observations: ReadonlyArray<{ trading_date: string; value: number }>,
  seed: string,
): Interval | null {
  const days = uniqueSorted(observations.map((item) => item.trading_date));
  if (days.length < 2) return null;
  const byDay = new Map(
    days.map((day) => [
      day,
      observations.filter((item) => item.trading_date === day),
    ]),
  );
  const random = seededRandom(seed);
  const samples: number[] = [];
  for (
    let iteration = 0;
    iteration < internalPaperReplayCharterScorecardPolicy.bootstrap_iterations;
    iteration += 1
  ) {
    const values: number[] = [];
    for (let index = 0; index < days.length; index += 1) {
      const day = days[Math.floor(random() * days.length)]!;
      values.push(...(byDay.get(day) ?? []).map((item) => item.value));
    }
    const value = mean(values);
    if (value !== null) samples.push(value);
  }
  const lower = quantile(samples, 0.025);
  const upper = quantile(samples, 0.975);
  if (lower === null || upper === null) return null;
  return {
    method: "seeded_trading_day_cluster_bootstrap_v1",
    confidence_level: 0.95,
    lower: round(lower),
    upper: round(upper),
    bootstrap_seed: seed,
    bootstrap_iterations: 1_000,
  };
}

function wilsonInterval(successes: number, count: number): Interval | null {
  if (count < 1) return null;
  const z = 1.959963984540054;
  const proportion = successes / count;
  const denominator = 1 + (z * z) / count;
  const center = (proportion + (z * z) / (2 * count)) / denominator;
  const margin =
    (z / denominator) *
    Math.sqrt((proportion * (1 - proportion)) / count + (z * z) / (4 * count * count));
  return {
    method: "wilson_score_interval_v1",
    confidence_level: 0.95,
    lower: round(Math.max(0, center - margin)),
    upper: round(Math.min(1, center + margin)),
    bootstrap_seed: null,
    bootstrap_iterations: null,
  };
}

function metric(
  values: ReadonlyArray<{ trading_date: string; value: number }>,
  seed: string,
  reasonCodes: string[] = [],
): Metric {
  const value = mean(values.map((item) => item.value));
  const interval = clusteredMeanInterval(values, seed);
  return {
    value: value === null ? null : round(value),
    denominator: values.length,
    confidence_interval: interval,
    reason_codes: uniqueSorted([
      ...reasonCodes,
      ...(values.length === 0 ? ["denominator_undefined"] : []),
      ...(!interval ? ["uncertainty_interval_not_defined"] : []),
    ]),
  };
}

function precisionMetric(
  values: ReadonlyArray<{ trading_date: string; value: number }>,
): Metric {
  const successes = values.filter((item) => item.value === 1).length;
  const interval = wilsonInterval(successes, values.length);
  return {
    value: values.length === 0 ? null : round(successes / values.length),
    denominator: values.length,
    confidence_interval: interval,
    reason_codes: uniqueSorted([
      "positive_r_is_success_v1",
      ...(values.length === 0 ? ["denominator_undefined"] : []),
      ...(!interval ? ["uncertainty_interval_not_defined"] : []),
    ]),
  };
}

function validEvidence(value: InternalPaperReplayCharterPolicyEvidence) {
  return (
    (value.predicted_probability === null || unit(value.predicted_probability)) &&
    (value.provider_cost_credits === null ||
      (finite(value.provider_cost_credits) && value.provider_cost_credits >= 0)) &&
    (value.source_reliable === null || typeof value.source_reliable === "boolean") &&
    value.feasibility !== null &&
    typeof value.feasibility === "object" &&
    FEASIBILITY_KEYS.every(
      (key) =>
        value.feasibility[key] === true ||
        value.feasibility[key] === false ||
        value.feasibility[key] === null,
    )
  );
}

function validCharterEvidenceInput(
  value: InternalPaperReplayCharterEvidenceInput,
) {
  return (
    value.evidence_version === INTERNAL_PAPER_REPLAY_CHARTER_EVIDENCE_VERSION &&
    explicitInstant(value.evaluated_at) &&
    Boolean(textOrNull(value.bootstrap_seed)) &&
    Array.isArray(value.decisions) &&
    value.decisions.length > 0 &&
    value.decisions.length <= 100_000 &&
    value.decisions.every(
      (item) =>
        Boolean(textOrNull(item.scan_run_fingerprint)) &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.trading_date) &&
        validEvidence(item.baseline) &&
        validEvidence(item.candidate),
    )
  );
}

export function buildInternalPaperReplayCharterEvidence(
  input: InternalPaperReplayCharterEvidenceInput,
): InternalPaperReplayCharterEvidence | null {
  if (!validCharterEvidenceInput(input)) return null;
  const unsigned: InternalPaperReplayCharterEvidenceInput = {
    evidence_version: INTERNAL_PAPER_REPLAY_CHARTER_EVIDENCE_VERSION,
    evaluated_at: input.evaluated_at,
    bootstrap_seed: input.bootstrap_seed.trim(),
    decisions: [...input.decisions]
      .map((item) => ({
        ...item,
        scan_run_fingerprint: item.scan_run_fingerprint.trim(),
        setup: textOrNull(item.setup),
        regime: textOrNull(item.regime),
      }))
      .sort((left, right) =>
        left.scan_run_fingerprint.localeCompare(right.scan_run_fingerprint),
      ),
  };
  return { ...unsigned, evidence_digest: digest(unsigned) };
}

export function verifyInternalPaperReplayCharterEvidenceDigest(
  value: InternalPaperReplayCharterEvidence,
) {
  const { evidence_digest: evidenceDigest, ...payload } = value;
  return (
    SHA256_PATTERN.test(evidenceDigest) &&
    validCharterEvidenceInput(payload) &&
    digest(payload) === evidenceDigest
  );
}

function samePolicy(
  left: RecommendationEvaluationCharter["policy_attribution"],
  right: InternalPaperReplayExperimentInput["manifest"]["baseline"]["policy_lineage"],
) {
  return (
    left.recommendation_publish_policy_version ===
      right.recommendation_publish_policy_version &&
    Object.entries(left.canonical_evaluation_versions).every(
      ([key, value]) =>
        right.canonical_evaluation_versions[
          key as keyof typeof right.canonical_evaluation_versions
        ] === value,
    )
  );
}

function validCharter(charter: RecommendationEvaluationCharter) {
  if (
    !UUID_PATTERN.test(charter.charter_id) ||
    !UUID_PATTERN.test(charter.owner_user_id) ||
    !explicitInstant(charter.created_at)
  ) {
    return false;
  }
  const rebuilt = buildRecommendationEvaluationCharterInput({
    ownerUserId: charter.owner_user_id,
    segmentKey: charter.segment_key,
    policy: charter.policy_attribution,
    charter: charter.charter,
  });
  return rebuilt?.charter_fingerprint === charter.charter_fingerprint;
}

function validBaselineFreeze(
  baseline: RecommendationLearningBaselineFreeze,
) {
  const fingerprints = baseline.decision_record_fingerprints;
  const planFingerprints =
    baseline.evaluation_plan.decision_records.scan_run_fingerprints;
  return (
    UUID_PATTERN.test(baseline.baseline_id) &&
    UUID_PATTERN.test(baseline.owner_user_id) &&
    SHA256_PATTERN.test(baseline.baseline_fingerprint) &&
    SHA256_PATTERN.test(baseline.evaluation_charter_fingerprint) &&
    explicitInstant(baseline.frozen_at) &&
    Boolean(textOrNull(baseline.segment_key)) &&
    Array.isArray(fingerprints) &&
    fingerprints.length > 0 &&
    new Set(fingerprints).size === fingerprints.length &&
    fingerprints.every((fingerprint) => Boolean(textOrNull(fingerprint))) &&
    baseline.evaluation_plan.contract_version ===
      "recommendation_learning_evaluation_plan_v1" &&
    baseline.evaluation_plan.status === "ready_for_explicit_freeze" &&
    baseline.evaluation_plan.segment_key === baseline.segment_key &&
    baseline.evaluation_plan.blockers.length === 0 &&
    baseline.evaluation_plan.decision_records.count === fingerprints.length &&
    planFingerprints.length === fingerprints.length &&
    planFingerprints.every(
      (fingerprint, index) => fingerprint === fingerprints[index],
    )
  );
}

function blocked(
  input: InternalPaperReplayExperimentInput,
  baseline: RecommendationLearningBaselineFreeze,
  charter: RecommendationEvaluationCharter,
  reasons: string[],
  evidence?: InternalPaperReplayCharterEvidence,
): InternalPaperReplayCharterScorecardResult {
  return terminal({
    scorecard_version: INTERNAL_PAPER_REPLAY_CHARTER_SCORECARD_VERSION,
    status: "blocked" as const,
    verdict: "inconclusive" as const,
    reason_codes: uniqueSorted(reasons),
    experiment_id: textOrNull(input.manifest.experiment_id),
    experiment_manifest_digest: SHA256_PATTERN.test(input.manifest.manifest_digest)
      ? input.manifest.manifest_digest
      : null,
    baseline_fingerprint: SHA256_PATTERN.test(baseline.baseline_fingerprint)
      ? baseline.baseline_fingerprint
      : null,
    evaluation_charter_fingerprint: SHA256_PATTERN.test(
      charter.charter_fingerprint,
    )
      ? charter.charter_fingerprint
      : null,
    evidence_digest:
      evidence && SHA256_PATTERN.test(evidence.evidence_digest)
        ? evidence.evidence_digest
        : null,
    authority: AUTHORITY,
  });
}

function minimumGate(
  gate: string,
  metricValue: Metric,
  threshold: number,
): Gate {
  const interval = metricValue.confidence_interval;
  const status =
    metricValue.value === null || !interval
      ? "inconclusive"
      : interval.lower >= threshold
        ? "pass"
        : interval.upper < threshold
          ? "fail"
          : "inconclusive";
  return {
    gate,
    status,
    observed: metricValue.value,
    threshold,
    confidence_interval: interval,
    reason_codes: uniqueSorted([
      ...metricValue.reason_codes,
      ...(status === "inconclusive" ? ["threshold_not_resolved_by_uncertainty"] : []),
    ]),
  };
}

function strictImprovementGate(metricValue: Metric): Gate {
  const interval = metricValue.confidence_interval;
  const status =
    metricValue.value === null || !interval
      ? "inconclusive"
      : interval.lower > 0
        ? "pass"
        : interval.upper < 0
          ? "fail"
          : "inconclusive";
  return {
    gate: "candidate_paired_net_pnl_improvement",
    status,
    observed: metricValue.value,
    threshold: 0,
    confidence_interval: interval,
    reason_codes: uniqueSorted([
      ...metricValue.reason_codes,
      ...(status === "inconclusive"
        ? ["strict_improvement_not_resolved_by_uncertainty"]
        : []),
      ...(status === "fail" ? ["candidate_paired_net_pnl_regression"] : []),
    ]),
  };
}

function maximumGate(
  gate: string,
  metricValue: Metric,
  threshold: number,
): Gate {
  const interval = metricValue.confidence_interval;
  const status =
    metricValue.value === null || !interval
      ? "inconclusive"
      : interval.upper <= threshold
        ? "pass"
        : interval.lower > threshold
          ? "fail"
          : "inconclusive";
  return {
    gate,
    status,
    observed: metricValue.value,
    threshold,
    confidence_interval: interval,
    reason_codes: uniqueSorted([
      ...metricValue.reason_codes,
      ...(status === "inconclusive" ? ["threshold_not_resolved_by_uncertainty"] : []),
    ]),
  };
}

function exactGate(
  gate: string,
  observed: number | null,
  threshold: number,
  pass: (observed: number, threshold: number) => boolean,
  failReason: string,
): Gate {
  return {
    gate,
    status: observed === null ? "inconclusive" : pass(observed, threshold) ? "pass" : "fail",
    observed,
    threshold,
    confidence_interval: null,
    reason_codes:
      observed === null
        ? ["metric_unavailable"]
        : pass(observed, threshold)
          ? []
          : [failReason],
  };
}

function policyMetrics(
  decisions: NormalizedDecision[],
  side: "baseline" | "candidate",
  charter: RecommendationEvaluationCharter,
  seed: string,
): PolicyMetrics {
  const selected = decisions.filter((item) => item[side].selected);
  const complete = selected.filter((item) => finite(item[side].r_multiple));
  const precisionValues = complete.map((item) => ({
    trading_date: item.trading_date,
    value: (item[side].r_multiple as number) > 0 ? 1 : 0,
  }));
  const expectancyValues = complete.map((item) => ({
    trading_date: item.trading_date,
    value: item[side].r_multiple as number,
  }));
  const calibrationValues = complete.flatMap((item) =>
    item[side].predicted_probability === null
      ? []
      : [{
          trading_date: item.trading_date,
          value: Math.abs(
            item[side].predicted_probability! -
              ((item[side].r_multiple as number) > 0 ? 1 : 0),
          ),
        }],
  );
  const providerCosts = decisions.map((item) => item[side].provider_cost_credits);
  const reliable = selected.map((item) => item[side].source_reliable);
  const requiredFeasibilityMissing = FEASIBILITY_KEYS.filter(
    (key) =>
      charter.charter.feasibility_inputs[key] === "required" &&
      selected.some((item) => item[side].feasibility[key] !== true),
  );

  return {
    decision_count: decisions.length,
    selected_count: selected.length,
    complete_selected_count: complete.length,
    explicit_no_trade_count: decisions.length - selected.length,
    effective_trading_day_count: new Set(
      complete.map((item) => item.trading_date),
    ).size,
    effective_ticker_count: new Set(
      complete.map((item) => item.ticker).filter((item): item is string => Boolean(item)),
    ).size,
    precision: precisionMetric(precisionValues),
    expectancy_r: metric(expectancyValues, `${seed}:expectancy_r`),
    calibration_error: metric(
      calibrationValues,
      `${seed}:calibration_error`,
      calibrationValues.length !== complete.length
        ? ["calibrated_probability_missing"]
        : [],
    ),
    outcome_coverage:
      selected.length === 0 ? null : round(complete.length / selected.length),
    missingness:
      selected.length === 0 ? null : round(1 - complete.length / selected.length),
    provider_credits_per_decision:
      providerCosts.length > 0 && providerCosts.every(finite)
        ? round(mean(providerCosts as number[])!)
        : null,
    reliability:
      reliable.length > 0 && reliable.every((value) => typeof value === "boolean")
        ? round(reliable.filter(Boolean).length / reliable.length)
        : null,
    maximum_single_ticker_share: maximumShare(
      selected.map((item) => item.ticker?.toUpperCase() ?? null),
    ),
    maximum_single_sector_share: maximumShare(
      selected.map((item) => item.sector?.toLowerCase() ?? null),
    ),
    maximum_single_setup_share: maximumShare(
      selected.map((item) => item.setup?.toLowerCase() ?? null),
    ),
    maximum_single_regime_share: maximumShare(
      selected.map((item) => item.regime?.toLowerCase() ?? null),
    ),
    required_feasibility_missing: requiredFeasibilityMissing,
  };
}

function partitionScorecard(
  partition: "held_out" | "walk_forward",
  decisions: NormalizedDecision[],
  charter: RecommendationEvaluationCharter,
  evidenceCount: number,
  seed: string,
): InternalPaperReplayCharterPartitionScorecard {
  const baseline = policyMetrics(decisions, "baseline", charter, `${seed}:baseline`);
  const candidate = policyMetrics(decisions, "candidate", charter, `${seed}:candidate`);
  const pairedDelta = metric(
    decisions.map((item) => ({
      trading_date: item.trading_date,
      value: round(
        item.candidate.realized_net_pnl - item.baseline.realized_net_pnl,
      ),
    })),
    `${seed}:paired_net_pnl_delta`,
    ["paired_same_day_net_pnl_delta_v1"],
  );
  const requiredPartitionCount =
    partition === "held_out"
      ? charter.charter.evaluation_window.held_out_decision_count
      : charter.charter.evaluation_window.walk_forward_decision_count;
  const sampleGates = [
    exactGate(
      "minimum_partition_decision_count",
      decisions.length,
      requiredPartitionCount,
      (observed, threshold) => observed >= threshold,
      "minimum_partition_decision_count_not_met",
    ),
    exactGate(
      "minimum_complete_selected_decisions",
      candidate.complete_selected_count,
      internalPaperReplayCharterScorecardPolicy.minimum_complete_selected_decisions,
      (observed, threshold) => observed >= threshold,
      "minimum_complete_selected_decisions_not_met",
    ),
    exactGate(
      "minimum_effective_trading_days",
      candidate.effective_trading_day_count,
      internalPaperReplayCharterScorecardPolicy.minimum_effective_trading_days,
      (observed, threshold) => observed >= threshold,
      "minimum_effective_trading_days_not_met",
    ),
    exactGate(
      "minimum_effective_tickers",
      candidate.effective_ticker_count,
      internalPaperReplayCharterScorecardPolicy.minimum_effective_tickers,
      (observed, threshold) => observed >= threshold,
      "minimum_effective_tickers_not_met",
    ),
  ];
  const thresholds = charter.charter.thresholds;
  const limits = charter.charter.concentration_limits;
  const candidateQualityGates = [
    minimumGate("minimum_precision_at_k", candidate.precision, thresholds.minimum_precision_at_k),
    minimumGate("minimum_expectancy_r", candidate.expectancy_r, thresholds.minimum_expectancy_r),
    maximumGate("maximum_calibration_error", candidate.calibration_error, thresholds.maximum_calibration_error),
    exactGate("minimum_outcome_coverage", candidate.outcome_coverage, thresholds.minimum_outcome_coverage, (observed, threshold) => observed >= threshold, "minimum_outcome_coverage_not_met"),
    exactGate("maximum_missingness", candidate.missingness, thresholds.maximum_missingness, (observed, threshold) => observed <= threshold, "maximum_missingness_exceeded"),
    exactGate("maximum_provider_credits_per_decision", candidate.provider_credits_per_decision, thresholds.maximum_provider_credits_per_decision, (observed, threshold) => observed <= threshold, "maximum_provider_credits_per_decision_exceeded"),
    exactGate("minimum_reliability", candidate.reliability, thresholds.minimum_reliability, (observed, threshold) => observed >= threshold, "minimum_reliability_not_met"),
    exactGate("maximum_single_ticker_share", candidate.maximum_single_ticker_share, limits.maximum_single_ticker_share, (observed, threshold) => observed <= threshold, "maximum_single_ticker_share_exceeded"),
    exactGate("maximum_single_sector_share", candidate.maximum_single_sector_share, limits.maximum_single_sector_share, (observed, threshold) => observed <= threshold, "maximum_single_sector_share_exceeded"),
    exactGate("maximum_single_setup_share", candidate.maximum_single_setup_share, limits.maximum_single_setup_share, (observed, threshold) => observed <= threshold, "maximum_single_setup_share_exceeded"),
    exactGate("maximum_single_regime_share", candidate.maximum_single_regime_share, limits.maximum_single_regime_share, (observed, threshold) => observed <= threshold, "maximum_single_regime_share_exceeded"),
    {
      gate: "required_feasibility",
      status:
        candidate.selected_count === 0
          ? "inconclusive"
          : candidate.required_feasibility_missing.length === 0
            ? "pass"
            : "fail",
      observed:
        candidate.selected_count === 0
          ? null
          : candidate.required_feasibility_missing.length,
      threshold: 0,
      confidence_interval: null,
      reason_codes:
        candidate.selected_count === 0
          ? ["selected_decision_denominator_undefined"]
          : candidate.required_feasibility_missing.map(
              (key) => `required_feasibility_missing:${key}`,
            ),
    } satisfies Gate,
  ];
  const baselineComparisonGate = strictImprovementGate(pairedDelta);
  const completeCoverage = decisions.length === evidenceCount;
  const sampleReady =
    completeCoverage && sampleGates.every((gate) => gate.status === "pass");
  const qualityFailed = candidateQualityGates.some((gate) => gate.status === "fail") ||
    baselineComparisonGate.status === "fail";
  const allQualityPassed = candidateQualityGates.every((gate) => gate.status === "pass") &&
    baselineComparisonGate.status === "pass";
  const verdict = !sampleReady
    ? "inconclusive"
    : qualityFailed
      ? "fail"
      : allQualityPassed
        ? "pass"
        : "inconclusive";
  const reasons = uniqueSorted([
    ...(!completeCoverage ? ["paired_decision_population_incomplete"] : []),
    ...sampleGates.flatMap((gate) =>
      gate.status === "pass" ? [] : gate.reason_codes,
    ),
    ...candidateQualityGates.flatMap((gate) =>
      gate.status === "pass" ? [] : gate.reason_codes,
    ),
    ...(baselineComparisonGate.status === "pass"
      ? []
      : baselineComparisonGate.reason_codes),
  ]);
  return {
    partition,
    verdict,
    trading_dates: uniqueSorted(decisions.map((item) => item.trading_date)),
    expected_decision_count: decisions.length,
    evidenced_decision_count: evidenceCount,
    complete_paired_decision_coverage: completeCoverage,
    baseline,
    candidate,
    paired_net_pnl_delta: pairedDelta,
    sample_gates: sampleGates,
    candidate_quality_gates: candidateQualityGates,
    baseline_comparison_gate: baselineComparisonGate,
    reason_codes: reasons,
  };
}

/**
 * Converts one exact frozen F.1 experiment into a charter-bound, research-only
 * scorecard. Every replay decision must have exactly one evidence row; missing,
 * duplicated or extra decisions block evaluation instead of shrinking the
 * denominator. Statistical pass/fail remains impossible until effective-sample
 * and uncertainty gates are resolved in both held-out and walk-forward data.
 */
export function evaluateInternalPaperReplayCharterScorecard({
  experiment,
  baseline,
  charter,
  evidence,
}: {
  experiment: InternalPaperReplayExperimentInput;
  baseline: RecommendationLearningBaselineFreeze;
  charter: RecommendationEvaluationCharter;
  evidence: InternalPaperReplayCharterEvidence;
}): InternalPaperReplayCharterScorecardResult {
  const reasons: string[] = [];
  if (experiment.experiment_version !== INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION) {
    reasons.push("experiment_version_invalid");
  }
  if (!validCharter(charter)) reasons.push("evaluation_charter_invalid");
  if (!validBaselineFreeze(baseline)) reasons.push("baseline_freeze_invalid");
  if (
    baseline.baseline_fingerprint !== experiment.manifest.baseline_fingerprint ||
    baseline.evaluation_charter_fingerprint !== charter.charter_fingerprint ||
    experiment.manifest.evaluation_charter_fingerprint !== charter.charter_fingerprint
  ) {
    reasons.push("baseline_charter_experiment_binding_mismatch");
  }
  if (
    Date.parse(charter.created_at) > Date.parse(baseline.frozen_at) ||
    Date.parse(baseline.frozen_at) > Date.parse(experiment.manifest.frozen_at)
  ) {
    reasons.push("charter_baseline_experiment_freeze_order_invalid");
  }
  if (
    baseline.owner_user_id !== experiment.baseline.owner_user_id ||
    charter.owner_user_id !== experiment.baseline.owner_user_id ||
    !recommendationEvaluationCharterMatchesPolicySegment({
      charter,
      segmentKey: baseline.segment_key,
      policy: baseline.evaluation_plan.policy_attribution,
    }) ||
    !samePolicy(baseline.evaluation_plan.policy_attribution, experiment.manifest.baseline.policy_lineage)
  ) {
    reasons.push("owner_segment_or_policy_binding_mismatch");
  }
  const horizon = Number(charter.charter.outcome_rules.primary_horizon.slice(0, -1));
  if (horizon !== experiment.manifest.primary_outcome_horizon_minutes) {
    reasons.push("primary_outcome_horizon_mismatch");
  }
  if (
    !verifyInternalPaperReplayCharterEvidenceDigest(evidence) ||
    Date.parse(evidence.evaluated_at) < Date.parse(experiment.manifest.frozen_at)
  ) {
    reasons.push("charter_evidence_invalid");
  }

  const experimentResult = runInternalPaperReplayExperiment(experiment);
  if (experimentResult.status !== "completed") {
    reasons.push("frozen_experiment_not_completed");
  }
  const baselineResult = runInternalPaperReplayCorpus(experiment.baseline);
  const candidateResult = runInternalPaperReplayCorpus(experiment.candidate);
  if (baselineResult.status !== "completed" || candidateResult.status !== "completed") {
    reasons.push("paired_corpus_not_completed");
  }
  if (reasons.length > 0 || experimentResult.status !== "completed" ||
    baselineResult.status !== "completed" || candidateResult.status !== "completed") {
    return blocked(experiment, baseline, charter, reasons, evidence);
  }

  const evidenceByFingerprint = new Map(
    evidence.decisions.map((item) => [item.scan_run_fingerprint, item]),
  );
  if (evidenceByFingerprint.size !== evidence.decisions.length) {
    return blocked(
      experiment,
      baseline,
      charter,
      ["duplicate_decision_evidence"],
      evidence,
    );
  }

  const normalized: NormalizedDecision[] = [];
  for (const [index, binding] of experiment.manifest.sessions.entries()) {
    const baselineSession = experiment.baseline.sessions[index];
    const candidateSession = experiment.candidate.sessions[index];
    const baselineReplay = baselineResult.sessions[index];
    const candidateReplay = candidateResult.sessions[index];
    if (
      !baselineSession ||
      !candidateSession ||
      !baselineReplay ||
      !candidateReplay ||
      baselineSession.decisions.length !== 1 ||
      candidateSession.decisions.length !== 1
    ) {
      return blocked(
        experiment,
        baseline,
        charter,
        ["scorecard_requires_one_decision_per_replay_session"],
        evidence,
      );
    }
    const baselineDecision = baselineSession.decisions[0]!.decision;
    const candidateDecision = candidateSession.decisions[0]!.decision;
    if (
      baselineDecision.scan_run_fingerprint !== candidateDecision.scan_run_fingerprint ||
      baselineDecision.scan_run_fingerprint.trim().length === 0
    ) {
      return blocked(
        experiment,
        baseline,
        charter,
        ["paired_decision_identity_mismatch"],
        evidence,
      );
    }
    const row = evidenceByFingerprint.get(baselineDecision.scan_run_fingerprint);
    if (!row || row.trading_date !== binding.trading_date) {
      return blocked(
        experiment,
        baseline,
        charter,
        ["paired_decision_population_incomplete_or_mismatched"],
        evidence,
      );
    }
    const candidates = baselineDecision.candidates;
    const candidateCandidates = candidateDecision.candidates;
    if (
      candidates.length !== 1 ||
      candidateCandidates.length !== 1 ||
      candidates[0]!.candidate_id !== candidateCandidates[0]!.candidate_id
    ) {
      return blocked(
        experiment,
        baseline,
        charter,
        ["scorecard_requires_one_paired_candidate_per_decision"],
        evidence,
      );
    }
    const setup = textOrNull(row.setup);
    const regime = textOrNull(row.regime);
    if (
      !setup ||
      !regime ||
      !charter.charter.setup_slices.some(
        (value) => value.toLowerCase() === setup.toLowerCase(),
      ) ||
      !charter.charter.regime_slices.some(
        (value) => value.toLowerCase() === regime.toLowerCase(),
      )
    ) {
      return blocked(
        experiment,
        baseline,
        charter,
        ["decision_outside_charter_setup_or_regime_slices"],
        evidence,
      );
    }
    normalized.push({
      scan_run_fingerprint: baselineDecision.scan_run_fingerprint,
      trading_date: binding.trading_date,
      partition: binding.partition,
      ticker: textOrNull(candidates[0]!.ticker)?.toUpperCase() ?? null,
      sector: textOrNull(candidates[0]!.sector),
      setup,
      regime,
      baseline: {
        ...row.baseline,
        selected: baselineReplay.executed_position_count === 1,
        r_multiple: baselineReplay.r_multiple,
        realized_net_pnl: baselineReplay.realized_net_pnl,
      },
      candidate: {
        ...row.candidate,
        selected: candidateReplay.executed_position_count === 1,
        r_multiple: candidateReplay.r_multiple,
        realized_net_pnl: candidateReplay.realized_net_pnl,
      },
    });
  }
  const expectedFingerprints = new Set(
    normalized.map((item) => item.scan_run_fingerprint),
  );
  if (
    expectedFingerprints.size !== normalized.length ||
    evidence.decisions.length !== normalized.length ||
    evidence.decisions.some(
      (item) => !expectedFingerprints.has(item.scan_run_fingerprint),
    )
  ) {
    return blocked(
      experiment,
      baseline,
      charter,
      ["paired_decision_population_incomplete_or_extra"],
      evidence,
    );
  }

  const partitions = PARTITIONS.map((partition) => {
    const values = normalized.filter((item) => item.partition === partition);
    const evidenced = evidence.decisions.filter((item) =>
      values.some(
        (value) => value.scan_run_fingerprint === item.scan_run_fingerprint,
      ),
    ).length;
    return partitionScorecard(
      partition,
      values,
      charter,
      evidenced,
      `${evidence.bootstrap_seed}:${partition}`,
    );
  });
  const completeSelected = partitions.reduce(
    (sum, item) => sum + item.candidate.complete_selected_count,
    0,
  );
  const globalMinimumMet =
    completeSelected >= charter.charter.evaluation_window.minimum_complete_decisions;
  const verdict = !globalMinimumMet
    ? "inconclusive"
    : partitions.some((item) => item.verdict === "fail")
      ? "fail"
      : partitions.every((item) => item.verdict === "pass")
        ? "pass"
        : "inconclusive";
  const reasonCodes = uniqueSorted([
    ...(!globalMinimumMet ? ["minimum_complete_decision_count_not_met"] : []),
    ...partitions.flatMap((item) => item.reason_codes),
  ]);
  return terminal({
    scorecard_version: INTERNAL_PAPER_REPLAY_CHARTER_SCORECARD_VERSION,
    status: "completed" as const,
    verdict,
    scientific_disposition: "research_scorecard_not_strategy_accepted" as const,
    experiment_id: experiment.manifest.experiment_id,
    experiment_manifest_digest: experiment.manifest.manifest_digest,
    experiment_result_digest: experimentResult.result_digest,
    baseline_fingerprint: baseline.baseline_fingerprint,
    evaluation_charter_fingerprint: charter.charter_fingerprint,
    evidence_digest: evidence.evidence_digest,
    policy_version: internalPaperReplayCharterScorecardPolicy.policy_version,
    population: {
      expected_decision_count: normalized.length,
      evidenced_decision_count: evidence.decisions.length,
      complete_paired_decision_coverage: true,
      explicit_no_trade_decision_count: normalized.filter(
        (item) => !item.baseline.selected || !item.candidate.selected,
      ).length,
    },
    partitions,
    reason_codes: reasonCodes,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
