import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import type { ScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import type { ScannerCandidate } from "@/lib/scanner";
import {
  scannerUniverseSelectionToBaseCandidates,
  selectScannerUniverse,
  type ScannerUniverseCoverageSummary,
  type ScannerUniverseSelection,
} from "@/lib/scanner-universe";

export type RealScannerCandidateGenerationStatus =
  | "ready"
  | "partial"
  | "provider_limited"
  | "data_incomplete"
  | "demo_fallback"
  | "blocked"
  | "unknown";

export type RealScannerCandidateTier =
  | "strong"
  | "valid"
  | "experimental"
  | "incomplete"
  | "rejected";

export type RealScannerCandidateSignal = {
  label: string;
  value: string | number | boolean | null;
  source: "daily" | "intraday" | "local_score" | "plan" | "provider";
};

export type RealScannerCandidateWarning = {
  code: string;
  message: string;
  severity: "info" | "warning" | "blocked";
};

export type RealScannerCandidateScore = {
  value: number;
  tier: RealScannerCandidateTier;
  reasons: string[];
  warnings: RealScannerCandidateWarning[];
};

export type RealScannerCandidate = {
  ticker: string;
  company_name: string;
  sector: string;
  tier: RealScannerCandidateTier;
  score: RealScannerCandidateScore;
  signals: RealScannerCandidateSignal[];
  warnings: RealScannerCandidateWarning[];
  data_source: ScannerCandidate["intraday_indicator_source"] | "daily_only";
  provider_source: "twelve_data" | null;
  market_data_timestamp: string | null;
  stale: boolean;
  entry_low: number | null;
  entry_high: number | null;
  stop_loss: number | null;
  target_1: number | null;
  target_2: number | null;
  risk_reward: number | null;
};

export type RealScannerUniverseSummary = {
  tickers: string[];
  tickers_scanned: number;
  total_universe_size: number;
  enabled_tickers: number;
  selected_ticker_count: number;
  scan_budget: ScannerUniverseCoverageSummary["scan_budget"] | null;
  category_breakdown: ScannerUniverseCoverageSummary["category_breakdown"];
  liquidity_breakdown: ScannerUniverseCoverageSummary["liquidity_breakdown"];
  tradable_tickers: number;
  context_only_tickers: number;
  selected_context_only_tickers: number;
  coverage: ScannerUniverseCoverageSummary | null;
  dynamic_movers: ScannerUniverseCoverageSummary["dynamic_movers"];
  dynamic_mover_selected_count: number;
  candidates_generated: number;
  provider_backed_candidates: number;
  stale_candidates: number;
  missing_required_price_candidates: number;
};

export type RealScannerCandidateGenerationSummary = {
  status: RealScannerCandidateGenerationStatus;
  generated_at: string;
  scan_window: IntradayScanWindow | "unknown";
  source: string;
  provider_source: "twelve_data" | null;
  target_visible_candidates_min: number;
  target_visible_candidates_max: number;
  visible_candidate_tickers: string[];
  universe: RealScannerUniverseSummary;
  candidates: RealScannerCandidate[];
  scanner_candidate_ranking: ScannerCandidateRankingSummary | null;
  tier_counts: Record<RealScannerCandidateTier, number>;
  average_score: number | null;
  warnings: RealScannerCandidateWarning[];
  gaps: string[];
};

type CandidateWithOptionalScore = ScannerCandidate & {
  local_score?: number;
  local_score_reasons?: string[];
  local_score_warnings?: string[];
};

const realScannerFallbackUniverse = [
  { ticker: "AAPL", company_name: "Apple Inc.", sector: "Technology" },
  { ticker: "MSFT", company_name: "Microsoft Corporation", sector: "Technology" },
  { ticker: "NVDA", company_name: "NVIDIA Corporation", sector: "Technology" },
  { ticker: "TSLA", company_name: "Tesla, Inc.", sector: "Consumer Discretionary" },
  { ticker: "AMD", company_name: "Advanced Micro Devices, Inc.", sector: "Technology" },
  { ticker: "META", company_name: "Meta Platforms, Inc.", sector: "Communication Services" },
  { ticker: "AMZN", company_name: "Amazon.com, Inc.", sector: "Consumer Discretionary" },
  { ticker: "GOOGL", company_name: "Alphabet Inc.", sector: "Communication Services" },
  { ticker: "NFLX", company_name: "Netflix, Inc.", sector: "Communication Services" },
  { ticker: "PLTR", company_name: "Palantir Technologies Inc.", sector: "Technology" },
  { ticker: "COIN", company_name: "Coinbase Global, Inc.", sector: "Financials" },
  { ticker: "MSTR", company_name: "MicroStrategy Incorporated", sector: "Technology" },
  { ticker: "SMCI", company_name: "Super Micro Computer, Inc.", sector: "Technology" },
  { ticker: "AVGO", company_name: "Broadcom Inc.", sector: "Technology" },
  { ticker: "JPM", company_name: "JPMorgan Chase & Co.", sector: "Financials" },
  { ticker: "BAC", company_name: "Bank of America Corporation", sector: "Financials" },
  { ticker: "DIS", company_name: "The Walt Disney Company", sector: "Communication Services" },
  { ticker: "NKE", company_name: "NIKE, Inc.", sector: "Consumer Discretionary" },
  { ticker: "SHOP", company_name: "Shopify Inc.", sector: "Technology" },
  { ticker: "UBER", company_name: "Uber Technologies, Inc.", sector: "Industrials" },
] satisfies Array<Pick<ScannerCandidate, "ticker" | "company_name" | "sector">>;

export const realScannerStarterUniverse =
  scannerUniverseSelectionToBaseCandidates(
    selectScannerUniverse({ scanWindow: "morning_momentum" }),
  ).map((candidate) => ({
    ticker: candidate.ticker,
    company_name: candidate.company_name,
    sector: candidate.sector,
  }));

export function buildRealScannerBaseCandidateSelection({
  scanWindow = "unknown",
  requestedScanBudget,
}: {
  scanWindow?: IntradayScanWindow | "unknown";
  requestedScanBudget?: number | null;
} = {}) {
  try {
    const selection = selectScannerUniverse({
      scanWindow,
      requestedScanBudget,
    });
    const candidates = scannerUniverseSelectionToBaseCandidates(selection);

    if (candidates.length > 0) {
      return {
        candidates,
        selection,
        coverage: selection.coverage_summary,
      };
    }
  } catch (error) {
    console.error("[real_scanner_candidate_generation] universe_selection_error", {
      error: error instanceof Error ? error.message : "Unknown scanner universe error.",
    });
  }

  return {
    candidates: buildRealScannerBaseCandidates(realScannerFallbackUniverse),
    selection: null,
    coverage: null,
  };
}

export function buildRealScannerBaseCandidates(
  universe = realScannerStarterUniverse,
): ScannerCandidate[] {
  return universe.map((candidate) => ({
    ticker: candidate.ticker,
    company_name: candidate.company_name,
    sector: candidate.sector,
    mock_current_price: 0,
    mock_trend: "Starter scanner universe; use provider/cache fields when available.",
    mock_volume_context:
      "Starter scanner universe; volume context requires provider/cache data.",
    mock_support: 0,
    mock_resistance: 0,
    mock_news_context: "Starter universe only; no live headlines used.",
  }));
}

export function buildRealScannerCandidateGenerationSummary({
  universe,
  candidates,
  scanWindow = "unknown",
  source = "unknown",
  visibleCandidateTickers = [],
  providerSource = "twelve_data",
  universeSelection = null,
  scannerCandidateRanking = null,
  now = new Date(),
}: {
  universe: ScannerCandidate[];
  candidates: CandidateWithOptionalScore[];
  scanWindow?: IntradayScanWindow | "unknown";
  source?: string;
  visibleCandidateTickers?: string[];
  providerSource?: "twelve_data" | null;
  universeSelection?: ScannerUniverseSelection | null;
  scannerCandidateRanking?: ScannerCandidateRankingSummary | null;
  now?: Date;
}): RealScannerCandidateGenerationSummary {
  const universeCoverage = universeSelection?.coverage_summary ?? null;
  const visibleTickerSet = new Set(visibleCandidateTickers);
  const generatedCandidates = candidates
    .map(toRealScannerCandidate)
    .sort((first, second) => second.score.value - first.score.value);
  const visibleCandidates =
    visibleTickerSet.size > 0
      ? generatedCandidates.filter((candidate) =>
          visibleTickerSet.has(candidate.ticker),
        )
      : generatedCandidates.filter((candidate) =>
          candidate.tier === "strong" ||
          candidate.tier === "valid" ||
          candidate.tier === "experimental",
        );
  const missingRequiredPriceCandidates = generatedCandidates.filter((candidate) =>
    candidate.warnings.some((warning) => warning.code === "missing_required_price"),
  ).length;
  const staleCandidates = generatedCandidates.filter(
    (candidate) => candidate.stale,
  ).length;
  const providerBackedCandidates = generatedCandidates.filter(
    (candidate) => candidate.provider_source !== null,
  ).length;
  const tierCounts = createTierCounts(generatedCandidates);
  const averageScore =
    generatedCandidates.length > 0
      ? roundNumber(
          generatedCandidates.reduce(
            (sum, candidate) => sum + candidate.score.value,
            0,
          ) / generatedCandidates.length,
        )
      : null;
  const gaps = buildGaps({
    universeCount: universe.length,
    candidateCount: generatedCandidates.length,
    visibleCount: visibleCandidates.length,
    missingRequiredPriceCandidates,
    staleCandidates,
    providerBackedCandidates,
  });
  const warnings = buildSummaryWarnings({
    universeCount: universe.length,
    candidateCount: generatedCandidates.length,
    visibleCount: visibleCandidates.length,
    missingRequiredPriceCandidates,
    staleCandidates,
    providerBackedCandidates,
    universeCoverage,
  });

  return {
    status: determineStatus({
      universeCount: universe.length,
      candidateCount: generatedCandidates.length,
      visibleCount: visibleCandidates.length,
      missingRequiredPriceCandidates,
      staleCandidates,
      providerBackedCandidates,
    }),
    generated_at: now.toISOString(),
    scan_window: scanWindow,
    source,
    provider_source: providerSource,
    target_visible_candidates_min: 6,
    target_visible_candidates_max: 10,
    visible_candidate_tickers: visibleCandidates
      .map((candidate) => candidate.ticker)
      .slice(0, 10),
    universe: {
      tickers: universe.map((candidate) => candidate.ticker),
      tickers_scanned: universe.length,
      total_universe_size:
        universeCoverage?.total_universe_size ?? universe.length,
      enabled_tickers: universeCoverage?.enabled_tickers ?? universe.length,
      selected_ticker_count:
        universeCoverage?.selected_tickers ?? universe.length,
      scan_budget: universeCoverage?.scan_budget ?? null,
      category_breakdown: universeCoverage?.category_breakdown ?? [],
      liquidity_breakdown: universeCoverage?.liquidity_breakdown ?? [],
      tradable_tickers: universeCoverage?.tradable_tickers ?? universe.length,
      context_only_tickers: universeCoverage?.context_only_tickers ?? 0,
      selected_context_only_tickers:
        universeCoverage?.selected_context_only_tickers ?? 0,
      coverage: universeCoverage,
      dynamic_movers: universeCoverage?.dynamic_movers ?? null,
      dynamic_mover_selected_count:
        universeCoverage?.dynamic_mover_selected_count ?? 0,
      candidates_generated: generatedCandidates.length,
      provider_backed_candidates: providerBackedCandidates,
      stale_candidates: staleCandidates,
      missing_required_price_candidates: missingRequiredPriceCandidates,
    },
    candidates: generatedCandidates.slice(0, 12),
    scanner_candidate_ranking: scannerCandidateRanking,
    tier_counts: tierCounts,
    average_score: averageScore,
    warnings,
    gaps,
  };
}

export function realScannerCandidateGenerationSummaryJson(
  summary: RealScannerCandidateGenerationSummary,
) {
  return JSON.stringify(summary, null, 2);
}

function toRealScannerCandidate(
  candidate: CandidateWithOptionalScore,
): RealScannerCandidate {
  const latestPrice = numberOrNull(
    candidate.latest_close ?? candidate.intraday_indicators?.latestPrice,
  );
  const entryLow = numberOrNull(candidate.proposed_entry_low);
  const entryHigh = numberOrNull(candidate.proposed_entry_high);
  const stopLoss = numberOrNull(candidate.proposed_stop_loss);
  const target1 = numberOrNull(candidate.proposed_target_1);
  const target2 = numberOrNull(candidate.proposed_target_2);
  const riskReward = numberOrNull(candidate.proposed_risk_reward);
  const warnings = buildCandidateWarnings(candidate, {
    latestPrice,
    entryLow,
    entryHigh,
    stopLoss,
    target1,
    target2,
    riskReward,
  });
  const signals = buildCandidateSignals(candidate, {
    latestPrice,
    entryLow,
    entryHigh,
    stopLoss,
    target1,
    target2,
    riskReward,
  });
  const scoreValue = scoreCandidate(candidate, warnings);
  const tier = tierForScore(scoreValue, warnings);

  return {
    ticker: candidate.ticker,
    company_name: candidate.company_name,
    sector: candidate.sector,
    tier,
    score: {
      value: scoreValue,
      tier,
      reasons: candidate.local_score_reasons?.slice(0, 5) ?? [],
      warnings,
    },
    signals,
    warnings,
    data_source:
      candidate.intraday_indicator_source ??
      (latestPrice !== null ? "daily_only" : "unavailable"),
    provider_source:
      candidate.intraday_indicator_source === "fresh" ||
      candidate.intraday_indicator_source === "cache"
        ? "twelve_data"
        : null,
    market_data_timestamp: candidate.intraday_indicator_cached_at ?? null,
    stale: candidate.intraday_indicator_stale === true,
    entry_low: entryLow,
    entry_high: entryHigh,
    stop_loss: stopLoss,
    target_1: target1,
    target_2: target2,
    risk_reward: riskReward,
  };
}

function buildCandidateSignals(
  candidate: CandidateWithOptionalScore,
  plan: {
    latestPrice: number | null;
    entryLow: number | null;
    entryHigh: number | null;
    stopLoss: number | null;
    target1: number | null;
    target2: number | null;
    riskReward: number | null;
  },
): RealScannerCandidateSignal[] {
  return [
    { label: "latest_price", value: plan.latestPrice, source: "daily" },
    { label: "volume_ratio", value: numberOrNull(candidate.volume_ratio), source: "daily" },
    {
      label: "recent_volume_ratio",
      value: numberOrNull(candidate.recent_volume_ratio),
      source: "intraday",
    },
    {
      label: "recent_change_percent",
      value: numberOrNull(candidate.recent_change_percent),
      source: "intraday",
    },
    {
      label: "distance_to_20d_high",
      value: numberOrNull(candidate.distance_to_20d_high),
      source: "daily",
    },
    {
      label: "risk_reward",
      value: plan.riskReward,
      source: "plan",
    },
    {
      label: "local_score",
      value: numberOrNull(candidate.local_score),
      source: "local_score",
    },
    {
      label: "intraday_indicator_source",
      value: candidate.intraday_indicator_source ?? "unavailable",
      source: "provider",
    },
  ];
}

function buildCandidateWarnings(
  candidate: CandidateWithOptionalScore,
  plan: {
    latestPrice: number | null;
    entryLow: number | null;
    entryHigh: number | null;
    stopLoss: number | null;
    target1: number | null;
    target2: number | null;
    riskReward: number | null;
  },
): RealScannerCandidateWarning[] {
  const warnings: RealScannerCandidateWarning[] =
    candidate.local_score_warnings?.slice(0, 5).map((message) => ({
      code: "local_score_warning",
      message,
      severity: "warning" as const,
    })) ?? [];

  if (plan.latestPrice === null) {
    warnings.push({
      code: "missing_required_price",
      message: "Latest price is unavailable; candidate should not be promoted.",
      severity: "blocked",
    });
  }

  if (
    plan.entryLow === null ||
    plan.entryHigh === null ||
    plan.stopLoss === null ||
    plan.target1 === null ||
    plan.target2 === null
  ) {
    warnings.push({
      code: "incomplete_trade_plan",
      message: "Entry, stop, or target data is incomplete.",
      severity: "warning",
    });
  }

  if (plan.riskReward !== null && plan.riskReward < 1.5) {
    warnings.push({
      code: "weak_risk_reward",
      message: "Estimated risk/reward is below the preferred day-trade range.",
      severity: "warning",
    });
  }

  if (candidate.intraday_indicator_stale === true) {
    warnings.push({
      code: "stale_intraday_indicators",
      message: "Intraday indicator cache is stale.",
      severity: "warning",
    });
  }

  if (!candidate.intraday_indicators) {
    warnings.push({
      code: "missing_intraday_indicators",
      message: "Intraday indicators are unavailable; confidence should stay conservative.",
      severity: "info",
    });
  }

  return warnings;
}

function scoreCandidate(
  candidate: CandidateWithOptionalScore,
  warnings: RealScannerCandidateWarning[],
) {
  const localScore = numberOrNull(candidate.local_score);

  if (localScore !== null) {
    return clampScore(localScore);
  }

  let score = 45;
  const latestPrice = numberOrNull(candidate.latest_close);
  const volumeRatio = numberOrNull(candidate.volume_ratio);
  const recentVolumeRatio = numberOrNull(candidate.recent_volume_ratio);
  const riskReward = numberOrNull(candidate.proposed_risk_reward);
  const recentChangePercent = numberOrNull(candidate.recent_change_percent);

  if (latestPrice !== null) score += 10;
  if ((volumeRatio ?? recentVolumeRatio ?? 0) >= 1.1) score += 10;
  if (riskReward !== null && riskReward >= 2) score += 12;
  if (recentChangePercent !== null && recentChangePercent > 0) score += 8;
  if (candidate.intraday_indicators) score += 8;

  for (const warning of warnings) {
    score -= warning.severity === "blocked" ? 30 : warning.severity === "warning" ? 8 : 3;
  }

  return clampScore(score);
}

function tierForScore(
  score: number,
  warnings: RealScannerCandidateWarning[],
): RealScannerCandidateTier {
  if (warnings.some((warning) => warning.severity === "blocked")) {
    return "rejected";
  }

  if (warnings.some((warning) => warning.code === "incomplete_trade_plan")) {
    return "incomplete";
  }

  if (score >= 78) return "strong";
  if (score >= 65) return "valid";
  if (score >= 50) return "experimental";
  return "incomplete";
}

function createTierCounts(candidates: RealScannerCandidate[]) {
  const counts: Record<RealScannerCandidateTier, number> = {
    strong: 0,
    valid: 0,
    experimental: 0,
    incomplete: 0,
    rejected: 0,
  };

  for (const candidate of candidates) {
    counts[candidate.tier] += 1;
  }

  return counts;
}

function buildSummaryWarnings({
  universeCount,
  candidateCount,
  visibleCount,
  missingRequiredPriceCandidates,
  staleCandidates,
  providerBackedCandidates,
  universeCoverage,
}: {
  universeCount: number;
  candidateCount: number;
  visibleCount: number;
  missingRequiredPriceCandidates: number;
  staleCandidates: number;
  providerBackedCandidates: number;
  universeCoverage?: ScannerUniverseCoverageSummary | null;
}) {
  const warnings: RealScannerCandidateWarning[] = [];

  if (universeCount === 0) {
    warnings.push({
      code: "empty_universe",
      message: "No scanner universe was available.",
      severity: "blocked",
    });
  }

  if (candidateCount === 0) {
    warnings.push({
      code: "no_candidates_generated",
      message: "The scanner did not return provider/cache-backed candidates.",
      severity: "warning",
    });
  }

  if (visibleCount > 0 && visibleCount < 6) {
    warnings.push({
      code: "below_visible_candidate_target",
      message: "Fewer than six learning-compatible candidates are available.",
      severity: "info",
    });
  }

  if (providerBackedCandidates === 0 && candidateCount > 0) {
    warnings.push({
      code: "no_provider_backing",
      message: "Candidates do not include fresh/cache intraday provider metadata.",
      severity: "warning",
    });
  }

  if (missingRequiredPriceCandidates > 0) {
    warnings.push({
      code: "missing_required_prices",
      message: `${missingRequiredPriceCandidates} candidates are missing required price data.`,
      severity: "warning",
    });
  }

  if (staleCandidates > 0) {
    warnings.push({
      code: "stale_candidates",
      message: `${staleCandidates} candidates have stale intraday indicator metadata.`,
      severity: "info",
    });
  }

  for (const warning of universeCoverage?.warnings ?? []) {
    warnings.push({
      code: `scanner_universe_${warning.warning_id}`,
      message: warning.message,
      severity: warning.severity,
    });
  }

  return warnings;
}

function buildGaps(input: {
  universeCount: number;
  candidateCount: number;
  visibleCount: number;
  missingRequiredPriceCandidates: number;
  staleCandidates: number;
  providerBackedCandidates: number;
}) {
  return buildSummaryWarnings(input).map((warning) => warning.message);
}

function determineStatus({
  universeCount,
  candidateCount,
  visibleCount,
  missingRequiredPriceCandidates,
  staleCandidates,
  providerBackedCandidates,
}: {
  universeCount: number;
  candidateCount: number;
  visibleCount: number;
  missingRequiredPriceCandidates: number;
  staleCandidates: number;
  providerBackedCandidates: number;
}): RealScannerCandidateGenerationStatus {
  if (universeCount === 0) return "blocked";
  if (candidateCount === 0) return "provider_limited";
  if (providerBackedCandidates === 0) return "data_incomplete";
  if (visibleCount === 0) return "data_incomplete";
  if (missingRequiredPriceCandidates > 0) return "data_incomplete";
  if (staleCandidates > candidateCount / 2) return "partial";
  if (visibleCount < 6) return "partial";
  return "ready";
}

function numberOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampScore(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 100));
}

function roundNumber(value: number) {
  return Math.round(value * 100) / 100;
}
