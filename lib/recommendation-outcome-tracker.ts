import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { computePlanPriceFreshnessDiagnostics } from "@/lib/plan-price-freshness";
import {
  entryTypeMetadataForSnapshot,
  evaluateEntryTypeAwareTrigger,
} from "@/lib/recommendation-entry-type";
import { buildConfidenceProjectionObservationOutcomeContract } from "@/lib/confidence-projection-observation-contract";

export type RecommendationOutcomeStatus =
  | "pending"
  | "entry_not_triggered"
  | "entry_triggered"
  | "target_hit"
  | "stop_hit"
  | "target_before_stop"
  | "stop_before_target"
  | "neither_hit"
  | "expired"
  | "invalid"
  | "incomplete"
  | "unknown";

export type RecommendationOutcomeEvent =
  | "entry_triggered"
  | "target_hit"
  | "stop_hit"
  | "expired"
  | "neither"
  | "unknown";

export type RecommendationOutcomeHorizon =
  | "15m"
  | "30m"
  | "60m"
  | "eod"
  | "next_open"
  | "unknown";

export type RecommendationOutcomeSource =
  | "intraday_candles"
  | "latest_quote"
  | "snapshot_only"
  | "local_storage"
  | "supabase"
  | "unknown";

/**
 * Unlike the legacy best_r/worst_r fields, this contract never includes the
 * candle that established a pending entry. A candle high/low cannot say which
 * part of that candle happened before the entry was filled, so calling it MFE
 * or MAE would introduce lookahead.
 */
export const RECOMMENDATION_OUTCOME_ENTRY_BOUND_EXCURSION_CONTRACT_VERSION =
  "recommendation_outcome_entry_bound_excursion_v1" as const;

export type RecommendationOutcomeEntryBoundExcursionMetric = {
  status: "measured" | "not_measurable";
  r: number | null;
  reason: string | null;
};

export type RecommendationOutcomeEntryBoundExcursion = {
  contract_version: typeof RECOMMENDATION_OUTCOME_ENTRY_BOUND_EXCURSION_CONTRACT_VERSION;
  measurement_window: "strictly_after_entry_trigger_candle";
  status: "measured" | "partially_measured" | "not_measurable";
  side: "long" | "short";
  entry: number;
  stop: number;
  risk_per_share: number;
  entry_triggered: boolean | null;
  entry_triggered_at: string | null;
  entry_trigger_candle_at: string | null;
  terminal_event: RecommendationOutcomeEvent;
  terminal_event_candle_at: string | null;
  post_entry_complete_candle_count: number;
  mfe_r: RecommendationOutcomeEntryBoundExcursionMetric;
  mae_r: RecommendationOutcomeEntryBoundExcursionMetric;
  blockers: string[];
};

export type RecommendationOutcomeCandle = {
  timestamp: string | Date | number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

export type RecommendationOutcomeInput = {
  snapshot?: RecommendationSnapshot | null;
  snapshot_id?: string | null;
  snapshot_fingerprint?: string | null;
  recommendation_id?: string | null;
  ticker?: string | null;
  side?: string | null;
  recommended_at?: string | Date | null;
  evaluated_at?: string | Date | null;
  horizon?: RecommendationOutcomeHorizon | string | null;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  current_price?: number | null;
  eod_price?: number | null;
  candles?: RecommendationOutcomeCandle[] | null;
  source?: RecommendationOutcomeSource | string | null;
  provider?: string | null;
  data_completeness?: "complete" | "partial" | "none" | "unknown" | string | null;
  warnings?: string[] | null;
  blockers?: string[] | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
};

export type RecommendationOutcomeSideReadSource =
  | "input.side"
  | "snapshot.side"
  | "snapshot.direction"
  | "snapshot.trade_direction"
  | "snapshot.recommendation_side"
  | "snapshot.payload_json.side"
  | "snapshot.payload_json.direction"
  | "snapshot.payload_json.trade_direction"
  | "snapshot.payload_json.recommendation_side"
  | "snapshot.payload_json.trade_plan.side"
  | "snapshot.payload_json.trade_plan.direction"
  | "snapshot.payload_json.trade_plan.action"
  | "snapshot.payload_json.recommendation.side"
  | "snapshot.payload_json.recommendation.direction"
  | "snapshot.payload_json.action"
  | "snapshot.payload_json.recommendation.action"
  | "inferred_from_price_plan_action"
  | "missing";

export type RecommendationOutcomeSideResolution = {
  side: "long" | "short" | "unknown";
  source: RecommendationOutcomeSideReadSource;
  inferred: boolean;
  warning: string | null;
};

export type RecommendationOutcome = {
  id: string;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  ticker: string | null;
  side: string;
  recommended_at: string | null;
  evaluated_at: string;
  horizon: RecommendationOutcomeHorizon;
  status: RecommendationOutcomeStatus;
  entry: number | null;
  stop: number | null;
  target: number | null;
  entry_triggered: boolean | null;
  entry_triggered_at: string | null;
  target_hit: boolean | null;
  target_hit_at: string | null;
  stop_hit: boolean | null;
  stop_hit_at: string | null;
  first_terminal_event: RecommendationOutcomeEvent;
  best_price_after_recommendation: number | null;
  worst_price_after_recommendation: number | null;
  best_r: number | null;
  worst_r: number | null;
  eod_price: number | null;
  eod_r: number | null;
  current_price: number | null;
  current_r: number | null;
  max_favorable_excursion: number | null;
  max_adverse_excursion: number | null;
  time_to_entry_minutes: number | null;
  time_to_target_minutes: number | null;
  time_to_stop_minutes: number | null;
  source: string;
  provider: string | null;
  data_completeness: "complete" | "partial" | "none" | "unknown" | string;
  warnings: string[];
  blockers: string[];
  payload_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type RecommendationOutcomeComputationResult = {
  outcome: RecommendationOutcome;
  can_compute_terminal_events: boolean;
  warnings: string[];
  blockers: string[];
};

export type RecommendationOutcomePersistenceResult = {
  status: "saved" | "updated" | "failed";
  mode: "supabase" | "localStorage" | "none";
  outcome: RecommendationOutcome;
  error: string | null;
};

export const recommendationOutcomeLocalStorageKey =
  "trade-recommendation-outcomes-v1";

const maxLocalOutcomes = 750;

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

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

function toDate(value: string | Date | number | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const timestamp = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(timestamp);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function toIso(value: string | Date | number | null | undefined) {
  return toDate(value)?.toISOString() ?? null;
}

function normalizeHorizon(
  value: RecommendationOutcomeInput["horizon"],
): RecommendationOutcomeHorizon {
  if (
    value === "15m" ||
    value === "30m" ||
    value === "60m" ||
    value === "eod" ||
    value === "next_open"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeSide(value: string | null | undefined) {
  const side = value?.trim().toLowerCase();

  if (side === "short" || side === "sell") {
    return "short";
  }

  if (side === "long" || side === "buy") {
    return "long";
  }

  return "unknown";
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function sideFromValue(
  value: unknown,
  source: RecommendationOutcomeSideReadSource,
): RecommendationOutcomeSideResolution | null {
  const side = normalizeSide(textValue(value));

  return side === "long" || side === "short"
    ? { side, source, inferred: false, warning: null }
    : null;
}

function actionSuggestsLong(value: unknown) {
  const text = textValue(value)?.toLowerCase() ?? "";

  return (
    text === "buy" ||
    text === "long" ||
    text === "buy_to_open" ||
    text === "open_long" ||
    text.includes("buy") ||
    text.includes("long")
  );
}

export function resolveRecommendationOutcomeSide(
  input: Pick<
    RecommendationOutcomeInput,
    "side" | "entry" | "stop" | "target" | "snapshot"
  >,
): RecommendationOutcomeSideResolution {
  const snapshot = input.snapshot ?? null;
  const snapshotRecord = objectValue(snapshot);
  const payload = objectValue(snapshot?.payload_json);
  const tradePlan = objectValue(payload?.trade_plan);
  const recommendation = objectValue(payload?.recommendation);
  const explicitSources: Array<{
    value: unknown;
    source: RecommendationOutcomeSideReadSource;
  }> = [
    { value: input.side, source: "input.side" },
    { value: snapshot?.side, source: "snapshot.side" },
    { value: snapshotRecord?.direction, source: "snapshot.direction" },
    { value: snapshotRecord?.trade_direction, source: "snapshot.trade_direction" },
    {
      value: snapshotRecord?.recommendation_side,
      source: "snapshot.recommendation_side",
    },
    { value: payload?.side, source: "snapshot.payload_json.side" },
    { value: payload?.direction, source: "snapshot.payload_json.direction" },
    {
      value: payload?.trade_direction,
      source: "snapshot.payload_json.trade_direction",
    },
    {
      value: payload?.recommendation_side,
      source: "snapshot.payload_json.recommendation_side",
    },
    { value: tradePlan?.side, source: "snapshot.payload_json.trade_plan.side" },
    {
      value: tradePlan?.direction,
      source: "snapshot.payload_json.trade_plan.direction",
    },
    {
      value: recommendation?.side,
      source: "snapshot.payload_json.recommendation.side",
    },
    {
      value: recommendation?.direction,
      source: "snapshot.payload_json.recommendation.direction",
    },
  ];

  for (const candidate of explicitSources) {
    const resolved = sideFromValue(candidate.value, candidate.source);
    if (resolved) {
      return resolved;
    }
  }

  const actionLongSource = [
    { value: payload?.action, source: "snapshot.payload_json.action" as const },
    {
      value: recommendation?.action,
      source: "snapshot.payload_json.recommendation.action" as const,
    },
    {
      value: tradePlan?.action,
      source: "snapshot.payload_json.trade_plan.action" as const,
    },
  ].find((candidate) => actionSuggestsLong(candidate.value));
  const entry = finiteNumber(input.entry) ?? snapshot?.entry ?? null;
  const stop = finiteNumber(input.stop) ?? snapshot?.stop ?? null;
  const target = finiteNumber(input.target) ?? snapshot?.target ?? null;
  const pricePlanLooksLong =
    entry !== null &&
    stop !== null &&
    target !== null &&
    entry > 0 &&
    stop > 0 &&
    target > 0 &&
    entry > stop &&
    target > entry;

  if (actionLongSource && pricePlanLooksLong) {
    return {
      side: "long",
      source: "inferred_from_price_plan_action",
      inferred: true,
      warning: "Side inferred from price plan/action.",
    };
  }

  return { side: "unknown", source: "missing", inferred: false, warning: null };
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function outcomeId(snapshotFingerprint: string | null, horizon: string) {
  return `rec_out_${stableHash(`${snapshotFingerprint ?? "unknown"}|${horizon}`)}`;
}

function minutesBetween(later: string | null, earlier: string | null) {
  const laterDate = toDate(later);
  const earlierDate = toDate(earlier);

  if (!laterDate || !earlierDate) {
    return null;
  }

  return Math.max(0, Math.round((laterDate.getTime() - earlierDate.getTime()) / 60000));
}

function riskPerShare(entry: number | null, stop: number | null, side: string) {
  if (entry === null || stop === null) {
    return null;
  }

  const risk = side === "short" ? stop - entry : entry - stop;
  return risk > 0 ? risk : null;
}

function hasCoherentOutcomePricePlan(
  entry: number | null,
  stop: number | null,
  target: number | null,
  side: string,
) {
  if (
    entry === null ||
    stop === null ||
    target === null ||
    entry <= 0 ||
    stop <= 0 ||
    target <= 0
  ) {
    return false;
  }

  return side === "short"
    ? target < entry && entry < stop
    : side === "long"
      ? stop < entry && entry < target
      : false;
}

function favorableMove(price: number, entry: number, side: string) {
  return side === "short" ? entry - price : price - entry;
}

function adverseMove(price: number, entry: number, side: string) {
  return side === "short" ? price - entry : entry - price;
}

function rFromPrice(
  price: number | null,
  entry: number | null,
  risk: number | null,
  side: string,
) {
  if (price === null || entry === null || risk === null || risk <= 0) {
    return null;
  }

  return favorableMove(price, entry, side) / risk;
}

function normalizeCandles(
  candles: RecommendationOutcomeCandle[] | null | undefined,
  recommendedAt: string | null,
) {
  const recommendedDate = toDate(recommendedAt);
  const recommendedTime = recommendedDate?.getTime() ?? null;

  return (candles ?? [])
    .map((candle) => ({
      timestamp: toIso(candle.timestamp),
      time: toDate(candle.timestamp)?.getTime() ?? null,
      open: finiteNumber(candle.open),
      high: finiteNumber(candle.high),
      low: finiteNumber(candle.low),
      close: finiteNumber(candle.close),
      volume: finiteNumber(candle.volume),
    }))
    .filter(
      (candle) =>
        candle.timestamp !== null &&
        candle.time !== null &&
        candle.high !== null &&
        candle.low !== null &&
        candle.close !== null &&
        (recommendedTime === null ||
          candle.time >= recommendedTime ||
          candle.time + 5 * 60 * 1000 > recommendedTime),
    )
    .sort((first, second) => (first.time ?? 0) - (second.time ?? 0));
}

function priceTouchesEntry(
  candle: { high: number | null; low: number | null },
  entry: number,
) {
  return candle.high !== null && candle.low !== null && candle.low <= entry && candle.high >= entry;
}

function officialTriggerSemanticsForEntryType(
  metadata: ReturnType<typeof entryTypeMetadataForSnapshot>,
) {
  return metadata.entry_type === "market_reference" &&
    metadata.entry_trigger_semantics === "immediate_reference"
    ? "immediate_reference"
    : "current_candle_range_touches_entry";
}

function priceTouchesTarget(
  candle: { high: number | null; low: number | null },
  target: number,
  side: string,
) {
  if (candle.high === null || candle.low === null) {
    return false;
  }

  return side === "short" ? candle.low <= target : candle.high >= target;
}

function priceTouchesStop(
  candle: { high: number | null; low: number | null },
  stop: number,
  side: string,
) {
  if (candle.high === null || candle.low === null) {
    return false;
  }

  return side === "short" ? candle.high >= stop : candle.low <= stop;
}

type NormalizedOutcomeCandle = {
  timestamp: string;
  time: number;
  open: number | null;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

function hasStrictlyIncreasingCandleTimes(
  candles: Array<{ time: number | null }>,
) {
  return candles.every(
    (candle, index) =>
      index === 0 ||
      candle.time !== null &&
        candles[index - 1]?.time !== null &&
        candle.time > candles[index - 1]!.time!,
  );
}

function notMeasurableEntryBoundExcursionMetric(reason: string) {
  return {
    status: "not_measurable" as const,
    r: null,
    reason,
  } satisfies RecommendationOutcomeEntryBoundExcursionMetric;
}

function measuredEntryBoundExcursionMetric(value: number) {
  return {
    status: "measured" as const,
    r: value,
    reason: null,
  } satisfies RecommendationOutcomeEntryBoundExcursionMetric;
}

function entryBoundExcursionStatus({
  mfe,
  mae,
}: {
  mfe: RecommendationOutcomeEntryBoundExcursionMetric;
  mae: RecommendationOutcomeEntryBoundExcursionMetric;
}) {
  return mfe.status === "measured" && mae.status === "measured"
    ? "measured"
    : mfe.status === "measured" || mae.status === "measured"
      ? "partially_measured"
      : "not_measurable";
}

function buildEntryBoundExcursion({
  candles,
  entry,
  stop,
  target,
  risk,
  side,
  entryTriggered,
  entryIndex,
  entryTriggeredAt,
  firstTerminalEvent,
  terminalEventIndex,
}: {
  candles: Array<{
    timestamp: string | null;
    time: number | null;
    high: number | null;
    low: number | null;
  }>;
  entry: number;
  stop: number;
  target: number;
  risk: number;
  side: "long" | "short";
  entryTriggered: boolean | null;
  entryIndex: number | null;
  entryTriggeredAt: string | null;
  firstTerminalEvent: RecommendationOutcomeEvent;
  terminalEventIndex: number | null;
}): RecommendationOutcomeEntryBoundExcursion {
  const base = {
    contract_version: RECOMMENDATION_OUTCOME_ENTRY_BOUND_EXCURSION_CONTRACT_VERSION,
    measurement_window: "strictly_after_entry_trigger_candle" as const,
    side,
    entry,
    stop,
    risk_per_share: risk,
    entry_triggered: entryTriggered,
    entry_triggered_at: entryTriggeredAt,
    entry_trigger_candle_at:
      entryIndex === null ? null : candles[entryIndex]?.timestamp ?? null,
    terminal_event: firstTerminalEvent,
    terminal_event_candle_at:
      terminalEventIndex === null
        ? null
        : candles[terminalEventIndex]?.timestamp ?? null,
  };

  const unavailable = (reason: string, blockers = [reason]) => {
    const mfe = notMeasurableEntryBoundExcursionMetric(reason);
    const mae = notMeasurableEntryBoundExcursionMetric(reason);

    return {
      ...base,
      status: "not_measurable" as const,
      post_entry_complete_candle_count: 0,
      mfe_r: mfe,
      mae_r: mae,
      blockers,
    } satisfies RecommendationOutcomeEntryBoundExcursion;
  };

  if (entryTriggered !== true || entryIndex === null) {
    return unavailable(
      entryTriggered === false ? "entry_not_triggered" : "entry_trigger_unknown",
    );
  }

  if (!hasStrictlyIncreasingCandleTimes(candles)) {
    return unavailable("candle_timestamps_not_strictly_increasing");
  }

  if (terminalEventIndex === entryIndex) {
    return unavailable("terminal_event_in_entry_trigger_candle");
  }

  if (firstTerminalEvent === "unknown" && terminalEventIndex !== null) {
    return unavailable("terminal_event_intrabar_order_unknown");
  }

  const postEntryCandles = candles.slice(
    entryIndex + 1,
    terminalEventIndex === null ? undefined : terminalEventIndex,
  );
  const normalizedPostEntryCandles = postEntryCandles.filter(
    (candle): candle is NormalizedOutcomeCandle =>
      candle.timestamp !== null &&
      candle.time !== null &&
      candle.high !== null &&
      candle.low !== null,
  );
  const favorablePrices = normalizedPostEntryCandles.map((candle) =>
    side === "short" ? candle.low : candle.high,
  );
  const adversePrices = normalizedPostEntryCandles.map((candle) =>
    side === "short" ? candle.high : candle.low,
  );
  const priorMfe = favorablePrices.length === 0
    ? 0
    : Math.max(
        0,
        ...favorablePrices.map((price) => rFromPrice(price, entry, risk, side) ?? 0),
      );
  const priorMae = adversePrices.length === 0
    ? 0
    : Math.min(
        0,
        ...adversePrices.map((price) => rFromPrice(price, entry, risk, side) ?? 0),
      );

  let mfe: RecommendationOutcomeEntryBoundExcursionMetric = notMeasurableEntryBoundExcursionMetric(
    "no_complete_candle_strictly_after_entry_trigger_candle",
  );
  let mae: RecommendationOutcomeEntryBoundExcursionMetric = notMeasurableEntryBoundExcursionMetric(
    "no_complete_candle_strictly_after_entry_trigger_candle",
  );

  if (terminalEventIndex === null) {
    if (normalizedPostEntryCandles.length > 0) {
      mfe = measuredEntryBoundExcursionMetric(priorMfe);
      mae = measuredEntryBoundExcursionMetric(priorMae);
    }
  } else if (firstTerminalEvent === "target_hit") {
    // The target itself is the exact favorable excursion at exit. The opposite
    // side of the terminal candle remains unknowable without tick ordering.
    mfe = measuredEntryBoundExcursionMetric(
      Math.max(0, priorMfe, rFromPrice(target, entry, risk, side) ?? 0),
    );
    mae = notMeasurableEntryBoundExcursionMetric(
      "target_terminal_candle_intrabar_order_unknown",
    );
  } else if (firstTerminalEvent === "stop_hit") {
    mfe = notMeasurableEntryBoundExcursionMetric(
      "stop_terminal_candle_intrabar_order_unknown",
    );
    mae = measuredEntryBoundExcursionMetric(
      Math.min(0, priorMae, rFromPrice(stop, entry, risk, side) ?? 0),
    );
  }

  return {
    ...base,
    status: entryBoundExcursionStatus({ mfe, mae }),
    post_entry_complete_candle_count: normalizedPostEntryCandles.length,
    mfe_r: mfe,
    mae_r: mae,
    blockers: Array.from(new Set([mfe.reason, mae.reason].filter(Boolean))) as string[],
  } satisfies RecommendationOutcomeEntryBoundExcursion;
}

function entryBoundExcursionMetricFromPayload(
  value: unknown,
): RecommendationOutcomeEntryBoundExcursionMetric | null {
  const record = objectValue(value);
  const status = record?.status;
  const reason = record?.reason;
  const metricR = finiteNumber(record?.r);

  if (status === "measured") {
    return metricR === null || reason !== null
      ? null
      : { status, r: metricR, reason: null };
  }

  if (status === "not_measurable") {
    const normalizedReason = textOrNull(
      typeof reason === "string" ? reason : null,
    );
    return metricR !== null || normalizedReason === null
      ? null
      : { status, r: null, reason: normalizedReason };
  }

  return null;
}

function isoTimestampOrNull(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return toIso(value) === value ? value : undefined;
}

/**
 * Reads only a self-consistent entry-bound excursion receipt. Old outcomes and
 * malformed payloads intentionally remain unavailable rather than being
 * reconstructed from legacy best_r/worst_r fields.
 */
export function entryBoundExcursionFromOutcome(
  outcome: RecommendationOutcome,
): RecommendationOutcomeEntryBoundExcursion | null {
  const record = objectValue(outcome.payload_json.entry_bound_excursion);
  const side = normalizeSide(outcome.side);
  const risk = riskPerShare(outcome.entry, outcome.stop, side);
  const entryTriggered = record?.entry_triggered;
  const entryTriggeredAt = isoTimestampOrNull(record?.entry_triggered_at);
  const entryTriggerCandleAt = isoTimestampOrNull(record?.entry_trigger_candle_at);
  const terminalEventCandleAt = isoTimestampOrNull(record?.terminal_event_candle_at);
  const mfe = entryBoundExcursionMetricFromPayload(record?.mfe_r);
  const mae = entryBoundExcursionMetricFromPayload(record?.mae_r);
  const terminalEvent = normalizeEvent(record?.terminal_event);
  const postEntryCompleteCandleCount = record?.post_entry_complete_candle_count;
  const blockers = Array.isArray(record?.blockers)
    ? record.blockers.filter((blocker): blocker is string => typeof blocker === "string")
    : null;
  const expectedBlockers = !mfe || !mae
    ? null
    : Array.from(
        new Set(
          [mfe.reason, mae.reason].filter(
            (reason): reason is string => typeof reason === "string",
          ),
        ),
      );
  const terminalEventMatchesOutcome =
    terminalEvent === "target_hit"
      ? terminalEventCandleAt === outcome.target_hit_at
      : terminalEvent === "stop_hit"
        ? terminalEventCandleAt === outcome.stop_hit_at
        : terminalEvent === "unknown"
          ? outcome.target_hit_at !== null &&
            outcome.target_hit_at === outcome.stop_hit_at &&
            terminalEventCandleAt === outcome.target_hit_at
          : terminalEvent === "neither"
            ? terminalEventCandleAt === null
            : false;

  if (
    !record ||
    record.contract_version !==
      RECOMMENDATION_OUTCOME_ENTRY_BOUND_EXCURSION_CONTRACT_VERSION ||
    record.measurement_window !== "strictly_after_entry_trigger_candle" ||
    (side !== "long" && side !== "short") ||
    risk === null ||
    outcome.entry === null ||
    outcome.stop === null ||
    (entryTriggered !== true && entryTriggered !== false && entryTriggered !== null) ||
    entryTriggeredAt === undefined ||
    entryTriggerCandleAt === undefined ||
    terminalEventCandleAt === undefined ||
    !mfe ||
    !mae ||
    terminalEvent !== outcome.first_terminal_event ||
    !terminalEventMatchesOutcome ||
    record.side !== side ||
    finiteNumber(record.entry) !== outcome.entry ||
    finiteNumber(record.stop) !== outcome.stop ||
    finiteNumber(record.risk_per_share) !== risk ||
    entryTriggered !== outcome.entry_triggered ||
    entryTriggeredAt !== outcome.entry_triggered_at ||
    (entryTriggered === true && entryTriggerCandleAt !== entryTriggeredAt) ||
    typeof postEntryCompleteCandleCount !== "number" ||
    !Number.isInteger(postEntryCompleteCandleCount) ||
    postEntryCompleteCandleCount < 0 ||
    blockers === null ||
    expectedBlockers === null ||
    blockers.length !== expectedBlockers.length ||
    blockers.some((blocker, index) => blocker !== expectedBlockers[index]) ||
    (mfe.status === "measured" && (mfe.r === null || mfe.r < 0)) ||
    (mae.status === "measured" && (mae.r === null || mae.r > 0))
  ) {
    return null;
  }

  const status = entryBoundExcursionStatus({ mfe, mae });
  if (record.status !== status) return null;

  return {
    contract_version: RECOMMENDATION_OUTCOME_ENTRY_BOUND_EXCURSION_CONTRACT_VERSION,
    measurement_window: "strictly_after_entry_trigger_candle",
    status,
    side,
    entry: outcome.entry,
    stop: outcome.stop,
    risk_per_share: risk,
    entry_triggered: entryTriggered,
    entry_triggered_at: entryTriggeredAt,
    entry_trigger_candle_at: entryTriggerCandleAt,
    terminal_event: terminalEvent,
    terminal_event_candle_at: terminalEventCandleAt,
    post_entry_complete_candle_count: postEntryCompleteCandleCount,
    mfe_r: mfe,
    mae_r: mae,
    blockers,
  };
}

export function computeRecommendationOutcome(
  input: RecommendationOutcomeInput,
): RecommendationOutcomeComputationResult {
  const snapshot = input.snapshot ?? null;
  const snapshotId = textOrNull(input.snapshot_id) ?? snapshot?.id ?? null;
  const snapshotFingerprint =
    textOrNull(input.snapshot_fingerprint) ??
    snapshot?.snapshot_fingerprint ??
    null;
  const recommendationId =
    textOrNull(input.recommendation_id) ?? snapshot?.recommendation_id ?? null;
  const ticker = textOrNull(input.ticker) ?? snapshot?.ticker ?? null;
  const sideResolution = resolveRecommendationOutcomeSide(input);
  const side = sideResolution.side;
  const recommendedAt =
    toIso(input.recommended_at) ?? snapshot?.recommended_at ?? null;
  const evaluatedAt = toIso(input.evaluated_at) ?? new Date().toISOString();
  const horizon = normalizeHorizon(input.horizon);
  const entry = finiteNumber(input.entry) ?? snapshot?.entry ?? null;
  const stop = finiteNumber(input.stop) ?? snapshot?.stop ?? null;
  const target = finiteNumber(input.target) ?? snapshot?.target ?? null;
  const currentPrice = finiteNumber(input.current_price);
  const eodPrice = finiteNumber(input.eod_price);
  const risk = riskPerShare(entry, stop, side);
  const warnings = [...(input.warnings ?? [])];
  const blockers = [...(input.blockers ?? [])];
  const candles = normalizeCandles(input.candles, recommendedAt);
  const hasCandles = candles.length > 0;
  const source = textOrNull(String(input.source ?? "")) ?? "unknown";
  const entryTypeMetadata = entryTypeMetadataForSnapshot({
    ticker,
    entry,
    side,
    quote_price: snapshot?.quote_price ?? null,
    payload_json: snapshot?.payload_json ?? null,
  });
  const officialTriggerSemantics =
    officialTriggerSemanticsForEntryType(entryTypeMetadata);

  if (sideResolution.warning) {
    warnings.push(sideResolution.warning);
  }

  if (!snapshotFingerprint) {
    blockers.push("Snapshot fingerprint is unavailable.");
  }

  if (!ticker) {
    blockers.push("Ticker is unavailable.");
  }

  if (side !== "long" && side !== "short") {
    blockers.push("Recommendation side is unavailable.");
  }

  if (!hasCoherentOutcomePricePlan(entry, stop, target, side) || risk === null) {
    blockers.push(
      "Entry, stop, and target must be positive and coherent for the recommendation side.",
    );
  }

  let entryTriggered: boolean | null = null;
  let entryTriggeredAt: string | null = null;
  let targetHit: boolean | null = null;
  let targetHitAt: string | null = null;
  let stopHit: boolean | null = null;
  let stopHitAt: string | null = null;
  let firstTerminalEvent: RecommendationOutcomeEvent = "unknown";
  let status: RecommendationOutcomeStatus = blockers.length > 0 ? "invalid" : "pending";
  let bestPrice: number | null = null;
  let worstPrice: number | null = null;
  let bestR: number | null = null;
  let worstR: number | null = null;
  let maxFavorableExcursion: number | null = null;
  let maxAdverseExcursion: number | null = null;
  let entryIndex: number | null = null;
  let terminalEventIndex: number | null = null;

  if (blockers.length === 0 && entry !== null && stop !== null && target !== null && risk !== null) {
    if (hasCandles) {
      const highs = candles.map((candle) => candle.high).filter((value): value is number => value !== null);
      const lows = candles.map((candle) => candle.low).filter((value): value is number => value !== null);

      bestPrice = side === "short" ? Math.min(...lows) : Math.max(...highs);
      worstPrice = side === "short" ? Math.max(...highs) : Math.min(...lows);
      bestR = rFromPrice(bestPrice, entry, risk, side);
      worstR = rFromPrice(worstPrice, entry, risk, side);
      maxFavorableExcursion =
        bestPrice === null ? null : Math.max(0, favorableMove(bestPrice, entry, side));
      maxAdverseExcursion =
        worstPrice === null ? null : Math.max(0, adverseMove(worstPrice, entry, side));

      const legacyEntryIndex = candles.findIndex((candle) =>
        priceTouchesEntry(candle, entry),
      );
      entryIndex =
        officialTriggerSemantics === "immediate_reference"
          ? 0
          : legacyEntryIndex;
      entryTriggered = entryIndex >= 0;
      entryTriggeredAt = entryIndex >= 0 ? candles[entryIndex].timestamp : null;

      if (!entryTriggered) {
        targetHit = false;
        stopHit = false;
        firstTerminalEvent = "neither";
        status = "entry_not_triggered";
      } else {
        targetHit = false;
        stopHit = false;
        status = "entry_triggered";

        for (let index = entryIndex; index < candles.length; index += 1) {
          const candle = candles[index];
          const targetTouched = priceTouchesTarget(candle, target, side);
          const stopTouched = priceTouchesStop(candle, stop, side);

          if (targetTouched && targetHitAt === null) {
            targetHit = true;
            targetHitAt = candle.timestamp;
          }

          if (stopTouched && stopHitAt === null) {
            stopHit = true;
            stopHitAt = candle.timestamp;
          }

          if (targetTouched || stopTouched) {
            terminalEventIndex = index;
            if (targetTouched && stopTouched) {
              firstTerminalEvent = "unknown";
              status = "unknown";
              warnings.push(
                "Target and stop were touched in the same candle; intrabar order is unknown.",
              );
            } else if (targetTouched) {
              firstTerminalEvent = "target_hit";
              status =
                officialTriggerSemantics === "immediate_reference"
                  ? "target_hit"
                  : "target_before_stop";
            } else {
              firstTerminalEvent = "stop_hit";
              status =
                officialTriggerSemantics === "immediate_reference"
                  ? "stop_hit"
                  : "stop_before_target";
            }
            break;
          }
        }

        if (firstTerminalEvent === "unknown" && !targetHit && !stopHit) {
          firstTerminalEvent = "neither";
          status = "neither_hit";
        }
      }
    } else if (currentPrice !== null) {
      bestPrice = currentPrice;
      worstPrice = currentPrice;
      bestR = rFromPrice(currentPrice, entry, risk, side);
      worstR = bestR;
      maxFavorableExcursion = Math.max(0, favorableMove(currentPrice, entry, side));
      maxAdverseExcursion = Math.max(0, adverseMove(currentPrice, entry, side));
      entryTriggered = null;
      targetHit = null;
      stopHit = null;
      status = "incomplete";
      warnings.push(
        "Only latest price is available; entry, target, and stop timing cannot be determined.",
      );
    } else {
      entryTriggered = null;
      targetHit = null;
      stopHit = null;
      status = "incomplete";
      warnings.push(
        "Intraday candles are unavailable; outcome tracking is pending market movement data.",
      );
    }
  }

  const entryBoundExcursion =
    entry !== null &&
    stop !== null &&
    target !== null &&
    risk !== null &&
    (side === "long" || side === "short")
      ? buildEntryBoundExcursion({
          candles,
          entry,
          stop,
          target,
          risk,
          side,
          entryTriggered,
          entryIndex,
          entryTriggeredAt,
          firstTerminalEvent,
          terminalEventIndex,
        })
      : null;

  const eodR = rFromPrice(eodPrice, entry, risk, side);
  const suppliedDataCompleteness = textOrNull(input.data_completeness);
  const observedDataCompleteness = hasCandles
    ? "complete"
    : currentPrice !== null || eodPrice !== null
      ? "partial"
      : "none";
  const dataCompleteness =
    suppliedDataCompleteness === "complete" && !hasCandles
      ? observedDataCompleteness
      : suppliedDataCompleteness ?? observedDataCompleteness;

  if (suppliedDataCompleteness === "complete" && !hasCandles) {
    warnings.push(
      "Complete outcome data was claimed without intraday candles; the outcome remains incomplete until candle evidence is available.",
    );
  }
  const planPriceFreshness = computePlanPriceFreshnessDiagnostics({
    snapshot,
    entry,
    stop,
    target,
    candles,
    latestProviderPrice: currentPrice ?? eodPrice,
  });
  const entryTypeTriggerDiagnostics = evaluateEntryTypeAwareTrigger({
    metadata: entryTypeMetadata,
    side,
    entry,
    stop,
    target,
    candles,
    officialEntryTriggered: entryTriggered,
    officialStatus: status,
  });

  const confidenceProjectionObservationContract =
    buildConfidenceProjectionObservationOutcomeContract({
      snapshot_id: snapshotId,
      snapshot_fingerprint: snapshotFingerprint,
      recommendation_id: recommendationId,
      ticker,
      side,
      recommended_at: recommendedAt,
      evaluated_at: evaluatedAt,
      horizon,
      status,
      target_hit: targetHit,
      stop_hit: stopHit,
      first_terminal_event: firstTerminalEvent,
      eod_r: eodR,
      current_r: rFromPrice(currentPrice, entry, risk, side),
      best_r: bestR,
      data_completeness: dataCompleteness,
      source,
    });
  const outcome: RecommendationOutcome = {
    id: outcomeId(snapshotFingerprint, horizon),
    snapshot_id: snapshotId,
    snapshot_fingerprint: snapshotFingerprint,
    recommendation_id: recommendationId,
    ticker,
    side,
    recommended_at: recommendedAt,
    evaluated_at: evaluatedAt,
    horizon,
    status,
    entry,
    stop,
    target,
    entry_triggered: entryTriggered,
    entry_triggered_at: entryTriggeredAt,
    target_hit: targetHit,
    target_hit_at: targetHitAt,
    stop_hit: stopHit,
    stop_hit_at: stopHitAt,
    first_terminal_event: firstTerminalEvent,
    best_price_after_recommendation: bestPrice,
    worst_price_after_recommendation: worstPrice,
    best_r: bestR,
    worst_r: worstR,
    eod_price: eodPrice,
    eod_r: eodR,
    current_price: currentPrice,
    current_r: rFromPrice(currentPrice, entry, risk, side),
    max_favorable_excursion: maxFavorableExcursion,
    max_adverse_excursion: maxAdverseExcursion,
    time_to_entry_minutes: minutesBetween(entryTriggeredAt, recommendedAt),
    time_to_target_minutes: minutesBetween(targetHitAt, recommendedAt),
    time_to_stop_minutes: minutesBetween(stopHitAt, recommendedAt),
    source,
    provider: textOrNull(input.provider),
    data_completeness: dataCompleteness,
    warnings,
    blockers,
    payload_json: {
      confidence_projection_observation_contract:
        confidenceProjectionObservationContract,
      candle_count: candles.length,
      has_current_price: currentPrice !== null,
      has_eod_price: eodPrice !== null,
      risk_per_share: risk,
      source,
      provider: textOrNull(input.provider),
      side_read_source: sideResolution.source,
      side_inferred: sideResolution.inferred,
      plan_price_freshness: planPriceFreshness,
      ...entryTypeMetadata,
      entry_type_metadata: entryTypeMetadata,
      ...entryTypeTriggerDiagnostics,
      entry_type_trigger_diagnostics: entryTypeTriggerDiagnostics,
      entry_bound_excursion: entryBoundExcursion,
    },
    created_at: toIso(input.created_at) ?? evaluatedAt,
    updated_at: toIso(input.updated_at) ?? evaluatedAt,
  };

  return {
    outcome,
    can_compute_terminal_events: hasCandles && blockers.length === 0,
    warnings,
    blockers,
  };
}

export function recommendationOutcomeJson(outcome: RecommendationOutcome): string {
  return JSON.stringify(outcome, null, 2);
}

export function recommendationOutcomesJson(
  outcomes: RecommendationOutcome[],
): string {
  return JSON.stringify(
    {
      outcome_count: outcomes.length,
      outcomes,
    },
    null,
    2,
  );
}

export function readRecommendationOutcomesFromLocalStorage(
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(recommendationOutcomeLocalStorageKey) ?? "[]",
    );
    return Array.isArray(parsed) ? (parsed as RecommendationOutcome[]) : [];
  } catch {
    return [];
  }
}

export function persistRecommendationOutcomeToLocalStorage(
  outcome: RecommendationOutcome,
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
): RecommendationOutcomePersistenceResult {
  if (!storage) {
    return {
      status: "failed",
      mode: "none",
      outcome,
      error: "localStorage is unavailable.",
    };
  }

  try {
    const existingOutcomes = readRecommendationOutcomesFromLocalStorage(storage);
    const existingIndex = existingOutcomes.findIndex(
      (item) =>
        item.snapshot_fingerprint === outcome.snapshot_fingerprint &&
        item.horizon === outcome.horizon,
    );
    const nextOutcomes =
      existingIndex >= 0
        ? existingOutcomes.map((item, index) =>
            index === existingIndex ? { ...item, ...outcome } : item,
          )
        : [outcome, ...existingOutcomes];

    storage.setItem(
      recommendationOutcomeLocalStorageKey,
      JSON.stringify(nextOutcomes.slice(0, maxLocalOutcomes)),
    );

    return {
      status: existingIndex >= 0 ? "updated" : "saved",
      mode: "localStorage",
      outcome,
      error: null,
    };
  } catch (error) {
    return {
      status: "failed",
      mode: "localStorage",
      outcome,
      error: error instanceof Error ? error.message : "Unknown localStorage error.",
    };
  }
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeStatus(value: unknown): RecommendationOutcomeStatus {
  if (
    value === "pending" ||
    value === "entry_not_triggered" ||
    value === "entry_triggered" ||
    value === "target_hit" ||
    value === "stop_hit" ||
    value === "target_before_stop" ||
    value === "stop_before_target" ||
    value === "neither_hit" ||
    value === "expired" ||
    value === "invalid" ||
    value === "incomplete" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeEvent(value: unknown): RecommendationOutcomeEvent {
  if (
    value === "entry_triggered" ||
    value === "target_hit" ||
    value === "stop_hit" ||
    value === "expired" ||
    value === "neither" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

export function recommendationOutcomeFromPersistenceRow(
  row: Record<string, unknown>,
): RecommendationOutcome | null {
  const id = textOrNull(String(row.id ?? ""));
  const snapshotFingerprint = textOrNull(String(row.snapshot_fingerprint ?? ""));
  const horizon = normalizeHorizon(String(row.horizon ?? ""));

  if (!id || !snapshotFingerprint || horizon === "unknown") {
    return null;
  }

  const payloadJson = objectOrNull(row.payload_json) ?? {};
  const warningsJson = Array.isArray(row.warnings_json)
    ? row.warnings_json.filter((warning): warning is string => typeof warning === "string")
    : [];
  const evaluatedAt = toIso(String(row.evaluated_at ?? "")) ?? new Date().toISOString();
  const createdAt = toIso(String(row.created_at ?? "")) ?? evaluatedAt;
  const updatedAt = toIso(String(row.updated_at ?? "")) ?? evaluatedAt;

  return {
    id,
    snapshot_id: textOrNull(String(row.snapshot_id ?? "")),
    snapshot_fingerprint: snapshotFingerprint,
    recommendation_id: textOrNull(String(row.recommendation_id ?? "")),
    ticker: textOrNull(String(row.ticker ?? ""))?.toUpperCase() ?? null,
    side: normalizeSide(String(payloadJson.side ?? payloadJson.direction ?? "")),
    recommended_at: toIso(String(row.recommended_at ?? "")),
    evaluated_at: evaluatedAt,
    horizon,
    status: normalizeStatus(row.status),
    entry: finiteNumber(payloadJson.entry),
    stop: finiteNumber(payloadJson.stop),
    target: finiteNumber(payloadJson.target),
    entry_triggered: typeof row.entry_triggered === "boolean" ? row.entry_triggered : null,
    entry_triggered_at: textOrNull(String(payloadJson.entry_triggered_at ?? "")),
    target_hit: typeof row.target_hit === "boolean" ? row.target_hit : null,
    target_hit_at: textOrNull(String(payloadJson.target_hit_at ?? "")),
    stop_hit: typeof row.stop_hit === "boolean" ? row.stop_hit : null,
    stop_hit_at: textOrNull(String(payloadJson.stop_hit_at ?? "")),
    first_terminal_event: normalizeEvent(row.first_terminal_event),
    best_price_after_recommendation: finiteNumber(row.best_price),
    worst_price_after_recommendation: finiteNumber(row.worst_price),
    best_r: finiteNumber(row.best_r),
    worst_r: finiteNumber(row.worst_r),
    eod_price: finiteNumber(row.eod_price),
    eod_r: finiteNumber(row.eod_r),
    current_price: finiteNumber(payloadJson.current_price),
    current_r: finiteNumber(payloadJson.current_r),
    max_favorable_excursion: finiteNumber(payloadJson.max_favorable_excursion),
    max_adverse_excursion: finiteNumber(payloadJson.max_adverse_excursion),
    time_to_entry_minutes: finiteNumber(payloadJson.time_to_entry_minutes),
    time_to_target_minutes: finiteNumber(payloadJson.time_to_target_minutes),
    time_to_stop_minutes: finiteNumber(payloadJson.time_to_stop_minutes),
    source: textOrNull(String(payloadJson.source ?? "")) ?? "supabase",
    provider: textOrNull(String(payloadJson.provider ?? "")),
    data_completeness:
      textOrNull(String(payloadJson.data_completeness ?? "")) ?? "unknown",
    warnings: warningsJson,
    blockers: Array.isArray(payloadJson.blockers)
      ? payloadJson.blockers.filter((blocker): blocker is string => typeof blocker === "string")
      : [],
    payload_json: payloadJson,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}
