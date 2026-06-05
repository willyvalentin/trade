import { NextResponse } from "next/server";

import { getIntradayCandles } from "@/lib/market-data";
import { getNewYorkDateString } from "@/lib/intraday-scan-window";
import {
  persistRecommendationOutcome,
  recommendationOutcomeFromPersistenceRow,
  readRecommendationOutcomesFromLocalStorage,
  type RecommendationOutcome,
  type RecommendationOutcomeHorizon,
  type RecommendationOutcomePersistenceResult,
} from "@/lib/recommendation-outcome-tracker";
import {
  runRecommendationOutcomeEvaluation,
  type RecommendationOutcomeCandleRequest,
  type RecommendationOutcomeCandleResult,
} from "@/lib/recommendation-outcome-evaluation-runner";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { recommendationSnapshotFromPersistenceRow } from "@/lib/recommendation-snapshot";
import { supabase } from "@/lib/supabase";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { normalizeUnknownError } from "@/lib/error-logging";

type EvaluateOutcomesRequest = {
  mode?: unknown;
  batch_fingerprint?: unknown;
  dry_run?: unknown;
  snapshots?: unknown;
  existing_outcomes?: unknown;
  horizons?: unknown;
  max_snapshots?: unknown;
};

const outcomeEvaluationRouteVersion = "outcome-evaluation-route-v1.0";
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

function authDiagnostics(request: Request, expectedSecret: string | undefined) {
  return {
    expectedSecretConfigured: Boolean(expectedSecret),
    providedSecretConfigured: Boolean(request.headers.get("x-automation-secret")),
    headerNamesReceived: Array.from(request.headers.keys()).sort(),
    nodeEnv: process.env.NODE_ENV ?? null,
    route_version: outcomeEvaluationRouteVersion,
  };
}

function parseMode(value: unknown) {
  return value === "official_live_today" ? "official_live_today" : "provided_snapshots";
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

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
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

function hasDiagnosticPayload(payload: Record<string, unknown>) {
  return (
    payload.diagnostic_mode === true ||
    payload.not_live_trade_signal === true ||
    payload.visible_in_primary_recommendations === false ||
    payload.batch_type === "diagnostic" ||
    payload.source_mode === "diagnostic"
  );
}

function isOfficialLiveBatch(row: Record<string, unknown>) {
  const payload = objectOrNull(row.payload_json) ?? {};
  const batchType = stringOrNull(row.batch_type) ?? stringOrNull(payload.batch_type);

  return batchType === "official" && !hasDiagnosticPayload(payload);
}

function isOfficialLiveSnapshot(snapshot: RecommendationSnapshot) {
  return (
    !snapshot.is_demo &&
    !snapshot.is_mock &&
    snapshot.status !== "hidden" &&
    snapshot.status !== "invalid" &&
    snapshot.payload_json.batch_type !== "diagnostic" &&
    !hasDiagnosticPayload(snapshot.payload_json)
  );
}

function officialEvaluationSnapshot(snapshot: RecommendationSnapshot) {
  return {
    ...snapshot,
    is_visible: snapshot.status !== "hidden" && snapshot.status !== "invalid",
  };
}

async function loadOfficialLiveSnapshots({
  batchFingerprint,
  now,
}: {
  batchFingerprint: string | null;
  now: Date;
}) {
  const serverSupabase = getServerSupabaseClient();

  if (!serverSupabase.client) {
    return {
      status: "failed" as const,
      error: `server_supabase_unavailable:${serverSupabase.unavailable_reason ?? "unknown"}`,
      batch: null as Record<string, unknown> | null,
      snapshots: [] as RecommendationSnapshot[],
      missing_snapshot_fingerprints: [] as string[],
    };
  }

  try {
    const batchQuery = serverSupabase.client
      .from("recommendation_batches")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(batchFingerprint ? 1 : 20);
    const batchResult = batchFingerprint
      ? await batchQuery.eq("batch_fingerprint", batchFingerprint)
      : await batchQuery.eq("trading_date", getNewYorkDateString(now));

    if (batchResult.error || !Array.isArray(batchResult.data)) {
      return {
        status: "failed" as const,
        error:
          batchResult.error?.message ??
          "Unable to load official recommendation batches.",
        batch: null,
        snapshots: [],
        missing_snapshot_fingerprints: [],
      };
    }

    const batch =
      (batchResult.data as Array<Record<string, unknown>>).find(
        isOfficialLiveBatch,
      ) ?? null;

    if (!batch) {
      return {
        status: "blocked" as const,
        error: batchFingerprint
          ? "No non-diagnostic official batch matched the requested fingerprint."
          : "No non-diagnostic official live batch found for today.",
        batch: null,
        snapshots: [],
        missing_snapshot_fingerprints: [],
      };
    }

    const payload = objectOrNull(batch.payload_json) ?? {};
    const expectedSnapshotFingerprints = Array.from(
      new Set(arrayOfStrings(payload.recommendation_snapshot_fingerprints)),
    );
    const scanRunFingerprint = stringOrNull(batch.scan_run_fingerprint);
    const snapshotQuery = serverSupabase.client
      .from("recommendation_snapshots")
      .select("*")
      .order("created_at", { ascending: false });
    const snapshotResult =
      expectedSnapshotFingerprints.length > 0
        ? await snapshotQuery.in(
            "snapshot_fingerprint",
            expectedSnapshotFingerprints,
          )
        : scanRunFingerprint
          ? await snapshotQuery.eq("scan_run_id", scanRunFingerprint)
          : await snapshotQuery.limit(0);

    if (snapshotResult.error || !Array.isArray(snapshotResult.data)) {
      return {
        status: "failed" as const,
        error:
          snapshotResult.error?.message ??
          "Unable to load official recommendation snapshots.",
        batch,
        snapshots: [],
        missing_snapshot_fingerprints: expectedSnapshotFingerprints,
      };
    }

    const snapshots = (snapshotResult.data as Array<Record<string, unknown>>)
      .map(recommendationSnapshotFromPersistenceRow)
      .filter(
        (snapshot): snapshot is RecommendationSnapshot =>
          snapshot !== null && isOfficialLiveSnapshot(snapshot),
      )
      .map(officialEvaluationSnapshot);
    const foundFingerprints = new Set(
      snapshots.map((snapshot) => snapshot.snapshot_fingerprint),
    );

    return {
      status: snapshots.length > 0 ? ("ready" as const) : ("blocked" as const),
      error: snapshots.length > 0 ? null : "No official snapshot members were available for evaluation.",
      batch,
      snapshots,
      missing_snapshot_fingerprints: expectedSnapshotFingerprints.filter(
        (fingerprint) => !foundFingerprints.has(fingerprint),
      ),
    };
  } catch (error) {
    return {
      status: "failed" as const,
      error:
        error instanceof Error
          ? error.message
          : "Unknown official outcome snapshot load error.",
      batch: null,
      snapshots: [],
      missing_snapshot_fingerprints: [],
    };
  }
}

async function loadSupabaseOutcomes(snapshotFingerprints: string[]) {
  const serverSupabase = getServerSupabaseClient();

  if (!serverSupabase.client || snapshotFingerprints.length === 0) {
    return {
      outcomes: [] as RecommendationOutcome[],
      error: serverSupabase.client
        ? null
        : `server_supabase_unavailable:${serverSupabase.unavailable_reason ?? "unknown"}`,
    };
  }

  try {
    const { data, error } = await serverSupabase.client
      .from("recommendation_outcomes")
      .select("*")
      .in("snapshot_fingerprint", snapshotFingerprints)
      .order("evaluated_at", { ascending: false });

    if (error || !Array.isArray(data)) {
      return {
        outcomes: [],
        error: error?.message ?? "Unable to load recommendation outcomes.",
      };
    }

    return {
      outcomes: (data as Array<Record<string, unknown>>)
        .map(recommendationOutcomeFromPersistenceRow)
        .filter((outcome): outcome is RecommendationOutcome => outcome !== null),
      error: null,
    };
  } catch (error) {
    return {
      outcomes: [],
      error:
        error instanceof Error
          ? error.message
          : "Unknown recommendation outcome readback error.",
    };
  }
}

function outcomeKey(outcome: Pick<RecommendationOutcome, "snapshot_fingerprint" | "horizon">) {
  return `${outcome.snapshot_fingerprint ?? "unknown"}:${outcome.horizon}`;
}

function completenessRank(outcome: RecommendationOutcome) {
  const completeness = outcome.data_completeness;
  if (completeness === "complete") return 3;
  if (completeness === "partial") return 2;
  if (completeness === "none") return 1;
  return 0;
}

function statusRank(outcome: RecommendationOutcome) {
  if (
    outcome.status === "target_before_stop" ||
    outcome.status === "stop_before_target" ||
    outcome.status === "neither_hit" ||
    outcome.status === "entry_not_triggered" ||
    outcome.status === "entry_triggered"
  ) {
    return 3;
  }

  if (outcome.status === "incomplete" || outcome.status === "unknown") return 1;
  if (outcome.status === "pending" || outcome.status === "invalid") return 0;
  return 2;
}

function candleCount(outcome: RecommendationOutcome) {
  const count = finiteNumber(outcome.payload_json.candle_count);
  return count === null ? 0 : count;
}

function hasBetterCoverage(
  nextOutcome: RecommendationOutcome,
  existingOutcome: RecommendationOutcome | undefined,
) {
  if (!existingOutcome) return true;

  const nextScore =
    completenessRank(nextOutcome) * 100 +
    statusRank(nextOutcome) * 10 +
    candleCount(nextOutcome);
  const existingScore =
    completenessRank(existingOutcome) * 100 +
    statusRank(existingOutcome) * 10 +
    candleCount(existingOutcome);

  return nextScore > existingScore;
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
  const routeStartedAt = Date.now();
  const body = (await request.json().catch(() => null)) as
    | EvaluateOutcomesRequest
    | null;
  const mode = parseMode(body?.mode);
  const dryRun = body?.dry_run === true;
  const batchFingerprint = stringOrNull(body?.batch_fingerprint);
  const now = new Date();

  if (mode === "official_live_today") {
    const expectedSecret = process.env.AUTOMATION_SECRET;
    const providedSecret = request.headers.get("x-automation-secret");

    if (!expectedSecret || providedSecret !== expectedSecret) {
      const diagnostics = authDiagnostics(request, expectedSecret);

      console.warn("[recommendations/evaluate-outcomes] unauthorized", diagnostics);

      return NextResponse.json(
        {
          error: "Unauthorized.",
          mode,
          ...diagnostics,
        },
        { status: 401 },
      );
    }
  }

  const bodySnapshots = Array.isArray(body?.snapshots)
    ? body.snapshots
        .map(parseSnapshot)
        .filter((snapshot): snapshot is RecommendationSnapshot => snapshot !== null)
    : [];
  const officialSnapshotLoad =
    mode === "official_live_today"
      ? await loadOfficialLiveSnapshots({ batchFingerprint, now })
      : null;
  const snapshots =
    officialSnapshotLoad !== null
      ? officialSnapshotLoad.snapshots
      : bodySnapshots.length > 0
        ? bodySnapshots
        : await loadRecentSupabaseSnapshots();
  const supabaseOutcomes =
    mode === "official_live_today"
      ? await loadSupabaseOutcomes(
          snapshots.map((snapshot) => snapshot.snapshot_fingerprint),
        )
      : null;
  const existingOutcomes =
    supabaseOutcomes !== null
      ? supabaseOutcomes.outcomes
      : Array.isArray(body?.existing_outcomes)
        ? body.existing_outcomes
            .map(parseOutcome)
            .filter((outcome): outcome is RecommendationOutcome => outcome !== null)
        : readRecommendationOutcomesFromLocalStorage(undefined);
  const maxSnapshots = finiteNumber(body?.max_snapshots);
  const serverSupabase =
    mode === "official_live_today" ? getServerSupabaseClient() : null;
  const existingByKey = new Map(
    existingOutcomes.map((outcome) => [outcomeKey(outcome), outcome]),
  );
  const persistenceEvents: Array<{
    key: string;
    action: "created" | "updated" | "skipped_equal_or_better" | "failed";
    error: string | null;
  }> = [];

  if (mode === "official_live_today" && officialSnapshotLoad?.status !== "ready") {
    const diagnostics = {
      route_version: outcomeEvaluationRouteVersion,
      mode,
      dry_run: dryRun,
      batch_fingerprint: batchFingerprint,
      selected_batch_fingerprint: stringOrNull(
        officialSnapshotLoad?.batch?.batch_fingerprint,
      ),
      evaluated_snapshots_count: 0,
      outcomes_created_count: 0,
      outcomes_updated_count: 0,
      incomplete_count: 0,
      skipped_not_old_enough_count: 0,
      missing_candles_count: 0,
      provider_error_count: 0,
      horizons_evaluated: parseHorizons(body?.horizons),
      tickers_evaluated: [],
      latest_provider_error_type: null,
      elapsed_ms: Date.now() - routeStartedAt,
      persistence_status: dryRun ? "dry_run" : "not_attempted",
      persistence_error: officialSnapshotLoad?.error ?? null,
      missing_snapshot_fingerprints:
        officialSnapshotLoad?.missing_snapshot_fingerprints ?? [],
    };

    return NextResponse.json({
      run_id: `rec_out_eval_${routeStartedAt}`,
      run_version: "1.0",
      status: officialSnapshotLoad?.status === "failed" ? "failed" : "blocked",
      started_at: new Date(routeStartedAt).toISOString(),
      completed_at: new Date().toISOString(),
      horizons: diagnostics.horizons_evaluated,
      source: "api",
      provider: "twelve_data",
      eligible_snapshot_count: 0,
      evaluated_snapshot_count: 0,
      incomplete_snapshot_count: 0,
      missing_candle_count: 0,
      persisted_outcome_count: 0,
      candidates: [],
      outcomes: [],
      warnings: [],
      summary: officialSnapshotLoad?.error ?? "Official outcome evaluation is blocked.",
      ...diagnostics,
      outcome_evaluation: diagnostics,
    });
  }

  const run = await runRecommendationOutcomeEvaluation({
    snapshots,
    existingOutcomes,
    horizons: parseHorizons(body?.horizons),
    maxSnapshots: maxSnapshots === null ? 6 : Math.max(1, Math.min(10, Math.round(maxSnapshots))),
    now,
    source: "api",
    provider: "twelve_data",
    fetchCandles,
    persistOutcome: dryRun
      ? undefined
      : mode === "official_live_today"
        ? async (outcome): Promise<RecommendationOutcomePersistenceResult> => {
            const key = outcomeKey(outcome);
            const existingOutcome = existingByKey.get(key);

            if (!hasBetterCoverage(outcome, existingOutcome)) {
              persistenceEvents.push({
                key,
                action: "skipped_equal_or_better",
                error: null,
              });
              return {
                status: "updated",
                mode: "none",
                outcome,
                error: "existing_outcome_has_equal_or_better_coverage",
              };
            }

            const result = await persistRecommendationOutcome(outcome, {
              supabaseClient: serverSupabase?.client,
              server: true,
              unavailableReason: serverSupabase?.unavailable_reason,
            });

            if (result.status === "failed") {
              persistenceEvents.push({
                key,
                action: "failed",
                error: result.error,
              });
            } else {
              persistenceEvents.push({
                key,
                action: existingOutcome ? "updated" : "created",
                error: null,
              });
              existingByKey.set(key, outcome);
            }

            return result;
          }
        : (outcome) =>
            persistRecommendationOutcome(outcome, { supabaseClient: supabase }),
  });

  const evaluatedSnapshotFingerprints = new Set(
    run.candidates
      .filter((candidate) => candidate.status === "evaluated")
      .map((candidate) => candidate.snapshot_fingerprint)
      .filter((fingerprint): fingerprint is string => fingerprint !== null),
  );
  const skippedNotOldEnoughCount = run.candidates.filter((candidate) =>
    candidate.warnings.some((warning) =>
      warning.toLowerCase().includes("horizon has not elapsed"),
    ),
  ).length;
  const latestProviderError =
    run.candidates.find((candidate) => candidate.status === "provider_error")
      ?.error ?? null;
  const diagnostics = {
    route_version: outcomeEvaluationRouteVersion,
    mode,
    dry_run: dryRun,
    batch_fingerprint:
      stringOrNull(officialSnapshotLoad?.batch?.batch_fingerprint) ??
      batchFingerprint,
    evaluated_snapshots_count: evaluatedSnapshotFingerprints.size,
    evaluated_candidate_count: run.evaluated_snapshot_count,
    outcomes_created_count: persistenceEvents.filter(
      (event) => event.action === "created",
    ).length,
    outcomes_updated_count: persistenceEvents.filter(
      (event) => event.action === "updated",
    ).length,
    incomplete_count: run.incomplete_snapshot_count,
    skipped_not_old_enough_count: skippedNotOldEnoughCount,
    missing_candles_count: run.missing_candle_count,
    provider_error_count: run.provider_error_count,
    horizons_evaluated: run.horizons,
    tickers_evaluated: Array.from(
      new Set(
        run.candidates
          .map((candidate) => candidate.ticker)
          .filter((ticker): ticker is string => ticker !== null),
      ),
    ).sort(),
    latest_provider_error_type: latestProviderError,
    elapsed_ms: Date.now() - routeStartedAt,
    persistence_status: dryRun
      ? "dry_run"
      : persistenceEvents.some((event) => event.action === "failed")
        ? "failed"
        : persistenceEvents.length > 0
          ? "success"
          : "not_attempted",
    persistence_error:
      persistenceEvents.find((event) => event.error !== null)?.error ??
      supabaseOutcomes?.error ??
      null,
    outcomes_skipped_equal_or_better_count: persistenceEvents.filter(
      (event) => event.action === "skipped_equal_or_better",
    ).length,
    missing_snapshot_fingerprints:
      officialSnapshotLoad?.missing_snapshot_fingerprints ?? [],
  };

  return NextResponse.json({
    ...run,
    ...diagnostics,
    outcome_evaluation: diagnostics,
  });
}
