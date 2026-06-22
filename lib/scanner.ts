import "server-only";

import {
  getOrRefreshIntradayIndicators,
  MAX_FRESH_INDICATOR_FETCHES_PER_RUN,
  SCANNER_INDICATOR_MAX_AGE_MINUTES,
} from "@/lib/intraday-indicator-cache";
import type { IntradayIndicators } from "@/lib/intraday-indicators";
import { getDailyCandles, type DailyCandle } from "@/lib/market-data";
import { supabase } from "@/lib/supabase";
import { normalizeUnknownError } from "@/lib/error-logging";
import { errorType, type ActiveScanTraceRecorder } from "@/lib/active-scan-trace";

export type ScannerCandidate = {
  ticker: string;
  company_name: string;
  sector: string;
  mock_current_price: number;
  mock_trend: string;
  mock_volume_context: string;
  mock_support: number;
  mock_resistance: number;
  mock_news_context: string;
  latest_close?: number;
  ma20?: number;
  ma50?: number;
  high_20d?: number;
  volume_ratio?: number;
  distance_to_20d_high?: number;
  change_5d_percent?: number;
  proposed_entry_low?: number;
  proposed_entry_high?: number;
  proposed_stop_loss?: number;
  proposed_target_1?: number;
  proposed_target_2?: number;
  proposed_risk_reward?: number;
  session_open?: number;
  session_high?: number;
  session_low?: number;
  previous_close?: number;
  recent_change_percent?: number;
  recent_range_position?: number;
  recent_higher_highs_count?: number;
  recent_higher_lows_count?: number;
  recent_bullish_candles?: number;
  recent_volume_ratio?: number;
  average_range_percent?: number;
  latest_range_percent?: number;
  range_expansion_ratio?: number;
  intraday_indicators?: IntradayIndicators | null;
  intraday_indicator_source?: "cache" | "fresh" | "unavailable";
  intraday_indicator_cached_at?: string | null;
  intraday_indicator_stale?: boolean;
  reference_price_used_for_plan?: number | null;
  reference_price_source?: string | null;
  reference_price_timestamp?: string | null;
  reference_price_symbol?: string | null;
  reference_price_provider?: string | null;
  reference_price_read_path?: string | null;
};

type ScannerCacheRow = {
  ticker: string | null;
  updated_at: string | null;
  latest_close: number | string | null;
  ma20: number | string | null;
  ma50: number | string | null;
  high_20d: number | string | null;
  volume_ratio: number | string | null;
  distance_to_20d_high: number | string | null;
  change_5d_percent: number | string | null;
  proposed_entry_low: number | string | null;
  proposed_entry_high: number | string | null;
  proposed_stop_loss: number | string | null;
  proposed_target_1: number | string | null;
  proposed_target_2: number | string | null;
  proposed_risk_reward: number | string | null;
  trend_context: string | null;
  volume_context: string | null;
  raw: unknown;
};

type ScannerValues = {
  latest_close: number;
  ma20: number;
  ma50: number;
  high_20d: number;
  volume_ratio: number;
  distance_to_20d_high: number;
  change_5d_percent: number;
  proposed_entry_low: number;
  proposed_entry_high: number;
  proposed_stop_loss: number;
  proposed_target_1: number;
  proposed_target_2: number;
  proposed_risk_reward: number;
  trend_context: string;
  volume_context: string;
  session_open: number;
  session_high: number;
  session_low: number;
  previous_close: number;
  recent_change_percent: number;
  recent_range_position: number;
  recent_higher_highs_count: number;
  recent_higher_lows_count: number;
  recent_bullish_candles: number;
  recent_volume_ratio: number;
  average_range_percent: number;
  latest_range_percent: number;
  range_expansion_ratio: number;
  intraday_indicators: IntradayIndicators | null;
  reference_price_timestamp: string | null;
  reference_price_provider: string | null;
  reference_price_read_path: string | null;
};

export type ScannerSource = "manual" | "scheduled";

export type ScanMarketOptions = {
  source: ScannerSource;
  maxFreshProviderCalls?: number;
  activeScanTrace?: ActiveScanTraceRecorder | null;
};

const CACHE_TTL_MS = 45 * 60 * 1000;
const FRESH_CALL_DELAY_MS = 8 * 1000;
const MANUAL_MAX_FRESH_PROVIDER_CALLS = 1;
const SCHEDULED_MAX_FRESH_PROVIDER_CALLS = 6;
const CANDLE_DAYS_NEEDED = 60;

type CandidateWithIndicatorCache = {
  candidate: ScannerCandidate;
  indicatorSource: "cache" | "fresh" | "unavailable";
};

function logScanner(label: string, value: unknown) {
  console.log(`[scanner] ${label}`, value);
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function roundInt(value: number) {
  return Math.round(value);
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isoFromTimestampSeconds(value: unknown) {
  const timestamp = parseNumber(value);
  if (timestamp === null) return null;
  const date = new Date(timestamp * 1000);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function isoStringOrNull(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function parseIntradayIndicators(value: unknown): IntradayIndicators | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = value as Partial<IntradayIndicators>;

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
    volumeTrend:
      raw.volumeTrend === "expanding" ||
      raw.volumeTrend === "contracting" ||
      raw.volumeTrend === "flat"
        ? raw.volumeTrend
        : "unknown",
    latestVolume: parseNumber(raw.latestVolume),
    averageVolume: parseNumber(raw.averageVolume),
    warnings: Array.isArray(raw.warnings)
      ? raw.warnings.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function rawScannerValues(row: ScannerCacheRow) {
  if (typeof row.raw !== "object" || row.raw === null) {
    return {};
  }

  const raw = row.raw as { scanner_values?: unknown };

  return typeof raw.scanner_values === "object" && raw.scanner_values !== null
    ? (raw.scanner_values as Record<string, unknown>)
    : {};
}

function movingAverage(candles: DailyCandle[], length: number) {
  return round(average(candles.slice(-length).map((candle) => candle.close)));
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getMaxFreshProviderCalls(options: ScanMarketOptions) {
  const defaultMaxFreshProviderCalls =
    options.source === "manual"
      ? MANUAL_MAX_FRESH_PROVIDER_CALLS
      : SCHEDULED_MAX_FRESH_PROVIDER_CALLS;

  if (options.maxFreshProviderCalls === undefined) {
    return defaultMaxFreshProviderCalls;
  }

  if (
    !Number.isFinite(options.maxFreshProviderCalls) ||
    options.maxFreshProviderCalls < 0
  ) {
    return defaultMaxFreshProviderCalls;
  }

  return Math.floor(options.maxFreshProviderCalls);
}

function getCacheAgeMs(row: ScannerCacheRow, now: number) {
  if (!row.updated_at) {
    return Number.POSITIVE_INFINITY;
  }

  const updatedAt = new Date(row.updated_at).getTime();
  return Number.isFinite(updatedAt) ? now - updatedAt : Number.POSITIVE_INFINITY;
}

function isCacheFresh(row: ScannerCacheRow, now: number) {
  return getCacheAgeMs(row, now) >= 0 && getCacheAgeMs(row, now) < CACHE_TTL_MS;
}

function scannerValuesFromCache(row: ScannerCacheRow): ScannerValues | null {
  const latestClose = parseNumber(row.latest_close);
  const ma20 = parseNumber(row.ma20);
  const ma50 = parseNumber(row.ma50);
  const high20d = parseNumber(row.high_20d);
  const volumeRatio = parseNumber(row.volume_ratio);
  const distanceTo20dHigh = parseNumber(row.distance_to_20d_high);
  const change5dPercent = parseNumber(row.change_5d_percent);
  const entryLow = parseNumber(row.proposed_entry_low);
  const entryHigh = parseNumber(row.proposed_entry_high);
  const stopLoss = parseNumber(row.proposed_stop_loss);
  const target1 = parseNumber(row.proposed_target_1);
  const target2 = parseNumber(row.proposed_target_2);
  const riskReward = parseNumber(row.proposed_risk_reward);
  const rawValues = rawScannerValues(row);

  if (
    latestClose === null ||
    ma20 === null ||
    ma50 === null ||
    high20d === null ||
    volumeRatio === null ||
    distanceTo20dHigh === null ||
    change5dPercent === null ||
    entryLow === null ||
    entryHigh === null ||
    stopLoss === null ||
    target1 === null ||
    target2 === null ||
    riskReward === null
  ) {
    return null;
  }

  return {
    latest_close: latestClose,
    ma20,
    ma50,
    high_20d: high20d,
    volume_ratio: volumeRatio,
    distance_to_20d_high: distanceTo20dHigh,
    change_5d_percent: change5dPercent,
    proposed_entry_low: entryLow,
    proposed_entry_high: entryHigh,
    proposed_stop_loss: stopLoss,
    proposed_target_1: target1,
    proposed_target_2: target2,
    proposed_risk_reward: riskReward,
    trend_context: row.trend_context || "Cached scanner trend context unavailable",
    volume_context: row.volume_context || "Cached scanner volume context unavailable",
    session_open: parseNumber(rawValues.session_open) ?? latestClose,
    session_high: parseNumber(rawValues.session_high) ?? latestClose,
    session_low: parseNumber(rawValues.session_low) ?? latestClose,
    previous_close: parseNumber(rawValues.previous_close) ?? latestClose,
    recent_change_percent: parseNumber(rawValues.recent_change_percent) ?? 0,
    recent_range_position: parseNumber(rawValues.recent_range_position) ?? 50,
    recent_higher_highs_count:
      parseNumber(rawValues.recent_higher_highs_count) ?? 0,
    recent_higher_lows_count: parseNumber(rawValues.recent_higher_lows_count) ?? 0,
    recent_bullish_candles: parseNumber(rawValues.recent_bullish_candles) ?? 0,
    recent_volume_ratio: parseNumber(rawValues.recent_volume_ratio) ?? volumeRatio,
    average_range_percent: parseNumber(rawValues.average_range_percent) ?? 2,
    latest_range_percent: parseNumber(rawValues.latest_range_percent) ?? 2,
    range_expansion_ratio: parseNumber(rawValues.range_expansion_ratio) ?? 1,
    intraday_indicators: parseIntradayIndicators(rawValues.intraday_indicators),
    reference_price_timestamp:
      isoStringOrNull(rawValues.reference_price_timestamp) ??
      isoStringOrNull(row.updated_at),
    reference_price_provider:
      typeof rawValues.reference_price_provider === "string" &&
      rawValues.reference_price_provider.trim()
        ? rawValues.reference_price_provider.trim()
        : "scanner_cache",
    reference_price_read_path: "scanner_candidate.latest_close",
  };
}

function buildTrendContext(values: {
  latestClose: number;
  ma20: number;
  ma50: number;
  change5dPercent: number;
  distanceTo20dHigh: number;
}) {
  if (values.latestClose > values.ma20 && values.ma20 > values.ma50) {
    return `Uptrend above MA20 and MA50, ${values.distanceTo20dHigh}% below the 20-day high`;
  }

  if (values.latestClose > values.ma50 && values.change5dPercent >= 0) {
    return `Constructive recovery above MA50 with 5-day change ${values.change5dPercent}%`;
  }

  if (values.latestClose > values.ma20) {
    return `Short-term strength above MA20, but trend needs confirmation`;
  }

  return `Pullback below MA20 with 5-day change ${values.change5dPercent}%`;
}

function buildVolumeContext(volumeRatio: number) {
  if (volumeRatio >= 1.5) {
    return `Volume is elevated at ${volumeRatio}x the 20-day average`;
  }

  if (volumeRatio >= 1.05) {
    return `Volume is slightly above average at ${volumeRatio}x`;
  }

  if (volumeRatio >= 0.8) {
    return `Volume is near average at ${volumeRatio}x`;
  }

  return `Volume is light at ${volumeRatio}x the 20-day average`;
}

function calculateScannerValues(candles: DailyCandle[]): ScannerValues {
  if (candles.length < 50) {
    throw new Error("Scanner needs at least 50 daily candles.");
  }

  const latestCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];
  const fiveDaysAgoCandle = candles[candles.length - 6];
  const twentyDayCandles = candles.slice(-20);
  const recentCandles = candles.slice(-5);
  const priorRecentCandles = candles.slice(-10, -5);

  if (
    !latestCandle ||
    !previousCandle ||
    !fiveDaysAgoCandle ||
    fiveDaysAgoCandle.close === 0
  ) {
    throw new Error("Scanner received incomplete candle history.");
  }

  const latestClose = round(latestCandle.close);
  const ma20 = movingAverage(candles, 20);
  const ma50 = movingAverage(candles, 50);
  const high20d = round(Math.max(...twentyDayCandles.map((candle) => candle.high)));
  const averageVolume20d = average(twentyDayCandles.map((candle) => candle.volume));
  const volumeRatio =
    averageVolume20d > 0 ? round(latestCandle.volume / averageVolume20d) : 1;
  const distanceTo20dHigh =
    high20d > 0 ? round(((high20d - latestClose) / high20d) * 100) : 0;
  const change5dPercent = round(
    ((latestClose - fiveDaysAgoCandle.close) / fiveDaysAgoCandle.close) * 100,
  );
  const entryLow = round(latestClose * 0.99);
  const entryHigh = round(latestClose * 1.01);
  const stopLoss = round(Math.min(ma20, latestClose * 0.96));
  const riskPerShare = Math.max(entryHigh - stopLoss, latestClose * 0.01);
  const target1 = round(entryHigh + riskPerShare * 1.5);
  const target2 = round(entryHigh + riskPerShare * 2.25);
  const riskReward = round((target2 - entryHigh) / riskPerShare);
  const recentLow = Math.min(...recentCandles.map((candle) => candle.low));
  const recentHigh = Math.max(...recentCandles.map((candle) => candle.high));
  const recentRange = recentHigh - recentLow;
  const recentRangePosition =
    recentRange > 0 ? round(((latestClose - recentLow) / recentRange) * 100) : 50;
  const recentChangePercent = round(
    ((latestClose - fiveDaysAgoCandle.close) / fiveDaysAgoCandle.close) * 100,
  );
  const recentHigherHighsCount = recentCandles
    .slice(1)
    .filter((candle, index) => candle.high > recentCandles[index].high).length;
  const recentHigherLowsCount = recentCandles
    .slice(1)
    .filter((candle, index) => candle.low > recentCandles[index].low).length;
  const recentBullishCandles = recentCandles.filter(
    (candle) => candle.close > candle.open,
  ).length;
  const priorRecentVolume = average(priorRecentCandles.map((candle) => candle.volume));
  const recentVolume = average(recentCandles.map((candle) => candle.volume));
  const recentVolumeRatio =
    priorRecentVolume > 0 ? round(recentVolume / priorRecentVolume) : volumeRatio;
  const latestRangePercent =
    latestClose > 0
      ? round(((latestCandle.high - latestCandle.low) / latestClose) * 100)
      : 0;
  const averageRangePercent = round(
    average(
      twentyDayCandles.map((candle) =>
        candle.close > 0 ? ((candle.high - candle.low) / candle.close) * 100 : 0,
      ),
    ),
  );
  const rangeExpansionRatio =
    averageRangePercent > 0 ? round(latestRangePercent / averageRangePercent) : 1;

  return {
    latest_close: latestClose,
    ma20,
    ma50,
    high_20d: high20d,
    volume_ratio: volumeRatio,
    distance_to_20d_high: distanceTo20dHigh,
    change_5d_percent: change5dPercent,
    proposed_entry_low: entryLow,
    proposed_entry_high: entryHigh,
    proposed_stop_loss: stopLoss,
    proposed_target_1: target1,
    proposed_target_2: target2,
    proposed_risk_reward: riskReward,
    trend_context: buildTrendContext({
      latestClose,
      ma20,
      ma50,
      change5dPercent,
      distanceTo20dHigh,
    }),
    volume_context: buildVolumeContext(volumeRatio),
    session_open: round(latestCandle.open),
    session_high: round(latestCandle.high),
    session_low: round(latestCandle.low),
    previous_close: round(previousCandle.close),
    recent_change_percent: recentChangePercent,
    recent_range_position: roundInt(recentRangePosition),
    recent_higher_highs_count: recentHigherHighsCount,
    recent_higher_lows_count: recentHigherLowsCount,
    recent_bullish_candles: recentBullishCandles,
    recent_volume_ratio: recentVolumeRatio,
    average_range_percent: averageRangePercent,
    latest_range_percent: latestRangePercent,
    range_expansion_ratio: rangeExpansionRatio,
    intraday_indicators: null,
    reference_price_timestamp: isoFromTimestampSeconds(latestCandle.timestamp),
    reference_price_provider: "twelve_data",
    reference_price_read_path: "scanner_candidate.latest_close",
  };
}

function buildCandidate(
  baseCandidate: ScannerCandidate,
  scannerValues: ScannerValues,
): ScannerCandidate {
  return {
    ...baseCandidate,
    mock_current_price: scannerValues.latest_close,
    mock_trend: scannerValues.trend_context,
    mock_volume_context: scannerValues.volume_context,
    mock_support: scannerValues.proposed_stop_loss,
    mock_resistance: scannerValues.proposed_target_1,
    mock_news_context: [
      `Scanner context: MA20 ${scannerValues.ma20}, MA50 ${scannerValues.ma50}.`,
      `20-day high ${scannerValues.high_20d}, 5-day change ${scannerValues.change_5d_percent}%.`,
      "No live headlines used.",
    ].join(" "),
    latest_close: scannerValues.latest_close,
    ma20: scannerValues.ma20,
    ma50: scannerValues.ma50,
    high_20d: scannerValues.high_20d,
    volume_ratio: scannerValues.volume_ratio,
    distance_to_20d_high: scannerValues.distance_to_20d_high,
    change_5d_percent: scannerValues.change_5d_percent,
    proposed_entry_low: scannerValues.proposed_entry_low,
    proposed_entry_high: scannerValues.proposed_entry_high,
    proposed_stop_loss: scannerValues.proposed_stop_loss,
    proposed_target_1: scannerValues.proposed_target_1,
    proposed_target_2: scannerValues.proposed_target_2,
    proposed_risk_reward: scannerValues.proposed_risk_reward,
    session_open: scannerValues.session_open,
    session_high: scannerValues.session_high,
    session_low: scannerValues.session_low,
    previous_close: scannerValues.previous_close,
    recent_change_percent: scannerValues.recent_change_percent,
    recent_range_position: scannerValues.recent_range_position,
    recent_higher_highs_count: scannerValues.recent_higher_highs_count,
    recent_higher_lows_count: scannerValues.recent_higher_lows_count,
    recent_bullish_candles: scannerValues.recent_bullish_candles,
    recent_volume_ratio: scannerValues.recent_volume_ratio,
    average_range_percent: scannerValues.average_range_percent,
    latest_range_percent: scannerValues.latest_range_percent,
    range_expansion_ratio: scannerValues.range_expansion_ratio,
    intraday_indicators: scannerValues.intraday_indicators,
    reference_price_used_for_plan: scannerValues.latest_close,
    reference_price_source: "scanner_candidate_latest_close",
    reference_price_timestamp: scannerValues.reference_price_timestamp,
    reference_price_symbol: baseCandidate.ticker,
    reference_price_provider: scannerValues.reference_price_provider,
    reference_price_read_path: scannerValues.reference_price_read_path,
  };
}

async function getCachedRows(tickers: string[]): Promise<Map<string, ScannerCacheRow>> {
  const { data, error } = await supabase
    .from("scanner_cache")
    .select(
      [
        "ticker",
        "updated_at",
        "latest_close",
        "ma20",
        "ma50",
        "high_20d",
        "volume_ratio",
        "distance_to_20d_high",
        "change_5d_percent",
        "proposed_entry_low",
        "proposed_entry_high",
        "proposed_stop_loss",
        "proposed_target_1",
        "proposed_target_2",
        "proposed_risk_reward",
        "trend_context",
        "volume_context",
        "raw",
      ].join(","),
    )
    .in("ticker", tickers);

  if (error) {
    console.error("[scanner] cache_read_error", {
      source: "supabase.scanner_cache",
      operation: "select_cached_tickers",
      tickers,
      error: normalizeUnknownError(error),
    });
    return new Map<string, ScannerCacheRow>();
  }

  const rows = (data ?? []) as unknown as ScannerCacheRow[];
  const entries: [string, ScannerCacheRow][] = [];

  for (const row of rows) {
    const ticker = typeof row.ticker === "string" ? row.ticker.toUpperCase() : "";

    if (ticker) {
      entries.push([ticker, row]);
    }
  }

  return new Map(entries);
}

async function upsertCachedValues(
  baseCandidate: ScannerCandidate,
  scannerValues: ScannerValues,
) {
  const { error } = await supabase.from("scanner_cache").upsert(
    {
      ticker: baseCandidate.ticker,
      updated_at: new Date().toISOString(),
      latest_close: scannerValues.latest_close,
      ma20: scannerValues.ma20,
      ma50: scannerValues.ma50,
      high_20d: scannerValues.high_20d,
      volume_ratio: scannerValues.volume_ratio,
      distance_to_20d_high: scannerValues.distance_to_20d_high,
      change_5d_percent: scannerValues.change_5d_percent,
      proposed_entry_low: scannerValues.proposed_entry_low,
      proposed_entry_high: scannerValues.proposed_entry_high,
      proposed_stop_loss: scannerValues.proposed_stop_loss,
      proposed_target_1: scannerValues.proposed_target_1,
      proposed_target_2: scannerValues.proposed_target_2,
      proposed_risk_reward: scannerValues.proposed_risk_reward,
      trend_context: scannerValues.trend_context,
      volume_context: scannerValues.volume_context,
      raw: {
        ticker: baseCandidate.ticker,
        company_name: baseCandidate.company_name,
        sector: baseCandidate.sector,
        scanner_values: scannerValues,
      },
    },
    { onConflict: "ticker" },
  );

  if (error) {
    console.error("[scanner] cache_upsert_error", {
      ticker: baseCandidate.ticker,
      message: error.message,
    });
  }
}

export async function scanMarket(
  baseCandidates: ScannerCandidate[],
  options: ScanMarketOptions,
): Promise<ScannerCandidate[]> {
  const now = Date.now();
  const tickers = baseCandidates.map((candidate) => candidate.ticker);
  const cachedRowsByTicker = await getCachedRows(tickers);
  const candidates: ScannerCandidate[] = [];
  const maxFreshProviderCalls = getMaxFreshProviderCalls(options);
  const cacheHits: string[] = [];
  const cacheMisses: string[] = [];
  const staleFallbacks: string[] = [];
  const skippedDueToFreshCallLimit: string[] = [];
  const indicatorSources: Record<string, string> = {};
  let freshProviderCallsUsed = 0;
  let freshIndicatorFetchesUsed = 0;

  options.activeScanTrace?.markStage("market_data_fetch", "started");
  options.activeScanTrace?.updateMarketDataFetch({
    attempted_tickers: tickers.length,
  });

  async function attachIntradayIndicators(
    candidate: ScannerCandidate,
  ): Promise<CandidateWithIndicatorCache> {
    const allowFreshFetch =
      freshProviderCallsUsed < maxFreshProviderCalls &&
      freshIndicatorFetchesUsed < MAX_FRESH_INDICATOR_FETCHES_PER_RUN;
    const result = await getOrRefreshIntradayIndicators(candidate.ticker, {
      source: options.source === "scheduled" ? "scheduled" : "manual",
      maxAgeMinutes: SCANNER_INDICATOR_MAX_AGE_MINUTES,
      allowFreshFetch,
    });

    if (result.source === "fresh") {
      freshProviderCallsUsed += 1;
      freshIndicatorFetchesUsed += 1;
      options.activeScanTrace?.incrementMarketDataFetch({
        candle_success_count: 1,
      });
    } else if (result.source === "unavailable") {
      options.activeScanTrace?.incrementMarketDataFetch({
        candle_error_count: 1,
        latest_provider_error_type: "intraday_indicators_unavailable",
      });
    }

    if (result.stale) {
      options.activeScanTrace?.incrementMarketDataFetch({ stale_count: 1 });
    }

    if (!result.indicators) {
      options.activeScanTrace?.incrementMarketDataFetch({
        empty_response_count: 1,
      });
    }

    indicatorSources[candidate.ticker] = result.source;

    return {
      candidate: {
        ...candidate,
        intraday_indicators: result.indicators,
        intraday_indicator_source: result.source,
        intraday_indicator_cached_at: result.cached_at,
        intraday_indicator_stale: result.stale,
      },
      indicatorSource: result.source,
    };
  }

  for (const baseCandidate of baseCandidates) {
    const cachedRow = cachedRowsByTicker.get(baseCandidate.ticker);
    const cachedValues = cachedRow ? scannerValuesFromCache(cachedRow) : null;

    if (cachedRow && cachedValues && isCacheFresh(cachedRow, now)) {
      cacheHits.push(baseCandidate.ticker);
      options.activeScanTrace?.incrementMarketDataFetch({
        candle_success_count: 1,
      });
      const { candidate } = await attachIntradayIndicators(
        buildCandidate(baseCandidate, cachedValues),
      );
      candidates.push(candidate);
      continue;
    }

    cacheMisses.push(baseCandidate.ticker);

    if (freshProviderCallsUsed >= maxFreshProviderCalls) {
      if (cachedValues) {
        staleFallbacks.push(baseCandidate.ticker);
        options.activeScanTrace?.incrementMarketDataFetch({
          candle_success_count: 1,
          stale_count: 1,
        });
        const { candidate } = await attachIntradayIndicators(
          buildCandidate(baseCandidate, cachedValues),
        );
        candidates.push(candidate);
      } else {
        skippedDueToFreshCallLimit.push(baseCandidate.ticker);
      }

      continue;
    }

    if (freshProviderCallsUsed > 0) {
      await sleep(FRESH_CALL_DELAY_MS);
    }

    freshProviderCallsUsed += 1;

    try {
      const candles = await getDailyCandles(baseCandidate.ticker, CANDLE_DAYS_NEEDED);
      options.activeScanTrace?.incrementMarketDataFetch({
        candle_success_count: candles.length > 0 ? 1 : 0,
        empty_response_count: candles.length > 0 ? 0 : 1,
      });
      const scannerValues = calculateScannerValues(candles);
      await upsertCachedValues(baseCandidate, scannerValues);
      const { candidate } = await attachIntradayIndicators(
        buildCandidate(baseCandidate, scannerValues),
      );
      candidates.push(candidate);
    } catch (error) {
      console.error("[scanner] provider_call_error", {
        ticker: baseCandidate.ticker,
        error: normalizeUnknownError(error),
      });
      options.activeScanTrace?.incrementMarketDataFetch({
        candle_error_count: 1,
        latest_provider_error_type: errorType(error),
      });

      if (cachedValues) {
        staleFallbacks.push(baseCandidate.ticker);
        options.activeScanTrace?.incrementMarketDataFetch({
          candle_success_count: 1,
          stale_count: 1,
        });
        const { candidate } = await attachIntradayIndicators(
          buildCandidate(baseCandidate, cachedValues),
        );
        candidates.push(candidate);
      }
    }
  }

  logScanner("source", options.source);
  logScanner("max_fresh_provider_calls", maxFreshProviderCalls);
  logScanner("cache_hits_count", cacheHits.length);
  logScanner("cache_hits", cacheHits);
  logScanner("cache_misses", cacheMisses);
  logScanner("fresh_provider_calls_used", freshProviderCallsUsed);
  logScanner("fresh_indicator_fetches_used", freshIndicatorFetchesUsed);
  logScanner("indicator_sources", indicatorSources);
  logScanner("stale_cache_fallbacks", staleFallbacks);
  logScanner("tickers_skipped_due_to_fresh_call_limit", skippedDueToFreshCallLimit);
  logScanner("candidates_returned", candidates.length);
  options.activeScanTrace?.markStage("market_data_fetch", "completed");

  return candidates;
}

export async function getScannerCandidates(
  baseCandidates: ScannerCandidate[],
): Promise<ScannerCandidate[]> {
  return scanMarket(baseCandidates, { source: "scheduled" });
}
