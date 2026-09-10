import { expect, test } from "@playwright/test";

import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { buildRecommendationCardDisplayProps } from "@/components/recommendations/recommendation-card-display-mapper";

function displayProps(freshness: "fresh" | "stale" | "expired") {
  return buildRecommendationCardDisplayProps({
    addTradeGate: {
      blocked: false,
      confirmation: { reasons: [], status: "confirmed" },
      message: "Current intraday confirmation is clean.",
    },
    decisionStack: null,
    freshness,
    isDemoRecommendation: false,
    isSaving: false,
    isValidating: false,
    keyReasons: { positive: [], warnings: [] },
    recommendation: {
      confidenceBreakdown: null,
      confidenceLabel: "GOOD SETUP",
      confidenceScore: 75,
      entryZone: "$100.00",
      riskReward: "2.0",
      stopLoss: "$98.00",
      target1: "$104.00",
      thesis: "A focused test recommendation.",
    },
  });
}

test.describe("MVP-02 stale recommendation presentation", () => {
  test("does not label stale data as a current Make Trade signal", () => {
    const props = displayProps("stale");

    expect(props.freshnessNotice).toBe(
      "STALE DATA — REVALIDATE BEFORE TRADE",
    );
    expect(props.addTradeLabel).toBe("Revalidate Setup");
    expect(props.addTradeLabel).not.toBe("Make Trade");

    const card = RecommendationCard({
      addTradeDisabled: props.addTradeDisabled,
      addTradeLabel: props.addTradeLabel,
      confidenceLabel: props.confidenceLabel,
      confidenceTone: props.confidenceTone,
      discardDisabled: props.discardDisabled,
      freshnessNotice: props.freshnessNotice,
      identity: "TURE",
      metrics: props.metrics,
      onAddTrade: () => undefined,
      onOpenDetails: () => undefined,
      onOpenDiscard: () => undefined,
    });

    expect(JSON.stringify(card)).toContain(
      "STALE DATA — REVALIDATE BEFORE TRADE",
    );
    expect(JSON.stringify(card)).toContain("Revalidate Setup");
  });

  test("keeps fresh signals actionable and expired signals clearly disabled", () => {
    const fresh = displayProps("fresh");
    const expired = displayProps("expired");

    expect(fresh.freshnessNotice).toBeNull();
    expect(fresh.addTradeLabel).toBe("Make Trade");
    expect(fresh.addTradeDisabled).toBe(false);

    expect(expired.freshnessNotice).toBe("EXPIRED — REVIEW ONLY");
    expect(expired.addTradeLabel).toBe("Setup Expired");
    expect(expired.addTradeDisabled).toBe(true);
  });
});
