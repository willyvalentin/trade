import { expect, test } from "@playwright/test";
import { buildRelativePlanCharterObservations } from "@/lib/server/relative-plan-charter-observations";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";

const now = new Date("2026-10-12T19:00:00.000Z");
async function input() {
  const source: RecommendationLearningBaselineSource = await prospectiveSource();
  return { scanRun: source.scanRuns[0], source, now };
}

test("retains every original candidate and measured features while honestly disclosing uncaptured context", async () => {
  const value = await input(), bytes = JSON.stringify(value), result = buildRelativePlanCharterObservations(value)!;
  expect(result.retained_original_population_count).toBe(4);
  expect(result.rows.every(row => row.sector === "Technology")).toBe(true);
  expect(result.rows.every(row => row.liquidity.intraday_latest_volume === 1000)).toBe(true);
  expect(result.rows.every(row => row.trigger_attainment === true)).toBe(true);
  expect(result.rows.every(row => row.setup === null && row.regime === null)).toBe(true);
  expect(result.rows[0].blockers).toContain("original_market_regime_context_missing_or_conflicting");
  expect(result.status).toBe("evidence_incomplete");
  expect(result.terminal_quality_decision).toBeNull();
  expect(Object.values(result.authority).every(value => value === false)).toBe(true);
  expect(JSON.stringify(value)).toBe(bytes);
});

test("missing and late outcomes retain original membership, features and null trigger rather than dropping a row", async () => {
  const value = await input(), complete = buildRelativePlanCharterObservations(value)!;
  for (const mode of ["missing", "late"] as const) {
    const source = structuredClone(value.source);
    if (mode === "missing") source.outcomes.shift();
    else source.outcomes[0].created_at = "2026-10-12T20:00:00.000Z";
    const result = buildRelativePlanCharterObservations({ ...value, source })!;
    expect(result.rows).toHaveLength(4);
    expect(result.original_membership_fingerprint).toBe(complete.original_membership_fingerprint);
    expect(result.rows.filter(row => row.trigger_attainment === null)).toHaveLength(1);
    expect(result.rows.filter(row => row.r_result === null)).toHaveLength(1);
    expect(result.rows.every(row => row.liquidity.intraday_latest_volume === 1000)).toBe(true);
  }
});

test("current, future, single-sided or inconsistent regime metadata cannot replace original context", async () => {
  const value = await input();
  const context = { contract_version: "market_regime_decision_context_v1", classifier_version: "market_regime_v1",
    captured_at: "2026-10-12T17:00:00.000Z", regime: "risk_on" };
  for (const mode of ["snapshot_only", "future", "disagree", "run_value_disagree", "complete"] as const) {
    const source = structuredClone(value.source);
    source.scanRuns[0].payload_json.market_regime = mode === "run_value_disagree" ? "risk_off" : "risk_on";
    source.scanRuns[0].payload_json.market_regime_context = mode === "disagree" ? { ...context, regime: "risk_off" } : context;
    if (mode === "snapshot_only") delete source.scanRuns[0].payload_json.market_regime_context;
    for (const snapshot of source.snapshots) Object.assign(snapshot.payload_json, {
      setup_type: "BREAKOUT_CONTINUATION", market_regime: "risk_on",
      market_regime_context: mode === "future" ? { ...context, captured_at: "2026-10-12T18:00:00.000Z" } : context,
    });
    const result = buildRelativePlanCharterObservations({ ...value, scanRun: source.scanRuns[0], source })!;
    expect(result.rows.every(row => row.regime === (mode === "complete" ? "risk_on" : null))).toBe(true);
    if (mode === "complete") expect(result.status).toBe("observed");
    expect(result.quality_improvement_claimed).toBe(false);
  }
});

test("invalid or explicitly unknown setup is disclosed, not normalized into a measured category", async () => {
  for (const setup of ["UNKNOWN", "unknown", "not_a_setup", 7, null]) {
    const value = await input();
    for (const snapshot of value.source.snapshots) snapshot.payload_json.setup_type = setup;
    expect(buildRelativePlanCharterObservations(value)!.rows.every(row => row.setup === null)).toBe(true);
  }
});

test("duplicate, wrong-identity or changed features fail closed without erasing the original member", async () => {
  for (const mode of ["duplicate", "identity", "features"] as const) {
    const value = await input();
    if (mode === "duplicate") value.source.snapshots.push(value.source.snapshots[0]);
    else if (mode === "identity") value.source.snapshots[0].payload_json.candidate_decision_id = "wrong";
    else {
      const vector = value.source.snapshots[0].payload_json.decision_feature_vector as { feature_values: Record<string, unknown> };
      vector.feature_values.intraday_latest_volume = 0;
    }
    const result = buildRelativePlanCharterObservations(value)!;
    expect(result.rows).toHaveLength(4);
    expect(result.rows.filter(row => row.snapshot_fingerprint === null)).toHaveLength(1);
    expect(result.rows.filter(row => row.liquidity.intraday_latest_volume === null)).toHaveLength(1);
  }
});

test("future decisions and invalid clocks never become observed evidence", async () => {
  const value = await input();
  const result = buildRelativePlanCharterObservations({ ...value, now: new Date("2026-10-12T16:59:59.999Z") })!;
  expect(result.rows).toHaveLength(4);
  expect(result.rows.every(row => row.r_result === null && row.trigger_attainment === null)).toBe(true);
  expect(result.status).toBe("evidence_incomplete");
  expect(buildRelativePlanCharterObservations({ ...value, now: new Date(NaN) })).toBeNull();
});
