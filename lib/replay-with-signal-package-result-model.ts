export type ReplayWithSignalPackageOutcomeStatus =
  | "no_entry_triggered"
  | "target_hit"
  | "stop_hit"
  | "open_at_window_end"
  | "ambiguous_intrabar_conservative_stop"
  | "blocked"
  | "failed";

export type ReplayWithSignalPackageExecutionStatus =
  | "replay_with_signal_package_completed"
  | "not_approved"
  | "blocked_missing_candles"
  | "blocked_candle_verification_failed"
  | "blocked_signal_package_validation_failed"
  | "blocked_missing_analysis_cutoff"
  | "failed";

export type ReplayWithSignalPackageDirection = "long" | "short";

export type ReplayWithSignalPackageResult = {
  execution_status: ReplayWithSignalPackageExecutionStatus;
  outcome_status: ReplayWithSignalPackageOutcomeStatus;
  counterfactual_result_available: boolean;
  source_verification: string;
  candidate_id: string;
  source_type: string;
  source_row_id: string | null;
  ticker: string;
  interval: string;
  trading_day: string;
  analysis_cutoff: string | null;
  direction: ReplayWithSignalPackageDirection;
  planned_entry: number;
  planned_stop: number;
  planned_target: number;
  candles_read: number;
  candles_verified: number;
  lookahead_safety_passed: boolean;
  entry_touched: boolean;
  stop_touched: boolean;
  target_touched: boolean;
  entry_timestamp: string | null;
  exit_timestamp: string | null;
  exit_reason: string | null;
  gross_price_move: number | null;
  gross_r_multiple: number | null;
  replay_executed: boolean;
  synthetic_outcomes_persisted: boolean;
  scanner_behavior_changed: boolean;
  live_ranking_changed: boolean;
  recommendation_rows_mutated: boolean;
  supabase_write_executed: boolean;
  provider_call_executed: boolean;
  blockers: string[];
  warnings: string[];
};

export type ReplayWithSignalPackageResultInput = {
  source_verification?: string;
  candidate_id: string;
  source_type: string;
  source_row_id?: string | null;
  ticker: string;
  interval: string;
  trading_day: string;
  analysis_cutoff?: string | null;
  direction: ReplayWithSignalPackageDirection;
  planned_entry: number;
  planned_stop: number;
  planned_target: number;
  candles_read?: number;
  candles_verified?: number;
  lookahead_safety_passed?: boolean;
  entry_timestamp?: string | null;
  exit_timestamp?: string | null;
  gross_price_move?: number | null;
  gross_r_multiple?: number | null;
  blockers?: string[];
  warnings?: string[];
};

export type BlockedReplayWithSignalPackageResultInput =
  ReplayWithSignalPackageResultInput & {
    execution_status?: Exclude<
      ReplayWithSignalPackageExecutionStatus,
      "replay_with_signal_package_completed"
    >;
    outcome_status?: Extract<
      ReplayWithSignalPackageOutcomeStatus,
      "blocked" | "failed"
    >;
  };

export type ReplayWithSignalPackageSafetyValidation = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const interpretedOutcomeStatuses: ReplayWithSignalPackageOutcomeStatus[] = [
  "no_entry_triggered",
  "target_hit",
  "stop_hit",
  "open_at_window_end",
  "ambiguous_intrabar_conservative_stop",
];

function baseResult(
  input: ReplayWithSignalPackageResultInput,
): ReplayWithSignalPackageResult {
  return {
    execution_status: "replay_with_signal_package_completed",
    outcome_status: "open_at_window_end",
    counterfactual_result_available: true,
    source_verification: input.source_verification ?? "static_model",
    candidate_id: input.candidate_id,
    source_type: input.source_type,
    source_row_id: input.source_row_id ?? null,
    ticker: input.ticker,
    interval: input.interval,
    trading_day: input.trading_day,
    analysis_cutoff: input.analysis_cutoff ?? null,
    direction: input.direction,
    planned_entry: input.planned_entry,
    planned_stop: input.planned_stop,
    planned_target: input.planned_target,
    candles_read: input.candles_read ?? 0,
    candles_verified: input.candles_verified ?? 0,
    lookahead_safety_passed: input.lookahead_safety_passed ?? false,
    entry_touched: false,
    stop_touched: false,
    target_touched: false,
    entry_timestamp: input.entry_timestamp ?? null,
    exit_timestamp: input.exit_timestamp ?? null,
    exit_reason: null,
    gross_price_move: input.gross_price_move ?? null,
    gross_r_multiple: input.gross_r_multiple ?? null,
    replay_executed: true,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
    supabase_write_executed: false,
    provider_call_executed: false,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
  };
}

export function buildBlockedReplayWithSignalPackageResult(
  input: BlockedReplayWithSignalPackageResultInput,
): ReplayWithSignalPackageResult {
  const executionStatus = input.execution_status ?? "not_approved";

  return {
    ...baseResult(input),
    execution_status: executionStatus,
    outcome_status:
      input.outcome_status ?? (executionStatus === "failed" ? "failed" : "blocked"),
    counterfactual_result_available: false,
    lookahead_safety_passed: false,
    entry_touched: false,
    stop_touched: false,
    target_touched: false,
    entry_timestamp: null,
    exit_timestamp: null,
    exit_reason: executionStatus,
    gross_price_move: null,
    gross_r_multiple: null,
    replay_executed: false,
    blockers:
      input.blockers && input.blockers.length > 0
        ? input.blockers
        : [executionStatus],
  };
}

export function buildNoEntryReplayWithSignalPackageResult(
  input: ReplayWithSignalPackageResultInput,
): ReplayWithSignalPackageResult {
  return {
    ...baseResult(input),
    outcome_status: "no_entry_triggered",
    counterfactual_result_available: true,
    entry_touched: false,
    stop_touched: false,
    target_touched: false,
    entry_timestamp: null,
    exit_reason: "no_entry_triggered",
    gross_price_move: null,
    gross_r_multiple: null,
  };
}

export function buildOpenAtWindowEndReplayWithSignalPackageResult(
  input: ReplayWithSignalPackageResultInput,
): ReplayWithSignalPackageResult {
  return {
    ...baseResult(input),
    outcome_status: "open_at_window_end",
    counterfactual_result_available: true,
    entry_touched: true,
    stop_touched: false,
    target_touched: false,
    exit_reason: "open_at_window_end",
  };
}

export function buildTargetHitReplayWithSignalPackageResult(
  input: ReplayWithSignalPackageResultInput,
): ReplayWithSignalPackageResult {
  return {
    ...baseResult(input),
    outcome_status: "target_hit",
    counterfactual_result_available: true,
    entry_touched: true,
    stop_touched: false,
    target_touched: true,
    exit_reason: "target_hit",
  };
}

export function buildStopHitReplayWithSignalPackageResult(
  input: ReplayWithSignalPackageResultInput,
): ReplayWithSignalPackageResult {
  return {
    ...baseResult(input),
    outcome_status: "stop_hit",
    counterfactual_result_available: true,
    entry_touched: true,
    stop_touched: true,
    target_touched: false,
    exit_reason: "stop_hit",
  };
}

export function buildAmbiguousIntrabarReplayWithSignalPackageResult(
  input: ReplayWithSignalPackageResultInput,
): ReplayWithSignalPackageResult {
  return {
    ...baseResult(input),
    outcome_status: "ambiguous_intrabar_conservative_stop",
    counterfactual_result_available: true,
    entry_touched: true,
    stop_touched: true,
    target_touched: true,
    exit_reason: "ambiguous_intrabar_conservative_stop",
  };
}

export function validateReplayWithSignalPackageResultSafety(
  result: ReplayWithSignalPackageResult,
): ReplayWithSignalPackageSafetyValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (result.synthetic_outcomes_persisted) {
    errors.push("synthetic_outcomes_persisted_must_be_false");
  }
  if (result.scanner_behavior_changed) {
    errors.push("scanner_behavior_changed_must_be_false");
  }
  if (result.live_ranking_changed) {
    errors.push("live_ranking_changed_must_be_false");
  }
  if (result.recommendation_rows_mutated) {
    errors.push("recommendation_rows_mutated_must_be_false");
  }
  if (result.supabase_write_executed) {
    errors.push("supabase_write_executed_must_be_false");
  }
  if (result.provider_call_executed) {
    errors.push("provider_call_executed_must_be_false");
  }

  const completed =
    result.execution_status === "replay_with_signal_package_completed";
  const interpreted = interpretedOutcomeStatuses.includes(result.outcome_status);
  if (result.replay_executed && (!completed || !interpreted)) {
    errors.push("replay_executed_only_allowed_for_completed_interpretable_dry_run");
  }
  if (result.counterfactual_result_available && !interpreted) {
    errors.push("counterfactual_result_available_requires_interpretable_outcome");
  }
  if (!result.counterfactual_result_available && interpreted) {
    warnings.push("interpretable_outcome_without_counterfactual_result_available");
  }

  const blockedOrFailed =
    result.outcome_status === "blocked" ||
    result.outcome_status === "failed" ||
    result.execution_status === "failed" ||
    result.execution_status.startsWith("blocked_") ||
    result.execution_status === "not_approved";
  if (blockedOrFailed && result.blockers.length === 0) {
    errors.push("blockers_required_for_blocked_or_failed_result");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
