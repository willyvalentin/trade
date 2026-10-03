import { getNewYorkDateString } from "@/lib/intraday-scan-window";

/** Fixed recovery window for retained original sources, not live-price data.
 * No anchor is shifted; older sources remain unmeasured, never completed. */
export const ORIGINAL_OUTCOME_BACKLOG_SCOPE = "trailing_seven_ny_dates_v1" as const;

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
