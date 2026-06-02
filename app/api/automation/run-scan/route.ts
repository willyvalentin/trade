import { NextResponse } from "next/server";

import {
  generateRecommendations,
  RecommendationGenerationError,
  type RecommendationScanLogDetails,
  type SessionType,
} from "@/lib/recommendation-generator";
import {
  buildScanLogMessage,
  createScanLog,
  getScanLogResultFromMessage,
  parseScanLogFromMessage,
  type ScanLogEntry,
  type ScanLogRunRow,
  type ScanLogResult,
} from "@/lib/scan-logs";
import {
  MAX_DISCARD_REVIEWS_PER_RUN,
  reviewPendingDiscardedRecommendations,
} from "@/lib/discard-review";
import { getUsMarketStatus } from "@/lib/market-calendar";
import {
  getIntradayScanPolicy,
  getIntradayScanWindow,
  getIntradayScanWindowLabel,
  getLegacySessionTypeForScanWindow,
  getNewYorkDateString,
  isMarketOpenForIntradayTrading,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import { getDefaultRecommendationExpiryCutoff } from "@/lib/recommendation-freshness";
import {
  buildDayTradeScanOrchestrationSummary,
  dayTradeScanWindowToIntradayScanWindow,
  HUMAN_CONFIRMED_EXECUTION_WARNING,
  MARKET_CALENDAR_FALLBACK_EXECUTION_WARNING,
  MARKET_CALENDAR_FALLBACK_SCAN_WARNING,
  POLYGON_CALENDAR_ENV_GUIDANCE,
  type DayTradeScanOrchestrationSummary,
} from "@/lib/day-trade-scan-orchestration";
import { buildMarketSessionEvaluation } from "@/lib/market-session";
import {
  buildRecommendationServingCadenceSummary,
  type RecommendationServingCadenceSummary,
} from "@/lib/recommendation-serving-cadence";
import {
  buildRecommendationScanRun,
  persistRecommendationScanRun,
  recommendationScanRunFromPersistenceRow,
  type RecommendationScanRun,
} from "@/lib/recommendation-scan-run";
import {
  buildRecommendationSnapshot,
  persistRecommendationSnapshot,
  type RecommendationSnapshot,
} from "@/lib/recommendation-snapshot";
import {
  buildRecommendationBatch,
  persistRecommendationBatch,
} from "@/lib/recommendation-batch-memory";
import type { ScanPipelineObservabilitySummary } from "@/lib/scan-pipeline-observability";
import { supabase } from "@/lib/supabase";
import { normalizeUnknownError } from "@/lib/error-logging";

type ScanWindow = {
  sessionType: SessionType;
  scanWindow: IntradayScanWindow;
  scanDate: string;
};

type AutomationRunRequestBody = {
  force?: unknown;
  session_type?: unknown;
  scan_window?: unknown;
  ignore_existing_run?: unknown;
  source?: unknown;
  scheduled_function_fired_at_utc?: unknown;
};

type AutomationScanDecision =
  | "scanned"
  | "skipped_market_closed"
  | "skipped_outside_window"
  | "skipped_recent_scan"
  | "skipped_provider_unavailable"
  | "failed";

type ScheduledScanRunSummary = {
  row: ScanLogRunRow;
  scanLog: ScanLogEntry;
};

type AutomationScanDiagnosticEntry = {
  created_at: string | null;
  window: string | null;
  status: string | null;
  result: string | null;
  message: string | null;
  recommendations_created: number | null;
  run_fingerprint?: string | null;
};

type AutomationRunDiagnostics = {
  scheduled_function_fired_at_utc: string | null;
  route_received_at_utc: string;
  interpreted_ny_time: string;
  scan_decision: AutomationScanDecision;
  orchestration_decision: DayTradeScanOrchestrationSummary["decision"];
  active_window: DayTradeScanOrchestrationSummary["active_window"];
  scan_window: IntradayScanWindow;
  skipped_reason: string | null;
  latest_active_window_scan: AutomationScanDiagnosticEntry | null;
  latest_skipped_scan: AutomationScanDiagnosticEntry | null;
};

type RecommendationRow = {
  id?: string | null;
  ticker?: string | null;
  company_name?: string | null;
  direction?: string | null;
  setup_type?: string | null;
  entry_low?: number | string | null;
  entry_high?: number | string | null;
  stop_loss?: number | string | null;
  target_1?: number | string | null;
  target_2?: number | string | null;
  risk_reward?: number | string | null;
  confidence?: number | string | null;
  confidence_score?: number | string | null;
  confidence_label?: string | null;
  confidence_reasoning?: string | null;
  timeframe?: string | null;
  thesis?: string | null;
  invalidation?: string | null;
  reason_to_avoid?: string | null;
  status?: string | null;
  scan_window?: string | null;
  created_at?: string | null;
};

type AutomationCalendarFields = {
  calendar_confidence: DayTradeScanOrchestrationSummary["calendar_confidence"];
  provider_calendar_available: boolean;
  fallback_calendar_scan_allowed: boolean;
  calendar_warnings: string[];
};

const intradayScanWindows: IntradayScanWindow[] = [
  "pre_market",
  "opening",
  "morning_momentum",
  "midday",
  "afternoon",
  "power_hour",
  "closed",
];

function parseIntradayScanWindow(value: unknown): IntradayScanWindow | null {
  return intradayScanWindows.includes(value as IntradayScanWindow)
    ? (value as IntradayScanWindow)
    : null;
}

function getScanWindowDueNow(): ScanWindow {
  const now = new Date();
  const scanWindow = getIntradayScanWindow(now);

  return {
    scanWindow,
    scanDate: getNewYorkDateString(now),
    sessionType: getLegacySessionTypeForScanWindow(scanWindow),
  };
}

async function parseAutomationRunRequestBody(
  request: Request,
): Promise<AutomationRunRequestBody> {
  try {
    const text = await request.text();

    if (!text.trim()) {
      return {};
    }

    const parsed = JSON.parse(text);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as AutomationRunRequestBody;
  } catch {
    return {};
  }
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function textOrNull(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function isoTextOrNull(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;

  const date = new Date(text);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function isActiveAutomationWindow(scanWindow: IntradayScanWindow) {
  return (
    scanWindow === "opening" ||
    scanWindow === "morning_momentum" ||
    scanWindow === "midday" ||
    scanWindow === "afternoon" ||
    scanWindow === "power_hour"
  );
}

function isActiveDayTradeWindow(window: string | null | undefined) {
  return window === "morning" || window === "midday" || window === "power_hour";
}

function scheduledScanDiagnosticEntry(
  run: ScheduledScanRunSummary,
): AutomationScanDiagnosticEntry {
  const recommendationsCreated =
    typeof run.scanLog.recommendations_created === "number"
      ? run.scanLog.recommendations_created
      : numberOrNull(run.row.recommendations_created);

  return {
    created_at: run.scanLog.created_at || run.row.created_at,
    window: run.scanLog.scan_window,
    status: textOrNull(run.row.status),
    result: run.scanLog.result,
    message: run.scanLog.message,
    recommendations_created: recommendationsCreated,
  };
}

function recommendationScanRunDiagnosticEntry(
  scanRun: RecommendationScanRun,
): AutomationScanDiagnosticEntry {
  const scanObservability =
    typeof scanRun.payload_json.scan_observability === "object" &&
    scanRun.payload_json.scan_observability !== null
      ? (scanRun.payload_json.scan_observability as ScanPipelineObservabilitySummary)
      : null;

  return {
    created_at: scanRun.observed_at,
    window: scanRun.window,
    status: scanRun.status,
    result:
      scanObservability?.run_context.latest_scan_result ??
      scanRun.status,
    message:
      typeof scanRun.payload_json?.scan_reason === "string"
        ? scanRun.payload_json.scan_reason
        : null,
    recommendations_created: scanRun.counts.visible_recommendation_count,
    run_fingerprint: scanRun.run_fingerprint,
  };
}

function latestByCreatedAt<T>(
  items: T[],
  createdAt: (item: T) => string | null | undefined,
) {
  return (
    items
      .filter((item) => {
        const created = createdAt(item);
        return Boolean(created && Number.isFinite(new Date(created).getTime()));
      })
      .sort((first, second) =>
        String(createdAt(second)).localeCompare(String(createdAt(first))),
      )[0] ?? null
  );
}

function isSkippedScanLog(scanLog: ScanLogEntry) {
  return (
    scanLog.result === "market_closed" ||
    scanLog.result === "pre_market" ||
    scanLog.result === "pre_market_no_candidates" ||
    scanLog.result === "pre_market_skipped_holiday" ||
    scanLog.result === "skipped" ||
    scanLog.result === "power_hour_blocked"
  );
}

function buildAutomationRunDiagnostics({
  scheduledFunctionFiredAtUtc,
  routeReceivedAtUtc,
  orchestration,
  decision,
  scanWindow,
  skippedReason,
  recentRecommendationScanRuns,
  recentScheduledScanRuns,
  currentScanLog,
}: {
  scheduledFunctionFiredAtUtc: string | null;
  routeReceivedAtUtc: string;
  orchestration: DayTradeScanOrchestrationSummary;
  decision: AutomationScanDecision;
  scanWindow: IntradayScanWindow;
  skippedReason?: string | null;
  recentRecommendationScanRuns: RecommendationScanRun[];
  recentScheduledScanRuns: ScheduledScanRunSummary[];
  currentScanLog?: ScanLogEntry | null;
}): AutomationRunDiagnostics {
  const latestRecommendationActiveScan = latestByCreatedAt(
    recentRecommendationScanRuns.filter(
      (scanRun) =>
        isActiveDayTradeWindow(scanRun.window) && scanRun.status !== "failed",
    ),
    (scanRun) => scanRun.observed_at,
  );
  const latestScheduledActiveScan = latestByCreatedAt(
    recentScheduledScanRuns.filter(
      (run) =>
        isActiveDayTradeWindow(run.scanLog.day_trade_scan_orchestration?.active_window) ||
        isActiveAutomationWindow(run.scanLog.scan_window as IntradayScanWindow),
    ),
    (run) => run.scanLog.created_at || run.row.created_at,
  );
  const latestSkippedScheduledScan = latestByCreatedAt(
    recentScheduledScanRuns.filter((run) => isSkippedScanLog(run.scanLog)),
    (run) => run.scanLog.created_at || run.row.created_at,
  );
  const latestActiveWindowScan = latestRecommendationActiveScan
    ? recommendationScanRunDiagnosticEntry(latestRecommendationActiveScan)
    : latestScheduledActiveScan
      ? scheduledScanDiagnosticEntry(latestScheduledActiveScan)
      : null;
  const latestSkippedScan =
    skippedReason && currentScanLog
      ? scheduledScanDiagnosticEntry({
          row: {
            created_at: currentScanLog.created_at,
            recommendations_created: currentScanLog.recommendations_created,
            message: currentScanLog.message,
            status: "skipped",
          },
          scanLog: currentScanLog,
        })
      : latestSkippedScheduledScan
        ? scheduledScanDiagnosticEntry(latestSkippedScheduledScan)
        : null;

  return {
    scheduled_function_fired_at_utc: scheduledFunctionFiredAtUtc,
    route_received_at_utc: routeReceivedAtUtc,
    interpreted_ny_time: `${orchestration.trading_date} ${orchestration.ny_time} America/New_York`,
    scan_decision: decision,
    orchestration_decision: orchestration.decision,
    active_window: orchestration.active_window,
    scan_window: scanWindow,
    skipped_reason: skippedReason ?? null,
    latest_active_window_scan: latestActiveWindowScan,
    latest_skipped_scan: latestSkippedScan,
  };
}

function isRateLimitLikeError(error: unknown) {
  const normalized = normalizeUnknownError(error);
  const status =
    typeof normalized === "object" &&
    normalized !== null &&
    "status" in normalized &&
    typeof normalized.status === "number"
      ? normalized.status
      : null;
  const message = JSON.stringify(normalized).toLowerCase();

  return (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many request") ||
    message.includes("quota")
  );
}

function errorScanResult(error: unknown): ScanLogResult {
  const message = JSON.stringify(normalizeUnknownError(error)).toLowerCase();

  if (isRateLimitLikeError(error)) {
    return "provider_rate_limited";
  }

  if (
    message.includes("openai") ||
    message.includes("api_key") ||
    message.includes("api key")
  ) {
    return "openai_error";
  }

  if (
    message.includes("twelve") ||
    message.includes("provider") ||
    message.includes("market data") ||
    message.includes("calendar")
  ) {
    return "provider_error";
  }

  return "unknown";
}

function providerEnvironmentReady() {
  const missing: string[] = [];

  if (!process.env.OPENAI_API_KEY) {
    missing.push("OPENAI_API_KEY");
  }

  if (!process.env.TWELVE_DATA_API_KEY) {
    missing.push("TWELVE_DATA_API_KEY");
  }

  return {
    ready: missing.length === 0,
    missing,
  };
}

function calendarFields(
  orchestration: DayTradeScanOrchestrationSummary,
): AutomationCalendarFields {
  return {
    calendar_confidence: orchestration.calendar_confidence,
    provider_calendar_available: orchestration.provider_calendar_available,
    fallback_calendar_scan_allowed: orchestration.fallback_calendar_scan_allowed,
    calendar_warnings: orchestration.warnings
      .filter(
        (item) =>
          item.message === MARKET_CALENDAR_FALLBACK_SCAN_WARNING ||
          item.message === MARKET_CALENDAR_FALLBACK_EXECUTION_WARNING ||
          item.message === HUMAN_CONFIRMED_EXECUTION_WARNING ||
          item.message === POLYGON_CALENDAR_ENV_GUIDANCE,
      )
      .map((item) => item.message),
  };
}

async function readRecentRecommendationScanRuns() {
  const { data, error } = await supabase
    .from("recommendation_scan_runs")
    .select("*")
    .order("observed_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[automation/run-scan] recommendation_scan_runs_load_error", {
      source: "supabase.recommendation_scan_runs",
      operation: "select_recent_recommendation_scan_runs",
      error: normalizeUnknownError(error),
    });
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>)
    .map(recommendationScanRunFromPersistenceRow)
    .filter((scanRun): scanRun is RecommendationScanRun => scanRun !== null);
}

async function readRecentScheduledScanRuns() {
  const { data, error } = await supabase
    .from("scheduled_scan_runs")
    .select("id,created_at,scan_date,session_type,status,recommendations_created,message")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[automation/run-scan] scheduled_scan_runs_load_error", {
      source: "supabase.scheduled_scan_runs",
      operation: "select_recent_scheduled_scan_runs",
      error: normalizeUnknownError(error),
    });
    return [];
  }

  return ((data ?? []) as ScanLogRunRow[]).map((row) => ({
    row,
    scanLog: parseScanLogFromMessage(row),
  }));
}

function latestScheduledScanForWindow({
  runs,
  scanDate,
  sessionType,
  scanWindow,
}: {
  runs: ScheduledScanRunSummary[];
  scanDate: string;
  sessionType: SessionType;
  scanWindow: IntradayScanWindow;
}) {
  return (
    runs.find((run) => {
      const rowScanDate = textOrNull(run.row.scan_date);
      const rowSessionType = textOrNull(run.row.session_type);
      return (
        rowScanDate === scanDate &&
        rowSessionType === sessionType &&
        run.scanLog.scan_window === scanWindow &&
        run.row.status === "completed"
      );
    }) ?? null
  );
}

function minutesSince(value: string | null | undefined, now: Date) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return Math.max(0, Math.round((now.getTime() - timestamp) / 60000));
}

function shouldSkipForRecentScan({
  latestScan,
  now,
  cooldownMinutes,
}: {
  latestScan: ScheduledScanRunSummary | null;
  now: Date;
  cooldownMinutes: number;
}) {
  const ageMinutes = minutesSince(latestScan?.row.created_at, now);
  return ageMinutes !== null && ageMinutes < cooldownMinutes;
}

async function archiveExpiredRecommendations() {
  const { data, error } = await supabase
    .from("recommendations")
    .update({ archived: true })
    .or("status.eq.new,status.is.null")
    .or("archived.eq.false,archived.is.null")
    .lt("created_at", getDefaultRecommendationExpiryCutoff())
    .select("id");

  if (error) {
    throw new RecommendationGenerationError(
      error.message ?? "Could not archive expired recommendations.",
      500,
    );
  }

  console.log("[automation/run-scan] expired recommendations archived", {
    count: data?.length ?? 0,
  });

  return data?.length ?? 0;
}

async function recordScheduledScanRun({
  scanDate,
  sessionType,
  status,
  recommendationsCreated,
  message,
  ignoreExistingRun,
  scanLog,
}: {
  scanDate: string;
  sessionType: SessionType;
  status: "completed" | "failed";
  recommendationsCreated: number;
  message: string;
  ignoreExistingRun?: boolean;
  scanLog?: ScanLogEntry;
}) {
  const { error } = await supabase.from("scheduled_scan_runs").insert({
    scan_date: scanDate,
    session_type: sessionType,
    status,
    recommendations_created: recommendationsCreated,
    message: scanLog ? buildScanLogMessage(message, scanLog) : message,
  });

  if (error) {
    if (error.code === "23505") {
      console.log("[automation/run-scan] duplicate run record ignored", {
        scanDate,
        sessionType,
        ignoreExistingRun,
      });
      return;
    }

    throw new RecommendationGenerationError(
      error.message ?? "Could not record scheduled scan run.",
      500,
    );
  }
}

function marketStatusLabel(marketStatus: Awaited<ReturnType<typeof getUsMarketStatus>>) {
  if (marketStatus.dayType === "unknown") return "unknown";
  return isMarketOpenForIntradayTrading(marketStatus) ? "open" : "closed";
}

function createAutomationScanLog({
  source,
  scanWindow,
  marketStatus,
  result,
  message,
  recommendationsCreated,
  details,
}: {
  source: "scheduled" | "manual";
  scanWindow: IntradayScanWindow;
  marketStatus: Awaited<ReturnType<typeof getUsMarketStatus>>;
  result?: ScanLogResult | string;
  message: string;
  recommendationsCreated: number;
  details?: Record<string, unknown> | null;
}) {
  return createScanLog({
    source,
    scan_window: scanWindow,
    market_status: marketStatusLabel(marketStatus),
    result:
      (result as ScanLogResult | undefined) ??
      getScanLogResultFromMessage(message, recommendationsCreated),
    message,
    recommendations_created: recommendationsCreated,
    top_candidate_ticker:
      typeof details?.top_candidate_ticker === "string"
        ? details.top_candidate_ticker
        : null,
    top_candidate_score:
      typeof details?.top_candidate_score === "number"
        ? details.top_candidate_score
        : null,
    top_candidate_breakdown:
      typeof details?.top_candidate_breakdown === "object" &&
      details.top_candidate_breakdown !== null
        ? (details.top_candidate_breakdown as Record<string, number>)
        : null,
    top_candidate_reasons: Array.isArray(details?.top_candidate_reasons)
      ? details.top_candidate_reasons.filter(
          (item): item is string => typeof item === "string",
        )
      : null,
    top_candidate_warnings: Array.isArray(details?.top_candidate_warnings)
      ? details.top_candidate_warnings.filter(
          (item): item is string => typeof item === "string",
        )
      : null,
    top_candidate_indicators:
      typeof details?.top_candidate_indicators === "object" &&
      details.top_candidate_indicators !== null
        ? (details.top_candidate_indicators as {
            isAboveVwap: boolean | null;
            momentumDirection: string;
            volumeTrend: string;
          })
        : null,
    indicator_source:
      typeof details?.indicator_source === "string"
        ? details.indicator_source
        : null,
    indicator_cached_at:
      typeof details?.indicator_cached_at === "string"
        ? details.indicator_cached_at
        : null,
    indicator_stale:
      typeof details?.indicator_stale === "boolean"
        ? details.indicator_stale
        : null,
    no_trade_reason:
      typeof details?.no_trade_reason === "string"
        ? details.no_trade_reason
        : null,
    no_trade_risk_flags: Array.isArray(details?.no_trade_risk_flags)
      ? details.no_trade_risk_flags.filter(
          (item): item is string => typeof item === "string",
        )
      : null,
    threshold: typeof details?.threshold === "number" ? details.threshold : null,
    candidates_scanned:
      typeof details?.candidates_scanned === "number"
        ? details.candidates_scanned
        : null,
    skipped_tickers:
      typeof details?.skipped_tickers === "number" ? details.skipped_tickers : null,
    pre_market_candidates: Array.isArray(details?.pre_market_candidates)
      ? (details.pre_market_candidates as ScanLogEntry["pre_market_candidates"])
      : null,
    day_trade_scan_orchestration:
      typeof details?.day_trade_scan_orchestration === "object" &&
      details.day_trade_scan_orchestration !== null
        ? (details.day_trade_scan_orchestration as ScanLogEntry["day_trade_scan_orchestration"])
        : null,
    recommendation_serving_cadence:
      typeof details?.recommendation_serving_cadence === "object" &&
      details.recommendation_serving_cadence !== null
        ? (details.recommendation_serving_cadence as ScanLogEntry["recommendation_serving_cadence"])
        : null,
  });
}

function recommendationTicker(row: RecommendationRow) {
  return textOrNull(row.ticker)?.toUpperCase() ?? null;
}

function recommendationCreatedAt(row: RecommendationRow) {
  return textOrNull(row.created_at) ?? new Date().toISOString();
}

function buildServingCadenceForAutomation({
  scanDate,
  orchestration,
  recommendations,
  ranking,
  now,
}: {
  scanDate: string;
  orchestration: ReturnType<typeof buildDayTradeScanOrchestrationSummary>;
  recommendations: RecommendationRow[];
  ranking: ScanLogEntry["scanner_candidate_ranking"];
  now: Date;
}) {
  return buildRecommendationServingCadenceSummary({
    tradingDate: scanDate,
    orchestration,
    ranking: ranking ?? null,
    visibleRecommendations: recommendations.map((recommendation) => ({
      id: textOrNull(recommendation.id),
      ticker: recommendationTicker(recommendation),
      created_at: recommendationCreatedAt(recommendation),
      status: textOrNull(recommendation.status),
    })),
    now,
  });
}

function buildAutomationScanObservability({
  scanDate,
  scanWindow,
  now,
  marketSession,
  scanLog,
  recommendations,
}: {
  scanDate: string;
  scanWindow: IntradayScanWindow;
  now: Date;
  marketSession: ReturnType<typeof buildMarketSessionEvaluation>;
  scanLog: ScanLogEntry;
  recommendations: RecommendationRow[];
}): ScanPipelineObservabilitySummary {
  const tickers = recommendations
    .map(recommendationTicker)
    .filter((ticker): ticker is string => ticker !== null);
  const candidatesScanned = scanLog.candidates_scanned ?? null;
  const providerStatus =
    scanLog.result === "provider_error" || scanLog.result === "provider_rate_limited"
      ? "unavailable"
      : scanLog.indicator_source || scanLog.real_scanner_candidate_generation
        ? "available"
        : "unknown";
  const status: ScanPipelineObservabilitySummary["status"] =
    scanLog.result === "provider_error" ||
    scanLog.result === "provider_rate_limited" ||
    scanLog.result === "openai_error"
      ? "degraded"
      : recommendations.length > 0
        ? "healthy"
        : "incomplete";

  return {
    summary_id: `automation_scan:${scanDate}:${scanWindow}:${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "scan_pipeline_observability",
    generated_at: now.toISOString(),
    status,
    visible_recommendation_count: recommendations.length,
    intake_counts: {
      accepted: recommendations.length,
      needs_review: 0,
      rejected: 0,
      incomplete: 0,
    },
    accepted_rate:
      candidatesScanned && candidatesScanned > 0
        ? (recommendations.length / candidatesScanned) * 100
        : null,
    elevated_candidate_count: recommendations.length,
    duplicate_ticker_count: Math.max(0, tickers.length - new Set(tickers).size),
    stale_candidate_count: scanLog.indicator_stale ? 1 : 0,
    incomplete_data_candidate_count: 0,
    tickers_represented: Array.from(new Set(tickers)).sort(),
    top_reasons: scanLog.top_candidate_reasons?.slice(0, 4).map((reason, index) => ({
      reason_id: `top_reason_${index + 1}`,
      label: `Top reason ${index + 1}`,
      message: reason,
      count: 1,
    })) ?? [],
    metrics: [
      {
        metric_id: "total_scanned_tickers",
        label: "Scanned tickers",
        value: candidatesScanned,
        display_value: candidatesScanned === null ? "Unknown" : String(candidatesScanned),
        status: candidatesScanned === null ? "unknown" : "ok",
        source: "scan_logs",
      },
      {
        metric_id: "visible_recommendations",
        label: "Visible recommendations",
        value: recommendations.length,
        display_value: String(recommendations.length),
        status: "ok",
        source: "visible_recommendations",
      },
    ],
    warnings: scanLog.top_candidate_warnings?.slice(0, 4).map((message, index) => ({
      warning_id: `top_candidate_warning_${index + 1}`,
      label: "Top candidate warning",
      message,
      source: "scan_logs",
    })) ?? [],
    source_statuses: [
      {
        source_id: "market_data_provider",
        label: "Market data provider",
        status: providerStatus,
        message:
          providerStatus === "available"
            ? "Provider-backed scanner metadata was observed for this run."
            : providerStatus === "unavailable"
              ? "Provider-backed scanner metadata failed or was rate limited."
              : "Provider-backed scanner metadata was not available in this run.",
      },
    ],
    run_context: {
      latest_scan_at: now.toISOString(),
      latest_scan_result: scanLog.result,
      latest_scan_window: scanWindow,
      latest_scan_source: scanLog.source,
      latest_recommendation_at:
        recommendations
          .map((recommendation) => textOrNull(recommendation.created_at))
          .filter((value): value is string => value !== null)
          .sort()
          .at(-1) ?? null,
      latest_observable_update_at: now.toISOString(),
      data_age_minutes: 0,
      market_session_phase: marketSession.phase,
      market_session_risk: marketSession.risk_level,
      market_session_source: marketSession.source,
    },
    unknown_metrics: [],
    summary:
      recommendations.length > 0
        ? `Automation scan served ${recommendations.length} recommendations.`
        : "Automation scan completed without visible recommendations.",
  };
}

function buildSnapshotFromRecommendation({
  recommendation,
  scanRunId,
  scanWindow,
  now,
  marketSession,
  scanObservability,
  servingCadence,
}: {
  recommendation: RecommendationRow;
  scanRunId: string;
  scanWindow: IntradayScanWindow;
  now: Date;
  marketSession: ReturnType<typeof buildMarketSessionEvaluation>;
  scanObservability: ScanPipelineObservabilitySummary;
  servingCadence: RecommendationServingCadenceSummary;
}) {
  const entryLow = numberOrNull(recommendation.entry_low);
  const entryHigh = numberOrNull(recommendation.entry_high);
  const stop = numberOrNull(recommendation.stop_loss);
  const target = numberOrNull(recommendation.target_1);
  const entry =
    entryLow !== null && entryHigh !== null
      ? (entryLow + entryHigh) / 2
      : entryHigh ?? entryLow;
  const side = recommendation.direction === "short" ? "short" : "long";
  const riskPerShare =
    entry !== null && stop !== null
      ? side === "short"
        ? stop - entry
        : entry - stop
      : null;
  const rewardPerShare =
    entry !== null && target !== null
      ? side === "short"
        ? entry - target
        : target - entry
      : null;
  const rationale = [
    recommendation.thesis,
    recommendation.confidence_reasoning,
    recommendation.invalidation,
  ]
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .join(" ");

  return buildRecommendationSnapshot({
    recommendation_id: textOrNull(recommendation.id),
    scan_run_id: scanRunId,
    ticker: recommendationTicker(recommendation),
    company_name: textOrNull(recommendation.company_name),
    recommended_at: recommendationCreatedAt(recommendation),
    app_timestamp: now,
    window: scanWindow,
    market_session_phase: marketSession.phase,
    market_session_risk: marketSession.risk_level,
    market_session_source: marketSession.source,
    source_mode: "supabase",
    data_mode: "supabase_record",
    is_visible: true,
    is_real: true,
    entry,
    entry_low: entryLow,
    entry_high: entryHigh,
    stop,
    target,
    side,
    risk_per_share:
      riskPerShare !== null && riskPerShare > 0 ? riskPerShare : null,
    reward_per_share:
      rewardPerShare !== null && rewardPerShare > 0 ? rewardPerShare : null,
    planned_risk_reward: numberOrNull(recommendation.risk_reward),
    confidence:
      numberOrNull(recommendation.confidence_score) ??
      textOrNull(String(recommendation.confidence ?? "")),
    score: numberOrNull(recommendation.confidence_score),
    rating: textOrNull(String(recommendation.confidence ?? "")),
    label: textOrNull(recommendation.confidence_label),
    type: textOrNull(recommendation.setup_type),
    rationale,
    reason: textOrNull(recommendation.thesis),
    catalyst: textOrNull(recommendation.confidence_reasoning),
    primary_risk:
      textOrNull(recommendation.invalidation) ??
      textOrNull(recommendation.reason_to_avoid),
    freshness: "fresh",
    data_age_minutes: 0,
    quality: {
      scan_observability_summary: scanObservability,
    },
    payload: {
      recommendation,
      market_session: marketSession,
      recommendation_serving_cadence: servingCadence,
    },
  });
}

async function persistAutomationArtifacts({
  scanDate,
  sessionType,
  scanWindow,
  now,
  marketSession,
  marketStatus,
  orchestration,
  scanLog,
  servingCadence,
  recommendations,
}: {
  scanDate: string;
  sessionType: SessionType;
  scanWindow: IntradayScanWindow;
  now: Date;
  marketSession: ReturnType<typeof buildMarketSessionEvaluation>;
  marketStatus: Awaited<ReturnType<typeof getUsMarketStatus>>;
  orchestration: ReturnType<typeof buildDayTradeScanOrchestrationSummary>;
  scanLog: ScanLogEntry;
  servingCadence: RecommendationServingCadenceSummary;
  recommendations: RecommendationRow[];
}) {
  const observability = buildAutomationScanObservability({
    scanDate,
    scanWindow,
    now,
    marketSession,
    scanLog,
    recommendations,
  });
  const scanRun = buildRecommendationScanRun({
    trading_date: scanDate,
    observed_at: now,
    started_at: now,
    completed_at: now,
    window: orchestration.active_window,
    market_session_phase: marketSession.phase,
    market_session_risk: marketSession.risk_level,
    market_session_source: marketSession.source,
    source: "supabase",
    data_mode: "supabase_record",
    scan_observability: observability,
    visible_recommendations: recommendations.map((recommendation) => ({
      id: textOrNull(recommendation.id),
      ticker: recommendationTicker(recommendation),
      created_at: recommendationCreatedAt(recommendation),
    })),
    scheduled_scan_run_id: `${scanDate}:${sessionType}:${scanWindow}`,
    scanned_ticker_count: scanLog.candidates_scanned ?? null,
    raw_candidate_count:
      scanLog.real_scanner_candidate_generation?.universe.candidates_generated ??
      scanLog.candidates_scanned ??
      null,
    payload: {
      scan_window: scanWindow,
      scan_reason: orchestration.scan_reason,
      run_type: orchestration.run_type,
      market_session: marketSession,
      market_status: marketStatus,
      day_trade_scan_orchestration: orchestration,
      recommendation_serving_cadence: servingCadence,
      provider_source:
        scanLog.real_scanner_candidate_generation?.provider_source ??
        scanLog.indicator_source ??
        null,
    },
  });
  const persistence = {
    scan_run: await persistRecommendationScanRun(scanRun, {
      supabaseClient: supabase,
    }),
    snapshots: [] as Array<Awaited<ReturnType<typeof persistRecommendationSnapshot>>>,
    batch: null as Awaited<ReturnType<typeof persistRecommendationBatch>> | null,
  };
  const snapshots: RecommendationSnapshot[] = [];

  for (const recommendation of recommendations) {
    const snapshot = buildSnapshotFromRecommendation({
      recommendation,
      scanRunId: scanRun.run_fingerprint,
      scanWindow,
      now,
      marketSession,
      scanObservability: observability,
      servingCadence,
    });

    snapshots.push(snapshot);
    persistence.snapshots.push(
      await persistRecommendationSnapshot(snapshot, { supabaseClient: supabase }),
    );
  }

  if (
    snapshots.length > 0 ||
    servingCadence.no_trade_valid ||
    servingCadence.batch_status === "no_trade_valid"
  ) {
    const batch = buildRecommendationBatch({
      trading_date: scanDate,
      observed_at: now,
      published_at: servingCadence.latest_official_batch_published_at,
      served_at: servingCadence.served_at,
      window: servingCadence.serving_window,
      batch_type: servingCadence.batch_type,
      snapshots,
      scan_run: scanRun,
      scan_run_id: scanRun.id,
      scan_run_fingerprint: scanRun.run_fingerprint,
      serving_cadence: servingCadence,
      ranking_summary: scanLog.scanner_candidate_ranking ?? null,
      openai_reality_guard: scanLog.openai_recommendation_reality_guard ?? null,
      source_mode: "supabase",
      data_mode: "supabase_record",
      market_session_phase: marketSession.phase,
      payload: {
        scan_window: scanWindow,
        scan_reason: orchestration.scan_reason,
        automation_source: "scheduled",
      },
    });

    persistence.batch = await persistRecommendationBatch(batch, {
      supabaseClient: supabase,
    });
  }

  return {
    scan_run: scanRun,
    snapshots,
    persistence,
  };
}

async function runDiscardReviewIfDue({
  marketStatus,
  scanWindow,
}: {
  marketStatus: Awaited<ReturnType<typeof getUsMarketStatus>>;
  scanWindow: IntradayScanWindow;
}) {
  if (marketStatus.dayType === "unknown") {
    return {
      message: "Discard review skipped: market status unknown.",
      candidates_count: 0,
      reviewed_count: 0,
      skipped_count: 0,
      error_count: 0,
      results: [],
    };
  }

  if (isMarketOpenForIntradayTrading(marketStatus) && scanWindow !== "closed") {
    return {
      message: "Discard review skipped: market still open.",
      candidates_count: 0,
      reviewed_count: 0,
      skipped_count: 0,
      error_count: 0,
      results: [],
    };
  }

  try {
    const result = await reviewPendingDiscardedRecommendations({
      maxReviews: MAX_DISCARD_REVIEWS_PER_RUN,
    });

    return {
      ...result,
      message: `Discard review completed: ${result.reviewed_count} reviewed, ${result.skipped_count} skipped, ${result.error_count} errors.`,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Unknown error";

    console.error("[automation/run-scan] discard_review_error", {
      error: normalizeUnknownError(error),
    });

    return {
      message: `Discard review error: ${message}`,
      candidates_count: 0,
      reviewed_count: 0,
      skipped_count: 0,
      error_count: 1,
      results: [],
    };
  }
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  const matches = Boolean(expectedSecret && providedSecret === expectedSecret);

  if (!matches) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await parseAutomationRunRequestBody(request);
  const force = body.force === true;
  const session_type = body.session_type;
  const requestedScanWindow = parseIntradayScanWindow(body.scan_window);
  const ignore_existing_run = body.ignore_existing_run === true;
  const scheduledFunctionFiredAtUtc = isoTextOrNull(
    body.scheduled_function_fired_at_utc,
  );

  console.log("[automation/run-scan] request body", {
    force,
    session_type,
    scan_window: requestedScanWindow,
    ignore_existing_run,
    source: textOrNull(body.source),
    scheduled_function_fired_at_utc: scheduledFunctionFiredAtUtc,
  });

  const now = new Date();
  const routeReceivedAtUtc = now.toISOString();
  const marketStatus = await getUsMarketStatus();
  const marketSession = buildMarketSessionEvaluation({ now, marketStatus });
  const [recentRecommendationScanRuns, recentScheduledScanRuns] = await Promise.all([
    readRecentRecommendationScanRuns(),
    readRecentScheduledScanRuns(),
  ]);
  let scanWindow = getScanWindowDueNow();

  if (force) {
    const forcedScanWindow = requestedScanWindow ?? getIntradayScanWindow(now);
    const forcedSessionType =
      session_type === "morning" || session_type === "midday"
        ? session_type
        : getLegacySessionTypeForScanWindow(forcedScanWindow);

    if (
      session_type !== undefined &&
      session_type !== "morning" &&
      session_type !== "midday"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Forced scans require session_type to be morning or midday.",
          forced: true,
        },
        { status: 400 },
      );
    }

    scanWindow = {
      scanDate: getNewYorkDateString(now),
      sessionType: forcedSessionType,
      scanWindow: forcedScanWindow,
    };
  }

  let dayTradeScanOrchestration = buildDayTradeScanOrchestrationSummary({
    now,
    marketSession,
    marketStatus,
    scanRuns: recentRecommendationScanRuns,
    currentDataMode: "supabase",
    runType: force ? "diagnostic" : "scheduled",
  });

  if (!force && dayTradeScanOrchestration.active_window === "closed") {
    scanWindow = {
      scanDate: getNewYorkDateString(now),
      sessionType: getLegacySessionTypeForScanWindow("closed"),
      scanWindow: "closed",
    };
  } else if (
    !force &&
    dayTradeScanOrchestration.active_window !== "unknown" &&
    dayTradeScanOrchestration.active_window !== "outside_window"
  ) {
    const orchestrationScanWindow = dayTradeScanWindowToIntradayScanWindow(
      dayTradeScanOrchestration.active_window,
    );

    scanWindow = {
      scanDate: getNewYorkDateString(now),
      sessionType: getLegacySessionTypeForScanWindow(orchestrationScanWindow),
      scanWindow: orchestrationScanWindow,
    };
  }

  const scanPolicy = getIntradayScanPolicy(scanWindow.scanWindow);
  const scanWindowLabel = getIntradayScanWindowLabel(scanWindow.scanWindow);
  let initialServingCadence = buildServingCadenceForAutomation({
    scanDate: scanWindow.scanDate || marketStatus.date,
    orchestration: dayTradeScanOrchestration,
    recommendations: [],
    ranking: null,
    now,
  });
  const automationDiagnostics = ({
    decision,
    skippedReason = null,
    currentScanLog = null,
  }: {
    decision: AutomationScanDecision;
    skippedReason?: string | null;
    currentScanLog?: ScanLogEntry | null;
  }) =>
    buildAutomationRunDiagnostics({
      scheduledFunctionFiredAtUtc,
      routeReceivedAtUtc,
      orchestration: dayTradeScanOrchestration,
      decision,
      scanWindow: scanWindow.scanWindow,
      skippedReason,
      recentRecommendationScanRuns,
      recentScheduledScanRuns,
      currentScanLog,
    });

  let expiredRecommendations = 0;

  try {
    expiredRecommendations = await archiveExpiredRecommendations();
  } catch (error) {
    console.error("[automation/run-scan] archive_expired_recommendations_error", {
      scanDate: scanWindow.scanDate,
      sessionType: scanWindow.sessionType,
      scanWindow: scanWindow.scanWindow,
      error: normalizeUnknownError(error),
    });

    const status =
      error instanceof RecommendationGenerationError ? error.status : 500;
    const message =
      error instanceof Error && error.message ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
        forced: force,
        session_type: scanWindow.sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        scan_date: scanWindow.scanDate || marketStatus.date,
        status: "failed",
        decision: "failed" satisfies AutomationScanDecision,
        automation_diagnostics: automationDiagnostics({
          decision: "failed",
          skippedReason: message,
        }),
        market_session: marketSession,
        ...calendarFields(dayTradeScanOrchestration),
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
        expired_recommendations: expiredRecommendations,
        candidates_generated: 0,
        recommendations_served: 0,
        recommendations_created: 0,
        batch_id: null,
        batch_fingerprint: null,
        scan_run_fingerprint: null,
        warnings: dayTradeScanOrchestration.warnings.map((item) => item.message),
        gaps: [],
      },
      { status },
    );
  }

  const canRunPreMarketWatchlist =
    scanWindow.scanWindow === "pre_market" &&
    marketStatus.isOpenDay &&
    marketStatus.dayType !== "unknown" &&
    marketStatus.dayType !== "weekend" &&
    marketStatus.dayType !== "holiday";
  const fallbackActiveScanWindow = dayTradeScanWindowToIntradayScanWindow(
    dayTradeScanOrchestration.active_window,
  );
  const calendarFallbackAllowsScan =
    dayTradeScanOrchestration.fallback_calendar_scan_allowed &&
    dayTradeScanOrchestration.should_scan_now &&
    fallbackActiveScanWindow === scanWindow.scanWindow;
  const marketOpenForScan =
    isMarketOpenForIntradayTrading(marketStatus) || calendarFallbackAllowsScan;

  if (!marketOpenForScan && !canRunPreMarketWatchlist) {
    const discardReview = await runDiscardReviewIfDue({
      marketStatus,
      scanWindow: scanWindow.scanWindow,
    });
    const message =
      scanWindow.scanWindow === "pre_market" &&
      (marketStatus.dayType === "weekend" || marketStatus.dayType === "holiday")
        ? "Pre-market watchlist skipped: market is closed for weekend/holiday."
        : marketStatus.dayType === "unknown"
        ? "US stock market status is unknown. Scheduled scan skipped."
        : `US stock market is not currently open for active day trading. ${discardReview.message}`;
    const scanLog = createAutomationScanLog({
      source: "scheduled",
      scanWindow: scanWindow.scanWindow,
      marketStatus,
      result:
        scanWindow.scanWindow === "pre_market" &&
        (marketStatus.dayType === "weekend" || marketStatus.dayType === "holiday")
          ? "pre_market_skipped_holiday"
          : marketStatus.dayType === "unknown"
            ? "skipped"
            : "market_closed",
      message,
      recommendationsCreated: 0,
      details: {
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
      },
    });

    return NextResponse.json({
      ok: true,
      message,
      status: "skipped",
      decision: "skipped_market_closed" satisfies AutomationScanDecision,
      automation_diagnostics: automationDiagnostics({
        decision: "skipped_market_closed",
        skippedReason: message,
        currentScanLog: scanLog,
      }),
      market_status: marketStatus,
      market_session: marketSession,
      ...calendarFields(dayTradeScanOrchestration),
      forced: force,
      session_type: scanWindow.sessionType,
      scan_window: scanWindow.scanWindow,
      scan_window_label: scanWindowLabel,
      scan_date: scanWindow.scanDate || marketStatus.date,
      expired_recommendations: expiredRecommendations,
      candidates_generated: 0,
      recommendations_served: 0,
      recommendations_created: 0,
      batch_id: null,
      batch_fingerprint: null,
      scan_run_fingerprint: null,
      warnings: [
        ...dayTradeScanOrchestration.warnings.map((item) => item.message),
        scanLog.message,
      ],
      gaps: [],
      discard_review: discardReview,
      day_trade_scan_orchestration: dayTradeScanOrchestration,
      recommendation_serving_cadence: initialServingCadence,
    });
  }

  if (
    !scanPolicy.allowGeneration &&
    scanWindow.scanWindow !== "pre_market" &&
    !calendarFallbackAllowsScan
  ) {
    const discardReview =
      scanWindow.scanWindow === "closed"
        ? await runDiscardReviewIfDue({
            marketStatus,
            scanWindow: scanWindow.scanWindow,
          })
        : {
            message: "Discard review skipped: market still open.",
            candidates_count: 0,
            reviewed_count: 0,
            skipped_count: 0,
            error_count: 0,
            results: [],
          };

    const result =
      scanWindow.scanWindow === "power_hour"
          ? "power_hour_blocked"
          : "skipped";
    const message = `${scanPolicy.message} ${discardReview.message}`;
    const scanLog = createAutomationScanLog({
      source: "scheduled",
      scanWindow: scanWindow.scanWindow,
      marketStatus,
      result,
      message,
      recommendationsCreated: 0,
      details: {
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
      },
    });

    return NextResponse.json({
      ok: true,
      message,
      status: "skipped",
      decision: "skipped_outside_window" satisfies AutomationScanDecision,
      automation_diagnostics: automationDiagnostics({
        decision: "skipped_outside_window",
        skippedReason: message,
        currentScanLog: scanLog,
      }),
      forced: force,
      session_type: scanWindow.sessionType,
      scan_window: scanWindow.scanWindow,
      scan_window_label: scanWindowLabel,
      scan_date: scanWindow.scanDate,
      market_status: marketStatus,
      market_session: marketSession,
      ...calendarFields(dayTradeScanOrchestration),
      expired_recommendations: expiredRecommendations,
      candidates_generated: 0,
      recommendations_served: 0,
      recommendations_created: 0,
      batch_id: null,
      batch_fingerprint: null,
      scan_run_fingerprint: null,
      warnings: [
        ...dayTradeScanOrchestration.warnings.map((item) => item.message),
        scanLog.message,
      ],
      gaps: [],
      discard_review: discardReview,
      day_trade_scan_orchestration: dayTradeScanOrchestration,
      recommendation_serving_cadence: initialServingCadence,
    });
  }

  const { scanDate, sessionType } = scanWindow;

  try {
    if (!force && !isActiveAutomationWindow(scanWindow.scanWindow)) {
      const message = `${dayTradeScanOrchestration.scan_reason} Scheduled scan skipped without recording a noisy empty run.`;
      const decision =
        dayTradeScanOrchestration.decision === "market_closed"
          ? ("skipped_market_closed" satisfies AutomationScanDecision)
          : ("skipped_outside_window" satisfies AutomationScanDecision);
      return NextResponse.json({
        ok: true,
        message,
        status: "skipped",
        decision,
        automation_diagnostics: automationDiagnostics({
          decision,
          skippedReason: message,
        }),
        forced: force,
        scan_date: scanDate,
        session_type: sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        market_status: marketStatus,
        market_session: marketSession,
        ...calendarFields(dayTradeScanOrchestration),
        expired_recommendations: expiredRecommendations,
        candidates_generated: 0,
        recommendations_served: 0,
        recommendations_created: 0,
        batch_id: null,
        batch_fingerprint: null,
        scan_run_fingerprint: null,
        warnings: dayTradeScanOrchestration.warnings.map((item) => item.message),
        gaps: [],
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
      });
    }

    const providerEnv = providerEnvironmentReady();

    if (!providerEnv.ready) {
      const message = `Scheduled scan skipped: provider environment missing ${providerEnv.missing.join(", ")}.`;

      return NextResponse.json(
        {
          ok: true,
          message,
          status: "skipped",
          decision: "skipped_provider_unavailable" satisfies AutomationScanDecision,
          automation_diagnostics: automationDiagnostics({
            decision: "skipped_provider_unavailable",
            skippedReason: message,
          }),
          forced: force,
          scan_date: scanDate,
          session_type: sessionType,
          scan_window: scanWindow.scanWindow,
          scan_window_label: scanWindowLabel,
          market_status: marketStatus,
          market_session: marketSession,
          ...calendarFields(dayTradeScanOrchestration),
          expired_recommendations: expiredRecommendations,
          candidates_generated: 0,
          recommendations_served: 0,
          recommendations_created: 0,
          batch_id: null,
          batch_fingerprint: null,
          scan_run_fingerprint: null,
          warnings: [
            ...dayTradeScanOrchestration.warnings.map((item) => item.message),
            message,
          ],
          gaps: providerEnv.missing,
          day_trade_scan_orchestration: dayTradeScanOrchestration,
          recommendation_serving_cadence: initialServingCadence,
        },
        { status: 200 },
      );
    }

    dayTradeScanOrchestration = buildDayTradeScanOrchestrationSummary({
      now,
      marketSession,
      marketStatus,
      scanRuns: recentRecommendationScanRuns,
      currentDataMode: "supabase",
      runType: force ? "diagnostic" : "scheduled",
    });
    initialServingCadence = buildServingCadenceForAutomation({
      scanDate,
      orchestration: dayTradeScanOrchestration,
      recommendations: [],
      ranking: null,
      now,
    });

    const latestSameWindowScan = latestScheduledScanForWindow({
      runs: recentScheduledScanRuns,
      scanDate,
      sessionType,
      scanWindow: scanWindow.scanWindow,
    });
    const cooldownMinutes =
      initialServingCadence.background_scan_cadence_minutes.min;

    if (
      !force &&
      !ignore_existing_run &&
      shouldSkipForRecentScan({
        latestScan: latestSameWindowScan,
        now,
        cooldownMinutes,
      })
    ) {
      const ageMinutes = minutesSince(latestSameWindowScan?.row.created_at, now);
      const message = `Recent ${scanWindowLabel} scan already completed ${ageMinutes ?? "recently"} minutes ago.`;

      return NextResponse.json({
        ok: true,
        message,
        status: "skipped",
        decision: "skipped_recent_scan" satisfies AutomationScanDecision,
        automation_diagnostics: automationDiagnostics({
          decision: "skipped_recent_scan",
          skippedReason: message,
        }),
        forced: force,
        scan_date: scanDate,
        session_type: sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        market_status: marketStatus,
        market_session: marketSession,
        ...calendarFields(dayTradeScanOrchestration),
        expired_recommendations: expiredRecommendations,
        candidates_generated:
          latestSameWindowScan?.scanLog.real_scanner_candidate_generation?.universe
            .candidates_generated ??
          latestSameWindowScan?.scanLog.candidates_scanned ??
          0,
        recommendations_served:
          latestSameWindowScan?.scanLog.recommendations_created ?? 0,
        recommendations_created:
          latestSameWindowScan?.scanLog.recommendations_created ?? 0,
        batch_id:
          latestSameWindowScan?.scanLog.recommendation_serving_cadence
            ?.latest_official_batch_id ?? null,
        batch_fingerprint: null,
        scan_run_fingerprint: null,
        warnings: dayTradeScanOrchestration.warnings.map((item) => item.message),
        gaps: [],
        latest_scan: latestSameWindowScan?.scanLog ?? null,
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence:
          latestSameWindowScan?.scanLog.recommendation_serving_cadence ??
          initialServingCadence,
      });
    }

    const generationResult = await generateRecommendations({
      sessionType,
      scanWindow: scanWindow.scanWindow,
      source: "scheduled",
      allowPowerHourRecommendationLogging: calendarFallbackAllowsScan,
    });
    const generationScanLog =
      (generationResult.scan_log ?? null) as RecommendationScanLogDetails | null;
    const recommendationsCreated = generationResult.recommendations.length;
    const insertedRecommendations =
      (generationResult.recommendations ?? []) as RecommendationRow[];
    const servingCadence = buildServingCadenceForAutomation({
      scanDate,
      orchestration: dayTradeScanOrchestration,
      recommendations: insertedRecommendations,
      ranking: generationScanLog?.scanner_candidate_ranking ?? null,
      now,
    });
    const resultMessage =
      generationResult.message ?? `Scheduled ${scanWindowLabel} scan completed.`;
    const message = `${resultMessage} scan_window=${scanWindow.scanWindow}`;
    const scanLog = createAutomationScanLog({
      source: "scheduled",
      scanWindow: scanWindow.scanWindow,
      marketStatus,
      result: generationScanLog?.result,
      message:
        recommendationsCreated > 0
          ? `Created ${recommendationsCreated} day trade recommendation.`
          : resultMessage,
      recommendationsCreated,
      details: {
        ...generationScanLog,
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: servingCadence,
      },
    });

    let artifactResult: Awaited<ReturnType<typeof persistAutomationArtifacts>> | null =
      null;

    try {
      artifactResult = await persistAutomationArtifacts({
        scanDate,
        sessionType,
        scanWindow: scanWindow.scanWindow,
        now,
        marketSession,
        marketStatus,
        orchestration: dayTradeScanOrchestration,
        scanLog,
        servingCadence,
        recommendations: insertedRecommendations,
      });
    } catch (artifactError) {
      console.error("[automation/run-scan] artifact_persistence_error", {
        source: "automation_run_scan",
        operation: "persist_scan_artifacts",
        scanDate,
        sessionType,
        scanWindow: scanWindow.scanWindow,
        error: normalizeUnknownError(artifactError),
      });
    }

    await recordScheduledScanRun({
      scanDate,
      sessionType,
      status: "completed",
      recommendationsCreated,
      message,
      scanLog,
      ignoreExistingRun: ignore_existing_run,
    });

    return NextResponse.json({
      ok: true,
      message,
      status: "completed",
      decision: "scanned" satisfies AutomationScanDecision,
      automation_diagnostics: automationDiagnostics({
        decision: "scanned",
        currentScanLog: scanLog,
      }),
      forced: force,
      ...calendarFields(dayTradeScanOrchestration),
      scan_date: scanDate,
      session_type: sessionType,
      scan_window: scanWindow.scanWindow,
      scan_window_label: scanWindowLabel,
      archived_recommendations: expiredRecommendations,
      expired_recommendations: expiredRecommendations,
      candidates_generated:
        generationScanLog?.real_scanner_candidate_generation?.universe
          .candidates_generated ??
        generationScanLog?.candidates_scanned ??
        0,
      recommendations_served: recommendationsCreated,
      recommendations_created: recommendationsCreated,
      batch_id: servingCadence.latest_official_batch_id,
      batch_fingerprint:
        artifactResult?.persistence.batch?.batch.batch_fingerprint ?? null,
      scan_run_fingerprint: artifactResult?.scan_run.run_fingerprint ?? null,
      warnings: [
        ...dayTradeScanOrchestration.warnings.map((item) => item.message),
        ...(generationScanLog?.top_candidate_warnings ?? []),
        ...(servingCadence.warnings.map((item) => item.message)),
      ],
      gaps: generationScanLog?.real_scanner_candidate_generation?.gaps ?? [],
      duplicate_fallback_used: generationResult.duplicate_fallback_used,
      market_regime: generationResult.market_regime,
      market_status: marketStatus,
      market_session: marketSession,
      day_trade_scan_orchestration: dayTradeScanOrchestration,
      recommendation_serving_cadence: servingCadence,
      persistence: artifactResult?.persistence ?? null,
    });
  } catch (error) {
    console.error("[automation/run-scan] generation_error", {
      scanDate,
      sessionType,
      scanWindow: scanWindow.scanWindow,
      error: normalizeUnknownError(error),
    });

    const message =
      error instanceof Error && error.message ? error.message : "Unknown error";
    const failureResult = errorScanResult(error);
    const scanLog = createAutomationScanLog({
      source: "scheduled",
      scanWindow: scanWindow.scanWindow,
      marketStatus,
      result: failureResult,
      message,
      recommendationsCreated: 0,
      details: {
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
      },
    });

    try {
      await recordScheduledScanRun({
        scanDate,
        sessionType,
        status: "failed",
        recommendationsCreated: 0,
        message: `${message} scan_window=${scanWindow.scanWindow}`,
        scanLog,
        ignoreExistingRun: ignore_existing_run,
      });
    } catch (recordError) {
      console.error("[automation/run-scan] failure_record_error", {
        scanDate,
        sessionType,
        scanWindow: scanWindow.scanWindow,
        error: normalizeUnknownError(recordError),
      });
    }

    const status =
      error instanceof RecommendationGenerationError ? error.status : 500;

    return NextResponse.json(
      {
        ok: false,
        error: message,
        forced: force,
        scan_date: scanDate,
        session_type: sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        market_status: marketStatus,
        market_session: marketSession,
        ...calendarFields(dayTradeScanOrchestration),
        status: "failed",
        decision:
          failureResult === "provider_error" ||
          failureResult === "provider_rate_limited"
            ? ("skipped_provider_unavailable" satisfies AutomationScanDecision)
            : ("failed" satisfies AutomationScanDecision),
        automation_diagnostics: automationDiagnostics({
          decision:
            failureResult === "provider_error" ||
            failureResult === "provider_rate_limited"
              ? "skipped_provider_unavailable"
              : "failed",
          skippedReason:
            failureResult === "provider_error" ||
            failureResult === "provider_rate_limited"
              ? message
              : null,
          currentScanLog: scanLog,
        }),
        expired_recommendations: expiredRecommendations,
        candidates_generated: 0,
        recommendations_served: 0,
        recommendations_created: 0,
        batch_id: null,
        batch_fingerprint: null,
        scan_run_fingerprint: null,
        warnings: [
          ...dayTradeScanOrchestration.warnings.map((item) => item.message),
          message,
        ],
        gaps: failureResult === "provider_rate_limited" ? ["provider_rate_limited"] : [],
        error_details: normalizeUnknownError(error),
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
      },
      { status },
    );
  }
}
