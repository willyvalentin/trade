import { NextResponse } from "next/server";

import {
  createDefaultUserSettings,
  readRecentScheduledScanRuns,
  readUserSettings,
  updateUserSettings,
} from "@/lib/server/application-data-access";
import {
  applicationSessionUnauthorizedResponse,
  applicationMutationForbiddenResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

const permittedSettingsFields = new Set([
  "portfolio_size",
  "risk_per_trade_percent",
  "max_recommendations_per_session",
  "max_open_positions",
  "preferred_timeframe",
  "long_only",
]);

function objectBody(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function allowedSettings(value: Record<string, unknown>) {
  const result: Record<string, unknown> = {};

  for (const [key, fieldValue] of Object.entries(value)) {
    if (permittedSettingsFields.has(key)) result[key] = fieldValue;
  }

  return result;
}

function validSettings(settings: Record<string, unknown>) {
  const portfolioSize = settings.portfolio_size;
  const riskPercent = settings.risk_per_trade_percent;
  const maxRecommendations = settings.max_recommendations_per_session;
  const maxPositions = settings.max_open_positions;
  const timeframe = settings.preferred_timeframe;
  const longOnly = settings.long_only;

  return (
    typeof portfolioSize === "number" &&
    Number.isFinite(portfolioSize) &&
    portfolioSize > 0 &&
    typeof riskPercent === "number" &&
    Number.isFinite(riskPercent) &&
    riskPercent > 0 &&
    riskPercent <= 5 &&
    typeof maxRecommendations === "number" &&
    Number.isInteger(maxRecommendations) &&
    maxRecommendations >= 1 &&
    maxRecommendations <= 10 &&
    typeof maxPositions === "number" &&
    Number.isInteger(maxPositions) &&
    maxPositions >= 1 &&
    maxPositions <= 20 &&
    typeof timeframe === "string" &&
    timeframe.trim().length > 0 &&
    timeframe.length <= 80 &&
    typeof longOnly === "boolean"
  );
}

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const [settingsResult, scanRunsResult] = await Promise.all([
    readUserSettings(session.owner_user_id),
    readRecentScheduledScanRuns(),
  ]);
  if (settingsResult.status !== "available" || scanRunsResult.status !== "available") {
    return NextResponse.json({ error: "Settings are unavailable." }, { status: 503 });
  }

  return NextResponse.json(
    { settings: settingsResult.data, scheduled_scan_runs: scanRunsResult.data },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const body = objectBody(await request.json().catch(() => null));
  const settings = body ? allowedSettings(body) : null;
  if (!settings || !validSettings(settings)) {
    return NextResponse.json({ error: "Invalid settings input." }, { status: 400 });
  }

  const result = await createDefaultUserSettings(session.owner_user_id, settings);
  if (result.status !== "available") {
    return NextResponse.json({ error: "Settings could not be created." }, { status: 503 });
  }

  return NextResponse.json({ settings: result.data }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const body = objectBody(await request.json().catch(() => null));
  const id = body?.id;
  const settings = body ? allowedSettings(body) : null;
  if (
    (typeof id !== "string" && typeof id !== "number") ||
    !settings ||
    !validSettings(settings)
  ) {
    return NextResponse.json({ error: "Invalid settings input." }, { status: 400 });
  }

  const result = await updateUserSettings(session.owner_user_id, id, {
    ...settings,
    updated_at: new Date().toISOString(),
  });
  if (result.status !== "available") {
    return NextResponse.json({ error: "Settings could not be saved." }, { status: 503 });
  }

  return NextResponse.json({ settings: result.data });
}
