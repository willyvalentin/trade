import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildCompletedInputResearchIntakeQualityResult,
  buildRecommendationIntakeQualityResult,
} from "@/lib/recommendation-intake-quality";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";

const now = "2026-09-19T15:00:00.000Z";

function intakeInput(overrides: Record<string, unknown> = {}) {
  return {
    recommendation_id: "rec-direction-aware",
    ticker: "TST",
    entry_price: 100,
    stop_price: 98,
    target_price: 104,
    confidence_score: 80,
    setup_type: "momentum_continuation",
    reason_text:
      "Fresh, attributable decision evidence supports the documented intraday setup.",
    generated_at: now,
    market_data_timestamp: now,
    market_session: { phase: "opening", risk_level: "normal" },
    existing_recommendations: [],
    now,
    ...overrides,
  };
}

test("intake quality evaluates both long and short price geometry correctly", () => {
  const long = buildRecommendationIntakeQualityResult(
    intakeInput({ direction: "long" }),
  );
  const short = buildRecommendationIntakeQualityResult(
    intakeInput({
      direction: "short",
      stop_price: 102,
      target_price: 96,
    }),
  );

  expect(long).toMatchObject({
    result_version: "1.1",
    direction: "long",
    status: "accepted",
    risk_reward_ratio: 2,
    internal_only: true,
  });
  expect(short).toMatchObject({
    result_version: "1.1",
    direction: "short",
    status: "accepted",
    risk_reward_ratio: 2,
    internal_only: true,
  });
  expect(short.blockers).toEqual([]);
});

test("unknown direction fails closed instead of assuming long geometry", () => {
  const result = buildRecommendationIntakeQualityResult(intakeInput());

  expect(result).toMatchObject({
    direction: "unknown",
    status: "incomplete",
    grade: "unknown",
    accepted_for_visible_list: false,
    internal_only: true,
  });
  expect(result.checks).toContainEqual(
    expect.objectContaining({ check_id: "price_plan", status: "incomplete" }),
  );
});

test("an upstream stale marker rejects a receipt even when its timestamp looks fresh", () => {
  const result = buildRecommendationIntakeQualityResult(
    intakeInput({ direction: "long", market_data_stale: true }),
  );

  expect(result).toMatchObject({
    result_version: "1.1",
    status: "rejected",
    internal_only: true,
  });
  expect(result.blockers).toContainEqual(
    expect.objectContaining({ reason_id: "market_data_reported_stale" }),
  );
});

test("observed all-zero volume is not a passing liquidity assessment", () => {
  const result = buildCompletedInputResearchIntakeQualityResult(
    intakeInput({ direction: "long", latest_volume: 0, average_volume: 0, spread_percent: 0.1 }),
  );
  expect(result.checks).toContainEqual(
    expect.objectContaining({ check_id: "liquidity_spread", status: "warning" }),
  );
  expect(result).toMatchObject({ result_version: "1.2", status: "needs_review", grade: "C" });
  expect(result.warnings.map(warning => warning.reason_id)).toEqual(["volume_low"]);
});

test("missing volume and spread cannot establish a passing liquidity assessment", () => {
  const result = buildCompletedInputResearchIntakeQualityResult(
    intakeInput({ direction: "long" }),
  );
  expect(result.checks).toContainEqual(
    expect.objectContaining({ check_id: "liquidity_spread", status: "incomplete" }),
  );
  expect(result).toMatchObject({ result_version: "1.2", status: "incomplete", grade: "unknown", accepted_for_visible_list: false });
  expect(result.warnings.map(warning => warning.reason_id)).toEqual(["volume_unavailable", "spread_unavailable"]);
});

test("new research distinguishes known weak volume from unavailable spread", () => {
  const result = buildCompletedInputResearchIntakeQualityResult(
    intakeInput({ direction: "long", latest_volume: 0, average_volume: 1000 }),
  );
  expect(result).toMatchObject({ status: "incomplete", grade: "unknown" });
  expect(result.warnings.map(warning => warning.reason_id)).toEqual([
    "spread_unavailable", "volume_low", "volume_contracting",
  ]);
});

for (const invalid of [null, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
  for (const field of ["latest_volume", "average_volume", "spread_percent"]) {
    test(`new research does not pass invalid ${field}: ${String(invalid)}`, () => {
      const result = buildCompletedInputResearchIntakeQualityResult(intakeInput({
        direction: "long", latest_volume: 100000, average_volume: 100000, spread_percent: 0.1,
        [field]: invalid,
      }));
      expect(result).toMatchObject({ status: "incomplete", grade: "unknown", accepted_for_visible_list: false });
      expect(result.checks).toContainEqual(expect.objectContaining({ check_id: "liquidity_spread", status: "incomplete" }));
    });
  }
}

test("fully observed research retains existing low-volume and wide-spread thresholds", () => {
  const input = intakeInput({ direction: "long", latest_volume: 100000, average_volume: 100000, spread_percent: 0 });
  const research = buildCompletedInputResearchIntakeQualityResult(input);
  expect(research).toEqual({ ...buildRecommendationIntakeQualityResult(input), result_version: "1.2" });
  const warned = buildCompletedInputResearchIntakeQualityResult({ ...input, average_volume: 1000, spread_percent: 2 });
  expect(warned).toMatchObject({ status: "needs_review", grade: "C" });
  expect(warned.warnings.map(warning => warning.reason_id)).toEqual(["volume_low", "spread_wide"]);
});

test("legacy producers retain their original v1.1 semantics without retrospective rewriting", () => {
  for (const context of [{}, { latest_volume: 0, average_volume: 0 }]) {
    const result = buildRecommendationIntakeQualityResult(intakeInput({ direction: "long", ...context }));
    expect(result).toMatchObject({ result_version: "1.1", status: "accepted", grade: "A" });
    expect(result.checks).toContainEqual(expect.objectContaining({ check_id: "liquidity_spread", status: "pass" }));
  }
});

test("snapshot storage keeps the versioned quality result as internal decision evidence", () => {
  const intakeQuality = buildRecommendationIntakeQualityResult(
    intakeInput({ direction: "short", stop_price: 102, target_price: 96 }),
  );
  const snapshot = buildRecommendationSnapshot({
    recommendation_id: "rec-direction-aware",
    ticker: "TST",
    app_timestamp: now,
    entry: 100,
    stop: 102,
    target: 96,
    side: "short",
    is_visible: true,
    quality: { intake_quality_result: intakeQuality },
  });

  expect(snapshot.intake_quality_json).toEqual(intakeQuality);
  expect(snapshot.quality_json?.intake_quality_result).toEqual(intakeQuality);
});

test("the automated scan persists the receipt without using it as publication authority", () => {
  const route = readFileSync(
    resolve(process.cwd(), "app/api/automation/run-scan/route.ts"),
    "utf8",
  );
  const app = readFileSync(resolve(process.cwd(), "app/trade-app.tsx"), "utf8");

  expect(route).toContain('from "@/lib/recommendation-intake-quality"');
  expect(route).toContain("const intakeQualityResult = buildRecommendationIntakeQualityResult");
  expect(route).toContain("intake_quality_result: intakeQualityResult");
  expect(route).toContain(
    "intake_quality_shadow_only: intakeQualityResult.internal_only",
  );
  expect(route).toContain(
    "scannerCandidate?.stale === true || scanLog.indicator_stale === true",
  );
  expect(app).toContain('direction: recommendation.direction === "Short" ? "short" : "long"');
});
