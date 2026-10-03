import type { SupabaseClient } from "@supabase/supabase-js";
import {
  recommendationOutcomeFromPersistenceRow,
  type RecommendationOutcome,
} from "@/lib/recommendation-outcome-tracker";

// Recovery must know all existing labels before spending a provider credit.
// These bound the read, not the cohort: exceeding them makes the whole read
// unavailable. Frozen observation and legacy direct scopes do not use this path.
export const ORIGINAL_OUTCOME_READ_LIMITS = Object.freeze({
  page_rows: 100, total_rows: 10_000, pages: 200, timeout_ms: 5_000,
});

export async function readCompleteOriginalOutcomes(
  client: SupabaseClient,
  ownerUserId: string,
  snapshotFingerprints: string[],
): Promise<{ outcomes: RecommendationOutcome[]; error: string | null }> {
  if (!ownerUserId || snapshotFingerprints.some(value => !value)) {
    return { outcomes: [], error: "original_outcome_identity_invalid" };
  }
  if (snapshotFingerprints.length === 0) return { outcomes: [], error: null };
  const fingerprints = new Set(snapshotFingerprints);
  const ids = new Set<string>();
  const keys = new Set<string>();
  const outcomes: RecommendationOutcome[] = [];
  const signal = AbortSignal.timeout(ORIGINAL_OUTCOME_READ_LIMITS.timeout_ms);
  let cursor: string | null = null;
  let expectedCount: number | null = null;
  let pages = 0;
  try {
    do {
      if (++pages > ORIGINAL_OUTCOME_READ_LIMITS.pages) throw new Error("original_outcome_read_limit_exceeded");
      let query = client.from("recommendation_outcomes").select("*", { count: "exact" })
        .eq("owner_user_id", ownerUserId).in("snapshot_fingerprint", [...fingerprints])
        .order("id", { ascending: true }).limit(ORIGINAL_OUTCOME_READ_LIMITS.page_rows);
      if (cursor !== null) query = query.gt("id", cursor);
      const result = await query.abortSignal(signal);
      if (result.error || !Array.isArray(result.data) || !Number.isSafeInteger(result.count) || result.count === null || result.count < 0) {
        throw new Error(result.error?.message ?? "original_outcome_read_incomplete");
      }
      expectedCount ??= result.count;
      if (expectedCount > ORIGINAL_OUTCOME_READ_LIMITS.total_rows) throw new Error("original_outcome_read_limit_exceeded");
      // A server cap can return fewer than our limit. Advance by the actual
      // immutable id, not an offset or an assumed page size. An empty or
      // inconsistent tail is never accepted as a completed population.
      if (result.count !== expectedCount - outcomes.length ||
          result.data.length > Math.min(result.count, ORIGINAL_OUTCOME_READ_LIMITS.page_rows) ||
          result.count > 0 && result.data.length === 0) throw new Error("original_outcome_read_incomplete");
      for (const row of result.data as Array<Record<string, unknown>>) {
        const outcome = recommendationOutcomeFromPersistenceRow(row);
        const key = JSON.stringify([row.snapshot_fingerprint, row.horizon]);
        if (typeof row.id !== "string" || !row.id || ids.has(row.id) || row.id === cursor ||
            row.owner_user_id !== ownerUserId || typeof row.snapshot_fingerprint !== "string" ||
            !fingerprints.has(row.snapshot_fingerprint) || keys.has(key) || outcome === null ||
            [row.evaluated_at, row.created_at, row.updated_at].some(value => typeof value !== "string" || !Number.isFinite(Date.parse(value)))) {
          throw new Error("original_outcome_identity_invalid");
        }
        ids.add(row.id); keys.add(key); outcomes.push(outcome); cursor = row.id;
      }
    } while (outcomes.length < expectedCount);
    const verified = await client.from("recommendation_outcomes").select("id", { count: "exact", head: true })
      .eq("owner_user_id", ownerUserId).in("snapshot_fingerprint", [...fingerprints]).abortSignal(signal);
    if (verified.error || verified.count !== expectedCount) throw new Error(verified.error?.message ?? "original_outcome_read_incomplete");
    return { outcomes: outcomes.sort((a, b) => b.evaluated_at.localeCompare(a.evaluated_at)), error: null };
  } catch (error) {
    return { outcomes: [], error: signal.aborted ? "original_outcome_read_timeout"
      : error instanceof Error ? error.message : "original_outcome_read_incomplete" };
  }
}
