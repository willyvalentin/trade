import { expect, test } from "@playwright/test";
import { summarizeRelativePlanCharterThresholds } from "@/lib/server/relative-plan-charter-thresholds";
import { buildRelativePlanCharterEvaluation } from "@/lib/server/relative-plan-charter-evaluation";
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";

// Fault-injection measurement tests only. Modified scalars below are not DB,
// original-source or quality acceptance evidence and cannot authorize a policy.
let original: NonNullable<ReturnType<typeof buildRelativePlanCharterEvaluation>>;
let value: Awaited<ReturnType<typeof charterEvaluationInput>>;
test.beforeAll(async () => { test.setTimeout(90000); value = await charterEvaluationInput(); original = buildRelativePlanCharterEvaluation(value)!; });
function input() { return { owner: value.owner, freeze: value.freeze,
  quality: structuredClone(original.partitions[0].quality), operational: structuredClone(original.partitions[0].operational) }; }

test("indivisible charter distinguishes measured violations from unavailable dimensions", () => {
  const result = summarizeRelativePlanCharterThresholds(input())!;
  expect(result.evidence_complete).toBe(true);
  expect(result.absolute_limits_passed).toBe(false);
  expect(result.missing_dimensions).toEqual([]);
  expect(result.measured_limit_failures).toContain("ticker_concentration_charter_limit_not_met");
  expect(result.terminal_quality_decision).toBeNull();
  expect(Object.values(result.authority).every(flag => flag === false)).toBe(true);
});

test("negative, infinite or missing costs are unknown, never a free operational pass", () => {
  for (const credits of [-1, Infinity, NaN, null]) {
    const v = input(); v.operational.cost!.credits_per_decision = credits;
    const result = summarizeRelativePlanCharterThresholds(v)!;
    expect(result.evidence_complete).toBe(false);
    expect(result.missing_dimensions).toContain("provider_credits_per_decision_evidence_unavailable");
    expect(result.checks.find(row => row.dimension === "provider_credits_per_decision")!.value).toBeNull();
  }
});

test("invalid probability metrics, unknown context or missing required feasibility cannot be ignored", () => {
  for (const mode of ["calibration", "brier", "coverage", "concentration", "feasibility"] as const) {
    const v = input();
    if (mode === "calibration") v.quality.calibration!.challenger!.expected_calibration_error = 1.1;
    if (mode === "brier") v.quality.calibration!.baseline!.brier_score = -1;
    if (mode === "coverage") v.quality.calibration!.original_probability_coverage = 0.999;
    if (mode === "concentration") v.quality.context.concentration.sector.maximum_single_share = null;
    if (mode === "feasibility") v.quality.context.feasibility.complete = false;
    expect(summarizeRelativePlanCharterThresholds(v)!.evidence_complete).toBe(false);
  }
});

test("frozen limits are inclusive and unfavorable expectancy is a known failure, not missingness", () => {
  const v = input();
  v.quality.challenger.expectancy_r = -1;
  v.operational.cost!.credits_per_decision = 8;
  const result = summarizeRelativePlanCharterThresholds(v)!;
  expect(result.evidence_complete).toBe(true);
  expect(result.measured_limit_failures).toContain("challenger_expectancy_r_charter_limit_not_met");
  expect(result.checks.find(row => row.dimension === "provider_credits_per_decision")!.status).toBe("pass");
  expect(summarizeRelativePlanCharterThresholds({ ...v, owner: "33333333-3333-4333-8333-333333333333" })).toBeNull();
});
