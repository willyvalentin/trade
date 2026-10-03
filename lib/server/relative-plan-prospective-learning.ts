import "server-only";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { buildRecommendationLearningBaselineReadiness } from "@/lib/recommendation-learning-baseline-readiness";
import { buildRelativePlanProbabilityMeasurement } from "@/lib/server/relative-plan-probability-measurement";
import { buildRelativePlanProspectiveEnrollment } from "@/lib/server/relative-plan-prospective-enrollment";
import { verifiedRelativePlanTrainedProbabilityReceipt, relativePlanTrainedPopulationMatches } from "@/lib/server/relative-plan-trained-probability-model";

/** Membership is fixed from the frozen original input rule BEFORE looking at
 * outcomes. Missing/ambiguous labels can never remove an enrolled decision or
 * replace it with a later favorable decision. This measures the new basis;
 * legacy baseline eligibility, the full charter and promotion remain untouched. */
export function buildRelativePlanProspectiveLearning(input: {
  owner: string; freeze: unknown; source: RecommendationLearningBaselineSource; now: Date; trainedModelReceipt?: unknown;
}) {
  const original = buildRelativePlanProspectiveEnrollment(input);
  if (!original) return null;
  const { freeze, partitions: enrolledPartitions, diagnostics } = original;
  const plan = freeze.plan;
  const receipt = input.trainedModelReceipt == null ? null
    : verifiedRelativePlanTrainedProbabilityReceipt(input.trainedModelReceipt, freeze, input.owner);
  if (input.trainedModelReceipt != null && (!receipt || Date.parse(receipt.committed_read_at) > input.now.getTime())) return null;
  if (receipt) {
    // Upserted training labels cannot refit the model. Changed original inputs,
    // membership or plans cannot silently qualify the former training capsule.
    if (!relativePlanTrainedPopulationMatches(receipt, enrolledPartitions[0].decisions.map(row => row.comparison))) return null;
  }
  // Population enrollment is already complete before either fitting or forward
  // labels are inspected. Both forward partitions reuse the same training-only
  // cutoff; a walk-forward outcome cannot refit the held-out model.
  const training = enrolledPartitions[0].decisions.map(row => row.comparison);
  const partitions = enrolledPartitions.map(partition => ({ ...partition,
    probability_measurement: partition.partition === "training" ? null : buildRelativePlanProbabilityMeasurement({
      trainingWindow: plan.windows.training, fittedAt: plan.windows.held_out.start_at,
      forwardStartsAt: plan.windows.held_out.start_at, now: input.now, training,
      forward: partition.decisions.map(row => row.comparison), outcomes: input.source.outcomes,
      frozen: receipt ? { receipt, freeze, owner: input.owner } : undefined,
    }),
  }));
  const gaps = new Set(["full_charter_forward_scorecard_required",
    "exact_runtime_cost_reliability_and_feasibility_required"]);
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
    trained_probability_model: receipt,
    terminal_quality_decision: null, quality_improvement_claimed: false,
    blockers: [...gaps].sort(), authority: plan.authority };
}
