import { expect, test } from "@playwright/test";
import { buildRelativePlanProspectiveLearning } from "@/lib/server/relative-plan-prospective-learning";
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
