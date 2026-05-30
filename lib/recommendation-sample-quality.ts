import type {
  DayTradeWindowRecommendationTargetStatus,
  DayTradeWindowRecommendationTargetSummary,
  DayTradeWindowRecommendationTier,
  DayTradeWindowRecommendationWindow,
} from "@/lib/day-trade-window-recommendation-target";
import type { RecommendationLearningInsightsSummary } from "@/lib/recommendation-learning-insights";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationPerformanceStatistics } from "@/lib/recommendation-performance-statistics";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { RecommendationTierPerformanceSummary } from "@/lib/recommendation-tier-performance";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export type RecommendationSampleQualityStatus =
  | "insufficient_data"
  | "thin_but_growing"
  | "adequate_for_observation"
  | "good_learning_coverage"
  | "skewed"
  | "incomplete"
  | "unknown";

export type RecommendationSampleLearningReadiness =
  | "not_ready"
  | "observation_only"
  | "early_directional_learning"
  | "enough_for_preliminary_calibration"
  | "unknown";

export type RecommendationSampleQualityMetric = {
  metric_id: string;
  label: string;
  value: number | string | null;
  unit: "count" | "percent" | "per_day" | "text" | "none";
  status: "ok" | "warning" | "critical" | "unknown";
};

export type RecommendationSampleQualityCoverage = {
  coverage_id: string;
  label: string;
  total_count: number;
  evaluated_count: number;
  rate: number | null;
  status: "covered" | "thin" | "missing" | "skewed" | "unknown";
  items: Array<{
    id: string;
    label: string;
    count: number;
    rate: number | null;
    evaluated_count?: number;
  }>;
};

export type RecommendationSampleQualityGap = {
  gap_id: string;
  severity: "info" | "warning" | "critical";
  label: string;
  message: string;
};

export type RecommendationSampleQualityWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type RecommendationSampleQualitySuggestion = {
  suggestion_id: string;
  priority: "low" | "medium" | "high";
  message: string;
};

export type RecommendationSampleQualitySummary = {
  summary_id: string;
  summary_version: "1.0";
  generated_at: string;
  range: StatisticsTimeRange;
  source_scope: "current_visible" | "local_history" | "mixed" | "unknown";
  status: RecommendationSampleQualityStatus;
  learning_readiness: RecommendationSampleLearningReadiness;
  total_snapshots: number;
  evaluated_snapshots: number;
  snapshots_per_day: number | null;
  snapshots_per_active_window: number | null;
  active_window_count: number;
  outcome_completeness: {
    evaluated_count: number;
    evaluated_rate: number | null;
    pending_count: number;
    pending_rate: number | null;
    incomplete_count: number;
    incomplete_rate: number | null;
    unknown_count: number;
    unknown_rate: number | null;
    missing_candle_warning_count: number;
  };
  tier_coverage: RecommendationSampleQualityCoverage;
  confidence_coverage: RecommendationSampleQualityCoverage;
  window_coverage: RecommendationSampleQualityCoverage;
  ticker_concentration: {
    unique_ticker_count: number;
    top_ticker: string | null;
    top_ticker_count: number;
    top_ticker_concentration: number | null;
    top_three_ticker_concentration: number | null;
  };
  taken_vs_ignored: {
    taken_count: number;
    ignored_count: number;
    taken_rate: number | null;
    ignored_rate: number | null;
  };
  window_target_coverage: {
    metadata_count: number;
    within_target_count: number;
    below_target_count: number;
    above_target_count: number;
    unknown_count: number;
    current_window_status: DayTradeWindowRecommendationTargetStatus | "unknown";
  };
  metrics: RecommendationSampleQualityMetric[];
  gaps: RecommendationSampleQualityGap[];
  warnings: RecommendationSampleQualityWarning[];
  suggestions: RecommendationSampleQualitySuggestion[];
  copy: {
    purpose: string;
    bias: string;
    ignored: string;
    scoring: string;
  };
};

export type RecommendationSampleQualityInput = {
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  performance: RecommendationPerformanceStatistics;
  tier_performance: RecommendationTierPerformanceSummary;
  learning_insights: RecommendationLearningInsightsSummary;
  day_trade_window_target?: DayTradeWindowRecommendationTargetSummary | null;
  range?: StatisticsTimeRange;
  now?: Date | string | null;
  source_scope?: RecommendationSampleQualitySummary["source_scope"];
};

type JoinedSample = {
  snapshot: RecommendationSnapshot;
  outcome: RecommendationOutcome | null;
  tier: DayTradeWindowRecommendationTier;
  window: DayTradeWindowRecommendationWindow;
  window_target_status: DayTradeWindowRecommendationTargetStatus | "unknown";
  has_tier_metadata: boolean;
};

const tiers: DayTradeWindowRecommendationTier[] = [
  "strong",
  "valid",
  "experimental",
  "rejected",
  "incomplete",
  "unknown",
];

const windows: DayTradeWindowRecommendationWindow[] = [
  "morning",
  "midday",
  "power_hour",
  "unknown",
];

const confidenceBuckets = [
  { id: "0_39", label: "0-39" },
  { id: "40_59", label: "40-59" },
  { id: "60_74", label: "60-74" },
  { id: "75_89", label: "75-89" },
  { id: "90_100", label: "90-100" },
  { id: "unknown", label: "Unknown" },
];

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
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
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

  if (!bounds) {
    return snapshots;
  }

  return snapshots.filter((snapshot) => {
    const timestamp =
      timestampMs(snapshot.recommended_at) ??
      timestampMs(snapshot.app_timestamp) ??
      timestampMs(snapshot.created_at);

    return (
      timestamp !== null &&
      timestamp >= bounds.start &&
      timestamp <= bounds.end
    );
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function action112Metadata(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;

  if (!isRecord(payload)) {
    return null;
  }

  const metadata = payload.day_trade_window_recommendation_target;
  return isRecord(metadata) ? metadata : null;
}

function normalizeTier(value: unknown): DayTradeWindowRecommendationTier {
  return typeof value === "string" &&
    tiers.includes(value as DayTradeWindowRecommendationTier)
    ? (value as DayTradeWindowRecommendationTier)
    : "unknown";
}

function normalizeWindow(value: unknown): DayTradeWindowRecommendationWindow {
  if (
    value === "morning" ||
    value === "midday" ||
    value === "power_hour" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeWindowTargetStatus(
  value: unknown,
): DayTradeWindowRecommendationTargetStatus | "unknown" {
  if (
    value === "below_target" ||
    value === "within_target" ||
    value === "above_target" ||
    value === "no_recommendations"
  ) {
    return value;
  }

  return "unknown";
}

function metadataFromSnapshot(snapshot: RecommendationSnapshot) {
  const metadata = action112Metadata(snapshot);

  return {
    tier: normalizeTier(
      metadata?.recommendation_tier ?? metadata?.tier ?? "unknown",
    ),
    window: normalizeWindow(
      metadata?.window_label ?? metadata?.window ?? snapshot.window,
    ),
    window_target_status: normalizeWindowTargetStatus(
      metadata?.window_target_status,
    ),
    has_tier_metadata: metadata !== null,
  };
}

function latestOutcomeForSnapshot(
  snapshot: RecommendationSnapshot,
  outcomes: RecommendationOutcome[],
) {
  const candidates = outcomes.filter(
    (outcome) =>
      outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint ||
      (snapshot.recommendation_id !== null &&
        outcome.recommendation_id === snapshot.recommendation_id),
  );

  return (
    candidates
      .slice()
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

function confidenceBucketId(snapshot: RecommendationSnapshot) {
  const confidence = finiteNumber(snapshot.confidence);

  if (confidence === null) {
    return "unknown";
  }

  if (confidence <= 39) {
    return "0_39";
  }

  if (confidence <= 59) {
    return "40_59";
  }

  if (confidence <= 74) {
    return "60_74";
  }

  if (confidence <= 89) {
    return "75_89";
  }

  return "90_100";
}

function dateKey(snapshot: RecommendationSnapshot) {
  const date =
    toDate(snapshot.recommended_at) ??
    toDate(snapshot.app_timestamp) ??
    toDate(snapshot.created_at);

  return date?.toISOString().slice(0, 10) ?? null;
}

function metric(
  metric_id: string,
  label: string,
  value: RecommendationSampleQualityMetric["value"],
  unit: RecommendationSampleQualityMetric["unit"],
  status: RecommendationSampleQualityMetric["status"] = "ok",
): RecommendationSampleQualityMetric {
  return { metric_id, label, value, unit, status };
}

function warning(
  warning_id: string,
  message: string,
  severity: RecommendationSampleQualityWarning["severity"] = "warning",
): RecommendationSampleQualityWarning {
  return { warning_id, severity, message };
}

function gap(
  gap_id: string,
  label: string,
  message: string,
  severity: RecommendationSampleQualityGap["severity"] = "warning",
): RecommendationSampleQualityGap {
  return { gap_id, label, message, severity };
}

function suggestion(
  suggestion_id: string,
  message: string,
  priority: RecommendationSampleQualitySuggestion["priority"] = "medium",
): RecommendationSampleQualitySuggestion {
  return { suggestion_id, message, priority };
}

function coverageStatus({
  total,
  missing,
  largestRate,
}: {
  total: number;
  missing: number;
  largestRate: number | null;
}): RecommendationSampleQualityCoverage["status"] {
  if (total === 0) {
    return "missing";
  }

  if (missing === total) {
    return "missing";
  }

  if ((largestRate ?? 0) >= 70 && total >= 5) {
    return "skewed";
  }

  if (total < 20) {
    return "thin";
  }

  return "covered";
}

function buildCoverage(
  coverage_id: string,
  label: string,
  items: RecommendationSampleQualityCoverage["items"],
  total: number,
  evaluatedCount: number,
  missingId: string,
): RecommendationSampleQualityCoverage {
  const largestRate =
    items.reduce(
      (largest, item) =>
        item.rate !== null && item.rate > largest ? item.rate : largest,
      0,
    ) || null;
  const missing = items.find((item) => item.id === missingId)?.count ?? 0;

  return {
    coverage_id,
    label,
    total_count: total,
    evaluated_count: evaluatedCount,
    rate: percent(total - missing, total),
    status: coverageStatus({ total, missing, largestRate }),
    items,
  };
}

function takenBucket(snapshot: RecommendationSnapshot) {
  return snapshot.was_taken || snapshot.status === "taken" ? "taken" : "ignored";
}

function learningReadiness(evaluatedCount: number) {
  if (evaluatedCount <= 0) {
    return "unknown";
  }

  if (evaluatedCount < 20) {
    return "not_ready";
  }

  if (evaluatedCount < 50) {
    return "observation_only";
  }

  if (evaluatedCount < 100) {
    return "early_directional_learning";
  }

  return "enough_for_preliminary_calibration";
}

function sampleQualityStatus({
  total,
  evaluated,
  evaluatedRate,
  incompleteRate,
  experimentalRate,
  unknownTierRate,
  topTickerConcentration,
  largestWindowRate,
}: {
  total: number;
  evaluated: number;
  evaluatedRate: number | null;
  incompleteRate: number | null;
  experimentalRate: number | null;
  unknownTierRate: number | null;
  topTickerConcentration: number | null;
  largestWindowRate: number | null;
}): RecommendationSampleQualityStatus {
  if (total === 0) {
    return "unknown";
  }

  if (evaluated < 20) {
    return "insufficient_data";
  }

  if ((incompleteRate ?? 0) >= 35 || (evaluatedRate ?? 0) < 50) {
    return "incomplete";
  }

  if (
    (experimentalRate ?? 0) >= 55 ||
    (unknownTierRate ?? 0) >= 35 ||
    (topTickerConcentration ?? 0) >= 45 ||
    (largestWindowRate ?? 0) >= 75
  ) {
    return "skewed";
  }

  if (evaluated < 50) {
    return "thin_but_growing";
  }

  if (evaluated < 100) {
    return "adequate_for_observation";
  }

  return "good_learning_coverage";
}

function countWarningsForMissingCandles(outcome: RecommendationOutcome | null) {
  if (!outcome) {
    return 0;
  }

  const text = [...outcome.warnings, ...outcome.blockers]
    .join(" ")
    .toLowerCase();

  return text.includes("candle") || outcome.source === "snapshot_only" ? 1 : 0;
}

export function buildRecommendationSampleQualitySummary(
  input: RecommendationSampleQualityInput,
): RecommendationSampleQualitySummary {
  const now = toDate(input.now ?? null) ?? new Date();
  const range = input.range ?? input.performance.range ?? "all";
  const uniqueSnapshots = Array.from(
    new Map(
      input.snapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]),
    ).values(),
  );
  const snapshots = filterSnapshotsByRange(uniqueSnapshots, range, now);
  const joined: JoinedSample[] = snapshots.map((snapshot) => {
    const metadata = metadataFromSnapshot(snapshot);

    return {
      snapshot,
      outcome: latestOutcomeForSnapshot(snapshot, input.outcomes),
      ...metadata,
    };
  });
  const total = snapshots.length;
  const evaluated = joined.filter((item) => isEvaluated(item.outcome)).length;
  const pending = joined.filter(
    (item) => item.outcome === null || item.outcome.status === "pending",
  ).length;
  const incomplete = joined.filter(
    (item) =>
      item.outcome?.status === "incomplete" || item.outcome?.status === "invalid",
  ).length;
  const unknown = joined.filter((item) => item.outcome?.status === "unknown").length;
  const missingCandleWarningCount = joined.reduce(
    (sum, item) => sum + countWarningsForMissingCandles(item.outcome),
    0,
  );
  const dates = new Set(
    snapshots.map(dateKey).filter((value): value is string => value !== null),
  );
  const activeWindows = windows.filter(
    (window) => window !== "unknown" && joined.some((item) => item.window === window),
  );
  const snapshotsPerDay =
    dates.size > 0 ? total / dates.size : total > 0 ? total : null;
  const snapshotsPerActiveWindow =
    activeWindows.length > 0 ? total / activeWindows.length : null;
  const tierItems = tiers.map((tier) => {
    const count = joined.filter((item) => item.tier === tier).length;

    return {
      id: tier,
      label: tier.replace(/_/g, " ").toUpperCase(),
      count,
      rate: percent(count, total),
      evaluated_count:
        input.tier_performance.tier_breakdowns.find((item) => item.tier === tier)
          ?.evaluated_count ?? 0,
    };
  });
  const confidenceItems = confidenceBuckets.map((bucket) => {
    const count = snapshots.filter(
      (snapshot) => confidenceBucketId(snapshot) === bucket.id,
    ).length;

    return {
      id: bucket.id,
      label: bucket.label,
      count,
      rate: percent(count, total),
      evaluated_count:
        input.performance.confidence_buckets.find(
          (item) => item.bucket_id === bucket.id,
        )?.evaluated_count ?? 0,
    };
  });
  const windowItems = windows.map((window) => {
    const count = joined.filter((item) => item.window === window).length;

    return {
      id: window,
      label: window.replace(/_/g, " ").toUpperCase(),
      count,
      rate: percent(count, total),
      evaluated_count:
        input.tier_performance.window_breakdowns.find(
          (item) => item.window === window,
        )?.evaluated_count ?? 0,
    };
  });
  const tickers = new Map<string, number>();

  for (const snapshot of snapshots) {
    const ticker = snapshot.ticker?.trim().toUpperCase() || "UNKNOWN";
    tickers.set(ticker, (tickers.get(ticker) ?? 0) + 1);
  }

  const sortedTickers = Array.from(tickers.entries()).sort(
    (first, second) => second[1] - first[1],
  );
  const topTicker = sortedTickers[0] ?? null;
  const topThreeCount = sortedTickers
    .slice(0, 3)
    .reduce((sum, item) => sum + item[1], 0);
  const takenCount = snapshots.filter((snapshot) => takenBucket(snapshot) === "taken")
    .length;
  const ignoredCount = total - takenCount;
  const windowTargetStatuses = joined.map((item) => item.window_target_status);
  const windowTargetMetadataCount = windowTargetStatuses.filter(
    (status) => status !== "unknown",
  ).length;
  const tierCoverage = buildCoverage(
    "tier",
    "Tier Coverage",
    tierItems,
    total,
    evaluated,
    "unknown",
  );
  const confidenceCoverage = buildCoverage(
    "confidence",
    "Confidence Coverage",
    confidenceItems,
    total,
    evaluated,
    "unknown",
  );
  const windowCoverage = buildCoverage(
    "window",
    "Window Coverage",
    windowItems,
    total,
    evaluated,
    "unknown",
  );
  const evaluatedRate = percent(evaluated, total);
  const incompleteRate = percent(incomplete, total);
  const experimentalRate = tierItems.find((item) => item.id === "experimental")
    ?.rate ?? null;
  const unknownTierRate = tierItems.find((item) => item.id === "unknown")?.rate ?? null;
  const largestWindowRate =
    windowItems.reduce(
      (largest, item) =>
        item.id !== "unknown" && item.rate !== null && item.rate > largest
          ? item.rate
          : largest,
      0,
    ) || null;
  const topTickerConcentration = percent(topTicker?.[1] ?? 0, total);
  const status = sampleQualityStatus({
    total,
    evaluated,
    evaluatedRate,
    incompleteRate,
    experimentalRate,
    unknownTierRate,
    topTickerConcentration,
    largestWindowRate,
  });
  const readiness = learningReadiness(evaluated);
  const gaps: RecommendationSampleQualityGap[] = [];
  const warnings: RecommendationSampleQualityWarning[] = [];
  const suggestions: RecommendationSampleQualitySuggestion[] = [];
  const strongCount = tierItems.find((item) => item.id === "strong")?.count ?? 0;
  const validCount = tierItems.find((item) => item.id === "valid")?.count ?? 0;

  if (evaluated < 20) {
    gaps.push(
      gap(
        "evaluated_sample_volume",
        "Evaluated sample volume",
        "Fewer than 20 recommendations are evaluated, so learning readiness is low.",
        "critical",
      ),
    );
    suggestions.push(
      suggestion(
        "collect_more_evaluated_samples",
        "Collect more evaluated recommendation samples before calibration work.",
        "high",
      ),
    );
  }

  if ((evaluatedRate ?? 0) < 60 || missingCandleWarningCount > 0) {
    gaps.push(
      gap(
        "outcome_completeness",
        "Outcome completeness",
        "Outcome coverage is still incomplete, often because candle evaluation is missing or pending.",
      ),
    );
    suggestions.push(
      suggestion(
        "improve_candle_outcome_coverage",
        "Improve candle outcome coverage so more snapshots become evaluated outcomes.",
        "high",
      ),
    );
  }

  if (strongCount === 0 || validCount === 0) {
    gaps.push(
      gap(
        "strong_valid_coverage",
        "Strong/Valid coverage",
        "The dataset has too few Strong or Valid recommendations to compare high-quality tiers.",
      ),
    );
    suggestions.push(
      suggestion(
        "increase_strong_valid_count",
        "Keep tracking whether future windows produce more Strong and Valid recommendations.",
      ),
    );
  }

  if ((experimentalRate ?? 0) >= 50) {
    warnings.push(
      warning(
        "experimental_overweight",
        "Experimental recommendations make up too much of the sample.",
      ),
    );
    suggestions.push(
      suggestion(
        "monitor_experimental_balance",
        "Keep Experimental recommendations separate when reviewing learning quality.",
      ),
    );
  }

  if ((unknownTierRate ?? 0) >= 25) {
    warnings.push(
      warning(
        "unknown_tier_overweight",
        "Many snapshots are missing tier metadata and remain unknown.",
        "info",
      ),
    );
    suggestions.push(
      suggestion(
        "reduce_unknown_tiers",
        "Let new snapshots accumulate with Action 112 tier metadata.",
        "low",
      ),
    );
  }

  if (confidenceCoverage.status === "skewed" || confidenceCoverage.status === "missing") {
    warnings.push(
      warning(
        "confidence_coverage_skew",
        "Confidence buckets are missing or concentrated, limiting calibration analysis.",
      ),
    );
  }

  if (windowCoverage.status === "skewed" || activeWindows.length < 2) {
    warnings.push(
      warning(
        "window_coverage_skew",
        "Recommendation samples are not yet broadly distributed across day-trade windows.",
      ),
    );
    suggestions.push(
      suggestion(
        "improve_window_coverage",
        "Review coverage across morning, midday, and power-hour windows before comparing windows.",
      ),
    );
  }

  if ((topTickerConcentration ?? 0) >= 35 || (percent(topThreeCount, total) ?? 0) >= 65) {
    warnings.push(
      warning(
        "ticker_concentration",
        "Recommendation samples are concentrated in a small number of tickers.",
      ),
    );
    suggestions.push(
      suggestion(
        "avoid_ticker_overconcentration",
        "Monitor ticker concentration so learning is not dominated by a few names.",
      ),
    );
  }

  if (ignoredCount === 0 && total > 0) {
    warnings.push(
      warning(
        "missing_ignored_coverage",
        "Only taken recommendations are represented; ignored recommendations are important for unbiased learning.",
      ),
    );
    suggestions.push(
      suggestion(
        "track_ignored_recommendations",
        "Keep tracking ignored recommendations to reduce selection bias.",
      ),
    );
  }

  if (input.day_trade_window_target?.status === "below_target") {
    suggestions.push(
      suggestion(
        "window_target_below_target",
        "Current window is below the 6-10 recommendation target; keep collecting samples without forcing weak trades.",
      ),
    );
  }

  for (const learningWarning of input.learning_insights.warnings.slice(0, 2)) {
    warnings.push(
      warning(
        `learning_insight_${warnings.length}`,
        learningWarning,
        "info",
      ),
    );
  }

  return {
    summary_id: `recommendation_sample_quality:${range}:${now.toISOString()}`,
    summary_version: "1.0",
    generated_at: now.toISOString(),
    range,
    source_scope: input.source_scope ?? "unknown",
    status,
    learning_readiness: readiness,
    total_snapshots: total,
    evaluated_snapshots: evaluated,
    snapshots_per_day: snapshotsPerDay,
    snapshots_per_active_window: snapshotsPerActiveWindow,
    active_window_count: activeWindows.length,
    outcome_completeness: {
      evaluated_count: evaluated,
      evaluated_rate: evaluatedRate,
      pending_count: pending,
      pending_rate: percent(pending, total),
      incomplete_count: incomplete,
      incomplete_rate: incompleteRate,
      unknown_count: unknown,
      unknown_rate: percent(unknown, total),
      missing_candle_warning_count: missingCandleWarningCount,
    },
    tier_coverage: tierCoverage,
    confidence_coverage: confidenceCoverage,
    window_coverage: windowCoverage,
    ticker_concentration: {
      unique_ticker_count: sortedTickers.filter((item) => item[0] !== "UNKNOWN").length,
      top_ticker: topTicker?.[0] ?? null,
      top_ticker_count: topTicker?.[1] ?? 0,
      top_ticker_concentration: topTickerConcentration,
      top_three_ticker_concentration: percent(topThreeCount, total),
    },
    taken_vs_ignored: {
      taken_count: takenCount,
      ignored_count: ignoredCount,
      taken_rate: percent(takenCount, total),
      ignored_rate: percent(ignoredCount, total),
    },
    window_target_coverage: {
      metadata_count: windowTargetMetadataCount,
      within_target_count: windowTargetStatuses.filter(
        (statusItem) => statusItem === "within_target",
      ).length,
      below_target_count: windowTargetStatuses.filter(
        (statusItem) => statusItem === "below_target",
      ).length,
      above_target_count: windowTargetStatuses.filter(
        (statusItem) => statusItem === "above_target",
      ).length,
      unknown_count: windowTargetStatuses.filter(
        (statusItem) => statusItem === "unknown",
      ).length,
      current_window_status: input.day_trade_window_target?.status ?? "unknown",
    },
    metrics: [
      metric("total_snapshots", "Total snapshots", total, "count"),
      metric("evaluated_snapshots", "Evaluated snapshots", evaluated, "count"),
      metric("evaluated_rate", "Evaluated rate", evaluatedRate, "percent"),
      metric("snapshots_per_day", "Snapshots per day", snapshotsPerDay, "per_day"),
      metric("snapshots_per_active_window", "Snapshots per active window", snapshotsPerActiveWindow, "count"),
      metric("unique_tickers", "Unique tickers", sortedTickers.length, "count"),
      metric("top_ticker_concentration", "Top ticker concentration", topTickerConcentration, "percent"),
      metric("top_three_ticker_concentration", "Top 3 ticker concentration", percent(topThreeCount, total), "percent"),
    ],
    gaps,
    warnings,
    suggestions: suggestions.slice(0, 8),
    copy: {
      purpose:
        "Ture needs broad, evaluated recommendation samples before it can safely calibrate confidence.",
      bias:
        "Coverage checks help avoid learning from biased or incomplete data.",
      ignored:
        "Ignored recommendations are valuable because they reduce selection bias.",
      scoring: "This section does not change scoring.",
    },
  };
}

export function recommendationSampleQualitySummaryJson(
  summary: RecommendationSampleQualitySummary,
) {
  return JSON.stringify(summary, null, 2);
}
