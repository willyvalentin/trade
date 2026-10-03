import "server-only";
import { createHash } from "node:crypto";
import { canonicalQualityCalibrationBuckets, canonicalQualityPublishabilityPolicy } from "@/lib/canonical-quality-metrics";
import { buildScannerScoreProbabilityCalibrationModel, applyScannerScoreProbabilityCalibration,
  type ScannerScoreProbabilityCalibrationTrainingInput } from "@/lib/scanner-score-probability-calibration";
import { RELATIVE_PLAN_CONTEXT_SHADOW_VERSION } from "@/lib/scanner-relative-plan-context-shadow";
import type { RelativePlanContextOutcomeComparison } from "@/lib/scanner-relative-plan-context-outcomes";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { verifiedRelativePlanTrainedProbabilityReceipt, relativePlanTrainedPopulationMatches } from "@/lib/server/relative-plan-trained-probability-model";

type Window = { start_at: string; end_at: string };
type OutcomeTime = Pick<RecommendationOutcome, "id" | "snapshot_fingerprint" | "ticker" | "evaluated_at" | "created_at">;
type Comparison = RelativePlanContextOutcomeComparison;

function finiteScore(score: number | null): score is number {
  return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100;
}
function instant(value: string) { return Number.isFinite(Date.parse(value)); }
function hash(value: unknown) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }

/** Check the raw complete persistence read BEFORE the legacy decoder can
 * substitute evaluated_at or the current clock for an absent recorded time.
 * This grants no source admission: the normal owner/lineage parser still runs.
 */
function explicitOutcomeRecordingInstant(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !instant(value)) return false;
  const suffix = value.slice(-6);
  const offset = value.endsWith("Z") ? 0 : (suffix[0] === "+" ? 1 : -1) *
    (Number(suffix.slice(1, 3)) * 60 + Number(suffix.slice(4)));
  return new Date(Date.parse(value) + offset * 60000).toISOString().slice(0, 19) === value.slice(0, 19);
}
export function hasExplicitRelativePlanOutcomeRecordingTimes(rows: unknown): boolean {
  return Array.isArray(rows) && rows.length <= 100000 && rows.every(row => row && typeof row === "object" && !Array.isArray(row) &&
    explicitOutcomeRecordingInstant(row.evaluated_at) && explicitOutcomeRecordingInstant(row.created_at));
}

/** Admission for a NEW server-owned training job only. The current mutable
 * row's revision must be explicit, chronologically possible and already
 * observed. Do not apply this to retained historical models or change their
 * frozen fitting semantics; the immutable capsule remains their sole source.
 */
export function hasAdmissibleRelativePlanOutcomeRevisionTimes(rows: unknown, now: Date): boolean {
  const asOf = now.getTime();
  // Postgres records microseconds. Date.parse truncation must not turn a
  // revision just after the sampled millisecond into already observed data.
  const scale = BigInt(1000);
  const micros = (value: string) => BigInt(Date.parse(value)) * scale +
    BigInt((value.match(/\.(\d{1,6})(?:Z|[+-]\d{2}:\d{2})$/)?.[1] ?? "").padEnd(6, "0").slice(3));
  return Number.isFinite(asOf) && hasExplicitRelativePlanOutcomeRecordingTimes(rows) &&
    (rows as Record<string, unknown>[]).every(row => explicitOutcomeRecordingInstant(row.updated_at) &&
      micros(row.updated_at) >= micros(row.evaluated_at as string) &&
      micros(row.updated_at) >= micros(row.created_at as string) && micros(row.updated_at) <= BigInt(asOf) * scale);
}

/** Admission of mutable source for a NEW prospective read/result, never a
 * replayed immutable capsule. Rows whose evaluation or first recording is
 * after the as-of clock remain excluded by the existing enrollment rule.
 * For rows that could contribute now, validate the actual raw revision before
 * legacy decoding can substitute a recording clock for missing updated_at.
 * Reject the complete read rather than measuring a favorable subset.
 */
export function hasAdmissibleRelativePlanCurrentOutcomeRevisionTimes(rows: unknown, now: Date): boolean {
  const asOf = now.getTime();
  return Number.isFinite(asOf) && hasExplicitRelativePlanOutcomeRecordingTimes(rows) &&
    (rows as Record<string, unknown>[]).every(row =>
      Math.max(Date.parse(row.evaluated_at as string), Date.parse(row.created_at as string)) > asOf ||
      hasAdmissibleRelativePlanOutcomeRevisionTimes([row], now));
}
function ordered(rows: Comparison[]) {
  return [...rows].sort((a, b) => Date.parse(a.decision_timestamp ?? "") - Date.parse(b.decision_timestamp ?? "") ||
    a.scan_run_fingerprint.localeCompare(b.scan_run_fingerprint));
}
function binary(row: Comparison["candidates"][number]): 0 | 1 | null {
  if (row.outcome_status !== "resolved") return null;
  return row.terminal_outcome === "target_before_stop" ? 1 : row.terminal_outcome === "stop_before_target" ? 0 : null;
}
function error(rows: Array<{ probability: number; actual: 0 | 1 }>) {
  let ece = 0;
  for (const bucket of canonicalQualityCalibrationBuckets) {
    const members = rows.filter(row => row.probability >= bucket.lower &&
      (row.probability < bucket.upper || (bucket.include_upper && row.probability === bucket.upper)));
    if (!members.length) continue;
    ece += Math.abs(members.reduce((sum, row) => sum + row.probability - row.actual, 0) / members.length) * members.length / rows.length;
  }
  const round = (value: number) => Math.round(value * 1e12) / 1e12;
  return { brier_score: round(rows.reduce((sum, row) => sum + (row.probability - row.actual) ** 2, 0) / rows.length),
    expected_calibration_error: round(ece) };
}

/** Numerical measurement only. The caller must first verify the immutable
 * prospective freeze and enroll the original input population. This adapter
 * never selects a cohort, fits from forward labels, changes scores or decides
 * the full charter. Its comparisons must come from the canonical outcome link.
 */
export function buildRelativePlanProbabilityMeasurement(input: {
  trainingWindow: Window; fittedAt: string; forwardStartsAt: string; now: Date;
  training: Comparison[]; forward: Comparison[]; outcomes: OutcomeTime[];
  frozen?: { receipt: unknown; freeze: unknown; owner: string };
}) {
  const invalid = () => ({ contract_version: "relative_plan_probability_measurement_v1" as const,
    status: "conflicting" as const, model: null, training: null, forward: null,
    blockers: ["relative_plan_probability_input_binding_invalid"], full_charter_decision: null, live_ranking_effect: false as const,
    publication_effect: false as const, provider_effect: false as const, broker_effect: false as const,
    quality_improvement_claimed: false as const });
  const start = Date.parse(input.trainingWindow.start_at), end = Date.parse(input.trainingWindow.end_at), cutoff = Date.parse(input.fittedAt);
  const sealed = input.frozen ? verifiedRelativePlanTrainedProbabilityReceipt(input.frozen.receipt, input.frozen.freeze, input.frozen.owner) : null;
  if (input.frozen && (!sealed || sealed.trained_model.training_window.start_at !== input.trainingWindow.start_at ||
    sealed.trained_model.training_window.end_at !== input.trainingWindow.end_at || sealed.trained_model.forward_cutoff !== input.fittedAt ||
    Date.parse(sealed.committed_read_at) > input.now.getTime() || !relativePlanTrainedPopulationMatches(sealed, input.training))) return invalid();
  if (![input.trainingWindow.start_at, input.trainingWindow.end_at, input.fittedAt, input.forwardStartsAt].every(instant) ||
    !Number.isFinite(input.now.getTime()) || start >= end || end + 3600000 > cutoff ||
    cutoff !== Date.parse(input.forwardStartsAt) || input.training.length + input.forward.length > 10000 || input.outcomes.length > 100000) return invalid();
  const runs = new Set<string>(), identities = new Set<string>();
  for (const [phase, comparisons] of [["training", input.training], ["forward", input.forward]] as const) {
    for (const comparison of comparisons) {
      const at = Date.parse(comparison.decision_timestamp ?? "");
      if (!Number.isFinite(at) || at > input.now.getTime() ||
        (phase === "training" ? at < start || at >= end : at < cutoff) ||
        comparison.comparison_version !== RELATIVE_PLAN_CONTEXT_SHADOW_VERSION || comparison.primary_horizon !== "60m" ||
        comparison.status === "conflicting" || comparison.original_population_count !== comparison.candidates.length ||
        comparison.live_ranking_effect !== false || comparison.publication_effect !== false || comparison.provider_effect !== false ||
        comparison.broker_effect !== false || comparison.quality_improvement_claimed !== false ||
        !comparison.scan_run_fingerprint || runs.has(comparison.scan_run_fingerprint)) return invalid();
      runs.add(comparison.scan_run_fingerprint);
      for (const row of comparison.candidates) {
        if (!row.candidate_id || identities.has(row.candidate_id) || row.context_status !== "assessed" ||
          !finiteScore(row.baseline_score) || !finiteScore(row.shadow_score)) return invalid();
        identities.add(row.candidate_id);
      }
    }
  }
  const byId = new Map<string, OutcomeTime[]>();
  for (const receipt of input.outcomes) byId.set(receipt.id, [...(byId.get(receipt.id) ?? []), receipt]);
  const receiptFor = (comparison: Comparison, row: Comparison["candidates"][number]) => {
    if (row.outcome_status !== "resolved" || !row.outcome_id) return null;
    const matches = byId.get(row.outcome_id) ?? [];
    const receipt = matches.length === 1 ? matches[0] : null;
    return receipt && receipt.snapshot_fingerprint === row.snapshot_fingerprint && receipt.ticker === row.ticker &&
      instant(receipt.evaluated_at) && instant(receipt.created_at) &&
      Date.parse(receipt.evaluated_at) >= Date.parse(comparison.decision_timestamp!) + 3600000 &&
      Date.parse(receipt.created_at) >= Date.parse(receipt.evaluated_at) &&
      Math.max(Date.parse(receipt.created_at), Date.parse(receipt.evaluated_at)) <= input.now.getTime() ? receipt : null;
  };
  const trainingRows = ordered(input.training).flatMap(comparison => comparison.candidates.map(row => ({ comparison, row })));
  const fittingRows: ScannerScoreProbabilityCalibrationTrainingInput[] = [];
  let lateLabels = 0, missingLabels = 0, nonBinaryLabels = 0;
  for (const { comparison, row } of trainingRows) {
    const receipt = receiptFor(comparison, row), label = binary(row);
    if (!receipt) { missingLabels++; continue; }
    // A label evaluated OR first recorded at/after the forward boundary cannot
    // enter fitting, even when it later becomes available to the read model.
    if (Date.parse(receipt.evaluated_at) >= cutoff || Date.parse(receipt.created_at) >= cutoff) { lateLabels++; continue; }
    if (label === null) { nonBinaryLabels++; continue; }
    fittingRows.push({ candidate_id: row.candidate_id, ticker: row.ticker, decision_at: comparison.decision_timestamp!,
      outcome_evaluated_at: receipt.evaluated_at, baseline_score: row.baseline_score!, candidate_score: row.shadow_score!,
      terminal_outcome: label === 1 ? "target_before_stop" : "stop_before_target" });
  }
  const fittingBoundaryReached = input.now.getTime() >= cutoff;
  const model = sealed?.trained_model.model ?? (fittingBoundaryReached ? buildScannerScoreProbabilityCalibrationModel({
    fittedAt: input.fittedAt, trainingStartAt: input.trainingWindow.start_at, trainingEndAt: input.fittedAt,
    observations: fittingRows }) : null);
  const rows = ordered(input.forward).flatMap(comparison => comparison.candidates.map(row => {
    const receipt = receiptFor(comparison, row), label = receipt ? binary(row) : null;
    const baseline = applyScannerScoreProbabilityCalibration({ model, arm: "baseline", score: row.baseline_score!, decisionAt: comparison.decision_timestamp! });
    const challenger = applyScannerScoreProbabilityCalibration({ model, arm: "candidate", score: row.shadow_score!, decisionAt: comparison.decision_timestamp! });
    return { candidate_id: row.candidate_id, run_fingerprint: comparison.scan_run_fingerprint,
      decision_at: comparison.decision_timestamp!, baseline_probability: baseline?.probability ?? null,
      challenger_probability: challenger?.probability ?? null, terminal_binary: label,
      canonical_outcome_available: receipt !== null, terminal_outcome: receipt ? row.terminal_outcome : null };
  }));
  const binaryRows = rows.filter((row): row is typeof row & { terminal_binary: 0 | 1 } => row.terminal_binary !== null);
  const paired = binaryRows.filter((row): row is typeof row & { baseline_probability: number; challenger_probability: number } =>
    row.baseline_probability !== null && row.challenger_probability !== null);
  const allLabels = rows.length > 0 && rows.every(row => row.canonical_outcome_available);
  const errorsComparable = allLabels && paired.length === binaryRows.length &&
    paired.length >= canonicalQualityPublishabilityPolicy.minimum_calibration_identities;
  const blockers = [];
  if (!fittingBoundaryReached && !sealed) blockers.push("declared_training_boundary_not_reached");
  if (!model) blockers.push("training_only_probability_model_insufficient");
  if (!allLabels) blockers.push("forward_original_outcome_population_incomplete");
  if (!errorsComparable) blockers.push("forward_probability_error_not_comparable");
  const originalProbabilityCount = rows.filter(row => row.baseline_probability !== null && row.challenger_probability !== null).length;
  return { contract_version: "relative_plan_probability_measurement_v1" as const,
    status: errorsComparable ? "measured" as const : "evidence_incomplete" as const, model,
    training: { original_decision_window: { ...input.trainingWindow }, fitting_boundary: input.fittedAt,
      fitting_boundary_semantics: "declared_data_cutoff_not_training_job_execution_time" as const,
      model_materialization: sealed ? "immutable_database_attested_pre_forward_training_capsule" as const
        : "recomputed_from_bound_persisted_training_receipts" as const,
      immutable_training_history_verified: sealed !== null,
      immutable_training_history_scope: sealed ? "retained_training_capsule_not_mutable_outcome_tables" as const : "unverified" as const,
      training_job_execution_at: sealed?.materialized_at ?? "unavailable_disclosed",
      training_job_clock_semantics: sealed ? "database_materialization_statement_time_separate_committed_read_attested" as const
        : "no_training_job_clock_available" as const,
      training_source_as_of: sealed?.trained_model.training_source_as_of ?? null,
      committed_model_observed_at: sealed?.committed_read_at ?? null,
      materialization_id: sealed?.materialization_id ?? null,
      model_binding_fingerprint: sealed?.trained_model.model_binding_fingerprint ?? null,
      original_population_count: sealed?.trained_model.original_population_count ?? trainingRows.length,
      binary_fitting_sample_count: sealed?.trained_model.model.sample_count ?? fittingRows.length,
      missing_or_unavailable_label_count: sealed?.trained_model.missing_outcome_count ?? missingLabels,
      late_label_count: sealed ? sealed.trained_model.original_training_receipts.filter(row =>
        Math.max(Date.parse(row.evaluated_at ?? ""), Date.parse(row.recorded_at ?? "")) >= cutoff).length : lateLabels,
      non_binary_label_count: sealed?.trained_model.non_binary_outcome_count ?? nonBinaryLabels,
      fitted_input_fingerprint: sealed?.trained_model.fitting_input_fingerprint ?? hash(fittingRows),
      original_membership_fingerprint: sealed?.trained_model.original_training_membership_fingerprint ??
        hash(trainingRows.map(({ comparison, row }) => [comparison.scan_run_fingerprint, row.candidate_id])) },
    forward: { original_population_count: rows.length, canonical_outcome_count: rows.filter(row => row.canonical_outcome_available).length,
      missing_outcome_count: rows.filter(row => !row.canonical_outcome_available).length,
      non_binary_outcome_count: rows.filter(row => row.canonical_outcome_available && row.terminal_binary === null).length,
      binary_outcome_count: binaryRows.length, paired_probability_count: originalProbabilityCount,
      missing_probability_count: rows.length - originalProbabilityCount,
      original_probability_coverage: rows.length ? originalProbabilityCount / rows.length : null,
      binary_probability_coverage: binaryRows.length ? paired.length / binaryRows.length : null,
      baseline: errorsComparable ? error(paired.map(row => ({ probability: row.baseline_probability, actual: row.terminal_binary }))) : null,
      challenger: errorsComparable ? error(paired.map(row => ({ probability: row.challenger_probability, actual: row.terminal_binary }))) : null,
      original_membership_fingerprint: hash(rows.map(row => [row.run_fingerprint, row.candidate_id])), rows },
    blockers, ordinal_scores_are_probabilities: false as const,
    binary_event_semantics: "target_before_stop_vs_stop_before_target_only_nonbinary_is_not_a_loss" as const,
    full_charter_decision: null, quality_improvement_claimed: false as const,
    live_ranking_effect: false as const, publication_effect: false as const, provider_effect: false as const, broker_effect: false as const };
}
