import {
  buildFirstTinyCandlePersistenceResultVerification,
  type FirstTinyCandlePersistenceResultVerificationSummary,
} from "@/lib/first-tiny-historical-candle-persistence-result-verification";
import {
  verifyFirstTinyCandlePersistenceReadback,
  type FirstTinyCandlePersistenceReadbackSupabaseClient,
} from "@/lib/first-tiny-historical-candle-persistence-readback-verification";
import {
  buildFirstTinyHistoricalReplaySignalPackageSelectionApproval,
  type FirstTinySignalPackageSelectionApprovalEnv,
  type FirstTinySignalPackageSelectionApprovalSummary,
} from "@/lib/first-tiny-historical-replay-signal-package-selection-approval";
import {
  buildFirstTinyHistoricalReplaySignalPackageSelectionPlan,
  type FirstTinySignalPackageSelectionPlanSummary,
} from "@/lib/first-tiny-historical-replay-signal-package-selection-plan";

export const firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker =
  "action_307_first_tiny_replay_with_signal_package_dry_run_execute_attempt";

export type FirstTinyReplayWithSignalPackageExecutionStatus =
  | "replay_with_signal_package_completed"
  | "not_approved"
  | "ready_with_valid_signal"
  | "blocked_missing_candles"
  | "blocked_candle_verification_failed"
  | "blocked_signal_package_validation_failed"
  | "blocked_missing_analysis_cutoff"
  | "failed";

export type FirstTinyReplayWithSignalPackageOutcomeStatus =
  | "pending"
  | "no_entry_triggered"
  | "target_hit"
  | "stop_hit"
  | "open_at_window_end"
  | "ambiguous_intrabar_conservative_stop"
  | "blocked";

export type FirstTinyReplayWithSignalPackageCandle = {
  provider?: unknown;
  ticker?: unknown;
  interval?: unknown;
  timestamp?: unknown;
  open?: unknown;
  high?: unknown;
  low?: unknown;
  close?: unknown;
  volume?: unknown;
  adjusted?: unknown;
  trading_day?: unknown;
  session?: unknown;
  timezone?: unknown;
  fetch_run_id?: unknown;
};

export type FirstTinyReplayWithSignalPackageDryRunInput = {
  execute_replay_with_signal_package_dry_run?: boolean | null;
  env?: FirstTinySignalPackageSelectionApprovalEnv | null;
  candle_persistence_result?: FirstTinyCandlePersistenceResultVerificationSummary | null;
  selection_plan?: FirstTinySignalPackageSelectionPlanSummary | null;
  selection_approval?: FirstTinySignalPackageSelectionApprovalSummary | null;
  supabase_client?: FirstTinyCandlePersistenceReadbackSupabaseClient | null;
};

export type FirstTinyReplayWithSignalPackageDryRunSummary = {
  route_build_marker: typeof firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker;
  execution_status: FirstTinyReplayWithSignalPackageExecutionStatus;
  approval_status: FirstTinySignalPackageSelectionApprovalSummary["approval_status"];
  selected_candidate_id: "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
  source_type: "recommendation_row";
  source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
  source_table: "historical_candles";
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  expected_candle_rows: 73;
  candle_window_start: "2026-07-08T13:45:00.000Z";
  candle_window_end: "2026-07-08T19:45:00.000Z";
  analysis_cutoff: "2026-07-08T13:49:19.521608+00:00";
  direction: "long";
  planned_entry: 304.86;
  planned_stop: 295.62;
  planned_target: 334.12;
  confidence_or_tier: "Low";
  setup_label: "UNKNOWN";
  candles_read: number;
  candles_verified: number;
  lookahead_safety_passed: boolean;
  counterfactual_result_available: boolean;
  replay_outcome_status: FirstTinyReplayWithSignalPackageOutcomeStatus;
  entry_touched: boolean;
  stop_touched: boolean;
  target_touched: boolean;
  entry_timestamp: string | null;
  exit_timestamp: string | null;
  exit_reason: string | null;
  gross_r_multiple: number | null;
  gross_price_move: number | null;
  replay_executed: boolean;
  replay_allowed_now: boolean;
  synthetic_outcomes_persisted: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  recommendation_rows_mutated: false;
  supabase_read_executed: boolean;
  supabase_write_executed: false;
  scanner_universe_changed: false;
  thresholds_changed: false;
  outcome_evaluation_persistence_changed: false;
  learning_acceleration_changed: false;
  add_trade_affected: false;
  broker_execution_affected: false;
  risk_changed: false;
  synthetic_outcome_persistence_allowed_now: false;
  scanner_use_allowed_now: false;
  ranking_change_allowed_now: false;
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
};

type QueryBuilder = {
  select?: (...args: unknown[]) => QueryBuilder;
  eq?: (...args: unknown[]) => QueryBuilder;
  gte?: (...args: unknown[]) => QueryBuilder;
  lte?: (...args: unknown[]) => QueryBuilder;
  order?: (...args: unknown[]) => QueryBuilder;
  limit?: (...args: unknown[]) => QueryBuilder;
  then?: PromiseLike<{ data?: unknown; error?: unknown }>["then"];
};

type NormalizedCandle = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

const expectedCandidateId =
  "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557" as const;
const expectedSourceRowId = "7dd59e66-7e54-4d35-92f9-5cc1ae11c557" as const;
const expectedFetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f" as const;
const expectedFirstTimestamp = "2026-07-08T13:45:00.000Z" as const;
const expectedLastTimestamp = "2026-07-08T19:45:00.000Z" as const;
const analysisCutoff = "2026-07-08T13:49:19.521608+00:00" as const;
const plannedEntry = 304.86 as const;
const plannedStop = 295.62 as const;
const plannedTarget = 334.12 as const;
const riskPerShare = plannedEntry - plannedStop;

const defaultNextSteps = [
  "configure_valid_signal_package_selection_approval",
  "require_explicit_execute_replay_with_signal_package_dry_run_true",
  "keep_synthetic_outcomes_scanner_and_ranking_disabled",
] as const;
const successNextSteps = [
  "disable_signal_package_selection_approval_after_success",
  "review_replay_with_signal_package_result",
  "require_separate_approval_before_synthetic_outcome_persistence_or_scanner_use",
] as const;

function asBuilder(value: unknown): QueryBuilder {
  return (value ?? {}) as QueryBuilder;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isoTimestamp(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString();
}

function normalizeCandle(row: unknown): NormalizedCandle | null {
  if (typeof row !== "object" || row === null) return null;
  const data = row as Record<string, unknown>;
  const timestamp = isoTimestamp(data.timestamp);
  const open = numberValue(data.open);
  const high = numberValue(data.high);
  const low = numberValue(data.low);
  const close = numberValue(data.close);

  if (
    timestamp === null ||
    open === null ||
    high === null ||
    low === null ||
    close === null ||
    high < low
  ) {
    return null;
  }

  return { timestamp, open, high, low, close };
}

async function resolveQuery(builder: QueryBuilder) {
  if (typeof builder.then !== "function") {
    return { data: null, error: new Error("query_readback_unavailable") };
  }
  return builder as unknown as Promise<{ data?: unknown; error?: unknown }>;
}

async function readPersistedCandles(input: {
  client: FirstTinyCandlePersistenceReadbackSupabaseClient;
}) {
  const query = asBuilder(input.client.from("historical_candles"));
  const selected =
    query.select?.(
      "provider,ticker,interval,timestamp,open,high,low,close,volume,adjusted,trading_day,session,timezone,fetch_run_id",
    ) ?? query;
  const filtered =
    selected
      .eq?.("provider", "twelve_data")
      ?.eq?.("ticker", "AAPL")
      ?.eq?.("interval", "5min")
      ?.eq?.("trading_day", "2026-07-08")
      ?.eq?.("adjusted", false)
      ?.eq?.("fetch_run_id", expectedFetchRunId)
      ?.gte?.("timestamp", expectedFirstTimestamp)
      ?.lte?.("timestamp", expectedLastTimestamp) ?? selected;
  const ordered = filtered.order?.("timestamp", { ascending: true }) ?? filtered;
  const limited = ordered.limit?.(100) ?? ordered;
  const result = await resolveQuery(limited);
  return {
    ...result,
    rows: Array.isArray(result.data) ? result.data : [],
  };
}

function errorMessage(error: unknown) {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : JSON.stringify(error);
  }
  return String(error);
}

function validateSelectedSignalPackage(input: {
  plan: FirstTinySignalPackageSelectionPlanSummary;
  approval: FirstTinySignalPackageSelectionApprovalSummary;
}) {
  const blockers: string[] = [];
  const candidate = input.plan.recommended_candidate;

  if (candidate.candidate_id !== expectedCandidateId) {
    blockers.push("candidate_id_mismatch");
  }
  if (candidate.source_type !== "recommendation_row") {
    blockers.push("source_type_mismatch");
  }
  if (candidate.source_row_id !== expectedSourceRowId) {
    blockers.push("source_row_id_mismatch");
  }
  if (input.plan.ticker !== "AAPL") blockers.push("ticker_mismatch");
  if (input.plan.interval !== "5min") blockers.push("interval_mismatch");
  if (input.plan.trading_day !== "2026-07-08") {
    blockers.push("trading_day_mismatch");
  }
  if (candidate.analysis_cutoff !== analysisCutoff) {
    blockers.push("analysis_cutoff_mismatch");
  }
  if (candidate.direction !== "long") blockers.push("direction_mismatch");
  if (candidate.entry !== plannedEntry) blockers.push("entry_mismatch");
  if (candidate.stop !== plannedStop) blockers.push("stop_mismatch");
  if (candidate.target !== plannedTarget) blockers.push("target_mismatch");
  if (input.approval.selected_candidate_authorized_now !== true) {
    blockers.push("selected_candidate_not_authorized");
  }

  return blockers;
}

function roundMetric(value: number) {
  return Number(value.toFixed(6));
}

export function simulateFirstTinyReplayWithSignalPackage(
  rows: FirstTinyReplayWithSignalPackageCandle[],
): Pick<
  FirstTinyReplayWithSignalPackageDryRunSummary,
  | "replay_outcome_status"
  | "entry_touched"
  | "stop_touched"
  | "target_touched"
  | "entry_timestamp"
  | "exit_timestamp"
  | "exit_reason"
  | "gross_r_multiple"
  | "gross_price_move"
  | "lookahead_safety_passed"
  | "counterfactual_result_available"
> {
  const cutoffMs = Date.parse(analysisCutoff);
  const candles = rows
    .map(normalizeCandle)
    .filter((row): row is NormalizedCandle => row !== null)
    .filter((row) => Date.parse(row.timestamp) > cutoffMs)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp));

  if (candles.length === 0) {
    return {
      replay_outcome_status: "blocked",
      entry_touched: false,
      stop_touched: false,
      target_touched: false,
      entry_timestamp: null,
      exit_timestamp: null,
      exit_reason: null,
      gross_r_multiple: null,
      gross_price_move: null,
      lookahead_safety_passed: false,
      counterfactual_result_available: false,
    };
  }

  let entryTimestamp: string | null = null;

  for (const candle of candles) {
    if (!entryTimestamp && candle.high >= plannedEntry) {
      entryTimestamp = candle.timestamp;
    }
    if (!entryTimestamp) continue;

    const stopTouched = candle.low <= plannedStop;
    const targetTouched = candle.high >= plannedTarget;

    if (stopTouched && targetTouched) {
      return {
        replay_outcome_status: "ambiguous_intrabar_conservative_stop",
        entry_touched: true,
        stop_touched: true,
        target_touched: true,
        entry_timestamp: entryTimestamp,
        exit_timestamp: candle.timestamp,
        exit_reason: "ambiguous_intrabar_conservative_stop",
        gross_r_multiple: -1,
        gross_price_move: roundMetric(plannedStop - plannedEntry),
        lookahead_safety_passed: true,
        counterfactual_result_available: true,
      };
    }
    if (stopTouched) {
      return {
        replay_outcome_status: "stop_hit",
        entry_touched: true,
        stop_touched: true,
        target_touched: false,
        entry_timestamp: entryTimestamp,
        exit_timestamp: candle.timestamp,
        exit_reason: "stop_hit",
        gross_r_multiple: -1,
        gross_price_move: roundMetric(plannedStop - plannedEntry),
        lookahead_safety_passed: true,
        counterfactual_result_available: true,
      };
    }
    if (targetTouched) {
      return {
        replay_outcome_status: "target_hit",
        entry_touched: true,
        stop_touched: false,
        target_touched: true,
        entry_timestamp: entryTimestamp,
        exit_timestamp: candle.timestamp,
        exit_reason: "target_hit",
        gross_r_multiple: roundMetric((plannedTarget - plannedEntry) / riskPerShare),
        gross_price_move: roundMetric(plannedTarget - plannedEntry),
        lookahead_safety_passed: true,
        counterfactual_result_available: true,
      };
    }
  }

  if (!entryTimestamp) {
    return {
      replay_outcome_status: "no_entry_triggered",
      entry_touched: false,
      stop_touched: false,
      target_touched: false,
      entry_timestamp: null,
      exit_timestamp: null,
      exit_reason: "no_entry_triggered",
      gross_r_multiple: null,
      gross_price_move: null,
      lookahead_safety_passed: true,
      counterfactual_result_available: true,
    };
  }

  const last = candles.at(-1)!;
  const priceMove = last.close - plannedEntry;
  return {
    replay_outcome_status: "open_at_window_end",
    entry_touched: true,
    stop_touched: false,
    target_touched: false,
    entry_timestamp: entryTimestamp,
    exit_timestamp: last.timestamp,
    exit_reason: "window_end_mark_to_close",
    gross_r_multiple: roundMetric(priceMove / riskPerShare),
    gross_price_move: roundMetric(priceMove),
    lookahead_safety_passed: true,
    counterfactual_result_available: true,
  };
}

function baseSummary(input: {
  status: FirstTinyReplayWithSignalPackageExecutionStatus;
  approval: FirstTinySignalPackageSelectionApprovalSummary;
  candlesRead?: number;
  candlesVerified?: number;
  supabaseReadExecuted?: boolean;
  replayExecuted?: boolean;
  replayAllowedNow?: boolean;
  simulation?: ReturnType<typeof simulateFirstTinyReplayWithSignalPackage>;
  blockers?: string[];
  warnings?: string[];
  recommendedNextSteps?: readonly string[];
}): FirstTinyReplayWithSignalPackageDryRunSummary {
  const simulation = input.simulation;
  return {
    route_build_marker: firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
    execution_status: input.status,
    approval_status: input.approval.approval_status,
    selected_candidate_id: expectedCandidateId,
    source_type: "recommendation_row",
    source_row_id: expectedSourceRowId,
    source_table: "historical_candles",
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    fetch_run_id: expectedFetchRunId,
    expected_candle_rows: 73,
    candle_window_start: expectedFirstTimestamp,
    candle_window_end: expectedLastTimestamp,
    analysis_cutoff: analysisCutoff,
    direction: "long",
    planned_entry: plannedEntry,
    planned_stop: plannedStop,
    planned_target: plannedTarget,
    confidence_or_tier: "Low",
    setup_label: "UNKNOWN",
    candles_read: input.candlesRead ?? 0,
    candles_verified: input.candlesVerified ?? 0,
    lookahead_safety_passed: simulation?.lookahead_safety_passed ?? false,
    counterfactual_result_available:
      simulation?.counterfactual_result_available ?? false,
    replay_outcome_status: simulation?.replay_outcome_status ?? "pending",
    entry_touched: simulation?.entry_touched ?? false,
    stop_touched: simulation?.stop_touched ?? false,
    target_touched: simulation?.target_touched ?? false,
    entry_timestamp: simulation?.entry_timestamp ?? null,
    exit_timestamp: simulation?.exit_timestamp ?? null,
    exit_reason: simulation?.exit_reason ?? null,
    gross_r_multiple: simulation?.gross_r_multiple ?? null,
    gross_price_move: simulation?.gross_price_move ?? null,
    replay_executed: input.replayExecuted ?? false,
    replay_allowed_now: input.replayAllowedNow ?? false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    recommendation_rows_mutated: false,
    supabase_read_executed: input.supabaseReadExecuted ?? false,
    supabase_write_executed: false,
    scanner_universe_changed: false,
    thresholds_changed: false,
    outcome_evaluation_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_affected: false,
    broker_execution_affected: false,
    risk_changed: false,
    synthetic_outcome_persistence_allowed_now: false,
    scanner_use_allowed_now: false,
    ranking_change_allowed_now: false,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    recommended_next_steps: [
      ...(input.recommendedNextSteps ?? defaultNextSteps),
    ],
  };
}

export function buildFirstTinyReplayWithSignalPackageDryRunReadiness(
  input: FirstTinyReplayWithSignalPackageDryRunInput = {},
): FirstTinyReplayWithSignalPackageDryRunSummary {
  const candlePersistenceResult =
    input.candle_persistence_result ??
    buildFirstTinyCandlePersistenceResultVerification();
  const selectionPlan =
    input.selection_plan ?? buildFirstTinyHistoricalReplaySignalPackageSelectionPlan();
  const approval =
    input.selection_approval ??
    buildFirstTinyHistoricalReplaySignalPackageSelectionApproval({
      env: input.env ?? undefined,
      selection_plan: selectionPlan,
    });

  if (
    approval.approval_status === "valid_for_future_replay_with_signal_package" &&
    candlePersistenceResult.readback_verified === true
  ) {
    return baseSummary({
      status: "ready_with_valid_signal",
      approval,
      warnings: ["explicit_execute_route_call_required"],
      recommendedNextSteps: [
        "require_explicit_execute_replay_with_signal_package_dry_run_true",
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
        : ["valid_signal_package_selection_approval_required"],
  });
}

export async function executeFirstTinyReplayWithSignalPackageDryRun(
  input: FirstTinyReplayWithSignalPackageDryRunInput = {},
): Promise<FirstTinyReplayWithSignalPackageDryRunSummary> {
  const candlePersistenceResult =
    input.candle_persistence_result ??
    buildFirstTinyCandlePersistenceResultVerification();
  const selectionPlan =
    input.selection_plan ?? buildFirstTinyHistoricalReplaySignalPackageSelectionPlan();
  const approval =
    input.selection_approval ??
    buildFirstTinyHistoricalReplaySignalPackageSelectionApproval({
      env: input.env ?? undefined,
      selection_plan: selectionPlan,
    });

  if (approval.approval_status !== "valid_for_future_replay_with_signal_package") {
    return baseSummary({
      status: "not_approved",
      approval,
      blockers:
        approval.approval_status === "invalid"
          ? approval.blockers
          : ["valid_signal_package_selection_approval_required"],
    });
  }

  if (input.execute_replay_with_signal_package_dry_run !== true) {
    return baseSummary({
      status: "ready_with_valid_signal",
      approval,
      warnings: ["execute_replay_with_signal_package_dry_run_true_required"],
      recommendedNextSteps: [
        "require_explicit_execute_replay_with_signal_package_dry_run_true",
        "keep_synthetic_outcomes_scanner_and_ranking_disabled",
      ],
    });
  }

  if (!candlePersistenceResult.readback_verified) {
    return baseSummary({
      status: "blocked_candle_verification_failed",
      approval,
      blockers: ["action_297_candle_persistence_result_not_verified"],
    });
  }

  if (!analysisCutoff) {
    return baseSummary({
      status: "blocked_missing_analysis_cutoff",
      approval,
      blockers: ["missing_analysis_cutoff"],
    });
  }

  const signalBlockers = validateSelectedSignalPackage({
    plan: selectionPlan,
    approval,
  });
  if (signalBlockers.length > 0) {
    return baseSummary({
      status: "blocked_signal_package_validation_failed",
      approval,
      blockers: signalBlockers,
    });
  }

  if (!input.supabase_client) {
    return baseSummary({
      status: "blocked_missing_candles",
      approval,
      blockers: ["supabase_service_role_unavailable"],
    });
  }

  const verification = await verifyFirstTinyCandlePersistenceReadback({
    supabase_client: input.supabase_client,
  });

  if (!verification.readback_verified || verification.matched_rows !== 73) {
    return baseSummary({
      status: verification.readback_rows === 0
        ? "blocked_missing_candles"
        : "blocked_candle_verification_failed",
      approval,
      candlesRead: verification.readback_rows,
      candlesVerified: verification.matched_rows,
      supabaseReadExecuted: true,
      blockers:
        verification.blockers.length > 0
          ? verification.blockers
          : ["persisted_candle_readback_not_verified"],
      warnings: verification.warnings,
    });
  }

  const readback = await readPersistedCandles({
    client: input.supabase_client,
  });
  const readbackError = errorMessage(readback.error);
  if (readbackError) {
    return baseSummary({
      status: "failed",
      approval,
      candlesRead: verification.readback_rows,
      candlesVerified: verification.matched_rows,
      supabaseReadExecuted: true,
      blockers: [`candle_read_failed:${readbackError}`],
    });
  }

  if (readback.rows.length !== 73) {
    return baseSummary({
      status: readback.rows.length === 0
        ? "blocked_missing_candles"
        : "blocked_candle_verification_failed",
      approval,
      candlesRead: readback.rows.length,
      candlesVerified: verification.matched_rows,
      supabaseReadExecuted: true,
      blockers: ["persisted_candle_readback_row_count_mismatch"],
    });
  }

  const simulation = simulateFirstTinyReplayWithSignalPackage(
    readback.rows as FirstTinyReplayWithSignalPackageCandle[],
  );

  if (!simulation.lookahead_safety_passed) {
    return baseSummary({
      status: "blocked_candle_verification_failed",
      approval,
      candlesRead: readback.rows.length,
      candlesVerified: verification.matched_rows,
      supabaseReadExecuted: true,
      simulation,
      blockers: ["lookahead_safety_failed"],
    });
  }

  return baseSummary({
    status: "replay_with_signal_package_completed",
    approval,
    candlesRead: readback.rows.length,
    candlesVerified: verification.matched_rows,
    supabaseReadExecuted: true,
    replayExecuted: true,
    replayAllowedNow: true,
    simulation,
    recommendedNextSteps: successNextSteps,
  });
}
