import {
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_SUMMARY_VERSION,
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  summarizeScanProviderCandidateObservations,
  type ActiveScanTrace,
  type ScanProviderCandidateObservation,
  type ScanProviderCandidateObservationReason,
  type ScanProviderCandidateObservationSummary,
} from "@/lib/active-scan-trace";

export const SCANNER_PROVIDER_COVERAGE_DIAGNOSTIC_VERSION =
  "scanner_provider_coverage_diagnostic_v1" as const;
export const SCANNER_PROVIDER_COVERAGE_COHORT_DIAGNOSTIC_VERSION =
  "scanner_provider_coverage_cohort_diagnostic_v1" as const;

const observationReasons = [
  "daily_provider_empty",
  "daily_provider_error",
  "daily_provider_insufficient_history",
  "daily_refresh_credit_cap_reached",
  "daily_stale_cache_fallback",
  "intraday_provider_unavailable",
  "intraday_refresh_credit_cap_reached",
  "intraday_stale_cache",
] as const satisfies readonly ScanProviderCandidateObservationReason[];

const dailySources = [
  "not_observed",
  "fresh_cache",
  "stale_cache",
  "provider",
  "unavailable",
] as const;
const intradaySources = dailySources;
const observationStatuses = ["pending", "rankable", "not_rankable"] as const;

export type ScannerProviderCoverageDiagnostic = Readonly<{
  diagnostic_version: typeof SCANNER_PROVIDER_COVERAGE_DIAGNOSTIC_VERSION;
  status: "observed" | "not_observed" | "invalid";
  reason_codes: readonly string[];
  daily_provider_credits_reserved: number;
  intraday_provider_credits_reserved: number;
  observations: readonly ScanProviderCandidateObservation[];
  summary: ScanProviderCandidateObservationSummary | null;
  authority: Readonly<{
    can_request_provider_data: false;
    can_reserve_provider_credits: false;
    can_change_ranking_or_publication: false;
    can_publish_candidate: false;
    can_execute_broker_action: false;
  }>;
}>;

export type ScannerProviderCoverageCohortDiagnostic = Readonly<{
  diagnostic_version:
    typeof SCANNER_PROVIDER_COVERAGE_COHORT_DIAGNOSTIC_VERSION;
  status: "available" | "insufficient_evidence" | "invalid";
  reason_codes: readonly string[];
  cycle_counts: Readonly<{
    total: number;
    observed: number;
    not_observed: number;
    invalid: number;
  }>;
  candidate_counts: Readonly<{
    expected: number;
    rankable: number;
    not_rankable: number;
    fully_observed: number;
  }>;
  provider_credits: Readonly<{
    total: number;
    daily: number;
    intraday: number;
  }>;
  gap_counts: Readonly<{
    credit_cap: number;
    provider_response: number;
    insufficient_history: number;
    stale_fallback: number;
  }>;
  position_analysis: Readonly<{
    early_expected: number;
    late_expected: number;
    early_credit_cap_gaps: number;
    late_credit_cap_gaps: number;
    early_credit_cap_gap_rate: number | null;
    late_credit_cap_gap_rate: number | null;
    late_gap_share: number | null;
    order_bias_signal:
      | "late_index_concentration"
      | "not_concentrated"
      | "insufficient_evidence";
  }>;
  investigation_priority:
    | "provider_credit_allocation"
    | "provider_response_quality"
    | "daily_history_depth"
    | "cache_freshness"
    | "mixed"
    | "none"
    | "insufficient_evidence";
  authority: ScannerProviderCoverageDiagnostic["authority"];
}>;

function inertAuthority(): ScannerProviderCoverageDiagnostic["authority"] {
  return Object.freeze({
    can_request_provider_data: false,
    can_reserve_provider_credits: false,
    can_change_ranking_or_publication: false,
    can_publish_candidate: false,
    can_execute_broker_action: false,
  });
}

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value.map((item) => item.trim()).filter(Boolean)
    : null;
}

function enumValue<T extends string>(value: unknown, values: readonly T[]) {
  return typeof value === "string" && values.includes(value as T)
    ? (value as T)
    : null;
}

function sameSummary(
  first: ScanProviderCandidateObservationSummary,
  second: ScanProviderCandidateObservationSummary,
) {
  return (
    first.summary_version === second.summary_version &&
    first.expected_candidate_count === second.expected_candidate_count &&
    first.rankable_candidate_count === second.rankable_candidate_count &&
    first.not_rankable_candidate_count === second.not_rankable_candidate_count &&
    first.pending_candidate_count === second.pending_candidate_count &&
    first.fully_observed_candidate_count === second.fully_observed_candidate_count &&
    first.provider_credit_cap_gap_count === second.provider_credit_cap_gap_count &&
    first.provider_empty_gap_count === second.provider_empty_gap_count &&
    first.provider_error_gap_count === second.provider_error_gap_count &&
    first.insufficient_history_gap_count === second.insufficient_history_gap_count &&
    first.stale_fallback_count === second.stale_fallback_count &&
    first.total_reserved_credits === second.total_reserved_credits &&
    first.dominant_gap_reason === second.dominant_gap_reason
  );
}

function parseObservation(value: unknown): ScanProviderCandidateObservation | null {
  const observation = objectOrNull(value);
  const ticker =
    typeof observation?.ticker === "string" ? observation.ticker.trim() : "";
  const tickerIndex = nonNegativeInteger(observation?.ticker_index);
  const status = enumValue(observation?.status, observationStatuses);
  const dailyDataSource = enumValue(observation?.daily_data_source, dailySources);
  const intradayDataSource = enumValue(
    observation?.intraday_data_source,
    intradaySources,
  );
  const reservedCredits = nonNegativeInteger(
    observation?.provider_credits_reserved,
  );
  const rawReasons = stringArray(observation?.reason_codes);
  const reasons = rawReasons?.map((reason) =>
    enumValue(reason, observationReasons),
  );
  if (
    observation?.observation_version !==
      SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION ||
    !/^[A-Z][A-Z0-9.-]{0,15}$/.test(ticker) ||
    tickerIndex === null ||
    !status ||
    !dailyDataSource ||
    !intradayDataSource ||
    reservedCredits === null ||
    !rawReasons ||
    !reasons ||
    reasons.some((reason) => reason === null) ||
    new Set(rawReasons).size !== rawReasons.length
  ) {
    return null;
  }
  return {
    observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
    ticker,
    ticker_index: tickerIndex,
    status,
    daily_data_source: dailyDataSource,
    intraday_data_source: intradayDataSource,
    provider_credits_reserved: reservedCredits,
    reason_codes: (reasons as ScanProviderCandidateObservationReason[])
      .slice()
      .sort(),
  };
}

function parseSummary(value: unknown): ScanProviderCandidateObservationSummary | null {
  const summary = objectOrNull(value);
  const dominantGapReason =
    summary?.dominant_gap_reason === null
      ? null
      : enumValue(summary?.dominant_gap_reason, observationReasons);
  const integerKeys = [
    "expected_candidate_count",
    "rankable_candidate_count",
    "not_rankable_candidate_count",
    "pending_candidate_count",
    "fully_observed_candidate_count",
    "provider_credit_cap_gap_count",
    "provider_empty_gap_count",
    "provider_error_gap_count",
    "insufficient_history_gap_count",
    "stale_fallback_count",
    "total_reserved_credits",
  ] as const;
  if (
    summary?.summary_version !==
      SCAN_PROVIDER_CANDIDATE_OBSERVATION_SUMMARY_VERSION ||
    integerKeys.some((key) => nonNegativeInteger(summary?.[key]) === null) ||
    (summary?.dominant_gap_reason !== null && !dominantGapReason)
  ) {
    return null;
  }
  return Object.freeze({
    summary_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_SUMMARY_VERSION,
    expected_candidate_count: summary.expected_candidate_count as number,
    rankable_candidate_count: summary.rankable_candidate_count as number,
    not_rankable_candidate_count: summary.not_rankable_candidate_count as number,
    pending_candidate_count: summary.pending_candidate_count as number,
    fully_observed_candidate_count: summary.fully_observed_candidate_count as number,
    provider_credit_cap_gap_count: summary.provider_credit_cap_gap_count as number,
    provider_empty_gap_count: summary.provider_empty_gap_count as number,
    provider_error_gap_count: summary.provider_error_gap_count as number,
    insufficient_history_gap_count:
      summary.insufficient_history_gap_count as number,
    stale_fallback_count: summary.stale_fallback_count as number,
    total_reserved_credits: summary.total_reserved_credits as number,
    dominant_gap_reason: dominantGapReason,
  });
}

function diagnostic(
  status: ScannerProviderCoverageDiagnostic["status"],
  reasonCodes: readonly string[],
  dailyCredits = 0,
  intradayCredits = 0,
  observations: readonly ScanProviderCandidateObservation[] = [],
  summary: ScanProviderCandidateObservationSummary | null = null,
): ScannerProviderCoverageDiagnostic {
  return Object.freeze({
    diagnostic_version: SCANNER_PROVIDER_COVERAGE_DIAGNOSTIC_VERSION,
    status,
    reason_codes: Object.freeze([...new Set(reasonCodes)]),
    daily_provider_credits_reserved: dailyCredits,
    intraday_provider_credits_reserved: intradayCredits,
    observations: Object.freeze([...observations]),
    summary,
    authority: inertAuthority(),
  });
}

export function scannerProviderCoverageDiagnosticFromTrace(
  trace: ActiveScanTrace | null,
  terminal: boolean,
): ScannerProviderCoverageDiagnostic {
  if (!trace) return diagnostic("not_observed", ["active_scan_trace_missing"]);
  const fetch = trace.market_data_fetch;
  if (fetch.candidate_observations.length === 0) {
    return diagnostic(
      fetch.attempted_tickers > 0 && terminal ? "invalid" : "not_observed",
      [
        fetch.attempted_tickers > 0
          ? "candidate_provider_observations_missing"
          : "market_data_fetch_not_observed",
      ],
    );
  }
  return buildScannerProviderCoverageDiagnostic({
    candidateObservations: fetch.candidate_observations,
    candidateObservationSummary: fetch.candidate_observation_summary,
    attemptedTickers: fetch.attempted_tickers,
    totalReservedCredits: fetch.provider_calls_reserved_count,
    dailyReservedCredits: fetch.daily_candle_provider_calls_reserved_count,
    intradayReservedCredits:
      fetch.intraday_indicator_provider_calls_reserved_count,
    terminal,
  });
}

export function buildScannerProviderCoverageDiagnostic({
  candidateObservations,
  candidateObservationSummary,
  attemptedTickers,
  totalReservedCredits,
  dailyReservedCredits,
  intradayReservedCredits,
  terminal,
}: {
  candidateObservations: readonly unknown[];
  candidateObservationSummary: unknown;
  attemptedTickers: unknown;
  totalReservedCredits: unknown;
  dailyReservedCredits: unknown;
  intradayReservedCredits: unknown;
  terminal: boolean;
}): ScannerProviderCoverageDiagnostic {
  const observations = candidateObservations.map(parseObservation);
  const summary = parseSummary(candidateObservationSummary);
  const attempted = nonNegativeInteger(attemptedTickers);
  const totalCredits = nonNegativeInteger(totalReservedCredits);
  const dailyCredits = nonNegativeInteger(dailyReservedCredits);
  const intradayCredits = nonNegativeInteger(intradayReservedCredits);
  if (
    observations.some((observation) => observation === null) ||
    !summary ||
    attempted === null ||
    totalCredits === null ||
    dailyCredits === null ||
    intradayCredits === null
  ) {
    return diagnostic("invalid", ["candidate_provider_coverage_malformed"]);
  }
  const parsed = observations as ScanProviderCandidateObservation[];
  const tickers = new Set(parsed.map((observation) => observation.ticker));
  const indices = parsed.map((observation) => observation.ticker_index);
  const contiguousIndices = indices.every((index, position) => index === position);
  const recomputed = summarizeScanProviderCandidateObservations(parsed);
  const hasPending = parsed.some((observation) => observation.status === "pending");
  const consistent =
    tickers.size === parsed.length &&
    contiguousIndices &&
    attempted === parsed.length &&
    totalCredits === dailyCredits + intradayCredits &&
    totalCredits === recomputed.total_reserved_credits &&
    sameSummary(summary, recomputed);
  if (!consistent || (terminal && hasPending)) {
    return diagnostic("invalid", [
      !consistent
        ? "candidate_provider_coverage_inconsistent"
        : "terminal_candidate_provider_observation_pending",
    ]);
  }
  if (hasPending) {
    return diagnostic("not_observed", ["candidate_provider_coverage_in_progress"]);
  }
  return diagnostic(
    "observed",
    ["candidate_provider_coverage_observed"],
    dailyCredits,
    intradayCredits,
    parsed,
    recomputed,
  );
}

function authorityIsInert(value: unknown) {
  const authority = objectOrNull(value);
  return Boolean(
    authority &&
      authority.can_request_provider_data === false &&
      authority.can_reserve_provider_credits === false &&
      authority.can_change_ranking_or_publication === false &&
      authority.can_publish_candidate === false &&
      authority.can_execute_broker_action === false,
  );
}

export function scannerProviderCoverageDiagnosticFromUnknown(
  value: unknown,
): ScannerProviderCoverageDiagnostic {
  const candidate = objectOrNull(value);
  const status = enumValue(candidate?.status, [
    "observed",
    "not_observed",
    "invalid",
  ] as const);
  const reasons = stringArray(candidate?.reason_codes);
  const dailyCredits = nonNegativeInteger(
    candidate?.daily_provider_credits_reserved,
  );
  const intradayCredits = nonNegativeInteger(
    candidate?.intraday_provider_credits_reserved,
  );
  if (
    candidate?.diagnostic_version !==
      SCANNER_PROVIDER_COVERAGE_DIAGNOSTIC_VERSION ||
    !status ||
    !reasons ||
    dailyCredits === null ||
    intradayCredits === null ||
    !authorityIsInert(candidate?.authority)
  ) {
    return diagnostic("invalid", ["candidate_provider_coverage_readback_invalid"]);
  }
  if (status !== "observed") {
    return diagnostic(status, reasons);
  }
  const observations = Array.isArray(candidate.observations)
    ? candidate.observations
    : [];
  return buildScannerProviderCoverageDiagnostic({
    candidateObservations: observations,
    candidateObservationSummary: candidate.summary,
    attemptedTickers: observations.length,
    totalReservedCredits: dailyCredits + intradayCredits,
    dailyReservedCredits: dailyCredits,
    intradayReservedCredits: intradayCredits,
    terminal: true,
  });
}

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : null;
}

function priorityFromCounts(counts: {
  credit_cap: number;
  provider_response: number;
  insufficient_history: number;
  stale_fallback: number;
}): ScannerProviderCoverageCohortDiagnostic["investigation_priority"] {
  const entries = Object.entries(counts) as Array<
    [keyof typeof counts, number]
  >;
  const maximum = Math.max(...entries.map(([, count]) => count));
  if (maximum === 0) return "none";
  const leaders = entries.filter(([, count]) => count === maximum);
  if (leaders.length !== 1) return "mixed";
  return {
    credit_cap: "provider_credit_allocation",
    provider_response: "provider_response_quality",
    insufficient_history: "daily_history_depth",
    stale_fallback: "cache_freshness",
  }[leaders[0][0]] as ScannerProviderCoverageCohortDiagnostic["investigation_priority"];
}

export function buildScannerProviderCoverageCohortDiagnostic(
  diagnostics: readonly ScannerProviderCoverageDiagnostic[],
): ScannerProviderCoverageCohortDiagnostic {
  const invalid = diagnostics.filter((item) => item.status === "invalid").length;
  const notObserved = diagnostics.filter(
    (item) => item.status === "not_observed",
  ).length;
  const observed = diagnostics.filter((item) => item.status === "observed");
  const summaries = observed.flatMap((item) => (item.summary ? [item.summary] : []));
  const observations = observed.flatMap((item) => item.observations);
  let earlyExpected = 0;
  let lateExpected = 0;
  let earlyCapGaps = 0;
  let lateCapGaps = 0;
  for (const item of observed) {
    const midpoint = Math.ceil(item.observations.length / 2);
    for (const observation of item.observations) {
      const isEarly = observation.ticker_index < midpoint;
      const hasCreditCapGap = observation.reason_codes.some((reason) =>
        [
          "daily_refresh_credit_cap_reached",
          "intraday_refresh_credit_cap_reached",
        ].includes(reason),
      );
      if (isEarly) {
        earlyExpected += 1;
        if (hasCreditCapGap) earlyCapGaps += 1;
      } else {
        lateExpected += 1;
        if (hasCreditCapGap) lateCapGaps += 1;
      }
    }
  }
  const earlyRate = ratio(earlyCapGaps, earlyExpected);
  const lateRate = ratio(lateCapGaps, lateExpected);
  const totalCapGaps = earlyCapGaps + lateCapGaps;
  const lateGapShare = ratio(lateCapGaps, totalCapGaps);
  const orderBiasSignal =
    observed.length < 2 || totalCapGaps < 2 || earlyRate === null || lateRate === null
      ? ("insufficient_evidence" as const)
      : lateRate - earlyRate >= 0.25 && (lateGapShare ?? 0) >= 0.75
        ? ("late_index_concentration" as const)
        : ("not_concentrated" as const);
  const gapCounts = {
    credit_cap: summaries.reduce(
      (total, summary) => total + summary.provider_credit_cap_gap_count,
      0,
    ),
    provider_response: summaries.reduce(
      (total, summary) =>
        total + summary.provider_empty_gap_count + summary.provider_error_gap_count,
      0,
    ),
    insufficient_history: summaries.reduce(
      (total, summary) => total + summary.insufficient_history_gap_count,
      0,
    ),
    stale_fallback: summaries.reduce(
      (total, summary) => total + summary.stale_fallback_count,
      0,
    ),
  };
  const status =
    invalid > 0
      ? ("invalid" as const)
      : observed.length < 2
        ? ("insufficient_evidence" as const)
        : ("available" as const);
  return Object.freeze({
    diagnostic_version:
      SCANNER_PROVIDER_COVERAGE_COHORT_DIAGNOSTIC_VERSION,
    status,
    reason_codes: Object.freeze([
      status === "invalid"
        ? "candidate_provider_coverage_cycle_invalid"
        : status === "insufficient_evidence"
          ? "candidate_provider_coverage_requires_two_cycles"
          : "candidate_provider_coverage_cohort_available",
    ]),
    cycle_counts: Object.freeze({
      total: diagnostics.length,
      observed: observed.length,
      not_observed: notObserved,
      invalid,
    }),
    candidate_counts: Object.freeze({
      expected: summaries.reduce(
        (total, summary) => total + summary.expected_candidate_count,
        0,
      ),
      rankable: summaries.reduce(
        (total, summary) => total + summary.rankable_candidate_count,
        0,
      ),
      not_rankable: summaries.reduce(
        (total, summary) => total + summary.not_rankable_candidate_count,
        0,
      ),
      fully_observed: summaries.reduce(
        (total, summary) => total + summary.fully_observed_candidate_count,
        0,
      ),
    }),
    provider_credits: Object.freeze({
      total: observations.reduce(
        (total, observation) => total + observation.provider_credits_reserved,
        0,
      ),
      daily: observed.reduce(
        (total, item) => total + item.daily_provider_credits_reserved,
        0,
      ),
      intraday: observed.reduce(
        (total, item) => total + item.intraday_provider_credits_reserved,
        0,
      ),
    }),
    gap_counts: Object.freeze(gapCounts),
    position_analysis: Object.freeze({
      early_expected: earlyExpected,
      late_expected: lateExpected,
      early_credit_cap_gaps: earlyCapGaps,
      late_credit_cap_gaps: lateCapGaps,
      early_credit_cap_gap_rate: earlyRate,
      late_credit_cap_gap_rate: lateRate,
      late_gap_share: lateGapShare,
      order_bias_signal: orderBiasSignal,
    }),
    investigation_priority:
      status === "available"
        ? priorityFromCounts(gapCounts)
        : status === "insufficient_evidence"
          ? "insufficient_evidence"
          : "mixed",
    authority: inertAuthority(),
  });
}

export function scannerProviderCoverageCohortDiagnosticFromUnknown(
  value: unknown,
): ScannerProviderCoverageCohortDiagnostic | null {
  const candidate = objectOrNull(value);
  if (
    candidate?.diagnostic_version !==
      SCANNER_PROVIDER_COVERAGE_COHORT_DIAGNOSTIC_VERSION ||
    !authorityIsInert(candidate?.authority)
  ) return null;
  const status = enumValue(candidate.status, [
    "available",
    "insufficient_evidence",
    "invalid",
  ] as const);
  const reasonCodes = stringArray(candidate.reason_codes);
  const cycleCounts = objectOrNull(candidate.cycle_counts);
  const candidateCounts = objectOrNull(candidate.candidate_counts);
  const providerCredits = objectOrNull(candidate.provider_credits);
  const gapCounts = objectOrNull(candidate.gap_counts);
  const position = objectOrNull(candidate.position_analysis);
  const priority = enumValue(candidate.investigation_priority, [
    "provider_credit_allocation",
    "provider_response_quality",
    "daily_history_depth",
    "cache_freshness",
    "mixed",
    "none",
    "insufficient_evidence",
  ] as const);
  const integerObjects = [
    [cycleCounts, ["total", "observed", "not_observed", "invalid"]],
    [candidateCounts, ["expected", "rankable", "not_rankable", "fully_observed"]],
    [providerCredits, ["total", "daily", "intraday"]],
    [gapCounts, ["credit_cap", "provider_response", "insufficient_history", "stale_fallback"]],
    [position, ["early_expected", "late_expected", "early_credit_cap_gaps", "late_credit_cap_gaps"]],
  ] as const;
  const validIntegers = integerObjects.every(([object, keys]) =>
    object && keys.every((key) => nonNegativeInteger(object[key]) !== null),
  );
  const nullableRates = [
    position?.early_credit_cap_gap_rate,
    position?.late_credit_cap_gap_rate,
    position?.late_gap_share,
  ];
  const ratesValid = nullableRates.every(
    (rate) => rate === null || (typeof rate === "number" && rate >= 0 && rate <= 1),
  );
  const orderBias = enumValue(position?.order_bias_signal, [
    "late_index_concentration",
    "not_concentrated",
    "insufficient_evidence",
  ] as const);
  if (
    !status ||
    !reasonCodes ||
    !validIntegers ||
    !ratesValid ||
    !orderBias ||
    !priority ||
    !cycleCounts ||
    !candidateCounts ||
    !providerCredits ||
    !gapCounts ||
    !position
  ) return null;
  const parsedCycleCounts = cycleCounts as Record<
    "total" | "observed" | "not_observed" | "invalid",
    number
  >;
  const parsedCandidateCounts = candidateCounts as Record<
    "expected" | "rankable" | "not_rankable" | "fully_observed",
    number
  >;
  const parsedProviderCredits = providerCredits as Record<
    "total" | "daily" | "intraday",
    number
  >;
  const parsedGapCounts = gapCounts as Record<
    "credit_cap" | "provider_response" | "insufficient_history" | "stale_fallback",
    number
  >;
  const parsedPosition = position as Record<
    | "early_expected"
    | "late_expected"
    | "early_credit_cap_gaps"
    | "late_credit_cap_gaps",
    number
  > & {
    early_credit_cap_gap_rate: number | null;
    late_credit_cap_gap_rate: number | null;
    late_gap_share: number | null;
  };
  const expectedStatus =
    parsedCycleCounts.invalid > 0
      ? "invalid"
      : parsedCycleCounts.observed < 2
        ? "insufficient_evidence"
        : "available";
  const expectedEarlyRate = ratio(
    parsedPosition.early_credit_cap_gaps,
    parsedPosition.early_expected,
  );
  const expectedLateRate = ratio(
    parsedPosition.late_credit_cap_gaps,
    parsedPosition.late_expected,
  );
  const totalCapGaps =
    parsedPosition.early_credit_cap_gaps +
    parsedPosition.late_credit_cap_gaps;
  const expectedLateShare = ratio(
    parsedPosition.late_credit_cap_gaps,
    totalCapGaps,
  );
  const expectedOrderBias =
    parsedCycleCounts.observed < 2 ||
    totalCapGaps < 2 ||
    expectedEarlyRate === null ||
    expectedLateRate === null
      ? "insufficient_evidence"
      : expectedLateRate - expectedEarlyRate >= 0.25 &&
          (expectedLateShare ?? 0) >= 0.75
        ? "late_index_concentration"
        : "not_concentrated";
  const expectedPriority =
    expectedStatus === "available"
      ? priorityFromCounts(parsedGapCounts)
      : expectedStatus === "insufficient_evidence"
        ? "insufficient_evidence"
        : "mixed";
  if (
    parsedCycleCounts.total !==
      parsedCycleCounts.observed +
        parsedCycleCounts.not_observed +
        parsedCycleCounts.invalid ||
    parsedCandidateCounts.expected !==
      parsedCandidateCounts.rankable + parsedCandidateCounts.not_rankable ||
    parsedCandidateCounts.fully_observed > parsedCandidateCounts.rankable ||
    parsedProviderCredits.total !==
      parsedProviderCredits.daily + parsedProviderCredits.intraday ||
    Object.values(parsedGapCounts).some(
      (count) => count > parsedCandidateCounts.expected,
    ) ||
    parsedPosition.early_expected + parsedPosition.late_expected !==
      parsedCandidateCounts.expected ||
    parsedPosition.early_credit_cap_gaps > parsedPosition.early_expected ||
    parsedPosition.late_credit_cap_gaps > parsedPosition.late_expected ||
    parsedGapCounts.credit_cap !== totalCapGaps ||
    parsedPosition.early_credit_cap_gap_rate !== expectedEarlyRate ||
    parsedPosition.late_credit_cap_gap_rate !== expectedLateRate ||
    parsedPosition.late_gap_share !== expectedLateShare ||
    status !== expectedStatus ||
    orderBias !== expectedOrderBias ||
    priority !== expectedPriority
  ) return null;
  return value as ScannerProviderCoverageCohortDiagnostic;
}
