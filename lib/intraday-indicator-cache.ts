import "server-only";

import {
  calculateIntradayIndicators,
  intradayIndicatorsFromUnknown,
  withAdmissibleRecentIntradayVolume,
  type IntradayIndicators,
} from "@/lib/intraday-indicators";
import { getIntradayCandlesWithDiagnostics } from "@/lib/market-data";
import { getNewYorkRegularSessionWindow } from "@/lib/intraday-scan-window";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import { captureCurrentSessionContext, readCurrentSessionContext,
  type CurrentSessionContext } from "@/lib/scanner-current-session-context";
import { normalizeUnknownError } from "@/lib/error-logging";
import { isFreshLiveReferenceMarketTime } from "@/lib/live-reference-freshness-policy";
import { throwIfAborted } from "@/lib/operation-abort";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import {
  twelveDataResponseIdentityFromUnknown,
  type TwelveDataResponseIdentity,
} from "@/lib/twelve-data-response-identity";

export type IntradayIndicatorCacheSource =
  | "cache"
  | "fresh"
  | "unavailable";

export type IntradayIndicatorCacheResult = {
  ticker: string;
  indicators: IntradayIndicators | null;
  source: IntradayIndicatorCacheSource;
  cached_at: string | null;
  response_identity: TwelveDataResponseIdentity | null;
  stale: boolean;
  warnings: string[];
  session_context?: CurrentSessionContext | null;
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
  signal?: AbortSignal;
  requireResponseIdentity?: boolean;
  // Scanner already loaded this row in its batched cache read. A present
  // property (including null) avoids a redundant per-ticker database read.
  preloadedScannerCacheRaw?: unknown;
};

type ScannerCacheRaw = {
  scanner_values?: unknown;
  intraday_indicator_cache?: {
    cached_at?: unknown;
    interval?: unknown;
    source?: unknown;
    indicators?: unknown;
    response_identity?: unknown;
    response_symbol?: unknown;
    session_context?: unknown;
  };
};

type MemoryCacheEntry = {
  cached_at: string;
  interval: "5min" | "15min";
  indicators: IntradayIndicators;
  response_identity: TwelveDataResponseIdentity | null;
  response_symbol?: string;
  session_context?: CurrentSessionContext | null;
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
    const context = options.requireResponseIdentity
      ? await readCurrentSessionContext(memoryEntry.session_context, ticker, new Date()) : null;
    const indicators = context ? calculateIntradayIndicators(context.candles, {
      interval, observedAtSeconds: Date.now() / 1000,
    }) : memoryEntry.indicators;
    const stale =
      !isFresh(memoryEntry.cached_at, maxAgeMinutes) ||
      !isFreshLiveReferenceMarketTime(
        indicators.latestCandleTimestamp,
      ) || (options.requireResponseIdentity === true &&
        (!context || context.interval !== interval || memoryEntry.response_symbol !== ticker || !memoryEntry.response_identity ||
          memoryEntry.response_identity.payload_byte_length === 0 ||
          context.response_identity.payload_sha256 !== memoryEntry.response_identity.payload_sha256 ||
          context.response_identity.payload_byte_length !== memoryEntry.response_identity.payload_byte_length));
    return {
      ticker,
      indicators: withAdmissibleRecentIntradayVolume(
        indicators,
        stale,
      ),
      source: "cache",
      cached_at: memoryEntry.cached_at,
      response_identity: memoryEntry.response_identity,
      stale,
      warnings,
      ...(options.requireResponseIdentity ? { session_context: stale ? null : context } : {}),
    };
  }

  const raw = Object.prototype.hasOwnProperty.call(
    options,
    "preloadedScannerCacheRaw",
  )
    ? (options.preloadedScannerCacheRaw as ScannerCacheRaw | null)
    : await getScannerCacheRaw(ticker);
  const cache = raw?.intraday_indicator_cache;
  const context = options.requireResponseIdentity
    ? await readCurrentSessionContext(cache?.session_context, ticker, new Date()) : null;
  const indicators = context ? calculateIntradayIndicators(context.candles, {
    interval, observedAtSeconds: Date.now() / 1000,
  }) : intradayIndicatorsFromUnknown(cache?.indicators);
  const cachedAt =
    typeof cache?.cached_at === "string" ? cache.cached_at : null;
  const cachedInterval =
    cache?.interval === "5min" || cache?.interval === "15min"
      ? cache.interval
      : null;
  const responseIdentity = twelveDataResponseIdentityFromUnknown(
    cache?.response_identity,
  );

  if (indicators && cachedInterval === interval) {
    // Missing persisted capture time must not become fresh on the next
    // in-memory read merely because this read happened now.
    if (cachedAt) {
      memoryCache.set(ticker, {
        cached_at: cachedAt,
        interval,
        indicators,
        response_identity: responseIdentity,
        ...(cache?.response_symbol === ticker ? { response_symbol: ticker } : {}),
        ...(options.requireResponseIdentity ? { session_context: context } : {}),
      });
    }

    const stale =
      !isFresh(cachedAt, maxAgeMinutes) ||
      !isFreshLiveReferenceMarketTime(indicators.latestCandleTimestamp) ||
      (options.requireResponseIdentity === true &&
        (!context || context.interval !== interval || cache?.response_symbol !== ticker ||
          !responseIdentity || responseIdentity.payload_byte_length === 0 ||
          context.response_identity.payload_sha256 !== responseIdentity.payload_sha256 ||
          context.response_identity.payload_byte_length !== responseIdentity.payload_byte_length));
    return {
      ticker,
      indicators: withAdmissibleRecentIntradayVolume(indicators, stale),
      source: "cache",
      cached_at: cachedAt,
      response_identity: responseIdentity,
      stale,
      warnings,
      ...(options.requireResponseIdentity ? { session_context: stale ? null : context } : {}),
    };
  }

  return {
    ticker,
    indicators: null,
    source: "unavailable",
    cached_at: null,
    response_identity: null,
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
    response_identity?: TwelveDataResponseIdentity | null;
    response_symbol?: string;
    session_context?: CurrentSessionContext | null;
  } = {},
) {
  const ticker = normalizeTicker(tickerInput);
  const interval = metadata.interval ?? "5min";
  const cachedAt = metadata.cached_at ?? new Date().toISOString();
  const responseIdentity = metadata.response_identity ?? null;

  memoryCache.set(ticker, {
    cached_at: cachedAt,
    interval,
    indicators,
    response_identity: responseIdentity,
    ...(metadata.response_symbol === ticker ? { response_symbol: ticker } : {}),
    ...(metadata.session_context ? { session_context: metadata.session_context } : {}),
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
            response_identity: responseIdentity,
            ...(metadata.response_symbol === ticker ? { response_symbol: ticker } : {}),
            ...(metadata.session_context ? { session_context: metadata.session_context } : {}),
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
  throwIfAborted(options.signal);
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
  throwIfAborted(options.signal);

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
    let { start, end } = getNewYorkRegularSessionWindow(new Date());
    if (options.requireResponseIdentity) {
      const session = getUsEquityMarketSession(new Date());
      if (session.verification_status !== "verified" || session.freshness_status !== "current" ||
        !session.session_open || !session.session_close || Date.now() < Date.parse(session.session_open) ||
        Date.now() >= Date.parse(session.session_close)) throw new Error("Current regular session unavailable.");
      start = new Date(session.session_open);
      end = new Date(Math.min(Date.now(), Date.parse(session.session_close)));
    }
    const response = await getIntradayCandlesWithDiagnostics(
      ticker,
      interval,
      start,
      end,
      {
        signal: options.signal,
        requireResponseIdentity: options.requireResponseIdentity,
      },
    );
    throwIfAborted(options.signal);
    const context = options.requireResponseIdentity ? await captureCurrentSessionContext({
      symbol: ticker, interval, exchange_timezone: "America/New_York", captured_at: new Date().toISOString(),
      response_identity: response.diagnostics.response_identity, candles: response.candles,
    }, ticker, new Date()) : null;
    if (options.requireResponseIdentity && !context) throw new Error("Closed current-session context unavailable.");
    const indicators = calculateIntradayIndicators(context?.candles ?? response.candles, {
      interval,
      observedAtSeconds: Date.now() / 1000,
    });
    if (
      !isFreshLiveReferenceMarketTime(indicators.latestCandleTimestamp)
    ) {
      throw new Error("Provider intraday candle market time is missing or stale.");
    }
    const cachedAt = new Date().toISOString();

    await setCachedIntradayIndicators(ticker, indicators, {
      interval,
      source: options.source,
      cached_at: cachedAt,
      response_identity: response.diagnostics.response_identity,
      ...(response.diagnostics.response_metadata_verified ? { response_symbol: ticker } : {}),
      ...(context ? { session_context: context } : {}),
    });
    throwIfAborted(options.signal);

    return {
      ticker,
      indicators,
      source: "fresh",
      cached_at: cachedAt,
      response_identity: response.diagnostics.response_identity,
      stale: false,
      warnings: indicators.warnings,
      ...(options.requireResponseIdentity ? { session_context: context } : {}),
    };
  } catch (error) {
    throwIfAborted(options.signal);
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
      response_identity: null,
      stale: true,
      warnings: [warning],
    };
  }
}
