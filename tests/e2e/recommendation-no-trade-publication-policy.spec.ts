import { expect, test } from "@playwright/test";

import {
  resolveAiRecommendationPublicationAction,
  resolveSanitizedRecommendationPublicationAction,
} from "@/lib/recommendation-publication-policy";

test.describe("explicit no-trade publication policy", () => {
  test("preserves an explicit model no-trade as a terminal no-publish decision", () => {
    const response = {
      result: "no_trade" as const,
      recommendation_count: 0,
      no_trade: {
        reason: "Volume confirmation is insufficient for an intraday entry.",
        confidence_score: 61,
        risk_flags: ["weak_volume", "late_entry"],
        candidate_ticker: "TEST",
      },
    };

    expect(resolveAiRecommendationPublicationAction(response)).toEqual({
      kind: "preserve_no_trade",
      no_trade: response.no_trade,
    });
  });

  test("uses the conservative default when a no-trade response lacks details", () => {
    const response = {
      result: "no_trade" as const,
      recommendation_count: 0,
    };

    expect(resolveAiRecommendationPublicationAction(response)).toEqual({
      kind: "preserve_no_trade",
      no_trade: {
        reason: "OpenAI did not find an actionable day trade setup.",
        confidence_score: null,
        risk_flags: [],
        candidate_ticker: null,
      },
    });
  });

  test("continues to evaluate actual recommendation output", () => {
    const response = {
      result: "trade_recommendation" as const,
      recommendation_count: 1,
    };

    expect(resolveAiRecommendationPublicationAction(response)).toEqual({
      kind: "evaluate_recommendations",
    });
  });

  test("preserves a zero-output model response as no-publish", () => {
    expect(
      resolveAiRecommendationPublicationAction({
        result: "trade_recommendation",
        recommendation_count: 0,
      }),
    ).toEqual({
      kind: "preserve_no_publish",
      no_publish_reason: "openai_zero_recommendations",
      message:
        "No trade: the model returned no actionable recommendations for this scan.",
    });
  });

  test("preserves model output that fails deterministic validation as no-publish", () => {
    expect(
      resolveSanitizedRecommendationPublicationAction({
        model_recommendation_count: 1,
        sanitized_recommendation_count: 0,
        deterministic_fallback_used: false,
      }),
    ).toEqual({
      kind: "preserve_no_publish",
      no_publish_reason: "openai_recommendation_validation_failed",
      message:
        "No trade: the model recommendations did not pass deterministic validation.",
    });
  });
});
