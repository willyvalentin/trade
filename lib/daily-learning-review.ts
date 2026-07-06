import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type {
  RecommendationOutcome,
  RecommendationOutcomeStatus,
} from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export type DailyLearningReviewVisibility =
  | "visible"
  | "research_only"
  | "unknown";

export type DailyLearningReviewConfidence = "low" | "medium" | "high";

export type DailyLearningReviewAdjustmentCandidate =
  | "target_too_far"
  | "stop_too_tight"
  | "weak_follow_through"
  | "research_outperforming_visible"
  | "visible_outperforming_research"
  | "entry_not_triggering"
  | "poor_power_hour_follow_through"
  | "insufficient_sample_size";

export type DailyLearningReviewMetricSummary = {
  outcome_count: number;
  entry_triggered_count: number;
  entry_triggered_rate: number | null;
  target_hit_count: number;
  target_hit_rate: number | null;
  stop_hit_count: number;
  stop_hit_rate: number | null;
  neither_hit_count: number;
  neither_hit_rate: number | null;
  entry_not_triggered_count: number;
  entry_not_triggered_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_terminal_r: number | null;
};

export type DailyLearningReviewTickerSummary = {
  ticker: string;
  outcome_count: number;
  average_best_r: number | null;
  average_worst_r: number | null;
};

export type DailyLearningReviewGroupSummary = DailyLearningReviewMetricSummary & {
  group_type: "setup_type" | "entry_type" | "entry_trigger_semantics" | "window" | "tier";
  key: string;
};

export type DailyLearningReviewEngineAdjustment = {
  candidate: DailyLearningReviewAdjustmentCandidate;
  confidence: DailyLearningReviewConfidence;
  reason: string;
};

export type DailyLearningReviewSummary = {
  summary_version: "1.0";
  summary_kind: "daily_learning_review";
  generated_at: string;
  trading_day: string | null;
  latest_evaluated_batch_fingerprint: string | null;
  latest_evaluated_batch_outcome_count: number;
  scan_windows: string[];
  evaluated_outcome_count: number;
  visible_evaluated_count: number;
  research_only_evaluated_count: number;
  unknown_visibility_evaluated_count: number;
  latest_batch_visible_evaluated_count: number;
  latest_batch_research_only_evaluated_count: number;
  metrics: DailyLearningReviewMetricSummary;
  visible_metrics: DailyLearningReviewMetricSummary;
  research_only_metrics: DailyLearningReviewMetricSummary;
  visible_vs_research_only_comparison: {
    visible_outcome_count: number;
    research_only_outcome_count: number;
    visible_average_best_r: number | null;
    research_only_average_best_r: number | null;
    visible_average_worst_r: number | null;
    research_only_average_worst_r: number | null;
    average_best_r_delta_research_minus_visible: number | null;
    average_worst_r_delta_research_minus_visible: number | null;
    summary: string;
  };
  top_positive_tickers_by_avg_best_r: DailyLearningReviewTickerSummary[];
  weakest_tickers_by_avg_worst_r: DailyLearningReviewTickerSummary[];
  group_breakdowns: DailyLearningReviewGroupSummary[];
  engine_adjustment_candidates: DailyLearningReviewEngineAdjustment[];
  sample_size_label: DailyLearningReviewConfidence;
  duplicate_outcome_rows_ignored_count: number;
};

export type DailyLearningReviewInput = {
  trading_day?: string | null;
  latest_batch_fingerprint?: string | null;
  batches?: RecommendationBatch[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  now?: Date | string | null;
};

type ReviewOutcome = {
  outcome: RecommendationOutcome;
  snapshot: RecommendationSnapshot | null;
  batch_fingerprint: string | null;
  visibility: DailyLearningReviewVisibility;
  ticker: string;
  window: string;
  tier: string;
  setup_type: string;
  entry_type: string;
  entry_trigger_semantics: string;
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

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  return null;
}

function getNewYorkDate(value: Date | string | null | undefined) {
  const date = toDate(value);
  if (!date) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : "UNKNOWN";
}

function rate(part: number, total: number) {
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

function numberDelta(first: number | null, second: number | null) {
  return first !== null && second !== null ? first - second : null;
}

function payloadBatchFingerprint(
  payload: Record<string, unknown> | null | undefined,
) {
  return (
    textOrNull(payload?.batch_fingerprint) ??
    textOrNull(payload?.recommendation_batch_fingerprint) ??
    textOrNull(payload?.batchFingerprint) ??
    textOrNull(payload?.research_batch_fingerprint) ??
    null
  );
}

function snapshotBatchFingerprint(snapshot: RecommendationSnapshot | null) {
  if (!snapshot) return null;

  return payloadBatchFingerprint(snapshot.payload_json);
}

function outcomeBatchFingerprint(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
) {
  return (
    snapshotBatchFingerprint(snapshot) ??
    payloadBatchFingerprint(objectValue(outcome.payload_json)) ??
    null
  );
}

function payloadFlag(payload: Record<string, unknown> | null, key: string) {
  return payload?.[key] === true;
}

function visibilityFromOutcomePayload(
  payload: Record<string, unknown> | null,
): DailyLearningReviewVisibility | null {
  const visibilityStatus = textOrNull(payload?.visibility_status)?.toLowerCase();
  const sourceMode = textOrNull(payload?.source_mode)?.toLowerCase();
  const learningScope = textOrNull(payload?.learning_scope)?.toLowerCase();

  if (
    visibilityStatus === "research_only" ||
    sourceMode === "research_only" ||
    learningScope === "research_only" ||
    payloadFlag(payload, "learning_acceleration_sample") ||
    payloadFlag(payload, "research_only") ||
    payloadFlag(payload, "not_live_signal")
  ) {
    return "research_only";
  }

  if (visibilityStatus === "visible" || payload?.is_visible === true) {
    return "visible";
  }

  return null;
}

function isResearchOnlySnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.source_mode === "research_only" ||
    snapshot.data_mode === "research_only" ||
    payload.visibility_status === "research_only" ||
    payload.learning_acceleration_sample === true ||
    payload.research_only === true ||
    payload.source_mode === "research_only" ||
    payload.learning_scope === "research_only"
  );
}

function isHiddenOrArchivedSnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;
  const visibilityStatus = textOrNull(payload.visibility_status);

  return (
    snapshot.is_visible === false ||
    snapshot.status === "hidden" ||
    snapshot.status === "expired" ||
    snapshot.status === "invalid" ||
    visibilityStatus === "hidden" ||
    visibilityStatus === "archived" ||
    visibilityStatus === "retained" ||
    payload.archived === true ||
    payload.retained_readback === true
  );
}

function visibilityFor(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
): DailyLearningReviewVisibility {
  if (snapshot && isResearchOnlySnapshot(snapshot)) return "research_only";
  if (snapshot && !isHiddenOrArchivedSnapshot(snapshot)) return "visible";

  return (
    visibilityFromOutcomePayload(objectValue(outcome.payload_json)) ??
    (snapshot?.is_visible === true ? "visible" : "unknown")
  );
}

function tierFromPayload(payload: Record<string, unknown> | null) {
  const target = objectValue(payload?.day_trade_window_recommendation_target);
  const recommendation = objectValue(payload?.recommendation);
  const contract = objectValue(payload?.openai_reality_contract);
  const metadata = objectValue(payload?.metadata);
  const tier = textOrNull(
    target?.tier ??
      target?.recommendation_tier ??
      recommendation?.tier ??
      recommendation?.recommendation_tier ??
      contract?.tier ??
      contract?.recommendation_tier ??
      metadata?.tier ??
      metadata?.recommendation_tier ??
      payload?.tier,
  )?.toLowerCase();

  if (tier === "strong" || tier === "valid" || tier === "experimental") {
    return tier;
  }

  return "unknown";
}

function setupTypeFromPayload(payload: Record<string, unknown> | null) {
  const recommendation = objectValue(payload?.recommendation);
  const metadata = objectValue(payload?.metadata);

  return (
    textOrNull(payload?.setup_type) ??
    textOrNull(recommendation?.setup_type) ??
    textOrNull(metadata?.setup_type) ??
    "unknown"
  );
}

function entryTypeFromPayload(payload: Record<string, unknown> | null) {
  const entryType = objectValue(payload?.entry_type_metadata);
  const recommendation = objectValue(payload?.recommendation);
  const metadata = objectValue(payload?.metadata);

  return (
    textOrNull(entryType?.entry_type) ??
    textOrNull(payload?.entry_type) ??
    textOrNull(recommendation?.entry_type) ??
    textOrNull(metadata?.entry_type) ??
    "unknown"
  );
}

function triggerSemanticsFromPayload(payload: Record<string, unknown> | null) {
  const entryType = objectValue(payload?.entry_type_metadata);
  const trigger = objectValue(payload?.entry_type_aware_trigger);

  return (
    textOrNull(trigger?.trigger_semantics) ??
    textOrNull(entryType?.trigger_semantics) ??
    textOrNull(payload?.entry_trigger_semantics) ??
    "unknown"
  );
}

function windowFrom(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
) {
  const outcomePayload = objectValue(outcome.payload_json);
  const snapshotPayload = snapshot?.payload_json ?? null;

  return (
    textOrNull(snapshot?.window) ??
    textOrNull(snapshotPayload?.source_window) ??
    textOrNull(snapshotPayload?.scan_window) ??
    textOrNull(outcomePayload?.source_window) ??
    textOrNull(outcomePayload?.scan_window) ??
    "unknown"
  );
}

function terminalR(outcome: RecommendationOutcome) {
  const payload = objectValue(outcome.payload_json);

  return (
    finiteNumber(outcome.eod_r) ??
    finiteNumber(outcome.current_r) ??
    finiteNumber(payload?.terminal_r) ??
    finiteNumber(payload?.realized_r) ??
    null
  );
}

function targetHit(outcome: RecommendationOutcome) {
  return (
    outcome.target_hit === true ||
    outcome.status === "target_hit" ||
    outcome.status === "target_before_stop"
  );
}

function stopHit(outcome: RecommendationOutcome) {
  return (
    outcome.stop_hit === true ||
    outcome.status === "stop_hit" ||
    outcome.status === "stop_before_target"
  );
}

function entryNotTriggered(outcome: RecommendationOutcome) {
  return outcome.entry_triggered === false || outcome.status === "entry_not_triggered";
}

function completenessRank(outcome: RecommendationOutcome) {
  return outcome.data_completeness === "complete"
    ? 3
    : outcome.data_completeness === "partial"
      ? 2
      : outcome.data_completeness === "none"
        ? 1
        : 0;
}

function statusRank(outcome: RecommendationOutcome) {
  return evaluatedStatuses.has(outcome.status)
    ? 3
    : outcome.status === "incomplete" || outcome.status === "unknown"
      ? 1
      : 0;
}

function timestampMs(value: string | null | undefined) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function isBetterOutcome(
  candidate: RecommendationOutcome,
  current: RecommendationOutcome,
) {
  const candidateRank = completenessRank(candidate) * 10 + statusRank(candidate);
  const currentRank = completenessRank(current) * 10 + statusRank(current);

  if (candidateRank !== currentRank) return candidateRank > currentRank;

  return (
    Math.max(
      timestampMs(candidate.updated_at),
      timestampMs(candidate.evaluated_at),
      timestampMs(candidate.created_at),
    ) >
    Math.max(
      timestampMs(current.updated_at),
      timestampMs(current.evaluated_at),
      timestampMs(current.created_at),
    )
  );
}

function dedupeReviewOutcomes(outcomes: RecommendationOutcome[]) {
  let duplicateCount = 0;
  const byKey = new Map<string, RecommendationOutcome>();

  for (const outcome of outcomes) {
    const identity =
      textOrNull(outcome.snapshot_fingerprint) ??
      textOrNull(outcome.recommendation_id) ??
      normalizeTicker(outcome.ticker);
    const key = `${identity}:${outcome.horizon ?? "unknown"}`;
    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, outcome);
      continue;
    }

    duplicateCount += 1;
    if (isBetterOutcome(outcome, current)) {
      byKey.set(key, outcome);
    }
  }

  return {
    outcomes: Array.from(byKey.values()),
    duplicateCount,
  };
}

function sampleConfidence(outcomeCount: number): DailyLearningReviewConfidence {
  if (outcomeCount >= 100) return "high";
  if (outcomeCount >= 30) return "medium";
  return "low";
}

function metricsFor(items: ReviewOutcome[]): DailyLearningReviewMetricSummary {
  const outcomeCount = items.length;
  const entryTriggeredCount = items.filter(
    (item) => item.outcome.entry_triggered === true,
  ).length;
  const targetHitCount = items.filter((item) => targetHit(item.outcome)).length;
  const stopHitCount = items.filter((item) => stopHit(item.outcome)).length;
  const entryNotTriggeredCount = items.filter((item) =>
    entryNotTriggered(item.outcome),
  ).length;
  const neitherHitCount = items.filter(
    (item) =>
      !targetHit(item.outcome) &&
      !stopHit(item.outcome) &&
      !entryNotTriggered(item.outcome),
  ).length;

  return {
    outcome_count: outcomeCount,
    entry_triggered_count: entryTriggeredCount,
    entry_triggered_rate: rate(entryTriggeredCount, outcomeCount),
    target_hit_count: targetHitCount,
    target_hit_rate: rate(targetHitCount, outcomeCount),
    stop_hit_count: stopHitCount,
    stop_hit_rate: rate(stopHitCount, outcomeCount),
    neither_hit_count: neitherHitCount,
    neither_hit_rate: rate(neitherHitCount, outcomeCount),
    entry_not_triggered_count: entryNotTriggeredCount,
    entry_not_triggered_rate: rate(entryNotTriggeredCount, outcomeCount),
    average_best_r: average(items.map((item) => item.outcome.best_r)),
    average_worst_r: average(items.map((item) => item.outcome.worst_r)),
    average_terminal_r: average(items.map((item) => terminalR(item.outcome))),
  };
}

function tickerSummaries(
  items: ReviewOutcome[],
  sortBy: "best" | "worst",
): DailyLearningReviewTickerSummary[] {
  const groups = new Map<string, ReviewOutcome[]>();

  for (const item of items) {
    const current = groups.get(item.ticker) ?? [];
    current.push(item);
    groups.set(item.ticker, current);
  }

  return Array.from(groups.entries())
    .map(([ticker, group]) => ({
      ticker,
      outcome_count: group.length,
      average_best_r: average(group.map((item) => item.outcome.best_r)),
      average_worst_r: average(group.map((item) => item.outcome.worst_r)),
    }))
    .filter((item) =>
      sortBy === "best"
        ? item.average_best_r !== null
        : item.average_worst_r !== null,
    )
    .sort((first, second) =>
      sortBy === "best"
        ? (second.average_best_r ?? Number.NEGATIVE_INFINITY) -
          (first.average_best_r ?? Number.NEGATIVE_INFINITY)
        : (first.average_worst_r ?? Number.POSITIVE_INFINITY) -
          (second.average_worst_r ?? Number.POSITIVE_INFINITY),
    )
    .slice(0, 5);
}

function groupSummary(
  items: ReviewOutcome[],
  groupType: DailyLearningReviewGroupSummary["group_type"],
  keySelector: (item: ReviewOutcome) => string,
) {
  const groups = new Map<string, ReviewOutcome[]>();

  for (const item of items) {
    const key = textOrNull(keySelector(item)) ?? "unknown";
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => ({
      group_type: groupType,
      key,
      ...metricsFor(group),
    }))
    .sort((first, second) => second.outcome_count - first.outcome_count);
}

function comparisonSummary(input: {
  visible: DailyLearningReviewMetricSummary;
  research: DailyLearningReviewMetricSummary;
}) {
  const bestDelta = numberDelta(
    input.research.average_best_r,
    input.visible.average_best_r,
  );
  const worstDelta = numberDelta(
    input.research.average_worst_r,
    input.visible.average_worst_r,
  );
  let summary = "Not enough visible/research-only overlap yet.";

  if (
    input.visible.outcome_count > 0 &&
    input.research.outcome_count > 0 &&
    bestDelta !== null
  ) {
    if (bestDelta >= 0.25) {
      summary = "Research-only samples are showing stronger average best R.";
    } else if (bestDelta <= -0.25) {
      summary = "Visible recommendations are outperforming research-only samples.";
    } else {
      summary = "Visible and research-only samples are broadly similar so far.";
    }
  }

  return {
    visible_outcome_count: input.visible.outcome_count,
    research_only_outcome_count: input.research.outcome_count,
    visible_average_best_r: input.visible.average_best_r,
    research_only_average_best_r: input.research.average_best_r,
    visible_average_worst_r: input.visible.average_worst_r,
    research_only_average_worst_r: input.research.average_worst_r,
    average_best_r_delta_research_minus_visible: bestDelta,
    average_worst_r_delta_research_minus_visible: worstDelta,
    summary,
  };
}

function addAdjustment(
  adjustments: DailyLearningReviewEngineAdjustment[],
  candidate: DailyLearningReviewAdjustmentCandidate,
  confidence: DailyLearningReviewConfidence,
  reason: string,
) {
  if (adjustments.some((item) => item.candidate === candidate)) return;
  adjustments.push({ candidate, confidence, reason });
}

function engineAdjustments(input: {
  items: ReviewOutcome[];
  metrics: DailyLearningReviewMetricSummary;
  visibleMetrics: DailyLearningReviewMetricSummary;
  researchMetrics: DailyLearningReviewMetricSummary;
  confidence: DailyLearningReviewConfidence;
}) {
  const adjustments: DailyLearningReviewEngineAdjustment[] = [];

  if (input.metrics.outcome_count < 30) {
    addAdjustment(
      adjustments,
      "insufficient_sample_size",
      input.confidence,
      "Fewer than 30 evaluated outcomes; keep collecting before changing scoring.",
    );
  }

  if (
    (input.metrics.average_best_r ?? 0) >= 0.5 &&
    (input.metrics.target_hit_rate ?? 0) < 20
  ) {
    addAdjustment(
      adjustments,
      "target_too_far",
      input.confidence,
      "Average favorable movement is meaningful but target hit rate is still low.",
    );
  }

  if ((input.metrics.stop_hit_rate ?? 0) >= 35) {
    addAdjustment(
      adjustments,
      "stop_too_tight",
      input.confidence,
      "Stop hits are a large share of evaluated outcomes.",
    );
  }

  if (
    (input.metrics.entry_triggered_rate ?? 0) >= 50 &&
    (input.metrics.target_hit_rate ?? 0) < 15 &&
    (input.metrics.average_best_r ?? 0) < 0.25
  ) {
    addAdjustment(
      adjustments,
      "weak_follow_through",
      input.confidence,
      "Entries are triggering but average follow-through is weak.",
    );
  }

  if ((input.metrics.entry_not_triggered_rate ?? 0) >= 40) {
    addAdjustment(
      adjustments,
      "entry_not_triggering",
      input.confidence,
      "A high share of plans never triggered entry.",
    );
  }

  const powerHourItems = input.items.filter((item) => item.window === "power_hour");
  const powerHourMetrics = metricsFor(powerHourItems);

  if (
    powerHourMetrics.outcome_count >= 3 &&
    (powerHourMetrics.average_best_r ?? 0) < 0.25 &&
    (powerHourMetrics.target_hit_rate ?? 0) < 20
  ) {
    addAdjustment(
      adjustments,
      "poor_power_hour_follow_through",
      input.confidence,
      "Power Hour samples are not showing useful follow-through yet.",
    );
  }

  const bestDelta = numberDelta(
    input.researchMetrics.average_best_r,
    input.visibleMetrics.average_best_r,
  );

  if (
    bestDelta !== null &&
    input.researchMetrics.outcome_count >= 3 &&
    input.visibleMetrics.outcome_count >= 3
  ) {
    if (bestDelta >= 0.25) {
      addAdjustment(
        adjustments,
        "research_outperforming_visible",
        input.confidence,
        "Research-only samples have higher average best R than visible recommendations.",
      );
    } else if (bestDelta <= -0.25) {
      addAdjustment(
        adjustments,
        "visible_outperforming_research",
        input.confidence,
        "Visible recommendations have higher average best R than research-only samples.",
      );
    }
  }

  return adjustments;
}

function resolveLatestBatchFingerprint(input: DailyLearningReviewInput) {
  if (textOrNull(input.latest_batch_fingerprint)) {
    return textOrNull(input.latest_batch_fingerprint);
  }

  const latestBatch = [...(input.batches ?? [])]
    .filter((batch) => textOrNull(batch.batch_fingerprint) !== null)
    .sort(
      (first, second) =>
        timestampMs(second.published_at ?? second.observed_at) -
        timestampMs(first.published_at ?? first.observed_at),
    )[0];

  return latestBatch?.batch_fingerprint ?? null;
}

function reviewRows(input: DailyLearningReviewInput) {
  const snapshotsByFingerprint = new Map(
    input.snapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]),
  );
  const snapshotsByRecommendationId = new Map(
    input.snapshots
      .filter((snapshot) => snapshot.recommendation_id !== null)
      .map((snapshot) => [snapshot.recommendation_id as string, snapshot]),
  );
  const deduped = dedupeReviewOutcomes(input.outcomes);

  return {
    duplicateCount: deduped.duplicateCount,
    rows: deduped.outcomes
      .filter((outcome) => evaluatedStatuses.has(outcome.status))
      .map((outcome): ReviewOutcome => {
        const snapshot =
          (outcome.snapshot_fingerprint
            ? snapshotsByFingerprint.get(outcome.snapshot_fingerprint) ?? null
            : null) ??
          (outcome.recommendation_id
            ? snapshotsByRecommendationId.get(outcome.recommendation_id) ?? null
            : null);
        const outcomePayload = objectValue(outcome.payload_json);
        const snapshotPayload = snapshot?.payload_json ?? null;

        return {
          outcome,
          snapshot,
          batch_fingerprint: outcomeBatchFingerprint(outcome, snapshot),
          visibility: visibilityFor(outcome, snapshot),
          ticker: normalizeTicker(outcome.ticker ?? snapshot?.ticker ?? null),
          window: windowFrom(outcome, snapshot),
          tier: tierFromPayload(snapshotPayload ?? outcomePayload),
          setup_type: setupTypeFromPayload(snapshotPayload ?? outcomePayload),
          entry_type: entryTypeFromPayload(snapshotPayload ?? outcomePayload),
          entry_trigger_semantics: triggerSemanticsFromPayload(
            snapshotPayload ?? outcomePayload,
          ),
        };
      }),
  };
}

export function buildDailyLearningReviewSummary(
  input: DailyLearningReviewInput,
): DailyLearningReviewSummary {
  const now = toDate(input.now) ?? new Date();
  const tradingDay = input.trading_day ?? getNewYorkDate(now);
  const latestBatchFingerprint = resolveLatestBatchFingerprint(input);
  const review = reviewRows(input);
  const dayRows =
    tradingDay === null
      ? review.rows
      : review.rows.filter(
          (item) =>
            getNewYorkDate(item.outcome.evaluated_at ?? item.outcome.updated_at) ===
            tradingDay,
        );
  const latestBatchRows =
    latestBatchFingerprint === null
      ? []
      : review.rows.filter(
          (item) => item.batch_fingerprint === latestBatchFingerprint,
        );
  const visibleRows = dayRows.filter((item) => item.visibility === "visible");
  const researchRows = dayRows.filter(
    (item) => item.visibility === "research_only",
  );
  const metrics = metricsFor(dayRows);
  const visibleMetrics = metricsFor(visibleRows);
  const researchMetrics = metricsFor(researchRows);
  const confidence = sampleConfidence(metrics.outcome_count);

  return {
    summary_version: "1.0",
    summary_kind: "daily_learning_review",
    generated_at: now.toISOString(),
    trading_day: tradingDay,
    latest_evaluated_batch_fingerprint: latestBatchFingerprint,
    latest_evaluated_batch_outcome_count: latestBatchRows.length,
    scan_windows: Array.from(new Set(dayRows.map((item) => item.window))).sort(),
    evaluated_outcome_count: metrics.outcome_count,
    visible_evaluated_count: visibleRows.length,
    research_only_evaluated_count: researchRows.length,
    unknown_visibility_evaluated_count: dayRows.filter(
      (item) => item.visibility === "unknown",
    ).length,
    latest_batch_visible_evaluated_count: latestBatchRows.filter(
      (item) => item.visibility === "visible",
    ).length,
    latest_batch_research_only_evaluated_count: latestBatchRows.filter(
      (item) => item.visibility === "research_only",
    ).length,
    metrics,
    visible_metrics: visibleMetrics,
    research_only_metrics: researchMetrics,
    visible_vs_research_only_comparison: comparisonSummary({
      visible: visibleMetrics,
      research: researchMetrics,
    }),
    top_positive_tickers_by_avg_best_r: tickerSummaries(dayRows, "best"),
    weakest_tickers_by_avg_worst_r: tickerSummaries(dayRows, "worst"),
    group_breakdowns: [
      ...groupSummary(dayRows, "setup_type", (item) => item.setup_type),
      ...groupSummary(dayRows, "entry_type", (item) => item.entry_type),
      ...groupSummary(
        dayRows,
        "entry_trigger_semantics",
        (item) => item.entry_trigger_semantics,
      ),
      ...groupSummary(dayRows, "window", (item) => item.window),
      ...groupSummary(dayRows, "tier", (item) => item.tier),
    ],
    engine_adjustment_candidates: engineAdjustments({
      items: dayRows,
      metrics,
      visibleMetrics,
      researchMetrics,
      confidence,
    }),
    sample_size_label: confidence,
    duplicate_outcome_rows_ignored_count: review.duplicateCount,
  };
}

export function dailyLearningReviewSummaryJson(
  summary: DailyLearningReviewSummary,
) {
  return JSON.stringify(summary, null, 2);
}
