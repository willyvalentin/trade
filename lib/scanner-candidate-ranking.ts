import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import type { CandidateScoreBreakdown } from "@/lib/recommendation-generator";
import type { RealScannerCandidateTier } from "@/lib/real-scanner-candidate-generation";
import type { ScannerCandidate } from "@/lib/scanner";
import type { ScannerUniverseCoverageSummary } from "@/lib/scanner-universe";

export type ScannerCandidateRankingComponent =
  | "data_completeness"
  | "freshness"
  | "price_plan_quality"
  | "signal_strength"
  | "liquidity_volume"
  | "source_quality"
  | "window_fit"
  | "warnings_penalty";

export type ScannerCandidateRankingWarning = {
  warning_id: string;
  severity: "info" | "warning" | "blocked";
  message: string;
};

export type ScannerCandidateRankingScore = {
  total_score: number;
  normalized_score: number;
  tier: RealScannerCandidateTier;
  components: Array<{
    component: ScannerCandidateRankingComponent;
    score: number;
    weight: number;
    contribution: number;
    reason: string;
  }>;
  warnings: ScannerCandidateRankingWarning[];
  gaps: string[];
};

export type ScannerCandidateRankingResult = {
  ticker: string;
  company_name: string;
  rank: number;
  selected: boolean;
  selection_bucket: "strong" | "valid" | "experimental" | "not_selected";
  rank_reason: string;
  source_contribution: "base_universe" | "dynamic_mover" | "fallback" | "unknown";
  score: ScannerCandidateRankingScore;
};

export type ScannerCandidateSelectionResult = {
  selected_tickers: string[];
  overflow_count: number;
  target_status: "below_target" | "within_target" | "above_target" | "empty";
};

export type ScannerCandidateRankingSummary = {
  summary_version: "1.0";
  summary_kind: "scanner_candidate_ranking";
  generated_at: string;
  scan_window: IntradayScanWindow | "unknown";
  candidates_ranked: number;
  selected_count: number;
  target_min: number;
  target_max: number;
  target_status: ScannerCandidateSelectionResult["target_status"];
  overflow_count: number;
  strong_count: number;
  valid_count: number;
  experimental_count: number;
  incomplete_count: number;
  rejected_count: number;
  average_score: number | null;
  score_range: {
    min: number | null;
    max: number | null;
  };
  source_contribution: Record<
    ScannerCandidateRankingResult["source_contribution"],
    number
  >;
  top_ranking_reasons: string[];
  top_penalty_reasons: string[];
  warnings: ScannerCandidateRankingWarning[];
  results: ScannerCandidateRankingResult[];
  selection: ScannerCandidateSelectionResult;
};

type RankingCandidate = ScannerCandidate & {
  local_score?: number;
  local_score_reasons?: string[];
  local_score_warnings?: string[];
  local_score_breakdown?: CandidateScoreBreakdown;
  setup_type?: string;
};

export function buildScannerCandidateRankingSummary({
  candidates,
  scanWindow = "unknown",
  universeCoverage = null,
  targetMin = 6,
  targetMax = 10,
  now = new Date(),
}: {
  candidates: RankingCandidate[];
  scanWindow?: IntradayScanWindow | "unknown";
  universeCoverage?: ScannerUniverseCoverageSummary | null;
  targetMin?: number;
  targetMax?: number;
  now?: Date;
}): ScannerCandidateRankingSummary {
  const ranked = candidates
    .map((candidate) =>
      rankCandidate(candidate, {
        scanWindow,
        universeCoverage,
      }),
    )
    .sort((first, second) => {
      if (second.score.normalized_score !== first.score.normalized_score) {
        return second.score.normalized_score - first.score.normalized_score;
      }

      return first.ticker.localeCompare(second.ticker);
    })
    .map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
  const selection = selectRankedCandidates(ranked, targetMin, targetMax);
  const selectedTickerSet = new Set(selection.selected_tickers);
  const results: ScannerCandidateRankingResult[] = ranked.map((result) => {
    const selected = selectedTickerSet.has(result.ticker);
    const selectionBucket: ScannerCandidateRankingResult["selection_bucket"] =
      selected &&
      (result.score.tier === "strong" ||
        result.score.tier === "valid" ||
        result.score.tier === "experimental")
        ? result.score.tier
        : "not_selected";

    return {
      ...result,
      selected,
      selection_bucket: selectionBucket,
    };
  });
  const scores = results.map((result) => result.score.normalized_score);
  const tierCounts = countBy(results, (result) => result.score.tier);
  const selectedResults = results.filter((result) => result.selected);
  const warnings = buildSummaryWarnings(results, selection, targetMin);

  return {
    summary_version: "1.0",
    summary_kind: "scanner_candidate_ranking",
    generated_at: now.toISOString(),
    scan_window: scanWindow,
    candidates_ranked: results.length,
    selected_count: selectedResults.length,
    target_min: targetMin,
    target_max: targetMax,
    target_status: selection.target_status,
    overflow_count: selection.overflow_count,
    strong_count: tierCounts.strong ?? 0,
    valid_count: tierCounts.valid ?? 0,
    experimental_count: tierCounts.experimental ?? 0,
    incomplete_count: tierCounts.incomplete ?? 0,
    rejected_count: tierCounts.rejected ?? 0,
    average_score: scores.length > 0 ? round(average(scores)) : null,
    score_range: {
      min: scores.length > 0 ? Math.min(...scores) : null,
      max: scores.length > 0 ? Math.max(...scores) : null,
    },
    source_contribution: {
      base_universe: results.filter(
        (result) => result.source_contribution === "base_universe",
      ).length,
      dynamic_mover: results.filter(
        (result) => result.source_contribution === "dynamic_mover",
      ).length,
      fallback: results.filter((result) => result.source_contribution === "fallback")
        .length,
      unknown: results.filter((result) => result.source_contribution === "unknown")
        .length,
    },
    top_ranking_reasons: topMessages(
      selectedResults.flatMap((result) =>
        result.score.components
          .filter((component) => component.score >= 70)
          .map((component) => component.reason),
      ),
    ),
    top_penalty_reasons: topMessages(
      results.flatMap((result) => [
        ...result.score.gaps,
        ...result.score.warnings.map((warning) => warning.message),
      ]),
    ),
    warnings,
    results: results.slice(0, 20),
    selection,
  };
}

export function scannerCandidateRankingSummaryJson(
  summary: ScannerCandidateRankingSummary,
) {
  return JSON.stringify(summary, null, 2);
}

function rankCandidate(
  candidate: RankingCandidate,
  context: {
    scanWindow: IntradayScanWindow | "unknown";
    universeCoverage: ScannerUniverseCoverageSummary | null;
  },
): Omit<ScannerCandidateRankingResult, "rank"> {
  const warnings: ScannerCandidateRankingWarning[] = [];
  const gaps: string[] = [];
  const sourceContribution = getSourceContribution(candidate, context.universeCoverage);
  const dataCompleteness = scoreDataCompleteness(candidate, gaps);
  const freshness = scoreFreshness(candidate, warnings, gaps);
  const pricePlanQuality = scorePricePlanQuality(candidate, warnings, gaps);
  const signalStrength = scoreSignalStrength(candidate, gaps);
  const liquidityVolume = scoreLiquidityVolume(candidate, warnings, gaps);
  const sourceQuality = scoreSourceQuality(candidate, sourceContribution, warnings);
  const windowFit = scoreWindowFit(candidate, context.scanWindow, gaps);
  const warningsPenalty = scoreWarningsPenalty(candidate, warnings);
  const components: ScannerCandidateRankingScore["components"] = [
    component("data_completeness", dataCompleteness, 0.16),
    component("freshness", freshness, 0.14),
    component("price_plan_quality", pricePlanQuality, 0.16),
    component("signal_strength", signalStrength, 0.18),
    component("liquidity_volume", liquidityVolume, 0.12),
    component("source_quality", sourceQuality, 0.09),
    component("window_fit", windowFit, 0.1),
    component("warnings_penalty", warningsPenalty, 0.05),
  ];
  const normalizedScore = clampScore(
    components.reduce((sum, item) => sum + item.contribution, 0),
  );
  const tier = tierForRankingScore(normalizedScore, warnings);

  return {
    ticker: candidate.ticker,
    company_name: candidate.company_name,
    selected: false,
    selection_bucket: "not_selected",
    rank_reason: buildRankReason(candidate, components, tier),
    source_contribution: sourceContribution,
    score: {
      total_score: normalizedScore,
      normalized_score: normalizedScore,
      tier,
      components,
      warnings,
      gaps: Array.from(new Set(gaps)).slice(0, 8),
    },
  };
}

function selectRankedCandidates(
  ranked: Array<Omit<ScannerCandidateRankingResult, "selected" | "selection_bucket">>,
  targetMin: number,
  targetMax: number,
): ScannerCandidateSelectionResult {
  const structurallyValid = ranked.filter(
    (result) =>
      result.score.tier === "strong" ||
      result.score.tier === "valid" ||
      result.score.tier === "experimental",
  );
  const strong = structurallyValid
    .filter((result) => result.score.tier === "strong")
    .slice(0, 3);
  const strongSet = new Set(strong.map((result) => result.ticker));
  const valid = structurallyValid
    .filter((result) => result.score.tier === "valid" && !strongSet.has(result.ticker))
    .slice(0, 6);
  const selected = [...strong, ...valid];
  const selectedSet = new Set(selected.map((result) => result.ticker));

  for (const result of structurallyValid) {
    if (selected.length >= targetMin) break;
    if (selectedSet.has(result.ticker)) continue;

    selected.push(result);
    selectedSet.add(result.ticker);
  }

  const capped = selected.slice(0, targetMax);

  return {
    selected_tickers: capped.map((result) => result.ticker),
    overflow_count: Math.max(0, structurallyValid.length - targetMax),
    target_status:
      capped.length === 0
        ? "empty"
        : capped.length < targetMin
          ? "below_target"
          : capped.length > targetMax
            ? "above_target"
            : "within_target",
  };
}

function scoreDataCompleteness(candidate: RankingCandidate, gaps: string[]) {
  const fields = [
    candidate.ticker,
    candidate.company_name,
    candidate.latest_close ?? candidate.intraday_indicators?.latestPrice,
    candidate.proposed_entry_low,
    candidate.proposed_entry_high,
    candidate.proposed_stop_loss,
    candidate.proposed_target_1,
    candidate.proposed_target_2,
    candidate.proposed_risk_reward,
  ];
  const presentCount = fields.filter((value) => value !== null && value !== undefined).length;

  if (!candidate.intraday_indicators) {
    gaps.push("Intraday indicator context is missing.");
  }

  if (!candidate.intraday_indicator_source) {
    gaps.push("Market data source metadata is missing.");
  }

  return clampScore((presentCount / fields.length) * 100);
}

function scoreFreshness(
  candidate: RankingCandidate,
  warnings: ScannerCandidateRankingWarning[],
  gaps: string[],
) {
  if (candidate.intraday_indicator_stale === true) {
    warnings.push(warning("stale_market_data", "warning", "Market data is stale."));
    return 25;
  }

  if (
    candidate.intraday_indicator_source === "fresh" ||
    candidate.intraday_indicator_source === "cache"
  ) {
    return candidate.intraday_indicator_cached_at ? 86 : 74;
  }

  gaps.push("Fresh/cache intraday timestamp is unavailable.");
  return 42;
}

function scorePricePlanQuality(
  candidate: RankingCandidate,
  warnings: ScannerCandidateRankingWarning[],
  gaps: string[],
) {
  const entryLow = numberOrNull(candidate.proposed_entry_low);
  const entryHigh = numberOrNull(candidate.proposed_entry_high);
  const stopLoss = numberOrNull(candidate.proposed_stop_loss);
  const target1 = numberOrNull(candidate.proposed_target_1);
  const target2 = numberOrNull(candidate.proposed_target_2);
  const riskReward = numberOrNull(candidate.proposed_risk_reward);

  if (
    entryLow === null ||
    entryHigh === null ||
    stopLoss === null ||
    target1 === null ||
    target2 === null
  ) {
    gaps.push("Entry, stop, or target plan is incomplete.");
    return 25;
  }

  if (stopLoss >= entryLow || entryLow > entryHigh || target1 <= entryHigh) {
    warnings.push(
      warning("invalid_long_plan", "blocked", "Long plan geometry is invalid."),
    );
    return 0;
  }

  const stopDistance = ((entryHigh - stopLoss) / entryHigh) * 100;
  const targetDistance = ((target2 - entryHigh) / entryHigh) * 100;
  let score = 66;

  if (riskReward === null) {
    gaps.push("Risk/reward estimate is unavailable.");
  } else if (riskReward >= 2) {
    score += 22;
  } else if (riskReward >= 1.5) {
    score += 12;
  } else {
    score -= 24;
    warnings.push(
      warning("weak_risk_reward", "warning", "Risk/reward is below preferred range."),
    );
  }

  if (stopDistance > 8) {
    score -= 18;
    warnings.push(
      warning("wide_stop_distance", "warning", "Stop distance is unusually wide."),
    );
  }

  if (targetDistance > 18) {
    score -= 12;
    warnings.push(
      warning("stretched_target_distance", "info", "Target distance may be stretched."),
    );
  }

  return clampScore(score);
}

function scoreSignalStrength(candidate: RankingCandidate, gaps: string[]) {
  if (typeof candidate.local_score === "number") {
    return clampScore(candidate.local_score);
  }

  if (!candidate.local_score_breakdown) {
    gaps.push("Local signal breakdown is unavailable.");
    return 45;
  }

  return clampScore(
    average([
      candidate.local_score_breakdown.momentum,
      candidate.local_score_breakdown.trend,
      candidate.local_score_breakdown.volatility,
    ]),
  );
}

function scoreLiquidityVolume(
  candidate: RankingCandidate,
  warnings: ScannerCandidateRankingWarning[],
  gaps: string[],
) {
  const volumeRatio = numberOrNull(candidate.volume_ratio);
  const recentVolumeRatio = numberOrNull(candidate.recent_volume_ratio);
  const latestVolume = candidate.intraday_indicators?.latestVolume ?? null;
  const averageVolume = candidate.intraday_indicators?.averageVolume ?? null;
  const bestVolumeRatio = Math.max(volumeRatio ?? 0, recentVolumeRatio ?? 0);
  let score = 50;

  if (bestVolumeRatio >= 1.5) score += 32;
  else if (bestVolumeRatio >= 1.1) score += 20;
  else if (bestVolumeRatio >= 0.8) score += 8;
  else if (bestVolumeRatio > 0) {
    score -= 18;
    warnings.push(warning("low_relative_volume", "warning", "Relative volume is low."));
  } else {
    gaps.push("Relative volume is unavailable.");
    score -= 8;
  }

  if (
    latestVolume !== null &&
    averageVolume !== null &&
    latestVolume > averageVolume
  ) {
    score += 8;
  }

  return clampScore(score);
}

function scoreSourceQuality(
  candidate: RankingCandidate,
  sourceContribution: ScannerCandidateRankingResult["source_contribution"],
  warnings: ScannerCandidateRankingWarning[],
) {
  let score = 50;

  if (
    candidate.intraday_indicator_source === "fresh" ||
    candidate.intraday_indicator_source === "cache"
  ) {
    score += candidate.intraday_indicator_source === "fresh" ? 36 : 24;
  } else {
    score -= 12;
    warnings.push(
      warning("unknown_provider_source", "info", "Provider source is unavailable."),
    );
  }

  if (sourceContribution === "dynamic_mover") score += 6;
  if (sourceContribution === "fallback") score -= 10;

  return clampScore(score);
}

function scoreWindowFit(
  candidate: RankingCandidate,
  scanWindow: IntradayScanWindow | "unknown",
  gaps: string[],
) {
  const setup = candidate.setup_type ?? "UNKNOWN";
  const breakdown = candidate.local_score_breakdown;
  let score = 50;

  if (
    scanWindow === "opening" ||
    scanWindow === "morning_momentum" ||
    scanWindow === "power_hour"
  ) {
    score += Math.round(((breakdown?.momentum ?? 50) - 50) * 0.5);
    if (
      setup === "OPENING_RANGE_BREAKOUT" ||
      setup === "HIGH_OF_DAY_BREAKOUT" ||
      setup === "BREAKOUT_CONTINUATION"
    ) {
      score += 18;
    }
  } else if (scanWindow === "midday" || scanWindow === "afternoon") {
    score += Math.round(((breakdown?.trend ?? 50) - 50) * 0.45);
    if (
      setup === "VWAP_HOLD_CONTINUATION" ||
      setup === "PULLBACK_RECLAIM" ||
      setup === "BREAKOUT_CONTINUATION"
    ) {
      score += 16;
    }
  } else {
    score -= 35;
    gaps.push("Window is not an active recommendation window.");
  }

  return clampScore(score);
}

function scoreWarningsPenalty(
  candidate: RankingCandidate,
  warnings: ScannerCandidateRankingWarning[],
) {
  const warningCount = candidate.local_score_warnings?.length ?? 0;
  const blockedCount = warnings.filter((item) => item.severity === "blocked").length;

  return clampScore(100 - warningCount * 8 - blockedCount * 40);
}

function getSourceContribution(
  candidate: RankingCandidate,
  universeCoverage: ScannerUniverseCoverageSummary | null,
): ScannerCandidateRankingResult["source_contribution"] {
  if (universeCoverage?.dynamic_movers?.selected_tickers.includes(candidate.ticker)) {
    return "dynamic_mover";
  }

  if (universeCoverage?.selected_ticker_symbols.includes(candidate.ticker)) {
    return "base_universe";
  }

  if (candidate.mock_trend.toLowerCase().includes("starter")) {
    return "fallback";
  }

  return "unknown";
}

function component(
  componentName: ScannerCandidateRankingComponent,
  score: number,
  weight: number,
) {
  const normalizedScore = clampScore(score);

  return {
    component: componentName,
    score: normalizedScore,
    weight,
    contribution: normalizedScore * weight,
    reason: componentReason(componentName, normalizedScore),
  };
}

function componentReason(
  componentName: ScannerCandidateRankingComponent,
  score: number,
) {
  const label = componentName.replaceAll("_", " ");

  if (score >= 80) return `${label} is strong.`;
  if (score >= 65) return `${label} is usable.`;
  if (score >= 45) return `${label} is mixed.`;
  return `${label} is weak or incomplete.`;
}

function tierForRankingScore(
  score: number,
  warnings: ScannerCandidateRankingWarning[],
): RealScannerCandidateTier {
  if (warnings.some((item) => item.severity === "blocked")) return "rejected";
  if (score >= 82) return "strong";
  if (score >= 70) return "valid";
  if (score >= 55) return "experimental";
  if (score >= 40) return "incomplete";
  return "rejected";
}

function buildRankReason(
  candidate: RankingCandidate,
  components: ScannerCandidateRankingScore["components"],
  tier: RealScannerCandidateTier,
) {
  const best = [...components].sort((first, second) => second.score - first.score)[0];
  const setup = candidate.setup_type ? candidate.setup_type.replaceAll("_", " ") : null;

  return [
    `${tier} ranking`,
    best ? `best component: ${best.reason}` : null,
    setup ? `setup: ${setup}` : null,
  ]
    .filter(Boolean)
    .join("; ");
}

function buildSummaryWarnings(
  results: ScannerCandidateRankingResult[],
  selection: ScannerCandidateSelectionResult,
  targetMin: number,
) {
  const warnings: ScannerCandidateRankingWarning[] = [];

  if (results.length === 0) {
    warnings.push(
      warning("no_candidates_ranked", "blocked", "No scanner candidates were ranked."),
    );
  }

  if (selection.selected_tickers.length > 0 && selection.selected_tickers.length < targetMin) {
    warnings.push(
      warning(
        "below_selection_target",
        "info",
        "Fewer than six structurally valid candidates were available.",
      ),
    );
  }

  if (results.some((result) => result.score.tier === "rejected")) {
    warnings.push(
      warning(
        "rejected_candidates_present",
        "info",
        "Some candidates were rejected by ranking guardrails.",
      ),
    );
  }

  return warnings;
}

function warning(
  warning_id: string,
  severity: ScannerCandidateRankingWarning["severity"],
  message: string,
): ScannerCandidateRankingWarning {
  return { warning_id, severity, message };
}

function countBy<T, K extends string>(values: T[], getKey: (value: T) => K) {
  const counts: Partial<Record<K, number>> = {};

  for (const value of values) {
    const key = getKey(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function topMessages(messages: string[]) {
  const counts = new Map<string, number>();

  for (const message of messages) {
    counts.set(message, (counts.get(message) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([message]) => message)
    .slice(0, 6);
}

function numberOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
