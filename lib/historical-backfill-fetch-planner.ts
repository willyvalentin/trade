import type { ProviderBudgetGuardSummary } from "@/lib/provider-budget-guard";
import type { ProviderPlanProfile } from "@/lib/provider-plan-profile";
import type { HistoricalCandleStorageVerificationStatus } from "@/lib/historical-candle-storage-readiness";
import type { TickerUniverseReadinessSummary } from "@/lib/ticker-universe-readiness";
import type {
  TureTickerProfile,
  TureTickerProfileSummary,
} from "@/lib/ticker-profile";

export type HistoricalBackfillFetchPlannerWindow =
  | "morning"
  | "midday"
  | "power_hour";

export type HistoricalBackfillFetchPlannerSource =
  | "static_universe"
  | "research_heavy"
  | "visible_recent"
  | "weak_follow_through"
  | "high_entry_not_triggering"
  | "sector_gap"
  | "dynamic_gap";

export type HistoricalBackfillFetchPlannerInput = {
  provider_plan_profile?: ProviderPlanProfile | null;
  provider_budget_guard?: ProviderBudgetGuardSummary | null;
  ticker_universe_readiness?: TickerUniverseReadinessSummary | null;
  ticker_profiles?: TureTickerProfile[] | null;
  ticker_profile_summary?: TureTickerProfileSummary | null;
  visible_recent_tickers?: string[] | null;
  static_universe_tickers?: string[] | null;
  history_days_requested?: number | null;
  max_selected_tickers?: number | null;
  migration_applied?: HistoricalCandleStorageVerificationStatus | boolean | null;
  now?: Date | string | null;
};

export type HistoricalBackfillFetchPlanSummary = {
  advisory_only: true;
  dry_run_only: true;
  plan_context: {
    provider: "twelve_data";
    plan_profile: string | null;
    preferred_interval: "5min";
    history_days_requested: number;
    history_days_planned: number;
    windows: HistoricalBackfillFetchPlannerWindow[];
    ticker_source_mix: Record<HistoricalBackfillFetchPlannerSource, number>;
  };
  ticker_selection: {
    candidate_tickers: string[];
    selected_tickers: string[];
    skipped_tickers: Array<{ ticker: string; reason: string }>;
    source_counts: Record<HistoricalBackfillFetchPlannerSource, number>;
  };
  request_plan: {
    total_planned_requests: number;
    estimated_provider_credits: number | null;
    estimated_candles: number | null;
    interval: "5min";
    grouped_by_day: Record<string, number>;
    grouped_by_ticker: Record<string, number>;
    grouped_by_window: Record<string, number>;
  };
  budget_policy: {
    live_scan_priority: "highest";
    outcome_evaluation_priority: "high";
    background_backfill_priority: "low";
    max_background_requests_per_minute: number | null;
    max_background_usage_percent_recommended: number;
    pause_near_scan_windows: true;
    pause_on_provider_warnings: true;
    pause_when_market_open_if_needed: true;
  };
  lookahead_safety: {
    analysis_cutoff_required: true;
    signal_generation_must_filter_to_cutoff: true;
    outcome_evaluation_after_cutoff_only: true;
    future_data_allowed_in_signal_generation: false;
  };
  readiness: {
    migration_required: true;
    migration_applied: HistoricalCandleStorageVerificationStatus;
    ready_to_fetch_historical_data: false;
    ready_to_persist_candles: false;
    ready_to_create_synthetic_outcomes: false;
    ready_to_run_replay: false;
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

const defaultWindows: HistoricalBackfillFetchPlannerWindow[] = [
  "morning",
  "midday",
  "power_hour",
];

const sourceOrder: HistoricalBackfillFetchPlannerSource[] = [
  "visible_recent",
  "research_heavy",
  "weak_follow_through",
  "high_entry_not_triggering",
  "sector_gap",
  "dynamic_gap",
  "static_universe",
];

const defaultHistoryDays = 5;
const maxInitialHistoryDays = 20;
const maxBackgroundUsagePercentRecommended = 15;
const candlesPerWindowEstimate = 24;

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : null;
}

function finiteCount(value: number | null | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : fallback;
}

function statusFromInput(
  value: HistoricalBackfillFetchPlannerInput["migration_applied"],
): HistoricalCandleStorageVerificationStatus {
  if (value === true || value === "yes") return "yes";
  if (value === false || value === "no") return "no";
  return "unknown";
}

function emptySourceCounts(): Record<HistoricalBackfillFetchPlannerSource, number> {
  return {
    static_universe: 0,
    research_heavy: 0,
    visible_recent: 0,
    weak_follow_through: 0,
    high_entry_not_triggering: 0,
    sector_gap: 0,
    dynamic_gap: 0,
  };
}

function addSource(
  sourcesByTicker: Map<string, Set<HistoricalBackfillFetchPlannerSource>>,
  ticker: string,
  source: HistoricalBackfillFetchPlannerSource,
) {
  const normalized = normalizeTicker(ticker);
  if (!normalized) return;
  const sources = sourcesByTicker.get(normalized) ?? new Set();
  sources.add(source);
  sourcesByTicker.set(normalized, sources);
}

function addSourceList(
  sourcesByTicker: Map<string, Set<HistoricalBackfillFetchPlannerSource>>,
  tickers: string[] | null | undefined,
  source: HistoricalBackfillFetchPlannerSource,
) {
  for (const ticker of tickers ?? []) addSource(sourcesByTicker, ticker, source);
}

function collectSources(input: HistoricalBackfillFetchPlannerInput) {
  const sourcesByTicker = new Map<string, Set<HistoricalBackfillFetchPlannerSource>>();
  const universe = input.ticker_universe_readiness ?? null;
  const profileSummary = input.ticker_profile_summary ?? null;

  addSourceList(sourcesByTicker, input.visible_recent_tickers, "visible_recent");
  addSourceList(sourcesByTicker, input.static_universe_tickers, "static_universe");
  addSourceList(
    sourcesByTicker,
    universe?.ticker_classification.research_heavy_candidates,
    "research_heavy",
  );
  addSourceList(
    sourcesByTicker,
    universe?.ticker_classification.dynamic_mover_gap_candidates,
    "dynamic_gap",
  );
  addSourceList(
    sourcesByTicker,
    profileSummary?.tickers_weak_follow_through,
    "weak_follow_through",
  );
  addSourceList(
    sourcesByTicker,
    profileSummary?.tickers_high_entry_not_triggering,
    "high_entry_not_triggering",
  );

  for (const profile of input.ticker_profiles ?? []) {
    if (profile.caution_flags.includes("weak_follow_through")) {
      addSource(sourcesByTicker, profile.ticker, "weak_follow_through");
    }
    if (profile.caution_flags.includes("high_entry_not_triggering_rate")) {
      addSource(sourcesByTicker, profile.ticker, "high_entry_not_triggering");
    }
    if (
      universe?.sector_coverage.underrepresented_sectors.includes(
        profile.sector_group,
      )
    ) {
      addSource(sourcesByTicker, profile.ticker, "sector_gap");
    }
  }

  return sourcesByTicker;
}

function sourceRank(sources: Set<HistoricalBackfillFetchPlannerSource>) {
  const ranks = [...sources].map((source) => sourceOrder.indexOf(source));
  return Math.min(...ranks.filter((rank) => rank >= 0), sourceOrder.length);
}

function buildGroupedByDay(historyDays: number, requestsPerDay: number) {
  const grouped: Record<string, number> = {};
  for (let day = 1; day <= historyDays; day += 1) {
    grouped[`day_minus_${day}`] = requestsPerDay;
  }
  return grouped;
}

function safeBackgroundRequestsPerMinute(input: {
  budgetGuard: ProviderBudgetGuardSummary | null;
}) {
  const dailyLimit = input.budgetGuard?.budget_limits?.daily_soft_limit;
  const dailyUsage = input.budgetGuard?.totals?.estimated_calls_per_day;
  if (
    typeof dailyLimit !== "number" ||
    !Number.isFinite(dailyLimit) ||
    typeof dailyUsage !== "number" ||
    !Number.isFinite(dailyUsage)
  ) {
    return null;
  }
  const headroom = Math.max(0, dailyLimit - dailyUsage);
  return Number(
    ((headroom * maxBackgroundUsagePercentRecommended) / 100 / 390).toFixed(3),
  );
}

export function buildHistoricalBackfillFetchPlan(
  input: HistoricalBackfillFetchPlannerInput = {},
): HistoricalBackfillFetchPlanSummary {
  const historyDaysRequested = finiteCount(
    input.history_days_requested,
    defaultHistoryDays,
  );
  const historyDaysPlanned = Math.min(
    Math.max(1, historyDaysRequested),
    maxInitialHistoryDays,
  );
  const selectedLimit = Math.min(
    Math.max(1, finiteCount(input.max_selected_tickers, 15)),
    25,
  );
  const sourcesByTicker = collectSources(input);
  const candidateTickers = [...sourcesByTicker.keys()].sort();
  const rankedTickers = [...candidateTickers].sort((first, second) => {
    const firstRank = sourceRank(sourcesByTicker.get(first) ?? new Set());
    const secondRank = sourceRank(sourcesByTicker.get(second) ?? new Set());
    return firstRank - secondRank || first.localeCompare(second);
  });
  const selectedTickers = rankedTickers.slice(0, selectedLimit);
  const selectedSet = new Set(selectedTickers);
  const skippedTickers = rankedTickers
    .slice(selectedLimit)
    .map((ticker) => ({ ticker, reason: "selected_ticker_limit" }));
  const sourceCounts = emptySourceCounts();

  for (const ticker of selectedTickers) {
    for (const source of sourcesByTicker.get(ticker) ?? []) {
      sourceCounts[source] += 1;
    }
  }

  const requestsPerDay = selectedTickers.length * defaultWindows.length;
  const totalPlannedRequests = requestsPerDay * historyDaysPlanned;
  const groupedByTicker = Object.fromEntries(
    selectedTickers.map((ticker) => [
      ticker,
      historyDaysPlanned * defaultWindows.length,
    ]),
  );
  const groupedByWindow = Object.fromEntries(
    defaultWindows.map((window) => [
      window,
      historyDaysPlanned * selectedTickers.length,
    ]),
  );
  const estimatedProviderCredits =
    totalPlannedRequests > 0 ? totalPlannedRequests : null;
  const estimatedCandles =
    totalPlannedRequests > 0
      ? totalPlannedRequests * candlesPerWindowEstimate
      : null;
  const migrationApplied = statusFromInput(input.migration_applied);
  const metadataGaps: string[] = [];
  const cautionFlags = [
    "dry_run_only",
    "provider_fetch_not_enabled",
    "candle_persistence_not_enabled",
  ];
  const reasonCodes = ["historical_backfill_fetch_planner_dry_run_only"];

  if (!input.provider_budget_guard) {
    metadataGaps.push("provider_budget_guard_missing");
    reasonCodes.push("provider_budget_unknown");
  }
  if (!input.provider_plan_profile && !input.provider_budget_guard?.plan_mode) {
    metadataGaps.push("provider_plan_profile_missing");
  }
  if (!input.ticker_universe_readiness) {
    metadataGaps.push("ticker_universe_readiness_missing");
  }
  if (candidateTickers.length === 0) {
    metadataGaps.push("candidate_tickers_missing");
    cautionFlags.push("no_historical_backfill_candidates");
  }
  if (historyDaysRequested > maxInitialHistoryDays) {
    cautionFlags.push("history_days_capped_to_initial_max");
  }
  if (skippedTickers.length > 0) {
    cautionFlags.push("candidate_tickers_skipped_by_limit");
  }
  if (migrationApplied !== "yes") {
    cautionFlags.push("migration_not_verified_for_fetch");
  }

  return {
    advisory_only: true,
    dry_run_only: true,
    plan_context: {
      provider: "twelve_data",
      plan_profile:
        input.provider_plan_profile?.effective_mode ??
        input.provider_budget_guard?.plan_mode ??
        null,
      preferred_interval: "5min",
      history_days_requested: historyDaysRequested,
      history_days_planned: historyDaysPlanned,
      windows: defaultWindows,
      ticker_source_mix: sourceCounts,
    },
    ticker_selection: {
      candidate_tickers: candidateTickers,
      selected_tickers: selectedTickers,
      skipped_tickers: skippedTickers.filter(
        (item) => !selectedSet.has(item.ticker),
      ),
      source_counts: sourceCounts,
    },
    request_plan: {
      total_planned_requests: totalPlannedRequests,
      estimated_provider_credits: estimatedProviderCredits,
      estimated_candles: estimatedCandles,
      interval: "5min",
      grouped_by_day: buildGroupedByDay(historyDaysPlanned, requestsPerDay),
      grouped_by_ticker: groupedByTicker,
      grouped_by_window: groupedByWindow,
    },
    budget_policy: {
      live_scan_priority: "highest",
      outcome_evaluation_priority: "high",
      background_backfill_priority: "low",
      max_background_requests_per_minute: safeBackgroundRequestsPerMinute({
        budgetGuard: input.provider_budget_guard ?? null,
      }),
      max_background_usage_percent_recommended:
        maxBackgroundUsagePercentRecommended,
      pause_near_scan_windows: true,
      pause_on_provider_warnings: true,
      pause_when_market_open_if_needed: true,
    },
    lookahead_safety: {
      analysis_cutoff_required: true,
      signal_generation_must_filter_to_cutoff: true,
      outcome_evaluation_after_cutoff_only: true,
      future_data_allowed_in_signal_generation: false,
    },
    readiness: {
      migration_required: true,
      migration_applied: migrationApplied,
      ready_to_fetch_historical_data: false,
      ready_to_persist_candles: false,
      ready_to_create_synthetic_outcomes: false,
      ready_to_run_replay: false,
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
      "verify_historical_candle_storage_migration",
      "review_dry_run_budget_plan_before_fetching",
      "choose_initial_ticker_batch_for_manual_review",
      "keep_live_scans_and_outcome_evaluation_priority_above_backfill",
      "add_provider_fetch_only_after_separate_approval",
    ],
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
  };
}

export function historicalBackfillFetchPlanJson(
  summary: HistoricalBackfillFetchPlanSummary,
) {
  return JSON.stringify(summary, null, 2);
}
