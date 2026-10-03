import { expect, test } from "@playwright/test";
import { buildRelativePlanProbabilityMeasurement, hasAdmissibleRelativePlanOutcomeRevisionTimes,
  hasExplicitRelativePlanOutcomeRecordingTimes } from "@/lib/server/relative-plan-probability-measurement";
import { recommendationOutcomeFromPersistenceRow } from "@/lib/recommendation-outcome-tracker";
import type { RelativePlanContextOutcomeComparison } from "@/lib/scanner-relative-plan-context-outcomes";

// Numerical unit fixtures only. Canonical source admission is the already
// merged adapter's responsibility; the integrated consumer must prove that
// boundary separately before these inputs can constitute product evidence.
const trainingWindow = { start_at: "2026-10-05T13:30:00.000Z", end_at: "2026-10-09T20:00:00.000Z" };
const fittedAt = "2026-10-12T13:30:00.000Z", now = new Date("2026-11-07T00:00:00.000Z");

test("new-training raw revision admission retains PostgreSQL microseconds and scans every original row", () => {
  const asOf = new Date("2026-10-10T00:00:00.000Z");
  const row = { evaluated_at: "2026-10-09T23:59:59.000001Z", created_at: "2026-10-09T23:59:59.000002Z",
    updated_at: "2026-10-09T23:59:59.000003Z" };
  const source = [row, { ...row }], bytes = JSON.stringify(source);
  expect(hasAdmissibleRelativePlanOutcomeRevisionTimes(source, asOf)).toBe(true);
  for (const updated_at of ["2026-10-10T00:00:00Z", "2026-10-10T02:00:00.000000+02:00",
    "2026-10-09T19:59:59.999999-04:00"]) {
    expect(hasAdmissibleRelativePlanOutcomeRevisionTimes([{ ...row, updated_at }], asOf)).toBe(true);
  }
  for (const updated_at of ["2026-10-10T00:00:00.000001Z", "2026-10-10T02:00:00.000001+02:00",
    "2026-10-09T23:59:59.000001Z", undefined, null, "", "2026-10-09", "2026-02-30T00:00:00Z"]) {
    expect(hasAdmissibleRelativePlanOutcomeRevisionTimes([row, { ...row, updated_at }], asOf)).toBe(false);
  }
  expect(hasAdmissibleRelativePlanOutcomeRevisionTimes([{ ...row, evaluated_at: "2026-10-09T23:59:59.000004Z" }], asOf)).toBe(false);
  expect(hasAdmissibleRelativePlanOutcomeRevisionTimes(source, new Date("invalid"))).toBe(false);
  expect(hasAdmissibleRelativePlanOutcomeRevisionTimes(null, asOf)).toBe(false);
  expect(hasAdmissibleRelativePlanOutcomeRevisionTimes([null], asOf)).toBe(false);
  expect(hasAdmissibleRelativePlanOutcomeRevisionTimes([], asOf)).toBe(true);
  // Historical recording-time semantics do not acquire the new revision gate.
  expect(hasExplicitRelativePlanOutcomeRecordingTimes([{ ...row, updated_at: "future_or_missing_legacy_metadata" }])).toBe(true);
  expect(JSON.stringify(source)).toBe(bytes);
});

function fixture() {
  const outcomes: Array<{ id: string; snapshot_fingerprint: string; ticker: string; evaluated_at: string; created_at: string }> = [];
  function comparison(day: number, phase: string, label: "win" | "loss", score = 70) {
    const at = new Date(Date.UTC(2026, 9, day, 17)).toISOString();
    const candidates = Array.from({ length: 12 }, (_, index) => {
      const id = `${phase}_${day}_${index}`, ticker = `TEST${index % 3}`;
      const evaluated = new Date(Date.parse(at) + 3600000).toISOString();
      outcomes.push({ id, snapshot_fingerprint: id, ticker, evaluated_at: evaluated, created_at: evaluated });
      return { candidate_id: id, ticker, context_status: "assessed", baseline_rank: index + 1, shadow_rank: index + 1,
        baseline_score: score, shadow_score: score, outcome_status: "resolved", outcome_id: id, snapshot_fingerprint: id,
        terminal_outcome: label === "win" ? "target_before_stop" : "stop_before_target", r_result: label === "win" ? 2 : -1 };
    });
    return { comparison_version: "relative_plan_context_shadow_v1", primary_horizon: "60m", status: "linked_complete",
      original_population_count: 12, candidates, scan_run_fingerprint: `${phase}_${day}`, decision_timestamp: at,
      live_ranking_effect: false, publication_effect: false, provider_effect: false, broker_effect: false,
      quality_improvement_claimed: false } as unknown as RelativePlanContextOutcomeComparison;
  }
  const training = [comparison(5, "train", "win"), comparison(6, "train", "loss"), comparison(7, "train", "win")];
  const forward = [comparison(12, "held", "loss"), comparison(26, "walk", "win")];
  return { trainingWindow: { ...trainingWindow }, fittedAt, forwardStartsAt: fittedAt, now, training, forward, outcomes };
}

test("fits only prior training labels and measures the unchanged fixed probability buckets on later outcomes", () => {
  const input = fixture(), bytes = JSON.stringify(input);
  const result = buildRelativePlanProbabilityMeasurement(input);
  expect(result.status).toBe("measured");
  expect(result.model?.sample_count).toBe(36);
  expect(result.model?.ticker_count).toBe(3);
  expect(result.model?.trading_day_count).toBe(3);
  expect(result.training).toMatchObject({ original_population_count: 36, binary_fitting_sample_count: 36 });
  expect(result.forward).toMatchObject({ original_population_count: 24, binary_outcome_count: 24,
    missing_outcome_count: 0, original_probability_coverage: 1 });
  // Beta(1,1) posterior mean from 24 wins/36 samples. Never score/100.
  expect(result.forward?.rows[0].baseline_probability).toBe(25 / 38);
  expect(result.forward?.rows[0].baseline_probability).not.toBe(0.7);
  expect(result.forward?.baseline?.brier_score).toBeCloseTo(((25 / 38) ** 2 + (1 - 25 / 38) ** 2) / 2);
  expect(result.forward?.baseline?.expected_calibration_error).toBeCloseTo(25 / 38 - 0.5);
  expect(result.full_charter_decision).toBeNull();
  expect(result.quality_improvement_claimed).toBe(false);
  expect(JSON.stringify(input)).toBe(bytes);
});

test("changing every forward label changes observed error but never fitted probabilities or the training identity", () => {
  const input = fixture(), first = buildRelativePlanProbabilityMeasurement(input);
  for (const comparison of input.forward) for (const row of comparison.candidates) row.terminal_outcome = "target_before_stop";
  const second = buildRelativePlanProbabilityMeasurement(input);
  expect(second.model).toEqual(first.model);
  expect(second.training).toEqual(first.training);
  expect(second.forward?.rows.map(row => row.baseline_probability)).toEqual(first.forward?.rows.map(row => row.baseline_probability));
  expect(second.forward?.original_membership_fingerprint).toBe(first.forward?.original_membership_fingerprint);
  expect(second.forward?.baseline?.brier_score).not.toBe(first.forward?.baseline?.brier_score);
});

test("a training label first recorded at or after the held-out cutoff is disclosed and excluded from fitting", () => {
  for (const boundary of [fittedAt, "2026-10-12T13:30:00.001Z"]) {
    const input = fixture(); input.outcomes[0].created_at = boundary;
    const result = buildRelativePlanProbabilityMeasurement(input);
    expect(result.model?.sample_count).toBe(35);
    expect(result.training).toMatchObject({ original_population_count: 36, binary_fitting_sample_count: 35, late_label_count: 1 });
  }
});

test("missing forward labels retain original membership and null comparable error rather than shrinking the denominator", () => {
  const input = fixture(), complete = buildRelativePlanProbabilityMeasurement(input);
  input.outcomes = input.outcomes.filter(row => row.id !== input.forward[0].candidates[0].outcome_id);
  const missing = buildRelativePlanProbabilityMeasurement(input);
  expect(missing.status).toBe("evidence_incomplete");
  expect(missing.model).toEqual(complete.model);
  expect(missing.forward).toMatchObject({ original_population_count: 24, canonical_outcome_count: 23, missing_outcome_count: 1,
    baseline: null, challenger: null });
  expect(missing.forward?.original_membership_fingerprint).toBe(complete.forward?.original_membership_fingerprint);
  expect(missing.forward?.rows).toHaveLength(24);
});

test("untriggered and neither-hit outcomes are disclosed non-binary observations, never negative training labels", () => {
  const input = fixture();
  input.training[0].candidates[0].terminal_outcome = "no_entry";
  input.forward[0].candidates[0].terminal_outcome = "no_entry";
  input.forward[0].candidates[1].terminal_outcome = "neither";
  const result = buildRelativePlanProbabilityMeasurement(input);
  expect(result.training).toMatchObject({ original_population_count: 36, binary_fitting_sample_count: 35, non_binary_label_count: 1 });
  expect(result.forward).toMatchObject({ original_population_count: 24, canonical_outcome_count: 24,
    binary_outcome_count: 22, non_binary_outcome_count: 2 });
  expect(result.forward?.rows[0].terminal_binary).toBeNull();
});

test("an underfilled score bucket does not masquerade as an ordinal probability", () => {
  const input = fixture(); for (const row of input.forward[0].candidates) row.shadow_score = 90;
  const result = buildRelativePlanProbabilityMeasurement(input);
  expect(result.status).toBe("evidence_incomplete");
  expect(result.forward).toMatchObject({ original_population_count: 24, paired_probability_count: 12,
    missing_probability_count: 12, original_probability_coverage: 0.5, baseline: null, challenger: null });
  expect(result.forward?.rows[0].challenger_probability).toBeNull();
});

test("duplicates, future decisions, wrong model and malformed time bounds fail closed", () => {
  const cases = [
    (input: ReturnType<typeof fixture>) => { input.training.push(input.training[0]); },
    (input: ReturnType<typeof fixture>) => { input.forward[0].candidates[0].candidate_id = input.training[0].candidates[0].candidate_id; },
    (input: ReturnType<typeof fixture>) => { input.training[0].comparison_version = "wrong_model" as never; },
    (input: ReturnType<typeof fixture>) => { input.now = new Date("2026-10-10T00:00:00.000Z"); },
    (input: ReturnType<typeof fixture>) => { input.trainingWindow.end_at = fittedAt; },
  ];
  for (const mutate of cases) {
    const input = fixture(); mutate(input);
    expect(buildRelativePlanProbabilityMeasurement(input)).toMatchObject({ status: "conflicting", model: null, forward: null });
  }
});

test("reversed decision/receipt input preserves the deterministic model and exact measurement", () => {
  const input = fixture(), first = buildRelativePlanProbabilityMeasurement(input);
  expect(first.status).toBe("measured");
  input.training.reverse(); input.forward.reverse(); input.outcomes.reverse();
  expect(buildRelativePlanProbabilityMeasurement(input)).toEqual(first);
});

test("held-out and walk-forward errors stay separate while sharing exactly one training-only model", () => {
  const input = fixture();
  const held = buildRelativePlanProbabilityMeasurement({ ...input, forward: [input.forward[0]] });
  const walk = buildRelativePlanProbabilityMeasurement({ ...input, forward: [input.forward[1]] });
  expect(held.status).toBe("measured"); expect(walk.status).toBe("measured");
  expect(held.model).toEqual(walk.model);
  expect(held.forward?.baseline?.expected_calibration_error).toBeCloseTo(25 / 38);
  expect(walk.forward?.baseline?.expected_calibration_error).toBeCloseTo(1 - 25 / 38);
  expect(held.forward?.original_membership_fingerprint).not.toBe(walk.forward?.original_membership_fingerprint);
});

test("less than the unchanged minimum training sample remains insufficient", () => {
  const input = fixture();
  input.outcomes = input.outcomes.filter(row => !input.training[0].candidates.some(candidate => candidate.outcome_id === row.id));
  const result = buildRelativePlanProbabilityMeasurement(input);
  expect(result.status).toBe("evidence_incomplete"); expect(result.model).toBeNull();
  expect(result.training).toMatchObject({ original_population_count: 36, binary_fitting_sample_count: 24,
    missing_or_unavailable_label_count: 12 });
  expect(result.forward).toMatchObject({ original_population_count: 24, missing_probability_count: 24,
    baseline: null, challenger: null });
});

test("the fitting boundary is not reached merely because some earlier labels are already present", () => {
  const input = fixture(); input.forward = []; input.now = new Date("2026-10-09T21:00:00.000Z");
  const result = buildRelativePlanProbabilityMeasurement(input);
  expect(result.status).toBe("evidence_incomplete"); expect(result.model).toBeNull();
  expect(result.blockers).toContain("declared_training_boundary_not_reached");
  expect(result.training?.original_population_count).toBe(36);
});

test("a duplicate or differently bound forward receipt is missing evidence, not a convenient winning observation", () => {
  for (const mutation of ["duplicate", "wrong_snapshot", "future_recording"] as const) {
    const input = fixture(), selected = input.outcomes.find(row => row.id === input.forward[0].candidates[0].outcome_id)!;
    if (mutation === "duplicate") input.outcomes.push({ ...selected });
    if (mutation === "wrong_snapshot") selected.snapshot_fingerprint = "other-source";
    if (mutation === "future_recording") selected.created_at = "2026-11-08T00:00:00.000Z";
    const result = buildRelativePlanProbabilityMeasurement(input);
    expect(result.status).toBe("evidence_incomplete");
    expect(result.forward).toMatchObject({ original_population_count: 24, missing_outcome_count: 1,
      baseline: null, challenger: null });
    expect(result.model?.sample_count).toBe(36);
  }
});

test("nine training identities in a score bucket remain unknown; the tenth uses the unchanged policy", () => {
  const input = fixture();
  for (const row of input.training[0].candidates.slice(0, 9)) row.shadow_score = 90;
  for (const row of input.forward[0].candidates.slice(0, 3)) row.shadow_score = 90;
  const nine = buildRelativePlanProbabilityMeasurement(input);
  expect(nine.status).toBe("evidence_incomplete");
  expect(nine.model?.sample_count).toBe(36);
  expect(nine.forward).toMatchObject({ missing_probability_count: 3, baseline: null, challenger: null });
  input.training[0].candidates[9].shadow_score = 90;
  const ten = buildRelativePlanProbabilityMeasurement(input);
  expect(ten.status).toBe("measured");
  expect(ten.model?.minimum_bucket_sample).toBe(10);
  expect(ten.forward?.rows[0].challenger_probability).toBe(11 / 12);
  expect(ten.forward?.original_membership_fingerprint).toBe(nine.forward?.original_membership_fingerprint);
  expect(ten.full_charter_decision).toBeNull();
});

test("nine binary forward labels remain an insufficient error sample even with full outcome and probability coverage", () => {
  const input = fixture(); input.forward = [input.forward[0]];
  for (const row of input.forward[0].candidates.slice(0, 3)) row.terminal_outcome = "neither";
  const result = buildRelativePlanProbabilityMeasurement(input);
  expect(result.status).toBe("evidence_incomplete");
  expect(result.forward).toMatchObject({ original_population_count: 12, canonical_outcome_count: 12,
    paired_probability_count: 12, binary_outcome_count: 9, non_binary_outcome_count: 3,
    original_probability_coverage: 1, binary_probability_coverage: 1, baseline: null, challenger: null });
  expect(result.blockers).toContain("forward_probability_error_not_comparable");
});

test("raw recorded clocks are required before the legacy decoder can manufacture a prior training time", () => {
  const raw = { id: "original_outcome", snapshot_fingerprint: "original_source", horizon: "60m",
    evaluated_at: "2026-10-05T18:00:00+00:00", created_at: "2026-10-05T18:00:00.123456+00:00" };
  expect(hasExplicitRelativePlanOutcomeRecordingTimes([raw])).toBe(true);
  expect(hasExplicitRelativePlanOutcomeRecordingTimes([])).toBe(true);
  for (const created_at of [undefined, null, "", "not_a_time", "2026-10-05", "2026-02-30T18:00:00Z"]) {
    const row = { ...raw, created_at };
    expect(recommendationOutcomeFromPersistenceRow(row)).not.toBeNull();
    expect(hasExplicitRelativePlanOutcomeRecordingTimes([row])).toBe(false);
  }
  expect(hasExplicitRelativePlanOutcomeRecordingTimes([{ ...raw, evaluated_at: undefined }])).toBe(false);
  expect(hasExplicitRelativePlanOutcomeRecordingTimes([{ ...raw, evaluated_at: "2026-10-05T18:00:00-04:00",
    created_at: "2026-10-05T22:00:00Z" }])).toBe(true);
});

test("measurement does not claim an executed training job and detaches its declared decision window", () => {
  const input = fixture(), result = buildRelativePlanProbabilityMeasurement(input);
  expect(result.training).toMatchObject({ fitting_boundary_semantics: "declared_data_cutoff_not_training_job_execution_time",
    model_materialization: "recomputed_from_bound_persisted_training_receipts", training_job_execution_at: "unavailable_disclosed",
    immutable_training_history_verified: false });
  input.trainingWindow.start_at = "2026-10-06T13:30:00.000Z";
  expect(result.training?.original_decision_window.start_at).toBe(trainingWindow.start_at);
  expect(result.full_charter_decision).toBeNull();
  expect(result.quality_improvement_claimed).toBe(false);
});
