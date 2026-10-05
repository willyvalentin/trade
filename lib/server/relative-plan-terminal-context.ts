import "server-only";
import type { RelativePlanCharterResultReceipt } from "@/lib/server/relative-plan-charter-result";
import { relativePlanCharterProportion } from "@/lib/server/relative-plan-charter-context";
import { relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";

export const RELATIVE_PLAN_TERMINAL_CONTEXT_VERSION = "relative_plan_terminal_context_diagnostic_v1" as const;
const dimensions = ["setup", "regime", "sector", "ticker"] as const;
type Dimension = typeof dimensions[number];
type Aggregate = { selected: number; resolved: number; positive: number; partitions: Set<string> };

/** Called only after the existing owner store independently replays the durable
 * result. No mutable source, caller slice or recomputed live model enters this
 * diagnostic. It does not change the stored v1 capsule or its disposition. */
export function relativePlanTerminalContextDiagnostic(receipt: RelativePlanCharterResultReceipt) {
  const measurement = receipt.result.measurement;
  if (!measurement.evidence_complete || measurement.computed_disposition === "evidence_incomplete" ||
    measurement.partitions.length !== 2 ||
    measurement.partitions[0].partition !== "held_out" || measurement.partitions[1].partition !== "walk_forward") return null;
  const groups = new Map<string, { dimension: Dimension; key: string; baseline?: Aggregate; challenger?: Aggregate }>();
  for (const partition of measurement.partitions) {
    if (!partition.evidence_complete || !partition.quality.original_outcome_population_complete) return null;
    for (const arm of partition.quality.quality_slices) {
      for (const slice of arm.dimensions) for (const group of slice.groups) {
        const identity = JSON.stringify([slice.dimension, group.key]);
        const pair = groups.get(identity) ?? { dimension: slice.dimension, key: group.key };
        const aggregate = pair[arm.arm] ?? { selected: 0, resolved: 0, positive: 0, partitions: new Set<string>() };
        if (aggregate.partitions.has(partition.partition) ||
          ![group.selected_candidate_count, group.resolved_outcome_count, group.positive_outcome_count].every(value => Number.isSafeInteger(value) && value >= 0) ||
          group.resolved_outcome_count > group.selected_candidate_count || group.positive_outcome_count > group.resolved_outcome_count) return null;
        aggregate.selected += group.selected_candidate_count;
        aggregate.resolved += group.resolved_outcome_count;
        aggregate.positive += group.positive_outcome_count;
        aggregate.partitions.add(partition.partition);
        pair[arm.arm] = aggregate;
        groups.set(identity, pair);
      }
    }
  }
  const summary = (value: Aggregate | undefined) => value ? {
    selected_candidate_count: value.selected, resolved_outcome_count: value.resolved,
    positive_outcome_count: value.positive, missing_outcome_count: value.selected - value.resolved,
    partition_coverage_count: value.partitions.size,
    precision: relativePlanCharterProportion(value.positive, value.resolved),
  } : null;
  const pairs = [...groups.values()].map(group => {
    const baseline = summary(group.baseline), challenger = summary(group.challenger);
    const eligibility = !baseline || !challenger ? "missing_arm" as const
      : baseline.partition_coverage_count !== 2 || challenger.partition_coverage_count !== 2 ? "incomplete_partition_coverage" as const
      : baseline.resolved_outcome_count < 10 || challenger.resolved_outcome_count < 10 ? "minimum_resolved_not_met" as const
      : "eligible" as const;
    const gap = eligibility === "eligible" && baseline?.precision && challenger?.precision
      ? baseline.precision.lower - challenger.precision.upper : null;
    return { dimension: group.dimension, key: group.key, baseline, challenger, eligibility,
      classification: eligibility !== "eligible" ? null : gap !== null && gap > 0 ? "conservative_regression" as const : "inconclusive" as const,
      conservative_regression_gap: gap,
      precision_delta: baseline?.precision && challenger?.precision ? challenger.precision.value - baseline.precision.value : null };
  }).sort((a, b) => dimensions.indexOf(a.dimension) - dimensions.indexOf(b.dimension) || a.key.localeCompare(b.key));
  const minimum = (pair: typeof pairs[number]) => Math.min(pair.baseline?.resolved_outcome_count ?? 0, pair.challenger?.resolved_outcome_count ?? 0);
  const regressions = pairs.filter(pair => pair.classification === "conservative_regression").sort((a, b) =>
    b.conservative_regression_gap! - a.conservative_regression_gap! || minimum(b) - minimum(a) ||
    dimensions.indexOf(a.dimension) - dimensions.indexOf(b.dimension) || a.key.localeCompare(b.key));
  const counts = {
    total: pairs.length, eligible: pairs.filter(pair => pair.eligibility === "eligible").length,
    conservative_regression: regressions.length, missing_arm: pairs.filter(pair => pair.eligibility === "missing_arm").length,
    incomplete_partition_coverage: pairs.filter(pair => pair.eligibility === "incomplete_partition_coverage").length,
    minimum_resolved_not_met: pairs.filter(pair => pair.eligibility === "minimum_resolved_not_met").length,
  };
  const body = {
    contract_version: RELATIVE_PLAN_TERMINAL_CONTEXT_VERSION,
    source: { result_id: receipt.result_id, result_fingerprint: receipt.result.result_fingerprint,
      plan_fingerprint: receipt.result.plan_fingerprint, charter_fingerprint: receipt.result.charter_fingerprint,
      model_binding_fingerprint: measurement.model_binding_fingerprint, source_as_of: receipt.result.source_as_of,
      finalized_at: receipt.finalized_at, terminal_decision: measurement.computed_disposition },
    rule: { dimensions, minimum_resolved_outcomes_per_arm: 10, required_partition_coverage_per_arm: 2,
      regression_boundary: "challenger_wilson_upper_strictly_below_baseline_wilson_lower",
      priority_order: "largest_conservative_gap_then_largest_minimum_resolved_then_setup_regime_sector_ticker_then_key" },
    status: regressions.length ? "conservative_regression_detected" as const
      : counts.eligible ? "no_conservative_regression" as const : "insufficient_evidence" as const,
    pair_counts: counts, pairs, priority_context: regressions[0] ?? null,
    quality_improvement_claimed: false, live_policy_effect: false,
    authority: { automatic_hypothesis_selection: false, ranking: false, publication: false,
      promotion: false, provider: false, broker: false },
  };
  return { ...body, diagnostic_fingerprint: relativePlanSemanticFingerprint(body) };
}
