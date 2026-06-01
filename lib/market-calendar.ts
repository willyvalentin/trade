import "server-only";

import { supabase } from "@/lib/supabase";
import { normalizeUnknownError } from "@/lib/error-logging";

const POLYGON_BASE_URL = "https://api.polygon.io";
const NEW_YORK_TIME_ZONE = "America/New_York";
const CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const UNKNOWN_FALLBACK_CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const POLYGON_PROVIDER = "polygon";
const LOCAL_PROVIDER = "local_fallback";

export type MarketDayType =
  | "trading_day"
  | "weekend"
  | "holiday"
  | "early_close"
  | "unknown";

export type MarketStatus = {
  isOpenDay: boolean;
  reason: string;
  date: string;
  dayType: MarketDayType;
  marketOpenTime: "09:30" | string | null;
  marketCloseTime: "16:00" | "13:00" | string | null;
  provider: string;
  fromCache: boolean;
};

type MarketCalendarCacheRow = {
  updated_at: string | null;
  cache_date: string | null;
  provider: string | null;
  is_open_day: boolean | null;
  reason: string | null;
  day_type: string | null;
  market_open_time: string | null;
  market_close_time: string | null;
  raw: unknown;
};

type PolygonMarketStatusResponse = {
  market?: unknown;
  serverTime?: unknown;
  earlyHours?: unknown;
  afterHours?: unknown;
  exchanges?: {
    nyse?: unknown;
    nasdaq?: unknown;
    otc?: unknown;
  };
  status?: unknown;
  request_id?: unknown;
  error?: unknown;
  message?: unknown;
};

type PolygonHoliday = {
  exchange?: unknown;
  name?: unknown;
  status?: unknown;
  date?: unknown;
  open?: unknown;
  close?: unknown;
};

type PolygonFetchResult<T> = {
  data: T;
  httpStatus: number;
  sanitizedUrl: string;
  providerStatus: unknown;
  providerCode: unknown;
  providerMessage: unknown;
};

type ProviderLogDetails = {
  provider: string;
  endpointUrl?: string;
  httpStatus?: number;
  providerStatus?: unknown;
  providerCode?: unknown;
  providerMessage?: unknown;
  reason?: string;
  fallbackUsed?: boolean;
};

class MarketCalendarProviderError extends Error {
  details: ProviderLogDetails;

  constructor(message: string, details: ProviderLogDetails) {
    super(message);
    this.name = "MarketCalendarProviderError";
    this.details = details;
  }
}

function logValue(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function logProviderEvent(label: string, details: ProviderLogDetails) {
  console.log(`[market-calendar] ${label} ${logValue(details)}`);
}

function getNewYorkDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: NEW_YORK_TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);

  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return {
    weekday: valueByType.get("weekday") ?? "",
    year: valueByType.get("year") ?? "",
    month: valueByType.get("month") ?? "",
    day: valueByType.get("day") ?? "",
    hour: Number(valueByType.get("hour") ?? "0"),
    minute: Number(valueByType.get("minute") ?? "0"),
  };
}

function getNewYorkDateString(date: Date) {
  const parts = getNewYorkDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isTodayInNewYork(date: Date) {
  return getNewYorkDateString(date) === getNewYorkDateString(new Date());
}

function isWeekendInNewYork(date: Date) {
  const weekday = getNewYorkDateParts(date).weekday;
  return weekday === "Sat" || weekday === "Sun";
}

function cacheRowToStatus(row: MarketCalendarCacheRow): MarketStatus | null {
  if (!row.cache_date || typeof row.is_open_day !== "boolean") {
    return null;
  }

  const dayType =
    row.day_type === "trading_day" ||
    row.day_type === "weekend" ||
    row.day_type === "holiday" ||
    row.day_type === "early_close" ||
    row.day_type === "unknown"
      ? row.day_type
      : "unknown";

  return {
    isOpenDay: row.is_open_day,
    reason: row.reason ?? "Market calendar cache entry did not include a reason.",
    date: row.cache_date,
    dayType,
    marketOpenTime: row.market_open_time,
    marketCloseTime: row.market_close_time,
    provider: row.provider ?? "unknown",
    fromCache: true,
  };
}

async function getFreshCachedStatus(cacheDate: string) {
  const { data, error } = await supabase
    .from("market_calendar_cache")
    .select(
      "updated_at,cache_date,provider,is_open_day,reason,day_type,market_open_time,market_close_time,raw",
    )
    .eq("cache_date", cacheDate)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[market-calendar] cache_read_error", {
      source: "supabase.market_calendar_cache",
      operation: "select_fresh_status",
      cacheDate,
      error: normalizeUnknownError(error),
    });
    return null;
  }

  const rows = (data ?? []) as MarketCalendarCacheRow[];

  for (const row of rows) {
    if (row.provider !== POLYGON_PROVIDER && row.provider !== LOCAL_PROVIDER) {
      continue;
    }

    if (!row.updated_at) {
      continue;
    }

    const updatedAt = new Date(row.updated_at).getTime();
    const maxAgeMs =
      row.provider === LOCAL_PROVIDER && row.day_type === "unknown"
        ? UNKNOWN_FALLBACK_CACHE_MAX_AGE_MS
        : CACHE_MAX_AGE_MS;

    if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > maxAgeMs) {
      console.log(
        `[market-calendar] cache_stale ${logValue({
          date: cacheDate,
          provider: row.provider ?? "unknown",
          dayType: row.day_type ?? "unknown",
          maxAgeMinutes: Math.round(maxAgeMs / 60_000),
        })}`,
      );
      continue;
    }

    return cacheRowToStatus(row);
  }

  return null;
}

function getPolygonApiKey() {
  return process.env.POLYGON_API_KEY?.trim() ?? "";
}

function sanitizeUrl(url: URL) {
  const sanitizedUrl = new URL(url.toString());
  sanitizedUrl.searchParams.delete("apiKey");
  sanitizedUrl.searchParams.delete("apikey");
  return sanitizedUrl.toString();
}

function getPolygonProviderMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const response = data as PolygonMarketStatusResponse;
  return response.error ?? response.message;
}

async function fetchPolygon<T>(path: string): Promise<PolygonFetchResult<T>> {
  const apiKey = getPolygonApiKey();

  if (!apiKey) {
    throw new MarketCalendarProviderError("POLYGON_API_KEY is missing.", {
      provider: POLYGON_PROVIDER,
      reason: "POLYGON_API_KEY is missing.",
      fallbackUsed: true,
    });
  }

  const url = new URL(`${POLYGON_BASE_URL}${path}`);
  url.searchParams.set("apiKey", apiKey);
  const sanitizedUrl = sanitizeUrl(url);

  logProviderEvent("provider_request", {
    provider: POLYGON_PROVIDER,
    endpointUrl: sanitizedUrl,
  });

  let response: Response;

  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Unknown error";

    throw new MarketCalendarProviderError(
      `Could not reach Polygon market calendar: ${message}`,
      {
        provider: POLYGON_PROVIDER,
        endpointUrl: sanitizedUrl,
        reason: message,
        fallbackUsed: true,
      },
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new MarketCalendarProviderError(
      "Polygon market calendar returned invalid JSON.",
      {
        provider: POLYGON_PROVIDER,
        endpointUrl: sanitizedUrl,
        httpStatus: response.status,
        providerStatus: "invalid_json",
        reason: "Provider response could not be parsed as JSON.",
        fallbackUsed: true,
      },
    );
  }

  const providerMessage = getPolygonProviderMessage(data);
  const responseDetails = {
    provider: POLYGON_PROVIDER,
    endpointUrl: sanitizedUrl,
    httpStatus: response.status,
    providerStatus:
      data && typeof data === "object"
        ? (data as PolygonMarketStatusResponse).status
        : undefined,
    providerCode: undefined,
    providerMessage,
  };

  logProviderEvent("provider_response", responseDetails);

  if (!response.ok || providerMessage) {
    const reason =
      typeof providerMessage === "string" ? providerMessage : response.statusText;

    throw new MarketCalendarProviderError(
      `Polygon market calendar failed: ${reason}`,
      {
        ...responseDetails,
        reason,
        fallbackUsed: true,
      },
    );
  }

  return {
    data: data as T,
    httpStatus: response.status,
    sanitizedUrl,
    providerStatus: responseDetails.providerStatus,
    providerCode: responseDetails.providerCode,
    providerMessage: responseDetails.providerMessage,
  };
}

function timeFromProvider(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const plainTime = value.match(/(?:^|T|\s)(\d{2}):(\d{2})/);

  if (plainTime) {
    return `${plainTime[1]}:${plainTime[2]}`;
  }

  return null;
}

function holidayDate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function isUsEquityHoliday(holiday: PolygonHoliday) {
  const exchange =
    typeof holiday.exchange === "string" ? holiday.exchange.toUpperCase() : "";

  return exchange === "NYSE" || exchange === "NASDAQ" || exchange === "XNYS";
}

function findHolidayForDate(holidays: PolygonHoliday[], cacheDate: string) {
  return (
    holidays.find(
      (holiday) =>
        holidayDate(holiday.date) === cacheDate && isUsEquityHoliday(holiday),
    ) ??
    holidays.find((holiday) => holidayDate(holiday.date) === cacheDate) ??
    null
  );
}

function normalizeHoliday(
  holiday: PolygonHoliday,
  cacheDate: string,
): MarketStatus | null {
  const status =
    typeof holiday.status === "string" ? holiday.status.toLowerCase() : "";
  const name = typeof holiday.name === "string" ? holiday.name : "market holiday";

  if (status.includes("early")) {
    return {
      isOpenDay: true,
      reason: `US stock market has an early close for ${name}.`,
      date: cacheDate,
      dayType: "early_close",
      marketOpenTime: timeFromProvider(holiday.open) ?? "09:30",
      marketCloseTime: timeFromProvider(holiday.close) ?? "13:00",
      provider: POLYGON_PROVIDER,
      fromCache: false,
    };
  }

  if (status.includes("closed") || status.includes("close")) {
    return {
      isOpenDay: false,
      reason: `US stock market is closed for ${name}.`,
      date: cacheDate,
      dayType: "holiday",
      marketOpenTime: null,
      marketCloseTime: null,
      provider: POLYGON_PROVIDER,
      fromCache: false,
    };
  }

  return null;
}

function isStockMarketOpenNow(status: PolygonMarketStatusResponse) {
  const market = typeof status.market === "string" ? status.market.toLowerCase() : "";
  const nyse =
    typeof status.exchanges?.nyse === "string"
      ? status.exchanges.nyse.toLowerCase()
      : "";
  const nasdaq =
    typeof status.exchanges?.nasdaq === "string"
      ? status.exchanges.nasdaq.toLowerCase()
      : "";

  return market === "open" || nyse === "open" || nasdaq === "open";
}

function normalizePolygonStatus({
  cacheDate,
  date,
  currentStatus,
  holidays,
}: {
  cacheDate: string;
  date: Date;
  currentStatus: PolygonMarketStatusResponse | null;
  holidays: PolygonHoliday[];
}): MarketStatus {
  const holidayStatus = findHolidayForDate(holidays, cacheDate);
  const normalizedHoliday = holidayStatus
    ? normalizeHoliday(holidayStatus, cacheDate)
    : null;

  if (normalizedHoliday) {
    return normalizedHoliday;
  }

  if (isWeekendInNewYork(date)) {
    return {
      isOpenDay: false,
      reason: "US stock market is closed on weekends.",
      date: cacheDate,
      dayType: "weekend",
      marketOpenTime: null,
      marketCloseTime: null,
      provider: POLYGON_PROVIDER,
      fromCache: false,
    };
  }

  const isOpenNow = currentStatus ? isStockMarketOpenNow(currentStatus) : false;

  return {
    isOpenDay: true,
    reason: currentStatus
      ? isOpenNow
        ? "US stock market is open for regular trading."
        : "US stock market is a regular trading day, but it is not currently in regular hours."
      : "US stock market is a regular trading day.",
    date: cacheDate,
    dayType: "trading_day",
    marketOpenTime: "09:30",
    marketCloseTime: "16:00",
    provider: POLYGON_PROVIDER,
    fromCache: false,
  };
}

async function getPolygonMarketStatus(
  cacheDate: string,
  date: Date,
): Promise<{ status: MarketStatus; raw: unknown }> {
  const shouldFetchCurrentStatus = isTodayInNewYork(date);

  if (shouldFetchCurrentStatus) {
    const [currentStatusResult, holidaysResult] = await Promise.all([
      fetchPolygon<PolygonMarketStatusResponse>("/v1/marketstatus/now"),
      fetchPolygon<PolygonHoliday[]>("/v1/marketstatus/upcoming"),
    ]);
    const status = normalizePolygonStatus({
      cacheDate,
      date,
      currentStatus: currentStatusResult.data,
      holidays: holidaysResult.data,
    });

    logProviderEvent("provider_normalization_success", {
      provider: status.provider,
      endpointUrl: currentStatusResult.sanitizedUrl,
      httpStatus: currentStatusResult.httpStatus,
      providerStatus: currentStatusResult.providerStatus,
      providerCode: currentStatusResult.providerCode,
      providerMessage: currentStatusResult.providerMessage,
      reason: `Normalized as ${status.dayType}.`,
      fallbackUsed: false,
    });

    return {
      status,
      raw: {
        current_status: currentStatusResult.data,
        upcoming_holidays: holidaysResult.data,
      },
    };
  }

  const holidaysResult = await fetchPolygon<PolygonHoliday[]>(
    "/v1/marketstatus/upcoming",
  );
  const status = normalizePolygonStatus({
    cacheDate,
    date,
    currentStatus: null,
    holidays: holidaysResult.data,
  });

  logProviderEvent("provider_normalization_success", {
    provider: status.provider,
    endpointUrl: holidaysResult.sanitizedUrl,
    httpStatus: holidaysResult.httpStatus,
    providerStatus: holidaysResult.providerStatus,
    providerCode: holidaysResult.providerCode,
    providerMessage: holidaysResult.providerMessage,
    reason: `Normalized as ${status.dayType}.`,
    fallbackUsed: false,
  });

  return {
    status,
    raw: {
      upcoming_holidays: holidaysResult.data,
    },
  };
}

function getLocalFallbackStatus(
  cacheDate: string,
  date: Date,
  reason = "Market calendar provider unavailable; using NY-time fallback for scan timing.",
): MarketStatus {
  if (isWeekendInNewYork(date)) {
    return {
      isOpenDay: false,
      reason: "US stock market is closed on weekends.",
      date: cacheDate,
      dayType: "weekend",
      marketOpenTime: null,
      marketCloseTime: null,
      provider: LOCAL_PROVIDER,
      fromCache: false,
    };
  }

  return {
    isOpenDay: true,
    reason,
    date: cacheDate,
    dayType: "unknown",
    marketOpenTime: "09:30",
    marketCloseTime: "16:00",
    provider: LOCAL_PROVIDER,
    fromCache: false,
  };
}

function getProviderErrorDetails(error: unknown): ProviderLogDetails {
  if (error instanceof MarketCalendarProviderError) {
    return error.details;
  }

  return {
    provider: POLYGON_PROVIDER,
    reason: error instanceof Error && error.message ? error.message : "Unknown error",
    fallbackUsed: true,
  };
}

async function upsertCachedStatus(status: MarketStatus, raw: unknown) {
  const { error } = await supabase.from("market_calendar_cache").upsert(
    {
      cache_date: status.date,
      provider: status.provider,
      is_open_day: status.isOpenDay,
      reason: status.reason,
      day_type: status.dayType,
      market_open_time: status.marketOpenTime,
      market_close_time: status.marketCloseTime,
      raw,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "cache_date,provider" },
  );

  if (error) {
    console.error("[market-calendar] cache_upsert_error", {
      source: "supabase.market_calendar_cache",
      operation: "upsert_status",
      cacheDate: status.date,
      provider: status.provider,
      error: normalizeUnknownError(error),
    });
  }
}

export async function getUsMarketStatus(date = new Date()): Promise<MarketStatus> {
  const cacheDate = getNewYorkDateString(date);
  const cachedStatus = await getFreshCachedStatus(cacheDate);

  if (cachedStatus) {
    console.log(
      `[market-calendar] cache_hit ${logValue({
        date: cacheDate,
        provider: cachedStatus.provider,
        dayType: cachedStatus.dayType,
      })}`,
    );
    return cachedStatus;
  }

  try {
    const { status, raw } = await getPolygonMarketStatus(cacheDate, date);
    await upsertCachedStatus(status, raw);

    console.log(
      `[market-calendar] provider_status ${logValue({
        date: cacheDate,
        provider: status.provider,
        dayType: status.dayType,
        isOpenDay: status.isOpenDay,
      })}`,
    );

    return status;
  } catch (error) {
    const providerErrorDetails = getProviderErrorDetails(error);
    console.error(
      `[market-calendar] provider_error ${logValue(providerErrorDetails)}`,
    );

    const raw = {
      error: providerErrorDetails.reason ?? "Unknown error",
      provider: providerErrorDetails.provider,
      endpoint_url: providerErrorDetails.endpointUrl,
      http_status: providerErrorDetails.httpStatus,
      provider_status: providerErrorDetails.providerStatus,
      provider_code: providerErrorDetails.providerCode,
      provider_message: providerErrorDetails.providerMessage,
      fallback: true,
    };
    const status = getLocalFallbackStatus(
      cacheDate,
      date,
      "Market calendar provider unavailable; using NY-time fallback for scan timing.",
    );
    await upsertCachedStatus(status, raw);

    logProviderEvent("fallback_used", {
      ...providerErrorDetails,
      provider: LOCAL_PROVIDER,
      fallbackUsed: true,
      reason: status.reason,
    });

    return status;
  }
}
