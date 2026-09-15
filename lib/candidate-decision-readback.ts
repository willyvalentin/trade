import type {
  CandidateDecisionDisposition,
  CandidateDecisionRecord,
} from "@/lib/candidate-decision-record";

export type CandidateDecisionRecordReadback = {
  status: "available" | "incomplete" | "unavailable";
  decision_timestamp: string | null;
  final_disposition: "recommendations_published" | "no_trade" | null;
  candidate_count: number;
  observed_candidate_count: number;
  ranked_candidate_count: number;
  data_health: {
    fresh_candidate_count: number;
    stale_candidate_count: number;
    gap_candidate_count: number;
    unknown_freshness_candidate_count: number;
  };
  strongest_unpublished_candidates: Array<{
    ticker: string;
    rank: number | null;
    score: number | null;
    disposition: CandidateDecisionDisposition;
    reason_codes: string[];
  }>;
  no_trade_reason: string | null;
  published_tickers: string[];
  reason_codes: string[];
};

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isFiniteNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isCandidateDisposition(
  value: unknown,
): value is CandidateDecisionDisposition {
  return (
    value === "published" ||
    value === "selected_not_published" ||
    value === "ranked_not_selected" ||
    value === "filtered_before_ranking" ||
    value === "not_evaluated"
  );
}

function isCandidateFreshness(value: unknown) {
  return (
    value === "fresh" ||
    value === "stale" ||
    value === "gap" ||
    value === "unknown"
  );
}

function isNullableText(value: unknown) {
  return value === null || stringOrNull(value) !== null;
}

function isIndicatorSource(value: unknown) {
  return (
    value === null ||
    value === "cache" ||
    value === "fresh" ||
    value === "unavailable"
  );
}

function hasKnownCandidateReadbackShape(value: unknown) {
  const candidate = objectOrNull(value);
  const ranking = candidate?.ranking === null
    ? null
    : objectOrNull(candidate?.ranking);
  const data = objectOrNull(candidate?.data);

  return (
    stringOrNull(candidate?.ticker) !== null &&
    isCandidateDisposition(candidate?.disposition) &&
    Array.isArray(candidate?.reason_codes) &&
    stringArray(candidate.reason_codes).length === candidate.reason_codes.length &&
    data !== null &&
    isNullableText(data.provider_source) &&
    isNullableText(data.source_timestamp) &&
    isCandidateFreshness(data.freshness) &&
    isIndicatorSource(data.indicator_source) &&
    Array.isArray(data.gap_codes) &&
    stringArray(data.gap_codes).length === data.gap_codes.length &&
    (candidate?.ranking === null ||
      (ranking !== null &&
        isFiniteNonNegativeNumber(ranking.rank) &&
        typeof ranking.score === "number" &&
        Number.isFinite(ranking.score)))
  );
}

/**
 * Stored scan-run payloads are untrusted at the browser boundary. Only accept
 * the versioned record shape this client knows how to explain.
 */
export function candidateDecisionRecordFromUnknown(
  value: unknown,
): CandidateDecisionRecord | null {
  const record = objectOrNull(value);
  const coverage = objectOrNull(record?.coverage);
  const finalDecision = objectOrNull(record?.final_decision);
  const candidates = Array.isArray(record?.candidates) ? record.candidates : null;
  const expectedCandidateCount = coverage?.expected_candidate_count;

  if (
    record?.record_version !== "candidate_decision_record_v1" ||
    record.record_kind !== "candidate_decision_record" ||
    candidates === null ||
    coverage?.full_membership_declared !== true ||
    typeof coverage.full_membership_captured !== "boolean" ||
    !isFiniteNonNegativeNumber(expectedCandidateCount) ||
    candidates.length !== expectedCandidateCount ||
    !isFiniteNonNegativeNumber(coverage.observed_candidate_count) ||
    !isFiniteNonNegativeNumber(coverage.ranked_candidate_count) ||
    !Array.isArray(coverage.membership_reason_codes) ||
    stringArray(coverage.membership_reason_codes).length !==
      coverage.membership_reason_codes.length ||
    !candidates.every(hasKnownCandidateReadbackShape) ||
    (finalDecision?.disposition !== "recommendations_published" &&
      finalDecision?.disposition !== "no_trade") ||
    !Array.isArray(finalDecision?.published_tickers) ||
    stringArray(finalDecision.published_tickers).length !==
      finalDecision.published_tickers.length ||
    (finalDecision.no_trade_reason !== null &&
      stringOrNull(finalDecision.no_trade_reason) === null)
  ) {
    return null;
  }

  return record as CandidateDecisionRecord;
}

export function summarizeCandidateDecisionRecord(
  record: CandidateDecisionRecord | null | undefined,
): CandidateDecisionRecordReadback {
  if (!record) {
    return {
      status: "unavailable",
      decision_timestamp: null,
      final_disposition: null,
      candidate_count: 0,
      observed_candidate_count: 0,
      ranked_candidate_count: 0,
      data_health: {
        fresh_candidate_count: 0,
        stale_candidate_count: 0,
        gap_candidate_count: 0,
        unknown_freshness_candidate_count: 0,
      },
      strongest_unpublished_candidates: [],
      no_trade_reason: null,
      published_tickers: [],
      reason_codes: ["candidate_decision_record_missing"],
    };
  }

  const strongestUnpublishedCandidates = [...record.candidates]
    .filter(
      (candidate) =>
        candidate.ranking !== null && candidate.disposition !== "published",
    )
    .sort(
      (first, second) =>
        (first.ranking?.rank ?? Number.MAX_SAFE_INTEGER) -
          (second.ranking?.rank ?? Number.MAX_SAFE_INTEGER) ||
        first.ticker.localeCompare(second.ticker),
    )
    .slice(0, 3)
    .map((candidate) => ({
      ticker: candidate.ticker,
      rank: candidate.ranking?.rank ?? null,
      score: candidate.ranking?.score ?? null,
      disposition: candidate.disposition,
      reason_codes: stringArray(candidate.reason_codes),
    }));
  const dataHealth = record.candidates.reduce(
    (summary, candidate) => {
      switch (candidate.data.freshness) {
        case "fresh":
          summary.fresh_candidate_count += 1;
          break;
        case "stale":
          summary.stale_candidate_count += 1;
          break;
        case "gap":
          summary.gap_candidate_count += 1;
          break;
        case "unknown":
          summary.unknown_freshness_candidate_count += 1;
          break;
      }
      return summary;
    },
    {
      fresh_candidate_count: 0,
      stale_candidate_count: 0,
      gap_candidate_count: 0,
      unknown_freshness_candidate_count: 0,
    },
  );

  return {
    status: record.coverage.full_membership_captured
      ? "available"
      : "incomplete",
    decision_timestamp: stringOrNull(record.decision_timestamp),
    final_disposition: record.final_decision.disposition,
    candidate_count: record.candidates.length,
    observed_candidate_count: record.coverage.observed_candidate_count,
    ranked_candidate_count: record.coverage.ranked_candidate_count,
    data_health: dataHealth,
    strongest_unpublished_candidates: strongestUnpublishedCandidates,
    no_trade_reason: record.final_decision.no_trade_reason,
    published_tickers: stringArray(record.final_decision.published_tickers),
    reason_codes: stringArray(record.coverage.membership_reason_codes),
  };
}
