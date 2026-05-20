import { NextResponse } from "next/server";

import {
  generateRecommendations,
  RecommendationGenerationError,
  type SessionType,
} from "@/lib/recommendation-generator";
import {
  buildScanLogMessage,
  createScanLog,
  getScanLogResultFromMessage,
  type ScanLogEntry,
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
import { supabase } from "@/lib/supabase";

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

async function hasScanAlreadyRun(scanDate: string, sessionType: SessionType) {
  const { data, error } = await supabase
    .from("scheduled_scan_runs")
    .select("scan_date")
    .eq("scan_date", scanDate)
    .eq("session_type", sessionType)
    .maybeSingle();

  if (error) {
    throw new RecommendationGenerationError(
      error.message ?? "Could not check scheduled scan history.",
      500,
    );
  }

  return Boolean(data);
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
    if (ignoreExistingRun && error.code === "23505") {
      console.log("[automation/run-scan] duplicate run record ignored", {
        scanDate,
        sessionType,
      });
      return;
    }

    throw new RecommendationGenerationError(
      error.message ?? "Could not record scheduled scan run.",
      500,
    );
  }
}

async function safelyRecordScheduledScanRun(
  input: Parameters<typeof recordScheduledScanRun>[0],
) {
  try {
    await recordScheduledScanRun(input);
  } catch (error) {
    console.error("[automation/run-scan] scan_log_record_error", error);
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
  });
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

    console.error("[automation/run-scan] discard_review_error", error);

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

  console.log("Automation auth debug", {
    hasExpectedSecret: Boolean(expectedSecret),
    expectedLength: expectedSecret?.length ?? 0,
    providedLength: providedSecret?.length ?? 0,
    matches,
  });

  if (!matches) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await parseAutomationRunRequestBody(request);
  const force = body.force === true;
  const session_type = body.session_type;
  const requestedScanWindow = parseIntradayScanWindow(body.scan_window);
  const ignore_existing_run = body.ignore_existing_run === true;

  console.log("[automation/run-scan] request body", {
    force,
    session_type,
    scan_window: requestedScanWindow,
    ignore_existing_run,
  });

  const marketStatus = await getUsMarketStatus();
  let scanWindow = getScanWindowDueNow();

  if (force) {
    const forcedScanWindow = requestedScanWindow ?? getIntradayScanWindow(new Date());
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
      scanDate: getNewYorkDateString(new Date()),
      sessionType: forcedSessionType,
      scanWindow: forcedScanWindow,
    };
  }

  const scanPolicy = getIntradayScanPolicy(scanWindow.scanWindow);
  const scanWindowLabel = getIntradayScanWindowLabel(scanWindow.scanWindow);

  let expiredRecommendations = 0;

  try {
    expiredRecommendations = await archiveExpiredRecommendations();
  } catch (error) {
    console.error(error);

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
        expired_recommendations: expiredRecommendations,
        recommendations_created: 0,
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

  if (!isMarketOpenForIntradayTrading(marketStatus) && !canRunPreMarketWatchlist) {
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
    });

    await safelyRecordScheduledScanRun({
      scanDate: scanWindow.scanDate || marketStatus.date,
      sessionType: scanWindow.sessionType,
      status: "completed",
      recommendationsCreated: 0,
      message,
      scanLog,
      ignoreExistingRun: true,
    });

    return NextResponse.json({
      ok: true,
      message,
      market_status: marketStatus,
      forced: force,
      session_type: scanWindow.sessionType,
      scan_window: scanWindow.scanWindow,
      scan_window_label: scanWindowLabel,
      scan_date: scanWindow.scanDate || marketStatus.date,
      expired_recommendations: expiredRecommendations,
      recommendations_created: 0,
      discard_review: discardReview,
    });
  }

  if (!scanPolicy.allowGeneration && scanWindow.scanWindow !== "pre_market") {
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
    });

    await safelyRecordScheduledScanRun({
      scanDate: scanWindow.scanDate,
      sessionType: scanWindow.sessionType,
      status: "completed",
      recommendationsCreated: 0,
      message,
      scanLog,
      ignoreExistingRun: true,
    });

    return NextResponse.json({
      ok: true,
      message,
      forced: force,
      session_type: scanWindow.sessionType,
      scan_window: scanWindow.scanWindow,
      scan_window_label: scanWindowLabel,
      scan_date: scanWindow.scanDate,
      market_status: marketStatus,
      expired_recommendations: expiredRecommendations,
      recommendations_created: 0,
      discard_review: discardReview,
    });
  }

  const { scanDate, sessionType } = scanWindow;

  try {
    // TODO: Add scan_window column for intraday day trading windows.
    // Until then, duplicate protection is still scoped to legacy session_type.
    const alreadyRan = ignore_existing_run
      ? false
      : await hasScanAlreadyRun(scanDate, sessionType);

    if (alreadyRan) {
      const message = "Scan already ran.";
      const scanLog = createAutomationScanLog({
        source: "scheduled",
        scanWindow: scanWindow.scanWindow,
        marketStatus,
        result: "skipped",
        message,
        recommendationsCreated: 0,
      });

      await safelyRecordScheduledScanRun({
        scanDate,
        sessionType,
        status: "completed",
        recommendationsCreated: 0,
        message,
        scanLog,
        ignoreExistingRun: true,
      });

      return NextResponse.json({
        ok: true,
        message,
        forced: force,
        scan_date: scanDate,
        session_type: sessionType,
        scan_window: scanWindow.scanWindow,
        scan_window_label: scanWindowLabel,
        market_status: marketStatus,
        expired_recommendations: expiredRecommendations,
        recommendations_created: 0,
      });
    }

    const generationResult = await generateRecommendations({
      sessionType,
      scanWindow: scanWindow.scanWindow,
      source: "scheduled",
    });
    const recommendationsCreated = generationResult.recommendations.length;
    const resultMessage =
      generationResult.message ?? `Scheduled ${scanWindowLabel} scan completed.`;
    const message = `${resultMessage} scan_window=${scanWindow.scanWindow}`;
    const scanLog = createAutomationScanLog({
      source: "scheduled",
      scanWindow: scanWindow.scanWindow,
      marketStatus,
      result: generationResult.scan_log?.result,
      message:
        recommendationsCreated > 0
          ? `Created ${recommendationsCreated} day trade recommendation.`
          : resultMessage,
      recommendationsCreated,
      details: generationResult.scan_log,
    });

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
      forced: force,
      scan_date: scanDate,
      session_type: sessionType,
      scan_window: scanWindow.scanWindow,
      scan_window_label: scanWindowLabel,
      archived_recommendations: expiredRecommendations,
      expired_recommendations: expiredRecommendations,
      recommendations_created: recommendationsCreated,
      duplicate_fallback_used: generationResult.duplicate_fallback_used,
      market_regime: generationResult.market_regime,
      market_status: marketStatus,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error && error.message ? error.message : "Unknown error";

    try {
      await recordScheduledScanRun({
        scanDate,
        sessionType,
        status: "failed",
        recommendationsCreated: 0,
        message: `${message} scan_window=${scanWindow.scanWindow}`,
        ignoreExistingRun: ignore_existing_run,
      });
    } catch (recordError) {
      console.error(recordError);
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
        expired_recommendations: expiredRecommendations,
        recommendations_created: 0,
      },
      { status },
    );
  }
}
