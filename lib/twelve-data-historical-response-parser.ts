import {
  buildHistoricalCandleCacheKey,
  validateHistoricalCandleShape,
  type HistoricalCandle,
  type HistoricalCandleInterval,
} from "@/lib/historical-candle-cache";

export type TwelveDataHistoricalParseStatus =
  | "ok"
  | "partial"
  | "empty"
  | "error";

export type TwelveDataHistoricalRawCandle = {
  datetime?: string | null;
  open?: string | number | null;
  high?: string | number | null;
  low?: string | number | null;
  close?: string | number | null;
  volume?: string | number | null;
};

export type TwelveDataHistoricalRawResponse = {
  meta?: {
    symbol?: string | null;
    interval?: string | null;
    currency?: string | null;
    exchange_timezone?: string | null;
    exchange?: string | null;
    mic_code?: string | null;
    type?: string | null;
  } | null;
  values?: TwelveDataHistoricalRawCandle[] | null;
  status?: string | null;
  code?: string | number | null;
  message?: string | null;
};

export type TwelveDataHistoricalResponseContext = {
  ticker?: string | null;
  interval?: HistoricalCandleInterval | string | null;
  timezone?: string | null;
  adjusted?: boolean | null;
  trading_day?: string | null;
  session?: string | null;
  cache_key?: string | null;
};

export type TwelveDataHistoricalResponseParserInput = {
  response?: TwelveDataHistoricalRawResponse | null;
  context?: TwelveDataHistoricalResponseContext | null;
};

export type TwelveDataHistoricalResponseParserSummary = {
  advisory_only: true;
  mock_only: true;
  parse_status: TwelveDataHistoricalParseStatus;
  provider_status: string | null;
  provider_error_code: string | null;
  provider_error_message: string | null;
  meta: {
    ticker: string | null;
    interval: string | null;
    timezone: string | null;
    exchange: string | null;
  };
  candles: HistoricalCandle[];
  validation: {
    raw_candles_count: number;
    normalized_candles_count: number;
    valid_candles_count: number;
    invalid_candles_count: number;
    duplicate_timestamp_count: number;
    out_of_order_count: number;
    missing_field_counts: Record<string, number>;
    invalid_examples: Array<{
      ticker: string | null;
      timestamp: string | null;
      reason_codes: string[];
      missing_fields: string[];
    }>;
  };
  cache_mapping: {
    cache_key: string | null;
    provider: "twelve_data";
    ticker: string | null;
    interval: string | null;
    trading_day: string | null;
    session: string | null;
    timezone: string | null;
    adjusted: boolean;
  };
  readiness: {
    ready_to_parse_mock_response: boolean;
    ready_to_parse_provider_response: false;
    ready_to_persist_candles: false;
    ready_to_run_backfill: false;
    safe_to_affect_scanner: false;
  };
  safety: {
    advisory_only: true;
    mock_only: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    synthetic_outcomes_persisted: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
  recommended_next_steps: string[];
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

const defaultTimezone = "America/New_York";
const supportedIntervals: HistoricalCandleInterval[] = [
  "1min",
  "5min",
  "15min",
  "30min",
  "1h",
  "1day",
];

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : null;
}

function normalizeText(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function normalizeInterval(value: string | null | undefined) {
  const interval = value?.trim() ?? "";
  return supportedIntervals.includes(interval as HistoricalCandleInterval)
    ? (interval as HistoricalCandleInterval)
    : null;
}

function numberFromProvider(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value.trim().replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function dateKeyFromIso(value: string | null) {
  return value?.slice(0, 10) ?? null;
}

function nyParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(byType.get("year") ?? "0"),
    month: Number(byType.get("month") ?? "0"),
    day: Number(byType.get("day") ?? "0"),
    hour: Number(byType.get("hour") ?? "0"),
    minute: Number(byType.get("minute") ?? "0"),
    second: Number(byType.get("second") ?? "0"),
  };
}

function parseProviderDateTime(value: string | null | undefined, timezone: string) {
  const text = value?.trim() ?? "";
  if (text.length === 0) return null;

  const direct = new Date(text);
  if (text.includes("T") && Number.isFinite(direct.getTime())) {
    return direct.toISOString();
  }

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) return Number.isFinite(direct.getTime()) ? direct.toISOString() : null;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText ?? "0");
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const formatted = nyParts(new Date(utcGuess), timezone);
  const formattedAsUtc = Date.UTC(
    formatted.year,
    formatted.month - 1,
    formatted.day,
    formatted.hour,
    formatted.minute,
    formatted.second,
  );

  return new Date(utcGuess - (formattedAsUtc - utcGuess)).toISOString();
}

function duplicateTimestampCount(candles: HistoricalCandle[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const candle of candles) {
    if (!candle.timestamp) continue;
    const key = `${normalizeTicker(candle.ticker ?? null) ?? "UNKNOWN"}:${candle.interval ?? "unknown"}:${candle.timestamp}`;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }

  return duplicates.size;
}

function outOfOrderCount(candles: HistoricalCandle[]) {
  const previousByKey = new Map<string, number>();
  let count = 0;

  for (const candle of candles) {
    if (!candle.timestamp) continue;
    const parsed = new Date(candle.timestamp);
    if (!Number.isFinite(parsed.getTime())) continue;
    const key = `${normalizeTicker(candle.ticker ?? null) ?? "UNKNOWN"}:${candle.interval ?? "unknown"}`;
    const previous = previousByKey.get(key);
    if (previous !== undefined && parsed.getTime() < previous) count += 1;
    previousByKey.set(key, parsed.getTime());
  }

  return count;
}

function sortCandles(candles: HistoricalCandle[]) {
  return [...candles].sort((first, second) => {
    const firstTime = first.timestamp ? new Date(first.timestamp).getTime() : 0;
    const secondTime = second.timestamp ? new Date(second.timestamp).getTime() : 0;
    return firstTime - secondTime;
  });
}

function defaultMockResponse(): TwelveDataHistoricalRawResponse {
  return {
    meta: {
      symbol: "AAPL",
      interval: "5min",
      currency: "USD",
      exchange_timezone: defaultTimezone,
      exchange: "NASDAQ",
      mic_code: "XNGS",
      type: "Common Stock",
    },
    values: [
      {
        datetime: "2026-07-08 09:30:00",
        open: "213.10",
        high: "213.50",
        low: "212.90",
        close: "213.20",
        volume: "123456",
      },
      {
        datetime: "2026-07-08 09:35:00",
        open: "213.20",
        high: "214.00",
        low: "213.00",
        close: "213.80",
        volume: "234567",
      },
    ],
    status: "ok",
  };
}

export function normalizeTwelveDataCandle(
  rawCandle: TwelveDataHistoricalRawCandle | null | undefined,
  context: TwelveDataHistoricalResponseContext = {},
): HistoricalCandle {
  const timezone = normalizeText(context.timezone ?? null) ?? defaultTimezone;
  const timestamp = parseProviderDateTime(rawCandle?.datetime ?? null, timezone);

  return {
    ticker: normalizeTicker(context.ticker ?? null) ?? null,
    interval: normalizeInterval(context.interval ?? null) ?? context.interval ?? null,
    timestamp,
    open: numberFromProvider(rawCandle?.open),
    high: numberFromProvider(rawCandle?.high),
    low: numberFromProvider(rawCandle?.low),
    close: numberFromProvider(rawCandle?.close),
    volume:
      rawCandle?.volume === undefined || rawCandle.volume === null
        ? null
        : numberFromProvider(rawCandle.volume),
    source: "twelve_data",
    adjusted: context.adjusted === true,
    timezone,
    provider: "twelve_data",
    trading_day: context.trading_day ?? dateKeyFromIso(timestamp),
    session: context.session ?? "regular",
    cache_key: context.cache_key ?? null,
  } as HistoricalCandle & {
    provider: "twelve_data";
    trading_day: string | null;
    session: string;
    cache_key: string | null;
  };
}

export function parseTwelveDataHistoricalResponse(
  input: TwelveDataHistoricalResponseParserInput = {},
): TwelveDataHistoricalResponseParserSummary {
  const response = input.response ?? null;
  const meta = response?.meta ?? null;
  const context = input.context ?? {};
  const providerStatus = normalizeText(response?.status ?? null);
  const providerErrorCode =
    response?.code === undefined || response?.code === null
      ? null
      : String(response.code);
  const providerErrorMessage = normalizeText(response?.message ?? null);
  const metaTicker = normalizeTicker(meta?.symbol ?? null);
  const contextTicker = normalizeTicker(context.ticker ?? null);
  const ticker = metaTicker ?? contextTicker;
  const metaInterval = normalizeText(meta?.interval ?? null);
  const interval = metaInterval ?? normalizeText(context.interval ?? null);
  const normalizedInterval = normalizeInterval(interval ?? null);
  const timezone =
    normalizeText(meta?.exchange_timezone ?? null) ??
    normalizeText(context.timezone ?? null) ??
    defaultTimezone;
  const adjusted = context.adjusted === true;
  const rawCandles = Array.isArray(response?.values) ? response.values : [];
  const reasonCodes: string[] = ["twelve_data_historical_response_parser_mock_only"];
  const cautionFlags = [
    "mock_only",
    "provider_fetch_not_enabled",
    "candle_persistence_not_enabled",
  ];
  const metadataGaps: string[] = [];

  if (!response) {
    metadataGaps.push("mock_response_missing");
    cautionFlags.push("empty_mock_response");
  }
  if (!meta) {
    metadataGaps.push("meta_missing");
    pushUnique(reasonCodes, "missing_meta");
  }
  if (!ticker) {
    metadataGaps.push("ticker_missing");
  }
  if (!normalizedInterval) {
    metadataGaps.push("interval_missing_or_unsupported");
  }
  if (metaTicker && contextTicker && metaTicker !== contextTicker) {
    pushUnique(reasonCodes, "meta_ticker_mismatch");
    cautionFlags.push("meta_ticker_mismatch");
  }
  if (
    metaInterval &&
    context.interval &&
    metaInterval !== String(context.interval).trim()
  ) {
    pushUnique(reasonCodes, "interval_mismatch");
    cautionFlags.push("interval_mismatch");
  }

  const cacheKey =
    context.cache_key ??
    (ticker && interval
      ? buildHistoricalCandleCacheKey({
          provider: "twelve_data",
          ticker,
          interval,
          trading_day: context.trading_day ?? null,
          session: context.session ?? "regular",
          timezone,
          adjusted,
        })
      : null);
  const candleContext: TwelveDataHistoricalResponseContext = {
    ticker,
    interval: normalizedInterval ?? interval,
    timezone,
    adjusted,
    trading_day: context.trading_day ?? null,
    session: context.session ?? "regular",
    cache_key: cacheKey,
  };
  const normalizedCandles = rawCandles.map((candle) =>
    normalizeTwelveDataCandle(candle, candleContext),
  );
  const validations = normalizedCandles.map(validateHistoricalCandleShape);
  const missingFieldCounts: Record<string, number> = {};

  for (const validation of validations) {
    for (const field of validation.missing_fields) {
      increment(missingFieldCounts, field);
      pushUnique(metadataGaps, field);
    }
    for (const reason of validation.reason_codes) {
      pushUnique(reasonCodes, reason);
    }
  }

  const duplicateTimestampCountValue = duplicateTimestampCount(normalizedCandles);
  const outOfOrderCountValue = outOfOrderCount(normalizedCandles);
  if (duplicateTimestampCountValue > 0) {
    increment(missingFieldCounts, "duplicate_timestamp", duplicateTimestampCountValue);
    pushUnique(reasonCodes, "duplicate_timestamps_detected");
    cautionFlags.push("duplicate_timestamps_detected");
  }
  if (outOfOrderCountValue > 0) {
    pushUnique(reasonCodes, "out_of_order_candles_detected");
    cautionFlags.push("out_of_order_candles_detected");
  }

  const validCandlesCount = validations.filter((item) => item.valid).length;
  const invalidCandlesCount = validations.length - validCandlesCount;
  let parseStatus: TwelveDataHistoricalParseStatus = "ok";

  if (providerStatus === "error") {
    parseStatus = "error";
    pushUnique(reasonCodes, "provider_error_response");
  } else if (rawCandles.length === 0) {
    parseStatus = "empty";
    pushUnique(reasonCodes, "empty_values");
  } else if (
    invalidCandlesCount > 0 ||
    duplicateTimestampCountValue > 0 ||
    outOfOrderCountValue > 0 ||
    reasonCodes.includes("meta_ticker_mismatch") ||
    reasonCodes.includes("interval_mismatch")
  ) {
    parseStatus = "partial";
  }

  return {
    advisory_only: true,
    mock_only: true,
    parse_status: parseStatus,
    provider_status: providerStatus,
    provider_error_code: providerErrorCode,
    provider_error_message: providerErrorMessage,
    meta: {
      ticker,
      interval,
      timezone,
      exchange: normalizeText(meta?.exchange ?? null),
    },
    candles: sortCandles(normalizedCandles),
    validation: {
      raw_candles_count: rawCandles.length,
      normalized_candles_count: normalizedCandles.length,
      valid_candles_count: validCandlesCount,
      invalid_candles_count: invalidCandlesCount,
      duplicate_timestamp_count: duplicateTimestampCountValue,
      out_of_order_count: outOfOrderCountValue,
      missing_field_counts: missingFieldCounts,
      invalid_examples: validations
        .filter((item) => !item.valid)
        .slice(0, 6)
        .map((item) => ({
          ticker: item.ticker,
          timestamp: item.timestamp,
          reason_codes: item.reason_codes,
          missing_fields: item.missing_fields,
        })),
    },
    cache_mapping: {
      cache_key: cacheKey,
      provider: "twelve_data",
      ticker,
      interval,
      trading_day:
        context.trading_day ??
        dateKeyFromIso(normalizedCandles[0]?.timestamp ?? null),
      session: context.session ?? "regular",
      timezone,
      adjusted,
    },
    readiness: {
      ready_to_parse_mock_response: parseStatus !== "error",
      ready_to_parse_provider_response: false,
      ready_to_persist_candles: false,
      ready_to_run_backfill: false,
      safe_to_affect_scanner: false,
    },
    safety: {
      advisory_only: true,
      mock_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      synthetic_outcomes_persisted: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    recommended_next_steps: [
      "review_mock_parser_output_before_provider_fetch_design",
      "keep_cache_lookup_and_validation_before_any_future_persistence",
      "map_provider_errors_to_fetch_run_audit_before enabling fetch",
      "require_separate_approval_before_parsing_live_provider_responses",
    ],
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
  };
}

export function buildTwelveDataHistoricalResponseParserReadiness(
  input: TwelveDataHistoricalResponseParserInput = {},
) {
  return parseTwelveDataHistoricalResponse({
    response: input.response ?? defaultMockResponse(),
    context: {
      ticker: "AAPL",
      interval: "5min",
      timezone: defaultTimezone,
      adjusted: false,
      trading_day: "2026-07-08",
      session: "official_windows",
      ...input.context,
    },
  });
}

export function twelveDataHistoricalResponseParserJson(
  summary: TwelveDataHistoricalResponseParserSummary,
) {
  return JSON.stringify(summary, null, 2);
}
