import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { LiveTestReadinessSummary } from "@/lib/live-test-readiness";
import type { MarketSessionEvaluation } from "@/lib/market-session";
import type { RecommendationEmptyStateSummary } from "@/lib/recommendation-empty-state";
import type { RecommendationIntakeQualityResult } from "@/lib/recommendation-intake-quality";
import type { RiskControlsSettings } from "@/lib/risk-controls";
import type { ScanPipelineObservabilitySummary } from "@/lib/scan-pipeline-observability";

export type PaperSessionProtocolStatus =
  | "not_started"
  | "ready_to_start"
  | "in_progress"
  | "completed"
  | "blocked"
  | "needs_review";

export type PaperSessionProtocolMode =
  | "real_market_paper"
  | "demo_rehearsal"
  | "mock_broker_rehearsal";

export type PaperSessionProtocolStepStatus =
  | "pending"
  | "active"
  | "complete"
  | "warning"
  | "blocked";

export type PaperSessionProtocolCheckStatus =
  | "pass"
  | "warning"
  | "blocked"
  | "pending";

export type PaperSessionProtocolOutcome =
  | "not_set"
  | "no_trade_valid"
  | "paper_trade_completed"
  | "blocked"
  | "needs_review";

export type PaperSessionProtocolWarning = {
  warning_id: string;
  label: string;
  message: string;
  step_id: string;
};

export type PaperSessionProtocolBlocker = {
  blocker_id: string;
  label: string;
  message: string;
  step_id: string;
};

export type PaperSessionProtocolCheck = {
  check_id: string;
  step_id: string;
  label: string;
  status: PaperSessionProtocolCheckStatus;
  message: string;
};

export type PaperSessionProtocolStep = {
  step_id: string;
  order: number;
  label: string;
  status: PaperSessionProtocolStepStatus;
  summary: string;
  checks: PaperSessionProtocolCheck[];
  blocker_ids: string[];
  warning_ids: string[];
  user_completed: boolean;
  can_mark_complete: boolean;
};

export type PaperSessionProtocolNextAction = {
  action_id: string;
  label: string;
  message: string;
  priority: "primary" | "secondary";
};

export type PaperSessionProtocolLocalState = {
  session_started_at: string | null;
  selected_mode: PaperSessionProtocolMode;
  completed_step_ids: string[];
  notes: string;
  session_outcome: PaperSessionProtocolOutcome;
  session_ended_at: string | null;
};

export type PaperSessionProtocolSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "paper_session_protocol";
  generated_at: string;
  mode: PaperSessionProtocolMode;
  status: PaperSessionProtocolStatus;
  started_at: string | null;
  ended_at: string | null;
  outcome: PaperSessionProtocolOutcome;
  ready_to_start: boolean;
  paper_trade_allowed_by_protocol: boolean;
  no_trade_session_valid: boolean;
  steps: PaperSessionProtocolStep[];
  checks: PaperSessionProtocolCheck[];
  blockers: PaperSessionProtocolBlocker[];
  warnings: PaperSessionProtocolWarning[];
  next_actions: PaperSessionProtocolNextAction[];
  completed_step_count: number;
  total_step_count: number;
  summary: string;
};

export type PaperSessionProtocolInput = {
  mode?: PaperSessionProtocolMode | null;
  protocol_state?: Partial<PaperSessionProtocolLocalState> | null;
  live_test_readiness: LiveTestReadinessSummary;
  data_mode_clarity: DataModeClaritySummary;
  scan_observability: ScanPipelineObservabilitySummary;
  intake_results: RecommendationIntakeQualityResult[];
  empty_state_summary: RecommendationEmptyStateSummary;
  market_session: MarketSessionEvaluation;
  risk_controls: RiskControlsSettings;
  live_positions_count?: number | null;
  closed_trades_today_count?: number | null;
  mock_broker_available?: boolean | null;
  demo_mode_enabled?: boolean | null;
  now?: Date | string | null;
};

export const paperSessionProtocolStorageKey =
  "trade-paper-session-protocol-v1";

const stepOrder = [
  "confirm_mode",
  "confirm_readiness",
  "confirm_data_reality",
  "confirm_risk_controls",
  "confirm_market_session",
  "review_recommendations",
  "paper_trade_entry",
  "monitor_position",
  "close_paper_trade",
  "review_outcome",
  "end_session",
] as const;

type StepId = (typeof stepOrder)[number];

const stepLabels: Record<StepId, string> = {
  confirm_mode: "Confirm test mode",
  confirm_readiness: "Confirm readiness",
  confirm_data_reality: "Confirm data/source reality",
  confirm_risk_controls: "Confirm risk controls",
  confirm_market_session: "Confirm market session",
  review_recommendations: "Review recommendations",
  paper_trade_entry: "If taking a paper trade",
  monitor_position: "Monitor live position",
  close_paper_trade: "Close paper trade",
  review_outcome: "Review outcome",
  end_session: "End session",
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

function normalizeMode(
  value: PaperSessionProtocolMode | string | null | undefined,
): PaperSessionProtocolMode {
  if (
    value === "real_market_paper" ||
    value === "demo_rehearsal" ||
    value === "mock_broker_rehearsal"
  ) {
    return value;
  }

  return "real_market_paper";
}

export function createDefaultPaperSessionProtocolState(
  mode: PaperSessionProtocolMode = "real_market_paper",
): PaperSessionProtocolLocalState {
  return {
    session_started_at: null,
    selected_mode: mode,
    completed_step_ids: [],
    notes: "",
    session_outcome: "not_set",
    session_ended_at: null,
  };
}

export function normalizePaperSessionProtocolState(
  value: unknown,
): PaperSessionProtocolLocalState {
  if (!value || typeof value !== "object") {
    return createDefaultPaperSessionProtocolState();
  }

  const record = value as Record<string, unknown>;
  const completedStepIds = Array.isArray(record.completed_step_ids)
    ? record.completed_step_ids.filter(
        (item): item is StepId =>
          typeof item === "string" && stepOrder.includes(item as StepId),
      )
    : [];
  const outcome =
    record.session_outcome === "no_trade_valid" ||
    record.session_outcome === "paper_trade_completed" ||
    record.session_outcome === "blocked" ||
    record.session_outcome === "needs_review"
      ? record.session_outcome
      : "not_set";

  return {
    session_started_at:
      typeof record.session_started_at === "string"
        ? record.session_started_at
        : null,
    selected_mode: normalizeMode(
      typeof record.selected_mode === "string" ? record.selected_mode : null,
    ),
    completed_step_ids: Array.from(new Set(completedStepIds)),
    notes: typeof record.notes === "string" ? record.notes.slice(0, 2000) : "",
    session_outcome: outcome,
    session_ended_at:
      typeof record.session_ended_at === "string" ? record.session_ended_at : null,
  };
}

function warning(
  step_id: StepId,
  warning_id: string,
  label: string,
  message: string,
): PaperSessionProtocolWarning {
  return { step_id, warning_id, label, message };
}

function blocker(
  step_id: StepId,
  blocker_id: string,
  label: string,
  message: string,
): PaperSessionProtocolBlocker {
  return { step_id, blocker_id, label, message };
}

function check(
  step_id: StepId,
  check_id: string,
  label: string,
  status: PaperSessionProtocolCheckStatus,
  message: string,
): PaperSessionProtocolCheck {
  return { step_id, check_id, label, status, message };
}

function action(
  action_id: string,
  label: string,
  message: string,
  priority: PaperSessionProtocolNextAction["priority"] = "secondary",
): PaperSessionProtocolNextAction {
  return { action_id, label, message, priority };
}

function isRealMarketPaper(mode: PaperSessionProtocolMode) {
  return mode === "real_market_paper";
}

function readinessModeMatches(
  mode: PaperSessionProtocolMode,
  readiness: LiveTestReadinessSummary,
) {
  if (mode === "real_market_paper") {
    return readiness.mode === "real_market_paper";
  }

  if (mode === "demo_rehearsal") {
    return readiness.mode === "demo_rehearsal";
  }

  return readiness.mode === "demo_rehearsal" || readiness.mode === "real_market_paper";
}

function isMarketTradeSessionBlocked(phase: string, mode: PaperSessionProtocolMode) {
  return (
    isRealMarketPaper(mode) &&
    (phase === "closed" ||
      phase === "holiday" ||
      phase === "pre_market" ||
      phase === "after_hours")
  );
}

function buildStepChecks(input: PaperSessionProtocolInput) {
  const mode = normalizeMode(input.mode ?? input.protocol_state?.selected_mode);
  const blockers: PaperSessionProtocolBlocker[] = [];
  const warnings: PaperSessionProtocolWarning[] = [];
  const checks: PaperSessionProtocolCheck[] = [];
  const acceptedCount = input.scan_observability.intake_counts.accepted;
  const needsReviewCount = input.scan_observability.intake_counts.needs_review;
  const rejectedIncompleteCount =
    input.scan_observability.intake_counts.rejected +
    input.scan_observability.intake_counts.incomplete;

  checks.push(
    check(
      "confirm_mode",
      "protocol_mode_selected",
      "Protocol mode",
      "pass",
      `Protocol mode is ${mode}.`,
    ),
  );

  if (!readinessModeMatches(mode, input.live_test_readiness)) {
    warnings.push(
      warning(
        "confirm_readiness",
        "readiness_mode_differs",
        "Readiness mode differs",
        "The Live Test Readiness panel is evaluating a different mode than this protocol.",
      ),
    );
  }

  if (
    isRealMarketPaper(mode) &&
    (input.live_test_readiness.status === "blocked" ||
      input.live_test_readiness.status === "unknown")
  ) {
    blockers.push(
      blocker(
        "confirm_readiness",
        "readiness_blocks_paper_session",
        "Readiness blocked",
        input.live_test_readiness.summary,
      ),
    );
  } else if (input.live_test_readiness.status === "needs_review") {
    warnings.push(
      warning(
        "confirm_readiness",
        "readiness_needs_review",
        "Readiness needs review",
        "Review Live Test Readiness warnings before starting.",
      ),
    );
  }

  checks.push(
    check(
      "confirm_readiness",
      "live_test_readiness",
      "Live Test Readiness",
      blockers.some((item) => item.step_id === "confirm_readiness")
        ? "blocked"
        : warnings.some((item) => item.step_id === "confirm_readiness")
          ? "warning"
          : "pass",
      input.live_test_readiness.summary,
    ),
  );

  if (isRealMarketPaper(mode) && input.data_mode_clarity.has_unknown_sources) {
    blockers.push(
      blocker(
        "confirm_data_reality",
        "unknown_sources_for_paper",
        "Unknown source metadata",
        "Real-market paper testing needs demo/mock/real/stale sources clearly identified.",
      ),
    );
  }

  if (isRealMarketPaper(mode) && input.data_mode_clarity.has_stale_market_data) {
    blockers.push(
      blocker(
        "confirm_data_reality",
        "stale_market_data_for_paper",
        "Stale market data",
        "Stale market data blocks trade-entry paper testing.",
      ),
    );
  }

  if (isRealMarketPaper(mode) && input.data_mode_clarity.has_demo_data) {
    warnings.push(
      warning(
        "confirm_data_reality",
        "demo_data_present_for_paper",
        "Demo data present",
        "Demo recommendations are not real trade signals; keep them visually separated during real-market paper testing.",
      ),
    );
  }

  if (isRealMarketPaper(mode) && input.data_mode_clarity.has_mock_broker_data) {
    warnings.push(
      warning(
        "confirm_data_reality",
        "mock_data_present_for_paper",
        "Mock broker data present",
        "Mock broker fills are test data and should not be read as real broker records.",
      ),
    );
  }

  checks.push(
    check(
      "confirm_data_reality",
      "data_source_reality",
      "Data/source reality",
      blockers.some((item) => item.step_id === "confirm_data_reality")
        ? "blocked"
        : warnings.some((item) => item.step_id === "confirm_data_reality")
          ? "warning"
          : "pass",
      input.data_mode_clarity.summary,
    ),
  );

  if (!input.risk_controls.enabled) {
    blockers.push(
      blocker(
        "confirm_risk_controls",
        "risk_controls_disabled",
        "Risk controls disabled",
        "Enable risk controls before running a live-like paper session.",
      ),
    );
  }

  if (
    isRealMarketPaper(mode) &&
    input.risk_controls.mode !== "real_prep" &&
    input.risk_controls.mode !== "strict"
  ) {
    warnings.push(
      warning(
        "confirm_risk_controls",
        "risk_controls_not_sharp_mode",
        "Risk mode needs review",
        "Real-market paper testing should use real_prep or strict risk-control mode.",
      ),
    );
  }

  if (
    input.risk_controls.max_trades_per_day === null ||
    input.risk_controls.max_trades_per_day <= 0
  ) {
    blockers.push(
      blocker(
        "confirm_risk_controls",
        "max_trades_missing",
        "Max trades/day missing",
        "Configure max trades/day before testing.",
      ),
    );
  }

  if (
    (input.risk_controls.max_daily_loss_amount === null ||
      input.risk_controls.max_daily_loss_amount <= 0) &&
    (input.risk_controls.max_daily_loss_r === null ||
      input.risk_controls.max_daily_loss_r <= 0)
  ) {
    blockers.push(
      blocker(
        "confirm_risk_controls",
        "max_daily_loss_missing",
        "Max daily loss missing",
        "Configure max daily loss amount or R before testing.",
      ),
    );
  }

  if (
    input.risk_controls.max_open_positions === null ||
    input.risk_controls.max_open_positions <= 0
  ) {
    blockers.push(
      blocker(
        "confirm_risk_controls",
        "max_open_positions_missing",
        "Max open positions missing",
        "Configure max open positions before testing.",
      ),
    );
  }

  checks.push(
    check(
      "confirm_risk_controls",
      "risk_controls_ready",
      "Risk controls",
      blockers.some((item) => item.step_id === "confirm_risk_controls")
        ? "blocked"
        : warnings.some((item) => item.step_id === "confirm_risk_controls")
          ? "warning"
          : "pass",
      "Risk controls should be enabled with daily loss, trade count, and open-position limits configured.",
    ),
  );

  if (isMarketTradeSessionBlocked(input.market_session.phase, mode)) {
    blockers.push(
      blocker(
        "confirm_market_session",
        "market_not_live_like",
        "Market session not live-like",
        `Current market session is ${input.market_session.phase}; wait for regular session for trade-entry paper testing.`,
      ),
    );
  }

  if (
    input.market_session.phase === "closing_soon" ||
    input.market_session.phase === "power_hour"
  ) {
    warnings.push(
      warning(
        "confirm_market_session",
        "market_timing_elevated",
        "Market timing elevated",
        "Closing-sensitive sessions require extra review. No automatic selling is available.",
      ),
    );
  }

  if (input.market_session.risk_level === "unknown") {
    warnings.push(
      warning(
        "confirm_market_session",
        "market_session_unknown",
        "Market session unknown",
        "Verify market status manually before testing.",
      ),
    );
  }

  checks.push(
    check(
      "confirm_market_session",
      "market_session",
      "Market session",
      blockers.some((item) => item.step_id === "confirm_market_session")
        ? "blocked"
        : warnings.some((item) => item.step_id === "confirm_market_session")
          ? "warning"
          : "pass",
      input.market_session.next_recommended_action,
    ),
  );

  if (acceptedCount === 0) {
    warnings.push(
      warning(
        "review_recommendations",
        "no_accepted_recommendations",
        "No accepted recommendations",
        "Run this as a no-trade observation session. A no-trade session can still be a successful test.",
      ),
    );
  }

  if (needsReviewCount > 0) {
    warnings.push(
      warning(
        "review_recommendations",
        "needs_review_recommendations",
        "Needs-review recommendations",
        `${needsReviewCount} candidate${needsReviewCount === 1 ? "" : "s"} need manual review.`,
      ),
    );
  }

  if (acceptedCount === 0 && rejectedIncompleteCount > 0) {
    warnings.push(
      warning(
        "review_recommendations",
        "rejected_incomplete_only",
        "Rejected/incomplete-only scan",
        "Rejected or incomplete candidates block trade-entry testing but support a valid no-trade session.",
      ),
    );
  }

  checks.push(
    check(
      "review_recommendations",
      "recommendation_review",
      "Recommendation review",
      warnings.some((item) => item.step_id === "review_recommendations")
        ? "warning"
        : "pass",
      acceptedCount > 0
        ? `${acceptedCount} accepted recommendation${acceptedCount === 1 ? "" : "s"} available for paper-review flow.`
        : input.empty_state_summary.primary_reason.message,
    ),
  );

  checks.push(
    check(
      "paper_trade_entry",
      "paper_entry_manual_only",
      "Paper entry flow",
      acceptedCount > 0 ? "pending" : "warning",
      acceptedCount > 0
        ? "Open ADD TRADE, review preflight, prepare order details, and use mock/manual paper fill only."
        : "No accepted setup is available; skip paper entry and record a no-trade outcome.",
    ),
  );

  checks.push(
    check(
      "monitor_position",
      "monitor_without_auto_sell",
      "Position monitoring",
      input.live_positions_count && input.live_positions_count > 0
        ? "pending"
        : "pending",
      "Follow live sell guidance and EOD warnings manually. Ture does not sell automatically.",
    ),
  );

  checks.push(
    check(
      "close_paper_trade",
      "paper_exit_manual_only",
      "Paper exit flow",
      "pending",
      "Use Prepare Sell / Close Trade with mock/manual paper exit fill. Do not use Avanza SÄLJ during paper testing.",
    ),
  );

  checks.push(
    check(
      "review_outcome",
      "review_history_statistics",
      "Review outcome",
      input.closed_trades_today_count && input.closed_trades_today_count > 0
        ? "pending"
        : "pending",
      "Review History, Statistics, Plan vs Actual, and Plan Adherence after the session.",
    ),
  );

  checks.push(
    check(
      "end_session",
      "session_outcome",
      "Session outcome",
      "pending",
      "End as no-trade valid, paper trade completed, blocked, or needs review.",
    ),
  );

  return { checks, blockers, warnings };
}

function buildSteps(
  checks: PaperSessionProtocolCheck[],
  blockers: PaperSessionProtocolBlocker[],
  warnings: PaperSessionProtocolWarning[],
  state: PaperSessionProtocolLocalState,
) {
  const completed = new Set(state.completed_step_ids);
  const firstIncomplete = stepOrder.find((stepId) => !completed.has(stepId));

  return stepOrder.map((stepId, index): PaperSessionProtocolStep => {
    const stepChecks = checks.filter((item) => item.step_id === stepId);
    const stepBlockers = blockers.filter((item) => item.step_id === stepId);
    const stepWarnings = warnings.filter((item) => item.step_id === stepId);
    const userCompleted = completed.has(stepId);
    const canMarkComplete = stepBlockers.length === 0;
    let status: PaperSessionProtocolStepStatus = "pending";

    if (stepBlockers.length > 0) {
      status = "blocked";
    } else if (userCompleted) {
      status = "complete";
    } else if (stepWarnings.length > 0) {
      status = "warning";
    } else if (state.session_started_at && firstIncomplete === stepId) {
      status = "active";
    }

    return {
      step_id: stepId,
      order: index + 1,
      label: stepLabels[stepId],
      status,
      summary: stepChecks[0]?.message ?? stepLabels[stepId],
      checks: stepChecks,
      blocker_ids: stepBlockers.map((item) => item.blocker_id),
      warning_ids: stepWarnings.map((item) => item.warning_id),
      user_completed: userCompleted,
      can_mark_complete: canMarkComplete,
    };
  });
}

function determineStatus(
  state: PaperSessionProtocolLocalState,
  blockers: PaperSessionProtocolBlocker[],
  warnings: PaperSessionProtocolWarning[],
  completedStepCount: number,
  totalStepCount: number,
): PaperSessionProtocolStatus {
  if (state.session_ended_at) {
    return "completed";
  }

  if (blockers.length > 0) {
    return "blocked";
  }

  if (state.session_started_at) {
    return "in_progress";
  }

  if (warnings.length > 0) {
    return "needs_review";
  }

  if (completedStepCount >= totalStepCount) {
    return "completed";
  }

  return "ready_to_start";
}

function buildNextActions(
  status: PaperSessionProtocolStatus,
  steps: PaperSessionProtocolStep[],
  blockers: PaperSessionProtocolBlocker[],
  warnings: PaperSessionProtocolWarning[],
): PaperSessionProtocolNextAction[] {
  if (status === "blocked" && blockers[0]) {
    return [
      action(
        `resolve_${blockers[0].blocker_id}`,
        `Resolve ${blockers[0].label}`,
        blockers[0].message,
        "primary",
      ),
      action(
        "no_trade_observation",
        "Run no-trade observation",
        "A no-trade observation can still be valid when trade-entry testing is blocked.",
      ),
    ];
  }

  if (status === "needs_review" && warnings[0]) {
    return [
      action(
        "review_protocol_warnings",
        "Review warnings",
        warnings[0].message,
        "primary",
      ),
      action(
        "paper_mode_process",
        "Keep it paper-only",
        "Paper mode tests process quality, not profitability.",
      ),
    ];
  }

  if (status === "ready_to_start") {
    return [
      action(
        "start_protocol",
        "Start paper protocol",
        "Begin the local paper-session checklist before using ADD TRADE.",
        "primary",
      ),
      action(
        "avoid_real_orders",
        "Avoid real Avanza orders",
        "Do not place real Avanza orders during paper testing.",
      ),
    ];
  }

  if (status === "in_progress") {
    const nextStep = steps.find(
      (step) => step.status === "active" || step.status === "warning",
    );

    return [
      action(
        nextStep ? `complete_${nextStep.step_id}` : "continue_protocol",
        nextStep ? nextStep.label : "Continue checklist",
        nextStep?.summary ?? "Continue the paper-session checklist.",
        "primary",
      ),
      action(
        "manual_only",
        "Manual only",
        "Ture does not send broker orders.",
      ),
    ];
  }

  return [
    action(
      "review_session",
      "Review session",
      "Review History, Statistics, Plan vs Actual, and Plan Adherence.",
      "primary",
    ),
    action(
      "record_outcome",
      "Record outcome locally",
      "End as no-trade valid, paper trade completed, blocked, or needs review.",
    ),
  ];
}

export function buildPaperSessionProtocolSummary(
  input: PaperSessionProtocolInput,
): PaperSessionProtocolSummary {
  const generatedAt = (toDate(input.now) ?? new Date()).toISOString();
  const state = normalizePaperSessionProtocolState({
    ...input.protocol_state,
    selected_mode: input.mode ?? input.protocol_state?.selected_mode,
  });
  const stepChecks = buildStepChecks({ ...input, mode: state.selected_mode });
  const steps = buildSteps(
    stepChecks.checks,
    stepChecks.blockers,
    stepChecks.warnings,
    state,
  );
  const completedStepCount = steps.filter((step) => step.user_completed).length;
  const status = determineStatus(
    state,
    stepChecks.blockers,
    stepChecks.warnings,
    completedStepCount,
    steps.length,
  );
  const acceptedCount = input.scan_observability.intake_counts.accepted;
  const paperTradeAllowed =
    status !== "blocked" &&
    acceptedCount > 0 &&
    !stepChecks.blockers.some(
      (item) =>
        item.step_id === "confirm_readiness" ||
        item.step_id === "confirm_data_reality" ||
        item.step_id === "confirm_risk_controls" ||
        item.step_id === "confirm_market_session",
    );

  return {
    summary_id: `paper-session-protocol-${generatedAt}`,
    summary_version: "1.0",
    summary_kind: "paper_session_protocol",
    generated_at: generatedAt,
    mode: state.selected_mode,
    status,
    started_at: state.session_started_at,
    ended_at: state.session_ended_at,
    outcome: state.session_outcome,
    ready_to_start: status === "ready_to_start" || status === "needs_review",
    paper_trade_allowed_by_protocol: paperTradeAllowed,
    no_trade_session_valid: true,
    steps,
    checks: stepChecks.checks,
    blockers: stepChecks.blockers,
    warnings: stepChecks.warnings,
    next_actions: buildNextActions(
      status,
      steps,
      stepChecks.blockers,
      stepChecks.warnings,
    ),
    completed_step_count: completedStepCount,
    total_step_count: steps.length,
    summary:
      status === "blocked"
        ? "Paper session protocol is blocked for trade-entry testing. A no-trade observation can still be valid."
        : status === "completed"
          ? "Paper session protocol is completed. Review outcome quality before the next session."
          : status === "in_progress"
            ? "Paper session protocol is in progress. Keep the flow paper-only and manual."
            : status === "needs_review"
              ? "Paper session protocol needs manual review before starting."
              : "Paper session protocol is ready to start. Paper mode tests process quality, not profitability.",
  };
}

export function paperSessionProtocolSummaryJson(
  summary: PaperSessionProtocolSummary,
) {
  return JSON.stringify(summary, null, 2);
}
