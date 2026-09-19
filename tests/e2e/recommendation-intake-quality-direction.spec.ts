import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { buildRecommendationIntakeQualityResult } from "@/lib/recommendation-intake-quality";
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
    direction: "long",
    status: "accepted",
    risk_reward_ratio: 2,
    internal_only: true,
  });
  expect(short).toMatchObject({
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
  expect(app).toContain('direction: recommendation.direction === "Short" ? "short" : "long"');
});
