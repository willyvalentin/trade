import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";
import type { DailyRecommendationTradeTargetsSummary } from "@/lib/daily-recommendation-trade-targets";
import type { DayTradeWindowRecommendationTargetSummary } from "@/lib/day-trade-window-recommendation-target";
import type { DynamicMoversDiscoverySummary } from "@/lib/dynamic-movers-discovery";
import type { DynamicMarketMoversSummary } from "@/lib/dynamic-market-movers";
import type { MarketSessionEvaluation, MarketSessionStatus } from "@/lib/market-session";
import type { ProviderBudgetGuardSummary } from "@/lib/provider-budget-guard";
import type { ProviderPlanProfile } from "@/lib/provider-plan-profile";
import type { RealRecommendationOutputReadinessSummary } from "@/lib/real-recommendation-output-readiness";
import type { RecommendationBatchSummary } from "@/lib/recommendation-batch-memory";
import type { RecommendationEngineControlCenterSummary } from "@/lib/recommendation-engine-control-center";
import type { EntryTuningProposal } from "@/lib/entry-tuning-proposal";
import type { RecommendationOutputEnrichmentSummary } from "@/lib/recommendation-output-enrichment";
import type { RecommendationOutcomeLearningInsightsSummary } from "@/lib/recommendation-outcome-learning-insights";
import type { RecommendationPerformanceStatistics } from "@/lib/recommendation-performance-statistics";
import type { RecommendationScanRunHistorySummary } from "@/lib/recommendation-scan-run-history";
import type { RecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import type { PlanPriceFreshnessSummary } from "@/lib/plan-price-freshness";
import type { PlanReferenceMetadataTraceSummary } from "@/lib/plan-reference-metadata-trace";
import type { EntryTypeTriggerSummary } from "@/lib/recommendation-entry-type";
import type { ScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import type { ScannerOutputQaSummary } from "@/lib/scanner-output-qa";
import type { ScannerUniverseCoverageSummary } from "@/lib/scanner-universe";
import type { LiveMarketTrialReadinessSummary } from "@/lib/live-market-trial-readiness";
import type { LiveMarketTrialRunbookSummary } from "@/lib/live-market-trial-runbook";
import type { ActiveScanTrace } from "@/lib/active-scan-trace";
import {
  clientUnavailableLearningAccelerationConfig,
  type LearningAccelerationModeEvaluation,
} from "@/lib/learning-acceleration-mode";
import type { ScheduledScanTimelineEntry } from "@/lib/scheduled-scan-attempts";
import {
  buildBatchCandidateAuditSummary,
  type BatchCandidateAuditSummary,
} from "@/lib/batch-candidate-audit";

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
  dynamic_movers_discovery?: DynamicMoversDiscoverySummary | null;
  scanner_ranking?: ScannerCandidateRankingSummary | null;
  active_scan_trace?: ActiveScanTrace | null;
  learning_acceleration_config?: LearningAccelerationModeEvaluation | null;
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
    current_batch_raw_snapshot_rows?: number | null;
    current_batch_unique_snapshot_fingerprints?: number | null;
    current_batch_duplicate_snapshot_rows?: number | null;
    current_batch_unique_learning_ideas?: number | null;
    current_batch_visible_grid_count?: number | null;
    current_batch_visible_recommendation_count?: number | null;
    current_batch_learning_snapshot_count?: number | null;
    current_batch_grid_card_count?: number | null;
    current_batch_batch_health?: string | null;
    grow_max_learning_mode?: boolean | null;
    learning_acceleration_enabled?: boolean | null;
    learning_acceleration_enabled_source?: string | null;
    learning_acceleration_env_raw_present?: boolean | null;
    learning_acceleration_env_raw_value_category?: string | null;
    learning_acceleration_env_raw_value_normalized?: boolean | null;
    learning_acceleration_runtime_environment?: string | null;
    learning_acceleration_mode?: string | null;
    learning_acceleration_samples_collected_today?: number | null;
    learning_acceleration_samples_evaluated_today?: number | null;
    learning_acceleration_selected_below_threshold_count?: number | null;
    learning_acceleration_selected_below_threshold_readback_count?: number | null;
    learning_acceleration_selected_below_threshold_passed_count?: number | null;
    learning_acceleration_selected_below_threshold_matched_by_ticker_count?:
      number | null;
    learning_acceleration_selected_below_threshold_unmatched_by_ticker_count?:
      number | null;
    learning_acceleration_input_mismatch?: boolean | null;
    learning_acceleration_research_only_persisted_count?: number | null;
    learning_acceleration_top_research_sample_tickers?: string[];
    learning_acceleration_sample_quality_summary?: {
      good?: number | null;
      usable?: number | null;
    } | null;
    target_ideas_per_window?: number | null;
    ideas_persisted_this_window?: number | null;
    ideas_persisted_today?: number | null;
    raw_rows_today?: number | null;
    unique_learning_ideas_today?: number | null;
    unique_evaluated_ideas_today?: number | null;
    expected_outcome_rows_today?: number | null;
    persisted_outcome_rows_today?: number | null;
    visible_cards_today?: number | null;
    hidden_archived_members_today?: number | null;
    batches_created_today_by_window?: Record<string, number>;
    same_window_batch_blocked_count?: number | null;
    daily_learning_limit_status?: string | null;
    provider_budget_used_for_scan?: number | null;
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
      created_at_ny?: string | null;
      scan_window?: string | null;
      window_classification?: string | null;
      created_at_window_classification?: string | null;
      produced_inside_official_window?: boolean | null;
      visible_recommendation_count?: number | null;
      message?: string | null;
      source?: string | null;
    } | null;
    latest_attempted_scan?: {
      result?: string | null;
      created_at?: string | null;
      created_at_ny?: string | null;
      scan_window?: string | null;
      window_classification?: string | null;
      created_at_window_classification?: string | null;
      produced_inside_official_window?: boolean | null;
      visible_recommendation_count?: number | null;
      message?: string | null;
      source?: string | null;
    } | null;
    scheduled_scan_timeline_today?: ScheduledScanTimelineEntry[];
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
    outcome_eligible_snapshot_count?: number | null;
    outcome_evaluated_snapshot_count?: number | null;
    outcome_ineligible_snapshot_count?: number | null;
    total_snapshots_loaded_for_batch?: number | null;
    raw_snapshot_rows?: number | null;
    total_recommendation_rows_loaded_for_batch?: number | null;
    eligible_visible_snapshot_count?: number | null;
    eligible_learning_snapshot_count?: number | null;
    eligible_research_only_snapshot_count?: number | null;
    grow_max_learning_snapshots_included_count?: number | null;
    learning_acceleration_enabled?: boolean | null;
    learning_acceleration_enabled_source?: string | null;
    learning_acceleration_env_raw_present?: boolean | null;
    learning_acceleration_env_raw_value_category?: string | null;
    learning_acceleration_env_raw_value_normalized?: boolean | null;
    learning_acceleration_runtime_environment?: string | null;
    learning_acceleration_mode?: string | null;
    learning_acceleration_samples_evaluated?: number | null;
    ineligible_snapshot_count?: number | null;
    ineligible_reasons?: Record<string, number>;
    unique_snapshot_fingerprints_count?: number | null;
    unique_learning_ideas?: number | null;
    duplicate_snapshot_fingerprints_count?: number | null;
    duplicate_snapshot_rows?: number | null;
    duplicate_snapshot_rows_ignored_count?: number | null;
    hidden_archived_duplicate_rows_ignored_count?: number | null;
    visible_duplicate_rows_ignored_count?: number | null;
    canonical_visible_snapshots_retained_count?: number | null;
    canonical_visible_duplicate_fingerprints_retained_count?: number | null;
    archived_duplicate_rows_blocked_count?: number | null;
    duplicate_snapshot_conflict_count?: number | null;
    duplicate_snapshot_conflict_reasons?: Record<string, number>;
    visible_recommendations?: number | null;
    visible_grid_count?: number | null;
    grid_cards?: number | null;
    expected_outcome_rows_from_eligible_snapshots?: number | null;
    batch_health?: string | null;
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
    plan_price_freshness_summary?: PlanPriceFreshnessSummary | null;
    plan_reference_metadata_trace?: PlanReferenceMetadataTraceSummary | null;
    entry_type_trigger_summary?: EntryTypeTriggerSummary | null;
    batch_candidate_audit?: BatchCandidateAuditSummary | null;
    expected_snapshot_count_from_scan?: number | null;
    actual_snapshot_count_for_batch?: number | null;
    missing_snapshot_count?: number | null;
    missing_snapshot_reasons?: Record<string, number>;
    strict_batch_filter_excluded_count?: number | null;
  } | null;
  outcome_learning?: RecommendationOutcomeLearningInsightsSummary | null;
  entry_tuning_proposal?: EntryTuningProposal | null;
  recommendation_output_enrichment?: RecommendationOutputEnrichmentSummary | null;
  metadata_coverage?: {
    snapshots_with_data_timestamp?: number | null;
    snapshots_with_provider_source?: number | null;
    explicit_gap_count?: number | null;
    missing_metadata_fields?: string[];
    qa_checked_source_path?: string | null;
    metadata_missing_at_stage?: string | null;
  } | null;
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

function positiveCount(value: number | null | undefined) {
  const normalized = count(value);
  return normalized > 0 ? normalized : null;
}

function firstPositiveCount(
  ...values: Array<number | null | undefined>
) {
  for (const value of values) {
    const normalized = positiveCount(value);
    if (normalized !== null) return normalized;
  }

  return 0;
}

function words(value: string | null | undefined) {
  return (value || "unknown").replaceAll("_", " ");
}

function compact(value: string | null | undefined, fallback = "unknown") {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function bool(value: boolean) {
  return value ? "yes" : "no";
}

function providerPlanProfileMetrics(input: MarketDiagnosticsConsoleInput) {
  const activeTrace = input.active_scan_trace;
  const outcome = input.outcome_evaluation;
  const fallback = input.provider_plan_profile;
  const activeTraceProfile = asRecord(activeTrace);
  const fallbackProfile = asRecord(fallback);
  const mode =
    compact(
      activeTrace?.provider_plan_profile_mode ??
        outcome?.provider_plan_profile_mode ??
        fallback?.effective_mode ??
        fallback?.mode,
      "unknown",
    );
  const source =
    compact(
      activeTrace?.provider_plan_profile_source ??
        outcome?.provider_plan_profile_source ??
        fallback?.source,
      "unknown",
    );
  const serverPlanMode =
    compact(
      activeTrace?.server_plan_mode ??
        outcome?.server_plan_mode ??
        fallback?.server_plan_mode,
      "unknown",
    );
  const publicPlanMode =
    compact(
      activeTrace?.public_plan_mode ??
        outcome?.public_plan_mode ??
        fallback?.public_plan_mode,
      "unknown",
    );
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
    activeTrace?.effective_outcome_candle_request_cap ??
    outcome?.effective_budget_limit ??
    outcome?.provider_budget_limit ??
    fallback?.profile_outcome_candle_requests_per_run ??
    null;
  const profileBudgetLimit =
    activeTrace?.profile_outcome_candle_request_cap ??
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
  const activeTraceNotes = asStringArray(activeTraceProfile.profile_notes);
  const fallbackNotes = asStringArray(fallbackProfile.profile_notes);
  const activeTraceWarnings = asStringArray(activeTraceProfile.profile_warnings);
  const fallbackWarnings = asStringArray(fallbackProfile.profile_warnings);
  const notes = activeTraceNotes.length > 0 ? activeTraceNotes : fallbackNotes;
  const profileWarnings =
    activeTraceWarnings.length > 0 ? activeTraceWarnings : fallbackWarnings;
  const overrides = asRecord(fallbackProfile.overrides);

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
    profileWarnings,
    overrides,
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

function canonicalWarningMessage(message: string) {
  return message
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[0-9]+(?:\.[0-9]+)?/g, "#")
    .trim();
}

function isExpectedStateMessage(message: string) {
  const normalized = message.toLowerCase();

  return [
    "market closed",
    "outside scan window",
    "waiting for next window",
    "next active window",
    "no active scanner candidates expected",
    "scanner output will be evaluated",
    "pending outcome evaluation",
    "retained for review",
    "expired",
    "stale",
  ].some((phrase) => normalized.includes(phrase));
}

function normalizeWarningForDisplay(
  warningItem: MarketDiagnosticsConsoleWarning,
): MarketDiagnosticsConsoleWarning {
  if (!isExpectedStateMessage(warningItem.message)) {
    return warningItem;
  }

  return {
    ...warningItem,
    severity: "info",
    source: warningItem.source.includes("expected_state")
      ? warningItem.source
      : `${warningItem.source}+expected_state`,
  };
}

function dedupeWarnings(
  warnings: MarketDiagnosticsConsoleWarning[],
): MarketDiagnosticsConsoleWarning[] {
  const grouped = new Map<
    string,
    MarketDiagnosticsConsoleWarning & { source_set: Set<string> }
  >();

  for (const item of warnings) {
    const normalizedItem = normalizeWarningForDisplay(item);
    const key = canonicalWarningMessage(normalizedItem.message);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...normalizedItem,
        source_set: new Set(normalizedItem.source.split("+")),
      });
      continue;
    }

    existing.source_set.add(normalizedItem.source);
    existing.source = Array.from(existing.source_set).sort().join("+");
    existing.severity = highestSeverity([existing, normalizedItem]);
    existing.warning_id = `${existing.warning_id}+${normalizedItem.warning_id}`;
  }

  return Array.from(grouped.values()).map((item) => ({
    warning_id: item.warning_id,
    severity: item.severity,
    source: item.source,
    message: item.message,
  }));
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

function warningBuckets(warnings: MarketDiagnosticsConsoleWarning[]) {
  const actionNeeded = warnings.filter(
    (item) => item.severity === "critical" || item.severity === "warning",
  );
  const expectedState = warnings.filter((item) =>
    item.source.includes("expected_state"),
  );
  const informational = warnings.filter(
    (item) =>
      item.severity === "info" && !item.source.includes("expected_state"),
  );

  return {
    actionNeeded,
    informational,
    expectedState,
  };
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

function hasRetainedOfficialReviewEvidence(input: MarketDiagnosticsConsoleInput) {
  const reviewBatchFingerprint =
    input.outcome_evaluation?.latest_review_batch_fingerprint ??
    input.scan_readback?.latest_review_batch_fingerprint ??
    null;

  return (
    isClosedMarketWaitState(input) &&
    reviewBatchFingerprint !== null &&
    ((input.scan_readback?.current_batch_visible_grid_count ?? 0) > 0 ||
      (input.scan_readback?.current_batch_visible_recommendation_count ?? 0) > 0 ||
      (input.scan_readback?.latest_successful_scan?.visible_recommendation_count ??
        0) > 0 ||
      (input.outcome_evaluation?.visible_grid_count ?? 0) > 0 ||
      (input.outcome_evaluation?.grid_cards ?? 0) > 0 ||
      (input.outcome_evaluation?.outcome_eligible_snapshot_count ?? 0) > 0 ||
      (input.outcome_evaluation?.evaluated_outcome_count ?? 0) > 0 ||
      (input.outcome_evaluation?.latest_evaluated_batch_rows ?? 0) > 0 ||
      (input.outcome_learning?.total_evaluated_outcomes ?? 0) > 0)
  );
}

function displayEngineStatus(input: MarketDiagnosticsConsoleInput) {
  if (
    isClosedMarketWaitState(input) ||
    (input.scan_readback?.latest_successful_scan?.visible_recommendation_count ??
      0) > 0 ||
    (input.outcome_evaluation?.latest_evaluated_batch_rows ?? 0) > 0
  ) {
    return "learning / review";
  }

  return words(input.engine_control_center.overall_status);
}

function displayRunbookStatus(input: MarketDiagnosticsConsoleInput) {
  if (
    input.live_market_trial_runbook.status === "unknown" &&
    input.live_market_trial_readiness.blockers.length === 0
  ) {
    return "ready / waiting";
  }

  if (isClosedMarketWaitState(input)) {
    return "ready / waiting";
  }

  return words(input.live_market_trial_runbook.status);
}

function statusMark(value: boolean) {
  return value ? "yes" : "pending";
}

function diagnosticsHeadline(input: MarketDiagnosticsConsoleInput) {
  const closedMarketWaitState = isClosedMarketWaitState(input);
  const activeWindow = input.scan_orchestration.active_window;
  const latestSuccessfulVisible =
    input.scan_readback?.latest_successful_scan?.visible_recommendation_count ??
    0;
  const scanOk =
    latestSuccessfulVisible > 0 ||
    (input.active_scan_trace?.ranking.ranked_count ?? 0) > 0;
  const publishOk =
    latestSuccessfulVisible > 0 ||
    (input.scan_readback?.current_batch_visible_grid_count ?? 0) > 0;
  const outcomesOk =
    (input.outcome_evaluation?.evaluated_outcome_count ?? 0) > 0 ||
    (input.outcome_evaluation?.latest_evaluated_batch_rows ?? 0) > 0;
  const learningOk =
    (input.outcome_learning?.total_evaluated_outcomes ?? 0) > 0 ||
    Boolean(input.outcome_learning?.batch_fingerprint);
  const shadowStatus =
    (input.outcome_learning?.shadow_entry_trial.shadow_trial_sample_size ?? 0) > 0
      ? "collecting"
      : (input.outcome_evaluation?.shadow_snapshot_metadata_present_count ?? 0) > 0
        ? "pending outcomes"
        : "pending";

  if (closedMarketWaitState) {
    return {
      headline: "Market closed — latest learning retained for review.",
      scanOk,
      publishOk,
      outcomesOk,
      learningOk,
      shadowStatus,
    };
  }

  if (
    activeWindow === "outside_window" ||
    input.market_session.phase === "pre_market"
  ) {
    return {
      headline: "Pre-market — waiting for first scan window.",
      scanOk,
      publishOk,
      outcomesOk,
      learningOk,
      shadowStatus,
    };
  }

  return {
    headline: `Today's core loop: scan ${statusMark(scanOk)} / publish ${statusMark(
      publishOk,
    )} / outcomes ${statusMark(outcomesOk)} / learning ${statusMark(
      learningOk,
    )} / shadow ${shadowStatus}`,
    scanOk,
    publishOk,
    outcomesOk,
    learningOk,
    shadowStatus,
  };
}

type MondayLiveTrialChecklistItemStatus =
  | "ready"
  | "warning"
  | "action_needed"
  | "pending_next_market_window";

type MondayLiveTrialChecklistItem = {
  item_id: string;
  label: string;
  status: MondayLiveTrialChecklistItemStatus;
  message: string;
  next_action: string | null;
};

function mondayChecklistItem({
  item_id,
  label,
  status,
  message,
  next_action = null,
}: MondayLiveTrialChecklistItem): MondayLiveTrialChecklistItem {
  return { item_id, label, status, message, next_action };
}

function checklistStatusFromReadiness(
  status: string | null | undefined,
  expectedState = false,
): MondayLiveTrialChecklistItemStatus {
  if (status === "pass") return "ready";
  if (status === "blocked") return expectedState ? "pending_next_market_window" : "action_needed";
  if (status === "warning") return expectedState ? "pending_next_market_window" : "warning";
  return expectedState ? "pending_next_market_window" : "warning";
}

function mondayLiveTrialChecklist({
  input,
  providerPlanProfile,
  providerUpgrade,
  closedMarketWaitState,
  shadowTrialState,
}: {
  input: MarketDiagnosticsConsoleInput;
  providerPlanProfile: ReturnType<typeof providerPlanProfileMetrics>;
  providerUpgrade: ReturnType<typeof providerUpgradeChecklist>;
  closedMarketWaitState: boolean;
  shadowTrialState: string;
}) {
  const check = (checkId: string) =>
    input.live_market_trial_readiness.checks.find(
      (item) => item.check_id === checkId,
    );
  const providerEnv = input.active_scan_trace?.provider_env ?? null;
  const schemaCheck = input.active_scan_trace?.schema_check ?? null;
  const openAiOptional = providerPlanProfile.skipOpenAi !== false;
  const envMissing: string[] = [];

  if (providerEnv) {
    if (!providerEnv.twelve_data_key_present) envMissing.push("Twelve Data");
    if (!providerEnv.supabase_service_role_present) envMissing.push("Supabase service role");
    if (!openAiOptional && !providerEnv.openai_key_present) envMissing.push("OpenAI");
  }

  const environmentReady = providerEnv
    ? envMissing.length === 0
    : input.live_market_trial_readiness.provider_env_readiness
        .server_secret_status === "inferred_available" &&
      input.live_market_trial_readiness.provider_env_readiness
        .supabase_public_env_available;
  const schemaStatus: MondayLiveTrialChecklistItemStatus = schemaCheck
    ? schemaCheck.schema_ready
      ? "ready"
      : "action_needed"
    : input.live_market_trial_readiness.persistence_readiness
          .scan_runs_available ||
        input.live_market_trial_readiness.persistence_readiness.batches_available
      ? "warning"
      : "warning";
  const providerProfileStatus: MondayLiveTrialChecklistItemStatus =
    providerPlanProfile.mismatch
      ? "action_needed"
      : providerPlanProfile.mode === "unknown"
        ? "warning"
        : "ready";
  const providerUpgradeStatus: MondayLiveTrialChecklistItemStatus =
    providerUpgrade.status === "env_mismatch_needs_fix"
      ? "action_needed"
      : providerUpgrade.status === "custom_active_needs_review" ||
          providerUpgrade.status === "grow_ready_pending_env_change" ||
          providerUpgrade.status === "unknown_plan_free_safe"
        ? "warning"
        : "ready";
  const scannerUniverseCheck = check("scanner_universe");
  const scannerUniverseStatus =
    input.live_market_trial_readiness.scanner_readiness.selected_ticker_count > 0
      ? "ready"
      : closedMarketWaitState
        ? "pending_next_market_window"
        : checklistStatusFromReadiness(scannerUniverseCheck?.status);
  const officialPersistenceReady =
    input.live_market_trial_readiness.persistence_readiness.batches_available ||
    input.live_market_trial_readiness.persistence_readiness.snapshots_available ||
    schemaCheck?.schema_ready === true;
  const outcomeRouteReady =
    input.live_market_trial_readiness.outcome_readiness.route_available !== false;
  const learningOutcomeCount =
    input.outcome_learning?.total_evaluated_outcomes ??
    input.live_market_trial_readiness.outcome_readiness.evaluated_recommendations;
  const shadowReadyStatus: MondayLiveTrialChecklistItemStatus =
    shadowTrialState === "collecting data" ||
    shadowTrialState === "samples collected; latest variant rejected"
      ? "ready"
      : shadowTrialState === "no proposal"
        ? "warning"
        : "pending_next_market_window";
  const executionReality = input.data_mode_clarity.execution_reality;
  const humanBoundaryReady =
    executionReality === "human_confirmed_required" ||
    input.live_market_trial_readiness.can_do_now.paper_or_manual_tracking_ready;
  const brokerBoundaryReady =
    input.live_market_trial_readiness.not_enabled.broker_automation &&
    input.live_market_trial_readiness.not_enabled.order_submission &&
    input.live_market_trial_readiness.not_enabled.automatic_avanza_execution &&
    input.live_market_trial_readiness.not_enabled.automatic_trading_execution;
  const items: MondayLiveTrialChecklistItem[] = [
    mondayChecklistItem({
      item_id: "environment_keys",
      label: "Environment keys present",
      status: environmentReady ? "ready" : "action_needed",
      message: environmentReady
        ? providerEnv
          ? "Required server/client environment signals are present."
          : "Recent provider-backed data implies server env is available."
        : `Missing or unconfirmed env: ${envMissing.join(", ") || "server provider keys"}.`,
      next_action: environmentReady
        ? null
        : "Run diagnostics env_check and confirm Twelve Data/Supabase server env.",
    }),
    mondayChecklistItem({
      item_id: "supabase_schema",
      label: "Supabase schema ready",
      status: schemaStatus,
      message: schemaCheck
        ? schemaCheck.schema_ready
          ? "Recommendation learning schema is ready."
          : `Missing tables: ${schemaCheck.missing_tables.join(", ") || "unknown"}.`
        : "Schema check has not been observed in the latest active trace.",
      next_action:
        schemaStatus === "action_needed"
          ? "Apply the recommendation learning Supabase migrations."
          : schemaCheck
            ? null
            : "Run diagnostics env_check before Monday.",
    }),
    mondayChecklistItem({
      item_id: "provider_profile",
      label: "Provider profile resolved",
      status: providerProfileStatus,
      message: `${words(providerPlanProfile.mode)} profile via ${words(providerPlanProfile.source)}.`,
      next_action:
        providerProfileStatus === "action_needed"
          ? "Make TWELVE_DATA_PLAN_MODE and NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE consistent."
          : providerProfileStatus === "warning"
            ? "Set explicit Twelve Data plan env values."
            : null,
    }),
    mondayChecklistItem({
      item_id: "provider_upgrade_env",
      label: "Provider upgrade env values ready",
      status: providerUpgradeStatus,
      message: providerUpgrade.message,
      next_action:
        providerUpgradeStatus === "ready"
          ? null
          : `Use ${providerUpgrade.nextEnvValues.join(" and ")} after the Grow upgrade.`,
    }),
    mondayChecklistItem({
      item_id: "scheduled_scan_route",
      label: "Scheduled scan route reachable",
      status: checklistStatusFromReadiness(check("automation_scan_route")?.status),
      message:
        check("automation_scan_route")?.message ??
        "Automation scan route readiness has not been observed.",
      next_action:
        check("automation_scan_route")?.status === "blocked"
          ? "Verify /api/automation/run-scan deployment and scheduler config."
          : null,
    }),
    mondayChecklistItem({
      item_id: "scanner_universe",
      label: "Scanner universe available",
      status: scannerUniverseStatus,
      message:
        scannerUniverseStatus === "pending_next_market_window"
          ? "Scanner universe will be verified during the next active market window."
          : scannerUniverseCheck?.message ?? "Scanner universe readiness is available.",
      next_action:
        scannerUniverseStatus === "action_needed"
          ? "Review scanner universe configuration."
          : null,
    }),
    mondayChecklistItem({
      item_id: "official_batch_persistence",
      label: "Official batch persistence ready",
      status: officialPersistenceReady ? "ready" : "warning",
      message: officialPersistenceReady
        ? "Batch/snapshot persistence has been observed or schema is ready."
        : "Official batch persistence is pending the next successful scan.",
      next_action: officialPersistenceReady
        ? null
        : "Watch the next scheduled scan for batch and snapshot persistence.",
    }),
    mondayChecklistItem({
      item_id: "outcome_evaluation_route",
      label: "Outcome evaluation route ready",
      status: outcomeRouteReady ? "ready" : "action_needed",
      message: outcomeRouteReady
        ? "Outcome evaluation route is available."
        : "Outcome evaluation route is unavailable.",
      next_action: outcomeRouteReady
        ? null
        : "Verify /api/recommendations/evaluate-outcomes auth and route deployment.",
    }),
    mondayChecklistItem({
      item_id: "shadow_trial",
      label: "Shadow trial metadata coverage",
      status: shadowReadyStatus,
      message:
        shadowReadyStatus === "ready"
          ? shadowTrialState === "samples collected; latest variant rejected"
            ? "Shadow tracking collected samples; latest variant was rejected, waiting for next proposal."
            : "Shadow entry trial is collecting data."
          : shadowReadyStatus === "pending_next_market_window"
            ? "Shadow entry trial will collect data from future batches only."
            : "No active entry tuning proposal is ready for shadow tracking.",
      next_action:
        shadowReadyStatus === "ready"
          ? null
          : "Wait for the next official batch with shadow metadata.",
    }),
    mondayChecklistItem({
      item_id: "learning_insights",
      label: "Learning insights available",
      status: learningOutcomeCount > 0 ? "ready" : "warning",
      message:
        learningOutcomeCount > 0
          ? `Learning insights have ${learningOutcomeCount} evaluated outcomes.`
          : "Learning insights will update after outcome evaluation.",
      next_action:
        learningOutcomeCount > 0
          ? null
          : "Evaluate outcomes after the next official batch ages enough.",
    }),
    mondayChecklistItem({
      item_id: "human_confirmed_boundary",
      label: "Human-confirmed execution boundary active",
      status: humanBoundaryReady ? "ready" : "warning",
      message: humanBoundaryReady
        ? "Recommendations remain observe-only / human-confirmed."
        : "Execution boundary should be reviewed before Monday.",
      next_action: humanBoundaryReady
        ? null
        : "Confirm data mode shows human-confirmed execution.",
    }),
    mondayChecklistItem({
      item_id: "broker_automation_disabled",
      label: "Broker automation disabled / not live",
      status: brokerBoundaryReady ? "ready" : "action_needed",
      message: brokerBoundaryReady
        ? "No broker automation is enabled. Execution remains human-confirmed."
        : "A broker/order automation boundary is not reporting disabled.",
      next_action: brokerBoundaryReady
        ? null
        : "Disable broker/order automation before live trial.",
    }),
  ];
  const blockerCount = items.filter(
    (item) => item.status === "action_needed",
  ).length;
  const warningCount = items.filter(
    (item) =>
      item.status === "warning" ||
      item.status === "pending_next_market_window",
  ).length;
  const readyCount = items.filter((item) => item.status === "ready").length;
  const status =
    blockerCount > 0
      ? "monday_live_trial_blocked"
      : warningCount > 0
        ? "monday_live_trial_ready_with_warnings"
        : "monday_live_trial_ready";
  const nextAction =
    items.find((item) => item.status === "action_needed")?.next_action ??
    items.find((item) => item.status === "warning")?.next_action ??
    items.find((item) => item.status === "pending_next_market_window")
      ?.next_action ??
    "Ready for Monday live-trial review.";
  const message =
    status === "monday_live_trial_blocked"
      ? "Monday live-trial is blocked until action-needed items are resolved."
      : status === "monday_live_trial_ready_with_warnings"
        ? "Ready for Monday live-trial with warnings: review pending provider/window items."
        : "Ready for Monday live-trial. No broker automation is enabled.";

  return {
    status,
    message,
    nextAction,
    blockerCount,
    warningCount,
    readyCount,
    totalCount: items.length,
    items,
  };
}

function isCoreReadinessSource(source: string) {
  return source === "environment" || source === "provider" || source === "scheduler";
}

function determineOverallStatus(
  input: MarketDiagnosticsConsoleInput,
  blockers: MarketDiagnosticsConsoleWarning[],
) {
  const closedMarketWaitState = isClosedMarketWaitState(input);
  const hasSuccessfulLiveReadback =
    (input.scan_readback?.latest_successful_scan?.visible_recommendation_count ??
      0) > 0;

  if (
    blockers.length > 0 ||
    input.provider_budget_guard.status === "over_budget" ||
    input.provider_budget_guard.status === "rate_limited" ||
    input.provider_budget_guard.status === "provider_unavailable"
  ) {
    return "blocked" as const;
  }

  if (closedMarketWaitState && hasSuccessfulLiveReadback) {
    return "ready_with_warnings" as const;
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

  if (overallStatus === "ready_with_warnings" && isClosedMarketWaitState(input)) {
    return "Market closed; review the latest official batch, outcome learning, and paper-tracking diagnostics.";
  }

  return input.live_market_trial_runbook.next_action.label;
}

function buildWarnings(input: MarketDiagnosticsConsoleInput) {
  const closedMarketWaitState = isClosedMarketWaitState(input);
  const retainedReviewEvidence = hasRetainedOfficialReviewEvidence(input);
  const hasSuccessfulLiveReadback =
    (input.scan_readback?.latest_successful_scan?.visible_recommendation_count ??
      0) > 0;
  const isMisleadingRetainedZeroScopeWarning = (message: string) => {
    if (!retainedReviewEvidence) return false;
    const normalized = message.toLowerCase();

    return (
      normalized.includes("0 scan runs available for diagnostics") ||
      (normalized.includes("0 recommendation snapshots") &&
        normalized.includes("0 evaluated"))
    );
  };
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
  ])
    .filter((item) => item.severity === "critical")
    .slice(0, 8);

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
    ...input.live_market_trial_readiness.warnings
      .filter((item) => !isMisleadingRetainedZeroScopeWarning(item.message))
      .map((item) =>
        warning(`readiness:${item.warning_id}`, "warning", item.source, item.message),
      ),
    ...input.live_market_trial_runbook.warnings
      .filter((item) => !isMisleadingRetainedZeroScopeWarning(item.message))
      .map((item) =>
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
    ...(input.outcome_evaluation?.plan_price_freshness_summary?.warning
      ? [
          warning(
            "plan_price_freshness:stale_official_plans",
            "warning",
            "plan_price_freshness",
            input.outcome_evaluation.plan_price_freshness_summary.warning,
          ),
        ]
      : []),
  ]).slice(0, 12);

  return { blockers, warnings };
}

function lineValue(label: string, value: string | number | boolean | null) {
  return `${label}: ${value === null ? "unknown" : String(value)}`;
}

function topReasonText(reasons: Record<string, number> | null | undefined) {
  const entries = Object.entries(reasons ?? {})
    .filter(([, value]) => value > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  return entries.length > 0
    ? entries.map(([key, value]) => `${words(key)} ${value}`).join(" / ")
    : "none";
}

function referenceRefreshExamplesText(
  examples: Record<string, string[]> | null | undefined,
) {
  const entries = Object.entries(examples ?? {})
    .filter(([, values]) => values.length > 0)
    .slice(0, 4);

  return entries.length > 0
    ? entries
        .map(([reason, values]) => `${words(reason)}:${values.slice(0, 4).join(",")}`)
        .join(" / ")
    : "none";
}

function closedMarketReviewBatchFingerprint(input: MarketDiagnosticsConsoleInput) {
  if (
    input.outcome_evaluation?.market_closed_readback_mode === true ||
    input.scan_readback?.market_closed_readback_mode === true ||
    isClosedMarketWaitState(input)
  ) {
    return (
      input.outcome_evaluation?.latest_review_batch_fingerprint ??
      input.outcome_evaluation?.current_batch_fingerprint ??
      input.outcome_evaluation?.current_official_batch_fingerprint ??
      input.scan_readback?.latest_review_batch_fingerprint ??
      input.scan_readback?.current_batch_fingerprint ??
      input.scan_readback?.latest_official_batch_fingerprint ??
      null
    );
  }

  return null;
}

function auditMatchesBatch(
  audit: BatchCandidateAuditSummary | null | undefined,
  batchFingerprint: string | null,
): audit is BatchCandidateAuditSummary {
  return (
    audit !== null &&
    audit !== undefined &&
    (batchFingerprint === null || audit.batch_fingerprint === batchFingerprint)
  );
}

function entryMatchesBatch(
  entry: ScheduledScanTimelineEntry,
  batchFingerprint: string | null,
) {
  return batchFingerprint !== null && entry.batch_fingerprint === batchFingerprint;
}

function entryMatchesReviewScope(
  entry: ScheduledScanTimelineEntry,
  input: MarketDiagnosticsConsoleInput,
  batchFingerprint: string | null,
) {
  const scanRunFingerprint =
    input.scan_readback?.latest_official_scan_run_fingerprint ??
    input.scan_readback?.latest_official_scan_run_id ??
    null;

  return (
    entryMatchesBatch(entry, batchFingerprint) ||
    (scanRunFingerprint !== null &&
      entry.scan_run_fingerprint === scanRunFingerprint)
  );
}

function getRetainedReviewTimelineEntry(
  input: MarketDiagnosticsConsoleInput,
  batchFingerprint: string | null,
) {
  return (
    input.scan_readback?.scheduled_scan_timeline_today?.find((attempt) =>
      entryMatchesReviewScope(attempt, input, batchFingerprint),
    ) ?? null
  );
}

function selectedToBuiltDropOffFromCounts(input: {
  selectedCount: number;
  builtCount: number;
}): BatchCandidateAuditSummary["selected_to_built_drop_off"] {
  const rejectedCount = Math.max(0, input.selectedCount - input.builtCount);
  if (input.selectedCount <= 0 || rejectedCount <= 0) {
    return null;
  }

  return {
    selected_count: input.selectedCount,
    built_count: input.builtCount,
    rejected_count: rejectedCount,
    rejection_counts: {
      below_publish_threshold: rejectedCount,
    },
    category_counts: {
      quality: rejectedCount,
    },
    examples_by_reason: {
      below_publish_threshold: [],
    },
    output_below_target_reason_category: "healthy_caution",
    output_below_target_explanation:
      `${rejectedCount} selected candidates were below the publish threshold.`,
  };
}

function removeHealthyDedupeDropOff(
  audit: BatchCandidateAuditSummary,
  healthyDedupe: boolean,
) {
  if (!healthyDedupe) return audit;

  return {
    ...audit,
    drop_off_reasons: {
      ...audit.drop_off_reasons,
      duplicate_snapshot_fingerprint: 0,
      archived: 0,
      persistence_failed: 0,
    },
    missing_snapshot_reasons: {
      ...audit.missing_snapshot_reasons,
      persistence_failed: 0,
    },
  };
}

function repairRetainedReviewAudit(
  input: MarketDiagnosticsConsoleInput,
  existing: BatchCandidateAuditSummary,
  reviewBatchFingerprint: string | null,
) {
  if (
    reviewBatchFingerprint === null ||
    !hasRetainedOfficialReviewEvidence(input) ||
    (existing.batch_fingerprint !== null &&
      existing.batch_fingerprint !== reviewBatchFingerprint)
  ) {
    return existing;
  }

  const timelineEntry = getRetainedReviewTimelineEntry(
    input,
    reviewBatchFingerprint,
  );
  const visibleCards = firstPositiveCount(
    input.outcome_evaluation?.visible_grid_count,
    input.outcome_evaluation?.grid_cards,
    input.scan_readback?.current_batch_visible_recommendation_count,
    input.scan_readback?.current_batch_visible_grid_count,
    input.scan_readback?.current_batch_grid_card_count,
    input.scan_readback?.latest_successful_scan?.visible_recommendation_count,
    existing.visible_grid_cards_count,
  );
  const observedUniqueSnapshots = firstPositiveCount(
    input.outcome_evaluation?.unique_snapshot_fingerprints_count,
    input.outcome_evaluation?.unique_learning_ideas,
    input.scan_readback?.current_batch_unique_snapshot_fingerprints,
    input.scan_readback?.current_batch_unique_learning_ideas,
    input.scan_readback?.current_batch_learning_snapshot_count,
    existing.unique_snapshot_fingerprints_count,
    visibleCards,
  );
  const rawSnapshotRows = firstPositiveCount(
    existing.persisted_snapshot_rows_count,
    input.outcome_evaluation?.raw_snapshot_rows,
    input.outcome_evaluation?.total_snapshots_loaded_for_batch,
    input.scan_readback?.current_batch_raw_snapshot_rows,
    input.scan_readback?.current_batch_snapshot_count,
    observedUniqueSnapshots,
  );
  const retainedHiddenRows = count(existing.hidden_archived_count);
  const retainedSurplusRows = Math.max(
    0,
    rawSnapshotRows - visibleCards,
    observedUniqueSnapshots - visibleCards,
    retainedHiddenRows,
  );
  const duplicateConflictCount =
    input.outcome_evaluation?.duplicate_snapshot_conflict_count ?? 0;
  const observedOutcomeEligible = firstPositiveCount(
    input.outcome_evaluation?.outcome_eligible_snapshot_count,
    input.outcome_evaluation?.eligible_visible_snapshot_count,
    existing.outcome_eligible_snapshot_count,
    (input.outcome_evaluation?.evaluated_outcome_count ?? 0) > 0 ||
      (input.outcome_evaluation?.latest_evaluated_batch_rows ?? 0) > 0
      ? observedUniqueSnapshots
      : null,
  );
  const healthyDedupe =
    retainedSurplusRows > 0 &&
    visibleCards > 0 &&
    input.scan_readback?.primary_grid_strict_batch_filter_applied === true &&
    duplicateConflictCount === 0 &&
    (observedOutcomeEligible > 0 ||
      (input.outcome_evaluation?.evaluated_outcome_count ?? 0) > 0 ||
      (input.outcome_evaluation?.latest_evaluated_batch_rows ?? 0) > 0);
  const effectiveUniqueSnapshots = healthyDedupe
    ? visibleCards
    : observedUniqueSnapshots;
  const outcomeEligible = healthyDedupe ? visibleCards : observedOutcomeEligible;
  const builtCount = firstPositiveCount(
    timelineEntry?.effective_built_count,
    timelineEntry?.built_count,
    existing.effective_built_recommendations_count,
    visibleCards,
  );
  const rawBuiltCount = count(
    timelineEntry?.raw_scan_run_built_count ??
      existing.raw_scan_run_built_count ??
      timelineEntry?.built_count,
  );
  const rawPublishedCount = count(
    timelineEntry?.raw_scan_run_published_count ??
      existing.raw_scan_run_published_count ??
      timelineEntry?.published_count,
  );
  const selectedCount = firstPositiveCount(
    timelineEntry?.selected_count,
    existing.selected_candidates_count,
  );
  const sourceSelectedToBuiltDropOff =
    existing.selected_to_built_drop_off ??
    timelineEntry?.selected_to_built_drop_off ??
    null;
  const selectedToBuiltDropOff =
    healthyDedupe
      ? selectedToBuiltDropOffFromCounts({
          selectedCount,
          builtCount: visibleCards,
        }) ?? sourceSelectedToBuiltDropOff
      : sourceSelectedToBuiltDropOff ??
        selectedToBuiltDropOffFromCounts({
          selectedCount,
          builtCount,
        });
  const persistedRecommendationRows = firstPositiveCount(
    input.outcome_evaluation?.total_recommendation_rows_loaded_for_batch &&
      input.outcome_evaluation.total_recommendation_rows_loaded_for_batch <=
        visibleCards
      ? input.outcome_evaluation.total_recommendation_rows_loaded_for_batch
      : null,
    input.scan_readback?.recommendation_rows_found_count &&
      input.scan_readback.recommendation_rows_found_count <= visibleCards
      ? input.scan_readback.recommendation_rows_found_count
      : null,
    existing.persisted_recommendation_rows_count,
    visibleCards,
  );
  const repaired = buildBatchCandidateAuditSummary({
    generatedAt: existing.generated_at,
    scanRunFingerprint:
      timelineEntry?.scan_run_fingerprint ??
      existing.scan_run_fingerprint ??
      input.scan_readback?.latest_official_scan_run_fingerprint ??
      input.scan_readback?.latest_official_scan_run_id ??
      null,
    batchFingerprint: reviewBatchFingerprint,
    rawCandidatesCount: firstPositiveCount(
      timelineEntry?.raw_count,
      existing.raw_candidates_count,
    ),
    rankedCandidatesCount: firstPositiveCount(
      timelineEntry?.ranked_count,
      existing.ranked_candidates_count,
    ),
    selectedCandidatesCount: selectedCount,
    builtRecommendationsCount: rawBuiltCount,
    publishedRecommendationsCount: rawPublishedCount,
    persistedRecommendationRowsCount: persistedRecommendationRows,
    persistedSnapshotRowsCount: rawSnapshotRows,
    uniqueSnapshotFingerprintsCount: effectiveUniqueSnapshots,
    visibleGridCardsCount: visibleCards,
    hiddenArchivedCount: healthyDedupe ? 0 : existing.hidden_archived_count,
    outcomeEligibleSnapshotCount: outcomeEligible,
    outcomeIneligibleSnapshotCount:
      input.outcome_evaluation?.outcome_ineligible_snapshot_count ??
      input.outcome_evaluation?.ineligible_snapshot_count ??
      existing.outcome_ineligible_snapshot_count,
    expectedSnapshotCountFromScan: Math.max(
      persistedRecommendationRows,
      visibleCards,
      outcomeEligible,
    ),
    actualSnapshotCountForBatch: rawSnapshotRows,
    strictBatchFilterExcludedCount: healthyDedupe
      ? 0
      : existing.strict_batch_filter_excluded_count,
    selectedToBuiltDropOff: selectedToBuiltDropOff,
  });

  return removeHealthyDedupeDropOff(repaired, healthyDedupe);
}

function getBatchCandidateAudit(input: MarketDiagnosticsConsoleInput) {
  const existing = input.outcome_evaluation?.batch_candidate_audit;
  const reviewBatchFingerprint = closedMarketReviewBatchFingerprint(input);
  const activeTraceBatchFingerprint =
    input.active_scan_trace?.final.batch_fingerprint ?? null;
  const activeTraceScanRunFingerprint =
    input.active_scan_trace?.final.scan_run_fingerprint ?? null;
  const expectedBatchFingerprint =
    input.outcome_evaluation?.current_batch_fingerprint ??
    input.scan_readback?.current_batch_fingerprint ??
    input.scan_readback?.latest_official_batch_fingerprint ??
    null;
  const expectedScanRunFingerprint =
    input.scan_readback?.latest_official_scan_run_fingerprint ??
    input.scan_readback?.latest_official_scan_run_id ??
    null;
  const activeTraceLinked =
    input.active_scan_trace !== null &&
    input.active_scan_trace !== undefined &&
    (reviewBatchFingerprint === null ||
      activeTraceBatchFingerprint === reviewBatchFingerprint) &&
    ((activeTraceBatchFingerprint !== null &&
      activeTraceBatchFingerprint === expectedBatchFingerprint) ||
      (activeTraceScanRunFingerprint !== null &&
        activeTraceScanRunFingerprint === expectedScanRunFingerprint));
  const activeTraceHasCandidateFunnel =
    count(input.active_scan_trace?.raw_candidates.raw_candidate_count) > 0 ||
    count(input.active_scan_trace?.ranking.ranked_count) > 0 ||
    count(input.active_scan_trace?.ranking.selected_count) > 0;
  const activeTraceInReviewScope =
    reviewBatchFingerprint === null ||
    activeTraceBatchFingerprint === reviewBatchFingerprint;

  if (activeTraceLinked && activeTraceHasCandidateFunnel) {
    const activeTraceAudit = buildBatchCandidateAuditSummary({
      scanRunFingerprint: activeTraceScanRunFingerprint,
      batchFingerprint:
        activeTraceBatchFingerprint ??
        input.outcome_evaluation?.current_batch_fingerprint ??
        input.scan_readback?.current_batch_fingerprint ??
        null,
      rawCandidatesCount:
        input.active_scan_trace?.raw_candidates.raw_candidate_count ?? null,
      rankedCandidatesCount:
        input.active_scan_trace?.ranking.ranked_count ?? null,
      selectedCandidatesCount:
        input.active_scan_trace?.ranking.selected_count ?? null,
      builtRecommendationsCount:
        input.active_scan_trace?.final.recommendations_built_count ?? null,
      publishedRecommendationsCount:
        input.active_scan_trace?.final.recommendations_published_count ?? null,
      persistedRecommendationRowsCount:
        input.outcome_evaluation?.total_recommendation_rows_loaded_for_batch ??
        input.scan_readback?.recommendation_rows_found_count ??
        input.scan_readback?.current_batch_recommendation_count ??
        null,
      persistedSnapshotRowsCount:
        input.outcome_evaluation?.raw_snapshot_rows ??
        input.scan_readback?.current_batch_raw_snapshot_rows ??
        input.scan_readback?.current_batch_snapshot_count ??
        null,
      uniqueSnapshotFingerprintsCount:
        input.outcome_evaluation?.unique_snapshot_fingerprints_count ??
        input.scan_readback?.current_batch_unique_snapshot_fingerprints ??
        null,
      visibleGridCardsCount:
        input.outcome_evaluation?.visible_grid_count ??
        input.scan_readback?.current_batch_visible_grid_count ??
        null,
      hiddenArchivedCount:
        input.scan_readback?.hidden_archived_members_today ?? null,
      outcomeEligibleSnapshotCount:
        input.outcome_evaluation?.outcome_eligible_snapshot_count ??
        input.outcome_evaluation?.eligible_visible_snapshot_count ??
        null,
      outcomeIneligibleSnapshotCount:
        input.outcome_evaluation?.outcome_ineligible_snapshot_count ??
        input.outcome_evaluation?.ineligible_snapshot_count ??
        null,
      expectedSnapshotCountFromScan:
        input.outcome_evaluation?.expected_snapshot_count_from_scan ??
        input.scan_readback?.batch_expected_count ??
        null,
      actualSnapshotCountForBatch:
        input.outcome_evaluation?.actual_snapshot_count_for_batch ??
        input.scan_readback?.current_batch_snapshot_count ??
        null,
      strictBatchFilterExcludedCount:
        input.outcome_evaluation?.strict_batch_filter_excluded_count ??
        input.outcome_evaluation?.ineligible_reasons?.missing_batch_membership ??
        null,
      incompletePricePlanCount:
        input.active_scan_trace?.raw_candidates.invalid_price_plan_count ?? null,
      missingSnapshotReasons:
        input.outcome_evaluation?.missing_snapshot_reasons ??
        input.outcome_evaluation?.ineligible_reasons ??
        null,
      dropOffReasons: input.outcome_evaluation?.ineligible_reasons ?? null,
      selectedCandidateBuildDiagnostics:
        input.active_scan_trace?.final.selected_candidate_build_diagnostics ?? null,
      selectedToBuiltDropOff:
        input.active_scan_trace?.final.selected_to_built_drop_off ?? null,
    });

    return repairRetainedReviewAudit(
      input,
      activeTraceAudit,
      reviewBatchFingerprint,
    );
  }

  if (auditMatchesBatch(existing, reviewBatchFingerprint)) {
    return repairRetainedReviewAudit(input, existing, reviewBatchFingerprint);
  }

  const fallbackAudit = buildBatchCandidateAuditSummary({
    scanRunFingerprint:
      input.scan_readback?.latest_official_scan_run_fingerprint ??
      input.active_scan_trace?.final.scan_run_fingerprint ??
      null,
    batchFingerprint:
      input.outcome_evaluation?.current_batch_fingerprint ??
      input.scan_readback?.current_batch_fingerprint ??
      input.active_scan_trace?.final.batch_fingerprint ??
      null,
    rawCandidatesCount:
      (activeTraceInReviewScope
        ? input.active_scan_trace?.raw_candidates.raw_candidate_count
        : null) ??
      input.scanner_ranking?.candidates_ranked ??
      input.scan_readback?.provider_budget_used_for_scan ??
      null,
    rankedCandidatesCount:
      (activeTraceInReviewScope
        ? input.active_scan_trace?.ranking.ranked_count
        : null) ??
      input.scanner_ranking?.candidates_ranked ??
      null,
    selectedCandidatesCount:
      (activeTraceInReviewScope
        ? input.active_scan_trace?.ranking.selected_count
        : null) ??
      input.scanner_ranking?.selected_count ??
      null,
    builtRecommendationsCount:
      (activeTraceInReviewScope
        ? input.active_scan_trace?.final.recommendations_built_count
        : null) ??
      input.scan_readback?.active_trace_published_count ??
      null,
    publishedRecommendationsCount:
      (activeTraceInReviewScope
        ? input.active_scan_trace?.final.recommendations_published_count
        : null) ??
      input.scan_readback?.active_trace_published_count ??
      input.scan_readback?.current_batch_recommendation_count ??
      null,
    persistedRecommendationRowsCount:
      input.outcome_evaluation?.total_recommendation_rows_loaded_for_batch ??
      input.scan_readback?.recommendation_rows_found_count ??
      input.scan_readback?.current_batch_recommendation_count ??
      null,
    persistedSnapshotRowsCount:
      input.outcome_evaluation?.raw_snapshot_rows ??
      input.scan_readback?.current_batch_raw_snapshot_rows ??
      input.scan_readback?.current_batch_snapshot_count ??
      null,
    uniqueSnapshotFingerprintsCount:
      input.outcome_evaluation?.unique_snapshot_fingerprints_count ??
      input.scan_readback?.current_batch_unique_snapshot_fingerprints ??
      null,
    visibleGridCardsCount:
      input.outcome_evaluation?.visible_grid_count ??
      input.scan_readback?.current_batch_visible_grid_count ??
      null,
    hiddenArchivedCount:
      input.scan_readback?.hidden_archived_members_today ?? null,
    outcomeEligibleSnapshotCount:
      input.outcome_evaluation?.outcome_eligible_snapshot_count ??
      input.outcome_evaluation?.eligible_visible_snapshot_count ??
      null,
    outcomeIneligibleSnapshotCount:
      input.outcome_evaluation?.outcome_ineligible_snapshot_count ??
      input.outcome_evaluation?.ineligible_snapshot_count ??
      null,
    expectedSnapshotCountFromScan:
      input.outcome_evaluation?.expected_snapshot_count_from_scan ??
      input.scan_readback?.batch_expected_count ??
      null,
    actualSnapshotCountForBatch:
      input.outcome_evaluation?.actual_snapshot_count_for_batch ??
      input.scan_readback?.current_batch_snapshot_count ??
      null,
    strictBatchFilterExcludedCount:
      input.outcome_evaluation?.strict_batch_filter_excluded_count ??
      input.outcome_evaluation?.ineligible_reasons?.missing_batch_membership ??
      null,
    incompletePricePlanCount:
      (activeTraceInReviewScope
        ? input.active_scan_trace?.raw_candidates.invalid_price_plan_count
        : null) ?? null,
    missingSnapshotReasons:
      input.outcome_evaluation?.missing_snapshot_reasons ??
      input.outcome_evaluation?.ineligible_reasons ??
      null,
    dropOffReasons: input.outcome_evaluation?.ineligible_reasons ?? null,
    selectedCandidateBuildDiagnostics:
      (activeTraceInReviewScope
        ? input.active_scan_trace?.final.selected_candidate_build_diagnostics
        : null) ?? null,
    selectedToBuiltDropOff:
      (activeTraceInReviewScope
        ? input.active_scan_trace?.final.selected_to_built_drop_off
        : null) ?? null,
  });

  return repairRetainedReviewAudit(input, fallbackAudit, reviewBatchFingerprint);
}

function pctValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toFixed(3)}%`
    : "unknown";
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
  const headline = diagnosticsHeadline(input);
  const batchCandidateAudit = getBatchCandidateAudit(input);
  const scheduledScanTimelineToday =
    input.scan_readback?.scheduled_scan_timeline_today ?? [];
  const reviewBatchFingerprint = closedMarketReviewBatchFingerprint(input);
  const latestReviewBatchAttempt =
    scheduledScanTimelineToday.find((attempt) =>
      entryMatchesReviewScope(attempt, input, reviewBatchFingerprint),
    ) ?? null;
  const latestScheduledBuildRejectionAttempt =
    latestReviewBatchAttempt ??
    scheduledScanTimelineToday.find(
      (attempt) =>
        !batchCandidateAudit.selected_to_built_drop_off &&
        attempt.selected_to_built_drop_off &&
        (attempt.selected_count ?? 0) > 0 &&
        (attempt.built_count ?? 0) === 0 &&
        (attempt.published_count ?? 0) === 0,
    ) ??
    (batchCandidateAudit.selected_to_built_drop_off
      ? null
      : scheduledScanTimelineToday.find(
          (attempt) => attempt.selected_to_built_drop_off,
        )) ??
    null;
  const latestReviewBatchDropOff =
    latestReviewBatchAttempt?.selected_to_built_drop_off ?? null;
  const selectedToBuiltDropOff =
    latestReviewBatchDropOff ??
    batchCandidateAudit.selected_to_built_drop_off ??
    latestScheduledBuildRejectionAttempt?.selected_to_built_drop_off ??
    null;
  const selectedToBuiltSource = latestReviewBatchDropOff
    ? "latest_official_batch_timeline"
    : batchCandidateAudit.selected_to_built_drop_off
      ? reviewBatchFingerprint
      ? "latest_official_batch_audit"
      : "batch_candidate_audit"
      : latestScheduledBuildRejectionAttempt
        ? latestReviewBatchAttempt
          ? "latest_official_batch_timeline"
          : "latest_attempt_timeline"
        : "not_observed";
  const selectedToBuiltPublishedCount =
    (latestReviewBatchDropOff
      ? latestReviewBatchAttempt?.published_count
      : batchCandidateAudit.selected_to_built_drop_off
      ? batchCandidateAudit.effective_published_recommendations_count
      : latestScheduledBuildRejectionAttempt?.published_count) ??
    batchCandidateAudit.published_recommendations_count;
  const selectedToBuiltDisplayBuilt =
    batchCandidateAudit.reconciled_from_persisted_rows
      ? batchCandidateAudit.effective_built_recommendations_count
      : selectedToBuiltDropOff?.built_count ??
        batchCandidateAudit.effective_built_recommendations_count;
  const selectedToBuiltDisplayPublished =
    batchCandidateAudit.reconciled_from_persisted_rows
      ? batchCandidateAudit.effective_published_recommendations_count
      : selectedToBuiltPublishedCount;
  const selectedToBuiltDisplayRejected =
    batchCandidateAudit.reconciled_from_persisted_rows
      ? Math.max(
          0,
          batchCandidateAudit.selected_candidates_count -
            batchCandidateAudit.effective_built_recommendations_count,
        )
      : selectedToBuiltDropOff?.rejected_count ??
        Math.max(
          0,
          batchCandidateAudit.selected_candidates_count -
            batchCandidateAudit.effective_built_recommendations_count,
        );
  const warningGroups = warningBuckets(warnings.warnings);
  const closedMarketWaitState = isClosedMarketWaitState(input);
  const planFreshnessSummary =
    input.outcome_evaluation?.plan_price_freshness_summary ?? null;
  const planReferenceMetadataTrace =
    input.outcome_evaluation?.plan_reference_metadata_trace ?? null;
  const entryTypeTriggerSummary =
    input.outcome_evaluation?.entry_type_trigger_summary ?? null;
  const strongCandidateGate = input.day_window_target.strong_candidate_gate;
  const dynamicMoversDiscovery = input.dynamic_movers_discovery ?? null;
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
  const officialScheduleLabel =
    input.scan_orchestration.official_scan_windows
      ?.map((item) => `${item.label} ${item.start_time}-${item.end_time}`)
      .join(" / ") || "not configured";
  const morningWindowStatus =
    input.scan_orchestration.official_window_statuses?.find(
      (item) => item.window === "morning",
    ) ?? null;
  const successfulScanLabel = latestSuccessfulScan
    ? `${compact(latestSuccessfulScan.result, "unknown")} @ ${compact(
        latestSuccessfulScan.created_at_ny ?? latestSuccessfulScan.created_at,
        "unknown",
      )}`
    : "not observed";
  const attemptedScanLabel = latestAttemptedScan
    ? `${compact(latestAttemptedScan.result, "unknown")} @ ${compact(
        latestAttemptedScan.created_at_ny ?? latestAttemptedScan.created_at,
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
  const growMaxLearningMode =
    input.scan_readback?.grow_max_learning_mode === true ||
    input.active_scan_trace?.grow_max_learning_mode === true;
  const learningAccelerationConfig =
    input.learning_acceleration_config ??
    clientUnavailableLearningAccelerationConfig();
  const learningAccelerationEnabled =
    input.learning_acceleration_config?.learning_acceleration_enabled ??
    (input.scan_readback?.learning_acceleration_enabled === true ||
      input.active_scan_trace?.learning_acceleration_enabled === true ||
      input.outcome_evaluation?.learning_acceleration_enabled === true);
  const learningAccelerationMode =
    input.learning_acceleration_config?.learning_acceleration_mode ??
    input.scan_readback?.learning_acceleration_mode ??
    input.active_scan_trace?.learning_acceleration_mode ??
    input.outcome_evaluation?.learning_acceleration_mode ??
    learningAccelerationConfig.learning_acceleration_mode;
  const learningAccelerationSource =
    input.learning_acceleration_config?.learning_acceleration_enabled_source ??
    input.scan_readback?.learning_acceleration_enabled_source ??
    input.active_scan_trace?.learning_acceleration_enabled_source ??
    input.outcome_evaluation?.learning_acceleration_enabled_source ??
    learningAccelerationConfig.learning_acceleration_enabled_source;
  const learningAccelerationEnvPresent =
    input.learning_acceleration_config?.learning_acceleration_env_raw_present ??
    input.scan_readback?.learning_acceleration_env_raw_present ??
    input.active_scan_trace?.learning_acceleration_env_raw_present ??
    input.outcome_evaluation?.learning_acceleration_env_raw_present ??
    learningAccelerationConfig.learning_acceleration_env_raw_present;
  const learningAccelerationEnvCategory =
    input.learning_acceleration_config
      ?.learning_acceleration_env_raw_value_category ??
    input.scan_readback?.learning_acceleration_env_raw_value_category ??
    input.active_scan_trace?.learning_acceleration_env_raw_value_category ??
    input.outcome_evaluation?.learning_acceleration_env_raw_value_category ??
    learningAccelerationConfig.learning_acceleration_env_raw_value_category;
  const learningAccelerationParsedEnabled =
    input.learning_acceleration_config
      ?.learning_acceleration_env_raw_value_normalized ??
    input.scan_readback?.learning_acceleration_env_raw_value_normalized ??
    input.active_scan_trace?.learning_acceleration_env_raw_value_normalized ??
    input.outcome_evaluation?.learning_acceleration_env_raw_value_normalized ??
    learningAccelerationConfig.learning_acceleration_env_raw_value_normalized;
  const learningAccelerationRuntimeEnvironment =
    input.learning_acceleration_config?.learning_acceleration_runtime_environment ??
    input.scan_readback?.learning_acceleration_runtime_environment ??
    input.active_scan_trace?.learning_acceleration_runtime_environment ??
    input.outcome_evaluation?.learning_acceleration_runtime_environment ??
    learningAccelerationConfig.learning_acceleration_runtime_environment;
  const learningAccelerationServerConfigUnavailable =
    learningAccelerationSource === "client_unavailable";
  const learningAccelerationSamplesCollectedToday =
    input.scan_readback?.learning_acceleration_samples_collected_today ??
    input.active_scan_trace?.learning_acceleration_samples_collected_count ??
    0;
  const learningAccelerationSelectedBelowThreshold =
    input.scan_readback?.learning_acceleration_selected_below_threshold_count ??
    input.active_scan_trace
      ?.learning_acceleration_selected_below_threshold_count ??
    0;
  const learningAccelerationBelowThresholdReadback =
    input.scan_readback
      ?.learning_acceleration_selected_below_threshold_readback_count ??
    input.active_scan_trace
      ?.learning_acceleration_selected_below_threshold_readback_count ??
    learningAccelerationSelectedBelowThreshold;
  const learningAccelerationBelowThresholdPassed =
    input.scan_readback
      ?.learning_acceleration_selected_below_threshold_passed_count ??
    input.active_scan_trace
      ?.learning_acceleration_selected_below_threshold_passed_count ??
    learningAccelerationSelectedBelowThreshold;
  const learningAccelerationBelowThresholdMatched =
    input.scan_readback
      ?.learning_acceleration_selected_below_threshold_matched_by_ticker_count ??
    input.active_scan_trace
      ?.learning_acceleration_selected_below_threshold_matched_by_ticker_count ??
    0;
  const learningAccelerationBelowThresholdUnmatched =
    input.scan_readback
      ?.learning_acceleration_selected_below_threshold_unmatched_by_ticker_count ??
    input.active_scan_trace
      ?.learning_acceleration_selected_below_threshold_unmatched_by_ticker_count ??
    0;
  const learningAccelerationInputMismatch =
    input.scan_readback?.learning_acceleration_input_mismatch ??
    input.active_scan_trace?.learning_acceleration_input_mismatch ??
    false;
  const learningAccelerationResearchOnlyPersisted =
    input.scan_readback?.learning_acceleration_research_only_persisted_count ??
    input.active_scan_trace?.learning_acceleration_research_only_persisted_count ??
    learningAccelerationSamplesCollectedToday;
  const learningAccelerationSamplesEvaluatedToday =
    input.scan_readback?.learning_acceleration_samples_evaluated_today ??
    input.outcome_evaluation?.learning_acceleration_samples_evaluated ??
    input.active_scan_trace?.learning_acceleration_samples_evaluated_count ??
    0;
  const learningAccelerationTopTickers =
    input.scan_readback?.learning_acceleration_top_research_sample_tickers ??
    input.active_scan_trace?.learning_acceleration_top_research_sample_tickers ??
    [];
  const learningAccelerationQuality =
    input.scan_readback?.learning_acceleration_sample_quality_summary ??
    input.active_scan_trace?.learning_acceleration_sample_quality_summary ??
    null;
  const learningAccelerationVisibleEvaluated =
    input.outcome_evaluation?.eligible_visible_snapshot_count ?? 0;
  const learningAccelerationResearchEvaluated =
    input.outcome_evaluation?.eligible_research_only_snapshot_count ?? 0;
  const targetIdeasPerWindow =
    input.scan_readback?.target_ideas_per_window ??
    input.active_scan_trace?.target_ideas_per_window ??
    null;
  const batchesCreatedTodayByWindow =
    input.scan_readback?.batches_created_today_by_window ?? {};
  const outcomeRowsExpectedToday =
    input.scan_readback?.expected_outcome_rows_today ??
    (input.scan_readback?.unique_learning_ideas_today ??
      input.scan_readback?.ideas_persisted_today ??
      input.daily_targets.total_recommendations_today) * 3;
  const outcomeRowsEvaluatedToday =
    input.scan_readback?.persisted_outcome_rows_today ??
    input.outcome_evaluation?.evaluated_outcome_count ??
    0;
  const shadowSamplesToday =
    input.outcome_evaluation?.shadow_entry_trial_count ??
    input.outcome_learning?.shadow_entry_trial?.shadow_trial_sample_size ??
    0;
  const providerBudgetUsedForScan =
    input.scan_readback?.provider_budget_used_for_scan ??
    input.active_scan_trace?.universe.selected_tickers_count ??
    null;
  const providerBudgetUsedForOutcomes =
    input.outcome_evaluation?.unique_candle_requests_count ??
    input.outcome_evaluation?.candle_requests_executed ??
    null;
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
  const outcomeRouteShadowSampleSize =
    input.outcome_evaluation?.shadow_entry_trial_count ?? 0;
  const shadowSamplesCollectedWithoutProposal =
    !shadowProposalExists &&
    Math.max(shadowTrialSampleSize, outcomeRouteShadowSampleSize) > 0;
  const shadowQualityClassification =
    input.outcome_learning?.shadow_entry_trial.status ?? "not_enough_data";
  const shadowRiskWarningRate =
    input.outcome_learning?.shadow_entry_trial.risk_warning_rate ?? null;
  const shadowTriggerDelta =
    input.outcome_learning?.shadow_entry_trial.trigger_rate_delta ?? null;
  const shadowAvgBestRDelta =
    input.outcome_learning?.shadow_entry_trial.avg_best_r_delta ?? null;
  const shadowAvgWorstRDelta =
    input.outcome_learning?.shadow_entry_trial.avg_worst_r_delta ?? null;
  const shadowRecommendation =
    input.outcome_learning?.shadow_entry_trial.recommendation ??
    "keep_collecting_data";
  const metadataCoverage = input.scanner_output_qa.metadata_coverage;
  const recommendationRowsWithDataTimestamp =
    metadataCoverage.recommendation_rows_with_data_timestamp;
  const recommendationRowsWithProviderSource =
    metadataCoverage.recommendation_rows_with_provider_source;
  const snapshotsWithDataTimestamp =
    input.metadata_coverage?.snapshots_with_data_timestamp ?? 0;
  const snapshotsWithProviderSource =
    input.metadata_coverage?.snapshots_with_provider_source ?? 0;
  const explicitGapCount =
    metadataCoverage.explicit_gap_count +
    (input.metadata_coverage?.explicit_gap_count ?? 0);
  const missingMetadataFields = Array.from(
    new Set([
      ...metadataCoverage.missing_metadata_fields,
      ...(input.metadata_coverage?.missing_metadata_fields ?? []),
    ]),
  );
  const qaCheckedSourcePath =
    input.metadata_coverage?.qa_checked_source_path ??
    metadataCoverage.qa_checked_source_path;
  const metadataMissingAtStage =
    input.metadata_coverage?.metadata_missing_at_stage ??
    metadataCoverage.metadata_missing_at_stage;
  const shadowTrialState = shadowSamplesCollectedWithoutProposal
    ? "samples collected; latest variant rejected"
    : !shadowProposalExists
    ? "no proposal"
    : shadowMetadataPresent === 0 && shadowMetadataMissing > 0
      ? "proposal exists but current snapshots have no metadata"
      : (input.outcome_evaluation?.current_batch_expected_outcomes ?? 0) > 0 &&
          (input.outcome_evaluation?.current_batch_persisted_outcomes ?? 0) === 0
        ? "current batch pending evaluation"
        : shadowTrialSampleSize > 0
          ? "collecting data"
          : "proposal active; waiting for shadow eligible outcomes";
  const mondayChecklist = mondayLiveTrialChecklist({
    input,
    providerPlanProfile,
    providerUpgrade,
    closedMarketWaitState,
    shadowTrialState,
  });

  return [
    section({
      section_id: "diagnostics_headline",
      title: "Diagnostics summary",
      severity: warnings.blockers.length > 0 ? "critical" : "info",
      lines: [
        lineValue("Headline", headline.headline),
        lineValue(
          "Core loop",
          `scan=${statusMark(headline.scanOk)} / publish=${statusMark(
            headline.publishOk,
          )} / outcomes=${statusMark(headline.outcomesOk)} / learning=${statusMark(
            headline.learningOk,
          )} / shadow=${headline.shadowStatus}`,
        ),
        ...(input.outcome_evaluation?.current_batch_fingerprint &&
        input.outcome_evaluation.current_batch_fingerprint !==
          input.outcome_evaluation.learning_insights_source_batch_fingerprint
          ? [
              lineValue("Current batch", "pending outcome evaluation"),
              lineValue(
                "Learning insights",
                `latest evaluated batch: ${compact(
                  input.outcome_evaluation.learning_insights_source_batch_fingerprint,
                  "none",
                )}`,
              ),
            ]
          : []),
      ],
      metrics: {
        headline: headline.headline,
        scan_ok: headline.scanOk,
        publish_ok: headline.publishOk,
        outcomes_ok: headline.outcomesOk,
        learning_ok: headline.learningOk,
        shadow_status: headline.shadowStatus,
        current_batch_fingerprint:
          input.outcome_evaluation?.current_batch_fingerprint ?? null,
        learning_source_batch_fingerprint:
          input.outcome_evaluation?.learning_insights_source_batch_fingerprint ??
          null,
      },
    }),
    section({
      section_id: "monday_live_trial_checklist",
      title: "Monday Live Trial Checklist",
      severity:
        mondayChecklist.status === "monday_live_trial_blocked"
          ? "critical"
          : mondayChecklist.status === "monday_live_trial_ready_with_warnings"
            ? "warning"
            : "info",
      lines: [
        lineValue("Status", words(mondayChecklist.status)),
        lineValue("Summary", mondayChecklist.message),
        lineValue("Next action", mondayChecklist.nextAction),
        lineValue(
          "Ready/items",
          `${mondayChecklist.readyCount}/${mondayChecklist.totalCount}`,
        ),
        lineValue(
          "Blockers/warnings",
          `${mondayChecklist.blockerCount}/${mondayChecklist.warningCount}`,
        ),
        ...mondayChecklist.items.map((item) =>
          lineValue(
            item.label,
            `${words(item.status)} — ${item.message}${
              item.next_action ? ` Next: ${item.next_action}` : ""
            }`,
          ),
        ),
      ],
      metrics: {
        monday_live_trial_status: mondayChecklist.status,
        monday_live_trial_blocker_count: mondayChecklist.blockerCount,
        monday_live_trial_warning_count: mondayChecklist.warningCount,
        monday_live_trial_next_action: mondayChecklist.nextAction,
        monday_live_trial_items_ready_count: mondayChecklist.readyCount,
        monday_live_trial_items_total_count: mondayChecklist.totalCount,
        monday_live_trial_items_json: JSON.stringify(mondayChecklist.items),
      },
    }),
    section({
      section_id: "warning_overview",
      title: "Warning overview",
      severity: warnings.blockers.length > 0 ? "critical" : highestSeverity(warnings.warnings),
      lines: [
        lineValue("Action needed", warningGroups.actionNeeded.length),
        lineValue("Informational", warningGroups.informational.length),
        lineValue("Expected state", warningGroups.expectedState.length),
        lineValue(
          "Action needed items",
          warningGroups.actionNeeded.length > 0
            ? warningGroups.actionNeeded
                .slice(0, 3)
                .map((item) => `[${item.source}] ${item.message}`)
                .join(" | ")
            : "none",
        ),
        lineValue(
          "Expected state items",
          warningGroups.expectedState.length > 0
            ? warningGroups.expectedState
                .slice(0, 3)
                .map((item) => item.message)
                .join(" | ")
            : "none",
        ),
      ],
      metrics: {
        action_needed_count: warningGroups.actionNeeded.length,
        informational_count: warningGroups.informational.length,
        expected_state_count: warningGroups.expectedState.length,
        action_needed_sources: warningGroups.actionNeeded
          .map((item) => item.source)
          .join(","),
        expected_state_sources: warningGroups.expectedState
          .map((item) => item.source)
          .join(","),
      },
    }),
    section({
      section_id: "context",
      title: "Timestamp/context",
      severity: "info",
      lines: [
        lineValue("Generated", input.market_session.evaluated_at),
        lineValue("Current UTC", input.scan_orchestration.current_utc_time),
        lineValue("Current NY", input.scan_orchestration.current_ny_time),
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
          )} / ${words(input.scan_orchestration.decision)}`,
        ),
        lineValue("Official schedule", officialScheduleLabel),
        lineValue(
          "Morning today",
          morningWindowStatus
            ? `${words(morningWindowStatus.status)} - ${morningWindowStatus.explanation}`
            : "not observed",
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
        current_utc_time: input.scan_orchestration.current_utc_time,
        current_ny_time: input.scan_orchestration.current_ny_time,
        market_is_open: input.market_session.market_is_open,
        market_day_type: input.market_status?.dayType ?? null,
        calendar_confidence: input.scan_orchestration.calendar_confidence,
        provider_calendar_available:
          input.scan_orchestration.provider_calendar_available,
        fallback_calendar_scan_allowed:
          input.scan_orchestration.fallback_calendar_scan_allowed,
        session_phase: input.market_session.phase,
        active_scan_window: input.scan_orchestration.active_window,
        orchestration_decision: input.scan_orchestration.decision,
        should_scan_now: input.scan_orchestration.should_scan_now,
        next_scan_window: input.scan_orchestration.next_window,
        next_scan_window_starts_at:
          input.scan_orchestration.next_window_starts_at,
        official_schedule: officialScheduleLabel,
        morning_window_status: morningWindowStatus?.status ?? null,
        morning_window_latest_scan_at:
          morningWindowStatus?.latest_scan_at ?? null,
        morning_window_explanation: morningWindowStatus?.explanation ?? null,
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
      section_id: "scheduled_scan_timeline_today",
      title: "Scheduled Scan Timeline Today",
      severity:
        input.scan_orchestration.active_window === "morning" &&
        scheduledScanTimelineToday.length === 0
          ? "warning"
          : "info",
      lines:
        scheduledScanTimelineToday.length > 0
          ? scheduledScanTimelineToday.map((attempt, index) =>
              lineValue(
                `Attempt ${index + 1}`,
                [
                  compact(attempt.utc_timestamp, "unknown UTC"),
                  compact(attempt.ny_timestamp, "unknown NY"),
                  `${compact(attempt.source, "unknown")}/${compact(
                    attempt.mode,
                    "unknown",
                  )}`,
                  `source_type=${compact(attempt.source_type, "unknown")}`,
                  `readback=${compact(attempt.readback_kind, "none")}`,
                  `${compact(attempt.official_window, "unknown")} -> ${compact(
                    attempt.outcome,
                    "unknown",
                  )}`,
                  `allowed=${attempt.allowed === null ? "unknown" : bool(attempt.allowed)}`,
                  `reason=${compact(attempt.reason, "none")}`,
                  `empty_reason=${compact(attempt.empty_scan_reason, "none")}`,
                  `reference_refresh=${
                    attempt.reference_refresh
                      ? `attempted=${attempt.reference_refresh.reference_refresh_attempted_count}/success=${attempt.reference_refresh.reference_refresh_success_count}/failed=${attempt.reference_refresh.reference_refresh_failed_count}/rescued_stale_cache=${attempt.reference_refresh.reference_refresh_rescued_from_scanner_cache_reference_too_old_count}/remaining_stale=${attempt.reference_refresh.reference_refresh_remaining_stale_reference_blocks}`
                      : "none"
                  }`,
                  `refresh_failures=${topReasonText(
                    attempt.reference_refresh?.reference_refresh_failure_reasons,
                  )}`,
                  `refresh_examples=${referenceRefreshExamplesText(
                    attempt.reference_refresh?.reference_refresh_failure_examples,
                  )}`,
                  `refresh_sources=${topReasonText(
                    attempt.reference_refresh?.reference_refresh_source_counts,
                  )}`,
                  `refresh_accepted_sources=${topReasonText(
                    attempt.reference_refresh?.reference_refresh_accepted_source_counts,
                  )}`,
                  `refresh_rejected_sources=${topReasonText(
                    attempt.reference_refresh?.reference_refresh_rejected_source_counts,
                  )}`,
                  `rejections=${
                    attempt.rejection_summary?.top_rejection_reasons.join(",") ||
                    "none"
                  }`,
                  `examples=${
                    Object.entries(
                      attempt.rejection_summary?.examples_by_reason ?? {},
                    )
                      .slice(0, 2)
                      .map(([reason, tickers]) =>
                        `${words(reason)}:${tickers.slice(0, 4).join(",")}`,
                      )
                      .join(" / ") || "none"
                  }`,
                  `category=${compact(
                    attempt.rejection_summary?.below_target_category,
                    "none",
                  )}`,
                  `next=${compact(
                    attempt.rejection_summary?.next_best_fix,
                    "none",
                  )}`,
                  `raw/ranked/selected/built/published=${attempt.raw_count ?? 0}/${attempt.ranked_count ?? 0}/${attempt.selected_count ?? 0}/${attempt.built_count ?? 0}/${attempt.published_count ?? 0}`,
                  `batch=${compact(attempt.batch_fingerprint, "none")}`,
                  `run=${compact(attempt.scan_run_fingerprint, "none")}`,
                ].join(" | "),
              ),
            )
          : [
              lineValue(
                "Attempts",
                input.scan_orchestration.active_window === "morning" ||
                  input.scan_orchestration.active_window === "midday" ||
                  input.scan_orchestration.active_window === "power_hour"
                  ? "not observed for current trading day"
                  : "not observed",
              ),
            ],
      metrics: {
        scheduled_scan_timeline_count: scheduledScanTimelineToday.length,
        scheduled_scan_timeline_latest_utc:
          scheduledScanTimelineToday[0]?.utc_timestamp ?? null,
        scheduled_scan_timeline_latest_ny:
          scheduledScanTimelineToday[0]?.ny_timestamp ?? null,
        scheduled_scan_timeline_latest_source:
          scheduledScanTimelineToday[0]?.source ?? null,
        scheduled_scan_timeline_latest_source_type:
          scheduledScanTimelineToday[0]?.source_type ?? null,
        scheduled_scan_timeline_latest_readback_kind:
          scheduledScanTimelineToday[0]?.readback_kind ?? null,
        scheduled_scan_timeline_latest_mode:
          scheduledScanTimelineToday[0]?.mode ?? null,
        scheduled_scan_timeline_latest_window:
          scheduledScanTimelineToday[0]?.official_window ?? null,
        scheduled_scan_timeline_latest_outcome:
          scheduledScanTimelineToday[0]?.outcome ?? null,
        scheduled_scan_timeline_latest_reason:
          scheduledScanTimelineToday[0]?.reason ?? null,
        scheduled_scan_timeline_latest_empty_scan_reason:
          scheduledScanTimelineToday[0]?.empty_scan_reason ?? null,
        scheduled_scan_timeline_latest_rejections:
          scheduledScanTimelineToday[0]?.rejection_summary?.top_rejection_reasons.join(
            ",",
          ) ?? null,
        scheduled_scan_timeline_latest_rejection_category:
          scheduledScanTimelineToday[0]?.rejection_summary
            ?.below_target_category ?? null,
        scheduled_scan_timeline_latest_next_best_fix:
          scheduledScanTimelineToday[0]?.rejection_summary?.next_best_fix ??
          null,
        scheduled_scan_timeline_latest_reference_refresh_attempted:
          scheduledScanTimelineToday[0]?.reference_refresh
            ?.reference_refresh_attempted_count ?? null,
        scheduled_scan_timeline_latest_reference_refresh_success:
          scheduledScanTimelineToday[0]?.reference_refresh
            ?.reference_refresh_success_count ?? null,
        scheduled_scan_timeline_latest_reference_refresh_failed:
          scheduledScanTimelineToday[0]?.reference_refresh
            ?.reference_refresh_failed_count ?? null,
        scheduled_scan_timeline_latest_reference_refresh_rescued_stale_cache:
          scheduledScanTimelineToday[0]?.reference_refresh
            ?.reference_refresh_rescued_from_scanner_cache_reference_too_old_count ??
          null,
        scheduled_scan_timeline_latest_reference_refresh_remaining_stale:
          scheduledScanTimelineToday[0]?.reference_refresh
            ?.reference_refresh_remaining_stale_reference_blocks ?? null,
        scheduled_scan_timeline_latest_reference_refresh_failure_reasons:
          JSON.stringify(
            scheduledScanTimelineToday[0]?.reference_refresh
              ?.reference_refresh_failure_reasons ?? {},
          ),
        scheduled_scan_timeline_latest_reference_refresh_failure_examples:
          JSON.stringify(
            scheduledScanTimelineToday[0]?.reference_refresh
              ?.reference_refresh_failure_examples ?? {},
          ),
        scheduled_scan_timeline_latest_reference_refresh_source_counts:
          JSON.stringify(
            scheduledScanTimelineToday[0]?.reference_refresh
              ?.reference_refresh_source_counts ?? {},
          ),
        scheduled_scan_timeline_latest_reference_refresh_accepted_source_counts:
          JSON.stringify(
            scheduledScanTimelineToday[0]?.reference_refresh
              ?.reference_refresh_accepted_source_counts ?? {},
          ),
        scheduled_scan_timeline_latest_reference_refresh_rejected_source_counts:
          JSON.stringify(
            scheduledScanTimelineToday[0]?.reference_refresh
              ?.reference_refresh_rejected_source_counts ?? {},
          ),
        scheduled_scan_timeline_json: JSON.stringify(scheduledScanTimelineToday),
      },
    }),
    section({
      section_id: "overall",
      title: "Overall status",
      severity: warnings.blockers.length > 0 ? "critical" : highestSeverity(warnings.warnings),
      lines: [
        lineValue("Engine", displayEngineStatus(input)),
        lineValue(
          "Live trial",
          words(input.live_market_trial_readiness.overall_status),
        ),
        lineValue("Runbook", displayRunbookStatus(input)),
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
      section_id: "dynamic_movers_discovery",
      title: "Dynamic Movers Discovery",
      severity:
        dynamicMoversDiscovery?.discovery_enabled === true &&
        dynamicMoversDiscovery.provider_error_type !== "none"
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Discovery enabled",
          dynamicMoversDiscovery?.discovery_enabled ?? false,
        ),
        lineValue(
          "Provider attempted",
          dynamicMoversDiscovery?.provider_attempted ?? "none",
        ),
        lineValue(
          "Provider used",
          dynamicMoversDiscovery?.provider_used ?? "none",
        ),
        lineValue(
          "Provider error type",
          dynamicMoversDiscovery?.provider_error_type ??
            "dynamic_movers_provider_unavailable",
        ),
        lineValue("Returned count", dynamicMoversDiscovery?.returned_count ?? 0),
        lineValue(
          "Selected preview count",
          dynamicMoversDiscovery?.selected_preview_count ?? 0,
        ),
        lineValue(
          "Top dynamic movers",
          (dynamicMoversDiscovery?.top_dynamic_movers ?? []).length > 0
            ? (dynamicMoversDiscovery?.top_dynamic_movers ?? [])
                .slice(0, 8)
                .map(
                  (mover) =>
                    `${mover.ticker} ${mover.mover_source} ${pctValue(mover.price_change_pct)} scanned=${bool(mover.would_have_been_scanned_today)}`,
                )
                .join("; ")
            : "none",
        ),
        lineValue(
          "Stale/invalid mover count",
          dynamicMoversDiscovery?.stale_invalid_mover_count ?? 0,
        ),
      ],
      metrics: {
        discovery_enabled: dynamicMoversDiscovery?.discovery_enabled ?? false,
        provider_attempted:
          dynamicMoversDiscovery?.provider_attempted ?? "none",
        provider_used: dynamicMoversDiscovery?.provider_used ?? "none",
        provider_error_type:
          dynamicMoversDiscovery?.provider_error_type ??
          "dynamic_movers_provider_unavailable",
        provider_error_message:
          dynamicMoversDiscovery?.provider_error_message ?? null,
        returned_count: dynamicMoversDiscovery?.returned_count ?? 0,
        selected_preview_count:
          dynamicMoversDiscovery?.selected_preview_count ?? 0,
        stale_invalid_mover_count:
          dynamicMoversDiscovery?.stale_invalid_mover_count ?? 0,
        top_dynamic_movers: JSON.stringify(
          dynamicMoversDiscovery?.top_dynamic_movers ?? [],
        ),
      },
    }),
    section({
      section_id: "metadata_coverage",
      title: "Metadata Coverage",
      severity: explicitGapCount > 0 ? "warning" : "info",
      lines: [
        lineValue(
          "Rows with data timestamp/provider",
          `${recommendationRowsWithDataTimestamp} / ${recommendationRowsWithProviderSource}`,
        ),
        lineValue(
          "Snapshots with data timestamp/provider",
          `${snapshotsWithDataTimestamp} / ${snapshotsWithProviderSource}`,
        ),
        lineValue("Explicit gaps", explicitGapCount),
        lineValue(
          "Missing metadata fields",
          missingMetadataFields.length > 0
            ? missingMetadataFields.join(", ")
            : "none",
        ),
        lineValue("QA source path", qaCheckedSourcePath),
        lineValue(
          "Missing at stage",
          compact(metadataMissingAtStage, "none"),
        ),
      ],
      metrics: {
        recommendation_rows_with_data_timestamp:
          recommendationRowsWithDataTimestamp,
        recommendation_rows_with_provider_source:
          recommendationRowsWithProviderSource,
        snapshots_with_data_timestamp: snapshotsWithDataTimestamp,
        snapshots_with_provider_source: snapshotsWithProviderSource,
        explicit_gap_count: explicitGapCount,
        missing_metadata_fields: missingMetadataFields.join(", "),
        qa_checked_source_path: qaCheckedSourcePath,
        metadata_missing_at_stage: metadataMissingAtStage,
        provider_timestamp_gap_mapped:
          missingMetadataFields.includes("data_timestamp") &&
          explicitGapCount > 0,
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
              "Grow Max Learning",
              `${bool(input.active_scan_trace.grow_max_learning_mode)} / requested=${bool(input.active_scan_trace.grow_max_learning_mode_requested)} / source=${compact(input.active_scan_trace.grow_max_learning_mode_enabled_source, "none")}`,
            ),
            lineValue(
              "Grow Max env",
              `server_present=${bool(input.active_scan_trace.grow_max_learning_mode_env_raw_present)} / server=${bool(input.active_scan_trace.grow_max_learning_mode_env_raw_value_normalized)} / public_present=${bool(input.active_scan_trace.grow_max_learning_mode_public_env_raw_present)} / public=${bool(input.active_scan_trace.grow_max_learning_mode_public_env_raw_value_normalized)}`,
            ),
            lineValue(
              "Grow Max blocked reason",
              compact(
                input.active_scan_trace.grow_max_learning_mode_blocked_reason,
                "none",
              ),
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
              "Official scan gate",
              `detected=${bool(input.active_scan_trace.official_window_detected)} / window=${compact(input.active_scan_trace.scheduled_gate_window, "unknown")} / allowed=${bool(input.active_scan_trace.scheduled_gate_allowed === true)}`,
            ),
            lineValue(
              "Official/generation windows",
              `${compact(input.active_scan_trace.official_scan_window, "unknown")} / ${compact(input.active_scan_trace.generation_window, "unknown")}`,
            ),
            lineValue(
              "Gate block/mismatch",
              `${compact(input.active_scan_trace.scheduled_gate_block_reason, "none")} / mismatch=${bool(input.active_scan_trace.schedule_window_mismatch)}`,
            ),
            lineValue(
              "Generation block",
              compact(
                input.active_scan_trace.generation_block_reason,
                "none",
              ),
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
              "Quote/candle mode",
              input.active_scan_trace.market_data_fetch.quote_success_count === 0 &&
                input.active_scan_trace.market_data_fetch.candle_success_count > 0
                ? "quote endpoint not used; scanner built from candle/cache/indicator data"
                : "provider fetch counters observed",
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
            lineValue("Official scan gate", "not observed"),
            lineValue("Official/generation windows", "not observed"),
            lineValue("Gate block/mismatch", "not observed"),
            lineValue("Generation block", "not observed"),
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
        grow_max_learning_mode:
          input.active_scan_trace?.grow_max_learning_mode ?? null,
        grow_max_learning_mode_env_raw_present:
          input.active_scan_trace?.grow_max_learning_mode_env_raw_present ??
          null,
        grow_max_learning_mode_env_raw_value_normalized:
          input.active_scan_trace
            ?.grow_max_learning_mode_env_raw_value_normalized ?? null,
        grow_max_learning_mode_public_env_raw_present:
          input.active_scan_trace
            ?.grow_max_learning_mode_public_env_raw_present ?? null,
        grow_max_learning_mode_public_env_raw_value_normalized:
          input.active_scan_trace
            ?.grow_max_learning_mode_public_env_raw_value_normalized ?? null,
        grow_max_learning_mode_requested:
          input.active_scan_trace?.grow_max_learning_mode_requested ?? null,
        grow_max_learning_mode_blocked_reason:
          input.active_scan_trace?.grow_max_learning_mode_blocked_reason ??
          null,
        grow_max_learning_mode_enabled_source:
          input.active_scan_trace?.grow_max_learning_mode_enabled_source ??
          null,
        target_ideas_per_window:
          input.active_scan_trace?.target_ideas_per_window ?? null,
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
        effective_outcome_candle_request_cap:
          input.active_scan_trace?.effective_outcome_candle_request_cap ?? null,
        effective_scheduled_skip_openai:
          input.active_scan_trace?.effective_scheduled_skip_openai ?? null,
        effective_scheduled_timeout_ms:
          input.active_scan_trace?.effective_scheduled_timeout_ms ?? null,
        profile_scan_ticker_cap:
          input.active_scan_trace?.profile_scan_ticker_cap ?? null,
        profile_outcome_candle_request_cap:
          input.active_scan_trace?.profile_outcome_candle_request_cap ?? null,
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
        official_scan_window:
          input.active_scan_trace?.official_scan_window ?? null,
        generation_window:
          input.active_scan_trace?.generation_window ?? null,
        generation_block_reason:
          input.active_scan_trace?.generation_block_reason ?? null,
        official_window_detected:
          input.active_scan_trace?.official_window_detected ?? null,
        scheduled_gate_window:
          input.active_scan_trace?.scheduled_gate_window ?? null,
        scheduled_gate_allowed:
          input.active_scan_trace?.scheduled_gate_allowed ?? null,
        scheduled_gate_block_reason:
          input.active_scan_trace?.scheduled_gate_block_reason ?? null,
        schedule_window_mismatch:
          input.active_scan_trace?.schedule_window_mismatch ?? null,
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
      section_id: "selected_to_built_drop_off",
      title: "Selected -> Built Drop-off",
      severity:
        selectedToBuiltDropOff &&
        selectedToBuiltDropOff.output_below_target_reason_category ===
          "implementation_bottleneck"
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Selected/built/published",
          `${selectedToBuiltDropOff?.selected_count ?? batchCandidateAudit.selected_candidates_count}/${selectedToBuiltDisplayBuilt}/${selectedToBuiltDisplayPublished}`,
        ),
        lineValue("Source", selectedToBuiltSource),
        lineValue(
          "Latest attempt",
          latestScheduledBuildRejectionAttempt
            ? `${latestScheduledBuildRejectionAttempt.utc_timestamp} / ${compact(
                latestScheduledBuildRejectionAttempt.ny_timestamp,
                "unknown NY",
              )}`
            : "not observed",
        ),
        lineValue(
          "Scan run",
          compact(
            latestScheduledBuildRejectionAttempt?.scan_run_fingerprint ??
              batchCandidateAudit.scan_run_fingerprint,
            "not observed",
          ),
        ),
        lineValue(
          "Rejected selected",
          selectedToBuiltDisplayRejected,
        ),
        lineValue(
          "Top exact rejection reasons",
          topReasonText(selectedToBuiltDropOff?.rejection_counts ?? null),
        ),
        lineValue(
          "Reference refresh",
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ? `attempted=${latestScheduledBuildRejectionAttempt.reference_refresh.reference_refresh_attempted_count} / success=${latestScheduledBuildRejectionAttempt.reference_refresh.reference_refresh_success_count} / failed=${latestScheduledBuildRejectionAttempt.reference_refresh.reference_refresh_failed_count} / rescued stale cache=${latestScheduledBuildRejectionAttempt.reference_refresh.reference_refresh_rescued_from_scanner_cache_reference_too_old_count} / remaining stale=${latestScheduledBuildRejectionAttempt.reference_refresh.reference_refresh_remaining_stale_reference_blocks}`
            : "not observed",
        ),
        lineValue(
          "Reference refresh failures",
          topReasonText(
            latestScheduledBuildRejectionAttempt?.reference_refresh
              ?.reference_refresh_failure_reasons,
          ),
        ),
        lineValue(
          "Reference refresh examples",
          referenceRefreshExamplesText(
            latestScheduledBuildRejectionAttempt?.reference_refresh
              ?.reference_refresh_failure_examples,
          ),
        ),
        lineValue(
          "Reference refresh sources",
          topReasonText(
            latestScheduledBuildRejectionAttempt?.reference_refresh
              ?.reference_refresh_source_counts,
          ),
        ),
        lineValue(
          "Reference refresh accepted sources",
          topReasonText(
            latestScheduledBuildRejectionAttempt?.reference_refresh
              ?.reference_refresh_accepted_source_counts,
          ),
        ),
        lineValue(
          "Reference refresh rejected sources",
          topReasonText(
            latestScheduledBuildRejectionAttempt?.reference_refresh
              ?.reference_refresh_rejected_source_counts,
          ),
        ),
        lineValue(
          "Reason examples",
          selectedToBuiltDropOff
            ? Object.entries(selectedToBuiltDropOff.examples_by_reason)
                .filter(([, tickers]) => (tickers ?? []).length > 0)
                .slice(0, 4)
                .map(([reason, tickers]) => `${words(reason)}:${tickers?.join(",")}`)
                .join(" / ") || "none"
            : "not observed",
        ),
        lineValue(
          "Below-target category",
          selectedToBuiltDropOff
            ? words(selectedToBuiltDropOff.output_below_target_reason_category)
            : "not observed",
        ),
        lineValue(
          "Below-target explanation",
          selectedToBuiltDropOff?.output_below_target_explanation ??
            "Selected candidate build diagnostics were not observed for this scan.",
        ),
        lineValue(
          "Next best fix",
          latestScheduledBuildRejectionAttempt?.rejection_summary
            ?.next_best_fix ??
            "Inspect selected candidate diagnostics for missing data or builder gaps.",
        ),
      ],
      metrics: {
        selected_to_built_source: selectedToBuiltSource,
        latest_attempt_utc:
          latestScheduledBuildRejectionAttempt?.utc_timestamp ?? null,
        latest_attempt_ny:
          latestScheduledBuildRejectionAttempt?.ny_timestamp ?? null,
        scan_run_fingerprint:
          latestScheduledBuildRejectionAttempt?.scan_run_fingerprint ??
          batchCandidateAudit.scan_run_fingerprint,
        next_best_fix:
          latestScheduledBuildRejectionAttempt?.rejection_summary
            ?.next_best_fix ?? null,
        reference_refresh_attempted_count:
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_attempted_count ?? null,
        reference_refresh_success_count:
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_success_count ?? null,
        reference_refresh_failed_count:
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_failed_count ?? null,
        reference_refresh_rescued_from_scanner_cache_reference_too_old_count:
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_rescued_from_scanner_cache_reference_too_old_count ??
          null,
        reference_refresh_remaining_stale_reference_blocks:
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_remaining_stale_reference_blocks ?? null,
        reference_refresh_failure_reasons: JSON.stringify(
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_failure_reasons ?? {},
        ),
        reference_refresh_failure_examples: JSON.stringify(
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_failure_examples ?? {},
        ),
        reference_refresh_source_counts: JSON.stringify(
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_source_counts ?? {},
        ),
        reference_refresh_accepted_source_counts: JSON.stringify(
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_accepted_source_counts ?? {},
        ),
        reference_refresh_rejected_source_counts: JSON.stringify(
          latestScheduledBuildRejectionAttempt?.reference_refresh
            ?.reference_refresh_rejected_source_counts ?? {},
        ),
        selected_count:
          selectedToBuiltDropOff?.selected_count ??
          batchCandidateAudit.selected_candidates_count,
        built_count:
          selectedToBuiltDisplayBuilt,
        published_count: selectedToBuiltDisplayPublished,
        rejected_count: selectedToBuiltDisplayRejected,
        raw_scan_run_built_count: batchCandidateAudit.raw_scan_run_built_count,
        raw_scan_run_published_count:
          batchCandidateAudit.raw_scan_run_published_count,
        counter_reconciliation: batchCandidateAudit.counter_reconciliation,
        reconciled_from_persisted_rows:
          batchCandidateAudit.reconciled_from_persisted_rows,
        rejection_counts: JSON.stringify(
          selectedToBuiltDropOff?.rejection_counts ?? {},
        ),
        category_counts: JSON.stringify(
          selectedToBuiltDropOff?.category_counts ?? {},
        ),
        examples_by_reason: JSON.stringify(
          selectedToBuiltDropOff?.examples_by_reason ?? {},
        ),
        output_below_target_reason_category:
          selectedToBuiltDropOff?.output_below_target_reason_category ?? null,
        output_below_target_explanation:
          selectedToBuiltDropOff?.output_below_target_explanation ?? null,
      },
    }),
    section({
      section_id: "batch_candidate_audit",
      title: "Batch Candidate Audit",
      severity:
        batchCandidateAudit.batch_completeness === "sparse" ||
        batchCandidateAudit.batch_completeness === "empty"
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Batch",
          compact(batchCandidateAudit.batch_fingerprint, "not observed"),
        ),
        lineValue(
          "Scan run",
          compact(batchCandidateAudit.scan_run_fingerprint, "not observed"),
        ),
        lineValue(
          "Candidate funnel",
          `${batchCandidateAudit.raw_candidates_count} raw -> ${batchCandidateAudit.ranked_candidates_count} ranked -> ${batchCandidateAudit.selected_candidates_count} selected`,
        ),
        lineValue(
          "Recommendation funnel",
          `${batchCandidateAudit.effective_built_recommendations_count} built -> ${batchCandidateAudit.effective_published_recommendations_count} published -> ${batchCandidateAudit.persisted_recommendation_rows_count} persisted rows`,
        ),
        ...(batchCandidateAudit.reconciled_from_persisted_rows
          ? [
              lineValue(
                "Raw scan-run counters",
                `${batchCandidateAudit.raw_scan_run_built_count} built -> ${batchCandidateAudit.raw_scan_run_published_count} published`,
              ),
              lineValue(
                "Counter reconciliation",
                batchCandidateAudit.counter_reconciliation_note,
              ),
            ]
          : []),
        lineValue(
          "Snapshot funnel",
          `${batchCandidateAudit.persisted_snapshot_rows_count} rows -> ${batchCandidateAudit.unique_snapshot_fingerprints_count} unique -> ${batchCandidateAudit.visible_grid_cards_count} visible cards -> ${batchCandidateAudit.outcome_eligible_snapshot_count} eligible`,
        ),
        lineValue(
          "Missing snapshots",
          `${batchCandidateAudit.missing_snapshot_count} / expected ${batchCandidateAudit.expected_snapshot_count_from_scan}`,
        ),
        lineValue(
          "Strict batch excluded",
          batchCandidateAudit.strict_batch_filter_excluded_count,
        ),
        lineValue(
          "Hidden/archived",
          batchCandidateAudit.hidden_archived_count,
        ),
        ...(batchCandidateAudit.persisted_snapshot_rows_count >
        batchCandidateAudit.visible_grid_cards_count
          ? [
              lineValue(
                "Duplicate/hidden retained rows",
                `${Math.max(
                  0,
                  batchCandidateAudit.persisted_snapshot_rows_count -
                    batchCandidateAudit.visible_grid_cards_count,
                )} healthy/deduped`,
              ),
            ]
          : []),
        lineValue(
          "Largest drop-off",
          batchCandidateAudit.largest_drop_off_stage
            ? `${words(batchCandidateAudit.largest_drop_off_stage)} (${batchCandidateAudit.largest_drop_off_count})`
            : "none",
        ),
        lineValue(
          "Top drop-off reasons",
          topReasonText(batchCandidateAudit.drop_off_reasons),
        ),
        lineValue(
          "Batch completeness",
          words(batchCandidateAudit.batch_completeness),
        ),
      ],
      metrics: {
        batch_fingerprint: batchCandidateAudit.batch_fingerprint,
        scan_run_fingerprint: batchCandidateAudit.scan_run_fingerprint,
        raw_candidates_count: batchCandidateAudit.raw_candidates_count,
        ranked_candidates_count: batchCandidateAudit.ranked_candidates_count,
        selected_candidates_count: batchCandidateAudit.selected_candidates_count,
        built_recommendations_count:
          batchCandidateAudit.built_recommendations_count,
        published_recommendations_count:
          batchCandidateAudit.published_recommendations_count,
        effective_built_recommendations_count:
          batchCandidateAudit.effective_built_recommendations_count,
        effective_published_recommendations_count:
          batchCandidateAudit.effective_published_recommendations_count,
        raw_scan_run_built_count: batchCandidateAudit.raw_scan_run_built_count,
        raw_scan_run_published_count:
          batchCandidateAudit.raw_scan_run_published_count,
        counter_reconciliation: batchCandidateAudit.counter_reconciliation,
        reconciled_from_persisted_rows:
          batchCandidateAudit.reconciled_from_persisted_rows,
        counter_reconciliation_note:
          batchCandidateAudit.counter_reconciliation_note,
        persisted_recommendation_rows_count:
          batchCandidateAudit.persisted_recommendation_rows_count,
        persisted_snapshot_rows_count:
          batchCandidateAudit.persisted_snapshot_rows_count,
        unique_snapshot_fingerprints_count:
          batchCandidateAudit.unique_snapshot_fingerprints_count,
        visible_grid_cards_count: batchCandidateAudit.visible_grid_cards_count,
        hidden_archived_count: batchCandidateAudit.hidden_archived_count,
        outcome_eligible_snapshot_count:
          batchCandidateAudit.outcome_eligible_snapshot_count,
        outcome_ineligible_snapshot_count:
          batchCandidateAudit.outcome_ineligible_snapshot_count,
        expected_snapshot_count_from_scan:
          batchCandidateAudit.expected_snapshot_count_from_scan,
        actual_snapshot_count_for_batch:
          batchCandidateAudit.actual_snapshot_count_for_batch,
        missing_snapshot_count: batchCandidateAudit.missing_snapshot_count,
        missing_snapshot_reasons: JSON.stringify(
          batchCandidateAudit.missing_snapshot_reasons,
        ),
        raw_duplicate_snapshot_rows: Math.max(
          0,
          batchCandidateAudit.persisted_snapshot_rows_count -
            batchCandidateAudit.unique_snapshot_fingerprints_count,
        ),
        effective_unique_snapshot_rows:
          batchCandidateAudit.unique_snapshot_fingerprints_count,
        healthy_grow_max_dedupe:
          batchCandidateAudit.persisted_snapshot_rows_count >
            batchCandidateAudit.unique_snapshot_fingerprints_count &&
          batchCandidateAudit.visible_grid_cards_count > 0 &&
          batchCandidateAudit.outcome_eligible_snapshot_count > 0 &&
          batchCandidateAudit.drop_off_reasons.duplicate_snapshot_fingerprint ===
            0 &&
          batchCandidateAudit.drop_off_reasons.persistence_failed === 0,
        strict_batch_filter_excluded_count:
          batchCandidateAudit.strict_batch_filter_excluded_count,
        drop_off_reasons: JSON.stringify(batchCandidateAudit.drop_off_reasons),
        largest_drop_off_stage: batchCandidateAudit.largest_drop_off_stage,
        largest_drop_off_count: batchCandidateAudit.largest_drop_off_count,
        batch_completeness: batchCandidateAudit.batch_completeness,
        lineage_sample_count: batchCandidateAudit.lineage.length,
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
        lineValue(
          "Latest official batch stored window",
          compact(
            latestSuccessfulScan?.window_classification ??
              latestSuccessfulScan?.scan_window,
            "not observed",
          ),
        ),
        lineValue(
          "Latest official batch time window",
          compact(
            latestSuccessfulScan?.created_at_window_classification,
            "not observed",
          ),
        ),
        lineValue(
          "Latest official batch timing",
          latestSuccessfulScan
            ? latestSuccessfulScan.produced_inside_official_window
              ? "inside official window"
              : "outside official window"
            : "not observed",
        ),
        lineValue("Latest attempted scan", attemptedScanLabel),
        lineValue(
          "Latest attempt stored window",
          compact(
            latestAttemptedScan?.window_classification ??
              latestAttemptedScan?.scan_window,
            "not observed",
          ),
        ),
        lineValue(
          "Latest attempt time window",
          compact(
            latestAttemptedScan?.created_at_window_classification,
            "not observed",
          ),
        ),
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
        ...(input.scan_readback?.grow_max_learning_mode
          ? [
              lineValue(
                "Visible cards",
                input.scan_readback?.current_batch_visible_recommendation_count ??
                  input.scan_readback?.current_batch_visible_grid_count ??
                  0,
              ),
              lineValue(
                "Raw snapshot rows",
                input.scan_readback?.current_batch_raw_snapshot_rows ??
                  input.scan_readback?.current_batch_snapshot_count ??
                  0,
              ),
              lineValue(
                "Unique learning ideas",
                input.scan_readback?.current_batch_unique_learning_ideas ??
                  input.scan_readback?.current_batch_learning_snapshot_count ??
                  0,
              ),
              lineValue(
                "Duplicate snapshot rows",
                input.scan_readback?.current_batch_duplicate_snapshot_rows ?? 0,
              ),
              lineValue(
                "Grid cards",
                input.scan_readback?.current_batch_grid_card_count ??
                  input.scan_readback?.current_batch_visible_grid_count ??
                  0,
              ),
              lineValue("Grow Max Learning", "enabled"),
            ]
          : [
              lineValue(
                "Current batch rec/snapshot/grid",
                `${input.scan_readback?.current_batch_recommendation_count ?? 0}/${input.scan_readback?.current_batch_snapshot_count ?? 0}/${input.scan_readback?.current_batch_visible_grid_count ?? 0}`,
              ),
            ]),
        lineValue(
          "Current batch tickers",
          (input.scan_readback?.current_batch_tickers ?? []).join(", ") || "none",
        ),
        lineValue(
          "Batch health",
          input.scan_readback?.current_batch_mismatch_reason
            ? compact(input.scan_readback.current_batch_mismatch_reason, "mismatch")
            : compact(
                input.scan_readback?.current_batch_batch_health,
                "membership aligned",
              ),
        ),
        lineValue(
          "Successful visible count",
          latestSuccessfulScan?.visible_recommendation_count ?? 0,
        ),
        lineValue("Expected live tickers", (input.scan_readback?.latest_successful_live_recommendation_tickers ?? []).join(", ") || "none"),
        lineValue(
          "Strict batch filter",
          input.scan_readback?.primary_grid_strict_batch_filter_applied
            ? "true"
            : "false",
        ),
        lineValue(
          "Hidden reasons",
          Object.keys(hiddenReasonBreakdown).length > 0
            ? Object.entries(hiddenReasonBreakdown)
                .map(([reason, countValue]) => `${reason}:${countValue}`)
                .join(", ")
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
        current_batch_raw_snapshot_rows:
          input.scan_readback?.current_batch_raw_snapshot_rows ?? null,
        current_batch_unique_snapshot_fingerprints:
          input.scan_readback?.current_batch_unique_snapshot_fingerprints ?? null,
        current_batch_duplicate_snapshot_rows:
          input.scan_readback?.current_batch_duplicate_snapshot_rows ?? null,
        current_batch_unique_learning_ideas:
          input.scan_readback?.current_batch_unique_learning_ideas ?? null,
        current_batch_visible_grid_count:
          input.scan_readback?.current_batch_visible_grid_count ?? null,
        current_batch_visible_recommendation_count:
          input.scan_readback?.current_batch_visible_recommendation_count ?? null,
        current_batch_learning_snapshot_count:
          input.scan_readback?.current_batch_learning_snapshot_count ?? null,
        current_batch_grid_card_count:
          input.scan_readback?.current_batch_grid_card_count ?? null,
        current_batch_batch_health:
          input.scan_readback?.current_batch_batch_health ?? null,
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
        latest_successful_scan_created_at_ny:
          latestSuccessfulScan?.created_at_ny ?? null,
        latest_successful_scan_window:
          latestSuccessfulScan?.scan_window ?? null,
        latest_successful_scan_window_classification:
          latestSuccessfulScan?.window_classification ?? null,
        latest_successful_scan_created_at_window_classification:
          latestSuccessfulScan?.created_at_window_classification ?? null,
        latest_successful_scan_inside_official_window:
          latestSuccessfulScan?.produced_inside_official_window ?? null,
        latest_successful_visible_recommendation_count:
          latestSuccessfulScan?.visible_recommendation_count ?? null,
        latest_successful_scan_source: latestSuccessfulScan?.source ?? null,
        latest_attempted_scan_result: latestAttemptedScan?.result ?? null,
        latest_attempted_scan_created_at: latestAttemptedScan?.created_at ?? null,
        latest_attempted_scan_created_at_ny:
          latestAttemptedScan?.created_at_ny ?? null,
        latest_attempted_scan_window: latestAttemptedScan?.scan_window ?? null,
        latest_attempted_scan_window_classification:
          latestAttemptedScan?.window_classification ?? null,
        latest_attempted_scan_created_at_window_classification:
          latestAttemptedScan?.created_at_window_classification ?? null,
        latest_attempted_scan_inside_official_window:
          latestAttemptedScan?.produced_inside_official_window ?? null,
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
          "Grow Max Learning",
          growMaxLearningMode
            ? `enabled / target ${targetIdeasPerWindow ?? "unknown"}`
            : "disabled",
        ),
        lineValue(
          "Unique learning ideas",
          `${input.scan_readback?.ideas_persisted_this_window ?? 0} this window / ${input.scan_readback?.unique_learning_ideas_today ?? input.scan_readback?.ideas_persisted_today ?? input.daily_targets.total_recommendations_today} today`,
        ),
        lineValue(
          "Raw rows today",
          input.scan_readback?.raw_rows_today ?? 0,
        ),
        lineValue(
          "Unique evaluated ideas today",
          input.scan_readback?.unique_evaluated_ideas_today ?? 0,
        ),
        lineValue(
          "Expected/persisted outcome rows today",
          `${input.scan_readback?.expected_outcome_rows_today ?? outcomeRowsExpectedToday}/${input.scan_readback?.persisted_outcome_rows_today ?? outcomeRowsEvaluatedToday}`,
        ),
        lineValue(
          "Visible cards / hidden archived members",
          `${input.scan_readback?.visible_cards_today ?? input.serving_cadence.visible_recommendation_count}/${input.scan_readback?.hidden_archived_members_today ?? 0}`,
        ),
        lineValue(
          "Batches by window",
          `morning ${batchesCreatedTodayByWindow.morning ?? 0} / midday ${batchesCreatedTodayByWindow.midday ?? 0} / power_hour ${batchesCreatedTodayByWindow.power_hour ?? 0} / unknown_window_batches ${batchesCreatedTodayByWindow.unknown_window_batches ?? 0}`,
        ),
        lineValue(
          "Window blocks",
          `same_window=${input.scan_readback?.same_window_batch_blocked_count ?? 0} / daily=${compact(input.scan_readback?.daily_learning_limit_status, "unknown")}`,
        ),
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
        grow_max_learning_mode: growMaxLearningMode
          ? "enabled"
          : "disabled",
        target_ideas_per_window: targetIdeasPerWindow,
        ideas_persisted_this_window:
          input.scan_readback?.ideas_persisted_this_window ?? null,
        ideas_persisted_today:
          input.scan_readback?.unique_learning_ideas_today ??
          input.scan_readback?.ideas_persisted_today ??
          input.daily_targets.total_recommendations_today,
        raw_rows_today: input.scan_readback?.raw_rows_today ?? null,
        unique_learning_ideas_today:
          input.scan_readback?.unique_learning_ideas_today ?? null,
        unique_evaluated_ideas_today:
          input.scan_readback?.unique_evaluated_ideas_today ?? null,
        expected_outcome_rows_today:
          input.scan_readback?.expected_outcome_rows_today ?? null,
        persisted_outcome_rows_today:
          input.scan_readback?.persisted_outcome_rows_today ?? null,
        visible_cards_today: input.scan_readback?.visible_cards_today ?? null,
        hidden_archived_members_today:
          input.scan_readback?.hidden_archived_members_today ?? null,
        batches_created_today_by_window: JSON.stringify(
          batchesCreatedTodayByWindow,
        ),
        same_window_batch_blocked_count:
          input.scan_readback?.same_window_batch_blocked_count ?? null,
        daily_learning_limit_status:
          input.scan_readback?.daily_learning_limit_status ?? null,
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
          "Budget used",
          `scan ${providerBudgetUsedForScan ?? "unknown"} / outcomes ${providerBudgetUsedForOutcomes ?? "unknown"}`,
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
        provider_budget_used_for_scan: providerBudgetUsedForScan,
        provider_budget_used_for_outcomes: providerBudgetUsedForOutcomes,
        latest_limit_signal:
          input.provider_budget_guard.latest_limit_signal.status,
      },
    }),
    section({
      section_id: "provider_plan_profile",
      title: "Provider plan profile",
      severity: providerPlanProfile.mismatch ? "warning" : "info",
      lines: [
        lineValue(
          "Profile",
          `${words(providerPlanProfile.mode)} via ${words(providerPlanProfile.source)}`,
        ),
        lineValue("Plan mismatch", bool(providerPlanProfile.mismatch)),
        lineValue(
          "Caps",
          `scan ${providerPlanProfile.scanTickerCap ?? "unknown"} / outcomes ${providerPlanProfile.outcomeBudgetLimit ?? "unknown"}`,
        ),
        lineValue(
          "Grow Max Learning",
          growMaxLearningMode
            ? `enabled / target ${targetIdeasPerWindow ?? "unknown"} per window`
            : "disabled",
        ),
        lineValue(
          "OpenAI/timeout",
          `skip_openai=${
            providerPlanProfile.skipOpenAi === null
              ? "unknown"
              : bool(providerPlanProfile.skipOpenAi)
          } / timeout=${providerPlanProfile.timeoutMs ?? "unknown"}ms`,
        ),
        lineValue(
          "Cadence",
          providerPlanProfile.cadence === null
            ? "unknown"
            : `${providerPlanProfile.cadence}m`,
        ),
        lineValue(
          "Notes",
          providerPlanProfile.notes.length > 0
            ? providerPlanProfile.notes.join(" ")
            : "No profile note available.",
        ),
        lineValue(
          "Profile warnings",
          providerPlanProfile.profileWarnings.length > 0
            ? providerPlanProfile.profileWarnings.join(" ")
            : "none",
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
        grow_max_learning_mode: growMaxLearningMode
          ? "enabled"
          : "disabled",
        target_ideas_per_window: targetIdeasPerWindow,
        profile_budget_limit: providerPlanProfile.profileBudgetLimit,
        override_budget_limit: providerPlanProfile.overrideBudgetLimit,
        effective_scheduled_skip_openai: providerPlanProfile.skipOpenAi,
        effective_scheduled_timeout_ms: providerPlanProfile.timeoutMs,
        background_scan_cadence_minutes: providerPlanProfile.cadence,
        env_scan_ticker_override: providerPlanProfile.envScanTickerOverride,
        provider_plan_profile_notes: providerPlanProfile.notes.join("; "),
        provider_plan_profile_warnings:
          providerPlanProfile.profileWarnings.join("; "),
        provider_plan_profile_overrides_json: JSON.stringify(
          providerPlanProfile.overrides,
        ),
      },
    }),
    section({
      section_id: "learning_acceleration_env",
      title: "Learning Acceleration Env",
      severity:
        learningAccelerationEnvCategory === "other" ||
        learningAccelerationEnvCategory === "empty"
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "TURE_LEARNING_ACCELERATION_ENABLED present",
          learningAccelerationServerConfigUnavailable
            ? "server config unavailable"
            : bool(learningAccelerationEnvPresent),
        ),
        lineValue("Parsed value", words(learningAccelerationEnvCategory)),
        lineValue(
          "Enabled",
          learningAccelerationServerConfigUnavailable
            ? "server config unavailable"
            : bool(learningAccelerationParsedEnabled),
        ),
        lineValue("Source", words(learningAccelerationSource)),
        lineValue("Runtime", words(learningAccelerationRuntimeEnvironment)),
      ],
      metrics: {
        learning_acceleration_env_present: learningAccelerationEnvPresent,
        learning_acceleration_env_value_category:
          learningAccelerationEnvCategory,
        learning_acceleration_env_parsed_enabled:
          learningAccelerationParsedEnabled,
        learning_acceleration_env_source: learningAccelerationSource,
        learning_acceleration_runtime_environment:
          learningAccelerationRuntimeEnvironment,
      },
    }),
    section({
      section_id: "learning_acceleration",
      title: "Learning Acceleration",
      severity:
        learningAccelerationEnabled &&
        (input.outcome_evaluation?.skipped_due_to_budget_count ?? 0) > 0
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Enabled",
          `${bool(learningAccelerationEnabled)} / ${words(learningAccelerationMode)} via ${words(learningAccelerationSource)}`,
        ),
        lineValue(
          "Samples collected/evaluated today",
          `${learningAccelerationSamplesCollectedToday}/${learningAccelerationSamplesEvaluatedToday}`,
        ),
        lineValue(
          "Selected below threshold / research persisted",
          `${learningAccelerationSelectedBelowThreshold}/${learningAccelerationResearchOnlyPersisted}`,
        ),
        lineValue(
          "Readback / passed / matched / unmatched",
          `${learningAccelerationBelowThresholdReadback}/${learningAccelerationBelowThresholdPassed}/${learningAccelerationBelowThresholdMatched}/${learningAccelerationBelowThresholdUnmatched}`,
        ),
        lineValue(
          "Input mismatch",
          bool(learningAccelerationInputMismatch),
        ),
        lineValue(
          "Visible vs research-only evaluated",
          `${learningAccelerationVisibleEvaluated}/${learningAccelerationResearchEvaluated}`,
        ),
        lineValue(
          "Total unique learning ideas",
          input.outcome_evaluation?.unique_learning_ideas ??
            input.scan_readback?.unique_learning_ideas_today ??
            learningAccelerationVisibleEvaluated +
              learningAccelerationResearchEvaluated,
        ),
        lineValue(
          "Provider requests used/saved",
          `${input.outcome_evaluation?.candle_requests_executed ?? 0}/${input.outcome_evaluation?.candle_requests_saved_by_reuse ?? 0}`,
        ),
        lineValue(
          "Provider cap / skipped due budget",
          `${input.outcome_evaluation?.provider_budget_limit ?? providerPlanProfile.outcomeBudgetLimit ?? "unknown"} / ${input.outcome_evaluation?.skipped_due_to_budget_count ?? input.active_scan_trace?.learning_acceleration_skipped_due_to_budget_count ?? 0}`,
        ),
        lineValue(
          "Skipped invalid/stale",
          `${input.active_scan_trace?.learning_acceleration_skipped_due_to_invalid_risk_count ?? 0}/${input.active_scan_trace?.learning_acceleration_skipped_due_to_stale_reference_count ?? 0}`,
        ),
        lineValue(
          "Top research tickers",
          learningAccelerationTopTickers.length > 0
            ? learningAccelerationTopTickers.join(", ")
            : "none",
        ),
        lineValue(
          "Sample quality",
          `good ${learningAccelerationQuality?.good ?? 0} / usable ${learningAccelerationQuality?.usable ?? 0}`,
        ),
      ],
      metrics: {
        learning_acceleration_enabled: learningAccelerationEnabled,
        learning_acceleration_mode: learningAccelerationMode,
        learning_acceleration_enabled_source: learningAccelerationSource,
        learning_acceleration_samples_collected_today:
          learningAccelerationSamplesCollectedToday,
        learning_acceleration_samples_evaluated_today:
          learningAccelerationSamplesEvaluatedToday,
        learning_acceleration_selected_below_threshold:
          learningAccelerationSelectedBelowThreshold,
        learning_acceleration_selected_below_threshold_readback:
          learningAccelerationBelowThresholdReadback,
        learning_acceleration_selected_below_threshold_passed:
          learningAccelerationBelowThresholdPassed,
        learning_acceleration_selected_below_threshold_matched_by_ticker:
          learningAccelerationBelowThresholdMatched,
        learning_acceleration_selected_below_threshold_unmatched_by_ticker:
          learningAccelerationBelowThresholdUnmatched,
        learning_acceleration_input_mismatch:
          learningAccelerationInputMismatch,
        learning_acceleration_research_only_persisted:
          learningAccelerationResearchOnlyPersisted,
        learning_acceleration_visible_evaluated:
          learningAccelerationVisibleEvaluated,
        learning_acceleration_research_only_evaluated:
          learningAccelerationResearchEvaluated,
        learning_acceleration_total_unique_learning_ideas:
          input.outcome_evaluation?.unique_learning_ideas ??
          input.scan_readback?.unique_learning_ideas_today ??
          learningAccelerationVisibleEvaluated +
            learningAccelerationResearchEvaluated,
        learning_acceleration_provider_requests_used:
          input.outcome_evaluation?.candle_requests_executed ?? 0,
        learning_acceleration_provider_requests_saved_by_reuse:
          input.outcome_evaluation?.candle_requests_saved_by_reuse ?? 0,
        learning_acceleration_provider_budget_limit:
          input.outcome_evaluation?.provider_budget_limit ??
          providerPlanProfile.outcomeBudgetLimit,
        learning_acceleration_skipped_due_to_budget:
          input.outcome_evaluation?.skipped_due_to_budget_count ??
          input.active_scan_trace?.learning_acceleration_skipped_due_to_budget_count ??
          0,
        learning_acceleration_skipped_due_to_invalid_risk:
          input.active_scan_trace
            ?.learning_acceleration_skipped_due_to_invalid_risk_count ?? 0,
        learning_acceleration_skipped_due_to_stale_reference:
          input.active_scan_trace
            ?.learning_acceleration_skipped_due_to_stale_reference_count ?? 0,
        learning_acceleration_top_research_sample_tickers:
          learningAccelerationTopTickers.join(", "),
        learning_acceleration_sample_quality_good:
          learningAccelerationQuality?.good ?? 0,
        learning_acceleration_sample_quality_usable:
          learningAccelerationQuality?.usable ?? 0,
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
        lineValue("Status", words(providerUpgrade.status)),
        lineValue("Message", providerUpgrade.message),
        lineValue(
          "Plan/env",
          `${words(providerPlanProfile.mode)} / server=${words(providerPlanProfile.serverPlanMode)} / public=${words(providerPlanProfile.publicPlanMode)} / consistent=${bool(providerUpgrade.envConsistent)}`,
        ),
        lineValue(
          "Active caps",
          `scan ${providerPlanProfile.scanTickerCap ?? "unknown"} / outcomes ${providerPlanProfile.outcomeBudgetLimit ?? "unknown"} / timeout ${providerPlanProfile.timeoutMs ?? "unknown"}ms`,
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
          "Expected outcome rows",
          input.outcome_evaluation?.expected_outcome_rows_from_eligible_snapshots ??
            input.outcome_evaluation?.current_batch_expected_outcomes ??
            0,
        ),
        lineValue(
          "Persisted outcome rows",
          input.outcome_evaluation?.current_batch_persisted_outcomes ?? 0,
        ),
        lineValue(
          "Learning source batch",
          compact(
            input.outcome_evaluation?.learning_insights_source_batch_fingerprint,
            "none",
          ),
        ),
        lineValue(
          "Latest evaluated",
          compact(
            input.outcome_evaluation?.latest_evaluated_batch_fingerprint,
            "none",
          ),
        ),
        lineValue(
          "Readback",
          input.outcome_evaluation?.readback_hydration_complete === false
            ? "loading"
            : `${input.outcome_evaluation?.outcome_rows_loaded_count ?? 0} rows / ${input.outcome_evaluation?.outcome_snapshot_match_count ?? 0} matched`,
        ),
        lineValue(
          "Expected/Persisted",
          `${input.outcome_evaluation?.expected_outcome_count ?? 0}/${input.outcome_evaluation?.persisted_outcome_count ?? 0}`,
        ),
        ...(input.scan_readback?.grow_max_learning_mode
          ? [
              lineValue(
                "Raw snapshot rows",
                input.outcome_evaluation?.raw_snapshot_rows ??
                  input.outcome_evaluation?.total_snapshots_loaded_for_batch ??
                  0,
              ),
              lineValue(
                "Unique learning ideas",
                input.outcome_evaluation?.unique_learning_ideas ??
                  input.outcome_evaluation?.unique_snapshot_fingerprints_count ??
                  0,
              ),
              lineValue(
                "Duplicate snapshot rows",
                input.outcome_evaluation?.duplicate_snapshot_rows ??
                  input.outcome_evaluation
                    ?.duplicate_snapshot_fingerprints_count ??
                  0,
              ),
              lineValue(
                "Duplicate rows ignored",
                input.outcome_evaluation?.duplicate_snapshot_rows_ignored_count ??
                  0,
              ),
              lineValue(
                "Canonical visible retained",
                `${input.outcome_evaluation?.canonical_visible_snapshots_retained_count ?? input.outcome_evaluation?.eligible_visible_snapshot_count ?? 0} total / ${input.outcome_evaluation?.canonical_visible_duplicate_fingerprints_retained_count ?? 0} from duplicate fingerprints`,
              ),
              lineValue(
                "Duplicate ignored split",
                `hidden/archived=${input.outcome_evaluation?.hidden_archived_duplicate_rows_ignored_count ?? 0} / visible=${input.outcome_evaluation?.visible_duplicate_rows_ignored_count ?? 0}`,
              ),
              lineValue(
                "Archived duplicate blocks",
                input.outcome_evaluation?.archived_duplicate_rows_blocked_count ??
                  0,
              ),
              lineValue(
                "Duplicate conflicts",
                input.outcome_evaluation?.duplicate_snapshot_conflict_count ?? 0,
              ),
              lineValue(
                "Visible cards",
                input.outcome_evaluation?.grid_cards ??
                  input.outcome_evaluation?.visible_grid_count ??
                  0,
              ),
              lineValue(
                "Batch health",
                compact(input.outcome_evaluation?.batch_health, "unknown"),
              ),
              lineValue(
                "Outcome eligible snapshots",
                input.outcome_evaluation?.outcome_eligible_snapshot_count ??
                  input.outcome_evaluation?.eligible_visible_snapshot_count ??
                  0,
              ),
              lineValue(
                "Outcome evaluated snapshots",
                input.outcome_evaluation?.outcome_evaluated_snapshot_count ??
                  0,
              ),
              lineValue(
                "Skipped/ineligible snapshots",
                input.outcome_evaluation?.outcome_ineligible_snapshot_count ??
                  input.outcome_evaluation?.ineligible_snapshot_count ??
                  0,
              ),
              lineValue(
                "Eligible visible/learning/research",
                `${input.outcome_evaluation?.eligible_visible_snapshot_count ?? 0}/${input.outcome_evaluation?.eligible_learning_snapshot_count ?? 0}/${input.outcome_evaluation?.eligible_research_only_snapshot_count ?? 0}`,
              ),
            ]
          : []),
        lineValue(
          "Expected/persisted outcome rows today",
          `${outcomeRowsExpectedToday}/${outcomeRowsEvaluatedToday}`,
        ),
        lineValue(
          "Unique evaluated ideas today",
          input.scan_readback?.unique_evaluated_ideas_today ??
            input.outcome_evaluation?.outcome_evaluated_snapshot_count ??
            0,
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
          "Missing candles / provider errors",
          `${input.outcome_evaluation?.missing_candles_count ?? 0}/${input.outcome_evaluation?.provider_error_count ?? 0}`,
        ),
        lineValue(
          "Provider budget",
          `${compact(input.outcome_evaluation?.outcome_provider_budget_status, "unknown")} / limit ${input.outcome_evaluation?.provider_budget_limit ?? "none"}`,
        ),
        lineValue(
          "Candle requests planned/executed/saved",
          `${input.outcome_evaluation?.candle_requests_planned ?? 0}/${input.outcome_evaluation?.candle_requests_executed ?? 0}/${input.outcome_evaluation?.candle_requests_saved_by_reuse ?? 0}`,
        ),
        lineValue(
          "Budget pending / retries",
          `${input.outcome_evaluation?.pending_provider_budget_count ?? 0}/${input.outcome_evaluation?.retry_incomplete_count ?? 0}`,
        ),
        lineValue(
          "Retained candles / counterfactual ready",
          `${input.outcome_evaluation?.retained_candles_added_count ?? 0}/${input.outcome_evaluation?.counterfactual_ready_count ?? 0}`,
        ),
        lineValue("Shadow samples today", shadowSamplesToday),
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
        outcome_eligible_snapshot_count:
          input.outcome_evaluation?.outcome_eligible_snapshot_count ?? null,
        outcome_evaluated_snapshot_count:
          input.outcome_evaluation?.outcome_evaluated_snapshot_count ?? null,
        outcome_ineligible_snapshot_count:
          input.outcome_evaluation?.outcome_ineligible_snapshot_count ?? null,
        total_snapshots_loaded_for_batch:
          input.outcome_evaluation?.total_snapshots_loaded_for_batch ?? null,
        raw_snapshot_rows:
          input.outcome_evaluation?.raw_snapshot_rows ?? null,
        total_recommendation_rows_loaded_for_batch:
          input.outcome_evaluation
            ?.total_recommendation_rows_loaded_for_batch ?? null,
        eligible_visible_snapshot_count:
          input.outcome_evaluation?.eligible_visible_snapshot_count ?? null,
        eligible_learning_snapshot_count:
          input.outcome_evaluation?.eligible_learning_snapshot_count ?? null,
        eligible_research_only_snapshot_count:
          input.outcome_evaluation?.eligible_research_only_snapshot_count ?? null,
        grow_max_learning_snapshots_included_count:
          input.outcome_evaluation
            ?.grow_max_learning_snapshots_included_count ?? null,
        ineligible_snapshot_count:
          input.outcome_evaluation?.ineligible_snapshot_count ?? null,
        ineligible_reasons: JSON.stringify(
          input.outcome_evaluation?.ineligible_reasons ?? {},
        ),
        unique_snapshot_fingerprints_count:
          input.outcome_evaluation?.unique_snapshot_fingerprints_count ?? null,
        unique_learning_ideas:
          input.outcome_evaluation?.unique_learning_ideas ?? null,
        duplicate_snapshot_fingerprints_count:
          input.outcome_evaluation?.duplicate_snapshot_fingerprints_count ?? null,
        duplicate_snapshot_rows:
          input.outcome_evaluation?.duplicate_snapshot_rows ?? null,
        duplicate_snapshot_rows_ignored_count:
          input.outcome_evaluation?.duplicate_snapshot_rows_ignored_count ??
          null,
        hidden_archived_duplicate_rows_ignored_count:
          input.outcome_evaluation
            ?.hidden_archived_duplicate_rows_ignored_count ?? null,
        visible_duplicate_rows_ignored_count:
          input.outcome_evaluation?.visible_duplicate_rows_ignored_count ??
          null,
        canonical_visible_snapshots_retained_count:
          input.outcome_evaluation
            ?.canonical_visible_snapshots_retained_count ?? null,
        canonical_visible_duplicate_fingerprints_retained_count:
          input.outcome_evaluation
            ?.canonical_visible_duplicate_fingerprints_retained_count ?? null,
        archived_duplicate_rows_blocked_count:
          input.outcome_evaluation?.archived_duplicate_rows_blocked_count ??
          null,
        duplicate_snapshot_conflict_count:
          input.outcome_evaluation?.duplicate_snapshot_conflict_count ?? null,
        duplicate_snapshot_conflict_reasons: JSON.stringify(
          input.outcome_evaluation?.duplicate_snapshot_conflict_reasons ?? {},
        ),
        visible_recommendations:
          input.outcome_evaluation?.visible_recommendations ?? null,
        visible_grid_count:
          input.outcome_evaluation?.visible_grid_count ?? null,
        grid_cards:
          input.outcome_evaluation?.grid_cards ?? null,
        expected_outcome_rows_from_eligible_snapshots:
          input.outcome_evaluation
            ?.expected_outcome_rows_from_eligible_snapshots ?? null,
        batch_health:
          input.outcome_evaluation?.batch_health ?? null,
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
        outcome_rows_expected_today: outcomeRowsExpectedToday,
        outcome_rows_persisted_today: outcomeRowsEvaluatedToday,
        unique_evaluated_ideas_today:
          input.scan_readback?.unique_evaluated_ideas_today ?? null,
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
        shadow_samples_today: shadowSamplesToday,
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
        plan_price_freshness_summary: JSON.stringify(planFreshnessSummary ?? null),
        plan_reference_metadata_trace: JSON.stringify(
          planReferenceMetadataTrace ?? null,
        ),
        entry_type_trigger_summary: JSON.stringify(
          entryTypeTriggerSummary ?? null,
        ),
      },
    }),
    section({
      section_id: "plan_price_freshness",
      title: "Plan Price Freshness",
      severity: planFreshnessSummary?.warning ? "warning" : "info",
      lines: [
        lineValue(
          "Fresh/Slightly/Stale/Severe",
          `${planFreshnessSummary?.fresh_plan_count ?? 0}/${planFreshnessSummary?.slightly_stale_plan_count ?? 0}/${planFreshnessSummary?.stale_plan_count ?? 0}/${planFreshnessSummary?.severely_stale_plan_count ?? 0}`,
        ),
        lineValue(
          "Missing reference/timestamp/provider",
          `${planFreshnessSummary?.missing_reference_price_count ?? 0}/${planFreshnessSummary?.missing_reference_timestamp_count ?? 0}/${planFreshnessSummary?.provider_price_unavailable_count ?? 0}`,
        ),
        lineValue(
          "Reference metadata present/missing-with-plan/missing-no-plan",
          `${planFreshnessSummary?.reference_metadata_present_count ?? 0}/${planFreshnessSummary?.reference_metadata_missing_but_plan_prices_present_count ?? 0}/${planFreshnessSummary?.reference_metadata_missing_no_plan_prices_count ?? 0}`,
        ),
        lineValue(
          "Reference metadata present/missing",
          `${planFreshnessSummary?.reference_metadata_present_count ?? 0}/${Math.max(
            0,
            (planFreshnessSummary?.evaluated_snapshots ?? 0) -
              (planFreshnessSummary?.reference_metadata_present_count ?? 0),
          )}`,
        ),
        lineValue(
          "Average entry distance",
          pctValue(
            planFreshnessSummary?.average_entry_distance_from_first_candle_close_pct,
          ),
        ),
        lineValue(
          "Worst entry distance",
          pctValue(
            planFreshnessSummary?.worst_entry_distance_from_first_candle_close_pct,
          ),
        ),
        lineValue(
          "Stale or severe ratio",
          pctValue(
            planFreshnessSummary
              ? planFreshnessSummary.stale_or_severely_stale_ratio * 100
              : null,
          ),
        ),
        lineValue(
          "Largest distance tickers",
          (planFreshnessSummary?.largest_distance_tickers ?? []).length > 0
            ? (planFreshnessSummary?.largest_distance_tickers ?? [])
                .slice(0, 5)
                .map(
                  (item) =>
                    `${item.ticker ?? "unknown"} ${pctValue(item.entry_distance_from_first_candle_close_pct)} ${item.classification}`,
                )
                .join("; ")
            : "none",
        ),
        lineValue(
          "Reference price sources",
          Object.entries(planFreshnessSummary?.reference_price_source_counts ?? {})
            .map(([source, countValue]) => `${source}=${countValue}`)
            .join(", ") || "none",
        ),
        lineValue(
          "Top missing reference metadata tickers",
          (planFreshnessSummary?.top_tickers_missing_reference_metadata ?? [])
            .slice(0, 5)
            .map(
              (item) =>
                `${item.ticker ?? "unknown"} ${item.plan_reference_metadata_status}`,
            )
            .join("; ") || "none",
        ),
        ...(planFreshnessSummary?.warning
          ? [lineValue("Warning", planFreshnessSummary.warning)]
          : []),
      ],
      metrics: {
        total_snapshots: planFreshnessSummary?.total_snapshots ?? 0,
        evaluated_snapshots: planFreshnessSummary?.evaluated_snapshots ?? 0,
        fresh_plan_count: planFreshnessSummary?.fresh_plan_count ?? 0,
        slightly_stale_plan_count:
          planFreshnessSummary?.slightly_stale_plan_count ?? 0,
        stale_plan_count: planFreshnessSummary?.stale_plan_count ?? 0,
        severely_stale_plan_count:
          planFreshnessSummary?.severely_stale_plan_count ?? 0,
        missing_reference_price_count:
          planFreshnessSummary?.missing_reference_price_count ?? 0,
        missing_reference_timestamp_count:
          planFreshnessSummary?.missing_reference_timestamp_count ?? 0,
        provider_price_unavailable_count:
          planFreshnessSummary?.provider_price_unavailable_count ?? 0,
        reference_metadata_present_count:
          planFreshnessSummary?.reference_metadata_present_count ?? 0,
        reference_metadata_missing_but_plan_prices_present_count:
          planFreshnessSummary
            ?.reference_metadata_missing_but_plan_prices_present_count ?? 0,
        reference_metadata_missing_no_plan_prices_count:
          planFreshnessSummary?.reference_metadata_missing_no_plan_prices_count ??
          0,
        average_entry_distance_from_first_candle_close_pct:
          planFreshnessSummary
            ?.average_entry_distance_from_first_candle_close_pct ?? null,
        worst_entry_distance_from_first_candle_close_pct:
          planFreshnessSummary?.worst_entry_distance_from_first_candle_close_pct ??
          null,
        stale_or_severely_stale_ratio:
          planFreshnessSummary?.stale_or_severely_stale_ratio ?? null,
        largest_distance_tickers: JSON.stringify(
          planFreshnessSummary?.largest_distance_tickers ?? [],
        ),
        reference_price_source_counts: JSON.stringify(
          planFreshnessSummary?.reference_price_source_counts ?? {},
        ),
        top_tickers_missing_reference_metadata: JSON.stringify(
          planFreshnessSummary?.top_tickers_missing_reference_metadata ?? [],
        ),
        warning: planFreshnessSummary?.warning ?? null,
      },
    }),
    section({
      section_id: "entry_type_trigger_diagnostics",
      title: "Entry Type Trigger Diagnostics",
      severity:
        (entryTypeTriggerSummary?.disagreement_count ?? 0) > 0 ||
        (entryTypeTriggerSummary?.unknown_due_to_missing_reference_count ?? 0) > 0
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Known / unknown entry type",
          `${entryTypeTriggerSummary?.known_entry_type_count ?? 0}/${entryTypeTriggerSummary?.unknown_entry_type_count ?? 0}`,
        ),
        lineValue(
          "Pullback / breakout / market reference",
          `${entryTypeTriggerSummary?.by_entry_type.pullback_limit ?? 0}/${entryTypeTriggerSummary?.by_entry_type.breakout_stop ?? 0}/${entryTypeTriggerSummary?.by_entry_type.market_reference ?? 0}`,
        ),
        lineValue(
          "Current route vs entry-type-aware triggered",
          `${entryTypeTriggerSummary?.current_route_triggered_count ?? 0}/${entryTypeTriggerSummary?.entry_type_triggered_count ?? 0}`,
        ),
        lineValue(
          "Disagreement count/rate",
          `${entryTypeTriggerSummary?.disagreement_count ?? 0}/${pctValue(
            entryTypeTriggerSummary
              ? entryTypeTriggerSummary.disagreement_rate * 100
              : null,
          )}`,
        ),
        lineValue(
          "Top disagreement reasons",
          topReasonText(entryTypeTriggerSummary?.top_disagreement_reasons),
        ),
        lineValue(
          "Tickers with disagreements",
          (entryTypeTriggerSummary?.tickers_with_disagreements ?? []).join(", ") ||
            "none",
        ),
        lineValue(
          "Missing reference impact",
          entryTypeTriggerSummary?.unknown_due_to_missing_reference_count ?? 0,
        ),
      ],
      metrics: {
        total_outcomes: entryTypeTriggerSummary?.total_outcomes ?? 0,
        known_entry_type_count:
          entryTypeTriggerSummary?.known_entry_type_count ?? 0,
        unknown_entry_type_count:
          entryTypeTriggerSummary?.unknown_entry_type_count ?? 0,
        by_entry_type: JSON.stringify(
          entryTypeTriggerSummary?.by_entry_type ?? {},
        ),
        by_trigger_semantics: JSON.stringify(
          entryTypeTriggerSummary?.by_trigger_semantics ?? {},
        ),
        entry_type_triggered_count:
          entryTypeTriggerSummary?.entry_type_triggered_count ?? 0,
        current_route_triggered_count:
          entryTypeTriggerSummary?.current_route_triggered_count ?? 0,
        disagreement_count: entryTypeTriggerSummary?.disagreement_count ?? 0,
        disagreement_rate: entryTypeTriggerSummary?.disagreement_rate ?? 0,
        top_disagreement_reasons: JSON.stringify(
          entryTypeTriggerSummary?.top_disagreement_reasons ?? {},
        ),
        tickers_with_disagreements: JSON.stringify(
          entryTypeTriggerSummary?.tickers_with_disagreements ?? [],
        ),
        unknown_due_to_missing_reference_count:
          entryTypeTriggerSummary?.unknown_due_to_missing_reference_count ?? 0,
      },
    }),
    section({
      section_id: "strong_candidate_gate",
      title: "Strong Candidate Gate",
      severity:
        strongCandidateGate.candidates_blocked_from_strong > 0
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Candidates considered for Strong",
          strongCandidateGate.candidates_considered_for_strong,
        ),
        lineValue(
          "Candidates blocked from Strong",
          strongCandidateGate.candidates_blocked_from_strong,
        ),
        lineValue(
          "Top blocking reasons",
          strongCandidateGate.top_blocking_reasons.length > 0
            ? strongCandidateGate.top_blocking_reasons
                .map((item) => `${item.reason}=${item.count}`)
                .join(", ")
            : "none",
        ),
        lineValue(
          "Blocked by stale_plan",
          strongCandidateGate.blocked_by_stale_plan_count,
        ),
        lineValue(
          "Blocked by entry_distance_too_large",
          strongCandidateGate.blocked_by_entry_distance_too_large_count,
        ),
        lineValue(
          "Blocked by invalid_risk_geometry",
          strongCandidateGate.blocked_by_invalid_risk_geometry_count,
        ),
        lineValue(
          "Blocked by missing_provider_reference",
          strongCandidateGate.blocked_by_missing_provider_reference_count,
        ),
      ],
      metrics: {
        candidates_considered_for_strong:
          strongCandidateGate.candidates_considered_for_strong,
        candidates_blocked_from_strong:
          strongCandidateGate.candidates_blocked_from_strong,
        top_blocking_reasons: JSON.stringify(
          strongCandidateGate.top_blocking_reasons,
        ),
        blocked_by_stale_plan_count:
          strongCandidateGate.blocked_by_stale_plan_count,
        blocked_by_entry_distance_too_large_count:
          strongCandidateGate.blocked_by_entry_distance_too_large_count,
        blocked_by_invalid_risk_geometry_count:
          strongCandidateGate.blocked_by_invalid_risk_geometry_count,
        blocked_by_missing_provider_reference_count:
          strongCandidateGate.blocked_by_missing_provider_reference_count,
        blocked_by_setup_quality_below_minimum_count:
          strongCandidateGate.blocked_by_setup_quality_below_minimum_count,
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
          "Primary insight",
          compact(input.outcome_learning?.primary_insight?.title, "none"),
        ),
        lineValue(
          "Latest evaluated batch",
          compact(input.outcome_learning?.batch_fingerprint, "none"),
        ),
        lineValue(
          "Entry triggered / missed",
          `${input.outcome_learning?.entry_triggered_rate ?? "unknown"} / ${input.outcome_learning?.entry_not_triggered_rate ?? "unknown"}`,
        ),
        lineValue(
          "Avg best/worst R",
          `${input.outcome_learning?.avg_best_r ?? "unknown"} / ${input.outcome_learning?.avg_worst_r ?? "unknown"}`,
        ),
        lineValue(
          "Reason",
          compact(input.outcome_learning?.primary_insight?.reason, "none"),
        ),
        lineValue(
          "Suggested review",
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
          "Entry too aggressive rate",
          input.outcome_learning?.entry_plan_quality.entry_too_aggressive_rate ??
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
          "Original/best trigger",
          `${input.outcome_learning?.entry_plan_quality.counterfactual_entry_simulation.original_entry_trigger_rate ?? "unknown"} / ${input.outcome_learning?.entry_plan_quality.counterfactual_entry_simulation.best_variant_trigger_rate ?? "unknown"}`,
        ),
        lineValue(
          "Shadow trial",
          `${compact(input.outcome_learning?.shadow_entry_trial.variant, "none")} / ${compact(input.outcome_learning?.shadow_entry_trial.status, "not_started")}`,
        ),
        lineValue(
          "Shadow quality classification",
          compact(shadowQualityClassification, "not_enough_data"),
        ),
        lineValue(
          "Shadow risk warning rate",
          shadowRiskWarningRate,
        ),
        lineValue(
          "Shadow trigger delta",
          shadowTriggerDelta,
        ),
        lineValue(
          "Shadow avg R deltas",
          `${shadowAvgBestRDelta ?? "unknown"} best / ${shadowAvgWorstRDelta ?? "unknown"} worst`,
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
        shadow_quality_classification: shadowQualityClassification,
        shadow_quality_recommendation: shadowRecommendation,
        official_entry_trigger_rate:
          input.outcome_learning?.shadow_entry_trial
            .official_entry_trigger_rate ?? null,
        shadow_entry_trigger_rate:
          input.outcome_learning?.shadow_entry_trial
            .shadow_entry_trigger_rate ?? null,
        shadow_target_hit_rate:
          input.outcome_learning?.shadow_entry_trial.shadow_target_hit_rate ??
          null,
        shadow_stop_hit_rate:
          input.outcome_learning?.shadow_entry_trial.shadow_stop_hit_rate ??
          null,
        shadow_neither_hit_rate:
          input.outcome_learning?.shadow_entry_trial.shadow_neither_hit_rate ??
          null,
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
        shadow_sample_size:
          input.outcome_learning?.shadow_entry_trial.shadow_sample_size ?? null,
        shadow_trigger_rate_delta: shadowTriggerDelta,
        shadow_avg_best_r_delta: shadowAvgBestRDelta,
        shadow_avg_worst_r_delta: shadowAvgWorstRDelta,
        shadow_stop_hit_rate_delta:
          input.outcome_learning?.shadow_entry_trial.stop_hit_rate_delta ??
          null,
        shadow_risk_warning_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_warning_count ?? null,
        shadow_risk_warning_rate: shadowRiskWarningRate,
        shadow_risk_too_tight_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_too_tight_count ?? null,
        shadow_risk_too_wide_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_too_wide_count ?? null,
        shadow_risk_model_invalid_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_model_invalid_count ?? null,
        shadow_risk_model_invalid_rate:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_model_invalid_rate ?? null,
        long_stop_above_or_equal_shadow_entry_count:
          input.outcome_learning?.shadow_entry_trial
            .long_stop_above_or_equal_shadow_entry_count ?? null,
        short_stop_below_or_equal_shadow_entry_count:
          input.outcome_learning?.shadow_entry_trial
            .short_stop_below_or_equal_shadow_entry_count ?? null,
        valid_shadow_risk_sample_count:
          input.outcome_learning?.shadow_entry_trial
            .valid_shadow_risk_sample_count ?? null,
        shadow_triggered_no_followthrough_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_triggered_no_followthrough_count ?? null,
        shadow_triggered_no_followthrough_rate:
          input.outcome_learning?.shadow_entry_trial
            .shadow_triggered_no_followthrough_rate ?? null,
        shadow_avg_time_to_entry_minutes:
          input.outcome_learning?.shadow_entry_trial
            .shadow_avg_time_to_entry_minutes ?? null,
        quality_adjusted_shadow_score:
          input.outcome_learning?.shadow_entry_trial
            .quality_adjusted_shadow_score ?? null,
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
      severity:
        shadowQualityClassification === "promising" ||
        shadowQualityClassification === "not_enough_data"
          ? "info"
          : "warning",
      lines: [
        lineValue(
          "Variant",
          compact(input.outcome_learning?.shadow_entry_trial.variant, "none"),
        ),
        lineValue(
          "Quality classification",
          compact(shadowQualityClassification, "not_enough_data"),
        ),
        lineValue(
          "Operational state",
          shadowTrialState,
        ),
        lineValue(
          "Recommendation",
          compact(shadowRecommendation, "keep_collecting_data"),
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
          "Trigger delta",
          shadowTriggerDelta,
        ),
        lineValue(
          "Official vs shadow avg best/worst R",
          `${input.outcome_learning?.shadow_entry_trial.official_avg_best_r ?? "unknown"} / ${input.outcome_learning?.shadow_entry_trial.shadow_avg_best_r ?? "unknown"} best, ${input.outcome_learning?.shadow_entry_trial.official_avg_worst_r ?? "unknown"} / ${input.outcome_learning?.shadow_entry_trial.shadow_avg_worst_r ?? "unknown"} worst`,
        ),
        lineValue(
          "Avg best/worst R deltas",
          `${shadowAvgBestRDelta ?? "unknown"} / ${shadowAvgWorstRDelta ?? "unknown"}`,
        ),
        lineValue(
          "Risk warning count/rate",
          `${input.outcome_learning?.shadow_entry_trial.shadow_risk_warning_count ?? 0} / ${shadowRiskWarningRate ?? "unknown"}`,
        ),
        lineValue(
          "Valid / invalid risk samples",
          `${input.outcome_learning?.shadow_entry_trial.valid_shadow_risk_sample_count ?? 0} / ${input.outcome_learning?.shadow_entry_trial.shadow_risk_model_invalid_count ?? 0}`,
        ),
        lineValue(
          "Risk invalid rate",
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_model_invalid_rate ?? "unknown",
        ),
        lineValue(
          "Risk invalid reasons long/short",
          `${input.outcome_learning?.shadow_entry_trial.long_stop_above_or_equal_shadow_entry_count ?? 0} / ${input.outcome_learning?.shadow_entry_trial.short_stop_below_or_equal_shadow_entry_count ?? 0}`,
        ),
        lineValue(
          "Tight/wide risk warnings",
          `${input.outcome_learning?.shadow_entry_trial.shadow_risk_too_tight_count ?? 0} / ${input.outcome_learning?.shadow_entry_trial.shadow_risk_too_wide_count ?? 0}`,
        ),
        lineValue(
          "Triggered no follow-through",
          `${input.outcome_learning?.shadow_entry_trial.shadow_triggered_no_followthrough_count ?? 0} / ${input.outcome_learning?.shadow_entry_trial.shadow_triggered_no_followthrough_rate ?? "unknown"}`,
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
        shadow_quality_classification: shadowQualityClassification,
        shadow_quality_recommendation: shadowRecommendation,
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
        shadow_trigger_rate_delta: shadowTriggerDelta,
        shadow_target_hit_rate:
          input.outcome_learning?.shadow_entry_trial.shadow_target_hit_rate ??
          null,
        shadow_stop_hit_rate:
          input.outcome_learning?.shadow_entry_trial.shadow_stop_hit_rate ??
          null,
        shadow_neither_hit_rate:
          input.outcome_learning?.shadow_entry_trial.shadow_neither_hit_rate ??
          null,
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
        shadow_avg_best_r_delta: shadowAvgBestRDelta,
        shadow_avg_worst_r_delta: shadowAvgWorstRDelta,
        shadow_stop_hit_rate_delta:
          input.outcome_learning?.shadow_entry_trial.stop_hit_rate_delta ??
          null,
        shadow_risk_warning_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_warning_count ?? null,
        shadow_risk_warning_rate: shadowRiskWarningRate,
        shadow_risk_too_tight_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_too_tight_count ?? null,
        shadow_risk_too_wide_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_too_wide_count ?? null,
        shadow_risk_model_invalid_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_model_invalid_count ?? null,
        shadow_risk_model_invalid_rate:
          input.outcome_learning?.shadow_entry_trial
            .shadow_risk_model_invalid_rate ?? null,
        long_stop_above_or_equal_shadow_entry_count:
          input.outcome_learning?.shadow_entry_trial
            .long_stop_above_or_equal_shadow_entry_count ?? null,
        short_stop_below_or_equal_shadow_entry_count:
          input.outcome_learning?.shadow_entry_trial
            .short_stop_below_or_equal_shadow_entry_count ?? null,
        valid_shadow_risk_sample_count:
          input.outcome_learning?.shadow_entry_trial
            .valid_shadow_risk_sample_count ?? null,
        shadow_triggered_no_followthrough_count:
          input.outcome_learning?.shadow_entry_trial
            .shadow_triggered_no_followthrough_count ?? null,
        shadow_triggered_no_followthrough_rate:
          input.outcome_learning?.shadow_entry_trial
            .shadow_triggered_no_followthrough_rate ?? null,
        shadow_avg_time_to_entry_minutes:
          input.outcome_learning?.shadow_entry_trial
            .shadow_avg_time_to_entry_minutes ?? null,
        quality_adjusted_shadow_score:
          input.outcome_learning?.shadow_entry_trial
            .quality_adjusted_shadow_score ?? null,
        shadow_trial_sample_size:
          input.outcome_learning?.shadow_entry_trial.shadow_trial_sample_size ??
          null,
        shadow_sample_size:
          input.outcome_learning?.shadow_entry_trial.shadow_sample_size ?? null,
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
  const groupedWarnings = warningBuckets(input.warnings);
  const warningGroupText = (
    label: string,
    items: MarketDiagnosticsConsoleWarning[],
  ) =>
    [
      `${label}:`,
      ...(items.length === 0
        ? ["- None"]
        : items.map((item) => `- [${item.source}] ${item.message}`)),
    ].join("\n");

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
    "Warnings:",
    warningGroupText("Action needed", groupedWarnings.actionNeeded),
    "",
    warningGroupText("Informational", groupedWarnings.informational),
    "",
    warningGroupText("Expected state", groupedWarnings.expectedState),
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
  const groupedWarnings = warningBuckets(input.warnings);
  const warningGroupMarkdown = (
    label: string,
    items: MarketDiagnosticsConsoleWarning[],
  ) => [
    `## ${label}`,
    ...(items.length === 0
      ? ["- None"]
      : items.map((item) => `- [${item.source}] ${item.message}`)),
    "",
  ];

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
    ...warningGroupMarkdown("Action needed", groupedWarnings.actionNeeded),
    ...warningGroupMarkdown("Informational", groupedWarnings.informational),
    ...warningGroupMarkdown("Expected state", groupedWarnings.expectedState),
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
