import type { ConfidenceCalibrationReadinessSummary } from "@/lib/confidence-calibration-readiness";
import type { RecommendationLearningInsightsSummary } from "@/lib/recommendation-learning-insights";
import type { RecommendationPerformanceStatistics } from "@/lib/recommendation-performance-statistics";
import type { RecommendationSampleQualitySummary } from "@/lib/recommendation-sample-quality";
import type {
  RecommendationTierPerformanceSummary,
  RecommendationTierPerformanceTierBreakdown,
} from "@/lib/recommendation-tier-performance";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export type RecommendationEngineImprovementPriority =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "watch";

export type RecommendationEngineImprovementCategory =
  | "data_collection"
  | "outcome_coverage"
  | "confidence_calibration"
  | "tier_quality"
  | "window_targeting"
  | "experimental_noise"
  | "risk_reward_quality"
  | "ticker_concentration"
  | "entry_stop_target_quality"
  | "recommendation_generation"
  | "user_selection_bias"
  | "unknown";

export type RecommendationEngineImprovementStatus =
  | "ready_to_investigate"
  | "needs_more_data"
  | "blocked"
  | "watch_only"
  | "not_recommended_yet"
  | "unknown";

export type RecommendationEngineImprovementEvidence = {
  label: string;
  value: number | string | null;
  unit: "count" | "percent" | "r_multiple" | "text" | "none";
};

export type RecommendationEngineImprovementItem = {
  item_id: string;
  category: RecommendationEngineImprovementCategory;
  priority: RecommendationEngineImprovementPriority;
  status: RecommendationEngineImprovementStatus;
  title: string;
  summary: string;
  evidence: RecommendationEngineImprovementEvidence[];
  suggested_next_action: string;
};

export type RecommendationEngineImprovementBlocker = {
  blocker_id: string;
  category: RecommendationEngineImprovementCategory;
  message: string;
};

export type RecommendationEngineImprovementSuggestion = {
  suggestion_id: string;
  priority: RecommendationEngineImprovementPriority;
  message: string;
};

export type RecommendationEngineImprovementBacklog = {
  backlog_id: string;
  backlog_version: "1.0";
  generated_at: string;
  range: StatisticsTimeRange;
  source_scope: RecommendationPerformanceStatistics["source_scope"];
  overall_status:
    | "data_first"
    | "ready_for_investigation"
    | "watch_only"
    | "blocked"
    | "unknown";
  item_count: number;
  top_items: RecommendationEngineImprovementItem[];
  blocked_items: RecommendationEngineImprovementItem[];
  watch_items: RecommendationEngineImprovementItem[];
  all_items: RecommendationEngineImprovementItem[];
  blockers: RecommendationEngineImprovementBlocker[];
  suggestions: RecommendationEngineImprovementSuggestion[];
  next_recommended_action: string;
  source_metrics: {
    total_recommendations: number;
    evaluated_recommendations: number;
    pending_outcomes: number;
    incomplete_outcomes: number;
    unknown_outcomes: number;
    confidence_readiness_status: ConfidenceCalibrationReadinessSummary["status"];
    sample_quality_status: RecommendationSampleQualitySummary["status"];
    tier_directional_status: RecommendationTierPerformanceSummary["comparison"]["directional_status"];
  };
  copy: {
    purpose: string;
    no_auto_change: string;
    data_first: string;
  };
};

export type RecommendationEngineImprovementBacklogInput = {
  performance: RecommendationPerformanceStatistics;
  tier_performance: RecommendationTierPerformanceSummary;
  learning_insights: RecommendationLearningInsightsSummary;
  sample_quality: RecommendationSampleQualitySummary;
  confidence_readiness: ConfidenceCalibrationReadinessSummary;
  range?: StatisticsTimeRange;
  now?: Date | string | null;
  source_scope?: RecommendationPerformanceStatistics["source_scope"];
};

function percent(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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
  value: RecommendationEngineImprovementEvidence["value"],
  unit: RecommendationEngineImprovementEvidence["unit"],
): RecommendationEngineImprovementEvidence {
  return { label, value, unit };
}

function item(
  input: Omit<RecommendationEngineImprovementItem, "item_id"> & {
    item_id?: string;
  },
): RecommendationEngineImprovementItem {
  return {
    item_id:
      input.item_id ??
      `${input.category}:${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    ...input,
  };
}

function tier(
  summary: RecommendationTierPerformanceSummary,
  tierName: RecommendationTierPerformanceTierBreakdown["tier"],
) {
  return summary.tier_breakdowns.find((entry) => entry.tier === tierName) ?? null;
}

function priorityScore(priority: RecommendationEngineImprovementPriority) {
  const scores: Record<RecommendationEngineImprovementPriority, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    watch: 1,
  };
  return scores[priority];
}

function statusScore(status: RecommendationEngineImprovementStatus) {
  const scores: Record<RecommendationEngineImprovementStatus, number> = {
    blocked: 5,
    ready_to_investigate: 4,
    needs_more_data: 3,
    watch_only: 2,
    not_recommended_yet: 1,
    unknown: 0,
  };
  return scores[status];
}

function sortedItems(items: RecommendationEngineImprovementItem[]) {
  return items.slice().sort((first, second) => {
    const priorityDelta =
      priorityScore(second.priority) - priorityScore(first.priority);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const statusDelta = statusScore(second.status) - statusScore(first.status);

    if (statusDelta !== 0) {
      return statusDelta;
    }

    return first.title.localeCompare(second.title);
  });
}

function takenVsIgnoredItem(
  performance: RecommendationPerformanceStatistics,
  evaluatedRecommendations: number,
) {
  const taken = performance.taken_vs_ignored.find(
    (cohort) => cohort.cohort === "taken",
  );
  const ignored = performance.taken_vs_ignored.find(
    (cohort) => cohort.cohort === "ignored_or_not_taken",
  );

  if (!taken || !ignored || taken.evaluated_count < 5 || ignored.evaluated_count < 5) {
    return null;
  }

  const takenTargetRate = finiteNumber(taken.target_before_stop_rate);
  const ignoredTargetRate = finiteNumber(ignored.target_before_stop_rate);
  const takenBestR = finiteNumber(taken.average_best_r);
  const ignoredBestR = finiteNumber(ignored.average_best_r);
  const targetDelta =
    takenTargetRate !== null && ignoredTargetRate !== null
      ? takenTargetRate - ignoredTargetRate
      : null;
  const bestRDelta =
    takenBestR !== null && ignoredBestR !== null ? takenBestR - ignoredBestR : null;
  const ignoredOutperforming =
    (targetDelta !== null && targetDelta < -10) ||
    (bestRDelta !== null && bestRDelta < -0.3);

  if (!ignoredOutperforming) {
    return item({
      category: "user_selection_bias",
      priority: "watch",
      status: evaluatedRecommendations >= 50 ? "watch_only" : "needs_more_data",
      title: "Keep watching taken versus ignored recommendations",
      summary:
        "Taken and ignored recommendation behavior does not currently show a severe user-selection warning.",
      evidence: [
        evidence("Taken evaluated", taken.evaluated_count, "count"),
        evidence("Ignored evaluated", ignored.evaluated_count, "count"),
        evidence("Target-first delta", targetDelta, "percent"),
        evidence("Best-R delta", bestRDelta, "r_multiple"),
      ],
      suggested_next_action:
        "Keep comparing taken and ignored recommendations before increasing automation or changing user prompts.",
    });
  }

  return item({
    category: "user_selection_bias",
    priority: "medium",
    status: evaluatedRecommendations >= 50 ? "ready_to_investigate" : "needs_more_data",
    title: "Review user selection bias",
    summary:
      "Ignored recommendations are outperforming taken recommendations in evaluated samples, which may indicate user-selection bias.",
    evidence: [
      evidence("Taken target-first", takenTargetRate, "percent"),
      evidence("Ignored target-first", ignoredTargetRate, "percent"),
      evidence("Taken avg best R", takenBestR, "r_multiple"),
      evidence("Ignored avg best R", ignoredBestR, "r_multiple"),
    ],
    suggested_next_action:
      "Review individual recommendation history before changing any selection guidance or automation behavior.",
  });
}

export function buildRecommendationEngineImprovementBacklog({
  performance,
  tier_performance,
  learning_insights,
  sample_quality,
  confidence_readiness,
  range,
  now,
  source_scope,
}: RecommendationEngineImprovementBacklogInput): RecommendationEngineImprovementBacklog {
  const generatedAt = (toDate(now) ?? new Date()).toISOString();
  const totalRecommendations = performance.summary.total_recommendations;
  const evaluatedRecommendations = performance.summary.evaluated_recommendations;
  const pendingOutcomes = performance.summary.pending_outcomes;
  const incompleteOutcomes = performance.summary.incomplete_outcomes;
  const unknownOutcomes = performance.summary.unknown_outcomes;
  const pendingRate = percent(pendingOutcomes, totalRecommendations);
  const incompleteUnknownRate = percent(
    incompleteOutcomes + unknownOutcomes,
    totalRecommendations,
  );
  const items: RecommendationEngineImprovementItem[] = [];

  if (evaluatedRecommendations < 20) {
    items.push(
      item({
        category: "data_collection",
        priority: "high",
        status: "needs_more_data",
        title: "Collect more evaluated recommendation samples",
        summary:
          "The recommendation dataset is still too thin for reliable engine-improvement conclusions.",
        evidence: [
          evidence("Evaluated", evaluatedRecommendations, "count"),
          evidence("Total recommendations", totalRecommendations, "count"),
          evidence("Learning status", learning_insights.overall_learning_status, "text"),
        ],
        suggested_next_action:
          "Prioritize clean recommendation snapshots and evaluated outcomes before changing scoring or confidence.",
      }),
    );
  }

  if (
    (pendingRate !== null && pendingRate > 25) ||
    (incompleteUnknownRate !== null && incompleteUnknownRate > 25) ||
    sample_quality.outcome_completeness.missing_candle_warning_count > 0
  ) {
    items.push(
      item({
        category: "outcome_coverage",
        priority:
          incompleteUnknownRate !== null && incompleteUnknownRate > 50
            ? "critical"
            : "high",
        status: "blocked",
        title: "Improve outcome coverage before calibration",
        summary:
          "Many recommendation outcomes are pending, incomplete, unknown, or missing candle-backed evaluation.",
        evidence: [
          evidence("Pending rate", pendingRate, "percent"),
          evidence("Incomplete/unknown rate", incompleteUnknownRate, "percent"),
          evidence(
            "Missing candle notes",
            sample_quality.outcome_completeness.missing_candle_warning_count,
            "count",
          ),
        ],
        suggested_next_action:
          "Invest in candle-backed outcome coverage before confidence calibration or scoring experiments.",
      }),
    );
  }

  if (
    confidence_readiness.status === "not_enough_data" ||
    confidence_readiness.status === "blocked_by_incomplete_outcomes" ||
    confidence_readiness.status === "blocked_by_missing_confidence" ||
    confidence_readiness.status === "too_skewed"
  ) {
    items.push(
      item({
        category: "confidence_calibration",
        priority:
          confidence_readiness.status === "blocked_by_incomplete_outcomes" ||
          confidence_readiness.status === "blocked_by_missing_confidence"
            ? "high"
            : "medium",
        status: "not_recommended_yet",
        title: "Wait on confidence calibration changes",
        summary:
          "Confidence calibration is not ready for scoring changes based on the current readiness checks.",
        evidence: [
          evidence("Readiness", confidence_readiness.status, "text"),
          evidence(
            "Confidence coverage",
            confidence_readiness.confidence_coverage_rate,
            "percent",
          ),
          evidence("Usable buckets", confidence_readiness.usable_bucket_count, "count"),
        ],
        suggested_next_action:
          "Keep calibration as manual investigation only until confidence buckets and outcomes are cleaner.",
      }),
    );
  } else if (
    confidence_readiness.status === "directionally_ready" ||
    confidence_readiness.status === "ready_for_preliminary_calibration"
  ) {
    items.push(
      item({
        category: "confidence_calibration",
        priority:
          confidence_readiness.status === "ready_for_preliminary_calibration"
            ? "medium"
            : "low",
        status: "ready_to_investigate",
        title: "Prepare a preliminary confidence calibration review",
        summary:
          "Confidence data is ready for observational review, but not automatic scoring changes.",
        evidence: [
          evidence("Readiness", confidence_readiness.status, "text"),
          evidence(
            "Higher confidence signal",
            confidence_readiness.monotonicity.higher_confidence_outperforming === null
              ? "not enough data"
              : confidence_readiness.monotonicity.higher_confidence_outperforming
                ? "directionally better"
                : "not clear",
            "text",
          ),
          evidence("Evaluated", confidence_readiness.evaluated_recommendations, "count"),
        ],
        suggested_next_action:
          "Create a future calibration analysis task that reviews bucket outcomes without mutating confidence yet.",
      }),
    );
  }

  const strongTier = tier(tier_performance, "strong");
  const validTier = tier(tier_performance, "valid");
  const experimentalTier = tier(tier_performance, "experimental");
  const enoughTierSamples =
    (strongTier?.evaluated_count ?? 0) >= 5 &&
    (validTier?.evaluated_count ?? 0) >= 5;

  if (
    tier_performance.comparison.directional_status === "mixed" ||
    (enoughTierSamples &&
      tier_performance.comparison.strong_vs_valid_target_before_stop_delta !==
        null &&
      tier_performance.comparison.strong_vs_valid_target_before_stop_delta < -5)
  ) {
    items.push(
      item({
        category: "tier_quality",
        priority: enoughTierSamples ? "medium" : "watch",
        status: enoughTierSamples ? "ready_to_investigate" : "needs_more_data",
        title: "Investigate whether tier labels are meaningful",
        summary:
          "Strong recommendations are not clearly outperforming lower tiers in the evaluated samples yet.",
        evidence: [
          evidence(
            "Tier direction",
            tier_performance.comparison.directional_status,
            "text",
          ),
          evidence(
            "Strong vs valid delta",
            tier_performance.comparison.strong_vs_valid_target_before_stop_delta,
            "percent",
          ),
          evidence(
            "Strong evaluated",
            strongTier?.evaluated_count ?? 0,
            "count",
          ),
        ],
        suggested_next_action:
          "Review tier thresholds manually after more evaluated Strong and Valid samples are available.",
      }),
    );
  }

  const experimentalShare = percent(
    experimentalTier?.recommendation_count ?? 0,
    totalRecommendations,
  );
  const experimentalStopRate = experimentalTier?.stop_before_target_rate ?? null;

  if (
    (experimentalShare !== null && experimentalShare > 45) ||
    (experimentalStopRate !== null && experimentalStopRate > 35)
  ) {
    items.push(
      item({
        category: "experimental_noise",
        priority: "medium",
        status:
          (experimentalTier?.evaluated_count ?? 0) >= 10
            ? "ready_to_investigate"
            : "watch_only",
        title: "Monitor experimental recommendation noise",
        summary:
          "Experimental recommendations may be dominating the sample or showing weak stop behavior.",
        evidence: [
          evidence("Experimental share", experimentalShare, "percent"),
          evidence("Experimental evaluated", experimentalTier?.evaluated_count ?? 0, "count"),
          evidence("Experimental stop-first", experimentalStopRate, "percent"),
        ],
        suggested_next_action:
          "Keep Experimental as learning candidates, then consider narrowing criteria only after enough evaluated samples.",
      }),
    );
  }

  const weakWindows = tier_performance.window_breakdowns.filter(
    (window) =>
      window.window !== "unknown" &&
      (window.window_target_status === "below_target" ||
        window.window_target_status === "above_target" ||
        (window.evaluated_count >= 5 &&
          (window.stop_before_target_rate ?? 0) > 35)),
  );

  if (
    weakWindows.length > 0 ||
    sample_quality.window_target_coverage.below_target_count > 0 ||
    sample_quality.window_coverage.status === "skewed"
  ) {
    items.push(
      item({
        category: "window_targeting",
        priority: "medium",
        status: evaluatedRecommendations >= 30 ? "ready_to_investigate" : "needs_more_data",
        title: "Review day-trade-window targeting",
        summary:
          "Some windows are underfilled, overfilled, skewed, or showing weak evaluated behavior.",
        evidence: [
          evidence(
            "Below target windows",
            sample_quality.window_target_coverage.below_target_count,
            "count",
          ),
          evidence("Window coverage", sample_quality.window_coverage.status, "text"),
          evidence("Flagged windows", weakWindows.length, "count"),
        ],
        suggested_next_action:
          "Review scan-window history before changing generation strategy for any specific window.",
      }),
    );
  }

  const topTickerConcentration =
    sample_quality.ticker_concentration.top_ticker_concentration;
  const topThreeTickerConcentration =
    sample_quality.ticker_concentration.top_three_ticker_concentration;

  if (
    (topTickerConcentration !== null && topTickerConcentration > 35) ||
    (topThreeTickerConcentration !== null && topThreeTickerConcentration > 60)
  ) {
    items.push(
      item({
        category: "ticker_concentration",
        priority: "medium",
        status: "ready_to_investigate",
        title: "Reduce ticker concentration risk",
        summary:
          "Recommendation samples are concentrated in a small number of tickers, which can bias future learning.",
        evidence: [
          evidence("Top ticker", sample_quality.ticker_concentration.top_ticker, "text"),
          evidence("Top ticker share", topTickerConcentration, "percent"),
          evidence("Top 3 ticker share", topThreeTickerConcentration, "percent"),
        ],
        suggested_next_action:
          "Consider a future manual review of scan-universe breadth or repeated ticker exposure.",
      }),
    );
  }

  const averageBestR = performance.summary.average_best_r;
  const averageWorstR = performance.summary.average_worst_r;

  if (
    evaluatedRecommendations >= 10 &&
    averageBestR !== null &&
    averageWorstR !== null &&
    averageBestR < 0.75 &&
    averageWorstR < -0.75
  ) {
    items.push(
      item({
        category: "risk_reward_quality",
        priority: "medium",
        status: "ready_to_investigate",
        title: "Investigate risk/reward quality",
        summary:
          "Evaluated recommendations show limited favorable R while still allowing large adverse movement.",
        evidence: [
          evidence("Avg best R", averageBestR, "r_multiple"),
          evidence("Avg worst R", averageWorstR, "r_multiple"),
          evidence("Evaluated", evaluatedRecommendations, "count"),
        ],
        suggested_next_action:
          "Review entry, stop, and target placement in Recommendation History before changing any scoring rule.",
      }),
    );
  }

  if (
    evaluatedRecommendations >= 10 &&
    ((performance.summary.entry_triggered_rate !== null &&
      performance.summary.entry_triggered_rate < 35) ||
      (performance.summary.stop_before_target_rate !== null &&
        performance.summary.stop_before_target_rate > 35))
  ) {
    items.push(
      item({
        category: "entry_stop_target_quality",
        priority: "medium",
        status: "ready_to_investigate",
        title: "Review entry, stop, and target behavior",
        summary:
          "Entry trigger or stop-before-target behavior suggests trade-plan structure may need manual investigation.",
        evidence: [
          evidence("Entry trigger rate", performance.summary.entry_triggered_rate, "percent"),
          evidence(
            "Stop-before-target rate",
            performance.summary.stop_before_target_rate,
            "percent",
          ),
          evidence("Target-before-stop rate", performance.summary.target_before_stop_rate, "percent"),
        ],
        suggested_next_action:
          "Inspect individual recommendation plans before any future entry/stop/target quality changes.",
      }),
    );
  }

  const selectionBiasItem = takenVsIgnoredItem(performance, evaluatedRecommendations);

  if (selectionBiasItem) {
    items.push(selectionBiasItem);
  }

  if (items.length === 0) {
    items.push(
      item({
        category: "unknown",
        priority: "watch",
        status: "watch_only",
        title: "Keep observing recommendation engine behavior",
        summary:
          "No urgent improvement candidate is visible from the current analytics set.",
        evidence: [
          evidence("Evaluated", evaluatedRecommendations, "count"),
          evidence("Sample quality", sample_quality.status, "text"),
          evidence("Learning status", learning_insights.overall_learning_status, "text"),
        ],
        suggested_next_action:
          "Keep collecting snapshots and outcomes; avoid changing scoring until stronger evidence appears.",
      }),
    );
  }

  const allItems = sortedItems(items);
  const blockedItems = allItems.filter((entry) => entry.status === "blocked");
  const watchItems = allItems.filter(
    (entry) => entry.status === "watch_only" || entry.priority === "watch",
  );
  const topItems = allItems.slice(0, 8);
  const blockers = blockedItems.map((entry) => ({
    blocker_id: entry.item_id,
    category: entry.category,
    message: entry.summary,
  }));
  const suggestions = topItems.slice(0, 5).map((entry) => ({
    suggestion_id: entry.item_id,
    priority: entry.priority,
    message: entry.suggested_next_action,
  }));
  const overallStatus: RecommendationEngineImprovementBacklog["overall_status"] =
    blockedItems.length > 0
      ? "blocked"
      : evaluatedRecommendations < 20 ||
          sample_quality.learning_readiness === "not_ready"
        ? "data_first"
        : allItems.some((entry) => entry.status === "ready_to_investigate")
          ? "ready_for_investigation"
          : allItems.every((entry) => entry.status === "watch_only")
            ? "watch_only"
            : "unknown";
  const nextRecommendedAction =
    overallStatus === "blocked"
      ? "Resolve blocked data coverage items before calibration or scoring work."
      : overallStatus === "data_first"
        ? "Collect more clean evaluated recommendation samples before investing in engine changes."
        : overallStatus === "ready_for_investigation"
          ? "Review the top backlog items manually; do not change scoring automatically."
          : "Keep observing the recommendation dataset and revisit after more evaluated outcomes.";

  return {
    backlog_id: "recommendation-engine-improvement-backlog-v1",
    backlog_version: "1.0",
    generated_at: generatedAt,
    range: range ?? performance.range,
    source_scope: source_scope ?? performance.source_scope,
    overall_status: overallStatus,
    item_count: allItems.length,
    top_items: topItems,
    blocked_items: blockedItems,
    watch_items: watchItems,
    all_items: allItems,
    blockers,
    suggestions,
    next_recommended_action: nextRecommendedAction,
    source_metrics: {
      total_recommendations: totalRecommendations,
      evaluated_recommendations: evaluatedRecommendations,
      pending_outcomes: pendingOutcomes,
      incomplete_outcomes: incompleteOutcomes,
      unknown_outcomes: unknownOutcomes,
      confidence_readiness_status: confidence_readiness.status,
      sample_quality_status: sample_quality.status,
      tier_directional_status: tier_performance.comparison.directional_status,
    },
    copy: {
      purpose:
        "This backlog translates observed recommendation behavior into future improvement candidates.",
      no_auto_change:
        "It does not change scoring or confidence automatically.",
      data_first:
        "When data is thin, the best improvement is usually more clean evaluated samples.",
    },
  };
}

export function recommendationEngineImprovementBacklogJson(
  backlog: RecommendationEngineImprovementBacklog,
) {
  return JSON.stringify(backlog, null, 2);
}
