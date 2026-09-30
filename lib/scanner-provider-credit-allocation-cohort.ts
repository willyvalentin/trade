import {
  buildScannerProviderCreditAllocationShadow,
  scannerProviderCreditAllocationShadowFromUnknown,
  type ScannerProviderCreditAllocationShadow,
} from "@/lib/scanner-provider-credit-allocation-shadow";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_COHORT_VERSION =
  "scanner_provider_credit_allocation_cohort_v1" as const;

export type ScannerProviderCreditAllocationCohort = Readonly<{
  cohort_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_COHORT_VERSION;
  status: "available" | "insufficient_evidence" | "invalid";
  reason_codes: readonly string[];
  cycles: readonly ScannerProviderCreditAllocationShadow[];
  cycle_counts: Readonly<{
    total: number;
    observed: number;
    not_observed: number;
    invalid: number;
    breadth_improvement_projected: number;
    mixed_projection: number;
    no_projected_improvement: number;
  }>;
  provider_credit_cap: number | null;
  aggregate: Readonly<{
    expected_candidates: number;
    baseline_reserved_credits: number;
    challenger_planned_credits: number;
    baseline_candidates_receiving_credit: number;
    challenger_candidates_receiving_credit: number;
    candidate_breadth_delta: number;
    baseline_late_candidates_without_credit: number;
    challenger_late_candidates_without_credit: number;
    late_unfunded_candidate_delta: number;
    challenger_unfunded_deficits: number;
  }>;
  assessment: Readonly<{
    signal:
      | "consistent_breadth_improvement_projected"
      | "mixed_projection"
      | "no_projected_improvement"
      | "insufficient_evidence"
      | "invalid";
    next_step:
      | "prepare_separate_reversible_live_experiment_contract"
      | "collect_more_shadow_evidence"
      | "reject_challenger"
      | "repair_evidence";
    recommendation_quality: "unproven";
  }>;
  authority: Readonly<{
    can_call_provider: false;
    can_reserve_provider_credit: false;
    can_change_live_allocation: false;
    can_change_ranking_or_publication: false;
    can_lower_threshold: false;
    can_publish_candidate: false;
    can_execute_broker_action: false;
  }>;
}>;

function inertAuthority(): ScannerProviderCreditAllocationCohort["authority"] {
  return Object.freeze({
    can_call_provider: false,
    can_reserve_provider_credit: false,
    can_change_live_allocation: false,
    can_change_ranking_or_publication: false,
    can_lower_threshold: false,
    can_publish_candidate: false,
    can_execute_broker_action: false,
  });
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function integer(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) ? value : null;
}

function emptyShadow() {
  return buildScannerProviderCreditAllocationShadow({
    candidateObservations: [],
    providerCreditCap: null,
    terminal: false,
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
      authority.can_publish_candidate === false &&
      authority.can_execute_broker_action === false,
  );
}

export function buildScannerProviderCreditAllocationCohort(
  cycles: readonly ScannerProviderCreditAllocationShadow[],
): ScannerProviderCreditAllocationCohort {
  const observed = cycles.filter((cycle) => cycle.status === "observed");
  const invalid = cycles.filter((cycle) => cycle.status === "invalid").length;
  const notObserved = cycles.filter(
    (cycle) => cycle.status === "not_observed",
  ).length;
  const caps = new Set(
    observed.flatMap((cycle) =>
      cycle.provider_credit_cap === null ? [] : [cycle.provider_credit_cap],
    ),
  );
  const capMismatch = caps.size > 1;
  const status =
    invalid > 0 || capMismatch
      ? ("invalid" as const)
      : observed.length < 2
        ? ("insufficient_evidence" as const)
        : ("available" as const);
  const improvementCount = observed.filter(
    (cycle) => cycle.comparison.signal === "breadth_improvement_projected",
  ).length;
  const mixedCount = observed.filter(
    (cycle) => cycle.comparison.signal === "mixed_projection",
  ).length;
  const noImprovementCount = observed.filter(
    (cycle) => cycle.comparison.signal === "no_projected_improvement",
  ).length;
  const aggregate = Object.freeze({
    expected_candidates: observed.reduce(
      (total, cycle) => total + cycle.expected_candidate_count,
      0,
    ),
    baseline_reserved_credits: observed.reduce(
      (total, cycle) => total + cycle.baseline.reserved_credits,
      0,
    ),
    challenger_planned_credits: observed.reduce(
      (total, cycle) => total + cycle.challenger.planned_credits,
      0,
    ),
    baseline_candidates_receiving_credit: observed.reduce(
      (total, cycle) => total + cycle.baseline.candidates_receiving_credit,
      0,
    ),
    challenger_candidates_receiving_credit: observed.reduce(
      (total, cycle) => total + cycle.challenger.candidates_receiving_credit,
      0,
    ),
    candidate_breadth_delta: observed.reduce(
      (total, cycle) => total + cycle.comparison.candidate_breadth_delta,
      0,
    ),
    baseline_late_candidates_without_credit: observed.reduce(
      (total, cycle) => total + cycle.baseline.late_candidates_without_credit,
      0,
    ),
    challenger_late_candidates_without_credit: observed.reduce(
      (total, cycle) => total + cycle.challenger.late_candidates_without_credit,
      0,
    ),
    late_unfunded_candidate_delta: observed.reduce(
      (total, cycle) => total + cycle.comparison.late_unfunded_candidate_delta,
      0,
    ),
    challenger_unfunded_deficits: observed.reduce(
      (total, cycle) => total + cycle.challenger.unfunded_deficits,
      0,
    ),
  });
  const signal =
    status === "invalid"
      ? ("invalid" as const)
      : status === "insufficient_evidence"
        ? ("insufficient_evidence" as const)
        : improvementCount === observed.length &&
            aggregate.candidate_breadth_delta > 0 &&
            aggregate.late_unfunded_candidate_delta < 0
          ? ("consistent_breadth_improvement_projected" as const)
          : aggregate.candidate_breadth_delta <= 0 &&
              aggregate.late_unfunded_candidate_delta >= 0
            ? ("no_projected_improvement" as const)
            : ("mixed_projection" as const);
  const nextStep =
    signal === "consistent_breadth_improvement_projected"
      ? ("prepare_separate_reversible_live_experiment_contract" as const)
      : signal === "invalid"
        ? ("repair_evidence" as const)
        : signal === "no_projected_improvement"
          ? ("reject_challenger" as const)
          : ("collect_more_shadow_evidence" as const);

  return Object.freeze({
    cohort_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_COHORT_VERSION,
    status,
    reason_codes: Object.freeze([
      capMismatch
        ? "provider_allocation_shadow_credit_cap_mismatch"
        : status === "invalid"
          ? "provider_allocation_shadow_cycle_invalid"
          : status === "insufficient_evidence"
            ? "provider_allocation_shadow_requires_two_observed_cycles"
            : signal === "consistent_breadth_improvement_projected"
              ? "provider_allocation_shadow_consistent_breadth_gain"
              : signal === "no_projected_improvement"
                ? "provider_allocation_shadow_no_breadth_gain"
                : "provider_allocation_shadow_mixed_projection",
      "recommendation_quality_requires_forward_outcomes",
    ]),
    cycles: Object.freeze([...cycles]),
    cycle_counts: Object.freeze({
      total: cycles.length,
      observed: observed.length,
      not_observed: notObserved,
      invalid,
      breadth_improvement_projected: improvementCount,
      mixed_projection: mixedCount,
      no_projected_improvement: noImprovementCount,
    }),
    provider_credit_cap: caps.size === 1 ? [...caps][0] : null,
    aggregate,
    assessment: Object.freeze({
      signal,
      next_step: nextStep,
      recommendation_quality: "unproven",
    }),
    authority: inertAuthority(),
  });
}

export function scannerProviderCreditAllocationCohortFromUnknown(
  value: unknown,
): ScannerProviderCreditAllocationCohort | null {
  const candidate = objectOrNull(value);
  if (
    candidate?.cohort_version !==
      SCANNER_PROVIDER_CREDIT_ALLOCATION_COHORT_VERSION ||
    !Array.isArray(candidate.cycles) ||
    !authorityIsInert(candidate.authority)
  ) {
    return null;
  }
  const cycles = candidate.cycles.map((cycle) =>
    scannerProviderCreditAllocationShadowFromUnknown(cycle),
  );
  const expected = buildScannerProviderCreditAllocationCohort(cycles);
  const cycleCounts = objectOrNull(candidate.cycle_counts);
  const aggregate = objectOrNull(candidate.aggregate);
  const assessment = objectOrNull(candidate.assessment);
  const expectedCycleCounts = expected.cycle_counts;
  const expectedAggregate = expected.aggregate;
  const cycleKeys = Object.keys(expectedCycleCounts) as Array<
    keyof typeof expectedCycleCounts
  >;
  const aggregateKeys = Object.keys(expectedAggregate) as Array<
    keyof typeof expectedAggregate
  >;
  if (
    !cycleCounts ||
    !aggregate ||
    !assessment ||
    cycleKeys.some(
      (key) =>
        integer(cycleCounts[key]) === null ||
        cycleCounts[key] !== expectedCycleCounts[key],
    ) ||
    aggregateKeys.some(
      (key) =>
        integer(aggregate[key]) === null ||
        aggregate[key] !== expectedAggregate[key],
    ) ||
    candidate.status !== expected.status ||
    candidate.provider_credit_cap !== expected.provider_credit_cap ||
    assessment.signal !== expected.assessment.signal ||
    assessment.next_step !== expected.assessment.next_step ||
    assessment.recommendation_quality !== "unproven"
  ) {
    return null;
  }
  return value as ScannerProviderCreditAllocationCohort;
}

export function unavailableScannerProviderCreditAllocationShadow() {
  return emptyShadow();
}
