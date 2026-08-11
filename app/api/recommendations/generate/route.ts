import { NextResponse } from "next/server";

import {
  generateRecommendations,
  RecommendationGenerationError,
} from "@/lib/recommendation-generator";
import { getUsMarketStatus } from "@/lib/market-calendar";
import {
  getIntradayScanPolicy,
  getIntradayScanWindow,
  getIntradayScanWindowLabel,
  getLegacySessionTypeForScanWindow,
  isMarketOpenForIntradayTrading,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import { getDefaultRecommendationExpiryCutoff } from "@/lib/recommendation-freshness";
import { createScanLog, type PreMarketCandidate } from "@/lib/scan-log-core";
import { recordScanLog } from "@/lib/server/scan-log-persistence";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { normalizeUnknownError } from "@/lib/error-logging";
import type { OpenAiRecommendationRealityGuardSummary } from "@/lib/openai-recommendation-reality-guard";
import {
  applicationSessionUnauthorizedResponse,
  applicationMutationForbiddenResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

type GenerateRequestBody = {
  session_type?: unknown;
  scan_window?: unknown;
  target_count?: unknown;
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

function serverSupabase() {
  const { client, unavailable_reason } = getServerSupabaseClient();
  if (!client) {
    throw new RecommendationGenerationError(
      `Server persistence unavailable: ${unavailable_reason ?? "unknown"}`,
      503,
    );
  }
  return client;
}

function parseTargetCount(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    throw new RecommendationGenerationError(
      "target_count must be a positive integer.",
      400,
    );
  }

  return value;
}

async function archiveExpiredRecommendations(ownerUserId: string) {
  const { data, error } = await serverSupabase()
    .from("recommendations")
    .update({ archived: true })
    .eq("owner_user_id", ownerUserId)
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

  console.log("[recommendations/generate] expired recommendations archived", {
    count: data?.length ?? 0,
  });

  return data?.length ?? 0;
}

function marketStatusLabel(marketStatus: Awaited<ReturnType<typeof getUsMarketStatus>>) {
  if (marketStatus.dayType === "unknown") return "unknown";
  return isMarketOpenForIntradayTrading(marketStatus) ? "open" : "closed";
}

async function safelyRecordManualScanLog({
  scanDate,
  sessionType,
  scanWindow,
  marketStatus,
  result,
  message,
  recommendationsCreated,
  details,
}: {
  scanDate: string;
  sessionType: "morning" | "midday";
  scanWindow: IntradayScanWindow;
  marketStatus: Awaited<ReturnType<typeof getUsMarketStatus>>;
  result?: string;
  message: string;
  recommendationsCreated: number;
  details?: Record<string, unknown> | null;
}) {
  await recordScanLog({
    scanDate,
    sessionType,
    scanLog: createScanLog({
      source: "manual",
      scan_window: scanWindow,
      market_status: marketStatusLabel(marketStatus),
      result:
        result === "recommendation_created" ||
        result === "no_high_quality_setup" ||
        result === "openai_no_trade" ||
        result === "market_closed" ||
        result === "pre_market" ||
        result === "pre_market_watchlist_updated" ||
        result === "pre_market_no_candidates" ||
        result === "pre_market_skipped_holiday" ||
        result === "power_hour_blocked" ||
        result === "recommendation_limit_reached" ||
        result === "duplicate_ticker_skipped" ||
        result === "active_position_exists" ||
        result === "provider_rate_limited" ||
        result === "provider_error" ||
        result === "openai_error" ||
        result === "skipped"
          ? result
          : "unknown",
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
        ? details.pre_market_candidates
            .filter((item): item is Record<string, unknown> =>
              Boolean(item && typeof item === "object"),
            )
            .map((item) => {
              const metadata =
                typeof item.metadata === "object" && item.metadata !== null
                  ? (item.metadata as Record<string, unknown>)
                  : {};
              const detectedAt =
                typeof item.detected_at === "string"
                  ? item.detected_at
                  : new Date().toISOString();
              const ticker = typeof item.ticker === "string" ? item.ticker : "";
              const candidate = {
                id:
                  typeof item.id === "string"
                    ? item.id
                    : `pre_market:${detectedAt.slice(0, 10)}:${ticker}`,
                ticker,
                score: typeof item.score === "number" ? item.score : 0,
                reason: typeof item.reason === "string" ? item.reason : "",
                signals: Array.isArray(item.signals)
                  ? item.signals.filter(
                      (signal): signal is string => typeof signal === "string",
                    )
                  : [],
                warnings: Array.isArray(item.warnings)
                  ? item.warnings.filter(
                      (warning): warning is string => typeof warning === "string",
                    )
                  : [],
                detected_at: detectedAt,
                scan_window: "pre_market",
                status:
                  item.status === "confirmed_after_open" || item.status === "expired"
                    ? item.status
                    : "watching",
                source: "scanner",
                metadata: {
                  ...metadata,
                  company_name:
                    typeof item.company_name === "string"
                      ? item.company_name
                      : metadata.company_name,
                },
              } satisfies PreMarketCandidate;

              return candidate;
            })
            .filter((item) => item.ticker)
        : null,
      openai_recommendation_reality_guard:
        typeof details?.openai_recommendation_reality_guard === "object" &&
        details.openai_recommendation_reality_guard !== null
          ? (details.openai_recommendation_reality_guard as OpenAiRecommendationRealityGuardSummary)
          : null,
    }),
  });
}

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  try {
    let body: GenerateRequestBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Please send a JSON request body." },
        { status: 400 },
      );
    }

    const scanWindow = intradayScanWindows.includes(
      body.scan_window as IntradayScanWindow,
    )
      ? (body.scan_window as IntradayScanWindow)
      : getIntradayScanWindow(new Date());
    const sessionType =
      body.session_type === "morning" || body.session_type === "midday"
        ? body.session_type
        : getLegacySessionTypeForScanWindow(scanWindow);

    if (body.session_type !== undefined && body.session_type !== sessionType) {
      return NextResponse.json(
        { error: "session_type must be morning or midday." },
        { status: 400 },
      );
    }

    const expiredRecommendations = await archiveExpiredRecommendations(
      session.owner_user_id,
    );
    const marketStatus = await getUsMarketStatus();
    const isPreMarketWatchlistScan = scanWindow === "pre_market";
    const canRunPreMarketWatchlist =
      isPreMarketWatchlistScan &&
      marketStatus.isOpenDay &&
      marketStatus.dayType !== "unknown" &&
      marketStatus.dayType !== "weekend" &&
      marketStatus.dayType !== "holiday";

    if (!isMarketOpenForIntradayTrading(marketStatus) && !canRunPreMarketWatchlist) {
      const message =
        isPreMarketWatchlistScan &&
        (marketStatus.dayType === "weekend" || marketStatus.dayType === "holiday")
          ? "Pre-market watchlist skipped: market is closed for weekend/holiday."
          : marketStatus.dayType === "unknown"
          ? "US stock market status is unknown. Skipping recommendation generation."
          : "US stock market is not currently open for active day trading.";
      await safelyRecordManualScanLog({
        scanDate: marketStatus.date,
        sessionType,
        scanWindow,
        marketStatus,
        result:
          isPreMarketWatchlistScan &&
          (marketStatus.dayType === "weekend" || marketStatus.dayType === "holiday")
            ? "pre_market_skipped_holiday"
            : marketStatus.dayType === "unknown"
              ? "skipped"
              : "market_closed",
        message,
        recommendationsCreated: 0,
      });

      return NextResponse.json(
        {
          error: message,
          market_status: marketStatus,
          scan_window: scanWindow,
          expired_recommendations: expiredRecommendations,
        },
        { status: 400 },
      );
    }

    const scanPolicy = getIntradayScanPolicy(scanWindow);

    if (!scanPolicy.allowGeneration && !isPreMarketWatchlistScan) {
      await safelyRecordManualScanLog({
        scanDate: marketStatus.date,
        sessionType,
        scanWindow,
        marketStatus,
        result:
          scanWindow === "power_hour"
              ? "power_hour_blocked"
              : "skipped",
        message: scanPolicy.message,
        recommendationsCreated: 0,
      });

      return NextResponse.json({
        recommendations: [],
        inserted_count: 0,
        message: scanPolicy.message,
        scan_window: scanWindow,
        scan_window_label: getIntradayScanWindowLabel(scanWindow),
        market_status: marketStatus,
        expired_recommendations: expiredRecommendations,
      });
    }

    const result = await generateRecommendations({
      ownerUserId: session.owner_user_id,
      sessionType,
      scanWindow,
      targetCount: parseTargetCount(body.target_count),
      source: "manual",
    });
    const scanResult = result as {
      recommendations: unknown[];
      inserted_count?: number;
      message?: string;
      scan_log?: Record<string, unknown>;
    };
    const recommendationsCreated =
      typeof scanResult.inserted_count === "number"
        ? scanResult.inserted_count
        : scanResult.recommendations.length;
    const resultMessage =
      scanResult.message ??
      (recommendationsCreated > 0
        ? `Created ${recommendationsCreated} day trade recommendation.`
        : "No high-quality day trade setup found.");

    await safelyRecordManualScanLog({
      scanDate: marketStatus.date,
      sessionType,
      scanWindow,
      marketStatus,
      result:
        typeof scanResult.scan_log?.result === "string"
          ? scanResult.scan_log.result
          : undefined,
      message: resultMessage,
      recommendationsCreated,
      details: scanResult.scan_log,
    });

    return NextResponse.json({
      ...result,
      scan_window_label: getIntradayScanWindowLabel(scanWindow),
      market_status: marketStatus,
      expired_recommendations: expiredRecommendations,
    });
  } catch (error) {
    console.error("[recommendations/generate] request_error", {
      error: normalizeUnknownError(error),
    });

    if (error instanceof RecommendationGenerationError) {
      return NextResponse.json(
        {
          error: error.message,
          ...error.details,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
