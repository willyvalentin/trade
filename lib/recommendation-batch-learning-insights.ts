import type {
  RecommendationBatchPerformanceItem,
  RecommendationBatchPerformanceStatusBreakdown,
  RecommendationBatchPerformanceSummary,
  RecommendationBatchPerformanceWindowBreakdown,
} from "@/lib/recommendation-batch-performance";

export type RecommendationBatchLearningInsightType =
  | "sample_size"
  | "outcome_completeness"
  | "window_performance"
  | "batch_type_performance"
  | "target_coverage"
  | "batch_composition"
  | "experimental_mix"
  | "taken_vs_ignored"
  | "risk_reward_behavior"
  | "unknown";

export type RecommendationBatchLearningInsightSeverity =
  | "positive"
  | "neutral"
  | "warning"
  | "critical"
  | "unknown";

export type RecommendationBatchLearningInsightConfidence =
  | "low"
  | "medium"
  | "high"
  | "unknown";

export type RecommendationBatchLearningStatus =
  | "not_enough_data"
  | "learning_in_progress"
  | "directionally_positive"
  | "mixed"
  | "needs_attention"
  | "unknown";

export type RecommendationBatchLearningEvidence = {
  label: string;
  value: number | string | null;
  unit: "count" | "percent" | "r_multiple" | "text" | "none";
};

export type RecommendationBatchLearningInsight = {
  insight_id: string;
  type: RecommendationBatchLearningInsightType;
  severity: RecommendationBatchLearningInsightSeverity;
  confidence: RecommendationBatchLearningInsightConfidence;
  title: string;
  message: string;
  evidence: RecommendationBatchLearningEvidence[];
  suggested_next_review_action: string | null;
};

export type RecommendationBatchLearningInsightsSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "recommendation_batch_learning_insights";
  generated_at: string;
  overall_batch_learning_status: RecommendationBatchLearningStatus;
  insight_count: number;
  top_insights: RecommendationBatchLearningInsight[];
  blockers: string[];
  warnings: string[];
  suggested_next_review_actions: string[];
  source_metrics: {
    total_batches: number;
    evaluated_batches: number;
    total_recommendations: number;
    evaluated_recommendations: number;
    incomplete_outcome_count: number;
    target_hit_rate: number | null;
    average_target_before_stop_rate: number | null;
    average_best_r: number | null;
    average_worst_r: number | null;
  };
  copy: {
    observational: string;
    sample_size: string;
    data_need: string;
  };
};

export type RecommendationBatchLearningInsightsInput = {
  batch_performance: RecommendationBatchPerformanceSummary;
  now?: Date | string | null;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function percent(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function average(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length === 0
    ? null
    : finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  return null;
}

function evidence(
  label: string,
  value: RecommendationBatchLearningEvidence["value"],
  unit: RecommendationBatchLearningEvidence["unit"],
): RecommendationBatchLearningEvidence {
  return { label, value, unit };
}

function insight(
  input: Omit<RecommendationBatchLearningInsight, "insight_id"> & {
    insight_id?: string;
  },
): RecommendationBatchLearningInsight {
  return {
    insight_id:
      input.insight_id ??
      `${input.type}:${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    ...input,
  };
}

function sortedByPriority(insights: RecommendationBatchLearningInsight[]) {
  const severityScore: Record<RecommendationBatchLearningInsightSeverity, number> = {
    critical: 5,
    warning: 4,
    positive: 3,
    neutral: 2,
    unknown: 1,
  };
  const confidenceScore: Record<RecommendationBatchLearningInsightConfidence, number> = {
    high: 3,
    medium: 2,
    low: 1,
    unknown: 0,
  };

  return insights.slice().sort((first, second) => {
    const severityDelta =
      severityScore[second.severity] - severityScore[first.severity];

    if (severityDelta !== 0) return severityDelta;
    return confidenceScore[second.confidence] - confidenceScore[first.confidence];
  });
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function bestWindow(windows: RecommendationBatchPerformanceWindowBreakdown[]) {
  return windows
    .filter(
      (window) =>
        window.batch_count >= 2 &&
        window.window !== "unknown" &&
        window.window !== "closed" &&
        window.window !== "outside_window",
    )
    .sort((first, second) => {
      const secondRate =
        second.average_target_before_stop_rate ?? Number.NEGATIVE_INFINITY;
      const firstRate =
        first.average_target_before_stop_rate ?? Number.NEGATIVE_INFINITY;

      if (secondRate !== firstRate) return secondRate - firstRate;
      return (second.average_best_r ?? 0) - (first.average_best_r ?? 0);
    })[0] ?? null;
}

function weakestWindow(windows: RecommendationBatchPerformanceWindowBreakdown[]) {
  return windows
    .filter(
      (window) =>
        window.batch_count >= 2 &&
        window.window !== "unknown" &&
        window.window !== "closed" &&
        window.window !== "outside_window",
    )
    .sort((first, second) => {
      const secondStop =
        second.average_stop_before_target_rate ?? Number.NEGATIVE_INFINITY;
      const firstStop =
        first.average_stop_before_target_rate ?? Number.NEGATIVE_INFINITY;

      if (secondStop !== firstStop) return secondStop - firstStop;
      return (first.average_worst_r ?? 0) - (second.average_worst_r ?? 0);
    })[0] ?? null;
}

function typeByName(
  breakdown: RecommendationBatchPerformanceStatusBreakdown[],
  batchType: string,
) {
  return breakdown.find((item) => item.batch_type === batchType) ?? null;
}

function evaluatedItems(items: RecommendationBatchPerformanceItem[]) {
  return items.filter((item) => item.evaluated_recommendation_count > 0);
}

function averageTargetRate(items: RecommendationBatchPerformanceItem[]) {
  return average(evaluatedItems(items).map((item) => item.target_before_stop_rate));
}

function statusFromSignals(input: {
  evaluatedBatches: number;
  incompleteRate: number | null;
  positiveInsightCount: number;
  warningInsightCount: number;
  targetRate: number | null;
  averageBestR: number | null;
}): RecommendationBatchLearningStatus {
  if (input.evaluatedBatches < 5) return "not_enough_data";
  if ((input.incompleteRate ?? 0) >= 45) return "needs_attention";
  if (input.warningInsightCount >= 3) return "needs_attention";
  if (
    input.positiveInsightCount >= 2 &&
    (input.targetRate ?? 0) >= 55 &&
    (input.averageBestR ?? 0) >= 0.5
  ) {
    return "directionally_positive";
  }
  if (input.warningInsightCount > 0 && input.positiveInsightCount > 0) {
    return "mixed";
  }
  return "learning_in_progress";
}

export function buildRecommendationBatchLearningInsightsSummary({
  batch_performance: batchPerformance,
  now,
}: RecommendationBatchLearningInsightsInput): RecommendationBatchLearningInsightsSummary {
  const generatedAt = (toDate(now ?? null) ?? new Date()).toISOString();
  const totalBatches = batchPerformance.total_batches;
  const evaluatedBatches = batchPerformance.evaluated_batches;
  const totalRecommendations = batchPerformance.total_recommendations;
  const incompleteRate = percent(
    batchPerformance.incomplete_outcome_count,
    totalRecommendations,
  );
  const insights: RecommendationBatchLearningInsight[] = [];

  if (evaluatedBatches < 5) {
    insights.push(
      insight({
        type: "sample_size",
        severity: "warning",
        confidence: "high",
        title: "Batch sample size is still thin",
        message:
          "Batch sample size is still too small to compare windows reliably. Any batch learning should stay directional for now.",
        evidence: [
          evidence("Evaluated batches", evaluatedBatches, "count"),
          evidence("Total batches", totalBatches, "count"),
        ],
        suggested_next_review_action:
          "Keep collecting official batches and evaluated outcomes before drawing strong conclusions.",
      }),
    );
  } else {
    insights.push(
      insight({
        type: "sample_size",
        severity: "positive",
        confidence: evaluatedBatches >= 12 ? "high" : "medium",
        title: "Batch learning sample is forming",
        message:
          "Ture has enough evaluated batches to start comparing batch behavior, while still avoiding certainty.",
        evidence: [evidence("Evaluated batches", evaluatedBatches, "count")],
        suggested_next_review_action:
          "Continue checking whether new batches keep the same directional pattern.",
      }),
    );
  }

  if ((incompleteRate ?? 0) >= 30 || batchPerformance.incomplete_outcome_count > 0) {
    insights.push(
      insight({
        type: "outcome_completeness",
        severity: (incompleteRate ?? 0) >= 45 ? "critical" : "warning",
        confidence: "high",
        title: "Incomplete outcomes limit batch learning",
        message:
          "Many batch recommendations have incomplete or unavailable outcomes, so batch-quality signals are limited.",
        evidence: [
          evidence(
            "Incomplete outcomes",
            batchPerformance.incomplete_outcome_count,
            "count",
          ),
          evidence("Incomplete share", incompleteRate, "percent"),
        ],
        suggested_next_review_action:
          "Review outcome evaluation coverage before comparing batch quality too strongly.",
      }),
    );
  }

  const strongestWindow = bestWindow(batchPerformance.window_breakdown);
  const weakest = weakestWindow(batchPerformance.window_breakdown);

  if (
    strongestWindow &&
    weakest &&
    strongestWindow.window !== weakest.window &&
    finiteNumber(strongestWindow.average_target_before_stop_rate) !== null &&
    finiteNumber(weakest.average_target_before_stop_rate) !== null
  ) {
    const targetDelta =
      (strongestWindow.average_target_before_stop_rate ?? 0) -
      (weakest.average_target_before_stop_rate ?? 0);

    if (targetDelta >= 10) {
      insights.push(
        insight({
          type: "window_performance",
          severity: "positive",
          confidence: evaluatedBatches >= 12 ? "medium" : "low",
          title: `${strongestWindow.window.replace(/_/g, " ")} batches are leading`,
          message:
            `${strongestWindow.window.replace(/_/g, " ")} batches are currently showing stronger target-before-stop behavior than ${weakest.window.replace(/_/g, " ")} batches based on evaluated batches.`,
          evidence: [
            evidence(
              "Leading target-first",
              strongestWindow.average_target_before_stop_rate,
              "percent",
            ),
            evidence(
              "Weakest target-first",
              weakest.average_target_before_stop_rate,
              "percent",
            ),
            evidence("Target-first delta", targetDelta, "percent"),
          ],
          suggested_next_review_action:
            "Keep comparing windows after more batches complete outcome evaluation.",
        }),
      );
    }
  }

  const official = typeByName(batchPerformance.batch_type_breakdown, "official");
  const fallback = typeByName(batchPerformance.batch_type_breakdown, "fallback");

  if (
    official &&
    fallback &&
    official.evaluated_batch_count >= 2 &&
    fallback.evaluated_batch_count >= 2
  ) {
    const officialRate = official.average_target_before_stop_rate;
    const fallbackRate = fallback.average_target_before_stop_rate;
    const rateDelta =
      officialRate !== null && fallbackRate !== null
        ? officialRate - fallbackRate
        : null;

    insights.push(
      insight({
        type: "batch_type_performance",
        severity: rateDelta !== null && rateDelta >= 10 ? "positive" : "neutral",
        confidence: evaluatedBatches >= 12 ? "medium" : "low",
        title:
          rateDelta !== null && rateDelta >= 10
            ? "Official batches are ahead of fallback batches"
            : "Batch type differences need more evidence",
        message:
          rateDelta !== null && rateDelta >= 10
            ? "Official batches currently outperform fallback batches directionally. Fallback batches should remain secondary until behavior improves."
            : "Official and fallback batch behavior is not clearly separated yet based on evaluated batches.",
        evidence: [
          evidence("Official target-first", officialRate, "percent"),
          evidence("Fallback target-first", fallbackRate, "percent"),
          evidence("Target-first delta", rateDelta, "percent"),
        ],
        suggested_next_review_action:
          "Review fallback batches separately before trusting them as primary recommendation drops.",
      }),
    );
  }

  const withinTargetItems = batchPerformance.items.filter(
    (item) => item.target_status === "within_target",
  );
  const underfilledItems = batchPerformance.items.filter(
    (item) => item.target_status === "below_target",
  );

  if (withinTargetItems.length > 0 || underfilledItems.length > 0) {
    const withinRate = averageTargetRate(withinTargetItems);
    const underfilledRate = averageTargetRate(underfilledItems);
    const targetCoverageDelta =
      withinRate !== null && underfilledRate !== null
        ? withinRate - underfilledRate
        : null;

    insights.push(
      insight({
        type: "target_coverage",
        severity:
          targetCoverageDelta !== null && targetCoverageDelta >= 10
            ? "positive"
            : "neutral",
        confidence: evaluatedBatches >= 10 ? "medium" : "low",
        title:
          targetCoverageDelta !== null && targetCoverageDelta >= 10
            ? "Target-sized batches look healthier"
            : "Target coverage needs more evaluated batches",
        message:
          targetCoverageDelta !== null && targetCoverageDelta >= 10
            ? "Batches within the 6-10 target are currently producing stronger evaluated behavior than underfilled batches."
            : "There is not enough separation yet to say target-sized batches behave better than underfilled batches.",
        evidence: [
          evidence("Within-target batches", withinTargetItems.length, "count"),
          evidence("Underfilled batches", underfilledItems.length, "count"),
          evidence("Target-first delta", targetCoverageDelta, "percent"),
        ],
        suggested_next_review_action:
          "Keep tracking whether target-sized batches create better learning samples than underfilled drops.",
      }),
    );
  }

  const mostlyExperimental = batchPerformance.items.filter(
    (item) => item.experimental_count > item.strong_count + item.valid_count,
  );
  const strongValidMix = batchPerformance.items.filter(
    (item) => item.strong_count + item.valid_count > 0,
  );

  if (mostlyExperimental.length > 0) {
    const experimentalRate = averageTargetRate(mostlyExperimental);
    const strongValidRate = averageTargetRate(strongValidMix);
    const experimentalDelta =
      experimentalRate !== null && strongValidRate !== null
        ? experimentalRate - strongValidRate
        : null;

    insights.push(
      insight({
        type: "experimental_mix",
        severity:
          experimentalDelta !== null && experimentalDelta < -10
            ? "warning"
            : "neutral",
        confidence: evaluatedBatches >= 10 ? "medium" : "low",
        title:
          experimentalDelta !== null && experimentalDelta < -10
            ? "Experimental-heavy batches look weaker"
            : "Experimental mix is worth watching",
        message:
          experimentalDelta !== null && experimentalDelta < -10
            ? "Batches with too many Experimental recommendations currently show weaker target-before-stop behavior."
            : "Experimental-heavy batches do not have enough evaluated separation yet, but they should remain visible in review.",
        evidence: [
          evidence("Experimental-heavy batches", mostlyExperimental.length, "count"),
          evidence("Experimental-heavy target-first", experimentalRate, "percent"),
          evidence("Strong/Valid target-first", strongValidRate, "percent"),
        ],
        suggested_next_review_action:
          "Review whether experimental-heavy batches are adding useful optionality or mostly noise.",
      }),
    );
  }

  const takenBatches = batchPerformance.items.filter((item) => item.taken_count > 0);
  const ignoredOnlyBatches = batchPerformance.items.filter(
    (item) => item.taken_count === 0 && item.ignored_count > 0,
  );

  if (takenBatches.length > 0 && ignoredOnlyBatches.length > 0) {
    const takenRate = averageTargetRate(takenBatches);
    const ignoredRate = averageTargetRate(ignoredOnlyBatches);
    const selectionDelta =
      takenRate !== null && ignoredRate !== null ? takenRate - ignoredRate : null;

    insights.push(
      insight({
        type: "taken_vs_ignored",
        severity:
          selectionDelta !== null && selectionDelta < -10 ? "warning" : "neutral",
        confidence: evaluatedBatches >= 12 ? "medium" : "low",
        title:
          selectionDelta !== null && selectionDelta < -10
            ? "User selection may be lagging ignored batch choices"
            : "Taken versus ignored batch behavior is still forming",
        message:
          selectionDelta !== null && selectionDelta < -10
            ? "User-taken recommendations inside batches are underperforming ignored-only batch groups directionally. This can be selection bias or sample noise."
            : "Taken and ignored batch behavior does not show a strong warning yet. The sample can still be misleading.",
        evidence: [
          evidence("Taken-batch target-first", takenRate, "percent"),
          evidence("Ignored-only target-first", ignoredRate, "percent"),
          evidence("Selection delta", selectionDelta, "percent"),
        ],
        suggested_next_review_action:
          "Review taken versus ignored batch members before changing any selection prompts.",
      }),
    );
  }

  const powerHour = batchPerformance.window_breakdown.find(
    (window) => window.window === "power_hour",
  );

  if (powerHour && powerHour.batch_count > 0) {
    insights.push(
      insight({
        type: "risk_reward_behavior",
        severity:
          (powerHour.average_best_r ?? 0) > 1 &&
          (powerHour.average_worst_r ?? 0) < -0.7
            ? "warning"
            : "neutral",
        confidence: powerHour.batch_count >= 3 ? "medium" : "low",
        title: "Power hour risk/reward needs separate review",
        message:
          "Power hour batches may show different best-R and adverse-move behavior than earlier windows. Treat this as observational until the sample is larger.",
        evidence: [
          evidence("Power hour batches", powerHour.batch_count, "count"),
          evidence("Power hour avg best R", powerHour.average_best_r, "r_multiple"),
          evidence("Power hour avg worst R", powerHour.average_worst_r, "r_multiple"),
        ],
        suggested_next_review_action:
          "Review power hour batches separately before drawing conclusions about late-day recommendation quality.",
      }),
    );
  }

  const positiveInsightCount = insights.filter(
    (item) => item.severity === "positive",
  ).length;
  const warningInsightCount = insights.filter(
    (item) => item.severity === "warning" || item.severity === "critical",
  ).length;
  const overallStatus = statusFromSignals({
    evaluatedBatches,
    incompleteRate,
    positiveInsightCount,
    warningInsightCount,
    targetRate: batchPerformance.target_hit_rate,
    averageBestR: batchPerformance.average_best_r,
  });
  const sortedInsights = sortedByPriority(insights);
  const blockers =
    overallStatus === "not_enough_data"
      ? ["Ture needs more evaluated batches before strong window or type conclusions."]
      : [];
  const warnings = unique([
    ...(incompleteRate !== null && incompleteRate >= 30
      ? ["Incomplete outcomes are limiting batch learning."]
      : []),
    ...sortedInsights
      .filter((item) => item.severity === "warning" || item.severity === "critical")
      .map((item) => item.title),
  ]);
  const suggestedNextReviewActions = unique(
    sortedInsights
      .map((item) => item.suggested_next_review_action)
      .filter((item): item is string => item !== null),
  ).slice(0, 5);

  return {
    summary_id: `recommendation_batch_learning:${batchPerformance.range}:${generatedAt}`,
    summary_version: "1.0",
    summary_kind: "recommendation_batch_learning_insights",
    generated_at: generatedAt,
    overall_batch_learning_status: overallStatus,
    insight_count: sortedInsights.length,
    top_insights: sortedInsights.slice(0, 6),
    blockers,
    warnings,
    suggested_next_review_actions: suggestedNextReviewActions,
    source_metrics: {
      total_batches: totalBatches,
      evaluated_batches: evaluatedBatches,
      total_recommendations: totalRecommendations,
      evaluated_recommendations: batchPerformance.evaluated_recommendations,
      incomplete_outcome_count: batchPerformance.incomplete_outcome_count,
      target_hit_rate: batchPerformance.target_hit_rate,
      average_target_before_stop_rate:
        batchPerformance.average_target_before_stop_rate,
      average_best_r: batchPerformance.average_best_r,
      average_worst_r: batchPerformance.average_worst_r,
    },
    copy: {
      observational:
        "Batch learning insights are observational. They do not change scoring.",
      sample_size: "Small samples can be misleading.",
      data_need:
        "Ture needs more evaluated batches before strong conclusions.",
    },
  };
}

export function recommendationBatchLearningInsightsSummaryJson(
  summary: RecommendationBatchLearningInsightsSummary,
) {
  return JSON.stringify(summary, null, 2);
}
