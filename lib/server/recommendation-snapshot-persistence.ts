import "server-only";

import { normalizeUnknownError } from "@/lib/error-logging";
import { classifySupabasePersistenceError } from "@/lib/persistence-error-classifier";
import type {
  RecommendationSnapshot,
  RecommendationSnapshotPersistenceResult,
} from "@/lib/recommendation-snapshot";
import { getConfiguredApplicationOwnerUserId } from "@/lib/application-session-core";

type SupabaseMutationResult = {
  error?: { message?: string } | null;
};

type SupabaseQueryBuilder = {
  upsert?: (
    value: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => PromiseLike<SupabaseMutationResult>;
};

export type RecommendationSnapshotSupabaseClient = {
  from: (table: string) => SupabaseQueryBuilder;
};

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toSupabaseRow(snapshot: RecommendationSnapshot, ownerUserId: string) {
  return {
    owner_user_id: ownerUserId,
    id: snapshot.id,
    snapshot_fingerprint: snapshot.snapshot_fingerprint,
    recommendation_id: snapshot.recommendation_id,
    scan_run_id: snapshot.scan_run_id,
    ticker: snapshot.ticker,
    recommended_at: snapshot.recommended_at,
    window: snapshot.window,
    status: snapshot.status,
    source_mode: snapshot.source_mode,
    data_mode: snapshot.data_mode,
    market_session_phase: snapshot.market_session_phase,
    entry: snapshot.entry,
    stop: snapshot.stop,
    target: snapshot.target,
    confidence: finiteNumber(snapshot.confidence),
    score: finiteNumber(snapshot.score),
    risk_reward: snapshot.planned_risk_reward,
    rationale: snapshot.rationale,
    payload_json: snapshot.payload_json,
    intake_quality_json: snapshot.intake_quality_json,
    scan_observability_json: snapshot.scan_observability_json,
    was_taken: snapshot.was_taken,
    linked_position_id: snapshot.linked_position_id,
    created_at: snapshot.created_at,
    updated_at: snapshot.updated_at,
  };
}

export async function persistRecommendationSnapshot(
  snapshot: RecommendationSnapshot,
  options: {
    supabaseClient?: RecommendationSnapshotSupabaseClient | null;
    server?: true;
    unavailableReason?: string | null;
  } = {},
): Promise<RecommendationSnapshotPersistenceResult> {
  const ownerUserId = getConfiguredApplicationOwnerUserId();
  if (!options.supabaseClient?.from) {
    return {
      status: "failed",
      mode: "none",
      snapshot,
      error: options.unavailableReason
        ? `server_persistence_unavailable:${options.unavailableReason}`
        : "server_persistence_unavailable",
    };
  }

  if (!ownerUserId) {
    return {
      status: "failed",
      mode: "none",
      snapshot,
      error: "application_owner_identity_unavailable",
    };
  }

  try {
    const result = await options.supabaseClient
      .from("recommendation_snapshots")
      .upsert?.(toSupabaseRow(snapshot, ownerUserId), {
        onConflict: "snapshot_fingerprint",
        ignoreDuplicates: true,
      });

    if (!result?.error) {
      return { status: "saved", mode: "supabase", snapshot, error: null };
    }

    console.error("[recommendation-snapshot] supabase_persistence_error", {
      source: "supabase.recommendation_snapshots",
      operation: "upsert_snapshot",
      snapshotFingerprint: snapshot.snapshot_fingerprint,
      recommendationId: snapshot.recommendation_id,
      error: normalizeUnknownError(result.error),
    });
    return {
      status: "failed",
      mode: "supabase",
      snapshot,
      error: `${classifySupabasePersistenceError(result.error)}:${
        result.error.message ??
        "Unknown Supabase recommendation snapshot persistence error."
      }`,
    };
  } catch (error) {
    console.error("[recommendation-snapshot] supabase_persistence_exception", {
      source: "supabase.recommendation_snapshots",
      operation: "upsert_snapshot",
      snapshotFingerprint: snapshot.snapshot_fingerprint,
      recommendationId: snapshot.recommendation_id,
      error: normalizeUnknownError(error),
    });
    return {
      status: "failed",
      mode: "supabase",
      snapshot,
      error: `${classifySupabasePersistenceError(error)}:${
        error instanceof Error
          ? error.message
          : "Unknown Supabase recommendation snapshot persistence error."
      }`,
    };
  }
}
