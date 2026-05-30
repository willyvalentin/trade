import type {
  RecommendationBatch,
  RecommendationBatchStatus,
  RecommendationBatchType,
  RecommendationBatchWindow,
} from "@/lib/recommendation-batch-memory";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export type RecommendationBatchPerformanceQualityStatus =
  | "strong"
  | "useful"
  | "mixed"
  | "weak"
  | "incomplete"
  | "too_thin"
  | "unknown";

export type RecommendationBatchPerformanceMetric = {
  metric_id: string;
  label: string;
  value: number | null;
  unit: "count" | "percent" | "r_multiple" | "none";
};

export type RecommendationBatchPerformanceWarning = {
  warning_id: string;
  severity: "info" | "warning";
  batch_fingerprint: string | null;
  message: string;
};

export type RecommendationBatchPerformanceItem = {
  batch_fingerprint: string;
  trading_date: string | null;
  window: RecommendationBatchWindow;
  batch_type: RecommendationBatchType;
  status: RecommendationBatchStatus;
  recommendation_count: number;
  target_status: RecommendationBatch["target_status"];
  strong_count: number;
  valid_count: number;
  experimental_count: number;
  taken_count: number;
  ignored_count: number;
  evaluated_recommendation_count: number;
  pending_outcome_count: number;
  incomplete_outcome_count: number;
  entry_trigger_count: number;
  entry_trigger_rate: number | null;
  target_before_stop_count: number;
  target_before_stop_rate: number | null;
  stop_before_target_count: number;
  stop_before_target_rate: number | null;
  neither_or_expired_count: number;
  neither_or_expired_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_eod_r: number | null;
  best_recommendation: {
    snapshot_fingerprint: string;
    ticker: string | null;
    best_r: number;
  } | null;
  worst_recommendation: {
    snapshot_fingerprint: string;
    ticker: string | null;
    worst_r: number;
  } | null;
  quality_status: RecommendationBatchPerformanceQualityStatus;
  warnings: RecommendationBatchPerformanceWarning[];
};

export type RecommendationBatchPerformanceWindowBreakdown = {
  window: RecommendationBatchWindow;
  batch_count: number;
  average_recommendation_count: number | null;
  target_hit_rate: number | null;
  average_target_before_stop_rate: number | null;
  average_stop_before_target_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_taken_count: number | null;
  incomplete_outcome_rate: number | null;
};

export type RecommendationBatchPerformanceStatusBreakdown = {
  batch_type: RecommendationBatchType;
  batch_count: number;
  evaluated_batch_count: number;
  average_recommendation_count: number | null;
  target_hit_rate: number | null;
  average_target_before_stop_rate: number | null;
  average_best_r: number | null;
  quality_status_counts: Record<RecommendationBatchPerformanceQualityStatus, number>;
};

export type RecommendationBatchPerformanceSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "recommendation_batch_performance";
  generated_at: string;
  range: StatisticsTimeRange;
  source_scope: "current_visible" | "local_history" | "mixed" | "unknown";
  total_batches: number;
  evaluated_batches: number;
  target_hit_rate: number | null;
  average_recommendations_per_batch: number | null;
  average_target_before_stop_rate: number | null;
  average_stop_before_target_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_eod_r: number | null;
  total_recommendations: number;
  evaluated_recommendations: number;
  taken_count: number;
  ignored_count: number;
  entry_trigger_count: number;
  target_before_stop_count: number;
  stop_before_target_count: number;
  incomplete_outcome_count: number;
  items: RecommendationBatchPerformanceItem[];
  window_breakdown: RecommendationBatchPerformanceWindowBreakdown[];
  batch_type_breakdown: RecommendationBatchPerformanceStatusBreakdown[];
  metrics: RecommendationBatchPerformanceMetric[];
  warnings: RecommendationBatchPerformanceWarning[];
  copy: {
    purpose: string;
    weak_batch: string;
    incomplete: string;
    scoring: string;
  };
};

export type RecommendationBatchPerformanceInput = {
  batches: RecommendationBatch[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  range?: StatisticsTimeRange;
  now?: Date | string | null;
  source_scope?: RecommendationBatchPerformanceSummary["source_scope"];
};

type JoinedBatchSnapshot = {
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

const windows: RecommendationBatchWindow[] = [
  "morning",
  "midday",
  "power_hour",
  "outside_window",
  "closed",
  "unknown",
];

const batchTypes: RecommendationBatchType[] = [
  "official",
  "opportunistic",
  "fallback",
  "diagnostic",
  "unknown",
];

const qualityStatuses: RecommendationBatchPerformanceQualityStatus[] = [
  "strong",
  "useful",
  "mixed",
  "weak",
  "incomplete",
  "too_thin",
  "unknown",
];

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
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
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
  if (range === "all") return null;
  const start = startOfDay(now);

  if (range === "today") return { start: start.getTime(), end: now.getTime() };

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

function filterBatchesByRange(
  batches: RecommendationBatch[],
  range: StatisticsTimeRange,
  now: Date,
) {
  const bounds = rangeBounds(range, now);
  if (!bounds) return batches;

  return batches.filter((batch) => {
    const timestamp =
      timestampMs(batch.published_at) ??
      timestampMs(batch.served_at) ??
      timestampMs(batch.observed_at) ??
      timestampMs(batch.created_at);

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
  return (
    outcomes
      .filter(
        (outcome) =>
          outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint ||
          (snapshot.recommendation_id !== null &&
            outcome.recommendation_id === snapshot.recommendation_id),
      )
      .sort((first, second) => {
        const firstEvaluatedAt = timestampMs(first.evaluated_at) ?? 0;
        const secondEvaluatedAt = timestampMs(second.evaluated_at) ?? 0;

        if (secondEvaluatedAt !== firstEvaluatedAt) {
          return secondEvaluatedAt - firstEvaluatedAt;
        }

        return (timestampMs(second.updated_at) ?? 0) - (timestampMs(first.updated_at) ?? 0);
      })[0] ?? null
  );
}

function isEvaluated(outcome: RecommendationOutcome | null) {
  return outcome !== null && evaluatedStatuses.has(outcome.status);
}

function targetBeforeStop(outcome: RecommendationOutcome | null) {
  return (
    outcome?.status === "target_before_stop" ||
    (outcome?.first_terminal_event === "target_hit" && outcome.target_hit === true)
  );
}

function stopBeforeTarget(outcome: RecommendationOutcome | null) {
  return (
    outcome?.status === "stop_before_target" ||
    (outcome?.first_terminal_event === "stop_hit" && outcome.stop_hit === true)
  );
}

function isIgnored(snapshot: RecommendationSnapshot) {
  return !snapshot.was_taken && snapshot.status !== "taken";
}

function snapshotsForBatch(
  batch: RecommendationBatch,
  snapshotsByFingerprint: Map<string, RecommendationSnapshot>,
) {
  const fromFingerprint = batch.recommendation_snapshot_fingerprints
    .map((fingerprint) => snapshotsByFingerprint.get(fingerprint) ?? null)
    .filter((snapshot): snapshot is RecommendationSnapshot => snapshot !== null);

  if (fromFingerprint.length > 0) return fromFingerprint;

  return batch.recommendation_snapshot_ids
    .map((id) => snapshotsByFingerprint.get(id) ?? null)
    .filter((snapshot): snapshot is RecommendationSnapshot => snapshot !== null);
}

function warning(
  warning_id: string,
  message: string,
  batch_fingerprint: string | null = null,
  severity: "info" | "warning" = "warning",
): RecommendationBatchPerformanceWarning {
  return { warning_id, message, batch_fingerprint, severity };
}

function metric(
  metric_id: string,
  label: string,
  value: number | null,
  unit: RecommendationBatchPerformanceMetric["unit"],
): RecommendationBatchPerformanceMetric {
  return { metric_id, label, value, unit };
}

function qualityStatus(input: {
  batch: RecommendationBatch;
  evaluatedCount: number;
  targetBeforeStopRate: number | null;
  stopBeforeTargetRate: number | null;
  averageBestR: number | null;
  incompleteCount: number;
  pendingCount: number;
}) {
  if (input.batch.recommendation_count < 3 && input.batch.status !== "no_trade_valid") {
    return "too_thin" as const;
  }

  if (input.evaluatedCount === 0) {
    return input.incompleteCount + input.pendingCount > 0
      ? ("incomplete" as const)
      : ("unknown" as const);
  }

  if ((input.targetBeforeStopRate ?? 0) >= 55 && (input.averageBestR ?? 0) >= 1) {
    return "strong" as const;
  }

  if ((input.targetBeforeStopRate ?? 0) >= 35 || (input.averageBestR ?? 0) >= 0.5) {
    return "useful" as const;
  }

  if ((input.stopBeforeTargetRate ?? 0) >= 55 || (input.averageBestR ?? 0) < 0) {
    return "weak" as const;
  }

  return "mixed" as const;
}

function buildBatchItem(
  batch: RecommendationBatch,
  snapshotsByFingerprint: Map<string, RecommendationSnapshot>,
  outcomes: RecommendationOutcome[],
): RecommendationBatchPerformanceItem {
  const snapshots = snapshotsForBatch(batch, snapshotsByFingerprint);
  const joined: JoinedBatchSnapshot[] = snapshots.map((snapshot) => ({
    snapshot,
    outcome: latestOutcomeForSnapshot(snapshot, outcomes),
  }));
  const evaluated = joined.filter((item) => isEvaluated(item.outcome));
  const evaluatedCount = evaluated.length;
  const pendingCount = joined.filter(
    (item) => item.outcome === null || item.outcome.status === "pending",
  ).length;
  const incompleteCount = joined.filter(
    (item) =>
      item.outcome?.status === "incomplete" ||
      item.outcome?.status === "invalid" ||
      item.outcome?.status === "unknown",
  ).length;
  const entryTriggeredCount = evaluated.filter(
    (item) => item.outcome?.entry_triggered === true,
  ).length;
  const targetBeforeStopCount = evaluated.filter((item) =>
    targetBeforeStop(item.outcome),
  ).length;
  const stopBeforeTargetCount = evaluated.filter((item) =>
    stopBeforeTarget(item.outcome),
  ).length;
  const neitherOrExpiredCount = evaluated.filter(
    (item) =>
      item.outcome?.status === "neither_hit" ||
      item.outcome?.status === "expired" ||
      item.outcome?.status === "entry_not_triggered",
  ).length;
  const bestOutcome = evaluated
    .filter((item) => finiteNumber(item.outcome?.best_r) !== null)
    .sort((first, second) => (second.outcome?.best_r ?? 0) - (first.outcome?.best_r ?? 0))[0];
  const worstOutcome = evaluated
    .filter((item) => finiteNumber(item.outcome?.worst_r) !== null)
    .sort((first, second) => (first.outcome?.worst_r ?? 0) - (second.outcome?.worst_r ?? 0))[0];
  const averageBestR = average(evaluated.map((item) => item.outcome?.best_r));
  const averageWorstR = average(evaluated.map((item) => item.outcome?.worst_r));
  const targetRate = percent(targetBeforeStopCount, evaluatedCount);
  const stopRate = percent(stopBeforeTargetCount, evaluatedCount);
  const itemWarnings: RecommendationBatchPerformanceWarning[] = [];

  if (batch.recommendation_count < 6 && batch.status !== "no_trade_valid") {
    itemWarnings.push(
      warning(
        "batch_too_few_recommendations",
        "Batch has fewer than six recommendations.",
        batch.batch_fingerprint,
      ),
    );
  }

  if (batch.target_status !== "within_target" && batch.status !== "no_trade_valid") {
    itemWarnings.push(
      warning(
        "batch_target_missed",
        "Batch did not meet the desired recommendation target.",
        batch.batch_fingerprint,
      ),
    );
  }

  if (snapshots.length === 0 && batch.recommendation_count > 0) {
    itemWarnings.push(
      warning(
        "batch_missing_linked_snapshots",
        "Batch is missing linked recommendation snapshots.",
        batch.batch_fingerprint,
      ),
    );
  }

  if (evaluatedCount === 0 && batch.recommendation_count > 0) {
    itemWarnings.push(
      warning(
        "batch_outcomes_unavailable",
        "Batch outcomes are unavailable or still pending.",
        batch.batch_fingerprint,
        "info",
      ),
    );
  }

  if ((targetRate ?? 100) < 25 && evaluatedCount >= 3) {
    itemWarnings.push(
      warning(
        "weak_target_before_stop_behavior",
        "Batch has weak target-before-stop behavior.",
        batch.batch_fingerprint,
      ),
    );
  }

  if (batch.experimental_count > batch.strong_count + batch.valid_count) {
    itemWarnings.push(
      warning(
        "batch_mostly_experimental",
        "Batch is mostly experimental recommendations.",
        batch.batch_fingerprint,
        "info",
      ),
    );
  }

  const status = qualityStatus({
    batch,
    evaluatedCount,
    targetBeforeStopRate: targetRate,
    stopBeforeTargetRate: stopRate,
    averageBestR,
    incompleteCount,
    pendingCount,
  });

  return {
    batch_fingerprint: batch.batch_fingerprint,
    trading_date: batch.trading_date,
    window: batch.window,
    batch_type: batch.batch_type,
    status: batch.status,
    recommendation_count: batch.recommendation_count,
    target_status: batch.target_status,
    strong_count: batch.strong_count,
    valid_count: batch.valid_count,
    experimental_count: batch.experimental_count,
    taken_count: snapshots.filter((snapshot) => snapshot.was_taken || snapshot.status === "taken").length,
    ignored_count: snapshots.filter(isIgnored).length,
    evaluated_recommendation_count: evaluatedCount,
    pending_outcome_count: pendingCount,
    incomplete_outcome_count: incompleteCount,
    entry_trigger_count: entryTriggeredCount,
    entry_trigger_rate: percent(entryTriggeredCount, evaluatedCount),
    target_before_stop_count: targetBeforeStopCount,
    target_before_stop_rate: targetRate,
    stop_before_target_count: stopBeforeTargetCount,
    stop_before_target_rate: stopRate,
    neither_or_expired_count: neitherOrExpiredCount,
    neither_or_expired_rate: percent(neitherOrExpiredCount, evaluatedCount),
    average_best_r: averageBestR,
    average_worst_r: averageWorstR,
    average_eod_r: average(evaluated.map((item) => item.outcome?.eod_r)),
    best_recommendation:
      bestOutcome && bestOutcome.outcome && bestOutcome.outcome.best_r !== null
        ? {
            snapshot_fingerprint: bestOutcome.snapshot.snapshot_fingerprint,
            ticker: bestOutcome.snapshot.ticker,
            best_r: bestOutcome.outcome.best_r,
          }
        : null,
    worst_recommendation:
      worstOutcome && worstOutcome.outcome && worstOutcome.outcome.worst_r !== null
        ? {
            snapshot_fingerprint: worstOutcome.snapshot.snapshot_fingerprint,
            ticker: worstOutcome.snapshot.ticker,
            worst_r: worstOutcome.outcome.worst_r,
          }
        : null,
    quality_status: status,
    warnings: itemWarnings,
  };
}

function buildWindowBreakdown(
  window: RecommendationBatchWindow,
  items: RecommendationBatchPerformanceItem[],
): RecommendationBatchPerformanceWindowBreakdown {
  const windowItems = items.filter((item) => item.window === window);
  const evaluatedItems = windowItems.filter(
    (item) => item.evaluated_recommendation_count > 0,
  );

  return {
    window,
    batch_count: windowItems.length,
    average_recommendation_count: average(
      windowItems.map((item) => item.recommendation_count),
    ),
    target_hit_rate: percent(
      windowItems.filter(
        (item) =>
          item.target_status === "within_target" ||
          item.target_status === "no_trade_valid",
      ).length,
      windowItems.length,
    ),
    average_target_before_stop_rate: average(
      evaluatedItems.map((item) => item.target_before_stop_rate),
    ),
    average_stop_before_target_rate: average(
      evaluatedItems.map((item) => item.stop_before_target_rate),
    ),
    average_best_r: average(evaluatedItems.map((item) => item.average_best_r)),
    average_worst_r: average(evaluatedItems.map((item) => item.average_worst_r)),
    average_taken_count: average(windowItems.map((item) => item.taken_count)),
    incomplete_outcome_rate: percent(
      windowItems.reduce((sum, item) => sum + item.incomplete_outcome_count, 0),
      windowItems.reduce((sum, item) => sum + item.recommendation_count, 0),
    ),
  };
}

function buildTypeBreakdown(
  batchType: RecommendationBatchType,
  items: RecommendationBatchPerformanceItem[],
): RecommendationBatchPerformanceStatusBreakdown {
  const typeItems = items.filter((item) => item.batch_type === batchType);
  const evaluatedItems = typeItems.filter(
    (item) => item.evaluated_recommendation_count > 0,
  );
  const qualityCounts = qualityStatuses.reduce(
    (counts, status) => ({
      ...counts,
      [status]: typeItems.filter((item) => item.quality_status === status).length,
    }),
    {} as Record<RecommendationBatchPerformanceQualityStatus, number>,
  );

  return {
    batch_type: batchType,
    batch_count: typeItems.length,
    evaluated_batch_count: evaluatedItems.length,
    average_recommendation_count: average(
      typeItems.map((item) => item.recommendation_count),
    ),
    target_hit_rate: percent(
      typeItems.filter(
        (item) =>
          item.target_status === "within_target" ||
          item.target_status === "no_trade_valid",
      ).length,
      typeItems.length,
    ),
    average_target_before_stop_rate: average(
      evaluatedItems.map((item) => item.target_before_stop_rate),
    ),
    average_best_r: average(evaluatedItems.map((item) => item.average_best_r)),
    quality_status_counts: qualityCounts,
  };
}

export function buildRecommendationBatchPerformanceSummary(
  input: RecommendationBatchPerformanceInput,
): RecommendationBatchPerformanceSummary {
  const now = toDate(input.now ?? null) ?? new Date();
  const range = input.range ?? "all";
  const uniqueBatches = Array.from(
    new Map(input.batches.map((batch) => [batch.batch_fingerprint, batch])).values(),
  );
  const batches = filterBatchesByRange(uniqueBatches, range, now);
  const snapshotsByFingerprint = new Map(
    input.snapshots.flatMap((snapshot) => [
      [snapshot.snapshot_fingerprint, snapshot] as const,
      [snapshot.id, snapshot] as const,
    ]),
  );
  const items = batches
    .map((batch) => buildBatchItem(batch, snapshotsByFingerprint, input.outcomes))
    .sort((first, second) =>
      `${second.trading_date ?? ""}:${second.batch_fingerprint}`.localeCompare(
        `${first.trading_date ?? ""}:${first.batch_fingerprint}`,
      ),
    );
  const evaluatedItems = items.filter(
    (item) => item.evaluated_recommendation_count > 0,
  );
  const totalRecommendations = items.reduce(
    (sum, item) => sum + item.recommendation_count,
    0,
  );
  const evaluatedRecommendations = items.reduce(
    (sum, item) => sum + item.evaluated_recommendation_count,
    0,
  );
  const warnings = [
    ...items.flatMap((item) => item.warnings),
    ...(items.length < 5
      ? [
          warning(
            "sample_size_too_small",
            "Batch sample size is still small; compare windows cautiously.",
            null,
            "info",
          ),
        ]
      : []),
  ];
  const summary: RecommendationBatchPerformanceSummary = {
    summary_id: `recommendation_batch_performance:${range}:${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "recommendation_batch_performance",
    generated_at: now.toISOString(),
    range,
    source_scope: input.source_scope ?? "unknown",
    total_batches: items.length,
    evaluated_batches: evaluatedItems.length,
    target_hit_rate: percent(
      items.filter(
        (item) =>
          item.target_status === "within_target" ||
          item.target_status === "no_trade_valid",
      ).length,
      items.length,
    ),
    average_recommendations_per_batch: average(
      items.map((item) => item.recommendation_count),
    ),
    average_target_before_stop_rate: average(
      evaluatedItems.map((item) => item.target_before_stop_rate),
    ),
    average_stop_before_target_rate: average(
      evaluatedItems.map((item) => item.stop_before_target_rate),
    ),
    average_best_r: average(evaluatedItems.map((item) => item.average_best_r)),
    average_worst_r: average(evaluatedItems.map((item) => item.average_worst_r)),
    average_eod_r: average(evaluatedItems.map((item) => item.average_eod_r)),
    total_recommendations: totalRecommendations,
    evaluated_recommendations: evaluatedRecommendations,
    taken_count: items.reduce((sum, item) => sum + item.taken_count, 0),
    ignored_count: items.reduce((sum, item) => sum + item.ignored_count, 0),
    entry_trigger_count: items.reduce((sum, item) => sum + item.entry_trigger_count, 0),
    target_before_stop_count: items.reduce(
      (sum, item) => sum + item.target_before_stop_count,
      0,
    ),
    stop_before_target_count: items.reduce(
      (sum, item) => sum + item.stop_before_target_count,
      0,
    ),
    incomplete_outcome_count: items.reduce(
      (sum, item) => sum + item.incomplete_outcome_count,
      0,
    ),
    items,
    window_breakdown: windows.map((window) => buildWindowBreakdown(window, items)),
    batch_type_breakdown: batchTypes.map((batchType) =>
      buildTypeBreakdown(batchType, items),
    ),
    metrics: [],
    warnings,
    copy: {
      purpose:
        "Batch Performance measures the recommendation sets Ture served during each window.",
      weak_batch: "A weak batch does not mean every recommendation was bad.",
      incomplete: "Incomplete outcomes are excluded from evaluated rates.",
      scoring: "This does not change scoring.",
    },
  };

  return {
    ...summary,
    metrics: [
      metric("total_batches", "Total batches", summary.total_batches, "count"),
      metric("evaluated_batches", "Evaluated batches", summary.evaluated_batches, "count"),
      metric("target_hit_rate", "Target hit rate", summary.target_hit_rate, "percent"),
      metric("average_recommendations_per_batch", "Avg recommendations", summary.average_recommendations_per_batch, "count"),
      metric("average_target_before_stop_rate", "Avg target first", summary.average_target_before_stop_rate, "percent"),
      metric("average_best_r", "Avg best R", summary.average_best_r, "r_multiple"),
      metric("average_worst_r", "Avg worst R", summary.average_worst_r, "r_multiple"),
      metric("incomplete_outcome_count", "Incomplete outcomes", summary.incomplete_outcome_count, "count"),
    ],
  };
}

export function recommendationBatchPerformanceSummaryJson(
  summary: RecommendationBatchPerformanceSummary,
) {
  return JSON.stringify(summary, null, 2);
}
