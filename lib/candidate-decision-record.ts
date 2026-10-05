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
import type { CompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import type { CurrentSessionContext } from "@/lib/scanner-current-session-context";
import type { ScannerCurrentInputCalculationClock } from "@/lib/server/scanner-current-input-archive";
import type {
  ScannerCandidateRankingResult,
  ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";
import {
  buildCurrentDecisionStrategyReference,
  type DecisionStrategyReference,
} from "@/lib/decision-strategy-registry";
import { isFreshLiveReferenceMarketTime } from "@/lib/live-reference-freshness-policy";
import {
  captureScannerDecisionInputSnapshot,
  isScannerDecisionInputPublishable,
  COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION,
  COMPLETED_DAILY_DECISION_SCANNER_VERSION,
  type ScannerDecisionInputSnapshot,
} from "@/lib/scanner-decision-input-snapshot";

export const CANDIDATE_DECISION_CAPTURE_VERSION =
  "candidate_decision_capture_v1" as const;
export const INPUT_ATTRIBUTED_CANDIDATE_DECISION_CAPTURE_VERSION = "candidate_decision_capture_v2" as const;
export const INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION = "candidate_decision_record_v4" as const;
export const PRE_PUBLICATION_DECISION_CLOCK_VERSION = "pre_publication_decision_clock_v1" as const;
export const LEGACY_CANDIDATE_DECISION_RECORD_VERSION =
  "candidate_decision_record_v1" as const;
export const ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION =
  "candidate_decision_record_v2" as const;
export const CANDIDATE_DECISION_RECORD_VERSION =
  "candidate_decision_record_v3" as const;
// v2 changes only scanner data-collection admission: a confirmed fresh
// intraday cache is reused before a bounded provider refresh is reserved.
// Existing v1 decision records remain historical evidence and are never
// rewritten into this cohort.
export const CANDIDATE_DECISION_SCANNER_VERSION =
  "scanner_v2_fresh_cache_before_refresh" as const;
export const CANDIDATE_DECISION_UNIVERSE_VERSION =
  "scanner_universe_v1" as const;
export const CANDIDATE_DECISION_PROVIDER_CONTRACT_VERSION =
  "twelve_data_market_data_v1" as const;
export const CANDIDATE_DECISION_SNAPSHOT_LINKAGE_VERSION =
  "candidate_decision_snapshot_linkage_v1" as const;

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
  capture_version: typeof CANDIDATE_DECISION_CAPTURE_VERSION | typeof INPUT_ATTRIBUTED_CANDIDATE_DECISION_CAPTURE_VERSION;
  capture_timestamp: string;
  decision_timestamp?: string;
  decision_clock_version?: typeof PRE_PUBLICATION_DECISION_CLOCK_VERSION;
  scanner_version: typeof CANDIDATE_DECISION_SCANNER_VERSION | typeof COMPLETED_DAILY_DECISION_SCANNER_VERSION;
  input_policy_version?: typeof COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
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
    input_snapshot?: ScannerDecisionInputSnapshot;
    historical_input_context?: CompletedDailyContext;
    current_input_context?: CurrentSessionContext;
    current_input_calculation_clock?: ScannerCurrentInputCalculationClock;
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
    | typeof ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION
    | typeof CANDIDATE_DECISION_RECORD_VERSION
    | typeof INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION;
  record_kind: "candidate_decision_record";
  scan_run_id: string;
  scan_run_fingerprint: string;
  decision_timestamp: string;
  decision_clock?: {
    contract_version: typeof PRE_PUBLICATION_DECISION_CLOCK_VERSION;
    input_capture_timestamp: string;
    decision_timestamp: string;
  };
  strategy_reference: DecisionStrategyReference | null;
  versions: {
    scanner_version: string;
    universe_version: string;
    scoring_version: string;
    ranking_version: string;
    build_version: string;
    provider_contract_version: string;
    input_policy_version?: typeof COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
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
      input_snapshot?: ScannerDecisionInputSnapshot | null;
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

/**
 * Stable link used by research-only snapshots to prove which immutable scanner
 * decision produced their hypothetical plan. Keeping this constructor beside
 * the decision record prevents a later consumer from silently inventing a
 * ticker-only relation.
 */
export function candidateDecisionCandidateId(scanRunId: string, ticker: string) {
  return `scanner_candidate:v1:${scanRunId}:${normalizeTicker(ticker)}`;
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
    toIso(text(candidate.reference_price_timestamp) ?? "") ??
    toIso(text(candidate.intraday_indicator_cached_at) ?? "") ??
    null
  );
}

function observationGapCodes(
  candidate: ScannerCandidate,
  captureTimestamp: string,
) {
  const gaps: CandidateDecisionReasonCode[] = [];
  const hasPrice =
    typeof (candidate.latest_close ?? candidate.intraday_indicators?.latestPrice) ===
    "number";
  const observedAt = sourceTimestamp(candidate);
  const observedAtMilliseconds = observedAt === null ? null : Date.parse(observedAt);
  const captureMilliseconds = Date.parse(captureTimestamp);

  if (
    !hasPrice ||
    candidate.intraday_indicator_source === "unavailable" ||
    observedAt === null ||
    !Number.isFinite(captureMilliseconds) ||
    (observedAtMilliseconds !== null && observedAtMilliseconds > captureMilliseconds)
  ) {
    gaps.push("candidate_provider_gap");
  }

  if (candidate.intraday_indicator_stale === true) {
    gaps.push("provider_data_stale");
  }

  if (
    observedAtMilliseconds !== null &&
    observedAtMilliseconds <= captureMilliseconds &&
    !isFreshLiveReferenceMarketTime(observedAt, captureMilliseconds)
  ) {
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
  decisionTimestamp,
  universe,
  observedCandidates,
  inputPolicyVersion,
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
  decisionTimestamp?: string;
  universe: ScannerCandidate[];
  observedCandidates: ScannerCandidate[];
  inputPolicyVersion?: typeof COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
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
  const normalizedCaptureTimestamp = toIso(captureTimestamp) ?? new Date().toISOString();
  const observedByTicker = new Map(
    observedCandidates.map((candidate) => [normalizeTicker(candidate.ticker), candidate]),
  );
  const eligibleTickerSet = new Set(
    eligibleCandidateTickers.map(normalizeTicker),
  );
  const policyVersions = new Set(observedCandidates.map(candidate => candidate.scanner_input_policy_version ?? null));
  const inputAttributed = inputPolicyVersion === COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ||
    policyVersions.has(COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION);
  if ((inputPolicyVersion !== undefined && inputPolicyVersion !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION) ||
    [...policyVersions].some(version => version !== null && version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION) ||
    (inputAttributed && [...policyVersions].some(version => version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION))) {
    throw new Error("candidate_decision_mixed_or_unknown_input_policy");
  }
  if (inputAttributed && toIso(captureTimestamp) === null) throw new Error("candidate_decision_input_capture_timestamp_invalid");
  const explicitDecisionTimestamp = decisionTimestamp === undefined ? undefined : toIso(decisionTimestamp);
  if (decisionTimestamp !== undefined && (!inputAttributed || !explicitDecisionTimestamp ||
    Date.parse(explicitDecisionTimestamp) < Date.parse(normalizedCaptureTimestamp))) {
    throw new Error("candidate_decision_explicit_clock_invalid");
  }

  return {
    capture_version: inputAttributed ? INPUT_ATTRIBUTED_CANDIDATE_DECISION_CAPTURE_VERSION : CANDIDATE_DECISION_CAPTURE_VERSION,
    capture_timestamp: normalizedCaptureTimestamp,
    ...(explicitDecisionTimestamp ? { decision_timestamp: explicitDecisionTimestamp,
      decision_clock_version: PRE_PUBLICATION_DECISION_CLOCK_VERSION } : {}),
    scanner_version: inputAttributed ? COMPLETED_DAILY_DECISION_SCANNER_VERSION : CANDIDATE_DECISION_SCANNER_VERSION,
    ...(inputAttributed ? { input_policy_version: COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION } : {}),
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
      const dataGapCodes = observationGapCodes(
        candidate,
        normalizedCaptureTimestamp,
      );
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
            dataGapCodes.includes("provider_data_stale")
              ? true
              : typeof candidate.intraday_indicator_stale === "boolean"
                ? candidate.intraday_indicator_stale
                : null,
          data_gap_codes: dataGapCodes,
          ...(inputAttributed ? { input_snapshot: captureScannerDecisionInputSnapshot(candidate, normalizedCaptureTimestamp) } : {}),
          ...(inputAttributed && candidate.historical_input_context
            ? { historical_input_context: candidate.historical_input_context } : {}),
          ...(inputAttributed && candidate.current_input_context && candidate.current_input_calculation_clock
            ? { current_input_context: candidate.current_input_context,
              current_input_calculation_clock: candidate.current_input_calculation_clock } : {}),
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
  const inputAttributed = capture.capture_version === INPUT_ATTRIBUTED_CANDIDATE_DECISION_CAPTURE_VERSION;
  if (inputAttributed && (capture.scanner_version !== COMPLETED_DAILY_DECISION_SCANNER_VERSION ||
    capture.input_policy_version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION)) {
    throw new Error("candidate_decision_input_capture_version_mismatch");
  }
  if (!inputAttributed && (capture.scanner_version === COMPLETED_DAILY_DECISION_SCANNER_VERSION || capture.input_policy_version !== undefined)) {
    throw new Error("candidate_decision_input_capture_version_mismatch");
  }

  const hasExplicitClock = capture.decision_timestamp !== undefined || capture.decision_clock_version !== undefined;
  const explicitDecisionTimestamp = toIso(capture.decision_timestamp ?? "");
  const runStartedAt = scanRun.started_at == null ? null : toIso(scanRun.started_at);
  const runCompletedAt = scanRun.completed_at == null ? null : toIso(scanRun.completed_at);
  if (hasExplicitClock && (!inputAttributed || capture.decision_clock_version !== PRE_PUBLICATION_DECISION_CLOCK_VERSION ||
    !explicitDecisionTimestamp || toIso(capture.capture_timestamp) === null ||
    Date.parse(explicitDecisionTimestamp) < Date.parse(capture.capture_timestamp) ||
    (scanRun.started_at != null && (!runStartedAt || Date.parse(explicitDecisionTimestamp) < Date.parse(runStartedAt))) ||
    (scanRun.completed_at != null && (!runCompletedAt || Date.parse(explicitDecisionTimestamp) > Date.parse(runCompletedAt))))) {
    throw new Error("candidate_decision_explicit_clock_invalid");
  }
  // Completion acknowledges persistence; it is not a pre-publication decision.
  // Older captures/archives retain their historical clock semantics unchanged.
  const decisionTimestamp = explicitDecisionTimestamp ??
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
  const candidateIds = capture.universe.map((candidate) =>
    candidateDecisionCandidateId(scanRun.id, candidate.ticker),
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
    const sourceTimestampIsAfterDecision = observation?.source_timestamp !== null &&
      observation?.source_timestamp !== undefined &&
      Date.parse(observation.source_timestamp) > Date.parse(decisionTimestamp);
    const observedDataGapCodes: CandidateDecisionReasonCode[] =
      observation?.data_gap_codes ?? ["candidate_provider_gap"];
    const decisionTimestampGapCodes: CandidateDecisionReasonCode[] =
      sourceTimestampIsAfterDecision ? ["candidate_provider_gap"] : [];
    const sourceExpiredAtDecision = inputAttributed && observation?.source_timestamp !== null &&
      observation?.source_timestamp !== undefined && !sourceTimestampIsAfterDecision &&
      (!isFreshLiveReferenceMarketTime(observation.source_timestamp, Date.parse(decisionTimestamp)) ||
        (!!observation.input_snapshot?.current_session && !isScannerDecisionInputPublishable(
          observation.input_snapshot, candidate.ticker, new Date(decisionTimestamp))));
    const dataGapCodes = uniqueSorted<CandidateDecisionReasonCode>([
      ...observedDataGapCodes,
      ...decisionTimestampGapCodes,
      ...(sourceExpiredAtDecision ? ["provider_data_stale" as const] : []),
    ]);
    const reasonCodes: CandidateDecisionReasonCode[] = [
      ...dataGapCodes,
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
      : observation.stale === true || sourceExpiredAtDecision
        ? "stale"
        : dataGapCodes.includes("candidate_provider_gap")
          ? "gap"
          : observation.indicator_source === "fresh" || (inputAttributed && observation.stale === false && !!observation.input_snapshot?.current_session)
            ? "fresh"
            : observation.indicator_source === "cache"
              ? "unknown"
              : "unknown";
    if (inputAttributed && publishedTickerSet.has(candidate.ticker) &&
      (dataFreshness !== "fresh" || !observation?.input_snapshot?.current_session)) {
      throw new Error("candidate_decision_publication_input_incomplete");
    }

    return {
      candidate_id: candidateDecisionCandidateId(scanRun.id, candidate.ticker),
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
        gap_codes: dataGapCodes,
        ...(inputAttributed ? { input_snapshot: observation?.input_snapshot ?? null } : {}),
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
    record_version: inputAttributed ? INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION : CANDIDATE_DECISION_RECORD_VERSION,
    record_kind: "candidate_decision_record",
    scan_run_id: scanRun.id,
    scan_run_fingerprint: scanRun.run_fingerprint,
    decision_timestamp: decisionTimestamp,
    ...(hasExplicitClock ? { decision_clock: { contract_version: PRE_PUBLICATION_DECISION_CLOCK_VERSION,
      input_capture_timestamp: capture.capture_timestamp, decision_timestamp: decisionTimestamp } } : {}),
    strategy_reference: buildCurrentDecisionStrategyReference(
      capture.universe_version,
    ),
    versions: {
      scanner_version: capture.scanner_version,
      universe_version: capture.universe_version,
      scoring_version: scoringVersion,
      ranking_version: ranking
        ? `scanner_candidate_ranking_v${ranking.summary_version}`
        : "unknown",
      build_version: buildVersion,
      provider_contract_version: capture.provider_contract_version,
      ...(inputAttributed ? { input_policy_version: COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION } : {}),
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
