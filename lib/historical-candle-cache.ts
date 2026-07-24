export type HistoricalCandleInterval =
  | "1min"
  | "5min"
  | "15min"
  | "30min"
  | "1h"
  | "1day";

export type HistoricalCandleSource = "twelve_data" | "mock" | "unknown";

export type HistoricalCandle = {
  ticker?: string | null;
  interval?: HistoricalCandleInterval | string | null;
  timestamp?: string | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
  source?: HistoricalCandleSource | string | null;
  adjusted?: boolean | null;
  timezone?: string | null;
};

export type HistoricalCandleCacheKeyInput = {
  provider?: HistoricalCandleSource | string | null;
  ticker?: string | null;
  interval?: HistoricalCandleInterval | string | null;
  trading_day?: string | null;
  session?: string | null;
  window?: string | null;
  timezone?: string | null;
  adjusted?: boolean | null;
};

export type HistoricalCandleValidationResult = {
  valid: boolean;
  ticker: string | null;
  timestamp: string | null;
  missing_fields: string[];
  reason_codes: string[];
  metadata_gaps: string[];
};

export type HistoricalCandleCacheReadinessInput = {
  candles?: HistoricalCandle[] | null;
};

export type HistoricalCandleCacheReadinessSummary = {
  advisory_only: true;
  cache_contract: {
    provider: "twelve_data";
    supported_intervals: HistoricalCandleInterval[];
    preferred_interval: "5min";
    cache_key_fields: string[];
    candle_required_fields: string[];
    candle_optional_fields: string[];
  };
  validation: {
    candles_inspected: number;
    valid_candles: number;
    invalid_candles: number;
    stale_or_out_of_order: number;
    missing_field_counts: Record<string, number>;
    invalid_examples: Array<{
      ticker: string | null;
      timestamp: string | null;
      reason_codes: string[];
      missing_fields: string[];
    }>;
  };
  storage_plan: {
    suggested_table_name: string;
    suggested_unique_key: string[];
    suggested_indexes: string[];
    companion_table_name: string;
    dedupe_required: true;
    reuse_before_fetch: true;
    ttl_policy_required: true;
  };
  lookahead_safety: {
    analysis_cutoff_required: true;
    cache_can_include_future_candles: true;
    signal_generation_must_filter_to_cutoff: true;
    outcome_evaluation_can_use_after_cutoff: true;
  };
  readiness: {
    ready_to_define_storage: boolean;
    ready_to_fetch_historical_data: false;
    ready_to_use_for_backfill: false;
    ready_to_use_for_scanner: false;
  };
  safety: {
    advisory_only: true;
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

const supportedIntervals: HistoricalCandleInterval[] = [
  "1min",
  "5min",
  "15min",
  "30min",
  "1h",
  "1day",
];

const cacheKeyFields = [
  "provider",
  "ticker",
  "interval",
  "trading_day",
  "session",
  "timezone",
  "adjusted",
];

const candleRequiredFields = [
  "ticker",
  "interval",
  "timestamp",
  "open",
  "high",
  "low",
  "close",
  "volume",
  "source",
];

const candleOptionalFields = ["adjusted", "timezone"];

function normalizeText(value: string | null | undefined, fallback = "unknown") {
  const text = value?.trim().toLowerCase() ?? "";
  return text.length > 0 ? text : fallback;
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : null;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseTimestamp(value: string | null | undefined) {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

export function buildHistoricalCandleCacheKey(
  input: HistoricalCandleCacheKeyInput,
) {
  const provider = normalizeText(input.provider ?? "twelve_data");
  const ticker = normalizeTicker(input.ticker ?? null) ?? "UNKNOWN";
  const interval = normalizeText(input.interval ?? "5min");
  const tradingDay = normalizeText(input.trading_day ?? "unknown_day");
  const session = normalizeText(input.session ?? input.window ?? "regular");
  const timezone = input.timezone?.trim() || "America/New_York";
  const adjusted = input.adjusted === true ? "adjusted_true" : "adjusted_false";

  return [
    provider,
    ticker,
    interval,
    tradingDay,
    session,
    timezone,
    adjusted,
  ].join(":");
}

export function validateHistoricalCandleShape(
  candle: HistoricalCandle | null | undefined,
): HistoricalCandleValidationResult {
  const row = candle ?? {};
  const missingFields: string[] = [];
  const reasonCodes: string[] = [];
  const metadataGaps: string[] = [];
  const ticker = normalizeTicker(row.ticker ?? null);
  const timestamp = row.timestamp?.trim() ?? null;
  const parsedTimestamp = parseTimestamp(timestamp);
  const open = finiteNumber(row.open);
  const high = finiteNumber(row.high);
  const low = finiteNumber(row.low);
  const close = finiteNumber(row.close);
  const volume = row.volume === null ? null : finiteNumber(row.volume);

  if (!ticker) missingFields.push("ticker");
  if (!row.interval || String(row.interval).trim().length === 0) {
    missingFields.push("interval");
  } else if (
    !supportedIntervals.includes(
      String(row.interval).trim() as HistoricalCandleInterval,
    )
  ) {
    reasonCodes.push("unsupported_interval");
  }
  if (!parsedTimestamp) missingFields.push("timestamp");
  if (open === null) missingFields.push("open");
  if (high === null) missingFields.push("high");
  if (low === null) missingFields.push("low");
  if (close === null) missingFields.push("close");
  if (!row.source || String(row.source).trim().length === 0) {
    missingFields.push("source");
  }

  if (row.volume === undefined) {
    missingFields.push("volume");
  } else if (row.volume !== null && volume === null) {
    reasonCodes.push("invalid_volume");
  } else if (volume !== null && volume < 0) {
    reasonCodes.push("negative_volume");
  }

  if (missingFields.length > 0) {
    reasonCodes.push("missing_required_fields");
    metadataGaps.push(...missingFields);
  }

  if (high !== null && low !== null && high < low) {
    reasonCodes.push("invalid_ohlc_high_below_low");
  }
  if (
    high !== null &&
    ((open !== null && high < open) || (close !== null && high < close))
  ) {
    reasonCodes.push("invalid_ohlc_high_below_open_or_close");
  }
  if (
    low !== null &&
    ((open !== null && low > open) || (close !== null && low > close))
  ) {
    reasonCodes.push("invalid_ohlc_low_above_open_or_close");
  }

  return {
    valid: reasonCodes.length === 0,
    ticker,
    timestamp,
    missing_fields: missingFields,
    reason_codes: reasonCodes,
    metadata_gaps: metadataGaps,
  };
}

function duplicateTimestampCount(candles: HistoricalCandle[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const candle of candles) {
    const ticker = normalizeTicker(candle.ticker ?? null) ?? "UNKNOWN";
    const interval = normalizeText(candle.interval ?? "unknown");
    const timestamp = candle.timestamp?.trim() ?? "";
    if (timestamp.length === 0) continue;

    const key = `${ticker}:${interval}:${timestamp}`;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }

  return duplicates.size;
}

function outOfOrderCount(candles: HistoricalCandle[]) {
  const groups = new Map<string, number>();
  let outOfOrder = 0;

  for (const candle of candles) {
    const timestamp = parseTimestamp(candle.timestamp ?? null);
    if (!timestamp) continue;

    const key = `${normalizeTicker(candle.ticker ?? null) ?? "UNKNOWN"}:${normalizeText(candle.interval ?? "unknown")}`;
    const previous = groups.get(key);
    if (previous !== undefined && timestamp.getTime() < previous) {
      outOfOrder += 1;
    }
    groups.set(key, timestamp.getTime());
  }

  return outOfOrder;
}

export function buildHistoricalCandleCacheReadiness(
  input: HistoricalCandleCacheReadinessInput = {},
): HistoricalCandleCacheReadinessSummary {
  const candles = Array.isArray(input.candles) ? input.candles : [];
  const validations = candles.map(validateHistoricalCandleShape);
  const missingFieldCounts: Record<string, number> = {};
  const reasonCodes: string[] = ["historical_candle_cache_readiness_only"];
  const metadataGaps: string[] = [];
  const duplicateCount = duplicateTimestampCount(candles);
  const orderingIssueCount = outOfOrderCount(candles);
  const staleOrOutOfOrder = duplicateCount + orderingIssueCount;

  for (const validation of validations) {
    for (const field of validation.missing_fields) {
      increment(missingFieldCounts, field);
      pushUnique(metadataGaps, field);
    }
    for (const reason of validation.reason_codes) {
      pushUnique(reasonCodes, reason);
    }
  }

  if (duplicateCount > 0) {
    increment(missingFieldCounts, "duplicate_timestamp", duplicateCount);
    pushUnique(reasonCodes, "duplicate_timestamps_detected");
  }
  if (orderingIssueCount > 0) {
    pushUnique(reasonCodes, "out_of_order_candles_detected");
  }

  return {
    advisory_only: true,
    cache_contract: {
      provider: "twelve_data",
      supported_intervals: supportedIntervals,
      preferred_interval: "5min",
      cache_key_fields: cacheKeyFields,
      candle_required_fields: candleRequiredFields,
      candle_optional_fields: candleOptionalFields,
    },
    validation: {
      candles_inspected: candles.length,
      valid_candles: validations.filter((item) => item.valid).length,
      invalid_candles: validations.filter((item) => !item.valid).length,
      stale_or_out_of_order: staleOrOutOfOrder,
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
    storage_plan: {
      suggested_table_name: "historical_candles",
      suggested_unique_key: [
        "provider",
        "ticker",
        "interval",
        "timestamp",
        "adjusted",
      ],
      suggested_indexes: [
        "ticker_interval_timestamp",
        "provider_ticker_trading_day",
        "interval_timestamp",
      ],
      companion_table_name: "historical_candle_fetch_runs",
      dedupe_required: true,
      reuse_before_fetch: true,
      ttl_policy_required: true,
    },
    lookahead_safety: {
      analysis_cutoff_required: true,
      cache_can_include_future_candles: true,
      signal_generation_must_filter_to_cutoff: true,
      outcome_evaluation_can_use_after_cutoff: true,
    },
    readiness: {
      ready_to_define_storage: true,
      ready_to_fetch_historical_data: false,
      ready_to_use_for_backfill: false,
      ready_to_use_for_scanner: false,
    },
    safety: {
      advisory_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      synthetic_outcomes_persisted: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    recommended_next_steps: [
      "define_historical_candles_storage_schema",
      "add_historical_candle_fetch_run_audit_table",
      "write_cache_reuse_before_fetch_policy",
      "write_lookahead_cutoff_filter_tests",
      "define_candle_ttl_and_adjustment_policy",
    ],
    reason_codes: reasonCodes,
    caution_flags: [
      "cache_contract_only",
      "historical_fetch_not_enabled",
      "scanner_usage_not_enabled",
    ],
    metadata_gaps: metadataGaps,
  };
}

export function historicalCandleCacheReadinessJson(
  summary: HistoricalCandleCacheReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
