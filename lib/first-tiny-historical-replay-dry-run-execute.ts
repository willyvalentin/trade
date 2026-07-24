import {
  buildFirstTinyHistoricalReplayDryRunApproval,
  type FirstTinyHistoricalReplayDryRunApprovalEnv,
  type FirstTinyHistoricalReplayDryRunApprovalSummary,
} from "@/lib/first-tiny-historical-replay-dry-run-approval";
import {
  buildFirstTinyHistoricalReplayDryRunPlan,
  firstTinyHistoricalReplayDryRunSourceVerification,
  type FirstTinyHistoricalReplayDryRunPlanSummary,
} from "@/lib/first-tiny-historical-replay-dry-run-plan";
import {
  verifyFirstTinyCandlePersistenceReadback,
  type FirstTinyCandlePersistenceReadbackSupabaseClient,
} from "@/lib/first-tiny-historical-candle-persistence-readback-verification";

export const firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker =
  "action_300_first_tiny_replay_dry_run_execute_attempt";

export type FirstTinyHistoricalReplayDryRunExecutionStatus =
  | "not_approved"
  | "ready_with_valid_signal"
  | "replay_dry_run_completed_no_signal_package"
  | "replay_dry_run_completed_counterfactual"
  | "replay_dry_run_blocked_missing_signal_context"
  | "replay_dry_run_blocked_missing_analysis_cutoff"
  | "blocked"
  | "failed";

export type FirstTinyHistoricalReplayDryRunSignalPackage = {
  available: boolean;
  analysis_cutoff?: string | null;
  generated_signal_time?: string | null;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  direction?: "long" | "short" | null;
};

export type FirstTinyHistoricalReplayDryRunExecuteInput = {
  execute_replay_dry_run?: boolean | null;
  env?: FirstTinyHistoricalReplayDryRunApprovalEnv | null;
  replay_plan?: FirstTinyHistoricalReplayDryRunPlanSummary | null;
  approval?: FirstTinyHistoricalReplayDryRunApprovalSummary | null;
  supabase_client?: FirstTinyCandlePersistenceReadbackSupabaseClient | null;
  signal_package?: FirstTinyHistoricalReplayDryRunSignalPackage | null;
};

export type FirstTinyHistoricalReplayDryRunExecuteSummary = {
  execution_status: FirstTinyHistoricalReplayDryRunExecutionStatus;
  route_build_marker: typeof firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker;
  source_verification: typeof firstTinyHistoricalReplayDryRunSourceVerification;
  source_table: "historical_candles";
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  expected_candle_rows: 73;
  candles_read: number;
  candles_verified: number;
  signal_package_available: boolean;
  lookahead_safety_passed: boolean;
  replay_executed: boolean;
  counterfactual_result_available: boolean;
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
  approval_status: FirstTinyHistoricalReplayDryRunApprovalSummary["approval_status"];
  replay_allowed_now: boolean;
  synthetic_outcome_persistence_allowed_now: false;
  scanner_use_allowed_now: false;
  ranking_change_allowed_now: false;
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
};

const noMutationNextSteps = [
  "configure_valid_replay_dry_run_approval_signal",
  "require_explicit_operator_execute_call",
  "keep_synthetic_outcomes_scanner_and_ranking_disabled",
] as const;
const successNextSteps = [
  "disable_replay_dry_run_approval_signal_after_success",
  "review_replay_dry_run_result",
  "require_separate_approval_before_synthetic_outcome_persistence_or_scanner_use",
] as const;

function baseSummary(input: {
  status: FirstTinyHistoricalReplayDryRunExecutionStatus;
  approval: FirstTinyHistoricalReplayDryRunApprovalSummary;
  candlesRead?: number;
  candlesVerified?: number;
  signalPackageAvailable?: boolean;
  lookaheadSafetyPassed?: boolean;
  replayExecuted?: boolean;
  counterfactualResultAvailable?: boolean;
  blockers?: string[];
  warnings?: string[];
  recommendedNextSteps?: readonly string[];
}): FirstTinyHistoricalReplayDryRunExecuteSummary {
  return {
    execution_status: input.status,
    route_build_marker: firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker,
    source_verification: firstTinyHistoricalReplayDryRunSourceVerification,
    source_table: "historical_candles",
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    expected_candle_rows: 73,
    candles_read: input.candlesRead ?? 0,
    candles_verified: input.candlesVerified ?? 0,
    signal_package_available: input.signalPackageAvailable ?? false,
    lookahead_safety_passed: input.lookaheadSafetyPassed ?? false,
    replay_executed: input.replayExecuted ?? false,
    counterfactual_result_available:
      input.counterfactualResultAvailable ?? false,
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
    approval_status: input.approval.approval_status,
    replay_allowed_now:
      input.status === "replay_dry_run_completed_no_signal_package" ||
      input.status === "replay_dry_run_completed_counterfactual",
    synthetic_outcome_persistence_allowed_now: false,
    scanner_use_allowed_now: false,
    ranking_change_allowed_now: false,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    recommended_next_steps: [
      ...(input.recommendedNextSteps ?? noMutationNextSteps),
    ],
  };
}

function hasCompleteCounterfactualSignal(
  signal: FirstTinyHistoricalReplayDryRunSignalPackage,
) {
  return (
    signal.available === true &&
    typeof signal.entry === "number" &&
    Number.isFinite(signal.entry) &&
    typeof signal.stop === "number" &&
    Number.isFinite(signal.stop) &&
    typeof signal.target === "number" &&
    Number.isFinite(signal.target) &&
    (signal.direction === "long" || signal.direction === "short")
  );
}

export function buildFirstTinyHistoricalReplayDryRunExecuteReadiness(
  input: FirstTinyHistoricalReplayDryRunExecuteInput = {},
): FirstTinyHistoricalReplayDryRunExecuteSummary {
  const plan = input.replay_plan ?? buildFirstTinyHistoricalReplayDryRunPlan();
  const approval =
    input.approval ??
    buildFirstTinyHistoricalReplayDryRunApproval({
      env: input.env ?? undefined,
      replay_plan: plan,
    });

  if (approval.approval_status === "valid_for_future_replay_dry_run") {
    return baseSummary({
      status: "ready_with_valid_signal",
      approval,
      warnings: ["explicit_execute_route_call_required"],
      recommendedNextSteps: [
        "require_explicit_operator_execute_call",
        "keep_synthetic_outcomes_scanner_and_ranking_disabled",
      ],
    });
  }

  return baseSummary({
    status: "not_approved",
    approval,
    blockers:
      approval.approval_status === "invalid"
        ? approval.blockers
        : ["valid_replay_dry_run_approval_signal_required"],
  });
}

export async function executeFirstTinyHistoricalReplayDryRun(
  input: FirstTinyHistoricalReplayDryRunExecuteInput = {},
): Promise<FirstTinyHistoricalReplayDryRunExecuteSummary> {
  const plan = input.replay_plan ?? buildFirstTinyHistoricalReplayDryRunPlan();
  const approval =
    input.approval ??
    buildFirstTinyHistoricalReplayDryRunApproval({
      env: input.env ?? undefined,
      replay_plan: plan,
    });

  if (approval.approval_status !== "valid_for_future_replay_dry_run") {
    return baseSummary({
      status: "not_approved",
      approval,
      blockers:
        approval.approval_status === "invalid"
          ? approval.blockers
          : ["valid_replay_dry_run_approval_signal_required"],
    });
  }

  if (input.execute_replay_dry_run !== true) {
    return baseSummary({
      status: "ready_with_valid_signal",
      approval,
      warnings: ["explicit_execute_replay_dry_run_true_required"],
      recommendedNextSteps: [
        "require_explicit_operator_execute_call",
        "keep_synthetic_outcomes_scanner_and_ranking_disabled",
      ],
    });
  }

  if (!input.supabase_client) {
    return baseSummary({
      status: "blocked",
      approval,
      blockers: ["supabase_service_role_unavailable"],
    });
  }

  const readback = await verifyFirstTinyCandlePersistenceReadback({
    supabase_client: input.supabase_client,
  });

  if (!readback.readback_verified || readback.matched_rows !== 73) {
    return baseSummary({
      status: "blocked",
      approval,
      candlesRead: readback.readback_rows,
      candlesVerified: readback.matched_rows,
      blockers: ["persisted_candle_readback_not_verified"],
      warnings: readback.warnings,
    });
  }

  const signal = input.signal_package;

  if (!signal || signal.available !== true) {
    return baseSummary({
      status: "replay_dry_run_completed_no_signal_package",
      approval,
      candlesRead: readback.readback_rows,
      candlesVerified: readback.matched_rows,
      signalPackageAvailable: false,
      lookaheadSafetyPassed: true,
      replayExecuted: true,
      recommendedNextSteps: successNextSteps,
    });
  }

  if (!signal.analysis_cutoff || !signal.generated_signal_time) {
    return baseSummary({
      status: "replay_dry_run_blocked_missing_analysis_cutoff",
      approval,
      candlesRead: readback.readback_rows,
      candlesVerified: readback.matched_rows,
      signalPackageAvailable: true,
      blockers: ["replay_dry_run_blocked_missing_analysis_cutoff"],
    });
  }

  if (!hasCompleteCounterfactualSignal(signal)) {
    return baseSummary({
      status: "replay_dry_run_blocked_missing_signal_context",
      approval,
      candlesRead: readback.readback_rows,
      candlesVerified: readback.matched_rows,
      signalPackageAvailable: true,
      lookaheadSafetyPassed: true,
      blockers: ["replay_dry_run_blocked_missing_signal_context"],
    });
  }

  return baseSummary({
    status: "replay_dry_run_completed_counterfactual",
    approval,
    candlesRead: readback.readback_rows,
    candlesVerified: readback.matched_rows,
    signalPackageAvailable: true,
    lookaheadSafetyPassed: true,
    replayExecuted: true,
    counterfactualResultAvailable: true,
    recommendedNextSteps: successNextSteps,
  });
}
