import { NextResponse } from "next/server";

import {
  generateRecommendations,
  RecommendationGenerationError,
  type SessionType,
} from "@/lib/recommendation-generator";
import { getUsMarketStatus, type MarketStatus } from "@/lib/market-calendar";
import { supabase } from "@/lib/supabase";

type ScanWindow = {
  sessionType: SessionType;
  scanDate: string;
};

type AutomationRunRequestBody = {
  force?: unknown;
  session_type?: unknown;
  ignore_existing_run?: unknown;
};

function getNewYorkDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const valueByType = new Map(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    weekday: valueByType.get("weekday") ?? "",
    year: valueByType.get("year") ?? "",
    month: valueByType.get("month") ?? "",
    day: valueByType.get("day") ?? "",
    hour: Number(valueByType.get("hour")),
    minute: Number(valueByType.get("minute")),
  };
}

function getNewYorkScanDate() {
  const newYorkDate = getNewYorkDateParts();
  return `${newYorkDate.year}-${newYorkDate.month}-${newYorkDate.day}`;
}

function getScanWindowDueNow(): ScanWindow | null {
  const newYorkDate = getNewYorkDateParts();
  const minutesAfterMidnight = newYorkDate.hour * 60 + newYorkDate.minute;
  const morningStart = 9 * 60 + 30;
  const morningEnd = 10 * 60;
  const middayStart = 12 * 60 + 30;
  const middayEnd = 13 * 60;
  const scanDate = `${newYorkDate.year}-${newYorkDate.month}-${newYorkDate.day}`;

  if (
    minutesAfterMidnight >= morningStart &&
    minutesAfterMidnight < morningEnd
  ) {
    return { sessionType: "morning", scanDate };
  }

  if (minutesAfterMidnight >= middayStart && minutesAfterMidnight < middayEnd) {
    return { sessionType: "midday", scanDate };
  }

  return null;
}

function timeToMinutes(time: string | null) {
  if (!time) {
    return null;
  }

  const [hour, minute] = time.split(":").map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function getNewYorkMinutesAfterMidnight() {
  const newYorkDate = getNewYorkDateParts();
  return newYorkDate.hour * 60 + newYorkDate.minute;
}

function isAllowedByMarketClose(
  sessionType: SessionType,
  marketStatus: MarketStatus,
) {
  if (marketStatus.dayType !== "early_close" || sessionType !== "midday") {
    return true;
  }

  const closeMinutes = timeToMinutes(marketStatus.marketCloseTime);

  if (closeMinutes === null) {
    return true;
  }

  return getNewYorkMinutesAfterMidnight() < closeMinutes;
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

async function archiveFreshRecommendations() {
  const { data, error } = await supabase
    .from("recommendations")
    .update({ archived: true })
    .eq("status", "new")
    .eq("archived", false)
    .select("id");

  if (error) {
    throw new RecommendationGenerationError(
      error.message ?? "Could not archive old recommendations.",
      500,
    );
  }

  return data?.length ?? 0;
}

async function recordScheduledScanRun({
  scanDate,
  sessionType,
  status,
  recommendationsCreated,
  message,
  ignoreExistingRun,
}: {
  scanDate: string;
  sessionType: SessionType;
  status: "completed" | "failed";
  recommendationsCreated: number;
  message: string;
  ignoreExistingRun?: boolean;
}) {
  const { error } = await supabase.from("scheduled_scan_runs").insert({
    scan_date: scanDate,
    session_type: sessionType,
    status,
    recommendations_created: recommendationsCreated,
    message,
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
  const ignore_existing_run = body.ignore_existing_run === true;

  console.log("[automation/run-scan] request body", {
    force,
    session_type,
    ignore_existing_run,
  });

  const marketStatus = await getUsMarketStatus();

  if (!marketStatus.isOpenDay) {
    return NextResponse.json({
      ok: true,
      message: "US stock market is closed today.",
      market_status: marketStatus,
      forced: force,
      session_type: null,
      scan_date: marketStatus.date,
      recommendations_created: 0,
    });
  }

  let scanWindow: ScanWindow | null = null;

  if (force) {
    if (session_type !== "morning" && session_type !== "midday") {
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
      scanDate: getNewYorkScanDate(),
      sessionType: session_type,
    };
  } else {
    scanWindow = getScanWindowDueNow();
  }

  if (!scanWindow) {
    return NextResponse.json({
      ok: true,
      message: "No scheduled scan due now.",
      forced: false,
      session_type: null,
      scan_date: null,
      market_status: marketStatus,
      recommendations_created: 0,
    });
  }

  const { scanDate, sessionType } = scanWindow;

  if (!isAllowedByMarketClose(sessionType, marketStatus)) {
    return NextResponse.json({
      ok: true,
      message: "US stock market closed before the midday scan window.",
      forced: force,
      scan_date: scanDate,
      session_type: sessionType,
      market_status: marketStatus,
      recommendations_created: 0,
    });
  }

  try {
    const alreadyRan = ignore_existing_run
      ? false
      : await hasScanAlreadyRun(scanDate, sessionType);

    if (alreadyRan) {
      return NextResponse.json({
        ok: true,
        message: "Scan already ran.",
        forced: force,
        scan_date: scanDate,
        session_type: sessionType,
        market_status: marketStatus,
        recommendations_created: 0,
      });
    }

    const archivedCount = await archiveFreshRecommendations();
    const generationResult = await generateRecommendations({
      sessionType,
      source: "scheduled",
    });
    const recommendationsCreated = generationResult.recommendations.length;
    const message =
      generationResult.message ??
      `Scheduled ${sessionType} scan completed.`;

    await recordScheduledScanRun({
      scanDate,
      sessionType,
      status: "completed",
      recommendationsCreated,
      message,
      ignoreExistingRun: ignore_existing_run,
    });

    return NextResponse.json({
      ok: true,
      message,
      forced: force,
      scan_date: scanDate,
      session_type: sessionType,
      archived_recommendations: archivedCount,
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
        message,
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
        market_status: marketStatus,
        recommendations_created: 0,
      },
      { status },
    );
  }
}
