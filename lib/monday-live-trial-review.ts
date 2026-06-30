import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type {
  RecommendationOutcome,
  RecommendationOutcomeStatus,
} from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export type MondayLiveTrialReviewClassification =
  | "target_hit"
  | "stop_hit"
  | "promising_but_target_too_far"
  | "weak_followthrough"
  | "adverse_move"
  | "stale_plan_adverse_move"
  | "flat_no_followthrough"
  | "unknown";

export type MondayLiveTrialReviewRow = {
  ticker: string;
  tier: "strong" | "valid" | "experimental" | "unknown";
  side: string;
  entry: number | null;
  stop: number | null;
  target: number | null;
  entry_drift_pct: number | null;
  target_distance_pct: number | null;
  plan_freshness_classification: string;
  entry_triggered: boolean | null;
  target_hit: boolean | null;
  stop_hit: boolean | null;
  best_r: number | null;
  worst_r: number | null;
  classification: MondayLiveTrialReviewClassification;
  learning_note: string;
  horizons: string[];
  outcome_rows_evaluated: number;
};

export type MondayLiveTrialReviewSummary = {
  summary_version: "1.0";
  summary_kind: "monday_live_trial_review";
  batch_fingerprint: string | null;
  scan_run_fingerprint: string | null;
  trading_day: string | null;
  stored_window: string | null;
  time_window: string | null;
  tickers: string[];
  visible_recommendation_count: number;
  outcome_rows_evaluated: number;
  horizons_covered: string[];
  latest_evaluated_at: string | null;
  rows: MondayLiveTrialReviewRow[];
  aggregate: {
    recommendation_count: number;
    target_hit_count: number;
    target_hit_rate: number | null;
    stop_hit_count: number;
    stop_hit_rate: number | null;
    neither_hit_count: number;
    neither_hit_rate: number | null;
    average_best_r: number | null;
    average_worst_r: number | null;
    median_best_r: number | null;
    promising_but_target_too_far_count: number;
    weak_followthrough_count: number;
    adverse_move_count: number;
    stale_plan_adverse_move_count: number;
    average_entry_drift_pct: number | null;
    worst_entry_drift_ticker: string | null;
  };
  primary_note: string;
};

export type MondayLiveTrialReviewInput = {
  batch: RecommendationBatch | null;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  visibleRecommendationCount?: number | null;
};

const completedStatuses = new Set<RecommendationOutcomeStatus>([
  "entry_not_triggered",
  "entry_triggered",
  "target_hit",
  "stop_hit",
  "target_before_stop",
  "stop_before_target",
  "neither_hit",
  "expired",
]);

const horizonOrder = ["15m", "30m", "60m", "eod", "next_open", "unknown"];

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
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

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : "UNKNOWN";
}

function normalizeTier(value: unknown): MondayLiveTrialReviewRow["tier"] | null {
  const tier = textOrNull(value)?.toLowerCase() ?? null;

  if (tier === "strong" || tier === "valid" || tier === "experimental") {
    return tier;
  }

  return null;
}

function tierFromSnapshot(snapshot: RecommendationSnapshot | null | undefined) {
  if (!snapshot) return "unknown";

  const payload = snapshot.payload_json;
  const target = objectValue(payload.day_trade_window_recommendation_target);
  const recommendation = objectValue(payload.recommendation);
  const contract = objectValue(payload.openai_reality_contract);
  const metadata = objectValue(payload.metadata);

  return (
    normalizeTier(
      target?.tier ??
        target?.recommendation_tier ??
        recommendation?.tier ??
        recommendation?.recommendation_tier ??
        contract?.tier ??
        contract?.recommendation_tier ??
        metadata?.tier ??
        metadata?.recommendation_tier ??
        snapshot.rating ??
        snapshot.label,
    ) ?? "unknown"
  );
}

function snapshotGroupKey(snapshot: RecommendationSnapshot) {
  const ticker = normalizeTicker(snapshot.ticker);
  const identity =
    textOrNull(snapshot.recommendation_id) ??
    textOrNull(snapshot.snapshot_fingerprint) ??
    ticker;

  return `${ticker}:${identity}`;
}

function outcomeGroupKey(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
) {
  const ticker = normalizeTicker(outcome.ticker ?? snapshot?.ticker ?? null);
  const identity =
    textOrNull(outcome.recommendation_id) ??
    textOrNull(snapshot?.recommendation_id) ??
    textOrNull(outcome.snapshot_fingerprint) ??
    textOrNull(snapshot?.snapshot_fingerprint) ??
    ticker;

  return `${ticker}:${identity}`;
}

function dateTime(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function outcomeQualityRank(outcome: RecommendationOutcome) {
  const completeness =
    outcome.data_completeness === "complete"
      ? 3
      : outcome.data_completeness === "partial"
        ? 2
        : outcome.data_completeness === "none"
          ? 1
          : 0;
  const status = completedStatuses.has(outcome.status)
    ? 3
    : outcome.status === "incomplete" || outcome.status === "unknown"
      ? 1
      : 0;

  return completeness * 10 + status;
}

function isBetterOutcome(
  candidate: RecommendationOutcome,
  current: RecommendationOutcome,
) {
  const candidateRank = outcomeQualityRank(candidate);
  const currentRank = outcomeQualityRank(current);

  if (candidateRank !== currentRank) {
    return candidateRank > currentRank;
  }

  return (
    Math.max(
      dateTime(candidate.updated_at),
      dateTime(candidate.evaluated_at),
      dateTime(candidate.created_at),
    ) >
    Math.max(
      dateTime(current.updated_at),
      dateTime(current.evaluated_at),
      dateTime(current.created_at),
    )
  );
}

function average(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length === 0
    ? null
    : finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function median(values: Array<number | null | undefined>) {
  const finiteValues = values
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    )
    .sort((first, second) => first - second);

  if (finiteValues.length === 0) return null;

  const midpoint = Math.floor(finiteValues.length / 2);

  return finiteValues.length % 2 === 0
    ? (finiteValues[midpoint - 1] + finiteValues[midpoint]) / 2
    : finiteValues[midpoint];
}

function rate(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function maximum(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length > 0 ? Math.max(...finiteValues) : null;
}

function minimum(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length > 0 ? Math.min(...finiteValues) : null;
}

function rollupBoolean(
  outcomes: RecommendationOutcome[],
  selector: (outcome: RecommendationOutcome) => boolean | null,
) {
  if (outcomes.some((outcome) => selector(outcome) === true)) return true;
  if (outcomes.some((outcome) => selector(outcome) === false)) return false;
  return null;
}

function outcomeTargetHit(outcome: RecommendationOutcome) {
  return (
    outcome.target_hit === true ||
    outcome.status === "target_hit" ||
    outcome.status === "target_before_stop"
  );
}

function outcomeStopHit(outcome: RecommendationOutcome) {
  return (
    outcome.stop_hit === true ||
    outcome.status === "stop_hit" ||
    outcome.status === "stop_before_target"
  );
}

function planFreshness(outcomes: RecommendationOutcome[]) {
  for (const outcome of outcomes) {
    const freshness = objectValue(outcome.payload_json.plan_price_freshness);

    if (freshness) {
      return {
        entryDriftPct: finiteNumber(
          freshness.entry_distance_from_first_candle_close_pct,
        ),
        targetDistancePct: finiteNumber(
          freshness.target_distance_from_first_candle_close_pct,
        ),
        classification: textOrNull(freshness.classification) ?? "unknown",
      };
    }
  }

  return {
    entryDriftPct: null,
    targetDistancePct: null,
    classification: "unknown",
  };
}

function isStaleFreshness(classification: string) {
  return (
    classification === "slightly_stale" ||
    classification === "stale" ||
    classification === "severe"
  );
}

export function classifyMondayLiveTrialReviewRow(input: {
  targetHit: boolean | null;
  stopHit: boolean | null;
  bestR: number | null;
  worstR: number | null;
  planFreshnessClassification: string;
}): MondayLiveTrialReviewClassification {
  const hasR =
    typeof input.bestR === "number" &&
    Number.isFinite(input.bestR) &&
    typeof input.worstR === "number" &&
    Number.isFinite(input.worstR);

  if (input.targetHit === true) return "target_hit";
  if (input.stopHit === true) return "stop_hit";
  if (!hasR) return "unknown";
  const bestR = input.bestR as number;
  const worstR = input.worstR as number;
  if (
    isStaleFreshness(input.planFreshnessClassification) &&
    worstR <= -0.5
  ) {
    return "stale_plan_adverse_move";
  }
  if (bestR >= 0.5) return "promising_but_target_too_far";
  if (Math.abs(bestR) <= 0.1 && Math.abs(worstR) <= 0.1) {
    return "flat_no_followthrough";
  }
  if (bestR > 0 && bestR < 0.25) return "weak_followthrough";
  if (worstR <= -0.5) return "adverse_move";

  return "unknown";
}

function signedR(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "unknown R";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}R`;
}

function learningNote(input: {
  ticker: string;
  classification: MondayLiveTrialReviewClassification;
  bestR: number | null;
  worstR: number | null;
  planFreshnessClassification: string;
}) {
  switch (input.classification) {
    case "target_hit":
      return `${input.ticker} reached target during the evaluated horizons.`;
    case "stop_hit":
      return `${input.ticker} hit stop; review entry timing and invalidation.`;
    case "promising_but_target_too_far":
      return `${input.ticker} moved ${signedR(input.bestR)} but target was too far away.`;
    case "weak_followthrough":
      return `${input.ticker} had weak follow-through after entry.`;
    case "adverse_move":
      return `${input.ticker} moved against the plan by ${signedR(input.worstR)}.`;
    case "stale_plan_adverse_move":
      return `${input.ticker} had ${input.planFreshnessClassification.replace(/_/g, " ")} plan drift and adverse movement.`;
    case "flat_no_followthrough":
      return `${input.ticker} was flat; no useful follow-through.`;
    case "unknown":
      return `${input.ticker} has incomplete outcome data; classification is unknown.`;
  }
}

function firstFinite(
  outcomes: RecommendationOutcome[],
  snapshot: RecommendationSnapshot | null,
  selector: (outcome: RecommendationOutcome) => number | null,
  snapshotValue: number | null,
) {
  return snapshotValue ?? outcomes.map(selector).find((value) => value !== null) ?? null;
}

function firstText(
  outcomes: RecommendationOutcome[],
  snapshot: RecommendationSnapshot | null,
  selector: (outcome: RecommendationOutcome) => string | null,
  snapshotValue: string | null,
) {
  return (
    textOrNull(snapshotValue) ??
    outcomes.map(selector).find((value) => textOrNull(value) !== null) ??
    "unknown"
  );
}

function horizonSort(first: string, second: string) {
  const firstIndex = horizonOrder.indexOf(first);
  const secondIndex = horizonOrder.indexOf(second);
  return (
    (firstIndex === -1 ? horizonOrder.length : firstIndex) -
    (secondIndex === -1 ? horizonOrder.length : secondIndex)
  );
}

function rowsFromInput(input: MondayLiveTrialReviewInput) {
  const snapshotsByFingerprint = new Map(
    input.snapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]),
  );
  const snapshotsByRecommendationId = new Map(
    input.snapshots
      .filter((snapshot) => snapshot.recommendation_id !== null)
      .map((snapshot) => [snapshot.recommendation_id as string, snapshot]),
  );
  const grouped = new Map<
    string,
    {
      snapshot: RecommendationSnapshot | null;
      byHorizon: Map<string, RecommendationOutcome>;
    }
  >();

  for (const snapshot of input.snapshots) {
    const key = snapshotGroupKey(snapshot);
    if (!grouped.has(key)) {
      grouped.set(key, { snapshot, byHorizon: new Map() });
    }
  }

  for (const outcome of input.outcomes) {
    const snapshot =
      (outcome.snapshot_fingerprint
        ? snapshotsByFingerprint.get(outcome.snapshot_fingerprint) ?? null
        : null) ??
      (outcome.recommendation_id
        ? snapshotsByRecommendationId.get(outcome.recommendation_id) ?? null
        : null);
    const key = outcomeGroupKey(outcome, snapshot);
    const current = grouped.get(key) ?? { snapshot, byHorizon: new Map() };

    if (!current.snapshot && snapshot) {
      current.snapshot = snapshot;
    }

    const existing = current.byHorizon.get(outcome.horizon);
    if (!existing || isBetterOutcome(outcome, existing)) {
      current.byHorizon.set(outcome.horizon, outcome);
    }

    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .map(({ snapshot, byHorizon }): MondayLiveTrialReviewRow => {
      const outcomes = Array.from(byHorizon.values());
      const ticker = normalizeTicker(snapshot?.ticker ?? outcomes[0]?.ticker ?? null);
      const freshness = planFreshness(outcomes);
      const targetHit = rollupBoolean(outcomes, (outcome) =>
        outcomeTargetHit(outcome) ? true : outcome.target_hit,
      );
      const stopHit = rollupBoolean(outcomes, (outcome) =>
        outcomeStopHit(outcome) ? true : outcome.stop_hit,
      );
      const bestR = maximum(outcomes.map((outcome) => outcome.best_r));
      const worstR = minimum(outcomes.map((outcome) => outcome.worst_r));
      const classification = classifyMondayLiveTrialReviewRow({
        targetHit,
        stopHit,
        bestR,
        worstR,
        planFreshnessClassification: freshness.classification,
      });

      return {
        ticker,
        tier: tierFromSnapshot(snapshot),
        side: firstText(outcomes, snapshot, (outcome) => outcome.side, snapshot?.side ?? null),
        entry: firstFinite(outcomes, snapshot, (outcome) => outcome.entry, snapshot?.entry ?? null),
        stop: firstFinite(outcomes, snapshot, (outcome) => outcome.stop, snapshot?.stop ?? null),
        target: firstFinite(
          outcomes,
          snapshot,
          (outcome) => outcome.target,
          snapshot?.target ?? null,
        ),
        entry_drift_pct: freshness.entryDriftPct,
        target_distance_pct: freshness.targetDistancePct,
        plan_freshness_classification: freshness.classification,
        entry_triggered: rollupBoolean(outcomes, (outcome) => outcome.entry_triggered),
        target_hit: targetHit,
        stop_hit: stopHit,
        best_r: bestR,
        worst_r: worstR,
        classification,
        learning_note: learningNote({
          ticker,
          classification,
          bestR,
          worstR,
          planFreshnessClassification: freshness.classification,
        }),
        horizons: Array.from(new Set(outcomes.map((outcome) => outcome.horizon))).sort(
          horizonSort,
        ),
        outcome_rows_evaluated: outcomes.filter((outcome) =>
          completedStatuses.has(outcome.status),
        ).length,
      };
    })
    .sort((first, second) => first.ticker.localeCompare(second.ticker));
}

function primaryNote(rows: MondayLiveTrialReviewRow[]) {
  if (rows.length === 0) {
    return "No evaluated recommendation outcomes are available for review yet.";
  }

  const targetHits = rows.filter((row) => row.target_hit === true).length;
  const stopHits = rows.filter((row) => row.stop_hit === true).length;

  if (targetHits === 0 && stopHits === 0) {
    return "No targets or stops were hit. Learning suggests target distance/follow-through needs review.";
  }

  if (targetHits > 0) {
    return `${targetHits} recommendation${targetHits === 1 ? "" : "s"} reached target; compare those plans against the misses.`;
  }

  return `${stopHits} recommendation${stopHits === 1 ? "" : "s"} hit stop; review stale plans and adverse movement first.`;
}

function payloadTimeWindow(batch: RecommendationBatch | null) {
  const payload = batch?.payload_json ?? {};
  return (
    textOrNull(payload.time_window) ??
    textOrNull(payload.window_label) ??
    textOrNull(payload.scan_window_label) ??
    textOrNull(payload.scan_window) ??
    null
  );
}

export function buildMondayLiveTrialReviewSummary(
  input: MondayLiveTrialReviewInput,
): MondayLiveTrialReviewSummary {
  const rows = rowsFromInput(input);
  const rowCount = rows.length;
  const targetHitCount = rows.filter((row) => row.target_hit === true).length;
  const stopHitCount = rows.filter((row) => row.stop_hit === true).length;
  const neitherHitCount = rows.filter(
    (row) => row.target_hit !== true && row.stop_hit !== true,
  ).length;
  const worstDriftRow = rows
    .filter((row) => row.entry_drift_pct !== null)
    .sort(
      (first, second) =>
        Math.abs(second.entry_drift_pct ?? 0) -
        Math.abs(first.entry_drift_pct ?? 0),
    )[0];
  const horizons = Array.from(
    new Set(input.outcomes.map((outcome) => outcome.horizon)),
  ).sort(horizonSort);
  const tickers = Array.from(
    new Set([
      ...rows.map((row) => row.ticker),
      ...(input.batch?.recommendation_tickers ?? []).map((ticker) =>
        normalizeTicker(ticker),
      ),
    ]),
  ).sort();

  return {
    summary_version: "1.0",
    summary_kind: "monday_live_trial_review",
    batch_fingerprint: input.batch?.batch_fingerprint ?? null,
    scan_run_fingerprint: input.batch?.scan_run_fingerprint ?? null,
    trading_day: input.batch?.trading_date ?? null,
    stored_window: input.batch?.window ?? null,
    time_window: payloadTimeWindow(input.batch),
    tickers,
    visible_recommendation_count:
      input.visibleRecommendationCount ??
      input.batch?.recommendation_count ??
      rows.length,
    outcome_rows_evaluated: input.outcomes.filter((outcome) =>
      completedStatuses.has(outcome.status),
    ).length,
    horizons_covered: horizons,
    latest_evaluated_at:
      input.outcomes
        .map((outcome) => outcome.evaluated_at)
        .filter((value): value is string => typeof value === "string")
        .sort()
        .at(-1) ?? null,
    rows,
    aggregate: {
      recommendation_count: rowCount,
      target_hit_count: targetHitCount,
      target_hit_rate: rate(targetHitCount, rowCount),
      stop_hit_count: stopHitCount,
      stop_hit_rate: rate(stopHitCount, rowCount),
      neither_hit_count: neitherHitCount,
      neither_hit_rate: rate(neitherHitCount, rowCount),
      average_best_r: average(rows.map((row) => row.best_r)),
      average_worst_r: average(rows.map((row) => row.worst_r)),
      median_best_r: median(rows.map((row) => row.best_r)),
      promising_but_target_too_far_count: rows.filter(
        (row) => row.classification === "promising_but_target_too_far",
      ).length,
      weak_followthrough_count: rows.filter(
        (row) => row.classification === "weak_followthrough",
      ).length,
      adverse_move_count: rows.filter(
        (row) => row.classification === "adverse_move",
      ).length,
      stale_plan_adverse_move_count: rows.filter(
        (row) => row.classification === "stale_plan_adverse_move",
      ).length,
      average_entry_drift_pct: average(rows.map((row) => row.entry_drift_pct)),
      worst_entry_drift_ticker: worstDriftRow?.ticker ?? null,
    },
    primary_note: primaryNote(rows),
  };
}

export function mondayLiveTrialReviewSummaryJson(
  summary: MondayLiveTrialReviewSummary,
) {
  return JSON.stringify(summary, null, 2);
}
