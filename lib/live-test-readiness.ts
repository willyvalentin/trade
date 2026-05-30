import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { MarketSessionEvaluation } from "@/lib/market-session";
import type {
  RecommendationEmptyStateSummary,
} from "@/lib/recommendation-empty-state";
import type {
  RecommendationIntakeQualityResult,
} from "@/lib/recommendation-intake-quality";
import type { RiskControlsSettings } from "@/lib/risk-controls";
import type { ScanPipelineObservabilitySummary } from "@/lib/scan-pipeline-observability";

export type LiveTestReadinessStatus =
  | "ready_for_paper_test"
  | "ready_for_real_prep"
  | "ready_for_tiny_live_test"
  | "needs_review"
  | "blocked"
  | "unknown";

export type LiveTestReadinessMode =
  | "demo_rehearsal"
  | "real_market_paper"
  | "real_prep_manual"
  | "tiny_live_manual"
  | "unknown";

export type LiveTestReadinessCheckStatus =
  | "pass"
  | "warning"
  | "blocked"
  | "unknown";

export type LiveTestReadinessCategory =
  | "data_source"
  | "scan_health"
  | "recommendation_quality"
  | "market_session"
  | "risk_controls"
  | "position_sizing"
  | "execution_safety"
  | "demo_mock_state"
  | "open_positions";

export type LiveTestReadinessBlocker = {
  blocker_id: string;
  label: string;
  message: string;
  category: LiveTestReadinessCategory;
};

export type LiveTestReadinessWarning = {
  warning_id: string;
  label: string;
  message: string;
  category: LiveTestReadinessCategory;
};

export type LiveTestReadinessCheck = {
  check_id: string;
  label: string;
  category: LiveTestReadinessCategory;
  status: LiveTestReadinessCheckStatus;
  message: string;
  blocker_ids: string[];
  warning_ids: string[];
};

export type LiveTestReadinessNextAction = {
  action_id: string;
  label: string;
  message: string;
  priority: "primary" | "secondary";
};

export type LiveTestReadinessSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "live_test_readiness";
  generated_at: string;
  status: LiveTestReadinessStatus;
  mode: LiveTestReadinessMode;
  trade_entry_allowed_by_readiness: boolean;
  no_trade_session_allowed: boolean;
  checks: LiveTestReadinessCheck[];
  blockers: LiveTestReadinessBlocker[];
  warnings: LiveTestReadinessWarning[];
  next_actions: LiveTestReadinessNextAction[];
  grouped_check_counts: Record<
    LiveTestReadinessCategory,
    Record<LiveTestReadinessCheckStatus, number>
  >;
  summary: string;
};

export type LiveTestReadinessInput = {
  mode?: LiveTestReadinessMode | null;
  data_mode_clarity: DataModeClaritySummary;
  scan_observability: ScanPipelineObservabilitySummary;
  intake_results: RecommendationIntakeQualityResult[];
  empty_state_summary: RecommendationEmptyStateSummary;
  risk_controls: RiskControlsSettings;
  market_session: MarketSessionEvaluation;
  position_sizing?: {
    account_size?: number | null;
    default_risk_amount?: number | null;
    default_risk_percent?: number | null;
    max_position_value?: number | null;
    mode?: string | null;
  } | null;
  open_positions?: {
    count?: number | null;
    demo_count?: number | null;
  } | null;
  closed_trades_today_count?: number | null;
  execution_safety?: {
    broker_automation_enabled?: boolean | null;
    browser_control_enabled?: boolean | null;
    avanza_automation_enabled?: boolean | null;
    credential_handling_enabled?: boolean | null;
    order_submission_enabled?: boolean | null;
    automatic_trade_create_or_close_enabled?: boolean | null;
    human_confirmation_required?: boolean | null;
    agent_packages_read_only?: boolean | null;
  } | null;
  now?: Date | string | null;
};

const categories: LiveTestReadinessCategory[] = [
  "data_source",
  "scan_health",
  "recommendation_quality",
  "market_session",
  "risk_controls",
  "position_sizing",
  "execution_safety",
  "demo_mock_state",
  "open_positions",
];

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

function isPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isRealLikeMode(mode: LiveTestReadinessMode) {
  return (
    mode === "real_market_paper" ||
    mode === "real_prep_manual" ||
    mode === "tiny_live_manual"
  );
}

function isTradeEntryMode(mode: LiveTestReadinessMode) {
  return mode !== "demo_rehearsal" && mode !== "unknown";
}

function blocker(
  category: LiveTestReadinessCategory,
  blocker_id: string,
  label: string,
  message: string,
): LiveTestReadinessBlocker {
  return { blocker_id, label, message, category };
}

function warning(
  category: LiveTestReadinessCategory,
  warning_id: string,
  label: string,
  message: string,
): LiveTestReadinessWarning {
  return { warning_id, label, message, category };
}

function check(
  category: LiveTestReadinessCategory,
  check_id: string,
  label: string,
  status: LiveTestReadinessCheckStatus,
  message: string,
  blockers: LiveTestReadinessBlocker[] = [],
  warnings: LiveTestReadinessWarning[] = [],
): LiveTestReadinessCheck {
  return {
    check_id,
    label,
    category,
    status,
    message,
    blocker_ids: blockers.map((item) => item.blocker_id),
    warning_ids: warnings.map((item) => item.warning_id),
  };
}

function action(
  action_id: string,
  label: string,
  message: string,
  priority: LiveTestReadinessNextAction["priority"] = "secondary",
): LiveTestReadinessNextAction {
  return { action_id, label, message, priority };
}

function inferMode(input: LiveTestReadinessInput): LiveTestReadinessMode {
  if (input.mode && input.mode !== "unknown") {
    return input.mode;
  }

  if (input.risk_controls.mode === "strict") {
    return "tiny_live_manual";
  }

  if (input.risk_controls.mode === "real_prep") {
    return "real_prep_manual";
  }

  if (input.data_mode_clarity.has_demo_data) {
    return "demo_rehearsal";
  }

  return "real_market_paper";
}

function buildDataSourceChecks(
  input: LiveTestReadinessInput,
  mode: LiveTestReadinessMode,
) {
  const blockers: LiveTestReadinessBlocker[] = [];
  const warnings: LiveTestReadinessWarning[] = [];
  const checks: LiveTestReadinessCheck[] = [];
  const realLike = isRealLikeMode(mode);

  if (realLike && input.data_mode_clarity.has_unknown_sources) {
    blockers.push(
      blocker(
        "data_source",
        "unknown_source_real_test",
        "Unknown source on real-market test",
        "One or more critical surfaces have unknown source metadata.",
      ),
    );
  }

  if (realLike && input.data_mode_clarity.has_demo_data) {
    warnings.push(
      warning(
        "data_source",
        "demo_data_mixed_with_real_test",
        "Demo data present",
        "Demo recommendations or trades are present during a real-market test mode.",
      ),
    );
  }

  if (input.data_mode_clarity.has_mock_broker_data && realLike) {
    warnings.push(
      warning(
        "data_source",
        "mock_data_mixed_with_real_test",
        "Mock data present",
        "Mock broker/test fills are present during a real-market test mode.",
      ),
    );
  }

  checks.push(
    check(
      "data_source",
      "data_mode_clarity",
      "Data/source clarity",
      blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
      blockers.length > 0
        ? "Data/source clarity blocks real-market testing."
        : "Demo, mock, real, stale, Supabase, manual, and agent-package states are labelled.",
      blockers,
      warnings,
    ),
  );

  return { checks, blockers, warnings };
}

function buildScanChecks(input: LiveTestReadinessInput, mode: LiveTestReadinessMode) {
  const blockers: LiveTestReadinessBlocker[] = [];
  const warnings: LiveTestReadinessWarning[] = [];
  const checks: LiveTestReadinessCheck[] = [];
  const status = input.scan_observability.status;
  const dataAge = input.scan_observability.run_context.data_age_minutes;
  const realLike = isRealLikeMode(mode);

  if (
    realLike &&
    (status === "stale" || status === "incomplete" || status === "unknown")
  ) {
    blockers.push(
      blocker(
        "scan_health",
        "scan_not_healthy_for_real_test",
        "Scan health not ready",
        `Scan observability is ${status}; real-market paper testing needs fresh observable scan context.`,
      ),
    );
  } else if (status === "degraded") {
    warnings.push(
      warning(
        "scan_health",
        "scan_degraded",
        "Scan degraded",
        "Scan observability is degraded; review diagnostics before testing.",
      ),
    );
  }

  if (realLike && dataAge !== null && dataAge > 45) {
    blockers.push(
      blocker(
        "scan_health",
        "scan_data_too_old",
        "Scan data too old",
        `Latest observable scan/recommendation data is ${dataAge}m old.`,
      ),
    );
  }

  if (input.scan_observability.unknown_metrics.length > 0) {
    warnings.push(
      warning(
        "scan_health",
        "unknown_scan_metrics",
        "Unknown scan metrics",
        "Some scan metrics are unavailable and shown as unknown rather than guessed.",
      ),
    );
  }

  checks.push(
    check(
      "scan_health",
      "scan_observability",
      "Scan health",
      blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
      blockers.length > 0
        ? "Scan health blocks real-market testing."
        : "Scan observability is usable for the selected test mode.",
      blockers,
      warnings,
    ),
  );

  return { checks, blockers, warnings };
}

function buildRecommendationChecks(
  input: LiveTestReadinessInput,
  mode: LiveTestReadinessMode,
) {
  const blockers: LiveTestReadinessBlocker[] = [];
  const warnings: LiveTestReadinessWarning[] = [];
  const acceptedCount = input.scan_observability.intake_counts.accepted;
  const rejectedIncomplete =
    input.scan_observability.intake_counts.rejected +
    input.scan_observability.intake_counts.incomplete;
  const needsReview = input.scan_observability.intake_counts.needs_review;

  if (acceptedCount === 0 && rejectedIncomplete > 0 && isTradeEntryMode(mode)) {
    blockers.push(
      blocker(
        "recommendation_quality",
        "no_accepted_recommendations_for_trade_test",
        "No accepted recommendations",
        "Rejected/incomplete-only candidates block trade-entry testing. A no-trade observation session is still valid.",
      ),
    );
  } else if (acceptedCount === 0) {
    warnings.push(
      warning(
        "recommendation_quality",
        "no_accepted_recommendations_no_trade_ok",
        "No accepted recommendations",
        "No accepted setup is available; use this as a no-trade or observation test.",
      ),
    );
  }

  if (needsReview > 0) {
    warnings.push(
      warning(
        "recommendation_quality",
        "needs_review_candidates_present",
        "Needs-review candidates present",
        `${needsReview} candidate${needsReview === 1 ? "" : "s"} need manual review.`,
      ),
    );
  }

  if (
    input.empty_state_summary.status === "data_unavailable" ||
    input.empty_state_summary.status === "scan_degraded"
  ) {
    warnings.push(
      warning(
        "recommendation_quality",
        "empty_state_not_clean",
        "No-trade context needs review",
        input.empty_state_summary.primary_reason.message,
      ),
    );
  }

  const checks = [
    check(
      "recommendation_quality",
      "recommendation_intake_quality",
      "Recommendation quality",
      blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
      acceptedCount > 0
        ? `${acceptedCount} accepted recommendation${acceptedCount === 1 ? "" : "s"} available.`
        : "No accepted recommendation is available; no-trade testing can still succeed.",
      blockers,
      warnings,
    ),
  ];

  return { checks, blockers, warnings };
}

function buildMarketChecks(input: LiveTestReadinessInput, mode: LiveTestReadinessMode) {
  const blockers: LiveTestReadinessBlocker[] = [];
  const warnings: LiveTestReadinessWarning[] = [];
  const phase = input.market_session.phase;
  const realLike = isRealLikeMode(mode);

  if (
    realLike &&
    (phase === "closed" ||
      phase === "holiday" ||
      phase === "after_hours" ||
      phase === "pre_market")
  ) {
    blockers.push(
      blocker(
        "market_session",
        "market_session_not_live_like",
        "Market session not live-like",
        `Current market session is ${phase}; trade-entry testing should wait for a regular session.`,
      ),
    );
  }

  if (phase === "closing_soon" || phase === "power_hour") {
    warnings.push(
      warning(
        "market_session",
        "market_session_elevated",
        "Market session elevated",
        `Current market session is ${phase}; review timing manually.`,
      ),
    );
  }

  if (input.market_session.risk_level === "unknown") {
    warnings.push(
      warning(
        "market_session",
        "market_session_unknown",
        "Market session unknown",
        "Market session risk is unknown and should be verified manually.",
      ),
    );
  }

  const checks = [
    check(
      "market_session",
      "market_session",
      "Market session",
      blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
      blockers.length > 0
        ? "Market session blocks trade-entry testing."
        : "Market session is acceptable for the selected test mode.",
      blockers,
      warnings,
    ),
  ];

  return { checks, blockers, warnings };
}

function buildRiskControlChecks(
  input: LiveTestReadinessInput,
  mode: LiveTestReadinessMode,
) {
  const blockers: LiveTestReadinessBlocker[] = [];
  const warnings: LiveTestReadinessWarning[] = [];
  const settings = input.risk_controls;

  if (!settings.enabled) {
    blockers.push(
      blocker(
        "risk_controls",
        "risk_controls_disabled",
        "Risk controls disabled",
        "Risk controls must be enabled before live-like testing.",
      ),
    );
  }

  if (mode === "tiny_live_manual" && settings.mode !== "strict") {
    blockers.push(
      blocker(
        "risk_controls",
        "strict_mode_required_for_tiny_live",
        "Strict mode required",
        "Tiny live manual testing requires strict risk-control mode.",
      ),
    );
  } else if (
    (mode === "real_market_paper" || mode === "real_prep_manual") &&
    settings.mode === "demo"
  ) {
    warnings.push(
      warning(
        "risk_controls",
        "risk_controls_demo_mode",
        "Risk controls in demo mode",
        "Real-market paper/prep testing should use real_prep or strict risk-control mode.",
      ),
    );
  }

  if (
    !isPositiveNumber(settings.max_risk_per_trade_amount) &&
    !isPositiveNumber(settings.max_risk_per_trade_percent)
  ) {
    blockers.push(
      blocker(
        "risk_controls",
        "max_risk_per_trade_missing",
        "Max risk per trade missing",
        "Configure max risk per trade amount or percent.",
      ),
    );
  }

  if (
    !isPositiveNumber(settings.max_daily_loss_amount) &&
    !isPositiveNumber(settings.max_daily_loss_r)
  ) {
    blockers.push(
      blocker(
        "risk_controls",
        "daily_loss_stop_missing",
        "Daily loss stop missing",
        "Configure max daily loss amount or R.",
      ),
    );
  }

  if (!isPositiveNumber(settings.max_trades_per_day)) {
    blockers.push(
      blocker(
        "risk_controls",
        "max_trades_per_day_missing",
        "Max trades/day missing",
        "Configure max trades per day before live-like testing.",
      ),
    );
  }

  if (!isPositiveNumber(settings.max_open_positions)) {
    blockers.push(
      blocker(
        "risk_controls",
        "max_open_positions_missing",
        "Max open positions missing",
        "Configure max open positions before live-like testing.",
      ),
    );
  }

  if (!settings.block_new_trades_after_daily_stop) {
    blockers.push(
      blocker(
        "risk_controls",
        "daily_stop_not_blocking",
        "Daily stop not blocking",
        "Enable blocking new trades after the daily stop is reached.",
      ),
    );
  }

  if (!settings.require_manual_review_for_real_mode) {
    blockers.push(
      blocker(
        "risk_controls",
        "manual_review_not_required",
        "Manual review not required",
        "Require manual review for real-mode workflows.",
      ),
    );
  }

  const checks = [
    check(
      "risk_controls",
      "risk_controls",
      "Risk controls",
      blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
      blockers.length > 0
        ? "Risk-control configuration blocks live-like testing."
        : "Risk controls are configured for the selected test mode.",
      blockers,
      warnings,
    ),
  ];

  return { checks, blockers, warnings };
}

function buildPositionSizingChecks(
  input: LiveTestReadinessInput,
  mode: LiveTestReadinessMode,
) {
  const blockers: LiveTestReadinessBlocker[] = [];
  const warnings: LiveTestReadinessWarning[] = [];
  const sizing = input.position_sizing;

  if (
    !isPositiveNumber(sizing?.account_size) &&
    !isPositiveNumber(sizing?.default_risk_amount) &&
    !isPositiveNumber(sizing?.default_risk_percent)
  ) {
    blockers.push(
      blocker(
        "position_sizing",
        "risk_budget_missing",
        "Risk budget missing",
        "Configure account size, default risk amount, or default risk percent.",
      ),
    );
  }

  if (!isPositiveNumber(sizing?.max_position_value)) {
    const item =
      mode === "tiny_live_manual"
        ? blocker(
            "position_sizing",
            "max_position_value_missing",
            "Max position value missing",
            "Tiny live manual testing requires max position value.",
          )
        : null;

    if (item) {
      blockers.push(item);
    } else {
      warnings.push(
        warning(
          "position_sizing",
          "max_position_value_missing",
          "Max position value missing",
          "Set max position value before sharper live-like testing.",
        ),
      );
    }
  }

  if (!sizing?.mode || sizing.mode === "unknown") {
    warnings.push(
      warning(
        "position_sizing",
        "position_sizing_mode_unknown",
        "Sizing mode unknown",
        "Position sizing mode should be known before testing.",
      ),
    );
  }

  const checks = [
    check(
      "position_sizing",
      "position_sizing",
      "Position sizing readiness",
      blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
      blockers.length > 0
        ? "Position sizing blocks live-like testing."
        : "Position sizing context is ready enough for the selected mode.",
      blockers,
      warnings,
    ),
  ];

  return { checks, blockers, warnings };
}

function buildExecutionSafetyChecks(input: LiveTestReadinessInput) {
  const blockers: LiveTestReadinessBlocker[] = [];
  const warnings: LiveTestReadinessWarning[] = [];
  const safety = input.execution_safety ?? {};
  const unsafeFlags: Array<[keyof NonNullable<LiveTestReadinessInput["execution_safety"]>, string]> = [
    ["broker_automation_enabled", "Broker automation must be disabled."],
    ["browser_control_enabled", "Browser control must be disabled."],
    ["avanza_automation_enabled", "Avanza automation must be disabled."],
    ["credential_handling_enabled", "Credential handling must be disabled."],
    ["order_submission_enabled", "Order submission must be unavailable."],
    [
      "automatic_trade_create_or_close_enabled",
      "Automatic Ture save/create/close must be disabled.",
    ],
  ];

  for (const [key, message] of unsafeFlags) {
    if (safety[key] === true) {
      blockers.push(
        blocker(
          "execution_safety",
          `unsafe_${key}`,
          "Unsafe execution capability",
          message,
        ),
      );
    } else if (safety[key] === null || safety[key] === undefined) {
      warnings.push(
        warning(
          "execution_safety",
          `unknown_${key}`,
          "Execution safety unknown",
          `${message} Current state is unknown.`,
        ),
      );
    }
  }

  if (safety.human_confirmation_required !== true) {
    blockers.push(
      blocker(
        "execution_safety",
        "human_confirmation_not_required",
        "Human confirmation not required",
        "Tiny/manual testing requires final Avanza KÖP/SÄLJ to be human-confirmed.",
      ),
    );
  }

  if (safety.agent_packages_read_only !== true) {
    blockers.push(
      blocker(
        "execution_safety",
        "agent_packages_not_read_only",
        "Agent packages not read-only",
        "Agent packages must remain read/prepare-only.",
      ),
    );
  }

  const checks = [
    check(
      "execution_safety",
      "execution_safety",
      "Execution safety",
      blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
      blockers.length > 0
        ? "Execution-safety constraints block testing."
        : "Broker automation, browser control, credentials, order submission, and automatic trading are disabled.",
      blockers,
      warnings,
    ),
  ];

  return { checks, blockers, warnings };
}

function buildDemoMockChecks(input: LiveTestReadinessInput, mode: LiveTestReadinessMode) {
  const warnings: LiveTestReadinessWarning[] = [];
  const realLike = isRealLikeMode(mode);

  if (realLike && input.data_mode_clarity.has_demo_data) {
    warnings.push(
      warning(
        "demo_mock_state",
        "demo_state_present",
        "Demo state present",
        "Clear or ignore demo recommendations/trades before real-market testing.",
      ),
    );
  }

  if (realLike && input.data_mode_clarity.has_mock_broker_data) {
    warnings.push(
      warning(
        "demo_mock_state",
        "mock_state_present",
        "Mock state present",
        "Mock broker/test fills are present; do not treat them as live broker records.",
      ),
    );
  }

  const checks = [
    check(
      "demo_mock_state",
      "demo_mock_state",
      "Demo/mock state",
      warnings.length > 0 ? "warning" : "pass",
      warnings.length > 0
        ? "Demo/mock state needs visual separation during real-market testing."
        : "No demo/mock conflict blocks the selected test mode.",
      [],
      warnings,
    ),
  ];

  return { checks, blockers: [], warnings };
}

function buildOpenPositionChecks(input: LiveTestReadinessInput) {
  const blockers: LiveTestReadinessBlocker[] = [];
  const warnings: LiveTestReadinessWarning[] = [];
  const openCount = input.open_positions?.count ?? null;
  const maxOpen = input.risk_controls.max_open_positions;

  if (openCount !== null && maxOpen !== null && openCount >= maxOpen) {
    blockers.push(
      blocker(
        "open_positions",
        "max_open_positions_reached",
        "Max open positions reached",
        `Open positions ${openCount} reached max ${maxOpen}. This blocks new trade-entry testing, not closing/selling flows.`,
      ),
    );
  } else if (openCount !== null && openCount > 0) {
    warnings.push(
      warning(
        "open_positions",
        "open_positions_present",
        "Open positions present",
        "Open positions require monitoring during any live-like test.",
      ),
    );
  }

  const checks = [
    check(
      "open_positions",
      "open_positions",
      "Open positions",
      blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
      blockers.length > 0
        ? "Open-position limits block new trade-entry testing."
        : "Open-position state does not block the selected test mode.",
      blockers,
      warnings,
    ),
  ];

  return { checks, blockers, warnings };
}

function buildGroupedCounts(checks: LiveTestReadinessCheck[]) {
  const grouped = Object.fromEntries(
    categories.map((category) => [
      category,
      { pass: 0, warning: 0, blocked: 0, unknown: 0 },
    ]),
  ) as LiveTestReadinessSummary["grouped_check_counts"];

  for (const item of checks) {
    grouped[item.category][item.status] += 1;
  }

  return grouped;
}

function determineStatus(
  mode: LiveTestReadinessMode,
  blockers: LiveTestReadinessBlocker[],
  warnings: LiveTestReadinessWarning[],
): LiveTestReadinessStatus {
  if (mode === "unknown") {
    return "unknown";
  }

  if (blockers.length > 0) {
    return "blocked";
  }

  if (warnings.length > 0) {
    return "needs_review";
  }

  if (mode === "tiny_live_manual") {
    return "ready_for_tiny_live_test";
  }

  if (mode === "real_prep_manual") {
    return "ready_for_real_prep";
  }

  return "ready_for_paper_test";
}

function buildNextActions(
  status: LiveTestReadinessStatus,
  blockers: LiveTestReadinessBlocker[],
  warnings: LiveTestReadinessWarning[],
) {
  const actions: LiveTestReadinessNextAction[] = [];
  const firstBlocker = blockers[0];

  if (firstBlocker) {
    actions.push(
      action(
        `resolve_${firstBlocker.blocker_id}`,
        `Resolve ${firstBlocker.label}`,
        firstBlocker.message,
        "primary",
      ),
    );
  } else if (warnings.length > 0) {
    actions.push(
      action(
        "review_warnings",
        "Review warnings",
        "Verify the warning items manually before testing.",
        "primary",
      ),
    );
  } else if (status === "ready_for_tiny_live_test") {
    actions.push(
      action(
        "tiny_live_manual_only",
        "Proceed manually only",
        "Tiny live mode still requires manual Avanza confirmation.",
        "primary",
      ),
    );
  } else if (status === "ready_for_paper_test") {
    actions.push(
      action(
        "paper_test_only",
        "Run paper/observation test",
        "Ready means paper/rehearsal only unless all manual live constraints are separately satisfied.",
        "primary",
      ),
    );
  }

  actions.push(
    action(
      "remember_no_trade_valid",
      "No-trade session is valid",
      "A no-trade session can still be a successful test.",
    ),
  );

  actions.push(
    action(
      "keep_manual_confirmation",
      "Keep manual confirmation",
      "Ture does not send broker orders; Avanza KÖP/SÄLJ remains human-confirmed.",
    ),
  );

  return actions.slice(0, 4);
}

export function buildLiveTestReadinessSummary(
  input: LiveTestReadinessInput,
): LiveTestReadinessSummary {
  const generatedAt = (toDate(input.now) ?? new Date()).toISOString();
  const mode = inferMode(input);
  const parts = [
    buildDataSourceChecks(input, mode),
    buildScanChecks(input, mode),
    buildRecommendationChecks(input, mode),
    buildMarketChecks(input, mode),
    buildRiskControlChecks(input, mode),
    buildPositionSizingChecks(input, mode),
    buildExecutionSafetyChecks(input),
    buildDemoMockChecks(input, mode),
    buildOpenPositionChecks(input),
  ];
  const checks = parts.flatMap((part) => part.checks);
  const blockers = parts.flatMap((part) => part.blockers);
  const warnings = parts.flatMap((part) => part.warnings);
  const status = determineStatus(mode, blockers, warnings);
  const noTradeSessionAllowed =
    status !== "unknown" &&
    !blockers.some(
      (item) =>
        item.category === "execution_safety" ||
        item.category === "data_source",
    );

  return {
    summary_id: `live-test-readiness-${generatedAt}`,
    summary_version: "1.0",
    summary_kind: "live_test_readiness",
    generated_at: generatedAt,
    status,
    mode,
    trade_entry_allowed_by_readiness: blockers.length === 0,
    no_trade_session_allowed: noTradeSessionAllowed,
    checks,
    blockers,
    warnings,
    next_actions: buildNextActions(status, blockers, warnings),
    grouped_check_counts: buildGroupedCounts(checks),
    summary:
      status === "blocked"
        ? "Live test readiness is blocked. Fix blockers before trade-entry testing."
        : status === "needs_review"
          ? "Live test readiness needs manual review. Readiness checks reduce operational risk; they do not predict trade profitability."
          : "Live test readiness checks pass for the selected mode. Readiness checks reduce operational risk; they do not predict trade profitability.",
  };
}

export function liveTestReadinessSummaryJson(
  summary: LiveTestReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
