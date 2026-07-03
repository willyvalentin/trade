import {
  avanzaHandoffPreviewSourceModes,
} from "@/lib/avanza-handoff-preview-source-mode";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "@/lib/avanza-read-only-readiness-fixtures";
import {
  buildAvanzaSelectedRecommendationPreviewState,
  type AvanzaSelectedRecommendationPreviewDisplayState,
  type AvanzaSelectedRecommendationPreviewState,
} from "@/lib/avanza-selected-recommendation-preview-state";
import type {
  TureRecommendationHandoffSource,
} from "@/lib/avanza-ture-recommendation-handoff-mapper";

export type AvanzaSelectedRecommendationPreviewStateScenarioId =
  | "no_selection"
  | "valid_buy"
  | "non_buy_sell"
  | "missing_ticker"
  | "missing_quantity"
  | "missing_price"
  | "missing_quantity_and_price";

export type AvanzaSelectedRecommendationPreviewStateScenario = {
  expectedDisplayState: AvanzaSelectedRecommendationPreviewDisplayState;
  id: AvanzaSelectedRecommendationPreviewStateScenarioId;
  label: string;
  previewState: AvanzaSelectedRecommendationPreviewState;
  selectedRecommendation: TureRecommendationHandoffSource | null;
};

const accountDisplayName = "Valentin Labs KF";
const orderMode = "Avancerad/Limit";
const sourceMode =
  avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only;

function buildPreviewState(
  selectedRecommendation: TureRecommendationHandoffSource | null,
) {
  return buildAvanzaSelectedRecommendationPreviewState({
    accountDisplayName,
    orderMode,
    readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
    selectedRecommendation,
    sourceMode,
  });
}

const baseGameStopRecommendation = {
  companyName: "GameStop",
  direction: "long",
  entryPriceValue: 21.98,
  id: "selected-preview-state-gme",
  positionSizeValue: 1,
  ticker: "GME",
} as const satisfies TureRecommendationHandoffSource;

function scenario(
  id: AvanzaSelectedRecommendationPreviewStateScenarioId,
  label: string,
  selectedRecommendation: TureRecommendationHandoffSource | null,
  expectedDisplayState: AvanzaSelectedRecommendationPreviewDisplayState,
): AvanzaSelectedRecommendationPreviewStateScenario {
  return {
    expectedDisplayState,
    id,
    label,
    previewState: buildPreviewState(selectedRecommendation),
    selectedRecommendation,
  };
}

export const avanzaSelectedRecommendationPreviewStateScenarios = [
  scenario(
    "no_selection",
    "No selected recommendation",
    null,
    "no_selection",
  ),
  scenario(
    "valid_buy",
    "Valid buy recommendation",
    baseGameStopRecommendation,
    "preview_ready_locked",
  ),
  scenario(
    "non_buy_sell",
    "Non-buy sell recommendation",
    {
      ...baseGameStopRecommendation,
      direction: "sell",
      id: "selected-preview-state-gme-sell",
    },
    "blocked",
  ),
  scenario(
    "missing_ticker",
    "Missing ticker",
    {
      ...baseGameStopRecommendation,
      id: "selected-preview-state-missing-ticker",
      ticker: "",
    },
    "blocked",
  ),
  scenario(
    "missing_quantity",
    "Missing quantity",
    {
      companyName: "GameStop",
      direction: "long",
      entryPriceValue: 21.98,
      id: "selected-preview-state-missing-quantity",
      ticker: "GME",
    },
    "advisory",
  ),
  scenario(
    "missing_price",
    "Missing price",
    {
      companyName: "GameStop",
      direction: "long",
      id: "selected-preview-state-missing-price",
      positionSizeValue: 1,
      ticker: "GME",
    },
    "advisory",
  ),
  scenario(
    "missing_quantity_and_price",
    "Missing quantity and price",
    {
      companyName: "GameStop",
      direction: "long",
      id: "selected-preview-state-missing-quantity-and-price",
      ticker: "GME",
    },
    "advisory",
  ),
] as const satisfies readonly AvanzaSelectedRecommendationPreviewStateScenario[];
