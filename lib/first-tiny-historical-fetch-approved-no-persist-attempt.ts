import { buildFirstTinyHistoricalFetchApproval } from "@/lib/first-tiny-historical-fetch-approval";
import {
  buildFirstTinyHistoricalFetchApprovalSignalReadiness,
  type FirstTinyHistoricalFetchApprovalSignalInput,
} from "@/lib/first-tiny-historical-fetch-approval-signal-readiness";
import { buildFirstTinyHistoricalFetchExecutionPlan } from "@/lib/first-tiny-historical-fetch-execution-plan";
import { buildFirstTinyHistoricalFetchFinalPreflight } from "@/lib/first-tiny-historical-fetch-final-preflight";
import { buildFirstTinyHistoricalFetchOperatorApproval } from "@/lib/first-tiny-historical-fetch-operator-approval";
import {
  buildFirstTinyHistoricalFetchProviderDryExecute,
  type FirstTinyHistoricalFetchCacheLookupResult,
  type FirstTinyHistoricalFetchProviderCallResult,
  type FirstTinyHistoricalFetchProviderDryExecuteRequestScope,
  type FirstTinyHistoricalFetchProviderDryExecuteSummary,
} from "@/lib/first-tiny-historical-fetch-provider-dry-execute";
import { buildFirstTinyHistoricalFetchRequestPreview } from "@/lib/first-tiny-historical-fetch-request-preview";
import { buildHistoricalBackfillDryRunPipeline } from "@/lib/historical-backfill-dry-run-pipeline";
import { buildHistoricalBackfillExecutionReadiness } from "@/lib/historical-backfill-execution-readiness";
import { buildHistoricalBackfillFetchPlan } from "@/lib/historical-backfill-fetch-planner";
import { buildHistoricalCandleStorageReadiness } from "@/lib/historical-candle-storage-readiness";
import {
  historicalCandleStorageReadbackToDetection,
  readHistoricalCandleStorageSchema,
} from "@/lib/historical-candle-storage-readback";
import { buildTwelveDataHistoricalFetchContract } from "@/lib/twelve-data-historical-fetch-contract";

type HistoricalCandleStorageDetection = ReturnType<
  typeof historicalCandleStorageReadbackToDetection
>;

export type FirstTinyHistoricalFetchApprovedNoPersistEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyHistoricalFetchApprovedNoPersistAttemptInput = {
  execute_provider_call?: boolean | null;
  env?: FirstTinyHistoricalFetchApprovedNoPersistEnv | null;
  storage_detection?: HistoricalCandleStorageDetection | null;
  now?: Date | string | null;
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

export type FirstTinyHistoricalFetchApprovedNoPersistAttemptSummary =
  FirstTinyHistoricalFetchProviderDryExecuteSummary & {
    route_context: {
      route: "/api/historical-backfill/first-tiny-fetch";
      authenticated: boolean;
      execute_provider_call_requested: boolean;
      arbitrary_scope_rejected: boolean;
      approval_signal_source: "server_env" | "none";
    };
  };

const previewTicker = "COIN";

function normalizeText(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function parseBoolean(value: string | undefined) {
  if (value === undefined) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function parsePositiveInteger(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function buildFirstTinyHistoricalFetchApprovalSignalFromEnv(
  env: FirstTinyHistoricalFetchApprovedNoPersistEnv = process.env,
): FirstTinyHistoricalFetchApprovalSignalInput {
  const keys = [
    "TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_OPERATOR_LABEL",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVAL_REFERENCE",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_TICKER",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_MAX_REQUESTS",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_ESTIMATED_CREDITS",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_PERSIST_ALLOWED",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_REPLAY_ALLOWED",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_SCANNER_EFFECT_ALLOWED",
  ];
  const sourcePresent = keys.some((key) => normalizeText(env[key]) !== null);

  return {
    source_type: sourcePresent ? "server_env" : "none",
    source_present: sourcePresent,
    approved: parseBoolean(env.TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED),
    operator_label: normalizeText(
      env.TURE_FIRST_TINY_HISTORICAL_FETCH_OPERATOR_LABEL,
    ),
    approval_reference: normalizeText(
      env.TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVAL_REFERENCE,
    ),
    provider: "twelve_data",
    ticker: normalizeText(env.TURE_FIRST_TINY_HISTORICAL_FETCH_TICKER),
    interval: "5min",
    max_requests: parsePositiveInteger(
      env.TURE_FIRST_TINY_HISTORICAL_FETCH_MAX_REQUESTS,
    ),
    max_estimated_credits: parsePositiveInteger(
      env.TURE_FIRST_TINY_HISTORICAL_FETCH_ESTIMATED_CREDITS,
    ),
    persist_allowed: parseBoolean(
      env.TURE_FIRST_TINY_HISTORICAL_FETCH_PERSIST_ALLOWED,
    ),
    replay_allowed: parseBoolean(
      env.TURE_FIRST_TINY_HISTORICAL_FETCH_REPLAY_ALLOWED,
    ),
    scanner_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_HISTORICAL_FETCH_SCANNER_EFFECT_ALLOWED,
    ),
    production_safe: true,
  };
}

function providerEnvPresent(env: FirstTinyHistoricalFetchApprovedNoPersistEnv) {
  return normalizeText(env.TWELVE_DATA_API_KEY) !== null;
}

async function storageDetectionForAttempt(
  input: FirstTinyHistoricalFetchApprovedNoPersistAttemptInput,
) {
  if (input.storage_detection) return input.storage_detection;
  const readback = await readHistoricalCandleStorageSchema();
  return historicalCandleStorageReadbackToDetection(readback);
}

async function defaultCacheLookup(
  scope: FirstTinyHistoricalFetchProviderDryExecuteRequestScope,
): Promise<FirstTinyHistoricalFetchCacheLookupResult> {
  const { getServerSupabaseClient } = await import("@/lib/supabase-server");
  const { client, unavailable_reason: unavailableReason } =
    getServerSupabaseClient();

  if (!client) {
    return {
      available: false,
      hit: false,
      source: unavailableReason ?? "server_supabase_unavailable",
    };
  }

  const { count, error } = await client
    .from("historical_candles")
    .select("id", { count: "exact", head: true })
    .eq("provider", "twelve_data")
    .eq("ticker", scope.ticker)
    .eq("interval", scope.interval)
    .eq("cache_key", scope.cache_key);

  if (error) {
    return {
      available: false,
      hit: false,
      source: `historical_candles_read_error_${error.code ?? "unknown"}`,
    };
  }

  return {
    available: true,
    hit: (count ?? 0) > 0,
    source: "historical_candles_cache_key",
  };
}

export async function executeFirstTinyHistoricalFetchApprovedNoPersistAttempt(
  input: FirstTinyHistoricalFetchApprovedNoPersistAttemptInput = {},
): Promise<FirstTinyHistoricalFetchApprovedNoPersistAttemptSummary> {
  const env = input.env ?? process.env;
  const storageDetection = await storageDetectionForAttempt(input);
  const storageReadiness = buildHistoricalCandleStorageReadiness({
    migration_detection: storageDetection,
  });
  const fetchPlan = buildHistoricalBackfillFetchPlan({
    visible_recent_tickers: [previewTicker],
    static_universe_tickers: [previewTicker],
    history_days_requested: 1,
    max_selected_tickers: 1,
    migration_applied: storageReadiness.migration_readiness.migration_applied,
    now: input.now,
  });
  const dryRunPipeline = buildHistoricalBackfillDryRunPipeline({
    fetch_plan: fetchPlan,
    storage_readiness: storageReadiness,
    now: input.now,
  });
  const executionReadiness = buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storageReadiness,
    fetch_plan: fetchPlan,
    dry_run_pipeline: dryRunPipeline,
    provider_env_present: providerEnvPresent(env),
  });
  const approval = buildFirstTinyHistoricalFetchApproval({
    storage_readiness: storageReadiness,
    execution_readiness: executionReadiness,
  });
  const contract = buildTwelveDataHistoricalFetchContract({
    historical_backfill_fetch_plan: fetchPlan,
    now: input.now,
  });
  const requestPreview = buildFirstTinyHistoricalFetchRequestPreview({
    approval,
    twelve_data_historical_fetch_contract: contract,
  });
  const operatorApproval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval,
    request_preview: requestPreview,
    execution_readiness: executionReadiness,
  });
  const executionPlan = buildFirstTinyHistoricalFetchExecutionPlan({
    operator_approval: operatorApproval,
    request_preview: requestPreview,
  });
  const signal = buildFirstTinyHistoricalFetchApprovalSignalFromEnv(env);
  const signalReadiness = buildFirstTinyHistoricalFetchApprovalSignalReadiness({
    operator_approval: operatorApproval,
    request_preview: requestPreview,
    execution_plan: executionPlan,
    signal,
  });
  const finalPreflight = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: storageReadiness,
    execution_readiness: executionReadiness,
    approval,
    request_preview: requestPreview,
    operator_approval: operatorApproval,
    execution_plan: executionPlan,
    approval_signal_readiness: signalReadiness,
  });
  const dryExecute =
    input.execute_provider_call === true
      ? await buildFirstTinyHistoricalFetchProviderDryExecute({
          execute_provider_call: true,
          final_preflight: finalPreflight,
          approval_signal_readiness: signalReadiness,
          request_preview: requestPreview,
          execution_plan: executionPlan,
          storage_readiness: storageReadiness,
          cache_lookup: input.cache_lookup ?? defaultCacheLookup,
          provider_call: input.provider_call,
        })
      : buildFirstTinyHistoricalFetchProviderDryExecute({
          execute_provider_call: false,
          final_preflight: finalPreflight,
          approval_signal_readiness: signalReadiness,
          request_preview: requestPreview,
          execution_plan: executionPlan,
          storage_readiness: storageReadiness,
          cache_lookup: input.cache_lookup ?? defaultCacheLookup,
          provider_call: input.provider_call,
        });

  return {
    ...dryExecute,
    route_context: {
      route: "/api/historical-backfill/first-tiny-fetch",
      authenticated: true,
      execute_provider_call_requested: input.execute_provider_call === true,
      arbitrary_scope_rejected: false,
      approval_signal_source: signal.source_present ? "server_env" : "none",
    },
  };
}
