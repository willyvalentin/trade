import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";
import type { LegacySessionType } from "@/lib/intraday-scan-window";
import type { OpenAiRecommendationRealityGuardSummary } from "@/lib/openai-recommendation-reality-guard";
import type { RecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import type { ScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import type { RealScannerCandidateGenerationSummary } from "@/lib/real-scanner-candidate-generation";
import type { SetupType } from "@/lib/setup-types";
import type { ActiveScanTrace } from "@/lib/active-scan-trace";
import { supabase } from "@/lib/supabase";

export type ScanLogResult =
  | "recommendation_created"
  | "no_high_quality_setup"
  | "openai_no_trade"
  | "market_closed"
  | "pre_market"
  | "pre_market_watchlist_updated"
  | "pre_market_no_candidates"
  | "pre_market_skipped_holiday"
  | "power_hour_blocked"
  | "recommendation_limit_reached"
  | "duplicate_ticker_skipped"
  | "active_position_exists"
  | "provider_rate_limited"
  | "provider_error"
  | "openai_error"
  | "skipped"
  | "unknown";

export type ScanLogSource = "scheduled" | "manual";

export type PreMarketCandidate = {
  id: string;
  ticker: string;
  score: number;
  reason: string;
  signals: string[];
  warnings: string[];
  detected_at: string;
  scan_window: "pre_market";
  status: "watching" | "confirmed_after_open" | "expired";
  source?: "scanner";
  metadata?: Record<string, unknown>;
};

export type ScanLogEntry = {
  id?: string | number;
  created_at: string;
  source: ScanLogSource;
  scan_window: string | null;
  market_status: string | null;
  result: ScanLogResult;
  message: string;
  recommendations_created: number;
  top_candidate_ticker?: string | null;
  top_candidate_score?: number | null;
  top_candidate_setup_type?: SetupType | null;
  top_candidate_breakdown?: Record<string, number> | null;
  top_candidate_reasons?: string[] | null;
  top_candidate_warnings?: string[] | null;
  top_candidate_indicators?: {
    isAboveVwap: boolean | null;
    momentumDirection: string;
    volumeTrend: string;
  } | null;
  indicator_source?: string | null;
  indicator_cached_at?: string | null;
  indicator_stale?: boolean | null;
  no_trade_reason?: string | null;
  no_trade_risk_flags?: string[] | null;
  threshold?: number | null;
  candidates_scanned?: number | null;
  fresh_provider_calls?: number | null;
  cache_hits?: number | null;
  cache_misses?: number | null;
  skipped_tickers?: number | null;
  pre_market_candidates?: PreMarketCandidate[] | null;
  real_scanner_candidate_generation?: RealScannerCandidateGenerationSummary | null;
  scanner_candidate_ranking?: ScannerCandidateRankingSummary | null;
  openai_recommendation_reality_guard?: OpenAiRecommendationRealityGuardSummary | null;
  ranked_candidates_count?: number | null;
  recommendations_published_count?: number | null;
  strong_count?: number | null;
  valid_count?: number | null;
  experimental_count?: number | null;
  ranked_candidates_not_published_reason?: string | null;
  strong_threshold?: number | null;
  publishable_threshold?: number | null;
  deterministic_fallback_used?: boolean | null;
  automation_route_version?: string | null;
  recommendation_publish_policy_version?: string | null;
  build_marker?: string | null;
  no_publish_reason?: string | null;
  active_scan_trace?: ActiveScanTrace | null;
  day_trade_scan_orchestration?: DayTradeScanOrchestrationSummary | null;
  recommendation_serving_cadence?: RecommendationServingCadenceSummary | null;
};

export type ScanLogRunRow = {
  id?: string | number;
  created_at: string | null;
  scan_date?: string | null;
  session_type?: string | null;
  status?: string | null;
  recommendations_created: number | string | null;
  message: string | null;
};

const scanLogPrefix = "[scan_log:";

export function getScanLogResultFromMessage(
  message: string,
  recommendationsCreated = 0,
): ScanLogResult {
  if (recommendationsCreated > 0) return "recommendation_created";
  if (/power hour/i.test(message)) return "power_hour_blocked";
  if (/current recommendation limit/i.test(message)) {
    return "recommendation_limit_reached";
  }
  if (/active position already exists/i.test(message)) {
    return "active_position_exists";
  }
  if (/existing current setup|duplicate/i.test(message)) {
    return "duplicate_ticker_skipped";
  }
  if (/pre-market watchlist updated/i.test(message)) {
    return "pre_market_watchlist_updated";
  }
  if (/pre-market.*no candidates/i.test(message)) {
    return "pre_market_no_candidates";
  }
  if (/pre-market.*holiday|pre-market.*weekend/i.test(message)) {
    return "pre_market_skipped_holiday";
  }
  if (/pre-market|not open for active day trading yet/i.test(message)) {
    return "pre_market";
  }
  if (/market.*closed|not currently open/i.test(message)) return "market_closed";
  if (/openai rejected candidate/i.test(message)) return "openai_no_trade";
  if (/rate limit/i.test(message)) return "provider_rate_limited";
  if (/provider|market data/i.test(message)) return "provider_error";
  if (/openai/i.test(message)) return "openai_error";
  if (/no high-quality|below threshold|no .*setup/i.test(message)) {
    return "no_high_quality_setup";
  }
  if (/skipped/i.test(message)) return "skipped";

  return "unknown";
}

export function buildScanLogMessage(message: string, scanLog: ScanLogEntry) {
  return `${message} scan_window=${scanLog.scan_window ?? "unknown"} ${scanLogPrefix}${JSON.stringify(
    scanLog,
  )}]`;
}

export function parseScanLogFromMessage(row: ScanLogRunRow): ScanLogEntry {
  const message = row.message ?? "";
  const markerIndex = message.lastIndexOf(scanLogPrefix);
  const recommendationsCreated = Number(row.recommendations_created ?? 0) || 0;

  if (markerIndex !== -1 && message.endsWith("]")) {
    try {
      const parsed = JSON.parse(
        message.slice(markerIndex + scanLogPrefix.length, -1),
      ) as ScanLogEntry;

      return {
        ...parsed,
        id: row.id,
        created_at: row.created_at ?? parsed.created_at,
      };
    } catch {
      // Fall through to legacy message parsing.
    }
  }

  const scanWindowMatch = message.match(/scan_window=([a-z_]+)/);

  return {
    id: row.id,
    created_at: row.created_at ?? "",
    source: "scheduled",
    scan_window: scanWindowMatch?.[1] ?? null,
    market_status: null,
    result: getScanLogResultFromMessage(message, recommendationsCreated),
    message: message.replace(/\s*\[scan_log:.*\]$/, "").trim(),
    recommendations_created: recommendationsCreated,
  };
}

export async function recordScanLog({
  scanDate,
  sessionType,
  status = "completed",
  scanLog,
}: {
  scanDate: string;
  sessionType: LegacySessionType;
  status?: "completed" | "failed";
  scanLog: ScanLogEntry;
}) {
  const { error } = await supabase.from("scheduled_scan_runs").insert({
    scan_date: scanDate,
    session_type: sessionType,
    status,
    recommendations_created: scanLog.recommendations_created,
    message: buildScanLogMessage(scanLog.message, scanLog),
  });

  if (error) {
    // TODO: Add dedicated scan_logs table; scheduled_scan_runs may reject
    // multiple same-session rows in some deployments.
    console.error("[scan-log] insert failed", {
      code: error.code,
      message: error.message,
    });
  }
}

export function createScanLog(input: Omit<ScanLogEntry, "created_at">) {
  return {
    ...input,
    created_at: new Date().toISOString(),
  };
}
