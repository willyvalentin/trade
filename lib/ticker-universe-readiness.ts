import type { TureConfidenceBucket } from "@/lib/confidence-calibration";
import type { DynamicMarketMoversSummary } from "@/lib/dynamic-market-movers";
import type { TureIndustry, TureSector } from "@/lib/sector-industry-mapping";
import type {
  TureTickerConfidence,
  TureTickerProfile,
  TureTickerProfileSummary,
} from "@/lib/ticker-profile";

export type TickerUniverseReadinessLabel =
  | "core_candidate"
  | "observed"
  | "research_heavy"
  | "needs_more_data"
  | "deprioritize_later"
  | "unknown";

export type TickerUniversePrimarySignal =
  | "collect_more_universe_data"
  | "monitor_static_universe"
  | "compare_research_vs_visible_tickers"
  | "connect_dynamic_movers_provider"
  | "review_sector_coverage"
  | "review_weak_high_sample_tickers";

export type TickerUniverseReadinessDynamicMoversInput =
  | Pick<
      DynamicMarketMoversSummary,
      "status" | "fetched_count" | "selected_count" | "gaps"
    >
  | null;

export type TickerUniverseReadinessInput = {
  configured_static_universe_count?: number | null;
  observed_tickers?: string[] | null;
  evaluated_tickers?: string[] | null;
  visible_tickers?: string[] | null;
  ticker_profiles?: TureTickerProfile[] | null;
  ticker_profile_summary?: TureTickerProfileSummary | null;
  dynamic_movers?: TickerUniverseReadinessDynamicMoversInput;
  confidence_bucket_mix_by_ticker?: Record<
    string,
    Partial<Record<TureConfidenceBucket, number>>
  > | null;
};

export type TickerUniverseReadinessMetric = {
  ticker: string;
  sector: TureSector;
  industry: TureIndustry;
  profile_status: TureTickerProfile["ticker_status"];
  outcome_count: number;
  unique_snapshot_count: number;
  visible_outcome_count: number;
  research_only_outcome_count: number;
  unknown_visibility_outcome_count: number;
  entry_trigger_rate: number | null;
  target_hit_count: number;
  stop_hit_count: number;
  neither_hit_count: number;
  avg_best_r: number | null;
  avg_worst_r: number | null;
  avg_terminal_r: number | null;
  confidence_bucket_mix: Partial<Record<TureConfidenceBucket, number>>;
  setup_mix: Record<string, number>;
  caution: string[];
  reason: string[];
  readiness_label: TickerUniverseReadinessLabel;
  sample_confidence: TureTickerConfidence;
  advisory_only: true;
};

export type TickerUniverseReadinessSummary = {
  advisory_only: true;
  universe_status: {
    configured_static_universe_count: number | null;
    observed_today_count: number;
    evaluated_today_count: number;
    visible_today_count: number;
    profile_count: number;
    dynamic_movers_enabled: boolean;
    dynamic_movers_available: boolean;
  };
  ticker_classification: {
    core_candidates: string[];
    observed_candidates: string[];
    research_heavy_candidates: string[];
    needs_more_data: string[];
    possible_deprioritization_candidates: string[];
    dynamic_mover_gap_candidates: string[];
  };
  sector_coverage: {
    sectors_observed: Array<{ sector: TureSector; count: number }>;
    sectors_with_positive_signal: TureSector[];
    sectors_with_negative_signal: TureSector[];
    sectors_needing_more_data: TureSector[];
    overrepresented_sectors: TureSector[];
    underrepresented_sectors: TureSector[];
  };
  ticker_metrics: TickerUniverseReadinessMetric[];
  dynamic_movers_gap: {
    provider_enabled: boolean;
    provider_available: boolean;
    returned_count: number;
    selected_count: number;
    gap_reason: string | null;
    candidates: string[];
  };
  summary: {
    sample_confidence: TureTickerConfidence;
    primary_universe_signal: TickerUniversePrimarySignal;
    recommended_focus: string[];
    safe_to_change_universe: false;
  };
  safety: {
    advisory_only: true;
    scanner_universe_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
};

const majorSectors: TureSector[] = [
  "technology",
  "communication_services",
  "consumer_discretionary",
  "financials",
  "healthcare",
  "energy",
  "industrials",
  "crypto_linked",
];

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : "UNKNOWN";
}

function uniqueTickers(values: string[] | null | undefined) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => normalizeTicker(value))
        .filter((value) => value !== "UNKNOWN"),
    ),
  ).sort();
}

function finiteCount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function sampleConfidenceFromCount(count: number): TureTickerConfidence {
  if (count >= 100) return "high";
  if (count >= 30) return "medium";
  return "low";
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function topTickers(values: string[]) {
  return values.slice(0, 12);
}

function isDynamicAvailable(dynamicMovers: TickerUniverseReadinessDynamicMoversInput) {
  return (
    dynamicMovers?.status === "available" ||
    dynamicMovers?.status === "partial" ||
    finiteCount(dynamicMovers?.fetched_count) > 0 ||
    finiteCount(dynamicMovers?.selected_count) > 0
  );
}

function isDynamicEnabled(dynamicMovers: TickerUniverseReadinessDynamicMoversInput) {
  return Boolean(dynamicMovers && dynamicMovers.status !== "disabled");
}

function weakHighSampleProfile(profile: TureTickerProfile) {
  if (profile.sample_confidence !== "high") return false;
  if (profile.ticker_status === "deprioritized") return true;

  return (
    (profile.avg_best_r !== null && profile.avg_best_r < 0.15) ||
    (profile.avg_worst_r !== null && profile.avg_worst_r <= -0.75) ||
    profile.caution_flags.includes("weak_follow_through") ||
    profile.caution_flags.includes("high_entry_not_triggering")
  );
}

function classificationFor(profile: TureTickerProfile): TickerUniverseReadinessLabel {
  if (profile.ticker === "UNKNOWN") return "unknown";
  if (weakHighSampleProfile(profile)) return "deprioritize_later";
  if (
    profile.research_only_outcome_count > profile.visible_outcome_count ||
    (profile.research_only_outcome_count > 0 &&
      profile.visible_outcome_count === 0)
  ) {
    return "research_heavy";
  }
  if (profile.sample_confidence === "low") {
    return profile.visible_outcome_count > 0 ? "observed" : "needs_more_data";
  }
  if (
    profile.visible_outcome_count > 0 &&
    profile.ticker_status !== "deprioritized"
  ) {
    return "core_candidate";
  }
  if (profile.outcome_count > 0) return "observed";

  return "needs_more_data";
}

function reasonsFor(
  profile: TureTickerProfile,
  label: TickerUniverseReadinessLabel,
) {
  const reasons: string[] = [];

  if (label === "core_candidate") {
    reasons.push("visible history with non-low sample confidence");
  }
  if (label === "observed") {
    reasons.push("observed but sample is not large enough for core status");
  }
  if (label === "research_heavy") {
    reasons.push("research-only outcomes exceed visible outcomes");
  }
  if (label === "needs_more_data") {
    reasons.push("needs more evaluated outcomes before universe decisions");
  }
  if (label === "deprioritize_later") {
    reasons.push("high-sample weak ticker profile requires manual review");
  }
  if (profile.caution_flags.length > 0) {
    reasons.push(...profile.caution_flags.slice(0, 3));
  }

  return reasons.length > 0 ? reasons : ["no strong advisory signal"];
}

function buildMetric(input: {
  profile: TureTickerProfile;
  confidenceBucketMix: Partial<Record<TureConfidenceBucket, number>>;
}): TickerUniverseReadinessMetric {
  const label = classificationFor(input.profile);

  return {
    ticker: input.profile.ticker,
    sector: input.profile.sector_group,
    industry: input.profile.industry,
    profile_status: input.profile.ticker_status,
    outcome_count: input.profile.outcome_count,
    unique_snapshot_count: input.profile.unique_snapshot_count,
    visible_outcome_count: input.profile.visible_outcome_count,
    research_only_outcome_count: input.profile.research_only_outcome_count,
    unknown_visibility_outcome_count:
      input.profile.unknown_visibility_outcome_count,
    entry_trigger_rate: input.profile.entry_trigger_rate,
    target_hit_count: input.profile.target_hit_count,
    stop_hit_count: input.profile.stop_hit_count,
    neither_hit_count: input.profile.neither_hit_count,
    avg_best_r: input.profile.avg_best_r,
    avg_worst_r: input.profile.avg_worst_r,
    avg_terminal_r: input.profile.avg_terminal_r,
    confidence_bucket_mix: input.confidenceBucketMix,
    setup_mix: input.profile.setup_family_mix,
    caution: input.profile.caution_flags,
    reason: reasonsFor(input.profile, label),
    readiness_label: label,
    sample_confidence: input.profile.sample_confidence,
    advisory_only: true,
  };
}

function sectorCoverage(metrics: TickerUniverseReadinessMetric[]) {
  const sectorCounts: Record<string, number> = {};
  const positive: TureSector[] = [];
  const negative: TureSector[] = [];
  const needsData: TureSector[] = [];

  for (const metric of metrics) {
    increment(sectorCounts, metric.sector);
    if ((metric.avg_best_r ?? Number.NEGATIVE_INFINITY) >= 0.5) {
      pushUnique(positive, metric.sector);
    }
    if ((metric.avg_worst_r ?? Number.POSITIVE_INFINITY) <= -0.5) {
      pushUnique(negative, metric.sector);
    }
    if (metric.sample_confidence === "low") {
      pushUnique(needsData, metric.sector);
    }
  }

  const total = metrics.length;
  const overrepresented = Object.entries(sectorCounts)
    .filter(([, count]) => count >= 3 && total > 0 && count / total >= 0.45)
    .map(([sector]) => sector as TureSector);
  const underrepresented =
    total >= 5
      ? majorSectors.filter((sector) => (sectorCounts[sector] ?? 0) === 0)
      : [];

  return {
    sectors_observed: Object.entries(sectorCounts)
      .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
      .map(([sector, count]) => ({ sector: sector as TureSector, count })),
    sectors_with_positive_signal: positive.sort(),
    sectors_with_negative_signal: negative.sort(),
    sectors_needing_more_data: needsData.sort(),
    overrepresented_sectors: overrepresented.sort(),
    underrepresented_sectors: underrepresented.sort(),
  };
}

function primarySignal(input: {
  metrics: TickerUniverseReadinessMetric[];
  dynamicAvailable: boolean;
  researchHeavyCount: number;
  possibleDeprioritizationCount: number;
  overrepresentedSectorCount: number;
}) {
  if (input.metrics.length === 0) return "collect_more_universe_data";
  if (!input.dynamicAvailable) return "connect_dynamic_movers_provider";
  if (input.possibleDeprioritizationCount > 0) {
    return "review_weak_high_sample_tickers";
  }
  if (input.researchHeavyCount > 0) return "compare_research_vs_visible_tickers";
  if (input.overrepresentedSectorCount > 0) return "review_sector_coverage";

  return "monitor_static_universe";
}

function recommendedFocus(input: {
  metrics: TickerUniverseReadinessMetric[];
  dynamicAvailable: boolean;
  researchHeavyCount: number;
  needsMoreDataCount: number;
  possibleDeprioritizationCount: number;
  overrepresentedSectorCount: number;
  underrepresentedSectorCount: number;
}) {
  const focus: string[] = [];

  if (input.metrics.length === 0 || input.needsMoreDataCount > 0) {
    focus.push("collect_more_ticker_profile_data");
  }
  if (!input.dynamicAvailable) {
    focus.push("connect_or_review_dynamic_movers_provider");
  }
  if (input.researchHeavyCount > 0) {
    focus.push("compare_research_only_vs_visible_tickers");
  }
  if (
    input.overrepresentedSectorCount > 0 ||
    input.underrepresentedSectorCount > 0
  ) {
    focus.push("review_sector_coverage");
  }
  if (input.possibleDeprioritizationCount > 0) {
    focus.push("manual_review_before_any_universe_change");
  }

  return focus.length > 0 ? focus : ["continue_collecting_outcomes"];
}

function overallSampleConfidence(metrics: TickerUniverseReadinessMetric[]) {
  return sampleConfidenceFromCount(
    metrics.reduce((sum, metric) => sum + metric.outcome_count, 0),
  );
}

export function buildTickerUniverseReadiness(
  input: TickerUniverseReadinessInput = {},
): TickerUniverseReadinessSummary {
  const observedTickers = uniqueTickers(input.observed_tickers);
  const evaluatedTickers = uniqueTickers(input.evaluated_tickers);
  const visibleTickers = uniqueTickers(input.visible_tickers);
  const dynamicMovers = input.dynamic_movers ?? null;
  const dynamicAvailable = isDynamicAvailable(dynamicMovers);
  const dynamicEnabled = isDynamicEnabled(dynamicMovers);
  const bucketMixByTicker = input.confidence_bucket_mix_by_ticker ?? {};
  const metrics = (input.ticker_profiles ?? [])
    .map((profile) =>
      buildMetric({
        profile,
        confidenceBucketMix:
          bucketMixByTicker[normalizeTicker(profile.ticker)] ?? {},
      }),
    )
    .sort(
      (first, second) =>
        second.outcome_count - first.outcome_count ||
        first.ticker.localeCompare(second.ticker),
    );

  const classifications = {
    core_candidates: [] as string[],
    observed_candidates: [] as string[],
    research_heavy_candidates: [] as string[],
    needs_more_data: [] as string[],
    possible_deprioritization_candidates: [] as string[],
    dynamic_mover_gap_candidates: [] as string[],
  };

  for (const metric of metrics) {
    if (metric.readiness_label === "core_candidate") {
      classifications.core_candidates.push(metric.ticker);
    }
    if (metric.readiness_label === "observed") {
      classifications.observed_candidates.push(metric.ticker);
    }
    if (metric.readiness_label === "research_heavy") {
      classifications.research_heavy_candidates.push(metric.ticker);
    }
    if (
      metric.readiness_label === "needs_more_data" ||
      metric.sample_confidence === "low"
    ) {
      classifications.needs_more_data.push(metric.ticker);
    }
    if (metric.readiness_label === "deprioritize_later") {
      classifications.possible_deprioritization_candidates.push(metric.ticker);
    }
    if (
      !dynamicAvailable &&
      metric.visible_outcome_count === 0 &&
      (metric.research_only_outcome_count > 0 ||
        (metric.avg_best_r ?? Number.NEGATIVE_INFINITY) >= 0.5)
    ) {
      classifications.dynamic_mover_gap_candidates.push(metric.ticker);
    }
  }

  const coverage = sectorCoverage(metrics);
  const primary = primarySignal({
    metrics,
    dynamicAvailable,
    researchHeavyCount: classifications.research_heavy_candidates.length,
    possibleDeprioritizationCount:
      classifications.possible_deprioritization_candidates.length,
    overrepresentedSectorCount: coverage.overrepresented_sectors.length,
  });
  const gapReason =
    dynamicAvailable
      ? null
      : dynamicMovers?.gaps?.[0] ??
        (dynamicEnabled
          ? "dynamic_movers_unavailable"
          : "dynamic_movers_disabled_or_not_connected");

  return {
    advisory_only: true,
    universe_status: {
      configured_static_universe_count:
        typeof input.configured_static_universe_count === "number" &&
        Number.isFinite(input.configured_static_universe_count)
          ? Math.max(0, Math.round(input.configured_static_universe_count))
          : null,
      observed_today_count: observedTickers.length || metrics.length,
      evaluated_today_count: evaluatedTickers.length || metrics.length,
      visible_today_count: visibleTickers.length,
      profile_count:
        input.ticker_profile_summary?.profiles_built_count ?? metrics.length,
      dynamic_movers_enabled: dynamicEnabled,
      dynamic_movers_available: dynamicAvailable,
    },
    ticker_classification: {
      core_candidates: topTickers(classifications.core_candidates),
      observed_candidates: topTickers(classifications.observed_candidates),
      research_heavy_candidates: topTickers(
        classifications.research_heavy_candidates,
      ),
      needs_more_data: topTickers(classifications.needs_more_data),
      possible_deprioritization_candidates: topTickers(
        classifications.possible_deprioritization_candidates,
      ),
      dynamic_mover_gap_candidates: topTickers(
        classifications.dynamic_mover_gap_candidates,
      ),
    },
    sector_coverage: coverage,
    ticker_metrics: metrics,
    dynamic_movers_gap: {
      provider_enabled: dynamicEnabled,
      provider_available: dynamicAvailable,
      returned_count: finiteCount(dynamicMovers?.fetched_count),
      selected_count: finiteCount(dynamicMovers?.selected_count),
      gap_reason: gapReason,
      candidates: topTickers(classifications.dynamic_mover_gap_candidates),
    },
    summary: {
      sample_confidence: overallSampleConfidence(metrics),
      primary_universe_signal: primary,
      recommended_focus: recommendedFocus({
        metrics,
        dynamicAvailable,
        researchHeavyCount: classifications.research_heavy_candidates.length,
        needsMoreDataCount: classifications.needs_more_data.length,
        possibleDeprioritizationCount:
          classifications.possible_deprioritization_candidates.length,
        overrepresentedSectorCount: coverage.overrepresented_sectors.length,
        underrepresentedSectorCount: coverage.underrepresented_sectors.length,
      }),
      safe_to_change_universe: false,
    },
    safety: {
      advisory_only: true,
      scanner_universe_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
  };
}

export function tickerUniverseReadinessSummaryJson(
  summary: TickerUniverseReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
