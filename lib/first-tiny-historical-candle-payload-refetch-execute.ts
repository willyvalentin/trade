import {
  buildFirstTinyHistoricalCandlePayloadRefetchPlan,
  type FirstTinyHistoricalCandlePayloadRefetchPlanSummary,
} from "@/lib/first-tiny-historical-candle-payload-refetch-plan";
import {
  parseTwelveDataHistoricalResponse,
  type TwelveDataHistoricalRawResponse,
} from "@/lib/twelve-data-historical-response-parser";

export const firstTinyHistoricalCandlePayloadRefetchExecuteMarker =
  "action_284_first_tiny_candle_payload_refetch_execute_attempt";

export type FirstTinyHistoricalCandlePayloadRefetchExecutionStatus =
  | "blocked"
  | "not_approved"
  | "ready_with_valid_signal"
  | "payload_refetch_cache_hit_no_provider_call"
  | "payload_refetch_completed_no_persist"
  | "payload_refetch_failed_no_persist";

export type FirstTinyHistoricalCandlePayloadRow = {
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  timestamp: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  adjusted: false;
  trading_day: "2026-07-08";
  session: "regular";
  timezone: "America/New_York";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
};

export type FirstTinyHistoricalCandlePayloadRefetchCacheLookupResult = {
  available: boolean;
  hit: boolean;
  source?: string | null;
  candles?: FirstTinyHistoricalCandlePayloadRow[] | null;
};

export type FirstTinyHistoricalCandlePayloadRefetchProviderCallResult = {
  ok: boolean;
  http_status: number | null;
  response?: TwelveDataHistoricalRawResponse | null;
  error_type?: string | null;
};

export type FirstTinyHistoricalCandlePayloadRefetchExecuteInput = {
  execute_payload_refetch?: boolean | null;
  refetch_plan?: FirstTinyHistoricalCandlePayloadRefetchPlanSummary | null;
  cache_lookup?: () =>
    | FirstTinyHistoricalCandlePayloadRefetchCacheLookupResult
    | Promise<FirstTinyHistoricalCandlePayloadRefetchCacheLookupResult>;
  provider_call?: () =>
    | FirstTinyHistoricalCandlePayloadRefetchProviderCallResult
    | Promise<FirstTinyHistoricalCandlePayloadRefetchProviderCallResult>;
};

export type FirstTinyHistoricalCandlePayloadRefetchExecuteSummary = {
  route_build_marker: typeof firstTinyHistoricalCandlePayloadRefetchExecuteMarker;
  execution_status: FirstTinyHistoricalCandlePayloadRefetchExecutionStatus;
  provider: "twelve_data";
  endpoint: "time_series";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  request_count: 1;
  estimated_credits: 1;
  existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  provider_call_executed: boolean;
  provider_call_succeeded: boolean;
  provider_call_attempted: boolean;
  http_status: number | null;
  provider_error_type: string | null;
  cache_lookup_attempted: boolean;
  cache_hit: boolean;
  cache_hit_source: string | null;
  raw_candles: number;
  normalized_candles: number;
  valid_candles: number;
  invalid_candles: number;
  duplicate_timestamps: number;
  out_of_order_candles: number;
  normalized_payload_available: boolean;
  normalized_payload_returned: boolean;
  normalized_payload_response_only: true;
  normalized_payload: FirstTinyHistoricalCandlePayloadRow[];
  blockers: string[];
  warnings: string[];
  approval_status: string;
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  recommended_next_steps: string[];
  safety: {
    provider_call_executed: boolean;
    provider_call_max_one_request: true;
    normalized_payload_response_only: true;
    api_key_included_in_response: false;
    raw_response_persisted: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
  };
};

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function defaultProviderApiKey() {
  return process.env.TWELVE_DATA_API_KEY?.trim() ?? "";
}

async function defaultCacheLookup(): Promise<FirstTinyHistoricalCandlePayloadRefetchCacheLookupResult> {
  return {
    available: true,
    hit: false,
    source: "default_noop_cache_lookup",
  };
}

async function defaultProviderCall(): Promise<FirstTinyHistoricalCandlePayloadRefetchProviderCallResult> {
  const apiKey = defaultProviderApiKey();
  if (!apiKey) {
    return {
      ok: false,
      http_status: null,
      response: null,
      error_type: "provider_api_key_missing",
    };
  }

  const url = new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol", "AAPL");
  url.searchParams.set("interval", "5min");
  url.searchParams.set("timezone", "America/New_York");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("order", "ASC");
  url.searchParams.set("start_date", "2026-07-08T13:45:00.000Z");
  url.searchParams.set("end_date", "2026-07-08T19:45:00.000Z");
  url.searchParams.set("dp", "6");

  try {
    const response = await fetch(url);
    const json = (await response.json().catch(() => null)) as
      | TwelveDataHistoricalRawResponse
      | null;

    return {
      ok: response.ok && json?.status !== "error",
      http_status: response.status,
      response: json,
      error_type:
        response.ok && json?.status !== "error"
          ? null
          : json?.message
            ? "provider_error_response"
            : "provider_http_error",
    };
  } catch {
    return {
      ok: false,
      http_status: null,
      response: null,
      error_type: "provider_fetch_failed",
    };
  }
}

function normalizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePayloadRow(row: Record<string, unknown>): FirstTinyHistoricalCandlePayloadRow {
  return {
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    timestamp: typeof row.timestamp === "string" ? row.timestamp : null,
    open: normalizeNumber(row.open),
    high: normalizeNumber(row.high),
    low: normalizeNumber(row.low),
    close: normalizeNumber(row.close),
    volume: normalizeNumber(row.volume),
    adjusted: false,
    trading_day: "2026-07-08",
    session: "regular",
    timezone: "America/New_York",
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
  };
}

function attachFetchRunId(
  rows: Array<Record<string, unknown>>,
): FirstTinyHistoricalCandlePayloadRow[] {
  return rows.map(normalizePayloadRow);
}

function parserCountsFromPayload(
  rows: FirstTinyHistoricalCandlePayloadRow[],
) {
  return {
    raw_candles: rows.length,
    normalized_candles: rows.length,
    valid_candles: rows.length,
    invalid_candles: 0,
    duplicate_timestamps: 0,
    out_of_order_candles: 0,
  };
}

function baseSummary(input: {
  status: FirstTinyHistoricalCandlePayloadRefetchExecutionStatus;
  plan: FirstTinyHistoricalCandlePayloadRefetchPlanSummary;
  providerCallExecuted?: boolean;
  providerCallSucceeded?: boolean;
  providerCallAttempted?: boolean;
  httpStatus?: number | null;
  providerErrorType?: string | null;
  cacheLookupAttempted?: boolean;
  cacheHit?: boolean;
  cacheHitSource?: string | null;
  payload?: FirstTinyHistoricalCandlePayloadRow[];
  counts?: ReturnType<typeof parserCountsFromPayload>;
  blockers?: string[];
  warnings?: string[];
}): FirstTinyHistoricalCandlePayloadRefetchExecuteSummary {
  const payload = input.payload ?? [];
  const counts = input.counts ?? {
    raw_candles: 0,
    normalized_candles: 0,
    valid_candles: 0,
    invalid_candles: 0,
    duplicate_timestamps: 0,
    out_of_order_candles: 0,
  };

  return {
    route_build_marker: firstTinyHistoricalCandlePayloadRefetchExecuteMarker,
    execution_status: input.status,
    provider: "twelve_data",
    endpoint: "time_series",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    request_count: 1,
    estimated_credits: 1,
    existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    provider_call_executed: input.providerCallExecuted ?? false,
    provider_call_succeeded: input.providerCallSucceeded ?? false,
    provider_call_attempted: input.providerCallAttempted ?? false,
    http_status: input.httpStatus ?? null,
    provider_error_type: input.providerErrorType ?? null,
    cache_lookup_attempted: input.cacheLookupAttempted ?? false,
    cache_hit: input.cacheHit ?? false,
    cache_hit_source: input.cacheHitSource ?? null,
    raw_candles: counts.raw_candles,
    normalized_candles: counts.normalized_candles,
    valid_candles: counts.valid_candles,
    invalid_candles: counts.invalid_candles,
    duplicate_timestamps: counts.duplicate_timestamps,
    out_of_order_candles: counts.out_of_order_candles,
    normalized_payload_available: payload.length > 0,
    normalized_payload_returned: payload.length > 0,
    normalized_payload_response_only: true,
    normalized_payload: payload,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    approval_status: input.plan.approval_status,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommended_next_steps:
      input.status === "payload_refetch_completed_no_persist" ||
      input.status === "payload_refetch_cache_hit_no_provider_call"
        ? [
            "disable_payload_refetch_approval_signal_after_success",
            "review_payload_before_candle_persistence_plan",
            "require_separate_approval_before_candle_write",
          ]
        : input.status === "not_approved"
          ? ["configure_valid_payload_refetch_approval_signal"]
          : ["resolve_payload_refetch_execute_blockers"],
    safety: {
      provider_call_executed: input.providerCallExecuted ?? false,
      provider_call_max_one_request: true,
      normalized_payload_response_only: true,
      api_key_included_in_response: false,
      raw_response_persisted: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
  };
}

export function buildFirstTinyHistoricalCandlePayloadRefetchExecuteReadiness(
  input: {
    refetch_plan?: FirstTinyHistoricalCandlePayloadRefetchPlanSummary | null;
  } = {},
): FirstTinyHistoricalCandlePayloadRefetchExecuteSummary {
  const plan =
    input.refetch_plan ?? buildFirstTinyHistoricalCandlePayloadRefetchPlan();
  const status: FirstTinyHistoricalCandlePayloadRefetchExecutionStatus =
    plan.approval_status === "valid_for_future_payload_refetch"
      ? "ready_with_valid_signal"
      : plan.approval_status === "not_configured"
        ? "not_approved"
        : "blocked";

  return baseSummary({
    status,
    plan,
    blockers: plan.blockers,
    warnings: ["diagnostics_only_refetch_not_executed"],
  });
}

export async function executeFirstTinyHistoricalCandlePayloadRefetch(
  input: FirstTinyHistoricalCandlePayloadRefetchExecuteInput = {},
): Promise<FirstTinyHistoricalCandlePayloadRefetchExecuteSummary> {
  const plan =
    input.refetch_plan ?? buildFirstTinyHistoricalCandlePayloadRefetchPlan();
  const blockers = [...plan.blockers];

  if (input.execute_payload_refetch !== true) {
    pushUnique(blockers, "execute_payload_refetch_true_required");
    return baseSummary({
      status: "blocked",
      plan,
      blockers,
      warnings: ["provider_refetch_not_executed"],
    });
  }

  if (plan.approval_status === "not_configured") {
    return baseSummary({
      status: "not_approved",
      plan,
      blockers,
      warnings: ["payload_refetch_approval_signal_missing"],
    });
  }

  if (plan.approval_status !== "valid_for_future_payload_refetch") {
    return baseSummary({
      status: "blocked",
      plan,
      blockers,
      warnings: ["payload_refetch_approval_signal_invalid"],
    });
  }

  const cacheLookup = input.cache_lookup ?? defaultCacheLookup;
  const cacheResult = await cacheLookup();
  if (!cacheResult.available) {
    pushUnique(blockers, "cache_lookup_unavailable");
    return baseSummary({
      status: "blocked",
      plan,
      cacheLookupAttempted: true,
      cacheHit: false,
      cacheHitSource: cacheResult.source ?? null,
      blockers,
      warnings: ["cache_lookup_required_before_provider_refetch"],
    });
  }

  if (cacheResult.hit) {
    const payload = cacheResult.candles ?? [];
    return baseSummary({
      status: "payload_refetch_cache_hit_no_provider_call",
      plan,
      cacheLookupAttempted: true,
      cacheHit: true,
      cacheHitSource: cacheResult.source ?? null,
      payload,
      counts: parserCountsFromPayload(payload),
      warnings: ["provider_call_skipped_due_cache_hit"],
    });
  }

  const providerCall = input.provider_call ?? defaultProviderCall;
  const result = await providerCall();
  if (!result.ok || !result.response) {
    pushUnique(blockers, result.error_type ?? "provider_call_failed");
    return baseSummary({
      status: "payload_refetch_failed_no_persist",
      plan,
      providerCallExecuted: true,
      providerCallAttempted: true,
      providerCallSucceeded: false,
      httpStatus: result.http_status,
      providerErrorType: result.error_type ?? "provider_call_failed",
      cacheLookupAttempted: true,
      cacheHit: false,
      cacheHitSource: cacheResult.source ?? null,
      blockers,
      warnings: ["provider_call_failed_without_persistence"],
    });
  }

  const parsed = parseTwelveDataHistoricalResponse({
    response: result.response,
    context: {
      ticker: "AAPL",
      interval: "5min",
      timezone: "America/New_York",
      adjusted: false,
      trading_day: "2026-07-08",
      session: "regular",
      cache_key:
        "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false",
    },
  });
  const payload = attachFetchRunId(parsed.candles as Array<Record<string, unknown>>);

  return baseSummary({
    status: "payload_refetch_completed_no_persist",
    plan,
    providerCallExecuted: true,
    providerCallAttempted: true,
    providerCallSucceeded: true,
    httpStatus: result.http_status,
    providerErrorType: null,
    cacheLookupAttempted: true,
    cacheHit: false,
    cacheHitSource: cacheResult.source ?? null,
    payload,
    counts: {
      raw_candles: parsed.validation.raw_candles_count,
      normalized_candles: parsed.validation.normalized_candles_count,
      valid_candles: parsed.validation.valid_candles_count,
      invalid_candles: parsed.validation.invalid_candles_count,
      duplicate_timestamps: parsed.validation.duplicate_timestamp_count,
      out_of_order_candles: parsed.validation.out_of_order_count,
    },
    warnings: ["normalized_payload_response_only_not_persisted"],
  });
}
