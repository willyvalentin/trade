import "server-only";

import { normalizeUnknownError } from "@/lib/error-logging";
import { classifySupabasePersistenceError } from "@/lib/persistence-error-classifier";
import type {
  RecommendationBatch,
  RecommendationBatchPersistenceResult,
} from "@/lib/recommendation-batch-memory";

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
    server?: true;
    unavailableReason?: string | null;
  } = {},
): Promise<RecommendationBatchPersistenceResult> {
  if (!options.supabaseClient?.from) {
    return {
      status: "failed",
      mode: "none",
      batch,
      error: options.unavailableReason
        ? `server_persistence_unavailable:${options.unavailableReason}`
        : "server_persistence_unavailable",
    };
  }

  try {
    const result = await options.supabaseClient
      .from("recommendation_batches")
      .upsert?.(toSupabaseRow(batch), { onConflict: "batch_fingerprint" });

    if (!result?.error) {
      return { status: "saved", mode: "supabase", batch, error: null };
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
      error: `${classifySupabasePersistenceError(result.error)}:${
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
      error: `${classifySupabasePersistenceError(error)}:${
        error instanceof Error
          ? error.message
          : "Unknown Supabase recommendation batch persistence error."
      }`,
    };
  }
}
