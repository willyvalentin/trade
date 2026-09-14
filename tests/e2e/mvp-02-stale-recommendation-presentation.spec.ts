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
  test("does not label stale data as a current manual-recording signal", () => {
    const props = displayProps("stale");

    expect(props.freshnessNotice).toBe(
      "STALE DATA — REVALIDATE BEFORE TRADE",
    );
    expect(props.addTradeLabel).toBe("Revalidate Setup");
    expect(props.addTradeLabel).not.toBe("Record Manual Trade");

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

  test("keeps fresh signals recordable and expired signals clearly disabled", () => {
    const fresh = displayProps("fresh");
    const expired = displayProps("expired");

    expect(fresh.freshnessNotice).toBeNull();
    expect(fresh.addTradeLabel).toBe("Record Manual Trade");
    expect(fresh.addTradeDisabled).toBe(false);
    expect(fresh.actionDescription).toBe(
      "Opens manual trade recording after validation. It never submits a broker order.",
    );

    expect(expired.freshnessNotice).toBe("EXPIRED — REVIEW ONLY");
    expect(expired.addTradeLabel).toBe("Setup Expired");
    expect(expired.addTradeDisabled).toBe(true);
    expect(expired.actionDescription).toBeNull();
  });

  test("shows a local progress message while trade recording validation is running", () => {
    const props = buildRecommendationCardDisplayProps({
      addTradeGate: {
        blocked: false,
        confirmation: { reasons: [], status: "confirmed" },
        message: "Current intraday confirmation is clean.",
      },
      decisionStack: null,
      freshness: "fresh",
      isDemoRecommendation: false,
      isSaving: false,
      isValidating: true,
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

    expect(props.addTradeLabel).toBe("Validating Setup");
    expect(props.addTradeDisabled).toBe(true);
    expect(props.actionDescription).toBe(
      "Checking current market data before opening manual trade recording. No broker order will be sent.",
    );
  });

  test("routes fresh low-confidence setups through review before manual recording", () => {
    const props = buildRecommendationCardDisplayProps({
      addTradeGate: {
        blocked: false,
        confirmation: { reasons: [], status: "confirmed" },
        message: "Current intraday confirmation is clean.",
      },
      decisionStack: null,
      freshness: "fresh",
      isDemoRecommendation: false,
      isSaving: false,
      isValidating: false,
      keyReasons: { positive: [], warnings: [] },
      recommendation: {
        confidenceBreakdown: null,
        confidenceLabel: "LOW CONFIDENCE",
        confidenceScore: 63,
        entryZone: "$100.00",
        riskReward: "2.0",
        stopLoss: "$98.00",
        target1: "$104.00",
        thesis: "A setup that needs independent review.",
      },
    });

    expect(props.addTradeLabel).toBe("Review Low Confidence");
    expect(props.addTradeDisabled).toBe(false);
    expect(props.requiresConfidenceReview).toBe(true);
    expect(props.actionDescription).toBe(
      "This setup is low confidence. Review its evidence before continuing to the manual trade record.",
    );
  });

  test("never offers the low-confidence review continuation for stale data", () => {
    const props = buildRecommendationCardDisplayProps({
      addTradeGate: {
        blocked: false,
        confirmation: { reasons: [], status: "confirmed" },
        message: "Current intraday confirmation is clean.",
      },
      decisionStack: null,
      freshness: "stale",
      isDemoRecommendation: false,
      isSaving: false,
      isValidating: false,
      keyReasons: { positive: [], warnings: [] },
      recommendation: {
        confidenceBreakdown: null,
        confidenceLabel: "LOW CONFIDENCE",
        confidenceScore: 63,
        entryZone: "$100.00",
        riskReward: "2.0",
        stopLoss: "$98.00",
        target1: "$104.00",
        thesis: "A stale low-confidence setup.",
      },
    });

    expect(props.addTradeLabel).toBe("Revalidate Setup");
    expect(props.requiresConfidenceReview).toBe(false);
    expect(props.actionDescription).toBe(
      "Revalidates current market data before opening manual trade recording. No broker order will be sent.",
    );
  });

  test("does not expose a recordable action when the intraday gate is blocked", () => {
    const props = buildRecommendationCardDisplayProps({
      addTradeGate: {
        blocked: true,
        confirmation: { reasons: ["Market data is unavailable."], status: "weak" },
        message: "Market data is unavailable.",
      },
      decisionStack: null,
      freshness: "fresh",
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
        thesis: "A setup blocked by the current intraday gate.",
      },
    });

    expect(props.addTradeLabel).toBe("Setup Blocked");
    expect(props.addTradeDisabled).toBe(true);
    expect(props.actionDescription).toBeNull();
    expect(props.requiresConfidenceReview).toBe(false);
  });
});
