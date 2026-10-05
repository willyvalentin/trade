import { expect, test } from "@playwright/test";
import { buildRelativePlanCharterContext, relativePlanCharterProportion } from "@/lib/server/relative-plan-charter-context";
import { buildRelativePlanCharterObservations } from "@/lib/server/relative-plan-charter-observations";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";

async function observations() {
  const source = await prospectiveSource();
  return buildRelativePlanCharterObservations({ scanRun: source.scanRuns[0], source,
    now: new Date("2026-10-12T19:00:00.000Z") })!;
}

test("original features are fully measured while uncaptured concentration stays unknown", async () => {
  const result = buildRelativePlanCharterContext([await observations()]);
  expect(result.same_original_population).toBe(true);
  expect(result.feasibility.complete).toBe(true);
  expect(result.feasibility.liquidity.coverage).toMatchObject({ numerator: 4, denominator: 4, value: 1 });
  expect(result.concentration.ticker.maximum_single_share?.value).toBe(0.25);
  expect(result.concentration.sector.maximum_single_share?.value).toBe(1);
  expect(result.concentration.setup.maximum_single_share).toBeNull();
  expect(result.concentration.regime).toMatchObject({ expected_count: 4, observed_count: 0, missing_count: 4, complete: false });
  expect(result.terminal_quality_decision).toBeNull();
});

test("one known context does not hide the other original missing members or become a qualified concentration", async () => {
  const value = await observations(); value.rows[0].regime = "risk_on";
  const result = buildRelativePlanCharterContext([value]);
  expect(result.concentration.regime).toMatchObject({ expected_count: 4, observed_count: 1, missing_count: 3, complete: false });
  expect(result.concentration.regime.groups[0].share?.value).toBe(0.25);
  expect(result.concentration.regime.maximum_single_share).toBeNull();
});

test("missing features are not zero; genuinely measured zero is retained", async () => {
  const value = await observations();
  value.rows[0].liquidity.intraday_latest_volume = 0;
  expect(buildRelativePlanCharterContext([value]).feasibility.liquidity.complete).toBe(true);
  value.rows[1].liquidity.intraday_latest_volume = null;
  value.rows[2].volatility.intraday_latest_range_percent = -1;
  value.rows[3].trigger_attainment = null;
  const result = buildRelativePlanCharterContext([value]);
  for (const dimension of [result.feasibility.liquidity, result.feasibility.volatility, result.feasibility.trigger_attainment]) {
    expect(dimension).toMatchObject({ observed_count: 3, missing_count: 1, expected_count: 4, complete: false });
  }
  expect(result.feasibility.complete).toBe(false);
});

test("duplicate or shortened original populations never produce qualified coverage or concentration", async () => {
  const value = await observations();
  for (const input of [[value, value], [{ ...value, rows: value.rows.slice(1) }]]) {
    const result = buildRelativePlanCharterContext(input);
    expect(result.status).toBe("conflicting");
    expect(result.feasibility.complete).toBe(false);
    expect(result.feasibility.liquidity.coverage).toBeNull();
    expect(result.concentration.ticker.maximum_single_share).toBeNull();
  }
});

test("old or mixed feature versions cannot satisfy the original current-vector requirement", async () => {
  const value = await observations(); value.rows[0].decision_feature_vector_version = null;
  expect(buildRelativePlanCharterContext([value]).feasibility.supported_original_vector).toBe(false);
});

test("daily-basis and legacy-named populations remain separately measurable and never silently pooled", async () => {
  const source = await prospectiveSource({ featureVectorVersion: "recommendation_decision_feature_vector_v3" });
  const current = buildRelativePlanCharterObservations({ source, scanRun: source.scanRuns[0],
    now: new Date("2026-10-12T19:00:00.000Z") })!;
  const measured = buildRelativePlanCharterContext([current]);
  expect(measured.feasibility).toMatchObject({ complete:true, supported_original_vector:true,
    decision_feature_vector_version:"recommendation_decision_feature_vector_v3" });
  const mixed = structuredClone(current);
  mixed.rows[0].decision_feature_vector_version = "recommendation_decision_feature_vector_v2";
  const gap = buildRelativePlanCharterContext([mixed]);
  expect(gap.original_population_count).toBe(4);
  expect(gap.feasibility.supported_original_vector).toBe(false);
  expect(gap.feasibility.complete).toBe(false);
});

test("fixed 95-percent descriptive Wilson bounds disclose uncertainty and reject invalid denominators", () => {
  expect(relativePlanCharterProportion(0, 10)?.upper).toBeCloseTo(0.2775327999);
  expect(relativePlanCharterProportion(10, 10)?.lower).toBeCloseTo(0.7224672001);
  expect(relativePlanCharterProportion(5, 10)?.value).toBe(0.5);
  for (const [wins, n] of [[0, 0], [11, 10], [-1, 10], [1.2, 10], [1, Infinity]]) expect(relativePlanCharterProportion(wins, n)).toBeNull();
});
