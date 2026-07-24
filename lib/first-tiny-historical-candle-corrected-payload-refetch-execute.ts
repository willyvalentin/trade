import {
  buildFirstTinyCorrectedPayloadRefetchApproval,
  type FirstTinyCorrectedPayloadRefetchApprovalSummary,
} from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-approval";
import {
  buildFirstTinyCorrectedCandlePayloadRefetchPlan,
  type FirstTinyCorrectedPayloadRefetchPlan,
} from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-plan";
import {
  parseTwelveDataHistoricalResponse,
  type TwelveDataHistoricalRawResponse,
} from "@/lib/twelve-data-historical-response-parser";

export const firstTinyCorrectedCandlePayloadRefetchExecuteMarker =
  "action_289_corrected_first_tiny_candle_payload_refetch_execute_attempt";

export type FirstTinyCorrectedPayloadRefetchExecutionStatus =
  | "blocked"
  | "not_approved"
  | "ready_with_valid_signal"
  | "corrected_payload_refetch_cache_hit_no_provider_call"
  | "corrected_payload_refetch_completed_no_persist"
  | "corrected_payload_refetch_window_mismatch_no_persist"
  | "corrected_payload_refetch_failed_no_persist";

export type FirstTinyCorrectedCandlePayloadRow = {
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

export type FirstTinyCorrectedPayloadRefetchCacheLookupResult = {
  available: boolean;
  hit: boolean;
  source?: string | null;
  candles?: FirstTinyCorrectedCandlePayloadRow[] | null;
};

export type FirstTinyCorrectedPayloadRefetchProviderCallResult = {
  ok: boolean;
  http_status: number | null;
  response?: TwelveDataHistoricalRawResponse | null;
  error_type?: string | null;
};

export type FirstTinyCorrectedPayloadRefetchExecuteInput = {
  execute_corrected_payload_refetch?: boolean | null;
  corrected_plan?: FirstTinyCorrectedPayloadRefetchPlan | null;
  approval?: FirstTinyCorrectedPayloadRefetchApprovalSummary | null;
  cache_lookup?: () =>
    | FirstTinyCorrectedPayloadRefetchCacheLookupResult
    | Promise<FirstTinyCorrectedPayloadRefetchCacheLookupResult>;
  provider_call?: () =>
    | FirstTinyCorrectedPayloadRefetchProviderCallResult
    | Promise<FirstTinyCorrectedPayloadRefetchProviderCallResult>;
};

export type FirstTinyCorrectedPayloadRefetchExecuteSummary = {
  route_build_marker: typeof firstTinyCorrectedCandlePayloadRefetchExecuteMarker;
  execution_status: FirstTinyCorrectedPayloadRefetchExecutionStatus;
  strategy_id: "full_day_fetch_then_filter_locally";
  provider: "twelve_data";
  endpoint: "time_series";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  request_count: 1;
  estimated_credits: 1;
  existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  intended_ny_window: "09:45 -> 15:45";
  intended_utc_start: "2026-07-08T13:45:00.000Z";
  intended_utc_end: "2026-07-08T19:45:00.000Z";
  accepted_window_end_inclusive: true;
  expected_filtered_candles: number;
  provider_request: {
    symbol: "AAPL";
    interval: "5min";
    timezone: "America/New_York";
    start_date: "2026-07-08 09:30:00";
    end_date: "2026-07-08 16:00:00";
    order: "ASC";
    outputsize: 100;
    adjusted: false;
  };
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
  filtered_candles: number;
  valid_filtered_candles: number;
  invalid_filtered_candles: number;
  duplicate_timestamps: number;
  out_of_order_candles: number;
  filtered_first_timestamp: string | null;
  filtered_last_timestamp: string | null;
  filtered_window_matches_intended: boolean;
  normalized_payload_available: boolean;
  normalized_payload_returned: boolean;
  normalized_payload_response_only: true;
  normalized_payload: FirstTinyCorrectedCandlePayloadRow[];
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

const intendedStart = "2026-07-08T13:45:00.000Z";
const intendedEnd = "2026-07-08T19:45:00.000Z";
const intervalMs = 5 * 60 * 1000;

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function defaultProviderApiKey() {
  return process.env.TWELVE_DATA_API_KEY?.trim() ?? "";
}

async function defaultCacheLookup(): Promise<FirstTinyCorrectedPayloadRefetchCacheLookupResult> {
  return {
    available: true,
    hit: false,
    source: "default_noop_cache_lookup",
  };
}

async function defaultProviderCall(): Promise<FirstTinyCorrectedPayloadRefetchProviderCallResult> {
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
  url.searchParams.set("start_date", "2026-07-08 09:30:00");
  url.searchParams.set("end_date", "2026-07-08 16:00:00");
  url.searchParams.set("outputsize", "100");
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

function normalizePayloadRow(
  row: Record<string, unknown>,
): FirstTinyCorrectedCandlePayloadRow {
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
): FirstTinyCorrectedCandlePayloadRow[] {
  return rows.map(normalizePayloadRow);
}

function timestampMs(row: FirstTinyCorrectedCandlePayloadRow) {
  if (!row.timestamp) return null;
  const parsed = new Date(row.timestamp).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function expectedFilteredCount() {
  return (
    Math.floor(
      (new Date(intendedEnd).getTime() - new Date(intendedStart).getTime()) /
        intervalMs,
    ) + 1
  );
}

function filterToIntendedWindow(rows: FirstTinyCorrectedCandlePayloadRow[]) {
  const start = new Date(intendedStart).getTime();
  const end = new Date(intendedEnd).getTime();

  return rows
    .filter((row) => {
      const value = timestampMs(row);
      return value !== null && value >= start && value <= end;
    })
    .sort((first, second) => (timestampMs(first) ?? 0) - (timestampMs(second) ?? 0));
}

function duplicateTimestampCount(rows: FirstTinyCorrectedCandlePayloadRow[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const row of rows) {
    if (!row.timestamp) continue;
    const key = `${row.ticker}:${row.interval}:${row.timestamp}`;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }

  return duplicates.size;
}

function outOfOrderCount(rows: FirstTinyCorrectedCandlePayloadRow[]) {
  let previous: number | null = null;
  let count = 0;

  for (const row of rows) {
    const current = timestampMs(row);
    if (current === null) continue;
    if (previous !== null && current < previous) count += 1;
    previous = current;
  }

  return count;
}

function windowMatches(rows: FirstTinyCorrectedCandlePayloadRow[]) {
  const expected = expectedFilteredCount();
  const first = rows[0]?.timestamp ?? null;
  const last = rows.at(-1)?.timestamp ?? null;

  return (
    rows.length === expected &&
    first === intendedStart &&
    last === intendedEnd &&
    duplicateTimestampCount(rows) === 0 &&
    outOfOrderCount(rows) === 0
  );
}

function filteredCounts(input: {
  rawCandles?: number;
  normalizedCandles?: number;
  rows: FirstTinyCorrectedCandlePayloadRow[];
}) {
  const duplicateCount = duplicateTimestampCount(input.rows);
  const outOfOrder = outOfOrderCount(input.rows);
  const matches = windowMatches(input.rows);

  return {
    raw_candles: input.rawCandles ?? input.rows.length,
    normalized_candles: input.normalizedCandles ?? input.rows.length,
    filtered_candles: input.rows.length,
    valid_filtered_candles: matches ? input.rows.length : 0,
    invalid_filtered_candles: matches ? 0 : input.rows.length,
    duplicate_timestamps: duplicateCount,
    out_of_order_candles: outOfOrder,
    filtered_first_timestamp: input.rows[0]?.timestamp ?? null,
    filtered_last_timestamp: input.rows.at(-1)?.timestamp ?? null,
    filtered_window_matches_intended: matches,
  };
}

function baseSummary(input: {
  status: FirstTinyCorrectedPayloadRefetchExecutionStatus;
  plan: FirstTinyCorrectedPayloadRefetchPlan;
  approval: FirstTinyCorrectedPayloadRefetchApprovalSummary;
  providerCallExecuted?: boolean;
  providerCallSucceeded?: boolean;
  providerCallAttempted?: boolean;
  httpStatus?: number | null;
  providerErrorType?: string | null;
  cacheLookupAttempted?: boolean;
  cacheHit?: boolean;
  cacheHitSource?: string | null;
  payload?: FirstTinyCorrectedCandlePayloadRow[];
  counts?: ReturnType<typeof filteredCounts>;
  blockers?: string[];
  warnings?: string[];
}): FirstTinyCorrectedPayloadRefetchExecuteSummary {
  const payload = input.payload ?? [];
  const counts =
    input.counts ??
    filteredCounts({
      rows: payload,
    });

  return {
    route_build_marker: firstTinyCorrectedCandlePayloadRefetchExecuteMarker,
    execution_status: input.status,
    strategy_id: input.plan.recommended_strategy_id,
    provider: "twelve_data",
    endpoint: "time_series",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    request_count: 1,
    estimated_credits: 1,
    existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    intended_ny_window: "09:45 -> 15:45",
    intended_utc_start: intendedStart,
    intended_utc_end: intendedEnd,
    accepted_window_end_inclusive: true,
    expected_filtered_candles: expectedFilteredCount(),
    provider_request: {
      symbol: "AAPL",
      interval: "5min",
      timezone: "America/New_York",
      start_date: "2026-07-08 09:30:00",
      end_date: "2026-07-08 16:00:00",
      order: "ASC",
      outputsize: 100,
      adjusted: false,
    },
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
    filtered_candles: counts.filtered_candles,
    valid_filtered_candles: counts.valid_filtered_candles,
    invalid_filtered_candles: counts.invalid_filtered_candles,
    duplicate_timestamps: counts.duplicate_timestamps,
    out_of_order_candles: counts.out_of_order_candles,
    filtered_first_timestamp: counts.filtered_first_timestamp,
    filtered_last_timestamp: counts.filtered_last_timestamp,
    filtered_window_matches_intended: counts.filtered_window_matches_intended,
    normalized_payload_available: payload.length > 0,
    normalized_payload_returned: payload.length > 0,
    normalized_payload_response_only: true,
    normalized_payload: payload,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    approval_status: input.approval.approval_status,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommended_next_steps:
      input.status === "corrected_payload_refetch_completed_no_persist" ||
      input.status === "corrected_payload_refetch_cache_hit_no_provider_call"
        ? [
            "disable_corrected_payload_refetch_approval_signal_after_success",
            "verify_corrected_payload_result_before_candle_persistence_plan",
            "require_separate_approval_before_candle_write",
          ]
        : input.status === "not_approved"
          ? ["configure_valid_corrected_payload_refetch_approval_signal"]
          : ["resolve_corrected_payload_refetch_execute_blockers"],
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

export function buildFirstTinyCorrectedPayloadRefetchExecuteReadiness(
  input: {
    corrected_plan?: FirstTinyCorrectedPayloadRefetchPlan | null;
    approval?: FirstTinyCorrectedPayloadRefetchApprovalSummary | null;
  } = {},
): FirstTinyCorrectedPayloadRefetchExecuteSummary {
  const plan =
    input.corrected_plan ?? buildFirstTinyCorrectedCandlePayloadRefetchPlan();
  const approval =
    input.approval ??
    buildFirstTinyCorrectedPayloadRefetchApproval({ corrected_plan: plan });
  const status: FirstTinyCorrectedPayloadRefetchExecutionStatus =
    approval.approval_status === "valid_for_future_corrected_payload_refetch"
      ? "ready_with_valid_signal"
      : approval.approval_status === "not_configured"
        ? "not_approved"
        : "blocked";

  return baseSummary({
    status,
    plan,
    approval,
    blockers: approval.blockers,
    warnings: ["diagnostics_only_corrected_refetch_not_executed"],
  });
}

export async function executeFirstTinyCorrectedPayloadRefetch(
  input: FirstTinyCorrectedPayloadRefetchExecuteInput = {},
): Promise<FirstTinyCorrectedPayloadRefetchExecuteSummary> {
  const plan =
    input.corrected_plan ?? buildFirstTinyCorrectedCandlePayloadRefetchPlan();
  const approval =
    input.approval ??
    buildFirstTinyCorrectedPayloadRefetchApproval({ corrected_plan: plan });
  const blockers = [...approval.blockers];

  if (input.execute_corrected_payload_refetch !== true) {
    pushUnique(blockers, "execute_corrected_payload_refetch_true_required");
    return baseSummary({
      status: "blocked",
      plan,
      approval,
      blockers,
      warnings: ["provider_refetch_not_executed"],
    });
  }

  if (approval.approval_status === "not_configured") {
    return baseSummary({
      status: "not_approved",
      plan,
      approval,
      blockers,
      warnings: ["corrected_payload_refetch_approval_signal_missing"],
    });
  }

  if (approval.approval_status !== "valid_for_future_corrected_payload_refetch") {
    return baseSummary({
      status: "blocked",
      plan,
      approval,
      blockers,
      warnings: ["corrected_payload_refetch_approval_signal_invalid"],
    });
  }

  const cacheLookup = input.cache_lookup ?? defaultCacheLookup;
  const cacheResult = await cacheLookup();
  if (!cacheResult.available) {
    pushUnique(blockers, "cache_lookup_unavailable");
    return baseSummary({
      status: "blocked",
      plan,
      approval,
      cacheLookupAttempted: true,
      cacheHit: false,
      cacheHitSource: cacheResult.source ?? null,
      blockers,
      warnings: ["cache_lookup_required_before_corrected_provider_refetch"],
    });
  }

  if (cacheResult.hit) {
    const filtered = filterToIntendedWindow(cacheResult.candles ?? []);
    const counts = filteredCounts({
      rows: filtered,
    });
    const status: FirstTinyCorrectedPayloadRefetchExecutionStatus =
      counts.filtered_window_matches_intended
        ? "corrected_payload_refetch_cache_hit_no_provider_call"
        : "corrected_payload_refetch_window_mismatch_no_persist";

    if (!counts.filtered_window_matches_intended) {
      pushUnique(blockers, "cache_filtered_window_mismatch");
    }

    return baseSummary({
      status,
      plan,
      approval,
      cacheLookupAttempted: true,
      cacheHit: true,
      cacheHitSource: cacheResult.source ?? null,
      payload: filtered,
      counts,
      blockers,
      warnings: counts.filtered_window_matches_intended
        ? ["provider_call_skipped_due_cache_hit"]
        : ["cache_hit_filtered_window_not_accepted"],
    });
  }

  const providerCall = input.provider_call ?? defaultProviderCall;
  const result = await providerCall();
  if (!result.ok || !result.response) {
    pushUnique(blockers, result.error_type ?? "provider_call_failed");
    return baseSummary({
      status: "corrected_payload_refetch_failed_no_persist",
      plan,
      approval,
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
  const normalized = attachFetchRunId(
    parsed.candles as Array<Record<string, unknown>>,
  );
  const filtered = filterToIntendedWindow(normalized);
  const counts = filteredCounts({
    rawCandles: parsed.validation.raw_candles_count,
    normalizedCandles: parsed.validation.normalized_candles_count,
    rows: filtered,
  });

  if (!counts.filtered_window_matches_intended) {
    if (counts.filtered_first_timestamp !== intendedStart) {
      pushUnique(blockers, "filtered_first_timestamp_mismatch");
    }
    if (counts.filtered_last_timestamp !== intendedEnd) {
      pushUnique(blockers, "filtered_last_timestamp_mismatch");
    }
    if (counts.filtered_candles !== expectedFilteredCount()) {
      pushUnique(blockers, "filtered_row_count_mismatch");
    }
    if (counts.duplicate_timestamps > 0) {
      pushUnique(blockers, "duplicate_timestamps");
    }
    if (counts.out_of_order_candles > 0) {
      pushUnique(blockers, "out_of_order_candles");
    }
  }

  return baseSummary({
    status: counts.filtered_window_matches_intended
      ? "corrected_payload_refetch_completed_no_persist"
      : "corrected_payload_refetch_window_mismatch_no_persist",
    plan,
    approval,
    providerCallExecuted: true,
    providerCallAttempted: true,
    providerCallSucceeded: true,
    httpStatus: result.http_status,
    providerErrorType: null,
    cacheLookupAttempted: true,
    cacheHit: false,
    cacheHitSource: cacheResult.source ?? null,
    payload: filtered,
    counts,
    blockers,
    warnings: counts.filtered_window_matches_intended
      ? ["normalized_filtered_payload_response_only_not_persisted"]
      : ["filtered_payload_window_not_accepted"],
  });
}
