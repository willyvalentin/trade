import "server-only";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { buildRelativePlanContextShadow } from "@/lib/scanner-relative-plan-context-shadow";
import { buildRelativePlanContextOutcomeComparison } from "@/lib/scanner-relative-plan-context-outcomes";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { buildRecommendationLearningBaselineReadiness } from "@/lib/recommendation-learning-baseline-readiness";
import { verifiedRelativePlanProspectiveFreeze, relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";

/** Membership is fixed from the frozen original input rule BEFORE looking at
 * outcomes. Missing/ambiguous labels can never remove an enrolled decision or
 * replace it with a later favorable decision. This measures the new basis;
 * legacy baseline eligibility, the full charter and promotion remain untouched. */
export function buildRelativePlanProspectiveLearning(input: {
  owner: string; freeze: unknown; source: RecommendationLearningBaselineSource; now: Date;
}) {
  const freeze = verifiedRelativePlanProspectiveFreeze(input.freeze, input.owner);
  if (!freeze || !Number.isFinite(input.now.getTime())) return null;
  const plan = freeze.plan;
  const counts = new Map<string, number>();
  for (const run of input.source.scanRuns) counts.set(run.run_fingerprint, (counts.get(run.run_fingerprint) ?? 0) + 1);
  const enrolled: Array<{ partition: "training" | "held_out" | "walk_forward"; fingerprint: string;
    decision_at: string; original_population_count: number;
    comparison: ReturnType<typeof buildRelativePlanContextOutcomeComparison> }> = [];
  const diagnostics: Array<{ fingerprint: string; original_population_count: number; reason: string }> = [];
  for (const run of input.source.scanRuns) {
    const record = candidateDecisionRecordFromScanRun(run);
    const shadow = buildRelativePlanContextShadow(record);
    const at = record ? Date.parse(record.decision_timestamp) : NaN;
    const versions = record?.learning_attribution.canonical_evaluation_versions;
    const partition = Number.isFinite(at) ? (["training", "held_out", "walk_forward"] as const).find(name =>
      at >= Date.parse(plan.windows[name].start_at) && at < Date.parse(plan.windows[name].end_at)) : undefined;
    let reason: string | null = null;
    if (!record || counts.get(run.run_fingerprint) !== 1 || !decisionLineageReceiptFromScanRun(run, record)) reason = "original_decision_or_lineage_missing_ambiguous";
    else if (at <= Date.parse(freeze.frozen_at)) reason = "historical_decision_not_prospective";
    else if (at > input.now.getTime()) reason = "future_decision_not_observed";
    else if (!partition) reason = "outside_frozen_partition";
    else if (versions?.git_commit !== plan.source_revision.commit_ref || versions.build_identity !== plan.source_revision.build_identity) reason = "frozen_original_revision_mismatch";
    else if (!record.coverage.full_membership_captured || shadow.status !== "comparable" ||
      shadow.candidates.length < plan.enrollment.primary_k || shadow.candidates.some(row => row.baseline_rank === null || row.shadow_rank === null)) reason = "original_complete_assessed_population_unavailable";
    if (reason) { diagnostics.push({ fingerprint: run.run_fingerprint, original_population_count: shadow.original_population_count, reason }); continue; }
    const comparison = buildRelativePlanContextOutcomeComparison({ scanRun: run, scanRuns: input.source.scanRuns,
      snapshots: input.source.snapshots, outcomes: input.source.outcomes.filter(row => Date.parse(row.evaluated_at) <= input.now.getTime()) });
    enrolled.push({ partition: partition!, fingerprint: run.run_fingerprint, decision_at: record!.decision_timestamp,
      original_population_count: shadow.original_population_count, comparison });
  }
  enrolled.sort((a, b) => a.decision_at.localeCompare(b.decision_at) || a.fingerprint.localeCompare(b.fingerprint));
  diagnostics.sort((a, b) => a.fingerprint.localeCompare(b.fingerprint) || a.reason.localeCompare(b.reason));
  const partitions = (["training", "held_out", "walk_forward"] as const).map(name => {
    const all = enrolled.filter(row => row.partition === name);
    const limit = name === "training" ? all.length : name === "held_out" ? plan.enrollment.held_out_decisions : plan.enrollment.walk_forward_decisions;
    const rows = all.slice(0, limit), overflow = all.slice(limit);
    const populationCount = rows.reduce((sum, row) => sum + row.original_population_count, 0);
    const resolved = rows.reduce((sum, row) => sum + row.comparison.canonical_outcome_count, 0);
    const missing = populationCount - resolved;
    const allLinked = rows.length > 0 && rows.every(row => row.comparison.status === "linked_complete");
    const arm = (which: "baseline" | "challenger") => {
      const expected = rows.reduce((sum, row) => sum + row.comparison[which].expected_count, 0);
      const resolvedTop = rows.reduce((sum, row) => sum + row.comparison[which].resolved_count, 0);
      const wins = rows.reduce((sum, row) => sum + (row.comparison[which].precision_at_3.numerator ?? 0), 0);
      const sumR = rows.reduce((sum, row) => sum + row.comparison[which].expectancy_r.numerator, 0);
      return { expected_top_k_count: expected, resolved_top_k_count: resolvedTop,
        missing_top_k_count: expected - resolvedTop,
        precision_at_3: allLinked && expected > 0 ? wins / expected : null,
        expectancy_r: allLinked && expected > 0 ? sumR / expected : null };
    };
    const baseline = arm("baseline"), challenger = arm("challenger");
    return { partition: name, window: plan.windows[name], required_decisions: name === "training" ? null : limit,
      enrolled_decision_count: rows.length, overflow_decision_count: overflow.length,
      original_population_count: populationCount, canonical_outcome_count: resolved, missing_outcome_count: missing,
      outcome_coverage: populationCount > 0 ? resolved / populationCount : null,
      original_membership_fingerprint: relativePlanSemanticFingerprint(rows.map(row => ({
        fingerprint: row.fingerprint, decision_at: row.decision_at,
        candidates: row.comparison.candidates.map(candidate => candidate.candidate_id) }))),
      baseline, challenger, precision_delta: baseline.precision_at_3 !== null && challenger.precision_at_3 !== null
        ? challenger.precision_at_3 - baseline.precision_at_3 : null,
      decisions: rows, overflow_fingerprints: overflow.map(row => row.fingerprint),
    };
  });
  const gaps = new Set(["full_charter_forward_scorecard_required", "training_only_probability_calibration_required",
    "exact_runtime_cost_reliability_and_feasibility_required"]);
  for (const partition of partitions) {
    if (partition.required_decisions !== null && partition.enrolled_decision_count < partition.required_decisions) gaps.add(`${partition.partition}_decision_population_incomplete`);
    if (partition.missing_outcome_count > 0) gaps.add(`${partition.partition}_canonical_60m_outcomes_missing_or_conflicting`);
  }
  return { contract_version: "relative_plan_prospective_learning_v1" as const,
    status: "evidence_incomplete" as const, diagnostic_only: true as const, freeze, partitions, diagnostics,
    legacy_baseline_readiness: buildRecommendationLearningBaselineReadiness(input.source),
    terminal_quality_decision: null, quality_improvement_claimed: false,
    blockers: [...gaps].sort(), authority: plan.authority };
}
