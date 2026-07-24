import type { ProviderBudgetGuardSummary } from "@/lib/provider-budget-guard";
import type { ProviderPlanProfile } from "@/lib/provider-plan-profile";
import type { TickerUniverseReadinessSummary } from "@/lib/ticker-universe-readiness";

export type HistoricalBackfillJobName =
  | "nightly_historical_backfill"
  | "intraday_shadow_sampling"
  | "ticker_memory_refresh"
  | "local_indicator_computation";

export type HistoricalBackfillJobPlan = {
  status: "planned";
  active: false;
  schedule: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  safety: string[];
};

export type HistoricalLearningBackfillReadinessInput = {
  provider_plan_profile?: ProviderPlanProfile | null;
  provider_budget_guard?: ProviderBudgetGuardSummary | null;
  ticker_universe_readiness?: TickerUniverseReadinessSummary | null;
};

export type HistoricalLearningBackfillReadinessSummary = {
  advisory_only: true;
  provider_capacity: {
    provider: "twelve_data";
    plan_profile: string | null;
    credits_per_minute_limit: number | null;
    current_usage_observed: number | null;
    estimated_available_headroom: number | null;
    safe_background_budget_per_minute: number | null;
  };
  backfill_scope: {
    supported_intervals: string[];
    preferred_interval: "5min" | "15min";
    supported_windows: ["morning", "midday", "power_hour"];
    recommended_history_days_initial: number;
    max_history_days_initial: number;
    preferred_ticker_sources: string[];
  };
  sample_types: {
    live_visible: boolean;
    research_only: boolean;
    shadow_intraday: boolean;
    historical_synthetic: boolean;
  };
  lookahead_safety: {
    required: true;
    rule: string;
    analysis_cutoff_required: true;
    outcome_after_cutoff_only: true;
    future_data_allowed_in_signal_generation: false;
  };
  proposed_jobs: Record<HistoricalBackfillJobName, HistoricalBackfillJobPlan>;
  storage_readiness: {
    suggested_entities: string[];
    requires_new_tables: boolean | null;
    can_start_with_existing_snapshots: boolean;
    must_mark_sample_origin: true;
    must_separate_live_from_synthetic: true;
  };
  budget_policy: {
    live_scan_priority: "highest";
    outcome_evaluation_priority: "high";
    background_backfill_priority: "low";
    pause_near_scan_windows: true;
    pause_on_provider_warnings: true;
    max_background_usage_percent_recommended: number;
  };
  readiness: {
    ready_to_plan: boolean;
    ready_to_fetch_historical_data: false;
    ready_to_persist_synthetic_outcomes: false;
    safe_to_affect_scanner: false;
  };
  recommended_next_steps: string[];
  safety: {
    advisory_only: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    synthetic_outcomes_persisted: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

const maxBackgroundUsagePercentRecommended = 15;

function finiteCount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

function estimatedHeadroom(input: {
  budgetGuard: ProviderBudgetGuardSummary | null;
}) {
  const dailyLimit = finiteCount(
    input.budgetGuard?.budget_limits?.daily_soft_limit,
  );
  const dailyUsage = finiteCount(
    input.budgetGuard?.totals?.estimated_calls_per_day,
  );

  if (dailyLimit === null || dailyUsage === null) return null;
  return Math.max(0, dailyLimit - dailyUsage);
}

function safeBackgroundBudgetPerMinute(headroom: number | null) {
  if (headroom === null) return null;
  const tradingDayMinutes = 390;
  return Number(
    ((headroom * maxBackgroundUsagePercentRecommended) / 100 / tradingDayMinutes).toFixed(3),
  );
}

function job(
  schedule: string,
  purpose: string,
  inputs: string[],
  outputs: string[],
  safety: string[],
): HistoricalBackfillJobPlan {
  return {
    status: "planned",
    active: false,
    schedule,
    purpose,
    inputs,
    outputs,
    safety,
  };
}

function proposedJobs(): Record<HistoricalBackfillJobName, HistoricalBackfillJobPlan> {
  return {
    nightly_historical_backfill: job(
      "after_market_close",
      "Replay previous trading days for research-only learning candidates.",
      [
        "static_universe",
        "research_heavy_tickers",
        "weak_or_interesting_tickers",
        "sector_gap_tickers",
      ],
      ["historical_research_candidates_planned_later"],
      [
        "not_active",
        "no_provider_fetch_added",
        "lookahead_cutoff_required",
        "live_cards_never_created",
      ],
    ),
    intraday_shadow_sampling: job(
      "market_day_outside_official_publish_flow",
      "Collect silent observations without publishing recommendation cards.",
      ["quotes_or_candles_planned_later", "official_window_context"],
      ["shadow_intraday_observations_planned_later"],
      ["not_active", "no_visible_cards", "no_broker_path"],
    ),
    ticker_memory_refresh: job(
      "nightly_or_after_outcome_evaluation",
      "Refresh ticker profile summaries from visible, research, shadow, and historical samples.",
      [
        "live_visible_outcomes",
        "research_only_outcomes",
        "shadow_intraday_samples",
        "historical_synthetic_samples",
      ],
      ["ticker_profile_memory_planned_later"],
      ["not_active", "sample_origin_must_be_preserved"],
    ),
    local_indicator_computation: job(
      "after_candles_available",
      "Compute local indicators from raw candles for diagnostics and future research labels.",
      ["raw_intraday_candles"],
      [
        "vwap",
        "atr",
        "relative_volume",
        "momentum",
        "opening_range",
        "trend_chop",
        "entry_distance",
        "follow_through",
        "best_worst_r",
      ],
      ["not_active", "no_scanner_score_change"],
    ),
  };
}

function recommendedNextSteps(input: {
  planProfile: string | null;
  budgetGuard: ProviderBudgetGuardSummary | null;
  tickerUniverseReadiness: TickerUniverseReadinessSummary | null;
}) {
  const steps = [
    "plan_historical_backfill_storage",
    "define_backfill_budget_policy",
    "write_lookahead_bias_test_cases",
    "define_sample_origin_metadata",
    "design_nightly_backfill_dry_run",
  ];

  if (!input.planProfile) steps.push("confirm_provider_plan_profile");
  if (!input.budgetGuard) steps.push("connect_provider_budget_diagnostics");
  if (!input.tickerUniverseReadiness) {
    steps.push("feed_ticker_universe_readiness_into_backfill_planning");
  }

  return Array.from(new Set(steps));
}

export function buildHistoricalLearningBackfillReadiness(
  input: HistoricalLearningBackfillReadinessInput = {},
): HistoricalLearningBackfillReadinessSummary {
  const planProfile =
    input.provider_plan_profile?.effective_mode ??
    input.provider_budget_guard?.plan_mode ??
    null;
  const currentUsageObserved =
    finiteCount(input.provider_budget_guard?.totals?.estimated_calls_per_day) ??
    null;
  const headroom = estimatedHeadroom({
    budgetGuard: input.provider_budget_guard ?? null,
  });
  const metadataGaps: string[] = [];
  const cautionFlags: string[] = [];

  if (!input.provider_plan_profile) metadataGaps.push("provider_plan_profile_missing");
  if (!input.provider_budget_guard) metadataGaps.push("provider_budget_guard_missing");
  if (!input.ticker_universe_readiness) {
    metadataGaps.push("ticker_universe_readiness_missing");
  }
  if (headroom === null) cautionFlags.push("provider_headroom_unknown");

  return {
    advisory_only: true,
    provider_capacity: {
      provider: "twelve_data",
      plan_profile: planProfile,
      credits_per_minute_limit: null,
      current_usage_observed: currentUsageObserved,
      estimated_available_headroom: headroom,
      safe_background_budget_per_minute: safeBackgroundBudgetPerMinute(headroom),
    },
    backfill_scope: {
      supported_intervals: ["1min", "5min", "15min", "30min", "60min"],
      preferred_interval: "5min",
      supported_windows: ["morning", "midday", "power_hour"],
      recommended_history_days_initial: 5,
      max_history_days_initial: 20,
      preferred_ticker_sources: [
        "static_universe",
        "research_heavy_candidates",
        "weak_or_interesting_tickers",
        "sector_gap_tickers",
        "dynamic_gap_candidates",
      ],
    },
    sample_types: {
      live_visible: true,
      research_only: true,
      shadow_intraday: true,
      historical_synthetic: true,
    },
    lookahead_safety: {
      required: true,
      rule:
        "Historical simulation may only use candles available up to the simulated analysis timestamp; outcomes must use candles after that cutoff.",
      analysis_cutoff_required: true,
      outcome_after_cutoff_only: true,
      future_data_allowed_in_signal_generation: false,
    },
    proposed_jobs: proposedJobs(),
    storage_readiness: {
      suggested_entities: [
        "historical_learning_samples",
        "historical_learning_outcomes",
        "sample_origin_metadata",
        "ticker_memory_snapshots",
        "local_indicator_snapshots",
      ],
      requires_new_tables: null,
      can_start_with_existing_snapshots: true,
      must_mark_sample_origin: true,
      must_separate_live_from_synthetic: true,
    },
    budget_policy: {
      live_scan_priority: "highest",
      outcome_evaluation_priority: "high",
      background_backfill_priority: "low",
      pause_near_scan_windows: true,
      pause_on_provider_warnings: true,
      max_background_usage_percent_recommended:
        maxBackgroundUsagePercentRecommended,
    },
    readiness: {
      ready_to_plan: true,
      ready_to_fetch_historical_data: false,
      ready_to_persist_synthetic_outcomes: false,
      safe_to_affect_scanner: false,
    },
    recommended_next_steps: recommendedNextSteps({
      planProfile,
      budgetGuard: input.provider_budget_guard ?? null,
      tickerUniverseReadiness: input.ticker_universe_readiness ?? null,
    }),
    safety: {
      advisory_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      synthetic_outcomes_persisted: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    reason_codes: [
      "historical_backfill_readiness_only",
      "lookahead_safety_required",
      "background_jobs_planned_not_active",
      "live_scanner_protected",
    ],
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
  };
}

export function historicalLearningBackfillReadinessJson(
  summary: HistoricalLearningBackfillReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
