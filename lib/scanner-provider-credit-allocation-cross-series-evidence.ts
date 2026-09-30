import type { ObservationSeriesEvidenceReadback } from "@/lib/observation-series-evidence";
import {
  buildScannerProviderCreditAllocationCohort,
  type ScannerProviderCreditAllocationCohort,
} from "@/lib/scanner-provider-credit-allocation-cohort";
import {
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
  type ScannerProviderCreditAllocationShadow,
} from "@/lib/scanner-provider-credit-allocation-shadow";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_VERSION =
  "scanner_provider_credit_allocation_cross_series_evidence_v1" as const;
export const SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT_VERSION =
  "scanner_provider_credit_allocation_cross_series_contract_v1" as const;

const eligibleSeries = Object.freeze([
  Object.freeze({
    series_id: "observation_series_fa9f47b6a24fc3db",
    starts_at_utc: "2026-09-30T16:15:00.000Z",
    expires_at_utc: "2026-09-30T16:45:00.000Z",
  }),
  Object.freeze({
    series_id: "observation_series_15f795345822f5f6",
    starts_at_utc: "2026-09-30T17:00:00.000Z",
    expires_at_utc: "2026-09-30T17:30:00.000Z",
  }),
]);

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT =
  Object.freeze({
    contract_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT_VERSION,
    evidence_mode: "retrospective_design_support_only" as const,
    trading_date: "2026-09-30",
    commit_ref: "fdadb7c7b163af115642838d353a48ebeb5cefff",
    baseline_policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    challenger_policy_version: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    provider_credit_cap: 6,
    required_observed_cycles: 2,
    non_observed_cycle_treatment: "retain_in_denominator" as const,
    eligible_series: eligibleSeries,
  });

export type ScannerProviderCreditAllocationCrossSeriesSource = Readonly<{
  series_id: string;
  trading_date: string;
  starts_at_utc: string;
  expires_at_utc: string;
  commit_ref: string;
  operational_classification: string;
  lineage_status: string;
  published_recommendations: number;
  provider_credit_allocation: ScannerProviderCreditAllocationCohort;
  authority_is_inert: boolean;
}>;

export type ScannerProviderCreditAllocationCrossSeriesEvidence = Readonly<{
  evidence_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_VERSION;
  contract: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT;
  status: "available" | "insufficient_evidence" | "invalid";
  reason_codes: readonly string[];
  series_counts: Readonly<{
    required: number;
    received: number;
    valid: number;
  }>;
  cycle_counts: ScannerProviderCreditAllocationCohort["cycle_counts"];
  aggregate: ScannerProviderCreditAllocationCohort["aggregate"];
  assessment: Readonly<{
    signal:
      | "consistent_retrospective_breadth_improvement_projected"
      | "insufficient_evidence"
      | "invalid";
    next_step:
      | "prepare_predeclared_reversible_live_allocation_experiment"
      | "retain_baseline_and_collect_missing_evidence"
      | "repair_evidence";
    recommendation_quality: "unproven";
    live_allocation_status: "unchanged";
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

function inertAuthority() {
  return Object.freeze({
    can_call_provider: false as const,
    can_reserve_provider_credit: false as const,
    can_change_live_allocation: false as const,
    can_change_ranking_or_publication: false as const,
    can_lower_threshold: false as const,
    can_publish_candidate: false as const,
    can_execute_broker_action: false as const,
  });
}

function seriesAuthorityIsInert(
  authority: NonNullable<ObservationSeriesEvidenceReadback["series"]>["authority"],
) {
  return Boolean(
    authority && Object.values(authority).every((value) => value === false),
  );
}

export function providerCreditAllocationSeriesSourceFromReadback(
  readback: ObservationSeriesEvidenceReadback,
): ScannerProviderCreditAllocationCrossSeriesSource | null {
  const series = readback.series;
  if (readback.status !== "available" || !series) return null;
  return Object.freeze({
    series_id: series.series_id,
    trading_date: series.trading_date,
    starts_at_utc: series.starts_at_utc,
    expires_at_utc: series.expires_at_utc,
    commit_ref: series.build_deployment_identity.commit_ref,
    operational_classification: series.operational.classification,
    lineage_status: series.operational.lineage_status,
    published_recommendations: series.counts.published_recommendations,
    provider_credit_allocation: series.quality.provider_credit_allocation,
    authority_is_inert: seriesAuthorityIsInert(series.authority),
  });
}

function emptyCohort() {
  return buildScannerProviderCreditAllocationCohort([]);
}

export function buildScannerProviderCreditAllocationCrossSeriesEvidence(
  sources: readonly ScannerProviderCreditAllocationCrossSeriesSource[],
): ScannerProviderCreditAllocationCrossSeriesEvidence {
  const contract = SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT;
  const requiredById = new Map<string, (typeof contract.eligible_series)[number]>(
    contract.eligible_series.map((series) => [series.series_id, series]),
  );
  const duplicateIds = sources.length !== new Set(
    sources.map((source) => source.series_id),
  ).size;
  const unexpected = sources.some(
    (source) => !requiredById.has(source.series_id),
  );
  const matched = contract.eligible_series.flatMap((required) => {
    const source = sources.find((candidate) => candidate.series_id === required.series_id);
    return source ? [source] : [];
  });
  const valid = matched.filter((source) => {
    const required = requiredById.get(source.series_id)!;
    return (
      source.trading_date === contract.trading_date &&
      source.starts_at_utc === required.starts_at_utc &&
      source.expires_at_utc === required.expires_at_utc &&
      source.commit_ref === contract.commit_ref &&
      source.operational_classification === "pass" &&
      source.lineage_status === "attributed" &&
      source.published_recommendations === 0 &&
      source.authority_is_inert
    );
  });
  const structurallyInvalid = duplicateIds || unexpected || valid.length !== matched.length;
  const cycles: ScannerProviderCreditAllocationShadow[] = matched.flatMap(
    (source) => [...source.provider_credit_allocation.cycles],
  );
  const cohort = structurallyInvalid
    ? emptyCohort()
    : buildScannerProviderCreditAllocationCohort(cycles);
  const policyMismatch = cycles.some(
    (cycle) =>
      cycle.baseline.policy_version !== contract.baseline_policy_version ||
      cycle.challenger.policy_version !== contract.challenger_policy_version,
  );
  const capMismatch =
    cohort.provider_credit_cap !== null &&
    cohort.provider_credit_cap !== contract.provider_credit_cap;
  const invalid =
    structurallyInvalid ||
    policyMismatch ||
    capMismatch ||
    cohort.status === "invalid";
  const completeSeriesSet = matched.length === contract.eligible_series.length;
  const enoughObserved =
    cohort.cycle_counts.observed >= contract.required_observed_cycles;
  const consistentProjection =
    cohort.assessment.signal === "consistent_breadth_improvement_projected";
  const status = invalid
    ? ("invalid" as const)
    : completeSeriesSet && enoughObserved && consistentProjection
      ? ("available" as const)
      : ("insufficient_evidence" as const);
  const signal =
    status === "invalid"
      ? ("invalid" as const)
      : status === "available"
        ? ("consistent_retrospective_breadth_improvement_projected" as const)
        : ("insufficient_evidence" as const);

  return Object.freeze({
    evidence_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_VERSION,
    contract,
    status,
    reason_codes: Object.freeze([
      invalid
        ? "provider_allocation_cross_series_evidence_invalid"
        : status === "available"
          ? "retrospective_cross_series_breadth_support_available"
          : "provider_allocation_cross_series_evidence_incomplete",
      "non_observed_cycles_retained_in_denominator",
      "retrospective_evidence_cannot_authorize_live_policy_change",
      "recommendation_quality_requires_forward_outcomes",
    ]),
    series_counts: Object.freeze({
      required: contract.eligible_series.length,
      received: sources.length,
      valid: valid.length,
    }),
    cycle_counts: cohort.cycle_counts,
    aggregate: cohort.aggregate,
    assessment: Object.freeze({
      signal,
      next_step:
        status === "available"
          ? ("prepare_predeclared_reversible_live_allocation_experiment" as const)
          : status === "invalid"
            ? ("repair_evidence" as const)
            : ("retain_baseline_and_collect_missing_evidence" as const),
      recommendation_quality: "unproven" as const,
      live_allocation_status: "unchanged" as const,
    }),
    authority: inertAuthority(),
  });
}
