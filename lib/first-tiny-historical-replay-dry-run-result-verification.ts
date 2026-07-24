import {
  firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker,
  type FirstTinyHistoricalReplayDryRunExecutionStatus,
} from "@/lib/first-tiny-historical-replay-dry-run-execute";
import { firstTinyHistoricalReplayDryRunSourceVerification } from "@/lib/first-tiny-historical-replay-dry-run-plan";

export const firstTinyHistoricalReplayDryRunResultVerificationMarker =
  "action_301_first_tiny_replay_dry_run_result_verification";

export type FirstTinyHistoricalReplayDryRunResultVerificationStatus =
  "replay_dry_run_input_verified_no_signal_package";

export type FirstTinyHistoricalReplayDryRunResultVerificationEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyHistoricalReplayDryRunResultVerificationSummary = {
  verification_status: FirstTinyHistoricalReplayDryRunResultVerificationStatus;
  result_marker: typeof firstTinyHistoricalReplayDryRunResultVerificationMarker;
  route_build_marker: typeof firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker;
  execution_status: Extract<
    FirstTinyHistoricalReplayDryRunExecutionStatus,
    "replay_dry_run_completed_no_signal_package"
  >;
  source_verification: typeof firstTinyHistoricalReplayDryRunSourceVerification;
  source_table: "historical_candles";
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  expected_candle_rows: 73;
  candles_read: 73;
  candles_verified: 73;
  signal_package_available: false;
  lookahead_safety_passed: true;
  replay_executed: true;
  counterfactual_result_available: false;
  synthetic_outcomes_persisted: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  recommendation_rows_mutated: false;
  scanner_universe_changed: false;
  thresholds_changed: false;
  outcome_evaluation_persistence_changed: false;
  learning_acceleration_changed: false;
  add_trade_affected: false;
  broker_execution_affected: false;
  risk_changed: false;
  ready_for_signal_package_replay_planning: true;
  synthetic_outcome_persistence_allowed_now: false;
  scanner_use_allowed_now: false;
  ranking_change_allowed_now: false;
  replay_dry_run_approval_signal_present: boolean;
  replay_dry_run_approval_signal_still_enabled: boolean;
  approval_signal_source: "server_env" | "none";
  conclusion: "first_tiny_replay_dry_run_input_verified_no_signal_package";
  blockers: [];
  warnings: string[];
  recommended_next_steps: [
    "disable_replay_dry_run_approval_signal_after_success",
    "plan_signal_package_for_replay",
    "require_separate_approval_before_synthetic_outcome_persistence_or_scanner_use",
  ];
};

function normalized(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function buildFirstTinyHistoricalReplayDryRunResultVerification(
  env: FirstTinyHistoricalReplayDryRunResultVerificationEnv = process.env,
): FirstTinyHistoricalReplayDryRunResultVerificationSummary {
  const approvalValue = normalized(
    env.TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED,
  );
  const approvalSignalPresent = approvalValue.length > 0;
  const approvalSignalStillEnabled = approvalValue === "true";

  return {
    verification_status: "replay_dry_run_input_verified_no_signal_package",
    result_marker: firstTinyHistoricalReplayDryRunResultVerificationMarker,
    route_build_marker: firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker,
    execution_status: "replay_dry_run_completed_no_signal_package",
    source_verification: firstTinyHistoricalReplayDryRunSourceVerification,
    source_table: "historical_candles",
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    expected_candle_rows: 73,
    candles_read: 73,
    candles_verified: 73,
    signal_package_available: false,
    lookahead_safety_passed: true,
    replay_executed: true,
    counterfactual_result_available: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    recommendation_rows_mutated: false,
    scanner_universe_changed: false,
    thresholds_changed: false,
    outcome_evaluation_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_affected: false,
    broker_execution_affected: false,
    risk_changed: false,
    ready_for_signal_package_replay_planning: true,
    synthetic_outcome_persistence_allowed_now: false,
    scanner_use_allowed_now: false,
    ranking_change_allowed_now: false,
    replay_dry_run_approval_signal_present: approvalSignalPresent,
    replay_dry_run_approval_signal_still_enabled: approvalSignalStillEnabled,
    approval_signal_source: approvalSignalPresent ? "server_env" : "none",
    conclusion: "first_tiny_replay_dry_run_input_verified_no_signal_package",
    blockers: [],
    warnings: approvalSignalStillEnabled
      ? ["disable_replay_dry_run_approval_signal_after_success"]
      : [],
    recommended_next_steps: [
      "disable_replay_dry_run_approval_signal_after_success",
      "plan_signal_package_for_replay",
      "require_separate_approval_before_synthetic_outcome_persistence_or_scanner_use",
    ],
  };
}
