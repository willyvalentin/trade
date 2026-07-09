import {
  buildFirstTinyCandlePersistenceResultVerification,
  type FirstTinyCandlePersistenceResultVerificationSummary,
} from "@/lib/first-tiny-historical-candle-persistence-result-verification";
import {
  buildFirstTinyHistoricalReplayDryRunResultVerification,
  type FirstTinyHistoricalReplayDryRunResultVerificationSummary,
} from "@/lib/first-tiny-historical-replay-dry-run-result-verification";

export const firstTinyHistoricalReplaySignalPackageDiscoveryPlanMarker =
  "action_302_first_tiny_replay_signal_package_discovery_plan";

export const firstTinyHistoricalReplaySignalPackageDiscoverySourceVerification =
  "first_tiny_replay_dry_run_input_verified_no_signal_package";

export type FirstTinyHistoricalReplaySignalPackageDiscoveryPlanStatus =
  "planned";

export type FirstTinyHistoricalReplaySignalPackageDiscoveryPlanSummary = {
  discovery_plan_status: FirstTinyHistoricalReplaySignalPackageDiscoveryPlanStatus;
  plan_marker: typeof firstTinyHistoricalReplaySignalPackageDiscoveryPlanMarker;
  dry_run_only: true;
  source_verification: typeof firstTinyHistoricalReplaySignalPackageDiscoverySourceVerification;
  target_replay_scope: {
    ticker: "AAPL";
    interval: "5min";
    trading_day: "2026-07-08";
    candle_source_table: "historical_candles";
    candle_rows_verified: 73;
    candle_window_utc: "2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z";
    candle_window_ny: "09:45 -> 15:45";
  };
  signal_package_available_now: false;
  signal_package_created_now: false;
  replay_executed: false;
  synthetic_outcomes_persisted: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  supabase_read_executed: false;
  supabase_write_executed: false;
  recommendation_rows_mutated: false;
  scanner_universe_changed: false;
  ranking_change_allowed_now: false;
  scanner_use_allowed_now: false;
  synthetic_outcome_persistence_allowed_now: false;
  requires_separate_operator_approval: true;
  compatible_package_requirements: [
    "signal_package_id",
    "source_type_existing_recommendation_snapshot_static_replay_fixture_or_manually_reviewed_signal_package",
    "ticker_aapl",
    "trading_day_2026_07_08",
    "interval_5min",
    "generated_at_or_analysis_cutoff_timestamp",
    "direction_long_or_short_if_applicable",
    "entry_type",
    "entry_price_or_rule",
    "stop_price_or_rule",
    "target_price_or_rule",
    "risk_reward_metadata_if_available",
    "confidence_or_tier_if_available",
    "setup_label_if_available",
    "source_recommendation_or_snapshot_id_if_derived",
    "lookahead_safety_metadata",
    "no_broker_execution_fields_required",
  ];
  candidate_discovery_sources: [
    "existing_recommendation_rows_for_aapl_2026_07_08",
    "recommendation_snapshots_for_aapl_2026_07_08",
    "static_verified_replay_fixture_if_later_created",
    "manual_operator_reviewed_package_if_later_created",
  ];
  blocking_reasons: [
    "replay_signal_package_missing",
    "cannot_compute_counterfactual_without_entry_stop_target",
    "synthetic_outcome_persistence_not_allowed",
    "scanner_and_ranking_effects_disabled",
  ];
  recommended_next_steps: [
    "review_signal_package_requirements",
    "add_signal_package_discovery_readback",
    "or_create_static_signal_package_plan",
    "keep_synthetic_outcomes_scanner_and_ranking_disabled",
  ];
};

export type FirstTinyHistoricalReplaySignalPackageDiscoveryPlanInput = {
  candle_persistence_result?: FirstTinyCandlePersistenceResultVerificationSummary | null;
  replay_result_verification?: FirstTinyHistoricalReplayDryRunResultVerificationSummary | null;
};

export function buildFirstTinyHistoricalReplaySignalPackageDiscoveryPlan(
  input: FirstTinyHistoricalReplaySignalPackageDiscoveryPlanInput = {},
): FirstTinyHistoricalReplaySignalPackageDiscoveryPlanSummary {
  const candleResult =
    input.candle_persistence_result ??
    buildFirstTinyCandlePersistenceResultVerification();
  const replayResult =
    input.replay_result_verification ??
    buildFirstTinyHistoricalReplayDryRunResultVerification();

  return {
    discovery_plan_status: "planned",
    plan_marker: firstTinyHistoricalReplaySignalPackageDiscoveryPlanMarker,
    dry_run_only: true,
    source_verification:
      firstTinyHistoricalReplaySignalPackageDiscoverySourceVerification,
    target_replay_scope: {
      ticker: replayResult.ticker,
      interval: replayResult.interval,
      trading_day: replayResult.trading_day,
      candle_source_table: candleResult.target_table,
      candle_rows_verified: replayResult.candles_verified,
      candle_window_utc:
        "2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z",
      candle_window_ny: "09:45 -> 15:45",
    },
    signal_package_available_now: false,
    signal_package_created_now: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    recommendation_rows_mutated: false,
    scanner_universe_changed: false,
    ranking_change_allowed_now: false,
    scanner_use_allowed_now: false,
    synthetic_outcome_persistence_allowed_now: false,
    requires_separate_operator_approval: true,
    compatible_package_requirements: [
      "signal_package_id",
      "source_type_existing_recommendation_snapshot_static_replay_fixture_or_manually_reviewed_signal_package",
      "ticker_aapl",
      "trading_day_2026_07_08",
      "interval_5min",
      "generated_at_or_analysis_cutoff_timestamp",
      "direction_long_or_short_if_applicable",
      "entry_type",
      "entry_price_or_rule",
      "stop_price_or_rule",
      "target_price_or_rule",
      "risk_reward_metadata_if_available",
      "confidence_or_tier_if_available",
      "setup_label_if_available",
      "source_recommendation_or_snapshot_id_if_derived",
      "lookahead_safety_metadata",
      "no_broker_execution_fields_required",
    ],
    candidate_discovery_sources: [
      "existing_recommendation_rows_for_aapl_2026_07_08",
      "recommendation_snapshots_for_aapl_2026_07_08",
      "static_verified_replay_fixture_if_later_created",
      "manual_operator_reviewed_package_if_later_created",
    ],
    blocking_reasons: [
      "replay_signal_package_missing",
      "cannot_compute_counterfactual_without_entry_stop_target",
      "synthetic_outcome_persistence_not_allowed",
      "scanner_and_ranking_effects_disabled",
    ],
    recommended_next_steps: [
      "review_signal_package_requirements",
      "add_signal_package_discovery_readback",
      "or_create_static_signal_package_plan",
      "keep_synthetic_outcomes_scanner_and_ranking_disabled",
    ],
  };
}
