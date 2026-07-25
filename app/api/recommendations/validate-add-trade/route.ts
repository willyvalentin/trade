import { NextResponse } from "next/server";

import {
  getOrRefreshIntradayIndicators,
  type IntradayIndicatorCacheSource,
} from "@/lib/intraday-indicator-cache";
import type { IntradayIndicators } from "@/lib/intraday-indicators";
import {
  getRecommendationFreshness,
  type RecommendationFreshness,
} from "@/lib/recommendation-freshness";
import {
  applicationSessionUnauthorizedResponse,
  applicationMutationForbiddenResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

type ValidateAddTradeRequest = {
  id?: unknown;
  ticker?: unknown;
  direction?: unknown;
  entryLowValue?: unknown;
  entryHighValue?: unknown;
  stopLossValue?: unknown;
  target1?: unknown;
  target2?: unknown;
  createdAtRaw?: unknown;
  expiresAtRaw?: unknown;
  scanWindow?: unknown;
  intradayIndicators?: unknown;
};

type ValidationStatus = "valid" | "warning" | "blocked" | "unavailable";

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIndicators(value: unknown): IntradayIndicators | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = value as Partial<IntradayIndicators>;

  return {
    vwap: parseNumber(raw.vwap),
    latestPrice: parseNumber(raw.latestPrice),
    priceVsVwapPercent: parseNumber(raw.priceVsVwapPercent),
    isAboveVwap:
      typeof raw.isAboveVwap === "boolean" ? raw.isAboveVwap : null,
    recentHigh: parseNumber(raw.recentHigh),
    recentLow: parseNumber(raw.recentLow),
    recentRangePercent: parseNumber(raw.recentRangePercent),
    momentumPercent: parseNumber(raw.momentumPercent),
    momentumDirection:
      raw.momentumDirection === "up" ||
      raw.momentumDirection === "down" ||
      raw.momentumDirection === "flat"
        ? raw.momentumDirection
        : "unknown",
    volumeTrend:
      raw.volumeTrend === "expanding" ||
      raw.volumeTrend === "contracting" ||
      raw.volumeTrend === "flat"
        ? raw.volumeTrend
        : "unknown",
    latestVolume: parseNumber(raw.latestVolume),
    averageVolume: parseNumber(raw.averageVolume),
    warnings: Array.isArray(raw.warnings)
      ? raw.warnings.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function addUnique(reasons: string[], reason: string) {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

function getLatestConfirmationStatus(
  indicators: IntradayIndicators,
): "confirmed" | "mixed" | "weak" {
  const weakSignals = [
    indicators.isAboveVwap === false,
    indicators.momentumDirection === "down",
    indicators.volumeTrend === "contracting",
  ].filter(Boolean).length;

  if (weakSignals >= 2) {
    return "weak";
  }

  if (
    indicators.isAboveVwap === true &&
    (indicators.momentumDirection === "up" ||
      indicators.momentumDirection === "flat") &&
    (indicators.volumeTrend === "expanding" ||
      indicators.volumeTrend === "flat")
  ) {
    return "confirmed";
  }

  return "mixed";
}

function compareOriginalToLatest(
  original: IntradayIndicators | null,
  latest: IntradayIndicators,
  reasons: string[],
) {
  const beforeCount = reasons.length;

  if (original?.isAboveVwap === true && latest.isAboveVwap === false) {
    addUnique(
      reasons,
      "Original setup was above VWAP, but latest price is now below VWAP.",
    );
  }

  if (
    original?.momentumDirection === "up" &&
    latest.momentumDirection === "down"
  ) {
    addUnique(reasons, "Momentum changed from up to down.");
  }

  if (
    original?.volumeTrend === "expanding" &&
    latest.volumeTrend === "contracting"
  ) {
    addUnique(reasons, "Volume trend changed from expanding to contracting.");
  }

  if (reasons.length === beforeCount) {
    addUnique(reasons, "Latest validation still supports the original setup.");
  }
}

function applyEntrySanityChecks({
  latestPrice,
  entryLow,
  entryHigh,
  stopLoss,
  target,
  blockedReasons,
  warningReasons,
}: {
  latestPrice: number | null;
  entryLow: number | null;
  entryHigh: number | null;
  stopLoss: number | null;
  target: number | null;
  blockedReasons: string[];
  warningReasons: string[];
}) {
  if (latestPrice === null) {
    return;
  }

  if (stopLoss !== null && latestPrice <= stopLoss) {
    addUnique(blockedReasons, "Latest price is at or below the stop area.");
  }

  if (target !== null && latestPrice >= target * 0.98) {
    addUnique(
      blockedReasons,
      "Price is already near the target. Risk/reward may no longer be valid.",
    );
  }

  const entry = entryHigh ?? entryLow;
  if (entry === null || target === null || target <= entry) {
    return;
  }

  const remainingTargetDistance = target - latestPrice;
  const originalTargetDistance = target - entry;

  if (
    latestPrice > entry * 1.01 &&
    remainingTargetDistance / originalTargetDistance < 0.35
  ) {
    addUnique(
      warningReasons,
      "Price has moved too far from entry. Risk/reward may no longer be valid.",
    );
  }
}

function buildResponse({
  status,
  reasons,
  latestIndicators,
  indicatorSource,
  stale,
}: {
  status: ValidationStatus;
  reasons: string[];
  latestIndicators: IntradayIndicators | null;
  indicatorSource: IntradayIndicatorCacheSource;
  stale: boolean;
}) {
  const fallbackReason =
    status === "valid"
      ? "Latest intraday validation supports the setup."
      : status === "unavailable"
        ? "Latest validation unavailable. Using original recommendation snapshot."
        : status === "blocked"
          ? "Setup no longer passes intraday validation."
          : "Latest intraday validation is mixed.";

  return NextResponse.json({
    status,
    reason: reasons[0] ?? fallbackReason,
    reasons: reasons.length > 0 ? reasons : [fallbackReason],
    latestIndicators,
    indicatorSource,
    stale,
  });
}

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const body = (await request.json().catch(() => null)) as
    | ValidateAddTradeRequest
    | null;

  const ticker = typeof body?.ticker === "string" ? body.ticker.trim().toUpperCase() : "";

  if (!ticker) {
    return NextResponse.json(
      {
        status: "unavailable",
        reason: "Ticker unavailable for latest validation.",
        reasons: ["Ticker unavailable for latest validation."],
        latestIndicators: null,
        indicatorSource: "unavailable",
        stale: true,
      },
      { status: 400 },
    );
  }

  const freshness: RecommendationFreshness = getRecommendationFreshness({
    created_at: typeof body?.createdAtRaw === "string" ? body.createdAtRaw : null,
    expires_at: typeof body?.expiresAtRaw === "string" ? body.expiresAtRaw : null,
    scan_window: typeof body?.scanWindow === "string" ? body.scanWindow : null,
  });

  if (freshness === "expired") {
    return buildResponse({
      status: "blocked",
      reasons: ["Recommendation has expired. Generate a fresh setup before entering."],
      latestIndicators: null,
      indicatorSource: "unavailable",
      stale: true,
    });
  }

  const cacheResult = await getOrRefreshIntradayIndicators(ticker, {
    source: "add_trade_validation",
    maxAgeMinutes: 3,
    allowFreshFetch: true,
    interval: "5min",
  });
  const latestIndicators = cacheResult.indicators;

  if (!latestIndicators) {
    return buildResponse({
      status: "unavailable",
      reasons: [
        cacheResult.warnings[0] ??
          "Latest indicator validation could not be completed.",
      ],
      latestIndicators: null,
      indicatorSource: cacheResult.source,
      stale: cacheResult.stale,
    });
  }

  const originalIndicators = parseIndicators(body?.intradayIndicators);
  const latestConfirmation = getLatestConfirmationStatus(latestIndicators);
  const blockedReasons: string[] = [];
  const warningReasons: string[] = [];
  const comparisonReasons: string[] = [];

  if (
    latestIndicators.isAboveVwap === false &&
    latestIndicators.momentumDirection === "down"
  ) {
    addUnique(
      blockedReasons,
      "Price is below VWAP and momentum is weakening.",
    );
  }

  if (latestConfirmation === "weak") {
    addUnique(blockedReasons, "Latest indicators show weak intraday confirmation.");
  }

  if (freshness === "stale" && latestConfirmation !== "confirmed") {
    addUnique(
      blockedReasons,
      "Stale recommendation no longer has confirmed intraday support.",
    );
  }

  if (cacheResult.stale) {
    addUnique(warningReasons, "Latest indicator data is stale.");
  }

  if (latestIndicators.momentumDirection === "flat") {
    addUnique(warningReasons, "Momentum is flat on latest intraday data.");
  }

  if (latestIndicators.volumeTrend === "contracting") {
    addUnique(warningReasons, "Volume trend is contracting.");
  }

  if (latestIndicators.volumeTrend === "unknown") {
    addUnique(warningReasons, "Volume confirmation is unavailable.");
  }

  if (
    latestIndicators.isAboveVwap === false &&
    latestIndicators.momentumDirection !== "down"
  ) {
    addUnique(warningReasons, "Latest price is below VWAP.");
  }

  applyEntrySanityChecks({
    latestPrice: latestIndicators.latestPrice,
    entryLow: parseNumber(body?.entryLowValue),
    entryHigh: parseNumber(body?.entryHighValue),
    stopLoss: parseNumber(body?.stopLossValue),
    target: parseNumber(body?.target2) ?? parseNumber(body?.target1),
    blockedReasons,
    warningReasons,
  });

  compareOriginalToLatest(originalIndicators, latestIndicators, comparisonReasons);

  const reasons =
    blockedReasons.length > 0
      ? [...blockedReasons, ...comparisonReasons]
      : warningReasons.length > 0
        ? [...warningReasons, ...comparisonReasons]
        : comparisonReasons;

  return buildResponse({
    status:
      blockedReasons.length > 0
        ? "blocked"
        : warningReasons.length > 0
          ? "warning"
          : "valid",
    reasons,
    latestIndicators,
    indicatorSource: cacheResult.source,
    stale: cacheResult.stale,
  });
}
