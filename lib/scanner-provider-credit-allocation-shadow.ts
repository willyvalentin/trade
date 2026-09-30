import {
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  type ScanProviderCandidateObservation,
} from "@/lib/scan-provider-candidate-observation";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_SHADOW_VERSION =
  "scanner_provider_credit_allocation_shadow_v1" as const;
export const SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION =
  "serial_shared_provider_budget_v1" as const;
export const SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION =
  "candidate_breadth_first_provider_budget_v1" as const;

type DataClass = "daily" | "intraday";

export type ScannerProviderCreditAllocation = Readonly<{
  ticker: string;
  ticker_index: number;
  data_class: DataClass;
}>;

export type ScannerProviderCreditAllocationShadow = Readonly<{
  shadow_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_SHADOW_VERSION;
  status: "observed" | "not_observed" | "invalid";
  reason_codes: readonly string[];
  provider_credit_cap: number | null;
  expected_candidate_count: number;
  baseline: Readonly<{
    policy_version: typeof SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION;
    reserved_credits: number;
    candidates_receiving_credit: number;
    late_candidates_without_credit: number;
  }>;
  challenger: Readonly<{
    policy_version: typeof SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION;
    planned_credits: number;
    candidates_receiving_credit: number;
    late_candidates_without_credit: number;
    unfunded_deficits: number;
    allocations: readonly ScannerProviderCreditAllocation[];
  }>;
  comparison: Readonly<{
    candidate_breadth_delta: number;
    late_unfunded_candidate_delta: number;
    signal:
      | "breadth_improvement_projected"
      | "mixed_projection"
      | "no_projected_improvement"
      | "not_evaluated"
      | "invalid";
    recommendation_quality: "unproven";
  }>;
  authority: Readonly<{
    can_call_provider: false;
    can_reserve_provider_credit: false;
    can_change_live_allocation: false;
    can_change_ranking_or_publication: false;
    can_lower_threshold: false;
    can_execute_broker_action: false;
  }>;
}>;

function inertAuthority(): ScannerProviderCreditAllocationShadow["authority"] {
  return Object.freeze({
    can_call_provider: false,
    can_reserve_provider_credit: false,
    can_change_live_allocation: false,
    can_change_ranking_or_publication: false,
    can_lower_threshold: false,
    can_execute_broker_action: false,
  });
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function emptyShadow(
  status: "not_observed" | "invalid",
  reasonCode: string,
): ScannerProviderCreditAllocationShadow {
  return Object.freeze({
    shadow_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_SHADOW_VERSION,
    status,
    reason_codes: Object.freeze([reasonCode]),
    provider_credit_cap: null,
    expected_candidate_count: 0,
    baseline: Object.freeze({
      policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
      reserved_credits: 0,
      candidates_receiving_credit: 0,
      late_candidates_without_credit: 0,
    }),
    challenger: Object.freeze({
      policy_version: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
      planned_credits: 0,
      candidates_receiving_credit: 0,
      late_candidates_without_credit: 0,
      unfunded_deficits: 0,
      allocations: Object.freeze([]),
    }),
    comparison: Object.freeze({
      candidate_breadth_delta: 0,
      late_unfunded_candidate_delta: 0,
      signal: status === "invalid" ? "invalid" : "not_evaluated",
      recommendation_quality: "unproven",
    }),
    authority: inertAuthority(),
  });
}

function refreshDeficits(observation: ScanProviderCandidateObservation) {
  const daily = observation.daily_data_source !== "fresh_cache";
  const intraday = observation.intraday_data_source !== "fresh_cache";
  return Object.freeze({ daily, intraday });
}

function candidateKey(allocation: ScannerProviderCreditAllocation) {
  return `${allocation.ticker_index}:${allocation.ticker}`;
}

function planBreadthFirst(
  observations: readonly ScanProviderCandidateObservation[],
  providerCreditCap: number,
) {
  const allocations: ScannerProviderCreditAllocation[] = [];
  const allocated = new Set<string>();

  const allocate = (
    observation: ScanProviderCandidateObservation,
    dataClass: DataClass,
  ) => {
    if (allocations.length >= providerCreditCap) return;
    const key = `${observation.ticker_index}:${observation.ticker}:${dataClass}`;
    if (allocated.has(key)) return;
    allocated.add(key);
    allocations.push(
      Object.freeze({
        ticker: observation.ticker,
        ticker_index: observation.ticker_index,
        data_class: dataClass,
      }),
    );
  };

  // First give each candidate at most one request. Daily history is the
  // prerequisite for the base scanner values, so it is the first deficit.
  for (const observation of observations) {
    const deficits = refreshDeficits(observation);
    if (deficits.daily) allocate(observation, "daily");
    else if (deficits.intraday) allocate(observation, "intraday");
  }

  // Only after breadth has been attempted may a candidate receive a second
  // request for its remaining data class.
  for (const observation of observations) {
    const deficits = refreshDeficits(observation);
    const dailyKey = `${observation.ticker_index}:${observation.ticker}:daily`;
    const intradayKey = `${observation.ticker_index}:${observation.ticker}:intraday`;
    if (deficits.daily && !allocated.has(dailyKey)) allocate(observation, "daily");
    if (deficits.intraday && !allocated.has(intradayKey)) {
      allocate(observation, "intraday");
    }
  }

  return Object.freeze(allocations);
}

export function buildScannerProviderCreditAllocationShadow({
  candidateObservations,
  providerCreditCap,
  terminal,
}: {
  candidateObservations: readonly ScanProviderCandidateObservation[];
  providerCreditCap: number | null;
  terminal: boolean;
}): ScannerProviderCreditAllocationShadow {
  if (!terminal) {
    return emptyShadow("not_observed", "provider_allocation_cycle_not_terminal");
  }
  if (candidateObservations.length === 0) {
    return emptyShadow("not_observed", "provider_allocation_candidates_missing");
  }
  const cap = nonNegativeInteger(providerCreditCap);
  if (cap === null || cap === 0) {
    return emptyShadow("invalid", "provider_allocation_credit_cap_invalid");
  }
  const sorted = [...candidateObservations].sort(
    (first, second) => first.ticker_index - second.ticker_index,
  );
  const uniqueTickers = new Set(sorted.map((item) => item.ticker));
  const structurallyValid = sorted.every(
    (item, index) =>
      item.observation_version === SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION &&
      item.ticker_index === index &&
      item.status !== "pending" &&
      item.daily_data_source !== "not_observed" &&
      nonNegativeInteger(item.provider_credits_reserved) !== null,
  );
  if (!structurallyValid || uniqueTickers.size !== sorted.length) {
    return emptyShadow("invalid", "provider_allocation_candidate_evidence_invalid");
  }
  const baselineReserved = sorted.reduce(
    (total, item) => total + item.provider_credits_reserved,
    0,
  );
  if (baselineReserved !== cap) {
    return emptyShadow(
      "not_observed",
      "provider_allocation_budget_not_fully_exercised",
    );
  }

  const lateIndexStart = Math.floor(sorted.length / 2);
  const hasDeficit = (item: ScanProviderCandidateObservation) => {
    const deficits = refreshDeficits(item);
    return deficits.daily || deficits.intraday;
  };
  const baselineCandidatesReceivingCredit = sorted.filter(
    (item) => item.provider_credits_reserved > 0,
  ).length;
  const baselineLateWithoutCredit = sorted.filter(
    (item) =>
      item.ticker_index >= lateIndexStart &&
      hasDeficit(item) &&
      item.provider_credits_reserved === 0,
  ).length;
  const challengerAllocations = planBreadthFirst(sorted, cap);
  const challengerCandidateKeys = new Set(
    challengerAllocations.map(candidateKey),
  );
  const challengerLateWithoutCredit = sorted.filter(
    (item) =>
      item.ticker_index >= lateIndexStart &&
      hasDeficit(item) &&
      !challengerCandidateKeys.has(`${item.ticker_index}:${item.ticker}`),
  ).length;
  const totalDeficits = sorted.reduce((total, item) => {
    const deficits = refreshDeficits(item);
    return total + Number(deficits.daily) + Number(deficits.intraday);
  }, 0);
  const candidateBreadthDelta =
    challengerCandidateKeys.size - baselineCandidatesReceivingCredit;
  const lateUnfundedCandidateDelta =
    challengerLateWithoutCredit - baselineLateWithoutCredit;
  const signal =
    candidateBreadthDelta > 0 && lateUnfundedCandidateDelta < 0
      ? ("breadth_improvement_projected" as const)
      : candidateBreadthDelta > 0 || lateUnfundedCandidateDelta < 0
        ? ("mixed_projection" as const)
        : ("no_projected_improvement" as const);

  return Object.freeze({
    shadow_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_SHADOW_VERSION,
    status: "observed",
    reason_codes: Object.freeze([
      signal === "breadth_improvement_projected"
        ? "candidate_breadth_first_allocation_improves_coverage_proxy"
        : signal === "mixed_projection"
          ? "candidate_breadth_first_allocation_has_mixed_coverage_proxy"
          : "candidate_breadth_first_allocation_has_no_coverage_proxy_gain",
      "recommendation_quality_requires_forward_outcomes",
    ]),
    provider_credit_cap: cap,
    expected_candidate_count: sorted.length,
    baseline: Object.freeze({
      policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
      reserved_credits: baselineReserved,
      candidates_receiving_credit: baselineCandidatesReceivingCredit,
      late_candidates_without_credit: baselineLateWithoutCredit,
    }),
    challenger: Object.freeze({
      policy_version: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
      planned_credits: challengerAllocations.length,
      candidates_receiving_credit: challengerCandidateKeys.size,
      late_candidates_without_credit: challengerLateWithoutCredit,
      unfunded_deficits: Math.max(0, totalDeficits - challengerAllocations.length),
      allocations: challengerAllocations,
    }),
    comparison: Object.freeze({
      candidate_breadth_delta: candidateBreadthDelta,
      late_unfunded_candidate_delta: lateUnfundedCandidateDelta,
      signal,
      recommendation_quality: "unproven",
    }),
    authority: inertAuthority(),
  });
}

function authorityIsInert(value: unknown) {
  const authority = objectOrNull(value);
  return Boolean(
    authority &&
      authority.can_call_provider === false &&
      authority.can_reserve_provider_credit === false &&
      authority.can_change_live_allocation === false &&
      authority.can_change_ranking_or_publication === false &&
      authority.can_lower_threshold === false &&
      authority.can_execute_broker_action === false,
  );
}

export function scannerProviderCreditAllocationShadowFromUnknown(
  value: unknown,
): ScannerProviderCreditAllocationShadow {
  const candidate = objectOrNull(value);
  if (
    candidate?.shadow_version !==
      SCANNER_PROVIDER_CREDIT_ALLOCATION_SHADOW_VERSION ||
    !authorityIsInert(candidate.authority)
  ) {
    return emptyShadow("invalid", "provider_allocation_shadow_readback_invalid");
  }
  const status = candidate.status;
  const reasons = candidate.reason_codes;
  if (
    !["observed", "not_observed", "invalid"].includes(String(status)) ||
    !Array.isArray(reasons) ||
    !reasons.every((reason) => typeof reason === "string")
  ) {
    return emptyShadow("invalid", "provider_allocation_shadow_readback_invalid");
  }
  if (status !== "observed") {
    return emptyShadow(
      status as "not_observed" | "invalid",
      String(reasons[0] ?? "provider_allocation_shadow_not_observed"),
    );
  }
  const baseline = objectOrNull(candidate.baseline);
  const challenger = objectOrNull(candidate.challenger);
  const comparison = objectOrNull(candidate.comparison);
  const cap = nonNegativeInteger(candidate.provider_credit_cap);
  const expected = nonNegativeInteger(candidate.expected_candidate_count);
  const allocations = Array.isArray(challenger?.allocations)
    ? challenger.allocations
    : null;
  if (
    cap === null ||
    cap === 0 ||
    expected === null ||
    expected === 0 ||
    !baseline ||
    !challenger ||
    !comparison ||
    !allocations ||
    baseline.policy_version !== SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION ||
    challenger.policy_version !==
      SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION ||
    comparison.recommendation_quality !== "unproven" ||
    ![
      "breadth_improvement_projected",
      "mixed_projection",
      "no_projected_improvement",
    ].includes(String(comparison.signal))
  ) {
    return emptyShadow("invalid", "provider_allocation_shadow_readback_invalid");
  }
  const parsedAllocations = allocations.map((item) => {
    const allocation = objectOrNull(item);
    const ticker =
      typeof allocation?.ticker === "string"
        ? allocation.ticker.trim().toUpperCase()
        : null;
    const tickerIndex = nonNegativeInteger(allocation?.ticker_index);
    const dataClass = allocation?.data_class;
    return ticker &&
      /^[A-Z][A-Z0-9.-]{0,15}$/.test(ticker) &&
      tickerIndex !== null &&
      (dataClass === "daily" || dataClass === "intraday")
      ? Object.freeze({ ticker, ticker_index: tickerIndex, data_class: dataClass })
      : null;
  });
  const integerValues = [
    baseline.reserved_credits,
    baseline.candidates_receiving_credit,
    baseline.late_candidates_without_credit,
    challenger.planned_credits,
    challenger.candidates_receiving_credit,
    challenger.late_candidates_without_credit,
    challenger.unfunded_deficits,
  ].map(nonNegativeInteger);
  const parsed = parsedAllocations.filter(
    (item): item is ScannerProviderCreditAllocation => item !== null,
  );
  const allocationKeys = new Set(
    parsed.map(
      (item) => `${item.ticker_index}:${item.ticker}:${item.data_class}`,
    ),
  );
  const allocationCandidateKeys = new Set(parsed.map(candidateKey));
  const baselineCandidates = baseline.candidates_receiving_credit as number;
  const baselineLate = baseline.late_candidates_without_credit as number;
  const challengerCandidates = challenger.candidates_receiving_credit as number;
  const challengerLate = challenger.late_candidates_without_credit as number;
  const expectedSignal =
    challengerCandidates - baselineCandidates > 0 &&
    challengerLate - baselineLate < 0
      ? "breadth_improvement_projected"
      : challengerCandidates - baselineCandidates > 0 ||
          challengerLate - baselineLate < 0
        ? "mixed_projection"
        : "no_projected_improvement";
  const expectedReasons = [
    expectedSignal === "breadth_improvement_projected"
      ? "candidate_breadth_first_allocation_improves_coverage_proxy"
      : expectedSignal === "mixed_projection"
        ? "candidate_breadth_first_allocation_has_mixed_coverage_proxy"
        : "candidate_breadth_first_allocation_has_no_coverage_proxy_gain",
    "recommendation_quality_requires_forward_outcomes",
  ];
  const allocationCounts = new Map<string, ScannerProviderCreditAllocation[]>();
  for (const allocation of parsed) {
    const key = candidateKey(allocation);
    const current = allocationCounts.get(key) ?? [];
    current.push(allocation);
    allocationCounts.set(key, current);
  }
  const allocationShapeInvalid = [...allocationCounts.values()].some(
    (candidateAllocations) =>
      candidateAllocations.length > 2 ||
      (candidateAllocations.length === 2 &&
        (candidateAllocations[0].data_class !== "daily" ||
          candidateAllocations[1].data_class !== "intraday")),
  );
  if (
    parsedAllocations.some((item) => item === null) ||
    integerValues.some((item) => item === null) ||
    typeof comparison.candidate_breadth_delta !== "number" ||
    !Number.isSafeInteger(comparison.candidate_breadth_delta) ||
    typeof comparison.late_unfunded_candidate_delta !== "number" ||
    !Number.isSafeInteger(comparison.late_unfunded_candidate_delta) ||
    baseline.reserved_credits !== cap ||
    challenger.planned_credits !== parsedAllocations.length ||
    challenger.planned_credits !== cap ||
    allocationKeys.size !== parsed.length ||
    parsed.some((item) => item.ticker_index >= expected) ||
    challengerCandidates !== allocationCandidateKeys.size ||
    baselineCandidates > expected ||
    challengerCandidates > expected ||
    baselineLate > Math.ceil(expected / 2) ||
    challengerLate > Math.ceil(expected / 2) ||
    (challenger.unfunded_deficits as number) +
      (challenger.planned_credits as number) >
      expected * 2 ||
    allocationShapeInvalid ||
    reasons.length !== expectedReasons.length ||
    reasons.some((reason, index) => reason !== expectedReasons[index]) ||
    comparison.candidate_breadth_delta !==
      challengerCandidates - baselineCandidates ||
    comparison.late_unfunded_candidate_delta !== challengerLate - baselineLate ||
    comparison.signal !== expectedSignal
  ) {
    return emptyShadow("invalid", "provider_allocation_shadow_readback_inconsistent");
  }
  return value as ScannerProviderCreditAllocationShadow;
}
