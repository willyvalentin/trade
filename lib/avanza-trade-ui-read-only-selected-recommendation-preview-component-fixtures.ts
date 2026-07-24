import {
  avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtureId,
} from "./avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures";
import type {
  AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
  AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus,
} from "./avanza-trade-ui-read-only-selected-recommendation-preview-model";

export type AvanzaTradeUiReadOnlySelectedRecommendationPreviewRenderMode =
  | "hidden_or_disabled"
  | "passive_status"
  | "passive_preview_ready";

export type AvanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixture =
  {
    expectedRenderMode: AvanzaTradeUiReadOnlySelectedRecommendationPreviewRenderMode;
    expectedStatus: AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus;
    id: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtureId;
    label: string;
    modelResult: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel;
  };

function expectedRenderModeForStatus(
  status: AvanzaTradeUiReadOnlySelectedRecommendationPreviewStatus,
): AvanzaTradeUiReadOnlySelectedRecommendationPreviewRenderMode {
  if (status === "hidden" || status === "disabled") {
    return "hidden_or_disabled";
  }

  if (status === "read_only_preview_ready") {
    return "passive_preview_ready";
  }

  return "passive_status";
}

export const avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures: AvanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixture[] =
  avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures.map(
    (fixture) => ({
      expectedRenderMode: expectedRenderModeForStatus(
        fixture.modelResult.status,
      ),
      expectedStatus: fixture.expectedStatus,
      id: fixture.id,
      label: fixture.label,
      modelResult: fixture.modelResult,
    }),
  );
