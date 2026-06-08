import type {
  CounterfactualEntryVariantLabel,
  RecommendationOutcomeLearningInsightsSummary,
} from "@/lib/recommendation-outcome-learning-insights";

export type EntryTuningProposalConfidence = "low" | "medium" | "high";

export type EntryTuningProposalRecommendedAction =
  | "observe_more"
  | "paper_test_variant"
  | "ready_for_limited_trial"
  | "reject_variant";

export type EntryTuningProposal = {
  proposal_id: string;
  proposal_version: "1.0";
  proposal_kind: "entry_tuning_proposal";
  generated_at: string;
  batch_fingerprint: string | null;
  proposed_change_type: "entry_logic";
  proposed_entry_variant: CounterfactualEntryVariantLabel | null;
  confidence: EntryTuningProposalConfidence;
  evidence_summary: string;
  expected_trigger_rate_change: number | null;
  expected_avg_best_r_change: number | null;
  expected_avg_worst_r_change: number | null;
  risk_notes: string[];
  recommended_action: EntryTuningProposalRecommendedAction;
  sample_size: {
    evaluated_outcomes: number;
    evaluated_recommendations: number;
    simulated_recommendations: number;
    evaluated_batches: number;
  };
  diagnostics: {
    proposal_id: string;
    proposed_entry_variant: CounterfactualEntryVariantLabel | null;
    proposal_confidence: EntryTuningProposalConfidence;
    proposal_recommended_action: EntryTuningProposalRecommendedAction;
  };
};

export type EntryTuningProposalInput = {
  learning_insights: RecommendationOutcomeLearningInsightsSummary;
  evaluated_batch_count?: number | null;
  now?: Date | string | null;
};

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function delta(next: number | null, previous: number | null) {
  return next === null || previous === null ? null : next - previous;
}

function confidenceForSample(input: {
  evaluatedOutcomes: number;
  evaluatedBatches: number;
}): EntryTuningProposalConfidence {
  if (input.evaluatedOutcomes > 50 && input.evaluatedBatches >= 3) {
    return "high";
  }

  if (input.evaluatedOutcomes >= 20) {
    return "medium";
  }

  return "low";
}

function recommendedAction(input: {
  proposedVariant: CounterfactualEntryVariantLabel | null;
  confidence: EntryTuningProposalConfidence;
  triggerRateChange: number | null;
  avgWorstRChange: number | null;
  riskWarningCount: number;
  simulatedRecommendations: number;
}): EntryTuningProposalRecommendedAction {
  if (!input.proposedVariant || input.simulatedRecommendations === 0) {
    return "observe_more";
  }

  if ((input.triggerRateChange ?? 0) <= 0) {
    return "reject_variant";
  }

  if (input.riskWarningCount > 0 || (input.avgWorstRChange ?? 0) < -0.25) {
    return "observe_more";
  }

  if (input.confidence === "high") {
    return "ready_for_limited_trial";
  }

  if (input.confidence === "medium") {
    return "paper_test_variant";
  }

  return (input.triggerRateChange ?? 0) >= 25
    ? "paper_test_variant"
    : "observe_more";
}

export function buildEntryTuningProposal({
  learning_insights: learningInsights,
  evaluated_batch_count,
  now,
}: EntryTuningProposalInput): EntryTuningProposal {
  const generatedAt = (toDate(now ?? null) ?? new Date()).toISOString();
  const simulation =
    learningInsights.entry_plan_quality.counterfactual_entry_simulation;
  const evaluatedBatches =
    typeof evaluated_batch_count === "number" &&
    Number.isFinite(evaluated_batch_count)
      ? Math.max(0, Math.round(evaluated_batch_count))
      : learningInsights.batch_fingerprint
        ? 1
        : 0;
  const sampleConfidence = confidenceForSample({
    evaluatedOutcomes: learningInsights.total_evaluated_outcomes,
    evaluatedBatches,
  });
  const shadowTrial = learningInsights.shadow_entry_trial;
  const confidence =
    shadowTrial.shadow_sample_size < 20 ? "low" : sampleConfidence;
  const triggerRateChange = delta(
    simulation.best_variant_trigger_rate,
    simulation.original_entry_trigger_rate,
  );
  const avgBestRChange = delta(
    simulation.best_variant_avg_best_r,
    simulation.original_avg_best_r,
  );
  const avgWorstRChange = delta(
    simulation.best_variant_avg_worst_r,
    simulation.original_avg_worst_r,
  );
  const action = recommendedAction({
    proposedVariant: simulation.best_entry_variant,
    confidence,
    triggerRateChange,
    avgWorstRChange,
    riskWarningCount:
      simulation.variant_risk_warning_count +
      shadowTrial.shadow_risk_warning_count,
    simulatedRecommendations: simulation.simulated_recommendation_count,
  });
  const proposalId = `entry_tuning:${learningInsights.batch_fingerprint ?? "none"}:${simulation.best_entry_variant ?? "none"}`;
  const riskNotes: string[] = [];

  if (simulation.variant_risk_warning_count > 0) {
    riskNotes.push(
      `${simulation.variant_risk_warning_count} simulated variant result${simulation.variant_risk_warning_count === 1 ? "" : "s"} carried a risk-width warning.`,
    );
  }

  if (shadowTrial.shadow_risk_warning_count > 0) {
    riskNotes.push(
      "Shadow entry improves trigger rate but risk model needs adjustment.",
    );
  }

  if ((avgWorstRChange ?? 0) < 0) {
    riskNotes.push(
      "Best variant worsened average adverse R versus the original entry.",
    );
  }

  if (
    learningInsights.total_evaluated_outcomes < 20 ||
    shadowTrial.shadow_sample_size < 20
  ) {
    riskNotes.push(
      "Sample size is below 20 evaluated shadow outcomes; confidence stays low and the proposal remains observational.",
    );
  }

  if (riskNotes.length === 0) {
    riskNotes.push(
      "No counterfactual risk warning was observed, but this remains a learning-only proposal.",
    );
  }

  const evidenceSummary =
    simulation.best_entry_variant === null
      ? "No counterfactual entry variant is ready for proposal because retained candle simulation data is unavailable."
      : `Counterfactual simulation favored ${simulation.best_entry_variant.replaceAll("_", " ")}: trigger rate changed from ${Math.round(simulation.original_entry_trigger_rate ?? 0)}% to ${Math.round(simulation.best_variant_trigger_rate ?? 0)}% on ${simulation.simulated_recommendation_count} simulated recommendation${simulation.simulated_recommendation_count === 1 ? "" : "s"}. Confidence remains ${confidence} due to sample size.`;

  return {
    proposal_id: proposalId,
    proposal_version: "1.0",
    proposal_kind: "entry_tuning_proposal",
    generated_at: generatedAt,
    batch_fingerprint: learningInsights.batch_fingerprint,
    proposed_change_type: "entry_logic",
    proposed_entry_variant: simulation.best_entry_variant,
    confidence,
    evidence_summary: evidenceSummary,
    expected_trigger_rate_change: triggerRateChange,
    expected_avg_best_r_change: avgBestRChange,
    expected_avg_worst_r_change: avgWorstRChange,
    risk_notes: riskNotes,
    recommended_action: action,
    sample_size: {
      evaluated_outcomes: learningInsights.total_evaluated_outcomes,
      evaluated_recommendations:
        learningInsights.entry_plan_quality.evaluated_recommendation_count,
      simulated_recommendations: simulation.simulated_recommendation_count,
      evaluated_batches: evaluatedBatches,
    },
    diagnostics: {
      proposal_id: proposalId,
      proposed_entry_variant: simulation.best_entry_variant,
      proposal_confidence: confidence,
      proposal_recommended_action: action,
    },
  };
}

export function entryTuningProposalJson(proposal: EntryTuningProposal) {
  return JSON.stringify(proposal, null, 2);
}
