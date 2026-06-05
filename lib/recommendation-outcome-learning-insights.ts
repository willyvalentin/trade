import {
  computeRecommendationOutcome,
  type RecommendationOutcome,
  type RecommendationOutcomeCandle,
} from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export type RecommendationOutcomeLearningTier =
  | "strong"
  | "valid"
  | "experimental"
  | "unknown";

export type RecommendationOutcomeLearningInsightType =
  | "entry_too_aggressive"
  | "poor_follow_through"
  | "stop_risk_high"
  | "target_too_far"
  | "sample_size"
  | "data_quality"
  | "unknown";

export type EntryPlanDistanceIssue =
  | "none"
  | "too_aggressive"
  | "too_easy"
  | "too_far"
  | "too_tight"
  | "too_wide"
  | "hit"
  | "unknown";

export type EntryPlanExecutionQualityLabel =
  | "clean_trigger"
  | "missed_but_favorable"
  | "missed_and_unfavorable"
  | "triggered_no_followthrough"
  | "target_hit"
  | "stop_hit"
  | "data_incomplete";

export type CounterfactualEntryVariantLabel =
  | "original_entry"
  | "softer_entry_25pct_to_current"
  | "softer_entry_50pct_to_current"
  | "first_candle_break"
  | "first_candle_close_entry"
  | "pullback_entry_near_vwap"
  | "marketable_entry_at_first_available_candle";

export type CounterfactualEntryVariantResult = {
  variant: CounterfactualEntryVariantLabel;
  entry: number | null;
  valid: boolean;
  invalid_reason: string | null;
  risk_per_share: number | null;
  risk_width_ratio_vs_original: number | null;
  risk_warning: string | null;
  entry_triggered: boolean | null;
  entry_triggered_at: string | null;
  target_hit: boolean | null;
  stop_hit: boolean | null;
  neither_hit: boolean | null;
  best_r: number | null;
  worst_r: number | null;
  max_favorable_excursion: number | null;
  max_adverse_excursion: number | null;
  time_to_entry_minutes: number | null;
};

export type CounterfactualEntryRecommendationSummary = {
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  ticker: string | null;
  source_horizon: string | null;
  candle_count: number;
  variants: CounterfactualEntryVariantResult[];
  best_counterfactual_entry_variant: CounterfactualEntryVariantLabel | null;
  would_have_triggered_with_variant: boolean | null;
  counterfactual_best_r: number | null;
  counterfactual_worst_r: number | null;
};

export type CounterfactualEntryVariantAggregate = {
  variant: CounterfactualEntryVariantLabel;
  simulated_count: number;
  valid_count: number;
  trigger_count: number;
  trigger_rate: number | null;
  avg_best_r: number | null;
  avg_worst_r: number | null;
  risk_warning_count: number;
};

export type CounterfactualEntrySimulationSummary = {
  batch_fingerprint: string | null;
  recommendation_count: number;
  simulated_recommendation_count: number;
  skipped_missing_candles_count: number;
  counterfactual_variants_tested: number;
  original_entry_trigger_rate: number | null;
  best_variant_trigger_rate: number | null;
  original_avg_best_r: number | null;
  best_variant_avg_best_r: number | null;
  original_avg_worst_r: number | null;
  best_variant_avg_worst_r: number | null;
  best_entry_variant: CounterfactualEntryVariantLabel | null;
  variant_with_best_balance: CounterfactualEntryVariantLabel | null;
  variant_risk_warning_count: number;
  counterfactual_primary_reason: string | null;
  variant_summaries: CounterfactualEntryVariantAggregate[];
  recommendation_summaries: CounterfactualEntryRecommendationSummary[];
};

export type EntryPlanQualityItem = {
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  ticker: string | null;
  idea_moved_favorably: boolean | null;
  max_favorable_r: number | null;
  max_adverse_r: number | null;
  entry_triggered: boolean | null;
  entry_distance_issue: EntryPlanDistanceIssue;
  target_distance_issue: EntryPlanDistanceIssue;
  stop_distance_issue: EntryPlanDistanceIssue;
  execution_quality_label: EntryPlanExecutionQualityLabel;
  entry_quality_reason: string;
  evaluated_outcome_count: number;
  horizons: string[];
  best_counterfactual_entry_variant: CounterfactualEntryVariantLabel | null;
  would_have_triggered_with_variant: boolean | null;
  counterfactual_best_r: number | null;
  counterfactual_worst_r: number | null;
};

export type EntryPlanQualitySummary = {
  batch_fingerprint: string | null;
  recommendation_count: number;
  evaluated_recommendation_count: number;
  missed_but_favorable_count: number;
  missed_but_favorable_rate: number | null;
  triggered_no_followthrough_count: number;
  triggered_no_followthrough_rate: number | null;
  target_too_far_count: number;
  target_too_far_rate: number | null;
  entry_too_aggressive_count: number;
  entry_too_aggressive_rate: number | null;
  avg_mfe_without_entry: number | null;
  avg_mae_without_entry: number | null;
  target_too_far_signal: boolean;
  entry_quality_label: string;
  suggested_tuning: string[];
  counterfactual_entry_simulation: CounterfactualEntrySimulationSummary;
  items: EntryPlanQualityItem[];
  diagnostics: {
    entry_plan_quality_batch_fingerprint: string | null;
    missed_but_favorable_rate: number | null;
    entry_too_aggressive_rate: number | null;
    target_too_far_rate: number | null;
    avg_mfe_without_entry: number | null;
  };
};

export type RecommendationOutcomeLearningMetricBreakdown = {
  key: string;
  recommendation_count: number;
  evaluated_outcome_count: number;
  entry_triggered_count: number;
  entry_triggered_rate: number | null;
  target_hit_count: number;
  target_hit_rate: number | null;
  stop_hit_count: number;
  stop_hit_rate: number | null;
  neither_hit_count: number;
  neither_hit_rate: number | null;
  entry_not_triggered_count: number;
  entry_not_triggered_rate: number | null;
  avg_best_r: number | null;
  avg_worst_r: number | null;
  max_best_r: number | null;
  max_drawdown_r: number | null;
};

export type RecommendationOutcomeLearningInsight = {
  insight_type: RecommendationOutcomeLearningInsightType;
  severity: "info" | "warning" | "positive";
  title: string;
  reason: string;
  suggested_next_review_item: string;
};

export type RecommendationOutcomeLearningInsightsSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "recommendation_outcome_learning_insights";
  generated_at: string;
  batch_fingerprint: string | null;
  total_recommendations: number;
  total_evaluated_outcomes: number;
  incomplete_outcome_count: number;
  data_quality_gap_count: number;
  entry_triggered_count: number;
  entry_triggered_rate: number | null;
  target_hit_count: number;
  target_hit_rate: number | null;
  stop_hit_count: number;
  stop_hit_rate: number | null;
  neither_hit_count: number;
  neither_hit_rate: number | null;
  entry_not_triggered_count: number;
  entry_not_triggered_rate: number | null;
  avg_best_r: number | null;
  avg_worst_r: number | null;
  max_best_r: number | null;
  max_drawdown_r: number | null;
  horizon_breakdown: RecommendationOutcomeLearningMetricBreakdown[];
  tier_breakdown: RecommendationOutcomeLearningMetricBreakdown[];
  entry_plan_quality: EntryPlanQualitySummary;
  primary_insight: RecommendationOutcomeLearningInsight | null;
  suggested_next_review_item: string | null;
  diagnostics: {
    learning_insight_batch_fingerprint: string | null;
    learning_insight_outcome_count: number;
    learning_insight_entry_triggered_rate: number | null;
    learning_insight_primary_reason: string | null;
  };
};

export type RecommendationOutcomeLearningInsightsInput = {
  batch_fingerprint?: string | null;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  now?: Date | string | null;
};

const evaluatedStatuses = new Set([
  "entry_not_triggered",
  "entry_triggered",
  "target_hit",
  "stop_hit",
  "target_before_stop",
  "stop_before_target",
  "neither_hit",
  "expired",
]);

const horizonOrder = ["15m", "30m", "60m", "eod", "next_open", "unknown"];
const tierOrder: RecommendationOutcomeLearningTier[] = [
  "strong",
  "valid",
  "experimental",
  "unknown",
];

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeTier(value: unknown): RecommendationOutcomeLearningTier | null {
  const tier = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (tier === "strong" || tier === "valid" || tier === "experimental") {
    return tier;
  }

  return null;
}

function tierFromSnapshot(snapshot: RecommendationSnapshot | null | undefined) {
  if (!snapshot) return "unknown";

  const payload = objectValue(snapshot.payload_json) ?? {};
  const target = objectValue(payload.day_trade_window_recommendation_target);
  const recommendation = objectValue(payload.recommendation);
  const contract = objectValue(payload.openai_reality_contract);
  const metadata = objectValue(payload.metadata);

  return (
    normalizeTier(
      target?.tier ??
        target?.recommendation_tier ??
        recommendation?.tier ??
        recommendation?.recommendation_tier ??
        contract?.tier ??
        contract?.recommendation_tier ??
        metadata?.tier ??
        metadata?.recommendation_tier ??
        snapshot.rating ??
        snapshot.label,
    ) ?? "unknown"
  );
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function average(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length === 0
    ? null
    : finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function maximum(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length === 0 ? null : Math.max(...finiteValues);
}

function minimum(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length === 0 ? null : Math.min(...finiteValues);
}

function percent(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function isEvaluatedOutcome(outcome: RecommendationOutcome) {
  return (
    evaluatedStatuses.has(outcome.status) &&
    outcome.data_completeness === "complete"
  );
}

function isEntryTriggered(outcome: RecommendationOutcome) {
  return (
    outcome.entry_triggered === true ||
    outcome.status === "entry_triggered" ||
    outcome.status === "target_hit" ||
    outcome.status === "stop_hit" ||
    outcome.status === "target_before_stop" ||
    outcome.status === "stop_before_target" ||
    outcome.status === "neither_hit" ||
    outcome.status === "expired"
  );
}

function isTargetHit(outcome: RecommendationOutcome) {
  return (
    outcome.target_hit === true ||
    outcome.status === "target_hit" ||
    outcome.status === "target_before_stop"
  );
}

function isStopHit(outcome: RecommendationOutcome) {
  return (
    outcome.stop_hit === true ||
    outcome.status === "stop_hit" ||
    outcome.status === "stop_before_target"
  );
}

function isNeitherHit(outcome: RecommendationOutcome) {
  return outcome.status === "neither_hit" || outcome.status === "expired";
}

function riskPerShare(entry: number | null, stop: number | null, side: string) {
  if (entry === null || stop === null) return null;
  const risk = side === "short" ? stop - entry : entry - stop;
  return risk > 0 ? risk : null;
}

function candleNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function candleTimestamp(value: unknown) {
  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value > 10_000_000_000 ? value : value * 1000);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }

  return null;
}

function candlesFromOutcomePayload(
  outcome: RecommendationOutcome,
): RecommendationOutcomeCandle[] {
  const raw =
    Array.isArray(outcome.payload_json.counterfactual_candles)
      ? outcome.payload_json.counterfactual_candles
      : Array.isArray(outcome.payload_json.evaluation_candles)
        ? outcome.payload_json.evaluation_candles
        : [];

  return raw
    .map((item): RecommendationOutcomeCandle | null => {
      const record = objectValue(item);
      if (!record) return null;
      const timestamp = candleTimestamp(record.timestamp);
      const high = candleNumber(record.high);
      const low = candleNumber(record.low);
      const close = candleNumber(record.close);

      if (!timestamp || high === null || low === null || close === null) {
        return null;
      }

      return {
        timestamp,
        open: candleNumber(record.open),
        high,
        low,
        close,
        volume: candleNumber(record.volume),
      };
    })
    .filter((candle): candle is RecommendationOutcomeCandle => candle !== null);
}

function outcomeWithMostCounterfactualCandles(outcomes: RecommendationOutcome[]) {
  return outcomes
    .filter(isEvaluatedOutcome)
    .map((outcome) => ({
      outcome,
      candles: candlesFromOutcomePayload(outcome),
    }))
    .sort((first, second) => {
      if (second.candles.length !== first.candles.length) {
        return second.candles.length - first.candles.length;
      }
      return horizonOrder.indexOf(second.outcome.horizon) -
        horizonOrder.indexOf(first.outcome.horizon);
    })[0] ?? null;
}

function weightedAverage(
  candles: RecommendationOutcomeCandle[],
  selector: (candle: RecommendationOutcomeCandle) => number | null | undefined,
) {
  let volumeTotal = 0;
  let weightedTotal = 0;

  for (const candle of candles) {
    const value = selector(candle);
    const volume = candle.volume;

    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      typeof volume === "number" &&
      Number.isFinite(volume) &&
      volume > 0
    ) {
      weightedTotal += value * volume;
      volumeTotal += volume;
    }
  }

  return volumeTotal > 0 ? weightedTotal / volumeTotal : null;
}

function variantEntries(input: {
  snapshot: RecommendationSnapshot;
  candles: RecommendationOutcomeCandle[];
}) {
  const first = input.candles[0] ?? null;
  const side = input.snapshot.side;
  const originalEntry = finiteNumber(input.snapshot.entry);
  const firstOpen = candleNumber(first?.open ?? first?.close);
  const firstClose = candleNumber(first?.close);
  const firstBreak =
    side === "short"
      ? candleNumber(first?.low)
      : candleNumber(first?.high);
  const vwap = weightedAverage(input.candles, (candle) => {
    const high = candleNumber(candle.high);
    const low = candleNumber(candle.low);
    const close = candleNumber(candle.close);
    return high === null || low === null || close === null
      ? null
      : (high + low + close) / 3;
  });

  return new Map<CounterfactualEntryVariantLabel, number | null>([
    ["original_entry", originalEntry],
    [
      "softer_entry_25pct_to_current",
      originalEntry !== null && firstOpen !== null
        ? originalEntry + (firstOpen - originalEntry) * 0.25
        : null,
    ],
    [
      "softer_entry_50pct_to_current",
      originalEntry !== null && firstOpen !== null
        ? originalEntry + (firstOpen - originalEntry) * 0.5
        : null,
    ],
    ["first_candle_break", firstBreak],
    ["first_candle_close_entry", firstClose],
    ["pullback_entry_near_vwap", vwap],
    ["marketable_entry_at_first_available_candle", firstOpen],
  ]);
}

function simulateCounterfactualVariant(input: {
  snapshot: RecommendationSnapshot;
  sourceOutcome: RecommendationOutcome;
  candles: RecommendationOutcomeCandle[];
  variant: CounterfactualEntryVariantLabel;
  entry: number | null;
}): CounterfactualEntryVariantResult {
  const side = input.snapshot.side;
  const originalRisk = riskPerShare(
    finiteNumber(input.snapshot.entry),
    finiteNumber(input.snapshot.stop),
    side,
  );
  const variantRisk = riskPerShare(
    input.entry,
    finiteNumber(input.snapshot.stop),
    side,
  );
  const riskWidthRatio =
    originalRisk !== null && variantRisk !== null && originalRisk > 0
      ? variantRisk / originalRisk
      : null;
  const riskWarning =
    riskWidthRatio === null
      ? null
      : riskWidthRatio > 1.5
        ? "risk_too_wide_vs_original"
        : riskWidthRatio < 0.5
          ? "risk_too_tight_vs_original"
          : null;

  if (input.entry === null || variantRisk === null) {
    return {
      variant: input.variant,
      entry: input.entry,
      valid: false,
      invalid_reason: "risk_per_share_invalid",
      risk_per_share: variantRisk,
      risk_width_ratio_vs_original: riskWidthRatio,
      risk_warning: riskWarning,
      entry_triggered: null,
      entry_triggered_at: null,
      target_hit: null,
      stop_hit: null,
      neither_hit: null,
      best_r: null,
      worst_r: null,
      max_favorable_excursion: null,
      max_adverse_excursion: null,
      time_to_entry_minutes: null,
    };
  }

  const result = computeRecommendationOutcome({
    snapshot: input.snapshot,
    horizon: input.sourceOutcome.horizon,
    entry: input.entry,
    stop: input.snapshot.stop,
    target: input.snapshot.target,
    evaluated_at: input.sourceOutcome.evaluated_at,
    source: "intraday_candles",
    provider: input.sourceOutcome.provider,
    data_completeness: "complete",
    candles: input.candles,
  }).outcome;

  return {
    variant: input.variant,
    entry: input.entry,
    valid: true,
    invalid_reason: null,
    risk_per_share: variantRisk,
    risk_width_ratio_vs_original: riskWidthRatio,
    risk_warning: riskWarning,
    entry_triggered: result.entry_triggered,
    entry_triggered_at: result.entry_triggered_at,
    target_hit: result.target_hit,
    stop_hit: result.stop_hit,
    neither_hit: result.status === "neither_hit" || result.status === "expired",
    best_r: result.best_r,
    worst_r: result.worst_r,
    max_favorable_excursion: result.max_favorable_excursion,
    max_adverse_excursion: result.max_adverse_excursion,
    time_to_entry_minutes: result.time_to_entry_minutes,
  };
}

function chooseBestCounterfactualVariant(
  variants: CounterfactualEntryVariantResult[],
) {
  return variants
    .filter((variant) => variant.valid && variant.variant !== "original_entry")
    .sort((first, second) => {
      const firstTriggered = first.entry_triggered === true ? 1 : 0;
      const secondTriggered = second.entry_triggered === true ? 1 : 0;
      if (secondTriggered !== firstTriggered) return secondTriggered - firstTriggered;

      const firstScore =
        (first.best_r ?? Number.NEGATIVE_INFINITY) +
        (first.worst_r ?? 0) * 0.25 -
        (first.risk_warning ? 0.25 : 0);
      const secondScore =
        (second.best_r ?? Number.NEGATIVE_INFINITY) +
        (second.worst_r ?? 0) * 0.25 -
        (second.risk_warning ? 0.25 : 0);

      return secondScore - firstScore;
    })[0] ?? null;
}

function buildCounterfactualRecommendationSummary(input: {
  snapshot: RecommendationSnapshot;
  outcomes: RecommendationOutcome[];
}): CounterfactualEntryRecommendationSummary {
  const source = outcomeWithMostCounterfactualCandles(input.outcomes);

  if (!source || source.candles.length === 0) {
    return {
      snapshot_fingerprint: input.snapshot.snapshot_fingerprint,
      recommendation_id: input.snapshot.recommendation_id,
      ticker: input.snapshot.ticker,
      source_horizon: null,
      candle_count: 0,
      variants: [],
      best_counterfactual_entry_variant: null,
      would_have_triggered_with_variant: null,
      counterfactual_best_r: null,
      counterfactual_worst_r: null,
    };
  }

  const variants = Array.from(
    variantEntries({ snapshot: input.snapshot, candles: source.candles }),
  ).map(([variant, entry]) =>
    simulateCounterfactualVariant({
      snapshot: input.snapshot,
      sourceOutcome: source.outcome,
      candles: source.candles,
      variant,
      entry,
    }),
  );
  const bestVariant = chooseBestCounterfactualVariant(variants);

  return {
    snapshot_fingerprint: input.snapshot.snapshot_fingerprint,
    recommendation_id: input.snapshot.recommendation_id,
    ticker: input.snapshot.ticker,
    source_horizon: source.outcome.horizon,
    candle_count: source.candles.length,
    variants,
    best_counterfactual_entry_variant: bestVariant?.variant ?? null,
    would_have_triggered_with_variant: bestVariant?.entry_triggered ?? null,
    counterfactual_best_r: bestVariant?.best_r ?? null,
    counterfactual_worst_r: bestVariant?.worst_r ?? null,
  };
}

function buildCounterfactualEntrySimulationSummary(input: {
  batch_fingerprint: string | null;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}): CounterfactualEntrySimulationSummary {
  const recommendationSummaries = input.snapshots.map((snapshot) =>
    buildCounterfactualRecommendationSummary({
      snapshot,
      outcomes: outcomesForSnapshot(snapshot, input.outcomes),
    }),
  );
  const simulatedSummaries = recommendationSummaries.filter(
    (summary) => summary.variants.length > 0,
  );
  const variantLabels: CounterfactualEntryVariantLabel[] = [
    "original_entry",
    "softer_entry_25pct_to_current",
    "softer_entry_50pct_to_current",
    "first_candle_break",
    "first_candle_close_entry",
    "pullback_entry_near_vwap",
    "marketable_entry_at_first_available_candle",
  ];
  const variantSummaries = variantLabels.map((variant) => {
    const results = recommendationSummaries
      .flatMap((summary) => summary.variants)
      .filter((result) => result.variant === variant);
    const validResults = results.filter((result) => result.valid);
    const triggerCount = validResults.filter(
      (result) => result.entry_triggered === true,
    ).length;

    return {
      variant,
      simulated_count: results.length,
      valid_count: validResults.length,
      trigger_count: triggerCount,
      trigger_rate: percent(triggerCount, validResults.length),
      avg_best_r: average(validResults.map((result) => result.best_r)),
      avg_worst_r: average(validResults.map((result) => result.worst_r)),
      risk_warning_count: validResults.filter((result) => result.risk_warning)
        .length,
    };
  });
  const original = variantSummaries.find(
    (summary) => summary.variant === "original_entry",
  );
  const bestVariant =
    variantSummaries
      .filter(
        (summary) =>
          summary.variant !== "original_entry" && summary.valid_count > 0,
      )
      .sort((first, second) => {
        const firstBalance =
          (first.trigger_rate ?? Number.NEGATIVE_INFINITY) +
          (first.avg_best_r ?? 0) * 10 +
          (first.avg_worst_r ?? 0) * 5 -
          first.risk_warning_count * 3;
        const secondBalance =
          (second.trigger_rate ?? Number.NEGATIVE_INFINITY) +
          (second.avg_best_r ?? 0) * 10 +
          (second.avg_worst_r ?? 0) * 5 -
          second.risk_warning_count * 3;

        return secondBalance - firstBalance;
      })[0] ?? null;
  const originalTriggerRate = original?.trigger_rate ?? null;
  const bestTriggerRate = bestVariant?.trigger_rate ?? null;
  const triggerImproved =
    originalTriggerRate !== null &&
    bestTriggerRate !== null &&
    bestTriggerRate > originalTriggerRate;
  const bestWorstRAcceptable = (bestVariant?.avg_worst_r ?? -1) > -0.5;
  const counterfactualPrimaryReason =
    simulatedSummaries.length === 0
      ? "Counterfactual entry simulation is unavailable because evaluated candle data was not retained on outcome rows."
      : triggerImproved && bestWorstRAcceptable
        ? `A softer entry variant improved trigger rate from ${Math.round(originalTriggerRate ?? 0)}% to ${Math.round(bestTriggerRate ?? 0)}% while keeping average worst R acceptable.`
        : triggerImproved
          ? "A counterfactual entry variant improved trigger rate, but adverse movement increased enough to require risk review."
          : "Do not loosen entry yet: counterfactual variants did not clearly improve trigger participation with acceptable risk.";

  return {
    batch_fingerprint: input.batch_fingerprint,
    recommendation_count: input.snapshots.length,
    simulated_recommendation_count: simulatedSummaries.length,
    skipped_missing_candles_count:
      input.snapshots.length - simulatedSummaries.length,
    counterfactual_variants_tested: variantSummaries.filter(
      (summary) => summary.valid_count > 0,
    ).length,
    original_entry_trigger_rate: originalTriggerRate,
    best_variant_trigger_rate: bestTriggerRate,
    original_avg_best_r: original?.avg_best_r ?? null,
    best_variant_avg_best_r: bestVariant?.avg_best_r ?? null,
    original_avg_worst_r: original?.avg_worst_r ?? null,
    best_variant_avg_worst_r: bestVariant?.avg_worst_r ?? null,
    best_entry_variant: bestVariant?.variant ?? null,
    variant_with_best_balance: bestVariant?.variant ?? null,
    variant_risk_warning_count: bestVariant?.risk_warning_count ?? 0,
    counterfactual_primary_reason: counterfactualPrimaryReason,
    variant_summaries: variantSummaries,
    recommendation_summaries: recommendationSummaries,
  };
}

function outcomesForSnapshot(
  snapshot: RecommendationSnapshot,
  outcomes: RecommendationOutcome[],
) {
  return outcomes.filter(
    (outcome) =>
      outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint ||
      (snapshot.recommendation_id !== null &&
        outcome.recommendation_id === snapshot.recommendation_id),
  );
}

export function buildEntryPlanQualityForSnapshot(
  snapshot: RecommendationSnapshot | null,
  outcomes: RecommendationOutcome[],
): EntryPlanQualityItem {
  const evaluated = outcomes.filter(isEvaluatedOutcome);
  const maxFavorableR = maximum(evaluated.map((outcome) => outcome.best_r));
  const maxAdverseR = minimum(evaluated.map((outcome) => outcome.worst_r));
  const entryTriggered =
    evaluated.length === 0 ? null : evaluated.some(isEntryTriggered);
  const targetHit = evaluated.some(isTargetHit);
  const stopHit = evaluated.some(isStopHit);
  const neitherHit = evaluated.some(isNeitherHit);
  const ideaMovedFavorably =
    maxFavorableR === null ? null : maxFavorableR > 0;
  const missedButFavorable =
    entryTriggered === false && ideaMovedFavorably === true;
  const missedAndUnfavorable =
    entryTriggered === false && ideaMovedFavorably === false;
  const triggeredNoFollowthrough =
    entryTriggered === true && !targetHit && !stopHit && neitherHit;
  const targetTooFar =
    !targetHit && (maxFavorableR ?? 0) > 0 && evaluated.length > 0;
  const stopRiskWasHigh = (maxAdverseR ?? 0) <= -0.8;
  const stopTooWide =
    entryTriggered === true &&
    !stopHit &&
    (maxAdverseR ?? 0) > -0.15 &&
    evaluated.length > 0;

  let executionQualityLabel: EntryPlanExecutionQualityLabel = "data_incomplete";
  if (targetHit) {
    executionQualityLabel = "target_hit";
  } else if (stopHit) {
    executionQualityLabel = "stop_hit";
  } else if (missedButFavorable) {
    executionQualityLabel = "missed_but_favorable";
  } else if (missedAndUnfavorable) {
    executionQualityLabel = "missed_and_unfavorable";
  } else if (triggeredNoFollowthrough) {
    executionQualityLabel = "triggered_no_followthrough";
  } else if (entryTriggered === true) {
    executionQualityLabel = "clean_trigger";
  }

  const entryDistanceIssue: EntryPlanDistanceIssue =
    evaluated.length === 0
      ? "unknown"
      : missedButFavorable
        ? "too_aggressive"
        : stopHit && (maxFavorableR ?? 0) <= 0.15
          ? "too_easy"
          : "none";
  const targetDistanceIssue: EntryPlanDistanceIssue =
    evaluated.length === 0 ? "unknown" : targetHit ? "hit" : targetTooFar ? "too_far" : "none";
  const stopDistanceIssue: EntryPlanDistanceIssue =
    evaluated.length === 0
      ? "unknown"
      : stopRiskWasHigh
        ? "too_tight"
        : stopTooWide
          ? "too_wide"
          : "none";

  const entryQualityReason =
    executionQualityLabel === "missed_but_favorable"
      ? "Idea moved favorably, but entry did not trigger."
      : executionQualityLabel === "missed_and_unfavorable"
        ? "Entry did not trigger and price did not move favorably."
        : executionQualityLabel === "triggered_no_followthrough"
          ? "Entry triggered, but neither target nor stop resolved inside evaluated horizons."
          : executionQualityLabel === "target_hit"
            ? "Entry plan participated and target was hit."
            : executionQualityLabel === "stop_hit"
              ? "Entry plan participated, but stop was hit."
              : executionQualityLabel === "clean_trigger"
                ? "Entry triggered without a terminal target/stop warning."
                : "Complete evaluated outcomes are not available for this recommendation.";
  const counterfactual =
    snapshot === null
      ? null
      : buildCounterfactualRecommendationSummary({ snapshot, outcomes });

  return {
    snapshot_fingerprint: snapshot?.snapshot_fingerprint ?? null,
    recommendation_id: snapshot?.recommendation_id ?? null,
    ticker: snapshot?.ticker ?? evaluated[0]?.ticker ?? null,
    idea_moved_favorably: ideaMovedFavorably,
    max_favorable_r: maxFavorableR,
    max_adverse_r: maxAdverseR,
    entry_triggered: entryTriggered,
    entry_distance_issue: entryDistanceIssue,
    target_distance_issue: targetDistanceIssue,
    stop_distance_issue: stopDistanceIssue,
    execution_quality_label: executionQualityLabel,
    entry_quality_reason: entryQualityReason,
    evaluated_outcome_count: evaluated.length,
    horizons: Array.from(new Set(evaluated.map((outcome) => outcome.horizon))).sort(),
    best_counterfactual_entry_variant:
      counterfactual?.best_counterfactual_entry_variant ?? null,
    would_have_triggered_with_variant:
      counterfactual?.would_have_triggered_with_variant ?? null,
    counterfactual_best_r: counterfactual?.counterfactual_best_r ?? null,
    counterfactual_worst_r: counterfactual?.counterfactual_worst_r ?? null,
  };
}

function buildEntryPlanQualitySummary(input: {
  batch_fingerprint: string | null;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}): EntryPlanQualitySummary {
  const counterfactualEntrySimulation = buildCounterfactualEntrySimulationSummary(
    input,
  );
  const counterfactualBySnapshot = new Map(
    counterfactualEntrySimulation.recommendation_summaries.map((summary) => [
      summary.snapshot_fingerprint,
      summary,
    ]),
  );
  const items = input.snapshots.map((snapshot) => {
    const item = buildEntryPlanQualityForSnapshot(
      snapshot,
      outcomesForSnapshot(snapshot, input.outcomes),
    );
    const counterfactual = counterfactualBySnapshot.get(
      snapshot.snapshot_fingerprint,
    );

    return {
      ...item,
      best_counterfactual_entry_variant:
        counterfactual?.best_counterfactual_entry_variant ?? null,
      would_have_triggered_with_variant:
        counterfactual?.would_have_triggered_with_variant ?? null,
      counterfactual_best_r: counterfactual?.counterfactual_best_r ?? null,
      counterfactual_worst_r: counterfactual?.counterfactual_worst_r ?? null,
    };
  });
  const evaluatedItems = items.filter((item) => item.evaluated_outcome_count > 0);
  const missedButFavorableItems = evaluatedItems.filter(
    (item) => item.execution_quality_label === "missed_but_favorable",
  );
  const triggeredNoFollowthroughCount = evaluatedItems.filter(
    (item) => item.execution_quality_label === "triggered_no_followthrough",
  ).length;
  const targetTooFarCount = evaluatedItems.filter(
    (item) => item.target_distance_issue === "too_far",
  ).length;
  const entryTooAggressiveCount = evaluatedItems.filter(
    (item) => item.entry_distance_issue === "too_aggressive",
  ).length;
  const missedButFavorableRate = percent(
    missedButFavorableItems.length,
    evaluatedItems.length,
  );
  const entryTooAggressiveRate = percent(
    entryTooAggressiveCount,
    evaluatedItems.length,
  );
  const targetTooFarRate = percent(targetTooFarCount, evaluatedItems.length);
  const targetTooFarSignal =
    targetTooFarCount > 0 && (targetTooFarRate ?? 0) >= 50;
  const suggestedTuning: string[] = [];

  if ((entryTooAggressiveRate ?? 0) >= 50) {
    suggestedTuning.push("Review entry trigger aggressiveness.");
    suggestedTuning.push("Consider pullback/marketable entry variant.");
    suggestedTuning.push("Keep scanner idea, tune execution.");
  }

  if ((average(missedButFavorableItems.map((item) => item.max_adverse_r)) ?? 0) <= -0.5) {
    suggestedTuning.push("Do not loosen entry if MAE is high.");
  }

  if (targetTooFarSignal) {
    suggestedTuning.push("Review whether first targets are too far for the evaluated window.");
  }

  const entryQualityLabel =
    evaluatedItems.length === 0
      ? "data_incomplete"
      : (entryTooAggressiveRate ?? 0) >= 50
        ? "entry_too_aggressive"
        : targetTooFarSignal
          ? "target_too_far"
          : triggeredNoFollowthroughCount > 0
            ? "triggered_no_followthrough"
            : "execution_plan_observed";

  return {
    batch_fingerprint: input.batch_fingerprint,
    recommendation_count: input.snapshots.length,
    evaluated_recommendation_count: evaluatedItems.length,
    missed_but_favorable_count: missedButFavorableItems.length,
    missed_but_favorable_rate: missedButFavorableRate,
    triggered_no_followthrough_count: triggeredNoFollowthroughCount,
    triggered_no_followthrough_rate: percent(
      triggeredNoFollowthroughCount,
      evaluatedItems.length,
    ),
    target_too_far_count: targetTooFarCount,
    target_too_far_rate: targetTooFarRate,
    entry_too_aggressive_count: entryTooAggressiveCount,
    entry_too_aggressive_rate: entryTooAggressiveRate,
    avg_mfe_without_entry: average(
      missedButFavorableItems.map((item) => item.max_favorable_r),
    ),
    avg_mae_without_entry: average(
      missedButFavorableItems.map((item) => item.max_adverse_r),
    ),
    target_too_far_signal: targetTooFarSignal,
    entry_quality_label: entryQualityLabel,
    suggested_tuning:
      suggestedTuning.length > 0
        ? Array.from(new Set(suggestedTuning))
        : ["Continue collecting evaluated outcomes before tuning execution rules."],
    counterfactual_entry_simulation: counterfactualEntrySimulation,
    items,
    diagnostics: {
      entry_plan_quality_batch_fingerprint: input.batch_fingerprint,
      missed_but_favorable_rate: missedButFavorableRate,
      entry_too_aggressive_rate: entryTooAggressiveRate,
      target_too_far_rate: targetTooFarRate,
      avg_mfe_without_entry: average(
        missedButFavorableItems.map((item) => item.max_favorable_r),
      ),
    },
  };
}

function buildBreakdown(
  key: string,
  outcomes: RecommendationOutcome[],
  recommendationCount: number,
): RecommendationOutcomeLearningMetricBreakdown {
  const evaluated = outcomes.filter(isEvaluatedOutcome);
  const entryTriggeredCount = evaluated.filter(isEntryTriggered).length;
  const targetHitCount = evaluated.filter(isTargetHit).length;
  const stopHitCount = evaluated.filter(isStopHit).length;
  const neitherHitCount = evaluated.filter(isNeitherHit).length;
  const entryNotTriggeredCount = evaluated.filter(
    (outcome) => outcome.status === "entry_not_triggered",
  ).length;

  return {
    key,
    recommendation_count: recommendationCount,
    evaluated_outcome_count: evaluated.length,
    entry_triggered_count: entryTriggeredCount,
    entry_triggered_rate: percent(entryTriggeredCount, evaluated.length),
    target_hit_count: targetHitCount,
    target_hit_rate: percent(targetHitCount, evaluated.length),
    stop_hit_count: stopHitCount,
    stop_hit_rate: percent(stopHitCount, evaluated.length),
    neither_hit_count: neitherHitCount,
    neither_hit_rate: percent(neitherHitCount, evaluated.length),
    entry_not_triggered_count: entryNotTriggeredCount,
    entry_not_triggered_rate: percent(entryNotTriggeredCount, evaluated.length),
    avg_best_r: average(evaluated.map((outcome) => outcome.best_r)),
    avg_worst_r: average(evaluated.map((outcome) => outcome.worst_r)),
    max_best_r: maximum(evaluated.map((outcome) => outcome.best_r)),
    max_drawdown_r: minimum(evaluated.map((outcome) => outcome.worst_r)),
  };
}

function uniqueSnapshots(snapshots: RecommendationSnapshot[]) {
  return Array.from(
    new Map(snapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]))
      .values(),
  );
}

function choosePrimaryInsight(
  summary: RecommendationOutcomeLearningMetricBreakdown,
  evaluatedOutcomes: RecommendationOutcome[],
): RecommendationOutcomeLearningInsight | null {
  if (summary.evaluated_outcome_count === 0) {
    return {
      insight_type: "sample_size",
      severity: "info",
      title: "Outcome learning is waiting for evaluated rows",
      reason: "No complete evaluated outcomes are available for the selected batch yet.",
      suggested_next_review_item: "Run outcome evaluation after the candle horizons have elapsed.",
    };
  }

  const positiveBestRWithoutEntryCount = evaluatedOutcomes.filter(
    (outcome) =>
      outcome.status === "entry_not_triggered" &&
      (finiteNumber(outcome.best_r) ?? 0) > 0,
  ).length;

  if (
    (summary.entry_not_triggered_rate ?? 0) >= 50 &&
    positiveBestRWithoutEntryCount >= 2
  ) {
    return {
      insight_type: "entry_too_aggressive",
      severity: "warning",
      title: "Many ideas moved favorably without triggering entry",
      reason:
        "Entry-not-triggered outcomes still showed positive favorable excursion, which points to entry placement or trigger aggressiveness rather than idea quality alone.",
      suggested_next_review_item: "Review entry trigger and entry range aggressiveness.",
    };
  }

  if (
    summary.entry_triggered_count > 0 &&
    (summary.neither_hit_rate ?? 0) >= 50 &&
    (summary.avg_best_r ?? 0) < 0.4
  ) {
    return {
      insight_type: "poor_follow_through",
      severity: "warning",
      title: "Triggered entries had limited follow-through",
      reason:
        "Many triggered entries reached neither target nor stop while average favorable excursion stayed low.",
      suggested_next_review_item: "Review catalyst strength and follow-through filters.",
    };
  }

  const highStopRiskCount = evaluatedOutcomes.filter(
    (outcome) => (finiteNumber(outcome.worst_r) ?? 0) <= -0.8,
  ).length;

  if (percent(highStopRiskCount, summary.evaluated_outcome_count) !== null &&
    (percent(highStopRiskCount, summary.evaluated_outcome_count) ?? 0) >= 35
  ) {
    return {
      insight_type: "stop_risk_high",
      severity: "warning",
      title: "Several setups approached full stop risk",
      reason:
        "Worst R frequently approached -1R, suggesting the stop placement or entry timing deserves review.",
      suggested_next_review_item: "Inspect stop distance and post-entry adverse movement.",
    };
  }

  if (
    summary.target_hit_count === 0 &&
    (summary.avg_best_r ?? 0) > 0.35 &&
    summary.evaluated_outcome_count >= 4
  ) {
    return {
      insight_type: "target_too_far",
      severity: "warning",
      title: "Price moved favorably but targets were not reached",
      reason:
        "Average favorable excursion was positive, but no evaluated horizon hit target.",
      suggested_next_review_item: "Review whether first targets are too far for the active window.",
    };
  }

  return {
    insight_type: "unknown",
    severity: "positive",
    title: "Outcome data is ready for review",
    reason:
      "The selected batch has complete evaluated outcomes with no dominant blocker pattern yet.",
    suggested_next_review_item: "Compare ticker-level outcomes and tier behavior before changing rules.",
  };
}

export function buildRecommendationOutcomeLearningInsightsSummary({
  batch_fingerprint,
  snapshots,
  outcomes,
  now,
}: RecommendationOutcomeLearningInsightsInput): RecommendationOutcomeLearningInsightsSummary {
  const generatedAt = (toDate(now ?? null) ?? new Date()).toISOString();
  const selectedSnapshots = uniqueSnapshots(snapshots);
  const snapshotByFingerprint = new Map(
    selectedSnapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]),
  );
  const evaluatedOutcomes = outcomes.filter(isEvaluatedOutcome);
  const entryPlanQuality = buildEntryPlanQualitySummary({
    batch_fingerprint: batch_fingerprint ?? null,
    snapshots: selectedSnapshots,
    outcomes,
  });
  const overall = buildBreakdown(
    "overall",
    outcomes,
    selectedSnapshots.length,
  );
  const tierCounts = new Map<RecommendationOutcomeLearningTier, number>();
  const tierBySnapshot = new Map<string, RecommendationOutcomeLearningTier>();

  for (const tier of tierOrder) {
    tierCounts.set(tier, 0);
  }

  for (const snapshot of selectedSnapshots) {
    const tier = tierFromSnapshot(snapshot);
    tierBySnapshot.set(snapshot.snapshot_fingerprint, tier);
    tierCounts.set(tier, (tierCounts.get(tier) ?? 0) + 1);
  }

  const horizonBreakdown = Array.from(
    new Set([...horizonOrder, ...outcomes.map((outcome) => outcome.horizon)]),
  )
    .filter(
      (horizon) =>
        outcomes.some((outcome) => outcome.horizon === horizon) ||
        horizonOrder.includes(horizon),
    )
    .sort((first, second) => {
      const firstIndex = horizonOrder.indexOf(first);
      const secondIndex = horizonOrder.indexOf(second);
      return (firstIndex === -1 ? 999 : firstIndex) -
        (secondIndex === -1 ? 999 : secondIndex);
    })
    .filter((horizon) => outcomes.some((outcome) => outcome.horizon === horizon))
    .map((horizon) =>
      buildBreakdown(
        horizon,
        outcomes.filter((outcome) => outcome.horizon === horizon),
        new Set(
          outcomes
            .filter((outcome) => outcome.horizon === horizon)
            .map((outcome) => outcome.snapshot_fingerprint)
            .filter(
              (fingerprint): fingerprint is string =>
                typeof fingerprint === "string" && fingerprint.length > 0,
            ),
        ).size,
      ),
    );

  const tierBreakdown = tierOrder.map((tier) =>
    buildBreakdown(
      tier,
      outcomes.filter((outcome) => {
        const snapshot =
          outcome.snapshot_fingerprint === null
            ? null
            : snapshotByFingerprint.get(outcome.snapshot_fingerprint) ?? null;
        return tierFromSnapshot(snapshot) === tier;
      }),
      tierCounts.get(tier) ?? 0,
    ),
  );
  const primaryInsight = choosePrimaryInsight(overall, evaluatedOutcomes);

  return {
    summary_id: `recommendation_outcome_learning:${batch_fingerprint ?? "none"}:${generatedAt}`,
    summary_version: "1.0",
    summary_kind: "recommendation_outcome_learning_insights",
    generated_at: generatedAt,
    batch_fingerprint: batch_fingerprint ?? null,
    total_recommendations: selectedSnapshots.length,
    total_evaluated_outcomes: overall.evaluated_outcome_count,
    incomplete_outcome_count: outcomes.filter(
      (outcome) => !isEvaluatedOutcome(outcome),
    ).length,
    data_quality_gap_count: outcomes.filter(
      (outcome) =>
        outcome.status === "incomplete" ||
        outcome.status === "invalid" ||
        outcome.data_completeness !== "complete",
    ).length,
    entry_triggered_count: overall.entry_triggered_count,
    entry_triggered_rate: overall.entry_triggered_rate,
    target_hit_count: overall.target_hit_count,
    target_hit_rate: overall.target_hit_rate,
    stop_hit_count: overall.stop_hit_count,
    stop_hit_rate: overall.stop_hit_rate,
    neither_hit_count: overall.neither_hit_count,
    neither_hit_rate: overall.neither_hit_rate,
    entry_not_triggered_count: overall.entry_not_triggered_count,
    entry_not_triggered_rate: overall.entry_not_triggered_rate,
    avg_best_r: overall.avg_best_r,
    avg_worst_r: overall.avg_worst_r,
    max_best_r: overall.max_best_r,
    max_drawdown_r: overall.max_drawdown_r,
    horizon_breakdown: horizonBreakdown,
    tier_breakdown: tierBreakdown,
    entry_plan_quality: entryPlanQuality,
    primary_insight: primaryInsight,
    suggested_next_review_item:
      primaryInsight?.suggested_next_review_item ?? null,
    diagnostics: {
      learning_insight_batch_fingerprint: batch_fingerprint ?? null,
      learning_insight_outcome_count: overall.evaluated_outcome_count,
      learning_insight_entry_triggered_rate: overall.entry_triggered_rate,
      learning_insight_primary_reason: primaryInsight?.reason ?? null,
    },
  };
}

export function recommendationOutcomeLearningInsightsSummaryJson(
  summary: RecommendationOutcomeLearningInsightsSummary,
) {
  return JSON.stringify(summary, null, 2);
}
