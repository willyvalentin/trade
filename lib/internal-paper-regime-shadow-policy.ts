import { createHash } from "node:crypto";

import {
  internalPaperReplayCharterScorecardPolicy,
} from "@/lib/internal-paper-replay-charter-scorecard";
import {
  evaluateInternalPaperReplayRegimeAttributedScorecard,
  verifyInternalPaperReplayRegimeAttributedScorecardDigest,
  type InternalPaperReplayRegimeAttributionEvidence,
} from "@/lib/internal-paper-replay-regime-attribution";
import {
  runInternalPaperReplayCorpus,
  type InternalPaperReplayCorpusSessionResult,
} from "@/lib/internal-paper-replay-corpus";
import type {
  InternalPaperReplayExperimentInput,
  InternalPaperReplayExperimentPartition,
} from "@/lib/internal-paper-replay-experiment";
import type { MarketContextShadowReplayV1Input } from "@/lib/market-context-intelligence-lab/shadow-replay-v1";
import type { RecommendationEvaluationCharter } from "@/lib/recommendation-evaluation-charter";
import type { RecommendationLearningBaselineFreeze } from "@/lib/recommendation-learning-baseline-freeze-store";

export const INTERNAL_PAPER_REGIME_SHADOW_POLICY_VERSION =
  "internal_paper_regime_shadow_policy_v1" as const;
export const INTERNAL_PAPER_REGIME_SHADOW_POLICY_RESULT_VERSION =
  "internal_paper_regime_shadow_policy_result_v1" as const;

const BOOTSTRAP_ITERATIONS = 1_000 as const;
const CONFIDENCE_LEVEL = 0.95 as const;
const EVALUATED_PARTITIONS = ["held_out", "walk_forward"] as const;
const FEASIBILITY_KEYS = [
  "spread",
  "liquidity",
  "volatility",
  "halt_risk",
  "trigger_attainment",
  "conservative_slippage",
] as const;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

type Interval = Readonly<{
  method: "wilson_score_interval_v1" | "seeded_trading_day_cluster_bootstrap_v1";
  confidence_level: typeof CONFIDENCE_LEVEL;
  lower: number;
  upper: number;
  bootstrap_iterations: typeof BOOTSTRAP_ITERATIONS | null;
}>;

type Metric = Readonly<{
  value: number | null;
  denominator: number;
  confidence_interval: Interval | null;
}>;

type Gate = Readonly<{
  gate: string;
  status: "pass" | "fail" | "inconclusive";
  observed: number | null;
  threshold: number;
  confidence_interval: Interval | null;
  reason_codes: string[];
}>;

export type InternalPaperRegimeShadowPartitionEvaluation = Readonly<{
  partition: (typeof EVALUATED_PARTITIONS)[number];
  decision_count: number;
  selected_count: number;
  complete_selected_count: number;
  effective_trading_day_count: number;
  effective_ticker_count: number;
  precision: Metric;
  expectancy_r: Metric;
  calibration_error: Metric;
  paired_net_pnl_delta: Metric;
  outcome_coverage: number | null;
  missingness: number | null;
  provider_credits_per_decision: number | null;
  reliability: number | null;
  maximum_single_ticker_share: number | null;
  maximum_single_sector_share: number | null;
  maximum_single_setup_share: number | null;
  required_feasibility_missing: string[];
  gates: Gate[];
  verdict: "pass" | "fail" | "inconclusive";
  reason_codes: string[];
}>;

export type InternalPaperRegimeShadowDecision = Readonly<{
  regime: string;
  action: "shadow_enabled" | "shadow_disabled" | "insufficient_evidence";
  partitions: InternalPaperRegimeShadowPartitionEvaluation[];
  reason_codes: string[];
}>;

export type InternalPaperRegimeShadowPolicyResult = Readonly<{
  result_version: typeof INTERNAL_PAPER_REGIME_SHADOW_POLICY_RESULT_VERSION;
  policy_version: typeof INTERNAL_PAPER_REGIME_SHADOW_POLICY_VERSION;
  status: "completed" | "blocked";
  scientific_disposition: "replay_shadow_policy_not_strategy_accepted";
  reason_codes: string[];
  experiment_id: string | null;
  experiment_manifest_digest: string | null;
  regime_attribution_result_digest: string | null;
  context_dataset_digest: string | null;
  context_replay_evidence_digest: string | null;
  decisions: InternalPaperRegimeShadowDecision[];
  enabled_regime_count: number;
  disabled_regime_count: number;
  insufficient_regime_count: number;
  evidence_limits: readonly [
    "replay_shadow_only",
    "historical_source_rights_not_independently_verified",
    "no_synchronized_fresh_input_acceptance",
    "no_forward_shadow_acceptance",
    "no_automatic_policy_promotion",
  ];
  authority: Authority;
  result_digest: string;
}>;

type DecisionRow = Readonly<{
  fingerprint: string;
  trading_date: string;
  partition: InternalPaperReplayExperimentPartition;
  ticker: string;
  sector: string | null;
  setup: string;
  regime: string;
  candidate_selected: boolean;
  candidate_r_multiple: number | null;
  candidate_net_pnl: number;
  baseline_net_pnl: number;
  predicted_probability: number | null;
  provider_cost_credits: number | null;
  source_reliable: boolean | null;
  feasibility: InternalPaperReplayRegimeAttributionEvidence["decisions"][number]["candidate"]["feasibility"];
}>;

const AUTHORITY = {
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_promote_strategy: false,
  can_execute_broker_action: false,
} as const;

const EVIDENCE_LIMITS = [
  "replay_shadow_only",
  "historical_source_rights_not_independently_verified",
  "no_synchronized_fresh_input_acceptance",
  "no_forward_shadow_acceptance",
  "no_automatic_policy_promotion",
] as const;

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

function terminal(
  value: Omit<InternalPaperRegimeShadowPolicyResult, "result_digest">,
): InternalPaperRegimeShadowPolicyResult {
  return { ...value, result_digest: digest(value) };
}

export function verifyInternalPaperRegimeShadowPolicyDigest(
  value: InternalPaperRegimeShadowPolicyResult,
) {
  const { result_digest: resultDigest, ...payload } = value;
  return SHA256_PATTERN.test(resultDigest) && digest(payload) === resultDigest;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function round(value: number) {
  return Number(value.toFixed(6));
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function mean(values: number[]) {
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function maximumShare(values: Array<string | null>) {
  if (values.length === 0 || values.some((value) => value === null)) return null;
  const counts = new Map<string, number>();
  for (const value of values as string[]) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return round(Math.max(...counts.values()) / values.length);
}

function seededRandom(seed: string) {
  let state = Number.parseInt(createHash("sha256").update(seed).digest("hex").slice(0, 8), 16) || 1;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function percentile(sorted: number[], probability: number) {
  if (sorted.length === 0) return null;
  const index = (sorted.length - 1) * probability;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower]!;
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (index - lower);
}

function clusteredMetric(
  values: Array<{ trading_date: string; value: number }>,
  seed: string,
): Metric {
  if (values.length === 0) {
    return { value: null, denominator: 0, confidence_interval: null };
  }
  const byDay = new Map<string, number[]>();
  for (const item of values) {
    byDay.set(item.trading_date, [...(byDay.get(item.trading_date) ?? []), item.value]);
  }
  const days = [...byDay.keys()].sort();
  const random = seededRandom(seed);
  const samples: number[] = [];
  for (let iteration = 0; iteration < BOOTSTRAP_ITERATIONS; iteration += 1) {
    const sampled: number[] = [];
    for (let index = 0; index < days.length; index += 1) {
      sampled.push(...byDay.get(days[Math.floor(random() * days.length)]!)!);
    }
    samples.push(mean(sampled)!);
  }
  samples.sort((left, right) => left - right);
  return {
    value: round(mean(values.map((item) => item.value))!),
    denominator: values.length,
    confidence_interval: {
      method: "seeded_trading_day_cluster_bootstrap_v1",
      confidence_level: CONFIDENCE_LEVEL,
      lower: round(percentile(samples, 0.025)!),
      upper: round(percentile(samples, 0.975)!),
      bootstrap_iterations: BOOTSTRAP_ITERATIONS,
    },
  };
}

function precisionMetric(values: Array<{ trading_date: string; value: number }>): Metric {
  if (values.length === 0) {
    return { value: null, denominator: 0, confidence_interval: null };
  }
  const successes = values.reduce((sum, item) => sum + item.value, 0);
  const denominator = values.length;
  const proportion = successes / denominator;
  const z = 1.959963984540054;
  const denominatorAdjustment = 1 + (z * z) / denominator;
  const center = (proportion + (z * z) / (2 * denominator)) / denominatorAdjustment;
  const margin =
    (z / denominatorAdjustment) *
    Math.sqrt(
      (proportion * (1 - proportion)) / denominator +
        (z * z) / (4 * denominator * denominator),
    );
  return {
    value: round(proportion),
    denominator,
    confidence_interval: {
      method: "wilson_score_interval_v1",
      confidence_level: CONFIDENCE_LEVEL,
      lower: round(Math.max(0, center - margin)),
      upper: round(Math.min(1, center + margin)),
      bootstrap_iterations: null,
    },
  };
}

function exactGate(
  gate: string,
  observed: number | null,
  threshold: number,
  pass: (observedValue: number, thresholdValue: number) => boolean,
  failReason: string,
): Gate {
  const status = observed === null
    ? "inconclusive"
    : pass(observed, threshold)
      ? "pass"
      : "fail";
  return {
    gate,
    status,
    observed,
    threshold,
    confidence_interval: null,
    reason_codes:
      status === "pass"
        ? []
        : [status === "inconclusive" ? "metric_unavailable" : failReason],
  };
}

function sampleGate(
  gate: string,
  observed: number,
  threshold: number,
  reason: string,
): Gate {
  const status = observed >= threshold ? "pass" : "inconclusive";
  return {
    gate,
    status,
    observed,
    threshold,
    confidence_interval: null,
    reason_codes: status === "pass" ? [] : [reason],
  };
}

function intervalGate(
  gate: string,
  metric: Metric,
  threshold: number,
  direction: "minimum" | "maximum" | "strict_positive",
): Gate {
  const interval = metric.confidence_interval;
  let status: Gate["status"] = "inconclusive";
  if (metric.value !== null && interval) {
    if (direction === "minimum") {
      status = interval.lower >= threshold
        ? "pass"
        : interval.upper < threshold
          ? "fail"
          : "inconclusive";
    } else if (direction === "maximum") {
      status = interval.upper <= threshold
        ? "pass"
        : interval.lower > threshold
          ? "fail"
          : "inconclusive";
    } else {
      status = interval.lower > 0
        ? "pass"
        : interval.upper < 0
          ? "fail"
          : "inconclusive";
    }
  }
  return {
    gate,
    status,
    observed: metric.value,
    threshold,
    confidence_interval: interval,
    reason_codes:
      status === "pass"
        ? []
        : [
            status === "inconclusive"
              ? "threshold_not_resolved_by_uncertainty"
              : `${gate}_failed`,
          ],
  };
}

function blocked(
  experiment: InternalPaperReplayExperimentInput,
  reasons: string[],
  attribution: ReturnType<typeof evaluateInternalPaperReplayRegimeAttributedScorecard> | null = null,
) {
  return terminal({
    result_version: INTERNAL_PAPER_REGIME_SHADOW_POLICY_RESULT_VERSION,
    policy_version: INTERNAL_PAPER_REGIME_SHADOW_POLICY_VERSION,
    status: "blocked",
    scientific_disposition: "replay_shadow_policy_not_strategy_accepted",
    reason_codes: uniqueSorted(reasons),
    experiment_id:
      typeof experiment.manifest.experiment_id === "string"
        ? experiment.manifest.experiment_id
        : null,
    experiment_manifest_digest: SHA256_PATTERN.test(experiment.manifest.manifest_digest)
      ? experiment.manifest.manifest_digest
      : null,
    regime_attribution_result_digest: attribution?.result_digest ?? null,
    context_dataset_digest: attribution?.context_dataset_digest ?? null,
    context_replay_evidence_digest: attribution?.context_replay_evidence_digest ?? null,
    decisions: [],
    enabled_regime_count: 0,
    disabled_regime_count: 0,
    insufficient_regime_count: 0,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}

function partitionEvaluation({
  partition,
  rows,
  charter,
  seed,
}: {
  partition: (typeof EVALUATED_PARTITIONS)[number];
  rows: DecisionRow[];
  charter: RecommendationEvaluationCharter;
  seed: string;
}): InternalPaperRegimeShadowPartitionEvaluation {
  const selected = rows.filter((row) => row.candidate_selected);
  const complete = selected.filter((row) => finite(row.candidate_r_multiple));
  const precision = precisionMetric(
    complete.map((row) => ({
      trading_date: row.trading_date,
      value: row.candidate_r_multiple! > 0 ? 1 : 0,
    })),
  );
  const expectancy = clusteredMetric(
    complete.map((row) => ({
      trading_date: row.trading_date,
      value: row.candidate_r_multiple!,
    })),
    `${seed}:expectancy`,
  );
  const calibrationRows = complete.flatMap((row) =>
    row.predicted_probability === null
      ? []
      : [{
          trading_date: row.trading_date,
          value: Math.abs(
            row.predicted_probability - (row.candidate_r_multiple! > 0 ? 1 : 0),
          ),
        }],
  );
  const calibration = clusteredMetric(calibrationRows, `${seed}:calibration`);
  const pairedDelta = clusteredMetric(
    rows.map((row) => ({
      trading_date: row.trading_date,
      value: row.candidate_net_pnl - row.baseline_net_pnl,
    })),
    `${seed}:paired-net-pnl`,
  );
  const providerCosts = rows.map((row) => row.provider_cost_credits);
  const reliabilityValues = selected.map((row) => row.source_reliable);
  const requiredFeasibilityMissing = FEASIBILITY_KEYS.filter(
    (key) =>
      charter.charter.feasibility_inputs[key] === "required" &&
      selected.some((row) => row.feasibility[key] !== true),
  );
  const outcomeCoverage = selected.length === 0
    ? null
    : round(complete.length / selected.length);
  const missingness = selected.length === 0
    ? null
    : round(1 - complete.length / selected.length);
  const providerCredits = providerCosts.length > 0 && providerCosts.every(finite)
    ? round(mean(providerCosts as number[])!)
    : null;
  const reliability = reliabilityValues.length > 0 &&
      reliabilityValues.every((value) => typeof value === "boolean")
    ? round(reliabilityValues.filter(Boolean).length / reliabilityValues.length)
    : null;
  const tickerShare = maximumShare(
    selected.map((row) => row.ticker.toUpperCase()),
  );
  const sectorShare = maximumShare(
    selected.map((row) => row.sector?.toLowerCase() ?? null),
  );
  const setupShare = maximumShare(
    selected.map((row) => row.setup.toLowerCase()),
  );
  const thresholds = charter.charter.thresholds;
  const limits = charter.charter.concentration_limits;
  const gates: Gate[] = [
    sampleGate(
      "minimum_complete_selected_decisions",
      complete.length,
      internalPaperReplayCharterScorecardPolicy.minimum_complete_selected_decisions,
      "minimum_complete_selected_decisions_not_met",
    ),
    sampleGate(
      "minimum_effective_trading_days",
      new Set(complete.map((row) => row.trading_date)).size,
      internalPaperReplayCharterScorecardPolicy.minimum_effective_trading_days,
      "minimum_effective_trading_days_not_met",
    ),
    sampleGate(
      "minimum_effective_tickers",
      new Set(complete.map((row) => row.ticker)).size,
      internalPaperReplayCharterScorecardPolicy.minimum_effective_tickers,
      "minimum_effective_tickers_not_met",
    ),
    intervalGate("minimum_precision_at_k", precision, thresholds.minimum_precision_at_k, "minimum"),
    intervalGate("minimum_expectancy_r", expectancy, thresholds.minimum_expectancy_r, "minimum"),
    intervalGate("maximum_calibration_error", calibration, thresholds.maximum_calibration_error, "maximum"),
    intervalGate("candidate_paired_net_pnl_improvement", pairedDelta, 0, "strict_positive"),
    exactGate("minimum_outcome_coverage", outcomeCoverage, thresholds.minimum_outcome_coverage, (observed, threshold) => observed >= threshold, "minimum_outcome_coverage_not_met"),
    exactGate("maximum_missingness", missingness, thresholds.maximum_missingness, (observed, threshold) => observed <= threshold, "maximum_missingness_exceeded"),
    exactGate("maximum_provider_credits_per_decision", providerCredits, thresholds.maximum_provider_credits_per_decision, (observed, threshold) => observed <= threshold, "maximum_provider_credits_per_decision_exceeded"),
    exactGate("minimum_reliability", reliability, thresholds.minimum_reliability, (observed, threshold) => observed >= threshold, "minimum_reliability_not_met"),
    exactGate("maximum_single_ticker_share", tickerShare, limits.maximum_single_ticker_share, (observed, threshold) => observed <= threshold, "maximum_single_ticker_share_exceeded"),
    exactGate("maximum_single_sector_share", sectorShare, limits.maximum_single_sector_share, (observed, threshold) => observed <= threshold, "maximum_single_sector_share_exceeded"),
    exactGate("maximum_single_setup_share", setupShare, limits.maximum_single_setup_share, (observed, threshold) => observed <= threshold, "maximum_single_setup_share_exceeded"),
    exactGate("required_feasibility", selected.length === 0 ? null : requiredFeasibilityMissing.length, 0, (observed) => observed === 0, "required_feasibility_missing"),
  ];
  const sampleReady = gates.slice(0, 3).every((gate) => gate.status === "pass");
  const verdict = !sampleReady
    ? "inconclusive"
    : gates.some((gate) => gate.status === "fail")
      ? "fail"
      : gates.every((gate) => gate.status === "pass")
        ? "pass"
        : "inconclusive";
  return {
    partition,
    decision_count: rows.length,
    selected_count: selected.length,
    complete_selected_count: complete.length,
    effective_trading_day_count: new Set(complete.map((row) => row.trading_date)).size,
    effective_ticker_count: new Set(complete.map((row) => row.ticker)).size,
    precision,
    expectancy_r: expectancy,
    calibration_error: calibration,
    paired_net_pnl_delta: pairedDelta,
    outcome_coverage: outcomeCoverage,
    missingness,
    provider_credits_per_decision: providerCredits,
    reliability,
    maximum_single_ticker_share: tickerShare,
    maximum_single_sector_share: sectorShare,
    maximum_single_setup_share: setupShare,
    required_feasibility_missing: requiredFeasibilityMissing,
    gates,
    verdict,
    reason_codes: uniqueSorted(
      gates.flatMap((gate) => (gate.status === "pass" ? [] : gate.reason_codes)),
    ),
  };
}

function sessionByDate(sessions: readonly InternalPaperReplayCorpusSessionResult[]) {
  return new Map(sessions.map((session) => [session.trading_date, session]));
}

/**
 * Re-runs G.1 and the exact frozen paired corpora, then evaluates each derived
 * regime independently in held-out and walk-forward partitions. The result can
 * only simulate a replay-shadow enable/disable decision; it has no runtime,
 * ranking, publication, promotion, provider or broker authority.
 */
export function evaluateInternalPaperRegimeShadowPolicy({
  experiment,
  baseline,
  charter,
  evidence,
  contextReplay,
}: {
  experiment: InternalPaperReplayExperimentInput;
  baseline: RecommendationLearningBaselineFreeze;
  charter: RecommendationEvaluationCharter;
  evidence: InternalPaperReplayRegimeAttributionEvidence;
  contextReplay: MarketContextShadowReplayV1Input;
}): InternalPaperRegimeShadowPolicyResult {
  const attribution = evaluateInternalPaperReplayRegimeAttributedScorecard({
    experiment,
    baseline,
    charter,
    evidence,
    contextReplay,
  });
  if (
    attribution.status !== "completed" ||
    !verifyInternalPaperReplayRegimeAttributedScorecardDigest(attribution) ||
    !attribution.scorecard ||
    attribution.scorecard.status !== "completed"
  ) {
    return blocked(
      experiment,
      ["regime_attribution_not_completed", ...attribution.reason_codes],
      attribution,
    );
  }

  const baselineCorpus = runInternalPaperReplayCorpus(experiment.baseline);
  const candidateCorpus = runInternalPaperReplayCorpus(experiment.candidate);
  if (baselineCorpus.status !== "completed" || candidateCorpus.status !== "completed") {
    return blocked(experiment, ["paired_corpus_replay_not_completed"], attribution);
  }
  const baselineByDate = sessionByDate(baselineCorpus.sessions);
  const candidateByDate = sessionByDate(candidateCorpus.sessions);
  const bindingByFingerprint = new Map(
    attribution.bindings.map((binding) => [binding.scan_run_fingerprint, binding]),
  );
  const evidenceByFingerprint = new Map(
    evidence.decisions.map((row) => [row.scan_run_fingerprint, row]),
  );
  if (
    bindingByFingerprint.size !== experiment.manifest.sessions.length ||
    evidenceByFingerprint.size !== experiment.manifest.sessions.length
  ) {
    return blocked(experiment, ["shadow_policy_population_incomplete_or_extra"], attribution);
  }

  const rows: DecisionRow[] = [];
  for (const [index, sessionBinding] of experiment.manifest.sessions.entries()) {
    const baselineSession = experiment.baseline.sessions[index];
    const candidateSession = experiment.candidate.sessions[index];
    const baselineDecision = baselineSession?.decisions[0]?.decision;
    const candidateDecision = candidateSession?.decisions[0]?.decision;
    const baselineResult = baselineByDate.get(sessionBinding.trading_date);
    const candidateResult = candidateByDate.get(sessionBinding.trading_date);
    if (
      !baselineDecision ||
      !candidateDecision ||
      baselineSession?.decisions.length !== 1 ||
      candidateSession?.decisions.length !== 1 ||
      !baselineResult ||
      !candidateResult ||
      baselineDecision.scan_run_fingerprint !== candidateDecision.scan_run_fingerprint
    ) {
      return blocked(experiment, ["shadow_policy_decision_binding_mismatch"], attribution);
    }
    const fingerprint = baselineDecision.scan_run_fingerprint;
    const binding = bindingByFingerprint.get(fingerprint);
    const evidenceRow = evidenceByFingerprint.get(fingerprint);
    const candidate = candidateDecision.candidates[0];
    if (
      !binding ||
      !evidenceRow ||
      !candidate ||
      candidateDecision.candidates.length !== 1 ||
      evidenceRow.trading_date !== sessionBinding.trading_date ||
      binding.trading_date !== sessionBinding.trading_date ||
      binding.ticker !== candidate.ticker.toUpperCase() ||
      !binding.measurable ||
      typeof evidenceRow.setup !== "string" ||
      evidenceRow.setup.trim().length === 0
    ) {
      return blocked(experiment, ["shadow_policy_evidence_binding_mismatch"], attribution);
    }
    rows.push({
      fingerprint,
      trading_date: sessionBinding.trading_date,
      partition: sessionBinding.partition,
      ticker: candidate.ticker.toUpperCase(),
      sector: candidate.sector?.trim() || null,
      setup: evidenceRow.setup.trim(),
      regime: binding.classification,
      candidate_selected: candidateResult.executed_position_count === 1,
      candidate_r_multiple: candidateResult.r_multiple,
      candidate_net_pnl: candidateResult.realized_net_pnl,
      baseline_net_pnl: baselineResult.realized_net_pnl,
      predicted_probability: evidenceRow.candidate.predicted_probability,
      provider_cost_credits: evidenceRow.candidate.provider_cost_credits,
      source_reliable: evidenceRow.candidate.source_reliable,
      feasibility: evidenceRow.candidate.feasibility,
    });
  }

  const regimes = uniqueSorted(rows.map((row) => row.regime));
  const decisions = regimes.map((regime): InternalPaperRegimeShadowDecision => {
    const partitions = EVALUATED_PARTITIONS.map((partition) =>
      partitionEvaluation({
        partition,
        rows: rows.filter(
          (row) => row.regime === regime && row.partition === partition,
        ),
        charter,
        seed: `${evidence.bootstrap_seed}:${regime}:${partition}`,
      }),
    );
    const globalVerdict = attribution.scorecard!.verdict;
    const action = globalVerdict === "fail" ||
        partitions.some((partition) => partition.verdict === "fail")
      ? "shadow_disabled"
      : globalVerdict === "pass" &&
          partitions.every((partition) => partition.verdict === "pass")
        ? "shadow_enabled"
        : "insufficient_evidence";
    return {
      regime,
      action,
      partitions,
      reason_codes: uniqueSorted([
        ...(globalVerdict === "pass" ? [] : [`global_scorecard_${globalVerdict}`]),
        ...partitions.flatMap((partition) => partition.reason_codes),
      ]),
    };
  });

  return terminal({
    result_version: INTERNAL_PAPER_REGIME_SHADOW_POLICY_RESULT_VERSION,
    policy_version: INTERNAL_PAPER_REGIME_SHADOW_POLICY_VERSION,
    status: "completed",
    scientific_disposition: "replay_shadow_policy_not_strategy_accepted",
    reason_codes: uniqueSorted([
      ...(attribution.context_source_kind === "synthetic_repository_fixture"
        ? ["synthetic_context_source_fixture_only"]
        : []),
      ...(decisions.some((decision) => decision.action === "insufficient_evidence")
        ? ["one_or_more_regimes_insufficient"]
        : []),
      ...(decisions.some((decision) => decision.action === "shadow_disabled")
        ? ["one_or_more_regimes_disabled"]
        : []),
    ]),
    experiment_id: attribution.experiment_id,
    experiment_manifest_digest: experiment.manifest.manifest_digest,
    regime_attribution_result_digest: attribution.result_digest,
    context_dataset_digest: attribution.context_dataset_digest,
    context_replay_evidence_digest: attribution.context_replay_evidence_digest,
    decisions,
    enabled_regime_count: decisions.filter((decision) => decision.action === "shadow_enabled").length,
    disabled_regime_count: decisions.filter((decision) => decision.action === "shadow_disabled").length,
    insufficient_regime_count: decisions.filter((decision) => decision.action === "insufficient_evidence").length,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
