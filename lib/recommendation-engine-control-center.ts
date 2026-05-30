import type { ConfidenceCalibrationReadinessSummary } from "@/lib/confidence-calibration-readiness";
import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { DayTradeWindowRecommendationTargetSummary } from "@/lib/day-trade-window-recommendation-target";
import type { RecommendationEngineImprovementBacklog } from "@/lib/recommendation-engine-improvement-backlog";
import type { RecommendationLearningInsightsSummary } from "@/lib/recommendation-learning-insights";
import type { RecommendationPerformanceStatistics } from "@/lib/recommendation-performance-statistics";
import type { RecommendationSampleQualitySummary } from "@/lib/recommendation-sample-quality";
import type { RecommendationScanRunHistorySummary } from "@/lib/recommendation-scan-run-history";
import type { ScanPipelineObservabilitySummary } from "@/lib/scan-pipeline-observability";
import type { RecommendationTierPerformanceSummary } from "@/lib/recommendation-tier-performance";

export type RecommendationEngineControlCenterStatus =
  | "healthy"
  | "learning"
  | "thin_data"
  | "degraded"
  | "blocked"
  | "unknown";

export type RecommendationEngineControlCenterSignal = {
  signal_id: string;
  label: string;
  value: number | string | null;
  formatted_value: string;
  status: RecommendationEngineControlCenterStatus;
  message: string;
};

export type RecommendationEngineControlCenterWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  source: string;
};

export type RecommendationEngineControlCenterNextAction = {
  action_id: string;
  label: string;
  priority: "critical" | "high" | "medium" | "low" | "watch";
  message: string;
  destination: "statistics" | "history" | "market" | "recommendations" | "none";
};

export type RecommendationEngineControlCenterSection = {
  section_id: string;
  title: string;
  status: RecommendationEngineControlCenterStatus;
  summary: string;
  signals: RecommendationEngineControlCenterSignal[];
};

export type RecommendationEngineControlCenterSummary = {
  summary_id: string;
  summary_version: "1.0";
  generated_at: string;
  overall_status: RecommendationEngineControlCenterStatus;
  overall_message: string;
  top_signals: RecommendationEngineControlCenterSignal[];
  warnings: RecommendationEngineControlCenterWarning[];
  next_action: RecommendationEngineControlCenterNextAction;
  sections: RecommendationEngineControlCenterSection[];
  source_metrics: {
    visible_recommendations: number;
    current_window_target_status: string;
    scan_run_target_hit_rate: number | null;
    evaluated_recommendations: number;
    total_recommendations: number;
    confidence_readiness_status: string;
    sample_quality_status: string;
    backlog_status: string;
  };
  copy: {
    purpose: string;
    learning_dependency: string;
    data_first: string;
  };
};

export type RecommendationEngineControlCenterInput = {
  scan_observability: ScanPipelineObservabilitySummary;
  day_trade_window_target: DayTradeWindowRecommendationTargetSummary;
  performance: RecommendationPerformanceStatistics;
  tier_performance: RecommendationTierPerformanceSummary;
  learning_insights: RecommendationLearningInsightsSummary;
  sample_quality: RecommendationSampleQualitySummary;
  confidence_readiness: ConfidenceCalibrationReadinessSummary;
  improvement_backlog: RecommendationEngineImprovementBacklog;
  scan_run_history: RecommendationScanRunHistorySummary;
  data_mode_clarity?: DataModeClaritySummary | null;
  market_wait_state?: {
    is_wait_state?: boolean | null;
    next_window_label?: string | null;
    reason?: string | null;
  } | null;
  now?: Date | string | null;
};

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

function percent(value: number | null | undefined) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? "Unknown"
    : `${value.toFixed(1)}%`;
}

function decimal(value: number | null | undefined, suffix = "") {
  return value === null || value === undefined || !Number.isFinite(value)
    ? "Unknown"
    : `${value.toFixed(1)}${suffix}`;
}

function words(value: string) {
  return value.replaceAll("_", " ");
}

function signal(input: RecommendationEngineControlCenterSignal) {
  return input;
}

function warning(input: RecommendationEngineControlCenterWarning) {
  return input;
}

function section(input: RecommendationEngineControlCenterSection) {
  return input;
}

function scanStatus(
  scanObservability: ScanPipelineObservabilitySummary,
): RecommendationEngineControlCenterStatus {
  if (scanObservability.status === "healthy") {
    return "healthy";
  }

  if (scanObservability.status === "degraded" || scanObservability.status === "stale") {
    return "degraded";
  }

  if (scanObservability.status === "incomplete") {
    return "thin_data";
  }

  return "unknown";
}

function targetStatus(
  target: DayTradeWindowRecommendationTargetSummary,
): RecommendationEngineControlCenterStatus {
  if (target.status === "within_target") {
    return "healthy";
  }

  if (target.status === "above_target") {
    return "learning";
  }

  if (target.status === "below_target" || target.status === "no_recommendations") {
    return "thin_data";
  }

  return "unknown";
}

function scanTrendStatus(
  history: RecommendationScanRunHistorySummary,
): RecommendationEngineControlCenterStatus {
  if (history.total_scan_runs === 0) {
    return "thin_data";
  }

  const targetRate = history.target_hit_rate ?? 0;
  const degradedRate =
    history.status_breakdown
      .filter(
        (item) =>
          item.status === "degraded" ||
          item.status === "stale" ||
          item.status === "empty" ||
          item.status === "failed",
      )
      .reduce((total, item) => total + (item.rate ?? 0), 0) || 0;

  if (degradedRate >= 35) {
    return "degraded";
  }

  if (targetRate >= 70) {
    return "healthy";
  }

  if (targetRate >= 45) {
    return "learning";
  }

  return "thin_data";
}

function outcomeCoverageStatus(
  performance: RecommendationPerformanceStatistics,
): RecommendationEngineControlCenterStatus {
  const total = performance.summary.total_recommendations;
  const evaluated = performance.summary.evaluated_recommendations;
  const evaluatedRate = total > 0 ? (evaluated / total) * 100 : null;

  if (total === 0 || evaluated < 20) {
    return "thin_data";
  }

  if ((evaluatedRate ?? 0) < 35) {
    return "degraded";
  }

  if ((evaluatedRate ?? 0) >= 60) {
    return "learning";
  }

  return "thin_data";
}

function performanceStatus(
  performance: RecommendationPerformanceStatistics,
): RecommendationEngineControlCenterStatus {
  if (performance.summary.evaluated_recommendations < 20) {
    return "thin_data";
  }

  const positiveRate = performance.summary.target_before_stop_rate ?? 0;
  const negativeRate = performance.summary.stop_before_target_rate ?? 0;

  if (positiveRate > negativeRate + 10) {
    return "learning";
  }

  if (negativeRate > positiveRate + 10) {
    return "degraded";
  }

  return "learning";
}

function tierStatus(
  tierPerformance: RecommendationTierPerformanceSummary,
): RecommendationEngineControlCenterStatus {
  if (
    tierPerformance.comparison.directional_status === "not_enough_data" ||
    tierPerformance.evaluated_recommendations < 20
  ) {
    return "thin_data";
  }

  if (tierPerformance.comparison.directional_status === "behaving_as_expected") {
    return "learning";
  }

  if (tierPerformance.comparison.directional_status === "mixed") {
    return "degraded";
  }

  return "unknown";
}

function learningStatus(
  learningInsights: RecommendationLearningInsightsSummary,
): RecommendationEngineControlCenterStatus {
  if (learningInsights.overall_learning_status === "not_enough_data") {
    return "thin_data";
  }

  if (learningInsights.overall_learning_status === "needs_attention") {
    return "degraded";
  }

  if (
    learningInsights.overall_learning_status === "learning_in_progress" ||
    learningInsights.overall_learning_status === "directionally_positive" ||
    learningInsights.overall_learning_status === "mixed"
  ) {
    return "learning";
  }

  return "unknown";
}

function sampleQualityStatus(
  sampleQuality: RecommendationSampleQualitySummary,
): RecommendationEngineControlCenterStatus {
  if (
    sampleQuality.status === "insufficient_data" ||
    sampleQuality.status === "thin_but_growing"
  ) {
    return "thin_data";
  }

  if (sampleQuality.status === "incomplete" || sampleQuality.status === "skewed") {
    return "degraded";
  }

  if (
    sampleQuality.status === "adequate_for_observation" ||
    sampleQuality.status === "good_learning_coverage"
  ) {
    return "learning";
  }

  return "unknown";
}

function calibrationStatus(
  confidenceReadiness: ConfidenceCalibrationReadinessSummary,
): RecommendationEngineControlCenterStatus {
  if (
    confidenceReadiness.status === "blocked_by_incomplete_outcomes" ||
    confidenceReadiness.status === "blocked_by_missing_confidence" ||
    confidenceReadiness.status === "too_skewed"
  ) {
    return "blocked";
  }

  if (
    confidenceReadiness.status === "not_enough_data" ||
    confidenceReadiness.status === "early_observation_only"
  ) {
    return "thin_data";
  }

  if (
    confidenceReadiness.status === "directionally_ready" ||
    confidenceReadiness.status === "ready_for_preliminary_calibration"
  ) {
    return "learning";
  }

  return "unknown";
}

function backlogStatus(
  backlog: RecommendationEngineImprovementBacklog,
): RecommendationEngineControlCenterStatus {
  if (backlog.overall_status === "blocked") {
    return "blocked";
  }

  if (backlog.overall_status === "data_first") {
    return "thin_data";
  }

  if (
    backlog.overall_status === "ready_for_investigation" ||
    backlog.overall_status === "watch_only"
  ) {
    return "learning";
  }

  return "unknown";
}

function overallStatus(
  statuses: RecommendationEngineControlCenterStatus[],
  options: { marketWaitState?: boolean } = {},
): RecommendationEngineControlCenterStatus {
  if (options.marketWaitState) {
    return "learning";
  }

  if (statuses.includes("blocked")) {
    return "blocked";
  }

  if (statuses.includes("degraded")) {
    return "degraded";
  }

  const thinCount = statuses.filter((status) => status === "thin_data").length;
  if (thinCount >= 3) {
    return "thin_data";
  }

  const healthyCount = statuses.filter((status) => status === "healthy").length;
  const learningCount = statuses.filter((status) => status === "learning").length;

  if (healthyCount >= 2 && learningCount >= 3) {
    return "healthy";
  }

  if (learningCount > 0 || healthyCount > 0) {
    return "learning";
  }

  return "unknown";
}

function statusMessage(status: RecommendationEngineControlCenterStatus) {
  if (status === "healthy") {
    return "The engine is producing useful observable signals and enough diagnostics to keep learning.";
  }

  if (status === "learning") {
    return "The engine is learning from recommendations, but conclusions remain observational.";
  }

  if (status === "thin_data") {
    return "The engine needs more clean evaluated recommendation samples before strong conclusions.";
  }

  if (status === "degraded") {
    return "The engine has degraded, stale, incomplete, or weak signals that need review.";
  }

  if (status === "blocked") {
    return "A data or readiness blocker is limiting the next learning step.";
  }

  return "Engine status is unknown because available diagnostics are limited.";
}

function waitStateStatus(
  status: RecommendationEngineControlCenterStatus,
  marketWaitState: boolean,
) {
  return marketWaitState && status === "blocked" ? "thin_data" : status;
}

function waitStateMessage(input: RecommendationEngineControlCenterInput) {
  const nextWindow = input.market_wait_state?.next_window_label?.trim();

  return nextWindow
    ? `Closed market is a wait state, not a scanner failure. Ture is waiting for ${nextWindow}.`
    : "Closed market is a wait state, not a scanner failure. Ture is waiting for the next active scan window.";
}

function buildNextAction(
  backlog: RecommendationEngineImprovementBacklog,
  confidenceReadiness: ConfidenceCalibrationReadinessSummary,
  sampleQuality: RecommendationSampleQualitySummary,
  marketWaitState?: RecommendationEngineControlCenterInput["market_wait_state"],
): RecommendationEngineControlCenterNextAction {
  if (marketWaitState?.is_wait_state) {
    return {
      action_id: "wait_for_next_active_window",
      label: "Wait for next active window",
      priority: "watch",
      message:
        marketWaitState.next_window_label?.trim()
          ? `Market is closed. Ture is waiting for ${marketWaitState.next_window_label}.`
          : "Market is closed. Ture is waiting for the next active scan window.",
      destination: "market",
    };
  }

  const topItem = backlog.top_items[0] ?? backlog.all_items[0] ?? null;

  if (topItem) {
    const destination =
      topItem.category === "data_collection" ||
      topItem.category === "outcome_coverage" ||
      topItem.category === "confidence_calibration"
        ? "statistics"
        : topItem.category === "window_targeting"
          ? "market"
          : "history";

    return {
      action_id: topItem.item_id,
      label: topItem.title,
      priority: topItem.priority,
      message: topItem.suggested_next_action,
      destination,
    };
  }

  if (confidenceReadiness.blockers[0]) {
    return {
      action_id: confidenceReadiness.blockers[0].blocker_id,
      label: "Resolve calibration blocker",
      priority: "high",
      message: confidenceReadiness.blockers[0].message,
      destination: "statistics",
    };
  }

  if (sampleQuality.suggestions[0]) {
    return {
      action_id: sampleQuality.suggestions[0].suggestion_id,
      label: "Improve sample coverage",
      priority: sampleQuality.suggestions[0].priority,
      message: sampleQuality.suggestions[0].message,
      destination: "statistics",
    };
  }

  return {
    action_id: "keep_observing",
    label: "Keep observing",
    priority: "watch",
    message: "Keep collecting evaluated recommendation samples before changing scoring.",
    destination: "statistics",
  };
}

function collectWarnings(
  input: RecommendationEngineControlCenterInput,
): RecommendationEngineControlCenterWarning[] {
  const warnings: RecommendationEngineControlCenterWarning[] = [];

  for (const scanWarning of input.scan_observability.warnings.slice(0, 3)) {
    warnings.push(
      warning({
        warning_id: `scan:${scanWarning.warning_id}`,
        severity: "warning",
        message: scanWarning.message,
        source: "scan_observability",
      }),
    );
  }

  for (const targetWarning of input.day_trade_window_target.warnings.slice(0, 3)) {
    warnings.push(
      warning({
        warning_id: `window_target:${targetWarning.warning_id}`,
        severity: targetWarning.severity,
        message: targetWarning.message,
        source: "window_target",
      }),
    );
  }

  for (const blocker of input.confidence_readiness.blockers.slice(0, 2)) {
    warnings.push(
      warning({
        warning_id: `confidence:${blocker.blocker_id}`,
        severity: blocker.severity,
        message: blocker.message,
        source: "confidence_readiness",
      }),
    );
  }

  for (const gap of input.sample_quality.gaps.slice(0, 2)) {
    warnings.push(
      warning({
        warning_id: `sample_quality:${gap.gap_id}`,
        severity: gap.severity,
        message: gap.message,
        source: "sample_quality",
      }),
    );
  }

  for (const backlogBlocker of input.improvement_backlog.blockers.slice(0, 2)) {
    warnings.push(
      warning({
        warning_id: `backlog:${backlogBlocker.blocker_id}`,
        severity: "warning",
        message: backlogBlocker.message,
        source: "improvement_backlog",
      }),
    );
  }

  for (const scanRunWarning of input.scan_run_history.warnings.slice(0, 2)) {
    warnings.push(
      warning({
        warning_id: `scan_run_history:${scanRunWarning.warning_id}`,
        severity: scanRunWarning.severity,
        message: scanRunWarning.message,
        source: "scan_run_history",
      }),
    );
  }

  return warnings.slice(0, 8);
}

export function buildRecommendationEngineControlCenterSummary(
  input: RecommendationEngineControlCenterInput,
): RecommendationEngineControlCenterSummary {
  const now = toDate(input.now) ?? new Date();
  const performance = input.performance.summary;
  const currentWindow = input.day_trade_window_target.current_window_count;
  const marketWaitState = input.market_wait_state?.is_wait_state === true;
  const scanHealthStatus = waitStateStatus(
    scanStatus(input.scan_observability),
    marketWaitState,
  );
  const windowHealthStatus = marketWaitState
    ? "learning"
    : targetStatus(input.day_trade_window_target);
  const trendStatus = waitStateStatus(
    scanTrendStatus(input.scan_run_history),
    marketWaitState,
  );
  const coverageStatus = outcomeCoverageStatus(input.performance);
  const recPerformanceStatus = performanceStatus(input.performance);
  const recTierStatus = tierStatus(input.tier_performance);
  const recLearningStatus = learningStatus(input.learning_insights);
  const recSampleQualityStatus = sampleQualityStatus(input.sample_quality);
  const recCalibrationStatus = waitStateStatus(
    calibrationStatus(input.confidence_readiness),
    marketWaitState,
  );
  const recBacklogStatus = waitStateStatus(
    backlogStatus(input.improvement_backlog),
    marketWaitState,
  );
  const overall = overallStatus([
    scanHealthStatus,
    windowHealthStatus,
    trendStatus,
    coverageStatus,
    recPerformanceStatus,
    recTierStatus,
    recLearningStatus,
    recSampleQualityStatus,
    recCalibrationStatus,
    recBacklogStatus,
  ], { marketWaitState });
  const nextAction = buildNextAction(
    input.improvement_backlog,
    input.confidence_readiness,
    input.sample_quality,
    input.market_wait_state,
  );

  const sections = [
    section({
      section_id: "current_scan_health",
      title: "Current scan health",
      status: scanHealthStatus,
      summary: marketWaitState
        ? waitStateMessage(input)
        : `${words(input.scan_observability.status)} scan state with ${input.scan_observability.visible_recommendation_count} visible recommendations.`,
      signals: [
        signal({
          signal_id: "scan_visible_recommendations",
          label: "Visible recommendations",
          value: input.scan_observability.visible_recommendation_count,
          formatted_value: String(input.scan_observability.visible_recommendation_count),
          status: scanHealthStatus,
          message: marketWaitState
            ? "Scanner output will be evaluated during the next active window."
            : input.scan_observability.summary,
        }),
        signal({
          signal_id: "scan_data_age",
          label: "Data age",
          value: input.scan_observability.run_context.data_age_minutes,
          formatted_value:
            input.scan_observability.run_context.data_age_minutes === null
              ? "Unknown"
              : `${input.scan_observability.run_context.data_age_minutes}m`,
          status: scanHealthStatus,
          message: "Source freshness for the visible recommendation set.",
        }),
      ],
    }),
    section({
      section_id: "window_target_health",
      title: "Window target",
      status: windowHealthStatus,
      summary: marketWaitState
        ? "Window targets are not applicable while the market is closed."
        : `${currentWindow.total} / ${input.day_trade_window_target.ideal_min}-${input.day_trade_window_target.ideal_max} recommendations in the current window.`,
      signals: [
        signal({
          signal_id: "current_window_output",
          label: "Current window output",
          value: currentWindow.total,
          formatted_value: `${currentWindow.total} / ${input.day_trade_window_target.ideal_min}-${input.day_trade_window_target.ideal_max}`,
          status: windowHealthStatus,
          message: marketWaitState
            ? "No active candidates are expected while the market is closed."
            : `${currentWindow.strong} strong, ${currentWindow.valid} valid, ${currentWindow.experimental} experimental.`,
        }),
        signal({
          signal_id: "window_gap",
          label: "Gap or overflow",
          value:
            currentWindow.gap_to_ideal_min > 0
              ? currentWindow.gap_to_ideal_min
              : currentWindow.overflow_above_ideal_max,
          formatted_value:
            currentWindow.gap_to_ideal_min > 0
              ? `${currentWindow.gap_to_ideal_min} below target`
              : currentWindow.overflow_above_ideal_max > 0
                ? `${currentWindow.overflow_above_ideal_max} above target`
                : "Within target",
          status: windowHealthStatus,
          message: words(input.day_trade_window_target.status),
        }),
      ],
    }),
    section({
      section_id: "scan_run_trend",
      title: "Scan run trend",
      status: trendStatus,
      summary: `${input.scan_run_history.total_scan_runs} stored scan runs with ${percent(input.scan_run_history.target_hit_rate)} target coverage.`,
      signals: [
        signal({
          signal_id: "scan_run_target_hit_rate",
          label: "Target hit rate",
          value: input.scan_run_history.target_hit_rate,
          formatted_value: percent(input.scan_run_history.target_hit_rate),
          status: trendStatus,
          message: "Share of stored scan runs meeting or exceeding the 6-10 output target.",
        }),
        signal({
          signal_id: "latest_scan_run_status",
          label: "Latest scan run",
          value: input.scan_run_history.latest_run_status,
          formatted_value: words(input.scan_run_history.latest_run_status),
          status: trendStatus,
          message: "Latest persisted scan-run status.",
        }),
      ],
    }),
    section({
      section_id: "outcome_coverage",
      title: "Outcome coverage",
      status: coverageStatus,
      summary: `${performance.evaluated_recommendations} of ${performance.total_recommendations} recommendations have evaluated outcomes.`,
      signals: [
        signal({
          signal_id: "evaluated_recommendations",
          label: "Evaluated",
          value: performance.evaluated_recommendations,
          formatted_value: `${performance.evaluated_recommendations} / ${performance.total_recommendations}`,
          status: coverageStatus,
          message: `${performance.pending_outcomes} pending, ${performance.incomplete_outcomes} incomplete, ${performance.unknown_outcomes} unknown.`,
        }),
      ],
    }),
    section({
      section_id: "recommendation_performance",
      title: "Recommendation performance",
      status: recPerformanceStatus,
      summary: `${percent(performance.target_before_stop_rate)} target-before-stop rate across evaluated recommendations.`,
      signals: [
        signal({
          signal_id: "target_before_stop_rate",
          label: "Target before stop",
          value: performance.target_before_stop_rate,
          formatted_value: percent(performance.target_before_stop_rate),
          status: recPerformanceStatus,
          message: "Positive outcome candidate rate for evaluated recommendations.",
        }),
        signal({
          signal_id: "avg_best_r",
          label: "Avg best R",
          value: performance.average_best_r,
          formatted_value: decimal(performance.average_best_r, "R"),
          status: recPerformanceStatus,
          message: `Avg worst R is ${decimal(performance.average_worst_r, "R")}.`,
        }),
      ],
    }),
    section({
      section_id: "tier_quality",
      title: "Tier quality",
      status: recTierStatus,
      summary: `Tier ranking is ${words(input.tier_performance.comparison.directional_status)}.`,
      signals: [
        signal({
          signal_id: "tier_directional_status",
          label: "Tier direction",
          value: input.tier_performance.comparison.directional_status,
          formatted_value: words(input.tier_performance.comparison.directional_status),
          status: recTierStatus,
          message:
            input.tier_performance.comparison.notes[0] ??
            "Tier performance is observational only.",
        }),
      ],
    }),
    section({
      section_id: "learning_status",
      title: "Learning status",
      status: recLearningStatus,
      summary: words(input.learning_insights.overall_learning_status),
      signals: input.learning_insights.top_insights.slice(0, 2).map((insight) =>
        signal({
          signal_id: insight.insight_id,
          label: insight.title,
          value: insight.confidence,
          formatted_value: insight.confidence,
          status:
            insight.severity === "critical"
              ? "blocked"
              : insight.severity === "warning"
                ? "degraded"
                : insight.severity === "positive"
                  ? "learning"
                  : "thin_data",
          message: insight.message,
        }),
      ),
    }),
    section({
      section_id: "sample_quality",
      title: "Sample quality",
      status: recSampleQualityStatus,
      summary: `${words(input.sample_quality.status)} / ${words(input.sample_quality.learning_readiness)}.`,
      signals: [
        signal({
          signal_id: "learning_readiness",
          label: "Learning readiness",
          value: input.sample_quality.learning_readiness,
          formatted_value: words(input.sample_quality.learning_readiness),
          status: recSampleQualityStatus,
          message:
            input.sample_quality.suggestions[0]?.message ??
            "Coverage checks help avoid learning from biased or incomplete data.",
        }),
      ],
    }),
    section({
      section_id: "confidence_calibration",
      title: "Confidence calibration",
      status: recCalibrationStatus,
      summary: words(input.confidence_readiness.status),
      signals: [
        signal({
          signal_id: "confidence_readiness",
          label: "Readiness",
          value: input.confidence_readiness.status,
          formatted_value: words(input.confidence_readiness.status),
          status: recCalibrationStatus,
          message:
            input.confidence_readiness.blockers[0]?.message ??
            input.confidence_readiness.warnings[0]?.message ??
            "Calibration readiness is diagnostic only.",
        }),
      ],
    }),
    section({
      section_id: "improvement_priority",
      title: "Improvement priority",
      status: recBacklogStatus,
      summary: input.improvement_backlog.next_recommended_action,
      signals: [
        signal({
          signal_id: nextAction.action_id,
          label: nextAction.label,
          value: nextAction.priority,
          formatted_value: nextAction.priority,
          status: recBacklogStatus,
          message: nextAction.message,
        }),
      ],
    }),
  ];

  const topSignals = [
    sections[0]?.signals[0],
    sections[1]?.signals[0],
    sections[2]?.signals[0],
    sections[3]?.signals[0],
    sections[8]?.signals[0],
    sections[9]?.signals[0],
  ].filter((item): item is RecommendationEngineControlCenterSignal => item !== undefined);

  return {
    summary_id: `recommendation_engine_control_center_${now.toISOString()}`,
    summary_version: "1.0",
    generated_at: now.toISOString(),
    overall_status: overall,
    overall_message: marketWaitState ? waitStateMessage(input) : statusMessage(overall),
    top_signals: topSignals.slice(0, 6),
    warnings: collectWarnings(input),
    next_action: nextAction,
    sections,
    source_metrics: {
      visible_recommendations: input.scan_observability.visible_recommendation_count,
      current_window_target_status: input.day_trade_window_target.status,
      scan_run_target_hit_rate: input.scan_run_history.target_hit_rate,
      evaluated_recommendations: performance.evaluated_recommendations,
      total_recommendations: performance.total_recommendations,
      confidence_readiness_status: input.confidence_readiness.status,
      sample_quality_status: input.sample_quality.status,
      backlog_status: input.improvement_backlog.overall_status,
    },
    copy: {
      purpose:
        "Engine Control Center summarizes Ture's recommendation engine health. It does not change scoring.",
      learning_dependency:
        "Learning status depends on evaluated recommendation outcomes.",
      data_first:
        marketWaitState
          ? "Closed market is a wait state, not a scanner failure."
          : "When data is thin, the best next step is usually more clean evaluated samples.",
    },
  };
}

export function recommendationEngineControlCenterSummaryJson(
  summary: RecommendationEngineControlCenterSummary,
) {
  return JSON.stringify(summary, null, 2);
}
