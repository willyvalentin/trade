import { buildHistoricalCandleCacheKey } from "@/lib/historical-candle-cache";
import type { FirstTinyHistoricalFetchApprovalSummary } from "@/lib/first-tiny-historical-fetch-approval";
import type {
  TwelveDataHistoricalFetchContractSummary,
  TwelveDataHistoricalRequest,
} from "@/lib/twelve-data-historical-fetch-contract";

export type FirstTinyHistoricalFetchRequestPreviewStatus =
  | "ready"
  | "blocked"
  | "not_requested";

export type FirstTinyHistoricalFetchRequestPreviewInput = {
  approval?: FirstTinyHistoricalFetchApprovalSummary | null;
  twelve_data_historical_fetch_contract?:
    | TwelveDataHistoricalFetchContractSummary
    | null;
};

export type FirstTinyHistoricalFetchRequestPreviewSummary = {
  advisory_only: true;
  preview_only: true;
  provider_fetch_added: false;
  historical_fetch_added: false;
  preview_status: FirstTinyHistoricalFetchRequestPreviewStatus;
  approval_context: {
    approval_required: true;
    approval_status: FirstTinyHistoricalFetchApprovalSummary["approval_status"];
    first_fetch_enabled: false;
    dry_run_only: true;
    manual_approval_gate_passed: false;
  };
  request_preview: {
    provider: "twelve_data";
    endpoint: "time_series";
    ticker: string;
    interval: "5min";
    trading_day: string | null;
    timezone: "America/New_York";
    session: "regular";
    adjusted: false;
    outputsize: number | null;
    request_count: number;
    estimated_credits: number;
    cache_key: string;
    cache_lookup_required: true;
    fetch_run_audit_required: true;
  };
  provider_parameters_preview: {
    symbol: string;
    interval: "5min";
    timezone: "America/New_York";
    start_date: string | null;
    end_date: string | null;
    outputsize: number | null;
    order: "ASC" | "DESC" | null;
    apikey_included: false;
  };
  cache_preflight: {
    reuse_before_fetch: true;
    cache_key: string;
    cache_lookup_planned: true;
    cache_hit_unknown: true;
    would_skip_provider_if_cache_hit: true;
  };
  fetch_run_audit_preview: {
    would_create_fetch_run_record: false;
    audit_required_before_future_fetch: true;
    planned_status: "preview_only";
    provider_credits_estimated: number;
    provider_credits_used: 0;
    candle_count: 0;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
  readiness: {
    ready_to_preview_request: boolean;
    ready_to_call_provider_now: false;
    ready_to_persist_candles_now: false;
    ready_to_create_fetch_run_now: false;
    ready_to_create_synthetic_outcomes: false;
    ready_to_run_replay: false;
    ready_to_affect_scanner: false;
  };
  safety: {
    advisory_only: true;
    preview_only: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    provider_call_executed: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
};

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : null;
}

function selectedTicker(
  approval: FirstTinyHistoricalFetchApprovalSummary | null,
) {
  return normalizeTicker(approval?.candidate_plan.selected_tickers[0]) ?? "UNKNOWN";
}

function matchingContractRequest(input: {
  approval: FirstTinyHistoricalFetchApprovalSummary | null;
  contract: TwelveDataHistoricalFetchContractSummary | null;
}) {
  const ticker = selectedTicker(input.approval);
  const requests = input.contract?.request_plan.planned_requests ?? [];
  const matching = requests.find(
    (request) => normalizeTicker(request.ticker) === ticker,
  );

  return matching ?? requests[0] ?? null;
}

function fallbackCacheKey(input: {
  ticker: string;
  trading_day: string | null;
}) {
  return buildHistoricalCandleCacheKey({
    provider: "twelve_data",
    ticker: input.ticker,
    interval: "5min",
    trading_day: input.trading_day,
    session: "regular",
    timezone: "America/New_York",
    adjusted: false,
  });
}

function previewCacheKey(input: {
  request: TwelveDataHistoricalRequest | null;
  ticker: string;
  trading_day: string | null;
}) {
  return (
    input.request?.cache_key.trim() ||
    fallbackCacheKey({
      ticker: input.ticker,
      trading_day: input.trading_day,
    })
  );
}

export function buildFirstTinyHistoricalFetchRequestPreview(
  input: FirstTinyHistoricalFetchRequestPreviewInput = {},
): FirstTinyHistoricalFetchRequestPreviewSummary {
  const approval = input.approval ?? null;
  const contract = input.twelve_data_historical_fetch_contract ?? null;
  const request = matchingContractRequest({ approval, contract });
  const blockers: string[] = [];
  const warnings = [
    "preview_only_no_provider_call",
    "api_key_omitted_from_preview",
  ];

  if (!approval) {
    pushUnique(blockers, "first_tiny_fetch_approval_missing");
  } else {
    if (approval.approval_status !== "pending_manual_review") {
      pushUnique(blockers, "approval_not_pending_manual_review");
    }
    if (!approval.readiness.ready_for_manual_review) {
      pushUnique(blockers, "approval_not_ready_for_manual_review");
    }
  }
  if (!contract) {
    pushUnique(blockers, "twelve_data_historical_fetch_contract_missing");
  }
  if (!request) {
    pushUnique(blockers, "provider_request_preview_unavailable");
  }

  const readyToPreview =
    blockers.length === 0 &&
    approval?.approval_status === "pending_manual_review" &&
    approval.readiness.ready_for_manual_review &&
    request !== null;
  const previewStatus: FirstTinyHistoricalFetchRequestPreviewStatus = !approval
    ? "not_requested"
    : readyToPreview
      ? "ready"
      : "blocked";
  const ticker = normalizeTicker(request?.ticker) ?? selectedTicker(approval);
  const tradingDay =
    request?.trading_day ??
    approval?.candidate_plan.selected_trading_day ??
    null;
  const cacheKey = previewCacheKey({ request, ticker, trading_day: tradingDay });
  const requestCount = readyToPreview ? 1 : 0;
  const estimatedCredits = readyToPreview ? 1 : 0;

  return {
    advisory_only: true,
    preview_only: true,
    provider_fetch_added: false,
    historical_fetch_added: false,
    preview_status: previewStatus,
    approval_context: {
      approval_required: true,
      approval_status: approval?.approval_status ?? "not_requested",
      first_fetch_enabled: false,
      dry_run_only: true,
      manual_approval_gate_passed: false,
    },
    request_preview: {
      provider: "twelve_data",
      endpoint: "time_series",
      ticker,
      interval: "5min",
      trading_day: tradingDay,
      timezone: "America/New_York",
      session: "regular",
      adjusted: false,
      outputsize: request?.outputsize ?? null,
      request_count: requestCount,
      estimated_credits: estimatedCredits,
      cache_key: cacheKey,
      cache_lookup_required: true,
      fetch_run_audit_required: true,
    },
    provider_parameters_preview: {
      symbol: ticker,
      interval: "5min",
      timezone: "America/New_York",
      start_date: request?.start_date ?? null,
      end_date: request?.end_date ?? null,
      outputsize: request?.outputsize ?? null,
      order: request?.order ?? null,
      apikey_included: false,
    },
    cache_preflight: {
      reuse_before_fetch: true,
      cache_key: cacheKey,
      cache_lookup_planned: true,
      cache_hit_unknown: true,
      would_skip_provider_if_cache_hit: true,
    },
    fetch_run_audit_preview: {
      would_create_fetch_run_record: false,
      audit_required_before_future_fetch: true,
      planned_status: "preview_only",
      provider_credits_estimated: estimatedCredits,
      provider_credits_used: 0,
      candle_count: 0,
    },
    blockers,
    warnings,
    recommended_next_steps: [
      ...(readyToPreview
        ? [
            "review_first_tiny_provider_request_preview",
            "verify_cache_lookup_before_future_provider_fetch",
          ]
        : ["resolve_first_tiny_fetch_request_preview_blockers"]),
      "require_separate_explicit_approval_before_provider_call",
      "keep_fetch_run_candle_replay_and_scanner_effects_disabled",
    ],
    readiness: {
      ready_to_preview_request: readyToPreview,
      ready_to_call_provider_now: false,
      ready_to_persist_candles_now: false,
      ready_to_create_fetch_run_now: false,
      ready_to_create_synthetic_outcomes: false,
      ready_to_run_replay: false,
      ready_to_affect_scanner: false,
    },
    safety: {
      advisory_only: true,
      preview_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      provider_call_executed: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
  };
}
