import type { HistoricalCandleStorageReadinessSummary } from "@/lib/historical-candle-storage-readiness";
import type { FirstTinyHistoricalFetchApprovalSignalReadinessSummary } from "@/lib/first-tiny-historical-fetch-approval-signal-readiness";
import type { FirstTinyHistoricalFetchExecutionPlanSummary } from "@/lib/first-tiny-historical-fetch-execution-plan";
import type { FirstTinyHistoricalFetchFinalPreflightSummary } from "@/lib/first-tiny-historical-fetch-final-preflight";
import type { FirstTinyHistoricalFetchRequestPreviewSummary } from "@/lib/first-tiny-historical-fetch-request-preview";
import {
  buildHistoricalCandlePersistencePlan,
  type HistoricalCandlePersistencePlanSummary,
} from "@/lib/historical-candle-persistence-plan";
import {
  parseTwelveDataHistoricalResponse,
  type TwelveDataHistoricalRawResponse,
} from "@/lib/twelve-data-historical-response-parser";

export type FirstTinyHistoricalFetchProviderDryExecuteStatus =
  | "blocked"
  | "not_approved"
  | "cache_hit_skipped_provider"
  | "provider_call_completed_no_persist"
  | "provider_call_failed_no_persist"
  | "not_executed";

export type FirstTinyHistoricalFetchCacheLookupResult = {
  available: boolean;
  hit: boolean;
  source?: string | null;
};

export type FirstTinyHistoricalFetchProviderCallResult = {
  ok: boolean;
  http_status: number | null;
  response?: TwelveDataHistoricalRawResponse | null;
  error_type?: string | null;
};

export type FirstTinyHistoricalFetchProviderDryExecuteRequestScope = {
  provider: "twelve_data";
  endpoint: "time_series";
  ticker: string;
  interval: "5min";
  trading_day: string | null;
  start_date: string | null;
  end_date: string | null;
  timezone: "America/New_York";
  session: "regular";
  adjusted: false;
  request_count: 1;
  estimated_credits: 1;
  cache_key: string;
};

export type FirstTinyHistoricalFetchProviderDryExecuteInput = {
  execute_provider_call?: boolean | null;
  final_preflight?: FirstTinyHistoricalFetchFinalPreflightSummary | null;
  approval_signal_readiness?:
    | FirstTinyHistoricalFetchApprovalSignalReadinessSummary
    | null;
  request_preview?: FirstTinyHistoricalFetchRequestPreviewSummary | null;
  execution_plan?: FirstTinyHistoricalFetchExecutionPlanSummary | null;
  storage_readiness?: HistoricalCandleStorageReadinessSummary | null;
  cache_lookup?: (
    scope: FirstTinyHistoricalFetchProviderDryExecuteRequestScope,
  ) =>
    | FirstTinyHistoricalFetchCacheLookupResult
    | Promise<FirstTinyHistoricalFetchCacheLookupResult>;
  provider_call?: (
    scope: FirstTinyHistoricalFetchProviderDryExecuteRequestScope,
  ) =>
    | FirstTinyHistoricalFetchProviderCallResult
    | Promise<FirstTinyHistoricalFetchProviderCallResult>;
};

export type FirstTinyHistoricalFetchProviderDryExecuteSummary = {
  advisory_only: false;
  dry_execute_only: true;
  execution_status: FirstTinyHistoricalFetchProviderDryExecuteStatus;
  provider_call_capable: true;
  provider_call_executed: boolean;
  approval_context: {
    approval_signal_status: string;
    signal_active: boolean;
    signal_valid_for_execution: boolean;
    operator_label: string | null;
    approval_reference: string | null;
  };
  request_scope: FirstTinyHistoricalFetchProviderDryExecuteRequestScope;
  preflight: {
    final_preflight_ready: boolean;
    request_preview_ready: boolean;
    execution_plan_ready: boolean;
    schema_readback_ok: boolean;
    provider_env_present: boolean | "unknown";
    budget_policy_present: boolean;
    lookahead_safety_present: boolean;
    cache_lookup_required: true;
  };
  cache_preflight: {
    cache_lookup_attempted: boolean;
    cache_hit: boolean | "unknown";
    cache_hit_source: string | null;
    provider_skipped_due_cache_hit: boolean;
  };
  provider_result: {
    provider: "twelve_data";
    endpoint: "time_series";
    call_attempted: boolean;
    call_succeeded: boolean;
    http_status: number | null;
    provider_error_type: string | null;
    raw_response_received: boolean;
    raw_response_persisted: false;
    api_key_included_in_diagnostics: false;
  };
  parser_result: {
    parse_attempted: boolean;
    parse_status: "ok" | "failed" | "not_attempted";
    raw_candles: number;
    normalized_candles: number;
    valid_candles: number;
    invalid_candles: number;
    duplicate_timestamps: number;
    out_of_order_candles: number;
  };
  persistence_plan: {
    persistence_planned: boolean;
    candles_persisted: false;
    fetch_run_persisted: false;
    planned_inserts: number;
    planned_updates: number;
    planned_skips: number;
    planned_invalid_rejections: number;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
  readiness: {
    ready_to_execute_provider_call_now: boolean;
    ready_to_persist_candles_now: false;
    ready_to_create_fetch_run_now: false;
    ready_to_create_synthetic_outcomes: false;
    ready_to_run_replay: false;
    ready_to_affect_scanner: false;
  };
  safety: {
    provider_fetch_added: true;
    historical_fetch_added: true;
    provider_call_executed: boolean;
    dry_execute_only: true;
    raw_response_persisted: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_valid_operator_signal: true;
    max_one_request_enforced: true;
    max_one_ticker_enforced: true;
    no_persistence_enforced: true;
  };
};

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : "UNKNOWN";
}

function emptyRequestScope(
  preview: FirstTinyHistoricalFetchRequestPreviewSummary | null,
): FirstTinyHistoricalFetchProviderDryExecuteRequestScope {
  return {
    provider: "twelve_data",
    endpoint: "time_series",
    ticker: normalizeTicker(preview?.request_preview.ticker),
    interval: "5min",
    trading_day: preview?.request_preview.trading_day ?? null,
    start_date: preview?.provider_parameters_preview.start_date ?? null,
    end_date: preview?.provider_parameters_preview.end_date ?? null,
    timezone: "America/New_York",
    session: "regular",
    adjusted: false,
    request_count: 1,
    estimated_credits: 1,
    cache_key: preview?.request_preview.cache_key ?? "unknown",
  };
}

function operatorLabel(
  signal: FirstTinyHistoricalFetchApprovalSignalReadinessSummary | null,
) {
  return signal?.detected_signal.operator_label ?? null;
}

function approvalReference(
  signal: FirstTinyHistoricalFetchApprovalSignalReadinessSummary | null,
) {
  return signal?.detected_signal.approval_reference ?? null;
}

function signalValidForExecution(
  signal: FirstTinyHistoricalFetchApprovalSignalReadinessSummary | null,
) {
  if (!signal) return false;
  return (
    signal.approval_signal_status === "valid_for_future_action" &&
    signal.detected_signal.source_present === true &&
    signal.detected_signal.production_safe === true &&
    signal.detected_signal.scope_matches_preview === true &&
    signal.validation.signal_shape_valid === true &&
    signal.validation.approval_value_valid === true &&
    signal.validation.persist_scope_valid === true &&
    signal.validation.replay_scope_valid === true &&
    signal.validation.scanner_scope_valid === true
  );
}

function safeParseStatus(
  status: ReturnType<typeof parseTwelveDataHistoricalResponse>["parse_status"],
): "ok" | "failed" {
  return status === "ok" || status === "partial" ? "ok" : "failed";
}

function defaultProviderApiKey() {
  return process.env.TWELVE_DATA_API_KEY?.trim() ?? "";
}

async function defaultProviderCall(
  scope: FirstTinyHistoricalFetchProviderDryExecuteRequestScope,
): Promise<FirstTinyHistoricalFetchProviderCallResult> {
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
  url.searchParams.set("symbol", scope.ticker);
  url.searchParams.set("interval", scope.interval);
  url.searchParams.set("timezone", scope.timezone);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("order", "ASC");
  if (scope.start_date) url.searchParams.set("start_date", scope.start_date);
  if (scope.end_date) url.searchParams.set("end_date", scope.end_date);
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

function statusFromBlockers(input: {
  blockers: string[];
  signalPresent: boolean;
}): FirstTinyHistoricalFetchProviderDryExecuteStatus {
  if (!input.signalPresent) return "not_approved";
  return input.blockers.length > 0 ? "blocked" : "not_executed";
}

function blankPersistencePlan(): FirstTinyHistoricalFetchProviderDryExecuteSummary["persistence_plan"] {
  return {
    persistence_planned: false,
    candles_persisted: false,
    fetch_run_persisted: false,
    planned_inserts: 0,
    planned_updates: 0,
    planned_skips: 0,
    planned_invalid_rejections: 0,
  };
}

function persistencePlanSummary(
  plan: HistoricalCandlePersistencePlanSummary | null,
): FirstTinyHistoricalFetchProviderDryExecuteSummary["persistence_plan"] {
  if (!plan) return blankPersistencePlan();
  return {
    persistence_planned: true,
    candles_persisted: false,
    fetch_run_persisted: false,
    planned_inserts: plan.upsert_plan.planned_inserts,
    planned_updates: plan.upsert_plan.planned_updates,
    planned_skips: plan.upsert_plan.planned_skips,
    planned_invalid_rejections: plan.upsert_plan.planned_invalid_rejections,
  };
}

export function buildFirstTinyHistoricalFetchProviderDryExecute(
  input?: FirstTinyHistoricalFetchProviderDryExecuteInput & {
    execute_provider_call?: false | null | undefined;
  },
): FirstTinyHistoricalFetchProviderDryExecuteSummary;
export function buildFirstTinyHistoricalFetchProviderDryExecute(
  input: FirstTinyHistoricalFetchProviderDryExecuteInput & {
    execute_provider_call: true;
  },
): Promise<FirstTinyHistoricalFetchProviderDryExecuteSummary>;
export function buildFirstTinyHistoricalFetchProviderDryExecute(
  input: FirstTinyHistoricalFetchProviderDryExecuteInput = {},
):
  | FirstTinyHistoricalFetchProviderDryExecuteSummary
  | Promise<FirstTinyHistoricalFetchProviderDryExecuteSummary> {
  const finalPreflight = input.final_preflight ?? null;
  const signal = input.approval_signal_readiness ?? null;
  const preview = input.request_preview ?? null;
  const executionPlan = input.execution_plan ?? null;
  const requestScope = emptyRequestScope(preview);
  const blockers: string[] = [];
  const warnings = [
    "provider_dry_execute_only_no_persistence",
    "raw_response_not_persisted",
  ];
  const finalPreflightReady =
    finalPreflight?.preflight_status ===
    "ready_to_propose_first_provider_call_action";
  const requestPreviewReady = preview?.preview_status === "ready";
  const executionPlanReady =
    executionPlan?.execution_plan_status === "ready_for_future_approval";
  const validSignal = signalValidForExecution(signal);
  const signalPresent = signal?.detected_signal.source_present === true;
  const providerEnvPresent =
    signal?.prerequisites.provider_env_present ??
    finalPreflight?.preflight_checks.provider_env_present ??
    "unknown";
  const preflight = {
    final_preflight_ready: finalPreflightReady,
    request_preview_ready: requestPreviewReady,
    execution_plan_ready: executionPlanReady,
    schema_readback_ok:
      signal?.prerequisites.schema_readback_ok === true ||
      finalPreflight?.preflight_checks.schema_readback_ok === true,
    provider_env_present: providerEnvPresent,
    budget_policy_present:
      signal?.prerequisites.budget_policy_present === true ||
      finalPreflight?.preflight_checks.budget_policy_present === true,
    lookahead_safety_present:
      signal?.prerequisites.lookahead_safety_present === true ||
      finalPreflight?.preflight_checks.lookahead_safety_present === true,
    cache_lookup_required: true as const,
  };

  if (!finalPreflightReady) {
    pushUnique(blockers, "final_preflight_not_ready");
  }
  if (!requestPreviewReady) pushUnique(blockers, "request_preview_not_ready");
  if (!executionPlanReady) {
    pushUnique(blockers, "execution_plan_not_ready_for_future_approval");
  }
  if (!preflight.schema_readback_ok) {
    pushUnique(blockers, "schema_readback_not_verified");
  }
  if (validSignal && providerEnvPresent !== true) {
    pushUnique(blockers, "provider_env_not_verified");
  }
  if (!preflight.budget_policy_present) {
    pushUnique(blockers, "budget_policy_missing");
  }
  if (!preflight.lookahead_safety_present) {
    pushUnique(blockers, "lookahead_safety_missing");
  }
  if (requestScope.request_count !== 1) {
    pushUnique(blockers, "request_count_must_equal_one");
  }
  if (preview && preview.request_preview.request_count !== 1) {
    pushUnique(blockers, "preview_request_count_must_equal_one");
  }
  if (preview && preview.request_preview.estimated_credits !== 1) {
    pushUnique(blockers, "preview_estimated_credits_must_equal_one");
  }
  if (requestScope.ticker === "UNKNOWN") {
    pushUnique(blockers, "ticker_scope_missing");
  }
  if (signalPresent && !validSignal) {
    pushUnique(blockers, "approval_signal_not_valid_for_execution");
  }

  const baseProviderResult: FirstTinyHistoricalFetchProviderDryExecuteSummary["provider_result"] = {
    provider: "twelve_data" as const,
    endpoint: "time_series" as const,
    call_attempted: false,
    call_succeeded: false,
    http_status: null,
    provider_error_type: null,
    raw_response_received: false,
    raw_response_persisted: false as const,
    api_key_included_in_diagnostics: false as const,
  };
  const baseParserResult: FirstTinyHistoricalFetchProviderDryExecuteSummary["parser_result"] = {
    parse_attempted: false,
    parse_status: "not_attempted" as const,
    raw_candles: 0,
    normalized_candles: 0,
    valid_candles: 0,
    invalid_candles: 0,
    duplicate_timestamps: 0,
    out_of_order_candles: 0,
  };

  let executionStatus = statusFromBlockers({ blockers, signalPresent });
  let providerCallExecuted = false;
  let cachePreflight = {
    cache_lookup_attempted: false,
    cache_hit: "unknown" as boolean | "unknown",
    cache_hit_source: null as string | null,
    provider_skipped_due_cache_hit: false,
  };
  let providerResult = baseProviderResult;
  let parserResult = baseParserResult;
  let persistencePlan =
    blankPersistencePlan();

  const finalize = (): FirstTinyHistoricalFetchProviderDryExecuteSummary => {
    const readyToExecuteProviderCallNow =
      validSignal &&
      blockers.length === 0 &&
      cachePreflight.cache_hit === "unknown" &&
      !providerCallExecuted;

    return {
      advisory_only: false,
      dry_execute_only: true,
      execution_status: executionStatus,
      provider_call_capable: true,
      provider_call_executed: providerCallExecuted,
      approval_context: {
        approval_signal_status:
          signal?.approval_signal_status ?? "not_configured",
        signal_active: validSignal,
        signal_valid_for_execution: validSignal,
        operator_label: operatorLabel(signal),
        approval_reference: approvalReference(signal),
      },
      request_scope: requestScope,
      preflight,
      cache_preflight: cachePreflight,
      provider_result: providerResult,
      parser_result: parserResult,
      persistence_plan: persistencePlan,
      blockers,
      warnings,
      recommended_next_steps: [
        ...(executionStatus === "not_approved"
          ? ["configure_valid_first_tiny_provider_call_approval_signal"]
          : executionStatus === "provider_call_completed_no_persist"
            ? ["review_parsed_candles_and_dry_run_persistence_plan"]
            : executionStatus === "cache_hit_skipped_provider"
              ? ["review_cached_historical_candles_before_any_refetch"]
              : ["resolve_first_tiny_provider_dry_execute_blockers"]),
        "keep_candle_fetch_run_replay_synthetic_outcome_and_scanner_writes_disabled",
      ],
      readiness: {
        ready_to_execute_provider_call_now: readyToExecuteProviderCallNow,
        ready_to_persist_candles_now: false,
        ready_to_create_fetch_run_now: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
      },
      safety: {
        provider_fetch_added: true,
        historical_fetch_added: true,
        provider_call_executed: providerCallExecuted,
        dry_execute_only: true,
        raw_response_persisted: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_valid_operator_signal: true,
        max_one_request_enforced: true,
        max_one_ticker_enforced: true,
        no_persistence_enforced: true,
      },
    };
  };

  if (validSignal && blockers.length === 0 && input.execute_provider_call === true) {
    if (!input.cache_lookup) {
      pushUnique(blockers, "cache_lookup_unavailable");
      executionStatus = "blocked";
    } else {
      const executeApprovedPath = async () => {
        const cacheResult = await input.cache_lookup?.(requestScope);
        if (!cacheResult) {
          pushUnique(blockers, "cache_lookup_unavailable");
          executionStatus = "blocked";
          return finalize();
        }
        cachePreflight = {
          cache_lookup_attempted: true,
          cache_hit: cacheResult.hit,
          cache_hit_source: cacheResult.source ?? null,
          provider_skipped_due_cache_hit: cacheResult.hit,
        };

        if (!cacheResult.available) {
          pushUnique(blockers, "cache_lookup_unavailable");
          executionStatus = "blocked";
        } else if (cacheResult.hit) {
          executionStatus = "cache_hit_skipped_provider";
        } else {
          const providerCall = input.provider_call ?? defaultProviderCall;
          const result = await providerCall(requestScope);
          providerCallExecuted = true;
          providerResult = {
            provider: "twelve_data",
            endpoint: "time_series",
            call_attempted: true,
            call_succeeded: result.ok,
            http_status: result.http_status,
            provider_error_type: result.error_type ?? null,
            raw_response_received:
              result.response !== null && result.response !== undefined,
            raw_response_persisted: false,
            api_key_included_in_diagnostics: false,
          };

          if (result.ok && result.response) {
            const parsed = parseTwelveDataHistoricalResponse({
              response: result.response,
              context: {
                ticker: requestScope.ticker,
                interval: requestScope.interval,
                timezone: requestScope.timezone,
                adjusted: requestScope.adjusted,
                trading_day: requestScope.trading_day,
                session: requestScope.session,
                cache_key: requestScope.cache_key,
              },
            });
            const plan = buildHistoricalCandlePersistencePlan({
              candles: parsed.candles,
              storage_readiness: input.storage_readiness ?? null,
              fetch_run_metadata: {
                provider_credits_estimated: requestScope.estimated_credits,
              },
            });
            parserResult = {
              parse_attempted: true,
              parse_status: safeParseStatus(parsed.parse_status),
              raw_candles: parsed.validation.raw_candles_count,
              normalized_candles: parsed.validation.normalized_candles_count,
              valid_candles: parsed.validation.valid_candles_count,
              invalid_candles: parsed.validation.invalid_candles_count,
              duplicate_timestamps:
                parsed.validation.duplicate_timestamp_count,
              out_of_order_candles: parsed.validation.out_of_order_count,
            };
            persistencePlan = persistencePlanSummary(plan);
            executionStatus = "provider_call_completed_no_persist";
          } else {
            pushUnique(blockers, result.error_type ?? "provider_call_failed");
            executionStatus = "provider_call_failed_no_persist";
          }
        }

        return finalize();
      };

      return executeApprovedPath();
    }
  }

  return finalize();
}
