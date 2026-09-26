import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import { admissibleRecentIntradayVolumeRatio } from "@/lib/intraday-indicators";
import {
  buildVerifiedIntradayLiquidityShadowRankingSummary,
  type RankingCandidate,
  type ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";
import type { ScannerUniverseCoverageSummary } from "@/lib/scanner-universe";

export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_COMPARISON_VERSION =
  "scanner_intraday_liquidity_shadow_comparison_v1" as const;
export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_POLICY_VERSION =
  "scanner_candidate_ranking_verified_intraday_liquidity_v1" as const;
export const SCANNER_INTRADAY_LIQUIDITY_BASELINE_POLICY_VERSION =
  "scanner_candidate_ranking_v1.2" as const;

export type ScannerIntradayLiquidityShadowDisplacement = {
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
  daily_volume_ratio: number | null;
  verified_intraday_volume_ratio: number | null;
  shadow_liquidity_score: number | null;
  shadow_reason_codes: string[];
};

export type ScannerIntradayLiquidityShadowComparison = {
  comparison_version:
    typeof SCANNER_INTRADAY_LIQUIDITY_SHADOW_COMPARISON_VERSION;
  comparison_kind: "scanner_intraday_liquidity_shadow_comparison";
  generated_at: string;
  status: "comparable" | "conflicting";
  baseline_policy_version:
    typeof SCANNER_INTRADAY_LIQUIDITY_BASELINE_POLICY_VERSION;
  shadow_policy_version:
    typeof SCANNER_INTRADAY_LIQUIDITY_SHADOW_POLICY_VERSION;
  candidate_count: number;
  candidate_tickers: string[];
  verified_intraday_volume_count: number;
  missing_verified_intraday_volume_count: number;
  baseline_selected_tickers: string[];
  shadow_selected_tickers: string[];
  selection_changed: boolean;
  live_ranking_effect: false;
  publication_effect: false;
  quality_improvement_claimed: false;
  quality_evidence_status: "not_evaluated";
  reason_codes: string[];
  displacements: ScannerIntradayLiquidityShadowDisplacement[];
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function liquidityScore(
  summary: ScannerCandidateRankingSummary,
  ticker: string,
) {
  return (
    summary.results
      .find((result) => result.ticker === ticker)
      ?.score.components.find(
        (component) => component.component === "liquidity_volume",
      )?.score ?? null
  );
}

/**
 * Compares the production ranking with one narrow, default-off hypothesis:
 * daily-candle volume cannot substitute for verified current-session volume.
 * The result is evidence capture only and never feeds live selection.
 */
export function buildScannerIntradayLiquidityShadowComparison({
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
}): ScannerIntradayLiquidityShadowComparison {
  const generatedAt = Number.isFinite(now.getTime())
    ? now.toISOString()
    : new Date(0).toISOString();
  const observedAtSeconds = now.getTime() / 1_000;
  const inputTickers = candidates.map((candidate) => candidate.ticker);
  const baselineTickers = baseline.results.map((result) =>
    result.ticker.trim().toUpperCase(),
  );
  const normalizedInputTickers = inputTickers.map((ticker) =>
    ticker.trim().toUpperCase(),
  );
  const reasonCodes: string[] = [];

  if (!Number.isFinite(now.getTime())) {
    reasonCodes.push("evaluation_time_invalid");
  }

  if (
    normalizedInputTickers.some((ticker) => ticker.length === 0) ||
    new Set(normalizedInputTickers).size !== normalizedInputTickers.length
  ) {
    reasonCodes.push("candidate_identity_missing_or_duplicate");
  }
  if (
    baseline.candidates_ranked !== candidates.length ||
    baseline.results.length !== candidates.length ||
    uniqueSorted(baselineTickers).join("|") !==
      uniqueSorted(normalizedInputTickers).join("|")
  ) {
    reasonCodes.push("baseline_population_mismatch");
  }

  const safety = {
    live_ranking_effect: false as const,
    publication_effect: false as const,
    quality_improvement_claimed: false as const,
    quality_evidence_status: "not_evaluated" as const,
  };
  const common = {
    comparison_version:
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_COMPARISON_VERSION,
    comparison_kind:
      "scanner_intraday_liquidity_shadow_comparison" as const,
    generated_at: generatedAt,
    baseline_policy_version:
      SCANNER_INTRADAY_LIQUIDITY_BASELINE_POLICY_VERSION,
    shadow_policy_version: SCANNER_INTRADAY_LIQUIDITY_SHADOW_POLICY_VERSION,
    candidate_count: candidates.length,
    candidate_tickers: uniqueSorted(normalizedInputTickers),
    ...safety,
  };

  if (reasonCodes.length > 0) {
    return {
      ...common,
      status: "conflicting",
      verified_intraday_volume_count: 0,
      missing_verified_intraday_volume_count: candidates.length,
      baseline_selected_tickers: [...baseline.selection.selected_tickers],
      shadow_selected_tickers: [],
      selection_changed: false,
      reason_codes: uniqueSorted(reasonCodes),
      displacements: [],
    };
  }

  const shadow = buildVerifiedIntradayLiquidityShadowRankingSummary({
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
  const intradayRatios = new Map(
    candidates.map((candidate) => [
      candidate.ticker,
      admissibleRecentIntradayVolumeRatio(
        candidate.intraday_indicators,
        candidate.intraday_indicator_stale,
        observedAtSeconds,
      ),
    ]),
  );
  const displacements = shadow.results.map((shadowResult) => {
    const baselineResult = baselineByTicker.get(shadowResult.ticker);
    const candidate = candidateByTicker.get(shadowResult.ticker);
    if (!baselineResult || !candidate) {
      throw new Error("shadow_ranking_population_changed_after_validation");
    }
    const shadowReasonCodes = shadowResult.score.warnings
      .map((warning) => warning.warning_id)
      .filter((reason) => reason === "intraday_liquidity_unverified");

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
      daily_volume_ratio: finiteNumber(candidate.volume_ratio),
      verified_intraday_volume_ratio:
        intradayRatios.get(shadowResult.ticker) ?? null,
      shadow_liquidity_score: liquidityScore(shadow, shadowResult.ticker),
      shadow_reason_codes: shadowReasonCodes,
    } satisfies ScannerIntradayLiquidityShadowDisplacement;
  });
  const verifiedCount = [...intradayRatios.values()].filter(
    (value) => value !== null,
  ).length;
  const baselineSelected = [...baseline.selection.selected_tickers];
  const shadowSelected = [...shadow.selection.selected_tickers];

  return {
    ...common,
    status: "comparable",
    verified_intraday_volume_count: verifiedCount,
    missing_verified_intraday_volume_count:
      candidates.length - verifiedCount,
    baseline_selected_tickers: baselineSelected,
    shadow_selected_tickers: shadowSelected,
    selection_changed:
      baselineSelected.join("|") !== shadowSelected.join("|"),
    reason_codes:
      verifiedCount === candidates.length
        ? []
        : ["verified_intraday_volume_population_incomplete"],
    displacements,
  };
}
