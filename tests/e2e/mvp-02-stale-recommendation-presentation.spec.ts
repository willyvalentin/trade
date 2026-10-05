import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { buildSync } from "esbuild";

import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { buildRecommendationCardDisplayProps } from "@/components/recommendations/recommendation-card-display-mapper";
import { buildPlanRiskRewardDisplay, PLAN_RISK_REWARD_DISPLAY_NOTE } from "@/components/recommendations/recommendation-plan-risk-reward-display";

const plan = {
  direction: "Long", entryZone: "100 - 102", stopLoss: "98",
  target1: "108", target2: "111",
};

test("calculates target-specific long and short geometry at the worst entry", () => {
  expect(buildPlanRiskRewardDisplay(plan)).toEqual({
    target1: "≈1.50", target2: "≈2.25", basis: "Worst entry; before costs",
  });
  expect(buildPlanRiskRewardDisplay({ ...plan, direction: "Short", stopLoss: "104", target1: "94", target2: "91" })).toEqual({
    target1: "≈1.50", target2: "≈2.25", basis: "Worst entry; before costs",
  });
  expect(buildPlanRiskRewardDisplay({ ...plan, entryZone: "$100.00", target2: undefined }).target1).toBe("≈4.00");
  expect(buildPlanRiskRewardDisplay({ ...plan, entryZone: "$1,000.00 — $1,020.00", stopLoss: "$980.00", target1: "$1,080.00" }).target1).toBe("≈1.50");
});

test("fails closed for unknown, partial, ambiguous or invalid displayed geometry", () => {
  for (const change of [
    { direction: undefined }, { direction: "unknown" }, { entryZone: "Not set" },
    { entryZone: "102 - 100" }, { entryZone: "100 - 101 - 102" },
    { entryZone: "-100" }, { entryZone: "0" }, { entryZone: "Infinity" },
    { entryZone: "1e2" }, { entryZone: "100 USD" }, { entryZone: "100,00" },
    { entryZone: "100 - " }, { entryZone: "1".repeat(206) },
    { stopLoss: "100" }, { stopLoss: "103" }, { stopLoss: "NaN" },
  ]) {
    expect(buildPlanRiskRewardDisplay({ ...plan, ...change }), JSON.stringify(change)).toEqual({
      target1: "Not available", target2: "Not available", basis: "Not available",
    });
  }
  for (const target of ["", "Not set", "102", "98", "-108", "108oops", "Infinity"]) {
    expect(buildPlanRiskRewardDisplay({ ...plan, target1: target }).target1).toBe("Not available");
  }
  expect(buildPlanRiskRewardDisplay({ ...plan, direction: "Short", stopLoss: "101", target1: "94" }).target1).toBe("Not available");
});

// Render the actual React components rather than Playwright JSX descriptors.
const root = resolve(__dirname, "../..");
const compiled = buildSync({
  absWorkingDir: root, bundle: true, platform: "node", format: "cjs",
  packages: "external", jsx: "automatic", write: false,
  stdin: { resolveDir: root, loader: "tsx", contents: `
    import { renderToStaticMarkup } from 'react-dom/server';
    import { RecommendationCard } from './components/recommendations/RecommendationCard';
    import { RecommendationDetailsModal } from './components/recommendations/RecommendationDetailsModal';
    export function renderCard(metrics) {
      return renderToStaticMarkup(<RecommendationCard metrics={metrics}
        addTradeDisabled={true} addTradeLabel="Review only" confidenceLabel="Fixture"
        confidenceTone="low" discardDisabled={true} identity="Fixture"
        onAddTrade={()=>{}} onOpenDetails={()=>{}} onOpenDiscard={()=>{}} />);
    }
    export function renderDetails(recommendation) {
      return renderToStaticMarkup(<RecommendationDetailsModal recommendation={recommendation}
        addTradeGateMessage="Review only" calibrationGuardrails={null} confidenceBreakdownItems={[]}
        confidenceLabel="Fixture" confidenceTone="low" confirmation={{reasons:[],status:'unknown'}}
        decisionStack={null} freshness="expired" identity="Fixture" keyReasons={{positive:[],warnings:[]}}
        onClose={()=>{}} positionSizing={{maxLossAtStop:null,riskPerShare:null,suggestedPositionValue:null,suggestedShares:null}}
        preTradeRiskContext={null} sourceBadges="Synthetic fixture"
        timing={{expiryLabel:'Not available',expiryStatus:'unavailable',sourceLabel:'Not available',sourceTimestampLabel:'Not available',sourceTimestampStatus:'unavailable'}} tradeEligibility={null} />);
    }
  ` },
}).outputFiles[0].text;
const compiledModule = { exports: {} as {
  renderCard: (metrics: Array<{label:string;value:string}>) => string;
  renderDetails: (recommendation: Record<string, unknown>) => string;
} };
runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, require: createRequire(`${root}/package.json`) });

test("actual card and details HTML disclose both target ratios without mutating the plan", () => {
  const recommendation = { ...plan, riskReward: "2.25", companyName: "Fixture", confidenceReasoning: "",
    confidenceScore: null, createdAt: "", intradayIndicators: null, invalidation: "", reasonToAvoid: "",
    riskFlags: [], setupType: "UNKNOWN", thesis: "Synthetic fixture", ticker: "TEST" };
  const before = JSON.stringify(recommendation);
  const card = compiledModule.exports.renderCard([
    { label: "Target 1 R/R", value: buildPlanRiskRewardDisplay(recommendation).target1 },
  ]);
  expect(card).toContain("TARGET 1 R/R");
  expect(card).toContain("≈1.50");
  const details = compiledModule.exports.renderDetails(recommendation);
  expect(details).toContain("TARGET 1 R/R");
  expect(details).toContain("TARGET 2 R/R");
  expect(details).toContain("≈1.50");
  expect(details).toContain("≈2.25");
  expect(details).toContain(PLAN_RISK_REWARD_DISPLAY_NOTE);
  expect(details).not.toContain("REWARD : RISK");
  expect(JSON.stringify(recommendation)).toBe(before);
  expect(compiledModule.exports.renderDetails({ ...recommendation, direction: "unknown" })).not.toContain("≈2.25");
});

test("retained Oct 2 AAPL plan geometry explains first and second targets independently", () => {
  // Sanitized retained original plan values, not a fresh recommendation or
  // passing cohort. The original observation's publication-clock FAIL stands.
  const retained = { direction: "Long", entryZone: "329.64 - 336.3",
    stopLoss: "319.65", target1: "361.28", target2: "373.76", riskReward: "2.25" };
  const original = JSON.stringify(retained);
  expect(buildPlanRiskRewardDisplay(retained)).toEqual({
    target1: "≈1.50", target2: "≈2.25", basis: "Worst entry; before costs",
  });
  const alteredStoredMetadata = { ...retained, riskReward: "99" };
  expect(buildPlanRiskRewardDisplay(alteredStoredMetadata)).toEqual(buildPlanRiskRewardDisplay(retained));
  expect(JSON.stringify(retained)).toBe(original);
});

test("binds card R/R to the displayed first target instead of a stored second-target ratio", () => {
  const recommendation = {
    confidenceBreakdown: null,
    confidenceLabel: "GOOD SETUP",
    confidenceScore: 75,
    direction: "Long",
    entryZone: "100 - 102",
    riskReward: "2.25",
    stopLoss: "98",
    target1: "108",
    target2: "111",
    thesis: "Synthetic reproduction of the retained plan-display mismatch.",
  };
  const before = JSON.stringify(recommendation);
  const props = buildRecommendationCardDisplayProps({
    addTradeGate: { blocked: false, confirmation: { reasons: [], status: "confirmed" }, message: "" },
    decisionStack: null, freshness: "fresh", isDemoRecommendation: true,
    isSaving: false, isValidating: false, keyReasons: { positive: [], warnings: [] },
    recommendation,
  });
  expect(props.metrics).toContainEqual({ label: "Target 1 R/R", value: "≈1.50" });
  expect(props.metrics).toContainEqual({ label: "R/R basis", value: "Worst entry; before costs" });
  expect(props.metrics.some(({ label }) => label === "Reward : Risk")).toBe(false);
  expect(JSON.stringify(recommendation)).toBe(before);
  expect(props.addTradeLabel).toBe("Record Manual Trade");
  expect(props.addTradeDisabled).toBe(false);
});

function displayProps(
  freshness: "fresh" | "aging" | "stale" | "expired",
) {
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

  test("routes fresh and aging low-confidence setups through review before manual recording", () => {
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

    const agingProps = buildRecommendationCardDisplayProps({
      addTradeGate: {
        blocked: false,
        confirmation: { reasons: [], status: "confirmed" },
        message: "Current intraday confirmation is clean.",
      },
      decisionStack: null,
      freshness: "aging",
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
        thesis: "An aging setup that still needs independent review.",
      },
    });

    expect(agingProps.addTradeLabel).toBe("Review Low Confidence");
    expect(agingProps.addTradeDisabled).toBe(false);
    expect(agingProps.requiresConfidenceReview).toBe(true);
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
    expect(props.freshnessNotice).toBe("SETUP BLOCKED — REFRESH REQUIRED");
    expect(props.actionDescription).toBeNull();
    expect(props.requiresConfidenceReview).toBe(false);
  });
});
