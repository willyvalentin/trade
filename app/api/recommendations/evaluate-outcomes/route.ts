import { NextResponse } from "next/server";
import { summarizeEntryTypeTriggerDiagnostics } from "@/lib/recommendation-entry-type";
import { getIntradayCandlesWithDiagnostics } from "@/lib/market-data";
import { getNewYorkDateString } from "@/lib/intraday-scan-window";
import {
  persistRecommendationOutcome,
  recommendationOutcomeFromPersistenceRow,
  readRecommendationOutcomesFromLocalStorage,
  resolveRecommendationOutcomeSide,
  type RecommendationOutcome,
  type RecommendationOutcomeHorizon,
  type RecommendationOutcomePersistenceResult,
} from "@/lib/recommendation-outcome-tracker";
import {
  runRecommendationOutcomeEvaluation,
  type RecommendationOutcomeCandleRequest,
  type RecommendationOutcomeCandleResult,
} from "@/lib/recommendation-outcome-evaluation-runner";
import { buildPlanReferenceMetadataTrace } from "@/lib/plan-reference-metadata-trace";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  recommendationSnapshotFromPersistenceRow,
  summarizeRecommendationSnapshotShadowEntryTrialMetadata,
} from "@/lib/recommendation-snapshot";
import { supabase } from "@/lib/supabase";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { normalizeUnknownError } from "@/lib/error-logging";
import { buildProviderPlanProfile } from "@/lib/provider-plan-profile";
import { evaluateGrowMaxLearningMode } from "@/lib/grow-max-learning-mode";
import {
  evaluateLearningAccelerationMode,
  shouldIncludeLearningAccelerationOutcomeSample,
} from "@/lib/learning-acceleration-mode";
import {
  buildBatchCandidateAuditSummary,
  type BatchCandidateAuditSummary,
} from "@/lib/batch-candidate-audit";

type EvaluateOutcomesRequest = {
  mode?: unknown;
  batch_fingerprint?: unknown;
  dry_run?: unknown;
  snapshots?: unknown;
  existing_outcomes?: unknown;
  horizons?: unknown;
  max_snapshots?: unknown;
  max_candle_requests?: unknown;
  enrich_completed_outcomes?: unknown;
};

type OutcomeSnapshotIneligibleReason =
  | "diagnostic_dry_run"
  | "duplicate_snapshot_fingerprint"
  | "missing_snapshot_fingerprint"
  | "missing_ticker"
  | "missing_side"
  | "missing_entry"
  | "missing_stop"
  | "missing_target"
  | "missing_recommended_at"
  | "missing_batch_membership"
  | "learning_only_disabled";

type OutcomeEligibilityDiagnostics = {
  total_snapshots_loaded_for_batch: number;
  raw_snapshot_rows: number;
  total_recommendation_rows_loaded_for_batch: number;
  eligible_visible_snapshot_count: number;
  eligible_learning_snapshot_count: number;
  eligible_research_only_snapshot_count: number;
  grow_max_learning_snapshots_included_count: number;
  ineligible_snapshot_count: number;
  ineligible_reasons: Record<string, number>;
  unique_snapshot_fingerprints_count: number;
  unique_learning_ideas: number;
  duplicate_snapshot_fingerprints_count: number;
  duplicate_snapshot_rows: number;
  duplicate_snapshot_rows_ignored_count: number;
  duplicate_snapshot_conflict_count: number;
  duplicate_snapshot_conflict_reasons: Record<string, number>;
  visible_recommendations: number;
  visible_grid_count: number;
  grid_cards: number;
  expected_outcome_rows_from_eligible_snapshots: number;
  batch_candidate_audit: BatchCandidateAuditSummary | null;
  expected_snapshot_count_from_scan: number;
  actual_snapshot_count_for_batch: number;
  missing_snapshot_count: number;
  missing_snapshot_reasons: Record<string, number>;
  strict_batch_filter_excluded_count: number;
  batch_health: string;
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
    expectedSecretLength: expectedSecret ? expectedSecret.length : null,
    providedSecretLength: request.headers.get("x-automation-secret")?.length ?? null,
    headerNamesReceived: Array.from(request.headers.keys()).sort(),
    nodeEnv: process.env.NODE_ENV ?? null,
    route_version: outcomeEvaluationRouteVersion,
  };
}

function parseMode(value: unknown) {
  return value === "official_live_today" || value === "enrich_completed_outcomes"
    ? value
    : "provided_snapshots";
}

function resolveOutcomeProviderBudgetLimit(value: unknown) {
  const providerPlanProfile = buildProviderPlanProfile();
  const explicitLimit = finiteNumber(value);

  if (explicitLimit !== null) {
    const effectiveLimit = Math.max(0, Math.min(50, Math.round(explicitLimit)));

    return {
      providerPlanProfile,
      overrideBudgetLimit: effectiveLimit,
      effectiveBudgetLimit: effectiveLimit,
    };
  }

  const envLimit =
    finiteNumber(process.env.TURE_PROVIDER_OUTCOME_CANDLE_REQUESTS_PER_RUN) ??
    finiteNumber(process.env.TURE_OUTCOME_EVALUATION_MAX_CANDLE_REQUESTS);

  if (envLimit !== null) {
    const effectiveLimit = Math.max(0, Math.min(50, Math.round(envLimit)));

    return {
      providerPlanProfile,
      overrideBudgetLimit: effectiveLimit,
      effectiveBudgetLimit: effectiveLimit,
    };
  }

  return {
    providerPlanProfile,
    overrideBudgetLimit: null,
    effectiveBudgetLimit:
      providerPlanProfile.profile_outcome_candle_requests_per_run,
  };
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

function hasDryRunDiagnosticPayload(payload: Record<string, unknown>) {
  return (
    payload.diagnostic_mode === true ||
    payload.batch_type === "diagnostic" ||
    payload.source_mode === "diagnostic" ||
    payload.diagnostic_run === true ||
    payload.dry_run === true
  );
}

function isOfficialLiveBatch(
  row: Record<string, unknown>,
  options: { includeGrowMaxLearningSnapshots?: boolean } = {},
) {
  const payload = objectOrNull(row.payload_json) ?? {};
  const batchType = stringOrNull(row.batch_type) ?? stringOrNull(payload.batch_type);

  return (
    batchType === "official" &&
    (options.includeGrowMaxLearningSnapshots
      ? !hasDryRunDiagnosticPayload(payload)
      : !hasDiagnosticPayload(payload))
  );
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
  includeGrowMaxLearningSnapshots,
  now,
}: {
  batchFingerprint: string | null;
  includeGrowMaxLearningSnapshots: boolean;
  now: Date;
}) {
  const serverSupabase = getServerSupabaseClient();

  if (!serverSupabase.client) {
    return {
      status: "failed" as const,
      error: `server_supabase_unavailable:${serverSupabase.unavailable_reason ?? "unknown"}`,
      batch: null as Record<string, unknown> | null,
      snapshots: [] as RecommendationSnapshot[],
      recommendation_rows_loaded_count: 0,
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
        (row) =>
          isOfficialLiveBatch(row, {
            includeGrowMaxLearningSnapshots,
          }),
      ) ?? null;

    if (!batch) {
      return {
        status: "blocked" as const,
        error: batchFingerprint
          ? "No non-diagnostic official batch matched the requested fingerprint."
          : "No non-diagnostic official live batch found for today.",
        batch: null,
        snapshots: [],
        recommendation_rows_loaded_count: 0,
        missing_snapshot_fingerprints: [],
      };
    }

    const payload = objectOrNull(batch.payload_json) ?? {};
    const expectedSnapshotFingerprints = Array.from(
      new Set(arrayOfStrings(payload.recommendation_snapshot_fingerprints)),
    );
    const scanRunFingerprint = stringOrNull(batch.scan_run_fingerprint);
    const snapshotRows: Array<Record<string, unknown>> = [];
    const snapshotQueryErrors: string[] = [];

    if (expectedSnapshotFingerprints.length > 0) {
      const snapshotResult = await serverSupabase.client
        .from("recommendation_snapshots")
        .select("*")
        .in("snapshot_fingerprint", expectedSnapshotFingerprints)
        .order("created_at", { ascending: false });

      if (snapshotResult.error || !Array.isArray(snapshotResult.data)) {
        snapshotQueryErrors.push(
          snapshotResult.error?.message ??
            "Unable to load snapshots by batch fingerprint members.",
        );
      } else {
        snapshotRows.push(...(snapshotResult.data as Array<Record<string, unknown>>));
      }
    }

    if (scanRunFingerprint) {
      const snapshotResult = await serverSupabase.client
        .from("recommendation_snapshots")
        .select("*")
        .eq("scan_run_id", scanRunFingerprint)
        .order("created_at", { ascending: false });

      if (snapshotResult.error || !Array.isArray(snapshotResult.data)) {
        snapshotQueryErrors.push(
          snapshotResult.error?.message ??
            "Unable to load snapshots by scan run fingerprint.",
        );
      } else {
        snapshotRows.push(...(snapshotResult.data as Array<Record<string, unknown>>));
      }
    }

    const selectedBatchFingerprint = stringOrNull(batch.batch_fingerprint);
    if (
      includeGrowMaxLearningSnapshots &&
      selectedBatchFingerprint &&
      expectedSnapshotFingerprints.length === 0 &&
      !scanRunFingerprint
    ) {
      const snapshotResult = await serverSupabase.client
        .from("recommendation_snapshots")
        .select("*")
        .contains("payload_json", { batch_fingerprint: selectedBatchFingerprint })
        .order("created_at", { ascending: false });

      if (snapshotResult.error || !Array.isArray(snapshotResult.data)) {
        snapshotQueryErrors.push(
          snapshotResult.error?.message ??
            "Unable to load snapshots by payload batch fingerprint.",
        );
      } else {
        snapshotRows.push(...(snapshotResult.data as Array<Record<string, unknown>>));
      }
    }

    if (snapshotRows.length === 0 && snapshotQueryErrors.length > 0) {
      return {
        status: "failed" as const,
        error: snapshotQueryErrors.join("; "),
        batch,
        snapshots: [],
        recommendation_rows_loaded_count: 0,
        missing_snapshot_fingerprints: expectedSnapshotFingerprints,
      };
    }

    const rawSnapshots = snapshotRows
      .map(recommendationSnapshotFromPersistenceRow)
      .filter(
        (snapshot): snapshot is RecommendationSnapshot =>
          snapshot !== null,
      );
    const snapshots = includeGrowMaxLearningSnapshots
      ? rawSnapshots
      : rawSnapshots
          .filter(isOfficialLiveSnapshot)
          .map(officialEvaluationSnapshot);
    const foundFingerprints = new Set(
      snapshots.map((snapshot) => snapshot.snapshot_fingerprint),
    );
    const recommendationIds = Array.from(
      new Set(
        snapshots
          .map((snapshot) => snapshot.recommendation_id)
          .filter((id): id is string => id !== null),
      ),
    );
    let recommendationRowsLoadedCount = 0;

    if (recommendationIds.length > 0) {
      const recommendationResult = await serverSupabase.client
        .from("recommendations")
        .select("id")
        .in("id", recommendationIds);

      recommendationRowsLoadedCount = Array.isArray(recommendationResult.data)
        ? recommendationResult.data.length
        : 0;
    }

    return {
      status: snapshots.length > 0 ? ("ready" as const) : ("blocked" as const),
      error: snapshots.length > 0 ? null : "No official snapshot members were available for evaluation.",
      batch,
      snapshots,
      recommendation_rows_loaded_count: recommendationRowsLoadedCount,
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
      recommendation_rows_loaded_count: 0,
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

function incrementReason(
  reasons: Record<string, number>,
  reason: OutcomeSnapshotIneligibleReason,
) {
  reasons[reason] = (reasons[reason] ?? 0) + 1;
}

function incrementDiagnosticReason(reasons: Record<string, number>, reason: string) {
  reasons[reason] = (reasons[reason] ?? 0) + 1;
}

function stableDiagnosticJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "undefined";
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableDiagnosticJson).join(",")}]`;
  }

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(
      ([key, entryValue]) =>
        `${JSON.stringify(key)}:${stableDiagnosticJson(entryValue)}`,
    )
    .join(",")}}`;
}

function normalizedTicker(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? null;
}

function duplicateSnapshotConflictReasons(
  first: RecommendationSnapshot,
  next: RecommendationSnapshot,
) {
  const reasons: string[] = [];

  if (normalizedTicker(first.ticker) !== normalizedTicker(next.ticker)) {
    reasons.push("mismatched_ticker");
  }

  if (finiteNumber(first.entry) !== finiteNumber(next.entry)) {
    reasons.push("mismatched_entry");
  }

  if (finiteNumber(first.stop) !== finiteNumber(next.stop)) {
    reasons.push("mismatched_stop");
  }

  if (finiteNumber(first.target) !== finiteNumber(next.target)) {
    reasons.push("mismatched_target");
  }

  if (
    stableDiagnosticJson(first.payload_json) !==
    stableDiagnosticJson(next.payload_json)
  ) {
    reasons.push("conflicting_payload");
  }

  return reasons;
}

function snapshotPayloadHasBatchMembership(
  snapshot: RecommendationSnapshot,
  batchFingerprint: string | null,
) {
  if (!batchFingerprint) return false;

  const payload = snapshot.payload_json;
  const directValues = [
    payload.batch_fingerprint,
    payload.recommendation_batch_fingerprint,
  ];

  if (
    directValues.some(
      (value) => typeof value === "string" && value.trim() === batchFingerprint,
    )
  ) {
    return true;
  }

  try {
    return JSON.stringify(payload).includes(batchFingerprint);
  } catch {
    return false;
  }
}

function isDiagnosticDryRunSnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.is_demo === true ||
    snapshot.is_mock === true ||
    snapshot.source_mode === "diagnostic" ||
    snapshot.status === "invalid" ||
    hasDryRunDiagnosticPayload(payload)
  );
}

function isResearchOnlySnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.source_mode === "research_only" ||
    snapshot.data_mode === "research_only" ||
    payload.visibility_status === "research_only" ||
    payload.learning_acceleration_sample === true ||
    payload.research_only === true ||
    payload.source_mode === "research_only" ||
    payload.learning_scope === "research_only"
  );
}

function isLearningOnlySnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.source_mode === "learning_only" ||
    snapshot.data_mode === "learning_only" ||
    snapshot.is_visible === false ||
    snapshot.status === "hidden" ||
    payload.learning_only === true ||
    payload.source_mode === "learning_only" ||
    payload.visible_in_primary_recommendations === false ||
    payload.grow_max_learning_mode === true
  );
}

function hasSnapshotBatchMembership({
  batchFingerprint,
  batchSnapshotFingerprints,
  scanRunFingerprint,
  snapshot,
}: {
  batchFingerprint: string | null;
  batchSnapshotFingerprints: Set<string>;
  scanRunFingerprint: string | null;
  snapshot: RecommendationSnapshot;
}) {
  return (
    batchFingerprint === null ||
    batchSnapshotFingerprints.has(snapshot.snapshot_fingerprint) ||
    (scanRunFingerprint !== null && snapshot.scan_run_id === scanRunFingerprint) ||
    snapshotPayloadHasBatchMembership(snapshot, batchFingerprint)
  );
}

function nestedObject(
  root: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> | null {
  return objectOrNull(root?.[key]);
}

function nestedNumber(root: Record<string, unknown> | null, path: string[]) {
  let current: unknown = root;

  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return null;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return finiteNumber(current);
}

function buildSnapshotLineageItem({
  batch,
  recommendationBuildPath,
  snapshot,
  eligibilityStatus,
}: {
  batch: Record<string, unknown> | null;
  recommendationBuildPath: string | null;
  snapshot: RecommendationSnapshot;
  eligibilityStatus: string;
}) {
  const payload = snapshot.payload_json;
  const recommendation = objectOrNull(payload.recommendation);
  const source = objectOrNull(payload.source);
  const target = objectOrNull(payload.day_trade_window_recommendation_target);

  return {
    scan_run_fingerprint:
      snapshot.scan_run_id ??
      stringOrNull(payload.scan_run_fingerprint) ??
      stringOrNull(batch?.scan_run_fingerprint),
    batch_fingerprint:
      stringOrNull(payload.batch_fingerprint) ??
      stringOrNull(batch?.batch_fingerprint),
    recommendation_id: snapshot.recommendation_id,
    snapshot_fingerprint: snapshot.snapshot_fingerprint,
    ticker: snapshot.ticker,
    candidate_source: stringOrNull(source?.source_mode) ?? snapshot.source_mode,
    universe_source:
      stringOrNull(payload.universe_source) ??
      stringOrNull(payload.automation_source) ??
      null,
    recommendation_build_path: recommendationBuildPath,
    publish_decision:
      snapshot.is_visible === false || snapshot.status === "hidden"
        ? "hidden"
        : "published",
    publish_tier:
      stringOrNull(recommendation?.tier) ??
      stringOrNull(target?.tier) ??
      stringOrNull(target?.recommendation_tier),
    visibility_status:
      snapshot.is_visible === false ? "hidden" : snapshot.status ?? "visible",
    archive_status:
      snapshot.status === "expired" || snapshot.status === "hidden"
        ? snapshot.status
        : "active",
    outcome_eligibility_status: eligibilityStatus,
  };
}

function buildOutcomeBatchCandidateAudit({
  batch,
  diagnostics,
  missingSnapshotFingerprints,
  snapshots,
  eligibleSnapshots,
}: {
  batch: Record<string, unknown> | null;
  diagnostics: Pick<
    OutcomeEligibilityDiagnostics,
    | "total_recommendation_rows_loaded_for_batch"
    | "raw_snapshot_rows"
    | "unique_snapshot_fingerprints_count"
    | "visible_grid_count"
    | "eligible_learning_snapshot_count"
    | "eligible_research_only_snapshot_count"
    | "ineligible_snapshot_count"
    | "ineligible_reasons"
  >;
  missingSnapshotFingerprints: string[];
  snapshots: RecommendationSnapshot[];
  eligibleSnapshots: RecommendationSnapshot[];
}) {
  const payload = objectOrNull(batch?.payload_json) ?? {};
  const scanRun = nestedObject(payload, "scan_run");
  const ranking = nestedObject(payload, "scanner_candidate_ranking");
  const trace = nestedObject(payload, "active_scan_trace");
  const traceRaw = nestedObject(trace, "raw_candidates");
  const traceRanking = nestedObject(trace, "ranking");
  const traceFinal = nestedObject(trace, "final");
  const expectedSnapshotFingerprints = arrayOfStrings(
    payload.recommendation_snapshot_fingerprints,
  );
  const published =
    nestedNumber(traceFinal, ["recommendations_published_count"]) ??
    finiteNumber(scanRun?.recommendations_published_count) ??
    expectedSnapshotFingerprints.length;
  const recommendationBuildPath =
    stringOrNull(traceFinal?.recommendation_build_path) ??
    stringOrNull(payload.recommendation_build_path);
  const eligibleFingerprints = new Set(
    eligibleSnapshots.map((snapshot) => snapshot.snapshot_fingerprint),
  );
  const ineligibleByFingerprint = new Map<string, string>();

  for (const snapshot of snapshots) {
    ineligibleByFingerprint.set(
      snapshot.snapshot_fingerprint,
      eligibleFingerprints.has(snapshot.snapshot_fingerprint)
        ? "eligible"
        : "ineligible",
    );
  }

  return buildBatchCandidateAuditSummary({
    scanRunFingerprint:
      stringOrNull(batch?.scan_run_fingerprint) ??
      stringOrNull(scanRun?.run_fingerprint) ??
      stringOrNull(traceFinal?.scan_run_fingerprint),
    batchFingerprint:
      stringOrNull(batch?.batch_fingerprint) ??
      stringOrNull(traceFinal?.batch_fingerprint),
    rawCandidatesCount:
      nestedNumber(traceRaw, ["raw_candidate_count"]) ??
      finiteNumber(scanRun?.raw_candidate_count),
    rankedCandidatesCount:
      nestedNumber(traceRanking, ["ranked_count"]) ??
      finiteNumber(ranking?.candidates_ranked),
    selectedCandidatesCount:
      nestedNumber(traceRanking, ["selected_count"]) ??
      finiteNumber(ranking?.selected_count),
    builtRecommendationsCount:
      nestedNumber(traceFinal, ["recommendations_built_count"]) ?? published,
    publishedRecommendationsCount: published,
    persistedRecommendationRowsCount:
      diagnostics.total_recommendation_rows_loaded_for_batch,
    persistedSnapshotRowsCount: diagnostics.raw_snapshot_rows,
    uniqueSnapshotFingerprintsCount: diagnostics.unique_snapshot_fingerprints_count,
    visibleGridCardsCount: diagnostics.visible_grid_count,
    hiddenArchivedCount: Math.max(
      0,
      diagnostics.unique_snapshot_fingerprints_count -
        diagnostics.visible_grid_count -
        diagnostics.eligible_learning_snapshot_count -
        diagnostics.eligible_research_only_snapshot_count,
    ),
    outcomeEligibleSnapshotCount: eligibleSnapshots.length,
    outcomeIneligibleSnapshotCount: diagnostics.ineligible_snapshot_count,
    expectedSnapshotCountFromScan: expectedSnapshotFingerprints.length || published,
    actualSnapshotCountForBatch: snapshots.length,
    strictBatchFilterExcludedCount:
      diagnostics.ineligible_reasons.missing_batch_membership ?? 0,
    incompletePricePlanCount:
      nestedNumber(traceRaw, ["invalid_price_plan_count"]) ?? 0,
    missingSnapshotReasons: {
      ...diagnostics.ineligible_reasons,
      ...(missingSnapshotFingerprints.length > 0
        ? { persistence_failed: missingSnapshotFingerprints.length }
        : {}),
      ...(!stringOrNull(batch?.batch_fingerprint)
        ? { missing_batch_fingerprint: 1 }
        : {}),
    },
    lineage: snapshots.slice(0, 25).map((snapshot) =>
      buildSnapshotLineageItem({
        batch,
        recommendationBuildPath,
        snapshot,
        eligibilityStatus:
          ineligibleByFingerprint.get(snapshot.snapshot_fingerprint) ?? "unknown",
      }),
    ),
  });
}

export function buildOutcomeEligibility({
  batch,
  growMaxLearningModeEnabled,
  horizons,
  recommendationRowsLoadedCount,
  snapshots,
}: {
  batch: Record<string, unknown> | null;
  growMaxLearningModeEnabled: boolean;
  horizons: RecommendationOutcomeHorizon[];
  recommendationRowsLoadedCount: number;
  snapshots: RecommendationSnapshot[];
}) {
  const payload = objectOrNull(batch?.payload_json) ?? {};
  const batchFingerprint = stringOrNull(batch?.batch_fingerprint);
  const batchSnapshotFingerprints = new Set(
    arrayOfStrings(payload.recommendation_snapshot_fingerprints),
  );
  const scanRunFingerprint = stringOrNull(batch?.scan_run_fingerprint);
  const seenFingerprints = new Set<string>();
  const uniqueFingerprints = new Set<string>();
  const firstSnapshotByFingerprint = new Map<string, RecommendationSnapshot>();
  const ineligibleReasons: Record<string, number> = {};
  const duplicateConflictReasons: Record<string, number> = {};
  const eligibleSnapshots: RecommendationSnapshot[] = [];
  let eligibleVisibleSnapshotCount = 0;
  let eligibleLearningSnapshotCount = 0;
  let eligibleResearchOnlySnapshotCount = 0;
  let duplicateSnapshotFingerprintsCount = 0;
  let duplicateSnapshotConflictCount = 0;

  for (const snapshot of snapshots) {
    const reasons: OutcomeSnapshotIneligibleReason[] = [];
    const fingerprint =
      typeof snapshot.snapshot_fingerprint === "string" &&
      snapshot.snapshot_fingerprint.trim().length > 0
        ? snapshot.snapshot_fingerprint
        : null;

    if (!fingerprint) {
      reasons.push("missing_snapshot_fingerprint");
    } else {
      uniqueFingerprints.add(fingerprint);
      if (seenFingerprints.has(fingerprint)) {
        duplicateSnapshotFingerprintsCount += 1;
        const firstSnapshot = firstSnapshotByFingerprint.get(fingerprint);
        const conflictReasons = firstSnapshot
          ? duplicateSnapshotConflictReasons(firstSnapshot, snapshot)
          : [];
        if (conflictReasons.length > 0) {
          duplicateSnapshotConflictCount += 1;
          for (const conflictReason of conflictReasons) {
            incrementDiagnosticReason(duplicateConflictReasons, conflictReason);
          }
        }
        reasons.push("duplicate_snapshot_fingerprint");
      }
    }

    if (isDiagnosticDryRunSnapshot(snapshot)) {
      reasons.push("diagnostic_dry_run");
    }

    if (!snapshot.ticker) {
      reasons.push("missing_ticker");
    }

    const side = resolveRecommendationOutcomeSide({ snapshot }).side;
    if (side !== "long" && side !== "short") {
      reasons.push("missing_side");
    }

    if (snapshot.entry === null) {
      reasons.push("missing_entry");
    }
    if (snapshot.stop === null) {
      reasons.push("missing_stop");
    }
    if (snapshot.target === null) {
      reasons.push("missing_target");
    }
    if (!snapshot.recommended_at) {
      reasons.push("missing_recommended_at");
    }

    if (
      !hasSnapshotBatchMembership({
        batchFingerprint,
        batchSnapshotFingerprints,
        scanRunFingerprint,
        snapshot,
      })
    ) {
      reasons.push("missing_batch_membership");
    }

    const researchOnly = isResearchOnlySnapshot(snapshot);
    const learningOnly = !researchOnly && isLearningOnlySnapshot(snapshot);

    if (
      !shouldIncludeLearningAccelerationOutcomeSample({
        growMaxLearningModeEnabled,
        learningAccelerationEnabled: growMaxLearningModeEnabled,
        researchOnly,
        learningOnly,
      })
    ) {
      reasons.push("learning_only_disabled");
    }

    if (reasons.length > 0) {
      for (const reason of reasons) {
        incrementReason(ineligibleReasons, reason);
      }
      if (fingerprint) {
        seenFingerprints.add(fingerprint);
        if (!firstSnapshotByFingerprint.has(fingerprint)) {
          firstSnapshotByFingerprint.set(fingerprint, snapshot);
        }
      }
      continue;
    }

    const visible =
      snapshot.is_visible !== false &&
      snapshot.status !== "hidden" &&
      !researchOnly &&
      !learningOnly;

    if (visible) {
      eligibleVisibleSnapshotCount += 1;
    }
    if (learningOnly) {
      eligibleLearningSnapshotCount += 1;
    }
    if (researchOnly) {
      eligibleResearchOnlySnapshotCount += 1;
    }

    eligibleSnapshots.push({
      ...snapshot,
      is_visible:
        growMaxLearningModeEnabled && (learningOnly || researchOnly)
          ? true
          : snapshot.is_visible,
    });
    if (fingerprint) {
      seenFingerprints.add(fingerprint);
      if (!firstSnapshotByFingerprint.has(fingerprint)) {
        firstSnapshotByFingerprint.set(fingerprint, snapshot);
      }
    }
  }

  const duplicateSnapshotRowsIgnoredCount = Math.max(
    0,
    duplicateSnapshotFingerprintsCount - duplicateSnapshotConflictCount,
  );
  const batchHealth =
    duplicateSnapshotConflictCount > 0
      ? "grow_max_duplicate_conflicts"
      : duplicateSnapshotFingerprintsCount > 0 && eligibleSnapshots.length > 0
        ? "grow_max_deduped"
        : eligibleSnapshots.length > 0
          ? "eligible"
          : "no_eligible_snapshots";

  const diagnosticsBase: Omit<
    OutcomeEligibilityDiagnostics,
    | "batch_candidate_audit"
    | "expected_snapshot_count_from_scan"
    | "actual_snapshot_count_for_batch"
    | "missing_snapshot_count"
    | "missing_snapshot_reasons"
    | "strict_batch_filter_excluded_count"
  > = {
    total_snapshots_loaded_for_batch: snapshots.length,
    raw_snapshot_rows: snapshots.length,
    total_recommendation_rows_loaded_for_batch: recommendationRowsLoadedCount,
    eligible_visible_snapshot_count: eligibleVisibleSnapshotCount,
    eligible_learning_snapshot_count: eligibleLearningSnapshotCount,
    eligible_research_only_snapshot_count: eligibleResearchOnlySnapshotCount,
    grow_max_learning_snapshots_included_count: growMaxLearningModeEnabled
      ? eligibleSnapshots.length
      : 0,
    ineligible_snapshot_count: snapshots.length - eligibleSnapshots.length,
    ineligible_reasons: ineligibleReasons,
    unique_snapshot_fingerprints_count: uniqueFingerprints.size,
    unique_learning_ideas: eligibleSnapshots.length,
    duplicate_snapshot_fingerprints_count: duplicateSnapshotFingerprintsCount,
    duplicate_snapshot_rows: duplicateSnapshotFingerprintsCount,
    duplicate_snapshot_rows_ignored_count: duplicateSnapshotRowsIgnoredCount,
    duplicate_snapshot_conflict_count: duplicateSnapshotConflictCount,
    duplicate_snapshot_conflict_reasons: duplicateConflictReasons,
    visible_recommendations: eligibleVisibleSnapshotCount,
    visible_grid_count: eligibleVisibleSnapshotCount,
    grid_cards: eligibleVisibleSnapshotCount,
    expected_outcome_rows_from_eligible_snapshots:
      eligibleSnapshots.length * horizons.length,
    batch_health: batchHealth,
  };
  const batchCandidateAudit = buildOutcomeBatchCandidateAudit({
    batch,
    diagnostics: diagnosticsBase,
    missingSnapshotFingerprints: [],
    snapshots,
    eligibleSnapshots,
  });
  const diagnostics: OutcomeEligibilityDiagnostics = {
    ...diagnosticsBase,
    batch_candidate_audit: batchCandidateAudit,
    expected_snapshot_count_from_scan:
      batchCandidateAudit.expected_snapshot_count_from_scan,
    actual_snapshot_count_for_batch:
      batchCandidateAudit.actual_snapshot_count_for_batch,
    missing_snapshot_count: batchCandidateAudit.missing_snapshot_count,
    missing_snapshot_reasons: batchCandidateAudit.missing_snapshot_reasons,
    strict_batch_filter_excluded_count:
      batchCandidateAudit.strict_batch_filter_excluded_count,
  };

  return {
    diagnostics,
    eligibleSnapshots,
  };
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
    outcome.status === "target_hit" ||
    outcome.status === "stop_hit" ||
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

function isMarketReferenceImmediateOutcome(outcome: RecommendationOutcome) {
  return (
    outcome.payload_json.entry_type === "market_reference" &&
    outcome.payload_json.entry_trigger_semantics === "immediate_reference"
  );
}

function hasOfficialTriggerSemanticsUpgrade(
  nextOutcome: RecommendationOutcome,
  existingOutcome: RecommendationOutcome | undefined,
) {
  if (!existingOutcome) return false;
  if (!isMarketReferenceImmediateOutcome(nextOutcome)) return false;

  return (
    nextOutcome.payload_json.official_trigger_semantics_used ===
      "immediate_reference" &&
    (existingOutcome.payload_json.official_trigger_semantics_used !==
      "immediate_reference" ||
      (existingOutcome.entry_triggered === false &&
        nextOutcome.entry_triggered === true))
  );
}

function candleCount(outcome: RecommendationOutcome) {
  const count = finiteNumber(outcome.payload_json.candle_count);
  return count === null ? 0 : count;
}

function hasRetainedCounterfactualCandles(outcome: RecommendationOutcome) {
  return (
    outcome.payload_json.retained_candles_available === true ||
    outcome.payload_json.counterfactual_ready === true ||
    (Array.isArray(outcome.payload_json.counterfactual_candles) &&
      outcome.payload_json.counterfactual_candles.length > 0)
  );
}

function hasBetterCoverage(
  nextOutcome: RecommendationOutcome,
  existingOutcome: RecommendationOutcome | undefined,
) {
  if (!existingOutcome) return true;
  if (hasOfficialTriggerSemanticsUpgrade(nextOutcome, existingOutcome)) {
    return true;
  }

  const nextScore =
    completenessRank(nextOutcome) * 100 +
    statusRank(nextOutcome) * 10 +
    candleCount(nextOutcome);
  const existingScore =
    completenessRank(existingOutcome) * 100 +
    statusRank(existingOutcome) * 10 +
    candleCount(existingOutcome);

  if (nextScore > existingScore) return true;

  return (
    nextScore === existingScore &&
    nextOutcome.status === existingOutcome.status &&
    !hasRetainedCounterfactualCandles(existingOutcome) &&
    hasRetainedCounterfactualCandles(nextOutcome)
  );
}

function sideReadSource(outcome: RecommendationOutcome) {
  return stringOrNull(outcome.payload_json.side_read_source) ?? "missing";
}

function sideReadSourceBreakdown(outcomes: RecommendationOutcome[]) {
  return outcomes.reduce<Record<string, number>>((breakdown, outcome) => {
    const source = sideReadSource(outcome);
    breakdown[source] = (breakdown[source] ?? 0) + 1;
    return breakdown;
  }, {});
}

function isMissingSideOutcome(outcome: RecommendationOutcome) {
  return (
    sideReadSource(outcome) === "missing" ||
    outcome.blockers.some((blocker) =>
      blocker.toLowerCase().includes("side is unavailable"),
    )
  );
}

function upsertConstraintReady({
  dryRun,
  persistenceEvents,
}: {
  dryRun: boolean;
  persistenceEvents: Array<{ action: string; error: string | null }>;
}) {
  const constraintError = persistenceEvents.some((event) =>
    (event.error ?? "").toLowerCase().includes("no unique or exclusion constraint"),
  );

  if (constraintError) return false;
  if (dryRun) return null;

  return persistenceEvents.length > 0 ? true : null;
}

async function fetchCandles(
  request: RecommendationOutcomeCandleRequest,
): Promise<RecommendationOutcomeCandleResult> {
  try {
    const { candles, diagnostics } = await getIntradayCandlesWithDiagnostics(
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
      diagnostics: {
        ticker: request.ticker,
        ...diagnostics,
      },
    };
  } catch (error) {
    const normalizedError = normalizeUnknownError(error);
    const errorText = normalizedError.message.toLowerCase();
    const providerLimit =
      errorText.includes("rate limit") ||
      errorText.includes("api limit") ||
      errorText.includes("credit");

    console.error("[recommendations/evaluate-outcomes] candle_provider_error", {
      source: "twelve_data",
      request,
      error: normalizedError,
    });

    return {
      request,
      status: "provider_error",
      candles: [],
      provider: "twelve_data",
      error: normalizedError.message,
      warnings: [],
      diagnostics: {
        ticker: request.ticker,
        provider: "twelve_data",
        interval: request.interval,
        start_at: request.start_at,
        end_at: request.end_at,
        timezone: "America/New_York",
        raw_provider_params: {
          symbol: request.ticker,
          interval: request.interval,
          start_at: request.start_at,
          end_at: request.end_at,
          timezone: "America/New_York",
        },
        response_status: "provider_error",
        response_category: providerLimit ? "provider_limit" : "provider_error",
        returned_candle_count: 0,
        first_candle_time: null,
        last_candle_time: null,
        provider_message: normalizedError.message,
      },
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
  const enrichmentMode =
    body?.enrich_completed_outcomes === true ||
    mode === "enrich_completed_outcomes";
  const batchFingerprint = stringOrNull(body?.batch_fingerprint);
  const now = new Date();
  const providerBudgetResolution = resolveOutcomeProviderBudgetLimit(
    body?.max_candle_requests,
  );
  const providerPlanProfile = providerBudgetResolution.providerPlanProfile;
  const growMaxLearningMode = evaluateGrowMaxLearningMode({
    providerPlanProfileMode: providerPlanProfile.effective_mode,
  });
  const growMaxLearningModeEnabled = growMaxLearningMode.grow_max_learning_mode;
  const learningAccelerationMode = evaluateLearningAccelerationMode({
    growMaxLearningModeEnabled,
  });
  const learningAccelerationEnabled =
    learningAccelerationMode.learning_acceleration_enabled;
  const includeLearningSnapshots =
    growMaxLearningModeEnabled || learningAccelerationEnabled;
  const providerBudgetLimit = includeLearningSnapshots
    ? Math.min(25, providerBudgetResolution.effectiveBudgetLimit)
    : providerBudgetResolution.effectiveBudgetLimit;
  const horizons = parseHorizons(body?.horizons);

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

  const bodySnapshots = Array.isArray(body?.snapshots)
    ? body.snapshots
        .map(parseSnapshot)
        .filter((snapshot): snapshot is RecommendationSnapshot => snapshot !== null)
    : [];
  const officialSnapshotLoad =
    mode === "official_live_today" || mode === "enrich_completed_outcomes"
      ? await loadOfficialLiveSnapshots({
          batchFingerprint,
          includeGrowMaxLearningSnapshots: includeLearningSnapshots,
          now,
        })
      : null;
  const snapshots =
    officialSnapshotLoad !== null
      ? officialSnapshotLoad.snapshots
      : bodySnapshots.length > 0
        ? bodySnapshots
        : await loadRecentSupabaseSnapshots();
  const eligibility = buildOutcomeEligibility({
    batch: officialSnapshotLoad?.batch ?? null,
    growMaxLearningModeEnabled: includeLearningSnapshots,
    horizons,
    recommendationRowsLoadedCount:
      officialSnapshotLoad?.recommendation_rows_loaded_count ?? 0,
    snapshots,
  });
  const eligibleSnapshots =
    mode === "official_live_today" || mode === "enrich_completed_outcomes"
      ? eligibility.eligibleSnapshots
      : snapshots;
  const batchCandidateAudit = buildOutcomeBatchCandidateAudit({
    batch: officialSnapshotLoad?.batch ?? null,
    diagnostics: eligibility.diagnostics,
    missingSnapshotFingerprints:
      officialSnapshotLoad?.missing_snapshot_fingerprints ?? [],
    snapshots,
    eligibleSnapshots,
  });
  const eligibilityDiagnostics: OutcomeEligibilityDiagnostics = {
    ...eligibility.diagnostics,
    batch_candidate_audit: batchCandidateAudit,
    expected_snapshot_count_from_scan:
      batchCandidateAudit.expected_snapshot_count_from_scan,
    actual_snapshot_count_for_batch:
      batchCandidateAudit.actual_snapshot_count_for_batch,
    missing_snapshot_count: batchCandidateAudit.missing_snapshot_count,
    missing_snapshot_reasons: batchCandidateAudit.missing_snapshot_reasons,
    strict_batch_filter_excluded_count:
      batchCandidateAudit.strict_batch_filter_excluded_count,
  };
  const shadowSnapshotSummary =
    summarizeRecommendationSnapshotShadowEntryTrialMetadata(eligibleSnapshots);
  const supabaseOutcomes =
    mode === "official_live_today" || mode === "enrich_completed_outcomes"
      ? await loadSupabaseOutcomes(
          eligibleSnapshots.map((snapshot) => snapshot.snapshot_fingerprint),
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
    mode === "official_live_today" || mode === "enrich_completed_outcomes"
      ? getServerSupabaseClient()
      : null;
  const existingByKey = new Map(
    existingOutcomes.map((outcome) => [outcomeKey(outcome), outcome]),
  );
  const persistenceEvents: Array<{
    key: string;
    action: "created" | "updated" | "skipped_equal_or_better" | "failed";
    error: string | null;
  }> = [];

  if (
    (mode === "official_live_today" || mode === "enrich_completed_outcomes") &&
    (officialSnapshotLoad?.status !== "ready" || eligibleSnapshots.length === 0)
  ) {
    const planReferenceMetadataTrace = buildPlanReferenceMetadataTrace({
      snapshots,
      candidates: [],
      outcomes: existingOutcomes,
      batchFingerprint:
        stringOrNull(officialSnapshotLoad?.batch?.batch_fingerprint) ??
        batchFingerprint,
      scanRunFingerprint: stringOrNull(
        officialSnapshotLoad?.batch?.scan_run_fingerprint,
      ),
    });
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
      side_read_source: {},
      side_missing_count: 0,
      side_inferred_count: 0,
      invalid_due_to_missing_side_count: 0,
      upsert_constraint_ready: null,
      latest_provider_error_type: null,
      provider_plan_mode: providerPlanProfile.mode,
      provider_plan_profile_mode: providerPlanProfile.effective_mode,
      provider_plan_profile_source: providerPlanProfile.source,
      grow_max_learning_mode: growMaxLearningModeEnabled,
      grow_max_learning_mode_enabled_source:
        growMaxLearningMode.grow_max_learning_mode_enabled_source,
      learning_acceleration_enabled: learningAccelerationEnabled,
      learning_acceleration_enabled_source:
        learningAccelerationMode.learning_acceleration_enabled_source,
      learning_acceleration_env_raw_present:
        learningAccelerationMode.learning_acceleration_env_raw_present,
      learning_acceleration_env_raw_value_category:
        learningAccelerationMode.learning_acceleration_env_raw_value_category,
      learning_acceleration_env_raw_value_normalized:
        learningAccelerationMode.learning_acceleration_env_raw_value_normalized,
      learning_acceleration_runtime_environment:
        learningAccelerationMode.learning_acceleration_runtime_environment,
      learning_acceleration_mode:
        learningAccelerationMode.learning_acceleration_mode,
      learning_acceleration_samples_evaluated:
        eligibilityDiagnostics.eligible_research_only_snapshot_count,
      server_plan_mode: providerPlanProfile.server_plan_mode,
      public_plan_mode: providerPlanProfile.public_plan_mode,
      plan_mode_mismatch: providerPlanProfile.plan_mode_mismatch,
      profile_budget_limit:
        providerPlanProfile.profile_outcome_candle_requests_per_run,
      override_budget_limit: providerBudgetResolution.overrideBudgetLimit,
      effective_budget_limit: providerBudgetLimit,
      ...eligibilityDiagnostics,
      candle_requests_planned: 0,
      candle_requests_executed: 0,
      candle_requests_saved_by_reuse: 0,
      provider_budget_limit: providerBudgetLimit,
      skipped_due_to_budget_count: 0,
      pending_provider_budget_count: 0,
      retry_incomplete_count: 0,
      unique_candle_requests_count: 0,
      empty_candle_response_count: 0,
      provider_limit_count: 0,
      candle_request_debug_sample: [],
      outcome_provider_budget_status:
        providerBudgetLimit === 0 ? "blocked_by_budget" : "not_started",
      next_retry_suggestion:
        providerBudgetLimit === 0
          ? "Increase the diagnostic candle request budget or retry after provider budget resets."
          : null,
      elapsed_ms: Date.now() - routeStartedAt,
      persistence_status: dryRun ? "dry_run" : "not_attempted",
      persistence_error: officialSnapshotLoad?.error ?? null,
      missing_snapshot_fingerprints:
        officialSnapshotLoad?.missing_snapshot_fingerprints ?? [],
      enrichment_mode: enrichmentMode,
      completed_outcomes_seen_count: 0,
      completed_outcomes_enriched_count: 0,
      completed_outcomes_skipped_already_enriched_count: 0,
      retained_candles_added_count: 0,
      counterfactual_ready_count: 0,
      shadow_eligible_snapshot_count:
        shadowSnapshotSummary.shadow_snapshot_metadata_present_count,
      shadow_missing_metadata_count:
        shadowSnapshotSummary.shadow_snapshot_metadata_missing_count,
      shadow_entry_trial_count: 0,
      shadow_entry_triggered_count: 0,
      entry_type_trigger_summary: summarizeEntryTypeTriggerDiagnostics([]),
      plan_reference_metadata_trace: planReferenceMetadataTrace,
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
      summary:
        officialSnapshotLoad?.error ??
        (eligibleSnapshots.length === 0
          ? "No structurally valid batch snapshots were eligible for outcome evaluation."
          : "Official outcome evaluation is blocked."),
      ...diagnostics,
      outcome_evaluation: diagnostics,
    });
  }

  const run = await runRecommendationOutcomeEvaluation({
    snapshots: eligibleSnapshots,
    existingOutcomes,
    horizons,
    maxSnapshots:
      maxSnapshots === null
        ? includeLearningSnapshots
          ? Math.max(1, eligibleSnapshots.length)
          : 6
        : Math.max(
            1,
            Math.min(
              includeLearningSnapshots ? eligibleSnapshots.length : 10,
              Math.round(maxSnapshots),
            ),
          ),
    maxCandleRequests: providerBudgetLimit,
    now,
    source: "api",
    provider: "twelve_data",
    enrichCompletedOutcomes: enrichmentMode,
    fetchCandles,
    persistOutcome: dryRun
      ? undefined
      : mode === "official_live_today" || mode === "enrich_completed_outcomes"
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
  const sideMissingCount = run.outcomes.filter(isMissingSideOutcome).length;
  const sideInferredCount = run.outcomes.filter(
    (outcome) => outcome.payload_json.side_inferred === true,
  ).length;
  const invalidDueToMissingSideCount = run.outcomes.filter(
    (outcome) =>
      outcome.status === "invalid" &&
      outcome.blockers.some((blocker) =>
        blocker.toLowerCase().includes("side is unavailable"),
      ),
  ).length;
  const planReferenceMetadataTrace = buildPlanReferenceMetadataTrace({
    snapshots,
    candidates: run.candidates,
    outcomes: run.outcomes,
    batchFingerprint:
      stringOrNull(officialSnapshotLoad?.batch?.batch_fingerprint) ??
      batchFingerprint,
    scanRunFingerprint: stringOrNull(
      officialSnapshotLoad?.batch?.scan_run_fingerprint,
    ),
  });
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
    side_read_source: sideReadSourceBreakdown(run.outcomes),
    side_missing_count: sideMissingCount,
    side_inferred_count: sideInferredCount,
    invalid_due_to_missing_side_count: invalidDueToMissingSideCount,
    upsert_constraint_ready: upsertConstraintReady({
      dryRun,
      persistenceEvents,
    }),
    latest_provider_error_type: latestProviderError,
    provider_plan_mode: providerPlanProfile.mode,
    provider_plan_profile_mode: providerPlanProfile.effective_mode,
    provider_plan_profile_source: providerPlanProfile.source,
    grow_max_learning_mode: growMaxLearningModeEnabled,
    grow_max_learning_mode_enabled_source:
      growMaxLearningMode.grow_max_learning_mode_enabled_source,
    learning_acceleration_enabled: learningAccelerationEnabled,
    learning_acceleration_enabled_source:
      learningAccelerationMode.learning_acceleration_enabled_source,
    learning_acceleration_env_raw_present:
      learningAccelerationMode.learning_acceleration_env_raw_present,
    learning_acceleration_env_raw_value_category:
      learningAccelerationMode.learning_acceleration_env_raw_value_category,
    learning_acceleration_env_raw_value_normalized:
      learningAccelerationMode.learning_acceleration_env_raw_value_normalized,
    learning_acceleration_runtime_environment:
      learningAccelerationMode.learning_acceleration_runtime_environment,
    learning_acceleration_mode:
      learningAccelerationMode.learning_acceleration_mode,
    learning_acceleration_samples_evaluated:
      eligibilityDiagnostics.eligible_research_only_snapshot_count,
    server_plan_mode: providerPlanProfile.server_plan_mode,
    public_plan_mode: providerPlanProfile.public_plan_mode,
    plan_mode_mismatch: providerPlanProfile.plan_mode_mismatch,
    profile_budget_limit:
      providerPlanProfile.profile_outcome_candle_requests_per_run,
    override_budget_limit: providerBudgetResolution.overrideBudgetLimit,
    effective_budget_limit: providerBudgetLimit,
    ...eligibilityDiagnostics,
    candle_requests_planned: run.candle_requests_planned,
    candle_requests_executed: run.candle_requests_executed,
    candle_requests_saved_by_reuse: run.candle_requests_saved_by_reuse,
    provider_budget_limit: run.provider_budget_limit,
    skipped_due_to_budget_count: run.skipped_due_to_budget_count,
    pending_provider_budget_count: run.pending_provider_budget_count,
    retry_incomplete_count: run.retry_incomplete_count,
    unique_candle_requests_count: run.unique_candle_requests_count,
    empty_candle_response_count: run.empty_candle_response_count,
    provider_limit_count: run.provider_limit_count,
    candle_request_debug_sample: run.candle_request_debug_sample,
    outcome_provider_budget_status:
      run.pending_provider_budget_count > 0
        ? "deferred_by_budget"
        : run.provider_limit_count > 0
          ? "provider_limited"
          : run.empty_candle_response_count > 0 && run.provider_error_count === 0
            ? "pending_candles"
            : run.provider_budget_limit !== null &&
                run.candle_requests_executed >= run.provider_budget_limit &&
                run.candle_requests_planned > run.candle_requests_executed
              ? "budget_exhausted"
              : "within_budget",
    next_retry_suggestion:
      run.pending_provider_budget_count > 0
        ? "Retry outcome evaluation after the provider per-minute budget resets."
        : run.empty_candle_response_count > 0
          ? "Retry outcome evaluation after provider intraday candles are available for the requested window."
          : null,
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
    enrichment_mode: run.enrichment_mode,
    completed_outcomes_seen_count: run.completed_outcomes_seen_count,
    completed_outcomes_enriched_count:
      enrichmentMode && !dryRun
        ? persistenceEvents.filter((event) => event.action === "updated").length
        : run.completed_outcomes_enriched_count,
    completed_outcomes_skipped_already_enriched_count:
      run.completed_outcomes_skipped_already_enriched_count,
    retained_candles_added_count: run.retained_candles_added_count,
    counterfactual_ready_count: run.counterfactual_ready_count,
    shadow_eligible_snapshot_count:
      shadowSnapshotSummary.shadow_snapshot_metadata_present_count,
    shadow_missing_metadata_count:
      shadowSnapshotSummary.shadow_snapshot_metadata_missing_count,
    shadow_entry_trial_count: run.shadow_entry_trial_count,
    shadow_entry_triggered_count: run.shadow_entry_triggered_count,
    entry_type_trigger_summary: run.entry_type_trigger_summary,
    plan_reference_metadata_trace: planReferenceMetadataTrace,
  };

  return NextResponse.json({
    ...run,
    ...diagnostics,
    outcome_evaluation: diagnostics,
  });
}
