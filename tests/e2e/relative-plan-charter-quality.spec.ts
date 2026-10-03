import { expect, test } from "@playwright/test";
import { summarizeRelativePlanCharterQuality } from "@/lib/server/relative-plan-charter-quality";
import { buildRelativePlanCharterObservations } from "@/lib/server/relative-plan-charter-observations";
import { buildRelativePlanProbabilityMeasurement } from "@/lib/server/relative-plan-probability-measurement";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";

const now = new Date("2026-11-07T00:00:00.000Z");
async function observations(days = [12, 13, 14]) {
  return Promise.all(days.map(async day => {
    const source = await prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17)) });
    return buildRelativePlanCharterObservations({ scanRun: source.scanRuns[0], source, now })!;
  }));
}
const seed = "synthetic_same_original_population_not_alpha";

test("computes paired original K=3 precision and expectancy with fixed trading-day uncertainty", async () => {
  const rows = await observations();
  const result = summarizeRelativePlanCharterQuality({ observations: rows, probability: null, bootstrapSeed: seed });
  expect(result).toMatchObject({ original_decision_count: 3, original_population_count: 12,
    trading_day_count: 3, ticker_count: 4, original_outcome_population_complete: true });
  expect(result.baseline.precision_at_3?.value).toBeCloseTo(2 / 3);
  expect(result.challenger.precision_at_3?.value).toBe(1);
  expect(result.challenger.expectancy_r).toBeCloseTo(8.5 / 3.5);
  expect(result.paired_precision_interval?.lower).toBeCloseTo(1 / 3);
  expect(result.paired_precision_interval?.upper).toBeCloseTo(1 / 3);
  expect(result.calibration).toBeNull();
  expect(result.terminal_quality_decision).toBeNull();
  expect(result.quality_improvement_claimed).toBe(false);
  expect(summarizeRelativePlanCharterQuality({ observations: [...rows].reverse(), probability: null, bootstrapSeed: seed })).toEqual(result);
});

test("an unresolved rejected-from-top-K original member still invalidates complete paired quality", async () => {
  const rows = await observations(), originalPopulation = rows.flatMap(row => row.rows).length;
  // Obtain the missing canonical source via the real source/adapter path,
  // rather than just nulling a numerical scorecard result.
  const source = await prospectiveSource({ missingOutcome: true });
  rows[0] = buildRelativePlanCharterObservations({ scanRun: source.scanRuns[0], source, now })!;
  const result = summarizeRelativePlanCharterQuality({ observations: rows, probability: null, bootstrapSeed: seed });
  expect(result.original_population_count).toBe(originalPopulation);
  expect(result.outcome_coverage?.value).toBeCloseTo(11 / 12);
  expect(result.original_outcome_population_complete).toBe(false);
  expect(result.baseline.precision_at_3).toBeNull();
  expect(result.challenger.expectancy_r).toBeNull();
  expect(result.paired_precision_interval).toBeNull();
});

test("few days or duplicated original populations do not masquerade as paired uncertainty", async () => {
  const rows = await observations([12]);
  for (const values of [rows, [rows[0], rows[0], rows[0]]]) {
    const result = summarizeRelativePlanCharterQuality({ observations: values, probability: null, bootstrapSeed: seed });
    expect(result.paired_precision_interval).toBeNull();
    expect(result.sample_diversity_sufficient).toBe(false);
  }
});

test("quality slices use each original top-three arm and disclose unknown context without changing its denominator", async () => {
  const result = summarizeRelativePlanCharterQuality({ observations: await observations(), probability: null, bootstrapSeed: seed });
  const baseline = result.quality_slices.find(row => row.arm === "baseline")!;
  const challenger = result.quality_slices.find(row => row.arm === "challenger")!;
  expect(baseline.original_selected_candidate_count).toBe(9);
  expect(challenger.original_selected_candidate_count).toBe(9);
  expect(baseline.dimensions.find(row => row.dimension === "sector")!.groups[0].precision?.value).toBeCloseTo(2 / 3);
  expect(challenger.dimensions.find(row => row.dimension === "sector")!.groups[0].precision?.value).toBe(1);
  for (const arm of result.quality_slices) for (const name of ["setup", "regime"]) {
    expect(arm.dimensions.find(row => row.dimension === name)).toMatchObject({ missing_context_count: 9, groups: [] });
  }
  expect(result.context_triage).toBeNull();
  expect(result.terminal_quality_decision).toBeNull();
});

test("actual prior-only numeric calibration must retain exactly the same original forward identities", async () => {
  const forward = await observations(), sources = await Promise.all([5, 6, 7].flatMap(day => [16, 17, 18, 19].map(hour =>
    prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, hour)) }))));
  const training = sources.map(source => buildRelativePlanCharterObservations({ scanRun: source.scanRuns[0], source, now })!.comparison);
  const forwardSources = await Promise.all([12, 13, 14].map(day => prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17)) })));
  const probability = buildRelativePlanProbabilityMeasurement({
    trainingWindow: { start_at: "2026-10-05T13:30:00.000Z", end_at: "2026-10-09T20:00:00.000Z" },
    fittedAt: "2026-10-12T13:30:00.000Z", forwardStartsAt: "2026-10-12T13:30:00.000Z", now, training,
    forward: forward.map(row => row.comparison), outcomes: [...sources, ...forwardSources].flatMap(source => source.outcomes),
  });
  expect(probability.status).toBe("measured");
  const complete = summarizeRelativePlanCharterQuality({ observations: forward, probability, bootstrapSeed: seed });
  expect(complete.calibration?.binary_outcome_count).toBe(12);
  expect(complete.calibration?.challenger?.expected_calibration_error).not.toBeNull();
  // Numerical measurement itself is not proof of an immutable pre-forward job.
  expect(complete.terminal_quality_decision).toBeNull();
  const changed = structuredClone(probability);
  changed.forward!.rows[0].candidate_id = "other_original_candidate";
  expect(summarizeRelativePlanCharterQuality({ observations: forward, probability: changed, bootstrapSeed: seed }).calibration).toBeNull();
});
