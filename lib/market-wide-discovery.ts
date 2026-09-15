import "server-only";

import {
  getTwelveDataMarketMovers,
  type TwelveDataMarketMoverDirection,
} from "@/lib/market-data";
import {
  buildDynamicMarketMoversSelection,
  type DynamicMarketMoversSource,
  type DynamicMarketMoversSelection,
} from "@/lib/dynamic-market-movers";
import {
  buildMarketWideDiscoveryAdmission,
  type MarketWideDiscoveryAdmission,
  type MarketWideDiscoveryAttemptOutcome,
  type MarketWideDiscoveryDirection,
  type MarketWideDiscoveryPreviousAttempt,
} from "@/lib/market-wide-discovery-policy";
import { buildProviderPlanProfile, type ProviderPlanProfileEnv } from "@/lib/provider-plan-profile";
import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import { classifyMarketDataProviderFailure } from "@/lib/provider-response-observation";
import { throwIfAborted } from "@/lib/operation-abort";

export const MARKET_WIDE_DISCOVERY_SUMMARY_VERSION =
  "market_wide_discovery_summary_v2" as const;

export type MarketWideDiscoverySummary = {
  summary_version: typeof MARKET_WIDE_DISCOVERY_SUMMARY_VERSION;
  summary_kind: "market_wide_discovery";
  generated_at: string;
  scan_window: IntradayScanWindow | "unknown";
  admission: MarketWideDiscoveryAdmission;
  attempt: {
    attempted_at: string | null;
    outcome: MarketWideDiscoveryAttemptOutcome;
    provider_response_observed: boolean;
  };
  dynamic_intake: DynamicMarketMoversSelection["summary"];
  warnings: string[];
  gaps: string[];
};

export type MarketWideDiscoveryResult = {
  summary: MarketWideDiscoverySummary;
  dynamic_movers: DynamicMarketMoversSelection;
};

export type DiscoverMarketWideDiscoveryInput = {
  scanWindow?: IntradayScanWindow | "unknown" | null;
  selectedBudget?: number | null;
  previousAttempt?: MarketWideDiscoveryPreviousAttempt | null;
  /**
   * Callers running a simulation or diagnostic must opt out even when the
   * deployment-level discovery switch is enabled. This prevents a test path
   * from spending provider credits or being mistaken for live evidence.
   */
  runtimeEnabled?: boolean;
  env?: ProviderPlanProfileEnv;
  now?: Date;
  signal?: AbortSignal;
  fetchMarketMovers?: (
    direction: TwelveDataMarketMoverDirection,
    options: { signal?: AbortSignal },
  ) => ReturnType<typeof getTwelveDataMarketMovers>;
};

export async function discoverMarketWideDiscovery(
  input: DiscoverMarketWideDiscoveryInput = {},
): Promise<MarketWideDiscoveryResult> {
  throwIfAborted(input.signal);
  const now = input.now ?? new Date();
  const env = input.env ?? process.env;
  const plan = buildProviderPlanProfile(env);
  const admission = buildMarketWideDiscoveryAdmission({
    planMode: plan.effective_mode,
    runtimeEnabled:
      input.runtimeEnabled ??
      env.TURE_MARKET_WIDE_DISCOVERY_ENABLED === "true",
    dailyCreditBudget: finiteNonNegative(
      env.TURE_MARKET_WIDE_DISCOVERY_DAILY_CREDIT_BUDGET,
    ),
    previousAttempt: input.previousAttempt,
    now,
  });
  const scanWindow = input.scanWindow ?? "unknown";
  const selectedBudget = finitePositive(input.selectedBudget) ?? 50;

  if (!admission.safe_to_request_dynamic_movers) {
    return buildResult({
      now,
      scanWindow,
      admission,
      dynamicMovers: buildDynamicMarketMoversSelection({
        scanWindow,
        selectedBudget,
        now,
      }),
      attemptedAt: null,
      outcome: "not_attempted",
      providerResponseObserved: false,
      warnings: [],
      gaps: [admission.reason_codes[0] ?? "dynamic_movers_not_admitted"],
    });
  }

  const fetchMarketMovers = input.fetchMarketMovers ?? getTwelveDataMarketMovers;
  const attemptedAt = now.toISOString();

  try {
    const responses = await Promise.all(
      admission.directions.map((direction) =>
        fetchMarketMovers(direction, { signal: input.signal }),
      ),
    );
    throwIfAborted(input.signal);
    const movers: Array<{
      ticker: string;
      company_name: string | null;
      source: DynamicMarketMoversSource;
      source_rank: number;
      percent_change: number | null;
      volume: number | null;
      price: number | null;
      fetched_at: string;
      provider: string;
      tradable: boolean;
      context_only: boolean;
      warnings: string[];
    }> = responses.flatMap((response) =>
      response.movers.map((mover) => ({
        ticker: mover.symbol,
        company_name: mover.name,
        source: sourceForDirection(response.direction),
        source_rank: mover.rank,
        percent_change: mover.percent_change,
        volume: mover.volume,
        price: mover.last,
        fetched_at: response.fetched_at,
        provider: "twelve_data",
        tradable: true,
        context_only: false,
        warnings: [],
      })),
    );
    const dynamicMovers = buildDynamicMarketMoversSelection({
      scanWindow,
      providerResult: {
        provider: "twelve_data",
        status: movers.length > 0 ? "available" : "partial",
        fetched_at: attemptedAt,
        movers,
      },
      selectedBudget,
      now,
    });

    return buildResult({
      now,
      scanWindow,
      admission,
      dynamicMovers,
      attemptedAt,
      outcome: movers.length > 0 ? "available" : "empty",
      providerResponseObserved: true,
      warnings: dynamicMovers.summary.warnings.map((warning) => warning.warning_id),
      gaps: dynamicMovers.summary.gaps,
    });
  } catch (error) {
    throwIfAborted(input.signal);
    const providerFailure = classifyMarketDataProviderFailure(error);
    const outcome: MarketWideDiscoveryAttemptOutcome = providerFailure.outcome;
    const dynamicMovers = buildDynamicMarketMoversSelection({
      scanWindow,
      providerResult: {
        provider: "twelve_data",
        status: "error",
        fetched_at: attemptedAt,
        error: outcome,
      },
      selectedBudget,
      now,
    });

    return buildResult({
      now,
      scanWindow,
      admission,
      dynamicMovers,
      attemptedAt,
      outcome,
      providerResponseObserved: providerFailure.provider_response_observed,
      warnings: [outcome],
      gaps: [outcome],
    });
  }
}

function buildResult({
  now,
  scanWindow,
  admission,
  dynamicMovers,
  attemptedAt,
  outcome,
  providerResponseObserved,
  warnings,
  gaps,
}: {
  now: Date;
  scanWindow: IntradayScanWindow | "unknown";
  admission: MarketWideDiscoveryAdmission;
  dynamicMovers: DynamicMarketMoversSelection;
  attemptedAt: string | null;
  outcome: MarketWideDiscoveryAttemptOutcome;
  providerResponseObserved: boolean;
  warnings: string[];
  gaps: string[];
}): MarketWideDiscoveryResult {
  return {
    summary: {
      summary_version: MARKET_WIDE_DISCOVERY_SUMMARY_VERSION,
      summary_kind: "market_wide_discovery",
      generated_at: now.toISOString(),
      scan_window: scanWindow,
      admission,
      attempt: {
        attempted_at: attemptedAt,
        outcome,
        provider_response_observed: providerResponseObserved,
      },
      dynamic_intake: dynamicMovers.summary,
      warnings: unique(warnings),
      gaps: unique(gaps),
    },
    dynamic_movers: dynamicMovers,
  };
}

function sourceForDirection(
  direction: MarketWideDiscoveryDirection,
): DynamicMarketMoversSource {
  return direction === "losers" ? "top_loser" : "top_gainer";
}

function finiteNonNegative(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
}

function finitePositive(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.round(value))
    : null;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.length > 0))).sort();
}
