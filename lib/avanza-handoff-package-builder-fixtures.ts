import {
  buildAvanzaHandoffPackage,
  type AvanzaHandoffPackageBuilderResult,
  type AvanzaHandoffPackageStatus,
  type BuildAvanzaHandoffPackageInput,
} from "./avanza-handoff-package-builder";

export type AvanzaHandoffPackageBuilderFixtureId =
  | "handoff_disabled"
  | "source_unavailable"
  | "source_invalid"
  | "risk_blocked_missing_ticker"
  | "risk_blocked_invalid_quantity"
  | "risk_blocked_missing_price"
  | "risk_blocked_expired"
  | "handoff_ready_read_only_buy"
  | "handoff_ready_read_only_sell"
  | "handoff_ready_read_only_missing_target_warning"
  | "handoff_ready_fill_only";

export type AvanzaHandoffPackageBuilderFixture = {
  builderInput: BuildAvanzaHandoffPackageInput;
  expectedStatus: AvanzaHandoffPackageStatus;
  id: AvanzaHandoffPackageBuilderFixtureId;
  label: string;
  result: AvanzaHandoffPackageBuilderResult;
};

const fixtureNow = "2026-07-04T12:00:00.000Z";

function buildFixture(
  id: AvanzaHandoffPackageBuilderFixtureId,
  label: string,
  expectedStatus: AvanzaHandoffPackageStatus,
  builderInput: BuildAvanzaHandoffPackageInput,
): AvanzaHandoffPackageBuilderFixture {
  return {
    builderInput,
    expectedStatus,
    id,
    label,
    result: buildAvanzaHandoffPackage(builderInput),
  };
}

export const avanzaHandoffPackageBuilderFixtures: AvanzaHandoffPackageBuilderFixture[] =
  [
    buildFixture(
      "handoff_disabled",
      "Handoff disabled",
      "handoff_disabled",
      {
        handoffEnabled: false,
      },
    ),
    buildFixture(
      "source_unavailable",
      "Source unavailable",
      "source_unavailable",
      {
        handoffEnabled: true,
        now: fixtureNow,
      },
    ),
    buildFixture(
      "source_invalid",
      "Source invalid",
      "source_invalid",
      {
        handoffEnabled: true,
        now: fixtureNow,
        recommendationCandidate: "invalid fixture source",
      },
    ),
    buildFixture(
      "risk_blocked_missing_ticker",
      "Risk blocked: missing ticker",
      "risk_blocked",
      {
        handoffEnabled: true,
        now: fixtureNow,
        recommendationCandidate: {
          limitPrice: 240.5,
          quantity: 12,
          side: "BUY",
          stopLoss: 230,
          target: 260,
        },
      },
    ),
    buildFixture(
      "risk_blocked_invalid_quantity",
      "Risk blocked: invalid quantity",
      "risk_blocked",
      {
        handoffEnabled: true,
        now: fixtureNow,
        recommendationCandidate: {
          limitPrice: 240.5,
          quantity: 0,
          side: "BUY",
          stopLoss: 230,
          target: 260,
          ticker: "GME",
        },
      },
    ),
    buildFixture(
      "risk_blocked_missing_price",
      "Risk blocked: missing price",
      "risk_blocked",
      {
        handoffEnabled: true,
        now: fixtureNow,
        recommendationCandidate: {
          orderType: "LIMIT",
          quantity: 12,
          side: "BUY",
          stopLoss: 230,
          target: 260,
          ticker: "GME",
        },
      },
    ),
    buildFixture(
      "risk_blocked_expired",
      "Risk blocked: expired recommendation",
      "risk_blocked",
      {
        handoffEnabled: true,
        now: fixtureNow,
        recommendationCandidate: {
          expiresAt: "2026-07-03T12:00:00.000Z",
          limitPrice: 240.5,
          quantity: 12,
          side: "BUY",
          stopLoss: 230,
          target: 260,
          ticker: "GME",
        },
      },
    ),
    buildFixture(
      "handoff_ready_read_only_buy",
      "Ready read-only BUY package",
      "handoff_ready_read_only",
      {
        accountLabel: "ISK fixture",
        handoffEnabled: true,
        now: fixtureNow,
        recommendationCandidate: {
          confidence: 0.72,
          limitPrice: 240.5,
          quantity: 12,
          side: "BUY",
          sourceRecommendationId: "fixture-buy-1",
          stopLoss: 230,
          target: 260,
          ticker: "GME",
          timeInForce: "DAY",
        },
      },
    ),
    buildFixture(
      "handoff_ready_read_only_sell",
      "Ready read-only SELL package",
      "handoff_ready_read_only",
      {
        handoffEnabled: true,
        now: fixtureNow,
        recommendationCandidate: {
          confidence: 0.66,
          limitPrice: 155.25,
          quantity: 5,
          side: "SELL",
          sourceRecommendationId: "fixture-sell-1",
          stopLoss: 170,
          target: 145,
          ticker: "TSLA",
        },
      },
    ),
    buildFixture(
      "handoff_ready_read_only_missing_target_warning",
      "Ready read-only package with missing target warning",
      "handoff_ready_read_only",
      {
        handoffEnabled: true,
        now: fixtureNow,
        recommendationCandidate: {
          generatedAt: "2026-07-02T12:00:00.000Z",
          limitPrice: 125,
          quantity: 3,
          side: "BUY",
          sourceRecommendationId: "fixture-warning-1",
          stopLoss: 118,
          ticker: "MSFT",
        },
      },
    ),
    buildFixture(
      "handoff_ready_fill_only",
      "Ready fill-only package",
      "handoff_ready_fill_only",
      {
        accountLabel: "Test account label",
        handoffEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
        recommendationCandidate: {
          confidence: 0.8,
          limitPrice: 240.5,
          quantity: 12,
          side: "BUY",
          sourceRecommendationId: "fixture-fill-only-1",
          stopLoss: 230,
          target: 260,
          ticker: "GME",
        },
      },
    ),
  ];
