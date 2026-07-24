import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import {
  generateRecommendations,
  type RecommendationScanLogDetails,
  type SessionType,
} from "@/lib/recommendation-generator";
import {
  buildRealScannerBaseCandidateSelection,
} from "@/lib/real-scanner-candidate-generation";
import { scanMarket } from "@/lib/scanner";
import { discoverDynamicMoversDiagnostics } from "@/lib/dynamic-movers-discovery";
import { buildScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import {
  createScanLog,
  type ScanLogEntry,
  type ScanLogResult,
} from "@/lib/scan-log-core";
import { getUsMarketStatus } from "@/lib/market-calendar";
import {
  getIntradayScanPolicy,
  getIntradayScanWindow,
  getLegacySessionTypeForScanWindow,
  getNewYorkDateString,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import {
  buildDayTradeScanOrchestrationSummary,
  type DayTradeScanWindow,
} from "@/lib/day-trade-scan-orchestration";
import { buildMarketSessionEvaluation } from "@/lib/market-session";
import { buildRecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import {
  buildRecommendationScanRun,
  persistRecommendationScanRun,
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
import {
  createActiveScanTrace,
  providerEnvSnapshot,
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
import { normalizeUnknownError } from "@/lib/error-logging";
import { checkRecommendationLearningSchema } from "@/lib/recommendation-learning-schema";
import { buildProviderPlanProfile } from "@/lib/provider-plan-profile";
import { evaluateGrowMaxLearningMode } from "@/lib/grow-max-learning-mode";

type DiagnosticMode =
  | "env_check"
  | "dry_run"
  | "diagnostic_persist"
  | "live_window_simulation"
  | "latest_market_data"
  | "scheduled_publish_dry_run";

type DiagnosticRunRequestBody = {
  mode?: unknown;
  diagnostic_mode?: unknown;
  simulated_window?: unknown;
  simulated_ny_time?: unknown;
  latest_market_data?: unknown;
  use_latest_market_data?: unknown;
  max_tickers?: unknown;
  skip_openai?: unknown;
  ranking_only?: unknown;
  market_data_only?: unknown;
  universe_only?: unknown;
  env_check_only?: unknown;
  timeout_ms?: unknown;
};

type DiagnosticRecommendationRow = {
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
  timeframe?: string | null;
  thesis?: string | null;
  invalidation?: string | null;
  reason_to_avoid?: string | null;
  status?: string | null;
  scan_window?: string | null;
  created_at?: string | null;
};

type DiagnosticStep =
  | "env_check"
  | "universe_only"
  | "market_data_only"
  | "ranking_only"
  | "no_openai_dry_run"
  | "scheduled_publish_dry_run"
  | "full_dry_run"
  | "diagnostic_persist";

const DEFAULT_DIAGNOSTIC_MAX_TICKERS = 5;
const HARD_MAX_DIAGNOSTIC_TICKERS = 25;
const DEFAULT_DIAGNOSTIC_TIMEOUT_MS = 20_000;
const MIN_DIAGNOSTIC_TIMEOUT_MS = 1_000;
const MAX_DIAGNOSTIC_TIMEOUT_MS = 60_000;

function versionFields() {
  return {
    automation_route_version: AUTOMATION_ROUTE_VERSION,
    recommendation_publish_policy_version: RECOMMENDATION_PUBLISH_POLICY_VERSION,
    build_marker: BUILD_MARKER,
  };
}

function secretPrefixHash(value: string | null | undefined) {
  if (!value) return null;

  return createHash("sha256")
    .update(`diagnostic-run-scan-auth:${value.slice(0, 8)}:${value.length}`)
    .digest("hex")
    .slice(0, 12);
}

function safeUnauthorizedAuthDiagnostics({
  request,
  expectedSecret,
  providedSecret,
}: {
  request: Request;
  expectedSecret: string | undefined;
  providedSecret: string | null;
}) {
  return {
    expectedSecretConfigured: Boolean(expectedSecret),
    providedSecretConfigured: Boolean(providedSecret),
    expectedSecretLength: expectedSecret ? expectedSecret.length : null,
    providedSecretLength: providedSecret ? providedSecret.length : null,
    expectedSecretPrefixHash: secretPrefixHash(expectedSecret),
    providedSecretPrefixHash: secretPrefixHash(providedSecret),
    headerNamesReceived: Array.from(request.headers.keys()).sort(),
    nodeEnv: process.env.NODE_ENV ?? null,
    ...versionFields(),
  };
}

function textOrNull(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function parseBody(request: Request): Promise<DiagnosticRunRequestBody> {
  try {
    const text = await request.text();
    if (!text.trim()) return {};

    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as DiagnosticRunRequestBody)
      : {};
  } catch {
    return {};
  }
}

function parseMode(value: unknown): DiagnosticMode {
  if (
    value === "env_check" ||
    value === "dry_run" ||
    value === "diagnostic_persist" ||
    value === "live_window_simulation" ||
    value === "latest_market_data" ||
    value === "scheduled_publish_dry_run"
  ) {
    return value;
  }

  return "dry_run";
}

function finiteInteger(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function parseMaxTickers(value: unknown) {
  const parsed = finiteInteger(value);

  if (parsed === null) return DEFAULT_DIAGNOSTIC_MAX_TICKERS;

  return Math.min(
    HARD_MAX_DIAGNOSTIC_TICKERS,
    Math.max(1, parsed),
  );
}

function parseTimeoutMs(value: unknown) {
  const parsed = finiteInteger(value);

  if (parsed === null) return DEFAULT_DIAGNOSTIC_TIMEOUT_MS;

  return Math.min(
    MAX_DIAGNOSTIC_TIMEOUT_MS,
    Math.max(MIN_DIAGNOSTIC_TIMEOUT_MS, parsed),
  );
}

function providerUpgradeChecklistStatus({
  mode,
  source,
  serverPlanMode,
  publicPlanMode,
  planModeMismatch,
}: {
  mode: string;
  source: string;
  serverPlanMode: string;
  publicPlanMode: string;
  planModeMismatch: boolean;
}) {
  if (planModeMismatch) return "env_mismatch_needs_fix";
  if (mode === "grow") return "grow_active";
  if (mode === "pro") return "pro_active";
  if (mode === "custom") return "custom_active_needs_review";
  if (source === "fallback_free_safe") return "unknown_plan_free_safe";
  if (mode === "free" && serverPlanMode === "free" && publicPlanMode === "free") {
    return "grow_ready_pending_env_change";
  }

  return "free_safe_ready";
}

function providerPlanDiagnostics() {
  const profile = buildProviderPlanProfile();
  const growMaxLearningMode = evaluateGrowMaxLearningMode({
    providerPlanProfileMode: profile.effective_mode,
  });
  const scheduledScanTickerOverride = finiteInteger(
    process.env.TURE_SCHEDULED_SCAN_MAX_TICKERS,
  );
  const effectiveScanTickerCap = Math.max(
    1,
    Math.min(50, scheduledScanTickerOverride ?? profile.profile_scan_ticker_cap),
  );
  const upgradeStatus = providerUpgradeChecklistStatus({
    mode: profile.effective_mode,
    source: profile.source,
    serverPlanMode: profile.server_plan_mode,
    publicPlanMode: profile.public_plan_mode,
    planModeMismatch: profile.plan_mode_mismatch,
  });

  return {
    provider_plan_profile_mode: profile.effective_mode,
    provider_plan_profile_source: profile.source,
    server_plan_mode: profile.server_plan_mode,
    public_plan_mode: profile.public_plan_mode,
    plan_mode_mismatch: profile.plan_mode_mismatch,
    effective_scan_ticker_cap: effectiveScanTickerCap,
    effective_outcome_candle_request_cap:
      profile.profile_outcome_candle_requests_per_run,
    effective_scheduled_skip_openai: profile.profile_scheduled_skip_openai,
    effective_scheduled_timeout_ms: profile.profile_scheduled_timeout_ms,
    profile_scan_ticker_cap: profile.profile_scan_ticker_cap,
    profile_outcome_candle_request_cap:
      profile.profile_outcome_candle_requests_per_run,
    env_scan_ticker_override: scheduledScanTickerOverride,
    provider_profile_scan_ticker_override: profile.overrides.scan_ticker_cap,
    ...growMaxLearningMode,
    target_ideas_per_window: growMaxLearningMode.grow_max_learning_mode
      ? effectiveScanTickerCap
      : null,
    profile_notes: profile.profile_notes,
    profile_warnings: profile.profile_warnings,
    provider_upgrade_checklist_status: upgradeStatus,
    provider_plan_profile: profile,
  };
}

function resolveDiagnosticStep({
  body,
  mode,
}: {
  body: DiagnosticRunRequestBody;
  mode: DiagnosticMode;
}): DiagnosticStep {
  if (mode === "env_check") return "env_check";
  if (body.env_check_only === true) return "env_check";
  if (body.universe_only === true) return "universe_only";
  if (body.market_data_only === true) return "market_data_only";
  if (body.ranking_only === true) return "ranking_only";
  if (mode === "scheduled_publish_dry_run") return "scheduled_publish_dry_run";
  if (body.skip_openai === true) return "no_openai_dry_run";
  if (mode === "diagnostic_persist") return "diagnostic_persist";
  return "full_dry_run";
}

function elapsedSince(startedAtMs: number) {
  return Date.now() - startedAtMs;
}

function timeoutReached(startedAtMs: number, timeoutMs: number) {
  return elapsedSince(startedAtMs) >= timeoutMs;
}

function parseSimulatedWindow(value: unknown): IntradayScanWindow | null {
  if (value === "morning") return "morning_momentum";
  if (value === "midday") return "midday";
  if (value === "power_hour") return "power_hour";
  if (
    value === "opening" ||
    value === "morning_momentum" ||
    value === "afternoon"
  ) {
    return value;
  }

  return null;
}

function dayWindowFromIntraday(window: IntradayScanWindow): DayTradeScanWindow {
  if (window === "opening" || window === "morning_momentum") return "morning";
  if (window === "midday" || window === "afternoon") return "midday";
  if (window === "power_hour") return "power_hour";
  if (window === "closed") return "closed";
  return "outside_window";
}

function diagnosticDefaultWindow(now: Date) {
  const current = getIntradayScanWindow(now);
  const policy = getIntradayScanPolicy(current);
  return policy.allowGeneration ? current : "midday";
}

function recommendationTicker(row: DiagnosticRecommendationRow) {
  return textOrNull(row.ticker)?.toUpperCase() ?? null;
}

function recommendationCreatedAt(row: DiagnosticRecommendationRow) {
  return textOrNull(row.created_at) ?? new Date().toISOString();
}

function scanLogResult(value: string | null | undefined): ScanLogResult {
  if (
    value === "recommendation_created" ||
    value === "no_high_quality_setup" ||
    value === "openai_no_trade" ||
    value === "market_closed" ||
    value === "pre_market" ||
    value === "pre_market_watchlist_updated" ||
    value === "pre_market_no_candidates" ||
    value === "pre_market_skipped_holiday" ||
    value === "power_hour_blocked" ||
    value === "recommendation_limit_reached" ||
    value === "duplicate_ticker_skipped" ||
    value === "active_position_exists" ||
    value === "provider_rate_limited" ||
    value === "provider_error" ||
    value === "openai_error" ||
    value === "diagnostic_recommendations_built" ||
    value === "skipped"
  ) {
    return value;
  }

  return "unknown";
}

function diagnosticResponse({
  ok = true,
  status = "completed",
  mode,
  step,
  maxTickers,
  skippedOpenAi,
  partialResult = false,
  timeoutReached: didTimeout = false,
  startedAtMs,
  activeScanTrace,
  extra = {},
}: {
  ok?: boolean;
  status?: string;
  mode: DiagnosticMode;
  step: DiagnosticStep;
  maxTickers: number;
  skippedOpenAi: boolean;
  partialResult?: boolean;
  timeoutReached?: boolean;
  startedAtMs: number;
  activeScanTrace: ActiveScanTraceRecorder;
  extra?: Record<string, unknown>;
}) {
  const elapsedMs = elapsedSince(startedAtMs);

  activeScanTrace.update({
    diagnostic_step: step,
    max_tickers: maxTickers,
    skipped_openai: skippedOpenAi,
    partial_result: partialResult,
    timeout_reached: didTimeout,
    elapsed_ms: elapsedMs,
  });

  return NextResponse.json({
    ok,
    status,
    ...versionFields(),
    diagnostic_mode: true,
    diagnostic_step: step,
    mode,
    max_tickers: maxTickers,
    skipped_openai: skippedOpenAi,
    partial_result: partialResult,
    timeout_reached: didTimeout,
    elapsed_ms: elapsedMs,
    last_stage_reached: activeScanTrace.trace.last_stage_reached,
    no_publish_reason: activeScanTrace.trace.final.no_publish_reason,
    schema_check: activeScanTrace.trace.schema_check,
    active_scan_trace: activeScanTrace.trace,
    ...extra,
  });
}

function baseCandidateSelection({
  scanWindow,
  maxTickers,
}: {
  scanWindow: IntradayScanWindow;
  maxTickers: number;
}) {
  const selection = buildRealScannerBaseCandidateSelection({
    scanWindow,
    requestedScanBudget: maxTickers,
  });
  return {
    ...selection,
    candidates: selection.candidates.slice(0, maxTickers),
  };
}

function updateUniverseTrace(
  activeScanTrace: ActiveScanTraceRecorder,
  selection: ReturnType<typeof baseCandidateSelection>,
) {
  activeScanTrace.markStage("universe", "completed");
  activeScanTrace.updateUniverse({
    total_enabled:
      selection.coverage?.enabled_tickers ?? selection.candidates.length,
    selected_tickers_count:
      selection.coverage?.selected_tickers ?? selection.candidates.length,
    selected_tickers_sample: selection.candidates
      .map((candidate) => candidate.ticker)
      .slice(0, 12),
    scan_budget:
      typeof selection.coverage?.scan_budget.selected_tickers === "number"
        ? selection.coverage.scan_budget.selected_tickers
        : null,
  });
}

function structurallyValidCandidateCount(
  candidates: Array<{
    proposed_entry_low?: number;
    proposed_entry_high?: number;
    proposed_stop_loss?: number;
    proposed_target_1?: number;
  }>,
) {
  return candidates.filter(
    (candidate) =>
      typeof candidate.proposed_entry_low === "number" &&
      typeof candidate.proposed_entry_high === "number" &&
      typeof candidate.proposed_stop_loss === "number" &&
      typeof candidate.proposed_target_1 === "number",
  ).length;
}

function createDiagnosticScanLog({
  scanWindow,
  marketStatus,
  generationScanLog,
  recommendationsBuilt,
  mode,
  simulatedWindow,
  simulatedNyTime,
  activeScanTrace,
}: {
  scanWindow: IntradayScanWindow;
  marketStatus: Awaited<ReturnType<typeof getUsMarketStatus>>;
  generationScanLog: RecommendationScanLogDetails | null;
  recommendationsBuilt: number;
  mode: DiagnosticMode;
  simulatedWindow: string | null;
  simulatedNyTime: string | null;
  activeScanTrace: ActiveScanTrace;
}) {
  return createScanLog({
    source: "diagnostic",
    scan_window: scanWindow,
    market_status: marketStatus.isOpenDay ? "diagnostic_latest_market_data" : "diagnostic_closed_market_data",
    ...versionFields(),
    result:
      recommendationsBuilt > 0
        ? "diagnostic_recommendations_built"
        : scanLogResult(generationScanLog?.result),
    message:
      recommendationsBuilt > 0
        ? `Diagnostic scan built ${recommendationsBuilt} recommendations without publishing live rows.`
        : "Diagnostic scan completed without built recommendations.",
    recommendations_created: 0,
    top_candidate_ticker: generationScanLog?.top_candidate_ticker ?? null,
    top_candidate_score: generationScanLog?.top_candidate_score ?? null,
    top_candidate_breakdown: generationScanLog?.top_candidate_breakdown ?? null,
    top_candidate_reasons: generationScanLog?.top_candidate_reasons ?? null,
    top_candidate_warnings: generationScanLog?.top_candidate_warnings ?? null,
    top_candidate_indicators: generationScanLog?.top_candidate_indicators ?? null,
    indicator_source: generationScanLog?.indicator_source ?? null,
    indicator_cached_at: generationScanLog?.indicator_cached_at ?? null,
    indicator_stale: generationScanLog?.indicator_stale ?? null,
    threshold: generationScanLog?.threshold ?? null,
    candidates_scanned: generationScanLog?.candidates_scanned ?? null,
    skipped_tickers: generationScanLog?.skipped_tickers ?? null,
    real_scanner_candidate_generation:
      generationScanLog?.real_scanner_candidate_generation ?? null,
    dynamic_movers_discovery:
      generationScanLog?.dynamic_movers_discovery ?? null,
    scanner_candidate_ranking: generationScanLog?.scanner_candidate_ranking ?? null,
    openai_recommendation_reality_guard:
      generationScanLog?.openai_recommendation_reality_guard ?? null,
    ranked_candidates_count: generationScanLog?.ranked_candidates_count ?? null,
    recommendations_published_count: 0,
    recommendation_build_path:
      generationScanLog?.recommendation_build_path ?? null,
    recommendations_built_count:
      generationScanLog?.recommendations_built_count ?? recommendationsBuilt,
    strong_count: generationScanLog?.strong_count ?? null,
    valid_count: generationScanLog?.valid_count ?? null,
    experimental_count: generationScanLog?.experimental_count ?? null,
    ranked_candidates_not_published_reason:
      generationScanLog?.ranked_candidates_not_published_reason ?? null,
    strong_threshold: generationScanLog?.strong_threshold ?? null,
    publishable_threshold: generationScanLog?.publishable_threshold ?? null,
    deterministic_fallback_used:
      generationScanLog?.deterministic_fallback_used ?? null,
    no_publish_reason: generationScanLog?.no_publish_reason ?? null,
    diagnostic_mode: true,
    diagnostic_run_mode: mode,
    simulated_window: simulatedWindow,
    simulated_ny_time: simulatedNyTime,
    active_scan_trace: activeScanTrace,
  } satisfies Omit<ScanLogEntry, "created_at">);
}

function finalizeTrace({
  activeScanTrace,
  scanLog,
  recommendationsBuilt,
  status,
  batchFingerprint,
  scanRunFingerprint,
}: {
  activeScanTrace: ActiveScanTraceRecorder;
  scanLog: ScanLogEntry;
  recommendationsBuilt: number;
  status: string;
  batchFingerprint?: string | null;
  scanRunFingerprint?: string | null;
}) {
  const rankedCount = scanLog.ranked_candidates_count ?? 0;
  const noPublishReason =
    recommendationsBuilt > 0 ? null : scanLog.no_publish_reason ?? null;

  activeScanTrace.updateFinal({
    decision: "diagnostic_scan",
    status,
    candidates_generated:
      scanLog.real_scanner_candidate_generation?.universe.candidates_generated ??
      scanLog.candidates_scanned ??
      0,
    recommendations_served: 0,
    recommendations_created: recommendationsBuilt,
    ranked_candidates_count: rankedCount,
    recommendations_published_count: 0,
    recommendation_build_path:
      scanLog.recommendation_build_path ??
      (recommendationsBuilt > 0 ? "deterministic_fallback" : "no_publish"),
    recommendations_built_count:
      scanLog.recommendations_built_count ?? recommendationsBuilt,
    strong_count: scanLog.strong_count ?? 0,
    valid_count: scanLog.valid_count ?? 0,
    experimental_count: scanLog.experimental_count ?? 0,
    ranked_candidates_not_published_reason:
      scanLog.ranked_candidates_not_published_reason ?? null,
    no_publish_reason: noPublishReason,
    strong_threshold: scanLog.strong_threshold ?? null,
    publishable_threshold: scanLog.publishable_threshold ?? null,
    deterministic_fallback_used: scanLog.deterministic_fallback_used === true,
    fallback_used: scanLog.deterministic_fallback_used === true,
    publish_policy_version: RECOMMENDATION_PUBLISH_POLICY_VERSION,
    batch_fingerprint: batchFingerprint ?? null,
    scan_run_fingerprint: scanRunFingerprint ?? null,
    zero_candidate_reason:
      recommendationsBuilt > 0
        ? null
        : noPublishReason ?? zeroCandidateReason(activeScanTrace.trace),
  });
  activeScanTrace.markStage("final", "completed");
  return activeScanTrace.trace;
}

function buildDiagnosticSnapshot({
  recommendation,
  scanRun,
  scanWindow,
  marketSession,
  mode,
  activeScanTrace,
}: {
  recommendation: DiagnosticRecommendationRow;
  scanRun: RecommendationScanRun;
  scanWindow: IntradayScanWindow;
  marketSession: ReturnType<typeof buildMarketSessionEvaluation>;
  mode: DiagnosticMode;
  activeScanTrace: ActiveScanTrace;
}) {
  const entryLow = numberOrNull(recommendation.entry_low);
  const entryHigh = numberOrNull(recommendation.entry_high);
  const entry =
    entryLow !== null && entryHigh !== null
      ? (entryLow + entryHigh) / 2
      : entryHigh ?? entryLow;
  const side = textOrNull(recommendation.direction) ?? "long";
  const stop = numberOrNull(recommendation.stop_loss);
  const target = numberOrNull(recommendation.target_1);

  return buildRecommendationSnapshot({
    recommendation_id: textOrNull(recommendation.id),
    scan_run_id: scanRun.run_fingerprint,
    ticker: recommendationTicker(recommendation),
    company_name: textOrNull(recommendation.company_name),
    recommended_at: recommendationCreatedAt(recommendation),
    app_timestamp: new Date().toISOString(),
    window: scanWindow,
    market_session_phase: marketSession.phase,
    market_session_risk: marketSession.risk_level,
    market_session_source: marketSession.source,
    source_mode: "diagnostic",
    data_mode: "diagnostic_latest_market_data",
    is_visible: false,
    is_demo: false,
    is_mock: false,
    is_real: false,
    entry,
    entry_low: entryLow,
    entry_high: entryHigh,
    stop,
    target,
    side,
    planned_risk_reward: numberOrNull(recommendation.risk_reward),
    confidence: recommendation.confidence ?? null,
    label: "Diagnostic",
    type: textOrNull(recommendation.setup_type),
    rationale: textOrNull(recommendation.thesis),
    reason: textOrNull(recommendation.reason_to_avoid),
    primary_risk: textOrNull(recommendation.invalidation),
    payload: {
      diagnostic_mode: true,
      diagnostic_run_mode: mode,
      not_live_trade_signal: true,
      visible_in_primary_recommendations: false,
      source_mode: "diagnostic",
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
      active_scan_trace: activeScanTrace,
    },
  });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    const authDiagnostics = safeUnauthorizedAuthDiagnostics({
      request,
      expectedSecret,
      providedSecret,
    });

    console.warn("[diagnostics/run-scan] unauthorized", authDiagnostics);

    return NextResponse.json(
      {
        error: "Unauthorized.",
        ...authDiagnostics,
      },
      { status: 401 },
    );
  }

  console.log("[diagnostics/run-scan] authorized request accepted", {
    route: "/api/diagnostics/run-scan",
    nodeEnv: process.env.NODE_ENV ?? null,
    ...versionFields(),
  });

  const routeReceivedAt = new Date().toISOString();
  const startedAtMs = Date.now();
  const body = await parseBody(request);
  const mode = parseMode(body.mode);
  const diagnosticStep = resolveDiagnosticStep({ body, mode });
  const maxTickers = parseMaxTickers(body.max_tickers);
  const timeoutMs = parseTimeoutMs(body.timeout_ms);
  const skippedOpenAi =
    body.skip_openai === true ||
    diagnosticStep === "ranking_only" ||
    diagnosticStep === "no_openai_dry_run" ||
    diagnosticStep === "scheduled_publish_dry_run" ||
    diagnosticStep === "market_data_only" ||
    diagnosticStep === "universe_only" ||
    diagnosticStep === "env_check";
  const simulatedNyTime = textOrNull(body.simulated_ny_time);
  const now = new Date();
  const requestedWindow = parseSimulatedWindow(body.simulated_window);
  const modeWindow =
    mode === "live_window_simulation" && requestedWindow === null
      ? "midday"
      : requestedWindow;
  const scanWindow = modeWindow ?? diagnosticDefaultWindow(now);
  const simulatedWindow =
    modeWindow ?? (scanWindow !== getIntradayScanWindow(now) ? scanWindow : null);
  const sessionType: SessionType = getLegacySessionTypeForScanWindow(scanWindow);
  const scanDate = getNewYorkDateString(now);
  const diagnosticRunId = `diagnostic_scan_${routeReceivedAt.replace(/[^0-9]/g, "")}`;
  const providerProfileDiagnostics = providerPlanDiagnostics();
  const activeScanTrace = createActiveScanTrace({
    routeReceivedAt,
    scheduledFunctionFiredAtUtc: null,
    scanWindow,
  });
  activeScanTrace.updateProviderEnv();
  const schemaSupabase = getServerSupabaseClient();
  const schemaCheck = await checkRecommendationLearningSchema({
    supabaseClient: schemaSupabase.client,
    unavailableReason: schemaSupabase.unavailable_reason,
  });
  activeScanTrace.updateSchemaCheck(schemaCheck);
  activeScanTrace.update({
    diagnostic_mode: true,
    diagnostic_run_mode: mode,
    diagnostic_step: diagnosticStep,
    simulated_window: simulatedWindow,
    simulated_ny_time: simulatedNyTime,
    max_tickers: maxTickers,
    skipped_openai: skippedOpenAi,
    interpreted_ny_time: simulatedNyTime
      ? `${scanDate} ${simulatedNyTime} America/New_York simulated`
      : `${scanDate} latest America/New_York`,
    scan_window: scanWindow,
    orchestration_decision: "diagnostic_should_scan_now",
    should_scan_now: true,
    grow_max_learning_mode:
      providerProfileDiagnostics.grow_max_learning_mode,
    grow_max_learning_mode_env_raw_present:
      providerProfileDiagnostics.grow_max_learning_mode_env_raw_present,
    grow_max_learning_mode_env_raw_value_normalized:
      providerProfileDiagnostics
        .grow_max_learning_mode_env_raw_value_normalized,
    grow_max_learning_mode_public_env_raw_present:
      providerProfileDiagnostics
        .grow_max_learning_mode_public_env_raw_present,
    grow_max_learning_mode_public_env_raw_value_normalized:
      providerProfileDiagnostics
        .grow_max_learning_mode_public_env_raw_value_normalized,
    grow_max_learning_mode_requested:
      providerProfileDiagnostics.grow_max_learning_mode_requested,
    grow_max_learning_mode_blocked_reason:
      providerProfileDiagnostics.grow_max_learning_mode_blocked_reason,
    grow_max_learning_mode_enabled_source:
      providerProfileDiagnostics.grow_max_learning_mode_enabled_source,
    target_ideas_per_window:
      providerProfileDiagnostics.target_ideas_per_window,
    provider_plan_profile_mode:
      providerProfileDiagnostics.provider_plan_profile_mode,
    provider_plan_profile_source:
      providerProfileDiagnostics.provider_plan_profile_source,
    server_plan_mode: providerProfileDiagnostics.server_plan_mode,
    public_plan_mode: providerProfileDiagnostics.public_plan_mode,
    plan_mode_mismatch: providerProfileDiagnostics.plan_mode_mismatch,
    effective_scan_ticker_cap:
      providerProfileDiagnostics.effective_scan_ticker_cap,
    effective_outcome_candle_request_cap:
      providerProfileDiagnostics.effective_outcome_candle_request_cap,
    effective_scheduled_skip_openai:
      providerProfileDiagnostics.effective_scheduled_skip_openai,
    effective_scheduled_timeout_ms:
      providerProfileDiagnostics.effective_scheduled_timeout_ms,
    profile_scan_ticker_cap:
      providerProfileDiagnostics.profile_scan_ticker_cap,
    profile_outcome_candle_request_cap:
      providerProfileDiagnostics.profile_outcome_candle_request_cap,
    env_scan_ticker_override:
      providerProfileDiagnostics.env_scan_ticker_override,
    profile_notes: providerProfileDiagnostics.profile_notes,
  });

  if (diagnosticStep === "env_check") {
    const dynamicMoversDiscovery = await discoverDynamicMoversDiagnostics({
      maxTickers,
      now,
    });

    activeScanTrace.markStage("provider_env", "completed");
    activeScanTrace.markStage("final", "completed");
    activeScanTrace.updateFinal({
      decision: "diagnostic_env_check",
      status: "completed",
      zero_candidate_reason: null,
    });

    return diagnosticResponse({
      mode,
      step: diagnosticStep,
      maxTickers,
      skippedOpenAi,
      startedAtMs,
      activeScanTrace,
      extra: {
        provider_env: providerEnvSnapshot(),
        schema_check: schemaCheck,
        dynamic_movers_discovery: dynamicMoversDiscovery,
        ...providerProfileDiagnostics,
      },
    });
  }

  const selection = baseCandidateSelection({ scanWindow, maxTickers });
  const dynamicMoversDiscovery = await discoverDynamicMoversDiagnostics({
    candidates: selection.candidates,
    maxTickers,
    now,
  });
  updateUniverseTrace(activeScanTrace, selection);

  if (diagnosticStep === "universe_only") {
    activeScanTrace.markStage("final", "completed");
    activeScanTrace.updateFinal({
      decision: "diagnostic_universe_only",
      status: "completed",
      zero_candidate_reason: null,
    });

    return diagnosticResponse({
      mode,
      step: diagnosticStep,
      maxTickers,
      skippedOpenAi,
      startedAtMs,
      activeScanTrace,
      extra: {
        selected_tickers_count: selection.candidates.length,
        selected_tickers_sample: selection.candidates
          .map((candidate) => candidate.ticker)
          .slice(0, 12),
        scan_budget: selection.coverage?.scan_budget ?? null,
        dynamic_movers_discovery: dynamicMoversDiscovery,
      },
    });
  }

  const marketStatus = await getUsMarketStatus();
  const marketSession = buildMarketSessionEvaluation({ now, marketStatus });
  activeScanTrace.update({
    market_status: marketStatus.isOpenDay
      ? "diagnostic_provider_available"
      : "diagnostic_market_not_open",
    market_session: marketSession.phase,
  });
  const baseOrchestration = buildDayTradeScanOrchestrationSummary({
    now,
    marketSession,
    marketStatus,
    scanRuns: [],
    currentDataMode: "diagnostic",
    runType: "diagnostic",
  });
  const activeWindow = dayWindowFromIntraday(scanWindow);
  const orchestration = {
    ...baseOrchestration,
    active_window: activeWindow,
    active_window_status: "active" as const,
    decision: "should_scan_now" as const,
    should_scan_now: true,
    should_wait_for_window: false,
    scan_reason:
      "Diagnostic scan harness simulation. This is not a live official recommendation batch.",
    current_data_mode: "diagnostic",
  };

  try {
    if (timeoutReached(startedAtMs, timeoutMs)) {
      activeScanTrace.markStage("final", "completed");
      activeScanTrace.updateFinal({
        decision: "diagnostic_timeout",
        status: "partial",
        zero_candidate_reason: "diagnostic_timeout_before_market_data",
      });

      return diagnosticResponse({
        status: "partial",
        mode,
        step: diagnosticStep,
        maxTickers,
        skippedOpenAi,
        partialResult: true,
        timeoutReached: true,
        startedAtMs,
        activeScanTrace,
      });
    }

    if (
      diagnosticStep === "market_data_only" ||
      diagnosticStep === "ranking_only"
    ) {
      const scannerCandidates = await scanMarket(selection.candidates, {
        source: "scheduled",
        activeScanTrace,
        maxFreshProviderCalls: Math.min(1, selection.candidates.length),
      });
      activeScanTrace.markStage("raw_candidates", "completed");
      activeScanTrace.updateRawCandidates({
        raw_candidate_count: scannerCandidates.length,
        structurally_valid_count: structurallyValidCandidateCount(scannerCandidates),
        invalid_price_plan_count: Math.max(
          0,
          scannerCandidates.length -
            structurallyValidCandidateCount(scannerCandidates),
        ),
        missing_required_fields_count: Math.max(
          0,
          scannerCandidates.length -
            structurallyValidCandidateCount(scannerCandidates),
        ),
      });

      if (
        diagnosticStep === "market_data_only" ||
        timeoutReached(startedAtMs, timeoutMs)
      ) {
        const timedOut = timeoutReached(startedAtMs, timeoutMs);
        activeScanTrace.markStage("final", "completed");
        activeScanTrace.updateFinal({
          decision: "diagnostic_market_data_only",
          status: timedOut ? "partial" : "completed",
          candidates_generated: scannerCandidates.length,
          zero_candidate_reason:
            scannerCandidates.length === 0
              ? "market_data_fetch_returned_no_candidates"
              : null,
        });

        return diagnosticResponse({
          status: timedOut ? "partial" : "completed",
          mode,
          step: diagnosticStep,
          maxTickers,
          skippedOpenAi,
          partialResult: timedOut,
          timeoutReached: timedOut,
          startedAtMs,
          activeScanTrace,
          extra: {
            selected_tickers_count: selection.candidates.length,
            raw_candidate_count: scannerCandidates.length,
            quote_success_count:
              activeScanTrace.trace.market_data_fetch.quote_success_count,
            quote_error_count:
              activeScanTrace.trace.market_data_fetch.quote_error_count,
            candle_success_count:
              activeScanTrace.trace.market_data_fetch.candle_success_count,
            candle_error_count:
              activeScanTrace.trace.market_data_fetch.candle_error_count,
            stale_count: activeScanTrace.trace.market_data_fetch.stale_count,
            dynamic_movers_discovery: dynamicMoversDiscovery,
          },
        });
      }

      const rankingSummary = buildScannerCandidateRankingSummary({
        candidates: scannerCandidates,
        scanWindow,
        universeCoverage: selection.coverage,
        targetMin: Math.min(3, maxTickers),
        targetMax: Math.min(6, maxTickers),
      });
      activeScanTrace.markStage("ranking", "completed");
      activeScanTrace.updateRanking({
        ranking_attempted: true,
        ranked_count: rankingSummary.candidates_ranked,
        selected_count: rankingSummary.selected_count,
        top_score: rankingSummary.score_range.max,
        average_score: rankingSummary.average_score,
        top_penalties: rankingSummary.top_penalty_reasons.slice(0, 8),
      });
      activeScanTrace.markStage("openai", "skipped");
      activeScanTrace.updateOpenAi({
        openai_attempted: false,
        input_candidate_count: 0,
        output_recommendation_count: 0,
      });
      activeScanTrace.markStage("final", "completed");
      activeScanTrace.updateFinal({
        decision: "diagnostic_ranking_only",
        status: "completed",
        candidates_generated: scannerCandidates.length,
        ranked_candidates_count: rankingSummary.selected_count,
        zero_candidate_reason:
          rankingSummary.selected_count === 0
            ? "ranking_selected_zero_candidates"
            : null,
      });

      return diagnosticResponse({
        mode,
        step: diagnosticStep,
        maxTickers,
        skippedOpenAi,
        startedAtMs,
        activeScanTrace,
        extra: {
          selected_tickers_count: selection.candidates.length,
          raw_candidate_count: scannerCandidates.length,
          ranked_count: rankingSummary.candidates_ranked,
          selected_count: rankingSummary.selected_count,
          score_range: rankingSummary.score_range,
          top_ticker_scores: rankingSummary.results.slice(0, 8).map((result) => ({
            ticker: result.ticker,
            rank: result.rank,
            selected: result.selected,
            score: result.score.normalized_score,
            tier: result.score.tier,
          })),
          top_penalties: rankingSummary.top_penalty_reasons.slice(0, 8),
          dynamic_movers_discovery: dynamicMoversDiscovery,
        },
      });
    }

    const generationPromise = generateRecommendations({
      sessionType,
      scanWindow,
      source: "scheduled",
      allowPowerHourRecommendationLogging: true,
      diagnosticMode: true,
      diagnosticRunId,
      diagnosticMaxTickers: maxTickers,
      skipOpenAi: skippedOpenAi,
      activeScanTrace,
    });
    const generationResult = await Promise.race([
      generationPromise,
      new Promise<"diagnostic_timeout">((resolve) => {
        setTimeout(
          () => resolve("diagnostic_timeout"),
          Math.max(1, timeoutMs - elapsedSince(startedAtMs)),
        );
      }),
    ]);

    if (generationResult === "diagnostic_timeout") {
      activeScanTrace.markStage("final", "completed");
      activeScanTrace.updateFinal({
        decision: "diagnostic_timeout",
        status: "partial",
        zero_candidate_reason: "diagnostic_timeout",
      });

      return diagnosticResponse({
        status: "partial",
        mode,
        step: diagnosticStep,
        maxTickers,
        skippedOpenAi,
        partialResult: true,
        timeoutReached: true,
        startedAtMs,
        activeScanTrace,
      });
    }

    const recommendations =
      generationResult.recommendations as DiagnosticRecommendationRow[];
    const generationScanLog =
      (generationResult.scan_log ?? null) as RecommendationScanLogDetails | null;
    const recommendationsBuilt = recommendations.length;
    const scanLog = createDiagnosticScanLog({
      scanWindow,
      marketStatus,
      generationScanLog,
      recommendationsBuilt,
      mode,
      simulatedWindow,
      simulatedNyTime,
      activeScanTrace: activeScanTrace.trace,
    });
    const servingCadence = buildRecommendationServingCadenceSummary({
      tradingDate: scanDate,
      orchestration,
      ranking: scanLog.scanner_candidate_ranking ?? null,
      visibleRecommendations: recommendations.map((recommendation) => ({
        id: textOrNull(recommendation.id),
        ticker: recommendationTicker(recommendation),
        created_at: recommendationCreatedAt(recommendation),
        status: "diagnostic_hidden",
      })),
      now,
    });
    let scanRun: RecommendationScanRun | null = null;
    let snapshots: RecommendationSnapshot[] = [];
    let batchFingerprint: string | null = null;
    let persistenceStatus = "not_requested";
    let persistenceError: string | null = null;
    const persistenceResults = {
      scan_run: null as Awaited<ReturnType<typeof persistRecommendationScanRun>> | null,
      snapshots: [] as Array<Awaited<ReturnType<typeof persistRecommendationSnapshot>>>,
      batch: null as Awaited<ReturnType<typeof persistRecommendationBatch>> | null,
    };

    if (mode === "diagnostic_persist") {
      activeScanTrace.markStage("persistence", "started");
      const serverSupabase = getServerSupabaseClient();
      scanRun = buildRecommendationScanRun({
        trading_date: scanDate,
        observed_at: now,
        started_at: routeReceivedAt,
        completed_at: new Date().toISOString(),
        window: scanWindow,
        market_session_phase: marketSession.phase,
        market_session_risk: marketSession.risk_level,
        market_session_source: marketSession.source,
        source: "diagnostic",
        data_mode: "diagnostic_latest_market_data",
        visible_recommendations: [],
        scheduled_scan_run_id: diagnosticRunId,
        scanned_ticker_count: scanLog.candidates_scanned ?? null,
        raw_candidate_count:
          scanLog.real_scanner_candidate_generation?.universe.candidates_generated ??
          scanLog.candidates_scanned ??
          null,
        payload: {
          diagnostic_mode: true,
          diagnostic_run_mode: mode,
          simulated_window: simulatedWindow,
          simulated_ny_time: simulatedNyTime,
          not_live_trade_signal: true,
          visible_in_primary_recommendations: false,
          source_mode: "diagnostic",
          active_scan_trace: activeScanTrace.trace,
          scan_log: scanLog,
        },
      });
      persistenceResults.scan_run = await persistRecommendationScanRun(scanRun, {
        supabaseClient: serverSupabase.client,
        server: true,
        unavailableReason: serverSupabase.unavailable_reason,
      });

      snapshots = recommendations.map((recommendation) =>
        buildDiagnosticSnapshot({
          recommendation,
          scanRun: scanRun as RecommendationScanRun,
          scanWindow,
          marketSession,
          mode,
          activeScanTrace: activeScanTrace.trace,
        }),
      );

      for (const snapshot of snapshots) {
        persistenceResults.snapshots.push(
          await persistRecommendationSnapshot(snapshot, {
            supabaseClient: serverSupabase.client,
            server: true,
            unavailableReason: serverSupabase.unavailable_reason,
          }),
        );
      }

      const batch = buildRecommendationBatch({
        trading_date: scanDate,
        observed_at: now,
        window: scanWindow,
        batch_type: "diagnostic",
        snapshots,
        scan_run: scanRun,
        scan_run_id: scanRun.id,
        scan_run_fingerprint: scanRun.run_fingerprint,
        serving_cadence: servingCadence,
        ranking_summary: scanLog.scanner_candidate_ranking ?? null,
        openai_reality_guard:
          scanLog.openai_recommendation_reality_guard ?? null,
        source_mode: "diagnostic",
        data_mode: "diagnostic_latest_market_data",
        market_session_phase: marketSession.phase,
        payload: {
          diagnostic_mode: true,
          diagnostic_run_mode: mode,
          simulated_window: simulatedWindow,
          simulated_ny_time: simulatedNyTime,
          not_live_trade_signal: true,
          visible_in_primary_recommendations: false,
          source_mode: "diagnostic",
          active_scan_trace: activeScanTrace.trace,
        },
      });
      batchFingerprint = batch.batch_fingerprint;
      persistenceResults.batch = await persistRecommendationBatch(batch, {
        supabaseClient: serverSupabase.client,
        server: true,
        unavailableReason: serverSupabase.unavailable_reason,
      });
      persistenceStatus = [
        persistenceResults.scan_run.status,
        persistenceResults.batch.status,
        ...persistenceResults.snapshots.map((snapshot) => snapshot.status),
      ].includes("failed")
        ? "failed"
        : "saved";
      persistenceError =
        persistenceResults.scan_run.error ??
        persistenceResults.batch.error ??
        persistenceResults.snapshots.find((snapshot) => snapshot.error)?.error ??
        null;
      activeScanTrace.updatePersistence({
        scan_run_persisted:
          persistenceResults.scan_run.status === "saved" ||
          persistenceResults.scan_run.status === "updated" ||
          persistenceResults.scan_run.status === "duplicate",
        batch_persisted:
          persistenceResults.batch.status === "saved" ||
          persistenceResults.batch.status === "updated" ||
          persistenceResults.batch.status === "duplicate",
        snapshots_persisted_count: persistenceResults.snapshots.filter(
          (snapshot) =>
            snapshot.status === "saved" || snapshot.status === "duplicate",
        ).length,
        persistence_error_type: persistenceError?.split(":")[0] ?? null,
      });
      activeScanTrace.markStage(
        "persistence",
        persistenceStatus === "failed" ? "failed" : "completed",
      );
    }

    const tracePayload = finalizeTrace({
      activeScanTrace,
      scanLog,
      recommendationsBuilt,
      status: mode === "diagnostic_persist" ? persistenceStatus : "dry_run",
      batchFingerprint,
      scanRunFingerprint: scanRun?.run_fingerprint ?? null,
    });
    const elapsedMs = elapsedSince(startedAtMs);
    activeScanTrace.update({
      diagnostic_step: diagnosticStep,
      max_tickers: maxTickers,
      skipped_openai: skippedOpenAi,
      partial_result: false,
      timeout_reached: false,
      elapsed_ms: elapsedMs,
    });

    return NextResponse.json({
      ok: true,
      ...versionFields(),
      diagnostic_mode: true,
      diagnostic_step: diagnosticStep,
      mode,
      max_tickers: maxTickers,
      skipped_openai: skippedOpenAi,
      partial_result: false,
      timeout_reached: false,
      elapsed_ms: elapsedMs,
      last_stage_reached: tracePayload.last_stage_reached,
      simulated_window: simulatedWindow,
      simulated_ny_time: simulatedNyTime,
      latest_market_data: body.latest_market_data !== false,
      provider_env: providerEnvSnapshot(),
      schema_check: schemaCheck,
      selected_tickers_count: tracePayload.universe.selected_tickers_count,
      quote_success_count: tracePayload.market_data_fetch.quote_success_count,
      quote_error_count: tracePayload.market_data_fetch.quote_error_count,
      candle_success_count: tracePayload.market_data_fetch.candle_success_count,
      candle_error_count: tracePayload.market_data_fetch.candle_error_count,
      raw_candidate_count: tracePayload.raw_candidates.raw_candidate_count,
      ranked_count: tracePayload.ranking.ranked_count,
      selected_count: tracePayload.ranking.selected_count,
      openai_attempted: tracePayload.openai.openai_attempted,
      openai_output_recommendation_count:
        tracePayload.openai.output_recommendation_count,
      deterministic_fallback_used:
        tracePayload.final.deterministic_fallback_used,
      recommendation_build_path: tracePayload.final.recommendation_build_path,
      recommendations_built_count: recommendationsBuilt,
      recommendations_persisted_count:
        mode === "diagnostic_persist" ? persistenceResults.snapshots.length : 0,
      batch_fingerprint: batchFingerprint,
      snapshots_persisted_count:
        tracePayload.persistence.snapshots_persisted_count,
      no_publish_reason: tracePayload.final.no_publish_reason,
      persistence_status: persistenceStatus,
      persistence_error: persistenceError,
      not_live_trade_signal: true,
      visible_in_primary_recommendations: false,
      active_scan_trace: tracePayload,
    });
  } catch (error) {
    activeScanTrace.markStage("final", "failed");
    activeScanTrace.updateFinal({
      decision: "diagnostic_failed",
      status: "failed",
      zero_candidate_reason:
        error instanceof Error && error.message ? error.message : "unknown_error",
    });

    return NextResponse.json(
      {
        ok: false,
        ...versionFields(),
        diagnostic_mode: true,
        diagnostic_step: diagnosticStep,
        mode,
        max_tickers: maxTickers,
        skipped_openai: skippedOpenAi,
        partial_result: true,
        timeout_reached: false,
        elapsed_ms: elapsedSince(startedAtMs),
        last_stage_reached: activeScanTrace.trace.last_stage_reached,
        simulated_window: simulatedWindow,
        simulated_ny_time: simulatedNyTime,
        provider_env: providerEnvSnapshot(),
        schema_check: schemaCheck,
        error:
          error instanceof Error && error.message ? error.message : "Unknown error",
        error_details: normalizeUnknownError(error),
        active_scan_trace: activeScanTrace.trace,
      },
      { status: 500 },
    );
  }
}
