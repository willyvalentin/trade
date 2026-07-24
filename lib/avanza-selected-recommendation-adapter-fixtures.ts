import {
  avanzaHandoffPreviewSourceModes,
} from "@/lib/avanza-handoff-preview-source-mode";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "@/lib/avanza-read-only-readiness-fixtures";
import {
  adaptSelectedRecommendationToAvanzaHandoffSource,
  type AvanzaSelectedRecommendationAdapterInput,
  type AvanzaSelectedRecommendationAdapterOptions,
} from "@/lib/avanza-selected-recommendation-adapter";
import {
  buildAvanzaSelectedRecommendationPreviewState,
  type AvanzaSelectedRecommendationPreviewDisplayState,
  type AvanzaSelectedRecommendationPreviewState,
} from "@/lib/avanza-selected-recommendation-preview-state";
import type {
  TureRecommendationHandoffSource,
} from "@/lib/avanza-ture-recommendation-handoff-mapper";

export type AvanzaSelectedRecommendationAdapterScenarioId =
  | "valid_buy"
  | "missing_ticker"
  | "non_buy_sell"
  | "missing_price"
  | "missing_quantity"
  | "missing_price_and_quantity";

export type AvanzaSelectedRecommendationAdapterScenario = {
  adaptedPreviewInput: TureRecommendationHandoffSource;
  adapterOptions?: AvanzaSelectedRecommendationAdapterOptions;
  expectedDisplayState: AvanzaSelectedRecommendationPreviewDisplayState;
  id: AvanzaSelectedRecommendationAdapterScenarioId;
  label: string;
  previewState: AvanzaSelectedRecommendationPreviewState;
  rawSelectedRecommendation: AvanzaSelectedRecommendationAdapterInput;
};

const accountDisplayName = "Valentin Labs KF";
const orderMode = "Avancerad/Limit";
const sourceMode =
  avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only;

const validSelectedRecommendation = {
  companyName: "GameStop",
  confidenceLabel: "High",
  confidenceScore: 82,
  direction: "Long",
  entryHighValue: 22.46,
  entryLowValue: 21.5,
  id: "adapter-selected-gme-valid-buy",
  setupType: "Breakout",
  ticker: "GME",
} as const satisfies AvanzaSelectedRecommendationAdapterInput;

function buildScenario({
  adapterOptions,
  expectedDisplayState,
  id,
  label,
  rawSelectedRecommendation,
}: {
  adapterOptions?: AvanzaSelectedRecommendationAdapterOptions;
  expectedDisplayState: AvanzaSelectedRecommendationPreviewDisplayState;
  id: AvanzaSelectedRecommendationAdapterScenarioId;
  label: string;
  rawSelectedRecommendation: AvanzaSelectedRecommendationAdapterInput;
}): AvanzaSelectedRecommendationAdapterScenario {
  const adaptedPreviewInput = adaptSelectedRecommendationToAvanzaHandoffSource(
    rawSelectedRecommendation,
    adapterOptions,
  );
  const previewState = buildAvanzaSelectedRecommendationPreviewState({
    accountDisplayName,
    orderMode,
    readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
    selectedRecommendation: adaptedPreviewInput,
    sourceMode,
  });

  return {
    adaptedPreviewInput,
    adapterOptions,
    expectedDisplayState,
    id,
    label,
    previewState,
    rawSelectedRecommendation,
  };
}

export const avanzaSelectedRecommendationAdapterScenarios = [
  buildScenario({
    adapterOptions: {
      positionSizing: {
        suggestedShares: 1,
      },
    },
    expectedDisplayState: "preview_ready_locked",
    id: "valid_buy",
    label: "Valid buy selectedRecommendation",
    rawSelectedRecommendation: validSelectedRecommendation,
  }),
  buildScenario({
    adapterOptions: {
      positionSizing: {
        suggestedShares: 1,
      },
    },
    expectedDisplayState: "blocked",
    id: "missing_ticker",
    label: "Missing ticker and symbol",
    rawSelectedRecommendation: {
      ...validSelectedRecommendation,
      id: "adapter-selected-missing-ticker",
      symbol: "",
      ticker: "",
    },
  }),
  buildScenario({
    adapterOptions: {
      positionSizing: {
        suggestedShares: 1,
      },
    },
    expectedDisplayState: "blocked",
    id: "non_buy_sell",
    label: "Non-buy selectedRecommendation",
    rawSelectedRecommendation: {
      ...validSelectedRecommendation,
      direction: "Short",
      id: "adapter-selected-short",
    },
  }),
  buildScenario({
    adapterOptions: {
      positionSizing: {
        suggestedShares: 1,
      },
    },
    expectedDisplayState: "advisory",
    id: "missing_price",
    label: "Missing entry or limit price",
    rawSelectedRecommendation: {
      ...validSelectedRecommendation,
      entryHighValue: null,
      entryLowValue: null,
      entryPriceValue: null,
      id: "adapter-selected-missing-price",
      limitPrice: null,
    },
  }),
  buildScenario({
    expectedDisplayState: "advisory",
    id: "missing_quantity",
    label: "Missing suggested shares or quantity",
    rawSelectedRecommendation: {
      ...validSelectedRecommendation,
      id: "adapter-selected-missing-quantity",
    },
  }),
  buildScenario({
    expectedDisplayState: "advisory",
    id: "missing_price_and_quantity",
    label: "Missing price and quantity",
    rawSelectedRecommendation: {
      ...validSelectedRecommendation,
      entryHighValue: null,
      entryLowValue: null,
      entryPriceValue: null,
      id: "adapter-selected-missing-price-and-quantity",
      limitPrice: null,
    },
  }),
] as const satisfies readonly AvanzaSelectedRecommendationAdapterScenario[];
