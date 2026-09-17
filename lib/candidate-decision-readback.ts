import type {
  CandidateDecisionDisposition,
  CandidateDecisionRecord,
} from "@/lib/candidate-decision-record";
import {
  buildCandidateDecisionLearningAttribution,
  candidateDecisionLearningAttributionFromUnknown,
} from "@/lib/candidate-decision-learning-attribution";
import type {
  RecommendationScanRun,
  RecommendationScanRunWindow,
} from "@/lib/recommendation-scan-run";

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

export type CandidateDecisionRecordHistoryEntry = {
  scan_run_id: string;
  scan_run_fingerprint: string;
  observed_at: string;
  trading_date: string | null;
  window: RecommendationScanRunWindow;
  readback: CandidateDecisionRecordReadback;
};

export type CandidateDecisionRecordHistory = {
  status: "available" | "partial" | "unavailable";
  considered_scan_run_count: number;
  valid_record_count: number;
  invalid_record_count: number;
  entries: CandidateDecisionRecordHistoryEntry[];
  comparison_to_previous: {
    previous_decision_timestamp: string;
    candidate_count_delta: number;
    ranked_candidate_count_delta: number;
    fresh_candidate_count_delta: number;
    final_disposition_changed: boolean;
  } | null;
  decision_mix: {
    recommendations_published_count: number;
    no_trade_count: number;
  };
  recurring_no_trade_reasons: Array<{
    reason: string;
    count: number;
  }>;
};

type CandidateDecisionRecordScanRun = Pick<
  RecommendationScanRun,
  | "id"
  | "run_fingerprint"
  | "trading_date"
  | "window"
  | "observed_at"
  | "payload_json"
>;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function isoTimestampOrNull(value: unknown) {
  const timestamp = stringOrNull(value);

  if (!timestamp) return null;

  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
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
    stringOrNull(candidate?.candidate_id) !== null &&
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

function hasConsistentPublishedDecision(
  candidates: unknown[],
  finalDecision: Record<string, unknown> | null,
) {
  const persistedTickers = stringArray(finalDecision?.published_tickers);
  if (!finalDecision || !persistedTickers) return false;

  const publishedCandidateTickers = candidates
    .map(objectOrNull)
    .flatMap((candidate) =>
      candidate?.disposition === "published" && stringOrNull(candidate.ticker)
        ? [candidate.ticker.trim().toUpperCase()]
        : [],
    );
  const normalizedPersistedTickers = persistedTickers.map((ticker) =>
    ticker.trim().toUpperCase(),
  );
  const publishedSet = new Set(publishedCandidateTickers);
  const persistedSet = new Set(normalizedPersistedTickers);

  if (
    publishedSet.size !== publishedCandidateTickers.length ||
    persistedSet.size !== normalizedPersistedTickers.length
  ) {
    return false;
  }
  if (finalDecision.disposition === "no_trade") {
    return publishedSet.size === 0 && persistedSet.size === 0;
  }

  return (
    finalDecision.disposition === "recommendations_published" &&
    publishedSet.size > 0 &&
    publishedSet.size === persistedSet.size &&
    [...publishedSet].every((ticker) => persistedSet.has(ticker))
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

  const recordVersion = record?.record_version;
  const isLegacyRecord = recordVersion === "candidate_decision_record_v1";
  const isCurrentRecord = recordVersion === "candidate_decision_record_v2";
  const learningAttribution = isCurrentRecord
    ? candidateDecisionLearningAttributionFromUnknown(record?.learning_attribution)
    : isLegacyRecord
      ? buildCandidateDecisionLearningAttribution({
          recommendationPublishPolicyVersion: null,
          canonicalEvaluationVersions: null,
        })
      : null;

  if (
    (!isLegacyRecord && !isCurrentRecord) ||
    record.record_kind !== "candidate_decision_record" ||
    learningAttribution === null ||
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
    !hasConsistentPublishedDecision(candidates, finalDecision) ||
    (finalDecision.no_trade_reason !== null &&
      stringOrNull(finalDecision.no_trade_reason) === null)
  ) {
    return null;
  }

  return {
    ...(record as Omit<CandidateDecisionRecord, "learning_attribution">),
    learning_attribution: learningAttribution,
  };
}

/**
 * A persisted payload is only attributable when its immutable scan identity
 * agrees with the owner-isolated scan-run row that carried it. This prevents a
 * structurally valid record from being displayed against the wrong scan.
 */
export function candidateDecisionRecordFromScanRun(
  scanRun: CandidateDecisionRecordScanRun,
): CandidateDecisionRecord | null {
  const record = candidateDecisionRecordFromUnknown(
    scanRun.payload_json.candidate_decision_record,
  );

  if (
    !record ||
    record.scan_run_id !== scanRun.id ||
    record.scan_run_fingerprint !== scanRun.run_fingerprint ||
    isoTimestampOrNull(record.decision_timestamp) === null ||
    isoTimestampOrNull(scanRun.observed_at) === null
  ) {
    return null;
  }

  return record;
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

/**
 * Turns the existing owner-isolated scan-run readback into a bounded audit
 * history. Payloads which are missing, malformed or mismatched to their scan
 * row are counted but never rendered as attributable decision evidence.
 */
export function buildCandidateDecisionRecordHistory({
  scanRuns,
  limit = 6,
}: {
  scanRuns: CandidateDecisionRecordScanRun[];
  limit?: number;
}): CandidateDecisionRecordHistory {
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.floor(limit))
    : 6;
  const records = [...scanRuns].sort(
    (first, second) => second.observed_at.localeCompare(first.observed_at),
  );
  const entries: CandidateDecisionRecordHistoryEntry[] = [];
  let invalidRecordCount = 0;
  const noTradeReasonCounts = new Map<string, number>();
  let recommendationsPublishedCount = 0;
  let noTradeCount = 0;

  for (const scanRun of records) {
    const record = candidateDecisionRecordFromScanRun(scanRun);

    if (!record) {
      invalidRecordCount += 1;
      continue;
    }

    const readback = summarizeCandidateDecisionRecord(record);
    entries.push({
      scan_run_id: scanRun.id,
      scan_run_fingerprint: scanRun.run_fingerprint,
      observed_at: scanRun.observed_at,
      trading_date: scanRun.trading_date,
      window: scanRun.window,
      readback,
    });

    if (readback.final_disposition === "recommendations_published") {
      recommendationsPublishedCount += 1;
    } else if (readback.final_disposition === "no_trade") {
      noTradeCount += 1;
      const reason = readback.no_trade_reason ?? "no_trade_reason_not_recorded";
      noTradeReasonCounts.set(reason, (noTradeReasonCounts.get(reason) ?? 0) + 1);
    }
  }

  const latest = entries[0] ?? null;
  const previous = entries[1] ?? null;
  const comparisonToPrevious = latest && previous
    ? {
        previous_decision_timestamp:
          previous.readback.decision_timestamp ?? previous.observed_at,
        candidate_count_delta:
          latest.readback.candidate_count - previous.readback.candidate_count,
        ranked_candidate_count_delta:
          latest.readback.ranked_candidate_count -
          previous.readback.ranked_candidate_count,
        fresh_candidate_count_delta:
          latest.readback.data_health.fresh_candidate_count -
          previous.readback.data_health.fresh_candidate_count,
        final_disposition_changed:
          latest.readback.final_disposition !== previous.readback.final_disposition,
      }
    : null;

  const validRecordCount = entries.length;

  return {
    status:
      validRecordCount === 0
        ? "unavailable"
        : invalidRecordCount > 0
          ? "partial"
          : "available",
    considered_scan_run_count: records.length,
    valid_record_count: validRecordCount,
    invalid_record_count: invalidRecordCount,
    entries: entries.slice(0, safeLimit),
    comparison_to_previous: comparisonToPrevious,
    decision_mix: {
      recommendations_published_count: recommendationsPublishedCount,
      no_trade_count: noTradeCount,
    },
    recurring_no_trade_reasons: [...noTradeReasonCounts.entries()]
      .map(([reason, count]) => ({ reason, count }))
      .sort((first, second) => second.count - first.count || first.reason.localeCompare(second.reason))
      .slice(0, 3),
  };
}
