import type { IntradayCandle } from "@/lib/market-data";

export type IntradayIndicators = {
  vwap: number | null;
  latestPrice: number | null;
  priceVsVwapPercent: number | null;
  isAboveVwap: boolean | null;
  recentHigh: number | null;
  recentLow: number | null;
  recentRangePercent: number | null;
  momentumPercent: number | null;
  momentumDirection: "up" | "down" | "flat" | "unknown";
  volumeTrend: "expanding" | "contracting" | "flat" | "unknown";
  latestVolume: number | null;
  averageVolume: number | null;
  // Optional only for pre-v2 persisted indicator caches and caller fixtures.
  recentVolumeRatio?: number | null;
  warnings: string[];
};

export function admissibleRecentIntradayVolumeRatio(
  indicators: Pick<IntradayIndicators, "recentVolumeRatio"> | null | undefined,
  stale: boolean | null | undefined,
): number | null {
  const ratio = indicators?.recentVolumeRatio;
  return stale !== true &&
    typeof ratio === "number" &&
    Number.isFinite(ratio) &&
    ratio > 0
    ? ratio
    : null;
}

export function volumeTrendFromRecentVolumeRatio(
  ratio: number | null | undefined,
): IntradayIndicators["volumeTrend"] {
  if (typeof ratio !== "number" || !Number.isFinite(ratio) || ratio <= 0) {
    return "unknown";
  }
  if (ratio >= VOLUME_EXPANDING_RATIO) return "expanding";
  if (ratio <= VOLUME_CONTRACTING_RATIO) return "contracting";
  return "flat";
}

/** Normalizes persisted indicator evidence, including pre-v2 cache rows. */
export function intradayIndicatorsFromUnknown(
  value: unknown,
): IntradayIndicators | null {
  if (typeof value !== "object" || value === null) return null;

  const raw = value as Partial<IntradayIndicators>;
  const parseNumber = (input: unknown) => {
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const recentVolumeRatio =
    typeof raw.recentVolumeRatio === "number" &&
    Number.isFinite(raw.recentVolumeRatio) &&
    raw.recentVolumeRatio > 0
      ? raw.recentVolumeRatio
      : null;

  return {
    vwap: parseNumber(raw.vwap),
    latestPrice: parseNumber(raw.latestPrice),
    priceVsVwapPercent: parseNumber(raw.priceVsVwapPercent),
    isAboveVwap:
      typeof raw.isAboveVwap === "boolean" ? raw.isAboveVwap : null,
    recentHigh: parseNumber(raw.recentHigh),
    recentLow: parseNumber(raw.recentLow),
    recentRangePercent: parseNumber(raw.recentRangePercent),
    momentumPercent: parseNumber(raw.momentumPercent),
    momentumDirection:
      raw.momentumDirection === "up" ||
      raw.momentumDirection === "down" ||
      raw.momentumDirection === "flat"
        ? raw.momentumDirection
        : "unknown",
    volumeTrend: volumeTrendFromRecentVolumeRatio(recentVolumeRatio),
    latestVolume: parseNumber(raw.latestVolume),
    averageVolume: parseNumber(raw.averageVolume),
    recentVolumeRatio,
    warnings: Array.isArray(raw.warnings)
      ? raw.warnings.filter((item): item is string => typeof item === "string")
      : [],
  };
}

const RECENT_CANDLE_COUNT = 12;
const MOMENTUM_LOOKBACK_MAX = 6;
const MOMENTUM_UP_THRESHOLD = 0.3;
const MOMENTUM_DOWN_THRESHOLD = -0.3;
const VOLUME_EXPANDING_RATIO = 1.15;
const VOLUME_CONTRACTING_RATIO = 0.85;

function round(value: number) {
  return Number(value.toFixed(2));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateIntradayIndicators(
  candles: IntradayCandle[] | null | undefined,
  observation: {
    interval: "5min" | "15min";
    observedAtSeconds: number;
  },
): IntradayIndicators {
  const warnings: string[] = [];

  if (!Array.isArray(candles) || candles.length === 0) {
    return {
      vwap: null,
      latestPrice: null,
      priceVsVwapPercent: null,
      isAboveVwap: null,
      recentHigh: null,
      recentLow: null,
      recentRangePercent: null,
      momentumPercent: null,
      momentumDirection: "unknown",
      volumeTrend: "unknown",
      latestVolume: null,
      averageVolume: null,
      recentVolumeRatio: null,
      warnings: ["Intraday candles unavailable."],
    };
  }

  const sortedCandles = [...candles].sort(
    (first, second) => first.timestamp - second.timestamp,
  );
  let vwapNumerator = 0;
  let totalVolume = 0;
  let invalidCandleCount = 0;

  for (const candle of sortedCandles) {
    if (
      !isFiniteNumber(candle.high) ||
      !isFiniteNumber(candle.low) ||
      !isFiniteNumber(candle.close)
    ) {
      invalidCandleCount += 1;
      continue;
    }

    if (!isFiniteNumber(candle.volume) || candle.volume <= 0) {
      continue;
    }

    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    vwapNumerator += typicalPrice * candle.volume;
    totalVolume += candle.volume;
  }

  if (invalidCandleCount > 0) {
    warnings.push(`${invalidCandleCount} incomplete intraday candles ignored.`);
  }

  if (totalVolume <= 0) {
    warnings.push("Intraday volume unavailable for VWAP.");
  }

  const latestCandle = [...sortedCandles]
    .reverse()
    .find((candle) => isFiniteNumber(candle.close));
  const latestPrice = latestCandle ? round(latestCandle.close) : null;
  const vwap = totalVolume > 0 ? round(vwapNumerator / totalVolume) : null;
  const priceVsVwapPercent =
    latestPrice !== null && vwap !== null && vwap > 0
      ? round(((latestPrice - vwap) / vwap) * 100)
      : null;
  const isAboveVwap =
    latestPrice !== null && vwap !== null ? latestPrice > vwap : null;
  const recentCandles = sortedCandles
    .filter(
      (candle) =>
        isFiniteNumber(candle.high) &&
        isFiniteNumber(candle.low) &&
        isFiniteNumber(candle.close),
    )
    .slice(-RECENT_CANDLE_COUNT);
  const recentHigh =
    recentCandles.length > 0
      ? round(Math.max(...recentCandles.map((candle) => candle.high)))
      : null;
  const recentLow =
    recentCandles.length > 0
      ? round(Math.min(...recentCandles.map((candle) => candle.low)))
      : null;
  const recentRangePercent =
    recentHigh !== null && recentLow !== null && latestPrice !== null && latestPrice > 0
      ? round(((recentHigh - recentLow) / latestPrice) * 100)
      : null;
  const closeCandles = sortedCandles.filter((candle) => isFiniteNumber(candle.close));
  const lookback = Math.min(MOMENTUM_LOOKBACK_MAX, closeCandles.length - 1);
  const previousClose =
    lookback > 0 ? closeCandles[closeCandles.length - 1 - lookback]?.close : null;
  const momentumPercent =
    latestPrice !== null &&
    previousClose !== null &&
    isFiniteNumber(previousClose) &&
    previousClose > 0
      ? round(((latestPrice - previousClose) / previousClose) * 100)
      : null;
  const momentumDirection =
    momentumPercent === null
      ? "unknown"
      : momentumPercent > MOMENTUM_UP_THRESHOLD
        ? "up"
        : momentumPercent < MOMENTUM_DOWN_THRESHOLD
          ? "down"
          : "flat";
  const volumeCandles = sortedCandles.filter(
    (candle) => isFiniteNumber(candle.volume) && candle.volume > 0,
  );
  const latestVolume =
    volumeCandles.length > 0
      ? Math.round(volumeCandles[volumeCandles.length - 1].volume)
      : null;
  const recentVolumeCandles = volumeCandles.slice(-RECENT_CANDLE_COUNT);
  const averageVolume =
    recentVolumeCandles.length > 0
      ? Math.round(average(recentVolumeCandles.map((candle) => candle.volume)))
      : null;
  // Do not compact around missing/zero bars: that would silently compare
  // unequal clock windows. Require two closed, evenly spaced windows from
  // the same regular-session intraday request before ranking this feature.
  const intervalSeconds = observation.interval === "5min" ? 5 * 60 : 15 * 60;
  const volumeWindow = sortedCandles
    .filter(
      (candle) =>
        Number.isFinite(observation.observedAtSeconds) &&
        candle.timestamp + intervalSeconds <= observation.observedAtSeconds,
    )
    .slice(-RECENT_CANDLE_COUNT * 2);
  const completeVolumeWindow =
    volumeWindow.length === RECENT_CANDLE_COUNT * 2 &&
    volumeWindow.every(
      (candle, index) =>
        isFiniteNumber(candle.volume) &&
        candle.volume > 0 &&
        (index === 0 ||
          candle.timestamp - volumeWindow[index - 1].timestamp ===
            intervalSeconds),
    );
  const recentVolumeRatio =
    completeVolumeWindow
      ? average(
          volumeWindow
            .slice(RECENT_CANDLE_COUNT)
            .map((candle) => candle.volume),
        ) /
        average(
          volumeWindow
            .slice(0, RECENT_CANDLE_COUNT)
            .map((candle) => candle.volume),
        )
      : null;
  const volumeTrend = volumeTrendFromRecentVolumeRatio(recentVolumeRatio);

  if (volumeCandles.length === 0) {
    warnings.push("Intraday volume unavailable.");
  }

  return {
    vwap,
    latestPrice,
    priceVsVwapPercent,
    isAboveVwap,
    recentHigh,
    recentLow,
    recentRangePercent,
    momentumPercent,
    momentumDirection,
    volumeTrend,
    latestVolume,
    averageVolume,
    recentVolumeRatio,
    warnings,
  };
}
