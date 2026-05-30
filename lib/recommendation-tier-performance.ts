import type {
  DayTradeWindowRecommendationTier,
  DayTradeWindowRecommendationWindow,
} from "@/lib/day-trade-window-recommendation-target";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export type RecommendationTierPerformanceMetric = {
  metric_id: string;
  label: string;
  value: number | null;
  unit: "count" | "percent" | "r_multiple" | "minutes" | "none";
};

export type RecommendationTierPerformanceWarning = {
  warning_id: string;
  severity: "info" | "warning";
  message: string;
};

export type RecommendationTierPerformanceSampleQuality = {
  total_snapshots: number;
  snapshots_with_tier_metadata: number;
  snapshots_missing_tier_metadata: number;
  evaluated_share: number | null;
  incomplete_share: number | null;
  status: "usable" | "thin" | "incomplete" | "unknown";
};

export type RecommendationTierPerformanceTierBreakdown = {
  tier: DayTradeWindowRecommendationTier;
  label: string;
  recommendation_count: number;
  evaluated_count: number;
  pending_count: number;
  incomplete_count: number;
  unknown_count: number;
  entry_trigger_rate: number | null;
  target_before_stop_rate: number | null;
  stop_before_target_rate: number | null;
  target_hit_rate: number | null;
  stop_hit_rate: number | null;
  neither_hit_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_eod_r: number | null;
  average_confidence: number | null;
  average_time_to_entry_minutes: number | null;
  average_time_to_target_minutes: number | null;
  average_time_to_stop_minutes: number | null;
  taken_count: number;
  ignored_count: number;
  taken_target_before_stop_rate: number | null;
  ignored_target_before_stop_rate: number | null;
};

export type RecommendationTierPerformanceWindowBreakdown = {
  window: DayTradeWindowRecommendationWindow;
  label: string;
  total_recommendations: number;
  strong_count: number;
  valid_count: number;
  experimental_count: number;
  evaluated_count: number;
  target_before_stop_rate: number | null;
  stop_before_target_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  window_target_status:
    | "below_target"
    | "within_target"
    | "above_target"
    | "no_recommendations"
    | "unknown";
};

export type RecommendationTierPerformanceSummary = {
  summary_id: string;
  summary_version: "1.0";
  generated_at: string;
  range: StatisticsTimeRange;
  source_scope: "current_visible" | "local_history" | "mixed" | "unknown";
  total_recommendations: number;
  evaluated_recommendations: number;
  sample_quality: RecommendationTierPerformanceSampleQuality;
  tier_breakdowns: RecommendationTierPerformanceTierBreakdown[];
  window_breakdowns: RecommendationTierPerformanceWindowBreakdown[];
  comparison: {
    strong_vs_valid_target_before_stop_delta: number | null;
    valid_vs_experimental_target_before_stop_delta: number | null;
    strong_vs_experimental_average_best_r_delta: number | null;
    strong_vs_experimental_stop_before_target_delta: number | null;
    directional_status:
      | "behaving_as_expected"
      | "mixed"
      | "not_enough_data"
      | "unknown";
    notes: string[];
  };
  metrics: RecommendationTierPerformanceMetric[];
  warnings: RecommendationTierPerformanceWarning[];
  copy: {
    purpose: string;
    observational: string;
    sample_size: string;
  };
};

export type RecommendationTierPerformanceInput = {
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  range?: StatisticsTimeRange;
  now?: Date | string | null;
  source_scope?: RecommendationTierPerformanceSummary["source_scope"];
};

type JoinedTierOutcome = {
  snapshot: RecommendationSnapshot;
  outcome: RecommendationOutcome | null;
  tier: DayTradeWindowRecommendationTier;
  window: DayTradeWindowRecommendationWindow;
  window_target_status: RecommendationTierPerformanceWindowBreakdown["window_target_status"];
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
): RecommendationTierPerformanceWindowBreakdown["window_target_status"] {
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

function tierFromSnapshot(snapshot: RecommendationSnapshot) {
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
        const firstEvaluatedAt = timestampMs(first.evaluated_at);
        const secondEvaluatedAt = timestampMs(second.evaluated_at);

        if (secondEvaluatedAt !== firstEvaluatedAt) {
          return (secondEvaluatedAt ?? 0) - (firstEvaluatedAt ?? 0);
        }

        return (timestampMs(second.updated_at) ?? 0) - (timestampMs(first.updated_at) ?? 0);
      })[0] ?? null
  );
}

function isEvaluated(outcome: RecommendationOutcome | null) {
  return outcome !== null && evaluatedStatuses.has(outcome.status);
}

function hasTargetHit(outcome: RecommendationOutcome | null) {
  return outcome?.target_hit === true || outcome?.status === "target_hit";
}

function hasStopHit(outcome: RecommendationOutcome | null) {
  return outcome?.stop_hit === true || outcome?.status === "stop_hit";
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

function confidenceValue(snapshot: RecommendationSnapshot) {
  return finiteNumber(snapshot.confidence);
}

function isTaken(snapshot: RecommendationSnapshot) {
  return snapshot.was_taken || snapshot.status === "taken";
}

function warning(
  warning_id: string,
  message: string,
  severity: RecommendationTierPerformanceWarning["severity"] = "warning",
): RecommendationTierPerformanceWarning {
  return {
    warning_id,
    severity,
    message,
  };
}

function metric(
  metric_id: string,
  label: string,
  value: number | null,
  unit: RecommendationTierPerformanceMetric["unit"],
): RecommendationTierPerformanceMetric {
  return { metric_id, label, value, unit };
}

function tierLabel(tier: DayTradeWindowRecommendationTier) {
  return tier.replace(/_/g, " ").toUpperCase();
}

function windowLabel(window: DayTradeWindowRecommendationWindow) {
  return window.replace(/_/g, " ").toUpperCase();
}

function buildTierBreakdown(
  tier: DayTradeWindowRecommendationTier,
  joined: JoinedTierOutcome[],
): RecommendationTierPerformanceTierBreakdown {
  const items = joined.filter((item) => item.tier === tier);
  const evaluated = items.filter((item) => isEvaluated(item.outcome));
  const takenEvaluated = evaluated.filter((item) => isTaken(item.snapshot));
  const ignoredEvaluated = evaluated.filter((item) => !isTaken(item.snapshot));

  return {
    tier,
    label: tierLabel(tier),
    recommendation_count: items.length,
    evaluated_count: evaluated.length,
    pending_count: items.filter(
      (item) => item.outcome === null || item.outcome.status === "pending",
    ).length,
    incomplete_count: items.filter(
      (item) =>
        item.outcome?.status === "incomplete" || item.outcome?.status === "invalid",
    ).length,
    unknown_count: items.filter((item) => item.outcome?.status === "unknown")
      .length,
    entry_trigger_rate: percent(
      evaluated.filter((item) => item.outcome?.entry_triggered === true).length,
      evaluated.length,
    ),
    target_before_stop_rate: percent(
      evaluated.filter((item) => targetBeforeStop(item.outcome)).length,
      evaluated.length,
    ),
    stop_before_target_rate: percent(
      evaluated.filter((item) => stopBeforeTarget(item.outcome)).length,
      evaluated.length,
    ),
    target_hit_rate: percent(
      evaluated.filter((item) => hasTargetHit(item.outcome)).length,
      evaluated.length,
    ),
    stop_hit_rate: percent(
      evaluated.filter((item) => hasStopHit(item.outcome)).length,
      evaluated.length,
    ),
    neither_hit_rate: percent(
      evaluated.filter((item) => item.outcome?.status === "neither_hit").length,
      evaluated.length,
    ),
    average_best_r: average(evaluated.map((item) => item.outcome?.best_r)),
    average_worst_r: average(evaluated.map((item) => item.outcome?.worst_r)),
    average_eod_r: average(evaluated.map((item) => item.outcome?.eod_r)),
    average_confidence: average(items.map((item) => confidenceValue(item.snapshot))),
    average_time_to_entry_minutes: average(
      evaluated.map((item) => item.outcome?.time_to_entry_minutes),
    ),
    average_time_to_target_minutes: average(
      evaluated.map((item) => item.outcome?.time_to_target_minutes),
    ),
    average_time_to_stop_minutes: average(
      evaluated.map((item) => item.outcome?.time_to_stop_minutes),
    ),
    taken_count: items.filter((item) => isTaken(item.snapshot)).length,
    ignored_count: items.filter((item) => !isTaken(item.snapshot)).length,
    taken_target_before_stop_rate: percent(
      takenEvaluated.filter((item) => targetBeforeStop(item.outcome)).length,
      takenEvaluated.length,
    ),
    ignored_target_before_stop_rate: percent(
      ignoredEvaluated.filter((item) => targetBeforeStop(item.outcome)).length,
      ignoredEvaluated.length,
    ),
  };
}

function mostCommonWindowTargetStatus(
  items: JoinedTierOutcome[],
): RecommendationTierPerformanceWindowBreakdown["window_target_status"] {
  const counts = new Map<string, number>();

  for (const item of items) {
    if (item.window_target_status === "unknown") {
      continue;
    }

    counts.set(
      item.window_target_status,
      (counts.get(item.window_target_status) ?? 0) + 1,
    );
  }

  return (
    Array.from(counts.entries()).sort((first, second) => second[1] - first[1])[0]?.[0] as
      | RecommendationTierPerformanceWindowBreakdown["window_target_status"]
      | undefined
  ) ?? "unknown";
}

function buildWindowBreakdown(
  window: DayTradeWindowRecommendationWindow,
  joined: JoinedTierOutcome[],
): RecommendationTierPerformanceWindowBreakdown {
  const items = joined.filter((item) => item.window === window);
  const evaluated = items.filter((item) => isEvaluated(item.outcome));

  return {
    window,
    label: windowLabel(window),
    total_recommendations: items.length,
    strong_count: items.filter((item) => item.tier === "strong").length,
    valid_count: items.filter((item) => item.tier === "valid").length,
    experimental_count: items.filter((item) => item.tier === "experimental").length,
    evaluated_count: evaluated.length,
    target_before_stop_rate: percent(
      evaluated.filter((item) => targetBeforeStop(item.outcome)).length,
      evaluated.length,
    ),
    stop_before_target_rate: percent(
      evaluated.filter((item) => stopBeforeTarget(item.outcome)).length,
      evaluated.length,
    ),
    average_best_r: average(evaluated.map((item) => item.outcome?.best_r)),
    average_worst_r: average(evaluated.map((item) => item.outcome?.worst_r)),
    window_target_status: mostCommonWindowTargetStatus(items),
  };
}

function delta(first: number | null, second: number | null) {
  return first !== null && second !== null ? first - second : null;
}

export function buildRecommendationTierPerformanceSummary(
  input: RecommendationTierPerformanceInput,
): RecommendationTierPerformanceSummary {
  const now = toDate(input.now ?? null) ?? new Date();
  const range = input.range ?? "all";
  const uniqueSnapshots = Array.from(
    new Map(
      input.snapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]),
    ).values(),
  );
  const snapshots = filterSnapshotsByRange(uniqueSnapshots, range, now);
  const joined = snapshots.map((snapshot) => {
    const tierMetadata = tierFromSnapshot(snapshot);

    return {
      snapshot,
      outcome: latestOutcomeForSnapshot(snapshot, input.outcomes),
      ...tierMetadata,
    };
  });
  const tierBreakdowns = tiers.map((tier) => buildTierBreakdown(tier, joined));
  const windowBreakdowns = windows.map((window) =>
    buildWindowBreakdown(window, joined),
  );
  const evaluatedCount = joined.filter((item) => isEvaluated(item.outcome)).length;
  const missingTierMetadataCount = joined.filter(
    (item) => !item.has_tier_metadata,
  ).length;
  const incompleteCount = joined.filter(
    (item) =>
      item.outcome?.status === "incomplete" || item.outcome?.status === "invalid",
  ).length;
  const strong = tierBreakdowns.find((item) => item.tier === "strong")!;
  const valid = tierBreakdowns.find((item) => item.tier === "valid")!;
  const experimental = tierBreakdowns.find(
    (item) => item.tier === "experimental",
  )!;
  const strongVsValidTargetDelta = delta(
    strong.target_before_stop_rate,
    valid.target_before_stop_rate,
  );
  const validVsExperimentalTargetDelta = delta(
    valid.target_before_stop_rate,
    experimental.target_before_stop_rate,
  );
  const strongVsExperimentalBestRDelta = delta(
    strong.average_best_r,
    experimental.average_best_r,
  );
  const strongVsExperimentalStopDelta = delta(
    strong.stop_before_target_rate,
    experimental.stop_before_target_rate,
  );
  const tierComparisonHasEnoughData =
    strong.evaluated_count >= 3 &&
    valid.evaluated_count >= 3 &&
    experimental.evaluated_count >= 3;
  const directionalStatus = !tierComparisonHasEnoughData
    ? "not_enough_data"
    : (strongVsValidTargetDelta ?? -1) >= 0 &&
        (validVsExperimentalTargetDelta ?? -1) >= 0 &&
        (strongVsExperimentalBestRDelta ?? -1) >= 0 &&
        (strongVsExperimentalStopDelta ?? 1) <= 0
      ? "behaving_as_expected"
      : "mixed";
  const sampleQuality: RecommendationTierPerformanceSampleQuality = {
    total_snapshots: snapshots.length,
    snapshots_with_tier_metadata: snapshots.length - missingTierMetadataCount,
    snapshots_missing_tier_metadata: missingTierMetadataCount,
    evaluated_share: percent(evaluatedCount, snapshots.length),
    incomplete_share: percent(incompleteCount, snapshots.length),
    status:
      snapshots.length === 0
        ? "unknown"
        : evaluatedCount < 10
          ? "thin"
          : incompleteCount / snapshots.length > 0.3
            ? "incomplete"
            : "usable",
  };
  const warnings: RecommendationTierPerformanceWarning[] = [];
  const missingConfidenceCount = snapshots.filter(
    (snapshot) => confidenceValue(snapshot) === null,
  ).length;
  const missingWindowCount = joined.filter((item) => item.window === "unknown").length;
  const experimentalCount = experimental.recommendation_count;

  if (evaluatedCount < 10) {
    warnings.push(
      warning(
        "small_sample_size",
        "Small samples can be misleading for tier performance.",
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

  if (missingTierMetadataCount > 0) {
    warnings.push(
      warning(
        "missing_tier_metadata",
        `${missingTierMetadataCount} snapshot${missingTierMetadataCount === 1 ? "" : "s"} are missing tier metadata and remain unknown.`,
        "info",
      ),
    );
  }

  if (experimentalCount > snapshots.length * 0.5 && snapshots.length >= 4) {
    warnings.push(
      warning(
        "too_many_experimental",
        "Experimental recommendations make up more than half of the tiered sample.",
        "info",
      ),
    );
  }

  if (strong.recommendation_count === 0 && snapshots.length > 0) {
    warnings.push(
      warning(
        "no_strong_recommendations",
        "No strong recommendations are available in this period.",
        "info",
      ),
    );
  }

  if (directionalStatus === "mixed") {
    warnings.push(
      warning(
        "tier_ranking_not_yet_directional",
        "Strong/valid/experimental tiers are not directionally outperforming in this sample yet.",
        "info",
      ),
    );
  }

  if (missingConfidenceCount > 0) {
    warnings.push(
      warning(
        "missing_confidence_values",
        `${missingConfidenceCount} snapshot${missingConfidenceCount === 1 ? "" : "s"} are missing confidence values.`,
        "info",
      ),
    );
  }

  if (missingWindowCount > 0) {
    warnings.push(
      warning(
        "missing_window_labels",
        `${missingWindowCount} snapshot${missingWindowCount === 1 ? "" : "s"} have unknown window labels.`,
        "info",
      ),
    );
  }

  if (joined.some((item) => item.outcome?.source === "snapshot_only")) {
    warnings.push(
      warning(
        "candle_evaluation_incomplete",
        "Some outcomes are still snapshot-only and need candle evaluation.",
        "info",
      ),
    );
  }

  return {
    summary_id: `recommendation_tier_performance:${range}:${now.toISOString()}`,
    summary_version: "1.0",
    generated_at: now.toISOString(),
    range,
    source_scope: input.source_scope ?? "unknown",
    total_recommendations: snapshots.length,
    evaluated_recommendations: evaluatedCount,
    sample_quality: sampleQuality,
    tier_breakdowns: tierBreakdowns,
    window_breakdowns: windowBreakdowns,
    comparison: {
      strong_vs_valid_target_before_stop_delta: strongVsValidTargetDelta,
      valid_vs_experimental_target_before_stop_delta:
        validVsExperimentalTargetDelta,
      strong_vs_experimental_average_best_r_delta:
        strongVsExperimentalBestRDelta,
      strong_vs_experimental_stop_before_target_delta:
        strongVsExperimentalStopDelta,
      directional_status: directionalStatus,
      notes:
        directionalStatus === "behaving_as_expected"
          ? [
              "Strong, valid, and experimental tiers are directionally ordered in this sample.",
            ]
          : directionalStatus === "not_enough_data"
            ? [
                "More evaluated outcomes are needed before tier ranking can be trusted.",
              ]
            : [
                "Tier ranking is mixed in this sample; keep this observational.",
              ],
    },
    metrics: [
      metric("total_recommendations", "Total recommendations", snapshots.length, "count"),
      metric("evaluated_recommendations", "Evaluated", evaluatedCount, "count"),
      metric("strong_target_before_stop_rate", "Strong target first", strong.target_before_stop_rate, "percent"),
      metric("valid_target_before_stop_rate", "Valid target first", valid.target_before_stop_rate, "percent"),
      metric("experimental_target_before_stop_rate", "Experimental target first", experimental.target_before_stop_rate, "percent"),
      metric("strong_vs_valid_target_delta", "Strong vs valid delta", strongVsValidTargetDelta, "percent"),
      metric("valid_vs_experimental_target_delta", "Valid vs experimental delta", validVsExperimentalTargetDelta, "percent"),
      metric("strong_vs_experimental_best_r_delta", "Strong vs experimental best R delta", strongVsExperimentalBestRDelta, "r_multiple"),
    ],
    warnings,
    copy: {
      purpose:
        "Tier performance checks whether Ture's ranking labels are meaningful over time.",
      observational:
        "This is observational analytics only. It does not change scoring yet.",
      sample_size: "Small samples can be misleading.",
    },
  };
}

export function recommendationTierPerformanceSummaryJson(
  summary: RecommendationTierPerformanceSummary,
) {
  return JSON.stringify(summary, null, 2);
}
