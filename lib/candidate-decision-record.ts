import {
  buildPreTruncationCandidateCaptureEvidence,
  type PreTruncationCandidateCaptureEvidence,
} from "@/lib/pre-truncation-candidate-capture-evidence";
import {
  buildCandidateDecisionLearningAttribution,
  type CandidateDecisionLearningAttribution,
} from "@/lib/candidate-decision-learning-attribution";
import type { SelectedCandidateBuildDiagnostic } from "@/lib/recommendation-build-diagnostics";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { ScannerCandidate } from "@/lib/scanner";
import type {
  ScannerCandidateRankingResult,
  ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";

export const CANDIDATE_DECISION_CAPTURE_VERSION =
  "candidate_decision_capture_v1" as const;
export const LEGACY_CANDIDATE_DECISION_RECORD_VERSION =
  "candidate_decision_record_v1" as const;
export const CANDIDATE_DECISION_RECORD_VERSION =
  "candidate_decision_record_v2" as const;
export const CANDIDATE_DECISION_SCANNER_VERSION = "scanner_v1" as const;
export const CANDIDATE_DECISION_UNIVERSE_VERSION =
  "scanner_universe_v1" as const;
export const CANDIDATE_DECISION_PROVIDER_CONTRACT_VERSION =
  "twelve_data_market_data_v1" as const;

export type CandidateDecisionDisposition =
  | "published"
  | "selected_not_published"
  | "ranked_not_selected"
  | "filtered_before_ranking"
  | "not_evaluated";

export type CandidateDecisionFreshness =
  | "fresh"
  | "stale"
  | "gap"
  | "unknown";

export type CandidateDecisionReasonCode =
  | "candidate_provider_gap"
  | "provider_data_stale"
  | "cooldown_active_position"
  | "current_recommendation_exists"
  | "daily_candidate_limit"
  | "session_candidate_limit"
  | "below_publish_threshold"
  | "ranking_not_selected"
  | "selection_capacity_exceeded"
  | "builder_not_attempted"
  | "builder_rejected"
  | "no_publishable_candidate"
  | "recommendation_validation_failed"
  | "no_trade";

export type CandidateDecisionCapture = {
  capture_version: typeof CANDIDATE_DECISION_CAPTURE_VERSION;
  capture_timestamp: string;
  scanner_version: typeof CANDIDATE_DECISION_SCANNER_VERSION;
  universe_version: typeof CANDIDATE_DECISION_UNIVERSE_VERSION;
  provider_contract_version: typeof CANDIDATE_DECISION_PROVIDER_CONTRACT_VERSION;
  universe: Array<{
    ticker: string;
    company_name: string;
    sector: string;
  }>;
  observed_candidates: Array<{
    ticker: string;
    company_name: string;
    sector: string;
    provider_source: string | null;
    source_timestamp: string | null;
    indicator_source: "cache" | "fresh" | "unavailable" | null;
    stale: boolean | null;
    data_gap_codes: CandidateDecisionReasonCode[];
  }>;
  ranking: ScannerCandidateRankingSummary | null;
  eligible_candidate_tickers: string[];
  eligibility_rejection_codes: Record<string, CandidateDecisionReasonCode[]>;
  publishable_threshold: number | null;
  no_publish_reason: string | null;
  recommendation_build_path: string | null;
  built_tickers: string[];
  published_tickers: string[];
  selected_build_diagnostics: SelectedCandidateBuildDiagnostic[];
};

export type CandidateDecisionRecord = {
  record_version:
    | typeof LEGACY_CANDIDATE_DECISION_RECORD_VERSION
    | typeof CANDIDATE_DECISION_RECORD_VERSION;
  record_kind: "candidate_decision_record";
  scan_run_id: string;
  scan_run_fingerprint: string;
  decision_timestamp: string;
  versions: {
    scanner_version: string;
    universe_version: string;
    scoring_version: string;
    ranking_version: string;
    build_version: string;
    provider_contract_version: string;
  };
  learning_attribution: CandidateDecisionLearningAttribution;
  coverage: {
    expected_candidate_count: number;
    observed_candidate_count: number;
    ranked_candidate_count: number;
    full_membership_declared: true;
    full_membership_captured: boolean;
    membership_reason_codes: string[];
    pre_truncation_capture_evidence:
      | PreTruncationCandidateCaptureEvidence
      | null;
  };
  candidates: Array<{
    candidate_id: string;
    ticker: string;
    company_name: string;
    sector: string;
    disposition: CandidateDecisionDisposition;
    eligibility: "eligible" | "ineligible" | "unknown";
    reason_codes: CandidateDecisionReasonCode[];
    data: {
      provider_source: string | null;
      source_timestamp: string | null;
      freshness: CandidateDecisionFreshness;
      indicator_source: "cache" | "fresh" | "unavailable" | null;
      gap_codes: CandidateDecisionReasonCode[];
    };
    ranking: {
      rank: number;
      score: number;
      tier: string;
      selected: boolean;
      selection_bucket: string;
      rank_reason: string;
      tie_break_key: string;
      components: ScannerCandidateRankingResult["score"]["components"];
      warnings: ScannerCandidateRankingResult["score"]["warnings"];
      gaps: string[];
    } | null;
    build: {
      built: boolean;
      rejection_reason: string | null;
      explanation: string | null;
    } | null;
  }>;
  final_decision: {
    disposition: "recommendations_published" | "no_trade";
    published_tickers: string[];
    no_trade_reason: string | null;
    recommendation_build_path: string | null;
  };
};

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeTicker(value: string) {
  return value.trim().toUpperCase();
}

function uniqueSorted<T extends string>(values: T[]) {
  return Array.from(new Set(values)).sort();
}

function toIso(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function sourceTimestamp(candidate: ScannerCandidate) {
  return (
    text(candidate.reference_price_timestamp) ??
    text(candidate.intraday_indicator_cached_at) ??
    null
  );
}

function observationGapCodes(candidate: ScannerCandidate) {
  const gaps: CandidateDecisionReasonCode[] = [];
  const hasPrice =
    typeof (candidate.latest_close ?? candidate.intraday_indicators?.latestPrice) ===
    "number";

  if (!hasPrice || candidate.intraday_indicator_source === "unavailable") {
    gaps.push("candidate_provider_gap");
  }

  if (candidate.intraday_indicator_stale === true) {
    gaps.push("provider_data_stale");
  }

  return uniqueSorted(gaps);
}

function mapReasonCode(value: string | null | undefined): CandidateDecisionReasonCode {
  switch (value) {
    case "below_publish_threshold":
      return "below_publish_threshold";
    case "fallback_builder_limit_reached":
      return "selection_capacity_exceeded";
    case "openai_no_trade":
    case "no_publishable_ranked_candidates":
      return "no_publishable_candidate";
    case "sanitizer_rejected":
    case "recommendation_validation_failed":
    case "deterministic_fallback_validation_failed":
      return "recommendation_validation_failed";
    default:
      return "builder_rejected";
  }
}

export function buildCandidateDecisionCapture({
  captureTimestamp,
  universe,
  observedCandidates,
  ranking = null,
  eligibleCandidateTickers = [],
  eligibilityRejectionCodes = {},
  publishableThreshold = null,
  noPublishReason = null,
  recommendationBuildPath = null,
  builtTickers = [],
  publishedTickers = [],
  selectedBuildDiagnostics = [],
}: {
  captureTimestamp: string;
  universe: ScannerCandidate[];
  observedCandidates: ScannerCandidate[];
  ranking?: ScannerCandidateRankingSummary | null;
  eligibleCandidateTickers?: string[];
  eligibilityRejectionCodes?: Record<string, CandidateDecisionReasonCode[]>;
  publishableThreshold?: number | null;
  noPublishReason?: string | null;
  recommendationBuildPath?: string | null;
  builtTickers?: string[];
  publishedTickers?: string[];
  selectedBuildDiagnostics?: SelectedCandidateBuildDiagnostic[];
}): CandidateDecisionCapture {
  const observedByTicker = new Map(
    observedCandidates.map((candidate) => [normalizeTicker(candidate.ticker), candidate]),
  );
  const eligibleTickerSet = new Set(
    eligibleCandidateTickers.map(normalizeTicker),
  );

  return {
    capture_version: CANDIDATE_DECISION_CAPTURE_VERSION,
    capture_timestamp: toIso(captureTimestamp) ?? new Date().toISOString(),
    scanner_version: CANDIDATE_DECISION_SCANNER_VERSION,
    universe_version: CANDIDATE_DECISION_UNIVERSE_VERSION,
    provider_contract_version: CANDIDATE_DECISION_PROVIDER_CONTRACT_VERSION,
    universe: universe.map((candidate) => ({
      ticker: normalizeTicker(candidate.ticker),
      company_name: candidate.company_name,
      sector: candidate.sector,
    })),
    observed_candidates: universe.flatMap((universeCandidate) => {
      const candidate = observedByTicker.get(normalizeTicker(universeCandidate.ticker));
      if (!candidate) return [];
      const dataGapCodes = observationGapCodes(candidate);
      return [
        {
          ticker: normalizeTicker(candidate.ticker),
          company_name: candidate.company_name,
          sector: candidate.sector,
          provider_source:
            text(candidate.reference_price_provider) ??
            (candidate.latest_close !== undefined ? "twelve_data" : null),
          source_timestamp: sourceTimestamp(candidate),
          indicator_source: candidate.intraday_indicator_source ?? null,
          stale:
            typeof candidate.intraday_indicator_stale === "boolean"
              ? candidate.intraday_indicator_stale
              : null,
          data_gap_codes: dataGapCodes,
        },
      ];
    }),
    ranking,
    eligible_candidate_tickers: uniqueSorted(
      eligibleCandidateTickers.map(normalizeTicker),
    ),
    eligibility_rejection_codes: Object.fromEntries(
      Object.entries(eligibilityRejectionCodes)
        .filter(([ticker]) => !eligibleTickerSet.has(normalizeTicker(ticker)))
        .map(
          ([ticker, codes]): [string, CandidateDecisionReasonCode[]] => [
            normalizeTicker(ticker),
            uniqueSorted(codes),
          ],
        )
        .sort(([first], [second]) => first.localeCompare(second)),
    ),
    publishable_threshold: publishableThreshold,
    no_publish_reason: text(noPublishReason),
    recommendation_build_path: text(recommendationBuildPath),
    built_tickers: uniqueSorted(builtTickers.map(normalizeTicker)),
    published_tickers: uniqueSorted(publishedTickers.map(normalizeTicker)),
    selected_build_diagnostics: selectedBuildDiagnostics.map((diagnostic) => ({
      ...diagnostic,
    })),
  };
}

export function buildCandidateDecisionRecord({
  scanRun,
  capture,
  scoringVersion,
  buildVersion,
  learningAttribution,
}: {
  scanRun: RecommendationScanRun;
  capture: CandidateDecisionCapture | null | undefined;
  scoringVersion: string;
  buildVersion: string;
  learningAttribution?: CandidateDecisionLearningAttribution | null;
}): CandidateDecisionRecord | null {
  if (!capture) return null;

  const decisionTimestamp =
    toIso(scanRun.completed_at ?? "") ??
    toIso(scanRun.observed_at) ??
    capture.capture_timestamp;
  const ranking = capture.ranking;
  const rankingsByTicker = new Map(
    (ranking?.results ?? []).map((result) => [normalizeTicker(result.ticker), result]),
  );
  const observationsByTicker = new Map(
    capture.observed_candidates.map((candidate) => [candidate.ticker, candidate]),
  );
  const diagnosticsByTicker = new Map(
    capture.selected_build_diagnostics.map((diagnostic) => [
      normalizeTicker(diagnostic.ticker),
      diagnostic,
    ]),
  );
  const eligibleTickerSet = new Set(capture.eligible_candidate_tickers);
  const builtTickerSet = new Set(capture.built_tickers);
  const publishedTickerSet = new Set(capture.published_tickers);
  const candidateIds = capture.universe.map(
    (candidate) => `scanner_candidate:v1:${scanRun.id}:${candidate.ticker}`,
  );
  const captureEvidence = buildPreTruncationCandidateCaptureEvidence({
    scan_identity: scanRun.id,
    producer_decision_id: scanRun.id,
    capture_stage_identity: "scanner-full-ranking-boundary",
    capture_stage_version: "scanner-full-ranking-boundary-v1",
    candidate_identities: candidateIds,
    capture_timestamp: decisionTimestamp,
    point_in_time_cutoff: decisionTimestamp,
    scanner_version: capture.scanner_version,
    universe_version: capture.universe_version,
    provider_contract_version: capture.provider_contract_version,
  });
  const fullMembershipCaptured =
    capture.universe.length === candidateIds.length &&
    new Set(capture.universe.map((candidate) => candidate.ticker)).size ===
      capture.universe.length &&
    captureEvidence.ok;

  const candidates = capture.universe.map((candidate) => {
    const observation = observationsByTicker.get(candidate.ticker) ?? null;
    const rank = rankingsByTicker.get(candidate.ticker) ?? null;
    const diagnostic = diagnosticsByTicker.get(candidate.ticker) ?? null;
    const filteringReasons = capture.eligibility_rejection_codes[candidate.ticker] ?? [];
    const reasonCodes: CandidateDecisionReasonCode[] = [
      ...(observation?.data_gap_codes ?? ["candidate_provider_gap"]),
      ...filteringReasons,
    ];
    let disposition: CandidateDecisionDisposition;
    let eligibility: "eligible" | "ineligible" | "unknown";

    if (!observation) {
      disposition = "not_evaluated";
      eligibility = "unknown";
    } else if (!eligibleTickerSet.has(candidate.ticker)) {
      disposition = "filtered_before_ranking";
      eligibility = "ineligible";
    } else if (publishedTickerSet.has(candidate.ticker)) {
      disposition = "published";
      eligibility = "eligible";
    } else if (rank?.selected) {
      disposition = "selected_not_published";
      eligibility = "eligible";
      if (diagnostic?.rejection_reason) {
        reasonCodes.push(mapReasonCode(diagnostic.rejection_reason));
      } else if (!builtTickerSet.has(candidate.ticker)) {
        reasonCodes.push("builder_not_attempted");
      }
    } else if (rank) {
      disposition = "ranked_not_selected";
      eligibility = "ineligible";
      reasonCodes.push(
        rank.score.tier === "strong" || rank.score.tier === "valid"
          ? "selection_capacity_exceeded"
          : "ranking_not_selected",
      );
    } else {
      disposition = "not_evaluated";
      eligibility = "unknown";
    }

    const dataFreshness: CandidateDecisionFreshness = !observation
      ? "gap"
      : observation.stale === true
        ? "stale"
        : observation.data_gap_codes.includes("candidate_provider_gap")
          ? "gap"
          : observation.indicator_source === "fresh"
            ? "fresh"
            : observation.indicator_source === "cache"
              ? "unknown"
              : "unknown";

    return {
      candidate_id: `scanner_candidate:v1:${scanRun.id}:${candidate.ticker}`,
      ticker: candidate.ticker,
      company_name: candidate.company_name,
      sector: candidate.sector,
      disposition,
      eligibility,
      reason_codes: uniqueSorted(reasonCodes),
      data: {
        provider_source: observation?.provider_source ?? null,
        source_timestamp: observation?.source_timestamp ?? null,
        freshness: dataFreshness,
        indicator_source: observation?.indicator_source ?? null,
        gap_codes: uniqueSorted(observation?.data_gap_codes ?? ["candidate_provider_gap"]),
      },
      ranking: rank
        ? {
            rank: rank.rank,
            score: rank.score.normalized_score,
            tier: rank.score.tier,
            selected: rank.selected,
            selection_bucket: rank.selection_bucket,
            rank_reason: rank.rank_reason,
            tie_break_key: rank.ticker,
            components: rank.score.components,
            warnings: rank.score.warnings,
            gaps: rank.score.gaps,
          }
        : null,
      build: diagnostic
        ? {
            built: diagnostic.built,
            rejection_reason: diagnostic.rejection_reason,
            explanation: diagnostic.explanation,
          }
        : null,
    };
  });
  const published = capture.published_tickers.length > 0;
  const noTradeReason = published ? null : capture.no_publish_reason ?? "no_trade";

  return {
    record_version: CANDIDATE_DECISION_RECORD_VERSION,
    record_kind: "candidate_decision_record",
    scan_run_id: scanRun.id,
    scan_run_fingerprint: scanRun.run_fingerprint,
    decision_timestamp: decisionTimestamp,
    versions: {
      scanner_version: capture.scanner_version,
      universe_version: capture.universe_version,
      scoring_version: scoringVersion,
      ranking_version: ranking
        ? `scanner_candidate_ranking_v${ranking.summary_version}`
        : "unknown",
      build_version: buildVersion,
      provider_contract_version: capture.provider_contract_version,
    },
    learning_attribution:
      learningAttribution ??
      buildCandidateDecisionLearningAttribution({
        recommendationPublishPolicyVersion: null,
        canonicalEvaluationVersions: null,
      }),
    coverage: {
      expected_candidate_count: capture.universe.length,
      observed_candidate_count: capture.observed_candidates.length,
      ranked_candidate_count: ranking?.candidates_ranked ?? 0,
      full_membership_declared: true,
      full_membership_captured: fullMembershipCaptured,
      membership_reason_codes: uniqueSorted([
        ...(fullMembershipCaptured ? [] : ["candidate_membership_incomplete"]),
        ...(!ranking
          ? ["ranking_not_available"]
          : ranking.candidates_ranked !== ranking.results.length
            ? ["ranking_results_truncated"]
            : []),
      ]),
      pre_truncation_capture_evidence: captureEvidence.ok
        ? captureEvidence.evidence
        : null,
    },
    candidates,
    final_decision: {
      disposition: published ? "recommendations_published" : "no_trade",
      published_tickers: capture.published_tickers,
      no_trade_reason: noTradeReason,
      recommendation_build_path: capture.recommendation_build_path,
    },
  };
}
