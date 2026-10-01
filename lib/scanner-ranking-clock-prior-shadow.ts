import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import {
  buildClockNeutralShadowRankingSummary,
  isLegacyNamedWindowWarning,
  type RankingCandidate,
  type ScannerCandidateRankingComponent,
  type ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";
import type { ScannerUniverseCoverageSummary } from "@/lib/scanner-universe";

export const SCANNER_CLOCK_PRIOR_SHADOW_COMPARISON_VERSION =
  "scanner_clock_prior_shadow_comparison_v1" as const;
export const SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION =
  "scanner_candidate_ranking_clock_neutral_v1" as const;
export const SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION =
  "scanner_candidate_ranking_v1.2" as const;

export type ScannerClockPriorShadowDisplacement = {
  ticker: string;
  baseline_rank: number;
  shadow_rank: number;
  rank_change: number;
  baseline_score: number;
  shadow_score: number;
  score_change: number;
  baseline_tier: string;
  shadow_tier: string;
  baseline_selected: boolean;
  shadow_selected: boolean;
  legacy_timing_score: number;
  baseline_signal_strength: number;
  shadow_signal_strength: number;
  baseline_window_fit: number;
  shadow_window_fit: number;
  legacy_setup_classification_bonus_removed: number;
  legacy_clock_warning_count: number;
  baseline_warnings_penalty: number;
  shadow_warnings_penalty: number;
};

export type ScannerClockPriorShadowComparison = {
  comparison_version: typeof SCANNER_CLOCK_PRIOR_SHADOW_COMPARISON_VERSION;
  comparison_kind: "scanner_clock_prior_shadow_comparison";
  generated_at: string;
  status: "comparable" | "conflicting";
  baseline_policy_version: typeof SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION;
  shadow_policy_version: typeof SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION;
  hypothesis: "named_clock_priors_add_quality_beyond_observed_features";
  candidate_count: number;
  candidate_tickers: string[];
  baseline_selected_tickers: string[];
  shadow_selected_tickers: string[];
  selection_changed: boolean;
  live_ranking_effect: false;
  publication_effect: false;
  execution_effect: false;
  quality_improvement_claimed: false;
  quality_evidence_status: "not_evaluated";
  reason_codes: string[];
  displacements: ScannerClockPriorShadowDisplacement[];
};

const requiredBreakdownFields = [
  "momentum",
  "volume",
  "volatility",
  "trend",
  "riskReward",
  "marketRegime",
  "timing",
] as const;

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function round(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function integer(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function nonNegativeInteger(value: unknown) {
  const parsed = integer(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}

/**
 * Strictly reads persisted clock-prior evidence without repairing partial
 * values or inferring candidate identity from array order. Canonical outcome
 * evaluation must cross this boundary before using a comparison receipt.
 */
export function scannerClockPriorShadowComparisonFromUnknown(
  value: unknown,
): ScannerClockPriorShadowComparison | null {
  const record = recordOrNull(value);
  if (
    !record ||
    record.comparison_version !==
      SCANNER_CLOCK_PRIOR_SHADOW_COMPARISON_VERSION ||
    record.comparison_kind !== "scanner_clock_prior_shadow_comparison" ||
    (record.status !== "comparable" && record.status !== "conflicting") ||
    record.baseline_policy_version !==
      SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION ||
    record.shadow_policy_version !== SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION ||
    record.hypothesis !==
      "named_clock_priors_add_quality_beyond_observed_features" ||
    record.live_ranking_effect !== false ||
    record.publication_effect !== false ||
    record.execution_effect !== false ||
    record.quality_improvement_claimed !== false ||
    record.quality_evidence_status !== "not_evaluated" ||
    typeof record.selection_changed !== "boolean" ||
    !Array.isArray(record.candidate_tickers) ||
    !Array.isArray(record.baseline_selected_tickers) ||
    !Array.isArray(record.shadow_selected_tickers) ||
    !Array.isArray(record.reason_codes) ||
    !Array.isArray(record.displacements)
  ) {
    return null;
  }

  const generatedAt = textOrNull(record.generated_at);
  const candidateCount = nonNegativeInteger(record.candidate_count);
  const textArrays = [
    record.candidate_tickers,
    record.baseline_selected_tickers,
    record.shadow_selected_tickers,
    record.reason_codes,
  ] as unknown[][];
  if (
    !generatedAt ||
    !Number.isFinite(Date.parse(generatedAt)) ||
    candidateCount === null ||
    textArrays.some((values) =>
      values.some((item) => textOrNull(item) === null),
    )
  ) {
    return null;
  }

  const candidateTickers = uniqueSorted(
    (record.candidate_tickers as string[]).map((ticker) =>
      ticker.trim().toUpperCase(),
    ),
  );
  // Selected identities are a ranked sequence, not an unordered population.
  // The v1 producer reports a priority change even when membership is unchanged.
  const baselineSelectedTickers = (record.baseline_selected_tickers as string[])
    .map((ticker) => ticker.trim().toUpperCase());
  const shadowSelectedTickers = (record.shadow_selected_tickers as string[])
    .map((ticker) => ticker.trim().toUpperCase());
  const candidateTickerSet = new Set(candidateTickers);
  if (
    candidateTickers.length !== candidateCount ||
    new Set(baselineSelectedTickers).size !== baselineSelectedTickers.length ||
    new Set(shadowSelectedTickers).size !== shadowSelectedTickers.length ||
    baselineSelectedTickers.some((ticker) => !candidateTickerSet.has(ticker)) ||
    shadowSelectedTickers.some((ticker) => !candidateTickerSet.has(ticker))
  ) {
    return null;
  }

  const displacements = record.displacements.flatMap((value) => {
    const item = recordOrNull(value);
    const ticker = textOrNull(item?.ticker)?.toUpperCase() ?? null;
    const baselineRank = nonNegativeInteger(item?.baseline_rank);
    const shadowRank = nonNegativeInteger(item?.shadow_rank);
    const rankChange = integer(item?.rank_change);
    const baselineScore = finiteNumber(item?.baseline_score);
    const shadowScore = finiteNumber(item?.shadow_score);
    const scoreChange = finiteNumber(item?.score_change);
    const baselineTier = textOrNull(item?.baseline_tier);
    const shadowTier = textOrNull(item?.shadow_tier);
    const legacyTimingScore = finiteNumber(item?.legacy_timing_score);
    const baselineSignalStrength = finiteNumber(
      item?.baseline_signal_strength,
    );
    const shadowSignalStrength = finiteNumber(item?.shadow_signal_strength);
    const baselineWindowFit = finiteNumber(item?.baseline_window_fit);
    const shadowWindowFit = finiteNumber(item?.shadow_window_fit);
    const setupBonus = finiteNumber(
      item?.legacy_setup_classification_bonus_removed,
    );
    const warningCount = nonNegativeInteger(item?.legacy_clock_warning_count);
    const baselineWarningsPenalty = finiteNumber(
      item?.baseline_warnings_penalty,
    );
    const shadowWarningsPenalty = finiteNumber(item?.shadow_warnings_penalty);
    if (
      !item ||
      !ticker ||
      baselineRank === null ||
      baselineRank < 1 ||
      shadowRank === null ||
      shadowRank < 1 ||
      rankChange === null ||
      baselineScore === null ||
      shadowScore === null ||
      scoreChange === null ||
      !baselineTier ||
      !shadowTier ||
      typeof item.baseline_selected !== "boolean" ||
      typeof item.shadow_selected !== "boolean" ||
      legacyTimingScore === null ||
      baselineSignalStrength === null ||
      shadowSignalStrength === null ||
      baselineWindowFit === null ||
      shadowWindowFit === null ||
      setupBonus === null ||
      warningCount === null ||
      baselineWarningsPenalty === null ||
      shadowWarningsPenalty === null
    ) {
      return [];
    }

    return [
      {
        ticker,
        baseline_rank: baselineRank,
        shadow_rank: shadowRank,
        rank_change: rankChange,
        baseline_score: baselineScore,
        shadow_score: shadowScore,
        score_change: scoreChange,
        baseline_tier: baselineTier,
        shadow_tier: shadowTier,
        baseline_selected: item.baseline_selected,
        shadow_selected: item.shadow_selected,
        legacy_timing_score: legacyTimingScore,
        baseline_signal_strength: baselineSignalStrength,
        shadow_signal_strength: shadowSignalStrength,
        baseline_window_fit: baselineWindowFit,
        shadow_window_fit: shadowWindowFit,
        legacy_setup_classification_bonus_removed: setupBonus,
        legacy_clock_warning_count: warningCount,
        baseline_warnings_penalty: baselineWarningsPenalty,
        shadow_warnings_penalty: shadowWarningsPenalty,
      },
    ];
  });

  if (record.status === "comparable") {
    const displacementTickers = uniqueSorted(
      displacements.map((item) => item.ticker),
    );
    if (
      record.reason_codes.length !== 0 ||
      displacements.length !== record.displacements.length ||
      displacements.length !== candidateCount ||
      displacementTickers.join("|") !== candidateTickers.join("|") ||
      new Set(displacements.map((item) => item.baseline_rank)).size !==
        displacements.length ||
      new Set(displacements.map((item) => item.shadow_rank)).size !==
        displacements.length ||
      displacements.some(
        (item) =>
          item.rank_change !== item.baseline_rank - item.shadow_rank ||
          Math.abs(
            item.score_change - (item.shadow_score - item.baseline_score),
          ) > 0.000001,
      ) ||
      baselineSelectedTickers.join("|") !==
        displacements
          .filter((item) => item.baseline_selected)
          .sort((left, right) => left.baseline_rank - right.baseline_rank)
          .map((item) => item.ticker).join("|") ||
      shadowSelectedTickers.join("|") !==
        displacements
          .filter((item) => item.shadow_selected)
          .sort((left, right) => left.shadow_rank - right.shadow_rank)
          .map((item) => item.ticker).join("|")
    ) {
      return null;
    }
  } else if (
    record.reason_codes.length === 0 ||
    record.displacements.length !== 0 ||
    shadowSelectedTickers.length !== 0 ||
    record.selection_changed !== false
  ) {
    return null;
  }

  if (
    record.status === "comparable" &&
    record.selection_changed !==
      (baselineSelectedTickers.join("|") !== shadowSelectedTickers.join("|"))
  ) {
    return null;
  }

  return {
    comparison_version: SCANNER_CLOCK_PRIOR_SHADOW_COMPARISON_VERSION,
    comparison_kind: "scanner_clock_prior_shadow_comparison",
    generated_at: generatedAt,
    status: record.status,
    baseline_policy_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
    shadow_policy_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
    hypothesis: "named_clock_priors_add_quality_beyond_observed_features",
    candidate_count: candidateCount,
    candidate_tickers: candidateTickers,
    baseline_selected_tickers: baselineSelectedTickers,
    shadow_selected_tickers: shadowSelectedTickers,
    selection_changed: record.selection_changed,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    quality_improvement_claimed: false,
    quality_evidence_status: "not_evaluated",
    reason_codes: uniqueSorted(record.reason_codes as string[]),
    displacements,
  };
}

function componentScore(
  summary: ScannerCandidateRankingSummary,
  ticker: string,
  component: ScannerCandidateRankingComponent,
) {
  return (
    summary.results
      .find((result) => result.ticker === ticker)
      ?.score.components.find((item) => item.component === component)?.score ??
    null
  );
}

function hasCompleteClockNeutralEvidence(candidate: RankingCandidate) {
  const breakdown = candidate.local_score_breakdown;
  return (
    breakdown !== undefined &&
    requiredBreakdownFields.every((field) =>
      Number.isFinite(breakdown[field]),
    )
  );
}

function countLegacyClockWarnings(candidate: RankingCandidate) {
  return (candidate.local_score_warnings ?? []).filter((warningText) =>
    isLegacyNamedWindowWarning(warningText),
  ).length;
}

/**
 * Measures one frozen ranking hypothesis on the exact production population:
 * remove the named opening/midday/afternoon/power-hour prior while preserving
 * observed price, liquidity, signal, plan, regime and source evidence. The
 * comparison is diagnostic only and cannot influence live selection.
 */
export function buildScannerClockPriorShadowComparison({
  candidates,
  baseline,
  scanWindow = "unknown",
  universeCoverage = null,
  targetMax = 3,
  now = new Date(),
}: {
  candidates: RankingCandidate[];
  baseline: ScannerCandidateRankingSummary;
  scanWindow?: IntradayScanWindow | "unknown";
  universeCoverage?: ScannerUniverseCoverageSummary | null;
  targetMax?: number;
  now?: Date;
}): ScannerClockPriorShadowComparison {
  const validNow = Number.isFinite(now.getTime());
  const generatedAt = validNow ? now.toISOString() : new Date(0).toISOString();
  const candidateTickers = candidates.map((candidate) =>
    candidate.ticker.trim().toUpperCase(),
  );
  const baselineTickers = baseline.results.map((result) =>
    result.ticker.trim().toUpperCase(),
  );
  const reasonCodes: string[] = [];

  if (!validNow) reasonCodes.push("evaluation_time_invalid");
  if (
    candidateTickers.some((ticker) => ticker.length === 0) ||
    new Set(candidateTickers).size !== candidateTickers.length
  ) {
    reasonCodes.push("candidate_identity_missing_or_duplicate");
  }
  if (
    baseline.candidates_ranked !== candidates.length ||
    baseline.results.length !== candidates.length ||
    uniqueSorted(baselineTickers).join("|") !==
      uniqueSorted(candidateTickers).join("|")
  ) {
    reasonCodes.push("baseline_population_mismatch");
  }
  if (candidates.some((candidate) => !hasCompleteClockNeutralEvidence(candidate))) {
    reasonCodes.push("clock_neutral_feature_breakdown_missing");
  }

  const common = {
    comparison_version: SCANNER_CLOCK_PRIOR_SHADOW_COMPARISON_VERSION,
    comparison_kind: "scanner_clock_prior_shadow_comparison" as const,
    generated_at: generatedAt,
    baseline_policy_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
    shadow_policy_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
    hypothesis:
      "named_clock_priors_add_quality_beyond_observed_features" as const,
    candidate_count: candidates.length,
    candidate_tickers: uniqueSorted(candidateTickers),
    live_ranking_effect: false as const,
    publication_effect: false as const,
    execution_effect: false as const,
    quality_improvement_claimed: false as const,
    quality_evidence_status: "not_evaluated" as const,
  };

  if (reasonCodes.length > 0) {
    return {
      ...common,
      status: "conflicting",
      baseline_selected_tickers: [...baseline.selection.selected_tickers],
      shadow_selected_tickers: [],
      selection_changed: false,
      reason_codes: uniqueSorted(reasonCodes),
      displacements: [],
    };
  }

  const shadow = buildClockNeutralShadowRankingSummary({
    candidates,
    scanWindow,
    universeCoverage,
    targetMax,
    now,
  });
  const baselineByTicker = new Map(
    baseline.results.map((result) => [result.ticker, result]),
  );
  const candidateByTicker = new Map(
    candidates.map((candidate) => [candidate.ticker, candidate]),
  );
  const displacements = shadow.results.map((shadowResult) => {
    const baselineResult = baselineByTicker.get(shadowResult.ticker);
    const candidate = candidateByTicker.get(shadowResult.ticker);
    const breakdown = candidate?.local_score_breakdown;
    const baselineSignal = componentScore(
      baseline,
      shadowResult.ticker,
      "signal_strength",
    );
    const shadowSignal = componentScore(
      shadow,
      shadowResult.ticker,
      "signal_strength",
    );
    const baselineWindow = componentScore(
      baseline,
      shadowResult.ticker,
      "window_fit",
    );
    const shadowWindow = componentScore(
      shadow,
      shadowResult.ticker,
      "window_fit",
    );
    const baselineWarningsPenalty = componentScore(
      baseline,
      shadowResult.ticker,
      "warnings_penalty",
    );
    const shadowWarningsPenalty = componentScore(
      shadow,
      shadowResult.ticker,
      "warnings_penalty",
    );
    if (
      !baselineResult ||
      !breakdown ||
      baselineSignal === null ||
      shadowSignal === null ||
      baselineWindow === null ||
      shadowWindow === null ||
      baselineWarningsPenalty === null ||
      shadowWarningsPenalty === null
    ) {
      throw new Error("clock_prior_shadow_population_changed_after_validation");
    }

    return {
      ticker: shadowResult.ticker,
      baseline_rank: baselineResult.rank,
      shadow_rank: shadowResult.rank,
      rank_change: baselineResult.rank - shadowResult.rank,
      baseline_score: baselineResult.score.normalized_score,
      shadow_score: shadowResult.score.normalized_score,
      score_change: round(
        shadowResult.score.normalized_score -
          baselineResult.score.normalized_score,
      ),
      baseline_tier: baselineResult.score.tier,
      shadow_tier: shadowResult.score.tier,
      baseline_selected: baselineResult.selected,
      shadow_selected: shadowResult.selected,
      legacy_timing_score: breakdown.timing,
      baseline_signal_strength: baselineSignal,
      shadow_signal_strength: shadowSignal,
      baseline_window_fit: baselineWindow,
      shadow_window_fit: shadowWindow,
      legacy_setup_classification_bonus_removed:
        candidate.setup_type && candidate.setup_type !== "UNKNOWN" ? 3 : 0,
      legacy_clock_warning_count: countLegacyClockWarnings(candidate),
      baseline_warnings_penalty: baselineWarningsPenalty,
      shadow_warnings_penalty: shadowWarningsPenalty,
    } satisfies ScannerClockPriorShadowDisplacement;
  });
  const baselineSelected = [...baseline.selection.selected_tickers];
  const shadowSelected = [...shadow.selection.selected_tickers];

  return {
    ...common,
    status: "comparable",
    baseline_selected_tickers: baselineSelected,
    shadow_selected_tickers: shadowSelected,
    selection_changed:
      baselineSelected.join("|") !== shadowSelected.join("|"),
    reason_codes: [],
    displacements,
  };
}
