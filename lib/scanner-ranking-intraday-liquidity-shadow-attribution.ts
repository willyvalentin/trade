import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { ScannerIntradayLiquidityShadowComparison } from "@/lib/scanner-ranking-intraday-liquidity-shadow";

export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_ATTRIBUTION_VERSION =
  "scanner_intraday_liquidity_shadow_attribution_v1" as const;

export type ScannerIntradayLiquidityShadowAttribution = {
  attribution_version:
    typeof SCANNER_INTRADAY_LIQUIDITY_SHADOW_ATTRIBUTION_VERSION;
  attribution_kind: "scanner_intraday_liquidity_shadow_attribution";
  status: "attributed" | "conflicting";
  scan_run_id: string;
  scan_run_fingerprint: string;
  comparison_generated_at: string;
  candidate_decision_timestamp: string;
  comparison_version: string;
  baseline_policy_version: string;
  shadow_policy_version: string;
  candidate_count: number;
  attributed_candidate_count: number;
  outcome_join_basis: "candidate_decision_id";
  outcome_evidence_status: "not_evaluated";
  quality_improvement_claimed: false;
  live_ranking_effect: false;
  publication_effect: false;
  reason_codes: string[];
  candidates: Array<{
    candidate_id: string;
    ticker: string;
    candidate_decision_disposition: string;
    baseline_rank: number;
    shadow_rank: number;
    baseline_selected: boolean;
    shadow_selected: boolean;
  }>;
};

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function normalizedTicker(value: string) {
  return value.trim().toUpperCase();
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function nonEmptyText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0
    ? value
    : null;
}

function positiveInteger(value: unknown): number | null {
  const integer = nonNegativeInteger(value);
  return integer !== null && integer > 0 ? integer : null;
}

/**
 * Strictly reads a persisted attribution receipt. Consumers that evaluate
 * outcomes must never reinterpret a partial object or infer candidate
 * identity from ticker order.
 */
export function scannerIntradayLiquidityShadowAttributionFromUnknown(
  value: unknown,
): ScannerIntradayLiquidityShadowAttribution | null {
  const record = recordOrNull(value);
  if (
    !record ||
    record.attribution_version !==
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_ATTRIBUTION_VERSION ||
    record.attribution_kind !==
      "scanner_intraday_liquidity_shadow_attribution" ||
    (record.status !== "attributed" && record.status !== "conflicting") ||
    record.outcome_join_basis !== "candidate_decision_id" ||
    record.outcome_evidence_status !== "not_evaluated" ||
    record.quality_improvement_claimed !== false ||
    record.live_ranking_effect !== false ||
    record.publication_effect !== false ||
    !Array.isArray(record.reason_codes) ||
    !record.reason_codes.every((item) => nonEmptyText(item) !== null) ||
    !Array.isArray(record.candidates)
  ) {
    return null;
  }

  const scanRunId = nonEmptyText(record.scan_run_id);
  const scanRunFingerprint = nonEmptyText(record.scan_run_fingerprint);
  const comparisonGeneratedAt = nonEmptyText(record.comparison_generated_at);
  const candidateDecisionTimestamp = nonEmptyText(
    record.candidate_decision_timestamp,
  );
  const comparisonVersion = nonEmptyText(record.comparison_version);
  const baselinePolicyVersion = nonEmptyText(record.baseline_policy_version);
  const shadowPolicyVersion = nonEmptyText(record.shadow_policy_version);
  const candidateCount = nonNegativeInteger(record.candidate_count);
  const attributedCandidateCount = nonNegativeInteger(
    record.attributed_candidate_count,
  );
  if (
    !scanRunId ||
    !scanRunFingerprint ||
    !comparisonGeneratedAt ||
    !candidateDecisionTimestamp ||
    !comparisonVersion ||
    !baselinePolicyVersion ||
    !shadowPolicyVersion ||
    candidateCount === null ||
    attributedCandidateCount === null ||
    !Number.isFinite(Date.parse(comparisonGeneratedAt)) ||
    !Number.isFinite(Date.parse(candidateDecisionTimestamp))
  ) {
    return null;
  }

  const candidates = record.candidates.flatMap((value) => {
    const candidate = recordOrNull(value);
    const candidateId = nonEmptyText(candidate?.candidate_id);
    const ticker = nonEmptyText(candidate?.ticker);
    const disposition = nonEmptyText(
      candidate?.candidate_decision_disposition,
    );
    const baselineRank = positiveInteger(candidate?.baseline_rank);
    const shadowRank = positiveInteger(candidate?.shadow_rank);
    if (
      !candidate ||
      !candidateId ||
      !ticker ||
      !disposition ||
      baselineRank === null ||
      shadowRank === null ||
      typeof candidate.baseline_selected !== "boolean" ||
      typeof candidate.shadow_selected !== "boolean"
    ) {
      return [];
    }

    return [
      {
        candidate_id: candidateId,
        ticker: normalizedTicker(ticker),
        candidate_decision_disposition: disposition,
        baseline_rank: baselineRank,
        shadow_rank: shadowRank,
        baseline_selected: candidate.baseline_selected,
        shadow_selected: candidate.shadow_selected,
      },
    ];
  });
  if (candidates.length !== record.candidates.length) return null;

  const candidateIds = candidates.map((candidate) => candidate.candidate_id);
  const tickers = candidates.map((candidate) => candidate.ticker);
  if (
    new Set(candidateIds).size !== candidateIds.length ||
    new Set(tickers).size !== tickers.length ||
    (record.status === "attributed" &&
      (candidateCount !== candidates.length ||
        attributedCandidateCount !== candidateCount ||
        record.reason_codes.length !== 0)) ||
    (record.status === "conflicting" &&
      (attributedCandidateCount !== 0 || candidates.length !== 0))
  ) {
    return null;
  }

  return {
    attribution_version:
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_ATTRIBUTION_VERSION,
    attribution_kind: "scanner_intraday_liquidity_shadow_attribution",
    status: record.status,
    scan_run_id: scanRunId,
    scan_run_fingerprint: scanRunFingerprint,
    comparison_generated_at: comparisonGeneratedAt,
    candidate_decision_timestamp: candidateDecisionTimestamp,
    comparison_version: comparisonVersion,
    baseline_policy_version: baselinePolicyVersion,
    shadow_policy_version: shadowPolicyVersion,
    candidate_count: candidateCount,
    attributed_candidate_count: attributedCandidateCount,
    outcome_join_basis: "candidate_decision_id",
    outcome_evidence_status: "not_evaluated",
    quality_improvement_claimed: false,
    live_ranking_effect: false,
    publication_effect: false,
    reason_codes: uniqueSorted(record.reason_codes as string[]),
    candidates,
  };
}

/**
 * Freezes an exact, non-heuristic join from a shadow-ranking displacement to
 * the immutable candidate decision that may later receive an owner-bound
 * outcome. This is attribution evidence only: it never changes ranking,
 * publication, outcome eligibility, or execution.
 */
export function buildScannerIntradayLiquidityShadowAttribution({
  comparison,
  decisionRecord,
}: {
  comparison: ScannerIntradayLiquidityShadowComparison | null | undefined;
  decisionRecord: CandidateDecisionRecord | null | undefined;
}): ScannerIntradayLiquidityShadowAttribution | null {
  if (!comparison) return null;

  const reasonCodes: string[] = [];
  const scanRunId = decisionRecord?.scan_run_id?.trim() ?? "";
  const scanRunFingerprint =
    decisionRecord?.scan_run_fingerprint?.trim() ?? "";
  const comparisonGeneratedAt = Date.parse(comparison.generated_at);
  const candidateDecisionTimestamp = Date.parse(
    decisionRecord?.decision_timestamp ?? "",
  );
  const candidates = decisionRecord?.candidates ?? [];
  const rankedCandidates = candidates.filter(
    (candidate) => candidate.ranking !== null,
  );
  const candidatesByTicker = new Map(
    rankedCandidates.map((candidate) => [
      normalizedTicker(candidate.ticker),
      candidate,
    ]),
  );
  const displacementTickers = comparison.displacements.map((item) =>
    normalizedTicker(item.ticker),
  );
  const candidateTickers = rankedCandidates.map((candidate) =>
    normalizedTicker(candidate.ticker),
  );

  if (!decisionRecord || !scanRunId || !scanRunFingerprint) {
    reasonCodes.push("candidate_decision_identity_missing");
  }
  if (
    !Number.isFinite(comparisonGeneratedAt) ||
    !Number.isFinite(candidateDecisionTimestamp) ||
    comparisonGeneratedAt > candidateDecisionTimestamp
  ) {
    reasonCodes.push("decision_time_order_invalid");
  }
  if (comparison.status !== "comparable") {
    reasonCodes.push("shadow_comparison_not_comparable");
  }
  if (
    comparison.candidate_count !== comparison.displacements.length ||
    comparison.candidate_count !== rankedCandidates.length ||
    decisionRecord?.coverage.ranked_candidate_count !==
      rankedCandidates.length ||
    uniqueSorted(comparison.candidate_tickers).join("|") !==
      uniqueSorted(displacementTickers).join("|") ||
    uniqueSorted(displacementTickers).join("|") !==
      uniqueSorted(candidateTickers).join("|")
  ) {
    reasonCodes.push("candidate_population_mismatch");
  }
  if (
    new Set(displacementTickers).size !== displacementTickers.length ||
    new Set(candidateTickers).size !== candidateTickers.length
  ) {
    reasonCodes.push("candidate_identity_missing_or_duplicate");
  }

  const attributedCandidates = comparison.displacements.flatMap(
    (displacement) => {
      const candidate = candidatesByTicker.get(
        normalizedTicker(displacement.ticker),
      );
      if (!candidate || !candidate.candidate_id.trim() || !candidate.ranking) {
        reasonCodes.push("candidate_decision_join_missing");
        return [];
      }
      if (
        candidate.ranking.rank !== displacement.baseline_rank ||
        candidate.ranking.score !== displacement.baseline_score ||
        candidate.ranking.tier !== displacement.baseline_tier ||
        candidate.ranking.selected !== displacement.baseline_selected
      ) {
        reasonCodes.push("baseline_decision_evidence_conflict");
        return [];
      }

      return [
        {
          candidate_id: candidate.candidate_id,
          ticker: normalizedTicker(candidate.ticker),
          candidate_decision_disposition: candidate.disposition,
          baseline_rank: displacement.baseline_rank,
          shadow_rank: displacement.shadow_rank,
          baseline_selected: displacement.baseline_selected,
          shadow_selected: displacement.shadow_selected,
        },
      ];
    },
  );

  if (attributedCandidates.length !== comparison.candidate_count) {
    reasonCodes.push("candidate_attribution_incomplete");
  }

  const normalizedReasonCodes = uniqueSorted(reasonCodes);
  const attributed = normalizedReasonCodes.length === 0;

  return {
    attribution_version:
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_ATTRIBUTION_VERSION,
    attribution_kind: "scanner_intraday_liquidity_shadow_attribution",
    status: attributed ? "attributed" : "conflicting",
    scan_run_id: scanRunId,
    scan_run_fingerprint: scanRunFingerprint,
    comparison_generated_at: comparison.generated_at,
    candidate_decision_timestamp:
      decisionRecord?.decision_timestamp ?? "not_recorded",
    comparison_version: comparison.comparison_version,
    baseline_policy_version: comparison.baseline_policy_version,
    shadow_policy_version: comparison.shadow_policy_version,
    candidate_count: comparison.candidate_count,
    attributed_candidate_count: attributed ? attributedCandidates.length : 0,
    outcome_join_basis: "candidate_decision_id",
    outcome_evidence_status: "not_evaluated",
    quality_improvement_claimed: false,
    live_ranking_effect: false,
    publication_effect: false,
    reason_codes: normalizedReasonCodes,
    candidates: attributed ? attributedCandidates : [],
  };
}
