import "server-only";

import { createHash } from "node:crypto";

import type { ScannerClockPriorShadowForwardDecisionResultReceipt } from
  "@/lib/scanner-clock-prior-shadow-forward-decision-store";

export const scannerClockPriorShadowContextDiagnosticVersion =
  "scanner_clock_prior_shadow_context_diagnostic_v1" as const;
export const scannerClockPriorShadowContextDiagnosticMinimumResolvedPerArm =
  10 as const;

const diagnosticDimensions = ["setup", "regime", "sector", "ticker"] as const;
type DiagnosticDimension = (typeof diagnosticDimensions)[number];
type PartitionName = "held_out" | "walk_forward";
type Arm = "baseline" | "candidate";

type Aggregate = {
  selected_candidate_count: number;
  resolved_outcome_count: number;
  positive_outcome_count: number;
  r_result_count: number;
  weighted_r_sum: number;
  partitions: Set<PartitionName>;
};

type PrecisionInterval = {
  value: number;
  numerator: number;
  denominator: number;
  lower: number;
  upper: number;
};

export type ScannerClockPriorShadowContextDiagnosticPair = {
  dimension: DiagnosticDimension;
  key: string;
  eligibility:
    | "eligible"
    | "missing_arm"
    | "incomplete_partition_coverage"
    | "minimum_resolved_not_met";
  classification: "conservative_regression" | "inconclusive" | null;
  baseline: {
    selected_candidate_count: number;
    resolved_outcome_count: number;
    positive_outcome_count: number;
    precision: PrecisionInterval | null;
    r_result_count: number;
    expectancy_r: number | null;
    partition_coverage_count: number;
  } | null;
  candidate: {
    selected_candidate_count: number;
    resolved_outcome_count: number;
    positive_outcome_count: number;
    precision: PrecisionInterval | null;
    r_result_count: number;
    expectancy_r: number | null;
    partition_coverage_count: number;
  } | null;
  precision_delta: number | null;
  conservative_regression_gap: number | null;
  expectancy_delta_r: number | null;
};

export type ScannerClockPriorShadowContextDiagnostic = {
  contract_version: typeof scannerClockPriorShadowContextDiagnosticVersion;
  diagnostic_fingerprint: string;
  source: {
    result_id: string;
    result_fingerprint: string;
    plan_id: string;
    plan_fingerprint: string;
    terminal_decision: "continue" | "narrow" | "reject";
  };
  rule: {
    dimensions: typeof diagnosticDimensions;
    minimum_resolved_outcomes_per_arm: typeof scannerClockPriorShadowContextDiagnosticMinimumResolvedPerArm;
    required_partition_coverage_per_arm: 2;
    regression_boundary:
      "candidate_wilson_upper_strictly_below_baseline_wilson_lower";
    priority_order:
      "largest_conservative_gap_then_largest_minimum_resolved_then_setup_regime_sector_ticker_then_key";
  };
  status:
    | "insufficient_evidence"
    | "no_conservative_regression"
    | "conservative_regression_detected";
  pair_counts: {
    total: number;
    eligible: number;
    conservative_regression: number;
    missing_arm: number;
    incomplete_partition_coverage: number;
    minimum_resolved_not_met: number;
  };
  priority_context: ScannerClockPriorShadowContextDiagnosticPair | null;
  pairs: ScannerClockPriorShadowContextDiagnosticPair[];
  shadow_only: true;
  live_ranking_effect: false;
  publication_effect: false;
  causal_improvement_claimed: false;
  authority: {
    can_select_next_hypothesis_automatically: false;
    can_change_ranking_or_publication: false;
    can_promote_policy: false;
    can_request_provider_data: false;
    can_execute_broker_action: false;
  };
};

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonical(nested)]),
    );
  }
  return value;
}

function fingerprint(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function wilson(numerator: number, denominator: number): PrecisionInterval {
  const value = numerator / denominator;
  const z = 1.959963984540054;
  const zSquared = z * z;
  const adjusted = 1 + zSquared / denominator;
  const center = (value + zSquared / (2 * denominator)) / adjusted;
  const margin = z * Math.sqrt(
    (value * (1 - value) + zSquared / (4 * denominator)) / denominator,
  ) / adjusted;
  return {
    value,
    numerator,
    denominator,
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
  };
}

function emptyAggregate(): Aggregate {
  return {
    selected_candidate_count: 0,
    resolved_outcome_count: 0,
    positive_outcome_count: 0,
    r_result_count: 0,
    weighted_r_sum: 0,
    partitions: new Set(),
  };
}

function armSummary(value: Aggregate | undefined) {
  if (!value) return null;
  return {
    selected_candidate_count: value.selected_candidate_count,
    resolved_outcome_count: value.resolved_outcome_count,
    positive_outcome_count: value.positive_outcome_count,
    precision: value.resolved_outcome_count > 0
      ? wilson(value.positive_outcome_count, value.resolved_outcome_count)
      : null,
    r_result_count: value.r_result_count,
    expectancy_r: value.r_result_count > 0
      ? value.weighted_r_sum / value.r_result_count
      : null,
    partition_coverage_count: value.partitions.size,
  };
}

function dimensionPriority(dimension: DiagnosticDimension) {
  return diagnosticDimensions.indexOf(dimension);
}

function pairPriority(
  left: ScannerClockPriorShadowContextDiagnosticPair,
  right: ScannerClockPriorShadowContextDiagnosticPair,
) {
  const gap = (right.conservative_regression_gap ?? -Infinity) -
    (left.conservative_regression_gap ?? -Infinity);
  if (gap !== 0) return gap;
  const leftMinimum = Math.min(
    left.baseline?.resolved_outcome_count ?? 0,
    left.candidate?.resolved_outcome_count ?? 0,
  );
  const rightMinimum = Math.min(
    right.baseline?.resolved_outcome_count ?? 0,
    right.candidate?.resolved_outcome_count ?? 0,
  );
  if (leftMinimum !== rightMinimum) return rightMinimum - leftMinimum;
  const dimension = dimensionPriority(left.dimension) -
    dimensionPriority(right.dimension);
  return dimension !== 0 ? dimension : left.key.localeCompare(right.key);
}

export function buildScannerClockPriorShadowContextDiagnostic(
  receipt: ScannerClockPriorShadowForwardDecisionResultReceipt,
): ScannerClockPriorShadowContextDiagnostic | null {
  const result = receipt.decision_result;
  if (
    result.status !== "decision_ready" ||
    result.decision === "pending" ||
    result.partitions.length !== 2
  ) return null;

  const aggregates = new Map<string, Record<Arm, Aggregate | undefined>>();
  for (const partition of result.partitions) {
    for (const slice of partition.quality_slices.slices) {
      const identity = JSON.stringify([slice.dimension, slice.key]);
      const arms = aggregates.get(identity) ?? {
        baseline: undefined,
        candidate: undefined,
      };
      const aggregate = arms[slice.arm] ?? emptyAggregate();
      aggregate.selected_candidate_count += slice.selected_candidate_count;
      aggregate.resolved_outcome_count += slice.resolved_outcome_count;
      aggregate.positive_outcome_count += slice.positive_outcome_count;
      aggregate.r_result_count += slice.r_result_count;
      aggregate.weighted_r_sum +=
        (slice.expectancy_r ?? 0) * slice.r_result_count;
      aggregate.partitions.add(partition.partition);
      arms[slice.arm] = aggregate;
      aggregates.set(identity, arms);
    }
  }

  const pairs = [...aggregates.entries()].map(([identity, arms]) => {
    const [dimension, key] = JSON.parse(identity) as [
      DiagnosticDimension,
      string,
    ];
    const baseline = armSummary(arms.baseline);
    const candidate = armSummary(arms.candidate);
    let eligibility: ScannerClockPriorShadowContextDiagnosticPair["eligibility"] =
      "eligible";
    if (!baseline || !candidate) eligibility = "missing_arm";
    else if (
      baseline.partition_coverage_count !== 2 ||
      candidate.partition_coverage_count !== 2
    ) eligibility = "incomplete_partition_coverage";
    else if (
      baseline.resolved_outcome_count <
        scannerClockPriorShadowContextDiagnosticMinimumResolvedPerArm ||
      candidate.resolved_outcome_count <
        scannerClockPriorShadowContextDiagnosticMinimumResolvedPerArm
    ) eligibility = "minimum_resolved_not_met";

    const precisionDelta = baseline?.precision && candidate?.precision
      ? candidate.precision.value - baseline.precision.value
      : null;
    const conservativeGap = eligibility === "eligible" &&
        baseline?.precision && candidate?.precision
      ? baseline.precision.lower - candidate.precision.upper
      : null;
    const classification = eligibility !== "eligible"
      ? null
      : conservativeGap !== null && conservativeGap > 0
        ? "conservative_regression" as const
        : "inconclusive" as const;
    return {
      dimension,
      key,
      eligibility,
      classification,
      baseline,
      candidate,
      precision_delta: precisionDelta,
      conservative_regression_gap: conservativeGap,
      expectancy_delta_r:
        baseline?.expectancy_r !== null && baseline?.expectancy_r !== undefined &&
          candidate?.expectancy_r !== null && candidate?.expectancy_r !== undefined
          ? candidate.expectancy_r - baseline.expectancy_r
          : null,
    } satisfies ScannerClockPriorShadowContextDiagnosticPair;
  }).sort((left, right) =>
    dimensionPriority(left.dimension) - dimensionPriority(right.dimension) ||
    left.key.localeCompare(right.key)
  );

  const regressions = pairs
    .filter((pair) => pair.classification === "conservative_regression")
    .sort(pairPriority);
  const counts = {
    total: pairs.length,
    eligible: pairs.filter((pair) => pair.eligibility === "eligible").length,
    conservative_regression: regressions.length,
    missing_arm: pairs.filter((pair) => pair.eligibility === "missing_arm").length,
    incomplete_partition_coverage: pairs.filter(
      (pair) => pair.eligibility === "incomplete_partition_coverage",
    ).length,
    minimum_resolved_not_met: pairs.filter(
      (pair) => pair.eligibility === "minimum_resolved_not_met",
    ).length,
  };
  const body = {
    contract_version: scannerClockPriorShadowContextDiagnosticVersion,
    source: {
      result_id: receipt.result_id,
      result_fingerprint: receipt.result_fingerprint,
      plan_id: receipt.plan_id,
      plan_fingerprint: receipt.plan_fingerprint,
      terminal_decision: result.decision,
    },
    rule: {
      dimensions: diagnosticDimensions,
      minimum_resolved_outcomes_per_arm:
        scannerClockPriorShadowContextDiagnosticMinimumResolvedPerArm,
      required_partition_coverage_per_arm: 2 as const,
      regression_boundary:
        "candidate_wilson_upper_strictly_below_baseline_wilson_lower" as const,
      priority_order:
        "largest_conservative_gap_then_largest_minimum_resolved_then_setup_regime_sector_ticker_then_key" as const,
    },
    status: regressions.length > 0
      ? "conservative_regression_detected" as const
      : counts.eligible > 0
        ? "no_conservative_regression" as const
        : "insufficient_evidence" as const,
    pair_counts: counts,
    priority_context: regressions[0] ?? null,
    pairs,
    shadow_only: true as const,
    live_ranking_effect: false as const,
    publication_effect: false as const,
    causal_improvement_claimed: false as const,
    authority: {
      can_select_next_hypothesis_automatically: false as const,
      can_change_ranking_or_publication: false as const,
      can_promote_policy: false as const,
      can_request_provider_data: false as const,
      can_execute_broker_action: false as const,
    },
  };
  return {
    ...body,
    diagnostic_fingerprint: fingerprint(body),
  };
}
