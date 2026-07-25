import "server-only";

import { normalizeUnknownError } from "@/lib/error-logging";
import { classifySupabasePersistenceError } from "@/lib/persistence-error-classifier";
import type {
  RecommendationScanRun,
  RecommendationScanRunPersistenceResult,
} from "@/lib/recommendation-scan-run";

type SupabaseMutationResult = {
  error?: { message?: string } | null;
};

type SupabaseQueryBuilder = {
  upsert?: (
    value: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => PromiseLike<SupabaseMutationResult>;
};

export type RecommendationScanRunSupabaseClient = {
  from: (table: string) => SupabaseQueryBuilder;
};

function toSupabaseRow(scanRun: RecommendationScanRun) {
  return {
    id: scanRun.id,
    run_fingerprint: scanRun.run_fingerprint,
    trading_date: scanRun.trading_date,
    window: scanRun.window,
    status: scanRun.status,
    observed_at: scanRun.observed_at,
    started_at: scanRun.started_at,
    completed_at: scanRun.completed_at,
    market_session_phase: scanRun.market_session_phase,
    data_mode: scanRun.data_mode,
    scan_observability_status: scanRun.scan_observability_status,
    visible_recommendation_count: scanRun.counts.visible_recommendation_count,
    accepted_count: scanRun.counts.accepted_count,
    needs_review_count: scanRun.counts.needs_review_count,
    rejected_count: scanRun.counts.rejected_count,
    incomplete_count: scanRun.counts.incomplete_count,
    strong_count: scanRun.counts.strong_count,
    valid_count: scanRun.counts.valid_count,
    experimental_count: scanRun.counts.experimental_count,
    rejected_tier_count: scanRun.counts.rejected_tier_count,
    incomplete_tier_count: scanRun.counts.incomplete_tier_count,
    unknown_tier_count: scanRun.counts.unknown_tier_count,
    window_target_status: scanRun.window_target_status,
    gap_to_target: scanRun.gap_to_target,
    overflow_above_target: scanRun.overflow_above_target,
    ticker_count: scanRun.ticker_count,
    duplicate_ticker_count: scanRun.duplicate_ticker_count,
    stale_candidate_count: scanRun.stale_candidate_count,
    incomplete_data_candidate_count: scanRun.incomplete_data_candidate_count,
    scanned_ticker_count: scanRun.scanned_ticker_count,
    raw_candidate_count: scanRun.raw_candidate_count,
    scan_duration_ms: scanRun.scan_duration_ms,
    warnings_json: scanRun.warnings,
    payload_json: scanRun.payload_json,
    created_at: scanRun.created_at,
    updated_at: scanRun.updated_at,
  };
}

export async function persistRecommendationScanRun(
  scanRun: RecommendationScanRun,
  options: {
    supabaseClient?: RecommendationScanRunSupabaseClient | null;
    server?: true;
    unavailableReason?: string | null;
  } = {},
): Promise<RecommendationScanRunPersistenceResult> {
  if (!options.supabaseClient?.from) {
    return {
      status: "failed",
      mode: "none",
      scan_run: scanRun,
      error: options.unavailableReason
        ? `server_persistence_unavailable:${options.unavailableReason}`
        : "server_persistence_unavailable",
    };
  }

  try {
    const result = await options.supabaseClient
      .from("recommendation_scan_runs")
      .upsert?.(toSupabaseRow(scanRun), {
        onConflict: "run_fingerprint",
        ignoreDuplicates: true,
      });

    if (!result?.error) {
      return { status: "saved", mode: "supabase", scan_run: scanRun, error: null };
    }

    console.error("[recommendation-scan-run] supabase_persistence_error", {
      source: "supabase.recommendation_scan_runs",
      operation: "upsert_scan_run",
      runFingerprint: scanRun.run_fingerprint,
      error: normalizeUnknownError(result.error),
    });
    return {
      status: "failed",
      mode: "supabase",
      scan_run: scanRun,
      error: `${classifySupabasePersistenceError(result.error)}:${
        result.error.message ?? "Unknown Supabase scan-run persistence error."
      }`,
    };
  } catch (error) {
    console.error("[recommendation-scan-run] supabase_persistence_exception", {
      source: "supabase.recommendation_scan_runs",
      operation: "upsert_scan_run",
      runFingerprint: scanRun.run_fingerprint,
      error: normalizeUnknownError(error),
    });
    return {
      status: "failed",
      mode: "supabase",
      scan_run: scanRun,
      error: `${classifySupabasePersistenceError(error)}:${
        error instanceof Error
          ? error.message
          : "Unknown Supabase scan-run persistence error."
      }`,
    };
  }
}
