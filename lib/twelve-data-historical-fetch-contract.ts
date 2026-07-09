import { buildHistoricalCandleCacheKey } from "@/lib/historical-candle-cache";
import type {
  HistoricalBackfillFetchPlanSummary,
  HistoricalBackfillFetchPlannerWindow,
} from "@/lib/historical-backfill-fetch-planner";

export type TwelveDataHistoricalEndpoint =
  | "time_series"
  | "earliest_timestamp";

export type TwelveDataHistoricalInterval =
  | "1min"
  | "5min"
  | "15min"
  | "30min"
  | "1h"
  | "1day";

export type TwelveDataHistoricalRequest = {
  provider: "twelve_data";
  endpoint: TwelveDataHistoricalEndpoint;
  ticker: string;
  interval: TwelveDataHistoricalInterval;
  start_date: string;
  end_date: string;
  timezone: "America/New_York";
  outputsize: number | null;
  adjusted: boolean;
  order: "ASC" | "DESC";
  cache_key: string;
  dry_run: true;
  trading_day: string;
  window: string;
  covered_windows: HistoricalBackfillFetchPlannerWindow[];
};

export type TwelveDataHistoricalRequestValidation = {
  valid: boolean;
  missing_fields: string[];
  reason_codes: string[];
  ticker: string | null;
  cache_key: string | null;
};

export type TwelveDataHistoricalRequestPlan = {
  planned_requests: TwelveDataHistoricalRequest[];
  grouped_by_ticker: Record<string, number>;
  grouped_by_day: Record<string, number>;
  grouped_by_window: Record<string, number>;
};

export type TwelveDataHistoricalFetchContractInput = {
  historical_backfill_fetch_plan?: HistoricalBackfillFetchPlanSummary | null;
  now?: Date | string | null;
};

export type TwelveDataHistoricalFetchContractSummary = {
  advisory_only: true;
  dry_run_only: true;
  provider_contract: {
    provider: "twelve_data";
    supported_endpoints: TwelveDataHistoricalEndpoint[];
    preferred_endpoint: "time_series";
    earliest_timestamp_check_supported: true;
    preferred_interval: "5min";
    timezone: "America/New_York";
    adjusted_default: false;
  };
  endpoint_strategy: {
    earliest_timestamp_strategy: string;
    time_series_strategy: string;
    cache_lookup_strategy: string;
    grouping_strategy: string;
    official_windows_covered: HistoricalBackfillFetchPlannerWindow[];
    provider_calls_allowed: false;
  };
  request_validation: {
    requests_planned: number;
    valid_requests: number;
    invalid_requests: number;
    missing_field_counts: Record<string, number>;
    invalid_examples: Array<{
      ticker: string | null;
      cache_key: string | null;
      reason_codes: string[];
      missing_fields: string[];
    }>;
  };
  request_plan: TwelveDataHistoricalRequestPlan;
  cache_policy: {
    reuse_before_fetch: true;
    cache_key_required: true;
    dedupe_required: true;
    fetch_run_audit_required: true;
  };
  budget_policy: {
    estimated_provider_credits: number | null;
    max_background_requests_per_minute: number | null;
    pause_near_scan_windows: true;
    pause_on_provider_warnings: true;
    live_scan_priority: "highest";
    outcome_evaluation_priority: "high";
    background_priority: "low";
  };
  readiness: {
    ready_to_build_requests: boolean;
    ready_to_call_provider: false;
    ready_to_persist_candles: false;
    ready_to_run_backfill: false;
    safe_to_affect_scanner: false;
  };
  safety: {
    advisory_only: true;
    dry_run_only: true;
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

const supportedEndpoints: TwelveDataHistoricalEndpoint[] = [
  "time_series",
  "earliest_timestamp",
];

const supportedIntervals: TwelveDataHistoricalInterval[] = [
  "1min",
  "5min",
  "15min",
  "30min",
  "1h",
  "1day",
];

const timezone = "America/New_York" as const;
const officialWindowStartMinutes = 9 * 60 + 45;
const officialWindowEndMinutes = 15 * 60 + 45;

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : null;
}

function parseDate(value: string | null | undefined) {
  if (!value || value.trim().length === 0) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function finiteDate(value: Date | string | null | undefined) {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isFinite(date.getTime()) ? date : new Date();
}

function nyParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(byType.get("year") ?? "0"),
    month: Number(byType.get("month") ?? "0"),
    day: Number(byType.get("day") ?? "0"),
    hour: Number(byType.get("hour") ?? "0"),
    minute: Number(byType.get("minute") ?? "0"),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(parts: ReturnType<typeof nyParts>) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function addDaysToDateKey(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return dateKey(nyParts(date));
}

function dayOfWeekForDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

function isWeekendDateKey(value: string) {
  const day = dayOfWeekForDateKey(value);
  return day === 0 || day === 6;
}

function previousWeekdayDateKey(value: string) {
  let cursor = addDaysToDateKey(value, -1);
  while (isWeekendDateKey(cursor)) {
    cursor = addDaysToDateKey(cursor, -1);
  }
  return cursor;
}

function tradingDaysBefore(input: {
  now?: Date | string | null;
  count: number;
}) {
  const now = finiteDate(input.now);
  const days: string[] = [];
  let cursor = dateKey(nyParts(now));

  while (days.length < input.count) {
    cursor = previousWeekdayDateKey(cursor);
    days.push(cursor);
  }

  return days;
}

function nyDateTimeToUtcIso(date: string, minutesAfterMidnight: number) {
  const [year, month, day] = date.split("-").map(Number);
  const hour = Math.floor(minutesAfterMidnight / 60);
  const minute = minutesAfterMidnight % 60;
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const formatted = nyParts(new Date(utcGuess));
  const formattedAsUtc = Date.UTC(
    formatted.year,
    formatted.month - 1,
    formatted.day,
    formatted.hour,
    formatted.minute,
    0,
  );
  return new Date(utcGuess - (formattedAsUtc - utcGuess)).toISOString();
}

export function validateTwelveDataHistoricalRequest(
  request: Partial<TwelveDataHistoricalRequest> | null | undefined,
): TwelveDataHistoricalRequestValidation {
  const row = request ?? {};
  const missingFields: string[] = [];
  const reasonCodes: string[] = [];
  const ticker = normalizeTicker(row.ticker ?? null);
  const cacheKey = row.cache_key?.trim() || null;
  const startDate = parseDate(row.start_date ?? null);
  const endDate = parseDate(row.end_date ?? null);

  if (row.provider !== "twelve_data") reasonCodes.push("unsupported_provider");
  if (!row.endpoint) {
    missingFields.push("endpoint");
  } else if (!supportedEndpoints.includes(row.endpoint)) {
    reasonCodes.push("unsupported_endpoint");
  }
  if (!ticker) missingFields.push("ticker");
  if (!row.interval) {
    missingFields.push("interval");
  } else if (!supportedIntervals.includes(row.interval)) {
    reasonCodes.push("unsupported_interval");
  }
  if (!startDate) missingFields.push("start_date");
  if (!endDate) missingFields.push("end_date");
  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    reasonCodes.push("end_date_before_start_date");
  }
  if (!row.timezone) missingFields.push("timezone");
  if (!cacheKey) missingFields.push("cache_key");
  if (row.dry_run !== true) reasonCodes.push("dry_run_required");

  if (missingFields.length > 0) {
    reasonCodes.push("missing_required_fields");
  }

  return {
    valid: missingFields.length === 0 && reasonCodes.length === 0,
    missing_fields: missingFields,
    reason_codes: reasonCodes,
    ticker,
    cache_key: cacheKey,
  };
}

export function buildTwelveDataHistoricalRequestPlan(
  input: TwelveDataHistoricalFetchContractInput = {},
): TwelveDataHistoricalRequestPlan {
  const fetchPlan = input.historical_backfill_fetch_plan ?? null;
  const selectedTickers = fetchPlan?.ticker_selection.selected_tickers ?? [];
  const interval = fetchPlan?.plan_context.preferred_interval ?? "5min";
  const historyDays = fetchPlan?.plan_context.history_days_planned ?? 0;
  const coveredWindows =
    fetchPlan?.plan_context.windows.length === 0 || !fetchPlan
      ? (["morning", "midday", "power_hour"] satisfies HistoricalBackfillFetchPlannerWindow[])
      : fetchPlan.plan_context.windows;
  const tradingDays = tradingDaysBefore({
    now: input.now,
    count: Math.max(0, historyDays),
  });
  const plannedRequests: TwelveDataHistoricalRequest[] = [];
  const groupedByTicker: Record<string, number> = {};
  const groupedByDay: Record<string, number> = {};
  const groupedByWindow: Record<string, number> = {};

  for (const ticker of selectedTickers) {
    const normalizedTicker = normalizeTicker(ticker);
    if (!normalizedTicker) continue;

    for (const tradingDay of tradingDays) {
      const request: TwelveDataHistoricalRequest = {
        provider: "twelve_data",
        endpoint: "time_series",
        ticker: normalizedTicker,
        interval,
        start_date: nyDateTimeToUtcIso(
          tradingDay,
          officialWindowStartMinutes,
        ),
        end_date: nyDateTimeToUtcIso(tradingDay, officialWindowEndMinutes),
        timezone,
        outputsize: null,
        adjusted: false,
        order: "ASC",
        cache_key: buildHistoricalCandleCacheKey({
          provider: "twelve_data",
          ticker: normalizedTicker,
          interval,
          trading_day: tradingDay,
          window: "official_windows",
          timezone,
          adjusted: false,
        }),
        dry_run: true,
        trading_day: tradingDay,
        window: "official_windows",
        covered_windows: coveredWindows,
      };

      plannedRequests.push(request);
      increment(groupedByTicker, normalizedTicker);
      increment(groupedByDay, tradingDay);
      increment(groupedByWindow, request.window);
    }
  }

  return {
    planned_requests: plannedRequests,
    grouped_by_ticker: groupedByTicker,
    grouped_by_day: groupedByDay,
    grouped_by_window: groupedByWindow,
  };
}

export function buildTwelveDataHistoricalFetchContract(
  input: TwelveDataHistoricalFetchContractInput = {},
): TwelveDataHistoricalFetchContractSummary {
  const fetchPlan = input.historical_backfill_fetch_plan ?? null;
  const requestPlan = buildTwelveDataHistoricalRequestPlan(input);
  const validations = requestPlan.planned_requests.map(
    validateTwelveDataHistoricalRequest,
  );
  const missingFieldCounts: Record<string, number> = {};
  const reasonCodes = ["twelve_data_historical_fetch_contract_dry_run_only"];
  const cautionFlags = [
    "dry_run_only",
    "provider_fetch_not_enabled",
    "candle_persistence_not_enabled",
  ];
  const metadataGaps: string[] = [];

  for (const validation of validations) {
    for (const field of validation.missing_fields) {
      increment(missingFieldCounts, field);
      pushUnique(metadataGaps, field);
    }
    for (const reason of validation.reason_codes) {
      pushUnique(reasonCodes, reason);
    }
  }

  if (!fetchPlan) {
    metadataGaps.push("historical_backfill_fetch_plan_missing");
    cautionFlags.push("request_plan_not_available");
  }
  if ((fetchPlan?.ticker_selection.selected_tickers.length ?? 0) === 0) {
    metadataGaps.push("selected_tickers_missing");
  }
  if ((fetchPlan?.plan_context.history_days_planned ?? 0) <= 0) {
    metadataGaps.push("history_days_missing");
  }
  if (validations.some((item) => !item.valid)) {
    cautionFlags.push("invalid_dry_run_requests");
  }
  if (fetchPlan?.readiness.migration_applied !== "yes") {
    cautionFlags.push("migration_not_verified_for_future_fetch");
  }

  const validRequests = validations.filter((item) => item.valid).length;
  const invalidRequests = validations.length - validRequests;
  const readyToBuildRequests =
    requestPlan.planned_requests.length > 0 && invalidRequests === 0;

  return {
    advisory_only: true,
    dry_run_only: true,
    provider_contract: {
      provider: "twelve_data",
      supported_endpoints: supportedEndpoints,
      preferred_endpoint: "time_series",
      earliest_timestamp_check_supported: true,
      preferred_interval: "5min",
      timezone,
      adjusted_default: false,
    },
    endpoint_strategy: {
      earliest_timestamp_strategy:
        "Use earliest_timestamp later to inspect available depth by ticker and interval before requesting candles.",
      time_series_strategy:
        "Use time_series later for one cacheable official-window candle request per ticker and trading day.",
      cache_lookup_strategy:
        "Check historical_candles by cache key before any future provider request.",
      grouping_strategy:
        "Group by ticker and trading day, covering morning, midday, and power hour windows with one dry-run request.",
      official_windows_covered:
        fetchPlan?.plan_context.windows ??
        (["morning", "midday", "power_hour"] satisfies HistoricalBackfillFetchPlannerWindow[]),
      provider_calls_allowed: false,
    },
    request_validation: {
      requests_planned: requestPlan.planned_requests.length,
      valid_requests: validRequests,
      invalid_requests: invalidRequests,
      missing_field_counts: missingFieldCounts,
      invalid_examples: validations
        .filter((item) => !item.valid)
        .slice(0, 6)
        .map((item) => ({
          ticker: item.ticker,
          cache_key: item.cache_key,
          reason_codes: item.reason_codes,
          missing_fields: item.missing_fields,
        })),
    },
    request_plan: requestPlan,
    cache_policy: {
      reuse_before_fetch: true,
      cache_key_required: true,
      dedupe_required: true,
      fetch_run_audit_required: true,
    },
    budget_policy: {
      estimated_provider_credits:
        requestPlan.planned_requests.length > 0
          ? requestPlan.planned_requests.length
          : null,
      max_background_requests_per_minute:
        fetchPlan?.budget_policy.max_background_requests_per_minute ?? null,
      pause_near_scan_windows: true,
      pause_on_provider_warnings: true,
      live_scan_priority: "highest",
      outcome_evaluation_priority: "high",
      background_priority: "low",
    },
    readiness: {
      ready_to_build_requests: readyToBuildRequests,
      ready_to_call_provider: false,
      ready_to_persist_candles: false,
      ready_to_run_backfill: false,
      safe_to_affect_scanner: false,
    },
    safety: {
      advisory_only: true,
      dry_run_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      synthetic_outcomes_persisted: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    recommended_next_steps: [
      "review_dry_run_requests_against_provider_budget",
      "verify_cache_key_matches_historical_candle_storage_unique_key",
      "add_cache_lookup_before_any_future_provider_fetch",
      "keep_live_scan_and_outcome_priorities_above_background_fetch",
      "require_separate_approval_before_enabling_twelve_data_fetch",
    ],
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
  };
}

export function twelveDataHistoricalFetchContractJson(
  summary: TwelveDataHistoricalFetchContractSummary,
) {
  return JSON.stringify(summary, null, 2);
}
