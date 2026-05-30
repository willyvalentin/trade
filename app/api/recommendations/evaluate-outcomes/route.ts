import { NextResponse } from "next/server";

import { getIntradayCandles } from "@/lib/market-data";
import {
  persistRecommendationOutcome,
  readRecommendationOutcomesFromLocalStorage,
  type RecommendationOutcome,
  type RecommendationOutcomeHorizon,
} from "@/lib/recommendation-outcome-tracker";
import {
  runRecommendationOutcomeEvaluation,
  type RecommendationOutcomeCandleRequest,
  type RecommendationOutcomeCandleResult,
} from "@/lib/recommendation-outcome-evaluation-runner";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { supabase } from "@/lib/supabase";
import { normalizeUnknownError } from "@/lib/error-logging";

type EvaluateOutcomesRequest = {
  snapshots?: unknown;
  existing_outcomes?: unknown;
  horizons?: unknown;
  max_snapshots?: unknown;
};

const allowedHorizons = new Set<RecommendationOutcomeHorizon>([
  "15m",
  "30m",
  "60m",
  "eod",
  "next_open",
  "unknown",
]);

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function booleanValue(value: unknown) {
  return value === true;
}

function parseSnapshot(value: unknown): RecommendationSnapshot | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const fingerprint = stringOrNull(raw.snapshot_fingerprint);
  const id = stringOrNull(raw.id) ?? fingerprint;

  if (!id || !fingerprint) {
    return null;
  }

  return {
    id,
    snapshot_fingerprint: fingerprint,
    recommendation_id: stringOrNull(raw.recommendation_id),
    scan_run_id: stringOrNull(raw.scan_run_id),
    ticker: stringOrNull(raw.ticker)?.toUpperCase() ?? null,
    company_name: stringOrNull(raw.company_name),
    recommended_at: stringOrNull(raw.recommended_at),
    app_timestamp:
      stringOrNull(raw.app_timestamp) ??
      stringOrNull(raw.created_at) ??
      new Date().toISOString(),
    window:
      raw.window === "morning" ||
      raw.window === "midday" ||
      raw.window === "power_hour"
        ? raw.window
        : "unknown",
    status:
      raw.status === "visible" ||
      raw.status === "hidden" ||
      raw.status === "taken" ||
      raw.status === "ignored" ||
      raw.status === "expired" ||
      raw.status === "invalid"
        ? raw.status
        : "unknown",
    source_mode: stringOrNull(raw.source_mode) ?? "unknown",
    data_mode: stringOrNull(raw.data_mode) ?? "unknown",
    market_session_phase: stringOrNull(raw.market_session_phase),
    market_session_risk: stringOrNull(raw.market_session_risk),
    market_session_source: stringOrNull(raw.market_session_source),
    is_visible: raw.is_visible === false ? false : true,
    is_demo: booleanValue(raw.is_demo),
    is_mock: booleanValue(raw.is_mock),
    is_real: booleanValue(raw.is_real),
    entry: finiteNumber(raw.entry),
    entry_low: finiteNumber(raw.entry_low),
    entry_high: finiteNumber(raw.entry_high),
    stop: finiteNumber(raw.stop),
    target: finiteNumber(raw.target),
    side: stringOrNull(raw.side) ?? "unknown",
    risk_per_share: finiteNumber(raw.risk_per_share),
    reward_per_share: finiteNumber(raw.reward_per_share),
    planned_risk_reward: finiteNumber(raw.planned_risk_reward),
    confidence: finiteNumber(raw.confidence) ?? stringOrNull(raw.confidence),
    score: finiteNumber(raw.score) ?? stringOrNull(raw.score),
    rating: stringOrNull(raw.rating),
    label: stringOrNull(raw.label),
    type: stringOrNull(raw.type),
    rationale: stringOrNull(raw.rationale),
    reason: stringOrNull(raw.reason),
    catalyst: stringOrNull(raw.catalyst),
    primary_risk: stringOrNull(raw.primary_risk),
    market_data_snapshot: raw.market_data_snapshot ?? null,
    quote_price: finiteNumber(raw.quote_price),
    volume: finiteNumber(raw.volume),
    liquidity: finiteNumber(raw.liquidity) ?? stringOrNull(raw.liquidity),
    spread: finiteNumber(raw.spread),
    freshness: stringOrNull(raw.freshness),
    data_age_minutes: finiteNumber(raw.data_age_minutes),
    intake_quality_json: raw.intake_quality_json ?? null,
    scan_observability_json: raw.scan_observability_json ?? null,
    empty_state_json: raw.empty_state_json ?? null,
    quality_json:
      typeof raw.quality_json === "object" && raw.quality_json !== null
        ? raw.quality_json
        : null,
    payload_json:
      typeof raw.payload_json === "object" && raw.payload_json !== null
        ? (raw.payload_json as Record<string, unknown>)
        : {},
    was_taken: booleanValue(raw.was_taken),
    linked_position_id: stringOrNull(raw.linked_position_id),
    created_at: stringOrNull(raw.created_at) ?? new Date().toISOString(),
    updated_at: stringOrNull(raw.updated_at) ?? new Date().toISOString(),
  };
}

function parseOutcome(value: unknown): RecommendationOutcome | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = value as Partial<RecommendationOutcome>;

  return typeof raw.id === "string" &&
    typeof raw.snapshot_fingerprint === "string" &&
    typeof raw.horizon === "string"
    ? (raw as RecommendationOutcome)
    : null;
}

function parseHorizons(value: unknown): RecommendationOutcomeHorizon[] {
  if (!Array.isArray(value)) {
    return ["15m", "30m", "60m"];
  }

  const horizons = value.filter(
    (item): item is RecommendationOutcomeHorizon =>
      typeof item === "string" &&
      allowedHorizons.has(item as RecommendationOutcomeHorizon) &&
      item !== "unknown" &&
      item !== "next_open",
  );

  return horizons.length > 0 ? horizons : ["15m", "30m", "60m"];
}

async function loadRecentSupabaseSnapshots() {
  try {
    const { data, error } = await supabase
      .from("recommendation_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !Array.isArray(data)) {
      return [];
    }

    return data.map(parseSnapshot).filter((snapshot): snapshot is RecommendationSnapshot => snapshot !== null);
  } catch {
    return [];
  }
}

async function fetchCandles(
  request: RecommendationOutcomeCandleRequest,
): Promise<RecommendationOutcomeCandleResult> {
  try {
    const candles = await getIntradayCandles(
      request.ticker,
      request.interval,
      new Date(request.start_at),
      new Date(request.end_at),
    );

    return {
      request,
      status: candles.length > 0 ? "available" : "missing_candles",
      candles: candles.map((candle) => ({
        timestamp: candle.timestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      })),
      provider: "twelve_data",
      error: candles.length > 0 ? null : "Provider returned no candles for the requested window.",
      warnings: candles.length > 0 ? [] : ["No candles available for requested window."],
    };
  } catch (error) {
    console.error("[recommendations/evaluate-outcomes] candle_provider_error", {
      source: "twelve_data",
      request,
      error: normalizeUnknownError(error),
    });

    return {
      request,
      status: "provider_error",
      candles: [],
      provider: "twelve_data",
      error: error instanceof Error ? error.message : "Unknown candle provider error.",
      warnings: [],
    };
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | EvaluateOutcomesRequest
    | null;
  const bodySnapshots = Array.isArray(body?.snapshots)
    ? body.snapshots
        .map(parseSnapshot)
        .filter((snapshot): snapshot is RecommendationSnapshot => snapshot !== null)
    : [];
  const snapshots =
    bodySnapshots.length > 0 ? bodySnapshots : await loadRecentSupabaseSnapshots();
  const existingOutcomes = Array.isArray(body?.existing_outcomes)
    ? body.existing_outcomes
        .map(parseOutcome)
        .filter((outcome): outcome is RecommendationOutcome => outcome !== null)
    : readRecommendationOutcomesFromLocalStorage(undefined);
  const maxSnapshots = finiteNumber(body?.max_snapshots);

  const run = await runRecommendationOutcomeEvaluation({
    snapshots,
    existingOutcomes,
    horizons: parseHorizons(body?.horizons),
    maxSnapshots: maxSnapshots === null ? 6 : Math.max(1, Math.min(10, Math.round(maxSnapshots))),
    now: new Date(),
    source: "api",
    provider: "twelve_data",
    fetchCandles,
    persistOutcome: (outcome) =>
      persistRecommendationOutcome(outcome, { supabaseClient: supabase }),
  });

  return NextResponse.json(run);
}
