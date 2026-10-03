export const SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION =
  "scan_provider_candidate_observation_v1" as const;

export type ScanProviderCandidateObservationReason =
  | "daily_provider_empty"
  | "daily_provider_error"
  | "daily_provider_insufficient_history"
  | "daily_refresh_credit_cap_reached"
  | "daily_stale_cache_fallback"
  | "intraday_provider_unavailable"
  | "intraday_regular_session_not_ready"
  | "intraday_refresh_credit_cap_reached"
  | "intraday_stale_cache";

export type ScanProviderCandidateObservation = {
  observation_version: typeof SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION | "scan_provider_candidate_observation_v2";
  ticker: string;
  ticker_index: number;
  status: "pending" | "rankable" | "not_rankable";
  daily_data_source:
    | "not_observed"
    | "fresh_cache"
    | "stale_cache"
    | "provider"
    | "completed_context"
    | "unavailable";
  intraday_data_source:
    | "not_observed"
    | "fresh_cache"
    | "stale_cache"
    | "provider"
    | "unavailable";
  provider_credits_reserved: number;
  reason_codes: ScanProviderCandidateObservationReason[];
};

export const SCAN_PROVIDER_CANDIDATE_OBSERVATION_SUMMARY_VERSION =
  "scan_provider_candidate_observation_summary_v1" as const;

export type ScanProviderCandidateObservationSummary = {
  summary_version: typeof SCAN_PROVIDER_CANDIDATE_OBSERVATION_SUMMARY_VERSION | "scan_provider_candidate_observation_summary_v2";
  expected_candidate_count: number;
  rankable_candidate_count: number;
  not_rankable_candidate_count: number;
  pending_candidate_count: number;
  fully_observed_candidate_count: number;
  provider_credit_cap_gap_count: number;
  provider_empty_gap_count: number;
  provider_error_gap_count: number;
  insufficient_history_gap_count: number;
  stale_fallback_count: number;
  total_reserved_credits: number;
  dominant_gap_reason: ScanProviderCandidateObservationReason | null;
};

export function summarizeScanProviderCandidateObservations(
  observations: ScanProviderCandidateObservation[],
): ScanProviderCandidateObservationSummary {
  const reasonCounts = new Map<ScanProviderCandidateObservationReason, number>();
  for (const observation of observations) {
    for (const reason of observation.reason_codes) {
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
    }
  }
  const dominantGapReason = Array.from(reasonCounts.entries()).sort(
    ([firstReason, firstCount], [secondReason, secondCount]) =>
      secondCount - firstCount || firstReason.localeCompare(secondReason),
  )[0]?.[0] ?? null;
  const hasAnyReason = (
    observation: ScanProviderCandidateObservation,
    reasons: ScanProviderCandidateObservationReason[],
  ) => observation.reason_codes.some((reason) => reasons.includes(reason));

  return {
    summary_version: observations.some(item => item.observation_version === "scan_provider_candidate_observation_v2")
      ? "scan_provider_candidate_observation_summary_v2" : SCAN_PROVIDER_CANDIDATE_OBSERVATION_SUMMARY_VERSION,
    expected_candidate_count: observations.length,
    rankable_candidate_count: observations.filter(
      (observation) => observation.status === "rankable",
    ).length,
    not_rankable_candidate_count: observations.filter(
      (observation) => observation.status === "not_rankable",
    ).length,
    pending_candidate_count: observations.filter(
      (observation) => observation.status === "pending",
    ).length,
    fully_observed_candidate_count: observations.filter(
      (observation) =>
        observation.status === "rankable" &&
        (observation.daily_data_source === "fresh_cache" ||
          observation.daily_data_source === "provider" ||
          (observation.observation_version === "scan_provider_candidate_observation_v2" && observation.daily_data_source === "completed_context")) &&
        (observation.intraday_data_source === "fresh_cache" ||
          observation.intraday_data_source === "provider"),
    ).length,
    provider_credit_cap_gap_count: observations.filter((observation) =>
      hasAnyReason(observation, [
        "daily_refresh_credit_cap_reached",
        "intraday_refresh_credit_cap_reached",
      ]),
    ).length,
    provider_empty_gap_count: observations.filter((observation) =>
      hasAnyReason(observation, ["daily_provider_empty"]),
    ).length,
    provider_error_gap_count: observations.filter((observation) =>
      hasAnyReason(observation, [
        "daily_provider_error",
        "intraday_provider_unavailable",
      ]),
    ).length,
    insufficient_history_gap_count: observations.filter((observation) =>
      hasAnyReason(observation, ["daily_provider_insufficient_history"]),
    ).length,
    stale_fallback_count: observations.filter((observation) =>
      hasAnyReason(observation, [
        "daily_stale_cache_fallback",
        "intraday_stale_cache",
      ]),
    ).length,
    total_reserved_credits: observations.reduce(
      (total, observation) => total + observation.provider_credits_reserved,
      0,
    ),
    dominant_gap_reason: dominantGapReason,
  };
}
