import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";
import type { DailyRecommendationTradeTargetsSummary } from "@/lib/daily-recommendation-trade-targets";
import type { DayTradeWindowRecommendationTargetSummary } from "@/lib/day-trade-window-recommendation-target";
import type { DynamicMarketMoversSummary } from "@/lib/dynamic-market-movers";
import type { MarketSessionEvaluation, MarketSessionStatus } from "@/lib/market-session";
import type { ProviderBudgetGuardSummary } from "@/lib/provider-budget-guard";
import type { ProviderPlanProfile } from "@/lib/provider-plan-profile";
import type { RealRecommendationOutputReadinessSummary } from "@/lib/real-recommendation-output-readiness";
import type { RecommendationBatchSummary } from "@/lib/recommendation-batch-memory";
import type { RecommendationEngineControlCenterSummary } from "@/lib/recommendation-engine-control-center";
import type { EntryTuningProposal } from "@/lib/entry-tuning-proposal";
import type { RecommendationOutcomeLearningInsightsSummary } from "@/lib/recommendation-outcome-learning-insights";
import type { RecommendationPerformanceStatistics } from "@/lib/recommendation-performance-statistics";
import type { RecommendationScanRunHistorySummary } from "@/lib/recommendation-scan-run-history";
import type { RecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import type { ScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import type { ScannerOutputQaSummary } from "@/lib/scanner-output-qa";
import type { ScannerUniverseCoverageSummary } from "@/lib/scanner-universe";
import type { LiveMarketTrialReadinessSummary } from "@/lib/live-market-trial-readiness";
import type { LiveMarketTrialRunbookSummary } from "@/lib/live-market-trial-runbook";
import type { ActiveScanTrace } from "@/lib/active-scan-trace";

export type MarketDiagnosticsConsoleSeverity =
  | "info"
  | "warning"
  | "critical";

export type MarketDiagnosticsConsoleFormat =
  | "summary_text"
  | "json"
  | "markdown";

export type MarketDiagnosticsConsoleWarning = {
  warning_id: string;
  severity: MarketDiagnosticsConsoleSeverity;
  source: string;
  message: string;
};

export type MarketDiagnosticsConsoleSection = {
  section_id: string;
  title: string;
  severity: MarketDiagnosticsConsoleSeverity;
  lines: string[];
  metrics: Record<string, string | number | boolean | null>;
};

export type MarketDiagnosticsConsoleCopyPayload = {
  format: MarketDiagnosticsConsoleFormat;
  generated_at: string;
  character_count: number;
  content: string;
};

export type MarketDiagnosticsConsoleSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "market_diagnostics_console";
  generated_at: string;
  overall_status:
    | "ready_for_recommendation_logging"
    | "ready_for_real_data_observation"
    | "ready_with_warnings"
    | "waiting_for_next_window"
    | "needs_review"
    | "blocked"
    | "unknown";
  suggested_next_action: string;
  sections: MarketDiagnosticsConsoleSection[];
  top_blockers: MarketDiagnosticsConsoleWarning[];
  top_warnings: MarketDiagnosticsConsoleWarning[];
  copy_payloads: {
    summary_text: MarketDiagnosticsConsoleCopyPayload;
    json: MarketDiagnosticsConsoleCopyPayload;
    markdown: MarketDiagnosticsConsoleCopyPayload;
  };
};

export type MarketDiagnosticsConsoleInput = {
  market_session: MarketSessionEvaluation;
  market_status: MarketSessionStatus | null;
  data_mode_clarity: DataModeClaritySummary;
  engine_control_center: RecommendationEngineControlCenterSummary;
  live_market_trial_readiness: LiveMarketTrialReadinessSummary;
  live_market_trial_runbook: LiveMarketTrialRunbookSummary;
  scan_orchestration: DayTradeScanOrchestrationSummary;
  serving_cadence: RecommendationServingCadenceSummary;
  provider_budget_guard: ProviderBudgetGuardSummary;
  provider_plan_profile?: ProviderPlanProfile | null;
  scanner_universe: ScannerUniverseCoverageSummary;
  dynamic_movers?: DynamicMarketMoversSummary | null;
  scanner_ranking?: ScannerCandidateRankingSummary | null;
  active_scan_trace?: ActiveScanTrace | null;
  scan_readback?: {
    market_closed_readback_mode?: boolean | null;
    latest_trading_day_with_official_batch?: string | null;
    latest_review_batch_fingerprint?: string | null;
    latest_review_batch_source?: string | null;
    closed_market_scanner_idle_reason?: string | null;
    current_batch_fingerprint?: string | null;
    current_batch_source?: string | null;
    current_batch_recommendation_count?: number | null;
    current_batch_snapshot_count?: number | null;
    current_batch_visible_grid_count?: number | null;
    current_batch_tickers?: string[];
    current_batch_override_reason?: string | null;
    active_trace_batch_fingerprint?: string | null;
    active_trace_published_count?: number | null;
    active_trace_snapshot_count?: number | null;
    current_batch_snapshot_members?: string[];
    current_batch_recommendation_rows?: string[];
    current_batch_mismatch_reason?: string | null;
    previous_successful_batch_fingerprint?: string | null;
    stale_trace_batch_mismatch?: boolean | null;
    latest_official_batch_fingerprint?: string | null;
    latest_official_scan_run_id?: string | null;
    latest_official_scan_run_fingerprint?: string | null;
    batch_expected_count?: number | null;
    recommendation_rows_found_count?: number | null;
    missing_batch_member_ids?: string[];
    missing_batch_member_tickers?: string[];
    hidden_reason_by_id?: Record<string, string[]>;
    latest_successful_live_recommendation_ids?: string[];
    latest_successful_live_recommendation_tickers?: string[];
    visible_primary_recommendation_ids?: string[];
    visible_primary_recommendation_tickers?: string[];
    hidden_live_recommendation_ids?: string[];
    hidden_live_recommendation_tickers?: string[];
    hidden_reason_breakdown?: Record<string, number>;
    extra_visible_primary_ids?: string[];
    extra_visible_primary_tickers?: string[];
    primary_grid_strict_batch_filter_applied?: boolean | null;
    primary_grid_fallback_reason?: string | null;
    visible_tier_source?: string | null;
    visible_unknown_tier_count?: number | null;
    missing_tier_by_id?: Record<string, string>;
    latest_successful_scan?: {
      result?: string | null;
      created_at?: string | null;
      scan_window?: string | null;
      visible_recommendation_count?: number | null;
      message?: string | null;
      source?: string | null;
    } | null;
    latest_attempted_scan?: {
      result?: string | null;
      created_at?: string | null;
      scan_window?: string | null;
      visible_recommendation_count?: number | null;
      message?: string | null;
      source?: string | null;
    } | null;
  } | null;
  stats_today_readback?: {
    stats_today_positions_considered?: number | null;
    stats_today_positions_excluded_demo?: number | null;
    stats_today_positions_excluded_mock?: number | null;
    stats_today_positions_excluded_not_today?: number | null;
    stats_today_positions_excluded_missing_execution?: number | null;
    stats_today_positions_excluded_non_live_execution?: number | null;
    stats_today_closed_count_source?: string | null;
  } | null;
  ui_refresh?: {
    active_tab?: string | null;
    islands?: Record<
      string,
      {
        is_refreshing?: boolean | null;
        last_updated_at?: string | null;
        error?: string | null;
        changed_item_count?: number | null;
      }
    >;
  } | null;
  outcome_evaluation?: {
    market_closed_readback_mode?: boolean | null;
    latest_trading_day_with_official_batch?: string | null;
    latest_review_batch_fingerprint?: string | null;
    latest_review_batch_source?: string | null;
    current_batch_fingerprint?: string | null;
    current_official_batch_fingerprint?: string | null;
    current_batch_expected_outcomes?: number | null;
    current_batch_persisted_outcomes?: number | null;
    shadow_snapshot_metadata_present_count?: number | null;
    shadow_snapshot_metadata_missing_count?: number | null;
    shadow_snapshot_variant_counts?: Record<string, number>;
    shadow_snapshot_source_counts?: Record<string, number>;
    learning_insights_source_batch_fingerprint?: string | null;
    learning_insights_source_reason?: string | null;
    latest_counterfactual_ready_batch_fingerprint?: string | null;
    latest_evaluated_batch_fingerprint?: string | null;
    current_batch_snapshot_count?: number | null;
    expected_outcome_count?: number | null;
    persisted_outcome_count?: number | null;
    evaluated_outcome_count?: number | null;
    incomplete_outcome_count?: number | null;
    pending_outcome_count?: number | null;
    latest_evaluated_at?: string | null;
    horizons_covered?: string[];
    provider_limit_warning?: boolean | null;
    outcome_rows_raw_count?: number | null;
    outcome_rows_deduped_count?: number | null;
    outcome_rows_replaced_by_better_count?: number | null;
    outcome_dedupe_strategy?: string | null;
    stale_incomplete_rows_ignored_count?: number | null;
    outcome_rows_loaded_count?: number | null;
    outcome_batch_fingerprints?: string[];
    outcome_snapshot_match_count?: number | null;
    outcome_unmatched_count?: number | null;
    outcome_batch_groups_count?: number | null;
    latest_evaluated_batch_selection_reason?: string | null;
    latest_evaluated_batch_rows?: number | null;
    outcome_snapshot_backfill_attempted?: boolean | null;
    outcome_snapshot_backfill_count?: number | null;
    outcome_batch_backfill_count?: number | null;
    outcome_backfill_trigger_reason?: string | null;
    outcome_snapshot_fingerprints_requested_count?: number | null;
    outcome_snapshot_fingerprints_found_count?: number | null;
    outcome_batch_fingerprints_requested_count?: number | null;
    outcome_batch_fingerprints_found_count?: number | null;
    outcome_matching_recomputed_after_backfill?: boolean | null;
    outcome_backfill_error?: string | null;
    readback_hydration_complete?: boolean | null;
    latest_run_status?: string | null;
    latest_run_at?: string | null;
    latest_run_batch_fingerprint?: string | null;
    latest_run_horizons?: string[];
    outcomes_created_count?: number | null;
    outcomes_updated_count?: number | null;
    skipped_not_old_enough_count?: number | null;
    missing_candles_count?: number | null;
    provider_error_count?: number | null;
    candle_requests_planned?: number | null;
    candle_requests_executed?: number | null;
    candle_requests_saved_by_reuse?: number | null;
    provider_plan_profile_mode?: string | null;
    provider_plan_profile_source?: string | null;
    server_plan_mode?: string | null;
    public_plan_mode?: string | null;
    plan_mode_mismatch?: boolean | null;
    profile_budget_limit?: number | null;
    override_budget_limit?: number | null;
    effective_budget_limit?: number | null;
    provider_budget_limit?: number | null;
    skipped_due_to_budget_count?: number | null;
    pending_provider_budget_count?: number | null;
    retry_incomplete_count?: number | null;
    unique_candle_requests_count?: number | null;
    empty_candle_response_count?: number | null;
    provider_limit_count?: number | null;
    candle_request_debug_sample?: Array<Record<string, unknown>>;
    enrichment_mode?: boolean | null;
    completed_outcomes_seen_count?: number | null;
    completed_outcomes_enriched_count?: number | null;
    completed_outcomes_skipped_already_enriched_count?: number | null;
    retained_candles_added_count?: number | null;
    retained_candles_available_count?: number | null;
    counterfactual_ready_count?: number | null;
    shadow_eligible_snapshot_count?: number | null;
    shadow_missing_metadata_count?: number | null;
    shadow_entry_trial_count?: number | null;
    shadow_entry_triggered_count?: number | null;
    outcome_provider_budget_status?: string | null;
    next_retry_suggestion?: string | null;
    persistence_status?: string | null;
    persistence_mode?: string | null;
    elapsed_ms?: number | null;
    tickers_evaluated?: string[];
  } | null;
  outcome_learning?: RecommendationOutcomeLearningInsightsSummary | null;
  entry_tuning_proposal?: EntryTuningProposal | null;
  scanner_output_qa: ScannerOutputQaSummary;
  real_output_readiness: RealRecommendationOutputReadinessSummary;
  batch_memory: RecommendationBatchSummary;
  scan_run_history: RecommendationScanRunHistorySummary;
  daily_targets: DailyRecommendationTradeTargetsSummary;
  day_window_target: DayTradeWindowRecommendationTargetSummary;
  performance: RecommendationPerformanceStatistics;
  persistence_counts?: {
    scan_runs?: number | null;
    batches?: number | null;
    snapshots?: number | null;
    outcomes?: number | null;
  } | null;
  now?: Date | string | null;
};

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function count(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function words(value: string | null | undefined) {
  return (value || "unknown").replaceAll("_", " ");
}

function compact(value: string | null | undefined, fallback = "unknown") {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : fallback;
}

function bool(value: boolean) {
  return value ? "yes" : "no";
}

function providerPlanProfileMetrics(input: MarketDiagnosticsConsoleInput) {
  const activeTrace = input.active_scan_trace;
  const outcome = input.outcome_evaluation;
  const fallback = input.provider_plan_profile;
  const mode =
    activeTrace?.provider_plan_profile_mode ??
    outcome?.provider_plan_profile_mode ??
    fallback?.effective_mode ??
    "unknown";
  const source =
    activeTrace?.provider_plan_profile_source ??
    outcome?.provider_plan_profile_source ??
    fallback?.source ??
    "unknown";
  const serverPlanMode =
    activeTrace?.server_plan_mode ??
    outcome?.server_plan_mode ??
    fallback?.server_plan_mode ??
    "unknown";
  const publicPlanMode =
    activeTrace?.public_plan_mode ??
    outcome?.public_plan_mode ??
    fallback?.public_plan_mode ??
    "unknown";
  const mismatch =
    activeTrace?.plan_mode_mismatch ??
    outcome?.plan_mode_mismatch ??
    fallback?.plan_mode_mismatch ??
    false;
  const scanTickerCap =
    activeTrace?.effective_scan_ticker_cap ??
    fallback?.profile_scan_ticker_cap ??
    null;
  const profileScanTickerCap =
    activeTrace?.profile_scan_ticker_cap ??
    fallback?.profile_scan_ticker_cap ??
    null;
  const outcomeBudgetLimit =
    outcome?.effective_budget_limit ??
    outcome?.provider_budget_limit ??
    fallback?.profile_outcome_candle_requests_per_run ??
    null;
  const profileBudgetLimit =
    outcome?.profile_budget_limit ??
    fallback?.profile_outcome_candle_requests_per_run ??
    null;
  const skipOpenAi =
    activeTrace?.effective_scheduled_skip_openai ??
    fallback?.profile_scheduled_skip_openai ??
    null;
  const timeoutMs =
    activeTrace?.effective_scheduled_timeout_ms ??
    fallback?.profile_scheduled_timeout_ms ??
    null;
  const cadence =
    fallback?.profile_background_scan_cadence_minutes ?? null;
  const notes =
    activeTrace?.profile_notes.length
      ? activeTrace.profile_notes
      : fallback?.profile_notes ?? [];

  return {
    mode,
    source,
    serverPlanMode,
    publicPlanMode,
    mismatch,
    scanTickerCap,
    profileScanTickerCap,
    outcomeBudgetLimit,
    profileBudgetLimit,
    overrideBudgetLimit: outcome?.override_budget_limit ?? null,
    skipOpenAi,
    timeoutMs,
    cadence,
    envScanTickerOverride: activeTrace?.env_scan_ticker_override ?? null,
    notes,
  };
}

type ProviderUpgradeChecklistStatus =
  | "free_safe_ready"
  | "grow_ready_pending_env_change"
  | "grow_active"
  | "pro_active"
  | "custom_active_needs_review"
  | "env_mismatch_needs_fix"
  | "unknown_plan_free_safe";

function providerUpgradeChecklist(
  profile: ReturnType<typeof providerPlanProfileMetrics>,
) {
  const envConsistent = !profile.mismatch;
  const upgradeTarget = "grow";
  const beforeUpgradeEnvValues = [
    "TWELVE_DATA_PLAN_MODE=free",
    "NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE=free",
  ];
  const growEnvValues = [
    "TWELVE_DATA_PLAN_MODE=grow",
    "NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE=grow",
  ];
  const mode = profile.mode;
  const isFallbackUnknown = profile.source === "fallback_free_safe";
  const status: ProviderUpgradeChecklistStatus = profile.mismatch
    ? "env_mismatch_needs_fix"
    : mode === "grow"
      ? "grow_active"
      : mode === "pro"
        ? "pro_active"
        : mode === "custom"
          ? "custom_active_needs_review"
          : isFallbackUnknown
            ? "unknown_plan_free_safe"
            : mode === "free" &&
                profile.serverPlanMode === "free" &&
                profile.publicPlanMode === "free"
              ? "grow_ready_pending_env_change"
              : "free_safe_ready";
  const messageByStatus: Record<ProviderUpgradeChecklistStatus, string> = {
    free_safe_ready:
      "Free-safe mode is active. Upgrade-ready profile is available.",
    grow_ready_pending_env_change:
      "Grow profile is ready. Set TWELVE_DATA_PLAN_MODE=grow and NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE=grow after upgrading.",
    grow_active:
      "Grow profile active. Monitor provider calls and outcome completion today.",
    pro_active:
      "Pro profile active. Monitor broad scan coverage and outcome completion today.",
    custom_active_needs_review:
      "Custom profile active. Verify explicit caps.",
    env_mismatch_needs_fix:
      "Server/public plan mismatch. Fix Netlify env before relying on displayed profile.",
    unknown_plan_free_safe:
      "Unknown plan env is using Free-safe fallback. Set explicit plan env before upgrading.",
  };
  const safeToUpgrade =
    envConsistent &&
    (status === "free_safe_ready" ||
      status === "grow_ready_pending_env_change" ||
      status === "unknown_plan_free_safe");

  return {
    status,
    message: messageByStatus[status],
    envConsistent,
    upgradeTarget,
    beforeUpgradeEnvValues,
    growEnvValues,
    nextEnvValues:
      status === "grow_active" || status === "pro_active"
        ? []
        : status === "env_mismatch_needs_fix"
          ? growEnvValues
          : growEnvValues,
    safeToUpgrade,
  };
}

function normalizeSeverity(
  value: string | null | undefined,
): MarketDiagnosticsConsoleSeverity {
  if (value === "critical" || value === "blocked") {
    return "critical";
  }

  if (value === "warning") {
    return "warning";
  }

  return "info";
}

function section(
  input: MarketDiagnosticsConsoleSection,
): MarketDiagnosticsConsoleSection {
  return input;
}

function warning(
  warning_id: string,
  severity: MarketDiagnosticsConsoleSeverity,
  source: string,
  message: string,
): MarketDiagnosticsConsoleWarning {
  return {
    warning_id,
    severity,
    source,
    message,
  };
}

function dedupeWarnings(
  warnings: MarketDiagnosticsConsoleWarning[],
): MarketDiagnosticsConsoleWarning[] {
  const seen = new Set<string>();
  const result: MarketDiagnosticsConsoleWarning[] = [];

  for (const item of warnings) {
    const key = `${item.source}:${item.message}`.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }

  return result;
}

function highestSeverity(
  warnings: MarketDiagnosticsConsoleWarning[],
): MarketDiagnosticsConsoleSeverity {
  if (warnings.some((item) => item.severity === "critical")) {
    return "critical";
  }

  if (warnings.some((item) => item.severity === "warning")) {
    return "warning";
  }

  return "info";
}

function isClosedMarketWaitState(input: MarketDiagnosticsConsoleInput) {
  return (
    input.scan_orchestration.active_window === "closed" ||
    input.scan_orchestration.active_window === "outside_window" ||
    input.scan_orchestration.decision === "market_closed" ||
    input.scan_orchestration.decision === "outside_scan_window" ||
    input.market_status?.dayType === "weekend" ||
    input.market_status?.dayType === "holiday" ||
    input.market_session.phase === "closed" ||
    input.market_session.phase === "holiday"
  );
}

function isCoreReadinessSource(source: string) {
  return source === "environment" || source === "provider" || source === "scheduler";
}

function determineOverallStatus(
  input: MarketDiagnosticsConsoleInput,
  blockers: MarketDiagnosticsConsoleWarning[],
) {
  if (
    blockers.length > 0 ||
    input.provider_budget_guard.status === "over_budget" ||
    input.provider_budget_guard.status === "rate_limited" ||
    input.provider_budget_guard.status === "provider_unavailable"
  ) {
    return "blocked" as const;
  }

  if (
    input.scan_orchestration.decision === "market_closed" ||
    input.scan_orchestration.decision === "outside_scan_window" ||
    input.live_market_trial_runbook.status === "waiting_for_next_window"
  ) {
    return "waiting_for_next_window" as const;
  }

  if (input.live_market_trial_readiness.can_do_now.log_recommendations) {
    return "ready_for_recommendation_logging" as const;
  }

  if (input.live_market_trial_readiness.can_do_now.observe_only) {
    return input.live_market_trial_readiness.warnings.length > 0
      ? ("ready_with_warnings" as const)
      : ("ready_for_real_data_observation" as const);
  }

  if (
    input.engine_control_center.overall_status === "degraded" ||
    input.engine_control_center.overall_status === "thin_data" ||
    input.scanner_output_qa.overall_status !== "healthy" ||
    input.real_output_readiness.overall_status === "needs_review" ||
    input.live_market_trial_readiness.warnings.length > 0
  ) {
    return "needs_review" as const;
  }

  return "unknown" as const;
}

function suggestedNextAction(
  input: MarketDiagnosticsConsoleInput,
  overallStatus: MarketDiagnosticsConsoleSummary["overall_status"],
) {
  if (overallStatus === "blocked") {
    if (
      input.provider_budget_guard.status === "over_budget" ||
      input.provider_budget_guard.status === "rate_limited" ||
      input.provider_budget_guard.status === "provider_unavailable"
    ) {
      return `Resolve provider/budget issue: ${input.provider_budget_guard.next_action.label}.`;
    }

    return `Resolve readiness blocker: ${
      input.live_market_trial_readiness.blockers[0]?.message ??
      input.live_market_trial_runbook.next_action.label
    }`;
  }

  if (overallStatus === "waiting_for_next_window") {
    return `Wait for next window: ${compact(
      input.scan_orchestration.next_window_label,
      "next eligible scan window",
    )}.`;
  }

  if (
    input.scanner_output_qa.overall_status === "blocked" &&
    !isClosedMarketWaitState(input)
  ) {
    return `Review scanner output QA: ${input.scanner_output_qa.recommended_next_action.label}.`;
  }

  if (overallStatus === "ready_for_recommendation_logging") {
    return "Ready for recommendation logging; wait for scheduled automation and review official batches.";
  }

  if (overallStatus === "ready_for_real_data_observation") {
    return "Ready for real-data observation; monitor scheduled scans and do not force recommendations.";
  }

  return input.live_market_trial_runbook.next_action.label;
}

function buildWarnings(input: MarketDiagnosticsConsoleInput) {
  const closedMarketWaitState = isClosedMarketWaitState(input);
  const hasSuccessfulLiveReadback =
    (input.scan_readback?.latest_successful_scan?.visible_recommendation_count ??
      0) > 0;
  const blockers = dedupeWarnings([
    ...input.live_market_trial_readiness.blockers
      .filter((item) =>
        hasSuccessfulLiveReadback && item.source === "scanner"
          ? false
          : closedMarketWaitState
            ? isCoreReadinessSource(item.source)
            : item.source !== "market_session",
      )
      .map((item) =>
        warning(
          `readiness:${item.blocker_id}`,
          "critical",
          item.source,
          item.message,
        ),
      ),
    ...input.live_market_trial_runbook.blockers.map((item) =>
      warning(`runbook:${item.warning_id}`, "critical", "runbook", item.message),
    ),
    ...(closedMarketWaitState || hasSuccessfulLiveReadback
      ? []
      : input.real_output_readiness.blockers.map((item) =>
          warning(
            `real_output:${item.blocker_id}`,
            "critical",
            "real_output",
            item.message,
          ),
        )),
    ...(input.scanner_output_qa.overall_status === "blocked" &&
    !closedMarketWaitState &&
    !hasSuccessfulLiveReadback
      ? [
          warning(
            "scanner_qa:blocked",
            "critical",
            "scanner_qa",
            input.scanner_output_qa.summary,
          ),
        ]
      : []),
  ]).slice(0, 8);

  const warnings = dedupeWarnings([
    ...(closedMarketWaitState
      ? [
          warning(
            "closed_market_wait:no_active_candidates",
            "info",
            "closed_market_wait",
            "No active scanner candidates expected while market is closed.",
          ),
        ]
      : []),
    ...input.live_market_trial_readiness.warnings.map((item) =>
      warning(`readiness:${item.warning_id}`, "warning", item.source, item.message),
    ),
    ...input.live_market_trial_runbook.warnings.map((item) =>
      warning(`runbook:${item.warning_id}`, item.severity, "runbook", item.message),
    ),
    ...input.provider_budget_guard.warnings.map((item) =>
      warning(
        `provider:${item.warning_id}`,
        normalizeSeverity(item.severity),
        "provider",
        item.message,
      ),
    ),
    ...input.scan_orchestration.warnings.map((item) =>
      warning(
        `orchestration:${item.warning_id}`,
        normalizeSeverity(item.severity),
        item.warning_id.includes("market_calendar") ||
          item.warning_id.includes("polygon_calendar")
          ? "market_calendar"
          : "scan_orchestration",
        item.message,
      ),
    ),
    ...input.serving_cadence.warnings.map((item) =>
      warning(
        `serving:${item.warning_id}`,
        normalizeSeverity(item.severity),
        "serving",
        item.message,
      ),
    ),
    ...input.scanner_universe.warnings.map((item) =>
      warning(
        `universe:${item.warning_id}`,
        normalizeSeverity(item.severity),
        "scanner_universe",
        item.message,
      ),
    ),
    ...(input.dynamic_movers?.warnings ?? []).map((item) =>
      warning(
        `dynamic_movers:${item.warning_id}`,
        normalizeSeverity(item.severity),
        "dynamic_movers",
        item.message,
      ),
    ),
    ...(input.scanner_ranking?.warnings ?? []).map((item) =>
      warning(
        `ranking:${item.warning_id}`,
        normalizeSeverity(item.severity),
        "scanner_ranking",
        item.message,
      ),
    ),
    ...(closedMarketWaitState
      ? []
      : input.scanner_output_qa.warnings.map((item) =>
          warning(
            `scanner_qa:${item.warning_id}`,
            "warning",
            "scanner_qa",
            item.message,
          ),
        )),
    ...(closedMarketWaitState && input.scanner_output_qa.overall_status === "blocked"
      ? [
          warning(
            "scanner_qa:closed_market_not_applicable",
            "info",
            "closed_market_wait",
            "Scanner output will be evaluated during the next active window.",
          ),
        ]
      : []),
    ...(hasSuccessfulLiveReadback
      ? []
      : input.real_output_readiness.blockers.map((item) =>
        closedMarketWaitState
        ? warning(
            `real_output:${item.blocker_id}`,
            "warning",
            "real_output",
            item.message.includes("Demo") || item.message.includes("dev-preview")
              ? "Demo/dev-preview recommendations are visible, but real-data trial will be evaluated during active window."
              : item.message,
          )
        : warning(
            `real_output:${item.blocker_id}`,
            "critical",
            "real_output",
            item.message,
          ),
      )),
    ...input.real_output_readiness.warnings.map((item) =>
      warning(`real_output:${item.warning_id}`, "warning", "real_output", item.message),
    ),
    ...input.batch_memory.warnings.map((item) =>
      warning(
        `batch:${item.warning_id}`,
        normalizeSeverity(item.severity),
        "batch_memory",
        item.message,
      ),
    ),
    ...input.scan_run_history.top_warnings.map((item) =>
      warning(
        `scan_run_history:${item.warning_id}`,
        "warning",
        "scan_run_history",
        item.message,
      ),
    ),
    ...input.daily_targets.warnings.map((item) =>
      warning(
        `daily_targets:${item.warning_id}`,
        normalizeSeverity(item.severity),
        "daily_targets",
        item.message,
      ),
    ),
  ]).slice(0, 12);

  return { blockers, warnings };
}

function lineValue(label: string, value: string | number | boolean | null) {
  return `${label}: ${value === null ? "unknown" : String(value)}`;
}

function buildSections(
  input: MarketDiagnosticsConsoleInput,
  warnings: {
    blockers: MarketDiagnosticsConsoleWarning[];
    warnings: MarketDiagnosticsConsoleWarning[];
  },
): MarketDiagnosticsConsoleSection[] {
  const latestBatch = input.batch_memory.latest_batch;
  const providerPlanProfile = providerPlanProfileMetrics(input);
  const providerUpgrade = providerUpgradeChecklist(providerPlanProfile);
  const closedMarketWaitState = isClosedMarketWaitState(input);
  const hasSuccessfulLiveReadback =
    (input.scan_readback?.latest_successful_scan?.visible_recommendation_count ??
      0) > 0;
  const scannerQaLabel =
    hasSuccessfulLiveReadback &&
    input.scanner_output_qa.overall_status === "blocked"
      ? "observed through successful live batch"
      : closedMarketWaitState && input.scanner_output_qa.overall_status === "blocked"
        ? "not applicable while market closed"
        : words(input.scanner_output_qa.overall_status);
  const traceRankingLabel =
    input.active_scan_trace?.ranking.ranking_attempted &&
    input.active_scan_trace.ranking.ranked_count > 0
      ? `${input.active_scan_trace.ranking.ranked_count} ranked / ${input.active_scan_trace.ranking.selected_count} selected`
      : null;
  const rankingLabel =
    closedMarketWaitState && input.scanner_output_qa.overall_status === "blocked"
      ? "not observed (expected while market closed)"
      : input.scanner_ranking
        ? `${words(input.scanner_ranking.target_status)} / ${input.scanner_ranking.selected_count} selected`
        : traceRankingLabel ??
          (hasSuccessfulLiveReadback
            ? "observed through successful live batch"
            : "not observed");
  const latestSuccessfulScan = input.scan_readback?.latest_successful_scan ?? null;
  const latestAttemptedScan = input.scan_readback?.latest_attempted_scan ?? null;
  const successfulScanLabel = latestSuccessfulScan
    ? `${compact(latestSuccessfulScan.result, "unknown")} @ ${compact(
        latestSuccessfulScan.created_at,
        "unknown",
      )}`
    : "not observed";
  const attemptedScanLabel = latestAttemptedScan
    ? `${compact(latestAttemptedScan.result, "unknown")} @ ${compact(
        latestAttemptedScan.created_at,
        "unknown",
      )}`
    : "not observed";
  const attemptedAfterSuccessCopy =
    latestSuccessfulScan &&
    latestAttemptedScan &&
    latestAttemptedScan.created_at !== latestSuccessfulScan.created_at &&
    latestAttemptedScan.result === "recommendation_limit_reached"
      ? "Recommendation limit reached after successful batch."
      : latestSuccessfulScan &&
          latestAttemptedScan &&
          latestAttemptedScan.created_at !== latestSuccessfulScan.created_at &&
          (latestAttemptedScan.result === "skipped" ||
            latestAttemptedScan.result === "duplicate_ticker_skipped")
          ? "Official batch already served for this window."
        : null;
  const visiblePrimaryIds = input.scan_readback?.visible_primary_recommendation_ids ?? [];
  const hiddenLiveIds = input.scan_readback?.hidden_live_recommendation_ids ?? [];
  const hiddenReasonBreakdown =
    input.scan_readback?.hidden_reason_breakdown ?? {};
  const hiddenReasonById = input.scan_readback?.hidden_reason_by_id ?? {};
  const closedMarketBlockersSuppressedCount = closedMarketWaitState
    ? input.live_market_trial_readiness.blockers.filter(
        (item) => !isCoreReadinessSource(item.source),
      ).length +
      (input.scanner_output_qa.overall_status === "blocked" ? 1 : 0) +
      input.real_output_readiness.blockers.length
    : 0;
  const uiRefreshIslands = input.ui_refresh?.islands ?? {};
  const uiRefreshLines = Object.entries(uiRefreshIslands).map(
    ([islandId, state]) =>
      lineValue(
        islandId,
        `${state.is_refreshing ? "refreshing" : "idle"} / ${
          state.last_updated_at ?? "not loaded"
        } / changed ${state.changed_item_count ?? 0}${
          state.error ? ` / previous data kept: ${state.error}` : ""
        }`,
      ),
  );
  const uiRefreshMetrics = Object.fromEntries(
    Object.entries(uiRefreshIslands).flatMap(([islandId, state]) => [
      [`${islandId}_is_refreshing`, state.is_refreshing ?? false],
      [`${islandId}_last_updated_at`, state.last_updated_at ?? null],
      [`${islandId}_error`, state.error ?? null],
      [`${islandId}_changed_item_count`, state.changed_item_count ?? 0],
    ]),
  );
  const shadowProposalExists =
    input.entry_tuning_proposal?.recommended_action === "paper_test_variant" &&
    input.entry_tuning_proposal.proposed_entry_variant !== null;
  const shadowMetadataPresent =
    input.outcome_evaluation?.shadow_snapshot_metadata_present_count ?? 0;
  const shadowMetadataMissing =
    input.outcome_evaluation?.shadow_snapshot_metadata_missing_count ?? 0;
  const shadowTrialSampleSize =
    input.outcome_learning?.shadow_entry_trial.shadow_trial_sample_size ?? 0;
  const shadowTrialState = !shadowProposalExists
    ? "no proposal"
    : shadowMetadataPresent === 0 && shadowMetadataMissing > 0
      ? "proposal exists but current snapshots have no metadata"
      : (input.outcome_evaluation?.current_batch_expected_outcomes ?? 0) > 0 &&
          (input.outcome_evaluation?.current_batch_persisted_outcomes ?? 0) === 0
        ? "current batch pending evaluation"
        : shadowTrialSampleSize > 0
          ? "collecting data"
          : "proposal active; waiting for shadow eligible outcomes";

  return [
    section({
      section_id: "context",
      title: "Timestamp/context",
      severity: "info",
      lines: [
        lineValue("Generated", input.market_session.evaluated_at),
        lineValue(
          "Market",
          `${input.market_session.market_is_open ? "open" : "closed"} / ${words(
            input.market_status?.dayType ?? input.market_session.phase,
          )}`,
        ),
        lineValue(
          "Calendar confidence",
          `${words(input.scan_orchestration.calendar_confidence)} / provider ${
            input.scan_orchestration.provider_calendar_available
              ? "available"
              : "unavailable"
          }`,
        ),
        lineValue(
          "Session/window",
          `${words(input.market_session.phase)} / ${words(
            input.scan_orchestration.active_window,
          )}`,
        ),
        lineValue(
          "Next window",
          `${input.scan_orchestration.next_window_label}${
            input.scan_orchestration.next_window_starts_at
              ? ` ${input.scan_orchestration.next_window_starts_at}`
              : ""
          }`,
        ),
        lineValue(
          "Data mode",
          `${words(input.data_mode_clarity.overall_mode)} / ${words(
            input.data_mode_clarity.execution_reality,
          )}`,
        ),
      ],
      metrics: {
        generated_at: input.market_session.evaluated_at,
        market_is_open: input.market_session.market_is_open,
        market_day_type: input.market_status?.dayType ?? null,
        calendar_confidence: input.scan_orchestration.calendar_confidence,
        provider_calendar_available:
          input.scan_orchestration.provider_calendar_available,
        fallback_calendar_scan_allowed:
          input.scan_orchestration.fallback_calendar_scan_allowed,
        session_phase: input.market_session.phase,
        active_scan_window: input.scan_orchestration.active_window,
        next_scan_window: input.scan_orchestration.next_window,
        data_mode: input.data_mode_clarity.overall_mode,
      },
    }),
    section({
      section_id: "ui_refresh",
      title: "UI island refresh",
      severity: Object.values(uiRefreshIslands).some((state) => state.error)
        ? "warning"
        : "info",
      lines: [
        lineValue("Active tab", compact(input.ui_refresh?.active_tab, "unknown")),
        ...(uiRefreshLines.length > 0
          ? uiRefreshLines
          : [lineValue("Islands", "not observed")]),
      ],
      metrics: {
        active_tab: input.ui_refresh?.active_tab ?? null,
        ...uiRefreshMetrics,
      },
    }),
    section({
      section_id: "overall",
      title: "Overall status",
      severity: warnings.blockers.length > 0 ? "critical" : highestSeverity(warnings.warnings),
      lines: [
        lineValue("Engine", words(input.engine_control_center.overall_status)),
        lineValue(
          "Live trial",
          words(input.live_market_trial_readiness.overall_status),
        ),
        lineValue("Runbook", words(input.live_market_trial_runbook.status)),
        lineValue("Next action", input.live_market_trial_runbook.next_action.label),
      ],
      metrics: {
        engine_status: input.engine_control_center.overall_status,
        live_trial_readiness: input.live_market_trial_readiness.overall_status,
        runbook_status: input.live_market_trial_runbook.status,
        runbook_phase: input.live_market_trial_runbook.phase,
      },
    }),
    section({
      section_id: "readiness",
      title: "Readiness",
      severity: warnings.blockers.length > 0 ? "critical" : "info",
      lines: [
        lineValue("Blockers", warnings.blockers.length),
        lineValue("Warnings", warnings.warnings.length),
        lineValue(
          "Observe only",
          bool(input.live_market_trial_readiness.can_do_now.observe_only),
        ),
        lineValue(
          "Log recommendations",
          bool(input.live_market_trial_readiness.can_do_now.log_recommendations),
        ),
        lineValue(
          "Evaluate outcomes",
          bool(input.live_market_trial_readiness.can_do_now.evaluate_outcomes),
        ),
        lineValue(
          "Paper/manual tracking",
          bool(
            input.live_market_trial_readiness.can_do_now
              .paper_or_manual_tracking_ready,
          ),
        ),
      ],
      metrics: {
        blocker_count: warnings.blockers.length,
        warning_count: warnings.warnings.length,
        observe_only: input.live_market_trial_readiness.can_do_now.observe_only,
        log_recommendations:
          input.live_market_trial_readiness.can_do_now.log_recommendations,
        evaluate_outcomes:
          input.live_market_trial_readiness.can_do_now.evaluate_outcomes,
        paper_or_manual_tracking:
          input.live_market_trial_readiness.can_do_now
            .paper_or_manual_tracking_ready,
      },
    }),
    section({
      section_id: "scanner",
      title: "Scanner state",
      severity:
        input.scanner_output_qa.overall_status === "blocked" &&
        !closedMarketWaitState
          ? "critical"
          : closedMarketWaitState
            ? "info"
            : "info",
      lines: [
        lineValue("Orchestration", words(input.scan_orchestration.decision)),
        ...(closedMarketWaitState
          ? [
              lineValue(
                "Closed-market readback",
                "Market closed — latest official batch retained for review",
              ),
              lineValue(
                "Scanner idle",
                compact(
                  input.scan_readback?.closed_market_scanner_idle_reason,
                  "Scanner will resume at next market window.",
                ),
              ),
            ]
          : []),
        lineValue(
          "Calendar fallback",
          input.scan_orchestration.fallback_calendar_scan_allowed
            ? "scan allowed"
            : "not active",
        ),
        lineValue("Serving", words(input.serving_cadence.serving_decision)),
        lineValue(
          "Latest automation",
          words(input.live_market_trial_readiness.latest_automation_scan.decision),
        ),
        lineValue("Latest scan run", words(input.scan_run_history.latest_run_status)),
        lineValue("Selected tickers", input.scanner_universe.selected_tickers),
        lineValue(
          "Dynamic movers",
          input.dynamic_movers
            ? `${words(input.dynamic_movers.status)} / ${input.dynamic_movers.selected_count} selected`
            : "not connected",
        ),
        lineValue("Scanner QA", scannerQaLabel),
        lineValue("Candidate ranking", rankingLabel),
      ],
      metrics: {
        orchestration_decision: input.scan_orchestration.decision,
        calendar_confidence: input.scan_orchestration.calendar_confidence,
        provider_calendar_available:
          input.scan_orchestration.provider_calendar_available,
        fallback_calendar_scan_allowed:
          input.scan_orchestration.fallback_calendar_scan_allowed,
        serving_decision: input.serving_cadence.serving_decision,
        latest_automation_decision:
          input.live_market_trial_readiness.latest_automation_scan.decision,
        latest_scan_run_status: input.scan_run_history.latest_run_status,
        selected_tickers: input.scanner_universe.selected_tickers,
        dynamic_movers_status: input.dynamic_movers?.status ?? "not_connected",
        scanner_qa_status: closedMarketWaitState
          ? "not_applicable_market_closed"
          : input.scanner_output_qa.overall_status,
        scanner_candidates: input.scanner_output_qa.candidate_count,
        ranking_selected_count: input.scanner_ranking?.selected_count ?? null,
        market_closed_readback_mode:
          input.scan_readback?.market_closed_readback_mode ?? closedMarketWaitState,
        closed_market_blockers_suppressed_count:
          closedMarketBlockersSuppressedCount,
        closed_market_scanner_idle_reason:
          input.scan_readback?.closed_market_scanner_idle_reason ?? null,
      },
    }),
    section({
      section_id: "active_scan_trace",
      title: "Active scan trace",
      severity:
        input.active_scan_trace?.final.zero_candidate_reason &&
        !closedMarketWaitState &&
        !hasSuccessfulLiveReadback
          ? "warning"
          : "info",
      lines: input.active_scan_trace
        ? [
            lineValue(
              "Route version",
              compact(input.active_scan_trace.automation_route_version, "unknown"),
            ),
            lineValue(
              "Publish policy",
              compact(
                input.active_scan_trace.final.publish_policy_version ||
                  input.active_scan_trace.recommendation_publish_policy_version,
                "unknown",
              ),
            ),
            lineValue(
              "Build marker",
              compact(input.active_scan_trace.build_marker, "unknown"),
            ),
            lineValue(
              "Last stage reached",
              words(input.active_scan_trace.last_stage_reached),
            ),
            lineValue(
              "Zero candidate reason",
              compact(input.active_scan_trace.final.zero_candidate_reason, "none"),
            ),
            lineValue(
              "Provider env",
              `td=${bool(input.active_scan_trace.provider_env.twelve_data_key_present)} / openai=${bool(input.active_scan_trace.provider_env.openai_key_present)} / polygon=${bool(input.active_scan_trace.provider_env.polygon_key_present)} / service=${bool(input.active_scan_trace.provider_env.supabase_service_role_present)}`,
            ),
            lineValue(
              "Learning schema",
              input.active_scan_trace.schema_check
                ? `ready=${bool(input.active_scan_trace.schema_check.schema_ready)} / missing=${input.active_scan_trace.schema_check.missing_tables.length}`
                : "not observed",
            ),
            lineValue(
              "Live trial fast mode",
              bool(input.active_scan_trace.live_trial_fast_mode),
            ),
            lineValue(
              "Provider plan profile",
              `${compact(input.active_scan_trace.provider_plan_profile_mode, "unknown")} / ${compact(input.active_scan_trace.provider_plan_profile_source, "unknown")}`,
            ),
            lineValue(
              "Effective scheduled limits",
              `tickers=${input.active_scan_trace.effective_scan_ticker_cap ?? "default"} / skip_openai=${bool(input.active_scan_trace.effective_scheduled_skip_openai)} / timeout=${input.active_scan_trace.effective_scheduled_timeout_ms ?? "unknown"}ms`,
            ),
            lineValue(
              "Scheduled limits",
              `tickers=${input.active_scan_trace.scheduled_max_tickers ?? "default"} / skip_openai=${bool(input.active_scan_trace.scheduled_skip_openai)} / timeout=${input.active_scan_trace.scheduled_timeout_ms ?? "unknown"}ms`,
            ),
            lineValue(
              "Elapsed/timeout",
              `${input.active_scan_trace.elapsed_ms ?? "unknown"}ms / timeout=${bool(input.active_scan_trace.timeout_reached)}`,
            ),
            lineValue(
              "Skipped in progress",
              bool(input.active_scan_trace.skipped_in_progress),
            ),
            lineValue(
              "Schema error",
              compact(
                input.active_scan_trace.schema_check?.last_schema_error,
                "none",
              ),
            ),
            lineValue(
              "Power hour trial",
              `enabled=${bool(input.active_scan_trace.power_hour_trial_enabled)} / allowed=${bool(input.active_scan_trace.power_hour_publish_allowed)}`,
            ),
            lineValue(
              "Power hour block",
              compact(
                input.active_scan_trace.power_hour_publish_block_reason,
                "none",
              ),
            ),
            lineValue(
              "Quote/candle success",
              `${input.active_scan_trace.market_data_fetch.quote_success_count}/${input.active_scan_trace.market_data_fetch.candle_success_count}`,
            ),
            lineValue(
              "Quote/candle errors",
              `${input.active_scan_trace.market_data_fetch.quote_error_count}/${input.active_scan_trace.market_data_fetch.candle_error_count}`,
            ),
            lineValue(
              "Raw/ranked/output",
              `${input.active_scan_trace.raw_candidates.raw_candidate_count}/${input.active_scan_trace.ranking.ranked_count}/${input.active_scan_trace.openai.output_recommendation_count}`,
            ),
            lineValue(
              "Build path",
              compact(
                input.active_scan_trace.final.recommendation_build_path,
                "not observed",
              ),
            ),
            lineValue(
              "Built count",
              String(input.active_scan_trace.final.recommendations_built_count),
            ),
            lineValue(
              "Published",
              `${input.active_scan_trace.final.recommendations_published_count} published / ${input.active_scan_trace.final.ranked_candidates_count} ranked selected`,
            ),
            lineValue(
              "Tier mix",
              `${input.active_scan_trace.final.strong_count} strong / ${input.active_scan_trace.final.valid_count} valid / ${input.active_scan_trace.final.experimental_count} experimental`,
            ),
            lineValue(
              "Thresholds",
              `strong ${input.active_scan_trace.final.strong_threshold ?? "unknown"} / publishable ${input.active_scan_trace.final.publishable_threshold ?? "unknown"}`,
            ),
            lineValue(
              "Deterministic fallback",
              bool(input.active_scan_trace.final.deterministic_fallback_used),
            ),
            lineValue(
              "No publish reason",
              compact(input.active_scan_trace.final.no_publish_reason, "none"),
            ),
            lineValue(
              "Not published reason",
              compact(
                input.active_scan_trace.final
                  .ranked_candidates_not_published_reason,
                "none",
              ),
            ),
            lineValue(
              "Persistence",
              `run=${bool(input.active_scan_trace.persistence.scan_run_persisted)} / batch=${bool(input.active_scan_trace.persistence.batch_persisted)} / snapshots=${input.active_scan_trace.persistence.snapshots_persisted_count}`,
            ),
            lineValue(
              "Shadow trial attached",
              `${input.active_scan_trace.persistence.shadow_entry_trial_attached_count} / variant=${compact(input.active_scan_trace.persistence.shadow_entry_trial_variant, "none")} / not_live=${input.active_scan_trace.persistence.shadow_entry_trial_not_live_signal_count}`,
            ),
            lineValue(
              "Persistence error",
              compact(
                input.active_scan_trace.persistence.persistence_error_type,
                "none",
              ),
            ),
          ]
        : [
            lineValue("Route version", "not observed"),
            lineValue("Publish policy", "not observed"),
            lineValue("Build marker", "not observed"),
            lineValue("Last stage reached", "not observed"),
            lineValue("Zero candidate reason", "not observed"),
            lineValue("Provider env", "not observed"),
            lineValue("Learning schema", "not observed"),
            lineValue("Live trial fast mode", "not observed"),
            lineValue("Provider plan profile", "not observed"),
            lineValue("Effective scheduled limits", "not observed"),
            lineValue("Scheduled limits", "not observed"),
            lineValue("Elapsed/timeout", "not observed"),
            lineValue("Skipped in progress", "not observed"),
            lineValue("Schema error", "not observed"),
            lineValue("Power hour trial", "not observed"),
            lineValue("Power hour block", "not observed"),
            lineValue("Quote/candle success", "not observed"),
            lineValue("Raw/ranked/output", "not observed"),
            lineValue("Build path", "not observed"),
            lineValue("Built count", "not observed"),
            lineValue("Published", "not observed"),
            lineValue("Tier mix", "not observed"),
            lineValue("Thresholds", "not observed"),
            lineValue("Deterministic fallback", "not observed"),
            lineValue("No publish reason", "not observed"),
            lineValue("Persistence", "not observed"),
            lineValue("Persistence error", "not observed"),
          ],
      metrics: {
        trace_id: input.active_scan_trace?.trace_id ?? null,
        automation_route_version:
          input.active_scan_trace?.automation_route_version ?? null,
        recommendation_publish_policy_version:
          input.active_scan_trace?.recommendation_publish_policy_version ?? null,
        build_marker: input.active_scan_trace?.build_marker ?? null,
        publish_policy_version:
          input.active_scan_trace?.final.publish_policy_version ?? null,
        last_stage_reached: input.active_scan_trace?.last_stage_reached ?? null,
        zero_candidate_reason:
          input.active_scan_trace?.final.zero_candidate_reason ?? null,
        no_publish_reason:
          input.active_scan_trace?.final.no_publish_reason ?? null,
        power_hour_trial_enabled:
          input.active_scan_trace?.power_hour_trial_enabled ?? null,
        power_hour_publish_allowed:
          input.active_scan_trace?.power_hour_publish_allowed ?? null,
        power_hour_publish_block_reason:
          input.active_scan_trace?.power_hour_publish_block_reason ?? null,
        twelve_data_key_present:
          input.active_scan_trace?.provider_env.twelve_data_key_present ?? null,
        openai_key_present:
          input.active_scan_trace?.provider_env.openai_key_present ?? null,
        polygon_key_present:
          input.active_scan_trace?.provider_env.polygon_key_present ?? null,
        supabase_service_role_present:
          input.active_scan_trace?.provider_env.supabase_service_role_present ??
          null,
        schema_ready:
          input.active_scan_trace?.schema_check?.schema_ready ?? null,
        missing_tables:
          input.active_scan_trace?.schema_check?.missing_tables.join(",") ?? null,
        last_schema_error:
          input.active_scan_trace?.schema_check?.last_schema_error ?? null,
        live_trial_fast_mode:
          input.active_scan_trace?.live_trial_fast_mode ?? null,
        provider_plan_profile_mode:
          input.active_scan_trace?.provider_plan_profile_mode ?? null,
        provider_plan_profile_source:
          input.active_scan_trace?.provider_plan_profile_source ?? null,
        server_plan_mode: input.active_scan_trace?.server_plan_mode ?? null,
        public_plan_mode: input.active_scan_trace?.public_plan_mode ?? null,
        plan_mode_mismatch:
          input.active_scan_trace?.plan_mode_mismatch ?? null,
        effective_scan_ticker_cap:
          input.active_scan_trace?.effective_scan_ticker_cap ?? null,
        effective_scheduled_skip_openai:
          input.active_scan_trace?.effective_scheduled_skip_openai ?? null,
        effective_scheduled_timeout_ms:
          input.active_scan_trace?.effective_scheduled_timeout_ms ?? null,
        profile_scan_ticker_cap:
          input.active_scan_trace?.profile_scan_ticker_cap ?? null,
        env_scan_ticker_override:
          input.active_scan_trace?.env_scan_ticker_override ?? null,
        scheduled_max_tickers:
          input.active_scan_trace?.scheduled_max_tickers ?? null,
        scheduled_skip_openai:
          input.active_scan_trace?.scheduled_skip_openai ?? null,
        scheduled_timeout_ms:
          input.active_scan_trace?.scheduled_timeout_ms ?? null,
        elapsed_ms: input.active_scan_trace?.elapsed_ms ?? null,
        timeout_reached: input.active_scan_trace?.timeout_reached ?? null,
        skipped_in_progress:
          input.active_scan_trace?.skipped_in_progress ?? null,
        attempted_tickers:
          input.active_scan_trace?.market_data_fetch.attempted_tickers ?? null,
        quote_success_count:
          input.active_scan_trace?.market_data_fetch.quote_success_count ?? null,
        quote_error_count:
          input.active_scan_trace?.market_data_fetch.quote_error_count ?? null,
        candle_success_count:
          input.active_scan_trace?.market_data_fetch.candle_success_count ?? null,
        candle_error_count:
          input.active_scan_trace?.market_data_fetch.candle_error_count ?? null,
        stale_count: input.active_scan_trace?.market_data_fetch.stale_count ?? null,
        raw_candidate_count:
          input.active_scan_trace?.raw_candidates.raw_candidate_count ?? null,
        structurally_valid_count:
          input.active_scan_trace?.raw_candidates.structurally_valid_count ?? null,
        ranked_count: input.active_scan_trace?.ranking.ranked_count ?? null,
        ranking_selected_count:
          input.active_scan_trace?.ranking.selected_count ?? null,
        openai_input_candidate_count:
          input.active_scan_trace?.openai.input_candidate_count ?? null,
        openai_output_recommendation_count:
          input.active_scan_trace?.openai.output_recommendation_count ?? null,
        parser_rejected_count:
          input.active_scan_trace?.openai.parser_rejected_count ?? null,
        scan_run_persisted:
          input.active_scan_trace?.persistence.scan_run_persisted ?? null,
        batch_persisted:
          input.active_scan_trace?.persistence.batch_persisted ?? null,
        snapshots_persisted_count:
          input.active_scan_trace?.persistence.snapshots_persisted_count ?? null,
        persistence_error_type:
          input.active_scan_trace?.persistence.persistence_error_type ?? null,
        shadow_entry_trial_attached_count:
          input.active_scan_trace?.persistence
            .shadow_entry_trial_attached_count ?? null,
        shadow_entry_trial_variant:
          input.active_scan_trace?.persistence.shadow_entry_trial_variant ?? null,
        shadow_entry_trial_not_live_signal_count:
          input.active_scan_trace?.persistence
            .shadow_entry_trial_not_live_signal_count ?? null,
        ranked_candidates_count:
          input.active_scan_trace?.final.ranked_candidates_count ?? null,
        recommendations_published_count:
          input.active_scan_trace?.final.recommendations_published_count ?? null,
        recommendation_build_path:
          input.active_scan_trace?.final.recommendation_build_path ?? null,
        recommendations_built_count:
          input.active_scan_trace?.final.recommendations_built_count ?? null,
        strong_count: input.active_scan_trace?.final.strong_count ?? null,
        valid_count: input.active_scan_trace?.final.valid_count ?? null,
        experimental_count:
          input.active_scan_trace?.final.experimental_count ?? null,
        ranked_candidates_not_published_reason:
          input.active_scan_trace?.final.ranked_candidates_not_published_reason ??
          null,
        strong_threshold:
          input.active_scan_trace?.final.strong_threshold ?? null,
        publishable_threshold:
          input.active_scan_trace?.final.publishable_threshold ?? null,
        deterministic_fallback_used:
          input.active_scan_trace?.final.deterministic_fallback_used ?? null,
      },
    }),
    section({
      section_id: "live_recommendation_readback",
      title: "Live recommendation readback",
      severity:
        latestSuccessfulScan?.visible_recommendation_count &&
        latestSuccessfulScan.visible_recommendation_count > 0
          ? "info"
          : "warning",
      lines: [
        lineValue("Latest successful scan", successfulScanLabel),
        lineValue("Latest attempted scan", attemptedScanLabel),
        ...(input.scan_readback?.market_closed_readback_mode === true
          ? [
              lineValue(
                "Closed-market mode",
                "Market closed — latest official batch retained for review",
              ),
              lineValue(
                "Latest review batch",
                compact(
                  input.scan_readback?.latest_review_batch_fingerprint,
                  "none",
                ),
              ),
              lineValue(
                "Latest review source",
                compact(input.scan_readback?.latest_review_batch_source, "none"),
              ),
            ]
          : []),
        lineValue(
          "Current batch",
          compact(input.scan_readback?.current_batch_fingerprint, "not observed"),
        ),
        lineValue(
          "Current batch source",
          compact(input.scan_readback?.current_batch_source, "unknown"),
        ),
        lineValue(
          "Current batch rec/snapshot/grid",
          `${input.scan_readback?.current_batch_recommendation_count ?? 0}/${input.scan_readback?.current_batch_snapshot_count ?? 0}/${input.scan_readback?.current_batch_visible_grid_count ?? 0}`,
        ),
        lineValue(
          "Current batch tickers",
          (input.scan_readback?.current_batch_tickers ?? []).join(", ") || "none",
        ),
        lineValue(
          "Override reason",
          compact(input.scan_readback?.current_batch_override_reason, "none"),
        ),
        lineValue(
          "Active trace batch",
          compact(input.scan_readback?.active_trace_batch_fingerprint, "none"),
        ),
        lineValue(
          "Active trace published/snapshots",
          `${input.scan_readback?.active_trace_published_count ?? 0}/${input.scan_readback?.active_trace_snapshot_count ?? 0}`,
        ),
        lineValue(
          "Snapshot members",
          (input.scan_readback?.current_batch_snapshot_members ?? []).join(", ") ||
            "none",
        ),
        lineValue(
          "Recommendation rows",
          (input.scan_readback?.current_batch_recommendation_rows ?? []).join(", ") ||
            "none",
        ),
        lineValue(
          "Mismatch reason",
          compact(input.scan_readback?.current_batch_mismatch_reason, "none"),
        ),
        lineValue(
          "Previous successful batch",
          compact(
            input.scan_readback?.previous_successful_batch_fingerprint,
            "none",
          ),
        ),
        lineValue(
          "Trace/batch mismatch",
          input.scan_readback?.stale_trace_batch_mismatch === true
            ? "true"
            : "false",
        ),
        lineValue(
          "Latest official batch",
          compact(
            input.scan_readback?.latest_official_batch_fingerprint,
            "not observed",
          ),
        ),
        lineValue(
          "Official scan run",
          compact(input.scan_readback?.latest_official_scan_run_id, "not observed"),
        ),
        lineValue(
          "Batch expected/found",
          `${input.scan_readback?.batch_expected_count ?? 0}/${input.scan_readback?.recommendation_rows_found_count ?? 0}`,
        ),
        lineValue(
          "Missing batch IDs",
          (input.scan_readback?.missing_batch_member_ids ?? []).join(", ") ||
            "none",
        ),
        lineValue(
          "Missing batch tickers",
          (input.scan_readback?.missing_batch_member_tickers ?? []).join(", ") ||
            "none",
        ),
        lineValue(
          "Successful visible count",
          latestSuccessfulScan?.visible_recommendation_count ?? 0,
        ),
        lineValue(
          "Attempted visible count",
          latestAttemptedScan?.visible_recommendation_count ?? 0,
        ),
        lineValue("Expected live IDs", (input.scan_readback?.latest_successful_live_recommendation_ids ?? []).join(", ") || "none"),
        lineValue("Expected live tickers", (input.scan_readback?.latest_successful_live_recommendation_tickers ?? []).join(", ") || "none"),
        lineValue("Visible primary IDs", visiblePrimaryIds.join(", ") || "none"),
        lineValue(
          "Extra visible primary IDs",
          (input.scan_readback?.extra_visible_primary_ids ?? []).join(", ") ||
            "none",
        ),
        lineValue(
          "Extra visible primary tickers",
          (input.scan_readback?.extra_visible_primary_tickers ?? []).join(", ") ||
            "none",
        ),
        lineValue(
          "Strict batch filter",
          input.scan_readback?.primary_grid_strict_batch_filter_applied
            ? "true"
            : "false",
        ),
        lineValue(
          "Grid fallback reason",
          compact(input.scan_readback?.primary_grid_fallback_reason, "none"),
        ),
        lineValue("Hidden live IDs", hiddenLiveIds.join(", ") || "none"),
        lineValue(
          "Hidden reasons",
          Object.keys(hiddenReasonBreakdown).length > 0
            ? Object.entries(hiddenReasonBreakdown)
                .map(([reason, countValue]) => `${reason}:${countValue}`)
                .join(", ")
            : "none",
        ),
        lineValue(
          "Hidden reason by ID",
          Object.keys(hiddenReasonById).length > 0
            ? JSON.stringify(hiddenReasonById)
            : "none",
        ),
        lineValue("Follow-up status", attemptedAfterSuccessCopy ?? "none"),
      ],
      metrics: {
        market_closed_readback_mode:
          input.scan_readback?.market_closed_readback_mode ?? null,
        latest_trading_day_with_official_batch:
          input.scan_readback?.latest_trading_day_with_official_batch ?? null,
        latest_review_batch_fingerprint:
          input.scan_readback?.latest_review_batch_fingerprint ?? null,
        latest_review_batch_source:
          input.scan_readback?.latest_review_batch_source ?? null,
        closed_market_blockers_suppressed_count:
          closedMarketBlockersSuppressedCount,
        closed_market_scanner_idle_reason:
          input.scan_readback?.closed_market_scanner_idle_reason ?? null,
        current_batch_fingerprint:
          input.scan_readback?.current_batch_fingerprint ?? null,
        current_batch_source: input.scan_readback?.current_batch_source ?? null,
        current_batch_recommendation_count:
          input.scan_readback?.current_batch_recommendation_count ?? null,
        current_batch_snapshot_count:
          input.scan_readback?.current_batch_snapshot_count ?? null,
        current_batch_visible_grid_count:
          input.scan_readback?.current_batch_visible_grid_count ?? null,
        current_batch_tickers:
          (input.scan_readback?.current_batch_tickers ?? []).join(","),
        current_batch_override_reason:
          input.scan_readback?.current_batch_override_reason ?? null,
        active_trace_batch_fingerprint:
          input.scan_readback?.active_trace_batch_fingerprint ?? null,
        active_trace_published_count:
          input.scan_readback?.active_trace_published_count ?? null,
        active_trace_snapshot_count:
          input.scan_readback?.active_trace_snapshot_count ?? null,
        current_batch_snapshot_members:
          (input.scan_readback?.current_batch_snapshot_members ?? []).join(","),
        current_batch_recommendation_rows:
          (input.scan_readback?.current_batch_recommendation_rows ?? []).join(","),
        current_batch_mismatch_reason:
          input.scan_readback?.current_batch_mismatch_reason ?? null,
        previous_successful_batch_fingerprint:
          input.scan_readback?.previous_successful_batch_fingerprint ?? null,
        stale_trace_batch_mismatch:
          input.scan_readback?.stale_trace_batch_mismatch ?? null,
        latest_official_batch_fingerprint:
          input.scan_readback?.latest_official_batch_fingerprint ?? null,
        latest_official_scan_run_id:
          input.scan_readback?.latest_official_scan_run_id ?? null,
        latest_official_scan_run_fingerprint:
          input.scan_readback?.latest_official_scan_run_fingerprint ?? null,
        batch_expected_count: input.scan_readback?.batch_expected_count ?? null,
        recommendation_rows_found_count:
          input.scan_readback?.recommendation_rows_found_count ?? null,
        missing_batch_member_ids:
          (input.scan_readback?.missing_batch_member_ids ?? []).join(","),
        missing_batch_member_tickers:
          (input.scan_readback?.missing_batch_member_tickers ?? []).join(","),
        hidden_reason_by_id: JSON.stringify(hiddenReasonById),
        latest_successful_live_recommendation_ids:
          (input.scan_readback?.latest_successful_live_recommendation_ids ?? [])
            .join(","),
        latest_successful_live_recommendation_tickers:
          (input.scan_readback?.latest_successful_live_recommendation_tickers ?? [])
            .join(","),
        visible_primary_recommendation_ids:
          (input.scan_readback?.visible_primary_recommendation_ids ?? []).join(","),
        visible_primary_recommendation_tickers:
          (input.scan_readback?.visible_primary_recommendation_tickers ?? [])
            .join(","),
        extra_visible_primary_ids:
          (input.scan_readback?.extra_visible_primary_ids ?? []).join(","),
        extra_visible_primary_tickers:
          (input.scan_readback?.extra_visible_primary_tickers ?? []).join(","),
        primary_grid_strict_batch_filter_applied:
          input.scan_readback?.primary_grid_strict_batch_filter_applied ?? null,
        primary_grid_fallback_reason:
          input.scan_readback?.primary_grid_fallback_reason ?? null,
        hidden_live_recommendation_ids:
          (input.scan_readback?.hidden_live_recommendation_ids ?? []).join(","),
        hidden_live_recommendation_tickers:
          (input.scan_readback?.hidden_live_recommendation_tickers ?? []).join(","),
        hidden_reason_breakdown: JSON.stringify(hiddenReasonBreakdown),
        latest_successful_scan_result: latestSuccessfulScan?.result ?? null,
        latest_successful_scan_created_at:
          latestSuccessfulScan?.created_at ?? null,
        latest_successful_scan_window:
          latestSuccessfulScan?.scan_window ?? null,
        latest_successful_visible_recommendation_count:
          latestSuccessfulScan?.visible_recommendation_count ?? null,
        latest_successful_scan_source: latestSuccessfulScan?.source ?? null,
        latest_attempted_scan_result: latestAttemptedScan?.result ?? null,
        latest_attempted_scan_created_at: latestAttemptedScan?.created_at ?? null,
        latest_attempted_scan_window: latestAttemptedScan?.scan_window ?? null,
        latest_attempted_visible_recommendation_count:
          latestAttemptedScan?.visible_recommendation_count ?? null,
        latest_attempted_scan_source: latestAttemptedScan?.source ?? null,
        follow_up_status: attemptedAfterSuccessCopy,
      },
    }),
    section({
      section_id: "latest_diagnostic_scan",
      title: "Latest diagnostic scan",
      severity:
        input.active_scan_trace?.diagnostic_mode &&
        input.active_scan_trace.final.zero_candidate_reason
          ? "warning"
          : "info",
      lines: input.active_scan_trace?.diagnostic_mode
        ? [
            lineValue(
              "Run time",
              compact(input.active_scan_trace.generated_at, "unknown"),
            ),
            lineValue(
              "Mode",
              compact(input.active_scan_trace.diagnostic_run_mode, "unknown"),
            ),
            lineValue(
              "Step",
              compact(input.active_scan_trace.diagnostic_step, "unknown"),
            ),
            lineValue(
              "Elapsed",
              input.active_scan_trace.elapsed_ms === null
                ? "unknown"
                : `${input.active_scan_trace.elapsed_ms}ms`,
            ),
            lineValue(
              "Max tickers",
              input.active_scan_trace.max_tickers === null
                ? "unknown"
                : String(input.active_scan_trace.max_tickers),
            ),
            lineValue(
              "Timeout",
              bool(input.active_scan_trace.timeout_reached),
            ),
            lineValue(
              "Simulated window",
              compact(input.active_scan_trace.simulated_window, "none"),
            ),
            lineValue(
              "Selected/ranked/output",
              `${input.active_scan_trace.ranking.selected_count}/${input.active_scan_trace.ranking.ranked_count}/${input.active_scan_trace.openai.output_recommendation_count}`,
            ),
            lineValue(
              "Learning schema",
              input.active_scan_trace.schema_check
                ? `ready=${bool(input.active_scan_trace.schema_check.schema_ready)} / missing=${input.active_scan_trace.schema_check.missing_tables.length}`
                : "not observed",
            ),
            lineValue(
              "Build path",
              compact(
                input.active_scan_trace.final.recommendation_build_path,
                "not observed",
              ),
            ),
            lineValue(
              "Built count",
              String(input.active_scan_trace.final.recommendations_built_count),
            ),
            lineValue(
              "No publish reason",
              compact(input.active_scan_trace.final.no_publish_reason, "none"),
            ),
            lineValue(
              "Fallback used",
              bool(input.active_scan_trace.final.deterministic_fallback_used),
            ),
            lineValue(
              "Persistence",
              `run=${bool(input.active_scan_trace.persistence.scan_run_persisted)} / batch=${bool(input.active_scan_trace.persistence.batch_persisted)} / snapshots=${input.active_scan_trace.persistence.snapshots_persisted_count}`,
            ),
            lineValue(
              "Shadow trial attached",
              `${input.active_scan_trace.persistence.shadow_entry_trial_attached_count} / variant=${compact(input.active_scan_trace.persistence.shadow_entry_trial_variant, "none")} / not_live=${input.active_scan_trace.persistence.shadow_entry_trial_not_live_signal_count}`,
            ),
            lineValue(
              "Persistence error",
              compact(
                input.active_scan_trace.persistence.persistence_error_type,
                "none",
              ),
            ),
          ]
        : [
            lineValue("Run time", "not observed"),
            lineValue("Mode", "not observed"),
            lineValue("Step", "not observed"),
            lineValue("Elapsed", "not observed"),
            lineValue("Max tickers", "not observed"),
            lineValue("Timeout", "not observed"),
            lineValue("Simulated window", "not observed"),
            lineValue("Selected/ranked/output", "not observed"),
            lineValue("Learning schema", "not observed"),
            lineValue("Build path", "not observed"),
            lineValue("Built count", "not observed"),
            lineValue("No publish reason", "not observed"),
            lineValue("Fallback used", "not observed"),
            lineValue("Persistence", "not observed"),
            lineValue("Persistence error", "not observed"),
          ],
      metrics: {
        diagnostic_mode: input.active_scan_trace?.diagnostic_mode ?? null,
        diagnostic_run_mode:
          input.active_scan_trace?.diagnostic_run_mode ?? null,
        diagnostic_step: input.active_scan_trace?.diagnostic_step ?? null,
        elapsed_ms: input.active_scan_trace?.elapsed_ms ?? null,
        max_tickers: input.active_scan_trace?.max_tickers ?? null,
        skipped_openai: input.active_scan_trace?.skipped_openai ?? null,
        partial_result: input.active_scan_trace?.partial_result ?? null,
        timeout_reached: input.active_scan_trace?.timeout_reached ?? null,
        simulated_window: input.active_scan_trace?.simulated_window ?? null,
        simulated_ny_time: input.active_scan_trace?.simulated_ny_time ?? null,
        selected_count: input.active_scan_trace?.ranking.selected_count ?? null,
        ranked_count: input.active_scan_trace?.ranking.ranked_count ?? null,
        output_recommendation_count:
          input.active_scan_trace?.openai.output_recommendation_count ?? null,
        schema_ready:
          input.active_scan_trace?.schema_check?.schema_ready ?? null,
        missing_tables:
          input.active_scan_trace?.schema_check?.missing_tables.join(",") ?? null,
        last_schema_error:
          input.active_scan_trace?.schema_check?.last_schema_error ?? null,
        recommendation_build_path:
          input.active_scan_trace?.final.recommendation_build_path ?? null,
        recommendations_built_count:
          input.active_scan_trace?.final.recommendations_built_count ?? null,
        no_publish_reason:
          input.active_scan_trace?.final.no_publish_reason ?? null,
        deterministic_fallback_used:
          input.active_scan_trace?.final.deterministic_fallback_used ?? null,
        scan_run_persisted:
          input.active_scan_trace?.persistence.scan_run_persisted ?? null,
        batch_persisted:
          input.active_scan_trace?.persistence.batch_persisted ?? null,
        snapshots_persisted_count:
          input.active_scan_trace?.persistence.snapshots_persisted_count ?? null,
        persistence_error_type:
          input.active_scan_trace?.persistence.persistence_error_type ?? null,
        shadow_entry_trial_attached_count:
          input.active_scan_trace?.persistence
            .shadow_entry_trial_attached_count ?? null,
        shadow_entry_trial_variant:
          input.active_scan_trace?.persistence.shadow_entry_trial_variant ?? null,
        shadow_entry_trial_not_live_signal_count:
          input.active_scan_trace?.persistence
            .shadow_entry_trial_not_live_signal_count ?? null,
      },
    }),
    section({
      section_id: "recommendations",
      title: "Recommendation output",
      severity:
        closedMarketWaitState
          ? "info"
          : input.serving_cadence.no_trade_valid ||
              input.day_window_target.status === "below_target"
          ? "warning"
          : "info",
      lines: [
        lineValue("Visible", input.serving_cadence.visible_recommendation_count),
        lineValue("Current batch", words(input.serving_cadence.batch_status)),
        lineValue("Batch count", latestBatch?.recommendation_count ?? 0),
        lineValue(
          "Window target",
          `${input.serving_cadence.batch_target.min}-${input.serving_cadence.batch_target.max}`,
        ),
        lineValue(
          "Today target",
          `${input.daily_targets.total_recommendations_today}/${input.daily_targets.full_day_recommendation_target_min}-${input.daily_targets.full_day_recommendation_target_max}`,
        ),
        lineValue(
          "Tier mix",
          `${input.real_output_readiness.coverage.strong_count} strong / ${input.real_output_readiness.coverage.valid_count} valid / ${input.real_output_readiness.coverage.experimental_count} experimental`,
        ),
        lineValue(
          "Visible tier source",
          compact(input.scan_readback?.visible_tier_source, "unknown"),
        ),
        lineValue(
          "Visible unknown tiers",
          input.scan_readback?.visible_unknown_tier_count ?? 0,
        ),
        lineValue(
          "Missing tier by ID",
          Object.keys(input.scan_readback?.missing_tier_by_id ?? {}).length > 0
            ? JSON.stringify(input.scan_readback?.missing_tier_by_id)
            : "none",
        ),
        lineValue("No-trade valid", bool(input.serving_cadence.no_trade_valid)),
      ],
      metrics: {
        visible_recommendations:
          input.serving_cadence.visible_recommendation_count,
        current_batch_status: input.serving_cadence.batch_status,
        batch_recommendation_count: latestBatch?.recommendation_count ?? 0,
        per_window_target_min: input.serving_cadence.batch_target.min,
        per_window_target_max: input.serving_cadence.batch_target.max,
        today_recommendations: input.daily_targets.total_recommendations_today,
        full_day_target_min: input.daily_targets.full_day_recommendation_target_min,
        full_day_target_max: input.daily_targets.full_day_recommendation_target_max,
        strong_count: input.real_output_readiness.coverage.strong_count,
        valid_count: input.real_output_readiness.coverage.valid_count,
        experimental_count: input.real_output_readiness.coverage.experimental_count,
        visible_tier_source: input.scan_readback?.visible_tier_source ?? null,
        visible_unknown_tier_count:
          input.scan_readback?.visible_unknown_tier_count ?? null,
        missing_tier_by_id: JSON.stringify(
          input.scan_readback?.missing_tier_by_id ?? {},
        ),
        no_trade_valid: input.serving_cadence.no_trade_valid,
      },
    }),
    section({
      section_id: "provider_budget",
      title: "Provider/budget",
      severity:
        input.provider_budget_guard.status === "over_budget" ||
        input.provider_budget_guard.status === "rate_limited" ||
        input.provider_budget_guard.status === "provider_unavailable"
          ? "critical"
          : input.provider_budget_guard.status === "approaching_limit" ||
              input.provider_budget_guard.status === "budget_unknown"
            ? "warning"
            : "info",
      lines: [
        lineValue("Status", words(input.provider_budget_guard.status)),
        lineValue("Plan mode", words(input.provider_budget_guard.plan_mode)),
        lineValue(
          "Calls/window",
          input.provider_budget_guard.totals.estimated_calls_per_window,
        ),
        lineValue(
          "Calls/day",
          input.provider_budget_guard.totals.estimated_calls_per_day,
        ),
        lineValue(
          "Latest signal",
          words(input.provider_budget_guard.latest_limit_signal.status),
        ),
      ],
      metrics: {
        status: input.provider_budget_guard.status,
        plan_mode: input.provider_budget_guard.plan_mode,
        estimated_calls_per_window:
          input.provider_budget_guard.totals.estimated_calls_per_window,
        estimated_calls_per_day:
          input.provider_budget_guard.totals.estimated_calls_per_day,
        latest_limit_signal:
          input.provider_budget_guard.latest_limit_signal.status,
      },
    }),
    section({
      section_id: "provider_plan_profile",
      title: "Provider plan profile",
      severity: providerPlanProfile.mismatch ? "warning" : "info",
      lines: [
        lineValue("Resolved plan", words(providerPlanProfile.mode)),
        lineValue("Source", words(providerPlanProfile.source)),
        lineValue(
          "Server/Public plan",
          `${words(providerPlanProfile.serverPlanMode)} / ${words(providerPlanProfile.publicPlanMode)}`,
        ),
        lineValue("Plan mismatch", bool(providerPlanProfile.mismatch)),
        lineValue(
          "Scan ticker cap",
          `${providerPlanProfile.scanTickerCap ?? "unknown"} (profile ${providerPlanProfile.profileScanTickerCap ?? "unknown"})`,
        ),
        lineValue(
          "Outcome candle budget",
          `${providerPlanProfile.outcomeBudgetLimit ?? "unknown"} (profile ${providerPlanProfile.profileBudgetLimit ?? "unknown"} / override ${providerPlanProfile.overrideBudgetLimit ?? "none"})`,
        ),
        lineValue(
          "Scheduled OpenAI/timeout",
          `skip_openai=${
            providerPlanProfile.skipOpenAi === null
              ? "unknown"
              : bool(providerPlanProfile.skipOpenAi)
          } / timeout=${providerPlanProfile.timeoutMs ?? "unknown"}ms`,
        ),
        lineValue(
          "Background cadence",
          providerPlanProfile.cadence === null
            ? "unknown"
            : `${providerPlanProfile.cadence}m`,
        ),
        lineValue(
          "Env scan override",
          providerPlanProfile.envScanTickerOverride ?? "none",
        ),
        lineValue(
          "Checklist",
          providerPlanProfile.mode === "custom"
            ? "Confirm custom caps are set before widening scans."
            : "Provider upgrade changes scan/outcome budgets only; generation rules stay unchanged.",
        ),
        lineValue(
          "Notes",
          providerPlanProfile.notes.length > 0
            ? providerPlanProfile.notes.join(" ")
            : "No profile note available.",
        ),
      ],
      metrics: {
        provider_plan_profile_mode: providerPlanProfile.mode,
        provider_plan_profile_source: providerPlanProfile.source,
        server_plan_mode: providerPlanProfile.serverPlanMode,
        public_plan_mode: providerPlanProfile.publicPlanMode,
        plan_mode_mismatch: providerPlanProfile.mismatch,
        effective_scan_ticker_cap: providerPlanProfile.scanTickerCap,
        profile_scan_ticker_cap: providerPlanProfile.profileScanTickerCap,
        effective_outcome_budget_limit:
          providerPlanProfile.outcomeBudgetLimit,
        profile_budget_limit: providerPlanProfile.profileBudgetLimit,
        override_budget_limit: providerPlanProfile.overrideBudgetLimit,
        effective_scheduled_skip_openai: providerPlanProfile.skipOpenAi,
        effective_scheduled_timeout_ms: providerPlanProfile.timeoutMs,
        background_scan_cadence_minutes: providerPlanProfile.cadence,
        env_scan_ticker_override: providerPlanProfile.envScanTickerOverride,
      },
    }),
    section({
      section_id: "provider_upgrade_checklist",
      title: "Provider upgrade checklist",
      severity:
        providerUpgrade.status === "env_mismatch_needs_fix" ||
        providerUpgrade.status === "custom_active_needs_review"
          ? "warning"
          : "info",
      lines: [
        lineValue("Upgrade readiness", words(providerUpgrade.status)),
        lineValue("Message", providerUpgrade.message),
        lineValue("Current resolved plan", words(providerPlanProfile.mode)),
        lineValue("Server env plan", words(providerPlanProfile.serverPlanMode)),
        lineValue("Public env plan", words(providerPlanProfile.publicPlanMode)),
        lineValue("Env consistent", bool(providerUpgrade.envConsistent)),
        lineValue(
          "Active scan ticker cap",
          providerPlanProfile.scanTickerCap ?? "unknown",
        ),
        lineValue(
          "Active outcome candle cap",
          providerPlanProfile.outcomeBudgetLimit ?? "unknown",
        ),
        lineValue(
          "OpenAI skip default",
          providerPlanProfile.skipOpenAi === null
            ? "unknown"
            : bool(providerPlanProfile.skipOpenAi),
        ),
        lineValue(
          "Timeout",
          providerPlanProfile.timeoutMs === null
            ? "unknown"
            : `${providerPlanProfile.timeoutMs}ms`,
        ),
        lineValue("Upgrade target", providerUpgrade.upgradeTarget),
        lineValue(
          "Before upgrade env",
          providerUpgrade.beforeUpgradeEnvValues.join(" / "),
        ),
        lineValue(
          "After Grow env",
          providerUpgrade.growEnvValues.join(" / "),
        ),
        lineValue(
          "Next env values",
          providerUpgrade.nextEnvValues.length > 0
            ? providerUpgrade.nextEnvValues.join(" / ")
            : "none",
        ),
        lineValue("Safe to upgrade", bool(providerUpgrade.safeToUpgrade)),
      ],
      metrics: {
        provider_upgrade_checklist_status: providerUpgrade.status,
        provider_upgrade_checklist_message: providerUpgrade.message,
        provider_plan_env_consistent: providerUpgrade.envConsistent,
        provider_plan_upgrade_target: providerUpgrade.upgradeTarget,
        provider_plan_next_env_values:
          providerUpgrade.nextEnvValues.join("; "),
        provider_profile_safe_to_upgrade: providerUpgrade.safeToUpgrade,
        current_resolved_plan: providerPlanProfile.mode,
        server_env_plan: providerPlanProfile.serverPlanMode,
        public_env_plan: providerPlanProfile.publicPlanMode,
        active_scan_ticker_cap: providerPlanProfile.scanTickerCap,
        active_outcome_candle_request_cap:
          providerPlanProfile.outcomeBudgetLimit,
        openai_skip_default: providerPlanProfile.skipOpenAi,
        timeout_ms: providerPlanProfile.timeoutMs,
        before_upgrade_env_values:
          providerUpgrade.beforeUpgradeEnvValues.join("; "),
        after_grow_upgrade_env_values: providerUpgrade.growEnvValues.join("; "),
      },
    }),
    section({
      section_id: "stats_today_readback",
      title: "Stats Today readback",
      severity: "info",
      lines: [
        lineValue(
          "Positions considered",
          input.stats_today_readback?.stats_today_positions_considered ?? 0,
        ),
        lineValue(
          "Excluded demo/mock",
          `${input.stats_today_readback?.stats_today_positions_excluded_demo ?? 0}/${input.stats_today_readback?.stats_today_positions_excluded_mock ?? 0}`,
        ),
        lineValue(
          "Excluded not today",
          input.stats_today_readback?.stats_today_positions_excluded_not_today ?? 0,
        ),
        lineValue(
          "Excluded missing execution",
          input.stats_today_readback
            ?.stats_today_positions_excluded_missing_execution ?? 0,
        ),
        lineValue(
          "Excluded non-live execution",
          input.stats_today_readback
            ?.stats_today_positions_excluded_non_live_execution ?? 0,
        ),
        lineValue(
          "Closed count source",
          compact(
            input.stats_today_readback?.stats_today_closed_count_source,
            "unknown",
          ),
        ),
      ],
      metrics: {
        stats_today_positions_considered:
          input.stats_today_readback?.stats_today_positions_considered ?? null,
        stats_today_positions_excluded_demo:
          input.stats_today_readback?.stats_today_positions_excluded_demo ?? null,
        stats_today_positions_excluded_mock:
          input.stats_today_readback?.stats_today_positions_excluded_mock ?? null,
        stats_today_positions_excluded_not_today:
          input.stats_today_readback?.stats_today_positions_excluded_not_today ??
          null,
        stats_today_positions_excluded_missing_execution:
          input.stats_today_readback
            ?.stats_today_positions_excluded_missing_execution ?? null,
        stats_today_positions_excluded_non_live_execution:
          input.stats_today_readback
            ?.stats_today_positions_excluded_non_live_execution ?? null,
        stats_today_closed_count_source:
          input.stats_today_readback?.stats_today_closed_count_source ?? null,
      },
    }),
    section({
      section_id: "persistence_learning",
      title: "Persistence / learning loop",
      severity: input.batch_memory.persistence_status === "failed" ? "critical" : "info",
      lines: [
        lineValue("Scan runs stored", input.persistence_counts?.scan_runs ?? input.scan_run_history.total_scan_runs),
        lineValue("Batches stored", input.persistence_counts?.batches ?? input.batch_memory.total_batches),
        lineValue("Snapshots", input.persistence_counts?.snapshots ?? input.performance.summary.total_recommendations),
        lineValue("Outcomes pending", input.performance.summary.pending_outcomes),
        lineValue("Outcomes evaluated", input.performance.summary.evaluated_recommendations),
        lineValue("Batch memory", words(input.batch_memory.persistence_status)),
      ],
      metrics: {
        scan_runs_stored_today: count(
          input.persistence_counts?.scan_runs ?? input.scan_run_history.total_scan_runs,
        ),
        batches_stored_today: count(
          input.persistence_counts?.batches ?? input.batch_memory.total_batches,
        ),
        snapshots: count(
          input.persistence_counts?.snapshots ??
            input.performance.summary.total_recommendations,
        ),
        outcomes_pending: input.performance.summary.pending_outcomes,
        outcomes_evaluated: input.performance.summary.evaluated_recommendations,
        batch_memory_status: input.batch_memory.persistence_status,
        batch_memory_mode: input.batch_memory.persistence_mode,
      },
    }),
    section({
      section_id: "outcome_evaluation",
      title: "Outcome evaluation",
      severity:
        input.outcome_evaluation?.provider_error_count &&
        input.outcome_evaluation.provider_error_count > 0
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Current batch",
          compact(input.outcome_evaluation?.current_batch_fingerprint, "none"),
        ),
        ...(input.outcome_evaluation?.market_closed_readback_mode === true
          ? [
              lineValue(
                "Latest review batch",
                compact(
                  input.outcome_evaluation?.latest_review_batch_fingerprint,
                  "none",
                ),
              ),
              lineValue(
                "Latest trading day with official batch",
                compact(
                  input.outcome_evaluation
                    ?.latest_trading_day_with_official_batch,
                  "none",
                ),
              ),
            ]
          : []),
        lineValue(
          "Current batch expected/persisted",
          `${input.outcome_evaluation?.current_batch_expected_outcomes ?? 0}/${input.outcome_evaluation?.current_batch_persisted_outcomes ?? 0}`,
        ),
        lineValue(
          "Shadow snapshot metadata present/missing",
          `${input.outcome_evaluation?.shadow_snapshot_metadata_present_count ?? 0}/${input.outcome_evaluation?.shadow_snapshot_metadata_missing_count ?? 0}`,
        ),
        lineValue(
          "Shadow snapshot variants",
          JSON.stringify(input.outcome_evaluation?.shadow_snapshot_variant_counts ?? {}),
        ),
        lineValue(
          "Learning source batch",
          compact(
            input.outcome_evaluation?.learning_insights_source_batch_fingerprint,
            "none",
          ),
        ),
        lineValue(
          "Learning source reason",
          compact(
            input.outcome_evaluation?.learning_insights_source_reason,
            "unknown",
          ),
        ),
        lineValue(
          "Latest counterfactual-ready batch",
          compact(
            input.outcome_evaluation
              ?.latest_counterfactual_ready_batch_fingerprint,
            "none",
          ),
        ),
        lineValue(
          "Latest evaluated batch",
          compact(
            input.outcome_evaluation?.latest_evaluated_batch_fingerprint,
            "none",
          ),
        ),
        lineValue(
          "Snapshots",
          input.outcome_evaluation?.current_batch_snapshot_count ?? 0,
        ),
        lineValue(
          "Rows loaded / matched / unmatched",
          input.outcome_evaluation?.readback_hydration_complete === false
            ? "readback loading"
            : `${input.outcome_evaluation?.outcome_rows_loaded_count ?? 0}/${input.outcome_evaluation?.outcome_snapshot_match_count ?? 0}/${input.outcome_evaluation?.outcome_unmatched_count ?? 0}`,
        ),
        lineValue(
          "Rows raw/deduped/replaced",
          `${input.outcome_evaluation?.outcome_rows_raw_count ?? 0}/${input.outcome_evaluation?.outcome_rows_deduped_count ?? 0}/${input.outcome_evaluation?.outcome_rows_replaced_by_better_count ?? 0}`,
        ),
        lineValue(
          "Stale incomplete ignored",
          input.outcome_evaluation?.stale_incomplete_rows_ignored_count ?? 0,
        ),
        lineValue(
          "Dedupe strategy",
          compact(input.outcome_evaluation?.outcome_dedupe_strategy, "unknown"),
        ),
        lineValue(
          "Batch groups / selected rows",
          `${input.outcome_evaluation?.outcome_batch_groups_count ?? 0}/${input.outcome_evaluation?.latest_evaluated_batch_rows ?? 0}`,
        ),
        lineValue(
          "Selection reason",
          compact(
            input.outcome_evaluation?.latest_evaluated_batch_selection_reason,
            "unknown",
          ),
        ),
        lineValue(
          "Snapshot/batch backfill",
          `${bool(input.outcome_evaluation?.outcome_snapshot_backfill_attempted === true)} / ${input.outcome_evaluation?.outcome_snapshot_backfill_count ?? 0}/${input.outcome_evaluation?.outcome_batch_backfill_count ?? 0}`,
        ),
        lineValue(
          "Backfill trigger",
          compact(input.outcome_evaluation?.outcome_backfill_trigger_reason, "none"),
        ),
        lineValue(
          "Snapshot requested/found",
          `${input.outcome_evaluation?.outcome_snapshot_fingerprints_requested_count ?? 0}/${input.outcome_evaluation?.outcome_snapshot_fingerprints_found_count ?? 0}`,
        ),
        lineValue(
          "Batch requested/found",
          `${input.outcome_evaluation?.outcome_batch_fingerprints_requested_count ?? 0}/${input.outcome_evaluation?.outcome_batch_fingerprints_found_count ?? 0}`,
        ),
        lineValue(
          "Matching recomputed",
          bool(
            input.outcome_evaluation
              ?.outcome_matching_recomputed_after_backfill === true,
          ),
        ),
        lineValue(
          "Readback hydration",
          input.outcome_evaluation?.readback_hydration_complete === false
            ? "loading"
            : "complete",
        ),
        lineValue(
          "Backfill error",
          compact(input.outcome_evaluation?.outcome_backfill_error, "none"),
        ),
        lineValue(
          "Expected/Persisted",
          `${input.outcome_evaluation?.expected_outcome_count ?? 0}/${input.outcome_evaluation?.persisted_outcome_count ?? 0}`,
        ),
        lineValue(
          "Evaluated/Incomplete/Pending",
          `${input.outcome_evaluation?.evaluated_outcome_count ?? 0}/${input.outcome_evaluation?.incomplete_outcome_count ?? 0}/${input.outcome_evaluation?.pending_outcome_count ?? 0}`,
        ),
        lineValue(
          "Latest route run",
          `${compact(input.outcome_evaluation?.latest_run_status, "idle")} / ${compact(input.outcome_evaluation?.latest_run_at, "never")}`,
        ),
        lineValue(
          "Latest evaluated at",
          compact(input.outcome_evaluation?.latest_evaluated_at, "never"),
        ),
        lineValue(
          "Horizons covered",
          (input.outcome_evaluation?.horizons_covered ?? []).length > 0
            ? (input.outcome_evaluation?.horizons_covered ?? []).join(", ")
            : "none",
        ),
        lineValue(
          "Created/Updated",
          `${input.outcome_evaluation?.outcomes_created_count ?? 0}/${input.outcome_evaluation?.outcomes_updated_count ?? 0}`,
        ),
        lineValue(
          "Not old enough",
          input.outcome_evaluation?.skipped_not_old_enough_count ?? 0,
        ),
        lineValue(
          "Missing candles / provider errors",
          `${input.outcome_evaluation?.missing_candles_count ?? 0}/${input.outcome_evaluation?.provider_error_count ?? 0}`,
        ),
        lineValue(
          "Empty candle responses / provider limits",
          `${input.outcome_evaluation?.empty_candle_response_count ?? 0}/${input.outcome_evaluation?.provider_limit_count ?? 0}`,
        ),
        lineValue(
          "Provider budget",
          `${compact(input.outcome_evaluation?.outcome_provider_budget_status, "unknown")} / limit ${input.outcome_evaluation?.provider_budget_limit ?? "none"}`,
        ),
        lineValue(
          "Provider plan profile",
          `${compact(input.outcome_evaluation?.provider_plan_profile_mode, "unknown")} / ${compact(input.outcome_evaluation?.provider_plan_profile_source, "unknown")}`,
        ),
        lineValue(
          "Profile/override/effective budget",
          `${input.outcome_evaluation?.profile_budget_limit ?? "unknown"}/${input.outcome_evaluation?.override_budget_limit ?? "none"}/${input.outcome_evaluation?.effective_budget_limit ?? input.outcome_evaluation?.provider_budget_limit ?? "unknown"}`,
        ),
        lineValue(
          "Candle requests planned/executed/saved",
          `${input.outcome_evaluation?.candle_requests_planned ?? 0}/${input.outcome_evaluation?.candle_requests_executed ?? 0}/${input.outcome_evaluation?.candle_requests_saved_by_reuse ?? 0}`,
        ),
        lineValue(
          "Pending provider budget / retries",
          `${input.outcome_evaluation?.pending_provider_budget_count ?? 0}/${input.outcome_evaluation?.retry_incomplete_count ?? 0}`,
        ),
        lineValue(
          "Next retry",
          compact(input.outcome_evaluation?.next_retry_suggestion, "none"),
        ),
        lineValue(
          "Candle debug sample",
          (input.outcome_evaluation?.candle_request_debug_sample ?? []).length > 0
            ? "available in metrics"
            : "none",
        ),
        lineValue(
          "Enrichment mode",
          bool(input.outcome_evaluation?.enrichment_mode === true),
        ),
        lineValue(
          "Completed seen/enriched/skipped",
          `${input.outcome_evaluation?.completed_outcomes_seen_count ?? 0}/${input.outcome_evaluation?.completed_outcomes_enriched_count ?? 0}/${input.outcome_evaluation?.completed_outcomes_skipped_already_enriched_count ?? 0}`,
        ),
        lineValue(
          "Retained candles / counterfactual ready",
          `${input.outcome_evaluation?.retained_candles_added_count ?? 0}/${input.outcome_evaluation?.counterfactual_ready_count ?? 0}`,
        ),
        lineValue(
          "Retained candles available",
          input.outcome_evaluation?.retained_candles_available_count ?? 0,
        ),
        lineValue(
          "Provider limit warning",
          bool(input.outcome_evaluation?.provider_limit_warning === true),
        ),
        lineValue(
          "Persistence",
          `${compact(input.outcome_evaluation?.persistence_status, "unknown")} / ${compact(input.outcome_evaluation?.persistence_mode, "unknown")}`,
        ),
      ],
      metrics: {
        current_batch_fingerprint:
          input.outcome_evaluation?.current_batch_fingerprint ?? null,
        current_official_batch_fingerprint:
          input.outcome_evaluation?.current_official_batch_fingerprint ?? null,
        current_batch_expected_outcomes:
          input.outcome_evaluation?.current_batch_expected_outcomes ?? null,
        current_batch_persisted_outcomes:
          input.outcome_evaluation?.current_batch_persisted_outcomes ?? null,
        market_closed_readback_mode:
          input.outcome_evaluation?.market_closed_readback_mode ?? null,
        latest_trading_day_with_official_batch:
          input.outcome_evaluation?.latest_trading_day_with_official_batch ??
          null,
        latest_review_batch_fingerprint:
          input.outcome_evaluation?.latest_review_batch_fingerprint ?? null,
        latest_review_batch_source:
          input.outcome_evaluation?.latest_review_batch_source ?? null,
        shadow_snapshot_metadata_present_count:
          input.outcome_evaluation?.shadow_snapshot_metadata_present_count ?? null,
        shadow_snapshot_metadata_missing_count:
          input.outcome_evaluation?.shadow_snapshot_metadata_missing_count ?? null,
        shadow_snapshot_variant_counts: JSON.stringify(
          input.outcome_evaluation?.shadow_snapshot_variant_counts ?? {},
        ),
        shadow_snapshot_source_counts: JSON.stringify(
          input.outcome_evaluation?.shadow_snapshot_source_counts ?? {},
        ),
        learning_insights_source_batch_fingerprint:
          input.outcome_evaluation
            ?.learning_insights_source_batch_fingerprint ?? null,
        learning_insights_source_reason:
          input.outcome_evaluation?.learning_insights_source_reason ?? null,
        latest_counterfactual_ready_batch_fingerprint:
          input.outcome_evaluation
            ?.latest_counterfactual_ready_batch_fingerprint ?? null,
        latest_evaluated_batch_fingerprint:
          input.outcome_evaluation?.latest_evaluated_batch_fingerprint ?? null,
        current_batch_snapshot_count:
          input.outcome_evaluation?.current_batch_snapshot_count ?? null,
        outcome_rows_loaded_count:
          input.outcome_evaluation?.outcome_rows_loaded_count ?? null,
        outcome_rows_raw_count:
          input.outcome_evaluation?.outcome_rows_raw_count ?? null,
        outcome_rows_deduped_count:
          input.outcome_evaluation?.outcome_rows_deduped_count ?? null,
        outcome_rows_replaced_by_better_count:
          input.outcome_evaluation?.outcome_rows_replaced_by_better_count ?? null,
        outcome_dedupe_strategy:
          input.outcome_evaluation?.outcome_dedupe_strategy ?? null,
        stale_incomplete_rows_ignored_count:
          input.outcome_evaluation?.stale_incomplete_rows_ignored_count ?? null,
        outcome_batch_fingerprints: (
          input.outcome_evaluation?.outcome_batch_fingerprints ?? []
        ).join(","),
        outcome_snapshot_match_count:
          input.outcome_evaluation?.outcome_snapshot_match_count ?? null,
        outcome_unmatched_count:
          input.outcome_evaluation?.outcome_unmatched_count ?? null,
        outcome_batch_groups_count:
          input.outcome_evaluation?.outcome_batch_groups_count ?? null,
        latest_evaluated_batch_selection_reason:
          input.outcome_evaluation?.latest_evaluated_batch_selection_reason ??
          null,
        latest_evaluated_batch_rows:
          input.outcome_evaluation?.latest_evaluated_batch_rows ?? null,
        outcome_snapshot_backfill_attempted:
          input.outcome_evaluation?.outcome_snapshot_backfill_attempted ?? null,
        outcome_snapshot_backfill_count:
          input.outcome_evaluation?.outcome_snapshot_backfill_count ?? null,
        outcome_batch_backfill_count:
          input.outcome_evaluation?.outcome_batch_backfill_count ?? null,
        outcome_backfill_trigger_reason:
          input.outcome_evaluation?.outcome_backfill_trigger_reason ?? null,
        outcome_snapshot_fingerprints_requested_count:
          input.outcome_evaluation
            ?.outcome_snapshot_fingerprints_requested_count ?? null,
        outcome_snapshot_fingerprints_found_count:
          input.outcome_evaluation?.outcome_snapshot_fingerprints_found_count ??
          null,
        outcome_batch_fingerprints_requested_count:
          input.outcome_evaluation
            ?.outcome_batch_fingerprints_requested_count ?? null,
        outcome_batch_fingerprints_found_count:
          input.outcome_evaluation?.outcome_batch_fingerprints_found_count ??
          null,
        outcome_matching_recomputed_after_backfill:
          input.outcome_evaluation
            ?.outcome_matching_recomputed_after_backfill ?? null,
        readback_hydration_complete:
          input.outcome_evaluation?.readback_hydration_complete ?? null,
        outcome_backfill_error:
          input.outcome_evaluation?.outcome_backfill_error ?? null,
        expected_outcome_count:
          input.outcome_evaluation?.expected_outcome_count ?? null,
        persisted_outcome_count:
          input.outcome_evaluation?.persisted_outcome_count ?? null,
        evaluated_outcome_count:
          input.outcome_evaluation?.evaluated_outcome_count ?? null,
        incomplete_outcome_count:
          input.outcome_evaluation?.incomplete_outcome_count ?? null,
        pending_outcome_count:
          input.outcome_evaluation?.pending_outcome_count ?? null,
        latest_run_status: input.outcome_evaluation?.latest_run_status ?? null,
        latest_run_at: input.outcome_evaluation?.latest_run_at ?? null,
        latest_evaluated_at:
          input.outcome_evaluation?.latest_evaluated_at ?? null,
        horizons_covered: (
          input.outcome_evaluation?.horizons_covered ?? []
        ).join(","),
        provider_limit_warning:
          input.outcome_evaluation?.provider_limit_warning ?? null,
        latest_run_batch_fingerprint:
          input.outcome_evaluation?.latest_run_batch_fingerprint ?? null,
        latest_run_horizons: (
          input.outcome_evaluation?.latest_run_horizons ?? []
        ).join(","),
        outcomes_created_count:
          input.outcome_evaluation?.outcomes_created_count ?? null,
        outcomes_updated_count:
          input.outcome_evaluation?.outcomes_updated_count ?? null,
        skipped_not_old_enough_count:
          input.outcome_evaluation?.skipped_not_old_enough_count ?? null,
        missing_candles_count:
          input.outcome_evaluation?.missing_candles_count ?? null,
        provider_error_count:
          input.outcome_evaluation?.provider_error_count ?? null,
        candle_requests_planned:
          input.outcome_evaluation?.candle_requests_planned ?? null,
        candle_requests_executed:
          input.outcome_evaluation?.candle_requests_executed ?? null,
        candle_requests_saved_by_reuse:
          input.outcome_evaluation?.candle_requests_saved_by_reuse ?? null,
        provider_budget_limit:
          input.outcome_evaluation?.provider_budget_limit ?? null,
        provider_plan_profile_mode:
          input.outcome_evaluation?.provider_plan_profile_mode ?? null,
        provider_plan_profile_source:
          input.outcome_evaluation?.provider_plan_profile_source ?? null,
        server_plan_mode:
          input.outcome_evaluation?.server_plan_mode ?? null,
        public_plan_mode:
          input.outcome_evaluation?.public_plan_mode ?? null,
        plan_mode_mismatch:
          input.outcome_evaluation?.plan_mode_mismatch ?? null,
        profile_budget_limit:
          input.outcome_evaluation?.profile_budget_limit ?? null,
        override_budget_limit:
          input.outcome_evaluation?.override_budget_limit ?? null,
        effective_budget_limit:
          input.outcome_evaluation?.effective_budget_limit ?? null,
        skipped_due_to_budget_count:
          input.outcome_evaluation?.skipped_due_to_budget_count ?? null,
        pending_provider_budget_count:
          input.outcome_evaluation?.pending_provider_budget_count ?? null,
        retry_incomplete_count:
          input.outcome_evaluation?.retry_incomplete_count ?? null,
        unique_candle_requests_count:
          input.outcome_evaluation?.unique_candle_requests_count ?? null,
        empty_candle_response_count:
          input.outcome_evaluation?.empty_candle_response_count ?? null,
        provider_limit_count:
          input.outcome_evaluation?.provider_limit_count ?? null,
        candle_request_debug_sample: JSON.stringify(
          input.outcome_evaluation?.candle_request_debug_sample ?? [],
        ),
        enrichment_mode: input.outcome_evaluation?.enrichment_mode ?? null,
        completed_outcomes_seen_count:
          input.outcome_evaluation?.completed_outcomes_seen_count ?? null,
        completed_outcomes_enriched_count:
          input.outcome_evaluation?.completed_outcomes_enriched_count ?? null,
        completed_outcomes_skipped_already_enriched_count:
          input.outcome_evaluation
            ?.completed_outcomes_skipped_already_enriched_count ?? null,
        retained_candles_added_count:
          input.outcome_evaluation?.retained_candles_added_count ?? null,
        retained_candles_available_count:
          input.outcome_evaluation?.retained_candles_available_count ?? null,
        counterfactual_ready_count:
          input.outcome_evaluation?.counterfactual_ready_count ?? null,
        shadow_eligible_snapshot_count:
          input.outcome_evaluation?.shadow_eligible_snapshot_count ?? null,
        shadow_missing_metadata_count:
          input.outcome_evaluation?.shadow_missing_metadata_count ?? null,
        shadow_entry_trial_count:
          input.outcome_evaluation?.shadow_entry_trial_count ?? null,
        shadow_entry_triggered_count:
          input.outcome_evaluation?.shadow_entry_triggered_count ?? null,
        outcome_provider_budget_status:
          input.outcome_evaluation?.outcome_provider_budget_status ?? null,
        next_retry_suggestion:
          input.outcome_evaluation?.next_retry_suggestion ?? null,
        persistence_status:
          input.outcome_evaluation?.persistence_status ?? null,
        persistence_mode:
          input.outcome_evaluation?.persistence_mode ?? null,
        elapsed_ms: input.outcome_evaluation?.elapsed_ms ?? null,
        tickers_evaluated: (
          input.outcome_evaluation?.tickers_evaluated ?? []
        ).join(","),
      },
    }),
    section({
      section_id: "outcome_learning_insights",
      title: "Learning Insights",
      severity:
        input.outcome_learning?.primary_insight?.severity === "warning"
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Latest evaluated batch",
          compact(input.outcome_learning?.batch_fingerprint, "none"),
        ),
        lineValue(
          "Entry triggered rate",
          input.outcome_learning?.entry_triggered_rate ?? null,
        ),
        lineValue(
          "Entry not triggered rate",
          input.outcome_learning?.entry_not_triggered_rate ?? null,
        ),
        lineValue("Avg best R", input.outcome_learning?.avg_best_r ?? null),
        lineValue("Avg worst R", input.outcome_learning?.avg_worst_r ?? null),
        lineValue(
          "Primary insight",
          compact(input.outcome_learning?.primary_insight?.title, "none"),
        ),
        lineValue(
          "Primary reason",
          compact(input.outcome_learning?.primary_insight?.reason, "none"),
        ),
        lineValue(
          "Suggested next review",
          compact(input.outcome_learning?.suggested_next_review_item, "none"),
        ),
        lineValue(
          "Entry quality label",
          compact(
            input.outcome_learning?.entry_plan_quality.entry_quality_label,
            "unknown",
          ),
        ),
        lineValue(
          "Missed but favorable rate",
          input.outcome_learning?.entry_plan_quality.missed_but_favorable_rate ??
            null,
        ),
        lineValue(
          "Entry too aggressive rate",
          input.outcome_learning?.entry_plan_quality.entry_too_aggressive_rate ??
            null,
        ),
        lineValue(
          "Target too far signal",
          input.outcome_learning?.entry_plan_quality.target_too_far_signal ??
            null,
        ),
        lineValue(
          "Best entry variant",
          compact(
            input.outcome_learning?.entry_plan_quality
              .counterfactual_entry_simulation.best_entry_variant,
            "none",
          ),
        ),
        lineValue(
          "Original / best trigger",
          `${input.outcome_learning?.entry_plan_quality.counterfactual_entry_simulation.original_entry_trigger_rate ?? "unknown"} / ${input.outcome_learning?.entry_plan_quality.counterfactual_entry_simulation.best_variant_trigger_rate ?? "unknown"}`,
        ),
        lineValue(
          "Counterfactual reason",
          compact(
            input.outcome_learning?.entry_plan_quality
              .counterfactual_entry_simulation.counterfactual_primary_reason,
            "none",
          ),
        ),
        lineValue(
          "Shadow trial",
          `${compact(input.outcome_learning?.shadow_entry_trial.variant, "none")} / ${compact(input.outcome_learning?.shadow_entry_trial.status, "not_started")}`,
        ),
        lineValue(
          "Official / shadow trigger",
          `${input.outcome_learning?.shadow_entry_trial.official_entry_trigger_rate ?? "unknown"} / ${input.outcome_learning?.shadow_entry_trial.shadow_entry_trigger_rate ?? "unknown"}`,
        ),
        lineValue(
          "Official / shadow avg best R",
          `${input.outcome_learning?.shadow_entry_trial.official_avg_best_r ?? "unknown"} / ${input.outcome_learning?.shadow_entry_trial.shadow_avg_best_r ?? "unknown"}`,
        ),
        lineValue(
          "Official / shadow avg worst R",
          `${input.outcome_learning?.shadow_entry_trial.official_avg_worst_r ?? "unknown"} / ${input.outcome_learning?.shadow_entry_trial.shadow_avg_worst_r ?? "unknown"}`,
        ),
        lineValue(
          "Shadow warning",
          compact(input.outcome_learning?.shadow_entry_trial.warning, "not live signal"),
        ),
      ],
      metrics: {
        learning_insight_batch_fingerprint:
          input.outcome_learning?.diagnostics
            .learning_insight_batch_fingerprint ?? null,
        learning_insight_outcome_count:
          input.outcome_learning?.diagnostics.learning_insight_outcome_count ??
          null,
        learning_insight_entry_triggered_rate:
          input.outcome_learning?.diagnostics
            .learning_insight_entry_triggered_rate ?? null,
        learning_insight_primary_reason:
          input.outcome_learning?.diagnostics.learning_insight_primary_reason ??
          null,
        total_recommendations:
          input.outcome_learning?.total_recommendations ?? null,
        total_evaluated_outcomes:
          input.outcome_learning?.total_evaluated_outcomes ?? null,
        entry_not_triggered_rate:
          input.outcome_learning?.entry_not_triggered_rate ?? null,
        target_hit_rate: input.outcome_learning?.target_hit_rate ?? null,
        stop_hit_rate: input.outcome_learning?.stop_hit_rate ?? null,
        avg_best_r: input.outcome_learning?.avg_best_r ?? null,
        avg_worst_r: input.outcome_learning?.avg_worst_r ?? null,
        max_best_r: input.outcome_learning?.max_best_r ?? null,
        max_drawdown_r: input.outcome_learning?.max_drawdown_r ?? null,
        incomplete_outcome_count:
          input.outcome_learning?.incomplete_outcome_count ?? null,
        data_quality_gap_count:
          input.outcome_learning?.data_quality_gap_count ?? null,
        horizon_breakdown: JSON.stringify(
          input.outcome_learning?.horizon_breakdown ?? [],
        ),
        tier_breakdown: JSON.stringify(
          input.outcome_learning?.tier_breakdown ?? [],
        ),
        entry_plan_quality_batch_fingerprint:
          input.outcome_learning?.entry_plan_quality.diagnostics
            .entry_plan_quality_batch_fingerprint ?? null,
        missed_but_favorable_rate:
          input.outcome_learning?.entry_plan_quality.diagnostics
            .missed_but_favorable_rate ?? null,
        entry_too_aggressive_rate:
          input.outcome_learning?.entry_plan_quality.diagnostics
            .entry_too_aggressive_rate ?? null,
        target_too_far_rate:
          input.outcome_learning?.entry_plan_quality.diagnostics
            .target_too_far_rate ?? null,
        avg_mfe_without_entry:
          input.outcome_learning?.entry_plan_quality.diagnostics
            .avg_mfe_without_entry ?? null,
        avg_mae_without_entry:
          input.outcome_learning?.entry_plan_quality.avg_mae_without_entry ??
          null,
        entry_quality_label:
          input.outcome_learning?.entry_plan_quality.entry_quality_label ?? null,
        suggested_tuning: (
          input.outcome_learning?.entry_plan_quality.suggested_tuning ?? []
        ).join("; "),
        entry_plan_quality_items: JSON.stringify(
          input.outcome_learning?.entry_plan_quality.items ?? [],
        ),
        counterfactual_variants_tested:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.counterfactual_variants_tested ??
          null,
        best_entry_variant:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.best_entry_variant ?? null,
        best_entry_variant_trigger_rate:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.best_variant_trigger_rate ?? null,
        original_entry_trigger_rate:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.original_entry_trigger_rate ?? null,
        best_variant_avg_best_r:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.best_variant_avg_best_r ?? null,
        best_variant_avg_worst_r:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.best_variant_avg_worst_r ?? null,
        counterfactual_primary_reason:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.counterfactual_primary_reason ??
          null,
        variant_with_best_balance:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.variant_with_best_balance ?? null,
        variant_risk_warning_count:
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.variant_risk_warning_count ?? null,
        counterfactual_recommendation_summaries: JSON.stringify(
          input.outcome_learning?.entry_plan_quality
            .counterfactual_entry_simulation.recommendation_summaries ?? [],
        ),
        shadow_entry_variant:
          input.outcome_learning?.shadow_entry_trial.variant ?? null,
        shadow_trial_status:
          input.outcome_learning?.shadow_entry_trial.status ?? null,
        official_entry_trigger_rate:
          input.outcome_learning?.shadow_entry_trial
            .official_entry_trigger_rate ?? null,
        shadow_entry_trigger_rate:
          input.outcome_learning?.shadow_entry_trial
            .shadow_entry_trigger_rate ?? null,
        official_avg_best_r:
          input.outcome_learning?.shadow_entry_trial.official_avg_best_r ??
          null,
        shadow_avg_best_r:
          input.outcome_learning?.shadow_entry_trial.shadow_avg_best_r ?? null,
        official_avg_worst_r:
          input.outcome_learning?.shadow_entry_trial.official_avg_worst_r ??
          null,
        shadow_avg_worst_r:
          input.outcome_learning?.shadow_entry_trial.shadow_avg_worst_r ??
          null,
        shadow_trial_sample_size:
          input.outcome_learning?.shadow_entry_trial.shadow_trial_sample_size ??
          null,
        shadow_trial_warning:
          input.outcome_learning?.shadow_entry_trial.warning ?? null,
        outcome_route_shadow_entry_trial_count:
          input.outcome_evaluation?.shadow_entry_trial_count ?? null,
        outcome_route_shadow_entry_triggered_count:
          input.outcome_evaluation?.shadow_entry_triggered_count ?? null,
      },
    }),
    section({
      section_id: "shadow_entry_trial",
      title: "Shadow Entry Trial",
      severity: "info",
      lines: [
        lineValue(
          "Variant",
          compact(input.outcome_learning?.shadow_entry_trial.variant, "none"),
        ),
        lineValue(
          "Status",
          shadowTrialState,
        ),
        lineValue(
          "Snapshot metadata present/missing",
          `${shadowMetadataPresent}/${shadowMetadataMissing}`,
        ),
        lineValue(
          "Outcome route eligible/missing metadata",
          `${input.outcome_evaluation?.shadow_eligible_snapshot_count ?? 0}/${input.outcome_evaluation?.shadow_missing_metadata_count ?? 0}`,
        ),
        lineValue(
          "Official vs shadow trigger",
          `${input.outcome_learning?.shadow_entry_trial.official_entry_trigger_rate ?? "unknown"} / ${input.outcome_learning?.shadow_entry_trial.shadow_entry_trigger_rate ?? "unknown"}`,
        ),
        lineValue(
          "Official vs shadow avg best/worst R",
          `${input.outcome_learning?.shadow_entry_trial.official_avg_best_r ?? "unknown"} / ${input.outcome_learning?.shadow_entry_trial.shadow_avg_best_r ?? "unknown"} best, ${input.outcome_learning?.shadow_entry_trial.official_avg_worst_r ?? "unknown"} / ${input.outcome_learning?.shadow_entry_trial.shadow_avg_worst_r ?? "unknown"} worst`,
        ),
        lineValue(
          "Sample size",
          input.outcome_learning?.shadow_entry_trial.shadow_trial_sample_size ??
            null,
        ),
        lineValue("Warning", "learning-only; not a live signal"),
      ],
      metrics: {
        shadow_entry_variant:
          input.outcome_learning?.shadow_entry_trial.variant ?? null,
        shadow_trial_status:
          shadowTrialState,
        shadow_snapshot_metadata_present_count: shadowMetadataPresent,
        shadow_snapshot_metadata_missing_count: shadowMetadataMissing,
        shadow_snapshot_variant_counts: JSON.stringify(
          input.outcome_evaluation?.shadow_snapshot_variant_counts ?? {},
        ),
        shadow_snapshot_source_counts: JSON.stringify(
          input.outcome_evaluation?.shadow_snapshot_source_counts ?? {},
        ),
        shadow_eligible_snapshot_count:
          input.outcome_evaluation?.shadow_eligible_snapshot_count ?? null,
        shadow_missing_metadata_count:
          input.outcome_evaluation?.shadow_missing_metadata_count ?? null,
        official_entry_trigger_rate:
          input.outcome_learning?.shadow_entry_trial
            .official_entry_trigger_rate ?? null,
        shadow_entry_trigger_rate:
          input.outcome_learning?.shadow_entry_trial
            .shadow_entry_trigger_rate ?? null,
        official_avg_best_r:
          input.outcome_learning?.shadow_entry_trial.official_avg_best_r ??
          null,
        shadow_avg_best_r:
          input.outcome_learning?.shadow_entry_trial.shadow_avg_best_r ?? null,
        official_avg_worst_r:
          input.outcome_learning?.shadow_entry_trial.official_avg_worst_r ??
          null,
        shadow_avg_worst_r:
          input.outcome_learning?.shadow_entry_trial.shadow_avg_worst_r ??
          null,
        shadow_trial_sample_size:
          input.outcome_learning?.shadow_entry_trial.shadow_trial_sample_size ??
          null,
        shadow_entry_not_live_signal: true,
      },
    }),
    section({
      section_id: "entry_tuning_proposal",
      title: "Entry Tuning Proposal",
      severity:
        input.entry_tuning_proposal?.confidence === "high"
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Proposal",
          compact(input.entry_tuning_proposal?.proposal_id, "none"),
        ),
        lineValue(
          "Proposed variant",
          compact(
            input.entry_tuning_proposal?.proposed_entry_variant,
            "none",
          ),
        ),
        lineValue(
          "Confidence",
          compact(input.entry_tuning_proposal?.confidence, "unknown"),
        ),
        lineValue(
          "Recommended action",
          compact(
            input.entry_tuning_proposal?.recommended_action,
            "unknown",
          ),
        ),
        lineValue(
          "Evidence",
          compact(input.entry_tuning_proposal?.evidence_summary, "none"),
        ),
        lineValue(
          "Risk notes",
          (input.entry_tuning_proposal?.risk_notes ?? []).length > 0
            ? (input.entry_tuning_proposal?.risk_notes ?? []).join(" | ")
            : "none",
        ),
        lineValue(
          "Sample size",
          `${input.entry_tuning_proposal?.sample_size.evaluated_outcomes ?? 0} outcomes / ${input.entry_tuning_proposal?.sample_size.evaluated_batches ?? 0} batches`,
        ),
      ],
      metrics: {
        proposal_id:
          input.entry_tuning_proposal?.diagnostics.proposal_id ?? null,
        proposed_entry_variant:
          input.entry_tuning_proposal?.diagnostics.proposed_entry_variant ??
          null,
        proposal_confidence:
          input.entry_tuning_proposal?.diagnostics.proposal_confidence ?? null,
        proposal_recommended_action:
          input.entry_tuning_proposal?.diagnostics
            .proposal_recommended_action ?? null,
        expected_trigger_rate_change:
          input.entry_tuning_proposal?.expected_trigger_rate_change ?? null,
        expected_avg_best_r_change:
          input.entry_tuning_proposal?.expected_avg_best_r_change ?? null,
        expected_avg_worst_r_change:
          input.entry_tuning_proposal?.expected_avg_worst_r_change ?? null,
        risk_notes: (
          input.entry_tuning_proposal?.risk_notes ?? []
        ).join("; "),
        sample_evaluated_outcomes:
          input.entry_tuning_proposal?.sample_size.evaluated_outcomes ?? null,
        sample_evaluated_recommendations:
          input.entry_tuning_proposal?.sample_size.evaluated_recommendations ??
          null,
        sample_simulated_recommendations:
          input.entry_tuning_proposal?.sample_size.simulated_recommendations ??
          null,
        sample_evaluated_batches:
          input.entry_tuning_proposal?.sample_size.evaluated_batches ?? null,
      },
    }),
  ];
}

function buildJsonPayload(input: {
  generatedAt: string;
  overallStatus: MarketDiagnosticsConsoleSummary["overall_status"];
  suggestedNextAction: string;
  sections: MarketDiagnosticsConsoleSection[];
  blockers: MarketDiagnosticsConsoleWarning[];
  warnings: MarketDiagnosticsConsoleWarning[];
}) {
  return {
    summary_kind: "market_diagnostics_console",
    generated_at: input.generatedAt,
    overall_status: input.overallStatus,
    suggested_next_action: input.suggestedNextAction,
    sections: input.sections.map((sectionItem) => ({
      section_id: sectionItem.section_id,
      title: sectionItem.title,
      severity: sectionItem.severity,
      metrics: sectionItem.metrics,
    })),
    top_blockers: input.blockers,
    top_warnings: input.warnings,
  };
}

function buildTextPayload(input: {
  generatedAt: string;
  overallStatus: MarketDiagnosticsConsoleSummary["overall_status"];
  suggestedNextAction: string;
  sections: MarketDiagnosticsConsoleSection[];
  blockers: MarketDiagnosticsConsoleWarning[];
  warnings: MarketDiagnosticsConsoleWarning[];
}) {
  const sectionText = input.sections
    .map((sectionItem) => {
      return [
        `${sectionItem.title}:`,
        ...sectionItem.lines.map((line) => `- ${line}`),
      ].join("\n");
    })
    .join("\n\n");
  const blockerText =
    input.blockers.length === 0
      ? "- None"
      : input.blockers.map((item) => `- [${item.source}] ${item.message}`).join("\n");
  const warningText =
    input.warnings.length === 0
      ? "- None"
      : input.warnings.map((item) => `- [${item.source}] ${item.message}`).join("\n");

  return [
    "TURE MARKET DIAGNOSTICS",
    `Generated: ${input.generatedAt}`,
    `Overall: ${words(input.overallStatus)}`,
    `Next action: ${input.suggestedNextAction}`,
    "",
    sectionText,
    "",
    "Top blockers:",
    blockerText,
    "",
    "Top warnings:",
    warningText,
  ].join("\n");
}

function buildMarkdownPayload(input: {
  generatedAt: string;
  overallStatus: MarketDiagnosticsConsoleSummary["overall_status"];
  suggestedNextAction: string;
  sections: MarketDiagnosticsConsoleSection[];
  blockers: MarketDiagnosticsConsoleWarning[];
  warnings: MarketDiagnosticsConsoleWarning[];
}) {
  return [
    "# Ture Market Diagnostics",
    "",
    `Generated: ${input.generatedAt}`,
    `Overall: ${words(input.overallStatus)}`,
    `Next action: ${input.suggestedNextAction}`,
    "",
    ...input.sections.flatMap((sectionItem) => [
      `## ${sectionItem.title}`,
      ...sectionItem.lines.map((line) => `- ${line}`),
      "",
    ]),
    "## Top blockers",
    ...(input.blockers.length === 0
      ? ["- None"]
      : input.blockers.map((item) => `- [${item.source}] ${item.message}`)),
    "",
    "## Top warnings",
    ...(input.warnings.length === 0
      ? ["- None"]
      : input.warnings.map((item) => `- [${item.source}] ${item.message}`)),
  ].join("\n");
}

function payload(
  format: MarketDiagnosticsConsoleFormat,
  generatedAt: string,
  content: string,
): MarketDiagnosticsConsoleCopyPayload {
  return {
    format,
    generated_at: generatedAt,
    character_count: content.length,
    content,
  };
}

export function buildMarketDiagnosticsConsoleSummary(
  input: MarketDiagnosticsConsoleInput,
): MarketDiagnosticsConsoleSummary {
  const now = toDate(input.now) ?? new Date();
  const generatedAt = now.toISOString();
  const topWarnings = buildWarnings(input);
  const overallStatus = determineOverallStatus(input, topWarnings.blockers);
  const nextAction = suggestedNextAction(input, overallStatus);
  const sections = buildSections(input, topWarnings);
  const jsonPayload = JSON.stringify(
    buildJsonPayload({
      generatedAt,
      overallStatus,
      suggestedNextAction: nextAction,
      sections,
      blockers: topWarnings.blockers,
      warnings: topWarnings.warnings,
    }),
    null,
    2,
  );
  const textPayload = buildTextPayload({
    generatedAt,
    overallStatus,
    suggestedNextAction: nextAction,
    sections,
    blockers: topWarnings.blockers,
    warnings: topWarnings.warnings,
  });
  const markdownPayload = buildMarkdownPayload({
    generatedAt,
    overallStatus,
    suggestedNextAction: nextAction,
    sections,
    blockers: topWarnings.blockers,
    warnings: topWarnings.warnings,
  });

  return {
    summary_id: `market_diagnostics_console_${generatedAt}`,
    summary_version: "1.0",
    summary_kind: "market_diagnostics_console",
    generated_at: generatedAt,
    overall_status: overallStatus,
    suggested_next_action: nextAction,
    sections,
    top_blockers: topWarnings.blockers,
    top_warnings: topWarnings.warnings,
    copy_payloads: {
      summary_text: payload("summary_text", generatedAt, textPayload),
      json: payload("json", generatedAt, jsonPayload),
      markdown: payload("markdown", generatedAt, markdownPayload),
    },
  };
}

export function marketDiagnosticsConsoleSummaryJson(
  summary: MarketDiagnosticsConsoleSummary,
) {
  return JSON.stringify(
    {
      summary_id: summary.summary_id,
      summary_version: summary.summary_version,
      summary_kind: summary.summary_kind,
      generated_at: summary.generated_at,
      overall_status: summary.overall_status,
      suggested_next_action: summary.suggested_next_action,
      sections: summary.sections,
      top_blockers: summary.top_blockers,
      top_warnings: summary.top_warnings,
      copy_payloads: {
        summary_text: {
          format: summary.copy_payloads.summary_text.format,
          generated_at: summary.copy_payloads.summary_text.generated_at,
          character_count: summary.copy_payloads.summary_text.character_count,
        },
        json: {
          format: summary.copy_payloads.json.format,
          generated_at: summary.copy_payloads.json.generated_at,
          character_count: summary.copy_payloads.json.character_count,
        },
        markdown: {
          format: summary.copy_payloads.markdown.format,
          generated_at: summary.copy_payloads.markdown.generated_at,
          character_count: summary.copy_payloads.markdown.character_count,
        },
      },
    },
    null,
    2,
  );
}
