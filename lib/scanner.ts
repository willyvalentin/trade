import "server-only";

import { getDailyCandles, type DailyCandle } from "@/lib/market-data";
import { supabase } from "@/lib/supabase";

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
};

export type ScannerSource = "manual" | "scheduled";

export type ScanMarketOptions = {
  source: ScannerSource;
  maxFreshProviderCalls?: number;
};

const CACHE_TTL_MS = 45 * 60 * 1000;
const FRESH_CALL_DELAY_MS = 8 * 1000;
const MANUAL_MAX_FRESH_PROVIDER_CALLS = 1;
const SCHEDULED_MAX_FRESH_PROVIDER_CALLS = 6;
const CANDLE_DAYS_NEEDED = 60;

function logScanner(label: string, value: unknown) {
  console.log(`[scanner] ${label}`, value);
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
  const fiveDaysAgoCandle = candles[candles.length - 6];
  const twentyDayCandles = candles.slice(-20);

  if (!latestCandle || !fiveDaysAgoCandle || fiveDaysAgoCandle.close === 0) {
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
    console.error("[scanner] cache_read_error", error);
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
      ...scannerValues,
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
  let freshProviderCallsUsed = 0;

  for (const baseCandidate of baseCandidates) {
    const cachedRow = cachedRowsByTicker.get(baseCandidate.ticker);
    const cachedValues = cachedRow ? scannerValuesFromCache(cachedRow) : null;

    if (cachedRow && cachedValues && isCacheFresh(cachedRow, now)) {
      cacheHits.push(baseCandidate.ticker);
      candidates.push(buildCandidate(baseCandidate, cachedValues));
      continue;
    }

    cacheMisses.push(baseCandidate.ticker);

    if (freshProviderCallsUsed >= maxFreshProviderCalls) {
      if (cachedValues) {
        staleFallbacks.push(baseCandidate.ticker);
        candidates.push(buildCandidate(baseCandidate, cachedValues));
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
      const scannerValues = calculateScannerValues(candles);
      await upsertCachedValues(baseCandidate, scannerValues);
      candidates.push(buildCandidate(baseCandidate, scannerValues));
    } catch (error) {
      console.error("[scanner] provider_call_error", {
        ticker: baseCandidate.ticker,
        error,
      });

      if (cachedValues) {
        staleFallbacks.push(baseCandidate.ticker);
        candidates.push(buildCandidate(baseCandidate, cachedValues));
      }
    }
  }

  logScanner("source", options.source);
  logScanner("max_fresh_provider_calls", maxFreshProviderCalls);
  logScanner("cache_hits_count", cacheHits.length);
  logScanner("cache_hits", cacheHits);
  logScanner("cache_misses", cacheMisses);
  logScanner("fresh_provider_calls_used", freshProviderCallsUsed);
  logScanner("stale_cache_fallbacks", staleFallbacks);
  logScanner("tickers_skipped_due_to_fresh_call_limit", skippedDueToFreshCallLimit);
  logScanner("candidates_returned", candidates.length);

  return candidates;
}

export async function getScannerCandidates(
  baseCandidates: ScannerCandidate[],
): Promise<ScannerCandidate[]> {
  return scanMarket(baseCandidates, { source: "scheduled" });
}
