import "server-only";

import { normalizeUnknownError } from "@/lib/error-logging";
import { getConfiguredApplicationOwnerUserId } from "@/lib/application-session-core";
import type {
  RecommendationOutcome,
  RecommendationOutcomePersistenceResult,
} from "@/lib/recommendation-outcome-tracker";

type SupabaseMutationResult = {
  error?: { message?: string } | null;
};

type SupabaseQueryBuilder = {
  upsert?: (
    value: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => PromiseLike<SupabaseMutationResult>;
};

export type RecommendationOutcomeSupabaseClient = {
  from: (table: string) => SupabaseQueryBuilder;
};

function toSupabaseRow(outcome: RecommendationOutcome, ownerUserId: string) {
  return {
    owner_user_id: ownerUserId,
    id: outcome.id,
    snapshot_id: outcome.snapshot_id,
    snapshot_fingerprint: outcome.snapshot_fingerprint,
    recommendation_id: outcome.recommendation_id,
    ticker: outcome.ticker,
    recommended_at: outcome.recommended_at,
    evaluated_at: outcome.evaluated_at,
    horizon: outcome.horizon,
    status: outcome.status,
    entry_triggered: outcome.entry_triggered,
    target_hit: outcome.target_hit,
    stop_hit: outcome.stop_hit,
    first_terminal_event: outcome.first_terminal_event,
    best_price: outcome.best_price_after_recommendation,
    worst_price: outcome.worst_price_after_recommendation,
    best_r: outcome.best_r,
    worst_r: outcome.worst_r,
    eod_price: outcome.eod_price,
    eod_r: outcome.eod_r,
    payload_json: {
      ...outcome.payload_json,
      side: outcome.side,
      entry: outcome.entry,
      stop: outcome.stop,
      target: outcome.target,
      entry_triggered_at: outcome.entry_triggered_at,
      target_hit_at: outcome.target_hit_at,
      stop_hit_at: outcome.stop_hit_at,
      current_price: outcome.current_price,
      current_r: outcome.current_r,
      max_favorable_excursion: outcome.max_favorable_excursion,
      max_adverse_excursion: outcome.max_adverse_excursion,
      time_to_entry_minutes: outcome.time_to_entry_minutes,
      time_to_target_minutes: outcome.time_to_target_minutes,
      time_to_stop_minutes: outcome.time_to_stop_minutes,
      data_completeness: outcome.data_completeness,
      blockers: outcome.blockers,
    },
    warnings_json: outcome.warnings,
    created_at: outcome.created_at,
    updated_at: outcome.updated_at,
  };
}

export async function persistRecommendationOutcome(
  outcome: RecommendationOutcome,
  options: {
    supabaseClient?: RecommendationOutcomeSupabaseClient | null;
    server?: true;
    unavailableReason?: string | null;
  } = {},
): Promise<RecommendationOutcomePersistenceResult> {
  const ownerUserId = getConfiguredApplicationOwnerUserId();
  if (!options.supabaseClient?.from) {
    return {
      status: "failed",
      mode: "none",
      outcome,
      error: options.unavailableReason
        ? `server_persistence_unavailable:${options.unavailableReason}`
        : "server_persistence_unavailable",
    };
  }

  if (!ownerUserId) {
    return {
      status: "failed",
      mode: "none",
      outcome,
      error: "application_owner_identity_unavailable",
    };
  }

  try {
    const result = await options.supabaseClient
      .from("recommendation_outcomes")
      .upsert?.(toSupabaseRow(outcome, ownerUserId), {
        onConflict: "snapshot_fingerprint,horizon",
      });

    if (!result?.error) {
      return { status: "saved", mode: "supabase", outcome, error: null };
    }

    console.error("[recommendation-outcome] supabase_persistence_error", {
      source: "supabase.recommendation_outcomes",
      operation: "upsert_outcome",
      snapshotFingerprint: outcome.snapshot_fingerprint,
      horizon: outcome.horizon,
      error: normalizeUnknownError(result.error),
    });
    return {
      status: "failed",
      mode: "supabase",
      outcome,
      error: `supabase_outcome_upsert_failed:${
        result.error.message ??
        "Unknown Supabase recommendation outcome persistence error."
      }`,
    };
  } catch (error) {
    console.error("[recommendation-outcome] supabase_persistence_exception", {
      source: "supabase.recommendation_outcomes",
      operation: "upsert_outcome",
      snapshotFingerprint: outcome.snapshot_fingerprint,
      horizon: outcome.horizon,
      error: normalizeUnknownError(error),
    });
    return {
      status: "failed",
      mode: "supabase",
      outcome,
      error: `supabase_outcome_upsert_failed:${
        error instanceof Error
          ? error.message
          : "Unknown Supabase recommendation outcome persistence error."
      }`,
    };
  }
}
