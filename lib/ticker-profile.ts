import {
  buildSectorIndustryLabel,
  type TureIndustry,
  type TureSector,
} from "@/lib/sector-industry-mapping";

export type TureTickerStatus =
  | "new"
  | "observed"
  | "trusted"
  | "deprioritized"
  | "unknown";

export type TureTickerConfidence = "low" | "medium" | "high";

export type TureTickerProfileRanking = {
  setup_family: string;
  avg_best_r?: number | null;
  avg_worst_r?: number | null;
  outcome_count: number;
};

export type TureTickerProfile = {
  ticker: string;
  sector: TureSector;
  industry: TureIndustry;
  sector_group: TureSector;
  ticker_status: TureTickerStatus;
  ticker_confidence: TureTickerConfidence;
  sample_confidence: TureTickerConfidence;
  outcome_count: number;
  unique_snapshot_count: number;
  visible_outcome_count: number;
  research_only_outcome_count: number;
  unknown_visibility_outcome_count: number;
  entry_triggered_count: number;
  entry_not_triggered_count: number;
  entry_trigger_rate: number | null;
  target_hit_count: number;
  stop_hit_count: number;
  neither_hit_count: number;
  avg_best_r: number | null;
  avg_worst_r: number | null;
  avg_terminal_r: number | null;
  setup_family_mix: Record<string, number>;
  window_mix: Record<string, number>;
  tier_mix: Record<string, number>;
  best_setup_families: Array<{
    setup_family: string;
    avg_best_r: number;
    outcome_count: number;
  }>;
  weak_setup_families: Array<{
    setup_family: string;
    avg_worst_r: number;
    outcome_count: number;
  }>;
  reason_codes: string[];
  caution_flags: string[];
  advisory_only: true;
};

export type TureTickerProfileSummary = {
  advisory_mode: true;
  profiles_built_count: number;
  new_count: number;
  observed_count: number;
  trusted_count: number;
  deprioritized_count: number;
  unknown_count: number;
  sample_confidence_low_count: number;
  sample_confidence_medium_count: number;
  sample_confidence_high_count: number;
  top_profiles_by_avg_best_r: TureTickerProfile[];
  weak_profiles_by_avg_worst_r: TureTickerProfile[];
  tickers_needing_more_data: string[];
  tickers_high_entry_not_triggering: string[];
  tickers_weak_follow_through: string[];
  top_caution_flags: Record<string, number>;
  unknown_ticker_profiles: string[];
};

export type TureTickerProfileInputOutcome = {
  ticker?: string | null;
  snapshot_identity?: string | null;
  visibility?: string | null;
  entry_triggered?: boolean | null;
  entry_not_triggered?: boolean | null;
  target_hit?: boolean | null;
  stop_hit?: boolean | null;
  best_r?: number | null;
  worst_r?: number | null;
  terminal_r?: number | null;
  setup_family?: string | null;
  window?: string | null;
  tier?: string | null;
};

export type BuildTickerProfileInput = {
  ticker?: string | null;
  outcomes: TureTickerProfileInputOutcome[];
};

export type BuildTickerProfilesInput = {
  outcomes: TureTickerProfileInputOutcome[];
};

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : "UNKNOWN";
}

function normalizeKey(value: string | null | undefined, fallback: string) {
  const text = value?.trim().toLowerCase() ?? "";
  return text.length > 0 ? text : fallback;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function average(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length > 0
    ? finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length
    : null;
}

function rate(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function sampleConfidence(outcomeCount: number): TureTickerConfidence {
  if (outcomeCount >= 100) return "high";
  if (outcomeCount >= 30) return "medium";
  return "low";
}

function increment(record: Record<string, number>, key: string) {
  record[key] = (record[key] ?? 0) + 1;
}

function uniqueSnapshotCount(outcomes: TureTickerProfileInputOutcome[]) {
  return new Set(
    outcomes.map((item, index) => {
      const identity = item.snapshot_identity?.trim();
      return identity && identity.length > 0
        ? identity
        : `${normalizeTicker(item.ticker)}:${index}`;
    }),
  ).size;
}

function profileRankings(
  outcomes: TureTickerProfileInputOutcome[],
  sortBy: "best" | "worst",
) {
  const groups = new Map<string, TureTickerProfileInputOutcome[]>();

  for (const outcome of outcomes) {
    const setupFamily = normalizeKey(outcome.setup_family, "unknown");
    const current = groups.get(setupFamily) ?? [];
    current.push(outcome);
    groups.set(setupFamily, current);
  }

  return Array.from(groups.entries())
    .map(([setupFamily, group]) => ({
      setup_family: setupFamily,
      avg_best_r: average(group.map((item) => finiteNumber(item.best_r))),
      avg_worst_r: average(group.map((item) => finiteNumber(item.worst_r))),
      outcome_count: group.length,
    }))
    .filter((item) =>
      sortBy === "best" ? item.avg_best_r !== null : item.avg_worst_r !== null,
    )
    .sort((first, second) =>
      sortBy === "best"
        ? (second.avg_best_r ?? Number.NEGATIVE_INFINITY) -
          (first.avg_best_r ?? Number.NEGATIVE_INFINITY)
        : (first.avg_worst_r ?? Number.POSITIVE_INFINITY) -
          (second.avg_worst_r ?? Number.POSITIVE_INFINITY),
    )
    .slice(0, 3);
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function isWeakProfile(input: {
  outcomeCount: number;
  uniqueSnapshotCount: number;
  entryNotTriggeredRate: number | null;
  stopHitRate: number | null;
  neitherRate: number | null;
  avgBestR: number | null;
  avgWorstR: number | null;
}) {
  if (input.uniqueSnapshotCount < 30 || input.outcomeCount < 30) return false;

  return (
    (input.avgBestR !== null && input.avgBestR < 0.15) ||
    (input.entryNotTriggeredRate ?? 0) >= 45 ||
    (input.stopHitRate ?? 0) >= 40 ||
    ((input.neitherRate ?? 0) >= 75 && (input.avgBestR ?? 0) < 0.25) ||
    (input.avgWorstR !== null && input.avgWorstR <= -0.75)
  );
}

function statusFor(input: {
  ticker: string;
  outcomeCount: number;
  uniqueSnapshotCount: number;
  sampleConfidence: TureTickerConfidence;
  weakProfile: boolean;
  avgBestR: number | null;
  avgWorstR: number | null;
  entryTriggerRate: number | null;
}): TureTickerStatus {
  if (input.ticker === "UNKNOWN") return "unknown";
  if (input.uniqueSnapshotCount < 5) return "new";
  if (input.weakProfile) return "deprioritized";
  if (
    input.uniqueSnapshotCount >= 30 &&
    input.sampleConfidence === "high" &&
    (input.avgBestR ?? 0) >= 0.35 &&
    (input.avgWorstR ?? -1) > -0.75 &&
    (input.entryTriggerRate ?? 0) >= 50
  ) {
    return "trusted";
  }

  return "observed";
}

function confidenceFor(input: {
  sampleConfidence: TureTickerConfidence;
  tickerStatus: TureTickerStatus;
  avgBestR: number | null;
  avgWorstR: number | null;
  entryTriggerRate: number | null;
}) {
  if (input.sampleConfidence === "high" && input.tickerStatus === "trusted") {
    return "high";
  }
  if (
    input.sampleConfidence === "medium" &&
    input.tickerStatus !== "deprioritized" &&
    (input.avgBestR ?? 0) >= 0.2 &&
    (input.avgWorstR ?? -1) > -0.85 &&
    (input.entryTriggerRate ?? 0) >= 45
  ) {
    return "medium";
  }

  return "low";
}

export function buildTickerProfileForTicker(
  input: BuildTickerProfileInput,
): TureTickerProfile {
  const ticker = normalizeTicker(
    input.ticker ?? input.outcomes.find((item) => item.ticker)?.ticker,
  );
  const outcomes = input.outcomes;
  const sectorProfile = buildSectorIndustryLabel({ ticker });
  const outcomeCount = outcomes.length;
  const snapshotCount = uniqueSnapshotCount(outcomes);
  const visibleOutcomeCount = outcomes.filter(
    (item) => item.visibility === "visible",
  ).length;
  const researchOnlyOutcomeCount = outcomes.filter(
    (item) => item.visibility === "research_only",
  ).length;
  const unknownVisibilityOutcomeCount = outcomes.filter(
    (item) =>
      item.visibility !== "visible" && item.visibility !== "research_only",
  ).length;
  const entryTriggeredCount = outcomes.filter(
    (item) => item.entry_triggered === true,
  ).length;
  const entryNotTriggeredCount = outcomes.filter(
    (item) => item.entry_not_triggered === true,
  ).length;
  const targetHitCount = outcomes.filter((item) => item.target_hit === true).length;
  const stopHitCount = outcomes.filter((item) => item.stop_hit === true).length;
  const neitherHitCount = outcomes.filter(
    (item) =>
      item.target_hit !== true &&
      item.stop_hit !== true &&
      item.entry_not_triggered !== true,
  ).length;
  const entryTriggerRate = rate(entryTriggeredCount, outcomeCount);
  const entryNotTriggeredRate = rate(entryNotTriggeredCount, outcomeCount);
  const stopHitRate = rate(stopHitCount, outcomeCount);
  const neitherRate = rate(neitherHitCount, outcomeCount);
  const avgBestR = average(outcomes.map((item) => finiteNumber(item.best_r)));
  const avgWorstR = average(outcomes.map((item) => finiteNumber(item.worst_r)));
  const avgTerminalR = average(
    outcomes.map((item) => finiteNumber(item.terminal_r)),
  );
  const setupFamilyMix: Record<string, number> = {};
  const windowMix: Record<string, number> = {};
  const tierMix: Record<string, number> = {};

  for (const outcome of outcomes) {
    increment(setupFamilyMix, normalizeKey(outcome.setup_family, "unknown"));
    increment(windowMix, normalizeKey(outcome.window, "unknown"));
    increment(tierMix, normalizeKey(outcome.tier, "unknown"));
  }

  const sampleConfidenceValue = sampleConfidence(outcomeCount);
  const weakProfile = isWeakProfile({
    outcomeCount,
    uniqueSnapshotCount: snapshotCount,
    entryNotTriggeredRate,
    stopHitRate,
    neitherRate,
    avgBestR,
    avgWorstR,
  });
  const tickerStatus = statusFor({
    ticker,
    outcomeCount,
    uniqueSnapshotCount: snapshotCount,
    sampleConfidence: sampleConfidenceValue,
    weakProfile,
    avgBestR,
    avgWorstR,
    entryTriggerRate,
  });
  const tickerConfidence = confidenceFor({
    sampleConfidence: sampleConfidenceValue,
    tickerStatus,
    avgBestR,
    avgWorstR,
    entryTriggerRate,
  });
  const reasonCodes: string[] = [];
  const cautionFlags: string[] = [];

  if (visibleOutcomeCount > 0) pushUnique(reasonCodes, "has_visible_outcomes");
  if (researchOnlyOutcomeCount > 0) {
    pushUnique(reasonCodes, "has_research_only_outcomes");
  }
  if (Object.keys(setupFamilyMix).length > 0) {
    pushUnique(reasonCodes, "has_setup_family_mix");
  }
  if (sectorProfile.mapping_source !== "unknown") {
    pushUnique(reasonCodes, "has_sector_mapping");
  }
  if (sampleConfidenceValue === "medium") pushUnique(reasonCodes, "medium_sample_size");
  if (sampleConfidenceValue === "high") pushUnique(reasonCodes, "high_sample_size");
  if (entryTriggerRate !== null) {
    pushUnique(reasonCodes, "entry_trigger_rate_available");
  }
  if (avgBestR !== null) pushUnique(reasonCodes, "avg_best_r_available");
  if (avgWorstR !== null) pushUnique(reasonCodes, "avg_worst_r_available");

  if (outcomeCount < 30) pushUnique(cautionFlags, "insufficient_outcome_history");
  if ((avgBestR ?? 0) < 0.25 && outcomeCount > 0) {
    pushUnique(cautionFlags, "weak_follow_through");
  }
  if ((entryNotTriggeredRate ?? 0) >= 40) {
    pushUnique(cautionFlags, "high_entry_not_triggering_rate");
  }
  if ((neitherRate ?? 0) >= 60) pushUnique(cautionFlags, "high_neither_rate");
  if (avgBestR !== null && avgBestR < 0) pushUnique(cautionFlags, "negative_avg_best_r");
  if (avgWorstR !== null && avgWorstR < 0) {
    pushUnique(cautionFlags, "negative_avg_worst_r");
  }
  if ((stopHitRate ?? 0) >= 35) pushUnique(cautionFlags, "high_stop_hit_rate");
  if (sectorProfile.mapping_source === "unknown") {
    pushUnique(cautionFlags, "unknown_sector_mapping");
  }
  if (setupFamilyMix.unknown && setupFamilyMix.unknown > 0) {
    pushUnique(cautionFlags, "unknown_setup_mix");
  }
  if (researchOnlyOutcomeCount > visibleOutcomeCount && researchOnlyOutcomeCount > 0) {
    pushUnique(cautionFlags, "research_only_heavy_sample");
  }
  if (visibleOutcomeCount < 5) pushUnique(cautionFlags, "visible_sample_too_small");

  return {
    ticker,
    sector: sectorProfile.sector,
    industry: sectorProfile.industry,
    sector_group: sectorProfile.sector_group,
    ticker_status: tickerStatus,
    ticker_confidence: tickerConfidence,
    sample_confidence: sampleConfidenceValue,
    outcome_count: outcomeCount,
    unique_snapshot_count: snapshotCount,
    visible_outcome_count: visibleOutcomeCount,
    research_only_outcome_count: researchOnlyOutcomeCount,
    unknown_visibility_outcome_count: unknownVisibilityOutcomeCount,
    entry_triggered_count: entryTriggeredCount,
    entry_not_triggered_count: entryNotTriggeredCount,
    entry_trigger_rate: entryTriggerRate,
    target_hit_count: targetHitCount,
    stop_hit_count: stopHitCount,
    neither_hit_count: neitherHitCount,
    avg_best_r: avgBestR,
    avg_worst_r: avgWorstR,
    avg_terminal_r: avgTerminalR,
    setup_family_mix: setupFamilyMix,
    window_mix: windowMix,
    tier_mix: tierMix,
    best_setup_families: profileRankings(outcomes, "best").map((item) => ({
      setup_family: item.setup_family,
      avg_best_r: item.avg_best_r ?? 0,
      outcome_count: item.outcome_count,
    })),
    weak_setup_families: profileRankings(outcomes, "worst").map((item) => ({
      setup_family: item.setup_family,
      avg_worst_r: item.avg_worst_r ?? 0,
      outcome_count: item.outcome_count,
    })),
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    advisory_only: true,
  };
}

export function buildTickerProfiles(
  input: BuildTickerProfilesInput,
): TureTickerProfile[] {
  const groups = new Map<string, TureTickerProfileInputOutcome[]>();

  for (const outcome of input.outcomes) {
    const ticker = normalizeTicker(outcome.ticker);
    const current = groups.get(ticker) ?? [];
    current.push(outcome);
    groups.set(ticker, current);
  }

  return Array.from(groups.entries())
    .map(([ticker, outcomes]) => buildTickerProfileForTicker({ ticker, outcomes }))
    .sort((first, second) => {
      if (second.outcome_count !== first.outcome_count) {
        return second.outcome_count - first.outcome_count;
      }
      return first.ticker.localeCompare(second.ticker);
    });
}

export function buildTickerProfileSummary(
  profiles: TureTickerProfile[],
): TureTickerProfileSummary {
  const topCautionFlags: Record<string, number> = {};

  for (const profile of profiles) {
    for (const flag of profile.caution_flags) {
      topCautionFlags[flag] = (topCautionFlags[flag] ?? 0) + 1;
    }
  }

  return {
    advisory_mode: true,
    profiles_built_count: profiles.length,
    new_count: profiles.filter((item) => item.ticker_status === "new").length,
    observed_count: profiles.filter((item) => item.ticker_status === "observed").length,
    trusted_count: profiles.filter((item) => item.ticker_status === "trusted").length,
    deprioritized_count: profiles.filter(
      (item) => item.ticker_status === "deprioritized",
    ).length,
    unknown_count: profiles.filter((item) => item.ticker_status === "unknown").length,
    sample_confidence_low_count: profiles.filter(
      (item) => item.sample_confidence === "low",
    ).length,
    sample_confidence_medium_count: profiles.filter(
      (item) => item.sample_confidence === "medium",
    ).length,
    sample_confidence_high_count: profiles.filter(
      (item) => item.sample_confidence === "high",
    ).length,
    top_profiles_by_avg_best_r: [...profiles]
      .filter((item) => item.avg_best_r !== null)
      .sort(
        (first, second) =>
          (second.avg_best_r ?? Number.NEGATIVE_INFINITY) -
          (first.avg_best_r ?? Number.NEGATIVE_INFINITY),
      )
      .slice(0, 5),
    weak_profiles_by_avg_worst_r: [...profiles]
      .filter((item) => item.avg_worst_r !== null)
      .sort(
        (first, second) =>
          (first.avg_worst_r ?? Number.POSITIVE_INFINITY) -
          (second.avg_worst_r ?? Number.POSITIVE_INFINITY),
      )
      .slice(0, 5),
    tickers_needing_more_data: profiles
      .filter((item) => item.caution_flags.includes("insufficient_outcome_history"))
      .map((item) => item.ticker)
      .slice(0, 10),
    tickers_high_entry_not_triggering: profiles
      .filter((item) =>
        item.caution_flags.includes("high_entry_not_triggering_rate"),
      )
      .map((item) => item.ticker)
      .slice(0, 10),
    tickers_weak_follow_through: profiles
      .filter((item) => item.caution_flags.includes("weak_follow_through"))
      .map((item) => item.ticker)
      .slice(0, 10),
    top_caution_flags: topCautionFlags,
    unknown_ticker_profiles: profiles
      .filter((item) => item.ticker_status === "unknown")
      .map((item) => item.ticker),
  };
}
