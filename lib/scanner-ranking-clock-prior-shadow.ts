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
