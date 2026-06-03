import type { OpenAiRecommendationRealityGuardSummary } from "@/lib/openai-recommendation-reality-guard";
import { normalizeUnknownError } from "@/lib/error-logging";
import { classifySupabasePersistenceError } from "@/lib/persistence-error-classifier";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";

export type RecommendationBatchStatus =
  | "published"
  | "no_trade_valid"
  | "partial"
  | "stale"
  | "expired"
  | "replaced"
  | "blocked"
  | "unknown";

export type RecommendationBatchType =
  | "official"
  | "opportunistic"
  | "diagnostic"
  | "fallback"
  | "unknown";

export type RecommendationBatchWindow =
  | "morning"
  | "midday"
  | "power_hour"
  | "outside_window"
  | "closed"
  | "unknown";

export type RecommendationBatchTargetStatus =
  | "below_target"
  | "within_target"
  | "above_target"
  | "no_trade_valid"
  | "unknown";

export type RecommendationBatchWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type RecommendationBatchInput = {
  trading_date?: string | null;
  window?: RecommendationBatchWindow | string | null;
  batch_type?: RecommendationBatchType | string | null;
  status?: RecommendationBatchStatus | string | null;
  observed_at?: string | Date | null;
  published_at?: string | Date | null;
  served_at?: string | Date | null;
  expires_at?: string | Date | null;
  scan_run_id?: string | null;
  scan_run_fingerprint?: string | null;
  snapshots?: RecommendationSnapshot[];
  scan_run?: RecommendationScanRun | null;
  serving_cadence?: RecommendationServingCadenceSummary | null;
  ranking_summary?: ScannerCandidateRankingSummary | null;
  openai_reality_guard?: OpenAiRecommendationRealityGuardSummary | null;
  source_mode?: string | null;
  data_mode?: string | null;
  market_session_phase?: string | null;
  payload?: Record<string, unknown>;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
};

export type RecommendationBatch = {
  id: string;
  batch_fingerprint: string;
  trading_date: string | null;
  window: RecommendationBatchWindow;
  batch_type: RecommendationBatchType;
  status: RecommendationBatchStatus;
  serving_decision: string | null;
  freshness_status: string | null;
  published_at: string | null;
  served_at: string | null;
  observed_at: string;
  expires_at: string | null;
  scan_run_id: string | null;
  scan_run_fingerprint: string | null;
  recommendation_snapshot_ids: string[];
  recommendation_snapshot_fingerprints: string[];
  recommendation_tickers: string[];
  recommendation_count: number;
  strong_count: number;
  valid_count: number;
  experimental_count: number;
  rejected_count: number;
  incomplete_count: number;
  unknown_tier_count: number;
  target_status: RecommendationBatchTargetStatus;
  gap_to_target: number | null;
  overflow_above_target: number | null;
  source_mode: string;
  data_mode: string;
  market_session_phase: string | null;
  warnings: RecommendationBatchWarning[];
  gaps: string[];
  metadata_score: number;
  payload_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type RecommendationBatchPersistenceResult = {
  status: "saved" | "duplicate" | "updated" | "failed";
  mode: "supabase" | "localStorage" | "none";
  batch: RecommendationBatch;
  error: string | null;
};

export type RecommendationBatchDeduplicationResult = {
  is_duplicate: boolean;
  should_update: boolean;
  batch_fingerprint: string;
  existing_batch_id: string | null;
};

export type RecommendationBatchSummary = {
  summary_version: "1.0";
  summary_kind: "recommendation_batch_memory";
  generated_at: string;
  trading_date: string;
  latest_batch: RecommendationBatch | null;
  stored_today_count: number;
  total_batches: number;
  persistence_status: RecommendationBatchPersistenceResult["status"] | "idle";
  persistence_mode: RecommendationBatchPersistenceResult["mode"] | "unknown";
  duplicate_skipped_count: number;
  updated_count: number;
  warnings: RecommendationBatchWarning[];
};

type SupabaseMutationResult = {
  error?: { message?: string } | null;
};

type SupabaseQueryBuilder = {
  upsert?: (
    value: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => PromiseLike<SupabaseMutationResult>;
};

export type RecommendationBatchSupabaseClient = {
  from: (table: string) => SupabaseQueryBuilder;
};

export const recommendationBatchLocalStorageKey =
  "trade-recommendation-batches-v1";

const maxLocalBatches = 300;

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toIso(value: string | Date | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  return null;
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function normalizeWindow(value: string | null | undefined): RecommendationBatchWindow {
  if (value === "morning" || value === "opening" || value === "morning_momentum") {
    return "morning";
  }
  if (value === "midday" || value === "afternoon") return "midday";
  if (value === "power_hour") return "power_hour";
  if (value === "outside_window" || value === "pre_market") return "outside_window";
  if (value === "closed") return "closed";
  return "unknown";
}

function normalizeBatchType(value: unknown): RecommendationBatchType {
  if (
    value === "official" ||
    value === "opportunistic" ||
    value === "diagnostic" ||
    value === "fallback" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeStatus(value: unknown): RecommendationBatchStatus {
  if (
    value === "published" ||
    value === "no_trade_valid" ||
    value === "partial" ||
    value === "stale" ||
    value === "expired" ||
    value === "replaced" ||
    value === "blocked" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeTargetStatus(value: unknown): RecommendationBatchTargetStatus {
  if (
    value === "below_target" ||
    value === "within_target" ||
    value === "above_target" ||
    value === "no_trade_valid" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function tierFromSnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;
  const target =
    typeof payload.day_trade_window_recommendation_target === "object" &&
    payload.day_trade_window_recommendation_target !== null
      ? (payload.day_trade_window_recommendation_target as Record<string, unknown>)
      : null;
  const tier = textOrNull(String(target?.tier ?? target?.recommendation_tier ?? ""));

  if (
    tier === "strong" ||
    tier === "valid" ||
    tier === "experimental" ||
    tier === "rejected" ||
    tier === "incomplete"
  ) {
    return tier;
  }

  return "unknown";
}

function statusFromInput(input: RecommendationBatchInput, count: number) {
  const explicitStatus = normalizeStatus(input.status);

  if (explicitStatus !== "unknown") return explicitStatus;

  const cadence = input.serving_cadence;
  if (cadence?.batch_status === "no_trade_valid" || cadence?.no_trade_valid) {
    return "no_trade_valid";
  }
  if (cadence?.freshness_status === "expired") return "expired";
  if (cadence?.freshness_status === "stale") return "stale";
  if (cadence?.batch_status === "replaced") return "replaced";
  if (cadence?.serving_decision === "market_closed") return "blocked";
  if (count > 0 && cadence?.serving_decision === "publish_official_batch") {
    return "published";
  }
  if (count > 0) return "partial";
  return "unknown";
}

function batchTypeFromInput(input: RecommendationBatchInput) {
  const explicitType = normalizeBatchType(input.batch_type);

  if (explicitType !== "unknown") return explicitType;

  const cadenceType = normalizeBatchType(input.serving_cadence?.batch_type);
  if (cadenceType !== "unknown") return cadenceType;

  if (input.serving_cadence?.serving_decision === "opportunistic_update") {
    return "opportunistic";
  }

  if (input.serving_cadence?.serving_decision === "publish_official_batch") {
    return "official";
  }

  return "unknown";
}

function recommendationSignature(snapshot: RecommendationSnapshot) {
  return [
    snapshot.snapshot_fingerprint,
    snapshot.recommendation_id ?? "no-recommendation-id",
    snapshot.ticker ?? "UNKNOWN",
    snapshot.created_at.slice(0, 19),
  ].join(":");
}

export function buildRecommendationBatchFingerprint(
  input: RecommendationBatchInput,
) {
  const snapshots = input.snapshots ?? [];
  const tradingDate =
    textOrNull(input.trading_date) ??
    toIso(input.observed_at)?.slice(0, 10) ??
    input.serving_cadence?.trading_date ??
    "unknown-date";
  const window = normalizeWindow(
    input.window ?? input.serving_cadence?.serving_window ?? null,
  );
  const batchType = batchTypeFromInput(input);
  const servingDecision =
    textOrNull(input.serving_cadence?.serving_decision) ?? "unknown_decision";
  const recommendationSet =
    snapshots.map(recommendationSignature).sort().join("|") ||
    (input.serving_cadence?.no_trade_valid ? "no-trade-valid" : "no-visible-recs");
  const scanRunFingerprint =
    textOrNull(input.scan_run_fingerprint) ??
    textOrNull(input.scan_run?.run_fingerprint) ??
    "no-scan-run";

  return `rec_batch_${stableHash(
    [
      tradingDate,
      window,
      batchType,
      servingDecision,
      scanRunFingerprint,
      recommendationSet,
    ].join("|"),
  )}`;
}

function calculateTargetStatus(input: {
  status: RecommendationBatchStatus;
  count: number;
  min: number;
  max: number;
}) {
  if (input.status === "no_trade_valid") return "no_trade_valid" as const;
  if (input.count < input.min) return "below_target" as const;
  if (input.count > input.max) return "above_target" as const;
  return "within_target" as const;
}

function buildWarnings(input: {
  status: RecommendationBatchStatus;
  count: number;
  targetStatus: RecommendationBatchTargetStatus;
  cadence?: RecommendationServingCadenceSummary | null;
}) {
  const warnings: RecommendationBatchWarning[] = [
    ...(input.cadence?.warnings.map((warning) => ({
      warning_id: `serving_cadence:${warning.warning_id}`,
      severity:
        warning.severity === "critical" ? ("critical" as const) : ("warning" as const),
      message: warning.message,
    })) ?? []),
  ];

  if (input.status === "unknown") {
    warnings.push({
      warning_id: "batch_status_unknown",
      severity: "info",
      message: "Batch status could not be inferred from current metadata.",
    });
  }

  if (input.targetStatus === "below_target" && input.count > 0) {
    warnings.push({
      warning_id: "batch_below_target",
      severity: "warning",
      message: "Official batch is below the desired recommendation target.",
    });
  }

  return warnings;
}

function metadataScore(batch: Pick<RecommendationBatch, "scan_run_fingerprint" | "recommendation_snapshot_fingerprints" | "payload_json" | "warnings" | "gaps">) {
  return [
    batch.scan_run_fingerprint ? 20 : 0,
    batch.recommendation_snapshot_fingerprints.length * 5,
    Object.keys(batch.payload_json).length * 2,
    batch.warnings.length,
    batch.gaps.length,
  ].reduce((sum, value) => sum + value, 0);
}

export function buildRecommendationBatch(
  input: RecommendationBatchInput,
): RecommendationBatch {
  const observedAt =
    toIso(input.observed_at) ??
    toIso(input.served_at) ??
    toIso(input.published_at) ??
    new Date().toISOString();
  const snapshots = input.snapshots ?? [];
  const count = snapshots.length;
  const batchType = batchTypeFromInput(input);
  const status = statusFromInput(input, count);
  const cadence = input.serving_cadence ?? null;
  const window = normalizeWindow(input.window ?? cadence?.serving_window ?? null);
  const targetMin = cadence?.batch_target.min ?? 6;
  const targetMax = cadence?.batch_target.max ?? 10;
  const targetStatus = normalizeTargetStatus(
    status === "no_trade_valid"
      ? "no_trade_valid"
      : calculateTargetStatus({
          status,
          count,
          min: targetMin,
          max: targetMax,
        }),
  );
  const tiers = snapshots.map(tierFromSnapshot);
  const gapToTarget =
    targetStatus === "below_target" ? Math.max(0, targetMin - count) : null;
  const overflowAboveTarget =
    targetStatus === "above_target" ? Math.max(0, count - targetMax) : null;
  const warnings = buildWarnings({
    status,
    count,
    targetStatus,
    cadence,
  });
  const gaps = [
    ...(input.ranking_summary ? [] : ["ranking_summary_unavailable"]),
    ...(input.openai_reality_guard ? [] : ["openai_reality_guard_unavailable"]),
    ...(input.scan_run_fingerprint ?? input.scan_run?.run_fingerprint
      ? []
      : ["scan_run_fingerprint_unavailable"]),
  ];
  const createdAt = toIso(input.created_at) ?? observedAt;
  const updatedAt = toIso(input.updated_at) ?? observedAt;
  const batchFingerprint = buildRecommendationBatchFingerprint(input);
  const payloadJson = {
    ...(input.payload ?? {}),
    recommendation_snapshot_fingerprints: snapshots.map(
      (snapshot) => snapshot.snapshot_fingerprint,
    ),
    recommendation_snapshot_ids: snapshots.map((snapshot) => snapshot.id),
    recommendation_tickers: snapshots
      .map((snapshot) => snapshot.ticker)
      .filter((ticker): ticker is string => ticker !== null),
    recommendation_serving_cadence: cadence,
    scanner_candidate_ranking: input.ranking_summary ?? null,
    openai_recommendation_reality_guard: input.openai_reality_guard ?? null,
    scan_run: input.scan_run ?? null,
  };
  const batch: RecommendationBatch = {
    id: batchFingerprint,
    batch_fingerprint: batchFingerprint,
    trading_date:
      textOrNull(input.trading_date) ??
      textOrNull(cadence?.trading_date) ??
      observedAt.slice(0, 10),
    window,
    batch_type: batchType,
    status,
    serving_decision: textOrNull(cadence?.serving_decision),
    freshness_status: textOrNull(cadence?.freshness_status),
    published_at:
      toIso(input.published_at) ??
      toIso(cadence?.latest_official_batch_published_at) ??
      null,
    served_at: toIso(input.served_at) ?? toIso(cadence?.served_at) ?? null,
    observed_at: observedAt,
    expires_at: toIso(input.expires_at),
    scan_run_id:
      textOrNull(input.scan_run_id) ?? textOrNull(input.scan_run?.id) ?? null,
    scan_run_fingerprint:
      textOrNull(input.scan_run_fingerprint) ??
      textOrNull(input.scan_run?.run_fingerprint) ??
      null,
    recommendation_snapshot_ids: snapshots.map((snapshot) => snapshot.id),
    recommendation_snapshot_fingerprints: snapshots.map(
      (snapshot) => snapshot.snapshot_fingerprint,
    ),
    recommendation_tickers: Array.from(
      new Set(
        snapshots
          .map((snapshot) => snapshot.ticker)
          .filter((ticker): ticker is string => ticker !== null),
      ),
    ).sort(),
    recommendation_count: count,
    strong_count: tiers.filter((tier) => tier === "strong").length,
    valid_count: tiers.filter((tier) => tier === "valid").length,
    experimental_count: tiers.filter((tier) => tier === "experimental").length,
    rejected_count: tiers.filter((tier) => tier === "rejected").length,
    incomplete_count: tiers.filter((tier) => tier === "incomplete").length,
    unknown_tier_count: tiers.filter((tier) => tier === "unknown").length,
    target_status: targetStatus,
    gap_to_target: gapToTarget,
    overflow_above_target: overflowAboveTarget,
    source_mode: textOrNull(input.source_mode) ?? input.scan_run?.source ?? "unknown",
    data_mode: textOrNull(input.data_mode) ?? input.scan_run?.data_mode ?? "unknown",
    market_session_phase:
      textOrNull(input.market_session_phase) ??
      textOrNull(input.scan_run?.market_session_phase),
    warnings,
    gaps,
    metadata_score: 0,
    payload_json: payloadJson,
    created_at: createdAt,
    updated_at: updatedAt,
  };
  const score = metadataScore(batch);

  return {
    ...batch,
    metadata_score: score,
    payload_json: {
      ...batch.payload_json,
      gaps,
      metadata_score: score,
      source_mode: batch.source_mode,
      scan_run_id: batch.scan_run_id,
      served_at: batch.served_at,
      observed_at: batch.observed_at,
      rejected_count: batch.rejected_count,
      incomplete_count: batch.incomplete_count,
    },
  };
}

export function recommendationBatchJson(batch: RecommendationBatch) {
  return JSON.stringify(batch, null, 2);
}

export function recommendationBatchesJson(batches: RecommendationBatch[]) {
  return JSON.stringify(
    {
      batch_count: batches.length,
      batches,
    },
    null,
    2,
  );
}

export function readRecommendationBatchesFromLocalStorage(
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) return [];

  try {
    const parsed = JSON.parse(
      storage.getItem(recommendationBatchLocalStorageKey) ?? "[]",
    );
    return Array.isArray(parsed) ? (parsed as RecommendationBatch[]) : [];
  } catch {
    return [];
  }
}

export function checkRecommendationBatchDeduplication(
  batch: RecommendationBatch,
  existingBatches: RecommendationBatch[],
): RecommendationBatchDeduplicationResult {
  const existingBatch = existingBatches.find(
    (item) => item.batch_fingerprint === batch.batch_fingerprint,
  );

  return {
    is_duplicate: existingBatch !== undefined,
    should_update:
      existingBatch !== undefined && batch.metadata_score > existingBatch.metadata_score,
    batch_fingerprint: batch.batch_fingerprint,
    existing_batch_id: existingBatch?.id ?? null,
  };
}

export function persistRecommendationBatchToLocalStorage(
  batch: RecommendationBatch,
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
): RecommendationBatchPersistenceResult {
  if (!storage) {
    return {
      status: "failed",
      mode: "none",
      batch,
      error: "localStorage is unavailable.",
    };
  }

  try {
    const existingBatches = readRecommendationBatchesFromLocalStorage(storage);
    const deduplication = checkRecommendationBatchDeduplication(
      batch,
      existingBatches,
    );

    if (deduplication.is_duplicate && !deduplication.should_update) {
      return {
        status: "duplicate",
        mode: "localStorage",
        batch,
        error: null,
      };
    }

    const nextBatches = deduplication.should_update
      ? existingBatches.map((item) =>
          item.batch_fingerprint === batch.batch_fingerprint
            ? { ...item, ...batch, created_at: item.created_at }
            : item,
        )
      : [batch, ...existingBatches];

    storage.setItem(
      recommendationBatchLocalStorageKey,
      JSON.stringify(nextBatches.slice(0, maxLocalBatches)),
    );

    return {
      status: deduplication.should_update ? "updated" : "saved",
      mode: "localStorage",
      batch,
      error: null,
    };
  } catch (error) {
    return {
      status: "failed",
      mode: "localStorage",
      batch,
      error: error instanceof Error ? error.message : "Unknown localStorage error.",
    };
  }
}

function toSupabaseRow(batch: RecommendationBatch) {
  return {
    id: batch.id,
    batch_fingerprint: batch.batch_fingerprint,
    trading_date: batch.trading_date,
    window: batch.window,
    batch_type: batch.batch_type,
    status: batch.status,
    serving_decision: batch.serving_decision,
    freshness_status: batch.freshness_status,
    published_at: batch.published_at,
    expires_at: batch.expires_at,
    scan_run_fingerprint: batch.scan_run_fingerprint,
    recommendation_count: batch.recommendation_count,
    strong_count: batch.strong_count,
    valid_count: batch.valid_count,
    experimental_count: batch.experimental_count,
    unknown_tier_count: batch.unknown_tier_count,
    target_status: batch.target_status,
    gap_to_target: batch.gap_to_target,
    overflow_above_target: batch.overflow_above_target,
    data_mode: batch.data_mode,
    market_session_phase: batch.market_session_phase,
    warnings_json: batch.warnings,
    payload_json: batch.payload_json,
    created_at: batch.created_at,
    updated_at: batch.updated_at,
  };
}

export async function persistRecommendationBatch(
  batch: RecommendationBatch,
  options: {
    supabaseClient?: RecommendationBatchSupabaseClient | null;
    storage?: Storage;
    server?: boolean;
    unavailableReason?: string | null;
  } = {},
): Promise<RecommendationBatchPersistenceResult> {
  if (options.supabaseClient?.from) {
    try {
      const result = await options.supabaseClient
        .from("recommendation_batches")
        .upsert?.(toSupabaseRow(batch), {
          onConflict: "batch_fingerprint",
        });

      if (!result?.error) {
        return {
          status: "saved",
          mode: "supabase",
          batch,
          error: null,
        };
      }

      console.error("[recommendation-batch-memory] supabase_persistence_error", {
        source: "supabase.recommendation_batches",
        operation: "upsert_batch",
        batchFingerprint: batch.batch_fingerprint,
        error: normalizeUnknownError(result.error),
      });
      return {
        status: "failed",
        mode: "supabase",
        batch,
        error:
          `${classifySupabasePersistenceError(result.error)}:${
            result.error.message ??
            "Unknown Supabase recommendation batch persistence error."
          }`,
      };
    } catch (error) {
      console.error("[recommendation-batch-memory] supabase_persistence_exception", {
        source: "supabase.recommendation_batches",
        operation: "upsert_batch",
        batchFingerprint: batch.batch_fingerprint,
        error: normalizeUnknownError(error),
      });
      return {
        status: "failed",
        mode: "supabase",
        batch,
        error:
          `${classifySupabasePersistenceError(error)}:${
            error instanceof Error
              ? error.message
              : "Unknown Supabase recommendation batch persistence error."
          }`,
      };
    }
  }

  if (options.server) {
    return {
      status: "failed",
      mode: "none",
      batch,
      error: options.unavailableReason
        ? `server_persistence_unavailable:${options.unavailableReason}`
        : "server_persistence_unavailable",
    };
  }

  return persistRecommendationBatchToLocalStorage(batch, options.storage);
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function recommendationBatchFromPersistenceRow(
  row: Record<string, unknown>,
): RecommendationBatch | null {
  const batchFingerprint = textOrNull(
    String(row.batch_fingerprint ?? row.id ?? ""),
  );

  if (!batchFingerprint) return null;

  const payloadJson = objectOrNull(row.payload_json) ?? {};
  const warnings = Array.isArray(row.warnings_json)
    ? (row.warnings_json as RecommendationBatchWarning[])
    : [];
  const batch: RecommendationBatch = {
    id: textOrNull(String(row.id ?? "")) ?? batchFingerprint,
    batch_fingerprint: batchFingerprint,
    trading_date: textOrNull(String(row.trading_date ?? "")),
    window: normalizeWindow(String(row.window ?? "unknown")),
    batch_type: normalizeBatchType(row.batch_type),
    status: normalizeStatus(row.status),
    serving_decision: textOrNull(String(row.serving_decision ?? "")),
    freshness_status: textOrNull(String(row.freshness_status ?? "")),
    published_at: toIso(String(row.published_at ?? "")),
    served_at:
      toIso(String(payloadJson.served_at ?? "")) ??
      toIso(String(row.published_at ?? "")),
    observed_at:
      toIso(String(payloadJson.observed_at ?? "")) ??
      toIso(String(row.created_at ?? "")) ??
      new Date().toISOString(),
    expires_at: toIso(String(row.expires_at ?? "")),
    scan_run_id: textOrNull(String(payloadJson.scan_run_id ?? "")),
    scan_run_fingerprint: textOrNull(String(row.scan_run_fingerprint ?? "")),
    recommendation_snapshot_ids: arrayOfStrings(
      payloadJson.recommendation_snapshot_ids,
    ),
    recommendation_snapshot_fingerprints: arrayOfStrings(
      payloadJson.recommendation_snapshot_fingerprints,
    ),
    recommendation_tickers: arrayOfStrings(payloadJson.recommendation_tickers),
    recommendation_count: finiteNumber(row.recommendation_count) ?? 0,
    strong_count: finiteNumber(row.strong_count) ?? 0,
    valid_count: finiteNumber(row.valid_count) ?? 0,
    experimental_count: finiteNumber(row.experimental_count) ?? 0,
    rejected_count: finiteNumber(payloadJson.rejected_count) ?? 0,
    incomplete_count: finiteNumber(payloadJson.incomplete_count) ?? 0,
    unknown_tier_count: finiteNumber(row.unknown_tier_count) ?? 0,
    target_status: normalizeTargetStatus(row.target_status),
    gap_to_target: finiteNumber(row.gap_to_target),
    overflow_above_target: finiteNumber(row.overflow_above_target),
    source_mode: textOrNull(String(payloadJson.source_mode ?? "")) ?? "unknown",
    data_mode: textOrNull(String(row.data_mode ?? "")) ?? "unknown",
    market_session_phase: textOrNull(String(row.market_session_phase ?? "")),
    warnings,
    gaps: arrayOfStrings(payloadJson.gaps),
    metadata_score: finiteNumber(payloadJson.metadata_score) ?? 0,
    payload_json: payloadJson,
    created_at:
      toIso(String(row.created_at ?? "")) ??
      toIso(String(row.published_at ?? "")) ??
      new Date().toISOString(),
    updated_at:
      toIso(String(row.updated_at ?? "")) ??
      toIso(String(row.created_at ?? "")) ??
      new Date().toISOString(),
  };

  return {
    ...batch,
    metadata_score: batch.metadata_score || metadataScore(batch),
  };
}

export function buildRecommendationBatchSummary(input: {
  batches: RecommendationBatch[];
  tradingDate: string;
  latestBatch?: RecommendationBatch | null;
  persistenceStatus?: RecommendationBatchSummary["persistence_status"];
  persistenceMode?: RecommendationBatchSummary["persistence_mode"];
  duplicateSkippedCount?: number;
  updatedCount?: number;
  now?: Date | string | null;
}): RecommendationBatchSummary {
  const now = toIso(input.now ?? null) ?? new Date().toISOString();
  const batches = input.batches;
  const latestBatch =
    input.latestBatch ??
    [...batches].sort((first, second) =>
      second.observed_at.localeCompare(first.observed_at),
    )[0] ??
    null;
  const storedTodayCount = batches.filter(
    (batch) =>
      batch.trading_date === input.tradingDate ||
      batch.observed_at.slice(0, 10) === input.tradingDate,
  ).length;
  const warnings = latestBatch?.warnings ?? [];

  return {
    summary_version: "1.0",
    summary_kind: "recommendation_batch_memory",
    generated_at: now,
    trading_date: input.tradingDate,
    latest_batch: latestBatch,
    stored_today_count: storedTodayCount,
    total_batches: batches.length,
    persistence_status: input.persistenceStatus ?? "idle",
    persistence_mode: input.persistenceMode ?? "unknown",
    duplicate_skipped_count: input.duplicateSkippedCount ?? 0,
    updated_count: input.updatedCount ?? 0,
    warnings,
  };
}
