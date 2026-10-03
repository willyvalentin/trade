import "server-only";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { buildRecommendationLearningBaselineReadiness } from "@/lib/recommendation-learning-baseline-readiness";
import { buildRelativePlanCharterEvaluationBundle } from "@/lib/server/relative-plan-charter-evaluation";
import type { RelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";

/** Membership is fixed from the frozen original input rule BEFORE looking at
 * outcomes. Missing/ambiguous labels can never remove an enrolled decision or
 * replace it with a later favorable decision. This measures the new basis;
 * legacy baseline eligibility, the full charter and promotion remain untouched. */
export function buildRelativePlanProspectiveLearning(input: {
  owner: string; freeze: unknown; source: RecommendationLearningBaselineSource; now: Date; trainedModelReceipt?: unknown;
  runtime?: RelativePlanCharterRuntimeSource;
}) {
  // One verified per-read bundle, not multiple independent replays of a mutable
  // source or model. No global cache: a later source correction is read afresh.
  const bundle = buildRelativePlanCharterEvaluationBundle(input);
  if (!bundle) return null;
  const { freeze, diagnostics } = bundle.original;
  const plan = freeze.plan;
  const receipt = bundle.sealed, partitions = bundle.probability_partitions, fullCharter = bundle.charter;
  const gaps = new Set(fullCharter.evidence_complete ? ["durably_finalized_full_charter_result_required"]
    : ["full_charter_forward_scorecard_required", "exact_runtime_cost_reliability_and_feasibility_required",
      ...fullCharter.missing_dimensions]);
  if (!receipt) gaps.add("durably_frozen_training_probability_model_required");
  if (partitions.slice(1).some(partition => partition.probability_measurement?.status !== "measured")) {
    gaps.add("training_only_probability_calibration_required");
  }
  for (const partition of partitions) {
    if (partition.required_decisions !== null && partition.enrolled_decision_count < partition.required_decisions) gaps.add(`${partition.partition}_decision_population_incomplete`);
    if (partition.missing_outcome_count > 0) gaps.add(`${partition.partition}_canonical_60m_outcomes_missing_or_conflicting`);
    for (const blocker of partition.probability_measurement?.blockers ?? []) gaps.add(`${partition.partition}_${blocker}`);
  }
  return { contract_version: "relative_plan_prospective_learning_v1" as const,
    status: "evidence_incomplete" as const, diagnostic_only: true as const, freeze, partitions, diagnostics,
    legacy_baseline_readiness: buildRecommendationLearningBaselineReadiness(input.source),
    trained_probability_model: receipt, full_charter: fullCharter,
    terminal_quality_decision: null, quality_improvement_claimed: false,
    blockers: [...gaps].sort(), authority: plan.authority };
}
