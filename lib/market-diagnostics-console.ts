import type { DataModeClaritySummary } from "@/lib/data-mode-clarity";
import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";
import type { DailyRecommendationTradeTargetsSummary } from "@/lib/daily-recommendation-trade-targets";
import type { DayTradeWindowRecommendationTargetSummary } from "@/lib/day-trade-window-recommendation-target";
import type { DynamicMarketMoversSummary } from "@/lib/dynamic-market-movers";
import type { MarketSessionEvaluation, MarketSessionStatus } from "@/lib/market-session";
import type { ProviderBudgetGuardSummary } from "@/lib/provider-budget-guard";
import type { RealRecommendationOutputReadinessSummary } from "@/lib/real-recommendation-output-readiness";
import type { RecommendationBatchSummary } from "@/lib/recommendation-batch-memory";
import type { RecommendationEngineControlCenterSummary } from "@/lib/recommendation-engine-control-center";
import type { RecommendationPerformanceStatistics } from "@/lib/recommendation-performance-statistics";
import type { RecommendationScanRunHistorySummary } from "@/lib/recommendation-scan-run-history";
import type { RecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import type { ScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import type { ScannerOutputQaSummary } from "@/lib/scanner-output-qa";
import type { ScannerUniverseCoverageSummary } from "@/lib/scanner-universe";
import type { LiveMarketTrialReadinessSummary } from "@/lib/live-market-trial-readiness";
import type { LiveMarketTrialRunbookSummary } from "@/lib/live-market-trial-runbook";
import type { ActiveScanTrace } from "@/lib/active-scan-trace";

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
  scanner_universe: ScannerUniverseCoverageSummary;
  dynamic_movers?: DynamicMarketMoversSummary | null;
  scanner_ranking?: ScannerCandidateRankingSummary | null;
  active_scan_trace?: ActiveScanTrace | null;
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

function words(value: string | null | undefined) {
  return (value || "unknown").replaceAll("_", " ");
}

function compact(value: string | null | undefined, fallback = "unknown") {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : fallback;
}

function bool(value: boolean) {
  return value ? "yes" : "no";
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

function dedupeWarnings(
  warnings: MarketDiagnosticsConsoleWarning[],
): MarketDiagnosticsConsoleWarning[] {
  const seen = new Set<string>();
  const result: MarketDiagnosticsConsoleWarning[] = [];

  for (const item of warnings) {
    const key = `${item.source}:${item.message}`.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }

  return result;
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

function isCoreReadinessSource(source: string) {
  return source === "environment" || source === "provider" || source === "scheduler";
}

function determineOverallStatus(
  input: MarketDiagnosticsConsoleInput,
  blockers: MarketDiagnosticsConsoleWarning[],
) {
  if (
    blockers.length > 0 ||
    input.provider_budget_guard.status === "over_budget" ||
    input.provider_budget_guard.status === "rate_limited" ||
    input.provider_budget_guard.status === "provider_unavailable"
  ) {
    return "blocked" as const;
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

  return input.live_market_trial_runbook.next_action.label;
}

function buildWarnings(input: MarketDiagnosticsConsoleInput) {
  const closedMarketWaitState = isClosedMarketWaitState(input);
  const blockers = dedupeWarnings([
    ...input.live_market_trial_readiness.blockers
      .filter((item) =>
        closedMarketWaitState
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
    ...(closedMarketWaitState
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
    !closedMarketWaitState
      ? [
          warning(
            "scanner_qa:blocked",
            "critical",
            "scanner_qa",
            input.scanner_output_qa.summary,
          ),
        ]
      : []),
  ]).slice(0, 8);

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
    ...input.live_market_trial_readiness.warnings.map((item) =>
      warning(`readiness:${item.warning_id}`, "warning", item.source, item.message),
    ),
    ...input.live_market_trial_runbook.warnings.map((item) =>
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
    ...input.real_output_readiness.blockers.map((item) =>
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
    ),
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
  ]).slice(0, 12);

  return { blockers, warnings };
}

function lineValue(label: string, value: string | number | boolean | null) {
  return `${label}: ${value === null ? "unknown" : String(value)}`;
}

function buildSections(
  input: MarketDiagnosticsConsoleInput,
  warnings: {
    blockers: MarketDiagnosticsConsoleWarning[];
    warnings: MarketDiagnosticsConsoleWarning[];
  },
): MarketDiagnosticsConsoleSection[] {
  const latestBatch = input.batch_memory.latest_batch;
  const closedMarketWaitState = isClosedMarketWaitState(input);
  const scannerQaLabel =
    closedMarketWaitState && input.scanner_output_qa.overall_status === "blocked"
      ? "not applicable while market closed"
      : words(input.scanner_output_qa.overall_status);
  const rankingLabel =
    closedMarketWaitState && input.scanner_ranking === null
      ? "not observed (expected while market closed)"
      : input.scanner_ranking
        ? `${words(input.scanner_ranking.target_status)} / ${input.scanner_ranking.selected_count} selected`
        : "not observed";

  return [
    section({
      section_id: "context",
      title: "Timestamp/context",
      severity: "info",
      lines: [
        lineValue("Generated", input.market_session.evaluated_at),
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
          )}`,
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
        market_is_open: input.market_session.market_is_open,
        market_day_type: input.market_status?.dayType ?? null,
        calendar_confidence: input.scan_orchestration.calendar_confidence,
        provider_calendar_available:
          input.scan_orchestration.provider_calendar_available,
        fallback_calendar_scan_allowed:
          input.scan_orchestration.fallback_calendar_scan_allowed,
        session_phase: input.market_session.phase,
        active_scan_window: input.scan_orchestration.active_window,
        next_scan_window: input.scan_orchestration.next_window,
        data_mode: input.data_mode_clarity.overall_mode,
      },
    }),
    section({
      section_id: "overall",
      title: "Overall status",
      severity: warnings.blockers.length > 0 ? "critical" : highestSeverity(warnings.warnings),
      lines: [
        lineValue("Engine", words(input.engine_control_center.overall_status)),
        lineValue(
          "Live trial",
          words(input.live_market_trial_readiness.overall_status),
        ),
        lineValue("Runbook", words(input.live_market_trial_runbook.status)),
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
      },
    }),
    section({
      section_id: "active_scan_trace",
      title: "Active scan trace",
      severity:
        input.active_scan_trace?.final.zero_candidate_reason &&
        !closedMarketWaitState
          ? "warning"
          : "info",
      lines: input.active_scan_trace
        ? [
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
              "Quote/candle success",
              `${input.active_scan_trace.market_data_fetch.quote_success_count}/${input.active_scan_trace.market_data_fetch.candle_success_count}`,
            ),
            lineValue(
              "Quote/candle errors",
              `${input.active_scan_trace.market_data_fetch.quote_error_count}/${input.active_scan_trace.market_data_fetch.candle_error_count}`,
            ),
            lineValue(
              "Raw/ranked/output",
              `${input.active_scan_trace.raw_candidates.raw_candidate_count}/${input.active_scan_trace.ranking.ranked_count}/${input.active_scan_trace.openai.output_recommendation_count}`,
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
              "Not published reason",
              compact(
                input.active_scan_trace.final
                  .ranked_candidates_not_published_reason,
                "none",
              ),
            ),
          ]
        : [
            lineValue("Last stage reached", "not observed"),
            lineValue("Zero candidate reason", "not observed"),
            lineValue("Provider env", "not observed"),
            lineValue("Quote/candle success", "not observed"),
            lineValue("Raw/ranked/output", "not observed"),
            lineValue("Published", "not observed"),
            lineValue("Tier mix", "not observed"),
            lineValue("Thresholds", "not observed"),
            lineValue("Deterministic fallback", "not observed"),
          ],
      metrics: {
        trace_id: input.active_scan_trace?.trace_id ?? null,
        last_stage_reached: input.active_scan_trace?.last_stage_reached ?? null,
        zero_candidate_reason:
          input.active_scan_trace?.final.zero_candidate_reason ?? null,
        twelve_data_key_present:
          input.active_scan_trace?.provider_env.twelve_data_key_present ?? null,
        openai_key_present:
          input.active_scan_trace?.provider_env.openai_key_present ?? null,
        polygon_key_present:
          input.active_scan_trace?.provider_env.polygon_key_present ?? null,
        supabase_service_role_present:
          input.active_scan_trace?.provider_env.supabase_service_role_present ??
          null,
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
        ranked_candidates_count:
          input.active_scan_trace?.final.ranked_candidates_count ?? null,
        recommendations_published_count:
          input.active_scan_trace?.final.recommendations_published_count ?? null,
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
        lineValue("No-trade valid", bool(input.serving_cadence.no_trade_valid)),
      ],
      metrics: {
        visible_recommendations:
          input.serving_cadence.visible_recommendation_count,
        current_batch_status: input.serving_cadence.batch_status,
        batch_recommendation_count: latestBatch?.recommendation_count ?? 0,
        per_window_target_min: input.serving_cadence.batch_target.min,
        per_window_target_max: input.serving_cadence.batch_target.max,
        today_recommendations: input.daily_targets.total_recommendations_today,
        full_day_target_min: input.daily_targets.full_day_recommendation_target_min,
        full_day_target_max: input.daily_targets.full_day_recommendation_target_max,
        strong_count: input.real_output_readiness.coverage.strong_count,
        valid_count: input.real_output_readiness.coverage.valid_count,
        experimental_count: input.real_output_readiness.coverage.experimental_count,
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
        latest_limit_signal:
          input.provider_budget_guard.latest_limit_signal.status,
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
  const warningText =
    input.warnings.length === 0
      ? "- None"
      : input.warnings.map((item) => `- [${item.source}] ${item.message}`).join("\n");

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
    "Top warnings:",
    warningText,
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
    "## Top warnings",
    ...(input.warnings.length === 0
      ? ["- None"]
      : input.warnings.map((item) => `- [${item.source}] ${item.message}`)),
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
