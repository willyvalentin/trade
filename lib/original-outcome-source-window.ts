import { getNewYorkDateString } from "@/lib/intraday-scan-window";

/** Fixed recovery window for retained original sources, not live-price data.
 * No anchor is shifted; older sources remain unmeasured, never completed. */
export const ORIGINAL_OUTCOME_BACKLOG_SCOPE = "trailing_seven_ny_dates_v1" as const;

export const RETAINED_ORIGINAL_OUTCOME_BATCH_SCOPE = "retained_original_batch_one_shot_v1" as const;
export const RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG = "TURE_OUTCOME_EVALUATION_ONE_SHOT_BATCH_FINGERPRINT";
// This new route scope has its own bounded delivery check. Keep the scanner's
// existing authority inline; its bundling/idempotency boundary must not move.
export const RETAINED_ORIGINAL_OUTCOME_BATCH_DELIVERY_GRACE_MILLISECONDS = 3 * 60 * 1000;

/** An optional server-selected source, never a caller-selected backlog. Missing
 * configuration preserves today's existing one-shot. Present but invalid
 * configuration must not silently fall back to today or an ordinary schedule. */
export function retainedOriginalOutcomeBatchControlFromEnvironment(environment: {
  get(name: string): string | undefined;
}) {
  const fingerprint = environment.get(RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG);
  if (fingerprint === undefined) return { status: "disabled" as const };
  const date = environment.get("TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE");
  const slot = environment.get("TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC");
  const timestamp = typeof slot === "string" ? Date.parse(slot) : NaN;
  if (
    !/^rec_batch_[a-z0-9]{1,64}$/.test(fingerprint) ||
    environment.get("TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED") !== "true" ||
    environment.get("TURE_DISABLE_SCHEDULED_FUNCTIONS") !== "true" ||
    ["TURE_NORMAL_SCAN_ONE_SHOT_ENABLED", "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED",
      "TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED", "TURE_OBSERVATION_SERIES_ENABLED",
      "TURE_OUTCOME_EVALUATION_SERIES_ENABLED", "TURE_INTERNAL_PAPER_WORKER_ENABLED"]
      .some(flag => environment.get(flag) === "true") ||
    !Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== slot ||
    timestamp % (15 * 60_000) !== 0 ||
    getNewYorkDateString(new Date(timestamp)) !== date
  ) return { status: "invalid" as const };
  return { status: "ready" as const, contract_version: RETAINED_ORIGINAL_OUTCOME_BATCH_SCOPE,
    batch_fingerprint: fingerprint, target_date: date!, target_slot_utc: slot! };
}

export function originalOutcomeSourceWindow(now: Date) {
  if (!Number.isFinite(now.getTime())) return null;
  const through = getNewYorkDateString(now);
  const first = new Date(`${through}T12:00:00.000Z`);
  first.setUTCDate(first.getUTCDate() - 6);
  return {
    policy_version: ORIGINAL_OUTCOME_BACKLOG_SCOPE,
    from_trading_date: first.toISOString().slice(0, 10),
    through_trading_date: through,
    ordering: "oldest_original_first" as const,
    older_sources: "outside_bounded_recovery_not_proven_complete" as const,
  };
}
