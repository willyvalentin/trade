import {
  buildHistoricalBackfillFetchPlan,
  type HistoricalBackfillFetchPlannerInput,
  type HistoricalBackfillFetchPlanSummary,
} from "@/lib/historical-backfill-fetch-planner";
import {
  buildHistoricalCandlePersistencePlan,
  type HistoricalCandlePersistencePlanSummary,
} from "@/lib/historical-candle-persistence-plan";
import type { HistoricalCandleStorageReadinessSummary } from "@/lib/historical-candle-storage-readiness";
import {
  buildTwelveDataHistoricalFetchContract,
  type TwelveDataHistoricalFetchContractSummary,
  type TwelveDataHistoricalRequest,
} from "@/lib/twelve-data-historical-fetch-contract";
import {
  parseTwelveDataHistoricalResponse,
  type TwelveDataHistoricalRawResponse,
  type TwelveDataHistoricalResponseParserSummary,
} from "@/lib/twelve-data-historical-response-parser";

export type HistoricalBackfillDryRunPipelineStatus =
  | "ready"
  | "partial"
  | "blocked"
  | "empty";

export type HistoricalBackfillDryRunPipelineInput = {
  fetch_plan?: HistoricalBackfillFetchPlanSummary | null;
  fetch_plan_input?: HistoricalBackfillFetchPlannerInput | null;
  storage_readiness?: HistoricalCandleStorageReadinessSummary | null;
  mock_responses?: TwelveDataHistoricalRawResponse[] | null;
  existing_cache_keys?: string[] | null;
  now?: Date | string | null;
};

export type HistoricalBackfillDryRunPipelineSummary = {
  advisory_only: true;
  dry_run_only: true;
  mock_only: true;
  pipeline_status: HistoricalBackfillDryRunPipelineStatus;
  pipeline_steps: {
    fetch_plan_built: boolean;
    request_plan_built: boolean;
    mock_responses_parsed: boolean;
    candles_normalized: boolean;
    persistence_plan_built: boolean;
  };
  fetch_plan_summary: {
    selected_tickers: string[];
    history_days_planned: number;
    preferred_interval: string;
    planned_requests: number;
    estimated_provider_credits: number | null;
  };
  request_contract_summary: {
    requests_planned: number;
    valid_requests: number;
    invalid_requests: number;
    grouped_by_ticker: Record<string, number>;
    grouped_by_day: Record<string, number>;
  };
  parser_summary: {
    mock_responses_used: number;
    raw_candles: number;
    normalized_candles: number;
    valid_candles: number;
    invalid_candles: number;
    duplicate_timestamps: number;
    out_of_order_count: number;
  };
  persistence_summary: {
    candles_received: number;
    planned_inserts: number;
    planned_updates: number;
    planned_skips: number;
    planned_invalid_rejections: number;
    planned_duplicates_deduped: number;
    cache_hits: number;
    cache_misses: number;
  };
  readiness: {
    ready_to_run_mock_pipeline: boolean;
    ready_to_call_provider: false;
    ready_to_persist_candles: false;
    ready_to_create_synthetic_outcomes: false;
    ready_to_run_replay: false;
    ready_to_affect_scanner: false;
  };
  safety: {
    advisory_only: true;
    dry_run_only: true;
    mock_only: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
  recommended_next_steps: string[];
  blockers: string[];
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
  components: {
    fetch_plan: HistoricalBackfillFetchPlanSummary;
    request_contract: TwelveDataHistoricalFetchContractSummary;
    parsers: TwelveDataHistoricalResponseParserSummary[];
    persistence_plan: HistoricalCandlePersistencePlanSummary;
  };
};

function defaultMockResponse(ticker = "AAPL"): TwelveDataHistoricalRawResponse {
  return {
    meta: {
      symbol: ticker,
      interval: "5min",
      currency: "USD",
      exchange_timezone: "America/New_York",
      exchange: "NASDAQ",
      mic_code: "XNGS",
      type: "Common Stock",
    },
    values: Array.from({ length: 12 }, (_, index) => {
      const minute = 30 + index * 5;
      const hour = 9 + Math.floor(minute / 60);
      const minuteInHour = minute % 60;
      const open = 213 + index * 0.1;
      return {
        datetime: `2026-07-08 ${String(hour).padStart(2, "0")}:${String(minuteInHour).padStart(2, "0")}:00`,
        open: open.toFixed(2),
        high: (open + 0.45).toFixed(2),
        low: (open - 0.25).toFixed(2),
        close: (open + 0.2).toFixed(2),
        volume: String(120000 + index * 1000),
      };
    }),
    status: "ok",
  };
}

function parserContextFromRequest(request: TwelveDataHistoricalRequest | undefined) {
  if (!request) {
    return {
      ticker: "AAPL",
      interval: "5min",
      timezone: "America/New_York",
      adjusted: false,
      trading_day: "2026-07-08",
      session: "official_windows",
    };
  }

  return {
    ticker: request.ticker,
    interval: request.interval,
    timezone: request.timezone,
    adjusted: request.adjusted,
    trading_day: request.trading_day,
    session: request.window,
    cache_key: request.cache_key,
  };
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function aggregateParsers(
  parsers: TwelveDataHistoricalResponseParserSummary[],
) {
  return parsers.reduce(
    (summary, parser) => ({
      mock_responses_used: summary.mock_responses_used + 1,
      raw_candles:
        summary.raw_candles + parser.validation.raw_candles_count,
      normalized_candles:
        summary.normalized_candles +
        parser.validation.normalized_candles_count,
      valid_candles:
        summary.valid_candles + parser.validation.valid_candles_count,
      invalid_candles:
        summary.invalid_candles + parser.validation.invalid_candles_count,
      duplicate_timestamps:
        summary.duplicate_timestamps +
        parser.validation.duplicate_timestamp_count,
      out_of_order_count:
        summary.out_of_order_count + parser.validation.out_of_order_count,
    }),
    {
      mock_responses_used: 0,
      raw_candles: 0,
      normalized_candles: 0,
      valid_candles: 0,
      invalid_candles: 0,
      duplicate_timestamps: 0,
      out_of_order_count: 0,
    },
  );
}

export function buildHistoricalBackfillDryRunPipeline(
  input: HistoricalBackfillDryRunPipelineInput = {},
): HistoricalBackfillDryRunPipelineSummary {
  const fetchPlan =
    input.fetch_plan ??
    buildHistoricalBackfillFetchPlan(input.fetch_plan_input ?? {});
  const requestContract = buildTwelveDataHistoricalFetchContract({
    historical_backfill_fetch_plan: fetchPlan,
    now: input.now,
  });
  const plannedRequests = requestContract.request_plan.planned_requests;
  const responses =
    input.mock_responses && input.mock_responses.length > 0
      ? input.mock_responses
      : [defaultMockResponse(plannedRequests[0]?.ticker ?? "AAPL")];
  const parsers = responses.map((response, index) =>
    parseTwelveDataHistoricalResponse({
      response,
      context: parserContextFromRequest(plannedRequests[index]),
    }),
  );
  const normalizedCandles = parsers.flatMap((parser) => parser.candles);
  const persistencePlan = buildHistoricalCandlePersistencePlan({
    candles: normalizedCandles,
    storage_readiness: input.storage_readiness ?? null,
    existing_cache_keys: input.existing_cache_keys ?? null,
    fetch_run_metadata: {
      provider_credits_estimated:
        requestContract.budget_policy.estimated_provider_credits,
    },
  });
  const parserSummary = aggregateParsers(parsers);
  const blockers: string[] = [];
  const reasonCodes = ["historical_backfill_dry_run_pipeline_only"];
  const cautionFlags = ["dry_run_only", "mock_only"];
  const metadataGaps: string[] = [];

  if (fetchPlan.ticker_selection.selected_tickers.length === 0) {
    metadataGaps.push("selected_tickers_missing");
  }
  if (requestContract.request_validation.invalid_requests > 0) {
    blockers.push("invalid_dry_run_requests");
  }
  if (parserSummary.invalid_candles > 0) {
    cautionFlags.push("invalid_mock_candles_detected");
    pushUnique(reasonCodes, "invalid_mock_candles_detected");
  }
  if (persistencePlan.upsert_plan.planned_invalid_rejections > 0) {
    cautionFlags.push("persistence_rejections_planned");
  }
  if (parserSummary.normalized_candles === 0) {
    metadataGaps.push("normalized_candles_missing");
  }
  if (requestContract.request_validation.requests_planned === 0) {
    metadataGaps.push("dry_run_requests_missing");
  }

  const fetchPlanBuilt = true;
  const requestPlanBuilt =
    requestContract.request_validation.requests_planned > 0;
  const mockResponsesParsed = parsers.length > 0;
  const candlesNormalized = parserSummary.normalized_candles > 0;
  const persistencePlanBuilt = true;
  let pipelineStatus: HistoricalBackfillDryRunPipelineStatus = "ready";

  if (
    fetchPlan.ticker_selection.selected_tickers.length === 0 &&
    requestContract.request_validation.requests_planned === 0
  ) {
    pipelineStatus = "empty";
  } else if (blockers.length > 0) {
    pipelineStatus = "blocked";
  } else if (
    parserSummary.invalid_candles > 0 ||
    persistencePlan.upsert_plan.planned_invalid_rejections > 0 ||
    metadataGaps.length > 0
  ) {
    pipelineStatus = "partial";
  }

  return {
    advisory_only: true,
    dry_run_only: true,
    mock_only: true,
    pipeline_status: pipelineStatus,
    pipeline_steps: {
      fetch_plan_built: fetchPlanBuilt,
      request_plan_built: requestPlanBuilt,
      mock_responses_parsed: mockResponsesParsed,
      candles_normalized: candlesNormalized,
      persistence_plan_built: persistencePlanBuilt,
    },
    fetch_plan_summary: {
      selected_tickers: fetchPlan.ticker_selection.selected_tickers,
      history_days_planned: fetchPlan.plan_context.history_days_planned,
      preferred_interval: fetchPlan.plan_context.preferred_interval,
      planned_requests: fetchPlan.request_plan.total_planned_requests,
      estimated_provider_credits:
        fetchPlan.request_plan.estimated_provider_credits,
    },
    request_contract_summary: {
      requests_planned:
        requestContract.request_validation.requests_planned,
      valid_requests: requestContract.request_validation.valid_requests,
      invalid_requests: requestContract.request_validation.invalid_requests,
      grouped_by_ticker: requestContract.request_plan.grouped_by_ticker,
      grouped_by_day: requestContract.request_plan.grouped_by_day,
    },
    parser_summary: parserSummary,
    persistence_summary: {
      candles_received: persistencePlan.input_summary.candles_received,
      planned_inserts: persistencePlan.upsert_plan.planned_inserts,
      planned_updates: persistencePlan.upsert_plan.planned_updates,
      planned_skips: persistencePlan.upsert_plan.planned_skips,
      planned_invalid_rejections:
        persistencePlan.upsert_plan.planned_invalid_rejections,
      planned_duplicates_deduped:
        persistencePlan.upsert_plan.planned_duplicates_deduped,
      cache_hits: persistencePlan.cache_analysis.cache_hits,
      cache_misses: persistencePlan.cache_analysis.cache_misses,
    },
    readiness: {
      ready_to_run_mock_pipeline:
        pipelineStatus === "ready" || pipelineStatus === "partial",
      ready_to_call_provider: false,
      ready_to_persist_candles: false,
      ready_to_create_synthetic_outcomes: false,
      ready_to_run_replay: false,
      ready_to_affect_scanner: false,
    },
    safety: {
      advisory_only: true,
      dry_run_only: true,
      mock_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    recommended_next_steps: [
      "review_end_to_end_dry_run_counts_before_enabling_any_fetch",
      "verify_historical_candle_storage_migration_before_persistence",
      "keep_replay_and_synthetic_outcomes_disabled_until_separate_approval",
      "require_manual_review_before_any_provider_or_database_write_path",
    ],
    blockers,
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
    components: {
      fetch_plan: fetchPlan,
      request_contract: requestContract,
      parsers,
      persistence_plan: persistencePlan,
    },
  };
}

export function historicalBackfillDryRunPipelineJson(
  summary: HistoricalBackfillDryRunPipelineSummary,
) {
  return JSON.stringify(summary, null, 2);
}
