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
  shouldRunOfficialDayTradeScan,
  type DayTradeScanOrchestrationSummary,
} from "@/lib/day-trade-scan-orchestration";
import { buildMarketSessionEvaluation } from "@/lib/market-session";
import {
  buildRecommendationServingCadenceSummary,
  type RecommendationServingCadenceSummary,
} from "@/lib/recommendation-serving-cadence";
import {
  buildScheduledScanAttemptFingerprint,
  buildScheduledScanAttemptRecord,
  buildEmptyScanReason,
  buildScheduledScanRejectionSummary,
} from "@/lib/scheduled-scan-attempts";
import {
  buildRecommendationScanRun,
  persistRecommendationScanRun,
  recommendationScanRunFromPersistenceRow,
  type RecommendationScanRun,
} from "@/lib/recommendation-scan-run";
import {
  buildRecommendationSnapshot,
  persistRecommendationSnapshot,
  summarizeRecommendationSnapshotShadowEntryTrialMetadata,
  type RecommendationSnapshot,
} from "@/lib/recommendation-snapshot";
import {
  buildRecommendationBatch,
  buildRecommendationBatchFingerprint,
  persistRecommendationBatch,
} from "@/lib/recommendation-batch-memory";
import type { ScanPipelineObservabilitySummary } from "@/lib/scan-pipeline-observability";
import { supabase } from "@/lib/supabase";
import { normalizeUnknownError } from "@/lib/error-logging";
import { officialScanLogServesWindow } from "@/lib/official-scan-window-completion";
import {
  createActiveScanTrace,
  errorType,
  zeroCandidateReason,
  type ActiveScanTrace,
  type ActiveScanTraceRecorder,
} from "@/lib/active-scan-trace";
import {
  AUTOMATION_ROUTE_VERSION,
  BUILD_MARKER,
  RECOMMENDATION_PUBLISH_POLICY_VERSION,
} from "@/lib/publish-path-versions";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { checkRecommendationLearningSchema } from "@/lib/recommendation-learning-schema";
import { buildProviderPlanProfile } from "@/lib/provider-plan-profile";
import { evaluateGrowMaxLearningMode } from "@/lib/grow-max-learning-mode";

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
  scheduled_scan_attempt_fingerprint?: unknown;
  max_tickers?: unknown;
  skip_openai?: unknown;
  timeout_ms?: unknown;
};

type AutomationScanDecision =
  | "scanned"
  | "skipped_market_closed"
  | "skipped_outside_window"
  | "skipped_recent_scan"
  | "skipped_in_progress"
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
  grow_max_learning_mode?: boolean;
  grow_max_learning_mode_env_raw_present?: boolean;
  grow_max_learning_mode_env_raw_value_normalized?: boolean;
  grow_max_learning_mode_public_env_raw_present?: boolean;
  grow_max_learning_mode_public_env_raw_value_normalized?: boolean;
  grow_max_learning_mode_requested?: boolean;
  grow_max_learning_mode_blocked_reason?: string | null;
  grow_max_learning_mode_enabled_source?: string;
  target_ideas_per_window?: number | null;
  same_window_limit_reached?: boolean;
  daily_learning_limit_reached?: boolean;
  provider_budget_limit_reached?: boolean;
  window_batch_already_created?: boolean;
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

function automationVersionFields() {
  return {
    automation_route_version: AUTOMATION_ROUTE_VERSION,
    recommendation_publish_policy_version: RECOMMENDATION_PUBLISH_POLICY_VERSION,
    build_marker: BUILD_MARKER,
  };
}

function powerHourTrialCopyFields() {
  return {
    power_hour_trial_copy: [
      POWER_HOUR_TRIAL_ALLOWED_COPY,
      POWER_HOUR_TRIAL_RISK_COPY,
      POWER_HOUR_TRIAL_HUMAN_COPY,
      POWER_HOUR_TRIAL_AUTOMATION_COPY,
    ],
  };
}

const POWER_HOUR_TRIAL_ENABLED = true;
const POWER_HOUR_TRIAL_ALLOWED_COPY =
  "Power Hour trial publishing is enabled for observation and learning.";
const POWER_HOUR_TRIAL_RISK_COPY =
  "Late-day recommendations carry higher EOD risk.";
const POWER_HOUR_TRIAL_HUMAN_COPY = "Execution remains human-confirmed.";
const POWER_HOUR_TRIAL_AUTOMATION_COPY =
  "This does not enable broker automation.";
const DEFAULT_FAST_MODE_MAX_TICKERS = 10;
const DEFAULT_FAST_MODE_TIMEOUT_MS = 23_000;
const MIN_SCHEDULED_TIMEOUT_MS = 5_000;
const MAX_SCHEDULED_TIMEOUT_MS = 25_000;
const MAX_SCHEDULED_SCAN_TICKERS = 50;
const SCHEDULED_IN_PROGRESS_COOLDOWN_MINUTES = 4;

function finiteInteger(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function envBoolean(value: string | undefined) {
  if (value === undefined) return null;
  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return null;
}

function scheduledScanRuntimeConfig(body: AutomationRunRequestBody) {
  const providerPlanProfile = buildProviderPlanProfile();
  const explicitFastMode = envBoolean(process.env.TURE_LIVE_TRIAL_FAST_MODE);
  const liveTrialFastMode =
    explicitFastMode ?? providerPlanProfile.effective_mode === "free";
  const routeMaxTickersOverride = finiteInteger(body.max_tickers);
  const envMaxTickersOverride = finiteInteger(
    process.env.TURE_SCHEDULED_SCAN_MAX_TICKERS,
  );
  const routeTimeoutOverride = finiteInteger(body.timeout_ms);
  const envTimeoutOverride = finiteInteger(process.env.TURE_SCHEDULED_SCAN_TIMEOUT_MS);
  const routeSkipOpenAiOverride =
    typeof body.skip_openai === "boolean" ? body.skip_openai : null;
  const envSkipOpenAiOverride = envBoolean(process.env.TURE_SCHEDULED_SCAN_SKIP_OPENAI);
  const growMaxLearningMode = evaluateGrowMaxLearningMode({
    providerPlanProfileMode: providerPlanProfile.effective_mode,
  });
  const scheduledMaxTickers =
    routeMaxTickersOverride !== null
      ? routeMaxTickersOverride
      : envMaxTickersOverride !== null
        ? envMaxTickersOverride
        : providerPlanProfile.profile_scan_ticker_cap ?? DEFAULT_FAST_MODE_MAX_TICKERS;
  const scheduledTimeoutMs = Math.max(
    MIN_SCHEDULED_TIMEOUT_MS,
    Math.min(
      MAX_SCHEDULED_TIMEOUT_MS,
      routeTimeoutOverride ??
        envTimeoutOverride ??
        providerPlanProfile.profile_scheduled_timeout_ms ??
        DEFAULT_FAST_MODE_TIMEOUT_MS,
    ),
  );
  const scheduledSkipOpenAi =
    growMaxLearningMode.grow_max_learning_mode
      ? true
      : routeSkipOpenAiOverride ??
        envSkipOpenAiOverride ??
        providerPlanProfile.profile_scheduled_skip_openai;
  const effectiveScanTickerCap = Math.max(
    1,
    Math.min(MAX_SCHEDULED_SCAN_TICKERS, scheduledMaxTickers),
  );

  return {
    live_trial_fast_mode: liveTrialFastMode,
    ...growMaxLearningMode,
    target_ideas_per_window: growMaxLearningMode.grow_max_learning_mode
      ? effectiveScanTickerCap
      : null,
    provider_plan_mode: providerPlanProfile.mode,
    provider_plan_profile_mode: providerPlanProfile.effective_mode,
    provider_plan_profile_source: providerPlanProfile.source,
    server_plan_mode: providerPlanProfile.server_plan_mode,
    public_plan_mode: providerPlanProfile.public_plan_mode,
    plan_mode_mismatch: providerPlanProfile.plan_mode_mismatch,
    scheduled_max_tickers: effectiveScanTickerCap,
    scheduled_skip_openai: scheduledSkipOpenAi,
    scheduled_timeout_ms: scheduledTimeoutMs,
    effective_scan_ticker_cap: effectiveScanTickerCap,
    effective_scheduled_skip_openai: scheduledSkipOpenAi,
    effective_scheduled_timeout_ms: scheduledTimeoutMs,
    profile_scan_ticker_cap: providerPlanProfile.profile_scan_ticker_cap,
    profile_outcome_candle_requests_per_run:
      providerPlanProfile.profile_outcome_candle_requests_per_run,
    profile_background_scan_cadence_minutes:
      providerPlanProfile.profile_background_scan_cadence_minutes,
    env_scan_ticker_override: envMaxTickersOverride,
    route_scan_ticker_override: routeMaxTickersOverride,
    profile_notes: providerPlanProfile.profile_notes,
    profile_warnings: providerPlanProfile.profile_warnings,
  };
}

function elapsedMs(startedAtMs: number) {
  return Date.now() - startedAtMs;
}

function timeoutReached(startedAtMs: number, timeoutMs: number) {
  return elapsedMs(startedAtMs) >= timeoutMs;
}

type PowerHourTrialGate = {
  power_hour_trial_enabled: boolean;
  power_hour_publish_allowed: boolean;
  power_hour_publish_block_reason: string | null;
};

function buildPowerHourTrialGate({
  scanWindow,
  marketSessionPhase,
  marketOpenForScan,
  orchestration,
}: {
  scanWindow: IntradayScanWindow;
  marketSessionPhase: string | null | undefined;
  marketOpenForScan: boolean;
  orchestration: DayTradeScanOrchestrationSummary;
}): PowerHourTrialGate {
  if (!POWER_HOUR_TRIAL_ENABLED) {
    return {
      power_hour_trial_enabled: false,
      power_hour_publish_allowed: false,
      power_hour_publish_block_reason: "power_hour_trial_disabled",
    };
  }

  if (scanWindow !== "power_hour") {
    return {
      power_hour_trial_enabled: true,
      power_hour_publish_allowed: false,
      power_hour_publish_block_reason: "not_power_hour",
    };
  }

  if (marketSessionPhase === "closing_soon") {
    return {
      power_hour_trial_enabled: true,
      power_hour_publish_allowed: false,
      power_hour_publish_block_reason: "closing_soon_cutoff",
    };
  }

  if (marketSessionPhase !== "power_hour") {
    return {
      power_hour_trial_enabled: true,
      power_hour_publish_allowed: false,
      power_hour_publish_block_reason: "outside_power_hour_trial_window",
    };
  }

  if (!marketOpenForScan) {
    return {
      power_hour_trial_enabled: true,
      power_hour_publish_allowed: false,
      power_hour_publish_block_reason: "market_not_open",
    };
  }

  if (
    orchestration.calendar_confidence !== "provider_confirmed" &&
    !orchestration.fallback_calendar_scan_allowed
  ) {
    return {
      power_hour_trial_enabled: true,
      power_hour_publish_allowed: false,
      power_hour_publish_block_reason: "calendar_not_confirmed_or_safe_fallback",
    };
  }

  if (
    String(AUTOMATION_ROUTE_VERSION) !== "action_148_publish_path_v1" ||
    String(RECOMMENDATION_PUBLISH_POLICY_VERSION) !==
      "learning_tiers_82_72_60_v1"
  ) {
    return {
      power_hour_trial_enabled: true,
      power_hour_publish_allowed: false,
      power_hour_publish_block_reason: "action_148_publish_policy_not_active",
    };
  }

  return {
    power_hour_trial_enabled: true,
    power_hour_publish_allowed: true,
    power_hour_publish_block_reason: null,
  };
}

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

function scheduledSkipDecisionForOrchestration(
  orchestration: DayTradeScanOrchestrationSummary,
): AutomationScanDecision {
  if (orchestration.decision === "market_closed") {
    return "skipped_market_closed";
  }

  if (
    orchestration.decision === "blocked_by_provider" ||
    orchestration.calendar_confidence === "unknown"
  ) {
    return "skipped_provider_unavailable";
  }

  return "skipped_outside_window";
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
  scheduledRuntimeConfig,
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
  scheduledRuntimeConfig?: ReturnType<typeof scheduledScanRuntimeConfig>;
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
    grow_max_learning_mode:
      scheduledRuntimeConfig?.grow_max_learning_mode ?? false,
    grow_max_learning_mode_env_raw_present:
      scheduledRuntimeConfig?.grow_max_learning_mode_env_raw_present ?? false,
    grow_max_learning_mode_env_raw_value_normalized:
      scheduledRuntimeConfig
        ?.grow_max_learning_mode_env_raw_value_normalized ?? false,
    grow_max_learning_mode_public_env_raw_present:
      scheduledRuntimeConfig?.grow_max_learning_mode_public_env_raw_present ??
      false,
    grow_max_learning_mode_public_env_raw_value_normalized:
      scheduledRuntimeConfig
        ?.grow_max_learning_mode_public_env_raw_value_normalized ?? false,
    grow_max_learning_mode_requested:
      scheduledRuntimeConfig?.grow_max_learning_mode_requested ?? false,
    grow_max_learning_mode_blocked_reason:
      scheduledRuntimeConfig?.grow_max_learning_mode_blocked_reason ??
      "env_flag_not_enabled",
    grow_max_learning_mode_enabled_source:
      scheduledRuntimeConfig?.grow_max_learning_mode_enabled_source ?? "none",
    target_ideas_per_window:
      scheduledRuntimeConfig?.target_ideas_per_window ?? null,
    same_window_limit_reached: decision === "skipped_recent_scan",
    daily_learning_limit_reached: false,
    provider_budget_limit_reached:
      currentScanLog?.result === "provider_rate_limited",
    window_batch_already_created: decision === "skipped_recent_scan",
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

function finishActiveScanTrace(
  activeScanTrace: ActiveScanTraceRecorder,
  {
    decision,
    status,
    skipReason = null,
    candidatesGenerated = 0,
    recommendationsServed = 0,
    recommendationsCreated = 0,
    rankedCandidatesCount = 0,
    recommendationsPublishedCount = recommendationsCreated,
    recommendationBuildPath = null,
    recommendationsBuiltCount = recommendationsCreated,
    strongCount = 0,
    validCount = 0,
    experimentalCount = 0,
    rankedCandidatesNotPublishedReason = null,
    noPublishReason = null,
    strongThreshold = null,
    publishableThreshold = null,
    deterministicFallbackUsed = false,
    batchFingerprint = null,
    scanRunFingerprint = null,
    zeroReason = null,
    selectedCandidateBuildDiagnostics = [],
    selectedToBuiltDropOff = null,
    elapsedMilliseconds = null,
    timeoutWasReached = false,
  }: {
    decision: AutomationScanDecision | string;
    status: string;
    skipReason?: string | null;
    candidatesGenerated?: number;
    recommendationsServed?: number;
    recommendationsCreated?: number;
    rankedCandidatesCount?: number;
    recommendationsPublishedCount?: number;
    recommendationBuildPath?: string | null;
    recommendationsBuiltCount?: number;
    strongCount?: number;
    validCount?: number;
    experimentalCount?: number;
    rankedCandidatesNotPublishedReason?: string | null;
    noPublishReason?: string | null;
    strongThreshold?: number | null;
    publishableThreshold?: number | null;
    deterministicFallbackUsed?: boolean;
    batchFingerprint?: string | null;
    scanRunFingerprint?: string | null;
    zeroReason?: string | null;
    selectedCandidateBuildDiagnostics?: NonNullable<
      RecommendationScanLogDetails["selected_candidate_build_diagnostics"]
    >;
    selectedToBuiltDropOff?: RecommendationScanLogDetails["selected_to_built_drop_off"];
    elapsedMilliseconds?: number | null;
    timeoutWasReached?: boolean;
  },
) {
  if (skipReason) {
    activeScanTrace.update({ skip_reason: skipReason });
  }

  activeScanTrace.update({
    elapsed_ms: elapsedMilliseconds,
    timeout_reached: timeoutWasReached,
    partial_result: timeoutWasReached,
  });

  const resolvedNoPublishReason = resolveNoPublishReason({
    activeScanTrace,
    recommendationsCreated,
    rankedCandidatesCount,
    strongCount,
    validCount,
    experimentalCount,
    rankedCandidatesNotPublishedReason,
    noPublishReason,
    deterministicFallbackUsed,
    skipReason,
  });

  activeScanTrace.updateFinal({
    decision,
    status,
    candidates_generated: candidatesGenerated,
    recommendations_served: recommendationsServed,
    recommendations_created: recommendationsCreated,
    ranked_candidates_count: rankedCandidatesCount,
    recommendations_published_count: recommendationsPublishedCount,
    recommendation_build_path: recommendationBuildPath,
    recommendations_built_count: recommendationsBuiltCount,
    strong_count: strongCount,
    valid_count: validCount,
    experimental_count: experimentalCount,
    ranked_candidates_not_published_reason: rankedCandidatesNotPublishedReason,
    no_publish_reason: resolvedNoPublishReason,
    strong_threshold: strongThreshold,
    publishable_threshold: publishableThreshold,
    deterministic_fallback_used: deterministicFallbackUsed,
    fallback_used: deterministicFallbackUsed,
    publish_policy_version: RECOMMENDATION_PUBLISH_POLICY_VERSION,
    batch_fingerprint: batchFingerprint,
    scan_run_fingerprint: scanRunFingerprint,
    zero_candidate_reason:
      candidatesGenerated === 0 || recommendationsCreated === 0
        ? zeroReason ?? resolvedNoPublishReason ?? zeroCandidateReason(activeScanTrace.trace)
        : null,
    selected_candidate_build_diagnostics: selectedCandidateBuildDiagnostics,
    selected_to_built_drop_off: selectedToBuiltDropOff,
  });
  activeScanTrace.markStage("final", "completed");

  return activeScanTrace.trace;
}

function resolveNoPublishReason({
  activeScanTrace,
  recommendationsCreated,
  rankedCandidatesCount,
  strongCount,
  validCount,
  experimentalCount,
  rankedCandidatesNotPublishedReason,
  noPublishReason,
  deterministicFallbackUsed,
  skipReason,
}: {
  activeScanTrace: ActiveScanTraceRecorder;
  recommendationsCreated: number;
  rankedCandidatesCount: number;
  strongCount: number;
  validCount: number;
  experimentalCount: number;
  rankedCandidatesNotPublishedReason: string | null;
  noPublishReason: string | null;
  deterministicFallbackUsed: boolean;
  skipReason: string | null;
}) {
  if (recommendationsCreated > 0) return null;
  if (noPublishReason) return noPublishReason;

  const reasonText = `${rankedCandidatesNotPublishedReason ?? ""} ${
    skipReason ?? ""
  }`.toLowerCase();

  if (reasonText.includes("candidate below threshold")) {
    return "old_threshold_gate";
  }

  if (reasonText.includes("power hour")) {
    return "power_hour_disabled";
  }

  if (activeScanTrace.trace.persistence.persistence_error_type) {
    return "persistence_failed";
  }

  if (rankedCandidatesCount > 0 && strongCount + validCount + experimentalCount === 0) {
    return "invalid_selected_candidates";
  }

  if (
    activeScanTrace.trace.openai.openai_attempted &&
    activeScanTrace.trace.openai.output_recommendation_count === 0 &&
    !deterministicFallbackUsed
  ) {
    return "openai_failed_and_no_fallback";
  }

  if (
    rankedCandidatesCount > 0 &&
    activeScanTrace.trace.stages.openai === "not_reached"
  ) {
    return "publish_path_not_reached";
  }

  if (rankedCandidatesCount > 0) {
    return "unknown";
  }

  return null;
}

function persistenceErrorType(value: string | null | undefined) {
  if (!value) return null;
  return value.split(":")[0]?.slice(0, 80) || "unknown";
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
        run.row.status === "completed" &&
        officialScanLogServesWindow(run.scanLog)
      );
    }) ?? null
  );
}

function latestInProgressScheduledScanForWindow({
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
        run.row.status === "started"
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
  status: "started" | "completed" | "failed" | "skipped";
  recommendationsCreated: number;
  message: string;
  ignoreExistingRun?: boolean;
  scanLog?: ScanLogEntry;
}) {
  const { data, error } = await supabase
    .from("scheduled_scan_runs")
    .insert({
      scan_date: scanDate,
      session_type: sessionType,
      status,
      recommendations_created: recommendationsCreated,
      message: scanLog ? buildScanLogMessage(message, scanLog) : message,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      console.log("[automation/run-scan] duplicate run record ignored", {
        scanDate,
        sessionType,
        ignoreExistingRun,
      });
      return null;
    }

    throw new RecommendationGenerationError(
      error.message ?? "Could not record scheduled scan run.",
      500,
    );
  }

  return data?.id ?? null;
}

async function updateScheduledScanRun({
  runId,
  status,
  recommendationsCreated,
  message,
  scanLog,
}: {
  runId: string | number | null;
  status: "completed" | "failed" | "skipped";
  recommendationsCreated: number;
  message: string;
  scanLog?: ScanLogEntry;
}) {
  if (runId === null || runId === undefined) return;

  const { error } = await supabase
    .from("scheduled_scan_runs")
    .update({
      status,
      recommendations_created: recommendationsCreated,
      message: scanLog ? buildScanLogMessage(message, scanLog) : message,
    })
    .eq("id", runId);

  if (error) {
    throw new RecommendationGenerationError(
      error.message ?? "Could not update scheduled scan run.",
      500,
    );
  }
}

async function recordScheduledScanAttempt({
  attemptFingerprint,
  source,
  mode,
  outcome,
  allowed,
  routeReceivedAtUtc,
  scheduledFunctionFiredAtUtc,
  scanDate,
  scanWindow,
  orchestration,
  message,
  skipReason = null,
  httpStatus = null,
  scanLog = null,
  activeScanTrace = null,
  scheduledScanRunId = null,
}: {
  attemptFingerprint: string;
  source: string | null;
  mode: "scheduled" | "manual" | "diagnostic";
  outcome: "scheduled_function_fired" | "route_received" | "skipped" | "failed" | "scanned" | "request_failed";
  allowed: boolean | null;
  routeReceivedAtUtc: string;
  scheduledFunctionFiredAtUtc: string | null;
  scanDate: string;
  scanWindow: IntradayScanWindow;
  orchestration: DayTradeScanOrchestrationSummary;
  message: string | null;
  skipReason?: string | null;
  httpStatus?: number | null;
  scanLog?: ScanLogEntry | null;
  activeScanTrace?: ActiveScanTrace | null;
  scheduledScanRunId?: string | number | null;
}) {
  const rawCount =
    activeScanTrace?.raw_candidates.raw_candidate_count ??
    scanLog?.real_scanner_candidate_generation?.universe.candidates_generated ??
    scanLog?.candidates_scanned ??
    null;
  const rankedCount =
    activeScanTrace?.ranking.ranked_count ??
    scanLog?.ranked_candidates_count ??
    null;
  const selectedCount =
    activeScanTrace?.ranking.selected_count ??
    scanLog?.scanner_candidate_ranking?.selected_count ??
    null;
  const builtCount =
    activeScanTrace?.final.recommendations_built_count ??
    scanLog?.recommendations_built_count ??
    null;
  const publishedCount =
    activeScanTrace?.final.recommendations_published_count ??
    scanLog?.recommendations_published_count ??
    scanLog?.recommendations_created ??
    null;
  const record = buildScheduledScanAttemptRecord({
    attempt_fingerprint: attemptFingerprint,
    trading_date: scanDate,
    source: source ?? "automation_route",
    mode,
    outcome,
    allowed,
    route_received_at: routeReceivedAtUtc,
    scheduled_function_fired_at: scheduledFunctionFiredAtUtc,
    utc_timestamp: routeReceivedAtUtc,
    official_window: orchestration.active_window,
    intraday_scan_window: scanWindow,
    orchestration_decision: orchestration.decision,
    skip_reason:
      skipReason ??
      (publishedCount === 0
        ? buildEmptyScanReason(
            activeScanTrace?.final.selected_to_built_drop_off ??
              scanLog?.selected_to_built_drop_off ??
              null,
          )
        : null),
    message,
    http_status: httpStatus,
    raw_count: rawCount,
    ranked_count: rankedCount,
    selected_count: selectedCount,
    built_count: builtCount,
    published_count: publishedCount,
    recommendations_created:
      activeScanTrace?.final.recommendations_created ??
      scanLog?.recommendations_created ??
      null,
    batch_fingerprint: activeScanTrace?.final.batch_fingerprint ?? null,
    scan_run_fingerprint: activeScanTrace?.final.scan_run_fingerprint ?? null,
    scheduled_scan_run_id:
      scheduledScanRunId === null || scheduledScanRunId === undefined
        ? null
        : String(scheduledScanRunId),
    payload_json: {
      scan_log_result: scanLog?.result ?? null,
      active_scan_trace: activeScanTrace,
      selected_to_built_drop_off:
        activeScanTrace?.final.selected_to_built_drop_off ??
        scanLog?.selected_to_built_drop_off ??
        null,
      selected_candidate_build_diagnostics:
        activeScanTrace?.final.selected_candidate_build_diagnostics ??
        scanLog?.selected_candidate_build_diagnostics ??
        [],
      reference_refresh: scanLog?.reference_refresh ?? null,
    },
  });
  const { error } = await supabase
    .from("scheduled_scan_attempts")
    .upsert(record, { onConflict: "attempt_fingerprint" });

  if (error) {
    console.error("[automation/run-scan] scheduled_scan_attempt_record_error", {
      source: "supabase.scheduled_scan_attempts",
      operation: "upsert_scheduled_scan_attempt",
      attemptFingerprint,
      error: normalizeUnknownError(error),
    });
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
  const detailsActiveTrace =
    typeof details?.active_scan_trace === "object" &&
    details.active_scan_trace !== null
      ? (details.active_scan_trace as ActiveScanTrace)
      : null;

  return createScanLog({
    source,
    scan_window: scanWindow,
    market_status: marketStatusLabel(marketStatus),
    automation_route_version: AUTOMATION_ROUTE_VERSION,
    recommendation_publish_policy_version: RECOMMENDATION_PUBLISH_POLICY_VERSION,
    build_marker: BUILD_MARKER,
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
    dynamic_movers_discovery:
      typeof details?.dynamic_movers_discovery === "object" &&
      details.dynamic_movers_discovery !== null
        ? (details.dynamic_movers_discovery as ScanLogEntry["dynamic_movers_discovery"])
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
    ranked_candidates_count:
      typeof details?.ranked_candidates_count === "number"
        ? details.ranked_candidates_count
        : null,
    recommendations_published_count:
      typeof details?.recommendations_published_count === "number"
        ? details.recommendations_published_count
        : null,
    recommendation_build_path:
      typeof details?.recommendation_build_path === "string"
        ? details.recommendation_build_path
        : null,
    recommendations_built_count:
      typeof details?.recommendations_built_count === "number"
        ? details.recommendations_built_count
        : null,
    selected_candidate_build_diagnostics: Array.isArray(
      details?.selected_candidate_build_diagnostics,
    )
      ? details.selected_candidate_build_diagnostics
      : null,
    selected_to_built_drop_off:
      typeof details?.selected_to_built_drop_off === "object" &&
      details.selected_to_built_drop_off !== null
        ? (details.selected_to_built_drop_off as RecommendationScanLogDetails["selected_to_built_drop_off"])
        : null,
    reference_refresh:
      typeof details?.reference_refresh === "object" &&
      details.reference_refresh !== null
        ? (details.reference_refresh as RecommendationScanLogDetails["reference_refresh"])
        : null,
    strong_count:
      typeof details?.strong_count === "number" ? details.strong_count : null,
    valid_count:
      typeof details?.valid_count === "number" ? details.valid_count : null,
    experimental_count:
      typeof details?.experimental_count === "number"
        ? details.experimental_count
        : null,
    ranked_candidates_not_published_reason:
      typeof details?.ranked_candidates_not_published_reason === "string"
        ? details.ranked_candidates_not_published_reason
        : null,
    no_publish_reason:
      typeof details?.no_publish_reason === "string"
        ? details.no_publish_reason
        : null,
    power_hour_trial_enabled:
      typeof details?.power_hour_trial_enabled === "boolean"
        ? details.power_hour_trial_enabled
        : detailsActiveTrace?.power_hour_trial_enabled ?? null,
    power_hour_publish_allowed:
      typeof details?.power_hour_publish_allowed === "boolean"
        ? details.power_hour_publish_allowed
        : detailsActiveTrace?.power_hour_publish_allowed ?? null,
    power_hour_publish_block_reason:
      typeof details?.power_hour_publish_block_reason === "string"
        ? details.power_hour_publish_block_reason
        : detailsActiveTrace?.power_hour_publish_block_reason ?? null,
    strong_threshold:
      typeof details?.strong_threshold === "number"
        ? details.strong_threshold
        : null,
    publishable_threshold:
      typeof details?.publishable_threshold === "number"
        ? details.publishable_threshold
        : null,
    deterministic_fallback_used:
      typeof details?.deterministic_fallback_used === "boolean"
        ? details.deterministic_fallback_used
        : null,
    active_scan_trace:
      detailsActiveTrace,
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
  scanLog,
  providerPlanProfileMode,
  batchFingerprint,
}: {
  recommendation: RecommendationRow;
  scanRunId: string;
  scanWindow: IntradayScanWindow;
  now: Date;
  marketSession: ReturnType<typeof buildMarketSessionEvaluation>;
  scanObservability: ScanPipelineObservabilitySummary;
  servingCadence: RecommendationServingCadenceSummary;
  scanLog: ScanLogEntry;
  providerPlanProfileMode: string | null;
  batchFingerprint: string | null;
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
  const ticker = recommendationTicker(recommendation);
  const scannerCandidate =
    scanLog.real_scanner_candidate_generation?.candidates.find(
      (candidate) => candidate.ticker === ticker,
    ) ?? null;
  const providerSource =
    scannerCandidate?.provider_source ??
    scanLog.real_scanner_candidate_generation?.provider_source ??
    null;
  const marketDataSource =
    scannerCandidate?.data_source ?? scanLog.indicator_source ?? null;
  const dataTimestamp =
    scannerCandidate?.market_data_timestamp ?? scanLog.indicator_cached_at ?? null;
  const providerStatus = providerSource
    ? "observed"
    : scanLog.real_scanner_candidate_generation
      ? "unavailable"
      : "not_observed";
  const explicitMetadataGaps = Array.from(
    new Set([
      ...(dataTimestamp ? [] : ["missing_data_timestamp"]),
      ...(providerSource ? [] : ["provider_source_unavailable"]),
      ...(marketDataSource ? [] : ["provider_backed_metadata_unavailable"]),
      ...(scannerCandidate ? [] : ["provider_backed_metadata_unavailable"]),
      ...(scannerCandidate?.stale ? ["stale_market_data"] : []),
      ...(batchFingerprint ? [] : ["batch_fingerprint_unavailable"]),
    ]),
  );

  return buildRecommendationSnapshot({
    recommendation_id: textOrNull(recommendation.id),
    scan_run_id: scanRunId,
    ticker,
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
      data_timestamp: dataTimestamp,
      provider_source: providerSource,
      provider_status: providerStatus,
      market_data_source: marketDataSource,
      candle_timestamp: dataTimestamp,
      quote_timestamp: null,
      scan_run_fingerprint: scanRunId,
      batch_fingerprint: batchFingerprint,
      scan_window: scanWindow,
      market_session_phase: marketSession.phase,
      provider_plan_profile_mode: providerPlanProfileMode,
      build_marker: BUILD_MARKER,
      recommendation_publish_policy_version:
        RECOMMENDATION_PUBLISH_POLICY_VERSION,
      explicit_metadata_gaps: explicitMetadataGaps,
      side,
      direction: side,
      trade_direction: side,
      recommendation_side: side,
      action: side === "short" ? "sell" : "buy",
      trade_plan: {
        side,
        direction: side,
        action: side === "short" ? "sell" : "buy",
        entry,
        stop,
        target,
      },
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
  activeScanTrace,
  providerPlanProfileMode,
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
  activeScanTrace?: ActiveScanTraceRecorder | null;
  providerPlanProfileMode: string | null;
}) {
  activeScanTrace?.markStage("persistence", "started");
  const serverSupabase = getServerSupabaseClient();
  const observability = buildAutomationScanObservability({
    scanDate,
    scanWindow,
    now,
    marketSession,
    scanLog,
    recommendations,
  });
  const selectedToBuiltDropOff = scanLog.selected_to_built_drop_off ?? null;
  const emptyScanReason = buildEmptyScanReason(selectedToBuiltDropOff);
  const buildRejectionSummary = buildScheduledScanRejectionSummary({
    dropOff: selectedToBuiltDropOff,
    emptyScanReason,
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
      active_scan_trace: activeScanTrace?.trace ?? null,
      power_hour_trial_enabled:
        activeScanTrace?.trace.power_hour_trial_enabled ?? false,
      power_hour_publish_allowed:
        activeScanTrace?.trace.power_hour_publish_allowed ?? false,
      power_hour_publish_block_reason:
        activeScanTrace?.trace.power_hour_publish_block_reason ?? null,
      power_hour_trial_copy: powerHourTrialCopyFields().power_hour_trial_copy,
      provider_source:
        scanLog.real_scanner_candidate_generation?.provider_source ??
        scanLog.indicator_source ??
        null,
      selected_to_built_drop_off: selectedToBuiltDropOff,
      selected_candidate_build_diagnostics:
        scanLog.selected_candidate_build_diagnostics ?? [],
      reference_refresh: scanLog.reference_refresh ?? null,
      empty_scan_reason: emptyScanReason,
      build_rejection_diagnostics: {
        selected_count:
          selectedToBuiltDropOff?.selected_count ??
          scanLog.scanner_candidate_ranking?.selected_count ??
          null,
        built_count:
          selectedToBuiltDropOff?.built_count ??
          scanLog.recommendations_built_count ??
          null,
        published_count:
          scanLog.recommendations_published_count ??
          scanLog.recommendations_created ??
          null,
        selected_to_built_drop_off: selectedToBuiltDropOff,
        selected_candidate_build_diagnostics:
          scanLog.selected_candidate_build_diagnostics ?? [],
        rejection_summary: buildRejectionSummary,
      },
    },
  });
  const persistence = {
    scan_run: await persistRecommendationScanRun(scanRun, {
      supabaseClient: serverSupabase.client,
      server: true,
      unavailableReason: serverSupabase.unavailable_reason,
    }),
    snapshots: [] as Array<Awaited<ReturnType<typeof persistRecommendationSnapshot>>>,
    batch: null as Awaited<ReturnType<typeof persistRecommendationBatch>> | null,
  };
  const preliminarySnapshots = recommendations.map((recommendation) =>
    buildSnapshotFromRecommendation({
      recommendation,
      scanRunId: scanRun.run_fingerprint,
      scanWindow,
      now,
      marketSession,
      scanObservability: observability,
      servingCadence,
      scanLog,
      providerPlanProfileMode,
      batchFingerprint: null,
    }),
  );
  const anticipatedBatchFingerprint =
    preliminarySnapshots.length > 0 ||
    servingCadence.no_trade_valid ||
    servingCadence.batch_status === "no_trade_valid"
      ? buildRecommendationBatchFingerprint({
          trading_date: scanDate,
          observed_at: now,
          published_at: servingCadence.latest_official_batch_published_at,
          served_at: servingCadence.served_at,
          window: servingCadence.serving_window,
          batch_type: servingCadence.batch_type,
          snapshots: preliminarySnapshots,
          scan_run: scanRun,
          scan_run_id: scanRun.id,
          scan_run_fingerprint: scanRun.run_fingerprint,
          serving_cadence: servingCadence,
          source_mode: "supabase",
          data_mode: "supabase_record",
          market_session_phase: marketSession.phase,
        })
      : null;
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
      scanLog,
      providerPlanProfileMode,
      batchFingerprint: anticipatedBatchFingerprint,
    });

    snapshots.push(snapshot);
    persistence.snapshots.push(
      await persistRecommendationSnapshot(snapshot, {
        supabaseClient: serverSupabase.client,
        server: true,
        unavailableReason: serverSupabase.unavailable_reason,
      }),
    );
  }

  const shadowSnapshotSummary =
    summarizeRecommendationSnapshotShadowEntryTrialMetadata(snapshots);
  activeScanTrace?.updatePersistence({
    shadow_entry_trial_attached_count:
      shadowSnapshotSummary.shadow_snapshot_metadata_present_count,
    shadow_entry_trial_variant:
      shadowSnapshotSummary.shadow_snapshot_metadata_present_count > 0
        ? Object.entries(
            shadowSnapshotSummary.shadow_snapshot_variant_counts,
          ).sort((first, second) => second[1] - first[1])[0]?.[0] ?? null
        : null,
    shadow_entry_trial_not_live_signal_count:
      shadowSnapshotSummary.shadow_snapshot_not_live_signal_count,
  });

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
        active_scan_trace: activeScanTrace?.trace ?? null,
        power_hour_trial_enabled:
          activeScanTrace?.trace.power_hour_trial_enabled ?? false,
        power_hour_publish_allowed:
          activeScanTrace?.trace.power_hour_publish_allowed ?? false,
        power_hour_publish_block_reason:
          activeScanTrace?.trace.power_hour_publish_block_reason ?? null,
        eod_risk:
          activeScanTrace?.trace.power_hour_publish_allowed === true ? "high" : null,
        recommendation_intent:
          activeScanTrace?.trace.power_hour_publish_allowed === true
            ? "learning_observation"
            : "day_trade",
        power_hour_trial_copy: powerHourTrialCopyFields().power_hour_trial_copy,
      },
    });

    persistence.batch = await persistRecommendationBatch(batch, {
      supabaseClient: serverSupabase.client,
      server: true,
      unavailableReason: serverSupabase.unavailable_reason,
    });
  }

  return {
    scan_run: scanRun,
    snapshots,
    shadow_snapshot_summary: shadowSnapshotSummary,
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
    return NextResponse.json(
      { error: "Unauthorized.", ...automationVersionFields() },
      { status: 401 },
    );
  }

  const body = await parseAutomationRunRequestBody(request);
  const force = body.force === true;
  const session_type = body.session_type;
  const requestedScanWindow = parseIntradayScanWindow(body.scan_window);
  const ignore_existing_run = body.ignore_existing_run === true;
  const scheduledFunctionFiredAtUtc = isoTextOrNull(
    body.scheduled_function_fired_at_utc,
  );
  const requestSource = textOrNull(body.source);
  const scheduledScanAttemptFingerprint =
    textOrNull(body.scheduled_scan_attempt_fingerprint) ??
    buildScheduledScanAttemptFingerprint({
      scheduledFunctionFiredAt: scheduledFunctionFiredAtUtc,
      routeReceivedAt: new Date().toISOString(),
      source: requestSource ?? (force ? "manual" : "automation_route"),
    });

  console.log("[automation/run-scan] request body", {
    force,
    session_type,
    scan_window: requestedScanWindow,
    ignore_existing_run,
    source: requestSource,
    scheduled_function_fired_at_utc: scheduledFunctionFiredAtUtc,
    scheduled_scan_attempt_fingerprint: scheduledScanAttemptFingerprint,
  });

  const routeStartedAtMs = Date.now();
  const scheduledRuntimeConfig = scheduledScanRuntimeConfig(body);
  const scheduledRuntimeFields = () => ({
    live_trial_fast_mode: scheduledRuntimeConfig.live_trial_fast_mode,
    grow_max_learning_mode: scheduledRuntimeConfig.grow_max_learning_mode,
    grow_max_learning_mode_env_raw_present:
      scheduledRuntimeConfig.grow_max_learning_mode_env_raw_present,
    grow_max_learning_mode_env_raw_value_normalized:
      scheduledRuntimeConfig.grow_max_learning_mode_env_raw_value_normalized,
    grow_max_learning_mode_public_env_raw_present:
      scheduledRuntimeConfig.grow_max_learning_mode_public_env_raw_present,
    grow_max_learning_mode_public_env_raw_value_normalized:
      scheduledRuntimeConfig
        .grow_max_learning_mode_public_env_raw_value_normalized,
    grow_max_learning_mode_requested:
      scheduledRuntimeConfig.grow_max_learning_mode_requested,
    grow_max_learning_mode_blocked_reason:
      scheduledRuntimeConfig.grow_max_learning_mode_blocked_reason,
    grow_max_learning_mode_enabled_source:
      scheduledRuntimeConfig.grow_max_learning_mode_enabled_source,
    target_ideas_per_window: scheduledRuntimeConfig.target_ideas_per_window,
    provider_plan_mode: scheduledRuntimeConfig.provider_plan_mode,
    provider_plan_profile_mode:
      scheduledRuntimeConfig.provider_plan_profile_mode,
    provider_plan_profile_source:
      scheduledRuntimeConfig.provider_plan_profile_source,
    server_plan_mode: scheduledRuntimeConfig.server_plan_mode,
    public_plan_mode: scheduledRuntimeConfig.public_plan_mode,
    plan_mode_mismatch: scheduledRuntimeConfig.plan_mode_mismatch,
    scheduled_max_tickers: scheduledRuntimeConfig.scheduled_max_tickers,
    scheduled_skip_openai: scheduledRuntimeConfig.scheduled_skip_openai,
    scheduled_timeout_ms: scheduledRuntimeConfig.scheduled_timeout_ms,
    effective_scan_ticker_cap:
      scheduledRuntimeConfig.effective_scan_ticker_cap,
    effective_outcome_candle_request_cap:
      scheduledRuntimeConfig.profile_outcome_candle_requests_per_run,
    effective_scheduled_skip_openai:
      scheduledRuntimeConfig.effective_scheduled_skip_openai,
    effective_scheduled_timeout_ms:
      scheduledRuntimeConfig.effective_scheduled_timeout_ms,
    profile_scan_ticker_cap: scheduledRuntimeConfig.profile_scan_ticker_cap,
    profile_outcome_candle_requests_per_run:
      scheduledRuntimeConfig.profile_outcome_candle_requests_per_run,
    profile_background_scan_cadence_minutes:
      scheduledRuntimeConfig.profile_background_scan_cadence_minutes,
    env_scan_ticker_override:
      scheduledRuntimeConfig.env_scan_ticker_override,
    route_scan_ticker_override:
      scheduledRuntimeConfig.route_scan_ticker_override,
    profile_notes: scheduledRuntimeConfig.profile_notes,
    profile_warnings: scheduledRuntimeConfig.profile_warnings,
    elapsed_ms: elapsedMs(routeStartedAtMs),
    timeout_reached: timeoutReached(
      routeStartedAtMs,
      scheduledRuntimeConfig.scheduled_timeout_ms,
    ),
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
          ...automationVersionFields(),
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
  const activeScanTrace = createActiveScanTrace({
    routeReceivedAt: routeReceivedAtUtc,
    scheduledFunctionFiredAtUtc,
    scanWindow: scanWindow.scanWindow,
  });
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
      scheduledRuntimeConfig,
      skippedReason,
      recentRecommendationScanRuns,
      recentScheduledScanRuns,
      currentScanLog,
    });
  const attemptMode: "scheduled" | "manual" | "diagnostic" = force
    ? "diagnostic"
    : "scheduled";
  const recordAttempt = (input: {
    outcome: Parameters<typeof recordScheduledScanAttempt>[0]["outcome"];
    allowed?: boolean | null;
    message?: string | null;
    skipReason?: string | null;
    httpStatus?: number | null;
    scanLog?: ScanLogEntry | null;
    activeScanTrace?: ActiveScanTrace | null;
    scheduledScanRunId?: string | number | null;
  }) =>
    recordScheduledScanAttempt({
      attemptFingerprint: scheduledScanAttemptFingerprint,
      source: requestSource ?? (force ? "manual" : "automation_route"),
      mode: attemptMode,
      outcome: input.outcome,
      allowed:
        input.allowed ??
        (dayTradeScanOrchestration.should_scan_now &&
          shouldRunOfficialDayTradeScan(dayTradeScanOrchestration)),
      routeReceivedAtUtc,
      scheduledFunctionFiredAtUtc,
      scanDate: scanWindow.scanDate || marketStatus.date,
      scanWindow: scanWindow.scanWindow,
      orchestration: dayTradeScanOrchestration,
      message: input.message ?? null,
      skipReason: input.skipReason ?? null,
      httpStatus: input.httpStatus ?? null,
      scanLog: input.scanLog ?? null,
      activeScanTrace: input.activeScanTrace ?? null,
      scheduledScanRunId: input.scheduledScanRunId ?? null,
    });

  await recordAttempt({
    outcome: "route_received",
    allowed: dayTradeScanOrchestration.should_scan_now,
    message: "Automation route received scheduled scan request.",
  });

  activeScanTrace.updateProviderEnv();
  const schemaSupabase = getServerSupabaseClient();
  const schemaCheck = await checkRecommendationLearningSchema({
    supabaseClient: schemaSupabase.client,
    unavailableReason: schemaSupabase.unavailable_reason,
  });
  activeScanTrace.updateSchemaCheck(schemaCheck);
  activeScanTrace.update({
    interpreted_ny_time: `${dayTradeScanOrchestration.trading_date} ${dayTradeScanOrchestration.ny_time} America/New_York`,
    market_status: marketStatusLabel(marketStatus),
    market_session: marketSession.phase,
    scan_window: scanWindow.scanWindow,
    orchestration_decision: dayTradeScanOrchestration.decision,
    should_scan_now: dayTradeScanOrchestration.should_scan_now,
    live_trial_fast_mode: scheduledRuntimeConfig.live_trial_fast_mode,
    grow_max_learning_mode: scheduledRuntimeConfig.grow_max_learning_mode,
    grow_max_learning_mode_env_raw_present:
      scheduledRuntimeConfig.grow_max_learning_mode_env_raw_present,
    grow_max_learning_mode_env_raw_value_normalized:
      scheduledRuntimeConfig.grow_max_learning_mode_env_raw_value_normalized,
    grow_max_learning_mode_public_env_raw_present:
      scheduledRuntimeConfig.grow_max_learning_mode_public_env_raw_present,
    grow_max_learning_mode_public_env_raw_value_normalized:
      scheduledRuntimeConfig
        .grow_max_learning_mode_public_env_raw_value_normalized,
    grow_max_learning_mode_requested:
      scheduledRuntimeConfig.grow_max_learning_mode_requested,
    grow_max_learning_mode_blocked_reason:
      scheduledRuntimeConfig.grow_max_learning_mode_blocked_reason,
    grow_max_learning_mode_enabled_source:
      scheduledRuntimeConfig.grow_max_learning_mode_enabled_source,
    target_ideas_per_window: scheduledRuntimeConfig.target_ideas_per_window,
    scheduled_max_tickers: scheduledRuntimeConfig.scheduled_max_tickers,
    scheduled_skip_openai: scheduledRuntimeConfig.scheduled_skip_openai,
    scheduled_timeout_ms: scheduledRuntimeConfig.scheduled_timeout_ms,
    provider_plan_profile_mode:
      scheduledRuntimeConfig.provider_plan_profile_mode,
    provider_plan_profile_source:
      scheduledRuntimeConfig.provider_plan_profile_source,
    server_plan_mode: scheduledRuntimeConfig.server_plan_mode,
    public_plan_mode: scheduledRuntimeConfig.public_plan_mode,
    plan_mode_mismatch: scheduledRuntimeConfig.plan_mode_mismatch,
    effective_scan_ticker_cap:
      scheduledRuntimeConfig.effective_scan_ticker_cap,
    effective_scheduled_skip_openai:
      scheduledRuntimeConfig.effective_scheduled_skip_openai,
    effective_scheduled_timeout_ms:
      scheduledRuntimeConfig.effective_scheduled_timeout_ms,
    profile_scan_ticker_cap: scheduledRuntimeConfig.profile_scan_ticker_cap,
    profile_outcome_candle_request_cap:
      scheduledRuntimeConfig.profile_outcome_candle_requests_per_run,
    env_scan_ticker_override:
      scheduledRuntimeConfig.env_scan_ticker_override,
    profile_notes: scheduledRuntimeConfig.profile_notes,
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
        ...automationVersionFields(),
        forced: force,
        session_type: scanWindow.sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        scan_date: scanWindow.scanDate || marketStatus.date,
        status: "failed",
        decision: "failed" satisfies AutomationScanDecision,
        active_scan_trace: finishActiveScanTrace(activeScanTrace, {
          decision: "failed",
          status: "failed",
          skipReason: message,
          zeroReason: "archive_expired_recommendations_failed",
        }),
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
  const powerHourTrialGate = buildPowerHourTrialGate({
    scanWindow: scanWindow.scanWindow,
    marketSessionPhase: marketSession.phase,
    marketOpenForScan,
    orchestration: dayTradeScanOrchestration,
  });
  activeScanTrace.update({
    power_hour_trial_enabled: powerHourTrialGate.power_hour_trial_enabled,
    power_hour_publish_allowed: powerHourTrialGate.power_hour_publish_allowed,
    power_hour_publish_block_reason:
      powerHourTrialGate.power_hour_publish_block_reason,
  });
  const disabledGenerationBypassAllowed =
    scanWindow.scanWindow === "power_hour"
      ? powerHourTrialGate.power_hour_publish_allowed
      : calendarFallbackAllowsScan;

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
        ...powerHourTrialGate,
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
        active_scan_trace: activeScanTrace.trace,
      },
    });
    const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
      decision: "skipped_market_closed",
      status: "skipped",
      skipReason: message,
      zeroReason: "market_not_open_for_active_scan",
    });
    await recordAttempt({
      outcome: "skipped",
      allowed: false,
      message,
      skipReason: "market_not_open_for_active_scan",
      httpStatus: 200,
      scanLog,
      activeScanTrace: activeScanTracePayload,
    });

    return NextResponse.json({
      ok: true,
      message,
      status: "skipped",
      decision: "skipped_market_closed" satisfies AutomationScanDecision,
      ...automationVersionFields(),
      ...powerHourTrialGate,
      ...powerHourTrialCopyFields(),
      ...scheduledRuntimeFields(),
      skipped_in_progress: false,
      active_scan_trace: activeScanTracePayload,
      schema_check: schemaCheck,
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
    !disabledGenerationBypassAllowed
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
    const message = `${
      scanWindow.scanWindow === "power_hour" &&
      powerHourTrialGate.power_hour_publish_block_reason
        ? `${scanPolicy.message} Power Hour trial publish blocked: ${powerHourTrialGate.power_hour_publish_block_reason}.`
        : scanPolicy.message
    } ${discardReview.message}`;
    const scanLog = createAutomationScanLog({
      source: "scheduled",
      scanWindow: scanWindow.scanWindow,
      marketStatus,
      result,
      message,
      recommendationsCreated: 0,
      details: {
        ...powerHourTrialGate,
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
        active_scan_trace: activeScanTrace.trace,
      },
    });
    const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
      decision: "skipped_outside_window",
      status: "skipped",
      skipReason: message,
      zeroReason: "outside_generation_window",
    });
    await recordAttempt({
      outcome: "skipped",
      allowed: false,
      message,
      skipReason: "outside_generation_window",
      httpStatus: 200,
      scanLog,
      activeScanTrace: activeScanTracePayload,
    });

    return NextResponse.json({
      ok: true,
      message,
      status: "skipped",
      decision: "skipped_outside_window" satisfies AutomationScanDecision,
      ...automationVersionFields(),
      ...powerHourTrialGate,
      ...powerHourTrialCopyFields(),
      ...scheduledRuntimeFields(),
      skipped_in_progress: false,
      active_scan_trace: activeScanTracePayload,
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
  let startedScheduledRunId: string | number | null = null;

  try {
    if (!force && !shouldRunOfficialDayTradeScan(dayTradeScanOrchestration)) {
      const decision = scheduledSkipDecisionForOrchestration(
        dayTradeScanOrchestration,
      );
      const message = `${dayTradeScanOrchestration.scan_reason} Scheduled scan skipped because official window decision is ${dayTradeScanOrchestration.decision}.`;
      const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
        decision,
        status: "skipped",
        skipReason: message,
        zeroReason: "not_official_scan_window",
      });
      const scanLog = createAutomationScanLog({
        source: "scheduled",
        scanWindow: scanWindow.scanWindow,
        marketStatus,
        result:
          decision === "skipped_market_closed"
            ? "market_closed"
            : decision === "skipped_provider_unavailable"
              ? "provider_error"
              : "skipped",
        message,
        recommendationsCreated: 0,
        details: {
          ...powerHourTrialGate,
          no_publish_reason: "not_official_scan_window",
          day_trade_scan_orchestration: dayTradeScanOrchestration,
          recommendation_serving_cadence: initialServingCadence,
          active_scan_trace: activeScanTracePayload,
        },
      });

      let skippedRunId: string | number | null = null;
      try {
        skippedRunId = await recordScheduledScanRun({
          scanDate,
          sessionType,
          status: "skipped",
          recommendationsCreated: 0,
          message: `${message} scan_window=${scanWindow.scanWindow}`,
          scanLog,
          ignoreExistingRun: ignore_existing_run,
        });
      } catch (recordError) {
        console.error("[automation/run-scan] official_window_skip_record_error", {
          scanDate,
          sessionType,
          scanWindow: scanWindow.scanWindow,
          error: normalizeUnknownError(recordError),
        });
      }
      await recordAttempt({
        outcome: "skipped",
        allowed: false,
        message,
        skipReason: "not_official_scan_window",
        httpStatus: 200,
        scanLog,
        activeScanTrace: activeScanTracePayload,
        scheduledScanRunId: skippedRunId,
      });

      return NextResponse.json({
        ok: true,
        message,
        status: "skipped",
        decision,
        ...automationVersionFields(),
        ...powerHourTrialGate,
        ...powerHourTrialCopyFields(),
        ...scheduledRuntimeFields(),
        skipped_in_progress: false,
        active_scan_trace: activeScanTracePayload,
        automation_diagnostics: automationDiagnostics({
          decision,
          skippedReason: message,
          currentScanLog: scanLog,
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
    activeScanTrace.markStage("provider_env", providerEnv.ready ? "completed" : "failed");
    activeScanTrace.updateProviderEnv();

    if (!providerEnv.ready) {
      const message = `Scheduled scan skipped: provider environment missing ${providerEnv.missing.join(", ")}.`;
      const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
        decision: "skipped_provider_unavailable",
        status: "skipped",
        skipReason: message,
        zeroReason: "provider_environment_missing",
      });
      const scanLog = createAutomationScanLog({
        source: "scheduled",
        scanWindow: scanWindow.scanWindow,
        marketStatus,
        result: "provider_error",
        message,
        recommendationsCreated: 0,
        details: {
          ...powerHourTrialGate,
          day_trade_scan_orchestration: dayTradeScanOrchestration,
          recommendation_serving_cadence: initialServingCadence,
          active_scan_trace: activeScanTracePayload,
        },
      });

      let providerSkipRunId: string | number | null = null;
      try {
        providerSkipRunId = await recordScheduledScanRun({
          scanDate,
          sessionType,
          status: "failed",
          recommendationsCreated: 0,
          message: `${message} scan_window=${scanWindow.scanWindow}`,
          scanLog,
          ignoreExistingRun: ignore_existing_run,
        });
      } catch (recordError) {
        console.error("[automation/run-scan] provider_skip_record_error", {
          scanDate,
          sessionType,
          scanWindow: scanWindow.scanWindow,
          error: normalizeUnknownError(recordError),
        });
      }
      await recordAttempt({
        outcome: "failed",
        allowed: shouldRunOfficialDayTradeScan(dayTradeScanOrchestration),
        message,
        skipReason: "provider_environment_missing",
        httpStatus: 200,
        scanLog,
        activeScanTrace: activeScanTracePayload,
        scheduledScanRunId: providerSkipRunId,
      });

      return NextResponse.json(
        {
          ok: true,
          message,
          status: "skipped",
          decision: "skipped_provider_unavailable" satisfies AutomationScanDecision,
          ...automationVersionFields(),
          ...powerHourTrialGate,
          ...powerHourTrialCopyFields(),
          ...scheduledRuntimeFields(),
          skipped_in_progress: false,
          active_scan_trace: activeScanTracePayload,
          automation_diagnostics: automationDiagnostics({
            decision: "skipped_provider_unavailable",
            skippedReason: message,
            currentScanLog: scanLog,
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
    activeScanTrace.update({
      interpreted_ny_time: `${dayTradeScanOrchestration.trading_date} ${dayTradeScanOrchestration.ny_time} America/New_York`,
      scan_window: scanWindow.scanWindow,
      orchestration_decision: dayTradeScanOrchestration.decision,
      should_scan_now: dayTradeScanOrchestration.should_scan_now,
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
      const candidatesGenerated =
        latestSameWindowScan?.scanLog.real_scanner_candidate_generation?.universe
          .candidates_generated ??
        latestSameWindowScan?.scanLog.candidates_scanned ??
        0;
      const recommendationsCreated =
        latestSameWindowScan?.scanLog.recommendations_created ?? 0;
      const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
        decision: "skipped_recent_scan",
        status: "skipped",
        skipReason: message,
        candidatesGenerated,
        recommendationsServed: recommendationsCreated,
        recommendationsCreated,
        noPublishReason: "same_window_cooldown",
        zeroReason: "same_window_cooldown",
        elapsedMilliseconds: elapsedMs(routeStartedAtMs),
        timeoutWasReached: false,
      });
      const cooldownScanLog = createAutomationScanLog({
        source: "scheduled",
        scanWindow: scanWindow.scanWindow,
        marketStatus,
        result: "skipped",
        message,
        recommendationsCreated,
        details: {
          ...powerHourTrialGate,
          no_publish_reason: "same_window_cooldown",
          day_trade_scan_orchestration: dayTradeScanOrchestration,
          recommendation_serving_cadence:
            latestSameWindowScan?.scanLog.recommendation_serving_cadence ??
            initialServingCadence,
          active_scan_trace: activeScanTracePayload,
        },
      });
      await recordAttempt({
        outcome: "skipped",
        allowed: true,
        message,
        skipReason: "same_window_cooldown",
        httpStatus: 200,
        scanLog: cooldownScanLog,
        activeScanTrace: activeScanTracePayload,
      });

      return NextResponse.json({
        ok: true,
        message,
        status: "skipped",
        decision: "skipped_recent_scan" satisfies AutomationScanDecision,
        ...automationVersionFields(),
        ...powerHourTrialGate,
        ...powerHourTrialCopyFields(),
        ...scheduledRuntimeFields(),
        skipped_in_progress: false,
        active_scan_trace: activeScanTracePayload,
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
        candidates_generated: candidatesGenerated,
        recommendations_served: recommendationsCreated,
        recommendations_created: recommendationsCreated,
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

    const latestInProgressScan = latestInProgressScheduledScanForWindow({
      runs: recentScheduledScanRuns,
      scanDate,
      sessionType,
      scanWindow: scanWindow.scanWindow,
    });
    const inProgressAgeMinutes = minutesSince(
      latestInProgressScan?.row.created_at,
      now,
    );

    if (
      !force &&
      !ignore_existing_run &&
      inProgressAgeMinutes !== null &&
      inProgressAgeMinutes < SCHEDULED_IN_PROGRESS_COOLDOWN_MINUTES
    ) {
      const message = `Recent ${scanWindowLabel} scan is already in progress from ${inProgressAgeMinutes} minutes ago.`;
      activeScanTrace.update({ skipped_in_progress: true });
      const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
        decision: "skipped_in_progress",
        status: "skipped",
        skipReason: message,
        noPublishReason: "scheduled_scan_in_progress",
        zeroReason: "scheduled_scan_in_progress",
        elapsedMilliseconds: elapsedMs(routeStartedAtMs),
        timeoutWasReached: false,
      });
      const inProgressScanLog = createAutomationScanLog({
        source: "scheduled",
        scanWindow: scanWindow.scanWindow,
        marketStatus,
        result: "skipped",
        message,
        recommendationsCreated: 0,
        details: {
          ...powerHourTrialGate,
          no_publish_reason: "scheduled_scan_in_progress",
          day_trade_scan_orchestration: dayTradeScanOrchestration,
          recommendation_serving_cadence: initialServingCadence,
          active_scan_trace: activeScanTracePayload,
        },
      });
      await recordAttempt({
        outcome: "skipped",
        allowed: true,
        message,
        skipReason: "scheduled_scan_in_progress",
        httpStatus: 200,
        scanLog: inProgressScanLog,
        activeScanTrace: activeScanTracePayload,
      });

      return NextResponse.json({
        ok: true,
        message,
        status: "skipped",
        decision: "skipped_in_progress" satisfies AutomationScanDecision,
        ...automationVersionFields(),
        ...powerHourTrialGate,
        ...powerHourTrialCopyFields(),
        ...scheduledRuntimeFields(),
        skipped_in_progress: true,
        skipped_recent_scan_reason: "scheduled_scan_in_progress",
        active_scan_trace: activeScanTracePayload,
        automation_diagnostics: automationDiagnostics({
          decision: "skipped_in_progress",
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
        selected_tickers_count: activeScanTracePayload.universe.selected_tickers_count,
        ranked_count: activeScanTracePayload.ranking.ranked_count,
        recommendations_built_count:
          activeScanTracePayload.final.recommendations_built_count,
        deterministic_fallback_used:
          activeScanTracePayload.final.deterministic_fallback_used,
        no_publish_reason: activeScanTracePayload.final.no_publish_reason,
        batch_id: null,
        batch_fingerprint: null,
        scan_run_fingerprint: null,
        warnings: dayTradeScanOrchestration.warnings.map((item) => item.message),
        gaps: [],
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
      });
    }

    if (!force && !ignore_existing_run) {
      const startMessage = `Scheduled ${scanWindowLabel} scan started. scan_window=${scanWindow.scanWindow}`;
      const startScanLog = createAutomationScanLog({
        source: "scheduled",
        scanWindow: scanWindow.scanWindow,
        marketStatus,
        result: "skipped",
        message: startMessage,
        recommendationsCreated: 0,
        details: {
          ...powerHourTrialGate,
          no_publish_reason: "scheduled_scan_started",
          day_trade_scan_orchestration: dayTradeScanOrchestration,
          recommendation_serving_cadence: initialServingCadence,
          active_scan_trace: activeScanTrace.trace,
        },
      });

      try {
        startedScheduledRunId = await recordScheduledScanRun({
          scanDate,
          sessionType,
          status: "started",
          recommendationsCreated: 0,
          message: startMessage,
          scanLog: startScanLog,
          ignoreExistingRun: ignore_existing_run,
        });
      } catch (startRecordError) {
        console.error("[automation/run-scan] start_record_error", {
          scanDate,
          sessionType,
          scanWindow: scanWindow.scanWindow,
          error: normalizeUnknownError(startRecordError),
        });
      }
    }

    if (
      timeoutReached(routeStartedAtMs, scheduledRuntimeConfig.scheduled_timeout_ms)
    ) {
      const message =
        "Scheduled scan stopped before generation because the route timeout budget was already exhausted.";
      const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
        decision: "failed",
        status: "partial",
        skipReason: message,
        noPublishReason: "timeout_budget_exceeded",
        zeroReason: "timeout_budget_exceeded",
        elapsedMilliseconds: elapsedMs(routeStartedAtMs),
        timeoutWasReached: true,
      });
      const timeoutScanLog = createAutomationScanLog({
        source: "scheduled",
        scanWindow: scanWindow.scanWindow,
        marketStatus,
        result: "skipped",
        message,
        recommendationsCreated: 0,
        details: {
          ...powerHourTrialGate,
          no_publish_reason: "timeout_budget_exceeded",
          day_trade_scan_orchestration: dayTradeScanOrchestration,
          recommendation_serving_cadence: initialServingCadence,
          active_scan_trace: activeScanTracePayload,
        },
      });

      try {
        await updateScheduledScanRun({
          runId: startedScheduledRunId,
          status: "failed",
          recommendationsCreated: 0,
          message: `${message} scan_window=${scanWindow.scanWindow}`,
          scanLog: timeoutScanLog,
        });
      } catch (timeoutRecordError) {
        console.error("[automation/run-scan] pre_generation_timeout_record_error", {
          scanDate,
          sessionType,
          scanWindow: scanWindow.scanWindow,
          error: normalizeUnknownError(timeoutRecordError),
        });
      }
      await recordAttempt({
        outcome: "failed",
        allowed: true,
        message,
        skipReason: "timeout_budget_exceeded",
        httpStatus: 200,
        scanLog: timeoutScanLog,
        activeScanTrace: activeScanTracePayload,
        scheduledScanRunId: startedScheduledRunId,
      });

      return NextResponse.json({
        ok: true,
        message,
        status: "partial",
        decision: "failed" satisfies AutomationScanDecision,
        ...automationVersionFields(),
        ...powerHourTrialGate,
        ...powerHourTrialCopyFields(),
        ...scheduledRuntimeFields(),
        skipped_in_progress: false,
        active_scan_trace: activeScanTracePayload,
        forced: force,
        scan_date: scanDate,
        session_type: sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        selected_tickers_count: activeScanTracePayload.universe.selected_tickers_count,
        ranked_count: activeScanTracePayload.ranking.ranked_count,
        recommendations_built_count:
          activeScanTracePayload.final.recommendations_built_count,
        recommendations_created: 0,
        deterministic_fallback_used:
          activeScanTracePayload.final.deterministic_fallback_used,
        no_publish_reason: activeScanTracePayload.final.no_publish_reason,
      });
    }

    const generationPromise = generateRecommendations({
      sessionType,
      scanWindow: scanWindow.scanWindow,
      targetCount: scheduledRuntimeConfig.grow_max_learning_mode
        ? undefined
        : scheduledRuntimeConfig.live_trial_fast_mode
          ? 6
          : undefined,
      source: "scheduled",
      allowPowerHourRecommendationLogging:
        scanWindow.scanWindow === "power_hour"
          ? powerHourTrialGate.power_hour_publish_allowed
          : calendarFallbackAllowsScan,
      powerHourTrialPublishing: powerHourTrialGate.power_hour_publish_allowed,
      scheduledMaxTickers: scheduledRuntimeConfig.scheduled_max_tickers,
      growMaxLearningMode: scheduledRuntimeConfig.grow_max_learning_mode,
      skipOpenAi: scheduledRuntimeConfig.scheduled_skip_openai,
      activeScanTrace,
    });
    const generationResult = await Promise.race([
      generationPromise,
      new Promise<"scheduled_timeout">((resolve) => {
        setTimeout(
          () => resolve("scheduled_timeout"),
          Math.max(
            1,
            scheduledRuntimeConfig.scheduled_timeout_ms -
              elapsedMs(routeStartedAtMs),
          ),
        );
      }),
    ]);

    if (generationResult === "scheduled_timeout") {
      const message =
        "Scheduled scan stopped before Netlify timeout. Partial trace returned.";
      const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
        decision: "failed",
        status: "partial",
        skipReason: message,
        noPublishReason: "timeout_budget_exceeded",
        zeroReason: "timeout_budget_exceeded",
        elapsedMilliseconds: elapsedMs(routeStartedAtMs),
        timeoutWasReached: true,
      });
      const timeoutScanLog = createAutomationScanLog({
        source: "scheduled",
        scanWindow: scanWindow.scanWindow,
        marketStatus,
        result: "skipped",
        message,
        recommendationsCreated: 0,
        details: {
          ...powerHourTrialGate,
          no_publish_reason: "timeout_budget_exceeded",
          day_trade_scan_orchestration: dayTradeScanOrchestration,
          recommendation_serving_cadence: initialServingCadence,
          active_scan_trace: activeScanTracePayload,
        },
      });

      try {
        await updateScheduledScanRun({
          runId: startedScheduledRunId,
          status: "failed",
          recommendationsCreated: 0,
          message: `${message} scan_window=${scanWindow.scanWindow}`,
          scanLog: timeoutScanLog,
        });
      } catch (timeoutRecordError) {
        console.error("[automation/run-scan] timeout_record_error", {
          scanDate,
          sessionType,
          scanWindow: scanWindow.scanWindow,
          error: normalizeUnknownError(timeoutRecordError),
        });
      }
      await recordAttempt({
        outcome: "failed",
        allowed: true,
        message,
        skipReason: "timeout_budget_exceeded",
        httpStatus: 200,
        scanLog: timeoutScanLog,
        activeScanTrace: activeScanTracePayload,
        scheduledScanRunId: startedScheduledRunId,
      });

      return NextResponse.json({
        ok: true,
        message,
        status: "partial",
        decision: "failed" satisfies AutomationScanDecision,
        ...automationVersionFields(),
        ...powerHourTrialGate,
        ...powerHourTrialCopyFields(),
        ...scheduledRuntimeFields(),
        skipped_in_progress: false,
        active_scan_trace: activeScanTracePayload,
        automation_diagnostics: automationDiagnostics({
          decision: "failed",
          skippedReason: message,
          currentScanLog: timeoutScanLog,
        }),
        forced: force,
        scan_date: scanDate,
        session_type: sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        market_status: marketStatus,
        market_session: marketSession,
        ...calendarFields(dayTradeScanOrchestration),
        candidates_generated:
          activeScanTracePayload.final.candidates_generated,
        selected_tickers_count:
          activeScanTracePayload.universe.selected_tickers_count,
        ranked_count: activeScanTracePayload.ranking.ranked_count,
        recommendations_built_count:
          activeScanTracePayload.final.recommendations_built_count,
        recommendations_created: 0,
        deterministic_fallback_used:
          activeScanTracePayload.final.deterministic_fallback_used,
        no_publish_reason: activeScanTracePayload.final.no_publish_reason,
        batch_id: null,
        batch_fingerprint: null,
        scan_run_fingerprint: null,
      });
    }
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
        ...powerHourTrialGate,
        ...generationScanLog,
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: servingCadence,
        active_scan_trace: activeScanTrace.trace,
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
        activeScanTrace,
        providerPlanProfileMode:
          scheduledRuntimeConfig.provider_plan_profile_mode,
      });
      activeScanTrace.updatePersistence({
        scan_run_persisted:
          artifactResult.persistence.scan_run.status === "saved" ||
          artifactResult.persistence.scan_run.status === "updated" ||
          artifactResult.persistence.scan_run.status === "duplicate",
        batch_persisted: artifactResult.persistence.batch
          ? artifactResult.persistence.batch.status === "saved" ||
            artifactResult.persistence.batch.status === "updated" ||
            artifactResult.persistence.batch.status === "duplicate"
          : false,
        snapshots_persisted_count: artifactResult.persistence.snapshots.filter(
          (snapshot) =>
            snapshot.status === "saved" ||
            snapshot.status === "duplicate",
        ).length,
        persistence_error_type:
          persistenceErrorType(artifactResult.persistence.scan_run.error) ??
          persistenceErrorType(artifactResult.persistence.batch?.error) ??
          persistenceErrorType(
            artifactResult.persistence.snapshots.find((snapshot) => snapshot.error)
              ?.error,
          ) ??
          null,
      });
      activeScanTrace.markStage("persistence", "completed");
    } catch (artifactError) {
      console.error("[automation/run-scan] artifact_persistence_error", {
        source: "automation_run_scan",
        operation: "persist_scan_artifacts",
        scanDate,
        sessionType,
        scanWindow: scanWindow.scanWindow,
        error: normalizeUnknownError(artifactError),
      });
      activeScanTrace.markStage("persistence", "failed");
      activeScanTrace.updatePersistence({
        persistence_error_type: errorType(artifactError),
      });
    }

    const candidatesGenerated =
      generationScanLog?.real_scanner_candidate_generation?.universe
        .candidates_generated ??
      generationScanLog?.candidates_scanned ??
      0;
    const batchFingerprint =
      artifactResult?.persistence.batch?.batch.batch_fingerprint ?? null;
    const scanRunFingerprint = artifactResult?.scan_run.run_fingerprint ?? null;
    const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
      decision: "scanned",
      status: "completed",
      candidatesGenerated,
      recommendationsServed: recommendationsCreated,
      recommendationsCreated,
      rankedCandidatesCount: generationScanLog?.ranked_candidates_count ?? 0,
      recommendationsPublishedCount:
        generationScanLog?.recommendations_published_count ??
        recommendationsCreated,
      recommendationBuildPath:
        generationScanLog?.recommendation_build_path ??
        (recommendationsCreated > 0 ? "openai" : "no_publish"),
      recommendationsBuiltCount:
        generationScanLog?.recommendations_built_count ?? recommendationsCreated,
      strongCount: generationScanLog?.strong_count ?? 0,
      validCount: generationScanLog?.valid_count ?? 0,
      experimentalCount: generationScanLog?.experimental_count ?? 0,
      rankedCandidatesNotPublishedReason:
        generationScanLog?.ranked_candidates_not_published_reason ?? null,
      noPublishReason: generationScanLog?.no_publish_reason ?? null,
      strongThreshold: generationScanLog?.strong_threshold ?? null,
      publishableThreshold: generationScanLog?.publishable_threshold ?? null,
      deterministicFallbackUsed:
        generationScanLog?.deterministic_fallback_used === true,
      batchFingerprint,
      scanRunFingerprint,
      selectedCandidateBuildDiagnostics:
        generationScanLog?.selected_candidate_build_diagnostics ?? [],
      selectedToBuiltDropOff:
        generationScanLog?.selected_to_built_drop_off ?? null,
      elapsedMilliseconds: elapsedMs(routeStartedAtMs),
      timeoutWasReached: timeoutReached(
        routeStartedAtMs,
        scheduledRuntimeConfig.scheduled_timeout_ms,
      ),
    });
    scanLog.active_scan_trace = activeScanTracePayload;

    if (startedScheduledRunId !== null) {
      await updateScheduledScanRun({
        runId: startedScheduledRunId,
        status: "completed",
        recommendationsCreated,
        message,
        scanLog,
      });
    } else {
      await recordScheduledScanRun({
        scanDate,
        sessionType,
        status: "completed",
        recommendationsCreated,
        message,
        scanLog,
        ignoreExistingRun: ignore_existing_run,
      });
    }
    await recordAttempt({
      outcome: "scanned",
      allowed: true,
      message,
      httpStatus: 200,
      scanLog,
      activeScanTrace: activeScanTracePayload,
      scheduledScanRunId: startedScheduledRunId,
    });

    return NextResponse.json({
      ok: true,
      message,
      status: "completed",
      decision: "scanned" satisfies AutomationScanDecision,
      ...automationVersionFields(),
      ...powerHourTrialGate,
      ...powerHourTrialCopyFields(),
      ...scheduledRuntimeFields(),
      skipped_in_progress: false,
      active_scan_trace: activeScanTracePayload,
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
      candidates_generated: candidatesGenerated,
      recommendations_served: recommendationsCreated,
      recommendations_created: recommendationsCreated,
      selected_count: activeScanTracePayload.ranking.selected_count,
      selected_tickers_count:
        activeScanTracePayload.universe.selected_tickers_count,
      ranked_candidates_count: generationScanLog?.ranked_candidates_count ?? null,
      recommendations_published_count:
        generationScanLog?.recommendations_published_count ?? recommendationsCreated,
      recommendation_build_path:
        generationScanLog?.recommendation_build_path ??
        activeScanTracePayload.final.recommendation_build_path,
      recommendations_built_count:
        generationScanLog?.recommendations_built_count ??
        activeScanTracePayload.final.recommendations_built_count,
      strong_count: generationScanLog?.strong_count ?? null,
      valid_count: generationScanLog?.valid_count ?? null,
      experimental_count: generationScanLog?.experimental_count ?? null,
      ranked_candidates_not_published_reason:
        generationScanLog?.ranked_candidates_not_published_reason ?? null,
      no_publish_reason: activeScanTracePayload.final.no_publish_reason,
      publish_policy_version: activeScanTracePayload.final.publish_policy_version,
      strong_threshold: generationScanLog?.strong_threshold ?? null,
      publishable_threshold: generationScanLog?.publishable_threshold ?? null,
      deterministic_fallback_used:
        generationScanLog?.deterministic_fallback_used ?? false,
      snapshots_persisted_count:
        artifactResult?.persistence.snapshots.filter(
          (snapshot) =>
            snapshot.status === "saved" ||
            snapshot.status === "duplicate",
        ).length ?? 0,
      shadow_entry_trial_attached_count:
        artifactResult?.shadow_snapshot_summary
          .shadow_snapshot_metadata_present_count ?? 0,
      shadow_entry_trial_variant:
        activeScanTracePayload.persistence.shadow_entry_trial_variant,
      shadow_entry_trial_not_live_signal_count:
        artifactResult?.shadow_snapshot_summary
          .shadow_snapshot_not_live_signal_count ?? 0,
      batch_id: servingCadence.latest_official_batch_id,
      batch_fingerprint: batchFingerprint,
      scan_run_fingerprint: scanRunFingerprint,
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
        ...powerHourTrialGate,
        day_trade_scan_orchestration: dayTradeScanOrchestration,
        recommendation_serving_cadence: initialServingCadence,
        active_scan_trace: activeScanTrace.trace,
      },
    });
    const failureDecision =
      failureResult === "provider_error" ||
      failureResult === "provider_rate_limited"
        ? ("skipped_provider_unavailable" satisfies AutomationScanDecision)
        : ("failed" satisfies AutomationScanDecision);
    const activeScanTracePayload = finishActiveScanTrace(activeScanTrace, {
      decision: failureDecision,
      status: "failed",
      skipReason: message,
      zeroReason: `${failureResult}:${errorType(error)}`,
      elapsedMilliseconds: elapsedMs(routeStartedAtMs),
      timeoutWasReached: timeoutReached(
        routeStartedAtMs,
        scheduledRuntimeConfig.scheduled_timeout_ms,
      ),
    });
    scanLog.active_scan_trace = activeScanTracePayload;

    try {
      if (startedScheduledRunId !== null) {
        await updateScheduledScanRun({
          runId: startedScheduledRunId,
          status: "failed",
          recommendationsCreated: 0,
          message: `${message} scan_window=${scanWindow.scanWindow}`,
          scanLog,
        });
      } else {
        await recordScheduledScanRun({
          scanDate,
          sessionType,
          status: "failed",
          recommendationsCreated: 0,
          message: `${message} scan_window=${scanWindow.scanWindow}`,
          scanLog,
          ignoreExistingRun: ignore_existing_run,
        });
      }
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
    await recordAttempt({
      outcome: failureDecision === "failed" ? "failed" : "skipped",
      allowed: shouldRunOfficialDayTradeScan(dayTradeScanOrchestration),
      message,
      skipReason:
        failureResult === "provider_error" ||
        failureResult === "provider_rate_limited"
          ? failureResult
          : errorType(error),
      httpStatus: status,
      scanLog,
      activeScanTrace: activeScanTracePayload,
      scheduledScanRunId: startedScheduledRunId,
    });

    return NextResponse.json(
      {
        ok: false,
        error: message,
        ...automationVersionFields(),
        ...powerHourTrialGate,
        ...powerHourTrialCopyFields(),
        ...scheduledRuntimeFields(),
        skipped_in_progress: false,
        forced: force,
        scan_date: scanDate,
        session_type: sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        market_status: marketStatus,
        market_session: marketSession,
        ...calendarFields(dayTradeScanOrchestration),
        status: "failed",
        decision: failureDecision,
        active_scan_trace: activeScanTracePayload,
        automation_diagnostics: automationDiagnostics({
          decision: failureDecision,
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
