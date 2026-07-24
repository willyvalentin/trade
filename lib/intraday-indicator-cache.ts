import "server-only";

import {
  calculateIntradayIndicators,
  type IntradayIndicators,
} from "@/lib/intraday-indicators";
import { getIntradayCandles } from "@/lib/market-data";
import { normalizeUnknownError } from "@/lib/error-logging";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export type IntradayIndicatorCacheSource =
  | "cache"
  | "fresh"
  | "unavailable";

export type IntradayIndicatorCacheResult = {
  ticker: string;
  indicators: IntradayIndicators | null;
  source: IntradayIndicatorCacheSource;
  cached_at: string | null;
  stale: boolean;
  warnings: string[];
};

export type IntradayIndicatorCacheOptions = {
  maxAgeMinutes?: number;
  allowFreshFetch?: boolean;
  interval?: "5min" | "15min";
  source?:
    | "scanner"
    | "manual"
    | "position_update"
    | "scheduled"
    | "add_trade_validation";
};

type ScannerCacheRaw = {
  scanner_values?: unknown;
  intraday_indicator_cache?: {
    cached_at?: unknown;
    interval?: unknown;
    source?: unknown;
    indicators?: unknown;
  };
};

type MemoryCacheEntry = {
  cached_at: string;
  interval: "5min" | "15min";
  indicators: IntradayIndicators;
};

const DEFAULT_MAX_AGE_MINUTES = 5;
const CLOSED_MARKET_MAX_AGE_MINUTES = 15;
export const POSITION_UPDATE_INDICATOR_MAX_AGE_MINUTES = 3;
export const SCANNER_INDICATOR_MAX_AGE_MINUTES = 10;
export const MANUAL_INDICATOR_MAX_AGE_MINUTES = 5;
export const MAX_FRESH_INDICATOR_FETCHES_PER_RUN = 3;

// Netlify/serverless may discard module memory between invocations. This is a
// best-effort fallback when scanner_cache.raw cannot be used.
// TODO: Persist intraday indicator cache in Supabase for serverless reliability.
const memoryCache = new Map<string, MemoryCacheEntry>();

function serverSupabase() {
  const { client, unavailable_reason } = getServerSupabaseClient();
  if (!client) throw new Error(`server_supabase_unavailable:${unavailable_reason}`);
  return client;
}

function normalizeTicker(ticker: string) {
  return ticker.trim().toUpperCase();
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

function getAgeMinutes(cachedAt: string | null) {
  if (!cachedAt) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(cachedAt).getTime();
  return Number.isFinite(timestamp)
    ? (Date.now() - timestamp) / (60 * 1000)
    : Number.POSITIVE_INFINITY;
}

function isFresh(cachedAt: string | null, maxAgeMinutes: number) {
  const ageMinutes = getAgeMinutes(cachedAt);
  return ageMinutes >= 0 && ageMinutes <= maxAgeMinutes;
}

function getDefaultMaxAgeMinutes(options: IntradayIndicatorCacheOptions) {
  if (typeof options.maxAgeMinutes === "number") {
    return options.maxAgeMinutes;
  }

  if (options.source === "position_update") {
    return POSITION_UPDATE_INDICATOR_MAX_AGE_MINUTES;
  }

  if (options.source === "scanner" || options.source === "scheduled") {
    return SCANNER_INDICATOR_MAX_AGE_MINUTES;
  }

  if (options.source === "manual" || options.source === "add_trade_validation") {
    return MANUAL_INDICATOR_MAX_AGE_MINUTES;
  }

  return DEFAULT_MAX_AGE_MINUTES;
}

function getNewYorkTradingDayWindow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));
  const date = `${valueByType.get("year")}-${valueByType.get("month")}-${valueByType.get("day")}`;

  return {
    start: new Date(`${date}T09:30:00-04:00`),
    end: new Date(`${date}T16:00:00-04:00`),
  };
}

async function getScannerCacheRaw(ticker: string) {
  const { data, error } = await serverSupabase()
    .from("scanner_cache")
    .select("raw")
    .eq("ticker", ticker)
    .maybeSingle();

  if (error) {
    console.error("[intraday-indicator-cache] read_error", {
      ticker,
      message: error.message,
    });
    return null;
  }

  return typeof data?.raw === "object" && data.raw !== null
    ? (data.raw as ScannerCacheRaw)
    : null;
}

export async function getCachedIntradayIndicators(
  tickerInput: string,
  options: IntradayIndicatorCacheOptions = {},
): Promise<IntradayIndicatorCacheResult> {
  const ticker = normalizeTicker(tickerInput);
  const maxAgeMinutes = getDefaultMaxAgeMinutes(options);
  const interval = options.interval ?? "5min";
  const warnings: string[] = [];
  const memoryEntry = memoryCache.get(ticker);

  if (memoryEntry && memoryEntry.interval === interval) {
    return {
      ticker,
      indicators: memoryEntry.indicators,
      source: "cache",
      cached_at: memoryEntry.cached_at,
      stale: !isFresh(memoryEntry.cached_at, maxAgeMinutes),
      warnings,
    };
  }

  const raw = await getScannerCacheRaw(ticker);
  const cache = raw?.intraday_indicator_cache;
  const indicators = parseIntradayIndicators(cache?.indicators);
  const cachedAt =
    typeof cache?.cached_at === "string" ? cache.cached_at : null;
  const cachedInterval =
    cache?.interval === "5min" || cache?.interval === "15min"
      ? cache.interval
      : null;

  if (indicators && cachedInterval === interval) {
    memoryCache.set(ticker, {
      cached_at: cachedAt ?? new Date().toISOString(),
      interval,
      indicators,
    });

    return {
      ticker,
      indicators,
      source: "cache",
      cached_at: cachedAt,
      stale: !isFresh(cachedAt, maxAgeMinutes),
      warnings,
    };
  }

  return {
    ticker,
    indicators: null,
    source: "unavailable",
    cached_at: null,
    stale: true,
    warnings: ["Intraday indicator cache unavailable."],
  };
}

export async function setCachedIntradayIndicators(
  tickerInput: string,
  indicators: IntradayIndicators,
  metadata: {
    interval?: "5min" | "15min";
    source?: IntradayIndicatorCacheOptions["source"];
    cached_at?: string;
  } = {},
) {
  const ticker = normalizeTicker(tickerInput);
  const interval = metadata.interval ?? "5min";
  const cachedAt = metadata.cached_at ?? new Date().toISOString();

  memoryCache.set(ticker, {
    cached_at: cachedAt,
    interval,
    indicators,
  });

  try {
    const raw = await getScannerCacheRaw(ticker);

    if (!raw) {
      return;
    }

    const { error } = await serverSupabase()
      .from("scanner_cache")
      .update({
        raw: {
          ...raw,
          intraday_indicator_cache: {
            cached_at: cachedAt,
            interval,
            source: metadata.source ?? "manual",
            indicators,
          },
          scanner_values:
            typeof raw.scanner_values === "object" && raw.scanner_values !== null
              ? {
                  ...(raw.scanner_values as Record<string, unknown>),
                  intraday_indicators: indicators,
                }
              : raw.scanner_values,
        },
      })
      .eq("ticker", ticker);

    if (error) {
      console.error("[intraday-indicator-cache] write_error", {
        ticker,
        message: error.message,
      });
    }
  } catch (error) {
    console.error("[intraday-indicator-cache] write_exception", {
      ticker,
      error: normalizeUnknownError(error),
    });
  }
}

export async function getOrRefreshIntradayIndicators(
  tickerInput: string,
  options: IntradayIndicatorCacheOptions = {},
): Promise<IntradayIndicatorCacheResult> {
  const ticker = normalizeTicker(tickerInput);
  const interval = options.interval ?? "5min";
  const maxAgeMinutes =
    options.maxAgeMinutes ??
    (options.allowFreshFetch === false
      ? CLOSED_MARKET_MAX_AGE_MINUTES
      : getDefaultMaxAgeMinutes(options));
  const cached = await getCachedIntradayIndicators(ticker, {
    ...options,
    interval,
    maxAgeMinutes,
  });

  if (cached.indicators && !cached.stale) {
    return cached;
  }

  if (options.allowFreshFetch === false) {
    return {
      ...cached,
      warnings: [
        ...cached.warnings,
        cached.indicators
          ? "Using stale intraday indicator cache; fresh fetch disabled."
          : "Fresh intraday indicator fetch disabled.",
      ],
    };
  }

  try {
    const { start, end } = getNewYorkTradingDayWindow();
    const candles = await getIntradayCandles(ticker, interval, start, end);
    const indicators = calculateIntradayIndicators(candles);
    const cachedAt = new Date().toISOString();

    await setCachedIntradayIndicators(ticker, indicators, {
      interval,
      source: options.source,
      cached_at: cachedAt,
    });

    return {
      ticker,
      indicators,
      source: "fresh",
      cached_at: cachedAt,
      stale: false,
      warnings: indicators.warnings,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Unknown error";
    const warning = `Intraday indicator refresh failed: ${message}`;

    if (cached.indicators) {
      return {
        ...cached,
        warnings: [...cached.warnings, warning],
      };
    }

    return {
      ticker,
      indicators: null,
      source: "unavailable",
      cached_at: null,
      stale: true,
      warnings: [warning],
    };
  }
}
