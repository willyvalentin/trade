import "server-only";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";

export type DailyCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type IntradayCandle = DailyCandle;

export type IntradayCandleRequestDiagnostics = {
  provider: "twelve_data";
  interval: "5min" | "15min";
  start_at: string;
  end_at: string;
  timezone: string;
  raw_provider_params: Record<string, string | number>;
  response_status: "available" | "empty" | "provider_error";
  response_category: string;
  returned_candle_count: number;
  first_candle_time: string | null;
  last_candle_time: string | null;
  provider_message: string | null;
};

export type MarketQuote = {
  current_price: number;
  change: number;
  percent_change: number;
  open: number;
  high: number;
  low: number;
  previous_close: number;
  volume: number | null;
};

type TwelveDataErrorResponse = {
  status?: unknown;
  code?: unknown;
  message?: unknown;
};

type TwelveDataTimeSeriesValue = {
  datetime?: unknown;
  open?: unknown;
  high?: unknown;
  low?: unknown;
  close?: unknown;
  volume?: unknown;
};

type TwelveDataTimeSeriesResponse = TwelveDataErrorResponse & {
  values?: unknown;
};

type TwelveDataQuoteResponse = TwelveDataErrorResponse & {
  close?: unknown;
  change?: unknown;
  percent_change?: unknown;
  open?: unknown;
  high?: unknown;
  low?: unknown;
  previous_close?: unknown;
  volume?: unknown;
};

function getTwelveDataApiKey() {
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("TWELVE_DATA_API_KEY is missing. Add it to .env.local.");
  }

  return apiKey;
}

function normalizeSymbol(symbol: string) {
  const normalized = symbol.trim().toUpperCase();

  if (!normalized) {
    throw new Error("Market data symbol is required.");
  }

  return normalized;
}

function numberField(value: unknown, fieldName: string) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    throw new Error(`Market data returned an invalid ${fieldName} value.`);
  }

  return parsed;
}

function optionalNumberField(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function timestampField(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    throw new Error(`Market data returned an invalid ${fieldName} value.`);
  }

  const timestamp = Math.floor(new Date(value).getTime() / 1000);

  if (!Number.isFinite(timestamp)) {
    throw new Error(`Market data returned an invalid ${fieldName} value.`);
  }

  return timestamp;
}

function partsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    hour: Number(value("hour")) % 24,
    minute: Number(value("minute")),
    second: Number(value("second")),
  };
}

function formatInTimeZone(date: Date, timeZone: string) {
  const parts = partsInTimeZone(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

function timeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = partsInTimeZone(date, timeZone);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return localAsUtc - date.getTime();
}

function timestampInTimeZone(value: unknown, fieldName: string, timeZone: string) {
  if (typeof value !== "string") {
    throw new Error(`Market data returned an invalid ${fieldName} value.`);
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (!match) {
    throw new Error(`Market data returned an invalid ${fieldName} value.`);
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const localAsUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  const firstOffset = timeZoneOffsetMs(new Date(localAsUtc), timeZone);
  const firstUtc = localAsUtc - firstOffset;
  const refinedOffset = timeZoneOffsetMs(new Date(firstUtc), timeZone);
  const timestamp = Math.floor((localAsUtc - refinedOffset) / 1000);

  if (!Number.isFinite(timestamp)) {
    throw new Error(`Market data returned an invalid ${fieldName} value.`);
  }

  return timestamp;
}

function getTwelveDataError(data: unknown) {
  if (typeof data !== "object" || data === null) {
    return "";
  }

  const error = data as TwelveDataErrorResponse;

  if (error.status === "error" && typeof error.message === "string") {
    return error.message;
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  return "";
}

async function fetchTwelveData<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<T> {
  const { data } = await fetchTwelveDataDetailed<T>(path, params);

  return data;
}

async function fetchTwelveDataDetailed<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<{
  data: T;
  safeParams: Record<string, string | number>;
  httpStatus: number;
  providerMessage: string | null;
}> {
  const url = new URL(`${TWELVE_DATA_BASE_URL}${path}`);
  const apiKey = getTwelveDataApiKey();
  const safeParams = { ...params };

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  url.searchParams.set("apikey", apiKey);

  let response: Response;

  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Unknown error";

    throw new Error(`Could not reach market data provider: ${message}`);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error("Market data provider returned a response that was not valid JSON.");
  }

  const providerError = getTwelveDataError(data);

  if (!response.ok || providerError) {
    throw new Error(
      `Market data request failed: ${providerError || response.statusText}`,
    );
  }

  return {
    data: data as T,
    safeParams,
    httpStatus: response.status,
    providerMessage: getTwelveDataError(data) || null,
  };
}

export async function getDailyCandles(
  symbol: string,
  days: number,
): Promise<DailyCandle[]> {
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error("days must be a positive whole number.");
  }

  const data = await fetchTwelveData<TwelveDataTimeSeriesResponse>(
    "/time_series",
    {
      symbol: normalizeSymbol(symbol),
      interval: "1day",
      outputsize: days,
      order: "ASC",
    },
  );

  if (!Array.isArray(data.values)) {
    throw new Error("Market data provider returned invalid candle data.");
  }

  return data.values
    .map((value, index) => {
      const candle = value as TwelveDataTimeSeriesValue;

      return {
        timestamp: timestampField(candle.datetime, `candle ${index + 1} datetime`),
        open: numberField(candle.open, `candle ${index + 1} open`),
        high: numberField(candle.high, `candle ${index + 1} high`),
        low: numberField(candle.low, `candle ${index + 1} low`),
        close: numberField(candle.close, `candle ${index + 1} close`),
        volume: numberField(candle.volume, `candle ${index + 1} volume`),
      };
    })
    .sort((left, right) => left.timestamp - right.timestamp);
}

export async function getIntradayCandles(
  symbol: string,
  interval: "5min" | "15min",
  start: Date,
  end: Date,
): Promise<IntradayCandle[]> {
  const result = await getIntradayCandlesWithDiagnostics(
    symbol,
    interval,
    start,
    end,
  );

  return result.candles;
}

export async function getIntradayCandlesWithDiagnostics(
  symbol: string,
  interval: "5min" | "15min",
  start: Date,
  end: Date,
): Promise<{
  candles: IntradayCandle[];
  diagnostics: IntradayCandleRequestDiagnostics;
}> {
  const timezone = "America/New_York";
  const params = {
    symbol: normalizeSymbol(symbol),
    interval,
    start_date: formatInTimeZone(start, timezone),
    end_date: formatInTimeZone(end, timezone),
    timezone,
    outputsize: 500,
    order: "ASC",
  };
  const { data, safeParams, providerMessage } =
    await fetchTwelveDataDetailed<TwelveDataTimeSeriesResponse>(
    "/time_series",
      params,
  );

  if (!Array.isArray(data.values)) {
    throw new Error("Market data provider returned invalid intraday candle data.");
  }

  const startTimestamp = Math.floor(start.getTime() / 1000);
  const endTimestamp = Math.floor(end.getTime() / 1000);

  const candles = data.values
    .map((value, index) => {
      const candle = value as TwelveDataTimeSeriesValue;

      return {
        timestamp: timestampInTimeZone(
          candle.datetime,
          `candle ${index + 1} datetime`,
          timezone,
        ),
        open: numberField(candle.open, `candle ${index + 1} open`),
        high: numberField(candle.high, `candle ${index + 1} high`),
        low: numberField(candle.low, `candle ${index + 1} low`),
        close: numberField(candle.close, `candle ${index + 1} close`),
        volume: numberField(candle.volume, `candle ${index + 1} volume`),
      };
    })
    .filter(
      (candle) =>
        candle.timestamp >= startTimestamp && candle.timestamp <= endTimestamp,
    )
    .sort((left, right) => left.timestamp - right.timestamp);
  const firstCandle = candles[0] ?? null;
  const lastCandle = candles.at(-1) ?? null;

  return {
    candles,
    diagnostics: {
      provider: "twelve_data",
      interval,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      timezone,
      raw_provider_params: safeParams,
      response_status: candles.length > 0 ? "available" : "empty",
      response_category: candles.length > 0 ? "available" : "empty_response",
      returned_candle_count: candles.length,
      first_candle_time:
        firstCandle === null
          ? null
          : new Date(firstCandle.timestamp * 1000).toISOString(),
      last_candle_time:
        lastCandle === null
          ? null
          : new Date(lastCandle.timestamp * 1000).toISOString(),
      provider_message:
        providerMessage ??
        (candles.length > 0
          ? null
          : "Provider returned no candles for the requested window."),
    },
  };
}

export async function getQuote(symbol: string): Promise<MarketQuote> {
  const data = await fetchTwelveData<TwelveDataQuoteResponse>("/quote", {
    symbol: normalizeSymbol(symbol),
    interval: "1day",
  });

  return {
    current_price: numberField(data.close, "current price"),
    change: numberField(data.change, "change"),
    percent_change: numberField(data.percent_change, "percent change"),
    open: numberField(data.open, "open"),
    high: numberField(data.high, "high"),
    low: numberField(data.low, "low"),
    previous_close: numberField(data.previous_close, "previous close"),
    volume: optionalNumberField(data.volume),
  };
}
