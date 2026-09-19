import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import type { RealScannerCandidate } from "@/lib/real-scanner-candidate-generation";
import type { RecommendationDecisionFeatureVector } from "@/lib/recommendation-decision-feature-vector";
import type { TwelveDataResponseIdentity } from "@/lib/twelve-data-response-identity";

export const REJECTED_CANDIDATE_RESEARCH_SELECTION_VERSION =
  "rejected_candidate_research_selection_v1" as const;

export type RejectedCandidateResearchSample = {
  candidate_id: string;
  ticker: string;
  company_name: string;
  tier: RealScannerCandidate["tier"];
  score: number;
  rank: null;
  entry_low: number;
  entry_high: number;
  entry: number;
  stop: number;
  target: number;
  target_2: number | null;
  risk_reward: number | null;
  provider_source: "twelve_data";
  market_data_source: "fresh";
  market_data_timestamp: string;
  intraday_indicator_response_identity?: TwelveDataResponseIdentity | null;
  decision_feature_vector?: RecommendationDecisionFeatureVector | null;
  rejection_publish_reason: string;
  sample_quality: "good";
  ranking_reason: string;
  ranking_warnings: string[];
  explicit_metadata_gaps: [];
};

export type RejectedCandidateResearchSelection = {
  selection_version: typeof REJECTED_CANDIDATE_RESEARCH_SELECTION_VERSION;
  samples: RejectedCandidateResearchSample[];
  rejected_candidates_considered_count: number;
  skipped_candidate_input_mismatch_count: number;
  skipped_not_fresh_count: number;
  skipped_invalid_geometry_count: number;
  skipped_due_to_sample_cap_count: number;
};

type RejectedDecisionCandidate = CandidateDecisionRecord["candidates"][number] & {
  disposition: "filtered_before_ranking";
};

function tickerKey(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function exactTimestamp(value: string | null | undefined) {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? value
    : null;
}

function isAtOrBeforeDecision({
  sourceTimestamp,
  decisionTimestamp,
}: {
  sourceTimestamp: string | null;
  decisionTimestamp: string;
}) {
  const sourceTime = Date.parse(sourceTimestamp ?? "");
  const decisionTime = Date.parse(decisionTimestamp);

  return (
    Number.isFinite(sourceTime) &&
    Number.isFinite(decisionTime) &&
    sourceTime <= decisionTime
  );
}

function validLongGeometry(candidate: RealScannerCandidate) {
  const entryLow = finiteNumber(candidate.entry_low);
  const entryHigh = finiteNumber(candidate.entry_high);
  const stop = finiteNumber(candidate.stop_loss);
  const target = finiteNumber(candidate.target_1);
  const target2 = finiteNumber(candidate.target_2);
  const entry =
    entryLow !== null && entryHigh !== null
      ? (entryLow + entryHigh) / 2
      : entryHigh ?? entryLow;

  if (
    entryLow === null ||
    entryHigh === null ||
    entry === null ||
    stop === null ||
    target === null ||
    stop >= entry ||
    entryLow > entryHigh ||
    target <= entry
  ) {
    return null;
  }

  return { entryLow, entryHigh, entry, stop, target, target2 };
}

function exactCandidateInput(
  candidates: RealScannerCandidate[],
  ticker: string,
) {
  const matches = candidates.filter(
    (candidate) => tickerKey(candidate.ticker) === tickerKey(ticker),
  );

  return matches.length === 1 ? matches[0] : null;
}

function hasExactlyOneLinkableDecisionCandidate(
  record: CandidateDecisionRecord,
  ticker: string,
) {
  return (
    record.candidates.filter(
      (candidate) =>
        tickerKey(candidate.ticker) === tickerKey(ticker) &&
        (candidate.disposition === "selected_not_published" ||
          candidate.disposition === "ranked_not_selected" ||
          candidate.disposition === "filtered_before_ranking"),
    ).length === 1
  );
}

function isOfficialWindow(scanWindow: IntradayScanWindow | "unknown") {
  return (
    scanWindow === "morning_momentum" ||
    scanWindow === "midday" ||
    scanWindow === "power_hour"
  );
}

function isFreshPointInTimeMatch({
  candidate,
  decisionCandidate,
  decisionRecordTimestamp,
}: {
  candidate: RealScannerCandidate;
  decisionCandidate: RejectedDecisionCandidate;
  decisionRecordTimestamp: string;
}) {
  const candidateTimestamp = exactTimestamp(candidate.market_data_timestamp);
  const candidateReferenceTimestamp =
    exactTimestamp(candidate.reference_price_timestamp) ?? candidateTimestamp;
  const decisionSourceTimestamp = exactTimestamp(
    decisionCandidate.data.source_timestamp,
  );

  return (
    candidate.stale === false &&
    candidate.data_source === "fresh" &&
    candidate.provider_source === "twelve_data" &&
    candidateReferenceTimestamp !== null &&
    decisionSourceTimestamp !== null &&
    candidateReferenceTimestamp === decisionSourceTimestamp &&
    isAtOrBeforeDecision({
      sourceTimestamp: decisionSourceTimestamp,
      decisionTimestamp: decisionRecordTimestamp,
    }) &&
    decisionCandidate.data.freshness === "fresh" &&
    decisionCandidate.data.provider_source === candidate.provider_source &&
    decisionCandidate.data.gap_codes.length === 0 &&
    !decisionCandidate.reason_codes.includes("candidate_provider_gap") &&
    !decisionCandidate.reason_codes.includes("provider_data_stale")
  );
}

/**
 * Selects only decision-recorded filtered candidates that already carry a
 * complete, fresh scanner plan. It deliberately does not construct a plan,
 * infer a side, or rehabilitate candidates rejected for provider gaps.
 */
export function buildRejectedCandidateResearchSelection({
  enabled,
  record,
  candidates,
  scanWindow,
  maxSamples,
  excludedTickers = [],
}: {
  enabled: boolean;
  record: CandidateDecisionRecord | null;
  candidates: RealScannerCandidate[];
  scanWindow: IntradayScanWindow | "unknown";
  maxSamples: number;
  excludedTickers?: string[];
}): RejectedCandidateResearchSelection {
  const max = Math.max(0, Math.floor(maxSamples));
  const excluded = new Set(excludedTickers.map(tickerKey));
  const rejected = (record?.candidates ?? [])
    .filter(
      (candidate): candidate is RejectedDecisionCandidate =>
        candidate.disposition === "filtered_before_ranking",
    )
    .sort((left, right) => left.candidate_id.localeCompare(right.candidate_id));
  const samples: RejectedCandidateResearchSample[] = [];
  let skippedCandidateInputMismatchCount = 0;
  let skippedNotFreshCount = 0;
  let skippedInvalidGeometryCount = 0;
  let skippedDueToSampleCapCount = 0;

  if (!enabled || !record || !isOfficialWindow(scanWindow) || max === 0) {
    return {
      selection_version: REJECTED_CANDIDATE_RESEARCH_SELECTION_VERSION,
      samples,
      rejected_candidates_considered_count: rejected.length,
      skipped_candidate_input_mismatch_count: 0,
      skipped_not_fresh_count: 0,
      skipped_invalid_geometry_count: 0,
      skipped_due_to_sample_cap_count: 0,
    };
  }

  for (const decisionCandidate of rejected) {
    if (excluded.has(tickerKey(decisionCandidate.ticker))) continue;

    if (
      !hasExactlyOneLinkableDecisionCandidate(record, decisionCandidate.ticker)
    ) {
      skippedCandidateInputMismatchCount += 1;
      continue;
    }

    const candidate = exactCandidateInput(candidates, decisionCandidate.ticker);
    if (!candidate) {
      skippedCandidateInputMismatchCount += 1;
      continue;
    }

    if (
      !isFreshPointInTimeMatch({
        candidate,
        decisionCandidate,
        decisionRecordTimestamp: record.decision_timestamp,
      })
    ) {
      skippedNotFreshCount += 1;
      continue;
    }

    const geometry = validLongGeometry(candidate);
    if (!geometry) {
      skippedInvalidGeometryCount += 1;
      continue;
    }

    if (samples.length >= max) {
      skippedDueToSampleCapCount += 1;
      continue;
    }

    samples.push({
      candidate_id: decisionCandidate.candidate_id,
      ticker: tickerKey(candidate.ticker),
      company_name: candidate.company_name,
      tier: candidate.tier,
      score: candidate.score.value,
      rank: null,
      entry_low: geometry.entryLow,
      entry_high: geometry.entryHigh,
      entry: geometry.entry,
      stop: geometry.stop,
      target: geometry.target,
      target_2: geometry.target2,
      risk_reward: finiteNumber(candidate.risk_reward),
      provider_source: "twelve_data",
      market_data_source: "fresh",
      market_data_timestamp: decisionCandidate.data.source_timestamp!,
      intraday_indicator_response_identity:
        candidate.intraday_indicator_response_identity,
      decision_feature_vector: candidate.decision_feature_vector,
      rejection_publish_reason: decisionCandidate.reason_codes.join(",") || "filtered_before_ranking",
      sample_quality: "good",
      ranking_reason: "Filtered before ranking; retained only as a non-live counterfactual research plan.",
      ranking_warnings: decisionCandidate.reason_codes,
      explicit_metadata_gaps: [],
    });
  }

  return {
    selection_version: REJECTED_CANDIDATE_RESEARCH_SELECTION_VERSION,
    samples,
    rejected_candidates_considered_count: rejected.length,
    skipped_candidate_input_mismatch_count: skippedCandidateInputMismatchCount,
    skipped_not_fresh_count: skippedNotFreshCount,
    skipped_invalid_geometry_count: skippedInvalidGeometryCount,
    skipped_due_to_sample_cap_count: skippedDueToSampleCapCount,
  };
}
