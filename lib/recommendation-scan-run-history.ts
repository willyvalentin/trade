import type {
  RecommendationScanRun,
  RecommendationScanRunStatus,
  RecommendationScanRunWindow,
} from "@/lib/recommendation-scan-run";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export type RecommendationScanRunHistoryMetric = {
  metric_id: string;
  label: string;
  value: number | null;
  formatted_value: string;
};

export type RecommendationScanRunHistoryStatusBreakdown = {
  status: RecommendationScanRunStatus;
  count: number;
  rate: number | null;
};

export type RecommendationScanRunHistoryWindowBreakdown = {
  window: RecommendationScanRunWindow;
  scan_run_count: number;
  target_hit_count: number;
  target_hit_rate: number | null;
  average_visible_recommendations: number | null;
  average_strong_count: number | null;
  average_valid_count: number | null;
  average_experimental_count: number | null;
  degraded_stale_empty_count: number;
  degraded_stale_empty_rate: number | null;
  warning_count: number;
  sample_quality_note: string;
};

export type RecommendationScanRunHistoryWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type RecommendationScanRunHistoryItem = {
  id: string;
  run_fingerprint: string;
  observed_at: string;
  trading_date: string | null;
  window: RecommendationScanRunWindow;
  status: RecommendationScanRunStatus;
  visible_recommendation_count: number;
  strong_count: number;
  valid_count: number;
  experimental_count: number;
  target_status: string;
  scan_observability_status: string;
  data_mode: string;
  source: string;
  warning_count: number;
  top_warning: string | null;
};

export type RecommendationScanRunHistoryFilter = {
  window?: RecommendationScanRunWindow | "all";
  status?: RecommendationScanRunStatus | "all";
  range?: StatisticsTimeRange;
};

export type RecommendationScanRunHistorySort = "newest" | "oldest";

export type RecommendationScanRunHistorySummary = {
  summary_id: string;
  summary_version: "1.0";
  generated_at: string;
  source_scope: "supabase" | "localStorage" | "current_visible" | "mixed";
  range: StatisticsTimeRange;
  total_scan_runs: number;
  latest_run_timestamp: string | null;
  latest_run_status: RecommendationScanRunStatus | "unknown";
  average_visible_recommendation_count: number | null;
  median_visible_recommendation_count: number | null;
  average_strong_count: number | null;
  average_valid_count: number | null;
  average_experimental_count: number | null;
  average_rejected_incomplete_unknown_tier_count: number | null;
  target_hit_count: number;
  target_hit_rate: number | null;
  below_target_count: number;
  below_target_rate: number | null;
  above_target_count: number;
  above_target_rate: number | null;
  average_gap_to_target: number | null;
  average_overflow_above_target: number | null;
  stale_candidate_run_count: number;
  incomplete_data_run_count: number;
  provider_warning_run_count: number;
  unknown_metric_run_count: number;
  status_breakdown: RecommendationScanRunHistoryStatusBreakdown[];
  window_breakdown: RecommendationScanRunHistoryWindowBreakdown[];
  top_warnings: Array<{
    warning_id: string;
    label: string;
    message: string;
    count: number;
  }>;
  metrics: RecommendationScanRunHistoryMetric[];
  recent_items: RecommendationScanRunHistoryItem[];
  warnings: RecommendationScanRunHistoryWarning[];
  copy: {
    purpose: string;
    disclaimer: string;
    unknown_metrics: string;
  };
};

type RecommendationScanRunHistoryInput = {
  scan_runs: RecommendationScanRun[];
  range?: StatisticsTimeRange;
  filter?: RecommendationScanRunHistoryFilter;
  sort?: RecommendationScanRunHistorySort;
  now?: Date | string;
  source_scope?: RecommendationScanRunHistorySummary["source_scope"];
};

const statuses: RecommendationScanRunStatus[] = [
  "completed",
  "partial",
  "degraded",
  "stale",
  "empty",
  "failed",
  "unknown",
];

const windows: RecommendationScanRunWindow[] = [
  "morning",
  "midday",
  "power_hour",
  "closed",
  "outside_window",
  "unknown",
];

function timestampMs(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function finiteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function average(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  if (finiteValues.length === 0) {
    return null;
  }

  return finiteValues.reduce((total, value) => total + value, 0) / finiteValues.length;
}

function median(values: Array<number | null | undefined>) {
  const finiteValues = values
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .sort((first, second) => first - second);

  if (finiteValues.length === 0) {
    return null;
  }

  const middle = Math.floor(finiteValues.length / 2);

  if (finiteValues.length % 2 === 1) {
    return finiteValues[middle] ?? null;
  }

  return ((finiteValues[middle - 1] ?? 0) + (finiteValues[middle] ?? 0)) / 2;
}

function rate(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : null;
}

function formatNumber(value: number | null) {
  return value === null || !Number.isFinite(value) ? "Unknown" : value.toFixed(1);
}

function formatPercent(value: number | null) {
  return value === null || !Number.isFinite(value) ? "Unknown" : `${value.toFixed(1)}%`;
}

function rangeBounds(range: StatisticsTimeRange, now: Date) {
  if (range === "all") {
    return null;
  }

  const end = now.getTime();
  const start = new Date(now);

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end };
  }

  if (range === "this_month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end };
  }

  if (range === "this_week") {
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end };
  }

  if (range === "last_trading_week") {
    const day = start.getDay();
    const mondayOffset = day === 0 ? -13 : -6 - day;
    start.setDate(start.getDate() + mondayOffset);
    start.setHours(0, 0, 0, 0);
    const lastFriday = new Date(start);
    lastFriday.setDate(start.getDate() + 4);
    lastFriday.setHours(23, 59, 59, 999);
    return { start: start.getTime(), end: lastFriday.getTime() };
  }

  start.setDate(start.getDate() - (range === "last_30_days" ? 30 : 7));
  return { start: start.getTime(), end };
}

function filterByRange(
  scanRuns: RecommendationScanRun[],
  range: StatisticsTimeRange,
  now: Date,
) {
  const bounds = rangeBounds(range, now);

  if (bounds === null) {
    return [...scanRuns];
  }

  return scanRuns.filter((scanRun) => {
    const timestamp = timestampMs(scanRun.observed_at) ?? timestampMs(scanRun.created_at);
    return (
      timestamp !== null &&
      timestamp >= bounds.start &&
      timestamp <= bounds.end
    );
  });
}

function targetHit(scanRun: RecommendationScanRun) {
  return (
    scanRun.window_target_status === "within_target" ||
    scanRun.window_target_status === "above_target"
  );
}

function rejectedIncompleteUnknownTierCount(scanRun: RecommendationScanRun) {
  return (
    scanRun.counts.rejected_tier_count +
    scanRun.counts.incomplete_tier_count +
    scanRun.counts.unknown_tier_count
  );
}

function hasProviderWarning(scanRun: RecommendationScanRun) {
  return (
    scanRun.provider_statuses.some((provider) => provider.status !== "available") ||
    scanRun.warnings.some((warning) => warning.source === "provider_status")
  );
}

function statusBreakdown(
  scanRuns: RecommendationScanRun[],
): RecommendationScanRunHistoryStatusBreakdown[] {
  return statuses.map((status) => {
    const count = scanRuns.filter((scanRun) => scanRun.status === status).length;
    return { status, count, rate: rate(count, scanRuns.length) };
  });
}

function sampleQualityNote(scanRuns: RecommendationScanRun[]) {
  if (scanRuns.length === 0) {
    return "No stored scan runs for this window yet.";
  }

  if (scanRuns.length < 5) {
    return "Sample is thin. Use as early diagnostics only.";
  }

  const targetRate = rate(scanRuns.filter(targetHit).length, scanRuns.length) ?? 0;

  if (targetRate >= 70) {
    return "Window is usually meeting the 6-10 recommendation target.";
  }

  if (targetRate < 40) {
    return "Window is often outside the 6-10 recommendation target.";
  }

  return "Window has mixed target coverage.";
}

function windowBreakdown(
  scanRuns: RecommendationScanRun[],
): RecommendationScanRunHistoryWindowBreakdown[] {
  return windows.map((window) => {
    const windowRuns = scanRuns.filter((scanRun) => scanRun.window === window);
    const targetHitCount = windowRuns.filter(targetHit).length;
    const degradedStaleEmptyCount = windowRuns.filter(
      (scanRun) =>
        scanRun.status === "degraded" ||
        scanRun.status === "stale" ||
        scanRun.status === "empty",
    ).length;

    return {
      window,
      scan_run_count: windowRuns.length,
      target_hit_count: targetHitCount,
      target_hit_rate: rate(targetHitCount, windowRuns.length),
      average_visible_recommendations: average(
        windowRuns.map((scanRun) => scanRun.counts.visible_recommendation_count),
      ),
      average_strong_count: average(
        windowRuns.map((scanRun) => scanRun.counts.strong_count),
      ),
      average_valid_count: average(
        windowRuns.map((scanRun) => scanRun.counts.valid_count),
      ),
      average_experimental_count: average(
        windowRuns.map((scanRun) => scanRun.counts.experimental_count),
      ),
      degraded_stale_empty_count: degradedStaleEmptyCount,
      degraded_stale_empty_rate: rate(degradedStaleEmptyCount, windowRuns.length),
      warning_count: windowRuns.reduce(
        (total, scanRun) => total + scanRun.warnings.length,
        0,
      ),
      sample_quality_note: sampleQualityNote(windowRuns),
    };
  });
}

function topWarnings(scanRuns: RecommendationScanRun[]) {
  const counts = new Map<
    string,
    { warning_id: string; label: string; message: string; count: number }
  >();

  for (const scanRun of scanRuns) {
    for (const warning of scanRun.warnings) {
      const existing = counts.get(warning.warning_id);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(warning.warning_id, {
          warning_id: warning.warning_id,
          label: warning.label,
          message: warning.message,
          count: 1,
        });
      }
    }
  }

  return Array.from(counts.values())
    .sort((first, second) => second.count - first.count)
    .slice(0, 8);
}

function toItem(scanRun: RecommendationScanRun): RecommendationScanRunHistoryItem {
  return {
    id: scanRun.id,
    run_fingerprint: scanRun.run_fingerprint,
    observed_at: scanRun.observed_at,
    trading_date: scanRun.trading_date,
    window: scanRun.window,
    status: scanRun.status,
    visible_recommendation_count: scanRun.counts.visible_recommendation_count,
    strong_count: scanRun.counts.strong_count,
    valid_count: scanRun.counts.valid_count,
    experimental_count: scanRun.counts.experimental_count,
    target_status: scanRun.window_target_status,
    scan_observability_status: scanRun.scan_observability_status,
    data_mode: scanRun.data_mode,
    source: scanRun.source,
    warning_count: scanRun.warnings.length,
    top_warning: scanRun.warnings[0]?.message ?? null,
  };
}

function buildWarnings(
  scanRuns: RecommendationScanRun[],
  summary: {
    targetHitRate: number | null;
    degradedStaleEmptyCount: number;
    providerWarningRunCount: number;
    unknownMetricRunCount: number;
  },
): RecommendationScanRunHistoryWarning[] {
  const warnings: RecommendationScanRunHistoryWarning[] = [];

  if (scanRuns.length === 0) {
    warnings.push({
      warning_id: "no_scan_run_history",
      severity: "info",
      message: "No stored recommendation scan runs are available for this range yet.",
    });
  } else if (scanRuns.length < 5) {
    warnings.push({
      warning_id: "thin_scan_run_history",
      severity: "info",
      message: "Scan-run history is still thin. Treat trends as early diagnostics only.",
    });
  }

  if (summary.targetHitRate !== null && summary.targetHitRate < 50) {
    warnings.push({
      warning_id: "window_target_often_missed",
      severity: "warning",
      message: "Fewer than half of stored scan runs are meeting the 6-10 recommendation target.",
    });
  }

  if (summary.degradedStaleEmptyCount > 0) {
    warnings.push({
      warning_id: "degraded_stale_empty_runs_present",
      severity: "warning",
      message: "Some scan runs are degraded, stale, or empty. Review provider and freshness diagnostics.",
    });
  }

  if (summary.providerWarningRunCount > 0) {
    warnings.push({
      warning_id: "provider_warnings_present",
      severity: "warning",
      message: "Provider/source warnings appear in scan-run history.",
    });
  }

  if (summary.unknownMetricRunCount > 0) {
    warnings.push({
      warning_id: "unknown_metrics_present",
      severity: "info",
      message: "Some scan runs still contain unknown metrics, limiting scanner analysis.",
    });
  }

  return warnings;
}

export function buildRecommendationScanRunHistorySummary(
  input: RecommendationScanRunHistoryInput,
): RecommendationScanRunHistorySummary {
  const now =
    input.now instanceof Date
      ? input.now
      : typeof input.now === "string"
        ? new Date(input.now)
        : new Date();
  const safeNow = Number.isFinite(now.getTime()) ? now : new Date();
  const range = input.filter?.range ?? input.range ?? "all";
  const uniqueScanRuns = Array.from(
    new Map(
      input.scan_runs.map((scanRun) => [scanRun.run_fingerprint, scanRun]),
    ).values(),
  );
  const rangedRuns = filterByRange(uniqueScanRuns, range, safeNow);
  const filteredRuns = rangedRuns
    .filter(
      (scanRun) =>
        !input.filter?.window ||
        input.filter.window === "all" ||
        scanRun.window === input.filter.window,
    )
    .filter(
      (scanRun) =>
        !input.filter?.status ||
        input.filter.status === "all" ||
        scanRun.status === input.filter.status,
    );
  const sortedRuns = [...filteredRuns].sort((first, second) => {
    const firstTimestamp = timestampMs(first.observed_at) ?? 0;
    const secondTimestamp = timestampMs(second.observed_at) ?? 0;
    return input.sort === "oldest"
      ? firstTimestamp - secondTimestamp
      : secondTimestamp - firstTimestamp;
  });
  const latestRun = [...filteredRuns].sort(
    (first, second) =>
      (timestampMs(second.observed_at) ?? 0) - (timestampMs(first.observed_at) ?? 0),
  )[0];
  const total = filteredRuns.length;
  const targetHitCount = filteredRuns.filter(targetHit).length;
  const belowTargetCount = filteredRuns.filter(
    (scanRun) => scanRun.window_target_status === "below_target",
  ).length;
  const aboveTargetCount = filteredRuns.filter(
    (scanRun) => scanRun.window_target_status === "above_target",
  ).length;
  const degradedStaleEmptyCount = filteredRuns.filter(
    (scanRun) =>
      scanRun.status === "degraded" ||
      scanRun.status === "stale" ||
      scanRun.status === "empty",
  ).length;
  const providerWarningRunCount = filteredRuns.filter(hasProviderWarning).length;
  const unknownMetricRunCount = filteredRuns.filter(
    (scanRun) => scanRun.unknown_metrics.length > 0,
  ).length;
  const targetHitRate = rate(targetHitCount, total);
  const avgVisible = average(
    filteredRuns.map((scanRun) => scanRun.counts.visible_recommendation_count),
  );
  const medVisible = median(
    filteredRuns.map((scanRun) => scanRun.counts.visible_recommendation_count),
  );
  const avgStrong = average(
    filteredRuns.map((scanRun) => scanRun.counts.strong_count),
  );
  const avgValid = average(
    filteredRuns.map((scanRun) => scanRun.counts.valid_count),
  );
  const avgExperimental = average(
    filteredRuns.map((scanRun) => scanRun.counts.experimental_count),
  );
  const avgRejectedIncompleteUnknown = average(
    filteredRuns.map(rejectedIncompleteUnknownTierCount),
  );
  const avgGap = average(filteredRuns.map((scanRun) => scanRun.gap_to_target));
  const avgOverflow = average(
    filteredRuns.map((scanRun) => scanRun.overflow_above_target),
  );

  const warningInputs = {
    targetHitRate,
    degradedStaleEmptyCount,
    providerWarningRunCount,
    unknownMetricRunCount,
  };

  return {
    summary_id: `recommendation_scan_run_history_${safeNow.toISOString()}`,
    summary_version: "1.0",
    generated_at: safeNow.toISOString(),
    source_scope: input.source_scope ?? "mixed",
    range,
    total_scan_runs: total,
    latest_run_timestamp: latestRun?.observed_at ?? null,
    latest_run_status: latestRun?.status ?? "unknown",
    average_visible_recommendation_count: avgVisible,
    median_visible_recommendation_count: medVisible,
    average_strong_count: avgStrong,
    average_valid_count: avgValid,
    average_experimental_count: avgExperimental,
    average_rejected_incomplete_unknown_tier_count:
      avgRejectedIncompleteUnknown,
    target_hit_count: targetHitCount,
    target_hit_rate: targetHitRate,
    below_target_count: belowTargetCount,
    below_target_rate: rate(belowTargetCount, total),
    above_target_count: aboveTargetCount,
    above_target_rate: rate(aboveTargetCount, total),
    average_gap_to_target: avgGap,
    average_overflow_above_target: avgOverflow,
    stale_candidate_run_count: filteredRuns.filter(
      (scanRun) => (finiteNumber(scanRun.stale_candidate_count) ?? 0) > 0,
    ).length,
    incomplete_data_run_count: filteredRuns.filter(
      (scanRun) => (finiteNumber(scanRun.incomplete_data_candidate_count) ?? 0) > 0,
    ).length,
    provider_warning_run_count: providerWarningRunCount,
    unknown_metric_run_count: unknownMetricRunCount,
    status_breakdown: statusBreakdown(filteredRuns),
    window_breakdown: windowBreakdown(filteredRuns),
    top_warnings: topWarnings(filteredRuns),
    metrics: [
      {
        metric_id: "target_hit_rate",
        label: "Target hit rate",
        value: targetHitRate,
        formatted_value: formatPercent(targetHitRate),
      },
      {
        metric_id: "average_recommendations_per_run",
        label: "Avg recommendations/run",
        value: avgVisible,
        formatted_value: formatNumber(avgVisible),
      },
      {
        metric_id: "median_recommendations_per_run",
        label: "Median recommendations/run",
        value: medVisible,
        formatted_value: formatNumber(medVisible),
      },
      {
        metric_id: "degraded_stale_empty_runs",
        label: "Degraded/stale/empty runs",
        value: degradedStaleEmptyCount,
        formatted_value: String(degradedStaleEmptyCount),
      },
    ],
    recent_items: sortedRuns.slice(0, 20).map(toItem),
    warnings: buildWarnings(filteredRuns, warningInputs),
    copy: {
      purpose:
        "Scan Run History explains how the recommendation pipeline behaved over time.",
      disclaimer: "It does not measure trade profitability directly.",
      unknown_metrics: "Unknown metrics are shown as unknown rather than guessed.",
    },
  };
}

export function recommendationScanRunHistorySummaryJson(
  summary: RecommendationScanRunHistorySummary,
) {
  return JSON.stringify(summary, null, 2);
}
