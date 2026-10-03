import "server-only";

import {
  getCachedIntradayIndicators,
  getOrRefreshIntradayIndicators,
  MAX_FRESH_INDICATOR_FETCHES_PER_RUN,
  SCANNER_INDICATOR_MAX_AGE_MINUTES,
  type IntradayIndicatorCacheResult,
} from "@/lib/intraday-indicator-cache";
import {
  INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION,
  resolveIntradayIndicatorRefreshAdmission,
} from "@/lib/intraday-indicator-refresh-admission";
import {
  intradayIndicatorsFromUnknown,
  withAdmissibleRecentIntradayVolume,
  type IntradayIndicators,
} from "@/lib/intraday-indicators";
import { getDailyCandles, getDailyCandlesWithIdentity, type DailyCandle } from "@/lib/market-data";
import { captureCompletedDailyContext, readCompletedDailyContext,
  type CompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { currentSessionFeatures, type CurrentSessionContext } from "@/lib/scanner-current-session-context";
import { normalizeUnknownError } from "@/lib/error-logging";
import { throwIfAborted, waitForAbortableDelay } from "@/lib/operation-abort";
import {
  errorType,
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  summarizeScanProviderCandidateObservations,
  type ActiveScanTraceRecorder,
  type ScanProviderCandidateObservation,
  type ScanProviderCandidateObservationReason,
} from "@/lib/active-scan-trace";
import { isProviderRateLimitLikeError } from "@/lib/provider-rate-limit";
import { measureScanFetchStep } from "@/lib/scan-fetch-timing";
import { bindScannerPlanReference } from "@/lib/scanner-plan-reference-binding";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import {
  buildScannerProviderCreditAllocationExecutionPlan,
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  type ScannerProviderCreditAllocation,
} from "@/lib/scanner-provider-credit-allocation-plan";
import { buildScannerProviderCreditAllocationReconciliation } from "@/lib/scanner-provider-credit-allocation-reconciliation";
import type { ScannerProviderCreditAllocationRuntimeAdmission } from "@/lib/scanner-provider-credit-allocation-runtime-admission";
import { buildScannerProviderCreditAllocationShadow } from "@/lib/scanner-provider-credit-allocation-shadow";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import type { TwelveDataResponseIdentity } from "@/lib/twelve-data-response-identity";
import { COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION } from "@/lib/scanner-decision-input-snapshot";
import { isValidCompletedBenchmarkReuse, type CompletedBenchmarkReuse } from "@/lib/completed-benchmark-reuse";
export { COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION } from "@/lib/scanner-decision-input-snapshot";

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
  intraday_indicator_response_identity?: TwelveDataResponseIdentity | null;
  intraday_indicator_stale?: boolean;
  reference_price_used_for_plan?: number | null;
  reference_price_source?: string | null;
  reference_price_timestamp?: string | null;
  reference_price_symbol?: string | null;
  reference_price_provider?: string | null;
  reference_price_read_path?: string | null;
  daily_context_evidence?: Omit<CompletedDailyContext, "candles">;
  daily_context_latest_close?: number;
  scanner_input_policy_version?: typeof COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
  current_session_evidence?: Omit<CurrentSessionContext, "candles">;
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

function serverSupabase() {
  const { client, unavailable_reason } = getServerSupabaseClient();
  if (!client) throw new Error(`server_supabase_unavailable:${unavailable_reason}`);
  return client;
}

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
  freshProviderCallPacingMs?: number;
  providerCreditAllocationRuntimeAdmission?: ScannerProviderCreditAllocationRuntimeAdmission | null;
  activeScanTrace?: ActiveScanTraceRecorder | null;
  signal?: AbortSignal;
  // Explicit caller selection only. No environment flag or deployed caller
  // activates this challenger; legacy/frozen policies remain the default.
  completedDailyContextPolicyVersion?: typeof COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
  completedBenchmarkReuse?: CompletedBenchmarkReuse;
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

function getFreshProviderCallPacingMs(options: ScanMarketOptions) {
  if (
    options.freshProviderCallPacingMs === undefined ||
    !Number.isFinite(options.freshProviderCallPacingMs)
  ) {
    return FRESH_CALL_DELAY_MS;
  }

  return Math.max(
    0,
    Math.min(FRESH_CALL_DELAY_MS, Math.round(options.freshProviderCallPacingMs)),
  );
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
    average_range_percent: parseNumber(rawValues.average_range_percent) ?? 2,
    latest_range_percent: parseNumber(rawValues.latest_range_percent) ?? 2,
    range_expansion_ratio: parseNumber(rawValues.range_expansion_ratio) ?? 1,
    intraday_indicators: intradayIndicatorsFromUnknown(rawValues.intraday_indicators),
    // Cache persistence time is not market observation time. Legacy or
    // incomplete history remains research-only until a fresh, source-timed
    // intraday observation supplies the plan reference below.
    reference_price_timestamp: isoStringOrNull(rawValues.reference_price_timestamp),
    reference_price_provider: "scanner_cache",
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
  const { data, error } = await serverSupabase()
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
  existingRaw: unknown,
  completedContext?: CompletedDailyContext | null,
) {
  const preservedRaw =
    existingRaw !== null &&
    typeof existingRaw === "object" &&
    !Array.isArray(existingRaw)
      ? (existingRaw as Record<string, unknown>)
      : {};
  const { error } = await serverSupabase().from("scanner_cache").upsert(
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
        ...preservedRaw,
        ticker: baseCandidate.ticker,
        company_name: baseCandidate.company_name,
        sector: baseCandidate.sector,
        scanner_values: scannerValues,
        ...(completedContext ? { completed_daily_context: completedContext } : {}),
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
  throwIfAborted(options.signal);
  const marketDataStartedAt = performance.now();
  options.activeScanTrace?.markStage("market_data_fetch", "started");
  options.activeScanTrace?.updateMarketDataFetch({
    attempted_tickers: baseCandidates.length,
  });

  try {
    const candidates = await scanMarketCore(baseCandidates, options);
    options.activeScanTrace?.markStage("market_data_fetch", "completed");
    return candidates;
  } catch (error) {
    options.activeScanTrace?.markStage("market_data_fetch", "failed");
    throw error;
  } finally {
    options.activeScanTrace?.updateMarketDataFetch({
      total_elapsed_ms: Math.max(
        0,
        Math.round(performance.now() - marketDataStartedAt),
      ),
    });
  }
}

async function scanMarketCore(
  baseCandidates: ScannerCandidate[],
  options: ScanMarketOptions,
): Promise<ScannerCandidate[]> {
  const completedContextMode = options.completedDailyContextPolicyVersion === COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
  if (options.completedDailyContextPolicyVersion !== undefined && !completedContextMode) {
    throw new Error("scanner_input_policy_invalid");
  }
  if (completedContextMode && options.providerCreditAllocationRuntimeAdmission) {
    throw new Error("completed_context_cannot_override_frozen_allocation");
  }
  if (completedContextMode && options.maxFreshProviderCalls !== undefined &&
    (!Number.isSafeInteger(options.maxFreshProviderCalls) || options.maxFreshProviderCalls < 0)) {
    throw new Error("completed_context_credit_cap_invalid");
  }
  if (options.completedBenchmarkReuse && (!completedContextMode || options.source !== "scheduled" ||
    !(await isValidCompletedBenchmarkReuse(options.completedBenchmarkReuse, new Date())))) {
    throw new Error("completed_benchmark_reuse_allocation_invalid");
  }
  if (completedContextMode) {
    const session = getUsEquityMarketSession(new Date());
    if (session.verification_status !== "verified" || session.freshness_status !== "current" ||
      !session.session_open || !session.session_close ||
      Date.now() < Date.parse(session.session_open) || Date.now() >= Date.parse(session.session_close)) {
      throw new Error("completed_context_current_session_unavailable");
    }
  }
  const now = Date.now();
  const tickers = baseCandidates.map((candidate) => candidate.ticker);
  const cachedRowsByTicker = await measureScanFetchStep({
    trace: options.activeScanTrace,
    step: "cache_read",
    tickerIndex: null,
    run: () => getCachedRows(tickers),
  });
  throwIfAborted(options.signal);
  const candidates: ScannerCandidate[] = [];
  const candidateObservations = new Map<string, ScanProviderCandidateObservation>(
    baseCandidates.map((candidate, tickerIndex) => [
      candidate.ticker,
      {
        observation_version: completedContextMode ? "scan_provider_candidate_observation_v2" : SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
        ticker: candidate.ticker,
        ticker_index: tickerIndex,
        status: "pending",
        daily_data_source: "not_observed",
        intraday_data_source: "not_observed",
        provider_credits_reserved: 0,
        reason_codes: [],
      },
    ]),
  );
  const publishCandidateObservations = () => {
    const observations = Array.from(candidateObservations.values()).sort(
      (first, second) => first.ticker_index - second.ticker_index,
    );
    options.activeScanTrace?.updateMarketDataFetch({
      candidate_observations: observations,
      candidate_observation_summary:
        summarizeScanProviderCandidateObservations(observations),
    });
  };
  const updateCandidateObservation = (
    ticker: string,
    patch: Partial<ScanProviderCandidateObservation>,
    optionsPatch: {
      reservedCreditDelta?: number;
      reasonCodes?: ScanProviderCandidateObservationReason[];
    } = {},
  ) => {
    const current = candidateObservations.get(ticker);
    if (!current) return;
    candidateObservations.set(ticker, {
      ...current,
      ...patch,
      provider_credits_reserved:
        current.provider_credits_reserved +
        Math.max(0, optionsPatch.reservedCreditDelta ?? 0),
      reason_codes: Array.from(
        new Set([...current.reason_codes, ...(optionsPatch.reasonCodes ?? [])]),
      ).sort(),
    });
    publishCandidateObservations();
  };
  publishCandidateObservations();
  if (baseCandidates.length === 0) {
    options.activeScanTrace?.updateMarketDataFetch({
      provider_call_cap: 0,
    });
    return [];
  }
  const maxFreshProviderCalls = completedContextMode
    ? Math.min(options.completedBenchmarkReuse ? 8 : options.source === "scheduled" ? SCHEDULED_MAX_FRESH_PROVIDER_CALLS : MANUAL_MAX_FRESH_PROVIDER_CALLS, getMaxFreshProviderCalls(options))
    : getMaxFreshProviderCalls(options);
  const freshProviderCallPacingMs = getFreshProviderCallPacingMs(options);
  options.activeScanTrace?.updateMarketDataFetch({
    provider_call_cap: maxFreshProviderCalls,
    ...(completedContextMode ? { data_input_policy_version: COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION } : {}),
  });
  const cacheHits: string[] = [];
  const cacheMisses: string[] = [];
  const staleFallbacks: string[] = [];
  const skippedDueToFreshCallLimit: string[] = [];
  const indicatorSources: Record<string, string> = {};
  let freshProviderCallsUsed = 0;
  let freshIndicatorFetchesUsed = 0;
  const intradayCacheSnapshotByTicker = new Map<
    string,
    IntradayIndicatorCacheResult
  >();

  for (const [tickerIndex, baseCandidate] of baseCandidates.entries()) {
    const cachedRow = cachedRowsByTicker.get(baseCandidate.ticker);
    const cacheSnapshot = await measureScanFetchStep({
      trace: options.activeScanTrace,
      step: "intraday_indicators",
      tickerIndex,
      run: () =>
        getCachedIntradayIndicators(baseCandidate.ticker, {
          source: options.source === "scheduled" ? "scheduled" : "manual",
          maxAgeMinutes: SCANNER_INDICATOR_MAX_AGE_MINUTES,
          signal: options.signal,
          preloadedScannerCacheRaw: cachedRow?.raw ?? null,
          requireResponseIdentity: completedContextMode,
        }),
    });
    intradayCacheSnapshotByTicker.set(baseCandidate.ticker, cacheSnapshot);
  }
  throwIfAborted(options.signal);

  const runtimeAdmission = options.providerCreditAllocationRuntimeAdmission;
  const runtimePlanEnforced =
    runtimeAdmission?.status === "admitted" &&
    runtimeAdmission.authority.can_select_allocation_policy;
  const providerCreditAllocationPlan = runtimePlanEnforced
    ? buildScannerProviderCreditAllocationExecutionPlan({
      policyVersion:
        runtimeAdmission?.selected_policy_version ??
        SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
      providerCreditCap: maxFreshProviderCalls,
      intradayProviderCreditCap: MAX_FRESH_INDICATOR_FETCHES_PER_RUN,
      candidateDemands: baseCandidates.map((candidate, tickerIndex) => {
        const cachedRow = cachedRowsByTicker.get(candidate.ticker);
        const cachedValues = cachedRow ? scannerValuesFromCache(cachedRow) : null;
        const intradayCache = intradayCacheSnapshotByTicker.get(candidate.ticker);
        return {
          ticker: candidate.ticker,
          ticker_index: tickerIndex,
          daily_refresh_required: !(
            cachedRow &&
            cachedValues &&
            isCacheFresh(cachedRow, now)
          ),
          intraday_refresh_required: !(
            intradayCache?.source === "cache" && !intradayCache.stale
          ),
        };
      }),
    })
    : null;
  if (
    runtimePlanEnforced &&
    providerCreditAllocationPlan?.status !== "planned"
  ) {
    throw new Error("scanner_provider_credit_allocation_plan_invalid");
  }
  const plannedAllocationKeys = new Set(
    (providerCreditAllocationPlan?.allocations ?? []).map(
      (allocation) =>
        `${allocation.ticker_index}:${allocation.ticker}:${allocation.data_class}`,
    ),
  );
  const actualAllocations: ScannerProviderCreditAllocation[] = [];
  const isPlannedAllocation = (
    ticker: string,
    tickerIndex: number,
    dataClass: "daily" | "intraday",
  ) => plannedAllocationKeys.has(`${tickerIndex}:${ticker}:${dataClass}`);
  if (providerCreditAllocationPlan) {
    options.activeScanTrace?.updateMarketDataFetch({
      provider_credit_allocation_execution_plan: providerCreditAllocationPlan,
    });
  }

  async function attachIntradayIndicators(
    candidate: ScannerCandidate,
    tickerIndex: number,
    preloadedScannerCacheRow?: ScannerCacheRow,
  ): Promise<CandidateWithIndicatorCache> {
    throwIfAborted(options.signal);
    const cacheOptions = {
      source: options.source === "scheduled" ? "scheduled" : "manual",
      maxAgeMinutes: SCANNER_INDICATOR_MAX_AGE_MINUTES,
      signal: options.signal,
      requireResponseIdentity: completedContextMode,
      ...(preloadedScannerCacheRow
        ? { preloadedScannerCacheRaw: preloadedScannerCacheRow.raw }
        : {}),
    } as const;
    const cached = intradayCacheSnapshotByTicker.get(candidate.ticker) ?? {
      ticker: candidate.ticker,
      indicators: null,
      source: "unavailable" as const,
      cached_at: null,
      response_identity: null,
      stale: true,
      warnings: ["Intraday indicator cache snapshot unavailable."],
    };
    throwIfAborted(options.signal);
    const legacyAdmission = resolveIntradayIndicatorRefreshAdmission({
      cache: {
        source: cached.source,
        has_indicators: cached.indicators !== null,
        stale: cached.stale,
      },
      fresh_provider_calls_used: freshProviderCallsUsed,
      max_fresh_provider_calls: maxFreshProviderCalls,
      fresh_indicator_fetches_used: freshIndicatorFetchesUsed,
      max_fresh_indicator_fetches: completedContextMode ? maxFreshProviderCalls : MAX_FRESH_INDICATOR_FETCHES_PER_RUN,
    });
    const refreshPlanned = runtimePlanEnforced
      ? isPlannedAllocation(candidate.ticker, tickerIndex, "intraday")
      : legacyAdmission.reserve_provider_credit;
    let result = cached;

    if (refreshPlanned) {
      // A refresh-capable call may reach Twelve Data. Reserve the bounded slot
      // immediately before it, including when that refresh later fails.
      freshProviderCallsUsed += 1;
      actualAllocations.push({
        ticker: candidate.ticker,
        ticker_index: tickerIndex,
        data_class: "intraday",
      });
      options.activeScanTrace?.incrementMarketDataFetch({
        provider_calls_reserved_count: 1,
        intraday_indicator_provider_calls_reserved_count: 1,
      });
      updateCandidateObservation(candidate.ticker, {}, {
        reservedCreditDelta: 1,
      });
      result = await measureScanFetchStep({
        trace: options.activeScanTrace,
        step: "intraday_indicators",
        tickerIndex,
        run: () => getOrRefreshIntradayIndicators(candidate.ticker, {
          ...cacheOptions,
          allowFreshFetch: true,
        }),
      });
      throwIfAborted(options.signal);
    } else if (cached.source === "cache" && !cached.stale) {
      options.activeScanTrace?.incrementMarketDataFetch({
        intraday_indicator_fresh_cache_reuse_count: 1,
      });
    } else {
      result = {
        ...cached,
        warnings: [
          ...cached.warnings,
          cached.indicators
            ? "Using stale intraday indicator cache; fresh fetch disabled."
            : "Fresh intraday indicator fetch disabled.",
        ],
      };
    }

    if (result.source === "fresh") {
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
    const intradayIndicators = result.indicators
      ? withAdmissibleRecentIntradayVolume(result.indicators, result.stale)
      : null;
    const planReference = bindScannerPlanReference({
      fallback: {
        reference_price_used_for_plan:
          candidate.reference_price_used_for_plan ?? null,
        reference_price_source: candidate.reference_price_source ?? null,
        reference_price_timestamp: candidate.reference_price_timestamp ?? null,
        reference_price_provider: candidate.reference_price_provider ?? null,
        reference_price_read_path: candidate.reference_price_read_path ?? null,
      },
      intraday: {
        source: result.source,
        stale: result.stale,
        latest_price: intradayIndicators?.latestPrice ?? null,
        latest_candle_timestamp:
          intradayIndicators?.latestCandleTimestamp ?? null,
      },
    });
    const recentVolumeRatio = intradayIndicators?.recentVolumeRatio ?? null;
    const freshCurrentPrice = !result.stale && intradayIndicators?.latestPrice &&
      planReference.reference_price_timestamp === intradayIndicators.latestCandleTimestamp
      ? intradayIndicators.latestPrice : undefined;
    const currentEntryHigh = freshCurrentPrice ? round(freshCurrentPrice * 1.01) : undefined;
    const currentStop = freshCurrentPrice && candidate.ma20 !== undefined
      ? round(Math.min(candidate.ma20, freshCurrentPrice * 0.96)) : undefined;
    const currentRisk = currentEntryHigh !== undefined && currentStop !== undefined && freshCurrentPrice
      ? Math.max(currentEntryHigh - currentStop, freshCurrentPrice * 0.01) : undefined;
    const sessionContext = completedContextMode && freshCurrentPrice ? result.session_context : null;
    const sessionFeatures = sessionContext ? currentSessionFeatures(sessionContext) : null;
    const sessionEvidence = sessionContext ? (() => {
      const { candles, ...evidence } = sessionContext;
      void candles;
      return evidence;
    })() : undefined;
    const intradayDataSource =
      result.source === "fresh"
        ? "provider"
        : result.source === "cache"
          ? result.stale
            ? "stale_cache"
            : "fresh_cache"
          : "unavailable";
    const intradayReasonCodes: ScanProviderCandidateObservationReason[] = [
      ...(result.source === "unavailable"
        ? (["intraday_provider_unavailable"] as const)
        : []),
      ...(result.stale ? (["intraday_stale_cache"] as const) : []),
      ...(!refreshPlanned && result.stale
        ? (["intraday_refresh_credit_cap_reached"] as const)
        : []),
    ];
    updateCandidateObservation(
      candidate.ticker,
      { intraday_data_source: intradayDataSource },
      { reasonCodes: intradayReasonCodes },
    );

    return {
      candidate: {
        ...candidate,
        intraday_indicators: completedContextMode && !freshCurrentPrice ? null : intradayIndicators,
        intraday_indicator_source: result.source,
        intraday_indicator_cached_at: result.cached_at,
        intraday_indicator_response_identity: result.response_identity,
        intraday_indicator_stale: result.stale,
        ...planReference,
        // Legacy scanner-cache `recent_volume_ratio` came from daily bars.
        // Only same-session intraday bars from a fresh indicator receipt may
        // populate this ranking/decision feature.
        recent_volume_ratio: completedContextMode && !freshCurrentPrice ? undefined : recentVolumeRatio ?? undefined,
        ...(completedContextMode ? {
          // Current-session fields come only from validated closed intraday bars.
          // Daily history remains separately attributable, never today's OHLC.
          latest_close: freshCurrentPrice,
          ...(freshCurrentPrice ? { mock_current_price: freshCurrentPrice } : {}),
          session_open: sessionFeatures?.session_open,
          session_high: sessionFeatures?.session_high, session_low: sessionFeatures?.session_low,
          previous_close: candidate.daily_context_latest_close,
          recent_change_percent: !result.stale ? intradayIndicators?.momentumPercent ?? undefined : undefined,
          recent_range_position: sessionFeatures?.recent_range_position,
          recent_higher_highs_count: sessionFeatures?.recent_higher_highs_count,
          recent_higher_lows_count: sessionFeatures?.recent_higher_lows_count,
          recent_bullish_candles: sessionFeatures?.recent_bullish_candles,
          latest_range_percent: sessionFeatures?.latest_range_percent,
          range_expansion_ratio: sessionFeatures?.range_expansion_ratio,
          current_session_evidence: sessionEvidence,
          distance_to_20d_high: freshCurrentPrice && candidate.high_20d
            ? round((candidate.high_20d - freshCurrentPrice) / candidate.high_20d * 100) : undefined,
          volume_ratio: undefined,
          proposed_entry_low: freshCurrentPrice ? round(freshCurrentPrice * 0.99) : undefined,
          proposed_entry_high: currentEntryHigh, proposed_stop_loss: currentStop,
          proposed_target_1: currentRisk !== undefined && currentEntryHigh !== undefined ? round(currentEntryHigh + currentRisk * 1.5) : undefined,
          proposed_target_2: currentRisk !== undefined && currentEntryHigh !== undefined ? round(currentEntryHigh + currentRisk * 2.25) : undefined,
          proposed_risk_reward: currentRisk !== undefined ? 2.25 : undefined,
        } : {}),
      },
      indicatorSource: result.source,
    };
  }

  for (const [tickerIndex, baseCandidate] of baseCandidates.entries()) {
    throwIfAborted(options.signal);
    const cachedRow = cachedRowsByTicker.get(baseCandidate.ticker);
    const cachedValues = !completedContextMode && cachedRow ? scannerValuesFromCache(cachedRow) : null;
    const contextRaw = cachedRow?.raw && typeof cachedRow.raw === "object"
      ? (cachedRow.raw as Record<string, unknown>).completed_daily_context : null;
    const completedContext = completedContextMode
      ? await readCompletedDailyContext(contextRaw, baseCandidate.ticker, new Date(now)) : null;
    const buildHistoricalCandidate = (history: CompletedDailyContext) => {
      const { candles, ...evidence } = history;
      return { ...buildCandidate(baseCandidate, calculateScannerValues(candles)),
        daily_context_evidence: evidence, daily_context_latest_close: candles.at(-1)!.close,
        scanner_input_policy_version: COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION };
    };
    if (completedContext) {
      updateCandidateObservation(baseCandidate.ticker, { daily_data_source: "completed_context" });
      const { candidate } = await attachIntradayIndicators(buildHistoricalCandidate(completedContext), tickerIndex, cachedRow);
      candidates.push(candidate);
      updateCandidateObservation(baseCandidate.ticker, { status: "rankable" });
      continue;
    }

    if (cachedRow && cachedValues && isCacheFresh(cachedRow, now)) {
      cacheHits.push(baseCandidate.ticker);
      updateCandidateObservation(baseCandidate.ticker, {
        daily_data_source: "fresh_cache",
      });
      options.activeScanTrace?.incrementMarketDataFetch({
        candle_success_count: 1,
      });
      const { candidate } = await attachIntradayIndicators(
        buildCandidate(baseCandidate, cachedValues),
        tickerIndex,
        cachedRow,
      );
      candidates.push(candidate);
      updateCandidateObservation(baseCandidate.ticker, { status: "rankable" });
      continue;
    }

    cacheMisses.push(baseCandidate.ticker);

    const dailyRefreshPlanned = runtimePlanEnforced
      ? isPlannedAllocation(baseCandidate.ticker, tickerIndex, "daily")
      : freshProviderCallsUsed < maxFreshProviderCalls;
    if (!dailyRefreshPlanned) {
      if (cachedValues) {
        staleFallbacks.push(baseCandidate.ticker);
        updateCandidateObservation(
          baseCandidate.ticker,
          { daily_data_source: "stale_cache" },
          { reasonCodes: ["daily_stale_cache_fallback"] },
        );
        options.activeScanTrace?.incrementMarketDataFetch({
          candle_success_count: 1,
          stale_count: 1,
        });
        const { candidate } = await attachIntradayIndicators(
          buildCandidate(baseCandidate, cachedValues),
          tickerIndex,
          cachedRow,
        );
        candidates.push(candidate);
        updateCandidateObservation(baseCandidate.ticker, { status: "rankable" });
      } else {
        skippedDueToFreshCallLimit.push(baseCandidate.ticker);
        updateCandidateObservation(
          baseCandidate.ticker,
          {
            status: "not_rankable",
            daily_data_source: "unavailable",
          },
          { reasonCodes: ["daily_refresh_credit_cap_reached"] },
        );
      }

      continue;
    }

    if (freshProviderCallsUsed > 0 && freshProviderCallPacingMs > 0) {
      await measureScanFetchStep({
        trace: options.activeScanTrace,
        step: "pacing_delay",
        tickerIndex,
        run: () =>
          waitForAbortableDelay(freshProviderCallPacingMs, options.signal),
      });
    }

    freshProviderCallsUsed += 1;
    actualAllocations.push({
      ticker: baseCandidate.ticker,
      ticker_index: tickerIndex,
      data_class: "daily",
    });
    options.activeScanTrace?.incrementMarketDataFetch({
      provider_calls_reserved_count: 1,
      daily_candle_provider_calls_reserved_count: 1,
    });
    updateCandidateObservation(baseCandidate.ticker, {}, {
      reservedCreditDelta: 1,
    });

    try {
      let acquiredContext: CompletedDailyContext | null = null;
      const candles = await measureScanFetchStep({
        trace: options.activeScanTrace,
        step: "daily_candles",
        tickerIndex,
        run: async () => {
          if (completedContextMode) {
            const response = await getDailyCandlesWithIdentity(baseCandidate.ticker, CANDLE_DAYS_NEEDED, { signal: options.signal });
            acquiredContext = await captureCompletedDailyContext(response, baseCandidate.ticker, new Date());
            if (!acquiredContext) throw new Error("completed_daily_history_unavailable");
            return acquiredContext.candles;
          }
          return getDailyCandles(
            baseCandidate.ticker,
            CANDLE_DAYS_NEEDED,
            { signal: options.signal },
          );
        },
      });
      throwIfAborted(options.signal);
      options.activeScanTrace?.incrementMarketDataFetch({
        candle_success_count: candles.length > 0 ? 1 : 0,
        empty_response_count: candles.length > 0 ? 0 : 1,
      });
      if (candles.length === 0) {
        updateCandidateObservation(
          baseCandidate.ticker,
          { daily_data_source: "unavailable" },
          { reasonCodes: ["daily_provider_empty"] },
        );
      } else {
        updateCandidateObservation(baseCandidate.ticker, {
          daily_data_source: "provider",
        });
        if (candles.length < 50) {
          updateCandidateObservation(baseCandidate.ticker, {}, {
            reasonCodes: ["daily_provider_insufficient_history"],
          });
        }
      }
      const scannerValues = calculateScannerValues(candles);
      await measureScanFetchStep({
        trace: options.activeScanTrace,
        step: "cache_write",
        tickerIndex,
        run: () =>
          upsertCachedValues(
            baseCandidate,
            scannerValues,
            cachedRow?.raw ?? null,
            acquiredContext,
          ),
      });
      throwIfAborted(options.signal);
      const { candidate } = await attachIntradayIndicators(
        acquiredContext ? buildHistoricalCandidate(acquiredContext) : buildCandidate(baseCandidate, scannerValues),
        tickerIndex,
      );
      candidates.push(candidate);
      updateCandidateObservation(baseCandidate.ticker, { status: "rankable" });
    } catch (error) {
      throwIfAborted(options.signal);
      console.error("[scanner] provider_call_error", {
        ticker: baseCandidate.ticker,
        error: normalizeUnknownError(error),
      });
      options.activeScanTrace?.incrementMarketDataFetch({
        candle_error_count: 1,
        latest_provider_error_type: errorType(error),
      });
      const priorObservation = candidateObservations.get(baseCandidate.ticker);
      updateCandidateObservation(
        baseCandidate.ticker,
        {
          status: cachedValues ? "pending" : "not_rankable",
          daily_data_source: cachedValues ? "stale_cache" : "unavailable",
        },
        {
          reasonCodes: [
            ...(priorObservation?.reason_codes.some((reason) =>
              [
                "daily_provider_empty",
                "daily_provider_insufficient_history",
              ].includes(reason),
            )
              ? []
              : (["daily_provider_error"] as const)),
          ],
        },
      );

      // Retrying cannot replenish a provider quota during this scan. Surface a
      // precise, fail-closed outcome to the scheduler instead of timing out
      // after the remaining candidates fall back to stale data.
      if (isProviderRateLimitLikeError(error)) {
        throw error;
      }

      if (cachedValues) {
        staleFallbacks.push(baseCandidate.ticker);
        updateCandidateObservation(
          baseCandidate.ticker,
          { daily_data_source: "stale_cache" },
          { reasonCodes: ["daily_stale_cache_fallback"] },
        );
        options.activeScanTrace?.incrementMarketDataFetch({
          candle_success_count: 1,
          stale_count: 1,
        });
        const { candidate } = await attachIntradayIndicators(
          buildCandidate(baseCandidate, cachedValues),
          tickerIndex,
          cachedRow,
        );
        candidates.push(candidate);
        updateCandidateObservation(baseCandidate.ticker, { status: "rankable" });
      }
    }
  }

  logScanner("source", options.source);
  const providerCreditAllocationShadow =
    completedContextMode ? null : buildScannerProviderCreditAllocationShadow({
      candidateObservations: Array.from(candidateObservations.values()),
      providerCreditCap: maxFreshProviderCalls,
      terminal: true,
    });
  const providerCreditAllocationReconciliation = providerCreditAllocationPlan
    ? buildScannerProviderCreditAllocationReconciliation({
        plan: providerCreditAllocationPlan,
        actualAllocations,
        admissionFingerprint: runtimeAdmission?.admission_fingerprint ?? null,
      })
    : null;
  options.activeScanTrace?.updateMarketDataFetch({
    provider_credit_allocation_shadow: providerCreditAllocationShadow,
    provider_credit_allocation_reconciliation:
      providerCreditAllocationReconciliation,
  });
  logScanner("max_fresh_provider_calls", maxFreshProviderCalls);
  logScanner("fresh_provider_call_pacing_ms", freshProviderCallPacingMs);
  logScanner("cache_hits_count", cacheHits.length);
  logScanner("cache_hits", cacheHits);
  logScanner("cache_misses", cacheMisses);
  logScanner("fresh_provider_calls_used", freshProviderCallsUsed);
  logScanner("fresh_indicator_fetches_used", freshIndicatorFetchesUsed);
  logScanner(
    "intraday_indicator_refresh_allocation_policy_version",
    completedContextMode ? COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION : INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION,
  );
  logScanner(
    "provider_credit_allocation_shadow",
    providerCreditAllocationShadow,
  );
  logScanner(
    "provider_credit_allocation_execution_plan",
    providerCreditAllocationPlan,
  );
  logScanner(
    "provider_credit_allocation_reconciliation",
    providerCreditAllocationReconciliation,
  );
  logScanner("indicator_sources", indicatorSources);
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
