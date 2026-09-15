import { expect, test } from "@playwright/test";

import {
  resolveAiRecommendationPublicationAction,
} from "@/lib/recommendation-publication-policy";

test.describe("explicit no-trade publication policy", () => {
  test("preserves an explicit model no-trade as a terminal no-publish decision", () => {
    const response = {
      result: "no_trade" as const,
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
    };

    expect(resolveAiRecommendationPublicationAction(response)).toEqual({
      kind: "evaluate_recommendations",
    });
  });
});
