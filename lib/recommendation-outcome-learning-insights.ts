import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
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
