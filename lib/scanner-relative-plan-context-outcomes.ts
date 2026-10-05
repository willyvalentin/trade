import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { buildRelativePlanContextShadow, type RelativePlanContextShadow } from "@/lib/scanner-relative-plan-context-shadow";
import { recommendationResearchLearningSourceProvenance } from "@/lib/completed-input-learning-provenance";
import { projectRecommendationOutcomeBundle } from "@/lib/canonical-evaluation-projection-adapters";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { canonicalOutcomeProviderCoverageQuality, hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor } from "@/lib/recommendation-outcome-canonical-coverage";
import { computeCanonicalQualityMetrics, type CanonicalRankingOpportunitySet } from "@/lib/canonical-quality-metrics";
import { getNyMarketTime } from "@/lib/market-session";
import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";

export const RELATIVE_PLAN_CONTEXT_OUTCOME_LINK_VERSION = "relative_plan_context_canonical_outcomes_v1" as const;
type ShadowRow = RelativePlanContextShadow["candidates"][number];
export type RelativePlanContextOutcomeRow = ShadowRow & {
  snapshot_fingerprint: string | null;
  outcome_id: string | null;
  outcome_status: "resolved" | "missing" | "conflicting";
  outcome_reason: string | null;
  terminal_outcome: "target_before_stop" | "stop_before_target" | "neither" | "no_entry" | null;
  positive_outcome: boolean | null;
  r_result: number | null;
};

// Same JSONB-order-independent comparison as the original lineage reader.
// Array order is evidence and must not be sorted or normalized away.
function evidenceJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(evidenceJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${evidenceJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** A same-population diagnostic, not a retrospectively frozen experiment.
 * The existing prospective-contract gate and full charter remain mandatory. */
export function buildRelativePlanContextOutcomeComparison(input: {
  scanRun: LearningBaselineScanRun;
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}) {
  const record = candidateDecisionRecordFromScanRun(input.scanRun);
  const shadow = buildRelativePlanContextShadow(record);
  const outcomeIdCounts = new Map<string, number>();
  for (const outcome of input.outcomes) outcomeIdCounts.set(outcome.id, (outcomeIdCounts.get(outcome.id) ?? 0) + 1);
  const exactRuns = input.scanRuns.filter(run => run.run_fingerprint === input.scanRun.run_fingerprint);
  const bound = Boolean(record && exactRuns.length === 1 &&
    input.scanRun.id === exactRuns[0].id &&
    input.scanRun.trading_date === exactRuns[0].trading_date &&
    input.scanRun.trading_date === getNyMarketTime(record.decision_timestamp).ny_date &&
    evidenceJson(record) === evidenceJson(candidateDecisionRecordFromScanRun(exactRuns[0])) &&
    record.scan_run_fingerprint === input.scanRun.run_fingerprint &&
    decisionLineageReceiptFromScanRun(input.scanRun, record));
  const candidates: RelativePlanContextOutcomeRow[] = shadow.candidates.map(row => {
    const result: RelativePlanContextOutcomeRow = { ...row, snapshot_fingerprint: null, outcome_id: null,
      outcome_status: "missing", outcome_reason: null, terminal_outcome: null, positive_outcome: null, r_result: null };
    const missing = (reason: string, conflicting = false) => ({ ...result,
      outcome_status: conflicting ? "conflicting" as const : "missing" as const, outcome_reason: reason });
    if (!bound || shadow.status === "conflicting") return missing("original_decision_or_lineage_conflicting", true);
    const matches = input.snapshots.filter(snapshot => snapshot.scan_run_id === record!.scan_run_fingerprint &&
      (snapshot.payload_json.candidate_id === row.candidate_id ||
        snapshot.payload_json.candidate_decision_id === row.candidate_id || snapshot.ticker === row.ticker));
    if (matches.length !== 1) return missing(matches.length ? "original_source_ambiguous" : "original_source_missing", matches.length > 1);
    const snapshot = matches[0];
    result.snapshot_fingerprint = snapshot.snapshot_fingerprint;
    if (snapshot.ticker !== row.ticker || snapshot.payload_json.candidate_id !== row.candidate_id ||
      snapshot.payload_json.candidate_decision_id !== row.candidate_id) return missing("original_source_identity_conflicting", true);
    const provenance = recommendationResearchLearningSourceProvenance(snapshot, input.scanRuns);
    if (provenance.contract_version !== "completed_input_learning_provenance_v1" || provenance.status !== "admissible") {
      return missing("original_normalized_source_not_admissible", true);
    }
    const linked = input.outcomes.filter(outcome => outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint);
    if (linked.some(outcome => (outcome.snapshot_id !== null && outcome.snapshot_id !== snapshot.id) ||
      (outcome.recommendation_id !== null && outcome.recommendation_id !== snapshot.recommendation_id) ||
      outcome.ticker !== snapshot.ticker || outcome.side !== snapshot.side || outcome.recommended_at !== snapshot.recommended_at ||
      outcome.entry !== snapshot.entry || outcome.stop !== snapshot.stop || outcome.target !== snapshot.target ||
      !Number.isFinite(Date.parse(outcome.evaluated_at)) || Date.parse(outcome.evaluated_at) < Date.parse(record!.decision_timestamp)) ||
      linked.some(outcome => outcomeIdCounts.get(outcome.id) !== 1)) return missing("canonical_outcome_lineage_conflicting", true);
    const projected = projectRecommendationOutcomeBundle({ snapshot, outcomes: linked, metadata: {
      producer_decision_id: snapshot.recommendation_id ?? row.candidate_id, candidate_id: row.candidate_id,
      // New published capture admits only an identical fully closed horizon.
      // Canonical publication evidence keeps its own timestamp and identity;
      // never relabel a visible publication as hidden research.
      decision_timestamp: snapshot.recommendation_id ? snapshot.recommended_at : record!.decision_timestamp,
      sample_type: snapshot.recommendation_id ? "visible" : "research_only", numeric_confidence: null, confidence_label: null,
      scan_run_fingerprint: record!.scan_run_fingerprint, snapshot_id: snapshot.id,
      snapshot_fingerprint: snapshot.snapshot_fingerprint, recommendation_id: snapshot.recommendation_id,
    } });
    if (projected.status === "conflicting") return missing("canonical_projection_conflicting", true);
    const primary = projected.projection.primary_outcome;
    const outcome = primary?.status === "selected"
      ? linked.find(value => value.id === primary.primary_outcome?.outcome.id) : undefined;
    if (!outcome || outcome.horizon !== "60m") return missing("canonical_60m_outcome_missing");
    // Retain the selected receipt's identity even when its terminal label or R
    // remains unavailable; a persisted outcome is not necessarily usable quality evidence.
    result.outcome_id = outcome.id;
    const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
    const coverage = outcome.payload_json.canonical_provider_coverage;
    if (!anchor || outcome.provider !== "twelve_data" || outcome.source !== "intraday_candles" ||
      !hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor(coverage, anchor) ||
      canonicalOutcomeProviderCoverageQuality(coverage) !== 3 ||
      (coverage as Record<string, unknown>).horizon !== "60m" ||
      Date.parse(outcome.evaluated_at) < Date.parse(anchor.evaluation_anchor_start_at) + 3600000) {
      return missing("canonical_60m_provider_coverage_incomplete");
    }
    // Match the established canonical ranking adapter's realized-R semantics:
    // target pays the original first-target R, stop -1, no entry zero exposure.
    // Ambiguous same-candle and unresolved terminal states never become losses.
    let terminal: RelativePlanContextOutcomeRow["terminal_outcome"] = null;
    if (outcome.entry_triggered === false && outcome.status === "entry_not_triggered" &&
      outcome.first_terminal_event === "neither" && outcome.target_hit === false && outcome.stop_hit === false) terminal = "no_entry";
    else if (outcome.entry_triggered === true) {
      if ((outcome.status === "target_before_stop" || outcome.status === "target_hit") &&
        outcome.first_terminal_event === "target_hit" && outcome.target_hit === true && outcome.stop_hit === false) terminal = "target_before_stop";
      else if ((outcome.status === "stop_before_target" || outcome.status === "stop_hit") &&
        outcome.first_terminal_event === "stop_hit" && outcome.stop_hit === true && outcome.target_hit === false) terminal = "stop_before_target";
      else if (outcome.status === "neither_hit" && outcome.first_terminal_event === "neither" &&
        outcome.target_hit === false && outcome.stop_hit === false) terminal = "neither";
    }
    if (!terminal) return missing("canonical_terminal_unresolved");
    const risk = snapshot.entry! - snapshot.stop!;
    const r = terminal === "no_entry" ? 0 : terminal === "target_before_stop"
      ? (snapshot.target! - snapshot.entry!) / risk : terminal === "stop_before_target" ? -1 : outcome.current_r ?? outcome.eod_r;
    if (r === null || !Number.isFinite(r) || !Number.isFinite(risk) || risk <= 0) return missing("canonical_realized_r_unavailable");
    return { ...result, outcome_id: outcome.id, outcome_status: "resolved", outcome_reason: null,
      terminal_outcome: terminal, positive_outcome: terminal === "target_before_stop" || r > 0, r_result: r };
  });
  const populationComplete = bound && Boolean(input.scanRun.trading_date) && shadow.status === "comparable" && record!.coverage.full_membership_captured &&
    candidates.length > 0 && candidates.every(row => row.baseline_rank !== null && row.shadow_rank !== null && row.outcome_status === "resolved");
  const arm = (name: "baseline" | "shadow") => {
    const ordered = [...candidates].filter(row => row[`${name}_rank`] !== null)
      .sort((a, b) => a[`${name}_rank`]! - b[`${name}_rank`]!).slice(0, 3);
    const set: CanonicalRankingOpportunitySet = {
      opportunity_set_id: input.scanRun.run_fingerprint, cohort: "research_only_recommendation_quality",
      decision_day: input.scanRun.trading_date ?? "", ranking_version: name === "baseline" ? shadow.policy.baseline : shadow.comparison_version,
      complete: populationComplete, candidates: candidates.map(row => ({ canonical_identity: row.candidate_id, ticker: row.ticker,
        rank: row[`${name}_rank`], selection_status: ordered.some(top => top.candidate_id === row.candidate_id) ? "selected" : "not_selected",
        outcome_evaluable: row.outcome_status === "resolved", positive_outcome: row.positive_outcome })),
    };
    const precision = computeCanonicalQualityMetrics({ cohort: set.cohort, candidates: [], ranking_opportunity_sets: [set],
      bootstrap_seed: input.scanRun.run_fingerprint }).ranking.precision_at_k["3"];
    const resolved = ordered.filter(row => row.outcome_status === "resolved");
    return { candidate_ids: ordered.map(row => row.candidate_id), expected_count: ordered.length,
      resolved_count: resolved.length, missing_count: ordered.length - resolved.length,
      no_entry_count: resolved.filter(row => row.terminal_outcome === "no_entry").length,
      precision_at_3: precision, expectancy_r: {
        value: populationComplete && resolved.length === ordered.length && resolved.length > 0
          ? resolved.reduce((sum, row) => sum + row.r_result!, 0) / resolved.length : null,
        numerator: resolved.reduce((sum, row) => sum + row.r_result!, 0), denominator: resolved.length,
        expected_denominator: ordered.length, semantics: "original_first_target_terminal_r_with_no_entry_zero_exposure_v1",
      } };
  };
  const baseline = arm("baseline"), challenger = arm("shadow");
  const conflicting = !bound || shadow.status === "conflicting" || candidates.some(row => row.outcome_status === "conflicting");
  return { contract_version: RELATIVE_PLAN_CONTEXT_OUTCOME_LINK_VERSION,
    comparison_version: shadow.comparison_version, scan_run_fingerprint: input.scanRun.run_fingerprint,
    decision_timestamp: record?.decision_timestamp ?? null, primary_horizon: "60m" as const,
    status: conflicting ? "conflicting" as const : populationComplete ? "linked_complete" as const : "evidence_incomplete" as const,
    original_population_count: shadow.original_population_count, context_assessed_count: shadow.assessed_count,
    selected_60m_receipt_count: candidates.filter(row => row.outcome_id !== null).length,
    canonical_outcome_count: candidates.filter(row => row.outcome_status === "resolved").length,
    missing_outcome_count: candidates.filter(row => row.outcome_status !== "resolved").length,
    population_complete: populationComplete, candidates, baseline, challenger,
    precision_delta: populationComplete && baseline.precision_at_3.value !== null && challenger.precision_at_3.value !== null
      ? challenger.precision_at_3.value - baseline.precision_at_3.value : null,
    reason_codes: [...new Set([...shadow.reason_codes, ...candidates.flatMap(row => row.outcome_reason ? [row.outcome_reason] : []),
      ...(populationComplete ? [] : ["complete_original_population_required"]),
      "prospective_baseline_contract_and_full_charter_required"])].sort(),
    reproduction_scope: "retained_normalized_inputs_and_original_geometry_only" as const,
    quality_evidence_status: "not_forward_evaluated" as const, quality_improvement_claimed: false as const,
    live_ranking_effect: false as const, publication_effect: false as const, provider_effect: false as const,
    promotion_effect: false as const, broker_effect: false as const };
}

export type RelativePlanContextOutcomeComparison = ReturnType<typeof buildRelativePlanContextOutcomeComparison>;
