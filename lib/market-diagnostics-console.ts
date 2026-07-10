import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";
import type { DailyRecommendationTradeTargetsSummary } from "@/lib/daily-recommendation-trade-targets";
import type { DayTradeWindowRecommendationTargetSummary } from "@/lib/day-trade-window-recommendation-target";
import type { DynamicMoversDiscoverySummary } from "@/lib/dynamic-movers-discovery";
import { buildDynamicMoversReadiness } from "@/lib/dynamic-movers-readiness";
import { buildDynamicMoversShadowAudit } from "@/lib/dynamic-movers-shadow-fixture";
import type { DynamicMarketMoversSummary } from "@/lib/dynamic-market-movers";
import { buildEnvironmentBoundaryAudit } from "@/lib/environment-boundary-audit";
import type { MarketSessionEvaluation, MarketSessionStatus } from "@/lib/market-session";
import type { ProviderBudgetGuardSummary } from "@/lib/provider-budget-guard";
import type { ProviderPlanProfile } from "@/lib/provider-plan-profile";
import type { RealRecommendationOutputReadinessSummary } from "@/lib/real-recommendation-output-readiness";
import type { RecommendationBatchSummary } from "@/lib/recommendation-batch-memory";
import type { RecommendationEngineControlCenterSummary } from "@/lib/recommendation-engine-control-center";
import type { EntryTuningProposal } from "@/lib/entry-tuning-proposal";
import type { DailyLearningReviewSummary } from "@/lib/daily-learning-review";
import { buildHistoricalBackfillDryRunPipeline } from "@/lib/historical-backfill-dry-run-pipeline";
import { buildHistoricalBackfillExecutionReadiness } from "@/lib/historical-backfill-execution-readiness";
import { buildHistoricalBackfillFetchPlan } from "@/lib/historical-backfill-fetch-planner";
import { buildFirstTinyHistoricalFetchApproval } from "@/lib/first-tiny-historical-fetch-approval";
import { buildFirstTinyHistoricalFetchApprovalSignalReadiness } from "@/lib/first-tiny-historical-fetch-approval-signal-readiness";
import { buildFirstTinyHistoricalFetchExecutionPlan } from "@/lib/first-tiny-historical-fetch-execution-plan";
import { buildFirstTinyHistoricalFetchFinalPreflight } from "@/lib/first-tiny-historical-fetch-final-preflight";
import { buildFirstTinyHistoricalFetchNoPersistResultVerification } from "@/lib/first-tiny-historical-fetch-no-persist-result-verification";
import { buildFirstTinyHistoricalFetchOperatorApproval } from "@/lib/first-tiny-historical-fetch-operator-approval";
import { buildFirstTinyHistoricalFetchProviderDryExecute } from "@/lib/first-tiny-historical-fetch-provider-dry-execute";
import { buildFirstTinyHistoricalFetchRequestPreview } from "@/lib/first-tiny-historical-fetch-request-preview";
import { buildFirstTinyCorrectedPayloadRefetchApproval } from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-approval";
import { buildFirstTinyCorrectedPayloadRefetchExecuteReadiness } from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-execute";
import { buildFirstTinyHistoricalCandlePersistenceDryRunPlan } from "@/lib/first-tiny-historical-candle-persistence-dry-run-plan";
import { buildFirstTinyCorrectedCandlePayloadRefetchPlan } from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-plan";
import { buildFirstTinyHistoricalCandlePayloadRefetchExecuteReadiness } from "@/lib/first-tiny-historical-candle-payload-refetch-execute";
import { buildFirstTinyHistoricalCandlePayloadRefetchPlan } from "@/lib/first-tiny-historical-candle-payload-refetch-plan";
import { buildFirstTinyCandlePayloadRefetchResultVerification } from "@/lib/first-tiny-historical-candle-payload-refetch-result-verification";
import { buildFirstTinyCandlePayloadWindowSanityReview } from "@/lib/first-tiny-historical-candle-payload-window-sanity-review";
import { buildFirstTinyCandlePersistenceApproval } from "@/lib/first-tiny-historical-candle-persistence-approval";
import { buildFirstTinyCandlePersistenceExecuteReadiness } from "@/lib/first-tiny-historical-candle-persistence-execute";
import { buildFirstTinyCandlePersistenceReadbackVerificationReadiness } from "@/lib/first-tiny-historical-candle-persistence-readback-verification";
import { buildFirstTinyCandlePersistenceResultVerification } from "@/lib/first-tiny-historical-candle-persistence-result-verification";
import { buildFirstTinyCorrectedOhlcvPayloadStaticCapture } from "@/lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import { buildFirstTinyCorrectedPayloadRefetchResultVerification } from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-result-verification";
import { buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan } from "@/lib/first-tiny-historical-candle-executable-persistence-dry-run-plan";
import { buildFirstTinyHistoricalReplayDryRunApproval } from "@/lib/first-tiny-historical-replay-dry-run-approval";
import { buildFirstTinyHistoricalReplayDryRunExecuteReadiness } from "@/lib/first-tiny-historical-replay-dry-run-execute";
import { buildFirstTinyHistoricalReplayDryRunPlan } from "@/lib/first-tiny-historical-replay-dry-run-plan";
import { buildFirstTinyHistoricalReplayDryRunResultVerification } from "@/lib/first-tiny-historical-replay-dry-run-result-verification";
import { buildFirstTinyHistoricalReplaySignalPackageDiscoveryPlan } from "@/lib/first-tiny-historical-replay-signal-package-discovery-plan";
import { buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadback } from "@/lib/first-tiny-historical-replay-signal-package-discovery-readback";
import { buildAction308MinimalReplayWithSignalPackagePing } from "@/lib/action-308-minimal-replay-with-signal-package-ping";
import { buildFirstTinyFetchRunAuditWriteApproval } from "@/lib/first-tiny-historical-fetch-run-audit-write-approval";
import { buildFirstTinyFetchRunAuditWriteExecuteReadiness } from "@/lib/first-tiny-historical-fetch-run-audit-write-execute";
import { buildFirstTinyHistoricalFetchRunAuditWritePlan } from "@/lib/first-tiny-historical-fetch-run-audit-write-plan";
import { buildFirstTinyFetchRunAuditWriteResultVerification } from "@/lib/first-tiny-historical-fetch-run-audit-write-result-verification";
import { buildHistoricalCandlePersistencePlan } from "@/lib/historical-candle-persistence-plan";
import { buildHistoricalCandleCacheReadiness } from "@/lib/historical-candle-cache";
import { buildHistoricalCandleStorageReadiness } from "@/lib/historical-candle-storage-readiness";
import { buildHistoricalLearningBackfillReadiness } from "@/lib/historical-learning-backfill-readiness";
import { buildTwelveDataHistoricalFetchContract } from "@/lib/twelve-data-historical-fetch-contract";
import { buildTwelveDataHistoricalResponseParserReadiness } from "@/lib/twelve-data-historical-response-parser";
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
  type LearningAccelerationResearchSkipExample,
  type LearningAccelerationResearchSkipReason,
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
  historical_candle_storage_detection?: {
    historical_candles_table_detected?: boolean | null;
    historical_candle_fetch_runs_table_detected?: boolean | null;
    expected_unique_key_detected?: boolean | null;
    expected_indexes_detected?: boolean | null;
    rls_enabled_detected?: boolean | null;
    client_write_policies_detected?: boolean | null;
    client_read_policies_detected?: boolean | null;
    schema_readback_attempted?: boolean | null;
    schema_readback_status?: "ok" | "partial" | "blocked" | "unavailable" | null;
    schema_readback_missing_items?: string[] | null;
    schema_readback_warnings?: string[] | null;
    detection_source?: string | null;
    checked_at?: string | null;
    error_message?: string | null;
  } | null;
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
    below_threshold_readback_count?: number | null;
    below_threshold_runtime_input_count?: number | null;
    below_threshold_examples_count?: number | null;
    research_candidates_after_ticker_match?: number | null;
    research_persist_attempted?: number | null;
    research_persisted?: number | null;
    research_duplicates?: number | null;
    research_skipped_invalid?: number | null;
    research_skipped_stale?: number | null;
    research_skipped_budget?: number | null;
    research_skipped_missing_candidate_match?: number | null;
    learning_acceleration_research_hard_invalid?: number | null;
    learning_acceleration_research_soft_gaps_persisted?: number | null;
    learning_acceleration_research_stale_blocked?: number | null;
    learning_acceleration_research_skip_reason_counts?: Partial<
      Record<LearningAccelerationResearchSkipReason, number>
    > | null;
    learning_acceleration_research_soft_gap_reason_counts?: Partial<
      Record<LearningAccelerationResearchSkipReason, number>
    > | null;
    learning_acceleration_research_top_skip_examples?:
      | LearningAccelerationResearchSkipExample[]
      | null;
    learning_acceleration_research_top_soft_gap_examples?:
      | LearningAccelerationResearchSkipExample[]
      | null;
    learning_acceleration_candidate_universe_count?: number | null;
    learning_acceleration_candidate_universe_missing?: boolean | null;
    learning_acceleration_ticker_matching_failed?: boolean | null;
    learning_acceleration_callsite_trace?: {
      callsite_name?: string | null;
      candidate_universe_count?: number | null;
      ranked_candidate_count?: number | null;
      selected_build_diagnostics_count?: number | null;
      selected_to_built_drop_off_below_threshold_count?: number | null;
      rejection_examples_count?: number | null;
      batch_fingerprint_present?: boolean | null;
      scan_run_id_present?: boolean | null;
      persist_function_invoked?: boolean | null;
    } | null;
    learning_acceleration_callsite_mismatch?: boolean | null;
    expected_below_threshold_from_timeline?: number | null;
    actual_below_threshold_received_by_persistence?: number | null;
    candidate_universe_received_by_persistence?: number | null;
    learning_acceleration_input_source?: string | null;
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
    pre_filter_eligible_snapshot_count?: number | null;
    final_evaluation_eligible_snapshot_count?: number | null;
    post_eligibility_block_reasons?: Record<string, number>;
    candle_request_planning_block_reasons?: Record<string, number>;
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
  daily_learning_review?: DailyLearningReviewSummary | null;
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

function formatReasonCounts(
  counts:
    | Partial<Record<LearningAccelerationResearchSkipReason, number>>
    | null
    | undefined,
) {
  const entries = Object.entries(counts ?? {})
    .filter(([, value]) => typeof value === "number" && value > 0)
    .sort((first, second) => Number(second[1]) - Number(first[1]))
    .slice(0, 6);

  return entries.length > 0
    ? entries.map(([reason, value]) => `${reason}:${value}`).join(", ")
    : "none";
}

function formatResearchExamples(
  examples: LearningAccelerationResearchSkipExample[] | null | undefined,
) {
  const items = (examples ?? []).slice(0, 5);

  return items.length > 0
    ? items
        .map(
          (example) =>
            `${example.ticker}:${example.reason} (${example.available_fields_summary})`,
        )
        .join(" | ")
    : "none";
}

function rValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`
    : "unknown";
}

function reviewTickerText(
  tickers:
    | Array<{
        ticker: string;
        outcome_count: number;
        average_best_r: number | null;
        average_worst_r: number | null;
      }>
    | null
    | undefined,
  metric: "best" | "worst",
) {
  const items = (tickers ?? []).slice(0, 5);

  return items.length > 0
    ? items
        .map((item) => {
          const value =
            metric === "best" ? item.average_best_r : item.average_worst_r;

          return `${item.ticker} ${rValue(value)} (${item.outcome_count})`;
        })
        .join(", ")
    : "none";
}

function adjustmentText(
  adjustments: DailyLearningReviewSummary["engine_adjustment_candidates"] | null | undefined,
) {
  const items = (adjustments ?? []).slice(0, 5);

  return items.length > 0
    ? items
        .map(
          (item) =>
            `${item.candidate} (${item.confidence}): ${item.reason}`,
        )
        .join(" | ")
    : "none";
}

function setupMixText(
  mix: Partial<Record<string, number>> | null | undefined,
) {
  const entries = Object.entries(mix ?? {})
    .filter(([, value]) => typeof value === "number" && value > 0)
    .sort((first, second) => Number(second[1]) - Number(first[1]))
    .slice(0, 6);

  return entries.length > 0
    ? entries.map(([family, value]) => `${family} ${value}`).join(", ")
    : "none";
}

function setupGapText(gaps: Record<string, number> | null | undefined) {
  const entries = Object.entries(gaps ?? {})
    .filter(([, value]) => value > 0)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 6);

  return entries.length > 0
    ? entries.map(([gap, value]) => `${gap}:${value}`).join(", ")
    : "none";
}

function setupFamilyBreakdownText(
  items: DailyLearningReviewSummary["setup_family_breakdowns"] | null | undefined,
) {
  const summaries = (items ?? []).slice(0, 5);

  return summaries.length > 0
    ? summaries
        .map(
          (item) =>
            `${item.setup_family} ${item.outcome_count} v/r/u=${item.visible_count}/${item.research_only_count}/${item.unknown_visibility_count} (${item.sample_confidence}) best=${rValue(item.average_best_r)} worst=${rValue(item.average_worst_r)}`,
        )
        .join(" | ")
    : "none";
}

function dimensionBreakdownText(
  items:
    | Array<{
        key: string;
        outcome_count: number;
        visible_count: number;
        research_only_count: number;
        unknown_visibility_count: number;
        average_best_r: number | null;
        average_worst_r: number | null;
        sample_confidence?: string | null;
      }>
    | null
    | undefined,
) {
  const summaries = (items ?? []).slice(0, 5);

  return summaries.length > 0
    ? summaries
        .map(
          (item) =>
            `${item.key} ${item.outcome_count} v/r/u=${item.visible_count}/${item.research_only_count}/${item.unknown_visibility_count} best=${rValue(item.average_best_r)} worst=${rValue(item.average_worst_r)}`,
        )
        .join(" | ")
    : "none";
}

function sectorGroupBreakdownText(
  items: DailyLearningReviewSummary["sector_group_breakdowns"] | null | undefined,
) {
  const summaries = (items ?? []).slice(0, 5);

  return summaries.length > 0
    ? summaries
        .map(
          (item) =>
            `${item.sector_group} ${item.outcome_count} v/r/u=${item.visible_count}/${item.research_only_count}/${item.unknown_visibility_count} (${item.sample_confidence}) best=${rValue(item.average_best_r)} worst=${rValue(item.average_worst_r)}`,
        )
        .join(" | ")
    : "none";
}

function sectorRankText(
  items:
    | Array<{
        sector_group: string;
        outcome_count: number;
        average_best_r: number | null;
        average_worst_r: number | null;
        sample_confidence?: string | null;
      }>
    | null
    | undefined,
  metric: "best" | "worst",
) {
  const summaries = (items ?? []).slice(0, 5);

  return summaries.length > 0
    ? summaries
        .map((item) => {
          const value =
            metric === "best" ? item.average_best_r : item.average_worst_r;

          return `${item.sector_group} ${rValue(value)} (${item.outcome_count}, ${item.sample_confidence ?? "low"})`;
        })
        .join(", ")
    : "none";
}

function tickerProfileRankText(
  profiles:
    | Array<{
        ticker: string;
        outcome_count: number;
        avg_best_r: number | null;
        avg_worst_r: number | null;
        sample_confidence?: string | null;
      }>
    | null
    | undefined,
  metric: "best" | "worst",
) {
  const items = (profiles ?? []).slice(0, 5);

  return items.length > 0
    ? items
        .map((item) => {
          const value = metric === "best" ? item.avg_best_r : item.avg_worst_r;

          return `${item.ticker} ${rValue(value)} (${item.outcome_count}, ${item.sample_confidence ?? "low"})`;
        })
        .join(", ")
    : "none";
}

function tickerListText(tickers: string[] | null | undefined) {
  const items = (tickers ?? []).slice(0, 10);

  return items.length > 0 ? items.join(", ") : "none";
}

function compactListText(values: string[] | null | undefined) {
  const items = (values ?? []).filter((value) => value.trim().length > 0).slice(0, 8);

  return items.length > 0 ? items.join(", ") : "none";
}

function readinessSectorCoverageText(
  coverage:
    | DailyLearningReviewSummary["ticker_universe_readiness"]["sector_coverage"]
    | null
    | undefined,
) {
  if (!coverage) return "none";

  const observed = coverage.sectors_observed
    .slice(0, 6)
    .map((item) => `${item.sector} ${item.count}`)
    .join(", ");

  return [
    `observed ${observed || "none"}`,
    `positive ${compactListText(coverage.sectors_with_positive_signal)}`,
    `negative ${compactListText(coverage.sectors_with_negative_signal)}`,
    `needs data ${compactListText(coverage.sectors_needing_more_data)}`,
  ].join(" / ");
}

function regimeEvidenceText(
  evidence:
    | {
        negative_momentum_count?: number;
        positive_momentum_count?: number;
        choppy_structure_count?: number;
        strong_trend_count?: number;
        stale_data_count?: number;
        strong_candidate_count?: number;
        valid_candidate_count?: number;
        experimental_candidate_count?: number;
        no_trade_candidate_count?: number;
        volatility_signal?: string | null;
      }
    | null
    | undefined,
) {
  if (!evidence) return "none";

  return [
    `neg=${evidence.negative_momentum_count ?? 0}`,
    `pos=${evidence.positive_momentum_count ?? 0}`,
    `chop=${evidence.choppy_structure_count ?? 0}`,
    `trend=${evidence.strong_trend_count ?? 0}`,
    `stale=${evidence.stale_data_count ?? 0}`,
    `strong/valid/experimental=${evidence.strong_candidate_count ?? 0}/${evidence.valid_candidate_count ?? 0}/${evidence.experimental_candidate_count ?? 0}`,
    `vol=${evidence.volatility_signal ?? "unknown"}`,
  ].join(", ");
}

function qualityMixText(
  mix: Partial<Record<string, number>> | null | undefined,
) {
  const source = mix ?? {};
  return `weak ${source.weak ?? 0}, fair ${source.fair ?? 0}, good ${source.good ?? 0}, strong ${source.strong ?? 0}, unknown ${source.unknown ?? 0}`;
}

function qualityGroupText(
  groups:
    | Array<{
        key: string;
        outcome_count: number;
        average_quality_score: number | null;
        average_quality_label: string;
      }>
    | null
    | undefined,
) {
  const items = (groups ?? []).slice(0, 5);

  return items.length > 0
    ? items
        .map((item) => {
          const score =
            typeof item.average_quality_score === "number"
              ? `${item.average_quality_score.toFixed(0)}`
              : "unknown";

          return `${item.key} ${item.average_quality_label} ${score} (${item.outcome_count})`;
        })
        .join(" | ")
    : "none";
}

function confidenceBucketMixText(
  buckets:
    | Array<{ bucket: string; outcome_count: number }>
    | null
    | undefined,
) {
  const items = (buckets ?? [])
    .filter((item) => item.outcome_count > 0)
    .map((item) => `${item.bucket} ${item.outcome_count}`);

  return items.length > 0 ? items.join(", ") : "none";
}

function confidenceBucketPerformanceText(
  buckets:
    | Array<{
        bucket: string;
        outcome_count: number;
        avg_best_r: number | null;
        avg_worst_r: number | null;
        calibration_label: string;
      }>
    | null
    | undefined,
) {
  const items = (buckets ?? [])
    .filter((item) => item.outcome_count > 0)
    .slice(0, 6);

  return items.length > 0
    ? items
        .map(
          (item) =>
            `${item.bucket} ${rValue(item.avg_best_r)}/${rValue(item.avg_worst_r)} ${item.calibration_label}`,
        )
        .join(" | ")
    : "none";
}

function confidenceMonotonicityText(
  value: boolean | null | undefined,
) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "inconclusive";
}

function governanceLayerText(values: string[] | null | undefined) {
  const items = (values ?? []).slice(0, 10);
  return items.length > 0 ? items.join(", ") : "none";
}

function governanceChangeCountsText(
  summary:
    | {
        active_count?: number;
        advisory_only_count?: number;
        shadow_testing_count?: number;
        rejected_count?: number;
        rolled_back_count?: number;
      }
    | null
    | undefined,
) {
  return `${summary?.active_count ?? 0}/${summary?.advisory_only_count ?? 0}/${summary?.shadow_testing_count ?? 0}/${summary?.rejected_count ?? 0}/${summary?.rolled_back_count ?? 0}`;
}

function governancePromotionGatesText(values: string[] | null | undefined) {
  const items = values ?? [];
  if (items.length === 0) return "none";

  return items
    .map((item) => item.replace(/^minimum_/, "minimum ").replaceAll("_", " "))
    .slice(0, 6)
    .join(", ");
}

function intelligenceFocusText(values: string[] | null | undefined) {
  const items = (values ?? []).slice(0, 8);
  return items.length > 0 ? items.join(", ") : "none";
}

function intelligenceLayerText(values: string[] | null | undefined) {
  const items = (values ?? []).slice(0, 10);
  return items.length > 0 ? items.join(", ") : "none";
}

function intelligenceMixText(
  mix: Record<string, number> | null | undefined,
  limit = 5,
) {
  const items = Object.entries(mix ?? {})
    .filter(([, count]) => count > 0)
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit)
    .map(([key, count]) => `${key} ${count}`);

  return items.length > 0 ? items.join(", ") : "none";
}

function intelligenceYesNo(value: boolean | null | undefined) {
  return value === true ? "yes" : "no";
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

function yesNoUnknown(value: boolean | "unknown" | null | undefined) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "unknown";
}

function historicalProviderEnvPresentSignal(
  input: MarketDiagnosticsConsoleInput,
): boolean | "unknown" {
  const status = String(
    input.live_market_trial_readiness.provider_env_readiness
      ?.server_secret_status ?? "",
  )
    .trim()
    .toLowerCase();

  if (
    status.includes("available") ||
    status.includes("configured") ||
    status.includes("present")
  ) {
    return true;
  }

  if (
    status.includes("missing") ||
    status.includes("unavailable") ||
    status.includes("not_configured") ||
    status.includes("absent")
  ) {
    return false;
  }

  return "unknown";
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
  const selectedDropOffTimelineEntry =
    latestReviewBatchAttempt ??
    scheduledScanTimelineToday.find(
      (attempt) =>
        (batchCandidateAudit.scan_run_fingerprint !== null &&
          attempt.scan_run_fingerprint ===
            batchCandidateAudit.scan_run_fingerprint) ||
        (batchCandidateAudit.batch_fingerprint !== null &&
          attempt.batch_fingerprint === batchCandidateAudit.batch_fingerprint),
    ) ??
    latestScheduledBuildRejectionAttempt ??
    null;
  const selectedDropOffScanRun =
    selectedDropOffTimelineEntry?.scan_run_fingerprint ??
    batchCandidateAudit.scan_run_fingerprint ??
    null;
  const selectedDropOffBatch =
    selectedDropOffTimelineEntry?.batch_fingerprint ??
    batchCandidateAudit.batch_fingerprint ??
    reviewBatchFingerprint ??
    null;
  const latestOfficialBatchLearningAccelerationTrace =
    selectedDropOffTimelineEntry?.active_scan_trace ?? null;
  const latestActiveLearningAccelerationTrace = input.active_scan_trace ?? null;
  const hasSelectedDropOffScope =
    selectedDropOffScanRun !== null ||
    selectedDropOffBatch !== null ||
    selectedToBuiltDropOff !== null;
  const learningAccelerationTrace =
    latestOfficialBatchLearningAccelerationTrace ??
    (hasSelectedDropOffScope ? null : latestActiveLearningAccelerationTrace);
  const learningAccelerationTraceSource =
    latestOfficialBatchLearningAccelerationTrace
      ? "latest_official_batch_la"
      : hasSelectedDropOffScope
        ? "official_batch_trace_missing"
        : latestActiveLearningAccelerationTrace
          ? "latest_active_trace_la"
          : "none";
  const learningAccelerationTraceScanRun =
    learningAccelerationTrace?.final.scan_run_fingerprint ?? null;
  const learningAccelerationTraceBatch =
    learningAccelerationTrace?.final.batch_fingerprint ?? null;
  const learningAccelerationTraceMatchesSelectedDropOff =
    learningAccelerationTrace !== null &&
    ((selectedDropOffScanRun !== null &&
      learningAccelerationTraceScanRun === selectedDropOffScanRun) ||
      (selectedDropOffBatch !== null &&
        learningAccelerationTraceBatch === selectedDropOffBatch));
  const selectedDropOffBelowThresholdCount =
    selectedToBuiltDropOff?.rejection_counts.below_publish_threshold ?? 0;
  const callsiteTraceMissingForOfficialScanRun =
    selectedDropOffBelowThresholdCount > 0 &&
    hasSelectedDropOffScope &&
    latestOfficialBatchLearningAccelerationTrace
      ?.learning_acceleration_callsite_trace == null;
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
  const environmentBoundaryAudit = buildEnvironmentBoundaryAudit();
  const scannerUniverseAny = input.scanner_universe as unknown as {
    selected_ticker_symbols?: string[] | null;
    context_ticker_symbols?: string[] | null;
    total_universe_size?: number | null;
    selected_tickers?: number | string[] | null;
  };
  const scannerUniverseSymbols =
    scannerUniverseAny.selected_ticker_symbols ??
    (Array.isArray(scannerUniverseAny.selected_tickers)
      ? scannerUniverseAny.selected_tickers
      : []);
  const dynamicMoversReadiness = buildDynamicMoversReadiness({
    dynamic_movers: input.dynamic_movers ?? null,
    dynamic_movers_discovery: dynamicMoversDiscovery,
    ticker_universe_readiness:
      input.daily_learning_review?.ticker_universe_readiness ?? null,
    static_universe_count:
      input.daily_learning_review?.ticker_universe_readiness.universe_status
        .configured_static_universe_count ??
      scannerUniverseAny.total_universe_size ??
      (typeof scannerUniverseAny.selected_tickers === "number"
        ? scannerUniverseAny.selected_tickers
        : scannerUniverseSymbols.length),
    static_universe_symbols: scannerUniverseSymbols,
    visible_tickers:
      input.daily_learning_review?.ticker_universe_readiness
        .ticker_classification.core_candidates ?? [],
  });
  const dynamicMoversShadowAudit = buildDynamicMoversShadowAudit({
    ticker_universe_readiness:
      input.daily_learning_review?.ticker_universe_readiness ?? null,
    static_universe_count:
      dynamicMoversReadiness.static_universe_comparison.static_universe_count,
    static_universe_symbols: scannerUniverseSymbols,
    research_heavy_tickers:
      input.daily_learning_review?.ticker_universe_readiness
        .ticker_classification.research_heavy_candidates ?? [],
    visible_tickers: scannerUniverseSymbols,
    observed_tickers:
      input.daily_learning_review?.ticker_universe_readiness.ticker_metrics.map(
        (metric) => metric.ticker,
      ) ?? [],
    now: input.market_session.evaluated_at,
  });
  const historicalBackfillReadiness =
    buildHistoricalLearningBackfillReadiness({
      provider_plan_profile: input.provider_plan_profile ?? null,
      provider_budget_guard: input.provider_budget_guard,
      ticker_universe_readiness:
        input.daily_learning_review?.ticker_universe_readiness ?? null,
    });
  const historicalCandleCacheReadiness =
    buildHistoricalCandleCacheReadiness();
  const historicalCandleStorageReadiness =
    buildHistoricalCandleStorageReadiness({
      migration_detection: input.historical_candle_storage_detection ?? null,
    });
  const historicalBackfillFetchPlan = buildHistoricalBackfillFetchPlan({
    provider_plan_profile: input.provider_plan_profile ?? null,
    provider_budget_guard: input.provider_budget_guard,
    ticker_universe_readiness:
      input.daily_learning_review?.ticker_universe_readiness ?? null,
    ticker_profiles: input.daily_learning_review?.ticker_profiles ?? null,
    ticker_profile_summary:
      input.daily_learning_review?.ticker_profile_summary ?? null,
    visible_recent_tickers: scannerUniverseSymbols,
    static_universe_tickers: scannerUniverseSymbols,
    migration_applied:
      historicalCandleStorageReadiness.migration_readiness.migration_applied,
  });
  const twelveDataHistoricalFetchContract =
    buildTwelveDataHistoricalFetchContract({
      historical_backfill_fetch_plan: historicalBackfillFetchPlan,
      now: input.market_session.evaluated_at,
    });
  const twelveDataHistoricalResponseParser =
    buildTwelveDataHistoricalResponseParserReadiness();
  const historicalCandlePersistencePlan =
    buildHistoricalCandlePersistencePlan({
      candles: twelveDataHistoricalResponseParser.candles,
      storage_readiness: historicalCandleStorageReadiness,
      fetch_run_metadata: {
        provider_credits_estimated:
          twelveDataHistoricalFetchContract.budget_policy
          .estimated_provider_credits,
      },
    });
  const historicalBackfillDryRunPipeline =
    buildHistoricalBackfillDryRunPipeline({
      fetch_plan: historicalBackfillFetchPlan,
      storage_readiness: historicalCandleStorageReadiness,
      now: input.market_session.evaluated_at,
    });
  const historicalBackfillExecutionReadiness =
    buildHistoricalBackfillExecutionReadiness({
      storage_readiness: historicalCandleStorageReadiness,
      fetch_plan: historicalBackfillFetchPlan,
      dry_run_pipeline: historicalBackfillDryRunPipeline,
      provider_env_present: historicalProviderEnvPresentSignal(input),
    });
  const firstTinyHistoricalFetchApproval =
    buildFirstTinyHistoricalFetchApproval({
      storage_readiness: historicalCandleStorageReadiness,
      execution_readiness: historicalBackfillExecutionReadiness,
    });
  const firstTinyHistoricalFetchRequestPreview =
    buildFirstTinyHistoricalFetchRequestPreview({
      approval: firstTinyHistoricalFetchApproval,
      twelve_data_historical_fetch_contract: twelveDataHistoricalFetchContract,
    });
  const firstTinyHistoricalFetchOperatorApproval =
    buildFirstTinyHistoricalFetchOperatorApproval({
      approval: firstTinyHistoricalFetchApproval,
      request_preview: firstTinyHistoricalFetchRequestPreview,
      execution_readiness: historicalBackfillExecutionReadiness,
    });
  const firstTinyHistoricalFetchExecutionPlan =
    buildFirstTinyHistoricalFetchExecutionPlan({
      operator_approval: firstTinyHistoricalFetchOperatorApproval,
      request_preview: firstTinyHistoricalFetchRequestPreview,
    });
  const firstTinyHistoricalFetchApprovalSignalReadiness =
    buildFirstTinyHistoricalFetchApprovalSignalReadiness({
      operator_approval: firstTinyHistoricalFetchOperatorApproval,
      request_preview: firstTinyHistoricalFetchRequestPreview,
      execution_plan: firstTinyHistoricalFetchExecutionPlan,
    });
  const firstTinyHistoricalFetchFinalPreflight =
    buildFirstTinyHistoricalFetchFinalPreflight({
      storage_readiness: historicalCandleStorageReadiness,
      execution_readiness: historicalBackfillExecutionReadiness,
      approval: firstTinyHistoricalFetchApproval,
      request_preview: firstTinyHistoricalFetchRequestPreview,
      operator_approval: firstTinyHistoricalFetchOperatorApproval,
      execution_plan: firstTinyHistoricalFetchExecutionPlan,
      approval_signal_readiness: firstTinyHistoricalFetchApprovalSignalReadiness,
    });
  const firstTinyHistoricalFetchProviderDryExecute =
    buildFirstTinyHistoricalFetchProviderDryExecute({
      final_preflight: firstTinyHistoricalFetchFinalPreflight,
      approval_signal_readiness: firstTinyHistoricalFetchApprovalSignalReadiness,
      request_preview: firstTinyHistoricalFetchRequestPreview,
      execution_plan: firstTinyHistoricalFetchExecutionPlan,
      storage_readiness: historicalCandleStorageReadiness,
    });
  const firstTinyHistoricalFetchNoPersistVerification =
    buildFirstTinyHistoricalFetchNoPersistResultVerification();
  const firstTinyHistoricalFetchRunAuditWritePlan =
    buildFirstTinyHistoricalFetchRunAuditWritePlan({
      migration_detection: input.historical_candle_storage_detection ?? null,
    });
  const firstTinyFetchRunAuditWriteApproval =
    buildFirstTinyFetchRunAuditWriteApproval({
      audit_write_plan: firstTinyHistoricalFetchRunAuditWritePlan,
    });
  const firstTinyFetchRunAuditWriteExecute =
    buildFirstTinyFetchRunAuditWriteExecuteReadiness({
      audit_write_plan: firstTinyHistoricalFetchRunAuditWritePlan,
    });
  const firstTinyFetchRunAuditWriteResultVerification =
    buildFirstTinyFetchRunAuditWriteResultVerification();
  const firstTinyHistoricalCandlePersistenceDryRunPlan =
    buildFirstTinyHistoricalCandlePersistenceDryRunPlan();
  const firstTinyHistoricalCandlePayloadRefetchPlan =
    buildFirstTinyHistoricalCandlePayloadRefetchPlan({
      candle_persistence_plan: firstTinyHistoricalCandlePersistenceDryRunPlan,
    });
  const firstTinyHistoricalCandlePayloadRefetchExecute =
    buildFirstTinyHistoricalCandlePayloadRefetchExecuteReadiness({
      refetch_plan: firstTinyHistoricalCandlePayloadRefetchPlan,
    });
  const firstTinyCandlePayloadRefetchResultVerification =
    buildFirstTinyCandlePayloadRefetchResultVerification();
  const firstTinyCandlePayloadWindowSanityReview =
    buildFirstTinyCandlePayloadWindowSanityReview(
      firstTinyCandlePayloadRefetchResultVerification,
    );
  const firstTinyCorrectedCandlePayloadRefetchPlan =
    buildFirstTinyCorrectedCandlePayloadRefetchPlan(
      firstTinyCandlePayloadRefetchResultVerification,
      firstTinyCandlePayloadWindowSanityReview,
    );
  const firstTinyCorrectedPayloadRefetchApproval =
    buildFirstTinyCorrectedPayloadRefetchApproval({
      window_review: firstTinyCandlePayloadWindowSanityReview,
      corrected_plan: firstTinyCorrectedCandlePayloadRefetchPlan,
    });
  const firstTinyCorrectedPayloadRefetchExecute =
    buildFirstTinyCorrectedPayloadRefetchExecuteReadiness({
      corrected_plan: firstTinyCorrectedCandlePayloadRefetchPlan,
      approval: firstTinyCorrectedPayloadRefetchApproval,
    });
  const firstTinyCorrectedPayloadRefetchResultVerification =
    buildFirstTinyCorrectedPayloadRefetchResultVerification();
  const firstTinyCorrectedOhlcvPayloadStaticCapture =
    buildFirstTinyCorrectedOhlcvPayloadStaticCapture();
  const firstTinyExecutableCandlePersistenceDryRunPlan =
    buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan({
      source_verification: firstTinyCorrectedPayloadRefetchResultVerification,
    });
  const firstTinyCandlePersistenceApproval =
    buildFirstTinyCandlePersistenceApproval({
      static_ohlcv_capture: firstTinyCorrectedOhlcvPayloadStaticCapture,
      dry_run_plan: firstTinyExecutableCandlePersistenceDryRunPlan,
    });
  const firstTinyCandlePersistenceExecute =
    buildFirstTinyCandlePersistenceExecuteReadiness({
      static_ohlcv_capture: firstTinyCorrectedOhlcvPayloadStaticCapture,
      dry_run_plan: firstTinyExecutableCandlePersistenceDryRunPlan,
      approval: firstTinyCandlePersistenceApproval,
    });
  const firstTinyCandlePersistenceReadbackVerification =
    buildFirstTinyCandlePersistenceReadbackVerificationReadiness();
  const firstTinyCandlePersistenceResultVerification =
    buildFirstTinyCandlePersistenceResultVerification();
  const firstTinyHistoricalReplayDryRunPlan =
    buildFirstTinyHistoricalReplayDryRunPlan({
      candle_persistence_result: firstTinyCandlePersistenceResultVerification,
    });
  const firstTinyHistoricalReplayDryRunApproval =
    buildFirstTinyHistoricalReplayDryRunApproval({
      replay_plan: firstTinyHistoricalReplayDryRunPlan,
    });
  const firstTinyHistoricalReplayDryRunExecute =
    buildFirstTinyHistoricalReplayDryRunExecuteReadiness({
      replay_plan: firstTinyHistoricalReplayDryRunPlan,
      approval: firstTinyHistoricalReplayDryRunApproval,
    });
  const firstTinyHistoricalReplayDryRunResultVerification =
    buildFirstTinyHistoricalReplayDryRunResultVerification();
  const firstTinyHistoricalReplaySignalPackageDiscoveryPlan =
    buildFirstTinyHistoricalReplaySignalPackageDiscoveryPlan({
      candle_persistence_result: firstTinyCandlePersistenceResultVerification,
      replay_result_verification:
        firstTinyHistoricalReplayDryRunResultVerification,
    });
  const firstTinyHistoricalReplaySignalPackageDiscoveryReadback =
    buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadback({
      replay_result_verification:
        firstTinyHistoricalReplayDryRunResultVerification,
      discovery_plan: firstTinyHistoricalReplaySignalPackageDiscoveryPlan,
    });
  const minimalReplayWithSignalPackagePing =
    buildAction308MinimalReplayWithSignalPackagePing();
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
      learningAccelerationTrace?.learning_acceleration_enabled === true ||
      input.active_scan_trace?.learning_acceleration_enabled === true ||
      input.outcome_evaluation?.learning_acceleration_enabled === true);
  const learningAccelerationMode =
    input.learning_acceleration_config?.learning_acceleration_mode ??
    input.scan_readback?.learning_acceleration_mode ??
    learningAccelerationTrace?.learning_acceleration_mode ??
    input.active_scan_trace?.learning_acceleration_mode ??
    input.outcome_evaluation?.learning_acceleration_mode ??
    learningAccelerationConfig.learning_acceleration_mode;
  const learningAccelerationSource =
    input.learning_acceleration_config?.learning_acceleration_enabled_source ??
    input.scan_readback?.learning_acceleration_enabled_source ??
    learningAccelerationTrace?.learning_acceleration_enabled_source ??
    input.active_scan_trace?.learning_acceleration_enabled_source ??
    input.outcome_evaluation?.learning_acceleration_enabled_source ??
    learningAccelerationConfig.learning_acceleration_enabled_source;
  const learningAccelerationEnvPresent =
    input.learning_acceleration_config?.learning_acceleration_env_raw_present ??
    input.scan_readback?.learning_acceleration_env_raw_present ??
    learningAccelerationTrace?.learning_acceleration_env_raw_present ??
    input.active_scan_trace?.learning_acceleration_env_raw_present ??
    input.outcome_evaluation?.learning_acceleration_env_raw_present ??
    learningAccelerationConfig.learning_acceleration_env_raw_present;
  const learningAccelerationEnvCategory =
    input.learning_acceleration_config
      ?.learning_acceleration_env_raw_value_category ??
    input.scan_readback?.learning_acceleration_env_raw_value_category ??
    learningAccelerationTrace?.learning_acceleration_env_raw_value_category ??
    input.active_scan_trace?.learning_acceleration_env_raw_value_category ??
    input.outcome_evaluation?.learning_acceleration_env_raw_value_category ??
    learningAccelerationConfig.learning_acceleration_env_raw_value_category;
  const learningAccelerationParsedEnabled =
    input.learning_acceleration_config
      ?.learning_acceleration_env_raw_value_normalized ??
    input.scan_readback?.learning_acceleration_env_raw_value_normalized ??
    learningAccelerationTrace?.learning_acceleration_env_raw_value_normalized ??
    input.active_scan_trace?.learning_acceleration_env_raw_value_normalized ??
    input.outcome_evaluation?.learning_acceleration_env_raw_value_normalized ??
    learningAccelerationConfig.learning_acceleration_env_raw_value_normalized;
  const learningAccelerationRuntimeEnvironment =
    input.learning_acceleration_config?.learning_acceleration_runtime_environment ??
    input.scan_readback?.learning_acceleration_runtime_environment ??
    learningAccelerationTrace?.learning_acceleration_runtime_environment ??
    input.active_scan_trace?.learning_acceleration_runtime_environment ??
    input.outcome_evaluation?.learning_acceleration_runtime_environment ??
    learningAccelerationConfig.learning_acceleration_runtime_environment;
  const learningAccelerationServerConfigUnavailable =
    learningAccelerationSource === "client_unavailable";
  const learningAccelerationSamplesCollectedToday =
    learningAccelerationTrace?.learning_acceleration_samples_collected_count ??
    input.scan_readback?.learning_acceleration_samples_collected_today ??
    0;
  const learningAccelerationSelectedBelowThreshold =
    learningAccelerationTrace
      ?.learning_acceleration_selected_below_threshold_count ??
    input.scan_readback?.learning_acceleration_selected_below_threshold_count ??
    0;
  const learningAccelerationBelowThresholdReadback =
    learningAccelerationTrace
      ?.learning_acceleration_selected_below_threshold_readback_count ??
    input.scan_readback
      ?.learning_acceleration_selected_below_threshold_readback_count ??
    learningAccelerationSelectedBelowThreshold;
  const learningAccelerationBelowThresholdPassed =
    learningAccelerationTrace
      ?.learning_acceleration_selected_below_threshold_passed_count ??
    input.scan_readback
      ?.learning_acceleration_selected_below_threshold_passed_count ??
    learningAccelerationSelectedBelowThreshold;
  const learningAccelerationBelowThresholdMatched =
    learningAccelerationTrace
      ?.learning_acceleration_selected_below_threshold_matched_by_ticker_count ??
    input.scan_readback
      ?.learning_acceleration_selected_below_threshold_matched_by_ticker_count ??
    0;
  const learningAccelerationBelowThresholdUnmatched =
    learningAccelerationTrace
      ?.learning_acceleration_selected_below_threshold_unmatched_by_ticker_count ??
    input.scan_readback
      ?.learning_acceleration_selected_below_threshold_unmatched_by_ticker_count ??
    0;
  const learningAccelerationInputMismatch =
    learningAccelerationTrace?.learning_acceleration_input_mismatch ??
    input.scan_readback?.learning_acceleration_input_mismatch ??
    false;
  const learningAccelerationInputSource =
    learningAccelerationTrace?.learning_acceleration_input_source ??
    input.scan_readback?.learning_acceleration_input_source ??
    "none";
  const learningAccelerationRuntimeInputCount =
    learningAccelerationTrace?.below_threshold_runtime_input_count ??
    input.scan_readback?.below_threshold_runtime_input_count ??
    learningAccelerationBelowThresholdPassed;
  const learningAccelerationExamplesCount =
    learningAccelerationTrace?.below_threshold_examples_count ??
    input.scan_readback?.below_threshold_examples_count ??
    0;
  const learningAccelerationMatchedCandidates =
    learningAccelerationTrace?.research_candidates_after_ticker_match ??
    input.scan_readback?.research_candidates_after_ticker_match ??
    learningAccelerationBelowThresholdMatched;
  const learningAccelerationPersistAttempted =
    learningAccelerationTrace?.research_persist_attempted ??
    input.scan_readback?.research_persist_attempted ??
    0;
  const learningAccelerationPersisted =
    learningAccelerationTrace?.research_persisted ??
    input.scan_readback?.research_persisted ??
    null;
  const learningAccelerationDuplicates =
    learningAccelerationTrace?.research_duplicates ??
    input.scan_readback?.research_duplicates ??
    0;
  const learningAccelerationSkippedInvalid =
    learningAccelerationTrace?.research_skipped_invalid ??
    learningAccelerationTrace
      ?.learning_acceleration_skipped_due_to_invalid_risk_count ??
    input.scan_readback?.research_skipped_invalid ??
    0;
  const learningAccelerationSkippedStale =
    learningAccelerationTrace?.research_skipped_stale ??
    learningAccelerationTrace
      ?.learning_acceleration_skipped_due_to_stale_reference_count ??
    input.scan_readback?.research_skipped_stale ??
    0;
  const learningAccelerationSkippedBudget =
    learningAccelerationTrace?.research_skipped_budget ??
    learningAccelerationTrace?.learning_acceleration_skipped_due_to_budget_count ??
    input.scan_readback?.research_skipped_budget ??
    input.outcome_evaluation?.skipped_due_to_budget_count ??
    0;
  const learningAccelerationResearchHardInvalid =
    learningAccelerationTrace?.learning_acceleration_research_hard_invalid_count ??
    input.scan_readback?.learning_acceleration_research_hard_invalid ??
    learningAccelerationSkippedInvalid;
  const learningAccelerationResearchSoftGapsPersisted =
    learningAccelerationTrace
      ?.learning_acceleration_research_soft_gaps_persisted_count ??
    input.scan_readback
      ?.learning_acceleration_research_soft_gaps_persisted ??
    0;
  const learningAccelerationResearchStaleBlocked =
    learningAccelerationTrace
      ?.learning_acceleration_research_stale_blocked_count ??
    input.scan_readback?.learning_acceleration_research_stale_blocked ??
    learningAccelerationSkippedStale;
  const learningAccelerationResearchSkipReasonCounts =
    learningAccelerationTrace
      ?.learning_acceleration_research_skip_reason_counts ??
    input.scan_readback?.learning_acceleration_research_skip_reason_counts ??
    {};
  const learningAccelerationResearchSoftGapReasonCounts =
    learningAccelerationTrace
      ?.learning_acceleration_research_soft_gap_reason_counts ??
    input.scan_readback
      ?.learning_acceleration_research_soft_gap_reason_counts ??
    {};
  const learningAccelerationResearchTopSkipExamples =
    learningAccelerationTrace?.learning_acceleration_research_top_skip_examples ??
    input.scan_readback?.learning_acceleration_research_top_skip_examples ??
    [];
  const learningAccelerationResearchTopSoftGapExamples =
    learningAccelerationTrace
      ?.learning_acceleration_research_top_soft_gap_examples ??
    input.scan_readback
      ?.learning_acceleration_research_top_soft_gap_examples ??
    [];
  const learningAccelerationSkippedMissingCandidate =
    learningAccelerationTrace?.research_skipped_missing_candidate_match ??
    input.scan_readback?.research_skipped_missing_candidate_match ??
    learningAccelerationBelowThresholdUnmatched;
  const learningAccelerationCandidateUniverseCount =
    learningAccelerationTrace?.learning_acceleration_candidate_universe_count ??
    input.scan_readback?.learning_acceleration_candidate_universe_count ??
    0;
  const learningAccelerationCandidateUniverseMissing =
    learningAccelerationTrace
      ?.learning_acceleration_candidate_universe_missing ??
    input.scan_readback?.learning_acceleration_candidate_universe_missing ??
    (learningAccelerationBelowThresholdReadback > 0 &&
      learningAccelerationCandidateUniverseCount === 0);
  const learningAccelerationTickerMatchingFailed =
    learningAccelerationTrace?.learning_acceleration_ticker_matching_failed ??
    input.scan_readback?.learning_acceleration_ticker_matching_failed ??
    (learningAccelerationRuntimeInputCount > 0 &&
      learningAccelerationCandidateUniverseCount > 0 &&
      learningAccelerationMatchedCandidates === 0);
  const learningAccelerationCallsiteTrace =
    learningAccelerationTrace?.learning_acceleration_callsite_trace ??
    input.scan_readback?.learning_acceleration_callsite_trace ??
    null;
  const learningAccelerationCallsiteMismatch =
    learningAccelerationTrace?.learning_acceleration_callsite_mismatch ??
    input.scan_readback?.learning_acceleration_callsite_mismatch ??
    false;
  const learningAccelerationExpectedBelowThreshold =
    learningAccelerationTrace
      ?.learning_acceleration_expected_below_threshold_from_timeline ??
    input.scan_readback?.expected_below_threshold_from_timeline ??
    learningAccelerationBelowThresholdReadback;
  const learningAccelerationActualBelowThresholdReceived =
    learningAccelerationTrace
      ?.learning_acceleration_actual_below_threshold_received_by_persistence ??
    input.scan_readback?.actual_below_threshold_received_by_persistence ??
    learningAccelerationBelowThresholdReadback;
  const learningAccelerationCandidateUniverseReceived =
    learningAccelerationTrace
      ?.learning_acceleration_candidate_universe_received_by_persistence ??
    input.scan_readback?.candidate_universe_received_by_persistence ??
    learningAccelerationCandidateUniverseCount;
  const learningAccelerationResearchOnlyPersisted =
    learningAccelerationTrace?.learning_acceleration_research_only_persisted_count ??
    input.scan_readback?.learning_acceleration_research_only_persisted_count ??
    learningAccelerationPersisted ??
    learningAccelerationSamplesCollectedToday;
  const learningAccelerationSamplesEvaluatedToday =
    learningAccelerationTrace?.learning_acceleration_samples_evaluated_count ??
    input.scan_readback?.learning_acceleration_samples_evaluated_today ??
    input.outcome_evaluation?.learning_acceleration_samples_evaluated ??
    0;
  const learningAccelerationTopTickers =
    learningAccelerationTrace?.learning_acceleration_top_research_sample_tickers ??
    input.scan_readback?.learning_acceleration_top_research_sample_tickers ??
    [];
  const learningAccelerationQuality =
    learningAccelerationTrace?.learning_acceleration_sample_quality_summary ??
    input.scan_readback?.learning_acceleration_sample_quality_summary ??
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
      section_id: "dynamic_movers_readiness",
      title: "Dynamic Movers Readiness",
      severity:
        dynamicMoversReadiness.readiness.intake_ready ||
        dynamicMoversReadiness.readiness.safe_to_preview
          ? "info"
          : "warning",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Provider enabled",
          dynamicMoversReadiness.provider_status.enabled ? "yes" : "no",
        ),
        lineValue(
          "Provider available",
          dynamicMoversReadiness.provider_status.available ? "yes" : "no",
        ),
        lineValue(
          "Provider attempted",
          dynamicMoversReadiness.provider_status.attempted ? "yes" : "no",
        ),
        lineValue(
          "Provider used",
          dynamicMoversReadiness.provider_status.provider_used ?? "none",
        ),
        lineValue(
          "Provider error type",
          dynamicMoversReadiness.provider_status.provider_error_type ?? "none",
        ),
        lineValue(
          "Returned/selected/stale-invalid",
          `${dynamicMoversReadiness.provider_status.returned_count} / ${dynamicMoversReadiness.provider_status.selected_preview_count} / ${dynamicMoversReadiness.provider_status.stale_or_invalid_count}`,
        ),
        lineValue(
          "Intake ready",
          dynamicMoversReadiness.readiness.intake_ready ? "yes" : "no",
        ),
        lineValue(
          "Safe to preview",
          dynamicMoversReadiness.readiness.safe_to_preview ? "yes" : "no",
        ),
        lineValue(
          "Safe to shadow compare",
          dynamicMoversReadiness.readiness.safe_to_shadow_compare
            ? "yes"
            : "no",
        ),
        lineValue("Safe to use for scanner", "no"),
        lineValue("Safe to change universe", "no"),
        lineValue(
          "Required fields",
          compactListText(dynamicMoversReadiness.expected_mover_shape.required_fields),
        ),
        lineValue(
          "Missing provider/data gaps",
          compactListText(dynamicMoversReadiness.metadata_gaps),
        ),
        lineValue(
          "Static universe count",
          dynamicMoversReadiness.static_universe_comparison.static_universe_count,
        ),
        lineValue(
          "Research-heavy tickers",
          tickerListText(
            dynamicMoversReadiness.static_universe_comparison
              .research_heavy_tickers,
          ),
        ),
        lineValue(
          "Dynamic gap candidates",
          tickerListText(
            dynamicMoversReadiness.static_universe_comparison
              .dynamic_gap_candidates,
          ),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(dynamicMoversReadiness.recommended_next_steps),
        ),
        lineValue("Scanner universe changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue("Provider fetch added", "no"),
      ],
      metrics: {
        advisory_mode: dynamicMoversReadiness.advisory_only,
        provider_enabled: dynamicMoversReadiness.provider_status.enabled,
        provider_available: dynamicMoversReadiness.provider_status.available,
        provider_attempted: dynamicMoversReadiness.provider_status.attempted,
        provider_used:
          dynamicMoversReadiness.provider_status.provider_used ?? null,
        provider_error_type:
          dynamicMoversReadiness.provider_status.provider_error_type ?? null,
        returned_count: dynamicMoversReadiness.provider_status.returned_count,
        selected_preview_count:
          dynamicMoversReadiness.provider_status.selected_preview_count,
        stale_or_invalid_count:
          dynamicMoversReadiness.provider_status.stale_or_invalid_count,
        intake_ready: dynamicMoversReadiness.readiness.intake_ready,
        safe_to_preview: dynamicMoversReadiness.readiness.safe_to_preview,
        safe_to_shadow_compare:
          dynamicMoversReadiness.readiness.safe_to_shadow_compare,
        safe_to_use_for_scanner: false,
        safe_to_change_universe: false,
        expected_mover_shape: JSON.stringify(
          dynamicMoversReadiness.expected_mover_shape,
        ),
        current_gap_analysis: JSON.stringify(
          dynamicMoversReadiness.current_gap_analysis,
        ),
        static_universe_comparison: JSON.stringify(
          dynamicMoversReadiness.static_universe_comparison,
        ),
        recommended_next_steps:
          dynamicMoversReadiness.recommended_next_steps.join(","),
        scanner_universe_changed: false,
        live_ranking_changed: false,
        provider_fetch_added: false,
        reason_codes: dynamicMoversReadiness.reason_codes.join(","),
        caution_flags: dynamicMoversReadiness.caution_flags.join(","),
        metadata_gaps: dynamicMoversReadiness.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "dynamic_movers_shadow_contract",
      title: "Dynamic Movers Shadow Contract",
      severity:
        dynamicMoversShadowAudit.shadow_readiness.safe_to_shadow_compare
          ? "info"
          : "warning",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Mock mode", "yes"),
        lineValue("Provider fetch added", "no"),
        lineValue(
          "Fixture movers",
          `${dynamicMoversShadowAudit.fixture_summary.total_movers} / ${dynamicMoversShadowAudit.fixture_summary.valid_movers} / ${dynamicMoversShadowAudit.fixture_summary.preview_only_movers} / ${dynamicMoversShadowAudit.fixture_summary.invalid_movers} / ${dynamicMoversShadowAudit.fixture_summary.stale_movers}`,
        ),
        lineValue(
          "Required fields checked",
          compactListText(
            dynamicMoversShadowAudit.contract_validation.required_fields,
          ),
        ),
        lineValue(
          "Missing field counts",
          setupMixText(
            dynamicMoversShadowAudit.contract_validation.missing_field_counts,
          ),
        ),
        lineValue(
          "Static universe overlap",
          tickerListText(
            dynamicMoversShadowAudit.static_universe_comparison
              .movers_inside_static_universe,
          ),
        ),
        lineValue(
          "Outside static universe",
          tickerListText(
            dynamicMoversShadowAudit.static_universe_comparison
              .movers_outside_static_universe,
          ),
        ),
        lineValue(
          "Research-heavy overlap",
          tickerListText(
            dynamicMoversShadowAudit.static_universe_comparison
              .overlap_with_research_heavy,
          ),
        ),
        lineValue(
          "Safe to preview",
          dynamicMoversShadowAudit.shadow_readiness.safe_to_preview
            ? "yes"
            : "no",
        ),
        lineValue(
          "Safe to shadow compare",
          dynamicMoversShadowAudit.shadow_readiness.safe_to_shadow_compare
            ? "yes"
            : "no",
        ),
        lineValue("Safe to use for scanner", "no"),
        lineValue("Safe to change universe", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(dynamicMoversShadowAudit.recommended_next_steps),
        ),
        lineValue("Scanner universe changed", "no"),
        lineValue("Live ranking changed", "no"),
      ],
      metrics: {
        advisory_mode: dynamicMoversShadowAudit.advisory_only,
        mock_mode: dynamicMoversShadowAudit.mock_mode,
        provider_fetch_added: false,
        total_movers: dynamicMoversShadowAudit.fixture_summary.total_movers,
        valid_movers: dynamicMoversShadowAudit.fixture_summary.valid_movers,
        preview_only_movers:
          dynamicMoversShadowAudit.fixture_summary.preview_only_movers,
        invalid_movers: dynamicMoversShadowAudit.fixture_summary.invalid_movers,
        stale_movers: dynamicMoversShadowAudit.fixture_summary.stale_movers,
        missing_required_field_count:
          dynamicMoversShadowAudit.fixture_summary.missing_required_field_count,
        required_fields: dynamicMoversShadowAudit.contract_validation.required_fields.join(","),
        optional_fields: dynamicMoversShadowAudit.contract_validation.optional_fields.join(","),
        missing_field_counts: JSON.stringify(
          dynamicMoversShadowAudit.contract_validation.missing_field_counts,
        ),
        invalid_examples: JSON.stringify(
          dynamicMoversShadowAudit.contract_validation.invalid_examples,
        ),
        stale_examples: JSON.stringify(
          dynamicMoversShadowAudit.contract_validation.stale_examples,
        ),
        static_universe_comparison: JSON.stringify(
          dynamicMoversShadowAudit.static_universe_comparison,
        ),
        safe_to_preview:
          dynamicMoversShadowAudit.shadow_readiness.safe_to_preview,
        safe_to_shadow_compare:
          dynamicMoversShadowAudit.shadow_readiness.safe_to_shadow_compare,
        safe_to_use_for_scanner: false,
        safe_to_change_universe: false,
        readiness_label:
          dynamicMoversShadowAudit.shadow_readiness.readiness_label,
        recommended_next_steps:
          dynamicMoversShadowAudit.recommended_next_steps.join(","),
        scanner_universe_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          dynamicMoversShadowAudit.safety.requires_manual_review,
        reason_codes: dynamicMoversShadowAudit.reason_codes.join(","),
        caution_flags: dynamicMoversShadowAudit.caution_flags.join(","),
        metadata_gaps: dynamicMoversShadowAudit.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "historical_learning_backfill_readiness",
      title: "Historical Learning Backfill Readiness",
      severity:
        historicalBackfillReadiness.metadata_gaps.length > 0 ? "warning" : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Provider",
          historicalBackfillReadiness.provider_capacity.provider,
        ),
        lineValue(
          "Plan profile",
          historicalBackfillReadiness.provider_capacity.plan_profile ??
            "unknown",
        ),
        lineValue(
          "Estimated headroom",
          historicalBackfillReadiness.provider_capacity
            .estimated_available_headroom,
        ),
        lineValue(
          "Safe background budget",
          historicalBackfillReadiness.provider_capacity
            .safe_background_budget_per_minute,
        ),
        lineValue(
          "Preferred interval",
          historicalBackfillReadiness.backfill_scope.preferred_interval,
        ),
        lineValue(
          "Initial history days",
          `${historicalBackfillReadiness.backfill_scope.recommended_history_days_initial}-${historicalBackfillReadiness.backfill_scope.max_history_days_initial}`,
        ),
        lineValue(
          "Sample origins",
          Object.entries(historicalBackfillReadiness.sample_types)
            .filter(([, enabled]) => enabled)
            .map(([origin]) => origin)
            .join(", "),
        ),
        lineValue(
          "Lookahead safety",
          historicalBackfillReadiness.lookahead_safety.required
            ? "required"
            : "not required",
        ),
        lineValue("Nightly historical backfill", "planned / not active"),
        lineValue("Intraday shadow sampling", "planned / not active"),
        lineValue("Ticker memory refresh", "planned / not active"),
        lineValue("Local indicator computation", "planned / not active"),
        lineValue("Ready to fetch historical data", "no"),
        lineValue("Ready to persist synthetic outcomes", "no"),
        lineValue("Safe to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(historicalBackfillReadiness.recommended_next_steps),
        ),
      ],
      metrics: {
        advisory_mode: historicalBackfillReadiness.advisory_only,
        provider: historicalBackfillReadiness.provider_capacity.provider,
        plan_profile:
          historicalBackfillReadiness.provider_capacity.plan_profile ?? null,
        credits_per_minute_limit:
          historicalBackfillReadiness.provider_capacity.credits_per_minute_limit,
        current_usage_observed:
          historicalBackfillReadiness.provider_capacity.current_usage_observed,
        estimated_available_headroom:
          historicalBackfillReadiness.provider_capacity
            .estimated_available_headroom,
        safe_background_budget_per_minute:
          historicalBackfillReadiness.provider_capacity
            .safe_background_budget_per_minute,
        supported_intervals:
          historicalBackfillReadiness.backfill_scope.supported_intervals.join(","),
        preferred_interval:
          historicalBackfillReadiness.backfill_scope.preferred_interval,
        supported_windows:
          historicalBackfillReadiness.backfill_scope.supported_windows.join(","),
        recommended_history_days_initial:
          historicalBackfillReadiness.backfill_scope
            .recommended_history_days_initial,
        max_history_days_initial:
          historicalBackfillReadiness.backfill_scope.max_history_days_initial,
        preferred_ticker_sources:
          historicalBackfillReadiness.backfill_scope.preferred_ticker_sources.join(","),
        sample_types: JSON.stringify(historicalBackfillReadiness.sample_types),
        lookahead_safety: JSON.stringify(
          historicalBackfillReadiness.lookahead_safety,
        ),
        proposed_jobs: JSON.stringify(historicalBackfillReadiness.proposed_jobs),
        storage_readiness: JSON.stringify(
          historicalBackfillReadiness.storage_readiness,
        ),
        budget_policy: JSON.stringify(
          historicalBackfillReadiness.budget_policy,
        ),
        ready_to_plan: historicalBackfillReadiness.readiness.ready_to_plan,
        ready_to_fetch_historical_data: false,
        ready_to_persist_synthetic_outcomes: false,
        safe_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        synthetic_outcomes_persisted: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          historicalBackfillReadiness.safety.requires_manual_review,
        recommended_next_steps:
          historicalBackfillReadiness.recommended_next_steps.join(","),
        reason_codes: historicalBackfillReadiness.reason_codes.join(","),
        caution_flags: historicalBackfillReadiness.caution_flags.join(","),
        metadata_gaps: historicalBackfillReadiness.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "historical_candle_cache",
      title: "Historical Candle Cache",
      severity:
        historicalCandleCacheReadiness.validation.invalid_candles > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Preferred interval",
          historicalCandleCacheReadiness.cache_contract.preferred_interval,
        ),
        lineValue(
          "Cache key fields",
          compactListText(
            historicalCandleCacheReadiness.cache_contract.cache_key_fields,
          ),
        ),
        lineValue(
          "Candle contract",
          compactListText(
            historicalCandleCacheReadiness.cache_contract
              .candle_required_fields,
          ),
        ),
        lineValue(
          "Storage table proposed",
          historicalCandleCacheReadiness.storage_plan.suggested_table_name,
        ),
        lineValue(
          "Reuse before fetch",
          historicalCandleCacheReadiness.storage_plan.reuse_before_fetch
            ? "yes"
            : "no",
        ),
        lineValue(
          "Dedupe required",
          historicalCandleCacheReadiness.storage_plan.dedupe_required
            ? "yes"
            : "no",
        ),
        lineValue(
          "Lookahead safety",
          historicalCandleCacheReadiness.lookahead_safety
            .signal_generation_must_filter_to_cutoff
            ? "signal generation must filter to analysis cutoff"
            : "unknown",
        ),
        lineValue(
          "Ready to define storage",
          historicalCandleCacheReadiness.readiness.ready_to_define_storage
            ? "yes"
            : "no",
        ),
        lineValue("Ready to fetch historical data", "no"),
        lineValue("Ready to use for backfill", "no"),
        lineValue("Ready to use for scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(historicalCandleCacheReadiness.recommended_next_steps),
        ),
      ],
      metrics: {
        advisory_mode: historicalCandleCacheReadiness.advisory_only,
        provider: historicalCandleCacheReadiness.cache_contract.provider,
        supported_intervals:
          historicalCandleCacheReadiness.cache_contract.supported_intervals.join(","),
        preferred_interval:
          historicalCandleCacheReadiness.cache_contract.preferred_interval,
        cache_key_fields:
          historicalCandleCacheReadiness.cache_contract.cache_key_fields.join(","),
        candle_required_fields:
          historicalCandleCacheReadiness.cache_contract.candle_required_fields.join(","),
        candle_optional_fields:
          historicalCandleCacheReadiness.cache_contract.candle_optional_fields.join(","),
        candles_inspected:
          historicalCandleCacheReadiness.validation.candles_inspected,
        valid_candles: historicalCandleCacheReadiness.validation.valid_candles,
        invalid_candles:
          historicalCandleCacheReadiness.validation.invalid_candles,
        stale_or_out_of_order:
          historicalCandleCacheReadiness.validation.stale_or_out_of_order,
        missing_field_counts: JSON.stringify(
          historicalCandleCacheReadiness.validation.missing_field_counts,
        ),
        invalid_examples: JSON.stringify(
          historicalCandleCacheReadiness.validation.invalid_examples,
        ),
        storage_plan: JSON.stringify(historicalCandleCacheReadiness.storage_plan),
        lookahead_safety: JSON.stringify(
          historicalCandleCacheReadiness.lookahead_safety,
        ),
        ready_to_define_storage:
          historicalCandleCacheReadiness.readiness.ready_to_define_storage,
        ready_to_fetch_historical_data: false,
        ready_to_use_for_backfill: false,
        ready_to_use_for_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        synthetic_outcomes_persisted: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          historicalCandleCacheReadiness.safety.requires_manual_review,
        recommended_next_steps:
          historicalCandleCacheReadiness.recommended_next_steps.join(","),
        reason_codes: historicalCandleCacheReadiness.reason_codes.join(","),
        caution_flags: historicalCandleCacheReadiness.caution_flags.join(","),
        metadata_gaps: historicalCandleCacheReadiness.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "historical_candle_storage_readiness",
      title: "Historical Candle Storage Readiness",
      severity:
        historicalCandleStorageReadiness.metadata_gaps.length > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Proposed table",
          historicalCandleStorageReadiness.proposed_schema.primary_table,
        ),
        lineValue(
          "Proposed fetch-runs table",
          historicalCandleStorageReadiness.proposed_schema.fetch_runs_table,
        ),
        lineValue(
          "Candle contract version",
          historicalCandleStorageReadiness.proposed_schema
            .candle_contract_version,
        ),
        lineValue(
          "Migration file exists",
          historicalCandleStorageReadiness.migration_readiness
            .migration_file_present
            ? "yes"
            : "unknown",
        ),
        lineValue(
          "Schema readback attempted",
          historicalCandleStorageReadiness.migration_readiness
            .schema_readback_attempted
            ? "yes"
            : "no",
        ),
        lineValue(
          "Schema readback status",
          historicalCandleStorageReadiness.migration_readiness
            .schema_readback_status,
        ),
        lineValue(
          "Migration applied",
          historicalCandleStorageReadiness.migration_readiness
            .migration_applied,
        ),
        lineValue(
          "historical_candles table detected",
          historicalCandleStorageReadiness.migration_readiness
            .historical_candles_table_detected,
        ),
        lineValue(
          "historical_candle_fetch_runs table detected",
          historicalCandleStorageReadiness.migration_readiness
            .historical_candle_fetch_runs_table_detected,
        ),
        lineValue(
          "Unique key detected",
          historicalCandleStorageReadiness.migration_readiness
            .expected_unique_key_detected,
        ),
        lineValue(
          "Indexes detected",
          historicalCandleStorageReadiness.migration_readiness
            .expected_indexes_detected,
        ),
        lineValue(
          "RLS enabled",
          historicalCandleStorageReadiness.migration_readiness
            .rls_enabled_detected,
        ),
        lineValue(
          "Client writes allowed",
          historicalCandleStorageReadiness.migration_readiness
            .client_writes_allowed,
        ),
        lineValue(
          "Client reads allowed",
          historicalCandleStorageReadiness.migration_readiness
            .client_reads_allowed,
        ),
        lineValue(
          "Unique key",
          compactListText(
            historicalCandleStorageReadiness.historical_candles_table
              .proposed_unique_key,
          ),
        ),
        lineValue(
          "Proposed indexes",
          compactListText(
            historicalCandleStorageReadiness.historical_candles_table
              .proposed_indexes,
          ),
        ),
        lineValue(
          "Dedupe required",
          historicalCandleStorageReadiness.historical_candles_table
            .dedupe_required
            ? "yes"
            : "no",
        ),
        lineValue(
          "Reuse before fetch",
          historicalCandleStorageReadiness.historical_candles_table
            .reuse_before_fetch
            ? "yes"
            : "no",
        ),
        lineValue(
          "TTL policy required",
          historicalCandleStorageReadiness.retention_policy
            .ttl_policy_required
            ? "yes"
            : "no",
        ),
        lineValue(
          "Lookahead safety",
          historicalCandleStorageReadiness.lookahead_safety
            .replay_signal_generation_must_filter_to_analysis_cutoff
            ? "replay must filter to analysis cutoff"
            : "unknown",
        ),
        lineValue(
          "Ready to write migration",
          historicalCandleStorageReadiness.migration_readiness
            .ready_to_write_migration
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to apply migration",
          historicalCandleStorageReadiness.migration_readiness
            .ready_to_apply_migration
            ? "yes"
            : "no",
        ),
        lineValue("Ready to fetch historical data", "no"),
        lineValue("Ready to persist candles", "no"),
        lineValue("Ready to use for backfill", "no"),
        lineValue("Ready to use for scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            historicalCandleStorageReadiness.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: historicalCandleStorageReadiness.advisory_only,
        proposed_schema: JSON.stringify(
          historicalCandleStorageReadiness.proposed_schema,
        ),
        primary_table:
          historicalCandleStorageReadiness.proposed_schema.primary_table,
        fetch_runs_table:
          historicalCandleStorageReadiness.proposed_schema.fetch_runs_table,
        provider: historicalCandleStorageReadiness.proposed_schema.provider,
        candle_contract_version:
          historicalCandleStorageReadiness.proposed_schema
            .candle_contract_version,
        historical_candles_required_columns:
          historicalCandleStorageReadiness.historical_candles_table.required_columns.join(","),
        historical_candles_optional_columns:
          historicalCandleStorageReadiness.historical_candles_table.optional_columns.join(","),
        unique_key:
          historicalCandleStorageReadiness.historical_candles_table.proposed_unique_key.join(","),
        proposed_indexes:
          historicalCandleStorageReadiness.historical_candles_table.proposed_indexes.join(","),
        dedupe_required: true,
        reuse_before_fetch: true,
        fetch_runs_required_columns:
          historicalCandleStorageReadiness.historical_candle_fetch_runs_table.required_columns.join(","),
        fetch_runs_indexes:
          historicalCandleStorageReadiness.historical_candle_fetch_runs_table.proposed_indexes.join(","),
        fetch_runs_purpose:
          historicalCandleStorageReadiness.historical_candle_fetch_runs_table
            .purpose,
        retention_policy: JSON.stringify(
          historicalCandleStorageReadiness.retention_policy,
        ),
        rls_and_access: JSON.stringify(
          historicalCandleStorageReadiness.rls_and_access,
        ),
        lookahead_safety: JSON.stringify(
          historicalCandleStorageReadiness.lookahead_safety,
        ),
        ready_to_write_migration:
          historicalCandleStorageReadiness.migration_readiness
            .ready_to_write_migration,
        migration_file_present:
          historicalCandleStorageReadiness.migration_readiness
            .migration_file_present,
        schema_readback_attempted:
          historicalCandleStorageReadiness.migration_readiness
            .schema_readback_attempted,
        schema_readback_status:
          historicalCandleStorageReadiness.migration_readiness
            .schema_readback_status,
        schema_readback_missing_items:
          historicalCandleStorageReadiness.migration_readiness
            .schema_readback_missing_items.join(","),
        schema_readback_warnings:
          historicalCandleStorageReadiness.migration_readiness
            .schema_readback_warnings.join(","),
        migration_applied:
          historicalCandleStorageReadiness.migration_readiness
            .migration_applied,
        historical_candles_table_detected:
          historicalCandleStorageReadiness.migration_readiness
            .historical_candles_table_detected,
        historical_candle_fetch_runs_table_detected:
          historicalCandleStorageReadiness.migration_readiness
            .historical_candle_fetch_runs_table_detected,
        expected_unique_key_detected:
          historicalCandleStorageReadiness.migration_readiness
            .expected_unique_key_detected,
        expected_indexes_detected:
          historicalCandleStorageReadiness.migration_readiness
            .expected_indexes_detected,
        rls_enabled_detected:
          historicalCandleStorageReadiness.migration_readiness
            .rls_enabled_detected,
        client_write_policies_detected:
          historicalCandleStorageReadiness.migration_readiness
            .client_write_policies_detected,
        client_read_policies_detected:
          historicalCandleStorageReadiness.migration_readiness
            .client_read_policies_detected,
        client_writes_allowed:
          historicalCandleStorageReadiness.migration_readiness
            .client_writes_allowed,
        client_reads_allowed:
          historicalCandleStorageReadiness.migration_readiness
            .client_reads_allowed,
        service_role_internal_access_expected:
          historicalCandleStorageReadiness.migration_readiness
            .service_role_internal_access_expected,
        detection_source:
          historicalCandleStorageReadiness.migration_readiness.detection_source,
        detection_checked_at:
          historicalCandleStorageReadiness.migration_readiness.checked_at,
        detection_error_message:
          historicalCandleStorageReadiness.migration_readiness.error_message,
        ready_to_apply_migration:
          historicalCandleStorageReadiness.migration_readiness
            .ready_to_apply_migration,
        ready_to_fetch_historical_data: false,
        ready_to_persist_candles: false,
        ready_to_use_for_backfill: false,
        ready_to_use_for_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        synthetic_outcomes_persisted: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          historicalCandleStorageReadiness.safety.requires_manual_review,
        recommended_next_steps:
          historicalCandleStorageReadiness.recommended_next_steps.join(","),
        reason_codes: historicalCandleStorageReadiness.reason_codes.join(","),
        caution_flags: historicalCandleStorageReadiness.caution_flags.join(","),
        metadata_gaps: historicalCandleStorageReadiness.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "historical_backfill_fetch_planner",
      title: "Historical Backfill Fetch Planner",
      severity:
        historicalBackfillFetchPlan.metadata_gaps.length > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Dry run only", "yes"),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Preferred interval",
          historicalBackfillFetchPlan.plan_context.preferred_interval,
        ),
        lineValue(
          "History days planned",
          historicalBackfillFetchPlan.plan_context.history_days_planned,
        ),
        lineValue(
          "Selected tickers",
          tickerListText(
            historicalBackfillFetchPlan.ticker_selection.selected_tickers,
          ),
        ),
        lineValue(
          "Ticker source mix",
          setupMixText(historicalBackfillFetchPlan.plan_context.ticker_source_mix),
        ),
        lineValue(
          "Planned requests",
          historicalBackfillFetchPlan.request_plan.total_planned_requests,
        ),
        lineValue(
          "Estimated credits",
          historicalBackfillFetchPlan.request_plan.estimated_provider_credits ??
            "unknown",
        ),
        lineValue("Background priority", "low"),
        lineValue(
          "Budget policy",
          "background low priority",
        ),
        lineValue(
          "Pause near scan windows",
          historicalBackfillFetchPlan.budget_policy.pause_near_scan_windows
            ? "yes"
            : "no",
        ),
        lineValue(
          "Pause on provider warnings",
          historicalBackfillFetchPlan.budget_policy.pause_on_provider_warnings
            ? "yes"
            : "no",
        ),
        lineValue(
          "Migration applied",
          historicalBackfillFetchPlan.readiness.migration_applied,
        ),
        lineValue("Ready to fetch historical data", "no"),
        lineValue("Ready to persist candles", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Safe to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(historicalBackfillFetchPlan.recommended_next_steps),
        ),
      ],
      metrics: {
        advisory_mode: historicalBackfillFetchPlan.advisory_only,
        dry_run_only: historicalBackfillFetchPlan.dry_run_only,
        provider: historicalBackfillFetchPlan.plan_context.provider,
        plan_profile: historicalBackfillFetchPlan.plan_context.plan_profile,
        preferred_interval:
          historicalBackfillFetchPlan.plan_context.preferred_interval,
        history_days_requested:
          historicalBackfillFetchPlan.plan_context.history_days_requested,
        history_days_planned:
          historicalBackfillFetchPlan.plan_context.history_days_planned,
        windows: historicalBackfillFetchPlan.plan_context.windows.join(","),
        ticker_source_mix: JSON.stringify(
          historicalBackfillFetchPlan.plan_context.ticker_source_mix,
        ),
        candidate_tickers: historicalBackfillFetchPlan.ticker_selection.candidate_tickers.join(","),
        selected_tickers: historicalBackfillFetchPlan.ticker_selection.selected_tickers.join(","),
        skipped_tickers: JSON.stringify(
          historicalBackfillFetchPlan.ticker_selection.skipped_tickers,
        ),
        source_counts: JSON.stringify(
          historicalBackfillFetchPlan.ticker_selection.source_counts,
        ),
        total_planned_requests:
          historicalBackfillFetchPlan.request_plan.total_planned_requests,
        estimated_provider_credits:
          historicalBackfillFetchPlan.request_plan.estimated_provider_credits,
        estimated_candles:
          historicalBackfillFetchPlan.request_plan.estimated_candles,
        grouped_by_day: JSON.stringify(
          historicalBackfillFetchPlan.request_plan.grouped_by_day,
        ),
        grouped_by_ticker: JSON.stringify(
          historicalBackfillFetchPlan.request_plan.grouped_by_ticker,
        ),
        grouped_by_window: JSON.stringify(
          historicalBackfillFetchPlan.request_plan.grouped_by_window,
        ),
        budget_policy: JSON.stringify(historicalBackfillFetchPlan.budget_policy),
        max_background_requests_per_minute:
          historicalBackfillFetchPlan.budget_policy
            .max_background_requests_per_minute,
        pause_near_scan_windows: true,
        pause_on_provider_warnings: true,
        pause_when_market_open_if_needed: true,
        lookahead_safety: JSON.stringify(
          historicalBackfillFetchPlan.lookahead_safety,
        ),
        migration_required: true,
        migration_applied: historicalBackfillFetchPlan.readiness.migration_applied,
        ready_to_fetch_historical_data: false,
        ready_to_persist_candles: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        safe_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        synthetic_outcomes_persisted: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          historicalBackfillFetchPlan.safety.requires_manual_review,
        recommended_next_steps:
          historicalBackfillFetchPlan.recommended_next_steps.join(","),
        reason_codes: historicalBackfillFetchPlan.reason_codes.join(","),
        caution_flags: historicalBackfillFetchPlan.caution_flags.join(","),
        metadata_gaps: historicalBackfillFetchPlan.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "twelve_data_historical_fetch_contract",
      title: "Twelve Data Historical Fetch Contract",
      severity:
        twelveDataHistoricalFetchContract.request_validation.invalid_requests > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Dry run only", "yes"),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Preferred endpoint",
          twelveDataHistoricalFetchContract.provider_contract
            .preferred_endpoint,
        ),
        lineValue("Earliest timestamp check", "planned"),
        lineValue(
          "Preferred interval",
          twelveDataHistoricalFetchContract.provider_contract
            .preferred_interval,
        ),
        lineValue(
          "Requests planned",
          twelveDataHistoricalFetchContract.request_validation.requests_planned,
        ),
        lineValue(
          "Valid/invalid requests",
          `${twelveDataHistoricalFetchContract.request_validation.valid_requests} / ${twelveDataHistoricalFetchContract.request_validation.invalid_requests}`,
        ),
        lineValue(
          "Grouped by ticker/day/window",
          `${Object.keys(twelveDataHistoricalFetchContract.request_plan.grouped_by_ticker).length} / ${Object.keys(twelveDataHistoricalFetchContract.request_plan.grouped_by_day).length} / ${setupMixText(twelveDataHistoricalFetchContract.request_plan.grouped_by_window)}`,
        ),
        lineValue("Cache reuse before fetch", "yes"),
        lineValue("Fetch-run audit required", "yes"),
        lineValue(
          "Ready to build requests",
          twelveDataHistoricalFetchContract.readiness.ready_to_build_requests
            ? "yes"
            : "no",
        ),
        lineValue("Ready to call provider", "no"),
        lineValue("Ready to persist candles", "no"),
        lineValue("Ready to run backfill", "no"),
        lineValue("Safe to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            twelveDataHistoricalFetchContract.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: twelveDataHistoricalFetchContract.advisory_only,
        dry_run_only: twelveDataHistoricalFetchContract.dry_run_only,
        provider:
          twelveDataHistoricalFetchContract.provider_contract.provider,
        supported_endpoints:
          twelveDataHistoricalFetchContract.provider_contract.supported_endpoints.join(","),
        preferred_endpoint:
          twelveDataHistoricalFetchContract.provider_contract
            .preferred_endpoint,
        earliest_timestamp_check_supported: true,
        preferred_interval:
          twelveDataHistoricalFetchContract.provider_contract
            .preferred_interval,
        timezone:
          twelveDataHistoricalFetchContract.provider_contract.timezone,
        adjusted_default:
          twelveDataHistoricalFetchContract.provider_contract.adjusted_default,
        endpoint_strategy: JSON.stringify(
          twelveDataHistoricalFetchContract.endpoint_strategy,
        ),
        requests_planned:
          twelveDataHistoricalFetchContract.request_validation.requests_planned,
        valid_requests:
          twelveDataHistoricalFetchContract.request_validation.valid_requests,
        invalid_requests:
          twelveDataHistoricalFetchContract.request_validation.invalid_requests,
        missing_field_counts: JSON.stringify(
          twelveDataHistoricalFetchContract.request_validation
            .missing_field_counts,
        ),
        invalid_examples: JSON.stringify(
          twelveDataHistoricalFetchContract.request_validation.invalid_examples,
        ),
        planned_requests: JSON.stringify(
          twelveDataHistoricalFetchContract.request_plan.planned_requests,
        ),
        grouped_by_ticker: JSON.stringify(
          twelveDataHistoricalFetchContract.request_plan.grouped_by_ticker,
        ),
        grouped_by_day: JSON.stringify(
          twelveDataHistoricalFetchContract.request_plan.grouped_by_day,
        ),
        grouped_by_window: JSON.stringify(
          twelveDataHistoricalFetchContract.request_plan.grouped_by_window,
        ),
        cache_policy: JSON.stringify(
          twelveDataHistoricalFetchContract.cache_policy,
        ),
        budget_policy: JSON.stringify(
          twelveDataHistoricalFetchContract.budget_policy,
        ),
        estimated_provider_credits:
          twelveDataHistoricalFetchContract.budget_policy
            .estimated_provider_credits,
        max_background_requests_per_minute:
          twelveDataHistoricalFetchContract.budget_policy
            .max_background_requests_per_minute,
        pause_near_scan_windows: true,
        pause_on_provider_warnings: true,
        live_scan_priority: "highest",
        outcome_evaluation_priority: "high",
        background_priority: "low",
        ready_to_build_requests:
          twelveDataHistoricalFetchContract.readiness.ready_to_build_requests,
        ready_to_call_provider: false,
        ready_to_persist_candles: false,
        ready_to_run_backfill: false,
        safe_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        synthetic_outcomes_persisted: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          twelveDataHistoricalFetchContract.safety.requires_manual_review,
        recommended_next_steps:
          twelveDataHistoricalFetchContract.recommended_next_steps.join(","),
        reason_codes:
          twelveDataHistoricalFetchContract.reason_codes.join(","),
        caution_flags:
          twelveDataHistoricalFetchContract.caution_flags.join(","),
        metadata_gaps:
          twelveDataHistoricalFetchContract.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "twelve_data_historical_response_parser",
      title: "Twelve Data Historical Response Parser",
      severity:
        twelveDataHistoricalResponseParser.validation.invalid_candles_count > 0 ||
        twelveDataHistoricalResponseParser.parse_status === "error"
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Mock mode", "yes"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue(
          "Parse status",
          twelveDataHistoricalResponseParser.parse_status,
        ),
        lineValue(
          "Raw/normalized/valid/invalid candles",
          `${twelveDataHistoricalResponseParser.validation.raw_candles_count} / ${twelveDataHistoricalResponseParser.validation.normalized_candles_count} / ${twelveDataHistoricalResponseParser.validation.valid_candles_count} / ${twelveDataHistoricalResponseParser.validation.invalid_candles_count}`,
        ),
        lineValue(
          "Duplicate timestamps",
          twelveDataHistoricalResponseParser.validation
            .duplicate_timestamp_count,
        ),
        lineValue(
          "Out-of-order candles",
          twelveDataHistoricalResponseParser.validation.out_of_order_count,
        ),
        lineValue(
          "Cache key mapped",
          twelveDataHistoricalResponseParser.cache_mapping.cache_key
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to parse mock response",
          twelveDataHistoricalResponseParser.readiness
            .ready_to_parse_mock_response
            ? "yes"
            : "no",
        ),
        lineValue("Ready to parse provider response", "no"),
        lineValue("Ready to persist candles", "no"),
        lineValue("Ready to run backfill", "no"),
        lineValue("Safe to affect scanner", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            twelveDataHistoricalResponseParser.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: twelveDataHistoricalResponseParser.advisory_only,
        mock_mode: twelveDataHistoricalResponseParser.mock_only,
        parse_status: twelveDataHistoricalResponseParser.parse_status,
        provider_status:
          twelveDataHistoricalResponseParser.provider_status,
        provider_error_code:
          twelveDataHistoricalResponseParser.provider_error_code,
        provider_error_message:
          twelveDataHistoricalResponseParser.provider_error_message,
        meta: JSON.stringify(twelveDataHistoricalResponseParser.meta),
        candles: JSON.stringify(twelveDataHistoricalResponseParser.candles),
        raw_candles_count:
          twelveDataHistoricalResponseParser.validation.raw_candles_count,
        normalized_candles_count:
          twelveDataHistoricalResponseParser.validation
            .normalized_candles_count,
        valid_candles_count:
          twelveDataHistoricalResponseParser.validation.valid_candles_count,
        invalid_candles_count:
          twelveDataHistoricalResponseParser.validation.invalid_candles_count,
        duplicate_timestamp_count:
          twelveDataHistoricalResponseParser.validation
            .duplicate_timestamp_count,
        out_of_order_count:
          twelveDataHistoricalResponseParser.validation.out_of_order_count,
        missing_field_counts: JSON.stringify(
          twelveDataHistoricalResponseParser.validation.missing_field_counts,
        ),
        invalid_examples: JSON.stringify(
          twelveDataHistoricalResponseParser.validation.invalid_examples,
        ),
        cache_mapping: JSON.stringify(
          twelveDataHistoricalResponseParser.cache_mapping,
        ),
        cache_key_mapped: Boolean(
          twelveDataHistoricalResponseParser.cache_mapping.cache_key,
        ),
        ready_to_parse_mock_response:
          twelveDataHistoricalResponseParser.readiness
            .ready_to_parse_mock_response,
        ready_to_parse_provider_response: false,
        ready_to_persist_candles: false,
        ready_to_run_backfill: false,
        safe_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        synthetic_outcomes_persisted: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          twelveDataHistoricalResponseParser.safety.requires_manual_review,
        recommended_next_steps:
          twelveDataHistoricalResponseParser.recommended_next_steps.join(","),
        reason_codes:
          twelveDataHistoricalResponseParser.reason_codes.join(","),
        caution_flags:
          twelveDataHistoricalResponseParser.caution_flags.join(","),
        metadata_gaps:
          twelveDataHistoricalResponseParser.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "historical_candle_persistence_plan",
      title: "Historical Candle Persistence Plan",
      severity:
        historicalCandlePersistencePlan.input_summary.invalid_candles > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Dry run only", "yes"),
        lineValue(
          "Target table",
          historicalCandlePersistencePlan.persistence_context.target_table,
        ),
        lineValue(
          "Fetch runs table",
          historicalCandlePersistencePlan.persistence_context.fetch_runs_table,
        ),
        lineValue(
          "Migration applied",
          historicalCandlePersistencePlan.persistence_context.migration_applied,
        ),
        lineValue(
          "Table detected",
          historicalCandlePersistencePlan.persistence_context.table_detected,
        ),
        lineValue(
          "Candles received/valid/invalid",
          `${historicalCandlePersistencePlan.input_summary.candles_received} / ${historicalCandlePersistencePlan.input_summary.valid_candles} / ${historicalCandlePersistencePlan.input_summary.invalid_candles}`,
        ),
        lineValue(
          "Planned inserts/updates/skips/rejections",
          `${historicalCandlePersistencePlan.upsert_plan.planned_inserts} / ${historicalCandlePersistencePlan.upsert_plan.planned_updates} / ${historicalCandlePersistencePlan.upsert_plan.planned_skips} / ${historicalCandlePersistencePlan.upsert_plan.planned_invalid_rejections}`,
        ),
        lineValue(
          "Cache hits/misses",
          `${historicalCandlePersistencePlan.cache_analysis.cache_hits} / ${historicalCandlePersistencePlan.cache_analysis.cache_misses}`,
        ),
        lineValue(
          "Conflict target",
          historicalCandlePersistencePlan.upsert_plan.conflict_target.join(", "),
        ),
        lineValue("Fetch-run audit", "dry-run only"),
        lineValue(
          "Ready to plan upsert",
          historicalCandlePersistencePlan.readiness.ready_to_plan_upsert
            ? "yes"
            : "no",
        ),
        lineValue("Ready to persist candles", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run backfill", "no"),
        lineValue("Ready to use for scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(historicalCandlePersistencePlan.recommended_next_steps),
        ),
      ],
      metrics: {
        advisory_mode: historicalCandlePersistencePlan.advisory_only,
        dry_run_only: historicalCandlePersistencePlan.dry_run_only,
        persistence_context: JSON.stringify(
          historicalCandlePersistencePlan.persistence_context,
        ),
        target_table:
          historicalCandlePersistencePlan.persistence_context.target_table,
        fetch_runs_table:
          historicalCandlePersistencePlan.persistence_context.fetch_runs_table,
        provider: historicalCandlePersistencePlan.persistence_context.provider,
        migration_applied:
          historicalCandlePersistencePlan.persistence_context.migration_applied,
        table_detected:
          historicalCandlePersistencePlan.persistence_context.table_detected,
        candles_received:
          historicalCandlePersistencePlan.input_summary.candles_received,
        valid_candles:
          historicalCandlePersistencePlan.input_summary.valid_candles,
        invalid_candles:
          historicalCandlePersistencePlan.input_summary.invalid_candles,
        duplicate_input_candles:
          historicalCandlePersistencePlan.input_summary
            .duplicate_input_candles,
        unique_cache_keys:
          historicalCandlePersistencePlan.input_summary.unique_cache_keys,
        upsert_plan: JSON.stringify(historicalCandlePersistencePlan.upsert_plan),
        planned_inserts:
          historicalCandlePersistencePlan.upsert_plan.planned_inserts,
        planned_updates:
          historicalCandlePersistencePlan.upsert_plan.planned_updates,
        planned_skips:
          historicalCandlePersistencePlan.upsert_plan.planned_skips,
        planned_invalid_rejections:
          historicalCandlePersistencePlan.upsert_plan
            .planned_invalid_rejections,
        planned_duplicates_deduped:
          historicalCandlePersistencePlan.upsert_plan
            .planned_duplicates_deduped,
        conflict_target:
          historicalCandlePersistencePlan.upsert_plan.conflict_target.join(","),
        cache_analysis: JSON.stringify(
          historicalCandlePersistencePlan.cache_analysis,
        ),
        cache_hits: historicalCandlePersistencePlan.cache_analysis.cache_hits,
        cache_misses: historicalCandlePersistencePlan.cache_analysis.cache_misses,
        existing_cache_keys_checked:
          historicalCandlePersistencePlan.cache_analysis
            .existing_cache_keys_checked,
        missing_cache_key_count:
          historicalCandlePersistencePlan.cache_analysis
            .missing_cache_key_count,
        fetch_run_audit_plan: JSON.stringify(
          historicalCandlePersistencePlan.fetch_run_audit_plan,
        ),
        fetch_run_persisted: false,
        validation_mapping: JSON.stringify(
          historicalCandlePersistencePlan.validation_mapping,
        ),
        ready_to_plan_upsert:
          historicalCandlePersistencePlan.readiness.ready_to_plan_upsert,
        ready_to_write_fetch_run: false,
        ready_to_persist_candles: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_backfill: false,
        ready_to_use_for_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        synthetic_outcomes_persisted: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          historicalCandlePersistencePlan.safety.requires_manual_review,
        recommended_next_steps:
          historicalCandlePersistencePlan.recommended_next_steps.join(","),
        reason_codes: historicalCandlePersistencePlan.reason_codes.join(","),
        caution_flags: historicalCandlePersistencePlan.caution_flags.join(","),
        metadata_gaps: historicalCandlePersistencePlan.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "historical_backfill_dry_run_pipeline",
      title: "Historical Backfill Dry Run Pipeline",
      severity:
        historicalBackfillDryRunPipeline.pipeline_status === "blocked"
          ? "critical"
          : historicalBackfillDryRunPipeline.pipeline_status === "partial"
            ? "warning"
            : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Dry run only", "yes"),
        lineValue("Mock only", "yes"),
        lineValue(
          "Pipeline status",
          historicalBackfillDryRunPipeline.pipeline_status,
        ),
        lineValue(
          "Steps",
          `fetch plan ${historicalBackfillDryRunPipeline.pipeline_steps.fetch_plan_built ? "yes" : "no"} / requests ${historicalBackfillDryRunPipeline.pipeline_steps.request_plan_built ? "yes" : "no"} / parser ${historicalBackfillDryRunPipeline.pipeline_steps.mock_responses_parsed ? "yes" : "no"} / persistence plan ${historicalBackfillDryRunPipeline.pipeline_steps.persistence_plan_built ? "yes" : "no"}`,
        ),
        lineValue(
          "Selected tickers",
          tickerListText(
            historicalBackfillDryRunPipeline.fetch_plan_summary
              .selected_tickers,
          ),
        ),
        lineValue(
          "History days planned",
          historicalBackfillDryRunPipeline.fetch_plan_summary
            .history_days_planned,
        ),
        lineValue(
          "Requests planned/valid/invalid",
          `${historicalBackfillDryRunPipeline.request_contract_summary.requests_planned} / ${historicalBackfillDryRunPipeline.request_contract_summary.valid_requests} / ${historicalBackfillDryRunPipeline.request_contract_summary.invalid_requests}`,
        ),
        lineValue(
          "Mock responses used",
          historicalBackfillDryRunPipeline.parser_summary.mock_responses_used,
        ),
        lineValue(
          "Raw/normalized/valid/invalid candles",
          `${historicalBackfillDryRunPipeline.parser_summary.raw_candles} / ${historicalBackfillDryRunPipeline.parser_summary.normalized_candles} / ${historicalBackfillDryRunPipeline.parser_summary.valid_candles} / ${historicalBackfillDryRunPipeline.parser_summary.invalid_candles}`,
        ),
        lineValue(
          "Planned inserts/updates/skips/rejections",
          `${historicalBackfillDryRunPipeline.persistence_summary.planned_inserts} / ${historicalBackfillDryRunPipeline.persistence_summary.planned_updates} / ${historicalBackfillDryRunPipeline.persistence_summary.planned_skips} / ${historicalBackfillDryRunPipeline.persistence_summary.planned_invalid_rejections}`,
        ),
        lineValue(
          "Cache hits/misses",
          `${historicalBackfillDryRunPipeline.persistence_summary.cache_hits} / ${historicalBackfillDryRunPipeline.persistence_summary.cache_misses}`,
        ),
        lineValue("Ready to call provider", "no"),
        lineValue("Ready to persist candles", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Ready to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            historicalBackfillDryRunPipeline.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: historicalBackfillDryRunPipeline.advisory_only,
        dry_run_only: historicalBackfillDryRunPipeline.dry_run_only,
        mock_only: historicalBackfillDryRunPipeline.mock_only,
        pipeline_status:
          historicalBackfillDryRunPipeline.pipeline_status,
        pipeline_steps: JSON.stringify(
          historicalBackfillDryRunPipeline.pipeline_steps,
        ),
        fetch_plan_summary: JSON.stringify(
          historicalBackfillDryRunPipeline.fetch_plan_summary,
        ),
        request_contract_summary: JSON.stringify(
          historicalBackfillDryRunPipeline.request_contract_summary,
        ),
        parser_summary: JSON.stringify(
          historicalBackfillDryRunPipeline.parser_summary,
        ),
        persistence_summary: JSON.stringify(
          historicalBackfillDryRunPipeline.persistence_summary,
        ),
        selected_tickers:
          historicalBackfillDryRunPipeline.fetch_plan_summary.selected_tickers.join(","),
        history_days_planned:
          historicalBackfillDryRunPipeline.fetch_plan_summary
            .history_days_planned,
        requests_planned:
          historicalBackfillDryRunPipeline.request_contract_summary
            .requests_planned,
        valid_requests:
          historicalBackfillDryRunPipeline.request_contract_summary
            .valid_requests,
        invalid_requests:
          historicalBackfillDryRunPipeline.request_contract_summary
            .invalid_requests,
        mock_responses_used:
          historicalBackfillDryRunPipeline.parser_summary.mock_responses_used,
        normalized_candles:
          historicalBackfillDryRunPipeline.parser_summary.normalized_candles,
        valid_candles:
          historicalBackfillDryRunPipeline.parser_summary.valid_candles,
        invalid_candles:
          historicalBackfillDryRunPipeline.parser_summary.invalid_candles,
        planned_inserts:
          historicalBackfillDryRunPipeline.persistence_summary.planned_inserts,
        planned_updates:
          historicalBackfillDryRunPipeline.persistence_summary.planned_updates,
        planned_skips:
          historicalBackfillDryRunPipeline.persistence_summary.planned_skips,
        planned_invalid_rejections:
          historicalBackfillDryRunPipeline.persistence_summary
            .planned_invalid_rejections,
        cache_hits:
          historicalBackfillDryRunPipeline.persistence_summary.cache_hits,
        cache_misses:
          historicalBackfillDryRunPipeline.persistence_summary.cache_misses,
        readiness: JSON.stringify(historicalBackfillDryRunPipeline.readiness),
        ready_to_run_mock_pipeline:
          historicalBackfillDryRunPipeline.readiness
            .ready_to_run_mock_pipeline,
        ready_to_call_provider: false,
        ready_to_persist_candles: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_manual_review:
          historicalBackfillDryRunPipeline.safety.requires_manual_review,
        blockers: historicalBackfillDryRunPipeline.blockers.join(","),
        recommended_next_steps:
          historicalBackfillDryRunPipeline.recommended_next_steps.join(","),
        reason_codes: historicalBackfillDryRunPipeline.reason_codes.join(","),
        caution_flags: historicalBackfillDryRunPipeline.caution_flags.join(","),
        metadata_gaps: historicalBackfillDryRunPipeline.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "historical_backfill_execution_readiness",
      title: "Historical Backfill Execution Readiness",
      severity:
        historicalBackfillExecutionReadiness.readiness_status === "blocked"
          ? "critical"
          : historicalBackfillExecutionReadiness.readiness_status ===
                "not_ready" ||
              historicalBackfillExecutionReadiness.readiness_status ===
                "ready_for_manual_review"
            ? "warning"
            : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Readiness status",
          historicalBackfillExecutionReadiness.readiness_status,
        ),
        lineValue(
          "Migration applied",
          yesNoUnknown(
            historicalBackfillExecutionReadiness.prerequisites
              .migration_applied,
          ),
        ),
        lineValue(
          "historical_candles table detected",
          yesNoUnknown(
            historicalBackfillExecutionReadiness.prerequisites
              .historical_candles_table_detected,
          ),
        ),
        lineValue(
          "historical_candle_fetch_runs table detected",
          yesNoUnknown(
            historicalBackfillExecutionReadiness.prerequisites
              .historical_candle_fetch_runs_table_detected,
          ),
        ),
        lineValue(
          "Dry-run pipeline ready",
          historicalBackfillExecutionReadiness.prerequisites
            .dry_run_pipeline_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Request contract ready",
          historicalBackfillExecutionReadiness.prerequisites
            .request_contract_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Response parser ready",
          historicalBackfillExecutionReadiness.prerequisites
            .response_parser_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Persistence plan ready",
          historicalBackfillExecutionReadiness.prerequisites
            .persistence_plan_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Provider env present",
          yesNoUnknown(
            historicalBackfillExecutionReadiness.prerequisites
              .provider_env_present,
          ),
        ),
        lineValue(
          "Budget policy present",
          historicalBackfillExecutionReadiness.prerequisites
            .provider_budget_policy_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "Lookahead safety present",
          historicalBackfillExecutionReadiness.prerequisites
            .lookahead_safety_present
            ? "yes"
            : "no",
        ),
        lineValue("Manual approval required", "yes"),
        lineValue("Manual approval gate passed", "no"),
        lineValue(
          "First tiny fetch candidate",
          `disabled / dry-run only / tickers ${tickerListText(historicalBackfillExecutionReadiness.first_fetch_candidate_plan.selected_candidate_tickers)} / days ${historicalBackfillExecutionReadiness.first_fetch_candidate_plan.max_trading_days} / interval ${historicalBackfillExecutionReadiness.first_fetch_candidate_plan.interval}`,
        ),
        lineValue("Ready to call provider", "no"),
        lineValue("Ready to persist candles", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Ready to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Blockers",
          compactListText(historicalBackfillExecutionReadiness.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            historicalBackfillExecutionReadiness.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: historicalBackfillExecutionReadiness.advisory_only,
        readiness_status:
          historicalBackfillExecutionReadiness.readiness_status,
        prerequisites: JSON.stringify(
          historicalBackfillExecutionReadiness.prerequisites,
        ),
        readiness_gates: JSON.stringify(
          historicalBackfillExecutionReadiness.readiness_gates,
        ),
        first_fetch_candidate_plan: JSON.stringify(
          historicalBackfillExecutionReadiness.first_fetch_candidate_plan,
        ),
        migration_applied:
          historicalBackfillExecutionReadiness.prerequisites
            .migration_applied,
        historical_candles_table_detected:
          historicalBackfillExecutionReadiness.prerequisites
            .historical_candles_table_detected,
        historical_candle_fetch_runs_table_detected:
          historicalBackfillExecutionReadiness.prerequisites
            .historical_candle_fetch_runs_table_detected,
        dry_run_pipeline_ready:
          historicalBackfillExecutionReadiness.prerequisites
            .dry_run_pipeline_ready,
        request_contract_ready:
          historicalBackfillExecutionReadiness.prerequisites
            .request_contract_ready,
        response_parser_ready:
          historicalBackfillExecutionReadiness.prerequisites
            .response_parser_ready,
        persistence_plan_ready:
          historicalBackfillExecutionReadiness.prerequisites
            .persistence_plan_ready,
        provider_env_present:
          historicalBackfillExecutionReadiness.prerequisites
            .provider_env_present,
        provider_budget_policy_present:
          historicalBackfillExecutionReadiness.prerequisites
            .provider_budget_policy_present,
        lookahead_safety_present:
          historicalBackfillExecutionReadiness.prerequisites
            .lookahead_safety_present,
        manual_approval_required: true,
        manual_approval_gate_passed: false,
        ready_to_call_provider: false,
        ready_to_persist_candles: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        blockers: historicalBackfillExecutionReadiness.blockers.join(","),
        warnings: historicalBackfillExecutionReadiness.warnings.join(","),
        recommended_next_steps:
          historicalBackfillExecutionReadiness.recommended_next_steps.join(","),
        reason_codes:
          historicalBackfillExecutionReadiness.reason_codes.join(","),
        caution_flags:
          historicalBackfillExecutionReadiness.caution_flags.join(","),
        metadata_gaps:
          historicalBackfillExecutionReadiness.metadata_gaps.join(","),
      },
    }),
    section({
      section_id: "environment_boundary_audit",
      title: "Environment Boundary Audit",
      severity:
        environmentBoundaryAudit.blockers.length > 0
          ? "critical"
          : environmentBoundaryAudit.warnings.length > 0
            ? "warning"
            : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Environment audit only", "yes"),
        lineValue("Node env", environmentBoundaryAudit.app_runtime.node_env),
        lineValue(
          "Vercel env",
          environmentBoundaryAudit.app_runtime.vercel_env,
        ),
        lineValue(
          "Netlify context",
          environmentBoundaryAudit.app_runtime.netlify_context,
        ),
        lineValue(
          "Deploy URL present",
          environmentBoundaryAudit.app_runtime.deploy_url_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "Site URL present",
          environmentBoundaryAudit.app_runtime.site_url_present ? "yes" : "no",
        ),
        lineValue(
          "Production URL expected",
          environmentBoundaryAudit.app_runtime.production_url_expected,
        ),
        lineValue(
          "Public Supabase URL present",
          environmentBoundaryAudit.supabase_refs.public_supabase_url_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "Public Supabase project ref",
          environmentBoundaryAudit.supabase_refs.public_supabase_project_ref,
        ),
        lineValue(
          "Expected production ref",
          environmentBoundaryAudit.supabase_refs.expected_production_ref,
        ),
        lineValue(
          "Known staging ref",
          environmentBoundaryAudit.supabase_refs.known_staging_ref,
        ),
        lineValue(
          "Points to production",
          yesNoUnknown(
            environmentBoundaryAudit.supabase_refs.points_to_production,
          ),
        ),
        lineValue(
          "Points to staging",
          yesNoUnknown(environmentBoundaryAudit.supabase_refs.points_to_staging),
        ),
        lineValue(
          "AUTOMATION_SECRET present",
          environmentBoundaryAudit.secrets_presence.automation_secret_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "AUTOMATION_SECRET length",
          environmentBoundaryAudit.secrets_presence.automation_secret_length,
        ),
        lineValue(
          "TWELVE_DATA_API_KEY present",
          environmentBoundaryAudit.secrets_presence.twelve_data_api_key_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "TWELVE_DATA_API_KEY length",
          environmentBoundaryAudit.secrets_presence.twelve_data_api_key_length,
        ),
        lineValue(
          "SUPABASE_SERVICE_ROLE_KEY present",
          environmentBoundaryAudit.secrets_presence
            .supabase_service_role_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "SUPABASE_SERVICE_ROLE_KEY length",
          environmentBoundaryAudit.secrets_presence
            .supabase_service_role_length,
        ),
        lineValue(
          "App build marker",
          environmentBoundaryAudit.route_versions.app_build_marker,
        ),
        lineValue(
          "First tiny route expected marker",
          environmentBoundaryAudit.route_versions
            .first_tiny_fetch_route_expected_marker,
        ),
        lineValue(
          "Diagnostics route marker present",
          yesNoUnknown(
            environmentBoundaryAudit.route_versions
              .diagnostics_route_marker_present,
          ),
        ),
        lineValue("No secret values returned", "yes"),
        lineValue("No secret hashes returned", "yes"),
        lineValue("Provider fetch added", "no"),
        lineValue("Provider call executed", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Warnings", compactListText(environmentBoundaryAudit.warnings)),
        lineValue(
          "Recommended next steps",
          compactListText(environmentBoundaryAudit.recommended_next_steps),
        ),
      ],
      metrics: {
        advisory_mode: true,
        environment_audit_only: true,
        app_runtime: JSON.stringify(environmentBoundaryAudit.app_runtime),
        supabase_refs: JSON.stringify(environmentBoundaryAudit.supabase_refs),
        secrets_presence: JSON.stringify(
          environmentBoundaryAudit.secrets_presence,
        ),
        route_versions: JSON.stringify(environmentBoundaryAudit.route_versions),
        node_env: environmentBoundaryAudit.app_runtime.node_env,
        vercel_env: environmentBoundaryAudit.app_runtime.vercel_env,
        netlify_context: environmentBoundaryAudit.app_runtime.netlify_context,
        deploy_url_present:
          environmentBoundaryAudit.app_runtime.deploy_url_present,
        site_url_present: environmentBoundaryAudit.app_runtime.site_url_present,
        public_supabase_project_ref:
          environmentBoundaryAudit.supabase_refs.public_supabase_project_ref,
        expected_production_ref:
          environmentBoundaryAudit.supabase_refs.expected_production_ref,
        known_staging_ref:
          environmentBoundaryAudit.supabase_refs.known_staging_ref,
        points_to_production:
          environmentBoundaryAudit.supabase_refs.points_to_production,
        points_to_staging:
          environmentBoundaryAudit.supabase_refs.points_to_staging,
        automation_secret_present:
          environmentBoundaryAudit.secrets_presence.automation_secret_present,
        automation_secret_length:
          environmentBoundaryAudit.secrets_presence.automation_secret_length,
        twelve_data_api_key_present:
          environmentBoundaryAudit.secrets_presence.twelve_data_api_key_present,
        twelve_data_api_key_length:
          environmentBoundaryAudit.secrets_presence.twelve_data_api_key_length,
        supabase_service_role_present:
          environmentBoundaryAudit.secrets_presence
            .supabase_service_role_present,
        supabase_service_role_length:
          environmentBoundaryAudit.secrets_presence.supabase_service_role_length,
        first_tiny_fetch_route_expected_marker:
          environmentBoundaryAudit.route_versions
            .first_tiny_fetch_route_expected_marker,
        diagnostics_route_marker_present:
          environmentBoundaryAudit.route_versions
            .diagnostics_route_marker_present,
        no_secret_values_returned: true,
        no_secret_hashes_returned: true,
        provider_fetch_added: false,
        provider_call_executed: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        blockers: environmentBoundaryAudit.blockers.join(","),
        warnings: environmentBoundaryAudit.warnings.join(","),
        recommended_next_steps:
          environmentBoundaryAudit.recommended_next_steps.join(","),
      },
    }),
    section({
      section_id: "first_tiny_historical_fetch_approval",
      title: "First Tiny Historical Fetch Approval",
      severity:
        firstTinyHistoricalFetchApproval.approval_status === "blocked"
          ? "critical"
          : "warning",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Approval required", "yes"),
        lineValue(
          "Approval status",
          firstTinyHistoricalFetchApproval.approval_status,
        ),
        lineValue("First fetch enabled", "no"),
        lineValue("Dry run only", "yes"),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Max tickers",
          firstTinyHistoricalFetchApproval.candidate_plan.max_tickers,
        ),
        lineValue(
          "Max trading days",
          firstTinyHistoricalFetchApproval.candidate_plan.max_trading_days,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalFetchApproval.candidate_plan.interval,
        ),
        lineValue(
          "Selected ticker",
          tickerListText(
            firstTinyHistoricalFetchApproval.candidate_plan.selected_tickers,
          ),
        ),
        lineValue(
          "Request count limit",
          firstTinyHistoricalFetchApproval.candidate_plan.request_count_limit,
        ),
        lineValue(
          "Estimated credit limit",
          firstTinyHistoricalFetchApproval.candidate_plan.estimated_credit_limit,
        ),
        lineValue(
          "Schema readback ok",
          firstTinyHistoricalFetchApproval.prerequisites.schema_readback_ok
            ? "yes"
            : "no",
        ),
        lineValue(
          "Migration verified",
          firstTinyHistoricalFetchApproval.prerequisites.migration_verified
            ? "yes"
            : "no",
        ),
        lineValue(
          "Provider env present",
          yesNoUnknown(
            firstTinyHistoricalFetchApproval.prerequisites
              .provider_env_present,
          ),
        ),
        lineValue(
          "Budget policy present",
          firstTinyHistoricalFetchApproval.prerequisites.budget_policy_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "Lookahead safety present",
          firstTinyHistoricalFetchApproval.prerequisites.lookahead_safety_present
            ? "yes"
            : "no",
        ),
        lineValue("Manual approval gate passed", "no"),
        lineValue("Ready to call provider now", "no"),
        lineValue("Ready to persist candles now", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Ready to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalFetchApproval.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchApproval.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: firstTinyHistoricalFetchApproval.advisory_only,
        approval_required:
          firstTinyHistoricalFetchApproval.approval_required,
        approval_status:
          firstTinyHistoricalFetchApproval.approval_status,
        approval_source:
          firstTinyHistoricalFetchApproval.approval_source,
        first_fetch_enabled: false,
        dry_run_only: true,
        candidate_plan: JSON.stringify(
          firstTinyHistoricalFetchApproval.candidate_plan,
        ),
        prerequisites: JSON.stringify(
          firstTinyHistoricalFetchApproval.prerequisites,
        ),
        schema_readback_ok:
          firstTinyHistoricalFetchApproval.prerequisites.schema_readback_ok,
        migration_verified:
          firstTinyHistoricalFetchApproval.prerequisites.migration_verified,
        provider_env_present:
          firstTinyHistoricalFetchApproval.prerequisites.provider_env_present,
        budget_policy_present:
          firstTinyHistoricalFetchApproval.prerequisites.budget_policy_present,
        lookahead_safety_present:
          firstTinyHistoricalFetchApproval.prerequisites.lookahead_safety_present,
        manual_approval_gate_passed: false,
        readiness: JSON.stringify(firstTinyHistoricalFetchApproval.readiness),
        ready_to_enable_future_fetch: false,
        ready_to_call_provider_now: false,
        ready_to_persist_candles_now: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        blockers: firstTinyHistoricalFetchApproval.blockers.join(","),
        warnings: firstTinyHistoricalFetchApproval.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalFetchApproval.recommended_next_steps.join(","),
      },
    }),
    section({
      section_id: "first_tiny_historical_fetch_request_preview",
      title: "First Tiny Historical Fetch Request Preview",
      severity:
        firstTinyHistoricalFetchRequestPreview.preview_status === "ready"
          ? "info"
          : "warning",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Preview only", "yes"),
        lineValue(
          "Preview status",
          firstTinyHistoricalFetchRequestPreview.preview_status,
        ),
        lineValue(
          "Approval status",
          firstTinyHistoricalFetchRequestPreview.approval_context
            .approval_status,
        ),
        lineValue("First fetch enabled", "no"),
        lineValue("Dry run only", "yes"),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Endpoint",
          firstTinyHistoricalFetchRequestPreview.request_preview.endpoint,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalFetchRequestPreview.request_preview.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalFetchRequestPreview.request_preview.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalFetchRequestPreview.request_preview.trading_day,
        ),
        lineValue(
          "Timezone",
          firstTinyHistoricalFetchRequestPreview.request_preview.timezone,
        ),
        lineValue(
          "Start date",
          firstTinyHistoricalFetchRequestPreview.provider_parameters_preview
            .start_date,
        ),
        lineValue(
          "End date",
          firstTinyHistoricalFetchRequestPreview.provider_parameters_preview
            .end_date,
        ),
        lineValue(
          "Order",
          firstTinyHistoricalFetchRequestPreview.provider_parameters_preview
            .order,
        ),
        lineValue(
          "Outputsize",
          firstTinyHistoricalFetchRequestPreview.provider_parameters_preview
            .outputsize,
        ),
        lineValue(
          "Session",
          firstTinyHistoricalFetchRequestPreview.request_preview.session,
        ),
        lineValue("Adjusted", "false"),
        lineValue(
          "Cache key",
          firstTinyHistoricalFetchRequestPreview.request_preview.cache_key,
        ),
        lineValue(
          "Request count",
          firstTinyHistoricalFetchRequestPreview.request_preview.request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyHistoricalFetchRequestPreview.request_preview
            .estimated_credits,
        ),
        lineValue("Cache lookup required", "yes"),
        lineValue("Would skip provider if cache hit", "yes"),
        lineValue("Fetch-run audit required", "yes"),
        lineValue("Would create fetch-run record now", "no"),
        lineValue("API key included", "no"),
        lineValue("Ready to call provider now", "no"),
        lineValue("Ready to persist candles now", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Ready to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Provider call executed", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalFetchRequestPreview.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchRequestPreview.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        preview_only: true,
        preview_status:
          firstTinyHistoricalFetchRequestPreview.preview_status,
        approval_context: JSON.stringify(
          firstTinyHistoricalFetchRequestPreview.approval_context,
        ),
        request_preview: JSON.stringify(
          firstTinyHistoricalFetchRequestPreview.request_preview,
        ),
        provider_parameters_preview: JSON.stringify(
          firstTinyHistoricalFetchRequestPreview.provider_parameters_preview,
        ),
        cache_preflight: JSON.stringify(
          firstTinyHistoricalFetchRequestPreview.cache_preflight,
        ),
        fetch_run_audit_preview: JSON.stringify(
          firstTinyHistoricalFetchRequestPreview.fetch_run_audit_preview,
        ),
        first_fetch_enabled: false,
        dry_run_only: true,
        provider: firstTinyHistoricalFetchRequestPreview.request_preview
          .provider,
        endpoint:
          firstTinyHistoricalFetchRequestPreview.request_preview.endpoint,
        ticker: firstTinyHistoricalFetchRequestPreview.request_preview.ticker,
        interval:
          firstTinyHistoricalFetchRequestPreview.request_preview.interval,
        trading_day:
          firstTinyHistoricalFetchRequestPreview.request_preview.trading_day,
        request_count:
          firstTinyHistoricalFetchRequestPreview.request_preview.request_count,
        estimated_credits:
          firstTinyHistoricalFetchRequestPreview.request_preview
            .estimated_credits,
        cache_key:
          firstTinyHistoricalFetchRequestPreview.request_preview.cache_key,
        apikey_included: false,
        ready_to_preview_request:
          firstTinyHistoricalFetchRequestPreview.readiness
            .ready_to_preview_request,
        ready_to_call_provider_now: false,
        ready_to_persist_candles_now: false,
        ready_to_create_fetch_run_now: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        provider_call_executed: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        blockers:
          firstTinyHistoricalFetchRequestPreview.blockers.join(","),
        warnings:
          firstTinyHistoricalFetchRequestPreview.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalFetchRequestPreview.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_fetch_operator_approval",
      title: "First Tiny Historical Fetch Operator Approval",
      severity:
        firstTinyHistoricalFetchOperatorApproval.approval_record_status ===
        "blocked"
          ? "critical"
          : "warning",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Approval record only", "yes"),
        lineValue(
          "Approval record status",
          firstTinyHistoricalFetchOperatorApproval.approval_record_status,
        ),
        lineValue(
          "Approval source",
          firstTinyHistoricalFetchOperatorApproval.approval_source.source_type,
        ),
        lineValue(
          "Source present",
          firstTinyHistoricalFetchOperatorApproval.approval_source
            .source_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "Production safe",
          firstTinyHistoricalFetchOperatorApproval.approval_source
            .production_safe
            ? "yes"
            : "no",
        ),
        lineValue(
          "Operator label",
          firstTinyHistoricalFetchOperatorApproval.approval_source
            .operator_label,
        ),
        lineValue(
          "Approval reference",
          firstTinyHistoricalFetchOperatorApproval.approval_source
            .approval_reference,
        ),
        lineValue(
          "Scope",
          `Twelve Data / ${firstTinyHistoricalFetchOperatorApproval.approval_scope.endpoint} / ${firstTinyHistoricalFetchOperatorApproval.approval_scope.ticker} / ${firstTinyHistoricalFetchOperatorApproval.approval_scope.interval} / ${firstTinyHistoricalFetchOperatorApproval.approval_scope.request_count_limit} request / ${firstTinyHistoricalFetchOperatorApproval.approval_scope.estimated_credit_limit} credit`,
        ),
        lineValue("Cache lookup required", "yes"),
        lineValue("Fetch-run audit required", "yes"),
        lineValue("Persist allowed", "no"),
        lineValue("Replay allowed", "no"),
        lineValue("Scanner effect allowed", "no"),
        lineValue(
          "Schema readback ok",
          firstTinyHistoricalFetchOperatorApproval.prerequisites
            .schema_readback_ok
            ? "yes"
            : "no",
        ),
        lineValue(
          "Execution readiness ready_for_manual_review",
          firstTinyHistoricalFetchOperatorApproval.prerequisites
            .execution_readiness_ready_for_manual_review
            ? "yes"
            : "no",
        ),
        lineValue(
          "Approval gate pending manual review",
          firstTinyHistoricalFetchOperatorApproval.prerequisites
            .approval_gate_pending_manual_review
            ? "yes"
            : "no",
        ),
        lineValue(
          "Request preview ready",
          firstTinyHistoricalFetchOperatorApproval.prerequisites
            .request_preview_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready for operator decision",
          firstTinyHistoricalFetchOperatorApproval.readiness
            .ready_for_operator_decision
            ? "yes"
            : "no",
        ),
        lineValue("Ready to call provider now", "no"),
        lineValue("Ready to persist candles now", "no"),
        lineValue("Ready to create fetch-run now", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Ready to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Provider call executed", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalFetchOperatorApproval.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchOperatorApproval.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        approval_record_only: true,
        approval_record_status:
          firstTinyHistoricalFetchOperatorApproval.approval_record_status,
        approval_source: JSON.stringify(
          firstTinyHistoricalFetchOperatorApproval.approval_source,
        ),
        approval_scope: JSON.stringify(
          firstTinyHistoricalFetchOperatorApproval.approval_scope,
        ),
        prerequisites: JSON.stringify(
          firstTinyHistoricalFetchOperatorApproval.prerequisites,
        ),
        readiness: JSON.stringify(
          firstTinyHistoricalFetchOperatorApproval.readiness,
        ),
        source_type:
          firstTinyHistoricalFetchOperatorApproval.approval_source.source_type,
        source_present:
          firstTinyHistoricalFetchOperatorApproval.approval_source
            .source_present,
        production_safe:
          firstTinyHistoricalFetchOperatorApproval.approval_source
            .production_safe,
        ticker:
          firstTinyHistoricalFetchOperatorApproval.approval_scope.ticker,
        interval:
          firstTinyHistoricalFetchOperatorApproval.approval_scope.interval,
        request_count_limit:
          firstTinyHistoricalFetchOperatorApproval.approval_scope
            .request_count_limit,
        estimated_credit_limit:
          firstTinyHistoricalFetchOperatorApproval.approval_scope
            .estimated_credit_limit,
        persist_allowed: false,
        replay_allowed: false,
        scanner_effect_allowed: false,
        ready_for_operator_decision:
          firstTinyHistoricalFetchOperatorApproval.readiness
            .ready_for_operator_decision,
        ready_to_enable_future_fetch: false,
        ready_to_call_provider_now: false,
        ready_to_persist_candles_now: false,
        ready_to_create_fetch_run_now: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        provider_call_executed: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        blockers:
          firstTinyHistoricalFetchOperatorApproval.blockers.join(","),
        warnings:
          firstTinyHistoricalFetchOperatorApproval.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalFetchOperatorApproval.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_fetch_execution_plan",
      title: "First Tiny Historical Fetch Execution Plan",
      severity:
        firstTinyHistoricalFetchExecutionPlan.execution_plan_status ===
        "ready_for_future_approval"
          ? "info"
          : "warning",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Execution plan only", "yes"),
        lineValue(
          "Execution plan status",
          firstTinyHistoricalFetchExecutionPlan.execution_plan_status,
        ),
        lineValue(
          "Operator approval status",
          firstTinyHistoricalFetchExecutionPlan.execution_context
            .operator_approval_status,
        ),
        lineValue(
          "Request preview status",
          firstTinyHistoricalFetchExecutionPlan.execution_context
            .request_preview_status,
        ),
        lineValue("First fetch enabled", "no"),
        lineValue("Dry run only", "yes"),
        lineValue("Provider call allowed now", "no"),
        lineValue("Persistence allowed now", "no"),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Endpoint",
          firstTinyHistoricalFetchExecutionPlan.request_scope.endpoint,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalFetchExecutionPlan.request_scope.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalFetchExecutionPlan.request_scope.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalFetchExecutionPlan.request_scope.trading_day,
        ),
        lineValue(
          "Request count",
          firstTinyHistoricalFetchExecutionPlan.request_scope.request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyHistoricalFetchExecutionPlan.request_scope.estimated_credits,
        ),
        lineValue(
          "Cache key",
          firstTinyHistoricalFetchExecutionPlan.request_scope.cache_key,
        ),
        lineValue("Cache lookup required", "yes"),
        lineValue("Fetch-run audit required", "yes"),
        ...firstTinyHistoricalFetchExecutionPlan.planned_steps.map((step) =>
          lineValue(
            `Planned step ${step.order}`,
            `${step.step_id} / ${step.status.replaceAll("_", " ")} / executes now no`,
          ),
        ),
        lineValue(
          "Ready to review execution plan",
          firstTinyHistoricalFetchExecutionPlan.readiness
            .ready_to_review_execution_plan
            ? "yes"
            : "no",
        ),
        lineValue("Ready to execute now", "no"),
        lineValue("Ready to call provider now", "no"),
        lineValue("Ready to persist candles now", "no"),
        lineValue("Ready to create fetch-run now", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Ready to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Provider call executed", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalFetchExecutionPlan.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchExecutionPlan.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        execution_plan_only: true,
        execution_plan_status:
          firstTinyHistoricalFetchExecutionPlan.execution_plan_status,
        execution_context: JSON.stringify(
          firstTinyHistoricalFetchExecutionPlan.execution_context,
        ),
        planned_steps: JSON.stringify(
          firstTinyHistoricalFetchExecutionPlan.planned_steps,
        ),
        request_scope: JSON.stringify(
          firstTinyHistoricalFetchExecutionPlan.request_scope,
        ),
        execution_limits: JSON.stringify(
          firstTinyHistoricalFetchExecutionPlan.execution_limits,
        ),
        operator_approval_status:
          firstTinyHistoricalFetchExecutionPlan.execution_context
            .operator_approval_status,
        request_preview_status:
          firstTinyHistoricalFetchExecutionPlan.execution_context
            .request_preview_status,
        first_fetch_enabled: false,
        dry_run_only: true,
        provider_call_allowed_now: false,
        persistence_allowed_now: false,
        ticker: firstTinyHistoricalFetchExecutionPlan.request_scope.ticker,
        interval: firstTinyHistoricalFetchExecutionPlan.request_scope.interval,
        trading_day:
          firstTinyHistoricalFetchExecutionPlan.request_scope.trading_day,
        request_count:
          firstTinyHistoricalFetchExecutionPlan.request_scope.request_count,
        estimated_credits:
          firstTinyHistoricalFetchExecutionPlan.request_scope.estimated_credits,
        cache_key: firstTinyHistoricalFetchExecutionPlan.request_scope.cache_key,
        ready_to_review_execution_plan:
          firstTinyHistoricalFetchExecutionPlan.readiness
            .ready_to_review_execution_plan,
        ready_to_execute_now: false,
        ready_to_call_provider_now: false,
        ready_to_persist_candles_now: false,
        ready_to_create_fetch_run_now: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        provider_call_executed: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        blockers: firstTinyHistoricalFetchExecutionPlan.blockers.join(","),
        warnings: firstTinyHistoricalFetchExecutionPlan.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalFetchExecutionPlan.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_fetch_approval_signal_readiness",
      title: "First Tiny Historical Fetch Approval Signal Readiness",
      severity:
        firstTinyHistoricalFetchApprovalSignalReadiness.approval_signal_status ===
          "invalid" ||
        firstTinyHistoricalFetchApprovalSignalReadiness.approval_signal_status ===
          "blocked"
          ? "critical"
          : "warning",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Approval signal readiness only", "yes"),
        lineValue(
          "Approval signal status",
          firstTinyHistoricalFetchApprovalSignalReadiness.approval_signal_status,
        ),
        lineValue(
          "Supported signal sources",
          firstTinyHistoricalFetchApprovalSignalReadiness.supported_signal_sources.join(
            ", ",
          ),
        ),
        lineValue(
          "Source type",
          firstTinyHistoricalFetchApprovalSignalReadiness.detected_signal
            .source_type,
        ),
        lineValue(
          "Source present",
          firstTinyHistoricalFetchApprovalSignalReadiness.detected_signal
            .source_present
            ? "yes"
            : "no",
        ),
        lineValue("Signal active", "no"),
        lineValue("Expected provider", "Twelve Data"),
        lineValue(
          "Expected ticker",
          firstTinyHistoricalFetchApprovalSignalReadiness
            .expected_signal_contract.expected_ticker,
        ),
        lineValue(
          "Expected interval",
          firstTinyHistoricalFetchApprovalSignalReadiness
            .expected_signal_contract.expected_interval,
        ),
        lineValue(
          "Expected max requests",
          firstTinyHistoricalFetchApprovalSignalReadiness
            .expected_signal_contract.expected_max_requests,
        ),
        lineValue(
          "Expected estimated credits",
          firstTinyHistoricalFetchApprovalSignalReadiness
            .expected_signal_contract.expected_max_estimated_credits,
        ),
        lineValue("Expected persist allowed", "no"),
        lineValue("Expected replay allowed", "no"),
        lineValue("Expected scanner effect allowed", "no"),
        lineValue(
          "Operator approval record ready",
          firstTinyHistoricalFetchApprovalSignalReadiness.prerequisites
            .operator_approval_record_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Request preview ready",
          firstTinyHistoricalFetchApprovalSignalReadiness.prerequisites
            .request_preview_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Execution plan ready for future approval",
          firstTinyHistoricalFetchApprovalSignalReadiness.prerequisites
            .execution_plan_ready_for_future_approval
            ? "yes"
            : "no",
        ),
        lineValue(
          "Schema readback ok",
          firstTinyHistoricalFetchApprovalSignalReadiness.prerequisites
            .schema_readback_ok
            ? "yes"
            : "no",
        ),
        lineValue(
          "Signal shape valid",
          firstTinyHistoricalFetchApprovalSignalReadiness.validation
            .signal_shape_valid
            ? "yes"
            : "no",
        ),
        lineValue(
          "Scope matches preview",
          yesNoUnknown(
            firstTinyHistoricalFetchApprovalSignalReadiness.detected_signal
              .scope_matches_preview,
          ),
        ),
        lineValue(
          "Ready to review signal contract",
          firstTinyHistoricalFetchApprovalSignalReadiness.readiness
            .ready_to_review_signal_contract
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to accept future signal",
          firstTinyHistoricalFetchApprovalSignalReadiness.readiness
            .ready_to_accept_future_signal
            ? "yes"
            : "no",
        ),
        lineValue("Ready to enable future fetch", "no"),
        lineValue("Ready to execute now", "no"),
        lineValue("Ready to call provider now", "no"),
        lineValue("Ready to persist candles now", "no"),
        lineValue("Ready to create fetch-run now", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Ready to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Provider call executed", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalFetchApprovalSignalReadiness.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchApprovalSignalReadiness
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        approval_signal_readiness_only: true,
        approval_signal_status:
          firstTinyHistoricalFetchApprovalSignalReadiness.approval_signal_status,
        supported_signal_sources:
          firstTinyHistoricalFetchApprovalSignalReadiness.supported_signal_sources.join(
            ",",
          ),
        expected_signal_contract: JSON.stringify(
          firstTinyHistoricalFetchApprovalSignalReadiness.expected_signal_contract,
        ),
        detected_signal: JSON.stringify(
          firstTinyHistoricalFetchApprovalSignalReadiness.detected_signal,
        ),
        validation: JSON.stringify(
          firstTinyHistoricalFetchApprovalSignalReadiness.validation,
        ),
        prerequisites: JSON.stringify(
          firstTinyHistoricalFetchApprovalSignalReadiness.prerequisites,
        ),
        source_type:
          firstTinyHistoricalFetchApprovalSignalReadiness.detected_signal
            .source_type,
        source_present:
          firstTinyHistoricalFetchApprovalSignalReadiness.detected_signal
            .source_present,
        signal_active: false,
        expected_ticker:
          firstTinyHistoricalFetchApprovalSignalReadiness
            .expected_signal_contract.expected_ticker,
        expected_interval:
          firstTinyHistoricalFetchApprovalSignalReadiness
            .expected_signal_contract.expected_interval,
        expected_max_requests: 1,
        expected_max_estimated_credits: 1,
        expected_persist_allowed: false,
        expected_replay_allowed: false,
        expected_scanner_effect_allowed: false,
        ready_to_review_signal_contract:
          firstTinyHistoricalFetchApprovalSignalReadiness.readiness
            .ready_to_review_signal_contract,
        ready_to_accept_future_signal:
          firstTinyHistoricalFetchApprovalSignalReadiness.readiness
            .ready_to_accept_future_signal,
        ready_to_enable_future_fetch: false,
        ready_to_execute_now: false,
        ready_to_call_provider_now: false,
        ready_to_persist_candles_now: false,
        ready_to_create_fetch_run_now: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        provider_call_executed: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        blockers:
          firstTinyHistoricalFetchApprovalSignalReadiness.blockers.join(","),
        warnings:
          firstTinyHistoricalFetchApprovalSignalReadiness.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalFetchApprovalSignalReadiness.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_fetch_final_preflight",
      title: "First Tiny Historical Fetch Final Preflight",
      severity:
        firstTinyHistoricalFetchFinalPreflight.preflight_status ===
        "ready_to_propose_first_provider_call_action"
          ? "warning"
          : "critical",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue("Final preflight only", "yes"),
        lineValue(
          "Preflight status",
          firstTinyHistoricalFetchFinalPreflight.preflight_status,
        ),
        lineValue(
          "Storage verified",
          firstTinyHistoricalFetchFinalPreflight.chain_status.storage_verified
            ? "yes"
            : "no",
        ),
        lineValue(
          "Execution readiness ready for manual review",
          firstTinyHistoricalFetchFinalPreflight.chain_status
            .execution_readiness_ready_for_manual_review
            ? "yes"
            : "no",
        ),
        lineValue(
          "Approval gate pending manual review",
          firstTinyHistoricalFetchFinalPreflight.chain_status
            .approval_gate_pending_manual_review
            ? "yes"
            : "no",
        ),
        lineValue(
          "Request preview ready",
          firstTinyHistoricalFetchFinalPreflight.chain_status
            .request_preview_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Operator approval ready for decision",
          firstTinyHistoricalFetchFinalPreflight.chain_status
            .operator_approval_ready_for_decision
            ? "yes"
            : "no",
        ),
        lineValue(
          "Execution plan ready for future approval",
          firstTinyHistoricalFetchFinalPreflight.chain_status
            .execution_plan_ready_for_future_approval
            ? "yes"
            : "no",
        ),
        lineValue(
          "Approval signal contract ready",
          firstTinyHistoricalFetchFinalPreflight.chain_status
            .approval_signal_contract_ready
            ? "yes"
            : "no",
        ),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Endpoint",
          firstTinyHistoricalFetchFinalPreflight.request_scope.endpoint,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalFetchFinalPreflight.request_scope.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalFetchFinalPreflight.request_scope.interval,
        ),
        lineValue(
          "Request count",
          firstTinyHistoricalFetchFinalPreflight.request_scope.request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyHistoricalFetchFinalPreflight.request_scope
            .estimated_credits,
        ),
        lineValue("Cache lookup required", "yes"),
        lineValue("Fetch-run audit required", "yes"),
        lineValue("Persist allowed", "no"),
        lineValue("Replay allowed", "no"),
        lineValue("Scanner effect allowed", "no"),
        lineValue(
          "Provider env present",
          yesNoUnknown(
            firstTinyHistoricalFetchFinalPreflight.preflight_checks
              .provider_env_present,
          ),
        ),
        lineValue(
          "Budget policy present",
          firstTinyHistoricalFetchFinalPreflight.preflight_checks
            .budget_policy_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "Lookahead safety present",
          firstTinyHistoricalFetchFinalPreflight.preflight_checks
            .lookahead_safety_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "Pause near scan windows",
          firstTinyHistoricalFetchFinalPreflight.preflight_checks
            .pause_near_scan_windows
            ? "yes"
            : "no",
        ),
        lineValue(
          "Pause on provider warnings",
          firstTinyHistoricalFetchFinalPreflight.preflight_checks
            .pause_on_provider_warnings
            ? "yes"
            : "no",
        ),
        lineValue("Explicit separate action required", "yes"),
        lineValue(
          "Ready to review final preflight",
          firstTinyHistoricalFetchFinalPreflight.readiness
            .ready_to_review_final_preflight
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to propose first provider-call action",
          firstTinyHistoricalFetchFinalPreflight.readiness
            .ready_to_propose_first_provider_call_action
            ? "yes"
            : "no",
        ),
        lineValue("Ready to execute now", "no"),
        lineValue("Ready to call provider now", "no"),
        lineValue("Ready to persist candles now", "no"),
        lineValue("Ready to create fetch-run now", "no"),
        lineValue("Ready to create synthetic outcomes", "no"),
        lineValue("Ready to run replay", "no"),
        lineValue("Ready to affect scanner", "no"),
        lineValue("Provider fetch added", "no"),
        lineValue("Historical fetch added", "no"),
        lineValue("Provider call executed", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalFetchFinalPreflight.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchFinalPreflight.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        final_preflight_only: true,
        preflight_status:
          firstTinyHistoricalFetchFinalPreflight.preflight_status,
        chain_status: JSON.stringify(
          firstTinyHistoricalFetchFinalPreflight.chain_status,
        ),
        request_scope: JSON.stringify(
          firstTinyHistoricalFetchFinalPreflight.request_scope,
        ),
        preflight_checks: JSON.stringify(
          firstTinyHistoricalFetchFinalPreflight.preflight_checks,
        ),
        provider: firstTinyHistoricalFetchFinalPreflight.request_scope.provider,
        endpoint: firstTinyHistoricalFetchFinalPreflight.request_scope.endpoint,
        ticker: firstTinyHistoricalFetchFinalPreflight.request_scope.ticker,
        interval: firstTinyHistoricalFetchFinalPreflight.request_scope.interval,
        request_count:
          firstTinyHistoricalFetchFinalPreflight.request_scope.request_count,
        estimated_credits:
          firstTinyHistoricalFetchFinalPreflight.request_scope
            .estimated_credits,
        ready_to_review_final_preflight:
          firstTinyHistoricalFetchFinalPreflight.readiness
            .ready_to_review_final_preflight,
        ready_to_propose_first_provider_call_action:
          firstTinyHistoricalFetchFinalPreflight.readiness
            .ready_to_propose_first_provider_call_action,
        ready_to_execute_now: false,
        ready_to_call_provider_now: false,
        ready_to_persist_candles_now: false,
        ready_to_create_fetch_run_now: false,
        ready_to_create_synthetic_outcomes: false,
        ready_to_run_replay: false,
        ready_to_affect_scanner: false,
        provider_fetch_added: false,
        historical_fetch_added: false,
        provider_call_executed: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_separate_action_for_provider_call: true,
        blockers: firstTinyHistoricalFetchFinalPreflight.blockers.join(","),
        warnings: firstTinyHistoricalFetchFinalPreflight.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalFetchFinalPreflight.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_fetch_provider_dry_execute",
      title: "First Tiny Historical Fetch Provider Dry Execute",
      severity:
        firstTinyHistoricalFetchProviderDryExecute.execution_status ===
          "provider_call_failed_no_persist" ||
        firstTinyHistoricalFetchProviderDryExecute.execution_status === "blocked"
          ? "critical"
          : "warning",
      lines: [
        lineValue("Dry execute only", "yes"),
        lineValue("Provider call capable", "yes"),
        lineValue(
          "Execution status",
          firstTinyHistoricalFetchProviderDryExecute.execution_status,
        ),
        lineValue(
          "Approval signal valid for execution",
          firstTinyHistoricalFetchProviderDryExecute.approval_context
            .signal_valid_for_execution
            ? "yes"
            : "no",
        ),
        lineValue(
          "Signal active",
          firstTinyHistoricalFetchProviderDryExecute.approval_context
            .signal_active
            ? "yes"
            : "no",
        ),
        lineValue(
          "Operator label",
          firstTinyHistoricalFetchProviderDryExecute.approval_context
            .operator_label ?? "none",
        ),
        lineValue(
          "Approval reference",
          firstTinyHistoricalFetchProviderDryExecute.approval_context
            .approval_reference ?? "none",
        ),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Endpoint",
          firstTinyHistoricalFetchProviderDryExecute.request_scope.endpoint,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalFetchProviderDryExecute.request_scope.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalFetchProviderDryExecute.request_scope.interval,
        ),
        lineValue(
          "Request count",
          firstTinyHistoricalFetchProviderDryExecute.request_scope
            .request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyHistoricalFetchProviderDryExecute.request_scope
            .estimated_credits,
        ),
        lineValue(
          "Cache lookup attempted",
          firstTinyHistoricalFetchProviderDryExecute.cache_preflight
            .cache_lookup_attempted
            ? "yes"
            : "no",
        ),
        lineValue(
          "Cache hit",
          yesNoUnknown(
            firstTinyHistoricalFetchProviderDryExecute.cache_preflight
              .cache_hit,
          ),
        ),
        lineValue(
          "Provider skipped due cache hit",
          firstTinyHistoricalFetchProviderDryExecute.cache_preflight
            .provider_skipped_due_cache_hit
            ? "yes"
            : "no",
        ),
        lineValue(
          "Provider call attempted",
          firstTinyHistoricalFetchProviderDryExecute.provider_result
            .call_attempted
            ? "yes"
            : "no",
        ),
        lineValue(
          "Provider call succeeded",
          firstTinyHistoricalFetchProviderDryExecute.provider_result
            .call_succeeded
            ? "yes"
            : "no",
        ),
        lineValue(
          "Provider error type",
          firstTinyHistoricalFetchProviderDryExecute.provider_result
            .provider_error_type ?? "none",
        ),
        lineValue(
          "Raw response received",
          firstTinyHistoricalFetchProviderDryExecute.provider_result
            .raw_response_received
            ? "yes"
            : "no",
        ),
        lineValue("Raw response persisted", "no"),
        lineValue(
          "Parse attempted",
          firstTinyHistoricalFetchProviderDryExecute.parser_result
            .parse_attempted
            ? "yes"
            : "no",
        ),
        lineValue(
          "Parse status",
          firstTinyHistoricalFetchProviderDryExecute.parser_result.parse_status,
        ),
        lineValue(
          "Raw/normalized/valid/invalid candles",
          `${firstTinyHistoricalFetchProviderDryExecute.parser_result.raw_candles}/${firstTinyHistoricalFetchProviderDryExecute.parser_result.normalized_candles}/${firstTinyHistoricalFetchProviderDryExecute.parser_result.valid_candles}/${firstTinyHistoricalFetchProviderDryExecute.parser_result.invalid_candles}`,
        ),
        lineValue(
          "Planned inserts/updates/skips/rejections",
          `${firstTinyHistoricalFetchProviderDryExecute.persistence_plan.planned_inserts}/${firstTinyHistoricalFetchProviderDryExecute.persistence_plan.planned_updates}/${firstTinyHistoricalFetchProviderDryExecute.persistence_plan.planned_skips}/${firstTinyHistoricalFetchProviderDryExecute.persistence_plan.planned_invalid_rejections}`,
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue("Max one request enforced", "yes"),
        lineValue("Max one ticker enforced", "yes"),
        lineValue("No persistence enforced", "yes"),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalFetchProviderDryExecute.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchProviderDryExecute.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        dry_execute_only: true,
        provider_call_capable: true,
        execution_status:
          firstTinyHistoricalFetchProviderDryExecute.execution_status,
        approval_context: JSON.stringify(
          firstTinyHistoricalFetchProviderDryExecute.approval_context,
        ),
        request_scope: JSON.stringify(
          firstTinyHistoricalFetchProviderDryExecute.request_scope,
        ),
        preflight: JSON.stringify(
          firstTinyHistoricalFetchProviderDryExecute.preflight,
        ),
        cache_preflight: JSON.stringify(
          firstTinyHistoricalFetchProviderDryExecute.cache_preflight,
        ),
        provider_result: JSON.stringify(
          firstTinyHistoricalFetchProviderDryExecute.provider_result,
        ),
        parser_result: JSON.stringify(
          firstTinyHistoricalFetchProviderDryExecute.parser_result,
        ),
        persistence_plan: JSON.stringify(
          firstTinyHistoricalFetchProviderDryExecute.persistence_plan,
        ),
        provider_call_executed:
          firstTinyHistoricalFetchProviderDryExecute.provider_call_executed,
        provider_call_attempted:
          firstTinyHistoricalFetchProviderDryExecute.provider_result
            .call_attempted,
        provider_call_succeeded:
          firstTinyHistoricalFetchProviderDryExecute.provider_result
            .call_succeeded,
        raw_response_persisted: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        max_one_request_enforced: true,
        max_one_ticker_enforced: true,
        no_persistence_enforced: true,
        api_key_included_in_diagnostics: false,
        blockers: firstTinyHistoricalFetchProviderDryExecute.blockers.join(","),
        warnings: firstTinyHistoricalFetchProviderDryExecute.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalFetchProviderDryExecute.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "first_tiny_historical_fetch_no_persist_result_verification",
      title: "First Tiny Historical Fetch No-Persist Verification",
      severity: "warning",
      lines: [
        lineValue(
          "Verification status",
          firstTinyHistoricalFetchNoPersistVerification.verification_status,
        ),
        lineValue(
          "Latest manual result",
          firstTinyHistoricalFetchNoPersistVerification.provider_result
            .execution_status,
        ),
        lineValue(
          "Manual result timestamp",
          firstTinyHistoricalFetchNoPersistVerification
            .manual_result_timestamp ?? "not recorded",
        ),
        lineValue(
          "Provider call executed",
          firstTinyHistoricalFetchNoPersistVerification.provider_result
            .provider_call_executed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Provider call succeeded",
          firstTinyHistoricalFetchNoPersistVerification.provider_result
            .call_succeeded
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalFetchNoPersistVerification.request_scope.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalFetchNoPersistVerification.request_scope.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalFetchNoPersistVerification.request_scope
            .trading_day,
        ),
        lineValue(
          "Request count",
          firstTinyHistoricalFetchNoPersistVerification.request_scope
            .request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyHistoricalFetchNoPersistVerification.request_scope
            .estimated_credits,
        ),
        lineValue(
          "Cache lookup attempted",
          firstTinyHistoricalFetchNoPersistVerification.cache_result
            .cache_lookup_attempted
            ? "yes"
            : "no",
        ),
        lineValue(
          "Cache hit",
          firstTinyHistoricalFetchNoPersistVerification.cache_result.cache_hit
            ? "yes"
            : "no",
        ),
        lineValue(
          "Raw/normalized/valid/invalid candles",
          `${firstTinyHistoricalFetchNoPersistVerification.parser_result.raw_candles}/${firstTinyHistoricalFetchNoPersistVerification.parser_result.normalized_candles}/${firstTinyHistoricalFetchNoPersistVerification.parser_result.valid_candles}/${firstTinyHistoricalFetchNoPersistVerification.parser_result.invalid_candles}`,
        ),
        lineValue(
          "Planned inserts/updates/skips/rejections",
          `${firstTinyHistoricalFetchNoPersistVerification.persistence_plan.planned_inserts}/${firstTinyHistoricalFetchNoPersistVerification.persistence_plan.planned_updates}/${firstTinyHistoricalFetchNoPersistVerification.persistence_plan.planned_skips}/${firstTinyHistoricalFetchNoPersistVerification.persistence_plan.planned_invalid_rejections}`,
        ),
        lineValue("Raw response persisted", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Approval lock warning",
          "disable_first_tiny_fetch_approval_signal_after_successful_no_persist_test",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchNoPersistVerification
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        read_only_static_verification: true,
        verification_status:
          firstTinyHistoricalFetchNoPersistVerification.verification_status,
        verification_marker:
          firstTinyHistoricalFetchNoPersistVerification.verification_marker,
        latest_manual_result:
          firstTinyHistoricalFetchNoPersistVerification.provider_result
            .execution_status,
        route_used: firstTinyHistoricalFetchNoPersistVerification.route_used,
        manual_result_timestamp:
          firstTinyHistoricalFetchNoPersistVerification
            .manual_result_timestamp,
        approval_signal_status:
          firstTinyHistoricalFetchNoPersistVerification.approval_context
            .approval_signal_status,
        signal_active:
          firstTinyHistoricalFetchNoPersistVerification.approval_context
            .signal_active,
        signal_valid_for_execution:
          firstTinyHistoricalFetchNoPersistVerification.approval_context
            .signal_valid_for_execution,
        operator_label:
          firstTinyHistoricalFetchNoPersistVerification.approval_context
            .operator_label,
        approval_reference:
          firstTinyHistoricalFetchNoPersistVerification.approval_context
            .approval_reference,
        provider:
          firstTinyHistoricalFetchNoPersistVerification.request_scope.provider,
        endpoint:
          firstTinyHistoricalFetchNoPersistVerification.request_scope.endpoint,
        ticker:
          firstTinyHistoricalFetchNoPersistVerification.request_scope.ticker,
        interval:
          firstTinyHistoricalFetchNoPersistVerification.request_scope.interval,
        trading_day:
          firstTinyHistoricalFetchNoPersistVerification.request_scope
            .trading_day,
        request_count:
          firstTinyHistoricalFetchNoPersistVerification.request_scope
            .request_count,
        estimated_credits:
          firstTinyHistoricalFetchNoPersistVerification.request_scope
            .estimated_credits,
        cache_lookup_attempted:
          firstTinyHistoricalFetchNoPersistVerification.cache_result
            .cache_lookup_attempted,
        cache_hit:
          firstTinyHistoricalFetchNoPersistVerification.cache_result.cache_hit,
        provider_call_executed:
          firstTinyHistoricalFetchNoPersistVerification.provider_result
            .provider_call_executed,
        provider_call_succeeded:
          firstTinyHistoricalFetchNoPersistVerification.provider_result
            .call_succeeded,
        raw_candles:
          firstTinyHistoricalFetchNoPersistVerification.parser_result
            .raw_candles,
        normalized_candles:
          firstTinyHistoricalFetchNoPersistVerification.parser_result
            .normalized_candles,
        valid_candles:
          firstTinyHistoricalFetchNoPersistVerification.parser_result
            .valid_candles,
        invalid_candles:
          firstTinyHistoricalFetchNoPersistVerification.parser_result
            .invalid_candles,
        planned_inserts:
          firstTinyHistoricalFetchNoPersistVerification.persistence_plan
            .planned_inserts,
        planned_updates:
          firstTinyHistoricalFetchNoPersistVerification.persistence_plan
            .planned_updates,
        planned_skips:
          firstTinyHistoricalFetchNoPersistVerification.persistence_plan
            .planned_skips,
        planned_invalid_rejections:
          firstTinyHistoricalFetchNoPersistVerification.persistence_plan
            .planned_invalid_rejections,
        raw_response_persisted: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        no_persistence_enforced: true,
        recommended_next_steps:
          firstTinyHistoricalFetchNoPersistVerification.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_fetch_run_audit_write_plan",
      title: "First Tiny Fetch-Run Audit Write Plan",
      severity: "warning",
      lines: [
        lineValue(
          "Status",
          `${firstTinyHistoricalFetchRunAuditWritePlan.status} / ${firstTinyHistoricalFetchRunAuditWritePlan.plan_mode.replaceAll("_", " ")}`,
        ),
        lineValue(
          "Source verification",
          firstTinyHistoricalFetchRunAuditWritePlan.source_verification,
        ),
        lineValue(
          "Target table",
          firstTinyHistoricalFetchRunAuditWritePlan.target_table,
        ),
        lineValue(
          "Table detected",
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .table_detected,
        ),
        lineValue(
          "RLS enabled",
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .rls_enabled,
        ),
        lineValue(
          "Service-role-only path expected",
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .service_role_only_path_expected
            ? "yes"
            : "no",
        ),
        lineValue(
          "Client writes allowed",
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .client_writes_allowed,
        ),
        lineValue(
          "Write allowed now",
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .fetch_run_write_allowed_now
            ? "yes"
            : "no",
        ),
        lineValue("Fetch run persisted", "no"),
        lineValue(
          "Ticker",
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .trading_day,
        ),
        lineValue(
          "Planned audit rows",
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .planned_audit_rows,
        ),
        lineValue(
          "Request count",
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .request_count,
        ),
        lineValue(
          "Valid candles from source result",
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .valid_candles,
        ),
        lineValue(
          "Candle rows to persist",
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .candle_rows_to_persist,
        ),
        lineValue(
          "Raw response to persist",
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .raw_response_to_persist
            ? "yes"
            : "no",
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Replay to run", "no"),
        lineValue("Scanner effect", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Requires separate operator approval",
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .requires_separate_operator_approval
            ? "yes"
            : "no",
        ),
        lineValue(
          "Future approval active now",
          firstTinyHistoricalFetchRunAuditWritePlan.future_approval_contract
            .active_now
            ? "yes"
            : "no",
        ),
        lineValue(
          "Future env contract",
          compactListText(
            firstTinyHistoricalFetchRunAuditWritePlan.future_approval_contract
              .env_names,
          ),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalFetchRunAuditWritePlan.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        dry_run_only:
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate.dry_run_only,
        status: firstTinyHistoricalFetchRunAuditWritePlan.status,
        plan_mode: firstTinyHistoricalFetchRunAuditWritePlan.plan_mode,
        source_verification:
          firstTinyHistoricalFetchRunAuditWritePlan.source_verification,
        target_table: firstTinyHistoricalFetchRunAuditWritePlan.target_table,
        table_detected:
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .table_detected,
        rls_enabled:
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .rls_enabled,
        service_role_only_path_expected:
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .service_role_only_path_expected,
        client_writes_allowed:
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .client_writes_allowed,
        schema_readback_attempted:
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .schema_readback_attempted,
        schema_readback_status:
          firstTinyHistoricalFetchRunAuditWritePlan.table_readiness
            .schema_readback_status,
        fetch_run_write_allowed_now:
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .fetch_run_write_allowed_now,
        fetch_run_persisted: false,
        candles_persisted: false,
        raw_response_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        requires_separate_operator_approval:
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .requires_separate_operator_approval,
        planned_audit_rows:
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .planned_audit_rows,
        candle_rows_to_persist:
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .candle_rows_to_persist,
        raw_response_to_persist:
          firstTinyHistoricalFetchRunAuditWritePlan.write_gate
            .raw_response_to_persist,
        provider:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .provider,
        endpoint:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .endpoint,
        ticker:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .ticker,
        interval:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .interval,
        trading_day:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .trading_day,
        request_count:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .request_count,
        estimated_credits:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .estimated_credits,
        call_attempted:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .call_attempted,
        call_succeeded:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .call_succeeded,
        http_status:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .http_status,
        parse_status:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .parse_status,
        raw_candles:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .raw_candles,
        normalized_candles:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .normalized_candles,
        valid_candles:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .valid_candles,
        invalid_candles:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .invalid_candles,
        planned_inserts:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .planned_inserts,
        planned_updates:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .planned_updates,
        planned_skips:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .planned_skips,
        planned_invalid_rejections:
          firstTinyHistoricalFetchRunAuditWritePlan.planned_audit_record
            .planned_invalid_rejections,
        future_approval_active_now:
          firstTinyHistoricalFetchRunAuditWritePlan.future_approval_contract
            .active_now,
        future_approval_env_names:
          firstTinyHistoricalFetchRunAuditWritePlan.future_approval_contract
            .env_names.join(","),
        future_approval_validation_rules:
          firstTinyHistoricalFetchRunAuditWritePlan.future_approval_contract
            .validation_rules.join(","),
        recommended_next_steps:
          firstTinyHistoricalFetchRunAuditWritePlan.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_fetch_run_audit_write_approval",
      title: "First Tiny Fetch-Run Audit Write Approval",
      severity:
        firstTinyFetchRunAuditWriteApproval.approval_status === "invalid"
          ? "critical"
          : "warning",
      lines: [
        lineValue(
          "Approval status",
          firstTinyFetchRunAuditWriteApproval.approval_status,
        ),
        lineValue(
          "Signal active",
          firstTinyFetchRunAuditWriteApproval.signal.signal_active
            ? "yes"
            : "no",
        ),
        lineValue(
          "Source verification ready",
          firstTinyFetchRunAuditWriteApproval.validation
            .source_verification_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Audit write plan ready",
          firstTinyFetchRunAuditWriteApproval.validation
            .audit_write_plan_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Expected ticker",
          firstTinyFetchRunAuditWriteApproval.expected_contract
            .expected_ticker,
        ),
        lineValue(
          "Expected max rows",
          firstTinyFetchRunAuditWriteApproval.expected_contract
            .expected_max_rows,
        ),
        lineValue(
          "Candle persist allowed",
          firstTinyFetchRunAuditWriteApproval.signal
            .candle_persist_allowed === true
            ? "yes"
            : "no",
        ),
        lineValue(
          "Replay allowed",
          firstTinyFetchRunAuditWriteApproval.signal.replay_allowed === true
            ? "yes"
            : "no",
        ),
        lineValue(
          "Scanner effect allowed",
          firstTinyFetchRunAuditWriteApproval.signal
            .scanner_effect_allowed === true
            ? "yes"
            : "no",
        ),
        lineValue("Write allowed now", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Ready to accept future signal",
          firstTinyFetchRunAuditWriteApproval.readiness
            .ready_to_accept_future_signal
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to propose audit write action",
          firstTinyFetchRunAuditWriteApproval.readiness
            .ready_to_propose_audit_write_action
            ? "yes"
            : "no",
        ),
        lineValue(
          "Blockers",
          compactListText(firstTinyFetchRunAuditWriteApproval.blockers),
        ),
        lineValue(
          "Warnings",
          compactListText(firstTinyFetchRunAuditWriteApproval.warnings),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyFetchRunAuditWriteApproval.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_only: true,
        approval_gate_only: true,
        approval_status:
          firstTinyFetchRunAuditWriteApproval.approval_status,
        signal_active:
          firstTinyFetchRunAuditWriteApproval.signal.signal_active,
        source_present:
          firstTinyFetchRunAuditWriteApproval.signal.source_present,
        source_type: firstTinyFetchRunAuditWriteApproval.signal.source_type,
        operator_label_present:
          firstTinyFetchRunAuditWriteApproval.signal.operator_label_present,
        approval_reference_present:
          firstTinyFetchRunAuditWriteApproval.signal
            .approval_reference_present,
        source_verification_ready:
          firstTinyFetchRunAuditWriteApproval.validation
            .source_verification_ready,
        audit_write_plan_ready:
          firstTinyFetchRunAuditWriteApproval.validation
            .audit_write_plan_ready,
        expected_ticker:
          firstTinyFetchRunAuditWriteApproval.expected_contract
            .expected_ticker,
        expected_max_rows:
          firstTinyFetchRunAuditWriteApproval.expected_contract
            .expected_max_rows,
        approved_valid:
          firstTinyFetchRunAuditWriteApproval.validation.approved_valid,
        ticker_valid:
          firstTinyFetchRunAuditWriteApproval.validation.ticker_valid,
        max_rows_valid:
          firstTinyFetchRunAuditWriteApproval.validation.max_rows_valid,
        candle_persist_scope_valid:
          firstTinyFetchRunAuditWriteApproval.validation
            .candle_persist_scope_valid,
        replay_scope_valid:
          firstTinyFetchRunAuditWriteApproval.validation
            .replay_scope_valid,
        scanner_effect_scope_valid:
          firstTinyFetchRunAuditWriteApproval.validation
            .scanner_effect_scope_valid,
        planned_audit_rows_valid:
          firstTinyFetchRunAuditWriteApproval.validation
            .planned_audit_rows_valid,
        raw_response_persistence_blocked:
          firstTinyFetchRunAuditWriteApproval.validation
            .raw_response_persistence_blocked,
        candle_persistence_blocked:
          firstTinyFetchRunAuditWriteApproval.validation
            .candle_persistence_blocked,
        replay_scanner_ranking_effects_blocked:
          firstTinyFetchRunAuditWriteApproval.validation
            .replay_scanner_ranking_effects_blocked,
        ready_to_accept_future_signal:
          firstTinyFetchRunAuditWriteApproval.readiness
            .ready_to_accept_future_signal,
        ready_to_propose_audit_write_action:
          firstTinyFetchRunAuditWriteApproval.readiness
            .ready_to_propose_audit_write_action,
        write_allowed_now: false,
        fetch_run_persisted: false,
        candles_persisted: false,
        raw_response_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        blockers: firstTinyFetchRunAuditWriteApproval.blockers.join(","),
        warnings: firstTinyFetchRunAuditWriteApproval.warnings.join(","),
        recommended_next_steps:
          firstTinyFetchRunAuditWriteApproval.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_fetch_run_audit_write_execute",
      title: "First Tiny Fetch-Run Audit Write Execute",
      severity:
        firstTinyFetchRunAuditWriteExecute.execution_status === "blocked" ||
        firstTinyFetchRunAuditWriteExecute.execution_status === "failed"
          ? "critical"
          : "warning",
      lines: [
        lineValue("Status", firstTinyFetchRunAuditWriteExecute.execution_status),
        lineValue("Target table", firstTinyFetchRunAuditWriteExecute.target_table),
        lineValue("Planned rows", firstTinyFetchRunAuditWriteExecute.planned_rows),
        lineValue(
          "Inserted rows",
          firstTinyFetchRunAuditWriteExecute.audit_rows_inserted,
        ),
        lineValue(
          "Readback verified",
          firstTinyFetchRunAuditWriteExecute.readback_verified ? "yes" : "no",
        ),
        lineValue("Ticker", firstTinyFetchRunAuditWriteExecute.ticker),
        lineValue("Interval", firstTinyFetchRunAuditWriteExecute.interval),
        lineValue(
          "Trading day",
          firstTinyFetchRunAuditWriteExecute.trading_day,
        ),
        lineValue(
          "Source verification",
          firstTinyFetchRunAuditWriteExecute.source_verification,
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Max one row enforced",
          firstTinyFetchRunAuditWriteExecute.max_one_row_enforced
            ? "yes"
            : "no",
        ),
        lineValue(
          "No candle persistence enforced",
          firstTinyFetchRunAuditWriteExecute.no_candle_persistence_enforced
            ? "yes"
            : "no",
        ),
        lineValue(
          "Duplicate prevented",
          firstTinyFetchRunAuditWriteExecute.duplicate_prevented
            ? "yes"
            : "no",
        ),
        lineValue(
          "Blockers",
          compactListText(firstTinyFetchRunAuditWriteExecute.blockers),
        ),
        lineValue(
          "Warnings",
          compactListText(firstTinyFetchRunAuditWriteExecute.warnings),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyFetchRunAuditWriteExecute.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        diagnostics_only_no_write: true,
        execution_status:
          firstTinyFetchRunAuditWriteExecute.execution_status,
        target_table: firstTinyFetchRunAuditWriteExecute.target_table,
        planned_rows: firstTinyFetchRunAuditWriteExecute.planned_rows,
        audit_rows_inserted:
          firstTinyFetchRunAuditWriteExecute.audit_rows_inserted,
        readback_verified:
          firstTinyFetchRunAuditWriteExecute.readback_verified,
        duplicate_prevented:
          firstTinyFetchRunAuditWriteExecute.duplicate_prevented,
        approval_status:
          firstTinyFetchRunAuditWriteExecute.approval_status,
        fetch_run_persisted: false,
        candles_persisted: false,
        raw_response_persisted: false,
        synthetic_outcomes_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        max_one_row_enforced:
          firstTinyFetchRunAuditWriteExecute.max_one_row_enforced,
        no_candle_persistence_enforced:
          firstTinyFetchRunAuditWriteExecute.no_candle_persistence_enforced,
        ticker: firstTinyFetchRunAuditWriteExecute.ticker,
        interval: firstTinyFetchRunAuditWriteExecute.interval,
        trading_day: firstTinyFetchRunAuditWriteExecute.trading_day,
        request_count: firstTinyFetchRunAuditWriteExecute.request_count,
        valid_candles: firstTinyFetchRunAuditWriteExecute.valid_candles,
        source_verification:
          firstTinyFetchRunAuditWriteExecute.source_verification,
        blockers: firstTinyFetchRunAuditWriteExecute.blockers.join(","),
        warnings: firstTinyFetchRunAuditWriteExecute.warnings.join(","),
        recommended_next_steps:
          firstTinyFetchRunAuditWriteExecute.recommended_next_steps.join(","),
      },
    }),
    section({
      section_id: "first_tiny_fetch_run_audit_write_result_verification",
      title: "First Tiny Fetch-Run Audit Write Result Verification",
      severity: firstTinyFetchRunAuditWriteResultVerification
        .approval_lock_warning.approval_signal_still_enabled
        ? "warning"
        : "info",
      lines: [
        lineValue(
          "Verification status",
          firstTinyFetchRunAuditWriteResultVerification.verification_status,
        ),
        lineValue(
          "Execution status",
          firstTinyFetchRunAuditWriteResultVerification.execution_status,
        ),
        lineValue(
          "Target table",
          firstTinyFetchRunAuditWriteResultVerification.target_table,
        ),
        lineValue(
          "Source verification",
          firstTinyFetchRunAuditWriteResultVerification.source_verification,
        ),
        lineValue(
          "Inserted rows",
          firstTinyFetchRunAuditWriteResultVerification.audit_rows_inserted,
        ),
        lineValue(
          "Inserted row id",
          firstTinyFetchRunAuditWriteResultVerification.inserted_row_id,
        ),
        lineValue(
          "Readback verified",
          firstTinyFetchRunAuditWriteResultVerification.readback_verified
            ? "yes"
            : "no",
        ),
        lineValue("Ticker", firstTinyFetchRunAuditWriteResultVerification.ticker),
        lineValue(
          "Interval",
          firstTinyFetchRunAuditWriteResultVerification.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyFetchRunAuditWriteResultVerification.trading_day,
        ),
        lineValue(
          "Request count",
          firstTinyFetchRunAuditWriteResultVerification.request_count,
        ),
        lineValue(
          "Valid candles",
          firstTinyFetchRunAuditWriteResultVerification.valid_candles,
        ),
        lineValue("Fetch run persisted", "yes"),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Approval lock warning",
          firstTinyFetchRunAuditWriteResultVerification.approval_lock_warning
            .warning ?? "none",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyFetchRunAuditWriteResultVerification
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        read_only_static_verification: true,
        verification_status:
          firstTinyFetchRunAuditWriteResultVerification.verification_status,
        verification_marker:
          firstTinyFetchRunAuditWriteResultVerification.verification_marker,
        execution_status:
          firstTinyFetchRunAuditWriteResultVerification.execution_status,
        target_table: firstTinyFetchRunAuditWriteResultVerification.target_table,
        source_verification:
          firstTinyFetchRunAuditWriteResultVerification.source_verification,
        inserted_row_id:
          firstTinyFetchRunAuditWriteResultVerification.inserted_row_id,
        readback_verified:
          firstTinyFetchRunAuditWriteResultVerification.readback_verified,
        ticker: firstTinyFetchRunAuditWriteResultVerification.ticker,
        interval: firstTinyFetchRunAuditWriteResultVerification.interval,
        trading_day: firstTinyFetchRunAuditWriteResultVerification.trading_day,
        request_count:
          firstTinyFetchRunAuditWriteResultVerification.request_count,
        valid_candles:
          firstTinyFetchRunAuditWriteResultVerification.valid_candles,
        planned_rows: firstTinyFetchRunAuditWriteResultVerification.planned_rows,
        audit_rows_inserted:
          firstTinyFetchRunAuditWriteResultVerification.audit_rows_inserted,
        duplicate_prevented:
          firstTinyFetchRunAuditWriteResultVerification.duplicate_prevented,
        approval_status:
          firstTinyFetchRunAuditWriteResultVerification.approval_status,
        operator_label:
          firstTinyFetchRunAuditWriteResultVerification.operator_label,
        approval_reference:
          firstTinyFetchRunAuditWriteResultVerification.approval_reference,
        fetch_run_persisted: true,
        candles_persisted:
          firstTinyFetchRunAuditWriteResultVerification.candles_persisted,
        raw_response_persisted:
          firstTinyFetchRunAuditWriteResultVerification.raw_response_persisted,
        synthetic_outcomes_persisted:
          firstTinyFetchRunAuditWriteResultVerification
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyFetchRunAuditWriteResultVerification.replay_executed,
        scanner_behavior_changed:
          firstTinyFetchRunAuditWriteResultVerification.scanner_behavior_changed,
        live_ranking_changed:
          firstTinyFetchRunAuditWriteResultVerification.live_ranking_changed,
        max_one_row_enforced:
          firstTinyFetchRunAuditWriteResultVerification.max_one_row_enforced,
        no_candle_persistence_enforced:
          firstTinyFetchRunAuditWriteResultVerification
            .no_candle_persistence_enforced,
        no_raw_response_persistence_enforced:
          firstTinyFetchRunAuditWriteResultVerification
            .no_raw_response_persistence_enforced,
        no_replay_enforced:
          firstTinyFetchRunAuditWriteResultVerification.no_replay_enforced,
        no_scanner_ranking_effect_enforced:
          firstTinyFetchRunAuditWriteResultVerification
            .no_scanner_ranking_effect_enforced,
        approval_signal_still_enabled:
          firstTinyFetchRunAuditWriteResultVerification.approval_lock_warning
            .approval_signal_still_enabled,
        approval_lock_warning:
          firstTinyFetchRunAuditWriteResultVerification.approval_lock_warning
            .warning,
        recommended_next_steps:
          firstTinyFetchRunAuditWriteResultVerification.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_candle_persistence_dry_run_plan",
      title: "First Tiny Candle Persistence Dry-Run Plan",
      severity: "warning",
      lines: [
        lineValue(
          "Status",
          `${firstTinyHistoricalCandlePersistenceDryRunPlan.plan_status} / dry-run only`,
        ),
        lineValue(
          "Source verification",
          firstTinyHistoricalCandlePersistenceDryRunPlan.source_verification,
        ),
        lineValue(
          "Target table",
          firstTinyHistoricalCandlePersistenceDryRunPlan.target_table,
        ),
        lineValue(
          "Fetch run id",
          firstTinyHistoricalCandlePersistenceDryRunPlan.fetch_run.fetch_run_id,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalCandlePersistenceDryRunPlan.request_scope.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalCandlePersistenceDryRunPlan.request_scope.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalCandlePersistenceDryRunPlan.request_scope
            .trading_day,
        ),
        lineValue(
          "Expected candle rows",
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .expected_candle_rows,
        ),
        lineValue(
          "Planned inserts/updates/skips/rejections",
          `${firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan.planned_inserts} / ${firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan.planned_updates} / ${firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan.planned_skips} / ${firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan.planned_invalid_rejections}`,
        ),
        lineValue(
          "Conflict target",
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .conflict_target.join(", "),
        ),
        lineValue(
          "Candle payload available",
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .candle_payload_available
            ? "yes"
            : "no",
        ),
        lineValue(
          "Count-level plan ready",
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .count_level_plan_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Executable candle rows available",
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .executable_candle_rows_available
            ? "yes"
            : "no",
        ),
        lineValue("Ready for future candle write", "no"),
        lineValue("Candle write allowed now", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted by this plan", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Payload reason",
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .reason,
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalCandlePersistenceDryRunPlan
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        dry_run_only: firstTinyHistoricalCandlePersistenceDryRunPlan.dry_run_only,
        plan_status: firstTinyHistoricalCandlePersistenceDryRunPlan.plan_status,
        plan_marker: firstTinyHistoricalCandlePersistenceDryRunPlan.plan_marker,
        plan_mode: firstTinyHistoricalCandlePersistenceDryRunPlan.plan_mode,
        source_verification:
          firstTinyHistoricalCandlePersistenceDryRunPlan.source_verification,
        target_table: firstTinyHistoricalCandlePersistenceDryRunPlan.target_table,
        candle_write_allowed_now:
          firstTinyHistoricalCandlePersistenceDryRunPlan
            .candle_write_allowed_now,
        request_scope: JSON.stringify(
          firstTinyHistoricalCandlePersistenceDryRunPlan.request_scope,
        ),
        fetch_run: JSON.stringify(
          firstTinyHistoricalCandlePersistenceDryRunPlan.fetch_run,
        ),
        fetch_run_id:
          firstTinyHistoricalCandlePersistenceDryRunPlan.fetch_run.fetch_run_id,
        fetch_run_id_attached:
          firstTinyHistoricalCandlePersistenceDryRunPlan.fetch_run
            .fetch_run_id_attached,
        audit_write_verified:
          firstTinyHistoricalCandlePersistenceDryRunPlan.fetch_run
            .audit_write_verified,
        expected_candle_rows:
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .expected_candle_rows,
        planned_inserts:
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .planned_inserts,
        planned_updates:
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .planned_updates,
        planned_skips:
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .planned_skips,
        planned_invalid_rejections:
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .planned_invalid_rejections,
        conflict_target:
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .conflict_target.join(","),
        candle_payload_available:
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .candle_payload_available,
        count_level_plan_ready:
          firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan
            .count_level_plan_ready,
        executable_candle_rows_available:
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .executable_candle_rows_available,
        executable_candle_write_ready:
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .executable_candle_write_ready,
        ready_for_future_candle_write:
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .ready_for_future_candle_write,
        no_ohlcv_values_invented:
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .no_ohlcv_values_invented,
        normalized_candle_rows_count:
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .normalized_candle_rows.length,
        payload_reason:
          firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability
            .reason,
        lookahead_safety_required:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .lookahead_safety_required,
        scanner_use_disabled:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .scanner_use_disabled,
        replay_use_disabled:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .replay_use_disabled,
        synthetic_outcomes_disabled:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .synthetic_outcomes_disabled,
        provider_fetch_added:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .provider_fetch_added,
        historical_fetch_added:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .historical_fetch_added,
        candles_persisted:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .candles_persisted,
        raw_response_persisted:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .raw_response_persisted,
        fetch_run_persisted_by_this_plan:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .fetch_run_persisted_by_this_plan,
        synthetic_outcomes_persisted:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .replay_executed,
        scanner_behavior_changed:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalCandlePersistenceDryRunPlan.safety
            .live_ranking_changed,
        recommended_next_steps:
          firstTinyHistoricalCandlePersistenceDryRunPlan.recommended_next_steps.join(
            ",",
          ),
        caution_flags:
          firstTinyHistoricalCandlePersistenceDryRunPlan.caution_flags.join(","),
      },
    }),
    section({
      section_id: "first_tiny_historical_candle_payload_refetch_plan",
      title: "First Tiny Candle Payload Refetch Plan",
      severity:
        firstTinyHistoricalCandlePayloadRefetchPlan.approval_status ===
        "invalid"
          ? "critical"
          : "warning",
      lines: [
        lineValue(
          "Status",
          `${firstTinyHistoricalCandlePayloadRefetchPlan.refetch_plan_status} / dry-run only`,
        ),
        lineValue(
          "Source verification",
          firstTinyHistoricalCandlePayloadRefetchPlan.source_verification,
        ),
        lineValue(
          "Existing fetch run id",
          firstTinyHistoricalCandlePayloadRefetchPlan.existing_fetch_run_id,
        ),
        lineValue(
          "Provider",
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.provider,
        ),
        lineValue(
          "Endpoint",
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.endpoint,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.trading_day,
        ),
        lineValue(
          "Start/end",
          `${firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.start_date} / ${firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.end_date}`,
        ),
        lineValue(
          "Request count",
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope
            .request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope
            .estimated_credits,
        ),
        lineValue(
          "Expected candle rows",
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope
            .expected_candle_rows,
        ),
        lineValue("Provider call allowed now", "no"),
        lineValue("Candle persistence allowed now", "no"),
        lineValue("Raw response persistence allowed now", "no"),
        lineValue("Replay allowed now", "no"),
        lineValue("Scanner effect allowed now", "no"),
        lineValue(
          "Approval status",
          firstTinyHistoricalCandlePayloadRefetchPlan.approval_status,
        ),
        lineValue(
          "Ready to accept future signal",
          firstTinyHistoricalCandlePayloadRefetchPlan.readiness
            .ready_to_accept_future_signal
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to propose payload refetch action",
          firstTinyHistoricalCandlePayloadRefetchPlan.readiness
            .ready_to_propose_payload_refetch_action
            ? "yes"
            : "no",
        ),
        lineValue("Execute now", "no"),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalCandlePayloadRefetchPlan.blockers),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalCandlePayloadRefetchPlan
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_only:
          firstTinyHistoricalCandlePayloadRefetchPlan.advisory_only,
        refetch_plan_status:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_plan_status,
        plan_marker: firstTinyHistoricalCandlePayloadRefetchPlan.plan_marker,
        plan_mode: firstTinyHistoricalCandlePayloadRefetchPlan.plan_mode,
        dry_run_only: firstTinyHistoricalCandlePayloadRefetchPlan.dry_run_only,
        source_verification:
          firstTinyHistoricalCandlePayloadRefetchPlan.source_verification,
        existing_fetch_run_id:
          firstTinyHistoricalCandlePayloadRefetchPlan.existing_fetch_run_id,
        refetch_scope: JSON.stringify(
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope,
        ),
        provider:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.provider,
        endpoint:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.endpoint,
        ticker: firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.ticker,
        interval:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.interval,
        trading_day:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.trading_day,
        start_date:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.start_date,
        end_date:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.end_date,
        timezone:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.timezone,
        session:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.session,
        adjusted:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.adjusted,
        request_count:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope
            .request_count,
        estimated_credits:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope
            .estimated_credits,
        expected_candle_rows:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope
            .expected_candle_rows,
        cache_key:
          firstTinyHistoricalCandlePayloadRefetchPlan.refetch_scope.cache_key,
        approval_status:
          firstTinyHistoricalCandlePayloadRefetchPlan.approval_status,
        future_approval_contract: JSON.stringify(
          firstTinyHistoricalCandlePayloadRefetchPlan.future_approval_contract,
        ),
        signal: JSON.stringify(
          firstTinyHistoricalCandlePayloadRefetchPlan.signal,
        ),
        validation: JSON.stringify(
          firstTinyHistoricalCandlePayloadRefetchPlan.validation,
        ),
        ready_to_accept_future_signal:
          firstTinyHistoricalCandlePayloadRefetchPlan.readiness
            .ready_to_accept_future_signal,
        ready_to_propose_payload_refetch_action:
          firstTinyHistoricalCandlePayloadRefetchPlan.readiness
            .ready_to_propose_payload_refetch_action,
        execute_now: false,
        provider_call_allowed_now:
          firstTinyHistoricalCandlePayloadRefetchPlan.permissions
            .provider_call_allowed_now,
        candle_persistence_allowed_now:
          firstTinyHistoricalCandlePayloadRefetchPlan.permissions
            .candle_persistence_allowed_now,
        raw_response_persistence_allowed_now:
          firstTinyHistoricalCandlePayloadRefetchPlan.permissions
            .raw_response_persistence_allowed_now,
        replay_allowed_now:
          firstTinyHistoricalCandlePayloadRefetchPlan.permissions
            .replay_allowed_now,
        scanner_effect_allowed_now:
          firstTinyHistoricalCandlePayloadRefetchPlan.permissions
            .scanner_effect_allowed_now,
        requires_separate_operator_approval:
          firstTinyHistoricalCandlePayloadRefetchPlan.permissions
            .requires_separate_operator_approval,
        provider_call_executed:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .provider_call_executed,
        provider_fetch_added:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .provider_fetch_added,
        historical_fetch_added:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .historical_fetch_added,
        candles_persisted:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .candles_persisted,
        raw_response_persisted:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .raw_response_persisted,
        fetch_run_persisted:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety.replay_executed,
        scanner_behavior_changed:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .live_ranking_changed,
        no_ohlcv_values_invented:
          firstTinyHistoricalCandlePayloadRefetchPlan.safety
            .no_ohlcv_values_invented,
        blockers:
          firstTinyHistoricalCandlePayloadRefetchPlan.blockers.join(","),
        warnings:
          firstTinyHistoricalCandlePayloadRefetchPlan.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalCandlePayloadRefetchPlan.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_candle_payload_refetch_execute",
      title: "First Tiny Candle Payload Refetch Execute",
      severity:
        firstTinyHistoricalCandlePayloadRefetchExecute.execution_status ===
          "blocked" ||
        firstTinyHistoricalCandlePayloadRefetchExecute.execution_status ===
          "payload_refetch_failed_no_persist"
          ? "critical"
          : "warning",
      lines: [
        lineValue(
          "Status",
          firstTinyHistoricalCandlePayloadRefetchExecute.execution_status,
        ),
        lineValue(
          "Provider",
          firstTinyHistoricalCandlePayloadRefetchExecute.provider,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalCandlePayloadRefetchExecute.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalCandlePayloadRefetchExecute.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalCandlePayloadRefetchExecute.trading_day,
        ),
        lineValue(
          "Request count",
          firstTinyHistoricalCandlePayloadRefetchExecute.request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyHistoricalCandlePayloadRefetchExecute.estimated_credits,
        ),
        lineValue(
          "Existing fetch run id",
          firstTinyHistoricalCandlePayloadRefetchExecute.existing_fetch_run_id,
        ),
        lineValue(
          "Provider call executed",
          firstTinyHistoricalCandlePayloadRefetchExecute.provider_call_executed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Normalized payload available",
          firstTinyHistoricalCandlePayloadRefetchExecute
            .normalized_payload_available
            ? "yes"
            : "no",
        ),
        lineValue(
          "Normalized payload returned",
          firstTinyHistoricalCandlePayloadRefetchExecute
            .normalized_payload_returned
            ? "yes"
            : "no",
        ),
        lineValue(
          "Valid candles",
          `${firstTinyHistoricalCandlePayloadRefetchExecute.valid_candles}/27`,
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalCandlePayloadRefetchExecute
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        route_build_marker:
          firstTinyHistoricalCandlePayloadRefetchExecute.route_build_marker,
        execution_status:
          firstTinyHistoricalCandlePayloadRefetchExecute.execution_status,
        provider: firstTinyHistoricalCandlePayloadRefetchExecute.provider,
        endpoint: firstTinyHistoricalCandlePayloadRefetchExecute.endpoint,
        ticker: firstTinyHistoricalCandlePayloadRefetchExecute.ticker,
        interval: firstTinyHistoricalCandlePayloadRefetchExecute.interval,
        trading_day:
          firstTinyHistoricalCandlePayloadRefetchExecute.trading_day,
        request_count:
          firstTinyHistoricalCandlePayloadRefetchExecute.request_count,
        estimated_credits:
          firstTinyHistoricalCandlePayloadRefetchExecute.estimated_credits,
        existing_fetch_run_id:
          firstTinyHistoricalCandlePayloadRefetchExecute.existing_fetch_run_id,
        approval_status:
          firstTinyHistoricalCandlePayloadRefetchExecute.approval_status,
        provider_call_executed:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .provider_call_executed,
        provider_call_succeeded:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .provider_call_succeeded,
        provider_call_attempted:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .provider_call_attempted,
        cache_lookup_attempted:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .cache_lookup_attempted,
        cache_hit: firstTinyHistoricalCandlePayloadRefetchExecute.cache_hit,
        raw_candles:
          firstTinyHistoricalCandlePayloadRefetchExecute.raw_candles,
        normalized_candles:
          firstTinyHistoricalCandlePayloadRefetchExecute.normalized_candles,
        valid_candles:
          firstTinyHistoricalCandlePayloadRefetchExecute.valid_candles,
        invalid_candles:
          firstTinyHistoricalCandlePayloadRefetchExecute.invalid_candles,
        duplicate_timestamps:
          firstTinyHistoricalCandlePayloadRefetchExecute.duplicate_timestamps,
        out_of_order_candles:
          firstTinyHistoricalCandlePayloadRefetchExecute.out_of_order_candles,
        normalized_payload_available:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .normalized_payload_available,
        normalized_payload_returned:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .normalized_payload_returned,
        normalized_payload_response_only:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .normalized_payload_response_only,
        normalized_payload_rows:
          firstTinyHistoricalCandlePayloadRefetchExecute.normalized_payload
            .length,
        candles_persisted:
          firstTinyHistoricalCandlePayloadRefetchExecute.candles_persisted,
        raw_response_persisted:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .raw_response_persisted,
        fetch_run_persisted:
          firstTinyHistoricalCandlePayloadRefetchExecute.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyHistoricalCandlePayloadRefetchExecute.replay_executed,
        scanner_behavior_changed:
          firstTinyHistoricalCandlePayloadRefetchExecute
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalCandlePayloadRefetchExecute.live_ranking_changed,
        api_key_included_in_response:
          firstTinyHistoricalCandlePayloadRefetchExecute.safety
            .api_key_included_in_response,
        blockers:
          firstTinyHistoricalCandlePayloadRefetchExecute.blockers.join(","),
        warnings:
          firstTinyHistoricalCandlePayloadRefetchExecute.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalCandlePayloadRefetchExecute.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "first_tiny_historical_candle_payload_refetch_result_verification",
      title: "First Tiny Candle Payload Refetch Result Verification",
      severity: "warning",
      lines: [
        lineValue(
          "Verification status",
          firstTinyCandlePayloadRefetchResultVerification.verification_status,
        ),
        lineValue(
          "Execution status",
          firstTinyCandlePayloadRefetchResultVerification.execution_status,
        ),
        lineValue(
          "Provider call executed",
          firstTinyCandlePayloadRefetchResultVerification.provider_call_executed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Provider call succeeded",
          firstTinyCandlePayloadRefetchResultVerification.provider_call_succeeded
            ? "yes"
            : "no",
        ),
        lineValue("Ticker", firstTinyCandlePayloadRefetchResultVerification.ticker),
        lineValue(
          "Interval",
          firstTinyCandlePayloadRefetchResultVerification.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyCandlePayloadRefetchResultVerification.trading_day,
        ),
        lineValue(
          "Existing fetch run id",
          firstTinyCandlePayloadRefetchResultVerification
            .existing_fetch_run_id,
        ),
        lineValue(
          "Valid candles",
          firstTinyCandlePayloadRefetchResultVerification.valid_candles,
        ),
        lineValue(
          "Payload available",
          firstTinyCandlePayloadRefetchResultVerification
            .normalized_payload_available
            ? "yes"
            : "no",
        ),
        lineValue(
          "Payload response only",
          firstTinyCandlePayloadRefetchResultVerification
            .normalized_payload_response_only
            ? "yes"
            : "no",
        ),
        lineValue(
          "First timestamp",
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .first_payload_timestamp,
        ),
        lineValue(
          "Last timestamp",
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .last_payload_timestamp,
        ),
        lineValue(
          "Row count matches expected",
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .row_count_matches
            ? "yes"
            : "no",
        ),
        lineValue(
          "5min spacing valid",
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .timestamps_are_5min_spaced
            ? "yes"
            : "no",
        ),
        lineValue(
          "Window bounds match planned UTC",
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .window_bounds_match_planned_utc
            ? "yes"
            : "no",
        ),
        lineValue(
          "Window review required",
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .window_review_required
            ? "yes"
            : "no",
        ),
        lineValue(
          "Candle write ready",
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .candle_write_ready
            ? "yes"
            : "no",
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Approval lock warning",
          firstTinyCandlePayloadRefetchResultVerification.approval_lock_warning
            .warning ?? "none",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCandlePayloadRefetchResultVerification
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        read_only_static_verification: true,
        verification_status:
          firstTinyCandlePayloadRefetchResultVerification.verification_status,
        verification_marker:
          firstTinyCandlePayloadRefetchResultVerification.verification_marker,
        route_build_marker:
          firstTinyCandlePayloadRefetchResultVerification.route_build_marker,
        execution_status:
          firstTinyCandlePayloadRefetchResultVerification.execution_status,
        provider_call_executed:
          firstTinyCandlePayloadRefetchResultVerification
            .provider_call_executed,
        provider_call_succeeded:
          firstTinyCandlePayloadRefetchResultVerification
            .provider_call_succeeded,
        provider_call_attempted:
          firstTinyCandlePayloadRefetchResultVerification
            .provider_call_attempted,
        provider: firstTinyCandlePayloadRefetchResultVerification.provider,
        endpoint: firstTinyCandlePayloadRefetchResultVerification.endpoint,
        ticker: firstTinyCandlePayloadRefetchResultVerification.ticker,
        interval: firstTinyCandlePayloadRefetchResultVerification.interval,
        trading_day:
          firstTinyCandlePayloadRefetchResultVerification.trading_day,
        existing_fetch_run_id:
          firstTinyCandlePayloadRefetchResultVerification
            .existing_fetch_run_id,
        request_count:
          firstTinyCandlePayloadRefetchResultVerification.request_count,
        estimated_credits:
          firstTinyCandlePayloadRefetchResultVerification.estimated_credits,
        http_status: firstTinyCandlePayloadRefetchResultVerification.http_status,
        cache_lookup_attempted:
          firstTinyCandlePayloadRefetchResultVerification
            .cache_lookup_attempted,
        cache_hit: firstTinyCandlePayloadRefetchResultVerification.cache_hit,
        raw_candles: firstTinyCandlePayloadRefetchResultVerification.raw_candles,
        normalized_candles:
          firstTinyCandlePayloadRefetchResultVerification.normalized_candles,
        valid_candles:
          firstTinyCandlePayloadRefetchResultVerification.valid_candles,
        invalid_candles:
          firstTinyCandlePayloadRefetchResultVerification.invalid_candles,
        duplicate_timestamps:
          firstTinyCandlePayloadRefetchResultVerification.duplicate_timestamps,
        out_of_order_candles:
          firstTinyCandlePayloadRefetchResultVerification.out_of_order_candles,
        normalized_payload_available:
          firstTinyCandlePayloadRefetchResultVerification
            .normalized_payload_available,
        normalized_payload_returned:
          firstTinyCandlePayloadRefetchResultVerification
            .normalized_payload_returned,
        normalized_payload_response_only:
          firstTinyCandlePayloadRefetchResultVerification
            .normalized_payload_response_only,
        payload_row_count:
          firstTinyCandlePayloadRefetchResultVerification.payload_artifact
            .payload_row_count,
        ohlcv_values_recorded_in_artifact:
          firstTinyCandlePayloadRefetchResultVerification.payload_artifact
            .ohlcv_values_recorded_in_artifact,
        ohlcv_values_not_invented:
          firstTinyCandlePayloadRefetchResultVerification.payload_artifact
            .ohlcv_values_not_invented,
        window_sanity: JSON.stringify(
          firstTinyCandlePayloadRefetchResultVerification.window_sanity,
        ),
        planned_start_date_utc:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .planned_start_date_utc,
        planned_end_date_utc:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .planned_end_date_utc,
        first_payload_timestamp:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .first_payload_timestamp,
        last_payload_timestamp:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .last_payload_timestamp,
        row_count_matches:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .row_count_matches,
        timestamps_are_5min_spaced:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .timestamps_are_5min_spaced,
        payload_sequence_valid:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .payload_sequence_valid,
        window_bounds_match_planned_utc:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .window_bounds_match_planned_utc,
        window_review_required:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .window_review_required,
        candle_write_ready:
          firstTinyCandlePayloadRefetchResultVerification.window_sanity
            .candle_write_ready,
        candles_persisted:
          firstTinyCandlePayloadRefetchResultVerification.candles_persisted,
        raw_response_persisted:
          firstTinyCandlePayloadRefetchResultVerification
            .raw_response_persisted,
        fetch_run_persisted:
          firstTinyCandlePayloadRefetchResultVerification.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCandlePayloadRefetchResultVerification
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyCandlePayloadRefetchResultVerification.replay_executed,
        scanner_behavior_changed:
          firstTinyCandlePayloadRefetchResultVerification
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCandlePayloadRefetchResultVerification.live_ranking_changed,
        approval_signal_still_enabled:
          firstTinyCandlePayloadRefetchResultVerification.approval_lock_warning
            .approval_signal_still_enabled,
        approval_lock_warning:
          firstTinyCandlePayloadRefetchResultVerification.approval_lock_warning
            .warning,
        warning: firstTinyCandlePayloadRefetchResultVerification.warning,
        recommended_next_steps:
          firstTinyCandlePayloadRefetchResultVerification.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "first_tiny_historical_candle_payload_window_sanity_review",
      title: "First Tiny Candle Payload Window Sanity Review",
      severity: "warning",
      lines: [
        lineValue(
          "Review status",
          firstTinyCandlePayloadWindowSanityReview.review_status,
        ),
        lineValue("Ticker", firstTinyCandlePayloadWindowSanityReview.ticker),
        lineValue("Interval", firstTinyCandlePayloadWindowSanityReview.interval),
        lineValue(
          "Trading day",
          firstTinyCandlePayloadWindowSanityReview.trading_day,
        ),
        lineValue(
          "Planned UTC window",
          `${firstTinyCandlePayloadWindowSanityReview.planned_start_date_utc} -> ${firstTinyCandlePayloadWindowSanityReview.planned_end_date_utc}`,
        ),
        lineValue(
          "Payload UTC window",
          `${firstTinyCandlePayloadWindowSanityReview.payload_first_timestamp_utc} -> ${firstTinyCandlePayloadWindowSanityReview.payload_last_timestamp_utc}`,
        ),
        lineValue(
          "Planned NY window",
          `${firstTinyCandlePayloadWindowSanityReview.planned_start_date_ny} -> ${firstTinyCandlePayloadWindowSanityReview.planned_end_date_ny}`,
        ),
        lineValue(
          "Payload NY window",
          `${firstTinyCandlePayloadWindowSanityReview.payload_first_timestamp_ny} -> ${firstTinyCandlePayloadWindowSanityReview.payload_last_timestamp_ny}`,
        ),
        lineValue(
          "Row count matches",
          firstTinyCandlePayloadWindowSanityReview.row_count_matches
            ? "yes"
            : "no",
        ),
        lineValue(
          "5min spacing valid",
          firstTinyCandlePayloadWindowSanityReview.timestamps_are_5min_spaced
            ? "yes"
            : "no",
        ),
        lineValue(
          "Window bounds match planned UTC",
          firstTinyCandlePayloadWindowSanityReview
            .window_bounds_match_planned_utc
            ? "yes"
            : "no",
        ),
        lineValue(
          "Operator window acceptance",
          firstTinyCandlePayloadWindowSanityReview.operator_window_acceptance
            ? "yes"
            : "no",
        ),
        lineValue(
          "Candle write ready",
          firstTinyCandlePayloadWindowSanityReview.candle_write_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Executable candle persistence plan ready",
          firstTinyCandlePayloadWindowSanityReview
            .executable_candle_persistence_plan_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Corrected refetch required",
          firstTinyCandlePayloadWindowSanityReview.corrected_refetch_required
            ? "yes"
            : "no",
        ),
        lineValue(
          "Possible causes",
          compactListText(Object.keys(firstTinyCandlePayloadWindowSanityReview.possible_causes)),
        ),
        lineValue(
          "Blocking reasons",
          compactListText(firstTinyCandlePayloadWindowSanityReview.blocking_reasons),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCandlePayloadWindowSanityReview.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        read_only_static_review: true,
        review_status: firstTinyCandlePayloadWindowSanityReview.review_status,
        review_marker: firstTinyCandlePayloadWindowSanityReview.review_marker,
        source_verification_status:
          firstTinyCandlePayloadWindowSanityReview.source_verification_status,
        ticker: firstTinyCandlePayloadWindowSanityReview.ticker,
        interval: firstTinyCandlePayloadWindowSanityReview.interval,
        trading_day: firstTinyCandlePayloadWindowSanityReview.trading_day,
        planned_start_date_utc:
          firstTinyCandlePayloadWindowSanityReview.planned_start_date_utc,
        planned_end_date_utc:
          firstTinyCandlePayloadWindowSanityReview.planned_end_date_utc,
        payload_first_timestamp_utc:
          firstTinyCandlePayloadWindowSanityReview
            .payload_first_timestamp_utc,
        payload_last_timestamp_utc:
          firstTinyCandlePayloadWindowSanityReview.payload_last_timestamp_utc,
        planned_start_date_ny:
          firstTinyCandlePayloadWindowSanityReview.planned_start_date_ny,
        planned_end_date_ny:
          firstTinyCandlePayloadWindowSanityReview.planned_end_date_ny,
        payload_first_timestamp_ny:
          firstTinyCandlePayloadWindowSanityReview
            .payload_first_timestamp_ny,
        payload_last_timestamp_ny:
          firstTinyCandlePayloadWindowSanityReview.payload_last_timestamp_ny,
        payload_row_count:
          firstTinyCandlePayloadWindowSanityReview.payload_row_count,
        expected_row_count:
          firstTinyCandlePayloadWindowSanityReview.expected_row_count,
        row_count_matches:
          firstTinyCandlePayloadWindowSanityReview.row_count_matches,
        timestamps_are_5min_spaced:
          firstTinyCandlePayloadWindowSanityReview
            .timestamps_are_5min_spaced,
        duplicate_timestamps:
          firstTinyCandlePayloadWindowSanityReview.duplicate_timestamps,
        out_of_order_candles:
          firstTinyCandlePayloadWindowSanityReview.out_of_order_candles,
        payload_sequence_valid:
          firstTinyCandlePayloadWindowSanityReview.payload_sequence_valid,
        window_bounds_match_planned_utc:
          firstTinyCandlePayloadWindowSanityReview
            .window_bounds_match_planned_utc,
        operator_window_acceptance:
          firstTinyCandlePayloadWindowSanityReview.operator_window_acceptance,
        candle_write_ready:
          firstTinyCandlePayloadWindowSanityReview.candle_write_ready,
        executable_candle_persistence_plan_ready:
          firstTinyCandlePayloadWindowSanityReview
            .executable_candle_persistence_plan_ready,
        corrected_refetch_required:
          firstTinyCandlePayloadWindowSanityReview.corrected_refetch_required,
        possible_causes: JSON.stringify(
          firstTinyCandlePayloadWindowSanityReview.possible_causes,
        ),
        acceptance_criteria: JSON.stringify(
          firstTinyCandlePayloadWindowSanityReview.acceptance_criteria,
        ),
        blocking_reasons:
          firstTinyCandlePayloadWindowSanityReview.blocking_reasons.join(","),
        recommended_next_steps:
          firstTinyCandlePayloadWindowSanityReview.recommended_next_steps.join(
            ",",
          ),
        provider_call_executed:
          firstTinyCandlePayloadWindowSanityReview.provider_call_executed,
        candles_persisted:
          firstTinyCandlePayloadWindowSanityReview.candles_persisted,
        raw_response_persisted:
          firstTinyCandlePayloadWindowSanityReview.raw_response_persisted,
        fetch_run_persisted:
          firstTinyCandlePayloadWindowSanityReview.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCandlePayloadWindowSanityReview
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyCandlePayloadWindowSanityReview.replay_executed,
        scanner_behavior_changed:
          firstTinyCandlePayloadWindowSanityReview.scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCandlePayloadWindowSanityReview.live_ranking_changed,
      },
    }),
    section({
      section_id:
        "corrected_first_tiny_historical_candle_payload_refetch_plan",
      title: "Corrected First Tiny Candle Payload Refetch Plan",
      severity: "warning",
      lines: [
        lineValue(
          "Status",
          `${firstTinyCorrectedCandlePayloadRefetchPlan.corrected_refetch_plan_status} / dry-run only`,
        ),
        lineValue("Reason", firstTinyCorrectedCandlePayloadRefetchPlan.reason),
        lineValue("Ticker", firstTinyCorrectedCandlePayloadRefetchPlan.ticker),
        lineValue("Interval", firstTinyCorrectedCandlePayloadRefetchPlan.interval),
        lineValue(
          "Trading day",
          firstTinyCorrectedCandlePayloadRefetchPlan.trading_day,
        ),
        lineValue(
          "Intended NY window",
          `${firstTinyCorrectedCandlePayloadRefetchPlan.intended_ny_start} -> ${firstTinyCorrectedCandlePayloadRefetchPlan.intended_ny_end}`,
        ),
        lineValue(
          "Intended UTC window",
          `${firstTinyCorrectedCandlePayloadRefetchPlan.intended_utc_start} -> ${firstTinyCorrectedCandlePayloadRefetchPlan.intended_utc_end}`,
        ),
        lineValue(
          "Previous payload NY window",
          firstTinyCorrectedCandlePayloadRefetchPlan.prior_payload
            .returned_ny_window,
        ),
        lineValue(
          "Previous payload accepted for write",
          firstTinyCorrectedCandlePayloadRefetchPlan.prior_payload
            .accepted_for_write
            ? "yes"
            : "no",
        ),
        lineValue(
          "Candidate strategies",
          compactListText(
            firstTinyCorrectedCandlePayloadRefetchPlan
              .candidate_strategies.map((strategy) => strategy.strategy_id),
          ),
        ),
        lineValue(
          "Recommended strategy",
          firstTinyCorrectedCandlePayloadRefetchPlan.recommended_strategy_id,
        ),
        lineValue(
          "Provider call allowed now",
          firstTinyCorrectedCandlePayloadRefetchPlan.provider_call_allowed_now
            ? "yes"
            : "no",
        ),
        lineValue(
          "Candle persistence allowed now",
          firstTinyCorrectedCandlePayloadRefetchPlan
            .candle_persistence_allowed_now
            ? "yes"
            : "no",
        ),
        lineValue(
          "Raw response persistence allowed now",
          firstTinyCorrectedCandlePayloadRefetchPlan
            .raw_response_persistence_allowed_now
            ? "yes"
            : "no",
        ),
        lineValue(
          "Requires separate operator approval",
          firstTinyCorrectedCandlePayloadRefetchPlan
            .requires_separate_operator_approval
            ? "yes"
            : "no",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCorrectedCandlePayloadRefetchPlan.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        corrected_refetch_plan_status:
          firstTinyCorrectedCandlePayloadRefetchPlan
            .corrected_refetch_plan_status,
        plan_marker: firstTinyCorrectedCandlePayloadRefetchPlan.plan_marker,
        dry_run_only: firstTinyCorrectedCandlePayloadRefetchPlan.dry_run_only,
        reason: firstTinyCorrectedCandlePayloadRefetchPlan.reason,
        provider: firstTinyCorrectedCandlePayloadRefetchPlan.provider,
        endpoint: firstTinyCorrectedCandlePayloadRefetchPlan.endpoint,
        ticker: firstTinyCorrectedCandlePayloadRefetchPlan.ticker,
        interval: firstTinyCorrectedCandlePayloadRefetchPlan.interval,
        trading_day: firstTinyCorrectedCandlePayloadRefetchPlan.trading_day,
        intended_session:
          firstTinyCorrectedCandlePayloadRefetchPlan.intended_session,
        intended_ny_start:
          firstTinyCorrectedCandlePayloadRefetchPlan.intended_ny_start,
        intended_ny_end:
          firstTinyCorrectedCandlePayloadRefetchPlan.intended_ny_end,
        intended_utc_start:
          firstTinyCorrectedCandlePayloadRefetchPlan.intended_utc_start,
        intended_utc_end:
          firstTinyCorrectedCandlePayloadRefetchPlan.intended_utc_end,
        expected_interval_minutes:
          firstTinyCorrectedCandlePayloadRefetchPlan
            .expected_interval_minutes,
        expected_accepted_row_count:
          firstTinyCorrectedCandlePayloadRefetchPlan
            .expected_accepted_row_count,
        prior_planned_utc_window:
          firstTinyCorrectedCandlePayloadRefetchPlan.prior_payload
            .planned_utc_window,
        prior_planned_ny_window:
          firstTinyCorrectedCandlePayloadRefetchPlan.prior_payload
            .planned_ny_window,
        prior_returned_utc_window:
          firstTinyCorrectedCandlePayloadRefetchPlan.prior_payload
            .returned_utc_window,
        prior_returned_ny_window:
          firstTinyCorrectedCandlePayloadRefetchPlan.prior_payload
            .returned_ny_window,
        previous_payload_accepted_for_write:
          firstTinyCorrectedCandlePayloadRefetchPlan.prior_payload
            .accepted_for_write,
        prior_review_status:
          firstTinyCorrectedCandlePayloadRefetchPlan.prior_payload
            .review_status,
        candidate_strategy_ids:
          firstTinyCorrectedCandlePayloadRefetchPlan.candidate_strategies
            .map((strategy) => strategy.strategy_id)
            .join(","),
        candidate_strategies: JSON.stringify(
          firstTinyCorrectedCandlePayloadRefetchPlan.candidate_strategies,
        ),
        recommended_strategy:
          firstTinyCorrectedCandlePayloadRefetchPlan.recommended_strategy_id,
        provider_call_allowed_now:
          firstTinyCorrectedCandlePayloadRefetchPlan.provider_call_allowed_now,
        candle_persistence_allowed_now:
          firstTinyCorrectedCandlePayloadRefetchPlan
            .candle_persistence_allowed_now,
        raw_response_persistence_allowed_now:
          firstTinyCorrectedCandlePayloadRefetchPlan
            .raw_response_persistence_allowed_now,
        replay_allowed_now:
          firstTinyCorrectedCandlePayloadRefetchPlan.replay_allowed_now,
        scanner_effect_allowed_now:
          firstTinyCorrectedCandlePayloadRefetchPlan.scanner_effect_allowed_now,
        requires_separate_operator_approval:
          firstTinyCorrectedCandlePayloadRefetchPlan
            .requires_separate_operator_approval,
        future_validation_rules:
          firstTinyCorrectedCandlePayloadRefetchPlan.future_validation_rules.join(
            ",",
          ),
        recommended_next_steps:
          firstTinyCorrectedCandlePayloadRefetchPlan.recommended_next_steps.join(
            ",",
          ),
        provider_call_executed:
          firstTinyCorrectedCandlePayloadRefetchPlan.provider_call_executed,
        candles_persisted:
          firstTinyCorrectedCandlePayloadRefetchPlan.candles_persisted,
        raw_response_persisted:
          firstTinyCorrectedCandlePayloadRefetchPlan.raw_response_persisted,
        fetch_run_persisted:
          firstTinyCorrectedCandlePayloadRefetchPlan.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCorrectedCandlePayloadRefetchPlan
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyCorrectedCandlePayloadRefetchPlan.replay_executed,
        scanner_behavior_changed:
          firstTinyCorrectedCandlePayloadRefetchPlan.scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCorrectedCandlePayloadRefetchPlan.live_ranking_changed,
      },
    }),
    section({
      section_id:
        "corrected_first_tiny_historical_candle_payload_refetch_approval",
      title: "Corrected First Tiny Candle Payload Refetch Approval",
      severity:
        firstTinyCorrectedPayloadRefetchApproval.approval_status === "invalid"
          ? "critical"
          : "warning",
      lines: [
        lineValue(
          "Approval status",
          firstTinyCorrectedPayloadRefetchApproval.approval_status,
        ),
        lineValue(
          "Signal active",
          firstTinyCorrectedPayloadRefetchApproval.signal.signal_active
            ? "yes"
            : "no",
        ),
        lineValue(
          "Expected ticker",
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_ticker,
        ),
        lineValue(
          "Expected strategy",
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_strategy,
        ),
        lineValue(
          "Expected max requests",
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_max_requests,
        ),
        lineValue(
          "Expected estimated credits",
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_estimated_credits,
        ),
        lineValue("Candle persistence allowed", "no"),
        lineValue("Raw response persistence allowed", "no"),
        lineValue("Replay allowed", "no"),
        lineValue("Scanner effect allowed", "no"),
        lineValue(
          "Prior window mismatch confirmed",
          firstTinyCorrectedPayloadRefetchApproval.validation
            .prior_window_review_requires_correction
            ? "yes"
            : "no",
        ),
        lineValue(
          "Corrected plan ready",
          firstTinyCorrectedPayloadRefetchApproval.validation
            .source_plan_ready
            ? "yes"
            : "no",
        ),
        lineValue("Provider call allowed now", "no"),
        lineValue("Candle persistence allowed now", "no"),
        lineValue(
          "Ready to accept future signal",
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .ready_to_accept_future_signal
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to propose corrected refetch action",
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .ready_to_propose_corrected_refetch_action
            ? "yes"
            : "no",
        ),
        lineValue(
          "Blockers",
          compactListText(firstTinyCorrectedPayloadRefetchApproval.blockers),
        ),
        lineValue(
          "Warnings",
          compactListText(firstTinyCorrectedPayloadRefetchApproval.warnings),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCorrectedPayloadRefetchApproval.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_only: firstTinyCorrectedPayloadRefetchApproval.advisory_only,
        approval_gate_only:
          firstTinyCorrectedPayloadRefetchApproval.approval_gate_only,
        approval_status:
          firstTinyCorrectedPayloadRefetchApproval.approval_status,
        signal_active:
          firstTinyCorrectedPayloadRefetchApproval.signal.signal_active,
        source_type:
          firstTinyCorrectedPayloadRefetchApproval.signal.source_type,
        source_present:
          firstTinyCorrectedPayloadRefetchApproval.signal.source_present,
        operator_label_present:
          firstTinyCorrectedPayloadRefetchApproval.signal
            .operator_label_present,
        approval_reference_present:
          firstTinyCorrectedPayloadRefetchApproval.signal
            .approval_reference_present,
        expected_ticker:
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_ticker,
        expected_strategy:
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_strategy,
        expected_max_requests:
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_max_requests,
        expected_estimated_credits:
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_estimated_credits,
        expected_candle_persist_allowed:
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_candle_persist_allowed,
        expected_raw_response_persist_allowed:
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_raw_response_persist_allowed,
        expected_replay_allowed:
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_replay_allowed,
        expected_scanner_effect_allowed:
          firstTinyCorrectedPayloadRefetchApproval.expected_contract
            .expected_scanner_effect_allowed,
        approved_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation.approved_valid,
        ticker_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation.ticker_valid,
        strategy_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation.strategy_valid,
        max_requests_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .max_requests_valid,
        estimated_credits_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .estimated_credits_valid,
        candle_persist_scope_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .candle_persist_scope_valid,
        raw_response_persist_scope_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .raw_response_persist_scope_valid,
        replay_scope_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .replay_scope_valid,
        scanner_effect_scope_valid:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .scanner_effect_scope_valid,
        prior_window_mismatch_confirmed:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .prior_window_review_requires_correction,
        corrected_plan_ready:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .source_plan_ready,
        previous_payload_not_accepted_for_write:
          firstTinyCorrectedPayloadRefetchApproval.validation
            .previous_payload_not_accepted_for_write,
        provider_call_allowed_now:
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .provider_call_allowed_now,
        candle_persistence_allowed_now:
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .candle_persistence_allowed_now,
        raw_response_persistence_allowed_now:
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .raw_response_persistence_allowed_now,
        replay_allowed_now:
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .replay_allowed_now,
        scanner_effect_allowed_now:
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .scanner_effect_allowed_now,
        ready_to_accept_future_signal:
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .ready_to_accept_future_signal,
        ready_to_propose_corrected_refetch_action:
          firstTinyCorrectedPayloadRefetchApproval.readiness
            .ready_to_propose_corrected_refetch_action,
        blockers:
          firstTinyCorrectedPayloadRefetchApproval.blockers.join(","),
        warnings:
          firstTinyCorrectedPayloadRefetchApproval.warnings.join(","),
        recommended_next_steps:
          firstTinyCorrectedPayloadRefetchApproval.recommended_next_steps.join(
            ",",
          ),
        provider_call_executed:
          firstTinyCorrectedPayloadRefetchApproval.safety
            .provider_call_executed,
        candles_persisted:
          firstTinyCorrectedPayloadRefetchApproval.safety.candles_persisted,
        raw_response_persisted:
          firstTinyCorrectedPayloadRefetchApproval.safety
            .raw_response_persisted,
        fetch_run_persisted:
          firstTinyCorrectedPayloadRefetchApproval.safety.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCorrectedPayloadRefetchApproval.safety
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyCorrectedPayloadRefetchApproval.safety.replay_executed,
        scanner_behavior_changed:
          firstTinyCorrectedPayloadRefetchApproval.safety
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCorrectedPayloadRefetchApproval.safety
            .live_ranking_changed,
      },
    }),
    section({
      section_id:
        "corrected_first_tiny_historical_candle_payload_refetch_execute",
      title: "Corrected First Tiny Candle Payload Refetch Execute",
      severity:
        firstTinyCorrectedPayloadRefetchExecute.execution_status === "blocked" ||
        firstTinyCorrectedPayloadRefetchExecute.execution_status ===
          "corrected_payload_refetch_failed_no_persist" ||
        firstTinyCorrectedPayloadRefetchExecute.execution_status ===
          "corrected_payload_refetch_window_mismatch_no_persist"
          ? "critical"
          : "warning",
      lines: [
        lineValue("Status", firstTinyCorrectedPayloadRefetchExecute.execution_status),
        lineValue("Strategy", firstTinyCorrectedPayloadRefetchExecute.strategy_id),
        lineValue("Provider", "Twelve Data"),
        lineValue("Ticker", firstTinyCorrectedPayloadRefetchExecute.ticker),
        lineValue("Interval", firstTinyCorrectedPayloadRefetchExecute.interval),
        lineValue(
          "Trading day",
          firstTinyCorrectedPayloadRefetchExecute.trading_day,
        ),
        lineValue(
          "Request count",
          firstTinyCorrectedPayloadRefetchExecute.request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyCorrectedPayloadRefetchExecute.estimated_credits,
        ),
        lineValue(
          "Existing fetch run id",
          firstTinyCorrectedPayloadRefetchExecute.existing_fetch_run_id,
        ),
        lineValue(
          "Provider call executed",
          firstTinyCorrectedPayloadRefetchExecute.provider_call_executed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Raw candles",
          firstTinyCorrectedPayloadRefetchExecute.raw_candles,
        ),
        lineValue(
          "Normalized candles",
          firstTinyCorrectedPayloadRefetchExecute.normalized_candles,
        ),
        lineValue(
          "Filtered candles",
          firstTinyCorrectedPayloadRefetchExecute.filtered_candles,
        ),
        lineValue(
          "Filtered first timestamp",
          compact(
            firstTinyCorrectedPayloadRefetchExecute.filtered_first_timestamp,
            "none",
          ),
        ),
        lineValue(
          "Filtered last timestamp",
          compact(
            firstTinyCorrectedPayloadRefetchExecute.filtered_last_timestamp,
            "none",
          ),
        ),
        lineValue(
          "Filtered window matches intended",
          firstTinyCorrectedPayloadRefetchExecute
            .filtered_window_matches_intended
            ? "yes"
            : "no",
        ),
        lineValue(
          "Normalized filtered payload returned",
          firstTinyCorrectedPayloadRefetchExecute.normalized_payload_returned
            ? "yes"
            : "no",
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCorrectedPayloadRefetchExecute.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        route_build_marker:
          firstTinyCorrectedPayloadRefetchExecute.route_build_marker,
        execution_status:
          firstTinyCorrectedPayloadRefetchExecute.execution_status,
        strategy_id: firstTinyCorrectedPayloadRefetchExecute.strategy_id,
        provider: firstTinyCorrectedPayloadRefetchExecute.provider,
        endpoint: firstTinyCorrectedPayloadRefetchExecute.endpoint,
        ticker: firstTinyCorrectedPayloadRefetchExecute.ticker,
        interval: firstTinyCorrectedPayloadRefetchExecute.interval,
        trading_day: firstTinyCorrectedPayloadRefetchExecute.trading_day,
        request_count: firstTinyCorrectedPayloadRefetchExecute.request_count,
        estimated_credits:
          firstTinyCorrectedPayloadRefetchExecute.estimated_credits,
        existing_fetch_run_id:
          firstTinyCorrectedPayloadRefetchExecute.existing_fetch_run_id,
        intended_ny_window:
          firstTinyCorrectedPayloadRefetchExecute.intended_ny_window,
        intended_utc_start:
          firstTinyCorrectedPayloadRefetchExecute.intended_utc_start,
        intended_utc_end:
          firstTinyCorrectedPayloadRefetchExecute.intended_utc_end,
        accepted_window_end_inclusive:
          firstTinyCorrectedPayloadRefetchExecute
            .accepted_window_end_inclusive,
        expected_filtered_candles:
          firstTinyCorrectedPayloadRefetchExecute.expected_filtered_candles,
        provider_request: JSON.stringify(
          firstTinyCorrectedPayloadRefetchExecute.provider_request,
        ),
        provider_call_executed:
          firstTinyCorrectedPayloadRefetchExecute.provider_call_executed,
        provider_call_succeeded:
          firstTinyCorrectedPayloadRefetchExecute.provider_call_succeeded,
        provider_call_attempted:
          firstTinyCorrectedPayloadRefetchExecute.provider_call_attempted,
        http_status: firstTinyCorrectedPayloadRefetchExecute.http_status,
        provider_error_type:
          firstTinyCorrectedPayloadRefetchExecute.provider_error_type,
        cache_lookup_attempted:
          firstTinyCorrectedPayloadRefetchExecute.cache_lookup_attempted,
        cache_hit: firstTinyCorrectedPayloadRefetchExecute.cache_hit,
        cache_hit_source:
          firstTinyCorrectedPayloadRefetchExecute.cache_hit_source,
        raw_candles: firstTinyCorrectedPayloadRefetchExecute.raw_candles,
        normalized_candles:
          firstTinyCorrectedPayloadRefetchExecute.normalized_candles,
        filtered_candles:
          firstTinyCorrectedPayloadRefetchExecute.filtered_candles,
        valid_filtered_candles:
          firstTinyCorrectedPayloadRefetchExecute.valid_filtered_candles,
        invalid_filtered_candles:
          firstTinyCorrectedPayloadRefetchExecute.invalid_filtered_candles,
        duplicate_timestamps:
          firstTinyCorrectedPayloadRefetchExecute.duplicate_timestamps,
        out_of_order_candles:
          firstTinyCorrectedPayloadRefetchExecute.out_of_order_candles,
        filtered_first_timestamp:
          firstTinyCorrectedPayloadRefetchExecute.filtered_first_timestamp,
        filtered_last_timestamp:
          firstTinyCorrectedPayloadRefetchExecute.filtered_last_timestamp,
        filtered_window_matches_intended:
          firstTinyCorrectedPayloadRefetchExecute
            .filtered_window_matches_intended,
        normalized_payload_available:
          firstTinyCorrectedPayloadRefetchExecute.normalized_payload_available,
        normalized_payload_returned:
          firstTinyCorrectedPayloadRefetchExecute.normalized_payload_returned,
        normalized_payload_response_only:
          firstTinyCorrectedPayloadRefetchExecute
            .normalized_payload_response_only,
        normalized_payload_rows:
          firstTinyCorrectedPayloadRefetchExecute.normalized_payload.length,
        blockers:
          firstTinyCorrectedPayloadRefetchExecute.blockers.join(","),
        warnings:
          firstTinyCorrectedPayloadRefetchExecute.warnings.join(","),
        approval_status:
          firstTinyCorrectedPayloadRefetchExecute.approval_status,
        candles_persisted:
          firstTinyCorrectedPayloadRefetchExecute.candles_persisted,
        raw_response_persisted:
          firstTinyCorrectedPayloadRefetchExecute.raw_response_persisted,
        fetch_run_persisted:
          firstTinyCorrectedPayloadRefetchExecute.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCorrectedPayloadRefetchExecute.synthetic_outcomes_persisted,
        replay_executed:
          firstTinyCorrectedPayloadRefetchExecute.replay_executed,
        scanner_behavior_changed:
          firstTinyCorrectedPayloadRefetchExecute.scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCorrectedPayloadRefetchExecute.live_ranking_changed,
        recommended_next_steps:
          firstTinyCorrectedPayloadRefetchExecute.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "corrected_first_tiny_historical_candle_payload_refetch_result_verification",
      title: "Corrected First Tiny Candle Payload Refetch Result Verification",
      severity:
        firstTinyCorrectedPayloadRefetchResultVerification
          .approval_lock_warning.warning !== null
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Verification status",
          firstTinyCorrectedPayloadRefetchResultVerification.verification_status,
        ),
        lineValue(
          "Execution status",
          firstTinyCorrectedPayloadRefetchResultVerification.execution_status,
        ),
        lineValue(
          "Strategy",
          firstTinyCorrectedPayloadRefetchResultVerification.strategy_id,
        ),
        lineValue("Provider", "Twelve Data"),
        lineValue(
          "Endpoint",
          firstTinyCorrectedPayloadRefetchResultVerification.endpoint,
        ),
        lineValue(
          "Ticker",
          firstTinyCorrectedPayloadRefetchResultVerification.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyCorrectedPayloadRefetchResultVerification.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyCorrectedPayloadRefetchResultVerification.trading_day,
        ),
        lineValue(
          "Existing fetch run id",
          firstTinyCorrectedPayloadRefetchResultVerification
            .existing_fetch_run_id,
        ),
        lineValue(
          "Request count",
          firstTinyCorrectedPayloadRefetchResultVerification.request_count,
        ),
        lineValue(
          "Estimated credits",
          firstTinyCorrectedPayloadRefetchResultVerification.estimated_credits,
        ),
        lineValue(
          "Provider call executed",
          firstTinyCorrectedPayloadRefetchResultVerification
            .provider_call_executed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Provider call succeeded",
          firstTinyCorrectedPayloadRefetchResultVerification
            .provider_call_succeeded
            ? "yes"
            : "no",
        ),
        lineValue(
          "Intended NY window",
          firstTinyCorrectedPayloadRefetchResultVerification.intended_ny_window,
        ),
        lineValue(
          "Intended UTC window",
          `${firstTinyCorrectedPayloadRefetchResultVerification.intended_utc_start} -> ${firstTinyCorrectedPayloadRefetchResultVerification.intended_utc_end}`,
        ),
        lineValue(
          "Accepted end inclusive",
          firstTinyCorrectedPayloadRefetchResultVerification
            .accepted_window_end_inclusive
            ? "yes"
            : "no",
        ),
        lineValue(
          "Raw candles",
          firstTinyCorrectedPayloadRefetchResultVerification.raw_candles,
        ),
        lineValue(
          "Normalized candles",
          firstTinyCorrectedPayloadRefetchResultVerification.normalized_candles,
        ),
        lineValue(
          "Filtered candles",
          firstTinyCorrectedPayloadRefetchResultVerification.filtered_candles,
        ),
        lineValue(
          "Valid filtered candles",
          firstTinyCorrectedPayloadRefetchResultVerification
            .valid_filtered_candles,
        ),
        lineValue(
          "Invalid filtered candles",
          firstTinyCorrectedPayloadRefetchResultVerification
            .invalid_filtered_candles,
        ),
        lineValue(
          "Duplicate timestamps",
          firstTinyCorrectedPayloadRefetchResultVerification
            .duplicate_timestamps,
        ),
        lineValue(
          "Out-of-order candles",
          firstTinyCorrectedPayloadRefetchResultVerification
            .out_of_order_candles,
        ),
        lineValue(
          "Filtered first timestamp",
          firstTinyCorrectedPayloadRefetchResultVerification
            .filtered_first_timestamp,
        ),
        lineValue(
          "Filtered last timestamp",
          firstTinyCorrectedPayloadRefetchResultVerification
            .filtered_last_timestamp,
        ),
        lineValue(
          "Filtered window matches intended",
          firstTinyCorrectedPayloadRefetchResultVerification
            .filtered_window_matches_intended
            ? "yes"
            : "no",
        ),
        lineValue(
          "5min spacing valid",
          firstTinyCorrectedPayloadRefetchResultVerification
            .five_minute_spacing_valid
            ? "yes"
            : "no",
        ),
        lineValue(
          "Corrected payload sanity",
          firstTinyCorrectedPayloadRefetchResultVerification
            .corrected_payload_sanity_status,
        ),
        lineValue(
          "Payload response only",
          firstTinyCorrectedPayloadRefetchResultVerification
            .normalized_payload_response_only
            ? "yes"
            : "no",
        ),
        lineValue(
          "Static payload rows",
          firstTinyCorrectedPayloadRefetchResultVerification.payload_artifact
            .payload_row_count,
        ),
        lineValue(
          "OHLCV values invented",
          firstTinyCorrectedPayloadRefetchResultVerification.payload_artifact
            .ohlcv_values_not_invented
            ? "no"
            : "yes",
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Ready for executable candle persistence dry-run",
          firstTinyCorrectedPayloadRefetchResultVerification
            .ready_for_executable_candle_persistence_dry_run
            ? "yes"
            : "no",
        ),
        lineValue(
          "Candle write ready",
          firstTinyCorrectedPayloadRefetchResultVerification.candle_write_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Executable candle persistence plan ready",
          firstTinyCorrectedPayloadRefetchResultVerification
            .executable_candle_persistence_plan_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Approval lock warning",
          compact(
            firstTinyCorrectedPayloadRefetchResultVerification
              .approval_lock_warning.warning,
            "none",
          ),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCorrectedPayloadRefetchResultVerification
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        verification_marker:
          firstTinyCorrectedPayloadRefetchResultVerification
            .verification_marker,
        route_build_marker:
          firstTinyCorrectedPayloadRefetchResultVerification
            .route_build_marker,
        verification_status:
          firstTinyCorrectedPayloadRefetchResultVerification
            .verification_status,
        execution_status:
          firstTinyCorrectedPayloadRefetchResultVerification.execution_status,
        strategy_id:
          firstTinyCorrectedPayloadRefetchResultVerification.strategy_id,
        provider: firstTinyCorrectedPayloadRefetchResultVerification.provider,
        endpoint: firstTinyCorrectedPayloadRefetchResultVerification.endpoint,
        ticker: firstTinyCorrectedPayloadRefetchResultVerification.ticker,
        interval: firstTinyCorrectedPayloadRefetchResultVerification.interval,
        trading_day:
          firstTinyCorrectedPayloadRefetchResultVerification.trading_day,
        existing_fetch_run_id:
          firstTinyCorrectedPayloadRefetchResultVerification
            .existing_fetch_run_id,
        request_count:
          firstTinyCorrectedPayloadRefetchResultVerification.request_count,
        estimated_credits:
          firstTinyCorrectedPayloadRefetchResultVerification.estimated_credits,
        intended_ny_window:
          firstTinyCorrectedPayloadRefetchResultVerification.intended_ny_window,
        intended_utc_start:
          firstTinyCorrectedPayloadRefetchResultVerification
            .intended_utc_start,
        intended_utc_end:
          firstTinyCorrectedPayloadRefetchResultVerification.intended_utc_end,
        accepted_window_end_inclusive:
          firstTinyCorrectedPayloadRefetchResultVerification
            .accepted_window_end_inclusive,
        expected_filtered_candles:
          firstTinyCorrectedPayloadRefetchResultVerification
            .expected_filtered_candles,
        provider_call_executed:
          firstTinyCorrectedPayloadRefetchResultVerification
            .provider_call_executed,
        provider_call_succeeded:
          firstTinyCorrectedPayloadRefetchResultVerification
            .provider_call_succeeded,
        raw_candles:
          firstTinyCorrectedPayloadRefetchResultVerification.raw_candles,
        normalized_candles:
          firstTinyCorrectedPayloadRefetchResultVerification.normalized_candles,
        filtered_candles:
          firstTinyCorrectedPayloadRefetchResultVerification.filtered_candles,
        valid_filtered_candles:
          firstTinyCorrectedPayloadRefetchResultVerification
            .valid_filtered_candles,
        invalid_filtered_candles:
          firstTinyCorrectedPayloadRefetchResultVerification
            .invalid_filtered_candles,
        duplicate_timestamps:
          firstTinyCorrectedPayloadRefetchResultVerification
            .duplicate_timestamps,
        out_of_order_candles:
          firstTinyCorrectedPayloadRefetchResultVerification
            .out_of_order_candles,
        filtered_first_timestamp:
          firstTinyCorrectedPayloadRefetchResultVerification
            .filtered_first_timestamp,
        filtered_last_timestamp:
          firstTinyCorrectedPayloadRefetchResultVerification
            .filtered_last_timestamp,
        filtered_window_matches_intended:
          firstTinyCorrectedPayloadRefetchResultVerification
            .filtered_window_matches_intended,
        five_minute_spacing_valid:
          firstTinyCorrectedPayloadRefetchResultVerification
            .five_minute_spacing_valid,
        all_rows_ticker_aapl:
          firstTinyCorrectedPayloadRefetchResultVerification
            .all_rows_ticker_aapl,
        all_rows_interval_5min:
          firstTinyCorrectedPayloadRefetchResultVerification
            .all_rows_interval_5min,
        all_rows_adjusted_false:
          firstTinyCorrectedPayloadRefetchResultVerification
            .all_rows_adjusted_false,
        all_rows_trading_day_2026_07_08:
          firstTinyCorrectedPayloadRefetchResultVerification
            .all_rows_trading_day_2026_07_08,
        all_rows_fetch_run_id_matches:
          firstTinyCorrectedPayloadRefetchResultVerification
            .all_rows_fetch_run_id_matches,
        corrected_payload_sanity_status:
          firstTinyCorrectedPayloadRefetchResultVerification
            .corrected_payload_sanity_status,
        ready_for_executable_candle_persistence_dry_run:
          firstTinyCorrectedPayloadRefetchResultVerification
            .ready_for_executable_candle_persistence_dry_run,
        ready_for_next_dry_run_plan:
          firstTinyCorrectedPayloadRefetchResultVerification
            .ready_for_next_dry_run_plan,
        normalized_payload_available:
          firstTinyCorrectedPayloadRefetchResultVerification
            .normalized_payload_available,
        normalized_payload_response_only:
          firstTinyCorrectedPayloadRefetchResultVerification
            .normalized_payload_response_only,
        payload_row_count:
          firstTinyCorrectedPayloadRefetchResultVerification.payload_artifact
            .payload_row_count,
        ohlcv_values_recorded_in_artifact:
          firstTinyCorrectedPayloadRefetchResultVerification.payload_artifact
            .ohlcv_values_recorded_in_artifact,
        ohlcv_values_not_invented:
          firstTinyCorrectedPayloadRefetchResultVerification.payload_artifact
            .ohlcv_values_not_invented,
        approval_signal_still_enabled:
          firstTinyCorrectedPayloadRefetchResultVerification
            .approval_lock_warning.approval_signal_still_enabled,
        approval_lock_warning:
          firstTinyCorrectedPayloadRefetchResultVerification
            .approval_lock_warning.warning,
        candles_persisted:
          firstTinyCorrectedPayloadRefetchResultVerification.candles_persisted,
        raw_response_persisted:
          firstTinyCorrectedPayloadRefetchResultVerification
            .raw_response_persisted,
        fetch_run_persisted:
          firstTinyCorrectedPayloadRefetchResultVerification
            .fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCorrectedPayloadRefetchResultVerification
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyCorrectedPayloadRefetchResultVerification.replay_executed,
        scanner_behavior_changed:
          firstTinyCorrectedPayloadRefetchResultVerification
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCorrectedPayloadRefetchResultVerification
            .live_ranking_changed,
        candle_write_ready:
          firstTinyCorrectedPayloadRefetchResultVerification
            .candle_write_ready,
        executable_candle_persistence_plan_ready:
          firstTinyCorrectedPayloadRefetchResultVerification
            .executable_candle_persistence_plan_ready,
        recommended_next_steps:
          firstTinyCorrectedPayloadRefetchResultVerification.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "corrected_first_tiny_historical_candle_ohlcv_payload_static_capture",
      title: "Corrected First Tiny OHLCV Payload Static Capture",
      severity:
        firstTinyCorrectedOhlcvPayloadStaticCapture
          .ready_for_executable_persistence_dry_run
          ? "info"
          : "warning",
      lines: [
        lineValue(
          "Capture status",
          firstTinyCorrectedOhlcvPayloadStaticCapture.capture_status,
        ),
        lineValue("Source", firstTinyCorrectedOhlcvPayloadStaticCapture.source),
        lineValue("Ticker", firstTinyCorrectedOhlcvPayloadStaticCapture.ticker),
        lineValue(
          "Interval",
          firstTinyCorrectedOhlcvPayloadStaticCapture.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyCorrectedOhlcvPayloadStaticCapture.trading_day,
        ),
        lineValue(
          "Fetch run id",
          firstTinyCorrectedOhlcvPayloadStaticCapture.fetch_run_id,
        ),
        lineValue(
          "Row count",
          firstTinyCorrectedOhlcvPayloadStaticCapture.row_count,
        ),
        lineValue(
          "First timestamp",
          compact(
            firstTinyCorrectedOhlcvPayloadStaticCapture.first_timestamp,
            "none",
          ),
        ),
        lineValue(
          "Last timestamp",
          compact(
            firstTinyCorrectedOhlcvPayloadStaticCapture.last_timestamp,
            "none",
          ),
        ),
        lineValue(
          "Row count matches",
          firstTinyCorrectedOhlcvPayloadStaticCapture.row_count_matches
            ? "yes"
            : "no",
        ),
        lineValue(
          "5min spacing valid",
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .timestamps_are_5min_spaced
            ? "yes"
            : "no",
        ),
        lineValue(
          "OHLCV values present",
          firstTinyCorrectedOhlcvPayloadStaticCapture.ohlcv_values_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "OHLCV values valid",
          firstTinyCorrectedOhlcvPayloadStaticCapture.ohlcv_values_valid
            ? "yes"
            : "no",
        ),
        lineValue(
          "High/low geometry valid",
          firstTinyCorrectedOhlcvPayloadStaticCapture.high_low_geometry_valid
            ? "yes"
            : "no",
        ),
        lineValue(
          "Volume values valid",
          firstTinyCorrectedOhlcvPayloadStaticCapture.volume_values_valid
            ? "yes"
            : "no",
        ),
        lineValue(
          "Candle write ready",
          firstTinyCorrectedOhlcvPayloadStaticCapture.candle_write_ready
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready for executable persistence dry-run",
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .ready_for_executable_persistence_dry_run
            ? "yes"
            : "no",
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCorrectedOhlcvPayloadStaticCapture
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        capture_marker:
          firstTinyCorrectedOhlcvPayloadStaticCapture.capture_marker,
        capture_status:
          firstTinyCorrectedOhlcvPayloadStaticCapture.capture_status,
        source: firstTinyCorrectedOhlcvPayloadStaticCapture.source,
        source_verification:
          firstTinyCorrectedOhlcvPayloadStaticCapture.source_verification,
        provider: firstTinyCorrectedOhlcvPayloadStaticCapture.provider,
        ticker: firstTinyCorrectedOhlcvPayloadStaticCapture.ticker,
        interval: firstTinyCorrectedOhlcvPayloadStaticCapture.interval,
        trading_day: firstTinyCorrectedOhlcvPayloadStaticCapture.trading_day,
        fetch_run_id: firstTinyCorrectedOhlcvPayloadStaticCapture.fetch_run_id,
        row_count: firstTinyCorrectedOhlcvPayloadStaticCapture.row_count,
        expected_row_count:
          firstTinyCorrectedOhlcvPayloadStaticCapture.expected_row_count,
        first_timestamp:
          firstTinyCorrectedOhlcvPayloadStaticCapture.first_timestamp,
        last_timestamp:
          firstTinyCorrectedOhlcvPayloadStaticCapture.last_timestamp,
        row_count_matches:
          firstTinyCorrectedOhlcvPayloadStaticCapture.row_count_matches,
        timestamps_are_5min_spaced:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .timestamps_are_5min_spaced,
        duplicate_timestamps:
          firstTinyCorrectedOhlcvPayloadStaticCapture.duplicate_timestamps,
        out_of_order_candles:
          firstTinyCorrectedOhlcvPayloadStaticCapture.out_of_order_candles,
        ohlcv_values_present:
          firstTinyCorrectedOhlcvPayloadStaticCapture.ohlcv_values_present,
        ohlcv_values_valid:
          firstTinyCorrectedOhlcvPayloadStaticCapture.ohlcv_values_valid,
        high_low_geometry_valid:
          firstTinyCorrectedOhlcvPayloadStaticCapture.high_low_geometry_valid,
        volume_values_valid:
          firstTinyCorrectedOhlcvPayloadStaticCapture.volume_values_valid,
        adjusted_false_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .adjusted_false_for_all_rows,
        provider_valid_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .provider_valid_for_all_rows,
        ticker_valid_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .ticker_valid_for_all_rows,
        interval_valid_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .interval_valid_for_all_rows,
        timestamp_valid_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .timestamp_valid_for_all_rows,
        trading_day_valid_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .trading_day_valid_for_all_rows,
        session_valid_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .session_valid_for_all_rows,
        timezone_valid_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .timezone_valid_for_all_rows,
        fetch_run_id_valid_for_all_rows:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .fetch_run_id_valid_for_all_rows,
        invalid_row_count:
          firstTinyCorrectedOhlcvPayloadStaticCapture.invalid_row_count,
        candle_write_ready:
          firstTinyCorrectedOhlcvPayloadStaticCapture.candle_write_ready,
        ready_for_executable_persistence_dry_run:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .ready_for_executable_persistence_dry_run,
        candles_persisted:
          firstTinyCorrectedOhlcvPayloadStaticCapture.candles_persisted,
        raw_response_persisted:
          firstTinyCorrectedOhlcvPayloadStaticCapture.raw_response_persisted,
        fetch_run_persisted:
          firstTinyCorrectedOhlcvPayloadStaticCapture.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCorrectedOhlcvPayloadStaticCapture
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyCorrectedOhlcvPayloadStaticCapture.replay_executed,
        scanner_behavior_changed:
          firstTinyCorrectedOhlcvPayloadStaticCapture.scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCorrectedOhlcvPayloadStaticCapture.live_ranking_changed,
        recommended_next_steps:
          firstTinyCorrectedOhlcvPayloadStaticCapture.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "first_tiny_historical_candle_executable_persistence_dry_run_plan",
      title: "Executable First Tiny Candle Persistence Dry-Run Plan",
      severity:
        firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
          .valid_candle_rows ===
        firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
          .expected_candle_rows
          ? "info"
          : "warning",
      lines: [
        lineValue("Status", "planned / dry-run only"),
        lineValue(
          "Plan version",
          firstTinyExecutableCandlePersistenceDryRunPlan.plan_version,
        ),
        lineValue(
          "Source verification",
          firstTinyExecutableCandlePersistenceDryRunPlan.source_verification,
        ),
        lineValue(
          "Target table",
          firstTinyExecutableCandlePersistenceDryRunPlan.target_table,
        ),
        lineValue(
          "Fetch run id",
          firstTinyExecutableCandlePersistenceDryRunPlan.fetch_run.fetch_run_id,
        ),
        lineValue(
          "Ticker",
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope
            .trading_day,
        ),
        lineValue(
          "Executable payload available",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .executable_payload_available
            ? "yes"
            : "no",
        ),
        lineValue(
          "Candidate candle rows",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .candidate_candle_rows,
        ),
        lineValue(
          "Timestamp-valid rows",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .timestamp_valid_rows,
        ),
        lineValue(
          "Candle-write-valid rows",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .candle_write_valid_rows,
        ),
        lineValue(
          "Invalid candle rows",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .invalid_candle_rows,
        ),
        lineValue(
          "OHLCV valid rows",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .ohlcv_valid_rows,
        ),
        lineValue(
          "OHLCV missing rows",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .ohlcv_missing_rows,
        ),
        lineValue(
          "First timestamp",
          compact(
            firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
              .first_timestamp,
            "none",
          ),
        ),
        lineValue(
          "Last timestamp",
          compact(
            firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
              .last_timestamp,
            "none",
          ),
        ),
        lineValue(
          "5min spacing valid",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .five_minute_spacing_valid
            ? "yes"
            : "no",
        ),
        lineValue(
          "Window matches intended",
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .window_matches_intended
            ? "yes"
            : "no",
        ),
        lineValue(
          "Cache readback status",
          firstTinyExecutableCandlePersistenceDryRunPlan.cache_readback.status,
        ),
        lineValue(
          "Cache readback warning",
          compact(
            firstTinyExecutableCandlePersistenceDryRunPlan.cache_readback
              .warning,
            "none",
          ),
        ),
        lineValue(
          "Planned inserts",
          firstTinyExecutableCandlePersistenceDryRunPlan.upsert_plan
            .planned_inserts,
        ),
        lineValue(
          "Planned updates",
          firstTinyExecutableCandlePersistenceDryRunPlan.upsert_plan
            .planned_updates,
        ),
        lineValue(
          "Planned skips",
          firstTinyExecutableCandlePersistenceDryRunPlan.upsert_plan
            .planned_skips,
        ),
        lineValue(
          "Planned rejections",
          firstTinyExecutableCandlePersistenceDryRunPlan.upsert_plan
            .planned_invalid_rejections,
        ),
        lineValue(
          "Conflict target",
          firstTinyExecutableCandlePersistenceDryRunPlan.conflict_target.join(
            ", ",
          ),
        ),
        lineValue(
          "Candle write allowed now",
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .candle_write_allowed_now
            ? "yes"
            : "no",
        ),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Requires separate operator approval",
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .requires_separate_operator_approval
            ? "yes"
            : "no",
        ),
        lineValue(
          "Top rejection reasons",
          Object.entries(
            firstTinyExecutableCandlePersistenceDryRunPlan.validation
              .rejection_reason_counts,
          )
            .map(([reason, count]) => `${reason}:${count}`)
            .join(", ") || "none",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyExecutableCandlePersistenceDryRunPlan
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        plan_marker:
          firstTinyExecutableCandlePersistenceDryRunPlan.plan_marker,
        plan_status:
          firstTinyExecutableCandlePersistenceDryRunPlan.plan_status,
        plan_version:
          firstTinyExecutableCandlePersistenceDryRunPlan.plan_version,
        dry_run_only:
          firstTinyExecutableCandlePersistenceDryRunPlan.dry_run_only,
        source_verification:
          firstTinyExecutableCandlePersistenceDryRunPlan.source_verification,
        source_capture_marker:
          firstTinyExecutableCandlePersistenceDryRunPlan.source_capture_marker,
        source_artifact:
          firstTinyExecutableCandlePersistenceDryRunPlan.source_artifact,
        source_verification_status:
          firstTinyExecutableCandlePersistenceDryRunPlan
            .source_verification_status,
        source_execution_status:
          firstTinyExecutableCandlePersistenceDryRunPlan.source_execution_status,
        source_strategy:
          firstTinyExecutableCandlePersistenceDryRunPlan.source_strategy,
        target_table:
          firstTinyExecutableCandlePersistenceDryRunPlan.target_table,
        conflict_target:
          firstTinyExecutableCandlePersistenceDryRunPlan.conflict_target.join(
            ",",
          ),
        fetch_run_id:
          firstTinyExecutableCandlePersistenceDryRunPlan.fetch_run.fetch_run_id,
        provider:
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope.provider,
        ticker:
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope.ticker,
        interval:
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope.interval,
        trading_day:
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope
            .trading_day,
        session:
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope.session,
        timezone:
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope.timezone,
        adjusted:
          firstTinyExecutableCandlePersistenceDryRunPlan.request_scope.adjusted,
        executable_payload_available:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .executable_payload_available,
        source_payload_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .source_payload_rows,
        expected_candle_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .expected_candle_rows,
        candidate_candle_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .candidate_candle_rows,
        timestamp_metadata_valid_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .timestamp_metadata_valid_rows,
        timestamp_valid_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .timestamp_valid_rows,
        candle_write_valid_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .candle_write_valid_rows,
        valid_candle_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .valid_candle_rows,
        invalid_candle_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .invalid_candle_rows,
        ohlcv_valid_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .ohlcv_valid_rows,
        ohlcv_missing_rows:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .ohlcv_missing_rows,
        ohlcv_values_not_invented:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .ohlcv_values_not_invented,
        first_timestamp:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .first_timestamp,
        last_timestamp:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .last_timestamp,
        five_minute_spacing_valid:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .five_minute_spacing_valid,
        window_matches_intended:
          firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary
            .window_matches_intended,
        cache_readback_status:
          firstTinyExecutableCandlePersistenceDryRunPlan.cache_readback.status,
        exact_insert_update_skip_split_available:
          firstTinyExecutableCandlePersistenceDryRunPlan.cache_readback
            .exact_insert_update_skip_split_available,
        cache_readback_warning:
          firstTinyExecutableCandlePersistenceDryRunPlan.cache_readback.warning,
        planned_inserts:
          firstTinyExecutableCandlePersistenceDryRunPlan.upsert_plan
            .planned_inserts,
        planned_updates:
          firstTinyExecutableCandlePersistenceDryRunPlan.upsert_plan
            .planned_updates,
        planned_skips:
          firstTinyExecutableCandlePersistenceDryRunPlan.upsert_plan
            .planned_skips,
        planned_invalid_rejections:
          firstTinyExecutableCandlePersistenceDryRunPlan.upsert_plan
            .planned_invalid_rejections,
        rejection_reason_counts: JSON.stringify(
          firstTinyExecutableCandlePersistenceDryRunPlan.validation
            .rejection_reason_counts,
        ),
        candle_write_allowed_now:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .candle_write_allowed_now,
        requires_separate_operator_approval:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .requires_separate_operator_approval,
        provider_fetch_added:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .provider_fetch_added,
        historical_fetch_added:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .historical_fetch_added,
        candles_persisted:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .candles_persisted,
        raw_response_persisted:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .raw_response_persisted,
        fetch_run_persisted:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety.replay_executed,
        scanner_behavior_changed:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyExecutableCandlePersistenceDryRunPlan.safety
            .live_ranking_changed,
        recommended_next_steps:
          firstTinyExecutableCandlePersistenceDryRunPlan.recommended_next_steps.join(
            ",",
          ),
        warnings:
          firstTinyExecutableCandlePersistenceDryRunPlan.warnings.join(","),
      },
    }),
    section({
      section_id: "first_tiny_historical_candle_persistence_approval",
      title: "First Tiny Candle Persistence Approval",
      severity:
        firstTinyCandlePersistenceApproval.approval_status === "invalid"
          ? "critical"
          : "warning",
      lines: [
        lineValue(
          "Approval status",
          firstTinyCandlePersistenceApproval.approval_status,
        ),
        lineValue(
          "Signal active",
          firstTinyCandlePersistenceApproval.signal.signal_active
            ? "yes"
            : "no",
        ),
        lineValue(
          "Expected ticker",
          firstTinyCandlePersistenceApproval.expected_contract.expected_ticker,
        ),
        lineValue(
          "Expected interval",
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_interval,
        ),
        lineValue(
          "Expected trading day",
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_trading_day,
        ),
        lineValue(
          "Expected fetch run id",
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_fetch_run_id,
        ),
        lineValue(
          "Expected max rows",
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_max_rows,
        ),
        lineValue(
          "Expected inserts",
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_inserts,
        ),
        lineValue(
          "Plan version",
          firstTinyCandlePersistenceApproval.dry_run_snapshot.plan_version,
        ),
        lineValue(
          "Source verification",
          firstTinyCandlePersistenceApproval.dry_run_snapshot
            .source_verification,
        ),
        lineValue(
          "Candle-write-valid rows",
          firstTinyCandlePersistenceApproval.dry_run_snapshot
            .candle_write_valid_rows,
        ),
        lineValue(
          "Planned inserts",
          firstTinyCandlePersistenceApproval.dry_run_snapshot.planned_inserts,
        ),
        lineValue(
          "Planned rejections",
          firstTinyCandlePersistenceApproval.dry_run_snapshot
            .planned_invalid_rejections,
        ),
        lineValue("Raw response persistence allowed", "no"),
        lineValue("Replay allowed", "no"),
        lineValue("Scanner effect allowed", "no"),
        lineValue("Candle write allowed now", "no"),
        lineValue("Candles persisted", "no"),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue(
          "Ready to accept future signal",
          firstTinyCandlePersistenceApproval.readiness
            .ready_to_accept_future_signal
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to propose candle persistence write",
          firstTinyCandlePersistenceApproval.readiness
            .ready_to_propose_candle_persistence_write
            ? "yes"
            : "no",
        ),
        lineValue(
          "Blockers",
          compactListText(firstTinyCandlePersistenceApproval.blockers),
        ),
        lineValue(
          "Warnings",
          compactListText(firstTinyCandlePersistenceApproval.warnings),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCandlePersistenceApproval.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        advisory_only: firstTinyCandlePersistenceApproval.advisory_only,
        approval_gate_only:
          firstTinyCandlePersistenceApproval.approval_gate_only,
        approval_status:
          firstTinyCandlePersistenceApproval.approval_status,
        signal_active:
          firstTinyCandlePersistenceApproval.signal.signal_active,
        source_present:
          firstTinyCandlePersistenceApproval.signal.source_present,
        source_type: firstTinyCandlePersistenceApproval.signal.source_type,
        operator_label_present:
          firstTinyCandlePersistenceApproval.signal.operator_label_present,
        approval_reference_present:
          firstTinyCandlePersistenceApproval.signal.approval_reference_present,
        expected_ticker:
          firstTinyCandlePersistenceApproval.expected_contract.expected_ticker,
        expected_interval:
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_interval,
        expected_trading_day:
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_trading_day,
        expected_fetch_run_id:
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_fetch_run_id,
        expected_max_rows:
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_max_rows,
        expected_inserts:
          firstTinyCandlePersistenceApproval.expected_contract
            .expected_inserts,
        plan_version:
          firstTinyCandlePersistenceApproval.dry_run_snapshot.plan_version,
        source_verification:
          firstTinyCandlePersistenceApproval.dry_run_snapshot
            .source_verification,
        target_table:
          firstTinyCandlePersistenceApproval.dry_run_snapshot.target_table,
        candle_write_valid_rows:
          firstTinyCandlePersistenceApproval.dry_run_snapshot
            .candle_write_valid_rows,
        planned_inserts:
          firstTinyCandlePersistenceApproval.dry_run_snapshot.planned_inserts,
        planned_updates:
          firstTinyCandlePersistenceApproval.dry_run_snapshot.planned_updates,
        planned_skips:
          firstTinyCandlePersistenceApproval.dry_run_snapshot.planned_skips,
        planned_invalid_rejections:
          firstTinyCandlePersistenceApproval.dry_run_snapshot
            .planned_invalid_rejections,
        approved_valid:
          firstTinyCandlePersistenceApproval.validation.approved_valid,
        ticker_valid:
          firstTinyCandlePersistenceApproval.validation.ticker_valid,
        interval_valid:
          firstTinyCandlePersistenceApproval.validation.interval_valid,
        trading_day_valid:
          firstTinyCandlePersistenceApproval.validation.trading_day_valid,
        fetch_run_id_valid:
          firstTinyCandlePersistenceApproval.validation.fetch_run_id_valid,
        max_rows_valid:
          firstTinyCandlePersistenceApproval.validation.max_rows_valid,
        expected_inserts_valid:
          firstTinyCandlePersistenceApproval.validation.expected_inserts_valid,
        raw_response_persist_scope_valid:
          firstTinyCandlePersistenceApproval.validation
            .raw_response_persist_scope_valid,
        replay_scope_valid:
          firstTinyCandlePersistenceApproval.validation.replay_scope_valid,
        scanner_effect_scope_valid:
          firstTinyCandlePersistenceApproval.validation
            .scanner_effect_scope_valid,
        static_ohlcv_capture_ready:
          firstTinyCandlePersistenceApproval.validation
            .static_ohlcv_capture_ready,
        source_verification_valid:
          firstTinyCandlePersistenceApproval.validation
            .source_verification_valid,
        plan_version_valid:
          firstTinyCandlePersistenceApproval.validation.plan_version_valid,
        dry_run_plan_ready:
          firstTinyCandlePersistenceApproval.validation.dry_run_plan_ready,
        candle_write_allowed_now:
          firstTinyCandlePersistenceApproval.readiness
            .candle_write_allowed_now,
        candles_persisted:
          firstTinyCandlePersistenceApproval.readiness.candles_persisted,
        raw_response_persisted:
          firstTinyCandlePersistenceApproval.readiness.raw_response_persisted,
        fetch_run_persisted:
          firstTinyCandlePersistenceApproval.readiness.fetch_run_persisted,
        replay_executed:
          firstTinyCandlePersistenceApproval.readiness.replay_executed,
        scanner_behavior_changed:
          firstTinyCandlePersistenceApproval.readiness
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCandlePersistenceApproval.readiness.live_ranking_changed,
        ready_to_accept_future_signal:
          firstTinyCandlePersistenceApproval.readiness
            .ready_to_accept_future_signal,
        ready_to_propose_candle_persistence_write:
          firstTinyCandlePersistenceApproval.readiness
            .ready_to_propose_candle_persistence_write,
        blockers: firstTinyCandlePersistenceApproval.blockers.join(","),
        warnings: firstTinyCandlePersistenceApproval.warnings.join(","),
        recommended_next_steps:
          firstTinyCandlePersistenceApproval.recommended_next_steps.join(","),
      },
    }),
    section({
      section_id: "first_tiny_historical_candle_persistence_execute",
      title: "First Tiny Candle Persistence Execute",
      severity:
        firstTinyCandlePersistenceExecute.execution_status === "blocked" ||
        firstTinyCandlePersistenceExecute.execution_status === "failed"
          ? "critical"
          : "warning",
      lines: [
        lineValue("Status", firstTinyCandlePersistenceExecute.execution_status),
        lineValue("Target table", firstTinyCandlePersistenceExecute.target_table),
        lineValue("Plan version", firstTinyCandlePersistenceExecute.plan_version),
        lineValue(
          "Source verification",
          firstTinyCandlePersistenceExecute.source_verification,
        ),
        lineValue("Ticker", firstTinyCandlePersistenceExecute.ticker),
        lineValue("Interval", firstTinyCandlePersistenceExecute.interval),
        lineValue(
          "Trading day",
          firstTinyCandlePersistenceExecute.trading_day,
        ),
        lineValue(
          "Fetch run id",
          firstTinyCandlePersistenceExecute.fetch_run_id,
        ),
        lineValue(
          "Expected rows",
          firstTinyCandlePersistenceExecute.expected_rows,
        ),
        lineValue(
          "Inserted rows",
          `${firstTinyCandlePersistenceExecute.candle_rows_inserted}/${firstTinyCandlePersistenceExecute.expected_rows}`,
        ),
        lineValue(
          "Updated rows",
          `${firstTinyCandlePersistenceExecute.candle_rows_updated}/${firstTinyCandlePersistenceExecute.expected_rows}`,
        ),
        lineValue(
          "Skipped rows",
          `${firstTinyCandlePersistenceExecute.candle_rows_skipped}/${firstTinyCandlePersistenceExecute.expected_rows}`,
        ),
        lineValue(
          "Rejected rows",
          firstTinyCandlePersistenceExecute.candle_rows_rejected,
        ),
        lineValue(
          "Readback verified",
          firstTinyCandlePersistenceExecute.readback_verified ? "yes" : "no",
        ),
        lineValue(
          "Candles persisted",
          firstTinyCandlePersistenceExecute.candles_persisted ? "yes" : "no",
        ),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Blockers",
          compactListText(firstTinyCandlePersistenceExecute.blockers),
        ),
        lineValue(
          "Warnings",
          compactListText(firstTinyCandlePersistenceExecute.warnings),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCandlePersistenceExecute.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        route_build_marker:
          firstTinyCandlePersistenceExecute.route_build_marker,
        execution_status:
          firstTinyCandlePersistenceExecute.execution_status,
        approval_status: firstTinyCandlePersistenceExecute.approval_status,
        target_table: firstTinyCandlePersistenceExecute.target_table,
        source_verification:
          firstTinyCandlePersistenceExecute.source_verification,
        plan_version: firstTinyCandlePersistenceExecute.plan_version,
        provider: firstTinyCandlePersistenceExecute.provider,
        ticker: firstTinyCandlePersistenceExecute.ticker,
        interval: firstTinyCandlePersistenceExecute.interval,
        trading_day: firstTinyCandlePersistenceExecute.trading_day,
        fetch_run_id: firstTinyCandlePersistenceExecute.fetch_run_id,
        expected_rows: firstTinyCandlePersistenceExecute.expected_rows,
        attempted_rows: firstTinyCandlePersistenceExecute.attempted_rows,
        candle_rows_inserted:
          firstTinyCandlePersistenceExecute.candle_rows_inserted,
        candle_rows_updated:
          firstTinyCandlePersistenceExecute.candle_rows_updated,
        candle_rows_skipped:
          firstTinyCandlePersistenceExecute.candle_rows_skipped,
        candle_rows_rejected:
          firstTinyCandlePersistenceExecute.candle_rows_rejected,
        readback_verified:
          firstTinyCandlePersistenceExecute.readback_verified,
        duplicate_prevented:
          firstTinyCandlePersistenceExecute.duplicate_prevented,
        candles_persisted:
          firstTinyCandlePersistenceExecute.candles_persisted,
        raw_response_persisted:
          firstTinyCandlePersistenceExecute.raw_response_persisted,
        fetch_run_persisted:
          firstTinyCandlePersistenceExecute.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCandlePersistenceExecute.synthetic_outcomes_persisted,
        replay_executed: firstTinyCandlePersistenceExecute.replay_executed,
        scanner_behavior_changed:
          firstTinyCandlePersistenceExecute.scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCandlePersistenceExecute.live_ranking_changed,
        provider_call_executed:
          firstTinyCandlePersistenceExecute.provider_call_executed,
        blockers: firstTinyCandlePersistenceExecute.blockers.join(","),
        warnings: firstTinyCandlePersistenceExecute.warnings.join(","),
        recommended_next_steps:
          firstTinyCandlePersistenceExecute.recommended_next_steps.join(","),
      },
    }),
    section({
      section_id:
        "first_tiny_historical_candle_persistence_readback_verification",
      title: "First Tiny Candle Persistence Readback Verification",
      severity:
        firstTinyCandlePersistenceReadbackVerification.verification_status ===
        "failed"
          ? "critical"
          : "warning",
      lines: [
        lineValue(
          "Status",
          firstTinyCandlePersistenceReadbackVerification.verification_status,
        ),
        lineValue(
          "Target table",
          firstTinyCandlePersistenceReadbackVerification.target_table,
        ),
        lineValue(
          "Source verification",
          firstTinyCandlePersistenceReadbackVerification.source_verification,
        ),
        lineValue("Ticker", firstTinyCandlePersistenceReadbackVerification.ticker),
        lineValue(
          "Interval",
          firstTinyCandlePersistenceReadbackVerification.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyCandlePersistenceReadbackVerification.trading_day,
        ),
        lineValue(
          "Fetch run id",
          firstTinyCandlePersistenceReadbackVerification.fetch_run_id,
        ),
        lineValue(
          "Expected rows",
          firstTinyCandlePersistenceReadbackVerification.expected_rows,
        ),
        lineValue(
          "Readback rows",
          `${firstTinyCandlePersistenceReadbackVerification.readback_rows}/${firstTinyCandlePersistenceReadbackVerification.expected_rows}`,
        ),
        lineValue(
          "Matched rows",
          `${firstTinyCandlePersistenceReadbackVerification.matched_rows}/${firstTinyCandlePersistenceReadbackVerification.expected_rows}`,
        ),
        lineValue(
          "Missing rows",
          firstTinyCandlePersistenceReadbackVerification.missing_rows,
        ),
        lineValue(
          "Mismatched rows",
          firstTinyCandlePersistenceReadbackVerification.mismatched_rows,
        ),
        lineValue(
          "Unexpected rows",
          firstTinyCandlePersistenceReadbackVerification.unexpected_rows,
        ),
        lineValue(
          "Readback verified",
          firstTinyCandlePersistenceReadbackVerification.readback_verified
            ? "yes"
            : "no",
        ),
        lineValue(
          "Candles persisted",
          firstTinyCandlePersistenceReadbackVerification.candles_persisted
            ? "yes"
            : "no",
        ),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted by this action", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCandlePersistenceReadbackVerification
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        route_build_marker:
          firstTinyCandlePersistenceReadbackVerification.route_build_marker,
        verification_status:
          firstTinyCandlePersistenceReadbackVerification.verification_status,
        target_table:
          firstTinyCandlePersistenceReadbackVerification.target_table,
        source_verification:
          firstTinyCandlePersistenceReadbackVerification.source_verification,
        provider: firstTinyCandlePersistenceReadbackVerification.provider,
        ticker: firstTinyCandlePersistenceReadbackVerification.ticker,
        interval: firstTinyCandlePersistenceReadbackVerification.interval,
        trading_day:
          firstTinyCandlePersistenceReadbackVerification.trading_day,
        fetch_run_id:
          firstTinyCandlePersistenceReadbackVerification.fetch_run_id,
        expected_rows:
          firstTinyCandlePersistenceReadbackVerification.expected_rows,
        readback_rows:
          firstTinyCandlePersistenceReadbackVerification.readback_rows,
        matched_rows:
          firstTinyCandlePersistenceReadbackVerification.matched_rows,
        missing_rows:
          firstTinyCandlePersistenceReadbackVerification.missing_rows,
        unexpected_rows:
          firstTinyCandlePersistenceReadbackVerification.unexpected_rows,
        mismatched_rows:
          firstTinyCandlePersistenceReadbackVerification.mismatched_rows,
        duplicate_timestamps:
          firstTinyCandlePersistenceReadbackVerification.duplicate_timestamps,
        out_of_order_rows:
          firstTinyCandlePersistenceReadbackVerification.out_of_order_rows,
        first_timestamp:
          firstTinyCandlePersistenceReadbackVerification.first_timestamp,
        last_timestamp:
          firstTinyCandlePersistenceReadbackVerification.last_timestamp,
        timestamps_5min_spaced:
          firstTinyCandlePersistenceReadbackVerification
            .timestamps_5min_spaced,
        readback_verified:
          firstTinyCandlePersistenceReadbackVerification.readback_verified,
        candles_persisted:
          firstTinyCandlePersistenceReadbackVerification.candles_persisted,
        raw_response_persisted:
          firstTinyCandlePersistenceReadbackVerification
            .raw_response_persisted,
        fetch_run_persisted:
          firstTinyCandlePersistenceReadbackVerification.fetch_run_persisted,
        replay_executed:
          firstTinyCandlePersistenceReadbackVerification.replay_executed,
        scanner_behavior_changed:
          firstTinyCandlePersistenceReadbackVerification
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCandlePersistenceReadbackVerification.live_ranking_changed,
        blockers:
          firstTinyCandlePersistenceReadbackVerification.blockers.join(","),
        warnings:
          firstTinyCandlePersistenceReadbackVerification.warnings.join(","),
        recommended_next_steps:
          firstTinyCandlePersistenceReadbackVerification.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "first_tiny_historical_candle_persistence_result_verification",
      title: "First Tiny Candle Persistence Result Verification",
      severity:
        firstTinyCandlePersistenceResultVerification
          .candle_persistence_approval_signal_still_enabled
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Verification status",
          firstTinyCandlePersistenceResultVerification.verification_status,
        ),
        lineValue(
          "Target table",
          firstTinyCandlePersistenceResultVerification.target_table,
        ),
        lineValue("Ticker", firstTinyCandlePersistenceResultVerification.ticker),
        lineValue(
          "Interval",
          firstTinyCandlePersistenceResultVerification.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyCandlePersistenceResultVerification.trading_day,
        ),
        lineValue(
          "Fetch run id",
          firstTinyCandlePersistenceResultVerification.fetch_run_id,
        ),
        lineValue(
          "Expected rows",
          firstTinyCandlePersistenceResultVerification.expected_rows,
        ),
        lineValue(
          "Readback rows",
          firstTinyCandlePersistenceResultVerification.readback_rows,
        ),
        lineValue(
          "Matched rows",
          firstTinyCandlePersistenceResultVerification.matched_rows,
        ),
        lineValue(
          "Missing rows",
          firstTinyCandlePersistenceResultVerification.missing_rows,
        ),
        lineValue(
          "Unexpected rows",
          firstTinyCandlePersistenceResultVerification.unexpected_rows,
        ),
        lineValue(
          "Mismatched rows",
          firstTinyCandlePersistenceResultVerification.mismatched_rows,
        ),
        lineValue(
          "First timestamp",
          firstTinyCandlePersistenceResultVerification.first_timestamp,
        ),
        lineValue(
          "Last timestamp",
          firstTinyCandlePersistenceResultVerification.last_timestamp,
        ),
        lineValue(
          "Candles persisted",
          firstTinyCandlePersistenceResultVerification.candles_persisted
            ? "yes"
            : "no",
        ),
        lineValue(
          "Readback verified",
          firstTinyCandlePersistenceResultVerification.readback_verified
            ? "yes"
            : "no",
        ),
        lineValue("Raw response persisted", "no"),
        lineValue("Fetch run persisted by readback", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Ready for replay dry-run planning",
          firstTinyCandlePersistenceResultVerification
            .ready_for_replay_dry_run_planning
            ? "yes"
            : "no",
        ),
        lineValue(
          "Replay allowed now",
          firstTinyCandlePersistenceResultVerification.replay_allowed_now
            ? "yes"
            : "no",
        ),
        lineValue(
          "Scanner use allowed now",
          firstTinyCandlePersistenceResultVerification.scanner_use_allowed_now
            ? "yes"
            : "no",
        ),
        lineValue(
          "Approval lock warning",
          firstTinyCandlePersistenceResultVerification
            .candle_persistence_approval_signal_still_enabled
            ? "disable_candle_persistence_approval_signal_after_success"
            : "none",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyCandlePersistenceResultVerification
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        result_marker:
          firstTinyCandlePersistenceResultVerification.result_marker,
        verification_status:
          firstTinyCandlePersistenceResultVerification.verification_status,
        target_table:
          firstTinyCandlePersistenceResultVerification.target_table,
        source_verification:
          firstTinyCandlePersistenceResultVerification.source_verification,
        provider: firstTinyCandlePersistenceResultVerification.provider,
        ticker: firstTinyCandlePersistenceResultVerification.ticker,
        interval: firstTinyCandlePersistenceResultVerification.interval,
        trading_day:
          firstTinyCandlePersistenceResultVerification.trading_day,
        fetch_run_id:
          firstTinyCandlePersistenceResultVerification.fetch_run_id,
        expected_rows:
          firstTinyCandlePersistenceResultVerification.expected_rows,
        readback_rows:
          firstTinyCandlePersistenceResultVerification.readback_rows,
        matched_rows:
          firstTinyCandlePersistenceResultVerification.matched_rows,
        missing_rows:
          firstTinyCandlePersistenceResultVerification.missing_rows,
        unexpected_rows:
          firstTinyCandlePersistenceResultVerification.unexpected_rows,
        mismatched_rows:
          firstTinyCandlePersistenceResultVerification.mismatched_rows,
        duplicate_timestamps:
          firstTinyCandlePersistenceResultVerification.duplicate_timestamps,
        out_of_order_rows:
          firstTinyCandlePersistenceResultVerification.out_of_order_rows,
        first_timestamp:
          firstTinyCandlePersistenceResultVerification.first_timestamp,
        last_timestamp:
          firstTinyCandlePersistenceResultVerification.last_timestamp,
        timestamps_5min_spaced:
          firstTinyCandlePersistenceResultVerification
            .timestamps_5min_spaced,
        candles_persisted:
          firstTinyCandlePersistenceResultVerification.candles_persisted,
        readback_verified:
          firstTinyCandlePersistenceResultVerification.readback_verified,
        raw_response_persisted:
          firstTinyCandlePersistenceResultVerification.raw_response_persisted,
        fetch_run_persisted:
          firstTinyCandlePersistenceResultVerification.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyCandlePersistenceResultVerification
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyCandlePersistenceResultVerification.replay_executed,
        scanner_behavior_changed:
          firstTinyCandlePersistenceResultVerification
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyCandlePersistenceResultVerification.live_ranking_changed,
        provider_call_executed:
          firstTinyCandlePersistenceResultVerification.provider_call_executed,
        ready_for_replay_dry_run_planning:
          firstTinyCandlePersistenceResultVerification
            .ready_for_replay_dry_run_planning,
        replay_allowed_now:
          firstTinyCandlePersistenceResultVerification.replay_allowed_now,
        scanner_use_allowed_now:
          firstTinyCandlePersistenceResultVerification.scanner_use_allowed_now,
        approval_signal_source:
          firstTinyCandlePersistenceResultVerification.approval_signal_source,
        candle_persistence_approval_signal_present:
          firstTinyCandlePersistenceResultVerification
            .candle_persistence_approval_signal_present,
        candle_persistence_approval_signal_still_enabled:
          firstTinyCandlePersistenceResultVerification
            .candle_persistence_approval_signal_still_enabled,
        conclusion: firstTinyCandlePersistenceResultVerification.conclusion,
        warnings:
          firstTinyCandlePersistenceResultVerification.warnings.join(","),
        recommended_next_steps:
          firstTinyCandlePersistenceResultVerification.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_replay_dry_run_plan",
      title: "First Tiny Persisted Candle Replay Dry-Run Plan",
      severity: "info",
      lines: [
        lineValue(
          "Status",
          `${firstTinyHistoricalReplayDryRunPlan.replay_plan_status} / dry-run only`,
        ),
        lineValue(
          "Source verification",
          firstTinyHistoricalReplayDryRunPlan.source_verification,
        ),
        lineValue(
          "Source table",
          firstTinyHistoricalReplayDryRunPlan.source_table,
        ),
        lineValue("Ticker", firstTinyHistoricalReplayDryRunPlan.ticker),
        lineValue("Interval", firstTinyHistoricalReplayDryRunPlan.interval),
        lineValue(
          "Trading day",
          firstTinyHistoricalReplayDryRunPlan.trading_day,
        ),
        lineValue(
          "Fetch run id",
          firstTinyHistoricalReplayDryRunPlan.fetch_run_id,
        ),
        lineValue(
          "Candle rows available",
          firstTinyHistoricalReplayDryRunPlan.candle_rows_available,
        ),
        lineValue(
          "Candle rows verified",
          firstTinyHistoricalReplayDryRunPlan.candle_rows_verified,
        ),
        lineValue("Replay allowed now", "no"),
        lineValue("Synthetic outcome persistence allowed now", "no"),
        lineValue("Scanner use allowed now", "no"),
        lineValue("Ranking change allowed now", "no"),
        lineValue(
          "Lookahead safety required",
          firstTinyHistoricalReplayDryRunPlan.lookahead_safety_required
            ? "yes"
            : "no",
        ),
        lineValue(
          "Separate operator approval required",
          firstTinyHistoricalReplayDryRunPlan
            .requires_separate_operator_approval
            ? "yes"
            : "no",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalReplayDryRunPlan.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        plan_marker: firstTinyHistoricalReplayDryRunPlan.plan_marker,
        replay_plan_status:
          firstTinyHistoricalReplayDryRunPlan.replay_plan_status,
        dry_run_only: firstTinyHistoricalReplayDryRunPlan.dry_run_only,
        source_verification:
          firstTinyHistoricalReplayDryRunPlan.source_verification,
        source_table: firstTinyHistoricalReplayDryRunPlan.source_table,
        provider: firstTinyHistoricalReplayDryRunPlan.provider,
        ticker: firstTinyHistoricalReplayDryRunPlan.ticker,
        interval: firstTinyHistoricalReplayDryRunPlan.interval,
        trading_day: firstTinyHistoricalReplayDryRunPlan.trading_day,
        fetch_run_id: firstTinyHistoricalReplayDryRunPlan.fetch_run_id,
        candle_rows_available:
          firstTinyHistoricalReplayDryRunPlan.candle_rows_available,
        candle_rows_verified:
          firstTinyHistoricalReplayDryRunPlan.candle_rows_verified,
        replay_allowed_now:
          firstTinyHistoricalReplayDryRunPlan.replay_allowed_now,
        synthetic_outcome_persistence_allowed_now:
          firstTinyHistoricalReplayDryRunPlan
            .synthetic_outcome_persistence_allowed_now,
        scanner_use_allowed_now:
          firstTinyHistoricalReplayDryRunPlan.scanner_use_allowed_now,
        ranking_change_allowed_now:
          firstTinyHistoricalReplayDryRunPlan.ranking_change_allowed_now,
        lookahead_safety_required:
          firstTinyHistoricalReplayDryRunPlan.lookahead_safety_required,
        requires_separate_operator_approval:
          firstTinyHistoricalReplayDryRunPlan
            .requires_separate_operator_approval,
        verified_window_ny:
          firstTinyHistoricalReplayDryRunPlan.candidate_replay_scope
            .verified_window_ny,
        verified_window_utc:
          firstTinyHistoricalReplayDryRunPlan.candidate_replay_scope
            .verified_window_utc,
        sample_origin:
          firstTinyHistoricalReplayDryRunPlan.candidate_replay_scope
            .sample_origin,
        allowed_future_use:
          firstTinyHistoricalReplayDryRunPlan.candidate_replay_scope
            .allowed_future_use,
        future_approval_contract_active_now:
          firstTinyHistoricalReplayDryRunPlan.future_approval_contract
            .active_now,
        provider_call_executed:
          firstTinyHistoricalReplayDryRunPlan.safety.provider_call_executed,
        historical_fetch_added:
          firstTinyHistoricalReplayDryRunPlan.safety.historical_fetch_added,
        candles_persisted:
          firstTinyHistoricalReplayDryRunPlan.safety.candles_persisted,
        raw_response_persisted:
          firstTinyHistoricalReplayDryRunPlan.safety.raw_response_persisted,
        fetch_run_persisted:
          firstTinyHistoricalReplayDryRunPlan.safety.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyHistoricalReplayDryRunPlan.safety
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyHistoricalReplayDryRunPlan.safety.replay_executed,
        scanner_behavior_changed:
          firstTinyHistoricalReplayDryRunPlan.safety
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalReplayDryRunPlan.safety.live_ranking_changed,
        recommended_next_steps:
          firstTinyHistoricalReplayDryRunPlan.recommended_next_steps.join(","),
      },
    }),
    section({
      section_id: "first_tiny_historical_replay_dry_run_approval",
      title: "First Tiny Replay Dry-Run Approval",
      severity:
        firstTinyHistoricalReplayDryRunApproval.approval_status === "invalid"
          ? "critical"
          : "warning",
      lines: [
        lineValue(
          "Approval status",
          firstTinyHistoricalReplayDryRunApproval.approval_status,
        ),
        lineValue(
          "Signal active",
          firstTinyHistoricalReplayDryRunApproval.signal.signal_active
            ? "yes"
            : "no",
        ),
        lineValue(
          "Source verification",
          firstTinyHistoricalReplayDryRunApproval.source_verification,
        ),
        lineValue("Ticker", firstTinyHistoricalReplayDryRunApproval.ticker),
        lineValue("Interval", firstTinyHistoricalReplayDryRunApproval.interval),
        lineValue(
          "Trading day",
          firstTinyHistoricalReplayDryRunApproval.trading_day,
        ),
        lineValue(
          "Fetch run id",
          firstTinyHistoricalReplayDryRunApproval.fetch_run_id,
        ),
        lineValue(
          "Candle rows verified",
          firstTinyHistoricalReplayDryRunApproval.candle_rows_verified,
        ),
        lineValue("Max tickers", firstTinyHistoricalReplayDryRunApproval.max_tickers),
        lineValue("Max days", firstTinyHistoricalReplayDryRunApproval.max_days),
        lineValue(
          "Lookahead safety present",
          firstTinyHistoricalReplayDryRunApproval.lookahead_safety_present
            ? "yes"
            : "no",
        ),
        lineValue("Replay allowed now", "no"),
        lineValue("Synthetic outcome persistence allowed", "no"),
        lineValue("Scanner use allowed", "no"),
        lineValue("Ranking change allowed", "no"),
        lineValue(
          "Ready to accept future signal",
          firstTinyHistoricalReplayDryRunApproval
            .ready_to_accept_future_signal
            ? "yes"
            : "no",
        ),
        lineValue(
          "Ready to propose replay dry-run action",
          firstTinyHistoricalReplayDryRunApproval
            .ready_to_propose_replay_dry_run_action
            ? "yes"
            : "no",
        ),
        lineValue(
          "Blockers",
          compactListText(firstTinyHistoricalReplayDryRunApproval.blockers),
        ),
        lineValue(
          "Warnings",
          compactListText(firstTinyHistoricalReplayDryRunApproval.warnings),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalReplayDryRunApproval.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        approval_marker:
          firstTinyHistoricalReplayDryRunApproval.approval_marker,
        advisory_only: firstTinyHistoricalReplayDryRunApproval.advisory_only,
        approval_gate_only:
          firstTinyHistoricalReplayDryRunApproval.approval_gate_only,
        approval_status:
          firstTinyHistoricalReplayDryRunApproval.approval_status,
        signal_active:
          firstTinyHistoricalReplayDryRunApproval.signal.signal_active,
        signal_source_type:
          firstTinyHistoricalReplayDryRunApproval.signal.source_type,
        signal_source_present:
          firstTinyHistoricalReplayDryRunApproval.signal.source_present,
        operator_label_present:
          firstTinyHistoricalReplayDryRunApproval.signal
            .operator_label_present,
        reference_present:
          firstTinyHistoricalReplayDryRunApproval.signal.reference_present,
        source_verification:
          firstTinyHistoricalReplayDryRunApproval.source_verification,
        ticker: firstTinyHistoricalReplayDryRunApproval.ticker,
        interval: firstTinyHistoricalReplayDryRunApproval.interval,
        trading_day: firstTinyHistoricalReplayDryRunApproval.trading_day,
        fetch_run_id: firstTinyHistoricalReplayDryRunApproval.fetch_run_id,
        candle_rows_verified:
          firstTinyHistoricalReplayDryRunApproval.candle_rows_verified,
        max_tickers: firstTinyHistoricalReplayDryRunApproval.max_tickers,
        max_days: firstTinyHistoricalReplayDryRunApproval.max_days,
        lookahead_safety_present:
          firstTinyHistoricalReplayDryRunApproval.lookahead_safety_present,
        ready_to_accept_future_signal:
          firstTinyHistoricalReplayDryRunApproval
            .ready_to_accept_future_signal,
        ready_to_propose_replay_dry_run_action:
          firstTinyHistoricalReplayDryRunApproval
            .ready_to_propose_replay_dry_run_action,
        replay_allowed_now:
          firstTinyHistoricalReplayDryRunApproval.replay_allowed_now,
        synthetic_outcome_persistence_allowed_now:
          firstTinyHistoricalReplayDryRunApproval
            .synthetic_outcome_persistence_allowed_now,
        scanner_use_allowed_now:
          firstTinyHistoricalReplayDryRunApproval.scanner_use_allowed_now,
        ranking_change_allowed_now:
          firstTinyHistoricalReplayDryRunApproval.ranking_change_allowed_now,
        provider_call_executed:
          firstTinyHistoricalReplayDryRunApproval.safety
            .provider_call_executed,
        historical_fetch_added:
          firstTinyHistoricalReplayDryRunApproval.safety
            .historical_fetch_added,
        candles_persisted:
          firstTinyHistoricalReplayDryRunApproval.safety.candles_persisted,
        raw_response_persisted:
          firstTinyHistoricalReplayDryRunApproval.safety
            .raw_response_persisted,
        fetch_run_persisted:
          firstTinyHistoricalReplayDryRunApproval.safety.fetch_run_persisted,
        synthetic_outcomes_persisted:
          firstTinyHistoricalReplayDryRunApproval.safety
            .synthetic_outcomes_persisted,
        replay_executed:
          firstTinyHistoricalReplayDryRunApproval.safety.replay_executed,
        scanner_behavior_changed:
          firstTinyHistoricalReplayDryRunApproval.safety
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalReplayDryRunApproval.safety.live_ranking_changed,
        blockers: firstTinyHistoricalReplayDryRunApproval.blockers.join(","),
        warnings: firstTinyHistoricalReplayDryRunApproval.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalReplayDryRunApproval.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_replay_dry_run_execute",
      title: "First Tiny Replay Dry-Run Execute",
      severity:
        firstTinyHistoricalReplayDryRunExecute.execution_status === "failed" ||
        firstTinyHistoricalReplayDryRunExecute.execution_status === "blocked"
          ? "critical"
          : "warning",
      lines: [
        lineValue(
          "Status",
          firstTinyHistoricalReplayDryRunExecute.execution_status,
        ),
        lineValue(
          "Source verification",
          firstTinyHistoricalReplayDryRunExecute.source_verification,
        ),
        lineValue(
          "Source table",
          firstTinyHistoricalReplayDryRunExecute.source_table,
        ),
        lineValue("Ticker", firstTinyHistoricalReplayDryRunExecute.ticker),
        lineValue("Interval", firstTinyHistoricalReplayDryRunExecute.interval),
        lineValue(
          "Trading day",
          firstTinyHistoricalReplayDryRunExecute.trading_day,
        ),
        lineValue(
          "Fetch run id",
          firstTinyHistoricalReplayDryRunExecute.fetch_run_id,
        ),
        lineValue(
          "Candles read",
          `${firstTinyHistoricalReplayDryRunExecute.candles_read}/${firstTinyHistoricalReplayDryRunExecute.expected_candle_rows}`,
        ),
        lineValue(
          "Candles verified",
          `${firstTinyHistoricalReplayDryRunExecute.candles_verified}/${firstTinyHistoricalReplayDryRunExecute.expected_candle_rows}`,
        ),
        lineValue(
          "Signal package available",
          firstTinyHistoricalReplayDryRunExecute.signal_package_available
            ? "yes"
            : "no",
        ),
        lineValue(
          "Lookahead safety passed",
          firstTinyHistoricalReplayDryRunExecute.lookahead_safety_passed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Replay executed",
          firstTinyHistoricalReplayDryRunExecute.replay_executed
            ? "yes"
            : "no",
        ),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalReplayDryRunExecute.recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        route_build_marker:
          firstTinyHistoricalReplayDryRunExecute.route_build_marker,
        execution_status:
          firstTinyHistoricalReplayDryRunExecute.execution_status,
        approval_status:
          firstTinyHistoricalReplayDryRunExecute.approval_status,
        source_verification:
          firstTinyHistoricalReplayDryRunExecute.source_verification,
        source_table: firstTinyHistoricalReplayDryRunExecute.source_table,
        provider: firstTinyHistoricalReplayDryRunExecute.provider,
        ticker: firstTinyHistoricalReplayDryRunExecute.ticker,
        interval: firstTinyHistoricalReplayDryRunExecute.interval,
        trading_day: firstTinyHistoricalReplayDryRunExecute.trading_day,
        fetch_run_id: firstTinyHistoricalReplayDryRunExecute.fetch_run_id,
        expected_candle_rows:
          firstTinyHistoricalReplayDryRunExecute.expected_candle_rows,
        candles_read: firstTinyHistoricalReplayDryRunExecute.candles_read,
        candles_verified:
          firstTinyHistoricalReplayDryRunExecute.candles_verified,
        signal_package_available:
          firstTinyHistoricalReplayDryRunExecute.signal_package_available,
        lookahead_safety_passed:
          firstTinyHistoricalReplayDryRunExecute.lookahead_safety_passed,
        replay_executed:
          firstTinyHistoricalReplayDryRunExecute.replay_executed,
        counterfactual_result_available:
          firstTinyHistoricalReplayDryRunExecute
            .counterfactual_result_available,
        synthetic_outcomes_persisted:
          firstTinyHistoricalReplayDryRunExecute
            .synthetic_outcomes_persisted,
        scanner_behavior_changed:
          firstTinyHistoricalReplayDryRunExecute.scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalReplayDryRunExecute.live_ranking_changed,
        provider_call_executed:
          firstTinyHistoricalReplayDryRunExecute.provider_call_executed,
        candles_persisted:
          firstTinyHistoricalReplayDryRunExecute.candles_persisted,
        raw_response_persisted:
          firstTinyHistoricalReplayDryRunExecute.raw_response_persisted,
        fetch_run_persisted:
          firstTinyHistoricalReplayDryRunExecute.fetch_run_persisted,
        recommendation_rows_mutated:
          firstTinyHistoricalReplayDryRunExecute.recommendation_rows_mutated,
        scanner_universe_changed:
          firstTinyHistoricalReplayDryRunExecute.scanner_universe_changed,
        thresholds_changed:
          firstTinyHistoricalReplayDryRunExecute.thresholds_changed,
        outcome_evaluation_persistence_changed:
          firstTinyHistoricalReplayDryRunExecute
            .outcome_evaluation_persistence_changed,
        learning_acceleration_changed:
          firstTinyHistoricalReplayDryRunExecute.learning_acceleration_changed,
        add_trade_affected:
          firstTinyHistoricalReplayDryRunExecute.add_trade_affected,
        broker_execution_affected:
          firstTinyHistoricalReplayDryRunExecute.broker_execution_affected,
        risk_changed: firstTinyHistoricalReplayDryRunExecute.risk_changed,
        replay_allowed_now:
          firstTinyHistoricalReplayDryRunExecute.replay_allowed_now,
        synthetic_outcome_persistence_allowed_now:
          firstTinyHistoricalReplayDryRunExecute
            .synthetic_outcome_persistence_allowed_now,
        scanner_use_allowed_now:
          firstTinyHistoricalReplayDryRunExecute.scanner_use_allowed_now,
        ranking_change_allowed_now:
          firstTinyHistoricalReplayDryRunExecute.ranking_change_allowed_now,
        blockers: firstTinyHistoricalReplayDryRunExecute.blockers.join(","),
        warnings: firstTinyHistoricalReplayDryRunExecute.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalReplayDryRunExecute.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "first_tiny_historical_replay_dry_run_result_verification",
      title: "First Tiny Replay Dry-Run Result Verification",
      severity:
        firstTinyHistoricalReplayDryRunResultVerification
          .replay_dry_run_approval_signal_still_enabled
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Verification status",
          firstTinyHistoricalReplayDryRunResultVerification.verification_status,
        ),
        lineValue(
          "Execution status",
          firstTinyHistoricalReplayDryRunResultVerification.execution_status,
        ),
        lineValue(
          "Source table",
          firstTinyHistoricalReplayDryRunResultVerification.source_table,
        ),
        lineValue("Ticker", firstTinyHistoricalReplayDryRunResultVerification.ticker),
        lineValue(
          "Interval",
          firstTinyHistoricalReplayDryRunResultVerification.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalReplayDryRunResultVerification.trading_day,
        ),
        lineValue(
          "Fetch run id",
          firstTinyHistoricalReplayDryRunResultVerification.fetch_run_id,
        ),
        lineValue(
          "Expected candles",
          firstTinyHistoricalReplayDryRunResultVerification
            .expected_candle_rows,
        ),
        lineValue(
          "Candles read",
          firstTinyHistoricalReplayDryRunResultVerification.candles_read,
        ),
        lineValue(
          "Candles verified",
          firstTinyHistoricalReplayDryRunResultVerification.candles_verified,
        ),
        lineValue(
          "Lookahead safety passed",
          firstTinyHistoricalReplayDryRunResultVerification
            .lookahead_safety_passed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Signal package available",
          firstTinyHistoricalReplayDryRunResultVerification
            .signal_package_available
            ? "yes"
            : "no",
        ),
        lineValue(
          "Counterfactual result available",
          firstTinyHistoricalReplayDryRunResultVerification
            .counterfactual_result_available
            ? "yes"
            : "no",
        ),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue("Provider call executed", "no"),
        lineValue("Recommendation rows mutated", "no"),
        lineValue(
          "Ready for signal package replay planning",
          firstTinyHistoricalReplayDryRunResultVerification
            .ready_for_signal_package_replay_planning
            ? "yes"
            : "no",
        ),
        lineValue("Synthetic outcome persistence allowed now", "no"),
        lineValue("Scanner use allowed now", "no"),
        lineValue("Ranking change allowed now", "no"),
        lineValue(
          "Approval lock warning",
          firstTinyHistoricalReplayDryRunResultVerification
            .replay_dry_run_approval_signal_still_enabled
            ? "disable_replay_dry_run_approval_signal_after_success"
            : "none",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalReplayDryRunResultVerification
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        result_marker:
          firstTinyHistoricalReplayDryRunResultVerification.result_marker,
        route_build_marker:
          firstTinyHistoricalReplayDryRunResultVerification.route_build_marker,
        verification_status:
          firstTinyHistoricalReplayDryRunResultVerification.verification_status,
        execution_status:
          firstTinyHistoricalReplayDryRunResultVerification.execution_status,
        source_verification:
          firstTinyHistoricalReplayDryRunResultVerification.source_verification,
        source_table:
          firstTinyHistoricalReplayDryRunResultVerification.source_table,
        provider: firstTinyHistoricalReplayDryRunResultVerification.provider,
        ticker: firstTinyHistoricalReplayDryRunResultVerification.ticker,
        interval: firstTinyHistoricalReplayDryRunResultVerification.interval,
        trading_day:
          firstTinyHistoricalReplayDryRunResultVerification.trading_day,
        fetch_run_id:
          firstTinyHistoricalReplayDryRunResultVerification.fetch_run_id,
        expected_candle_rows:
          firstTinyHistoricalReplayDryRunResultVerification
            .expected_candle_rows,
        candles_read:
          firstTinyHistoricalReplayDryRunResultVerification.candles_read,
        candles_verified:
          firstTinyHistoricalReplayDryRunResultVerification.candles_verified,
        signal_package_available:
          firstTinyHistoricalReplayDryRunResultVerification
            .signal_package_available,
        lookahead_safety_passed:
          firstTinyHistoricalReplayDryRunResultVerification
            .lookahead_safety_passed,
        replay_executed:
          firstTinyHistoricalReplayDryRunResultVerification.replay_executed,
        counterfactual_result_available:
          firstTinyHistoricalReplayDryRunResultVerification
            .counterfactual_result_available,
        synthetic_outcomes_persisted:
          firstTinyHistoricalReplayDryRunResultVerification
            .synthetic_outcomes_persisted,
        scanner_behavior_changed:
          firstTinyHistoricalReplayDryRunResultVerification
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalReplayDryRunResultVerification
            .live_ranking_changed,
        provider_call_executed:
          firstTinyHistoricalReplayDryRunResultVerification
            .provider_call_executed,
        recommendation_rows_mutated:
          firstTinyHistoricalReplayDryRunResultVerification
            .recommendation_rows_mutated,
        scanner_universe_changed:
          firstTinyHistoricalReplayDryRunResultVerification
            .scanner_universe_changed,
        thresholds_changed:
          firstTinyHistoricalReplayDryRunResultVerification.thresholds_changed,
        outcome_evaluation_persistence_changed:
          firstTinyHistoricalReplayDryRunResultVerification
            .outcome_evaluation_persistence_changed,
        learning_acceleration_changed:
          firstTinyHistoricalReplayDryRunResultVerification
            .learning_acceleration_changed,
        add_trade_affected:
          firstTinyHistoricalReplayDryRunResultVerification.add_trade_affected,
        broker_execution_affected:
          firstTinyHistoricalReplayDryRunResultVerification
            .broker_execution_affected,
        risk_changed:
          firstTinyHistoricalReplayDryRunResultVerification.risk_changed,
        ready_for_signal_package_replay_planning:
          firstTinyHistoricalReplayDryRunResultVerification
            .ready_for_signal_package_replay_planning,
        synthetic_outcome_persistence_allowed_now:
          firstTinyHistoricalReplayDryRunResultVerification
            .synthetic_outcome_persistence_allowed_now,
        scanner_use_allowed_now:
          firstTinyHistoricalReplayDryRunResultVerification
            .scanner_use_allowed_now,
        ranking_change_allowed_now:
          firstTinyHistoricalReplayDryRunResultVerification
            .ranking_change_allowed_now,
        replay_dry_run_approval_signal_present:
          firstTinyHistoricalReplayDryRunResultVerification
            .replay_dry_run_approval_signal_present,
        replay_dry_run_approval_signal_still_enabled:
          firstTinyHistoricalReplayDryRunResultVerification
            .replay_dry_run_approval_signal_still_enabled,
        conclusion:
          firstTinyHistoricalReplayDryRunResultVerification.conclusion,
        warnings:
          firstTinyHistoricalReplayDryRunResultVerification.warnings.join(","),
        recommended_next_steps:
          firstTinyHistoricalReplayDryRunResultVerification.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "first_tiny_historical_replay_signal_package_discovery_plan",
      title: "First Tiny Replay Signal Package Discovery Plan",
      severity: "warning",
      lines: [
        lineValue(
          "Status",
          `${firstTinyHistoricalReplaySignalPackageDiscoveryPlan.discovery_plan_status} / dry-run only`,
        ),
        lineValue(
          "Source verification",
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .source_verification,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.ticker,
        ),
        lineValue(
          "Interval",
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.interval,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.trading_day,
        ),
        lineValue(
          "Candle rows verified",
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.candle_rows_verified,
        ),
        lineValue("Signal package available now", "no"),
        lineValue("Signal package created now", "no"),
        lineValue(
          "Compatible package requirements",
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .compatible_package_requirements.length,
        ),
        lineValue(
          "Candidate discovery sources",
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .candidate_discovery_sources.length,
        ),
        lineValue("Replay executable now", "no"),
        lineValue("Synthetic outcome persistence allowed", "no"),
        lineValue("Scanner use allowed", "no"),
        lineValue("Ranking change allowed", "no"),
        lineValue(
          "Separate approval required",
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .requires_separate_operator_approval
            ? "yes"
            : "no",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalReplaySignalPackageDiscoveryPlan
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        plan_marker:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan.plan_marker,
        discovery_plan_status:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .discovery_plan_status,
        dry_run_only:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan.dry_run_only,
        source_verification:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .source_verification,
        ticker:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.ticker,
        interval:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.interval,
        trading_day:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.trading_day,
        candle_source_table:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.candle_source_table,
        candle_rows_verified:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.candle_rows_verified,
        candle_window_utc:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.candle_window_utc,
        candle_window_ny:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .target_replay_scope.candle_window_ny,
        signal_package_available_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .signal_package_available_now,
        signal_package_created_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .signal_package_created_now,
        replay_executed:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan.replay_executed,
        synthetic_outcomes_persisted:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .synthetic_outcomes_persisted,
        scanner_behavior_changed:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .live_ranking_changed,
        provider_call_executed:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .provider_call_executed,
        supabase_read_executed:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .supabase_read_executed,
        supabase_write_executed:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .supabase_write_executed,
        recommendation_rows_mutated:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .recommendation_rows_mutated,
        scanner_universe_changed:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .scanner_universe_changed,
        ranking_change_allowed_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .ranking_change_allowed_now,
        scanner_use_allowed_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .scanner_use_allowed_now,
        synthetic_outcome_persistence_allowed_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .synthetic_outcome_persistence_allowed_now,
        requires_separate_operator_approval:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .requires_separate_operator_approval,
        compatible_package_requirement_count:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .compatible_package_requirements.length,
        candidate_discovery_source_count:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan
            .candidate_discovery_sources.length,
        blocking_reasons:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan.blocking_reasons.join(
            ",",
          ),
        recommended_next_steps:
          firstTinyHistoricalReplaySignalPackageDiscoveryPlan.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id:
        "first_tiny_historical_replay_signal_package_discovery_readback",
      title: "First Tiny Replay Signal Package Discovery Readback",
      severity:
        firstTinyHistoricalReplaySignalPackageDiscoveryReadback.discovery_status ===
        "compatible_signal_package_found"
          ? "info"
          : "warning",
      lines: [
        lineValue(
          "Status",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .discovery_status,
        ),
        lineValue(
          "Ticker",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback.ticker,
        ),
        lineValue(
          "Trading day",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback.trading_day,
        ),
        lineValue(
          "Readback attempted",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .readback_attempted
            ? "yes"
            : "no",
        ),
        lineValue(
          "Recommendation rows checked",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .recommendation_rows_checked,
        ),
        lineValue(
          "Recommendation snapshots checked",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .recommendation_snapshots_checked,
        ),
        lineValue(
          "Candidates found",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .candidates_found,
        ),
        lineValue(
          "Compatible candidates",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .compatible_candidates,
        ),
        lineValue(
          "Best candidate available",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .best_candidate_available
            ? "yes"
            : "no",
        ),
        lineValue(
          "Signal package available now",
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .signal_package_available_now
            ? "yes"
            : "no",
        ),
        lineValue("Signal package created now", "no"),
        lineValue("Replay executed", "no"),
        lineValue("Synthetic outcomes persisted", "no"),
        lineValue("Scanner behavior changed", "no"),
        lineValue("Live ranking changed", "no"),
        lineValue(
          "Top missing fields/reasons",
          compactListText(
            firstTinyHistoricalReplaySignalPackageDiscoveryReadback
              .top_missing_fields_or_reasons,
          ),
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            firstTinyHistoricalReplaySignalPackageDiscoveryReadback
              .recommended_next_steps,
          ),
        ),
      ],
      metrics: {
        readback_marker:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .readback_marker,
        discovery_status:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .discovery_status,
        source_verification:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .source_verification,
        ticker: firstTinyHistoricalReplaySignalPackageDiscoveryReadback.ticker,
        interval:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback.interval,
        trading_day:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback.trading_day,
        readback_attempted:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .readback_attempted,
        recommendation_rows_checked:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .recommendation_rows_checked,
        recommendation_snapshots_checked:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .recommendation_snapshots_checked,
        candidates_found:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .candidates_found,
        compatible_candidates:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .compatible_candidates,
        best_candidate_available:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .best_candidate_available,
        signal_package_available_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .signal_package_available_now,
        signal_package_created_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .signal_package_created_now,
        replay_executed:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .replay_executed,
        synthetic_outcomes_persisted:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .synthetic_outcomes_persisted,
        scanner_behavior_changed:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .scanner_behavior_changed,
        live_ranking_changed:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .live_ranking_changed,
        provider_call_executed:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .provider_call_executed,
        provider_call_attempted:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .provider_call_attempted,
        recommendation_rows_mutated:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .recommendation_rows_mutated,
        supabase_write_executed:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .supabase_write_executed,
        scanner_universe_changed:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .scanner_universe_changed,
        ranking_change_allowed_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .ranking_change_allowed_now,
        scanner_use_allowed_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .scanner_use_allowed_now,
        synthetic_outcome_persistence_allowed_now:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .synthetic_outcome_persistence_allowed_now,
        candidate_discovery_sources:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .candidate_discovery_sources.join(","),
        top_missing_fields_or_reasons:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback
            .top_missing_fields_or_reasons.join(","),
        blockers:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback.blockers.join(
            ",",
          ),
        warnings:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback.warnings.join(
            ",",
          ),
        recommended_next_steps:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadback.recommended_next_steps.join(
            ",",
          ),
      },
    }),
    section({
      section_id: "minimal_replay_with_signal_package_ping",
      title: "Minimal Replay With Signal Package Ping",
      severity: "info",
      lines: [
        lineValue("Status", "ping-only"),
        lineValue(
          "Route marker",
          minimalReplayWithSignalPackagePing.route_build_marker,
        ),
        lineValue(
          "Execute route present",
          minimalReplayWithSignalPackagePing
            .replay_with_signal_package_execute_route_present
            ? "yes"
            : "no",
        ),
        lineValue(
          "Replay executed",
          minimalReplayWithSignalPackagePing.replay_executed ? "yes" : "no",
        ),
        lineValue(
          "Synthetic outcomes persisted",
          minimalReplayWithSignalPackagePing.synthetic_outcomes_persisted
            ? "yes"
            : "no",
        ),
        lineValue(
          "Scanner behavior changed",
          minimalReplayWithSignalPackagePing.scanner_behavior_changed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Live ranking changed",
          minimalReplayWithSignalPackagePing.live_ranking_changed
            ? "yes"
            : "no",
        ),
        lineValue(
          "Recommended next steps",
          compactListText(
            [...minimalReplayWithSignalPackagePing.recommended_next_steps],
          ),
        ),
      ],
      metrics: {
        route_build_marker:
          minimalReplayWithSignalPackagePing.route_build_marker,
        purpose: minimalReplayWithSignalPackagePing.purpose,
        replay_with_signal_package_execute_route_present:
          minimalReplayWithSignalPackagePing
            .replay_with_signal_package_execute_route_present,
        provider_call_executed:
          minimalReplayWithSignalPackagePing.provider_call_executed,
        provider_call_attempted:
          minimalReplayWithSignalPackagePing.provider_call_attempted,
        candles_persisted: minimalReplayWithSignalPackagePing.candles_persisted,
        raw_response_persisted:
          minimalReplayWithSignalPackagePing.raw_response_persisted,
        fetch_run_persisted:
          minimalReplayWithSignalPackagePing.fetch_run_persisted,
        synthetic_outcomes_persisted:
          minimalReplayWithSignalPackagePing.synthetic_outcomes_persisted,
        replay_executed: minimalReplayWithSignalPackagePing.replay_executed,
        scanner_behavior_changed:
          minimalReplayWithSignalPackagePing.scanner_behavior_changed,
        live_ranking_changed:
          minimalReplayWithSignalPackagePing.live_ranking_changed,
        recommendation_rows_mutated:
          minimalReplayWithSignalPackagePing.recommendation_rows_mutated,
        supabase_write_executed:
          minimalReplayWithSignalPackagePing.supabase_write_executed,
        recommended_next_steps:
          minimalReplayWithSignalPackagePing.recommended_next_steps.join(","),
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
          "Input source",
          words(learningAccelerationInputSource),
        ),
        lineValue(
          "Trace source",
          words(learningAccelerationTraceSource),
        ),
        lineValue(
          "Trace run / batch",
          `${compact(learningAccelerationTraceScanRun, "none")} / ${compact(learningAccelerationTraceBatch, "none")}`,
        ),
        lineValue(
          "Selected drop-off run / batch",
          `${compact(selectedDropOffScanRun, "none")} / ${compact(selectedDropOffBatch, "none")}`,
        ),
        lineValue(
          "Trace matches selected drop-off",
          bool(learningAccelerationTraceMatchesSelectedDropOff),
        ),
        lineValue(
          "Callsite trace missing for official scan",
          bool(callsiteTraceMissingForOfficialScanRun),
        ),
        lineValue(
          "Callsite / invoked",
          `${words(learningAccelerationCallsiteTrace?.callsite_name ?? "none")} / ${bool(learningAccelerationCallsiteTrace?.persist_function_invoked === true)}`,
        ),
        lineValue(
          "Callsite candidates/ranked/diagnostics",
          `${learningAccelerationCallsiteTrace?.candidate_universe_count ?? 0}/${learningAccelerationCallsiteTrace?.ranked_candidate_count ?? 0}/${learningAccelerationCallsiteTrace?.selected_build_diagnostics_count ?? 0}`,
        ),
        lineValue(
          "Callsite below threshold/examples",
          `${learningAccelerationCallsiteTrace?.selected_to_built_drop_off_below_threshold_count ?? 0}/${learningAccelerationCallsiteTrace?.rejection_examples_count ?? 0}`,
        ),
        lineValue(
          "Callsite mismatch",
          bool(learningAccelerationCallsiteMismatch),
        ),
        lineValue(
          "Timeline expected / persistence actual",
          `${learningAccelerationExpectedBelowThreshold}/${learningAccelerationActualBelowThresholdReceived}`,
        ),
        lineValue(
          "Persistence candidate universe",
          String(learningAccelerationCandidateUniverseReceived),
        ),
        lineValue(
          "Runtime input / examples",
          `${learningAccelerationRuntimeInputCount}/${learningAccelerationExamplesCount}`,
        ),
        lineValue(
          "Candidate match / missing",
          `${learningAccelerationMatchedCandidates}/${learningAccelerationSkippedMissingCandidate}`,
        ),
        lineValue(
          "Candidate universe",
          `${learningAccelerationCandidateUniverseCount} / missing ${bool(learningAccelerationCandidateUniverseMissing)}`,
        ),
        lineValue(
          "Ticker matching failed",
          bool(learningAccelerationTickerMatchingFailed),
        ),
        lineValue(
          "Persist attempted / persisted",
          `${learningAccelerationPersistAttempted}/${learningAccelerationResearchOnlyPersisted}`,
        ),
        lineValue(
          "Research hard invalid",
          String(learningAccelerationResearchHardInvalid),
        ),
        lineValue(
          "Research soft gaps persisted",
          String(learningAccelerationResearchSoftGapsPersisted),
        ),
        lineValue(
          "Research stale blocked",
          String(learningAccelerationResearchStaleBlocked),
        ),
        lineValue(
          "Top skip reasons",
          formatReasonCounts(learningAccelerationResearchSkipReasonCounts),
        ),
        lineValue(
          "Top skip examples",
          formatResearchExamples(learningAccelerationResearchTopSkipExamples),
        ),
        lineValue(
          "Soft gap reasons",
          formatReasonCounts(learningAccelerationResearchSoftGapReasonCounts),
        ),
        lineValue(
          "Soft gap examples",
          formatResearchExamples(learningAccelerationResearchTopSoftGapExamples),
        ),
        lineValue(
          "Research duplicates",
          String(learningAccelerationDuplicates),
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
          `${input.outcome_evaluation?.provider_budget_limit ?? providerPlanProfile.outcomeBudgetLimit ?? "unknown"} / ${learningAccelerationSkippedBudget}`,
        ),
        lineValue(
          "Skipped invalid/stale",
          `${learningAccelerationSkippedInvalid}/${learningAccelerationSkippedStale}`,
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
        learning_acceleration_input_source: learningAccelerationInputSource,
        learning_acceleration_trace_source: learningAccelerationTraceSource,
        learning_acceleration_trace_scan_run: learningAccelerationTraceScanRun,
        learning_acceleration_trace_batch: learningAccelerationTraceBatch,
        selected_dropoff_scan_run: selectedDropOffScanRun,
        selected_dropoff_batch: selectedDropOffBatch,
        learning_acceleration_trace_matches_selected_dropoff:
          learningAccelerationTraceMatchesSelectedDropOff,
        callsite_trace_missing_for_official_scan_run:
          callsiteTraceMissingForOfficialScanRun,
        expected_scan_run_id: selectedDropOffScanRun,
        expected_batch_fingerprint: selectedDropOffBatch,
        learning_acceleration_callsite_name:
          learningAccelerationCallsiteTrace?.callsite_name ?? null,
        learning_acceleration_callsite_persist_function_invoked:
          learningAccelerationCallsiteTrace?.persist_function_invoked === true,
        learning_acceleration_callsite_candidate_universe_count:
          learningAccelerationCallsiteTrace?.candidate_universe_count ?? 0,
        learning_acceleration_callsite_ranked_candidate_count:
          learningAccelerationCallsiteTrace?.ranked_candidate_count ?? 0,
        learning_acceleration_callsite_selected_build_diagnostics_count:
          learningAccelerationCallsiteTrace?.selected_build_diagnostics_count ?? 0,
        learning_acceleration_callsite_below_threshold_count:
          learningAccelerationCallsiteTrace
            ?.selected_to_built_drop_off_below_threshold_count ?? 0,
        learning_acceleration_callsite_rejection_examples_count:
          learningAccelerationCallsiteTrace?.rejection_examples_count ?? 0,
        learning_acceleration_callsite_batch_fingerprint_present:
          learningAccelerationCallsiteTrace?.batch_fingerprint_present === true,
        learning_acceleration_callsite_scan_run_id_present:
          learningAccelerationCallsiteTrace?.scan_run_id_present === true,
        learning_acceleration_callsite_mismatch:
          learningAccelerationCallsiteMismatch,
        expected_below_threshold_from_timeline:
          learningAccelerationExpectedBelowThreshold,
        actual_below_threshold_received_by_persistence:
          learningAccelerationActualBelowThresholdReceived,
        candidate_universe_received_by_persistence:
          learningAccelerationCandidateUniverseReceived,
        below_threshold_readback_count:
          learningAccelerationBelowThresholdReadback,
        below_threshold_runtime_input_count:
          learningAccelerationRuntimeInputCount,
        below_threshold_examples_count:
          learningAccelerationExamplesCount,
        research_candidates_after_ticker_match:
          learningAccelerationMatchedCandidates,
        research_persist_attempted:
          learningAccelerationPersistAttempted,
        research_persisted: learningAccelerationResearchOnlyPersisted,
        research_duplicates: learningAccelerationDuplicates,
        research_hard_invalid: learningAccelerationResearchHardInvalid,
        research_soft_gaps_persisted:
          learningAccelerationResearchSoftGapsPersisted,
        research_stale_blocked: learningAccelerationResearchStaleBlocked,
        research_skip_reason_counts:
          formatReasonCounts(learningAccelerationResearchSkipReasonCounts),
        research_soft_gap_reason_counts:
          formatReasonCounts(learningAccelerationResearchSoftGapReasonCounts),
        research_top_skip_examples:
          formatResearchExamples(learningAccelerationResearchTopSkipExamples),
        research_top_soft_gap_examples:
          formatResearchExamples(
            learningAccelerationResearchTopSoftGapExamples,
          ),
        research_skipped_missing_candidate_match:
          learningAccelerationSkippedMissingCandidate,
        learning_acceleration_candidate_universe_count:
          learningAccelerationCandidateUniverseCount,
        learning_acceleration_candidate_universe_missing:
          learningAccelerationCandidateUniverseMissing,
        learning_acceleration_ticker_matching_failed:
          learningAccelerationTickerMatchingFailed,
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
          learningAccelerationSkippedBudget,
        learning_acceleration_skipped_due_to_invalid_risk:
          learningAccelerationSkippedInvalid,
        learning_acceleration_skipped_due_to_stale_reference:
          learningAccelerationSkippedStale,
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
                "Pre/final evaluation eligible",
                `${input.outcome_evaluation?.pre_filter_eligible_snapshot_count ?? input.outcome_evaluation?.eligible_visible_snapshot_count ?? 0}/${input.outcome_evaluation?.final_evaluation_eligible_snapshot_count ?? 0}`,
              ),
              lineValue(
                "Post-eligibility blockers",
                Object.keys(
                  input.outcome_evaluation?.post_eligibility_block_reasons ??
                    {},
                ).length > 0
                  ? JSON.stringify(
                      input.outcome_evaluation
                        ?.post_eligibility_block_reasons,
                    )
                  : "none",
              ),
              lineValue(
                "Candle planning blockers",
                Object.keys(
                  input.outcome_evaluation
                    ?.candle_request_planning_block_reasons ?? {},
                ).length > 0
                  ? JSON.stringify(
                      input.outcome_evaluation
                        ?.candle_request_planning_block_reasons,
                    )
                  : "none",
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
        pre_filter_eligible_snapshot_count:
          input.outcome_evaluation?.pre_filter_eligible_snapshot_count ?? null,
        final_evaluation_eligible_snapshot_count:
          input.outcome_evaluation
            ?.final_evaluation_eligible_snapshot_count ?? null,
        post_eligibility_block_reasons: JSON.stringify(
          input.outcome_evaluation?.post_eligibility_block_reasons ?? {},
        ),
        candle_request_planning_block_reasons: JSON.stringify(
          input.outcome_evaluation?.candle_request_planning_block_reasons ??
            {},
        ),
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
      section_id: "daily_learning_review",
      title: "Daily Learning Review",
      severity:
        input.daily_learning_review?.engine_adjustment_candidates.some(
          (item) =>
            item.candidate !== "insufficient_sample_size" &&
            item.confidence !== "low",
        ) === true
          ? "warning"
          : "info",
      lines: [
        lineValue(
          "Latest evaluated batch",
          compact(
            input.daily_learning_review?.latest_evaluated_batch_fingerprint,
            "none",
          ),
        ),
        lineValue(
          "Outcomes evaluated today",
          input.daily_learning_review?.evaluated_outcome_count ?? 0,
        ),
        lineValue(
          "Visible/research-only/unknown",
          `${input.daily_learning_review?.visible_evaluated_count ?? 0} / ${input.daily_learning_review?.research_only_evaluated_count ?? 0} / ${input.daily_learning_review?.unknown_visibility_evaluated_count ?? 0}`,
        ),
        lineValue(
          "Visibility detection sources",
          setupMixText(
            input.daily_learning_review?.visibility_diagnostics.source_counts,
          ),
        ),
        lineValue(
          "Intelligence metadata readback",
          `inspected ${input.daily_learning_review?.metadata_readback_diagnostics.outcomes_inspected ?? 0} / matched snapshots ${input.daily_learning_review?.metadata_readback_diagnostics.matched_snapshots ?? 0} / matched recommendation rows ${input.daily_learning_review?.metadata_readback_diagnostics.matched_recommendation_rows ?? 0}`,
        ),
        lineValue(
          "Intelligence metadata enrichment",
          `snapshots ${input.daily_learning_review?.metadata_readback_diagnostics.snapshot_enrichment_success_count ?? 0}/${input.daily_learning_review?.metadata_readback_diagnostics.outcomes_inspected ?? 0} / recommendations ${input.daily_learning_review?.metadata_readback_diagnostics.recommendation_enrichment_success_count ?? 0}/${input.daily_learning_review?.metadata_readback_diagnostics.outcomes_inspected ?? 0} / research snapshots ${input.daily_learning_review?.metadata_readback_diagnostics.research_snapshot_enrichment_success_count ?? 0}`,
        ),
        lineValue(
          "Visibility after enrichment",
          `${input.daily_learning_review?.metadata_readback_diagnostics.visibility_after_enrichment.visible ?? 0} / ${input.daily_learning_review?.metadata_readback_diagnostics.visibility_after_enrichment.research_only ?? 0} / ${input.daily_learning_review?.metadata_readback_diagnostics.visibility_after_enrichment.unknown ?? 0}`,
        ),
        lineValue(
          "Confidence after enrichment",
          `numeric ${input.daily_learning_review?.metadata_readback_diagnostics.confidence_after_enrichment.numeric ?? 0} / tier ${input.daily_learning_review?.metadata_readback_diagnostics.confidence_after_enrichment.tier_fallback ?? 0} / unknown ${input.daily_learning_review?.metadata_readback_diagnostics.confidence_after_enrichment.unknown ?? 0}`,
        ),
        lineValue(
          "Snapshot join sources",
          setupMixText(
            input.daily_learning_review?.snapshot_join_diagnostics
              .join_source_counts,
          ),
        ),
        lineValue(
          "Confidence readback sources",
          setupMixText(
            input.daily_learning_review?.metadata_readback_diagnostics
              .confidence_source_mix,
          ),
        ),
        lineValue(
          "Visible confidence sources",
          setupMixText(
            input.daily_learning_review?.metadata_readback_diagnostics
              .visible_confidence_source_mix,
          ),
        ),
        lineValue(
          "Research-only confidence sources",
          setupMixText(
            input.daily_learning_review?.metadata_readback_diagnostics
              .research_only_confidence_source_mix,
          ),
        ),
        lineValue(
          "Latest batch visible/research-only/unknown",
          `${input.daily_learning_review?.latest_batch_visible_evaluated_count ?? 0} / ${input.daily_learning_review?.latest_batch_research_only_evaluated_count ?? 0} / ${input.daily_learning_review?.latest_batch_unknown_visibility_evaluated_count ?? 0}`,
        ),
        lineValue(
          "Unique snapshots visible/research-only/unknown",
          `${input.daily_learning_review?.visible_unique_snapshot_count ?? 0} / ${input.daily_learning_review?.research_only_unique_snapshot_count ?? 0} / ${input.daily_learning_review?.unknown_visibility_unique_snapshot_count ?? 0}`,
        ),
        lineValue(
          "Entry triggered",
          `${input.daily_learning_review?.metrics.entry_triggered_count ?? 0} / ${pctValue(input.daily_learning_review?.metrics.entry_triggered_rate)}`,
        ),
        lineValue(
          "Entry not triggered",
          `${input.daily_learning_review?.metrics.entry_not_triggered_count ?? 0} / ${pctValue(input.daily_learning_review?.metrics.entry_not_triggered_rate)}`,
        ),
        lineValue(
          "Target/stop/neither",
          `${input.daily_learning_review?.metrics.target_hit_count ?? 0}/${input.daily_learning_review?.metrics.stop_hit_count ?? 0}/${input.daily_learning_review?.metrics.neither_hit_count ?? 0}`,
        ),
        lineValue(
          "Target/stop/neither rate",
          `${pctValue(input.daily_learning_review?.metrics.target_hit_rate)} / ${pctValue(input.daily_learning_review?.metrics.stop_hit_rate)} / ${pctValue(input.daily_learning_review?.metrics.neither_hit_rate)}`,
        ),
        lineValue(
          "Avg best/worst/terminal R",
          `${rValue(input.daily_learning_review?.metrics.average_best_r)} / ${rValue(input.daily_learning_review?.metrics.average_worst_r)} / ${rValue(input.daily_learning_review?.metrics.average_terminal_r)}`,
        ),
        lineValue(
          "Visible vs research-only",
          compact(
            input.daily_learning_review?.visible_vs_research_only_comparison
              .summary,
            "none",
          ),
        ),
        lineValue(
          "Ticker universe readiness",
          `observed ${input.daily_learning_review?.ticker_universe_readiness.universe_status.observed_today_count ?? 0} / core candidates ${input.daily_learning_review?.ticker_universe_readiness.ticker_classification.core_candidates.length ?? 0} / research-heavy ${input.daily_learning_review?.ticker_universe_readiness.ticker_classification.research_heavy_candidates.length ?? 0} / safe to change no`,
        ),
        lineValue(
          "Setup families",
          setupFamilyBreakdownText(
            input.daily_learning_review?.setup_family_breakdowns,
          ),
        ),
        lineValue(
          "Ticker groups",
          dimensionBreakdownText(input.daily_learning_review?.ticker_breakdowns),
        ),
        lineValue(
          "Window groups",
          dimensionBreakdownText(input.daily_learning_review?.window_breakdowns),
        ),
        lineValue(
          "Tier groups",
          dimensionBreakdownText(input.daily_learning_review?.tier_breakdowns),
        ),
        lineValue(
          "Sector groups",
          sectorGroupBreakdownText(
            input.daily_learning_review?.sector_group_breakdowns,
          ),
        ),
        lineValue(
          "Top sectors by avg best R",
          sectorRankText(
            input.daily_learning_review?.top_sectors_by_avg_best_r,
            "best",
          ),
        ),
        lineValue(
          "Weak sectors by avg worst R",
          sectorRankText(
            input.daily_learning_review?.weakest_sectors_by_avg_worst_r,
            "worst",
          ),
        ),
        lineValue(
          "Sector sample confidence",
          sectorGroupBreakdownText(
            input.daily_learning_review?.sector_group_breakdowns,
          ),
        ),
        lineValue(
          "Ticker profiles built",
          input.daily_learning_review?.ticker_profile_summary
            .profiles_built_count ?? 0,
        ),
        lineValue(
          "Ticker profile status new/observed/trusted/deprioritized",
          `${input.daily_learning_review?.ticker_profile_summary.new_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.observed_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.trusted_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.deprioritized_count ?? 0}`,
        ),
        lineValue(
          "Top ticker profiles by avg best R",
          tickerProfileRankText(
            input.daily_learning_review?.ticker_profile_summary
              .top_profiles_by_avg_best_r,
            "best",
          ),
        ),
        lineValue(
          "Weak ticker profiles by avg worst R",
          tickerProfileRankText(
            input.daily_learning_review?.ticker_profile_summary
              .weak_profiles_by_avg_worst_r,
            "worst",
          ),
        ),
        lineValue(
          "Tickers needing more data",
          tickerListText(
            input.daily_learning_review?.ticker_profile_summary
              .tickers_needing_more_data,
          ),
        ),
        lineValue(
          "Tickers high entry-not-triggering",
          tickerListText(
            input.daily_learning_review?.ticker_profile_summary
              .tickers_high_entry_not_triggering,
          ),
        ),
        lineValue(
          "Tickers weak follow-through",
          tickerListText(
            input.daily_learning_review?.ticker_profile_summary
              .tickers_weak_follow_through,
          ),
        ),
        lineValue(
          "Latest market regime",
          `${input.daily_learning_review?.market_regime.latest_evaluated_batch_regime_label ?? "unknown"} / ${input.daily_learning_review?.market_regime.latest_evaluated_batch_regime_confidence ?? "low"}`,
        ),
        lineValue(
          "Regime x setup family",
          setupMixText(
            input.daily_learning_review?.market_regime
              .setup_family_mix_by_regime[
              input.daily_learning_review?.market_regime
                .latest_evaluated_batch_regime_label ?? "unknown"
            ],
          ),
        ),
        lineValue(
          "Regime x sector",
          setupMixText(
            input.daily_learning_review?.market_regime.sector_mix_by_regime[
              input.daily_learning_review?.market_regime
                .latest_evaluated_batch_regime_label ?? "unknown"
            ],
          ),
        ),
        lineValue(
          "Regime x ticker status",
          setupMixText(
            input.daily_learning_review?.market_regime
              .ticker_profile_status_mix_by_regime[
              input.daily_learning_review?.market_regime
                .latest_evaluated_batch_regime_label ?? "unknown"
            ],
          ),
        ),
        lineValue(
          "Trade quality mix",
          qualityMixText(
            input.daily_learning_review?.trade_quality_summary
              .overall_quality_mix,
          ),
        ),
        lineValue(
          "Trade quality weakest components",
          setupGapText(
            input.daily_learning_review?.trade_quality_summary
              .most_common_weak_components,
          ),
        ),
        lineValue(
          "Trade quality strongest components",
          setupGapText(
            input.daily_learning_review?.trade_quality_summary
              .most_common_strong_components,
          ),
        ),
        lineValue(
          "Trade quality by setup",
          qualityGroupText(
            input.daily_learning_review?.trade_quality_summary
              .quality_by_setup_family,
          ),
        ),
        lineValue(
          "Confidence buckets",
          confidenceBucketMixText(
            input.daily_learning_review?.confidence_calibration.buckets,
          ),
        ),
        lineValue(
          "Confidence monotonicity",
          confidenceMonotonicityText(
            input.daily_learning_review?.confidence_calibration
              .monotonicity_check.higher_confidence_outperforms_lower,
          ),
        ),
        lineValue(
          "Model governance",
          input.daily_learning_review?.model_governance.advisory_only === true
            ? "advisory-only"
            : "unknown",
        ),
        lineValue(
          "Active intelligence versions",
          governanceLayerText(
            input.daily_learning_review?.model_governance
              .current_intelligence_layers,
          ),
        ),
        lineValue(
          "Promotion-ready changes",
          governanceLayerText(
            input.daily_learning_review?.model_governance
              .promotion_ready_changes,
          ),
        ),
        lineValue(
          "Changes needing more data",
          governanceLayerText(
            input.daily_learning_review?.model_governance
              .changes_needing_more_data,
          ),
        ),
        lineValue(
          "Automatic updates enabled",
          input.daily_learning_review?.model_governance.safety
            .automatic_model_updates_enabled
            ? "yes"
            : "no",
        ),
        lineValue(
          "Intelligence overview",
          `active advisory layers ${input.daily_learning_review?.intelligence_overview.active_layers.length ?? 0} / sample confidence ${input.daily_learning_review?.intelligence_overview.data_readiness.sample_confidence ?? "low"} / recommended focus ${intelligenceFocusText(input.daily_learning_review?.intelligence_overview.recommended_learning_focus)}`,
        ),
        lineValue(
          "Top tickers",
          reviewTickerText(
            input.daily_learning_review?.top_positive_tickers_by_avg_best_r,
            "best",
          ),
        ),
        lineValue(
          "Weak tickers",
          reviewTickerText(
            input.daily_learning_review?.weakest_tickers_by_avg_worst_r,
            "worst",
          ),
        ),
        lineValue(
          "Engine adjustment candidates",
          adjustmentText(
            input.daily_learning_review?.engine_adjustment_candidates,
          ),
        ),
        lineValue(
          "Sample confidence",
          compact(input.daily_learning_review?.sample_size_label, "low"),
        ),
      ],
      metrics: {
        trading_day: input.daily_learning_review?.trading_day ?? null,
        latest_evaluated_batch_fingerprint:
          input.daily_learning_review?.latest_evaluated_batch_fingerprint ??
          null,
        latest_evaluated_batch_outcome_count:
          input.daily_learning_review?.latest_evaluated_batch_outcome_count ??
          null,
        scan_windows: (
          input.daily_learning_review?.scan_windows ?? []
        ).join(","),
        evaluated_outcome_count:
          input.daily_learning_review?.evaluated_outcome_count ?? null,
        visible_evaluated_count:
          input.daily_learning_review?.visible_evaluated_count ?? null,
        research_only_evaluated_count:
          input.daily_learning_review?.research_only_evaluated_count ?? null,
        unknown_visibility_evaluated_count:
          input.daily_learning_review?.unknown_visibility_evaluated_count ??
          null,
        latest_batch_visible_evaluated_count:
          input.daily_learning_review
            ?.latest_batch_visible_evaluated_count ?? null,
        latest_batch_research_only_evaluated_count:
          input.daily_learning_review
            ?.latest_batch_research_only_evaluated_count ?? null,
        latest_batch_unknown_visibility_evaluated_count:
          input.daily_learning_review
            ?.latest_batch_unknown_visibility_evaluated_count ?? null,
        visible_unique_snapshot_count:
          input.daily_learning_review?.visible_unique_snapshot_count ?? null,
        research_only_unique_snapshot_count:
          input.daily_learning_review?.research_only_unique_snapshot_count ??
          null,
        unknown_visibility_unique_snapshot_count:
          input.daily_learning_review
            ?.unknown_visibility_unique_snapshot_count ?? null,
        metadata_readback_outcomes_inspected:
          input.daily_learning_review?.metadata_readback_diagnostics
            .outcomes_inspected ?? null,
        metadata_readback_matched_snapshots:
          input.daily_learning_review?.metadata_readback_diagnostics
            .matched_snapshots ?? null,
        metadata_readback_matched_recommendation_rows:
          input.daily_learning_review?.metadata_readback_diagnostics
            .matched_recommendation_rows ?? null,
        metadata_enrichment_snapshot_success_count:
          input.daily_learning_review?.metadata_readback_diagnostics
            .snapshot_enrichment_success_count ?? null,
        metadata_enrichment_recommendation_success_count:
          input.daily_learning_review?.metadata_readback_diagnostics
            .recommendation_enrichment_success_count ?? null,
        metadata_enrichment_research_snapshot_success_count:
          input.daily_learning_review?.metadata_readback_diagnostics
            .research_snapshot_enrichment_success_count ?? null,
        metadata_enrichment_missing_snapshot_count:
          input.daily_learning_review?.metadata_readback_diagnostics
            .missing_snapshot_enrichment_count ?? null,
        metadata_enrichment_missing_recommendation_count:
          input.daily_learning_review?.metadata_readback_diagnostics
            .missing_recommendation_enrichment_count ?? null,
        metadata_enrichment_visibility_after: JSON.stringify(
          input.daily_learning_review?.metadata_readback_diagnostics
            .visibility_after_enrichment ?? null,
        ),
        metadata_enrichment_confidence_after: JSON.stringify(
          input.daily_learning_review?.metadata_readback_diagnostics
            .confidence_after_enrichment ?? null,
        ),
        metadata_enrichment_visible_confidence_source_mix: JSON.stringify(
          input.daily_learning_review?.metadata_readback_diagnostics
            .visible_confidence_source_mix ?? null,
        ),
        metadata_enrichment_research_only_confidence_source_mix: JSON.stringify(
          input.daily_learning_review?.metadata_readback_diagnostics
            .research_only_confidence_source_mix ?? null,
        ),
        snapshot_join_source_counts: JSON.stringify(
          input.daily_learning_review?.snapshot_join_diagnostics
            .join_source_counts ?? null,
        ),
        snapshot_join_missing_examples: JSON.stringify(
          input.daily_learning_review?.snapshot_join_diagnostics
            .missing_join_examples ?? null,
        ),
        intelligence_metadata_readback_examples: JSON.stringify(
          input.daily_learning_review?.metadata_readback_diagnostics
            .inspection_examples ?? null,
        ),
        entry_triggered_count:
          input.daily_learning_review?.metrics.entry_triggered_count ?? null,
        entry_triggered_rate:
          input.daily_learning_review?.metrics.entry_triggered_rate ?? null,
        target_hit_count:
          input.daily_learning_review?.metrics.target_hit_count ?? null,
        target_hit_rate:
          input.daily_learning_review?.metrics.target_hit_rate ?? null,
        stop_hit_count:
          input.daily_learning_review?.metrics.stop_hit_count ?? null,
        stop_hit_rate:
          input.daily_learning_review?.metrics.stop_hit_rate ?? null,
        neither_hit_count:
          input.daily_learning_review?.metrics.neither_hit_count ?? null,
        neither_hit_rate:
          input.daily_learning_review?.metrics.neither_hit_rate ?? null,
        entry_not_triggered_count:
          input.daily_learning_review?.metrics.entry_not_triggered_count ??
          null,
        entry_not_triggered_rate:
          input.daily_learning_review?.metrics.entry_not_triggered_rate ??
          null,
        average_best_r:
          input.daily_learning_review?.metrics.average_best_r ?? null,
        average_worst_r:
          input.daily_learning_review?.metrics.average_worst_r ?? null,
        average_terminal_r:
          input.daily_learning_review?.metrics.average_terminal_r ?? null,
        visible_average_best_r:
          input.daily_learning_review?.visible_metrics.average_best_r ?? null,
        research_only_average_best_r:
          input.daily_learning_review?.research_only_metrics.average_best_r ??
          null,
        visible_vs_research_only_comparison: JSON.stringify(
          input.daily_learning_review
            ?.visible_vs_research_only_comparison ?? null,
        ),
        top_positive_tickers_by_avg_best_r: JSON.stringify(
          input.daily_learning_review?.top_positive_tickers_by_avg_best_r ??
            [],
        ),
        weakest_tickers_by_avg_worst_r: JSON.stringify(
          input.daily_learning_review?.weakest_tickers_by_avg_worst_r ?? [],
        ),
        setup_family_breakdowns: JSON.stringify(
          input.daily_learning_review?.setup_family_breakdowns ?? [],
        ),
        ticker_breakdowns: JSON.stringify(
          input.daily_learning_review?.ticker_breakdowns ?? [],
        ),
        window_breakdowns: JSON.stringify(
          input.daily_learning_review?.window_breakdowns ?? [],
        ),
        tier_breakdowns: JSON.stringify(
          input.daily_learning_review?.tier_breakdowns ?? [],
        ),
        sector_group_breakdowns: JSON.stringify(
          input.daily_learning_review?.sector_group_breakdowns ?? [],
        ),
        industry_breakdowns: JSON.stringify(
          input.daily_learning_review?.industry_breakdowns ?? [],
        ),
        top_sectors_by_avg_best_r: JSON.stringify(
          input.daily_learning_review?.top_sectors_by_avg_best_r ?? [],
        ),
        weakest_sectors_by_avg_worst_r: JSON.stringify(
          input.daily_learning_review?.weakest_sectors_by_avg_worst_r ?? [],
        ),
        sector_industry_mapping: JSON.stringify(
          input.daily_learning_review?.sector_industry_mapping ?? null,
        ),
        ticker_profiles: JSON.stringify(
          input.daily_learning_review?.ticker_profiles ?? [],
        ),
        ticker_profile_summary: JSON.stringify(
          input.daily_learning_review?.ticker_profile_summary ?? null,
        ),
        market_regime: JSON.stringify(
          input.daily_learning_review?.market_regime ?? null,
        ),
        trade_quality_decompositions: JSON.stringify(
          input.daily_learning_review?.trade_quality_decompositions ?? [],
        ),
        trade_quality_summary: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary ?? null,
        ),
        confidence_calibration: JSON.stringify(
          input.daily_learning_review?.confidence_calibration ?? null,
        ),
        model_governance: JSON.stringify(
          input.daily_learning_review?.model_governance ?? null,
        ),
        dynamic_movers_readiness: JSON.stringify(dynamicMoversReadiness),
        dynamic_movers_shadow_contract: JSON.stringify(
          dynamicMoversShadowAudit,
        ),
        historical_learning_backfill_readiness: JSON.stringify(
          historicalBackfillReadiness,
        ),
        historical_candle_cache: JSON.stringify(
          historicalCandleCacheReadiness,
        ),
        historical_candle_storage_readiness: JSON.stringify(
          historicalCandleStorageReadiness,
        ),
        historical_backfill_fetch_planner: JSON.stringify(
          historicalBackfillFetchPlan,
        ),
        twelve_data_historical_fetch_contract: JSON.stringify(
          twelveDataHistoricalFetchContract,
        ),
        twelve_data_historical_response_parser: JSON.stringify(
          twelveDataHistoricalResponseParser,
        ),
        historical_candle_persistence_plan: JSON.stringify(
          historicalCandlePersistencePlan,
        ),
        historical_backfill_dry_run_pipeline: JSON.stringify(
          historicalBackfillDryRunPipeline,
        ),
        historical_backfill_execution_readiness: JSON.stringify(
          historicalBackfillExecutionReadiness,
        ),
        first_tiny_historical_fetch_approval: JSON.stringify(
          firstTinyHistoricalFetchApproval,
        ),
        first_tiny_historical_fetch_request_preview: JSON.stringify(
          firstTinyHistoricalFetchRequestPreview,
        ),
        first_tiny_historical_fetch_operator_approval: JSON.stringify(
          firstTinyHistoricalFetchOperatorApproval,
        ),
        first_tiny_historical_fetch_execution_plan: JSON.stringify(
          firstTinyHistoricalFetchExecutionPlan,
        ),
        first_tiny_historical_fetch_approval_signal_readiness: JSON.stringify(
          firstTinyHistoricalFetchApprovalSignalReadiness,
        ),
        first_tiny_historical_fetch_final_preflight: JSON.stringify(
          firstTinyHistoricalFetchFinalPreflight,
        ),
        first_tiny_historical_fetch_provider_dry_execute: JSON.stringify(
          firstTinyHistoricalFetchProviderDryExecute,
        ),
        first_tiny_historical_fetch_no_persist_result_verification:
          JSON.stringify(firstTinyHistoricalFetchNoPersistVerification),
        first_tiny_fetch_run_audit_write_plan: JSON.stringify(
          firstTinyHistoricalFetchRunAuditWritePlan,
        ),
        first_tiny_fetch_run_audit_write_approval: JSON.stringify(
          firstTinyFetchRunAuditWriteApproval,
        ),
        first_tiny_fetch_run_audit_write_execute: JSON.stringify(
          firstTinyFetchRunAuditWriteExecute,
        ),
        first_tiny_fetch_run_audit_write_result_verification:
          JSON.stringify(firstTinyFetchRunAuditWriteResultVerification),
        first_tiny_historical_candle_persistence_dry_run_plan:
          JSON.stringify(firstTinyHistoricalCandlePersistenceDryRunPlan),
        first_tiny_historical_candle_payload_refetch_plan: JSON.stringify(
          firstTinyHistoricalCandlePayloadRefetchPlan,
        ),
        first_tiny_historical_candle_payload_refetch_execute: JSON.stringify(
          firstTinyHistoricalCandlePayloadRefetchExecute,
        ),
        first_tiny_historical_candle_payload_refetch_result_verification:
          JSON.stringify(firstTinyCandlePayloadRefetchResultVerification),
        first_tiny_historical_candle_payload_window_sanity_review:
          JSON.stringify(firstTinyCandlePayloadWindowSanityReview),
        corrected_first_tiny_historical_candle_payload_refetch_plan:
          JSON.stringify(firstTinyCorrectedCandlePayloadRefetchPlan),
        corrected_first_tiny_historical_candle_payload_refetch_approval:
          JSON.stringify(firstTinyCorrectedPayloadRefetchApproval),
        corrected_first_tiny_historical_candle_payload_refetch_execute:
          JSON.stringify(firstTinyCorrectedPayloadRefetchExecute),
        corrected_first_tiny_historical_candle_payload_refetch_result_verification:
          JSON.stringify(firstTinyCorrectedPayloadRefetchResultVerification),
        corrected_first_tiny_historical_candle_ohlcv_payload_static_capture:
          JSON.stringify(firstTinyCorrectedOhlcvPayloadStaticCapture),
        first_tiny_historical_candle_executable_persistence_dry_run_plan:
          JSON.stringify(firstTinyExecutableCandlePersistenceDryRunPlan),
        first_tiny_historical_candle_persistence_approval:
          JSON.stringify(firstTinyCandlePersistenceApproval),
        first_tiny_historical_candle_persistence_execute:
          JSON.stringify(firstTinyCandlePersistenceExecute),
        first_tiny_historical_candle_persistence_readback_verification:
          JSON.stringify(firstTinyCandlePersistenceReadbackVerification),
        first_tiny_historical_candle_persistence_result_verification:
          JSON.stringify(firstTinyCandlePersistenceResultVerification),
        first_tiny_historical_replay_dry_run_plan: JSON.stringify(
          firstTinyHistoricalReplayDryRunPlan,
        ),
        first_tiny_historical_replay_dry_run_approval: JSON.stringify(
          firstTinyHistoricalReplayDryRunApproval,
        ),
        first_tiny_historical_replay_dry_run_execute: JSON.stringify(
          firstTinyHistoricalReplayDryRunExecute,
        ),
        first_tiny_historical_replay_dry_run_result_verification:
          JSON.stringify(firstTinyHistoricalReplayDryRunResultVerification),
        first_tiny_historical_replay_signal_package_discovery_plan:
          JSON.stringify(firstTinyHistoricalReplaySignalPackageDiscoveryPlan),
        first_tiny_historical_replay_signal_package_discovery_readback:
          JSON.stringify(
            firstTinyHistoricalReplaySignalPackageDiscoveryReadback,
          ),
        intelligence_overview: JSON.stringify(
          input.daily_learning_review?.intelligence_overview ?? null,
        ),
        ticker_universe_readiness: JSON.stringify(
          input.daily_learning_review?.ticker_universe_readiness ?? null,
        ),
        group_breakdowns: JSON.stringify(
          input.daily_learning_review?.group_breakdowns ?? [],
        ),
        engine_adjustment_candidates: JSON.stringify(
          input.daily_learning_review?.engine_adjustment_candidates ?? [],
        ),
        sample_size_label:
          input.daily_learning_review?.sample_size_label ?? null,
        duplicate_outcome_rows_ignored_count:
          input.daily_learning_review?.duplicate_outcome_rows_ignored_count ??
          null,
        visibility_detection_source_counts: JSON.stringify(
          input.daily_learning_review?.visibility_diagnostics.source_counts ??
            {},
        ),
        unknown_visibility_examples: JSON.stringify(
          input.daily_learning_review?.visibility_diagnostics
            .unknown_examples ?? [],
        ),
      },
    }),
    section({
      section_id: "intelligence_overview",
      title: "Intelligence Overview",
      severity:
        (input.daily_learning_review?.intelligence_overview.caution_flags.length ??
          0) > 0 ||
        (input.daily_learning_review?.intelligence_overview.data_readiness
          .sample_confidence ?? "low") === "low"
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Active layers",
          intelligenceLayerText(
            input.daily_learning_review?.intelligence_overview.active_layers,
          ),
        ),
        lineValue(
          "Latest evaluated batch",
          compact(
            input.daily_learning_review?.intelligence_overview
              .latest_evaluated_batch_fingerprint,
            "none",
          ),
        ),
        lineValue(
          "Outcomes analyzed",
          input.daily_learning_review?.intelligence_overview.data_readiness
            .outcome_count ?? 0,
        ),
        lineValue(
          "Sample confidence",
          input.daily_learning_review?.intelligence_overview.data_readiness
            .sample_confidence ?? "low",
        ),
        lineValue(
          "Latest market regime",
          compact(
            input.daily_learning_review?.intelligence_overview.latest_signals
              .market_regime,
            "unknown",
          ),
        ),
        lineValue(
          "Setup mix",
          intelligenceMixText(
            input.daily_learning_review?.intelligence_overview.latest_signals
              .setup_mix,
          ),
        ),
        lineValue(
          "Sector mix",
          intelligenceMixText(
            input.daily_learning_review?.intelligence_overview.latest_signals
              .sector_mix,
          ),
        ),
        lineValue(
          "Ticker profile status",
          intelligenceMixText(
            input.daily_learning_review?.intelligence_overview.latest_signals
              .ticker_profile_status_mix,
          ),
        ),
        lineValue(
          "Trade quality mix",
          intelligenceMixText(
            input.daily_learning_review?.intelligence_overview.latest_signals
              .trade_quality_mix,
          ),
        ),
        lineValue(
          "Confidence calibration",
          input.daily_learning_review?.intelligence_overview.layer_status
            .confidence_calibration?.summary ?? "unknown",
        ),
        lineValue(
          "Model governance",
          input.daily_learning_review?.intelligence_overview.layer_status
            .model_governance?.summary ?? "unknown",
        ),
        lineValue(
          "Dynamic movers readiness",
          `provider ${dynamicMoversReadiness.provider_status.available ? "available" : "unavailable"} / safe preview ${dynamicMoversReadiness.readiness.safe_to_preview ? "yes" : "no"} / scanner use no / next ${dynamicMoversReadiness.recommended_next_steps[0] ?? "none"}`,
        ),
        lineValue(
          "Dynamic movers shadow contract",
          `mock ${dynamicMoversShadowAudit.fixture_summary.total_movers} / valid ${dynamicMoversShadowAudit.fixture_summary.valid_movers} / shadow compare ${dynamicMoversShadowAudit.shadow_readiness.safe_to_shadow_compare ? "yes" : "no"} / scanner use no`,
        ),
        lineValue(
          "Historical backfill readiness",
          "planned / fetch no / synthetic persist no / scanner effect no",
        ),
        lineValue(
          "Historical candle cache",
          "planned / fetch no / persist no / scanner use no",
        ),
        lineValue(
          "Historical candle storage",
          `${historicalCandleStorageReadiness.migration_readiness.schema_readback_status === "ok" || historicalCandleStorageReadiness.migration_readiness.migration_applied === "yes" ? "schema verified" : "schema planned"} / migration ${historicalCandleStorageReadiness.migration_readiness.migration_applied} / fetch no / persist no`,
        ),
        lineValue(
          "Historical backfill planner",
          `dry-run / ${historicalBackfillFetchPlan.plan_context.history_days_planned} days / ${historicalBackfillFetchPlan.ticker_selection.selected_tickers.length} tickers / fetch no / persist no`,
        ),
        lineValue(
          "Twelve Data historical contract",
          `dry-run / requests planned ${twelveDataHistoricalFetchContract.request_validation.requests_planned} / provider call no / persist no`,
        ),
        lineValue(
          "Twelve Data response parser",
          `mock / parse ready ${twelveDataHistoricalResponseParser.readiness.ready_to_parse_mock_response ? "yes" : "no"} / provider response no / persist no`,
        ),
        lineValue(
          "Historical candle persistence",
          `dry-run / inserts planned ${historicalCandlePersistencePlan.upsert_plan.planned_inserts} / persist no / scanner no`,
        ),
        lineValue(
          "Historical backfill dry-run",
          `${historicalBackfillDryRunPipeline.pipeline_status} / requests ${historicalBackfillDryRunPipeline.request_contract_summary.requests_planned} / normalized candles ${historicalBackfillDryRunPipeline.parser_summary.normalized_candles} / persist no / scanner no`,
        ),
        lineValue(
          "Historical backfill execution readiness",
          `${historicalBackfillExecutionReadiness.readiness_status} / migration ${yesNoUnknown(historicalBackfillExecutionReadiness.prerequisites.migration_applied)} / first fetch disabled / provider call no`,
        ),
        lineValue(
          "First tiny historical fetch approval",
          `${firstTinyHistoricalFetchApproval.approval_status} / enabled no / provider call no / persist no`,
        ),
        lineValue(
          "First tiny fetch preview",
          `${firstTinyHistoricalFetchRequestPreview.preview_status} / ${firstTinyHistoricalFetchRequestPreview.request_preview.ticker} / ${firstTinyHistoricalFetchRequestPreview.request_preview.request_count} request / provider call no / persist no`,
        ),
        lineValue(
          "First tiny fetch operator approval",
          `${firstTinyHistoricalFetchOperatorApproval.approval_record_status} / provider call no / persist no`,
        ),
        lineValue(
          "First tiny fetch execution plan",
          `${firstTinyHistoricalFetchExecutionPlan.execution_plan_status} / execute no / provider call no / persist no`,
        ),
        lineValue(
          "First tiny fetch approval signal",
          `${firstTinyHistoricalFetchApprovalSignalReadiness.approval_signal_status} / accept future signal ${firstTinyHistoricalFetchApprovalSignalReadiness.readiness.ready_to_accept_future_signal ? "yes" : "no"} / execute no / provider call no`,
        ),
        lineValue(
          "First tiny fetch final preflight",
          `${firstTinyHistoricalFetchFinalPreflight.preflight_status} / execute no / provider call no / persist no`,
        ),
        lineValue(
          "First tiny provider dry execute",
          `${firstTinyHistoricalFetchProviderDryExecute.execution_status} / call ${firstTinyHistoricalFetchProviderDryExecute.provider_call_executed ? "yes" : "no"} / persist no / scanner no`,
        ),
        lineValue(
          "First tiny no-persist verification",
          `${firstTinyHistoricalFetchNoPersistVerification.verification_status} / ${firstTinyHistoricalFetchNoPersistVerification.request_scope.ticker} ${firstTinyHistoricalFetchNoPersistVerification.request_scope.interval} / candles ${firstTinyHistoricalFetchNoPersistVerification.parser_result.valid_candles} / persist no`,
        ),
        lineValue(
          "First tiny fetch-run audit write plan",
          `${firstTinyHistoricalFetchRunAuditWritePlan.status} / rows ${firstTinyHistoricalFetchRunAuditWritePlan.write_gate.planned_audit_rows} / write no / candles no`,
        ),
        lineValue(
          "First tiny fetch-run audit approval",
          `${firstTinyFetchRunAuditWriteApproval.approval_status} / ready ${firstTinyFetchRunAuditWriteApproval.readiness.ready_to_accept_future_signal ? "yes" : "no"} / write no`,
        ),
        lineValue(
          "First tiny fetch-run audit execute",
          `${firstTinyFetchRunAuditWriteExecute.execution_status} / inserted ${firstTinyFetchRunAuditWriteExecute.audit_rows_inserted} / candles no / scanner no`,
        ),
        lineValue(
          "First tiny fetch-run audit result",
          `${firstTinyFetchRunAuditWriteResultVerification.verification_status} / inserted ${firstTinyFetchRunAuditWriteResultVerification.audit_rows_inserted} / readback ${firstTinyFetchRunAuditWriteResultVerification.readback_verified ? "yes" : "no"} / candles no`,
        ),
        lineValue(
          "First tiny candle persistence dry-run",
          `${firstTinyHistoricalCandlePersistenceDryRunPlan.plan_status} / expected ${firstTinyHistoricalCandlePersistenceDryRunPlan.count_level_plan.expected_candle_rows} / payload ${firstTinyHistoricalCandlePersistenceDryRunPlan.payload_availability.candle_payload_available ? "yes" : "no"} / write no`,
        ),
        lineValue(
          "First tiny candle payload refetch",
          `${firstTinyHistoricalCandlePayloadRefetchPlan.refetch_plan_status} / approval ${firstTinyHistoricalCandlePayloadRefetchPlan.approval_status} / provider call no / write no`,
        ),
        lineValue(
          "First tiny candle payload refetch execute",
          `${firstTinyHistoricalCandlePayloadRefetchExecute.execution_status} / provider call ${firstTinyHistoricalCandlePayloadRefetchExecute.provider_call_executed ? "yes" : "no"} / payload ${firstTinyHistoricalCandlePayloadRefetchExecute.normalized_payload_available ? "yes" : "no"} / persist no`,
        ),
        lineValue(
          "First tiny payload refetch result",
          `${firstTinyCandlePayloadRefetchResultVerification.verification_status === "verified_with_window_review_required" ? "verified" : firstTinyCandlePayloadRefetchResultVerification.verification_status} / ${firstTinyCandlePayloadRefetchResultVerification.valid_candles} valid / payload ${firstTinyCandlePayloadRefetchResultVerification.normalized_payload_available ? "yes" : "no"} / write blocked pending window review`,
        ),
        lineValue(
          "First tiny payload window review",
          `${firstTinyCandlePayloadWindowSanityReview.review_status === "corrected_refetch_required" ? "review required" : firstTinyCandlePayloadWindowSanityReview.review_status} / write blocked`,
        ),
        lineValue(
          "Corrected first tiny payload refetch plan",
          `${firstTinyCorrectedCandlePayloadRefetchPlan.corrected_refetch_plan_status} / prior window mismatch / write disabled`,
        ),
        lineValue(
          "Corrected first tiny payload refetch approval",
          `${firstTinyCorrectedPayloadRefetchApproval.approval_status} / execute no / write no`,
        ),
        lineValue(
          "Corrected first tiny payload refetch execute",
          `${firstTinyCorrectedPayloadRefetchExecute.execution_status} / provider call ${firstTinyCorrectedPayloadRefetchExecute.provider_call_executed ? "yes" : "no"} / payload ${firstTinyCorrectedPayloadRefetchExecute.normalized_payload_available ? "yes" : "no"} / persist no`,
        ),
        lineValue(
          "Corrected first tiny payload result",
          `${firstTinyCorrectedPayloadRefetchResultVerification.verification_status === "verified_ready_for_executable_candle_persistence_plan" ? "verified" : firstTinyCorrectedPayloadRefetchResultVerification.verification_status} / ${firstTinyCorrectedPayloadRefetchResultVerification.valid_filtered_candles} valid / window match ${firstTinyCorrectedPayloadRefetchResultVerification.filtered_window_matches_intended ? "yes" : "no"} / persistence dry-run next`,
        ),
        lineValue(
          "Corrected first tiny OHLCV payload",
          `static captured / ${firstTinyCorrectedOhlcvPayloadStaticCapture.invalid_row_count === 0 ? firstTinyCorrectedOhlcvPayloadStaticCapture.row_count : firstTinyCorrectedOhlcvPayloadStaticCapture.row_count - firstTinyCorrectedOhlcvPayloadStaticCapture.invalid_row_count} valid / persistence dry-run next`,
        ),
        lineValue(
          "Executable first tiny candle persistence plan",
          `dry-run v2 / ${firstTinyExecutableCandlePersistenceDryRunPlan.payload_summary.candle_write_valid_rows} write-valid / write no`,
        ),
        lineValue(
          "First tiny candle persistence approval",
          `${firstTinyCandlePersistenceApproval.approval_status} / execute no / write no`,
        ),
        lineValue(
          "First tiny candle persistence execute",
          `${firstTinyCandlePersistenceExecute.execution_status} / persisted ${firstTinyCandlePersistenceExecute.candles_persisted ? "yes" : "no"} / replay no`,
        ),
        lineValue(
          "First tiny candle persistence readback",
          `${firstTinyCandlePersistenceReadbackVerification.verification_status} / verified ${firstTinyCandlePersistenceReadbackVerification.readback_verified ? "yes" : "no"} / write no`,
        ),
        lineValue(
          "First tiny candle persistence result",
          `${firstTinyCandlePersistenceResultVerification.readback_verified ? "verified" : "not verified"} / ${firstTinyCandlePersistenceResultVerification.readback_rows} persisted / readback ${firstTinyCandlePersistenceResultVerification.readback_verified ? "yes" : "no"} / replay no`,
        ),
        lineValue(
          "First tiny replay plan",
          `dry-run / ${firstTinyHistoricalReplayDryRunPlan.candle_rows_available} persisted candles / replay no / scanner no`,
        ),
        lineValue(
          "First tiny replay approval",
          `${firstTinyHistoricalReplayDryRunApproval.approval_status} / replay no / scanner no / ranking no`,
        ),
        lineValue(
          "First tiny replay execute",
          `${firstTinyHistoricalReplayDryRunExecute.execution_status} / replay ${firstTinyHistoricalReplayDryRunExecute.replay_executed ? "yes" : "no"} / synthetic no / scanner no`,
        ),
        lineValue(
          "First tiny replay result",
          `input verified / ${firstTinyHistoricalReplayDryRunResultVerification.candles_verified} candles / no signal package / no persistence`,
        ),
        lineValue(
          "First tiny signal package discovery",
          `${firstTinyHistoricalReplaySignalPackageDiscoveryPlan.discovery_plan_status} / package missing / replay result no / persistence no`,
        ),
        lineValue(
          "First tiny signal package discovery readback",
          `${firstTinyHistoricalReplaySignalPackageDiscoveryReadback.discovery_status} / compatible ${firstTinyHistoricalReplaySignalPackageDiscoveryReadback.best_candidate_available ? "yes" : "no"} / replay no / persistence no`,
        ),
        lineValue(
          "Primary learning signal",
          compact(
            input.daily_learning_review?.intelligence_overview
              .primary_learning_signal,
            "none",
          ),
        ),
        lineValue(
          "Recommended focus",
          intelligenceFocusText(
            input.daily_learning_review?.intelligence_overview
              .recommended_learning_focus,
          ),
        ),
        lineValue(
          "Enough for model change",
          intelligenceYesNo(
            input.daily_learning_review?.intelligence_overview.data_readiness
              .enough_for_model_change,
          ),
        ),
        lineValue(
          "Live ranking changes enabled",
          intelligenceYesNo(
            input.daily_learning_review?.intelligence_overview.safety
              .live_ranking_changes_enabled,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        active_layers: (
          input.daily_learning_review?.intelligence_overview.active_layers ?? []
        ).join(","),
        inactive_layers: (
          input.daily_learning_review?.intelligence_overview.inactive_layers ??
          []
        ).join(","),
        latest_batch_fingerprint:
          input.daily_learning_review?.intelligence_overview
            .latest_batch_fingerprint ?? null,
        latest_evaluated_batch_fingerprint:
          input.daily_learning_review?.intelligence_overview
            .latest_evaluated_batch_fingerprint ?? null,
        outcome_count:
          input.daily_learning_review?.intelligence_overview.data_readiness
            .outcome_count ?? null,
        unique_snapshot_count:
          input.daily_learning_review?.intelligence_overview.data_readiness
            .unique_snapshot_count ?? null,
        sample_confidence:
          input.daily_learning_review?.intelligence_overview.data_readiness
            .sample_confidence ?? null,
        enough_for_observation:
          input.daily_learning_review?.intelligence_overview.data_readiness
            .enough_for_observation ?? null,
        enough_for_model_change:
          input.daily_learning_review?.intelligence_overview.data_readiness
            .enough_for_model_change ?? null,
        enough_for_live_ranking_change:
          input.daily_learning_review?.intelligence_overview.data_readiness
            .enough_for_live_ranking_change ?? false,
        latest_signals: JSON.stringify(
          input.daily_learning_review?.intelligence_overview.latest_signals ??
            null,
        ),
        primary_learning_signal:
          input.daily_learning_review?.intelligence_overview
            .primary_learning_signal ?? null,
        recommended_learning_focus: (
          input.daily_learning_review?.intelligence_overview
            .recommended_learning_focus ?? []
        ).join(","),
        recommended_next_action:
          input.daily_learning_review?.intelligence_overview
            .recommended_next_action ?? null,
        automatic_model_updates_enabled:
          input.daily_learning_review?.intelligence_overview.safety
            .automatic_model_updates_enabled ?? false,
        live_ranking_changes_enabled:
          input.daily_learning_review?.intelligence_overview.safety
            .live_ranking_changes_enabled ?? false,
        broker_automation_enabled:
          input.daily_learning_review?.intelligence_overview.safety
            .broker_automation_enabled ?? false,
        requires_manual_review:
          input.daily_learning_review?.intelligence_overview.safety
            .requires_manual_review ?? true,
        reason_codes: (
          input.daily_learning_review?.intelligence_overview.reason_codes ?? []
        ).join(","),
        caution_flags: (
          input.daily_learning_review?.intelligence_overview.caution_flags ?? []
        ).join(","),
        metadata_gaps: (
          input.daily_learning_review?.intelligence_overview.metadata_gaps ?? []
        ).join(","),
      },
    }),
    section({
      section_id: "ticker_universe_readiness",
      title: "Ticker Universe Readiness",
      severity:
        input.daily_learning_review?.ticker_universe_readiness.summary
          .sample_confidence === "low" ||
        input.daily_learning_review?.ticker_universe_readiness.universe_status
          .dynamic_movers_available === false
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Static universe count",
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .configured_static_universe_count ?? null,
        ),
        lineValue(
          "Observed/evaluated tickers today",
          `${input.daily_learning_review?.ticker_universe_readiness.universe_status.observed_today_count ?? 0} / ${input.daily_learning_review?.ticker_universe_readiness.universe_status.evaluated_today_count ?? 0}`,
        ),
        lineValue(
          "Profiles built",
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .profile_count ?? 0,
        ),
        lineValue(
          "Dynamic movers",
          `${input.daily_learning_review?.ticker_universe_readiness.universe_status.dynamic_movers_enabled === true ? "enabled" : "disabled"} / ${input.daily_learning_review?.ticker_universe_readiness.universe_status.dynamic_movers_available === true ? "available" : "unavailable"}`,
        ),
        lineValue(
          "Core candidates",
          tickerListText(
            input.daily_learning_review?.ticker_universe_readiness
              .ticker_classification.core_candidates,
          ),
        ),
        lineValue(
          "Observed candidates",
          tickerListText(
            input.daily_learning_review?.ticker_universe_readiness
              .ticker_classification.observed_candidates,
          ),
        ),
        lineValue(
          "Research-heavy candidates",
          tickerListText(
            input.daily_learning_review?.ticker_universe_readiness
              .ticker_classification.research_heavy_candidates,
          ),
        ),
        lineValue(
          "Needs more data",
          tickerListText(
            input.daily_learning_review?.ticker_universe_readiness
              .ticker_classification.needs_more_data,
          ),
        ),
        lineValue(
          "Possible deprioritization candidates",
          tickerListText(
            input.daily_learning_review?.ticker_universe_readiness
              .ticker_classification.possible_deprioritization_candidates,
          ),
        ),
        lineValue(
          "Dynamic mover gap candidates",
          tickerListText(
            input.daily_learning_review?.ticker_universe_readiness
              .ticker_classification.dynamic_mover_gap_candidates,
          ),
        ),
        lineValue(
          "Sector coverage",
          readinessSectorCoverageText(
            input.daily_learning_review?.ticker_universe_readiness
              .sector_coverage,
          ),
        ),
        lineValue(
          "Primary universe signal",
          compact(
            input.daily_learning_review?.ticker_universe_readiness.summary
              .primary_universe_signal,
            "none",
          ),
        ),
        lineValue(
          "Recommended focus",
          compactListText(
            input.daily_learning_review?.ticker_universe_readiness.summary
              .recommended_focus,
          ),
        ),
        lineValue(
          "Safe to change universe",
          "no",
        ),
        lineValue(
          "Scanner universe changed",
          "no",
        ),
        lineValue("Live ranking changed", "no"),
      ],
      metrics: {
        advisory_mode:
          input.daily_learning_review?.ticker_universe_readiness.advisory_only ??
          true,
        configured_static_universe_count:
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .configured_static_universe_count ?? null,
        observed_today_count:
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .observed_today_count ?? null,
        evaluated_today_count:
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .evaluated_today_count ?? null,
        visible_today_count:
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .visible_today_count ?? null,
        profile_count:
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .profile_count ?? null,
        dynamic_movers_enabled:
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .dynamic_movers_enabled ?? false,
        dynamic_movers_available:
          input.daily_learning_review?.ticker_universe_readiness.universe_status
            .dynamic_movers_available ?? false,
        core_candidates: (
          input.daily_learning_review?.ticker_universe_readiness
            .ticker_classification.core_candidates ?? []
        ).join(","),
        observed_candidates: (
          input.daily_learning_review?.ticker_universe_readiness
            .ticker_classification.observed_candidates ?? []
        ).join(","),
        research_heavy_candidates: (
          input.daily_learning_review?.ticker_universe_readiness
            .ticker_classification.research_heavy_candidates ?? []
        ).join(","),
        needs_more_data: (
          input.daily_learning_review?.ticker_universe_readiness
            .ticker_classification.needs_more_data ?? []
        ).join(","),
        possible_deprioritization_candidates: (
          input.daily_learning_review?.ticker_universe_readiness
            .ticker_classification.possible_deprioritization_candidates ?? []
        ).join(","),
        dynamic_mover_gap_candidates: (
          input.daily_learning_review?.ticker_universe_readiness
            .ticker_classification.dynamic_mover_gap_candidates ?? []
        ).join(","),
        sector_coverage: JSON.stringify(
          input.daily_learning_review?.ticker_universe_readiness
            .sector_coverage ?? null,
        ),
        ticker_metrics: JSON.stringify(
          input.daily_learning_review?.ticker_universe_readiness
            .ticker_metrics ?? [],
        ),
        dynamic_movers_gap: JSON.stringify(
          input.daily_learning_review?.ticker_universe_readiness
            .dynamic_movers_gap ?? null,
        ),
        sample_confidence:
          input.daily_learning_review?.ticker_universe_readiness.summary
            .sample_confidence ?? null,
        primary_universe_signal:
          input.daily_learning_review?.ticker_universe_readiness.summary
            .primary_universe_signal ?? null,
        recommended_focus: (
          input.daily_learning_review?.ticker_universe_readiness.summary
            .recommended_focus ?? []
        ).join(","),
        safe_to_change_universe:
          input.daily_learning_review?.ticker_universe_readiness.summary
            .safe_to_change_universe ?? false,
        scanner_universe_changed:
          input.daily_learning_review?.ticker_universe_readiness.safety
            .scanner_universe_changed ?? false,
        live_ranking_changed:
          input.daily_learning_review?.ticker_universe_readiness.safety
            .live_ranking_changed ?? false,
        requires_manual_review:
          input.daily_learning_review?.ticker_universe_readiness.safety
            .requires_manual_review ?? true,
      },
    }),
    section({
      section_id: "setup_labeling",
      title: "Setup Labeling",
      severity:
        (input.daily_learning_review?.setup_labeling
          .unknown_setup_label_count ?? 0) > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Current batch labeled",
          `${input.daily_learning_review?.setup_labeling.current_batch_labeled_count ?? 0} / ${input.daily_learning_review?.setup_labeling.current_batch_total_count ?? 0}`,
        ),
        lineValue(
          "Unknown setup labels",
          input.daily_learning_review?.setup_labeling
            .unknown_setup_label_count ?? 0,
        ),
        lineValue(
          "Setup mix",
          setupMixText(input.daily_learning_review?.setup_labeling.setup_mix),
        ),
        lineValue(
          "Visible setup mix",
          setupMixText(
            input.daily_learning_review?.setup_labeling.visible_setup_mix,
          ),
        ),
        lineValue(
          "Research-only setup mix",
          setupMixText(
            input.daily_learning_review?.setup_labeling
              .research_only_setup_mix,
          ),
        ),
        lineValue(
          "Low-confidence labels",
          input.daily_learning_review?.setup_labeling
            .low_confidence_label_count ?? 0,
        ),
        lineValue(
          "Top setup label gaps",
          setupGapText(
            input.daily_learning_review?.setup_labeling.top_setup_label_gaps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        current_batch_labeled_count:
          input.daily_learning_review?.setup_labeling
            .current_batch_labeled_count ?? null,
        current_batch_total_count:
          input.daily_learning_review?.setup_labeling
            .current_batch_total_count ?? null,
        known_setup_label_count:
          input.daily_learning_review?.setup_labeling.known_setup_label_count ??
          null,
        unknown_setup_label_count:
          input.daily_learning_review?.setup_labeling
            .unknown_setup_label_count ?? null,
        setup_mix: JSON.stringify(
          input.daily_learning_review?.setup_labeling.setup_mix ?? {},
        ),
        visible_setup_mix: JSON.stringify(
          input.daily_learning_review?.setup_labeling.visible_setup_mix ?? {},
        ),
        research_only_setup_mix: JSON.stringify(
          input.daily_learning_review?.setup_labeling.research_only_setup_mix ??
            {},
        ),
        low_confidence_label_count:
          input.daily_learning_review?.setup_labeling
            .low_confidence_label_count ?? null,
        top_setup_label_gaps: JSON.stringify(
          input.daily_learning_review?.setup_labeling.top_setup_label_gaps ??
            {},
        ),
      },
    }),
    section({
      section_id: "sector_industry_mapping",
      title: "Sector / Industry Mapping",
      severity:
        (input.daily_learning_review?.sector_industry_mapping
          .unknown_ticker_mapping_count ?? 0) > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Current batch mapped",
          `${input.daily_learning_review?.sector_industry_mapping.current_batch_mapped_count ?? 0} / ${input.daily_learning_review?.sector_industry_mapping.current_batch_total_count ?? 0}`,
        ),
        lineValue(
          "Unknown ticker mappings",
          input.daily_learning_review?.sector_industry_mapping
            .unknown_ticker_mapping_count ?? 0,
        ),
        lineValue(
          "Sector mix",
          setupMixText(
            input.daily_learning_review?.sector_industry_mapping.sector_mix,
          ),
        ),
        lineValue(
          "Industry mix",
          setupMixText(
            input.daily_learning_review?.sector_industry_mapping.industry_mix,
          ),
        ),
        lineValue(
          "Visible sector mix",
          setupMixText(
            input.daily_learning_review?.sector_industry_mapping
              .visible_sector_mix,
          ),
        ),
        lineValue(
          "Research-only sector mix",
          setupMixText(
            input.daily_learning_review?.sector_industry_mapping
              .research_only_sector_mix,
          ),
        ),
        lineValue(
          "Low-confidence mappings",
          input.daily_learning_review?.sector_industry_mapping
            .low_confidence_mapping_count ?? 0,
        ),
        lineValue(
          "Top sector mapping gaps",
          setupGapText(
            input.daily_learning_review?.sector_industry_mapping
              .top_sector_mapping_gaps,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        current_batch_mapped_count:
          input.daily_learning_review?.sector_industry_mapping
            .current_batch_mapped_count ?? null,
        current_batch_total_count:
          input.daily_learning_review?.sector_industry_mapping
            .current_batch_total_count ?? null,
        unknown_ticker_mapping_count:
          input.daily_learning_review?.sector_industry_mapping
            .unknown_ticker_mapping_count ?? null,
        sector_mix: JSON.stringify(
          input.daily_learning_review?.sector_industry_mapping.sector_mix ??
            {},
        ),
        industry_mix: JSON.stringify(
          input.daily_learning_review?.sector_industry_mapping.industry_mix ??
            {},
        ),
        visible_sector_mix: JSON.stringify(
          input.daily_learning_review?.sector_industry_mapping
            .visible_sector_mix ?? {},
        ),
        research_only_sector_mix: JSON.stringify(
          input.daily_learning_review?.sector_industry_mapping
            .research_only_sector_mix ?? {},
        ),
        low_confidence_mapping_count:
          input.daily_learning_review?.sector_industry_mapping
            .low_confidence_mapping_count ?? null,
        top_sector_mapping_gaps: JSON.stringify(
          input.daily_learning_review?.sector_industry_mapping
            .top_sector_mapping_gaps ?? {},
        ),
      },
    }),
    section({
      section_id: "ticker_profiles",
      title: "Ticker Profiles",
      severity:
        (input.daily_learning_review?.ticker_profile_summary
          .deprioritized_count ?? 0) > 0 ||
        (input.daily_learning_review?.ticker_profile_summary.unknown_count ??
          0) > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Profiles built",
          input.daily_learning_review?.ticker_profile_summary
            .profiles_built_count ?? 0,
        ),
        lineValue(
          "New/observed/trusted/deprioritized/unknown",
          `${input.daily_learning_review?.ticker_profile_summary.new_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.observed_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.trusted_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.deprioritized_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.unknown_count ?? 0}`,
        ),
        lineValue(
          "Sample confidence low/medium/high",
          `${input.daily_learning_review?.ticker_profile_summary.sample_confidence_low_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.sample_confidence_medium_count ?? 0}/${input.daily_learning_review?.ticker_profile_summary.sample_confidence_high_count ?? 0}`,
        ),
        lineValue(
          "Top profiles",
          tickerProfileRankText(
            input.daily_learning_review?.ticker_profile_summary
              .top_profiles_by_avg_best_r,
            "best",
          ),
        ),
        lineValue(
          "Weak profiles",
          tickerProfileRankText(
            input.daily_learning_review?.ticker_profile_summary
              .weak_profiles_by_avg_worst_r,
            "worst",
          ),
        ),
        lineValue(
          "Tickers needing more data",
          tickerListText(
            input.daily_learning_review?.ticker_profile_summary
              .tickers_needing_more_data,
          ),
        ),
        lineValue(
          "High entry-not-triggering",
          tickerListText(
            input.daily_learning_review?.ticker_profile_summary
              .tickers_high_entry_not_triggering,
          ),
        ),
        lineValue(
          "Weak follow-through",
          tickerListText(
            input.daily_learning_review?.ticker_profile_summary
              .tickers_weak_follow_through,
          ),
        ),
        lineValue(
          "Top caution flags",
          setupGapText(
            input.daily_learning_review?.ticker_profile_summary
              .top_caution_flags,
          ),
        ),
        lineValue(
          "Unknown ticker profiles",
          tickerListText(
            input.daily_learning_review?.ticker_profile_summary
              .unknown_ticker_profiles,
          ),
        ),
      ],
      metrics: {
        advisory_mode: true,
        profiles_built_count:
          input.daily_learning_review?.ticker_profile_summary
            .profiles_built_count ?? null,
        new_count:
          input.daily_learning_review?.ticker_profile_summary.new_count ?? null,
        observed_count:
          input.daily_learning_review?.ticker_profile_summary.observed_count ??
          null,
        trusted_count:
          input.daily_learning_review?.ticker_profile_summary.trusted_count ??
          null,
        deprioritized_count:
          input.daily_learning_review?.ticker_profile_summary
            .deprioritized_count ?? null,
        unknown_count:
          input.daily_learning_review?.ticker_profile_summary.unknown_count ??
          null,
        sample_confidence_low_count:
          input.daily_learning_review?.ticker_profile_summary
            .sample_confidence_low_count ?? null,
        sample_confidence_medium_count:
          input.daily_learning_review?.ticker_profile_summary
            .sample_confidence_medium_count ?? null,
        sample_confidence_high_count:
          input.daily_learning_review?.ticker_profile_summary
            .sample_confidence_high_count ?? null,
        top_profiles_by_avg_best_r: JSON.stringify(
          input.daily_learning_review?.ticker_profile_summary
            .top_profiles_by_avg_best_r ?? [],
        ),
        weak_profiles_by_avg_worst_r: JSON.stringify(
          input.daily_learning_review?.ticker_profile_summary
            .weak_profiles_by_avg_worst_r ?? [],
        ),
        tickers_needing_more_data: (
          input.daily_learning_review?.ticker_profile_summary
            .tickers_needing_more_data ?? []
        ).join(","),
        tickers_high_entry_not_triggering: (
          input.daily_learning_review?.ticker_profile_summary
            .tickers_high_entry_not_triggering ?? []
        ).join(","),
        tickers_weak_follow_through: (
          input.daily_learning_review?.ticker_profile_summary
            .tickers_weak_follow_through ?? []
        ).join(","),
        top_caution_flags: JSON.stringify(
          input.daily_learning_review?.ticker_profile_summary
            .top_caution_flags ?? {},
        ),
        unknown_ticker_profiles: (
          input.daily_learning_review?.ticker_profile_summary
            .unknown_ticker_profiles ?? []
        ).join(","),
      },
    }),
    section({
      section_id: "market_regime_labeling",
      title: "Market Regime Labeling",
      severity:
        (input.daily_learning_review?.market_regime.latest_regime_label
          .regime_label === "risk_off" ||
          input.daily_learning_review?.market_regime.latest_regime_label
            .regime_label === "choppy") &&
        input.daily_learning_review?.market_regime.latest_regime_label
          .regime_confidence !== "low"
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Latest regime",
          `${input.daily_learning_review?.market_regime.latest_regime_label.regime_label ?? "unknown"} / confidence ${input.daily_learning_review?.market_regime.latest_regime_label.regime_confidence ?? "low"}`,
        ),
        lineValue(
          "Reason codes",
          compactListText(
            input.daily_learning_review?.market_regime.latest_regime_label
              .reason_codes,
          ),
        ),
        lineValue(
          "Caution flags",
          compactListText(
            input.daily_learning_review?.market_regime.latest_regime_label
              .caution_flags,
          ),
        ),
        lineValue(
          "Sector concentration",
          setupMixText(
            input.daily_learning_review?.market_regime.latest_regime_label
              .evidence.sector_concentration,
          ),
        ),
        lineValue(
          "Setup mix",
          setupMixText(
            input.daily_learning_review?.market_regime
              .setup_family_mix_by_regime[
              input.daily_learning_review?.market_regime
                .latest_evaluated_batch_regime_label ?? "unknown"
            ],
          ),
        ),
        lineValue(
          "Ticker status mix",
          setupMixText(
            input.daily_learning_review?.market_regime
              .ticker_profile_status_mix_by_regime[
              input.daily_learning_review?.market_regime
                .latest_evaluated_batch_regime_label ?? "unknown"
            ],
          ),
        ),
        lineValue(
          "Evidence",
          regimeEvidenceText(
            input.daily_learning_review?.market_regime.latest_regime_label
              .evidence,
          ),
        ),
        lineValue(
          "Metadata gaps",
          compactListText(
            input.daily_learning_review?.market_regime.latest_regime_label
              .metadata_gaps,
          ),
        ),
        lineValue(
          "Sample confidence",
          input.daily_learning_review?.market_regime.sample_confidence ?? "low",
        ),
        lineValue("Next", "collect more regime-labeled outcomes"),
      ],
      metrics: {
        advisory_mode: true,
        latest_regime_label:
          input.daily_learning_review?.market_regime.latest_regime_label
            .regime_label ?? null,
        latest_regime_confidence:
          input.daily_learning_review?.market_regime.latest_regime_label
            .regime_confidence ?? null,
        reason_codes: (
          input.daily_learning_review?.market_regime.latest_regime_label
            .reason_codes ?? []
        ).join(","),
        caution_flags: (
          input.daily_learning_review?.market_regime.latest_regime_label
            .caution_flags ?? []
        ).join(","),
        metadata_gaps: (
          input.daily_learning_review?.market_regime.latest_regime_label
            .metadata_gaps ?? []
        ).join(","),
        evidence: JSON.stringify(
          input.daily_learning_review?.market_regime.latest_regime_label
            .evidence ?? {},
        ),
        outcomes_by_regime: JSON.stringify(
          input.daily_learning_review?.market_regime.outcomes_by_regime ?? {},
        ),
        setup_family_mix_by_regime: JSON.stringify(
          input.daily_learning_review?.market_regime
            .setup_family_mix_by_regime ?? {},
        ),
        sector_mix_by_regime: JSON.stringify(
          input.daily_learning_review?.market_regime.sector_mix_by_regime ??
            {},
        ),
        ticker_profile_status_mix_by_regime: JSON.stringify(
          input.daily_learning_review?.market_regime
            .ticker_profile_status_mix_by_regime ?? {},
        ),
        sample_confidence:
          input.daily_learning_review?.market_regime.sample_confidence ?? null,
      },
    }),
    section({
      section_id: "trade_quality_decomposition",
      title: "Trade Quality Decomposition",
      severity:
        ((input.daily_learning_review?.trade_quality_summary.overall_quality_mix
          .weak ?? 0) > 0 ||
          (input.daily_learning_review?.trade_quality_summary
            .low_confidence_quality_rows ?? 0) > 0) &&
        (input.daily_learning_review?.trade_quality_summary
          .current_batch_decomposed_count ?? 0) > 0
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Current batch decomposed",
          `${input.daily_learning_review?.trade_quality_summary.current_batch_decomposed_count ?? 0} / ${input.daily_learning_review?.trade_quality_summary.current_batch_total_count ?? 0}`,
        ),
        lineValue(
          "Overall quality mix",
          qualityMixText(
            input.daily_learning_review?.trade_quality_summary
              .overall_quality_mix,
          ),
        ),
        lineValue(
          "Weakest components",
          setupGapText(
            input.daily_learning_review?.trade_quality_summary
              .most_common_weak_components,
          ),
        ),
        lineValue(
          "Strongest components",
          setupGapText(
            input.daily_learning_review?.trade_quality_summary
              .most_common_strong_components,
          ),
        ),
        lineValue(
          "Metadata gaps",
          setupGapText(
            input.daily_learning_review?.trade_quality_summary.metadata_gaps,
          ),
        ),
        lineValue(
          "Reason codes",
          setupGapText(
            input.daily_learning_review?.trade_quality_summary.reason_codes,
          ),
        ),
        lineValue(
          "Caution flags",
          setupGapText(
            input.daily_learning_review?.trade_quality_summary.caution_flags,
          ),
        ),
        lineValue(
          "Quality by setup family",
          qualityGroupText(
            input.daily_learning_review?.trade_quality_summary
              .quality_by_setup_family,
          ),
        ),
        lineValue(
          "Quality by sector",
          qualityGroupText(
            input.daily_learning_review?.trade_quality_summary.quality_by_sector,
          ),
        ),
        lineValue(
          "Quality by ticker",
          qualityGroupText(
            input.daily_learning_review?.trade_quality_summary.quality_by_ticker,
          ),
        ),
        lineValue(
          "Quality by regime",
          qualityGroupText(
            input.daily_learning_review?.trade_quality_summary
              .quality_by_market_regime,
          ),
        ),
        lineValue(
          "Low-confidence quality rows",
          input.daily_learning_review?.trade_quality_summary
            .low_confidence_quality_rows ?? 0,
        ),
      ],
      metrics: {
        advisory_mode: true,
        current_batch_decomposed_count:
          input.daily_learning_review?.trade_quality_summary
            .current_batch_decomposed_count ?? null,
        current_batch_total_count:
          input.daily_learning_review?.trade_quality_summary
            .current_batch_total_count ?? null,
        overall_quality_mix: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary
            .overall_quality_mix ?? {},
        ),
        component_average_scores: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary
            .component_average_scores ?? {},
        ),
        most_common_weak_components: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary
            .most_common_weak_components ?? {},
        ),
        most_common_strong_components: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary
            .most_common_strong_components ?? {},
        ),
        metadata_gaps: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary.metadata_gaps ??
            {},
        ),
        reason_codes: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary.reason_codes ?? {},
        ),
        caution_flags: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary.caution_flags ??
            {},
        ),
        quality_by_setup_family: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary
            .quality_by_setup_family ?? [],
        ),
        quality_by_sector: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary.quality_by_sector ??
            [],
        ),
        quality_by_ticker: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary.quality_by_ticker ??
            [],
        ),
        quality_by_market_regime: JSON.stringify(
          input.daily_learning_review?.trade_quality_summary
            .quality_by_market_regime ?? [],
        ),
        low_confidence_quality_rows:
          input.daily_learning_review?.trade_quality_summary
            .low_confidence_quality_rows ?? null,
      },
    }),
    section({
      section_id: "confidence_calibration",
      title: "Confidence Calibration",
      severity:
        (input.daily_learning_review?.confidence_calibration
          .unknown_confidence_count ?? 0) > 0 ||
        input.daily_learning_review?.confidence_calibration.monotonicity_check
          .higher_confidence_outperforms_lower === false
          ? "warning"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Buckets evaluated",
          input.daily_learning_review?.confidence_calibration.buckets.filter(
            (bucket) => bucket.outcome_count > 0,
          ).length ?? 0,
        ),
        lineValue(
          "Outcomes with confidence",
          `${input.daily_learning_review?.confidence_calibration.outcomes_with_confidence_count ?? 0} / ${input.daily_learning_review?.confidence_calibration.total_outcome_count ?? 0}`,
        ),
        lineValue(
          "Numeric/tier fallback confidence",
          `${input.daily_learning_review?.confidence_calibration.outcomes_with_numeric_confidence_count ?? 0} / ${input.daily_learning_review?.confidence_calibration.outcomes_with_tier_fallback_confidence_count ?? 0}`,
        ),
        lineValue(
          "Unknown confidence",
          input.daily_learning_review?.confidence_calibration
            .unknown_confidence_count ?? 0,
        ),
        lineValue(
          "Confidence source mix",
          setupMixText(
            input.daily_learning_review?.confidence_calibration
              .confidence_source_mix,
          ),
        ),
        lineValue(
          "Bucket mix",
          confidenceBucketMixText(
            input.daily_learning_review?.confidence_calibration.buckets,
          ),
        ),
        lineValue(
          "Bucket performance",
          confidenceBucketPerformanceText(
            input.daily_learning_review?.confidence_calibration.buckets,
          ),
        ),
        lineValue(
          "Best buckets",
          compactListText(
            input.daily_learning_review?.confidence_calibration.top_buckets,
          ),
        ),
        lineValue(
          "Weak buckets",
          compactListText(
            input.daily_learning_review?.confidence_calibration.weak_buckets,
          ),
        ),
        lineValue(
          "Monotonicity",
          confidenceMonotonicityText(
            input.daily_learning_review?.confidence_calibration
              .monotonicity_check.higher_confidence_outperforms_lower,
          ),
        ),
        lineValue(
          "Calibration warnings",
          compactListText([
            ...(input.daily_learning_review?.confidence_calibration
              .monotonicity_check.caution_flags ?? []),
            ...(input.daily_learning_review?.confidence_calibration
              .metadata_gaps ?? []),
          ]),
        ),
        lineValue(
          "Sample confidence",
          input.daily_learning_review?.confidence_calibration.sample_confidence ??
            "low",
        ),
      ],
      metrics: {
        advisory_mode: true,
        total_outcome_count:
          input.daily_learning_review?.confidence_calibration
            .total_outcome_count ?? null,
        total_unique_snapshot_count:
          input.daily_learning_review?.confidence_calibration
            .total_unique_snapshot_count ?? null,
        outcomes_with_confidence_count:
          input.daily_learning_review?.confidence_calibration
            .outcomes_with_confidence_count ?? null,
        unknown_confidence_count:
          input.daily_learning_review?.confidence_calibration
            .unknown_confidence_count ?? null,
        outcomes_with_numeric_confidence_count:
          input.daily_learning_review?.confidence_calibration
            .outcomes_with_numeric_confidence_count ?? null,
        outcomes_with_tier_fallback_confidence_count:
          input.daily_learning_review?.confidence_calibration
            .outcomes_with_tier_fallback_confidence_count ?? null,
        confidence_source_mix: JSON.stringify(
          input.daily_learning_review?.confidence_calibration
            .confidence_source_mix ?? {},
        ),
        unknown_confidence_examples: JSON.stringify(
          input.daily_learning_review?.confidence_calibration
            .unknown_confidence_examples ?? [],
        ),
        buckets: JSON.stringify(
          input.daily_learning_review?.confidence_calibration.buckets ?? [],
        ),
        monotonicity_higher_confidence_outperforms_lower:
          input.daily_learning_review?.confidence_calibration.monotonicity_check
            .higher_confidence_outperforms_lower ?? null,
        monotonicity_reason_codes: (
          input.daily_learning_review?.confidence_calibration.monotonicity_check
            .reason_codes ?? []
        ).join(","),
        monotonicity_caution_flags: (
          input.daily_learning_review?.confidence_calibration.monotonicity_check
            .caution_flags ?? []
        ).join(","),
        top_buckets: (
          input.daily_learning_review?.confidence_calibration.top_buckets ?? []
        ).join(","),
        weak_buckets: (
          input.daily_learning_review?.confidence_calibration.weak_buckets ?? []
        ).join(","),
        metadata_gaps: (
          input.daily_learning_review?.confidence_calibration.metadata_gaps ?? []
        ).join(","),
        sample_confidence:
          input.daily_learning_review?.confidence_calibration
            .sample_confidence ?? null,
      },
    }),
    section({
      section_id: "model_change_governance",
      title: "Model Change Governance",
      severity:
        input.daily_learning_review?.model_governance.safety
          .automatic_model_updates_enabled ||
        input.daily_learning_review?.model_governance.safety
          .live_ranking_changes_enabled
          ? "critical"
          : "info",
      lines: [
        lineValue("Advisory mode", "yes"),
        lineValue(
          "Automatic model updates",
          input.daily_learning_review?.model_governance.safety
            .automatic_model_updates_enabled
            ? "enabled"
            : "disabled",
        ),
        lineValue(
          "Live ranking changes",
          input.daily_learning_review?.model_governance.safety
            .live_ranking_changes_enabled
            ? "enabled"
            : "disabled",
        ),
        lineValue(
          "Current intelligence layers",
          governanceLayerText(
            input.daily_learning_review?.model_governance
              .current_intelligence_layers,
          ),
        ),
        lineValue(
          "Latest change",
          compact(
            input.daily_learning_review?.model_governance.latest_change?.id,
            "none",
          ),
        ),
        lineValue(
          "Active/advisory/shadow/rejected/rolled back",
          governanceChangeCountsText(
            input.daily_learning_review?.model_governance.summary,
          ),
        ),
        lineValue(
          "Promotion gates",
          governancePromotionGatesText(
            input.daily_learning_review?.model_governance.latest_change
              ?.promotion_requirements,
          ),
        ),
        lineValue(
          "Promotion-ready changes",
          governanceLayerText(
            input.daily_learning_review?.model_governance
              .promotion_ready_changes,
          ),
        ),
        lineValue(
          "Changes needing more data",
          governanceLayerText(
            input.daily_learning_review?.model_governance
              .changes_needing_more_data,
          ),
        ),
        lineValue(
          "Rollback required",
          input.daily_learning_review?.model_governance.safety
            .rollback_required_for_live_changes === true
            ? "yes"
            : "no",
        ),
      ],
      metrics: {
        advisory_mode: true,
        current_engine_version:
          input.daily_learning_review?.model_governance
            .current_engine_version ?? null,
        current_scoring_version:
          input.daily_learning_review?.model_governance
            .current_scoring_version ?? null,
        current_confidence_version:
          input.daily_learning_review?.model_governance
            .current_confidence_version ?? null,
        current_entry_model_version:
          input.daily_learning_review?.model_governance
            .current_entry_model_version ?? null,
        current_target_stop_version:
          input.daily_learning_review?.model_governance
            .current_target_stop_version ?? null,
        automatic_model_updates_enabled:
          input.daily_learning_review?.model_governance.safety
            .automatic_model_updates_enabled ?? false,
        live_ranking_changes_enabled:
          input.daily_learning_review?.model_governance.safety
            .live_ranking_changes_enabled ?? false,
        rollback_required_for_live_changes:
          input.daily_learning_review?.model_governance.safety
            .rollback_required_for_live_changes ?? true,
        minimum_sample_size_required:
          input.daily_learning_review?.model_governance.safety
            .minimum_sample_size_required ?? null,
        latest_change:
          input.daily_learning_review?.model_governance.latest_change?.id ??
          null,
        current_intelligence_layers: (
          input.daily_learning_review?.model_governance
            .current_intelligence_layers ?? []
        ).join(","),
        promotion_ready_changes: (
          input.daily_learning_review?.model_governance
            .promotion_ready_changes ?? []
        ).join(","),
        changes_needing_more_data: (
          input.daily_learning_review?.model_governance
            .changes_needing_more_data ?? []
        ).join(","),
        changes_by_type: JSON.stringify(
          input.daily_learning_review?.model_governance.summary
            .changes_by_type ?? {},
        ),
        changes_by_status: JSON.stringify(
          input.daily_learning_review?.model_governance.summary
            .changes_by_status ?? {},
        ),
        records: JSON.stringify(
          input.daily_learning_review?.model_governance.advisory_only_changes ??
            [],
        ),
        reason_codes: (
          input.daily_learning_review?.model_governance.reason_codes ?? []
        ).join(","),
        caution_flags: (
          input.daily_learning_review?.model_governance.caution_flags ?? []
        ).join(","),
        metadata_gaps: (
          input.daily_learning_review?.model_governance.metadata_gaps ?? []
        ).join(","),
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
