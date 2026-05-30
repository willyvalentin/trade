import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export type RecommendationPerformanceMetric = {
  metric_id: string;
  label: string;
  value: number | null;
  unit: "count" | "percent" | "r_multiple" | "minutes" | "price" | "none";
};

export type RecommendationPerformanceWarning = {
  warning_id: string;
  severity: "info" | "warning";
  message: string;
};

export type RecommendationPerformanceOutcomeBreakdown = {
  entry_triggered: number;
  target_hit: number;
  stop_hit: number;
  target_before_stop: number;
  stop_before_target: number;
  neither_hit: number;
  entry_not_triggered: number;
  expired: number;
  pending: number;
  incomplete: number;
  unknown: number;
};

export type RecommendationPerformanceBucket = {
  bucket_id: string;
  label: string;
  recommendation_count: number;
  evaluated_count: number;
  entry_trigger_rate: number | null;
  target_before_stop_rate: number | null;
  stop_before_target_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_eod_r: number | null;
};

export type RecommendationPerformanceConfidenceBucket =
  RecommendationPerformanceBucket & {
    confidence_min: number | null;
    confidence_max: number | null;
  };

export type RecommendationPerformanceWindowBreakdown =
  RecommendationPerformanceBucket & {
    window: "morning" | "midday" | "power_hour" | "unknown";
  };

export type RecommendationPerformanceTakenVsIgnoredBreakdown =
  RecommendationPerformanceBucket & {
    cohort: "taken" | "ignored_or_not_taken" | "unknown";
  };

export type RecommendationPerformanceSummary = {
  total_recommendations: number;
  evaluated_recommendations: number;
  pending_outcomes: number;
  incomplete_outcomes: number;
  unknown_outcomes: number;
  entry_triggered_count: number;
  entry_triggered_rate: number | null;
  target_hit_count: number;
  target_hit_rate: number | null;
  stop_hit_count: number;
  stop_hit_rate: number | null;
  target_before_stop_count: number;
  target_before_stop_rate: number | null;
  stop_before_target_count: number;
  stop_before_target_rate: number | null;
  neither_hit_count: number;
  neither_hit_rate: number | null;
  expired_count: number;
  expired_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_eod_r: number | null;
  average_mfe: number | null;
  average_mae: number | null;
  average_time_to_entry_minutes: number | null;
  average_time_to_target_minutes: number | null;
  average_time_to_stop_minutes: number | null;
  expectancy_proxy_r: number | null;
  taken_count: number;
  ignored_count: number;
};

export type RecommendationPerformanceStatistics = {
  statistics_id: string;
  statistics_version: "1.0";
  generated_at: string;
  range: StatisticsTimeRange;
  source_scope: "current_visible" | "local_history" | "mixed" | "unknown";
  summary: RecommendationPerformanceSummary;
  metrics: RecommendationPerformanceMetric[];
  outcome_breakdown: RecommendationPerformanceOutcomeBreakdown;
  confidence_buckets: RecommendationPerformanceConfidenceBucket[];
  window_breakdown: RecommendationPerformanceWindowBreakdown[];
  taken_vs_ignored: RecommendationPerformanceTakenVsIgnoredBreakdown[];
  warnings: RecommendationPerformanceWarning[];
  copy: {
    purpose: string;
    sample_size: string;
    incomplete: string;
    calibration: string;
  };
};

export type RecommendationPerformanceStatisticsInput = {
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  range?: StatisticsTimeRange;
  now?: Date | string | null;
  source_scope?: RecommendationPerformanceStatistics["source_scope"];
};

type JoinedRecommendationOutcome = {
  snapshot: RecommendationSnapshot;
  outcome: RecommendationOutcome | null;
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

function timestampMs(value: string | null | undefined) {
  return toDate(value)?.getTime() ?? null;
}

function startOfDay(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

function rangeBounds(range: StatisticsTimeRange, now: Date) {
  if (range === "all") {
    return null;
  }

  const start = startOfDay(now);

  if (range === "today") {
    return { start: start.getTime(), end: now.getTime() };
  }

  if (range === "this_week") {
    const day = start.getDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - offset);
    return { start: start.getTime(), end: now.getTime() };
  }

  if (range === "this_month") {
    start.setDate(1);
    return { start: start.getTime(), end: now.getTime() };
  }

  if (range === "last_trading_week") {
    const end = startOfDay(now);
    const day = end.getDay();
    const offset = day === 0 ? 6 : day - 1;
    end.setDate(end.getDate() - offset);
    const lastWeekStart = new Date(end);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    return { start: lastWeekStart.getTime(), end: end.getTime() };
  }

  const dayCount = range === "last_30_days" ? 30 : 7;
  start.setDate(start.getDate() - dayCount);
  return { start: start.getTime(), end: now.getTime() };
}

function filterSnapshotsByRange(
  snapshots: RecommendationSnapshot[],
  range: StatisticsTimeRange,
  now: Date,
) {
  const bounds = rangeBounds(range, now);

  if (bounds === null) {
    return snapshots;
  }

  return snapshots.filter((snapshot) => {
    const timestamp =
      timestampMs(snapshot.recommended_at) ?? timestampMs(snapshot.created_at);
    return (
      timestamp !== null &&
      timestamp >= bounds.start &&
      timestamp <= bounds.end
    );
  });
}

function latestOutcomeForSnapshot(
  snapshot: RecommendationSnapshot,
  outcomes: RecommendationOutcome[],
) {
  return outcomes
    .filter(
      (outcome) =>
        outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint ||
        (snapshot.recommendation_id !== null &&
          outcome.recommendation_id === snapshot.recommendation_id),
    )
    .sort((first, second) => {
      const firstScore = outcomePriority(first);
      const secondScore = outcomePriority(second);

      if (secondScore !== firstScore) {
        return secondScore - firstScore;
      }

      return (
        (timestampMs(second.evaluated_at) ?? 0) -
        (timestampMs(first.evaluated_at) ?? 0)
      );
    })[0] ?? null;
}

function outcomePriority(outcome: RecommendationOutcome) {
  if (evaluatedStatuses.has(outcome.status)) return 3;
  if (outcome.status === "unknown") return 2;
  if (outcome.status === "incomplete") return 1;
  return 0;
}

function isEvaluated(outcome: RecommendationOutcome | null) {
  return outcome !== null && evaluatedStatuses.has(outcome.status);
}

function targetBeforeStop(outcome: RecommendationOutcome | null) {
  return (
    outcome?.status === "target_before_stop" ||
    outcome?.first_terminal_event === "target_hit"
  );
}

function stopBeforeTarget(outcome: RecommendationOutcome | null) {
  return (
    outcome?.status === "stop_before_target" ||
    outcome?.first_terminal_event === "stop_hit"
  );
}

function hasTargetHit(outcome: RecommendationOutcome | null) {
  return outcome?.target_hit === true || targetBeforeStop(outcome);
}

function hasStopHit(outcome: RecommendationOutcome | null) {
  return outcome?.stop_hit === true || stopBeforeTarget(outcome);
}

function confidenceValue(snapshot: RecommendationSnapshot) {
  const direct = finiteNumber(snapshot.confidence);
  const score = finiteNumber(snapshot.score);
  return direct ?? score;
}

function confidenceBucketId(snapshot: RecommendationSnapshot) {
  const confidence = confidenceValue(snapshot);

  if (confidence === null) return "unknown";
  if (confidence < 40) return "0_39";
  if (confidence < 60) return "40_59";
  if (confidence < 75) return "60_74";
  if (confidence < 90) return "75_89";
  return "90_100";
}

function windowId(snapshot: RecommendationSnapshot) {
  if (
    snapshot.window === "morning" ||
    snapshot.window === "midday" ||
    snapshot.window === "power_hour"
  ) {
    return snapshot.window;
  }

  return "unknown";
}

function takenBucketId(snapshot: RecommendationSnapshot) {
  if (snapshot.was_taken || snapshot.status === "taken") {
    return "taken";
  }

  if (
    snapshot.status === "ignored" ||
    snapshot.status === "visible" ||
    snapshot.status === "hidden" ||
    snapshot.status === "expired"
  ) {
    return "ignored_or_not_taken";
  }

  return "unknown";
}

function buildBucket(
  bucketId: string,
  label: string,
  joined: JoinedRecommendationOutcome[],
): RecommendationPerformanceBucket {
  const evaluated = joined.filter((item) => isEvaluated(item.outcome));
  const evaluatedCount = evaluated.length;

  return {
    bucket_id: bucketId,
    label,
    recommendation_count: joined.length,
    evaluated_count: evaluatedCount,
    entry_trigger_rate: percent(
      evaluated.filter((item) => item.outcome?.entry_triggered === true).length,
      evaluatedCount,
    ),
    target_before_stop_rate: percent(
      evaluated.filter((item) => targetBeforeStop(item.outcome)).length,
      evaluatedCount,
    ),
    stop_before_target_rate: percent(
      evaluated.filter((item) => stopBeforeTarget(item.outcome)).length,
      evaluatedCount,
    ),
    average_best_r: average(evaluated.map((item) => item.outcome?.best_r)),
    average_worst_r: average(evaluated.map((item) => item.outcome?.worst_r)),
    average_eod_r: average(evaluated.map((item) => item.outcome?.eod_r)),
  };
}

function warning(
  warning_id: string,
  message: string,
  severity: "info" | "warning" = "warning",
): RecommendationPerformanceWarning {
  return { warning_id, message, severity };
}

function metric(
  metric_id: string,
  label: string,
  value: number | null,
  unit: RecommendationPerformanceMetric["unit"],
): RecommendationPerformanceMetric {
  return { metric_id, label, value, unit };
}

export function buildRecommendationPerformanceStatistics(
  input: RecommendationPerformanceStatisticsInput,
): RecommendationPerformanceStatistics {
  const now = toDate(input.now ?? null) ?? new Date();
  const range = input.range ?? "all";
  const uniqueSnapshots = Array.from(
    new Map(
      input.snapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]),
    ).values(),
  );
  const snapshots = filterSnapshotsByRange(uniqueSnapshots, range, now);
  const joined = snapshots.map((snapshot) => ({
    snapshot,
    outcome: latestOutcomeForSnapshot(snapshot, input.outcomes),
  }));
  const evaluated = joined.filter((item) => isEvaluated(item.outcome));
  const evaluatedCount = evaluated.length;
  const total = snapshots.length;
  const pendingCount = joined.filter(
    (item) => item.outcome?.status === "pending" || item.outcome === null,
  ).length;
  const incompleteCount = joined.filter(
    (item) => item.outcome?.status === "incomplete" || item.outcome?.status === "invalid",
  ).length;
  const unknownCount = joined.filter(
    (item) => item.outcome?.status === "unknown",
  ).length;
  const entryTriggeredCount = evaluated.filter(
    (item) => item.outcome?.entry_triggered === true,
  ).length;
  const targetHitCount = evaluated.filter((item) => hasTargetHit(item.outcome)).length;
  const stopHitCount = evaluated.filter((item) => hasStopHit(item.outcome)).length;
  const targetBeforeStopCount = evaluated.filter((item) =>
    targetBeforeStop(item.outcome),
  ).length;
  const stopBeforeTargetCount = evaluated.filter((item) =>
    stopBeforeTarget(item.outcome),
  ).length;
  const neitherHitCount = evaluated.filter(
    (item) => item.outcome?.status === "neither_hit",
  ).length;
  const expiredCount = evaluated.filter(
    (item) => item.outcome?.status === "expired",
  ).length;
  const summary: RecommendationPerformanceSummary = {
    total_recommendations: total,
    evaluated_recommendations: evaluatedCount,
    pending_outcomes: pendingCount,
    incomplete_outcomes: incompleteCount,
    unknown_outcomes: unknownCount,
    entry_triggered_count: entryTriggeredCount,
    entry_triggered_rate: percent(entryTriggeredCount, evaluatedCount),
    target_hit_count: targetHitCount,
    target_hit_rate: percent(targetHitCount, evaluatedCount),
    stop_hit_count: stopHitCount,
    stop_hit_rate: percent(stopHitCount, evaluatedCount),
    target_before_stop_count: targetBeforeStopCount,
    target_before_stop_rate: percent(targetBeforeStopCount, evaluatedCount),
    stop_before_target_count: stopBeforeTargetCount,
    stop_before_target_rate: percent(stopBeforeTargetCount, evaluatedCount),
    neither_hit_count: neitherHitCount,
    neither_hit_rate: percent(neitherHitCount, evaluatedCount),
    expired_count: expiredCount,
    expired_rate: percent(expiredCount, evaluatedCount),
    average_best_r: average(evaluated.map((item) => item.outcome?.best_r)),
    average_worst_r: average(evaluated.map((item) => item.outcome?.worst_r)),
    average_eod_r: average(evaluated.map((item) => item.outcome?.eod_r)),
    average_mfe: average(
      evaluated.map((item) => item.outcome?.max_favorable_excursion),
    ),
    average_mae: average(
      evaluated.map((item) => item.outcome?.max_adverse_excursion),
    ),
    average_time_to_entry_minutes: average(
      evaluated.map((item) => item.outcome?.time_to_entry_minutes),
    ),
    average_time_to_target_minutes: average(
      evaluated.map((item) => item.outcome?.time_to_target_minutes),
    ),
    average_time_to_stop_minutes: average(
      evaluated.map((item) => item.outcome?.time_to_stop_minutes),
    ),
    expectancy_proxy_r: average(
      evaluated.map(
        (item) =>
          item.outcome?.eod_r ??
          (targetBeforeStop(item.outcome)
            ? item.outcome?.best_r
            : stopBeforeTarget(item.outcome)
              ? item.outcome?.worst_r
              : null),
      ),
    ),
    taken_count: snapshots.filter((snapshot) => takenBucketId(snapshot) === "taken")
      .length,
    ignored_count: snapshots.filter(
      (snapshot) => takenBucketId(snapshot) === "ignored_or_not_taken",
    ).length,
  };
  const outcomeBreakdown: RecommendationPerformanceOutcomeBreakdown = {
    entry_triggered: entryTriggeredCount,
    target_hit: targetHitCount,
    stop_hit: stopHitCount,
    target_before_stop: targetBeforeStopCount,
    stop_before_target: stopBeforeTargetCount,
    neither_hit: neitherHitCount,
    entry_not_triggered: evaluated.filter(
      (item) => item.outcome?.status === "entry_not_triggered",
    ).length,
    expired: expiredCount,
    pending: pendingCount,
    incomplete: incompleteCount,
    unknown: unknownCount,
  };
  const confidenceBuckets = [
    { id: "0_39", label: "0-39", min: 0, max: 39 },
    { id: "40_59", label: "40-59", min: 40, max: 59 },
    { id: "60_74", label: "60-74", min: 60, max: 74 },
    { id: "75_89", label: "75-89", min: 75, max: 89 },
    { id: "90_100", label: "90-100", min: 90, max: 100 },
    { id: "unknown", label: "Unknown", min: null, max: null },
  ].map((bucket): RecommendationPerformanceConfidenceBucket => ({
    ...buildBucket(
      bucket.id,
      bucket.label,
      joined.filter((item) => confidenceBucketId(item.snapshot) === bucket.id),
    ),
    confidence_min: bucket.min,
    confidence_max: bucket.max,
  }));
  const windowBreakdown = ["morning", "midday", "power_hour", "unknown"].map(
    (bucket): RecommendationPerformanceWindowBreakdown => ({
      ...buildBucket(
        bucket,
        bucket.replace(/_/g, " ").toUpperCase(),
        joined.filter((item) => windowId(item.snapshot) === bucket),
      ),
      window: bucket as RecommendationPerformanceWindowBreakdown["window"],
    }),
  );
  const takenVsIgnored = [
    { id: "taken", label: "Taken" },
    { id: "ignored_or_not_taken", label: "Ignored / not taken" },
    { id: "unknown", label: "Unknown" },
  ].map((bucket): RecommendationPerformanceTakenVsIgnoredBreakdown => ({
    ...buildBucket(
      bucket.id,
      bucket.label,
      joined.filter((item) => takenBucketId(item.snapshot) === bucket.id),
    ),
    cohort: bucket.id as RecommendationPerformanceTakenVsIgnoredBreakdown["cohort"],
  }));
  const warnings: RecommendationPerformanceWarning[] = [];
  const missingConfidence = snapshots.filter(
    (snapshot) => confidenceValue(snapshot) === null,
  ).length;
  const missingWindow = snapshots.filter((snapshot) => windowId(snapshot) === "unknown")
    .length;
  const eodValues = evaluated.filter((item) => item.outcome?.eod_r !== null).length;

  if (evaluatedCount < 10) {
    warnings.push(
      warning(
        "small_sample_size",
        "Early sample sizes may be too small to trust.",
        "info",
      ),
    );
  }

  if (incompleteCount > 0) {
    warnings.push(
      warning(
        "incomplete_outcomes",
        `${incompleteCount} recommendation outcome${incompleteCount === 1 ? "" : "s"} are incomplete and excluded from evaluated rates.`,
      ),
    );
  }

  if (pendingCount > 0) {
    warnings.push(
      warning(
        "pending_outcomes",
        `${pendingCount} recommendation outcome${pendingCount === 1 ? "" : "s"} are still pending evaluation.`,
        "info",
      ),
    );
  }

  if (missingConfidence > 0) {
    warnings.push(
      warning(
        "missing_confidence",
        `${missingConfidence} recommendation${missingConfidence === 1 ? "" : "s"} are missing confidence values.`,
        "info",
      ),
    );
  }

  if (missingWindow > 0) {
    warnings.push(
      warning(
        "missing_windows",
        `${missingWindow} recommendation${missingWindow === 1 ? "" : "s"} are missing day trade window labels.`,
        "info",
      ),
    );
  }

  if (eodValues === 0 && evaluatedCount > 0) {
    warnings.push(
      warning(
        "eod_unavailable",
        "EOD R is not available yet for evaluated recommendations.",
        "info",
      ),
    );
  }

  return {
    statistics_id: `recommendation_performance:${range}:${now.toISOString()}`,
    statistics_version: "1.0",
    generated_at: now.toISOString(),
    range,
    source_scope: input.source_scope ?? "unknown",
    summary,
    metrics: [
      metric("total_recommendations", "Total recommendations", total, "count"),
      metric("evaluated_recommendations", "Evaluated", evaluatedCount, "count"),
      metric("entry_triggered_rate", "Entry-trigger rate", summary.entry_triggered_rate, "percent"),
      metric("target_before_stop_rate", "Target-before-stop", summary.target_before_stop_rate, "percent"),
      metric("stop_before_target_rate", "Stop-before-target", summary.stop_before_target_rate, "percent"),
      metric("average_best_r", "Avg best R", summary.average_best_r, "r_multiple"),
      metric("average_worst_r", "Avg worst R", summary.average_worst_r, "r_multiple"),
      metric("pending_incomplete", "Pending + incomplete", pendingCount + incompleteCount, "count"),
    ],
    outcome_breakdown: outcomeBreakdown,
    confidence_buckets: confidenceBuckets,
    window_breakdown: windowBreakdown,
    taken_vs_ignored: takenVsIgnored,
    warnings,
    copy: {
      purpose:
        "Recommendation performance measures historical recommendation behavior. It does not guarantee future results.",
      sample_size: "Early sample sizes may be too small to trust.",
      incomplete: "Incomplete outcomes are excluded from evaluated rates.",
      calibration: "Confidence calibration is observational only in this version.",
    },
  };
}

export function recommendationPerformanceStatisticsJson(
  statistics: RecommendationPerformanceStatistics,
) {
  return JSON.stringify(statistics, null, 2);
}
