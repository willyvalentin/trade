import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";
import type { MarketSessionEvaluation, MarketSessionStatus } from "@/lib/market-session";
import type { RealRecommendationOutputReadinessSummary } from "@/lib/real-recommendation-output-readiness";
import type { RealScannerCandidateGenerationSummary } from "@/lib/real-scanner-candidate-generation";
import type { RecommendationBatchSummary } from "@/lib/recommendation-batch-memory";
import type { RecommendationPerformanceStatistics } from "@/lib/recommendation-performance-statistics";
import type { RecommendationScanRunHistorySummary } from "@/lib/recommendation-scan-run-history";
import type { RecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import type { ScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import type { ScannerOutputQaSummary } from "@/lib/scanner-output-qa";
import type { ScannerUniverseCoverageSummary } from "@/lib/scanner-universe";
import type { ProviderBudgetGuardSummary } from "@/lib/provider-budget-guard";

export type LiveMarketTrialReadinessStatus =
  | "ready_for_real_data_observation"
  | "ready_for_next_window"
  | "ready_with_warnings"
  | "ready_for_recommendation_logging"
  | "blocked_by_provider"
  | "blocked_by_scheduler"
  | "blocked_by_market_closed"
  | "blocked_by_missing_env"
  | "needs_review"
  | "unknown";

export type LiveMarketTrialReadinessSource =
  | "environment"
  | "provider"
  | "market_session"
  | "scheduler"
  | "scanner"
  | "serving"
  | "persistence"
  | "outcomes"
  | "ui"
  | "data_reality"
  | "safety"
  | "trial_mode";

export type LiveMarketTrialReadinessCheck = {
  check_id: string;
  label: string;
  status: "pass" | "warning" | "blocked" | "unknown";
  message: string;
  source: LiveMarketTrialReadinessSource;
};

export type LiveMarketTrialReadinessBlocker = {
  blocker_id: string;
  message: string;
  source: LiveMarketTrialReadinessSource;
};

export type LiveMarketTrialReadinessWarning = {
  warning_id: string;
  message: string;
  source: LiveMarketTrialReadinessSource;
};

export type LiveMarketTrialReadinessNextAction = {
  action_id: string;
  priority: "critical" | "high" | "medium" | "low" | "watch";
  label: string;
  message: string;
};

export type LiveMarketTrialAutomationDiagnosticEntry = {
  created_at: string | null;
  window: string | null;
  status: string | null;
  result: string | null;
  message: string | null;
  recommendations_created: number | null;
};

export type LiveMarketTrialReadinessSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "live_market_trial_readiness";
  generated_at: string;
  overall_status: LiveMarketTrialReadinessStatus;
  summary: string;
  blockers: LiveMarketTrialReadinessBlocker[];
  warnings: LiveMarketTrialReadinessWarning[];
  checks: LiveMarketTrialReadinessCheck[];
  next_active_window: {
    window: string;
    label: string;
    starts_at: string | null;
  } | null;
  provider_env_readiness: {
    supabase_public_env_available: boolean;
    supabase_persistence_observed: boolean;
    twelve_data_provider_observed: boolean;
    openai_generation_observed: boolean;
    market_calendar_provider: string | null;
    market_calendar_available: boolean;
    market_calendar_confidence: DayTradeScanOrchestrationSummary["calendar_confidence"];
    fallback_calendar_scan_allowed: boolean;
    server_secret_status: "inferred_available" | "needs_review" | "unknown";
  };
  scanner_readiness: {
    status: string;
    selected_ticker_count: number;
    candidates_generated: number;
    provider_backed_candidates: number;
    scan_budget: number | null;
    ranking_selected_count: number | null;
    qa_status: string;
  };
  serving_readiness: {
    status: string;
    batch_type: string;
    batch_status: string;
    freshness_status: string;
    no_trade_valid: boolean;
    visible_recommendation_count: number;
  };
  persistence_readiness: {
    scan_runs_available: boolean;
    batches_available: boolean;
    snapshots_available: boolean;
    outcomes_available: boolean;
    latest_batch_persistence_mode: string;
  };
  outcome_readiness: {
    status: string;
    evaluated_recommendations: number;
    pending_outcomes: number;
    incomplete_outcomes: number;
    route_available: boolean;
  };
  provider_budget_readiness: {
    status: string;
    plan_mode: string;
    estimated_calls_per_window: number;
    estimated_calls_per_day: number;
    latest_limit_signal: string;
  };
  latest_automation_scan: {
    status: string;
    decision: string;
    window: string | null;
    created_at: string | null;
    message: string | null;
    last_provider_error: string | null;
  };
  automation_diagnostics: {
    scheduled_function_fired_at_utc: string | null;
    interpreted_ny_time: string;
    scan_decision: string;
    active_window: string;
    skipped_reason: string | null;
    latest_active_window_scan: LiveMarketTrialAutomationDiagnosticEntry | null;
    latest_skipped_scan: LiveMarketTrialAutomationDiagnosticEntry | null;
  };
  can_do_now: {
    observe_only: boolean;
    log_recommendations: boolean;
    evaluate_outcomes: boolean;
    paper_or_manual_tracking_ready: boolean;
  };
  not_enabled: {
    broker_automation: true;
    order_submission: true;
    automatic_avanza_execution: true;
    automatic_trading_execution: true;
  };
  suggested_monday_trial_action: LiveMarketTrialReadinessNextAction;
  copy: {
    purpose: string;
    profitability_boundary: string;
    execution_boundary: string;
    closed_market: string;
  };
};

export type LiveMarketTrialReadinessInput = {
  supabase_public_env_available: boolean;
  market_session: MarketSessionEvaluation;
  market_status: MarketSessionStatus | null;
  scan_orchestration: DayTradeScanOrchestrationSummary;
  scanner_universe: ScannerUniverseCoverageSummary;
  scanner_generation?: RealScannerCandidateGenerationSummary | null;
  scanner_ranking?: ScannerCandidateRankingSummary | null;
  scanner_qa: ScannerOutputQaSummary;
  serving_cadence: RecommendationServingCadenceSummary;
  batch_memory: RecommendationBatchSummary;
  scan_run_history: RecommendationScanRunHistorySummary;
  performance: RecommendationPerformanceStatistics;
  real_output_readiness: RealRecommendationOutputReadinessSummary;
  data_mode_clarity: DataModeClaritySummary;
  provider_budget_guard?: ProviderBudgetGuardSummary | null;
  outcome_evaluation?: {
    status?: string | null;
    route_available?: boolean | null;
    eligible_snapshot_count?: number | null;
    evaluated_snapshot_count?: number | null;
    incomplete_snapshot_count?: number | null;
    missing_candle_count?: number | null;
    provider_error_count?: number | null;
  } | null;
  automation_scan_route_available?: boolean | null;
  latest_automation_scan?: {
    result?: string | null;
    scan_window?: string | null;
    created_at?: string | null;
    message?: string | null;
    automation_run_diagnostics?: {
      scheduled_function_fired_at_utc?: string | null;
      interpreted_ny_time?: string | null;
      scan_decision?: string | null;
      active_window?: string | null;
      skipped_reason?: string | null;
    } | null;
  } | null;
  latest_active_window_scan?: LiveMarketTrialAutomationDiagnosticEntry | null;
  latest_skipped_scan?: LiveMarketTrialAutomationDiagnosticEntry | null;
  ui_surfaces?: {
    recommendations_primary_clean?: boolean | null;
    live_day_trades_primary_clean?: boolean | null;
    stats_today_available?: boolean | null;
    market_readiness_panel_available?: boolean | null;
    history_statistics_available?: boolean | null;
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

function words(value: string | null | undefined) {
  return (value || "unknown").replaceAll("_", " ");
}

function count(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function check(input: LiveMarketTrialReadinessCheck) {
  return input;
}

function blocker(
  checkItem: LiveMarketTrialReadinessCheck,
): LiveMarketTrialReadinessBlocker {
  return {
    blocker_id: checkItem.check_id,
    message: checkItem.message,
    source: checkItem.source,
  };
}

function warning(
  checkItem: LiveMarketTrialReadinessCheck,
): LiveMarketTrialReadinessWarning {
  return {
    warning_id: checkItem.check_id,
    message: checkItem.message,
    source: checkItem.source,
  };
}

function isProviderBlocked(input: LiveMarketTrialReadinessInput, activeWindow: boolean) {
  return (
    (activeWindow &&
      (input.scanner_generation?.status === "blocked" ||
        input.scanner_qa.overall_status === "blocked" ||
        input.real_output_readiness.overall_status ===
          "blocked_by_missing_market_data" ||
        input.real_output_readiness.overall_status ===
          "blocked_by_generation_gap"))
  );
}

function isServingReady(serving: RecommendationServingCadenceSummary) {
  return (
    serving.status === "ready" ||
    serving.status === "published" ||
    serving.status === "no_trade_valid" ||
    serving.status === "refreshing_silently" ||
    serving.status === "opportunistic_update_available"
  );
}

function isActiveTrialWindow(window: string) {
  return window === "morning" || window === "midday" || window === "power_hour";
}

function isMarketWaitState(input: LiveMarketTrialReadinessInput) {
  if (isActiveTrialWindow(input.scan_orchestration.active_window)) {
    return false;
  }

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

function buildNextWindow(input: LiveMarketTrialReadinessInput) {
  const window =
    input.scan_orchestration.next_window !== "unknown"
      ? input.scan_orchestration.next_window
      : input.serving_cadence.next_window;
  const startsAt =
    input.scan_orchestration.next_window_starts_at ??
    input.serving_cadence.next_window_starts_at;

  if (window === "unknown" || window === "closed") {
    return null;
  }

  return {
    window,
    label:
      input.scan_orchestration.next_window_label ||
      words(input.serving_cadence.next_window),
    starts_at: startsAt ?? null,
  };
}

function buildSuggestedAction(input: {
  status: LiveMarketTrialReadinessStatus;
  blockers: LiveMarketTrialReadinessBlocker[];
  warnings: LiveMarketTrialReadinessWarning[];
  nextWindow: LiveMarketTrialReadinessSummary["next_active_window"];
  canLogRecommendations: boolean;
}): LiveMarketTrialReadinessNextAction {
  const firstBlocker = input.blockers[0];

  if (firstBlocker) {
    return {
      action_id: `resolve_${firstBlocker.blocker_id}`,
      priority: "critical",
      label: "Resolve readiness blocker",
      message: firstBlocker.message,
    };
  }

  if (input.status === "blocked_by_market_closed") {
    return {
      action_id: "wait_for_market_window",
      priority: "watch",
      label: "Wait for the next active window",
      message:
        input.nextWindow === null
          ? "Market is closed and no next active recommendation window is available yet."
          : `Market is closed. Recheck during ${input.nextWindow.label}.`,
    };
  }

  if (input.status === "ready_for_next_window") {
    return {
      action_id: "wait_for_next_active_window",
      priority: "watch",
      label: "Wait for the next active window",
      message:
        input.nextWindow === null
          ? "Closed market is a wait state. Recheck when the next active scan window is available."
          : `Market is closed. Ture is waiting for ${input.nextWindow.label}.`,
    };
  }

  if (input.canLogRecommendations) {
    return {
      action_id: "run_live_recommendation_logging_trial",
      priority: input.warnings.length > 0 ? "medium" : "high",
      label: "Run the live recommendation logging trial",
      message:
        "During the next live US window, let scheduled scans serve the official batch, persist snapshots/batches/scan runs, and review Stats Today, History, and Statistics.",
    };
  }

  return {
    action_id: "observe_real_market_data_first",
    priority: input.warnings.length > 0 ? "medium" : "watch",
    label: "Start with observation only",
    message:
      "Observe provider data, scan cadence, recommendation logging, and outcome readiness before treating batches as trial records.",
  };
}

function determineOverallStatus(input: {
  blockers: LiveMarketTrialReadinessBlocker[];
  warnings: LiveMarketTrialReadinessWarning[];
  marketWaitState: boolean;
  canLogRecommendations: boolean;
  canObserve: boolean;
}): LiveMarketTrialReadinessStatus {
  if (input.blockers.some((item) => item.source === "environment")) {
    return "blocked_by_missing_env";
  }

  if (input.blockers.some((item) => item.source === "provider")) {
    return "blocked_by_provider";
  }

  if (input.blockers.some((item) => item.source === "scheduler")) {
    return "blocked_by_scheduler";
  }

  if (input.blockers.length > 0) {
    return "needs_review";
  }

  if (input.marketWaitState && input.canObserve) {
    return "ready_for_next_window";
  }

  if (input.canLogRecommendations && input.warnings.length === 0) {
    return "ready_for_recommendation_logging";
  }

  if (input.canObserve && input.warnings.length === 0) {
    return "ready_for_real_data_observation";
  }

  if (input.canObserve) {
    return "ready_with_warnings";
  }

  return "unknown";
}

function statusSummary(status: LiveMarketTrialReadinessStatus) {
  if (status === "ready_for_recommendation_logging") {
    return "Ture is ready to log official recommendation batches during a live US market window.";
  }

  if (status === "ready_for_real_data_observation") {
    return "Ture is ready for real-market observation.";
  }

  if (status === "ready_for_next_window") {
    return "Closed market is a wait state, not a scanner failure. Ture is ready for the next active scan window with current warnings.";
  }

  if (status === "ready_with_warnings") {
    return "Ture is ready to observe real market data, with items to watch during the trial.";
  }

  if (status === "blocked_by_provider") {
    return "A provider or real-data source is blocking the live-market trial.";
  }

  if (status === "blocked_by_scheduler") {
    return "The scheduled scan path needs review before the live-market trial.";
  }

  if (status === "blocked_by_market_closed") {
    return "Market status is closed and no next active recommendation window is available.";
  }

  if (status === "blocked_by_missing_env") {
    return "Required environment configuration is missing.";
  }

  if (status === "needs_review") {
    return "Live-market trial readiness needs review before relying on recommendation logging.";
  }

  return "Live-market trial readiness is unknown.";
}

export function buildLiveMarketTrialReadinessSummary(
  input: LiveMarketTrialReadinessInput,
): LiveMarketTrialReadinessSummary {
  const now = toDate(input.now) ?? new Date();
  const scannerGeneration = input.scanner_generation ?? null;
  const scannerRanking = input.scanner_ranking ?? null;
  const latestBatch = input.batch_memory.latest_batch;
  const successfulLiveBatchObserved =
    latestBatch !== null &&
    latestBatch.batch_type === "official" &&
    (latestBatch.status === "published" || latestBatch.status === "partial") &&
    latestBatch.recommendation_count > 0;
  const outcomeEvaluation = input.outcome_evaluation ?? null;
  const providerBudgetGuard = input.provider_budget_guard ?? null;
  const latestAutomationScan = input.latest_automation_scan ?? null;
  const nextWindow = buildNextWindow(input);
  const selectedTickerCount =
    scannerGeneration?.universe.selected_ticker_count ??
    input.scanner_universe.selected_tickers ??
    0;
  const candidatesGenerated = scannerGeneration?.universe.candidates_generated ?? 0;
  const providerBackedCandidates =
    scannerGeneration?.universe.provider_backed_candidates ?? 0;
  const scanBudget =
    scannerGeneration?.universe.scan_budget?.requested_tickers ??
    input.scanner_universe.scan_budget.requested_tickers ??
    null;
  const marketCalendarAvailable =
    input.market_status !== null && input.market_status.dayType !== "unknown";
  const fallbackCalendarScanAllowed =
    input.scan_orchestration.fallback_calendar_scan_allowed;
  const supabasePersistenceObserved =
    input.batch_memory.persistence_mode === "supabase" ||
    input.scan_run_history.source_scope === "supabase" ||
    input.scan_run_history.source_scope === "mixed";
  const openAiGenerationObserved =
    input.real_output_readiness.coverage.visible_recommendations > 0 &&
    input.real_output_readiness.overall_status !== "blocked_by_generation_gap";
  const twelveDataProviderObserved =
    providerBackedCandidates > 0 ||
    input.real_output_readiness.coverage.market_data_coverage_rate > 0;
  const serverSecretStatus =
    openAiGenerationObserved || twelveDataProviderObserved
      ? "inferred_available"
      : "unknown";
  const activeWindow = isActiveTrialWindow(input.scan_orchestration.active_window);
  const marketWaitState = isMarketWaitState(input);
  const marketClosedWithNextWindow =
    marketWaitState &&
    (input.scan_orchestration.active_window === "closed" ||
      input.scan_orchestration.active_window === "outside_window" ||
      input.scan_orchestration.decision === "market_closed" ||
      input.scan_orchestration.decision === "outside_scan_window") &&
    nextWindow !== null;
  const marketClosedWithoutNextWindow =
    marketWaitState &&
    (input.scan_orchestration.active_window === "closed" ||
      input.scan_orchestration.active_window === "outside_window" ||
      input.scan_orchestration.decision === "market_closed" ||
      input.scan_orchestration.decision === "outside_scan_window") &&
    nextWindow === null;
  const servingReady = isServingReady(input.serving_cadence);
  const persistenceReady =
    input.batch_memory.persistence_status !== "failed" &&
    input.batch_memory.persistence_mode !== "none";
  const outcomesReady =
    outcomeEvaluation?.route_available !== false &&
    input.performance.summary.total_recommendations >= 0;
  const latestAutomationDecision =
    latestAutomationScan?.result === "market_closed"
      ? "skipped_market_closed"
      : latestAutomationScan?.result === "provider_error" ||
          latestAutomationScan?.result === "provider_rate_limited"
        ? "skipped_provider_unavailable"
        : latestAutomationScan?.result === "skipped"
          ? "skipped_outside_window"
          : latestAutomationScan?.result === "recommendation_created"
            ? "scanned"
            : "unknown";
  const skippedReason =
    latestAutomationScan?.automation_run_diagnostics?.skipped_reason ??
    (latestAutomationDecision.startsWith("skipped")
      ? latestAutomationScan?.message ?? input.scan_orchestration.scan_reason
      : input.scan_orchestration.decision === "market_closed" ||
          input.scan_orchestration.decision === "outside_scan_window"
        ? input.scan_orchestration.scan_reason
        : null);

  const checks = [
    check({
      check_id: "supabase_public_env",
      label: "Supabase public env",
      status: input.supabase_public_env_available ? "pass" : "blocked",
      source: "environment",
      message: input.supabase_public_env_available
        ? "Supabase public client configuration is available."
        : "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.",
    }),
    check({
      check_id: "server_provider_env",
      label: "Provider/server env",
      status: serverSecretStatus === "inferred_available" ? "pass" : "warning",
      source: "environment",
      message:
        serverSecretStatus === "inferred_available"
          ? "Recent provider-backed data or generated output implies server-side API keys are available."
          : "Server-only OpenAI/Twelve Data keys are not exposed to the client; confirm through the next scheduled scan.",
    }),
    check({
      check_id: "provider_budget_guard",
      label: "Provider budget guard",
      status:
        providerBudgetGuard === null
          ? "unknown"
          : providerBudgetGuard.status === "rate_limited" ||
              providerBudgetGuard.status === "provider_unavailable" ||
              providerBudgetGuard.status === "over_budget"
            ? "blocked"
            : providerBudgetGuard.status === "approaching_limit" ||
                providerBudgetGuard.status === "budget_unknown"
              ? "warning"
              : "pass",
      source: "provider",
      message:
        providerBudgetGuard?.status_message ??
        "Provider budget guard is not available yet.",
    }),
    check({
      check_id: "market_calendar",
      label: "Market calendar",
      status: marketCalendarAvailable ? "pass" : "warning",
      source: "provider",
      message: marketCalendarAvailable
        ? `Market calendar provider is ${input.market_status?.provider ?? "available"}.`
        : fallbackCalendarScanAllowed
          ? "Market calendar provider unavailable; using NY-time fallback for scan timing. Add POLYGON_API_KEY for provider-confirmed market calendar."
          : "Market calendar is missing or returned an unknown day type.",
    }),
    check({
      check_id: "market_window",
      label: "Active window classification",
      status:
        activeWindow || marketClosedWithNextWindow
          ? "pass"
          : marketClosedWithoutNextWindow
            ? "warning"
            : "warning",
      source: "market_session",
      message: activeWindow
        ? `Current live trial window is ${words(input.scan_orchestration.active_window)}.`
        : marketClosedWithNextWindow
          ? `Market is closed. Ture is waiting for ${nextWindow?.label ?? "the next active scan window"}.`
          : "No active or next recommendation window is available.",
    }),
    check({
      check_id: "automation_scan_route",
      label: "Scheduled scan route",
      status: input.automation_scan_route_available === false ? "blocked" : "pass",
      source: "scheduler",
      message:
        input.automation_scan_route_available === false
          ? "Automation scan route is not available."
          : "Automation scan route is present for scheduled scan execution.",
    }),
    check({
      check_id: "scan_orchestration",
      label: "Scan orchestration",
      status:
        input.scan_orchestration.decision === "blocked_by_provider"
          ? "blocked"
          : input.scan_orchestration.decision === "unknown"
            ? "warning"
            : "pass",
      source: "scheduler",
      message: `${words(input.scan_orchestration.decision)}: ${input.scan_orchestration.scan_reason}`,
    }),
    check({
      check_id: "scanner_universe",
      label: "Scanner universe",
      status: selectedTickerCount > 0 ? "pass" : "blocked",
      source: "scanner",
      message:
        selectedTickerCount > 0
          ? `${selectedTickerCount} tickers are selected for scanning.`
          : "No tickers are selected for the scanner universe.",
    }),
    check({
      check_id: "candidate_ranking",
      label: "Candidate ranking",
      status:
        (scannerRanking?.selected_count ?? 0) > 0 || successfulLiveBatchObserved
          ? "pass"
          : activeWindow
            ? "blocked"
            : "pass",
      source: "scanner",
      message:
        scannerRanking === null && successfulLiveBatchObserved
          ? `Candidate ranking is observed through the latest official batch with ${latestBatch.recommendation_count} recommendations.`
          : !activeWindow && scannerRanking === null
            ? "Candidate ranking is not expected while the market is closed; scanner output will be evaluated during the next active window."
            : scannerRanking === null
              ? "Candidate ranking has not been observed in the latest scan yet."
              : `${scannerRanking.selected_count} candidates selected from ${scannerRanking.candidates_ranked} ranked candidates.`,
    }),
    check({
      check_id: "scanner_qa",
      label: "Scanner QA",
      status:
        successfulLiveBatchObserved
          ? "pass"
          : input.scanner_qa.overall_status === "blocked"
            ? activeWindow
              ? "blocked"
              : "warning"
            : input.scanner_qa.overall_status === "healthy"
              ? "pass"
              : "warning",
      source: "scanner",
      message:
        successfulLiveBatchObserved
          ? `Scanner output is observed through the latest official live batch with ${latestBatch.recommendation_count} recommendations.`
          : input.scanner_qa.overall_status === "blocked" && !activeWindow
            ? "No active scanner candidates are expected while market is closed. Scanner output will be evaluated during the next active window."
            : input.scanner_qa.summary,
    }),
    check({
      check_id: "dynamic_movers_fallback",
      label: "Dynamic movers fallback",
      status: input.scanner_universe.dynamic_movers ? "pass" : "warning",
      source: "scanner",
      message: input.scanner_universe.dynamic_movers
        ? "Dynamic movers are represented in scanner universe coverage."
        : "Dynamic movers are not present; static universe fallback should carry the trial.",
    }),
    check({
      check_id: "serving_cadence",
      label: "Serving cadence",
      status: servingReady ? "pass" : "warning",
      source: "serving",
      message: `${words(input.serving_cadence.status)} / ${words(input.serving_cadence.batch_status)}.`,
    }),
    check({
      check_id: "batch_memory",
      label: "Batch persistence",
      status: persistenceReady ? "pass" : "warning",
      source: "persistence",
      message: `${input.batch_memory.total_batches} batches tracked; latest persistence mode is ${input.batch_memory.persistence_mode}.`,
    }),
    check({
      check_id: "scan_run_persistence",
      label: "Scan run persistence",
      status:
        input.scan_run_history.total_scan_runs > 0 ||
        input.scan_run_history.source_scope === "current_visible"
          ? "pass"
          : "warning",
      source: "persistence",
      message: `${input.scan_run_history.total_scan_runs} scan runs available for diagnostics.`,
    }),
    check({
      check_id: "snapshot_outcome_persistence",
      label: "Snapshots and outcomes",
      status: input.performance.summary.total_recommendations > 0 ? "pass" : "warning",
      source: "persistence",
      message: `${input.performance.summary.total_recommendations} recommendation snapshots in scope; ${input.performance.summary.evaluated_recommendations} evaluated.`,
    }),
    check({
      check_id: "outcome_evaluation",
      label: "Outcome evaluation",
      status:
        outcomeEvaluation?.route_available === false
          ? "blocked"
          : outcomesReady
            ? "pass"
            : "warning",
      source: "outcomes",
      message:
        outcomeEvaluation?.status === "failed"
          ? "Latest outcome evaluation failed."
          : "Outcome evaluation route and incomplete-outcome tracking are available.",
    }),
    check({
      check_id: "ui_surfaces",
      label: "Trial review surfaces",
      status:
        input.ui_surfaces?.recommendations_primary_clean === false ||
        input.ui_surfaces?.live_day_trades_primary_clean === false ||
        input.ui_surfaces?.stats_today_available === false ||
        input.ui_surfaces?.history_statistics_available === false
          ? "warning"
          : "pass",
      source: "ui",
      message:
        "Recommendations, Live Day Trades, Stats Today, Market, History, and Statistics are available for review.",
    }),
    check({
      check_id: "data_reality",
      label: "Data reality separation",
      status:
        input.data_mode_clarity.has_demo_data && activeWindow
          ? "blocked"
          : input.data_mode_clarity.has_demo_data ||
              input.data_mode_clarity.has_mock_broker_data
            ? "warning"
            : "pass",
      source: "data_reality",
      message:
        input.data_mode_clarity.has_demo_data && !activeWindow
          ? "Demo/dev-preview recommendations are visible, but real-data trial will be evaluated during active window."
          : input.data_mode_clarity.summary,
    }),
    check({
      check_id: "execution_safety",
      label: "Execution safety",
      status: "pass",
      source: "safety",
      message:
        "Broker automation, order submission, automatic Avanza execution, and automatic trading execution are not enabled.",
    }),
    check({
      check_id: "trial_modes",
      label: "Trial modes",
      status: "pass",
      source: "trial_mode",
      message:
        "Observation-only, recommendation logging, and paper/manual tracking are supported as interpretations; tiny live manual trading is not default.",
    }),
  ];

  const blockers = checks
    .filter((item) => item.status === "blocked")
    .map(blocker);
  const warnings = [
    ...checks.filter((item) => item.status === "warning").map(warning),
    ...input.serving_cadence.warnings.slice(0, 2).map((item) => ({
      warning_id: `serving:${item.warning_id}`,
      message: item.message,
      source: "serving" as const,
    })),
    ...(marketWaitState
      ? []
      : input.scanner_qa.warnings.slice(0, 2).map((item) => ({
          warning_id: `scanner_qa:${item.warning_id}`,
          message: item.message,
          source: "scanner" as const,
        }))),
  ].slice(0, 10);

  const canObserve =
    blockers.length === 0 || blockers.every((item) => item.source === "market_session");
  const canLogRecommendations =
    blockers.length === 0 &&
    activeWindow &&
    servingReady &&
    persistenceReady &&
    !isProviderBlocked(input, activeWindow);
  const overallStatus = determineOverallStatus({
    blockers,
    warnings,
    marketWaitState,
    canLogRecommendations,
    canObserve,
  });
  const suggestedAction = buildSuggestedAction({
    status: overallStatus,
    blockers,
    warnings,
    nextWindow,
    canLogRecommendations,
  });

  return {
    summary_id: `live_market_trial_readiness_${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "live_market_trial_readiness",
    generated_at: now.toISOString(),
    overall_status: overallStatus,
    summary: statusSummary(overallStatus),
    blockers,
    warnings,
    checks,
    next_active_window: nextWindow,
    provider_env_readiness: {
      supabase_public_env_available: input.supabase_public_env_available,
      supabase_persistence_observed: supabasePersistenceObserved,
      twelve_data_provider_observed: twelveDataProviderObserved,
      openai_generation_observed: openAiGenerationObserved,
      market_calendar_provider: input.market_status?.provider ?? null,
      market_calendar_available: marketCalendarAvailable,
      market_calendar_confidence: input.scan_orchestration.calendar_confidence,
      fallback_calendar_scan_allowed: fallbackCalendarScanAllowed,
      server_secret_status: serverSecretStatus,
    },
    scanner_readiness: {
      status: scannerGeneration?.status ?? "unknown",
      selected_ticker_count: selectedTickerCount,
      candidates_generated: candidatesGenerated,
      provider_backed_candidates: providerBackedCandidates,
      scan_budget: scanBudget,
      ranking_selected_count: scannerRanking?.selected_count ?? null,
      qa_status: input.scanner_qa.overall_status,
    },
    serving_readiness: {
      status: input.serving_cadence.status,
      batch_type: input.serving_cadence.batch_type,
      batch_status: input.serving_cadence.batch_status,
      freshness_status: input.serving_cadence.freshness_status,
      no_trade_valid: input.serving_cadence.no_trade_valid,
      visible_recommendation_count:
        input.serving_cadence.visible_recommendation_count,
    },
    persistence_readiness: {
      scan_runs_available: input.scan_run_history.total_scan_runs > 0,
      batches_available: input.batch_memory.total_batches > 0,
      snapshots_available: input.performance.summary.total_recommendations > 0,
      outcomes_available: input.performance.summary.evaluated_recommendations > 0,
      latest_batch_persistence_mode: input.batch_memory.persistence_mode,
    },
    outcome_readiness: {
      status: outcomeEvaluation?.status ?? "unknown",
      evaluated_recommendations: input.performance.summary.evaluated_recommendations,
      pending_outcomes: input.performance.summary.pending_outcomes,
      incomplete_outcomes:
        count(outcomeEvaluation?.incomplete_snapshot_count) +
        input.performance.summary.incomplete_outcomes,
      route_available: outcomeEvaluation?.route_available !== false,
    },
    provider_budget_readiness: {
      status: providerBudgetGuard?.status ?? "unknown",
      plan_mode: providerBudgetGuard?.plan_mode ?? "unknown",
      estimated_calls_per_window:
        providerBudgetGuard?.totals.estimated_calls_per_window ?? 0,
      estimated_calls_per_day:
        providerBudgetGuard?.totals.estimated_calls_per_day ?? 0,
      latest_limit_signal:
        providerBudgetGuard?.latest_limit_signal.status ?? "none",
    },
    latest_automation_scan: {
      status: latestAutomationScan?.result ?? "unknown",
      decision: latestAutomationDecision,
      window: latestAutomationScan?.scan_window ?? null,
      created_at: latestAutomationScan?.created_at ?? null,
      message: latestAutomationScan?.message ?? null,
      last_provider_error:
        latestAutomationScan?.result === "provider_error" ||
        latestAutomationScan?.result === "provider_rate_limited"
          ? latestAutomationScan.message ?? "Provider error observed."
          : null,
    },
    automation_diagnostics: {
      scheduled_function_fired_at_utc:
        latestAutomationScan?.automation_run_diagnostics
          ?.scheduled_function_fired_at_utc ?? null,
      interpreted_ny_time:
        latestAutomationScan?.automation_run_diagnostics?.interpreted_ny_time ??
        `${input.scan_orchestration.trading_date} ${input.scan_orchestration.ny_time} America/New_York`,
      scan_decision:
        latestAutomationScan?.automation_run_diagnostics?.scan_decision ??
        latestAutomationDecision,
      active_window:
        latestAutomationScan?.automation_run_diagnostics?.active_window ??
        input.scan_orchestration.active_window,
      skipped_reason: skippedReason,
      latest_active_window_scan: input.latest_active_window_scan ?? null,
      latest_skipped_scan: input.latest_skipped_scan ?? null,
    },
    can_do_now: {
      observe_only: canObserve,
      log_recommendations: canLogRecommendations,
      evaluate_outcomes: outcomesReady && blockers.length === 0,
      paper_or_manual_tracking_ready:
        canObserve && input.data_mode_clarity.execution_reality !== "unknown",
    },
    not_enabled: {
      broker_automation: true,
      order_submission: true,
      automatic_avanza_execution: true,
      automatic_trading_execution: true,
    },
    suggested_monday_trial_action: suggestedAction,
    copy: {
      purpose: "This checks whether Ture is ready to run with real market data.",
      profitability_boundary: "Readiness does not mean trading profitability.",
      execution_boundary: "Ture does not send broker orders.",
      closed_market:
        "Closed market is a wait state, not a scanner failure. No active candidates are expected while the market is closed.",
    },
  };
}

export function liveMarketTrialReadinessSummaryJson(
  summary: LiveMarketTrialReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
