import { expect, test } from "@playwright/test";
import { buildRelativePlanProspectiveLearning } from "@/lib/server/relative-plan-prospective-learning";
import { buildRelativePlanProspectiveEnrollment } from "@/lib/server/relative-plan-prospective-enrollment";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { buildDecisionLineageReceipt } from "@/lib/decision-lineage-receipt";
import { prospectiveOwner, prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
const readAt = new Date("2026-11-07T00:00:00.000Z");

test("same original prospective population reaches canonical forward learning without quality authority", async () => {
  const source = await prospectiveSource(), bytes = JSON.stringify(source);
  const read = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!;
  const held = read.partitions[1];
  expect(held).toMatchObject({ enrolled_decision_count: 1, original_population_count: 4,
    canonical_outcome_count: 4, missing_outcome_count: 0, outcome_coverage: 1 });
  expect(held.baseline.precision_at_3).toBeCloseTo(2 / 3);
  expect(held.challenger.precision_at_3).toBe(1);
  expect(held.precision_delta).toBeCloseTo(1 / 3);
  expect(read.terminal_quality_decision).toBeNull();
  expect(read.blockers).toContain("full_charter_forward_scorecard_required");
  expect(read.blockers).toContain("durably_frozen_training_probability_model_required");
  expect(read.blockers).toContain("held_out_decision_population_incomplete");
  expect(read.legacy_baseline_readiness.blockers).toContain("completed_input_research_requires_prospective_baseline_contract");
  expect(Object.values(read.authority).every(value => value === false)).toBe(true);
  expect(JSON.stringify(source)).toBe(bytes);
  expect(buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: JSON.parse(JSON.stringify(prospectiveReceipt())),
    source: JSON.parse(bytes), now: readAt })).toEqual(read);
});
test("missing outcomes cannot remove an enrolled decision or shrink its denominator", async () => {
  const source = await prospectiveSource({ missingOutcome: true });
  const read = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!;
  expect(read.partitions[1]).toMatchObject({ enrolled_decision_count: 1, original_population_count: 4,
    canonical_outcome_count: 3, missing_outcome_count: 1, outcome_coverage: 0.75 });
  expect(read.partitions[1].precision_delta).toBeNull();
  const empty = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(),
    source: { ...source, outcomes: [] }, now: readAt })!;
  expect(empty.partitions[1].enrolled_decision_count).toBe(1);
  expect(empty.partitions[1].missing_outcome_count).toBe(4);
  expect(empty.partitions[1].original_membership_fingerprint).toBe(read.partitions[1].original_membership_fingerprint);
});
test("unfavorable labels are measured rather than discarded", async () => {
  const source = await prospectiveSource({ allLosses: true });
  const held = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!.partitions[1];
  expect(held.baseline.precision_at_3).toBe(0);
  expect(held.challenger.expectancy_r).toBe(-1);
  expect(held.enrolled_decision_count).toBe(1);
  expect(held.canonical_outcome_count).toBe(4);
});
test("historical, unassessed and duplicated inputs remain named diagnostics, not comparison evidence", async () => {
  const historical = await prospectiveSource({ now: new Date("2026-10-02T17:00:00.000Z") });
  const partial = await prospectiveSource({ missingInputs: true }), valid = await prospectiveSource();
  const cases: Array<[RecommendationLearningBaselineSource, string]> = [
    [historical, "historical_decision_not_prospective"], [partial, "original_complete_assessed_population_unavailable"],
    [{ ...valid, scanRuns: [...valid.scanRuns, valid.scanRuns[0]] }, "original_decision_or_lineage_missing_ambiguous"],
  ];
  for (const [source, reason] of cases) {
    const read = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!;
    expect(read.partitions.every(row => row.enrolled_decision_count === 0)).toBe(true);
    expect(read.diagnostics.some(row => row.reason === reason)).toBe(true);
  }
  expect(buildRelativePlanProspectiveLearning({ owner: "33333333-3333-4333-8333-333333333333", freeze: prospectiveReceipt(), source: valid, now: readAt })).toBeNull();
});
test("future outcome receipts remain missing before their horizon matures", async () => {
  const source = await prospectiveSource();
  const held = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source,
    now: new Date("2026-10-12T17:30:00.000Z") })!.partitions[1];
  expect(held.enrolled_decision_count).toBe(1);
  expect(held.canonical_outcome_count).toBe(0);
  expect(held.missing_outcome_count).toBe(4);
});

test("an outcome recorded after the read clock cannot enter coverage, precision or calibration", async () => {
  const source = await prospectiveSource();
  const first = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!;
  source.outcomes[0].created_at = "2026-11-07T00:00:00.001Z";
  const bounded = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!;
  expect(bounded.partitions[1]).toMatchObject({ original_population_count: 4, canonical_outcome_count: 3,
    missing_outcome_count: 1, precision_delta: null });
  expect(bounded.partitions[1].original_membership_fingerprint).toBe(first.partitions[1].original_membership_fingerprint);
  expect(bounded.partitions[1].probability_measurement?.forward).toMatchObject({ original_population_count: 4,
    missing_outcome_count: 1, baseline: null, challenger: null });
});

async function probabilitySource() {
  const pieces = await Promise.all([
    ...[5, 6, 7].flatMap(day => Array.from({ length: 4 }, (_, n) => ({ day, n, losses: false }))),
    ...[12, 26].flatMap(day => Array.from({ length: 3 }, (_, n) => ({ day, n, losses: day === 26 }))),
  ].map(({ day, n, losses }) => prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)), allLosses: losses })));
  return { scanRuns: pieces.flatMap(row => row.scanRuns), snapshots: pieces.flatMap(row => row.snapshots),
    outcomes: pieces.flatMap(row => row.outcomes) };
}

test("the actual enrolled reader measures held-out and walk-forward probability error from the same training-only model", async () => {
  const source = await probabilitySource();
  const read = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!;
  const [training, held, walk] = read.partitions;
  expect(training.original_population_count).toBe(48);
  expect(training.probability_measurement).toBeNull();
  expect(held.probability_measurement?.status).toBe("measured");
  expect(walk.probability_measurement?.status).toBe("measured");
  expect(held.probability_measurement?.model).toEqual(walk.probability_measurement?.model);
  expect(held.probability_measurement?.training).toMatchObject({ binary_fitting_sample_count: 48,
    training_job_execution_at: "unavailable_disclosed" });
  expect(held.probability_measurement?.forward).toMatchObject({ original_population_count: 12, original_probability_coverage: 1 });
  expect(walk.probability_measurement?.forward).toMatchObject({ original_population_count: 12, original_probability_coverage: 1 });
  expect(held.probability_measurement?.forward?.baseline?.brier_score).not.toBe(walk.probability_measurement?.forward?.baseline?.brier_score);
  expect(read.blockers).not.toContain("training_only_probability_calibration_required");
  expect(read.blockers).toContain("held_out_decision_population_incomplete");
  expect(read.blockers).toContain("full_charter_forward_scorecard_required");
  expect(read.status).toBe("evidence_incomplete");
  expect(read.terminal_quality_decision).toBeNull();
  expect(read.quality_improvement_claimed).toBe(false);
  expect(Object.values(read.authority).every(value => value === false)).toBe(true);
  const noHeldLabels = { ...source, outcomes: source.outcomes.filter(row => Date.parse(row.evaluated_at) < Date.parse(prospectiveReceipt().plan.windows.held_out.start_at)) };
  const missing = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source: noHeldLabels, now: readAt })!;
  expect(missing.partitions[1].probability_measurement?.model).toEqual(held.probability_measurement?.model);
  expect(missing.partitions[1].original_membership_fingerprint).toBe(held.original_membership_fingerprint);
  expect(missing.partitions[1].probability_measurement?.forward).toMatchObject({ original_population_count: 12,
    missing_outcome_count: 12, baseline: null, challenger: null });
  expect(missing.blockers).toContain("training_only_probability_calibration_required");
});

test("the actual reader excludes late recorded training labels instead of fitting from future information", async () => {
  const source = await probabilitySource();
  const before = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!;
  source.outcomes[0].created_at = prospectiveReceipt().plan.windows.held_out.start_at;
  const later = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!;
  expect(later.partitions[1].probability_measurement?.training).toMatchObject({ original_population_count: 48,
    binary_fitting_sample_count: 47, late_label_count: 1 });
  expect(later.partitions[1].original_membership_fingerprint).toBe(before.partitions[1].original_membership_fingerprint);
  expect(later.partitions[2].probability_measurement?.model).toEqual(later.partitions[1].probability_measurement?.model);
});

test("the first thirty input-qualified decisions remain selected despite missing early labels and favorable overflow", async () => {
  const sources = await Promise.all(Array.from({ length: 31 }, (_, index) => prospectiveSource({
    now: new Date(Date.UTC(2026, 9, 12, 16, index * 5)), missingOutcome: index === 0, allLosses: index > 0 && index < 30,
  })));
  const source = { scanRuns: sources.flatMap(row => row.scanRuns).reverse(), snapshots: sources.flatMap(row => row.snapshots),
    outcomes: sources.flatMap(row => row.outcomes) };
  const held = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!.partitions[1];
  expect(held).toMatchObject({ enrolled_decision_count: 30, overflow_decision_count: 1,
    original_population_count: 120, canonical_outcome_count: 119, missing_outcome_count: 1 });
  expect(held.decisions[0].fingerprint).toBe(sources[0].scanRuns[0].run_fingerprint);
  expect(held.overflow_fingerprints).toEqual([sources[30].scanRuns[0].run_fingerprint]);
  expect(held.precision_delta).toBeNull();
  const unresolved = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(),
    source: { ...source, outcomes: [] }, now: readAt })!.partitions[1];
  expect(unresolved.original_membership_fingerprint).toBe(held.original_membership_fingerprint);
  expect(unresolved.enrolled_decision_count).toBe(30);
  expect(unresolved.missing_outcome_count).toBe(120);
});

test("equivalent offset clocks cannot displace an unresolved first decision into favorable overflow", async () => {
  const sources = await Promise.all(Array.from({ length: 31 }, (_, index) => prospectiveSource({
    now: new Date(Date.UTC(2026, 9, 12, 16, index * 5)), missingOutcome: index === 0,
  })));
  const earliest = sources[0].scanRuns[0];
  const record = earliest.payload_json.candidate_decision_record as {
    decision_timestamp: string; decision_clock?: { decision_timestamp: string } };
  const originalInstant = Date.parse(record.decision_timestamp);
  record.decision_timestamp = "2026-10-12T23:00:00.000+07:00";
  if (record.decision_clock) record.decision_clock.decision_timestamp = record.decision_timestamp;
  expect(Date.parse(record.decision_timestamp)).toBe(originalInstant);
  const source = { scanRuns: sources.flatMap(row => row.scanRuns).reverse(),
    snapshots: sources.flatMap(row => row.snapshots), outcomes: sources.flatMap(row => row.outcomes) };
  const before = JSON.stringify(source);
  const held = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now: readAt })!.partitions[1];
  expect(held).toMatchObject({ enrolled_decision_count: 30, overflow_decision_count: 1, original_population_count: 120 });
  expect(held.decisions[0].fingerprint).toBe(earliest.run_fingerprint);
  expect(held.decisions[0].decision_at).toBe(record.decision_timestamp);
  // Original snapshot/source inconsistency must remain explicit; keeping the
  // identity does not make unavailable forward calibration qualify.
  expect(held.probability_measurement?.forward).toBeNull();
  expect(held.overflow_fingerprints).toEqual([sources[30].scanRuns[0].run_fingerprint]);
  expect(held.missing_outcome_count).toBeGreaterThan(0);
  expect(held.precision_delta).toBeNull();
  const shuffled = buildRelativePlanProspectiveLearning({ owner: prospectiveOwner, freeze: prospectiveReceipt(),
    source: { ...source, scanRuns: [...source.scanRuns].reverse(), outcomes: [] }, now: readAt })!.partitions[1];
  expect(shuffled.original_membership_fingerprint).toBe(held.original_membership_fingerprint);
  expect(shuffled.missing_outcome_count).toBe(120);
  expect(JSON.stringify(source)).toBe(before);
});

test("equal decision instants use the original fingerprint tie-break at the thirtieth boundary", async () => {
  const sources = await Promise.all(Array.from({ length: 31 }, (_, index) => prospectiveSource({
    now: new Date(Date.UTC(2026, 9, 12, 16, index * 5)),
  })));
  const earlierCapture = sources[29].scanRuns[0];
  const original = candidateDecisionRecordFromScanRun(earlierCapture)!;
  const record = { ...original, decision_timestamp: "2026-10-13T01:30:00.000+07:00",
    decision_clock: { ...original.decision_clock!, decision_timestamp: "2026-10-13T01:30:00.000+07:00" } };
  earlierCapture.completed_at = "2026-10-12T18:30:00.100Z";
  earlierCapture.payload_json.candidate_decision_record = record;
  earlierCapture.payload_json.decision_lineage_receipt = buildDecisionLineageReceipt(record);
  expect(candidateDecisionRecordFromScanRun(earlierCapture)).not.toBeNull();
  const fingerprints = [earlierCapture.run_fingerprint, sources[30].scanRuns[0].run_fingerprint].sort();
  const source = { scanRuns: sources.flatMap(row => row.scanRuns).reverse(),
    snapshots: sources.flatMap(row => row.snapshots), outcomes: sources.flatMap(row => row.outcomes) };
  for (const scanRuns of [source.scanRuns, [...source.scanRuns].reverse()]) {
    const held = buildRelativePlanProspectiveEnrollment({ owner: prospectiveOwner, freeze: prospectiveReceipt(),
      source: { ...source, scanRuns }, now: readAt })!.partitions[1];
    expect(held).toMatchObject({ enrolled_decision_count: 30, overflow_decision_count: 1, original_population_count: 120 });
    expect(held.decisions[29].fingerprint).toBe(fingerprints[0]);
    expect(held.overflow_fingerprints).toEqual([fingerprints[1]]);
  }
});
