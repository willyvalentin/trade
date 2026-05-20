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

export type MarketQuote = {
  current_price: number;
  change: number;
  percent_change: number;
  open: number;
  high: number;
  low: number;
  previous_close: number;
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

function newYorkTimestampField(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    throw new Error(`Market data returned an invalid ${fieldName} value.`);
  }

  const normalized = value.includes("T")
    ? value
    : value.replace(" ", "T");
  const timestamp = Math.floor(new Date(`${normalized}-04:00`).getTime() / 1000);

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
  const url = new URL(`${TWELVE_DATA_BASE_URL}${path}`);
  const apiKey = getTwelveDataApiKey();

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

  return data as T;
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
  const data = await fetchTwelveData<TwelveDataTimeSeriesResponse>(
    "/time_series",
    {
      symbol: normalizeSymbol(symbol),
      interval,
      outputsize: 96,
      order: "ASC",
    },
  );

  if (!Array.isArray(data.values)) {
    throw new Error("Market data provider returned invalid intraday candle data.");
  }

  const startTimestamp = Math.floor(start.getTime() / 1000);
  const endTimestamp = Math.floor(end.getTime() / 1000);

  return data.values
    .map((value, index) => {
      const candle = value as TwelveDataTimeSeriesValue;

      return {
        timestamp: newYorkTimestampField(
          candle.datetime,
          `candle ${index + 1} datetime`,
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
  };
}
