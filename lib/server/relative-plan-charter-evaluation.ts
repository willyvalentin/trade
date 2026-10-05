import "server-only";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { recommendationDecisionFeatureVectorFromUnknown,
  isCompletedInputDecisionFeatureVectorVersion } from "@/lib/recommendation-decision-feature-vector";
import { buildRelativePlanProspectiveEnrollment } from "@/lib/server/relative-plan-prospective-enrollment";
import { buildRelativePlanProbabilityMeasurement } from "@/lib/server/relative-plan-probability-measurement";
import { verifiedRelativePlanTrainedProbabilityReceipt, relativePlanTrainedPopulationMatches } from "@/lib/server/relative-plan-trained-probability-model";
import { buildRelativePlanCharterObservations } from "@/lib/server/relative-plan-charter-observations";
import { summarizeRelativePlanCharterQuality } from "@/lib/server/relative-plan-charter-quality";
import { summarizeRelativePlanCharterOperational } from "@/lib/server/relative-plan-charter-operational";
import { summarizeRelativePlanCharterThresholds } from "@/lib/server/relative-plan-charter-thresholds";
import type { RelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";
import { relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";

export const RELATIVE_PLAN_CHARTER_EVALUATION_VERSION = "relative_plan_charter_evaluation_v1" as const;
export type RelativePlanCharterDisposition = "continue" | "narrow" | "reject" | "evidence_incomplete";

/** Reproduce the original enrollment, model and every declared metric from the
 * complete owner-bound source. Absolute failures are distinct from unknowns.
 * This read-only computation is NOT a durable terminal decision: persistence
 * must retain its complete as-of source before terminal triage/promotion work.
 * No forward label can refit the independently verified training capsule. */
export function buildRelativePlanCharterEvaluationBundle(input: {
  owner: string; freeze: unknown; source: RecommendationLearningBaselineSource; now: Date;
  trainedModelReceipt?: unknown; runtime?: RelativePlanCharterRuntimeSource;
}) {
  const enrolled = buildRelativePlanProspectiveEnrollment(input);
  if (!enrolled) return null;
  const { freeze, partitions: original } = enrolled, plan = freeze.plan;
  const sealed = input.trainedModelReceipt == null ? null
    : verifiedRelativePlanTrainedProbabilityReceipt(input.trainedModelReceipt, freeze, input.owner);
  const training = original[0].decisions.map(row => row.comparison);
  if (input.trainedModelReceipt != null && (!sealed || Date.parse(sealed.committed_read_at) > input.now.getTime() ||
    !relativePlanTrainedPopulationMatches(sealed, training))) return null;
  const originalSnapshots = new Set(original.flatMap(partition => partition.decisions.flatMap(decision =>
    decision.comparison.candidates.map(row => row.snapshot_fingerprint))));
  const bases = new Set([...input.source.snapshots.filter(row => originalSnapshots.has(row.snapshot_fingerprint)),
    ...(sealed?.trained_model.retained_training_source.snapshots ?? [])].map(row =>
    recommendationDecisionFeatureVectorFromUnknown(row.payload_json.decision_feature_vector)?.contract_version)
    .filter(isCompletedInputDecisionFeatureVectorVersion));
  // Individual forward partitions can each be homogeneous while training and
  // forward still have different bases. Disclose the gap on the full unchanged
  // population instead of silently qualifying a mixed-version comparison.
  const mixedOriginalBases = bases.size > 1;
  const runtime: RelativePlanCharterRuntimeSource = input.runtime ?? {
    status: "unavailable", partitions: null, blocker: "relative_plan_runtime_source_not_read" };
  const partitions = original.slice(1).map(partition => {
    const name = partition.partition as "held_out" | "walk_forward";
    const observations = partition.decisions.map(decision => {
      const run = input.source.scanRuns.find(row => row.run_fingerprint === decision.fingerprint)!;
      return buildRelativePlanCharterObservations({ scanRun: run, source: input.source, now: input.now })!;
    });
    const probability = buildRelativePlanProbabilityMeasurement({ trainingWindow: plan.windows.training,
      fittedAt: plan.windows.held_out.start_at, forwardStartsAt: plan.windows.held_out.start_at,
      now: input.now, training, forward: partition.decisions.map(row => row.comparison), outcomes: input.source.outcomes,
      frozen: sealed ? { receipt: sealed, freeze, owner: input.owner } : undefined });
    const quality = summarizeRelativePlanCharterQuality({ observations, probability,
      bootstrapSeed: `${RELATIVE_PLAN_CHARTER_EVALUATION_VERSION}:${plan.plan_fingerprint}:${name}` });
    const operational = summarizeRelativePlanCharterOperational({ owner: input.owner, freeze, partition: name,
      runtime, source: input.source, enrolledFingerprints: partition.decisions.map(row => row.fingerprint), now: input.now });
    const thresholds = summarizeRelativePlanCharterThresholds({ owner: input.owner, freeze, quality, operational })!;
    const gaps = new Set(thresholds.missing_dimensions);
    if (mixedOriginalBases) gaps.add("separate_original_feature_vector_bases_required");
    if (!sealed) gaps.add("durably_frozen_training_probability_model_required");
    if (input.now.getTime() < Date.parse(partition.window.end_at) + 3600000) gaps.add("original_forward_window_and_60m_maturity_required");
    if (partition.enrolled_decision_count !== partition.required_decisions) gaps.add("original_first_thirty_decisions_required");
    if (!quality.sample_diversity_sufficient) gaps.add("original_trading_day_and_ticker_diversity_required");
    if (!quality.original_outcome_population_complete) gaps.add("complete_original_canonical_60m_outcomes_required");
    if (!quality.paired_precision_interval) gaps.add("same_population_trading_day_paired_uncertainty_required");
    for (const gap of probability.blockers) gaps.add(gap);
    if (runtime.status === "unavailable") gaps.add(runtime.blocker);
    return { partition: name, original_window: partition.window, required_decisions: partition.required_decisions,
      enrolled_decision_count: partition.enrolled_decision_count, overflow_decision_count: partition.overflow_decision_count,
      overflow_fingerprints: partition.overflow_fingerprints,
      original_membership_fingerprint: partition.original_membership_fingerprint,
      original_population_count: partition.original_population_count, observations, quality, operational, thresholds,
      probability, evidence_complete: gaps.size === 0, missing_dimensions: [...gaps].sort(),
      measured_limit_failures: thresholds.measured_limit_failures };
  });
  const gaps = partitions.flatMap(row => row.missing_dimensions.map(gap => `${row.partition}_${gap}`)).sort();
  const failures = partitions.flatMap(row => row.measured_limit_failures.map(gap => `${row.partition}_${gap}`)).sort();
  const complete = partitions.every(row => row.evidence_complete);
  let disposition: RelativePlanCharterDisposition = "evidence_incomplete";
  if (complete) {
    if (failures.length > 0 || partitions.some(row => row.quality.paired_precision_interval!.upper <= plan.comparison.reject_maximum_precision_lift)) disposition = "reject";
    else if (partitions.every(row => row.quality.paired_precision_interval!.lower >= plan.comparison.minimum_precision_lift)) disposition = "continue";
    else disposition = "narrow";
  }
  const measurement = { contract_version: RELATIVE_PLAN_CHARTER_EVALUATION_VERSION,
    owner_user_id: input.owner, prospective_freeze_id: freeze.freeze_id, plan_fingerprint: plan.plan_fingerprint,
    charter_fingerprint: plan.charter_fingerprint, model_binding_fingerprint: sealed?.trained_model.model_binding_fingerprint ?? null,
    read_as_of: input.now.toISOString(), evidence_complete: complete, computed_disposition: disposition,
    missing_dimensions: gaps, measured_limit_failures: failures, partitions,
    quality_improvement_claimed: false, terminal_quality_decision: null, context_triage: null,
    evidence_scope: "read_only_reproduction_not_durable_terminal_result", authority: plan.authority };
  return { charter: { ...measurement, measurement_fingerprint: relativePlanSemanticFingerprint(measurement) },
    original: enrolled, sealed,
    probability_partitions: original.map((partition, index) => ({ ...partition,
      probability_measurement: index === 0 ? null : partitions[index - 1].probability })) };
}

export function buildRelativePlanCharterEvaluation(input: Parameters<typeof buildRelativePlanCharterEvaluationBundle>[0]) {
  return buildRelativePlanCharterEvaluationBundle(input)?.charter ?? null;
}
