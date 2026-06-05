import type {
  RecommendationOutcome,
  RecommendationOutcomeStatus,
} from "@/lib/recommendation-outcome-tracker";
import {
  buildEntryPlanQualityForSnapshot,
  type CounterfactualEntryVariantLabel,
  type EntryPlanExecutionQualityLabel,
} from "@/lib/recommendation-outcome-learning-insights";
import type {
  RecommendationSnapshot,
  RecommendationSnapshotStatus,
  RecommendationSnapshotWindow,
} from "@/lib/recommendation-snapshot";

export type RecommendationHistoryStatus =
  | RecommendationSnapshotStatus
  | "taken"
  | "ignored"
  | "unknown";

export type RecommendationHistoryOutcomeSummary = {
  status: RecommendationOutcomeStatus | "missing";
  horizon: string;
  entry_triggered: boolean | null;
  target_hit: boolean | null;
  stop_hit: boolean | null;
  first_terminal_event: string;
  best_r: number | null;
  worst_r: number | null;
  eod_r: number | null;
  max_favorable_excursion: number | null;
  max_adverse_excursion: number | null;
  time_to_entry_minutes: number | null;
  time_to_target_minutes: number | null;
  time_to_stop_minutes: number | null;
  execution_quality_label: EntryPlanExecutionQualityLabel;
  idea_moved_favorably: boolean | null;
  entry_quality_reason: string;
  best_counterfactual_entry_variant: CounterfactualEntryVariantLabel | null;
  would_have_triggered_with_variant: boolean | null;
  counterfactual_best_r: number | null;
  counterfactual_worst_r: number | null;
  evaluated_at: string | null;
  warnings: string[];
};

export type RecommendationHistoryLinkedTrade = {
  id: string;
  ticker: string | null;
  status: "open" | "closed" | "unknown";
  opened_at: string | null;
  closed_at: string | null;
  pnl: number | null;
  r_multiple: number | null;
  is_demo: boolean | null;
};

export type RecommendationHistoryItem = {
  id: string;
  snapshot_id: string;
  snapshot_fingerprint: string;
  recommendation_id: string | null;
  ticker: string | null;
  company_name: string | null;
  recommended_at: string | null;
  day_trade_window: RecommendationSnapshotWindow;
  status: RecommendationHistoryStatus;
  source_mode: string;
  data_mode: string;
  confidence: number | string | null;
  confidence_bucket: RecommendationHistoryFilter["confidence_bucket"];
  score: number | string | null;
  rating: string | null;
  entry: number | null;
  stop: number | null;
  target: number | null;
  planned_risk_reward: number | null;
  side: string;
  rationale: string | null;
  reason: string | null;
  catalyst: string | null;
  primary_risk: string | null;
  intake_quality_status: string | null;
  intake_quality_grade: string | null;
  intake_quality_reasons: string[];
  freshness: string | null;
  data_age_minutes: number | null;
  linked_trade_id: string | null;
  linked_trade: RecommendationHistoryLinkedTrade | null;
  outcome: RecommendationHistoryOutcomeSummary;
  is_evaluated: boolean;
  is_pending: boolean;
  is_incomplete: boolean;
  sort_timestamp: number;
  warnings: string[];
};

export type RecommendationHistorySummary = {
  total_recommendations: number;
  visible_recommendations: number;
  taken_recommendations: number;
  ignored_recommendations: number;
  evaluated_recommendations: number;
  pending_outcomes: number;
  incomplete_outcomes: number;
  unknown_outcomes: number;
  target_before_stop: number;
  stop_before_target: number;
  entry_not_triggered: number;
  average_best_r: number | null;
  average_worst_r: number | null;
};

export type RecommendationHistoryWarning = {
  warning_id: string;
  severity: "info" | "warning";
  message: string;
};

export type RecommendationHistoryFilter = {
  taken: "all" | "taken" | "ignored" | "unknown";
  outcome:
    | "all"
    | "evaluated"
    | "pending"
    | "incomplete"
    | "unknown"
    | RecommendationOutcomeStatus;
  confidence_bucket:
    | "all"
    | "0_39"
    | "40_59"
    | "60_74"
    | "75_89"
    | "90_100"
    | "unknown";
  window: "all" | RecommendationSnapshotWindow;
};

export type RecommendationHistorySort =
  | "newest"
  | "oldest"
  | "best_r"
  | "worst_r";

export type RecommendationHistory = {
  history_id: string;
  history_version: "1.0";
  generated_at: string;
  source_scope: "current_visible" | "local_history" | "mixed" | "unknown";
  filters: RecommendationHistoryFilter;
  sort: RecommendationHistorySort;
  summary: RecommendationHistorySummary;
  items: RecommendationHistoryItem[];
  filtered_items: RecommendationHistoryItem[];
  warnings: RecommendationHistoryWarning[];
  copy: {
    purpose: string;
    data_dependency: string;
    disclaimer: string;
  };
};

export type RecommendationHistoryInput = {
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  linked_trades?: RecommendationHistoryLinkedTrade[];
  filters?: Partial<RecommendationHistoryFilter>;
  sort?: RecommendationHistorySort;
  now?: Date | string | null;
  source_scope?: RecommendationHistory["source_scope"];
};

export const defaultRecommendationHistoryFilter: RecommendationHistoryFilter = {
  taken: "all",
  outcome: "all",
  confidence_bucket: "all",
  window: "all",
};

const evaluatedStatuses = new Set<RecommendationOutcomeStatus>([
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
  return toDate(value)?.getTime() ?? 0;
}

function warning(
  warningId: string,
  message: string,
  severity: RecommendationHistoryWarning["severity"] = "warning",
): RecommendationHistoryWarning {
  return {
    warning_id: warningId,
    severity,
    message,
  };
}

function confidenceValue(snapshot: RecommendationSnapshot) {
  const value = snapshot.confidence;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function confidenceBucket(
  snapshot: RecommendationSnapshot,
): RecommendationHistoryFilter["confidence_bucket"] {
  const confidence = confidenceValue(snapshot);

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

function deriveHistoryStatus(snapshot: RecommendationSnapshot) {
  if (snapshot.status === "taken" || snapshot.was_taken) {
    return "taken";
  }

  if (snapshot.status === "ignored") {
    return "ignored";
  }

  return snapshot.status ?? "unknown";
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

  return candidates
    .slice()
    .sort((first, second) => {
      const firstPriority = evaluatedStatuses.has(first.status)
        ? 3
        : first.status === "unknown"
          ? 2
          : first.status === "incomplete" || first.status === "invalid"
            ? 1
            : 0;
      const secondPriority = evaluatedStatuses.has(second.status)
        ? 3
        : second.status === "unknown"
          ? 2
          : second.status === "incomplete" || second.status === "invalid"
            ? 1
            : 0;

      if (secondPriority !== firstPriority) {
        return secondPriority - firstPriority;
      }

      const firstEvaluatedAt = timestampMs(first.evaluated_at);
      const secondEvaluatedAt = timestampMs(second.evaluated_at);

      if (secondEvaluatedAt !== firstEvaluatedAt) {
        return secondEvaluatedAt - firstEvaluatedAt;
      }

      return timestampMs(second.updated_at) - timestampMs(first.updated_at);
    })[0] ?? null;
}

function isEvaluated(outcome: RecommendationOutcome | null) {
  return outcome !== null && evaluatedStatuses.has(outcome.status);
}

function isPending(outcome: RecommendationOutcome | null) {
  return outcome === null || outcome.status === "pending";
}

function isIncomplete(outcome: RecommendationOutcome | null) {
  return outcome?.status === "incomplete" || outcome?.status === "invalid";
}

function intakeQualityText(snapshot: RecommendationSnapshot, key: string) {
  const value = snapshot.intake_quality_json;

  if (value && typeof value === "object" && key in value) {
    const raw = (value as Record<string, unknown>)[key];
    return typeof raw === "string" && raw.trim().length > 0 ? raw : null;
  }

  return null;
}

function intakeQualityReasons(snapshot: RecommendationSnapshot) {
  const value = snapshot.intake_quality_json;

  if (value && typeof value === "object" && "reasons" in value) {
    const raw = (value as Record<string, unknown>).reasons;

    if (Array.isArray(raw)) {
      return raw.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
    }
  }

  return [];
}

function itemWarnings(
  snapshot: RecommendationSnapshot,
  outcome: RecommendationOutcome | null,
) {
  const warnings: string[] = [];

  if (!outcome) {
    warnings.push("Outcome has not been created for this recommendation yet.");
  } else {
    warnings.push(...outcome.warnings);

    if (outcome.blockers.length > 0) {
      warnings.push(...outcome.blockers);
    }
  }

  if (snapshot.entry === null || snapshot.stop === null || snapshot.target === null) {
    warnings.push("Trade plan is missing entry, stop, or target data.");
  }

  if (snapshot.data_age_minutes !== null && snapshot.data_age_minutes > 15) {
    warnings.push("Market data may have been stale when the recommendation was shown.");
  }

  return Array.from(new Set(warnings));
}

function buildItem(
  snapshot: RecommendationSnapshot,
  outcome: RecommendationOutcome | null,
  allOutcomes: RecommendationOutcome[],
  linkedTrade: RecommendationHistoryLinkedTrade | null,
): RecommendationHistoryItem {
  const status = deriveHistoryStatus(snapshot);
  const evaluated = isEvaluated(outcome);
  const pending = isPending(outcome);
  const incomplete = isIncomplete(outcome);
  const warnings = itemWarnings(snapshot, outcome);
  const entryPlanQuality = buildEntryPlanQualityForSnapshot(snapshot, allOutcomes);

  return {
    id: snapshot.snapshot_fingerprint,
    snapshot_id: snapshot.id,
    snapshot_fingerprint: snapshot.snapshot_fingerprint,
    recommendation_id: snapshot.recommendation_id,
    ticker: snapshot.ticker,
    company_name: snapshot.company_name,
    recommended_at: snapshot.recommended_at,
    day_trade_window: snapshot.window,
    status,
    source_mode: snapshot.source_mode,
    data_mode: snapshot.data_mode,
    confidence: snapshot.confidence,
    confidence_bucket: confidenceBucket(snapshot),
    score: snapshot.score,
    rating: snapshot.rating,
    entry: snapshot.entry,
    stop: snapshot.stop,
    target: snapshot.target,
    planned_risk_reward: snapshot.planned_risk_reward,
    side: snapshot.side,
    rationale: snapshot.rationale,
    reason: snapshot.reason,
    catalyst: snapshot.catalyst,
    primary_risk: snapshot.primary_risk,
    intake_quality_status: intakeQualityText(snapshot, "status"),
    intake_quality_grade: intakeQualityText(snapshot, "grade"),
    intake_quality_reasons: intakeQualityReasons(snapshot),
    freshness: snapshot.freshness,
    data_age_minutes: snapshot.data_age_minutes,
    linked_trade_id: snapshot.linked_position_id,
    linked_trade: linkedTrade,
    outcome: {
      status: outcome?.status ?? "missing",
      horizon: outcome?.horizon ?? "unknown",
      entry_triggered: outcome?.entry_triggered ?? null,
      target_hit: outcome?.target_hit ?? null,
      stop_hit: outcome?.stop_hit ?? null,
      first_terminal_event: outcome?.first_terminal_event ?? "unknown",
      best_r: outcome?.best_r ?? null,
      worst_r: outcome?.worst_r ?? null,
      eod_r: outcome?.eod_r ?? null,
      max_favorable_excursion: outcome?.max_favorable_excursion ?? null,
      max_adverse_excursion: outcome?.max_adverse_excursion ?? null,
      time_to_entry_minutes: outcome?.time_to_entry_minutes ?? null,
      time_to_target_minutes: outcome?.time_to_target_minutes ?? null,
      time_to_stop_minutes: outcome?.time_to_stop_minutes ?? null,
      execution_quality_label: entryPlanQuality.execution_quality_label,
      idea_moved_favorably: entryPlanQuality.idea_moved_favorably,
      entry_quality_reason: entryPlanQuality.entry_quality_reason,
      best_counterfactual_entry_variant:
        entryPlanQuality.best_counterfactual_entry_variant,
      would_have_triggered_with_variant:
        entryPlanQuality.would_have_triggered_with_variant,
      counterfactual_best_r: entryPlanQuality.counterfactual_best_r,
      counterfactual_worst_r: entryPlanQuality.counterfactual_worst_r,
      evaluated_at: outcome?.evaluated_at ?? null,
      warnings: warnings,
    },
    is_evaluated: evaluated,
    is_pending: pending,
    is_incomplete: incomplete,
    sort_timestamp:
      timestampMs(snapshot.recommended_at) ||
      timestampMs(snapshot.app_timestamp) ||
      timestampMs(snapshot.created_at),
    warnings,
  };
}

function passesFilters(
  item: RecommendationHistoryItem,
  filters: RecommendationHistoryFilter,
) {
  if (filters.taken === "taken" && item.status !== "taken") {
    return false;
  }

  if (
    filters.taken === "ignored" &&
    item.status !== "ignored" &&
    item.status !== "visible" &&
    item.status !== "hidden"
  ) {
    return false;
  }

  if (filters.taken === "unknown" && item.status !== "unknown") {
    return false;
  }

  if (filters.window !== "all" && item.day_trade_window !== filters.window) {
    return false;
  }

  if (
    filters.confidence_bucket !== "all" &&
    item.confidence_bucket !== filters.confidence_bucket
  ) {
    return false;
  }

  if (filters.outcome === "evaluated" && !item.is_evaluated) {
    return false;
  }

  if (filters.outcome === "pending" && !item.is_pending) {
    return false;
  }

  if (filters.outcome === "incomplete" && !item.is_incomplete) {
    return false;
  }

  if (filters.outcome === "unknown" && item.outcome.status !== "unknown") {
    return false;
  }

  if (
    filters.outcome !== "all" &&
    filters.outcome !== "evaluated" &&
    filters.outcome !== "pending" &&
    filters.outcome !== "incomplete" &&
    filters.outcome !== "unknown" &&
    item.outcome.status !== filters.outcome
  ) {
    return false;
  }

  return true;
}

function sortItems(
  items: RecommendationHistoryItem[],
  sort: RecommendationHistorySort,
) {
  return items.slice().sort((first, second) => {
    if (sort === "oldest") {
      return first.sort_timestamp - second.sort_timestamp;
    }

    if (sort === "best_r") {
      return (
        (finiteNumber(second.outcome.best_r) ?? Number.NEGATIVE_INFINITY) -
        (finiteNumber(first.outcome.best_r) ?? Number.NEGATIVE_INFINITY)
      );
    }

    if (sort === "worst_r") {
      return (
        (finiteNumber(first.outcome.worst_r) ?? Number.POSITIVE_INFINITY) -
        (finiteNumber(second.outcome.worst_r) ?? Number.POSITIVE_INFINITY)
      );
    }

    return second.sort_timestamp - first.sort_timestamp;
  });
}

export function buildRecommendationHistory(
  input: RecommendationHistoryInput,
): RecommendationHistory {
  const now = toDate(input.now ?? null) ?? new Date();
  const filters: RecommendationHistoryFilter = {
    ...defaultRecommendationHistoryFilter,
    ...input.filters,
  };
  const sort = input.sort ?? "newest";
  const uniqueSnapshots = Array.from(
    new Map(
      input.snapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]),
    ).values(),
  );
  const linkedTradeById = new Map(
    (input.linked_trades ?? []).map((trade) => [trade.id, trade]),
  );
  const items = sortItems(
    uniqueSnapshots.map((snapshot) => {
      const snapshotOutcomes = input.outcomes.filter(
        (outcome) =>
          outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint ||
          (snapshot.recommendation_id !== null &&
            outcome.recommendation_id === snapshot.recommendation_id),
      );

      return buildItem(
        snapshot,
        latestOutcomeForSnapshot(snapshot, snapshotOutcomes),
        snapshotOutcomes,
        snapshot.linked_position_id
          ? linkedTradeById.get(snapshot.linked_position_id) ?? null
          : null,
      );
    }),
    sort,
  );
  const filteredItems = items.filter((item) => passesFilters(item, filters));
  const evaluatedItems = items.filter((item) => item.is_evaluated);
  const pendingCount = items.filter((item) => item.is_pending).length;
  const incompleteCount = items.filter((item) => item.is_incomplete).length;
  const unknownCount = items.filter((item) => item.outcome.status === "unknown").length;
  const warnings: RecommendationHistoryWarning[] = [];

  if (items.length === 0) {
    warnings.push(
      warning(
        "no_snapshots",
        "No recommendation snapshots are available yet.",
        "info",
      ),
    );
  }

  if (pendingCount > 0) {
    warnings.push(
      warning(
        "pending_outcomes",
        `${pendingCount} recommendation outcome${pendingCount === 1 ? "" : "s"} are still pending.`,
        "info",
      ),
    );
  }

  if (incompleteCount > 0) {
    warnings.push(
      warning(
        "incomplete_outcomes",
        `${incompleteCount} recommendation outcome${incompleteCount === 1 ? "" : "s"} are incomplete, often because candles are missing.`,
      ),
    );
  }

  if (items.some((item) => item.confidence_bucket === "unknown")) {
    warnings.push(
      warning(
        "missing_confidence",
        "Some recommendation snapshots are missing confidence values.",
        "info",
      ),
    );
  }

  return {
    history_id: `recommendation_history:${now.toISOString()}`,
    history_version: "1.0",
    generated_at: now.toISOString(),
    source_scope: input.source_scope ?? "unknown",
    filters,
    sort,
    summary: {
      total_recommendations: items.length,
      visible_recommendations: items.filter((item) => item.status === "visible")
        .length,
      taken_recommendations: items.filter((item) => item.status === "taken").length,
      ignored_recommendations: items.filter(
        (item) =>
          item.status === "ignored" ||
          item.status === "visible" ||
          item.status === "hidden",
      ).length,
      evaluated_recommendations: evaluatedItems.length,
      pending_outcomes: pendingCount,
      incomplete_outcomes: incompleteCount,
      unknown_outcomes: unknownCount,
      target_before_stop: evaluatedItems.filter(
        (item) => item.outcome.status === "target_before_stop",
      ).length,
      stop_before_target: evaluatedItems.filter(
        (item) => item.outcome.status === "stop_before_target",
      ).length,
      entry_not_triggered: evaluatedItems.filter(
        (item) => item.outcome.status === "entry_not_triggered",
      ).length,
      average_best_r: average(evaluatedItems.map((item) => item.outcome.best_r)),
      average_worst_r: average(evaluatedItems.map((item) => item.outcome.worst_r)),
    },
    items,
    filtered_items: filteredItems,
    warnings,
    copy: {
      purpose:
        "Recommendation History tracks what Ture recommended, even if no trade was taken.",
      data_dependency: "Outcome data depends on available intraday candles.",
      disclaimer:
        "This is historical analysis, not a guarantee of future performance.",
    },
  };
}

export function recommendationHistoryJson(history: RecommendationHistory) {
  return JSON.stringify(history, null, 2);
}
