import type {
  RecommendationPerformanceBucket,
  RecommendationPerformanceStatistics,
} from "@/lib/recommendation-performance-statistics";
import type {
  RecommendationTierPerformanceSummary,
  RecommendationTierPerformanceTierBreakdown,
  RecommendationTierPerformanceWindowBreakdown,
} from "@/lib/recommendation-tier-performance";

export type RecommendationLearningInsightType =
  | "sample_size"
  | "data_completeness"
  | "tier_performance"
  | "confidence_calibration"
  | "window_performance"
  | "taken_vs_ignored"
  | "experimental_quality"
  | "risk_reward_behavior"
  | "outcome_quality"
  | "unknown";

export type RecommendationLearningInsightSeverity =
  | "positive"
  | "neutral"
  | "warning"
  | "critical"
  | "unknown";

export type RecommendationLearningInsightConfidence =
  | "low"
  | "medium"
  | "high"
  | "unknown";

export type RecommendationLearningInsightActionability =
  | "wait_for_more_data"
  | "evaluate_outcomes"
  | "review_history"
  | "monitor"
  | "none";

export type RecommendationLearningInsightEvidence = {
  label: string;
  value: number | string | null;
  unit: "count" | "percent" | "r_multiple" | "minutes" | "text" | "none";
};

export type RecommendationLearningInsight = {
  insight_id: string;
  type: RecommendationLearningInsightType;
  severity: RecommendationLearningInsightSeverity;
  confidence: RecommendationLearningInsightConfidence;
  title: string;
  message: string;
  evidence: RecommendationLearningInsightEvidence[];
  actionability: RecommendationLearningInsightActionability;
  suggested_next_review_action: string | null;
};

export type RecommendationLearningInsightsSummary = {
  summary_id: string;
  summary_version: "1.0";
  generated_at: string;
  overall_learning_status:
    | "not_enough_data"
    | "learning_in_progress"
    | "directionally_positive"
    | "mixed"
    | "needs_attention"
    | "unknown";
  insight_count: number;
  top_insights: RecommendationLearningInsight[];
  blockers: string[];
  warnings: string[];
  suggested_next_review_actions: string[];
  source_metrics: {
    total_recommendations: number;
    evaluated_recommendations: number;
    pending_outcomes: number;
    incomplete_outcomes: number;
    unknown_outcomes: number;
    tier_directional_status: string;
  };
  copy: {
    observational: string;
    sample_size: string;
    data_need: string;
  };
};

export type RecommendationLearningInsightsInput = {
  performance: RecommendationPerformanceStatistics;
  tier_performance: RecommendationTierPerformanceSummary;
  now?: Date | string | null;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function percent(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function evidence(
  label: string,
  value: RecommendationLearningInsightEvidence["value"],
  unit: RecommendationLearningInsightEvidence["unit"],
): RecommendationLearningInsightEvidence {
  return { label, value, unit };
}

function insight(
  input: Omit<RecommendationLearningInsight, "insight_id"> & {
    insight_id?: string;
  },
): RecommendationLearningInsight {
  return {
    insight_id:
      input.insight_id ??
      `${input.type}:${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    ...input,
  };
}

function tier(
  summary: RecommendationTierPerformanceSummary,
  tierName: RecommendationTierPerformanceTierBreakdown["tier"],
) {
  return summary.tier_breakdowns.find((item) => item.tier === tierName) ?? null;
}

function usableConfidenceBuckets(
  performance: RecommendationPerformanceStatistics,
) {
  return performance.confidence_buckets.filter(
    (bucket) => bucket.bucket_id !== "unknown" && bucket.evaluated_count >= 3,
  );
}

function bestBucket(
  buckets: RecommendationPerformanceBucket[],
) {
  return buckets
    .slice()
    .sort((first, second) => {
      const secondRate = second.target_before_stop_rate ?? Number.NEGATIVE_INFINITY;
      const firstRate = first.target_before_stop_rate ?? Number.NEGATIVE_INFINITY;

      if (secondRate !== firstRate) {
        return secondRate - firstRate;
      }

      return (second.average_best_r ?? 0) - (first.average_best_r ?? 0);
    })[0] ?? null;
}

function bestWindow(windows: RecommendationTierPerformanceWindowBreakdown[]) {
  return windows
    .filter((window) => window.evaluated_count >= 3 && window.window !== "unknown")
    .sort((first, second) => {
      const secondRate = second.target_before_stop_rate ?? Number.NEGATIVE_INFINITY;
      const firstRate = first.target_before_stop_rate ?? Number.NEGATIVE_INFINITY;

      if (secondRate !== firstRate) {
        return secondRate - firstRate;
      }

      return (second.average_best_r ?? 0) - (first.average_best_r ?? 0);
    })[0] ?? null;
}

function weakestWindow(windows: RecommendationTierPerformanceWindowBreakdown[]) {
  return windows
    .filter((window) => window.evaluated_count >= 3 && window.window !== "unknown")
    .sort((first, second) => {
      const firstRate = first.stop_before_target_rate ?? Number.POSITIVE_INFINITY;
      const secondRate = second.stop_before_target_rate ?? Number.POSITIVE_INFINITY;

      if (secondRate !== firstRate) {
        return secondRate - firstRate;
      }

      return (first.average_worst_r ?? 0) - (second.average_worst_r ?? 0);
    })[0] ?? null;
}

function sortedByPriority(insights: RecommendationLearningInsight[]) {
  const severityScore: Record<RecommendationLearningInsightSeverity, number> = {
    critical: 5,
    warning: 4,
    positive: 3,
    neutral: 2,
    unknown: 1,
  };
  const confidenceScore: Record<RecommendationLearningInsightConfidence, number> = {
    high: 3,
    medium: 2,
    low: 1,
    unknown: 0,
  };

  return insights.slice().sort((first, second) => {
    const severityDelta =
      severityScore[second.severity] - severityScore[first.severity];

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return confidenceScore[second.confidence] - confidenceScore[first.confidence];
  });
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

export function buildRecommendationLearningInsightsSummary(
  input: RecommendationLearningInsightsInput,
): RecommendationLearningInsightsSummary {
  const now = toDate(input.now ?? null) ?? new Date();
  const performance = input.performance;
  const tierPerformance = input.tier_performance;
  const summary = performance.summary;
  const total = summary.total_recommendations;
  const evaluated = summary.evaluated_recommendations;
  const incompleteTotal =
    summary.pending_outcomes + summary.incomplete_outcomes + summary.unknown_outcomes;
  const incompleteRate = percent(incompleteTotal, total);
  const insights: RecommendationLearningInsight[] = [];

  if (evaluated < 10) {
    insights.push(
      insight({
        type: "sample_size",
        severity: "warning",
        confidence: "high",
        title: "Sample size is still thin",
        message:
          "Sample size is still too small to trust performance trends. Current insights should stay directional and observational.",
        evidence: [
          evidence("Evaluated recommendations", evaluated, "count"),
          evidence("Total recommendation snapshots", total, "count"),
        ],
        actionability: "wait_for_more_data",
        suggested_next_review_action:
          "Keep collecting recommendation snapshots and outcomes before drawing strong conclusions.",
      }),
    );
  } else {
    insights.push(
      insight({
        type: "sample_size",
        severity: "positive",
        confidence: evaluated >= 30 ? "high" : "medium",
        title: "Learning sample is forming",
        message:
          "Ture has enough evaluated recommendations to begin comparing trends, while still avoiding certainty.",
        evidence: [evidence("Evaluated recommendations", evaluated, "count")],
        actionability: "monitor",
        suggested_next_review_action:
          "Continue reviewing whether new outcomes keep the same directional pattern.",
      }),
    );
  }

  if ((incompleteRate ?? 0) >= 35 || summary.incomplete_outcomes > 0) {
    insights.push(
      insight({
        type: "data_completeness",
        severity: (incompleteRate ?? 0) >= 50 ? "critical" : "warning",
        confidence: "high",
        title: "Outcome data is limiting learning",
        message:
          "Many recommendation outcomes are pending, incomplete, or unknown, so performance signals are not reliable yet.",
        evidence: [
          evidence("Pending outcomes", summary.pending_outcomes, "count"),
          evidence("Incomplete outcomes", summary.incomplete_outcomes, "count"),
          evidence("Unknown outcomes", summary.unknown_outcomes, "count"),
          evidence("Incomplete share", incompleteRate, "percent"),
        ],
        actionability: "evaluate_outcomes",
        suggested_next_review_action:
          "Run or review outcome evaluation so more snapshots have candle-based outcomes.",
      }),
    );
  }

  const strong = tier(tierPerformance, "strong");
  const valid = tier(tierPerformance, "valid");
  const experimental = tier(tierPerformance, "experimental");

  if (tierPerformance.comparison.directional_status === "behaving_as_expected") {
    insights.push(
      insight({
        type: "tier_performance",
        severity: "positive",
        confidence: evaluated >= 30 ? "high" : "medium",
        title: "Tier labels are directionally separating",
        message:
          "Based on evaluated samples, Strong, Valid, and Experimental tiers are currently ordered in the expected direction.",
        evidence: [
          evidence(
            "Strong vs Valid target-first delta",
            tierPerformance.comparison.strong_vs_valid_target_before_stop_delta,
            "percent",
          ),
          evidence(
            "Valid vs Experimental target-first delta",
            tierPerformance.comparison.valid_vs_experimental_target_before_stop_delta,
            "percent",
          ),
          evidence(
            "Strong vs Experimental best-R delta",
            tierPerformance.comparison.strong_vs_experimental_average_best_r_delta,
            "r_multiple",
          ),
        ],
        actionability: "monitor",
        suggested_next_review_action:
          "Monitor whether this tier ordering persists as more outcomes are evaluated.",
      }),
    );
  } else if (tierPerformance.comparison.directional_status === "mixed") {
    insights.push(
      insight({
        type: "tier_performance",
        severity: "warning",
        confidence: "medium",
        title: "Tier ranking is mixed so far",
        message:
          "Strong is not consistently outperforming lower tiers yet. This may be sample noise, incomplete outcomes, or a future calibration signal.",
        evidence: [
          evidence(
            "Strong target-first rate",
            strong?.target_before_stop_rate ?? null,
            "percent",
          ),
          evidence(
            "Valid target-first rate",
            valid?.target_before_stop_rate ?? null,
            "percent",
          ),
          evidence(
            "Experimental target-first rate",
            experimental?.target_before_stop_rate ?? null,
            "percent",
          ),
        ],
        actionability: "review_history",
        suggested_next_review_action:
          "Review individual Strong and Valid recommendation history before changing any scoring logic.",
      }),
    );
  } else {
    insights.push(
      insight({
        type: "tier_performance",
        severity: "neutral",
        confidence: "low",
        title: "Tier performance needs more evaluated samples",
        message:
          "There is not enough evaluated tier data to say whether Strong, Valid, and Experimental are meaningfully different.",
        evidence: [
          evidence("Strong evaluated", strong?.evaluated_count ?? 0, "count"),
          evidence("Valid evaluated", valid?.evaluated_count ?? 0, "count"),
          evidence(
            "Experimental evaluated",
            experimental?.evaluated_count ?? 0,
            "count",
          ),
        ],
        actionability: "wait_for_more_data",
        suggested_next_review_action:
          "Wait for more evaluated tier outcomes before trusting tier comparisons.",
      }),
    );
  }

  const confidenceBuckets = usableConfidenceBuckets(performance);
  const topConfidenceBucket = performance.confidence_buckets.find(
    (bucket) => bucket.bucket_id === "90_100",
  );
  const highConfidenceBucket = performance.confidence_buckets.find(
    (bucket) => bucket.bucket_id === "75_89",
  );
  const strongestConfidenceBucket = bestBucket(confidenceBuckets);

  if (
    topConfidenceBucket &&
    highConfidenceBucket &&
    topConfidenceBucket.evaluated_count >= 3 &&
    highConfidenceBucket.evaluated_count >= 3 &&
    finiteNumber(topConfidenceBucket.target_before_stop_rate) !== null &&
    finiteNumber(highConfidenceBucket.target_before_stop_rate) !== null &&
    (topConfidenceBucket.target_before_stop_rate ?? 0) <
      (highConfidenceBucket.target_before_stop_rate ?? 0)
  ) {
    insights.push(
      insight({
        type: "confidence_calibration",
        severity: "warning",
        confidence: evaluated >= 30 ? "medium" : "low",
        title: "Top confidence bucket is not leading yet",
        message:
          "Confidence 75-89 is currently outperforming 90-100 on target-before-stop rate, suggesting possible overconfidence in the top bucket.",
        evidence: [
          evidence("90-100 target-first", topConfidenceBucket.target_before_stop_rate, "percent"),
          evidence("75-89 target-first", highConfidenceBucket.target_before_stop_rate, "percent"),
        ],
        actionability: "review_history",
        suggested_next_review_action:
          "Review 90-100 confidence recommendation history for common setup or data-quality issues.",
      }),
    );
  } else if (strongestConfidenceBucket) {
    insights.push(
      insight({
        type: "confidence_calibration",
        severity: "neutral",
        confidence: confidenceBuckets.length >= 3 ? "medium" : "low",
        title: `${strongestConfidenceBucket.label} confidence currently leads`,
        message:
          "Confidence calibration is observational only, but one bucket currently has the strongest evaluated target-before-stop behavior.",
        evidence: [
          evidence("Leading bucket", strongestConfidenceBucket.label, "text"),
          evidence(
            "Target-first rate",
            strongestConfidenceBucket.target_before_stop_rate,
            "percent",
          ),
          evidence("Evaluated count", strongestConfidenceBucket.evaluated_count, "count"),
        ],
        actionability: "monitor",
        suggested_next_review_action:
          "Monitor whether higher confidence buckets continue to separate as the sample grows.",
      }),
    );
  }

  const strongestWindow = bestWindow(tierPerformance.window_breakdowns);
  const weakest = weakestWindow(tierPerformance.window_breakdowns);

  if (strongestWindow) {
    insights.push(
      insight({
        type: "window_performance",
        severity: "neutral",
        confidence: strongestWindow.evaluated_count >= 10 ? "medium" : "low",
        title: `${strongestWindow.label} window is currently strongest`,
        message:
          "Based on evaluated samples, this day-trade window currently has the strongest recommendation behavior.",
        evidence: [
          evidence("Window", strongestWindow.label, "text"),
          evidence("Target-first rate", strongestWindow.target_before_stop_rate, "percent"),
          evidence("Average best R", strongestWindow.average_best_r, "r_multiple"),
          evidence("Evaluated count", strongestWindow.evaluated_count, "count"),
        ],
        actionability: "monitor",
        suggested_next_review_action:
          "Compare this window against the next few sessions before treating it as a durable pattern.",
      }),
    );
  }

  if (
    weakest &&
    weakest.stop_before_target_rate !== null &&
    weakest.stop_before_target_rate >= 50
  ) {
    insights.push(
      insight({
        type: "window_performance",
        severity: "warning",
        confidence: weakest.evaluated_count >= 10 ? "medium" : "low",
        title: `${weakest.label} window needs attention`,
        message:
          "This window currently has elevated stop-before-target behavior in evaluated recommendations.",
        evidence: [
          evidence("Window", weakest.label, "text"),
          evidence("Stop-first rate", weakest.stop_before_target_rate, "percent"),
          evidence("Evaluated count", weakest.evaluated_count, "count"),
        ],
        actionability: "review_history",
        suggested_next_review_action:
          "Review individual recommendations from this window before making any scanner or scoring changes.",
      }),
    );
  }

  if (experimental && experimental.recommendation_count > 0) {
    const experimentalSeverity =
      experimental.evaluated_count < 3
        ? "neutral"
        : (experimental.stop_before_target_rate ?? 0) >
              (experimental.target_before_stop_rate ?? 0)
          ? "warning"
          : "neutral";

    insights.push(
      insight({
        type: "experimental_quality",
        severity: experimentalSeverity,
        confidence: experimental.evaluated_count >= 10 ? "medium" : "low",
        title:
          experimentalSeverity === "warning"
            ? "Experimental recommendations are showing weak stop behavior"
            : "Experimental recommendations are adding learning samples",
        message:
          experimentalSeverity === "warning"
            ? "Experimental recommendations are adding samples, but currently show weaker stop-before-target behavior."
            : "Experimental recommendations are useful as learning candidates, but they should not be read as strong trade signals.",
        evidence: [
          evidence("Experimental count", experimental.recommendation_count, "count"),
          evidence("Experimental evaluated", experimental.evaluated_count, "count"),
          evidence(
            "Target-first rate",
            experimental.target_before_stop_rate,
            "percent",
          ),
          evidence("Stop-first rate", experimental.stop_before_target_rate, "percent"),
        ],
        actionability: "monitor",
        suggested_next_review_action:
          "Keep Experimental separate from Strong/Valid when reviewing performance.",
      }),
    );
  }

  const taken = performance.taken_vs_ignored.find(
    (bucket) => bucket.bucket_id === "taken",
  );
  const ignored = performance.taken_vs_ignored.find(
    (bucket) => bucket.bucket_id === "ignored_or_not_taken",
  );

  if (
    taken &&
    ignored &&
    taken.evaluated_count >= 3 &&
    ignored.evaluated_count >= 3 &&
    taken.target_before_stop_rate !== null &&
    ignored.target_before_stop_rate !== null
  ) {
    const takenDelta = taken.target_before_stop_rate - ignored.target_before_stop_rate;

    insights.push(
      insight({
        type: "taken_vs_ignored",
        severity: takenDelta >= 0 ? "positive" : "warning",
        confidence: evaluated >= 30 ? "medium" : "low",
        title:
          takenDelta >= 0
            ? "Taken recommendations are currently outperforming ignored"
            : "Ignored recommendations are currently outperforming taken",
        message:
          takenDelta >= 0
            ? "User selection is directionally adding value in the evaluated sample."
            : "This may indicate user selection bias, small-sample noise, or incomplete outcome coverage.",
        evidence: [
          evidence("Taken target-first", taken.target_before_stop_rate, "percent"),
          evidence("Ignored target-first", ignored.target_before_stop_rate, "percent"),
          evidence("Taken vs ignored delta", takenDelta, "percent"),
        ],
        actionability: "review_history",
        suggested_next_review_action:
          "Review taken and ignored recommendation history side by side before drawing conclusions.",
      }),
    );
  }

  if (
    summary.average_best_r !== null ||
    summary.average_worst_r !== null ||
    summary.expectancy_proxy_r !== null
  ) {
    const severity =
      (summary.average_best_r ?? 0) > 0 &&
      summary.average_worst_r !== null &&
      summary.average_worst_r <= -1
        ? "warning"
        : "neutral";

    insights.push(
      insight({
        type: "risk_reward_behavior",
        severity,
        confidence: evaluated >= 20 ? "medium" : "low",
        title:
          severity === "warning"
            ? "Best-R excursions exist, but adverse movement is meaningful"
            : "Risk/reward behavior is becoming observable",
        message:
          severity === "warning"
            ? "Recommendations are producing favorable excursions, but average worst R suggests entry or stop quality still needs monitoring."
            : "Average best R and worst R are now available as observational recommendation-quality signals.",
        evidence: [
          evidence("Average best R", summary.average_best_r, "r_multiple"),
          evidence("Average worst R", summary.average_worst_r, "r_multiple"),
          evidence("Expectancy proxy", summary.expectancy_proxy_r, "r_multiple"),
        ],
        actionability: "monitor",
        suggested_next_review_action:
          "Track whether best-R improves without worsening average adverse movement.",
      }),
    );
  }

  const sortedInsights = sortedByPriority(insights).slice(0, 6);
  const blockers = sortedInsights
    .filter((item) => item.severity === "critical")
    .map((item) => item.message);
  const warnings = sortedInsights
    .filter((item) => item.severity === "warning")
    .map((item) => item.message);
  const suggestedNextReviewActions = unique(
    sortedInsights
      .map((item) => item.suggested_next_review_action)
      .filter((item): item is string => item !== null),
  ).slice(0, 4);
  const positiveCount = sortedInsights.filter(
    (item) => item.severity === "positive",
  ).length;
  const warningCount = sortedInsights.filter(
    (item) => item.severity === "warning" || item.severity === "critical",
  ).length;
  const overallLearningStatus =
    total === 0
      ? "unknown"
      : evaluated < 10
        ? "not_enough_data"
        : blockers.length > 0 || (incompleteRate ?? 0) >= 50
          ? "needs_attention"
          : positiveCount >= 2 && warningCount === 0
            ? "directionally_positive"
            : warningCount > 0 && positiveCount > 0
              ? "mixed"
              : "learning_in_progress";

  return {
    summary_id: `recommendation_learning_insights:${performance.range}:${now.toISOString()}`,
    summary_version: "1.0",
    generated_at: now.toISOString(),
    overall_learning_status: overallLearningStatus,
    insight_count: sortedInsights.length,
    top_insights: sortedInsights,
    blockers,
    warnings,
    suggested_next_review_actions: suggestedNextReviewActions,
    source_metrics: {
      total_recommendations: total,
      evaluated_recommendations: evaluated,
      pending_outcomes: summary.pending_outcomes,
      incomplete_outcomes: summary.incomplete_outcomes,
      unknown_outcomes: summary.unknown_outcomes,
      tier_directional_status: tierPerformance.comparison.directional_status,
    },
    copy: {
      observational:
        "Learning insights are observational. They do not change Ture's scoring yet.",
      sample_size: "Small samples can be misleading.",
      data_need:
        "Ture needs more evaluated recommendations before strong conclusions.",
    },
  };
}

export function recommendationLearningInsightsSummaryJson(
  summary: RecommendationLearningInsightsSummary,
) {
  return JSON.stringify(summary, null, 2);
}
