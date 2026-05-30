import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { normalizeUnknownError } from "@/lib/error-logging";

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

type SupabaseMutationResult = {
  error?: { message?: string } | null;
};

type SupabaseQueryBuilder = {
  upsert?: (
    value: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => PromiseLike<SupabaseMutationResult>;
};

export type RecommendationOutcomeSupabaseClient = {
  from: (table: string) => SupabaseQueryBuilder;
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

  if (side === "short") {
    return "short";
  }

  if (side === "long") {
    return "long";
  }

  return "unknown";
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
        (recommendedTime === null || candle.time >= recommendedTime),
    )
    .sort((first, second) => (first.time ?? 0) - (second.time ?? 0));
}

function priceTouchesEntry(
  candle: { high: number | null; low: number | null },
  entry: number,
) {
  return candle.high !== null && candle.low !== null && candle.low <= entry && candle.high >= entry;
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
  const side = normalizeSide(input.side ?? snapshot?.side ?? null);
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

  if (!snapshotFingerprint) {
    blockers.push("Snapshot fingerprint is unavailable.");
  }

  if (!ticker) {
    blockers.push("Ticker is unavailable.");
  }

  if (side !== "long" && side !== "short") {
    blockers.push("Recommendation side is unavailable.");
  }

  if (entry === null || stop === null || target === null || risk === null) {
    blockers.push("Entry, stop, target, or valid risk per share is unavailable.");
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

      const entryIndex = candles.findIndex((candle) =>
        priceTouchesEntry(candle, entry),
      );
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
            if (targetTouched && stopTouched) {
              firstTerminalEvent = "unknown";
              status = "unknown";
              warnings.push(
                "Target and stop were touched in the same candle; intrabar order is unknown.",
              );
            } else if (targetTouched) {
              firstTerminalEvent = "target_hit";
              status = "target_before_stop";
            } else {
              firstTerminalEvent = "stop_hit";
              status = "stop_before_target";
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

  const eodR = rFromPrice(eodPrice, entry, risk, side);
  const dataCompleteness =
    textOrNull(input.data_completeness) ??
    (hasCandles ? "complete" : currentPrice !== null || eodPrice !== null ? "partial" : "none");

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
      candle_count: candles.length,
      has_current_price: currentPrice !== null,
      has_eod_price: eodPrice !== null,
      risk_per_share: risk,
      source,
      provider: textOrNull(input.provider),
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

function toSupabaseRow(outcome: RecommendationOutcome) {
  return {
    id: outcome.id,
    snapshot_id: outcome.snapshot_id,
    snapshot_fingerprint: outcome.snapshot_fingerprint,
    recommendation_id: outcome.recommendation_id,
    ticker: outcome.ticker,
    recommended_at: outcome.recommended_at,
    evaluated_at: outcome.evaluated_at,
    horizon: outcome.horizon,
    status: outcome.status,
    entry_triggered: outcome.entry_triggered,
    target_hit: outcome.target_hit,
    stop_hit: outcome.stop_hit,
    first_terminal_event: outcome.first_terminal_event,
    best_price: outcome.best_price_after_recommendation,
    worst_price: outcome.worst_price_after_recommendation,
    best_r: outcome.best_r,
    worst_r: outcome.worst_r,
    eod_price: outcome.eod_price,
    eod_r: outcome.eod_r,
    payload_json: outcome.payload_json,
    warnings_json: outcome.warnings,
    created_at: outcome.created_at,
    updated_at: outcome.updated_at,
  };
}

export async function persistRecommendationOutcome(
  outcome: RecommendationOutcome,
  options: {
    supabaseClient?: RecommendationOutcomeSupabaseClient | null;
    storage?: Storage;
  } = {},
): Promise<RecommendationOutcomePersistenceResult> {
  if (options.supabaseClient?.from) {
    try {
      const result = await options.supabaseClient
        .from("recommendation_outcomes")
        .upsert?.(toSupabaseRow(outcome), {
          onConflict: "snapshot_fingerprint,horizon",
        });

      if (!result?.error) {
        return {
          status: "saved",
          mode: "supabase",
          outcome,
          error: null,
        };
      }

      console.error("[recommendation-outcome] supabase_persistence_error", {
        source: "supabase.recommendation_outcomes",
        operation: "upsert_outcome",
        snapshotFingerprint: outcome.snapshot_fingerprint,
        horizon: outcome.horizon,
        error: normalizeUnknownError(result.error),
      });
    } catch (error) {
      console.error("[recommendation-outcome] supabase_persistence_exception", {
        source: "supabase.recommendation_outcomes",
        operation: "upsert_outcome",
        snapshotFingerprint: outcome.snapshot_fingerprint,
        horizon: outcome.horizon,
        error: normalizeUnknownError(error),
      });
      // Fall through to localStorage. Outcome persistence must never block the UI.
    }
  }

  return persistRecommendationOutcomeToLocalStorage(outcome, options.storage);
}
