import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";
import type { DayTradeWindowRecommendationTargetSummary } from "@/lib/day-trade-window-recommendation-target";
import type { MarketSessionEvaluation, MarketSessionStatus } from "@/lib/market-session";
import type { ProviderBudgetGuardSummary } from "@/lib/provider-budget-guard";
import type { RecommendationEngineControlCenterSummary } from "@/lib/recommendation-engine-control-center";
import type { RecommendationPerformanceStatistics } from "@/lib/recommendation-performance-statistics";
import type { RecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import type { LiveMarketTrialReadinessSummary } from "@/lib/live-market-trial-readiness";

export type LiveMarketTrialRunbookPhase =
  | "pre_market_check"
  | "morning_window"
  | "midday_window"
  | "power_hour"
  | "post_market_review"
  | "closed_market"
  | "unknown";

export type LiveMarketTrialRunbookStatus =
  | "not_started"
  | "ready"
  | "in_progress"
  | "waiting_for_next_window"
  | "blocked"
  | "completed"
  | "needs_review"
  | "unknown";

export type LiveMarketTrialRunbookMode =
  | "observation_only"
  | "recommendation_logging"
  | "optional_manual_paper_tracking";

export type LiveMarketTrialRunbookOutcome =
  | "no_trade_valid"
  | "recommendations_logged"
  | "paper_trade_completed"
  | "blocked"
  | "needs_review"
  | "none";

export type LiveMarketTrialRunbookStepStatus =
  | "pending"
  | "done"
  | "pass"
  | "warning"
  | "blocked"
  | "optional";

export type LiveMarketTrialRunbookStep = {
  step_id: string;
  phase: LiveMarketTrialRunbookPhase;
  label: string;
  detail: string;
  status: LiveMarketTrialRunbookStepStatus;
  source:
    | "readiness"
    | "provider"
    | "scheduler"
    | "serving"
    | "persistence"
    | "outcomes"
    | "risk"
    | "user";
  is_complete: boolean;
};

export type LiveMarketTrialRunbookWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type LiveMarketTrialRunbookNextAction = {
  action_id: string;
  priority: "critical" | "high" | "medium" | "low" | "watch";
  label: string;
  message: string;
};

export type LiveMarketTrialRunbookLocalState = {
  trial_date: string;
  selected_mode: LiveMarketTrialRunbookMode;
  checklist_completion: Record<string, boolean>;
  notes: string;
  trial_outcome: LiveMarketTrialRunbookOutcome;
  ended_at: string | null;
};

export type LiveMarketTrialRunbookSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "live_market_trial_runbook";
  generated_at: string;
  phase: LiveMarketTrialRunbookPhase;
  status: LiveMarketTrialRunbookStatus;
  selected_mode: LiveMarketTrialRunbookMode;
  trial_date: string;
  summary: string;
  next_action: LiveMarketTrialRunbookNextAction;
  checklist: LiveMarketTrialRunbookStep[];
  active_phase_steps: LiveMarketTrialRunbookStep[];
  warnings: LiveMarketTrialRunbookWarning[];
  blockers: LiveMarketTrialRunbookWarning[];
  progress: {
    total_steps: number;
    completed_steps: number;
    active_phase_steps: number;
    active_phase_completed_steps: number;
  };
  market_context: {
    market_is_open: boolean;
    market_day_type: string;
    market_session_phase: string;
    active_scan_window: string;
    next_scan_window: string;
    next_scan_window_starts_at: string | null;
  };
  automation_context: {
    latest_decision: string;
    latest_scan_at: string | null;
    official_batch_status: string;
    official_batch_id: string | null;
    visible_recommendations: number;
    target_min: number;
    target_max: number;
    no_trade_valid: boolean;
  };
  outcome_context: {
    total_recommendations: number;
    evaluated_recommendations: number;
    pending_outcomes: number;
    stored_scan_runs: number;
    stored_batches: number;
    stored_snapshots: number;
    stored_outcomes: number;
    selected_outcome: LiveMarketTrialRunbookOutcome;
    ended_at: string | null;
  };
  copy: {
    purpose: string;
    no_trade_valid: string;
    automatic_scans: string;
    review_before_change: string;
    execution_boundary: string;
  };
};

export type LiveMarketTrialRunbookInput = {
  readiness: LiveMarketTrialReadinessSummary;
  provider_budget_guard: ProviderBudgetGuardSummary;
  scan_orchestration: DayTradeScanOrchestrationSummary;
  serving_cadence: RecommendationServingCadenceSummary;
  engine_control_center: RecommendationEngineControlCenterSummary;
  day_trade_window_target: DayTradeWindowRecommendationTargetSummary;
  performance: RecommendationPerformanceStatistics;
  market_session: MarketSessionEvaluation;
  market_status: MarketSessionStatus | null;
  local_state?: LiveMarketTrialRunbookLocalState | null;
  persistence_counts?: {
    scan_runs?: number | null;
    batches?: number | null;
    snapshots?: number | null;
    outcomes?: number | null;
  } | null;
  risk_controls?: {
    enabled?: boolean | null;
    require_manual_review_for_real_mode?: boolean | null;
    max_trades_per_day?: number | null;
    max_open_positions?: number | null;
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

function isBudgetBlocked(status: string) {
  return (
    status === "over_budget" ||
    status === "rate_limited" ||
    status === "provider_unavailable"
  );
}

function isClosedMarketPhase(phase: LiveMarketTrialRunbookPhase) {
  return phase === "closed_market";
}

function readinessIsBlocked(
  readiness: LiveMarketTrialReadinessSummary,
  phase: LiveMarketTrialRunbookPhase,
) {
  if (
    readiness.overall_status === "blocked_by_provider" ||
    readiness.overall_status === "blocked_by_scheduler" ||
    readiness.overall_status === "blocked_by_missing_env"
  ) {
    return true;
  }

  if (isClosedMarketPhase(phase)) {
    return readiness.blockers.some(
      (blocker) =>
        blocker.source === "environment" ||
        blocker.source === "provider" ||
        blocker.source === "scheduler",
    );
  }

  return readiness.blockers.some((blocker) => blocker.source !== "market_session");
}

function determinePhase(
  input: Pick<
    LiveMarketTrialRunbookInput,
    "scan_orchestration" | "market_session" | "market_status"
  >,
): LiveMarketTrialRunbookPhase {
  if (input.scan_orchestration.active_window === "morning") {
    return "morning_window";
  }

  if (input.scan_orchestration.active_window === "midday") {
    return "midday_window";
  }

  if (input.scan_orchestration.active_window === "power_hour") {
    return "power_hour";
  }

  if (
    input.market_session.phase === "after_hours" ||
    input.market_session.phase === "closing_soon" ||
    (input.market_session.is_trading_day &&
      !input.market_session.market_is_open &&
      input.market_session.minutes_since_open !== null)
  ) {
    return "post_market_review";
  }

  if (
    input.market_session.phase === "pre_market" ||
    (input.market_session.is_trading_day &&
      !input.market_session.market_is_open &&
      input.scan_orchestration.next_window === "morning")
  ) {
    return "pre_market_check";
  }

  if (
    input.scan_orchestration.decision === "market_closed" ||
    input.market_status?.dayType === "weekend" ||
    input.market_status?.dayType === "holiday" ||
    input.market_session.phase === "closed" ||
    input.market_session.phase === "holiday"
  ) {
    return "closed_market";
  }

  return "unknown";
}

function step(
  input: Omit<LiveMarketTrialRunbookStep, "is_complete">,
  localState: LiveMarketTrialRunbookLocalState | null | undefined,
): LiveMarketTrialRunbookStep {
  const manuallyComplete = localState?.checklist_completion[input.step_id] === true;
  const autoComplete = input.status === "pass" || input.status === "done";

  return {
    ...input,
    is_complete: manuallyComplete || autoComplete,
    status: manuallyComplete && input.status === "pending" ? "done" : input.status,
  };
}

function action(
  action_id: string,
  priority: LiveMarketTrialRunbookNextAction["priority"],
  label: string,
  message: string,
): LiveMarketTrialRunbookNextAction {
  return { action_id, priority, label, message };
}

function determineStatus({
  input,
  phase,
  steps,
}: {
  input: LiveMarketTrialRunbookInput;
  phase: LiveMarketTrialRunbookPhase;
  steps: LiveMarketTrialRunbookStep[];
}): LiveMarketTrialRunbookStatus {
  if (input.local_state?.ended_at) {
    return "completed";
  }

  if (
    readinessIsBlocked(input.readiness, phase) ||
    isBudgetBlocked(input.provider_budget_guard.status)
  ) {
    return "blocked";
  }

  const completedCount = steps.filter((item) => item.is_complete).length;
  const activeSteps = steps.filter((item) => item.phase === phase);
  const activeCompletedCount = activeSteps.filter((item) => item.is_complete).length;

  if (phase === "post_market_review") {
    return activeCompletedCount === activeSteps.length ? "completed" : "needs_review";
  }

  if (phase === "closed_market") {
    return "waiting_for_next_window";
  }

  if (
    phase === "morning_window" ||
    phase === "midday_window" ||
    phase === "power_hour"
  ) {
    return completedCount > 0 ? "in_progress" : "ready";
  }

  if (phase === "pre_market_check") {
    return completedCount > 0 ? "ready" : "not_started";
  }

  return "unknown";
}

function nextActionForStatus({
  status,
  phase,
  input,
}: {
  status: LiveMarketTrialRunbookStatus;
  phase: LiveMarketTrialRunbookPhase;
  input: LiveMarketTrialRunbookInput;
}) {
  if (status === "blocked") {
    const providerBlocked = isBudgetBlocked(input.provider_budget_guard.status);
    return action(
      providerBlocked ? "review_provider_budget" : "clear_trial_blocker",
      "critical",
      providerBlocked ? "Review provider budget" : "Clear readiness blocker",
      providerBlocked
        ? input.provider_budget_guard.status_message
        : input.readiness.blockers[0]?.message ??
            "Resolve the readiness blocker before relying on scheduled scans.",
    );
  }

  if (phase === "pre_market_check") {
    return action(
      "complete_pre_market_check",
      "high",
      "Complete pre-market check",
      "Confirm provider/env, scheduler, risk controls, and data-mode separation before the first automatic scan window.",
    );
  }

  if (
    phase === "morning_window" ||
    phase === "midday_window" ||
    phase === "power_hour"
  ) {
    return action(
      "wait_for_automatic_scan",
      "high",
      "Wait for automatic scan",
      "Let Ture scan automatically, then review official batch status and recommendation logging without forcing generation.",
    );
  }

  if (phase === "post_market_review") {
    return action(
      "review_trial_outputs",
      "high",
      "Review trial outputs",
      "Check Stats Today, Recommendation History, Batch Performance, and outcome evaluation before changing the engine.",
    );
  }

  if (phase === "closed_market") {
    return action(
      "wait_for_next_market_window",
      "watch",
      "Ready for next market window",
      "Market is closed. Ture is waiting for the next active scan window.",
    );
  }

  return action(
    "review_runbook",
    "medium",
    "Review runbook",
    "Confirm market status and readiness before starting the trial workflow.",
  );
}

function statusSummary(status: LiveMarketTrialRunbookStatus) {
  if (status === "ready") {
    return "Trial runbook is ready for the current market phase.";
  }

  if (status === "in_progress") {
    return "Trial runbook is in progress for an active scan window.";
  }

  if (status === "waiting_for_next_window") {
    return "Market is closed. Ture is waiting for the next active scan window.";
  }

  if (status === "blocked") {
    return "Trial runbook has a blocker that should be resolved before relying on automation.";
  }

  if (status === "completed") {
    return "Trial runbook has been marked complete for this local trial.";
  }

  if (status === "needs_review") {
    return "Post-market review is pending.";
  }

  if (status === "not_started") {
    return "Start with the pre-market checklist before the first active scan window.";
  }

  return "Runbook status is unknown; review market status and readiness diagnostics.";
}

export function buildLiveMarketTrialRunbookSummary(
  input: LiveMarketTrialRunbookInput,
): LiveMarketTrialRunbookSummary {
  const now = toDate(input.now) ?? new Date();
  const phase = determinePhase(input);
  const localState = input.local_state ?? null;
  const riskControlsConfigured =
    input.risk_controls?.enabled === true &&
    input.risk_controls.require_manual_review_for_real_mode !== false;
  const providerReady =
    input.readiness.provider_env_readiness.server_secret_status ===
      "inferred_available" ||
    input.readiness.provider_env_readiness.twelve_data_provider_observed ||
    input.readiness.provider_env_readiness.openai_generation_observed;
  const marketCalendarReady =
    input.readiness.provider_env_readiness.market_calendar_available;
  const schedulerReady =
    input.readiness.checks.find((item) => item.check_id === "automation_scan_route")
      ?.status !== "blocked";
  const budgetStatus = input.provider_budget_guard.status;
  const budgetAcceptable = !isBudgetBlocked(budgetStatus);
  const servingWindowActive =
    input.serving_cadence.serving_window === "morning" ||
    input.serving_cadence.serving_window === "midday" ||
    input.serving_cadence.serving_window === "power_hour";
  const officialBatchReady =
    input.serving_cadence.batch_type === "official" &&
    (input.serving_cadence.batch_status === "published" ||
      input.serving_cadence.batch_status === "ready_to_publish" ||
      input.serving_cadence.batch_status === "no_trade_valid");
  const targetSupported =
    input.day_trade_window_target.current_window_count.total >=
      input.day_trade_window_target.ideal_min ||
    input.serving_cadence.no_trade_valid;
  const persistenceObserved =
    input.persistence_counts?.batches ||
    input.persistence_counts?.snapshots ||
    input.persistence_counts?.scan_runs ||
    input.readiness.persistence_readiness.batches_available ||
    input.readiness.persistence_readiness.snapshots_available;
  const outcomeEvaluationReady =
    input.readiness.outcome_readiness.route_available &&
    input.performance.summary.pending_outcomes >= 0;

  const checklist = [
    step(
      {
        step_id: "pre_provider_env_ready",
        phase: "pre_market_check",
        label: "Provider/env ready",
        detail: providerReady
          ? "Provider-backed market data or generated output has been observed."
          : "Confirm server-only provider keys through the next scheduled scan.",
        status: providerReady ? "pass" : "warning",
        source: "readiness",
      },
      localState,
    ),
    step(
      {
        step_id: "pre_market_calendar_ready",
        phase: "pre_market_check",
        label: "Market calendar available",
        detail: marketCalendarReady
          ? `Market calendar provider is ${input.readiness.provider_env_readiness.market_calendar_provider ?? "available"}.`
          : "Market calendar is missing or unknown; treat session timing with care.",
        status: marketCalendarReady ? "pass" : "warning",
        source: "provider",
      },
      localState,
    ),
    step(
      {
        step_id: "pre_scan_budget_ok",
        phase: "pre_market_check",
        label: "Scan budget acceptable",
        detail: input.provider_budget_guard.status_message,
        status: budgetAcceptable
          ? budgetStatus === "approaching_limit" || budgetStatus === "budget_unknown"
            ? "warning"
            : "pass"
          : "blocked",
        source: "provider",
      },
      localState,
    ),
    step(
      {
        step_id: "pre_scheduler_ready",
        phase: "pre_market_check",
        label: "Scheduler route ready",
        detail: schedulerReady
          ? "Automation scan route is available for scheduled execution."
          : "Automation scan route readiness is blocked.",
        status: schedulerReady ? "pass" : "blocked",
        source: "scheduler",
      },
      localState,
    ),
    step(
      {
        step_id: "pre_risk_controls_ready",
        phase: "pre_market_check",
        label: "Risk controls configured",
        detail: riskControlsConfigured
          ? "Risk controls are enabled and manual review remains required."
          : "Review local risk controls before optional manual paper tracking.",
        status: riskControlsConfigured ? "pass" : "warning",
        source: "risk",
      },
      localState,
    ),
    step(
      {
        step_id: "pre_data_reality_clear",
        phase: "pre_market_check",
        label: "Demo/fallback/real data separated",
        detail: input.readiness.checks.find((item) => item.check_id === "data_reality")
          ?.message ?? "Data reality status is available in readiness diagnostics.",
        status:
          input.readiness.checks.find((item) => item.check_id === "data_reality")
            ?.status === "warning"
            ? "warning"
            : "pass",
        source: "readiness",
      },
      localState,
    ),
    step(
      {
        step_id: "pre_no_broker_automation",
        phase: "pre_market_check",
        label: "No broker automation enabled",
        detail: "Broker automation, order submission, and Avanza execution remain disabled.",
        status: "pass",
        source: "risk",
      },
      localState,
    ),
    step(
      {
        step_id: "morning_wait_for_auto_scan",
        phase: "morning_window",
        label: "Wait for automatic scan/batch",
        detail: `Current automation decision is ${words(input.scan_orchestration.decision)}.`,
        status: servingWindowActive ? "pending" : "optional",
        source: "scheduler",
      },
      localState,
    ),
    step(
      {
        step_id: "morning_verify_official_batch",
        phase: "morning_window",
        label: "Verify official batch status",
        detail: `Batch status is ${words(input.serving_cadence.batch_status)}.`,
        status: officialBatchReady ? "pass" : "pending",
        source: "serving",
      },
      localState,
    ),
    step(
      {
        step_id: "morning_verify_target",
        phase: "morning_window",
        label: "Check 6-10 recommendation target",
        detail: `${input.day_trade_window_target.current_window_count.total} current-window recommendations; no-trade windows are valid if quality is insufficient.`,
        status: targetSupported ? "pass" : "warning",
        source: "serving",
      },
      localState,
    ),
    step(
      {
        step_id: "morning_review_recommendations",
        phase: "morning_window",
        label: "Review Recommendations tab",
        detail: "Review official output only; do not manually force recommendations.",
        status: "pending",
        source: "user",
      },
      localState,
    ),
    step(
      {
        step_id: "morning_confirm_persistence",
        phase: "morning_window",
        label: "Snapshots/batches persisted",
        detail: persistenceObserved
          ? "Scan artifacts are available from persisted or local sources."
          : "Wait for the first official scan artifacts.",
        status: persistenceObserved ? "pass" : "pending",
        source: "persistence",
      },
      localState,
    ),
    step(
      {
        step_id: "midday_accept_quiet_market",
        phase: "midday_window",
        label: "Accept quiet-market output",
        detail: "Fewer recommendations or no-trade-valid is acceptable when the market is quiet.",
        status: input.serving_cadence.no_trade_valid ? "pass" : "pending",
        source: "serving",
      },
      localState,
    ),
    step(
      {
        step_id: "midday_verify_batch_or_no_trade",
        phase: "midday_window",
        label: "Verify batch/no-trade status",
        detail: `Serving decision is ${words(input.serving_cadence.serving_decision)}.`,
        status:
          officialBatchReady || input.serving_cadence.no_trade_valid
            ? "pass"
            : "pending",
        source: "serving",
      },
      localState,
    ),
    step(
      {
        step_id: "midday_monitor_provider_budget",
        phase: "midday_window",
        label: "Monitor provider/budget warnings",
        detail: `Provider budget guard is ${words(budgetStatus)}.`,
        status: budgetAcceptable ? "pass" : "blocked",
        source: "provider",
      },
      localState,
    ),
    step(
      {
        step_id: "power_hour_eod_risk_awareness",
        phase: "power_hour",
        label: "Verify EOD risk awareness",
        detail: "Power-hour recommendations may expire faster and carry more closing risk.",
        status:
          input.market_session.risk_level === "critical" ||
          input.market_session.risk_level === "high"
            ? "warning"
            : "pending",
        source: "risk",
      },
      localState,
    ),
    step(
      {
        step_id: "power_hour_avoid_forcing_trades",
        phase: "power_hour",
        label: "Avoid forcing late trades",
        detail: "Late-day no-trade outcomes are valid; do not create trades just to complete the trial.",
        status: "pending",
        source: "user",
      },
      localState,
    ),
    step(
      {
        step_id: "post_verify_outcome_evaluation",
        phase: "post_market_review",
        label: "Verify outcome evaluation",
        detail: outcomeEvaluationReady
          ? `${input.performance.summary.evaluated_recommendations} evaluated, ${input.performance.summary.pending_outcomes} pending.`
          : "Outcome evaluation route or tracking needs review.",
        status: outcomeEvaluationReady ? "pending" : "warning",
        source: "outcomes",
      },
      localState,
    ),
    step(
      {
        step_id: "post_review_stats_today",
        phase: "post_market_review",
        label: "Review Stats Today",
        detail: `${input.performance.summary.total_recommendations} recommendations are in the current statistics scope.`,
        status: "pending",
        source: "user",
      },
      localState,
    ),
    step(
      {
        step_id: "post_review_history",
        phase: "post_market_review",
        label: "Review Recommendation History",
        detail: "Confirm official batches and no-trade windows are understandable in History.",
        status: "pending",
        source: "user",
      },
      localState,
    ),
    step(
      {
        step_id: "post_review_batch_insights",
        phase: "post_market_review",
        label: "Review Batch Performance/Insights",
        detail: `Engine control center is ${words(input.engine_control_center.overall_status)}.`,
        status: "pending",
        source: "user",
      },
      localState,
    ),
    step(
      {
        step_id: "post_note_blockers",
        phase: "post_market_review",
        label: "Note blockers/warnings",
        detail: "Record what should be fixed before changing the engine.",
        status: localState?.notes.trim() ? "done" : "pending",
        source: "user",
      },
      localState,
    ),
    step(
      {
        step_id: "closed_ready_for_next_window",
        phase: "closed_market",
        label: "Ready for next market window",
        detail:
          input.readiness.overall_status === "blocked_by_market_closed" ||
          input.readiness.can_do_now.observe_only
            ? "Closed market is a normal wait state, not a scanner failure."
            : "Review readiness before the next open session.",
        status: readinessIsBlocked(input.readiness, phase) ? "warning" : "pass",
        source: "readiness",
      },
      localState,
    ),
    step(
      {
        step_id: "closed_no_empty_runs",
        phase: "closed_market",
        label: "No noisy closed-market runs",
        detail: "Automation should skip closed market without publishing official empty batches.",
        status:
          input.readiness.latest_automation_scan.decision ===
            "skipped_market_closed" ||
          input.scan_orchestration.decision === "market_closed"
            ? "pass"
            : "pending",
        source: "scheduler",
      },
      localState,
    ),
  ];

  const blockers = [
    ...input.readiness.blockers
      .filter((item) =>
        isClosedMarketPhase(phase)
          ? item.source === "environment" ||
            item.source === "provider" ||
            item.source === "scheduler"
          : item.source !== "market_session",
      )
      .map((item) => ({
        warning_id: `readiness:${item.blocker_id}`,
        severity: "critical" as const,
        message: item.message,
      })),
    ...(isBudgetBlocked(budgetStatus)
      ? [
          {
            warning_id: "provider_budget_blocked",
            severity: "critical" as const,
            message: input.provider_budget_guard.status_message,
          },
        ]
      : []),
  ].slice(0, 6);

  const warnings = [
    ...input.readiness.warnings.slice(0, 3).map((item) => ({
      warning_id: `readiness:${item.warning_id}`,
      severity: "warning" as const,
      message: item.message,
    })),
    ...input.provider_budget_guard.warnings.slice(0, 2).map((item) => ({
      warning_id: `provider:${item.warning_id}`,
      severity: item.severity,
      message: item.message,
    })),
    ...(input.serving_cadence.no_trade_valid
      ? [
          {
            warning_id: "serving:no_trade_valid",
            severity: "info" as const,
            message: "No-trade-valid is an acceptable trial outcome.",
          },
        ]
      : []),
    ...(phase === "closed_market"
      ? [
          {
            warning_id: "market:closed_wait_state",
            severity: "info" as const,
            message: "Closed market should be handled as wait state, not scanner failure.",
          },
        ]
      : []),
  ].slice(0, 8);

  const status = determineStatus({ input, phase, steps: checklist });
  const activePhaseSteps = checklist.filter((item) => item.phase === phase);
  const completedSteps = checklist.filter((item) => item.is_complete).length;
  const activeCompletedSteps = activePhaseSteps.filter(
    (item) => item.is_complete,
  ).length;

  return {
    summary_id: `live_market_trial_runbook_${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "live_market_trial_runbook",
    generated_at: now.toISOString(),
    phase,
    status,
    selected_mode: localState?.selected_mode ?? "observation_only",
    trial_date: localState?.trial_date || input.market_session.ny_date,
    summary: statusSummary(status),
    next_action: nextActionForStatus({ status, phase, input }),
    checklist,
    active_phase_steps: activePhaseSteps,
    warnings,
    blockers,
    progress: {
      total_steps: checklist.length,
      completed_steps: completedSteps,
      active_phase_steps: activePhaseSteps.length,
      active_phase_completed_steps: activeCompletedSteps,
    },
    market_context: {
      market_is_open: input.market_session.market_is_open,
      market_day_type: input.market_status?.dayType ?? "unknown",
      market_session_phase: input.market_session.phase,
      active_scan_window: input.scan_orchestration.active_window,
      next_scan_window: input.scan_orchestration.next_window,
      next_scan_window_starts_at: input.scan_orchestration.next_window_starts_at,
    },
    automation_context: {
      latest_decision: input.readiness.latest_automation_scan.decision,
      latest_scan_at: input.readiness.latest_automation_scan.created_at,
      official_batch_status: input.serving_cadence.batch_status,
      official_batch_id: input.serving_cadence.latest_official_batch_id,
      visible_recommendations: input.serving_cadence.visible_recommendation_count,
      target_min: input.serving_cadence.batch_target.min,
      target_max: input.serving_cadence.batch_target.max,
      no_trade_valid: input.serving_cadence.no_trade_valid,
    },
    outcome_context: {
      total_recommendations: input.performance.summary.total_recommendations,
      evaluated_recommendations:
        input.performance.summary.evaluated_recommendations,
      pending_outcomes: input.performance.summary.pending_outcomes,
      stored_scan_runs: count(input.persistence_counts?.scan_runs),
      stored_batches: count(input.persistence_counts?.batches),
      stored_snapshots: count(input.persistence_counts?.snapshots),
      stored_outcomes: count(input.persistence_counts?.outcomes),
      selected_outcome: localState?.trial_outcome ?? "none",
      ended_at: localState?.ended_at ?? null,
    },
    copy: {
      purpose:
        "This runbook helps test Ture with real market data. It does not enable broker automation.",
      no_trade_valid: "No-trade windows are valid outcomes.",
      automatic_scans:
        "Ture scans automatically; do not manually force recommendations.",
      review_before_change:
        "Review outcomes after the market session before changing the engine.",
      execution_boundary:
        phase === "closed_market"
          ? "Market is closed. Ture is waiting for the next active scan window."
          : "No broker automation, order submission, Avanza automation, or automatic trading execution is enabled.",
    },
  };
}

export function liveMarketTrialRunbookSummaryJson(
  summary: LiveMarketTrialRunbookSummary,
) {
  return JSON.stringify(summary, null, 2);
}
